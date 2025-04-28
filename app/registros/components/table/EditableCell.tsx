/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Status } from "@/utils/types";

interface EditableCellProps {
  value: string;
  row: any;
  column: any;
  table: any;
}

export const MonthCell = ({ value, row, column, table }: EditableCellProps) => {
  const [cellValue, setCellValue] = useState(value || "");
  const isRejected = row.original.status === Status.rejected;

  useEffect(() => {
    setCellValue(value || "");
  }, [value]);

  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, cellValue);
  };

  return (
    <div className={`w-full min-w-max`}>
      <input
        type="month"
        name={column.id}
        id={`${column.id}-${row.id}`}
        min={minDate}
        value={cellValue}
        onChange={(e) => setCellValue(e.target.value)}
        onBlur={onBlur}
        className="w-full rounded-md border-gray-300 shadow-xs focus:border-sky-500 focus:ring-sky-500 text-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
        disabled={isRejected}
      />
    </div>
  );
};

export const SelectCell = ({
  value,
  row,
  column,
  table,
}: EditableCellProps) => {
  const [cellValue, setCellValue] = useState(value || "rol");
  const isRejected = row.original.status === Status.rejected;

  useEffect(() => {
    setCellValue(value || "rol");
  }, [value]);

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, cellValue);
  };

  return (
    <div className={`w-full min-w-max`}>
      <select
        name={column.id}
        id={`${column.id}-${row.id}`}
        value={cellValue}
        onChange={(e) => setCellValue(e.target.value)}
        onBlur={onBlur}
        className="w-full rounded-md border-slate-200 bg-white shadow-xs focus:border-sky-500 focus:ring-sky-500 text-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
        disabled={isRejected}
      >
        <option value="rol">Rol</option>
        <option value="decimo_cuarto">Décimo Cuarto</option>
        <option value="decimo_tercero">Décimo Tercero</option>
        <option value="liquidacion">Liquidación</option>
        <option value="utilidades">Utilidades</option>
      </select>
    </div>
  );
};

export const TextCell = ({ value, row, column, table }: EditableCellProps) => {
  const [cellValue, setCellValue] = useState(value || "");
  const isRejected = row.original.status === Status.rejected;

  useEffect(() => {
    setCellValue(value || "");
  }, [value]);

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, cellValue);
  };

  return (
    <div className={`w-full min-w-[185px]`}>
      <Input
        type="text"
        value={cellValue}
        onChange={(e) => setCellValue(e.target.value)}
        onBlur={onBlur}
        placeholder="Agregar observación..."
        className="w-full rounded-md border-slate-200 bg-white shadow-xs focus:border-sky-500 focus:ring-sky-500 text-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
        disabled={isRejected}
      />
    </div>
  );
};
