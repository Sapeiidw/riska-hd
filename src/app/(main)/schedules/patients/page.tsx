"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  Pencil,
  Trash2,
  Calendar,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  List,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import dynamic from "next/dynamic";

import api from "@/lib/api/axios";
import { MasterPageLayout, TableSkeleton } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PatientScheduleForm } from "./patient-schedule-form";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ScheduleEvent } from "@/components/calendar";

// Dynamic import untuk FullCalendar (SSR tidak support)
const ScheduleCalendar = dynamic(
  () => import("@/components/calendar").then((mod) => mod.ScheduleCalendar),
  { ssr: false, loading: () => <div className="h-[600px] animate-pulse bg-gray-100 rounded-xl" /> }
);

const GoogleSyncButton = dynamic(
  () => import("@/components/calendar").then((mod) => mod.GoogleSyncButton),
  { ssr: false }
);

type PatientSchedule = {
  id: string;
  patientId: string;
  shiftId: string;
  scheduleDate: string;
  roomId: string | null;
  machineId: string | null;
  nurseId: string | null;
  status: string;
  notes: string | null;
  patientName: string;
  patientMrn: string;
  shiftName: string;
  shiftStartTime: string;
  shiftEndTime: string;
  roomName: string | null;
  roomCode: string | null;
  machineSerial: string | null;
  machineBrand: string | null;
  nurseName: string | null;
};

const STATUS_MAP: Record<
  string,
  { label: string; variant: "default" | "success" | "destructive" | "secondary" | "outline" | "warning" }
> = {
  scheduled: { label: "Terjadwal", variant: "outline" },
  confirmed: { label: "Dikonfirmasi", variant: "default" },
  in_progress: { label: "Berlangsung", variant: "warning" },
  completed: { label: "Selesai", variant: "success" },
  cancelled: { label: "Dibatalkan", variant: "secondary" },
  no_show: { label: "Tidak Hadir", variant: "destructive" },
};

async function fetchSchedules(startDate?: string, endDate?: string, shiftId?: string, status?: string) {
  const params = new URLSearchParams({ limit: "500" });
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (shiftId) params.set("shiftId", shiftId);
  if (status) params.set("status", status);

  const { data } = await api.get(`/api/schedules/patients?${params}`);
  return data;
}

async function fetchShifts() {
  const { data } = await api.get("/api/master/shifts?limit=100");
  return data;
}

async function deleteSchedule(id: string) {
  const { data } = await api.delete(`/api/schedules/patients/${id}`);
  return data;
}

async function updateScheduleDate(id: string, newDate: string) {
  const { data } = await api.put(`/api/schedules/patients/${id}`, { scheduleDate: newDate });
  return data;
}

export default function PatientSchedulesPage() {
  const today = new Date();
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<"week" | "month" | "custom">("month");
  const [startDate, setStartDate] = useState(format(subMonths(startOfMonth(today), 1), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(addMonths(endOfMonth(today), 1), "yyyy-MM-dd"));
  const [shiftFilter, setShiftFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<PatientSchedule | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: shiftsData } = useQuery({
    queryKey: ["shifts-all"],
    queryFn: fetchShifts,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["patient-schedules", startDate, endDate, shiftFilter, statusFilter],
    queryFn: () =>
      fetchSchedules(startDate, endDate, shiftFilter || undefined, statusFilter || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-schedules"] });
      toast.success("Jadwal berhasil dihapus");
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Gagal menghapus jadwal");
    },
  });

  const updateDateMutation = useMutation({
    mutationFn: ({ id, newDate }: { id: string; newDate: string }) =>
      updateScheduleDate(id, newDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-schedules"] });
      toast.success("Jadwal berhasil dipindahkan");
    },
    onError: () => {
      toast.error("Gagal memindahkan jadwal");
      queryClient.invalidateQueries({ queryKey: ["patient-schedules"] });
    },
  });

  // Convert schedules to calendar events
  const calendarEvents: ScheduleEvent[] = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((schedule: PatientSchedule) => {
      const startDateTime = `${format(new Date(schedule.scheduleDate), "yyyy-MM-dd")}T${schedule.shiftStartTime}:00`;
      const endDateTime = `${format(new Date(schedule.scheduleDate), "yyyy-MM-dd")}T${schedule.shiftEndTime}:00`;

      return {
        id: schedule.id,
        title: `${schedule.patientName} - ${schedule.shiftName}`,
        start: startDateTime,
        end: endDateTime,
        extendedProps: {
          scheduleId: schedule.id,
          type: "patient" as const,
          status: schedule.status,
          shiftId: schedule.shiftId,
          shiftName: schedule.shiftName,
          patientId: schedule.patientId,
          patientName: schedule.patientName,
          nurseId: schedule.nurseId || undefined,
          nurseName: schedule.nurseName || undefined,
          roomId: schedule.roomId || undefined,
          roomName: schedule.roomName || undefined,
          machineId: schedule.machineId || undefined,
          notes: schedule.notes || undefined,
        },
      };
    });
  }, [data?.data]);

  const handleEventDrop = (eventId: string, newDate: Date) => {
    const formattedDate = format(newDate, "yyyy-MM-dd");
    updateDateMutation.mutate({ id: eventId, newDate: formattedDate });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(format(date, "yyyy-MM-dd"));
    setEditingSchedule(null);
    setIsFormOpen(true);
  };

  const handleEventClick = (eventId: string, event: ScheduleEvent) => {
    const schedule = data?.data?.find((s: PatientSchedule) => s.id === eventId);
    if (schedule) {
      setEditingSchedule(schedule);
      setIsFormOpen(true);
    }
  };

  const handleDateRangeChange = (value: "week" | "month" | "custom") => {
    setDateRange(value);
    setPage(1);
    if (value === "week") {
      setStartDate(format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"));
      setEndDate(format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"));
    } else if (value === "month") {
      setStartDate(format(subMonths(startOfMonth(today), 1), "yyyy-MM-dd"));
      setEndDate(format(addMonths(endOfMonth(today), 1), "yyyy-MM-dd"));
    }
  };

  const columns: ColumnDef<PatientSchedule>[] = [
    {
      accessorKey: "scheduleDate",
      header: "Tanggal",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {format(new Date(row.getValue("scheduleDate")), "EEE, dd MMM", { locale: localeId })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "patientName",
      header: "Pasien",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("patientName")}</span>
          <span className="text-xs text-muted-foreground">MRN: {row.original.patientMrn}</span>
        </div>
      ),
    },
    {
      accessorKey: "shiftName",
      header: "Shift",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium">{row.getValue("shiftName")}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.shiftStartTime} - {row.original.shiftEndTime}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "roomName",
      header: "Ruangan & Mesin",
      cell: ({ row }) => {
        const roomName = row.getValue("roomName") as string | null;
        const machineSerial = row.original.machineSerial;
        return (
          <div className="flex flex-col gap-1">
            {roomName ? (
              <Badge variant="outline" className="w-fit">
                {roomName}
              </Badge>
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
            {machineSerial && (
              <span className="text-xs text-muted-foreground">
                {row.original.machineBrand} - {machineSerial}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "nurseName",
      header: "Perawat",
      cell: ({ row }) => {
        const nurseName = row.getValue("nurseName") as string | null;
        return nurseName ? (
          <span className="font-medium">{nurseName}</span>
        ) : (
          <span className="text-muted-foreground">Belum ditentukan</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusInfo = STATUS_MAP[status] || { label: status, variant: "default" as const };
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setEditingSchedule(row.original);
                    setIsFormOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setDeletingId(row.original.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Hapus</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  const inProgressCount =
    data?.data?.filter((s: PatientSchedule) => s.status === "in_progress").length || 0;
  const completedCount =
    data?.data?.filter((s: PatientSchedule) => s.status === "completed").length || 0;
  const noShowCount =
    data?.data?.filter((s: PatientSchedule) => s.status === "no_show").length || 0;

  const stats = data?.meta
    ? [
        {
          label: "Total Jadwal",
          value: data.meta.total || 0,
          icon: Calendar,
          color: "default" as const,
        },
        {
          label: "Berlangsung",
          value: inProgressCount,
          icon: Activity,
          color: "warning" as const,
        },
        {
          label: "Selesai",
          value: completedCount,
          icon: CheckCircle2,
          color: "success" as const,
        },
        {
          label: "Tidak Hadir",
          value: noShowCount,
          icon: XCircle,
          color: "danger" as const,
        },
      ]
    : undefined;

  return (
    <>
      <MasterPageLayout
        title="Jadwal Pasien HD"
        description="Kelola jadwal sesi hemodialisis pasien - Drag & drop untuk memindahkan jadwal"
        icon={CalendarCheck}
        stats={stats}
        addButtonLabel="Tambah Jadwal"
        onAddClick={() => {
          setSelectedDate(null);
          setEditingSchedule(null);
          setIsFormOpen(true);
        }}
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Rentang Waktu</Label>
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Minggu Ini</SelectItem>
                  <SelectItem value="month">Bulan Ini</SelectItem>
                  <SelectItem value="custom">Kustom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div className="space-y-2">
                  <Label>Dari Tanggal</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[180px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sampai Tanggal</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-[180px]"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Shift</Label>
              <Select
                value={shiftFilter || "_all"}
                onValueChange={(v) => setShiftFilter(v === "_all" ? "" : v)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Semua Shift</SelectItem>
                  {shiftsData?.data?.map((shift: { id: string; name: string }) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={statusFilter || "_all"}
                onValueChange={(v) => setStatusFilter(v === "_all" ? "" : v)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Semua Status</SelectItem>
                  <SelectItem value="scheduled">Terjadwal</SelectItem>
                  <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                  <SelectItem value="in_progress">Berlangsung</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  <SelectItem value="no_show">Tidak Hadir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GoogleSyncButton type="patient" />
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "calendar" | "table")}>
              <TabsList>
                <TabsTrigger value="calendar" className="gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Kalender
                </TabsTrigger>
                <TabsTrigger value="table" className="gap-2">
                  <List className="h-4 w-4" />
                  Tabel
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[600px] animate-pulse bg-gray-100 rounded-xl" />
        ) : error ? (
          <EmptyState
            title="Gagal memuat data"
            description="Terjadi kesalahan saat memuat jadwal pasien"
          />
        ) : viewMode === "calendar" ? (
          <ScheduleCalendar
            events={calendarEvents}
            onEventDrop={handleEventDrop}
            onDateSelect={handleDateSelect}
            onEventClick={handleEventClick}
            height={600}
            editable={true}
          />
        ) : data?.data?.length === 0 ? (
          <EmptyState
            title="Belum ada jadwal"
            description="Mulai dengan menambahkan jadwal pasien baru"
          />
        ) : (
          <DataTable
            columns={columns}
            data={data?.data || []}
            meta={data?.meta}
            onPageChange={setPage}
          />
        )}
      </MasterPageLayout>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingSchedule(null);
            setSelectedDate(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Edit Jadwal Pasien" : "Tambah Jadwal Pasien"}
            </DialogTitle>
          </DialogHeader>
          <PatientScheduleForm
            schedule={editingSchedule}
            defaultDate={selectedDate}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingSchedule(null);
              setSelectedDate(null);
              queryClient.invalidateQueries({ queryKey: ["patient-schedules"] });
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus Jadwal"
        description="Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </>
  );
}
