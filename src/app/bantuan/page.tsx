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
    question: "Bagaimana cara mengakses dashboard?",
    answer:
      "Untuk mengakses dashboard, klik tombol 'Masuk' di halaman utama. Anda akan diarahkan ke halaman login. Masukkan email dan password yang telah Anda daftarkan.",
  },
  {
    question: "Siapa yang dapat menggunakan sistem ini?",
    answer:
      "Sistem ini dapat digunakan oleh pengguna yang telah terdaftar. Silakan daftar akun baru jika belum memiliki akun.",
  },
  {
    question: "Bagaimana cara mendaftar akun baru?",
    answer:
      "Klik tombol 'Daftar' di halaman utama, isi formulir dengan nama lengkap, email, dan password Anda. Setelah itu Anda dapat langsung masuk ke sistem.",
  },
  {
    question: "Bagaimana cara mengubah password akun?",
    answer:
      "Klik ikon profil di pojok kanan atas dashboard, pilih 'Pengaturan Akun', lalu pilih 'Ubah Password'. Masukkan password lama dan password baru Anda.",
  },
  {
    question: "Apa yang harus dilakukan jika lupa password?",
    answer:
      "Klik link 'Lupa Password' di halaman login, masukkan email Anda, dan ikuti instruksi yang dikirim ke email untuk mereset password.",
  },
  {
    question: "Apakah data saya aman?",
    answer:
      "Ya, kami menggunakan enkripsi dan praktik keamanan terbaik untuk melindungi data Anda. Silakan baca Kebijakan Privasi kami untuk informasi lebih lanjut.",
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
                Temukan jawaban dan panduan penggunaan aplikasi
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
                href="mailto:support@example.com"
                className="text-purple-600 hover:underline"
              >
                support@example.com
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
              <h3 className="font-bold text-gray-900 mb-2">Alamat</h3>
              <p className="text-gray-600">Tim Support</p>
              <p className="text-sm text-gray-500 mt-2">
                Jakarta, Indonesia
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
              Semua layanan beroperasi normal
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
