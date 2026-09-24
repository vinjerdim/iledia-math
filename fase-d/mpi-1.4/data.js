'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Menyederhanakan & Menyamakan Penyebut Pecahan
   Fase D — SMP Kelas 7

   Tujuan Pembelajaran:
   Menyederhanakan pecahan dan menyamakan penyebut dua pecahan atau
   lebih sebagai dasar perbandingan.

   Model pembelajaran: PROBLEM-BASED LEARNING (PBL).
   Masalah pemantik: "Bazar Kelas 7 — Kue Siapa Paling Laris?"
   Tiga kelompok menjual kue lapis dalam loyang yang SAMA BESAR, tetapi
   memotongnya berbeda-beda:
     • Melati  : loyang dipotong  8, terjual  6 potong →  6/8  = 3/4 = 18/24
     • Anggrek : loyang dipotong 12, terjual  8 potong →  8/12 = 2/3 = 16/24
     • Kenanga : loyang dipotong 16, terjual 10 potong → 10/16 = 5/8 = 15/24
   Kenanga menjual potongan TERBANYAK (10) tetapi bagian loyangnya
   PALING KECIL — konflik kognitif yang mendorong murid menyederhanakan
   dan menyamakan penyebut sebelum membandingkan.

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ...... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar  'organisasi'
     Sintaks 3 — Membimbing penyelidikan ........... 'selidikSederhana', 'latihSederhana',
                                                     'selidikSamakan', 'latihSamakan'
     Sintaks 4 — Mengembangkan & menyajikan hasil .. 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi proses  'evaluasi'
     Penutup ....................................... 'refleksi', 'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — murid menuliskan dugaan awal, menyusun
       rencana penyelidikan sendiri, lalu membandingkan dugaan dengan
       hasil dan merefleksikan strateginya.
     • Bermakna (meaningful) — seluruh konsep lahir dari satu masalah
       nyata (bazar kelas); model pita selalu menyertai notasi sehingga
       "senilai" terlihat, bukan sekadar dihafal.
     • Menggembirakan (joyful) — laboratorium gabung/potong pita yang
       bisa diutak-atik, umpan balik langsung yang menunjuk letak
       kesalahan, laporan untuk wali kelas, dan bintang capaian.

   Rangkaian aktivitas (± 2 × 40 menit; kelompok 3–4 murid, satu
   perangkat per kelompok atau per murid):
     1. Orientasi         (8')  — cerita bazar, tiga pita loyang, dugaan
                                  awal, menyadari "banyak potong ≠ bagian
                                  terbesar".
     2. Organisasi        (8')  — memilah informasi (diketahui / ditanya /
                                  tidak diperlukan), menyusun urutan rencana
                                  penyelidikan, membagi peran kelompok.
     3. Selidik sederhana (12') — lab "gabung potongan" 6/8 & 8/12, lalu
                                  langkah FPB dan kesimpulan.
     4. Latih sederhana   (8')  — 6 soal menyederhanakan (isian bersusun
                                  berdiagnosis + pilihan ganda).
     5. Selidik samakan   (12') — lab "potong ulang" 3/4 & 2/3, KPK,
                                  langkah menyamakan penyebut & kesimpulan.
     6. Latih samakan     (8')  — 6 soal menyamakan penyebut 2–3 pecahan
                                  dan membandingkan.
     7. Karya             (12') — menyelesaikan masalah bazar & menyusun
                                  laporan untuk wali kelas; presentasi.
     8. Evaluasi          (7')  — menilai pendapat teman (tepat/keliru) dan
                                  dua masalah transfer.
     9. Refleksi          (5')  — rekap capaian, refleksi tertulis,
                                  keyakinan diri.

   Ketentuan: SEMUA pilihan jawaban (pilihan ganda, kategori pemilahan,
   kandidat pembagi/penyebut di laboratorium, butir urut-ketuk) diacak
   di app-core.js > initExerciseArrays().
   ============================================================ */

/* Pecahan bersusun kecil untuk label opsi & teks (engine.js dimuat lebih dulu). */
function F(num, den) {
  return buildFracInline(num, den);
}

var DATA = {
  meta: {
    title: 'Menyederhanakan & Menyamakan Penyebut Pecahan',
    subject: 'Matematika — Fase D (SMP)',
  },

  /* Data masalah bazar — dipakai di beberapa tahap. */
  bazar: [
    { id: 'melati', nama: 'Melati', ikon: '🌼', num: 6, den: 8 },
    { id: 'anggrek', nama: 'Anggrek', ikon: '🌸', num: 8, den: 12 },
    { id: 'kenanga', nama: 'Kenanga', ikon: '🌻', num: 10, den: 16 },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — Orientasi masalah (PBL Sintaks 1)
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi Masalah',
    syntax: 'PBL · Sintaks 1',
    goal: 'Memahami masalah bazar dan menyadari mengapa pecahan perlu diolah sebelum dibandingkan.',
    guru: 'Bacakan cerita dengan ekspresif, tampilkan tiga pita loyang, lalu biarkan murid berdebat singkat tentang dugaannya. Jangan membenarkan atau menyalahkan dugaan — tuliskan saja dugaan terbanyak di papan untuk diuji di akhir.',
    ikon: '🧁',
    judul: 'Bazar Kelas 7: Kue Siapa Paling Laris?',
    cerita:
      'Tiga kelompok menjual kue lapis di bazar sekolah. Loyang mereka sama besar, tetapi dipotong berbeda-beda. Di akhir bazar, Kelompok Kenanga berseru, "Kami paling laris, kami menjual 10 potong!" Kelompok Melati dan Anggrek tidak setuju. Bu Ratna, wali kelas, meminta kalian menjadi tim peneliti untuk memutuskan dengan adil.',
    tujuan: [
      'Menyederhanakan pecahan dengan membagi pembilang dan penyebut menggunakan FPB-nya.',
      'Menyamakan penyebut dua pecahan atau lebih menggunakan KPK penyebut-penyebutnya.',
      'Menggunakan pecahan berpenyebut sama untuk membandingkan dan mengurutkan pecahan.',
    ],
    dugaan: {
      tanya: 'Dugaan awalmu: kelompok mana yang menjual bagian loyang PALING BANYAK?',
      opsi: [
        { id: 'melati', label: '🌼 Kelompok Melati' },
        { id: 'anggrek', label: '🌸 Kelompok Anggrek' },
        { id: 'kenanga', label: '🌻 Kelompok Kenanga' },
        { id: 'sama', label: '🤝 Ketiganya sama banyak' },
      ],
      umpan:
        'Dugaanmu sudah dicatat. Dugaan belum tentu benar atau salah — kita akan mengujinya dengan penyelidikan!',
    },
    pemantik: {
      tanya:
        'Mengapa banyaknya potong yang terjual belum cukup untuk menentukan kelompok paling laris?',
      correct: 'ukuran',
      opsi: [
        { id: 'ukuran', label: 'Karena ukuran potongan tiap loyang berbeda-beda' },
        { id: 'harga', label: 'Karena harga satu potong kue berbeda' },
        { id: 'anggota', label: 'Karena banyak anggota tiap kelompok berbeda' },
        { id: 'rasa', label: 'Karena rasa kue tiap kelompok berbeda' },
      ],
      umpan: {
        ukuran:
          'Tepat! Loyang yang dipotong 16 menghasilkan potongan yang jauh lebih kecil daripada loyang yang dipotong 8. Kita perlu cara membandingkan <strong>bagian loyang</strong>, bukan banyak potongnya.',
        harga:
          'Harga tidak disebutkan dan tidak memengaruhi berapa bagian loyang yang terjual. Perhatikan lagi cara tiap loyang dipotong.',
        anggota:
          'Banyak anggota tidak memengaruhi bagian loyang yang terjual. Perhatikan lagi ukuran potongannya.',
        rasa: 'Rasa tidak mengubah bagian loyang yang terjual. Perhatikan lagi ukuran potongannya.',
      },
    },
    nextLabel: 'Ayo Susun Rencana →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — Mengorganisasi belajar (PBL Sintaks 2)
     ---------------------------------------------------------- */
  organisasi: {
    kicker: 'Tahap 2 · Mengorganisasi Belajar',
    syntax: 'PBL · Sintaks 2',
    goal: 'Memilah informasi masalah, lalu menyusun rencana penyelidikan kelompok.',
    guru: 'Bentuk kelompok 3–4 murid dan bagikan peran. Minta setiap kelompok menjelaskan mengapa informasi tertentu tidak diperlukan. Pada rencana, terima urutan yang logis dan tanyakan "mengapa langkah ini perlu lebih dulu?".',
    pilahInstruksi: 'Pilah setiap informasi: diketahui, ditanyakan, atau tidak diperlukan?',
    pilahOpsi: [
      { id: 'diketahui', label: '📋 Diketahui' },
      { id: 'ditanya', label: '❓ Ditanyakan' },
      { id: 'tidak', label: '🗑️ Tidak diperlukan' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: 'Loyang Kelompok Melati dipotong 8 sama besar, terjual 6 potong.',
        correct: 'diketahui',
        explanation: 'Ini data utama: bagian terjual Melati adalah ' + F(6, 8) + ' loyang.',
      },
      {
        id: 'p2',
        teks: 'Loyang Kelompok Anggrek dipotong 12 sama besar, terjual 8 potong.',
        correct: 'diketahui',
        explanation: 'Ini data utama: bagian terjual Anggrek adalah ' + F(8, 12) + ' loyang.',
      },
      {
        id: 'p3',
        teks: 'Loyang Kelompok Kenanga dipotong 16 sama besar, terjual 10 potong.',
        correct: 'diketahui',
        explanation: 'Ini data utama: bagian terjual Kenanga adalah ' + F(10, 16) + ' loyang.',
      },
      {
        id: 'p4',
        teks: 'Semua loyang berukuran sama besar.',
        correct: 'diketahui',
        explanation:
          'Informasi penting! Pecahan hanya adil dibandingkan bila keseluruhannya (loyangnya) sama besar.',
      },
      {
        id: 'p5',
        teks: 'Kelompok mana yang menjual bagian loyang paling banyak?',
        correct: 'ditanya',
        explanation: 'Inilah pertanyaan yang harus dijawab tim peneliti.',
      },
      {
        id: 'p6',
        teks: 'Harga satu potong kue Rp2.000.',
        correct: 'tidak',
        explanation: 'Harga tidak dibutuhkan untuk menentukan bagian loyang yang terjual.',
      },
      {
        id: 'p7',
        teks: 'Bazar diadakan hari Sabtu di halaman sekolah.',
        correct: 'tidak',
        explanation: 'Waktu dan tempat bazar tidak memengaruhi jawaban.',
      },
    ],
    rencanaInstruksi:
      'Susun rencana penyelidikan: ketuk langkah-langkah di bawah sesuai urutan yang paling masuk akal.',
    rencana: [
      { id: 'r1', label: '✏️ Tulis bagian terjual tiap kelompok sebagai pecahan' },
      { id: 'r2', label: '✂️ Sederhanakan setiap pecahan' },
      { id: 'r3', label: '🟰 Samakan penyebut ketiga pecahan' },
      { id: 'r4', label: '⚖️ Bandingkan pembilangnya, lalu simpulkan' },
    ],
    rencanaBenar: ['r1', 'r2', 'r3', 'r4'],
    rencanaSalah:
      'Urutan belum tepat. Petunjuk: kita tidak bisa mengolah sesuatu sebelum menuliskannya sebagai pecahan, dan membandingkan adalah langkah terakhir. Posisi yang merah perlu ditukar.',
    rencanaBenarTeks:
      'Rencana siap! Pecahan yang sederhana membuat angkanya kecil, sehingga lebih mudah disamakan penyebutnya.',
    peran: [
      { ikon: '📝', nama: 'Pencatat', tugas: 'menulis hasil setiap langkah di buku' },
      { ikon: '🧮', nama: 'Penghitung', tugas: 'mengoperasikan media dan menghitung' },
      { ikon: '🔍', nama: 'Pemeriksa', tugas: 'mengecek ulang setiap jawaban' },
      { ikon: '🎤', nama: 'Penyaji', tugas: 'mempresentasikan laporan kelompok' },
    ],
    nextLabel: 'Mulai Penyelidikan 1 →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — Penyelidikan 1: menyederhanakan (PBL Sintaks 3)
     ---------------------------------------------------------- */
  selidikSederhana: {
    kicker: 'Tahap 3 · Penyelidikan 1: Menyederhanakan',
    syntax: 'PBL · Sintaks 3',
    goal: 'Menemukan cara menyederhanakan pecahan tanpa mengubah nilainya.',
    guru: 'Biarkan kelompok mencoba pembagi yang "gagal" — justru dari situ mereka menemukan bahwa pembagi harus membagi habis pembilang DAN penyebut. Tanyakan: "Apakah bagian yang diarsir berubah ukurannya?"',
    labInstruksi:
      'Pilih "gabung tiap … potong". Potongan yang digabung harus membentuk potongan baru yang sama besar dan tidak ada potongan terarsir yang terbelah. Temukan bentuk yang paling sederhana!',
    lab: [
      {
        id: 'labMelati',
        nama: '🌼 Melati',
        num: 6,
        den: 8,
        kandidat: [
          { id: '2', label: '2' },
          { id: '3', label: '3' },
          { id: '4', label: '4' },
        ],
      },
      {
        id: 'labAnggrek',
        nama: '🌸 Anggrek',
        num: 8,
        den: 12,
        kandidat: [
          { id: '2', label: '2' },
          { id: '3', label: '3' },
          { id: '4', label: '4' },
          { id: '6', label: '6' },
        ],
      },
    ],
    langkahJudul: 'Temukan polanya dengan pecahan ' + F(12, 18),
    langkah: [
      {
        label: 'Faktor 12: 1, 2, 3, 4, 6, 12. Faktor 18: 1, 2, 3, 6, 9, 18. FPB dari 12 dan 18 = …',
        jawab: 6,
        hints: [
          'Cari faktor yang muncul di kedua daftar.',
          'Faktor persekutuan: 1, 2, 3, 6. Pilih yang terbesar.',
        ],
        temuan: 'FPB(12, 18) = 6. Bilangan inilah pembagi terbesar yang membagi habis keduanya.',
      },
      {
        label: 'Pembilang baru: 12 ÷ 6 = …',
        jawab: 2,
        hints: ['Bagi pembilang dengan FPB yang sudah ditemukan.'],
        temuan: 'Pembilang menjadi 2.',
      },
      {
        label: 'Penyebut baru: 18 ÷ 6 = …',
        jawab: 3,
        hints: ['Bagi penyebut dengan FPB yang SAMA (6).'],
        temuan:
          'Penyebut menjadi 3. Jadi ' +
          F(12, 18) +
          ' = ' +
          F(2, 3) +
          ' — sekali bagi langsung paling sederhana!',
      },
    ],
    simpulan: {
      tanya: 'Kesimpulan kelompokmu: sebuah pecahan sudah PALING SEDERHANA jika …',
      correct: 'fpb1',
      opsi: [
        { id: 'fpb1', label: 'FPB pembilang dan penyebutnya adalah 1' },
        { id: 'num1', label: 'pembilangnya sama dengan 1' },
        { id: 'ganjil', label: 'penyebutnya bilangan ganjil' },
        { id: 'kecil', label: 'pembilang dan penyebutnya kurang dari 10' },
      ],
      umpan: {
        fpb1: 'Tepat! Bila FPB-nya 1, tidak ada lagi bilangan (selain 1) yang membagi habis keduanya. Cara tercepat: bagi pembilang dan penyebut dengan FPB-nya.',
        num1:
          'Belum tepat. ' +
          F(2, 3) +
          ' pembilangnya bukan 1, tetapi sudah paling sederhana. Coba lagi.',
        ganjil:
          'Belum tepat. ' +
          F(3, 9) +
          ' penyebutnya ganjil, tetapi masih bisa disederhanakan menjadi ' +
          F(1, 3) +
          '. Coba lagi.',
        kecil:
          'Belum tepat. ' +
          F(4, 8) +
          ' angkanya kecil, tetapi masih bisa disederhanakan menjadi ' +
          F(1, 2) +
          '. Coba lagi.',
      },
    },
    nextLabel: 'Latihan Menyederhanakan →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — Latihan menyederhanakan (PBL Sintaks 3)
     ---------------------------------------------------------- */
  latihSederhana: {
    kicker: 'Tahap 4 · Latihan Menyederhanakan',
    syntax: 'PBL · Sintaks 3',
    goal: 'Menyederhanakan pecahan hingga bentuk paling sederhana.',
    guru: 'Pantau murid yang berhenti di bentuk setara yang belum paling sederhana. Minta mereka mengecek: "Apakah masih ada bilangan yang membagi habis keduanya?"',
    instruksi:
      'Tulis jawaban pada kotak bersusun (pembilang di atas, penyebut di bawah). Kamu punya 3 kesempatan per soal.',
    maksCoba: 3,
    soal: [
      {
        id: 's1',
        type: 'input',
        cerita: 'Dari 10 soal kuis, Raka menjawab benar 4 soal.',
        tanya: 'Sederhanakan ' + F(4, 10) + ' menjadi bentuk paling sederhana.',
        asal: { num: 4, den: 10 },
        hints: ['FPB dari 4 dan 10 adalah 2.'],
      },
      {
        id: 's2',
        type: 'input',
        cerita: '15 dari 20 murid kelas 7B membawa bekal dari rumah.',
        tanya: 'Sederhanakan ' + F(15, 20) + '.',
        asal: { num: 15, den: 20 },
        hints: ['Faktor persekutuan 15 dan 20: 1 dan 5.'],
      },
      {
        id: 's3',
        type: 'choice',
        cerita: 'Sebuah pizza dipotong 24 bagian sama besar dan 18 potong sudah dimakan.',
        tanya: 'Manakah bentuk paling sederhana dari ' + F(18, 24) + '?',
        correct: 'a',
        opsi: [
          { id: 'a', label: F(3, 4) },
          { id: 'b', label: F(9, 12) },
          { id: 'c', label: F(6, 8) },
          { id: 'd', label: F(2, 3) },
        ],
        explanation:
          'FPB(18, 24) = 6, sehingga ' +
          F(18, 24) +
          ' = ' +
          F(3, 4) +
          '. ' +
          F(9, 12) +
          ' dan ' +
          F(6, 8) +
          ' memang senilai, tetapi belum paling sederhana.',
      },
      {
        id: 's4',
        type: 'input',
        cerita: 'Dalam sehari (24 jam), Nisa beraktivitas di luar tidur selama 16 jam.',
        tanya: 'Sederhanakan ' + F(16, 24) + '.',
        asal: { num: 16, den: 24 },
        hints: ['Faktor 16: 1, 2, 4, 8, 16. Faktor 24: 1, 2, 3, 4, 6, 8, 12, 24.', 'FPB-nya 8.'],
      },
      {
        id: 's5',
        type: 'choice',
        cerita: 'Bu Ratna menulis empat pecahan di papan.',
        tanya: 'Pecahan mana yang SUDAH dalam bentuk paling sederhana?',
        correct: 'a',
        opsi: [
          { id: 'a', label: F(7, 9) },
          { id: 'b', label: F(6, 9) },
          { id: 'c', label: F(5, 15) },
          { id: 'd', label: F(4, 14) },
        ],
        explanation:
          'FPB(7, 9) = 1, jadi ' +
          F(7, 9) +
          ' sudah paling sederhana. Yang lain masih bisa dibagi 3, 5, atau 2.',
      },
      {
        id: 's6',
        type: 'input',
        cerita:
          'Perjalanan Dimas ke sekolah memakan waktu 45 menit, yaitu 45 dari 60 menit dalam satu jam.',
        tanya: 'Sederhanakan ' + F(45, 60) + '.',
        asal: { num: 45, den: 60 },
        hints: [
          'Coba bagi dengan 5 dulu, lalu periksa apakah masih bisa dibagi.',
          'FPB(45, 60) = 15.',
        ],
      },
    ],
    nextLabel: 'Lanjut ke Penyelidikan 2 →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — Penyelidikan 2: menyamakan penyebut (PBL Sintaks 3)
     ---------------------------------------------------------- */
  selidikSamakan: {
    kicker: 'Tahap 5 · Penyelidikan 2: Menyamakan Penyebut',
    syntax: 'PBL · Sintaks 3',
    goal: 'Menemukan cara mengubah dua pecahan menjadi pecahan senilai berpenyebut sama.',
    guru:
      'Tanyakan: "Setelah disederhanakan, Melati ' +
      '3/4 dan Anggrek 2/3. Mana yang lebih besar? Sulit, karena potongannya masih berbeda ukuran." Biarkan murid mencoba penyebut yang bukan kelipatan kedua penyebut, lalu diskusikan mengapa gagal.',
    labInstruksi:
      'Potong ulang kedua pita menjadi bagian yang sama banyak. Pilih banyak potongan baru untuk KEDUA pita. Potongan lama harus terbagi rata tanpa sisa.',
    labPecahan: [
      { nama: '🌼 Melati', num: 3, den: 4 },
      { nama: '🌸 Anggrek', num: 2, den: 3 },
    ],
    kandidat: [
      { id: '6', label: '6 potong' },
      { id: '8', label: '8 potong' },
      { id: '12', label: '12 potong' },
      { id: '24', label: '24 potong' },
      { id: '7', label: '7 potong' },
    ],
    langkahJudul: 'Samakan penyebut ' + F(3, 4) + ' dan ' + F(5, 6),
    langkah: [
      {
        label: 'Kelipatan 4: 4, 8, 12, 16, … Kelipatan 6: 6, 12, 18, … KPK dari 4 dan 6 = …',
        jawab: 12,
        hints: ['Cari bilangan terkecil yang muncul di kedua daftar kelipatan.'],
        temuan: 'KPK(4, 6) = 12. Penyebut bersama yang paling kecil adalah 12.',
      },
      {
        label: F(3, 4) + ' = … / 12   (tuliskan pembilangnya)',
        jawab: 9,
        hints: ['4 dikali berapa agar menjadi 12?', '4 × 3 = 12, jadi pembilang 3 juga dikali 3.'],
        temuan: F(3, 4) + ' = ' + F(9, 12) + ' (pembilang dan penyebut sama-sama dikali 3).',
      },
      {
        label: F(5, 6) + ' = … / 12   (tuliskan pembilangnya)',
        jawab: 10,
        hints: ['6 dikali berapa agar menjadi 12?', '6 × 2 = 12, jadi pembilang 5 juga dikali 2.'],
        temuan:
          F(5, 6) +
          ' = ' +
          F(10, 12) +
          '. Sekarang mudah dibandingkan: 10 > 9, jadi ' +
          F(5, 6) +
          ' > ' +
          F(3, 4) +
          '.',
      },
    ],
    simpulan: {
      tanya: 'Kesimpulan kelompokmu: penyebut bersama yang PALING PRAKTIS adalah …',
      correct: 'kpk',
      opsi: [
        { id: 'kpk', label: 'KPK dari penyebut-penyebutnya' },
        { id: 'jumlah', label: 'hasil penjumlahan penyebut-penyebutnya' },
        { id: 'terbesar', label: 'penyebut yang paling besar' },
        { id: 'fpb', label: 'FPB dari penyebut-penyebutnya' },
      ],
      umpan: {
        kpk: 'Tepat! KPK adalah kelipatan bersama terkecil, jadi setiap penyebut pasti bisa diubah ke sana dan angkanya tetap kecil. Kelipatan bersama lain (mis. 24) juga boleh, hanya angkanya lebih besar.',
        jumlah:
          'Belum tepat. Untuk 3/4 dan 2/3, 4 + 3 = 7, padahal 4 tidak bisa diubah menjadi 7 dengan perkalian. Coba lagi.',
        terbesar:
          'Belum tepat. Untuk 3/4 dan 2/3, penyebut terbesar 4 bukan kelipatan 3. Coba lagi.',
        fpb: 'Belum tepat. FPB(4, 3) = 1 — penyebut tidak bisa dibuat lebih kecil. Penyebut bersama harus kelipatan. Coba lagi.',
      },
    },
    nextLabel: 'Latihan Menyamakan Penyebut →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — Latihan menyamakan penyebut (PBL Sintaks 3)
     ---------------------------------------------------------- */
  latihSamakan: {
    kicker: 'Tahap 6 · Latihan Menyamakan Penyebut',
    syntax: 'PBL · Sintaks 3',
    goal: 'Menyamakan penyebut dua pecahan atau lebih, lalu membandingkannya.',
    guru: 'Terima penyebut bersama apa pun yang benar, lalu dorong murid memakai KPK agar perhitungannya lebih ringan. Minta murid menjelaskan perbandingan dengan kalimat, bukan hanya tanda.',
    instruksi:
      'Pada soal isian, ubah SETIAP pecahan menjadi pecahan senilai dengan penyebut yang sama. Kamu punya 3 kesempatan per soal.',
    maksCoba: 3,
    soal: [
      {
        id: 'm1',
        type: 'samakan',
        cerita: 'Adi minum ' + F(1, 2) + ' botol air, Bima minum ' + F(3, 5) + ' botol air.',
        tanya: 'Samakan penyebut kedua pecahan.',
        pecahan: [
          { num: 1, den: 2 },
          { num: 3, den: 5 },
        ],
        hints: ['KPK dari 2 dan 5 adalah 10.'],
      },
      {
        id: 'm2',
        type: 'choice',
        cerita: 'Tali merah panjangnya ' + F(2, 3) + ' m, tali biru ' + F(3, 5) + ' m.',
        tanya: 'Tanda yang tepat: ' + F(2, 3) + ' … ' + F(3, 5),
        correct: 'gt',
        opsi: [
          { id: 'gt', label: '&gt; (lebih dari)' },
          { id: 'lt', label: '&lt; (kurang dari)' },
          { id: 'eq', label: '= (sama dengan)' },
        ],
        explanation:
          'KPK(3, 5) = 15: ' +
          F(2, 3) +
          ' = ' +
          F(10, 15) +
          ' dan ' +
          F(3, 5) +
          ' = ' +
          F(9, 15) +
          '. Karena 10 > 9, tali merah lebih panjang.',
      },
      {
        id: 'm3',
        type: 'samakan',
        cerita: 'Resep A memakai ' + F(5, 6) + ' gelas gula, resep B ' + F(3, 4) + ' gelas gula.',
        tanya: 'Samakan penyebut kedua pecahan.',
        pecahan: [
          { num: 5, den: 6 },
          { num: 3, den: 4 },
        ],
        hints: ['Kelipatan 6: 6, 12, 18, … Kelipatan 4: 4, 8, 12, …', 'KPK-nya 12.'],
      },
      {
        id: 'm4',
        type: 'samakan',
        cerita:
          'Tiga kelompok mengecat pagar yang sama panjang: ' +
          F(1, 2) +
          ', ' +
          F(2, 3) +
          ', dan ' +
          F(3, 4) +
          ' bagian.',
        tanya: 'Samakan penyebut ketiga pecahan.',
        pecahan: [
          { num: 1, den: 2 },
          { num: 2, den: 3 },
          { num: 3, den: 4 },
        ],
        hints: ['Cari KPK dari 2, 3, dan 4.', 'KPK(2, 3, 4) = 12.'],
      },
      {
        id: 'm5',
        type: 'choice',
        cerita:
          'Rani makan ' +
          F(6, 9) +
          ' bagian roti, Sari makan ' +
          F(8, 12) +
          ' bagian roti yang sama besar.',
        tanya: 'Tanda yang tepat: ' + F(6, 9) + ' … ' + F(8, 12),
        correct: 'eq',
        opsi: [
          { id: 'gt', label: '&gt; (lebih dari)' },
          { id: 'lt', label: '&lt; (kurang dari)' },
          { id: 'eq', label: '= (sama dengan)' },
        ],
        explanation:
          'Sederhanakan dulu: ' +
          F(6, 9) +
          ' = ' +
          F(2, 3) +
          ' dan ' +
          F(8, 12) +
          ' = ' +
          F(2, 3) +
          '. Keduanya sama besar!',
      },
      {
        id: 'm6',
        type: 'choice',
        cerita:
          'Tiga gelas sama besar berisi jus: ' +
          F(1, 2) +
          ', ' +
          F(5, 8) +
          ', dan ' +
          F(3, 4) +
          ' gelas.',
        tanya: 'Urutan dari yang PALING SEDIKIT ke PALING BANYAK adalah …',
        correct: 'a',
        opsi: [
          { id: 'a', label: F(1, 2) + ', ' + F(5, 8) + ', ' + F(3, 4) },
          { id: 'b', label: F(3, 4) + ', ' + F(5, 8) + ', ' + F(1, 2) },
          { id: 'c', label: F(5, 8) + ', ' + F(1, 2) + ', ' + F(3, 4) },
          { id: 'd', label: F(1, 2) + ', ' + F(3, 4) + ', ' + F(5, 8) },
        ],
        explanation:
          'KPK(2, 8, 4) = 8: ' +
          F(4, 8) +
          ', ' +
          F(5, 8) +
          ', ' +
          F(6, 8) +
          '. Urutkan pembilangnya: 4 < 5 < 6.',
      },
    ],
    nextLabel: 'Selesaikan Masalah Bazar →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — Mengembangkan & menyajikan hasil (PBL Sintaks 4)
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 7 · Menyelesaikan & Menyajikan',
    syntax: 'PBL · Sintaks 4',
    goal: 'Menyelesaikan masalah bazar dengan rencana kelompok, lalu menyusun laporan untuk wali kelas.',
    guru: 'Beri waktu tiap kelompok menyelesaikan langkah A–C, lalu pilih 2–3 kelompok untuk mempresentasikan laporannya. Ajak kelompok lain menanggapi: apakah langkahnya sama? Apakah ada penyebut bersama lain yang juga benar?',
    langkahA: 'Langkah A — Sederhanakan bagian terjual setiap kelompok.',
    langkahB: 'Langkah B — Samakan penyebut ketiga pecahan sederhana.',
    kpkStep: {
      label: 'KPK dari 4, 3, dan 8 = …',
      jawab: 24,
      hints: ['Kelipatan 8: 8, 16, 24, … Mana yang juga kelipatan 3 dan 4?'],
      temuan: 'KPK(4, 3, 8) = 24. Ketiga pecahan diubah ke per-24.',
    },
    langkahC: 'Langkah C — Urutkan kelompok dari yang PALING LARIS.',
    slotLabels: ['Paling laris', 'Kedua', 'Paling sedikit'],
    urutBenar: ['melati', 'anggrek', 'kenanga'],
    urutSalah:
      'Urutan belum tepat. Bandingkan pembilang pecahan per-24 milik tiap kelompok: pembilang terbesar = paling laris.',
    langkahD: 'Langkah D — Laporan untuk Bu Ratna',
    pesanLabel:
      'Tulis pesan singkat untuk Kelompok Kenanga: mengapa menjual 10 potong belum berarti paling laris?',
    pesanPlaceholder: 'Contoh: Potongan loyang kalian lebih kecil karena …',
    pesanMin: 15,
    nextLabel: 'Evaluasi Proses →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — Analisis & evaluasi proses (PBL Sintaks 5)
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 8 · Analisis & Evaluasi',
    syntax: 'PBL · Sintaks 5',
    goal: 'Menilai cara berpikir teman dan menerapkan strategi pada masalah baru.',
    guru: 'Bahas pernyataan yang paling banyak dijawab keliru. Tekankan kesalahan umum: membandingkan pembilang saja, berhenti sebelum paling sederhana, dan menambahkan (bukan mengalikan/membagi) pembilang dan penyebut.',
    pilahInstruksi: 'Nilailah pendapat teman-teman tentang masalah bazar dan pecahan.',
    pilahOpsi: [
      { id: 'tepat', label: '👍 Tepat' },
      { id: 'keliru', label: '👎 Keliru' },
    ],
    pernyataan: [
      {
        id: 'e1',
        teks:
          'Beni: "' +
          F(10, 16) +
          ' lebih besar dari ' +
          F(3, 4) +
          ' karena 10 lebih besar dari 3."',
        correct: 'keliru',
        explanation:
          'Pembilang hanya boleh dibandingkan bila penyebutnya sama. ' +
          F(10, 16) +
          ' = ' +
          F(5, 8) +
          ' = ' +
          F(15, 24) +
          ', sedangkan ' +
          F(3, 4) +
          ' = ' +
          F(18, 24) +
          '.',
      },
      {
        id: 'e2',
        teks:
          'Sinta: "' +
          F(6, 8) +
          ' dan ' +
          F(3, 4) +
          ' sama nilainya, hanya ukuran potongannya yang berbeda."',
        correct: 'tepat',
        explanation: 'Keduanya pecahan senilai: bagian loyang yang diarsir sama luasnya.',
      },
      {
        id: 'e3',
        teks: 'Dodi: "Bentuk paling sederhana dari ' + F(8, 12) + ' adalah ' + F(4, 6) + '."',
        correct: 'keliru',
        explanation:
          F(4, 6) +
          ' masih bisa dibagi 2 menjadi ' +
          F(2, 3) +
          '. Bagi dengan FPB(8, 12) = 4 agar sekali jadi.',
      },
      {
        id: 'e4',
        teks:
          'Rina: "Untuk ' +
          F(2, 3) +
          ' dan ' +
          F(3, 4) +
          ' aku memakai penyebut 24. Itu juga benar."',
        correct: 'tepat',
        explanation:
          '24 adalah kelipatan bersama 3 dan 4, jadi boleh. KPK-nya 12 hanya membuat angkanya lebih kecil.',
      },
      {
        id: 'e5',
        teks:
          'Agus: "' +
          F(2, 3) +
          ' = ' +
          F(4, 5) +
          ' karena pembilang dan penyebutnya sama-sama ditambah 2."',
        correct: 'keliru',
        explanation:
          'Pecahan senilai diperoleh dengan MENGALIKAN atau MEMBAGI pembilang dan penyebut dengan bilangan yang sama, bukan menambah. ' +
          F(2, 3) +
          ' = ' +
          F(10, 15) +
          ', sedangkan ' +
          F(4, 5) +
          ' = ' +
          F(12, 15) +
          '.',
      },
      {
        id: 'e6',
        teks: 'Lala: "Pecahan sudah paling sederhana jika FPB pembilang dan penyebutnya 1."',
        correct: 'tepat',
        explanation: 'Benar, tidak ada lagi bilangan selain 1 yang membagi habis keduanya.',
      },
    ],
    transferJudul: 'Masalah Baru',
    transfer: [
      {
        id: 't1',
        cerita:
          'Dua botol berukuran sama. Botol Rafa terisi ' +
          F(2, 3) +
          ' bagian, botol Nisa terisi ' +
          F(5, 8) +
          ' bagian.',
        tanya: 'Botol siapa yang berisi lebih banyak?',
        correct: 'rafa',
        opsi: [
          { id: 'rafa', label: 'Botol Rafa' },
          { id: 'nisa', label: 'Botol Nisa' },
          { id: 'sama', label: 'Sama banyak' },
          { id: 'tidak', label: 'Tidak bisa dibandingkan' },
        ],
        explanation:
          'KPK(3, 8) = 24: ' +
          F(2, 3) +
          ' = ' +
          F(16, 24) +
          ' dan ' +
          F(5, 8) +
          ' = ' +
          F(15, 24) +
          '. Karena 16 > 15, botol Rafa lebih banyak.',
      },
      {
        id: 't2',
        cerita:
          'Tiga pita: merah ' +
          F(9, 12) +
          ' m, kuning ' +
          F(5, 6) +
          ' m, dan hijau ' +
          F(14, 24) +
          ' m.',
        tanya: 'Pita mana yang PALING PANJANG?',
        correct: 'kuning',
        opsi: [
          { id: 'merah', label: 'Pita merah' },
          { id: 'kuning', label: 'Pita kuning' },
          { id: 'hijau', label: 'Pita hijau' },
          { id: 'sama', label: 'Ketiganya sama panjang' },
        ],
        explanation:
          'Sederhanakan dulu: ' +
          F(9, 12) +
          ' = ' +
          F(3, 4) +
          ', ' +
          F(14, 24) +
          ' = ' +
          F(7, 12) +
          '. Samakan ke per-12: ' +
          F(9, 12) +
          ', ' +
          F(10, 12) +
          ', ' +
          F(7, 12) +
          '. Pita kuning paling panjang.',
      },
    ],
    nextLabel: 'Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — Refleksi
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'PBL · Penutup',
    goal: 'Merenungkan strategi yang dipakai dan seberapa yakin kamu sekarang.',
    guru: 'Minta beberapa murid membacakan jawaban refleksinya. Kaitkan kembali dengan dugaan awal di tahap Orientasi: siapa yang dugaannya berubah, dan mengapa?',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Apakah dugaan awalmu terbukti? Apa yang membuatmu berubah pikiran (atau tetap yakin)?',
        placeholder: 'Dugaan awalku … ternyata …',
      },
      {
        id: 'q2',
        teks: 'Jelaskan dengan kata-katamu sendiri: mengapa pecahan perlu disamakan penyebutnya sebelum dibandingkan?',
        placeholder: 'Karena …',
      },
      {
        id: 'q3',
        teks: 'Di mana lagi kamu bisa memakai cara ini dalam kehidupan sehari-hari?',
        placeholder: 'Misalnya saat …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menyederhanakan dan menyamakan penyebut pecahan sekarang?',
    diriOpsi: [
      { id: 'yakin', label: '😄 Yakin, aku bisa menjelaskannya ke teman' },
      { id: 'cukup', label: '🙂 Cukup yakin, kadang masih perlu melihat contoh' },
      { id: 'belum', label: '🤔 Belum yakin, aku perlu latihan lagi' },
    ],
    nextLabel: 'Simpan Refleksi & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — Selesai
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Misi Tim Peneliti Selesai!',
    teks: 'Kamu berhasil memutuskan kelompok paling laris dengan adil memakai pecahan senilai.',
    capaian: [
      'Menyederhanakan pecahan dengan membagi pembilang dan penyebut menggunakan FPB.',
      'Menyamakan penyebut dua atau tiga pecahan menggunakan KPK.',
      'Membandingkan dan mengurutkan pecahan setelah penyebutnya sama.',
      'Menjelaskan mengapa "banyak potong" belum tentu berarti "bagian terbesar".',
    ],
  },
};
