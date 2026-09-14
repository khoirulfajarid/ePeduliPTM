# PEDULI PTM — Frontend

Sistem Pengingat Digital Pengendali Penyakit Tidak Menular.
Frontend statis (HTML/CSS/JavaScript murni, tanpa framework dan tanpa proses build)
yang berkomunikasi dengan Google Apps Script sebagai REST API JSON.

---

## Struktur folder

```
.                          ← folder ini adalah root repository (tempat `git init`)
├── index.html             ← WAJIB berada di root, GitHub Pages hanya membaca yang di sini
├── README.md
├── PANDUAN-INSTALASI.md
├── css/
│   └── style.css          ← design system "Clinical Clarity & Care"
└── js/
    ├── config.js          ← SATU-SATUNYA berkas yang perlu Anda sunting
    ├── store.js           ← cache klien + draf formulir (stale-while-revalidate)
    ├── api.js             ← lapisan fetch ke Apps Script
    ├── ui.js              ← komponen, ikon, pemformat, grafik SVG
    ├── demo.js            ← data contoh (hanya aktif bila GAS_URL kosong)
    ├── pages.js           ← portal publik, login, portal pasien
    ├── pages-admin.js     ← dashboard, daftar pasien, formulir pasien
    ├── pages-admin2.js    ← rekam medis terpadu, jadwal & reminder, ekspor
    ├── pages-admin3.js    ← pengumuman, laporan, verifikasi akun, pengaturan
    └── app.js             ← router hash, kerangka tata letak, penjaga hak akses
```

---

## Arsitektur kecepatan

Empat prinsip yang membuat antarmuka terasa instan meski backend Apps Script
membutuhkan 1–3 detik per permintaan.

### 1. Kerangka persisten & navigasi dari gambar tersimpan

Sidebar dan topbar dirender **sekali**; berpindah menu hanya menukar isi
`#konten`. Halaman yang pernah dibuka digambar ulang dari snapshot di memori,
lalu disegarkan diam-diam bila datanya sudah berubah.

| Perpindahan menu | Waktu terukur |
|---|---|
| Kunjungan pertama (cache dingin) | setara satu RTT Apps Script |
| Kunjungan berikutnya | **± 9 ms** |
| Setelah muat ulang peramban penuh | **± 23 ms** (dari localStorage) |

Tidak ada lagi spinner layar penuh saat berpindah halaman — indikator muat
hanya muncul untuk operasi tulis yang benar-benar perlu ditunggu.

### 2. Cache klien & pembaruan optimistik

`store.js` menyimpan hasil setiap endpoint ke memori dan localStorage dengan
TTL per jenis data. Pola **stale-while-revalidate**: data lama dipakai untuk
menggambar layar sekarang, penyegaran berjalan di latar belakang.

Aksi yang tidak menunggu server (berubah seketika, disinkronkan setelahnya,
dikembalikan otomatis bila server menolak):

- Mengubah status kehadiran pasien
- Menayangkan / menonaktifkan pengumuman
- Menyetujui / menolak akun petugas
- Menghapus data pasien

Pencarian dan penyaringan daftar pasien sepenuhnya lokal — **0 permintaan
jaringan** saat mengetik. Formulir pasien menyimpan draf otomatis ke perangkat,
dan menawarkan pemulihan bila petugas kembali ke halaman itu.

### 3. Cache server bertingkat

`CacheService` menyimpan setiap sheet dengan TTL sesuai frekuensi
perubahannya (acuan 30 menit, operasional 5 menit, log 1 menit) dan
di-invalidate pada setiap operasi tulis. Di dalam satu eksekusi, objek `MEMO`
mencegah sheet yang sama dibaca berulang kali.

Endpoint `bootstrap` menggabungkan dashboard, daftar pasien, pengaturan, dan
antrean verifikasi menjadi **satu** permintaan.

### 4. Operasi Sheets berbasis batch

Mesin reminder tidak lagi memanggil `appendRow()` per pesan. Hasil pengukuran
untuk 120 pasien dengan dua kanal pada sheet log berisi 3.000 baris:

| | Sebelum | Sesudah |
|---|---|---|
| Penulisan log (160 baris) | 160 × `appendRow` | **2 × `setValues`** |
| Pembacaan sheet penuh | ~320 | **10** |

> **Catatan keamanan:** seluruh cache dan draf di perangkat dihapus saat
> petugas keluar dari sistem — tidak ada data medis yang tertinggal.

Berkas backend (`Kode.gs`, `Modul_Data.gs`, `Modul_Reminder.gs`) **sengaja tidak
disertakan di sini** — isinya disalin-tempel ke editor Apps Script, bukan diunggah
ke GitHub.

---

## Mode demo

Selama `GAS_URL` di `js/config.js` masih berisi `GANTI_DENGAN_URL_EXEC_ANDA`,
aplikasi berjalan memakai data contoh dari `js/demo.js`. Seluruh halaman dapat
dibuka dan diuji tanpa backend.

Kredensial mode demo:

| Peran | Cara masuk |
|---|---|
| Super Admin | `anita.rahayu@puskesmas.go.id` · PIN `123456` |
| Pasien | NIK `3175021508630001` · 4 digit HP `9900` |

Begitu `GAS_URL` diisi URL `/exec` yang benar, `demo.js` tidak pernah dipanggil lagi.

---

## Halaman yang tersedia

| Rute | Halaman | Hak akses |
|---|---|---|
| `#/` | Portal publik + pop-up pengumuman + cek jadwal | Terbuka |
| `#/masuk` | Login & registrasi petugas + cek status akun | Terbuka |
| `#/portal` | Portal pasien mandiri | Pasien |
| `#/dashboard` | Ringkasan monitoring harian | Petugas |
| `#/pasien` | Daftar pasien PTM + filter + paginasi | Petugas |
| `#/pasien/baru` | Formulir pendaftaran & rekam klinis | Petugas |
| `#/pasien/:id` | Rekam medis terpadu (4 tab) | Petugas |
| `#/jadwal` | Gelombang kunjungan & jejak pengiriman | Petugas |
| `#/pengumuman` | Komposer siaran + pratinjau WhatsApp | Petugas |
| `#/laporan` | Laporan kepatuhan & evaluasi klaster | Petugas |
| `#/akun` | Verifikasi akun staff | Super Admin |
| `#/pengaturan` | Konfigurasi H-3/H-1/H-0 & gateway | Petugas (sunting: Super Admin) |

---

## Catatan teknis

- **Tanpa build step.** Buka `index.html` lewat server statis apa pun.
- **Permintaan POST wajib memakai header `text/plain;charset=utf-8`** agar tidak
  memicu CORS preflight yang diblokir Apps Script. Sudah diterapkan di `api.js`.
- **Palet grafik** (`#1b6fa8`, `#14b8a6`, `#8b5cf6`) telah divalidasi aman untuk
  buta warna (ΔE deutan 21,5). Jangan mengubahnya tanpa validasi ulang.
- **Aksesibilitas.** Target sentuh minimum 48 px, angka memakai `tabular-nums`,
  kontras teks memenuhi WCAG AA/AAA, tersedia tautan lewati-ke-konten.
- **Responsif.** Diuji pada 1440 px dan 390 px tanpa scroll horizontal.

---

## Menjalankan secara lokal

```bash
# Python 3
python3 -m http.server 8080

# atau Node.js
npx serve .
```

Lalu buka `http://localhost:8080`.

> Membuka `index.html` langsung lewat `file://` tidak disarankan — sebagian
> peramban memblokir `fetch()` dari protokol tersebut.
