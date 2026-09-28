'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Masalah Kontekstual Luas Permukaan Limas
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Tujuan Pembelajaran:
   Menyelesaikan masalah kontekstual yang berkaitan dengan luas
   permukaan limas.

   Model pembelajaran: PROBLEM BASED LEARNING (PBL).
   Masalah pemantik: "Gazebo Pojok Baca".
   OSIS menitipkan surat berisi rencana pojok baca di taman sekolah:
     • gazebo beralas persegi 4 m × 4 m diberi atap limas persegi;
       tiga desain atap — A setinggi 1,5 m, B 2,1 m, C 4,8 m; syarat
       tinggi atap minimal 2 m agar air hujan cepat turun; genteng
       metal 1 lembar menutup 1,5 m², Rp45.000 per lembar;
     • tenda dongeng limas persegi panjang 1,8 m × 1 m, tinggi 1,2 m;
       lantainya memakai tikar yang sudah ada; kain Rp25.000 per m²;
     • 30 kotak suvenir limas persegi (alas 8 cm, tinggi 3 cm), semua
       sisi dari karton; karton 50 cm × 40 cm, Rp5.000 per lembar;
     • dana Rp850.000.
   Semua ukuran membentuk tripel Pythagoras (a, t, tₛ): (2; 1,5; 2,5),
   (2; 2,1; 2,9), (2; 4,8; 5,2), (0,5; 1,2; 1,3), (0,9; 1,2; 1,5),
   (4; 3; 5).
   Konflik kognitif: "luas sisi tegak memakai tinggi limas", "atap &
   tenda dihitung dengan LP utuh (alas ikut)", "tenda cukup satu tₛ",
   "tₛ = t + a", "15,47 lembar → 15", "1 m² = 100 cm²", "tinggi naik 40%
   → genteng naik 40%" (nyatanya luas hanya naik 16%). Hasil akhirnya:
   atap B (16 lembar), total Rp831.000 — dana CUKUP dengan sisa
   Rp19.000; usulan lantai tenda dari kain membuat dana kurang Rp26.000,
   sehingga kelompok harus mengambil keputusan yang masuk akal.

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ....... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar . 'organisasi'
     Sintaks 3 — Membimbing penyelidikan ............ 'selidikAtap',
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
       nyata pojok baca (atap, tenda, suvenir, dana) dan berujung pada
       keputusan yang disajikan kepada OSIS.
     • Menggembirakan (joyful) — Lab Atap yang tingginya bisa digeser,
       gambar limas 3D, memilih sisi langsung pada jaring-jaring, umpan
       balik yang menunjuk letak kekeliruan, dan Papan Proposal.

   Rangkaian aktivitas (± 2 × 40 menit; kelompok 3–4 murid):
     1. Orientasi   (8')  — surat OSIS, gambar tiga desain atap, dugaan
                            awal (tidak dinilai), rumusan masalah inti,
                            hipotesis kelompok.
     2. Organisasi  (6')  — memilih peran, memilah informasi
                            (diketahui/ditanya/tidak diperlukan),
                            menyusun urutan rencana penyelesaian.
     3. Atap        (14') — Lab Atap: geser tinggi atap dan amati
                            segitiga siku-siku a–t–tₛ, luas atap, dan
                            lembar genteng; kartu data tₛ & luas atap
                            tiga desain berdiagnosa; memilih desain.
     4. Sisi bahan  (12') — Pemilih Sisi pada jaring-jaring atap, tenda,
                            dan kotak suvenir: sisi mana yang memakai
                            bahan? lalu menghitung luas bahannya.
     5. Anggaran    (10') — kartu banyak lembar (bulat ke atas),
                            konversi cm² → m², biaya; tabel anggaran vs
                            dana; pertanyaan penuntun.
     6. Karya       (10') — keputusan atap & lantai tenda, Papan
                            Proposal otomatis, kalimat presentasi.
     7. Evaluasi    (8')  — menilai lembar kerja Kelompok Merpati
                            langkah demi langkah, menarik pelajaran,
                            refleksi proses & hipotesis.
     8. Uji terap   (8')  — 8 soal kontekstual berdiagnosa.
     9. Refleksi    (4')  — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/
   ensureTapOrderState()/shuffleArray() dari shared/engine.js, satu kali
   saat state disiapkan.

   Limas beraturan ditulis { n, s, t, ts? } dan limas persegi panjang
   { p, l, t } (lihat engine seksi 58). Semua kunci dihitung ulang
   dengan engine seksi 57–58 di tests/mpi-22.8-data.test.js.
   ============================================================ */

var PBL = 'Problem Based Learning';

var DATA = {
  /* ----------------------------------------------------------
     MASALAH PEMANTIK — dipakai di beberapa tahap
     ---------------------------------------------------------- */
  atap: {
    n: 4,
    sisi: 4,
    luasLembar: 1.5,
    acuan: 1.5,
    syaratMin: 2,
    min: 0.5,
    max: 5,
    langkah: 0.1,
    satuan: 'm',
    desain: [
      { id: 'A', nama: 'Atap A', t: 1.5, gaya: 'landai' },
      { id: 'B', nama: 'Atap B', t: 2.1, gaya: 'sedang' },
      { id: 'C', nama: 'Atap C', t: 4.8, gaya: 'runcing' },
    ],
  },
  atapDipilih: 'B',
  genteng: { luas: 1.5, harga: 45000 },
  kain: { harga: 25000 },
  karton: { panjang: 50, lebar: 40, harga: 5000 },
  banyakSuvenir: 30,
  dana: 850000,

  benda: [
    {
      id: 'atap',
      nama: '🏠 Atap gazebo (desain B)',
      n: 4,
      s: 4,
      t: 2.1,
      satuan: 'm',
      bahan: 'genteng',
      satuanLuas: 'm²',
      cerita:
        'Atap limas persegi di atas gazebo 4 m × 4 m, tinggi atap 2,1 m. Bagian bawah atap terbuka (langsung ke ruang gazebo), yang ditutup genteng hanya bidang-bidang miringnya.',
      namaSisi: {
        alas: 'Bagian bawah (terbuka)',
        t0: 'Atap depan',
        t1: 'Atap kanan',
        t2: 'Atap belakang',
        t3: 'Atap kiri',
      },
      dipakai: ['t0', 't1', 't2', 't3'],
      alasan:
        'Genteng hanya menutup empat sisi tegak atap. Sisi alas limas adalah bagian bawah yang terbuka, jadi tidak dihitung.',
      infoLuas: 'Luas atap = ½ × keliling alas × tₛ = ½ × 16 × 2,9.',
    },
    {
      id: 'tenda',
      nama: '⛺ Tenda dongeng',
      p: 1.8,
      l: 1,
      t: 1.2,
      satuan: 'm',
      bahan: 'kain',
      satuanLuas: 'm²',
      cerita:
        'Tenda limas persegi panjang, alas 1,8 m × 1 m, tinggi 1,2 m. Lantainya memakai tikar yang sudah ada, jadi kain hanya untuk dinding miringnya.',
      namaSisi: {
        alas: 'Lantai (tikar)',
        t0: 'Dinding depan',
        t1: 'Dinding kanan',
        t2: 'Dinding belakang',
        t3: 'Dinding kiri',
      },
      dipakai: ['t0', 't1', 't2', 't3'],
      alasan:
        'Kain hanya untuk empat dinding miring. Lantai memakai tikar, jadi luas alas tidak dihitung.',
      infoLuas:
        'Dinding pada rusuk 1,8 m: a = 1 : 2 = 0,5 m → tₛ = √(1,2² + 0,5²). Dinding pada rusuk 1 m: a = 1,8 : 2 = 0,9 m → tₛ = √(1,2² + 0,9²).',
    },
    {
      id: 'kotak',
      nama: '🎁 Kotak suvenir',
      n: 4,
      s: 8,
      t: 3,
      satuan: 'cm',
      bahan: 'karton',
      satuanLuas: 'cm²',
      cerita:
        'Kotak suvenir pembatas buku berbentuk limas persegi, alas 8 cm, tinggi 3 cm. Semua sisinya, termasuk alas, dibuat dari karton.',
      namaSisi: {
        alas: 'Alas kotak',
        t0: 'Sisi depan',
        t1: 'Sisi kanan',
        t2: 'Sisi belakang',
        t3: 'Sisi kiri',
      },
      dipakai: ['alas', 't0', 't1', 't2', 't3'],
      alasan: 'Kotak tertutup rapat, jadi SEMUA sisi memakai karton: LP = La + ½ × K × tₛ.',
      infoLuas: 'a = 8 : 2 = 4 cm → tₛ = √(3² + 4²) = 5 cm. LP = 8 × 8 + ½ × 32 × 5.',
    },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI PADA MASALAH (PBL sintaks 1)
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi pada Masalah',
    syntax: PBL + ' · Sintaks 1',
    goal: 'Memahami masalah nyata pembuatan Gazebo Pojok Baca dan menyampaikan dugaan awal kelompok.',
    tp: 'Menyelesaikan masalah kontekstual yang berkaitan dengan luas permukaan limas.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menentukan tinggi sisi tegak (tₛ) dari tinggi limas dengan teorema Pythagoras.',
      'Menentukan sisi limas yang benar-benar memakai bahan, lalu menghitung luas bahannya.',
      'Mengubah satuan luas dan membulatkan banyak bahan yang dibeli sesuai konteks.',
      'Menghitung biaya, membandingkan dengan dana, lalu menyajikan keputusan berdasarkan hitungan.',
    ],
    guru: 'Bacakan surat OSIS dan tunjukkan tiga desain atap. Tanyakan: “Kalau atapnya dibuat lebih tinggi, gentengnya bertambah berapa banyak?” Jangan membenarkan dugaan murid — dugaan ini diuji sendiri di Lab Atap dan pada tahap evaluasi.',
    judul: 'Gazebo Pojok Baca',
    pengantar:
      'OSIS ingin membuat pojok baca di taman sekolah: sebuah gazebo beratap limas, tenda dongeng untuk adik kelas, dan kotak suvenir untuk para donatur buku. Kelompokmu ditunjuk menjadi tim perencana: memilih desain atap, menghitung bahan yang dibutuhkan, dan memastikan dananya cukup.',
    surat: [
      {
        id: 'sAtap',
        ikon: '🏠',
        judul: 'Atap gazebo',
        butir: [
          'Gazebo beralas persegi 4 m × 4 m diberi atap berbentuk limas persegi.',
          'Ada tiga desain: A setinggi 1,5 m, B 2,1 m, dan C 4,8 m.',
          'Agar air hujan cepat turun, tinggi atap minimal 2 m.',
        ],
      },
      {
        id: 'sGenteng',
        ikon: '🧱',
        judul: 'Genteng metal',
        butir: ['Satu lembar genteng menutup 1,5 m² atap.', 'Harganya Rp45.000 per lembar.'],
      },
      {
        id: 'sTenda',
        ikon: '⛺',
        judul: 'Tenda dongeng',
        butir: [
          'Tenda berbentuk limas persegi panjang, alas 1,8 m × 1 m, tinggi 1,2 m.',
          'Lantainya memakai tikar yang sudah ada. Kain Rp25.000 per m².',
        ],
      },
      {
        id: 'sSuvenir',
        ikon: '🎁',
        judul: 'Kotak suvenir',
        butir: [
          '30 kotak limas persegi, alas 8 cm, tinggi 3 cm, semua sisi dari karton.',
          'Karton berukuran 50 cm × 40 cm dijual Rp5.000 per lembar.',
        ],
      },
      {
        id: 'sDana',
        ikon: '💰',
        judul: 'Dana OSIS',
        butir: ['Dana yang tersedia Rp850.000 untuk genteng, kain, dan karton.'],
      },
    ],
    dugaan: [
      {
        id: 'd1',
        tanya:
          'Jika tinggi atap dinaikkan dari 1,5 m menjadi 2,1 m (naik 40%), genteng yang dibutuhkan …',
        opsi: [
          { id: 'sama', label: 'Tetap sama, karena alas gazebonya sama' },
          { id: 'sedikit', label: 'Bertambah sedikit, kurang dari 40%' },
          { id: 'sebanding', label: 'Bertambah 40% juga' },
          { id: 'dua', label: 'Bertambah dua kali lipat' },
        ],
      },
      {
        id: 'd2',
        tanya: 'Menurut kelompokmu, cukupkah dana Rp850.000 untuk semua bahan?',
        opsi: [
          { id: 'longgar', label: 'Cukup, sisanya masih banyak' },
          { id: 'pas', label: 'Cukup, tetapi sisanya sedikit' },
          { id: 'kurang', label: 'Kurang sedikit' },
          { id: 'jauh', label: 'Jauh dari cukup' },
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
          'Desain atap mana yang dipilih, berapa luas bahan untuk atap, tenda, dan suvenir, berapa bahan yang dibeli, dan cukupkah dananya?',
      },
      { id: 'volume', label: 'Berapa banyak udara di dalam gazebo dan tenda?' },
      { id: 'tiang', label: 'Berapa panjang kayu untuk semua tiang gazebo?' },
      { id: 'buku', label: 'Berapa banyak buku yang muat di pojok baca?' },
    ],
    masalahCorrect: 'inti',
    masalahUmpan: {
      inti: 'Tepat! Genteng, kain, dan karton semuanya menutup PERMUKAAN limas, jadi kuncinya adalah luas permukaan limas.',
      volume:
        'Banyak udara adalah volume (isi). OSIS justru bertanya tentang bahan penutup permukaannya.',
      tiang:
        'Panjang tiang berhubungan dengan rusuk atau tinggi, bukan bahan penutup. Fokuslah pada genteng, kain, dan karton.',
      buku: 'Surat OSIS tidak memuat data buku. Fokuslah pada bahan dan dananya.',
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
    goal: 'Membagi peran, memilah informasi dari surat OSIS, dan menyusun rencana penyelesaian.',
    guru: 'Pastikan setiap anggota memegang satu peran dan peran ditukar pada pertemuan berikutnya. Saat pemilahan, minta kelompok menjelaskan mengapa warna cat gazebo tidak diperlukan. Rencana yang tersusun menjadi peta langkah pada tiga penyelidikan berikutnya.',
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
          '📏 <strong>Juru Ukur</strong> — mencari tinggi sisi tegak (tₛ) dengan teorema Pythagoras.',
      },
      {
        id: 'hitung',
        label:
          '🧮 <strong>Juru Hitung</strong> — menentukan sisi yang memakai bahan dan menghitung luasnya.',
      },
      {
        id: 'uang',
        label:
          '💰 <strong>Bendahara</strong> — menghitung banyak bahan yang dibeli, biaya, dan sisa dana.',
      },
    ],
    judulPilah: 'Pilah informasi dari surat OSIS',
    opsiPilah: [
      { id: 'diketahui', label: 'Diketahui' },
      { id: 'ditanya', label: 'Ditanya' },
      { id: 'tidakPerlu', label: 'Tidak diperlukan' },
    ],
    pilah: [
      {
        id: 'i1',
        teks: 'Gazebo beralas persegi 4 m × 4 m.',
        correct: 'diketahui',
        explanation:
          'Rusuk alas dipakai untuk keliling alas dan setengah rusuk (a) pada Pythagoras.',
      },
      {
        id: 'i2',
        teks: 'Tinggi atap minimal 2 m.',
        correct: 'diketahui',
        explanation: 'Syarat ini dipakai untuk memilih desain atap.',
      },
      {
        id: 'i3',
        teks: 'Satu lembar genteng metal menutup 1,5 m².',
        correct: 'diketahui',
        explanation: 'Dipakai untuk menghitung banyak lembar genteng yang dibeli.',
      },
      {
        id: 'i4',
        teks: 'Desain atap mana yang dipilih, dan berapa lembar gentengnya?',
        correct: 'ditanya',
        explanation: 'Ini keputusan pertama yang harus dijawab kelompok.',
      },
      {
        id: 'i5',
        teks: 'Berapa luas kain tenda dan berapa lembar karton untuk suvenir?',
        correct: 'ditanya',
        explanation: 'Luas bahan ini menentukan biaya tenda dan suvenir.',
      },
      {
        id: 'i6',
        teks: 'Cukupkah dana Rp850.000?',
        correct: 'ditanya',
        explanation: 'Jawaban ini disajikan dalam proposal kepada OSIS.',
      },
      {
        id: 'i7',
        teks: 'Tiang gazebo akan dicat hijau muda.',
        correct: 'tidakPerlu',
        explanation: 'Warna cat tidak memengaruhi luas atap, kain, karton, maupun biayanya.',
      },
      {
        id: 'i8',
        teks: 'Pojok baca dibuka setiap jam istirahat.',
        correct: 'tidakPerlu',
        explanation: 'Jadwal buka tidak dipakai dalam perhitungan bahan.',
      },
    ],
    judulRencana: 'Susun rencana penyelesaian kelompok',
    instruksiRencana: 'Ketuk langkah-langkah berikut sesuai urutan yang paling masuk akal.',
    rencana: [
      { id: 'r1', label: '📏 Cari tₛ dari tinggi limas dengan Pythagoras: tₛ = √(t² + a²)' },
      { id: 'r2', label: '🔍 Tentukan sisi limas yang benar-benar memakai bahan' },
      { id: 'r3', label: '📐 Hitung luas bahan: ½ × K × tₛ, ditambah La bila alas dipakai' },
      { id: 'r4', label: '🛒 Hitung banyak bahan yang dibeli (bulat ke atas) dan biayanya' },
      { id: 'r5', label: '🪧 Bandingkan dengan dana, ambil keputusan, lalu sajikan' },
    ],
    rencanaSukses:
      '<strong>Rencana tersusun!</strong> tₛ → sisi yang memakai bahan → luas bahan → banyak bahan & biaya → keputusan. Rencana ini kalian jalankan pada tiga penyelidikan berikutnya.',
    nextLabel: 'Mulai Penyelidikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENYELIDIKAN 1: DESAIN ATAP (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikAtap: {
    kicker: 'Tahap 3 · Penyelidikan 1 — Desain Atap',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Mencari tinggi sisi tegak atap dengan Pythagoras, menghitung luas atap tiga desain, dan memilih desain yang memenuhi syarat serta paling hemat.',
    guru: 'Minta Juru Ukur menunjukkan segitiga siku-siku di Lab Atap: kaki a (setengah rusuk alas), kaki t (tinggi atap), sisi miring tₛ. Pantau kekeliruan “luas atap memakai tinggi atap” dan “tₛ = t + a”. Tanyakan: “Tinggi naik 40%, mengapa luas atap tidak ikut naik 40%?”',
    instruksi:
      'Genteng menutup bidang-bidang miring atap. Luas setiap bidang memakai tinggi segitiganya sendiri (tₛ), bukan tinggi atap. Geser tinggi atap di Lab Atap, lalu isi kartu data setiap desain.',
    instruksiLab:
      'Pilih desain atau geser tinggi atap. Perhatikan segitiga siku-siku berwarna: a, t, dan tₛ.',
    instruksiData:
      'Hitung tₛ dengan Pythagoras, lalu luas atap (hanya sisi tegak). Boleh memakai koma desimal (contoh 2,5).',
    tanya: [
      {
        id: 'k1',
        tanya: 'Desain atap mana yang dipilih kelompokmu?',
        opsi: [
          { id: 'B', label: 'Atap B' },
          { id: 'A', label: 'Atap A' },
          { id: 'C', label: 'Atap C' },
          { id: 'semua', label: 'Ketiganya sama baiknya' },
        ],
        correct: 'B',
        umpan: {
          B: 'Tepat! Atap B setinggi 2,1 m memenuhi syarat (≥ 2 m) dan luasnya 23,2 m², jauh lebih hemat daripada C (41,6 m²).',
          A: 'Atap A memang paling hemat (20 m²), tetapi tingginya hanya 1,5 m, belum memenuhi syarat minimal 2 m.',
          C: 'Atap C memenuhi syarat, tetapi luasnya 41,6 m², hampir dua kali atap B. Genteng dan biayanya jauh lebih banyak.',
          semua:
            'Bandingkan tinggi dan luasnya: A tidak memenuhi syarat, C paling boros. Hanya satu yang memenuhi syarat dan hemat.',
        },
      },
      {
        id: 'k2',
        tanya: 'Mengapa luas bidang atap memakai tₛ, bukan tinggi atap t?',
        opsi: [
          {
            id: 'segitiga',
            label:
              'Setiap bidang atap adalah segitiga; tingginya tₛ, yang terletak pada bidang itu',
          },
          { id: 'sama', label: 'Karena t dan tₛ selalu sama panjang' },
          { id: 'pendek', label: 'Karena tₛ lebih pendek sehingga lebih hemat' },
          { id: 'bebas', label: 'Boleh memakai t atau tₛ, hasilnya sama' },
        ],
        correct: 'segitiga',
        umpan: {
          segitiga:
            'Tepat! t berdiri tegak di dalam limas, sedangkan tₛ menempel pada bidang atap. Luas segitiga memakai tinggi pada bidangnya: ½ × 4 × tₛ.',
          sama: 'Lihat Lab Atap: tₛ adalah sisi miring segitiga siku-siku, jadi selalu lebih panjang daripada t.',
          pendek:
            'Justru tₛ lebih panjang daripada t, karena tₛ sisi miring segitiga siku-siku. Coba pilih yang lain.',
          bebas:
            'Memakai t memberi 16,8 m² untuk atap B, padahal luas sebenarnya 23,2 m². Hasilnya berbeda.',
        },
      },
      {
        id: 'k3',
        tanya: 'Tinggi atap A → B naik 40%. Berapa persen luas atap bertambah?',
        opsi: [
          { id: 'n16', label: 'Sekitar 16%' },
          { id: 'n40', label: 'Tepat 40%' },
          { id: 'n80', label: 'Sekitar 80%' },
          { id: 'n0', label: 'Tidak bertambah' },
        ],
        correct: 'n16',
        umpan: {
          n16: 'Tepat! Luas bergantung pada tₛ = √(t² + a²), bukan pada t saja. tₛ hanya naik dari 2,5 m ke 2,9 m, jadi luas naik 20 → 23,2 m² (16%).',
          n40: 'Lihat bacaan Lab Atap: luas naik dari 20 m² ke 23,2 m². Itu bukan 40%, karena yang dipakai tₛ, bukan t.',
          n80: 'Kenaikannya jauh lebih kecil. Hitung (23,2 − 20) : 20.',
          n0: 'Luas atap bertambah dari 20 m² ke 23,2 m², karena tₛ ikut bertambah.',
        },
      },
    ],
    temuan:
      'Atap B dipilih: memenuhi syarat tinggi dan luasnya 23,2 m². Luas bidang atap memakai tₛ = √(t² + a²), sehingga menaikkan tinggi atap 40% hanya menambah luas 16%.',
    nextLabel: 'Lanjut: Penyelidikan 2 →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENYELIDIKAN 2: SISI YANG MEMAKAI BAHAN (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikSisi: {
    kicker: 'Tahap 4 · Penyelidikan 2 — Sisi yang Memakai Bahan',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menentukan sisi limas yang benar-benar memakai bahan pada atap, tenda, dan kotak suvenir, lalu menghitung luas bahannya.',
    guru: 'Juru Hitung memimpin tahap ini. Tekankan bahwa benda nyata tidak selalu memakai bahan di semua sisinya. Pada tenda, tanyakan: “Mengapa dinding depan dan dinding samping punya tₛ yang berbeda?”',
    instruksi:
      'Baca cerita setiap benda. Ketuk sisi yang memakai bahan pada jaring-jaring atau pada tombol nama sisi, lalu periksa. Setelah tepat, hitung luas bahannya.',
    tanya: [
      {
        id: 's1',
        tanya: 'Mengapa luas kain tenda TIDAK dihitung dengan LP = La + ½ × K × tₛ secara utuh?',
        opsi: [
          { id: 'lantai', label: 'Lantainya memakai tikar, jadi luas alas tidak dihitung' },
          { id: 'rumus', label: 'Rumus luas permukaan hanya berlaku untuk limas persegi' },
          { id: 'kecil', label: 'Karena tendanya kecil' },
          { id: 'kain', label: 'Karena kain lebih murah daripada karton' },
        ],
        correct: 'lantai',
        umpan: {
          lantai:
            'Tepat! Hanya sisi yang benar-benar memakai kain yang dihitung: empat dinding miring.',
          rumus:
            'Rumus itu berlaku untuk semua limas. Masalahnya, lantai tenda tidak memakai kain. Coba pilih yang lain.',
          kecil: 'Ukuran tenda tidak menentukan sisi mana yang dihitung. Coba pilih yang lain.',
          kain: 'Harga bahan tidak menentukan sisi mana yang dihitung. Coba pilih yang lain.',
        },
      },
      {
        id: 's2',
        tanya: 'Mengapa dinding tenda pada rusuk 1,8 m dan pada rusuk 1 m punya tₛ berbeda?',
        opsi: [
          {
            id: 'jarak',
            label:
              'Jarak kaki tinggi tenda ke kedua rusuk berbeda (0,5 m dan 0,9 m), jadi a berbeda',
          },
          { id: 'tinggi', label: 'Karena tinggi tendanya berbeda di depan dan di samping' },
          { id: 'salah', label: 'Seharusnya sama; tenda limas selalu punya satu tₛ' },
          { id: 'panjang', label: 'Karena rusuk yang lebih panjang selalu punya tₛ lebih panjang' },
        ],
        correct: 'jarak',
        umpan: {
          jarak:
            'Tepat! Untuk rusuk 1,8 m, a = 1 : 2 = 0,5 m → tₛ = 1,3 m. Untuk rusuk 1 m, a = 1,8 : 2 = 0,9 m → tₛ = 1,5 m.',
          tinggi: 'Tinggi tenda hanya satu, 1,2 m. Yang berbeda adalah a. Coba pilih yang lain.',
          salah:
            'Satu tₛ hanya berlaku pada limas beralas persegi (beraturan). Pada alas persegi panjang, a-nya berbeda. Coba pilih yang lain.',
          panjang:
            'Justru dinding pada rusuk 1,8 m punya tₛ lebih pendek (1,3 m). Coba pilih yang lain.',
        },
      },
    ],
    temuan:
      'Atap: 23,2 m² genteng (tanpa alas). Tenda: 3,84 m² kain (tanpa lantai, dua tₛ berbeda). Kotak suvenir: 144 cm² karton (semua sisi).',
    nextLabel: 'Lanjut: Penyelidikan 3 →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENYELIDIKAN 3: BAHAN & ANGGARAN (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikBiaya: {
    kicker: 'Tahap 5 · Penyelidikan 3 — Bahan & Anggaran',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menghitung banyak bahan yang dibeli dengan pembulatan yang tepat, mengubah satuan luas, lalu menyusun anggaran dan membandingkannya dengan dana.',
    guru: 'Bendahara memimpin tahap ini. Pantau kekeliruan “15,47 lembar → 15 lembar” dan “1 m² = 100 cm²”. Minta kelompok menjelaskan mengapa bahan yang dibeli selalu dibulatkan ke atas.',
    instruksi:
      'Isi kartu setiap bahan. Boleh memakai titik ribuan (contoh 4.320) dan koma desimal (contoh 0,432). Uang ditulis tanpa “Rp”.',
    tanya: [
      {
        id: 'b1',
        tanya: 'Mengapa 23,2 : 1,5 ≈ 15,47 lembar genteng dibeli 16 lembar?',
        opsi: [
          { id: 'cukup', label: '15 lembar hanya menutup 22,5 m², masih ada atap yang bocor' },
          { id: 'dekat', label: 'Karena 15,47 lebih dekat ke 16' },
          { id: 'cadangan', label: 'Agar ada satu lembar cadangan yang tidak dipakai' },
          { id: 'aturan', label: 'Karena semua desimal selalu dibulatkan ke atas' },
        ],
        correct: 'cukup',
        umpan: {
          cukup:
            'Tepat! Genteng dijual per lembar dan atap harus tertutup semua, jadi hasil bagi dibulatkan KE ATAS.',
          dekat:
            'Justru 15,47 lebih dekat ke 15. Pembulatan di sini bukan soal dekat-jauh, melainkan cukup atau tidak.',
          cadangan:
            'Lembar ke-16 bukan cadangan; ia dipakai untuk menutup sisa 0,7 m² atap. Coba pilih yang lain.',
          aturan:
            'Tidak selalu. Banyak benda yang BISA DIBUAT dari bahan justru dibulatkan ke bawah. Pembulatan mengikuti konteks.',
        },
      },
      {
        id: 'b2',
        tanya: 'Karton 30 kotak suvenir 4.320 cm². Berapa m²?',
        opsi: [
          { id: 'tepat', label: '0,432 m²' },
          { id: 'f100', label: '43,2 m²' },
          { id: 'f1000', label: '4,32 m²' },
          { id: 'terbalik', label: '43.200.000 m²' },
        ],
        correct: 'tepat',
        umpan: {
          tepat: 'Tepat! 1 m² = 100 cm × 100 cm = 10.000 cm², jadi 4.320 : 10.000 = 0,432 m².',
          f100: 'Itu dibagi 100 (faktor satuan panjang). Untuk luas, 1 m² = 10.000 cm².',
          f1000:
            'Itu dibagi 1.000. Satuan luas turun 100 kali setiap tingkat: 1 m² = 100 dm² = 10.000 cm².',
          terbalik:
            'Arahnya terbalik. Dari cm² ke m² (satuan kecil ke besar) dibagi, bukan dikali.',
        },
      },
      {
        id: 'b3',
        tanya: 'Berdasarkan tabel anggaran, bagaimana keadaan dana OSIS?',
        opsi: [
          { id: 'sisa', label: 'Cukup, sisa Rp19.000' },
          { id: 'pas', label: 'Pas, tidak bersisa' },
          { id: 'kurang', label: 'Kurang Rp19.000' },
          { id: 'banyak', label: 'Cukup, sisa Rp119.000' },
        ],
        correct: 'sisa',
        umpan: {
          sisa: 'Tepat! Total Rp831.000, dana Rp850.000, jadi sisanya Rp19.000 — cukup, tetapi tipis.',
          pas: 'Hitung lagi: Rp850.000 − Rp831.000 bukan nol.',
          kurang: 'Total biaya Rp831.000 lebih KECIL daripada dana Rp850.000.',
          banyak: 'Hitung lagi total biayanya: Rp720.000 + Rp96.000 + Rp15.000.',
        },
      },
    ],
    temuan:
      'Genteng 16 lembar (Rp720.000), kain 3,84 m² (Rp96.000), karton 3 lembar (Rp15.000). Total Rp831.000, dana cukup dengan sisa Rp19.000.',
    nextLabel: 'Lanjut: Susun Karya →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGEMBANGKAN & MENYAJIKAN KARYA (PBL sintaks 4)
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 6 · Menyajikan Karya',
    syntax: PBL + ' · Sintaks 4',
    goal: 'Mengambil keputusan berdasarkan perhitungan, lalu menyusun dan menyajikan Papan Proposal kelompok.',
    guru: 'Minta setiap kelompok mempresentasikan Papan Proposal (1–2 menit) di depan kelas atau dalam galeri berjalan. Kelompok lain memberi satu pujian dan satu pertanyaan. Tekankan bahwa setiap keputusan harus didukung hasil hitung.',
    instruksi:
      'Adik kelas mengusulkan agar lantai tenda dongeng juga dilapisi kain supaya lebih empuk. Hitung akibatnya, ambil keputusan yang masuk akal, lalu susun proposal untuk OSIS.',
    lantai: { benda: 'tenda', tambah: 'alas' },
    tanya: [
      {
        id: 'p1',
        tanya:
          'Lantai tenda 1,8 m × 1 m ikut dilapisi kain (Rp25.000 per m²). Apa akibatnya pada anggaran?',
        opsi: [
          {
            id: 'kurang',
            label: 'Biaya kain naik Rp45.000; total Rp876.000, dana kurang Rp26.000',
          },
          { id: 'cukup', label: 'Biaya naik Rp45.000, dana masih cukup' },
          { id: 'sedikit', label: 'Biaya naik Rp18.000, dana masih cukup' },
          { id: 'tetap', label: 'Biaya tidak berubah' },
        ],
        correct: 'kurang',
        umpan: {
          kurang:
            'Tepat! Luas lantai 1,8 m², biayanya 1,8 × Rp25.000 = Rp45.000. Rp831.000 + Rp45.000 = Rp876.000 > Rp850.000.',
          cukup: 'Sisa dana hanya Rp19.000, lebih kecil daripada Rp45.000. Coba pilih yang lain.',
          sedikit: 'Luas lantai 1,8 m², bukan 0,72 m². Hitung 1,8 × Rp25.000.',
          tetap: 'Menambah sisi yang memakai kain pasti menambah luas kain dan biayanya.',
        },
      },
      {
        id: 'p2',
        tanya: 'Keputusan mana yang paling masuk akal?',
        opsi: [
          {
            id: 'tikar',
            label: 'Lantai tetap memakai tikar yang ada; sisa Rp19.000 menjadi dana cadangan',
          },
          { id: 'atapA', label: 'Mengganti ke atap A agar hemat, walau tidak memenuhi syarat' },
          { id: 'genteng', label: 'Membeli 15 lembar genteng saja agar dana cukup' },
          { id: 'suvenir', label: 'Membatalkan semua kotak suvenir' },
        ],
        correct: 'tikar',
        umpan: {
          tikar:
            'Tepat! Keputusan ini memenuhi semua kebutuhan, tetap dalam dana, dan tikar yang ada tetap bermanfaat.',
          atapA:
            'Atap A melanggar syarat tinggi minimal 2 m, sehingga air hujan lambat turun. Coba pilih yang lain.',
          genteng: '15 lembar hanya menutup 22,5 m², atap akan bocor. Coba pilih yang lain.',
          suvenir:
            'Suvenir hanya Rp15.000 dan sudah direncanakan untuk donatur. Ada pilihan yang lebih bijak.',
        },
      },
    ],
    proposalJudul: 'Proposal Gazebo Pojok Baca',
    presentasiLabel:
      'Tulis kalimat presentasi kelompokmu untuk OSIS (keputusan + alasan berdasarkan hitungan).',
    presentasiPlaceholder:
      'Kami memilih atap B karena … Genteng yang dibeli … Kain tenda … Karton … Total biaya … sehingga …',
    penutup:
      'Semua luas dihitung dari sisi limas yang benar-benar memakai bahan, dengan tₛ dari teorema Pythagoras dan pembulatan ke atas untuk bahan yang dibeli.',
    nextLabel: 'Lanjut: Evaluasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENGANALISIS & MENGEVALUASI (PBL sintaks 5)
     Setiap langkah memuat cek (engine seksi 58) & nilai yang ditulis
     Kelompok Merpati; tes memastikan status benar/keliru-nya.
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 7 · Analisis & Evaluasi',
    syntax: PBL + ' · Sintaks 5',
    goal: 'Mengevaluasi proses penyelesaian masalah: memeriksa lembar kerja kelompok lain dan merefleksikan strategi sendiri.',
    guru: 'Bahas bersama langkah-langkah yang keliru pada lembar kerja Kelompok Merpati. Minta kelompok membandingkan hipotesis awal dengan hasil penyelidikan dan menuliskan satu hal yang akan mereka lakukan berbeda.',
    lembarJudul: '📝 Lembar kerja Kelompok Merpati',
    instruksiLembar:
      'Kelompok Merpati menyelesaikan masalah yang sama. Periksa setiap langkah mereka: benar atau keliru?',
    opsiNilai: [
      { id: 'benar', label: '✓ Benar' },
      { id: 'keliru', label: '✗ Keliru' },
    ],
    langkah: [
      {
        id: 'e1',
        teks: 'tₛ atap B = 2,1 + 2 = 4,1 m.',
        cek: { jenis: 'ts', t: 2.1, a: 2 },
        nilai: 4.1,
        correct: 'keliru',
        explanation: 'Pythagoras: tₛ = √(2,1² + 2²) = √8,41 = 2,9 m, bukan dijumlahkan.',
      },
      {
        id: 'e2',
        teks: 'tₛ atap B = √(2,1² + 2²) = √8,41 = 2,9 m.',
        cek: { jenis: 'ts', t: 2.1, a: 2 },
        nilai: 2.9,
        correct: 'benar',
        explanation: '4,41 + 4 = 8,41 dan √8,41 = 2,9.',
      },
      {
        id: 'e3',
        teks: 'Luas atap B = 16 + ½ × 16 × 2,9 = 39,2 m².',
        cek: {
          jenis: 'lp',
          luasAlas: 16,
          kelilingAlas: 16,
          tinggiSisi: 2.9,
          tanpaAlas: true,
        },
        nilai: 39.2,
        correct: 'keliru',
        explanation:
          'Bagian bawah atap terbuka, jadi luas alas tidak dihitung: ½ × 16 × 2,9 = 23,2 m².',
      },
      {
        id: 'e4',
        teks: 'Kain tenda = 4 × ½ × 1,8 × 1,3 = 4,68 m².',
        cek: {
          jenis: 'dipakai',
          limas: { p: 1.8, l: 1, t: 1.2 },
          pakai: ['t0', 't1', 't2', 't3'],
        },
        nilai: 4.68,
        correct: 'keliru',
        explanation:
          'Tenda beralas persegi panjang: dua dinding bertₛ 1,3 m pada rusuk 1,8 m, dua dinding bertₛ 1,5 m pada rusuk 1 m. Luasnya 2,34 + 1,5 = 3,84 m².',
      },
      {
        id: 'e5',
        teks: 'Karton satu kotak suvenir = 8 × 8 + ½ × 32 × 5 = 144 cm².',
        cek: { jenis: 'lp', luasAlas: 64, kelilingAlas: 32, tinggiSisi: 5 },
        nilai: 144,
        correct: 'benar',
        explanation: 'Kotak tertutup, jadi alas ikut dihitung: 64 + 80 = 144 cm².',
      },
      {
        id: 'e6',
        teks: 'Genteng: 23,2 : 1,5 ≈ 15,47, jadi dibeli 15 lembar.',
        cek: { jenis: 'wadah', luasSatu: 23.2, banyak: 1, isiWadah: 1.5 },
        nilai: 15,
        correct: 'keliru',
        explanation: '15 lembar hanya menutup 22,5 m². Dibulatkan ke atas: 16 lembar.',
      },
      {
        id: 'e7',
        teks: 'Karton 30 kotak: 4.320 cm² = 43,2 m².',
        cek: { jenis: 'konversi', nilai: 4320, dari: 'cm²', ke: 'm²' },
        nilai: 43.2,
        correct: 'keliru',
        explanation: '1 m² = 10.000 cm², jadi 4.320 cm² = 0,432 m².',
      },
      {
        id: 'e8',
        teks: 'Biaya genteng = 16 × Rp45.000 = Rp720.000.',
        cek: { jenis: 'biayaWadah', luas: 23.2, isiWadah: 1.5, harga: 45000 },
        nilai: 720000,
        correct: 'benar',
        explanation: 'Banyak lembar yang dibeli dikali harga per lembar.',
      },
    ],
    tanya: [
      {
        id: 'v1',
        tanya: 'Pelajaran terpenting dari lembar kerja Kelompok Merpati adalah …',
        opsi: [
          {
            id: 'sisi',
            label:
              'Cari tₛ dengan Pythagoras, hitung hanya sisi yang memakai bahan, lalu perhatikan satuan dan pembulatan',
          },
          { id: 'rumus', label: 'Selalu pakai LP = La + ½ × K × tₛ untuk semua benda' },
          { id: 'jumlah', label: 'tₛ cukup dicari dengan menjumlahkan tinggi dan setengah rusuk' },
          { id: 'bawah', label: 'Banyak bahan selalu dibulatkan ke bawah agar hemat' },
        ],
        correct: 'sisi',
        umpan: {
          sisi: 'Tepat! Kekeliruan Kelompok Merpati berasal dari tₛ, sisi yang dihitung, satuan luas, dan arah pembulatan.',
          rumus:
            'Rumus utuh membuat atap tampak 39,2 m², padahal bagian bawahnya terbuka. Coba pilih yang lain.',
          jumlah:
            'Menjumlahkan membuat tₛ = 4,1 m, padahal Pythagoras memberi 2,9 m. Coba pilih yang lain.',
          bawah:
            'Membulatkan ke bawah membuat genteng kurang dan atap bocor. Coba pilih yang lain.',
        },
      },
    ],
    dugaanJudul: 'Bandingkan dengan dugaan awal kelompokmu',
    tanggapanDugaan: {
      d1: {
        sama: 'Kalian menduga tetap sama. Ternyata luas atap bertambah dari 20 m² ke 23,2 m² (14 → 16 lembar), karena tₛ ikut bertambah.',
        sedikit:
          'Dugaan kalian tepat! Tinggi naik 40%, tetapi luas atap hanya naik 16% (20 → 23,2 m²), karena yang dipakai tₛ = √(t² + a²).',
        sebanding:
          'Kalian menduga naik 40%. Ternyata luas hanya naik 16%, karena luas memakai tₛ, dan tₛ hanya naik dari 2,5 m ke 2,9 m.',
        dua: 'Kalian menduga dua kali lipat. Ternyata luas hanya naik 16%: 20 m² menjadi 23,2 m².',
      },
      d2: {
        longgar: 'Kalian menduga sisanya banyak. Ternyata total Rp831.000, sisanya hanya Rp19.000.',
        pas: 'Dugaan kalian tepat! Dana cukup, sisanya hanya Rp19.000.',
        kurang:
          'Kalian menduga kurang. Ternyata cukup dengan sisa Rp19.000 — tetapi akan kurang bila lantai tenda ikut dilapisi kain.',
        jauh: 'Kalian menduga jauh dari cukup. Ternyata total Rp831.000 masih di bawah dana Rp850.000.',
      },
    },
    refleksiLabel:
      'Tulis evaluasi proses kelompokmu: langkah mana yang paling sulit, dan apa yang akan kalian lakukan berbeda lain kali?',
    refleksiPlaceholder: 'Langkah yang paling sulit adalah … Lain kali kami akan …',
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     cek.jenis mengikuti kandidatMasalahLimas (engine seksi 58).
     Soal pilihan ganda: options = subset opsiMasalahLimas(cek,
     satuanOpsi, { awalan }) — diacak app.js.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: PBL + ' · Penerapan',
    goal: 'Menyelesaikan masalah kontekstual lain yang berkaitan dengan luas permukaan limas.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang banyak salah (tₛ, sisi yang dihitung, konversi, pembulatan) untuk dibahas bersama.',
    instruksi:
      'Kerjakan setiap soal. Cari dulu tₛ bila perlu, tentukan sisi yang memakai bahan, lalu perhatikan satuan dan pembulatan. Bila ragu, buka petunjuk.',
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: '🕌 Atap menara musala',
        cerita:
          'Atap menara musala berbentuk limas persegi dengan rusuk alas 6 m dan tinggi 4 m. Bagian bawah atap terbuka.',
        pertanyaan: 'Berapa m² luas penutup atap yang dibutuhkan?',
        cek: {
          jenis: 'lp',
          luasAlas: 36,
          kelilingAlas: 24,
          tinggiSisi: 5,
          tinggiLimas: 4,
          tanpaAlas: true,
          sumber: { n: 4, s: 6, t: 4 },
        },
        jawab: 60,
        satuan: 'm²',
        hints: [
          'a = 6 : 2 = 3 m, jadi tₛ = √(4² + 3²) = 5 m.',
          'Bagian bawah terbuka: luas = ½ × keliling alas × tₛ.',
        ],
        explanation: 'tₛ = 5 m; luas atap = ½ × 24 × 5 = 60 m².',
      },
      {
        id: 't2',
        type: 'choice',
        konteks: '⛺ Tenda pramuka',
        cerita: 'Tenda pramuka berbentuk limas persegi dengan rusuk alas 3 m dan tinggi 2 m.',
        pertanyaan: 'Berapa tinggi segitiga dinding tenda (tₛ)?',
        cek: { jenis: 'ts', t: 2, a: 1.5 },
        satuanOpsi: 'm',
        options: [
          { id: 'benar', label: '2,5 m' },
          { id: 'jumlah-sisi', label: '3,5 m' },
          { id: 'lupa-akar', label: '6,25 m' },
          { id: 'pakai-rusuk', label: '3,61 m' },
        ],
        correct: 'benar',
        hints: [
          'Kaki segitiga siku-siku: t = 2 m dan a = setengah rusuk alas = 1,5 m.',
          'tₛ = √(t² + a²).',
        ],
        explanation: 'tₛ = √(2² + 1,5²) = √6,25 = 2,5 m.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: '🍫 Kotak cokelat',
        cerita:
          'Kotak cokelat berbentuk limas persegi tertutup dengan rusuk alas 10 cm dan tinggi 12 cm. Akan dibuat 40 kotak dari karton berukuran 60 cm × 50 cm.',
        pertanyaan: 'Paling sedikit berapa lembar karton yang harus dibeli?',
        cek: {
          jenis: 'wadah',
          luasSatu: 360,
          banyak: 40,
          isiWadah: 3000,
          sumber: { n: 4, s: 10, t: 12 },
        },
        jawab: 5,
        satuan: 'lembar',
        hints: [
          'tₛ = √(12² + 5²) = 13 cm. LP satu kotak = 100 + ½ × 40 × 13 = 360 cm².',
          '40 kotak = 14.400 cm²; satu lembar = 3.000 cm². Bahan dibeli: bulatkan ke atas.',
        ],
        explanation: '14.400 : 3.000 = 4,8, dibulatkan ke atas menjadi 5 lembar.',
      },
      {
        id: 't4',
        type: 'choice',
        konteks: '🎪 Panggung boneka',
        cerita: 'Kain penutup atap panggung boneka berbentuk limas luasnya 36.000 cm².',
        pertanyaan: 'Berapa m² luas kain itu?',
        cek: { jenis: 'konversi', nilai: 36000, dari: 'cm²', ke: 'm²' },
        satuanOpsi: 'm²',
        options: [
          { id: 'benar', label: '3,6 m²' },
          { id: 'faktor-panjang', label: '360 m²' },
          { id: 'faktor-1000', label: '36 m²' },
          { id: 'arah-terbalik', label: '360.000.000 m²' },
        ],
        correct: 'benar',
        hints: ['1 m² = 100 cm × 100 cm = 10.000 cm².', 'Dari cm² ke m², bagilah dengan 10.000.'],
        explanation: '36.000 : 10.000 = 3,6 m².',
      },
      {
        id: 't5',
        type: 'input',
        konteks: '🛖 Atap pos ronda',
        cerita:
          'Atap pos ronda berbentuk limas persegi dengan rusuk alas 3 m dan tinggi sisi tegak 2,5 m. Bagian luar atap dicat; 1 kaleng cat cukup untuk 4 m² dan harganya Rp80.000.',
        pertanyaan: 'Berapa rupiah biaya cat paling sedikit?',
        cek: {
          jenis: 'biayaWadah',
          luas: 15,
          isiWadah: 4,
          harga: 80000,
          sumber: { n: 4, s: 3, ts: 2.5, pakai: ['t0', 't1', 't2', 't3'] },
        },
        jawab: 320000,
        satuan: 'rupiah',
        hints: [
          'Yang dicat hanya sisi tegak: ½ × 12 × 2,5 = 15 m².',
          '15 : 4 = 3,75 → cat dibeli per kaleng, bulatkan ke atas, lalu kalikan harganya.',
        ],
        explanation: '15 m² : 4 = 3,75 → 4 kaleng; 4 × Rp80.000 = Rp320.000.',
      },
      {
        id: 't6',
        type: 'choice',
        konteks: '💎 Kotak perhiasan',
        cerita:
          'Kotak perhiasan berbentuk limas persegi dengan rusuk alas 10 cm. Luas permukaannya 360 cm².',
        pertanyaan: 'Berapa tinggi sisi tegak (tₛ) kotak itu?',
        cek: { jenis: 'tinggiSisi', luasPermukaan: 360, luasAlas: 100, kelilingAlas: 40 },
        satuanOpsi: 'cm',
        options: [
          { id: 'benar', label: '13 cm' },
          { id: 'lupa-dua', label: '6,5 cm' },
          { id: 'ts-tanpa-alas', label: '18 cm' },
          { id: 'lupa-bagi', label: '260 cm' },
        ],
        correct: 'benar',
        hints: [
          'LP − La = 360 − 100 = 260 cm² adalah luas semua sisi tegak.',
          '½ × 40 × tₛ = 260, jadi tₛ = 2 × 260 : 40.',
        ],
        explanation: 'tₛ = 2 × (360 − 100) : 40 = 13 cm.',
      },
      {
        id: 't7',
        type: 'choice',
        konteks: '🏕️ Tenda kemah',
        cerita:
          'Tenda kemah berbentuk limas persegi panjang dengan alas 3,2 m × 1,8 m dan tinggi 1,2 m. Tenda tidak berlantai kain.',
        pertanyaan: 'Berapa m² kain yang dibutuhkan?',
        cek: {
          jenis: 'dipakai',
          limas: { p: 3.2, l: 1.8, t: 1.2 },
          pakai: ['t0', 't1', 't2', 't3'],
        },
        satuanOpsi: 'm²',
        options: [
          { id: 'benar', label: '8,4 m²' },
          { id: 'pakai-alas', label: '14,16 m²' },
          { id: 'lupa-setengah', label: '16,8 m²' },
          { id: 'tambah-satu', label: '9,4 m²' },
        ],
        correct: 'benar',
        hints: [
          'Dinding pada rusuk 3,2 m: a = 0,9 m → tₛ = 1,5 m. Dinding pada rusuk 1,8 m: a = 1,6 m → tₛ = 2 m.',
          'Kain = 2 × ½ × 3,2 × 1,5 + 2 × ½ × 1,8 × 2 (tanpa lantai).',
        ],
        explanation: 'Kain = 4,8 + 3,6 = 8,4 m².',
      },
      {
        id: 't8',
        type: 'input',
        konteks: '🍵 Kemasan teh celup',
        cerita:
          'Kemasan teh celup berbentuk limas persegi tertutup dengan rusuk alas 6 cm dan tinggi 4 cm.',
        pertanyaan: 'Berapa cm² kertas untuk membuat satu kemasan?',
        cek: {
          jenis: 'lp',
          luasAlas: 36,
          kelilingAlas: 24,
          tinggiSisi: 5,
          tinggiLimas: 4,
          sisiAlas: 6,
          sumber: { n: 4, s: 6, t: 4 },
        },
        jawab: 96,
        satuan: 'cm²',
        hints: [
          'a = 3 cm, jadi tₛ = √(4² + 3²) = 5 cm.',
          'Kemasan tertutup: LP = La + ½ × K × tₛ.',
        ],
        explanation: 'LP = 36 + ½ × 24 × 5 = 36 + 60 = 96 cm².',
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
    goal: 'Merefleksikan proses menyelesaikan masalah kontekstual luas permukaan limas.',
    guru: 'Baca beberapa refleksi murid (dengan izin) untuk menutup pelajaran. Tanyakan: “Apa yang kalian periksa lebih dulu sebelum memakai rumus luas permukaan limas?”',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Bagaimana cara mencari tₛ bila yang diketahui tinggi limas? Mengapa tidak boleh langsung memakai tinggi limas?',
        placeholder: 'tₛ dicari dengan … karena …',
      },
      {
        id: 'q2',
        teks: 'Pada benda mana saja alas limas tidak dihitung? Beri contoh dari gazebo pojok baca.',
        placeholder: 'Alas tidak dihitung pada … karena …',
      },
      {
        id: 'q3',
        teks: 'Benda berbentuk limas apa di rumah atau sekolahmu yang bahannya bisa kamu hitung sekarang?',
        placeholder: 'Misalnya …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menyelesaikan masalah luas permukaan limas sekarang?',
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
    judul: 'Pojok baca siap dibangun!',
    teks: 'Proposal kelompokmu menjawab kebutuhan OSIS dengan hitungan luas permukaan limas yang tepat, bahan yang cukup, dan dana yang terjaga.',
    capaian: [
      'Mencari tinggi sisi tegak limas dari tinggi limas dengan teorema Pythagoras.',
      'Menentukan sisi limas yang memakai bahan pada atap, tenda, dan kotak, lalu menghitung luasnya.',
      'Mengubah cm² ke m² dan membulatkan banyak bahan yang dibeli ke atas.',
      'Menghitung biaya, membandingkannya dengan dana, lalu menyajikan keputusan dalam proposal.',
    ],
  },
};
