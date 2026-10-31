'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Unsur & Jaring-jaring Tabung, Kerucut, dan Bola
   Fase D — SMP Kelas IX · Topik 23 Tabung, Kerucut, dan Bola

   Tujuan Pembelajaran:
   Mengidentifikasi unsur-unsur dan jaring-jaring tabung, kerucut, dan
   bola pada benda di sekitar serta mengaitkannya dengan konsep luas
   permukaan dan volume.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ............ 'stimulasi'
     Sintaks 2 — Problem statement ...... 'masalah'
     Sintaks 3 — Data collection ........ 'amati', 'bentang', 'bola'
     Sintaks 4 — Data processing ........ 'olahLuas', 'tuang'
     Sintaks 5 — Verification ........... 'verifikasi'
     Sintaks 6 — Generalization ......... 'generalisasi'
     Penerapan & penutup ................ 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 3 × 40 menit, murid berpasangan):
     1. Stimulasi    (8')  — Pojok Kemasan Koperasi Sekolah: delapan benda
                             (kaleng susu, pipa paralon, cone es krim,
                             topi ulang tahun, tumpeng, bola voli, kelereng,
                             jeruk). Murid MENDUGA bentuk label kaleng dan
                             topi bila dibuka (tidak dinilai).
     2. Masalah      (5')  — memilih rumusan masalah & menulis hipotesis.
     3. Lab Unsur    (15') — memiringkan model tabung, kerucut, bola;
                             mengetuk sisi, jari-jari, diameter, tinggi,
                             garis pelukis, titik puncak, pusat; mengisi
                             tabel unsur berdiagnosa; menamai unsur.
     4. Lab Bentang  (15') — membuka selimut tabung (→ persegi panjang) dan
                             kerucut (→ juring); menghitung keliling alas,
                             garis pelukis, busur, dan sudut juring.
     5. Lab Jeruk    (10') — menempel kepingan kulit jeruk pada lingkaran
                             jiplakan → tepat 4 lingkaran; bola tidak punya
                             jaring-jaring.
     6. Olah Luas    (15') — luas tiap bagian jaring-jaring → rumus luas
                             permukaan; memilah 7 rancangan jaring-jaring;
                             menghitung luas tiga benda.
     7. Lab Tuang    (12') — kerucut 3× tuang = tabung; bola = ⅔ tabung;
                             mengaitkan volume tabung dengan prisma; dua
                             hitungan volume.
     8. Pembuktian   (15') — menguji temuan pada benda baru, prediksi lalu
                             uji dua rancangan jaring-jaring, menanggapi
                             miskonsepsi teman.
     9. Simpulan     (5')  — menyusun kesimpulan dari bank kalimat acak.
    10. Uji terap    (15') — 10 soal diambil acak dari bank 17 soal (isian
                             berdiagnosa & pilihan ganda berpengecoh).
    11. Refleksi     (5')  — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan. Teks DATA berupa
   teks biasa (di-escape app.js). Kunci hitungan ditulis sebagai objek
   `cek` (shared/engine.js seksi 89) dan diuji di
   tests/mpi-23.1-data.test.js.
   ============================================================ */

var OPSI_LIPAT_TKB = [
  { id: 'bisa', label: 'Dapat dibentuk menjadi bangun ruang' },
  { id: 'tidak', label: 'Tidak dapat dibentuk menjadi bangun ruang' },
];

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1 (Stimulation)',
    goal: 'Mengamati benda-benda berbentuk tabung, kerucut, dan bola di sekitar lalu menduga bentuk bentangannya.',
    tp: 'Mengidentifikasi unsur-unsur dan jaring-jaring tabung, kerucut, dan bola pada benda di sekitar serta mengaitkannya dengan konsep luas permukaan dan volume.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menunjukkan sisi, rusuk, titik puncak, jari-jari, diameter, tinggi, dan garis pelukis pada tabung, kerucut, dan bola.',
      'Mendeskripsikan jaring-jaring tabung dan kerucut beserta ukurannya, serta menjelaskan mengapa bola tidak memiliki jaring-jaring.',
      'Mengaitkan luas bagian-bagian jaring-jaring dengan luas permukaan.',
      'Mengaitkan volume kerucut dan bola dengan volume tabung.',
    ],
    guru: 'Bawa benda nyata bila ada (kaleng susu berlabel, topi ulang tahun, bola, jeruk). Biarkan murid menduga tanpa dikoreksi; dugaan akan diuji pada tahap Bentang dan disimpulkan pada tahap Simpulan.',
    judul: 'Pojok Kemasan Koperasi Sekolah',
    cerita:
      'Koperasi sekolah akan menghias stan untuk Pekan Kreativitas. Pak Bima mengumpulkan benda-benda di bawah ini. Ia ingin membuat label kaleng, topi kertas, dan wadah baru sendiri, tetapi bingung harus memotong kertas dengan bentuk apa.',
    benda: [
      { id: 'kaleng', nama: '🥫 Kaleng susu', jenis: 'tabung', rasio: 2.6 },
      { id: 'pipa', nama: '🪈 Pipa paralon', jenis: 'tabung', rasio: 5 },
      { id: 'cone', nama: '🍦 Cone es krim', jenis: 'kerucut', rasio: 3.2 },
      { id: 'topi', nama: '🥳 Topi ulang tahun', jenis: 'kerucut', rasio: 3.6 },
      { id: 'tumpeng', nama: '🍚 Tumpeng', jenis: 'kerucut', rasio: 1.6 },
      { id: 'voli', nama: '🏐 Bola voli', jenis: 'bola' },
      { id: 'kelereng', nama: '🔵 Kelereng', jenis: 'bola' },
      { id: 'jeruk', nama: '🍊 Jeruk', jenis: 'bola' },
    ],
    dugaan: [
      {
        id: 'dTabung',
        tanya:
          'Jika label kertas kaleng susu digunting lurus dari atas ke bawah lalu dibuka, menurutmu bentuknya …',
        opsi: [
          { id: 'persegiPanjang', label: 'persegi panjang' },
          { id: 'lingkaran', label: 'lingkaran' },
          { id: 'segitiga', label: 'segitiga' },
          { id: 'trapesium', label: 'trapesium' },
        ],
      },
      {
        id: 'dKerucut',
        tanya:
          'Jika topi ulang tahun digunting dari tepi bawah ke puncak lalu dibuka, menurutmu bentuknya …',
        opsi: [
          { id: 'juring', label: 'bagian lingkaran seperti potongan kue (juring)' },
          { id: 'segitiga', label: 'segitiga' },
          { id: 'persegiPanjang', label: 'persegi panjang' },
          { id: 'lingkaran', label: 'lingkaran penuh' },
        ],
      },
    ],
    alasanLabel: 'Tuliskan alasan dugaanmu.',
    alasanPlaceholder: 'Aku menduga begitu karena …',
    catatan:
      'Belum ada jawaban benar atau salah. Simpan dugaanmu, nanti kamu akan membuktikannya sendiri.',
    nextLabel: 'Lanjut ke Rumusan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: 'Discovery Learning · Sintaks 2 (Problem Statement)',
    goal: 'Merumuskan pertanyaan yang akan diselidiki dan menulis hipotesis.',
    guru: 'Arahkan murid bahwa sebelum memotong kertas, Pak Bima perlu tahu bagian-bagian benda dan bentuk bentangannya. Terima hipotesis apa pun selama bisa diuji.',
    pengantar:
      'Agar tidak salah potong, Pak Bima perlu mengenal bagian-bagian (unsur) setiap benda dan bentuk bentangan kertasnya, yang disebut jaring-jaring. Dari jaring-jaring itu ia juga ingin tahu berapa luas kertas yang diperlukan dan berapa banyak isi yang dapat ditampung wadahnya.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'unsur',
        label:
          'Apa saja unsur tabung, kerucut, dan bola, seperti apa jaring-jaringnya, dan bagaimana kaitannya dengan luas permukaan serta volume?',
      },
      { id: 'harga', label: 'Berapa harga satu kaleng susu di koperasi?' },
      { id: 'warna', label: 'Warna label apa yang paling disukai pembeli?' },
      { id: 'berat', label: 'Benda mana yang paling berat di antara kedelapan benda itu?' },
    ],
    correct: 'unsur',
    umpan: {
      unsur:
        'Tepat! Pertanyaan ini dapat diselidiki dengan mengamati model, membuka selimutnya, dan menuang isinya.',
      harga:
        'Harga tidak menjelaskan bentuk benda. Pilih pertanyaan tentang bagian dan bentangannya.',
      warna: 'Warna tidak mengubah bentuk label. Pilih pertanyaan tentang bagian dan bentangannya.',
      berat:
        'Berat bergantung pada bahan, bukan bentuk. Pilih pertanyaan tentang unsur dan jaring-jaring.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu, apa hubungan bentuk bentangan kertas dengan ukuran alas bendanya?',
    hipotesisPlaceholder: 'Menurutku, panjang kertas label kaleng sama dengan …',
    nextLabel: 'Mulai Mengamati →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MENGAMATI UNSUR (Lab Unsur)
     ---------------------------------------------------------- */
  amati: {
    kicker: 'Tahap 3 · Mengumpulkan Data',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Menemukan unsur-unsur tabung, kerucut, dan bola dengan mengamati model.',
    guru: 'Minta pasangan bergantian: satu murid mengetuk, satu murid menunjukkan bagian yang sama pada benda nyata. Tekankan bahwa garis tepi gambar dan garis melingkar pada bola hanyalah garis bantu.',
    instruksi:
      'Pilih bangun, miringkan modelnya, lalu ketuk setiap sisi, garis, dan titik sampai semua bagian ditemukan pada ketiga bangun.',
    instruksiTabel:
      'Hitung unsur setiap bangun dari pengamatanmu, lalu isi tabel. Ingat: rusuk adalah pertemuan dua sisi (boleh melengkung).',
    tabelCaption: 'Tabel unsur tabung, kerucut, dan bola',
    tabelRows: ['tabung', 'kerucut', 'bola'],
    tanyaInstruksi: 'Jawab pertanyaan berikut berdasarkan pengamatanmu.',
    tanya: [
      {
        id: 'aPelukis',
        tanya: 'Ruas garis pada selimut kerucut dari titik puncak ke tepi alas disebut …',
        opsi: [
          { id: 'pelukis', label: 'garis pelukis' },
          { id: 'tinggi', label: 'tinggi' },
          { id: 'jari', label: 'jari-jari' },
          { id: 'rusuk', label: 'rusuk' },
        ],
        correct: 'pelukis',
        umpan: {
          pelukis: 'Tepat! Garis pelukis (s) terletak pada selimut, dari puncak ke tepi alas.',
          tinggi: 'Tinggi berada DI DALAM kerucut, tegak lurus dari puncak ke pusat alas.',
          jari: 'Jari-jari terletak pada alas, dari pusat ke tepi lingkaran.',
          rusuk:
            'Rusuk adalah pertemuan dua sisi. Garis ini berada di tengah satu sisi saja (selimut).',
        },
      },
      {
        id: 'aTinggi',
        tanya: 'Pada tabung, jarak antara pusat alas dan pusat tutup disebut …',
        opsi: [
          { id: 'tinggi', label: 'tinggi' },
          { id: 'pelukis', label: 'garis pelukis' },
          { id: 'diameter', label: 'diameter' },
          { id: 'keliling', label: 'keliling' },
        ],
        correct: 'tinggi',
        umpan: {
          tinggi: 'Tepat! Tinggi tabung (t) menghubungkan pusat alas dan pusat tutup.',
          pelukis: 'Garis pelukis adalah unsur kerucut, bukan tabung.',
          diameter: 'Diameter terletak pada lingkaran alas atau tutup, melalui pusatnya.',
          keliling: 'Keliling adalah panjang tepi lingkaran, bukan jarak alas ke tutup.',
        },
      },
      {
        id: 'aPuncak',
        tanya: 'Kerucut tidak memiliki titik sudut, tetapi memiliki titik puncak. Mengapa?',
        opsi: [
          {
            id: 'rusuk',
            label: 'Di puncak tidak ada rusuk yang bertemu; puncak hanyalah ujung selimut',
          },
          { id: 'tumpul', label: 'Karena puncaknya tumpul' },
          { id: 'dua', label: 'Karena kerucut punya dua rusuk' },
          { id: 'pusat', label: 'Karena titik puncak sama dengan pusat alas' },
        ],
        correct: 'rusuk',
        umpan: {
          rusuk:
            'Tepat! Titik sudut adalah pertemuan tiga rusuk atau lebih. Di puncak kerucut tidak ada rusuk yang bertemu.',
          tumpul: 'Puncak kerucut runcing. Coba pikirkan: adakah rusuk yang bertemu di puncak?',
          dua: 'Kerucut hanya punya satu rusuk, yaitu lengkungan tepi alas.',
          pusat: 'Pusat alas ada di bawah, sedangkan titik puncak di atas.',
        },
      },
      {
        id: 'aSiku',
        tanya: 'Jari-jari (r), tinggi (t), dan garis pelukis (s) kerucut membentuk …',
        opsi: [
          { id: 'siku', label: 'segitiga siku-siku dengan s sebagai sisi miring' },
          { id: 'sama', label: 'segitiga sama sisi' },
          { id: 'persegi', label: 'persegi panjang' },
          { id: 'lingkaran', label: 'lingkaran' },
        ],
        correct: 'siku',
        umpan: {
          siku: 'Tepat! Karena itu s dapat dihitung dengan teorema Pythagoras: s = √(r² + t²).',
          sama: 'Panjang r, t, dan s umumnya berbeda. Perhatikan sudut di pusat alas.',
          persegi: 'Hanya ada tiga ruas garis, jadi bentuknya segitiga. Sudut apa di pusat alas?',
          lingkaran: 'Tiga ruas garis lurus membentuk segitiga, bukan lingkaran.',
        },
      },
    ],
    temuan:
      'Tabung: 2 sisi datar (alas & tutup) + 1 selimut, 2 rusuk lengkung. Kerucut: 1 alas + 1 selimut, 1 rusuk, 1 titik puncak. Bola: hanya 1 sisi lengkung. Ukuran pentingnya: jari-jari r, diameter d = 2r, tinggi t, dan garis pelukis s = √(r² + t²).',
    nextLabel: 'Lanjut: Buka Selimutnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MEMBUKA SELIMUT (Lab Bentang)
     ---------------------------------------------------------- */
  bentang: {
    kicker: 'Tahap 4 · Mengumpulkan Data',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Menemukan bentuk dan ukuran jaring-jaring tabung dan kerucut dengan membuka selimutnya.',
    guru: 'Bila ada, gunting label kaleng dan topi kertas bersama murid. Tanyakan: bagian mana dari persegi panjang yang dulu melilit tepi alas?',
    instruksi:
      'Pilih benda, lalu geser penggeser sampai 100% untuk membuka selimutnya. Lakukan pada tabung dan kerucut.',
    lab: { tabung: { r: 7, t: 12 }, kerucut: { r: 6, t: 8 } },
    tanya: [
      {
        id: 'bTabung',
        tanya: 'Selimut tabung yang dibuka berbentuk …',
        opsi: [
          { id: 'pp', label: 'persegi panjang' },
          { id: 'lingkaran', label: 'lingkaran' },
          { id: 'segitiga', label: 'segitiga' },
          { id: 'trapesium', label: 'trapesium' },
        ],
        correct: 'pp',
        umpan: {
          pp: 'Tepat! Jaring-jaring tabung = 2 lingkaran + 1 persegi panjang.',
          lingkaran: 'Lingkaran adalah alas dan tutup. Perhatikan bentuk selimutnya.',
          segitiga: 'Lihat lagi: keempat sudut bentangan selimut tabung siku-siku.',
          trapesium: 'Sisi atas dan bawah bentangan sama panjang, jadi bukan trapesium.',
        },
      },
      {
        id: 'bPanjang',
        tanya: 'Panjang persegi panjang itu sama dengan …',
        opsi: [
          { id: 'keliling', label: 'keliling lingkaran alas, 2πr' },
          { id: 'diameter', label: 'diameter alas, 2r' },
          { id: 'tinggi', label: 'tinggi tabung' },
          { id: 'luas', label: 'luas alas, πr²' },
        ],
        correct: 'keliling',
        umpan: {
          keliling: 'Tepat! Panjang itu dulu melilit tepi alas tepat satu putaran.',
          diameter:
            'Diameter hanya lebar tampak depan. Saat dibuka, panjangnya bertambah sampai mengelilingi alas.',
          tinggi: 'Tinggi tabung menjadi LEBAR persegi panjang, bukan panjangnya.',
          luas: 'Panjang adalah ukuran garis (cm), sedangkan luas berukuran cm².',
        },
      },
      {
        id: 'bKerucut',
        tanya: 'Selimut kerucut yang dibuka berbentuk …',
        opsi: [
          { id: 'juring', label: 'juring lingkaran' },
          { id: 'segitiga', label: 'segitiga' },
          { id: 'pp', label: 'persegi panjang' },
          { id: 'penuh', label: 'lingkaran penuh' },
        ],
        correct: 'juring',
        umpan: {
          juring: 'Tepat! Jaring-jaring kerucut = 1 lingkaran + 1 juring lingkaran.',
          segitiga: 'Tepi bawahnya melengkung (busur), jadi bukan segitiga.',
          pp: 'Bentangan selimut kerucut punya satu titik di pusat, jadi bukan persegi panjang.',
          penuh:
            'Bentangannya hanya sebagian lingkaran. Lingkaran penuh akan bertumpuk saat digulung.',
        },
      },
      {
        id: 'bJari',
        tanya: 'Jari-jari juring itu sama dengan … kerucut, dan panjang busurnya sama dengan …',
        opsi: [
          { id: 'pelukis', label: 'garis pelukis; keliling alas' },
          { id: 'tinggi', label: 'tinggi; keliling alas' },
          { id: 'jari', label: 'jari-jari alas; diameter alas' },
          { id: 'pelukisLuas', label: 'garis pelukis; luas alas' },
        ],
        correct: 'pelukis',
        umpan: {
          pelukis:
            'Tepat! Jari-jari juring = s, dan busurnya dulu melilit tepi alas sehingga panjangnya 2πr.',
          tinggi: 'Tinggi kerucut berada di dalam; tepi juring adalah garis pelukis pada selimut.',
          jari: 'Jari-jari alas jauh lebih pendek dari tepi juring. Perhatikan garis dari puncak ke tepi.',
          pelukisLuas:
            'Busur adalah panjang (cm), jadi ia sama dengan keliling alas, bukan luasnya.',
        },
      },
    ],
    langkahInstruksi:
      'Sekarang hitung ukuran jaring-jaring label kaleng (r = 7 cm, t = 12 cm) dan topi (r = 6 cm, t = 8 cm).',
    langkah: [
      {
        id: 'lKel',
        label: 'Kaleng: panjang persegi panjang = keliling alas = 2 × 22/7 × 7 = … cm',
        cek: { minta: 'kelilingAlas', jenis: 'tabung', r: 7, pi: '22/7' },
        hints: ['Keliling lingkaran = 2 × π × r.', '2 × 22/7 × 7 = 2 × 22 = …'],
      },
      {
        id: 'lPelukis',
        label: 'Topi: garis pelukis s = √(6² + 8²) = … cm',
        cek: { minta: 'garisPelukis', jenis: 'kerucut', r: 6, t: 8 },
        hints: ['s² = r² + t² = 36 + 64.', '√100 = …'],
      },
      {
        id: 'lBusur',
        label: 'Topi: panjang busur juring = keliling alas = 2 × 3,14 × 6 = … cm',
        cek: { minta: 'kelilingAlas', jenis: 'kerucut', r: 6, pi: '3,14' },
        hints: ['Busur juring sama dengan keliling alas, 2πr.', '2 × 3,14 × 6 = 6,28 × 6 = …'],
      },
      {
        id: 'lSudut',
        label: 'Topi: sudut pusat juring = (r ÷ s) × 360° = (6 ÷ 10) × 360° = … °',
        cek: { minta: 'sudutJuring', jenis: 'kerucut', r: 6, t: 8 },
        hints: [
          'Busur juring : keliling lingkaran berjari-jari s = sudut juring : 360°.',
          '6 ÷ 10 = 0,6 dan 0,6 × 360 = …',
        ],
      },
    ],
    temuan:
      'Jaring-jaring tabung: 2 lingkaran kongruen dan 1 persegi panjang berukuran keliling alas (2πr) × tinggi (t). Jaring-jaring kerucut: 1 lingkaran dan 1 juring berjari-jari s dengan panjang busur 2πr dan sudut pusat (r ÷ s) × 360°.',
    nextLabel: 'Lanjut: Kupas Jeruk →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — KULIT BOLA (Lab Kulit Jeruk)
     ---------------------------------------------------------- */
  bola: {
    kicker: 'Tahap 5 · Mengumpulkan Data',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Menyelidiki apakah bola memiliki jaring-jaring dan berapa luas kulitnya.',
    guru: 'Bila memungkinkan, lakukan percobaan nyata: jiplak lingkaran terbesar jeruk beberapa kali di kertas, kupas jeruk menjadi kepingan kecil, lalu tempelkan kepingan pada lingkaran-lingkaran itu.',
    instruksi:
      'Bu Laras menjiplak lingkaran terbesar sebuah jeruk sebanyak enam kali. Kulit jeruk dikupas menjadi 16 kepingan kecil. Ketuk lingkaran untuk menempelkan kepingan sampai kulitnya habis. Isi penuh satu lingkaran dulu sebelum pindah.',
    lab: { kepingan: 16, perLingkaran: 4, slot: 6 },
    tanya: [
      {
        id: 'oEmpat',
        tanya: 'Kulit jeruk tepat menutupi berapa lingkaran berjari-jari r?',
        opsi: [
          { id: 'empat', label: '4 lingkaran' },
          { id: 'dua', label: '2 lingkaran' },
          { id: 'tiga', label: '3 lingkaran' },
          { id: 'enam', label: '6 lingkaran' },
        ],
        correct: 'empat',
        umpan: {
          empat: 'Tepat! Kulit jeruk menutupi tepat empat lingkaran besar.',
          dua: 'Hitung lagi lingkaran yang tertutup penuh di lab.',
          tiga: 'Hitung lagi lingkaran yang tertutup penuh di lab.',
          enam: 'Ada lingkaran yang masih kosong. Hitung yang tertutup penuh saja.',
        },
      },
      {
        id: 'oRumus',
        tanya: 'Jadi luas kulit (permukaan) bola sama dengan …',
        opsi: [
          { id: 'empat', label: '4 × luas lingkaran = 4πr²' },
          { id: 'dua', label: '2πr²' },
          { id: 'satu', label: 'πr²' },
          { id: 'volume', label: '4/3 πr³' },
        ],
        correct: 'empat',
        umpan: {
          empat: 'Tepat! L bola = 4πr².',
          dua: 'Itu baru dua lingkaran. Kulit jeruk menutupi lebih banyak.',
          satu: 'Itu luas satu lingkaran saja.',
          volume: 'r³ dipakai untuk volume (isi), bukan luas kulit.',
        },
      },
      {
        id: 'oJaring',
        tanya: 'Mengapa bola tidak memiliki jaring-jaring?',
        opsi: [
          { id: 'rata', label: 'Kulitnya tidak bisa dibentangkan rata tanpa sobek atau kusut' },
          { id: 'kecil', label: 'Karena bola terlalu kecil untuk digunting' },
          { id: 'rusuk', label: 'Karena bola punya terlalu banyak rusuk' },
          { id: 'empat', label: 'Karena jaring-jaring bola adalah empat lingkaran' },
        ],
        correct: 'rata',
        umpan: {
          rata: 'Tepat! Kepingan kulit jeruk selalu melengkung, sehingga bola tidak punya jaring-jaring.',
          kecil: 'Bola sebesar apa pun tetap tidak bisa dibentangkan rata.',
          rusuk: 'Bola tidak punya rusuk sama sekali.',
          empat:
            'Empat lingkaran hanya menunjukkan LUASNYA sama. Empat lingkaran datar tidak bisa dilipat menjadi bola.',
        },
      },
    ],
    temuan:
      'Kulit bola tidak dapat dibentangkan menjadi bangun datar, jadi bola tidak memiliki jaring-jaring. Namun luas kulitnya sama dengan luas 4 lingkaran berjari-jari r: L = 4πr².',
    nextLabel: 'Lanjut: Olah Data Luas →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGOLAH DATA: LUAS PERMUKAAN
     ---------------------------------------------------------- */
  olahLuas: {
    kicker: 'Tahap 6 · Mengolah Data',
    syntax: 'Discovery Learning · Sintaks 4 (Data Processing)',
    goal: 'Mengaitkan luas bagian-bagian jaring-jaring dengan luas permukaan tabung, kerucut, dan bola.',
    guru: 'Tekankan bahwa luas permukaan adalah jumlah luas semua bagian jaring-jaring, sehingga murid tidak perlu menghafal rumus. Untuk luas juring, ingatkan perbandingan busur dengan keliling lingkaran.',
    instruksiKonsep:
      'Gunakan jaring-jaring yang sudah kamu buka untuk menjawab pertanyaan berikut.',
    konsep: [
      {
        id: 'kSelimutTabung',
        tanya: 'Luas selimut tabung = luas persegi panjang = panjang × lebar = …',
        opsi: [
          { id: 'benar', label: '2πr × t' },
          { id: 'pr', label: 'πr × t' },
          { id: 'd', label: '2r × t' },
          { id: 'luas', label: 'πr² × t' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! Panjangnya keliling alas (2πr), lebarnya tinggi (t).',
          pr: 'Panjang persegi panjang sama dengan keliling alas, 2πr, bukan πr.',
          d: '2r adalah diameter. Panjang selimut terbuka sama dengan keliling alas.',
          luas: 'πr² × t adalah volume tabung, bukan luas selimut.',
        },
      },
      {
        id: 'kLuasTabung',
        tanya: 'Luas permukaan tabung tertutup = alas + tutup + selimut = …',
        opsi: [
          { id: 'benar', label: '2πr² + 2πrt' },
          { id: 'satu', label: 'πr² + 2πrt' },
          { id: 'selimut', label: '2πrt' },
          { id: 'acak', label: '2πr² + πrt' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! L tabung = 2πr² + 2πrt = 2πr(r + t).',
          satu: 'Tabung tertutup punya dua lingkaran: alas dan tutup.',
          selimut: 'Itu hanya luas selimut. Tambahkan luas alas dan tutup.',
          acak: 'Luas selimut adalah 2πrt, bukan πrt.',
        },
      },
      {
        id: 'kJuring',
        tanya:
          'Luas juring selimut kerucut = (busur ÷ keliling lingkaran berjari-jari s) × πs² = (2πr ÷ 2πs) × πs² = …',
        opsi: [
          { id: 'benar', label: 'πrs' },
          { id: 'r2', label: 'πr²' },
          { id: 's2', label: 'πs²' },
          { id: 'dua', label: '2πrs' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! (r ÷ s) × πs² = πrs.',
          r2: 'πr² adalah luas alas kerucut, bukan selimutnya.',
          s2: 'πs² adalah luas lingkaran PENUH berjari-jari s. Selimut hanya sebagian (r ÷ s) darinya.',
          dua: 'Sederhanakan lagi: 2πr ÷ 2πs = r ÷ s, lalu kalikan dengan πs².',
        },
      },
      {
        id: 'kLuasKerucut',
        tanya: 'Luas permukaan kerucut = alas + selimut = …',
        opsi: [
          { id: 'benar', label: 'πr² + πrs' },
          { id: 't', label: 'πr² + πrt' },
          { id: 'selimut', label: 'πrs' },
          { id: 'dua', label: '2πr² + πrs' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! L kerucut = πr² + πrs = πr(r + s).',
          t: 'Selimut kerucut memakai garis pelukis s, bukan tinggi t.',
          selimut: 'Itu luas selimut saja. Jangan lupa alasnya.',
          dua: 'Kerucut hanya punya satu lingkaran (alas).',
        },
      },
      {
        id: 'kLuasBola',
        tanya: 'Luas permukaan bola = …',
        opsi: [
          { id: 'benar', label: '4πr²' },
          { id: 'dua', label: '2πr²' },
          { id: 'satu', label: 'πr²' },
          { id: 'volume', label: '4/3 πr³' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! Sesuai percobaan kulit jeruk: empat lingkaran besar.',
          dua: 'Kulit jeruk menutupi empat lingkaran, bukan dua.',
          satu: 'Itu luas satu lingkaran besar saja.',
          volume: '4/3 πr³ adalah volume bola.',
        },
      },
    ],
    instruksiPilah:
      'Pak Bima membuat tujuh rancangan bentangan kertas. Tentukan mana yang dapat dibentuk menjadi tabung atau kerucut.',
    opsiKlas: OPSI_LIPAT_TKB,
    pilah: [
      {
        id: 'pTabungOk',
        nama: 'Rancangan A',
        correct: 'bisa',
        spec: {
          jenis: 'tabung',
          r: 1,
          t: 2,
          panjang: 6.28,
          lingkaran: [
            { r: 1, sisi: 'atas' },
            { r: 1, sisi: 'bawah' },
          ],
        },
      },
      {
        id: 'pSepihak',
        nama: 'Rancangan B',
        correct: 'tidak',
        spec: {
          jenis: 'tabung',
          r: 1,
          t: 2,
          panjang: 6.28,
          lingkaran: [
            { r: 1, sisi: 'atas' },
            { r: 1, sisi: 'atas' },
          ],
        },
      },
      {
        id: 'pPendek',
        nama: 'Rancangan C',
        correct: 'tidak',
        spec: {
          jenis: 'tabung',
          r: 1,
          t: 2,
          panjang: 2,
          lingkaran: [
            { r: 1, sisi: 'atas' },
            { r: 1, sisi: 'bawah' },
          ],
        },
      },
      {
        id: 'pKerucutOk',
        nama: 'Rancangan D',
        correct: 'bisa',
        spec: { jenis: 'kerucut', s: 10, sudut: 216, lingkaran: [{ r: 6 }] },
      },
      {
        id: 'pJuringBesar',
        nama: 'Rancangan E',
        correct: 'tidak',
        spec: { jenis: 'kerucut', s: 10, sudut: 300, lingkaran: [{ r: 6 }] },
      },
      {
        id: 'pSetengah',
        nama: 'Rancangan F',
        correct: 'bisa',
        spec: { jenis: 'kerucut', s: 10, sudut: 180, lingkaran: [{ r: 5 }] },
      },
      {
        id: 'pBola',
        nama: 'Rancangan G (untuk bola)',
        correct: 'tidak',
        spec: { jenis: 'bola' },
      },
    ],
    langkahInstruksi: 'Hitung luas bahan untuk tiga benda Pak Bima. Tulis desimal dengan koma.',
    langkah: [
      {
        id: 'hKaleng',
        label: 'Luas permukaan kaleng susu tertutup (r = 7 cm, t = 12 cm, π = 22/7) = … cm²',
        cek: { minta: 'luasPermukaan', jenis: 'tabung', r: 7, t: 12, pi: '22/7' },
        hints: [
          'Luas alas = luas tutup = 22/7 × 7 × 7 = 154 cm².',
          'Luas selimut = 44 × 12 = 528 cm². Jumlahkan semuanya: 154 + 154 + 528.',
        ],
      },
      {
        id: 'hTopi',
        label: 'Luas kertas topi tanpa alas (r = 6 cm, s = 10 cm, π = 3,14) = … cm²',
        cek: { minta: 'luasSelimut', jenis: 'kerucut', r: 6, t: 8, pi: '3,14' },
        hints: ['Topi hanya selimut: L = π × r × s.', '3,14 × 6 × 10 = 3,14 × 60 = …'],
      },
      {
        id: 'hBola',
        label: 'Luas kulit bola plastik (r = 7 cm, π = 22/7) = … cm²',
        cek: { minta: 'luasPermukaan', jenis: 'bola', r: 7, pi: '22/7' },
        hints: ['L = 4 × π × r².', '4 × 22/7 × 7 × 7 = 4 × 154 = …'],
      },
    ],
    temuan:
      'Luas permukaan = jumlah luas semua bagian jaring-jaring. Tabung: 2πr² + 2πrt. Kerucut: πr² + πrs. Bola: 4πr². Bila benda tidak bertutup atau tidak beralas, bagian itu tidak dihitung.',
    nextLabel: 'Lanjut: Tuang Isinya →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENGOLAH DATA: VOLUME (Lab Tuang)
     ---------------------------------------------------------- */
  tuang: {
    kicker: 'Tahap 7 · Mengolah Data',
    syntax: 'Discovery Learning · Sintaks 4 (Data Processing)',
    goal: 'Mengaitkan volume kerucut dan bola dengan volume tabung.',
    guru: 'Bila ada, gunakan wadah kerucut dan tabung plastik bening beralas dan bertinggi sama serta beras atau pasir. Ingatkan kembali volume prisma = luas alas × tinggi.',
    instruksi:
      'Wadah kerucut beralas dan bertinggi sama dengan tabung. Wadah bola berdiameter sama dengan tinggi tabung (tinggi tabung = 2r). Isi penuh wadah, lalu tuang ke tabung. Coba kedua wadah.',
    tanya: [
      {
        id: 'vTabung',
        tanya: 'Seperti prisma, volume tabung = luas alas × tinggi = …',
        opsi: [
          { id: 'benar', label: 'πr²t' },
          { id: 'selimut', label: '2πrt' },
          { id: 'tambah', label: 'πr² + t' },
          { id: 'dua', label: '2πr²t' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! Alasnya lingkaran (πr²), dikalikan tinggi t.',
          selimut: '2πrt adalah luas selimut, bukan volume.',
          tambah: 'Luas alas DIKALIKAN tinggi, bukan ditambah.',
          dua: 'Luas alas tabung πr², bukan 2πr².',
        },
      },
      {
        id: 'vTiga',
        tanya: 'Air dari wadah kerucut harus dituang berapa kali untuk memenuhi tabung?',
        opsi: [
          { id: 'tiga', label: '3 kali' },
          { id: 'dua', label: '2 kali' },
          { id: 'empat', label: '4 kali' },
          { id: 'satu', label: '1 kali' },
        ],
        correct: 'tiga',
        umpan: {
          tiga: 'Tepat! Tiga kerucut penuh tepat memenuhi satu tabung.',
          dua: 'Lihat lagi di lab: setelah dua tuangan, tabung belum penuh.',
          empat: 'Pada tuangan keempat air tumpah, berarti tabung sudah penuh sebelumnya.',
          satu: 'Satu tuangan baru mengisi sebagian kecil tabung.',
        },
      },
      {
        id: 'vKerucut',
        tanya: 'Jadi volume kerucut = …',
        opsi: [
          { id: 'benar', label: '⅓ × πr²t' },
          { id: 'setengah', label: '½ × πr²t' },
          { id: 'tiga', label: '3 × πr²t' },
          { id: 'sama', label: 'πr²t' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! Volume kerucut = ⅓ volume tabung yang alas dan tingginya sama.',
          setengah: 'Butuh tiga tuangan, jadi satu kerucut = ⅓ tabung.',
          tiga: 'Kerucut lebih kecil daripada tabung, bukan tiga kali lebih besar.',
          sama: 'Itu volume tabung. Kerucut hanya sebagian darinya.',
        },
      },
      {
        id: 'vBolaBagian',
        tanya: 'Air dari wadah bola mengisi … bagian tabung.',
        opsi: [
          { id: 'duaPertiga', label: '⅔' },
          { id: 'sepertiga', label: '⅓' },
          { id: 'setengah', label: '½' },
          { id: 'penuh', label: 'seluruh' },
        ],
        correct: 'duaPertiga',
        umpan: {
          duaPertiga: 'Tepat! Bola mengisi dua pertiga tabung yang tingginya 2r.',
          sepertiga: 'Lihat lagi: tinggi air setelah satu tuangan bola lebih dari sepertiga.',
          setengah:
            'Tinggi airnya lebih dari setengah tabung. Bandingkan dengan tiga tuangan kerucut.',
          penuh: 'Tabung belum penuh setelah satu tuangan bola.',
        },
      },
      {
        id: 'vBola',
        tanya: 'Karena tinggi tabung 2r, volume bola = ⅔ × πr² × 2r = …',
        opsi: [
          { id: 'benar', label: '4/3 πr³' },
          { id: 'luas', label: '4πr²' },
          { id: 'duaPertiga', label: '2/3 πr³' },
          { id: 'kuadrat', label: '4/3 πr²' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! ⅔ × 2 = 4/3, dan r² × r = r³. V bola = 4/3 πr³.',
          luas: '4πr² adalah luas permukaan bola.',
          duaPertiga: 'Jangan lupa tinggi tabung 2r: ⅔ × 2 = 4/3.',
          kuadrat: 'r² × r = r³, karena volume berdimensi tiga.',
        },
      },
    ],
    langkahInstruksi: 'Gunakan temuanmu untuk menghitung volume dua benda berikut.',
    langkah: [
      {
        id: 'hTumpeng',
        label: 'Volume tumpeng (r = 14 cm, t = 15 cm, π = 22/7) = … cm³',
        cek: { minta: 'volume', jenis: 'kerucut', r: 14, t: 15, pi: '22/7' },
        hints: ['V = ⅓ × π × r² × t.', '⅓ × 22/7 × 14 × 14 × 15 = 616 × 5 = …'],
      },
      {
        id: 'hKelereng',
        label: 'Volume bola mainan (r = 3 cm, π = 3,14) = … cm³',
        cek: { minta: 'volume', jenis: 'bola', r: 3, pi: '3,14' },
        hints: ['V = 4/3 × π × r³.', '4/3 × 3,14 × 27 = 4 × 3,14 × 9 = …'],
      },
    ],
    temuan:
      'Volume tabung = luas alas × tinggi = πr²t. Volume kerucut = ⅓ × volume tabung = ⅓πr²t. Volume bola = ⅔ × volume tabung bertinggi 2r = 4/3 πr³.',
    nextLabel: 'Lanjut ke Pembuktian →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 8 · Pembuktian',
    syntax: 'Discovery Learning · Sintaks 5 (Verification)',
    goal: 'Menguji temuan pada benda dan rancangan baru serta menanggapi pendapat teman.',
    guru: 'Minta pasangan membandingkan hasil hitung dengan hipotesis di tahap 2. Bahas pendapat teman yang keliru secara terbuka sebagai bahan belajar.',
    instruksiHitung:
      'Uji temuanmu pada kaleng biskuit (r = 14 cm, t = 10 cm, π = 22/7) dan cone es krim (r = 3 cm, t = 4 cm).',
    langkah: [
      {
        id: 'vKel',
        label: 'Panjang kertas label kaleng biskuit = keliling alas = … cm',
        cek: { minta: 'kelilingAlas', jenis: 'tabung', r: 14, pi: '22/7' },
        hints: ['Keliling = 2 × π × r.', '2 × 22/7 × 14 = 2 × 44 = …'],
      },
      {
        id: 'vLuas',
        label: 'Luas permukaan kaleng biskuit tertutup = … cm²',
        cek: { minta: 'luasPermukaan', jenis: 'tabung', r: 14, t: 10, pi: '22/7' },
        hints: [
          'Luas alas = 22/7 × 14 × 14 = 616 cm²; ada dua (alas & tutup).',
          'Luas selimut = 88 × 10 = 880 cm². Jumlahkan: 616 + 616 + 880.',
        ],
      },
      {
        id: 'vPelukis',
        label: 'Garis pelukis cone es krim = √(3² + 4²) = … cm',
        cek: { minta: 'garisPelukis', jenis: 'kerucut', r: 3, t: 4 },
        hints: ['s² = 9 + 16.', '√25 = …'],
      },
      {
        id: 'vSudut',
        label: 'Sudut juring jaring-jaring cone = (3 ÷ 5) × 360° = … °',
        cek: { minta: 'sudutJuring', jenis: 'kerucut', r: 3, t: 4 },
        hints: ['3 ÷ 5 = 0,6.', '0,6 × 360 = …'],
      },
    ],
    instruksiJaring:
      'Prediksi dulu apakah rancangan ini dapat dibentuk, lalu ketuk “Uji bentuk” untuk membuktikannya.',
    opsiPrediksi: OPSI_LIPAT_TKB,
    jaring: [
      {
        id: 'jTabung',
        nama: 'Rancangan label kaleng Dodi',
        spec: {
          jenis: 'tabung',
          r: 1,
          t: 1.6,
          panjang: 3.14,
          lingkaran: [
            { r: 1, sisi: 'atas' },
            { r: 1, sisi: 'bawah' },
          ],
        },
      },
      {
        id: 'jKerucut',
        nama: 'Rancangan topi Sari (s = 5, r = 3)',
        spec: { jenis: 'kerucut', s: 5, sudut: 216, lingkaran: [{ r: 3 }] },
      },
    ],
    instruksiMiskonsepsi: 'Tanggapi pendapat teman-temanmu berikut.',
    soal: [
      {
        id: 'mPelukis',
        teks: 'Dimas: “Luas selimut kerucut = π × r × t, karena t adalah tinggi kerucut.”',
        options: [
          { id: 'a', label: 'Keliru. Selimut kerucut memakai garis pelukis: π × r × s.' },
          { id: 'b', label: 'Benar. Tinggi dan garis pelukis sama panjangnya.' },
          { id: 'c', label: 'Keliru. Seharusnya 2 × π × r × t.' },
          { id: 'd', label: 'Benar, asalkan π = 3,14.' },
        ],
        correct: 'a',
        explanation:
          'Jari-jari juring selimut adalah garis pelukis s, dan s selalu lebih panjang dari t karena s sisi miring segitiga siku-siku.',
      },
      {
        id: 'mRusuk',
        teks: 'Sinta: “Bola punya satu rusuk, yaitu garis melingkar di tengahnya.”',
        options: [
          { id: 'a', label: 'Keliru. Garis itu hanya garis bantu; bola tidak punya rusuk.' },
          { id: 'b', label: 'Benar. Rusuk bola ada satu.' },
          { id: 'c', label: 'Keliru. Bola punya dua rusuk.' },
          { id: 'd', label: 'Keliru. Bola punya satu titik sudut.' },
        ],
        correct: 'a',
        explanation:
          'Rusuk adalah pertemuan dua sisi. Bola hanya punya satu sisi lengkung, jadi tidak ada rusuk maupun titik sudut.',
      },
      {
        id: 'mVolume',
        teks: 'Raka: “Volume kerucut sama dengan volume tabung, karena alas dan tingginya sama.”',
        options: [
          { id: 'a', label: 'Keliru. Volume kerucut hanya ⅓ volume tabung itu.' },
          { id: 'b', label: 'Benar. Alas dan tinggi sama berarti volume sama.' },
          { id: 'c', label: 'Keliru. Volume kerucut ½ volume tabung itu.' },
          { id: 'd', label: 'Keliru. Volume kerucut lebih besar.' },
        ],
        correct: 'a',
        explanation:
          'Di Lab Tuang, tabung baru penuh setelah tiga kali tuangan kerucut, jadi V kerucut = ⅓πr²t.',
      },
      {
        id: 'mDiameter',
        teks: 'Nisa: “Kaleng berdiameter 14 cm, jadi jari-jarinya 14 cm dan luas alasnya π × 14 × 14.”',
        options: [
          { id: 'a', label: 'Keliru. r = ½ × 14 = 7 cm, jadi luas alas = π × 7 × 7.' },
          { id: 'b', label: 'Benar. Diameter dan jari-jari sama saja.' },
          { id: 'c', label: 'Keliru. r = 2 × 14 = 28 cm.' },
          { id: 'd', label: 'Keliru. Luas alas = 2 × π × 14.' },
        ],
        correct: 'a',
        explanation:
          'Diameter = 2 × jari-jari. Memakai diameter sebagai jari-jari membuat luas alas menjadi empat kali lipat.',
      },
    ],
    nextLabel: 'Lanjut ke Simpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 9 · Menarik Kesimpulan',
    syntax: 'Discovery Learning · Sintaks 6 (Generalization)',
    goal: 'Menyusun kesimpulan tentang unsur, jaring-jaring, luas permukaan, dan volume tabung, kerucut, dan bola.',
    guru: 'Minta beberapa pasangan membacakan kesimpulannya. Tegaskan kaitan: jaring-jaring → luas permukaan; tabung → volume kerucut & bola.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari bank kalimat. Setiap potongan hanya dipakai sekali.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'gTabung', awal: 'Tabung memiliki', correct: 'bTabung' },
      { id: 'gKerucut', awal: 'Kerucut memiliki', correct: 'bKerucut' },
      { id: 'gBola', awal: 'Bola hanya memiliki', correct: 'bBola' },
      { id: 'gJaringTabung', awal: 'Jaring-jaring tabung terdiri atas', correct: 'bJaringTabung' },
      {
        id: 'gJaringKerucut',
        awal: 'Jaring-jaring kerucut terdiri atas',
        correct: 'bJaringKerucut',
      },
      { id: 'gLuas', awal: 'Luas permukaan adalah', correct: 'bLuas' },
      {
        id: 'gVolume',
        awal: 'Volume kerucut dan bola berkaitan dengan volume tabung, yaitu',
        correct: 'bVolume',
      },
    ],
    bank: [
      {
        id: 'bTabung',
        teks: 'dua sisi datar berbentuk lingkaran yang kongruen, satu selimut (sisi lengkung), dan dua rusuk lengkung.',
      },
      {
        id: 'bKerucut',
        teks: 'satu sisi alas berbentuk lingkaran, satu selimut, satu rusuk lengkung, dan satu titik puncak.',
      },
      {
        id: 'bBola',
        teks: 'satu sisi lengkung tanpa rusuk dan titik sudut, sehingga tidak memiliki jaring-jaring.',
      },
      {
        id: 'bJaringTabung',
        teks: 'dua lingkaran dan satu persegi panjang yang panjangnya sama dengan keliling alas (2πr) dan lebarnya sama dengan tinggi.',
      },
      {
        id: 'bJaringKerucut',
        teks: 'satu lingkaran dan satu juring berjari-jari garis pelukis s yang panjang busurnya sama dengan keliling alas.',
      },
      {
        id: 'bLuas',
        teks: 'jumlah luas semua bagian jaring-jaring: tabung 2πr² + 2πrt, kerucut πr² + πrs, bola 4πr².',
      },
      {
        id: 'bVolume',
        teks: 'V kerucut = ⅓ V tabung beralas dan bertinggi sama, dan V bola = ⅔ V tabung bertinggi 2r.',
      },
      { id: 'xSegitiga', teks: 'satu lingkaran dan satu segitiga sama kaki.' },
      { id: 'xRusuk', teks: 'satu rusuk berupa garis melingkar di tengahnya.' },
      { id: 'xVolume', teks: 'V kerucut sama dengan V tabung karena alas dan tingginya sama.' },
    ],
    rangkuman: [
      'Unsur ukuran: jari-jari r, diameter d = 2r, tinggi t, dan garis pelukis kerucut s = √(r² + t²).',
      'Jaring-jaring tabung: 2 lingkaran + persegi panjang 2πr × t.',
      'Jaring-jaring kerucut: 1 lingkaran + juring berjari-jari s, busur 2πr, sudut (r ÷ s) × 360°.',
      'Bola tidak memiliki jaring-jaring; luas kulitnya = 4 lingkaran besar.',
      'Luas permukaan: tabung 2πr² + 2πrt, kerucut πr² + πrs, bola 4πr².',
      'Volume: tabung πr²t, kerucut ⅓πr²t, bola 4/3 πr³.',
    ],
    dugaanJudul: 'Bagaimana dengan dugaanmu di awal?',
    tanggapanDugaan: {
      dTabung: {
        persegiPanjang:
          'Dugaanmu terbukti: label kaleng terbuka menjadi persegi panjang yang panjangnya sama dengan keliling alas.',
        lain: 'Ternyata label kaleng terbuka menjadi persegi panjang, karena tepinya lurus dan tingginya sama di setiap tempat.',
      },
      dKerucut: {
        juring:
          'Dugaanmu terbukti: topi terbuka menjadi juring lingkaran berjari-jari garis pelukis.',
        lain: 'Ternyata topi terbuka menjadi juring lingkaran: semua titik tepinya berjarak s dari puncak, sehingga tepinya melengkung.',
      },
    },
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 10 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan unsur, jaring-jaring, luas permukaan, dan volume tabung, kerucut, dan bola pada masalah sehari-hari.',
    guru: 'Murid bekerja mandiri. Amati pesan diagnosa yang muncul (diameter dipakai sebagai jari-jari, t dipakai sebagai s, lupa tutup, lupa ⅓) sebagai bahan umpan balik individual.',
    instruksi:
      'Kerjakan sepuluh soal berikut. Tentukan dulu bagian mana yang ditanyakan, lalu gunakan nilai π yang diminta. Desimal ditulis dengan koma, mis. 188,4.',
    banyak: 10,
    komposisi: { input: 5, choice: 5 },
    soal: [
      {
        id: 'iLabel',
        type: 'input',
        konteks: '🥫 Koperasi',
        cerita:
          'Kaleng susu berjari-jari 7 cm dan bertinggi 10 cm akan dibungkus label kertas pada seluruh selimutnya.',
        pertanyaan: 'Berapa luas kertas label yang diperlukan? (π = 22/7)',
        cek: { minta: 'luasSelimut', jenis: 'tabung', r: 7, t: 10, pi: '22/7' },
        hints: ['Label = selimut = persegi panjang 2πr × t.', '2 × 22/7 × 7 × 10 = 44 × 10 = …'],
        explanation: 'L selimut = 2πrt = 44 × 10 = 440 cm².',
      },
      {
        id: 'iToples',
        type: 'input',
        konteks: '🍪 Dapur',
        cerita: 'Tutup toples kue berbentuk lingkaran dengan diameter 14 cm.',
        pertanyaan: 'Berapa luas tutup toples itu? (π = 22/7)',
        cek: { minta: 'luasAlas', jenis: 'tabung', d: 14, pi: '22/7' },
        hints: ['Jari-jari = ½ × diameter = 7 cm.', '22/7 × 7 × 7 = …'],
        explanation: 'r = 7 cm, L = πr² = 22/7 × 49 = 154 cm².',
      },
      {
        id: 'iTopiS',
        type: 'input',
        konteks: '🥳 Pesta',
        cerita: 'Topi ulang tahun berbentuk kerucut berjari-jari alas 7 cm dan bertinggi 24 cm.',
        pertanyaan: 'Berapa panjang garis pelukis topi itu?',
        cek: { minta: 'garisPelukis', jenis: 'kerucut', r: 7, t: 24 },
        hints: ['s = √(r² + t²).', '√(49 + 576) = √625 = …'],
        explanation: 's = √(7² + 24²) = √625 = 25 cm.',
      },
      {
        id: 'iTopiKertas',
        type: 'input',
        konteks: '🥳 Pesta',
        cerita: 'Topi itu (r = 7 cm, s = 25 cm) dibuat dari kertas tanpa alas.',
        pertanyaan: 'Berapa luas kertas sebuah topi? (π = 22/7)',
        cek: { minta: 'luasSelimut', jenis: 'kerucut', r: 7, s: 25, pi: '22/7' },
        hints: ['Topi hanya selimut: L = πrs.', '22/7 × 7 × 25 = 22 × 25 = …'],
        explanation: 'L selimut = πrs = 22/7 × 7 × 25 = 550 cm².',
      },
      {
        id: 'iTumpeng',
        type: 'input',
        konteks: '🍚 Syukuran',
        cerita: 'Cetakan tumpeng berbentuk kerucut berjari-jari 14 cm dan bertinggi 15 cm.',
        pertanyaan: 'Berapa volume nasi yang dapat dicetak? (π = 22/7)',
        cek: { minta: 'volume', jenis: 'kerucut', r: 14, t: 15, pi: '22/7' },
        hints: ['V = ⅓πr²t.', '⅓ × 22/7 × 14 × 14 × 15 = 616 × 5 = …'],
        explanation: 'V = ⅓ × 22/7 × 196 × 15 = 3.080 cm³.',
      },
      {
        id: 'iBola',
        type: 'input',
        konteks: '⚽ Olahraga',
        cerita: 'Bola plastik berjari-jari 7 cm akan dicat seluruh permukaannya.',
        pertanyaan: 'Berapa luas permukaan yang dicat? (π = 22/7)',
        cek: { minta: 'luasPermukaan', jenis: 'bola', r: 7, pi: '22/7' },
        hints: ['L = 4πr².', '4 × 22/7 × 49 = 4 × 154 = …'],
        explanation: 'L = 4πr² = 4 × 154 = 616 cm².',
      },
      {
        id: 'iMainan',
        type: 'input',
        konteks: '🧸 Mainan',
        cerita: 'Bola mainan pejal berjari-jari 3 cm dibuat dari lilin.',
        pertanyaan: 'Berapa volume lilin yang diperlukan? (π = 3,14)',
        cek: { minta: 'volume', jenis: 'bola', r: 3, pi: '3,14' },
        hints: ['V = 4/3 πr³.', '4/3 × 3,14 × 27 = 4 × 3,14 × 9 = …'],
        explanation: 'V = 4/3 × 3,14 × 27 = 113,04 cm³.',
      },
      {
        id: 'iPensil',
        type: 'input',
        konteks: '✏️ Sekolah',
        cerita:
          'Tempat pensil berbentuk tabung tanpa tutup berjari-jari 5 cm dan bertinggi 12 cm dilapisi kain flanel di bagian luarnya.',
        pertanyaan: 'Berapa luas kain flanel yang diperlukan? (π = 3,14)',
        cek: {
          minta: 'luasPermukaan',
          jenis: 'tabung',
          r: 5,
          t: 12,
          pi: '3,14',
          tanpa: ['tutup'],
        },
        hints: [
          'Tanpa tutup: L = luas alas + luas selimut.',
          '3,14 × 25 + 2 × 3,14 × 5 × 12 = 78,5 + 376,8 = …',
        ],
        explanation: 'L = πr² + 2πrt = 78,5 + 376,8 = 455,3 cm².',
      },
      {
        id: 'cDrum',
        type: 'choice',
        konteks: '💧 Kebun',
        cerita: 'Drum air berbentuk tabung berjari-jari 7 dm dan bertinggi 10 dm.',
        pertanyaan: 'Berapa volume air yang dapat ditampung drum itu? (π = 22/7)',
        cek: { minta: 'volume', jenis: 'tabung', r: 7, t: 10, pi: '22/7' },
        satuan: 'dm',
        explanation: 'V = πr²t = 154 × 10 = 1.540 dm³ = 1.540 liter.',
      },
      {
        id: 'cCone',
        type: 'choice',
        konteks: '🍦 Kantin',
        cerita:
          'Cone es krim berjari-jari 3 cm dan bertinggi 4 cm dibungkus kertas pada selimutnya.',
        pertanyaan: 'Berapa luas kertas pembungkusnya? (π = 3,14)',
        cek: { minta: 'luasSelimut', jenis: 'kerucut', r: 3, t: 4, pi: '3,14' },
        explanation: 's = √(9 + 16) = 5 cm, L = πrs = 3,14 × 3 × 5 = 47,1 cm².',
      },
      {
        id: 'cSudut',
        type: 'choice',
        konteks: '🥳 Pesta',
        cerita:
          'Sari membuat topi kerucut berjari-jari 6 cm dan bertinggi 8 cm dari selembar juring kertas.',
        pertanyaan: 'Berapa besar sudut pusat juring yang harus digunting?',
        cek: { minta: 'sudutJuring', jenis: 'kerucut', r: 6, t: 8 },
        explanation: 's = 10 cm, sudut = (6 ÷ 10) × 360° = 216°.',
      },
      {
        id: 'cBiskuit',
        type: 'choice',
        konteks: '🥫 Koperasi',
        cerita:
          'Kaleng biskuit tertutup berjari-jari 14 cm dan bertinggi 10 cm akan dicat seluruh permukaannya.',
        pertanyaan: 'Berapa luas permukaan yang dicat? (π = 22/7)',
        cek: { minta: 'luasPermukaan', jenis: 'tabung', r: 14, t: 10, pi: '22/7' },
        explanation: 'L = 2 × 616 + 88 × 10 = 1.232 + 880 = 2.112 cm².',
      },
      {
        id: 'cBasket',
        type: 'choice',
        konteks: '🏀 Olahraga',
        cerita: 'Sebuah bola basket berdiameter 28 cm.',
        pertanyaan: 'Berapa luas permukaan bola basket itu? (π = 22/7)',
        cek: { minta: 'luasPermukaan', jenis: 'bola', d: 28, pi: '22/7' },
        explanation: 'r = 14 cm, L = 4πr² = 4 × 22/7 × 196 = 2.464 cm².',
      },
      {
        id: 'cCorong',
        type: 'choice',
        konteks: '🧪 Lab IPA',
        cerita:
          'Corong berbentuk kerucut berjari-jari 6 cm dan bertinggi 8 cm ditutup ujungnya lalu diisi air sampai penuh.',
        pertanyaan: 'Berapa volume air di dalam corong? (π = 3,14)',
        cek: { minta: 'volume', jenis: 'kerucut', r: 6, t: 8, pi: '3,14' },
        explanation: 'V = ⅓ × 3,14 × 36 × 8 = 301,44 cm³.',
      },
      {
        id: 'cPita',
        type: 'choice',
        konteks: '🎁 Kado',
        cerita: 'Pita dililitkan tepat satu putaran pada tepi tutup kaleng berjari-jari 7 cm.',
        pertanyaan: 'Berapa panjang pita yang diperlukan? (π = 22/7)',
        cek: { minta: 'kelilingAlas', jenis: 'tabung', r: 7, pi: '22/7' },
        explanation: 'Panjang pita = keliling alas = 2 × 22/7 × 7 = 44 cm.',
      },
      {
        id: 'cJaringBola',
        type: 'choice',
        konteks: '🏐 Olahraga',
        cerita:
          'Raka ingin membuat jaring-jaring bola voli dari karton agar bisa dilipat menjadi bola.',
        pertanyaan: 'Bagaimana pendapatmu?',
        options: [
          { id: 'a', label: 'Tidak bisa, karena kulit bola tidak dapat dibentangkan rata.' },
          { id: 'b', label: 'Bisa, jaring-jaringnya empat lingkaran.' },
          { id: 'c', label: 'Bisa, jaring-jaringnya satu lingkaran besar.' },
          { id: 'd', label: 'Bisa, jaring-jaringnya dua setengah lingkaran.' },
        ],
        correct: 'a',
        explanation:
          'Bola hanya punya satu sisi lengkung yang tidak bisa dibuka menjadi bangun datar tanpa sobek, jadi bola tidak memiliki jaring-jaring.',
      },
      {
        id: 'cLebar',
        type: 'choice',
        konteks: '🪈 Bengkel',
        cerita:
          'Pipa paralon dipotong lurus memanjang lalu dibuka menjadi lembaran persegi panjang.',
        pertanyaan: 'Ukuran lembaran itu adalah …',
        options: [
          { id: 'a', label: 'keliling penampang pipa × panjang pipa' },
          { id: 'b', label: 'diameter pipa × panjang pipa' },
          { id: 'c', label: 'luas penampang pipa × panjang pipa' },
          { id: 'd', label: 'jari-jari pipa × panjang pipa' },
        ],
        correct: 'a',
        explanation:
          'Pipa adalah selimut tabung: lembarannya berukuran keliling alas (2πr) × tinggi (panjang pipa).',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 11 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 11 · Refleksi',
    syntax: 'Discovery Learning · Penutup',
    goal: 'Merenungkan proses penemuan dan menilai pemahaman diri.',
    guru: 'Gunakan jawaban refleksi untuk mengetahui murid yang masih menukar t dengan s atau diameter dengan jari-jari. Jawaban hanya tersimpan di perangkat murid.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Dengan kalimatmu sendiri, jelaskan perbedaan unsur tabung, kerucut, dan bola.',
        placeholder: 'Tabung punya … sedangkan kerucut … dan bola …',
      },
      {
        id: 'r2',
        teks: 'Apakah dugaan dan hipotesismu di awal terbukti? Apa yang berubah dari pemikiranmu?',
        placeholder: 'Awalnya aku mengira … ternyata …',
      },
      {
        id: 'r3',
        teks: 'Bagaimana jaring-jaring membantumu menghitung luas permukaan? Benda apa di rumahmu yang bisa kamu hitung?',
        placeholder: 'Jaring-jaring membantuku karena … Di rumah ada …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu mengidentifikasi unsur dan jaring-jaring tabung, kerucut, dan bola sekarang?',
    diriOpsi: [
      { id: 'd1', label: '🌟 Sangat yakin, bisa menjelaskan ke teman' },
      { id: 'd2', label: '🙂 Yakin, tapi masih perlu latihan' },
      { id: 'd3', label: '🤔 Masih bingung di beberapa bagian' },
      { id: 'd4', label: '🆘 Perlu dibantu guru' },
    ],
    nextLabel: 'Simpan & Selesai',
  },

  /* ----------------------------------------------------------
     TAHAP 12 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, penemuanmu tuntas!',
    teks: 'Kamu telah menemukan sendiri unsur dan jaring-jaring tabung, kerucut, dan bola, lalu mengaitkannya dengan luas permukaan dan volume.',
    capaian: [
      'Menunjukkan sisi, rusuk, titik puncak, jari-jari, diameter, tinggi, dan garis pelukis pada tabung, kerucut, dan bola.',
      'Menemukan jaring-jaring tabung (2 lingkaran + persegi panjang 2πr × t) dan kerucut (lingkaran + juring berjari-jari s).',
      'Menjelaskan bahwa bola tidak memiliki jaring-jaring, tetapi luas kulitnya sama dengan 4 lingkaran besar.',
      'Mengaitkan luas bagian jaring-jaring dengan luas permukaan.',
      'Mengaitkan volume kerucut (⅓ tabung) dan bola (⅔ tabung bertinggi 2r) dengan volume tabung.',
    ],
  },
};
