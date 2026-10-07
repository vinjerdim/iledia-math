'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Perkalian & Pembagian Bilangan Bulat dalam Masalah
   Kontekstual — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menerapkan operasi perkalian dan pembagian pada bilangan bulat
   beserta aturan tandanya untuk menyelesaikan masalah kontekstual.

   Model pembelajaran: COOPERATIVE LEARNING tipe THINK-PAIR-SHARE.
   Setiap misi inti berjalan dalam siklus
     Think (Pikir)  — murid mengerjakan SENDIRI lalu mengunci jawaban;
     Pair (Pasang)  — murid membandingkan jawaban dengan pasangan,
                      berdiskusi, lalu memilih jawaban kesepakatan;
     Share (Bagi)   — juru bicara pasangan (dipilih acak) berbagi
                      ke kelas dengan kalimat pemantik.
   Pemetaan fase ke tahap media:

     Persiapan ..................... 'tujuan'
     Think ......................... 'pikir'                 (perkalian)
     Pair .......................... 'pasang'                (pola & aturan tanda ×)
     Think → Pair .................. 'bagi'                  (pembagian)
     Share ......................... 'berbagi'               (aturan tanda)
     Think → Pair → Share .......... 'masalah'               (masalah kontekstual)
     Pair .......................... 'campuran'              (operasi campuran)
     Akuntabilitas individu ........ 'latihan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Tujuan     (5')  — TP & kriteria, apersepsi (−2) + (−2) + (−2),
                           nama diri & pasangan, aturan main TPS.
     2. Pikir ×    (10') — "Kapal Selam Mini": perkalian sebagai
                           penjumlahan berulang pada garis bilangan;
                           isian berdiagnosa; MENEBAK tanda keempat
                           pola (+)(−) pada tabel aturan tanda.
     3. Pasang ×   (12') — tabel pola 3 × (−2), 2 × (−2), …, (−3) × (−2)
                           diisi berdua; pertanyaan TPS (pikir → tanya
                           pasangan → sepakati); tebakan tanda
                           dibandingkan dengan data.
     4. Bagi       (12') — pembagian sebagai kebalikan perkalian:
                           isian individu, lalu tabel tanda pembagian
                           & pertanyaan TPS (nol, tidak terdefinisi).
     5. Berbagi    (8')  — pasangan menyusun kesimpulan aturan tanda
                           dari bank kalimat acak; juru bicara acak
                           berbagi ke kelas.
     6. Masalah    (15') — empat masalah (suhu, keuangan, kedalaman):
                           memilih kalimat matematika lewat TPS, lalu
                           menghitung & menafsirkan hasilnya.
     7. Campuran   (8')  — urutan pengerjaan langkah demi langkah
                           (skor kuis, suhu rata-rata, tiga faktor).
     8. Uji mandiri(10') — delapan soal acak dari bank enam belas soal.
     9. Refleksi   (3')  — refleksi tertulis, penilaian diri & kerja
                           pasangan.

   Notasi baku: bilangan negatif ditulis dengan minus tipografis (−4).
   Pada perkalian/pembagian, bilangan negatif diberi kurung:
   (−3) × (−4), 15 : (−5). Saldo ditulis dalam rupiah tanpa "Rp" pada
   isian (mis. −12.000).

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban benar sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureTpsStates /
   ensureShuffledOrder / ensureSortStates / shuffleArray dari
   shared/engine.js), sehingga tiap murid dan tiap Reset mendapat urutan
   berbeda. Soal uji mandiri juga diambil acak dari bank.

   Konsistensi kunci jawaban diuji tests/mpi-2.2-data.test.js terhadap
   engine seksi 18 (hasilOperasiBulat, tandaBilangan, fmtOperasiBulat).
   ============================================================ */

var TPS = 'Think-Pair-Share';

var DATA = {
  meta: {
    judul: 'Perkalian & Pembagian Bilangan Bulat dalam Masalah Kontekstual',
  },

  tahap: [
    { id: 'tujuan', label: 'Tujuan' },
    { id: 'pikir', label: 'Pikir ×' },
    { id: 'pasang', label: 'Pasangan ×' },
    { id: 'bagi', label: 'Pembagian' },
    { id: 'berbagi', label: 'Berbagi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'campuran', label: 'Campuran' },
    { id: 'latihan', label: 'Uji Mandiri' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  konteks: {
    suhu: { ikon: '🌡️', nama: 'Suhu' },
    kedalaman: { ikon: '🤿', nama: 'Kedalaman' },
    uang: { ikon: '💰', nama: 'Keuangan' },
    skor: { ikon: '🏆', nama: 'Skor' },
  },

  /* Opsi tanda untuk tabel aturan tanda. */
  tanda: [
    { id: 'positif', label: 'Positif (+)' },
    { id: 'negatif', label: 'Negatif (−)' },
  ],

  /* ---------- Tahap 1: Tujuan & pasangan ---------- */
  tujuan: {
    kicker: 'Tahap 1 · Tujuan & Pasangan',
    syntax: TPS + ' · Persiapan',
    goal: 'Mengetahui tujuan belajar, mengingat penjumlahan berulang, dan menyiapkan pasangan belajar.',
    guru: 'Bentuk pasangan sebangku (bila jumlah murid ganjil, satu kelompok boleh bertiga — tulis dua nama di kolom pasangan). Sepakati tanda waktu: Pikir ± 2 menit tanpa bicara, Berpasangan ± 4 menit, Berbagi ± 1 menit per pasangan.',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Menerapkan operasi perkalian dan pembagian pada bilangan bulat beserta aturan tandanya untuk menyelesaikan masalah kontekstual.',
    kriteria: [
      'Menghitung hasil kali dua bilangan bulat dan menjelaskannya dengan penjumlahan berulang atau pola.',
      'Menentukan tanda hasil kali dan hasil bagi dua bilangan bulat dengan aturan tanda.',
      'Menghitung hasil bagi bilangan bulat sebagai kebalikan perkalian.',
      'Memodelkan masalah suhu, kedalaman, keuangan, dan skor dengan perkalian atau pembagian bilangan bulat, lalu menafsirkan hasilnya.',
      'Menjelaskan alasan jawaban kepada pasangan dan kepada kelas.',
    ],
    apersepsi: {
      label: 'Ingat kembali materi sebelumnya: (−2) + (−2) + (−2) = …',
      jawab: -6,
      hints: [
        'Mulai dari 0, lalu lompat 2 langkah ke kiri sebanyak tiga kali.',
        'Menjumlahkan bilangan negatif membuat hasilnya makin ke kiri (makin negatif).',
      ],
      temuan:
        'Penjumlahan berulang ini dapat ditulis sebagai perkalian: <strong>3 × (−2)</strong>. Hari ini kita menyelidiki perkalian dan pembagian seperti itu.',
    },
    aturan: [
      '<strong>🤔 Pikir</strong> — kerjakan sendiri dulu, tanpa berbicara. Kunci jawabanmu.',
      '<strong>👥 Berpasangan</strong> — tanyakan jawaban pasanganmu, bandingkan, lalu jelaskan alasan masing-masing sampai kalian sepakat.',
      '<strong>📢 Berbagi</strong> — juru bicara yang dipilih acak menjelaskan temuan pasangan ke kelas.',
      'Jawaban yang berbeda bukan masalah — justru itu bahan diskusi terbaik!',
    ],
    namaSayaLabel: 'Namaku',
    namaPasanganLabel: 'Nama pasanganku',
    nextLabel: 'Mulai: Pikir Sendiri →',
  },

  /* ---------- Tahap 2: Pikir (perkalian) ---------- */
  pikir: {
    kicker: 'Tahap 2 · Pikir: Perkalian',
    syntax: TPS + ' · Think',
    tps: 'pikir',
    pesan: 'Kerjakan sendiri tanpa berdiskusi. Pasanganmu juga sedang berpikir sendiri.',
    goal: 'Menghitung perkalian bilangan bulat sebagai penjumlahan berulang dan menebak aturan tandanya.',
    guru: 'Jaga suasana hening selama fase Pikir agar setiap murid punya jawaban sendiri untuk dibandingkan. Tebakan tanda (−) × (−) TIDAK dinilai — biarkan murid berbeda pendapat.',
    cerita: {
      ikon: '🤿',
      judul: 'Kapal Selam Mini',
      teks: 'Kapal selam mini wisata mulai dari permukaan laut (0 m) dan turun 2 m setiap menit. Posisi di bawah permukaan laut ditulis dengan bilangan negatif.',
    },
    garis: { n: 3, b: -2, min: -8, max: 2 },
    hitung: [
      {
        id: 'k1',
        a: 3,
        op: '×',
        b: -2,
        jawab: -6,
        label: 'Posisi kapal selam setelah 3 menit: 3 × (−2) = … m',
        hints: [
          '3 × (−2) = (−2) + (−2) + (−2).',
          'Lihat titik akhir ketiga lompatan pada garis bilangan.',
        ],
      },
      {
        id: 'k2',
        a: 5,
        op: '×',
        b: -3,
        jawab: -15,
        label: 'Kapal selam lain turun 3 m tiap menit selama 5 menit: 5 × (−3) = … m',
        hints: [
          '5 × (−3) = (−3) + (−3) + (−3) + (−3) + (−3).',
          'Lima kali lompat 3 langkah ke kiri dari 0.',
        ],
      },
      {
        id: 'k3',
        a: 4,
        op: '×',
        b: 6,
        jawab: 24,
        label: 'Balon cuaca naik 6 m tiap detik selama 4 detik: 4 × 6 = … m',
        hints: ['4 × 6 = 6 + 6 + 6 + 6.'],
      },
      {
        id: 'k4',
        a: 6,
        op: '×',
        b: -4,
        jawab: -24,
        label: 'Suhu turun 4 °C tiap jam selama 6 jam: 6 × (−4) = … °C',
        hints: [
          '6 × (−4) = (−4) + (−4) + (−4) + (−4) + (−4) + (−4).',
          'Bandingkan dengan 6 × 4 = 24, lalu pikirkan tandanya.',
        ],
      },
    ],
    tandaJudul: 'Tebak tanda hasil kalinya',
    tandaInstruksi:
      'Dua baris pertama dapat kamu cek dengan penjumlahan berulang. Untuk dua baris terakhir kamu belum punya cara menghitungnya — tebak saja dengan alasanmu sendiri. Tebakan ini tidak dinilai.',
    tandaSel: [
      { id: 'pp', label: '(+) × (+)', a: 4, b: 6, correct: 'positif' },
      { id: 'pn', label: '(+) × (−)', a: 3, b: -2, correct: 'negatif' },
      { id: 'np', label: '(−) × (+)', a: -2, b: 3, correct: 'negatif' },
      { id: 'nn', label: '(−) × (−)', a: -3, b: -2, correct: 'positif' },
    ],
    alasanLabel: 'Alasanku untuk tebakan (−) × (−):',
    alasanPlaceholder: 'Menurutku (−3) × (−2) bertanda … karena …',
    nextLabel: 'Lanjut: Diskusi Berpasangan →',
  },

  /* ---------- Tahap 3: Pasang (pola perkalian) ---------- */
  pasang: {
    kicker: 'Tahap 3 · Berpasangan: Pola Perkalian',
    syntax: TPS + ' · Pair',
    tps: 'pasang',
    pesan:
      'Duduk berhadapan dengan pasanganmu. Bandingkan hasil fase Pikir, lalu selidiki pola bersama.',
    goal: 'Menemukan aturan tanda perkalian bilangan bulat dari pola dan menyepakatinya bersama pasangan.',
    guru: 'Berkeliling dan dengarkan pasangan yang jawabannya berbeda. Ajukan pertanyaan, jangan memberi jawaban: "Berapa selisih hasil dua baris berurutan?"',
    polaJudul: 'Tabel pola: perkalian dengan −2',
    polaInstruksi:
      'Pengali berkurang 1 di setiap baris. Amati perubahan hasilnya, lalu lengkapi tabel berdua. Bergantianlah mengetik!',
    polaBaris: [
      { id: 'r3', a: 3, b: -2, jawab: -6, tampil: true },
      { id: 'r2', a: 2, b: -2, jawab: -4, tampil: true },
      { id: 'r1', a: 1, b: -2, jawab: -2, tampil: true },
      { id: 'r0', a: 0, b: -2, jawab: 0, tampil: false },
      { id: 'rm1', a: -1, b: -2, jawab: 2, tampil: false },
      { id: 'rm2', a: -2, b: -2, jawab: 4, tampil: false },
      { id: 'rm3', a: -3, b: -2, jawab: 6, tampil: false },
    ],
    polaHints: [
      'Dari −6 ke −4 ke −2: hasilnya bertambah 2 setiap baris.',
      'Teruskan pola "bertambah 2" walaupun pengalinya menjadi negatif.',
    ],
    tpsJudul: 'Pikir → Tanya pasangan → Sepakati',
    tpsSoal: [
      {
        id: 'pq1',
        tanya: 'Lihat kolom hasil dari atas ke bawah. Setiap pengali berkurang 1, hasilnya …',
        opsi: [
          { id: 'a', label: 'bertambah 2' },
          { id: 'b', label: 'berkurang 2' },
          { id: 'c', label: 'tetap' },
          { id: 'd', label: 'bertambah 1' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! −6, −4, −2, 0, 2, … — setiap baris hasilnya bertambah 2.',
          b: 'Coba hitung: dari −6 ke −4, apakah bilangannya bertambah atau berkurang? −4 ada di kanan −6.',
          c: 'Hasilnya berubah setiap baris. Bandingkan −6 dan −4.',
          d: 'Selisih −6 dan −4 adalah 2, bukan 1.',
        },
        diskusi: 'Hitung selisih dua baris berurutan bersama-sama.',
      },
      {
        id: 'pq2',
        tanya: 'Dengan pola yang sama, (−4) × (−2) = …',
        opsi: [
          { id: 'a', label: '8' },
          { id: 'b', label: '−8' },
          { id: 'c', label: '−6' },
          { id: 'd', label: '6' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Setelah (−3) × (−2) = 6, baris berikutnya bertambah 2 lagi: 8.',
          b: 'Polanya bertambah 2 setiap baris. Setelah 6, hasilnya tidak mungkin turun menjadi −8.',
          c: '−6 adalah hasil (−4) + (−2), yaitu penjumlahan — bukan perkalian.',
          d: '6 adalah hasil (−3) × (−2). Lanjutkan pola satu baris lagi.',
        },
        diskusi: 'Lanjutkan tabel satu baris lagi di bukumu.',
      },
      {
        id: 'pq3',
        tanya: '(−5) × 3 = …  (Ingat: urutan perkalian boleh ditukar.)',
        opsi: [
          { id: 'a', label: '−15' },
          { id: 'b', label: '15' },
          { id: 'c', label: '−2' },
          { id: 'd', label: '−8' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! (−5) × 3 = 3 × (−5) = (−5) + (−5) + (−5) = −15.',
          b: 'Tukar urutannya: 3 × (−5) adalah tiga kali −5. Apakah hasilnya di kanan atau di kiri 0?',
          c: '−2 adalah hasil (−5) + 3, yaitu penjumlahan.',
          d: '−8 adalah hasil (−5) − 3, yaitu pengurangan.',
        },
        diskusi: 'Apa arti 3 × (−5) pada garis bilangan?',
      },
      {
        id: 'pq4',
        tanya:
          'Pernyataan yang benar tentang tanda hasil kali dua bilangan bulat (bukan nol) adalah …',
        opsi: [
          { id: 'a', label: 'Tandanya sama → hasil positif; tandanya berbeda → hasil negatif.' },
          { id: 'b', label: 'Tanda hasil mengikuti bilangan yang nilai mutlaknya lebih besar.' },
          { id: 'c', label: 'Negatif dikali negatif hasilnya negatif.' },
          { id: 'd', label: 'Tanda hasil selalu sama dengan tanda bilangan pertama.' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Inilah aturan tanda perkalian yang kalian temukan dari pola.',
          b: 'Itu aturan untuk penjumlahan bilangan berbeda tanda, bukan perkalian. Cek: 3 × (−2) = −6 padahal 3 lebih besar dari 2.',
          c: 'Lihat tabel: (−3) × (−2) = 6, positif.',
          d: 'Cek: 3 × (−2) = −6. Bilangan pertama positif, tetapi hasilnya negatif.',
        },
        diskusi: 'Uji pernyataan itu dengan dua baris tabel yang berbeda.',
      },
    ],
    bandingJudul: 'Bandingkan tebakanmu di fase Pikir dengan data',
    bandingDugaan: 'Tebakanku',
    bandingData: 'Hasil pola',
    temuan: [
      '(+) × (+) dan (−) × (−) menghasilkan bilangan <strong>positif</strong>.',
      '(+) × (−) dan (−) × (+) menghasilkan bilangan <strong>negatif</strong>.',
      'Bilangan bulat apa pun dikali 0 hasilnya <strong>0</strong>.',
    ],
    nextLabel: 'Lanjut: Pembagian →',
  },

  /* ---------- Tahap 4: Pembagian (Think → Pair) ---------- */
  bagi: {
    kicker: 'Tahap 4 · Pikir & Berpasangan: Pembagian',
    syntax: TPS + ' · Think → Pair',
    tps: ['pikir', 'pasang'],
    pesan: 'Isian bagian A dikerjakan sendiri. Bagian B dan C dikerjakan berdua dengan pasanganmu.',
    goal: 'Menghitung hasil bagi bilangan bulat sebagai kebalikan perkalian dan menentukan tandanya.',
    guru: 'Tekankan hubungan a : b = c ⇔ b × c = a. Pertanyaan tentang pembagian oleh nol cocok dibahas singkat di kelas setelah pasangan sepakat.',
    cerita: {
      ikon: '🌡️',
      judul: 'Freezer Kantin',
      teks: 'Suhu freezer kantin turun 12 °C dalam 3 jam dengan laju tetap. Perubahan suhu setiap jam adalah (−12) : 3. Pembagian adalah kebalikan perkalian: (−12) : 3 = … karena 3 × … = −12.',
    },
    hitungJudul: 'A. Pikir sendiri: hitung hasil baginya',
    hitung: [
      {
        id: 'b1',
        a: -12,
        op: ':',
        b: 3,
        jawab: -4,
        label: '(−12) : 3 = … , karena 3 × … = −12',
        hints: ['Bilangan berapa yang dikali 3 hasilnya −12?', '3 × (−4) = −12.'],
      },
      {
        id: 'b2',
        a: 15,
        op: ':',
        b: -5,
        jawab: -3,
        label: '15 : (−5) = … , karena (−5) × … = 15',
        hints: [
          'Bilangan berapa yang dikali (−5) hasilnya 15?',
          'Agar hasil kalinya positif, kedua bilangan harus bertanda sama.',
        ],
      },
      {
        id: 'b3',
        a: -20,
        op: ':',
        b: -4,
        jawab: 5,
        label: '(−20) : (−4) = … , karena (−4) × … = −20',
        hints: [
          'Bilangan berapa yang dikali (−4) hasilnya −20?',
          '(−4) × 5 = −20, karena tandanya berbeda.',
        ],
      },
      {
        id: 'b4',
        a: 24,
        op: ':',
        b: 6,
        jawab: 4,
        label: '24 : 6 = … , karena 6 × … = 24',
        hints: ['6 × 4 = 24.'],
      },
    ],
    tandaJudul: 'B. Berpasangan: lengkapi tabel tanda pembagian',
    tandaInstruksi:
      'Gunakan hasil isian A. Diskusikan setiap baris, lalu pilih tanda yang kalian sepakati.',
    tandaSel: [
      { id: 'pp', label: '(+) : (+)', a: 24, b: 6, correct: 'positif' },
      { id: 'pn', label: '(+) : (−)', a: 15, b: -5, correct: 'negatif' },
      { id: 'np', label: '(−) : (+)', a: -12, b: 3, correct: 'negatif' },
      { id: 'nn', label: '(−) : (−)', a: -20, b: -4, correct: 'positif' },
    ],
    tandaCekLabel: 'Periksa tabel tanda',
    tpsJudul: 'C. Pikir → Tanya pasangan → Sepakati',
    tpsSoal: [
      {
        id: 'bq1',
        tanya: 'Mengapa (−20) : (−4) hasilnya positif?',
        opsi: [
          { id: 'a', label: 'Karena (−4) × 5 = −20.' },
          { id: 'b', label: 'Karena negatif dibagi negatif selalu negatif.' },
          { id: 'c', label: 'Karena tanda negatif boleh diabaikan saat membagi.' },
          { id: 'd', label: 'Karena −20 lebih kecil daripada −4.' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Hasil bagi dicek dengan perkalian: (−4) × 5 = −20, jadi (−20) : (−4) = 5.',
          b: 'Cek dengan perkalian: (−4) × (−5) = 20, bukan −20. Jadi hasilnya bukan −5.',
          c: 'Tanda tidak diabaikan; tanda ditentukan dengan aturan. Kebetulan hasilnya positif karena kedua tanda sama.',
          d: 'Membandingkan besar bilangan tidak menentukan tanda hasil bagi.',
        },
        diskusi: 'Periksa jawaban kalian dengan perkalian kebalikannya.',
      },
      {
        id: 'bq2',
        tanya: '0 : (−7) = …',
        opsi: [
          { id: 'a', label: '0' },
          { id: 'b', label: '−7' },
          { id: 'c', label: '7' },
          { id: 'd', label: 'tidak dapat ditentukan' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! (−7) × 0 = 0, jadi 0 : (−7) = 0.',
          b: 'Cek: (−7) × (−7) = 49, bukan 0.',
          c: 'Cek: (−7) × 7 = −49, bukan 0.',
          d: 'Nol DIBAGI bilangan lain dapat ditentukan. Bilangan berapa yang dikali (−7) hasilnya 0?',
        },
        diskusi: 'Bilangan berapa yang dikali (−7) hasilnya 0?',
      },
      {
        id: 'bq3',
        tanya: '8 : 0 = …',
        opsi: [
          {
            id: 'a',
            label: 'tidak terdefinisi, sebab tidak ada bilangan yang jika dikali 0 hasilnya 8',
          },
          { id: 'b', label: '0' },
          { id: 'c', label: '8' },
          { id: 'd', label: '−8' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! 0 × bilangan apa pun = 0, tidak pernah 8. Pembagian oleh nol tidak terdefinisi.',
          b: 'Cek: 0 × 0 = 0, bukan 8.',
          c: 'Cek: 0 × 8 = 0, bukan 8.',
          d: 'Cek: 0 × (−8) = 0, bukan 8.',
        },
        diskusi: 'Coba cari bilangan yang jika dikali 0 hasilnya 8. Ada?',
      },
    ],
    temuan: [
      'Pembagian adalah kebalikan perkalian: a : b = c karena b × c = a.',
      'Aturan tanda pembagian sama dengan perkalian: tanda sama → positif, tanda berbeda → negatif.',
      '0 dibagi bilangan bukan nol hasilnya 0; pembagian oleh 0 tidak terdefinisi.',
    ],
    nextLabel: 'Lanjut: Berbagi ke Kelas →',
  },

  /* ---------- Tahap 5: Berbagi (Share) ---------- */
  berbagi: {
    kicker: 'Tahap 5 · Berbagi: Aturan Tanda',
    syntax: TPS + ' · Share',
    tps: 'berbagi',
    pesan: 'Susun kesimpulan berdua, lalu juru bicara pasangan kalian berbagi ke kelas.',
    goal: 'Menyimpulkan aturan tanda perkalian & pembagian bilangan bulat dan mengomunikasikannya ke kelas.',
    guru: 'Panggil 3–4 pasangan secara acak. Minta pasangan lain menanggapi: "Setuju? Ada contoh lain?" Tuliskan rangkuman aturan tanda di papan tulis.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari bank kalimat. Setiap potongan hanya dipakai sekali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      {
        id: 'k1',
        awal: 'Hasil kali atau hasil bagi dua bilangan bulat yang tandanya SAMA',
        correct: 'b1',
      },
      {
        id: 'k2',
        awal: 'Hasil kali atau hasil bagi dua bilangan bulat yang tandanya BERBEDA',
        correct: 'b2',
      },
      { id: 'k3', awal: 'Bilangan bulat apa pun jika dikalikan dengan 0', correct: 'b3' },
      { id: 'k4', awal: 'Hasil pembagian a : b = c (dengan b ≠ 0) dapat diperiksa', correct: 'b4' },
    ],
    bank: [
      { id: 'b1', teks: 'selalu bertanda positif.' },
      { id: 'b2', teks: 'selalu bertanda negatif.' },
      { id: 'b3', teks: 'hasilnya 0.' },
      { id: 'b4', teks: 'dengan perkalian b × c = a.' },
      { id: 'b5', teks: 'tandanya mengikuti bilangan yang nilai mutlaknya lebih besar.' },
      { id: 'b6', teks: 'hasilnya bilangan itu sendiri.' },
      { id: 'b7', teks: 'dengan penjumlahan a + b = c.' },
      { id: 'b8', teks: 'tandanya mengikuti bilangan pertama.' },
    ],
    rangkuman: [
      '(+) × (+) = (+)  dan  (+) : (+) = (+)',
      '(−) × (−) = (+)  dan  (−) : (−) = (+)',
      '(+) × (−) = (−)  dan  (+) : (−) = (−)',
      '(−) × (+) = (−)  dan  (−) : (+) = (−)',
      'a × 0 = 0;  0 : a = 0 (a ≠ 0);  a : 0 tidak terdefinisi',
    ],
    pemantik: [
      '“Kami menemukan bahwa …”',
      '“Contohnya, … karena …”',
      '“Awalnya kami menduga …, ternyata …”',
      '“Yang masih membuat kami penasaran adalah …”',
    ],
    nextLabel: 'Lanjut: Masalah Kontekstual →',
  },

  /* ---------- Tahap 6: Masalah kontekstual (Think → Pair → Share) ---------- */
  masalah: {
    kicker: 'Tahap 6 · Masalah Kontekstual',
    syntax: TPS + ' · Think → Pair → Share',
    tps: ['pikir', 'pasang', 'berbagi'],
    pesan:
      'Untuk setiap masalah: pilih model sendiri dulu, sepakati dengan pasangan, hitung, lalu siapkan penjelasan untuk kelas.',
    goal: 'Memodelkan masalah kontekstual dengan perkalian atau pembagian bilangan bulat, menghitung, dan menafsirkan hasilnya.',
    guru: 'Fokuskan diskusi pada ARTI tanda dalam konteks (turun, berutang, di bawah permukaan, waktu lampau). Pilih satu masalah untuk dibagikan juru bicara ke kelas.',
    soal: [
      {
        id: 'm1',
        konteks: 'suhu',
        cerita:
          'Sebuah freezer baru dinyalakan pada suhu 0 °C. Suhunya turun 3 °C setiap jam dengan laju tetap.',
        pertanyaan: 'Berapa suhu freezer setelah 5 jam?',
        a: 5,
        op: '×',
        b: -3,
        jawab: -15,
        satuan: '°C',
        model: {
          id: 'mq1',
          tanya: 'Kalimat matematika yang tepat untuk suhu setelah 5 jam adalah …',
          opsi: [
            { id: 'a', label: '5 × (−3)' },
            { id: 'b', label: '5 + (−3)' },
            { id: 'c', label: '(−5) × (−3)' },
            { id: 'd', label: '(−3) : 5' },
          ],
          correct: 'a',
          umpan: {
            a: 'Tepat! Turun 3 °C (−3) terjadi 5 kali: 5 × (−3).',
            b: 'Penurunan terjadi setiap jam selama 5 jam — itu penjumlahan berulang, bukan sekali tambah.',
            c: '5 jam ke depan ditulis 5 (positif), bukan −5.',
            d: 'Kita mencari perubahan total selama 5 jam, bukan membagi.',
          },
          diskusi: 'Apa arti "turun 3 °C setiap jam" dalam bilangan bulat?',
        },
        hints: ['5 × (−3) = (−3) + (−3) + (−3) + (−3) + (−3).'],
        temuan:
          'Setelah 5 jam suhu freezer −15 °C, yaitu 15 °C di bawah nol. Masuk akal: suhunya terus turun dari 0.',
      },
      {
        id: 'm2',
        konteks: 'uang',
        cerita:
          'Kas Koperasi Kelas VII-B tercatat −48.000 rupiah (berutang Rp48.000). Utang itu dibagi rata kepada 4 kelompok untuk dilunasi.',
        pertanyaan: 'Berapa bagian saldo setiap kelompok? (Ketik tanpa "Rp".)',
        a: -48000,
        op: ':',
        b: 4,
        jawab: -12000,
        satuan: 'rupiah',
        model: {
          id: 'mq2',
          tanya: 'Kalimat matematika yang tepat untuk bagian setiap kelompok adalah …',
          opsi: [
            { id: 'a', label: '(−48.000) : 4' },
            { id: 'b', label: '(−48.000) × 4' },
            { id: 'c', label: '4 : (−48.000)' },
            { id: 'd', label: '(−48.000) − 4' },
          ],
          correct: 'a',
          umpan: {
            a: 'Tepat! Utang (−48.000) dibagi rata ke 4 kelompok: (−48.000) : 4.',
            b: 'Dibagi rata berarti pembagian, bukan perkalian. Utangnya justru diperkecil per kelompok.',
            c: 'Yang dibagi adalah utangnya, jadi −48.000 ditulis di depan.',
            d: 'Mengurangkan 4 rupiah tidak sama dengan membagi ke 4 kelompok.',
          },
          diskusi: 'Bilangan mana yang dibagi dan bilangan mana pembaginya?',
        },
        hints: ['48.000 : 4 = 12.000. Tentukan tandanya dengan aturan tanda.'],
        temuan:
          'Setiap kelompok mendapat bagian −12.000, artinya setiap kelompok menanggung utang Rp12.000.',
      },
      {
        id: 'm3',
        konteks: 'kedalaman',
        cerita:
          'Kapal selam riset menyelam dari permukaan laut (0 m) ke kedalaman −36 m dalam 4 menit dengan kecepatan tetap.',
        pertanyaan: 'Berapa meter perubahan posisinya setiap menit?',
        a: -36,
        op: ':',
        b: 4,
        jawab: -9,
        satuan: 'm',
        model: {
          id: 'mq3',
          tanya: 'Kalimat matematika yang tepat untuk perubahan posisi tiap menit adalah …',
          opsi: [
            { id: 'a', label: '(−36) : 4' },
            { id: 'b', label: '(−36) × 4' },
            { id: 'c', label: '4 : (−36)' },
            { id: 'd', label: '(−36) + 4' },
          ],
          correct: 'a',
          umpan: {
            a: 'Tepat! Perubahan total −36 m dibagi sama rata ke 4 menit.',
            b: 'Mengalikan membuat perubahannya makin besar. Perubahan tiap menit pasti lebih kecil daripada total.',
            c: 'Yang dibagi adalah perubahan totalnya, −36.',
            d: 'Kita tidak menambahkan menit ke meter.',
          },
          diskusi: 'Perubahan total dibagi ke berapa bagian yang sama?',
        },
        hints: ['Cari bilangan yang dikali 4 hasilnya −36.'],
        temuan: 'Perubahan −9 m setiap menit: kapal selam turun 9 m setiap menit.',
      },
      {
        id: 'm4',
        konteks: 'suhu',
        cerita:
          'Di puncak gunung, suhu turun 4 °C setiap jam dengan laju tetap. Waktu 6 jam yang LALU ditulis −6.',
        pertanyaan:
          'Dibandingkan sekarang, berapa perubahan suhu 6 jam yang lalu? (Hasil positif berarti dulu lebih hangat.)',
        a: -6,
        op: '×',
        b: -4,
        jawab: 24,
        satuan: '°C',
        model: {
          id: 'mq4',
          tanya: 'Kalimat matematika yang tepat adalah …',
          opsi: [
            { id: 'a', label: '(−6) × (−4)' },
            { id: 'b', label: '6 × (−4)' },
            { id: 'c', label: '(−6) + (−4)' },
            { id: 'd', label: '(−4) : (−6)' },
          ],
          correct: 'a',
          umpan: {
            a: 'Tepat! Waktu lampau (−6) dikali perubahan per jam (−4).',
            b: '6 × (−4) menghitung 6 jam ke DEPAN. Pertanyaannya tentang 6 jam yang LALU.',
            c: 'Perubahan terjadi berulang setiap jam — gunakan perkalian.',
            d: 'Kita mencari perubahan total selama 6 jam, bukan membagi.',
          },
          diskusi:
            'Jika suhu turun setiap jam, apakah 6 jam yang lalu suhunya lebih hangat atau lebih dingin?',
        },
        hints: ['Tanda (−6) dan (−4) sama, jadi hasilnya positif.', '6 × 4 = 24.'],
        temuan:
          '24 berarti 6 jam yang lalu suhunya 24 °C LEBIH HANGAT daripada sekarang — masuk akal karena sejak itu suhu terus turun. Inilah makna (−) × (−) = (+).',
      },
    ],
    nextLabel: 'Lanjut: Operasi Campuran →',
  },

  /* ---------- Tahap 7: Operasi campuran (Pair) ---------- */
  campuran: {
    kicker: 'Tahap 7 · Berpasangan: Operasi Campuran',
    syntax: TPS + ' · Pair',
    tps: 'pasang',
    pesan:
      'Kerjakan berdua: satu orang menghitung, satu orang memeriksa aturan tanda. Tukar peran di setiap soal.',
    goal: 'Menyelesaikan operasi campuran bilangan bulat sesuai urutan pengerjaan.',
    guru: 'Ingatkan urutan pengerjaan: kurung → perkalian & pembagian (dari kiri) → penjumlahan & pengurangan (dari kiri). Minta pasangan bertukar peran setiap soal.',
    soal: [
      {
        id: 'e1',
        konteks: 'skor',
        judul: 'Skor Kuis',
        cerita:
          'Kuis Matematika: jawaban benar +4, salah −2, kosong 0. Raka menjawab 7 soal benar dan 5 soal salah.',
        ekspresi: '[[7 × 4]] + 5 × (−2)',
        nilai: 18,
        langkah: [
          {
            label: 'Hitung perkalian pertama: 7 × 4',
            jawab: 28,
            sesudah: '28 + [[5 × (−2)]]',
            hints: ['Perkalian dikerjakan sebelum penjumlahan.'],
          },
          {
            label: 'Hitung perkalian kedua: 5 × (−2)',
            jawab: -10,
            sesudah: '[[28 + (−10)]]',
            hints: ['Tanda berbeda → hasil negatif.'],
          },
          {
            label: 'Jumlahkan: 28 + (−10)',
            jawab: 18,
            sesudah: '18',
            hints: ['28 + (−10) = 28 − 10.'],
          },
        ],
        tafsir: 'Skor Raka 18 poin.',
      },
      {
        id: 'e2',
        konteks: 'suhu',
        judul: 'Suhu Rata-rata',
        cerita:
          'Suhu tengah malam di tiga kota adalah −7 °C, 2 °C, dan −4 °C. Rata-rata = jumlah suhu : banyak kota.',
        ekspresi: '([[−7 + 2]] + (−4)) : 3',
        nilai: -3,
        langkah: [
          {
            label: 'Kerjakan di dalam kurung lebih dulu: −7 + 2',
            jawab: -5,
            sesudah: '([[−5 + (−4)]]) : 3',
            hints: ['Dari −7, lompat 2 langkah ke kanan.'],
          },
          {
            label: 'Masih di dalam kurung: −5 + (−4)',
            jawab: -9,
            sesudah: '[[(−9) : 3]]',
            hints: ['Menambah bilangan negatif → makin ke kiri.'],
          },
          {
            label: 'Bagi dengan banyak kota: (−9) : 3',
            jawab: -3,
            sesudah: '−3',
            hints: ['3 × … = −9.'],
          },
        ],
        tafsir: 'Suhu rata-rata ketiga kota −3 °C.',
      },
      {
        id: 'e3',
        konteks: 'skor',
        judul: 'Tantangan Tiga Faktor',
        cerita:
          'Tantangan tanda: kalikan tiga bilangan negatif dari kiri ke kanan, lalu amati tanda hasilnya.',
        ekspresi: '[[(−2) × (−3)]] × (−4)',
        nilai: -24,
        langkah: [
          {
            label: 'Kalikan dua bilangan pertama: (−2) × (−3)',
            jawab: 6,
            sesudah: '[[6 × (−4)]]',
            hints: ['Tanda sama → hasil positif.'],
          },
          {
            label: 'Kalikan hasilnya dengan (−4): 6 × (−4)',
            jawab: -24,
            sesudah: '−24',
            hints: ['Tanda berbeda → hasil negatif.'],
          },
        ],
        tafsir: 'Tiga faktor negatif menghasilkan bilangan negatif.',
      },
    ],
    tpsJudul: 'Pikir → Tanya pasangan → Sepakati',
    tpsSoal: [
      {
        id: 'cq1',
        tanya: 'Pada 7 × 4 + 5 × (−2), mengapa perkalian dikerjakan lebih dulu?',
        opsi: [
          {
            id: 'a',
            label: 'Perkalian dan pembagian dikerjakan sebelum penjumlahan dan pengurangan.',
          },
          { id: 'b', label: 'Karena perkalian selalu ditulis paling depan.' },
          { id: 'c', label: 'Karena operasi selalu dikerjakan dari kanan ke kiri.' },
          { id: 'd', label: 'Karena bilangan negatif harus dihitung paling akhir.' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Itulah aturan urutan pengerjaan operasi hitung.',
          b: 'Letak penulisan tidak menentukan urutan. Pada 2 + 3 × 4, perkalian tetap dikerjakan dulu.',
          c: 'Operasi setingkat dikerjakan dari KIRI ke kanan.',
          d: 'Tanda bilangan tidak menentukan urutan pengerjaan.',
        },
        diskusi: 'Bandingkan hasil (7 × 4 + 5) × (−2) dengan 7 × 4 + 5 × (−2).',
      },
      {
        id: 'cq2',
        tanya: 'Tanda hasil (−1) × (−1) × (−1) × (−1) × (−1) adalah …',
        opsi: [
          { id: 'a', label: 'negatif' },
          { id: 'b', label: 'positif' },
          { id: 'c', label: 'nol' },
          { id: 'd', label: 'tidak bisa ditentukan' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Setiap dua faktor negatif menjadi positif; satu faktor negatif tersisa, jadi hasilnya −1.',
          b: 'Kalikan berpasangan: (−1) × (−1) = 1 dua kali, lalu sisa satu (−1).',
          c: 'Tidak ada faktor 0, jadi hasilnya tidak mungkin 0.',
          d: 'Tanda dapat ditentukan dengan mengalikan dari kiri satu per satu.',
        },
        diskusi: 'Hitung banyak faktor negatifnya: genap atau ganjil?',
      },
    ],
    nextLabel: 'Lanjut: Uji Mandiri →',
  },

  /* ---------- Tahap 8: Uji mandiri ---------- */
  latihan: {
    kicker: 'Tahap 8 · Uji Mandiri',
    syntax: 'Akuntabilitas Individu',
    goal: 'Menerapkan perkalian dan pembagian bilangan bulat secara mandiri untuk menyelesaikan masalah kontekstual.',
    guru: 'Fase ini dikerjakan SENDIRI. Setiap murid mendapat soal acak yang berbeda dari pasangannya. Minta murid menuliskan kalimat matematikanya di buku.',
    instruksi:
      'Kerjakan sendiri. Tulis kalimat matematikanya di bukumu, lalu ketik hasilnya. Gunakan tanda − untuk bilangan negatif. Untuk uang, ketik angkanya saja tanpa "Rp", mis. −15.000.',
    banyak: 8,
    komposisi: { input: 6, choice: 2 },
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: 'suhu',
        a: 7,
        op: '×',
        b: -2,
        jawab: -14,
        cerita: 'Suhu ruang pendingin turun 2 °C setiap 10 menit.',
        pertanyaan: 'Berapa derajat Celsius perubahan suhunya setelah 7 kali 10 menit?',
        hints: ['Turun 2 °C → −2, terjadi 7 kali: 7 × (−2).'],
        reveal: '7 × (−2) = −14, jadi suhunya berubah −14 °C (turun 14 °C).',
        explanation: 'Tanda berbeda → hasil negatif.',
      },
      {
        id: 't2',
        type: 'input',
        konteks: 'kedalaman',
        a: 8,
        op: '×',
        b: -3,
        jawab: -24,
        cerita: 'Seorang penyelam turun 3 m setiap menit dari permukaan laut.',
        pertanyaan: 'Pada posisi berapa meter penyelam setelah 8 menit?',
        hints: ['8 × (−3).', '8 × 3 = 24; tanda berbeda → negatif.'],
        reveal: '8 × (−3) = −24, jadi penyelam berada di −24 m.',
        explanation: 'Posisi di bawah permukaan laut bernilai negatif.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: 'uang',
        a: 6,
        op: '×',
        b: -2500,
        jawab: -15000,
        cerita: 'Saldo tabungan Dito berubah −Rp2.500 setiap hari karena biaya parkir.',
        pertanyaan: 'Berapa perubahan saldonya selama 6 hari? (Ketik tanpa "Rp".)',
        hints: ['6 × (−2.500).', '6 × 2.500 = 15.000; tentukan tandanya.'],
        reveal: '6 × (−2.500) = −15.000, jadi saldonya berkurang Rp15.000.',
        explanation: 'Perubahan negatif berulang membuat saldo makin berkurang.',
      },
      {
        id: 't4',
        type: 'input',
        konteks: 'skor',
        a: 4,
        op: '×',
        b: -5,
        jawab: -20,
        cerita: 'Dalam lomba cerdas cermat, setiap jawaban salah bernilai −5.',
        pertanyaan: 'Berapa nilai dari 4 jawaban salah?',
        hints: ['4 × (−5).'],
        reveal: '4 × (−5) = −20.',
        explanation: 'Tanda berbeda → hasil negatif.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: 'suhu',
        a: -18,
        op: ':',
        b: 6,
        jawab: -3,
        cerita: 'Suhu sebuah kota turun 18 °C dalam 6 jam dengan laju tetap.',
        pertanyaan: 'Berapa derajat Celsius perubahan suhu setiap jam?',
        hints: ['(−18) : 6.', '6 × … = −18.'],
        reveal: '(−18) : 6 = −3, jadi suhu berubah −3 °C setiap jam.',
        explanation: 'Tanda berbeda → hasil bagi negatif.',
      },
      {
        id: 't6',
        type: 'input',
        konteks: 'kedalaman',
        a: -45,
        op: ':',
        b: 5,
        jawab: -9,
        cerita:
          'Kapal selam menyelam dari permukaan laut (0 m) ke −45 m dalam 5 menit dengan kecepatan tetap.',
        pertanyaan: 'Berapa meter perubahan posisinya setiap menit?',
        hints: ['(−45) : 5.', '5 × … = −45.'],
        reveal: '(−45) : 5 = −9, jadi kapal selam turun 9 m setiap menit.',
        explanation: 'Tanda berbeda → hasil bagi negatif.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: 'uang',
        a: -60000,
        op: ':',
        b: 3,
        jawab: -20000,
        cerita: 'Kerugian usaha kantin sebesar −Rp60.000 ditanggung sama besar oleh 3 pengelola.',
        pertanyaan: 'Berapa bagian saldo setiap pengelola? (Ketik tanpa "Rp".)',
        hints: ['(−60.000) : 3.', '60.000 : 3 = 20.000; tentukan tandanya.'],
        reveal: '(−60.000) : 3 = −20.000, jadi tiap pengelola menanggung rugi Rp20.000.',
        explanation: 'Kerugian dibagi rata tetap bertanda negatif.',
      },
      {
        id: 't8',
        type: 'input',
        konteks: 'suhu',
        a: -5,
        op: '×',
        b: -3,
        jawab: 15,
        cerita:
          'Suhu di sebuah gurun turun 3 °C setiap jam pada malam hari. Waktu 5 jam yang lalu ditulis −5.',
        pertanyaan: 'Dibandingkan sekarang, berapa perubahan suhu 5 jam yang lalu?',
        hints: ['(−5) × (−3).', 'Tanda sama → hasil positif.'],
        reveal: '(−5) × (−3) = 15, jadi 5 jam yang lalu suhunya 15 °C lebih hangat.',
        explanation: 'Negatif × negatif = positif.',
      },
      {
        id: 't9',
        type: 'input',
        konteks: 'skor',
        a: -24,
        op: ':',
        b: 6,
        jawab: -4,
        cerita:
          'Skor total sebuah tim −24 diperoleh dari 6 babak dengan skor yang sama setiap babak.',
        pertanyaan: 'Berapa skor tim pada setiap babak?',
        hints: ['(−24) : 6.'],
        reveal: '(−24) : 6 = −4.',
        explanation: 'Tanda berbeda → hasil bagi negatif.',
      },
      {
        id: 't10',
        type: 'input',
        konteks: 'kedalaman',
        a: -28,
        op: ':',
        b: -4,
        jawab: 7,
        cerita: 'Seekor penyu menyelam dengan perubahan posisi −4 m setiap menit.',
        pertanyaan: 'Berapa menit yang dibutuhkan agar posisinya berubah −28 m?',
        hints: ['(−28) : (−4).', '(−4) × … = −28.'],
        reveal: '(−28) : (−4) = 7, jadi dibutuhkan 7 menit.',
        explanation: 'Tanda sama → hasil bagi positif.',
      },
      {
        id: 't11',
        type: 'input',
        konteks: 'suhu',
        a: 4,
        op: '×',
        b: -6,
        jawab: -24,
        cerita: 'Di stasiun kutub, suhu berubah −6 °C setiap hari selama 4 hari.',
        pertanyaan: 'Berapa derajat Celsius perubahan suhu totalnya?',
        hints: ['4 × (−6).'],
        reveal: '4 × (−6) = −24.',
        explanation: 'Tanda berbeda → hasil negatif.',
      },
      {
        id: 'c1',
        type: 'choice',
        konteks: 'skor',
        cerita: 'Hitung dengan aturan tanda.',
        pertanyaan: '(−8) × 7 = …',
        options: [
          { id: 'a', label: '−56' },
          { id: 'b', label: '56' },
          { id: 'c', label: '−1' },
          { id: 'd', label: '−15' },
        ],
        correct: 'a',
        explanation: 'Tanda berbeda → negatif; 8 × 7 = 56, jadi (−8) × 7 = −56.',
      },
      {
        id: 'c2',
        type: 'choice',
        konteks: 'skor',
        cerita: 'Hitung dengan aturan tanda.',
        pertanyaan: '(−63) : (−9) = …',
        options: [
          { id: 'a', label: '7' },
          { id: 'b', label: '−7' },
          { id: 'c', label: '−72' },
          { id: 'd', label: '−54' },
        ],
        correct: 'a',
        explanation: 'Tanda sama → positif; (−9) × 7 = −63.',
      },
      {
        id: 'c3',
        type: 'choice',
        konteks: 'uang',
        cerita: 'Utang kelompok sebesar Rp30.000 dibagi rata kepada 5 anggota.',
        pertanyaan: 'Kalimat matematika untuk bagian saldo setiap anggota adalah …',
        options: [
          { id: 'a', label: '(−30.000) : 5' },
          { id: 'b', label: '(−30.000) × 5' },
          { id: 'c', label: '5 : (−30.000)' },
          { id: 'd', label: '30.000 − 5' },
        ],
        correct: 'a',
        explanation: 'Utang ditulis −30.000 dan dibagi rata 5 orang: (−30.000) : 5 = −6.000.',
      },
      {
        id: 'c4',
        type: 'choice',
        konteks: 'suhu',
        cerita: 'Periksa setiap pernyataan dengan aturan tanda.',
        pertanyaan: 'Pernyataan yang BENAR adalah …',
        options: [
          { id: 'a', label: '(−4) × (−5) = 20' },
          { id: 'b', label: '(−4) × (−5) = −20' },
          { id: 'c', label: '(−20) : 4 = 5' },
          { id: 'd', label: '20 : (−4) = 5' },
        ],
        correct: 'a',
        explanation:
          'Tanda sama → positif, jadi (−4) × (−5) = 20. Dua pembagian lainnya seharusnya −5.',
      },
      {
        id: 'c5',
        type: 'choice',
        konteks: 'skor',
        cerita: 'Ingat urutan pengerjaan: perkalian & pembagian lebih dulu.',
        pertanyaan: '3 × (−2) + (−8) : 4 = …',
        options: [
          { id: 'a', label: '−8' },
          { id: 'b', label: '8' },
          { id: 'c', label: '−4' },
          { id: 'd', label: '−14' },
        ],
        correct: 'a',
        explanation: '3 × (−2) = −6 dan (−8) : 4 = −2, lalu −6 + (−2) = −8.',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ---------- Tahap 9: Refleksi ---------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Refleksi Individu & Pasangan',
    goal: 'Merefleksikan pemahaman aturan tanda dan kerja sama dengan pasangan.',
    guru: 'Baca beberapa jawaban refleksi untuk menentukan murid yang perlu pendampingan. Penilaian kerja pasangan membantu memantau kualitas diskusi.',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Bagaimana kamu menjelaskan kepada adik kelas mengapa (−3) × (−2) = 6?',
        placeholder: 'Aku akan menjelaskan dengan pola …',
      },
      {
        id: 'q2',
        teks: 'Apa yang berubah dari jawabanmu setelah berdiskusi dengan pasangan?',
        placeholder: 'Awalnya aku menjawab …, setelah berdiskusi …',
      },
      {
        id: 'q3',
        teks: 'Di mana lagi kamu menemui perkalian atau pembagian bilangan bulat dalam kehidupan sehari-hari?',
        placeholder: 'Misalnya saat …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menentukan tanda hasil kali dan hasil bagi sekarang?',
    diriOpsi: [
      { id: 'yakin', label: '😄 Yakin — aku bisa menjelaskannya kepada teman' },
      { id: 'cukup', label: '🙂 Cukup yakin — kadang masih perlu melihat tabel' },
      { id: 'belum', label: '🤔 Belum yakin — aku masih perlu berlatih' },
    ],
    pasanganLabel: 'Bagaimana kerja sama kalian berdua hari ini?',
    pasanganOpsi: [
      { id: 'seimbang', label: '🤝 Kami bergantian menjelaskan dan saling mendengarkan' },
      { id: 'dominan', label: '🗣️ Kebanyakan hanya satu orang yang berbicara' },
      { id: 'kurang', label: '😶 Kami belum benar-benar berdiskusi' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ---------- Tahap 10: Selesai ---------- */
  selesai: {
    judul: 'Hebat, kalian berhasil!',
    teks: 'Kalian sudah menemukan, menyepakati, dan membagikan aturan tanda perkalian dan pembagian bilangan bulat, lalu menerapkannya pada masalah sehari-hari.',
    aturan: [
      { teks: '(+) × (+) = (+)', ket: 'tanda sama → positif' },
      { teks: '(−) × (−) = (+)', ket: 'tanda sama → positif' },
      { teks: '(+) × (−) = (−)', ket: 'tanda berbeda → negatif' },
      { teks: '(−) : (+) = (−)', ket: 'berlaku juga untuk pembagian' },
    ],
    capaian: [
      'Menghitung perkalian bilangan bulat dengan penjumlahan berulang dan pola.',
      'Menemukan aturan tanda perkalian dan pembagian bersama pasangan.',
      'Menghitung pembagian bilangan bulat sebagai kebalikan perkalian.',
      'Memodelkan dan menafsirkan masalah suhu, kedalaman, keuangan, dan skor.',
      'Menyelesaikan operasi campuran sesuai urutan pengerjaan.',
    ],
  },
};
