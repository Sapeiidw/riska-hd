"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FlaskConical, ArrowLeft, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";

import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
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
import LineChartCustom from "@/components/chart/LineChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const res = await fetch(`/api/portal/labs?${params}`);
  if (!res.ok) throw new Error("Failed to fetch labs");
  return res.json();
}

export default function PatientLabsPage() {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const { data, isLoading, error } = useQuery({
    queryKey: ["portal-labs", page, startDate, endDate],
    queryFn: () => fetchLabs(params),
  });

  const labs: Lab[] = data?.data || [];
  const labsChronological = [...labs].reverse();

  const formatValue = (value: number | null, multiplier: number = 10) => {
    if (value === null) return "-";
    return (value / multiplier).toFixed(1);
  };

  // Prepare chart data - filter out entries with null values for each metric
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/portal">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title="Hasil Laboratorium"
          description="Riwayat pemeriksaan laboratorium Anda"
        />
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-wrap items-end justify-between gap-4">
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
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "chart")}>
          <TabsList>
            <TabsTrigger value="table">Tabel</TabsTrigger>
            <TabsTrigger value="chart">Grafik</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
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
      ) : viewMode === "table" ? (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Tanggal</th>
                    <th className="text-center py-3 px-2 font-medium">Hb (g/dL)</th>
                    <th className="text-center py-3 px-2 font-medium">Ureum</th>
                    <th className="text-center py-3 px-2 font-medium">Kreatinin</th>
                    <th className="text-center py-3 px-2 font-medium">K</th>
                    <th className="text-center py-3 px-2 font-medium">Na</th>
                    <th className="text-center py-3 px-2 font-medium">Ca</th>
                    <th className="text-center py-3 px-2 font-medium">P</th>
                    <th className="text-center py-3 px-2 font-medium">Albumin</th>
                    <th className="text-center py-3 px-2 font-medium">Kt/V</th>
                    <th className="text-center py-3 px-2 font-medium">URR</th>
                  </tr>
                </thead>
                <tbody>
                  {labs.map((lab) => (
                    <tr key={lab.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">
                        {format(new Date(lab.testDate), "dd MMM yyyy")}
                      </td>
                      <td className="text-center py-3 px-2">{formatValue(lab.hemoglobin)}</td>
                      <td className="text-center py-3 px-2">{lab.ureum || "-"}</td>
                      <td className="text-center py-3 px-2">{formatValue(lab.creatinine)}</td>
                      <td className="text-center py-3 px-2">{formatValue(lab.potassium)}</td>
                      <td className="text-center py-3 px-2">{lab.sodium || "-"}</td>
                      <td className="text-center py-3 px-2">{formatValue(lab.calcium)}</td>
                      <td className="text-center py-3 px-2">{formatValue(lab.phosphorus)}</td>
                      <td className="text-center py-3 px-2">{formatValue(lab.albumin)}</td>
                      <td className="text-center py-3 px-2">{formatValue(lab.ktv, 100)}</td>
                      <td className="text-center py-3 px-2">{formatValue(lab.urr)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hemoglobin Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Hemoglobin (Hb)</CardTitle>
              <CardDescription>Target: 10-12 g/dL</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              <LineChartCustom data={hbChartData} title="Hemoglobin (g/dL)" />
            </CardContent>
          </Card>

          {/* Kidney Function Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Fungsi Ginjal</CardTitle>
              <CardDescription>Ureum & Kreatinin</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              <LineChartCustom data={kidneyChartData} title="Ureum & Kreatinin" />
            </CardContent>
          </Card>

          {/* Adequacy Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Adekuasi Dialisis</CardTitle>
              <CardDescription>Kt/V target ≥ 1.2 • URR target ≥ 65%</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              <LineChartCustom data={adequacyChartData} title="Adekuasi Dialisis" />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
