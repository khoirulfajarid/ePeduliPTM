/* ==========================================================================
   PEDULI PTM — pages-admin3.js  (bagian 4)
   Pengumuman & Siaran Edukasi, Laporan Pelayanan,
   Verifikasi Akun Staff, Pengaturan Sistem Pengingat.
   ========================================================================== */

/* ==========================================================================
   HALAMAN 9 — MANAJEMEN PENGUMUMAN & SIARAN EDUKASI
   ========================================================================== */
PAGES.pengumuman = {
  judul: 'Pengumuman',
  shell: 'app',
  perluSesi: 'Petugas',
  _draf: null,

  async muat() {
    const d = await API.ambil('listPengumuman');
    if (!d) return UI.kosong('Data tidak dapat dimuat', 'Periksa koneksi lalu muat ulang.', 'peringatan');
    this._d = d;
    const r = d.ringkasan;

    return '' +
    '<section class="row-between wrap" style="gap:16px">' +
      '<div>' +
        '<h1 style="margin-bottom:6px">' + UI.ikon('megafon') + ' Manajemen Pengumuman &amp; Siaran Edukasi PTM</h1>' +
        '<p class="muted" style="margin:0;max-width:78ch">Kelola pop-up portal publik, broadcast WhatsApp gateway, dan surel edukasi ' +
          'berbasis jenis penyakit tidak menular serta klaster fasilitas kesehatan.</p>' +
      '</div>' +
      '<button class="btn btn-deep btn-sm btn-inline" id="pg-baru">' + UI.ikon('plus') + 'Buat Pengumuman Baru</button>' +
    '</section>' +

    '<section class="kpi-grid">' +
      UI.kpi({ label: 'Total Siaran Aktif', ikon: 'megafon', nilai: r.totalAktif, unit: 'Tayang',
               kaki: '<span class="tiny muted">tampil sebagai pop-up portal publik</span>' }) +
      UI.kpi({ label: 'Pasien Terjangkau', ikon: 'pasien', nada: 'accent', nilai: UI.angka(r.terjangkau),
               kaki: '<span class="tiny muted">dari ' + UI.angka(r.totalPasien) + ' pasien binaan</span>',
               progres: r.totalPasien ? (r.terjangkau / r.totalPasien) * 100 : 0 }) +
      UI.kpi({ label: 'Siaran Tertarget', ikon: 'target', nilai: r.tertarget, unit: 'Kampanye',
               kaki: '<span class="tiny muted">difilter per diagnosis PTM</span>' }) +
      UI.kpi({ label: 'Kanal Dominan', ikon: 'pesanCek', nada: 'success', nilai: 'WhatsApp',
               kaki: '<span class="tiny muted">jangkauan tertinggi pada populasi lansia</span>' }) +
    '</section>' +

    '<section class="callout callout-accent">' + UI.ikon('perisai') +
      '<div><b>Protokol Etika &amp; Kerahasiaan Broadcast Medis (UU PDP No. 27/2022).</b> ' +
      'Pesan hanya dikirim kepada pasien binaan terdaftar yang berstatus menyetujui (opt-in). ' +
      'Seluruh riwayat pengiriman terekam dalam audit log rekam medis terpadu.</div>' +
    '</section>' +

    '<section class="split-wide">' +
      /* ---------- Daftar siaran ---------- */
      '<div class="card">' +
        '<div class="card-head">' +
          '<div><h3 class="card-title">Daftar Siaran &amp; Pengumuman PTM</h3>' +
          '<p class="card-sub">' + d.pengumuman.length + ' siaran terdaftar</p></div>' +
        '</div>' +
        '<div class="table-wrap">' +
          '<table class="data" style="min-width:680px"><thead><tr>' +
            '<th>Judul &amp; Pesan Siaran</th><th>Target Pasien</th><th>Kanal &amp; Metrik</th><th>Status</th><th class="right">Aksi</th>' +
          '</tr></thead><tbody>' +
          (d.pengumuman.length
            ? d.pengumuman.map(p =>
              '<tr>' +
                '<td style="max-width:280px">' +
                  '<div class="cell-strong">' + UI.esc(p.judul) + '</div>' +
                  '<div class="cell-meta">' + UI.esc(String(p.isi).slice(0, 72)) + '…</div>' +
                  '<div class="cell-meta">' + UI.tanggal(p.tanggalPublish, 'pendek') + ' · ' + UI.esc(p.dibuatOleh) + '</div>' +
                '</td>' +
                '<td><span class="badge badge-info">' + UI.ikon('target') + UI.esc(p.target) + '</span>' +
                  '<div class="cell-meta">' + UI.esc(p.klaster) + '</div></td>' +
                '<td><div class="row wrap" style="gap:4px">' +
                    String(p.kanal).split(',').map(k => '<span class="badge badge-neutral">' + UI.esc(k.trim()) + '</span>').join('') +
                  '</div>' +
                  '<div class="cell-meta mono">' + UI.angka(p.terkirim) + ' pesan terkirim</div></td>' +
                '<td><label class="switch"><input type="checkbox" data-toggle="' + UI.esc(p.id) + '"' +
                  (p.aktif ? ' checked' : '') + ' aria-label="Aktifkan pengumuman ' + UI.esc(p.judul) + '">' +
                  '<span class="track"></span></label>' +
                  '<div class="cell-meta">' + (p.aktif ? 'Tayang' : 'Nonaktif') + '</div></td>' +
                '<td class="right"><div class="row" style="gap:2px;justify-content:flex-end">' +
                  '<button class="btn btn-icon btn" data-lihat="' + UI.esc(p.id) + '" aria-label="Pratinjau">' + UI.ikon('mata') + '</button>' +
                  '<button class="btn btn-icon btn" data-sunting="' + UI.esc(p.id) + '" aria-label="Sunting">' + UI.ikon('pena') + '</button>' +
                  '<button class="btn btn-icon btn" data-siar="' + UI.esc(p.id) + '" aria-label="Siarkan sekarang">' + UI.ikon('kirim') + '</button>' +
                '</div></td>' +
              '</tr>').join('')
            : '<tr><td colspan="5">' + UI.kosong('Belum ada pengumuman',
                'Buat siaran pertama Anda menggunakan formulir di sebelah kanan.', 'megafon') + '</td></tr>') +
          '</tbody></table>' +
        '</div>' +
      '</div>' +

      /* ---------- Komposer ---------- */
      '<div class="stack">' +
        '<div class="card">' +
          '<div class="card-head">' +
            '<div><h3 class="card-title">Buat Pengumuman Tertarget</h3>' +
            '<p class="card-sub">Pratinjau WhatsApp diperbarui saat Anda mengetik</p></div>' +
            '<span class="badge badge-success"><span class="dot dot-live"></span>Live</span>' +
          '</div>' +
          '<div class="card-body">' +
            '<input type="hidden" id="pg-id">' +

            '<div class="field">' +
              '<div class="row-between" style="margin-bottom:6px">' +
                '<label class="form-label" for="pg-judul">Judul Pengumuman &amp; Subjek Pesan<span class="req">*</span></label>' +
                '<span class="tiny muted" id="pg-judul-sisa">80 karakter</span>' +
              '</div>' +
              '<input class="input" id="pg-judul" maxlength="80" placeholder="Jadwal Skrining Retinopati Diabetik">' +
            '</div>' +

            '<div class="field">' +
              '<label class="form-label">Pilih Target Penyakit Tidak Menular<span class="req">*</span></label>' +
              '<div class="col" style="gap:8px">' +
                (d.targetTersedia || []).map((t, i) =>
                  '<label class="check" style="min-height:44px;padding:8px 0">' +
                    '<input type="radio" name="pg-target" value="' + UI.esc(t.nilai) + '"' + (i === 0 ? ' checked' : '') + '>' +
                    '<span class="grow">' + UI.esc(t.nilai) + '</span>' +
                    '<span class="badge badge-neutral">' + UI.angka(t.jumlah) + ' pasien</span>' +
                  '</label>').join('') +
              '</div>' +
            '</div>' +

            '<div class="split-even" style="gap:0 14px">' +
              '<div class="field"><label class="form-label" for="pg-klaster">Klaster Faskes</label>' +
                '<input class="input" id="pg-klaster" value="Semua Klaster"></div>' +
              '<div class="field"><label class="form-label" for="pg-akhir">Tenggat Tayang</label>' +
                '<input class="input" id="pg-akhir" type="date"></div>' +
            '</div>' +

            '<div class="field">' +
              '<label class="form-label">Kanal Pengiriman Aktif</label>' +
              '<div class="col" style="gap:0">' +
                CONFIG.KANAL_PENGUMUMAN.map((k, i) =>
                  '<label class="check" style="min-height:40px;padding:6px 0">' +
                    '<input type="checkbox" name="pg-kanal" value="' + UI.esc(k) + '"' + (i === 0 ? ' checked' : '') + '>' +
                    UI.esc(k === 'Pop-up' ? 'Pop-up Portal Publik' : k === 'WhatsApp' ? 'Broadcast WhatsApp (Fonnte)' : 'Surel Edukasi (Gmail)') +
                  '</label>').join('') +
              '</div>' +
            '</div>' +

            '<div class="field">' +
              '<div class="row-between wrap" style="margin-bottom:6px;gap:8px">' +
                '<label class="form-label" for="pg-isi">Isi Pengumuman / Pesan<span class="req">*</span></label>' +
                '<div class="row wrap" style="gap:6px">' +
                  '<button class="var-chip" data-sisip="{{Nama_Pasien}}" type="button">+ {{Nama_Pasien}}</button>' +
                  '<button class="var-chip" data-sisip="{{Jadwal_Klinik}}" type="button">+ {{Jadwal_Klinik}}</button>' +
                '</div>' +
              '</div>' +
              '<textarea class="textarea" id="pg-isi" rows="7" ' +
                'placeholder="Tulis isi pengumuman. Gunakan baris baru untuk memisahkan instruksi agar mudah dibaca pasien lansia."></textarea>' +
            '</div>' +

            '<div class="row wrap" style="gap:8px;margin-bottom:16px">' +
              '<span class="label-kicker" style="width:100%">Sisipan cepat:</span>' +
              '<button class="var-chip" data-sisip="Puasa 8-10 Jam" type="button">Puasa 8-10 Jam</button>' +
              '<button class="var-chip" data-sisip="Bawa Kartu BPJS &amp; KTP" type="button">Kartu BPJS &amp; KTP</button>' +
              '<button class="var-chip" data-sisip="Bawa sisa obat rutin" type="button">Bawa Obat Rutin</button>' +
            '</div>' +

            '<div class="row wrap row-actions" style="gap:10px">' +
              '<button class="btn btn-ghost grow" id="pg-draf">' + UI.ikon('berkas') + 'Simpan Draf</button>' +
              '<button class="btn btn-primary grow" id="pg-simpan">' + UI.ikon('cekLingkar') + 'Simpan &amp; Tayangkan</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* ---------- Pratinjau ---------- */
        '<div class="card">' +
          '<div class="card-head"><div><h4 style="margin:0">' + UI.ikon('pesan') + ' Simulasi Pratinjau Siaran</h4>' +
          '<p class="card-sub">Tampilan pesan di perangkat pasien</p></div></div>' +
          '<div class="card-body">' +
            '<div class="wa-phone">' +
              '<div class="wa-top">' +
                '<div class="avatar" style="width:32px;height:32px;background:var(--accent);color:#fff;font-size:11px">PT</div>' +
                '<div class="grow"><div class="t">Layanan PTM ' + UI.esc(CONFIG.NAMA_FASKES) + '</div>' +
                '<div class="s">Fonnte WA Gateway · Terverifikasi</div></div>' +
              '</div>' +
              '<div class="wa-body"><div class="wa-bubble" id="pg-pratinjau">' +
                'Isi pengumuman akan tampil di sini saat Anda mengetik…' +
                '<span class="time">08.45 ✓✓</span></div></div>' +
            '</div>' +
            '<div class="wa-note">Pratinjau dirender memakai contoh data pasien aktif.</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  },

  pasang() {
    const app = document.getElementById('app');

    /* ---- Pratinjau langsung ---- */
    const perbarui = () => {
      const judul = Form.nilai('pg-judul');
      const isi = Form.nilai('pg-isi');
      const teks = 'Halo Bapak/Ibu *Budi Santoso*, salam sehat dari ' + CONFIG.NAMA_FASKES + '.\n\n' +
        (judul ? '*' + judul + '*\n\n' : '') +
        (isi || 'Isi pengumuman akan tampil di sini saat Anda mengetik…');
      document.getElementById('pg-pratinjau').innerHTML =
        UI.escMulti(teks).split('*').join('') + '<span class="time">08.45 ✓✓</span>';
      document.getElementById('pg-judul-sisa').textContent = (80 - judul.length) + ' karakter tersisa';
    };
    document.getElementById('pg-judul').addEventListener('input', perbarui);
    document.getElementById('pg-isi').addEventListener('input', perbarui);

    /* ---- Sisipan cepat ---- */
    app.querySelectorAll('[data-sisip]').forEach(b => b.addEventListener('click', () => {
      const ta = document.getElementById('pg-isi');
      const pos = ta.selectionStart || ta.value.length;
      ta.value = ta.value.slice(0, pos) + b.dataset.sisip + ta.value.slice(pos);
      ta.focus();
      ta.selectionStart = ta.selectionEnd = pos + b.dataset.sisip.length;
      perbarui();
    }));

    /* ---- Simpan ---- */
    const kumpulkan = (aktif) => {
      const target = document.querySelector('[name="pg-target"]:checked');
      const kanal = Array.from(document.querySelectorAll('[name="pg-kanal"]:checked')).map(c => c.value);
      return {
        id: Form.nilai('pg-id'),
        judul: Form.nilai('pg-judul'),
        isi: Form.nilai('pg-isi'),
        target: target ? target.value : 'Semua Pasien',
        klaster: Form.nilai('pg-klaster'),
        tanggalBerakhir: Form.nilai('pg-akhir'),
        kanal: kanal.length ? kanal : ['Pop-up'],
        aktif: aktif
      };
    };

    const simpan = async (aktif) => {
      const d = kumpulkan(aktif);
      if (!d.judul) return Form.salah('pg-judul', 'Judul pengumuman wajib diisi.');
      if (!d.isi)   return Form.salah('pg-isi', 'Isi pengumuman wajib diisi.');
      const res = await API.kirim('savePengumuman', d);
      if (res.success) Router.muat();
    };

    document.getElementById('pg-simpan').addEventListener('click', () => simpan(true));
    document.getElementById('pg-draf').addEventListener('click', () => simpan(false));
    document.getElementById('pg-baru').addEventListener('click', () => {
      ['pg-id', 'pg-judul', 'pg-isi', 'pg-akhir'].forEach(id => Form.set(id, ''));
      document.getElementById('pg-judul').focus();
      perbarui();
    });

    /* ---- Aksi baris ---- */
    /* Sakelar tayang: posisinya sudah berubah saat jari diangkat. Sinkronisasi
       ke server tidak ditunggu; bila gagal, sakelar kembali sendiri. */
    app.querySelectorAll('[data-toggle]').forEach(c => c.addEventListener('change', () => {
      const id = c.dataset.toggle;
      const aktif = c.checked;

      const ket = c.closest('td') && c.closest('td').querySelector('.cell-meta');
      if (ket) ket.textContent = aktif ? 'Tayang' : 'Nonaktif';

      const p = this._d.pengumuman.filter(x => x.id === id)[0];
      if (p) p.aktif = aktif;
      UI.toast('Pengumuman kini ' + (aktif ? 'TAYANG' : 'NONAKTIF') + '.', 'success');

      API.kirimLatar('togglePengumuman', { id, aktif }, () => {
        c.checked = !aktif;
        if (ket) ket.textContent = !aktif ? 'Tayang' : 'Nonaktif';
        if (p) p.aktif = !aktif;
      });
    }));

    app.querySelectorAll('[data-sunting]').forEach(b => b.addEventListener('click', () => {
      const p = this._d.pengumuman.filter(x => x.id === b.dataset.sunting)[0];
      if (!p) return;
      Form.set('pg-id', p.id);
      Form.set('pg-judul', p.judul);
      Form.set('pg-isi', p.isi);
      Form.set('pg-klaster', p.klaster);
      Form.set('pg-akhir', p.tanggalBerakhir);

      const t = document.querySelector('[name="pg-target"][value="' + p.target + '"]');
      if (t) t.checked = true;
      document.querySelectorAll('[name="pg-kanal"]').forEach(c => {
        c.checked = String(p.kanal).indexOf(c.value) !== -1;
      });

      perbarui();
      document.getElementById('pg-judul').scrollIntoView({ behavior: 'smooth', block: 'center' });
      UI.toast('Pengumuman dimuat ke formulir. Ubah lalu simpan untuk memperbarui.', 'info');
    }));

    app.querySelectorAll('[data-lihat]').forEach(b => b.addEventListener('click', () => {
      const p = this._d.pengumuman.filter(x => x.id === b.dataset.lihat)[0];
      if (!p) return;
      UI.modal({
        aksenAtas: true, lebar: 'lg',
        kicker: 'Pratinjau Pop-up Portal Publik',
        judul: p.judul,
        isi: '<div class="row wrap" style="gap:8px;margin-bottom:16px">' +
               '<span class="badge badge-info">' + UI.ikon('target') + UI.esc(p.target) + '</span>' +
               '<span class="badge badge-neutral">' + UI.esc(p.klaster) + '</span>' +
               '<span class="badge badge-' + (p.aktif ? 'success' : 'neutral') + '">' + (p.aktif ? 'Tayang' : 'Nonaktif') + '</span>' +
             '</div>' +
             '<div style="font-size:14px;line-height:1.75;color:var(--ink-2)">' + UI.escMulti(p.isi) + '</div>',
        aksi: [{ teks: 'Tutup', kelas: 'btn-ghost' }]
      });
    }));

    app.querySelectorAll('[data-siar]').forEach(b => b.addEventListener('click', async () => {
      const p = this._d.pengumuman.filter(x => x.id === b.dataset.siar)[0];
      if (!p) return;
      const ok = await UI.konfirmasi('Siarkan Pengumuman Sekarang',
        'Pesan "' + p.judul + '" akan dikirim ke seluruh pasien bertarget "' + p.target + '" melalui kanal ' + p.kanal + '.\n\n' +
        'Pengiriman memotong kuota notifikasi harian dan tidak dapat dibatalkan. Lanjutkan?',
        { ya: 'Ya, Siarkan Sekarang' });
      if (!ok) return;
      const res = await API.kirim('siarkanPengumuman', { id: p.id });
      if (res.success) Router.muat();
    }));

    perbarui();
  }
};

/* ==========================================================================
   HALAMAN 10 — LAPORAN PELAYANAN & KEPATUHAN
   ========================================================================== */
PAGES.laporan = {
  judul: 'Laporan Pelayanan',
  shell: 'app',
  perluSesi: 'Petugas',
  _filter: { dari: '', sampai: '', klaster: '' },

  async muat() {
    const d = await API.ambil('getLaporan', this._filter);
    if (!d) return UI.kosong('Data tidak dapat dimuat', 'Periksa koneksi lalu muat ulang.', 'peringatan');
    this._d = d;
    const r = d.ringkasan;

    return '' +
    '<section class="card card-pad">' +
      '<div class="row-between wrap" style="gap:16px">' +
        '<div>' +
          '<div class="row wrap" style="gap:8px;margin-bottom:10px">' +
            '<span class="badge badge-info">' + UI.ikon('laporan') + 'Evaluasi Periodik</span>' +
            '<span class="badge badge-success"><span class="dot dot-live"></span>Sinkronisasi Real-time</span>' +
          '</div>' +
          '<h1 style="margin-bottom:6px">Laporan Pelayanan &amp; Kepatuhan Pasien PTM</h1>' +
          '<p class="muted" style="margin:0;max-width:76ch">Evaluasi kepatuhan medikasi, tren monitoring kunjungan faskes, ' +
            'serta efektivitas pengingat kader lapangan.</p>' +
        '</div>' +
        '<div class="col" style="gap:10px;min-width:260px">' +
          '<div class="row" style="gap:8px">' +
            '<input class="input" id="lp-dari" type="date" value="' + UI.esc(this._filter.dari) + '" aria-label="Tanggal mulai">' +
            '<input class="input" id="lp-sampai" type="date" value="' + UI.esc(this._filter.sampai) + '" aria-label="Tanggal akhir">' +
          '</div>' +
          '<select class="select" id="lp-klaster">' +
            '<option value="">Semua Klaster Layanan</option>' +
            (d.perKlaster || []).map(k => '<option value="' + UI.esc(k.klaster) + '"' +
              (this._filter.klaster === k.klaster ? ' selected' : '') + '>' + UI.esc(k.klaster) + '</option>').join('') +
          '</select>' +
          '<div class="row row-actions" style="gap:8px">' +
            '<button class="btn btn-ghost btn-sm grow" id="lp-csv">' + UI.ikon('unduh') + 'Ekspor CSV</button>' +
            '<button class="btn btn-primary btn-sm grow" id="lp-cetak">' + UI.ikon('cetak') + 'Cetak PDF</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="tiny muted" style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">' +
        'Periode data: ' + UI.esc(d.periode.dari) + ' s.d. ' + UI.esc(d.periode.sampai) +
        ' · Total kasus aktif dalam cakupan: ' + UI.angka(d.totalKasusAktif) + ' pasien' +
      '</div>' +
    '</section>' +

    '<section class="kpi-grid">' +
      UI.kpi({ label: 'Kepatuhan Kontrol Rata-rata', ikon: 'target', nada: 'success',
               nilai: UI.persen(r.kepatuhanRata), nilaiNada: r.kepatuhanRata >= 85 ? 'success' : '',
               garis: r.kepatuhanRata >= 85 ? 'success' : '',
               kaki: '<span class="tiny muted">' + (r.kepatuhanRata >= 85 ? 'Di atas' : 'Di bawah') + ' target Dinkes (>85%)</span>' }) +
      UI.kpi({ label: 'Kunjungan Terlaksana', ikon: 'jadwal', nilai: UI.angka(r.kunjunganTerlaksana),
               unit: '/ ' + UI.angka(r.kunjunganTerjadwal) + ' terjadwal',
               progres: r.kunjunganTerjadwal ? (r.kunjunganTerlaksana / r.kunjunganTerjadwal) * 100 : 0 }) +
      UI.kpi({ label: 'Pasien Drop-out / Lewat Waktu', ikon: 'peringatan', nada: 'danger',
               nilai: UI.angka(r.dropOut), unit: 'Pasien', nilaiNada: 'danger', garis: 'danger',
               kaki: '<span class="badge badge-danger">' + UI.persen(r.persenDropOut) + ' dari total</span>' +
                     '<span class="tiny muted">perlu tindak lanjut kader</span>' }) +
      UI.kpi({ label: 'Efektivitas Reminder', ikon: 'pesanCek', nada: 'accent',
               nilai: UI.persen(r.efektivitasReminder),
               kaki: '<span class="tiny muted">rasio pesan berhasil terkirim</span>',
               progres: r.efektivitasReminder }) +
    '</section>' +

    '<section class="split-even">' +
      '<div class="card card-pad">' +
        '<h3 style="margin-bottom:4px">Tren Kepatuhan Kunjungan Bulanan</h3>' +
        '<p class="small muted" style="margin-bottom:20px">Perbandingan pasien terjadwal dengan pasien yang hadir tepat waktu</p>' +
        UI.chartBatangGrup(d.trenBulanan, { namaA: 'Terjadwal', namaB: 'Hadir Tepat Waktu' }) +
        '<div class="chart-note">' + UI.ikon('naik') +
          '<div>' + (r.kepatuhanRata >= 85
            ? 'Tren kepatuhan berada di atas ambang target Dinas Kesehatan (&gt;85%).'
            : 'Tren kepatuhan masih di bawah ambang target Dinas Kesehatan (&gt;85%) — perlu intensifikasi edukasi kader.') +
          '</div></div>' +
      '</div>' +

      '<div class="card card-pad">' +
        '<h3 style="margin-bottom:4px">Distribusi Kasus PTM Terdata</h3>' +
        '<p class="small muted" style="margin-bottom:20px">Komposisi diagnosis aktif pada populasi binaan</p>' +
        UI.chartDonat(d.distribusiPtm, { satuan: 'Kasus Aktif' }) +
        '<div class="chart-note">' + UI.ikon('info') +
          '<div>Pasien komorbid memiliki prioritas intervensi ganda dan jadwal kunjungan terintegrasi ' +
          'antara poli hipertensi dan poli diabetes.</div></div>' +
      '</div>' +
    '</section>' +

    '<section class="card card-pad">' +
      '<div class="row-between wrap" style="margin-bottom:20px">' +
        '<div><h3 style="margin-bottom:4px">Efektivitas Kanal Edukasi &amp; Pengingat Otomatis</h3>' +
        '<p class="small muted" style="margin:0">Metrik keterkiriman pesan pengingat jadwal konsumsi obat &amp; kontrol berkala</p></div>' +
        '<span class="badge badge-success">' + UI.ikon('perisai') + 'Gateway Terhubung</span>' +
      '</div>' +
      '<div class="split-even">' +
        this._kanal('WhatsApp Gateway', d.kanal.whatsapp, 'Menjangkau mayoritas pasien lansia melalui perangkat keluarga.') +
        this._kanal('Surel Edukasi (Gmail)', d.kanal.email, 'Berisi lampiran infografis dan panduan diet lengkap.') +
        '<div class="metric">' +
          '<div class="metric-name">Total Notifikasi Periode Ini</div>' +
          '<div class="metric-value">' + UI.angka(d.kanal.whatsapp.total + d.kanal.email.total) +
            '<span class="unit">pesan</span></div>' +
          '<div class="tiny muted" style="margin-top:8px;line-height:1.6">Mencakup milestone H-3, H-1, H-0, ' +
            'reminder manual petugas, serta broadcast pengumuman edukasi.</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="card">' +
      '<div class="card-head">' +
        '<div><h3 class="card-title">Evaluasi Performa Berdasarkan Klaster Layanan</h3>' +
        '<p class="card-sub">Analisis kepatuhan pasien dan utilisasi reminder per posko dan poli rujukan</p></div>' +
      '</div>' +
      '<div class="table-wrap">' +
        '<table class="data" style="min-width:760px"><thead><tr>' +
          '<th>Klaster Layanan / Poli</th><th>Dokter Penanggung Jawab</th><th>Total Pasien</th>' +
          '<th>Kepatuhan</th><th>Pesan Terkirim</th><th>Status Evaluasi</th>' +
        '</tr></thead><tbody>' +
        (d.perKlaster.length
          ? d.perKlaster.map(k => {
              const nada = k.kepatuhan >= 90 ? 'success' : k.kepatuhan >= 85 ? 'info' : k.kepatuhan >= 75 ? 'warning' : 'danger';
              return '<tr>' +
                '<td><div class="cell-strong">' + UI.esc(k.klaster) + '</div>' +
                  '<div class="cell-meta">' + UI.angka(k.hadir) + ' hadir dari ' + UI.angka(k.terjadwal) + ' jadwal</div></td>' +
                '<td><div class="row">' + UI.avatar(k.dokter, '') +
                  '<span class="small">' + UI.esc(k.dokter) + '</span></div></td>' +
                '<td class="mono strong">' + UI.angka(k.totalPasien) + '</td>' +
                '<td style="min-width:150px">' +
                  '<div class="row-between small" style="margin-bottom:6px">' +
                    '<span class="mono strong">' + UI.persen(k.kepatuhan) + '</span></div>' +
                  '<div class="kpi-bar"><span style="width:' + k.kepatuhan + '%;background:var(--' + nada + ')"></span></div></td>' +
                '<td><span class="badge badge-neutral mono">' + UI.angka(k.pesan) + ' pesan</span></td>' +
                '<td><span class="badge badge-' + nada + '">' + UI.esc(k.evaluasi) + '</span></td>' +
              '</tr>';
            }).join('')
          : '<tr><td colspan="6" class="center muted small" style="padding:32px">Belum ada data klaster pada periode ini.</td></tr>') +
        '</tbody></table>' +
      '</div>' +
      '<div class="card-foot">' +
        '<div class="row-between wrap" style="gap:16px">' +
          '<div class="row" style="align-items:flex-start;gap:12px">' +
            '<span class="kpi-icon" style="flex:none">' + UI.ikon('info') + '</span>' +
            '<div><div class="strong small">Rekomendasi Tindak Lanjut Tim Medis</div>' +
            '<div class="small muted" style="line-height:1.65;max-width:62ch">Sebanyak ' + UI.angka(r.dropOut) +
              ' pasien drop-out pada periode ini dapat diteruskan ke daftar tugas Kunjungan Rumah kader Posbindu ' +
              'untuk edukasi ulang dan penjadwalan susulan.</div></div>' +
          '</div>' +
          '<button class="btn btn-primary btn-sm btn-inline" id="lp-disposisi">' + UI.ikon('kirim') + 'Kirim Disposisi ke Kader</button>' +
        '</div>' +
      '</div>' +
    '</section>';
  },

  _kanal(nama, data, ket) {
    const nada = data.persen >= 95 ? 'success' : data.persen >= 85 ? 'info' : 'warning';
    return '<div class="metric">' +
      '<div class="metric-head"><span class="metric-name">' + UI.esc(nama) + '</span>' +
        '<span class="badge badge-' + nada + '">' + UI.persen(data.persen) + '</span></div>' +
      '<div class="metric-value">' + UI.angka(data.sukses) + '<span class="unit">/ ' + UI.angka(data.total) + ' terkirim</span></div>' +
      '<div class="metric-bar"><span style="width:' + data.persen + '%;background:var(--' + nada + ')"></span></div>' +
      '<div class="tiny muted" style="margin-top:8px;line-height:1.6">' + UI.esc(ket) + '</div>' +
    '</div>';
  },

  pasang() {
    const terapkan = () => {
      this._filter.dari = Form.nilai('lp-dari');
      this._filter.sampai = Form.nilai('lp-sampai');
      this._filter.klaster = Form.nilai('lp-klaster');
      Router.muat();
    };
    document.getElementById('lp-dari').addEventListener('change', terapkan);
    document.getElementById('lp-sampai').addEventListener('change', terapkan);
    document.getElementById('lp-klaster').addEventListener('change', terapkan);

    document.getElementById('lp-cetak').addEventListener('click', () => window.print());
    document.getElementById('lp-csv').addEventListener('click', () => {
      Ekspor.csv('laporan-kepatuhan-ptm-' + UI.hariIni(), this._d.perKlaster.map(k => ({
        'Klaster Layanan': k.klaster, 'Dokter PJ': k.dokter, 'Total Pasien': k.totalPasien,
        'Kunjungan Terjadwal': k.terjadwal, 'Hadir Tepat Waktu': k.hadir,
        'Kepatuhan (%)': k.kepatuhan, 'Pesan Terkirim': k.pesan, 'Status Evaluasi': k.evaluasi
      })));
    });

    document.getElementById('lp-disposisi').addEventListener('click', () => {
      UI.modal({
        judul: 'Disposisi Kunjungan Rumah Kader',
        sub: this._d.ringkasan.dropOut + ' pasien drop-out pada periode terpilih',
        isi: '<p class="muted" style="line-height:1.75">Daftar pasien yang melewatkan jadwal kontrol akan diteruskan ' +
             'ke kader Posbindu masing-masing wilayah untuk kunjungan rumah dan edukasi ulang.</p>' +
             '<div class="callout callout-neutral">' + UI.ikon('info') +
             '<div>Unduh daftar lewat tombol <b>Ekspor CSV</b>, lalu bagikan kepada koordinator kader melalui grup WhatsApp wilayah. ' +
             'Integrasi disposisi otomatis dapat ditambahkan pada iterasi berikutnya.</div></div>',
        aksi: [
          { teks: 'Tutup', kelas: 'btn-ghost' },
          { teks: 'Unduh Daftar Klaster', kelas: 'btn-primary', ikon: 'unduh', onClick: () => {
              document.getElementById('lp-csv').click();
            } }
        ]
      });
    });

    UI.aktifkanTooltip(document.getElementById('app'));
  }
};

/* ==========================================================================
   HALAMAN 11 — VERIFIKASI AKUN STAFF
   ========================================================================== */
PAGES.akun = {
  judul: 'Verifikasi Akun Staff',
  shell: 'app',
  perluSesi: 'SuperAdmin',

  async muat() {
    const d = await API.ambil('listAkun');
    if (!d) return UI.kosong('Data tidak dapat dimuat', 'Periksa koneksi lalu muat ulang.', 'peringatan');
    this._d = d;

    const r = d.ringkasan;
    const menunggu = d.akun.filter(a => a.status === 'Pending');
    const lainnya = d.akun.filter(a => a.status !== 'Pending');

    return '' +
    '<section class="row-between wrap" style="gap:16px">' +
      '<div>' +
        '<div class="row small muted" style="gap:6px;margin-bottom:8px">Sistem Autentikasi &amp; RBAC › Manajemen Akun Pengguna</div>' +
        '<h1 style="margin-bottom:6px">' + UI.ikon('perisai') + ' Verifikasi Akun Petugas &amp; Kredensial Medis</h1>' +
        '<p class="muted" style="margin:0;max-width:78ch">Tinjau pendaftaran tenaga medis baru, validasi nomor NIP/STR, dan berikan ' +
          'otorisasi hak akses modul kontrol PTM sesuai matriks RBAC.</p>' +
      '</div>' +
      '<button class="btn btn-ghost btn-sm btn-inline" id="ak-csv">' + UI.ikon('unduh') + 'Unduh Laporan Verifikasi</button>' +
    '</section>' +

    '<section class="kpi-grid">' +
      UI.kpi({ label: 'Total Petugas Terdaftar', ikon: 'orang', nilai: UI.angka(r.total),
               kaki: '<span class="tiny muted">seluruh peran dalam sistem</span>' }) +
      UI.kpi({ label: 'Menunggu Persetujuan', ikon: 'pasirJam', nada: 'danger', nilai: r.pending,
               unit: 'Permohonan', nilaiNada: r.pending ? 'danger' : '', garis: r.pending ? 'danger' : '',
               kaki: '<span class="badge badge-warning">' + UI.ikon('peringatan') + 'Perlu tindakan &lt; 24 jam</span>' }) +
      UI.kpi({ label: 'Akun Aktif Terverifikasi', ikon: 'cekLingkar', nada: 'success', nilai: UI.angka(r.aktif),
               kaki: '<span class="tiny muted">berhak mengakses rekam medis</span>' }) +
      UI.kpi({ label: 'Ditolak / Nonaktif', ikon: 'silang', nilai: r.ditolak,
               kaki: '<span class="tiny muted">arsip pengajuan gugur</span>' }) +
    '</section>' +

    /* ---------- Antrean verifikasi ---------- */
    '<section class="card">' +
      '<div class="card-head">' +
        '<div><h3 class="card-title">' + UI.ikon('lonceng') + ' Antrean Verifikasi Tertunda</h3>' +
        '<p class="card-sub">Setiap persetujuan mengaktifkan hak akses sesuai peran dan batas klaster penugasan.</p></div>' +
        '<span class="badge badge-warning badge-lg">' + menunggu.length + ' Menunggu</span>' +
      '</div>' +
      '<div class="card-body">' +
        (menunggu.length
          ? '<div class="col" style="gap:14px">' + menunggu.map(a =>
              '<div class="metric">' +
                '<div class="row-between wrap" style="gap:16px">' +
                  '<div class="row" style="gap:14px;min-width:0">' +
                    UI.avatar(a.nama, a.foto, 'avatar-lg') +
                    '<div style="min-width:0">' +
                      '<div class="row wrap" style="gap:8px;margin-bottom:4px">' +
                        '<span class="strong">' + UI.esc(a.nama) + '</span>' +
                        '<span class="badge badge-info">Calon ' + UI.esc(a.peran) + '</span>' +
                      '</div>' +
                      '<div class="tiny muted">' + UI.ikon('surel') + ' ' + UI.esc(a.email) + '</div>' +
                      '<div class="tiny muted">' + UI.ikon('berkas') + ' NIP/STR: ' + UI.esc(a.nip || '-') + '</div>' +
                      '<div class="tiny muted">' + UI.ikon('lokasi') + ' ' + UI.esc(a.klaster || '-') + '</div>' +
                      '<div class="tiny muted">' + UI.ikon('jam') + ' Diajukan ' + UI.tanggal(a.dibuat, 'pendek') + '</div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="row wrap row-actions" style="gap:8px">' +
                    '<button class="btn btn-ghost btn-sm btn-inline" data-tinjau="' + UI.esc(a.email) + '">' +
                      UI.ikon('mata') + 'Tinjau Dokumen</button>' +
                    '<button class="btn btn-danger btn-sm btn-inline" data-tolak="' + UI.esc(a.email) + '">' +
                      UI.ikon('silang') + 'Tolak</button>' +
                    '<button class="btn btn-primary btn-sm btn-inline" data-setuju="' + UI.esc(a.email) + '">' +
                      UI.ikon('cek') + 'Setujui Akses</button>' +
                  '</div>' +
                '</div>' +
              '</div>').join('') + '</div>'
          : UI.kosong('Tidak ada antrean verifikasi',
              'Seluruh permohonan akses petugas sudah ditinjau. Pengajuan baru akan muncul di sini secara otomatis.', 'cekLingkar')) +
      '</div>' +
    '</section>' +

    /* ---------- Direktori ---------- */
    '<section class="card">' +
      '<div class="card-head">' +
        '<div><h3 class="card-title">Direktori Akun Staff &amp; Tenaga Medis Terdaftar</h3>' +
        '<p class="card-sub">Otoritas kendali hak akses berbasis peran (RBAC) pada sheet Akun_Pengguna</p></div>' +
      '</div>' +
      '<div class="table-wrap">' +
        '<table class="data" style="min-width:780px"><thead><tr>' +
          '<th>Petugas &amp; Kredensial Medis</th><th>Peran / Hak Akses</th><th>Klaster Wilayah Tugas</th>' +
          '<th>Aktivitas Terakhir</th><th>Status Akun</th><th class="right">Aksi</th>' +
        '</tr></thead><tbody>' +
        lainnya.map(a => {
          const nada = a.status === 'Disetujui' ? 'success' : a.status === 'Ditolak' ? 'danger' : 'warning';
          return '<tr>' +
            '<td><div class="row">' + UI.avatar(a.nama, a.foto) +
              '<div><div class="cell-strong">' + UI.esc(a.nama) + '</div>' +
              '<div class="cell-meta">' + UI.esc(a.email) + '</div>' +
              '<div class="cell-meta">NIP: ' + UI.esc(a.nip || '-') + '</div></div></div></td>' +
            '<td><span class="badge ' + (a.peran === 'Super Admin' ? 'badge-solid' : 'badge-info') + '">' +
              UI.ikon('perisai') + UI.esc(a.peran) + '</span></td>' +
            '<td class="small">' + UI.esc(a.klaster || '-') + '</td>' +
            '<td><div class="small">' + (a.loginTerakhir ? UI.tanggal(a.loginTerakhir, 'pendek') : 'Belum pernah') + '</div>' +
              '<div class="cell-meta">Terdaftar ' + UI.tanggal(a.dibuat, 'pendek') + '</div></td>' +
            '<td><span class="badge badge-' + nada + '">' + UI.esc(a.status) + '</span></td>' +
            '<td class="right"><div class="row" style="gap:2px;justify-content:flex-end">' +
              '<button class="btn btn-icon btn" data-pin="' + UI.esc(a.email) + '" aria-label="Reset PIN">' + UI.ikon('gembok') + '</button>' +
              (a.status === 'Disetujui'
                ? '<button class="btn btn-icon btn" data-tolak="' + UI.esc(a.email) + '" aria-label="Nonaktifkan akun" ' +
                  'style="color:var(--danger)">' + UI.ikon('silang') + '</button>'
                : '<button class="btn btn-icon btn" data-setuju="' + UI.esc(a.email) + '" aria-label="Aktifkan akun" ' +
                  'style="color:var(--success)">' + UI.ikon('cek') + '</button>') +
            '</div></td>' +
          '</tr>';
        }).join('') +
        '</tbody></table>' +
      '</div>' +
      '<div class="card-foot">' +
        '<div class="row" style="align-items:flex-start;gap:12px">' +
          '<span class="kpi-icon is-success" style="flex:none">' + UI.ikon('perisai') + '</span>' +
          '<div class="small muted" style="line-height:1.7;max-width:82ch">' +
            '<b style="color:var(--ink)">Kepatuhan UU PDP No. 27/2022 &amp; Permenkes No. 24/2022 (RME).</b> ' +
            'Setiap tindakan otorisasi akun tercatat dalam log audit. Tenaga kesehatan dan kader hanya berhak membuka ' +
            'ringkasan rekam medis pasien PTM sesuai klaster penugasan wilayah masing-masing, demi menjaga kerahasiaan data pasien.' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  },

  pasang() {
    const app = document.getElementById('app');

    const ubahStatus = async (email, status) => {
      const label = status === 'Disetujui' ? 'Setujui Akses Petugas' : 'Tolak / Nonaktifkan Akun';
      const pesan = status === 'Disetujui'
        ? 'Akun ' + email + ' akan memperoleh hak akses modul PTM sesuai peran dan klaster penugasannya.\n\n' +
          'Notifikasi persetujuan dikirim otomatis ke email dinas yang bersangkutan. Lanjutkan?'
        : 'Akun ' + email + ' tidak akan dapat masuk ke sistem.\n\n' +
          'Data akun tetap tersimpan sebagai arsip dan dapat diaktifkan kembali kapan saja. Lanjutkan?';

      if (!await UI.konfirmasi(label, pesan,
        { bahaya: status !== 'Disetujui', ya: status === 'Disetujui' ? 'Ya, Setujui' : 'Ya, Tolak' })) return;

      /* Optimistik: kartu antrean langsung menghilang dan penghitung menyusut,
         sehingga Super Admin dapat memproses antrean beruntun tanpa jeda. */
      const akun = this._d.akun.filter(a => a.email === email)[0];
      const statusLama = akun ? akun.status : null;
      if (akun) akun.status = status;

      const kartu = app.querySelector('[data-tinjau="' + email + '"]');
      const wadah = kartu ? kartu.closest('.metric') : null;
      if (wadah) {
        wadah.style.transition = 'opacity .18s ease, transform .18s ease';
        wadah.style.opacity = '0';
        wadah.style.transform = 'translateX(12px)';
        setTimeout(() => wadah.remove(), 190);
      }
      UI.toast('Akun ' + email + ' di-' + status.toLowerCase() + '.', 'success');

      API.kirimLatar('verifikasiAkun', { email, status }, () => {
        if (akun && statusLama) akun.status = statusLama;
        Router.muat();                                   // gambar ulang keadaan sebenarnya
      });

      // Tarik angka ringkasan terbaru dari server tanpa mengganggu layar.
      setTimeout(() => Router.muat({ diam: true }), 1500);
    };

    app.querySelectorAll('[data-setuju]').forEach(b =>
      b.addEventListener('click', () => ubahStatus(b.dataset.setuju, 'Disetujui')));
    app.querySelectorAll('[data-tolak]').forEach(b =>
      b.addEventListener('click', () => ubahStatus(b.dataset.tolak, 'Ditolak')));

    app.querySelectorAll('[data-tinjau]').forEach(b => b.addEventListener('click', () => {
      const a = this._d.akun.filter(x => x.email === b.dataset.tinjau)[0];
      if (!a) return;
      UI.modal({
        lebar: 'lg',
        judul: 'Tinjau Kredensial — ' + a.nama,
        sub: 'Pastikan NIP/STR dan foto profil sesuai dokumen resmi sebelum menyetujui.',
        isi:
          '<div class="row" style="gap:20px;align-items:flex-start;margin-bottom:20px">' +
            '<div style="width:120px;flex:none">' +
              '<div class="photo-frame">' +
                (a.foto ? '<img src="' + UI.esc(a.foto) + '" alt="Foto profil ' + UI.esc(a.nama) + '">'
                        : '<div class="col center" style="gap:8px;color:var(--ink-3)">' + UI.ikon('orang') +
                          '<span class="tiny">Tanpa foto</span></div>') +
              '</div>' +
            '</div>' +
            '<div class="grow col" style="gap:14px">' +
              UI.fakta('Nama & Gelar', a.nama, { besar: true }) +
              UI.fakta('Email Kedinasan', a.email, { mono: true }) +
              UI.fakta('NIP / STR / No. KTA', a.nip || '-', { mono: true }) +
              UI.fakta('Klaster Penugasan', a.klaster || '-') +
              UI.fakta('Waktu Pengajuan', UI.tanggal(a.dibuat, 'panjang')) +
            '</div>' +
          '</div>' +
          '<div class="callout ' + (a.email.indexOf('@gmail.com') !== -1 ? 'callout-warning' : 'callout-accent') + '">' +
            UI.ikon(a.email.indexOf('@gmail.com') !== -1 ? 'peringatan' : 'cekLingkar') +
            '<div>' + (a.email.indexOf('@gmail.com') !== -1
              ? 'Email menggunakan domain publik (Gmail), bukan domain kedinasan. Pastikan ada SK penugasan resmi ' +
                'dari Kepala Puskesmas sebelum menyetujui akses rekam medis.'
              : 'Domain email kedinasan terverifikasi. Kredensial dapat diproses sesuai prosedur standar.') +
            '</div></div>',
        aksi: [
          { teks: 'Tutup', kelas: 'btn-ghost' },
          { teks: 'Tolak Pengajuan', kelas: 'btn-danger', onClick: () => { ubahStatus(a.email, 'Ditolak'); } },
          { teks: 'Setujui Akses', kelas: 'btn-primary', ikon: 'cek', onClick: () => { ubahStatus(a.email, 'Disetujui'); } }
        ]
      });
    }));

    app.querySelectorAll('[data-pin]').forEach(b => b.addEventListener('click', () => {
      const email = b.dataset.pin;
      UI.modal({
        judul: 'Reset PIN Akses Petugas',
        sub: email,
        isi: '<div class="field"><label class="form-label" for="rp-pin">PIN Baru (6 digit angka)</label>' +
             '<input class="input mono" id="rp-pin" inputmode="numeric" maxlength="6" placeholder="••••••"></div>' +
             '<div class="callout callout-warning">' + UI.ikon('peringatan') +
             '<div>Sampaikan PIN baru kepada petugas melalui kanal pribadi yang aman. ' +
             'Sistem menyimpannya sebagai hash SHA-256 dan tidak dapat menampilkannya kembali.</div></div>',
        aksi: [
          { teks: 'Batal', kelas: 'btn-ghost' },
          { teks: 'Reset PIN', kelas: 'btn-primary', ikon: 'gembok', onClick: async () => {
              const pin = Form.nilai('rp-pin');
              if (!/^\d{6}$/.test(pin)) return Form.salah('rp-pin', 'PIN harus tepat 6 digit angka.');
              const res = await API.kirim('resetPin', { email, pinBaru: pin });
              return res.success;
            } }
        ]
      });
    }));

    document.getElementById('ak-csv').addEventListener('click', () => {
      Ekspor.csv('laporan-verifikasi-akun-' + UI.hariIni(), this._d.akun.map(a => ({
        'Nama': a.nama, 'Email': a.email, 'NIP/STR': a.nip, 'Peran': a.peran,
        'Klaster': a.klaster, 'Status': a.status, 'Terdaftar': a.dibuat, 'Login Terakhir': a.loginTerakhir
      })));
    });
  }
};

/* ==========================================================================
   HALAMAN 12 — PENGATURAN SISTEM PENGINGAT
   ========================================================================== */
PAGES.pengaturan = {
  judul: 'Pengaturan Sistem',
  shell: 'app',
  perluSesi: 'Petugas',
  _edit: 'H1',

  async muat() {
    const d = await API.ambil('getPengaturan');
    if (!d) return UI.kosong('Data tidak dapat dimuat', 'Periksa koneksi lalu muat ulang.', 'peringatan');
    this._d = JSON.parse(JSON.stringify(d));   // salinan kerja agar perubahan dapat dibatalkan
    const g = d.gateway;
    const k = d.kuota;
    const bolehSunting = API.isSuperAdmin();

    return '' +
    '<section class="row-between wrap" style="gap:16px">' +
      '<div>' +
        '<div class="row small muted" style="gap:6px;margin-bottom:8px">Sistem Pengingat › Otomasi Multi-Kanal › Mesin Cron H-3, H-1, H-0</div>' +
        '<h1 style="margin-bottom:6px">' + UI.ikon('gear') + ' Konfigurasi Sistem Pengingat Digital Otomatis</h1>' +
        '<p class="muted" style="margin:0;max-width:78ch">Sinkronisasi jadwal pemanggilan berkala pasien PTM wilayah kerja ' +
          UI.esc(CONFIG.NAMA_FASKES) + '.</p>' +
      '</div>' +
      '<span class="badge badge-' + (d.triggerHarian && d.triggerHarian.aktif ? 'success' : 'warning') + ' badge-lg">' +
        UI.ikon(d.triggerHarian && d.triggerHarian.aktif ? 'cekLingkar' : 'peringatan') +
        (d.triggerHarian && d.triggerHarian.aktif ? 'Automated Trigger Active' : 'Trigger Belum Dipasang') + '</span>' +
    '</section>' +

    (bolehSunting ? '' :
      '<section class="callout callout-warning">' + UI.ikon('gembok') +
        '<div>Anda masuk sebagai <b>Admin</b>. Konfigurasi pengingat global hanya dapat diubah oleh <b>Super Admin</b> ' +
        '(PRD Seksi 3.2). Halaman ini ditampilkan dalam mode baca saja.</div></section>') +

    /* ---------- Status gateway ---------- */
    '<section class="split-even">' +
      '<div class="card card-pad">' +
        '<div class="row-between" style="margin-bottom:14px">' +
          '<div class="row" style="gap:12px">' +
            '<div class="kpi-icon" style="flex:none">' + UI.ikon('segar') + '</div>' +
            '<div><div class="strong">Time-Driven Trigger</div>' +
            '<div class="tiny muted">Google Apps Script API</div></div>' +
          '</div>' +
          '<span class="badge badge-' + (d.triggerHarian && d.triggerHarian.aktif ? 'success' : 'warning') + '">' +
            (d.triggerHarian && d.triggerHarian.aktif ? 'RUNNING' : 'BELUM AKTIF') + '</span>' +
        '</div>' +
        '<div class="col" style="gap:10px;padding-top:14px;border-top:1px solid var(--border)">' +
          UI.fakta('Jadwal Eksekusi', 'Setiap hari pukul 07.00 WIB') +
          UI.fakta('Ukuran Batch', k.batchSize + ' pasien per eksekusi', { mono: true }) +
        '</div>' +
        (d.triggerHarian && d.triggerHarian.aktif ? '' :
          '<div class="callout callout-warning" style="margin-top:14px">' + UI.ikon('peringatan') +
          '<div>Jalankan fungsi <b>pasangTriggerHarian()</b> sekali di editor Apps Script untuk mengaktifkan cron.</div></div>') +
      '</div>' +

      '<div class="card card-pad">' +
        '<div class="row-between" style="margin-bottom:14px">' +
          '<div class="row" style="gap:12px">' +
            '<div class="kpi-icon" style="flex:none">' + UI.ikon('surel') + '</div>' +
            '<div><div class="strong">Gmail Workspace Relay</div>' +
            '<div class="tiny muted">Kuota harian cloud</div></div>' +
          '</div>' +
          '<span class="badge badge-info mono">' + k.terpakai + ' / ' + k.harian + '</span>' +
        '</div>' +
        '<div class="kpi-bar" style="margin-bottom:10px"><span style="width:' +
          (k.harian ? Math.min(100, k.terpakai / k.harian * 100) : 0) + '%"></span></div>' +
        '<div class="row-between tiny muted">' +
          '<span>Terpakai hari ini (' + (k.harian ? Math.round(k.terpakai / k.harian * 100) : 0) + '%)</span>' +
          '<span>Sisa ' + UI.angka(g.emailKuotaSisa > 0 ? g.emailKuotaSisa : k.sisa) + ' email</span>' +
        '</div>' +
        '<div class="row-between small" style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">' +
          '<span class="muted">Rasio Gagal Kirim</span>' +
          '<span class="badge badge-' + (g.bounceRate < 2 ? 'success' : 'warning') + '">' +
            UI.persen(g.bounceRate, 2) + (g.bounceRate < 2 ? ' — Sangat Sehat' : ' — Perlu Dicek') + '</span>' +
        '</div>' +
      '</div>' +

      '<div class="card card-pad">' +
        '<div class="row-between" style="margin-bottom:14px">' +
          '<div class="row" style="gap:12px">' +
            '<div class="kpi-icon is-accent" style="flex:none">' + UI.ikon('pesan') + '</div>' +
            '<div><div class="strong">Fonnte WA Gateway</div>' +
            '<div class="tiny muted">Perangkat multi-device</div></div>' +
          '</div>' +
          '<span class="badge badge-' + (g.fonnteAktif ? 'success' : 'warning') + '">' +
            '<span class="dot ' + (g.fonnteAktif ? 'dot-success' : 'dot-warning') + '"></span>' +
            (g.fonnteAktif ? 'ONLINE' : 'BELUM DIISI') + '</span>' +
        '</div>' +
        '<div class="col" style="gap:10px;padding-top:14px;border-top:1px solid var(--border)">' +
          UI.fakta('Handshake API Key', g.fonnteMask, { mono: true }) +
          UI.fakta('Sisa Kuota Notifikasi', UI.angka(k.sisa) + ' pesan', { mono: true }) +
        '</div>' +
        (bolehSunting
          ? '<div class="field" style="margin:14px 0 0">' +
              '<label class="form-label" for="st-token">Perbarui Token Fonnte</label>' +
              '<input class="input mono" id="st-token" type="password" placeholder="Tempel token baru untuk mengganti">' +
              '<div class="field-hint">Disimpan di Script Properties, bukan di spreadsheet.</div>' +
            '</div>' : '') +
      '</div>' +
    '</section>' +

    /* ---------- Milestone + editor ---------- */
    '<section class="split-wide">' +
      '<div class="stack">' +
        '<div class="row-between wrap">' +
          '<h3 style="margin:0">' + UI.ikon('kalender') + ' Milestone Triggers Pengingat</h3>' +
          '<span class="tiny muted">3 tahapan kunjungan berjalan</span>' +
        '</div>' +
        ['H3', 'H1', 'H0'].map(kode => this._kartuMilestone(kode, d.milestones[kode], bolehSunting)).join('') +
      '</div>' +

      '<div class="stack">' +
        '<div class="card">' +
          '<div class="card-head">' +
            '<div><h4 style="margin:0">' + UI.ikon('pena') + ' Template Editor Studio</h4>' +
            '<p class="card-sub">Klik variabel untuk menyisipkannya di posisi kursor</p></div>' +
            '<span class="badge badge-info" id="st-edit-label">Milestone ' + this._edit.replace('H', 'H-') + '</span>' +
          '</div>' +
          '<div class="card-body">' +
            '<div class="row wrap" style="gap:8px;margin-bottom:14px">' +
              (d.variabelTersedia || []).map(v =>
                '<button class="var-chip" type="button" data-var="' + UI.esc(v) + '">+ ' + UI.esc(v) + '</button>').join('') +
            '</div>' +
            '<textarea class="textarea" id="st-template" rows="9" ' + (bolehSunting ? '' : 'disabled') + '>' +
              UI.esc(d.milestones[this._edit].template) + '</textarea>' +
            '<div class="row-between tiny muted" style="margin-top:8px">' +
              '<span>Mendukung format WhatsApp: *tebal*, _miring_</span>' +
              '<span id="st-hitung" class="mono">0 karakter</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head"><div><h4 style="margin:0">' + UI.ikon('mata') + ' Pratinjau Live Pasien</h4>' +
          '<p class="card-sub">Dirender memakai contoh data rekam medis aktif</p></div></div>' +
          '<div class="card-body">' +
            '<div class="wa-phone">' +
              '<div class="wa-top">' +
                '<div class="avatar" style="width:32px;height:32px;background:var(--accent);color:#fff;font-size:11px">PT</div>' +
                '<div class="grow"><div class="t">PEDULI PTM Official</div>' +
                '<div class="s">Akun Bisnis Terverifikasi</div></div>' +
              '</div>' +
              '<div class="wa-body"><div class="wa-bubble" id="st-pratinjau"></div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head">' +
            '<div><h4 style="margin:0">' + UI.ikon('kirim') + ' Uji Coba Pengiriman (Sandbox)</h4>' +
            '<p class="card-sub">Kirim simulasi tanpa mengganggu antrean pasien sungguhan</p></div>' +
          '</div>' +
          '<div class="card-body">' +
            '<div class="field"><label class="form-label" for="st-nomor">Nomor WhatsApp Tujuan</label>' +
              '<input class="input mono" id="st-nomor" inputmode="tel" placeholder="081234567890"></div>' +
            '<div class="field"><label class="form-label" for="st-email">Alamat Email Tujuan</label>' +
              '<input class="input" id="st-email" type="email" placeholder="tester@puskesmas.go.id"></div>' +
            '<button class="btn btn-accent btn-block" id="st-uji">' + UI.ikon('kirim') + 'Kirim Notifikasi Uji</button>' +
            '<div class="callout callout-neutral" style="margin-top:14px">' + UI.ikon('info') +
              '<div>Isi minimal salah satu tujuan. Pesan uji diberi penanda <b>[UJI COBA SANDBOX]</b>.</div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    (bolehSunting
      ? '<section class="card card-pad">' +
          '<div class="row-between wrap" style="gap:16px">' +
            '<div class="row" style="gap:12px">' +
              '<span class="dot dot-success" style="margin-top:6px"></span>' +
              '<div><div class="strong">Konfigurasi Pengingat Siap Disimpan</div>' +
              '<div class="small muted">Semua perubahan parameter akan langsung memengaruhi cron runner pukul 07.00 WIB berikutnya.</div></div>' +
            '</div>' +
            '<div class="row wrap row-actions" style="gap:10px">' +
              '<button class="btn btn-ghost btn-sm btn-inline" id="st-batal">' + UI.ikon('segar') + 'Batalkan Perubahan</button>' +
              '<button class="btn btn-deep btn-sm btn-inline" id="st-simpan">' + UI.ikon('cekLingkar') + 'Simpan Konfigurasi Reminder</button>' +
            '</div>' +
          '</div>' +
        '</section>'
      : '');
  },

  _kartuMilestone(kode, m, boleh) {
    const info = {
      H3: ['Pemberitahuan Awal Jadwal Kontrol', 'Notifikasi persiapan 3 hari kalender sebelum tanggal kunjungan.', ''],
      H1: ['Konfirmasi Kesiapan & Puasa Lab', 'Panduan puasa darah 8–10 jam untuk evaluasi gula darah & profil lipid.', 'Wajib Puasa'],
      H0: ['Hari-H Kunjungan & Nomor Antrean', 'Pemberitahuan fajar untuk berkas administrasi dan estimasi giliran dokter.', '']
    }[kode];

    return '<div class="card card-pad" data-ms="' + kode + '">' +
      '<div class="row-between wrap" style="gap:16px;margin-bottom:18px">' +
        '<div class="row" style="gap:14px;min-width:0">' +
          '<div class="kpi-icon" style="flex:none;width:44px;height:44px;font-family:var(--font-ui);font-weight:700;font-size:13px">' +
            kode.replace('H', 'H-') + '</div>' +
          '<div style="min-width:0">' +
            '<div class="row wrap" style="gap:8px;margin-bottom:2px">' +
              '<span class="strong">' + UI.esc(info[0]) + '</span>' +
              (info[2] ? '<span class="badge badge-warning">' + UI.esc(info[2]) + '</span>' : '') +
            '</div>' +
            '<div class="small muted">' + UI.esc(info[1]) + '</div>' +
          '</div>' +
        '</div>' +
        '<label class="switch"><input type="checkbox" data-aktif="' + kode + '"' +
          (m.aktif ? ' checked' : '') + (boleh ? '' : ' disabled') +
          ' aria-label="Aktifkan milestone ' + kode + '"><span class="track"></span></label>' +
      '</div>' +

      '<div class="split-even" style="gap:0 16px">' +
        '<div class="field" style="margin-bottom:12px">' +
          '<label class="form-label" for="st-jam-' + kode + '">Jam Pengiriman Otomatis</label>' +
          '<input class="input mono" id="st-jam-' + kode + '" type="time" value="' + UI.esc(m.jam) + '"' +
            (boleh ? '' : ' disabled') + '>' +
        '</div>' +
        '<div class="field" style="margin-bottom:12px">' +
          '<label class="form-label">Kanal Notifikasi</label>' +
          '<div class="row" style="gap:16px">' +
            '<label class="check" style="min-height:40px"><input type="checkbox" data-wa="' + kode + '"' +
              (m.wa ? ' checked' : '') + (boleh ? '' : ' disabled') + '> WhatsApp</label>' +
            '<label class="check" style="min-height:40px"><input type="checkbox" data-email="' + kode + '"' +
              (m.email ? ' checked' : '') + (boleh ? '' : ' disabled') + '> Email</label>' +
          '</div>' +
        '</div>' +
      '</div>' +

      (kode === 'H1'
        ? '<div class="callout callout-accent" style="margin-bottom:12px">' + UI.ikon('info') +
          '<div>Klausul otomatis terlampir: “Pengingat puasa 8–10 jam (hanya minum air putih) sebelum tes laboratorium darah.”</div></div>'
        : '') +

      '<div class="row-between" style="margin-bottom:6px">' +
        '<span class="label-kicker">Pratinjau Template Teks</span>' +
        '<button class="btn btn-xs btn-ghost btn-inline" data-edit="' + kode + '">' + UI.ikon('pena') + 'Edit di Studio</button>' +
      '</div>' +
      '<div class="code-preview" data-tpl="' + kode + '">' + UI.esc(m.template) + '</div>' +
    '</div>';
  },

  pasang() {
    const app = document.getElementById('app');
    const d = this._d;
    const boleh = API.isSuperAdmin();

    /* ---- Pratinjau template ---- */
    const render = () => {
      const t = document.getElementById('st-template').value;
      const isi = t
        .split('{{Nama_Pasien}}').join('Bambang Haryanto')
        .split('{{Nama_Klinik}}').join(CONFIG.NAMA_FASKES)
        .split('{{Tanggal_Kunjungan}}').join(UI.tanggal(UI.hariIni(), 'panjang'))
        .split('{{Jam_Kunjungan}}').join('08:30')
        .split('{{Jenis_PTM}}').join('Hipertensi & Diabetes')
        .split('{{Klaster_Layanan}}').join('Klaster PTM Sehat Utama')
        .split('{{Link_Konfirmasi}}').join('https://peduliptm.id/x987');

      document.getElementById('st-pratinjau').innerHTML =
        UI.escMulti(isi) + '<span class="time">' + d.milestones[this._edit].jam + ' ✓✓</span>';
      document.getElementById('st-hitung').textContent = t.length + ' karakter';
      d.milestones[this._edit].template = t;

      const kode = app.querySelector('[data-tpl="' + this._edit + '"]');
      if (kode) kode.textContent = t;
    };

    const ta = document.getElementById('st-template');
    ta.addEventListener('input', render);
    render();

    /* ---- Sisip variabel ---- */
    app.querySelectorAll('[data-var]').forEach(b => b.addEventListener('click', () => {
      if (!boleh) return UI.toast('Hanya Super Admin yang dapat mengubah template.', 'error');
      const pos = ta.selectionStart || ta.value.length;
      ta.value = ta.value.slice(0, pos) + b.dataset.var + ta.value.slice(pos);
      ta.focus();
      ta.selectionStart = ta.selectionEnd = pos + b.dataset.var.length;
      render();
    }));

    /* ---- Ganti milestone yang disunting ---- */
    app.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
      this._edit = b.dataset.edit;
      ta.value = d.milestones[this._edit].template;
      document.getElementById('st-edit-label').textContent = 'Milestone ' + this._edit.replace('H', 'H-');
      render();
      document.getElementById('st-template').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }));

    /* ---- Sinkronkan kontrol milestone ke salinan kerja ---- */
    ['aktif', 'wa', 'email'].forEach(kunci => {
      app.querySelectorAll('[data-' + kunci + ']').forEach(c => c.addEventListener('change', () => {
        d.milestones[c.dataset[kunci]][kunci] = c.checked;
      }));
    });
    ['H3', 'H1', 'H0'].forEach(kode => {
      const jam = document.getElementById('st-jam-' + kode);
      if (jam) jam.addEventListener('change', () => { d.milestones[kode].jam = jam.value; render(); });
    });

    /* ---- Uji coba ---- */
    document.getElementById('st-uji').addEventListener('click', async () => {
      const nomor = Form.nilai('st-nomor');
      const email = Form.nilai('st-email');
      if (!nomor && !email) return UI.toast('Isi minimal satu tujuan: nomor WhatsApp atau alamat email.', 'error');

      const res = await API.kirim('testReminder', {
        nomor, email, milestone: this._edit.replace('H', 'H-')
      });
      if (res.success && res.data && res.data.pratinjau) {
        UI.modal({
          judul: 'Hasil Uji Coba Sandbox',
          isi: '<div class="label-kicker" style="margin-bottom:8px">Pesan yang dikirim</div>' +
               '<div class="code-preview">' + UI.esc(res.data.pratinjau) + '</div>' +
               '<div class="col" style="gap:8px;margin-top:14px">' +
               (res.data.hasil || []).map(h => '<div class="callout callout-neutral">' + UI.ikon('info') +
                 '<div>' + UI.esc(h) + '</div></div>').join('') + '</div>',
          aksi: [{ teks: 'Tutup', kelas: 'btn-ghost' }]
        });
      }
    });

    if (!boleh) return;

    /* ---- Simpan / batal ---- */
    document.getElementById('st-simpan').addEventListener('click', async () => {
      const muatan = {
        namaFaskes: d.namaFaskes,
        H3: d.milestones.H3, H1: d.milestones.H1, H0: d.milestones.H0
      };
      const token = Form.nilai('st-token');
      if (token) muatan.fonnteToken = token;

      const res = await API.kirim('savePengaturan', muatan);
      if (res.success) Router.muat();
    });

    document.getElementById('st-batal').addEventListener('click', async () => {
      if (await UI.konfirmasi('Batalkan Perubahan',
        'Seluruh perubahan yang belum disimpan akan dikembalikan ke konfigurasi tersimpan. Lanjutkan?')) Router.muat();
    });
  }
};
