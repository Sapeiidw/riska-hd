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

export default async function Page() {
  const [totalPegawai] = await db
    .select({ count: sql<number>`count(*)` })
    .from(status_pegawai);

  const [totalKenaikanPangkat] = await db
    .select({ total: sql<number>`coalesce(sum(${kenaikan_pangkat.value}), 0)` })
    .from(kenaikan_pangkat);

  const [dokumenBelumLengkap] = await db
    .select({
      total: sql<number>`coalesce(sum(${status_dokumen_wajib.tidak_berhasil}), 0)`,
    })
    .from(status_dokumen_wajib);

  const [totalOpd] = await db
    .select({ count: sql<number>`count(*)` })
    .from(opd);
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header / Nav */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-background font-bold">SK</div>
          <div>
            <h2 className="text-lg font-semibold">SIKEPAT</h2>
            <p className="text-xs text-muted-foreground">Sistem Monitoring Kenaikan Pangkat</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="#features" className="hover:underline">Fitur</Link>
          <Link href="#how" className="hover:underline">Cara Kerja</Link>
          <AuthButtons />
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Sistem Monitoring Kenaikan Pangkat untuk OPD</h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg">
            Pantau status kenaikan pangkat pegawai secara terpusat, otomatis, dan transparan. Hemat waktu administrasi dan pastikan semua dokumen terpenuhi tepat waktu.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/rsud" className="inline-flex items-center gap-2 bg-primary text-background px-5 py-2 rounded-md font-medium">
              Mulai Sekarang
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 border border-muted-foreground px-4 py-2 rounded-md text-sm">Lihat Fitur</a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="p-4 bg-card rounded-md shadow-sm">
              <h4 className="text-sm font-semibold">Integrasi Data</h4>
              <p className="text-xs text-muted-foreground">Sinkronisasi data pegawai dari OPD.</p>
            </div>
            <div className="p-4 bg-card rounded-md shadow-sm">
              <h4 className="text-sm font-semibold">Notifikasi</h4>
              <p className="text-xs text-muted-foreground">Pengingat dokumen dan jadwal kenaikan.</p>
            </div>
            <div className="p-4 bg-card rounded-md shadow-sm">
              <h4 className="text-sm font-semibold">Laporan</h4>
              <p className="text-xs text-muted-foreground">Ekspor data untuk laporan OPD.</p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="w-full rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 p-6">
            <h3 className="text-xl font-semibold">Ringkasan Terbaru</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>• {totalPegawai.count} pegawai terdaftar</li>
              <li>• {totalKenaikanPangkat.total} kenaikan pangkat</li>
              <li>• {dokumenBelumLengkap.total} dokumen belum lengkap</li>
              <li>• {totalOpd.count} OPD terkoneksi</li>
            </ul>
            <div className="mt-6">
              <Link href="/dashboard" className="inline-block bg-primary text-background px-4 py-2 rounded-md">Dashboard</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-12">
        <h3 className="text-2xl font-bold">Fitur Utama</h3>
        <p className="mt-2 text-muted-foreground">Alat untuk memudahkan manajemen kenaikan pangkat di lingkungan pemerintahan.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-card rounded-lg shadow-xl">
            <h4 className="font-semibold">Manajemen Dokumen</h4>
            <p className="mt-2 text-sm text-muted-foreground">Unggah dan verifikasi dokumen pendukung kenaikan pangkat.</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-xl">
            <h4 className="font-semibold">Alur Persetujuan</h4>
            <p className="mt-2 text-sm text-muted-foreground">Tentukan alur persetujuan sesuai struktur OPD.</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-xl">
            <h4 className="font-semibold">Notifikasi & Pengingat</h4>
            <p className="mt-2 text-sm text-muted-foreground">Email atau notifikasi internal untuk pengelola dan pegawai.</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-xl">
            <h4 className="font-semibold">Laporan & Ekspor</h4>
            <p className="mt-2 text-sm text-muted-foreground">Ekspor data ke CSV atau PDF untuk pelaporan.</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-xl">
            <h4 className="font-semibold">Kontrol Akses</h4>
            <p className="mt-2 text-sm text-muted-foreground">Role-based access untuk admin, verifikator, dan OPD.</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-xl">
            <h4 className="font-semibold">Audit Trail</h4>
            <p className="mt-2 text-sm text-muted-foreground">Rekam semua perubahan untuk kepatuhan dan transparansi.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-4xl mx-auto px-6 py-12">
        <h3 className="text-2xl font-bold">Cara Kerja</h3>
        <ol className="mt-6 space-y-6 list-decimal list-inside text-muted-foreground">
          <li>
            Daftarkan OPD dan sinkronkan data pegawai.
          </li>
          <li>
            Unggah dan verifikasi dokumen pendukung kenaikan pangkat.
          </li>
          <li>
            Sistem mengirimkan pengingat dan menghasilkan laporan periode.
          </li>
        </ol>
      </section>

      {/* Footer */}
      <footer className="mt-12 border-t border-muted-foreground/20">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <strong>Sistem Monitoring Kenaikan Pangkat</strong>
            <div className="text-sm text-muted-foreground">© {new Date().getFullYear()} Pemerintah — Semua hak dilindungi</div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">Kebijakan Privasi</Link>
            <Link href="#" className="hover:underline">Bantuan</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
