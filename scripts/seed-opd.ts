import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-serverless";
import { opd } from "../src/db/schema";
import { sql } from "drizzle-orm";

config({ path: ".env" });

const db = drizzle(process.env.DATABASE_URL!);

const opdData = [
  // OPD Utama (parent_id: null)
  { id: 1, nama: "DINAS KESEHATAN", singkatan: "DINKES", slug: "dinkes", parent_id: null },
  { id: 2, nama: "DINAS PENDIDIKAN DAN KEBUDAYAAN", singkatan: "DISDIK", slug: "disdik", parent_id: null },
  { id: 3, nama: "BADAN PENDAPATAN DAERAH", singkatan: "BAPENDA", slug: "bapenda", parent_id: null },
  { id: 4, nama: "BADAN KESATUAN BANGSA DAN POLITIK", singkatan: "KESBANGPOL", slug: "kesbangpol", parent_id: null },
  { id: 6, nama: "BADAN PERENCANAAN PEMBANGUNAN, RISET, DAN INOVASI DAERAH", singkatan: "BAPPEDA", slug: "bappeda", parent_id: null },
  { id: 7, nama: "BADAN PENANGGULANGAN BENCANA DAERAH", singkatan: "BPBD", slug: "bpbd", parent_id: null },
  { id: 8, nama: "DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL", singkatan: "DISDUKCAPIL", slug: "disdukcapil", parent_id: null },
  { id: 9, nama: "DINAS KETAHANAN PANGAN, PERIKANAN DAN PERTANIAN", singkatan: "DKPP", slug: "dkpp", parent_id: null },
  { id: 10, nama: "DINAS KETENAGAKERJAAN", singkatan: "DISNAKER", slug: "disnaker", parent_id: null },
  { id: 11, nama: "DINAS KOMUNIKASI DAN INFORMATIKA", singkatan: "DISKOMINFO", slug: "diskominfo", parent_id: null },
  { id: 12, nama: "DINAS KOPERASI, USAHA MIKRO, PERINDUSTRIAN DAN PERDAGANGAN", singkatan: "DISKOPERIN", slug: "diskoperin", parent_id: null },
  { id: 13, nama: "DINAS LINGKUNGAN HIDUP", singkatan: "DLH", slug: "dlh", parent_id: null },
  { id: 14, nama: "DINAS PEKERJAAN UMUM DAN PENATAAN RUANG KOTA", singkatan: "DPUPR", slug: "dpupr", parent_id: null },
  { id: 15, nama: "DINAS PEMADAM KEBAKARAN DAN PENYELAMATAN", singkatan: "DAMKAR", slug: "damkar", parent_id: null },
  { id: 16, nama: "DINAS PEMBERDAYAAN PEREMPUAN, PERLINDUNGAN ANAK, DAN KELUARGA BERENCANA", singkatan: "DP3AKB", slug: "dp3akb", parent_id: null },
  { id: 17, nama: "DINAS PEMUDA, OLAHRAGA DAN PARIWISATA", singkatan: "DISPORAPAR", slug: "disporapar", parent_id: null },
  { id: 18, nama: "DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU", singkatan: "DPMPTSP", slug: "dpmptsp", parent_id: null },
  { id: 19, nama: "DINAS PERHUBUNGAN", singkatan: "DISHUB", slug: "dishub", parent_id: null },
  { id: 20, nama: "DINAS PERPUSTAKAAN DAN KEARSIPAN", singkatan: "DISPUSIP", slug: "dispusip", parent_id: null },
  { id: 21, nama: "DINAS PERUMAHAN, KAWASAN PERMUKIMAN DAN PERTANAHAN", singkatan: "DPKPP", slug: "dpkpp", parent_id: null },
  { id: 22, nama: "DINAS SOSIAL DAN PEMBERDAYAAN MASYARAKAT", singkatan: "DINSOS", slug: "dinsos", parent_id: null },
  { id: 23, nama: "INSPEKTORAT DAERAH", singkatan: "INSPEKTORAT", slug: "inspektorat", parent_id: null },
  { id: 24, nama: "RSUD TAMAN HUSADA", singkatan: "RSUD TH", slug: "rsud-taman-husada", parent_id: null },
  { id: 25, nama: "SATUAN POLISI PAMONG PRAJA", singkatan: "SATPOL PP", slug: "satpol-pp", parent_id: null },
  { id: 26, nama: "SEKRETARIAT DAERAH", singkatan: "SETDA", slug: "setda", parent_id: null },
  { id: 27, nama: "SEKRETARIAT DEWAN PERWAKILAN RAKYAT DAERAH", singkatan: "SETWAN", slug: "setwan", parent_id: null },
  { id: 28, nama: "SEKRETARIAT DEWAN PERWAKILAN RAKYAT DAERAH SELATAN", singkatan: "SETWAN SELATAN", slug: "setwan-selatan", parent_id: null },
  { id: 29, nama: "BADAN PENGELOLA KEUANGAN DAN ASET DAERAH", singkatan: "BPKAD", slug: "bpkad", parent_id: null },
  { id: 30, nama: "BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA", singkatan: "BKPSDM", slug: "bkpsdm", parent_id: null },
  { id: 31, nama: "KECAMATAN BONTANG UTARA", singkatan: "BONTANG UTARA", slug: "kec-bontang-utara", parent_id: null },
  { id: 32, nama: "KECAMATAN BONTANG SELATAN", singkatan: "BONTANG SELATAN", slug: "kec-bontang-selatan", parent_id: null },
  { id: 33, nama: "KECAMATAN BONTANG BARAT", singkatan: "BONTANG BARAT", slug: "kec-bontang-barat", parent_id: null },

  // UPT - Dinas Kesehatan (parent_id: 1)
  { id: 34, nama: "PUSKESMAS BONTANG SELATAN II", singkatan: "PUSKESMAS BTS II", slug: "puskesmas-bontang-selatan-2", parent_id: 1 },
  { id: 35, nama: "UPT LABORATORIUM KESEHATAN", singkatan: "UPT LABKES", slug: "upt-laboratorium-kesehatan", parent_id: 1 },
  { id: 36, nama: "UPT PUSKESMAS BONTANG BARAT", singkatan: "PUSKESMAS BTB", slug: "upt-puskesmas-bontang-barat", parent_id: 1 },
  { id: 37, nama: "UPT PUSKESMAS BONTANG LESTARI", singkatan: "PUSKESMAS BTL", slug: "upt-puskesmas-bontang-lestari", parent_id: 1 },
  { id: 38, nama: "UPT PUSKESMAS BONTANG SELATAN I", singkatan: "PUSKESMAS BTS I", slug: "upt-puskesmas-bontang-selatan-1", parent_id: 1 },
  { id: 39, nama: "UPT PUSKESMAS BONTANG SELATAN II", singkatan: "UPT PUSKESMAS BTS II", slug: "upt-puskesmas-bontang-selatan-2", parent_id: 1 },
  { id: 40, nama: "UPT PUSKESMAS BONTANG UTARA I", singkatan: "PUSKESMAS BTU I", slug: "upt-puskesmas-bontang-utara-1", parent_id: 1 },
  { id: 41, nama: "UPT PUSKESMAS BONTANG UTARA II", singkatan: "PUSKESMAS BTU II", slug: "upt-puskesmas-bontang-utara-2", parent_id: 1 },

  // Sekolah - Dinas Pendidikan dan Kebudayaan (parent_id: 2)
  { id: 42, nama: "SD NEGERI 001 BONTANG BARAT", singkatan: "SDN 001 BTB", slug: "sdn-001-bontang-barat", parent_id: 2 },
  { id: 43, nama: "SD NEGERI 001 BONTANG SELATAN", singkatan: "SDN 001 BTS", slug: "sdn-001-bontang-selatan", parent_id: 2 },
  { id: 44, nama: "SD NEGERI 001 BONTANG UTARA", singkatan: "SDN 001 BTU", slug: "sdn-001-bontang-utara", parent_id: 2 },
  { id: 45, nama: "SD NEGERI 002 BONTANG BARAT", singkatan: "SDN 002 BTB", slug: "sdn-002-bontang-barat", parent_id: 2 },
  { id: 46, nama: "SD NEGERI 002 BONTANG SELATAN", singkatan: "SDN 002 BTS", slug: "sdn-002-bontang-selatan", parent_id: 2 },
  { id: 47, nama: "SD NEGERI 002 BONTANG UTARA", singkatan: "SDN 002 BTU", slug: "sdn-002-bontang-utara", parent_id: 2 },
  { id: 48, nama: "SD NEGERI 003 BONTANG BARAT", singkatan: "SDN 003 BTB", slug: "sdn-003-bontang-barat", parent_id: 2 },
  { id: 49, nama: "SD NEGERI 003 BONTANG SELATAN", singkatan: "SDN 003 BTS", slug: "sdn-003-bontang-selatan", parent_id: 2 },
  { id: 50, nama: "SD NEGERI 003 BONTANG UTARA", singkatan: "SDN 003 BTU", slug: "sdn-003-bontang-utara", parent_id: 2 },
  { id: 51, nama: "SD NEGERI 004 BONTANG BARAT", singkatan: "SDN 004 BTB", slug: "sdn-004-bontang-barat", parent_id: 2 },
  { id: 52, nama: "SD NEGERI 004 BONTANG SELATAN", singkatan: "SDN 004 BTS", slug: "sdn-004-bontang-selatan", parent_id: 2 },
  { id: 53, nama: "SD NEGERI 004 BONTANG UTARA", singkatan: "SDN 004 BTU", slug: "sdn-004-bontang-utara", parent_id: 2 },
  { id: 54, nama: "SD NEGERI 005 BONTANG SELATAN", singkatan: "SDN 005 BTS", slug: "sdn-005-bontang-selatan", parent_id: 2 },
  { id: 55, nama: "SD NEGERI 005 BONTANG UTARA", singkatan: "SDN 005 BTU", slug: "sdn-005-bontang-utara", parent_id: 2 },
  { id: 56, nama: "SD NEGERI 006 BONTANG SELATAN", singkatan: "SDN 006 BTS", slug: "sdn-006-bontang-selatan", parent_id: 2 },
  { id: 57, nama: "SD NEGERI 006 BONTANG UTARA", singkatan: "SDN 006 BTU", slug: "sdn-006-bontang-utara", parent_id: 2 },
  { id: 58, nama: "SD NEGERI 007 BONTANG SELATAN", singkatan: "SDN 007 BTS", slug: "sdn-007-bontang-selatan", parent_id: 2 },
  { id: 59, nama: "SD NEGERI 007 BONTANG UTARA", singkatan: "SDN 007 BTU", slug: "sdn-007-bontang-utara", parent_id: 2 },
  { id: 60, nama: "SD NEGERI 008 BONTANG UTARA", singkatan: "SDN 008 BTU", slug: "sdn-008-bontang-utara", parent_id: 2 },
  { id: 61, nama: "SD NEGERI 009 BONTANG SELATAN", singkatan: "SDN 009 BTS", slug: "sdn-009-bontang-selatan", parent_id: 2 },
  { id: 62, nama: "SD NEGERI 009 BONTANG UTARA", singkatan: "SDN 009 BTU", slug: "sdn-009-bontang-utara", parent_id: 2 },
  { id: 63, nama: "SD NEGERI 010 BONTANG SELATAN", singkatan: "SDN 010 BTS", slug: "sdn-010-bontang-selatan", parent_id: 2 },
  { id: 64, nama: "SD NEGERI 010 BONTANG UTARA", singkatan: "SDN 010 BTU", slug: "sdn-010-bontang-utara", parent_id: 2 },
  { id: 65, nama: "SD NEGERI 011 BONTANG SELATAN", singkatan: "SDN 011 BTS", slug: "sdn-011-bontang-selatan", parent_id: 2 },
  { id: 66, nama: "SD NEGERI 011 BONTANG UTARA", singkatan: "SDN 011 BTU", slug: "sdn-011-bontang-utara", parent_id: 2 },
  { id: 67, nama: "SD NEGERI 012 BONTANG SELATAN", singkatan: "SDN 012 BTS", slug: "sdn-012-bontang-selatan", parent_id: 2 },
  { id: 68, nama: "SD NEGERI 013 BONTANG SELATAN", singkatan: "SDN 013 BTS", slug: "sdn-013-bontang-selatan", parent_id: 2 },
  { id: 69, nama: "SD NEGERI 014 BONTANG SELATAN", singkatan: "SDN 014 BTS", slug: "sdn-014-bontang-selatan", parent_id: 2 },
  { id: 70, nama: "SD NEGERI 015 BONTANG SELATAN", singkatan: "SDN 015 BTS", slug: "sdn-015-bontang-selatan", parent_id: 2 },
  { id: 71, nama: "SD NEGERI 016 BONTANG SELATAN", singkatan: "SDN 016 BTS", slug: "sdn-016-bontang-selatan", parent_id: 2 },
  { id: 72, nama: "SMP NEGERI 1 BONTANG", singkatan: "SMPN 1 BTG", slug: "smpn-1-bontang", parent_id: 2 },
  { id: 73, nama: "SMP NEGERI 2 BONTANG", singkatan: "SMPN 2 BTG", slug: "smpn-2-bontang", parent_id: 2 },
  { id: 74, nama: "SMP NEGERI 3 BONTANG", singkatan: "SMPN 3 BTG", slug: "smpn-3-bontang", parent_id: 2 },
  { id: 75, nama: "SMP NEGERI 4 BONTANG", singkatan: "SMPN 4 BTG", slug: "smpn-4-bontang", parent_id: 2 },
  { id: 76, nama: "SMP NEGERI 5 BONTANG", singkatan: "SMPN 5 BTG", slug: "smpn-5-bontang", parent_id: 2 },
  { id: 77, nama: "SMP NEGERI 6 BONTANG", singkatan: "SMPN 6 BTG", slug: "smpn-6-bontang", parent_id: 2 },
  { id: 78, nama: "SMP NEGERI 7 BONTANG", singkatan: "SMPN 7 BTG", slug: "smpn-7-bontang", parent_id: 2 },
  { id: 79, nama: "SMP NEGERI 8 BONTANG", singkatan: "SMPN 8 BTG", slug: "smpn-8-bontang", parent_id: 2 },
  { id: 80, nama: "SMP NEGERI 9 BONTANG", singkatan: "SMPN 9 BTG", slug: "smpn-9-bontang", parent_id: 2 },
  { id: 81, nama: "TK NEGERI 1 BONTANG", singkatan: "TKN 1 BTG", slug: "tkn-1-bontang", parent_id: 2 },
  { id: 82, nama: "TK NEGERI 3 BONTANG", singkatan: "TKN 3 BTG", slug: "tkn-3-bontang", parent_id: 2 },

  // UPT - Dinas Ketahanan Pangan, Perikanan dan Pertanian (parent_id: 9)
  { id: 83, nama: "UPT BALAI BENIH IKAN", singkatan: "UPT BBI", slug: "upt-balai-benih-ikan", parent_id: 9 },
  { id: 84, nama: "UPT RUMAH PEMOTONGAN HEWAN", singkatan: "UPT RPH", slug: "upt-rumah-pemotongan-hewan", parent_id: 9 },
  { id: 85, nama: "UPT TEMPAT PELELANGAN IKAN", singkatan: "UPT TPI", slug: "upt-tempat-pelelangan-ikan", parent_id: 9 },

  // UPT - Dinas Koperasi, Usaha Mikro, Perindustrian dan Perdagangan (parent_id: 12)
  { id: 86, nama: "UPT METROLOGI LEGAL", singkatan: "UPT METROLOGI", slug: "upt-metrologi-legal", parent_id: 12 },
  { id: 87, nama: "UPT PASAR", singkatan: "UPT PASAR", slug: "upt-pasar", parent_id: 12 },

  // UPT - Dinas Lingkungan Hidup (parent_id: 13)
  { id: 88, nama: "UPT TEMPAT PEMROSESAN AKHIR", singkatan: "UPT TPA", slug: "upt-tempat-pemrosesan-akhir", parent_id: 13 },

  // UPT - Dinas Pemberdayaan Perempuan, Perlindungan Anak, dan KB (parent_id: 16)
  { id: 89, nama: "UPT PERLINDUNGAN PEREMPUAN DAN ANAK", singkatan: "UPT PPA", slug: "upt-perlindungan-perempuan-dan-anak", parent_id: 16 },

  // UPT - Dinas Perumahan, Kawasan Permukiman dan Pertanahan (parent_id: 21)
  { id: 90, nama: "UPT RUMAH SUSUN SEDERHANA SEWA", singkatan: "UPT RUSUNAWA", slug: "upt-rumah-susun-sederhana-sewa", parent_id: 21 },

  // Kelurahan - Kecamatan Bontang Utara (parent_id: 31)
  { id: 91, nama: "KELURAHAN API-API", singkatan: "API-API", slug: "kel-api-api", parent_id: 31 },
  { id: 92, nama: "KELURAHAN BONTANG BARU", singkatan: "BONTANG BARU", slug: "kel-bontang-baru", parent_id: 31 },
  { id: 93, nama: "KELURAHAN BONTANG KUALA", singkatan: "BONTANG KUALA", slug: "kel-bontang-kuala", parent_id: 31 },
  { id: 94, nama: "KELURAHAN GUNTUNG", singkatan: "GUNTUNG", slug: "kel-guntung", parent_id: 31 },
  { id: 95, nama: "KELURAHAN GUNUNG ELAI", singkatan: "GUNUNG ELAI", slug: "kel-gunung-elai", parent_id: 31 },
  { id: 96, nama: "KELURAHAN LOKTUAN", singkatan: "LOKTUAN", slug: "kel-loktuan", parent_id: 31 },

  // Kelurahan - Kecamatan Bontang Selatan (parent_id: 32)
  { id: 97, nama: "KELURAHAN BERBAS PANTAI", singkatan: "BERBAS PANTAI", slug: "kel-berbas-pantai", parent_id: 32 },
  { id: 98, nama: "KELURAHAN BERBAS TENGAH", singkatan: "BERBAS TENGAH", slug: "kel-berbas-tengah", parent_id: 32 },
  { id: 99, nama: "KELURAHAN BONTANG LESTARI", singkatan: "BONTANG LESTARI", slug: "kel-bontang-lestari", parent_id: 32 },
  { id: 100, nama: "KELURAHAN SATIMPO", singkatan: "SATIMPO", slug: "kel-satimpo", parent_id: 32 },
  { id: 101, nama: "KELURAHAN TANJUNG LAUT", singkatan: "TANJUNG LAUT", slug: "kel-tanjung-laut", parent_id: 32 },
  { id: 102, nama: "KELURAHAN TANJUNG LAUT INDAH", singkatan: "TANJUNG LAUT INDAH", slug: "kel-tanjung-laut-indah", parent_id: 32 },

  // Kelurahan - Kecamatan Bontang Barat (parent_id: 33)
  { id: 103, nama: "KELURAHAN BELIMBING", singkatan: "BELIMBING", slug: "kel-belimbing", parent_id: 33 },
  { id: 104, nama: "KELURAHAN GUNUNG TELIHAN", singkatan: "GUNUNG TELIHAN", slug: "kel-gunung-telihan", parent_id: 33 },
  { id: 105, nama: "KELURAHAN KANAAN", singkatan: "KANAAN", slug: "kel-kanaan", parent_id: 33 },
];

async function seed() {
  console.log("Seeding OPD data...");

  for (const data of opdData) {
    await db
      .insert(opd)
      .values({
        id: data.id,
        nama: data.nama,
        singkatan: data.singkatan,
        slug: data.slug,
        parent_id: data.parent_id,
      })
      .onConflictDoNothing({ target: opd.id });
  }

  // Reset the sequence to max id + 1
  await db.execute(sql`SELECT setval('opd_id_seq', (SELECT MAX(id) FROM opd))`);

  console.log("Seeding completed!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
