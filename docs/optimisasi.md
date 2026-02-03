# Strategi Optimisasi RISKA HD

Dokumen ini menjelaskan seluruh strategi optimisasi yang diterapkan pada aplikasi RISKA HD untuk memastikan performa yang cepat dan efisien.

---

## Daftar Isi

1. [Caching & Data Fetching](#1-caching--data-fetching)
2. [Code Splitting & Lazy Loading](#2-code-splitting--lazy-loading)
3. [Memoization & Re-render Prevention](#3-memoization--re-render-prevention)
4. [Font Loading](#4-font-loading)
5. [PWA & Service Worker Caching](#5-pwa--service-worker-caching)
6. [Build & Bundling](#6-build--bundling)
7. [CSS Optimization](#7-css-optimization)
8. [Image Optimization](#8-image-optimization)
9. [Search & UX](#9-search--ux)

---

## 1. Caching & Data Fetching

### React Query Global Config

**File:** `src/components/Provider.tsx`

```
staleTime  = 5 menit   → Data dianggap fresh, tidak refetch ulang
gcTime     = 10 menit  → Cache disimpan di memori sebelum di-garbage collect
refetchOnWindowFocus = false  → Tidak refetch saat user kembali ke tab
```

**Rumus cache hit:**

```
Jika (waktu_sekarang - waktu_fetch_terakhir) < staleTime:
  → Gunakan data dari cache (0 network request)
  → Tidak ada loading spinner

Jika staleTime < umur_data < gcTime:
  → Tampilkan data cache + background refetch
  → User tetap lihat data lama, update otomatis

Jika umur_data > gcTime:
  → Cache dihapus
  → Full fetch ulang dengan loading state
```

**Alur query lifecycle:**

```
Fresh (0-5 min)          Stale (5-10 min)         Expired (>10 min)
┌─────────────┐          ┌──────────────┐          ┌────────────┐
│ Cache HIT   │          │ Cache + BG   │          │ Full Fetch │
│ No request  │  ──→     │ Refetch      │  ──→     │ Loading... │
│ Instant     │          │ Seamless     │          │ Fresh data │
└─────────────┘          └──────────────┘          └────────────┘
```

### keepPreviousData (Pagination & Search)

**Diterapkan di:** Semua halaman master & settings

```
placeholderData: keepPreviousData
```

Saat berpindah halaman atau search:
- Data halaman sebelumnya tetap ditampilkan
- Loading spinner muncul di dalam tabel (bukan mengganti seluruh tabel)
- Search input tetap bisa diketik tanpa gangguan

### Retry Strategy

```
Auth error (401/session expired) → Langsung gagal, tidak retry
Error lainnya                    → Retry hingga 3x
```

---

## 2. Code Splitting & Lazy Loading

### Dynamic Import untuk Form Components

**Diterapkan di:** 10 halaman

```tsx
import dynamic from "next/dynamic";
const DoctorForm = dynamic(() => import("./doctor-form").then(m => m.DoctorForm));
```

**Komponen yang di-lazy load:**

| Halaman       | Komponen              |
|---------------|-----------------------|
| Doctors       | `DoctorForm`          |
| Nurses        | `NurseForm`           |
| Rooms         | `RoomForm`            |
| Machines      | `MachineForm`         |
| Medications   | `MedicationForm`      |
| Diagnoses     | `DiagnosisForm`       |
| Protocols     | `ProtocolForm`        |
| Shifts        | `ShiftForm`           |
| Users         | `UserForm`            |
| Roles         | `RoleForm`, `RoleDetail` |

**Efek:**

```
Tanpa lazy load:
  PageBundle = TableCode + FormCode + ValidationLib + ...
  → Semua di-download saat halaman pertama kali dibuka

Dengan lazy load:
  PageBundle = TableCode (lebih kecil)
  FormChunk  = FormCode + ValidationLib (di-download saat dialog buka)
  → Initial load lebih cepat
  → Form hanya di-load ketika user klik "Tambah" / "Edit"
```

---

## 3. Memoization & Re-render Prevention

### useMemo pada Column Definitions

**Diterapkan di:** Semua halaman yang punya DataTable

```tsx
const columns: ColumnDef<T>[] = useMemo(() => [
  { accessorKey: "name", header: "Nama" },
  // ...
], []);
```

**Kenapa penting:**

```
Tanpa useMemo:
  Setiap render → columns = array baru → React Table re-initialize
  Setiap ketik di search → re-render → columns baru → tabel rebuild

Dengan useMemo:
  columns dibuat 1x → referensi sama → React Table skip re-init
  Ketik di search → re-render → columns SAMA → tabel hanya update data
```

### useMemo pada Row Number Column (DataTable)

**File:** `src/components/data-table/data-table.tsx`

```tsx
const rowNumberColumn = useMemo(() => ({
  id: "_rowNumber",
  header: "No",
  cell: ({ row }) => offset + row.index + 1,
}), [meta]);
```

Nomor urut otomatis dihitung berdasarkan pagination:

```
Rumus: No = ((page - 1) * limit) + index + 1

Page 1, limit 10: 1, 2, 3, ..., 10
Page 2, limit 10: 11, 12, 13, ..., 20
Page 3, limit 10: 21, 22, 23, ..., 30
```

---

## 4. Font Loading

### Konfigurasi Font

**File:** `src/app/layout.tsx`

```tsx
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
```

**Optimisasi yang diterapkan:**

| Aspek             | Sebelum                           | Sesudah                    |
|-------------------|-----------------------------------|----------------------------|
| Weight            | 300, 400, 500, 600, 700, 800     | 400, 500, 600, 700        |
| Jumlah file font  | 6 file                            | 4 file                    |
| Display strategy  | (default/block)                   | `swap`                    |

**`display: "swap"` artinya:**

```
Browser load halaman:
1. Teks langsung muncul dengan fallback font (system font)
2. Font Plus Jakarta Sans di-download di background
3. Setelah selesai, font di-swap → teks berubah ke Plus Jakarta Sans
→ User tidak melihat blank text (FOIT), tapi flash of unstyled text (FOUT)
→ Perceived performance lebih baik
```

**Pengurangan ukuran download:**

```
Weight 300 (Light)     = ~25-40 KB  ← dihapus (tidak dipakai)
Weight 800 (ExtraBold) = ~25-40 KB  ← dihapus (tidak dipakai)
─────────────────────────────────
Hemat                  ≈ 50-80 KB per user
```

---

## 5. PWA & Service Worker Caching

### Konfigurasi Workbox

**File:** `next.config.ts`

```
┌───────────────────────────┬───────────────────┬─────────────────┐
│ URL Pattern               │ Strategy          │ Cache Duration  │
├───────────────────────────┼───────────────────┼─────────────────┤
│ /api/auth/*               │ NetworkOnly       │ Tidak di-cache  │
│ /api/portal/*             │ NetworkOnly       │ Tidak di-cache  │
│ /api/* (lainnya)          │ NetworkFirst      │ 1 menit         │
│ *.js, *.css, *.woff2, dll │ CacheFirst        │ 30 hari         │
│ Halaman lainnya           │ StaleWhileRevalidate │ 1 hari       │
└───────────────────────────┴───────────────────┴─────────────────┘
```

**Penjelasan strategy:**

```
NetworkOnly (Auth & Portal):
  Request → Network → Response
  → Selalu fresh, tidak ada resiko data basi untuk auth

NetworkFirst (API):
  Request → Network (timeout 10s) → Response
       ↓ gagal/timeout
  Request → Cache → Response (data terakhir)
  → Offline-capable untuk data master

CacheFirst (Static Assets):
  Request → Cache → Response (instant!)
       ↓ cache miss
  Request → Network → Response + simpan ke cache
  → JS, CSS, font tidak di-download ulang

StaleWhileRevalidate (Halaman):
  Request → Cache → Response (instant!)
       ↓ background
  Network → Update cache untuk kunjungan berikutnya
  → Halaman selalu cepat, update di belakang layar
```

---

## 6. Build & Bundling

### Turbopack

**Konfigurasi di:** `package.json`

```json
"dev": "next dev --turbopack",
"build": "next build --turbopack"
```

Turbopack menggantikan Webpack dengan:
- Incremental compilation (hanya compile file yang berubah)
- Persistent caching
- Build lebih cepat dibanding Webpack

### TypeScript Incremental Build

**File:** `tsconfig.json`

```json
"incremental": true
```

Type checking di-cache, rebuild hanya memeriksa file yang berubah.

### Memory Allocation

Untuk build di environment dengan RAM terbatas:

```bash
NODE_OPTIONS='--max-old-space-size=4096' npm run build
```

---

## 7. CSS Optimization

### Tailwind CSS v4

Menggunakan Tailwind CSS v4 dengan `@tailwindcss/postcss`:
- Automatic tree-shaking: hanya CSS class yang dipakai yang masuk bundle
- CSS variables untuk theming (tema bisa berganti tanpa load CSS baru)
- Zero runtime overhead

### Custom Animations

**File:** `src/app/globals.css`

Animasi menggunakan CSS native `@keyframes` + Intersection Observer:
- Tidak ada JS runtime untuk animasi
- GPU-accelerated (`transform`, `opacity`)
- Hanya aktif saat elemen masuk viewport (`[data-animate]`)

---

## 8. Image Optimization

### Next.js Image Component

**File:** `next.config.ts`

```ts
images: {
  remotePatterns: [{ protocol: "https", hostname: "**" }],
}
```

Next.js Image secara otomatis:
- Resize gambar sesuai viewport
- Convert ke format WebP/AVIF
- Lazy load gambar di bawah fold
- Serve dari cache CDN

**Dependency:** `sharp` (dev) untuk server-side image processing.

---

## 9. Search & UX

### Debounced Search

**File:** `src/components/data-table/data-table.tsx`

```
User ketik → Tunggu 400ms idle → Baru kirim API request
```

```
Tanpa debounce:
  "h" → request → "he" → request → "hel" → request → "hell" → request → "hello" → request
  = 5 API calls

Dengan debounce (400ms):
  "h" → "he" → "hel" → "hell" → "hello" → (400ms idle) → request
  = 1 API call
```

### Loading State dalam Tabel

```
Saat search/paging:
  ┌─────────────────────────────────────┐
  │ [Search: hello    ]    [Columns ▾]  │  ← Search tetap bisa diketik
  ├─────┬──────────┬────────┬───────────┤
  │ No  │ Nama     │ Status │ Aksi      │  ← Header tetap ada
  ├─────┼──────────┼────────┼───────────┤
  │           ↻ Memuat data...          │  ← Spinner di dalam tabel
  └─────────────────────────────────────┘

  Bukan ini:
  ┌─────────────────────────────────────┐
  │         ████████████████            │  ← Seluruh tabel hilang
  │         ████ Loading ███            │
  │         ████████████████            │
  └─────────────────────────────────────┘
```

---

## Ringkasan Dampak

| Optimisasi                  | Dampak                                         |
|-----------------------------|-------------------------------------------------|
| React Query cache (5 min)   | Kurangi API calls ~70% untuk navigasi berulang  |
| `keepPreviousData`          | Zero layout shift saat paging/search            |
| Lazy load forms             | Initial bundle ~30-50% lebih kecil per halaman  |
| `useMemo` columns           | Eliminasi re-render tabel yang tidak perlu       |
| Font weight reduction       | Hemat ~50-80 KB download font                   |
| `display: "swap"`           | Teks muncul instan, tidak menunggu font          |
| PWA CacheFirst (assets)     | Static assets instant dari cache (0ms)           |
| Debounce search (400ms)     | Kurangi API calls ~80% saat mengetik             |
| Turbopack                   | Build time lebih cepat vs Webpack                |
| Tailwind v4 tree-shaking    | Hanya CSS yang dipakai masuk bundle              |
