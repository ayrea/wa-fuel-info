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

import { writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import {
  DATA_FILE_PATTERN,
  sha256Short,
  normalizeStation,
  generateManifest,
  type RawStation,
} from './shared'

const FUEL_TYPES = ['ULP', 'PUP', '98R', 'DSL', 'BDL', 'E85', 'LPG']

const BASE_URL = 'https://www.fuelwatch.wa.gov.au'
const RETENTION_DAYS = 30

function getDateString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function fetchFuelData(fuelCode: string): Promise<RawStation[]> {
  const url = `${BASE_URL}/api/sites?fuelType=${fuelCode}`
  const resp = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'FuelWatch-Analyzer/1.0',
    },
  })

  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} for ${fuelCode}`)
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

async function main(): Promise<void> {
  const date = getDateString()
  const outputDir = join(import.meta.dirname ?? '.', '..', 'public', 'data')

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  console.log(`Fetching FuelWatch data for ${date}...`)

  const seenHashes = new Map<string, string>()

  for (const fuel of FUEL_TYPES) {
    const filename = `${date}_${fuel}.json`
    const filepath = join(outputDir, filename)

    try {
      console.log(`  Fetching ${fuel}...`)
      const rawData = await fetchFuelData(fuel)

      const rawHash = sha256Short(JSON.stringify(rawData))
      if (seenHashes.has(rawHash)) {
        console.warn(
          `  SKIP ${fuel}: identical response to ${seenHashes.get(rawHash)}, API may be returning stale data`
        )
        continue
      }
      seenHashes.set(rawHash, fuel)

      const normalized = rawData.map((s) => normalizeStation(s, date, fuel))
      writeFileSync(filepath, JSON.stringify(normalized, null, 0))
      console.log(`  Saved ${filename} (${normalized.length} stations, normalized)`)
    } catch (err) {
      console.error(`  Failed to fetch ${fuel}: ${err}`)
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
