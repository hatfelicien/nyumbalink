import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface TableColumn<T> {
  key: string
  header: string
  sortable?: boolean
  sortValue?: (row: T) => string | number
  render: (row: T) => ReactNode
  className?: string
}

export interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  onRowClick?: (row: T) => void
}

type SortDirection = 'asc' | 'desc'

/**
 * A sortable table on wide screens. Below that the same columns render as a grid of
 * cards: the first column is the card heading, labelled columns become label/value rows,
 * and header-less columns (row actions) sit along the bottom edge.
 */
export function Table<T>({ columns, data, getRowId, onRowClick }: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const sortedData = useMemo(() => {
    const column = columns.find((c) => c.key === sortKey)
    if (!column?.sortValue) return data

    const sorted = [...data].sort((a, b) => {
      const aValue = column.sortValue!(a)
      const bValue = column.sortValue!(b)
      if (aValue < bValue) return -1
      if (aValue > bValue) return 1
      return 0
    })
    return sortDirection === 'asc' ? sorted : sorted.reverse()
  }, [data, columns, sortKey, sortDirection])

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDirection('asc')
    } else {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    }
  }

  const [primary, ...rest] = columns
  const detailColumns = rest.filter((c) => c.header)
  const actionColumns = rest.filter((c) => !c.header)

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2 xl:hidden">
        {sortedData.map((row) => (
          <li
            key={getRowId(row)}
            onClick={() => onRowClick?.(row)}
            className={cn(
              'flex flex-col rounded-2xl border border-navy-700/10 bg-white p-4 text-sm text-navy-900 shadow-sm dark:border-navy-700 dark:bg-navy-800 dark:text-white',
              onRowClick && 'cursor-pointer active:bg-navy-900/[0.03]',
            )}
          >
            {primary && <div className="min-w-0">{primary.render(row)}</div>}
            {detailColumns.length > 0 && (
              <dl className="mb-3 mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-navy-700/10 pt-3 dark:border-navy-700">
                {detailColumns.map((column) => (
                  <div key={column.key} className="min-w-0">
                    <dt className="text-xs text-slate-500">{column.header}</dt>
                    <dd className="mt-0.5 min-w-0 break-words">{column.render(row)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {actionColumns.length > 0 && (
              <div className="mt-auto flex flex-wrap items-center justify-end gap-1 border-t border-navy-700/10 pt-2 dark:border-navy-700">
                {actionColumns.map((column) => (
                  <div key={column.key}>{column.render(row)}</div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-2xl border border-navy-700/10 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800 xl:block">
        <table className="w-full min-w-max text-left text-sm">
          <thead className="bg-navy-900/[0.03] dark:bg-white/5">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={sortKey === column.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="flex items-center gap-1 uppercase hover:text-navy-900 dark:hover:text-white"
                    >
                      {column.header}
                      {sortKey === column.key ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700/10 dark:divide-navy-700">
            {sortedData.map((row) => (
              <tr
                key={getRowId(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'text-navy-900 transition-colors hover:bg-navy-900/[0.02] dark:text-white dark:hover:bg-white/[0.03]',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((column) => (
                  // The first column usually holds a long title; cap it so the row actions stay in view.
                  <td key={column.key} className={cn('px-4 py-3 align-middle', column.className)}>
                    {column === primary ? <div className="max-w-[20rem]">{column.render(row)}</div> : column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
