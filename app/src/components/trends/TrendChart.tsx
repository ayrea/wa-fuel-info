import { useMemo } from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line,
} from 'recharts'
import { useFuelStore } from '../../data/store'
import { FUEL_COLORS, FUEL_LABELS } from '../../types/fuel'
import type { FuelType } from '../../types/fuel'
import { FuelTypeFilterBar } from '../FuelTypeFilterBar'
import { getDates, getTrends } from '../../data/selectors'
import { formatDateDdMm } from '../../data/date'

export function TrendChart() {
  const records = useFuelStore((s) => s.records)
  const selectedFuelTypes = useFuelStore((s) => s.selectedFuelTypes)

  const dates = useMemo(() => getDates(records), [records])
  const trends = useMemo(
    () => getTrends(records, selectedFuelTypes),
    [records, selectedFuelTypes]
  )

  const chartData = useMemo(
    () =>
      dates.map((date) => {
        const point: Record<string, string | number> = { date: formatDateDdMm(date) }
        for (const ft of selectedFuelTypes) {
          const match = trends[ft]?.find((t) => t.date === date)
          if (match && match.avg > 0) {
            point[`${ft}_avg`] = match.avg
            point[`${ft}_min`] = match.min
            point[`${ft}_max`] = match.max
          }
        }
        return point
      }),
    [dates, selectedFuelTypes, trends]
  )

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <FuelTypeFilterBar />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Daily Average Price Trends (¢/L)</h3>
        <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const ft = name.split('_')[0] as FuelType
                  const metric = name.split('_')[1]
                  return [
                    `${value.toFixed(1)} ¢/L`,
                    `${FUEL_LABELS[ft] ?? ft} (${metric})`,
                  ]
                }}
              />
              <Legend
                formatter={(value: string) => {
                  const ft = value.split('_')[0] as FuelType
                  const metric = value.split('_')[1]
                  return `${FUEL_LABELS[ft] ?? ft} (${metric})`
                }}
              />
              {selectedFuelTypes.map((ft) => (
                <Line
                  key={`${ft}_avg`}
                  type="monotone"
                  dataKey={`${ft}_avg`}
                  stroke={FUEL_COLORS[ft]}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  connectNulls
                />
              ))}
              {selectedFuelTypes.map((ft) => (
                <Area
                  key={`${ft}_range`}
                  type="monotone"
                  dataKey={`${ft}_max`}
                  stroke="none"
                  fill={FUEL_COLORS[ft]}
                  fillOpacity={0.08}
                  connectNulls
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Min / Max Range by Fuel Type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {selectedFuelTypes.map((ft) => {
            const points = trends[ft] ?? []
            if (points.length === 0) return null
            const lastPoint = points[points.length - 1]
            const firstPoint = points[0]
            const change = lastPoint.avg - firstPoint.avg
            return (
              <div
                key={ft}
                className="rounded-lg border p-4"
                style={{ borderColor: FUEL_COLORS[ft] + '40' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: FUEL_COLORS[ft] }}
                  />
                  <span className="text-sm font-medium text-gray-700">{FUEL_LABELS[ft]}</span>
                </div>
                <p className="text-xl font-bold mt-2" style={{ color: FUEL_COLORS[ft] }}>
                  {lastPoint.avg.toFixed(1)} ¢/L
                </p>
                <p className="text-xs text-gray-500">
                  Range: {lastPoint.min.toFixed(1)} – {lastPoint.max.toFixed(1)}
                </p>
                <p className={`text-xs mt-1 ${change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)} ¢/L over period
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
