'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Masalah Kontekstual Gabungan Prisma & Limas
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Tujuan Pembelajaran:
   Menyelesaikan masalah kontekstual gabungan yang berkaitan dengan luas
   permukaan dan volume prisma dan limas.

   Model pembelajaran: PROBLEM BASED LEARNING (PBL).
   Masalah pemantik: "Tandon Air Hujan Kebun Sekolah".
   Tim Adiwiyata menitipkan surat berisi rencana tandon penampung air
   hujan untuk kebun hidroponik:
     • kebun butuh 250 liter air per hari; tandon penuh harus cukup
       untuk menyiram 7 hari (seminggu tanpa hujan);
     • tiga desain tandon beralas persegi 120 cm × 120 cm — A balok
       setinggi 100 cm, B balok 100 cm + corong limas terbalik setinggi
       80 cm (endapan mudah dikuras lewat keran di ujung corong), C
       balok setinggi 140 cm;
     • tandon dibuat dari pelat galvanis (semua sisi luar, termasuk
       tutup) yang dijual per lembar 100 cm × 180 cm, Rp120.000;
     • sisi luar dicat antikarat: 1 kaleng untuk 4 m², Rp65.000;
     • keran Rp35.000; talang atap mengalirkan 12 liter/menit saat
       hujan deras; dana Rp900.000.
   Semua ukuran corong membentuk tripel Pythagoras (a, t, tₛ) =
   (60, 80, 100).
   Konflik kognitif: "corong setinggi 80 cm menambah isi sebanyak balok
   80 cm (lupa ⅓)", "tandon lebih tinggi pasti butuh pelat lebih
   banyak" (B 180 cm memakai 8,64 m², C 140 cm memakai 9,6 m²), "LP
   gabungan = LP prisma + LP limas" (bidang sambung dihitung dua kali),
   "luas sisi corong memakai tinggi corong", "1.824.000 cm³ = 18.240
   liter", "7,296 hari → 8 hari" dan "4,8 lembar → 4 lembar" (arah
   pembulatan bergantung konteks). Hasil akhirnya: tandon B (cukup 7
   hari, pelat 5 lembar, cat 3 kaleng), total Rp830.000 — dana CUKUP
   dengan sisa Rp70.000; usulan tandon C membuat dana kurang Rp50.000,
   sehingga kelompok harus mengambil keputusan yang masuk akal.

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ....... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar . 'organisasi'
     Sintaks 3 — Membimbing penyelidikan ............ 'selidikIsi',
                                                      'selidikPelat',
                                                      'selidikBiaya'
     Sintaks 4 — Mengembangkan & menyajikan karya ... 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi ........ 'evaluasi'
     Penerapan & penutup ............................ 'terapkan', 'refleksi',
                                                      'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — murid menduga, memilah informasi,
       menyusun rencana, memeriksa lembar kerja kelompok lain, lalu
       merefleksikan strateginya.
     • Bermakna (meaningful) — volume menjawab "cukupkah airnya?", luas
       permukaan menjawab "berapa pelat & catnya?"; keduanya berujung
       pada keputusan yang disajikan kepada Tim Adiwiyata.
     • Menggembirakan (joyful) — Lab Gabungan yang bisa memisah dan
       menggabungkan prisma & limas, gambar tandon 3D berwarna per
       bagian, memilih sisi yang memakai pelat, umpan balik yang
       menunjuk letak kekeliruan, dan Papan Proposal.

   Rangkaian aktivitas (± 2 × 40 menit; kelompok 3–4 murid):
     1. Orientasi   (8')  — surat Tim Adiwiyata, gambar tiga desain,
                            dugaan awal (tidak dinilai), rumusan masalah
                            inti, hipotesis kelompok.
     2. Organisasi  (6')  — memilih peran, memilah informasi
                            (diketahui/ditanya/tidak diperlukan),
                            menyusun urutan rencana penyelesaian.
     3. Isi air     (14') — Lab Gabungan: pilih desain, pisahkan prisma
                            & limas; kartu data volume bagian demi
                            bagian → liter → banyak hari (bulat ke
                            bawah) berdiagnosa; memilih desain yang
                            airnya cukup.
     4. Pelat       (12') — Pemilih Sisi tandon B dan C: sisi luar mana
                            yang memakai pelat (bidang sambung tidak),
                            tₛ corong dengan Pythagoras, luas pelat,
                            cm² → m²; memilih desain yang paling hemat.
     5. Anggaran    (10') — kartu lembar pelat & kaleng cat (bulat ke
                            atas), waktu isi dari talang; tabel anggaran
                            vs dana; pertanyaan penuntun.
     6. Karya       (10') — usulan tandon C, keputusan, Papan Proposal
                            otomatis, kalimat presentasi.
     7. Evaluasi    (8')  — menilai lembar kerja Kelompok Kenari
                            langkah demi langkah, menarik pelajaran,
                            refleksi proses & hipotesis.
     8. Uji terap   (8')  — 8 soal kontekstual gabungan berdiagnosa.
     9. Refleksi    (4')  — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/
   ensureTapOrderState()/shuffleArray() dari shared/engine.js, satu kali
   saat state disiapkan.

   Bangun gabungan ditulis { alas, prisma?, limas? } (lihat engine
   seksi 60). Semua kunci dihitung ulang dengan engine seksi 48, 55,
   58, dan 60 di tests/mpi-22.10-data.test.js.
   ============================================================ */

var PBL = 'Problem Based Learning';

var TANDON_A = {
  nama: 'Tandon A',
  satuan: 'cm',
  alas: { n: 4, s: 120 },
  prisma: { t: 100 },
};
var TANDON_B = {
  nama: 'Tandon B',
  satuan: 'cm',
  alas: { n: 4, s: 120 },
  prisma: { t: 100 },
  limas: { t: 80, posisi: 'bawah' },
};
var TANDON_C = {
  nama: 'Tandon C',
  satuan: 'cm',
  alas: { n: 4, s: 120 },
  prisma: { t: 140 },
};

var DATA = {
  /* ----------------------------------------------------------
     MASALAH PEMANTIK — dipakai di beberapa tahap
     ---------------------------------------------------------- */
  desain: [
    {
      id: 'A',
      nama: 'Tandon A',
      gaya: 'balok',
      info: 'balok 120 × 120 × 100 cm',
      bangun: TANDON_A,
    },
    {
      id: 'B',
      nama: 'Tandon B',
      gaya: 'balok + corong',
      info: 'balok 100 cm + corong limas 80 cm',
      bangun: TANDON_B,
    },
    {
      id: 'C',
      nama: 'Tandon C',
      gaya: 'balok tinggi',
      info: 'balok 120 × 120 × 140 cm',
      bangun: TANDON_C,
    },
  ],
  target: { perHari: 250, hari: 7 },
  desainDipilih: 'B',
  pelat: { panjang: 100, lebar: 180, harga: 120000 },
  cat: { luas: 4, harga: 65000 },
  keran: { harga: 35000 },
  debitTalang: 12,
  lamaHujan: 120,
  dana: 900000,

  /* Tahap 4 — pemilih sisi yang memakai pelat. */
  benda: [
    {
      id: 'B',
      nama: '🛢️ Tandon B (balok + corong)',
      bangun: TANDON_B,
      bahan: 'pelat',
      cerita:
        'Balok 120 × 120 × 100 cm dengan corong limas terbalik setinggi 80 cm di bawahnya. Tandon tertutup rapat agar air tidak kotor; balok dan corong dilas menjadi satu.',
      namaSisi: {
        atas: 'Tutup atas',
        p0: 'Dinding depan',
        p1: 'Dinding kanan',
        p2: 'Dinding belakang',
        p3: 'Dinding kiri',
        l0: 'Corong depan',
        l1: 'Corong kanan',
        l2: 'Corong belakang',
        l3: 'Corong kiri',
        'sambung-p': 'Alas balok (tempat corong menempel)',
        'sambung-l': 'Alas corong (tempat balok menempel)',
      },
      dipakai: ['atas', 'p0', 'p1', 'p2', 'p3', 'l0', 'l1', 'l2', 'l3'],
      alasan:
        'Pelat hanya untuk sisi LUAR: tutup, empat dinding balok, dan empat segitiga corong. Alas balok dan alas corong saling menempel di dalam tandon, jadi tidak ada pelatnya.',
      infoLuas:
        'Corong: a = 120 : 2 = 60 cm, t = 80 cm → tₛ = √(80² + 60²). Pelat = tutup + 4 dinding + 4 segitiga corong.',
    },
    {
      id: 'C',
      nama: '🛢️ Tandon C (balok tinggi)',
      bangun: TANDON_C,
      bahan: 'pelat',
      cerita:
        'Balok 120 × 120 × 140 cm yang tertutup rapat. Air dikuras lewat keran di dinding bawah, jadi alasnya datar dari pelat.',
      namaSisi: {
        alas: 'Alas',
        atas: 'Tutup atas',
        p0: 'Dinding depan',
        p1: 'Dinding kanan',
        p2: 'Dinding belakang',
        p3: 'Dinding kiri',
      },
      dipakai: ['alas', 'atas', 'p0', 'p1', 'p2', 'p3'],
      alasan: 'Balok tertutup rapat, jadi SEMUA sisinya memakai pelat: LP = 2 × La + K × t.',
      infoLuas: 'LP balok = 2 × 120 × 120 + 480 × 140.',
    },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI PADA MASALAH (PBL sintaks 1)
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi pada Masalah',
    syntax: PBL + ' · Sintaks 1',
    goal: 'Memahami masalah nyata pembuatan tandon air hujan kebun sekolah dan menyampaikan dugaan awal kelompok.',
    tp: 'Menyelesaikan masalah kontekstual gabungan yang berkaitan dengan luas permukaan dan volume prisma dan limas.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menghitung volume bangun gabungan prisma & limas bagian demi bagian, lalu mengubahnya ke liter.',
      'Menentukan sisi luar bangun gabungan yang memakai bahan (bidang sambung tidak dihitung) dan menghitung luasnya.',
      'Memakai teorema Pythagoras untuk tₛ serta membulatkan hasil sesuai konteks (ke atas atau ke bawah).',
      'Membandingkan biaya dengan dana, lalu menyajikan keputusan berdasarkan hitungan volume dan luas permukaan.',
    ],
    guru: 'Bacakan surat Tim Adiwiyata dan tunjukkan tiga desain tandon. Tanyakan: “Tandon B paling tinggi. Apakah ia juga paling banyak memakai pelat?” Jangan membenarkan dugaan murid — dugaan ini diuji sendiri pada tahap penyelidikan dan evaluasi.',
    judul: 'Tandon Air Hujan Kebun Sekolah',
    pengantar:
      'Kebun hidroponik sekolah sering kekeringan saat kemarau. Tim Adiwiyata ingin menampung air hujan dari talang atap ke sebuah tandon. Kelompokmu ditunjuk menjadi tim perencana: memilih desain tandon yang airnya cukup, menghitung pelat dan cat yang dibutuhkan, dan memastikan dananya cukup.',
    surat: [
      {
        id: 'sAir',
        ikon: '💧',
        judul: 'Kebutuhan air',
        butir: [
          'Kebun butuh 250 liter air setiap hari.',
          'Tandon penuh harus cukup untuk menyiram 7 hari (seminggu tanpa hujan).',
        ],
      },
      {
        id: 'sDesain',
        ikon: '🛢️',
        judul: 'Tiga desain tandon',
        butir: [
          'Semua beralas persegi 120 cm × 120 cm.',
          'A: balok setinggi 100 cm. C: balok setinggi 140 cm.',
          'B: balok setinggi 100 cm + corong limas terbalik setinggi 80 cm di bawahnya.',
        ],
      },
      {
        id: 'sPelat',
        ikon: '🧱',
        judul: 'Pelat & cat',
        butir: [
          'Semua sisi luar tandon (termasuk tutup) dibuat dari pelat galvanis.',
          'Pelat dijual per lembar 100 cm × 180 cm, Rp120.000 per lembar.',
          'Sisi luar dicat antikarat: 1 kaleng untuk 4 m², Rp65.000 per kaleng.',
        ],
      },
      {
        id: 'sTalang',
        ikon: '🌧️',
        judul: 'Talang & keran',
        butir: [
          'Talang atap mengalirkan 12 liter air per menit saat hujan deras.',
          'Satu keran penguras Rp35.000.',
        ],
      },
      {
        id: 'sDana',
        ikon: '💰',
        judul: 'Dana Adiwiyata',
        butir: ['Dana yang tersedia Rp900.000 untuk pelat, cat, dan keran.'],
      },
    ],
    dugaan: [
      {
        id: 'd1',
        tanya:
          'Tandon B (tinggi total 180 cm) lebih tinggi daripada tandon C (140 cm). Menurutmu, mana yang memerlukan pelat lebih banyak?',
        opsi: [
          { id: 'b', label: 'Tandon B, karena lebih tinggi' },
          { id: 'c', label: 'Tandon C' },
          { id: 'sama', label: 'Sama saja, alasnya sama' },
          { id: 'dua', label: 'Tandon B, hampir dua kali tandon C' },
        ],
      },
      {
        id: 'd2',
        tanya: 'Corong limas setinggi 80 cm di bawah tandon B menambah isi air sebanyak …',
        opsi: [
          { id: 'sama', label: 'Sama dengan balok setinggi 80 cm' },
          { id: 'setengah', label: 'Setengah balok setinggi 80 cm' },
          { id: 'sepertiga', label: 'Sepertiga balok setinggi 80 cm' },
          { id: 'tidak', label: 'Tidak menambah, karena bentuknya runcing' },
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
          'Desain mana yang airnya cukup 7 hari (volume), berapa pelat dan cat yang dibutuhkan (luas permukaan), dan cukupkah dananya?',
      },
      { id: 'volume', label: 'Berapa liter air yang muat di tandon B saja?' },
      { id: 'hujan', label: 'Berapa kali hujan turun dalam seminggu?' },
      { id: 'tanaman', label: 'Berapa banyak tanaman yang bisa ditanam di kebun?' },
    ],
    masalahCorrect: 'inti',
    masalahUmpan: {
      inti: 'Tepat! Masalah ini gabungan: volume menjawab "cukupkah airnya?", luas permukaan menjawab "berapa pelat dan catnya?", lalu keduanya menentukan biaya.',
      volume:
        'Volume tandon B memang perlu dihitung, tetapi Tim Adiwiyata juga menanyakan pelat, cat, dan dana untuk semua desain.',
      hujan:
        'Surat tidak memuat data banyaknya hujan. Fokuslah pada isi tandon, bahan, dan dananya.',
      tanaman:
        'Banyak tanaman tidak ditanyakan. Fokuslah pada tandon: isi airnya, bahannya, dan dananya.',
    },
    hipotesisLabel:
      'Tulis hipotesis kelompokmu: langkah apa yang akan kalian lakukan untuk memilih desain tandon?',
    hipotesisPlaceholder: 'Menurut kami, pertama-tama kita harus …',
    nextLabel: 'Lanjut: Atur Kelompok →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENGORGANISASI MURID (PBL sintaks 2)
     ---------------------------------------------------------- */
  organisasi: {
    kicker: 'Tahap 2 · Mengorganisasi Belajar',
    syntax: PBL + ' · Sintaks 2',
    goal: 'Membagi peran, memilah informasi dari surat Tim Adiwiyata, dan menyusun rencana penyelesaian.',
    guru: 'Pastikan setiap anggota memegang satu peran dan peran ditukar pada pertemuan berikutnya. Saat pemilahan, minta kelompok menjelaskan mengapa warna cat tidak diperlukan. Rencana yang tersusun menjadi peta langkah pada tiga penyelidikan berikutnya.',
    peranLabel: 'Pilih peranmu di kelompok:',
    peran: [
      {
        id: 'ketua',
        label:
          '🧭 <strong>Ketua Tim</strong> — memastikan semua anggota berpendapat dan rencana diikuti.',
      },
      {
        id: 'isi',
        label:
          '💧 <strong>Juru Isi</strong> — menghitung volume setiap bagian tandon dan mengubahnya ke liter.',
      },
      {
        id: 'pelat',
        label:
          '📐 <strong>Juru Pelat</strong> — menentukan sisi yang memakai pelat, mencari tₛ, dan menghitung luasnya.',
      },
      {
        id: 'uang',
        label:
          '💰 <strong>Bendahara</strong> — menghitung lembar pelat, kaleng cat, biaya, dan sisa dana.',
      },
    ],
    judulPilah: 'Pilah informasi dari surat Tim Adiwiyata',
    opsiPilah: [
      { id: 'diketahui', label: 'Diketahui' },
      { id: 'ditanya', label: 'Ditanya' },
      { id: 'tidakPerlu', label: 'Tidak diperlukan' },
    ],
    pilah: [
      {
        id: 'i1',
        teks: 'Alas tandon persegi 120 cm × 120 cm.',
        correct: 'diketahui',
        explanation: 'Luas alas dipakai untuk volume, dan rusuk alas untuk luas pelat.',
      },
      {
        id: 'i2',
        teks: 'Kebun butuh 250 liter per hari; tandon penuh harus cukup 7 hari.',
        correct: 'diketahui',
        explanation: 'Syarat ini dipakai untuk memilih desain yang airnya cukup.',
      },
      {
        id: 'i3',
        teks: 'Pelat dijual per lembar 100 cm × 180 cm, Rp120.000.',
        correct: 'diketahui',
        explanation: 'Dipakai untuk menghitung banyak lembar pelat dan biayanya.',
      },
      {
        id: 'i4',
        teks: 'Desain mana yang airnya cukup dan pelatnya paling hemat?',
        correct: 'ditanya',
        explanation: 'Ini keputusan utama yang harus dijawab kelompok.',
      },
      {
        id: 'i5',
        teks: 'Berapa lembar pelat dan kaleng cat yang harus dibeli?',
        correct: 'ditanya',
        explanation: 'Banyak bahan ini menentukan biaya tandon.',
      },
      {
        id: 'i6',
        teks: 'Cukupkah dana Rp900.000?',
        correct: 'ditanya',
        explanation: 'Jawaban ini disajikan dalam proposal kepada Tim Adiwiyata.',
      },
      {
        id: 'i7',
        teks: 'Tandon akan dicat warna hijau daun.',
        correct: 'tidakPerlu',
        explanation: 'Warna cat tidak memengaruhi volume, luas pelat, maupun biayanya.',
      },
      {
        id: 'i8',
        teks: 'Kebun ditanami selada dan kangkung.',
        correct: 'tidakPerlu',
        explanation:
          'Jenis tanaman tidak dipakai dalam perhitungan; yang dipakai kebutuhan airnya.',
      },
    ],
    judulRencana: 'Susun rencana penyelesaian kelompok',
    instruksiRencana: 'Ketuk langkah-langkah berikut sesuai urutan yang paling masuk akal.',
    rencana: [
      { id: 'r1', label: '🧊 Hitung volume tiap desain: V prisma + ⅓ × La × t limas' },
      { id: 'r2', label: '💧 Ubah ke liter, lalu bandingkan dengan kebutuhan 7 hari' },
      {
        id: 'r3',
        label: '🔍 Tentukan sisi luar yang memakai pelat (bidang sambung tidak dihitung)',
      },
      { id: 'r4', label: '📐 Cari tₛ corong dengan Pythagoras, lalu hitung luas pelat' },
      { id: 'r5', label: '🛒 Hitung lembar pelat & kaleng cat (bulat ke atas) dan biayanya' },
      { id: 'r6', label: '🪧 Bandingkan dengan dana, ambil keputusan, lalu sajikan' },
    ],
    rencanaSukses:
      '<strong>Rencana tersusun!</strong> volume → liter & hari → sisi yang memakai pelat → tₛ & luas pelat → bahan & biaya → keputusan. Rencana ini kalian jalankan pada tiga penyelidikan berikutnya.',
    nextLabel: 'Mulai Penyelidikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENYELIDIKAN 1: ISI AIR (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikIsi: {
    kicker: 'Tahap 3 · Penyelidikan 1 — Isi Air Tandon',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menghitung volume tiga desain tandon bagian demi bagian, mengubahnya ke liter, dan memilih desain yang airnya cukup 7 hari.',
    guru: 'Minta Juru Isi memisahkan tandon B di Lab Gabungan: “Bagian mana prisma, bagian mana limas? Apa alas keduanya?” Pantau kekeliruan “volume corong = La × t” (lupa ⅓) dan “1 liter = 10 cm³ atau 100 cm³”. Tanyakan: “Mengapa 7,296 hari ditulis 7 hari, bukan 8?”',
    instruksi:
      'Tandon B adalah bangun gabungan: balok (prisma) di atas dan corong (limas) di bawah, dengan alas yang sama. Volume gabungan = volume prisma + volume limas. Coba ketiga desain di Lab Gabungan, pisahkan bagian tandon B, lalu isi kartu data.',
    instruksiLab:
      'Pilih desain, lalu ketuk “Pisahkan prisma & limas” pada tandon B. Bidang ungu adalah bidang sambung (alas bersama).',
    instruksiData:
      'Isi dalam cm³, lalu ubah ke liter (1 liter = 1.000 cm³). Boleh memakai titik ribuan (contoh 1.440.000).',
    tanya: [
      {
        id: 'k1',
        tanya: 'Desain mana yang airnya cukup untuk 7 hari?',
        opsi: [
          { id: 'bc', label: 'Tandon B dan tandon C' },
          { id: 'semua', label: 'Ketiga tandon' },
          { id: 'c', label: 'Hanya tandon C' },
          { id: 'a', label: 'Hanya tandon A' },
        ],
        correct: 'bc',
        umpan: {
          bc: 'Tepat! A hanya cukup 5 hari (1.440 liter). B cukup 7 hari (1.824 liter) dan C cukup 8 hari (2.016 liter).',
          semua:
            'Periksa tandon A: 1.440 : 250 = 5,76, jadi hanya cukup 5 hari. Coba pilih yang lain.',
          c: 'Tandon B juga cukup: 1.824 : 250 = 7,296, jadi cukup 7 hari. Coba pilih yang lain.',
          a: 'Tandon A justru paling sedikit isinya (1.440 liter, 5 hari). Coba pilih yang lain.',
        },
      },
      {
        id: 'k2',
        tanya: 'Mengapa volume corong tandon B dihitung ⅓ × La × t, bukan La × t?',
        opsi: [
          {
            id: 'limas',
            label: 'Corong berbentuk limas; isinya ⅓ isi prisma yang alas dan tingginya sama',
          },
          { id: 'runcing', label: 'Karena ujung corong runcing sehingga airnya bocor' },
          { id: 'bebas', label: 'Boleh La × t atau ⅓ × La × t, hasilnya sama' },
          { id: 'pendek', label: 'Karena corong lebih pendek daripada balok' },
        ],
        correct: 'limas',
        umpan: {
          limas:
            'Tepat! V corong = ⅓ × 14.400 × 80 = 384.000 cm³ (384 liter), sepertiga balok setinggi 80 cm (1.152 liter).',
          runcing:
            'Corong tertutup dan tidak bocor. Faktor ⅓ berasal dari bentuk limas. Coba pilih yang lain.',
          bebas:
            'La × t memberi 1.152.000 cm³, tiga kali isi corong sebenarnya. Coba pilih yang lain.',
          pendek:
            'Tinggi tidak menentukan faktor ⅓. Limas setinggi apa pun isinya ⅓ × La × t. Coba pilih yang lain.',
        },
      },
      {
        id: 'k3',
        tanya: 'Mengapa 1.824 : 250 = 7,296 ditulis “cukup 7 hari”, bukan 8 hari?',
        opsi: [
          { id: 'bawah', label: 'Pada hari ke-8 airnya tinggal 74 liter, tidak cukup 250 liter' },
          { id: 'dekat', label: 'Karena 7,296 lebih dekat ke 7' },
          { id: 'aturan', label: 'Karena semua desimal selalu dibulatkan ke bawah' },
          { id: 'hemat', label: 'Agar air lebih hemat' },
        ],
        correct: 'bawah',
        umpan: {
          bawah:
            'Tepat! Setelah 7 hari terpakai 1.750 liter, sisanya 74 liter — kurang untuk hari ke-8. Hari yang TERPENUHI dibulatkan ke bawah.',
          dekat:
            'Bukan soal dekat-jauh. Seandainya hasilnya 7,9 pun tetap cukup 7 hari, karena hari ke-8 tidak terpenuhi.',
          aturan:
            'Tidak selalu. Bahan yang dibeli justru dibulatkan ke atas. Arah pembulatan mengikuti konteks.',
          hemat:
            'Pembulatan tidak mengubah jumlah air. Coba pikirkan: cukupkah air untuk hari ke-8?',
        },
      },
    ],
    temuan:
      'A cukup 5 hari (tidak memenuhi); B 1.440.000 + 384.000 = 1.824.000 cm³ = 1.824 liter, cukup 7 hari; C 2.016 liter, cukup 8 hari. Volume gabungan = V prisma + V limas.',
    nextLabel: 'Lanjut: Penyelidikan 2 →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENYELIDIKAN 2: PELAT (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikPelat: {
    kicker: 'Tahap 4 · Penyelidikan 2 — Pelat Tandon',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menentukan sisi luar tandon B dan C yang memakai pelat, mencari tₛ corong dengan Pythagoras, menghitung luas pelat, lalu memilih desain yang paling hemat.',
    guru: 'Juru Pelat memimpin tahap ini. Tekankan bahwa bidang sambung ada di DALAM tandon. Tanyakan: “Kalau LP balok ditambah LP limas, bidang mana yang terhitung padahal tidak ada pelatnya?” Minta kelompok menunjukkan segitiga siku-siku a–t–tₛ pada gambar corong.',
    instruksi:
      'Ketuk sisi yang memakai pelat pada setiap tandon, lalu periksa. Setelah tepat, hitung luas pelatnya. Tandon yang airnya tidak cukup (A) tidak perlu dihitung lagi.',
    tanya: [
      {
        id: 's1',
        tanya: 'Mengapa pelat tandon B TIDAK sama dengan LP balok + LP limas?',
        opsi: [
          {
            id: 'sambung',
            label: 'Bidang sambung (alas balok & alas corong) ada di dalam, tidak memakai pelat',
          },
          { id: 'rumus', label: 'Rumus luas permukaan tidak berlaku untuk tandon' },
          { id: 'corong', label: 'Karena corong tidak perlu pelat' },
          { id: 'tutup', label: 'Karena tandon tidak memakai tutup' },
        ],
        correct: 'sambung',
        umpan: {
          sambung:
            'Tepat! LP balok + LP limas menghitung bidang sambung dua kali: 2 × 14.400 = 28.800 cm² pelat yang sebenarnya tidak ada.',
          rumus:
            'Rumusnya tetap berlaku untuk setiap bagian. Masalahnya ada pada bidang yang saling menempel. Coba pilih yang lain.',
          corong: 'Corong memakai pelat pada keempat sisi segitiganya. Coba pilih yang lain.',
          tutup: 'Tandon memakai tutup agar air tidak kotor. Coba pilih yang lain.',
        },
      },
      {
        id: 's2',
        tanya: 'Tandon B lebih tinggi daripada C, tetapi pelatnya lebih sedikit. Mengapa?',
        opsi: [
          {
            id: 'corong',
            label:
              'Empat segitiga corong (24.000 cm²) lebih kecil daripada alas + tambahan dinding C (33.600 cm²)',
          },
          { id: 'salah', label: 'Seharusnya tandon B lebih banyak karena lebih tinggi' },
          { id: 'tipis', label: 'Karena pelat corong lebih tipis' },
          {
            id: 'isi',
            label: 'Karena isi tandon B lebih sedikit, jadi pelatnya pasti lebih sedikit',
          },
        ],
        correct: 'corong',
        umpan: {
          corong:
            'Tepat! B: 14.400 + 48.000 + 24.000 = 86.400 cm². C: 28.800 + 67.200 = 96.000 cm². Bangun lebih tinggi belum tentu memakai bahan lebih banyak.',
          salah:
            'Hitung lagi: pelat B 86.400 cm², pelat C 96.000 cm². Tinggi saja tidak menentukan luas permukaan.',
          tipis: 'Tebal pelat tidak memengaruhi luasnya. Coba pilih yang lain.',
          isi: 'Isi dan luas permukaan tidak selalu sejalan. Bandingkan bagian yang berbeda: corong B vs alas + dinding tambahan C.',
        },
      },
      {
        id: 's3',
        tanya: 'Desain mana yang dipilih kelompokmu?',
        opsi: [
          { id: 'B', label: 'Tandon B' },
          { id: 'C', label: 'Tandon C' },
          { id: 'A', label: 'Tandon A' },
          { id: 'semua', label: 'Ketiganya sama baiknya' },
        ],
        correct: 'B',
        umpan: {
          B: 'Tepat! Tandon B airnya cukup 7 hari dan pelatnya paling sedikit (8,64 m²) di antara desain yang cukup.',
          C: 'Tandon C airnya cukup, tetapi pelatnya 9,6 m², lebih boros daripada B (8,64 m²).',
          A: 'Tandon A airnya hanya cukup 5 hari, belum memenuhi syarat 7 hari.',
          semua:
            'A tidak memenuhi syarat air, C lebih boros pelat. Hanya satu desain yang cukup dan hemat.',
        },
      },
    ],
    temuan:
      'Tandon B: tₛ corong 100 cm, pelat 14.400 + 48.000 + 24.000 = 86.400 cm² = 8,64 m² (bidang sambung tidak dihitung). Tandon C: 96.000 cm² = 9,6 m². Tandon B dipilih: air cukup dan paling hemat pelat.',
    nextLabel: 'Lanjut: Penyelidikan 3 →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENYELIDIKAN 3: BAHAN, WAKTU & ANGGARAN (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikBiaya: {
    kicker: 'Tahap 5 · Penyelidikan 3 — Bahan & Anggaran',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menghitung lembar pelat dan kaleng cat dengan pembulatan yang tepat, waktu mengisi tandon, lalu menyusun anggaran dan membandingkannya dengan dana.',
    guru: 'Bendahara memimpin tahap ini. Bandingkan dua arah pembulatan: 4,8 lembar → 5 lembar (bahan dibeli, KE ATAS) dengan 7,296 hari → 7 hari (hari terpenuhi, KE BAWAH). Minta kelompok menjelaskan alasannya dengan kalimat sendiri.',
    instruksi:
      'Isi kartu setiap kebutuhan. Boleh memakai titik ribuan (contoh 86.400) dan koma desimal (contoh 8,64). Uang ditulis tanpa “Rp”.',
    tanya: [
      {
        id: 'b1',
        tanya:
          'Pelat 4,8 lembar dibeli 5 lembar, sedangkan air 7,296 hari ditulis cukup 7 hari. Mengapa arah pembulatannya berbeda?',
        opsi: [
          {
            id: 'konteks',
            label:
              'Bahan yang dibeli harus cukup (ke atas); hari yang terpenuhi harus utuh (ke bawah)',
          },
          { id: 'dekat', label: 'Keduanya dibulatkan ke bilangan terdekat' },
          { id: 'sama', label: 'Seharusnya keduanya dibulatkan ke atas' },
          { id: 'bebas', label: 'Arah pembulatan boleh dipilih sesukanya' },
        ],
        correct: 'konteks',
        umpan: {
          konteks:
            'Tepat! 4 lembar hanya 72.000 cm², tandon tidak tertutup semua. Sebaliknya, air hari ke-8 tidak cukup, jadi yang terpenuhi 7 hari.',
          dekat:
            '7,296 memang dekat ke 7, tetapi 4,8 dekat ke 5 hanya kebetulan. Pembulatan di sini soal cukup atau tidak.',
          sama: 'Bila air ditulis 8 hari, hari ke-8 kebun kekurangan air. Coba pilih yang lain.',
          bebas: 'Arah pembulatan ditentukan konteks, bukan selera. Coba pilih yang lain.',
        },
      },
      {
        id: 'b2',
        tanya: 'Luas pelat tandon B 86.400 cm². Berapa m²?',
        opsi: [
          { id: 'tepat', label: '8,64 m²' },
          { id: 'f100', label: '864 m²' },
          { id: 'f1000', label: '86,4 m²' },
          { id: 'terbalik', label: '864.000.000 m²' },
        ],
        correct: 'tepat',
        umpan: {
          tepat: 'Tepat! 1 m² = 10.000 cm², jadi 86.400 : 10.000 = 8,64 m².',
          f100: 'Itu dibagi 100 (faktor satuan panjang). Untuk luas, 1 m² = 10.000 cm².',
          f1000:
            'Itu dibagi 1.000. Satuan luas berubah 100 kali setiap tingkat: 1 m² = 10.000 cm².',
          terbalik:
            'Arahnya terbalik. Dari cm² ke m² (satuan kecil ke besar) dibagi, bukan dikali.',
        },
      },
      {
        id: 'b3',
        tanya:
          'Hujan deras biasanya berlangsung 2 jam. Apakah tandon B bisa penuh dari talang (12 liter per menit)?',
        opsi: [
          {
            id: 'belum',
            label: 'Belum; 2 jam hanya mengisi 1.440 liter, penuh butuh 2 jam 32 menit',
          },
          { id: 'tepat', label: 'Penuh tepat dalam 2 jam' },
          { id: 'cepat', label: 'Penuh dalam kurang dari 1 jam' },
          { id: 'tidak', label: 'Tidak akan pernah penuh' },
        ],
        correct: 'belum',
        umpan: {
          belum:
            'Tepat! 120 menit × 12 liter = 1.440 liter. Waktu penuh = 1.824 : 12 = 152 menit = 2 jam 32 menit, jadi perlu dua kali hujan deras.',
          tepat: '2 jam = 120 menit, dan 120 × 12 = 1.440 liter, belum 1.824 liter.',
          cepat: 'Dalam 1 jam talang hanya mengalirkan 60 × 12 = 720 liter.',
          tidak: 'Tandon tetap bisa penuh, hanya butuh lebih dari satu kali hujan deras.',
        },
      },
      {
        id: 'b4',
        tanya: 'Berdasarkan tabel anggaran, bagaimana keadaan dana Adiwiyata?',
        opsi: [
          { id: 'sisa', label: 'Cukup, sisa Rp70.000' },
          { id: 'pas', label: 'Pas, tidak bersisa' },
          { id: 'kurang', label: 'Kurang Rp70.000' },
          { id: 'banyak', label: 'Cukup, sisa Rp170.000' },
        ],
        correct: 'sisa',
        umpan: {
          sisa: 'Tepat! Total Rp830.000, dana Rp900.000, jadi sisanya Rp70.000.',
          pas: 'Hitung lagi: Rp900.000 − Rp830.000 bukan nol.',
          kurang: 'Total biaya Rp830.000 lebih KECIL daripada dana Rp900.000.',
          banyak: 'Hitung lagi total biayanya: Rp600.000 + Rp195.000 + Rp35.000.',
        },
      },
    ],
    temuan:
      'Pelat 5 lembar (Rp600.000), cat 3 kaleng (Rp195.000), keran Rp35.000. Total Rp830.000, dana cukup dengan sisa Rp70.000. Tandon B penuh dari talang dalam 2 jam 32 menit.',
    nextLabel: 'Lanjut: Susun Karya →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGEMBANGKAN & MENYAJIKAN KARYA (PBL sintaks 4)
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 6 · Menyajikan Karya',
    syntax: PBL + ' · Sintaks 4',
    goal: 'Mengambil keputusan berdasarkan perhitungan volume dan luas permukaan, lalu menyusun dan menyajikan Papan Proposal kelompok.',
    guru: 'Minta setiap kelompok mempresentasikan Papan Proposal (1–2 menit) di depan kelas atau dalam galeri berjalan. Kelompok lain memberi satu pujian dan satu pertanyaan. Tekankan bahwa setiap keputusan harus didukung hasil hitung volume DAN luas permukaan.',
    instruksi:
      'Pak Kebun mengusulkan tandon C saja, “supaya airnya cukup 8 hari”. Hitung akibatnya pada anggaran, ambil keputusan yang masuk akal, lalu susun proposal untuk Tim Adiwiyata.',
    usulan: 'C',
    tanya: [
      {
        id: 'p1',
        tanya: 'Bila tandon C yang dibuat, apa akibatnya pada anggaran?',
        opsi: [
          {
            id: 'kurang',
            label: 'Pelat 6 lembar (Rp720.000); total Rp950.000, dana kurang Rp50.000',
          },
          { id: 'cukup', label: 'Pelat tetap 5 lembar, dana masih cukup' },
          { id: 'tetap', label: 'Biaya tidak berubah karena alasnya sama' },
          { id: 'murah', label: 'Lebih murah karena tanpa corong' },
        ],
        correct: 'kurang',
        umpan: {
          kurang:
            'Tepat! 96.000 : 18.000 ≈ 5,33 → 6 lembar = Rp720.000. Rp720.000 + Rp195.000 + Rp35.000 = Rp950.000 > Rp900.000.',
          cukup: '96.000 : 18.000 ≈ 5,33, jadi perlu 6 lembar, bukan 5. Coba pilih yang lain.',
          tetap:
            'Alasnya sama, tetapi luas pelatnya berbeda (9,6 m² vs 8,64 m²). Coba pilih yang lain.',
          murah:
            'Tanpa corong, tandon C butuh alas datar dan dinding lebih tinggi, sehingga pelatnya justru lebih banyak.',
        },
      },
      {
        id: 'p2',
        tanya: 'Keputusan mana yang paling masuk akal?',
        opsi: [
          {
            id: 'B',
            label: 'Tetap tandon B: air cukup 7 hari, dana bersisa Rp70.000 untuk cadangan',
          },
          { id: 'Ckurang', label: 'Tandon C dengan membeli 5 lembar pelat saja' },
          { id: 'A', label: 'Tandon A karena paling murah' },
          { id: 'Ccat', label: 'Tandon C tanpa cat antikarat agar dana cukup' },
        ],
        correct: 'B',
        umpan: {
          B: 'Tepat! Keputusan ini memenuhi kebutuhan air 7 hari, tetap dalam dana, dan sisa dana bisa menjadi cadangan perawatan.',
          Ckurang:
            '5 lembar hanya 90.000 cm², kurang dari 96.000 cm² pelat tandon C. Coba pilih yang lain.',
          A: 'Tandon A airnya hanya cukup 5 hari, belum memenuhi syarat. Coba pilih yang lain.',
          Ccat: 'Tanpa cat antikarat, pelat cepat berkarat dan tandon bisa bocor. Itu bukan penghematan yang bijak.',
        },
      },
    ],
    proposalJudul: 'Proposal Tandon Air Hujan Kebun Sekolah',
    presentasiLabel:
      'Tulis kalimat presentasi kelompokmu untuk Tim Adiwiyata (keputusan + alasan berdasarkan hitungan).',
    presentasiPlaceholder:
      'Kami memilih tandon B karena isinya … liter sehingga cukup … hari. Pelat yang dibutuhkan … Cat … Total biaya … sehingga …',
    penutup:
      'Volume dihitung bagian demi bagian (prisma + ⅓ limas), luas pelat hanya sisi luar (bidang sambung tidak dihitung) dengan tₛ dari teorema Pythagoras, dan setiap hasil dibulatkan sesuai konteksnya.',
    nextLabel: 'Lanjut: Evaluasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENGANALISIS & MENGEVALUASI (PBL sintaks 5)
     Setiap langkah memuat cek (engine seksi 60) & nilai yang ditulis
     Kelompok Kenari; tes memastikan status benar/keliru-nya.
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 7 · Analisis & Evaluasi',
    syntax: PBL + ' · Sintaks 5',
    goal: 'Mengevaluasi proses penyelesaian masalah: memeriksa lembar kerja kelompok lain dan merefleksikan strategi sendiri.',
    guru: 'Bahas bersama langkah-langkah yang keliru pada lembar kerja Kelompok Kenari. Minta kelompok membandingkan hipotesis awal dengan hasil penyelidikan dan menuliskan satu hal yang akan mereka lakukan berbeda.',
    lembarJudul: '📝 Lembar kerja Kelompok Kenari',
    instruksiLembar:
      'Kelompok Kenari menyelesaikan masalah yang sama. Periksa setiap langkah mereka: benar atau keliru?',
    opsiNilai: [
      { id: 'benar', label: '✓ Benar' },
      { id: 'keliru', label: '✗ Keliru' },
    ],
    langkah: [
      {
        id: 'e1',
        teks: 'Volume corong = 14.400 × 80 = 1.152.000 cm³.',
        cek: {
          jenis: 'volume',
          bangun: { satuan: 'cm', alas: { n: 4, s: 120 }, limas: { t: 80 } },
        },
        nilai: 1152000,
        correct: 'keliru',
        explanation: 'Corong berbentuk limas: V = ⅓ × 14.400 × 80 = 384.000 cm³.',
      },
      {
        id: 'e2',
        teks: 'Volume tandon B = 14.400 × 100 + ⅓ × 14.400 × 80 = 1.824.000 cm³.',
        cek: { jenis: 'volume', bangun: TANDON_B },
        nilai: 1824000,
        correct: 'benar',
        explanation: 'Volume gabungan = V balok + V corong = 1.440.000 + 384.000.',
      },
      {
        id: 'e3',
        teks: '1.824.000 cm³ = 18.240 liter.',
        cek: { jenis: 'konversiVolume', nilai: 1824000, dari: 'cm3', ke: 'l' },
        nilai: 18240,
        correct: 'keliru',
        explanation: '1 liter = 1.000 cm³, jadi 1.824.000 : 1.000 = 1.824 liter.',
      },
      {
        id: 'e4',
        teks: 'tₛ corong = √(80² + 60²) = √10.000 = 100 cm.',
        cek: { jenis: 'ts', t: 80, a: 60 },
        nilai: 100,
        correct: 'benar',
        explanation: '6.400 + 3.600 = 10.000 dan √10.000 = 100.',
      },
      {
        id: 'e5',
        teks: 'Pelat tandon B = LP balok + LP limas = 76.800 + 38.400 = 115.200 cm².',
        cek: { jenis: 'luas', bangun: TANDON_B },
        nilai: 115200,
        correct: 'keliru',
        explanation:
          'Bidang sambung ikut terhitung dua kali. Pelat hanya sisi luar: 14.400 + 48.000 + 24.000 = 86.400 cm².',
      },
      {
        id: 'e6',
        teks: 'Satu sisi corong = ½ × 120 × 80 = 4.800 cm², jadi pelat B = 14.400 + 48.000 + 4 × 4.800 = 81.600 cm².',
        cek: { jenis: 'luas', bangun: TANDON_B },
        nilai: 81600,
        correct: 'keliru',
        explanation:
          'Sisi corong memakai tₛ = 100 cm, bukan tinggi corong 80 cm: ½ × 120 × 100 = 6.000 cm².',
      },
      {
        id: 'e7',
        teks: 'Pelat: 86.400 : 18.000 = 4,8, jadi dibeli 5 lembar.',
        cek: { jenis: 'wadah', luasSatu: 86400, banyak: 1, isiWadah: 18000 },
        nilai: 5,
        correct: 'benar',
        explanation: 'Bahan yang dibeli dibulatkan ke atas agar tandon tertutup semua.',
      },
      {
        id: 'e8',
        teks: 'Air: 1.824 : 250 = 7,296, jadi cukup 8 hari.',
        cek: { jenis: 'muat', volume: 1824, isiSatu: 250 },
        nilai: 8,
        correct: 'keliru',
        explanation: 'Hari ke-8 airnya tinggal 74 liter, tidak cukup. Hari yang terpenuhi: 7 hari.',
      },
    ],
    tanya: [
      {
        id: 'v1',
        tanya: 'Pelajaran terpenting dari lembar kerja Kelompok Kenari adalah …',
        opsi: [
          {
            id: 'bagian',
            label:
              'Hitung bangun gabungan bagian demi bagian, abaikan bidang sambung, pakai tₛ, dan bulatkan sesuai konteks',
          },
          { id: 'jumlah', label: 'LP gabungan cukup dengan menjumlahkan LP prisma dan LP limas' },
          { id: 'tinggi', label: 'Sisi limas cukup dihitung dengan tinggi limas' },
          { id: 'atas', label: 'Semua hasil bagi selalu dibulatkan ke atas' },
        ],
        correct: 'bagian',
        umpan: {
          bagian:
            'Tepat! Kekeliruan Kelompok Kenari berasal dari faktor ⅓, satuan, bidang sambung, tₛ, dan arah pembulatan.',
          jumlah:
            'Menjumlahkan LP utuh membuat pelat tampak 115.200 cm², padahal 86.400 cm². Coba pilih yang lain.',
          tinggi:
            'Memakai tinggi corong membuat pelat tampak 81.600 cm², padahal sisi corong memakai tₛ. Coba pilih yang lain.',
          atas: 'Hari yang terpenuhi justru dibulatkan ke bawah (7 hari). Coba pilih yang lain.',
        },
      },
    ],
    dugaanJudul: 'Bandingkan dengan dugaan awal kelompokmu',
    tanggapanDugaan: {
      d1: {
        b: 'Kalian menduga tandon B lebih banyak karena lebih tinggi. Ternyata B hanya 8,64 m², lebih sedikit daripada C (9,6 m²).',
        c: 'Dugaan kalian tepat! Walau lebih pendek, tandon C memakai 9,6 m² pelat, lebih banyak daripada B (8,64 m²).',
        sama: 'Kalian menduga sama. Ternyata berbeda: B 8,64 m², C 9,6 m², karena bentuk bagian bawahnya berbeda.',
        dua: 'Kalian menduga hampir dua kali. Ternyata tandon B justru lebih sedikit: 8,64 m² dibanding 9,6 m².',
      },
      d2: {
        sama: 'Kalian menduga sama dengan balok 80 cm (1.152 liter). Ternyata corong limas hanya ⅓-nya: 384 liter.',
        setengah:
          'Kalian menduga setengah (576 liter). Ternyata isi limas ⅓ isi prisma beralas & bertinggi sama: 384 liter.',
        sepertiga:
          'Dugaan kalian tepat! Corong menambah ⅓ × 14.400 × 80 = 384.000 cm³ = 384 liter.',
        tidak:
          'Kalian menduga tidak menambah. Ternyata corong menambah 384 liter, cukup untuk lebih dari satu hari.',
      },
    },
    refleksiLabel:
      'Tulis evaluasi proses kelompokmu: langkah mana yang paling sulit, dan apa yang akan kalian lakukan berbeda lain kali?',
    refleksiPlaceholder: 'Langkah yang paling sulit adalah … Lain kali kami akan …',
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     cek.jenis mengikuti kandidatMasalahGabungan (engine seksi 60).
     Soal pilihan ganda: options = subset opsiMasalahGabungan(cek,
     satuanOpsi, { awalan }) — diacak app.js.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: PBL + ' · Penerapan',
    goal: 'Menyelesaikan masalah kontekstual gabungan lain yang berkaitan dengan luas permukaan dan volume prisma dan limas.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang banyak salah (faktor ⅓, bidang sambung, tₛ, satuan, pembulatan) untuk dibahas bersama.',
    instruksi:
      'Kerjakan setiap soal. Pisahkan bangun menjadi bagian prisma dan limas, tentukan apakah yang ditanya isi (volume) atau bahan (luas), lalu perhatikan satuan dan pembulatan. Bila ragu, buka petunjuk.',
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: '🗼 Tugu Adiwiyata',
        cerita:
          'Tugu taman berbentuk balok beralas persegi 40 cm × 40 cm setinggi 100 cm, dengan puncak limas setinggi 15 cm. Seluruh tugu dicat, kecuali alas yang menempel di tanah.',
        pertanyaan: 'Berapa cm² luas bagian tugu yang dicat?',
        cek: {
          jenis: 'luas',
          bangun: {
            satuan: 'cm',
            alas: { n: 4, s: 40 },
            prisma: { t: 100 },
            limas: { t: 15, posisi: 'atas' },
          },
          pakai: ['p0', 'p1', 'p2', 'p3', 'l0', 'l1', 'l2', 'l3'],
        },
        jawab: 18000,
        satuan: 'cm²',
        hints: [
          'Dinding balok: 4 × 40 × 100. Tutup balok tertutup puncak limas, alasnya menempel tanah.',
          'Puncak limas: a = 20 cm, tₛ = √(15² + 20²) = 25 cm; luas = ½ × 160 × 25.',
        ],
        explanation: 'Dinding 16.000 cm² + puncak ½ × 160 × 25 = 2.000 cm², jadi 18.000 cm².',
      },
      {
        id: 't2',
        type: 'choice',
        konteks: '🏠 Rumah boneka',
        cerita:
          'Rumah boneka terdiri atas balok beralas 30 cm × 20 cm setinggi 25 cm dan atap limas setinggi 12 cm.',
        pertanyaan: 'Berapa volume rumah boneka itu?',
        cek: {
          jenis: 'volume',
          bangun: {
            satuan: 'cm',
            alas: { p: 30, l: 20 },
            prisma: { t: 25 },
            limas: { t: 12, posisi: 'atas' },
          },
        },
        satuanOpsi: 'cm³',
        options: [
          { id: 'benar', label: '17.400 cm³' },
          { id: 'lupa-sepertiga', label: '22.200 cm³' },
          { id: 'lupa-limas', label: '15.000 cm³' },
          { id: 'setengah', label: '18.600 cm³' },
        ],
        correct: 'benar',
        hints: [
          'Luas alas = 30 × 20 = 600 cm². V balok = 600 × 25.',
          'V atap limas = ⅓ × 600 × 12. Jumlahkan kedua bagian.',
        ],
        explanation: 'V = 15.000 + 2.400 = 17.400 cm³.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: '🐟 Wadah pakan ikan',
        cerita:
          'Wadah pakan ikan berbentuk balok beralas persegi 40 cm × 40 cm setinggi 50 cm, dengan corong limas terbalik setinggi 30 cm di bawahnya.',
        pertanyaan: 'Berapa liter isi wadah itu bila penuh?',
        cek: {
          jenis: 'volume',
          bangun: {
            satuan: 'cm',
            alas: { n: 4, s: 40 },
            prisma: { t: 50 },
            limas: { t: 30, posisi: 'bawah' },
          },
          dari: 'cm3',
          ke: 'l',
        },
        jawab: 96,
        satuan: 'liter',
        hints: [
          'V balok = 1.600 × 50 = 80.000 cm³; V corong = ⅓ × 1.600 × 30 = 16.000 cm³.',
          '1 liter = 1.000 cm³.',
        ],
        explanation: 'V = 80.000 + 16.000 = 96.000 cm³ = 96 liter.',
      },
      {
        id: 't4',
        type: 'choice',
        konteks: '🌱 Atap rumah kompos',
        cerita:
          'Rumah kompos sekolah beratap limas persegi dengan rusuk alas 160 cm dan tinggi atap 60 cm.',
        pertanyaan: 'Berapa tinggi segitiga sisi atap (tₛ)?',
        cek: { jenis: 'ts', t: 60, a: 80, sumber: { s: 160, t: 60 } },
        satuanOpsi: 'cm',
        options: [
          { id: 'benar', label: '100 cm' },
          { id: 'jumlah-sisi', label: '140 cm' },
          { id: 'lupa-akar', label: '10.000 cm' },
          { id: 'pakai-rusuk', label: '170,88 cm' },
        ],
        correct: 'benar',
        hints: [
          'Kaki segitiga siku-siku: t = 60 cm dan a = setengah rusuk alas = 80 cm.',
          'tₛ = √(t² + a²).',
        ],
        explanation: 'tₛ = √(60² + 80²) = √10.000 = 100 cm.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: '⏱️ Mengisi tandon',
        cerita:
          'Tandon berbentuk balok 100 cm × 100 cm × 100 cm dengan corong limas terbalik setinggi 60 cm di bawahnya. Tandon diisi pompa berdebit 15 liter per menit.',
        pertanyaan: 'Berapa menit tandon itu penuh bila mula-mula kosong?',
        cek: {
          jenis: 'waktu',
          volume: 1200,
          debit: 15,
          volumeAsal: 1200000,
          sumber: {
            bangun: {
              satuan: 'cm',
              alas: { n: 4, s: 100 },
              prisma: { t: 100 },
              limas: { t: 60, posisi: 'bawah' },
            },
          },
        },
        jawab: 80,
        satuan: 'menit',
        hints: [
          'V = 1.000.000 + ⅓ × 10.000 × 60 = 1.200.000 cm³ = 1.200 liter.',
          'Waktu = volume : debit.',
        ],
        explanation: '1.200 liter : 15 liter per menit = 80 menit.',
      },
      {
        id: 't6',
        type: 'input',
        konteks: '🐦 Rumah burung',
        cerita:
          'Rumah burung berbentuk balok beralas persegi 20 cm × 20 cm setinggi 25 cm dengan atap limas bertinggi sisi tegak 15 cm. Bagian luar dicat, kecuali alasnya. Satu kaleng cat kecil cukup untuk 1.500 cm² dan harganya Rp18.000.',
        pertanyaan: 'Berapa rupiah biaya cat paling sedikit?',
        cek: {
          jenis: 'biayaWadah',
          luas: 2600,
          isiWadah: 1500,
          harga: 18000,
          sumber: {
            bangun: {
              satuan: 'cm',
              alas: { n: 4, s: 20 },
              prisma: { t: 25 },
              limas: { ts: 15, posisi: 'atas' },
            },
            pakai: ['p0', 'p1', 'p2', 'p3', 'l0', 'l1', 'l2', 'l3'],
          },
        },
        jawab: 36000,
        satuan: 'rupiah',
        hints: [
          'Luas dicat = 4 × 20 × 25 + ½ × 80 × 15 = 2.600 cm².',
          '2.600 : 1.500 ≈ 1,73 → cat dibeli per kaleng, bulatkan ke atas, lalu kalikan harganya.',
        ],
        explanation: '2.600 cm² : 1.500 ≈ 1,73 → 2 kaleng; 2 × Rp18.000 = Rp36.000.',
      },
      {
        id: 't7',
        type: 'choice',
        konteks: '🎁 Kotak hadiah',
        cerita:
          'Kotak hadiah berbentuk balok 10 cm × 10 cm × 12 cm dengan tutup limas yang tinggi sisi tegaknya 13 cm. Seluruh permukaan luar kotak dilapisi kertas kado.',
        pertanyaan: 'Berapa cm² kertas kado yang dibutuhkan?',
        cek: {
          jenis: 'luas',
          bangun: {
            satuan: 'cm',
            alas: { n: 4, s: 10 },
            prisma: { t: 12 },
            limas: { ts: 13, posisi: 'atas' },
          },
        },
        satuanOpsi: 'cm²',
        options: [
          { id: 'benar', label: '840 cm²' },
          { id: 'sambung', label: '1.040 cm²' },
          { id: 'tinggi-limas', label: '820 cm²' },
          { id: 'lupa-setengah', label: '1.100 cm²' },
        ],
        correct: 'benar',
        hints: [
          'Sisi luar: alas balok, 4 dinding balok, 4 segitiga tutup. Tutup balok tertutup limas.',
          'Alas 100 + dinding 4 × 10 × 12 + tutup ½ × 40 × 13.',
        ],
        explanation: 'Kertas = 100 + 480 + 260 = 840 cm².',
      },
      {
        id: 't8',
        type: 'choice',
        konteks: '💧 Tandon kebun sayur',
        cerita:
          'Tandon kebun sayur berbentuk balok 100 cm × 100 cm × 150 cm dengan corong limas terbalik setinggi 90 cm, berisi penuh. Kebun sayur memakai 400 liter air per hari.',
        pertanyaan: 'Air tandon penuh cukup untuk berapa hari?',
        cek: {
          jenis: 'muat',
          volume: 1800,
          isiSatu: 400,
          sumber: {
            bangun: {
              satuan: 'cm',
              alas: { n: 4, s: 100 },
              prisma: { t: 150 },
              limas: { t: 90, posisi: 'bawah' },
            },
          },
        },
        satuanOpsi: 'hari',
        options: [
          { id: 'benar', label: '4 hari' },
          { id: 'muat-atas', label: '5 hari' },
          { id: 'belum-bulat', label: '4,5 hari' },
          { id: 'dua-kali', label: '8 hari' },
        ],
        correct: 'benar',
        hints: [
          'V = 1.500.000 + ⅓ × 10.000 × 90 = 1.800.000 cm³ = 1.800 liter.',
          '1.800 : 400 = 4,5 → hari yang terpenuhi dibulatkan ke bawah.',
        ],
        explanation: '1.800 : 400 = 4,5; hari ke-5 airnya tidak cukup, jadi cukup 4 hari.',
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
    goal: 'Merefleksikan proses menyelesaikan masalah kontekstual gabungan prisma dan limas.',
    guru: 'Baca beberapa refleksi murid (dengan izin) untuk menutup pelajaran. Tanyakan: “Kapan sebuah masalah membutuhkan volume, kapan luas permukaan, dan kapan keduanya?”',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Bagaimana cara menghitung volume dan luas permukaan bangun gabungan prisma dan limas? Apa bedanya?',
        placeholder: 'Volume dihitung dengan … sedangkan luas permukaan …',
      },
      {
        id: 'q2',
        teks: 'Mengapa bidang sambung tidak dihitung pada luas permukaan, tetapi tidak mengganggu perhitungan volume?',
        placeholder: 'Bidang sambung …',
      },
      {
        id: 'q3',
        teks: 'Benda gabungan prisma dan limas apa di rumah atau sekolahmu yang bisa kamu hitung isinya dan bahannya sekarang?',
        placeholder: 'Misalnya …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu menyelesaikan masalah gabungan luas permukaan dan volume prisma & limas sekarang?',
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
    judul: 'Tandon siap menampung hujan!',
    teks: 'Proposal kelompokmu menjawab kebutuhan Tim Adiwiyata dengan hitungan volume dan luas permukaan bangun gabungan yang tepat, bahan yang cukup, dan dana yang terjaga.',
    capaian: [
      'Menghitung volume bangun gabungan prisma & limas bagian demi bagian, lalu mengubahnya ke liter.',
      'Menentukan sisi luar bangun gabungan yang memakai bahan, tanpa bidang sambung, dengan tₛ dari teorema Pythagoras.',
      'Membulatkan banyak bahan ke atas dan banyak hari yang terpenuhi ke bawah sesuai konteks.',
      'Menghitung biaya, membandingkannya dengan dana, lalu menyajikan keputusan dalam proposal.',
    ],
  },
};
