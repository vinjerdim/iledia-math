'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Perkalian & Pembagian Bilangan Bulat
   Fase D — SMP Kelas 7

   Tujuan Pembelajaran:
   Mengalikan dan membagi bilangan bulat serta menerapkan sifat-sifat
   operasi hitung dan urutan pengerjaan untuk menyelesaikan masalah
   kontekstual.

   Model pembelajaran: INQUIRY LEARNING (Inkuiri Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Orientasi .................. tahap 'orientasi'
     Sintaks 2 — Merumuskan masalah ......... tahap 'masalah'
     Sintaks 3 — Merumuskan hipotesis ....... tahap 'hipotesis'
     Sintaks 4 — Mengumpulkan data .......... tahap 'dataKali' & 'dataBagi'
     Sintaks 5 — Menguji hipotesis .......... tahap 'uji'
     Sintaks 4–5 (siklus inkuiri kedua) ..... tahap 'sifat'
     Sintaks 6 — Merumuskan kesimpulan ...... tahap 'simpulan'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas:
     1. Orientasi   — penyelam di Bunaken turun 3 m tiap menit selama
                      4 menit; murid MENDUGA posisinya dan menduga
                      hasil teka-teki (−3) × (−4) (tidak dinilai).
     2. Masalah     — memilih rumusan masalah yang tepat.
     3. Hipotesis   — mengisi tabel dugaan tanda hasil kali & bagi,
                      lalu menulis hipotesis dengan kalimat sendiri.
     4. Data (×)    — (A) perkalian sebagai penjumlahan berulang pada
                      garis bilangan; (B) melanjutkan pola tabel
                      (−3) × 3, (−3) × 2, … (−3) × (−3); (C) memilih
                      pola yang ditemukan.
     5. Data (:)    — pembagian sebagai kebalikan perkalian, lalu
                      memasangkan pembagian dengan perkalian pemeriksa.
     6. Uji         — membandingkan tabel dugaan dengan data, memilah
                      tanda hasil, dan menanggapi miskonsepsi.
     7. Sifat       — siklus inkuiri kedua: menyelidiki sifat
                      komutatif, asosiatif, distributif (dan menguji
                      apakah berlaku pada pembagian), lalu urutan
                      pengerjaan operasi campuran & hitung cepat.
     8. Simpulan    — menyusun kalimat kesimpulan dari bank kalimat.
     9. Uji terap   — soal kontekstual suhu, skor kuis, kedalaman,
                      utang, belanja, dan kerugian toko.
    10. Refleksi    — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan.
   ============================================================ */

var DATA = {
  /* Rentang garis bilangan penjumlahan berulang. */
  garis: { min: -13, max: 13 },

  /* Opsi tanda yang dipakai tabel dugaan & tahap uji. */
  opsiTanda: [
    { id: 'positif', label: 'Positif (+)' },
    { id: 'negatif', label: 'Negatif (−)' },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    syntax: 'Inquiry Learning · Sintaks 1',
    goal: 'Mengamati masalah perkalian bilangan bulat dan menduga hasilnya.',
    guru: 'Bacakan cerita dan tampilkan garis bilangan di layar kelas. Terima semua dugaan tanpa membenarkan atau menyalahkan. Tuliskan beberapa dugaan berbeda untuk teka-teki (−3) × (−4) di papan tulis, lalu biarkan perbedaan itu menjadi pertanyaan yang akan diselidiki kelas.',
    judul: 'Menyelam di Taman Laut Bunaken',
    cerita:
      'Rara mulai menyelam dari permukaan laut (0 m). Ia turun dengan kecepatan tetap, yaitu 3 m setiap menit. Setiap menit posisinya berubah −3 m.',
    menit: 4,
    perubahan: -3,
    pertanyaan: 'Menurut dugaanmu, di mana posisi Rara setelah 4 menit?',
    opsi: [
      { id: 'm12', label: '−12 m (12 m di bawah permukaan)' },
      { id: 'p12', label: '12 m (12 m di atas permukaan)' },
      { id: 'm7', label: '−7 m (7 m di bawah permukaan)' },
      { id: 'm1', label: '−1 m (1 m di bawah permukaan)' },
    ],
    benar: 'm12',
    tekaJudul: 'Teka-teki untuk diselidiki',
    tekaTeks:
      'Perkalian 4 × (−3) masih bisa dibayangkan sebagai lompatan berulang. Namun, bagaimana dengan perkalian dua bilangan negatif?',
    tekaPertanyaan: 'Menurut dugaanmu, berapa hasil (−3) × (−4)?',
    tekaOpsi: [
      { id: 't1', label: '−12' },
      { id: 't2', label: '12' },
      { id: 't3', label: '−7' },
      { id: 't4', label: '1' },
    ],
    tekaBenar: 't2',
    alasanLabel: 'Bagaimana kamu memperoleh dugaan-dugaan itu?',
    alasanPlaceholder: 'Tulis caramu berpikir dengan kalimatmu sendiri…',
    teaserJudul: 'Masalah serupa juga muncul di tempat lain',
    teaser: [
      {
        ikon: '📝',
        teks: 'Pada lomba cerdas cermat, jawaban benar mendapat +4 dan jawaban salah mendapat −2. Bima sudah punya 8 poin, lalu 3 kali menjawab salah. Berapa skornya sekarang?',
      },
      {
        ikon: '💰',
        teks: 'Kas kelas berutang Rp60.000 dan utang itu ditanggung rata oleh 12 murid. Berapa bagian setiap murid?',
      },
    ],
    catatan:
      'Belum ada jawaban benar atau salah di tahap ini. Dugaanmu disimpan, lalu kamu sendiri yang mengujinya pada tahap Uji Hipotesis.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MERUMUSKAN MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: 'Inquiry Learning · Sintaks 2',
    goal: 'Merumuskan pertanyaan penyelidikan tentang perkalian dan pembagian bilangan bulat.',
    guru: 'Bila murid memilih rumusan yang kurang tepat, ajukan pertanyaan balik: "Kalau pertanyaan itu terjawab, apakah kita bisa menghitung posisi Rara, skor Bima, dan bagian utang setiap murid?"',
    pengantar:
      'Ketiga masalah tadi memuat perkalian atau pembagian dengan bilangan negatif, dan skor Bima memuat operasi campuran (penjumlahan dan perkalian sekaligus).',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      { id: 'r1', label: 'Berapa kedalaman laut di Taman Laut Bunaken?' },
      {
        id: 'r2',
        label: 'Apakah tanda minus boleh diabaikan dulu, lalu ditambahkan di akhir perhitungan?',
      },
      {
        id: 'r3',
        label:
          'Bagaimana aturan tanda hasil perkalian dan pembagian bilangan bulat, dan bagaimana urutan mengerjakannya bila operasinya bercampur?',
      },
      { id: 'r4', label: 'Mengapa penyelam harus turun perlahan-lahan?' },
    ],
    correct: 'r3',
    umpan: {
      r1: 'Pertanyaan ini menarik, tetapi jawabannya hanya sebuah fakta. Pertanyaan ini tidak membantu kita menghitung posisi, skor, atau bagian utang.',
      r2: 'Pertanyaan ini sudah mengandung jawaban yang belum tentu benar. Rumusan masalah yang baik mengajak kita menyelidiki, bukan menebak caranya lebih dulu.',
      r3: 'Tepat. Pertanyaan ini mencakup aturan tanda perkalian, aturan tanda pembagian, dan urutan pengerjaan yang diperlukan ketiga masalah.',
      r4: 'Ini pertanyaan untuk pelajaran IPA atau olahraga. Kita perlu pertanyaan matematika yang membantu menghitung.',
    },
    nextLabel: 'Lanjut: Rumuskan Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MERUMUSKAN HIPOTESIS
     ---------------------------------------------------------- */
  hipotesis: {
    kicker: 'Tahap 3 · Merumuskan Hipotesis',
    syntax: 'Inquiry Learning · Sintaks 3',
    goal: 'Membuat dugaan sementara tentang tanda hasil perkalian dan pembagian bilangan bulat.',
    guru: 'Tegaskan bahwa hipotesis adalah dugaan yang akan diuji, jadi tidak ada nilai di tahap ini. Minta murid memberi alasan untuk setidaknya satu sel, misalnya "(+) × (−) negatif karena seperti lompatan negatif yang diulang".',
    instruksi:
      'Isilah tabel dugaan di bawah ini. Untuk setiap pola, pilih tanda hasil yang menurutmu benar. Kamu belum perlu yakin karena dugaan ini akan kamu uji sendiri.',
    sel: [
      { id: 'h1', label: '(+) × (+)', contoh: '3 × 4', correct: 'positif' },
      { id: 'h2', label: '(+) × (−)', contoh: '3 × (−4)', correct: 'negatif' },
      { id: 'h3', label: '(−) × (+)', contoh: '(−3) × 4', correct: 'negatif' },
      { id: 'h4', label: '(−) × (−)', contoh: '(−3) × (−4)', correct: 'positif' },
      { id: 'h5', label: '(−) : (+)', contoh: '(−12) : 4', correct: 'negatif' },
      { id: 'h6', label: '(−) : (−)', contoh: '(−12) : (−4)', correct: 'positif' },
    ],
    hipotesisLabel: 'Tulis hipotesismu dengan kalimatmu sendiri',
    hipotesisPlaceholder: 'Contoh: saya menduga hasil kali dua bilangan negatif adalah … karena …',
    nextLabel: 'Lanjut: Kumpulkan Data Perkalian →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MENGUMPULKAN DATA: PERKALIAN
     ---------------------------------------------------------- */
  dataKali: {
    kicker: 'Tahap 4 · Mengumpulkan Data: Perkalian',
    syntax: 'Inquiry Learning · Sintaks 4',
    goal: 'Mengumpulkan data hasil perkalian bilangan bulat melalui penjumlahan berulang dan pola.',
    guru: 'Pada bagian A, minta murid membacakan "3 × (−2) artinya tiga kali lompatan (−2)". Pada bagian B, tekankan cara membaca pola: pengali turun 1, hasil naik 3. Tanyakan: "Kalau polanya terus berlanjut melewati 0, apa yang terjadi?"',
    instruksiA:
      'Bagian A. Perkalian n × b dapat dipandang sebagai penjumlahan berulang: n kali lompatan sejauh b dari titik 0. Amati lompatannya, lalu tulis hasilnya.',
    ulang: [
      {
        id: 'u1',
        n: 3,
        b: 2,
        hints: ['Tiga kali lompatan 2 ke kanan dari 0.', '2 + 2 + 2 = 6.'],
      },
      {
        id: 'u2',
        n: 3,
        b: -2,
        hints: ['Tiga kali lompatan 2 ke kiri dari 0.', '(−2) + (−2) + (−2): hitung −2, −4, −6.'],
      },
      {
        id: 'u3',
        n: 4,
        b: -3,
        hints: [
          'Empat kali lompatan 3 ke kiri dari 0, seperti Rara yang turun 3 m setiap menit.',
          'Hitung: −3, −6, −9, −12.',
        ],
      },
    ],
    selesaiA:
      'Positif × negatif menghasilkan bilangan <strong>negatif</strong>, karena lompatan negatif yang diulang terus bergerak ke kiri. Posisi Rara setelah 4 menit adalah 4 × (−3) = −12 m.',
    instruksiB:
      'Bagian B. Bagaimana bila bilangan pengalinya negatif? Lompatan berulang tidak lagi bisa dipakai, jadi kita gunakan pola. Perhatikan tabel: setiap baris, pengalinya berkurang 1. Lanjutkan polanya!',
    polaA: -3,
    pola: [
      { b: 3, hasil: -9, tampil: true },
      { b: 2, hasil: -6, tampil: true },
      { b: 1, hasil: -3, tampil: true },
      { b: 0, hasil: 0, hints: ['Hasilnya naik 3 dari baris sebelumnya: −3 + 3.'] },
      {
        b: -1,
        hasil: 3,
        hints: ['Pengalinya turun 1 lagi, maka hasilnya naik 3 lagi: 0 + 3.'],
      },
      { b: -2, hasil: 6, hints: ['Teruskan pola: setiap pengali turun 1, hasil naik 3.'] },
      { b: -3, hasil: 9, hints: ['Tambahkan 3 pada hasil baris sebelumnya.'] },
    ],
    polaLabel: 'Dari data bagian A dan B, pola apa yang kamu temukan?',
    polaOpsi: [
      { id: 'q1', label: 'Tanda hasil perkalian selalu mengikuti tanda bilangan pertama.' },
      { id: 'q2', label: 'Bila ada bilangan negatif, hasil perkalian pasti negatif.' },
      {
        id: 'q3',
        label:
          'Bila pengalinya turun 1, hasilnya naik 3. Karena itu, <strong>negatif × negatif</strong> menghasilkan bilangan <strong>positif</strong>, sedangkan positif × negatif menghasilkan bilangan negatif.',
      },
      { id: 'q4', label: 'Tanda hasil perkalian mengikuti bilangan yang nilainya lebih besar.' },
    ],
    polaCorrect: 'q3',
    polaUmpan: {
      q1: 'Periksa data (−3) × (−2) = 6. Bilangan pertamanya negatif, tetapi hasilnya positif.',
      q2: 'Periksa baris (−3) × (−1) = 3 dan (−3) × (−2) = 6 pada tabel. Hasilnya positif.',
      q3: 'Tepat! Pola itu memperlihatkan mengapa negatif × negatif = positif.',
      q4: 'Periksa (−3) × 2 = −6: bilangan yang lebih besar adalah 2 (positif), tetapi hasilnya negatif.',
    },
    nextLabel: 'Lanjut: Kumpulkan Data Pembagian →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGUMPULKAN DATA: PEMBAGIAN
     ---------------------------------------------------------- */
  dataBagi: {
    kicker: 'Tahap 5 · Mengumpulkan Data: Pembagian',
    syntax: 'Inquiry Learning · Sintaks 4',
    goal: 'Mengumpulkan data hasil pembagian bilangan bulat dengan memakai hubungan pembagian dan perkalian.',
    guru: 'Ingatkan kembali bahwa 12 : 3 = 4 karena 4 × 3 = 12. Dorong murid menguji setiap tebakan hasil bagi dengan perkalian, bukan menghafal aturan tanda.',
    pengantar:
      'Pembagian adalah kebalikan perkalian. Contoh: 12 : 3 = 4, karena 4 × 3 = 12. Jadi, untuk mencari a : b, carilah bilangan yang jika dikali b hasilnya a.',
    instruksi:
      'Temukan hasil setiap pembagian. Periksa jawabanmu dengan perkalian dan aturan tanda perkalian yang sudah kamu temukan.',
    kasus: [
      {
        id: 'b1',
        a: 12,
        b: -3,
        hints: [
          'Cari bilangan yang jika dikali (−3) hasilnya 12 (positif).',
          'Positif × negatif = negatif, jadi bilangan itu harus negatif. Coba (−4) × (−3).',
        ],
      },
      {
        id: 'b2',
        a: -12,
        b: 3,
        hints: ['Cari bilangan yang jika dikali 3 hasilnya −12.', '(−4) × 3 = −12.'],
      },
      {
        id: 'b3',
        a: -12,
        b: -3,
        hints: [
          'Cari bilangan yang jika dikali (−3) hasilnya −12.',
          '4 × (−3) = −12, jadi hasilnya bilangan positif.',
        ],
      },
      {
        id: 'b4',
        a: -20,
        b: -4,
        hints: ['Cari bilangan yang jika dikali (−4) hasilnya −20.', '5 × (−4) = −20.'],
      },
    ],
    instruksiCocok:
      'Pilih hasil yang benar beserta perkalian pemeriksanya untuk setiap pembagian berikut.',
    cocok: [
      {
        id: 'c1',
        teks: '(−18) : 6 = …',
        options: [
          { id: 'o1', label: '3, karena 3 × 6 = 18' },
          { id: 'o2', label: '−3, karena (−3) × 6 = −18' },
          { id: 'o3', label: '−3, karena (−3) × (−6) = 18' },
          { id: 'o4', label: '3, karena 3 × (−6) = −18' },
        ],
        correct: 'o2',
        explanation:
          '(−3) × 6 = −18, jadi (−18) : 6 = −3. Tandanya berbeda, maka hasilnya negatif.',
      },
      {
        id: 'c2',
        teks: '(−18) : (−6) = …',
        options: [
          { id: 'o1', label: '3, karena 3 × 6 = 18' },
          { id: 'o2', label: '−3, karena (−3) × 6 = −18' },
          { id: 'o3', label: '−3, karena (−3) × (−6) = 18' },
          { id: 'o4', label: '3, karena 3 × (−6) = −18' },
        ],
        correct: 'o4',
        explanation: '3 × (−6) = −18, jadi (−18) : (−6) = 3. Tandanya sama, maka hasilnya positif.',
      },
      {
        id: 'c3',
        teks: '18 : (−6) = …',
        options: [
          { id: 'o1', label: '3, karena 3 × 6 = 18' },
          { id: 'o2', label: '−3, karena (−3) × 6 = −18' },
          { id: 'o3', label: '−3, karena (−3) × (−6) = 18' },
          { id: 'o4', label: '3, karena 3 × (−6) = −18' },
        ],
        correct: 'o3',
        explanation:
          '(−3) × (−6) = 18, jadi 18 : (−6) = −3. Tandanya berbeda, maka hasilnya negatif.',
      },
    ],
    temuan:
      'Aturan tanda pembagian <strong>sama</strong> dengan aturan tanda perkalian: tanda sama → hasil positif, tanda berbeda → hasil negatif.',
    nextLabel: 'Lanjut: Uji Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGUJI HIPOTESIS
     ---------------------------------------------------------- */
  uji: {
    kicker: 'Tahap 6 · Menguji Hipotesis',
    syntax: 'Inquiry Learning · Sintaks 5',
    goal: 'Membandingkan hipotesis dengan data, lalu menguji aturan tanda pada kasus baru.',
    guru: 'Undang murid yang hipotesisnya perlu direvisi untuk menjelaskan data mana yang membuatnya berubah pikiran. Tekankan bahwa merevisi hipotesis adalah bagian penting dari penyelidikan, bukan kegagalan.',
    instruksiBanding:
      'Bandingkan tabel dugaanmu di Tahap 3 dengan hasil data yang kamu kumpulkan di Tahap 4 dan 5.',
    dugaanLabel: 'Dugaanmu',
    dataLabel: 'Hasil data',
    semuaCocok: 'Semua dugaanmu terbukti oleh data. Hipotesismu diterima!',
    sebagianCocok:
      'Sebagian dugaanmu berbeda dengan data. Itu wajar dan justru berharga: data membantumu merevisi hipotesis.',
    tekaLabel: 'Dugaan teka-teki (−3) × (−4) di Tahap 1',
    tekaHasil: 'Menurut pola, (−3) × (−4) = <strong>12</strong>.',
    instruksiPilah:
      'Uji aturan tanda pada kasus baru. Tentukan tanda hasil setiap operasi tanpa menghitung seluruhnya lebih dulu.',
    opsiPilah: [
      { id: 'positif', label: 'Positif' },
      { id: 'negatif', label: 'Negatif' },
      { id: 'nol', label: 'Nol' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: '(−7) × 8',
        correct: 'negatif',
        explanation: 'Tandanya berbeda, jadi hasilnya negatif: (−7) × 8 = −56.',
      },
      {
        id: 'p2',
        teks: '(−6) × (−5)',
        correct: 'positif',
        explanation: 'Tandanya sama, jadi hasilnya positif: (−6) × (−5) = 30.',
      },
      {
        id: 'p3',
        teks: '45 : (−9)',
        correct: 'negatif',
        explanation: 'Tandanya berbeda, jadi hasilnya negatif: 45 : (−9) = −5.',
      },
      {
        id: 'p4',
        teks: '(−56) : (−8)',
        correct: 'positif',
        explanation: 'Tandanya sama, jadi hasilnya positif: (−56) : (−8) = 7.',
      },
      {
        id: 'p5',
        teks: '(−2) × (−3) × (−4)',
        correct: 'negatif',
        explanation:
          'Kerjakan dua faktor dulu: (−2) × (−3) = 6, lalu 6 × (−4) = −24. Tiga faktor negatif (ganjil) menghasilkan bilangan negatif.',
      },
      {
        id: 'p6',
        teks: '0 : (−5)',
        correct: 'nol',
        explanation:
          '0 : (−5) = 0, karena 0 × (−5) = 0. Nol bukan bilangan positif maupun negatif.',
      },
    ],
    instruksiSoal:
      'Tiga teman menuliskan jawaban berikut. Uji dengan aturan yang sudah kamu temukan, lalu pilih tanggapan yang paling tepat.',
    soal: [
      {
        id: 'v1',
        pernyataan:
          'Doni menulis <em>(−4) × (−5) = −20</em>, "karena minus bertemu minus tetap minus." Tanggapan mana yang tepat?',
        options: [
          { id: 'o1', label: 'Doni benar, karena kedua bilangan bertanda minus.' },
          { id: 'o2', label: 'Doni keliru, jawaban yang benar adalah −9.' },
          { id: 'o3', label: 'Doni keliru, jawaban yang benar adalah 9.' },
          {
            id: 'o4',
            label:
              'Doni keliru. Data pola menunjukkan negatif × negatif = positif, jadi (−4) × (−5) = 20.',
          },
        ],
        correct: 'o4',
        explanation:
          'Pada tabel pola, hasil (−3) × b naik 3 setiap kali b turun 1, sehingga negatif × negatif menjadi positif. Maka (−4) × (−5) = 20.',
      },
      {
        id: 'v2',
        pernyataan:
          'Maya menulis <em>(−24) : 6 = 4</em>, "karena 24 : 6 = 4." Tanggapan mana yang tepat?',
        options: [
          {
            id: 'o1',
            label: 'Maya keliru. (−4) × 6 = −24, jadi (−24) : 6 = −4.',
          },
          { id: 'o2', label: 'Maya benar, tanda minus tidak memengaruhi pembagian.' },
          { id: 'o3', label: 'Maya keliru, jawaban yang benar adalah −30.' },
          { id: 'o4', label: 'Maya keliru, jawaban yang benar adalah 18.' },
        ],
        correct: 'o1',
        explanation:
          'Periksa dengan perkalian: 4 × 6 = 24, bukan −24. Yang benar (−4) × 6 = −24, jadi hasilnya −4.',
      },
      {
        id: 'v3',
        pernyataan:
          'Tono menulis <em>(−2) × (−3) × (−5) = 30</em>, "karena negatif kali negatif hasilnya positif." Tanggapan mana yang tepat?',
        options: [
          { id: 'o1', label: 'Tono benar, semua bilangannya negatif.' },
          { id: 'o2', label: 'Tono keliru, jawaban yang benar adalah −10.' },
          {
            id: 'o3',
            label:
              'Tono keliru. (−2) × (−3) = 6, lalu 6 × (−5) = −30. Ada tiga faktor negatif, jadi hasilnya negatif.',
          },
          { id: 'o4', label: 'Tono keliru, jawaban yang benar adalah 10.' },
        ],
        correct: 'o3',
        explanation:
          'Aturan tanda berlaku untuk dua bilangan setiap kali. Kalikan bertahap: (−2) × (−3) = 6, lalu 6 × (−5) = −30.',
      },
    ],
    nextLabel: 'Lanjut: Selidiki Sifat & Urutan →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — SIFAT OPERASI & URUTAN PENGERJAAN
     (siklus inkuiri kedua: kumpulkan data → uji)
     ---------------------------------------------------------- */
  sifat: {
    kicker: 'Tahap 7 · Sifat Operasi & Urutan Pengerjaan',
    syntax: 'Inquiry Learning · Sintaks 4–5',
    goal: 'Menyelidiki sifat-sifat operasi hitung dan urutan pengerjaan operasi campuran bilangan bulat.',
    guru: 'Bagian A adalah siklus inkuiri singkat: murid menghitung kedua ruas, lalu memutuskan sendiri apakah sifat itu berlaku. Pada bagian B, gunakan konteks skor Bima untuk menjelaskan mengapa perkalian dikerjakan lebih dulu, bukan sekadar menyebut aturannya.',
    instruksiA:
      'Bagian A. Hitung ruas kiri dan ruas kanan setiap pasangan, lalu putuskan apakah hasilnya sama.',
    opsiSama: [
      { id: 'sama', label: 'Hasilnya sama, jadi sifat ini berlaku.' },
      { id: 'beda', label: 'Hasilnya berbeda, jadi sifat ini tidak berlaku.' },
    ],
    sifatList: [
      {
        id: 's1',
        nama: 'Komutatif (pertukaran) pada perkalian',
        kiri: '(−6) × 4',
        kanan: '4 × (−6)',
        jawabKiri: -24,
        jawabKanan: -24,
        correct: 'sama',
        hintsKiri: ['Tandanya berbeda, jadi hasilnya negatif. 6 × 4 = 24.'],
        hintsKanan: ['Tandanya berbeda, jadi hasilnya negatif. 4 × 6 = 24.'],
        rumus: 'a × b = b × a',
      },
      {
        id: 's2',
        nama: 'Asosiatif (pengelompokan) pada perkalian',
        kiri: '[(−2) × 5] × (−3)',
        kanan: '(−2) × [5 × (−3)]',
        jawabKiri: 30,
        jawabKanan: 30,
        correct: 'sama',
        hintsKiri: ['Kerjakan yang di dalam kurung dulu: (−2) × 5 = −10, lalu (−10) × (−3).'],
        hintsKanan: ['Kerjakan yang di dalam kurung dulu: 5 × (−3) = −15, lalu (−2) × (−15).'],
        rumus: '(a × b) × c = a × (b × c)',
      },
      {
        id: 's3',
        nama: 'Distributif perkalian terhadap penjumlahan',
        kiri: '(−4) × [3 + (−5)]',
        kanan: '(−4) × 3 + (−4) × (−5)',
        jawabKiri: 8,
        jawabKanan: 8,
        correct: 'sama',
        hintsKiri: ['Di dalam kurung: 3 + (−5) = −2. Lalu (−4) × (−2).'],
        hintsKanan: ['(−4) × 3 = −12 dan (−4) × (−5) = 20. Lalu −12 + 20.'],
        rumus: 'a × (b + c) = a × b + a × c',
      },
      {
        id: 's4',
        nama: 'Asosiatif pada pembagian?',
        kiri: '[(−24) : 4] : (−2)',
        kanan: '(−24) : [4 : (−2)]',
        jawabKiri: 3,
        jawabKanan: 12,
        correct: 'beda',
        hintsKiri: ['(−24) : 4 = −6, lalu (−6) : (−2).'],
        hintsKanan: ['4 : (−2) = −2, lalu (−24) : (−2).'],
        rumus: '(a : b) : c ≠ a : (b : c)',
      },
    ],
    temuanA:
      'Perkalian bilangan bulat bersifat <strong>komutatif</strong>, <strong>asosiatif</strong>, dan <strong>distributif</strong> terhadap penjumlahan. Sifat-sifat itu <strong>tidak</strong> selalu berlaku pada pembagian, jadi urutan dan pengelompokan pembagian tidak boleh diubah.',
    instruksiB:
      'Bagian B. Ingat skor Bima: ia sudah punya 8 poin, lalu 3 kali menjawab salah (masing-masing −2). Dua teman menuliskan 8 + 3 × (−2) dan menghitungnya dengan cara berbeda.',
    caraTeman: [
      { nama: 'Ani', kerja: '8 + 3 × (−2) = 11 × (−2) = −22' },
      { nama: 'Budi', kerja: '8 + 3 × (−2) = 8 + (−6) = 2' },
    ],
    urutanLabel: 'Cara siapa yang sesuai dengan skor Bima yang sebenarnya?',
    urutanOpsi: [
      {
        id: 'u1',
        label:
          'Budi. Tiga jawaban salah bernilai 3 × (−2) = −6, lalu ditambahkan ke 8 poin. Perkalian dikerjakan lebih dulu daripada penjumlahan.',
      },
      { id: 'u2', label: 'Ani, karena operasi selalu dikerjakan dari kiri ke kanan.' },
      { id: 'u3', label: 'Keduanya benar, tergantung siapa yang menghitung.' },
      { id: 'u4', label: 'Ani, karena penjumlahan selalu dikerjakan lebih dulu.' },
    ],
    urutanCorrect: 'u1',
    urutanUmpan: {
      u1: 'Tepat! Skor Bima 2 poin. Dari kiri ke kanan hanya berlaku untuk operasi yang setingkat.',
      u2: 'Bila dihitung dari kiri, skor Bima menjadi −22 poin. Padahal ia hanya kehilangan 6 poin dari 8 poin. Periksa lagi maknanya.',
      u3: 'Sebuah ekspresi hanya boleh punya satu nilai. Karena itu diperlukan kesepakatan urutan pengerjaan.',
      u4: 'Kalau penjumlahan dikerjakan lebih dulu, skor Bima −22 poin. Itu tidak sesuai dengan ceritanya.',
    },
    aturanUrutan: [
      'Kerjakan operasi di dalam <strong>tanda kurung</strong> lebih dulu.',
      'Kerjakan <strong>perkalian dan pembagian</strong> dari kiri ke kanan.',
      'Kerjakan <strong>penjumlahan dan pengurangan</strong> dari kiri ke kanan.',
    ],
    instruksiLangkah:
      'Sekarang kerjakan operasi campuran berikut langkah demi langkah. Bagian yang disorot adalah bagian yang dikerjakan lebih dulu.',
    ekspresi: [
      {
        id: 'e1',
        ekspresi: '[[(−3 + 7)]] × (−5) + 8',
        langkah: [
          {
            label: 'Tanda kurung: −3 + 7 =',
            jawab: 4,
            sesudah: '[[4 × (−5)]] + 8',
            hints: ['Dari −3, lompat 7 langkah ke kanan.'],
          },
          {
            label: 'Perkalian: 4 × (−5) =',
            jawab: -20,
            sesudah: '[[−20 + 8]]',
            hints: ['Tandanya berbeda, jadi hasilnya negatif.'],
          },
          {
            label: 'Penjumlahan: −20 + 8 =',
            jawab: -12,
            sesudah: '−12',
            hints: ['Dari −20, lompat 8 langkah ke kanan.'],
          },
        ],
      },
      {
        id: 'e2',
        ekspresi: '15 + [[(−24) : 4]] × (−2)',
        langkah: [
          {
            label: 'Pembagian (paling kiri di antara × dan :): (−24) : 4 =',
            jawab: -6,
            sesudah: '15 + [[(−6) × (−2)]]',
            hints: ['Tandanya berbeda, jadi hasilnya negatif. 24 : 4 = 6.'],
          },
          {
            label: 'Perkalian: (−6) × (−2) =',
            jawab: 12,
            sesudah: '[[15 + 12]]',
            hints: ['Tandanya sama, jadi hasilnya positif.'],
          },
          {
            label: 'Penjumlahan: 15 + 12 =',
            jawab: 27,
            sesudah: '27',
            hints: ['15 + 12 = 27.'],
          },
        ],
      },
    ],
    instruksiC:
      'Bagian C. Sifat distributif dapat membantu menghitung dengan cepat. Perhatikan 25 × (−8) + 75 × (−8).',
    cepatLabel: 'Bentuk mana yang membuat perhitungan paling mudah dan hasilnya tetap sama?',
    cepatOpsi: [
      { id: 'k1', label: '25 × 75 × (−8)' },
      { id: 'k2', label: '(25 × 75) + (−8)' },
      { id: 'k3', label: '25 + 75 × (−8)' },
      { id: 'k4', label: '(25 + 75) × (−8)' },
    ],
    cepatCorrect: 'k4',
    cepatUmpan: {
      k1: 'Bentuk ini mengalikan ketiga bilangan, padahal soal aslinya menjumlahkan dua hasil kali. Nilainya berbeda.',
      k2: 'Bentuk ini tidak setara dengan soal aslinya. Faktor (−8) hanya muncul sekali sebagai penjumlah.',
      k3: 'Tanpa tanda kurung, 75 × (−8) dikerjakan lebih dulu, lalu ditambah 25. Nilainya berbeda.',
      k4: 'Tepat! Faktor yang sama, (−8), dikeluarkan: 25 × (−8) + 75 × (−8) = (25 + 75) × (−8).',
    },
    cepatHitung: {
      label: '(25 + 75) × (−8) = 100 × (−8) = …',
      jawab: -800,
      hints: ['100 × 8 = 800. Tandanya berbeda, jadi hasilnya negatif.'],
    },
    nextLabel: 'Lanjut: Rumuskan Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — MERUMUSKAN KESIMPULAN
     ---------------------------------------------------------- */
  simpulan: {
    kicker: 'Tahap 8 · Merumuskan Kesimpulan',
    syntax: 'Inquiry Learning · Sintaks 6',
    goal: 'Merumuskan aturan tanda, sifat operasi, dan urutan pengerjaan berdasarkan hasil penyelidikan.',
    guru: 'Setelah kalimat lengkap, minta dua atau tiga murid membacakan kesimpulan dengan bahasanya sendiri, lalu kaitkan kembali dengan jawaban rumusan masalah di Tahap 2.',
    instruksi:
      'Lengkapi kalimat-kalimat kesimpulan berikut dengan memilih potongan kalimat yang tepat. Hati-hati, ada potongan pengecoh.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      {
        id: 'g1',
        awal: 'Hasil kali atau hasil bagi dua bilangan bulat yang tandanya sama adalah',
        correct: 'b1',
      },
      {
        id: 'g2',
        awal: 'Hasil kali atau hasil bagi dua bilangan bulat yang tandanya berbeda adalah',
        correct: 'b2',
      },
      { id: 'g3', awal: 'Hasil pembagian a : b = c dapat diperiksa dengan', correct: 'b3' },
      { id: 'g4', awal: 'Pada perkalian bilangan bulat berlaku sifat', correct: 'b4' },
      { id: 'g5', awal: 'Pada operasi campuran, urutan pengerjaannya adalah', correct: 'b5' },
    ],
    bank: [
      { id: 'b1', teks: 'bilangan positif.' },
      { id: 'b2', teks: 'bilangan negatif.' },
      { id: 'b3', teks: 'perkalian c × b = a.' },
      { id: 'b4', teks: 'komutatif, asosiatif, dan distributif terhadap penjumlahan.' },
      {
        id: 'b5',
        teks: 'tanda kurung, lalu × dan : dari kiri, lalu + dan − dari kiri.',
      },
      { id: 'b6', teks: 'penjumlahan c + b = a.' },
      { id: 'b7', teks: 'selalu dari kiri ke kanan tanpa memperhatikan jenis operasinya.' },
      { id: 'b8', teks: 'bilangan negatif, karena ada tanda minus.' },
    ],
    rangkuman: [
      'Tanda sama: (+) × (+) = (+), (−) × (−) = (+). Tanda berbeda: (+) × (−) = (−), (−) × (+) = (−). Aturan ini juga berlaku untuk pembagian.',
      'Pembagian adalah kebalikan perkalian: a : b = c karena c × b = a. Contoh: (−18) : (−6) = 3, karena 3 × (−6) = −18.',
      'Perkalian bersifat <strong>komutatif</strong> (a × b = b × a), <strong>asosiatif</strong> ((a × b) × c = a × (b × c)), dan <strong>distributif</strong> (a × (b + c) = a × b + a × c). Pembagian tidak.',
      'Urutan pengerjaan: <strong>( )</strong> → <strong>× dan :</strong> dari kiri → <strong>+ dan −</strong> dari kiri.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — UJI TERAP (createExerciseStage)
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 9 · Uji Terap',
    syntax: 'Penerapan konsep',
    goal: 'Menyelesaikan masalah kontekstual dengan perkalian, pembagian, sifat operasi, dan urutan pengerjaan.',
    guru: 'Minta murid menuliskan kalimat matematikanya lebih dulu sebelum menghitung. Amati murid yang sering membuka petunjuk, lalu ajak mereka memeriksa tanda hasil dengan aturan yang sudah ditemukan.',
    instruksi:
      'Enam soal berikut memuat konteks sehari-hari. Ubah dulu ceritanya menjadi kalimat matematika, lalu hitung dengan urutan pengerjaan yang tepat.',
    soal: [
      {
        id: 't1',
        type: 'choice',
        konteks: '🌡️ Suhu',
        cerita:
          'Suhu ruang pendingin ikan mula-mula 0 °C. Setelah mesin dinyalakan, suhunya turun 3 °C setiap jam.',
        pertanyaan: 'Berapa suhu ruang pendingin setelah 5 jam?',
        options: [
          { id: 'o1', label: '15 °C' },
          { id: 'o2', label: '−8 °C' },
          { id: 'o3', label: '−15 °C' },
          { id: 'o4', label: '−2 °C' },
        ],
        correct: 'o3',
        explanation: 'Turun 3 °C selama 5 jam: 5 × (−3) = −15. Suhunya menjadi −15 °C.',
      },
      {
        id: 't2',
        type: 'input',
        konteks: '📝 Skor kuis',
        cerita:
          'Pada lomba cerdas cermat, jawaban benar mendapat 4 poin, jawaban salah −2 poin, dan soal yang tidak dijawab 0 poin. Dari 25 soal, Sinta menjawab benar 15 soal, salah 6 soal, dan sisanya tidak dijawab.',
        pertanyaan: 'Berapa skor akhir Sinta?',
        jawab: 48,
        suffix: 'poin',
        hints: [
          'Kalimat matematikanya: 15 × 4 + 6 × (−2) + 4 × 0.',
          'Kerjakan perkalian dulu: 60 + (−12) + 0.',
        ],
        reveal:
          '15 × 4 + 6 × (−2) + 4 × 0 = 60 + (−12) + 0 = <strong>48</strong>. Skor Sinta 48 poin.',
        explanation: '15 × 4 + 6 × (−2) + 4 × 0 = 60 − 12 + 0 = 48 poin.',
      },
      {
        id: 't3',
        type: 'choice',
        konteks: '🤿 Kedalaman',
        cerita:
          'Seorang penyelam turun dari permukaan laut dengan kecepatan tetap. Setelah 7 menit, posisinya −28 m (28 m di bawah permukaan).',
        pertanyaan: 'Berapa perubahan posisinya setiap menit?',
        options: [
          { id: 'o1', label: '−4 m (turun 4 m setiap menit)' },
          { id: 'o2', label: '4 m (naik 4 m setiap menit)' },
          { id: 'o3', label: '−21 m (turun 21 m setiap menit)' },
          { id: 'o4', label: '−196 m (turun 196 m setiap menit)' },
        ],
        correct: 'o1',
        explanation: '(−28) : 7 = −4, karena (−4) × 7 = −28. Penyelam turun 4 m setiap menit.',
      },
      {
        id: 't4',
        type: 'input',
        konteks: '💰 Utang',
        cerita:
          'Catatan kas kelas menunjukkan saldo −60 ribu rupiah (utang Rp60.000). Utang itu ditanggung rata oleh 12 murid.',
        pertanyaan:
          'Berapa bagian saldo setiap murid, dalam <strong>ribu rupiah</strong>? Tulis sebagai bilangan bulat seperti pada catatan kas.',
        jawab: -5,
        suffix: 'ribu',
        hints: [
          'Kalimat matematikanya: (−60) : 12.',
          'Tandanya berbeda, jadi hasilnya negatif. 60 : 12 = 5.',
        ],
        reveal:
          '(−60) : 12 = <strong>−5</strong>, karena (−5) × 12 = −60. Setiap murid menanggung utang Rp5.000.',
        explanation: '(−60) : 12 = −5. Setiap murid menanggung utang Rp5.000.',
      },
      {
        id: 't5',
        type: 'choice',
        konteks: '🛒 Belanja',
        cerita:
          'Saldo uang elektronik Dika Rp50.000. Ia membeli 3 buku seharga Rp12.000 per buku, lalu mendapat cashback Rp4.000.',
        pertanyaan: 'Kalimat matematika dan saldo akhir (dalam ribu rupiah) mana yang tepat?',
        options: [
          { id: 'o1', label: '(50 − 3) × 12 + 4 = 568' },
          { id: 'o2', label: '50 − 3 × (12 + 4) = 2' },
          { id: 'o3', label: '50 − 3 × 12 − 4 = 10' },
          { id: 'o4', label: '50 − 3 × 12 + 4 = 18' },
        ],
        correct: 'o4',
        explanation:
          '50 − 3 × 12 + 4: perkalian dulu, 3 × 12 = 36, lalu dari kiri 50 − 36 + 4 = 18. Saldo akhir Rp18.000.',
      },
      {
        id: 't6',
        type: 'input',
        konteks: '🏪 Kerugian toko',
        cerita:
          'Sebuah toko rugi Rp6.000 untuk setiap kemasan susu yang rusak (dicatat −6 ribu). Pada hari Senin ada 17 kemasan rusak dan pada hari Selasa 83 kemasan rusak.',
        pertanyaan:
          'Berapa total perubahan keuntungan toko, dalam <strong>ribu rupiah</strong>? Gunakan sifat distributif agar cepat.',
        jawab: -600,
        suffix: 'ribu',
        hints: [
          'Kalimat matematikanya: 17 × (−6) + 83 × (−6).',
          'Sifat distributif: (17 + 83) × (−6) = 100 × (−6).',
        ],
        reveal:
          '17 × (−6) + 83 × (−6) = (17 + 83) × (−6) = 100 × (−6) = <strong>−600</strong>. Toko rugi Rp600.000.',
        explanation: '(17 + 83) × (−6) = 100 × (−6) = −600. Toko rugi Rp600.000.',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 10 · Refleksi',
    syntax: 'Refleksi',
    goal: 'Menyadari proses penyelidikan yang sudah dilakukan dan kemampuan diri.',
    guru: 'Bacalah jawaban refleksi murid untuk menentukan siapa yang perlu pendampingan lanjutan, terutama pada perkalian dua bilangan negatif dan urutan pengerjaan.',
    pertanyaan: [
      {
        id: 'f1',
        teks: 'Bandingkan hipotesismu di Tahap 3 dengan hasil pengujian di Tahap 6. Bagian mana yang kamu revisi, dan data apa yang membuatmu yakin?',
        placeholder: 'Awalnya saya menduga… ternyata data menunjukkan…',
      },
      {
        id: 'f2',
        teks: 'Jelaskan kepada teman yang belum paham mengapa (−3) × (−4) hasilnya positif.',
        placeholder: 'Saya akan menjelaskan dengan pola…',
      },
      {
        id: 'f3',
        teks: 'Tuliskan satu masalah sehari-hari yang memerlukan operasi campuran, lalu selesaikan dengan urutan pengerjaan yang benar.',
        placeholder: 'Contoh: saya membeli … lalu …, jadi …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat mengalikan dan membagi bilangan bulat sekarang?',
    diriOpsi: [
      { id: 'd1', label: 'Sangat yakin, saya bisa menjelaskannya ke teman' },
      { id: 'd2', label: 'Cukup yakin, sesekali masih perlu melihat aturan tanda' },
      { id: 'd3', label: 'Belum yakin, saya ingin berlatih lagi' },
    ],
    nextLabel: 'Selesaikan Pembelajaran →',
  },

  /* ----------------------------------------------------------
     TAHAP 11 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Penyelidikanmu tuntas!',
    teks: 'Kamu telah menempuh seluruh langkah inkuiri: mengamati masalah, merumuskan pertanyaan, membuat hipotesis, mengumpulkan data, mengujinya, sampai merumuskan kesimpulan sendiri.',
    capaian: [
      'Mengalikan bilangan bulat dan menjelaskan aturan tandanya dengan penjumlahan berulang dan pola.',
      'Membagi bilangan bulat sebagai kebalikan perkalian dan memeriksa hasilnya.',
      'Menerapkan sifat komutatif, asosiatif, dan distributif untuk menghitung lebih cepat.',
      'Menyelesaikan masalah kontekstual dengan urutan pengerjaan operasi campuran yang benar.',
    ],
  },
};
