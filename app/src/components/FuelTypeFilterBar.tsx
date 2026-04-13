import { useFuelStore } from '../data/store'
import { FUEL_TYPES, FUEL_LABELS, FUEL_COLORS } from '../types/fuel'
export function FuelTypeFilterBar() {
  const selectedFuelTypes = useFuelStore((s) => s.selectedFuelTypes)
  const toggleFuelType = useFuelStore((s) => s.toggleFuelType)
  const setSelectedFuelTypes = useFuelStore((s) => s.setSelectedFuelTypes)

  const allSelected = selectedFuelTypes.length === FUEL_TYPES.length

  return (
    <div className="flex flex-wrap items-center gap-4">
      <label className="text-sm font-medium text-gray-700">Fuel Type:</label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedFuelTypes([...FUEL_TYPES])}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            allSelected
              ? 'text-white border-transparent bg-orange-500'
              : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
          }`}
        >
          All Fuels
        </button>
        {FUEL_TYPES.map((ft) => {
          const active = selectedFuelTypes.includes(ft)
          return (
            <button
              type="button"
              key={ft}
              onClick={() => toggleFuelType(ft)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
              }`}
              style={active ? { backgroundColor: FUEL_COLORS[ft] } : undefined}
            >
              {FUEL_LABELS[ft]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
