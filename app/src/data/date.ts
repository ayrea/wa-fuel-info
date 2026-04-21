export function formatDateDdMm(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!match) return date

  const [, _year, month, day] = match
  return `${day}-${month}`
}

export function formatDateDdMmYyyy(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!match) return date

  const [, year, month, day] = match
  return `${day}-${month}-${year}`
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

export function addDaysIso(dateStr: string, delta: number): string {
  const m = ISO_DATE.exec(dateStr)
  if (!m) return dateStr
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const t = new Date(Date.UTC(y, mo - 1, d + delta))
  return t.toISOString().slice(0, 10)
}

const perthWeekdayFormatter = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Perth',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const perthWeekdayWithYearFormatter = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Perth',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const perthTimeFormatter = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Perth',
  hour: 'numeric',
  minute: '2-digit',
})

/** Time only (AM/PM) from an ISO 8601 instant, in Perth. */
export function formatIsoTimeAsPerth(iso: string): string {
  return perthTimeFormatter.format(new Date(iso))
}

/** Weekday + date + four-digit year from an ISO 8601 instant, in Perth. */
export function formatIsoDateAsPerth(iso: string): string {
  return perthWeekdayWithYearFormatter.format(new Date(iso))
}

/** Weekday + date for a YYYY-MM-DD civil day as used by FuelWatch (Western Australia). */
export function formatWeekdayShortDatePerth(dateStr: string): string {
  if (!ISO_DATE.test(dateStr)) return dateStr
  const dt = new Date(`${dateStr}T12:00:00+08:00`)
  return perthWeekdayFormatter.format(dt)
}

/** Weekday + date + four-digit year (Perth); for header “Data up to” only. */
export function formatWeekdayShortDateWithYearPerth(dateStr: string): string {
  if (!ISO_DATE.test(dateStr)) return dateStr
  const dt = new Date(`${dateStr}T12:00:00+08:00`)
  return perthWeekdayWithYearFormatter.format(dt)
}

/** Column headers for priceToday / priceTomorrow from a snapshot `date`. */
export function fuelWatchPriceColumnLabels(snapshotDate: string): { first: string; second: string } {
  if (!ISO_DATE.test(snapshotDate)) {
    return { first: 'Day 1 (¢/L)', second: 'Day 2 (¢/L)' }
  }
  const next = addDaysIso(snapshotDate, 1)
  return {
    first: `${formatWeekdayShortDatePerth(snapshotDate)} (¢/L)`,
    second: `${formatWeekdayShortDatePerth(next)} (¢/L)`,
  }
}
