import Link from "next/link";
import {
  HelpCircle,
  ChevronLeft,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  FileText,
  Users,
  Shield,
  Clock,
  CheckCircle,
} from "lucide-react";

const faqs = [
  {
    question: "Bagaimana cara mengakses dashboard SIKEPAT?",
    answer:
      "Untuk mengakses dashboard, klik tombol 'Masuk Dashboard' di halaman utama. Anda akan diarahkan ke halaman login. Masukkan kredensial yang telah diberikan oleh administrator OPD Anda.",
  },
  {
    question: "Siapa yang dapat menggunakan sistem ini?",
    answer:
      "SIKEPAT dapat digunakan oleh pegawai yang ditunjuk dari setiap OPD (Organisasi Perangkat Daerah), termasuk admin kepegawaian, verifikator dokumen, dan pejabat yang berwenang.",
  },
  {
    question: "Bagaimana cara mengunggah dokumen persyaratan?",
    answer:
      "Masuk ke dashboard OPD Anda, pilih menu 'Status Dokumen Wajib', lalu klik tombol 'Upload Dokumen'. Pastikan dokumen dalam format PDF dan ukuran tidak melebihi 5MB.",
  },
  {
    question: "Apa saja dokumen yang diperlukan untuk kenaikan pangkat?",
    answer:
      "Dokumen yang diperlukan meliputi: SK Pangkat terakhir, SKP 2 tahun terakhir, Ijazah pendidikan, Sertifikat diklat, dan dokumen pendukung lainnya sesuai peraturan yang berlaku.",
  },
  {
    question: "Bagaimana cara memantau status pengajuan?",
    answer:
      "Status pengajuan dapat dipantau melalui menu 'Status Kenaikan Pangkat' di dashboard. Sistem akan menampilkan tahapan proses dan status terkini dari setiap pengajuan.",
  },
  {
    question: "Berapa lama proses verifikasi dokumen?",
    answer:
      "Proses verifikasi dokumen biasanya memakan waktu 3-5 hari kerja, tergantung pada kelengkapan dan kebenaran dokumen yang diajukan.",
  },
  {
    question: "Apa yang harus dilakukan jika dokumen ditolak?",
    answer:
      "Jika dokumen ditolak, Anda akan menerima notifikasi beserta alasan penolakan. Perbaiki dokumen sesuai catatan dan unggah ulang melalui menu yang sama.",
  },
  {
    question: "Bagaimana cara mengubah password akun?",
    answer:
      "Klik ikon profil di pojok kanan atas dashboard, pilih 'Pengaturan Akun', lalu pilih 'Ubah Password'. Masukkan password lama dan password baru Anda.",
  },
];

export default function BantuanPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Pusat Bantuan</h1>
              <p className="text-white/80 mt-1">
                Temukan jawaban dan panduan penggunaan SIKEPAT
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Links */}
      <div className="max-w-5xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Panduan</h3>
            <p className="text-sm text-gray-500 mt-1">Cara penggunaan sistem</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Akun</h3>
            <p className="text-sm text-gray-500 mt-1">Kelola akun pengguna</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Keamanan</h3>
            <p className="text-sm text-gray-500 mt-1">Tips keamanan akun</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Status</h3>
            <p className="text-sm text-gray-500 mt-1">Cek status layanan</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Pertanyaan yang Sering Diajukan
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
              </summary>
              <div className="px-5 pb-5">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Masih Butuh Bantuan?
            </h2>
            <p className="text-gray-500 mt-2">
              Tim support kami siap membantu Anda
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Email</h3>
              <a
                href="mailto:helpdesk@pemda.go.id"
                className="text-purple-600 hover:underline"
              >
                helpdesk@pemda.go.id
              </a>
              <p className="text-sm text-gray-500 mt-2">
                Respon dalam 1x24 jam
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Telepon</h3>
              <a
                href="tel:+62211234567"
                className="text-purple-600 hover:underline"
              >
                (021) 123-4567
              </a>
              <p className="text-sm text-gray-500 mt-2">
                Senin - Jumat, 08:00 - 16:00
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Kantor</h3>
              <p className="text-gray-600">Badan Kepegawaian Daerah</p>
              <p className="text-sm text-gray-500 mt-2">
                Jl. Pemerintahan No. 1
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">
              Semua layanan SIKEPAT beroperasi normal
            </span>
          </div>
          <span className="text-sm text-white/80">
            Diperbarui: {new Date().toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </main>
  );
}
