import type { RawStation, FuelRecord, FuelType } from '../types/fuel'
// @ts-ignore - virtual module provided by vite plugin
import { dataFiles } from 'virtual:data-manifest'

function parseFilename(filename: string): { date: string; fuelType: FuelType } {
  const base = filename.replace('.json', '')
  const underscoreIdx = base.indexOf('_')
  return {
    date: base.slice(0, underscoreIdx),
    fuelType: base.slice(underscoreIdx + 1) as FuelType,
  }
}

function normalizeStation(raw: RawStation, date: string, fuelType: FuelType): FuelRecord {
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

export async function loadAllData(): Promise<FuelRecord[]> {
  const files: string[] = dataFiles
  const results: FuelRecord[] = []

  const fetches = files.map(async (filename: string) => {
    const { date, fuelType } = parseFilename(filename)
    try {
      const resp = await fetch(`/data/${filename}`)
      if (!resp.ok) return []
      const rawStations: RawStation[] = await resp.json()
      return rawStations.map((s) => normalizeStation(s, date, fuelType))
    } catch {
      console.warn(`Failed to load ${filename}`)
      return []
    }
  })

  const allResults = await Promise.all(fetches)
  for (const batch of allResults) {
    results.push(...batch)
  }

  return results
}
