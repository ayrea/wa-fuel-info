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

const columnHelper = createColumnHelper<FuelRecord>()

export function StationTable() {
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

  const columns = useMemo(
    () => [
      columnHelper.accessor('siteName', {
        header: 'Station',
        cell: (info) => (
          <div>
            <p className="font-medium text-gray-900">{info.getValue()}</p>
            <p className="text-xs text-gray-500">{info.row.original.address}</p>
          </div>
        ),
      }),
      columnHelper.accessor('brandName', {
        header: 'Brand',
        cell: (info) => (
          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
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
        header: 'Today (¢/L)',
        cell: (info) => {
          const v = info.getValue()
          return v !== null ? (
            <span className="font-semibold">{v.toFixed(1)}</span>
          ) : (
            <span className="text-gray-400">—</span>
          )
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor('priceTomorrow', {
        header: 'Tomorrow (¢/L)',
        cell: (info) => {
          const v = info.getValue()
          if (v === null) return <span className="text-gray-400">—</span>
          const today = info.row.original.priceToday
          const diff = today !== null ? v - today : 0
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
        cell: (info) => {
          if (info.row.original.tempUnavailable)
            return <span className="text-orange-500 text-xs">Unavailable</span>
          if (info.getValue())
            return <span className="text-red-500 text-xs">Closed</span>
          return <span className="text-green-500 text-xs">Open</span>
        },
      }),
    ],
    []
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search stations, suburbs, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={fuelFilter}
            onChange={(e) => setFuelFilter(e.target.value as FuelType | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            {filtered.length} records
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700"
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
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
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

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
