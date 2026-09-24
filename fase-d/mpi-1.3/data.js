'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membaca & Menulis Pecahan Biasa dan Pecahan Campuran
   Fase D — SMP Kelas 7

   Tujuan Pembelajaran:
   Membaca dan menuliskan pecahan biasa dan pecahan campuran sesuai
   notasi baku.

   Notasi baku yang dipakai di seluruh modul:
     • pecahan biasa a/b ditulis bersusun: pembilang (a) di atas garis
       pecahan, penyebut (b) di bawahnya; penyebut tidak pernah 0;
     • dibaca "a per b": 3/8 → "tiga per delapan";
     • pecahan campuran ditulis bilangan bulat di kiri, berdampingan
       langsung dengan pecahan biasa yang pembilangnya LEBIH KECIL dari
       penyebutnya, tanpa tanda + (2¾, bukan 2 + ¾, 23/4, atau 2 5/4);
     • dibaca bilangan bulatnya dulu, lalu pecahannya:
       2¾ → "dua tiga per empat";
     • "setengah" dan "seperempat" adalah sebutan sehari-hari untuk
       1/2 dan 1/4; bentuk baku yang berlaku untuk semua pecahan tetap
       "satu per dua" dan "satu per empat".

   Model pembelajaran: DIRECT INSTRUCTION (Pembelajaran Langsung).
   Pemetaan fase ke tahap media:

     Fase 1 — Orientasi: menyampaikan tujuan &
              mempersiapkan murid ............. tahap 'orientasi'
     Fase 2 — Demonstrasi pengetahuan &
              keterampilan ..................... tahap 'demoBiasa' & 'demoCampuran'
     Fase 3 — Latihan terbimbing ............... tahap 'bimbingBaca' & 'bimbingTulis'
     Fase 4 — Mengecek pemahaman &
              memberi umpan balik .............. tahap 'cekPaham'
     Fase 5 — Latihan mandiri & transfer ....... tahap 'mandiri'
     Penutup .................................. 'refleksi', 'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — tujuan dinyatakan di awal, setiap tahap
       menyebut apa yang sedang dilatih, dan murid merefleksikan
       keyakinannya di akhir.
     • Bermakna (meaningful) — pecahan dijumpai dalam konteks martabak,
       kue, resep, pita, dan jarak lari; model visual selalu menyertai
       notasi.
     • Menggembirakan (joyful) — laboratorium pecahan yang bisa diutak-
       atik, umpan balik langsung, dan bintang capaian.

   Rangkaian aktivitas (± 2 × 40 menit, klasikal → berpasangan → mandiri):
     1. Orientasi        (8')  — konteks "Martabak Pak Udin", tujuan,
                                 apersepsi makna pecahan.
     2. Demo biasa       (12') — guru memodelkan langkah demi langkah
                                 menulis & membaca 3/8; murid meniru di
                                 laboratorium pecahan.
     3. Demo campuran    (12') — guru memodelkan 2¾ dari bolu loyang;
                                 contoh penulisan keliru vs baku.
     4. Bimbing baca     (10') — memilih cara baca baku (berpasangan,
                                 umpan balik per pilihan).
     5. Bimbing tulis    (12') — menulis pecahan dari cara baca/gambar
                                 dengan kotak isian bersusun + petunjuk.
     6. Cek pemahaman    (8')  — memeriksa pernyataan tepat/belum tepat,
                                 ringkasan aturan & remedial singkat.
     7. Latihan mandiri  (12') — delapan soal kontekstual, dinilai.
     8. Refleksi         (6')  — refleksi tertulis & penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di posisi pertama). Pengacakan
   dilakukan app.js memakai ensureShuffledOrder()/ensureSortStates()/
   shuffleArray() dari shared/engine.js, satu kali saat state disiapkan,
   sehingga tiap murid (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var DI = 'Direct Instruction';

/* Pecahan bersusun kecil untuk label pilihan & kalimat. */
function F(num, den, whole) {
  return buildFracInline(num, den, whole);
}

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI (Fase 1)
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    syntax: DI + ' · Fase 1',
    goal: 'Mengetahui tujuan belajar hari ini dan mengingat kembali makna pecahan.',
    guru: 'Bacakan cerita dengan suara lantang sambil menunjuk gambar martabak. Sampaikan tujuan pembelajaran secara eksplisit dan tanyakan di mana murid pernah melihat pecahan (resep, jam, diskon). Apersepsi cukup dijawab klasikal.',
    ikon: '🥞',
    judul: 'Martabak Pak Udin',
    cerita:
      'Pak Udin memotong satu loyang martabak manis menjadi 8 potong yang sama besar. Sinta membeli 3 potong. Pak Udin ingin menulis di nota: "Sinta membeli … bagian martabak". Bagaimana menuliskannya dengan angka, dan bagaimana membacanya dengan benar?',
    model: {
      num: 3,
      den: 8,
      shape: 'circle',
      caption: 'Bagian berwarna = potongan yang dibeli Sinta',
    },
    tujuan: [
      'Menunjukkan pembilang, penyebut, dan garis pecahan pada sebuah pecahan.',
      'Membaca pecahan biasa sesuai notasi baku, mis. ' + F(3, 8) + ' → "tiga per delapan".',
      'Menuliskan pecahan biasa dari cara baca atau gambar.',
      'Membaca dan menuliskan pecahan campuran, mis. ' + F(3, 4, 2) + ' → "dua tiga per empat".',
    ],
    apersepsi: {
      id: 'ap',
      tanya: 'Ingat kembali: potongan martabak yang dibeli Sinta adalah …',
      opsi: [
        { id: 'a', label: '3 bagian dari 8 bagian yang sama besar' },
        { id: 'b', label: '8 bagian dari 3 bagian yang sama besar' },
        { id: 'c', label: '3 bagian dari 5 bagian yang tersisa' },
        { id: 'd', label: '5 bagian dari 8 bagian yang sama besar' },
      ],
      correct: 'a',
      umpan: {
        a: 'Tepat! Satu loyang dibagi 8 bagian sama besar, Sinta mengambil 3 bagian. Inilah makna sebuah pecahan.',
        b: 'Terbalik. Martabak dibagi menjadi 8 bagian, bukan 3. Coba lagi.',
        c: 'Pembandingnya adalah seluruh loyang (8 bagian), bukan sisa potongan. Coba lagi.',
        d: '5 bagian adalah potongan yang TIDAK dibeli Sinta. Coba lagi.',
      },
    },
    manfaat: [
      { ikon: '🧁', teks: 'Resep: ' + F(1, 2, 1) + ' gelas tepung' },
      { ikon: '🎀', teks: 'Pita ' + F(3, 4) + ' meter' },
      { ikon: '🏃', teks: 'Lari ' + F(1, 2, 2) + ' kilometer' },
    ],
    manfaatJudul:
      'Pecahan ada di sekitar kita. Kalau cara menulis dan membacanya berbeda-beda, pesan bisa salah dipahami!',
    nextLabel: 'Mulai Belajar →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — DEMONSTRASI PECAHAN BIASA (Fase 2)
     ---------------------------------------------------------- */
  demoBiasa: {
    kicker: 'Tahap 2 · Demonstrasi: Pecahan Biasa',
    syntax: DI + ' · Fase 2',
    goal: 'Mengamati langkah baku menulis dan membaca pecahan biasa, lalu menirukannya.',
    guru: 'Tampilkan layar ke seluruh kelas. Buka satu langkah setiap kali, ucapkan langkahnya dengan lantang (think aloud), lalu minta murid menirukan cara bacanya bersama-sama. Setelah itu murid mencoba laboratorium pecahan secara berpasangan.',
    contoh: { num: 3, den: 8 },
    langkah: [
      {
        judul: 'Hitung semua bagian yang sama besar',
        teks: 'Satu loyang dibagi menjadi <strong>8</strong> bagian sama besar. Bilangan ini disebut <strong>penyebut</strong> dan ditulis <em>di bawah</em> garis pecahan.',
        tampil: 'den',
      },
      {
        judul: 'Hitung bagian yang diambil',
        teks: 'Sinta mengambil <strong>3</strong> bagian. Bilangan ini disebut <strong>pembilang</strong> dan ditulis <em>di atas</em> garis pecahan.',
        tampil: 'num',
      },
      {
        judul: 'Tulis dengan garis pecahan',
        teks: 'Pembilang dan penyebut dipisahkan <strong>garis pecahan</strong> mendatar. Saat mengetik di komputer, boleh ditulis dengan garis miring: 3/8.',
        tampil: 'full',
      },
      {
        judul: 'Baca: pembilang – "per" – penyebut',
        teks: 'Bacalah pembilang lebih dulu, lalu kata <strong>"per"</strong>, lalu penyebut: <strong>"tiga per delapan"</strong>.',
        tampil: 'baca',
      },
    ],
    lab: {
      judul: 'Laboratorium Pecahan',
      instruksi:
        'Sekarang giliranmu! Ubah pembilang dan penyebut, lalu ucapkan cara bacanya dengan lantang. Coba minimal 3 pecahan yang berbeda.',
      denMin: 2,
      denMax: 12,
      start: { num: 1, den: 4 },
      minCoba: 3,
    },
    catatan: [
      'Penyebut tidak boleh 0 — tidak mungkin membagi sesuatu menjadi 0 bagian.',
      '"Setengah" (' +
        F(1, 2) +
        ') dan "seperempat" (' +
        F(1, 4) +
        ') adalah sebutan sehari-hari. Cara baku yang berlaku untuk semua pecahan: "satu per dua", "satu per empat".',
      'Pembilang boleh sama dengan atau lebih besar dari penyebut, mis. ' +
        F(9, 4) +
        ' dibaca "sembilan per empat".',
    ],
    nextLabel: 'Lanjut: Pecahan Campuran →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — DEMONSTRASI PECAHAN CAMPURAN (Fase 2)
     ---------------------------------------------------------- */
  demoCampuran: {
    kicker: 'Tahap 3 · Demonstrasi: Pecahan Campuran',
    syntax: DI + ' · Fase 2',
    goal: 'Mengamati langkah baku menulis dan membaca pecahan campuran, serta membedakannya dari penulisan yang keliru.',
    guru: 'Lanjutkan think aloud. Tekankan dua hal: bilangan bulat ditulis besar sejajar dengan pecahan (tanpa tanda +), dan bagian pecahannya harus kurang dari satu. Bahas tabel "keliru vs baku" dengan meminta murid menebak dulu sebelum membuka alasannya.',
    cerita:
      'Bu Rina membawa kue bolu ke kelas: 2 loyang masih utuh, dan satu loyang lagi dipotong 4 sama besar tetapi tinggal 3 potong.',
    contoh: { whole: 2, num: 3, den: 4 },
    langkah: [
      {
        judul: 'Hitung benda yang masih utuh',
        teks: 'Ada <strong>2</strong> loyang utuh. Bilangan bulat ini ditulis besar di sebelah kiri.',
        tampil: 'whole',
      },
      {
        judul: 'Tulis sisanya sebagai pecahan biasa',
        teks:
          'Loyang ketiga tinggal 3 dari 4 potong: ' +
          F(3, 4) +
          '. Pembilangnya (3) harus <strong>lebih kecil</strong> dari penyebutnya (4).',
        tampil: 'frac',
      },
      {
        judul: 'Gabungkan tanpa tanda +',
        teks: 'Tulis bilangan bulat tepat di kiri pecahan, sejajar dengan garis pecahan.',
        tampil: 'full',
      },
      {
        judul: 'Baca: bilangan bulat, lalu pecahannya',
        teks: 'Bacalah bilangan bulatnya dulu, lalu pecahannya: <strong>"dua tiga per empat"</strong>.',
        tampil: 'baca',
      },
    ],
    lab: {
      judul: 'Laboratorium Pecahan Campuran',
      instruksi:
        'Ubah bilangan bulat, pembilang, dan penyebut. Perhatikan: pembilang selalu lebih kecil dari penyebut. Coba minimal 3 pecahan campuran yang berbeda.',
      wholeMax: 5,
      denMin: 2,
      denMax: 10,
      start: { whole: 1, num: 1, den: 2 },
      minCoba: 3,
    },
    keliruJudul: 'Baku atau keliru?',
    keliruInstruksi:
      'Tentukan apakah setiap tulisan untuk "dua tiga per empat" berikut sudah baku. Setelah memilih, baca alasannya.',
    keliruOpsi: [
      { id: 'baku', label: '✓ Baku' },
      { id: 'keliru', label: '✗ Keliru' },
    ],
    keliru: [
      {
        id: 'k1',
        tulis: '2 + ' + F(3, 4),
        baku: false,
        alasan: 'Ini bentuk penjumlahan, bukan notasi pecahan campuran. Tanda + tidak ditulis.',
      },
      {
        id: 'k2',
        tulis: F(23, 4),
        baku: false,
        alasan:
          'Angka 2 dan 3 menyatu sehingga terbaca "dua puluh tiga per empat" — nilainya jauh berbeda!',
      },
      {
        id: 'k3',
        tulis: F(7, 4, 1),
        baku: false,
        alasan:
          'Nilainya memang sama, tetapi bagian pecahannya (' +
          F(7, 4) +
          ') lebih dari satu. Pada pecahan campuran baku, pembilang harus lebih kecil dari penyebut.',
      },
      {
        id: 'k4',
        tulis: F(3, 4, 2),
        baku: true,
        alasan: 'Baku: bilangan bulat di kiri, pecahan dengan pembilang < penyebut, tanpa tanda +.',
      },
    ],
    nextLabel: 'Lanjut: Latihan Membaca →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — LATIHAN TERBIMBING: MEMBACA (Fase 3)
     ---------------------------------------------------------- */
  bimbingBaca: {
    kicker: 'Tahap 4 · Latihan Terbimbing: Membaca',
    syntax: DI + ' · Fase 3',
    goal: 'Membaca pecahan biasa dan pecahan campuran sesuai notasi baku dengan bimbingan.',
    guru: 'Murid bekerja berpasangan: satu membaca lantang, satu memilih jawaban, lalu bergantian. Berkeliling dan dengarkan cara baca murid. Umpan balik setiap pilihan keliru menjelaskan letak kesalahannya.',
    instruksi:
      'Baca pecahan pada setiap soal dengan lantang bersama pasanganmu, lalu pilih cara baca yang baku. Jika belum tepat, baca umpan baliknya dan coba lagi.',
    soal: [
      {
        id: 'b1',
        frac: { num: 2, den: 5 },
        model: 'bar',
        opsi: [
          { id: 'a', label: 'dua per lima' },
          { id: 'b', label: 'lima per dua' },
          { id: 'c', label: 'dua koma lima' },
          { id: 'd', label: 'dua lima' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Pembilang 2 dibaca dulu, lalu "per", lalu penyebut 5.',
          b: 'Terbalik. Baca pembilang (angka di atas) lebih dulu.',
          c: '"Koma" dipakai untuk bilangan desimal, bukan pecahan bersusun.',
          d: 'Kata "per" tidak boleh dihilangkan — tanpa "per" terdengar seperti dua bilangan terpisah.',
        },
      },
      {
        id: 'b2',
        frac: { num: 7, den: 10 },
        opsi: [
          { id: 'a', label: 'tujuh per sepuluh' },
          { id: 'b', label: 'sepuluh per tujuh' },
          { id: 'c', label: 'tujuh puluh' },
          { id: 'd', label: 'tujuh per satu nol' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! "tujuh per sepuluh".',
          b: 'Terbalik. Angka di atas garis (7) adalah pembilang dan dibaca lebih dulu.',
          c: 'Pembilang dan penyebut tidak digabung menjadi satu bilangan.',
          d: 'Penyebut 10 dibaca sebagai satu bilangan: "sepuluh", bukan per angka.',
        },
      },
      {
        id: 'b3',
        frac: { num: 5, den: 12 },
        model: 'circle',
        opsi: [
          { id: 'a', label: 'lima per dua belas' },
          { id: 'b', label: 'dua belas per lima' },
          { id: 'c', label: 'lima per satu dua' },
          { id: 'd', label: 'lima dua belas' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! "lima per dua belas".',
          b: 'Terbalik. Baca pembilang (5) lebih dulu.',
          c: 'Penyebut 12 dibaca "dua belas", bukan angka demi angka.',
          d: 'Kata "per" tidak boleh dihilangkan.',
        },
      },
      {
        id: 'b4',
        frac: { whole: 3, num: 1, den: 2 },
        model: 'circle',
        opsi: [
          { id: 'a', label: 'tiga satu per dua' },
          { id: 'b', label: 'tiga puluh satu per dua' },
          { id: 'c', label: 'satu per dua tiga' },
          { id: 'd', label: 'tiga per dua' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Bilangan bulat 3 dibaca dulu, lalu pecahannya "satu per dua". Sehari-hari sering disebut "tiga setengah".',
          b: 'Bilangan bulat 3 dan pembilang 1 bukan satu bilangan "tiga puluh satu".',
          c: 'Bilangan bulat dibaca lebih dulu, bukan di akhir.',
          d: 'Pembilang 1 terlewat. ' + F(3, 2) + ' adalah pecahan yang berbeda.',
        },
      },
      {
        id: 'b5',
        frac: { whole: 4, num: 2, den: 3 },
        opsi: [
          { id: 'a', label: 'empat dua per tiga' },
          { id: 'b', label: 'empat puluh dua per tiga' },
          { id: 'c', label: 'empat tambah dua tiga' },
          { id: 'd', label: 'dua per tiga empat' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! "empat dua per tiga".',
          b: 'Bilangan bulat 4 dan pembilang 2 dibaca terpisah, bukan "empat puluh dua".',
          c: 'Tidak ada kata "tambah" dan kata "per" tidak boleh hilang.',
          d: 'Bilangan bulat dibaca lebih dulu.',
        },
      },
      {
        id: 'b6',
        frac: { whole: 1, num: 3, den: 8 },
        model: 'bar',
        opsi: [
          { id: 'a', label: 'satu tiga per delapan' },
          { id: 'b', label: 'tiga belas per delapan' },
          { id: 'c', label: 'satu per tiga delapan' },
          { id: 'd', label: 'satu tiga delapan' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! "satu tiga per delapan".',
          b: 'Angka 1 dan 3 tidak digabung. 1 adalah bilangan bulat, 3 adalah pembilang.',
          c: '"per" diletakkan di antara pembilang dan penyebut.',
          d: 'Kata "per" tidak boleh dihilangkan.',
        },
      },
    ],
    nextLabel: 'Lanjut: Latihan Menulis →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — LATIHAN TERBIMBING: MENULIS (Fase 3)
     ---------------------------------------------------------- */
  bimbingTulis: {
    kicker: 'Tahap 5 · Latihan Terbimbing: Menulis',
    syntax: DI + ' · Fase 3',
    goal: 'Menuliskan pecahan biasa dan pecahan campuran dari cara baca atau gambar sesuai notasi baku.',
    guru: 'Kerjakan soal pertama bersama-sama sebagai contoh. Soal berikutnya dikerjakan berpasangan; petunjuk berjenjang membantu murid tanpa langsung memberi jawaban. Catat murid yang membuka jawaban untuk dibimbing di tahap berikutnya.',
    instruksi:
      'Isi kotak bersusun seperti menulis di buku: pembilang di atas garis, penyebut di bawah. Kotak "bulat" hanya diisi untuk pecahan campuran — kosongkan bila tidak ada bilangan bulat.',
    revealSetelah: 3,
    soal: [
      {
        id: 't1',
        teks: '"tiga per tujuh"',
        jawab: { whole: null, num: 3, den: 7 },
        hints: [
          'Kata sebelum "per" adalah pembilang, ditulis di atas.',
          'Pembilang 3 di atas garis, penyebut 7 di bawah garis. Kotak bulat dikosongkan.',
        ],
      },
      {
        id: 't2',
        teks: 'Tuliskan pecahan yang ditunjukkan bagian berwarna.',
        model: { num: 5, den: 6, shape: 'bar' },
        jawab: { whole: null, num: 5, den: 6 },
        hints: [
          'Hitung semua kotak pada pita — itulah penyebut.',
          'Ada 6 kotak, 5 di antaranya berwarna.',
        ],
      },
      {
        id: 't3',
        teks: '"satu dua per lima"',
        jawab: { whole: 1, num: 2, den: 5 },
        hints: [
          'Kata pertama ("satu") adalah bilangan bulat — tulis di kotak bulat.',
          'Sisanya "dua per lima": pembilang 2, penyebut 5.',
        ],
      },
      {
        id: 't4',
        teks: 'Tuliskan pecahan campuran yang ditunjukkan gambar pizza.',
        model: { whole: 2, num: 1, den: 3, shape: 'circle' },
        jawab: { whole: 2, num: 1, den: 3 },
        hints: [
          'Berapa pizza yang berwarna penuh? Itulah bilangan bulatnya.',
          'Pizza terakhir dibagi 3 bagian dan hanya 1 yang berwarna.',
        ],
      },
      {
        id: 't5',
        teks: '"enam lima per delapan"',
        jawab: { whole: 6, num: 5, den: 8 },
        hints: [
          'Bilangan bulatnya "enam".',
          'Pecahannya "lima per delapan": 5 di atas, 8 di bawah.',
        ],
      },
    ],
    nextLabel: 'Lanjut: Cek Pemahaman →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGECEK PEMAHAMAN & UMPAN BALIK (Fase 4)
     ---------------------------------------------------------- */
  cekPaham: {
    kicker: 'Tahap 6 · Cek Pemahaman',
    syntax: DI + ' · Fase 4',
    goal: 'Memeriksa pemahaman tentang notasi baku pecahan dan memperoleh umpan balik.',
    guru: 'Murid menjawab mandiri. Pantau skor di layar murid: bila banyak murid di bawah ambang, ulangi demonstrasi singkat (re-teach) memakai kotak ringkasan sebelum lanjut ke latihan mandiri.',
    instruksi:
      'Tentukan apakah setiap pernyataan tepat atau belum tepat. Setiap pernyataan hanya bisa dijawab satu kali, jadi pikirkan baik-baik!',
    opsi: [
      { id: 'tepat', label: '✓ Tepat' },
      { id: 'keliru', label: '✗ Belum tepat' },
    ],
    pernyataan: [
      {
        id: 'p1',
        teks: 'Pecahan ' + F(3, 5) + ' dibaca "tiga per lima".',
        correct: 'tepat',
        explanation: 'Pembilang 3, kata "per", lalu penyebut 5.',
      },
      {
        id: 'p2',
        teks: 'Pada pecahan ' + F(4, 9) + ', angka 9 disebut pembilang.',
        correct: 'keliru',
        explanation: 'Angka di bawah garis pecahan (9) adalah penyebut; 4 adalah pembilang.',
      },
      {
        id: 'p3',
        teks: 'Pecahan campuran "dua satu per empat" boleh ditulis ' + F(21, 4) + '.',
        correct: 'keliru',
        explanation:
          F(21, 4) +
          ' dibaca "dua puluh satu per empat". Tulis bilangan bulat terpisah: ' +
          F(1, 4, 2) +
          '.',
      },
      {
        id: 'p4',
        teks: F(3, 2, 1) + ' adalah penulisan pecahan campuran yang baku.',
        correct: 'keliru',
        explanation:
          'Bagian pecahannya (' +
          F(3, 2) +
          ') lebih dari satu. Pada pecahan campuran baku, pembilang harus lebih kecil dari penyebut.',
      },
      {
        id: 'p5',
        teks: F(2, 3, 5) + ' dibaca "lima dua per tiga".',
        correct: 'tepat',
        explanation: 'Bilangan bulat 5 dibaca dulu, lalu pecahan "dua per tiga".',
      },
      {
        id: 'p6',
        teks: F(7, 8) + ' dibaca "delapan per tujuh".',
        correct: 'keliru',
        explanation: 'Terbalik. Pembilang (7) dibaca dulu: "tujuh per delapan".',
      },
      {
        id: 'p7',
        teks: F(1, 4, 3) + ' artinya 3 bagian utuh dan ' + F(1, 4) + ' bagian.',
        correct: 'tepat',
        explanation:
          'Pecahan campuran = bilangan bulat (bagian utuh) + pecahan biasa yang kurang dari satu.',
      },
      {
        id: 'p8',
        teks: 'Penyebut sebuah pecahan boleh bernilai 0.',
        correct: 'keliru',
        explanation:
          'Tidak mungkin membagi sesuatu menjadi 0 bagian, sehingga penyebut tidak pernah 0.',
      },
    ],
    ambang: 6,
    rangkumanJudul: 'Ringkasan Notasi Baku Pecahan',
    rangkuman: [
      'Pecahan biasa: pembilang di atas garis pecahan, penyebut (bukan 0) di bawahnya.',
      'Cara baca pecahan biasa: pembilang – "per" – penyebut. ' + F(5, 6) + ' → "lima per enam".',
      'Pecahan campuran: bilangan bulat di kiri, lalu pecahan biasa dengan pembilang < penyebut, tanpa tanda +.',
      'Cara baca pecahan campuran: bilangan bulat, lalu pecahannya. ' +
        F(5, 6, 2) +
        ' → "dua lima per enam".',
    ],
    remedial:
      'Skormu belum mencapai target. Baca ringkasan di atas dengan lantang sekali lagi, lalu diskusikan pernyataan yang keliru bersama guru atau temanmu sebelum latihan mandiri.',
    nextLabel: 'Lanjut: Latihan Mandiri →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — LATIHAN MANDIRI (Fase 5)
     ---------------------------------------------------------- */
  mandiri: {
    kicker: 'Tahap 7 · Latihan Mandiri',
    syntax: DI + ' · Fase 5',
    goal: 'Membaca dan menuliskan pecahan biasa dan pecahan campuran secara mandiri dalam konteks sehari-hari.',
    guru: 'Murid bekerja sendiri tanpa bantuan. Soal pilihan ganda hanya dapat dijawab sekali; soal isian dapat dicoba dua kali sebelum jawaban ditampilkan. Skor muncul di tahap Refleksi sebagai bahan asesmen formatif.',
    instruksi:
      'Kerjakan sendiri. Pilihan ganda hanya bisa dijawab sekali. Soal isian boleh dicoba dua kali.',
    maksCoba: 2,
    soal: [
      {
        id: 'm1',
        type: 'choice',
        cerita: 'Resep kue ibu memerlukan ' + F(1, 2, 1) + ' gelas tepung terigu.',
        tanya: 'Bagaimana cara baku membaca takaran tepung itu?',
        opsi: [
          { id: 'a', label: 'satu satu per dua' },
          { id: 'b', label: 'sebelas per dua' },
          { id: 'c', label: 'satu per dua' },
          { id: 'd', label: 'dua satu per satu' },
        ],
        correct: 'a',
        explanation:
          F(1, 2, 1) + ' dibaca "satu satu per dua" (sehari-hari sering disebut "satu setengah").',
      },
      {
        id: 'm2',
        type: 'tulis',
        cerita: 'Setiap pagi Dimas berlari sejauh "dua tiga per empat" kilometer.',
        tanya: 'Tuliskan jarak lari Dimas dengan notasi pecahan yang baku.',
        jawab: { whole: 2, num: 3, den: 4 },
      },
      {
        id: 'm3',
        type: 'choice',
        cerita: 'Ibu memotong kue lapis menjadi 12 potong sama besar. Adik memakan 5 potong.',
        tanya: 'Pecahan yang menunjukkan bagian kue yang dimakan Adik adalah …',
        opsi: [
          { id: 'a', label: F(5, 12) },
          { id: 'b', label: F(12, 5) },
          { id: 'c', label: F(7, 12) },
          { id: 'd', label: F(12, 5, 1) },
        ],
        correct: 'a',
        explanation:
          'Seluruh kue ada 12 potong (penyebut) dan yang dimakan 5 potong (pembilang): ' +
          F(5, 12) +
          '.',
      },
      {
        id: 'm4',
        type: 'tulis',
        cerita: 'Gambar berikut menunjukkan cokelat batang yang dibagikan kepada teman-teman.',
        tanya: 'Tuliskan pecahan campuran yang ditunjukkan bagian berwarna.',
        model: { whole: 3, num: 2, den: 5, shape: 'bar' },
        jawab: { whole: 3, num: 2, den: 5 },
      },
      {
        id: 'm5',
        type: 'choice',
        cerita: 'Di papan pengumuman tertulis: "' + F(9, 10) + ' siswa kelas 7 sudah divaksin."',
        tanya: 'Bagaimana cara baku membaca pecahan itu?',
        opsi: [
          { id: 'a', label: 'sembilan per sepuluh' },
          { id: 'b', label: 'sepuluh per sembilan' },
          { id: 'c', label: 'sembilan puluh' },
          { id: 'd', label: 'sembilan koma sepuluh' },
        ],
        correct: 'a',
        explanation:
          'Pembilang 9 dibaca dulu, lalu "per", lalu penyebut 10: "sembilan per sepuluh".',
      },
      {
        id: 'm6',
        type: 'tulis',
        cerita: 'Rani menggunakan "empat per sembilan" bagian kertas lipat untuk membuat origami.',
        tanya: 'Tuliskan pecahan itu dengan notasi baku.',
        jawab: { whole: null, num: 4, den: 9 },
      },
      {
        id: 'm7',
        type: 'choice',
        cerita: 'Pak Guru mendiktekan: "tiga satu per lima".',
        tanya: 'Penulisan manakah yang baku?',
        opsi: [
          { id: 'a', label: F(1, 5, 3) },
          { id: 'b', label: F(31, 5) },
          { id: 'c', label: '3 + ' + F(1, 5) },
          { id: 'd', label: F(3, 5, 1) },
        ],
        correct: 'a',
        explanation:
          'Bilangan bulat 3 ditulis di kiri, lalu pecahan ' + F(1, 5) + ', tanpa tanda +.',
      },
      {
        id: 'm8',
        type: 'tulis',
        cerita: 'Panjang pita untuk kado adalah "satu lima per enam" meter.',
        tanya: 'Tuliskan panjang pita itu dengan notasi pecahan yang baku.',
        jawab: { whole: 1, num: 5, den: 6 },
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
    goal: 'Merefleksikan cara membaca dan menulis pecahan yang sudah dipelajari.',
    guru: 'Beri waktu hening 3–4 menit. Minta dua atau tiga murid membacakan jawaban pertanyaan pertama. Penilaian diri dapat dipakai untuk menyusun kelompok penguatan pada pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri perbedaan cara membaca ' + '3/4 dan 2 3/4.',
        placeholder: '3/4 dibaca … sedangkan 2 3/4 dibaca …',
      },
      {
        id: 'r2',
        teks: 'Kesalahan penulisan pecahan apa yang paling perlu kamu hindari? Mengapa?',
        placeholder: 'Aku perlu menghindari …',
      },
      {
        id: 'r3',
        teks: 'Di mana kamu akan menjumpai pecahan campuran dalam kehidupanmu minggu ini?',
        placeholder: 'Misalnya saat …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu membaca dan menulis pecahan sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — aku bisa mengajarkannya ke teman' },
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
    judul: 'Kerja bagus, ahli pecahan!',
    teks: 'Kamu sudah berlatih membaca dan menuliskan pecahan biasa dan pecahan campuran sesuai notasi baku.',
    capaian: [
      'Menunjukkan pembilang, penyebut, dan garis pecahan.',
      'Membaca pecahan biasa: pembilang – "per" – penyebut.',
      'Menulis pecahan biasa dari cara baca dan gambar.',
      'Membaca dan menulis pecahan campuran tanpa tanda + dan dengan bagian pecahan kurang dari satu.',
    ],
  },
};
