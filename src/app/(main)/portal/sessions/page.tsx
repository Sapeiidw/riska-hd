"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Activity, ArrowLeft, Calendar, Clock, Droplets, Heart, Scale } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";

import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

type Session = {
  id: string;
  sessionDate: string;
  startTime: string | null;
  endTime: string | null;
  preWeight: number | null;
  postWeight: number | null;
  preSystolic: number | null;
  preDiastolic: number | null;
  postSystolic: number | null;
  postDiastolic: number | null;
  ufGoal: number | null;
  actualUf: number | null;
  bloodFlow: number | null;
  dialysateFlow: number | null;
  duration: number | null;
  dialyzerType: string | null;
  status: string;
  shiftName: string;
  roomName: string | null;
};

async function fetchSessions(params: URLSearchParams) {
  const res = await fetch(`/api/portal/sessions?${params}`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

export default function PatientSessionsPage() {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const { data, isLoading, error } = useQuery({
    queryKey: ["portal-sessions", page, startDate, endDate],
    queryFn: () => fetchSessions(params),
  });

  const sessions: Session[] = data?.data || [];

  return (
    <div className="col-span-12 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/portal">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title="Riwayat Sesi HD"
          description="Semua sesi hemodialisa Anda"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label>Dari Tanggal</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-[180px]"
          />
        </div>
        <div className="space-y-2">
          <Label>Sampai Tanggal</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-[180px]"
          />
        </div>
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Gagal memuat data"
          description="Terjadi kesalahan saat memuat riwayat sesi"
        />
      ) : sessions.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat"
          description="Anda belum memiliki riwayat sesi hemodialisa"
        />
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {format(new Date(session.sessionDate), "EEEE, dd MMMM yyyy", {
                        locale: localeId,
                      })}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4" />
                      {session.shiftName} •{" "}
                      {session.startTime
                        ? format(new Date(session.startTime), "HH:mm")
                        : "-"}{" "}
                      -{" "}
                      {session.endTime
                        ? format(new Date(session.endTime), "HH:mm")
                        : "-"}
                    </CardDescription>
                  </div>
                  <Badge variant={session.status === "completed" ? "success" : "warning"}>
                    {session.status === "completed" ? "Selesai" : "Berlangsung"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Weight */}
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Scale className="h-4 w-4" />
                      <span className="text-sm">Berat Badan</span>
                    </div>
                    <div className="text-sm">
                      <span>
                        Pra: {session.preWeight ? `${(session.preWeight / 1000).toFixed(1)} kg` : "-"}
                      </span>
                      <br />
                      <span>
                        Pasca: {session.postWeight ? `${(session.postWeight / 1000).toFixed(1)} kg` : "-"}
                      </span>
                    </div>
                  </div>

                  {/* BP */}
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">Tekanan Darah</span>
                    </div>
                    <div className="text-sm">
                      <span>
                        Pra: {session.preSystolic || "-"}/{session.preDiastolic || "-"}
                      </span>
                      <br />
                      <span>
                        Pasca: {session.postSystolic || "-"}/{session.postDiastolic || "-"}
                      </span>
                    </div>
                  </div>

                  {/* UF */}
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Droplets className="h-4 w-4" />
                      <span className="text-sm">Ultrafiltrasi</span>
                    </div>
                    <div className="text-sm">
                      <span>
                        Target: {session.ufGoal ? `${(session.ufGoal / 1000).toFixed(1)} L` : "-"}
                      </span>
                      <br />
                      <span>
                        Aktual: {session.actualUf ? `${(session.actualUf / 1000).toFixed(1)} L` : "-"}
                      </span>
                    </div>
                  </div>

                  {/* HD Params */}
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">Parameter HD</span>
                    </div>
                    <div className="text-sm">
                      <span>QB: {session.bloodFlow || "-"} ml/min</span>
                      <br />
                      <span>Durasi: {session.duration || "-"} menit</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/portal/sessions/${session.id}`}>Lihat Detail</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Sebelumnya
              </Button>
              <span className="px-4 py-2 text-sm">
                Halaman {page} dari {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === data.meta.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
