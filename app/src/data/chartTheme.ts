import type { CSSProperties } from 'react'
import { useThemeStore } from './themeStore'

export interface ChartPalette {
  gridStroke: string
  tickFill: string
  axisLabelFill: string
  tooltipContentStyle: CSSProperties
  tooltipLabelStyle: CSSProperties
  tooltipItemStyle: CSSProperties | undefined
  legendWrapperStyle: CSSProperties
}

export function useChartPalette(): ChartPalette {
  const theme = useThemeStore((s) => s.theme)
  const isDark = theme === 'dark'

  return {
    gridStroke: isDark ? '#374151' : '#f0f0f0',
    tickFill: isDark ? '#9ca3af' : '#6b7280',
    axisLabelFill: isDark ? '#9ca3af' : '#6b7280',
    tooltipContentStyle: isDark
      ? {
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: 8,
        }
      : {
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
        },
    tooltipLabelStyle: isDark ? { color: '#f3f4f6' } : { color: '#111827' },
    tooltipItemStyle: isDark ? { color: '#e5e7eb' } : undefined,
    legendWrapperStyle: { color: isDark ? '#d1d5db' : '#374151' },
  }
}
