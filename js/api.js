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
    this._sedangJalan = {};
    // Data medis tidak boleh tertinggal di perangkat setelah petugas keluar.
    Store.kosongkan();
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
     PEMBACAAN DATA — stale-while-revalidate
     ----------------------------------------------------------------------
     Layar tidak pernah menunggu jaringan bila ada data tersimpan. Jaringan
     hanya dipakai untuk memperbarui apa yang sudah tergambar.
     ---------------------------------------------------------------------- */

  /** Permintaan yang sedang berjalan, agar tidak ada panggilan kembar. */
  _sedangJalan: {},

  /**
   * Ambil data untuk ditampilkan.
   *
   * opsi:
   *   diam       — jangan tampilkan notifikasi kegagalan
   *   segar      — abaikan cache, paksa ambil dari jaringan
   *   tanpaCache — jangan baca maupun tulis cache
   */
  async ambil(action, data, opsi) {
    const o = opsi || {};

    if (!o.tanpaCache && !o.segar) {
      const simpanan = Store.baca(action, data);
      if (simpanan) {
        // Sudah basi → segarkan diam-diam, tetapi kembalikan yang lama SEKARANG
        // supaya halaman tergambar tanpa jeda.
        if (simpanan.basi) this.segarkan(action, data);
        return simpanan.data;
      }
    }

    const res = await this._sekali(action, data);

    if (!res.success) {
      if (!o.diam) UI.toast(res.message, 'error');
      return null;
    }
    if (!o.tanpaCache) Store.tulis(action, data, res.data);
    return res.data;
  },

  /** Permintaan jaringan dengan deduplikasi — dua pemanggil, satu permintaan. */
  _sekali(action, data) {
    const kunci = Store.kunci(action, data);
    if (this._sedangJalan[kunci]) return this._sedangJalan[kunci];

    const janji = this.post(action, data).finally(() => { delete this._sedangJalan[kunci]; });
    this._sedangJalan[kunci] = janji;
    return janji;
  },

  /**
   * Penyegaran latar belakang. Tidak pernah memblokir antarmuka; bila data
   * yang kembali berbeda, Store memberi tahu Router untuk menggambar ulang.
   */
  segarkan(action, data) {
    this._sekali(action, data).then((res) => {
      if (!res || !res.success) return;
      const berubah = Store.berbeda(action, data, res.data);
      Store.tulis(action, data, res.data);
      if (berubah && typeof Store.onSegar === 'function') Store.onSegar(action, data, res.data);
    }).catch(() => { /* penyegaran diam-diam: kegagalan tidak mengganggu pengguna */ });
  },

  /** Muat awal sesi petugas: satu permintaan untuk empat kebutuhan data. */
  async bootstrap(opsi) {
    const d = await this.ambil('bootstrap', {}, opsi);
    if (!d) return null;

    // Pecah hasil komposit ke cache masing-masing endpoint, sehingga halaman
    // Pasien, Pengaturan, dan Verifikasi Akun ikut terisi tanpa permintaan baru.
    if (d.dashboard)  Store.tulis('dashboard', {}, d.dashboard);
    if (d.pengaturan) Store.tulis('getPengaturan', {}, d.pengaturan);
    if (d.akun)       Store.tulis('listAkun', {}, d.akun);
    return d;
  },

  /** Tarik data lebih awal (saat kursor menyentuh menu / peramban menganggur). */
  prapasok(action, data) {
    if (!this.masuk()) return;
    const simpanan = Store.baca(action, data);
    if (simpanan && !simpanan.basi) return;      // sudah segar, tidak perlu
    this.segarkan(action, data);
  },

  /* ----------------------------------------------------------------------
     PENULISAN DATA
     ---------------------------------------------------------------------- */

  /**
   * Kirim perubahan dan tunggu hasilnya. Dipakai untuk aksi yang benar-benar
   * perlu dipastikan sebelum layar berpindah (mis. menyimpan pasien baru).
   */
  async kirim(action, data, opsi) {
    const o = opsi || {};
    if (!o.tanpaIndikator) UI.loading(true);
    const res = await this.post(action, data);
    if (!o.tanpaIndikator) UI.loading(false);

    if (res.success) Store.invalidasi(action);
    if (!o.diam) UI.toast(res.message, res.success ? 'success' : 'error');
    return res;
  },

  /**
   * Kirim perubahan TANPA menunggu (Prinsip 2: optimistic UI).
   *
   * Antarmuka sudah diperbarui lebih dulu oleh pemanggil. Fungsi ini hanya
   * menyinkronkan ke server di latar belakang; bila gagal, `saatGagal`
   * dipanggil agar pemanggil dapat mengembalikan tampilan ke keadaan semula.
   */
  kirimLatar(action, data, saatGagal) {
    Store.invalidasi(action);

    this.post(action, data).then((res) => {
      if (res.success) {
        Store.invalidasi(action);
        return;
      }
      UI.toast(res.message || 'Perubahan gagal disimpan ke server.', 'error');
      if (typeof saatGagal === 'function') saatGagal(res);
    }).catch((err) => {
      UI.toast('Perubahan tersimpan di perangkat, tetapi gagal dikirim ke server.', 'error');
      if (typeof saatGagal === 'function') saatGagal({ success: false, message: String(err) });
    });
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
