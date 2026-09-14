/* ==========================================================================
   PEDULI PTM — api.js
   Lapisan komunikasi ke Google Apps Script (pure REST / JSON).
   Tidak memakai google.script.run — seluruhnya fetch() lintas domain.
   ========================================================================== */

const API = {

  /* ----------------------------------------------------------------------
     SESI — disimpan di localStorage agar bertahan saat halaman dimuat ulang
     ---------------------------------------------------------------------- */
  sesi: null,

  muatSesi() {
    try {
      const raw = localStorage.getItem(CONFIG.KUNCI_SESI);
      this.sesi = raw ? JSON.parse(raw) : null;
    } catch (e) {
      this.sesi = null;
    }
    return this.sesi;
  },

  simpanSesi(sesi) {
    this.sesi = sesi;
    try { localStorage.setItem(CONFIG.KUNCI_SESI, JSON.stringify(sesi)); } catch (e) { /* mode privat */ }
  },

  hapusSesi() {
    this.sesi = null;
    try { localStorage.removeItem(CONFIG.KUNCI_SESI); } catch (e) { /* abaikan */ }
  },

  get token()  { return this.sesi ? this.sesi.token : ''; },
  get user()   { return this.sesi ? this.sesi.user : null; },
  get peran()  { return this.user ? this.user.peran : ''; },
  masuk()      { return !!this.token; },
  isSuperAdmin() { return this.peran === 'Super Admin'; },
  isPetugas()  { return this.peran === 'Super Admin' || this.peran === 'Admin'; },
  isPasien()   { return this.peran === 'Pasien'; },

  /* ----------------------------------------------------------------------
     PERMINTAAN GET — dipakai endpoint publik tanpa sesi
     ---------------------------------------------------------------------- */
  async get(action, params) {
    if (CONFIG.MODE_DEMO) return DEMO.jawab(action, params || {});

    const qs = new URLSearchParams(Object.assign({ action }, params || {}));
    try {
      const res = await this._denganTimeout(fetch(CONFIG.GAS_URL + '?' + qs.toString()));
      return await res.json();
    } catch (err) {
      return { success: false, message: this._pesanJaringan(err), data: null };
    }
  },

  /* ----------------------------------------------------------------------
     PERMINTAAN POST — seluruh aksi aplikasi
     Content-Type WAJIB text/plain agar tidak memicu CORS preflight yang
     diblokir Google Apps Script.
     ---------------------------------------------------------------------- */
  async post(action, data) {
    if (CONFIG.MODE_DEMO) return DEMO.jawab(action, data || {});

    try {
      const res = await this._denganTimeout(fetch(CONFIG.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, token: this.token, data: data || {} })
      }));
      const json = await res.json();

      // Sesi kedaluwarsa di server → paksa keluar agar tidak terjebak layar kosong.
      if (!json.success && json.code === 401) {
        this.hapusSesi();
        UI.toast('Sesi Anda berakhir. Silakan masuk kembali.', 'error');
        location.hash = '#/masuk';
      }
      return json;
    } catch (err) {
      return { success: false, message: this._pesanJaringan(err), data: null };
    }
  },

  _denganTimeout(promise) {
    return Promise.race([
      promise,
      new Promise((_, tolak) =>
        setTimeout(() => tolak(new Error('TIMEOUT')), CONFIG.TIMEOUT_MS))
    ]);
  },

  _pesanJaringan(err) {
    if (err && err.message === 'TIMEOUT') {
      return 'Server tidak merespons dalam ' + (CONFIG.TIMEOUT_MS / 1000) +
             ' detik. Periksa koneksi internet Anda lalu coba lagi.';
    }
    return 'Tidak dapat terhubung ke server. Pastikan URL backend sudah benar ' +
           'dan Web App di-deploy dengan akses "Anyone".';
  },

  /* ----------------------------------------------------------------------
     PEMBUNGKUS AKSI — memanggil dengan indikator muat & notifikasi seragam
     ---------------------------------------------------------------------- */

  /** Ambil data untuk ditampilkan. Mengembalikan payload atau null bila gagal. */
  async ambil(action, data, opsi) {
    const o = opsi || {};
    if (!o.diam) UI.loading(true);
    const res = await this.post(action, data);
    if (!o.diam) UI.loading(false);

    if (!res.success) {
      if (!o.diam) UI.toast(res.message, 'error');
      return null;
    }
    return res.data;
  },

  /** Kirim perubahan. Menampilkan notifikasi sukses/gagal secara otomatis. */
  async kirim(action, data, opsi) {
    const o = opsi || {};
    UI.loading(true);
    const res = await this.post(action, data);
    UI.loading(false);

    UI.toast(res.message, res.success ? 'success' : 'error');
    return res;
  },

  /* ----------------------------------------------------------------------
     UNGGAH BERKAS — dikonversi ke base64 di sisi klien
     ---------------------------------------------------------------------- */

  /** Baca File menjadi string base64 (tanpa prefiks data URL). */
  bacaBerkas(file) {
    return new Promise((selesai, tolak) => {
      const maks = CONFIG.MAKS_UNGGAH_MB * 1024 * 1024;
      if (file.size > maks) {
        tolak(new Error('Ukuran berkas ' + UI.formatUkuran(file.size) +
          ' melebihi batas ' + CONFIG.MAKS_UNGGAH_MB + ' MB.'));
        return;
      }
      const fr = new FileReader();
      fr.onload = () => selesai({
        base64: String(fr.result).split(',')[1],
        dataUrl: String(fr.result),
        mime: file.type || 'application/octet-stream',
        nama: file.name,
        ukuran: file.size
      });
      fr.onerror = () => tolak(new Error('Gagal membaca berkas.'));
      fr.readAsDataURL(file);
    });
  }
};
