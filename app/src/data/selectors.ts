import type { FuelRecord, FuelType } from '../types/fuel'
import { FUEL_TYPES } from '../types/fuel'

export interface PriceSummary {
  fuelType: FuelType
  avg: number
  min: number
  max: number
  count: number
}

export interface TrendPoint {
  date: string
  avg: number
  min: number
  max: number
}

export function getDates(records: FuelRecord[]): string[] {
  return [...new Set(records.map((r) => r.date))].sort()
}

export function getBrands(records: FuelRecord[]): string[] {
  return [...new Set(records.map((r) => r.brandName))].sort()
}

export function getSuburbs(records: FuelRecord[]): string[] {
  return [...new Set(records.map((r) => r.suburb))].sort()
}

export function getLatestDate(records: FuelRecord[]): string {
  const dates = getDates(records)
  return dates[dates.length - 1] ?? ''
}

export function getLatestRecords(records: FuelRecord[], fuelType?: FuelType): FuelRecord[] {
  const latest = getLatestDate(records)
  return records.filter(
    (r) => r.date === latest && (fuelType ? r.fuelType === fuelType : true)
  )
}

export function getPriceSummaries(records: FuelRecord[], date?: string): PriceSummary[] {
  const targetDate = date ?? getLatestDate(records)
  return FUEL_TYPES.map((ft) => {
    const prices = records
      .filter((r) => r.date === targetDate && r.fuelType === ft && r.priceToday !== null)
      .map((r) => r.priceToday!)

    if (prices.length === 0) {
      return { fuelType: ft, avg: 0, min: 0, max: 0, count: 0 }
    }

    return {
      fuelType: ft,
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      min: Math.min(...prices),
      max: Math.max(...prices),
      count: prices.length,
    }
  }).filter((s) => s.count > 0)
}

export function getTrends(
  records: FuelRecord[],
  fuelTypes: FuelType[],
  suburb?: string
): Record<string, TrendPoint[]> {
  const dates = getDates(records)
  const result: Record<string, TrendPoint[]> = {}

  for (const ft of fuelTypes) {
    result[ft] = dates
      .map((date) => {
        const prices = records
          .filter(
            (r) =>
              r.date === date &&
              r.fuelType === ft &&
              r.priceToday !== null &&
              (suburb ? r.suburb === suburb : true)
          )
          .map((r) => r.priceToday!)

        if (prices.length === 0) return { date, avg: 0, min: 0, max: 0 }

        return {
          date,
          avg: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
          min: Math.min(...prices),
          max: Math.max(...prices),
        }
      })
      .filter((p) => p.avg > 0)
  }

  return result
}

export function getTotalStations(records: FuelRecord[]): number {
  const latest = getLatestDate(records)
  const ids = new Set(
    records.filter((r) => r.date === latest).map((r) => r.stationId)
  )
  return ids.size
}

export function getCheapest(
  records: FuelRecord[],
  fuelType: FuelType,
  date?: string
): FuelRecord | null {
  const targetDate = date ?? getLatestDate(records)
  const priced = records.filter(
    (r) => r.date === targetDate && r.fuelType === fuelType && r.priceToday !== null
  )
  if (priced.length === 0) return null
  return priced.reduce((best, r) => (r.priceToday! < best.priceToday! ? r : best))
}

export function getMostExpensive(
  records: FuelRecord[],
  fuelType: FuelType,
  date?: string
): FuelRecord | null {
  const targetDate = date ?? getLatestDate(records)
  const priced = records.filter(
    (r) => r.date === targetDate && r.fuelType === fuelType && r.priceToday !== null
  )
  if (priced.length === 0) return null
  return priced.reduce((best, r) => (r.priceToday! > best.priceToday! ? r : best))
}

export function getOutages(records: FuelRecord[]): FuelRecord[] {
  const latest = getLatestDate(records)
  return records.filter((r) => r.date === latest && r.tempUnavailable)
}

export function getOutagesForDate(records: FuelRecord[], date: string): FuelRecord[] {
  return records.filter((r) => r.date === date && r.tempUnavailable)
}

export interface OutageSummary {
  stationCount: number
  recordCount: number
}

export function getOutageSummary(records: FuelRecord[]): OutageSummary {
  const outages = getOutages(records)
  const uniqueStations = new Set(outages.map((r) => r.stationId))
  return {
    stationCount: uniqueStations.size,
    recordCount: outages.length,
  }
}

export interface OutageTrendPoint {
  date: string
  count: number
}

export function getOutageTrends(
  records: FuelRecord[],
  fuelTypes: FuelType[]
): Record<string, OutageTrendPoint[]> {
  const dates = getDates(records)
  const result: Record<string, OutageTrendPoint[]> = {}

  for (const ft of fuelTypes) {
    result[ft] = dates.map((date) => {
      const stationIds = new Set(
        records
          .filter((r) => r.date === date && r.fuelType === ft && r.tempUnavailable)
          .map((r) => r.stationId)
      )
      return { date, count: stationIds.size }
    })
  }

  return result
}

export interface StationOutage {
  stationId: number
  siteName: string
  brandName: string
  address: string
  suburb: string
  latitude: number
  longitude: number
  fuelTypes: FuelType[]
}

export function groupOutagesByStation(records: FuelRecord[]): StationOutage[] {
  const map = new Map<number, StationOutage>()
  for (const r of records) {
    const existing = map.get(r.stationId)
    if (existing) {
      if (!existing.fuelTypes.includes(r.fuelType)) {
        existing.fuelTypes.push(r.fuelType)
      }
    } else {
      map.set(r.stationId, {
        stationId: r.stationId,
        siteName: r.siteName,
        brandName: r.brandName,
        address: r.address,
        suburb: r.suburb,
        latitude: r.latitude,
        longitude: r.longitude,
        fuelTypes: [r.fuelType],
      })
    }
  }
  return [...map.values()].sort((a, b) => a.siteName.localeCompare(b.siteName))
}
