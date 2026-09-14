/* ==========================================================================
   PEDULI PTM — pages.js  (bagian 1)
   Halaman publik: Portal Open Access, Login & Verifikasi, Portal Pasien.
   Setiap halaman: { judul, shell, muat(params) → html, pasang() }
   ========================================================================== */

const PAGES = {};

/* ==========================================================================
   PEMBANTU FORMULIR
   ========================================================================== */
const Form = {
  nilai(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked;
    return el.value.trim();
  },
  set(id, v) { const el = document.getElementById(id); if (el) el.value = v; },
  kumpul(ids) {
    const o = {};
    ids.forEach(id => { o[id] = this.nilai(id); });
    return o;
  },
  /** Tandai input bermasalah lalu fokuskan. Mengembalikan false agar mudah di-return. */
  salah(id, pesan) {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute('aria-invalid', 'true');
      el.focus();
      el.addEventListener('input', () => el.removeAttribute('aria-invalid'), { once: true });
    }
    UI.toast(pesan, 'error');
    return false;
  },
  sibuk(btn, sibuk, teksSibuk) {
    if (!btn) return;
    if (sibuk) {
      btn.dataset.teksAsli = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = teksSibuk || 'Memproses…';
    } else {
      btn.disabled = false;
      if (btn.dataset.teksAsli) btn.innerHTML = btn.dataset.teksAsli;
    }
  }
};

/* ==========================================================================
   HALAMAN 1 — PORTAL PUBLIK (OPEN ACCESS)
   ========================================================================== */
PAGES.publik = {
  judul: 'Beranda',
  shell: 'publik',

  async muat() {
    const info = await API.ambil('publicInfo', {}, { diam: true }) || {};
    this._info = info;

    return '' +
    '<div class="public-wrap">' +

      /* ---------- Hero + kartu aksi ---------- */
      '<section class="public-hero">' +
        '<div>' +
          '<span class="badge badge-info badge-lg">' + UI.ikon('denyut') + 'Program Pengendalian PTM Nasional</span>' +
          '<h1 style="margin:16px 0 12px">Portal Pemantauan Mandiri Pasien Penyakit Tidak Menular</h1>' +
          '<p class="lead">Pantau jadwal kontrol rutin, terima pengingat otomatis lewat WhatsApp dan email, ' +
            'serta lihat riwayat kepatuhan kunjungan Anda — tanpa perlu datang ke loket hanya untuk bertanya.</p>' +
          '<div class="stat-row">' +
            '<div class="stat"><div class="v mono">' + UI.angka(info.totalPasien || 0) + '</div><div class="l">Pasien Terdata</div></div>' +
            '<div class="stat"><div class="v mono">' + UI.persen(info.tingkatKepatuhan || 0) + '</div><div class="l">Kepatuhan Kontrol</div></div>' +
            '<div class="stat"><div class="v mono">' + UI.angka(info.klasterAktif || 0) + '</div><div class="l">Klaster Layanan</div></div>' +
          '</div>' +
        '</div>' +

        '<div class="card card-pad">' +
          '<div class="row-between" style="margin-bottom:16px">' +
            '<h3 style="margin:0">Cek Jadwal Kontrol Anda</h3>' +
            '<span class="badge badge-success">' + UI.ikon('gembok') + 'Aman</span>' +
          '</div>' +
          '<p class="small muted" style="margin-bottom:20px">Masukkan NIK dan 4 digit terakhir nomor HP yang terdaftar di Posbindu.</p>' +

          '<div class="field">' +
            '<label class="form-label" for="pub-nik">NIK (16 digit KTP)<span class="req">*</span></label>' +
            '<input class="input mono" id="pub-nik" inputmode="numeric" maxlength="16" placeholder="3174xxxxxxxxxxxx" autocomplete="off">' +
          '</div>' +
          '<div class="field">' +
            '<label class="form-label" for="pub-hp">4 Digit Terakhir No. HP<span class="req">*</span></label>' +
            '<input class="input mono" id="pub-hp" inputmode="numeric" maxlength="4" placeholder="9900" autocomplete="off">' +
          '</div>' +

          '<button class="btn btn-primary btn-block" id="pub-masuk">' + UI.ikon('panahKanan') + 'Lihat Jadwal & Riwayat Saya</button>' +

          '<div class="callout callout-neutral" style="margin-top:16px">' + UI.ikon('info') +
            '<div>Belum terdaftar sebagai pasien binaan? ' +
            '<a href="#" id="pub-daftar"><b>Daftar mandiri di sini</b></a> — petugas akan menghubungi Anda untuk penjadwalan.</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      /* ---------- Tiga kartu informasi ---------- */
      '<section style="margin-top:8px">' +
        '<h2 style="margin-bottom:6px">Cara Kerja Sistem Pengingat</h2>' +
        '<p class="muted" style="margin-bottom:24px">Tiga lapis pengingat memastikan Anda tidak melewatkan jadwal kontrol.</p>' +
        '<div class="info-grid">' +
          this._kartuInfo('kalender', 'Pengingat H-3', 'Tiga hari sebelum jadwal, Anda menerima pesan berisi tanggal, jam, dan lokasi klaster layanan agar dapat mengatur waktu.') +
          this._kartuInfo('tetes', 'Pengingat H-1 & Instruksi Puasa', 'Sehari sebelumnya, sistem mengirim panduan persiapan — termasuk puasa 8–10 jam bila ada pemeriksaan gula darah atau profil lipid.') +
          this._kartuInfo('tiket', 'Pengingat Hari-H & Nomor Antrean', 'Pagi hari kunjungan, Anda menerima pengingat berkas yang perlu dibawa serta estimasi giliran pemeriksaan.') +
        '</div>' +
      '</section>' +

      /* ---------- Persiapan kunjungan ---------- */
      '<section style="margin-top:40px">' +
        '<div class="card card-pad">' +
          '<h3 style="margin-bottom:8px">Persiapan Wajib Sebelum Tiba di Faskes</h3>' +
          '<p class="muted small" style="margin-bottom:20px">Berlaku untuk seluruh pasien Hipertensi dan Diabetes Melitus yang menjalani kontrol berkala.</p>' +
          '<div class="split-even">' +
            this._kartuPersiapan('jam', 'Puasa 8–10 Jam', 'Mulai pukul 22.00 malam sebelumnya. Air putih tanpa gula tetap diperbolehkan untuk pengambilan sampel darah.') +
            this._kartuPersiapan('berkas', 'Dokumen Identitas', 'Bawa KTP asli dan Kartu BPJS Kesehatan aktif (atau aplikasi Mobile JKN).') +
            this._kartuPersiapan('pil', 'Rekonsiliasi Obat', 'Bawa sisa blister obat rutin agar dosis lanjutan dapat dicek langsung oleh dokter.') +
          '</div>' +
        '</div>' +
      '</section>' +

      /* ---------- Kontak ---------- */
      '<section style="margin-top:40px">' +
        '<div class="card card-pad" style="background:linear-gradient(122deg,#1b6fa8,#0f4c75);border:none;color:#fff">' +
          '<div class="row-between wrap" style="gap:24px">' +
            '<div>' +
              '<h3 style="color:#fff;margin-bottom:6px">Butuh Bantuan atau Ingin Menjadwal Ulang?</h3>' +
              '<p style="color:rgba(255,255,255,.82);margin:0;max-width:56ch">Hubungi kader pendamping wilayah atau loket ' +
                UI.esc(CONFIG.NAMA_FASKES) + ' pada jam kerja. Penjadwalan ulang tidak memengaruhi status kepatuhan Anda ' +
                'selama dikonfirmasi sebelum tanggal kunjungan.</p>' +
            '</div>' +
            '<div class="col" style="gap:8px;min-width:220px">' +
              '<div class="row" style="color:#fff">' + UI.ikon('telepon') + '<b>' + UI.esc(CONFIG.TELEPON) + '</b></div>' +
              '<div class="row" style="color:rgba(255,255,255,.82)">' + UI.ikon('lokasi') + UI.esc(CONFIG.ALAMAT) + '</div>' +
              '<div class="row" style="color:rgba(255,255,255,.82)">' + UI.ikon('surel') + UI.esc(CONFIG.EMAIL_SUPPORT) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +
    '</div>' +

    /* ---------- Footer ---------- */
    '<footer class="public-foot">' +
      '<div class="row-between wrap" style="max-width:1180px;margin:0 auto;gap:16px">' +
        '<div>' +
          '<div class="strong" style="color:var(--ink);font-family:var(--font-head)">Program Pengendalian PTM Nasional</div>' +
          '<div>Terintegrasi Layanan Primer Puskesmas &amp; Rumah Sakit Daerah</div>' +
        '</div>' +
        '<div class="right">' +
          '<div>Sistem Informasi Manajemen Terpadu PTM</div>' +
          '<div>© ' + new Date().getFullYear() + ' Direktorat Pencegahan &amp; Pengendalian PTM</div>' +
        '</div>' +
      '</div>' +
    '</footer>';
  },

  _kartuInfo(ikon, judul, isi) {
    return '<div class="info-card">' +
      '<div class="ic">' + UI.ikon(ikon) + '</div>' +
      '<h4 style="margin-bottom:8px">' + UI.esc(judul) + '</h4>' +
      '<p class="small muted" style="margin:0;line-height:1.7">' + UI.esc(isi) + '</p>' +
    '</div>';
  },

  _kartuPersiapan(ikon, judul, isi) {
    return '<div class="row" style="align-items:flex-start;gap:14px">' +
      '<div class="kpi-icon is-accent" style="flex:none">' + UI.ikon(ikon) + '</div>' +
      '<div><div class="strong" style="margin-bottom:4px">' + UI.esc(judul) + '</div>' +
      '<div class="small muted" style="line-height:1.65">' + UI.esc(isi) + '</div></div>' +
    '</div>';
  },

  pasang() {
    const masuk = async () => {
      const nik = Form.nilai('pub-nik');
      const hp = Form.nilai('pub-hp');
      if (!/^\d{16}$/.test(nik)) return Form.salah('pub-nik', 'NIK harus tepat 16 digit angka.');
      if (!/^\d{4}$/.test(hp))   return Form.salah('pub-hp', 'Masukkan 4 digit terakhir nomor HP Anda.');

      const res = await API.kirim('pasienLogin', { nik, hp });
      if (res.success) {
        API.simpanSesi(res.data);
        location.hash = '#/portal';
      }
    };

    document.getElementById('pub-masuk').addEventListener('click', masuk);
    document.getElementById('pub-hp').addEventListener('keydown', (e) => { if (e.key === 'Enter') masuk(); });
    document.getElementById('pub-daftar').addEventListener('click', (e) => {
      e.preventDefault();
      PAGES.publik.dialogDaftar();
    });

    // Pop-up pengumuman otomatis (PRD Seksi 5.9) — muncul sekali per sesi peramban.
    this._popupPengumuman();
  },

  _popupPengumuman() {
    const daftar = (this._info && this._info.pengumuman) || [];
    if (!daftar.length) return;

    const p = daftar[0];
    let ditutup = [];
    try { ditutup = JSON.parse(sessionStorage.getItem(CONFIG.KUNCI_POPUP) || '[]'); } catch (e) { ditutup = []; }
    if (ditutup.indexOf(p.id) !== -1) return;

    setTimeout(() => {
      UI.modal({
        aksenAtas: true,
        lebar: 'lg',
        kicker: 'Pengumuman Penting & Edukasi PTM',
        judul: p.judul,
        isi:
          '<div class="row wrap" style="gap:8px;margin-bottom:16px">' +
            '<span class="badge badge-info">' + UI.ikon('target') + 'Target: ' + UI.esc(p.target) + '</span>' +
            '<span class="badge badge-neutral">' + UI.ikon('lokasi') + UI.esc(p.klaster || 'Semua Klaster') + '</span>' +
          '</div>' +
          '<div class="row wrap small muted" style="gap:16px;margin-bottom:16px">' +
            '<span>' + UI.ikon('kalender') + ' Diterbitkan: ' + UI.tanggal(p.tanggalPublish, 'pendek') + '</span>' +
            (p.tanggalBerakhir ? '<span>' + UI.ikon('jam') + ' Berlaku s.d. ' + UI.tanggal(p.tanggalBerakhir, 'pendek') + '</span>' : '') +
            '<span>' + UI.ikon('orang') + ' ' + UI.esc(p.dibuatOleh) + '</span>' +
          '</div>' +
          '<div style="font-size:14px;line-height:1.75;color:var(--ink-2)">' + UI.escMulti(p.isi) + '</div>',
        aksi: [
          { teks: 'Saya Mengerti & Tutup', kelas: 'btn-ghost', onClick: () => {
              ditutup.push(p.id);
              try { sessionStorage.setItem(CONFIG.KUNCI_POPUP, JSON.stringify(ditutup)); } catch (e) { /* abaikan */ }
            } },
          { teks: 'Konfirmasi Jadwal via WhatsApp', kelas: 'btn-primary', ikon: 'pesan', onClick: () => {
              const teks = encodeURIComponent('Halo ' + CONFIG.NAMA_FASKES + ', saya ingin mengonfirmasi jadwal terkait pengumuman: ' + p.judul);
              window.open('https://wa.me/?text=' + teks, '_blank', 'noopener');
            } }
        ]
      });
    }, 700);
  },

  /** Formulir registrasi mandiri pasien. */
  dialogDaftar() {
    UI.modal({
      lebar: 'lg',
      judul: 'Registrasi Mandiri Pasien PTM',
      sub: 'Data Anda akan diverifikasi petugas sebelum jadwal kontrol pertama ditetapkan.',
      isi:
        '<div class="split-even" style="gap:0 16px">' +
          '<div class="field"><label class="form-label" for="rp-nama">Nama Lengkap<span class="req">*</span></label>' +
            '<input class="input" id="rp-nama" placeholder="Sesuai KTP"></div>' +
          '<div class="field"><label class="form-label" for="rp-nik">NIK (16 digit)<span class="req">*</span></label>' +
            '<input class="input mono" id="rp-nik" inputmode="numeric" maxlength="16"></div>' +
          '<div class="field"><label class="form-label" for="rp-hp">No. HP / WhatsApp<span class="req">*</span></label>' +
            '<input class="input mono" id="rp-hp" inputmode="tel" placeholder="0812xxxxxxxx"></div>' +
          '<div class="field"><label class="form-label" for="rp-email">Alamat Email (opsional)</label>' +
            '<input class="input" id="rp-email" type="email"></div>' +
          '<div class="field"><label class="form-label" for="rp-lahir">Tanggal Lahir</label>' +
            '<input class="input" id="rp-lahir" type="date"></div>' +
          '<div class="field"><label class="form-label" for="rp-jk">Jenis Kelamin</label>' +
            '<select class="select" id="rp-jk"><option>Laki-laki</option><option>Perempuan</option></select></div>' +
        '</div>' +
        '<div class="field"><label class="form-label" for="rp-alamat">Alamat Domisili</label>' +
          '<textarea class="textarea" id="rp-alamat" rows="2" placeholder="Jalan, RT/RW, kelurahan, kecamatan"></textarea></div>' +
        '<div class="field"><label class="form-label" for="rp-ptm">Diagnosis PTM<span class="req">*</span></label>' +
          '<select class="select" id="rp-ptm">' +
            '<option value="">— Pilih diagnosis —</option>' +
            CONFIG.JENIS_PTM.map(j => '<option value="' + UI.esc(j.nilai) + '">' + UI.esc(j.judul) + '</option>').join('') +
          '</select>' +
          '<div class="field-hint">Bila belum pernah didiagnosis dokter, pilih yang paling mendekati — petugas akan mengoreksi saat verifikasi.</div>' +
        '</div>' +
        '<div class="callout callout-warning">' + UI.ikon('info') +
          '<div>Dengan mendaftar, Anda menyetujui pengiriman pengingat kontrol via WhatsApp dan email sesuai ' +
          'UU PDP No. 27/2022. Persetujuan dapat dicabut kapan saja melalui petugas.</div></div>',
      aksi: [
        { teks: 'Batal', kelas: 'btn-ghost' },
        { teks: 'Kirim Pendaftaran', kelas: 'btn-primary', ikon: 'cek', onClick: async () => {
            const d = {
              nama: Form.nilai('rp-nama'), nik: Form.nilai('rp-nik'), noHp: Form.nilai('rp-hp'),
              email: Form.nilai('rp-email'), tanggalLahir: Form.nilai('rp-lahir'),
              jenisKelamin: Form.nilai('rp-jk'), alamat: Form.nilai('rp-alamat'), jenisPtm: Form.nilai('rp-ptm')
            };
            if (!d.nama) return Form.salah('rp-nama', 'Nama lengkap wajib diisi.');
            if (!/^\d{16}$/.test(d.nik)) return Form.salah('rp-nik', 'NIK harus tepat 16 digit angka.');
            if (!d.noHp) return Form.salah('rp-hp', 'No. HP/WhatsApp wajib diisi.');
            if (!d.jenisPtm) return Form.salah('rp-ptm', 'Diagnosis PTM wajib dipilih.');

            const res = await API.kirim('registerPasien', d);
            return res.success;   // false → dialog tetap terbuka agar data tidak hilang
          } }
      ]
    });
  }
};

/* ==========================================================================
   HALAMAN 2 — LOGIN & VERIFIKASI AKUN PETUGAS
   ========================================================================== */
PAGES.masuk = {
  judul: 'Login & Verifikasi Akun Petugas',
  shell: 'polos',

  async muat() {
    return '' +
    '<div class="auth-page">' +
      /* ---------- Bar atas ---------- */
      '<div class="public-nav">' +
        '<div class="row grow">' +
          '<div class="brand-mark">' + UI.ikon('perisai') + '</div>' +
          '<div><div class="brand-name">' + UI.esc(CONFIG.NAMA_APP) + '</div>' +
          '<div class="brand-tag">Sistem Informasi Penyakit Tidak Menular</div></div>' +
        '</div>' +
        '<div class="row wrap" style="gap:8px">' +
          '<span class="badge badge-neutral">' + UI.ikon('gembok') + 'Enkripsi Data Medis AES-256</span>' +
          '<span class="badge badge-info">' + UI.ikon('rumahSakit') + UI.esc(CONFIG.NAMA_FASKES) + '</span>' +
          '<button class="btn btn-ghost btn-sm btn-inline" data-ke="#/">' + UI.ikon('panahKiri') + 'Portal Publik</button>' +
        '</div>' +
      '</div>' +

      '<div class="public-wrap">' +
        '<span class="badge badge-info badge-lg">' + UI.ikon('perisai') + 'Portal Autentikasi Terpadu</span>' +
        '<h1 style="margin:16px 0 10px">Login &amp; Verifikasi Akun Petugas Medis</h1>' +
        '<p class="muted" style="max-width:74ch;margin-bottom:32px">Akses terbatas untuk Tenaga Kesehatan dan Penanggung Jawab Posbindu. ' +
          'Seluruh permintaan divalidasi terhadap daftar akun terverifikasi Super Admin faskes.</p>' +

        '<div class="auth-grid">' +

          /* ---------- Kolom kiri: masuk & daftar ---------- */
          '<div class="card">' +
            '<div class="card-head">' +
              '<div><span class="badge badge-info">' + UI.ikon('gembok') + 'Akses Terbatas Tenaga Medis</span>' +
              '<h3 class="card-title" style="margin-top:12px">Masuk Petugas Medis</h3>' +
              '<p class="card-sub">Gunakan email kedinasan dan PIN 6 digit yang Anda daftarkan.</p></div>' +
            '</div>' +

            '<div class="card-body">' +
              '<div class="field">' +
                '<label class="form-label" for="lg-email">Email Kedinasan<span class="req">*</span></label>' +
                '<div class="input-icon">' + UI.ikon('surel') +
                  '<input class="input" id="lg-email" type="email" placeholder="nama@puskesmas.go.id" autocomplete="username">' +
                '</div>' +
              '</div>' +
              '<div class="field">' +
                '<label class="form-label" for="lg-pin">PIN Akses (6 digit)<span class="req">*</span></label>' +
                '<div class="input-icon">' + UI.ikon('gembok') +
                  '<input class="input mono" id="lg-pin" type="password" inputmode="numeric" maxlength="6" ' +
                    'placeholder="••••••" autocomplete="current-password">' +
                '</div>' +
              '</div>' +

              '<button class="btn btn-primary btn-block" id="lg-masuk">' + UI.ikon('panahKanan') + 'Masuk ke Dashboard</button>' +

              (CONFIG.MODE_DEMO
                ? '<div class="callout callout-accent" style="margin-top:16px">' + UI.ikon('info') +
                  '<div><b>Mode demo aktif.</b> Masuk dengan <span class="mono">anita.rahayu@puskesmas.go.id</span> ' +
                  'dan PIN <span class="mono">123456</span> untuk menjelajah seluruh fitur.</div></div>'
                : '') +

              '<div class="row" style="margin:28px 0 20px">' +
                '<div style="flex:1;height:1px;background:var(--border)"></div>' +
                '<span class="label-kicker">Atau daftarkan kredensial baru</span>' +
                '<div style="flex:1;height:1px;background:var(--border)"></div>' +
              '</div>' +

              '<div class="field">' +
                '<label class="form-label" for="rg-nama">Nama Lengkap &amp; Gelar Medis<span class="req">*</span></label>' +
                '<div class="input-icon">' + UI.ikon('orang') +
                  '<input class="input" id="rg-nama" placeholder="dr. Nama Lengkap, Sp.PD">' +
                '</div>' +
              '</div>' +

              '<div class="split-even" style="gap:0 16px">' +
                '<div class="field">' +
                  '<label class="form-label" for="rg-email">Email Kedinasan<span class="req">*</span></label>' +
                  '<input class="input" id="rg-email" type="email" placeholder="nama@puskesmas.go.id">' +
                '</div>' +
                '<div class="field">' +
                  '<label class="form-label" for="rg-nip">NIP / No. KTA IDI / PPNI<span class="req">*</span></label>' +
                  '<input class="input mono" id="rg-nip" placeholder="19870512 201101 2 003">' +
                '</div>' +
              '</div>' +

              '<div class="split-even" style="gap:0 16px">' +
                '<div class="field">' +
                  '<label class="form-label" for="rg-klaster">Klaster Layanan / Faskes<span class="req">*</span></label>' +
                  '<input class="input" id="rg-klaster" placeholder="Posbindu Melati RW 04">' +
                '</div>' +
                '<div class="field">' +
                  '<label class="form-label" for="rg-pin">Buat PIN Akses (6 digit)<span class="req">*</span></label>' +
                  '<input class="input mono" id="rg-pin" type="password" inputmode="numeric" maxlength="6" placeholder="••••••">' +
                  '<div class="field-hint">Hanya angka. Disimpan dalam bentuk hash SHA-256, tidak dapat dibaca siapa pun.</div>' +
                '</div>' +
              '</div>' +

              '<div class="field">' +
                '<div class="row-between" style="margin-bottom:6px">' +
                  '<label class="form-label" for="rg-foto">Unggah Foto Profil Medis Resmi<span class="req">*</span></label>' +
                  '<span class="badge badge-warning">' + UI.ikon('peringatan') + 'Wajib (PRD 5.7)</span>' +
                '</div>' +
                '<label class="upload" id="rg-foto-box">' +
                  '<span class="u-ic">' + UI.ikon('gambar') + '</span>' +
                  '<span class="grow"><span class="u-name" id="rg-foto-nama">Pilih berkas foto…</span>' +
                  '<span class="u-meta">JPG atau PNG, maksimum ' + CONFIG.MAKS_UNGGAH_MB + ' MB. Wajah tampak jelas, berpakaian dinas.</span></span>' +
                  '<input type="file" id="rg-foto" accept="image/jpeg,image/png,image/webp">' +
                '</label>' +
              '</div>' +

              '<button class="btn btn-deep btn-block" id="rg-kirim">' + UI.ikon('cekLingkar') + 'Ajukan Permohonan Akses Baru</button>' +

              '<div class="callout callout-neutral" style="margin-top:16px">' + UI.ikon('gembok') +
                '<div>Setiap akun wajib melalui verifikasi kredensial dan persetujuan <b>Super Admin Faskes</b> ' +
                'sebelum memperoleh hak akses rekam medis dan modul penulisan skrining PTM.</div></div>' +
            '</div>' +
          '</div>' +

          /* ---------- Kolom kanan: cek status & alur ---------- */
          '<div class="stack">' +
            '<div class="card">' +
              '<div class="card-head"><div>' +
                '<h3 class="card-title">Cek Status Akun Terdaftar</h3>' +
                '<p class="card-sub">Pantau posisi pengajuan Anda dalam antrean verifikasi.</p>' +
              '</div></div>' +
              '<div class="card-body">' +
                '<div class="field">' +
                  '<label class="form-label" for="ck-email">Email yang Diajukan</label>' +
                  '<div class="input-icon">' + UI.ikon('cari') +
                    '<input class="input" id="ck-email" type="email" placeholder="nama@puskesmas.go.id">' +
                  '</div>' +
                '</div>' +
                '<button class="btn btn-ghost btn-block" id="ck-cek">' + UI.ikon('segar') + 'Muat Ulang Status Akun</button>' +
                '<div id="ck-hasil" style="margin-top:16px"></div>' +
              '</div>' +
            '</div>' +

            '<div class="card">' +
              '<div class="card-head"><div>' +
                '<h3 class="card-title">Alur Verifikasi Kredensial Medis</h3>' +
                '<p class="card-sub">Empat tahap sebelum dashboard PTM terbuka.</p>' +
              '</div></div>' +
              '<div class="card-body">' +
                '<div class="stepper">' +
                  this._step('done', 'cek', 'Tahap 1 — Pendaftaran Kredensial', 'Nama, NIP/KTA, klaster penugasan, dan PIN akses dikirim ke sistem.') +
                  this._step('done', 'cek', 'Tahap 2 — Validasi Identitas & Foto', 'Sistem menolak pendaftaran tanpa foto profil aktif (PRD Seksi 5.7).') +
                  this._step('now', 'pasirJam', 'Tahap 3 — Verifikasi Manual Super Admin', 'Ditinjau Kepala Faskes. Notifikasi hasil dikirim ke email dinas dalam 1×24 jam kerja.') +
                  this._step('', 'gembok', 'Tahap 4 — Akses Dashboard PTM Diberikan', 'Hak akses mengikuti matriks RBAC: data pasien terbatas pada klaster penugasan Anda.') +
                '</div>' +
              '</div>' +
            '</div>' +

            '<div class="card card-pad">' +
              '<div class="row" style="align-items:flex-start;gap:12px">' +
                '<div class="kpi-icon is-success" style="flex:none">' + UI.ikon('perisai') + '</div>' +
                '<div>' +
                  '<div class="strong" style="margin-bottom:6px">Kepatuhan Privasi Data Rekam Medis</div>' +
                  '<p class="small muted" style="margin:0;line-height:1.7">Setiap catatan tensi, gula darah, dan kolesterol warga ' +
                    'dilindungi enkripsi. Petugas dilarang mendistribusikan kredensial akses kepada pihak ketiga ' +
                    'yang tidak berwenang — sesuai Permenkes No. 24/2022 tentang Rekam Medis Elektronik.</p>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

        '</div>' +
      '</div>' +

      '<footer class="public-foot">' +
        '<div class="row-between wrap" style="max-width:1180px;margin:0 auto;gap:16px">' +
          '<div><div class="strong" style="color:var(--ink);font-family:var(--font-head)">Direktorat Pencegahan &amp; Pengendalian PTM</div>' +
          '<div>Layanan IT: ' + UI.esc(CONFIG.TELEPON) + ' · ' + UI.esc(CONFIG.EMAIL_SUPPORT) + '</div></div>' +
          '<div class="right">© ' + new Date().getFullYear() + ' ' + UI.esc(CONFIG.NAMA_FASKES) + '. Portal khusus tenaga kesehatan terdaftar.</div>' +
        '</div>' +
      '</footer>' +
    '</div>';
  },

  _step(status, ikon, judul, desc) {
    return '<div class="step ' + (status === 'done' ? 'is-done' : status === 'now' ? 'is-now' : '') + '">' +
      '<div class="step-mark">' + UI.ikon(ikon) + '</div>' +
      '<div><div class="step-title">' + UI.esc(judul) + '</div>' +
      '<div class="step-desc">' + UI.esc(desc) + '</div></div>' +
    '</div>';
  },

  pasang() {
    let fotoTerpilih = null;

    /* ---- Masuk ---- */
    const masuk = async (e) => {
      const btn = document.getElementById('lg-masuk');
      const email = Form.nilai('lg-email');
      const pin = Form.nilai('lg-pin');
      if (!email) return Form.salah('lg-email', 'Email kedinasan wajib diisi.');
      if (!pin)   return Form.salah('lg-pin', 'PIN akses wajib diisi.');

      Form.sibuk(btn, true, 'Memverifikasi…');
      const res = await API.kirim('login', { email, pin });
      Form.sibuk(btn, false);

      if (res.success) {
        API.simpanSesi(res.data);
        location.hash = '#/dashboard';
      }
    };
    document.getElementById('lg-masuk').addEventListener('click', masuk);
    document.getElementById('lg-pin').addEventListener('keydown', (e) => { if (e.key === 'Enter') masuk(); });

    /* ---- Unggah foto ---- */
    document.getElementById('rg-foto').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        fotoTerpilih = await API.bacaBerkas(file);
        document.getElementById('rg-foto-nama').textContent = file.name;
        document.getElementById('rg-foto-box').classList.add('has-file');
      } catch (err) {
        fotoTerpilih = null;
        UI.toast(err.message, 'error');
      }
    });

    /* ---- Daftar ---- */
    document.getElementById('rg-kirim').addEventListener('click', async () => {
      const btn = document.getElementById('rg-kirim');
      const d = {
        nama: Form.nilai('rg-nama'), email: Form.nilai('rg-email'),
        nip: Form.nilai('rg-nip'), klaster: Form.nilai('rg-klaster'), pin: Form.nilai('rg-pin')
      };
      if (!d.nama)    return Form.salah('rg-nama', 'Nama lengkap dan gelar wajib diisi.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return Form.salah('rg-email', 'Format email tidak valid.');
      if (!d.nip)     return Form.salah('rg-nip', 'NIP / nomor KTA wajib diisi.');
      if (!d.klaster) return Form.salah('rg-klaster', 'Klaster layanan wajib diisi.');
      if (!/^\d{6}$/.test(d.pin)) return Form.salah('rg-pin', 'PIN harus tepat 6 digit angka.');
      if (!fotoTerpilih) return UI.toast('Foto profil wajib diunggah sebelum pengajuan dapat diproses.', 'error');

      d.fotoBase64 = fotoTerpilih.base64;
      d.fotoMime = fotoTerpilih.mime;

      Form.sibuk(btn, true, 'Mengirim pengajuan…');
      const res = await API.kirim('registerStaff', d);
      Form.sibuk(btn, false);

      if (res.success) {
        Form.set('ck-email', d.email);
        UI.modal({
          aksenAtas: true,
          judul: 'Pengajuan Akses Terkirim',
          isi: '<p class="muted" style="line-height:1.75">Permohonan Anda masuk ke antrean verifikasi Super Admin faskes. ' +
               'Notifikasi persetujuan akan dikirim ke <b>' + UI.esc(d.email) + '</b> dalam 1×24 jam kerja.</p>' +
               '<div class="callout callout-neutral">' + UI.ikon('info') +
               '<div>Gunakan panel <b>Cek Status Akun Terdaftar</b> di sebelah kanan untuk memantau posisi antrean Anda.</div></div>',
          aksi: [{ teks: 'Mengerti', kelas: 'btn-primary' }]
        });
        ['rg-nama', 'rg-email', 'rg-nip', 'rg-klaster', 'rg-pin'].forEach(id => Form.set(id, ''));
      }
    });

    /* ---- Cek status ---- */
    document.getElementById('ck-cek').addEventListener('click', async () => {
      const email = Form.nilai('ck-email');
      if (!email) return Form.salah('ck-email', 'Masukkan email yang Anda ajukan.');

      const res = await API.get('cekStatusAkun', { email });
      const host = document.getElementById('ck-hasil');

      if (!res.success) {
        host.innerHTML = '<div class="callout callout-danger">' + UI.ikon('peringatan') +
          '<div>' + UI.esc(res.message) + '</div></div>';
        return;
      }

      const a = res.data;
      const nada = a.status === 'Disetujui' ? 'success' : a.status === 'Ditolak' ? 'danger' : 'warning';
      const ikon = a.status === 'Disetujui' ? 'cekLingkar' : a.status === 'Ditolak' ? 'silang' : 'pasirJam';

      host.innerHTML =
        '<div class="card card-pad" style="background:var(--card-alt)">' +
          '<div class="row" style="margin-bottom:14px">' +
            UI.avatar(a.nama, '', 'avatar-lg') +
            '<div class="grow"><div class="strong">' + UI.esc(a.nama) + '</div>' +
            '<div class="tiny muted">' + UI.esc(a.peran) + ' · ' + UI.esc(a.klaster) + '</div></div>' +
          '</div>' +
          '<div class="row-between" style="padding-top:14px;border-top:1px solid var(--border)">' +
            '<div><div class="label-kicker">Status Pengajuan</div>' +
            '<div style="margin-top:6px"><span class="badge badge-' + nada + ' badge-lg">' + UI.ikon(ikon) + UI.esc(a.status) + '</span></div></div>' +
            '<div class="right"><div class="label-kicker">Diajukan</div>' +
            '<div class="mono small" style="margin-top:6px">' + UI.tanggal(a.diajukan, 'pendek') + '</div></div>' +
          '</div>' +
          (a.status === 'Disetujui'
            ? '<div class="callout callout-accent" style="margin-top:14px">' + UI.ikon('cek') +
              '<div>Akun aktif. Silakan masuk memakai email dan PIN Anda di panel sebelah kiri.</div></div>'
            : a.status === 'Pending'
            ? '<div class="callout callout-warning" style="margin-top:14px">' + UI.ikon('pasirJam') +
              '<div>Masih dalam antrean peninjauan Super Admin. Tidak perlu mendaftar ulang.</div></div>'
            : '<div class="callout callout-danger" style="margin-top:14px">' + UI.ikon('peringatan') +
              '<div>Pengajuan ditolak. Hubungi Super Admin faskes untuk penjelasan dan pengajuan ulang.</div></div>') +
        '</div>';
    });
  }
};

/* ==========================================================================
   HALAMAN 3 — PORTAL PASIEN MANDIRI
   ========================================================================== */
PAGES.portal = {
  judul: 'Portal Pasien Mandiri',
  shell: 'polos',
  perluSesi: 'Pasien',

  async muat() {
    const d = await API.ambil('pasienDashboard');
    if (!d) return UI.kosong('Data tidak dapat dimuat', 'Coba muat ulang halaman atau masuk kembali.', 'peringatan');
    this._d = d;

    const jam = new Date().getHours();
    const salam = jam < 11 ? 'Selamat Pagi' : jam < 15 ? 'Selamat Siang' : jam < 18 ? 'Selamat Sore' : 'Selamat Malam';
    const tensi = UI.klasifikasiTensi(d.klinis.sistolik, d.klinis.diastolik);
    const gula = UI.klasifikasiGdp(d.klinis.gdp);
    const hariIni = d.jadwal.tanggal === UI.hariIni();

    return '' +
    /* ---------- Bar atas ---------- */
    '<div class="public-nav">' +
      '<div class="row grow">' +
        '<div class="brand-mark">' + UI.ikon('perisai') + '</div>' +
        '<div><div class="brand-name">' + UI.esc(CONFIG.NAMA_APP) + '</div>' +
        '<div class="brand-tag">Portal Kontrol Pasien Mandiri</div></div>' +
      '</div>' +
      '<div class="row wrap" style="gap:10px">' +
        '<span class="badge badge-danger">' + UI.ikon('telepon') + 'Hotline ' + UI.esc(CONFIG.TELEPON) + '</span>' +
        '<div class="row" style="gap:10px">' +
          UI.avatar(d.profil.nama, d.profil.foto) +
          '<div><div class="strong small">' + UI.esc(d.profil.nama) + '</div>' +
          '<div class="tiny muted">' + UI.esc(d.profil.usia) + ' th · ' + UI.esc(d.profil.id) + '</div></div>' +
        '</div>' +
        '<button class="btn btn-icon btn" id="pt-keluar" aria-label="Keluar dari portal">' + UI.ikon('keluar') + '</button>' +
      '</div>' +
    '</div>' +

    '<div class="public-wrap">' +

      /* ---------- Sambutan + jadwal ---------- */
      '<div class="split">' +
        '<div class="card card-pad">' +
          '<div class="row wrap" style="gap:8px;margin-bottom:14px">' +
            UI.badgePtm(d.profil.jenisPtm) +
            '<span class="badge badge-success">' + UI.ikon('cekLingkar') + 'Pasien Aktif Binaan</span>' +
          '</div>' +
          '<h1 style="margin-bottom:10px">' + salam + ', ' + UI.esc(d.profil.nama) + '</h1>' +
          '<p class="muted" style="margin-bottom:20px;line-height:1.75">Terdaftar di Program Pengendalian Penyakit Tidak Menular ' +
            UI.esc(d.profil.klaster) + ' — ' + UI.esc(CONFIG.WILAYAH) + '.</p>' +
          '<div class="row wrap small muted" style="gap:20px">' +
            '<span>' + UI.ikon('berkas') + ' NIK: <span class="mono">' + UI.esc(d.profil.nik) + '</span></span>' +
            '<span>' + UI.ikon('perisai') + ' BPJS: <span class="mono">' + UI.esc(d.profil.noBpjs || '-') + '</span></span>' +
            '<span>' + UI.ikon('stetoskop') + ' ' + UI.esc(d.profil.dokterPj || '-') + '</span>' +
          '</div>' +
        '</div>' +

        '<div class="card card-pad" style="background:var(--primary-soft);border-color:var(--primary)">' +
          '<div class="row-between" style="margin-bottom:12px">' +
            '<div class="label-kicker">Kunjungan Terjadwal</div>' +
            (hariIni ? '<span class="badge badge-solid">Hari Ini</span>'
                     : '<span class="badge badge-info">' + (d.jadwal.hariLagi > 0 ? d.jadwal.hariLagi + ' hari lagi' : 'Terlewat') + '</span>') +
          '</div>' +
          '<div style="font-size:17px;font-weight:700;margin-bottom:4px">' + UI.tanggal(d.jadwal.tanggal, 'panjang') + '</div>' +
          '<div class="small muted" style="margin-bottom:18px">Pukul ' + UI.esc(d.jadwal.jam) + ' WIB · Poli Penyakit Tidak Menular</div>' +

          (d.jadwal.status === 'Sudah Berkunjung'
            ? '<div class="callout callout-accent" style="margin-bottom:12px">' + UI.ikon('cekLingkar') +
              '<div>Kehadiran Anda sudah tercatat. Terima kasih!</div></div>'
            : '<button class="btn btn-primary btn-block" id="pt-konfirmasi">' + UI.ikon('cekLingkar') + 'Konfirmasi Kehadiran Saya</button>') +

          '<button class="btn btn-ghost btn-block" style="margin-top:10px" id="pt-tiket">' + UI.ikon('tiket') + 'Unduh E-Tiket &amp; Barcode Antrean</button>' +

          '<div class="row small" style="margin-top:14px;color:var(--success)">' + UI.ikon('cekLingkar') +
            UI.esc(d.jadwal.reminderDiterima) + ' pengingat sudah Anda terima</div>' +
        '</div>' +
      '</div>' +

      /* ---------- Tiga metrik utama ---------- */
      '<div class="kpi-grid" style="margin-top:24px">' +
        UI.kpi({
          label: 'Tekanan Darah', ikon: 'denyut', nada: 'danger',
          nilai: (d.klinis.sistolik || '-') + '/' + (d.klinis.diastolik || '-'), unit: 'mmHg',
          kaki: '<span class="badge ' + tensi.kelas + '">' + UI.esc(tensi.label) + '</span>' +
                '<span class="tiny muted">Target &lt; 140/90 · ' + UI.tanggal(d.klinis.tanggal, 'pendek') + '</span>',
          progres: Math.min(100, (Number(d.klinis.sistolik) / 180) * 100), progresWarna: tensi.warna
        }) +
        UI.kpi({
          label: 'Gula Darah Puasa', ikon: 'tetes', nada: 'accent',
          nilai: d.klinis.gdp || '-', unit: 'mg/dL',
          kaki: '<span class="badge ' + gula.kelas + '">' + UI.esc(gula.label) + '</span>' +
                '<span class="tiny muted">Target &lt; 130 mg/dL</span>',
          progres: Math.min(100, (Number(d.klinis.gdp) / 250) * 100), progresWarna: gula.warna
        }) +
        UI.kpi({
          label: 'Kepatuhan 12 Bulan', ikon: 'target', nada: 'success',
          nilai: UI.persen(d.kepatuhan.persen), nilaiNada: d.kepatuhan.persen >= 85 ? 'success' : '',
          kaki: '<span class="badge badge-success">' + UI.ikon('cek') + 'Disiplin</span>' +
                '<span class="tiny muted">' + d.kepatuhan.tepatWaktu + ' dari ' + d.kepatuhan.totalSesi + ' kunjungan tepat</span>',
          progres: d.kepatuhan.persen, progresWarna: 'var(--success)'
        }) +
      '</div>' +

      /* ---------- Persiapan + resep ---------- */
      '<div class="split-even" style="margin-top:24px">' +
        '<div class="card">' +
          '<div class="card-head"><div><h3 class="card-title">' + UI.ikon('kalender') + ' Rincian Kontrol Berikutnya</h3>' +
          '<p class="card-sub">' + UI.esc(CONFIG.NAMA_FASKES) + '</p></div></div>' +
          '<div class="card-body">' +
            '<div class="split-even" style="gap:16px;margin-bottom:20px">' +
              UI.fakta('Jam Kunjungan', d.jadwal.jam + ' WIB', { besar: true, mono: true }) +
              UI.fakta('Dokter Pemeriksa', d.profil.dokterPj) +
              UI.fakta('Klaster Layanan', d.profil.klaster) +
            '</div>' +
            '<div class="strong" style="margin-bottom:12px">Persiapan Wajib Sebelum Tiba di Faskes</div>' +
            '<div class="col" style="gap:12px">' +
              this._siap('Puasa 8–10 Jam', 'Mulai pukul 23.30 semalam. Air putih tanpa gula diperbolehkan untuk pengambilan sampel gula darah.') +
              this._siap('Dokumen Identitas', 'Membawa fisik KTP asli dan Kartu BPJS Kesehatan aktif (atau aplikasi Mobile JKN).') +
              this._siap('Rekonsiliasi Obat', 'Membawa sisa blister obat rutin untuk dicek dosis lanjutan oleh dokter.') +
            '</div>' +
            '<div class="callout callout-neutral" style="margin-top:20px">' + UI.ikon('telepon') +
              '<div>Perlu bantuan atau menjadwal ulang? Hubungi kader pendamping: <b>' + UI.esc(d.profil.kader || '-') + '</b></div></div>' +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head">' +
            '<div><h3 class="card-title">' + UI.ikon('pil') + ' Resep Obat Kronis Aktif</h3>' +
            '<p class="card-sub">Aturan minum yang sedang berjalan</p></div>' +
            '<span class="badge badge-success">Rutin Aktif</span>' +
          '</div>' +
          '<div class="card-body">' +
            (d.klinis.riwayatObat
              ? '<div class="col" style="gap:12px">' +
                  String(d.klinis.riwayatObat).split(',').map(o => {
                    const t = o.trim();
                    if (!t) return '';
                    return '<div class="metric"><div class="row" style="gap:12px">' +
                      '<div class="kpi-icon is-accent" style="width:32px;height:32px">' + UI.ikon('pil') + '</div>' +
                      '<div class="grow"><div class="strong small">' + UI.esc(t) + '</div></div></div></div>';
                  }).join('') +
                '</div>'
              : '<p class="muted small">Belum ada resep kronis tercatat pada kunjungan terakhir.</p>') +
            '<div class="callout callout-accent" style="margin-top:16px">' + UI.ikon('info') +
              '<div>Obat paket 30 hari dapat diambil di loket Farmasi setelah konsultasi dokter hari ini selesai diverifikasi.</div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ---------- Riwayat kunjungan ---------- */
      '<div class="card" style="margin-top:24px">' +
        '<div class="card-head">' +
          '<div><h3 class="card-title">' + UI.ikon('jam') + ' Riwayat Kunjungan Terakhir</h3>' +
          '<p class="card-sub">Catatan kehadiran Anda pada program pemantauan PTM</p></div>' +
          '<span class="badge badge-info">' + d.kepatuhan.totalSesi + ' sesi tercatat</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="timeline">' +
            (d.kepatuhan.riwayat || []).map((r, i) => {
              const miss = r.status !== 'Hadir';
              return '<div class="tl-item ' + (miss ? 'is-miss' : '') + '">' +
                '<div class="tl-card ' + (miss ? 'is-miss' : '') + '">' +
                  '<div class="tl-head">' +
                    '<span class="tl-date">' + UI.tanggal(r.tanggalJadwal, 'pendek') + '</span>' +
                    (i === 0 ? '<span class="badge badge-info">Terbaru</span>' : '') +
                    (miss ? '<span class="badge badge-danger">' + UI.ikon('silang') + 'Tidak Hadir Tepat Waktu</span>'
                          : '<span class="badge badge-success">' + UI.ikon('cek') + 'Hadir Tepat Waktu</span>') +
                  '</div>' +
                  '<div class="tl-body">' + UI.esc(r.keterangan || '-') + '</div>' +
                '</div></div>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ---------- Panduan personal ---------- */
      '<div class="card card-pad" style="margin-top:24px">' +
        '<h3 style="margin-bottom:6px">' + UI.ikon('denyut') + ' Panduan Sehat Personal Pekan Ini</h3>' +
        '<p class="muted small" style="margin-bottom:20px">Disesuaikan dengan diagnosis ' + UI.esc(d.profil.jenisPtm) + '.</p>' +
        '<div class="split-even">' +
          this._panduan('Batasi Garam', 'Maksimal 1 sendok teh (5 gram garam dapur) per hari untuk mencegah lonjakan tensi di pagi hari.') +
          this._panduan('Aktivitas Fisik', 'Jalan santai 30 menit setiap pagi setelah subuh, bersama kelompok Prolanis wilayah Anda.') +
          this._panduan('Hindari Pemanis Buatan', 'Utamakan air putih hangat atau teh tawar encer untuk menjaga kestabilan gula darah puasa.') +
        '</div>' +
      '</div>' +
    '</div>' +

    '<footer class="public-foot">' +
      '<div style="max-width:1180px;margin:0 auto">' +
        '<div class="row-between wrap" style="gap:16px">' +
          '<div><div class="strong" style="color:var(--ink);font-family:var(--font-head)">' + UI.esc(CONFIG.NAMA_FASKES) + '</div>' +
          '<div>' + UI.esc(CONFIG.ALAMAT) + ' · Layanan Darurat 24 Jam: ' + UI.esc(CONFIG.TELEPON) + '</div></div>' +
          '<div class="right">© ' + new Date().getFullYear() + ' ' + UI.esc(CONFIG.NAMA_APP) + ' · Standar Keamanan Rekam Medis ISO 27001</div>' +
        '</div>' +
      '</div>' +
    '</footer>';
  },

  _siap(judul, isi) {
    return '<div class="row" style="align-items:flex-start;gap:12px">' +
      '<span style="color:var(--success);flex:none;margin-top:2px">' + UI.ikon('cekLingkar') + '</span>' +
      '<div><span class="strong small">' + UI.esc(judul) + ':</span> ' +
      '<span class="small muted">' + UI.esc(isi) + '</span></div>' +
    '</div>';
  },

  _panduan(judul, isi) {
    return '<div class="metric">' +
      '<div class="strong small" style="margin-bottom:6px">' + UI.esc(judul) + '</div>' +
      '<div class="small muted" style="line-height:1.7">' + UI.esc(isi) + '</div>' +
    '</div>';
  },

  pasang() {
    document.getElementById('pt-keluar').addEventListener('click', async () => {
      if (!await UI.konfirmasi('Keluar dari Portal', 'Anda akan keluar dari portal pasien. Lanjutkan?')) return;
      await API.post('logout', { token: API.token });
      API.hapusSesi();
      location.hash = '#/';
    });

    const konf = document.getElementById('pt-konfirmasi');
    if (konf) {
      konf.addEventListener('click', async () => {
        if (!await UI.konfirmasi('Konfirmasi Kehadiran',
          'Sistem akan mencatat bahwa Anda hadir pada jadwal kontrol hari ini. Petugas tetap akan memverifikasi saat Anda tiba di faskes.')) return;
        const res = await API.kirim('pasienKonfirmasi', {});
        if (res.success) Router.muat();
      });
    }

    document.getElementById('pt-tiket').addEventListener('click', () => {
      const d = PAGES.portal._d;
      UI.modal({
        aksenAtas: true,
        judul: 'E-Tiket Kontrol PTM',
        sub: 'Tunjukkan halaman ini kepada petugas loket.',
        isi:
          '<div class="center" style="padding:8px 0 16px">' +
            '<div class="mono" style="font-size:30px;font-weight:700;letter-spacing:.12em;color:var(--primary-deep)">' +
              UI.esc(d.profil.id) + '</div>' +
            '<div class="tiny muted" style="margin-top:6px">Nomor Rekam Medis Terpadu</div>' +
          '</div>' +
          '<div class="split-even" style="gap:16px">' +
            UI.fakta('Nama Pasien', d.profil.nama) +
            UI.fakta('Tanggal', UI.tanggal(d.jadwal.tanggal, 'pendek')) +
            UI.fakta('Jam', d.jadwal.jam + ' WIB', { mono: true }) +
            UI.fakta('Klaster', d.profil.klaster) +
          '</div>' +
          '<div class="callout callout-neutral" style="margin-top:16px">' + UI.ikon('info') +
            '<div>Simpan tangkapan layar halaman ini, atau gunakan tombol Cetak untuk menyimpannya sebagai PDF.</div></div>',
        aksi: [
          { teks: 'Tutup', kelas: 'btn-ghost' },
          { teks: 'Cetak E-Tiket', kelas: 'btn-primary', ikon: 'cetak', onClick: () => { window.print(); return false; } }
        ]
      });
    });
  }
};
