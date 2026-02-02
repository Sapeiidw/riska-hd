"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Activity,
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  Eye,
  Heart,
  LayoutGrid,
  List,
  Scale,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";
import api from "@/lib/api/axios";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable } from "@/components/data-table/data-table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ColumnDef } from "@tanstack/react-table";

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

const columns: ColumnDef<Session>[] = [
  {
    accessorKey: "sessionDate",
    header: "Tanggal",
    cell: ({ row }) => {
      const session = row.original;
      return (
        <div>
          <div className="font-medium">
            {format(new Date(session.sessionDate), "dd MMM yyyy", {
              locale: localeId,
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            {session.startTime
              ? format(new Date(session.startTime), "HH:mm")
              : "-"}{" "}
            - {session.endTime ? format(new Date(session.endTime), "HH:mm") : "-"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "shiftName",
    header: "Shift",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "completed" ? "success" : "warning"}>
          {status === "completed" ? "Selesai" : "Berlangsung"}
        </Badge>
      );
    },
  },
  {
    id: "weight",
    header: "Berat (kg)",
    cell: ({ row }) => {
      const session = row.original;
      return (
        <div className="text-sm">
          <div>
            <span className="text-muted-foreground">Pra:</span>{" "}
            {session.preWeight ? (session.preWeight / 1000).toFixed(1) : "-"}
          </div>
          <div>
            <span className="text-muted-foreground">Pasca:</span>{" "}
            {session.postWeight ? (session.postWeight / 1000).toFixed(1) : "-"}
          </div>
        </div>
      );
    },
  },
  {
    id: "bp_pre",
    header: "TD Pra",
    cell: ({ row }) => {
      const session = row.original;
      return `${session.preSystolic || "-"}/${session.preDiastolic || "-"}`;
    },
  },
  {
    id: "bp_post",
    header: "TD Pasca",
    cell: ({ row }) => {
      const session = row.original;
      return `${session.postSystolic || "-"}/${session.postDiastolic || "-"}`;
    },
  },
  {
    id: "uf",
    header: "UF (L)",
    cell: ({ row }) => {
      const session = row.original;
      return (
        <div className="text-sm">
          <div>
            <span className="text-muted-foreground">T:</span>{" "}
            {session.ufGoal ? (session.ufGoal / 1000).toFixed(1) : "-"}
          </div>
          <div>
            <span className="text-muted-foreground">A:</span>{" "}
            {session.actualUf ? (session.actualUf / 1000).toFixed(1) : "-"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "bloodFlow",
    header: "QB",
    cell: ({ row }) => {
      const qb = row.getValue("bloodFlow") as number | null;
      return qb ? `${qb}` : "-";
    },
  },
  {
    accessorKey: "duration",
    header: "Durasi",
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number | null;
      return duration ? `${duration}m` : "-";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const session = row.original;
      return (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/portal/sessions/${session.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      );
    },
  },
];

async function fetchSessions(params: URLSearchParams) {
  const res = await api.get(`/api/portal/sessions?${params}`);
  return res.data;
}

function SessionCard({ session }: { session: Session }) {
  const weightChange = session.preWeight && session.postWeight
    ? ((session.preWeight - session.postWeight) / 1000).toFixed(1)
    : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all hover:border-sky-200 group">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-50 bg-gradient-to-r from-sky-50/50 to-cyan-50/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-100">
            <Calendar className="h-3.5 w-3.5 text-sky-600" />
          </div>
          <span className="font-semibold text-sm text-gray-700">
            {format(new Date(session.sessionDate), "dd MMM yyyy", {
              locale: localeId,
            })}
          </span>
        </div>
        <Badge
          variant={session.status === "completed" ? "success" : "warning"}
          className="text-xs"
        >
          {session.status === "completed" ? "Selesai" : "Berlangsung"}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Time & Shift */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {session.shiftName} •{" "}
            {session.startTime
              ? format(new Date(session.startTime), "HH:mm")
              : "-"}{" "}
            - {session.endTime ? format(new Date(session.endTime), "HH:mm") : "-"}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Weight */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
            <Scale className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <div className="text-xs min-w-0">
              <span className="text-gray-400">BB:</span>{" "}
              <span className="font-semibold text-gray-700">
                {session.preWeight ? (session.preWeight / 1000).toFixed(1) : "-"}
              </span>
              {weightChange && (
                <span className="text-emerald-600 ml-1 font-medium">(-{weightChange})</span>
              )}
            </div>
          </div>

          {/* BP */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
            <Heart className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <div className="text-xs min-w-0 truncate">
              <span className="font-semibold text-gray-700">
                {session.preSystolic || "-"}/{session.preDiastolic || "-"}
              </span>
            </div>
          </div>

          {/* UF */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
            <Droplets className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <div className="text-xs min-w-0">
              <span className="text-gray-400">UF:</span>{" "}
              <span className="font-semibold text-gray-700">
                {session.actualUf ? (session.actualUf / 1000).toFixed(1) : "-"}L
              </span>
            </div>
          </div>

          {/* QB */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
            <Activity className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <div className="text-xs min-w-0">
              <span className="text-gray-400">QB:</span>{" "}
              <span className="font-semibold text-gray-700">{session.bloodFlow || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 pb-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs h-8 border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300"
          asChild
        >
          <Link href={`/portal/sessions/${session.id}`}>Lihat Detail</Link>
        </Button>
      </div>
    </div>
  );
}

export default function PatientSessionsPage() {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (search) params.set("search", search);

  const { data, isLoading, error } = useQuery({
    queryKey: ["portal-sessions", page, startDate, endDate, search],
    queryFn: () => fetchSessions(params),
  });

  const sessions: Session[] = data?.data || [];

  return (
    <div className="col-span-12 space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-cyan-50 to-white border border-sky-100 shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMjAgMjBjMC0xMS4wNDYgOC45NTQtMjAgMjAtMjB2NDBoLTQwYzExLjA0NiAwIDIwLTguOTU0IDIwLTIweiIgZmlsbD0iIzBFQTVFOSIgZmlsbC1vcGFjaXR5PSIuMDMiLz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 bg-white/80 backdrop-blur-sm border-sky-200 hover:bg-sky-50 hover:border-sky-300"
              asChild
            >
              <Link href="/portal">
                <ArrowLeft className="h-4 w-4 text-sky-600" />
              </Link>
            </Button>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-lg shadow-sky-500/25">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800">
                  Riwayat Sesi HD
                </h1>
              </div>
              <p className="text-gray-500 max-w-lg">
                Lihat semua riwayat sesi hemodialisa Anda. Pantau perkembangan kesehatan dan parameter dialisis dari waktu ke waktu.
              </p>
              {data?.meta && (
                <div className="flex items-center gap-4 pt-1">
                  <div className="inline-flex items-center gap-2 text-sm bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-sky-100">
                    <div className="h-2 w-2 rounded-full bg-sky-500" />
                    <span className="text-gray-500">
                      Total <span className="font-semibold text-sky-600">{data.meta.total}</span> sesi
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
        <div className="flex flex-col gap-4">
          {/* Search - Full width on top for table view */}
          {viewMode === "table" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari sesi..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 border-gray-200 focus:border-sky-300 focus:ring-sky-200"
              />
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Dari Tanggal</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-[160px] border-gray-200 focus:border-sky-300 focus:ring-sky-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Sampai Tanggal</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-[160px] border-gray-200 focus:border-sky-300 focus:ring-sky-200"
                />
              </div>
              {(startDate || endDate || search) && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setSearch("");
                      setPage(1);
                    }}
                    className="text-gray-500 hover:text-sky-600 hover:bg-sky-50"
                  >
                    Reset
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">Tampilan:</span>
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => value && setViewMode(value as "grid" | "table")}
                className="bg-gray-100 rounded-xl p-1"
              >
                <ToggleGroupItem
                  value="grid"
                  aria-label="Grid view"
                  className="data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-sky-600 px-3 rounded-lg"
                >
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="table"
                  aria-label="Table view"
                  className="data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-sky-600 px-3 rounded-lg"
                >
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="p-3 border-b border-gray-50 bg-gradient-to-r from-sky-50/50 to-cyan-50/50">
                  <div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="p-3 space-y-3">
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                  <div className="grid grid-cols-2 gap-2">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-10 bg-gray-100 animate-pulse rounded-lg" />
                    ))}
                  </div>
                </div>
                <div className="px-3 pb-3">
                  <div className="h-8 bg-gray-100 animate-pulse rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg p-4">
            <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
          </div>
        )
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
      ) : viewMode === "grid" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>

          {/* Pagination for Grid */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 px-2">
              <p className="text-sm text-gray-500">
                Menampilkan{" "}
                <span className="font-semibold text-gray-700">
                  {((data.meta.page || 1) - 1) * (data.meta.limit || 20) + 1}
                </span>
                {" - "}
                <span className="font-semibold text-gray-700">
                  {Math.min((data.meta.page || 1) * (data.meta.limit || 20), data.meta.total || 0)}
                </span>
                {" dari "}
                <span className="font-semibold text-gray-700">{data.meta.total || 0}</span>
                {" data"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 h-9 px-4 shadow-sm"
                >
                  Sebelumnya
                </button>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl">
                  <span className="text-sm text-gray-500">Halaman</span>
                  <span className="text-sm font-bold text-sky-600">{page}</span>
                  <span className="text-sm text-gray-500">dari</span>
                  <span className="text-sm font-bold text-sky-600">{data.meta.totalPages}</span>
                </div>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.meta.totalPages}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 h-9 px-4 shadow-sm"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Table View with DataTable */
        <DataTable
          columns={columns}
          data={sessions}
          meta={data?.meta}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
