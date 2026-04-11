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
import { FUEL_COLORS, FUEL_LABELS } from '../../types/fuel'
import type { FuelType } from '../../types/fuel'
import { TrendFilters } from '../trends/TrendFilters'
import { getDates, getOutageTrends } from '../../data/selectors'

export function OutageTrendChart() {
  const records = useFuelStore((s) => s.records)
  const selectedFuelTypes = useFuelStore((s) => s.selectedFuelTypes)

  const dates = useMemo(() => getDates(records), [records])
  const outageTrends = useMemo(
    () => getOutageTrends(records, selectedFuelTypes),
    [records, selectedFuelTypes]
  )

  const chartData = useMemo(
    () =>
      dates.map((date) => {
        const point: Record<string, string | number> = { date: date.slice(5) }
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            Daily Fuel Outages by Type (Stations Without Fuel)
          </h3>
        </div>
        <TrendFilters />
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                allowDecimals={false}
                label={{
                  value: 'Stations without fuel',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 12, fill: '#6b7280' },
                }}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const ft = name as FuelType
                  return [
                    `${value} station${value !== 1 ? 's' : ''}`,
                    FUEL_LABELS[ft] ?? ft,
                  ]
                }}
              />
              <Legend
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
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Outage Summary by Fuel Type</h3>
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
                  {lastPoint.count} station{lastPoint.count !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-500">
                  without fuel on latest day
                </p>
                <p className={`text-xs mt-1 ${change > 0 ? 'text-red-500' : change < 0 ? 'text-green-500' : 'text-gray-400'}`}>
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
