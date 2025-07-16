"use client";

import { ColumnDef } from "@tanstack/react-table";

export interface DescuentoMasivo {
  id: string | number;
  type: "expense";
  personnel_type: "nominal" | "transportista";
  request_date: string;
  invoice_number: string | number;
  account_id: number | string;
  amount: number;
  project: string;
  responsible_id: number | string;
  transport_id: number | string;
  note: string;
}

export const personnelColumns: ColumnDef<DescuentoMasivo>[] = [
  {
    accessorKey: "responsible_id",
    header: "Responsable",
  },
  {
    accessorKey: "amount",
    header: "Cantidad",
  },
  {
    accessorKey: "project",
    header: "Proyecto",
  },
];

export const transportColumns: ColumnDef<DescuentoMasivo>[] = [
  {
    accessorKey: "transport_id",
    header: "Transportista",
  },
  {
    accessorKey: "amount",
    header: "Cantidad",
  },
  {
    accessorKey: "project",
    header: "Proyecto",
  },
];
