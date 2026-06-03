# Product Requirements Document
## Jadwal Kunjungan PM — Next.js Migration

**Versi:** 1.0.0  
**Tanggal:** 2026-06-03  
**Author:** Creon  
**Status:** Draft

---

## 1. Latar Belakang

Aplikasi **Jadwal Kunjungan PM** saat ini berjalan sebagai Google Apps Script (GAS) yang di-serve langsung dari Google Spreadsheet. Aplikasi ini digunakan oleh tim lapangan PT. Biliton Jaya Raya untuk mencatat jadwal kunjungan preventive maintenance (PM) ke tower site yang dikelola melalui Mitratel.

### Masalah dengan Implementasi Saat Ini

| Masalah | Dampak |
|---|---|
| GAS terikat ke Google account tertentu | Sulit didistribusikan ke tim lain tanpa berbagi akses |
| Deployment via Apps Script URL yang panjang | UX buruk, tidak bisa custom domain yang proper |
| Tidak bisa PWA/installable secara native | User harus wrap manual ke APK |
| Skalabilitas terbatas | Sulit menambah fitur baru (autentikasi, notifikasi, multi-sheet, dll.) |
| Zero control atas infrastruktur | Bergantung penuh pada Google quota & availability |

### Keputusan

Migrasi ke **Next.js 14** dengan tetap menggunakan **Google Spreadsheet sebagai database**, diakses via **Google Sheets API v4** menggunakan Service Account. Frontend di-deploy ke **Vercel** atau server sendiri.

---

## 2. Tujuan Produk

- Menggantikan aplikasi GAS dengan Next.js yang bisa di-deploy ke domain sendiri (misalnya `jadwal.biliton.my.id`)
- Mempertahankan semua fungsionalitas yang sudah ada
- Meningkatkan maintainability dan kemudahan menambah fitur baru
- Tetap menggunakan Google Spreadsheet sebagai "database" tanpa migrasi data

---

## 3. Target Pengguna

| Peran | Deskripsi |
|---|---|
| **PIC Lapangan** | Teknisi yang bertanggung jawab atas site tertentu, mengisi tanggal jadwal kunjungan |
| **Admin / Koordinator** | Memantau progress pengisian jadwal semua PIC melalui dashboard |

---

## 4. Struktur Data (Google Spreadsheet)

Spreadsheet yang ada memiliki **Sheet1** dengan struktur berikut:

| Kolom | Index | Nama Field | Tipe | Keterangan |
|---|---|---|---|---|
| A | 0 | `type` | String | Tipe kunjungan: `MR` (Maintenance & Repair) atau `VW` (Visual Walk) |
| B | 1 | `site_id` | String | ID unik tower site |
| C | 2 | `tower_name` | String | Nama tower |
| D | 3 | `pic` | String | Nama PIC yang bertanggung jawab |
| E | 4 | `jadwal` | Date/String | Tanggal jadwal kunjungan (format `yyyy-MM-dd`) |

- Baris pertama adalah **header row**, data dimulai dari baris ke-2.
- Nama sheet: `Sheet1` (konfigurasikan via environment variable agar fleksibel).

---

## 5. Fungsionalitas yang Harus Dipertahankan

### 5.1 Dashboard (Step 1)

- Menampilkan judul aplikasi dari nama spreadsheet
- Menampilkan **summary card** jumlah PIC yang Complete dan Open
- Menampilkan daftar PIC yang dikelompokkan:
  - **Open** — ada site yang belum diisi jadwalnya
  - **Complete** — semua site sudah terisi
- Setiap PIC item menampilkan:
  - Avatar inisial nama
  - Nama PIC
  - Jumlah site terisi vs total (`x / y site diisi`)
  - Badge status: `OPEN` (kuning) atau `COMPLETE` (hijau)
- Klik PIC → navigasi ke halaman pengisian jadwal PIC tersebut

### 5.2 Pengisian Jadwal (Step 2)

- Menampilkan header PIC bar: avatar inisial, nama, jumlah site
- Menampilkan alert jika sudah ada jadwal yang terisi sebelumnya
- Progress bar pengisian (x dari total site sudah diisi)
- Daftar site dikelompokkan berdasarkan tipe: **MR** dahulu, lalu **VW**
- Setiap site row menampilkan:
  - Nama tower (dengan truncation jika panjang)
  - Site ID
  - Badge tipe (`MR` atau `VW`)
  - Input `date` untuk memilih tanggal jadwal
  - Checkmark visual jika tanggal sudah diisi
- Warna border kiri site row berbeda per tipe (MR: biru, VW: ungu) dan berubah hijau jika sudah terisi
- Tombol **Simpan Semua Jadwal** di sticky footer — hanya aktif jika **semua** site sudah terisi tanggal

### 5.3 Penyimpanan

- Klik simpan → write semua perubahan ke Google Spreadsheet (kolom E, baris sesuai rowIndex)
- Setelah sukses → kembali ke dashboard dan refresh data

---

## 6. Arsitektur Teknis

### 6.1 Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Google Sheets Access | Google Sheets API v4 via Service Account |
| HTTP Client (internal) | `googleapis` npm package |
| Deploy | Vercel (atau Node.js server sendiri) |
| Domain | `jadwal.biliton.my.id` via Cloudflare |

### 6.2 Struktur Proyek

```
jadwal-kunjungan/
├── app/
│   ├── layout.tsx               # Root layout dengan metadata & font Inter
│   ├── page.tsx                 # Dashboard utama (Step 1)
│   ├── pic/
│   │   └── [picName]/
│   │       └── page.tsx         # Halaman pengisian jadwal per PIC (Step 2)
│   └── api/
│       ├── title/
│       │   └── route.ts         # GET: nama spreadsheet
│       ├── pic-status/
│       │   └── route.ts         # GET: semua PIC beserta status complete/open
│       ├── sites/
│       │   └── [picName]/
│       │       └── route.ts     # GET: sites per PIC
│       └── save/
│           └── route.ts         # POST: simpan jadwal ke spreadsheet
├── lib/
│   └── sheets.ts                # Google Sheets client & helper functions
├── components/
│   ├── PICItem.tsx
│   ├── SiteRow.tsx
│   ├── ProgressBar.tsx
│   ├── StepPills.tsx
│   └── StickyFooter.tsx
├── .env.local                   # Environment variables (lihat §6.4)
└── next.config.ts
```

### 6.3 API Routes

#### `GET /api/title`
Mengambil nama spreadsheet.

**Response:**
```json
{ "title": "Jadwal Kunjungan PM Q3 2025" }
```

---

#### `GET /api/pic-status`
Mengambil semua PIC dengan status pengisian.

**Response:**
```json
[
  { "name": "Andi", "total": 5, "filled": 5, "complete": true },
  { "name": "Budi", "total": 8, "filled": 3, "complete": false }
]
```

---

#### `GET /api/sites/[picName]`
Mengambil daftar site milik PIC tertentu.

**Response:**
```json
[
  {
    "rowIndex": 2,
    "type": "MR",
    "site_id": "BLT-001",
    "tower_name": "Tower Gambut Barat",
    "jadwal": "2025-08-15"
  }
]
```

---

#### `POST /api/save`
Menyimpan jadwal ke spreadsheet.

**Request Body:**
```json
{
  "updates": [
    { "rowIndex": 2, "jadwal": "2025-08-15" },
    { "rowIndex": 3, "jadwal": "2025-08-20" }
  ]
}
```

**Response:**
```json
{ "success": true, "count": 2 }
```

---

### 6.4 Environment Variables

```env
# Google Service Account Credentials
GOOGLE_SERVICE_ACCOUNT_EMAIL=jadwal-kunjungan@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"

# Spreadsheet Config
GOOGLE_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
GOOGLE_SHEET_NAME=Sheet1
```

> ⚠️ Private key harus di-escape newline-nya (`\n`) jika disimpan di `.env.local`. Di Vercel, paste as-is.

### 6.5 Google Sheets Helper (`lib/sheets.ts`)

Wrapper di atas `googleapis` yang meng-expose:

```typescript
getSpreadsheetTitle(): Promise<string>
getAllPICStatus(): Promise<PICStatus[]>
getSitesByPIC(picName: string): Promise<Site[]>
saveJadwal(updates: Update[]): Promise<{ count: number }>
```

Semua operasi menggunakan **batchGet** dan **batchUpdate** di mana memungkinkan untuk meminimalkan API call ke Google.

---

## 7. Desain UI/UX

### 7.1 Prinsip Desain

- Mobile-first, dioptimalkan untuk layar HP (lebar ~375–430px)
- Mengikuti design language yang sudah ada di AppScript (warna, komponen, layout)
- Font: Inter (Google Fonts)
- Sticky header dan sticky footer untuk navigasi yang mudah

### 7.2 Palet Warna

```css
--bg: #f4f6f9
--surface: #ffffff
--accent: #1d72f5      /* biru — primary */
--success: #0ea56b     /* hijau — complete/filled */
--warning: #f59e0b     /* kuning — open/pending */
--danger: #e53935      /* merah — error */
--text: #111827
--text2: #6b7280
```

### 7.3 Komponen Utama

| Komponen | Keterangan |
|---|---|
| `StepPills` | Dua pill di bawah header menunjukkan step saat ini (active = biru, done = hijau) |
| `PICItem` | Card PIC dengan avatar inisial, nama, progress text, badge status |
| `SiteRow` | Row per site dengan border kiri berwarna, date input, checkmark |
| `ProgressBar` | Bar hijau/biru yang menunjukkan persentase pengisian |
| `StickyFooter` | Footer fixed berisi hint text dan tombol Simpan |

---

## 8. Alur Pengguna (User Flow)

```
[Buka Halaman]
      │
      ▼
[Dashboard — GET /api/pic-status]
  ┌───────────────────────────┐
  │  Stats: X Complete, Y Open│
  │  List: Open PICs          │
  │  List: Complete PICs      │
  └───────────────────────────┘
      │
      │ Klik PIC
      ▼
[Halaman PIC — GET /api/sites/:picName]
  ┌───────────────────────────┐
  │  PIC Bar + tombol Kembali │
  │  Alert jika ada yg terisi │
  │  Progress bar             │
  │  Site list (MR dulu, VW)  │
  │  Date input per site      │
  └───────────────────────────┘
      │
      │ Isi semua tanggal
      │ (tombol Simpan aktif)
      ▼
[POST /api/save → Spreadsheet]
      │
      │ Sukses
      ▼
[Kembali ke Dashboard (refresh data)]
```

---

## 9. Non-Functional Requirements

| Aspek | Target |
|---|---|
| **Performance** | First Load JS < 100KB (gzip). API response < 2 detik untuk sheet hingga 500 baris |
| **Responsiveness** | Optimal di layar 375px–430px, usable di tablet |
| **Reliability** | Handle Google API quota error dengan pesan yang jelas ke user |
| **Security** | Service account credentials **tidak pernah** di-expose ke client. Semua API call melalui server-side route |
| **SEO** | Tidak diperlukan (internal tool) |

---

## 10. Out of Scope (v1.0)

Fitur-fitur berikut **tidak** masuk versi pertama ini:

- Autentikasi user (login / role-based access)
- Multi-spreadsheet / multi-project
- Notifikasi (email / WhatsApp reminder)
- Export laporan PDF
- Filter dan pencarian site
- Edit / hapus data yang sudah tersimpan
- Admin panel untuk manage PIC atau site

---

## 11. Rencana Implementasi

### Phase 1 — Setup & Data Layer
- [ ] Init project Next.js 14 dengan Tailwind CSS
- [ ] Setup Google Cloud Project + Service Account + enable Sheets API
- [ ] Share spreadsheet ke Service Account email
- [ ] Buat `lib/sheets.ts` dengan semua helper functions
- [ ] Buat semua API routes dan uji dengan Postman / curl

### Phase 2 — UI Components
- [ ] Buat komponen dasar: `StepPills`, `ProgressBar`, `StickyFooter`
- [ ] Buat `PICItem` dan halaman Dashboard (`app/page.tsx`)
- [ ] Buat `SiteRow` dan halaman pengisian (`app/pic/[picName]/page.tsx`)
- [ ] Implementasi logic pengisian jadwal dan submit

### Phase 3 — Polish & Deploy
- [ ] Loading state dan error handling di semua page
- [ ] Uji di mobile (real device)
- [ ] Deploy ke Vercel
- [ ] Setup Cloudflare redirect ke `jadwal.biliton.my.id`
- [ ] UAT dengan tim lapangan

---

## 12. Catatan Tambahan

- **Row Index:** Karena data ditulis langsung ke baris spreadsheet berdasarkan `rowIndex`, logika ini harus dipertahankan di API layer (bukan menggunakan ID atau primary key lain). Baris ke-1 adalah header, data mulai baris ke-2.
- **Date Format:** Semua tanggal disimpan dan dibaca dalam format `yyyy-MM-dd` (ISO 8601) agar konsisten antara spreadsheet dan HTML date input.
- **Caching:** Untuk mengurangi Google API call, pertimbangkan `next/cache` dengan `revalidate` singkat (misalnya 30 detik) di API routes yang read-only (`/api/pic-status`, `/api/sites/:pic`, `/api/title`). Route `/api/save` selalu fresh (no-cache).
- **Google API Quota:** Sheets API memiliki limit 300 read requests per minute per project. Untuk skala kecil (< 20 PIC, < 500 site) ini tidak akan menjadi masalah.
