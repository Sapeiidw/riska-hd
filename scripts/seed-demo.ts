import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  user,
  account,
  role,
  permission,
  rolePermission,
  doctor,
  nurse,
  patient,
  room,
  hdMachine,
  shift,
  diagnosis,
  medication,
  hdProtocol,
  patientDiagnosis,
  patientMedication,
  nurseSchedule,
  patientSchedule,
  ruangInformasi,
} from "../src/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Helper untuk hash password sederhana (untuk demo saja)
// Di production, gunakan bcrypt dari better-auth
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ==========================================
// Data Seed
// ==========================================

const DIAGNOSES_DATA = [
  { icdCode: "N18.5", name: "Chronic Kidney Disease Stage 5", category: "Nephrology", description: "Gagal ginjal kronik stadium 5" },
  { icdCode: "N18.4", name: "Chronic Kidney Disease Stage 4", category: "Nephrology", description: "Gagal ginjal kronik stadium 4" },
  { icdCode: "I10", name: "Essential Hypertension", category: "Cardiology", description: "Hipertensi esensial" },
  { icdCode: "E11.65", name: "Type 2 Diabetes with Hyperglycemia", category: "Endocrinology", description: "Diabetes melitus tipe 2 dengan hiperglikemia" },
  { icdCode: "E11.22", name: "Type 2 Diabetes with Diabetic CKD", category: "Endocrinology", description: "Diabetes melitus tipe 2 dengan nefropati diabetik" },
  { icdCode: "I50.9", name: "Heart Failure, Unspecified", category: "Cardiology", description: "Gagal jantung" },
  { icdCode: "D63.1", name: "Anemia in Chronic Kidney Disease", category: "Hematology", description: "Anemia pada penyakit ginjal kronik" },
  { icdCode: "E83.52", name: "Hypercalcemia", category: "Metabolic", description: "Hiperkalsemia" },
  { icdCode: "E87.5", name: "Hyperkalemia", category: "Metabolic", description: "Hiperkalemia" },
  { icdCode: "N17.9", name: "Acute Kidney Failure", category: "Nephrology", description: "Gagal ginjal akut" },
];

const MEDICATIONS_DATA = [
  { name: "Epoetin Alfa", genericName: "Erythropoietin", category: "Antianemic", unit: "IU", defaultDosage: "4000 IU", route: "SC/IV", notes: "Untuk anemia pada CKD" },
  { name: "Heparin Sodium", genericName: "Heparin", category: "Anticoagulant", unit: "IU", defaultDosage: "5000 IU", route: "IV", notes: "Antikoagulan selama HD" },
  { name: "Calcium Carbite", genericName: "Calcium Carbonate", category: "Phosphate Binder", unit: "mg", defaultDosage: "500 mg", route: "PO", notes: "Pengikat fosfat" },
  { name: "Calcitriol", genericName: "Calcitriol", category: "Vitamin D", unit: "mcg", defaultDosage: "0.25 mcg", route: "PO", notes: "Suplementasi vitamin D" },
  { name: "Amlodipine", genericName: "Amlodipine", category: "Antihypertensive", unit: "mg", defaultDosage: "5 mg", route: "PO", notes: "Antihipertensi" },
  { name: "Furosemide", genericName: "Furosemide", category: "Diuretic", unit: "mg", defaultDosage: "40 mg", route: "PO/IV", notes: "Diuretik loop" },
  { name: "Iron Sucrose", genericName: "Iron Sucrose", category: "Iron Supplement", unit: "mg", defaultDosage: "100 mg", route: "IV", notes: "Suplementasi zat besi IV" },
  { name: "Sevelamer", genericName: "Sevelamer Carbonate", category: "Phosphate Binder", unit: "mg", defaultDosage: "800 mg", route: "PO", notes: "Pengikat fosfat non-kalsium" },
  { name: "Metoprolol", genericName: "Metoprolol Tartrate", category: "Beta Blocker", unit: "mg", defaultDosage: "50 mg", route: "PO", notes: "Beta blocker untuk hipertensi" },
  { name: "Omeprazole", genericName: "Omeprazole", category: "PPI", unit: "mg", defaultDosage: "20 mg", route: "PO", notes: "Proteksi lambung" },
];

const PROTOCOLS_DATA = [
  { name: "Standard HD 4 Jam", dialyzerType: "High-Flux", bloodFlowRate: 300, dialysateFlowRate: 500, duration: 240, ufGoal: 2000, anticoagulant: "Heparin", anticoagulantDose: "5000 IU bolus + 1000 IU/jam", dialysateType: "Bicarbonate", dialysateTemperature: 37, sodiumLevel: 140, potassiumLevel: 2, calciumLevel: 3 },
  { name: "Standard HD 5 Jam", dialyzerType: "High-Flux", bloodFlowRate: 350, dialysateFlowRate: 500, duration: 300, ufGoal: 3000, anticoagulant: "Heparin", anticoagulantDose: "5000 IU bolus + 1000 IU/jam", dialysateType: "Bicarbonate", dialysateTemperature: 37, sodiumLevel: 140, potassiumLevel: 2, calciumLevel: 3 },
  { name: "Low-Flux HD", dialyzerType: "Low-Flux", bloodFlowRate: 250, dialysateFlowRate: 500, duration: 240, ufGoal: 1500, anticoagulant: "Heparin", anticoagulantDose: "3000 IU bolus", dialysateType: "Bicarbonate", dialysateTemperature: 37, sodiumLevel: 138, potassiumLevel: 2, calciumLevel: 3 },
  { name: "Heparin-Free HD", dialyzerType: "High-Flux", bloodFlowRate: 300, dialysateFlowRate: 500, duration: 180, ufGoal: 1500, anticoagulant: "Saline Flush", anticoagulantDose: "100ml setiap 30 menit", dialysateType: "Bicarbonate", dialysateTemperature: 36, sodiumLevel: 140, potassiumLevel: 2, calciumLevel: 3, notes: "Untuk pasien risiko perdarahan tinggi" },
  { name: "Sodium Profiling HD", dialyzerType: "High-Flux", bloodFlowRate: 300, dialysateFlowRate: 500, duration: 240, ufGoal: 2500, anticoagulant: "Heparin", anticoagulantDose: "5000 IU bolus", dialysateType: "Bicarbonate", dialysateTemperature: 36, sodiumLevel: 145, potassiumLevel: 2, calciumLevel: 3, notes: "Sodium profiling untuk pasien hipotensi intradialitik" },
];

const ROOMS_DATA = [
  { name: "Ruang HD A", code: "HD-A", floor: "Lantai 1", capacity: 10, description: "Ruang HD reguler" },
  { name: "Ruang HD B", code: "HD-B", floor: "Lantai 1", capacity: 8, description: "Ruang HD reguler" },
  { name: "Ruang HD Isolasi", code: "HD-ISO", floor: "Lantai 2", capacity: 4, description: "Ruang HD untuk pasien isolasi (HBV, HCV)" },
  { name: "Ruang HD VIP", code: "HD-VIP", floor: "Lantai 2", capacity: 4, description: "Ruang HD VIP dengan fasilitas tambahan" },
];

const SHIFTS_DATA = [
  { name: "Shift Pagi", startTime: "06:00", endTime: "11:00", maxPatients: 20 },
  { name: "Shift Siang", startTime: "11:00", endTime: "16:00", maxPatients: 20 },
  { name: "Shift Sore", startTime: "16:00", endTime: "21:00", maxPatients: 15 },
  { name: "Shift Malam", startTime: "21:00", endTime: "02:00", maxPatients: 10 },
];

const MACHINES_DATA = [
  { serialNumber: "FMC-2024-001", brand: "Fresenius", model: "5008S CorDiax" },
  { serialNumber: "FMC-2024-002", brand: "Fresenius", model: "5008S CorDiax" },
  { serialNumber: "FMC-2024-003", brand: "Fresenius", model: "5008S CorDiax" },
  { serialNumber: "NKK-2024-001", brand: "Nikkiso", model: "DBB-EXA" },
  { serialNumber: "NKK-2024-002", brand: "Nikkiso", model: "DBB-EXA" },
  { serialNumber: "BXT-2024-001", brand: "Baxter", model: "AK 98" },
  { serialNumber: "BXT-2024-002", brand: "Baxter", model: "AK 98" },
  { serialNumber: "NIP-2024-001", brand: "Nipro", model: "SURDIAL X" },
  { serialNumber: "NIP-2024-002", brand: "Nipro", model: "SURDIAL X" },
  { serialNumber: "FMC-2023-001", brand: "Fresenius", model: "4008S Classic" },
  { serialNumber: "FMC-2023-002", brand: "Fresenius", model: "4008S Classic" },
  { serialNumber: "BRN-2024-001", brand: "B. Braun", model: "Dialog+" },
];

const DOCTORS_DATA = [
  { name: "dr. Ahmad Faisal, Sp.PD-KGH", email: "dr.ahmad@test.com", nip: "19800515200901001", sip: "SIP-PD-KGH-001", specialization: "Konsultan Ginjal Hipertensi" },
  { name: "dr. Siti Rahma, Sp.PD", email: "dr.siti@test.com", nip: "19850320201001002", sip: "SIP-PD-002", specialization: "Penyakit Dalam - Nefrologi" },
  { name: "dr. Budi Santoso, Sp.PD-KGH", email: "dr.budi@test.com", nip: "19780812199901003", sip: "SIP-PD-KGH-003", specialization: "Konsultan Ginjal Hipertensi" },
  { name: "dr. Dewi Kartika, Sp.PD", email: "dr.dewi@test.com", nip: "19900105201501004", sip: "SIP-PD-004", specialization: "Penyakit Dalam - Transplantasi" },
];

const NURSES_DATA = [
  { name: "Ns. Ratna Sari, S.Kep", email: "ns.ratna@test.com", nip: "19880315201001001", sip: "SIP-NS-001", certification: "Certified Dialysis Nurse (CDN)" },
  { name: "Ns. Yusuf Rahman, S.Kep", email: "ns.yusuf@test.com", nip: "19850720200901002", sip: "SIP-NS-002", certification: "Vascular Access Care Specialist" },
  { name: "Ns. Linda Permata, S.Kep", email: "ns.linda@test.com", nip: "19920101201501003", sip: "SIP-NS-003", certification: "Certified Dialysis Nurse (CDN)" },
  { name: "Ns. Andi Wijaya, S.Kep", email: "ns.andi@test.com", nip: "19870610200801004", sip: "SIP-NS-004", certification: "Emergency & Critical Care" },
  { name: "Ns. Maya Kusuma, S.Kep", email: "ns.maya@test.com", nip: "19930505201701005", sip: "SIP-NS-005", certification: "Certified Dialysis Nurse (CDN)" },
  { name: "Ns. Doni Prasetyo, S.Kep", email: "ns.doni@test.com", nip: "19890825201201006", sip: "SIP-NS-006", certification: "Hemodialysis Technician" },
];

const RUANG_INFORMASI_DATA = [
  {
    title: "Mengenal Hemodialisis: Panduan Lengkap untuk Pasien Baru",
    slug: "mengenal-hemodialisis-panduan-lengkap",
    category: "panduan",
    excerpt: "Panduan komprehensif tentang hemodialisis untuk pasien yang baru memulai terapi cuci darah. Pelajari prosedur, persiapan, dan tips menjalani HD dengan nyaman.",
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
    content: `<h2>Apa itu Hemodialisis?</h2>
<p>Hemodialisis (HD) adalah prosedur medis untuk membersihkan darah dari racun dan kelebihan cairan ketika ginjal tidak lagi mampu melakukan fungsi ini secara alami. Prosedur ini menggunakan mesin dialisis dan filter khusus yang disebut dialyzer.</p>

<h2>Mengapa Hemodialisis Diperlukan?</h2>
<p>Ketika fungsi ginjal menurun hingga kurang dari 15% (stadium 5 atau gagal ginjal), tubuh tidak mampu:</p>
<ul>
  <li>Membuang racun dan produk sisa metabolisme</li>
  <li>Mengatur keseimbangan cairan</li>
  <li>Mengontrol tekanan darah</li>
  <li>Memproduksi hormon untuk pembentukan sel darah merah</li>
</ul>

<h2>Persiapan Sebelum HD</h2>
<p>Beberapa hal yang perlu dipersiapkan:</p>
<ol>
  <li><strong>Akses Vaskular:</strong> Dokter akan membuat akses ke pembuluh darah Anda (AV Fistula, AV Graft, atau Kateter)</li>
  <li><strong>Pemeriksaan Rutin:</strong> Lakukan pemeriksaan darah secara berkala</li>
  <li><strong>Atur Pola Makan:</strong> Ikuti diet khusus yang direkomendasikan ahli gizi</li>
</ol>

<h2>Proses Hemodialisis</h2>
<p>Setiap sesi HD biasanya berlangsung 4-5 jam dan dilakukan 2-3 kali seminggu. Selama proses:</p>
<ul>
  <li>Darah dialirkan ke mesin dialisis melalui akses vaskular</li>
  <li>Darah melewati dialyzer untuk dibersihkan</li>
  <li>Darah bersih dikembalikan ke tubuh</li>
</ul>

<blockquote>
<p><strong>Tips:</strong> Bawa buku, musik, atau aktivitas ringan untuk mengisi waktu selama sesi HD.</p>
</blockquote>`,
    externalLinks: JSON.stringify([
      { title: "PERNEFRI - Perhimpunan Nefrologi Indonesia", url: "https://pernefri.or.id" },
      { title: "National Kidney Foundation", url: "https://www.kidney.org" }
    ]),
  },
  {
    title: "Diet Sehat untuk Pasien Hemodialisis",
    slug: "diet-sehat-pasien-hemodialisis",
    category: "artikel",
    excerpt: "Panduan nutrisi dan pola makan yang tepat untuk pasien cuci darah. Ketahui makanan yang boleh dan tidak boleh dikonsumsi.",
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
    content: `<h2>Pentingnya Diet bagi Pasien HD</h2>
<p>Diet yang tepat sangat penting bagi pasien hemodialisis untuk:</p>
<ul>
  <li>Mengontrol penumpukan racun di antara sesi dialisis</li>
  <li>Menjaga keseimbangan elektrolit</li>
  <li>Mencegah komplikasi seperti hiperkalemia dan hiperfosfatemia</li>
  <li>Mempertahankan status gizi yang optimal</li>
</ul>

<h2>Pembatasan Cairan</h2>
<p>Pasien HD perlu membatasi asupan cairan karena ginjal tidak dapat membuang kelebihan cairan. Umumnya dibatasi 500-1000 ml per hari ditambah volume urin.</p>

<h3>Tips Mengurangi Rasa Haus:</h3>
<ul>
  <li>Kumur dengan air dingin tanpa menelan</li>
  <li>Hisap es batu kecil</li>
  <li>Kunyah permen karet tanpa gula</li>
  <li>Hindari makanan asin yang memicu haus</li>
</ul>

<h2>Makanan yang Perlu Dibatasi</h2>
<h3>Tinggi Kalium (Potasium)</h3>
<p>Hindari atau batasi: pisang, jeruk, tomat, kentang, bayam, alpukat.</p>

<h3>Tinggi Fosfor</h3>
<p>Hindari atau batasi: susu, keju, kacang-kacangan, minuman bersoda.</p>

<h3>Tinggi Natrium (Garam)</h3>
<p>Hindari: makanan olahan, makanan kaleng, makanan cepat saji, kecap asin.</p>

<h2>Makanan yang Dianjurkan</h2>
<ul>
  <li><strong>Protein berkualitas:</strong> Putih telur, ikan, daging tanpa lemak</li>
  <li><strong>Sayuran rendah kalium:</strong> Wortel, mentimun, kubis</li>
  <li><strong>Buah rendah kalium:</strong> Apel, pir, semangka</li>
</ul>

<blockquote>
<p><strong>Penting:</strong> Konsultasikan dengan ahli gizi untuk mendapatkan rencana makan yang disesuaikan dengan kondisi Anda.</p>
</blockquote>`,
    externalLinks: JSON.stringify([
      { title: "Panduan Diet Ginjal - RSUP Dr. Sardjito", url: "https://sardjito.co.id" }
    ]),
  },
  {
    title: "Mengenal Akses Vaskular: AV Fistula vs AV Graft vs Kateter",
    slug: "mengenal-akses-vaskular-hemodialisis",
    category: "artikel",
    excerpt: "Pelajari berbagai jenis akses vaskular untuk hemodialisis, kelebihan dan kekurangan masing-masing, serta cara perawatannya.",
    imageUrl: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800",
    content: `<h2>Apa itu Akses Vaskular?</h2>
<p>Akses vaskular adalah jalur masuk ke pembuluh darah yang memungkinkan darah mengalir ke mesin dialisis dan kembali ke tubuh. Akses yang baik sangat penting untuk keberhasilan hemodialisis.</p>

<h2>Jenis-Jenis Akses Vaskular</h2>

<h3>1. AV Fistula (Arteriovenous Fistula)</h3>
<p>AV Fistula dibuat dengan menghubungkan arteri dan vena, biasanya di lengan. Ini adalah jenis akses yang paling direkomendasikan.</p>
<p><strong>Kelebihan:</strong></p>
<ul>
  <li>Risiko infeksi paling rendah</li>
  <li>Aliran darah yang baik</li>
  <li>Bertahan paling lama (bisa bertahun-tahun)</li>
</ul>
<p><strong>Kekurangan:</strong></p>
<ul>
  <li>Butuh waktu 2-3 bulan untuk matang sebelum bisa digunakan</li>
  <li>Tidak semua pasien memiliki pembuluh darah yang cocok</li>
</ul>

<h3>2. AV Graft (Arteriovenous Graft)</h3>
<p>AV Graft menggunakan tabung sintetis untuk menghubungkan arteri dan vena.</p>
<p><strong>Kelebihan:</strong></p>
<ul>
  <li>Bisa digunakan lebih cepat (2-3 minggu)</li>
  <li>Alternatif jika fistula tidak memungkinkan</li>
</ul>
<p><strong>Kekurangan:</strong></p>
<ul>
  <li>Risiko infeksi lebih tinggi dari fistula</li>
  <li>Lebih mudah menyumbat</li>
  <li>Umumnya tidak bertahan selama fistula</li>
</ul>

<h3>3. Kateter Vena Sentral (CVC)</h3>
<p>Kateter dimasukkan ke vena besar di leher, dada, atau paha.</p>
<p><strong>Kelebihan:</strong></p>
<ul>
  <li>Bisa langsung digunakan</li>
  <li>Pilihan untuk dialisis darurat</li>
</ul>
<p><strong>Kekurangan:</strong></p>
<ul>
  <li>Risiko infeksi tertinggi</li>
  <li>Tidak untuk penggunaan jangka panjang</li>
  <li>Membatasi aktivitas tertentu</li>
</ul>

<h2>Perawatan Akses Vaskular</h2>
<ul>
  <li>Jaga kebersihan area akses</li>
  <li>Hindari mengangkat beban berat dengan lengan yang ada aksesnya</li>
  <li>Jangan biarkan pengukuran tekanan darah atau pengambilan darah di lengan dengan akses</li>
  <li>Periksa getaran (thrill) fistula setiap hari</li>
  <li>Segera hubungi dokter jika ada tanda infeksi atau masalah</li>
</ul>`,
    externalLinks: null,
  },
  {
    title: "Video: Prosedur Hemodialisis dari Awal hingga Akhir",
    slug: "video-prosedur-hemodialisis",
    category: "video",
    excerpt: "Video edukasi yang menjelaskan langkah demi langkah prosedur hemodialisis, dari persiapan hingga selesai.",
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800",
    content: `<h2>Prosedur Hemodialisis</h2>
<p>Video berikut menjelaskan prosedur hemodialisis secara lengkap:</p>

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe
    src="https://www.youtube.com/embed/RA9vu3pXDng"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

<h2>Tahapan Prosedur HD</h2>
<ol>
  <li><strong>Persiapan:</strong> Perawat memeriksa tanda vital dan berat badan</li>
  <li><strong>Pemasangan akses:</strong> Jarum dialisis dipasang ke akses vaskular</li>
  <li><strong>Proses dialisis:</strong> Darah dibersihkan selama 4-5 jam</li>
  <li><strong>Penyelesaian:</strong> Jarum dilepas dan luka ditekan</li>
  <li><strong>Evaluasi:</strong> Pengukuran berat badan dan tanda vital akhir</li>
</ol>

<h2>Yang Perlu Diperhatikan</h2>
<ul>
  <li>Datang tepat waktu sesuai jadwal</li>
  <li>Informasikan jika ada keluhan atau perubahan kondisi</li>
  <li>Bawa obat-obatan yang perlu diminum saat HD</li>
  <li>Gunakan pakaian yang nyaman dengan lengan mudah digulung</li>
</ul>`,
    externalLinks: JSON.stringify([
      { title: "YouTube: Kidney Research UK", url: "https://youtube.com/@KidneyResearchUK" }
    ]),
  },
  {
    title: "Pengumuman: Jadwal Libur Lebaran 2025",
    slug: "pengumuman-jadwal-libur-lebaran-2025",
    category: "pengumuman",
    excerpt: "Informasi penting mengenai jadwal pelayanan hemodialisis selama periode libur Hari Raya Idul Fitri 2025.",
    imageUrl: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800",
    content: `<h2>Pengumuman Penting</h2>
<p>Dengan hormat, kami informasikan jadwal pelayanan Unit Hemodialisis selama periode Hari Raya Idul Fitri 1446 H / 2025 M.</p>

<h2>Jadwal Libur</h2>
<ul>
  <li><strong>H-2 s/d H+4 Lebaran:</strong> Pelayanan HD tetap berjalan dengan penyesuaian jadwal</li>
  <li><strong>H+1 Lebaran:</strong> Unit HD TUTUP (kecuali emergensi)</li>
</ul>

<h2>Penyesuaian Jadwal</h2>
<p>Pasien yang jadwal HD-nya bertepatan dengan H+1 Lebaran akan dijadwalkan ulang ke:</p>
<ul>
  <li>H-1 Lebaran (sore), atau</li>
  <li>H+2 Lebaran (pagi)</li>
</ul>

<h2>Hal yang Perlu Diperhatikan</h2>
<ol>
  <li>Pasien akan dihubungi oleh petugas untuk konfirmasi jadwal baru</li>
  <li>Tetap patuhi pembatasan cairan dan diet selama libur</li>
  <li>Segera ke IGD jika mengalami sesak napas, bengkak berlebih, atau keluhan darurat lainnya</li>
  <li>Simpan nomor darurat unit HD: <strong>021-xxxx-xxxx</strong></li>
</ol>

<blockquote>
<p><strong>Catatan:</strong> Untuk pasien dengan kondisi khusus, silakan hubungi perawat penanggung jawab Anda untuk pengaturan jadwal yang lebih fleksibel.</p>
</blockquote>

<p>Kami mengucapkan Selamat Hari Raya Idul Fitri 1446 H. Mohon Maaf Lahir dan Batin.</p>

<p><em>Tim Unit Hemodialisis<br>RISKA HD</em></p>`,
    externalLinks: null,
  },
  {
    title: "Olahraga Aman untuk Pasien Cuci Darah",
    slug: "olahraga-aman-pasien-cuci-darah",
    category: "artikel",
    excerpt: "Panduan aktivitas fisik dan olahraga yang aman dilakukan oleh pasien hemodialisis untuk menjaga kebugaran tubuh.",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
    content: `<h2>Pentingnya Olahraga bagi Pasien HD</h2>
<p>Banyak pasien hemodialisis menghindari olahraga karena khawatir membahayakan kondisi mereka. Padahal, aktivitas fisik yang tepat memberikan banyak manfaat:</p>
<ul>
  <li>Meningkatkan kekuatan otot dan stamina</li>
  <li>Membantu mengontrol tekanan darah</li>
  <li>Memperbaiki kualitas tidur</li>
  <li>Mengurangi stres dan depresi</li>
  <li>Meningkatkan nafsu makan</li>
  <li>Membantu mengontrol gula darah (bagi diabetisi)</li>
</ul>

<h2>Olahraga yang Direkomendasikan</h2>

<h3>1. Jalan Kaki</h3>
<p>Aktivitas paling sederhana dan aman. Mulai dengan 10-15 menit dan tingkatkan bertahap.</p>

<h3>2. Bersepeda Statis</h3>
<p>Latihan kardio yang rendah dampak. Bisa dilakukan bahkan selama sesi HD di beberapa fasilitas.</p>

<h3>3. Senam Ringan</h3>
<p>Gerakan peregangan dan penguatan otot yang lembut.</p>

<h3>4. Berenang</h3>
<p>Olahraga yang sangat baik untuk kardiovaskular dan persendian. Catatan: hanya jika akses vaskular sudah sembuh sempurna dan tidak menggunakan kateter.</p>

<h3>5. Yoga dan Tai Chi</h3>
<p>Membantu fleksibilitas, keseimbangan, dan relaksasi.</p>

<h2>Tips Olahraga Aman</h2>
<ul>
  <li>Konsultasikan dengan dokter sebelum memulai program olahraga</li>
  <li>Hindari olahraga berat pada hari HD</li>
  <li>Jangan berolahraga jika merasa tidak enak badan</li>
  <li>Lindungi lengan dengan akses vaskular dari benturan</li>
  <li>Jaga hidrasi sesuai batasan cairan Anda</li>
  <li>Berhenti jika merasa pusing, sesak, atau nyeri dada</li>
</ul>

<h2>Yang Perlu Dihindari</h2>
<ul>
  <li>Angkat beban berat dengan lengan yang ada aksesnya</li>
  <li>Olahraga kontak fisik (tinju, bela diri)</li>
  <li>Aktivitas dengan risiko jatuh tinggi</li>
  <li>Olahraga intensitas tinggi tanpa adaptasi bertahap</li>
</ul>`,
    externalLinks: JSON.stringify([
      { title: "Exercise for CKD Patients - Kidney.org", url: "https://www.kidney.org/atoz/content/stayfit" }
    ]),
  },
  {
    title: "Panduan Perjalanan untuk Pasien Hemodialisis",
    slug: "panduan-perjalanan-pasien-hemodialisis",
    category: "panduan",
    excerpt: "Tips dan persiapan yang perlu dilakukan pasien cuci darah saat bepergian jauh atau berlibur.",
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
    content: `<h2>Bepergian dengan Hemodialisis</h2>
<p>Menjadi pasien hemodialisis bukan berarti Anda tidak bisa bepergian. Dengan persiapan yang matang, Anda tetap bisa menikmati perjalanan dan liburan.</p>

<h2>Persiapan Sebelum Perjalanan</h2>

<h3>1. Konsultasi dengan Dokter</h3>
<ul>
  <li>Diskusikan rencana perjalanan minimal 4-6 minggu sebelumnya</li>
  <li>Minta surat keterangan medis dan rekam medis ringkas</li>
  <li>Tanyakan obat-obatan yang perlu dibawa</li>
</ul>

<h3>2. Atur Jadwal HD di Tempat Tujuan</h3>
<ul>
  <li>Cari unit HD di kota tujuan</li>
  <li>Hubungi untuk reservasi jadwal</li>
  <li>Konfirmasi ketersediaan dan biaya</li>
  <li>Kirim data medis yang diperlukan</li>
</ul>

<h3>3. Siapkan Dokumen Penting</h3>
<ul>
  <li>Kartu identitas dan asuransi</li>
  <li>Surat rujukan/pengantar dari dokter</li>
  <li>Hasil lab terbaru</li>
  <li>Daftar obat-obatan dan dosisnya</li>
  <li>Kontak darurat (dokter, keluarga)</li>
</ul>

<h2>Tips Selama Perjalanan</h2>

<h3>Naik Pesawat</h3>
<ul>
  <li>Pilih kursi dekat lorong untuk kemudahan bergerak</li>
  <li>Pakai pakaian longgar dan nyaman</li>
  <li>Gerakkan kaki secara berkala untuk mencegah pembekuan darah</li>
  <li>Bawa obat-obatan di tas kabin, bukan bagasi</li>
</ul>

<h3>Perjalanan Darat</h3>
<ul>
  <li>Berhenti setiap 2-3 jam untuk peregangan</li>
  <li>Bawa camilan sehat sesuai diet</li>
  <li>Hindari perjalanan terlalu lama di hari HD</li>
</ul>

<h2>Menjaga Diet Saat Liburan</h2>
<ul>
  <li>Tetap patuhi pembatasan cairan</li>
  <li>Pilih makanan yang aman (rendah kalium, fosfor, garam)</li>
  <li>Bawa camilan dari rumah jika perlu</li>
  <li>Informasikan kebutuhan diet khusus saat memesan makanan</li>
</ul>

<blockquote>
<p><strong>Ingat:</strong> Jangan pernah melewatkan jadwal HD hanya karena sedang berlibur. Kesehatan adalah prioritas utama!</p>
</blockquote>`,
    externalLinks: JSON.stringify([
      { title: "Global Dialysis - Find Dialysis Centers Worldwide", url: "https://www.globaldialysis.com" }
    ]),
  },
  {
    title: "Mengatasi Kram Otot Saat dan Setelah Hemodialisis",
    slug: "mengatasi-kram-otot-hemodialisis",
    category: "artikel",
    excerpt: "Penyebab dan cara mengatasi kram otot yang sering dialami pasien selama atau setelah sesi cuci darah.",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
    content: `<h2>Mengapa Kram Otot Terjadi?</h2>
<p>Kram otot adalah salah satu komplikasi paling umum selama hemodialisis. Kondisi ini terjadi karena:</p>
<ul>
  <li><strong>Ultrafiltrasi berlebih:</strong> Penarikan cairan terlalu cepat atau terlalu banyak</li>
  <li><strong>Ketidakseimbangan elektrolit:</strong> Terutama natrium, kalium, dan magnesium</li>
  <li><strong>Hipotensi:</strong> Penurunan tekanan darah saat HD</li>
  <li><strong>Berat kering terlalu rendah:</strong> Target berat setelah HD yang kurang tepat</li>
</ul>

<h2>Pencegahan Kram</h2>

<h3>Sebelum HD</h3>
<ul>
  <li>Batasi kenaikan berat badan antar sesi HD (idealnya &lt;3-4% berat kering)</li>
  <li>Hindari makanan sangat asin yang memicu haus berlebih</li>
  <li>Konsumsi makanan tinggi karbohidrat kompleks</li>
</ul>

<h3>Selama HD</h3>
<ul>
  <li>Informasikan perawat jika mulai terasa kram</li>
  <li>Lakukan peregangan ringan secara berkala</li>
  <li>Jangan tidur sepanjang sesi (agar bisa merasakan tanda awal kram)</li>
</ul>

<h2>Penanganan Saat Kram Terjadi</h2>
<ol>
  <li><strong>Peregangan otot:</strong> Regangkan otot yang kram perlahan-lahan</li>
  <li><strong>Pijat ringan:</strong> Pijat area yang kram dengan lembut</li>
  <li><strong>Kompres hangat:</strong> Dapat membantu melemaskan otot</li>
  <li><strong>Infus saline:</strong> Perawat mungkin memberikan cairan saline jika perlu</li>
  <li><strong>Penyesuaian UF:</strong> Kecepatan penarikan cairan mungkin dikurangi</li>
</ol>

<h2>Kapan Harus Khawatir?</h2>
<p>Segera hubungi tenaga medis jika:</p>
<ul>
  <li>Kram sangat parah dan tidak mereda</li>
  <li>Disertai mati rasa atau kesemutan yang menetap</li>
  <li>Terjadi perubahan warna kulit</li>
  <li>Kram terjadi berulang setiap sesi HD</li>
</ul>

<h2>Tips Tambahan</h2>
<ul>
  <li>Diskusikan dengan dokter tentang target berat kering yang tepat</li>
  <li>Tanyakan tentang penggunaan dialisat dengan kandungan natrium yang disesuaikan</li>
  <li>Pertimbangkan suplementasi magnesium jika direkomendasikan dokter</li>
</ul>`,
    externalLinks: null,
  },
];

const PATIENTS_DATA = [
  { name: "Siti Aminah", nik: "3275014501650001", gender: "female", bloodType: "A+", phone: "081234567801", address: "Jl. Melati No. 15", city: "Jakarta", province: "DKI Jakarta", primaryDiagnosis: "CKD Stage 5", vascularAccessType: "AVF", vascularAccessSite: "Left Forearm", dryWeight: 55, insuranceType: "BPJS", hdStartDate: "2022-03-15" },
  { name: "Ahmad Wijaya", nik: "3275011505700002", gender: "male", bloodType: "B+", phone: "081234567802", address: "Jl. Anggrek No. 23", city: "Jakarta", province: "DKI Jakarta", primaryDiagnosis: "CKD Stage 5 + DM Type 2", vascularAccessType: "AVF", vascularAccessSite: "Right Forearm", dryWeight: 68, insuranceType: "BPJS", hdStartDate: "2021-08-20" },
  { name: "Dewi Lestari", nik: "3275012008750003", gender: "female", bloodType: "O+", phone: "081234567803", address: "Jl. Mawar No. 8", city: "Bekasi", province: "Jawa Barat", primaryDiagnosis: "CKD Stage 5 + Hypertension", vascularAccessType: "AVG", vascularAccessSite: "Left Upper Arm", dryWeight: 52, insuranceType: "Asuransi Swasta", hdStartDate: "2023-01-10" },
  { name: "Bambang Susilo", nik: "3275010303680004", gender: "male", bloodType: "AB+", phone: "081234567804", address: "Jl. Kenanga No. 45", city: "Tangerang", province: "Banten", primaryDiagnosis: "CKD Stage 5", vascularAccessType: "CDL", vascularAccessSite: "Right Jugular", dryWeight: 72, insuranceType: "BPJS", hdStartDate: "2024-02-01" },
  { name: "Rina Kartini", nik: "3275015512800005", gender: "female", bloodType: "B-", phone: "081234567805", address: "Jl. Dahlia No. 12", city: "Depok", province: "Jawa Barat", primaryDiagnosis: "CKD Stage 5 + Heart Failure", vascularAccessType: "AVF", vascularAccessSite: "Left Forearm", dryWeight: 48, insuranceType: "BPJS", hdStartDate: "2022-11-05" },
  { name: "Hendra Pratama", nik: "3275010708720006", gender: "male", bloodType: "A-", phone: "081234567806", address: "Jl. Flamboyan No. 31", city: "Bogor", province: "Jawa Barat", primaryDiagnosis: "CKD Stage 4", vascularAccessType: "AVF", vascularAccessSite: "Right Forearm", dryWeight: 65, insuranceType: "Mandiri", hdStartDate: "2023-06-15" },
  { name: "Sri Wahyuni", nik: "3275013004780007", gender: "female", bloodType: "O-", phone: "081234567807", address: "Jl. Sakura No. 7", city: "Jakarta", province: "DKI Jakarta", primaryDiagnosis: "CKD Stage 5 + Anemia", vascularAccessType: "AVF", vascularAccessSite: "Left Forearm", dryWeight: 50, insuranceType: "BPJS", hdStartDate: "2021-12-20" },
  { name: "Agus Setiawan", nik: "3275011201650008", gender: "male", bloodType: "B+", phone: "081234567808", address: "Jl. Teratai No. 19", city: "Jakarta", province: "DKI Jakarta", primaryDiagnosis: "CKD Stage 5 + DM Type 2 + Hypertension", vascularAccessType: "AVG", vascularAccessSite: "Left Upper Arm", dryWeight: 78, insuranceType: "BPJS", hdStartDate: "2020-05-10" },
  { name: "Nurhasanah", nik: "3275012505850009", gender: "female", bloodType: "A+", phone: "081234567809", address: "Jl. Cemara No. 25", city: "Bekasi", province: "Jawa Barat", primaryDiagnosis: "CKD Stage 5", vascularAccessType: "AVF", vascularAccessSite: "Right Forearm", dryWeight: 58, insuranceType: "Asuransi Swasta", hdStartDate: "2023-09-01" },
  { name: "Rudi Hartono", nik: "3275010606700010", gender: "male", bloodType: "O+", phone: "081234567810", address: "Jl. Pinus No. 33", city: "Tangerang", province: "Banten", primaryDiagnosis: "CKD Stage 5 + Hyperkalemia", vascularAccessType: "CDL", vascularAccessSite: "Left Femoral", dryWeight: 70, insuranceType: "BPJS", hdStartDate: "2024-01-15" },
  { name: "Yanti Susanti", nik: "3275014408820011", gender: "female", bloodType: "AB-", phone: "081234567811", address: "Jl. Akasia No. 5", city: "Depok", province: "Jawa Barat", primaryDiagnosis: "CKD Stage 5 + SLE", vascularAccessType: "AVF", vascularAccessSite: "Left Forearm", dryWeight: 45, insuranceType: "BPJS", hdStartDate: "2022-07-20" },
  { name: "Dedi Kurniawan", nik: "3275011809750012", gender: "male", bloodType: "B+", phone: "081234567812", address: "Jl. Beringin No. 41", city: "Bogor", province: "Jawa Barat", primaryDiagnosis: "CKD Stage 5 + Polycystic Kidney", vascularAccessType: "AVF", vascularAccessSite: "Right Forearm", dryWeight: 75, insuranceType: "Mandiri", hdStartDate: "2021-04-05" },
  { name: "Ani Wulandari", nik: "3275012212880013", gender: "female", bloodType: "A+", phone: "081234567813", address: "Jl. Cendana No. 17", city: "Jakarta", province: "DKI Jakarta", primaryDiagnosis: "CKD Stage 5 + Hepatitis B", vascularAccessType: "AVF", vascularAccessSite: "Left Forearm", dryWeight: 53, insuranceType: "BPJS", hdStartDate: "2023-03-10" },
  { name: "Joko Purnomo", nik: "3275010101600014", gender: "male", bloodType: "O+", phone: "081234567814", address: "Jl. Mahoni No. 28", city: "Jakarta", province: "DKI Jakarta", primaryDiagnosis: "CKD Stage 5", vascularAccessType: "AVG", vascularAccessSite: "Right Upper Arm", dryWeight: 82, insuranceType: "BPJS", hdStartDate: "2020-11-25" },
  { name: "Lina Marlina", nik: "3275015003830015", gender: "female", bloodType: "B-", phone: "081234567815", address: "Jl. Jambu No. 9", city: "Bekasi", province: "Jawa Barat", primaryDiagnosis: "CKD Stage 5 + Pregnancy History", vascularAccessType: "AVF", vascularAccessSite: "Left Forearm", dryWeight: 56, insuranceType: "Asuransi Swasta", hdStartDate: "2022-09-15" },
];

// ==========================================
// Seeder Functions
// ==========================================

async function seedDiagnoses() {
  console.log("\n📋 Seeding diagnoses...");
  const insertedIds: Record<string, string> = {};

  for (const data of DIAGNOSES_DATA) {
    const existing = await db.select().from(diagnosis).where(eq(diagnosis.icdCode, data.icdCode!)).limit(1);

    if (existing.length === 0) {
      const result = await db.insert(diagnosis).values({
        id: createId(),
        ...data,
        isActive: true,
      }).returning();
      insertedIds[data.icdCode!] = result[0].id;
      console.log(`  ✓ Created diagnosis: ${data.name}`);
    } else {
      insertedIds[data.icdCode!] = existing[0].id;
      console.log(`  - Diagnosis exists: ${data.name}`);
    }
  }

  console.log(`✅ Diagnoses seeded: ${DIAGNOSES_DATA.length}`);
  return insertedIds;
}

async function seedMedications() {
  console.log("\n💊 Seeding medications...");
  const insertedIds: Record<string, string> = {};

  for (const data of MEDICATIONS_DATA) {
    const existing = await db.select().from(medication).where(eq(medication.name, data.name)).limit(1);

    if (existing.length === 0) {
      const result = await db.insert(medication).values({
        id: createId(),
        ...data,
        isActive: true,
      }).returning();
      insertedIds[data.name] = result[0].id;
      console.log(`  ✓ Created medication: ${data.name}`);
    } else {
      insertedIds[data.name] = existing[0].id;
      console.log(`  - Medication exists: ${data.name}`);
    }
  }

  console.log(`✅ Medications seeded: ${MEDICATIONS_DATA.length}`);
  return insertedIds;
}

async function seedProtocols() {
  console.log("\n📝 Seeding HD protocols...");

  for (const data of PROTOCOLS_DATA) {
    const existing = await db.select().from(hdProtocol).where(eq(hdProtocol.name, data.name)).limit(1);

    if (existing.length === 0) {
      await db.insert(hdProtocol).values({
        id: createId(),
        ...data,
        isActive: true,
      });
      console.log(`  ✓ Created protocol: ${data.name}`);
    } else {
      console.log(`  - Protocol exists: ${data.name}`);
    }
  }

  console.log(`✅ Protocols seeded: ${PROTOCOLS_DATA.length}`);
}

async function seedRooms() {
  console.log("\n🏥 Seeding rooms...");
  const insertedIds: Record<string, string> = {};

  for (const data of ROOMS_DATA) {
    const existing = await db.select().from(room).where(eq(room.code, data.code)).limit(1);

    if (existing.length === 0) {
      const result = await db.insert(room).values({
        id: createId(),
        ...data,
        isActive: true,
      }).returning();
      insertedIds[data.code] = result[0].id;
      console.log(`  ✓ Created room: ${data.name}`);
    } else {
      insertedIds[data.code] = existing[0].id;
      console.log(`  - Room exists: ${data.name}`);
    }
  }

  console.log(`✅ Rooms seeded: ${ROOMS_DATA.length}`);
  return insertedIds;
}

async function seedShifts() {
  console.log("\n⏰ Seeding shifts...");

  for (const data of SHIFTS_DATA) {
    const existing = await db.select().from(shift).where(eq(shift.name, data.name)).limit(1);

    if (existing.length === 0) {
      await db.insert(shift).values({
        id: createId(),
        ...data,
        isActive: true,
      });
      console.log(`  ✓ Created shift: ${data.name}`);
    } else {
      console.log(`  - Shift exists: ${data.name}`);
    }
  }

  console.log(`✅ Shifts seeded: ${SHIFTS_DATA.length}`);
}

async function seedMachines(roomIds: Record<string, string>) {
  console.log("\n🔧 Seeding HD machines...");
  const roomCodes = Object.keys(roomIds);

  for (let i = 0; i < MACHINES_DATA.length; i++) {
    const data = MACHINES_DATA[i];
    const existing = await db.select().from(hdMachine).where(eq(hdMachine.serialNumber, data.serialNumber)).limit(1);

    if (existing.length === 0) {
      // Assign to rooms in round-robin
      const roomCode = roomCodes[i % roomCodes.length];
      const purchaseDate = new Date();
      purchaseDate.setMonth(purchaseDate.getMonth() - Math.floor(Math.random() * 24));

      const lastMaintenance = new Date();
      lastMaintenance.setMonth(lastMaintenance.getMonth() - Math.floor(Math.random() * 3));

      const nextMaintenance = new Date(lastMaintenance);
      nextMaintenance.setMonth(nextMaintenance.getMonth() + 3);

      await db.insert(hdMachine).values({
        id: createId(),
        ...data,
        roomId: roomIds[roomCode],
        purchaseDate,
        lastMaintenanceDate: lastMaintenance,
        nextMaintenanceDate: nextMaintenance,
        status: "available",
        isActive: true,
      });
      console.log(`  ✓ Created machine: ${data.serialNumber} (${data.brand} ${data.model})`);
    } else {
      console.log(`  - Machine exists: ${data.serialNumber}`);
    }
  }

  console.log(`✅ Machines seeded: ${MACHINES_DATA.length}`);
}

async function createUserWithAccount(
  userData: { name: string; email: string; role: string; nik?: string },
  password: string
): Promise<string> {
  const existing = await db.select().from(user).where(eq(user.email, userData.email)).limit(1);

  if (existing.length > 0) {
    console.log(`  - User exists: ${userData.email}`);
    return existing[0].id;
  }

  const userId = createId();
  const now = new Date();
  const hashedPassword = await hashPassword(password);

  await db.insert(user).values({
    id: userId,
    name: userData.name,
    email: userData.email,
    emailVerified: true,
    role: userData.role,
    nik: userData.nik || null,
    isActivated: !!userData.nik,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(account).values({
    id: createId(),
    accountId: userId,
    providerId: "credential",
    userId: userId,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`  ✓ Created user: ${userData.email}`);
  return userId;
}

async function seedDoctors() {
  console.log("\n👨‍⚕️ Seeding doctors...");
  const doctorIds: string[] = [];
  const defaultPassword = "test123";

  for (let i = 0; i < DOCTORS_DATA.length; i++) {
    const data = DOCTORS_DATA[i];
    const existing = await db.select().from(doctor).where(eq(doctor.nip, data.nip!)).limit(1);

    if (existing.length === 0) {
      // Generate unique NIK for doctor
      const doctorNik = `3175020101${String(80 + i).padStart(2, "0")}00${String(10 + i).padStart(2, "0")}`;
      const userId = await createUserWithAccount(
        { name: data.name, email: data.email, role: "dokter", nik: doctorNik },
        defaultPassword
      );

      const licenseExpiry = new Date();
      licenseExpiry.setFullYear(licenseExpiry.getFullYear() + 3);

      const result = await db.insert(doctor).values({
        id: createId(),
        userId,
        nip: data.nip,
        sip: data.sip,
        specialization: data.specialization,
        licenseExpiry,
        isActive: true,
      }).returning();

      doctorIds.push(result[0].id);
      console.log(`  ✓ Created doctor: ${data.name}`);
    } else {
      doctorIds.push(existing[0].id);
      console.log(`  - Doctor exists: ${data.name}`);
    }
  }

  console.log(`✅ Doctors seeded: ${DOCTORS_DATA.length}`);
  return doctorIds;
}

async function seedNurses() {
  console.log("\n👩‍⚕️ Seeding nurses...");
  const defaultPassword = "test123";

  for (let i = 0; i < NURSES_DATA.length; i++) {
    const data = NURSES_DATA[i];
    const existing = await db.select().from(nurse).where(eq(nurse.nip, data.nip!)).limit(1);

    if (existing.length === 0) {
      // Generate unique NIK for nurse
      const nurseNik = `3175030101${String(85 + i).padStart(2, "0")}00${String(20 + i).padStart(2, "0")}`;
      const userId = await createUserWithAccount(
        { name: data.name, email: data.email, role: "perawat", nik: nurseNik },
        defaultPassword
      );

      const certExpiry = new Date();
      certExpiry.setFullYear(certExpiry.getFullYear() + 2);

      await db.insert(nurse).values({
        id: createId(),
        userId,
        nip: data.nip,
        sip: data.sip,
        certification: data.certification,
        certificationExpiry: certExpiry,
        isActive: true,
      });

      console.log(`  ✓ Created nurse: ${data.name}`);
    } else {
      console.log(`  - Nurse exists: ${data.name}`);
    }
  }

  console.log(`✅ Nurses seeded: ${NURSES_DATA.length}`);
}

async function seedPatients(doctorIds: string[], diagnosisIds: Record<string, string>, medicationIds: Record<string, string>) {
  console.log("\n🏥 Seeding patients...");
  let mrNumber = 1000;

  for (const data of PATIENTS_DATA) {
    const existing = await db.select().from(patient).where(eq(patient.nik, data.nik!)).limit(1);

    if (existing.length === 0) {
      mrNumber++;
      const medicalRecordNumber = `MR-${new Date().getFullYear()}-${String(mrNumber).padStart(4, "0")}`;

      // Random assign primary doctor
      const primaryDoctorId = doctorIds[Math.floor(Math.random() * doctorIds.length)];

      // Calculate date of birth (age 40-75)
      const age = 40 + Math.floor(Math.random() * 35);
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - age);
      dob.setMonth(Math.floor(Math.random() * 12));
      dob.setDate(1 + Math.floor(Math.random() * 28));

      const hdStartDate = new Date(data.hdStartDate);

      const result = await db.insert(patient).values({
        id: createId(),
        medicalRecordNumber,
        name: data.name,
        nik: data.nik,
        dateOfBirth: dob,
        gender: data.gender,
        bloodType: data.bloodType,
        phone: data.phone,
        address: data.address,
        city: data.city,
        province: data.province,
        emergencyContactName: `Keluarga ${data.name.split(" ")[0]}`,
        emergencyContactPhone: data.phone?.replace(/801/, "901"),
        emergencyContactRelation: data.gender === "female" ? "Suami" : "Istri",
        primaryDiagnosis: data.primaryDiagnosis,
        hdStartDate,
        vascularAccessType: data.vascularAccessType,
        vascularAccessSite: data.vascularAccessSite,
        dryWeight: data.dryWeight,
        insuranceType: data.insuranceType,
        insuranceNumber: `INS-${data.nik?.slice(-6)}`,
        primaryDoctorId,
        isActive: true,
      }).returning();

      const patientId = result[0].id;

      // Add CKD diagnosis
      await db.insert(patientDiagnosis).values({
        id: createId(),
        patientId,
        diagnosisId: diagnosisIds["N18.5"],
        diagnosisType: "primary",
        diagnosedAt: hdStartDate,
        notes: "Diagnosa utama saat mulai HD",
      });

      // Add random secondary diagnoses
      const secondaryDiagnoses = ["I10", "E11.65", "D63.1"].slice(0, 1 + Math.floor(Math.random() * 2));
      for (const icdCode of secondaryDiagnoses) {
        if (diagnosisIds[icdCode]) {
          await db.insert(patientDiagnosis).values({
            id: createId(),
            patientId,
            diagnosisId: diagnosisIds[icdCode],
            diagnosisType: "secondary",
            diagnosedAt: hdStartDate,
          });
        }
      }

      // Add routine medications
      const routineMeds = ["Epoetin Alfa", "Calcium Carbite", "Amlodipine"].slice(0, 2 + Math.floor(Math.random() * 2));
      for (const medName of routineMeds) {
        if (medicationIds[medName]) {
          const med = MEDICATIONS_DATA.find(m => m.name === medName);
          await db.insert(patientMedication).values({
            id: createId(),
            patientId,
            medicationId: medicationIds[medName],
            dosage: med?.defaultDosage || "1 tab",
            frequency: medName === "Epoetin Alfa" ? "3x seminggu" : "1x sehari",
            route: med?.route || "PO",
            startDate: hdStartDate,
            prescribedById: primaryDoctorId,
            isActive: true,
          });
        }
      }

      console.log(`  ✓ Created patient: ${data.name} (${medicalRecordNumber})`);
    } else {
      console.log(`  - Patient exists: ${data.name}`);
    }
  }

  console.log(`✅ Patients seeded: ${PATIENTS_DATA.length}`);
}

async function seedSchedules() {
  console.log("\n📅 Seeding schedules...");

  // Get all nurses
  const allNurses = await db.select().from(nurse).where(eq(nurse.isActive, true));
  if (allNurses.length === 0) {
    console.log("  ⚠️ No nurses found, skipping schedules");
    return { nurseScheduleCount: 0, patientScheduleCount: 0 };
  }

  // Get all patients
  const allPatients = await db.select().from(patient).where(eq(patient.isActive, true));
  if (allPatients.length === 0) {
    console.log("  ⚠️ No patients found, skipping schedules");
    return { nurseScheduleCount: 0, patientScheduleCount: 0 };
  }

  // Get all shifts
  const allShifts = await db.select().from(shift).where(eq(shift.isActive, true));
  if (allShifts.length === 0) {
    console.log("  ⚠️ No shifts found, skipping schedules");
    return { nurseScheduleCount: 0, patientScheduleCount: 0 };
  }

  // Get all rooms
  const allRooms = await db.select().from(room).where(eq(room.isActive, true));

  // Get all machines
  const allMachines = await db.select().from(hdMachine).where(eq(hdMachine.isActive, true));

  let nurseScheduleCount = 0;
  let patientScheduleCount = 0;

  // Generate schedules for the next 14 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const scheduleDate = new Date(today);
    scheduleDate.setDate(scheduleDate.getDate() + dayOffset);

    // Skip Sundays (day 0)
    if (scheduleDate.getDay() === 0) continue;

    // Seed nurse schedules - assign nurses to shifts
    for (let shiftIndex = 0; shiftIndex < allShifts.length; shiftIndex++) {
      const currentShift = allShifts[shiftIndex];

      // Assign 2 nurses per shift (round-robin based on day and shift)
      const nursesPerShift = 2;
      for (let n = 0; n < nursesPerShift; n++) {
        const nurseIndex = (dayOffset * allShifts.length + shiftIndex + n) % allNurses.length;
        const selectedNurse = allNurses[nurseIndex];
        const selectedRoom = allRooms.length > 0 ? allRooms[shiftIndex % allRooms.length] : null;

        // Check if schedule already exists
        const existingNurseSchedule = await db
          .select()
          .from(nurseSchedule)
          .where(eq(nurseSchedule.nurseId, selectedNurse.id))
          .limit(1);

        // Only create if no schedules exist for this nurse (to avoid duplicates on re-run)
        if (existingNurseSchedule.length === 0 || dayOffset > 0) {
          try {
            await db.insert(nurseSchedule).values({
              id: createId(),
              nurseId: selectedNurse.id,
              shiftId: currentShift.id,
              scheduleDate,
              roomId: selectedRoom?.id || null,
              status: dayOffset < 0 ? "present" : "scheduled",
              notes: null,
            });
            nurseScheduleCount++;
          } catch {
            // Ignore duplicate key errors
          }
        }
      }
    }

    // Seed patient schedules - patients typically have 3 sessions per week
    // Most HD patients are scheduled Monday-Wednesday-Friday or Tuesday-Thursday-Saturday
    const dayOfWeek = scheduleDate.getDay();
    const isMWF = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5; // Mon, Wed, Fri
    const isTTS = dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6; // Tue, Thu, Sat

    for (let patientIndex = 0; patientIndex < allPatients.length; patientIndex++) {
      const currentPatient = allPatients[patientIndex];

      // Assign patients to MWF or TTS based on index (odd/even)
      const shouldSchedule = patientIndex % 2 === 0 ? isMWF : isTTS;
      if (!shouldSchedule) continue;

      // Assign shift based on patient index (distribute across shifts)
      const shiftIndex = patientIndex % Math.max(allShifts.length - 1, 1); // Exclude night shift for regular patients
      const selectedShift = allShifts[shiftIndex];

      // Assign room and machine
      const roomIndex = patientIndex % allRooms.length;
      const selectedRoom = allRooms.length > 0 ? allRooms[roomIndex] : null;

      // Assign machine (if available)
      const machineIndex = patientIndex % allMachines.length;
      const selectedMachine = allMachines.length > 0 ? allMachines[machineIndex] : null;

      // Assign nurse (from the shift)
      const nurseIndex = patientIndex % allNurses.length;
      const selectedNurse = allNurses[nurseIndex];

      // Determine status based on date
      let status = "scheduled";
      if (dayOffset < 0) {
        status = Math.random() > 0.1 ? "completed" : "no_show";
      } else if (dayOffset === 0) {
        status = "confirmed";
      }

      try {
        await db.insert(patientSchedule).values({
          id: createId(),
          patientId: currentPatient.id,
          shiftId: selectedShift.id,
          scheduleDate,
          roomId: selectedRoom?.id || null,
          machineId: selectedMachine?.id || null,
          nurseId: selectedNurse.id,
          status,
          notes: null,
        });
        patientScheduleCount++;
      } catch {
        // Ignore duplicate key errors
      }
    }
  }

  console.log(`  ✓ Created ${nurseScheduleCount} nurse schedules`);
  console.log(`  ✓ Created ${patientScheduleCount} patient schedules`);
  console.log(`✅ Schedules seeded`);

  return { nurseScheduleCount, patientScheduleCount };
}

async function seedAdminUser() {
  console.log("\n👤 Seeding admin user...");
  const adminEmail = "admin@test.com";
  const defaultPassword = "test123";

  const userId = await createUserWithAccount(
    { name: "Administrator", email: adminEmail, role: "admin", nik: "3175010101800001" },
    defaultPassword
  );

  console.log(`✅ Admin user created: ${adminEmail} / ${defaultPassword}`);
  return userId;
}

async function seedRuangInformasi(authorId: string) {
  console.log("\n📰 Seeding ruang informasi...");

  for (const data of RUANG_INFORMASI_DATA) {
    const existing = await db.select().from(ruangInformasi).where(eq(ruangInformasi.slug, data.slug)).limit(1);

    if (existing.length === 0) {
      const publishedAt = new Date();
      publishedAt.setDate(publishedAt.getDate() - Math.floor(Math.random() * 30));

      await db.insert(ruangInformasi).values({
        id: createId(),
        title: data.title,
        slug: data.slug,
        category: data.category,
        content: data.content,
        excerpt: data.excerpt,
        imageUrl: data.imageUrl,
        videoUrl: null,
        externalLinks: data.externalLinks,
        authorId,
        publishedAt,
        isPublished: true,
        isActive: true,
        viewCount: Math.floor(Math.random() * 500) + 50,
      });
      console.log(`  ✓ Created content: ${data.title}`);
    } else {
      console.log(`  - Content exists: ${data.title}`);
    }
  }

  console.log(`✅ Ruang Informasi seeded: ${RUANG_INFORMASI_DATA.length}`);
}

async function seedEdukatorUser() {
  console.log("\n📚 Seeding edukator user...");
  const edukatorEmail = "edukator@test.com";
  const defaultPassword = "test123";

  const userId = await createUserWithAccount(
    { name: "Tim Edukasi HD", email: edukatorEmail, role: "edukator", nik: "3175010101850002" },
    defaultPassword
  );

  console.log(`✅ Edukator user created: ${edukatorEmail} / ${defaultPassword}`);
  return userId;
}

async function seedPatientUsers() {
  console.log("\n👥 Seeding patient user accounts...");
  const defaultPassword = "test123";
  let createdCount = 0;

  // Get first 3 patients to create user accounts for demo
  const demoPatients = await db.select().from(patient).where(eq(patient.isActive, true)).limit(3);

  for (const p of demoPatients) {
    // Skip if patient already has userId
    if (p.userId) {
      console.log(`  - Patient ${p.name} already has account`);
      continue;
    }

    // Create email from patient name
    const emailName = p.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
    const patientEmail = `${emailName}@test.com`;

    // Use patient's NIK for activation
    const userId = await createUserWithAccount(
      { name: p.name, email: patientEmail, role: "pasien", nik: p.nik || undefined },
      defaultPassword
    );

    // Update patient with userId
    await db.update(patient).set({ userId }).where(eq(patient.id, p.id));

    console.log(`  ✓ Created patient account: ${patientEmail}`);
    createdCount++;
  }

  console.log(`✅ Patient accounts created: ${createdCount}`);
  return createdCount;
}

async function main() {
  console.log("🚀 Starting RISKA HD Demo Seeder...\n");
  console.log("=".repeat(50));

  try {
    // Seed master data
    const diagnosisIds = await seedDiagnoses();
    const medicationIds = await seedMedications();
    await seedProtocols();
    const roomIds = await seedRooms();
    await seedShifts();
    await seedMachines(roomIds);

    // Seed users (doctors, nurses, admin, edukator)
    const adminUserId = await seedAdminUser();
    await seedEdukatorUser();
    const doctorIds = await seedDoctors();
    await seedNurses();

    // Seed ruang informasi content
    await seedRuangInformasi(adminUserId);

    // Seed patients with diagnoses and medications
    await seedPatients(doctorIds, diagnosisIds, medicationIds);

    // Create patient user accounts for demo
    await seedPatientUsers();

    // Seed schedules for nurses and patients
    const scheduleStats = await seedSchedules();

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Demo seeding completed successfully!\n");

    console.log("📊 Summary:");
    console.log(`   - Diagnoses: ${DIAGNOSES_DATA.length}`);
    console.log(`   - Medications: ${MEDICATIONS_DATA.length}`);
    console.log(`   - Protocols: ${PROTOCOLS_DATA.length}`);
    console.log(`   - Rooms: ${ROOMS_DATA.length}`);
    console.log(`   - Shifts: ${SHIFTS_DATA.length}`);
    console.log(`   - Machines: ${MACHINES_DATA.length}`);
    console.log(`   - Doctors: ${DOCTORS_DATA.length}`);
    console.log(`   - Nurses: ${NURSES_DATA.length}`);
    console.log(`   - Patients: ${PATIENTS_DATA.length}`);
    console.log(`   - Ruang Informasi: ${RUANG_INFORMASI_DATA.length}`);
    console.log(`   - Nurse Schedules: ${scheduleStats.nurseScheduleCount}`);
    console.log(`   - Patient Schedules: ${scheduleStats.patientScheduleCount}`);

    console.log("\n🔐 Demo Login Accounts (Password: test123):");
    console.log("   ┌─────────────┬──────────────────────────┐");
    console.log("   │ Role        │ Email                    │");
    console.log("   ├─────────────┼──────────────────────────┤");
    console.log("   │ Admin       │ admin@test.com           │");
    console.log("   │ Dokter      │ dr.ahmad@test.com        │");
    console.log("   │ Perawat     │ ns.ratna@test.com        │");
    console.log("   │ Edukator    │ edukator@test.com        │");
    console.log("   │ Pasien      │ siti.aminah@test.com     │");
    console.log("   │ Pasien      │ ahmad.wijaya@test.com    │");
    console.log("   │ Pasien      │ dewi.lestari@test.com    │");
    console.log("   └─────────────┴──────────────────────────┘");

  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
