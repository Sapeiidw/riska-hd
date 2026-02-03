"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type CalendarViewMode = "day" | "week" | "month";

interface ScheduleCalendarProps {
  events: ScheduleEvent[];
  onEventDrop?: (eventId: string, newDate: Date) => void;
  onDateSelect?: (date: Date) => void;
  onEventClick?: (eventId: string, event: ScheduleEvent) => void;
  editable?: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  scheduled: { bg: "bg-sky-100", border: "border-sky-500", text: "text-sky-700" },
  present: { bg: "bg-green-100", border: "border-green-500", text: "text-green-700" },
  absent: { bg: "bg-red-100", border: "border-red-500", text: "text-red-700" },
  leave: { bg: "bg-purple-100", border: "border-purple-500", text: "text-purple-700" },
  confirmed: { bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-700" },
  in_progress: { bg: "bg-amber-100", border: "border-amber-500", text: "text-amber-700" },
  completed: { bg: "bg-green-100", border: "border-green-500", text: "text-green-700" },
  cancelled: { bg: "bg-gray-100", border: "border-gray-500", text: "text-gray-700" },
  no_show: { bg: "bg-red-100", border: "border-red-500", text: "text-red-700" },
};

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0-23

function getEventTime(event: ScheduleEvent): {
  startHour: number; startMin: number;
  endHour: number; endMin: number;
  realEndHour: number; realEndMin: number;
} {
  const startStr = typeof event.start === "string" ? event.start : event.start.toISOString();
  const endStr = event.end
    ? typeof event.end === "string" ? event.end : event.end.toISOString()
    : null;

  let startHour = 0, startMin = 0, endHour = 1, endMin = 0;

  if (startStr.includes("T")) {
    const timePart = startStr.split("T")[1];
    const [h, m] = timePart.split(":").map(Number);
    startHour = h;
    startMin = m || 0;
  }

  if (endStr && endStr.includes("T")) {
    const timePart = endStr.split("T")[1];
    const [h, m] = timePart.split(":").map(Number);
    endHour = h;
    endMin = m || 0;
  } else {
    endHour = startHour + 1;
    endMin = startMin;
  }

  // Keep real end time for display
  const realEndHour = endHour;
  const realEndMin = endMin;

  // Clamp overnight shifts visually to midnight
  if (endHour < startHour || (endHour === startHour && endMin < startMin)) {
    endHour = 24;
    endMin = 0;
  }

  return { startHour, startMin, endHour, endMin, realEndHour, realEndMin };
}

function formatHour(hour: number): string {
  if (hour === 0) return "00:00";
  const h = hour.toString().padStart(2, "0");
  return `${h}:00`;
}

export function ScheduleCalendar({
  events,
  onEventDrop,
  onDateSelect,
  onEventClick,
  editable = true,
}: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarViewMode>("month");
  const [draggedEvent, setDraggedEvent] = useState<ScheduleEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);

  // Auto-switch to day view on mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    if (mq.matches) {
      setCalendarView("day");
    }
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches && calendarView === "month") {
        setCalendarView("day");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [calendarView]);

  const goToPrev = () => {
    if (calendarView === "day") setCurrentDate(subDays(currentDate, 1));
    else if (calendarView === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNext = () => {
    if (calendarView === "day") setCurrentDate(addDays(currentDate, 1));
    else if (calendarView === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  // Month view days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const start = startOfWeek(monthStart, { weekStartsOn: 0 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days: Date[] = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  // Week view days
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, ScheduleEvent[]> = {};
    events.forEach((event) => {
      const eventDate = typeof event.start === "string" ? parseISO(event.start) : event.start;
      const dateKey = format(eventDate, "yyyy-MM-dd");
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  // Header title
  const headerTitle = useMemo(() => {
    if (calendarView === "day") {
      return format(currentDate, "EEEE, d MMMM yyyy", { locale: id });
    }
    if (calendarView === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, "d")} - ${format(end, "d MMMM yyyy", { locale: id })}`;
      }
      return `${format(start, "d MMM", { locale: id })} - ${format(end, "d MMM yyyy", { locale: id })}`;
    }
    return format(currentDate, "MMMM yyyy", { locale: id });
  }, [currentDate, calendarView]);

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

  const handleDragOver = useCallback((e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDate(date);
  }, []);

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
      if (onDateSelect) onDateSelect(date);
    },
    [onDateSelect]
  );

  const handleEventClick = useCallback(
    (e: React.MouseEvent, event: ScheduleEvent) => {
      e.stopPropagation();
      if (onEventClick) onEventClick(event.id, event);
    },
    [onEventClick]
  );

  // Group events by their start hour
  const getEventsByHour = (dayEvents: ScheduleEvent[]) => {
    const byHour: Record<number, ScheduleEvent[]> = {};
    dayEvents.forEach((event) => {
      const { startHour } = getEventTime(event);
      if (!byHour[startHour]) byHour[startHour] = [];
      byHour[startHour].push(event);
    });
    return byHour;
  };

  // ── TIME GRID (shared between day & week) ──
  const renderTimeGrid = (days: Date[]) => {
    const isSingleDay = days.length === 1;
    const colCount = days.length;

    // Collect events by hour for each day
    const dayEventsByHour = days.map((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      return getEventsByHour(eventsByDate[dateKey] || []);
    });

    return (
      <div className="border rounded-lg w-full">
        {/* Day column headers */}
        <div
          className="grid bg-gradient-to-b from-gray-50 to-gray-100 border-b"
          style={{ gridTemplateColumns: `56px repeat(${colCount}, minmax(0, 1fr))` }}
        >
          <div className="border-r p-1" />
          {days.map((day, i) => (
            <div
              key={i}
              className={cn(
                "py-2 px-1 text-center border-r last:border-r-0",
                isToday(day) && "bg-sky-50"
              )}
            >
              <div className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                {isSingleDay
                  ? format(day, "EEEE", { locale: id })
                  : DAYS[day.getDay()]}
              </div>
              <div
                className={cn(
                  "text-lg sm:text-2xl font-bold mt-0.5 inline-flex items-center justify-center",
                  isToday(day)
                    ? "bg-sky-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full text-base sm:text-xl"
                    : "text-gray-800"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid body */}
        <div>
          {HOURS.map((hour) => {
            const now = new Date();
            const isCurrentHour = now.getHours() === hour;

            return (
              <div
                key={hour}
                className="grid border-b border-gray-100"
                style={{ gridTemplateColumns: `56px repeat(${colCount}, minmax(0, 1fr))` }}
              >
                {/* Time label */}
                <div className="border-r pr-2 py-1 text-right">
                  <span className="text-[10px] sm:text-xs text-gray-400">
                    {formatHour(hour)}
                  </span>
                </div>

                {/* Day columns for this hour */}
                {days.map((day, dayIndex) => {
                  const hourEvents = dayEventsByHour[dayIndex][hour] || [];
                  const isDragOver = dragOverDate && isSameDay(day, dragOverDate);
                  const showNowLine = isToday(day) && isCurrentHour;

                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "border-r last:border-r-0 min-h-[48px] min-w-0 p-0.5 relative",
                        isDragOver && "bg-sky-50",
                        isToday(day) && "bg-sky-50/30"
                      )}
                      onDragOver={(e) => handleDragOver(e, day)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day)}
                      onClick={() => handleDateClick(day)}
                    >
                      {/* Current time indicator */}
                      {showNowLine && (
                        <div
                          className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                          style={{ top: `${(now.getMinutes() / 60) * 100}%` }}
                        >
                          <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
                          <div className="h-[2px] bg-red-500 flex-1" />
                        </div>
                      )}

                      {/* Events in this hour */}
                      <div className="flex flex-col gap-0.5">
                        {hourEvents.map((event) => {
                          const { startHour: sh, startMin: sm, realEndHour, realEndMin } = getEventTime(event);
                          const status = event.extendedProps?.status || "scheduled";
                          const colors = STATUS_COLORS[status] || STATUS_COLORS.scheduled;
                          const timeDisplay = `${sh.toString().padStart(2, "0")}:${sm.toString().padStart(2, "0")} - ${realEndHour.toString().padStart(2, "0")}:${realEndMin.toString().padStart(2, "0")}`;
                          const personName = event.extendedProps?.nurseName || event.extendedProps?.patientName || event.title.split(" - ")[0];
                          const shiftName = event.extendedProps?.shiftName || "";

                          return (
                            <div
                              key={event.id}
                              draggable={editable}
                              onDragStart={(e) => handleDragStart(e, event)}
                              onClick={(e) => handleEventClick(e, event)}
                              className={cn(
                                "rounded-md border-l-[3px] px-1.5 sm:px-2 py-1 sm:py-1.5 flex flex-col justify-center cursor-pointer transition-shadow hover:shadow-lg",
                                colors.bg,
                                colors.border,
                                colors.text,
                                editable && "cursor-grab active:cursor-grabbing"
                              )}
                              title={`${event.title}\n${timeDisplay}`}
                            >
                              <div className="text-[10px] sm:text-xs font-semibold truncate">
                                {personName}
                              </div>
                              <div className="text-[9px] sm:text-[10px] opacity-80 truncate">
                                {shiftName}
                              </div>
                              <div className="text-[9px] sm:text-[10px] opacity-70 truncate">
                                {timeDisplay}
                              </div>
                              {event.extendedProps?.roomName && (
                                <div className="text-[9px] sm:text-[10px] opacity-70 truncate">
                                  {event.extendedProps.roomName}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── DAY VIEW ──
  const renderDayView = () => renderTimeGrid([currentDate]);

  // ── WEEK VIEW ──
  const renderWeekView = () => renderTimeGrid(weekDays);

  // ── MONTH VIEW ──
  const renderMonthView = () => {
    return (
      <div className="border rounded-lg overflow-x-auto">
        <div className="min-w-[500px]">
          <div className="grid grid-cols-7 bg-gradient-to-b from-gray-50 to-gray-100 border-b">
            {DAYS.map((day) => (
              <div
                key={day}
                className="p-1.5 sm:p-2 text-center text-xs sm:text-sm font-semibold text-gray-600 border-r last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

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
                    "min-h-[80px] sm:min-h-[120px] border-r border-b last:border-r-0 p-0.5 sm:p-1 transition-colors cursor-pointer",
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
                      "text-xs sm:text-sm font-medium mb-0.5 sm:mb-1",
                      isToday(day) &&
                        "bg-gradient-to-r from-sky-500 to-cyan-500 text-white w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-sm"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 overflow-y-auto max-h-[50px] sm:max-h-[80px]">
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
                            "text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded border-l-2 truncate cursor-pointer transition-all hover:shadow-md",
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
                      <div className="text-[10px] sm:text-xs text-gray-500 px-1">
                        +{dayEvents.length - 3} lagi
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4">
        {/* Row 1: Navigation + Title */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="outline" size="icon" onClick={goToPrev} className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext} className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday} className="gap-1.5 h-8 sm:h-9 text-xs sm:text-sm shrink-0">
              <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Hari Ini
            </Button>
          </div>

          {/* View toggle */}
          <Tabs
            value={calendarView}
            onValueChange={(v) => setCalendarView(v as CalendarViewMode)}
            className="shrink-0"
          >
            <TabsList className="h-8 sm:h-9">
              <TabsTrigger value="day" className="text-xs sm:text-sm px-2.5 sm:px-3 h-7 sm:h-8">
                Hari
              </TabsTrigger>
              <TabsTrigger value="week" className="text-xs sm:text-sm px-2.5 sm:px-3 h-7 sm:h-8">
                Minggu
              </TabsTrigger>
              <TabsTrigger value="month" className="text-xs sm:text-sm px-2.5 sm:px-3 h-7 sm:h-8">
                Bulan
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Row 2: Title */}
        <h2 className="text-base sm:text-xl font-semibold capitalize">
          {headerTitle}
        </h2>
      </div>

      {/* View content */}
      {calendarView === "day" && renderDayView()}
      {calendarView === "week" && renderWeekView()}
      {calendarView === "month" && renderMonthView()}

      {/* Legend */}
      <div className="mt-3 sm:mt-4 flex flex-wrap gap-x-3 gap-y-1.5 sm:gap-4 text-[10px] sm:text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-sky-100 border-l-2 border-sky-500" />
          <span>Terjadwal</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-green-100 border-l-2 border-green-500" />
          <span>Hadir/Selesai</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-amber-100 border-l-2 border-amber-500" />
          <span>Berlangsung</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-red-100 border-l-2 border-red-500" />
          <span>Tidak Hadir</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-purple-100 border-l-2 border-purple-500" />
          <span>Cuti</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-gray-100 border-l-2 border-gray-500" />
          <span>Dibatalkan</span>
        </div>
      </div>
    </div>
  );
}
