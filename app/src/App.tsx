import { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { useFuelStore } from './data/store'
import { router } from './router'

function App() {
  const loading = useFuelStore((s) => s.loading)
  const error = useFuelStore((s) => s.error)
  const loadData = useFuelStore((s) => s.loadData)
  const records = useFuelStore((s) => s.records)

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 text-lg">Loading fuel data...</p>
          <p className="text-gray-400 text-sm mt-1">Checking cache and fetching new data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No data found. Place JSON files in public/data/.</p>
      </div>
    )
  }

  return <RouterProvider router={router} />
}

export default App
