"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Option = {
  value: string | number;
  label: string;
  optionDisabled?: boolean;
  className?: string;
};

type ComboboxProps = {
  label: string;
  name: string;
  id: string;
  required?: boolean;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  loading?: boolean;
  width?: string;
  icon?: React.ReactNode; // Añadida la propiedad para íconos
};

const Combobox: React.FC<ComboboxProps> = ({
  label,
  name,
  id,
  required,
  value,
  onChange,
  className,
  options,
  placeholder = "Selecciona...",
  disabled = false,
  error,
  loading,
  width = "w-full",
  icon, // Nuevo prop para íconos
}) => {
  const [open, setOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState<string>("");

  useEffect(() => {
    // Actualizar el displayValue cuando cambia el valor o las opciones
    const matchedOption = options.find((option) => option.value === value);
    if (matchedOption) {
      setDisplayValue(matchedOption.label);
    } else {
      setDisplayValue("");
    }
  }, [value, options]);

  const handleSelect = (selectedValue: string) => {
    const matchedOption = options.find(
      (option) => option.label === selectedValue
    );
    if (matchedOption && onChange) {
      onChange({
        target: { name, value: matchedOption.value },
      } as React.ChangeEvent<HTMLInputElement>);
      setDisplayValue(matchedOption.label);
    }
    setOpen(false);
  };

  return (
    <div className={`relative mb-6 ${className}`}>
      <label
        htmlFor={id}
        className={cn(
          "text-xs font-medium absolute left-2 -top-2 px-1 bg-white dark:bg-slate-950 z-10 flex items-center gap-1",
          error
            ? "text-red-500 dark:text-red-400"
            : "text-slate-700 dark:text-slate-300"
        )}
      >
        {icon && (
          <span className="text-rose-500 dark:text-rose-400">{icon}</span>
        )}
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            aria-expanded={open}
            id={id}
            className={cn(
              `justify-between ${width} h-10 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 focus:ring-1 focus:ring-rose-500 dark:focus:ring-rose-400 focus:outline-hidden`,
              !value && "text-slate-500 dark:text-slate-400",
              error &&
                "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900",
              icon && "pl-9", // Espacio para el ícono
              className
            )}
          >
            {icon && (
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-500 dark:text-rose-400">
                {icon}
              </span>
            )}
            <span className="truncate max-w-[80%] text-left">
              {displayValue || placeholder}
            </span>
            {loading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin shrink-0 opacity-50" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className={`p-0 ${width} border border-slate-200 dark:border-slate-800 shadow-md`}
        >
          <Command className="rounded-lg border-0">
            <CommandInput
              placeholder={`Buscar ${label.toLowerCase()}...`}
              className="border-none focus:ring-0"
            />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={`${option.value}`}
                    value={option.label}
                    disabled={option.optionDisabled || disabled}
                    onSelect={() => handleSelect(option.label)}
                    className={cn("text-sm cursor-pointer", option.className)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-rose-500 dark:text-rose-400",
                        option.value === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <AnimatePresence>
        {error && (
          <motion.div
            className="flex items-center mt-1 text-red-500 dark:text-red-400"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <AlertCircle className="mr-1" size={16} />
            <span className="text-xs">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Combobox;
