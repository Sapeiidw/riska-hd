"use client";

import { useState, useCallback, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ScheduleEvent {
  id: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  allDay?: boolean;
  extendedProps?: {
    scheduleId: string;
    type: "nurse" | "patient";
    status: string;
    shiftId: string;
    shiftName: string;
    nurseId?: string;
    nurseName?: string;
    patientId?: string;
    patientName?: string;
    roomId?: string;
    roomName?: string;
    machineId?: string;
    notes?: string;
  };
}

interface ScheduleCalendarProps {
  events: ScheduleEvent[];
  onEventDrop?: (eventId: string, newDate: Date) => void;
  onDateSelect?: (date: Date) => void;
  onEventClick?: (eventId: string, event: ScheduleEvent) => void;
  height?: string | number;
  editable?: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  // Nurse statuses
  scheduled: { bg: "bg-sky-100", border: "border-sky-500", text: "text-sky-700" },
  present: { bg: "bg-green-100", border: "border-green-500", text: "text-green-700" },
  absent: { bg: "bg-red-100", border: "border-red-500", text: "text-red-700" },
  leave: { bg: "bg-purple-100", border: "border-purple-500", text: "text-purple-700" },
  // Patient statuses
  confirmed: { bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-700" },
  in_progress: { bg: "bg-amber-100", border: "border-amber-500", text: "text-amber-700" },
  completed: { bg: "bg-green-100", border: "border-green-500", text: "text-green-700" },
  cancelled: { bg: "bg-gray-100", border: "border-gray-500", text: "text-gray-700" },
  no_show: { bg: "bg-red-100", border: "border-red-500", text: "text-red-700" },
};

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function ScheduleCalendar({
  events,
  onEventDrop,
  onDateSelect,
  onEventClick,
  height = "auto",
  editable = true,
}: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedEvent, setDraggedEvent] = useState<ScheduleEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);

  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Get calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, ScheduleEvent[]> = {};
    events.forEach((event) => {
      const eventDate = typeof event.start === "string" ? parseISO(event.start) : event.start;
      const dateKey = format(eventDate, "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent, event: ScheduleEvent) => {
      if (!editable) return;
      setDraggedEvent(event);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", event.id);
    },
    [editable]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, date: Date) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverDate(date);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDragOverDate(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, date: Date) => {
      e.preventDefault();
      setDragOverDate(null);

      if (draggedEvent && onEventDrop) {
        onEventDrop(draggedEvent.id, date);
      }
      setDraggedEvent(null);
    },
    [draggedEvent, onEventDrop]
  );

  const handleDateClick = useCallback(
    (date: Date) => {
      if (onDateSelect) {
        onDateSelect(date);
      }
    },
    [onDateSelect]
  );

  const handleEventClick = useCallback(
    (e: React.MouseEvent, event: ScheduleEvent) => {
      e.stopPropagation();
      if (onEventClick) {
        onEventClick(event.id, event);
      }
    },
    [onEventClick]
  );

  return (
    <div className="schedule-calendar" style={{ height }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday} className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Hari Ini
          </Button>
        </div>
        <h2 className="text-xl font-semibold">
          {format(currentDate, "MMMM yyyy", { locale: id })}
        </h2>
        <div className="w-[200px]" /> {/* Spacer for alignment */}
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gradient-to-b from-gray-50 to-gray-100 border-b">
          {DAYS.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-semibold text-gray-600 border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDragOver = dragOverDate && isSameDay(day, dragOverDate);

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[120px] border-r border-b last:border-r-0 p-1 transition-colors cursor-pointer",
                  !isCurrentMonth && "bg-gray-50 text-gray-400",
                  isToday(day) && "bg-sky-50",
                  isDragOver && "bg-sky-100 ring-2 ring-sky-400 ring-inset"
                )}
                onDragOver={(e) => handleDragOver(e, day)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day)}
                onClick={() => handleDateClick(day)}
              >
                <div
                  className={cn(
                    "text-sm font-medium mb-1",
                    isToday(day) &&
                      "bg-gradient-to-r from-sky-500 to-cyan-500 text-white w-7 h-7 rounded-full flex items-center justify-center"
                  )}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {dayEvents.slice(0, 3).map((event) => {
                    const status = event.extendedProps?.status || "scheduled";
                    const colors = STATUS_COLORS[status] || STATUS_COLORS.scheduled;

                    return (
                      <div
                        key={event.id}
                        draggable={editable}
                        onDragStart={(e) => handleDragStart(e, event)}
                        onClick={(e) => handleEventClick(e, event)}
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded border-l-2 truncate cursor-pointer transition-all hover:shadow-md",
                          colors.bg,
                          colors.border,
                          colors.text,
                          editable && "cursor-grab active:cursor-grabbing"
                        )}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayEvents.length - 3} lagi
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-sky-100 border-l-2 border-sky-500" />
          <span>Terjadwal</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-100 border-l-2 border-green-500" />
          <span>Hadir/Selesai</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-100 border-l-2 border-amber-500" />
          <span>Berlangsung</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-100 border-l-2 border-red-500" />
          <span>Tidak Hadir</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-purple-100 border-l-2 border-purple-500" />
          <span>Cuti</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-100 border-l-2 border-gray-500" />
          <span>Dibatalkan</span>
        </div>
      </div>
    </div>
  );
}
