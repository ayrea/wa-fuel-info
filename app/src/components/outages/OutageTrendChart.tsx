import { useMemo } from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { useFuelStore } from '../../data/store'
import { useChartPalette } from '../../data/chartTheme'
import { FUEL_COLORS, FUEL_LABELS } from '../../types/fuel'
import type { FuelType } from '../../types/fuel'
import { FuelTypeFilterBar } from '../FuelTypeFilterBar'
import { getDates, getOutageTrends } from '../../data/selectors'
import { formatDateDdMm } from '../../data/date'

export function OutageTrendChart() {
  const records = useFuelStore((s) => s.records)
  const selectedFuelTypes = useFuelStore((s) => s.selectedFuelTypes)
  const palette = useChartPalette()

  const dates = useMemo(() => getDates(records), [records])
  const outageTrends = useMemo(
    () => getOutageTrends(records, selectedFuelTypes),
    [records, selectedFuelTypes]
  )

  const chartData = useMemo(
    () =>
      dates.map((date) => {
        const point: Record<string, string | number> = { date: formatDateDdMm(date) }
        for (const ft of selectedFuelTypes) {
          const match = outageTrends[ft]?.find((t) => t.date === date)
          if (match) {
            point[ft] = match.count
          }
        }
        return point
      }),
    [dates, selectedFuelTypes, outageTrends]
  )

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <FuelTypeFilterBar />
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Daily Fuel Outages by Type (Stations Without Fuel)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={palette.gridStroke} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: palette.tickFill }} />
              <YAxis
                tick={{ fontSize: 12, fill: palette.tickFill }}
                allowDecimals={false}
                label={{
                  value: 'Stations without fuel',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 12, fill: palette.axisLabelFill },
                }}
              />
              <Tooltip
                contentStyle={palette.tooltipContentStyle}
                labelStyle={palette.tooltipLabelStyle}
                itemStyle={palette.tooltipItemStyle}
                formatter={(value: number, name: string) => {
                  const ft = name as FuelType
                  return [
                    `${value} station${value !== 1 ? 's' : ''}`,
                    FUEL_LABELS[ft] ?? ft,
                  ]
                }}
              />
              <Legend
                wrapperStyle={palette.legendWrapperStyle}
                formatter={(value: string) => {
                  const ft = value as FuelType
                  return FUEL_LABELS[ft] ?? ft
                }}
              />
              {selectedFuelTypes.map((ft) => (
                <Line
                  key={ft}
                  type="monotone"
                  dataKey={ft}
                  stroke={FUEL_COLORS[ft]}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Outage Summary by Fuel Type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {selectedFuelTypes.map((ft) => {
            const points = outageTrends[ft] ?? []
            if (points.length === 0) return null
            const lastPoint = points[points.length - 1]
            const firstPoint = points[0]
            const change = lastPoint.count - firstPoint.count
            return (
              <div
                key={ft}
                className="rounded-lg border bg-white/50 dark:bg-gray-800/50 p-4"
                style={{ borderColor: FUEL_COLORS[ft] + '40' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: FUEL_COLORS[ft] }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{FUEL_LABELS[ft]}</span>
                </div>
                <p className="text-xl font-bold mt-2" style={{ color: FUEL_COLORS[ft] }}>
                  {lastPoint.count} station{lastPoint.count !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  without fuel on latest day
                </p>
                <p
                  className={`text-xs mt-1 ${
                    change > 0
                      ? 'text-red-500 dark:text-red-400'
                      : change < 0
                        ? 'text-green-500 dark:text-green-400'
                        : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {change > 0 ? '↑' : change < 0 ? '↓' : '—'}{' '}
                  {change !== 0 ? `${Math.abs(change)} over period` : 'No change over period'}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
