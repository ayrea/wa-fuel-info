/**
 * FuelWatch Data Fetcher
 *
 * Fetches current fuel price data from the FuelWatch WA website API
 * and saves it as JSON files matching the existing naming convention.
 *
 * Usage:
 *   npx tsx scripts/fetch-fuelwatch.ts
 *
 * Schedule via Windows Task Scheduler to run daily for historical data collection.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

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

function getDateString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function fetchFuelData(productId: string): Promise<unknown[]> {
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

  return resp.json()
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
      const data = await fetchFuelData(fuel.id)
      writeFileSync(filepath, JSON.stringify(data, null, 0))
      console.log(`  Saved ${filepath} (${Array.isArray(data) ? data.length : '?'} stations)`)
    } catch (err) {
      console.error(`  Failed to fetch ${fuel.code}: ${err}`)
    }

    // Small delay between requests
    await new Promise((r) => setTimeout(r, 1000))
  }

  console.log('Done!')
  console.log(`\nNote: After fetching new data, update the file list in src/data/loader.ts`)
  console.log('to include the new date, or modify the loader to auto-discover files.')
}

main().catch(console.error)
