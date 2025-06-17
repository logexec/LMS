'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { ParsedFactura } from '@/types/factura'
import { ColumnDef, useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table'
import { useState, useMemo } from 'react'

interface Props {
  data: ParsedFactura[]
}

export function XmlFacturaTable({ data }: Props) {
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<ParsedFactura>[]>(
    () => [
      { accessorKey: 'archivoOriginal', header: 'Archivo' },
      { accessorKey: 'razonSocialEmisor', header: 'Emisor' },
      { accessorKey: 'razonSocialComprador', header: 'Cliente' },
      { accessorKey: 'fechaEmision', header: 'Fecha' },
      {
        accessorKey: 'importeTotal',
        header: 'Total',
        cell: ({ row }) => `$${row.getValue<number>('importeTotal').toFixed(2)}`
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-4">
      <Input
        placeholder={`Buscar en ${data.length} facturas...`}
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
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
