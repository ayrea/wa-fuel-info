import type { Tab } from './types/fuel'

/** Path segments for each tab (under the router basename). */
export const TAB_ROUTE_PATH: Record<Tab, string> = {
  dashboard: '/dashboard',
  trends: '/trends',
  map: '/map',
  stations: '/stations',
  outages: '/outages',
  outageTrends: '/outage-trends',
}
