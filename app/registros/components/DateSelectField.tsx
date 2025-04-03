"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface DateSelectFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

const DateSelectField: React.FC<DateSelectFieldProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDateDisabled = useCallback(
    (date: Date): boolean => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    },
    [minDate, maxDate]
  );

  const formattedDate = useMemo(() => {
    return value ? format(value, "PPP") : "";
  }, [value]);

  const handleTriggerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCalendar((prev) => !prev);
  };

  const handleCalendarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        onChange(date);
        setShowCalendar(false);
      }
    },
    [onChange]
  );

  const handleClickOutside = () => {
    setShowCalendar(false);
  };

  return (
    <FormItem className="flex flex-col" ref={containerRef}>
      <FormLabel>{label}</FormLabel>
      <div className="relative">
        <FormControl>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] pl-3 text-left font-normal",
              !value && "text-muted-foreground"
            )}
            onClick={handleTriggerClick}
            type="button"
          >
            {formattedDate || <span>Selecciona una fecha</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>

        {showCalendar && (
          <>
            <div
              className="fixed inset-0 z-[999]"
              onClick={handleClickOutside}
            />
            <div
              className="absolute z-[1000] bg-white border rounded-md shadow-lg"
              style={{
                top: `calc(100% + 5px)`,
                left: 0,
              }}
              onClick={handleCalendarClick}
            >
              <Calendar
                mode="single"
                selected={value}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                initialFocus
              />
            </div>
          </>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
};

export default DateSelectField;
