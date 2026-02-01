"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { Users, Stethoscope, Heart, MonitorCog, Building2, Activity, Info } from "lucide-react";
import { StatCard } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api/axios";

async function fetchDashboardStats() {
  const [patients, doctors, nurses, machines, rooms] = await Promise.all([
    api.get("/api/master/patients?limit=1").then(r => r.data).catch(() => ({ meta: { total: 0 } })),
    api.get("/api/master/doctors?limit=1").then(r => r.data).catch(() => ({ meta: { total: 0 } })),
    api.get("/api/master/nurses?limit=1").then(r => r.data).catch(() => ({ meta: { total: 0 } })),
    api.get("/api/master/machines?limit=1").then(r => r.data).catch(() => ({ meta: { total: 0 } })),
    api.get("/api/master/rooms?limit=1").then(r => r.data).catch(() => ({ meta: { total: 0 } })),
  ]);

  return {
    patients: patients?.meta?.total || 0,
    doctors: doctors?.meta?.total || 0,
    nurses: nurses?.meta?.total || 0,
    machines: machines?.meta?.total || 0,
    rooms: rooms?.meta?.total || 0,
  };
}

function RiskaAbbreviation() {
  return (
    <span className="text-sm">
      <span className="font-bold text-sky-600">R</span>
      <span className="text-gray-600">uang </span>
      <span className="font-bold text-sky-600">I</span>
      <span className="text-gray-600">nformasi & </span>
      <span className="font-bold text-sky-600">S</span>
      <span className="text-gray-600">istem </span>
      <span className="font-bold text-sky-600">K</span>
      <span className="text-gray-600">elola </span>
      <span className="font-bold text-sky-600">A</span>
      <span className="text-gray-600">ktivitas </span>
      <span className="font-bold text-sky-600">H</span>
      <span className="text-gray-600">emo</span>
      <span className="font-bold text-sky-600">d</span>
      <span className="text-gray-600">ialisa</span>
    </span>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  return (
    <div className="col-span-12 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">
          Selamat datang{session?.user?.name ? `, ${session.user.name}` : ""}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Pasien"
          value={stats?.patients || 0}
          description="Pasien terdaftar"
          icon={Heart}
        />
        <StatCard
          title="Dokter"
          value={stats?.doctors || 0}
          description="Dokter aktif"
          icon={Stethoscope}
        />
        <StatCard
          title="Perawat"
          value={stats?.nurses || 0}
          description="Perawat aktif"
          icon={Users}
        />
        <StatCard
          title="Mesin HD"
          value={stats?.machines || 0}
          description="Unit tersedia"
          icon={MonitorCog}
        />
        <StatCard
          title="Ruangan"
          value={stats?.rooms || 0}
          description="Ruang HD"
          icon={Building2}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Aktivitas Hari Ini
            </CardTitle>
            <CardDescription>
              Ringkasan aktivitas HD hari ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Belum ada sesi HD hari ini</p>
              <p className="text-sm">Modul HD Session akan tersedia di fase berikutnya</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sky-50 to-cyan-50 border-sky-100">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-sky-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-sky-500/30">
                RH
              </div>
              <div>
                <CardTitle className="bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500 bg-clip-text text-transparent">
                  RISKA HD
                </CardTitle>
                <CardDescription className="mt-1">
                  <RiskaAbbreviation />
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-white/70 border border-sky-100">
              <div className="flex items-center gap-2 text-sky-700 mb-2">
                <Info className="h-4 w-4" />
                <span className="font-semibold text-sm">Tentang RISKA HD</span>
              </div>
              <p className="text-sm text-gray-600">
                Platform digital terintegrasi untuk manajemen layanan hemodialisa yang menghubungkan
                dokter, perawat, dan pasien dalam satu ekosistem yang terstruktur dan aman.
              </p>
            </div>
            <div className="grid gap-2">
              <h3 className="font-semibold text-sm text-gray-700">Modul yang tersedia:</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-white">Master Pasien</Badge>
                <Badge variant="secondary" className="bg-white">Master Dokter</Badge>
                <Badge variant="secondary" className="bg-white">Master Perawat</Badge>
                <Badge variant="secondary" className="bg-white">Master Mesin HD</Badge>
                <Badge variant="secondary" className="bg-white">Master Ruangan</Badge>
                <Badge variant="secondary" className="bg-white">Protokol HD</Badge>
              </div>
            </div>
            <div className="grid gap-2">
              <h3 className="font-semibold text-sm text-gray-400">Akan datang:</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-gray-400 border-gray-200">Order HD</Badge>
                <Badge variant="outline" className="text-gray-400 border-gray-200">Monitoring</Badge>
                <Badge variant="outline" className="text-gray-400 border-gray-200">Laporan</Badge>
                <Badge variant="outline" className="text-gray-400 border-gray-200">Edukasi</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
