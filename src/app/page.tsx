import { AuthButtons } from "@/components/AuthButtons";
import { db } from "@/lib/db";
import {
  kenaikan_pangkat,
  opd,
  status_dokumen_wajib,
  status_pegawai,
} from "@/db/schema";
import { sql } from "drizzle-orm";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  Building2,
  FileCheck,
  FileX,
  Shield,
  Clock,
  ChevronRight,
  Activity,
} from "lucide-react";

export default async function Page() {
  const [totalPegawai] = await db
    .select({ count: sql<number>`count(*)` })
    .from(status_pegawai);

  const [totalKenaikanPangkat] = await db
    .select({ total: sql<number>`coalesce(sum(${kenaikan_pangkat.value}), 0)` })
    .from(kenaikan_pangkat);

  const [dokumenStats] = await db
    .select({
      berhasil: sql<number>`coalesce(sum(${status_dokumen_wajib.berhasil}), 0)`,
      tidak_berhasil: sql<number>`coalesce(sum(${status_dokumen_wajib.tidak_berhasil}), 0)`,
    })
    .from(status_dokumen_wajib);

  const [totalOpd] = await db
    .select({ count: sql<number>`count(*)` })
    .from(opd);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top Bar - Government Identity */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span>Sistem Informasi Kepegawaian - Pemerintah Daerah</span>
          <span className="hidden sm:inline">
            Versi 1.0 | Tahun Anggaran {new Date().getFullYear()}
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b-2 border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded flex items-center justify-center">
                <Shield className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  SIKEPAT
                </h1>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Sistem Monitoring Kenaikan Pangkat
                </p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="#data"
                className="hidden md:block text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Data Statistik
              </Link>
              <Link
                href="#layanan"
                className="hidden md:block text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Layanan
              </Link>
              <AuthButtons />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero - Institutional */}
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-6">
                <Activity className="w-3.5 h-3.5" />
                Sistem Aktif
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                Monitoring Kenaikan Pangkat
                <span className="block text-slate-400 mt-2">
                  Aparatur Sipil Negara
                </span>
              </h2>
              <p className="mt-6 text-slate-400 leading-relaxed max-w-lg">
                Platform terintegrasi untuk pemantauan proses kenaikan pangkat
                pegawai di seluruh Organisasi Perangkat Daerah. Transparansi,
                akuntabilitas, dan efisiensi administrasi kepegawaian.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded font-semibold text-sm hover:bg-slate-100 transition-colors"
                >
                  Akses Dashboard
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#data"
                  className="inline-flex items-center gap-2 border border-slate-600 text-slate-300 px-6 py-3 rounded font-semibold text-sm hover:border-slate-500 hover:text-white transition-colors"
                >
                  Lihat Statistik
                </Link>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Ringkasan Data
                </h3>
                <span className="text-xs text-slate-500">
                  Diperbarui: {new Date().toLocaleDateString("id-ID")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Total Pegawai
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {totalPegawai.count.toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Kenaikan Pangkat
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {totalKenaikanPangkat.total.toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      OPD Terdaftar
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {totalOpd.count.toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded flex items-center justify-center">
                      <FileX className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Dokumen Pending
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {dokumenStats.tidak_berhasil.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Bar */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-200">
            <div className="py-6 pr-6">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Dokumen Lengkap
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {dokumenStats.berhasil.toLocaleString("id-ID")}
              </div>
            </div>
            <div className="py-6 px-6">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Dokumen Pending
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {dokumenStats.tidak_berhasil.toLocaleString("id-ID")}
              </div>
            </div>
            <div className="py-6 px-6">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Total Proses
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {(
                  dokumenStats.berhasil + dokumenStats.tidak_berhasil
                ).toLocaleString("id-ID")}
              </div>
            </div>
            <div className="py-6 pl-6">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Tingkat Kelengkapan
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {dokumenStats.berhasil + dokumenStats.tidak_berhasil > 0
                  ? Math.round(
                      (dokumenStats.berhasil /
                        (dokumenStats.berhasil + dokumenStats.tidak_berhasil)) *
                        100
                    )
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="layanan" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Layanan Sistem
            </h3>
            <h2 className="text-2xl font-bold text-slate-900">
              Fitur Monitoring Kepegawaian
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-slate-700" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Verifikasi Dokumen
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pengelolaan dan verifikasi kelengkapan berkas persyaratan
                kenaikan pangkat secara digital.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-slate-700" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Tracking Status
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pemantauan real-time progres pengajuan kenaikan pangkat dari
                setiap tahapan proses.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-slate-700" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Multi-OPD
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Integrasi data kepegawaian dari seluruh Organisasi Perangkat
                Daerah dalam satu platform.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-slate-700" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Laporan Analitik
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dashboard statistik dan ekspor laporan untuk kebutuhan evaluasi
                dan pelaporan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Akses Sistem Monitoring
          </h3>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Masuk ke dashboard untuk memantau status kenaikan pangkat, mengelola
            dokumen, dan melihat laporan statistik OPD Anda.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3 rounded font-semibold hover:bg-slate-100 transition-colors"
          >
            Masuk Dashboard
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="font-bold text-white">SIKEPAT</div>
                  <div className="text-xs text-slate-500">
                    Sistem Monitoring Kenaikan Pangkat
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Platform resmi monitoring kepegawaian Pemerintah Daerah.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-300 mb-4 text-sm uppercase tracking-wider">
                Tautan
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="#layanan" className="hover:text-white">
                    Layanan
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Panduan Penggunaan
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-300 mb-4 text-sm uppercase tracking-wider">
                Kontak
              </h4>
              <ul className="space-y-2 text-sm">
                <li>Badan Kepegawaian Daerah</li>
                <li>Jl. Pemerintahan No. 1</li>
                <li>helpdesk@pemda.go.id</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Pemerintah Daerah. Hak cipta
              dilindungi undang-undang.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="#" className="hover:text-white">
                Kebijakan Privasi
              </Link>
              <Link href="#" className="hover:text-white">
                Syarat Penggunaan
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
