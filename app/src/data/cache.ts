import type { FuelRecord } from '../types/fuel'

const DB_NAME = 'fuelinfo-cache'
const DB_VERSION = 1
const STORE_NAME = 'data-files'

interface CacheEntry {
  name: string
  hash: string
  records: FuelRecord[]
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'name' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getCached(name: string, hash: string): Promise<FuelRecord[] | null> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(name)

      req.onsuccess = () => {
        const entry = req.result as CacheEntry | undefined
        if (entry && entry.hash === hash) {
          resolve(entry.records)
        } else {
          resolve(null)
        }
      }
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

export async function putCached(name: string, hash: string, records: FuelRecord[]): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.put({ name, hash, records } satisfies CacheEntry)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    })
  } catch {
    // Cache failures are non-fatal
  }
}

/**
 * Remove cached entries whose names are not in the current manifest,
 * preventing stale data from accumulating past the retention window.
 */
export async function pruneCache(currentNames: Set<string>): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAllKeys()

    req.onsuccess = () => {
      for (const key of req.result) {
        if (!currentNames.has(key as string)) {
          store.delete(key)
        }
      }
    }
  } catch {
    // Prune failures are non-fatal
  }
}
