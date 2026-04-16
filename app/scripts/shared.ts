import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

export const DATA_FILE_PATTERN = /^(\d{4}-\d{2}-\d{2})_(\w+)\.json$/

export interface RawAddress {
  id: number
  line1: string
  location: string
  postCode: number
  state: string
  latitude: number
  longitude: number
}

export interface RawProduct {
  shortName: string
  isTruckStop: boolean
  priceToday?: number
  priceTomorrow?: number
  isTwoPrice: boolean
  tempUnavailableFrom?: string
  tempUnavailableTo?: string
}

export interface RawStation {
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

export interface FuelRecord {
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

export interface ManifestEntry {
  name: string
  date: string
  fuel: string
  hash: string
  size: number
}

export function sha256Short(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 12)
}

export function normalizeStation(raw: RawStation, date: string, fuelType: string): FuelRecord {
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

export function generateManifest(outputDir: string, updatedAt?: string): void {
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
  writeFileSync(
    manifestPath,
    JSON.stringify({ updatedAt: updatedAt ?? new Date().toISOString(), files: entries }, null, 2)
  )
  console.log(`  Generated manifest.json (${entries.length} files indexed)`)
}
