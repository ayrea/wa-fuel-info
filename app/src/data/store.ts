import { create } from 'zustand'
import type { FuelRecord, FuelType } from '../types/fuel'
import { FUEL_TYPES } from '../types/fuel'
import { loadAllData } from './loader'

interface FuelStore {
  records: FuelRecord[]
  loading: boolean
  error: string | null

  selectedFuelTypes: FuelType[]
  searchQuery: string

  toggleFuelType: (ft: FuelType) => void
  setSelectedFuelTypes: (fts: FuelType[]) => void
  setSearchQuery: (q: string) => void
  loadData: () => Promise<void>
}

export const useFuelStore = create<FuelStore>((set, get) => ({
  records: [],
  loading: false,
  error: null,

  selectedFuelTypes: [...FUEL_TYPES],
  searchQuery: '',

  toggleFuelType: (ft) => {
    const current = get().selectedFuelTypes
    if (current.includes(ft)) {
      if (current.length > 1) {
        set({ selectedFuelTypes: current.filter((f) => f !== ft) })
      }
    } else {
      set({ selectedFuelTypes: [...current, ft] })
    }
  },

  setSelectedFuelTypes: (fts) => set({ selectedFuelTypes: fts }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  loadData: async () => {
    set({ loading: true, error: null })
    try {
      const records = await loadAllData()
      set({ records, loading: false })
    } catch {
      set({ error: 'Failed to load fuel data', loading: false })
    }
  },
}))
