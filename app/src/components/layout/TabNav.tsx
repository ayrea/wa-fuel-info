import { useFuelStore } from '../../data/store'
import type { Tab } from '../../types/fuel'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'trends', label: 'Price Trends', icon: '📈' },
  { id: 'map', label: 'Map', icon: '🗺️' },
  { id: 'table', label: 'Stations', icon: '📋' },
  { id: 'outages', label: 'Outages', icon: '⚠️' },
]

export function TabNav() {
  const activeTab = useFuelStore((s) => s.activeTab)
  const setActiveTab = useFuelStore((s) => s.setActiveTab)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
