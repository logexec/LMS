"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface ComboProps {
  selected: string | null;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  isDisabled?: boolean;
}

const ComboBox = ({ selected, options, onChange, isDisabled }: ComboProps) => {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === selected);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[130px] justify-between truncate pr-1"
          disabled={isDisabled}
        >
          {current?.label ?? "Selecciona"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-max max-h-[400px] p-0 overflow-y-auto">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandEmpty>No encontrado</CommandEmpty>
          <CommandGroup>
            {options.map((o) => (
              <CommandItem
                key={o.value}
                value={o.value}
                onSelect={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    o.value === selected ? "opacity-100" : "opacity-0"
                  )}
                />
                {o.label ?? o.value}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBox;
