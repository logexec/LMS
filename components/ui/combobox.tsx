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
import { motion, AnimatePresence } from "motion/react";

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
        className="block text-xs font-medium absolute left-2 -top-2 px-1 bg-white z-10"
      >
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
              `justify-between ${width} h-10 border border-gray-300 rounded-md focus:border-primary focus:ring focus:ring-primary-lighter focus:outline-none`,
              !value && "text-muted-foreground",
              error && "border-red-500 focus:border-red-500 focus:ring-red-200",
              className
            )}
          >
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
        <PopoverContent className={`p-0 ${width}`}>
          <Command>
            <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={`${option.value}`}
                    value={option.label}
                    disabled={option.optionDisabled || disabled}
                    onSelect={() => handleSelect(option.label)}
                    className={option.className}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
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
            className="flex items-center mt-1 text-red-500"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
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
