import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { useFuelStore } from '../../data/store'
import { FUEL_TYPES, FUEL_LABELS, FUEL_COLORS } from '../../types/fuel'
import type { FuelRecord, FuelType } from '../../types/fuel'
import { getLatestDate, getBrands } from '../../data/selectors'
import { fuelWatchPriceColumnLabels } from '../../data/date'

const columnHelper = createColumnHelper<FuelRecord>()

function stationStatus(record: FuelRecord): React.JSX.Element {
  if (record.tempUnavailable) {
    return <span className="text-orange-500 text-xs">Unavailable</span>
  }
  if (record.isClosedNow) {
    return <span className="text-red-500 text-xs">Closed</span>
  }
  return <span className="text-green-500 text-xs">Open</span>
}

export function StationTable(): React.JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([])
  const [fuelFilter, setFuelFilter] = useState<FuelType | ''>('')
  const [brandFilter, setBrandFilter] = useState('')
  const searchQuery = useFuelStore((s) => s.searchQuery)
  const setSearchQuery = useFuelStore((s) => s.setSearchQuery)
  const records = useFuelStore((s) => s.records)

  const latestDate = useMemo(() => getLatestDate(records), [records])
  const brands = useMemo(() => getBrands(records), [records])

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (r.date !== latestDate) return false
      if (fuelFilter && r.fuelType !== fuelFilter) return false
      if (brandFilter && r.brandName !== brandFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          r.siteName.toLowerCase().includes(q) ||
          r.suburb.toLowerCase().includes(q) ||
          r.brandName.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [records, latestDate, fuelFilter, brandFilter, searchQuery])

  const priceColumnLabels = useMemo(
    () => fuelWatchPriceColumnLabels(latestDate),
    [latestDate]
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('siteName', {
        header: 'Station',
        cell: (info) => (
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{info.getValue()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{info.row.original.address}</p>
          </div>
        ),
      }),
      columnHelper.accessor('brandName', {
        header: 'Brand',
        cell: (info) => (
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium dark:text-gray-200">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('suburb', {
        header: 'Suburb',
      }),
      columnHelper.accessor('fuelType', {
        header: 'Fuel',
        cell: (info) => {
          const ft = info.getValue()
          return (
            <span
              className="px-2 py-0.5 rounded text-xs font-medium text-white"
              style={{ backgroundColor: FUEL_COLORS[ft] }}
            >
              {ft}
            </span>
          )
        },
      }),
      columnHelper.accessor('priceToday', {
        header: priceColumnLabels.first,
        cell: (info) => {
          const v = info.getValue()
          return v !== null ? (
            <span className="font-semibold">{v.toFixed(1)}</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">—</span>
          )
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor('priceTomorrow', {
        header: priceColumnLabels.second,
        cell: (info) => {
          const v = info.getValue()
          if (v === null) return <span className="text-gray-400 dark:text-gray-500">—</span>
          const priceFirst = info.row.original.priceToday
          const diff = priceFirst !== null ? v - priceFirst : 0
          return (
            <div>
              <span>{v.toFixed(1)}</span>
              {diff !== 0 && (
                <span
                  className={`ml-1 text-xs ${diff > 0 ? 'text-red-500' : 'text-green-500'}`}
                >
                  {diff > 0 ? '↑' : '↓'}{Math.abs(diff).toFixed(1)}
                </span>
              )}
            </div>
          )
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor('isClosedNow', {
        header: 'Status',
        cell: (info) => stationStatus(info.row.original),
      }),
    ],
    [priceColumnLabels]
  )

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 25 },
    },
  })

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-3 max-md:flex-col max-md:items-stretch">
          <input
            type="text"
            placeholder="Search stations, suburbs, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] max-md:w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="grid grid-cols-2 gap-3 md:contents">
            <select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value as FuelType | '')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Fuel Types</option>
              {FUEL_TYPES.map((ft) => (
                <option key={ft} value={ft}>
                  {FUEL_LABELS[ft]}
                </option>
              ))}
            </select>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 max-md:order-last md:ml-auto">
            {filtered.length} records
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
          {table.getRowModel().rows.map((row) => {
            const record = row.original
            const tomorrowDiff =
              record.priceTomorrow !== null && record.priceToday !== null
                ? record.priceTomorrow - record.priceToday
                : 0

            return (
              <article key={row.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{record.siteName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{record.suburb}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium dark:text-gray-200">
                      {record.brandName}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: FUEL_COLORS[record.fuelType] }}
                    >
                      {record.fuelType}
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{priceColumnLabels.first}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {record.priceToday !== null ? `${record.priceToday.toFixed(1)}¢` : '—'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {priceColumnLabels.second}:{' '}
                      {record.priceTomorrow !== null ? (
                        <>
                          {record.priceTomorrow.toFixed(1)}¢
                          {tomorrowDiff !== 0 && (
                            <span
                              className={`ml-1 ${tomorrowDiff > 0 ? 'text-red-500' : 'text-green-500'}`}
                            >
                              {tomorrowDiff > 0 ? '↑' : '↓'}
                              {Math.abs(tomorrowDiff).toFixed(1)}
                            </span>
                          )}
                        </>
                      ) : (
                        '—'
                      )}
                    </p>
                  </div>
                  <div className="text-right">{stationStatus(record)}</div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">{record.address}</p>
              </article>
            )
          })}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm dark:text-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
                        }[header.column.getIsSorted() as string] ?? ''}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-700 max-md:gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex-1 sm:flex-none px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex-1 sm:flex-none px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
