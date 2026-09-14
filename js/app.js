/* ==========================================================================
   PEDULI PTM — app.js
   Router hash, kerangka tata letak (shell), penjaga hak akses, dan inisialisasi.
   ========================================================================== */

const Router = {

  /* ----------------------------------------------------------------------
     TABEL RUTE — pola ":id" menjadi parameter
     ---------------------------------------------------------------------- */
  RUTE: [
    { pola: '',                      halaman: 'publik' },
    { pola: '/',                     halaman: 'publik' },
    { pola: '/masuk',                halaman: 'masuk' },
    { pola: '/portal',               halaman: 'portal' },
    { pola: '/dashboard',            halaman: 'dashboard' },
    { pola: '/pasien',               halaman: 'pasien' },
    { pola: '/pasien/baru',          halaman: 'pasienForm' },
    { pola: '/pasien/:id/sunting',   halaman: 'pasienForm' },
    { pola: '/pasien/:id',           halaman: 'pasienDetail' },
    { pola: '/jadwal',               halaman: 'jadwal' },
    { pola: '/pengumuman',           halaman: 'pengumuman' },
    { pola: '/laporan',              halaman: 'laporan' },
    { pola: '/akun',                 halaman: 'akun' },
    { pola: '/pengaturan',           halaman: 'pengaturan' }
  ],

  /* ----------------------------------------------------------------------
     MENU SIDEBAR — urutan sesuai PRD Seksi 7.2
     ---------------------------------------------------------------------- */
  MENU: [
    { hash: '#/dashboard',  ikon: 'dashboard', teks: 'Dashboard (Ringkasan)' },
    { hash: '#/pasien',     ikon: 'pasien',    teks: 'Pasien PTM' },
    { hash: '#/jadwal',     ikon: 'jadwal',    teks: 'Jadwal & Reminder' },
    { hash: '#/pengumuman', ikon: 'megafon',   teks: 'Pengumuman' },
    { hash: '#/laporan',    ikon: 'laporan',   teks: 'Laporan Pelayanan' },
    { hash: '#/akun',       ikon: 'perisai',   teks: 'Verifikasi Akun Staff', hanyaSuper: true },
    { hash: '#/pengaturan', ikon: 'gear',      teks: 'Pengaturan Sistem' }
  ],

  _halamanAktif: null,
  _paramAktif: {},

  /* ----------------------------------------------------------------------
     PENCOCOKAN RUTE
     ---------------------------------------------------------------------- */
  cocokkan(jalur) {
    for (let i = 0; i < this.RUTE.length; i++) {
      const r = this.RUTE[i];
      const bagianPola = r.pola.split('/').filter(Boolean);
      const bagianJalur = jalur.split('/').filter(Boolean);
      if (bagianPola.length !== bagianJalur.length) continue;

      const params = {};
      let cocok = true;
      for (let j = 0; j < bagianPola.length; j++) {
        if (bagianPola[j].charAt(0) === ':') params[bagianPola[j].slice(1)] = decodeURIComponent(bagianJalur[j]);
        else if (bagianPola[j] !== bagianJalur[j]) { cocok = false; break; }
      }
      if (cocok) return { halaman: r.halaman, params };
    }
    return null;
  },

  /* ----------------------------------------------------------------------
     PENJAGA HAK AKSES
     ---------------------------------------------------------------------- */
  izinkan(halaman) {
    const perlu = halaman.perluSesi;
    if (!perlu) return true;

    if (!API.masuk()) {
      UI.toast('Silakan masuk terlebih dahulu untuk mengakses halaman tersebut.', 'error');
      location.hash = perlu === 'Pasien' ? '#/' : '#/masuk';
      return false;
    }
    if (perlu === 'Pasien' && !API.isPasien()) { location.hash = '#/dashboard'; return false; }
    if (perlu === 'Petugas' && !API.isPetugas()) { location.hash = '#/portal'; return false; }
    if (perlu === 'SuperAdmin' && !API.isSuperAdmin()) {
      UI.toast('Menu ini khusus Super Admin faskes (PRD Seksi 3.2).', 'error');
      location.hash = '#/dashboard';
      return false;
    }
    return true;
  },

  /* ----------------------------------------------------------------------
     PEMUATAN HALAMAN
     ---------------------------------------------------------------------- */
  async muat() {
    const jalur = location.hash.replace(/^#/, '') || '/';
    const hasil = this.cocokkan(jalur);
    const app = document.getElementById('app');

    // Tutup dialog & laci navigasi yang mungkin masih terbuka.
    UI.tutupModal();
    document.body.classList.remove('nav-open');

    if (!hasil || !PAGES[hasil.halaman]) {
      app.innerHTML = this._shellPolos(
        '<div class="public-wrap">' +
          UI.kosong('Halaman tidak ditemukan',
            'Alamat "' + UI.esc(jalur) + '" tidak dikenali sistem. Kembali ke beranda untuk melanjutkan.', 'peringatan') +
          '<div class="center"><button class="btn btn-primary btn-inline" data-ke="#/">Kembali ke Beranda</button></div>' +
        '</div>');
      this._pasangNavigasi();
      return;
    }

    const halaman = PAGES[hasil.halaman];
    if (!this.izinkan(halaman)) return;

    this._halamanAktif = hasil.halaman;
    this._paramAktif = hasil.params;
    document.title = halaman.judul + ' — ' + CONFIG.NAMA_APP;

    // Kerangka sementara agar layar tidak berkedip kosong saat memuat.
    app.innerHTML = this._bungkus(halaman,
      '<div class="col" style="gap:16px">' +
        '<div class="skeleton sk-card"></div>' +
        '<div class="skeleton sk-card"></div>' +
      '</div>');
    this._pasangNavigasi();

    let isi;
    try {
      isi = await halaman.muat(hasil.params);
    } catch (err) {
      isi = UI.kosong('Terjadi kesalahan saat menampilkan halaman', String(err && err.message ? err.message : err), 'peringatan');
    }

    app.innerHTML = this._bungkus(halaman, isi);
    window.scrollTo(0, 0);

    this._pasangNavigasi();
    if (halaman.pasang) {
      try { halaman.pasang(hasil.params); }
      catch (err) { UI.toast('Sebagian interaksi halaman gagal dipasang: ' + err.message, 'error'); }
    }
  },

  /* ----------------------------------------------------------------------
     KERANGKA TATA LETAK
     ---------------------------------------------------------------------- */
  _bungkus(halaman, isi) {
    if (halaman.shell === 'app')    return this._shellApp(isi);
    if (halaman.shell === 'publik') return this._shellPublik(isi);
    return this._shellPolos(isi);
  },

  _shellPolos(isi) { return '<main id="konten">' + isi + '</main>'; },

  _shellPublik(isi) {
    const masuk = API.masuk();
    return '' +
      '<nav class="public-nav">' +
        '<div class="row grow" style="cursor:pointer" data-ke="#/">' +
          '<div class="brand-mark">' + UI.ikon('perisai') + '</div>' +
          '<div><div class="brand-name">' + UI.esc(CONFIG.NAMA_APP) + '</div>' +
          '<div class="brand-tag">' + UI.esc(CONFIG.TAGLINE) + '</div></div>' +
        '</div>' +
        '<div class="public-links">' +
          '<button class="public-link is-active" data-ke="#/">Beranda</button>' +
          '<button class="public-link" data-gulir="cara">Cara Kerja</button>' +
          '<button class="public-link" data-gulir="siap">Panduan Kunjungan</button>' +
        '</div>' +
        '<div class="row wrap" style="gap:10px">' +
          '<span class="badge badge-danger">' + UI.ikon('telepon') + 'Hotline 119</span>' +
          (masuk && API.isPasien()
            ? '<button class="btn btn-ghost btn-sm btn-inline" data-ke="#/portal">' + UI.ikon('orang') + 'Portal Saya</button>'
            : '') +
          (masuk && API.isPetugas()
            ? '<button class="btn btn-deep btn-sm btn-inline" data-ke="#/dashboard">' + UI.ikon('dashboard') + 'Dashboard</button>'
            : '<button class="btn btn-deep btn-sm btn-inline" data-ke="#/masuk">' + UI.ikon('gembok') + 'Login Petugas Medis</button>') +
        '</div>' +
      '</nav>' +
      '<main id="konten">' + isi + '</main>';
  },

  _shellApp(isi) {
    const u = API.user || {};
    const aktif = '#' + (location.hash.replace(/^#/, '') || '/');

    const menu = this.MENU
      .filter(m => !m.hanyaSuper || API.isSuperAdmin())
      .map(m => {
        const nyala = aktif === m.hash || (m.hash !== '#/dashboard' && aktif.indexOf(m.hash) === 0);
        return '<button class="nav-item' + (nyala ? ' is-active' : '') + '" data-ke="' + m.hash + '">' +
          UI.ikon(m.ikon) + '<span>' + UI.esc(m.teks) + '</span></button>';
      }).join('');

    return '' +
      '<div class="app-shell">' +
        '<div class="sidebar-scrim" data-tutup-nav></div>' +

        '<aside class="sidebar">' +
          '<div class="sidebar-brand" style="cursor:pointer" data-ke="#/dashboard">' +
            '<div class="brand-mark">' + UI.ikon('perisai') + '</div>' +
            '<div><div class="brand-name">' + UI.esc(CONFIG.NAMA_APP) + '</div>' +
            '<div class="brand-tag">Sistem Kendali Terpadu</div></div>' +
          '</div>' +

          '<div class="gateway-pill">' +
            '<span class="dot ' + (CONFIG.MODE_DEMO ? 'dot-warning' : 'dot-live') + '"></span>' +
            '<span>Status Backend</span>' +
            '<span class="status' + (CONFIG.MODE_DEMO ? ' is-off' : '') + '">' +
              (CONFIG.MODE_DEMO ? 'MODE DEMO' : 'TERHUBUNG') + '</span>' +
          '</div>' +

          '<nav class="nav" aria-label="Navigasi utama">' + menu + '</nav>' +

          '<div class="sidebar-foot">' +
            '<div class="faskes-card">' +
              '<div class="t">Pos Binaan Terpadu</div>' +
              '<div class="s">' + UI.esc(u.klaster || CONFIG.WILAYAH) + '</div>' +
            '</div>' +
            '<button class="btn btn-ghost btn-sm btn-block" style="margin-top:12px" id="nav-keluar">' +
              UI.ikon('keluar') + 'Keluar dari Sistem</button>' +
          '</div>' +
        '</aside>' +

        '<div class="main">' +
          '<header class="topbar">' +
            '<button class="btn btn-icon btn menu-toggle" data-buka-nav aria-label="Buka menu navigasi">' +
              UI.ikon('menu') + '</button>' +

            '<div class="topbar-search">' + UI.ikon('cari') +
              '<input class="input" id="nav-cari" placeholder="Cari NIK, nama pasien, atau No. Rekam Medis…" ' +
                'aria-label="Cari pasien">' +
              '<span class="topbar-scope">' + (API.isSuperAdmin() ? 'Semua Faskes' : 'Klaster Saya') + '</span>' +
            '</div>' +

            '<button class="btn btn-icon btn bell" id="nav-lonceng" aria-label="Notifikasi">' +
              UI.ikon('lonceng') + '<span class="dot-alert"></span></button>' +

            '<button class="user-chip" id="nav-user">' +
              '<div class="right u-meta">' +
                '<div class="u-name">' + UI.esc(u.nama || '-') + '</div>' +
                '<div class="u-role">' + UI.esc(u.peran || '') + '</div>' +
              '</div>' +
              UI.avatar(u.nama, u.foto) +
            '</button>' +
          '</header>' +

          '<main class="page" id="konten">' + isi + '</main>' +
        '</div>' +
      '</div>';
  },

  /* ----------------------------------------------------------------------
     PEMASANGAN INTERAKSI KERANGKA
     ---------------------------------------------------------------------- */
  _pasangNavigasi() {
    const app = document.getElementById('app');

    // Navigasi deklaratif: elemen apa pun dengan data-ke berpindah halaman.
    app.querySelectorAll('[data-ke]').forEach(el => {
      if (el.dataset.terpasang) return;
      el.dataset.terpasang = '1';
      el.addEventListener('click', (e) => {
        e.preventDefault();
        location.hash = el.dataset.ke;
      });
    });

    // Gulir ke bagian tertentu pada halaman publik.
    app.querySelectorAll('[data-gulir]').forEach(el => {
      el.addEventListener('click', () => {
        const bagian = document.querySelectorAll('.public-wrap > section');
        const indeks = el.dataset.gulir === 'cara' ? 1 : 2;
        if (bagian[indeks]) bagian[indeks].scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Laci navigasi seluler.
    const buka = app.querySelector('[data-buka-nav]');
    if (buka) buka.addEventListener('click', () => document.body.classList.toggle('nav-open'));
    const scrim = app.querySelector('[data-tutup-nav]');
    if (scrim) scrim.addEventListener('click', () => document.body.classList.remove('nav-open'));
    app.querySelectorAll('.nav-item').forEach(b =>
      b.addEventListener('click', () => document.body.classList.remove('nav-open')));

    // Keluar dari sistem.
    const keluar = document.getElementById('nav-keluar');
    if (keluar) keluar.addEventListener('click', async () => {
      if (!await UI.konfirmasi('Keluar dari Sistem',
        'Sesi Anda akan diakhiri dan token akses dihapus dari perangkat ini. Lanjutkan?')) return;
      await API.post('logout', { token: API.token });
      API.hapusSesi();
      location.hash = '#/masuk';
    });

    // Pencarian global menuju daftar pasien.
    const cari = document.getElementById('nav-cari');
    if (cari) cari.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const q = e.target.value.trim();
      if (!q) return;
      PAGES.pasien._filter = { halaman: 1, cari: q, jenisPtm: '', statusKunjungan: '', klaster: '', filterCepat: '' };
      if (location.hash === '#/pasien') this.muat();
      else location.hash = '#/pasien';
    });

    // Notifikasi ringkas.
    const lonceng = document.getElementById('nav-lonceng');
    if (lonceng) lonceng.addEventListener('click', () => this._dialogNotifikasi());

    // Menu pengguna.
    const user = document.getElementById('nav-user');
    if (user) user.addEventListener('click', () => this._dialogProfil());
  },

  async _dialogNotifikasi() {
    const d = await API.ambil('dashboard', {}, { diam: true });
    const r = d ? d.ringkasan : null;

    UI.modal({
      judul: 'Notifikasi Operasional',
      sub: 'Ringkasan hal yang memerlukan perhatian Anda hari ini',
      isi: r
        ? '<div class="col" style="gap:12px">' +
            this._notif('jadwal', r.menungguHariIni + ' pasien belum hadir',
              'Dari total ' + r.kontrolHariIni + ' jadwal kontrol hari ini.', '#/pasien') +
            this._notif('pesanCek', r.reminderTerkirim + ' reminder terkirim',
              'H-3: ' + r.breakdownReminder.h3 + ' · H-1: ' + r.breakdownReminder.h1 + ' · H-0: ' + r.breakdownReminder.h0, '#/jadwal') +
            (API.isSuperAdmin()
              ? this._notif('perisai', 'Antrean verifikasi akun petugas',
                  'Tinjau permohonan akses tenaga medis baru.', '#/akun')
              : '') +
            this._notif('target', 'Kepatuhan ' + UI.persen(r.tingkatKepatuhan),
              r.tingkatKepatuhan >= 85 ? 'Di atas target Dinkes.' : 'Di bawah target Dinkes — perlu intensifikasi edukasi.', '#/laporan') +
          '</div>'
        : '<p class="muted">Tidak ada notifikasi yang dapat dimuat saat ini.</p>',
      aksi: [{ teks: 'Tutup', kelas: 'btn-ghost' }]
    });

    document.querySelectorAll('.modal [data-ke]').forEach(el => el.addEventListener('click', () => {
      location.hash = el.dataset.ke;
      UI.tutupModal();
    }));
  },

  _notif(ikon, judul, isi, ke) {
    return '<div class="metric" style="cursor:pointer" data-ke="' + ke + '">' +
      '<div class="row" style="gap:12px">' +
        '<div class="kpi-icon" style="flex:none">' + UI.ikon(ikon) + '</div>' +
        '<div class="grow"><div class="strong small">' + UI.esc(judul) + '</div>' +
        '<div class="tiny muted">' + UI.esc(isi) + '</div></div>' +
        '<span style="color:var(--ink-3)">' + UI.ikon('panahKanan') + '</span>' +
      '</div></div>';
  },

  _dialogProfil() {
    const u = API.user || {};
    UI.modal({
      judul: 'Profil Petugas',
      isi:
        '<div class="row" style="gap:16px;margin-bottom:20px">' +
          UI.avatar(u.nama, u.foto, 'avatar-xl') +
          '<div><h3 style="margin-bottom:4px">' + UI.esc(u.nama) + '</h3>' +
          '<span class="badge ' + (API.isSuperAdmin() ? 'badge-solid' : 'badge-info') + '">' +
            UI.ikon('perisai') + UI.esc(u.peran) + '</span></div>' +
        '</div>' +
        '<div class="col" style="gap:14px">' +
          UI.fakta('Email Kedinasan', u.email, { mono: true }) +
          UI.fakta('NIP / No. KTA', u.nip || '-', { mono: true }) +
          UI.fakta('Klaster Penugasan', u.klaster || '-') +
        '</div>' +
        '<div class="callout callout-neutral" style="margin-top:16px">' + UI.ikon('gembok') +
          '<div>Hak akses Anda dibatasi matriks RBAC. ' +
          (API.isSuperAdmin()
            ? 'Sebagai Super Admin, Anda melihat data seluruh klaster dan dapat memverifikasi akun petugas.'
            : 'Sebagai Admin, Anda hanya melihat data pasien pada klaster penugasan Anda.') +
          '</div></div>',
      aksi: [{ teks: 'Tutup', kelas: 'btn-ghost' }]
    });
  }
};

/* ==========================================================================
   INISIALISASI
   ========================================================================== */
(function mulai() {
  API.muatSesi();

  window.addEventListener('hashchange', () => Router.muat());

  document.addEventListener('DOMContentLoaded', () => {
    // Arahkan pengguna yang sudah masuk ke beranda perannya masing-masing.
    if (!location.hash || location.hash === '#' || location.hash === '#/') {
      if (API.isPetugas()) location.hash = '#/dashboard';
      else if (API.isPasien()) location.hash = '#/portal';
    }

    Router.muat();

    if (CONFIG.MODE_DEMO) {
      setTimeout(() => UI.toast(
        'Mode demo aktif — isi GAS_URL pada js/config.js untuk menghubungkan backend Apps Script.', 'info'), 1200);
    }
  });

  // Bila DOM sudah siap sebelum skrip ini dijalankan.
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
      if (!document.getElementById('app').innerHTML.trim()) Router.muat();
    }, 0);
  }
})();
