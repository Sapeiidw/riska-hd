"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  FlaskConical,
  ArrowLeft,
  Calendar,
  LayoutGrid,
  List,
  LineChart,
  Search,
  Droplets,
  Heart,
  Activity,
  Pill,
  TestTube,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";
import api from "@/lib/api/axios";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable } from "@/components/data-table/data-table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ColumnDef } from "@tanstack/react-table";
import LineChartCustom from "@/components/chart/LineChart";

type Lab = {
  id: string;
  testDate: string;
  reportDate: string | null;
  hemoglobin: number | null;
  ureum: number | null;
  creatinine: number | null;
  potassium: number | null;
  sodium: number | null;
  calcium: number | null;
  phosphorus: number | null;
  albumin: number | null;
  uricAcid: number | null;
  ktv: number | null;
  urr: number | null;
  labSource: string | null;
  notes: string | null;
};

async function fetchLabs(params: URLSearchParams) {
  const res = await api.get(`/api/portal/labs?${params}`);
  return res.data;
}

const formatValue = (value: number | null, multiplier: number = 10) => {
  if (value === null) return "-";
  return (value / multiplier).toFixed(1);
};

// Table columns definition
const columns: ColumnDef<Lab>[] = [
  {
    accessorKey: "testDate",
    header: "Tanggal",
    cell: ({ row }) => (
      <div className="font-medium">
        {format(new Date(row.original.testDate), "dd MMM yyyy", { locale: localeId })}
      </div>
    ),
  },
  {
    accessorKey: "hemoglobin",
    header: () => <div className="text-center">Hb (g/dL)</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {formatValue(row.original.hemoglobin)}
      </div>
    ),
  },
  {
    accessorKey: "ureum",
    header: () => <div className="text-center">Ureum</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.ureum || "-"}</div>
    ),
  },
  {
    accessorKey: "creatinine",
    header: () => <div className="text-center">Kreatinin</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatValue(row.original.creatinine)}</div>
    ),
  },
  {
    accessorKey: "potassium",
    header: () => <div className="text-center">K</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatValue(row.original.potassium)}</div>
    ),
  },
  {
    accessorKey: "sodium",
    header: () => <div className="text-center">Na</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.sodium || "-"}</div>
    ),
  },
  {
    accessorKey: "ktv",
    header: () => <div className="text-center">Kt/V</div>,
    cell: ({ row }) => {
      const ktv = row.original.ktv;
      const value = ktv ? (ktv / 100).toFixed(2) : "-";
      const isGood = ktv && ktv >= 120;
      return (
        <div className="text-center">
          <Badge variant={isGood ? "success" : ktv ? "warning" : "outline"} className="font-medium">
            {value}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "urr",
    header: () => <div className="text-center">URR (%)</div>,
    cell: ({ row }) => {
      const urr = row.original.urr;
      const value = urr ? (urr / 10).toFixed(1) : "-";
      const isGood = urr && urr >= 650;
      return (
        <div className="text-center">
          <Badge variant={isGood ? "success" : urr ? "warning" : "outline"} className="font-medium">
            {value}%
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        className="text-sky-600 hover:text-sky-700 hover:bg-sky-50"
        asChild
      >
        <Link href={`/portal/labs/${row.original.id}`}>Detail</Link>
      </Button>
    ),
  },
];

function LabCard({ lab }: { lab: Lab }) {
  const ktvValue = lab.ktv ? (lab.ktv / 100).toFixed(2) : null;
  const urrValue = lab.urr ? (lab.urr / 10).toFixed(1) : null;
  const isKtvGood = lab.ktv && lab.ktv >= 120;
  const isUrrGood = lab.urr && lab.urr >= 650;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all hover:border-sky-200 group">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-50 bg-gradient-to-r from-sky-50/50 to-cyan-50/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-100">
            <Calendar className="h-3.5 w-3.5 text-sky-600" />
          </div>
          <span className="font-semibold text-sm text-gray-700">
            {format(new Date(lab.testDate), "dd MMM yyyy", { locale: localeId })}
          </span>
        </div>
        {lab.labSource && (
          <Badge variant="outline" className="text-xs">
            {lab.labSource}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Hemoglobin */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
            <Droplets className="h-3.5 w-3.5 text-red-400 shrink-0" />
            <div className="text-xs min-w-0">
              <span className="text-gray-400">Hb:</span>{" "}
              <span className="font-semibold text-gray-700">
                {formatValue(lab.hemoglobin)} g/dL
              </span>
            </div>
          </div>

          {/* Ureum */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
            <TestTube className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <div className="text-xs min-w-0">
              <span className="text-gray-400">Ureum:</span>{" "}
              <span className="font-semibold text-gray-700">
                {lab.ureum || "-"}
              </span>
            </div>
          </div>

          {/* Creatinine */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
            <Activity className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            <div className="text-xs min-w-0">
              <span className="text-gray-400">Cr:</span>{" "}
              <span className="font-semibold text-gray-700">
                {formatValue(lab.creatinine)}
              </span>
            </div>
          </div>

          {/* Potassium */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
            <Pill className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <div className="text-xs min-w-0">
              <span className="text-gray-400">K:</span>{" "}
              <span className="font-semibold text-gray-700">
                {formatValue(lab.potassium)}
              </span>
            </div>
          </div>
        </div>

        {/* Adequacy Indicators */}
        {(ktvValue || urrValue) && (
          <div className="flex items-center gap-2 pt-1">
            {ktvValue && (
              <Badge
                variant={isKtvGood ? "success" : "warning"}
                className="text-xs"
              >
                Kt/V: {ktvValue}
              </Badge>
            )}
            {urrValue && (
              <Badge
                variant={isUrrGood ? "success" : "warning"}
                className="text-xs"
              >
                URR: {urrValue}%
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs h-8 border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300"
          asChild
        >
          <Link href={`/portal/labs/${lab.id}`}>Lihat Detail</Link>
        </Button>
      </div>
    </div>
  );
}

export default function PatientLabsPage() {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table" | "chart">("grid");

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const { data, isLoading, error } = useQuery({
    queryKey: ["portal-labs", page, startDate, endDate],
    queryFn: () => fetchLabs(params),
  });

  const labs: Lab[] = data?.data || [];
  const labsChronological = [...labs].reverse();

  // Prepare chart data
  const hbChartData = labsChronological
    .filter((lab) => lab.hemoglobin !== null)
    .map((lab) => ({
      label: format(new Date(lab.testDate), "dd/MM"),
      Hemoglobin: lab.hemoglobin! / 10,
    }));

  const kidneyChartData = labsChronological
    .filter((lab) => lab.ureum !== null || lab.creatinine !== null)
    .map((lab) => ({
      label: format(new Date(lab.testDate), "dd/MM"),
      Ureum: lab.ureum ?? 0,
      Kreatinin: lab.creatinine ? lab.creatinine / 10 : 0,
    }));

  const adequacyChartData = labsChronological
    .filter((lab) => lab.ktv !== null || lab.urr !== null)
    .map((lab) => ({
      label: format(new Date(lab.testDate), "dd/MM"),
      "Kt/V": lab.ktv ? lab.ktv / 100 : 0,
      "URR (%)": lab.urr ? lab.urr / 10 : 0,
    }));

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
                  <FlaskConical className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800">
                  Hasil Laboratorium
                </h1>
              </div>
              <p className="text-gray-500 max-w-lg">
                Pantau hasil pemeriksaan laboratorium Anda. Lihat tren nilai lab dan evaluasi adekuasi dialisis.
              </p>
              {data?.meta && (
                <div className="flex items-center gap-4 pt-1">
                  <div className="inline-flex items-center gap-2 text-sm bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-sky-100">
                    <div className="h-2 w-2 rounded-full bg-sky-500" />
                    <span className="text-gray-500">
                      Total <span className="font-semibold text-sky-600">{data.meta.total}</span> hasil lab
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
                placeholder="Cari hasil lab..."
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
                <DatePicker
                  value={startDate}
                  onChange={(v) => {
                    setStartDate(v);
                    setPage(1);
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Sampai Tanggal</Label>
                <DatePicker
                  value={endDate}
                  onChange={(v) => {
                    setEndDate(v);
                    setPage(1);
                  }}
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
                onValueChange={(value) => value && setViewMode(value as "grid" | "table" | "chart")}
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
                <ToggleGroupItem
                  value="chart"
                  aria-label="Chart view"
                  className="data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-sky-600 px-3 rounded-lg"
                >
                  <LineChart className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="p-3 border-b border-gray-50 bg-gradient-to-r from-sky-50/50 to-cyan-50/50">
                  <div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="p-3 space-y-3">
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
        ) : viewMode === "table" ? (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg p-4">
            <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`h-80 bg-gray-100 animate-pulse rounded-2xl ${i === 2 ? "lg:col-span-2" : ""}`} />
            ))}
          </div>
        )
      ) : error ? (
        <EmptyState
          title="Gagal memuat data"
          description="Terjadi kesalahan saat memuat hasil lab"
        />
      ) : labs.length === 0 ? (
        <EmptyState
          title="Belum ada hasil lab"
          description="Anda belum memiliki hasil laboratorium"
        />
      ) : viewMode === "grid" ? (
        <>
          {/* Grid View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {labs.map((lab) => (
              <LabCard key={lab.id} lab={lab} />
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
      ) : viewMode === "table" ? (
        /* Table View with DataTable */
        <DataTable
          columns={columns}
          data={labs}
          meta={data?.meta}
          onPageChange={setPage}
        />
      ) : (
        /* Chart View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hemoglobin Chart */}
          <Card className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <Droplets className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-gray-800">Hemoglobin (Hb)</CardTitle>
                  <CardDescription>Target: 10-12 g/dL</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[280px] pt-4">
              {hbChartData.length > 0 ? (
                <LineChartCustom data={hbChartData} title="Hemoglobin (g/dL)" />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Belum ada data hemoglobin
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kidney Function Chart */}
          <Card className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <TestTube className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-gray-800">Fungsi Ginjal</CardTitle>
                  <CardDescription>Ureum & Kreatinin</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[280px] pt-4">
              {kidneyChartData.length > 0 ? (
                <LineChartCustom data={kidneyChartData} title="Ureum & Kreatinin" />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Belum ada data fungsi ginjal
                </div>
              )}
            </CardContent>
          </Card>

          {/* Adequacy Chart */}
          <Card className="lg:col-span-2 overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-sky-50 to-cyan-50 border-b border-sky-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-100">
                  <Activity className="h-4 w-4 text-sky-500" />
                </div>
                <div>
                  <CardTitle className="text-gray-800">Adekuasi Dialisis</CardTitle>
                  <CardDescription>Kt/V target ≥ 1.2 • URR target ≥ 65%</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[280px] pt-4">
              {adequacyChartData.length > 0 ? (
                <LineChartCustom data={adequacyChartData} title="Adekuasi Dialisis" />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Belum ada data adekuasi dialisis
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
