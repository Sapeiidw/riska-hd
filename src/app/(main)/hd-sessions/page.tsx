"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Play,
  User,
  Droplets,
  Heart,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";

import { PageHeader } from "@/components/shared";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StartSessionForm } from "./components/start-session-form";

type PendingSchedule = {
  id: string;
  patientId: string;
  shiftId: string;
  scheduleDate: string;
  status: string;
  patientName: string;
  patientMrn: string;
  patientDryWeight: number | null;
  shiftName: string;
  shiftStartTime: string;
  shiftEndTime: string;
  roomName: string | null;
  nurseName: string | null;
  machineBrand: string | null;
  machineSerial: string | null;
};

type ActiveSession = {
  id: string;
  sessionDate: string;
  startTime: string;
  preWeight: number | null;
  preSystolic: number | null;
  preDiastolic: number | null;
  ufGoal: number | null;
  bloodFlow: number | null;
  duration: number | null;
  status: string;
  patientName: string;
  patientMrn: string;
  shiftName: string;
  roomName: string | null;
  machineBrand: string | null;
  machineSerial: string | null;
};

async function fetchActiveData() {
  const res = await fetch("/api/hd-sessions/active");
  if (!res.ok) throw new Error("Failed to fetch active sessions");
  return res.json();
}

export default function HdSessionsPage() {
  const [isStartFormOpen, setIsStartFormOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<PendingSchedule | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["hd-sessions-active"],
    queryFn: fetchActiveData,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const activeSessions: ActiveSession[] = data?.data?.activeSessions || [];
  const completedToday: ActiveSession[] = data?.data?.completedToday || [];
  const pendingSchedules: PendingSchedule[] = data?.data?.pendingSchedules || [];

  const handleStartSession = (schedule: PendingSchedule) => {
    setSelectedSchedule(schedule);
    setIsStartFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="col-span-12 space-y-6">
        <PageHeader
          title="Sesi Hemodialisa"
          description="Kelola sesi hemodialisa hari ini"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-12 p-6">
        <EmptyState
          title="Gagal memuat data"
          description="Terjadi kesalahan saat memuat data sesi"
        />
      </div>
    );
  }

  return (
    <>
      <div className="col-span-12 space-y-6">
        <PageHeader
          title="Sesi Hemodialisa"
          description={`Kelola sesi hemodialisa - ${format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId })}`}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Menunggu"
            value={pendingSchedules.length}
            icon={Clock}
          />
          <StatCard
            title="Sedang Berlangsung"
            value={activeSessions.length}
            icon={Activity}
          />
          <StatCard
            title="Selesai Hari Ini"
            value={completedToday.length}
            icon={CheckCircle2}
          />
          <StatCard
            title="Total Hari Ini"
            value={pendingSchedules.length + activeSessions.length + completedToday.length}
            icon={Calendar}
          />
        </div>

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" />
              Sesi Sedang Berlangsung
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSessions.map((session) => (
                <Card key={session.id} className="border-l-4 border-l-amber-500">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{session.patientName}</CardTitle>
                        <CardDescription>MRN: {session.patientMrn}</CardDescription>
                      </div>
                      <Badge variant="warning">Berlangsung</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Mulai: {session.startTime ? format(new Date(session.startTime), "HH:mm") : "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span>{session.shiftName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>BB: {session.preWeight ? (session.preWeight / 1000).toFixed(1) : "-"} kg</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <span>TD: {session.preSystolic || "-"}/{session.preDiastolic || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-muted-foreground" />
                        <span>UF: {session.ufGoal ? (session.ufGoal / 1000).toFixed(1) : "-"} L</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Durasi: {session.duration || "-"} menit</span>
                      </div>
                    </div>
                    <Button className="w-full" asChild>
                      <Link href={`/hd-sessions/${session.id}`}>Lihat Detail</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pending Schedules */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Jadwal Menunggu ({pendingSchedules.length})
          </h2>
          {pendingSchedules.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <EmptyState
                  title="Tidak ada jadwal menunggu"
                  description="Semua jadwal hari ini sudah dimulai atau selesai"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pendingSchedules.map((schedule) => (
                <div key={schedule.id} className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{schedule.patientName}</h3>
                      <p className="text-sm text-gray-500 truncate">MRN: {schedule.patientMrn}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {schedule.status === "confirmed" ? "Dikonfirmasi" : "Terjadwal"}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-medium">{schedule.shiftName}</span>
                      <span className="text-gray-500">
                        ({schedule.shiftStartTime} - {schedule.shiftEndTime})
                      </span>
                    </div>
                    {schedule.roomName && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Ruang:</span>
                        <span>{schedule.roomName}</span>
                      </div>
                    )}
                    {schedule.patientDryWeight && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">BB Kering:</span>
                        <span>{(schedule.patientDryWeight / 1000).toFixed(1)} kg</span>
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleStartSession(schedule)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Mulai Sesi
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Today */}
        {completedToday.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Selesai Hari Ini ({completedToday.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedToday.map((session) => (
                <Card key={session.id} className="border-l-4 border-l-green-500 opacity-75">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{session.patientName}</CardTitle>
                        <CardDescription>MRN: {session.patientMrn}</CardDescription>
                      </div>
                      <Badge variant="success">Selesai</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>Shift: {session.shiftName}</div>
                      <div>
                        {session.startTime ? format(new Date(session.startTime), "HH:mm") : "-"} - selesai
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/hd-sessions/${session.id}`}>Lihat Detail</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Start Session Dialog */}
      <Dialog
        open={isStartFormOpen}
        onOpenChange={(open) => {
          setIsStartFormOpen(open);
          if (!open) setSelectedSchedule(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mulai Sesi HD - {selectedSchedule?.patientName}</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <StartSessionForm
              schedule={selectedSchedule}
              onSuccess={() => {
                setIsStartFormOpen(false);
                setSelectedSchedule(null);
                queryClient.invalidateQueries({ queryKey: ["hd-sessions-active"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
