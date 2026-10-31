'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Hubungan Luas Persegi pada Sisi Segitiga Siku-siku
   — Fase D, SMP Kelas VIII (Topik 19: Teorema Pythagoras)

   Tujuan Pembelajaran:
   Menganalisis hubungan luas persegi pada sisi-sisi segitiga
   siku-siku melalui eksplorasi kotak-kotak persegi untuk merumuskan
   dugaan teorema Pythagoras.

   Model pembelajaran: INQUIRY LEARNING (Inkuiri Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Orientasi .................. 'orientasi'
     Sintaks 2 — Merumuskan masalah ......... 'masalah'
     Sintaks 3 — Merumuskan hipotesis ....... 'hipotesis'
     Sintaks 4 — Mengumpulkan data .......... 'dataHitung', 'dataTabel' & 'dataBanding'
     Sintaks 5 — Menguji hipotesis .......... 'uji'
     Sintaks 6 — Merumuskan kesimpulan ...... 'simpulan'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Orientasi   (7')  — "Taman Ubin OSIS": petak taman segitiga
                            siku-siku dengan kolam persegi berubin di
                            setiap sisinya. Murid MENDUGA banyak ubin
                            kolam terbesar dan hubungannya (tidak dinilai).
     2. Masalah     (4')  — memilih rumusan masalah penyelidikan.
     3. Hipotesis   (6')  — memilih dugaan tentang hubungan luas ketiga
                            persegi, lalu menulis hipotesis sendiri.
     4a. Data 1     (15') — Lab Kotak Persegi: mengatur kaki segitiga
                            siku-siku di kertas berpetak, menghitung petak
                            persegi kaki, lalu persegi miring dengan
                            STRATEGI BINGKAI (bingkai − 4 segitiga pojok);
                            isian berdiagnosa miskonsepsi; minimal tiga
                            percobaan dicatat.
     4b. Data 2     (8')  — Tabel Data: hasil lab + dua segitiga besar
                            (5–12, 8–15) dilengkapi kolom La + Lb, lalu
                            pertanyaan temuan pola.
     4c. Data 3     (10') — Pembanding: segitiga lancip, tumpul, dan
                            siku-siku miring; luas ketiga persegi diukur
                            lalu La + Lb dibandingkan dengan Lc.
     5. Uji         (7')  — pernyataan benar/salah, lalu dugaan &
                            hipotesis dibandingkan dengan data.
     6. Simpulan    (5')  — menyusun dugaan teorema Pythagoras dari bank
                            kalimat (ada pengecoh).
     7. Uji terap   (12') — delapan soal pilihan ganda diambil acak dari
                            bank delapan belas soal sesuai komposisi.
     8. Refleksi    (6')  — rekap, menjelaskan dugaan dengan kata sendiri,
                            penilaian diri.

   Segitiga ditulis sebagai { titik, pts } berkoordinat bulat (engine
   seksi 86). Kunci luas, jenis segitiga pembanding, dan uji terap
   dihitung ulang oleh engine dan dicocokkan di
   tests/mpi-19.1-data.test.js.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Soal uji terap juga
   diambil acak dari bank dan opsinya dibangun engine (opsiSoalPythagoras)
   lalu diacak.
   ============================================================ */

var IL = 'Inquiry Learning';

/* Pilihan hubungan La + Lb terhadap Lc (dipakai tahap pembanding). */
var OPSI_RELASI = [
  { id: 'sama', label: 'Luas kedua persegi kecil dijumlahkan SAMA DENGAN luas persegi terbesar' },
  {
    id: 'lebih',
    label: 'Luas kedua persegi kecil dijumlahkan LEBIH BESAR DARIPADA luas persegi terbesar',
  },
  {
    id: 'kurang',
    label: 'Luas kedua persegi kecil dijumlahkan LEBIH KECIL DARIPADA luas persegi terbesar',
  },
];

var DATA = {
  meta: {
    judul: 'Hubungan Luas Persegi pada Sisi Segitiga Siku-siku',
  },

  tahap: [
    { id: 'orientasi', label: 'Orientasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'hipotesis', label: 'Hipotesis' },
    { id: 'dataHitung', label: 'Lab Persegi' },
    { id: 'dataTabel', label: 'Tabel Data' },
    { id: 'dataBanding', label: 'Pembanding' },
    { id: 'uji', label: 'Uji Hipotesis' },
    { id: 'simpulan', label: 'Simpulan' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Uji Hipotesis.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    syntax: IL + ' · Sintaks 1',
    goal: 'Mengamati petak taman segitiga siku-siku dengan kolam persegi berubin di setiap sisinya, lalu menduga hubungan luasnya.',
    tp: 'Menganalisis hubungan luas persegi pada sisi-sisi segitiga siku-siku melalui eksplorasi kotak-kotak persegi untuk merumuskan dugaan teorema Pythagoras.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menghitung luas persegi pada sisi tegak dan mendatar dengan membilang petak satuan.',
      'Menghitung luas persegi miring dengan strategi bingkai (luas bingkai dikurangi empat segitiga pojok).',
      'Mencatat dan menganalisis data luas ketiga persegi pada beberapa segitiga siku-siku untuk menemukan polanya.',
      'Membandingkan pola itu dengan segitiga lancip dan tumpul untuk menunjukkan bahwa pola hanya berlaku pada segitiga siku-siku.',
      'Merumuskan dugaan teorema Pythagoras: luas persegi sisi miring = jumlah luas persegi kedua sisi siku-siku (a² + b² = c²).',
    ],
    guru: 'Tampilkan gambar taman di layar. Minta pasangan murid mengamati tanpa menghitung lebih dulu, lalu memilih dugaannya dalam 2 menit. Jangan membenarkan atau menyalahkan — perbedaan dugaan ("pasti 7, karena 3 + 4!") menjadi bahan penyelidikan.',
    judul: 'Taman Ubin OSIS',
    pengantar:
      'OSIS membuat taman di pojok sekolah. Petak tanamannya berbentuk segitiga siku-siku dengan sisi tegak 4 petak dan sisi mendatar 3 petak. Pada setiap sisi segitiga dibuat kolam berbentuk persegi yang dasarnya dilapisi ubin 1 × 1. Kak Raya, bendahara OSIS, harus memesan ubin untuk kolam terbesar — yang miring — tetapi bingung cara menghitungnya.',
    kaki: [3, 4],
    dugaan: [
      {
        id: 'dUbin',
        tanya:
          'Menurutmu, berapa ubin yang diperlukan untuk kolam persegi terbesar (pada sisi miring)?',
        opsi: [
          { id: 'u25', label: '25 ubin' },
          { id: 'u7', label: '7 ubin' },
          { id: 'u49', label: '49 ubin' },
          { id: 'u12', label: '12 ubin' },
        ],
        baku: 'u25',
        pembahasan:
          'Di Lab Kotak Persegi, bingkai 7 × 7 = 49 petak dikurangi empat segitiga pojok (4 × 6 = 24) menghasilkan 25 petak.',
      },
      {
        id: 'dHubungan',
        tanya: 'Luas kolam terbesar dibandingkan dengan dua kolam lainnya kira-kira …',
        opsi: [
          { id: 'jumlah', label: 'sama dengan jumlah luas kedua kolam lainnya' },
          { id: 'selisih', label: 'sama dengan selisih luas kedua kolam lainnya' },
          { id: 'dua', label: 'dua kali luas kolam yang paling besar di antara keduanya' },
          { id: 'acak', label: 'tidak ada hubungan yang tetap' },
        ],
        baku: 'jumlah',
        pembahasan:
          'Pada segitiga 3–4: 9 + 16 = 25. Di Tabel Data, pola "jumlah" ini muncul pada SETIAP segitiga siku-siku.',
      },
      {
        id: 'dSisi',
        tanya: 'Apakah panjang sisi miring sama dengan 3 + 4 = 7 petak?',
        opsi: [
          { id: 'tidak', label: 'Tidak, sisi miring lebih pendek dari 7 petak' },
          { id: 'ya', label: 'Ya, tepat 7 petak' },
          { id: 'lebih', label: 'Tidak, sisi miring lebih panjang dari 7 petak' },
        ],
        baku: 'tidak',
        pembahasan:
          'Persegi sisi miring berluas 25, jadi sisinya 5 petak (5 × 5 = 25), lebih pendek dari 7. Panjang sisi tidak dijumlahkan langsung.',
      },
    ],
    alasanLabel: 'Tuliskan alasan dugaanmu (boleh singkat):',
    alasanPlaceholder: 'Menurutku kolam terbesar butuh … ubin karena …',
    catatan:
      'Dugaanmu tidak dinilai. Simpan baik-baik — kamu akan mengujinya sendiri dengan data di tahap Uji Hipotesis.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MERUMUSKAN MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: IL + ' · Sintaks 2',
    goal: 'Memilih pertanyaan penyelidikan yang tepat dari masalah kolam taman.',
    guru: 'Ajak murid membedakan pertanyaan penyelidikan (hubungan yang berlaku umum) dengan pertanyaan hitung satu kolam saja. Biarkan murid mencoba lagi bila memilih yang kurang tepat.',
    pengantar:
      'Kak Raya tidak hanya ingin tahu satu kolam. Taman berikutnya bisa berukuran lain. Ia ingin cara yang selalu berlaku. Rumuskan dulu pertanyaan yang akan diselidiki.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'hubungan',
        label:
          'Bagaimana hubungan luas persegi pada sisi miring dengan luas persegi pada kedua sisi lain sebuah segitiga siku-siku?',
      },
      { id: 'harga', label: 'Berapa harga ubin yang harus dibeli OSIS?' },
      { id: 'warna', label: 'Warna ubin apa yang paling cocok untuk kolam taman?' },
      { id: 'keliling', label: 'Berapa keliling petak taman berbentuk segitiga itu?' },
    ],
    correct: 'hubungan',
    umpan: {
      hubungan:
        'Tepat! Pertanyaan ini menuntun kita mencari hubungan yang berlaku untuk SEMUA segitiga siku-siku — bukan hanya taman ini.',
      harga:
        'Harga ubin bergantung pada toko. Yang membingungkan Kak Raya adalah banyak ubin (luas) kolam miring dan hubungannya dengan kolam lain.',
      warna: 'Warna memang penting untuk keindahan, tetapi bukan masalah matematikanya.',
      keliling:
        'Keliling taman tidak membantu menghitung ubin kolam. Kita menyelidiki LUAS persegi pada setiap sisi.',
    },
    nextLabel: 'Lanjut: Rumuskan Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MERUMUSKAN HIPOTESIS
     Pilihan dugaan TIDAK dinilai; dibandingkan dengan data di tahap Uji.
     ---------------------------------------------------------- */
  hipotesis: {
    kicker: 'Tahap 3 · Merumuskan Hipotesis',
    syntax: IL + ' · Sintaks 3',
    goal: 'Menyusun dugaan sementara tentang hubungan luas ketiga persegi pada segitiga siku-siku.',
    guru: 'Tekankan bahwa hipotesis adalah dugaan yang akan diuji, jadi tidak ada pilihan yang "dihukum". Minta setiap pasangan menulis satu kalimat hipotesis dengan bahasa sendiri, misalnya memakai La, Lb, dan Lc.',
    pengantar:
      'Sebut luas persegi pada dua sisi yang mengapit sudut siku-siku La dan Lb, dan luas persegi pada sisi miring Lc. Jawab dugaan berikut sesuai pendapatmu sekarang, lalu tulis hipotesismu.',
    dugaan: [
      {
        id: 'hRumus',
        tanya: 'Hubungan mana yang menurutmu berlaku pada setiap segitiga siku-siku?',
        opsi: [
          { id: 'jumlah', label: 'La + Lb = Lc' },
          { id: 'kali', label: 'La × Lb = Lc' },
          { id: 'selisih', label: 'Lb − La = Lc' },
          { id: 'sisi', label: 'Panjang sisi: a + b = c' },
        ],
        baku: 'jumlah',
        pembahasan:
          'Di Tabel Data, kolom La + Lb selalu sama dengan kolom Lc, misalnya 25 + 144 = 169. Penjumlahan panjang sisi (3 + 4 ≠ 5) tidak berlaku.',
      },
      {
        id: 'hTerbesar',
        tanya: 'Persegi terbesar selalu berada pada sisi …',
        opsi: [
          { id: 'miring', label: 'di depan sudut siku-siku (sisi miring)' },
          { id: 'alas', label: 'yang mendatar (alas)' },
          { id: 'tegak', label: 'yang tegak' },
        ],
        baku: 'miring',
        pembahasan:
          'Di setiap percobaan Lab, persegi pada sisi CA (di depan sudut siku-siku B) selalu yang terbesar, termasuk pada segitiga siku-siku miring DEF.',
      },
      {
        id: 'hSemua',
        tanya: 'Apakah hubungan itu juga berlaku pada segitiga yang tidak siku-siku?',
        opsi: [
          { id: 'siku', label: 'Tidak, hanya pada segitiga siku-siku' },
          { id: 'semua', label: 'Ya, berlaku pada semua segitiga' },
          { id: 'samaKaki', label: 'Hanya pada segitiga sama kaki' },
        ],
        baku: 'siku',
        pembahasan:
          'Di tahap Pembanding, segitiga lancip PQR memberi 13 + 13 > 16 dan segitiga tumpul KLM memberi 4 + 13 < 29. Hanya segitiga siku-siku yang tepat sama.',
      },
    ],
    hipotesisLabel: 'Tulis hipotesismu:',
    hipotesisPlaceholder:
      'Menurutku, pada segitiga siku-siku luas persegi pada sisi miring … luas persegi pada kedua sisi lainnya.',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — LAB KOTAK PERSEGI
     Segitiga = segitigaSikuKisi(a, b) (engine seksi 86): siku-siku di
     B, kaki mendatar BC = a, kaki tegak AB = b, sisi miring CA.
     ---------------------------------------------------------- */
  dataHitung: {
    kicker: 'Tahap 4a · Lab Kotak Persegi',
    syntax: IL + ' · Sintaks 4',
    goal: 'Mengukur luas ketiga persegi pada sisi beberapa segitiga siku-siku dengan membilang petak dan strategi bingkai.',
    guru: 'Perkenalkan strategi bingkai dengan bertanya: "Persegi miring sulit dibilang petaknya. Bisakah kita mengurungnya dalam persegi tegak lalu membuang bagian yang bukan kolam?" Minta pasangan memilih ukuran kaki yang BERBEDA dari pasangan sebelahnya, agar data kelas lebih beragam.',
    pengantar:
      'Atur panjang kedua kaki segitiga siku-siku, lalu hitung luas setiap persegi (banyak petak 1 × 1 di dalamnya). Untuk persegi miring, ketuk "Tampilkan bingkai": luasnya = luas bingkai − luas keempat segitiga pojok. Catat minimal tiga segitiga yang berbeda.',
    lab: { min: 1, max: 6, awal: [3, 4], minCatat: 3 },
    petunjuk: [
      'Persegi pada sisi tegak dan mendatar: cukup bilang petaknya, atau hitung sisi × sisi.',
      'Persegi miring: bingkai berukuran (a + b) × (a + b). Setiap segitiga pojok luasnya ½ × a × b, dan ada EMPAT segitiga.',
      'Contoh a = 3, b = 4: bingkai 7 × 7 = 49, segitiga pojok 4 × 6 = 24, jadi persegi miring = 49 − 24 = 25.',
    ],
    nextLabel: 'Lanjut: Susun Tabel Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — TABEL DATA
     Baris hasil lab (isian kolom La + Lb) + baris tambahan berikut.
     Lc baris tambahan = bingkai (a + b)² − 4 × ½ab (dicek di tes).
     ---------------------------------------------------------- */
  dataTabel: {
    kicker: 'Tahap 4b · Tabel Data',
    syntax: IL + ' · Sintaks 4',
    goal: 'Menata data luas ketiga persegi dalam tabel dan menganalisis polanya.',
    guru: 'Kumpulkan beberapa baris data dari pasangan lain di papan tulis. Tanyakan: "Kolom mana yang selalu sama?" Biarkan murid yang menemukan pola, guru cukup menunjuk kolom.',
    pengantar:
      'Hasil Lab Kotak Persegi sudah masuk ke tabel. Kak Nara dari kelas IX menambahkan dua kolam besar yang ia hitung dengan bingkai. Lengkapi kolom yang kosong, lalu amati polanya.',
    judulKolom: {
      a: 'Kaki a',
      b: 'Kaki b',
      La: 'La (persegi kaki a)',
      Lb: 'Lb (persegi kaki b)',
      jumlah: 'La + Lb',
      Lc: 'Lc (persegi sisi miring)',
    },
    tambahan: [
      {
        id: 'r5x12',
        a: 5,
        b: 12,
        Lc: 169,
        catatan:
          'Kak Nara (a = 5, b = 12): bingkai 17 × 17 = 289, empat segitiga pojok 4 × 30 = 120, jadi Lc = 289 − 120 = 169.',
      },
      {
        id: 'r8x15',
        a: 8,
        b: 15,
        Lc: 289,
        catatan:
          'Kak Nara (a = 8, b = 15): bingkai 23 × 23 = 529, empat segitiga pojok 4 × 60 = 240, jadi Lc = 529 − 240 = 289.',
      },
    ],
    temuan: [
      {
        id: 'tPola',
        tanya: 'Bandingkan kolom La + Lb dengan kolom Lc pada setiap baris. Apa yang kamu temukan?',
        opsi: [
          { id: 'sama', label: 'Selalu sama besar' },
          { id: 'lebih', label: 'La + Lb selalu lebih besar daripada Lc' },
          { id: 'kurang', label: 'La + Lb selalu lebih kecil daripada Lc' },
          { id: 'kadang', label: 'Kadang sama, kadang tidak' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Tepat! Pada setiap segitiga siku-siku di tabel, La + Lb = Lc.',
          lebih: 'Periksa lagi barisnya, mis. 9 + 16 dan 25. Keduanya sama, bukan lebih besar.',
          kurang: 'Periksa lagi barisnya, mis. 25 + 144 dan 169. Keduanya sama, bukan lebih kecil.',
          kadang:
            'Cocokkan setiap baris satu per satu. Tidak ada satu baris pun yang berbeda — semuanya sama.',
        },
      },
      {
        id: 'tSisi',
        tanya:
          'Pada segitiga a = 3, b = 4, sisi miringnya 5 (karena 5 × 5 = 25). Apakah panjang sisinya juga memenuhi a + b = c?',
        opsi: [
          { id: 'tidak', label: 'Tidak, 3 + 4 = 7, bukan 5' },
          { id: 'ya', label: 'Ya, 3 + 4 = 5' },
          { id: 'kadang', label: 'Ya, tetapi hanya untuk segitiga kecil' },
          { id: 'kali', label: 'Ya, asal sisinya dikalikan dua' },
        ],
        correct: 'tidak',
        umpan: {
          tidak:
            'Tepat! Yang dijumlahkan adalah LUAS persegi (9 + 16 = 25), bukan panjang sisi (3 + 4 = 7 ≠ 5).',
          ya: 'Hitung lagi: 3 + 4 = 7, padahal sisi miringnya 5.',
          kadang: 'Untuk 5, 12, 13 juga tidak berlaku: 5 + 12 = 17 ≠ 13.',
          kali: 'Panjang sisi tidak dijumlahkan maupun dikalikan dua. Lihat kolom LUAS-nya.',
        },
      },
      {
        id: 'tTerbesar',
        tanya: 'Pada setiap baris, Lc adalah luas terbesar. Persegi itu terletak pada sisi …',
        opsi: [
          { id: 'miring', label: 'di depan sudut siku-siku (sisi miring)' },
          { id: 'panjang', label: 'kaki yang paling panjang' },
          { id: 'alas', label: 'yang selalu mendatar' },
          { id: 'acak', label: 'yang berbeda-beda, tidak tentu' },
        ],
        correct: 'miring',
        umpan: {
          miring:
            'Tepat! Sisi miring berada di depan sudut siku-siku dan merupakan sisi terpanjang segitiga siku-siku.',
          panjang:
            'Kaki terpanjang (mis. 12) masih lebih pendek dari sisi miring (13). Persegi terbesar ada di depan sudut siku-siku.',
          alas: 'Di Lab, alas BC adalah kaki. Persegi terbesar ada pada sisi CA yang miring.',
          acak: 'Perhatikan gambar Lab: persegi terbesar SELALU pada sisi di depan sudut siku-siku.',
        },
      },
    ],
    nextLabel: 'Lanjut: Bandingkan dengan Segitiga Lain →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — PEMBANDING
     Jenis tiap segitiga dihitung ulang jenisSegitiga (engine seksi 86)
     di tes; `correct` relasi harus cocok (siku → sama, lancip → lebih,
     tumpul → kurang).
     ---------------------------------------------------------- */
  dataBanding: {
    kicker: 'Tahap 4c · Pembanding',
    syntax: IL + ' · Sintaks 4',
    goal: 'Menguji apakah pola luas persegi juga berlaku pada segitiga lancip, segitiga tumpul, dan segitiga siku-siku yang posisinya miring.',
    guru: 'Bagian ini penting agar murid tidak menggeneralisasi berlebihan. Minta pasangan memperkirakan dulu sebelum menghitung: "Sudut terbesar segitiga ini lebih atau kurang dari siku-siku?"',
    pengantar:
      'Kak Raya punya tiga rancangan taman lain. Hitung luas ketiga persegi pada setiap segitiga (pakai bingkai untuk persegi miring), lalu bandingkan jumlah dua luas yang kecil dengan luas yang terbesar.',
    opsiRelasi: OPSI_RELASI,
    segitiga: [
      {
        id: 'gLancip',
        nama: 'Taman PQR',
        titik: ['P', 'Q', 'R'],
        pts: [
          [0, 0],
          [4, 0],
          [2, 3],
        ],
        correct: 'lebih',
        jenisLabel: 'segitiga lancip (semua sudutnya kurang dari 90°)',
        umpan: {
          lebih:
            'Tepat! 13 + 13 = 26 > 16. Pada segitiga lancip, jumlah dua luas kecil LEBIH BESAR daripada luas terbesar.',
          sama: 'Hitung lagi: 13 + 13 = 26, sedangkan luas terbesar 16. Keduanya tidak sama.',
          kurang: 'Hitung lagi: 13 + 13 = 26 justru lebih besar daripada 16.',
        },
      },
      {
        id: 'gTumpul',
        nama: 'Taman KLM',
        titik: ['K', 'L', 'M'],
        pts: [
          [0, 0],
          [2, 0],
          [5, 2],
        ],
        correct: 'kurang',
        jenisLabel: 'segitiga tumpul (sudut L lebih dari 90°)',
        umpan: {
          kurang:
            'Tepat! 4 + 13 = 17 < 29. Pada segitiga tumpul, jumlah dua luas kecil LEBIH KECIL daripada luas terbesar.',
          sama: 'Hitung lagi: 4 + 13 = 17, sedangkan luas terbesar 29. Keduanya tidak sama.',
          lebih: 'Hitung lagi: 4 + 13 = 17 justru lebih kecil daripada 29.',
        },
      },
      {
        id: 'gSikuMiring',
        nama: 'Taman DEF',
        titik: ['D', 'E', 'F'],
        pts: [
          [0, 1],
          [2, 0],
          [3, 2],
        ],
        correct: 'sama',
        jenisLabel: 'segitiga siku-siku (siku-siku di E) walau posisinya miring',
        umpan: {
          sama: 'Tepat! 5 + 5 = 10. Segitiga DEF siku-siku di E, jadi polanya tetap berlaku walau posisinya miring.',
          lebih: 'Hitung lagi: 5 + 5 = 10, sama persis dengan luas terbesar 10.',
          kurang: 'Hitung lagi: 5 + 5 = 10, sama persis dengan luas terbesar 10.',
        },
      },
    ],
    temuan: [
      {
        id: 'tBerlaku',
        tanya: 'Dari ketiga taman, hubungan La + Lb = Lc hanya berlaku pada …',
        opsi: [
          { id: 'siku', label: 'segitiga siku-siku saja' },
          { id: 'semua', label: 'semua segitiga' },
          { id: 'lancip', label: 'segitiga lancip saja' },
          { id: 'tegak', label: 'segitiga yang sisinya tegak dan mendatar saja' },
        ],
        correct: 'siku',
        umpan: {
          siku: 'Tepat! Taman DEF yang siku-siku memenuhi 5 + 5 = 10, sedangkan PQR dan KLM tidak.',
          semua: 'Taman PQR (26 > 16) dan KLM (17 < 29) tidak memenuhinya.',
          lancip: 'Taman PQR yang lancip justru memberi 26 > 16, bukan sama.',
          tegak:
            'Taman DEF sisinya miring semua, tetapi tetap memenuhi 5 + 5 = 10 karena siku-siku di E.',
        },
      },
    ],
    nextLabel: 'Lanjut: Uji Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGUJI HIPOTESIS
     ---------------------------------------------------------- */
  uji: {
    kicker: 'Tahap 5 · Menguji Hipotesis',
    syntax: IL + ' · Sintaks 5',
    goal: 'Menguji dugaan dan hipotesis dengan data dari Lab, Tabel, dan Pembanding.',
    guru: 'Setelah pernyataan dipilah, minta pasangan membacakan satu dugaan yang dikoreksi data dan menunjukkan buktinya (baris tabel atau taman pembanding). Hargai murid yang berani mengubah hipotesisnya.',
    judulA: 'A. Benar atau salah menurut data?',
    judulB: 'B. Dugaanmu vs data',
    opsiPernyataan: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'vJumlah',
        teks: 'Pada segitiga siku-siku, luas persegi sisi miring sama dengan jumlah luas persegi kedua kakinya.',
        correct: 'benar',
        explanation: 'Setiap baris Tabel Data memenuhi La + Lb = Lc, mis. 64 + 225 = 289.',
      },
      {
        id: 'vSisi',
        teks: 'Pada segitiga siku-siku, panjang sisi miring sama dengan jumlah panjang kedua kakinya.',
        correct: 'salah',
        explanation:
          '3 + 4 = 7, padahal sisi miringnya 5. Yang dijumlahkan adalah luas perseginya.',
      },
      {
        id: 'vSemua',
        teks: 'Hubungan La + Lb = Lc berlaku pada semua segitiga.',
        correct: 'salah',
        explanation: 'Taman PQR (lancip) memberi 26 > 16 dan taman KLM (tumpul) memberi 17 < 29.',
      },
      {
        id: 'vTerbesar',
        teks: 'Persegi terbesar pada segitiga siku-siku terletak pada sisi di depan sudut siku-siku.',
        correct: 'benar',
        explanation: 'Sisi di depan sudut siku-siku (sisi miring) adalah sisi terpanjang.',
      },
      {
        id: 'vBingkai',
        teks: 'Luas persegi miring sama dengan luas bingkainya.',
        correct: 'salah',
        explanation:
          'Bingkai juga memuat empat segitiga pojok. Untuk a = 3, b = 4: 49 − 24 = 25, bukan 49.',
      },
      {
        id: 'vMiring',
        teks: 'Segitiga siku-siku yang posisinya miring tetap memenuhi La + Lb = Lc.',
        correct: 'benar',
        explanation: 'Taman DEF siku-siku di E dengan posisi miring: 5 + 5 = 10.',
      },
      {
        id: 'vTumpul',
        teks: 'Pada segitiga tumpul, jumlah luas dua persegi kecil lebih besar daripada luas persegi terbesar.',
        correct: 'salah',
        explanation: 'Taman KLM yang tumpul memberi 4 + 13 = 17 < 29: lebih KECIL.',
      },
    ],
    nextLabel: 'Lanjut: Rumuskan Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MERUMUSKAN KESIMPULAN
     ---------------------------------------------------------- */
  simpulan: {
    kicker: 'Tahap 6 · Merumuskan Kesimpulan',
    syntax: IL + ' · Sintaks 6',
    goal: 'Merumuskan dugaan teorema Pythagoras dari hasil penyelidikan.',
    guru: 'Minta beberapa pasangan membacakan kesimpulan lengkapnya, lalu kaitkan kembali dengan rumusan masalah di tahap 2. Sampaikan bahwa dugaan ini dikenal sebagai teorema Pythagoras dan akan dibuktikan pada pertemuan berikutnya.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai satu kali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      {
        id: 'kLuas',
        awal: 'Pada segitiga siku-siku, luas persegi pada sisi miring',
        correct: 'bLuas',
      },
      { id: 'kMiring', awal: 'Sisi miring adalah sisi yang', correct: 'bMiring' },
      {
        id: 'kRumus',
        awal: 'Jika panjang kaki-kakinya a dan b serta sisi miringnya c, maka',
        correct: 'bRumus',
      },
      {
        id: 'kBukan',
        awal: 'Jika jumlah luas dua persegi kecil tidak sama dengan luas persegi terbesar,',
        correct: 'bBukan',
      },
    ],
    bank: [
      { id: 'bLuas', teks: 'sama dengan jumlah luas persegi pada kedua sisi siku-sikunya.' },
      { id: 'bMiring', teks: 'berada di depan sudut siku-siku dan merupakan sisi terpanjang.' },
      { id: 'bRumus', teks: 'a² + b² = c².' },
      { id: 'bBukan', teks: 'segitiga itu bukan segitiga siku-siku.' },
      { id: 'bSisi', teks: 'a + b = c.' },
      { id: 'bSelisih', teks: 'sama dengan selisih luas persegi pada kedua sisi siku-sikunya.' },
      { id: 'bSemua', teks: 'berlaku untuk semua jenis segitiga.' },
    ],
    rangkuman: [
      'Luas persegi pada sisi segitiga dapat dihitung dengan <strong>membilang petak</strong>; untuk persegi miring pakai <strong>strategi bingkai</strong>: luas bingkai − 4 × luas segitiga pojok.',
      'Pada segitiga siku-siku: <strong>La + Lb = Lc</strong> — luas persegi sisi miring sama dengan jumlah luas persegi kedua kakinya.',
      'Dengan panjang kaki <strong>a</strong>, <strong>b</strong> dan sisi miring <strong>c</strong>: <strong>a² + b² = c²</strong>. Dugaan ini dikenal sebagai <strong>teorema Pythagoras</strong>.',
      '<strong>Sisi miring</strong> berada di depan sudut siku-siku dan merupakan sisi terpanjang.',
      'Pada segitiga <strong>lancip</strong> La + Lb &gt; Lc, pada segitiga <strong>tumpul</strong> La + Lb &lt; Lc — jadi hubungan "sama dengan" hanya pada segitiga siku-siku.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Diambil acak sesuai `komposisi` (per `minta`) dari bank. Opsi
     dibangun opsiSoalPythagoras (engine seksi 86) lalu diacak di app.js.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan hubungan luas persegi pada sisi segitiga siku-siku dalam berbagai situasi.',
    guru: 'Murid bekerja mandiri. Amati pesan umpan balik yang sering muncul (menjumlahkan panjang sisi, lupa akar, salah memilih sisi miring) sebagai bahan umpan balik individual.',
    instruksi:
      'Kerjakan delapan soal berikut. Ingat: tentukan dulu sisi miringnya, lalu gunakan hubungan luas perseginya.',
    banyak: 8,
    komposisi: { luasMiring: 2, luasKaki: 2, sisiMiring: 1, jenis: 2, hubungan: 1 },
    soal: [
      {
        id: 'sLm1',
        minta: 'luasMiring',
        ikon: '🌿',
        La: 36,
        Lb: 64,
        satuan: 'm²',
        cerita:
          'Pada dua sisi siku-siku sebuah taman segitiga dibuat kolam persegi seluas 36 m² dan 64 m².',
        pertanyaan: 'Berapa luas kolam persegi pada sisi miringnya?',
        explanation: 'Lc = La + Lb = 36 + 64 = 100 m².',
      },
      {
        id: 'sLm2',
        minta: 'luasMiring',
        ikon: '🧩',
        La: 9,
        Lb: 16,
        satuan: 'petak',
        cerita:
          'Pada kertas berpetak, persegi pada kedua kaki segitiga siku-siku berisi 9 dan 16 petak.',
        pertanyaan: 'Berapa petak isi persegi pada sisi miringnya?',
        explanation: 'Lc = 9 + 16 = 25 petak.',
      },
      {
        id: 'sLm3',
        minta: 'luasMiring',
        ikon: '🖼️',
        La: 25,
        Lb: 144,
        satuan: 'cm²',
        cerita:
          'Dina menempel kertas persegi pada sisi-sisi segitiga siku-siku. Kertas pada kedua kakinya seluas 25 cm² dan 144 cm².',
        pertanyaan: 'Berapa luas kertas persegi pada sisi miringnya?',
        explanation: 'Lc = 25 + 144 = 169 cm².',
      },
      {
        id: 'sLm4',
        minta: 'luasMiring',
        ikon: '⚽',
        La: 81,
        Lb: 144,
        satuan: 'm²',
        cerita:
          'Di sudut lapangan berbentuk segitiga siku-siku, rumput persegi pada kedua kakinya seluas 81 m² dan 144 m².',
        pertanyaan: 'Berapa luas rumput persegi pada sisi miringnya?',
        explanation: 'Lc = 81 + 144 = 225 m².',
      },
      {
        id: 'sLk1',
        minta: 'luasKaki',
        ikon: '🌿',
        Lc: 169,
        La: 25,
        satuan: 'm²',
        cerita:
          'Kolam persegi pada sisi miring taman segitiga siku-siku seluas 169 m², dan kolam pada salah satu kakinya seluas 25 m².',
        pertanyaan: 'Berapa luas kolam persegi pada kaki yang lain?',
        explanation: 'Lb = Lc − La = 169 − 25 = 144 m².',
      },
      {
        id: 'sLk2',
        minta: 'luasKaki',
        ikon: '🧩',
        Lc: 100,
        La: 36,
        satuan: 'petak',
        cerita:
          'Persegi pada sisi miring sebuah segitiga siku-siku berisi 100 petak; persegi pada salah satu kakinya berisi 36 petak.',
        pertanyaan: 'Berapa petak isi persegi pada kaki yang lain?',
        explanation: 'Lb = 100 − 36 = 64 petak.',
      },
      {
        id: 'sLk3',
        minta: 'luasKaki',
        ikon: '🪁',
        Lc: 289,
        La: 64,
        satuan: 'cm²',
        cerita:
          'Raka membuat hiasan layang-layang dari segitiga siku-siku. Kertas persegi pada sisi miring seluas 289 cm², pada satu kaki 64 cm².',
        pertanyaan: 'Berapa luas kertas persegi pada kaki yang lain?',
        explanation: 'Lb = 289 − 64 = 225 cm².',
      },
      {
        id: 'sLk4',
        minta: 'luasKaki',
        ikon: '🏠',
        Lc: 25,
        La: 9,
        satuan: 'm²',
        cerita:
          'Atap teras berbentuk segitiga siku-siku. Panel persegi pada sisi miring seluas 25 m², pada satu kaki 9 m².',
        pertanyaan: 'Berapa luas panel persegi pada kaki yang lain?',
        explanation: 'Lb = 25 − 9 = 16 m².',
      },
      {
        id: 'sSm1',
        minta: 'sisiMiring',
        ikon: '📐',
        a: 6,
        b: 8,
        satuan: 'cm',
        cerita: 'Sebuah penggaris segitiga siku-siku memiliki kaki 6 cm dan 8 cm.',
        pertanyaan: 'Dengan hubungan luas persegi, berapa panjang sisi miringnya?',
        explanation: '6² + 8² = 36 + 64 = 100, dan 10 × 10 = 100, jadi sisi miringnya 10 cm.',
      },
      {
        id: 'sSm2',
        minta: 'sisiMiring',
        ikon: '🪜',
        a: 5,
        b: 12,
        satuan: 'm',
        cerita:
          'Kaki tangga berjarak 5 m dari dinding dan ujung atasnya menyentuh dinding setinggi 12 m.',
        pertanyaan: 'Berapa panjang tangga itu?',
        explanation: '5² + 12² = 25 + 144 = 169, dan 13 × 13 = 169, jadi panjang tangga 13 m.',
      },
      {
        id: 'sSm3',
        minta: 'sisiMiring',
        ikon: '🧩',
        a: 9,
        b: 12,
        satuan: 'petak',
        cerita: 'Di kertas berpetak digambar segitiga siku-siku dengan kaki 9 petak dan 12 petak.',
        pertanyaan: 'Berapa panjang sisi miringnya?',
        explanation: '9² + 12² = 81 + 144 = 225, dan 15 × 15 = 225, jadi sisi miringnya 15 petak.',
      },
      {
        id: 'sJ1',
        minta: 'jenis',
        ikon: '🔍',
        La: 49,
        Lb: 576,
        Lc: 625,
        cerita: 'Tiga persegi pada sisi-sisi sebuah segitiga berluas 49, 576, dan 625 satuan luas.',
        pertanyaan: 'Segitiga itu termasuk jenis apa?',
        explanation: '49 + 576 = 625: sama dengan luas terbesar, jadi segitiga siku-siku.',
      },
      {
        id: 'sJ2',
        minta: 'jenis',
        ikon: '🔍',
        La: 16,
        Lb: 25,
        Lc: 36,
        cerita: 'Tiga persegi pada sisi-sisi sebuah segitiga berluas 16, 25, dan 36 satuan luas.',
        pertanyaan: 'Segitiga itu termasuk jenis apa?',
        explanation: '16 + 25 = 41 > 36: lebih besar dari luas terbesar, jadi segitiga lancip.',
      },
      {
        id: 'sJ3',
        minta: 'jenis',
        ikon: '🔍',
        La: 4,
        Lb: 9,
        Lc: 16,
        cerita: 'Tiga persegi pada sisi-sisi sebuah segitiga berluas 4, 9, dan 16 satuan luas.',
        pertanyaan: 'Segitiga itu termasuk jenis apa?',
        explanation: '4 + 9 = 13 < 16: lebih kecil dari luas terbesar, jadi segitiga tumpul.',
      },
      {
        id: 'sJ4',
        minta: 'jenis',
        ikon: '🔍',
        La: 64,
        Lb: 36,
        Lc: 100,
        cerita: 'Tiga persegi pada sisi-sisi sebuah segitiga berluas 64, 36, dan 100 satuan luas.',
        pertanyaan: 'Segitiga itu termasuk jenis apa?',
        explanation: '36 + 64 = 100: sama dengan luas terbesar, jadi segitiga siku-siku.',
      },
      {
        id: 'sH1',
        minta: 'hubungan',
        ikon: '📏',
        titik: ['K', 'L', 'M'],
        siku: 'L',
        cerita: 'Segitiga KLM siku-siku di L.',
        pertanyaan: 'Hubungan luas persegi pada sisi-sisinya yang benar adalah …',
        explanation: 'Sisi miring KM berada di depan sudut L, jadi KM² = KL² + LM².',
      },
      {
        id: 'sH2',
        minta: 'hubungan',
        ikon: '📏',
        titik: ['P', 'Q', 'R'],
        siku: 'P',
        cerita: 'Segitiga PQR siku-siku di P.',
        pertanyaan: 'Hubungan luas persegi pada sisi-sisinya yang benar adalah …',
        explanation: 'Sisi miring QR berada di depan sudut P, jadi QR² = PQ² + PR².',
      },
      {
        id: 'sH3',
        minta: 'hubungan',
        ikon: '📏',
        titik: ['X', 'Y', 'Z'],
        siku: 'Z',
        cerita: 'Segitiga XYZ siku-siku di Z.',
        pertanyaan: 'Hubungan luas persegi pada sisi-sisinya yang benar adalah …',
        explanation: 'Sisi miring XY berada di depan sudut Z, jadi XY² = XZ² + YZ².',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses penyelidikan dan menjelaskan dugaan teorema Pythagoras dengan kata sendiri.',
    guru: 'Kumpulkan penjelasan murid tentang strategi bingkai sebagai jembatan menuju pembuktian teorema Pythagoras pada pertemuan berikutnya. Perhatikan murid yang masih menjumlahkan panjang sisi.',
    pertanyaan: [
      {
        id: 'rJelaskan',
        teks: 'Jelaskan kepada temanmu, bagaimana kamu menghitung luas persegi yang miring.',
        placeholder: 'Pertama aku membuat bingkai … lalu …',
      },
      {
        id: 'rDugaan',
        teks: 'Dugaan mana yang berubah setelah kamu menyelidiki? Mengapa berubah?',
        placeholder: 'Awalnya aku menduga … ternyata …',
      },
      {
        id: 'rKolam',
        teks: 'Bantu Kak Raya: berapa ubin untuk kolam terbesar di Taman Ubin OSIS? Jelaskan dengan La, Lb, dan Lc.',
        placeholder: 'Kolam kaki berisi … dan … ubin, jadi kolam terbesar …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menjelaskan hubungan luas persegi pada segitiga siku-siku?',
    diriOpsi: [
      { id: 'yakin', label: '🌟 Sangat yakin, aku bisa menjelaskan ke teman' },
      { id: 'cukup', label: '🙂 Cukup yakin' },
      { id: 'ragu', label: '🤔 Masih ragu di beberapa bagian' },
      { id: 'belum', label: '🙋 Belum yakin, aku perlu bantuan' },
    ],
    nextLabel: 'Simpan & Selesai',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Penyelidikan Selesai!',
    teks: 'Kamu sudah menemukan sendiri hubungan luas persegi pada sisi segitiga siku-siku. Kak Raya kini tahu: kolam terbesar Taman Ubin OSIS butuh 9 + 16 = 25 ubin.',
    contoh: [
      { teks: '9 + 16 = 25', keterangan: 'Segitiga siku-siku 3, 4, 5' },
      { teks: '25 + 144 = 169', keterangan: 'Segitiga siku-siku 5, 12, 13' },
      { teks: 'a² + b² = c²', keterangan: 'Dugaan teorema Pythagoras (c sisi miring)' },
    ],
    capaian: [
      'Menghitung luas persegi pada sisi segitiga dengan membilang petak dan strategi bingkai.',
      'Menemukan pola La + Lb = Lc dari data beberapa segitiga siku-siku.',
      'Menunjukkan bahwa pola itu tidak berlaku pada segitiga lancip dan tumpul.',
      'Merumuskan dugaan teorema Pythagoras: a² + b² = c².',
    ],
  },
};
