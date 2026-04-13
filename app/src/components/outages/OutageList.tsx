import { useMemo, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useFuelStore } from '../../data/store'
import { getOutages } from '../../data/selectors'
import { FUEL_TYPES, FUEL_LABELS, FUEL_COLORS } from '../../types/fuel'
import type { FuelRecord, FuelType } from '../../types/fuel'
import { FuelTypeFilterBar } from '../FuelTypeFilterBar'

interface StationOutage {
  stationId: number
  siteName: string
  brandName: string
  address: string
  suburb: string
  latitude: number
  longitude: number
  fuelTypes: FuelType[]
}

function OutageMapFit({ stations }: { stations: StationOutage[] }) {
  const map = useMap()
  const hasFitted = useRef(false)
  useEffect(() => {
    if (hasFitted.current || stations.length === 0) return
    const lats = stations.map((s) => s.latitude)
    const lngs = stations.map((s) => s.longitude)
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ]
    map.fitBounds(bounds, { padding: [30, 30] })
    hasFitted.current = true
  }, [stations, map])
  return null
}

function groupByStation(records: FuelRecord[]): StationOutage[] {
  const map = new Map<number, StationOutage>()
  for (const r of records) {
    const existing = map.get(r.stationId)
    if (existing) {
      if (!existing.fuelTypes.includes(r.fuelType)) {
        existing.fuelTypes.push(r.fuelType)
      }
    } else {
      map.set(r.stationId, {
        stationId: r.stationId,
        siteName: r.siteName,
        brandName: r.brandName,
        address: r.address,
        suburb: r.suburb,
        latitude: r.latitude,
        longitude: r.longitude,
        fuelTypes: [r.fuelType],
      })
    }
  }
  return [...map.values()].sort((a, b) => a.siteName.localeCompare(b.siteName))
}

export function OutageList() {
  const records = useFuelStore((s) => s.records)
  const selectedFuelTypes = useFuelStore((s) => s.selectedFuelTypes)

  const allSelected = selectedFuelTypes.length === FUEL_TYPES.length

  const allOutageRecords = useMemo(() => getOutages(records), [records])
  const filteredRecords = useMemo(
    () =>
      allSelected
        ? allOutageRecords
        : allOutageRecords.filter((r) => selectedFuelTypes.includes(r.fuelType)),
    [allOutageRecords, selectedFuelTypes, allSelected]
  )
  const stations = useMemo(() => groupByStation(filteredRecords), [filteredRecords])

  if (allOutageRecords.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-semibold text-gray-900">All stations reporting normally</h2>
        <p className="text-gray-500 mt-2">
          No fuel outages have been reported for today.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <FuelTypeFilterBar />
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h2 className="text-lg font-semibold text-orange-800">
              {stations.length} {stations.length === 1 ? 'station' : 'stations'} reporting fuel outages
            </h2>
            <p className="text-sm text-orange-600 mt-1">
              {filteredRecords.length} fuel {filteredRecords.length === 1 ? 'type' : 'types'} affected across all stations
            </p>
          </div>
        </div>
      </div>

      <div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        style={{ height: '350px' }}
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
          <OutageMapFit stations={stations} />
          {stations.map((s) => (
            <CircleMarker
              key={s.stationId}
              center={[s.latitude, s.longitude]}
              radius={8}
              pathOptions={{
                color: '#ea580c',
                fillColor: '#f97316',
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-gray-900">{s.siteName}</p>
                  <p className="text-gray-600">{s.address}, {s.suburb}</p>
                  <p className="text-gray-500 text-xs">{s.brandName}</p>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-orange-700">Unavailable fuels:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {s.fuelTypes.map((ft) => (
                        <span
                          key={ft}
                          className="px-1.5 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: FUEL_COLORS[ft] }}
                        >
                          {ft}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Affected Stations</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {stations.map((s) => (
            <div key={s.stationId} className="px-5 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{s.siteName}</p>
                  <p className="text-sm text-gray-500">{s.address}, {s.suburb}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                    {s.brandName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 shrink-0">
                  {s.fuelTypes.map((ft) => (
                    <span
                      key={ft}
                      className="px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: FUEL_COLORS[ft] }}
                    >
                      {ft}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
