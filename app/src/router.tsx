import { createBrowserRouter, Navigate, Outlet } from 'react-router'
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

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <TabNav />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function DashboardPage() {
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
