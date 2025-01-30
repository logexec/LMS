import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import Checkbox from "../Checkbox";
import { Employee } from "@/utils/types";

interface EmployeeTableProps {
  employees: Employee[];
  totalAmount: number;
  onSelectionChange: (employeeId: string) => void;
  isLoading: boolean;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  totalAmount,
  onSelectionChange,
  isLoading,
}) => {
  const selectedCount = employees.filter((emp) => emp.selected).length;
  const amountPerPerson = selectedCount > 0 ? totalAmount / selectedCount : 0;

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead className="text-right">Descuento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((index) => (
              <TableRow key={`employee=${index}`}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px] ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Proyecto</TableHead>
            <TableHead className="text-right">Descuento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee, idx) => (
            <TableRow key={`${employee.id}-${idx}`} className="group">
              <TableCell>
                <Checkbox
                  label={`Seleccionar ${employee.name}`}
                  name={`employee-${employee.id}`}
                  checked={employee.selected}
                  onChange={() => onSelectionChange(employee.id)}
                  hideLabel
                />
              </TableCell>
              <TableCell className="font-medium">{employee.name}</TableCell>
              <TableCell>{employee.area}</TableCell>
              <TableCell>{employee.project}</TableCell>
              <TableCell className="text-right">
                {employee.selected ? (
                  <span className="font-semibold text-emerald-600">
                    ${amountPerPerson.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-slate-400">$0.00</span>
                )}
              </TableCell>
            </TableRow>
          ))}
          {employees.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-4 text-slate-500"
              >
                No hay empleados disponibles para los filtros seleccionados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {employees.length > 0 && selectedCount > 0 && (
        <div className="p-4 border-t bg-slate-50">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">
              {selectedCount} empleado{selectedCount !== 1 ? "s" : ""}{" "}
              seleccionado
              {selectedCount !== 1 ? "s" : ""}
            </span>
            <span className="text-sm font-medium">
              Descuento por persona:{" "}
              <span className="text-emerald-600 font-semibold">
                ${amountPerPerson.toFixed(2)}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
