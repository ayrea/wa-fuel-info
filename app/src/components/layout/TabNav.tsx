import { NavLink } from 'react-router'
import type { Tab } from '../../types/fuel'
import { TAB_ROUTE_PATH } from '../../routePaths'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'trends', label: 'Price Trends', icon: '📈' },
  { id: 'map', label: 'Map', icon: '🗺️' },
  { id: 'stations', label: 'Stations', icon: '📋' },
  { id: 'outages', label: 'Outages', icon: '⚠️' },
  { id: 'outageTrends', label: 'Outage Trends', icon: '📉' },
]

export function TabNav(): React.JSX.Element {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap gap-1 py-1">
          {TABS.map((tab) => (
            <NavLink
              key={tab.id}
              to={TAB_ROUTE_PATH[tab.id]}
              className={({ isActive }) =>
                `min-w-[96px] flex-1 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors flex flex-col items-center justify-center text-center leading-tight ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                }`
              }
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span className="mt-1 break-words">{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
