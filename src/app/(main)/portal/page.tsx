"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Calendar,
  FlaskConical,
  Heart,
  Scale,
  TrendingUp,
  User,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";
import api from "@/lib/api/axios";

import { PageHeader } from "@/components/shared";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LineChartCustom from "@/components/chart/LineChart";

async function fetchPortalData() {
  const [profileRes, trendsRes] = await Promise.all([
    api.get("/api/portal/profile"),
    api.get("/api/portal/trends?sessionsLimit=10&labsLimit=5"),
  ]);

  return {
    profile: profileRes.data.data,
    trends: trendsRes.data.data,
  };
}

export default function PatientPortalPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["portal-dashboard"],
    queryFn: fetchPortalData,
  });

  if (isLoading) {
    return (
      <div className="col-span-12 p-6 space-y-6">
        <div className="h-12 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-12 p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Gagal memuat data</p>
            <p className="text-sm text-muted-foreground mt-2">
              Pastikan akun Anda terhubung dengan data pasien
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, trends } = data!;

  // Prepare chart data
  const weightChartData = trends.sessions.map((s: {
    sessionDate: string;
    preWeight: number | null;
    postWeight: number | null;
  }) => ({
    label: format(new Date(s.sessionDate), "dd/MM"),
    "BB Pra (kg)": s.preWeight ? s.preWeight / 1000 : null,
    "BB Pasca (kg)": s.postWeight ? s.postWeight / 1000 : null,
  }));

  const bpChartData = trends.sessions.map((s: {
    sessionDate: string;
    preSystolic: number | null;
    preDiastolic: number | null;
    postSystolic: number | null;
    postDiastolic: number | null;
  }) => ({
    label: format(new Date(s.sessionDate), "dd/MM"),
    "Sistolik Pra": s.preSystolic,
    "Diastolik Pra": s.preDiastolic,
    "Sistolik Pasca": s.postSystolic,
    "Diastolik Pasca": s.postDiastolic,
  }));

  return (
    <div className="col-span-12 space-y-6">
      <PageHeader
        title={`Selamat datang, ${profile.profile.name}`}
        description="Portal Pasien Hemodialisa"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sesi HD"
          value={profile.stats.totalSessions}
          icon={Activity}
        />
        <StatCard
          title="Sesi Terakhir"
          value={
            profile.stats.lastSessionDate
              ? format(new Date(profile.stats.lastSessionDate), "dd MMM yyyy")
              : "-"
          }
          icon={Calendar}
        />
        <StatCard
          title="BB Kering"
          value={
            profile.profile.dryWeight
              ? `${(profile.profile.dryWeight / 1000).toFixed(1)} kg`
              : "-"
          }
          icon={Scale}
        />
        <StatCard
          title="Jadwal Mendatang"
          value={trends.upcomingSchedules.length}
          icon={Clock}
        />
      </div>

      {/* Quick Links & Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/portal/sessions">
                <Activity className="h-4 w-4 mr-2" />
                Lihat Riwayat Sesi
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/portal/labs">
                <FlaskConical className="h-4 w-4 mr-2" />
                Lihat Hasil Lab
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/informasi">
                <TrendingUp className="h-4 w-4 mr-2" />
                Ruang Informasi
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Profile Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profil Anda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">No. Rekam Medis</p>
                <p className="font-medium">{profile.profile.medicalRecordNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tanggal Lahir</p>
                <p className="font-medium">
                  {format(new Date(profile.profile.dateOfBirth), "dd MMMM yyyy", {
                    locale: localeId,
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Golongan Darah</p>
                <p className="font-medium">{profile.profile.bloodType || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Diagnosis Utama</p>
                <p className="font-medium">{profile.profile.primaryDiagnosis || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Akses Vaskular</p>
                <p className="font-medium">
                  {profile.profile.vascularAccessType?.toUpperCase() || "-"}
                  {profile.profile.vascularAccessSite
                    ? ` (${profile.profile.vascularAccessSite})`
                    : ""}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Dokter Penanggung Jawab</p>
                <p className="font-medium">{profile.profile.doctorName || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Schedules */}
      {trends.upcomingSchedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Jadwal Mendatang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trends.upcomingSchedules.map((schedule: {
                id: string;
                scheduleDate: string;
                shiftName: string;
                shiftStartTime: string;
                shiftEndTime: string;
                status: string;
              }) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {format(new Date(schedule.scheduleDate), "EEEE, dd MMMM yyyy", {
                        locale: localeId,
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {schedule.shiftName} • {schedule.shiftStartTime} - {schedule.shiftEndTime}
                    </p>
                  </div>
                  <Badge variant={schedule.status === "confirmed" ? "default" : "outline"}>
                    {schedule.status === "confirmed" ? "Dikonfirmasi" : "Terjadwal"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {trends.sessions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weight Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Tren Berat Badan
              </CardTitle>
              <CardDescription>
                BB Kering: {trends.dryWeight ? `${(trends.dryWeight / 1000).toFixed(1)} kg` : "-"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              <LineChartCustom
                data={weightChartData}
                title="Tren BB (kg)"
              />
            </CardContent>
          </Card>

          {/* BP Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Tren Tekanan Darah
              </CardTitle>
              <CardDescription>Sistolik/Diastolik (mmHg)</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              <LineChartCustom
                data={bpChartData}
                title="Tren TD (mmHg)"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Labs */}
      {trends.labs.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Hasil Lab Terbaru
              </CardTitle>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal/labs">Lihat Semua</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Tanggal</th>
                    <th className="text-center py-2 font-medium">Hb</th>
                    <th className="text-center py-2 font-medium">Ureum</th>
                    <th className="text-center py-2 font-medium">Kreatinin</th>
                    <th className="text-center py-2 font-medium">K</th>
                    <th className="text-center py-2 font-medium">Kt/V</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.labs.map((lab: {
                    id: string;
                    testDate: string;
                    hemoglobin: number | null;
                    ureum: number | null;
                    creatinine: number | null;
                    potassium: number | null;
                    ktv: number | null;
                  }) => (
                    <tr key={lab.id} className="border-b">
                      <td className="py-2">
                        {format(new Date(lab.testDate), "dd MMM yyyy")}
                      </td>
                      <td className="text-center py-2">
                        {lab.hemoglobin ? (lab.hemoglobin / 10).toFixed(1) : "-"}
                      </td>
                      <td className="text-center py-2">{lab.ureum || "-"}</td>
                      <td className="text-center py-2">
                        {lab.creatinine ? (lab.creatinine / 10).toFixed(1) : "-"}
                      </td>
                      <td className="text-center py-2">
                        {lab.potassium ? (lab.potassium / 10).toFixed(1) : "-"}
                      </td>
                      <td className="text-center py-2">
                        {lab.ktv ? (lab.ktv / 100).toFixed(2) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
