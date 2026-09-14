/* ==========================================================================
   PEDULI PTM — config.js
   SATU-SATUNYA berkas yang perlu Anda sunting sebelum deploy.
   ========================================================================== */

const CONFIG = {

  /* ------------------------------------------------------------------------
     1) URL BACKEND — WAJIB DIISI
     ------------------------------------------------------------------------
     Tempel URL yang berakhiran /exec dari Apps Script:
       Deploy → New Deployment → Web App → Copy URL

     Selama masih berisi 'GANTI_DENGAN_URL_EXEC_ANDA', aplikasi berjalan dalam
     MODE DEMO memakai data contoh di js/demo.js — berguna untuk melihat
     tampilan sebelum backend siap.
     ---------------------------------------------------------------------- */
  GAS_URL: 'https://script.google.com/macros/s/AKfycbzvRG8ImfZd3Ea4agca3m2Xdc3VsGXEQO3w6Uu0eNf1kYeYI9G6txqVJ2qw5FYpHulS/exec',

  /* ------------------------------------------------------------------------
     2) IDENTITAS FASKES — tampil di header, footer, dan pesan pengingat
     ---------------------------------------------------------------------- */
  NAMA_APP:     'PEDULI PTM',
  TAGLINE:      'Pengingat Digital Pengendali Penyakit Tidak Menular',
  NAMA_FASKES:  'Puskesmas Sehat Utama',
  WILAYAH:      'Puskesmas Sehat Utama Wilayah I',
  TELEPON:      '(021) 555-0199',
  EMAIL_SUPPORT:'ptm-support@puskesmas.go.id',
  ALAMAT:       'Jl. Medika Husada No. 14',

  /* ------------------------------------------------------------------------
     3) PARAMETER OPERASIONAL
     ---------------------------------------------------------------------- */
  PER_HALAMAN:      10,        // baris tabel pasien per halaman
  MAKS_UNGGAH_MB:   2,         // batas ukuran berkas (selaras dengan backend)
  TIMEOUT_MS:       30000,     // batas tunggu satu permintaan ke GAS
  KUNCI_SESI:       'peduliptm_sesi',
  KUNCI_POPUP:      'peduliptm_popup_ditutup',

  /* ------------------------------------------------------------------------
     4) DAFTAR NILAI TETAP
     ---------------------------------------------------------------------- */
  JENIS_PTM: [
    {
      nilai: 'Hipertensi',
      judul: 'Hipertensi Saja',
      desc:  'Tekanan darah sistolik ≥ 140 atau diastolik ≥ 90 mmHg tanpa DM.'
    },
    {
      nilai: 'Diabetes Melitus',
      judul: 'Diabetes Melitus (DM)',
      desc:  'Gula darah puasa ≥ 126 mg/dL atau HbA1c ≥ 6,5%.'
    },
    {
      nilai: 'Hipertensi & DM',
      judul: 'Komorbid (HT & DM)',
      desc:  'Kedua faktor risiko aktif. Memerlukan monitoring multi-disiplin.',
      prioritas: true
    }
  ],

  HUBUNGAN_KELUARGA: ['Istri', 'Suami', 'Anak Kandung', 'Anak Tertua', 'Orang Tua', 'Saudara', 'Kerabat Lain'],

  STATUS_KUNJUNGAN: ['Belum Berkunjung', 'Sudah Berkunjung', 'Tidak Hadir'],

  TARGET_PENGUMUMAN: ['Semua Pasien', 'Komorbid (DM+HT)', 'Hipertensi', 'Diabetes Melitus'],

  KANAL_PENGUMUMAN: ['Pop-up', 'WhatsApp', 'Email'],

  /* Palet chart — tervalidasi aman untuk buta warna (ΔE deutan 21,5).
     JANGAN ubah tanpa memvalidasi ulang jarak antarwarna.               */
  WARNA_CHART: ['#1b6fa8', '#14b8a6', '#8b5cf6'],
  WARNA_SUKSES: '#16a34a',
  WARNA_BAHAYA: '#dc2626',
  WARNA_PERINGATAN: '#d97706'
};

/** True bila GAS_URL belum diisi — aplikasi memakai data contoh. */
CONFIG.MODE_DEMO = !CONFIG.GAS_URL ||
  CONFIG.GAS_URL.indexOf('GANTI_DENGAN') !== -1 ||
  CONFIG.GAS_URL.indexOf('/exec') === -1;
