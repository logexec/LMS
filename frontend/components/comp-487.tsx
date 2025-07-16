"use client";

import { Calendar } from "@/components/ui/calendar-rac";
import {
  DateValue,
  parseDate,
  getLocalTimeZone,
} from "@internationalized/date";

interface CalendarComponentProps {
  mode?: "single";
  selected?: Date | null;
  onSelect?: (date: Date | null) => void;
  disabled?: (date: Date) => boolean;
  autoFocus?: boolean;
  className?: string;
}

// Función para convertir Date de JavaScript a DateValue
function toDateValue(date: Date | null | undefined): DateValue | null {
  if (!date) return null;
  return parseDate(date.toISOString().split("T")[0]);
}

// Función para convertir DateValue a Date de JavaScript
function toJsDate(dateValue: DateValue | null): Date | null {
  if (!dateValue) return null;
  return dateValue.toDate(getLocalTimeZone());
}

export default function CalendarComponent({
  mode = "single",
  selected,
  onSelect,
  disabled,
  autoFocus,
  className,
}: CalendarComponentProps) {
  // Convertir Date a DateValue para el componente interno
  const dateValue = toDateValue(selected);

  // Función para manejar cambios y convertir de DateValue a Date
  const handleSelect = (value: DateValue | null) => {
    if (onSelect) {
      onSelect(toJsDate(value));
    }
  };

  return (
    <div>
      <Calendar
        mode={mode}
        selected={dateValue}
        onSelect={handleSelect}
        disabled={disabled}
        autoFocus={autoFocus}
        className={className}
      />
    </div>
  );
}
