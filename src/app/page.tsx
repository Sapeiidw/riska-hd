import { AuthButtons } from "@/components/AuthButtons";
import { ScrollAnimator } from "@/components/ScrollAnimator";
import { db } from "@/lib/db";
import {
  kenaikan_pangkat,
  opd,
  status_dokumen_wajib,
  status_kenaikan_pangkat,
  status_pegawai,
} from "@/db/schema";
import { sql } from "drizzle-orm";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  Building2,
  FileCheck,
  Clock,
  ChevronRight,
  Sparkles,
  Zap,
  BarChart3,
  ArrowUpRight,
  Shield,
  CheckCircle2,
  Star,
  Rocket,
} from "lucide-react";

export default async function Page() {
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

  const [dokumenStats] = await db
    .select({
      berhasil: sql<number>`coalesce(sum(${status_dokumen_wajib.berhasil}), 0)`,
      tidak_berhasil: sql<number>`coalesce(sum(${status_dokumen_wajib.tidak_berhasil}), 0)`,
    })
    .from(status_dokumen_wajib);

  const [totalOpd] = await db
    .select({ count: sql<number>`count(*)` })
    .from(opd);

  const completionRate =
    dokumenStats.berhasil + dokumenStats.tidak_berhasil > 0
      ? Math.round(
          (dokumenStats.berhasil /
            (dokumenStats.berhasil + dokumenStats.tidak_berhasil)) *
            100
        )
      : 0;

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      <ScrollAnimator />
      {/* Colorful Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-gradient-to-br from-cyan-400 via-teal-400 to-emerald-400 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-gradient-to-br from-rose-400 to-pink-400 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Decorative Grid */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-purple-500/30">
                  SK
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  SIKEPAT
                </h1>
                <p className="text-[10px] text-gray-500 font-semibold tracking-wide">
                  Monitoring Kenaikan Pangkat
                </p>
              </div>
            </div>
            <nav className="flex items-center gap-5">
              <Link
                href="#stats"
                className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Statistik
              </Link>
              <Link
                href="#features"
                className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Fitur
              </Link>
              <AuthButtons />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6" data-animate="fade-up">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <Rocket className="w-3.5 h-3.5" />
                  Platform Terintegrasi
                </span>
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Real-time Data
                </span>
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <Star className="w-3.5 h-3.5" />
                  Trusted by OPD
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight" data-animate="fade-up" style={{ transitionDelay: "100ms" }}>
                <span className="text-gray-900">Monitoring</span>
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Kenaikan Pangkat
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                  ASN Modern
                </span>
              </h2>

              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-lg" data-animate="fade-up" style={{ transitionDelay: "200ms" }}>
                Platform super lengkap untuk pantau proses kenaikan pangkat
                pegawai. Transparansi data, efisiensi maksimal, dan dashboard
                yang ciamik!
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap gap-3" data-animate="fade-up" style={{ transitionDelay: "300ms" }}>
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
                >
                  Masuk Dashboard
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
                <Link
                  href="#stats"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all border-2 border-gray-200 hover:border-purple-300 hover:scale-105"
                >
                  Lihat Statistik
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[
                    "from-pink-500 to-rose-500",
                    "from-purple-500 to-violet-500",
                    "from-cyan-500 to-teal-500",
                    "from-amber-500 to-orange-500",
                  ].map((gradient, i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} border-3 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {["DK", "RS", "BP", "DL"][i]}
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full bg-gray-100 border-3 border-white shadow-lg flex items-center justify-center text-gray-600 text-xs font-bold">
                    +{Math.max(0, totalOpd.count - 4)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {totalOpd.count}+ OPD Terdaftar
                  </div>
                  <div className="text-xs text-gray-500">
                    Sudah pakai SIKEPAT
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Stats Cards Grid */}
            <div className="relative" data-animate="fade-left" style={{ transitionDelay: "200ms" }}>
              <div className="grid grid-cols-2 gap-4">
                {/* Card 1 - Pegawai */}
                <div className="group bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl p-6 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all animate-float" style={{ animationDelay: "0s" }}>
                  <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-7 h-7" />
                  </div>
                  <div className="text-4xl font-black">
                    {totalPengajuan.count.toLocaleString("id-ID")}
                  </div>
                  <div className="text-sm text-white/80 font-medium mt-1">
                    Total Pengajuan
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-white/70">
                    <TrendingUp className="w-3 h-3" />
                    Data terkini
                  </div>
                </div>

                {/* Card 2 - Kenaikan */}
                <div className="group bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all animate-float" style={{ animationDelay: "0.5s" }}>
                  <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <div className="text-4xl font-black">
                    {totalKenpaBerhasil.total.toLocaleString("id-ID")}
                  </div>
                  <div className="text-sm text-white/80 font-medium mt-1">
                    Total Kenpa Berhasil
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-white/70">
                    <Sparkles className="w-3 h-3" />
                    Proses berjalan
                  </div>
                </div>

                {/* Card 3 - Dokumen */}
                <div className="group bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transition-all animate-float" style={{ animationDelay: "1s" }}>
                  <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                    <FileCheck className="w-7 h-7" />
                  </div>
                  <div className="text-4xl font-black">
                    {dokumenStats.berhasil.toLocaleString("id-ID")}
                  </div>
                  <div className="text-sm text-white/80 font-medium mt-1">
                    Dokumen Lengkap
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-white/70">
                    <CheckCircle2 className="w-3 h-3" />
                    Terverifikasi
                  </div>
                </div>

                {/* Card 4 - OPD */}
                <div className="group bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-3xl p-6 text-white shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 transition-all animate-float" style={{ animationDelay: "1.5s" }}>
                  <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div className="text-4xl font-black">
                    {totalOpd.count.toLocaleString("id-ID")}
                  </div>
                  <div className="text-sm text-white/80 font-medium mt-1">
                    OPD Terdaftar
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-white/70">
                    <Shield className="w-3 h-3" />
                    Terkoneksi
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl rotate-12 opacity-80 blur-sm" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-80 blur-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Progress Section */}
      <section id="stats" className="py-16 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12" data-animate="fade-up">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <BarChart3 className="w-4 h-4" />
              STATISTIK REAL-TIME
            </span>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900">
              Progress Kelengkapan Dokumen
            </h3>
          </div>

          <div className="max-w-4xl mx-auto" data-animate="zoom-in" style={{ transitionDelay: "100ms" }}>
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    Tingkat Kelengkapan
                  </h4>
                  <p className="text-gray-500">
                    {dokumenStats.berhasil.toLocaleString("id-ID")} dari{" "}
                    {(
                      dokumenStats.berhasil + dokumenStats.tidak_berhasil
                    ).toLocaleString("id-ID")}{" "}
                    dokumen lengkap
                  </p>
                </div>
                <div className="text-5xl font-black bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  {completionRate}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-1000"
                  style={{ width: `${completionRate}%` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-shimmer" />
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                  <div className="text-2xl font-black text-emerald-600">
                    {dokumenStats.berhasil.toLocaleString("id-ID")}
                  </div>
                  <div className="text-xs font-semibold text-emerald-600/70">
                    Lengkap
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
                  <div className="text-2xl font-black text-amber-600">
                    {dokumenStats.tidak_berhasil.toLocaleString("id-ID")}
                  </div>
                  <div className="text-xs font-semibold text-amber-600/70">
                    Pending
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl">
                  <div className="text-2xl font-black text-purple-600">
                    {(
                      dokumenStats.berhasil + dokumenStats.tidak_berhasil
                    ).toLocaleString("id-ID")}
                  </div>
                  <div className="text-xs font-semibold text-purple-600/70">
                    Total
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16" data-animate="fade-up">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-100 to-pink-100 text-fuchsia-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              FITUR UNGGULAN
            </span>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900">
              Semua yang Kamu Butuhkan
            </h3>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Fitur lengkap untuk monitoring kenaikan pangkat yang efisien dan
              transparan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="group bg-white rounded-3xl p-6 border-2 border-gray-100 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2" data-animate="fade-up" style={{ transitionDelay: "0ms" }}>
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <FileCheck className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Verifikasi Dokumen
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Upload dan verifikasi berkas persyaratan kenaikan pangkat dengan
                mudah dan cepat
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-3xl p-6 border-2 border-gray-100 hover:border-cyan-300 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2" data-animate="fade-up" style={{ transitionDelay: "100ms" }}>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Tracking Real-time
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Pantau progres pengajuan dari setiap tahapan secara langsung dan
                akurat
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-3xl p-6 border-2 border-gray-100 hover:border-emerald-300 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2" data-animate="fade-up" style={{ transitionDelay: "200ms" }}>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Multi-OPD
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Integrasi data dari seluruh OPD dalam satu platform yang
                terpusat
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white rounded-3xl p-6 border-2 border-gray-100 hover:border-pink-300 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2" data-animate="fade-up" style={{ transitionDelay: "300ms" }}>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Laporan Analitik
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Dashboard statistik lengkap dan ekspor data untuk kebutuhan
                pelaporan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-[2.5rem] p-10 md:p-16 text-center overflow-hidden shadow-2xl shadow-purple-500/30" data-animate="zoom-in">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Rocket className="w-4 h-4" />
                MULAI SEKARANG
              </span>
              <h3 className="text-3xl md:text-5xl font-black text-white mb-4">
                Siap Transformasi Digital?
              </h3>
              <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
                Akses dashboard untuk memantau status kenaikan pangkat dan
                kelola data kepegawaian OPD dengan cara yang lebih modern!
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-white text-purple-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:scale-105"
              >
                Masuk Dashboard
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-purple-500/20">
                SK
              </div>
              <div>
                <div className="font-bold text-gray-900">SIKEPAT</div>
                <div className="text-xs text-gray-500">
                  Sistem Monitoring Kenaikan Pangkat
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Pemerintah Daerah. Hak cipta
              dilindungi.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link
                href="/privasi"
                className="hover:text-purple-600 transition-colors"
              >
                Privasi
              </Link>
              <Link
                href="/bantuan"
                className="hover:text-purple-600 transition-colors"
              >
                Bantuan
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
