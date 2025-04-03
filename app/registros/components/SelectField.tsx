"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface SelectOption {
  id: string;
  name: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoizar el cálculo de opciones filtradas para evitar re-cálculos innecesarios
  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Memoizar la opción seleccionada
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.name === value);
  }, [options, value]);

  // Cerrar el dropdown si se hace clic fuera de él
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <FormItem className="flex flex-col" ref={containerRef}>
      <FormLabel className="overflow-hidden text-ellipsis">{label}</FormLabel>
      <div className="relative">
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-[200px] justify-between overflow text-clip truncate",
              !value && "text-muted-foreground"
            )}
            onClick={handleToggle}
            type="button"
          >
            {selectedOption ? selectedOption.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>

        {isOpen && (
          <div
            className="absolute z-[1000] bg-white border rounded-md shadow-lg w-[200px] mt-1 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1">
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-2 text-center text-gray-500">
                  No hay resultados
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "pl-2 pb-0.5 h-fit cursor-pointer hover:bg-slate-100 flex-1 text-sm",
                      option.name === value && "bg-slate-50"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(option.name);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        option.name === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.name}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
};

export default SelectField;
