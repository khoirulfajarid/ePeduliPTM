/* ==========================================================================
   PEDULI PTM — pages-admin.js  (bagian 2)
   Halaman internal petugas: Dashboard, Pasien, Formulir, Rekam Medis,
   Jadwal & Reminder, Pengumuman, Laporan, Verifikasi Akun, Pengaturan.
   ========================================================================== */

/* ==========================================================================
   HALAMAN 4 — DASHBOARD RINGKASAN
   ========================================================================== */
PAGES.dashboard = {
  judul: 'Dashboard (Ringkasan)',
  shell: 'app',
  perluSesi: 'Petugas',

  async muat() {
    const d = await API.ambil('dashboard');
    if (!d) return UI.kosong('Data tidak dapat dimuat', 'Periksa koneksi lalu muat ulang halaman.', 'peringatan');
    this._d = d;

    const r = d.ringkasan;
    const g = d.gateway;
    const pakaiPersen = g.kuotaHarian ? (g.terpakai / g.kuotaHarian) * 100 : 0;

    return '' +
    /* ---------- Banner ---------- */
    '<section class="hero">' +
      '<div class="grow">' +
        '<span class="hero-live"><span class="dot dot-live"></span>LIVE MONITORING ACTIVE</span>' +
        '<h1>Selamat Datang, ' + UI.esc(API.user.nama) + '</h1>' +
        '<p>Monitoring pasien Hipertensi &amp; Diabetes Melitus — ' + UI.esc(API.user.klaster) + '</p>' +
      '</div>' +
      '<div class="hero-sync">' +
        '<span style="color:rgba(255,255,255,.8)">' + UI.ikon('segar') + '</span>' +
        '<div class="grow"><div class="t">TERAKHIR SINKRONISASI</div>' +
        '<div class="v">' + UI.tanggal(d.sinkronisasi, 'waktu') + ' WIB</div></div>' +
        '<button class="btn btn-sm btn-inline" id="db-segar" style="background:#fff;color:var(--primary)">Refresh Data</button>' +
      '</div>' +
    '</section>' +

    /* ---------- KPI ---------- */
    '<section class="kpi-grid">' +
      UI.kpi({
        label: 'Total Pasien Terdaftar', ikon: 'pasien', nilai: UI.angka(r.totalPasien),
        kaki: '<span class="badge badge-success">' + UI.ikon('naik') + 'Aktif</span>' +
              '<span class="tiny muted">populasi binaan klaster</span>'
      }) +
      UI.kpi({
        label: 'Kontrol Hari Ini', ikon: 'jadwal', nada: 'accent',
        nilai: UI.angka(r.kontrolHariIni), unit: 'Pasien',
        kaki: '<span class="row small" style="gap:6px"><span class="dot dot-success"></span>' + r.hadirHariIni + ' Hadir</span>' +
              '<span class="row small muted" style="gap:6px"><span class="dot"></span>' + r.menungguHariIni + ' Menunggu</span>'
      }) +
      UI.kpi({
        label: 'Reminder Terkirim Hari Ini', ikon: 'pesanCek', nilai: UI.angka(r.reminderTerkirim),
        kaki: '<span class="badge badge-neutral">H-3: ' + r.breakdownReminder.h3 + '</span>' +
              '<span class="badge badge-neutral">H-1: ' + r.breakdownReminder.h1 + '</span>' +
              '<span class="badge badge-info">H-0: ' + r.breakdownReminder.h0 + '</span>'
      }) +
      UI.kpi({
        label: 'Tingkat Kepatuhan', ikon: 'target', nada: 'success',
        nilai: UI.persen(r.tingkatKepatuhan), nilaiNada: r.tingkatKepatuhan >= 85 ? 'success' : '',
        kaki: '<span class="tiny muted">' + (r.tingkatKepatuhan >= 85 ? 'Target kendali Dinkes (>85%) tercapai' : 'Di bawah target Dinkes (>85%)') + '</span>',
        progres: r.tingkatKepatuhan, progresWarna: r.tingkatKepatuhan >= 85 ? 'var(--success)' : 'var(--warning)'
      }) +
    '</section>' +

    /* ---------- Antrean + panel kanan ---------- */
    '<section class="split">' +
      '<div class="card">' +
        '<div class="card-head">' +
          '<div><h3 class="card-title">Jadwal Pasien Kontrol Hari Ini ' +
            '<span class="badge badge-info">' + r.kontrolHariIni + ' Antrean</span></h3>' +
            '<p class="card-sub">Status kedatangan real-time dan verifikasi pengiriman reminder otomatis</p></div>' +
          '<select class="select" id="db-filter" style="width:auto;min-width:190px">' +
            '<option value="">Semua Status Kehadiran</option>' +
            '<option value="Belum Berkunjung">Belum Berkunjung</option>' +
            '<option value="Sudah Berkunjung">Sudah Berkunjung</option>' +
          '</select>' +
        '</div>' +
        '<div class="table-wrap">' +
          '<table class="data"><thead><tr>' +
            '<th>Pasien</th><th>Diagnosis PTM</th><th>Estimasi Jam</th>' +
            '<th>Status Reminder</th><th>Kehadiran</th><th class="right">Aksi</th>' +
          '</tr></thead><tbody id="db-antrean">' + this._barisAntrean(d.antrean) + '</tbody></table>' +
        '</div>' +
        '<div class="card-foot row-between wrap">' +
          '<span class="small muted">Menampilkan ' + d.antrean.length + ' dari ' + r.kontrolHariIni + ' pasien hari ini</span>' +
          '<button class="btn btn-ghost btn-sm btn-inline" data-ke="#/pasien">' + UI.ikon('pasien') + 'Lihat Semua Antrean Pasien</button>' +
        '</div>' +
      '</div>' +

      '<div class="stack">' +
        /* Aksi cepat */
        '<div class="card card-pad">' +
          '<h4 style="margin-bottom:16px">' + UI.ikon('denyut') + ' Aksi Operasional Cepat</h4>' +
          '<div class="col" style="gap:10px">' +
            '<button class="btn btn-deep btn-block" data-ke="#/pasien/baru">' + UI.ikon('tambahOrang') + 'Tambah Pasien Baru</button>' +
            '<button class="btn btn-soft btn-block" data-ke="#/pengumuman">' + UI.ikon('megafon') + 'Buat Pengumuman Tertarget</button>' +
            '<button class="btn btn-ghost btn-block" id="db-rekap">' + UI.ikon('unduh') + 'Unduh Rekap Pelayanan Harian</button>' +
          '</div>' +
        '</div>' +

        /* Status gateway */
        '<div class="card">' +
          '<div class="card-head">' +
            '<div><h4 style="margin:0">' + UI.ikon('perisai') + ' Status Gateway Otomasi</h4></div>' +
            '<span class="badge badge-' + (g.waAktif ? 'success' : 'warning') + '">' + (g.waAktif ? 'STABIL' : 'PERLU SETUP') + '</span>' +
          '</div>' +
          '<div class="card-body">' +
            '<div class="row-between" style="padding-bottom:12px;border-bottom:1px solid var(--border)">' +
              '<span class="row small" style="gap:8px"><span class="dot ' + (g.waAktif ? 'dot-success' : 'dot-warning') + '"></span>' +
                'WhatsApp API Gateway (Fonnte)</span>' +
              '<span class="badge badge-' + (g.waAktif ? 'success' : 'warning') + '">' + (g.waAktif ? 'Aktif' : 'Nonaktif') + '</span>' +
            '</div>' +
            '<div class="row-between" style="padding:12px 0;border-bottom:1px solid var(--border)">' +
              '<span class="row small" style="gap:8px"><span class="dot dot-success"></span>Cron Apps Script (07:00 WIB)</span>' +
              '<span class="badge badge-success">Terjadwal</span>' +
            '</div>' +
            '<div style="padding-top:14px">' +
              '<div class="row-between small" style="margin-bottom:8px">' +
                '<span class="muted">Kuota Notifikasi Harian</span>' +
                '<span class="mono strong">' + g.terpakai + ' / ' + g.kuotaHarian + ' Pesan</span>' +
              '</div>' +
              '<div class="kpi-bar"><span style="width:' + Math.min(100, pakaiPersen) + '%;background:' +
                (pakaiPersen > 85 ? 'var(--danger)' : 'var(--primary)') + '"></span></div>' +
              '<div class="tiny muted right" style="margin-top:6px">Tersisa ' + g.sisa + ' kuota ' +
                (pakaiPersen > 85 ? '— mendekati batas' : 'aman') + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* Tren */
        '<div class="card card-pad">' +
          '<div class="row-between" style="margin-bottom:4px">' +
            '<h4 style="margin:0">Tren Kepatuhan Bulanan</h4>' +
            '<span class="badge badge-success">' + UI.ikon('naik') + this._delta(d.trenBulanan) + '</span>' +
          '</div>' +
          '<p class="tiny muted" style="margin-bottom:16px">Enam bulan terakhir · persentase hadir tepat waktu</p>' +
          UI.chartBatangPersen(d.trenBulanan) +
          '<div class="chart-note">' + UI.ikon('perisai') +
            '<div>Sistem reminder berhasil memangkas rasio lupa jadwal kontrol secara konsisten sejak diaktifkan.</div></div>' +
        '</div>' +
      '</div>' +
    '</section>';
  },

  _delta(tren) {
    if (!tren || tren.length < 2) return '0%';
    const selisih = (tren[tren.length - 1].persen || 0) - (tren[0].persen || 0);
    return (selisih >= 0 ? '+' : '') + selisih.toFixed(1) + '%';
  },

  _barisAntrean(list) {
    if (!list || !list.length) {
      return '<tr><td colspan="6">' + UI.kosong('Tidak ada jadwal kontrol hari ini',
        'Jadwal kunjungan pasien akan tampil di sini pada tanggal yang sesuai.', 'kalender') + '</td></tr>';
    }
    return list.map(p =>
      '<tr>' +
        '<td><div class="row">' + UI.avatar(p.nama, p.foto) +
          '<div><div class="cell-strong">' + UI.esc(p.nama) + '</div>' +
          '<div class="cell-meta">NIK: ' + UI.esc(p.nik) + '</div></div></div></td>' +
        '<td>' + UI.badgePtm(p.jenisPtm) + '</td>' +
        '<td><span class="mono strong">' + UI.esc(p.jam) + '</span> <span class="tiny muted">WIB</span></td>' +
        '<td>' + UI.badgeReminder(p.statusReminder) + '</td>' +
        '<td>' + UI.badgeKehadiran(p.statusKunjungan) + '</td>' +
        '<td class="right"><button class="btn btn-icon btn" data-ke="#/pasien/' + UI.esc(p.id) +
          '" aria-label="Lihat rekam medis ' + UI.esc(p.nama) + '">' + UI.ikon('mata') + '</button></td>' +
      '</tr>'
    ).join('');
  },

  pasang() {
    document.getElementById('db-segar').addEventListener('click', () => Router.muat());

    document.getElementById('db-filter').addEventListener('change', (e) => {
      const v = e.target.value;
      const list = v ? this._d.antrean.filter(p => p.statusKunjungan === v) : this._d.antrean;
      document.getElementById('db-antrean').innerHTML = this._barisAntrean(list);
    });

    document.getElementById('db-rekap').addEventListener('click', () => {
      Ekspor.csv('rekap-harian-' + UI.hariIni(), this._d.antrean.map(p => ({
        'ID Pasien': p.id, 'Nama': p.nama, 'NIK': p.nik, 'Diagnosis': p.jenisPtm,
        'Jam': p.jam, 'Status Reminder': p.statusReminder, 'Kehadiran': p.statusKunjungan, 'Klaster': p.klaster
      })));
    });

    UI.aktifkanTooltip(document.getElementById('app'));
  }
};

/* ==========================================================================
   HALAMAN 5 — DAFTAR PASIEN PTM
   ========================================================================== */
PAGES.pasien = {
  judul: 'Pasien PTM',
  shell: 'app',
  perluSesi: 'Petugas',
  _filter: { halaman: 1, cari: '', jenisPtm: '', statusKunjungan: '', klaster: '', filterCepat: '' },

  async muat() {
    const d = await API.ambil('listPasien', this._filter);
    if (!d) return UI.kosong('Data tidak dapat dimuat', 'Periksa koneksi lalu muat ulang halaman.', 'peringatan');
    this._d = d;
    const s = d.statistik;

    return '' +
    '<section class="kpi-grid">' +
      UI.kpi({ label: 'Total Pasien PTM', ikon: 'pasien', nilai: UI.angka(s.total),
               kaki: '<span class="tiny muted">seluruh klaster binaan</span>' }) +
      UI.kpi({ label: 'Hipertensi Aktif', ikon: 'denyut', nada: 'danger', nilai: UI.angka(s.hipertensi),
               kaki: '<span class="tiny muted">' + (s.total ? Math.round(s.hipertensi / s.total * 100) : 0) + '% dari total populasi</span>' }) +
      UI.kpi({ label: 'Diabetes Melitus', ikon: 'tetes', nada: 'accent', nilai: UI.angka(s.diabetes),
               kaki: '<span class="tiny muted">' + UI.angka(s.komorbid) + ' di antaranya komorbid</span>' }) +
      UI.kpi({ label: 'Jadwal Kontrol Hari Ini', ikon: 'jadwal', nada: 'success', nilai: UI.angka(s.kontrolHariIni),
               kaki: '<span class="tiny muted">perlu pemantauan kehadiran</span>' }) +
    '</section>' +

    '<section class="card card-pad">' +
      '<div class="row-between wrap">' +
        '<div>' +
          '<h1 style="margin-bottom:6px">Daftar Pasien Penyakit Tidak Menular ' +
            '<span class="badge badge-info badge-lg">' + UI.angka(d.total) + ' Terdata</span></h1>' +
          '<p class="muted" style="margin:0">' + UI.esc(CONFIG.NAMA_FASKES) +
            ' — rekam pemantauan rutin, reminder WhatsApp, dan kehadiran layanan Posbindu</p>' +
        '</div>' +
        '<div class="row wrap row-actions" style="gap:10px">' +
          '<button class="btn btn-ghost btn-sm btn-inline" id="ps-excel">' + UI.ikon('unduh') + 'Ekspor CSV</button>' +
          '<button class="btn btn-ghost btn-sm btn-inline" id="ps-cetak">' + UI.ikon('cetak') + 'Cetak Laporan</button>' +
          '<button class="btn btn-deep btn-sm btn-inline" data-ke="#/pasien/baru">' + UI.ikon('tambahOrang') + 'Tambah Pasien Baru</button>' +
        '</div>' +
      '</div>' +
    '</section>' +

    /* ---------- Filter ---------- */
    '<section class="card card-pad">' +
      '<div class="row wrap" style="gap:12px">' +
        '<div class="input-icon grow" style="min-width:240px">' + UI.ikon('cari') +
          '<input class="input" id="ps-cari" placeholder="Cari nama, NIK, atau No. BPJS…" value="' + UI.esc(this._filter.cari) + '">' +
        '</div>' +
        '<select class="select" id="ps-ptm" style="width:auto;min-width:170px">' +
          '<option value="">Semua Jenis PTM</option>' +
          CONFIG.JENIS_PTM.map(j => '<option value="' + UI.esc(j.nilai) + '"' +
            (this._filter.jenisPtm === j.nilai ? ' selected' : '') + '>' + UI.esc(j.judul) + '</option>').join('') +
        '</select>' +
        '<select class="select" id="ps-hadir" style="width:auto;min-width:180px">' +
          '<option value="">Semua Kehadiran</option>' +
          CONFIG.STATUS_KUNJUNGAN.map(v => '<option value="' + UI.esc(v) + '"' +
            (this._filter.statusKunjungan === v ? ' selected' : '') + '>' + UI.esc(v) + '</option>').join('') +
        '</select>' +
        '<select class="select" id="ps-klaster" style="width:auto;min-width:190px">' +
          '<option value="">Semua Klaster</option>' +
          (d.klasterTersedia || []).map(k => '<option value="' + UI.esc(k) + '"' +
            (this._filter.klaster === k ? ' selected' : '') + '>' + UI.esc(k) + '</option>').join('') +
        '</select>' +
      '</div>' +
      '<div class="row wrap" style="gap:10px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">' +
        '<span class="label-kicker">Filter Cepat:</span>' +
        '<button class="btn btn-xs btn-ghost btn-inline ' + (this._filter.filterCepat === 'perluKontak' ? 'is-on' : '') +
          '" data-cepat="perluKontak">Perlu Kontak Hari Ini</button>' +
        '<button class="btn btn-xs btn-ghost btn-inline" data-cepat="jadwalTertunda">Jadwal Tertunda</button>' +
        '<button class="btn btn-xs btn-ghost btn-inline" id="ps-reset">' + UI.ikon('segar') + 'Reset Filter</button>' +
      '</div>' +
    '</section>' +

    /* ---------- Tabel ---------- */
    '<section class="card">' +
      '<div class="table-wrap">' +
        '<table class="data"><thead><tr>' +
          '<th>Foto &amp; Pasien</th><th>Diagnosis PTM</th><th>Kontak &amp; Darurat</th>' +
          '<th>Jadwal Kunjungan Berikutnya</th><th>Status Reminder</th><th>Status Kehadiran</th><th class="right">Aksi</th>' +
        '</tr></thead><tbody>' + this._baris(d.pasien) + '</tbody></table>' +
      '</div>' +
      '<div class="card-foot row-between wrap">' +
        '<span class="small muted">Menampilkan ' +
          (d.total ? ((d.halaman - 1) * d.perHalaman + 1) : 0) + '–' +
          Math.min(d.halaman * d.perHalaman, d.total) + ' dari ' + UI.angka(d.total) + ' pasien terdaftar</span>' +
        '<div class="pagination">' + this._paginasi(d) + '</div>' +
      '</div>' +
    '</section>' +

    /* ---------- Kartu informasi bawah ---------- */
    '<section class="split-even">' +
      '<div class="card card-pad">' +
        '<div class="row-between" style="margin-bottom:10px">' +
          '<h4 style="margin:0">' + UI.ikon('pesan') + ' Mesin Otomasi WhatsApp</h4>' +
          '<span class="badge badge-success">Aktif Normal</span>' +
        '</div>' +
        '<p class="small muted" style="margin:0">Antrean pengingat terjadwal berjalan setiap pagi pukul 07.00 WIB melalui ' +
          'time-driven trigger Apps Script. Pesan dipecah per batch agar tidak menembus batas eksekusi 6 menit.</p>' +
      '</div>' +
      '<div class="card card-pad">' +
        '<div class="row-between" style="margin-bottom:10px">' +
          '<h4 style="margin:0">' + UI.ikon('cekLingkar') + ' Validasi Data Skrining</h4>' +
          '<span class="badge badge-info">' + UI.esc(API.user.klaster) + '</span>' +
        '</div>' +
        '<p class="small muted" style="margin:0 0 14px">Data pasien hasil skrining kader lapangan memerlukan verifikasi dokter ' +
          'penanggung jawab sebelum masuk ke jadwal kontrol resmi.</p>' +
        '<button class="btn btn-ghost btn-sm btn-inline" data-cepat="perluKontak">Buka Antrean Validasi</button>' +
      '</div>' +
      '<div class="card card-pad">' +
        '<div class="row-between" style="margin-bottom:10px">' +
          '<h4 style="margin:0">' + UI.ikon('info') + ' Prosedur Evaluasi PTM</h4>' +
        '</div>' +
        '<p class="small muted" style="margin:0">Pasien dengan tekanan darah ≥ 160/100 mmHg atau gula darah sewaktu ' +
          '&gt; 250 mg/dL wajib diarahkan ke dokter faskes tingkat pertama dalam 1×24 jam sesuai SOP Kemenkes.</p>' +
      '</div>' +
    '</section>';
  },

  _baris(list) {
    if (!list || !list.length) {
      return '<tr><td colspan="7">' + UI.kosong('Tidak ada pasien yang cocok',
        'Ubah kata kunci pencarian atau atur ulang filter untuk melihat data lain.', 'cari') + '</td></tr>';
    }
    return list.map(p =>
      '<tr>' +
        '<td><div class="row">' + UI.avatar(p.nama, p.foto) +
          '<div><div class="cell-strong">' + UI.esc(p.nama) + '</div>' +
          '<div class="cell-meta">' + UI.esc(p.usia || '-') + ' th · ' + UI.esc(p.jenisKelamin || '-') + '</div>' +
          '<div class="cell-meta">NIK: ' + UI.esc(p.nik) + '</div></div></div></td>' +
        '<td>' + UI.badgePtm(p.jenisPtm) +
          (p.catatan ? '<div class="cell-meta" style="max-width:180px">' + UI.esc(String(p.catatan).slice(0, 52)) + '</div>' : '') + '</td>' +
        '<td><div class="mono small">' + UI.esc(p.noHp || '-') + '</div>' +
          '<div class="cell-meta">' + UI.esc(p.namaKeluarga || '-') +
          (p.hubunganKeluarga ? ' (' + UI.esc(p.hubunganKeluarga) + ')' : '') + '</div></td>' +
        '<td><div class="strong small">' + UI.tanggal(p.tanggal, 'pendek') + '</div>' +
          '<div class="cell-meta">' + UI.esc(p.jam || '-') + ' WIB · ' + UI.esc(p.klaster || '-') + '</div></td>' +
        '<td>' + UI.badgeReminder(p.statusReminder) + '</td>' +
        '<td>' + UI.badgeKehadiran(p.statusKunjungan) + '</td>' +
        '<td class="right"><div class="row" style="gap:2px;justify-content:flex-end">' +
          '<button class="btn btn-icon btn" data-ke="#/pasien/' + UI.esc(p.id) + '" aria-label="Lihat rekam medis">' + UI.ikon('mata') + '</button>' +
          '<button class="btn btn-icon btn" data-wa="' + UI.esc(p.id) + '" aria-label="Kirim reminder WhatsApp">' + UI.ikon('pesan') + '</button>' +
          (API.isSuperAdmin()
            ? '<button class="btn btn-icon btn" data-hapus="' + UI.esc(p.id) + '" data-nama="' + UI.esc(p.nama) +
              '" aria-label="Hapus data pasien" style="color:var(--danger)">' + UI.ikon('sampah') + '</button>' : '') +
        '</div></td>' +
      '</tr>'
    ).join('');
  },

  _paginasi(d) {
    if (d.totalHalaman <= 1) return '';
    let h = '<button class="page-btn" data-hal="' + (d.halaman - 1) + '"' + (d.halaman === 1 ? ' disabled' : '') + ' aria-label="Halaman sebelumnya">‹</button>';
    const tampil = [];
    for (let i = 1; i <= d.totalHalaman; i++) {
      if (i === 1 || i === d.totalHalaman || Math.abs(i - d.halaman) <= 1) tampil.push(i);
      else if (tampil[tampil.length - 1] !== '…') tampil.push('…');
    }
    tampil.forEach(i => {
      h += i === '…'
        ? '<span class="page-btn" style="border:none;background:none">…</span>'
        : '<button class="page-btn' + (i === d.halaman ? ' is-active' : '') + '" data-hal="' + i + '">' + i + '</button>';
    });
    h += '<button class="page-btn" data-hal="' + (d.halaman + 1) + '"' + (d.halaman === d.totalHalaman ? ' disabled' : '') + ' aria-label="Halaman berikutnya">›</button>';
    return h;
  },

  pasang() {
    const app = document.getElementById('app');

    const terapkan = () => { this._filter.halaman = 1; Router.muat(); };
    let tempo;
    document.getElementById('ps-cari').addEventListener('input', (e) => {
      clearTimeout(tempo);
      this._filter.cari = e.target.value;
      tempo = setTimeout(terapkan, 420);
    });
    document.getElementById('ps-ptm').addEventListener('change', (e) => { this._filter.jenisPtm = e.target.value; terapkan(); });
    document.getElementById('ps-hadir').addEventListener('change', (e) => { this._filter.statusKunjungan = e.target.value; terapkan(); });
    document.getElementById('ps-klaster').addEventListener('change', (e) => { this._filter.klaster = e.target.value; terapkan(); });

    document.getElementById('ps-reset').addEventListener('click', () => {
      this._filter = { halaman: 1, cari: '', jenisPtm: '', statusKunjungan: '', klaster: '', filterCepat: '' };
      Router.muat();
    });

    app.querySelectorAll('[data-cepat]').forEach(b => b.addEventListener('click', () => {
      this._filter.filterCepat = this._filter.filterCepat === b.dataset.cepat ? '' : b.dataset.cepat;
      terapkan();
    }));

    app.querySelectorAll('[data-hal]').forEach(b => b.addEventListener('click', () => {
      this._filter.halaman = Number(b.dataset.hal);
      Router.muat();
    }));

    app.querySelectorAll('[data-wa]').forEach(b => b.addEventListener('click', () => {
      const p = this._d.pasien.filter(x => x.id === b.dataset.wa)[0];
      if (p) PAGES.pasienDetail.dialogReminder(p);
    }));

    app.querySelectorAll('[data-hapus]').forEach(b => b.addEventListener('click', async () => {
      const ok = await UI.konfirmasi('Hapus Data Pasien',
        'Data pasien "' + b.dataset.nama + '" beserta relasinya akan dihapus permanen dari sheet Pasien.\n\n' +
        'Tindakan ini tidak dapat dibatalkan. Lanjutkan?', { bahaya: true, ya: 'Ya, Hapus Permanen' });
      if (!ok) return;
      const res = await API.kirim('deletePasien', { id: b.dataset.hapus });
      if (res.success) Router.muat();
    }));

    document.getElementById('ps-excel').addEventListener('click', () => {
      Ekspor.csv('daftar-pasien-ptm-' + UI.hariIni(), this._d.pasien.map(p => ({
        'ID Pasien': p.id, 'Nama': p.nama, 'NIK': p.nik, 'Usia': p.usia, 'Jenis Kelamin': p.jenisKelamin,
        'Diagnosis PTM': p.jenisPtm, 'No HP': p.noHp, 'Email': p.email, 'No BPJS': p.noBpjs,
        'Klaster': p.klaster, 'Tanggal Kontrol': p.tanggal, 'Jam': p.jam,
        'Status Reminder': p.statusReminder, 'Status Kehadiran': p.statusKunjungan
      })));
    });

    document.getElementById('ps-cetak').addEventListener('click', () => window.print());
  }
};

/* ==========================================================================
   HALAMAN 6 — FORMULIR PENDAFTARAN & REKAM KLINIS
   ========================================================================== */
PAGES.pasienForm = {
  judul: 'Formulir Pendaftaran & Rekam Klinis Pasien PTM',
  shell: 'app',
  perluSesi: 'Petugas',
  _berkas: { foto: null, lab: null, resep: null },

  async muat(params) {
    this._berkas = { foto: null, lab: null, resep: null };
    this._id = (params && params.id) || '';
    let p = null;

    if (this._id) {
      const d = await API.ambil('getPasien', { id: this._id });
      if (d) p = Object.assign({}, d.profil, {
        alamat: d.alamat, tanggalLahir: d.tanggalLahir, dokterPj: d.dokterPj, kader: d.kader,
        klinis: d.klinisTerkini
      });
    }
    this._p = p;
    const v = (k, bawaan) => UI.esc(p && p[k] !== undefined && p[k] !== '' ? p[k] : (bawaan || ''));
    const klinis = (p && p.klinis) || {};

    return '' +
    '<section class="row-between wrap" style="gap:16px">' +
      '<div>' +
        '<div class="row small muted" style="gap:6px;margin-bottom:8px">' +
          '<a href="#/pasien">Manajemen Pasien</a> › <span>' + (this._id ? 'Sunting Data Pasien' : 'Tambah Pasien Baru') + '</span>' +
        '</div>' +
        '<h1 style="margin-bottom:6px">Formulir Pendaftaran &amp; Rekam Klinis Pasien PTM</h1>' +
        '<p class="muted" style="margin:0;max-width:76ch">Lengkapi data kependudukan, kontak keluarga, klasifikasi penyakit tidak menular, ' +
          'serta riwayat obat dan penunjang medis.</p>' +
      '</div>' +
      '<div class="row wrap row-actions" style="gap:10px">' +
        '<button class="btn btn-ghost btn-sm btn-inline" data-ke="#/pasien">' + UI.ikon('silang') + 'Batal / Kembali</button>' +
        '<button class="btn btn-deep btn-sm btn-inline" id="fm-simpan">' + UI.ikon('cekLingkar') + 'Simpan Pasien &amp; Jadwalkan</button>' +
      '</div>' +
    '</section>' +

    '<section class="split-wide">' +
      '<div class="stack">' +

        /* ---------- A. Identitas ---------- */
        '<div class="card card-pad">' +
          '<div class="row-between wrap" style="margin-bottom:20px">' +
            '<div><h3 class="section-title"><span class="sec-mark">A</span>Identitas Kependudukan &amp; Demografi</h3>' +
            '<p class="card-sub">Sinkronisasi data master register rekam medis (sheet Pasien)</p></div>' +
            (this._id ? '<span class="badge badge-info badge-lg">' + UI.esc(this._id) + '</span>' : '') +
          '</div>' +

          '<div class="field">' +
            '<label class="form-label" for="f-nama">Nama Lengkap Pasien<span class="req">*</span></label>' +
            '<input class="input" id="f-nama" placeholder="Sesuai KTP, termasuk gelar bila ada" value="' + v('nama') + '">' +
          '</div>' +

          '<div class="split-even" style="gap:0 16px">' +
            '<div class="field">' +
              '<label class="form-label" for="f-nik">NIK (16 digit KTP)<span class="req">*</span></label>' +
              '<input class="input mono" id="f-nik" inputmode="numeric" maxlength="16" value="' + v('nik') + '">' +
              '<div class="field-hint" id="f-nik-hint">Digunakan sebagai kunci unik lintas faskes.</div>' +
            '</div>' +
            '<div class="field">' +
              '<label class="form-label" for="f-bpjs">No. Kartu BPJS Kesehatan</label>' +
              '<input class="input mono" id="f-bpjs" inputmode="numeric" value="' + v('noBpjs') + '">' +
              '<div class="field-hint">Kosongkan bila pasien berstatus umum / non-PBI.</div>' +
            '</div>' +
          '</div>' +

          '<div class="split-even" style="gap:0 16px">' +
            '<div class="field">' +
              '<label class="form-label">Jenis Kelamin<span class="req">*</span></label>' +
              '<div class="row" style="gap:16px">' +
                '<label class="check"><input type="radio" name="f-jk" value="Laki-laki"' +
                  (!p || p.jenisKelamin !== 'Perempuan' ? ' checked' : '') + '> Laki-laki</label>' +
                '<label class="check"><input type="radio" name="f-jk" value="Perempuan"' +
                  (p && p.jenisKelamin === 'Perempuan' ? ' checked' : '') + '> Perempuan</label>' +
              '</div>' +
            '</div>' +
            '<div class="field">' +
              '<label class="form-label" for="f-lahir">Tanggal Lahir &amp; Usia Otomatis<span class="req">*</span></label>' +
              '<input class="input" id="f-lahir" type="date" value="' + v('tanggalLahir') + '">' +
              '<div class="field-hint" id="f-usia">Usia dihitung otomatis dari tanggal lahir.</div>' +
            '</div>' +
          '</div>' +

          '<div class="field">' +
            '<label class="form-label" for="f-alamat">Alamat Domisili Lengkap &amp; Rincian Wilayah<span class="req">*</span></label>' +
            '<textarea class="textarea" id="f-alamat" rows="2" ' +
              'placeholder="Jalan, nomor, RT/RW, kelurahan, kecamatan, kota">' + v('alamat') + '</textarea>' +
          '</div>' +
        '</div>' +

        /* ---------- B. Kontak ---------- */
        '<div class="card card-pad">' +
          '<div class="row-between wrap" style="margin-bottom:20px">' +
            '<div><h3 class="section-title"><span class="sec-mark" style="background:var(--accent-soft);color:var(--info)">B</span>' +
              'Kontak Komunikasi &amp; Saluran Pengingat</h3>' +
            '<p class="card-sub">Basis nomor transmisi WhatsApp Gateway terintegrasi Fonnte API</p></div>' +
          '</div>' +

          '<div class="split-even" style="gap:0 16px">' +
            '<div class="field">' +
              '<label class="form-label" for="f-hp">No. HP / WhatsApp Pasien<span class="req">*</span></label>' +
              '<div class="input-icon">' + UI.ikon('pesan') +
                '<input class="input mono" id="f-hp" inputmode="tel" placeholder="0812xxxxxxxx" value="' + v('noHp') + '">' +
              '</div>' +
              '<div class="field-hint">Dipakai untuk otomatisasi pengiriman reminder H-3, H-1, dan Hari-H.</div>' +
            '</div>' +
            '<div class="field">' +
              '<label class="form-label" for="f-email">Alamat Email Pasien (opsional)</label>' +
              '<div class="input-icon">' + UI.ikon('surel') +
                '<input class="input" id="f-email" type="email" value="' + v('email') + '">' +
              '</div>' +
              '<div class="field-hint">Bila diisi, pasien menerima salinan pengingat lewat email.</div>' +
            '</div>' +
          '</div>' +

          '<div class="metric" style="margin-top:8px">' +
            '<div class="strong small" style="margin-bottom:14px">' + UI.ikon('orang') +
              ' Kontak Pendamping / Penanggung Jawab Keluarga (Darurat)</div>' +
            '<div class="split-even" style="gap:0 16px">' +
              '<div class="field" style="margin-bottom:0">' +
                '<label class="form-label" for="f-kel-nama">Nama Pendamping</label>' +
                '<input class="input" id="f-kel-nama" value="' + v('namaKeluarga') + '">' +
              '</div>' +
              '<div class="field" style="margin-bottom:0">' +
                '<label class="form-label" for="f-kel-hub">Hubungan Keluarga</label>' +
                '<select class="select" id="f-kel-hub">' +
                  CONFIG.HUBUNGAN_KELUARGA.map(h => '<option' +
                    (p && p.hubunganKeluarga === h ? ' selected' : '') + '>' + UI.esc(h) + '</option>').join('') +
                '</select>' +
              '</div>' +
              '<div class="field" style="margin-bottom:0">' +
                '<label class="form-label" for="f-kel-hp">No. HP Pendamping (WA)</label>' +
                '<input class="input mono" id="f-kel-hp" inputmode="tel" value="' + v('noHpKeluarga') + '">' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* ---------- C. Klasifikasi ---------- */
        '<div class="card card-pad">' +
          '<div class="row-between wrap" style="margin-bottom:20px">' +
            '<div><h3 class="section-title"><span class="sec-mark" style="background:var(--accent-soft);color:var(--info)">C</span>' +
              'Klasifikasi Klinis PTM &amp; Klaster Layanan</h3>' +
            '<p class="card-sub">Penentuan protokol skrining berkala dan pembagian klaster intervensi</p></div>' +
            '<span class="badge badge-warning" id="f-kategori">' + UI.ikon('peringatan') + 'Pilih kategori</span>' +
          '</div>' +

          '<div class="field">' +
            '<label class="form-label">Jenis PTM Pasien<span class="req">*</span></label>' +
            '<div class="choice-grid" id="f-ptm-grid">' +
              CONFIG.JENIS_PTM.map(j =>
                '<label class="choice' + (p && p.jenisPtm === j.nilai ? ' is-selected' : '') + '" data-ptm="' + UI.esc(j.nilai) + '">' +
                  '<input type="radio" name="f-ptm" value="' + UI.esc(j.nilai) + '"' +
                    (p && p.jenisPtm === j.nilai ? ' checked' : '') + '>' +
                  '<div class="row-between">' +
                    '<span class="choice-title">' + UI.esc(j.judul) + '</span>' +
                    (j.prioritas ? '<span class="badge badge-warning">Prioritas</span>' : '') +
                  '</div>' +
                  '<span class="choice-desc">' + UI.esc(j.desc) + '</span>' +
                '</label>').join('') +
            '</div>' +
          '</div>' +

          '<div class="split-even" style="gap:0 16px">' +
            '<div class="field">' +
              '<label class="form-label" for="f-klaster">Klaster Layanan / Faskes Binaan<span class="req">*</span></label>' +
              '<input class="input" id="f-klaster" placeholder="Posbindu Melati RW 04" value="' + v('klaster', API.user.klaster) + '">' +
            '</div>' +
            '<div class="field">' +
              '<label class="form-label" for="f-dokter">Dokter Penanggung Jawab Medis</label>' +
              '<input class="input" id="f-dokter" value="' + v('dokterPj', API.user.nama) + '">' +
            '</div>' +
            '<div class="field">' +
              '<label class="form-label" for="f-kader">Kader Pendamping Lapangan</label>' +
              '<input class="input" id="f-kader" value="' + v('kader') + '">' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* ---------- D. Rekam medis ---------- */
        '<div class="card card-pad">' +
          '<div class="row-between wrap" style="margin-bottom:20px">' +
            '<div><h3 class="section-title"><span class="sec-mark" style="background:var(--primary-soft)">D</span>' +
              'Riwayat Medis &amp; Rekam Terapi Kronis</h3>' +
            '<p class="card-sub">Pencatatan klinis berkala untuk pembaruan sheet Riwayat_Medis</p></div>' +
          '</div>' +

          '<div class="strong small" style="margin-bottom:12px">Hasil Pengukuran Terakhir (pemeriksaan hari ini)</div>' +
          '<div class="split-even" style="gap:0 16px">' +
            '<div class="field">' +
              '<label class="form-label" for="f-sis">Tekanan Darah Sistolik <span class="muted">(mmHg)</span></label>' +
              '<input class="input mono" id="f-sis" type="number" min="60" max="260" placeholder="140" value="' + UI.esc(klinis.sistolik || '') + '">' +
            '</div>' +
            '<div class="field">' +
              '<label class="form-label" for="f-dia">Tekanan Darah Diastolik <span class="muted">(mmHg)</span></label>' +
              '<input class="input mono" id="f-dia" type="number" min="40" max="160" placeholder="90" value="' + UI.esc(klinis.diastolik || '') + '">' +
            '</div>' +
            '<div class="field">' +
              '<label class="form-label" for="f-gdp">Gula Darah Puasa <span class="muted">(mg/dL)</span></label>' +
              '<input class="input mono" id="f-gdp" type="number" min="40" max="600" placeholder="126" value="' + UI.esc(klinis.gdp || '') + '">' +
            '</div>' +
            '<div class="field">' +
              '<label class="form-label" for="f-hba">HbA1c <span class="muted">(%)</span></label>' +
              '<input class="input mono" id="f-hba" type="number" step="0.1" min="3" max="20" placeholder="7.2" value="' + UI.esc(klinis.hba1c || '') + '">' +
            '</div>' +
          '</div>' +
          '<div id="f-klasifikasi" class="row wrap" style="gap:10px;margin:-4px 0 20px"></div>' +

          '<div class="field">' +
            '<label class="form-label" for="f-obat">Riwayat Obat Rutin / Terapi Farmakologi</label>' +
            '<textarea class="textarea" id="f-obat" rows="3" ' +
              'placeholder="Contoh: Amlodipine 10 mg (1x1 pagi), Metformin 500 mg (2x1), Candesartan 8 mg (1x1 malam)">' +
              UI.esc(klinis.riwayatObat || '') + '</textarea>' +
            '<div class="field-hint">Pisahkan tiap obat dengan koma agar tampil sebagai kartu terpisah di rekam medis.</div>' +
          '</div>' +

          '<div class="field">' +
            '<label class="form-label" for="f-catatan">Catatan Khusus Dokter &amp; Riwayat Alergi Obat</label>' +
            '<textarea class="textarea" id="f-catatan" rows="3" ' +
              'placeholder="Contoh: alergi antibiotik penisilin (urtikaria ringan); diet rendah garam &lt; 2000 mg/hari; kontrol funduskopi tiap 6 bulan.">' +
              v('catatan') + '</textarea>' +
          '</div>' +
        '</div>' +

        /* ---------- E. Penjadwalan ---------- */
        '<div class="card card-pad">' +
          '<div class="row-between wrap" style="margin-bottom:20px">' +
            '<div><h3 class="section-title"><span class="sec-mark" style="background:var(--accent-soft);color:var(--info)">E</span>' +
              'Penjadwalan Kontrol &amp; Otomatisasi Reminder</h3>' +
            '<p class="card-sub">Sistem otomatis menjadwalkan trigger WhatsApp dan email ke sheet Log_Reminder</p></div>' +
            '<span class="badge badge-success">' + UI.ikon('segar') + 'Cron Job Terpadu</span>' +
          '</div>' +

          '<div class="split-even" style="gap:0 16px">' +
            '<div class="field">' +
              '<label class="form-label" for="f-tgl">Tanggal Rencana Kontrol Berikutnya<span class="req">*</span></label>' +
              '<input class="input" id="f-tgl" type="date" value="' + UI.esc((p && p.tanggal) || '') + '">' +
              '<div class="field-hint">Jadwal berkala umumnya 30 hari sekali untuk pasien prolanis.</div>' +
            '</div>' +
            '<div class="field">' +
              '<label class="form-label" for="f-jam">Jam Pelayanan Poli / Posbindu<span class="req">*</span></label>' +
              '<input class="input mono" id="f-jam" type="time" value="' + UI.esc((p && p.jam) || '08:30') + '">' +
              '<div class="field-hint">Waktu Indonesia Barat (WIB).</div>' +
            '</div>' +
          '</div>' +

          '<div class="metric">' +
            '<div class="strong small" style="margin-bottom:6px">Kanal Notifikasi Otomatis yang Akan Diaktifkan</div>' +
            '<p class="tiny muted" style="margin-bottom:14px">Jadwal di bawah dihitung otomatis dari tanggal kontrol dan ' +
              'dieksekusi oleh trigger harian pukul 07.00 WIB.</p>' +
            '<div id="f-milestone" class="col" style="gap:10px"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ---------- Sidebar kanan ---------- */
      '<div class="stack">' +
        '<div class="card">' +
          '<div class="card-head"><div><h4 style="margin:0">' + UI.ikon('berkas') + ' Dokumen &amp; Foto Pasien</h4>' +
          '<p class="card-sub">Tersimpan otomatis ke folder Drive per ID pasien</p></div></div>' +
          '<div class="card-body">' +

            '<div class="field">' +
              '<div class="row-between" style="margin-bottom:8px">' +
                '<label class="form-label" for="f-foto">Foto Wajah Pasien<span class="req">*</span></label>' +
                '<span class="badge badge-warning">Wajib</span>' +
              '</div>' +
              '<div class="photo-frame" id="f-foto-frame">' +
                (p && p.foto
                  ? '<img src="' + UI.esc(p.foto) + '" alt="Foto pasien">'
                  : '<div class="col center" style="gap:8px;color:var(--ink-3)">' + UI.ikon('gambar') +
                    '<span class="tiny">Belum ada foto</span></div>') +
              '</div>' +
              '<label class="upload" id="f-foto-box" style="margin-top:10px">' +
                '<span class="u-ic">' + UI.ikon('unggah') + '</span>' +
                '<span class="grow"><span class="u-name" id="f-foto-nama">Pilih / Ganti Foto</span>' +
                '<span class="u-meta">JPG atau PNG, maks. ' + CONFIG.MAKS_UNGGAH_MB + ' MB</span></span>' +
                '<input type="file" id="f-foto" accept="image/jpeg,image/png,image/webp">' +
              '</label>' +
            '</div>' +

            '<div class="field">' +
              '<label class="form-label" for="f-lab">Hasil Laboratorium Terakhir (PDF)</label>' +
              '<label class="upload" id="f-lab-box">' +
                '<span class="u-ic">' + UI.ikon('berkas') + '</span>' +
                '<span class="grow"><span class="u-name" id="f-lab-nama">Unggah Hasil Lab</span>' +
                '<span class="u-meta">PDF atau gambar, maks. ' + CONFIG.MAKS_UNGGAH_MB + ' MB</span></span>' +
                '<input type="file" id="f-lab" accept="application/pdf,image/*">' +
              '</label>' +
            '</div>' +

            '<div class="field" style="margin-bottom:0">' +
              '<label class="form-label" for="f-resep">Foto Lembar Resep Dokter</label>' +
              '<label class="upload" id="f-resep-box">' +
                '<span class="u-ic">' + UI.ikon('gambar') + '</span>' +
                '<span class="grow"><span class="u-name" id="f-resep-nama">Unggah Foto Resep</span>' +
                '<span class="u-meta">JPG atau PNG, maks. ' + CONFIG.MAKS_UNGGAH_MB + ' MB</span></span>' +
                '<input type="file" id="f-resep" accept="image/*">' +
              '</label>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head">' +
            '<div><h4 style="margin:0">Validasi Kelengkapan</h4></div>' +
            '<span class="badge badge-neutral" id="f-persen">0% Siap</span>' +
          '</div>' +
          '<div class="card-body">' +
            '<div class="kpi-bar" style="margin-bottom:18px"><span id="f-progres" style="width:0%;background:var(--success)"></span></div>' +
            '<div class="checklist" id="f-checklist"></div>' +
          '</div>' +
          '<div class="card-foot">' +
            '<button class="btn btn-deep btn-block" id="fm-simpan2">' + UI.ikon('cekLingkar') +
              (this._id ? 'Simpan Perubahan' : 'Simpan Pasien Baru') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  },

  pasang() {
    const app = document.getElementById('app');

    /* ---- Kartu pilihan jenis PTM ---- */
    app.querySelectorAll('[data-ptm]').forEach(el => {
      el.addEventListener('click', () => {
        app.querySelectorAll('[data-ptm]').forEach(x => x.classList.remove('is-selected'));
        el.classList.add('is-selected');
        el.querySelector('input').checked = true;

        const komorbid = el.dataset.ptm === 'Hipertensi & DM';
        const bdg = document.getElementById('f-kategori');
        bdg.className = 'badge ' + (komorbid ? 'badge-warning' : 'badge-info');
        bdg.innerHTML = UI.ikon(komorbid ? 'peringatan' : 'cek') +
          (komorbid ? 'Kategori Komorbid — Prioritas Tinggi' : 'Kategori ' + el.dataset.ptm);
        this._hitungValidasi();
      });
    });

    /* ---- Usia otomatis ---- */
    const hitungUsia = () => {
      const t = Form.nilai('f-lahir');
      const hint = document.getElementById('f-usia');
      if (!t) { hint.textContent = 'Usia dihitung otomatis dari tanggal lahir.'; return; }
      const lahir = new Date(t);
      let u = new Date().getFullYear() - lahir.getFullYear();
      const m = new Date().getMonth() - lahir.getMonth();
      if (m < 0 || (m === 0 && new Date().getDate() < lahir.getDate())) u--;
      hint.innerHTML = '<span class="badge badge-' + (u >= 60 ? 'warning' : 'info') + '">' +
        u + ' tahun' + (u >= 60 ? ' — Lansia Binaan' : '') + '</span>';
    };
    document.getElementById('f-lahir').addEventListener('change', () => { hitungUsia(); this._hitungValidasi(); });
    hitungUsia();

    /* ---- Klasifikasi klinis langsung ---- */
    const klasifikasi = () => {
      const sis = Form.nilai('f-sis'), dia = Form.nilai('f-dia'), gdp = Form.nilai('f-gdp');
      const host = document.getElementById('f-klasifikasi');
      let h = '';
      if (sis && dia) {
        const t = UI.klasifikasiTensi(sis, dia);
        h += '<span class="badge ' + t.kelas + ' badge-lg">' + UI.ikon('denyut') + 'Tensi: ' + UI.esc(t.label) + '</span>';
      }
      if (gdp) {
        const g = UI.klasifikasiGdp(gdp);
        h += '<span class="badge ' + g.kelas + ' badge-lg">' + UI.ikon('tetes') + 'GDP: ' + UI.esc(g.label) + '</span>';
      }
      const perluRujuk = (Number(sis) >= 160 || Number(dia) >= 100 || Number(gdp) >= 250);
      if (perluRujuk) {
        h += '<span class="badge badge-danger badge-lg">' + UI.ikon('peringatan') +
             'Wajib rujuk dokter faskes dalam 1×24 jam</span>';
      }
      host.innerHTML = h;
    };
    ['f-sis', 'f-dia', 'f-gdp', 'f-hba'].forEach(id =>
      document.getElementById(id).addEventListener('input', () => { klasifikasi(); this._hitungValidasi(); }));
    klasifikasi();

    /* ---- Pratinjau jadwal reminder ---- */
    const milestone = () => {
      const tgl = Form.nilai('f-tgl');
      const jam = Form.nilai('f-jam');
      const host = document.getElementById('f-milestone');
      if (!tgl) {
        host.innerHTML = '<p class="tiny muted" style="margin:0">Pilih tanggal kontrol untuk melihat jadwal pengingat.</p>';
        return;
      }
      const dasar = new Date(tgl + 'T00:00:00');
      const geser = (n) => {
        const d = new Date(dasar); d.setDate(d.getDate() - n);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      };
      const baris = [
        ['H-3', geser(3), '08:00', 'WhatsApp + Email', 'Pemberitahuan awal jadwal kontrol berkala.'],
        ['H-1', geser(1), '09:00', 'WhatsApp + Email', 'Konfirmasi kesiapan dan instruksi puasa laboratorium.'],
        ['H-0', geser(0), '06:30', 'WhatsApp', 'Pengingat pagi hari-H: berkas, antrean, dan jam ' + (jam || '08:30') + ' WIB.']
      ];
      host.innerHTML = baris.map(b =>
        '<div class="row" style="align-items:flex-start;gap:12px">' +
          '<span class="badge badge-info" style="flex:none;min-width:46px;justify-content:center">' + b[0] + '</span>' +
          '<div class="grow"><div class="small strong">' + UI.tanggal(b[1], 'pendek') + ' · ' + b[2] + ' WIB ' +
            '<span class="tiny muted">(' + b[3] + ')</span></div>' +
          '<div class="tiny muted">' + UI.esc(b[4]) + '</div></div>' +
        '</div>').join('');
    };
    document.getElementById('f-tgl').addEventListener('change', () => { milestone(); this._hitungValidasi(); });
    document.getElementById('f-jam').addEventListener('change', milestone);
    milestone();

    /* ---- Unggah berkas ---- */
    const pasangUnggah = (idInput, idNama, idBox, kunci, previewFrame) => {
      document.getElementById(idInput).addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const b = await API.bacaBerkas(file);
          this._berkas[kunci] = b;
          document.getElementById(idNama).textContent = file.name + ' · ' + UI.formatUkuran(file.size);
          document.getElementById(idBox).classList.add('has-file');
          if (previewFrame && b.mime.indexOf('image/') === 0) {
            document.getElementById(previewFrame).innerHTML =
              '<img src="' + b.dataUrl + '" alt="Pratinjau foto pasien">';
          }
          this._hitungValidasi();
        } catch (err) {
          this._berkas[kunci] = null;
          UI.toast(err.message, 'error');
        }
      });
    };
    pasangUnggah('f-foto', 'f-foto-nama', 'f-foto-box', 'foto', 'f-foto-frame');
    pasangUnggah('f-lab', 'f-lab-nama', 'f-lab-box', 'lab');
    pasangUnggah('f-resep', 'f-resep-nama', 'f-resep-box', 'resep');

    /* ---- Validasi berjalan ---- */
    ['f-nama', 'f-nik', 'f-hp', 'f-alamat', 'f-klaster'].forEach(id =>
      document.getElementById(id).addEventListener('input', () => this._hitungValidasi()));
    this._hitungValidasi();

    /* ---- Simpan ---- */
    const simpan = () => this._simpan();
    document.getElementById('fm-simpan').addEventListener('click', simpan);
    document.getElementById('fm-simpan2').addEventListener('click', simpan);
  },

  _hitungValidasi() {
    const nik = Form.nilai('f-nik');
    const adaFoto = !!this._berkas.foto || !!(this._p && this._p.foto);
    const ptmDipilih = !!document.querySelector('[name="f-ptm"]:checked');

    const cek = [
      { ok: /^\d{16}$/.test(nik), teks: 'NIK 16 digit terverifikasi sistem' },
      { ok: !!Form.nilai('f-nama'), teks: 'Nama lengkap pasien terisi' },
      { ok: !!Form.nilai('f-hp'), teks: 'Nomor WhatsApp aktif untuk reminder' },
      { ok: adaFoto, teks: 'Foto profil pasien terunggah ke Drive' },
      { ok: ptmDipilih, teks: 'Klasifikasi PTM teridentifikasi' },
      { ok: !!Form.nilai('f-klaster'), teks: 'Klaster layanan binaan ditentukan' },
      { ok: !!Form.nilai('f-tgl'), teks: 'Jadwal kontrol & cron reminder disusun' }
    ];

    const lolos = cek.filter(c => c.ok).length;
    const persen = Math.round((lolos / cek.length) * 100);

    document.getElementById('f-checklist').innerHTML = cek.map(c =>
      '<div class="ci' + (c.ok ? '' : ' is-pending') + '">' +
        UI.ikon(c.ok ? 'cekLingkar' : 'jam') + '<span>' + UI.esc(c.teks) + '</span></div>').join('');

    document.getElementById('f-progres').style.width = persen + '%';
    const bdg = document.getElementById('f-persen');
    bdg.textContent = persen + '% Siap';
    bdg.className = 'badge ' + (persen === 100 ? 'badge-success' : persen >= 60 ? 'badge-warning' : 'badge-neutral');
  },

  async _simpan() {
    const ptm = document.querySelector('[name="f-ptm"]:checked');
    const jk = document.querySelector('[name="f-jk"]:checked');

    const d = {
      id: this._id,
      nama: Form.nilai('f-nama'),
      nik: Form.nilai('f-nik'),
      jenisKelamin: jk ? jk.value : 'Laki-laki',
      tanggalLahir: Form.nilai('f-lahir'),
      alamat: Form.nilai('f-alamat'),
      noHp: Form.nilai('f-hp'),
      email: Form.nilai('f-email'),
      namaKeluarga: Form.nilai('f-kel-nama'),
      hubunganKeluarga: Form.nilai('f-kel-hub'),
      noHpKeluarga: Form.nilai('f-kel-hp'),
      noBpjs: Form.nilai('f-bpjs'),
      jenisPtm: ptm ? ptm.value : '',
      klaster: Form.nilai('f-klaster'),
      dokterPj: Form.nilai('f-dokter'),
      kader: Form.nilai('f-kader'),
      tanggalKunjungan: Form.nilai('f-tgl'),
      jamKunjungan: Form.nilai('f-jam'),
      catatan: Form.nilai('f-catatan'),
      sistolik: Form.nilai('f-sis'),
      diastolik: Form.nilai('f-dia'),
      gdp: Form.nilai('f-gdp'),
      hba1c: Form.nilai('f-hba'),
      riwayatObat: Form.nilai('f-obat')
    };

    /* Validasi sisi klien — mencerminkan aturan backend agar pesan cepat muncul. */
    if (!d.nama) return Form.salah('f-nama', 'Nama lengkap pasien wajib diisi.');
    if (!/^\d{16}$/.test(d.nik)) return Form.salah('f-nik', 'NIK wajib tepat 16 digit angka.');
    if (!d.noHp) return Form.salah('f-hp', 'No. HP/WhatsApp wajib diisi — dipakai untuk reminder.');
    if (!d.jenisPtm) { UI.toast('Pilih salah satu klasifikasi jenis PTM terlebih dahulu.', 'error'); return; }
    if (!d.klaster) return Form.salah('f-klaster', 'Klaster layanan wajib diisi.');
    if (!d.tanggalKunjungan) return Form.salah('f-tgl', 'Tanggal rencana kontrol berikutnya wajib diisi.');
    if (!this._berkas.foto && !(this._p && this._p.foto)) {
      UI.toast('Foto pasien wajib diunggah sebelum data dapat disimpan (PRD Seksi 5.7).', 'error');
      return;
    }

    if (this._berkas.foto)  { d.fotoBase64 = this._berkas.foto.base64;  d.fotoMime = this._berkas.foto.mime; }
    if (this._berkas.lab)   { d.hasilLabBase64 = this._berkas.lab.base64; d.hasilLabMime = this._berkas.lab.mime; }
    if (this._berkas.resep) { d.resepBase64 = this._berkas.resep.base64; d.resepMime = this._berkas.resep.mime; }
    if (this._p && this._p.foto && !this._berkas.foto) d.fotoUrl = this._p.foto;

    const res = await API.kirim('savePasien', d);
    if (res.success) {
      location.hash = '#/pasien/' + (res.data && res.data.id ? res.data.id : '');
    }
  }
};
