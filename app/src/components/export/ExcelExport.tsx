import { useMemo, useCallback } from 'react'
import { useFuelStore } from '../../data/store'
import { FUEL_TYPES } from '../../types/fuel'
import { getLatestDate } from '../../data/selectors'
import * as XLSX from 'xlsx'

export function ExcelExport() {
  const records = useFuelStore((s) => s.records)
  const latestDate = useMemo(() => getLatestDate(records), [records])

  const handleExport = useCallback(() => {
    const wb = XLSX.utils.book_new()

    for (const ft of FUEL_TYPES) {
      const data = records
        .filter((r) => r.date === latestDate && r.fuelType === ft)
        .map((r) => ({
          'Station Name': r.siteName,
          Brand: r.brandName,
          Address: r.address,
          Suburb: r.suburb,
          'Post Code': r.postCode,
          Latitude: r.latitude,
          Longitude: r.longitude,
          'Price Today (¢/L)': r.priceToday,
          'Price Tomorrow (¢/L)': r.priceTomorrow,
          Status: r.isClosedNow ? 'Closed' : r.tempUnavailable ? 'Unavailable' : 'Open',
          '24/7': r.operates247 ? 'Yes' : 'No',
          'Truck Stop': r.isTruckStop ? 'Yes' : 'No',
        }))

      if (data.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data)
        const colWidths = Object.keys(data[0]).map((key) => ({
          wch: Math.max(key.length, 15),
        }))
        ws['!cols'] = colWidths
        XLSX.utils.book_append_sheet(wb, ws, ft)
      }
    }

    const allData = records
      .filter((r) => r.priceToday !== null)
      .map((r) => ({
        Date: r.date,
        'Fuel Type': r.fuelType,
        'Station Name': r.siteName,
        Brand: r.brandName,
        Suburb: r.suburb,
        'Price Today (¢/L)': r.priceToday,
        'Price Tomorrow (¢/L)': r.priceTomorrow,
        Latitude: r.latitude,
        Longitude: r.longitude,
      }))

    if (allData.length > 0) {
      const ws = XLSX.utils.json_to_sheet(allData)
      XLSX.utils.book_append_sheet(wb, ws, 'All Data')
    }

    XLSX.writeFile(wb, `FuelWatch_WA_${latestDate}.xlsx`)
  }, [records, latestDate])

  return (
    <button
      onClick={handleExport}
      className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5"
      title="Export to Excel"
    >
      <span>📥</span> Excel
    </button>
  )
}
