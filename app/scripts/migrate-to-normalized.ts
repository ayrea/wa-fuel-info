/**
 * One-time migration: converts existing RawStation[] data files
 * to normalized FuelRecord[] format and generates manifest.json.
 *
 * Usage: npx tsx scripts/migrate-to-normalized.ts
 * Safe to delete after migration is complete.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

const DATA_FILE_PATTERN = /^(\d{4}-\d{2}-\d{2})_(\w+)\.json$/

interface RawStation {
  id: number
  siteName: string
  address: {
    line1: string
    location: string
    postCode: number
    state: string
    latitude: number
    longitude: number
  }
  product: {
    isTruckStop: boolean
    priceToday?: number
    priceTomorrow?: number
    tempUnavailableFrom?: string
    tempUnavailableTo?: string
  }
  brandName: string
  isClosedNow: boolean
  isClosedAllDayTomorrow: boolean
  operates247: boolean
}

function normalize(raw: RawStation, date: string, fuelType: string) {
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
    tempUnavailable: !!(raw.product.tempUnavailableFrom || raw.product.tempUnavailableTo),
  }
}

function sha256Short(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 12)
}

const dataDir = join(import.meta.dirname ?? '.', '..', 'public', 'data')
const files = readdirSync(dataDir).filter((f) => DATA_FILE_PATTERN.test(f)).sort()

let converted = 0
for (const file of files) {
  const match = file.match(DATA_FILE_PATTERN)!
  const [, date, fuel] = match
  const filepath = join(dataDir, file)
  const raw = JSON.parse(readFileSync(filepath, 'utf-8'))

  if (!Array.isArray(raw) || raw.length === 0) continue

  // Detect if already normalized (no nested address object)
  if (typeof raw[0].address === 'string') {
    console.log(`  ${file} - already normalized, skipping`)
    continue
  }

  const normalized = raw.map((s: RawStation) => normalize(s, date, fuel))
  writeFileSync(filepath, JSON.stringify(normalized, null, 0))
  converted++
  console.log(`  ${file} - converted (${normalized.length} records)`)
}

console.log(`\nConverted ${converted} files`)

// Generate manifest
const manifestEntries = files.map((name) => {
  const match = name.match(DATA_FILE_PATTERN)!
  const content = readFileSync(join(dataDir, name), 'utf-8')
  return {
    name,
    date: match[1],
    fuel: match[2],
    hash: sha256Short(content),
    size: content.length,
  }
})

writeFileSync(join(dataDir, 'manifest.json'), JSON.stringify({ files: manifestEntries }, null, 2))
console.log(`Generated manifest.json (${manifestEntries.length} files)`)
