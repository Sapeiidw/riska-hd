import Link from "next/link";
import { Shield, ChevronLeft } from "lucide-react";

export default function PrivasiPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Kebijakan Privasi
              </h1>
              <p className="text-sm text-gray-500">
                Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              1. Pendahuluan
            </h2>
            <p className="text-gray-600 leading-relaxed">
              SIKEPAT (Sistem Monitoring Kenaikan Pangkat) berkomitmen untuk
              melindungi privasi dan keamanan data pengguna. Kebijakan Privasi
              ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan
              melindungi informasi Anda saat menggunakan layanan kami.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              2. Data yang Kami Kumpulkan
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Kami mengumpulkan informasi berikut untuk keperluan operasional
              sistem:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Data identitas pegawai (nama, NIP, golongan)</li>
              <li>Data kepegawaian (jabatan, unit kerja, OPD)</li>
              <li>Dokumen persyaratan kenaikan pangkat</li>
              <li>Riwayat aktivitas penggunaan sistem</li>
              <li>Informasi akun pengguna (email, username)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              3. Penggunaan Data
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Data yang dikumpulkan digunakan untuk:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Memproses dan memantau kenaikan pangkat pegawai</li>
              <li>Verifikasi kelengkapan dokumen persyaratan</li>
              <li>Menghasilkan laporan dan statistik kepegawaian</li>
              <li>Meningkatkan kualitas layanan sistem</li>
              <li>Keperluan audit dan kepatuhan regulasi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              4. Perlindungan Data
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Kami menerapkan langkah-langkah keamanan teknis dan organisasi
              untuk melindungi data Anda, termasuk enkripsi data, kontrol
              akses berbasis peran (RBAC), pencatatan aktivitas sistem, dan
              backup data berkala. Akses terhadap data dibatasi hanya untuk
              personel yang berwenang.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              5. Pembagian Data
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Data Anda tidak akan dibagikan kepada pihak ketiga kecuali
              diwajibkan oleh hukum atau peraturan yang berlaku. Data hanya
              diakses oleh OPD terkait dan instansi yang berwenang sesuai
              dengan tugas dan fungsinya.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              6. Hak Pengguna
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Sebagai pengguna, Anda memiliki hak untuk:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Mengakses data pribadi Anda yang tersimpan dalam sistem</li>
              <li>Meminta koreksi atas data yang tidak akurat</li>
              <li>Mendapatkan informasi tentang penggunaan data Anda</li>
              <li>Mengajukan keluhan terkait pengelolaan data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              7. Kontak
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini,
              silakan hubungi Badan Kepegawaian Daerah melalui email{" "}
              <a
                href="mailto:helpdesk@pemda.go.id"
                className="text-purple-600 hover:underline"
              >
                helpdesk@pemda.go.id
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
