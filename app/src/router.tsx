import { useEffect } from 'react'
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { TabNav } from './components/layout/TabNav'
import { SummaryCards } from './components/dashboard/SummaryCards'
import { PriceBarChart } from './components/dashboard/PriceBarChart'
import { TrendChart } from './components/trends/TrendChart'
import { FuelMap } from './components/map/FuelMap'
import { StationTable } from './components/table/StationTable'
import { OutageList } from './components/outages/OutageList'
import { OutageTrendChart } from './components/outages/OutageTrendChart'

function routerBasename(): string | undefined {
  const trimmed = import.meta.env.BASE_URL.replace(/\/$/, '')
  return trimmed === '' ? undefined : trimmed
}

function ScrollToTop(): null {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

function AppLayout(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <ScrollToTop />
      <Header />
      <TabNav />
      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-4 md:px-4 md:py-6 max-md:pb-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function DashboardPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <SummaryCards />
      <PriceBarChart />
    </div>
  )
}

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'trends', element: <TrendChart /> },
        { path: 'map', element: <FuelMap /> },
        { path: 'stations', element: <StationTable /> },
        { path: 'outages', element: <OutageList /> },
        { path: 'outage-trends', element: <OutageTrendChart /> },
        { path: '*', element: <Navigate to="/dashboard" replace /> },
      ],
    },
  ],
  { basename: routerBasename() },
)
