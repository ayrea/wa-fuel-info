import { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { useFuelStore } from './data/store'
import { router } from './router'

function App(): React.JSX.Element {
  const loading = useFuelStore((s) => s.loading)
  const error = useFuelStore((s) => s.error)
  const loadData = useFuelStore((s) => s.loadData)
  const records = useFuelStore((s) => s.records)

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto dark:border-blue-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">Loading fuel data...</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Checking cache and fetching new data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg font-medium">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500 dark:text-gray-400">No data found. Place JSON files in public/data/.</p>
      </div>
    )
  }

  return <RouterProvider router={router} />
}

export default App
