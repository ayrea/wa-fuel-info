import { useMemo } from 'react'
import { Link } from 'react-router'
import { useFuelStore } from '../../data/store'
import { FUEL_LABELS } from '../../types/fuel'
import {
  getTotalStations,
  getDates,
  getBrands,
  getPriceSummaries,
  getCheapest,
  getMostExpensive,
  getOutageSummary,
  getLatestDate,
} from '../../data/selectors'
import { formatDateDdMm, formatWeekdayShortDatePerth } from '../../data/date'
import { TAB_ROUTE_PATH } from '../../routePaths'

export function SummaryCards(): React.JSX.Element {
  const records = useFuelStore((s) => s.records)

  const totalStations = useMemo(() => getTotalStations(records), [records])
  const dates = useMemo(() => getDates(records), [records])
  const brands = useMemo(() => getBrands(records), [records])
  const summaries = useMemo(() => getPriceSummaries(records), [records])
  const cheapestULP = useMemo(() => getCheapest(records, 'ULP'), [records])
  const expensiveULP = useMemo(() => getMostExpensive(records, 'ULP'), [records])
  const outageSummary = useMemo(() => getOutageSummary(records), [records])
  const snapshotDate = useMemo(() => getLatestDate(records), [records])
  const snapshotDayLabel = useMemo(
    () => (snapshotDate ? formatWeekdayShortDatePerth(snapshotDate) : ''),
    [snapshotDate]
  )
  const firstDate = dates[0]
  const lastDate = dates[dates.length - 1]
  const dateRangeLabel =
    firstDate && lastDate
      ? `${formatDateDdMm(firstDate)} to ${formatDateDdMm(lastDate)}`
      : 'No date range'

  const cards = [
    { label: 'Total Stations', value: totalStations.toLocaleString(), sub: 'Unique sites' },
    { label: 'Fuel Types', value: summaries.length.toString(), sub: 'With pricing data' },
    { label: 'Days of Data', value: dates.length.toString(), sub: dateRangeLabel },
    { label: 'Brands', value: brands.length.toString(), sub: 'Across WA' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{c.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{c.value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {cheapestULP && expensiveULP && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl p-5">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              {snapshotDayLabel ? `Cheapest ULP — ${snapshotDayLabel}` : 'Cheapest ULP'}
            </p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">
              {cheapestULP.priceToday?.toFixed(1)}¢/L
            </p>
            <p className="text-sm text-green-600 dark:text-green-400/90 mt-1">{cheapestULP.siteName}</p>
            <p className="text-xs text-green-500 dark:text-green-500/80">{cheapestULP.suburb}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-5">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {snapshotDayLabel ? `Most Expensive ULP — ${snapshotDayLabel}` : 'Most Expensive ULP'}
            </p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400 mt-1">
              {expensiveULP.priceToday?.toFixed(1)}¢/L
            </p>
            <p className="text-sm text-red-600 dark:text-red-400/90 mt-1">{expensiveULP.siteName}</p>
            <p className="text-xs text-red-500 dark:text-red-500/80">{expensiveULP.suburb}</p>
          </div>
          <Link
            to={TAB_ROUTE_PATH.outages}
            className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-xl p-5 text-left hover:bg-orange-100 dark:hover:bg-orange-950/60 transition-colors cursor-pointer block"
          >
            <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Fuel Outages</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-400 mt-1">
              {outageSummary.stationCount} {outageSummary.stationCount === 1 ? 'station' : 'stations'}
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400/90 mt-1">
              {outageSummary.recordCount} fuel {outageSummary.recordCount === 1 ? 'type' : 'types'} affected
            </p>
            <p className="text-xs text-orange-500 dark:text-orange-500/80 mt-1">Click to view details →</p>
          </Link>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Price Summary by Fuel Type</h3>
          {snapshotDayLabel && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Averages, min, and max use snapshot-day prices for {snapshotDayLabel}.
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm dark:text-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Fuel Type</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Avg (¢/L)</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Min (¢/L)</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Max (¢/L)</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Spread</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Stations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {summaries.map((s) => (
                <tr key={s.fuelType} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {FUEL_LABELS[s.fuelType]}
                  </td>
                  <td className="px-5 py-3 text-right">{s.avg.toFixed(1)}</td>
                  <td className="px-5 py-3 text-right text-green-600 dark:text-green-400">{s.min.toFixed(1)}</td>
                  <td className="px-5 py-3 text-right text-red-600 dark:text-red-400">{s.max.toFixed(1)}</td>
                  <td className="px-5 py-3 text-right text-gray-500 dark:text-gray-400">
                    {(s.max - s.min).toFixed(1)}
                  </td>
                  <td className="px-5 py-3 text-right">{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
