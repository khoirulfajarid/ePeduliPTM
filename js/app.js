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
  /* `aksi` dipakai untuk pra-pasok: begitu kursor menyentuh menu, datanya
     sudah mulai ditarik sebelum jarinya sempat mengklik.                    */
  MENU: [
    { hash: '#/dashboard',  ikon: 'dashboard', teks: 'Dashboard (Ringkasan)',   aksi: 'dashboard' },
    { hash: '#/pasien',     ikon: 'pasien',    teks: 'Pasien PTM',              aksi: 'listPasien' },
    { hash: '#/jadwal',     ikon: 'jadwal',    teks: 'Jadwal & Reminder',       aksi: 'listPasien' },
    { hash: '#/pengumuman', ikon: 'megafon',   teks: 'Pengumuman',              aksi: 'listPengumuman' },
    { hash: '#/laporan',    ikon: 'laporan',   teks: 'Laporan Pelayanan',       aksi: 'getLaporan' },
    { hash: '#/akun',       ikon: 'perisai',   teks: 'Verifikasi Akun Staff',   aksi: 'listAkun', hanyaSuper: true },
    { hash: '#/pengaturan', ikon: 'gear',      teks: 'Pengaturan Sistem',       aksi: 'getPengaturan' }
  ],

  _halamanAktif: null,
  _paramAktif: {},
  _shellAktif: null,      // kerangka yang sedang terpasang: app | publik | polos
  _snapshot: {},          // { kunciRute: { html, d } } — gambar terakhir tiap halaman
  _giliran: 0,            // penanda anti balapan antar navigasi cepat

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
     PEMUATAN HALAMAN — tiga langkah, tidak satu pun memblokir layar
     ----------------------------------------------------------------------
     1. Kerangka (sidebar + topbar) dipasang SEKALI, tidak pernah dibangun
        ulang saat berpindah menu.
     2. Konten digambar SEGERA dari gambar terakhir yang tersimpan; bila
        belum pernah dibuka, tampilkan kerangka isi (skeleton) — bukan
        spinner layar penuh.
     3. Data diambil; karena Store mengembalikan simpanan lebih dulu, langkah
        ini biasanya selesai dalam hitungan milidetik.
     ---------------------------------------------------------------------- */
  async muat(opsi) {
    const o = opsi || {};
    const jalur = location.hash.replace(/^#/, '') || '/';
    const hasil = this.cocokkan(jalur);

    if (!o.diam) {
      UI.tutupModal();
      document.body.classList.remove('nav-open');
    }

    if (!hasil || !PAGES[hasil.halaman]) return this._tampilkan404(jalur);

    const halaman = PAGES[hasil.halaman];
    if (!this.izinkan(halaman)) return;

    const giliran = ++this._giliran;
    this._halamanAktif = hasil.halaman;
    this._paramAktif = hasil.params;
    document.title = halaman.judul + ' — ' + CONFIG.NAMA_APP;

    // --- Langkah 1: pastikan kerangka yang benar sudah terpasang -----------
    this._pasangShell(halaman);
    this._tandaiNavAktif();

    const konten = document.getElementById('konten');
    const kunci = this._kunciRute(halaman, hasil.params);

    // --- Langkah 2: gambar segera dari simpanan ----------------------------
    let sudahTergambar = false;
    const simpanan = halaman.tanpaSnapshot ? null : this._snapshot[kunci];

    if (simpanan && !o.diam) {
      konten.innerHTML = simpanan.html;
      if (simpanan.d !== undefined) halaman._d = simpanan.d;
      this._jalankanPasang(halaman, hasil.params);
      sudahTergambar = true;
    } else if (!o.diam) {
      konten.innerHTML = this._kerangkaIsi(halaman);
    }

    if (!o.diam) window.scrollTo(0, 0);

    // --- Langkah 3: muat data (umumnya langsung dari cache) ----------------
    let isi;
    try {
      isi = await halaman.muat(hasil.params);
    } catch (err) {
      isi = UI.kosong('Terjadi kesalahan saat menampilkan halaman',
        String(err && err.message ? err.message : err), 'peringatan');
    }

    // Pengguna sudah berpindah ke halaman lain — buang hasil yang basi ini.
    if (giliran !== this._giliran) return;

    // Tidak ada perubahan dibanding yang sudah terlihat: jangan ganggu layar
    // (fokus input, posisi gulir, dan animasi tetap utuh).
    if (sudahTergambar && simpanan && simpanan.html === isi) return;

    konten.innerHTML = isi;
    if (!halaman.tanpaSnapshot) this._snapshot[kunci] = { html: isi, d: halaman._d };
    this._jalankanPasang(halaman, hasil.params);

    if (!sudahTergambar && !o.diam) {
      konten.classList.remove('konten-masuk');
      void konten.offsetWidth;                 // paksa restart animasi
      konten.classList.add('konten-masuk');
    }
  },

  _jalankanPasang(halaman, params) {
    if (!halaman.pasang) return;
    try { halaman.pasang(params); }
    catch (err) { UI.toast('Sebagian interaksi halaman gagal dipasang: ' + err.message, 'error'); }
  },

  /** Kunci snapshot: halaman yang punya filter internal menyertakannya. */
  _kunciRute(halaman, params) {
    const dasar = this._halamanAktif + '|' + JSON.stringify(params || {});
    return halaman.kunciCache ? dasar + '|' + halaman.kunciCache() : dasar;
  },

  /** Kerangka isi per halaman — lebih menenangkan daripada layar kosong. */
  _kerangkaIsi(halaman) {
    if (halaman.shell !== 'app') {
      return '<div class="public-wrap"><div class="skeleton sk-card" style="height:220px"></div></div>';
    }
    return '<div class="col" style="gap:24px">' +
        '<div class="skeleton" style="height:96px;border-radius:1rem"></div>' +
        '<div class="kpi-grid">' +
          '<div class="skeleton sk-card"></div><div class="skeleton sk-card"></div>' +
          '<div class="skeleton sk-card"></div><div class="skeleton sk-card"></div>' +
        '</div>' +
        '<div class="skeleton" style="height:320px;border-radius:1rem"></div>' +
      '</div>';
  },

  _tampilkan404(jalur) {
    this._shellAktif = null;
    document.getElementById('app').innerHTML = this._shellPolos(
      '<div class="public-wrap">' +
        UI.kosong('Halaman tidak ditemukan',
          'Alamat "' + UI.esc(jalur) + '" tidak dikenali sistem. Kembali ke beranda untuk melanjutkan.', 'peringatan') +
        '<div class="center"><button class="btn btn-primary btn-inline" data-ke="#/">Kembali ke Beranda</button></div>' +
      '</div>');
  },

  /**
   * Pasang kerangka hanya bila jenisnya berubah. Inilah yang menghilangkan
   * kedipan sidebar dan pembangunan ulang DOM di setiap perpindahan menu.
   */
  _pasangShell(halaman) {
    const app = document.getElementById('app');
    const perlu = halaman.shell || 'polos';

    if (this._shellAktif === perlu && document.getElementById('konten')) {
      if (perlu === 'app') this._segarkanIdentitas();
      return;
    }

    app.innerHTML = this._bungkus(halaman, '');
    this._shellAktif = perlu;
    this._pasangKerangka();
  },

  /** Perbarui nama & foto di topbar tanpa menggambar ulang apa pun. */
  _segarkanIdentitas() {
    const u = API.user || {};
    const nama = document.querySelector('#nav-user .u-name');
    const peran = document.querySelector('#nav-user .u-role');
    if (nama && nama.textContent !== (u.nama || '-')) nama.textContent = u.nama || '-';
    if (peran && peran.textContent !== (u.peran || '')) peran.textContent = u.peran || '';
  },

  /** Tandai menu aktif lewat pengubahan kelas — tanpa render ulang. */
  _tandaiNavAktif() {
    const aktif = '#' + (location.hash.replace(/^#/, '') || '/');
    document.querySelectorAll('.nav-item[data-ke]').forEach((b) => {
      const h = b.dataset.ke;
      const nyala = aktif === h || (h !== '#/dashboard' && aktif.indexOf(h) === 0);
      b.classList.toggle('is-active', nyala);
    });
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
        return '<button class="nav-item' + (nyala ? ' is-active' : '') + '" data-ke="' + m.hash +
          '" data-prapasok="' + m.aksi + '">' +
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
     INTERAKSI GLOBAL — dipasang SEKALI seumur hidup halaman
     ----------------------------------------------------------------------
     Memakai delegasi peristiwa pada document, sehingga konten yang digambar
     ulang tidak perlu memasang ulang penangan apa pun. Ini menghapus ratusan
     addEventListener per navigasi sekaligus mencegah kebocoran penangan.
     ---------------------------------------------------------------------- */
  pasangGlobal() {
    if (this._globalTerpasang) return;
    this._globalTerpasang = true;

    document.addEventListener('click', (e) => {
      // Navigasi deklaratif: elemen apa pun dengan data-ke berpindah halaman.
      const nav = e.target.closest('[data-ke]');
      if (nav) {
        e.preventDefault();
        document.body.classList.remove('nav-open');
        if (nav.closest('.modal-scrim')) UI.tutupModal();   // tautan di dalam dialog
        const tujuan = nav.dataset.ke;
        if (location.hash === tujuan) this.muat();   // klik menu yang sama = muat ulang
        else location.hash = tujuan;
        return;
      }

      // Gulir ke bagian tertentu pada halaman publik.
      const gulir = e.target.closest('[data-gulir]');
      if (gulir) {
        const bagian = document.querySelectorAll('.public-wrap > section');
        const indeks = gulir.dataset.gulir === 'cara' ? 1 : 2;
        if (bagian[indeks]) bagian[indeks].scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      if (e.target.closest('[data-buka-nav]'))  { document.body.classList.toggle('nav-open'); return; }
      if (e.target.closest('[data-tutup-nav]')) { document.body.classList.remove('nav-open'); return; }

      if (e.target.closest('#nav-lonceng')) { this._dialogNotifikasi(); return; }
      if (e.target.closest('#nav-user'))    { this._dialogProfil(); return; }

      if (e.target.closest('#nav-keluar')) { this._keluar(); return; }
    });

    // Pra-pasok saat kursor menyentuh menu: data mulai ditarik sebelum diklik.
    document.addEventListener('mouseover', (e) => {
      const item = e.target.closest('.nav-item[data-prapasok]');
      if (!item || item.dataset.sudahPrapasok) return;
      item.dataset.sudahPrapasok = '1';
      API.prapasok(item.dataset.prapasok, {});
    });

    // Pencarian global (Enter) menuju daftar pasien.
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !e.target.matches('#nav-cari')) return;
      const q = e.target.value.trim();
      if (!q) return;
      PAGES.pasien._filter = { halaman: 1, cari: q, jenisPtm: '', statusKunjungan: '', klaster: '', filterCepat: '' };
      if (location.hash === '#/pasien') this.muat();
      else location.hash = '#/pasien';
    });

    // Penyegaran latar belakang membawa data baru → gambar ulang diam-diam.
    Store.onSegar = () => {
      if (this._shellAktif && document.getElementById('konten')) this.muat({ diam: true });
    };

    // Kembali ke tab: pastikan angka yang terlihat masih mutakhir.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && API.masuk()) this.muat({ diam: true });
    });
  },

  async _keluar() {
    if (!await UI.konfirmasi('Keluar dari Sistem',
      'Sesi Anda akan diakhiri dan seluruh data yang tersimpan di perangkat ini dihapus. Lanjutkan?')) return;
    API.post('logout', { token: API.token });   // tidak perlu ditunggu
    API.hapusSesi();
    this._snapshot = {};
    this._shellAktif = null;
    location.hash = '#/masuk';
  },

  /** Penangan yang hanya ada selama kerangka tertentu terpasang. */
  _pasangKerangka() {
    if (this._shellAktif !== 'app') return;

    // Saat peramban menganggur, tarik data menu yang paling mungkin dibuka
    // berikutnya. Tidak mengganggu pemuatan halaman yang sedang berjalan.
    const prapasokAwal = () => {
      ['listPasien', 'listPengumuman'].forEach(a => API.prapasok(a, {}));
    };
    if (window.requestIdleCallback) requestIdleCallback(prapasokAwal, { timeout: 2500 });
    else setTimeout(prapasokAwal, 1800);
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
    // Tautan [data-ke] di dalam dialog sudah ditangani delegasi global.
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
  Store.bersihkan();          // buang cache kedaluwarsa dari sesi sebelumnya

  window.addEventListener('hashchange', () => Router.muat());

  const jalankan = () => {
    if (Router._sudahMulai) return;
    Router._sudahMulai = true;

    Router.pasangGlobal();

    // Arahkan pengguna yang sudah masuk ke beranda perannya masing-masing.
    if (!location.hash || location.hash === '#' || location.hash === '#/') {
      if (API.isPetugas()) location.hash = '#/dashboard';
      else if (API.isPasien()) location.hash = '#/portal';
    }

    Router.muat();

    // Satu permintaan komposit mengisi cache dashboard, pasien, pengaturan,
    // dan antrean verifikasi sekaligus — halaman-halaman itu lalu terbuka
    // tanpa menyentuh jaringan lagi.
    if (API.isPetugas()) {
      const awal = () => API.bootstrap({ diam: true });
      if (window.requestIdleCallback) requestIdleCallback(awal, { timeout: 3000 });
      else setTimeout(awal, 900);
    }

    if (CONFIG.MODE_DEMO) {
      setTimeout(() => UI.toast(
        'Mode demo aktif — isi GAS_URL pada js/config.js untuk menghubungkan backend Apps Script.', 'info'), 1200);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', jalankan);
  else jalankan();
})();
