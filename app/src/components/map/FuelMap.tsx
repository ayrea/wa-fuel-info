import { useState, useMemo, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useFuelStore } from '../../data/store'
import { FUEL_TYPES, FUEL_LABELS, FUEL_COLORS } from '../../types/fuel'
import type { FuelType, FuelRecord } from '../../types/fuel'
import { getLatestRecords } from '../../data/selectors'

function priceColor(price: number | null, min: number, max: number): string {
  if (price === null) return '#9ca3af'
  const range = max - min || 1
  const ratio = (price - min) / range
  if (ratio < 0.33) return '#22c55e'
  if (ratio < 0.66) return '#eab308'
  return '#ef4444'
}

function MapAutoFit({ records }: { records: FuelRecord[] }) {
  const map = useMap()
  const hasFitted = useRef(false)
  useEffect(() => {
    if (hasFitted.current || records.length === 0) return
    const lats = records.map((r) => r.latitude)
    const lngs = records.map((r) => r.longitude)
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ]
    map.fitBounds(bounds, { padding: [30, 30] })
    hasFitted.current = true
  }, [records, map])
  return null
}

export function FuelMap() {
  const [fuelType, setFuelType] = useState<FuelType>('ULP')
  const records = useFuelStore((s) => s.records)

  const latestRecords = useMemo(
    () => getLatestRecords(records, fuelType),
    [records, fuelType]
  )

  const { minPrice, maxPrice, prices } = useMemo(() => {
    const p = latestRecords.filter((r) => r.priceToday !== null).map((r) => r.priceToday!)
    return {
      prices: p,
      minPrice: p.length > 0 ? Math.min(...p) : 0,
      maxPrice: p.length > 0 ? Math.max(...p) : 0,
    }
  }, [latestRecords])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Fuel Type:</label>
          <div className="flex flex-wrap gap-2">
            {FUEL_TYPES.map((ft) => (
              <button
                key={ft}
                onClick={() => setFuelType(ft)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  fuelType === ft
                    ? 'text-white border-transparent'
                    : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                }`}
                style={fuelType === ft ? { backgroundColor: FUEL_COLORS[ft] } : undefined}
              >
                {FUEL_LABELS[ft]}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Cheap
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> Mid
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Expensive
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '600px' }}>
        <MapContainer
          center={[-31.95, 115.86]}
          zoom={10}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapAutoFit records={latestRecords} />
          {latestRecords.map((r) => (
            <CircleMarker
              key={`${r.stationId}-${r.fuelType}`}
              center={[r.latitude, r.longitude]}
              radius={6}
              pathOptions={{
                color: priceColor(r.priceToday, minPrice, maxPrice),
                fillColor: priceColor(r.priceToday, minPrice, maxPrice),
                fillOpacity: 0.8,
                weight: 1,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-gray-900">{r.siteName}</p>
                  <p className="text-gray-600">{r.address}, {r.suburb}</p>
                  <p className="text-gray-500 text-xs">{r.brandName}</p>
                  <div className="mt-2 space-y-1">
                    {r.priceToday !== null ? (
                      <p className="font-semibold text-lg">
                        {r.priceToday.toFixed(1)} ¢/L
                      </p>
                    ) : (
                      <p className="text-gray-400 italic">Price unavailable</p>
                    )}
                    {r.priceTomorrow !== null && (
                      <p className="text-xs text-gray-500">
                        Tomorrow: {r.priceTomorrow.toFixed(1)} ¢/L
                      </p>
                    )}
                  </div>
                  {r.tempUnavailable && (
                    <p className="text-orange-500 text-xs font-medium mt-1">⚠ Fuel unavailable</p>
                  )}
                  {r.isClosedNow && (
                    <p className="text-red-500 text-xs mt-1">Currently closed</p>
                  )}
                  {r.operates247 && (
                    <p className="text-green-500 text-xs">Open 24/7</p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{latestRecords.length}</span> stations
          for {FUEL_LABELS[fuelType]}.
          {prices.length > 0 && (
            <span>
              {' '}Price range: <span className="text-green-600 font-medium">{minPrice.toFixed(1)}</span>
              {' – '}
              <span className="text-red-600 font-medium">{maxPrice.toFixed(1)}</span> ¢/L
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
