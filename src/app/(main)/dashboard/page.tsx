import { db } from "@/lib/db";
import {
  kenaikan_pangkat,
  opd,
  status_dokumen_wajib,
  status_kenaikan_pangkat,
  status_pegawai,
} from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  Building2,
  FileCheck,
  Sparkles,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

export default async function DashboardPage() {
  // Get all OPD
  const opdList = await db.select().from(opd).orderBy(opd.nama);

  // Total Pengajuan
  const [totalPengajuan] = await db
    .select({ count: sql<number>`COALESCE(SUM(kenaikan_pangkat.value), 0)` })
    .from(kenaikan_pangkat)
    .groupBy(kenaikan_pangkat.periode);

  // Total Kenpa Berhasil
  const [totalKenpaBerhasil] = await db
    .select({ total: sql<number>`coalesce(sum(${status_kenaikan_pangkat.sudah_ttd_pertek}), 0)` })
    .from(status_kenaikan_pangkat)
    .groupBy(status_kenaikan_pangkat.periode);

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

  const completionRate =
    dokumenStats.berhasil + dokumenStats.tidak_berhasil > 0
      ? Math.round(
          (dokumenStats.berhasil /
            (dokumenStats.berhasil + dokumenStats.tidak_berhasil)) *
            100
        )
      : 0;

  const gradients = [
    "from-violet-500 via-purple-500 to-fuchsia-500",
    "from-cyan-500 via-teal-500 to-emerald-500",
    "from-amber-500 via-orange-500 to-red-500",
    "from-pink-500 via-rose-500 to-red-500",
    "from-blue-500 via-indigo-500 to-violet-500",
  ];

  return (
    <div className="col-span-full space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-8 text-white">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Dashboard
            </span>
          </div>
          <h1 className="text-3xl font-black">Selamat Datang di SIKEPAT</h1>
          <p className="text-white/80 mt-2 max-w-lg">
            Pantau dan kelola data kenaikan pangkat seluruh OPD dalam satu tampilan yang terintegrasi
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Pegawai */}
        <div className="group bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-5 text-white shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] transition-all">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black">
            {totalPengajuan.count.toLocaleString("id-ID")}
          </div>
          <div className="text-sm text-white/80 font-medium mt-1">Total Pengajuan</div>
        </div>

        {/* Kenaikan Pangkat */}
        <div className="group bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-5 text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black">
            {totalKenpaBerhasil.total.toLocaleString("id-ID")}
          </div>
          <div className="text-sm text-white/80 font-medium mt-1">Total Kenpa Berhasil</div>
        </div>

        {/* Dokumen Lengkap */}
        <div className="group bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl p-5 text-white shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.02] transition-all">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-3">
            <FileCheck className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black">
            {dokumenStats.berhasil.toLocaleString("id-ID")}
          </div>
          <div className="text-sm text-white/80 font-medium mt-1">Dokumen Lengkap</div>
        </div>

        {/* Total OPD */}
        <div className="group bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-2xl p-5 text-white shadow-xl shadow-pink-500/20 hover:shadow-pink-500/30 hover:scale-[1.02] transition-all">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black">
            {opdList.length.toLocaleString("id-ID")}
          </div>
          <div className="text-sm text-white/80 font-medium mt-1">Total OPD</div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Tingkat Kelengkapan Dokumen</h2>
              <p className="text-sm text-gray-500">
                {dokumenStats.berhasil.toLocaleString("id-ID")} dari{" "}
                {(dokumenStats.berhasil + dokumenStats.tidak_berhasil).toLocaleString("id-ID")} dokumen lengkap
              </p>
            </div>
          </div>
          <div className="text-4xl font-black bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
            {completionRate}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-1000"
            style={{ width: `${completionRate}%` }}
          />
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
            <div className="text-xl font-bold text-emerald-600">
              {dokumenStats.berhasil.toLocaleString("id-ID")}
            </div>
            <div className="text-xs font-medium text-emerald-600/70">Lengkap</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
            <div className="text-xl font-bold text-amber-600">
              {dokumenStats.tidak_berhasil.toLocaleString("id-ID")}
            </div>
            <div className="text-xs font-medium text-amber-600/70">Belum Lengkap</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl">
            <div className="text-xl font-bold text-purple-600">
              {(dokumenStats.berhasil + dokumenStats.tidak_berhasil).toLocaleString("id-ID")}
            </div>
            <div className="text-xs font-medium text-purple-600/70">Total</div>
          </div>
        </div>
      </div>

      {/* OPD List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Daftar OPD</h2>
              <p className="text-sm text-gray-500">Pilih OPD untuk melihat detail data</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {opdStats.map((item, index) => (
            <Link
              key={item.id}
              href={`/${item.singkatan.toLowerCase()}`}
              className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-fuchsia-50/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {item.singkatan.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                    {item.nama}
                  </h3>
                  <p className="text-sm text-gray-500">{item.singkatan}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-gray-900">
                    {item.total_pegawai}
                  </div>
                  <div className="text-xs text-gray-500">Pegawai</div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-gray-900">
                    {item.total_kenaikan}
                  </div>
                  <div className="text-xs text-gray-500">Kenaikan</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-violet-500 group-hover:to-fuchsia-500 transition-all">
                  <ArrowUpRight className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
