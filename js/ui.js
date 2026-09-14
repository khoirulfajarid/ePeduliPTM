/* ==========================================================================
   PEDULI PTM — ui.js
   Komponen antarmuka, ikon, pemformat, dan grafik SVG (tanpa pustaka luar).
   ========================================================================== */

const UI = {

  /* ======================================================================
     IKON — SVG garis 24x24 (stroke), ukuran diatur lewat CSS
     ====================================================================== */
  _paths: {
    dashboard:  '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    pasien:     '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    kalender:   '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    jadwal:     '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>',
    megafon:    '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M16 8a5 5 0 0 1 0 8"/>',
    laporan:    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 17v-5M12 17V7M16 17v-8"/>',
    perisai:    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    gear:       '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8.9 19a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 5 8.9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    cari:       '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    lonceng:    '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    cek:        '<path d="M20 6 9 17l-5-5"/>',
    cekLingkar: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    silang:     '<path d="M18 6 6 18M6 6l12 12"/>',
    plus:       '<path d="M12 5v14M5 12h14"/>',
    tambahOrang:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    unduh:      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
    cetak:      '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
    segar:      '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
    pesan:      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    pesanCek:   '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="m8 10 2.5 2.5L16 7"/>',
    surel:      '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    telepon:    '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    jam:        '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    pasirJam:   '<path d="M5 22h14M5 2h14M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V22M7 2v4.2c0 .5.2 1 .6 1.4L12 12l4.4-4.4c.4-.4.6-.9.6-1.4V2"/>',
    lokasi:     '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    berkas:     '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    gambar:     '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    unggah:     '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
    pil:        '<path d="M10.5 20.5a7.1 7.1 0 0 1-10-10l6-6a7.1 7.1 0 0 1 10 10z"/><path d="m8.5 8.5 7 7"/>',
    denyut:     '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    tetes:      '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"/>',
    target:     '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    naik:       '<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
    turun:      '<path d="M22 17 13.5 8.5 8.5 13.5 2 7"/><path d="M16 17h6v-6"/>',
    info:       '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    peringatan: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    gembok:     '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    keluar:     '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    panahKiri:  '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    panahKanan: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    menu:       '<path d="M3 12h18M3 6h18M3 18h18"/>',
    filter:     '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    pena:       '<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
    sampah:     '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    mata:       '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    kirim:      '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
    tiket:      '<path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-6z"/><path d="M13 5v14"/>',
    rumahSakit: '<path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M12 9v6M9 12h6"/>',
    grafik:     '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    orang:      '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    stetoskop:  '<path d="M4 3v6a5 5 0 0 0 10 0V3"/><path d="M4 3h2M12 3h2"/><circle cx="19" cy="16" r="3"/><path d="M9 14v1a7 7 0 0 0 7 7h.5"/>'
  },

  /** Hasilkan markup SVG untuk nama ikon tertentu. */
  ikon(nama, kelas) {
    const d = this._paths[nama] || this._paths.info;
    return '<svg class="' + (kelas || '') + '" viewBox="0 0 24 24" fill="none" ' +
           'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
           'stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  },

  /* ======================================================================
     KEAMANAN & PEMFORMAT
     ====================================================================== */

  /** Lolos-karakter HTML. WAJIB dipakai untuk setiap nilai dari server. */
  esc(v) {
    if (v === null || v === undefined) return '';
    return String(v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },

  /** Sama seperti esc(), tetapi baris baru dipertahankan sebagai <br>. */
  escMulti(v) {
    return this.esc(v).split('\n').join('<br>');
  },

  angka(n) {
    const v = Number(n);
    return isNaN(v) ? '0' : v.toLocaleString('id-ID');
  },

  persen(n, desimal) {
    const v = Number(n);
    return (isNaN(v) ? 0 : v).toFixed(desimal === undefined ? 1 : desimal) + '%';
  },

  tanggal(iso, gaya) {
    if (!iso) return '-';
    const d = new Date(String(iso).length <= 10 ? iso + 'T00:00:00' : iso);
    if (isNaN(d.getTime())) return this.esc(iso);

    const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const BLN  = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const BLNP = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    if (gaya === 'panjang') return HARI[d.getDay()] + ', ' + d.getDate() + ' ' + BLN[d.getMonth()] + ' ' + d.getFullYear();
    if (gaya === 'pendek')  return d.getDate() + ' ' + BLNP[d.getMonth()] + ' ' + d.getFullYear();
    if (gaya === 'waktu')   return d.getDate() + ' ' + BLNP[d.getMonth()] + ', ' + this._duaDigit(d.getHours()) + ':' + this._duaDigit(d.getMinutes());
    return d.getDate() + ' ' + BLN[d.getMonth()] + ' ' + d.getFullYear();
  },

  _duaDigit(n) { return n < 10 ? '0' + n : String(n); },

  hariIni() {
    const d = new Date();
    return d.getFullYear() + '-' + this._duaDigit(d.getMonth() + 1) + '-' + this._duaDigit(d.getDate());
  },

  formatUkuran(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(0) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  },

  /** Inisial untuk avatar, contoh: "Bpk. Hendra Gunawan" → "HG" */
  inisial(nama) {
    const kata = String(nama || '?')
      .replace(/^(Bpk\.|Ibu|Tn\.|Ny\.|dr\.|Ns\.|H\.|Hj\.)\s*/gi, '')
      .trim().split(/\s+/);
    return ((kata[0] || '?')[0] + (kata[1] ? kata[1][0] : '')).toUpperCase();
  },

  /** Avatar: gunakan foto bila ada, jika tidak tampilkan inisial. */
  avatar(nama, foto, kelas) {
    const k = 'avatar ' + (kelas || '');
    if (foto && /^https?:\/\//.test(foto)) {
      return '<img class="' + k + '" src="' + this.esc(foto) + '" alt="Foto ' + this.esc(nama) +
             '" loading="lazy" onerror="this.outerHTML=UI.avatarInisial(' +
             JSON.stringify(String(nama)).replace(/"/g, '&quot;') + ',\'' + (kelas || '') + '\')">';
    }
    return this.avatarInisial(nama, kelas);
  },

  avatarInisial(nama, kelas) {
    return '<span class="avatar ' + (kelas || '') + '" aria-hidden="true">' + this.inisial(nama) + '</span>';
  },

  /* ======================================================================
     BADGE SEMANTIK
     ====================================================================== */

  badgePtm(jenis) {
    const peta = {
      'Hipertensi':      'badge-danger',
      'Diabetes Melitus':'badge-info',
      'Hipertensi & DM': 'badge-warning'
    };
    return '<span class="badge ' + (peta[jenis] || 'badge-neutral') + '">' + this.esc(jenis || '-') + '</span>';
  },

  badgeReminder(status) {
    const s = String(status || '');
    if (s.indexOf('H-0') !== -1) return '<span class="badge badge-solid">' + this.ikon('pesanCek') + this.esc(s) + '</span>';
    if (s.indexOf('H-1') !== -1) return '<span class="badge badge-info">' + this.ikon('pesanCek') + this.esc(s) + '</span>';
    if (s.indexOf('H-3') !== -1) return '<span class="badge badge-info">' + this.ikon('pesanCek') + this.esc(s) + '</span>';
    return '<span class="badge badge-neutral">' + this.ikon('jam') + 'Belum Terkirim</span>';
  },

  badgeKehadiran(status) {
    if (status === 'Sudah Berkunjung') {
      return '<span class="badge badge-success">' + this.ikon('cekLingkar') + 'Sudah Berkunjung</span>';
    }
    if (status === 'Tidak Hadir') {
      return '<span class="badge badge-danger">' + this.ikon('silang') + 'Tidak Hadir</span>';
    }
    return '<span class="badge badge-neutral">' + this.ikon('pasirJam') + 'Menunggu</span>';
  },

  /** Klasifikasi tekanan darah menurut ambang Kemenkes. */
  klasifikasiTensi(sis, dia) {
    const s = Number(sis), d = Number(dia);
    if (!s || !d) return { label: 'Belum diukur', kelas: 'badge-neutral', warna: 'var(--ink-3)' };
    if (s >= 160 || d >= 100) return { label: 'Tingkat 2 — Rujuk', kelas: 'badge-danger', warna: 'var(--danger)' };
    if (s >= 140 || d >= 90)  return { label: 'Tingkat 1', kelas: 'badge-warning', warna: 'var(--warning)' };
    if (s >= 130 || d >= 85)  return { label: 'Pre-Hipertensi', kelas: 'badge-warning', warna: 'var(--warning)' };
    return { label: 'Terkontrol', kelas: 'badge-success', warna: 'var(--success)' };
  },

  /** Klasifikasi gula darah puasa. */
  klasifikasiGdp(gdp) {
    const v = Number(gdp);
    if (!v) return { label: 'Belum diukur', kelas: 'badge-neutral', warna: 'var(--ink-3)' };
    if (v >= 250) return { label: 'Sangat Tinggi — Rujuk', kelas: 'badge-danger', warna: 'var(--danger)' };
    if (v >= 126) return { label: 'Di Atas Target', kelas: 'badge-warning', warna: 'var(--warning)' };
    if (v >= 100) return { label: 'Mendekati Target', kelas: 'badge-info', warna: 'var(--info)' };
    return { label: 'Terkontrol', kelas: 'badge-success', warna: 'var(--success)' };
  },

  /* ======================================================================
     NOTIFIKASI, DIALOG, INDIKATOR MUAT
     ====================================================================== */

  toast(pesan, tipe) {
    const host = document.getElementById('toast');
    if (!host || !pesan) return;

    const t = tipe || 'info';
    const ikon = t === 'success' ? 'cekLingkar' : t === 'error' ? 'peringatan' : 'info';
    const el = document.createElement('div');
    el.className = 'toast toast-' + t;
    el.innerHTML = this.ikon(ikon) + '<div>' + this.esc(pesan) + '</div>';
    host.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(16px)';
      el.style.transition = 'all .2s ease';
      setTimeout(() => el.remove(), 220);
    }, t === 'error' ? 6000 : 3800);
  },

  loading(tampil) {
    const el = document.getElementById('loader');
    if (!el) return;
    el.classList.toggle('hidden', !tampil);
    el.setAttribute('aria-hidden', tampil ? 'false' : 'true');
  },

  /**
   * Tampilkan dialog. opsi = { judul, isi, aksi:[{teks,kelas,onClick}], lebar, tanpaTutup }
   */
  modal(opsi) {
    const host = document.getElementById('modal');
    const o = opsi || {};

    const tombol = (o.aksi || []).map((a, i) =>
      '<button class="btn ' + (a.kelas || 'btn-ghost') + '" data-aksi="' + i + '">' +
      (a.ikon ? this.ikon(a.ikon) : '') + this.esc(a.teks) + '</button>'
    ).join('');

    host.innerHTML =
      '<div class="modal-scrim" role="dialog" aria-modal="true" aria-label="' + this.esc(o.judul || 'Dialog') + '">' +
        '<div class="modal ' + (o.lebar === 'lg' ? 'modal-lg' : '') + '">' +
          (o.aksenAtas ? '<div class="modal-accent-top"></div>' : '') +
          '<div class="modal-head">' +
            '<div>' +
              (o.kicker ? '<div class="label-kicker" style="margin-bottom:6px">' + this.esc(o.kicker) + '</div>' : '') +
              '<h3 class="card-title">' + this.esc(o.judul || '') + '</h3>' +
              (o.sub ? '<p class="card-sub">' + this.esc(o.sub) + '</p>' : '') +
            '</div>' +
            (o.tanpaTutup ? '' : '<button class="btn-icon btn" data-tutup aria-label="Tutup dialog">' + this.ikon('silang') + '</button>') +
          '</div>' +
          '<div class="modal-body">' + (o.isi || '') + '</div>' +
          (tombol ? '<div class="modal-foot">' + tombol + '</div>' : '') +
        '</div>' +
      '</div>';

    const scrim = host.querySelector('.modal-scrim');
    const tutup = () => { host.innerHTML = ''; document.removeEventListener('keydown', esc); };
    const esc = (e) => { if (e.key === 'Escape' && !o.tanpaTutup) tutup(); };

    document.addEventListener('keydown', esc);
    if (!o.tanpaTutup) {
      scrim.addEventListener('click', (e) => { if (e.target === scrim) tutup(); });
      const btnTutup = host.querySelector('[data-tutup]');
      if (btnTutup) btnTutup.addEventListener('click', tutup);
    }

    host.querySelectorAll('[data-aksi]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const a = o.aksi[Number(btn.dataset.aksi)];
        if (a.onClick) {
          const hasil = await a.onClick(host);
          if (hasil === false) return;   // aksi membatalkan penutupan
        }
        tutup();
      });
    });

    const fokus = host.querySelector('input, textarea, select, button');
    if (fokus) setTimeout(() => fokus.focus(), 60);
    return { tutup };
  },

  tutupModal() { document.getElementById('modal').innerHTML = ''; },

  /** Dialog konfirmasi. Mengembalikan Promise<boolean>. */
  konfirmasi(judul, pesan, opsi) {
    const o = opsi || {};
    return new Promise((selesai) => {
      let dijawab = false;
      this.modal({
        judul,
        isi: '<p class="muted" style="margin:0;line-height:1.7">' + this.escMulti(pesan) + '</p>',
        aksi: [
          { teks: o.batal || 'Batal', kelas: 'btn-ghost', onClick: () => { dijawab = true; selesai(false); } },
          { teks: o.ya || 'Ya, Lanjutkan', kelas: o.bahaya ? 'btn-danger' : 'btn-primary',
            onClick: () => { dijawab = true; selesai(true); } }
        ]
      });
      // Bila ditutup via Escape / klik latar, anggap dibatalkan.
      const pantau = setInterval(() => {
        if (!document.querySelector('.modal-scrim')) {
          clearInterval(pantau);
          if (!dijawab) selesai(false);
        }
      }, 180);
    });
  },

  /* ======================================================================
     BLOK ANTARMUKA SIAP PAKAI
     ====================================================================== */

  kpi(o) {
    return '<div class="kpi">' +
      '<div class="kpi-top">' +
        '<div class="kpi-label">' + this.esc(o.label) + '</div>' +
        '<div class="kpi-icon ' + (o.nada ? 'is-' + o.nada : '') + '">' + this.ikon(o.ikon) + '</div>' +
      '</div>' +
      '<div class="kpi-value ' + (o.nilaiNada ? 'is-' + o.nilaiNada : '') + '">' +
        '<span>' + this.esc(o.nilai) + '</span>' +
        (o.unit ? '<span class="unit">' + this.esc(o.unit) + '</span>' : '') +
      '</div>' +
      (o.kaki ? '<div class="kpi-foot">' + o.kaki + '</div>' : '') +
      (o.progres !== undefined
        ? '<div class="kpi-bar"><span style="width:' + Math.max(0, Math.min(100, o.progres)) + '%;' +
          (o.progresWarna ? 'background:' + o.progresWarna : '') + '"></span></div>' : '') +
      (o.garis ? '<div class="kpi-accent-line is-' + o.garis + '"></div>' : '') +
    '</div>';
  },

  kosong(judul, pesan, ikon) {
    return '<div class="empty">' +
      '<div class="empty-icon">' + this.ikon(ikon || 'berkas') + '</div>' +
      '<h4>' + this.esc(judul) + '</h4>' +
      '<p>' + this.esc(pesan) + '</p>' +
    '</div>';
  },

  skeleton(baris) {
    let s = '';
    for (let i = 0; i < (baris || 3); i++) {
      s += '<div class="skeleton sk-line" style="width:' + (100 - i * 12) + '%"></div>';
    }
    return s;
  },

  /** Panel kecil untuk menampilkan sepasang label + nilai. */
  fakta(label, nilai, opsi) {
    const o = opsi || {};
    return '<div>' +
      '<div class="label-kicker">' + this.esc(label) + '</div>' +
      '<div class="' + (o.mono ? 'mono ' : '') + 'strong" style="margin-top:3px;font-size:' + (o.besar ? '15px' : '14px') + '">' +
        (o.html || this.esc(nilai || '-')) + '</div>' +
    '</div>';
  },

  /* ======================================================================
     GRAFIK SVG
     Aturan yang ditegakkan di sini:
     · ujung batang membulat 4px, jeda 2px antarbatang
     · grid tipis & resesif, tanpa garis vertikal
     · legenda selalu ada untuk ≥ 2 deret + label langsung selektif
     · tooltip hover pada setiap mark
     · teks memakai token tinta, bukan warna deret
     ====================================================================== */

  _tooltipSvg() {
    let tip = document.getElementById('chart-tip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'chart-tip';
      tip.style.cssText =
        'position:fixed;z-index:200;pointer-events:none;opacity:0;transition:opacity .12s;' +
        'background:#1a2b3c;color:#fff;padding:8px 11px;border-radius:8px;font-size:12px;' +
        "font-family:'Inter',sans-serif;line-height:1.5;box-shadow:0 6px 20px rgba(0,0,0,.22);max-width:220px";
      document.body.appendChild(tip);
    }
    return tip;
  },

  /** Pasang perilaku hover pada seluruh elemen [data-tip] di dalam wadah. */
  aktifkanTooltip(wadah) {
    const tip = this._tooltipSvg();
    wadah.querySelectorAll('[data-tip]').forEach((el) => {
      el.style.cursor = 'pointer';
      el.addEventListener('mouseenter', (e) => {
        tip.innerHTML = el.dataset.tip;
        tip.style.opacity = '1';
        this._posisiTip(tip, e);
      });
      el.addEventListener('mousemove', (e) => this._posisiTip(tip, e));
      el.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
    });
  },

  _posisiTip(tip, e) {
    const pad = 14;
    let x = e.clientX + pad;
    let y = e.clientY - tip.offsetHeight - 8;
    if (x + tip.offsetWidth > window.innerWidth - 8) x = e.clientX - tip.offsetWidth - pad;
    if (y < 8) y = e.clientY + pad;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  },

  /**
   * Batang berkelompok — dua deret (mis. Terjadwal vs Hadir Tepat Waktu).
   * data: [{ label, terjadwal, hadir, persen }]
   */
  chartBatangGrup(data, opsi) {
    const o = opsi || {};
    const namaA = o.namaA || 'Terjadwal';
    const namaB = o.namaB || 'Hadir Tepat Waktu';
    const warnaA = CONFIG.WARNA_CHART[0];
    const warnaB = CONFIG.WARNA_CHART[1];

    if (!data || !data.length) return this.kosong('Belum ada data tren', 'Data kunjungan akan muncul setelah ada riwayat kepatuhan tercatat.', 'grafik');

    const W = 640, H = 260;
    const M = { atas: 26, kanan: 12, bawah: 34, kiri: 42 };
    const plotW = W - M.kiri - M.kanan;
    const plotH = H - M.atas - M.bawah;

    const maks = Math.max(1, ...data.map(d => Math.max(d.terjadwal || 0, d.hadir || 0)));
    const skalaAtas = Math.ceil(maks / 4) * 4 || 4;
    const y = (v) => M.atas + plotH - (v / skalaAtas) * plotH;

    const lebarGrup = plotW / data.length;
    const lebarBatang = Math.min(26, (lebarGrup - 14) / 2 - 1);   // jeda 2px antarbatang
    let svg = '';

    // Grid horizontal resesif + label sumbu Y
    for (let i = 0; i <= 4; i++) {
      const v = (skalaAtas / 4) * i;
      const yy = y(v);
      svg += '<line x1="' + M.kiri + '" y1="' + yy + '" x2="' + (W - M.kanan) + '" y2="' + yy +
             '" stroke="var(--grid-line)" stroke-width="1"/>';
      svg += '<text x="' + (M.kiri - 9) + '" y="' + (yy + 4) + '" text-anchor="end" ' +
             'font-size="10" font-family="Inter" fill="var(--ink-3)">' + v + '</text>';
    }

    data.forEach((d, i) => {
      const pusat = M.kiri + lebarGrup * i + lebarGrup / 2;
      const xA = pusat - lebarBatang - 1;
      const xB = pusat + 1;
      const tinggiA = Math.max(2, M.atas + plotH - y(d.terjadwal || 0));
      const tinggiB = Math.max(2, M.atas + plotH - y(d.hadir || 0));

      const tipA = '<b>' + this.esc(d.label) + '</b><br>' + namaA + ': ' + this.angka(d.terjadwal);
      const tipB = '<b>' + this.esc(d.label) + '</b><br>' + namaB + ': ' + this.angka(d.hadir) +
                   '<br>Kepatuhan: ' + this.persen(d.persen);

      svg += '<rect x="' + xA + '" y="' + y(d.terjadwal || 0) + '" width="' + lebarBatang +
             '" height="' + tinggiA + '" rx="4" fill="' + warnaA + '" fill-opacity=".28" data-tip="' + tipA + '"/>';
      svg += '<rect x="' + xB + '" y="' + y(d.hadir || 0) + '" width="' + lebarBatang +
             '" height="' + tinggiB + '" rx="4" fill="' + warnaB + '" data-tip="' + tipB + '"/>';

      // Label langsung hanya pada kolom terakhir — selektif, bukan semua titik.
      if (i === data.length - 1) {
        svg += '<text x="' + (xB + lebarBatang / 2) + '" y="' + (y(d.hadir || 0) - 8) +
               '" text-anchor="middle" font-size="11" font-weight="700" font-family="Inter" ' +
               'fill="var(--ink)">' + this.persen(d.persen, 1) + '</text>';
      }

      svg += '<text x="' + pusat + '" y="' + (H - 12) + '" text-anchor="middle" font-size="11" ' +
             'font-family="Inter" fill="var(--ink-2)">' + this.esc(d.label) + '</text>';
    });

    return '<div class="chart-box">' +
      '<div class="chart-legend" style="margin-bottom:12px">' +
        '<span class="lg"><span class="sw" style="background:' + warnaA + ';opacity:.35"></span>' + this.esc(namaA) + '</span>' +
        '<span class="lg"><span class="sw" style="background:' + warnaB + '"></span>' + this.esc(namaB) + '</span>' +
      '</div>' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik batang perbandingan ' +
        this.esc(namaA) + ' dan ' + this.esc(namaB) + ' per bulan">' + svg + '</svg>' +
    '</div>';
  },

  /**
   * Batang tunggal untuk persentase per bulan (dashboard ringkas).
   * data: [{ label, persen }]
   */
  chartBatangPersen(data) {
    if (!data || !data.length) return '<p class="muted small">Belum ada data tren.</p>';

    const W = 320, H = 132, M = { atas: 22, bawah: 22, kiri: 4, kanan: 4 };
    const plotH = H - M.atas - M.bawah;
    const lebarGrup = (W - M.kiri - M.kanan) / data.length;
    const lebarBatang = Math.min(34, lebarGrup - 14);
    const warna = CONFIG.WARNA_CHART[0];
    let svg = '';

    data.forEach((d, i) => {
      const p = Math.max(0, Math.min(100, Number(d.persen) || 0));
      const tinggi = Math.max(3, (p / 100) * plotH);
      const x = M.kiri + lebarGrup * i + (lebarGrup - lebarBatang) / 2;
      const yy = M.atas + plotH - tinggi;
      const terakhir = i === data.length - 1;

      svg += '<rect x="' + x + '" y="' + yy + '" width="' + lebarBatang + '" height="' + tinggi +
             '" rx="4" fill="' + (terakhir ? 'var(--info)' : warna) + '" fill-opacity="' +
             (terakhir ? '1' : (0.28 + i * 0.16).toFixed(2)) + '" data-tip="<b>' + this.esc(d.label) +
             '</b><br>Kepatuhan: ' + this.persen(p) + '"/>';

      svg += '<text x="' + (x + lebarBatang / 2) + '" y="' + (yy - 7) + '" text-anchor="middle" ' +
             'font-size="10" font-weight="' + (terakhir ? '700' : '500') + '" font-family="Inter" ' +
             'fill="var(--ink' + (terakhir ? '' : '-2') + ')">' + p.toFixed(0) + '%</text>';

      svg += '<text x="' + (x + lebarBatang / 2) + '" y="' + (H - 6) + '" text-anchor="middle" ' +
             'font-size="10" font-family="Inter" fill="var(--ink-2)">' + this.esc(d.label) + '</text>';
    });

    return '<div class="chart-box"><svg viewBox="0 0 ' + W + ' ' + H +
           '" role="img" aria-label="Tren kepatuhan bulanan">' + svg + '</svg></div>';
  },

  /**
   * Donat distribusi kategori.
   * data: [{ label, jumlah }]  — maksimum 3 kategori sesuai palet tervalidasi.
   */
  chartDonat(data, opsi) {
    const o = opsi || {};
    const total = (data || []).reduce((s, d) => s + (Number(d.jumlah) || 0), 0);
    if (!total) return this.kosong('Belum ada kasus terdata', 'Distribusi diagnosis akan tampil setelah data pasien terisi.', 'grafik');

    const S = 180, R = 70, TEBAL = 22, C = S / 2;
    const keliling = 2 * Math.PI * R;
    let offset = 0;
    let busur = '';
    let legenda = '';

    data.forEach((d, i) => {
      const jumlah = Number(d.jumlah) || 0;
      const rasio = jumlah / total;
      const warna = CONFIG.WARNA_CHART[i % CONFIG.WARNA_CHART.length];
      // Kurangi 2px dari panjang busur → jeda permukaan antarsegmen.
      const panjang = Math.max(0, rasio * keliling - 2);

      busur += '<circle cx="' + C + '" cy="' + C + '" r="' + R + '" fill="none" stroke="' + warna +
               '" stroke-width="' + TEBAL + '" stroke-linecap="round" ' +
               'stroke-dasharray="' + panjang + ' ' + (keliling - panjang) + '" ' +
               'stroke-dashoffset="' + (-offset) + '" ' +
               'transform="rotate(-90 ' + C + ' ' + C + ')" ' +
               'data-tip="<b>' + this.esc(d.label) + '</b><br>' + this.angka(jumlah) +
               ' pasien (' + this.persen(rasio * 100, 0) + ')"/>';
      offset += rasio * keliling;

      legenda += '<div class="li">' +
        '<span class="sw" style="background:' + warna + '"></span>' +
        '<span>' + this.esc(d.label) + '</span>' +
        '<span class="v">' + this.persen(rasio * 100, 0) + '</span>' +
      '</div>';
    });

    return '<div class="donut-wrap">' +
      '<div class="chart-box" style="width:180px;flex:none">' +
        '<svg viewBox="0 0 ' + S + ' ' + S + '" role="img" aria-label="Diagram donat distribusi kasus PTM">' +
          busur +
          '<text x="' + C + '" y="' + (C - 2) + '" text-anchor="middle" font-size="26" font-weight="700" ' +
            'font-family="Inter" fill="var(--ink)">' + this.angka(total) + '</text>' +
          '<text x="' + C + '" y="' + (C + 16) + '" text-anchor="middle" font-size="10" ' +
            'font-family="Inter" fill="var(--ink-2)">' + this.esc(o.satuan || 'Kasus Aktif') + '</text>' +
        '</svg>' +
      '</div>' +
      '<div class="donut-legend">' + legenda + '</div>' +
    '</div>';
  },

  /** Cincin persentase tunggal (tingkat kepatuhan pasien). */
  chartCincin(persen, opsi) {
    const o = opsi || {};
    const p = Math.max(0, Math.min(100, Number(persen) || 0));
    const S = 112, R = 46, C = S / 2, TEBAL = 9;
    const keliling = 2 * Math.PI * R;
    const isi = (p / 100) * keliling;
    const warna = p >= 85 ? 'var(--success)' : p >= 70 ? 'var(--warning)' : 'var(--danger)';

    return '<div class="chart-box" style="width:' + (o.ukuran || 112) + 'px;flex:none">' +
      '<svg viewBox="0 0 ' + S + ' ' + S + '" role="img" aria-label="Tingkat kepatuhan ' + this.persen(p) + '">' +
        '<circle cx="' + C + '" cy="' + C + '" r="' + R + '" fill="none" stroke="var(--grid-line)" stroke-width="' + TEBAL + '"/>' +
        '<circle cx="' + C + '" cy="' + C + '" r="' + R + '" fill="none" stroke="' + warna + '" ' +
          'stroke-width="' + TEBAL + '" stroke-linecap="round" ' +
          'stroke-dasharray="' + isi + ' ' + (keliling - isi) + '" ' +
          'transform="rotate(-90 ' + C + ' ' + C + ')"/>' +
        '<text x="' + C + '" y="' + (C + 6) + '" text-anchor="middle" font-size="21" font-weight="700" ' +
          'font-family="Inter" fill="var(--ink)">' + p.toFixed(1) + '%</text>' +
      '</svg>' +
    '</div>';
  },

  /** Garis tren ringkas untuk deret nilai klinis. */
  chartSparkline(nilai, opsi) {
    const o = opsi || {};
    const v = (nilai || []).map(Number).filter(n => !isNaN(n) && n > 0);
    if (v.length < 2) return '<p class="tiny muted" style="margin:0">Butuh minimal 2 pengukuran untuk menampilkan tren.</p>';

    const W = 260, H = 56, P = 6;
    const min = Math.min(...v), maks = Math.max(...v);
    const rentang = (maks - min) || 1;
    const dx = (W - P * 2) / (v.length - 1);
    const titik = v.map((n, i) => [P + i * dx, H - P - ((n - min) / rentang) * (H - P * 2)]);

    const garis = titik.map((t, i) => (i ? 'L' : 'M') + t[0].toFixed(1) + ' ' + t[1].toFixed(1)).join(' ');
    const warna = o.warna || CONFIG.WARNA_CHART[0];

    let mark = '';
    titik.forEach((t, i) => {
      const akhir = i === titik.length - 1;
      mark += '<circle cx="' + t[0].toFixed(1) + '" cy="' + t[1].toFixed(1) + '" r="' + (akhir ? 5 : 4) +
              '" fill="' + (akhir ? 'var(--accent)' : warna) + '" stroke="#fff" stroke-width="2" ' +
              'data-tip="Pengukuran ke-' + (i + 1) + ': <b>' + v[i] + (o.satuan ? ' ' + o.satuan : '') + '</b>"/>';
    });

    return '<div class="chart-box"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' +
      this.esc(o.label || 'Tren pengukuran') + '">' +
      '<path d="' + garis + '" fill="none" stroke="' + warna + '" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round"/>' + mark +
    '</svg></div>';
  }
};
