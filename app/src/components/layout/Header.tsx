import { useMemo } from 'react'
import { useFuelStore } from '../../data/store'
import { getLatestDate } from '../../data/selectors'
import { formatDateDdMm } from '../../data/date'

export function Header() {
  const records = useFuelStore((s) => s.records)
  const latestDate = useMemo(() => getLatestDate(records), [records])
  const latestDisplayDate = useMemo(() => formatDateDdMm(latestDate), [latestDate])

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WA Fuel Info</h1>
          <p className="text-blue-200 text-sm mt-0.5">
            Western Australia Fuel Price Information
            {latestDate && <span className="ml-2">— Data up to {latestDisplayDate}</span>}
          </p>
        </div>
      </div>
    </header>
  )
}
