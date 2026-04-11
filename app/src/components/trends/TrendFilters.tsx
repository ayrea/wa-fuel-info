import { useFuelStore } from '../../data/store'
import { FUEL_TYPES, FUEL_LABELS, FUEL_COLORS } from '../../types/fuel'

export function TrendFilters() {
  const selectedFuelTypes = useFuelStore((s) => s.selectedFuelTypes)
  const toggleFuelType = useFuelStore((s) => s.toggleFuelType)

  return (
    <div className="flex flex-wrap gap-2">
      {FUEL_TYPES.map((ft) => {
        const active = selectedFuelTypes.includes(ft)
        return (
          <button
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
  )
}
