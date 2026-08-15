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

  return (
    <div className="overflow-x-auto rounded-2xl border border-navy-700/10 dark:border-navy-700">
      <table className="w-full min-w-max text-left text-sm">
        <thead className="bg-navy-900/[0.03] dark:bg-white/5">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="px-4 py-3 font-medium text-slate-500">
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className="flex items-center gap-1 hover:text-navy-900 dark:hover:text-white"
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
                'text-navy-900 dark:text-white',
                onRowClick && 'cursor-pointer hover:bg-navy-900/[0.03] dark:hover:bg-white/5',
              )}
            >
              {columns.map((column) => (
                <td key={column.key} className={cn('px-4 py-3', column.className)}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
