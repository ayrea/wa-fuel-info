import { useMemo } from 'react'
import { useFuelStore } from '../../data/store'
import { formatIsoDateAsPerth, formatIsoTimeAsPerth } from '../../data/date'
import { ThemeToggle } from './ThemeToggle'

export function Header(): React.JSX.Element {
  const updatedAt = useFuelStore((s) => s.updatedAt)

  const latestDisplayDate = useMemo(
    () => (updatedAt ? formatIsoDateAsPerth(updatedAt) : ''),
    [updatedAt]
  )
  const updatedTimeDisplay = useMemo(
    () => (updatedAt ? formatIsoTimeAsPerth(updatedAt) : ''),
    [updatedAt]
  )

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg dark:from-blue-800 dark:to-blue-950">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">WA Fuel Info</h1>
          {updatedAt && (
            <p className="text-blue-200 text-xs mt-0.5 md:hidden">
              Updated {latestDisplayDate} {updatedTimeDisplay} AWST
            </p>
          )}
          <p className="hidden md:block text-blue-200 text-sm mt-0.5">
            Western Australia Fuel Price Information
            {updatedAt && (
              <span className="ml-2">
                — Data up to {latestDisplayDate} {updatedTimeDisplay} AWST
              </span>
            )}
          </p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
