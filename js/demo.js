/* ==========================================================================
   PEDULI PTM — demo.js
   Backend tiruan yang hanya aktif saat CONFIG.GAS_URL belum diisi.
   Tujuannya: seluruh halaman dapat dilihat & diuji sebelum Apps Script siap.
   Setelah GAS_URL terisi, berkas ini tidak pernah dipanggil.
   ========================================================================== */

const DEMO = {

  /* ---------------------------------------------------------------- data */
  _geser(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },

  _init() {
    if (this.db) return;
    const g = (n) => this._geser(n);

    this.db = {
      akunAktif: {
        email: 'anita.rahayu@puskesmas.go.id',
        nama: 'dr. Anita Rahayu, Sp.PD',
        peran: 'Super Admin',
        klaster: 'Puskesmas Sehat Utama Wilayah I',
        nip: '19870512 201101 2 003',
        foto: ''
      },

      pasien: [
        { id: 'PTM-2026-0001', nama: 'Bpk. Bambang Sutrisno', nik: '3174092801660002', jenisKelamin: 'Laki-laki',
          usia: 58, jenisPtm: 'Hipertensi', noHp: '081298765432', email: '', noBpjs: '0001892837482',
          namaKeluarga: 'Ibu Endang', hubunganKeluarga: 'Istri', noHpKeluarga: '081298765400',
          klaster: 'Klaster PTM Sehat Utama', tanggal: g(0), jam: '08:30', statusReminder: 'Terkirim H-0',
          statusKunjungan: 'Sudah Berkunjung', foto: '', catatan: 'TD terakhir 154/96 mmHg — pantau ketat.',
          alamat: 'Jl. Melati Indah No. 12, RT 003/RW 004, Jakarta Selatan', tanggalLahir: '1966-01-28',
          dokterPj: 'dr. Anita Rahayu, Sp.PD', kader: 'Ibu Endang Sulistyo' },

        { id: 'PTM-2026-0002', nama: 'Ibu Siti Aminah', nik: '3201085203720005', jenisKelamin: 'Perempuan',
          usia: 52, jenisPtm: 'Diabetes Melitus', noHp: '085712345678', email: 'siti.aminah@gmail.com',
          noBpjs: '0001892837483', namaKeluarga: 'Farhan', hubunganKeluarga: 'Anak Kandung', noHpKeluarga: '085712345600',
          klaster: 'Klaster PTM Melati', tanggal: g(1), jam: '09:15', statusReminder: 'Terkirim H-1',
          statusKunjungan: 'Belum Berkunjung', foto: '', catatan: 'GDS 188 mg/dL — HbA1c 7,4%.',
          alamat: 'Jl. Kenanga No. 8, RT 002/RW 005, Jakarta Selatan', tanggalLahir: '1972-03-12',
          dokterPj: 'dr. Farhan Malik', kader: 'Ibu Endang Sulistyo' },

        { id: 'PTM-2026-0003', nama: 'Bpk. Hendra Gunawan', nik: '3175021508630001', jenisKelamin: 'Laki-laki',
          usia: 61, jenisPtm: 'Hipertensi & DM', noHp: '081388889900', email: 'hendra.g@gmail.com',
          noBpjs: '0001892837484', namaKeluarga: 'Ibu Sri', hubunganKeluarga: 'Istri', noHpKeluarga: '081311223344',
          klaster: 'Klaster PTM Sehat Utama', tanggal: g(0), jam: '09:30', statusReminder: 'Terkirim H-0',
          statusKunjungan: 'Sudah Berkunjung', foto: '', catatan: 'Prioritas pemantauan ginjal — komorbid aktif.',
          alamat: 'Jl. Flamboyan No. 14, RT 04/RW 02, Jakarta Timur', tanggalLahir: '1963-08-15',
          dokterPj: 'dr. Anita Rahayu, Sp.PD', kader: 'Ibu Endang Sulistyo' },

        { id: 'PTM-2026-0004', nama: 'Ibu Mariam Siregar', nik: '1271014502590003', jenisKelamin: 'Perempuan',
          usia: 65, jenisPtm: 'Hipertensi', noHp: '081901234567', email: '', noBpjs: '0001892837485',
          namaKeluarga: 'Dewi', hubunganKeluarga: 'Anak Tertua', noHpKeluarga: '081901234500',
          klaster: 'Klaster PTM Cempaka', tanggal: g(2), jam: '08:00', statusReminder: 'Belum Terkirim',
          statusKunjungan: 'Belum Berkunjung', foto: '', catatan: 'TD terakhir 142/88 mmHg.',
          alamat: 'Jl. Anggrek No. 3, RT 001/RW 006, Jakarta Selatan', tanggalLahir: '1959-02-05',
          dokterPj: 'dr. Maya Indriani', kader: 'Ibu Endang Sulistyo' },

        { id: 'PTM-2026-0005', nama: 'Bpk. Sugeng Waluyo', nik: '3374021207690004', jenisKelamin: 'Laki-laki',
          usia: 55, jenisPtm: 'Diabetes Melitus', noHp: '082134567890', email: '', noBpjs: '0001892837486',
          namaKeluarga: 'Bagus', hubunganKeluarga: 'Anak', noHpKeluarga: '082134567800',
          klaster: 'Klaster PTM Melati', tanggal: g(3), jam: '11:00', statusReminder: 'Terkirim H-3',
          statusKunjungan: 'Belum Berkunjung', foto: '', catatan: 'GDS 215 mg/dL — terapi insulin.',
          alamat: 'Jl. Dahlia No. 21, RT 005/RW 003, Jakarta Timur', tanggalLahir: '1969-07-12',
          dokterPj: 'dr. Farhan Malik', kader: 'Ibu Endang Sulistyo' },

        { id: 'PTM-2026-0006', nama: 'Ibu Ratna Dewi', nik: '3174094107690002', jenisKelamin: 'Perempuan',
          usia: 57, jenisPtm: 'Hipertensi', noHp: '081277553311', email: 'ratna.d@gmail.com',
          noBpjs: '0001892837487', namaKeluarga: 'Pak Joko', hubunganKeluarga: 'Suami', noHpKeluarga: '081277553300',
          klaster: 'Klaster PTM Sehat Utama', tanggal: g(0), jam: '10:45', statusReminder: 'Terkirim H-0',
          statusKunjungan: 'Belum Berkunjung', foto: '', catatan: 'Keluhan pusing tengkuk berulang.',
          alamat: 'Jl. Mawar No. 5, RT 002/RW 001, Jakarta Timur', tanggalLahir: '1969-07-01',
          dokterPj: 'dr. Anita Rahayu, Sp.PD', kader: 'Ibu Endang Sulistyo' },

        { id: 'PTM-2026-0007', nama: 'Bpk. Joko Widodo', nik: '3174092106610009', jenisKelamin: 'Laki-laki',
          usia: 63, jenisPtm: 'Diabetes Melitus', noHp: '081355667788', email: 'joko.w@gmail.com',
          noBpjs: '0001892837488', namaKeluarga: 'Ibu Tuti', hubunganKeluarga: 'Istri', noHpKeluarga: '081355667700',
          klaster: 'Klaster PTM Melati', tanggal: g(0), jam: '11:15', statusReminder: 'Terkirim H-1',
          statusKunjungan: 'Belum Berkunjung', foto: '', catatan: 'Kontrol gula darah rutin bulanan.',
          alamat: 'Jl. Cempaka No. 9, RT 006/RW 002, Jakarta Timur', tanggalLahir: '1961-06-21',
          dokterPj: 'dr. Farhan Malik', kader: 'Ibu Endang Sulistyo' }
      ],

      medis: {
        'PTM-2026-0003': [
          { id: 'RM-2026-0012', tanggal: g(0), sistolik: 135, diastolik: 85, gdp: 126, hba1c: 6.8, beratBadan: 68,
            riwayatObat: 'Amlodipine 10 mg (1x1 pagi), Metformin 500 mg (2x1), Candesartan 8 mg (1x1 malam)',
            hasilLab: '', fotoResep: '', catatan: 'Evaluasi tensi stabil, pemeriksaan funduskopi berkala baik.',
            dicatatOleh: 'dr. Anita Rahayu' },
          { id: 'RM-2026-0009', tanggal: g(-30), sistolik: 138, diastolik: 86, gdp: 130, hba1c: 6.9, beratBadan: 68,
            riwayatObat: 'Amlodipine 10 mg, Metformin 500 mg', hasilLab: '', fotoResep: '',
            catatan: 'Gula darah puasa 130 mg/dL, penyesuaian dosis metformin malam.', dicatatOleh: 'dr. Anita Rahayu' },
          { id: 'RM-2026-0006', tanggal: g(-61), sistolik: 140, diastolik: 88, gdp: 134, hba1c: 7.0, beratBadan: 69,
            riwayatObat: 'Amlodipine 10 mg, Metformin 500 mg', hasilLab: '', fotoResep: '',
            catatan: 'Konsultasi gizi prolanis, keluhan pusing tengkuk berkurang signifikan.', dicatatOleh: 'dr. Anita Rahayu' },
          { id: 'RM-2026-0003', tanggal: g(-92), sistolik: 145, diastolik: 92, gdp: 141, hba1c: 7.2, beratBadan: 70,
            riwayatObat: 'Amlodipine 10 mg', hasilLab: '', fotoResep: '',
            catatan: 'Awal terapi kombinasi.', dicatatOleh: 'dr. Anita Rahayu' }
        ]
      },

      pengumuman: [
        { id: 'PGM-2026-0001',
          judul: 'Jadwal Skrining Komplikasi Retinopati Diabetik & Profil Lipid Gratis',
          isi: 'Dihimbau kepada seluruh pasien terdaftar dengan diagnosis Diabetes Melitus Tipe 2 dan Hipertensi kronis untuk mengikuti skrining tahunan komplikasi pembuluh darah dan mata (retina) tanpa dipungut biaya (gratis BPJS/KTP).\n\nInstruksi persiapan pasien:\n1. Wajib puasa 10 jam, dimulai pukul 22.00 WIB (air mineral tetap diperbolehkan).\n2. Bawa fotokopi KTP / Kartu Keluarga dan Kartu Indonesia Sehat (BPJS aktif).\n3. Bawa strip obat anti-hipertensi atau OAD/insulin yang sedang dikonsumsi.',
          target: 'Komorbid (DM+HT)', klaster: 'Semua Klaster', lampiran: '',
          tanggalPublish: g(-3), tanggalBerakhir: g(7), aktif: true,
          kanal: 'Pop-up, WhatsApp, Email', terkirim: 215, dibuatOleh: 'dr. Anita Rahayu' },
        { id: 'PGM-2026-0002',
          judul: 'Pemberitahuan Instruksi Persiapan Puasa Pemeriksaan Gula Darah',
          isi: 'Bagi pasien Diabetes Melitus yang dijadwalkan pemeriksaan gula darah puasa, mohon tidak mengonsumsi makanan/minuman manis 8 jam sebelum pengambilan sampel.',
          target: 'Diabetes Melitus', klaster: 'Posbindu Mawar & Cempaka', lampiran: '',
          tanggalPublish: g(-5), tanggalBerakhir: '', aktif: true,
          kanal: 'Pop-up, WhatsApp', terkirim: 146, dibuatOleh: 'Ns. Budi Santoso' },
        { id: 'PGM-2026-0003',
          judul: 'Senam Jantung Sehat & Prolanis Lansia Setiap Jumat Pagi',
          isi: 'Latihan kebugaran terpadu bersama kader Posbindu Melati Indah, setiap Jumat pukul 06.30 WIB di lapangan RW 04.',
          target: 'Hipertensi', klaster: 'Posbindu Melati Indah', lampiran: '',
          tanggalPublish: g(-8), tanggalBerakhir: '', aktif: true,
          kanal: 'Pop-up, WhatsApp', terkirim: 98, dibuatOleh: 'Petugas Promkes' },
        { id: 'PGM-2026-0004',
          judul: 'Penyesuaian Jam Layanan Poli PTM Selama Periode Libur Nasional',
          isi: 'Layanan Poli PTM buka pukul 08.00 - 11.00 WIB selama periode libur nasional.',
          target: 'Semua Pasien', klaster: 'Seluruh Klaster', lampiran: '',
          tanggalPublish: g(-24), tanggalBerakhir: g(-2), aktif: false,
          kanal: 'Pop-up', terkirim: 482, dibuatOleh: 'Administrator Faskes' }
      ],

      akun: [
        { email: 'anita.rahayu@puskesmas.go.id', nama: 'dr. Anita Rahayu, Sp.PD', nip: '19870512 201101 2 003',
          peran: 'Super Admin', klaster: 'Puskesmas Sehat Utama Wilayah I', status: 'Disetujui',
          dibuat: g(-400), loginTerakhir: g(0), foto: '' },
        { email: 'farhan.malik@puskesmas-sehat.go.id', nama: 'dr. Farhan Malik', nip: '19910412 201902 1 021',
          peran: 'Admin', klaster: 'Posbindu Cempaka RW 09', status: 'Pending', dibuat: g(0), loginTerakhir: '', foto: '' },
        { email: 'tri.wahyuni@puskesmas-sehat.go.id', nama: 'Ns. Tri Wahyuni, S.Kep', nip: '31740288192',
          peran: 'Admin', klaster: 'Poli PTM Dewasa & Hipertensi', status: 'Pending', dibuat: g(0), loginTerakhir: '', foto: '' },
        { email: 'kader.agussantoso@gmail.com', nama: 'Bpk. Agus Santoso', nip: '3174051808790',
          peran: 'Admin', klaster: 'Posbindu Melati RW 04', status: 'Pending', dibuat: g(-1), loginTerakhir: '', foto: '' },
        { email: 'maya.indriani@puskesmas.go.id', nama: 'dr. Maya Indriani', nip: '31.2.1.100.3.19.804921',
          peran: 'Admin', klaster: 'Posbindu Cempaka RW 09', status: 'Disetujui', dibuat: g(-120), loginTerakhir: g(0), foto: '' },
        { email: 'dimas.pratama@puskesmas.go.id', nama: 'Ns. Dimas Pratama, S.Kep', nip: '31750098231',
          peran: 'Admin', klaster: 'Poli PTM Dewasa & Hipertensi', status: 'Disetujui', dibuat: g(-200), loginTerakhir: g(-1), foto: '' },
        { email: 'hendro.utomo@puskesmas.go.id', nama: 'dr. Hendro Utomo', nip: '31.1.1.209.1.18.903112',
          peran: 'Admin', klaster: 'Puskesmas Keliling Wilayah II', status: 'Ditolak', dibuat: g(-30), loginTerakhir: g(-14), foto: '' }
      ],

      log: [],
      pengaturan: null
    };

    this._bangunKepatuhan();
    this._bangunPengaturan();
  },

  _bangunKepatuhan() {
    const NAMA = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const persen = [82.4, 84.1, 85.6, 86.9, 88.0, 89.2];
    this.db.tren = persen.map((p, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const terjadwal = 62 + i * 4;
      return { label: NAMA[d.getMonth()], terjadwal, hadir: Math.round(terjadwal * p / 100), persen: p };
    });
  },

  _bangunPengaturan() {
    this.db.pengaturan = {
      namaFaskes: CONFIG.NAMA_FASKES,
      milestones: {
        H3: { kode: 'H3', aktif: true, jam: '08:00', wa: true, email: true,
          template: 'Halo Bpk/Ibu {{Nama_Pasien}}, kami dari {{Nama_Klinik}} mengingatkan jadwal kontrol rutin PTM Anda pada {{Tanggal_Kunjungan}} di {{Klaster_Layanan}}. Mohon konfirmasi kesiapan kehadiran Anda.' },
        H1: { kode: 'H1', aktif: true, jam: '09:00', wa: true, email: true,
          template: 'Bpk/Ibu {{Nama_Pasien}}, besok adalah hari pemeriksaan berkala Anda di {{Nama_Klinik}} pukul {{Jam_Kunjungan}}.\n\nINSTRUKSI LABORATORIUM: Bagi pemeriksaan gula/kolesterol, mohon berpuasa 8-10 jam (hanya minum air putih) mulai pukul 22.00 malam ini.\n\nKonfirmasi kehadiran: {{Link_Konfirmasi}}' },
        H0: { kode: 'H0', aktif: true, jam: '06:30', wa: true, email: false,
          template: 'Hari ini adalah jadwal kontrol Anda di {{Nama_Klinik}} pukul {{Jam_Kunjungan}}. Harap membawa KTP/BPJS dan kartu berobat berkala. Jangan lupa bawa sisa obat rutin.' }
      },
      kuota: { harian: 500, terpakai: 94, sisa: 406, batchSize: 80 },
      gateway: { fonnteAktif: false, fonnteMask: '(mode demo)', emailKuotaSisa: 1406, bounceRate: 0.02 },
      triggerHarian: { aktif: true, fungsi: 'jalankanReminderHarian' },
      variabelTersedia: ['{{Nama_Pasien}}', '{{Tanggal_Kunjungan}}', '{{Jam_Kunjungan}}',
                         '{{Jenis_PTM}}', '{{Nama_Klinik}}', '{{Klaster_Layanan}}', '{{Link_Konfirmasi}}']
    };
  },

  /* --------------------------------------------------------------- utils */
  _ok(data, pesan) { return Promise.resolve({ success: true, message: pesan || 'OK', data: data === undefined ? null : data }); },
  _gagal(pesan)    { return Promise.resolve({ success: false, message: pesan, data: null, code: 400 }); },
  _tunda(ms)       { return new Promise(r => setTimeout(r, ms || 260)); },

  _kepatuhanPasien(id) {
    // Hasil deterministik berdasarkan ID agar angka tidak berubah tiap render.
    const benih = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const total = 12;
    const tepat = 9 + (benih % 3);
    return { persen: Math.round((tepat / total) * 1000) / 10, totalSesi: total, tepatWaktu: tepat, tidakHadir: total - tepat };
  },

  /* ------------------------------------------------------------- router */
  async jawab(action, d) {
    this._init();
    await this._tunda();
    const db = this.db;

    switch (action) {

      /* ---- Autentikasi ---- */
      case 'login': {
        const email = String(d.email || '').trim().toLowerCase();
        const akun = db.akun.filter(a => a.email === email)[0];
        if (!akun) return this._gagal('Email belum terdaftar di sistem. (Mode demo: gunakan ' + db.akunAktif.email + ')');
        if (akun.status === 'Pending') return this._gagal('Akun Anda masih menunggu persetujuan Super Admin.');
        if (akun.status === 'Ditolak') return this._gagal('Pengajuan akun Anda ditolak. Hubungi Super Admin faskes.');
        if (String(d.pin || '') !== '123456') return this._gagal('PIN salah. (Mode demo: gunakan PIN 123456)');
        const user = { email: akun.email, nama: akun.nama, peran: akun.peran, klaster: akun.klaster, nip: akun.nip, foto: akun.foto };
        return this._ok({ token: 'demo-token', user }, 'Selamat datang, ' + akun.nama + '.');
      }

      case 'registerStaff':
        return this._ok({ status: 'Pending' },
          'Pendaftaran terkirim. Akun aktif setelah disetujui Super Admin (maks. 1x24 jam kerja). [Mode demo — data tidak tersimpan]');

      case 'pasienLogin': {
        const nik = String(d.nik || '').trim();
        const p = db.pasien.filter(x => x.nik === nik)[0];
        if (!p) return this._gagal('NIK tidak ditemukan. (Mode demo: coba ' + db.pasien[2].nik + ')');
        if (String(d.hp || '').slice(-4) !== p.noHp.slice(-4)) {
          return this._gagal('4 digit terakhir No. HP tidak cocok. (Mode demo: ' + p.noHp.slice(-4) + ')');
        }
        return this._ok({
          token: 'demo-token-pasien',
          user: { nama: p.nama, peran: 'Pasien', idPasien: p.id, klaster: p.klaster, foto: p.foto, email: p.email }
        }, 'Selamat datang, ' + p.nama + '.');
      }

      case 'logout': return this._ok(null, 'Anda telah keluar dari sistem.');
      case 'me':     return this._ok(db.akunAktif);

      /* ---- Muat awal komposit ---- */
      case 'bootstrap': {
        const [dash, pas, set] = await Promise.all([
          this.jawab('dashboard', {}), this.jawab('listPasien', {}), this.jawab('getPengaturan', {})
        ]);
        const hasil = {
          dashboard: dash.data, pasien: pas.data, pengaturan: set.data,
          server: { versi: '1.1.0', waktu: new Date().toISOString() }
        };
        if (API.isSuperAdmin()) hasil.akun = (await this.jawab('listAkun', {})).data;
        return this._ok(hasil, 'Data awal dimuat.');
      }

      /* ---- Dashboard ---- */
      case 'dashboard': {
        const hariIni = UI.hariIni();
        const antrean = db.pasien.filter(p => p.tanggal === hariIni);
        const hadir = antrean.filter(p => p.statusKunjungan === 'Sudah Berkunjung').length;
        return this._ok({
          ringkasan: {
            totalPasien: 482, kontrolHariIni: 28, hadirHariIni: 19, menungguHariIni: 9,
            reminderTerkirim: 94, breakdownReminder: { h3: 42, h1: 34, h0: 18 }, tingkatKepatuhan: 89.2
          },
          antrean: antrean.sort((a, b) => a.jam.localeCompare(b.jam)),
          trenBulanan: db.tren,
          gateway: { waAktif: true, kuotaHarian: 500, terpakai: 94, sisa: 406, namaFaskes: CONFIG.NAMA_FASKES },
          sinkronisasi: new Date().toISOString()
        });
      }

      /* ---- Pasien ---- */
      case 'listPasien': {
        let rows = db.pasien.slice();
        const cari = String(d.cari || '').trim().toLowerCase();
        if (cari) rows = rows.filter(p => p.nama.toLowerCase().indexOf(cari) !== -1 || p.nik.indexOf(cari) !== -1 || p.noBpjs.indexOf(cari) !== -1);
        if (d.jenisPtm) rows = rows.filter(p => p.jenisPtm === d.jenisPtm);
        if (d.statusKunjungan) rows = rows.filter(p => p.statusKunjungan === d.statusKunjungan);
        if (d.klaster) rows = rows.filter(p => p.klaster === d.klaster);
        if (d.filterCepat === 'perluKontak') rows = rows.filter(p => p.tanggal === UI.hariIni() && p.statusKunjungan !== 'Sudah Berkunjung');

        const hal = Number(d.halaman || 1);
        const per = Number(d.perHalaman || CONFIG.PER_HALAMAN);
        return this._ok({
          pasien: rows.slice((hal - 1) * per, hal * per),
          total: rows.length, halaman: hal, perHalaman: per,
          totalHalaman: Math.max(1, Math.ceil(rows.length / per)),
          statistik: { total: 482, hipertensi: 294, diabetes: 146, komorbid: 42, kontrolHariIni: 28 },
          klasterTersedia: ['Klaster PTM Sehat Utama', 'Klaster PTM Melati', 'Klaster PTM Cempaka']
        });
      }

      case 'getPasien': {
        const p = db.pasien.filter(x => x.id === d.id)[0];
        if (!p) return this._gagal('Data pasien tidak ditemukan.');
        const medis = db.medis[p.id] || [];
        const t = medis[0] || {};
        const kp = this._kepatuhanPasien(p.id);

        const riwayat = [];
        for (let i = 0; i < kp.totalSesi; i++) {
          const tgl = this._geser(-30 * (i + 1));
          riwayat.push({
            tanggalJadwal: tgl,
            tanggalAktual: i < kp.tepatWaktu ? tgl : '',
            status: i < kp.tepatWaktu ? 'Hadir' : 'Tidak Hadir',
            keterangan: i < kp.tepatWaktu ? 'Kontrol rutin selesai' : 'Konfirmasi mendadak dinas ke luar kota — dilakukan reschedule H+2.',
            dicatatOleh: p.dokterPj
          });
        }

        return this._ok({
          profil: p, alamat: p.alamat, tanggalLahir: p.tanggalLahir,
          dokterPj: p.dokterPj, kader: p.kader,
          klinisTerkini: {
            tanggal: t.tanggal || '', sistolik: t.sistolik || '', diastolik: t.diastolik || '',
            gdp: t.gdp || '', hba1c: t.hba1c || '', beratBadan: t.beratBadan || '',
            riwayatObat: t.riwayatObat || '', hasilLab: '', fotoResep: ''
          },
          trenTekananDarah: medis.slice().reverse().map(m => ({
            tanggal: m.tanggal, sistolik: m.sistolik, diastolik: m.diastolik, gdp: m.gdp
          })),
          kepatuhan: Object.assign({}, kp, { riwayat }),
          riwayatMedis: medis,
          logReminder: [
            { jenis: 'H-0', channel: 'WhatsApp', waktu: new Date().toISOString(), status: 'Sukses', keterangan: 'Dibaca 07:12 WIB' },
            { jenis: 'H-1', channel: 'Email', waktu: this._geser(-1) + 'T09:00:00', status: 'Sukses', keterangan: 'Terkirim' },
            { jenis: 'H-3', channel: 'WhatsApp', waktu: this._geser(-3) + 'T08:00:00', status: 'Sukses', keterangan: 'Terkirim' }
          ]
        });
      }

      case 'savePasien':
        return this._ok({ id: d.id || 'PTM-2026-0008' },
          (d.id ? 'Data pasien berhasil diperbarui.' : 'Pasien baru berhasil didaftarkan.') + ' [Mode demo — data tidak tersimpan]');

      case 'deletePasien':
        return this._ok(null, 'Data pasien dihapus. [Mode demo — data tidak tersimpan]');

      case 'updateKunjungan': {
        const p = db.pasien.filter(x => x.id === d.id)[0];
        if (p) p.statusKunjungan = d.status === 'Tidak Hadir' ? 'Belum Berkunjung' : d.status;
        return this._ok(null, 'Status kunjungan diperbarui dan tercatat di riwayat kepatuhan.');
      }

      case 'saveRiwayatMedis':
        return this._ok(null, 'Rekam medis berhasil disimpan. [Mode demo]');

      case 'uploadFile':
        return this._ok({ url: '', linkTampilan: '#', id: 'demo', ukuran: 0 }, 'Berkas diterima. [Mode demo — tidak diunggah ke Drive]');

      /* ---- Pengumuman ---- */
      case 'listPengumuman':
        return this._ok({
          pengumuman: db.pengumuman,
          ringkasan: { totalAktif: db.pengumuman.filter(p => p.aktif).length, tertarget: 2, totalPasien: 482, terjangkau: 412 },
          targetTersedia: [
            { nilai: 'Semua Pasien', jumlah: 482 }, { nilai: 'Komorbid (DM+HT)', jumlah: 215 },
            { nilai: 'Hipertensi', jumlah: 169 }, { nilai: 'Diabetes Melitus', jumlah: 98 }
          ]
        });

      case 'savePengumuman':
        return this._ok({ id: d.id || 'PGM-2026-0005' }, (d.id ? 'Pengumuman diperbarui.' : 'Pengumuman berhasil dibuat.') + ' [Mode demo]');

      case 'togglePengumuman': {
        const g2 = db.pengumuman.filter(p => p.id === d.id)[0];
        if (g2) g2.aktif = !!d.aktif;
        return this._ok(null, 'Pengumuman kini ' + (d.aktif ? 'AKTIF' : 'NONAKTIF') + '.');
      }

      case 'siarkanPengumuman':
        return this._ok({ sukses: 215, gagal: 0, targetPasien: 215 },
          'Siaran selesai: 215 pesan berhasil, 0 gagal, ke 215 pasien target. [Mode demo]');

      case 'pengumumanAktif':
        return this._ok(db.pengumuman.filter(p => p.aktif));

      case 'publicInfo':
        return this._ok({
          namaFaskes: CONFIG.NAMA_FASKES, totalPasien: 482, klasterAktif: 3, tingkatKepatuhan: 89.2,
          pengumuman: db.pengumuman.filter(p => p.aktif)
        });

      /* ---- Laporan ---- */
      case 'getLaporan':
        return this._ok({
          periode: { dari: d.dari || '(awal data)', sampai: d.sampai || '(hari ini)' },
          ringkasan: { kepatuhanRata: 89.2, kunjunganTerlaksana: 412, kunjunganTerjadwal: 462,
                       dropOut: 50, persenDropOut: 10.8, efektivitasReminder: 94.6 },
          trenBulanan: db.tren,
          distribusiPtm: [
            { label: 'Diabetes Melitus', jumlah: 173 },
            { label: 'Hipertensi Primer', jumlah: 144 },
            { label: 'Komorbid (HT & DM)', jumlah: 95 }
          ],
          kanal: {
            whatsapp: { total: 1040, sukses: 1024, persen: 98.4 },
            email: { total: 520, sukses: 450, persen: 86.5 }
          },
          perKlaster: [
            { klaster: 'Klaster PTM Sehat Utama', dokter: 'dr. Anita Rahayu', totalPasien: 245,
              terjadwal: 264, hadir: 244, pesan: 490, kepatuhan: 92.4, evaluasi: 'Sangat Baik' },
            { klaster: 'Klaster PTM Melati', dokter: 'dr. Farhan Malik', totalPasien: 138,
              terjadwal: 152, hadir: 132, pesan: 276, kepatuhan: 86.8, evaluasi: 'Baik' },
            { klaster: 'Klaster PTM Cempaka', dokter: 'dr. Maya Indriani', totalPasien: 99,
              terjadwal: 108, hadir: 86, pesan: 198, kepatuhan: 79.5, evaluasi: 'Perlu Peningkatan Edukasi' }
          ],
          totalKasusAktif: 412
        });

      /* ---- Akun ---- */
      case 'listAkun':
        return this._ok({
          akun: db.akun,
          ringkasan: {
            total: 34,
            pending: db.akun.filter(a => a.status === 'Pending').length,
            aktif: 29, ditolak: 2
          }
        });

      case 'verifikasiAkun': {
        const a = db.akun.filter(x => x.email === d.email)[0];
        if (a) a.status = d.status;
        return this._ok(null, 'Akun ' + d.email + ' berhasil di-' + String(d.status).toLowerCase() + '. [Mode demo]');
      }

      case 'resetPin':
        return this._ok(null, 'PIN berhasil direset. [Mode demo]');

      case 'cekStatusAkun': {
        const a2 = db.akun.filter(x => x.email === String(d.email || '').toLowerCase())[0];
        if (!a2) return this._gagal('Email tidak ditemukan dalam antrean verifikasi.');
        return this._ok({ nama: a2.nama, peran: a2.peran, klaster: a2.klaster, status: a2.status, diajukan: a2.dibuat });
      }

      /* ---- Pengaturan & reminder ---- */
      case 'getPengaturan':
        return this._ok(db.pengaturan);

      case 'savePengaturan': {
        const p3 = db.pengaturan;
        if (d.namaFaskes) p3.namaFaskes = d.namaFaskes;
        ['H3', 'H1', 'H0'].forEach(k => { if (d[k]) Object.assign(p3.milestones[k], d[k]); });
        return this._ok(null, 'Konfigurasi pengingat tersimpan. [Mode demo — berlaku sampai halaman dimuat ulang]');
      }

      case 'kirimReminder':
        return this._ok({ detail: ['WhatsApp: berhasil'] }, 'Reminder manual terkirim. [Mode demo]');

      case 'testReminder': {
        const ms = ({ 'H-3': 'H3', 'H-1': 'H1', 'H-0': 'H0' })[d.milestone] || 'H1';
        const tpl = db.pengaturan.milestones[ms].template
          .split('{{Nama_Pasien}}').join('Bpk. Bambang Haryanto (Uji Coba)')
          .split('{{Nama_Klinik}}').join(CONFIG.NAMA_FASKES)
          .split('{{Tanggal_Kunjungan}}').join(UI.tanggal(UI.hariIni(), 'panjang'))
          .split('{{Jam_Kunjungan}}').join('08:30')
          .split('{{Jenis_PTM}}').join('Hipertensi & Diabetes')
          .split('{{Klaster_Layanan}}').join('Klaster Uji Coba')
          .split('{{Link_Konfirmasi}}').join('https://peduliptm.id/x987');
        return this._ok({ pratinjau: tpl, hasil: ['Simulasi sandbox — tidak ada pesan nyata terkirim'] },
          'Uji coba selesai. [Mode demo]');
      }

      case 'listLogReminder':
        return this._ok({ log: [], total: 0, sukses: 0 });

      /* ---- Portal pasien ---- */
      case 'pasienDashboard': {
        const p4 = db.pasien.filter(x => x.id === (API.user && API.user.idPasien))[0] || db.pasien[2];
        const medis4 = db.medis[p4.id] || [];
        const t4 = medis4[0] || {};
        const kp4 = this._kepatuhanPasien(p4.id);
        return this._ok({
          profil: { id: p4.id, nama: p4.nama, nik: p4.nik, usia: p4.usia, jenisPtm: p4.jenisPtm,
                    klaster: p4.klaster, noBpjs: p4.noBpjs, foto: p4.foto, kader: p4.kader, dokterPj: p4.dokterPj },
          jadwal: { tanggal: p4.tanggal, jam: p4.jam, status: p4.statusKunjungan,
                    statusReminder: p4.statusReminder, hariLagi: 0, reminderDiterima: 3 },
          klinis: { tanggal: t4.tanggal || '', sistolik: t4.sistolik || '', diastolik: t4.diastolik || '',
                    gdp: t4.gdp || '', hba1c: t4.hba1c || '', riwayatObat: t4.riwayatObat || '' },
          kepatuhan: Object.assign({}, kp4, {
            riwayat: [
              { tanggalJadwal: p4.tanggal, status: 'Hadir', keterangan: 'Pemeriksaan rutin komorbid, evaluasi lab semesteran, perpanjangan resep 30 hari.' },
              { tanggalJadwal: this._geser(-30), status: 'Hadir', keterangan: 'TD 130/85 mmHg, GDP 130 mg/dL. Edukasi target kalori harian dipatuhi.' },
              { tanggalJadwal: this._geser(-61), status: 'Hadir', keterangan: 'Konsultasi gizi klinis Prolanis & senam lansia.' },
              { tanggalJadwal: this._geser(-92), status: 'Tidak Hadir', keterangan: 'Izin dinas luar kota — reschedule H+2 disetujui kader.' }
            ]
          })
        });
      }

      case 'pasienKonfirmasi':
        return this._ok(null, 'Terima kasih, kehadiran Anda tercatat. Petugas akan memverifikasi saat Anda tiba.');

      case 'registerPasien':
        return this._ok({ id: 'PTM-2026-0099' },
          'Registrasi berhasil! Petugas akan menghubungi Anda untuk penjadwalan kontrol. [Mode demo]');

      default:
        return this._gagal('Action "' + action + '" belum tersedia di mode demo.');
    }
  }
};
