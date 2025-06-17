'use client'

import { useMemo, useState } from 'react'
import { AuditLog } from '@/types/auditoria'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table'
import { format } from 'date-fns'

interface Props {
  logs: AuditLog[]
}

export function AuditoriaTable({ logs }: Props) {
  const [filter, setFilter] = useState('')

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: ({ row }) =>
          format(new Date(row.getValue('created_at')), 'yyyy-MM-dd HH:mm'),
      },
      {
        accessorKey: 'log_name',
        header: 'Módulo',
      },
      {
        accessorKey: 'description',
        header: 'Acción',
      },
      {
        accessorKey: 'causer_id',
        header: 'Usuario',
        cell: ({ row }) => row.getValue('causer_id') ?? 'Sistema',
      },
      {
        accessorKey: 'properties',
        header: 'Cambios',
        cell: ({ row }) => {
          const props = row.getValue('properties') as AuditLog['properties']
          if (!props.attributes) return '-'
          return (
            <ul className="text-xs space-y-1 list-disc ps-4">
              {Object.entries(props.attributes).map(([key, value]) => {
                const oldValue = props.old?.[key]
                return (
                  <li key={key}>
                    <strong>{key}</strong>:&nbsp;
                    {oldValue !== undefined ? (
                      <span>
                        <span className="text-muted-foreground line-through">{String(oldValue)}</span>{' '}
                        → {String(value)}
                      </span>
                    ) : (
                      <span>{String(value)}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: logs,
    columns,
    state: { globalFilter: filter },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar en auditoría..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
