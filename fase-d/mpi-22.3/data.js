'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Masalah Kontekstual Luas Permukaan Prisma
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Tujuan Pembelajaran:
   Menyelesaikan masalah kontekstual yang berkaitan dengan luas
   permukaan prisma.

   Model pembelajaran: PROBLEM BASED LEARNING (PBL).
   Masalah pemantik: "Stand Keripik Kelas IX di Bazar Sekolah".
   Panitia menitipkan surat berisi empat kebutuhan stand:
     • 50 kemasan keripik — tiga desain (A prisma segitiga, B prisma
       trapesium, C balok) dengan ISI SAMA 360 cm³ dan keliling alas
       SAMA 24 cm; karton dijual per lembar 60 cm × 50 cm (Rp4.000);
     • tenda stand prisma segitiga — depan terbuka untuk pembeli dan
       tanpa lantai kain; kain Rp15.000 per m²;
     • etalase kaca balok — alas papan kayu, belakang terbuka;
       kaca Rp150.000 per m²;
     • meja kasir balok dicat kecuali bagian bawah; satu kaleng cat
       untuk 2 m², Rp35.000 per kaleng;
     • dana stand Rp600.000.
   Konflik kognitif: "isi sama → karton sama", "semua benda dihitung
   dengan LP utuh", "5,2 lembar → beli 5", "1 m² = 100 cm²". Hasil
   akhirnya: dana KURANG Rp13.000, sehingga kelompok harus mengambil
   keputusan penghematan yang masuk akal dan menyajikannya.

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ....... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar . 'organisasi'
     Sintaks 3 — Membimbing penyelidikan ............ 'selidikKemasan',
                                                      'selidikSisi',
                                                      'selidikBiaya'
     Sintaks 4 — Mengembangkan & menyajikan karya ... 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi ........ 'evaluasi'
     Penerapan & penutup ............................ 'terapkan', 'refleksi',
                                                      'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — murid menduga, memilah informasi,
       menyusun rencana, memeriksa lembar kerja kelompok lain, lalu
       merefleksikan strateginya.
     • Bermakna (meaningful) — setiap perhitungan menjawab kebutuhan
       nyata stand dan berujung pada keputusan anggaran.
     • Menggembirakan (joyful) — lab lipat jaring, memilih sisi
       langsung pada jaring-jaring, umpan balik yang menunjuk letak
       kekeliruan, dan Papan Proposal yang dipresentasikan.

   Rangkaian aktivitas (± 2 × 40 menit; kelompok 3–4 murid):
     1. Orientasi   (8')  — surat panitia, dugaan awal (tidak dinilai),
                            rumusan masalah inti, hipotesis kelompok.
     2. Organisasi  (6')  — memilih peran, memilah informasi
                            (diketahui/ditanya/tidak diperlukan),
                            menyusun urutan rencana penyelesaian.
     3. Kemasan     (12') — Lab Bentang tiga desain kemasan, kartu data
                            La, K, LP berdiagnosa, memilih desain
                            paling hemat karton.
     4. Sisi bahan  (12') — Pemilih Sisi pada jaring-jaring tenda,
                            etalase, dan meja: sisi mana yang memakai
                            bahan? lalu menghitung luas bahannya.
     5. Anggaran    (12') — kartu banyak lembar/kaleng (pembulatan ke
                            atas), konversi cm² → m², biaya; tabel
                            anggaran vs dana; pertanyaan penuntun.
     6. Karya       (10') — keputusan kemasan & penghematan, Papan
                            Proposal otomatis, kalimat presentasi.
     7. Evaluasi    (8')  — menilai lembar kerja Kelompok Elang langkah
                            demi langkah, menarik pelajaran, refleksi
                            proses & hipotesis.
     8. Uji terap   (8')  — 8 soal kontekstual berdiagnosa.
     9. Refleksi    (4')  — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/
   ensureTapOrderState()/shuffleArray() dari shared/engine.js, satu kali
   saat state disiapkan.

   Semua kunci (luas alas, keliling, luas sisi yang dipakai, banyak
   lembar/kaleng, konversi, biaya, anggaran, pengecoh soal) dihitung
   ulang dengan engine seksi 47–48 di tests/mpi-22.3-data.test.js.
   ============================================================ */

var PBL = 'Problem Based Learning';

var DATA = {
  /* ----------------------------------------------------------
     MASALAH PEMANTIK — dipakai di beberapa tahap
     ---------------------------------------------------------- */
  kemasan: [
    {
      id: 'A',
      nama: 'Kemasan A',
      bentuk: 'prisma segitiga',
      alas: [
        [0, 0],
        [8, 0],
        [0, 6],
      ],
      t: 15,
      infoAlas: 'segitiga siku-siku dengan sisi siku-siku 6 cm dan 8 cm (sisi miring 10 cm).',
      alasPersegiPanjang: false,
      caraLuasAlas: '½ × 8 × 6',
    },
    {
      id: 'B',
      nama: 'Kemasan B',
      bentuk: 'prisma trapesium',
      alas: [
        [0, 0],
        [9, 0],
        [6, 4],
        [0, 4],
      ],
      t: 12,
      infoAlas:
        'trapesium siku-siku: sisi sejajar 9 cm dan 6 cm, tinggi trapesium 4 cm, sisi miring 5 cm.',
      alasPersegiPanjang: false,
      caraLuasAlas: '½ × (9 + 6) × 4',
    },
    {
      id: 'C',
      nama: 'Kemasan C',
      bentuk: 'balok beralas persegi',
      alas: [
        [0, 0],
        [6, 0],
        [6, 6],
        [0, 6],
      ],
      t: 10,
      infoAlas: 'persegi dengan sisi 6 cm.',
      alasPersegiPanjang: true,
      caraLuasAlas: '6 × 6',
    },
  ],
  isiKemasan: 360,
  banyakKemasan: 50,
  karton: { panjang: 60, lebar: 50, harga: 4000 },

  /* Benda stand yang TIDAK memakai bahan di semua sisinya. */
  benda: [
    {
      id: 'tenda',
      nama: '⛺ Tenda stand',
      bahan: 'kain',
      alas: [
        [0, 0],
        [4, 0],
        [2, 1.5],
      ],
      t: 5,
      satuan: 'm',
      satuanLuas: 'm²',
      bentukAlas: 'segitiga: alas 4 m, tinggi 1,5 m, kaki 2,5 m',
      cerita:
        'Tenda berbentuk prisma segitiga dengan panjang 5 m. Bagian depan dibiarkan terbuka agar pembeli bisa datang, dan lantainya tanah lapang (tidak memakai kain). Atap kiri, atap kanan, dan dinding belakang ditutup kain.',
      namaSisi: {
        alas: 'Dinding depan',
        atas: 'Dinding belakang',
        t0: 'Lantai',
        t1: 'Atap kanan',
        t2: 'Atap kiri',
      },
      dipakai: ['atas', 't1', 't2'],
      alasan:
        'Kain dipakai untuk atap kiri, atap kanan, dan dinding belakang. Dinding depan terbuka dan lantai tidak berkain.',
      infoLuas:
        'Dinding belakang = ½ × 4 × 1,5. Setiap atap berbentuk persegi panjang 2,5 m × 5 m.',
    },
    {
      id: 'etalase',
      nama: '🪟 Etalase kaca',
      bahan: 'kaca',
      alas: [
        [0, 0],
        [60, 0],
        [60, 30],
        [0, 30],
      ],
      t: 40,
      satuan: 'cm',
      satuanLuas: 'cm²',
      bentukAlas: 'persegi panjang 60 cm × 30 cm',
      cerita:
        'Etalase berbentuk balok: panjang 60 cm, lebar 30 cm, tinggi 40 cm. Alasnya papan kayu (bukan kaca), dan sisi belakangnya terbuka agar penjual bisa mengambil keripik. Sisi lainnya kaca.',
      namaSisi: {
        alas: 'Sisi bawah',
        atas: 'Sisi atas',
        t0: 'Sisi depan',
        t1: 'Sisi kanan',
        t2: 'Sisi belakang',
        t3: 'Sisi kiri',
      },
      dipakai: ['atas', 't0', 't1', 't3'],
      alasan:
        'Kaca dipakai untuk sisi atas, depan, kanan, dan kiri. Sisi bawah memakai papan kayu dan sisi belakang terbuka.',
      infoLuas: 'Sisi atas 60 × 30, sisi depan 60 × 40, sisi kanan dan kiri masing-masing 30 × 40.',
    },
    {
      id: 'meja',
      nama: '🎨 Meja kasir',
      bahan: 'cat',
      alas: [
        [0, 0],
        [120, 0],
        [120, 60],
        [0, 60],
      ],
      t: 75,
      satuan: 'cm',
      satuanLuas: 'cm²',
      bentukAlas: 'persegi panjang 120 cm × 60 cm',
      cerita:
        'Meja kasir berbentuk balok tertutup: panjang 120 cm, lebar 60 cm, tinggi 75 cm. Seluruh bagian luarnya dicat, kecuali bagian bawah yang menempel ke lantai.',
      namaSisi: {
        alas: 'Sisi bawah',
        atas: 'Sisi atas',
        t0: 'Sisi depan',
        t1: 'Sisi kanan',
        t2: 'Sisi belakang',
        t3: 'Sisi kiri',
      },
      dipakai: ['atas', 't0', 't1', 't2', 't3'],
      alasan:
        'Semua sisi dicat kecuali sisi bawah. Luasnya = luas alas + keliling alas × tinggi (seperti kotak tanpa tutup yang dibalik).',
      infoLuas: 'Luas yang dicat = luas sisi atas + keliling alas × tinggi = 120 × 60 + 360 × 75.',
    },
  ],
  kain: { harga: 15000 },
  kaca: { harga: 150000 },
  cat: { luasPerKaleng: 2, harga: 35000 },
  dana: 600000,

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI PADA MASALAH (PBL sintaks 1)
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi pada Masalah',
    syntax: PBL + ' · Sintaks 1',
    goal: 'Memahami masalah nyata persiapan stand bazar dan menyampaikan dugaan awal kelompok.',
    tp: 'Menyelesaikan masalah kontekstual yang berkaitan dengan luas permukaan prisma.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menentukan sisi-sisi prisma yang benar-benar memakai bahan pada benda nyata.',
      'Menghitung luas permukaan prisma, utuh maupun sebagian, untuk menyelesaikan masalah.',
      'Mengubah satuan luas dan menentukan banyak bahan yang dibeli dengan pembulatan yang tepat.',
      'Menghitung biaya lalu mengambil dan menyajikan keputusan berdasarkan hasil perhitungan.',
    ],
    guru: 'Bacakan surat panitia dengan antusias. Tanyakan: “Kalau isi ketiga kemasan sama, apakah kartonnya juga sama?” dan “Apakah tenda perlu kain di semua sisinya?” Jangan membenarkan dugaan murid — dugaan ini diuji sendiri pada tahap penyelidikan dan evaluasi.',
    judul: 'Stand Keripik Kelas IX di Bazar Sekolah',
    pengantar:
      'Kelas IX akan membuka stand keripik di Bazar Sekolah. Panitia mengirim surat berisi kebutuhan stand. Kelompokmu ditunjuk menjadi tim perencana: menghitung bahan yang benar-benar dibutuhkan, biayanya, dan memastikan dananya cukup.',
    surat: [
      {
        id: 'sKemasan',
        ikon: '📦',
        judul: 'Kemasan keripik',
        butir: [
          'Dibutuhkan 50 kemasan. Ada tiga desain, A, B, dan C, yang isinya sama, yaitu 360 cm³.',
          'Karton dijual per lembar berukuran 60 cm × 50 cm, seharga Rp4.000 per lembar.',
        ],
      },
      {
        id: 'sTenda',
        ikon: '⛺',
        judul: 'Tenda stand',
        butir: [
          'Prisma segitiga dengan panjang 5 m. Rangka segitiganya beralas 4 m, tinggi 1,5 m, kaki 2,5 m.',
          'Depan terbuka untuk pembeli dan lantainya tanpa kain. Harga kain Rp15.000 per m².',
        ],
      },
      {
        id: 'sEtalase',
        ikon: '🪟',
        judul: 'Etalase kaca',
        butir: [
          'Balok 60 cm × 30 cm × 40 cm, beralas papan kayu, dengan sisi belakang terbuka.',
          'Harga kaca Rp150.000 per m².',
        ],
      },
      {
        id: 'sMeja',
        ikon: '🎨',
        judul: 'Meja kasir',
        butir: [
          'Balok 120 cm × 60 cm × 75 cm, dicat kecuali bagian bawah.',
          'Satu kaleng cat cukup untuk 2 m², harganya Rp35.000 per kaleng.',
        ],
      },
      {
        id: 'sDana',
        ikon: '💰',
        judul: 'Dana stand',
        butir: ['Dana yang tersedia Rp600.000 untuk semua bahan di atas.'],
      },
    ],
    dugaan: [
      {
        id: 'd1',
        tanya: 'Menurut kelompokmu, kemasan mana yang paling hemat karton?',
        opsi: [
          { id: 'A', label: 'Kemasan A (prisma segitiga)' },
          { id: 'B', label: 'Kemasan B (prisma trapesium)' },
          { id: 'C', label: 'Kemasan C (balok beralas persegi)' },
          { id: 'sama', label: 'Sama saja, karena isinya sama' },
        ],
      },
      {
        id: 'd2',
        tanya: 'Menurut kelompokmu, apakah dana Rp600.000 cukup untuk semua bahan?',
        opsi: [
          { id: 'cukup', label: 'Cukup, bahkan masih ada sisa' },
          { id: 'pas', label: 'Pas, tidak bersisa' },
          { id: 'kurang', label: 'Kurang' },
          { id: 'ragu', label: 'Belum tahu, harus dihitung dulu' },
        ],
      },
    ],
    alasanLabel: 'Tuliskan alasan dugaan kelompokmu.',
    alasanPlaceholder: 'Kami menduga begitu karena …',
    catatanDugaan: 'Dugaan tidak dinilai. Kalian akan mengujinya sendiri pada tahap penyelidikan.',
    pertanyaan: 'Apa pertanyaan inti yang harus diselesaikan kelompokmu?',
    masalahOpsi: [
      {
        id: 'inti',
        label:
          'Berapa banyak bahan yang benar-benar dibutuhkan stand, berapa biayanya, dan apakah dana Rp600.000 cukup?',
      },
      { id: 'isi', label: 'Berapa banyak keripik yang muat di dalam setiap kemasan?' },
      { id: 'untung', label: 'Berapa keuntungan yang didapat dari berjualan keripik?' },
      { id: 'rangka', label: 'Berapa panjang besi yang dibutuhkan untuk rangka tenda?' },
    ],
    masalahCorrect: 'inti',
    masalahUmpan: {
      inti: 'Tepat! Semua kebutuhan stand (karton, kain, kaca, cat) bergantung pada luas bahan yang benar-benar dipakai, lalu biayanya dibandingkan dengan dana.',
      isi: 'Banyak isi berhubungan dengan volume. Panitia justru bertanya tentang BAHAN pembungkus dan biayanya.',
      untung:
        'Surat panitia tidak memuat data penjualan. Fokuslah pada bahan yang harus disiapkan dan dananya.',
      rangka:
        'Panjang rangka dihitung dari rusuk, bukan luas. Panitia menanyakan kain, karton, kaca, dan cat.',
    },
    hipotesisLabel:
      'Tulis hipotesis kelompokmu: langkah apa yang akan kalian lakukan untuk menghitung bahan setiap benda?',
    hipotesisPlaceholder: 'Menurut kami, pertama-tama kita harus …',
    nextLabel: 'Lanjut: Atur Kelompok →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENGORGANISASI MURID (PBL sintaks 2)
     ---------------------------------------------------------- */
  organisasi: {
    kicker: 'Tahap 2 · Mengorganisasi Belajar',
    syntax: PBL + ' · Sintaks 2',
    goal: 'Membagi peran, memilah informasi dari surat panitia, dan menyusun rencana penyelesaian.',
    guru: 'Pastikan setiap anggota memegang satu peran dan peran ditukar pada pertemuan berikutnya. Saat pemilahan, minta kelompok menjelaskan mengapa harga jual keripik tidak diperlukan. Rencana yang tersusun menjadi peta langkah pada tiga penyelidikan berikutnya.',
    peranLabel: 'Pilih peranmu di kelompok:',
    peran: [
      {
        id: 'ketua',
        label:
          '🧭 <strong>Ketua Tim</strong> — memastikan semua anggota berpendapat dan rencana diikuti.',
      },
      {
        id: 'ukur',
        label:
          '📏 <strong>Juru Ukur</strong> — menentukan sisi yang memakai bahan beserta ukurannya.',
      },
      {
        id: 'hitung',
        label: '🧮 <strong>Juru Hitung</strong> — menghitung luas dan mengubah satuan luas.',
      },
      {
        id: 'bendahara',
        label:
          '💰 <strong>Bendahara</strong> — menghitung banyak bahan yang dibeli, biaya, dan sisa dana.',
      },
    ],
    judulPilah: 'Pilah informasi dari surat panitia',
    opsiPilah: [
      { id: 'diketahui', label: 'Diketahui' },
      { id: 'ditanya', label: 'Ditanya' },
      { id: 'tidakPerlu', label: 'Tidak diperlukan' },
    ],
    pilah: [
      {
        id: 'i1',
        teks: 'Satu lembar karton berukuran 60 cm × 50 cm seharga Rp4.000.',
        correct: 'diketahui',
        explanation: 'Ukuran dan harga karton dipakai untuk menghitung banyak lembar dan biayanya.',
      },
      {
        id: 'i2',
        teks: 'Bagian depan tenda terbuka dan lantai tenda tidak memakai kain.',
        correct: 'diketahui',
        explanation: 'Informasi ini menentukan sisi tenda mana yang memakai kain.',
      },
      {
        id: 'i3',
        teks: 'Satu kaleng cat cukup untuk 2 m².',
        correct: 'diketahui',
        explanation: 'Daya sebar cat dipakai untuk menghitung banyak kaleng.',
      },
      {
        id: 'i4',
        teks: 'Desain kemasan mana yang paling sedikit memakai karton?',
        correct: 'ditanya',
        explanation: 'Ini keputusan pertama yang harus dijawab kelompok.',
      },
      {
        id: 'i5',
        teks: 'Berapa m² kaca yang harus dipesan untuk etalase?',
        correct: 'ditanya',
        explanation: 'Luas kaca dibutuhkan untuk memesan dan menghitung biayanya.',
      },
      {
        id: 'i6',
        teks: 'Berapa total biaya bahan, dan cukupkah dana Rp600.000?',
        correct: 'ditanya',
        explanation: 'Ini pertanyaan inti yang akan disajikan dalam proposal.',
      },
      {
        id: 'i7',
        teks: 'Keripik akan dijual Rp10.000 per kemasan.',
        correct: 'tidakPerlu',
        explanation: 'Harga jual tidak memengaruhi banyak bahan maupun biaya bahan.',
      },
      {
        id: 'i8',
        teks: 'Bazar dimulai pukul 07.30 di lapangan sekolah.',
        correct: 'tidakPerlu',
        explanation: 'Waktu dan tempat bazar tidak dipakai dalam perhitungan.',
      },
    ],
    judulRencana: 'Susun rencana penyelesaian kelompok',
    instruksiRencana: 'Ketuk langkah-langkah berikut sesuai urutan yang paling masuk akal.',
    rencana: [
      { id: 'r1', label: '🔍 Tentukan sisi-sisi yang benar-benar memakai bahan' },
      { id: 'r2', label: '📐 Hitung luas sisi-sisi itu (rumus LP bila semua sisi dipakai)' },
      { id: 'r3', label: '🔁 Samakan satuan dan kalikan dengan banyak benda' },
      { id: 'r4', label: '⬆️ Hitung banyak bahan yang dibeli (bulatkan ke atas)' },
      { id: 'r5', label: '💰 Hitung biaya lalu bandingkan dengan dana' },
    ],
    rencanaSukses:
      '<strong>Rencana tersusun!</strong> Sisi bahan → luas → satuan & banyak benda → banyak bahan dibeli → biaya. Rencana ini kalian jalankan pada tiga penyelidikan berikutnya.',
    nextLabel: 'Mulai Penyelidikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENYELIDIKAN 1: KEMASAN (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikKemasan: {
    kicker: 'Tahap 3 · Penyelidikan 1 — Kemasan',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menghitung luas permukaan tiga desain kemasan dan memilih yang paling hemat karton.',
    guru: 'Biarkan murid melipat–membuka jaring di Lab Bentang untuk melihat semua sisi kemasan. Saat mengisi kartu, pantau kesalahan “lupa ½” pada segitiga/trapesium dan “luas alas × tinggi”. Soroti bahwa isi dan keliling alas ketiga kemasan sama, tetapi luas permukaannya berbeda.',
    instruksi:
      'Semua kemasan memakai karton di SEMUA sisinya, jadi luas kartonnya = luas permukaan prisma. Pakai Lab Bentang untuk melihat ukuran setiap sisi, lalu isi kartu data ketiga kemasan.',
    instruksiData: 'Hitung luas alas, keliling alas, lalu luas permukaan setiap kemasan.',
    tanya: [
      {
        id: 'k1',
        tanya: 'Kemasan mana yang paling hemat karton?',
        opsi: [
          { id: 'C', label: 'Kemasan C' },
          { id: 'B', label: 'Kemasan B' },
          { id: 'A', label: 'Kemasan A' },
          { id: 'sama', label: 'Ketiganya sama' },
        ],
        correct: 'C',
        umpan: {
          C: 'Tepat! Luas permukaan kemasan C 312 cm², paling kecil di antara ketiganya.',
          B: 'Luas permukaan B 348 cm², masih lebih besar daripada salah satu kemasan lain. Bandingkan lagi.',
          A: 'Luas permukaan A 408 cm², justru yang paling besar. Bandingkan lagi.',
          sama: 'Isinya memang sama, tetapi coba bandingkan luas permukaan di kartu data: 408, 348, dan 312 cm².',
        },
      },
      {
        id: 'k2',
        tanya:
          'Isi ketiga kemasan sama (360 cm³) dan keliling alasnya juga sama (24 cm). Apa yang dapat disimpulkan?',
        opsi: [
          {
            id: 'beda',
            label:
              'Isi yang sama belum tentu memakai karton yang sama; luas permukaan harus dihitung',
          },
          { id: 'sama', label: 'Isi yang sama berarti kartonnya pasti sama' },
          { id: 'tinggi', label: 'Kemasan yang paling tinggi pasti paling hemat karton' },
          { id: 'keliling', label: 'Keliling alas yang sama membuat luas permukaan sama' },
        ],
        correct: 'beda',
        umpan: {
          beda: 'Tepat! Luas permukaan bergantung pada luas alas DAN hasil kali keliling alas dengan tinggi, bukan pada isinya.',
          sama: 'Data kartu menunjukkan 408, 348, dan 312 cm² untuk isi yang sama. Coba pilih yang lain.',
          tinggi:
            'Kemasan A paling tinggi (15 cm) justru paling boros karton. Coba pilih yang lain.',
          keliling:
            'Keliling alas ketiganya 24 cm, tetapi luas permukaannya berbeda karena luas alas dan tingginya berbeda.',
        },
      },
    ],
    temuan:
      'Kemasan C dipilih: 312 cm² karton per kemasan. Untuk semua sisi prisma, luas bahan = LP = 2 × La + K × t.',
    nextLabel: 'Lanjut: Penyelidikan 2 →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENYELIDIKAN 2: SISI YANG MEMAKAI BAHAN
     ---------------------------------------------------------- */
  selidikSisi: {
    kicker: 'Tahap 4 · Penyelidikan 2 — Sisi yang Memakai Bahan',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menentukan sisi yang benar-benar memakai bahan pada tenda, etalase, dan meja, lalu menghitung luas bahannya.',
    guru: 'Minta Juru Ukur membacakan cerita setiap benda sebelum memilih sisi. Tanyakan: “Sisi mana yang terbuka? Sisi mana yang memakai bahan lain?” Setelah dua kali mencoba, media menunjukkan nama sisi yang keliru. Tekankan: rumus LP utuh hanya dipakai bila semua sisi memakai bahan.',
    instruksi:
      'Baca cerita setiap benda. Ketuk sisi-sisi yang memakai bahan, langsung pada jaring-jaring atau pada tombol nama sisi, lalu periksa. Setelah tepat, hitung luas bahannya.',
    tanya: [
      {
        id: 's1',
        tanya: 'Kapan rumus luas permukaan prisma TIDAK dipakai secara utuh?',
        opsi: [
          {
            id: 'terbuka',
            label: 'Saat ada sisi yang terbuka, menempel benda lain, atau memakai bahan lain',
          },
          { id: 'besar', label: 'Saat ukuran bendanya sangat besar' },
          { id: 'segitiga', label: 'Saat alas prismanya berbentuk segitiga' },
          { id: 'selalu', label: 'Tidak pernah; rumus LP selalu dipakai utuh' },
        ],
        correct: 'terbuka',
        umpan: {
          terbuka:
            'Tepat! Kita hanya menjumlahkan luas sisi yang memakai bahan, seperti pada tenda, etalase, dan meja.',
          besar:
            'Besar kecilnya benda tidak mengubah sisi mana yang memakai bahan. Coba pilih yang lain.',
          segitiga:
            'Bentuk alas tidak menentukan. Tenda beralas segitiga tidak memakai kain di depan dan lantai karena terbuka. Coba pilih yang lain.',
          selalu:
            'Pada tenda, LP utuh 51 m² padahal kain yang dibutuhkan hanya 28 m². Coba pilih yang lain.',
        },
      },
      {
        id: 's2',
        tanya:
          'Meja kasir dicat kecuali bagian bawahnya. Cara cepat menghitung luas yang dicat adalah …',
        opsi: [
          { id: 'kurangAlas', label: 'La + K × t (LP dikurangi satu luas alas)' },
          { id: 'lp', label: '2 × La + K × t' },
          { id: 'selimut', label: 'K × t saja' },
          { id: 'volume', label: 'La × t' },
        ],
        correct: 'kurangAlas',
        umpan: {
          kurangAlas:
            'Tepat! Hanya satu sisi alas (sisi atas) yang dicat, ditambah semua sisi tegak: 7.200 + 360 × 75 = 34.200 cm².',
          lp: 'Itu LP utuh, termasuk sisi bawah yang tidak dicat. Coba pilih yang lain.',
          selimut: 'K × t hanya sisi tegak. Sisi atas meja juga dicat. Coba pilih yang lain.',
          volume: 'La × t adalah volume (isi) meja, bukan luas yang dicat. Coba pilih yang lain.',
        },
      },
    ],
    temuan:
      'Luas bahan = jumlah luas sisi yang memakai bahan. LP utuh (2 × La + K × t) hanya dipakai bila semua sisi memakai bahan.',
    nextLabel: 'Lanjut: Penyelidikan 3 →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENYELIDIKAN 3: ANGGARAN
     ---------------------------------------------------------- */
  selidikBiaya: {
    kicker: 'Tahap 5 · Penyelidikan 3 — Bahan & Anggaran',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menghitung banyak bahan yang dibeli, mengubah satuan luas, menghitung biaya, dan membandingkannya dengan dana.',
    guru: 'Bendahara memimpin tahap ini. Pantau dua kekeliruan klasik: membulatkan 5,2 lembar menjadi 5, dan menganggap 1 m² = 100 cm². Minta kelompok menjelaskan mengapa bahan dibulatkan ke atas sedangkan banyak benda yang bisa dibuat dibulatkan ke bawah.',
    instruksi:
      'Isi kartu setiap bahan. Tulis uang tanpa “Rp”, boleh memakai titik ribuan (contoh 24.000), dan desimal dengan koma (contoh 0,66).',
    tanya: [
      {
        id: 'b1',
        tanya: 'Mengapa 5,2 lembar karton dibulatkan menjadi 6 lembar?',
        opsi: [
          {
            id: 'cukup',
            label: 'Agar karton cukup; 5 lembar hanya 15.000 cm², kurang dari 15.600 cm²',
          },
          { id: 'dekat', label: 'Karena 5,2 lebih dekat ke 6 daripada ke 5' },
          { id: 'aturan', label: 'Karena semua bilangan desimal selalu dibulatkan ke atas' },
          { id: 'murah', label: 'Agar biayanya lebih murah' },
        ],
        correct: 'cukup',
        umpan: {
          cukup:
            'Tepat! Bahan yang dibeli harus cukup, jadi hasil bagi dibulatkan ke atas walau desimalnya kecil.',
          dekat:
            'Justru 5,2 lebih dekat ke 5. Pembulatan di sini bukan soal dekat-jauh, melainkan soal cukup atau tidak.',
          aturan:
            'Tidak selalu. Banyak benda yang bisa dibuat justru dibulatkan ke bawah. Lihat pertanyaan berikutnya.',
          murah: '6 lembar lebih mahal daripada 5 lembar. Alasannya adalah agar karton cukup.',
        },
      },
      {
        id: 'b2',
        tanya: '1 m² sama dengan …',
        opsi: [
          { id: '10000', label: '10.000 cm²' },
          { id: '100', label: '100 cm²' },
          { id: '1000', label: '1.000 cm²' },
          { id: '1000000', label: '1.000.000 cm²' },
        ],
        correct: '10000',
        umpan: {
          10000: 'Tepat! 1 m² = 100 cm × 100 cm = 10.000 cm².',
          100: '1 m = 100 cm adalah satuan PANJANG. Persegi 1 m × 1 m = 100 cm × 100 cm. Hitung lagi.',
          1000: 'Satuan luas naik 100 kali per tingkat: m² → dm² → cm². Hitung lagi.',
          1000000: '1.000.000 adalah faktor m² ke mm². Hitung lagi untuk cm².',
        },
      },
      {
        id: 'b3',
        tanya:
          'Seandainya hanya 5 lembar karton (15.000 cm²) yang dibeli, paling banyak berapa kemasan C yang bisa dibuat?',
        cek: { jenis: 'muat', luasTersedia: 15000, luasSatu: 312 },
        opsi: [
          { id: '48', label: '48 kemasan' },
          { id: '49', label: '49 kemasan' },
          { id: '50', label: '50 kemasan' },
          { id: '47', label: '47 kemasan' },
        ],
        correct: '48',
        umpan: {
          48: 'Tepat! 15.000 : 312 ≈ 48,08. Kemasan ke-49 tidak cukup kartonnya, jadi dibulatkan ke bawah.',
          49: 'Untuk 49 kemasan dibutuhkan 49 × 312 = 15.288 cm², lebih dari 15.000 cm². Benda yang bisa dibuat dibulatkan ke bawah.',
          50: '50 kemasan butuh 15.600 cm². Karton 15.000 cm² tidak cukup.',
          47: '47 kemasan memang bisa dibuat, tetapi masih ada karton untuk satu kemasan lagi.',
        },
      },
    ],
    temuan:
      'Bahan yang DIBELI dibulatkan ke atas agar cukup; banyak benda yang BISA DIBUAT dibulatkan ke bawah. Ingat 1 m² = 10.000 cm².',
    nextLabel: 'Lanjut: Susun Karya →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGEMBANGKAN & MENYAJIKAN KARYA (PBL sintaks 4)
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 6 · Menyajikan Karya',
    syntax: PBL + ' · Sintaks 4',
    goal: 'Mengambil keputusan penghematan berdasarkan perhitungan, lalu menyusun dan menyajikan Papan Proposal kelompok.',
    guru: 'Minta setiap kelompok mempresentasikan Papan Proposal (1–2 menit) di depan kelas atau dalam galeri berjalan. Kelompok lain memberi satu pujian dan satu pertanyaan. Tekankan bahwa setiap keputusan harus didukung hasil hitung.',
    instruksi:
      'Hasil penyelidikan menunjukkan dana stand KURANG. Ambil keputusan yang masuk akal, lalu susun proposal untuk panitia.',
    tanya: [
      {
        id: 'p1',
        tanya: 'Mengapa kelompok memilih kemasan C?',
        opsi: [
          {
            id: 'lp',
            label: 'Isi ketiga kemasan sama, tetapi luas permukaan C paling kecil (312 cm²)',
          },
          { id: 'isi', label: 'Isi kemasan C paling banyak' },
          { id: 'keliling', label: 'Keliling alas kemasan C paling kecil' },
          { id: 'pendek', label: 'Kemasan C paling pendek, jadi pasti paling hemat' },
        ],
        correct: 'lp',
        umpan: {
          lp: 'Tepat! Keputusan didukung hasil hitung luas permukaan.',
          isi: 'Isi ketiga kemasan sama, 360 cm³. Coba pilih yang lain.',
          keliling: 'Keliling alas ketiganya sama, 24 cm. Coba pilih yang lain.',
          pendek:
            'Paling pendek belum tentu paling hemat; luas alas C justru paling besar. Yang menentukan adalah LP hasil hitung.',
        },
      },
      {
        id: 'p2',
        tanya:
          'Dana kurang Rp13.000. Usulan penghematan mana yang TEPAT dan tetap membuat semua kebutuhan terpenuhi?',
        opsi: [
          {
            id: 'belakang',
            label:
              'Stand didirikan menempel tembok sekolah, sehingga dinding belakang tenda tidak perlu kain',
          },
          { id: 'kemasanA', label: 'Mengganti kemasan menjadi desain A' },
          { id: 'lembar5', label: 'Membeli 5 lembar karton saja' },
          { id: 'cat1', label: 'Membeli 1 kaleng cat saja' },
        ],
        correct: 'belakang',
        umpan: {
          belakang:
            'Tepat! Kain berkurang 3 m² (½ × 4 × 1,5), hemat 3 × Rp15.000 = Rp45.000, dan tenda tetap berfungsi.',
          kemasanA:
            'Kemasan A butuh 408 × 50 = 20.400 cm² → 7 lembar (Rp28.000), justru lebih mahal. Coba pilih yang lain.',
          lembar5:
            '5 lembar hanya cukup untuk 48 kemasan, padahal pesanan 50 kemasan. Coba pilih yang lain.',
          cat1: '1 kaleng hanya cukup untuk 2 m², padahal yang dicat 3,42 m². Coba pilih yang lain.',
        },
      },
    ],
    hemat: { benda: 'tenda', buang: 'atas' },
    proposalJudul: 'Proposal Kebutuhan Stand Keripik Kelas IX',
    presentasiLabel:
      'Tulis kalimat presentasi kelompokmu untuk panitia (keputusan + alasan berdasarkan hitungan).',
    presentasiPlaceholder:
      'Kami memilih kemasan C karena … Kain tenda yang dibutuhkan … Total biaya … sehingga …',
    penutup:
      'Semua angka dihitung dari luas sisi yang benar-benar memakai bahan, dengan satuan dan pembulatan yang tepat.',
    nextLabel: 'Lanjut: Evaluasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENGANALISIS & MENGEVALUASI (PBL sintaks 5)
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 7 · Analisis & Evaluasi',
    syntax: PBL + ' · Sintaks 5',
    goal: 'Mengevaluasi proses penyelesaian masalah: memeriksa lembar kerja kelompok lain dan merefleksikan strategi sendiri.',
    guru: 'Bahas bersama langkah-langkah yang keliru pada lembar kerja Kelompok Elang. Minta kelompok membandingkan hipotesis awal dengan hasil penyelidikan dan menuliskan satu hal yang akan mereka lakukan berbeda.',
    lembarJudul: '📝 Lembar kerja Kelompok Elang',
    instruksiLembar:
      'Kelompok Elang menyelesaikan masalah yang sama. Periksa setiap langkah mereka: benar atau keliru?',
    opsiNilai: [
      { id: 'benar', label: '✓ Benar' },
      { id: 'keliru', label: '✗ Keliru' },
    ],
    langkah: [
      {
        id: 'e1',
        teks: 'Kain tenda = LP prisma = 2 × 3 + 9 × 5 = 51 m².',
        correct: 'keliru',
        explanation:
          'Depan tenda terbuka dan lantainya tanpa kain. Kain hanya untuk atap kiri, atap kanan, dan dinding belakang: 28 m².',
      },
      {
        id: 'e2',
        teks: 'Luas satu sisi atap = 2,5 × 5 = 12,5 m².',
        correct: 'benar',
        explanation: 'Atap berbentuk persegi panjang 2,5 m × 5 m.',
      },
      {
        id: 'e3',
        teks: 'Karton 50 kemasan: 15.600 : 3.000 = 5,2, jadi dibeli 5 lembar.',
        correct: 'keliru',
        explanation: '5 lembar hanya 15.000 cm², tidak cukup. Bahan dibulatkan ke atas: 6 lembar.',
      },
      {
        id: 'e4',
        teks: 'Kaca etalase 6.600 cm² = 0,66 m².',
        correct: 'benar',
        explanation: '6.600 : 10.000 = 0,66 m².',
      },
      {
        id: 'e5',
        teks: 'Luas meja yang dicat 34.200 cm² = 342 m².',
        correct: 'keliru',
        explanation: '1 m² = 10.000 cm², jadi 34.200 cm² = 3,42 m², bukan dibagi 100.',
      },
      {
        id: 'e6',
        teks: 'Cat: 3,42 m² : 2 m² = 1,71, jadi dibeli 2 kaleng.',
        correct: 'benar',
        explanation: 'Kaleng cat dibeli utuh dan harus cukup, jadi dibulatkan ke atas.',
      },
      {
        id: 'e7',
        teks: 'Kemasan C paling hemat karena isinya paling besar.',
        correct: 'keliru',
        explanation:
          'Isi ketiga kemasan sama. Kemasan C paling hemat karena luas permukaannya paling kecil.',
      },
    ],
    tanya: [
      {
        id: 'v1',
        tanya: 'Pelajaran terpenting dari lembar kerja Kelompok Elang adalah …',
        opsi: [
          {
            id: 'sisi',
            label:
              'Tentukan dulu sisi yang memakai bahan, lalu perhatikan satuan dan arah pembulatan',
          },
          { id: 'lp', label: 'Rumus LP selalu dipakai utuh untuk semua benda' },
          { id: 'bawah', label: 'Hasil bagi selalu dibulatkan ke bawah agar hemat' },
          { id: 'satuan', label: 'Satuan boleh diabaikan asal angkanya benar' },
        ],
        correct: 'sisi',
        umpan: {
          sisi: 'Tepat! Ketiga kekeliruan Kelompok Elang berasal dari sisi bahan, satuan luas, dan pembulatan.',
          lp: 'Justru kekeliruan pertama Kelompok Elang terjadi karena memakai LP utuh untuk tenda. Coba pilih yang lain.',
          bawah:
            'Membulatkan bahan ke bawah membuat bahannya kurang, seperti karton 5 lembar. Coba pilih yang lain.',
          satuan:
            'Mengabaikan satuan membuat 34.200 cm² terbaca 342 m². Satuan sangat penting. Coba pilih yang lain.',
        },
      },
    ],
    dugaanJudul: 'Bandingkan dengan dugaan awal kelompokmu',
    tanggapanDugaan: {
      d1: {
        A: 'Kalian menduga kemasan A. Ternyata A paling boros (408 cm²); yang paling hemat C (312 cm²).',
        B: 'Kalian menduga kemasan B. B (348 cm²) masih lebih boros daripada C (312 cm²).',
        C: 'Dugaan kalian tepat! Kemasan C paling hemat karton, 312 cm² per kemasan.',
        sama: 'Kalian menduga sama saja. Ternyata isi sama, tetapi karton A, B, dan C berbeda: 408, 348, dan 312 cm².',
      },
      d2: {
        cukup:
          'Kalian menduga cukup. Ternyata total awal Rp613.000, kurang Rp13.000, sehingga perlu penghematan.',
        pas: 'Kalian menduga pas. Ternyata total awal Rp613.000, kurang Rp13.000 dari dana.',
        kurang:
          'Dugaan kalian tepat! Total awal Rp613.000, kurang Rp13.000; setelah penghematan tenda, dana cukup.',
        ragu: 'Sikap yang baik: kalian menunda kesimpulan sampai menghitung. Hasilnya, total awal Rp613.000, kurang Rp13.000.',
      },
    },
    refleksiLabel:
      'Tulis evaluasi proses kelompokmu: langkah mana yang paling sulit, dan apa yang akan kalian lakukan berbeda lain kali?',
    refleksiPlaceholder: 'Langkah yang paling sulit adalah … Lain kali kami akan …',
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     cek.jenis mengikuti kandidatMasalahLp (engine seksi 48).
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: PBL + ' · Penerapan',
    goal: 'Menyelesaikan masalah kontekstual lain yang berkaitan dengan luas permukaan prisma.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang banyak salah (sisi bahan, konversi satuan, pembulatan) untuk dibahas bersama.',
    instruksi:
      'Kerjakan setiap soal. Tentukan dulu sisi yang memakai bahan, lalu perhatikan satuan dan pembulatan. Bila ragu, buka petunjuk.',
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: '🐟 Akuarium tanpa tutup',
        cerita:
          'Akuarium kaca berbentuk balok TANPA TUTUP. Alasnya 50 cm × 30 cm dan tingginya 40 cm.',
        pertanyaan: 'Berapa cm² kaca yang dibutuhkan?',
        cek: {
          jenis: 'lp',
          alas: [
            [0, 0],
            [50, 0],
            [50, 30],
            [0, 30],
          ],
          luasAlas: 1500,
          kelilingAlas: 160,
          tinggi: 40,
          tanpaTutup: true,
        },
        jawab: 7900,
        satuan: 'cm²',
        hints: [
          'Tanpa tutup berarti sisi alasnya hanya satu: luas kaca = La + K × t.',
          'La = 50 × 30 = 1.500 cm²; K = 2 × (50 + 30) = 160 cm.',
        ],
        explanation: 'Luas kaca = 1.500 + 160 × 40 = 1.500 + 6.400 = 7.900 cm².',
      },
      {
        id: 't2',
        type: 'choice',
        konteks: '🎁 Kertas kado',
        cerita:
          'Tiga kotak hadiah berbentuk balok 20 cm × 15 cm × 10 cm akan dibungkus seluruhnya. Kertas kado dijual per lembar berukuran 50 cm × 40 cm.',
        pertanyaan:
          'Berapa lembar kertas kado yang harus dibeli (anggap potongan bisa disusun tanpa sisa)?',
        cek: { jenis: 'wadah', luasSatu: 1300, banyak: 3, isiWadah: 2000 },
        options: [
          { id: 'benar', label: '2 lembar' },
          { id: 'bulat-bawah', label: '1 lembar' },
          { id: 'belum-bulat', label: '1,95 lembar' },
          { id: 'tambah-satu', label: '3 lembar' },
        ],
        correct: 'benar',
        hints: [
          'LP satu kotak = 2 × (20 × 15) + 70 × 10 = 1.300 cm². Tiga kotak = 3.900 cm².',
          'Satu lembar = 50 × 40 = 2.000 cm². 3.900 : 2.000 = 1,95 → bulatkan ke atas.',
        ],
        explanation:
          '3 × 1.300 = 3.900 cm²; 3.900 : 2.000 = 1,95, dibulatkan ke atas menjadi 2 lembar.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: '⛺ Tenda pramuka',
        cerita:
          'Tenda pramuka berbentuk prisma segitiga. Segitiganya sama kaki dengan alas 6 m, kaki 5 m, dan tinggi 4 m. Panjang tenda 8 m. Kedua sisi segitiga dan kedua sisi miring memakai kain, tetapi lantainya TIDAK.',
        pertanyaan: 'Berapa m² kain yang dibutuhkan?',
        cek: {
          jenis: 'dipakai',
          alas: [
            [0, 0],
            [6, 0],
            [3, 4],
          ],
          t: 8,
          pakai: ['alas', 'atas', 't1', 't2'],
        },
        jawab: 104,
        satuan: 'm²',
        hints: [
          'Dua segitiga: 2 × (½ × 6 × 4) = 24 m².',
          'Dua sisi miring: 2 × (5 × 8) = 80 m². Lantai 6 × 8 tidak dihitung.',
        ],
        explanation: 'Kain = 24 + 80 = 104 m² (LP utuh 152 m² dikurangi lantai 48 m²).',
      },
      {
        id: 't4',
        type: 'choice',
        konteks: '🗄️ Mengecat lemari',
        cerita:
          'Lemari berbentuk balok dengan alas 80 cm × 50 cm dan tinggi 180 cm. Lemari dicat kecuali bagian bawah dan bagian belakang yang menempel dinding. Luas yang dicat 36.400 cm².',
        pertanyaan: 'Berapa m² luas yang dicat?',
        cek: {
          jenis: 'konversi',
          nilai: 36400,
          dari: 'cm²',
          ke: 'm²',
          sumber: {
            alas: [
              [0, 0],
              [80, 0],
              [80, 50],
              [0, 50],
            ],
            t: 180,
            pakai: ['atas', 't0', 't1', 't3'],
          },
        },
        options: [
          { id: 'benar', label: '3,64 m²' },
          { id: 'faktor-panjang', label: '364 m²' },
          { id: 'faktor-1000', label: '36,4 m²' },
          { id: 'arah-terbalik', label: '364.000.000 m²' },
        ],
        correct: 'benar',
        hints: ['1 m² = 10.000 cm².', 'Dari cm² ke m², bagilah dengan 10.000.'],
        explanation: '36.400 : 10.000 = 3,64 m².',
      },
      {
        id: 't5',
        type: 'input',
        konteks: '📦 Tinggi kotak',
        cerita:
          'Kotak karton berbentuk balok dengan alas 10 cm × 8 cm. Luas karton seluruh permukaannya 592 cm².',
        pertanyaan: 'Berapa cm tinggi kotak itu?',
        cek: {
          jenis: 'tinggi',
          alas: [
            [0, 0],
            [10, 0],
            [10, 8],
            [0, 8],
          ],
          luasPermukaan: 592,
          luasAlas: 80,
          kelilingAlas: 36,
        },
        jawab: 12,
        satuan: 'cm',
        hints: ['La = 80 cm², K = 36 cm. 592 = 2 × 80 + 36 × t.', '36 × t = 592 − 160 = 432.'],
        explanation: '592 = 160 + 36 × t → 36 × t = 432 → t = 12 cm.',
      },
      {
        id: 't6',
        type: 'input',
        konteks: '🍫 Cokelat batang',
        cerita:
          'Cokelat batang berbentuk prisma segitiga siku-siku dengan sisi siku-siku 3 cm dan 4 cm (sisi miring 5 cm), panjang 20 cm. Sebanyak 100 batang dibungkus aluminium foil di seluruh permukaannya. Satu gulung foil berisi 1 m².',
        pertanyaan: 'Berapa gulung foil yang harus dibeli?',
        cek: {
          jenis: 'wadah',
          alas: [
            [0, 0],
            [4, 0],
            [0, 3],
          ],
          t: 20,
          luasSatu: 252,
          banyak: 100,
          isiWadah: 10000,
        },
        jawab: 3,
        satuan: 'gulung',
        hints: [
          'LP satu batang = 2 × 6 + 12 × 20 = 252 cm². Untuk 100 batang = 25.200 cm².',
          '1 m² = 10.000 cm². 25.200 : 10.000 = 2,52 → bulatkan ke atas.',
        ],
        explanation: '25.200 cm² : 10.000 cm² = 2,52, dibulatkan ke atas menjadi 3 gulung.',
      },
      {
        id: 't7',
        type: 'choice',
        konteks: '🏊 Keramik kolam',
        cerita:
          'Kolam ikan berbentuk balok TANPA TUTUP berukuran 3 m × 2 m dengan kedalaman 1 m. Dasar dan dinding kolam dipasang keramik. Satu dus keramik cukup untuk 1,5 m².',
        pertanyaan: 'Berapa dus keramik yang harus dibeli?',
        cek: {
          jenis: 'wadah',
          alas: [
            [0, 0],
            [3, 0],
            [3, 2],
            [0, 2],
          ],
          t: 1,
          tanpaTutup: true,
          luasSatu: 16,
          banyak: 1,
          isiWadah: 1.5,
        },
        options: [
          { id: 'benar', label: '11 dus' },
          { id: 'bulat-bawah', label: '10 dus' },
          { id: 'belum-bulat', label: '10,67 dus' },
          { id: 'tambah-satu', label: '12 dus' },
        ],
        correct: 'benar',
        hints: [
          'Luas keramik = La + K × t = 6 + 10 × 1 = 16 m².',
          '16 : 1,5 ≈ 10,67 → bulatkan ke atas.',
        ],
        explanation: 'Luas keramik 16 m²; 16 : 1,5 ≈ 10,67, dibulatkan ke atas menjadi 11 dus.',
      },
      {
        id: 't8',
        type: 'input',
        konteks: '✏️ Biaya cat',
        cerita:
          'Kotak pensil kayu berbentuk balok 20 cm × 8 cm × 6 cm dicat di seluruh permukaannya. Biaya cat Rp3 per cm².',
        pertanyaan: 'Berapa rupiah biaya catnya?',
        cek: {
          jenis: 'biaya',
          alas: [
            [0, 0],
            [20, 0],
            [20, 8],
            [0, 8],
          ],
          luasAlas: 160,
          kelilingAlas: 56,
          tinggi: 6,
          harga: 3,
        },
        jawab: 1968,
        satuan: 'rupiah',
        hints: ['LP = 2 × 160 + 56 × 6 = 656 cm².', 'Biaya = 656 × Rp3.'],
        explanation: 'LP = 320 + 336 = 656 cm². Biaya = 656 × Rp3 = Rp1.968.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: PBL + ' · Refleksi',
    goal: 'Merefleksikan proses menyelesaikan masalah kontekstual luas permukaan prisma.',
    guru: 'Baca beberapa refleksi murid (dengan izin) untuk menutup pelajaran. Tanyakan: “Apa yang kalian periksa lebih dulu sebelum memakai rumus LP?”',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Mengapa kita harus menentukan sisi yang memakai bahan sebelum menghitung?',
        placeholder: 'Karena …',
      },
      {
        id: 'q2',
        teks: 'Kapan hasil bagi dibulatkan ke atas, dan kapan dibulatkan ke bawah? Beri contoh dari stand bazar.',
        placeholder: 'Dibulatkan ke atas saat … contohnya … Dibulatkan ke bawah saat …',
      },
      {
        id: 'q3',
        teks: 'Masalah apa di rumah atau di sekolahmu yang bisa diselesaikan dengan luas permukaan prisma?',
        placeholder: 'Misalnya saat …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menyelesaikan masalah luas permukaan prisma sekarang?',
    diriOpsi: [
      { id: 'yakin', label: '😄 Sangat yakin, aku bisa menjelaskannya ke teman' },
      { id: 'cukup', label: '🙂 Cukup yakin, kadang masih perlu melihat catatan' },
      { id: 'ragu', label: '🤔 Masih ragu, aku perlu berlatih lagi' },
      { id: 'bingung', label: '😟 Masih bingung, aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai ✓',
  },

  /* ----------------------------------------------------------
     SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Stand kelas IX siap dibuka!',
    teks: 'Proposal kelompokmu menjawab kebutuhan panitia dengan hitungan yang tepat dan dana yang cukup.',
    capaian: [
      'Memilih kemasan paling hemat dengan membandingkan luas permukaan, bukan isinya.',
      'Menentukan sisi yang memakai bahan pada tenda, etalase, dan meja sebelum menghitung.',
      'Mengubah cm² ke m² dan membulatkan banyak bahan ke atas atau banyak benda ke bawah dengan tepat.',
      'Menyusun anggaran, mengambil keputusan penghematan, dan menyajikan proposal.',
    ],
  },
};
