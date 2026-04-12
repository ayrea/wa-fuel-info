import type { FuelRecord, DataManifest, ManifestEntry } from '../types/fuel'
import { getCached, putCached, pruneCache } from './cache'

async function fetchManifest(): Promise<DataManifest> {
  const resp = await fetch(`${import.meta.env.BASE_URL}data/manifest.json`)
  if (!resp.ok) throw new Error(`Failed to fetch manifest: ${resp.status}`)
  return resp.json()
}

async function loadFile(entry: ManifestEntry): Promise<FuelRecord[]> {
  const cached = await getCached(entry.name, entry.hash)
  if (cached) return cached

  const resp = await fetch(`${import.meta.env.BASE_URL}data/${entry.name}`)
  if (!resp.ok) return []

  const records: FuelRecord[] = await resp.json()
  await putCached(entry.name, entry.hash, records)
  return records
}

export async function loadAllData(): Promise<FuelRecord[]> {
  const manifest = await fetchManifest()
  const results: FuelRecord[] = []

  const allResults = await Promise.all(manifest.files.map(loadFile))
  for (const batch of allResults) {
    results.push(...batch)
  }

  const currentNames = new Set(manifest.files.map((f) => f.name))
  pruneCache(currentNames)

  return results
}
