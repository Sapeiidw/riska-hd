import { db } from "@/lib/db";
import {
  kenaikan_pangkat,
  opd,
  status_dokumen_wajib,
  status_pegawai,
} from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  Building2,
  ArrowRight,
  FileCheck,
  FileX,
} from "lucide-react";

export default async function DashboardPage() {
  // Get all OPD
  const opdList = await db.select().from(opd).orderBy(opd.nama);

  // Total pegawai
  const [totalPegawai] = await db
    .select({ count: sql<number>`count(*)` })
    .from(status_pegawai);

  // Total kenaikan pangkat
  const [totalKenaikanPangkat] = await db
    .select({ total: sql<number>`coalesce(sum(${kenaikan_pangkat.value}), 0)` })
    .from(kenaikan_pangkat);

  // Dokumen stats
  const [dokumenStats] = await db
    .select({
      berhasil: sql<number>`coalesce(sum(${status_dokumen_wajib.berhasil}), 0)`,
      tidak_berhasil: sql<number>`coalesce(sum(${status_dokumen_wajib.tidak_berhasil}), 0)`,
    })
    .from(status_dokumen_wajib);

  // Get stats per OPD
  const opdStats = await db
    .select({
      id: opd.id,
      nama: opd.nama,
      singkatan: opd.singkatan,
      total_pegawai: sql<number>`count(distinct ${status_pegawai.id})`,
      total_kenaikan: sql<number>`coalesce(sum(distinct ${kenaikan_pangkat.value}), 0)`,
    })
    .from(opd)
    .leftJoin(status_pegawai, eq(status_pegawai.id_opd, opd.id))
    .leftJoin(kenaikan_pangkat, eq(kenaikan_pangkat.id_opd, opd.id))
    .groupBy(opd.id, opd.nama, opd.singkatan)
    .orderBy(opd.nama);

  const stats = [
    {
      label: "Total Pegawai",
      value: totalPegawai.count,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-500",
      bgLight: "bg-blue-50",
    },
    {
      label: "Kenaikan Pangkat",
      value: totalKenaikanPangkat.total,
      icon: TrendingUp,
      color: "bg-green-500",
      textColor: "text-green-500",
      bgLight: "bg-green-50",
    },
    {
      label: "Dokumen Lengkap",
      value: dokumenStats.berhasil,
      icon: FileCheck,
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
      bgLight: "bg-emerald-50",
    },
    {
      label: "Dokumen Belum Lengkap",
      value: dokumenStats.tidak_berhasil,
      icon: FileX,
      color: "bg-amber-500",
      textColor: "text-amber-500",
      bgLight: "bg-amber-50",
    },
    {
      label: "Total OPD",
      value: opdList.length,
      icon: Building2,
      color: "bg-purple-500",
      textColor: "text-purple-500",
      bgLight: "bg-purple-50",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="col-span-full">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Ringkasan data kenaikan pangkat seluruh OPD
        </p>
      </div>

      {/* Stats Cards */}
      <div className="col-span-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 shadow-sm border border-slate-100"
          >
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.bgLight} ${stat.textColor} mb-3`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* OPD List */}
      <div className="col-span-full">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">
              Daftar OPD
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Pilih OPD untuk melihat detail data
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {opdStats.map((item) => (
              <Link
                key={item.id}
                href={`/${item.singkatan.toLowerCase()}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                    {item.singkatan.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.nama}
                    </h3>
                    <p className="text-sm text-slate-500">{item.singkatan}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-slate-900">
                      {item.total_pegawai}
                    </div>
                    <div className="text-xs text-slate-500">Pegawai</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-slate-900">
                      {item.total_kenaikan}
                    </div>
                    <div className="text-xs text-slate-500">Kenaikan</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
