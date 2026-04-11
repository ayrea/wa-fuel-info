import { useMemo } from 'react'
import { useFuelStore } from '../../data/store'
import { getLatestDate } from '../../data/selectors'
import { ExcelExport } from '../export/ExcelExport'
import { KmlExport } from '../export/KmlExport'

export function Header() {
  const records = useFuelStore((s) => s.records)
  const latestDate = useMemo(() => getLatestDate(records), [records])

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">FuelWatch WA</h1>
          <p className="text-blue-200 text-sm mt-0.5">
            Western Australia Fuel Price Analysis
            {latestDate && <span className="ml-2">— Data up to {latestDate}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExcelExport />
          <KmlExport />
        </div>
      </div>
    </header>
  )
}
