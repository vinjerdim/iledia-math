'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Luas Permukaan Prisma
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Tujuan Pembelajaran:
   Menentukan rumus luas permukaan prisma.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'bongkar' & 'sabuk'
     Sintaks 4 — Data processing ............ tahap 'olah'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas:
     1. Stimulasi   — pesanan kotak di toko kemasan “Kardus Ceria”:
                      berapa karton untuk membuat satu kotak? Murid
                      MENDUGA cara menghitungnya + alasan (tidak dinilai).
     2. Masalah     — memilih rumusan masalah & menulis hipotesis.
     3. Bongkar     — Lab Bentang: melipat/membuka jaring-jaring tiga
                      kemasan berukuran, mengetuk setiap sisi untuk
                      melihat bentuk & ukurannya, lalu mengisi kartu luas
                      tiap sisi kotak cokelat (berdiagnosa) dan
                      menjumlahkannya.
     4. Sabuk       — merapatkan sisi-sisi tegak menjadi satu persegi
                      panjang (“sabuk”), mengisi panjang & luas sabuk,
                      lalu pertanyaan penuntun: panjang sabuk = keliling
                      alas, lebar = tinggi prisma.
     5. Olah data   — kartu data tiga prisma (La, K, 2 × La, K × t, LP),
                      pertanyaan penuntun pola, dan memilah kartu “bagian
                      dari luas permukaan / bukan”.
     6. Pembuktian  — kotak hadiah baru: cara menjumlahkan semua sisi vs
                      cara dugaan rumus → hasilnya sama; menanggapi tiga
                      miskonsepsi teman.
     7. Simpulan    — menyusun kalimat kesimpulan dari bank kalimat.
     8. Uji terap   — 8 soal kontekstual.
     9. Refleksi    — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan.

   Alas prisma ditulis sebagai titik-titik poligon dalam cm (lihat
   shared/engine.js seksi 47). Semua kunci (luas alas, keliling, luas
   permukaan, pengecoh) diuji terhadap engine di
   tests/mpi-22.2-data.test.js.
   ============================================================ */

var DATA = {
  /* ----------------------------------------------------------
     PRISMA — kemasan pesanan (dipakai tahap 3–5)
     ---------------------------------------------------------- */
  prisma: [
    {
      id: 'cokelat',
      nama: '🍫 Kotak cokelat',
      bentuk: 'prisma segitiga',
      alas: [
        [0, 0],
        [8, 0],
        [0, 6],
      ],
      t: 12,
      infoAlas:
        'segitiga siku-siku dengan sisi siku-siku 6 cm dan 8 cm (sisi miringnya 10 cm). Sisi tutup sama persis dengan sisi alas.',
      alasPersegiPanjang: false,
      caraLuasAlas: '½ × 8 × 6',
    },
    {
      id: 'kue',
      nama: '🎂 Kotak kue',
      bentuk: 'prisma segiempat (balok)',
      alas: [
        [0, 0],
        [8, 0],
        [8, 5],
        [0, 5],
      ],
      t: 4,
      infoAlas: 'persegi panjang berukuran 8 cm × 5 cm. Sisi tutup sama persis dengan sisi alas.',
      alasPersegiPanjang: true,
      caraLuasAlas: '8 × 5',
    },
    {
      id: 'camilan',
      nama: '🍿 Kotak camilan',
      bentuk: 'prisma trapesium',
      alas: [
        [0, 0],
        [10, 0],
        [7, 4],
        [3, 4],
      ],
      t: 10,
      infoAlas:
        'trapesium sama kaki: sisi sejajar 10 cm dan 4 cm, kaki 5 cm, tinggi trapesium 4 cm. Sisi tutup sama persis dengan sisi alas.',
      alasPersegiPanjang: false,
      caraLuasAlas: '½ × (10 + 4) × 4',
    },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1 (Stimulation)',
    goal: 'Mengamati pesanan kotak kemasan dan menduga cara menghitung banyak karton yang dibutuhkan.',
    tp: 'Menentukan rumus luas permukaan prisma.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menjelaskan bahwa luas permukaan prisma adalah jumlah luas semua sisinya.',
      'Menunjukkan bahwa semua sisi tegak prisma dapat dirangkai menjadi satu persegi panjang berukuran keliling alas × tinggi.',
      'Menemukan rumus luas permukaan prisma: 2 × luas alas + keliling alas × tinggi.',
      'Menggunakan rumus luas permukaan untuk menyelesaikan masalah sehari-hari.',
    ],
    guru: 'Bawa kotak kemasan nyata (kotak cokelat segitiga, kotak kue) yang bisa dibuka. Tanyakan “berapa karton yang dipakai?” dan biarkan murid menduga tanpa dikoreksi; dugaan akan diuji pada tahap-tahap berikutnya.',
    judul: 'Pesanan untuk Toko Kemasan “Kardus Ceria”',
    cerita:
      'Bu Rina menerima pesanan 100 kotak cokelat, 100 kotak kue, dan 100 kotak camilan. Setiap kotak dibuat dari selembar karton yang dipotong, dilipat, dan tidak bertumpuk. Sebelum membeli karton, Bu Rina harus tahu berapa cm² karton untuk satu kotak.',
    pertanyaan: 'Menurut dugaanmu, bagaimana cara menghitung banyak karton untuk satu kotak?',
    opsi: [
      { id: 'jumlah', label: 'Menjumlahkan luas semua sisi kotak' },
      { id: 'volume', label: 'Mengalikan luas alas dengan tinggi kotak' },
      { id: 'rusuk', label: 'Menjumlahkan panjang semua rusuk kotak' },
      { id: 'alas', label: 'Cukup menghitung luas alasnya saja' },
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
    guru: 'Tekankan bahwa karton yang dipakai = luas seluruh permukaan kotak. Terima hipotesis apa pun selama bisa diuji dengan membongkar kotak.',
    pengantar:
      'Banyak karton untuk satu kotak sama dengan luas seluruh permukaan kotak itu, yaitu luas permukaan prisma. Bu Rina ingin punya cara cepat menghitungnya hanya dari ukuran alas dan tinggi kotak.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'rumus',
        label:
          'Bagaimana cara menghitung luas seluruh permukaan prisma dari ukuran alas dan tingginya?',
      },
      { id: 'harga', label: 'Berapa harga satu lembar karton di toko?' },
      { id: 'isi', label: 'Berapa banyak cokelat yang muat di dalam satu kotak?' },
      { id: 'rusuk', label: 'Berapa banyak rusuk yang dimiliki kotak kue?' },
    ],
    correct: 'rumus',
    umpan: {
      rumus:
        'Tepat! Pertanyaan ini bisa diselidiki dengan membongkar kotak dan menghitung luas sisi-sisinya.',
      harga:
        'Harga penting untuk belanja, tetapi Bu Rina harus tahu dulu berapa luas kartonnya. Coba pilih yang lain.',
      isi: 'Banyak isi berhubungan dengan volume, bukan karton pembungkusnya. Coba pilih yang lain.',
      rusuk:
        'Banyak rusuk sudah kamu pelajari di materi 22.1 dan tidak menjawab kebutuhan karton. Coba pilih yang lain.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu, luas permukaan prisma dihitung dari ukuran apa saja?',
    hipotesisPlaceholder: 'Menurutku, luas permukaan prisma dihitung dengan …',
    nextLabel: 'Mulai Membongkar Kotak →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MEMBONGKAR KOTAK (Lab Bentang)
     ---------------------------------------------------------- */
  bongkar: {
    kicker: 'Tahap 3 · Mengumpulkan Data (1)',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Membuka kotak menjadi jaring-jaring, mengamati ukuran setiap sisi, dan menghitung luas semua sisinya.',
    guru: 'Minta murid melipat–membuka setiap kotak di Lab Bentang dan mengetuk semua sisinya. Saat mengisi kartu, dorong murid menulis cara hitungnya di buku (mis. ½ × 8 × 6). Pantau kesalahan “lupa ½” dan “menghitung keliling”.',
    instruksi:
      'Pilih kotak, geser atau tekan ▶ Lipat untuk melihat jaring-jaring menjadi kotak, lalu buka lagi. Pada jaring yang terbuka, ketuk setiap sisi untuk melihat bentuk dan ukurannya.',
    lab: ['cokelat', 'kue', 'camilan'],
    prismaTabel: 'cokelat',
    syaratLab:
      'Untuk melanjutkan: lipat jaring-jaring kotak cokelat sampai menjadi kotak, lalu ketuk kelima sisinya.',
    instruksiTabel:
      'Hitung luas setiap sisi kotak cokelat, lalu jumlahkan semuanya. Gunakan ukuran yang kamu temukan di Lab Bentang.',
    kartuJudul: '🍫 Luas setiap sisi kotak cokelat',
    hintsTabel: [
      'Sisi alas dan tutup berbentuk segitiga siku-siku: luas = ½ × alas × tinggi = ½ × 8 × 6.',
      'Setiap sisi tegak berbentuk persegi panjang: luas = panjang × lebar, lebarnya = tinggi prisma 12 cm.',
      'Luas seluruh permukaan = jumlah luas kelima sisi.',
    ],
    tanya: [
      {
        id: 'b1',
        tanya: 'Ada berapa sisi yang harus dihitung luasnya pada kotak cokelat (prisma segitiga)?',
        opsi: [
          { id: '5', label: '5 sisi' },
          { id: '3', label: '3 sisi' },
          { id: '2', label: '2 sisi' },
          { id: '6', label: '6 sisi' },
        ],
        correct: '5',
        umpan: {
          5: 'Tepat! 2 sisi segitiga (alas dan tutup) + 3 sisi tegak persegi panjang.',
          3: 'Itu baru sisi tegaknya. Jangan lupa sisi alas dan tutup.',
          2: 'Itu baru sisi alas dan tutup. Masih ada sisi-sisi tegak.',
          6: 'Kotak cokelat bukan balok. Hitung lagi sisi pada jaring-jaringnya.',
        },
      },
      {
        id: 'b2',
        tanya: 'Apa yang kamu temukan tentang luas sisi alas dan sisi tutup?',
        opsi: [
          { id: 'sama', label: 'Luasnya selalu sama karena bentuk dan ukurannya sama (kongruen)' },
          { id: 'alasbesar', label: 'Sisi alas selalu lebih luas daripada sisi tutup' },
          { id: 'tutupbesar', label: 'Sisi tutup selalu lebih luas daripada sisi alas' },
          { id: 'acak', label: 'Luas keduanya tidak ada hubungannya' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Tepat! Alas dan tutup prisma kongruen, jadi luasnya cukup dihitung sekali lalu dikali 2.',
          alasbesar: 'Periksa kartu isianmu: luas sisi alas dan tutup sama-sama 24 cm².',
          tutupbesar: 'Periksa kartu isianmu: luas sisi alas dan tutup sama-sama 24 cm².',
          acak: 'Ingat ciri prisma dari materi 22.1: dua sisi yang berhadapan itu kongruen.',
        },
      },
      {
        id: 'b3',
        tanya:
          'Semua sisi tegak kotak cokelat berbentuk persegi panjang. Ukuran apa yang SAMA pada ketiganya?',
        opsi: [
          { id: 'lebar', label: 'Lebarnya, yaitu tinggi prisma (12 cm)' },
          { id: 'panjang', label: 'Panjangnya, yaitu 8 cm' },
          { id: 'luas', label: 'Luasnya, yaitu 96 cm²' },
          { id: 'tidak', label: 'Tidak ada ukuran yang sama' },
        ],
        correct: 'lebar',
        umpan: {
          lebar:
            'Tepat! Semua sisi tegak setinggi prisma. Panjangnya berbeda-beda, mengikuti panjang sisi alas: 8, 10, dan 6 cm.',
          panjang: 'Panjangnya berbeda: 8 cm, 10 cm, dan 6 cm. Lihat lagi ukuran pada jaring.',
          luas: 'Luasnya berbeda: 96, 120, dan 72 cm². Ada ukuran lain yang sama.',
          tidak: 'Ketuk lagi sisi-sisi tegaknya dan bandingkan lebarnya.',
        },
      },
    ],
    temuan:
      'Luas karton kotak cokelat = jumlah luas kelima sisinya = 24 + 24 + 96 + 120 + 72 = 336 cm². Inilah LUAS PERMUKAAN prisma.',
    nextLabel: 'Lanjut: Rapatkan Sisi Tegak →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — SABUK SISI TEGAK
     ---------------------------------------------------------- */
  sabuk: {
    kicker: 'Tahap 4 · Mengumpulkan Data (2)',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Merapatkan semua sisi tegak menjadi satu persegi panjang dan menemukan ukurannya.',
    guru: 'Peragakan dengan kotak nyata: potong kedua sisi alas lalu bentangkan sisi-sisi tegaknya. Tanyakan: “Panjang sabuk ini sama dengan apa pada alas kotak?”',
    instruksi:
      'Sisi-sisi tegak setiap kotak ditampilkan terpisah. Tekan 🧲 Rapatkan untuk menjajarkannya, amati bentuk gabungannya, lalu isi kartu di bawahnya.',
    prismaIds: ['cokelat', 'kue', 'camilan'],
    tanya: [
      {
        id: 's1',
        tanya: 'Panjang sabuk (gabungan sisi tegak) selalu sama dengan …',
        opsi: [
          { id: 'keliling', label: 'keliling alas prisma' },
          { id: 'luas', label: 'luas alas prisma' },
          { id: 'tinggi', label: 'tinggi prisma' },
          { id: 'terpanjang', label: 'sisi alas yang terpanjang' },
        ],
        correct: 'keliling',
        umpan: {
          keliling:
            'Tepat! Panjang sabuk = jumlah semua sisi alas = keliling alas (24 cm, 26 cm, 24 cm).',
          luas: 'Luas satuannya cm², sedangkan panjang sabuk satuannya cm. Coba lihat lagi penjumlahannya.',
          tinggi: 'Tinggi prisma adalah LEBAR sabuk. Panjangnya berasal dari sisi-sisi alas.',
          terpanjang: 'Panjang sabuk adalah jumlah SEMUA sisi alas, bukan hanya yang terpanjang.',
        },
      },
      {
        id: 's2',
        tanya: 'Lebar sabuk selalu sama dengan …',
        opsi: [
          { id: 'tinggi', label: 'tinggi prisma' },
          { id: 'keliling', label: 'keliling alas' },
          { id: 'pendek', label: 'sisi alas yang terpendek' },
          { id: 'luas', label: 'luas alas' },
        ],
        correct: 'tinggi',
        umpan: {
          tinggi: 'Tepat! Setiap sisi tegak setinggi prisma, jadi lebar sabuk = tinggi prisma.',
          keliling: 'Keliling alas adalah PANJANG sabuk. Lebarnya ukuran yang lain.',
          pendek: 'Lihat label di samping sabuk: lebarnya sama dengan tinggi kotak.',
          luas: 'Lebar satuannya cm, bukan cm². Lihat label di samping sabuk.',
        },
      },
      {
        id: 's3',
        tanya: 'Jadi, luas semua sisi tegak (disebut luas selimut) dapat dihitung dengan …',
        opsi: [
          { id: 'kxt', label: 'keliling alas × tinggi prisma' },
          { id: 'lxt', label: 'luas alas × tinggi prisma' },
          { id: 'kpt', label: 'keliling alas + tinggi prisma' },
          { id: 'dua', label: '2 × luas alas' },
        ],
        correct: 'kxt',
        umpan: {
          kxt: 'Tepat! Luas selimut = panjang sabuk × lebar sabuk = keliling alas × tinggi.',
          lxt: 'Luas alas × tinggi adalah volume prisma. Sabuk berukuran keliling alas × tinggi.',
          kpt: 'Luas persegi panjang diperoleh dengan MENGALIKAN panjang dan lebar.',
          dua: 'Itu luas sisi alas dan tutup, bukan sisi-sisi tegak.',
        },
      },
    ],
    temuan:
      'Semua sisi tegak prisma membentuk satu persegi panjang: panjangnya = keliling alas, lebarnya = tinggi prisma. Jadi luas selimut = keliling alas × tinggi.',
    nextLabel: 'Lanjut ke Mengolah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGOLAH DATA
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 5 · Mengolah Data',
    syntax: 'Discovery Learning · Sintaks 4 (Data Processing)',
    goal: 'Mengolah data luas alas, keliling alas, dan tinggi tiga kotak untuk menemukan pola luas permukaan.',
    guru: 'Murid bisa bekerja berpasangan: satu menghitung, satu memeriksa. Setelah ketiga kartu benar, minta murid membandingkan kolom “jumlah luas semua sisi” dengan kolom lain.',
    instruksiData:
      'Lengkapi kartu data ketiga kotak. Luas permukaan diisi dengan menjumlahkan luas dua sisi alas dan luas selimut.',
    prismaIds: ['cokelat', 'kue', 'camilan'],
    instruksiPola: 'Perhatikan ketiga kartu datamu, lalu jawab pertanyaan berikut.',
    konsep: [
      {
        id: 'k1',
        tanya: 'Pada ketiga kotak, luas permukaan selalu sama dengan …',
        opsi: [
          { id: 'rumus', label: '2 × luas alas + luas selimut' },
          { id: 'satu', label: 'luas alas + luas selimut' },
          { id: 'volume', label: 'luas alas × tinggi' },
          { id: 'tiga', label: '3 × luas alas' },
        ],
        correct: 'rumus',
        umpan: {
          rumus: 'Tepat! Dua sisi alas (alas dan tutup) ditambah semua sisi tegak.',
          satu: 'Periksa kartumu: masih ada satu sisi alas lagi, yaitu tutupnya.',
          volume: 'Coba hitung: kotak kue 40 × 4 = 160, padahal luas permukaannya 184.',
          tiga: 'Coba hitung: kotak cokelat 3 × 24 = 72, padahal luas permukaannya 336.',
        },
      },
      {
        id: 'k2',
        tanya: 'Mengapa luas alas dikalikan 2?',
        opsi: [
          {
            id: 'kongruen',
            label: 'Karena prisma punya dua sisi alas yang kongruen (alas dan tutup)',
          },
          { id: 'tinggi', label: 'Karena tinggi prisma selalu 2 kali alasnya' },
          { id: 'segitiga', label: 'Karena luas segitiga harus dikali 2' },
          { id: 'tebal', label: 'Karena kartonnya dibuat dua lapis' },
        ],
        correct: 'kongruen',
        umpan: {
          kongruen: 'Tepat! Sisi alas dan sisi tutup bentuk dan ukurannya sama.',
          tinggi: 'Tinggi kotak tidak berhubungan dengan banyaknya sisi alas.',
          segitiga: 'Luas segitiga justru memakai ½. Angka 2 berasal dari banyaknya sisi alas.',
          tebal: 'Karton kotak hanya satu lapis. Hitung lagi banyak sisi alasnya.',
        },
      },
      {
        id: 'k3',
        tanya: 'Kotak mana yang luas permukaannya paling kecil walaupun alasnya paling luas?',
        opsi: [
          { id: 'kue', label: 'Kotak kue, karena tingginya paling pendek' },
          { id: 'cokelat', label: 'Kotak cokelat, karena alasnya segitiga' },
          { id: 'camilan', label: 'Kotak camilan, karena alasnya trapesium' },
          { id: 'sama', label: 'Ketiganya sama luas' },
        ],
        correct: 'kue',
        umpan: {
          kue: 'Tepat! Luas alasnya 40 cm², tetapi tingginya hanya 4 cm sehingga luas selimutnya kecil: 26 × 4 = 104 cm². Tinggi ikut menentukan luas permukaan.',
          cokelat: 'Luas permukaan kotak cokelat 336 cm². Bandingkan dengan dua kotak lainnya.',
          camilan: 'Luas permukaan kotak camilan 296 cm². Bandingkan dengan kotak kue.',
          sama: 'Lihat kolom luas permukaan: 336, 184, dan 296 cm². Hasilnya berbeda.',
        },
      },
    ],
    instruksiPilah:
      'Bu Rina menulis beberapa bagian perhitungan. Pilah: apakah bagian ini termasuk luas permukaan prisma?',
    opsiKlas: [
      { id: 'masuk', label: 'Termasuk luas permukaan' },
      { id: 'bukan', label: 'Bukan bagian luas permukaan' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: 'Luas sisi alas',
        correct: 'masuk',
        explanation: 'Sisi alas adalah salah satu sisi prisma, jadi luasnya ikut dihitung.',
      },
      {
        id: 'p2',
        teks: 'Luas sisi tutup (sama dengan luas alas)',
        correct: 'masuk',
        explanation:
          'Sisi tutup juga menutup kotak, jadi luasnya dihitung. Karena itu luas alas dikali 2.',
      },
      {
        id: 'p3',
        teks: 'Keliling alas × tinggi prisma',
        correct: 'masuk',
        explanation: 'Ini luas selimut, yaitu luas semua sisi tegak yang dirapatkan menjadi sabuk.',
      },
      {
        id: 'p4',
        teks: 'Luas alas × tinggi prisma',
        correct: 'bukan',
        explanation: 'Luas alas × tinggi adalah volume (isi) prisma, bukan luas kartonnya.',
      },
      {
        id: 'p5',
        teks: 'Keliling alas + tinggi prisma',
        correct: 'bukan',
        explanation: 'Menjumlahkan panjang menghasilkan panjang (cm), bukan luas (cm²).',
      },
      {
        id: 'p6',
        teks: 'Jumlah panjang semua rusuk',
        correct: 'bukan',
        explanation: 'Panjang rusuk dipakai untuk kerangka kotak, bukan untuk luas karton.',
      },
    ],
    temuan:
      'Luas permukaan prisma = luas alas + luas tutup + luas selimut = 2 × luas alas + keliling alas × tinggi.',
    nextLabel: 'Lanjut ke Pembuktian →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    syntax: 'Discovery Learning · Sintaks 5 (Verification)',
    goal: 'Membuktikan dugaan rumus pada kotak baru dengan dua cara dan menanggapi pendapat teman.',
    guru: 'Minta murid mengerjakan kedua cara, lalu bandingkan hasilnya di depan kelas. Pada bagian miskonsepsi, minta murid menjelaskan letak kesalahan teman dengan kata-katanya sendiri.',
    prisma: {
      id: 'hadiah',
      nama: '🎁 Kotak hadiah',
      alas: [
        [0, 0],
        [10, 0],
        [5, 12],
      ],
      t: 15,
      infoAlas:
        'segitiga sama kaki: alas 10 cm, kaki 13 cm, tinggi segitiga 12 cm. Sisi tutup sama persis dengan sisi alas.',
    },
    cerita:
      'Pesanan baru datang: kotak hadiah berbentuk prisma segitiga. Alasnya segitiga sama kaki dengan alas 10 cm, kaki 13 cm, dan tinggi segitiga 12 cm. Tinggi kotak 15 cm.',
    instruksiJumlah: 'Cara 1 — jumlahkan luas semua sisi satu per satu.',
    langkahJumlah: [
      {
        id: 'j1',
        label: 'Luas satu sisi segitiga (alas) = ½ × 10 × 12 = … cm²',
        kunci: 'luasAlas',
        hints: ['Luas segitiga = ½ × alas × tinggi segitiga.'],
      },
      {
        id: 'j2',
        label: 'Luas ketiga sisi tegak = 10 × 15 + 13 × 15 + 13 × 15 = … cm²',
        kunci: 'selimutSatuSatu',
        hints: ['Hitung 150 + 195 + 195.'],
      },
      {
        id: 'j3',
        label: 'Luas semua sisi = luas alas + luas tutup + luas sisi tegak = … cm²',
        kunci: 'jumlahSemua',
        hints: ['Sisi tutup sama luasnya dengan sisi alas: 60 + 60 + 540.'],
      },
    ],
    instruksiRumus: 'Cara 2 — gunakan dugaan rumus dari tahap sebelumnya.',
    langkahRumus: [
      {
        id: 'r1',
        label: 'Keliling alas = 10 + 13 + 13 = … cm',
        kunci: 'keliling',
        hints: ['Jumlahkan ketiga sisi segitiga.'],
      },
      {
        id: 'r2',
        label: 'Luas permukaan = 2 × luas alas + keliling alas × tinggi = 2 × 60 + 36 × 15 = … cm²',
        kunci: 'rumus',
        hints: ['2 × 60 = 120 dan 36 × 15 = 540.'],
      },
    ],
    temuanSama:
      'Kedua cara menghasilkan 660 cm². Dugaan rumus LP = 2 × luas alas + keliling alas × tinggi terbukti pada kotak baru!',
    instruksiMiskonsepsi:
      'Tiga temanmu menghitung luas karton kotak hadiah itu. Tanggapi pendapat mereka.',
    soal: [
      {
        id: 'm1',
        teks: 'Raka: “Luas permukaannya 60 + 36 × 15 = 600 cm².”',
        nilaiTeman: 600,
        miskonsepsi: 'satu-alas',
        options: [
          { id: 'a', label: 'Kurang tepat, sisi segitiganya ada dua sehingga luas alas dikali 2' },
          { id: 'b', label: 'Sudah tepat, luas alas cukup dihitung sekali' },
          { id: 'c', label: 'Kurang tepat, seharusnya 60 × 15' },
          { id: 'd', label: 'Kurang tepat, keliling alas seharusnya dikali 2' },
        ],
        correct: 'a',
        explanation:
          'Kotak hadiah punya sisi alas dan sisi tutup. Luas permukaannya 2 × 60 + 36 × 15 = 660 cm².',
      },
      {
        id: 'm2',
        teks: 'Sinta: “Cukup luas alas × tinggi = 60 × 15 = 900 cm².”',
        nilaiTeman: 900,
        miskonsepsi: 'volume',
        options: [
          { id: 'a', label: 'Kurang tepat, luas alas × tinggi adalah volume, bukan luas karton' },
          { id: 'b', label: 'Sudah tepat, rumus itu berlaku untuk semua prisma' },
          { id: 'c', label: 'Kurang tepat, seharusnya luas alas × keliling' },
          { id: 'd', label: 'Kurang tepat, seharusnya luas alas + tinggi' },
        ],
        correct: 'a',
        explanation:
          'Luas alas × tinggi mengukur isi kotak (volume). Karton yang membungkus dihitung dari luas semua sisinya: 660 cm².',
      },
      {
        id: 'm3',
        teks: 'Dimas: “2 × 60 + 36 + 15 = 171 cm².”',
        nilaiTeman: 171,
        miskonsepsi: 'jumlah-ukuran',
        options: [
          { id: 'a', label: 'Kurang tepat, keliling alas harus DIKALI tinggi, bukan ditambah' },
          { id: 'b', label: 'Sudah tepat, semua ukuran memang dijumlahkan' },
          { id: 'c', label: 'Kurang tepat, luas alas tidak perlu dikali 2' },
          { id: 'd', label: 'Kurang tepat, tinggi seharusnya dikali 2' },
        ],
        correct: 'a',
        explanation:
          'Sisi-sisi tegak membentuk persegi panjang 36 cm × 15 cm, jadi luasnya 36 × 15 = 540 cm², bukan 36 + 15.',
      },
    ],
    nextLabel: 'Lanjut ke Menarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    syntax: 'Discovery Learning · Sintaks 6 (Generalization)',
    goal: 'Menyusun kesimpulan tentang rumus luas permukaan prisma dari temuan sendiri.',
    guru: 'Setelah kesimpulan tepat, minta beberapa murid membacakannya dan menuliskan rumus di buku catatan beserta gambar jaring-jaringnya.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari pilihan. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'g1', awal: 'Luas permukaan prisma adalah', correct: 'jumlah' },
      {
        id: 'g2',
        awal: 'Sisi alas dan sisi tutup prisma kongruen, sehingga luas keduanya adalah',
        correct: 'dua-alas',
      },
      {
        id: 'g3',
        awal: 'Semua sisi tegak dapat dirapatkan menjadi satu persegi panjang, sehingga luas selimut adalah',
        correct: 'selimut',
      },
      { id: 'g4', awal: 'Jadi, rumus luas permukaan prisma adalah', correct: 'rumus' },
    ],
    bank: [
      { id: 'jumlah', teks: 'jumlah luas semua sisi prisma.' },
      { id: 'dua-alas', teks: '2 × luas alas.' },
      { id: 'selimut', teks: 'keliling alas × tinggi prisma.' },
      { id: 'rumus', teks: 'LP = 2 × luas alas + keliling alas × tinggi.' },
      { id: 'volume', teks: 'luas alas × tinggi prisma.' },
      { id: 'satu', teks: 'LP = luas alas + keliling alas × tinggi.' },
      { id: 'rusuk', teks: 'jumlah panjang semua rusuk prisma.' },
    ],
    rangkuman: [
      'Luas permukaan prisma = jumlah luas semua sisinya (luas karton pembungkusnya).',
      'Sisi alas dan sisi tutup kongruen: luas keduanya = <strong>2 × luas alas</strong>.',
      'Semua sisi tegak membentuk persegi panjang berukuran keliling alas × tinggi: <strong>luas selimut = K × t</strong>.',
      '<strong>LP = 2 × La + K × t</strong>, dengan La = luas alas, K = keliling alas, t = tinggi prisma.',
      'Kotak tanpa tutup hanya punya satu sisi alas: LP = La + K × t.',
    ],
    dugaanJudul: 'Bandingkan dengan dugaan awalmu',
    tanggapanDugaan: {
      jumlah:
        'Dugaanmu tepat! Luas karton memang jumlah luas semua sisi. Sekarang kamu punya cara cepatnya: 2 × luas alas + keliling alas × tinggi.',
      volume:
        'Luas alas × tinggi ternyata adalah volume (isi) kotak. Karton dihitung dari luas semua sisinya: 2 × luas alas + keliling alas × tinggi.',
      rusuk:
        'Panjang rusuk berguna untuk membuat kerangka. Karton dihitung dari luas semua sisi: 2 × luas alas + keliling alas × tinggi.',
      alas: 'Luas alas saja belum cukup. Masih ada sisi tutup dan semua sisi tegak: 2 × luas alas + keliling alas × tinggi.',
    },
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Discovery Learning · Penerapan',
    goal: 'Menggunakan rumus luas permukaan prisma untuk menyelesaikan masalah sehari-hari.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang banyak salah (terutama kotak tanpa tutup dan mencari tinggi) untuk dibahas bersama.',
    instruksi:
      'Kerjakan setiap soal. Bila ragu, buka petunjuk. Setelah menjawab, baca penjelasannya sebelum lanjut.',
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: '⛺ Tenda pramuka',
        cerita:
          'Tenda pramuka berbentuk prisma segitiga. Sisi segitiganya sama kaki dengan alas 6 m, kaki 5 m, dan tinggi segitiga 4 m. Panjang tenda 8 m. Seluruh tenda, termasuk alas lantainya, dibuat dari kain.',
        pertanyaan: 'Berapa m² kain yang dibutuhkan?',
        cek: {
          alas: [
            [0, 0],
            [6, 0],
            [3, 4],
          ],
          luasAlas: 12,
          kelilingAlas: 16,
          tinggi: 8,
        },
        jawab: 152,
        satuan: 'm²',
        hints: [
          'Luas satu segitiga = ½ × 6 × 4 = 12 m²; keliling segitiga = 6 + 5 + 5 = 16 m.',
          'Tinggi prisma adalah panjang tenda, 8 m. LP = 2 × 12 + 16 × 8.',
        ],
        explanation: 'LP = 2 × 12 + 16 × 8 = 24 + 128 = 152 m².',
      },
      {
        id: 't2',
        type: 'choice',
        konteks: '🎁 Kotak hadiah',
        cerita: 'Kotak hadiah berbentuk balok dengan alas 10 cm × 6 cm dan tinggi 5 cm.',
        pertanyaan: 'Berapa luas kertas kado minimal untuk menutup seluruh permukaannya?',
        cek: {
          alas: [
            [0, 0],
            [10, 0],
            [10, 6],
            [0, 6],
          ],
          luasAlas: 60,
          kelilingAlas: 32,
          tinggi: 5,
        },
        options: [
          { id: 'benar', label: '280 cm²' },
          { id: 'satu-alas', label: '220 cm²' },
          { id: 'tanpa-alas', label: '160 cm²' },
          { id: 'volume', label: '300 cm²' },
        ],
        correct: 'benar',
        hints: ['Luas alas 60 cm², keliling alas 32 cm.', 'LP = 2 × 60 + 32 × 5.'],
        explanation: 'LP = 2 × 60 + 32 × 5 = 120 + 160 = 280 cm².',
      },
      {
        id: 't3',
        type: 'input',
        konteks: '🐟 Akuarium tanpa tutup',
        cerita:
          'Akuarium kaca berbentuk balok TANPA TUTUP. Alasnya 50 cm × 30 cm dan tingginya 40 cm.',
        pertanyaan: 'Berapa cm² kaca yang dibutuhkan?',
        cek: {
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
          'Tanpa tutup berarti sisi alasnya hanya satu: LP = luas alas + keliling alas × tinggi.',
          'Luas alas = 50 × 30 = 1.500; keliling alas = 160 cm.',
        ],
        explanation: 'LP = 1.500 + 160 × 40 = 1.500 + 6.400 = 7.900 cm².',
      },
      {
        id: 't4',
        type: 'choice',
        konteks: '🏮 Lampion segienam',
        cerita:
          'Lampion berbentuk prisma segienam. Luas alasnya 90 cm², keliling alasnya 36 cm, dan tingginya 20 cm. Seluruh permukaannya ditutup kertas minyak.',
        pertanyaan: 'Berapa luas kertas minyak yang dibutuhkan?',
        cek: { luasAlas: 90, kelilingAlas: 36, tinggi: 20 },
        options: [
          { id: 'benar', label: '900 cm²' },
          { id: 'satu-alas', label: '810 cm²' },
          { id: 'tanpa-alas', label: '720 cm²' },
          { id: 'volume', label: '1.800 cm²' },
        ],
        correct: 'benar',
        hints: ['Rumusnya berlaku untuk alas segi berapa pun: LP = 2 × La + K × t.'],
        explanation: 'LP = 2 × 90 + 36 × 20 = 180 + 720 = 900 cm².',
      },
      {
        id: 't5',
        type: 'input',
        konteks: '📦 Tinggi kotak',
        cerita:
          'Kotak berbentuk prisma segitiga siku-siku dengan sisi siku-siku 5 cm dan 12 cm (sisi miring 13 cm). Luas permukaannya 360 cm².',
        pertanyaan: 'Berapa cm tinggi kotak itu?',
        cek: {
          alas: [
            [0, 0],
            [12, 0],
            [0, 5],
          ],
          luasAlas: 30,
          kelilingAlas: 30,
          luasPermukaan: 360,
          cari: 'tinggi',
        },
        jawab: 10,
        satuan: 'cm',
        hints: [
          'Luas alas = ½ × 5 × 12 = 30 cm²; keliling alas = 5 + 12 + 13 = 30 cm.',
          '360 = 2 × 30 + 30 × t, jadi 30 × t = 300.',
        ],
        explanation: '360 = 60 + 30 × t → 30 × t = 300 → t = 10 cm.',
      },
      {
        id: 't6',
        type: 'choice',
        konteks: '✏️ Kotak pensil segilima',
        cerita:
          'Kotak pensil berbentuk prisma segilima dengan luas alas 40 cm², keliling alas 25 cm, dan tinggi 18 cm.',
        pertanyaan: 'Perhitungan mana yang tepat untuk luas permukaannya?',
        cek: { luasAlas: 40, kelilingAlas: 25, tinggi: 18, cari: 'rumus' },
        options: [
          { id: 'benar', label: '2 × 40 + 25 × 18' },
          { id: 'satu-alas', label: '40 + 25 × 18' },
          { id: 'volume', label: '40 × 18' },
          { id: 'jumlah', label: '2 × 40 + 25 + 18' },
        ],
        correct: 'benar',
        hints: ['Ingat: dua sisi alas, lalu sabuk berukuran keliling × tinggi.'],
        explanation: 'LP = 2 × La + K × t = 2 × 40 + 25 × 18 = 80 + 450 = 530 cm².',
      },
      {
        id: 't7',
        type: 'input',
        konteks: '🍰 Kue lapis',
        cerita:
          'Kue lapis berbentuk prisma trapesium siku-siku. Sisi sejajarnya 10 cm dan 6 cm, tinggi trapesium 3 cm, dan sisi miringnya 5 cm. Panjang kue 20 cm. Seluruh permukaan kue akan dilapisi cokelat.',
        pertanyaan: 'Berapa cm² permukaan yang dilapisi cokelat?',
        cek: {
          alas: [
            [0, 0],
            [10, 0],
            [6, 3],
            [0, 3],
          ],
          luasAlas: 24,
          kelilingAlas: 24,
          tinggi: 20,
        },
        jawab: 528,
        satuan: 'cm²',
        hints: [
          'Luas trapesium = ½ × (10 + 6) × 3 = 24 cm²; keliling = 10 + 5 + 6 + 3 = 24 cm.',
          'Tinggi prisma adalah panjang kue, 20 cm.',
        ],
        explanation: 'LP = 2 × 24 + 24 × 20 = 48 + 480 = 528 cm².',
      },
      {
        id: 't8',
        type: 'input',
        konteks: '💰 Biaya karton',
        cerita:
          'Bu Rina membuat kotak kue berbentuk balok dengan alas persegi 20 cm × 20 cm dan tinggi 10 cm. Harga karton Rp2 per cm².',
        pertanyaan: 'Berapa rupiah biaya karton untuk satu kotak?',
        cek: {
          alas: [
            [0, 0],
            [20, 0],
            [20, 20],
            [0, 20],
          ],
          luasAlas: 400,
          kelilingAlas: 80,
          tinggi: 10,
          hargaPerCm2: 2,
        },
        jawab: 3200,
        satuan: 'rupiah',
        hints: [
          'Hitung dulu luas permukaannya: 2 × 400 + 80 × 10.',
          'Luas permukaan 1.600 cm², lalu kalikan dengan Rp2.',
        ],
        explanation: 'LP = 800 + 800 = 1.600 cm². Biaya = 1.600 × Rp2 = Rp3.200.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Discovery Learning · Refleksi',
    goal: 'Merefleksikan proses menemukan rumus luas permukaan prisma.',
    guru: 'Baca beberapa refleksi murid (dengan izin) untuk menutup pelajaran. Tanyakan: “Bagian mana yang paling membantumu menemukan rumus?”',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Jelaskan dengan kata-katamu sendiri mengapa rumus luas permukaan prisma memuat “2 × luas alas”.',
        placeholder: 'Karena …',
      },
      {
        id: 'q2',
        teks: 'Mengapa luas semua sisi tegak bisa dihitung dengan keliling alas × tinggi?',
        placeholder: 'Karena sisi-sisi tegak …',
      },
      {
        id: 'q3',
        teks: 'Di mana lagi kamu bisa memakai luas permukaan prisma dalam kehidupan sehari-hari?',
        placeholder: 'Misalnya saat …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menentukan luas permukaan prisma sekarang?',
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
    judul: 'Hebat, kamu menemukan rumusnya sendiri!',
    teks: 'Sekarang Bu Rina bisa menghitung karton untuk kotak apa pun, cukup dari ukuran alas dan tingginya.',
    capaian: [
      'Membongkar kotak menjadi jaring-jaring dan menghitung luas setiap sisinya.',
      'Menemukan bahwa semua sisi tegak membentuk persegi panjang berukuran keliling alas × tinggi.',
      'Menemukan dan membuktikan rumus LP = 2 × luas alas + keliling alas × tinggi.',
      'Menggunakan rumus luas permukaan untuk tenda, akuarium, lampion, dan biaya karton.',
    ],
  },
};
