/* ==========================================================================
   PEDULI PTM — store.js
   Lapisan cache klien (Prinsip 2: state lokal + localStorage).

   Pola yang dipakai: stale-while-revalidate.
   · Data yang masih SEGAR   → dipakai langsung, tidak ada permintaan jaringan.
   · Data yang sudah BASI    → tetap dipakai untuk menggambar layar SEKARANG,
                               lalu disegarkan diam-diam di latar belakang.
   · Data yang KEDALUWARSA   → dibuang, ambil dari jaringan.

   Efeknya: berpindah menu terasa 0 ms karena layar tidak pernah menunggu
   jaringan — jaringan hanya memperbarui apa yang sudah terlihat.
   ========================================================================== */

const Store = {

  PREFIX: 'ptm_cache_',
  /* Draf memakai awalan TERPISAH, bukan turunan PREFIX. Bila keduanya
     berbagi awalan, pembersihan cache kedaluwarsa ikut menghapus isian
     formulir yang belum sempat disimpan petugas. */
  PREFIX_DRAF: 'ptm_draf_',
  VERSI: 'v1',

  /* Umur data dalam milidetik.
     segar = dipakai tanpa menyentuh jaringan sama sekali
     simpan = batas dibuang total                                            */
  UMUR: {
    bootstrap:       { segar: 45000,  simpan: 900000 },
    dashboard:       { segar: 45000,  simpan: 900000 },
    listPasien:      { segar: 60000,  simpan: 1800000 },
    getPasien:       { segar: 90000,  simpan: 1800000 },
    listPengumuman:  { segar: 180000, simpan: 3600000 },
    getLaporan:      { segar: 120000, simpan: 1800000 },
    listAkun:        { segar: 90000,  simpan: 1800000 },
    getPengaturan:   { segar: 300000, simpan: 3600000 },
    listLogReminder: { segar: 30000,  simpan: 600000 },
    publicInfo:      { segar: 180000, simpan: 3600000 },
    pasienDashboard: { segar: 45000,  simpan: 900000 },
    _bawaan:         { segar: 60000,  simpan: 900000 }
  },

  /** Aksi tulis → daftar cache baca yang menjadi usang karenanya. */
  INVALIDASI: {
    savePasien:        ['bootstrap', 'dashboard', 'listPasien', 'getPasien', 'getLaporan'],
    deletePasien:      ['bootstrap', 'dashboard', 'listPasien', 'getPasien', 'getLaporan'],
    updateKunjungan:   ['bootstrap', 'dashboard', 'listPasien', 'getPasien', 'getLaporan'],
    saveRiwayatMedis:  ['getPasien'],
    savePengumuman:    ['listPengumuman', 'publicInfo'],
    togglePengumuman:  ['listPengumuman', 'publicInfo'],
    siarkanPengumuman: ['listPengumuman', 'listLogReminder', 'getLaporan'],
    verifikasiAkun:    ['bootstrap', 'listAkun'],
    resetPin:          ['listAkun'],
    savePengaturan:    ['bootstrap', 'getPengaturan'],
    kirimReminder:     ['dashboard', 'getPasien', 'listLogReminder'],
    pasienKonfirmasi:  ['pasienDashboard'],
    registerPasien:    ['listPasien', 'dashboard'],
    registerStaff:     ['listAkun']
  },

  /* Cache dalam memori — tercepat, hilang saat halaman dimuat ulang. */
  mem: {},

  /* Dipasang Router: dipanggil bila penyegaran latar belakang membawa data
     yang benar-benar berbeda, agar layar dapat digambar ulang diam-diam.   */
  onSegar: null,

  /* ----------------------------------------------------------------------
     KUNCI
     ---------------------------------------------------------------------- */

  /** Kunci stabil: urutan properti tidak boleh memengaruhi hasil. */
  kunci(aksi, params) {
    const p = params || {};
    const nama = Object.keys(p).filter(k => p[k] !== '' && p[k] !== undefined && p[k] !== null).sort();
    const bagian = nama.map(k => k + '=' + String(p[k])).join('&');
    return aksi + (bagian ? '?' + bagian : '');
  },

  _umur(aksi) { return this.UMUR[aksi] || this.UMUR._bawaan; },

  _kunciLs(kunci) { return this.PREFIX + this.VERSI + '_' + kunci; },

  /* ----------------------------------------------------------------------
     BACA
     ---------------------------------------------------------------------- */

  /**
   * Kembalikan { data, basi } bila tersedia dan belum kedaluwarsa.
   * `basi = true` berarti layar boleh digambar, tetapi perlu disegarkan.
   */
  baca(aksi, params) {
    const kunci = this.kunci(aksi, params);
    const umur = this._umur(aksi);
    const sekarang = Date.now();

    let entri = this.mem[kunci];

    if (!entri) {
      try {
        const mentah = localStorage.getItem(this._kunciLs(kunci));
        if (mentah) {
          entri = JSON.parse(mentah);
          this.mem[kunci] = entri;      // naikkan ke memori
        }
      } catch (e) { /* mode privat atau JSON rusak — abaikan */ }
    }

    if (!entri) return null;

    const usia = sekarang - entri.t;
    if (usia > umur.simpan) { this.hapusKunci(kunci); return null; }

    return { data: entri.d, basi: usia > umur.segar, usia };
  },

  /* ----------------------------------------------------------------------
     TULIS
     ---------------------------------------------------------------------- */

  tulis(aksi, params, data) {
    const kunci = this.kunci(aksi, params);
    const entri = { t: Date.now(), d: data };
    this.mem[kunci] = entri;

    try {
      const teks = JSON.stringify(entri);
      // Jangan bebani localStorage dengan muatan raksasa; memori sudah cukup.
      if (teks.length < 600000) localStorage.setItem(this._kunciLs(kunci), teks);
    } catch (e) {
      // Kuota penuh → buang cache terlama lalu coba sekali lagi.
      this.pangkas();
      try { localStorage.setItem(this._kunciLs(kunci), JSON.stringify(entri)); } catch (e2) { /* menyerah */ }
    }
    return data;
  },

  /** True bila data baru benar-benar berbeda dari yang tersimpan. */
  berbeda(aksi, params, data) {
    const lama = this.mem[this.kunci(aksi, params)];
    if (!lama) return true;
    try { return JSON.stringify(lama.d) !== JSON.stringify(data); } catch (e) { return true; }
  },

  /* ----------------------------------------------------------------------
     HAPUS
     ---------------------------------------------------------------------- */

  hapusKunci(kunci) {
    delete this.mem[kunci];
    try { localStorage.removeItem(this._kunciLs(kunci)); } catch (e) { /* abaikan */ }
  },

  /** Buang seluruh cache milik satu aksi (termasuk seluruh variasi parameter). */
  hapusAksi(aksi) {
    Object.keys(this.mem).forEach(k => {
      if (k === aksi || k.indexOf(aksi + '?') === 0) this.hapusKunci(k);
    });
    try {
      const awalan = this.PREFIX + this.VERSI + '_' + aksi;
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.indexOf(awalan) === 0) localStorage.removeItem(k);
      }
    } catch (e) { /* abaikan */ }
  },

  /** Jalankan peta INVALIDASI untuk satu aksi tulis. */
  invalidasi(aksiTulis) {
    const daftar = this.INVALIDASI[aksiTulis];
    if (!daftar) return;
    daftar.forEach(a => this.hapusAksi(a));
  },

  /** Buang separuh entri tertua saat kuota localStorage penuh. */
  pangkas() {
    try {
      const entri = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || k.indexOf(this.PREFIX) !== 0) continue;
        try { entri.push({ k, t: JSON.parse(localStorage.getItem(k)).t || 0 }); }
        catch (e) { localStorage.removeItem(k); }
      }
      entri.sort((a, b) => a.t - b.t);
      entri.slice(0, Math.ceil(entri.length / 2)).forEach(e => localStorage.removeItem(e.k));
    } catch (e) { /* abaikan */ }
  },

  /**
   * Bersihkan seluruh cache DAN draf — dipanggil saat keluar dari sistem.
   * Tidak boleh ada jejak data medis pasien di perangkat setelah sesi berakhir.
   */
  kosongkan() {
    this.mem = {};
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.indexOf(this.PREFIX) === 0) localStorage.removeItem(k);
      }
    } catch (e) { /* abaikan */ }
    this.kosongkanDraf();
  },

  /** Buang entri versi lama & yang sudah kedaluwarsa. Dipanggil sekali saat mulai. */
  bersihkan() {
    try {
      const sekarang = Date.now();
      const awalanVersi = this.PREFIX + this.VERSI + '_';
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (!k || k.indexOf(this.PREFIX) !== 0) continue;

        if (k.indexOf(awalanVersi) !== 0) { localStorage.removeItem(k); continue; }

        try {
          const entri = JSON.parse(localStorage.getItem(k));
          const aksi = k.slice(awalanVersi.length).split('?')[0];
          if (sekarang - (entri.t || 0) > this._umur(aksi).simpan) localStorage.removeItem(k);
        } catch (e) { localStorage.removeItem(k); }
      }
    } catch (e) { /* abaikan */ }
  },

  /* ----------------------------------------------------------------------
     DRAF FORMULIR — mencegah kehilangan ketikan (Prinsip 2)
     ---------------------------------------------------------------------- */

  simpanDraf(nama, data) {
    try { localStorage.setItem(this.PREFIX_DRAF + nama, JSON.stringify({ t: Date.now(), d: data })); }
    catch (e) { /* abaikan */ }
  },

  /** Draf lebih tua dari 24 jam dianggap tidak relevan lagi. */
  bacaDraf(nama) {
    try {
      const mentah = localStorage.getItem(this.PREFIX_DRAF + nama);
      if (!mentah) return null;
      const entri = JSON.parse(mentah);
      if (Date.now() - entri.t > 86400000) { this.hapusDraf(nama); return null; }
      return entri.d;
    } catch (e) { return null; }
  },

  hapusDraf(nama) {
    try { localStorage.removeItem(this.PREFIX_DRAF + nama); } catch (e) { /* abaikan */ }
  },

  /** Buang seluruh draf — hanya saat petugas keluar dari sistem. */
  kosongkanDraf() {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.indexOf(this.PREFIX_DRAF) === 0) localStorage.removeItem(k);
      }
    } catch (e) { /* abaikan */ }
  }
};
