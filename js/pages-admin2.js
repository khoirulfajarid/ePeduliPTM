/* ==========================================================================
   PEDULI PTM — pages-admin2.js  (bagian 3)
   Rekam Medis Terpadu, Jadwal & Reminder, Pengumuman, Laporan,
   Verifikasi Akun Staff, Pengaturan Sistem, dan utilitas ekspor.
   ========================================================================== */

/* ==========================================================================
   UTILITAS EKSPOR — CSV diunduh langsung di peramban, tanpa pustaka luar
   ========================================================================== */
const Ekspor = {
  csv(namaBerkas, baris) {
    if (!baris || !baris.length) { UI.toast('Tidak ada data untuk diekspor.', 'error'); return; }

    const kolom = Object.keys(baris[0]);
    const sel = (v) => {
      const s = String(v === null || v === undefined ? '' : v);
      return /[",\n;]/.test(s) ? '"' + s.split('"').join('""') + '"' : s;
    };
    // Pemisah titik koma + BOM agar Excel berbahasa Indonesia membuka kolomnya rapi.
    const isi = '﻿' + [kolom.join(';')]
      .concat(baris.map(r => kolom.map(k => sel(r[k])).join(';')))
      .join('\r\n');

    const blob = new Blob([isi], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = namaBerkas + '.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    UI.toast('Berkas ' + namaBerkas + '.csv berhasil diunduh.', 'success');
  }
};

/* ==========================================================================
   HALAMAN 7 — REKAM MEDIS TERPADU (DETAIL PASIEN)
   ========================================================================== */
PAGES.pasienDetail = {
  judul: 'Rekam Medis Terpadu',
  shell: 'app',
  perluSesi: 'Petugas',
  _tab: 'jadwal',

  async muat(params) {
    const d = await API.ambil('getPasien', { id: params.id });
    if (!d) return UI.kosong('Rekam medis tidak ditemukan',
      'Data pasien mungkin telah dihapus atau berada di luar klaster penugasan Anda.', 'peringatan');
    this._d = d;
    const p = d.profil;
    const k = d.klinisTerkini;
    const tensi = UI.klasifikasiTensi(k.sistolik, k.diastolik);
    const gula = UI.klasifikasiGdp(k.gdp);

    return '' +
    /* ---------- Bar navigasi rekam medis ---------- */
    '<section class="row-between wrap" style="gap:16px">' +
      '<div class="row wrap" style="gap:12px">' +
        '<button class="btn btn-ghost btn-sm btn-inline" data-ke="#/pasien">' + UI.ikon('panahKiri') + 'Kembali ke Data Pasien</button>' +
        '<span class="row small muted" style="gap:8px">' + UI.ikon('berkas') + 'Rekam Medis Terpadu' +
          '<span class="badge badge-info mono">' + UI.esc(p.id) + '</span></span>' +
      '</div>' +
      '<div class="row wrap row-actions" style="gap:10px">' +
        '<button class="btn btn-ghost btn-sm btn-inline" id="rm-sunting">' + UI.ikon('pena') + 'Sunting Data</button>' +
        '<button class="btn btn-ghost btn-sm btn-inline" id="rm-cetak">' + UI.ikon('cetak') + 'Cetak Resume</button>' +
      '</div>' +
    '</section>' +

    /* Grid 348px | 1fr. Properti `order` menaruh kartu profil di kolom sempit
       (kiri) dan panel tab di kolom lebar (kanan), tanpa mengubah urutan DOM
       yang sudah ramah pembaca layar. */
    '<section class="split-rev">' +
      /* ================= Panel tab (kolom lebar) ================= */
      '<div class="stack" style="order:2">' +

        /* ---------- Tab ---------- */
        '<div class="card">' +
          '<div class="card-head" style="padding-bottom:0;border:none">' +
            '<div class="row wrap" style="gap:6px" id="rm-tabs">' +
              this._tombolTab('jadwal', 'jadwal', 'Jadwal & Kepatuhan') +
              this._tombolTab('obat', 'pil', 'Riwayat Obat') +
              this._tombolTab('lab', 'berkas', 'Hasil Lab & Dokumen') +
              this._tombolTab('progres', 'grafik', 'Progres Medis') +
            '</div>' +
          '</div>' +
          '<div class="card-body" id="rm-isi">' + this._isiTab(d) + '</div>' +
        '</div>' +
      '</div>' +

      /* ================= Sidebar profil ================= */
      '<div class="stack" style="order:1">' +
        '<div class="card card-pad">' +
          '<div class="row-between" style="margin-bottom:16px">' +
            '<span class="badge badge-success">' + UI.ikon('cekLingkar') + 'Aktif Kontrol Rutin</span>' +
          '</div>' +
          '<div class="row" style="gap:14px;margin-bottom:18px">' +
            UI.avatar(p.nama, p.foto, 'avatar-xl') +
            '<div class="grow" style="min-width:0">' +
              '<h3 style="margin-bottom:4px;line-height:1.3">' + UI.esc(p.nama) + '</h3>' +
              '<div class="small muted">' + UI.esc(p.usia || '-') + ' Tahun · ' + UI.esc(p.jenisKelamin || '-') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="row wrap" style="gap:8px;margin-bottom:20px">' + UI.badgePtm(p.jenisPtm) + '</div>' +

          '<div class="col" style="gap:14px;padding-top:18px;border-top:1px solid var(--border)">' +
            UI.fakta('NIK', p.nik, { mono: true }) +
            UI.fakta('No. BPJS Kesehatan', p.noBpjs || '-', { mono: true }) +
            UI.fakta('Faskes / Klaster', p.klaster) +
            UI.fakta('Dokter Penanggung Jawab', d.dokterPj || '-') +
          '</div>' +

          '<div class="label-kicker" style="margin:22px 0 12px">Kontak &amp; Domisili</div>' +
          '<div class="col" style="gap:12px">' +
            this._kontak('pesan', 'WhatsApp Pribadi', p.noHp) +
            this._kontak('surel', 'Alamat Surel', p.email || '-') +
            this._kontak('orang', 'Kontak Darurat (' + UI.esc(p.hubunganKeluarga || '-') + ')',
              (p.namaKeluarga || '-') + ' · ' + (p.noHpKeluarga || '-')) +
            this._kontak('lokasi', 'Alamat Tinggal', d.alamat || '-') +
          '</div>' +
        '</div>' +

        /* ---------- Hasil klinis ---------- */
        '<div class="card">' +
          '<div class="card-head">' +
            '<div><h4 style="margin:0">' + UI.ikon('denyut') + ' Hasil Klinis Terkini</h4></div>' +
            '<span class="tiny muted">' + (k.tanggal ? UI.tanggal(k.tanggal, 'pendek') : 'Belum ada') + '</span>' +
          '</div>' +
          '<div class="card-body">' +
            '<div class="col" style="gap:12px">' +
              this._metrik('Tekanan Darah', (k.sistolik || '-') + '/' + (k.diastolik || '-'), 'mmHg', tensi,
                Math.min(100, (Number(k.sistolik) / 180) * 100)) +
              this._metrik('Gula Darah Puasa (GDP)', k.gdp || '-', 'mg/dL', gula,
                Math.min(100, (Number(k.gdp) / 250) * 100)) +
              this._metrik('HbA1c Rata-rata', k.hba1c || '-', '%',
                { label: 'Target < 7,0%', kelas: Number(k.hba1c) && Number(k.hba1c) < 7 ? 'badge-success' : 'badge-warning',
                  warna: Number(k.hba1c) && Number(k.hba1c) < 7 ? 'var(--success)' : 'var(--warning)' },
                Math.min(100, (Number(k.hba1c) / 12) * 100)) +
            '</div>' +

            (d.trenTekananDarah && d.trenTekananDarah.length > 1
              ? '<div class="metric" style="margin-top:14px">' +
                  '<div class="row-between" style="margin-bottom:8px">' +
                    '<span class="metric-name">Tren Sistolik (' + d.trenTekananDarah.length + ' pemeriksaan)</span>' +
                    '<span class="tiny muted">Rata-rata ' +
                      Math.round(d.trenTekananDarah.reduce((s, x) => s + x.sistolik, 0) / d.trenTekananDarah.length) +
                    '</span>' +
                  '</div>' +
                  UI.chartSparkline(d.trenTekananDarah.map(x => x.sistolik), { satuan: 'mmHg', label: 'Tren tekanan darah sistolik' }) +
                '</div>'
              : '') +
          '</div>' +
        '</div>' +

        /* ---------- Tindakan cepat ---------- */
        '<div class="card card-pad">' +
          '<h4 style="margin-bottom:6px">' + UI.ikon('denyut') + ' Tindakan Cepat Staf</h4>' +
          '<p class="tiny muted" style="margin-bottom:14px">Kirim pengingat manual di luar jadwal otomatis</p>' +
          '<div class="row" style="gap:10px;margin-bottom:18px">' +
            '<button class="btn btn-accent grow" id="rm-wa">' + UI.ikon('pesan') + 'WhatsApp</button>' +
            '<button class="btn btn-ghost grow" id="rm-email">' + UI.ikon('surel') + 'Email</button>' +
          '</div>' +
          '<div class="label-kicker" style="margin-bottom:8px">Update Status Kunjungan Terkini</div>' +
          '<div class="row" style="gap:10px">' +
            '<select class="select grow" id="rm-status">' +
              CONFIG.STATUS_KUNJUNGAN.map(s => '<option value="' + UI.esc(s) + '"' +
                (p.statusKunjungan === s ? ' selected' : '') + '>' + UI.esc(s) + '</option>').join('') +
            '</select>' +
            '<button class="btn btn-primary btn-inline" id="rm-simpan-status">Simpan</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  },

  _tombolTab(id, ikon, teks) {
    return '<button class="btn ' + (this._tab === id ? 'btn-primary' : 'btn-ghost') +
      ' btn-sm btn-inline" data-tab="' + id + '">' + UI.ikon(ikon) + UI.esc(teks) + '</button>';
  },

  _kontak(ikon, label, nilai) {
    return '<div class="row" style="align-items:flex-start;gap:10px">' +
      '<span class="kpi-icon" style="width:30px;height:30px;flex:none">' + UI.ikon(ikon) + '</span>' +
      '<div style="min-width:0"><div class="tiny muted">' + label + '</div>' +
      '<div class="small strong" style="word-break:break-word">' + UI.esc(nilai) + '</div></div>' +
    '</div>';
  },

  _metrik(nama, nilai, unit, klas, persen) {
    return '<div class="metric">' +
      '<div class="metric-head"><span class="metric-name">' + UI.esc(nama) + '</span>' +
        '<span class="badge ' + klas.kelas + '">' + UI.esc(klas.label) + '</span></div>' +
      '<div class="metric-value">' + UI.esc(nilai) + '<span class="unit">' + UI.esc(unit) + '</span></div>' +
      '<div class="metric-bar"><span style="width:' + Math.max(4, Math.min(100, persen || 0)) +
        '%;background:' + klas.warna + '"></span></div>' +
    '</div>';
  },

  /* ---------------------- Isi tab ---------------------- */
  _isiTab(d) {
    if (this._tab === 'obat')    return this._tabObat(d);
    if (this._tab === 'lab')     return this._tabLab(d);
    if (this._tab === 'progres') return this._tabProgres(d);
    return this._tabJadwal(d);
  },

  _tabJadwal(d) {
    const p = d.profil;
    const kp = d.kepatuhan;

    return '' +
      /* ---------- Jadwal terdekat ---------- */
      '<div class="card card-pad" style="background:var(--primary-soft);border-color:var(--primary);box-shadow:none">' +
        '<div class="row-between wrap" style="gap:16px;margin-bottom:16px">' +
          '<div class="row" style="gap:14px">' +
            '<div class="kpi-icon" style="width:46px;height:46px;background:var(--primary);color:#fff">' + UI.ikon('kalender') + '</div>' +
            '<div>' +
              '<div class="label-kicker">Jadwal Kontrol Terdekat</div>' +
              '<div style="font-size:18px;font-weight:700;margin:4px 0 2px">' + UI.tanggal(p.tanggal, 'panjang') + '</div>' +
              '<div class="small muted">Pukul ' + UI.esc(p.jam) + ' WIB · ' + UI.esc(p.klaster) + ' · ' + UI.esc(d.dokterPj || '-') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="row" style="gap:8px">' +
            '<button class="btn btn-ghost btn-sm btn-inline" id="rm-ubah-tgl">' + UI.ikon('kalender') + 'Ubah Tanggal</button>' +
            '<button class="btn btn-deep btn-sm btn-inline" id="rm-etiket">' + UI.ikon('tiket') + 'E-Tiket Siap</button>' +
          '</div>' +
        '</div>' +

        '<div class="card card-pad" style="box-shadow:none">' +
          '<div class="row-between wrap" style="margin-bottom:14px">' +
            '<span class="strong small">Pelacakan Multi-Kanal Notifikasi Otomatis</span>' +
            '<span class="badge badge-success">' + UI.ikon('cek') +
              (d.logReminder.filter(l => l.status === 'Sukses').length) + ' notifikasi terkirim</span>' +
          '</div>' +
          (d.logReminder.length
            ? '<div class="row wrap" style="gap:10px">' +
                d.logReminder.slice(0, 3).map(l =>
                  '<div class="metric grow" style="min-width:180px">' +
                    '<div class="row" style="gap:8px;margin-bottom:4px">' +
                      '<span style="color:var(--' + (l.status === 'Sukses' ? 'success' : 'danger') + ')">' +
                        UI.ikon(l.status === 'Sukses' ? 'cekLingkar' : 'silang') + '</span>' +
                      '<span class="small strong">Terkirim ' + UI.esc(l.jenis) + '</span></div>' +
                    '<div class="tiny muted">' + UI.esc(l.channel) + ' · ' + UI.tanggal(l.waktu, 'waktu') + '</div>' +
                    '<div class="tiny muted">' + UI.esc(l.keterangan || '') + '</div>' +
                  '</div>').join('') +
              '</div>'
            : '<p class="small muted" style="margin:0">Belum ada pengingat terkirim untuk jadwal ini.</p>') +
        '</div>' +
      '</div>' +

      /* ---------- Tingkat kepatuhan ---------- */
      '<div class="card card-pad" style="margin-top:20px">' +
        '<div class="row wrap" style="gap:24px;align-items:center">' +
          UI.chartCincin(kp.persen) +
          '<div class="grow" style="min-width:200px">' +
            '<div class="label-kicker">Tingkat Kepatuhan Pasien (12 Bulan)</div>' +
            '<h3 style="margin:6px 0 8px">' + (kp.persen >= 90 ? 'Sangat Disiplin & Kooperatif'
              : kp.persen >= 75 ? 'Cukup Disiplin' : 'Perlu Pendampingan Intensif') + '</h3>' +
            '<p class="small muted" style="margin:0">Pasien menghadiri <b>' + kp.tepatWaktu + ' sesi</b> kontrol tepat waktu ' +
              'dari total <b>' + kp.totalSesi + ' jadwal</b> yang telah diagendakan.</p>' +
          '</div>' +
          '<div class="row" style="gap:10px">' +
            '<div class="metric center" style="min-width:96px">' +
              '<div class="metric-value" style="justify-content:center;color:var(--success)">' + kp.tepatWaktu + '</div>' +
              '<div class="tiny muted">Tepat Waktu</div></div>' +
            '<div class="metric center" style="min-width:96px">' +
              '<div class="metric-value" style="justify-content:center;color:var(--danger)">' + kp.tidakHadir + '</div>' +
              '<div class="tiny muted">Terlewat</div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ---------- Linimasa ---------- */
      '<div class="card card-pad" style="margin-top:20px">' +
        '<div class="row-between wrap" style="margin-bottom:18px">' +
          '<h4 style="margin:0">' + UI.ikon('jam') + ' Linimasa Riwayat Kunjungan PTM</h4>' +
          '<span class="tiny muted">Menampilkan ' + Math.min(6, kp.riwayat.length) + ' sesi terakhir</span>' +
        '</div>' +
        (kp.riwayat.length
          ? '<div class="timeline">' + kp.riwayat.slice(0, 6).map(r => {
              const miss = r.status !== 'Hadir';
              return '<div class="tl-item ' + (miss ? 'is-miss' : '') + '">' +
                '<div class="tl-card ' + (miss ? 'is-miss' : '') + '">' +
                  '<div class="tl-head">' +
                    '<span class="tl-date">' + UI.tanggal(r.tanggalJadwal, 'pendek') + '</span>' +
                    (miss ? '<span class="badge badge-danger">Tidak Hadir Tepat Waktu</span>'
                          : '<span class="badge badge-success">Hadir Kontrol Rutin</span>') +
                    '<span class="tiny muted" style="margin-left:auto">' + UI.esc(r.dicatatOleh || '') + '</span>' +
                  '</div>' +
                  '<div class="tl-body">' + UI.esc(r.keterangan || '-') + '</div>' +
                '</div></div>';
            }).join('') + '</div>'
          : UI.kosong('Belum ada riwayat kunjungan', 'Riwayat akan terisi setiap kali status kehadiran diperbarui petugas.', 'jam')) +
      '</div>';
  },

  _tabObat(d) {
    const obat = String(d.klinisTerkini.riwayatObat || '').split(',').map(s => s.trim()).filter(Boolean);

    return '<div class="row-between wrap" style="margin-bottom:18px">' +
        '<div><h4 style="margin:0">' + UI.ikon('pil') + ' Ringkasan Terapi Obat Kronis (E-Resep Aktif)</h4>' +
        '<p class="card-sub">Aturan minum yang sedang berjalan berdasarkan kunjungan terakhir</p></div>' +
        '<button class="btn btn-ghost btn-sm btn-inline" id="rm-tambah-obat">' + UI.ikon('plus') + 'Perbarui Terapi</button>' +
      '</div>' +
      (obat.length
        ? '<div class="split-even">' + obat.map(o => {
            const nama = o.split('(')[0].trim();
            const aturan = (o.match(/\(([^)]+)\)/) || [])[1] || 'Sesuai anjuran dokter';
            const ind = /amlodipin|candesart|captopril|bisoprolol|valsart/i.test(nama) ? 'Hipertensi'
                      : /metformin|glimepirid|insulin|acarbose/i.test(nama) ? 'Diabetes' : 'Terapi Kronis';
            return '<div class="metric">' +
              '<div class="row-between" style="margin-bottom:8px">' +
                '<span class="strong">' + UI.esc(nama) + '</span>' +
                '<span class="badge ' + (ind === 'Diabetes' ? 'badge-info' : ind === 'Hipertensi' ? 'badge-danger' : 'badge-neutral') + '">' +
                  UI.esc(ind) + '</span>' +
              '</div>' +
              '<div class="small muted" style="line-height:1.6">' + UI.ikon('jam') + ' ' + UI.esc(aturan) + '</div>' +
            '</div>';
          }).join('') + '</div>'
        : UI.kosong('Belum ada terapi tercatat', 'Tambahkan riwayat obat rutin melalui menu Sunting Data pasien.', 'pil')) +

      '<div class="callout callout-accent" style="margin-top:20px">' + UI.ikon('cekLingkar') +
        '<div>Farmasi Puskesmas memvalidasi ketersediaan stok obat setiap kali resep diperbarui. ' +
        'Pasien dapat mengambil paket 30 hari setelah konsultasi terverifikasi.</div></div>';
  },

  _tabLab(d) {
    const k = d.klinisTerkini;
    const kartu = (judul, url, ikon, ket) =>
      '<div class="metric">' +
        '<div class="row" style="gap:12px">' +
          '<div class="kpi-icon" style="flex:none">' + UI.ikon(ikon) + '</div>' +
          '<div class="grow"><div class="strong small">' + UI.esc(judul) + '</div>' +
          '<div class="tiny muted">' + UI.esc(ket) + '</div></div>' +
          (url ? '<a class="btn btn-ghost btn-xs btn-inline" href="' + UI.esc(url) + '" target="_blank" rel="noopener">' +
                 UI.ikon('mata') + 'Buka</a>'
               : '<span class="badge badge-neutral">Belum ada</span>') +
        '</div>' +
      '</div>';

    return '<div class="row-between wrap" style="margin-bottom:18px">' +
        '<div><h4 style="margin:0">' + UI.ikon('berkas') + ' Hasil Laboratorium &amp; Dokumen Penunjang</h4>' +
        '<p class="card-sub">Tersimpan di folder Drive /PEDULI_PTM/Pasien/' + UI.esc(d.profil.id) + '/</p></div>' +
        '<button class="btn btn-ghost btn-sm btn-inline" id="rm-sunting2">' + UI.ikon('unggah') + 'Unggah Dokumen Baru</button>' +
      '</div>' +
      '<div class="col" style="gap:12px">' +
        kartu('Hasil Laboratorium Terakhir', k.hasilLab, 'berkas',
          k.tanggal ? 'Pemeriksaan ' + UI.tanggal(k.tanggal, 'pendek') : 'Belum diunggah') +
        kartu('Foto Lembar Resep Dokter', k.fotoResep, 'gambar', 'Terverifikasi dokter penanggung jawab') +
        kartu('Foto Profil Pasien', d.profil.foto, 'orang', 'Dipakai untuk verifikasi identitas di loket') +
      '</div>' +

      '<div class="row wrap" style="gap:16px;margin-top:20px">' +
        '<div class="metric grow"><div class="metric-name">Berat Badan Terakhir</div>' +
          '<div class="metric-value">' + UI.esc(k.beratBadan || '-') + '<span class="unit">kg</span></div></div>' +
        '<div class="metric grow"><div class="metric-name">HbA1c</div>' +
          '<div class="metric-value">' + UI.esc(k.hba1c || '-') + '<span class="unit">%</span></div></div>' +
        '<div class="metric grow"><div class="metric-name">Total Rekam Medis</div>' +
          '<div class="metric-value">' + d.riwayatMedis.length + '<span class="unit">entri</span></div></div>' +
      '</div>';
  },

  _tabProgres(d) {
    const tren = d.trenTekananDarah || [];

    return '<div class="row-between wrap" style="margin-bottom:18px">' +
        '<div><h4 style="margin:0">' + UI.ikon('grafik') + ' Progres Medis Antar-Kunjungan</h4>' +
        '<p class="card-sub">Perbandingan hasil pengukuran dari setiap sesi kontrol</p></div>' +
      '</div>' +
      (tren.length > 1
        ? '<div class="split-even">' +
            '<div class="metric">' +
              '<div class="metric-name" style="margin-bottom:10px">Tekanan Darah Sistolik (mmHg)</div>' +
              UI.chartSparkline(tren.map(t => t.sistolik), { satuan: 'mmHg' }) +
              '<div class="row-between tiny muted" style="margin-top:8px">' +
                '<span>' + UI.tanggal(tren[0].tanggal, 'pendek') + '</span>' +
                '<span>' + UI.tanggal(tren[tren.length - 1].tanggal, 'pendek') + '</span></div>' +
            '</div>' +
            '<div class="metric">' +
              '<div class="metric-name" style="margin-bottom:10px">Gula Darah Puasa (mg/dL)</div>' +
              UI.chartSparkline(tren.map(t => t.gdp), { satuan: 'mg/dL', warna: CONFIG.WARNA_CHART[1] }) +
              '<div class="row-between tiny muted" style="margin-top:8px">' +
                '<span>' + UI.tanggal(tren[0].tanggal, 'pendek') + '</span>' +
                '<span>' + UI.tanggal(tren[tren.length - 1].tanggal, 'pendek') + '</span></div>' +
            '</div>' +
          '</div>'
        : '<p class="muted small">Dibutuhkan minimal dua kali pemeriksaan untuk menampilkan grafik progres.</p>') +

      '<div class="table-wrap" style="margin-top:20px">' +
        '<table class="data" style="min-width:620px"><thead><tr>' +
          '<th>Tanggal</th><th>Tensi</th><th>GDP</th><th>HbA1c</th><th>Berat</th><th>Catatan Progres</th><th>Dicatat Oleh</th>' +
        '</tr></thead><tbody>' +
        (d.riwayatMedis.length
          ? d.riwayatMedis.map(m =>
              '<tr><td class="mono">' + UI.tanggal(m.tanggal, 'pendek') + '</td>' +
              '<td class="mono">' + UI.esc(m.sistolik || '-') + '/' + UI.esc(m.diastolik || '-') + '</td>' +
              '<td class="mono">' + UI.esc(m.gdp || '-') + '</td>' +
              '<td class="mono">' + UI.esc(m.hba1c || '-') + '</td>' +
              '<td class="mono">' + UI.esc(m.beratBadan || '-') + '</td>' +
              '<td style="max-width:260px">' + UI.esc(m.catatan || '-') + '</td>' +
              '<td class="tiny muted">' + UI.esc(m.dicatatOleh || '-') + '</td></tr>').join('')
          : '<tr><td colspan="7" class="center muted small" style="padding:32px">Belum ada entri rekam medis.</td></tr>') +
        '</tbody></table>' +
      '</div>';
  },

  /* ---------------------- Dialog reminder manual ---------------------- */
  dialogReminder(p, kanalAwal) {
    UI.modal({
      judul: 'Kirim Pengingat Manual',
      sub: 'Kepada ' + p.nama + ' · ' + (p.noHp || '-'),
      isi:
        '<div class="split-even" style="gap:0 16px">' +
          '<div class="field"><label class="form-label" for="rd-kanal">Kanal Pengiriman</label>' +
            '<select class="select" id="rd-kanal">' +
              '<option value="WhatsApp"' + (kanalAwal === 'Email' ? '' : ' selected') + '>WhatsApp</option>' +
              '<option value="Email"' + (kanalAwal === 'Email' ? ' selected' : '') + '>Email</option>' +
              '<option value="Keduanya">WhatsApp + Email</option>' +
            '</select></div>' +
          '<div class="field"><label class="form-label" for="rd-ms">Template Milestone</label>' +
            '<select class="select" id="rd-ms">' +
              '<option value="H-3">H-3 — Pemberitahuan Awal</option>' +
              '<option value="H-1" selected>H-1 — Konfirmasi & Puasa Lab</option>' +
              '<option value="H-0">H-0 — Hari Kunjungan</option>' +
            '</select></div>' +
        '</div>' +
        '<div class="field" style="margin-bottom:0">' +
          '<label class="form-label" for="rd-pesan">Pesan Kustom (opsional)</label>' +
          '<textarea class="textarea" id="rd-pesan" rows="4" ' +
            'placeholder="Kosongkan untuk memakai template milestone yang dipilih. Variabel {{Nama_Pasien}}, {{Tanggal_Kunjungan}}, dan {{Jam_Kunjungan}} tetap dapat digunakan."></textarea>' +
        '</div>' +
        '<div class="callout callout-neutral" style="margin-top:14px">' + UI.ikon('info') +
          '<div>Pengiriman manual tetap dicatat ke sheet <b>Log_Reminder</b> dan memotong kuota notifikasi harian.</div></div>',
      aksi: [
        { teks: 'Batal', kelas: 'btn-ghost' },
        { teks: 'Kirim Sekarang', kelas: 'btn-accent', ikon: 'kirim', onClick: async () => {
            const res = await API.kirim('kirimReminder', {
              idPasien: p.id,
              channel: Form.nilai('rd-kanal'),
              milestone: Form.nilai('rd-ms'),
              pesan: Form.nilai('rd-pesan')
            });
            return res.success;
          } }
      ]
    });
  },

  pasang() {
    const app = document.getElementById('app');
    const d = this._d;
    const p = d.profil;

    app.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => {
      this._tab = b.dataset.tab;
      document.getElementById('rm-isi').innerHTML = this._isiTab(d);
      app.querySelectorAll('[data-tab]').forEach(x => {
        const aktif = x.dataset.tab === this._tab;
        x.className = 'btn ' + (aktif ? 'btn-primary' : 'btn-ghost') + ' btn-sm btn-inline';
      });
      this._pasangTab();
      UI.aktifkanTooltip(app);
    }));

    document.getElementById('rm-sunting').addEventListener('click', () => { location.hash = '#/pasien/' + p.id + '/sunting'; });
    document.getElementById('rm-cetak').addEventListener('click', () => window.print());
    document.getElementById('rm-wa').addEventListener('click', () => this.dialogReminder(p, 'WhatsApp'));
    document.getElementById('rm-email').addEventListener('click', () => this.dialogReminder(p, 'Email'));

    /* Prinsip 2 — pembaruan optimistik.
       Badge kehadiran berubah seketika, pesan konfirmasi muncul seketika, dan
       pengiriman ke server berjalan di latar belakang. Bila server menolak,
       tampilan dikembalikan ke keadaan semula beserta penjelasannya. */
    document.getElementById('rm-simpan-status').addEventListener('click', () => {
      const status = Form.nilai('rm-status');
      const semula = p.statusKunjungan;
      if (status === semula) { UI.toast('Status kunjungan tidak berubah.', 'info'); return; }

      const gambar = (nilai) => {
        p.statusKunjungan = nilai;
        const sel = document.getElementById('rm-status');
        if (sel) sel.value = nilai;
        const kartu = document.querySelector('#rm-isi .card-pad');
        if (kartu) kartu.classList.toggle('sinkron', false);
      };

      gambar(status);
      const tombol = document.getElementById('rm-simpan-status');
      tombol.classList.add('sinkron');
      UI.toast('Status kunjungan diperbarui.', 'success');

      API.kirimLatar('updateKunjungan', { id: p.id, status }, () => {
        gambar(semula);
        UI.toast('Perubahan dibatalkan — status dikembalikan ke "' + semula + '".', 'error');
      });

      // Segarkan angka kepatuhan setelah server sempat memproses.
      setTimeout(() => { tombol.classList.remove('sinkron'); Router.muat({ diam: true }); }, 1400);
    });

    this._pasangTab();
    UI.aktifkanTooltip(app);
  },

  _pasangTab() {
    const p = this._d.profil;

    const etiket = document.getElementById('rm-etiket');
    if (etiket) etiket.addEventListener('click', () => window.print());

    const ubah = document.getElementById('rm-ubah-tgl');
    if (ubah) ubah.addEventListener('click', () => {
      UI.modal({
        judul: 'Ubah Jadwal Kontrol',
        sub: p.nama + ' · ' + p.id,
        isi:
          '<div class="split-even" style="gap:0 16px">' +
            '<div class="field"><label class="form-label" for="jd-tgl">Tanggal Baru</label>' +
              '<input class="input" id="jd-tgl" type="date" value="' + UI.esc(p.tanggal) + '"></div>' +
            '<div class="field"><label class="form-label" for="jd-jam">Jam Baru</label>' +
              '<input class="input mono" id="jd-jam" type="time" value="' + UI.esc(p.jam) + '"></div>' +
          '</div>' +
          '<div class="callout callout-warning">' + UI.ikon('info') +
            '<div>Trigger reminder H-3, H-1, dan H-0 otomatis dihitung ulang dari tanggal baru pada eksekusi cron berikutnya.</div></div>',
        aksi: [
          { teks: 'Batal', kelas: 'btn-ghost' },
          { teks: 'Simpan Jadwal', kelas: 'btn-primary', ikon: 'cek', onClick: async () => {
              const res = await API.kirim('savePasien', {
                id: p.id, nama: p.nama, nik: p.nik, noHp: p.noHp, jenisPtm: p.jenisPtm,
                klaster: p.klaster, fotoUrl: p.foto,
                tanggalKunjungan: Form.nilai('jd-tgl'), jamKunjungan: Form.nilai('jd-jam'),
                statusKunjungan: 'Belum Berkunjung', statusReminder: 'Belum Terkirim'
              });
              if (res.success) Router.muat();
              return res.success;
            } }
        ]
      });
    });

    ['rm-tambah-obat', 'rm-sunting2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => { location.hash = '#/pasien/' + p.id + '/sunting'; });
    });
  }
};

/* ==========================================================================
   HALAMAN 8 — JADWAL & REMINDER
   ========================================================================== */
PAGES.jadwal = {
  judul: 'Jadwal & Reminder',
  shell: 'app',
  perluSesi: 'Petugas',

  async muat() {
    const [daftar, log, set] = await Promise.all([
      API.ambil('listPasien', { perHalaman: 100 }, { diam: true }),
      API.ambil('listLogReminder', { limit: 40 }, { diam: true }),
      API.ambil('getPengaturan', {}, { diam: true })
    ]);
    if (!daftar) return UI.kosong('Data tidak dapat dimuat', 'Periksa koneksi lalu muat ulang.', 'peringatan');

    const hariIni = UI.hariIni();
    const semua = daftar.pasien || [];
    const ember = { hariIni: [], besok: [], pekan: [], lewat: [] };

    semua.forEach(p => {
      const selisih = Math.round((new Date(p.tanggal + 'T00:00:00') - new Date(hariIni + 'T00:00:00')) / 86400000);
      if (isNaN(selisih)) return;
      if (selisih === 0) ember.hariIni.push(p);
      else if (selisih === 1) ember.besok.push(p);
      else if (selisih > 1 && selisih <= 7) ember.pekan.push(p);
      else if (selisih < 0 && p.statusKunjungan !== 'Sudah Berkunjung') ember.lewat.push(p);
    });

    const ms = (set && set.milestones) || {};
    const kuota = (set && set.kuota) || { harian: 0, terpakai: 0, sisa: 0 };

    return '' +
    '<section>' +
      '<h1 style="margin-bottom:6px">Jadwal Kunjungan &amp; Antrean Pengingat</h1>' +
      '<p class="muted" style="margin:0">Pantau gelombang kunjungan mendatang serta jejak pengiriman notifikasi otomatis.</p>' +
    '</section>' +

    '<section class="kpi-grid">' +
      UI.kpi({ label: 'Kontrol Hari Ini', ikon: 'jadwal', nada: 'accent', nilai: ember.hariIni.length,
               kaki: '<span class="tiny muted">pengingat H-0 dikirim ' + (ms.H0 ? ms.H0.jam : '06:30') + ' WIB</span>' }) +
      UI.kpi({ label: 'Kontrol Besok', ikon: 'kalender', nilai: ember.besok.length,
               kaki: '<span class="tiny muted">pengingat H-1 & instruksi puasa lab</span>' }) +
      UI.kpi({ label: 'Dalam 7 Hari', ikon: 'jam', nilai: ember.pekan.length,
               kaki: '<span class="tiny muted">termasuk gelombang H-3</span>' }) +
      UI.kpi({ label: 'Jadwal Terlewat', ikon: 'peringatan', nada: 'danger', nilai: ember.lewat.length,
               nilaiNada: ember.lewat.length ? 'danger' : '', garis: ember.lewat.length ? 'danger' : '',
               kaki: '<span class="tiny muted">perlu tindak lanjut kunjungan kader</span>' }) +
    '</section>' +

    '<section class="split">' +
      '<div class="stack">' +
        this._grup('Kontrol Hari Ini', ember.hariIni, 'jadwal', 'Pasien dijadwalkan hadir hari ini.') +
        this._grup('Kontrol Besok (Gelombang H-1)', ember.besok, 'kalender', 'Instruksi puasa laboratorium dikirim hari ini.') +
        this._grup('Tujuh Hari ke Depan', ember.pekan, 'jam', 'Termasuk pasien yang akan menerima pengingat H-3.') +
        (ember.lewat.length
          ? this._grup('Jadwal Terlewat — Perlu Tindak Lanjut', ember.lewat, 'peringatan',
              'Diteruskan ke daftar tugas Kunjungan Rumah kader Posbindu.', true)
          : '') +
      '</div>' +

      '<div class="stack">' +
        '<div class="card">' +
          '<div class="card-head"><div><h4 style="margin:0">' + UI.ikon('perisai') + ' Konfigurasi Milestone Aktif</h4></div>' +
            '<button class="btn btn-ghost btn-xs btn-inline" data-ke="#/pengaturan">' + UI.ikon('gear') + 'Atur</button></div>' +
          '<div class="card-body">' +
            ['H3', 'H1', 'H0'].map(k => {
              const m = ms[k] || {};
              const kanal = [m.wa ? 'WhatsApp' : '', m.email ? 'Email' : ''].filter(Boolean).join(' + ') || 'Nonaktif';
              return '<div class="row-between" style="padding:10px 0;border-bottom:1px solid var(--border)">' +
                '<div><div class="small strong">' + k.replace('H', 'H-') + ' · ' + UI.esc(m.jam || '-') + ' WIB</div>' +
                '<div class="tiny muted">' + UI.esc(kanal) + '</div></div>' +
                '<span class="badge badge-' + (m.aktif ? 'success' : 'neutral') + '">' + (m.aktif ? 'Aktif' : 'Mati') + '</span>' +
              '</div>';
            }).join('') +
            '<div style="padding-top:14px">' +
              '<div class="row-between small" style="margin-bottom:8px">' +
                '<span class="muted">Kuota Notifikasi Harian</span>' +
                '<span class="mono strong">' + kuota.terpakai + ' / ' + kuota.harian + '</span></div>' +
              '<div class="kpi-bar"><span style="width:' +
                (kuota.harian ? Math.min(100, kuota.terpakai / kuota.harian * 100) : 0) + '%"></span></div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head"><div><h4 style="margin:0">' + UI.ikon('pesanCek') + ' Jejak Pengiriman Terakhir</h4>' +
          '<p class="card-sub">Sheet Log_Reminder</p></div></div>' +
          '<div class="card-body" style="max-height:420px;overflow:auto">' +
            ((log && log.log && log.log.length)
              ? log.log.map(l =>
                  '<div class="row" style="gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">' +
                    '<span style="flex:none;color:var(--' + (l.status === 'Sukses' ? 'success' : 'danger') + ')">' +
                      UI.ikon(l.status === 'Sukses' ? 'cekLingkar' : 'silang') + '</span>' +
                    '<div class="grow" style="min-width:0">' +
                      '<div class="small strong truncate">' + UI.esc(l.nama) + '</div>' +
                      '<div class="tiny muted">' + UI.esc(l.jenis) + ' · ' + UI.esc(l.channel) + ' · ' +
                        UI.tanggal(l.waktu, 'waktu') + '</div>' +
                    '</div>' +
                  '</div>').join('')
              : '<p class="small muted" style="margin:0">Belum ada catatan pengiriman. Log akan terisi setelah cron harian berjalan ' +
                'atau reminder manual dikirim.</p>') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  },

  _grup(judul, list, ikon, sub, bahaya) {
    return '<div class="card">' +
      '<div class="card-head">' +
        '<div><h4 style="margin:0">' + UI.ikon(ikon) + ' ' + UI.esc(judul) + '</h4>' +
        '<p class="card-sub">' + UI.esc(sub) + '</p></div>' +
        '<span class="badge badge-' + (bahaya ? 'danger' : 'info') + ' badge-lg">' + list.length + ' pasien</span>' +
      '</div>' +
      (list.length
        ? '<div class="table-wrap"><table class="data" style="min-width:640px"><thead><tr>' +
            '<th>Pasien</th><th>Diagnosis</th><th>Tanggal &amp; Jam</th><th>Reminder</th><th class="right">Aksi</th>' +
          '</tr></thead><tbody>' +
          list.map(p =>
            '<tr><td><div class="row">' + UI.avatar(p.nama, p.foto) +
              '<div><div class="cell-strong">' + UI.esc(p.nama) + '</div>' +
              '<div class="cell-meta">' + UI.esc(p.klaster) + '</div></div></div></td>' +
            '<td>' + UI.badgePtm(p.jenisPtm) + '</td>' +
            '<td><div class="small strong">' + UI.tanggal(p.tanggal, 'pendek') + '</div>' +
              '<div class="cell-meta mono">' + UI.esc(p.jam) + ' WIB</div></td>' +
            '<td>' + UI.badgeReminder(p.statusReminder) + '</td>' +
            '<td class="right"><div class="row" style="gap:2px;justify-content:flex-end">' +
              '<button class="btn btn-icon btn" data-wa="' + UI.esc(p.id) + '" aria-label="Kirim reminder">' + UI.ikon('pesan') + '</button>' +
              '<button class="btn btn-icon btn" data-ke="#/pasien/' + UI.esc(p.id) + '" aria-label="Buka rekam medis">' + UI.ikon('mata') + '</button>' +
            '</div></td></tr>').join('') +
          '</tbody></table></div>'
        : '<div class="card-body"><p class="small muted" style="margin:0">Tidak ada pasien pada kelompok ini.</p></div>') +
    '</div>';
  },

  pasang() {
    const app = document.getElementById('app');
    app.querySelectorAll('[data-wa]').forEach(b => b.addEventListener('click', async () => {
      const d = await API.ambil('getPasien', { id: b.dataset.wa });
      if (d) PAGES.pasienDetail.dialogReminder(d.profil, 'WhatsApp');
    }));
  }
};
