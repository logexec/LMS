"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Checkbox from "../Checkbox";
import { useState, useCallback } from "react";
import debounce from "lodash/debounce";

interface Employee {
  id: string;
  name: string;
  area: string;
  project: string;
  selected: boolean;
}

interface MassDiscountTableProps {
  employees: Employee[];
  totalAmount: number;
  onSelectionChange: (employeeId: string) => void;
  isLoading: boolean;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}

export const MassDiscountTable: React.FC<MassDiscountTableProps> = ({
  employees,
  totalAmount,
  onSelectionChange,
  isLoading,
  onSelectAll,
  onDeselectAll,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState(employees);

  const selectedCount = filteredEmployees.filter((emp) => emp.selected).length;
  const amountPerPerson = selectedCount > 0 ? totalAmount / selectedCount : 0;

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      const filtered = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(term.toLowerCase()) ||
          emp.area.toLowerCase().includes(term.toLowerCase()) ||
          emp.project.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }, 300),
    [isLoading, employees]
  );

  React.useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border shadow-sm space-y-4">
        <div className="p-4">
          <Skeleton className="h-10 w-64 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((index) => (
              <Skeleton key={`${index}-skeleton`} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar empleado..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9 pr-4"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="text-blue-600 hover:text-blue-800"
          >
            Seleccionar todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDeselectAll}
            className="text-red-600 hover:text-red-800"
          >
            Deseleccionar todos
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  label="Select all"
                  name="selectAll"
                  checked={
                    filteredEmployees.length > 0 &&
                    filteredEmployees.every((emp) => emp.selected)
                  }
                  onChange={() => {
                    if (filteredEmployees.every((emp) => emp.selected)) {
                      onDeselectAll?.();
                    } else {
                      onSelectAll?.();
                    }
                  }}
                  hideLabel
                />
              </TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead className="text-right">Descuento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="sync">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <motion.tr
                    key={employee.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`
                      group transition-colors
                      ${employee.selected ? "bg-slate-50" : ""}
                      hover:bg-slate-100
                    `}
                  >
                    <TableCell>
                      <Checkbox
                        label=""
                        name={`employee-${employee.id}`}
                        checked={employee.selected}
                        onChange={() => onSelectionChange(employee.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {employee.name}
                    </TableCell>
                    <TableCell>{employee.area}</TableCell>
                    <TableCell>{employee.project}</TableCell>
                    <TableCell className="text-right">
                      {employee.selected ? (
                        <span className="font-semibold text-red-600">
                          -${amountPerPerson.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400">$0.00</span>
                      )}
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-slate-500"
                  >
                    {searchTerm
                      ? "No se encontraron empleados con ese criterio de búsqueda"
                      : "No hay empleados disponibles para los filtros seleccionados"}
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {filteredEmployees.length > 0 && selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border rounded-lg bg-slate-50"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">
                {selectedCount} empleado{selectedCount !== 1 ? "s" : ""}{" "}
                seleccionado
                {selectedCount !== 1 ? "s" : ""}
              </span>
              <Badge variant="secondary">
                ({Math.round((selectedCount / filteredEmployees.length) * 100)}%
                del valor total)
              </Badge>
            </div>
            <span className="text-sm font-medium">
              Descuento por persona:{" "}
              <span className="text-red-600 font-semibold">
                ${amountPerPerson.toFixed(2)}
              </span>
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MassDiscountTable;
