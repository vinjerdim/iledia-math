'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Penjumlahan & Pengurangan Bilangan Bulat dalam
   Masalah Kontekstual — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menerapkan operasi penjumlahan dan pengurangan pada bilangan bulat
   untuk menyelesaikan masalah kontekstual, seperti suhu, ketinggian,
   dan saldo keuangan.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahJumlah', 'olahKurang' & 'olahModel'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi    (7')  — "Tiga Kabar Perubahan": suhu Dieng naik,
                             penyelam naik, kas kelas dibelanjakan.
                             Murid MENDUGA hasilnya (tidak dinilai).
     2. Masalah      (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data         (15') — "Lab Lompatan": enam percobaan pada simulator
                             garis bilangan (titik awal, tanda operasi,
                             bilangan kedua) yang diambil dari konteks
                             suhu, ketinggian, dan saldo; hasil dicatat
                             lewat isian berdiagnosa; tabel data terisi
                             otomatis lalu diamati.
     4a. Olah +      (10') — memilah arah lompatan penjumlahan, menemukan
                             pola, lalu menghitung.
     4b. Olah −      (10') — melengkapi tabel pola 5 − 3, 5 − 2, …,
                             5 − (−3) untuk menemukan a − b = a + (−b).
     4c. Model       (10') — menerjemahkan cerita (naik/turun, selisih)
                             menjadi kalimat matematika lalu menghitung.
     5. Bukti        (8')  — menguji pernyataan & membandingkan dengan
                             dugaan awal serta hipotesis.
     6. Simpulan     (5')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap    (10') — delapan soal diambil acak dari bank lima
                             belas soal (isian & pilihan ganda).
     8. Refleksi     (3')  — refleksi tertulis & penilaian diri.

   Notasi baku: bilangan negatif ditulis dengan minus tipografis (−4);
   bilangan kedua yang negatif diberi kurung: 5 − (−2). Saldo ditulis
   dalam rupiah tanpa "Rp" pada isian (mis. −15.000).

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban benar sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Soal uji terap juga
   diambil acak dari bank.

   Konsistensi kunci jawaban diuji tests/mpi-2.1-data.test.js terhadap
   engine seksi 17 (hasilOperasiBulat, integerJumps, arahLompatan,
   kalimatPerubahan, selisihBulat).
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  meta: {
    judul: 'Penjumlahan & Pengurangan Bilangan Bulat dalam Masalah Kontekstual',
  },

  tahap: [
    { id: 'stimulasi', label: 'Stimulasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'koleksi', label: 'Data' },
    { id: 'olahJumlah', label: 'Pola +' },
    { id: 'olahKurang', label: 'Pola −' },
    { id: 'olahModel', label: 'Model' },
    { id: 'verifikasi', label: 'Bukti' },
    { id: 'generalisasi', label: 'Simpulan' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Tiga konteks yang dipakai di seluruh modul. */
  konteks: {
    suhu: { ikon: '🌡️', nama: 'Suhu', satuan: '°C' },
    ketinggian: { ikon: '⛰️', nama: 'Ketinggian', satuan: 'm' },
    saldo: { ikon: '💰', nama: 'Saldo', satuan: 'rupiah' },
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Bukti.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati perubahan suhu, ketinggian, dan saldo, lalu menyampaikan dugaan hasilnya.',
    tp: 'Menerapkan operasi penjumlahan dan pengurangan pada bilangan bulat untuk menyelesaikan masalah kontekstual, seperti suhu, ketinggian, dan saldo keuangan.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menggambarkan penjumlahan dan pengurangan bilangan bulat sebagai lompatan pada garis bilangan.',
      'Menjelaskan bahwa mengurangkan suatu bilangan sama dengan menjumlahkan lawannya: a − b = a + (−b).',
      'Menuliskan kalimat matematika yang tepat dari cerita perubahan (naik/turun) dan selisih.',
      'Menghitung hasilnya dan menafsirkannya kembali dalam konteks suhu, ketinggian, atau saldo.',
    ],
    guru: 'Bacakan ketiga kabar. Minta pasangan murid menyampaikan dugaan beserta cara berpikirnya secara lisan. Jangan membenarkan atau menyalahkan dulu — perbedaan jawaban (mis. 3 °C vs 11 °C) justru menjadi rasa ingin tahu yang akan diselidiki.',
    judul: 'Tiga Kabar Perubahan',
    pengantar:
      'Pagi ini grup kelas VII ramai. Tiga kabar berikut sama-sama bercerita tentang keadaan yang BERUBAH — dan ketiganya melibatkan bilangan di bawah nol.',
    kabar: [
      {
        id: 'kabarSuhu',
        konteks: 'suhu',
        ikon: '🌡️',
        sumber: 'Info Cuaca Dieng',
        teks: 'Pukul 05.00 suhu di kompleks Candi Arjuna −4 °C. Hingga pukul 09.00, matahari membuat suhu naik 7 °C.',
        sorot: '−4 °C ↗ 7 °C',
      },
      {
        id: 'kabarSelam',
        konteks: 'ketinggian',
        ikon: '🤿',
        sumber: 'Klub Selam Bunaken',
        teks: 'Seorang penyelam memotret karang pada posisi −12 m (12 m di bawah permukaan laut), lalu berenang naik 5 m.',
        sorot: '−12 m ↗ 5 m',
      },
      {
        id: 'kabarKas',
        konteks: 'saldo',
        ikon: '💰',
        sumber: 'Bendahara Kelas VII-B',
        teks: 'Kas kelas tinggal Rp20.000, padahal bola voli baru seharga Rp35.000. Wali kelas menalangi kekurangannya sehingga kas kelas tercatat berutang.',
        sorot: 'Rp20.000 ↘ Rp35.000',
      },
    ],
    dugaan: [
      {
        id: 'dSuhu',
        tanya: 'Berapa suhu di Dieng pada pukul 09.00?',
        a: -4,
        op: '+',
        b: 7,
        opsi: [
          { id: 'p3', label: '3 °C', nilai: 3 },
          { id: 'p11', label: '11 °C', nilai: 11 },
          { id: 'm11', label: '−11 °C', nilai: -11 },
          { id: 'm3', label: '−3 °C', nilai: -3 },
        ],
        baku: 'p3',
        pembahasan:
          'Suhu naik berarti menambah: −4 + 7 = 3. Dari −4, melompat 7 langkah ke kanan berhenti di 3.',
      },
      {
        id: 'dSelam',
        tanya: 'Di mana posisi penyelam sekarang?',
        a: -12,
        op: '+',
        b: 5,
        opsi: [
          { id: 'm7', label: '−7 m (7 m di bawah permukaan laut)', nilai: -7 },
          { id: 'm17', label: '−17 m (17 m di bawah permukaan laut)', nilai: -17 },
          { id: 'p7', label: '7 m (7 m di atas permukaan laut)', nilai: 7 },
          { id: 'p17', label: '17 m (17 m di atas permukaan laut)', nilai: 17 },
        ],
        baku: 'm7',
        pembahasan:
          'Naik 5 m berarti menambah 5: −12 + 5 = −7. Penyelam masih berada 7 m di bawah permukaan laut.',
      },
      {
        id: 'dKas',
        tanya: 'Berapa saldo kas kelas setelah membeli bola voli?',
        a: 20000,
        op: '-',
        b: 35000,
        opsi: [
          { id: 'm15', label: '−Rp15.000 (berutang Rp15.000)', nilai: -15000 },
          { id: 'p15', label: 'Rp15.000', nilai: 15000 },
          { id: 'p55', label: 'Rp55.000', nilai: 55000 },
          { id: 'm55', label: '−Rp55.000 (berutang Rp55.000)', nilai: -55000 },
        ],
        baku: 'm15',
        pembahasan:
          'Membayar berarti mengurangkan: 20.000 − 35.000 = −15.000. Saldo negatif menandakan kas berutang Rp15.000.',
      },
    ],
    alasanLabel: 'Bagaimana kamu memperoleh dugaan itu?',
    alasanPlaceholder: 'Tulis caramu berpikir dengan kalimatmu sendiri…',
    catatan:
      'Belum ada jawaban benar atau salah di tahap ini. Dugaanmu disimpan, lalu kamu sendiri yang mengujinya pada tahap Bukti.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan yang akan diselidiki dan menuliskan hipotesis.',
    guru: 'Bila murid memilih rumusan yang kurang tepat, ajukan pertanyaan balik: "Kalau pertanyaan itu terjawab, apakah kita bisa menghitung suhu, posisi penyelam, DAN saldo kas?"',
    pengantar:
      'Ketiga kabar memuat keadaan awal, lalu perubahan (naik, turun, membayar). Dugaan teman-temanmu ternyata berbeda-beda. Supaya semua sepakat, kita perlu cara yang pasti untuk menjumlahkan dan mengurangkan bilangan bulat — termasuk bilangan negatif.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'r1',
        label:
          'Bagaimana cara menjumlahkan dan mengurangkan bilangan bulat (termasuk negatif) dan memakainya untuk menghitung perubahan suhu, ketinggian, serta saldo?',
      },
      { id: 'r2', label: 'Berapa suhu terdingin yang pernah tercatat di Dieng?' },
      { id: 'r3', label: 'Mengapa penyelam tidak boleh naik ke permukaan terlalu cepat?' },
      {
        id: 'r4',
        label: 'Bagaimana menghitung tanpa memperhatikan tanda negatif supaya lebih cepat?',
      },
    ],
    correct: 'r1',
    umpan: {
      r1: 'Tepat. Ketiga kabar membutuhkan cara menjumlahkan dan mengurangkan bilangan bulat, lalu memakainya dalam konteks.',
      r2: 'Jawabannya hanya sebuah fakta dan tidak membantu menghitung posisi penyelam atau saldo kas.',
      r3: 'Itu pertanyaan menarik untuk pelajaran IPA, tetapi tidak membantu kita menghitung perubahan.',
      r4: 'Tanda negatif justru penting: −4 °C dan 4 °C adalah suhu yang sangat berbeda.',
    },
    hipotesisLabel: 'Tulis dugaan sementaramu (hipotesis)',
    hipotesisPlaceholder:
      'Contoh: saya menduga "naik" berarti menambah, sehingga pada garis bilangan bergerak ke …',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA: LAB LOMPATAN
     Murid mengatur simulator sesuai percobaan, lalu mencatat hasil.
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Melakukan percobaan penjumlahan dan pengurangan pada simulator garis bilangan, lalu mencatat hasilnya.',
    guru: 'Beri keleluasaan bereksperimen dengan simulator. Minta satu murid mengatur simulator dan pasangannya mencatat, lalu bergantian. Tanyakan: "Ke mana titiknya melompat? Berapa langkah?"',
    instruksi:
      'Atur simulator sesuai percobaan: titik awal, tanda operasi (+ atau −), dan bilangan kedua. Amati arah dan banyak langkah lompatannya, lalu catat hasilnya.',
    judulSim: '🧪 Simulator Lompatan',
    simAwal: { a: 0, op: '+', b: 0 },
    garis: { min: -12, max: 12 },
    rentang: { min: -10, max: 10 },
    percobaan: [
      {
        id: 'k1',
        konteks: 'suhu',
        cerita: 'Suhu Dieng −4 °C, lalu naik 7 °C.',
        a: -4,
        op: '+',
        b: 7,
        jawab: 3,
        hints: [
          'Titik awal −4, operasi +, bilangan kedua 7. Lihat di mana titik "hasil" berhenti.',
        ],
        temuan: 'Menambah 7 membuat titik melompat 7 langkah ke <strong>kanan</strong>.',
      },
      {
        id: 'k2',
        konteks: 'saldo',
        cerita:
          'Saldo kas Rp5.000 (ditulis 5, dalam ribuan rupiah). Tercatat pengeluaran 8 ribu, yaitu perubahan −8.',
        a: 5,
        op: '+',
        b: -8,
        jawab: -3,
        hints: ['Titik awal 5, operasi +, bilangan kedua −8.'],
        temuan:
          'Menambah bilangan <strong>negatif</strong> (−8) membuat titik melompat ke <strong>kiri</strong>. Saldo −3 ribu berarti berutang Rp3.000.',
      },
      {
        id: 'k3',
        konteks: 'ketinggian',
        cerita: 'Penyelam di posisi −3 m menyelam lebih dalam; perubahan posisinya −5 m.',
        a: -3,
        op: '+',
        b: -5,
        jawab: -8,
        hints: ['Titik awal −3, operasi +, bilangan kedua −5.'],
        temuan: 'Dari −3, lima langkah ke kiri berhenti di −8: penyelam makin dalam.',
      },
      {
        id: 'k4',
        konteks: 'saldo',
        cerita: 'Kas kelas berutang 6 ribu (−6), lalu menerima iuran 6 ribu.',
        a: -6,
        op: '+',
        b: 6,
        jawab: 0,
        hints: ['Titik awal −6, operasi +, bilangan kedua 6.'],
        temuan: '−6 dan 6 saling berlawanan; jumlahnya 0 — utang lunas!',
      },
      {
        id: 'k5',
        konteks: 'suhu',
        cerita: 'Suhu sore 4 °C, lalu malam hari turun 7 °C.',
        a: 4,
        op: '-',
        b: 7,
        jawab: -3,
        hints: ['Titik awal 4, operasi −, bilangan kedua 7. Perhatikan bentuk setara yang muncul.'],
        temuan:
          'Simulator menulis 4 − 7 = 4 + (−7): <strong>mengurangkan 7</strong> sama dengan <strong>menambah −7</strong>, yaitu lompat ke kiri.',
      },
      {
        id: 'k6',
        konteks: 'ketinggian',
        cerita:
          'Ikan badut berenang di −2 m, sedangkan kepiting di dasar karang −5 m. Berapa meter ikan badut di atas kepiting? Hitung −2 − (−5).',
        a: -2,
        op: '-',
        b: -5,
        jawab: 3,
        hints: ['Titik awal −2, operasi −, bilangan kedua −5. Ke mana titiknya melompat?'],
        temuan:
          'Mengurangkan −5 sama dengan menambah 5: titik melompat ke <strong>kanan</strong>. Ikan badut 3 m di atas kepiting.',
      },
    ],
    amati: [
      {
        id: 'a1',
        tanya:
          'Lihat percobaan 2 dan 3. Ketika bilangan yang <strong>dijumlahkan</strong> negatif, hasilnya …',
        opsi: [
          { id: 'kecil', label: 'lebih kecil daripada titik awal' },
          { id: 'besar', label: 'lebih besar daripada titik awal' },
          { id: 'nol', label: 'selalu 0' },
          { id: 'positif', label: 'selalu positif' },
        ],
        correct: 'kecil',
        umpan: {
          kecil:
            'Benar. 5 + (−8) = −3 dan −3 + (−5) = −8: titik bergerak ke kiri, jadi hasilnya mengecil.',
          besar: 'Coba lihat lagi: −3 lebih kecil daripada 5, dan −8 lebih kecil daripada −3.',
          nol: 'Hasil 0 hanya muncul pada percobaan 4. Pada percobaan 2 dan 3 hasilnya −3 dan −8.',
          positif: 'Hasil percobaan 2 dan 3 justru negatif (−3 dan −8).',
        },
      },
      {
        id: 'a2',
        tanya:
          'Lihat percobaan 4: −6 + 6 = 0. Apa yang terjadi bila suatu bilangan dijumlahkan dengan lawannya?',
        opsi: [
          { id: 'nol', label: 'Hasilnya 0' },
          { id: 'dua', label: 'Hasilnya dua kali bilangan itu' },
          { id: 'neg', label: 'Hasilnya selalu negatif' },
          { id: 'sama', label: 'Hasilnya sama dengan bilangan itu' },
        ],
        correct: 'nol',
        umpan: {
          nol: 'Tepat. Bilangan dan lawannya berjarak sama dari 0 tetapi berlawanan arah, jadi jumlahnya 0.',
          dua: '−6 + 6 tidak sama dengan −12 atau 12. Lihat lagi titik hasilnya.',
          neg: 'Hasil −6 + 6 adalah 0, bukan bilangan negatif.',
          sama: 'Bila sama, hasilnya −6. Padahal simulator berhenti di 0.',
        },
      },
      {
        id: 'a3',
        tanya: 'Lihat percobaan 6: −2 − (−5). Ke mana simulator melompat?',
        opsi: [
          { id: 'kanan5', label: '5 langkah ke kanan' },
          { id: 'kiri5', label: '5 langkah ke kiri' },
          { id: 'kiri2', label: '2 langkah ke kiri' },
          { id: 'diam', label: 'Tidak melompat' },
        ],
        correct: 'kanan5',
        umpan: {
          kanan5:
            'Benar! Walaupun operasinya pengurangan, mengurangkan −5 membuat titik melompat ke KANAN. Kita selidiki mengapa di tahap berikutnya.',
          kiri5: 'Atur lagi simulatornya: −2 − (−5). Hasilnya 3, yaitu di kanan −2.',
          kiri2: 'Banyak langkah ditentukan bilangan kedua (5), bukan titik awal.',
          diam: 'Titiknya berpindah dari −2 ke 3, jadi pasti melompat.',
        },
      },
    ],
    nextLabel: 'Lanjut: Olah Data Penjumlahan →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — PENGOLAHAN DATA: POLA PENJUMLAHAN
     ---------------------------------------------------------- */
  olahJumlah: {
    kicker: 'Tahap 4a · Pengolahan Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Mengelompokkan penjumlahan menurut arah lompatannya dan menemukan pola penjumlahan bilangan bulat.',
    guru: 'Saat memilah, minta murid menunjuk arah dengan tangan sebelum menjawab ("kanan!" / "kiri!"). Tekankan bahwa tanda bilangan KEDUA yang menentukan arah, bukan tanda titik awal.',
    judulA: 'A. Ke mana titik melompat?',
    instruksiA:
      'Untuk setiap penjumlahan, tentukan arah lompatannya dari titik awal. Setiap butir dijawab sekali, lalu langsung dibahas.',
    opsiArah: [
      { id: 'kanan', label: '➡️ Melompat ke kanan' },
      { id: 'kiri', label: '⬅️ Melompat ke kiri' },
      { id: 'diam', label: '⏺️ Tidak berpindah' },
    ],
    pilah: [
      {
        id: 'j1',
        a: -4,
        b: 7,
        teks: '−4 + 7',
        correct: 'kanan',
        explanation: 'Menambah 7 (positif): 7 langkah ke kanan dari −4, berhenti di 3.',
      },
      {
        id: 'j2',
        a: 5,
        b: -8,
        teks: '5 + (−8)',
        correct: 'kiri',
        explanation: 'Menambah −8 (negatif): 8 langkah ke kiri dari 5, berhenti di −3.',
      },
      {
        id: 'j3',
        a: -3,
        b: -5,
        teks: '−3 + (−5)',
        correct: 'kiri',
        explanation: 'Menambah −5: 5 langkah ke kiri dari −3, berhenti di −8.',
      },
      {
        id: 'j4',
        a: 2,
        b: 6,
        teks: '2 + 6',
        correct: 'kanan',
        explanation: 'Menambah 6: 6 langkah ke kanan dari 2, berhenti di 8.',
      },
      {
        id: 'j5',
        a: -7,
        b: 0,
        teks: '−7 + 0',
        correct: 'diam',
        explanation: 'Menambah 0 tidak mengubah posisi: hasilnya tetap −7.',
      },
      {
        id: 'j6',
        a: 0,
        b: -4,
        teks: '0 + (−4)',
        correct: 'kiri',
        explanation: 'Menambah −4: 4 langkah ke kiri dari 0, berhenti di −4.',
      },
      {
        id: 'j7',
        a: -9,
        b: 3,
        teks: '−9 + 3',
        correct: 'kanan',
        explanation:
          'Titik awalnya negatif, tetapi yang ditambahkan 3 (positif): 3 langkah ke kanan, berhenti di −6.',
      },
      {
        id: 'j8',
        a: 6,
        b: -6,
        teks: '6 + (−6)',
        correct: 'kiri',
        explanation: 'Menambah −6: 6 langkah ke kiri dari 6, berhenti di 0.',
      },
    ],
    judulB: 'B. Temukan polanya',
    pola: [
      {
        id: 'q1',
        tanya: 'Menjumlahkan bilangan <strong>positif</strong> pada garis bilangan berarti …',
        opsi: [
          { id: 'kanan', label: 'melompat ke kanan' },
          { id: 'kiri', label: 'melompat ke kiri' },
          { id: 'awal', label: 'tergantung tanda titik awalnya' },
          { id: 'diam', label: 'tidak berpindah' },
        ],
        correct: 'kanan',
        umpan: {
          kanan: 'Benar. −4 + 7, 2 + 6, dan −9 + 3 semuanya melompat ke kanan.',
          kiri: 'Lihat lagi −4 + 7: titik bergerak dari −4 ke 3, yaitu ke kanan.',
          awal: '−9 + 3 titik awalnya negatif dan 2 + 6 positif — keduanya tetap melompat ke kanan.',
          diam: 'Hanya menambah 0 yang tidak berpindah.',
        },
      },
      {
        id: 'q2',
        tanya: 'Menjumlahkan bilangan <strong>negatif</strong> berarti …',
        opsi: [
          { id: 'kiri', label: 'melompat ke kiri sebanyak angkanya' },
          { id: 'kanan', label: 'melompat ke kanan sebanyak angkanya' },
          { id: 'awal', label: 'melompat ke kiri sebanyak titik awalnya' },
          { id: 'nol', label: 'langsung kembali ke 0' },
        ],
        correct: 'kiri',
        umpan: {
          kiri: 'Tepat. 5 + (−8) melompat 8 langkah ke kiri; 0 + (−4) melompat 4 langkah ke kiri.',
          kanan: 'Lihat 5 + (−8): titik bergerak dari 5 ke −3, yaitu ke kiri.',
          awal: 'Banyak langkah ditentukan bilangan yang ditambahkan. 5 + (−8) melompat 8 langkah, bukan 5.',
          nol: 'Hanya 6 + (−6) yang berhenti di 0, karena −6 adalah lawan dari 6.',
        },
      },
      {
        id: 'q3',
        tanya:
          'Perhatikan −3 + (−5) = −8 dan simulator 4 − 7 = 4 + (−7). Menambah bilangan negatif ternyata sama seperti …',
        opsi: [
          { id: 'kurang', label: 'mengurangkan bilangan positif yang angkanya sama' },
          { id: 'tambah', label: 'menambah bilangan positif yang angkanya sama' },
          { id: 'kali', label: 'mengalikan dengan −1' },
          { id: 'abaikan', label: 'mengabaikan tanda negatifnya' },
        ],
        correct: 'kurang',
        umpan: {
          kurang: 'Benar: −3 + (−5) = −3 − 5 = −8. Keduanya melompat 5 langkah ke kiri.',
          tambah: '−3 + 5 = 2, sedangkan −3 + (−5) = −8. Hasilnya berbeda.',
          kali: 'Kita tidak sedang mengalikan. Perhatikan arah lompatannya saja.',
          abaikan: 'Bila tanda diabaikan, −3 + (−5) menjadi 3 + 5 = 8 — jauh dari −8.',
        },
      },
    ],
    judulC: 'C. Coba hitung',
    instruksiC:
      'Gunakan polamu (bayangkan lompatan pada garis bilangan) untuk menghitung. Tulis tanda − di depan bilangan negatif.',
    hitung: [
      {
        id: 'h1',
        a: -9,
        op: '+',
        b: 4,
        jawab: -5,
        label: '−9 + 4 = …',
        hints: ['Mulai dari −9, lompat 4 langkah ke kanan.'],
      },
      {
        id: 'h2',
        a: 7,
        op: '+',
        b: -10,
        jawab: -3,
        label: '7 + (−10) = …',
        hints: ['Mulai dari 7, lompat 10 langkah ke kiri. Tujuh langkah pertama tiba di 0.'],
      },
      {
        id: 'h3',
        a: -6,
        op: '+',
        b: -6,
        jawab: -12,
        label: '−6 + (−6) = …',
        hints: ['Mulai dari −6, lompat 6 langkah lagi ke kiri.'],
      },
      {
        id: 'h4',
        a: -8,
        op: '+',
        b: 13,
        jawab: 5,
        label: '−8 + 13 = …',
        hints: ['Dari −8, delapan langkah ke kanan tiba di 0. Masih sisa berapa langkah?'],
      },
    ],
    temuan: [
      'Menjumlahkan bilangan <strong>positif</strong> → lompat ke <strong>kanan</strong>; menjumlahkan bilangan <strong>negatif</strong> → lompat ke <strong>kiri</strong>.',
      'Banyak langkah = angka bilangan yang dijumlahkan (tanpa tandanya).',
      'Bilangan ditambah lawannya hasilnya 0, mis. 6 + (−6) = 0.',
    ],
    nextLabel: 'Lanjut: Olah Data Pengurangan →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — PENGOLAHAN DATA: POLA PENGURANGAN
     ---------------------------------------------------------- */
  olahKurang: {
    kicker: 'Tahap 4b · Pengolahan Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Melengkapi pola pengurangan untuk menemukan bahwa mengurangkan sama dengan menjumlahkan lawannya.',
    guru: 'Biarkan murid melengkapi tabel dari polanya ("pengurang turun 1, hasil naik 1") sebelum menyimpulkan aturan. Setelah itu baru tanyakan: "5 − (−3) hasilnya sama dengan 5 tambah berapa?"',
    judulA: 'A. Lengkapi tabel pola',
    instruksiA:
      'Perhatikan baris yang sudah terisi. Setiap baris, bilangan pengurangnya turun 1. Apa yang terjadi pada hasilnya? Lanjutkan polanya.',
    polaBaris: [
      { id: 'b1', a: 5, op: '-', b: 3, jawab: 2, tampil: true, label: '5 − 3' },
      { id: 'b2', a: 5, op: '-', b: 2, jawab: 3, tampil: true, label: '5 − 2' },
      { id: 'b3', a: 5, op: '-', b: 1, jawab: 4, tampil: true, label: '5 − 1' },
      { id: 'b4', a: 5, op: '-', b: 0, jawab: 5, tampil: true, label: '5 − 0' },
      {
        id: 'b5',
        op: '-',
        a: 5,
        b: -1,
        jawab: 6,
        tampil: false,
        label: '5 − (−1) = …',
        hints: ['Lihat kolom hasil: 2, 3, 4, 5, … Setiap pengurang turun 1, hasilnya naik 1.'],
      },
      {
        id: 'b6',
        op: '-',
        a: 5,
        b: -2,
        jawab: 7,
        tampil: false,
        label: '5 − (−2) = …',
        hints: ['Lanjutkan pola hasilnya satu langkah lagi.'],
      },
      {
        id: 'b7',
        op: '-',
        a: 5,
        b: -3,
        jawab: 8,
        tampil: false,
        label: '5 − (−3) = …',
        hints: ['Hasil naik 1 lagi dari baris sebelumnya.'],
      },
    ],
    judulB: 'B. Bentuk penjumlahan yang setara',
    pasang: [
      {
        id: 's1',
        a: 5,
        b: -3,
        tanya: 'Hasil 5 − (−3) = 8. Penjumlahan mana yang hasilnya sama?',
        opsi: [
          { id: 'ok', label: '5 + 3' },
          { id: 'x1', label: '5 − 3' },
          { id: 'x2', label: '−5 + 3' },
          { id: 'x3', label: '−5 − 3' },
        ],
        correct: 'ok',
        umpan: {
          ok: 'Tepat! Mengurangkan −3 sama dengan menambah 3 (lawan dari −3).',
          x1: '5 − 3 = 2, bukan 8.',
          x2: 'Bilangan pertama tidak berubah; tetap 5.',
          x3: '−5 − 3 = −8, bukan 8.',
        },
      },
      {
        id: 's2',
        a: -2,
        b: 4,
        tanya: '−2 − 4 sama nilainya dengan …',
        opsi: [
          { id: 'ok', label: '−2 + (−4)' },
          { id: 'x1', label: '−2 + 4' },
          { id: 'x2', label: '2 + 4' },
          { id: 'x3', label: '4 − 2' },
        ],
        correct: 'ok',
        umpan: {
          ok: 'Benar. Mengurangkan 4 sama dengan menambah −4: hasilnya −6.',
          x1: '−2 + 4 = 2, sedangkan −2 − 4 = −6.',
          x2: 'Tanda negatif pada −2 tidak boleh hilang.',
          x3: 'Urutan pengurangan tidak boleh dibalik: 4 − 2 = 2.',
        },
      },
      {
        id: 's3',
        a: -1,
        b: -6,
        tanya: '−1 − (−6) sama nilainya dengan …',
        opsi: [
          { id: 'ok', label: '−1 + 6' },
          { id: 'x1', label: '−1 + (−6)' },
          { id: 'x2', label: '1 + 6' },
          { id: 'x3', label: '−1 − 6' },
        ],
        correct: 'ok',
        umpan: {
          ok: 'Tepat. Lawan dari −6 adalah 6, jadi −1 − (−6) = −1 + 6 = 5.',
          x1: 'Itu sama dengan −1 − 6 = −7. Mengurangkan −6 berarti menambah lawannya.',
          x2: 'Bilangan pertama tetap −1; yang diganti hanya bilangan kedua.',
          x3: '−1 − 6 = −7. Ingat, yang dikurangkan adalah −6, bukan 6.',
        },
      },
    ],
    judulC: 'C. Hitung dengan aturan barumu',
    instruksiC: 'Ubah dulu pengurangan menjadi penjumlahan dengan lawannya, lalu hitung.',
    hitung: [
      {
        id: 'k1',
        a: 3,
        op: '-',
        b: -6,
        jawab: 9,
        label: '3 − (−6) = …',
        hints: ['3 − (−6) = 3 + 6.'],
      },
      {
        id: 'k2',
        a: -8,
        op: '-',
        b: -3,
        jawab: -5,
        label: '−8 − (−3) = …',
        hints: ['−8 − (−3) = −8 + 3. Dari −8 lompat 3 langkah ke kanan.'],
      },
      {
        id: 'k3',
        a: -4,
        op: '-',
        b: 5,
        jawab: -9,
        label: '−4 − 5 = …',
        hints: ['−4 − 5 = −4 + (−5). Dari −4 lompat 5 langkah ke kiri.'],
      },
      {
        id: 'k4',
        a: 0,
        op: '-',
        b: -7,
        jawab: 7,
        label: '0 − (−7) = …',
        hints: ['0 − (−7) = 0 + 7.'],
      },
    ],
    temuan: [
      'Pada tabel pola, setiap pengurang turun 1, hasilnya naik 1 — sehingga 5 − (−3) = 8.',
      'Mengurangkan suatu bilangan sama dengan <strong>menjumlahkan lawannya</strong>: <strong>a − b = a + (−b)</strong>.',
      'Mengurangkan bilangan negatif berarti melompat ke <strong>kanan</strong>; mengurangkan bilangan positif berarti melompat ke <strong>kiri</strong>.',
    ],
    nextLabel: 'Lanjut: Dari Cerita ke Kalimat Matematika →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — PENGOLAHAN DATA: MODEL KONTEKSTUAL
     jenis 'perubahan' → kalimatPerubahan(awal, arah, besar)
     jenis 'selisih'   → selisihBulat(p, q)
     ---------------------------------------------------------- */
  olahModel: {
    kicker: 'Tahap 4c · Pengolahan Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menerjemahkan cerita suhu, ketinggian, dan saldo menjadi kalimat matematika, lalu menghitung dan menafsirkan hasilnya.',
    guru: 'Ajak murid menggarisbawahi tiga hal pada cerita: keadaan awal, kata perubahan (naik/turun/menerima/membayar), dan besar perubahannya. Untuk soal selisih, tanyakan: "Mana yang lebih tinggi?"',
    instruksi:
      'Baca ceritanya, pilih kalimat matematika yang tepat, lalu hitung hasilnya. Ingat: naik/menerima → tambah; turun/membayar → kurang; selisih → yang lebih tinggi dikurangi yang lebih rendah.',
    soal: [
      {
        id: 'm1',
        konteks: 'suhu',
        jenis: 'perubahan',
        awal: -18,
        arah: 'naik',
        besar: 7,
        a: -18,
        op: '+',
        b: 7,
        jawab: -11,
        satuan: '°C',
        cerita:
          'Suhu di dalam freezer kantin −18 °C. Saat listrik padam selama dua jam, suhunya naik 7 °C.',
        tanya: 'Kalimat matematika mana yang tepat untuk suhu freezer setelah listrik padam?',
        opsi: [
          { id: 'ok', label: '−18 + 7' },
          { id: 'x1', label: '−18 − 7' },
          { id: 'x2', label: '18 + 7' },
          { id: 'x3', label: '18 − 7' },
        ],
        correct: 'ok',
        umpan: {
          ok: 'Tepat: keadaan awal −18, naik 7 → ditambah 7.',
          x1: 'Suhunya NAIK, jadi ditambah, bukan dikurangi.',
          x2: 'Suhu awalnya −18 °C (di bawah nol); tanda negatifnya tidak boleh hilang.',
          x3: 'Suhu awalnya −18 °C, bukan 18 °C.',
        },
        hints: ['Dari −18, lompat 7 langkah ke kanan.'],
        temuan: 'Suhu freezer menjadi −11 °C — masih di bawah nol, makanan tetap beku.',
      },
      {
        id: 'm2',
        konteks: 'ketinggian',
        jenis: 'selisih',
        p: 45,
        q: -30,
        a: 45,
        op: '-',
        b: -30,
        jawab: 75,
        satuan: 'm',
        cerita:
          'Puncak sebuah mercusuar berada 45 m di atas permukaan laut. Di dekatnya, bangkai kapal karam berada 30 m di bawah permukaan laut.',
        tanya:
          'Kalimat matematika mana yang tepat untuk selisih ketinggian puncak mercusuar dan bangkai kapal?',
        opsi: [
          { id: 'ok', label: '45 − (−30)' },
          { id: 'x1', label: '45 − 30' },
          { id: 'x2', label: '−30 − 45' },
          { id: 'x3', label: '45 + (−30)' },
        ],
        correct: 'ok',
        umpan: {
          ok: 'Tepat: yang lebih tinggi (45) dikurangi yang lebih rendah (−30).',
          x1: 'Bangkai kapal berada di BAWAH permukaan laut, jadi posisinya −30, bukan 30.',
          x2: 'Urutannya terbalik: hasilnya negatif, padahal selisih/jarak tidak negatif.',
          x3: '45 + (−30) = 15 adalah tinggi mercusuar bila turun 30 m, bukan selisih keduanya.',
        },
        hints: ['45 − (−30) = 45 + 30.'],
        temuan:
          'Selisihnya 75 m: 45 m dari puncak ke permukaan laut ditambah 30 m dari permukaan ke bangkai kapal.',
      },
      {
        id: 'm3',
        konteks: 'saldo',
        jenis: 'perubahan',
        awal: -12000,
        arah: 'naik',
        besar: 30000,
        a: -12000,
        op: '+',
        b: 30000,
        jawab: 18000,
        satuan: 'rupiah',
        cerita:
          'Saldo kas kelas tercatat −Rp12.000 karena masih berutang. Hari ini kas menerima iuran Rp30.000.',
        tanya: 'Kalimat matematika mana yang tepat untuk saldo kas sekarang?',
        opsi: [
          { id: 'ok', label: '−12.000 + 30.000' },
          { id: 'x1', label: '12.000 + 30.000' },
          { id: 'x2', label: '−12.000 − 30.000' },
          { id: 'x3', label: '30.000 − (−12.000)' },
        ],
        correct: 'ok',
        umpan: {
          ok: 'Tepat: saldo awal −12.000, menerima 30.000 → ditambah.',
          x1: 'Saldo awal berutang, jadi ditulis −12.000, bukan 12.000.',
          x2: 'Menerima iuran membuat saldo BERTAMBAH, bukan berkurang.',
          x3: 'Itu bentuk selisih; kita mencari saldo setelah menerima iuran.',
        },
        hints: ['Utang 12.000 dibayar lebih dulu dari iuran 30.000. Sisanya?'],
        temuan: 'Saldo menjadi Rp18.000: utang lunas dan kas punya sisa.',
      },
      {
        id: 'm4',
        konteks: 'suhu',
        jenis: 'selisih',
        p: 18,
        q: -5,
        a: 18,
        op: '-',
        b: -5,
        jawab: 23,
        satuan: '°C',
        cerita:
          'Pada pagi yang sama, suhu di Kota Bandung 18 °C, sedangkan di sekitar Puncak Jaya −5 °C.',
        tanya: 'Kalimat matematika mana yang tepat untuk selisih suhu kedua tempat?',
        opsi: [
          { id: 'ok', label: '18 − (−5)' },
          { id: 'x1', label: '18 − 5' },
          { id: 'x2', label: '−5 − 18' },
          { id: 'x3', label: '18 + (−5)' },
        ],
        correct: 'ok',
        umpan: {
          ok: 'Tepat: suhu yang lebih tinggi (18) dikurangi suhu yang lebih rendah (−5).',
          x1: 'Suhu Puncak Jaya −5 °C, bukan 5 °C.',
          x2: 'Urutannya terbalik; selisih suhu tidak bernilai negatif.',
          x3: 'Itu suhu Bandung bila turun 5 °C, bukan selisih kedua tempat.',
        },
        hints: ['18 − (−5) = 18 + 5.'],
        temuan: 'Selisihnya 23 °C — Puncak Jaya jauh lebih dingin daripada Bandung.',
      },
      {
        id: 'm5',
        konteks: 'ketinggian',
        jenis: 'perubahan',
        awal: -40,
        arah: 'turun',
        besar: 25,
        a: -40,
        op: '-',
        b: 25,
        jawab: -65,
        satuan: 'm',
        cerita:
          'Sebuah kapal selam berada di kedalaman 40 m di bawah permukaan laut, lalu turun lagi 25 m.',
        tanya: 'Kalimat matematika mana yang tepat untuk posisi kapal selam sekarang?',
        opsi: [
          { id: 'ok', label: '−40 − 25' },
          { id: 'x1', label: '−40 + 25' },
          { id: 'x2', label: '40 − 25' },
          { id: 'x3', label: '−40 − (−25)' },
        ],
        correct: 'ok',
        umpan: {
          ok: 'Tepat: posisi awal −40, turun 25 → dikurangi 25.',
          x1: 'Kapal selam TURUN, jadi dikurangi, bukan ditambah.',
          x2: 'Posisi awalnya di bawah permukaan laut, jadi ditulis −40.',
          x3: 'Mengurangkan −25 sama dengan menambah 25 — artinya naik, bukan turun.',
        },
        hints: ['−40 − 25 = −40 + (−25). Dari −40 bergerak 25 langkah lagi ke bawah (kiri).'],
        temuan: 'Kapal selam berada di −65 m, yaitu 65 m di bawah permukaan laut.',
      },
      {
        id: 'm6',
        konteks: 'saldo',
        jenis: 'perubahan',
        awal: -4000,
        arah: 'turun',
        besar: 6000,
        a: -4000,
        op: '-',
        b: 6000,
        jawab: -10000,
        satuan: 'rupiah',
        cerita:
          'Hari Senin, kantin kejujuran rugi Rp4.000 sehingga saldonya −Rp4.000. Hari Selasa kantin harus membayar plastik pembungkus Rp6.000 tanpa pemasukan.',
        tanya: 'Kalimat matematika mana yang tepat untuk saldo kantin setelah hari Selasa?',
        opsi: [
          { id: 'ok', label: '−4.000 − 6.000' },
          { id: 'x1', label: '−4.000 + 6.000' },
          { id: 'x2', label: '6.000 − 4.000' },
          { id: 'x3', label: '4.000 − 6.000' },
        ],
        correct: 'ok',
        umpan: {
          ok: 'Tepat: saldo awal −4.000, membayar 6.000 → dikurangi 6.000.',
          x1: 'Membayar membuat saldo berkurang, bukan bertambah.',
          x2: 'Saldo awal −4.000; urutan dan tandanya tidak boleh diubah.',
          x3: 'Saldo awal kantin −4.000 (rugi), bukan 4.000.',
        },
        hints: ['Utang 4.000 ditambah utang 6.000 lagi.'],
        temuan: 'Saldo kantin −Rp10.000: kerugiannya makin besar.',
      },
    ],
    temuan: [
      'Cerita perubahan: <strong>keadaan awal ± besar perubahan</strong> — naik/menerima memakai +, turun/membayar memakai −.',
      'Cerita selisih: <strong>keadaan yang lebih tinggi − keadaan yang lebih rendah</strong>; hasilnya tidak pernah negatif.',
      'Hasil perhitungan harus ditafsirkan kembali: −65 m berarti 65 m di bawah permukaan laut; −Rp10.000 berarti rugi/utang Rp10.000.',
    ],
    nextLabel: 'Lanjut: Buktikan Temuanmu →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji pernyataan dengan temuan, lalu membandingkannya dengan dugaan dan hipotesis awal.',
    guru: 'Minta murid membuktikan setiap pernyataan dengan lompatan garis bilangan atau aturan a − b = a + (−b), bukan sekadar menebak. Bahas miskonsepsi "−6 − 4 = −2".',
    judulA: 'A. Benar atau salah?',
    opsiPernyataan: [
      { id: 'benar', label: '✓ Benar' },
      { id: 'salah', label: '✗ Salah' },
    ],
    pernyataan: [
      {
        id: 'v1',
        teks: 'Menambahkan bilangan negatif membuat hasilnya lebih kecil daripada bilangan semula.',
        correct: 'benar',
        explanation: 'Menambah bilangan negatif berarti melompat ke kiri, mis. 5 + (−8) = −3.',
      },
      {
        id: 'v2',
        teks: 'Hasil penjumlahan dua bilangan bulat selalu lebih besar daripada kedua bilangan itu.',
        correct: 'salah',
        explanation: 'Contoh penyangkal: −3 + (−5) = −8, lebih kecil daripada −3 maupun −5.',
      },
      {
        id: 'v3',
        teks: '7 − (−2) = 7 + 2 = 9.',
        correct: 'benar',
        explanation: 'Mengurangkan −2 sama dengan menambah lawannya, yaitu 2.',
      },
      {
        id: 'v4',
        teks: '−6 − 4 = −2, karena 6 − 4 = 2.',
        correct: 'salah',
        explanation: '−6 − 4 = −6 + (−4) = −10. Tanda negatif pada −6 tidak boleh diabaikan.',
      },
      {
        id: 'v5',
        teks: 'Suhu −3 °C yang turun 4 °C menjadi −7 °C.',
        correct: 'benar',
        explanation: '−3 − 4 = −7: dari −3 bergerak 4 langkah ke bawah.',
      },
      {
        id: 'v6',
        teks: 'Saldo −Rp5.000 yang menerima Rp5.000 menjadi Rp10.000.',
        correct: 'salah',
        explanation: '−5.000 + 5.000 = 0. Bilangan ditambah lawannya hasilnya 0 — utangnya lunas.',
      },
      {
        id: 'v7',
        teks: 'Selisih ketinggian 300 m dan −50 m adalah 250 m.',
        correct: 'salah',
        explanation: 'Selisihnya 300 − (−50) = 300 + 50 = 350 m.',
      },
    ],
    judulB: 'B. Bandingkan dengan dugaanmu',
    nextLabel: 'Lanjut: Tarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Merumuskan aturan penjumlahan dan pengurangan bilangan bulat serta cara memodelkan masalah kontekstual.',
    guru: 'Minta beberapa pasangan membacakan kesimpulannya dengan kalimat sendiri sebelum memeriksa. Tuliskan rangkuman di papan tulis.',
    instruksi:
      'Lengkapi setiap kalimat dengan memilih potongan yang tepat. Setiap potongan hanya dipakai sekali, dan ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      {
        id: 'g1',
        awal: 'Menjumlahkan bilangan positif pada garis bilangan berarti',
        correct: 'b1',
      },
      { id: 'g2', awal: 'Menjumlahkan bilangan negatif berarti', correct: 'b2' },
      { id: 'g3', awal: 'Mengurangkan suatu bilangan sama dengan', correct: 'b3' },
      {
        id: 'g4',
        awal: 'Pada cerita, keadaan yang naik, bertambah, atau menerima uang dimodelkan dengan',
        correct: 'b4',
      },
      {
        id: 'g5',
        awal: 'Keadaan yang turun, berkurang, atau membayar dimodelkan dengan',
        correct: 'b5',
      },
      { id: 'g6', awal: 'Selisih dua keadaan dihitung dengan', correct: 'b6' },
    ],
    bank: [
      { id: 'b1', teks: 'melompat ke kanan sebanyak bilangan itu.' },
      { id: 'b2', teks: 'melompat ke kiri sebanyak angka bilangan itu (tanpa tandanya).' },
      { id: 'b3', teks: 'menjumlahkan lawan bilangan itu: a − b = a + (−b).' },
      { id: 'b4', teks: 'menambahkan besar perubahannya (tanda +).' },
      { id: 'b5', teks: 'mengurangkan besar perubahannya (tanda −).' },
      { id: 'b6', teks: 'keadaan yang lebih tinggi dikurangi keadaan yang lebih rendah.' },
      { id: 'x1', teks: 'mengabaikan tanda negatif lalu menjumlahkan angkanya.' },
      { id: 'x2', teks: 'keadaan yang lebih rendah dikurangi keadaan yang lebih tinggi.' },
      { id: 'x3', teks: 'mengurangkan lawan bilangan itu: a − b = a − (−b).' },
    ],
    rangkuman: [
      '<strong>a + b</strong>: dari a, lompat ke <strong>kanan</strong> bila b positif dan ke <strong>kiri</strong> bila b negatif. Contoh: −4 + 7 = 3; 5 + (−8) = −3.',
      '<strong>a − b = a + (−b)</strong>. Contoh: 4 − 7 = 4 + (−7) = −3; −2 − (−5) = −2 + 5 = 3.',
      'Perubahan: <strong>awal + naik</strong> atau <strong>awal − turun</strong>. Contoh: −12 m naik 5 m → −12 + 5 = −7 m.',
      'Selisih: <strong>tinggi − rendah</strong>. Contoh: 18 °C dan −5 °C → 18 − (−5) = 23 °C.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Delapan soal diambil acak dari bank (komposisi per jenis).
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan penjumlahan dan pengurangan bilangan bulat untuk menyelesaikan masalah suhu, ketinggian, dan saldo.',
    guru: 'Setiap murid mendapat soal acak yang berbeda. Minta murid menuliskan kalimat matematikanya di buku sebelum mengetik jawaban. Untuk saldo, jawaban diketik tanpa "Rp".',
    instruksi:
      'Tulis kalimat matematikanya di bukumu, lalu ketik hasilnya. Gunakan tanda − untuk bilangan negatif. Untuk saldo, ketik angkanya saja tanpa "Rp", mis. −15.000.',
    banyak: 8,
    komposisi: { input: 6, choice: 2 },
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: 'suhu',
        jenis: 'perubahan',
        awal: -9,
        arah: 'naik',
        besar: 6,
        a: -9,
        op: '+',
        b: 6,
        jawab: -3,
        cerita:
          'Suhu di sekitar Puncak Jaya pukul 04.00 adalah −9 °C. Menjelang siang suhu naik 6 °C.',
        pertanyaan: 'Berapa derajat Celsius suhu menjelang siang?',
        hints: ['Naik → ditambah. Hitung −9 + 6.', 'Dari −9, lompat 6 langkah ke kanan.'],
        reveal: '−9 + 6 = −3, jadi suhunya −3 °C.',
        explanation: 'Suhu masih di bawah nol walaupun sudah naik.',
      },
      {
        id: 't2',
        type: 'input',
        konteks: 'suhu',
        jenis: 'perubahan',
        awal: 3,
        arah: 'turun',
        besar: 8,
        a: 3,
        op: '-',
        b: 8,
        jawab: -5,
        cerita:
          'Sebotol jus bersuhu 3 °C di lemari pendingin dipindahkan ke freezer sehingga suhunya turun 8 °C.',
        pertanyaan: 'Berapa derajat Celsius suhu jus sekarang?',
        hints: ['Turun → dikurangi. Hitung 3 − 8.', '3 − 8 = 3 + (−8).'],
        reveal: '3 − 8 = −5, jadi suhunya −5 °C.',
        explanation: 'Dari 3 turun 3 langkah sampai 0, lalu 5 langkah lagi ke −5.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: 'suhu',
        jenis: 'selisih',
        p: 27,
        q: -15,
        a: 27,
        op: '-',
        b: -15,
        jawab: 42,
        cerita: 'Suhu ruang kelas 27 °C, sedangkan suhu freezer kantin −15 °C.',
        pertanyaan: 'Berapa derajat Celsius selisih kedua suhu itu?',
        hints: ['Selisih = suhu tinggi − suhu rendah = 27 − (−15).', '27 − (−15) = 27 + 15.'],
        reveal: '27 − (−15) = 27 + 15 = 42, jadi selisihnya 42 °C.',
        explanation: 'Mengurangkan −15 sama dengan menambah 15.',
      },
      {
        id: 't4',
        type: 'input',
        konteks: 'suhu',
        jenis: 'perubahan',
        awal: -2,
        arah: 'turun',
        besar: 5,
        a: -2,
        op: '-',
        b: 5,
        jawab: -7,
        cerita:
          'Suhu di Ranu Kumbolo pukul 20.00 adalah −2 °C. Menjelang subuh suhunya turun 5 °C.',
        pertanyaan: 'Berapa derajat Celsius suhu menjelang subuh?',
        hints: ['Turun → dikurangi. Hitung −2 − 5.', '−2 − 5 = −2 + (−5).'],
        reveal: '−2 − 5 = −7, jadi suhunya −7 °C.',
        explanation: 'Suhu negatif yang turun lagi menjadi makin negatif.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: 'ketinggian',
        jenis: 'perubahan',
        awal: -14,
        arah: 'naik',
        besar: 9,
        a: -14,
        op: '+',
        b: 9,
        jawab: -5,
        cerita: 'Seorang penyelam berada 14 m di bawah permukaan laut, lalu naik 9 m.',
        pertanyaan:
          'Pada ketinggian berapa meter posisi penyelam sekarang? (bawah permukaan laut ditulis negatif)',
        hints: ['Posisi awal −14, naik → ditambah 9.'],
        reveal: '−14 + 9 = −5, jadi penyelam di −5 m.',
        explanation: 'Penyelam masih 5 m di bawah permukaan laut.',
      },
      {
        id: 't6',
        type: 'input',
        konteks: 'ketinggian',
        jenis: 'perubahan',
        awal: 12,
        arah: 'turun',
        besar: 15,
        a: 12,
        op: '-',
        b: 15,
        jawab: -3,
        cerita:
          'Seekor burung camar terbang 12 m di atas permukaan laut, lalu menukik turun 15 m untuk menangkap ikan.',
        pertanyaan: 'Pada ketinggian berapa meter burung itu sekarang?',
        hints: ['Turun → dikurangi: 12 − 15.', '12 langkah turun sampai 0, lalu 3 langkah lagi.'],
        reveal: '12 − 15 = −3, jadi burung berada di −3 m.',
        explanation: 'Burung camar menyelam 3 m di bawah permukaan laut.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: 'ketinggian',
        jenis: 'selisih',
        p: 2930,
        q: -430,
        a: 2930,
        op: '-',
        b: -430,
        jawab: 3360,
        cerita:
          'Puncak Gunung Merapi berada sekitar 2.930 m di atas permukaan laut, sedangkan tepi Laut Mati sekitar 430 m di bawah permukaan laut.',
        pertanyaan: 'Berapa meter selisih ketinggian kedua tempat itu?',
        hints: ['Selisih = 2.930 − (−430).', '2.930 − (−430) = 2.930 + 430.'],
        reveal: '2.930 − (−430) = 2.930 + 430 = 3.360, jadi selisihnya 3.360 m.',
        explanation: 'Jaraknya meliputi bagian di atas dan di bawah permukaan laut.',
      },
      {
        id: 't8',
        type: 'input',
        konteks: 'ketinggian',
        jenis: 'perubahan',
        awal: -60,
        arah: 'naik',
        besar: 25,
        a: -60,
        op: '+',
        b: 25,
        jawab: -35,
        cerita: 'Kapal selam berada pada posisi −60 m, lalu naik 25 m.',
        pertanyaan: 'Pada posisi berapa meter kapal selam sekarang?',
        hints: ['Naik → ditambah: −60 + 25.'],
        reveal: '−60 + 25 = −35, jadi kapal selam di −35 m.',
        explanation: 'Kapal selam masih 35 m di bawah permukaan laut.',
      },
      {
        id: 't9',
        type: 'input',
        konteks: 'saldo',
        jenis: 'perubahan',
        awal: -25000,
        arah: 'naik',
        besar: 40000,
        a: -25000,
        op: '+',
        b: 40000,
        jawab: 15000,
        cerita:
          'Saldo kas OSIS −Rp25.000 karena berutang. Kemudian OSIS menerima sumbangan Rp40.000.',
        pertanyaan: 'Berapa rupiah saldo kas OSIS sekarang? (ketik tanpa "Rp")',
        hints: ['Menerima → ditambah: −25.000 + 40.000.'],
        reveal: '−25.000 + 40.000 = 15.000, jadi saldonya Rp15.000.',
        explanation: 'Utang Rp25.000 lunas dan masih tersisa Rp15.000.',
      },
      {
        id: 't10',
        type: 'input',
        konteks: 'saldo',
        jenis: 'perubahan',
        awal: 10000,
        arah: 'turun',
        besar: 18000,
        a: 10000,
        op: '-',
        b: 18000,
        jawab: -8000,
        cerita:
          'Dina punya uang Rp10.000, lalu membeli buku seharga Rp18.000 dengan meminjam kekurangannya pada kakak.',
        pertanyaan:
          'Bagaimana keadaan uang Dina sekarang, ditulis sebagai bilangan bulat? (ketik tanpa "Rp")',
        hints: ['Membayar → dikurangi: 10.000 − 18.000.'],
        reveal: '10.000 − 18.000 = −8.000, jadi keadaan uangnya −Rp8.000.',
        explanation: 'Bilangan negatif menunjukkan Dina berutang Rp8.000 pada kakaknya.',
      },
      {
        id: 't11',
        type: 'input',
        konteks: 'saldo',
        jenis: 'selisih',
        p: 12000,
        q: -5000,
        a: 12000,
        op: '-',
        b: -5000,
        jawab: 17000,
        cerita:
          'Kantin kejujuran untung Rp12.000 pada hari Senin, tetapi rugi Rp5.000 (−5.000) pada hari Selasa.',
        pertanyaan: 'Berapa rupiah selisih hasil kantin hari Senin dan Selasa? (ketik tanpa "Rp")',
        hints: ['Selisih = 12.000 − (−5.000).', '12.000 − (−5.000) = 12.000 + 5.000.'],
        reveal: '12.000 − (−5.000) = 17.000, jadi selisihnya Rp17.000.',
        explanation: 'Dari rugi Rp5.000 ke untung Rp12.000 berjarak Rp17.000.',
      },
      {
        id: 'c1',
        type: 'choice',
        konteks: 'suhu',
        cerita: 'Suhu pagi di Dieng −3 °C dan siang harinya 5 °C.',
        pertanyaan: 'Kalimat matematika mana yang tepat untuk menghitung kenaikan suhunya?',
        options: [
          { id: 'a', label: '5 − (−3)' },
          { id: 'b', label: '5 − 3' },
          { id: 'c', label: '−3 − 5' },
          { id: 'd', label: '5 + (−3)' },
        ],
        correct: 'a',
        explanation: 'Kenaikan = suhu siang − suhu pagi = 5 − (−3) = 5 + 3 = 8 °C.',
      },
      {
        id: 'c2',
        type: 'choice',
        konteks: 'saldo',
        cerita:
          'Saldo tabungan Raka −Rp7.000 karena berutang. Raka lalu menerima uang saku Rp7.000.',
        pertanyaan: 'Berapa saldo Raka sekarang?',
        options: [
          { id: 'a', label: 'Rp0' },
          { id: 'b', label: 'Rp14.000' },
          { id: 'c', label: '−Rp14.000' },
          { id: 'd', label: '−Rp7.000' },
        ],
        correct: 'a',
        explanation: '−7.000 + 7.000 = 0. Bilangan ditambah lawannya hasilnya 0.',
      },
      {
        id: 'c3',
        type: 'choice',
        konteks: 'ketinggian',
        cerita: 'Penyelam A berada di −8 m dan penyelam B di −13 m.',
        pertanyaan: 'Pernyataan manakah yang tepat?',
        options: [
          { id: 'a', label: 'A berada 5 m lebih tinggi daripada B.' },
          { id: 'b', label: 'A berada 21 m lebih tinggi daripada B.' },
          { id: 'c', label: 'B berada 5 m lebih tinggi daripada A.' },
          { id: 'd', label: 'A berada 5 m lebih rendah daripada B.' },
        ],
        correct: 'a',
        explanation: '−8 lebih tinggi daripada −13. Selisihnya −8 − (−13) = −8 + 13 = 5 m.',
      },
      {
        id: 'c4',
        type: 'choice',
        konteks: 'suhu',
        cerita:
          'Pukul 22.00 suhu di sebuah kota di Eropa −6 °C. Pukul 06.00 keesokan harinya suhunya −4 °C.',
        pertanyaan: 'Bagaimana perubahan suhunya?',
        options: [
          { id: 'a', label: 'Naik 2 °C' },
          { id: 'b', label: 'Naik 10 °C' },
          { id: 'c', label: 'Turun 10 °C' },
          { id: 'd', label: 'Turun 2 °C' },
        ],
        correct: 'a',
        explanation: '−4 − (−6) = −4 + 6 = 2. Hasilnya positif, berarti suhu naik 2 °C.',
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
    goal: 'Merefleksikan proses menemukan aturan penjumlahan dan pengurangan bilangan bulat serta penerapannya.',
    guru: 'Beri waktu hening 3 menit untuk menulis. Jawaban penilaian diri dapat menjadi dasar pengelompokan pada pertemuan berikutnya (perkalian & pembagian bilangan bulat).',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri mengapa 5 − (−3) hasilnya 8, bukan 2.',
        placeholder: 'Hasilnya 8 karena …',
      },
      {
        id: 'r2',
        teks: 'Buat satu cerita sendiri tentang suhu, ketinggian, atau saldo yang memakai bilangan negatif, lalu tulis kalimat matematikanya.',
        placeholder: 'Ceritaku: … Kalimat matematikanya: …',
      },
      {
        id: 'r3',
        teks: 'Bagian mana yang masih membingungkan atau ingin kamu pelajari lebih lanjut?',
        placeholder: 'Aku masih bingung tentang …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu menyelesaikan masalah suhu, ketinggian, dan saldo dengan penjumlahan dan pengurangan bilangan bulat?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'cukup', label: '🙂 Cukup yakin — sesekali masih perlu berpikir' },
      { id: 'ragu', label: '🤔 Masih ragu — perlu latihan lagi' },
      { id: 'belum', label: '🙋 Belum paham — aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, kamu menemukannya sendiri!',
    teks: 'Kamu telah menemukan aturan penjumlahan dan pengurangan bilangan bulat dan memakainya untuk menyelesaikan masalah suhu, ketinggian, dan saldo.',
    contoh: [
      { konteks: 'suhu', teks: '−4 + 7 = 3', keterangan: 'suhu −4 °C naik 7 °C menjadi 3 °C' },
      {
        konteks: 'ketinggian',
        teks: '45 − (−30) = 75',
        keterangan: 'selisih mercusuar dan bangkai kapal 75 m',
      },
      {
        konteks: 'saldo',
        teks: '20.000 − 35.000 = −15.000',
        keterangan: 'kas kelas berutang Rp15.000',
      },
    ],
    capaian: [
      'Menggambarkan penjumlahan dan pengurangan bilangan bulat sebagai lompatan pada garis bilangan.',
      'Menemukan aturan a − b = a + (−b) dari pola.',
      'Menuliskan kalimat matematika dari cerita perubahan dan selisih.',
      'Menghitung dan menafsirkan hasilnya dalam konteks suhu, ketinggian, dan saldo.',
    ],
  },
};
