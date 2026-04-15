/**
 * One-time migration: converts existing RawStation[] data files
 * to normalized FuelRecord[] format and generates manifest.json.
 *
 * Usage: npx tsx scripts/migrate-to-normalized.ts
 * Safe to delete after migration is complete.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'
import {
  DATA_FILE_PATTERN,
  normalizeStation,
  generateManifest,
  type RawStation,
} from './shared'

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

  const normalized = raw.map((s: RawStation) => normalizeStation(s, date, fuel))
  writeFileSync(filepath, JSON.stringify(normalized, null, 0))
  converted++
  console.log(`  ${file} - converted (${normalized.length} records)`)
}

console.log(`\nConverted ${converted} files`)

console.log('\nGenerating manifest...')
generateManifest(dataDir)
