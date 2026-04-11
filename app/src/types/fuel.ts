export interface RawAddress {
  id: number
  line1: string
  location: string
  postCode: number
  state: string
  latitude: number
  longitude: number
}

export interface RawProduct {
  shortName: string
  isTruckStop: boolean
  priceToday?: number
  priceTomorrow?: number
  isTwoPrice: boolean
  tempUnavailableFrom?: string
  tempUnavailableTo?: string
}

export interface RawStation {
  id: number
  siteName: string
  address: RawAddress
  product: RawProduct
  productFuelType: string
  brandName: string
  isClosedNow: boolean
  isClosedAllDayTomorrow: boolean
  drivewayService: string
  manned: boolean
  operates247: boolean
  membershipRequired: boolean
  currentPricingOrder: number
  nextPricingOrder: number
}

export interface FuelRecord {
  date: string
  fuelType: FuelType
  stationId: number
  siteName: string
  brandName: string
  address: string
  suburb: string
  postCode: number
  state: string
  latitude: number
  longitude: number
  priceToday: number | null
  priceTomorrow: number | null
  isTruckStop: boolean
  isClosedNow: boolean
  isClosedAllDayTomorrow: boolean
  operates247: boolean
  tempUnavailable: boolean
}

export const FUEL_TYPES = ['ULP', 'PUP', '98R', 'DSL', 'BDL', 'E85', 'LPG'] as const
export type FuelType = typeof FUEL_TYPES[number]

export const FUEL_LABELS: Record<FuelType, string> = {
  ULP: 'Unleaded (ULP)',
  PUP: 'Premium Unleaded (PUP)',
  '98R': '98 RON',
  DSL: 'Diesel',
  BDL: 'Branded Diesel',
  E85: 'E85 Ethanol',
  LPG: 'LPG',
}

export const FUEL_COLORS: Record<FuelType, string> = {
  ULP: '#2563eb',
  PUP: '#7c3aed',
  '98R': '#dc2626',
  DSL: '#059669',
  BDL: '#0891b2',
  E85: '#d97706',
  LPG: '#db2777',
}

export type Tab = 'dashboard' | 'trends' | 'map' | 'table' | 'outages'
