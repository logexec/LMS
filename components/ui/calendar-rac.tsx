/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { ComponentProps } from "react";
import { getLocalTimeZone, DateValue } from "@internationalized/date";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Button,
  CalendarCell as CalendarCellRac,
  CalendarGridBody as CalendarGridBodyRac,
  CalendarGridHeader as CalendarGridHeaderRac,
  CalendarGrid as CalendarGridRac,
  CalendarHeaderCell as CalendarHeaderCellRac,
  Calendar as CalendarRac,
  composeRenderProps,
  Heading as HeadingRac,
} from "react-aria-components";

import { cn } from "@/lib/utils";

// Define base props with explicit types
interface BaseCalendarProps {
  className?: string;
  mode?: "single";
  selected?: DateValue | null;
  onSelect?: (date: DateValue | null) => void;
  disabled?: (date: Date) => boolean;
  autoFocus?: boolean;
}

// Extend CalendarRac props, excluding conflicting ones
type CalendarProps = Omit<
  ComponentProps<typeof CalendarRac>,
  "value" | "onChange" | "isDateUnavailable" | "autoFocus"
> &
  BaseCalendarProps;

function CalendarHeader() {
  return (
    <header className="flex items-center justify-between px-2 pt-1">
      <Button
        slot="previous"
        className="h-7 w-7 rounded-md p-0 opacity-50 hover:opacity-100"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      <HeadingRac className="text-sm font-medium" />
      <Button
        slot="next"
        className="h-7 w-7 rounded-md p-0 opacity-50 hover:opacity-100"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </header>
  );
}

function Calendar({
  className,
  mode = "single",
  selected,
  onSelect,
  disabled,
  autoFocus,
  ...props
}: CalendarProps) {
  return (
    <CalendarRac
      {...props}
      value={selected}
      onChange={onSelect}
      isDateUnavailable={
        disabled
          ? (date: DateValue) => disabled(date.toDate(getLocalTimeZone()))
          : undefined
      }
      autoFocus={autoFocus}
      className={composeRenderProps(className, (className) =>
        cn("p-3", className)
      )}
    >
      <CalendarHeader />
      <CalendarGridRac className="mt-2 w-full border-collapse">
        <CalendarGridHeaderRac className="mb-1">
          {(day) => (
            <CalendarHeaderCellRac className="text-center text-xs font-medium text-muted-foreground pb-4">
              {day}
            </CalendarHeaderCellRac>
          )}
        </CalendarGridHeaderRac>
        <CalendarGridBodyRac>
          {(date) => (
            <CalendarCellRac
              date={date}
              className={cn(
                "text-center text-sm p-0 relative focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md cursor-pointer",
                "data-[disabled]:text-muted-foreground data-[disabled]:opacity-20",
                "data-[selected]:bg-black data-[selected]:text-white"
              )}
            >
              {({ formattedDate, isSelected }) => (
                <div
                  className={cn(
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                    isSelected
                      ? "bg-red-700 text-white"
                      : "text-black dark:text-white",
                    "hover:bg-red-200 dark:hover:bg-gray-800"
                  )}
                >
                  {formattedDate}
                </div>
              )}
            </CalendarCellRac>
          )}
        </CalendarGridBodyRac>
      </CalendarGridRac>
    </CalendarRac>
  );
}

export { Calendar };
