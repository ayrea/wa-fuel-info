import { NavLink } from 'react-router'
import type { Tab } from '../../types/fuel'
import { TAB_ROUTE_PATH } from '../../routePaths'

const TABS: { id: Tab; label: string; shortLabel: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: '📊' },
  { id: 'trends', label: 'Price Trends', shortLabel: 'Trends', icon: '📈' },
  { id: 'map', label: 'Map', shortLabel: 'Map', icon: '🗺️' },
  { id: 'stations', label: 'Stations', shortLabel: 'Stations', icon: '📋' },
  { id: 'outages', label: 'Outages', shortLabel: 'Outages', icon: '⚠️' },
  { id: 'outageTrends', label: 'Outage Trends', shortLabel: 'Out. Trends', icon: '📉' },
]

function topTabClass(isActive: boolean): string {
  const base =
    'min-w-[96px] flex-1 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors flex flex-col items-center justify-center text-center leading-tight'

  if (isActive) {
    return `${base} border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400`
  }

  return `${base} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600`
}

function bottomTabClass(isActive: boolean): string {
  const base =
    'flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium leading-tight border-t-2 transition-colors min-h-[56px]'

  if (isActive) {
    return `${base} border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400`
  }

  return `${base} border-transparent text-gray-500 dark:text-gray-400`
}

export function TabNav(): React.JSX.Element {
  return (
    <>
      <nav className="hidden md:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-1 py-1">
            {TABS.map((tab) => (
              <NavLink
                key={tab.id}
                to={TAB_ROUTE_PATH[tab.id]}
                className={({ isActive }) => topTabClass(isActive)}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                <span className="mt-1 break-words">{tab.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pb-[env(safe-area-inset-bottom)]"
        aria-label="Primary"
      >
        <div className="grid grid-cols-6">
          {TABS.map((tab) => (
            <NavLink
              key={tab.id}
              to={TAB_ROUTE_PATH[tab.id]}
              className={({ isActive }) => bottomTabClass(isActive)}
              title={tab.label}
            >
              <span className="text-base leading-none" aria-hidden="true">
                {tab.icon}
              </span>
              <span className="text-center break-words">{tab.shortLabel}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
