'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Luas Permukaan Limas
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Tujuan Pembelajaran:
   Menentukan rumus luas permukaan limas.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'bongkar' & 'susun'
     Sintaks 4 — Data processing ............ tahap 'olah'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas:
     1. Stimulasi   — Festival Lampion Kelas IX: berapa kertas untuk satu
                      lampion berbentuk limas? Murid MENDUGA cara
                      menghitungnya + alasan (tidak dinilai).
     2. Masalah     — memilih rumusan masalah & menulis hipotesis.
     3. Bongkar     — Lab Bentang Limas: melipat/membuka jaring-jaring tiga
                      lampion, mengetuk setiap sisi untuk melihat bentuk &
                      ukurannya (alas segitiga = rusuk alas, tinggi segitiga
                      = tₛ), lalu mengisi kartu luas tiap sisi lampion
                      persegi (berdiagnosa) dan menjumlahkannya.
     4. Susun       — memindahkan segitiga-segitiga sisi tegak dari kipas ke
                      satu jalur berselang atas–bawah → jajargenjang/
                      trapesium dengan jumlah sisi sejajar = keliling alas
                      dan tinggi = tₛ; mengisi ukurannya lalu pertanyaan
                      penuntun: luas sisi tegak = ½ × K × tₛ.
     5. Olah data   — kartu data tiga limas (dua limas persegi dan satu limas
                      persegi panjang yang tₛ-nya tidak sama), pertanyaan
                      penuntun pola, dan memilah kartu “bagian dari luas
                      permukaan / bukan”.
     6. Pembuktian  — kotak hadiah limas: mencari tₛ dari tinggi limas
                      (Pythagoras), cara menjumlahkan semua sisi vs cara
                      dugaan rumus → hasilnya sama; menanggapi tiga
                      miskonsepsi teman.
     7. Simpulan    — menyusun kalimat kesimpulan dari bank kalimat.
     8. Uji terap   — 8 soal kontekstual.
     9. Refleksi    — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan.

   Limas beraturan ditulis sebagai { n, s, ts, t } (segi-n, panjang rusuk
   alas, tinggi segitiga sisi tegak, tinggi limas); limas persegi panjang
   sebagai { p, l, t }. Semua kunci diuji terhadap engine seksi 57 di
   tests/mpi-22.7-data.test.js.
   ============================================================ */

var DATA = {
  /* ----------------------------------------------------------
     LIMAS — lampion & benda (dipakai tahap 1–5)
     ---------------------------------------------------------- */
  limas: [
    {
      id: 'persegi',
      nama: '🏮 Lampion persegi',
      bentuk: 'limas persegi',
      n: 4,
      s: 10,
      ts: 13,
      t: 12,
      infoAlas: 'persegi bersisi 10 cm.',
      caraLuasAlas: '10 × 10',
    },
    {
      id: 'segitiga',
      nama: '🔺 Lampion segitiga',
      bentuk: 'limas segitiga beraturan',
      n: 3,
      s: 6,
      ts: 8,
      infoAlas: 'segitiga sama sisi bersisi 6 cm.',
    },
    {
      id: 'segienam',
      nama: '⭐ Lampion segienam',
      bentuk: 'limas segienam beraturan',
      n: 6,
      s: 4,
      ts: 7,
      infoAlas: 'segienam beraturan bersisi 4 cm.',
    },
    {
      id: 'kecil',
      nama: '🕯️ Tudung lilin',
      bentuk: 'limas persegi',
      n: 4,
      s: 6,
      ts: 5,
      t: 4,
      infoAlas: 'persegi bersisi 6 cm.',
      caraLuasAlas: '6 × 6',
    },
    {
      id: 'tenda',
      nama: '⛺ Tenda mainan',
      bentuk: 'limas persegi panjang',
      p: 18,
      l: 10,
      t: 12,
      infoAlas:
        'persegi panjang 18 cm × 10 cm. Segitiga pada rusuk 18 cm tingginya 13 cm, segitiga pada rusuk 10 cm tingginya 15 cm.',
      caraLuasAlas: '18 × 10',
    },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1 (Stimulation)',
    goal: 'Mengamati lampion berbentuk limas dan menduga cara menghitung banyak kertas yang dibutuhkan.',
    tp: 'Menentukan rumus luas permukaan limas.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menjelaskan bahwa luas permukaan limas adalah jumlah luas sisi alas dan semua sisi tegaknya.',
      'Membedakan tinggi segitiga sisi tegak (tₛ) dengan tinggi limas dan menghitungnya dengan teorema Pythagoras.',
      'Menunjukkan bahwa semua sisi tegak limas beraturan dapat disusun menjadi bangun berukuran keliling alas dan tinggi tₛ.',
      'Menemukan rumus luas permukaan limas: luas alas + ½ × keliling alas × tinggi sisi tegak.',
      'Menggunakan rumus luas permukaan limas untuk menyelesaikan masalah sehari-hari.',
    ],
    guru: 'Bawa lampion atau kotak kado berbentuk limas yang bisa dibuka. Tanyakan “berapa kertas yang dipakai?” dan biarkan murid menduga tanpa dikoreksi; dugaan akan diuji pada tahap-tahap berikutnya.',
    judul: 'Festival Lampion Kelas IX',
    cerita:
      'Kelas IX akan menghias sekolah dengan 30 lampion kertas berbentuk limas. Setiap lampion dibuat dari selembar kertas minyak yang digunting menjadi jaring-jaring limas lalu dilipat tanpa bertumpuk. Pak Dimas perlu tahu berapa cm² kertas untuk satu lampion sebelum membeli kertas.',
    pertanyaan: 'Menurut dugaanmu, bagaimana cara menghitung banyak kertas untuk satu lampion?',
    opsi: [
      { id: 'jumlah', label: 'Menjumlahkan luas sisi alas dan semua sisi tegaknya' },
      { id: 'prisma', label: 'Memakai rumus prisma: 2 × luas alas + keliling alas × tinggi' },
      { id: 'volume', label: 'Mengalikan luas alas dengan tinggi lampion lalu dibagi 3' },
      { id: 'rusuk', label: 'Menjumlahkan panjang semua rusuk lampion' },
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
    guru: 'Tekankan bahwa kertas yang dipakai = luas seluruh permukaan lampion. Terima hipotesis apa pun selama bisa diuji dengan membuka jaring-jaring lampion.',
    pengantar:
      'Banyak kertas untuk satu lampion sama dengan luas seluruh permukaan lampion itu, yaitu luas permukaan limas. Pak Dimas ingin punya cara cepat menghitungnya dari ukuran alas dan tinggi sisi tegaknya.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'rumus',
        label:
          'Bagaimana cara menghitung luas seluruh permukaan limas dari ukuran alas dan sisi tegaknya?',
      },
      { id: 'harga', label: 'Berapa harga satu lembar kertas minyak di toko?' },
      { id: 'isi', label: 'Berapa banyak udara yang muat di dalam satu lampion?' },
      { id: 'rusuk', label: 'Berapa banyak rusuk yang dimiliki lampion persegi?' },
    ],
    correct: 'rumus',
    umpan: {
      rumus:
        'Tepat! Pertanyaan ini bisa diselidiki dengan membuka jaring-jaring lampion dan menghitung luas sisi-sisinya.',
      harga:
        'Harga penting untuk belanja, tetapi Pak Dimas harus tahu dulu berapa luas kertasnya. Coba pilih yang lain.',
      isi: 'Banyak isi berhubungan dengan volume, bukan kertas pembungkusnya. Coba pilih yang lain.',
      rusuk:
        'Banyak rusuk sudah kamu pelajari di materi 22.6 dan tidak menjawab kebutuhan kertas. Coba pilih yang lain.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu, luas permukaan limas dihitung dari ukuran apa saja?',
    hipotesisPlaceholder: 'Menurutku, luas permukaan limas dihitung dengan …',
    nextLabel: 'Mulai Membuka Lampion →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MEMBUKA LAMPION (Lab Bentang Limas)
     ---------------------------------------------------------- */
  bongkar: {
    kicker: 'Tahap 3 · Mengumpulkan Data (1)',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Membuka lampion menjadi jaring-jaring, mengamati ukuran setiap sisi, dan menghitung luas semua sisinya.',
    guru: 'Minta murid melipat–membuka setiap lampion di Lab Bentang dan mengetuk semua sisinya. Tunjukkan bahwa garis putus-putus pada segitiga adalah tinggi segitiga sisi tegak (tₛ). Pantau kesalahan “lupa ½” saat menghitung luas segitiga.',
    instruksi:
      'Pilih lampion, geser atau tekan ▶ Lipat untuk melihat jaring-jaring menjadi limas, lalu buka lagi. Pada jaring yang terbuka, ketuk setiap sisi untuk melihat bentuk dan ukurannya.',
    lab: ['persegi', 'segitiga', 'segienam'],
    limasTabel: 'persegi',
    syaratLab:
      'Untuk melanjutkan: lipat jaring-jaring lampion persegi sampai menjadi limas, lalu ketuk kelima sisinya.',
    instruksiTabel:
      'Hitung luas setiap sisi lampion persegi, lalu jumlahkan semuanya. Gunakan ukuran yang kamu temukan di Lab Bentang.',
    kartuJudul: '🏮 Luas setiap sisi lampion persegi',
    hintsTabel: [
      'Sisi alas berbentuk persegi: luas = 10 × 10.',
      'Setiap sisi tegak berbentuk segitiga: luas = ½ × alas × tinggi = ½ × 10 × 13.',
      'Luas seluruh permukaan = jumlah luas kelima sisi.',
    ],
    tanya: [
      {
        id: 'b1',
        tanya: 'Ada berapa sisi yang harus dihitung luasnya pada lampion persegi (limas persegi)?',
        opsi: [
          { id: '5', label: '5 sisi' },
          { id: '4', label: '4 sisi' },
          { id: '6', label: '6 sisi' },
          { id: '8', label: '8 sisi' },
        ],
        correct: '5',
        umpan: {
          5: 'Tepat! 1 sisi alas persegi + 4 sisi tegak segitiga.',
          4: 'Itu baru sisi tegaknya. Jangan lupa sisi alasnya.',
          6: 'Limas tidak punya sisi tutup seperti balok. Hitung lagi sisi pada jaring-jaringnya.',
          8: 'Delapan adalah banyak rusuk limas persegi, bukan banyak sisinya.',
        },
      },
      {
        id: 'b2',
        tanya: 'Apa yang kamu temukan tentang keempat sisi tegak lampion persegi?',
        opsi: [
          {
            id: 'sama',
            label: 'Keempatnya segitiga yang kongruen, jadi luasnya sama (65 cm²)',
          },
          { id: 'beda', label: 'Luas keempat segitiga berbeda-beda' },
          { id: 'persegi', label: 'Keempatnya berbentuk persegi panjang' },
          { id: 'alas', label: 'Luas setiap segitiga sama dengan luas alas' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Tepat! Pada limas beraturan, semua sisi tegak kongruen, jadi luasnya cukup dihitung sekali lalu dikalikan banyaknya.',
          beda: 'Periksa kartu isianmu: keempat segitiga sama-sama 65 cm².',
          persegi:
            'Ketuk lagi sisi tegaknya: bentuknya segitiga, bukan persegi panjang seperti prisma.',
          alas: 'Luas alas 100 cm², sedangkan luas satu segitiga 65 cm². Keduanya berbeda.',
        },
      },
      {
        id: 'b3',
        tanya: 'Tinggi mana yang dipakai untuk menghitung luas segitiga sisi tegak?',
        opsi: [
          {
            id: 'ts',
            label: 'Tinggi segitiga sisi tegak (tₛ = 13 cm, garis putus-putus pada jaring)',
          },
          { id: 't', label: 'Tinggi limas (12 cm, dari puncak tegak lurus ke alas)' },
          { id: 'rusuk', label: 'Panjang rusuk tegak limas' },
          { id: 's', label: 'Panjang rusuk alas (10 cm)' },
        ],
        correct: 'ts',
        umpan: {
          ts: 'Tepat! Luas segitiga memakai tinggi segitiga itu sendiri, yaitu tₛ. Tinggi limas (12 cm) lebih pendek dan tidak terlihat pada jaring-jaring.',
          t: 'Tinggi limas ada di dalam limas, bukan pada segitiga sisi tegak. Segitiga punya tingginya sendiri: garis putus-putus 13 cm.',
          rusuk:
            'Rusuk tegak adalah sisi miring segitiga, bukan tingginya. Tinggi segitiga tegak lurus terhadap alas segitiga.',
          s: 'Rusuk alas 10 cm adalah ALAS segitiga. Tingginya ukuran yang lain.',
        },
      },
    ],
    temuan:
      'Luas kertas lampion persegi = jumlah luas kelima sisinya = 100 + 65 + 65 + 65 + 65 = 360 cm². Inilah LUAS PERMUKAAN limas.',
    nextLabel: 'Lanjut: Susun Sisi Tegak →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — SUSUN SISI TEGAK
     ---------------------------------------------------------- */
  susun: {
    kicker: 'Tahap 4 · Mengumpulkan Data (2)',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Menyusun semua segitiga sisi tegak menjadi satu bangun datar dan menemukan ukurannya.',
    guru: 'Peragakan dengan kertas: gunting sisi-sisi tegak lampion, lalu jajarkan berselang atas–bawah. Tanyakan: “Jumlah kedua sisi sejajar bangun ini sama dengan apa pada alas lampion?”',
    instruksi:
      'Sisi-sisi tegak setiap lampion masih berbentuk kipas. Geser atau tekan ▶ Susun untuk menjajarkannya berselang atas–bawah, amati bangun gabungannya, lalu isi kartu di bawahnya.',
    limasIds: ['segitiga', 'persegi', 'segienam'],
    tanya: [
      {
        id: 's1',
        tanya: 'Jumlah panjang kedua sisi sejajar bangun gabungan selalu sama dengan …',
        opsi: [
          { id: 'keliling', label: 'keliling alas limas' },
          { id: 'luas', label: 'luas alas limas' },
          { id: 'tinggi', label: 'tinggi segitiga sisi tegak' },
          { id: 'rusuk', label: 'panjang satu rusuk alas' },
        ],
        correct: 'keliling',
        umpan: {
          keliling:
            'Tepat! Setiap segitiga menyumbang satu rusuk alas ke sisi atas atau bawah, jadi jumlahnya = keliling alas (18, 40, dan 24 cm).',
          luas: 'Luas satuannya cm², sedangkan panjang sisi satuannya cm. Lihat lagi ukuran sisi sejajarnya.',
          tinggi:
            'Tinggi segitiga sisi tegak adalah TINGGI bangun gabungan, bukan sisi sejajarnya.',
          rusuk: 'Satu rusuk alas hanya alas satu segitiga. Jumlahkan sisi sejajar atas dan bawah.',
        },
      },
      {
        id: 's2',
        tanya: 'Tinggi bangun gabungan selalu sama dengan …',
        opsi: [
          { id: 'ts', label: 'tinggi segitiga sisi tegak (tₛ)' },
          { id: 't', label: 'tinggi limas' },
          { id: 'keliling', label: 'keliling alas' },
          { id: 'rusuk', label: 'rusuk tegak limas' },
        ],
        correct: 'ts',
        umpan: {
          ts: 'Tepat! Semua segitiga setinggi tₛ, jadi bangun gabungannya juga setinggi tₛ.',
          t: 'Tinggi limas tidak terlihat pada sisi tegak. Lihat label garis putus-putus pada bangun gabungan.',
          keliling: 'Keliling alas adalah jumlah sisi sejajarnya. Tingginya ukuran yang lain.',
          rusuk: 'Rusuk tegak adalah sisi miring segitiga, lebih panjang daripada tingginya.',
        },
      },
      {
        id: 's3',
        tanya: 'Jadi, luas semua sisi tegak limas beraturan dapat dihitung dengan …',
        opsi: [
          { id: 'rumus', label: '½ × keliling alas × tinggi sisi tegak' },
          { id: 'tanpa', label: 'keliling alas × tinggi sisi tegak' },
          { id: 'tambah', label: 'keliling alas + tinggi sisi tegak' },
          { id: 'limas', label: '½ × keliling alas × tinggi limas' },
        ],
        correct: 'rumus',
        umpan: {
          rumus:
            'Tepat! Luas jajargenjang/trapesium = ½ × (jumlah sisi sejajar) × tinggi = ½ × keliling alas × tₛ.',
          tanpa:
            'Ingat, bangun ini tersusun dari SEGITIGA. Luasnya ½ × jumlah sisi sejajar × tinggi.',
          tambah: 'Luas diperoleh dengan MENGALIKAN, bukan menjumlahkan panjang.',
          limas: 'Tinggi bangun gabungan adalah tₛ, bukan tinggi limas.',
        },
      },
    ],
    temuan:
      'Semua sisi tegak limas beraturan dapat disusun menjadi jajargenjang/trapesium dengan jumlah sisi sejajar = keliling alas dan tinggi = tₛ. Jadi luas semua sisi tegak = ½ × keliling alas × tₛ.',
    nextLabel: 'Lanjut ke Mengolah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGOLAH DATA
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 5 · Mengolah Data',
    syntax: 'Discovery Learning · Sintaks 4 (Data Processing)',
    goal: 'Mengolah data luas alas dan luas sisi tegak tiga limas untuk menemukan pola luas permukaan.',
    guru: 'Murid bisa bekerja berpasangan: satu menghitung, satu memeriksa. Setelah ketiga kartu benar, bahas mengapa ½ × K × tₛ tidak langsung dipakai pada tenda mainan (tₛ tidak sama).',
    instruksiData:
      'Lengkapi kartu data ketiga benda. Luas permukaan diisi dengan menjumlahkan luas alas dan jumlah luas sisi tegak.',
    limasIds: ['persegi', 'kecil', 'tenda'],
    instruksiPola: 'Perhatikan ketiga kartu datamu, lalu jawab pertanyaan berikut.',
    konsep: [
      {
        id: 'k1',
        tanya: 'Pada ketiga benda, luas permukaan selalu sama dengan …',
        opsi: [
          { id: 'rumus', label: 'luas alas + jumlah luas sisi tegak' },
          { id: 'dua', label: '2 × luas alas + jumlah luas sisi tegak' },
          { id: 'tegak', label: 'jumlah luas sisi tegak saja' },
          { id: 'volume', label: '⅓ × luas alas × tinggi limas' },
        ],
        correct: 'rumus',
        umpan: {
          rumus: 'Tepat! Satu sisi alas ditambah semua sisi tegak.',
          dua: 'Limas tidak punya sisi tutup, jadi luas alas tidak dikali 2. Periksa kartumu: 100 + 260 = 360.',
          tegak: 'Periksa kartumu: masih ada sisi alas yang ikut dihitung.',
          volume: 'Coba hitung: lampion persegi ⅓ × 100 × 12 = 400, padahal luas permukaannya 360.',
        },
      },
      {
        id: 'k2',
        tanya:
          'Pada lampion persegi dan tudung lilin, mengapa jumlah luas sisi tegak sama dengan ½ × K × tₛ?',
        opsi: [
          {
            id: 'kongruen',
            label: 'Karena semua sisi tegaknya segitiga kongruen dengan tinggi tₛ yang sama',
          },
          { id: 'persegi', label: 'Karena alasnya selalu persegi' },
          { id: 'kebetulan', label: 'Hanya kebetulan untuk angka-angka ini' },
          { id: 'tinggi', label: 'Karena tₛ selalu sama dengan tinggi limas' },
        ],
        correct: 'kongruen',
        umpan: {
          kongruen:
            'Tepat! n segitiga beralas s dan bertinggi tₛ: n × ½ × s × tₛ = ½ × (n × s) × tₛ = ½ × K × tₛ.',
          persegi:
            'Di tahap Susun, rumus ini juga berlaku untuk lampion segitiga dan segienam. Yang penting: semua sisi tegaknya kongruen.',
          kebetulan: 'Bukan kebetulan: n × ½ × s × tₛ selalu sama dengan ½ × (n × s) × tₛ.',
          tinggi: 'tₛ selalu LEBIH PANJANG daripada tinggi limas (13 cm vs 12 cm, 5 cm vs 4 cm).',
        },
      },
      {
        id: 'k3',
        tanya:
          'Pada tenda mainan (limas persegi panjang), mengapa ½ × K × tₛ tidak bisa langsung dipakai?',
        opsi: [
          {
            id: 'beda',
            label: 'Karena tinggi segitiga sisi tegaknya tidak sama (13 cm dan 15 cm)',
          },
          { id: 'alas', label: 'Karena luas alasnya terlalu besar' },
          { id: 'bisa', label: 'Bisa dipakai, hasilnya sama saja' },
          { id: 'segitiga', label: 'Karena sisi tegaknya bukan segitiga' },
        ],
        correct: 'beda',
        umpan: {
          beda: 'Tepat! Sisi tegaknya berpasangan dengan tinggi berbeda, jadi luasnya dihitung per pasang: 2 × ½ × 18 × 13 + 2 × ½ × 10 × 15 = 384 cm².',
          alas: 'Besar kecilnya alas tidak menjadi masalah. Bandingkan tinggi segitiga-segitiga sisi tegaknya.',
          bisa: 'Coba hitung: ½ × 56 × 13 = 364 dan ½ × 56 × 15 = 420, padahal jumlah luas sisi tegaknya 384.',
          segitiga: 'Sisi tegaknya tetap segitiga. Bandingkan tinggi segitiga-segitiganya.',
        },
      },
    ],
    instruksiPilah:
      'Pak Dimas menulis beberapa bagian perhitungan untuk lampion. Pilah: apakah bagian ini termasuk luas permukaan limas?',
    opsiKlas: [
      { id: 'masuk', label: 'Termasuk luas permukaan' },
      { id: 'bukan', label: 'Bukan bagian luas permukaan' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: 'Luas sisi alas',
        correct: 'masuk',
        explanation: 'Sisi alas adalah salah satu sisi limas, jadi luasnya ikut dihitung.',
      },
      {
        id: 'p2',
        teks: 'Jumlah luas semua segitiga sisi tegak',
        correct: 'masuk',
        explanation: 'Semua sisi tegak menutupi limas, jadi luasnya dijumlahkan.',
      },
      {
        id: 'p3',
        teks: '½ × keliling alas × tinggi sisi tegak (limas beraturan)',
        correct: 'masuk',
        explanation: 'Ini cara cepat menghitung jumlah luas semua sisi tegak limas beraturan.',
      },
      {
        id: 'p4',
        teks: 'Luas sisi tutup (sama dengan luas alas)',
        correct: 'bukan',
        explanation: 'Limas tidak punya sisi tutup. Di atasnya hanya ada titik puncak.',
      },
      {
        id: 'p5',
        teks: '½ × keliling alas × tinggi limas',
        correct: 'bukan',
        explanation: 'Tinggi limas bukan tinggi segitiga sisi tegak. Luas sisi tegak memakai tₛ.',
      },
      {
        id: 'p6',
        teks: '⅓ × luas alas × tinggi limas',
        correct: 'bukan',
        explanation: 'Itu volume (isi) limas, bukan luas kertas pembungkusnya.',
      },
    ],
    temuan:
      'Luas permukaan limas = luas alas + jumlah luas sisi tegak. Pada limas beraturan: LP = luas alas + ½ × keliling alas × tₛ.',
    nextLabel: 'Lanjut ke Pembuktian →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    syntax: 'Discovery Learning · Sintaks 5 (Verification)',
    goal: 'Membuktikan dugaan rumus pada limas baru dengan dua cara dan menanggapi pendapat teman.',
    guru: 'Ingatkan teorema Pythagoras dari kelas VIII: segitiga TOP siku-siku di O. Minta murid mengerjakan kedua cara, lalu bandingkan hasilnya di depan kelas. Pada bagian miskonsepsi, minta murid menjelaskan letak kesalahan teman dengan kata-katanya sendiri.',
    limas: {
      id: 'hadiah',
      nama: '🎁 Kotak hadiah limas',
      n: 4,
      s: 16,
      t: 15,
    },
    cerita:
      'Untuk hadiah juara lomba lampion, panitia membuat kotak hadiah berbentuk limas persegi. Rusuk alasnya 16 cm dan tinggi limasnya (TO) 15 cm. Tinggi segitiga sisi tegaknya (TP) belum diketahui.',
    instruksiTinggi: 'Langkah awal — cari tinggi segitiga sisi tegak (tₛ = TP).',
    langkahTinggi: [
      {
        id: 'h1',
        label: 'OP = jarak pusat alas ke tengah rusuk alas = ½ × 16 = … cm',
        kunci: 'apotema',
        hints: ['P di tengah rusuk alas, O di tengah persegi. Jaraknya setengah rusuk alas.'],
      },
      {
        id: 'h2',
        label: 'Segitiga TOP siku-siku di O, jadi tₛ = TP = √(15² + 8²) = √289 = … cm',
        kunci: 'tinggiSisi',
        hints: ['15² = 225 dan 8² = 64, jumlahnya 289.', 'Bilangan berapa yang kuadratnya 289?'],
      },
    ],
    instruksiJumlah: 'Cara 1 — jumlahkan luas semua sisi satu per satu.',
    langkahJumlah: [
      {
        id: 'j1',
        label: 'Luas sisi alas = 16 × 16 = … cm²',
        kunci: 'luasAlas',
        hints: ['Luas persegi = sisi × sisi.'],
      },
      {
        id: 'j2',
        label: 'Luas satu segitiga sisi tegak = ½ × 16 × 17 = … cm²',
        kunci: 'luasSatuSisi',
        hints: ['Luas segitiga = ½ × alas × tinggi; tingginya tₛ = 17 cm.'],
      },
      {
        id: 'j3',
        label: 'Luas semua sisi = luas alas + 4 × luas satu sisi tegak = … cm²',
        kunci: 'jumlahSemua',
        hints: ['256 + 4 × 136.'],
      },
    ],
    instruksiRumus: 'Cara 2 — gunakan dugaan rumus dari tahap sebelumnya.',
    langkahRumus: [
      {
        id: 'r1',
        label: 'Keliling alas = 4 × 16 = … cm',
        kunci: 'keliling',
        hints: ['Jumlahkan keempat rusuk alas.'],
      },
      {
        id: 'r2',
        label: 'Luas permukaan = La + ½ × K × tₛ = 256 + ½ × 64 × 17 = … cm²',
        kunci: 'rumus',
        hints: ['½ × 64 = 32 dan 32 × 17 = 544.'],
      },
    ],
    temuanSama:
      'Kedua cara menghasilkan 800 cm². Dugaan rumus LP = luas alas + ½ × keliling alas × tₛ terbukti pada limas baru!',
    instruksiMiskonsepsi:
      'Tiga temanmu menghitung luas kertas kado untuk kotak hadiah itu. Tanggapi pendapat mereka.',
    soal: [
      {
        id: 'm1',
        teks: 'Raka: “Luas permukaannya 256 + 64 × 17 = 1.344 cm².”',
        nilaiTeman: 1344,
        miskonsepsi: 'lupa-setengah',
        options: [
          { id: 'a', label: 'Kurang tepat, sisi tegaknya segitiga sehingga harus dikali ½' },
          { id: 'b', label: 'Sudah tepat, sama seperti rumus prisma' },
          { id: 'c', label: 'Kurang tepat, luas alas seharusnya dikali 2' },
          { id: 'd', label: 'Kurang tepat, seharusnya memakai tinggi limas 15 cm' },
        ],
        correct: 'a',
        explanation:
          'Sisi tegak limas berbentuk segitiga, jadi luas semuanya ½ × 64 × 17 = 544 cm². LP = 256 + 544 = 800 cm².',
      },
      {
        id: 'm2',
        teks: 'Sinta: “256 + ½ × 64 × 15 = 736 cm², karena tinggi limasnya 15 cm.”',
        nilaiTeman: 736,
        miskonsepsi: 'tinggi-limas',
        options: [
          {
            id: 'a',
            label: 'Kurang tepat, luas segitiga sisi tegak memakai tₛ = 17 cm, bukan tinggi limas',
          },
          { id: 'b', label: 'Sudah tepat, tinggi limas dan tinggi sisi tegak sama saja' },
          { id: 'c', label: 'Kurang tepat, ½ tidak perlu dipakai' },
          { id: 'd', label: 'Kurang tepat, luas alas tidak ikut dihitung' },
        ],
        correct: 'a',
        explanation:
          'Tinggi limas (TO) ada di dalam kotak. Segitiga sisi tegak memakai tingginya sendiri, TP = 17 cm, yang lebih panjang daripada TO.',
      },
      {
        id: 'm3',
        teks: 'Dimas: “2 × 256 + ½ × 64 × 17 = 1.056 cm², seperti prisma.”',
        nilaiTeman: 1056,
        miskonsepsi: 'dua-alas',
        options: [
          {
            id: 'a',
            label: 'Kurang tepat, limas hanya punya satu sisi alas dan tidak punya tutup',
          },
          { id: 'b', label: 'Sudah tepat, semua bangun ruang punya dua alas' },
          { id: 'c', label: 'Kurang tepat, keliling alas seharusnya dikali 2' },
          { id: 'd', label: 'Kurang tepat, tₛ seharusnya dikali 2' },
        ],
        correct: 'a',
        explanation:
          'Berbeda dengan prisma, di atas limas hanya ada titik puncak. Luas alas dihitung satu kali: 256 + 544 = 800 cm².',
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
    goal: 'Menyusun kesimpulan tentang rumus luas permukaan limas dari temuan sendiri.',
    guru: 'Setelah kesimpulan tepat, minta beberapa murid membacakannya dan menuliskan rumus di buku catatan beserta gambar jaring-jaringnya. Bandingkan dengan rumus luas permukaan prisma dari materi 22.2.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari pilihan. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'g1', awal: 'Luas permukaan limas adalah', correct: 'jumlah' },
      {
        id: 'g2',
        awal: 'Limas hanya punya satu sisi alas dan tidak punya tutup, sehingga luas alas dihitung',
        correct: 'sekali',
      },
      {
        id: 'g3',
        awal: 'Semua sisi tegak limas beraturan dapat disusun menjadi bangun dengan jumlah sisi sejajar = keliling alas dan tinggi = tₛ, sehingga luas semua sisi tegak adalah',
        correct: 'tegak',
      },
      { id: 'g4', awal: 'Jadi, rumus luas permukaan limas beraturan adalah', correct: 'rumus' },
    ],
    bank: [
      { id: 'jumlah', teks: 'jumlah luas sisi alas dan semua sisi tegaknya.' },
      { id: 'sekali', teks: 'satu kali saja (tidak dikali 2).' },
      { id: 'tegak', teks: '½ × keliling alas × tinggi sisi tegak.' },
      { id: 'rumus', teks: 'LP = La + ½ × K × tₛ.' },
      { id: 'dua', teks: 'LP = 2 × La + ½ × K × tₛ.' },
      { id: 'volume', teks: '⅓ × luas alas × tinggi limas.' },
      { id: 'tinggi', teks: '½ × keliling alas × tinggi limas.' },
    ],
    rangkuman: [
      'Luas permukaan limas = jumlah luas semua sisinya (luas kertas pembungkusnya).',
      'Limas punya <strong>satu</strong> sisi alas; luas alas dihitung sekali.',
      'Sisi tegak limas berbentuk segitiga. Tingginya adalah <strong>tinggi sisi tegak tₛ</strong>, bukan tinggi limas: tₛ² = t² + (jarak pusat alas ke rusuk alas)².',
      'Pada limas beraturan, semua sisi tegak kongruen: <strong>jumlah luas sisi tegak = ½ × K × tₛ</strong>.',
      '<strong>LP = La + ½ × K × tₛ</strong>, dengan La = luas alas, K = keliling alas, tₛ = tinggi sisi tegak. Bila sisi tegaknya tidak kongruen, jumlahkan luas setiap segitiga.',
    ],
    dugaanJudul: 'Bandingkan dengan dugaan awalmu',
    tanggapanDugaan: {
      jumlah:
        'Dugaanmu tepat! Luas kertas memang jumlah luas sisi alas dan semua sisi tegak. Sekarang kamu punya cara cepatnya: La + ½ × K × tₛ.',
      prisma:
        'Rumus prisma ternyata tidak cocok: limas hanya punya satu alas dan sisi tegaknya segitiga. Rumus limas: La + ½ × K × tₛ.',
      volume:
        '⅓ × luas alas × tinggi ternyata adalah volume (isi) limas. Kertas dihitung dari luas semua sisinya: La + ½ × K × tₛ.',
      rusuk:
        'Panjang rusuk berguna untuk membuat kerangka lampion. Kertas dihitung dari luas semua sisi: La + ½ × K × tₛ.',
    },
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Discovery Learning · Penerapan',
    goal: 'Menggunakan rumus luas permukaan limas untuk menyelesaikan masalah sehari-hari.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang banyak salah (terutama benda tanpa alas, tinggi limas vs tₛ, dan mencari tₛ) untuk dibahas bersama.',
    instruksi:
      'Kerjakan setiap soal. Bila ragu, buka petunjuk. Setelah menjawab, baca penjelasannya sebelum lanjut.',
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: '🏮 Lampion gerbang',
        cerita:
          'Lampion besar di gerbang sekolah berbentuk limas persegi dengan rusuk alas 20 cm. Tinggi lampion 24 cm dan tinggi segitiga sisi tegaknya 26 cm. Seluruh permukaannya ditutup kertas minyak.',
        pertanyaan: 'Berapa cm² kertas minyak yang dibutuhkan?',
        cek: { luasAlas: 400, kelilingAlas: 80, tinggiSisi: 26, tinggiLimas: 24, sisiAlas: 20 },
        jawab: 1440,
        satuan: 'cm²',
        hints: [
          'Luas alas = 20 × 20 = 400 cm²; keliling alas = 80 cm.',
          'Pakai tinggi sisi tegak 26 cm, bukan tinggi lampion. LP = 400 + ½ × 80 × 26.',
        ],
        explanation: 'LP = 400 + ½ × 80 × 26 = 400 + 1.040 = 1.440 cm².',
      },
      {
        id: 't2',
        type: 'choice',
        konteks: '⛺ Tenda piramida',
        cerita:
          'Tenda piramida berbentuk limas persegi TANPA ALAS (lantainya tanah). Rusuk alasnya 3 m dan tinggi segitiga sisi tegaknya 2,5 m.',
        pertanyaan: 'Berapa m² kain yang dibutuhkan?',
        cek: { luasAlas: 9, kelilingAlas: 12, tinggiSisi: 2.5, tanpaAlas: true },
        options: [
          { id: 'benar', label: '15 m²' },
          { id: 'pakai-alas', label: '24 m²' },
          { id: 'lupa-setengah', label: '30 m²' },
          { id: 'tambah-keliling', label: '27 m²' },
        ],
        correct: 'benar',
        hints: [
          'Tanpa alas berarti hanya sisi tegak yang dihitung.',
          'Luas sisi tegak = ½ × 12 × 2,5.',
        ],
        explanation: 'Hanya sisi tegak: ½ × 12 × 2,5 = 15 m².',
      },
      {
        id: 't3',
        type: 'input',
        konteks: '🏠 Atap joglo',
        cerita:
          'Atap sebuah pendopo berbentuk limas persegi tanpa alas dengan rusuk alas 8 m dan tinggi atap 3 m. Atap akan dilapisi genteng.',
        pertanyaan: 'Berapa m² permukaan atap yang dilapisi genteng?',
        cek: {
          luasAlas: 64,
          kelilingAlas: 32,
          tinggiSisi: 5,
          tinggiLimas: 3,
          sisiAlas: 8,
          tanpaAlas: true,
        },
        jawab: 80,
        satuan: 'm²',
        hints: [
          'Cari dulu tₛ dengan Pythagoras: jarak pusat ke rusuk alas = 4 m, jadi tₛ = √(3² + 4²).',
          'tₛ = 5 m. Atap tanpa alas: luas = ½ × 32 × 5.',
        ],
        explanation: 'tₛ = √(9 + 16) = 5 m. Luas atap = ½ × 32 × 5 = 80 m².',
      },
      {
        id: 't4',
        type: 'choice',
        konteks: '🎁 Kotak kado segitiga',
        cerita:
          'Kotak kado berbentuk limas segitiga beraturan. Luas alasnya 35 cm² (dibulatkan), keliling alasnya 27 cm, dan tinggi segitiga sisi tegaknya 10 cm.',
        pertanyaan: 'Berapa luas kertas kado minimal untuk menutup seluruh permukaannya?',
        cek: { luasAlas: 35, kelilingAlas: 27, tinggiSisi: 10 },
        options: [
          { id: 'benar', label: '170 cm²' },
          { id: 'lupa-setengah', label: '305 cm²' },
          { id: 'dua-alas', label: '205 cm²' },
          { id: 'tanpa-alas', label: '135 cm²' },
        ],
        correct: 'benar',
        hints: ['Rumusnya berlaku untuk alas segi berapa pun: LP = La + ½ × K × tₛ.'],
        explanation: 'LP = 35 + ½ × 27 × 10 = 35 + 135 = 170 cm².',
      },
      {
        id: 't5',
        type: 'input',
        konteks: '📐 Tinggi sisi tegak',
        cerita:
          'Hiasan meja berbentuk limas persegi dengan rusuk alas 12 cm. Luas permukaannya 384 cm².',
        pertanyaan: 'Berapa cm tinggi segitiga sisi tegaknya?',
        cek: { luasAlas: 144, kelilingAlas: 48, luasPermukaan: 384, cari: 'tinggiSisi' },
        jawab: 10,
        satuan: 'cm',
        hints: [
          'Luas alas = 12 × 12 = 144 cm²; keliling alas = 48 cm.',
          '384 = 144 + ½ × 48 × tₛ, jadi 24 × tₛ = 240.',
        ],
        explanation: '384 = 144 + 24 × tₛ → 24 × tₛ = 240 → tₛ = 10 cm.',
      },
      {
        id: 't6',
        type: 'choice',
        konteks: '🏛️ Menara segilima',
        cerita:
          'Hiasan menara berbentuk limas segilima beraturan dengan luas alas 55 cm², keliling alas 30 cm, dan tinggi segitiga sisi tegak 12 cm.',
        pertanyaan: 'Perhitungan mana yang tepat untuk luas permukaannya?',
        cek: { luasAlas: 55, kelilingAlas: 30, tinggiSisi: 12, cari: 'rumus' },
        options: [
          { id: 'benar', label: '55 + ½ × 30 × 12' },
          { id: 'lupa-setengah', label: '55 + 30 × 12' },
          { id: 'dua-alas', label: '2 × 55 + ½ × 30 × 12' },
          { id: 'volume', label: '⅓ × 55 × 12' },
        ],
        correct: 'benar',
        hints: ['Ingat: satu sisi alas, lalu semua sisi tegak = ½ × keliling × tₛ.'],
        explanation: 'LP = La + ½ × K × tₛ = 55 + ½ × 30 × 12 = 55 + 180 = 235 cm².',
      },
      {
        id: 't7',
        type: 'input',
        konteks: '🎀 Kotak kado persegi panjang',
        cerita:
          'Kotak kado berbentuk limas dengan alas persegi panjang 30 cm × 12 cm. Dua segitiga sisi tegak yang beralas 30 cm tingginya 10 cm, sedangkan dua segitiga yang beralas 12 cm tingginya 17 cm.',
        pertanyaan: 'Berapa cm² luas permukaan kotak kado itu?',
        cek: {
          rincian: {
            alas: [
              [0, 0],
              [30, 0],
              [30, 12],
              [0, 12],
            ],
            ts: [10, 17, 10, 17],
          },
        },
        jawab: 864,
        satuan: 'cm²',
        hints: [
          'Tinggi sisi tegaknya tidak sama, jadi hitung per pasang segitiga.',
          'Luas alas 360 cm²; sisi tegak = 2 × ½ × 30 × 10 + 2 × ½ × 12 × 17.',
        ],
        explanation: 'LP = 360 + 300 + 204 = 864 cm².',
      },
      {
        id: 't8',
        type: 'input',
        konteks: '💰 Biaya kertas',
        cerita:
          'Lampion persegi dibuat TANPA ALAS agar lampu bisa dimasukkan dari bawah. Rusuk alasnya 10 cm dan tinggi segitiga sisi tegaknya 13 cm. Harga kertas minyak Rp5 per cm².',
        pertanyaan: 'Berapa rupiah biaya kertas untuk satu lampion?',
        cek: { luasAlas: 100, kelilingAlas: 40, tinggiSisi: 13, tanpaAlas: true, hargaPerCm2: 5 },
        jawab: 1300,
        satuan: 'rupiah',
        hints: [
          'Hitung dulu luas sisi tegaknya: ½ × 40 × 13.',
          'Luasnya 260 cm², lalu kalikan dengan Rp5.',
        ],
        explanation: 'Luas kertas = ½ × 40 × 13 = 260 cm². Biaya = 260 × Rp5 = Rp1.300.',
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
    goal: 'Merefleksikan proses menemukan rumus luas permukaan limas.',
    guru: 'Baca beberapa refleksi murid (dengan izin) untuk menutup pelajaran. Tanyakan: “Apa bedanya rumus luas permukaan limas dengan prisma?”',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Jelaskan dengan kata-katamu sendiri mengapa luas semua sisi tegak limas beraturan = ½ × keliling alas × tₛ.',
        placeholder: 'Karena sisi-sisi tegaknya …',
      },
      {
        id: 'q2',
        teks: 'Apa perbedaan tinggi limas dan tinggi sisi tegak? Mana yang dipakai untuk luas permukaan?',
        placeholder: 'Tinggi limas adalah …',
      },
      {
        id: 'q3',
        teks: 'Di mana lagi kamu bisa memakai luas permukaan limas dalam kehidupan sehari-hari?',
        placeholder: 'Misalnya saat …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menentukan luas permukaan limas sekarang?',
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
    teks: 'Sekarang Pak Dimas bisa menghitung kertas untuk lampion limas apa pun, cukup dari luas alas, keliling alas, dan tinggi sisi tegaknya.',
    capaian: [
      'Membuka lampion menjadi jaring-jaring dan menghitung luas setiap sisinya.',
      'Membedakan tinggi limas dengan tinggi sisi tegak dan menghitung tₛ dengan Pythagoras.',
      'Menemukan bahwa semua sisi tegak limas beraturan tersusun menjadi bangun berluas ½ × keliling alas × tₛ.',
      'Menemukan dan membuktikan rumus LP = luas alas + ½ × keliling alas × tₛ.',
      'Menggunakan rumus luas permukaan untuk lampion, tenda, atap, dan biaya kertas.',
    ],
  },
};
