"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCallback, useState } from "react";

interface DateTimePicker24hProps {
  /**
   * The earliest allowable date/time. Any date/time before this is disabled.
   */
  min?: Date;
  /**
   * Optional function for additional disabling logic.
   * Return `true` if the given date/time should be disabled.
   */
  disabledDateTime?: (testDate: Date) => boolean;
}

export function DateTimePicker24h({
  min,
  disabledDateTime,
}: DateTimePicker24hProps) {
  const [date, setDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);

  // Generate a list of hours [0..23]
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // Generate a list of minutes in increments of 5
  const minuteValues = Array.from({ length: 12 }, (_, i) => i * 5);

  /**
   * Unified helper to see if a date/time is disabled due to `min` or `disabledDateTime`.
   */
  const isDisabled = useCallback(
    (testDate: Date) => {
      // 1) If "min" is set, block anything strictly before it.
      if (min && testDate < min) {
        return true;
      }
      // 2) If there's a custom function, check that too
      if (disabledDateTime && disabledDateTime(testDate)) {
        return true;
      }
      return false;
    },
    [min, disabledDateTime]
  );

  /**
   * The calendar calls this function to see if the entire day should be disabled.
   * The Calendar only checks day-level precision (midnight).
   */
  const isCalendarDayDisabled = (day: Date): boolean => {
    return isDisabled(day);
  };

  /**
   * When a day is selected, merge it with the current time if we already have one.
   * Then check if the resulting date/time is allowed. If so, set `date`.
   */
  const handleDateSelect = (selectedDay: Date | undefined) => {
    if (!selectedDay) return;

    const currentHour = date ? date.getHours() : 0;
    const currentMinute = date ? date.getMinutes() : 0;

    const mergedDate = new Date(
      selectedDay.getFullYear(),
      selectedDay.getMonth(),
      selectedDay.getDate(),
      currentHour,
      currentMinute
    );

    if (!isDisabled(mergedDate)) {
      setDate(mergedDate);
    }
  };

  /**
   * Called when a user clicks an hour or minute button.
   * Construct a new date with the chosen hour/minute and the existing day.
   */
  const handleTimeChange = (type: "hour" | "minute", value: number) => {
    if (!date) return;
    const newDate = new Date(date);

    if (type === "hour") {
      newDate.setHours(value);
    } else {
      newDate.setMinutes(value);
    }

    // If the new date/time is valid, update state
    if (!isDisabled(newDate)) {
      setDate(newDate);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {/* 🔹 Format as dd/MM/yyyy HH:mm */}
          {date ? (
            format(date, "dd/MM/yyyy HH:mm")
          ) : (
            <span>dd/MM/yyyy HH:mm</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          {/* Calendar: disables entire days if isCalendarDayDisabled() returns true */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            disabled={isCalendarDayDisabled}
          />

          {/* Hour/Minute scroll pickers */}
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            {/* Hours */}
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.reverse().map((hour) => {
                  if (!date) {
                    // If we haven't selected a day, hours are not clickable
                    return (
                      <Button
                        key={hour}
                        size="icon"
                        variant="ghost"
                        className="sm:w-full shrink-0 aspect-square cursor-not-allowed opacity-50"
                        disabled
                      >
                        {hour}
                      </Button>
                    );
                  }

                  const tempDate = new Date(date);
                  tempDate.setHours(hour);

                  const disabled = isDisabled(tempDate);
                  const isSelected = date.getHours() === hour && !disabled;

                  return (
                    <Button
                      key={hour}
                      size="icon"
                      variant={isSelected ? "default" : "ghost"}
                      className="sm:w-full shrink-0 aspect-square"
                      disabled={disabled}
                      onClick={() => handleTimeChange("hour", hour)}
                    >
                      {hour}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>

            {/* Minutes */}
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {minuteValues.map((minute) => {
                  if (!date) {
                    return (
                      <Button
                        key={minute}
                        size="icon"
                        variant="ghost"
                        className="sm:w-full shrink-0 aspect-square cursor-not-allowed opacity-50"
                        disabled
                      >
                        {minute.toString().padStart(2, "0")}
                      </Button>
                    );
                  }

                  const tempDate = new Date(date);
                  tempDate.setMinutes(minute);

                  const disabled = isDisabled(tempDate);
                  const isSelected = date.getMinutes() === minute && !disabled;

                  return (
                    <Button
                      key={minute}
                      size="icon"
                      variant={isSelected ? "default" : "ghost"}
                      className="sm:w-full shrink-0 aspect-square"
                      disabled={disabled}
                      onClick={() => handleTimeChange("minute", minute)}
                    >
                      {minute.toString().padStart(2, "0")}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
