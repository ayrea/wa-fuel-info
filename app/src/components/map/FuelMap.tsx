import { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { useFuelStore } from '../../data/store'
import { FUEL_TYPES, FUEL_LABELS, FUEL_COLORS } from '../../types/fuel'
import type { FuelRecord } from '../../types/fuel'
import { getLatestDate, getLatestRecords } from '../../data/selectors'
import { fuelWatchPriceColumnLabels } from '../../data/date'
import { FuelTypeFilterBar } from '../FuelTypeFilterBar'
import { MapAutoFit } from './MapAutoFit'

function priceColor(price: number | null, min: number, max: number): string {
  if (price === null) return '#9ca3af'
  const range = max - min || 1
  const ratio = (price - min) / range
  if (ratio < 0.33) return '#22c55e'
  if (ratio < 0.66) return '#eab308'
  return '#ef4444'
}

export function FuelMap(): React.JSX.Element {
  const records = useFuelStore((s) => s.records)
  const selectedFuelTypes = useFuelStore((s) => s.selectedFuelTypes)

  const allSelected = selectedFuelTypes.length === FUEL_TYPES.length

  const latestRecords = useMemo(() => {
    const base = getLatestRecords(records)
    if (allSelected) return base
    return base.filter((r) => selectedFuelTypes.includes(r.fuelType))
  }, [records, allSelected, selectedFuelTypes])

  const recordsByStation = useMemo(() => {
    const m = new Map<number, FuelRecord[]>()
    for (const rec of latestRecords) {
      const list = m.get(rec.stationId)
      if (list) list.push(rec)
      else m.set(rec.stationId, [rec])
    }
    for (const list of m.values()) {
      list.sort((a, b) => FUEL_TYPES.indexOf(a.fuelType) - FUEL_TYPES.indexOf(b.fuelType))
    }
    return m
  }, [latestRecords])

  const fuelTypeLabelSummary = allSelected
    ? 'all fuels'
    : selectedFuelTypes.map((ft) => FUEL_LABELS[ft]).join(', ')

  const priceColumnLabels = useMemo(
    () => fuelWatchPriceColumnLabels(getLatestDate(records)),
    [records]
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
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <FuelTypeFilterBar />
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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

      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
        style={{ height: '600px' }}
      >
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
          <MapAutoFit items={latestRecords} />
          {latestRecords.map((r) => {
            const stationRows = recordsByStation.get(r.stationId) ?? [r]
            const stationRep = stationRows[0]
            return (
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
                  <div className="text-sm dark:text-gray-100">
                    <p className="font-bold text-gray-900 dark:text-gray-100">{r.siteName}</p>
                    <p className="text-gray-600 dark:text-gray-400">{r.address}, {r.suburb}</p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs">{r.brandName}</p>
                    <table className="w-full text-xs border-collapse mt-2">
                      <thead>
                        <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                          <th className="py-0.5 pr-2 font-medium align-bottom">Fuel</th>
                          <th className="py-0.5 px-1 font-medium align-bottom">{priceColumnLabels.first}</th>
                          <th className="py-0.5 px-1 font-medium align-bottom">{priceColumnLabels.second}</th>
                          <th className="py-0.5 pl-1 w-0 font-medium align-bottom whitespace-nowrap" aria-label="Availability" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {stationRows.map((rec) => (
                          <tr key={rec.fuelType}>
                            <td className="py-1 pr-2 align-middle">
                              <span
                                className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold text-white leading-none"
                                style={{ backgroundColor: FUEL_COLORS[rec.fuelType] }}
                                title={FUEL_LABELS[rec.fuelType]}
                              >
                                {rec.fuelType}
                              </span>
                            </td>
                            <td className="py-1 px-1 align-middle font-semibold tabular-nums text-sm text-gray-900 dark:text-gray-50">
                              {rec.priceToday !== null ? rec.priceToday.toFixed(1) : (
                                <span className="text-gray-400 dark:text-gray-500 font-normal italic">—</span>
                              )}
                            </td>
                            <td className="py-1 px-1 align-middle tabular-nums text-gray-600 dark:text-gray-300">
                              {rec.priceTomorrow !== null ? rec.priceTomorrow.toFixed(1) : '—'}
                            </td>
                            <td className="py-1 pl-1 align-middle text-orange-500 dark:text-orange-400 whitespace-nowrap font-medium">
                              {rec.tempUnavailable ? 'Unavail' : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {stationRep.isClosedNow && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-2">Currently closed</p>
                    )}
                    {stationRep.operates247 && (
                      <p className="text-green-500 dark:text-green-400 text-xs mt-1">Open 24/7</p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium text-gray-700 dark:text-gray-200">{latestRecords.length}</span> fuel
          {latestRecords.length === 1 ? ' price' : ' prices'} for {fuelTypeLabelSummary}.
          {prices.length > 0 && (
            <span>
              {' '}Price range: <span className="text-green-600 dark:text-green-400 font-medium">{minPrice.toFixed(1)}</span>
              {' – '}
              <span className="text-red-600 dark:text-red-400 font-medium">{maxPrice.toFixed(1)}</span> ¢/L
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
