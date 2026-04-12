/**
 * FuelWatch Data Fetcher
 *
 * Fetches current fuel price data from the FuelWatch WA website API,
 * normalizes it to FuelRecord format, and saves as JSON files.
 * Also generates a manifest.json for smart client-side loading
 * and cleans up data older than 30 days.
 *
 * Usage:
 *   npx tsx scripts/fetch-fuelwatch.ts
 */

import { writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync, readFileSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

interface RawAddress {
  id: number
  line1: string
  location: string
  postCode: number
  state: string
  latitude: number
  longitude: number
}

interface RawProduct {
  shortName: string
  isTruckStop: boolean
  priceToday?: number
  priceTomorrow?: number
  isTwoPrice: boolean
  tempUnavailableFrom?: string
  tempUnavailableTo?: string
}

interface RawStation {
  id: number
  siteName: string
  address: RawAddress
  product: RawProduct
  productFuelType: string
  brandName: string
  isClosedNow: boolean
  isClosedAllDayTomorrow: boolean
  drivewayService: string
  manned: boolean
  operates247: boolean
  membershipRequired: boolean
  currentPricingOrder: number
  nextPricingOrder: number
}

interface FuelRecord {
  date: string
  fuelType: string
  stationId: number
  siteName: string
  brandName: string
  address: string
  suburb: string
  postCode: number
  state: string
  latitude: number
  longitude: number
  priceToday: number | null
  priceTomorrow: number | null
  isTruckStop: boolean
  isClosedNow: boolean
  isClosedAllDayTomorrow: boolean
  operates247: boolean
  tempUnavailable: boolean
}

interface ManifestEntry {
  name: string
  date: string
  fuel: string
  hash: string
  size: number
}

const FUEL_TYPES = [
  { code: 'ULP', id: '1' },
  { code: 'PUP', id: '2' },
  { code: '98R', id: '4' },
  { code: 'DSL', id: '5' },
  { code: 'BDL', id: '11' },
  { code: 'E85', id: '10' },
  { code: 'LPG', id: '6' },
]

const BASE_URL = 'https://www.fuelwatch.wa.gov.au'
const RETENTION_DAYS = 30
const DATA_FILE_PATTERN = /^(\d{4}-\d{2}-\d{2})_(\w+)\.json$/

function getDateString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function normalizeStation(raw: RawStation, date: string, fuelType: string): FuelRecord {
  const hasTemp = !!(raw.product.tempUnavailableFrom || raw.product.tempUnavailableTo)
  return {
    date,
    fuelType,
    stationId: raw.id,
    siteName: raw.siteName,
    brandName: raw.brandName,
    address: raw.address.line1,
    suburb: raw.address.location,
    postCode: raw.address.postCode,
    state: raw.address.state,
    latitude: raw.address.latitude,
    longitude: raw.address.longitude,
    priceToday: raw.product.priceToday ?? null,
    priceTomorrow: raw.product.priceTomorrow ?? null,
    isTruckStop: raw.product.isTruckStop,
    isClosedNow: raw.isClosedNow,
    isClosedAllDayTomorrow: raw.isClosedAllDayTomorrow,
    operates247: raw.operates247,
    tempUnavailable: hasTemp,
  }
}

function sha256Short(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 12)
}

async function fetchFuelData(productId: string): Promise<RawStation[]> {
  const url = `${BASE_URL}/api/sites?productId=${productId}`
  const resp = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'FuelWatch-Analyzer/1.0',
    },
  })

  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} for product ${productId}`)
  }

  return resp.json() as Promise<RawStation[]>
}

function cleanOldData(outputDir: string): void {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const files = readdirSync(outputDir).filter((f) => DATA_FILE_PATTERN.test(f))
  let removed = 0

  for (const file of files) {
    const match = file.match(DATA_FILE_PATTERN)
    if (match && match[1] < cutoffStr) {
      unlinkSync(join(outputDir, file))
      removed++
    }
  }

  if (removed > 0) {
    console.log(`  Cleaned up ${removed} files older than ${cutoffStr}`)
  }
}

function generateManifest(outputDir: string): void {
  const files = readdirSync(outputDir)
    .filter((f) => DATA_FILE_PATTERN.test(f))
    .sort()

  const entries: ManifestEntry[] = files.map((name) => {
    const match = name.match(DATA_FILE_PATTERN)!
    const content = readFileSync(join(outputDir, name), 'utf-8')
    return {
      name,
      date: match[1],
      fuel: match[2],
      hash: sha256Short(content),
      size: content.length,
    }
  })

  const manifestPath = join(outputDir, 'manifest.json')
  writeFileSync(manifestPath, JSON.stringify({ files: entries }, null, 2))
  console.log(`  Generated manifest.json (${entries.length} files indexed)`)
}

async function main() {
  const date = getDateString()
  const outputDir = join(import.meta.dirname ?? '.', '..', 'public', 'data')

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  console.log(`Fetching FuelWatch data for ${date}...`)

  for (const fuel of FUEL_TYPES) {
    const filename = `${date}_${fuel.code}.json`
    const filepath = join(outputDir, filename)

    try {
      console.log(`  Fetching ${fuel.code} (product ${fuel.id})...`)
      const rawData = await fetchFuelData(fuel.id)
      const normalized = rawData.map((s) => normalizeStation(s, date, fuel.code))
      writeFileSync(filepath, JSON.stringify(normalized, null, 0))
      console.log(`  Saved ${filename} (${normalized.length} stations, normalized)`)
    } catch (err) {
      console.error(`  Failed to fetch ${fuel.code}: ${err}`)
    }

    await new Promise((r) => setTimeout(r, 1000))
  }

  console.log('\nCleaning up old data...')
  cleanOldData(outputDir)

  console.log('\nGenerating manifest...')
  generateManifest(outputDir)

  console.log('\nDone!')
}

main().catch(console.error)
