# Panduan Instalasi — PEDULI PTM

Panduan lengkap memasang aplikasi dari nol: backend Google Apps Script,
lalu frontend ke GitHub Pages. Ditulis untuk pengguna yang belum pernah
memakai Git maupun Apps Script.

**Perkiraan waktu:** 30–45 menit untuk seluruh tahap.

---

## Ringkasan arsitektur

```
┌──────────────────────────────────────────────┐
│  FRONTEND — GitHub Pages                     │
│  index.html · css/ · js/                     │
│  https://USERNAME.github.io/NAMA-REPO/       │
└───────────────────┬──────────────────────────┘
                    │  fetch() JSON (HTTPS)
┌───────────────────▼──────────────────────────┐
│  BACKEND — Google Apps Script (/exec)        │
│  Kode.gs · Modul_Data.gs · Modul_Reminder.gs │
│                                              │
│  Google Sheets (database)                    │
│  Google Drive  (foto, hasil lab, resep)      │
│  Gmail         (pengingat email)             │
│  Fonnte API    (pengingat WhatsApp)          │
└──────────────────────────────────────────────┘
```

Frontend dan backend **terpisah penuh**. Tidak ada iframe, tidak ada
`google.script.run`, tidak ada `HtmlService`.

---

# BAGIAN A — BACKEND (Google Apps Script)

## A1. Buat proyek Apps Script

1. Buka <https://script.google.com> dan masuk dengan akun Google yang akan
   memiliki spreadsheet serta folder Drive aplikasi ini.
2. Klik **New project** (Proyek baru).
3. Klik nama proyek di kiri atas (`Untitled project`) lalu ganti menjadi
   **PEDULI PTM Backend**.

## A2. Salin ketiga berkas backend

Di panel **Files** (kiri), Anda akan melihat satu berkas bernama `Code.gs`.

1. **Berkas pertama** — klik `Code.gs`, hapus seluruh isinya, lalu tempel isi
   **`Kode.gs`**. Klik ikon tiga titik di sebelah nama berkas → **Rename** →
   ubah menjadi `Kode`.
2. **Berkas kedua** — klik tombol **+** di samping "Files" → **Script** →
   beri nama `Modul_Data` → tempel isi **`Modul_Data.gs`**.
3. **Berkas ketiga** — ulangi, beri nama `Modul_Reminder` → tempel isi
   **`Modul_Reminder.gs`**.

Klik ikon **💾 Save** (atau Ctrl+S). Pastikan tidak ada garis merah error.

> Nama berkas di Apps Script ditulis **tanpa** akhiran `.gs` — sistem
> menambahkannya sendiri.

## A3. Jalankan setup — HANYA SEKALI

Langkah ini membuat seluruh folder Drive, spreadsheet database, 8 sheet beserta
headernya, data contoh, dan akun Super Admin pertama Anda.

1. Pada dropdown fungsi di toolbar atas, pilih **`setupAppEnvironment`**.
2. Klik **▶ Run**.
3. Muncul dialog izin:
   - **Review permissions** → pilih akun Google Anda
   - Muncul peringatan "Google hasn't verified this app" → klik
     **Advanced** → **Go to PEDULI PTM Backend (unsafe)**
   - Klik **Allow**

   > Peringatan ini normal untuk script buatan sendiri yang belum melalui
   > proses verifikasi publik Google. Script hanya mengakses Drive, Sheets,
   > dan Gmail milik akun Anda sendiri.

4. Buka **Execution log** (panel bawah). Anda akan melihat:

```
✅ SETUP SELESAI — simpan informasi di bawah ini!
   Spreadsheet   : https://docs.google.com/spreadsheets/d/...
   Folder Drive  : https://drive.google.com/drive/folders/...

   🔑 AKUN SUPER ADMIN PERTAMA
   Email : nama.anda@gmail.com
   PIN   : 482915   ← CATAT SEKARANG, tidak ditampilkan lagi!
```

> ### ⚠️ CATAT PIN TERSEBUT SEKARANG
> PIN disimpan sebagai hash SHA-256 dan **tidak dapat ditampilkan kembali**.
> Bila terlanjur hilang, jalankan `resetScriptProperties()` lalu ulangi setup
> dari awal (spreadsheet lama perlu dihapus manual).

> ### ⚠️ JANGAN menjalankan `setupAppEnvironment()` lebih dari satu kali
> Fungsi ini memiliki pengaman: bila dijalankan ulang, ia berhenti dan
> menampilkan pesan peringatan tanpa membuat duplikat.

**Verifikasi:** buka Google Drive Anda. Harus ada folder **📁 PEDULI_PTM**
berisi `👤 Pasien`, `📣 Pengumuman`, `📤 Ekspor_Laporan`, dan berkas
**🗃️ Database — PEDULI PTM** dengan 8 sheet.

## A4. Aktifkan pengingat otomatis harian

1. Pilih fungsi **`pasangTriggerHarian`** pada dropdown → klik **▶ Run**.
2. Log akan menampilkan: `✅ Trigger harian terpasang ... pukul 07.00 WIB`.
3. Verifikasi di menu **⏰ Triggers** (ikon jam di sidebar kiri) — harus ada
   satu trigger `jalankanReminderHarian`, Time-driven, Day timer, 7am–8am.

## A5. Isi token WhatsApp Fonnte

Lewati langkah ini bila untuk sementara hanya ingin memakai pengingat email.

1. Daftar di <https://fonnte.com>, sambungkan perangkat WhatsApp, salin **token**.
2. Di Apps Script: **⚙️ Project Settings** → gulir ke **Script Properties** →
   **Edit script properties**.
3. Cari baris `FONNTE_TOKEN` (sudah dibuat otomatis, nilainya kosong) →
   isi dengan token Anda → **Save script properties**.

> Token juga bisa diisi belakangan lewat halaman **Pengaturan Sistem** di
> dashboard, kolom "Perbarui Token Fonnte".

## A6. Deploy sebagai Web App

1. Klik **Deploy** (kanan atas) → **New deployment**.
2. Klik ikon ⚙️ di samping "Select type" → pilih **Web app**.
3. Isi:

   | Kolom | Nilai |
   |---|---|
   | Description | `PEDULI PTM v1` |
   | Execute as | **Me** (akun Anda) |
   | Who has access | **Anyone** |

   > **"Anyone" wajib dipilih.** Bila memilih "Anyone with Google account",
   > frontend di GitHub Pages akan menerima error CORS dan aplikasi tidak
   > bisa memuat data. Keamanan tetap terjaga karena setiap aksi diverifikasi
   > token sesi di sisi server.

4. Klik **Deploy** → **Authorize access** bila diminta.
5. **Salin Web app URL** — bentuknya:

```
https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxxx/exec
```

Simpan URL ini. Anda memerlukannya pada Bagian B.

> ### Setiap kali Anda mengubah kode backend
> Klik **Deploy → Manage deployments → ✏️ (edit) → Version: New version → Deploy**.
> URL `/exec` **tidak berubah**, jadi frontend tidak perlu disunting ulang.
> Membuat "New deployment" baru justru menghasilkan URL berbeda — hindari.

---

# BAGIAN B — FRONTEND (GitHub Pages)

## B0. Ekstrak dan isi konfigurasi

1. Ekstrak berkas **`peduli-ptm-frontend.zip`**. Hasilnya sebuah folder yang
   langsung berisi `index.html`, `css/`, dan `js/` — **tanpa folder pembungkus**.

   ```
   peduli-ptm-frontend\          ← INI folder kerja Anda
   ├── index.html                ← harus terlihat di baris teratas
   ├── README.md
   ├── PANDUAN-INSTALASI.md
   ├── css\
   └── js\
   ```

2. Buka **`js/config.js`** dengan Notepad (atau editor teks apa pun).
3. Cari baris ke-21:

   ```javascript
   GAS_URL: 'GANTI_DENGAN_URL_EXEC_ANDA',
   ```

   Ganti menjadi URL dari langkah A6:

   ```javascript
   GAS_URL: 'https://script.google.com/macros/s/AKfycbxxxx.../exec',
   ```

4. Sekalian sesuaikan identitas faskes di bawahnya (`NAMA_FASKES`, `TELEPON`,
   `ALAMAT`, `EMAIL_SUPPORT`). **Simpan** berkas.

> Melewatkan langkah ini membuat situs tetap tampil, tetapi memakai data
> contoh — bukan data asli dari Sheets Anda.

## B1. Pasang Git

| Sistem | Cara |
|---|---|
| Windows | Unduh di <https://git-scm.com/download/win>, install dengan pengaturan bawaan. Setelah selesai, buka **PowerShell** dari Start Menu. |
| macOS | Buka Terminal, ketik `git --version` — macOS menawarkan instalasi otomatis. |
| Linux | `sudo apt install git` |

Verifikasi:

```bash
git --version
```

Harus muncul misalnya `git version 2.45.1`.

## B2. Buat akun GitHub

Daftar di <https://github.com> bila belum punya.

> Username yang Anda pilih menjadi bagian alamat situs nanti
> (`https://username.github.io/...`), jadi pilihlah dengan sadar.

## B3. Atur identitas Git (cukup sekali seumur hidup komputer)

```bash
git config --global user.name "Nama Lengkap Anda"
git config --global user.email "email@sama-dengan-akun-github.com"
```

- `user.name` bukan username GitHub — bebas, hanya label di riwayat perubahan.
- `user.email` sebaiknya sama dengan email akun GitHub agar commit terhubung
  ke profil Anda.

## B4. Buat repository

Di github.com: tombol **+** (kanan atas) → **New repository**.

| Kolom | Nilai |
|---|---|
| Repository name | `peduli-ptm` |
| Visibility | **Public** |
| Add a README file | ❌ **jangan dicentang** |
| Add .gitignore | ❌ **jangan dipilih** |
| Choose a license | ❌ **jangan dipilih** |

Klik **Create repository**. Biarkan halaman yang muncul tetap terbuka.

> **Mengapa Public?** GitHub Pages gratis hanya tersedia untuk repository
> publik. Ini aman — berkas frontend tidak memuat kredensial apa pun, hanya
> alamat API yang memang bersifat publik.

## B5. Masuk ke folder proyek — LANGKAH PALING KRITIS

```powershell
cd "C:\Users\NAMA-ANDA\Downloads\peduli-ptm-frontend"
```

> 💡 Cara cepat di Windows: buka folder itu di File Explorer, klik kolom
> alamat, ketik `powershell`, tekan Enter. PowerShell langsung terbuka di
> folder tersebut.

**Verifikasi isi folder sebelum melanjutkan:**

```powershell
dir
```

(di macOS/Linux/Git Bash: `ls -la`)

Yang **wajib** terlihat:

```
index.html        ← harus ada, di baris ini juga
css
js
README.md
PANDUAN-INSTALASI.md
```

> ### ⚠️ Gerbang paling penting di seluruh panduan
> Bila yang muncul justru folder seperti `frontend` atau `backend`, Anda
> berada **satu tingkat terlalu tinggi** — jalankan `cd frontend` dulu.
>
> Git akan menerima folder yang salah **tanpa satu pun pesan error**, dan
> situs Anda nanti menampilkan **404** padahal semua perintah tampak berhasil.
> Karena itu, jangan lanjut sebelum `index.html` terlihat.

## B6. Kirim ke GitHub

Jalankan **satu per satu**, periksa hasilnya sebelum lanjut.

**1) Inisialisasi repositori lokal**

```bash
git init
```
Hasil normal: `Initialized empty Git repository in ...`

**2) Tambahkan semua berkas**

```bash
git add .
```
> ⚠️ Ada **titik** di akhir perintah — artinya "semua berkas di folder ini".
> Tanpa titik, tidak ada yang ditambahkan.

Hasil normal: tidak ada output sama sekali (diam = berhasil).

**3) Simpan sebagai commit pertama**

```bash
git commit -m "Rilis awal PEDULI PTM"
```
Hasil normal: daftar berkas, misalnya `create mode 100644 index.html`.

**4) Ganti nama branch menjadi main**

```bash
git branch -M main
```
Hasil normal: tidak ada output.

**5) Sambungkan ke repository GitHub**

```bash
git remote add origin https://github.com/USERNAME/peduli-ptm.git
```
Ganti `USERNAME` dengan username GitHub Anda yang sebenarnya.

> Bila muncul `remote origin already exists`, artinya sudah pernah
> disambungkan — lewati saja. Bila URL-nya keliru:
> `git remote set-url origin https://github.com/USERNAME/peduli-ptm.git`

**6) Kirim**

```bash
git push -u origin main
```

Saat diminta:
- **Username:** username GitHub Anda
- **Password:** **Personal Access Token**, bukan password akun (lihat B7)

> 💡 Saat mengetik atau menempel token, **layar tetap kosong** — tidak ada
> karakter maupun bintang yang muncul. Ini **normal**, bukan tanda gagal.
> Di PowerShell: klik kanan untuk menempel. Di Git Bash: Shift+Insert.
> Lalu tekan Enter.

Tanda berhasil: `Writing objects: 100%` dan `* [new branch] main -> main`.

## B7. Membuat Personal Access Token

Diperlukan bila muncul `Password authentication is not supported`. Ini bukan
error fatal — GitHub memang tidak lagi menerima password akun untuk operasi Git.

1. Buka <https://github.com/settings/tokens>
2. **Generate new token** → **Generate new token (classic)**
3. Isi:
   - **Note:** `git-push-peduli-ptm`
   - **Expiration:** `90 days` (atau `No expiration`)
   - **Scopes:** centang ✅ **repo** (wajib)
4. **Generate token**
5. **Salin token** (`ghp_...`) — hanya ditampilkan sekali, simpan di Notepad
6. Jalankan `git push -u origin main` lagi, tempel token sebagai password

> Bila terminal terasa menyulitkan, alternatifnya adalah **GitHub Desktop**
> (<https://desktop.github.com>): login lewat peramban →
> **Add Local Repository** → pilih folder proyek → **Publish repository**.

## B8. Aktifkan GitHub Pages

**Cek struktur dulu.** Buka `https://github.com/USERNAME/peduli-ptm`. Pastikan:

- ✅ `index.html` terlihat **di root**
- ✅ ada folder `css/` dan `js/` (bukan berkas CSS/JS berserakan di root)
- ✅ **tidak ada** berkas `.gs`

Lalu di repo tersebut: **Settings** (tab paling kanan) → **Pages** (sidebar kiri).

| Kolom | Nilai |
|---|---|
| Source | **Deploy from a branch** |
| Branch | **main** · **/ (root)** |
| Enforce HTTPS | ✅ **dicentang** |

Klik **Save**. Tunggu 1–2 menit, refresh halaman. Akan muncul:

> Your site is live at `https://USERNAME.github.io/peduli-ptm/`

## B9. Uji aplikasi

1. Buka alamat tersebut.
2. Portal publik tampil, pop-up pengumuman muncul.
3. Klik **Login Petugas Medis** → masuk dengan email Google Anda dan PIN dari
   langkah A3.
4. Dashboard menampilkan data dari spreadsheet Anda (5 pasien contoh).
5. Buka **Pengaturan Sistem** → isi nomor WhatsApp Anda di panel **Uji Coba
   Pengiriman (Sandbox)** → **Kirim Notifikasi Uji**.

**Indikator sukses:** badge di sidebar kiri berubah dari **MODE DEMO**
(oranye) menjadi **TERHUBUNG** (hijau).

---

# BAGIAN C — MEMPERBARUI APLIKASI

## Mengubah frontend

Dari folder proyek, tiga perintah:

```bash
git add .
git commit -m "Deskripsi singkat perubahan"
git push
```

GitHub Pages membangun ulang dalam 1–2 menit. Bila halaman masih menampilkan
versi lama, itu cache peramban — tekan **Ctrl+Shift+R** atau buka di jendela
**Incognito**.

## Mengubah backend

Sunting kode di editor Apps Script, lalu:
**Deploy → Manage deployments → ✏️ → Version: New version → Deploy**

URL `/exec` tetap sama, frontend tidak perlu disentuh.

---

# TROUBLESHOOTING

## Masalah Git & GitHub Pages

| Yang terlihat | Penyebab | Solusi |
|---|---|---|
| `fatal: not a git repository` | Belum `git init`, atau salah folder | Jalankan `dir`/`ls` dulu, pastikan `index.html` terlihat, baru `git init` |
| `remote origin already exists` | `git remote add` sudah pernah jalan | Lewati, lanjut `git push`. Bila URL salah: `git remote set-url origin <url>` |
| `Password authentication is not supported` | GitHub menolak password akun | Buat Personal Access Token (B7) |
| `Invalid username or token` | Token salah/kadaluarsa | Buat token baru, pastikan scope **repo** tercentang |
| Tidak ada karakter saat mengetik password | Perilaku normal terminal | Tetap tempel lalu Enter |
| `error: src refspec main does not match any` | Belum ada commit | `git add .` lalu `git commit -m "Upload pertama"` |
| `Updates were rejected because the remote contains work` | Repo GitHub punya README yang tidak ada di lokal | `git pull --rebase origin main` lalu `git push` |
| `LF will be replaced by CRLF` | Beda format baris Windows vs Linux | **Abaikan** — ini peringatan, bukan error |
| **404 File not found**, di repo terlihat folder `frontend/` di root | `git init` dijalankan di folder induk | Lihat "Perbaikan: salah folder" di bawah |
| Halaman tampil tanpa warna/tata letak | Berkas CSS/JS rata di root, folder `css/` `js/` hilang | Buat ulang folder, `git mv` berkasnya, commit, push |
| Situs tampil versi lama | Cache peramban | Ctrl+Shift+R atau Incognito |

### Perbaikan: salah folder yang di-push (404)

Gejalanya khas: semua perintah git berhasil tanpa error, tetapi situs
menampilkan 404 dan di halaman repo yang terlihat adalah folder, bukan
`index.html`.

Jangan hapus repository. Cukup push ulang dari folder yang benar:

```powershell
cd "C:\path\ke\peduli-ptm-frontend"
dir                                  # wajib terlihat index.html
git init
git add .
git commit -m "Fix: push dari folder frontend"
git branch -M main
git remote add origin https://github.com/USERNAME/peduli-ptm.git
git push -u origin main --force
```

`--force` menimpa isi repository dengan versi lokal. Aman di sini karena isi
lama memang struktur yang keliru.

## Masalah aplikasi

| Gejala | Penyebab | Solusi |
|---|---|---|
| Badge sidebar tetap **MODE DEMO** | `GAS_URL` belum diisi atau salah | Periksa `js/config.js`, pastikan URL berakhiran `/exec`, lalu commit & push ulang |
| "Tidak dapat terhubung ke server" | Web App tidak di-deploy dengan akses "Anyone" | Deploy → Manage deployments → ubah **Who has access** menjadi **Anyone** |
| Error CORS di Console (F12) | Sama seperti di atas | Sama seperti di atas |
| "Email belum terdaftar di sistem" | PIN/akun berbeda dengan hasil setup | Gunakan email pemilik script + PIN dari log A3 |
| Reminder tidak terkirim | Trigger belum dipasang | Jalankan `pasangTriggerHarian()` sekali |
| WhatsApp gagal, email berhasil | `FONNTE_TOKEN` kosong atau perangkat terputus | Isi token di Script Properties, cek dashboard Fonnte |
| "Kuota notifikasi harian habis" | Batas harian tercapai | Naikkan `KUOTA_HARIAN` di sheet `Pengaturan` (perhatikan batas Gmail akun Anda) |
| Foto pasien gagal diunggah | Ukuran melebihi 2 MB | Kompres foto, atau naikkan `MAX_UPLOAD_BYTES` di `Kode.gs` |
| Data lama masih muncul setelah diubah | Cache server 5 menit | Tunggu sebentar, atau klik **Refresh Data** di dashboard |

---

# GLOSARIUM

| Istilah | Arti |
|---|---|
| **Repository (repo)** | Folder proyek di GitHub, seperti Google Drive-nya programmer |
| **Commit** | Menyimpan perubahan dengan catatan singkat — seperti "Save" tapi tercatat riwayatnya |
| **Push** | Mengirim commit dari komputer ke GitHub, seperti "Upload" |
| **Branch** | Versi/cabang proyek. Yang dipakai di sini: `main` |
| **Personal Access Token** | "Password khusus" dari GitHub untuk operasi Git lewat terminal |
| **PowerShell / Git Bash** | Terminal untuk menjalankan perintah Git di Windows |
| **`/exec`** | Alamat Web App Apps Script yang menerima permintaan dari frontend |
| **Trigger** | Penjadwal otomatis Apps Script yang menjalankan fungsi pada waktu tertentu |
| **Script Properties** | Tempat penyimpanan rahasia Apps Script (token, ID) — tidak terlihat di spreadsheet |
| **Milestone H-3 / H-1 / H-0** | Tiga tahap pengingat: 3 hari sebelum, 1 hari sebelum, dan hari kunjungan |

---

# LAMPIRAN — Batasan Google Apps Script

Perlu diketahui untuk perencanaan operasional (sesuai PRD Seksi 6.2):

| Batasan | Nilai | Penanganan di aplikasi ini |
|---|---|---|
| Waktu eksekusi per proses | 6 menit | Mesin reminder berhenti di menit ke-4:40 dan melanjutkan pada eksekusi berikutnya |
| Kuota email harian | 100/hari (Gmail gratis) · 1.500/hari (Workspace) | Sheet `Pengaturan` → `KUOTA_HARIAN`, ditampilkan real-time di dashboard |
| Penulisan bersamaan ke Sheets | Rawan bentrok | Setiap operasi tulis memakai `LockService` |
| Ukuran berkas Drive | Kuota organisasi | Unggahan dibatasi 2 MB per berkas |
| WhatsApp | Bukan layanan native Google | Memakai Fonnte API, token disimpan di Script Properties |

**Rekomendasi kapasitas:** arsitektur ini nyaman untuk ±1.000 pasien.
Di atas angka tersebut, pertimbangkan memecah spreadsheet per klaster
atau bermigrasi ke basis data sungguhan.

---

*PEDULI PTM v1.0.0 — Sistem Pengingat Digital Pengendali Penyakit Tidak Menular*
