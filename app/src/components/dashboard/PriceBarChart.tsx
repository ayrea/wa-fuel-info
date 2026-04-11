import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useFuelStore } from '../../data/store'
import { FUEL_COLORS, FUEL_LABELS } from '../../types/fuel'
import type { FuelType } from '../../types/fuel'
import { getPriceSummaries } from '../../data/selectors'

export function PriceBarChart() {
  const records = useFuelStore((s) => s.records)
  const summaries = useMemo(() => getPriceSummaries(records), [records])

  const data = summaries.map((s) => ({
    name: s.fuelType,
    label: FUEL_LABELS[s.fuelType],
    avg: Math.round(s.avg * 10) / 10,
    min: Math.round(s.min * 10) / 10,
    max: Math.round(s.max * 10) / 10,
  }))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Average Price by Fuel Type (¢/L)</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)} ¢/L`]}
            labelFormatter={(label: string) => FUEL_LABELS[label as FuelType] ?? label}
          />
          <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={FUEL_COLORS[entry.name as FuelType] ?? '#6b7280'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
