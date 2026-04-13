export function formatDateDdMm(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!match) return date

  const [, _year, month, day] = match
  return `${day}-${month}`
}
