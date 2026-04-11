import { useState, useMemo, useCallback } from 'react'
import { useFuelStore } from '../../data/store'
import { FUEL_TYPES, FUEL_LABELS } from '../../types/fuel'
import type { FuelType } from '../../types/fuel'
import { getLatestDate } from '../../data/selectors'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function KmlExport() {
  const records = useFuelStore((s) => s.records)
  const latestDate = useMemo(() => getLatestDate(records), [records])
  const [showPicker, setShowPicker] = useState(false)

  const handleExport = useCallback(
    (ft: FuelType) => {
      const data = records.filter(
        (r) => r.date === latestDate && r.fuelType === ft && r.priceToday !== null
      )

      const placemarks = data
        .map(
          (r) => `    <Placemark>
      <name>${escapeXml(r.siteName)}</name>
      <description><![CDATA[
        <b>${escapeXml(r.siteName)}</b><br/>
        Brand: ${escapeXml(r.brandName)}<br/>
        Address: ${escapeXml(r.address)}, ${escapeXml(r.suburb)} ${r.postCode}<br/>
        Fuel: ${FUEL_LABELS[r.fuelType]}<br/>
        Price Today: ${r.priceToday?.toFixed(1)} ¢/L<br/>
        ${r.priceTomorrow !== null ? `Price Tomorrow: ${r.priceTomorrow.toFixed(1)} ¢/L<br/>` : ''}
        ${r.operates247 ? 'Open 24/7<br/>' : ''}
        ${r.isTruckStop ? 'Truck Stop<br/>' : ''}
      ]]></description>
      <Point>
        <coordinates>${r.longitude},${r.latitude},0</coordinates>
      </Point>
    </Placemark>`
        )
        .join('\n')

      const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>WA Fuel Info - ${FUEL_LABELS[ft]} - ${latestDate}</name>
    <description>Fuel prices from WA Fuel Info</description>
${placemarks}
  </Document>
</kml>`

      const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `WA_Fuel_Info_${ft}_${latestDate}.kml`
      a.click()
      URL.revokeObjectURL(url)
      setShowPicker(false)
    },
    [records, latestDate]
  )

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="px-3 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-1.5"
        title="Export to KML for Google Earth"
      >
        <span>🌍</span> KML
      </button>
      {showPicker && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[180px]">
          <p className="px-3 py-1.5 text-xs text-gray-500 font-medium">Select fuel type:</p>
          {FUEL_TYPES.map((ft) => (
            <button
              key={ft}
              onClick={() => handleExport(ft)}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors"
            >
              {FUEL_LABELS[ft]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
