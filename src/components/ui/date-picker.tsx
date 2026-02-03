"use client"

import * as React from "react"
import { CalendarIcon, XIcon } from "lucide-react"
import { format, parse } from "date-fns"
import { id } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string // yyyy-MM-dd format
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    return parse(value, "yyyy-MM-dd", new Date())
  }, [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "border-gray-200 flex w-full items-center gap-2 rounded-xl border bg-white px-4 py-2 text-base md:text-sm shadow-sm transition-all outline-none focus-visible:border-sky-400 focus-visible:ring-sky-500/20 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 h-10 text-left",
            !value && "text-gray-400",
            className
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-gray-400" />
          <span className="flex-1 truncate">
            {selectedDate
              ? format(selectedDate, "dd MMMM yyyy", { locale: id })
              : placeholder}
          </span>
          {value && (
            <span
              role="button"
              tabIndex={-1}
              className="shrink-0 rounded-full p-0.5 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation()
                onChange?.("")
              }}
            >
              <XIcon className="size-3.5 text-gray-400" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            onChange?.(date ? format(date, "yyyy-MM-dd") : "")
            setOpen(false)
          }}
          defaultMonth={selectedDate}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
