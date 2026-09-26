'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membaca & Menuliskan Pecahan dalam Kehidupan
   Sehari-hari — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Membaca dan menuliskan bilangan rasional (pecahan) dalam konteks
   kehidupan sehari-hari.

   Notasi baku yang dipakai di seluruh modul (pecahan ditulis sebagai
   objek { num, den, whole, neg } — lihat engine seksi 35):
     • pecahan a/b: a = pembilang (banyak bagian yang diambil,
       diarsir, atau dimaksud), b = penyebut (banyak seluruh bagian
       SAMA BESAR dari satu benda utuh; b ≠ 0); dibaca "a per b";
     • pecahan campuran c a/b: c benda utuh ditambah a/b; bilangan
       bulat ditulis di kiri dan dibaca lebih dulu: 2 1/2 → "dua satu
       per dua";
     • pecahan negatif (keadaan di bawah titik acuan): tanda − di
       depan, dibaca "negatif …": −3/4 → "negatif tiga per empat";
     • "setengah", "seperempat", "tiga perempat" adalah sebutan
       sehari-hari — diterima, tetapi bentuk bakunya selalu "… per …".

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahBagian' & 'olahBaca'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi   (7')  — "Dapur & Pasar Bu Sari": empat potongan
                            kabar (resep bolu, martabak, nota kain,
                            termometer freezer). Murid menduga cara
                            membaca & menulis pecahannya.
     2. Masalah     (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data        (15') — "Lab Potong": delapan situasi bergambar
                            (pizza, cokelat, martabak, gelas ukur, pita,
                            sirup, waduk). Murid menulis pecahannya pada
                            kotak bersusun (diperiksa dengan diagnosa
                            miskonsepsi) lalu memilih cara bacanya;
                            tabel data terisi otomatis dan diamati.
     4a. Pembilang  (12') — pengarsir interaktif: dari kata "lima per
         & Penyebut         delapan" murid membagi pita & mengarsir;
                            memilah frasa sehari-hari ke pembilang /
                            penyebut / bilangan bulat; menguji syarat
                            "sama besar".
     4b. Baca-Tulis (11') — memasangkan notasi ↔ cara baca, menulis
                            notasi dari dikte, dan mengetik cara baca.
     5. Bukti       (10') — menguji pernyataan & membandingkan dengan
                            dugaan awal serta hipotesis.
     6. Simpulan    (7')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap   (10') — delapan soal diambil acak dari bank dua
                            belas soal (isian notasi, isian cara baca,
                            pilihan ganda).
     8. Refleksi    (3')  — refleksi tertulis & penilaian diri.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban benar sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Pilihan cara baca dan
   notasi yang dibuat engine (opsiCaraBacaPecahan, opsiNotasiPecahan)
   diacak dengan cara yang sama.

   Konsistensi kunci jawaban diuji tests/mpi-1.3-data.test.js terhadap
   engine seksi 35 (bacaPecahanKonteks, diagnosaTulisPecahan,
   cekCaraBacaPecahan, …).
   ============================================================ */

var DL = 'Discovery Learning';

/* Pecahan { num, den, whole, neg } — ringkas untuk penulisan data. */
function pq(num, den, whole, neg) {
  return { num: num, den: den, whole: whole || null, neg: !!neg };
}

var DATA = {
  meta: {
    judul: 'Membaca & Menuliskan Pecahan dalam Kehidupan Sehari-hari',
  },

  tahap: [
    { id: 'stimulasi', label: 'Stimulasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'koleksi', label: 'Data' },
    { id: 'olahBagian', label: 'Pembilang' },
    { id: 'olahBaca', label: 'Baca & Tulis' },
    { id: 'verifikasi', label: 'Bukti' },
    { id: 'generalisasi', label: 'Simpulan' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Bukti.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati pecahan dalam kabar sehari-hari dan menyampaikan dugaan cara membaca serta menuliskannya.',
    tp: 'Membaca dan menuliskan bilangan rasional (pecahan) dalam konteks kehidupan sehari-hari.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menentukan pembilang dan penyebut dari benda yang dibagi sama besar.',
      'Menuliskan pecahan biasa, pecahan campuran, dan pecahan negatif dengan benar.',
      'Membaca pecahan dengan kata "per", termasuk pecahan campuran dan pecahan negatif.',
      'Menghubungkan sebutan sehari-hari (setengah, seperempat) dengan bentuk baku pecahannya.',
    ],
    guru: 'Bacakan setiap kabar dengan ekspresif. Minta pasangan murid membaca lantang pecahan yang disorot sebelum menjawab dugaan — dengarkan apakah muncul "tiga empat", "tiga dari empat", "setengah", atau "min". Jangan membenarkan atau menyalahkan dulu; dugaan ini akan diuji murid sendiri di tahap Bukti.',
    judul: 'Dapur & Pasar Bu Sari',
    pengantar:
      'Hari Minggu, Sari membantu ibunya menyiapkan pesanan kue. Di dapur dan di pasar, Sari menemukan empat catatan ini. Semuanya memuat pecahan — tetapi bagaimana cara membacanya?',
    kabar: [
      {
        id: 'resep',
        ikon: '🧁',
        sumber: 'Resep Bolu Pandan',
        teks: 'Masukkan gula pasir sebanyak takaran ini, lalu aduk bersama telur sampai mengembang.',
        pecahan: pq(3, 4),
        satuan: 'gelas',
      },
      {
        id: 'martabak',
        ikon: '🥞',
        sumber: 'Warung Martabak Pak Udin',
        teks: 'Satu loyang martabak dipotong 8 sama besar. Dimas membeli 3 potong. Di nota tertulis bagian yang dibeli Dimas:',
        pecahan: pq(3, 8),
        satuan: 'loyang',
      },
      {
        id: 'kain',
        ikon: '🧵',
        sumber: 'Nota Toko Kain Batik',
        teks: 'Ibu membeli kain batik untuk seragam: dua meter utuh ditambah setengah meter lagi.',
        pecahan: pq(1, 2, 2),
        satuan: 'm',
      },
      {
        id: 'freezer',
        ikon: '❄️',
        sumber: 'Termometer Freezer',
        teks: 'Es batu mulai terbentuk. Termometer menunjukkan suhu setengah derajat di bawah nol.',
        pecahan: pq(1, 2, 0, true),
        satuan: '°C',
      },
    ],
    dugaan: [
      {
        id: 'd1',
        tanya: 'Bagaimana dugaanmu cara membaca takaran gula <strong>3/4 gelas</strong>?',
        opsi: [
          { id: 'a', label: '"tiga per empat gelas"' },
          { id: 'b', label: '"empat per tiga gelas"' },
          { id: 'c', label: '"tiga empat gelas"' },
          { id: 'd', label: '"tiga koma empat gelas"' },
        ],
        baku: 'a',
        pembahasan: '3/4 dibaca "tiga per empat": pembilang dulu, lalu "per", lalu penyebut.',
      },
      {
        id: 'd2',
        tanya:
          'Martabak dipotong <strong>8 sama besar</strong>, Dimas membeli <strong>3 potong</strong>. Bagaimana dugaanmu menuliskan bagian martabak milik Dimas?',
        opsi: [
          { id: 'a', label: '3/8' },
          { id: 'b', label: '8/3' },
          { id: 'c', label: '3/5' },
          { id: 'd', label: '5/8' },
        ],
        baku: 'a',
        pembahasan:
          'Pembilang 3 = potong yang dibeli; penyebut 8 = seluruh potong sama besar. Jadi 3/8, dibaca "tiga per delapan".',
      },
      {
        id: 'd3',
        tanya: 'Bagaimana dugaanmu cara membaca panjang kain <strong>2 1/2 m</strong>?',
        opsi: [
          { id: 'a', label: '"dua satu per dua meter"' },
          { id: 'b', label: '"satu per dua dua meter"' },
          { id: 'c', label: '"dua satu dua meter"' },
          { id: 'd', label: '"dua puluh satu per dua meter"' },
        ],
        baku: 'a',
        pembahasan:
          '2 1/2 adalah pecahan campuran: bilangan bulat dibaca lebih dulu, "dua satu per dua" (sehari-hari: "dua setengah").',
      },
      {
        id: 'd4',
        tanya: 'Bagaimana dugaanmu cara membaca suhu freezer <strong>−1/2 °C</strong>?',
        opsi: [
          { id: 'a', label: '"negatif satu per dua derajat Celsius"' },
          { id: 'b', label: '"minus satu per dua derajat Celsius"' },
          { id: 'c', label: '"satu per dua derajat Celsius"' },
          { id: 'd', label: '"satu per dua negatif derajat Celsius"' },
        ],
        baku: 'a',
        pembahasan:
          'Tanda − di depan pecahan dibaca "negatif" lebih dulu: "negatif satu per dua derajat Celsius".',
      },
    ],
    alasanLabel: 'Mengapa kamu memilih dugaan-dugaan itu? (boleh singkat)',
    alasanPlaceholder: 'Menurutku … karena …',
    catatan:
      'Tidak ada jawaban salah di tahap ini. Simpan dugaanmu — kamu akan mengujinya sendiri di tahap Bukti.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan inti yang akan diselidiki dan menuliskan hipotesis.',
    guru: 'Tanyakan: "Kalau penjual menulis 8/3 padahal maksudnya 3/8, apa yang terjadi?" (pembeli bisa salah bayar, resep gagal). Hipotesis boleh keliru; yang penting murid berani menuliskannya dengan kalimat sendiri.',
    pengantar:
      'Teman-teman Sari membaca catatan itu dengan cara berbeda-beda: ada yang bilang "tiga empat gelas", ada yang bilang "tiga dari empat", ada juga yang menulis 8/3 untuk martabak Dimas. Supaya semua orang paham dengan cara yang sama, kita perlu menyelidiki sesuatu.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'inti',
        label:
          'Bagaimana cara baku menuliskan dan membaca pecahan — termasuk pecahan campuran dan pecahan negatif — yang muncul dalam kehidupan sehari-hari?',
      },
      { id: 'resep', label: 'Berapa gelas gula yang dibutuhkan untuk membuat dua loyang bolu?' },
      { id: 'harga', label: 'Berapa harga satu potong martabak di warung Pak Udin?' },
      { id: 'kain', label: 'Motif batik apa yang paling cocok untuk seragam sekolah?' },
    ],
    correct: 'inti',
    umpan: {
      inti: 'Tepat! Pertanyaan ini bisa kamu jawab sendiri dengan mengumpulkan dan mengolah data pecahan dari berbagai situasi.',
      resep: 'Itu soal menghitung, bukan kebingungan cara membaca "3/4 gelas". Coba pilih lagi.',
      harga:
        'Harga memang penting, tetapi masalah kita adalah cara menulis bagian "3 dari 8 potong". Coba pilih lagi.',
      kain: 'Itu soal selera. Masalah kita adalah cara membaca "2 1/2 m". Coba pilih lagi.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: "Angka di atas garis pecahan menunjukkan …, angka di bawahnya menunjukkan …, dan pecahan dibaca …"',
    hipotesisPlaceholder: 'Angka di atas garis pecahan menunjukkan …',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA: LAB POTONG
     Setiap situasi ditampilkan dengan model visual (buildFractionModel);
     murid menulis pecahan pada kotak bersusun bertanda (selalu dengan
     kotak bilangan bulat & pilihan tanda agar bentuknya tidak
     "dibocorkan"), lalu memilih cara bacanya.
     `model` = besaran `jawab` tanpa tanda — diuji.
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengumpulkan data: menuliskan dan membaca pecahan dari berbagai benda yang dibagi sama besar dalam kehidupan sehari-hari.',
    guru: 'Biarkan murid menghitung sendiri bagian pada gambar. Bila murid menulis 5/8 untuk bagian yang dimakan, tanyakan: "Bagian mana yang ditanyakan — yang dimakan atau yang tersisa?" Bila menulis 3/5, tanyakan: "Semula pizza dibagi menjadi berapa potong?" Kotak "bulat" dikosongkan bila tidak ada benda utuh.',
    instruksi:
      'Periksa delapan situasi di Lab Potong. Pada setiap gambar, hitung ada berapa bagian sama besar seluruhnya dan berapa bagian yang dimaksud. Tulis pecahannya pada kotak bersusun: kotak atas = pembilang, kotak bawah = penyebut, kotak "bulat" hanya diisi bila ada benda utuh, dan pilih tanda − bila keadaannya di bawah titik acuan. Setelah itu, pilih cara membacanya.',
    tanyaBaca: 'Bagaimana cara baku membaca pecahan ini (tanpa satuan)?',
    situasi: [
      {
        id: 'pizza',
        ikon: '🍕',
        tempat: 'Ulang tahun Rara',
        label:
          'Pizza dipotong 8 sama besar. Bagian yang diarsir adalah potongan yang <strong>dimakan</strong> Rara. Tulis pecahan pizza yang dimakan Rara.',
        model: { shape: 'circle', num: 3, den: 8 },
        keterangan: 'arsir = dimakan',
        jawab: pq(3, 8),
        hints: [
          'Hitung dulu seluruh potongan sama besar — itulah penyebut (kotak bawah).',
          'Potongan yang dimakan (diarsir) ada 3 — itulah pembilang (kotak atas).',
        ],
        temuan:
          'Ditulis 3/8: pembilang 3 = potong yang dimakan; penyebut 8 = seluruh potong sama besar.',
      },
      {
        id: 'cokelat',
        ikon: '🍫',
        tempat: 'Kantin sekolah',
        label:
          'Cokelat batang punya 6 kotak sama besar. Bima memakan 1 kotak. Bagian yang diarsir adalah cokelat yang <strong>tersisa</strong>. Tulis pecahan cokelat yang tersisa.',
        model: { shape: 'bar', num: 5, den: 6 },
        keterangan: 'arsir = tersisa',
        jawab: pq(5, 6),
        hints: [
          'Yang ditanyakan bagian yang tersisa, bukan yang dimakan.',
          'Tersisa 5 kotak dari 6 kotak sama besar.',
        ],
        temuan: 'Pembilang mengikuti bagian yang DITANYAKAN — di sini bagian yang tersisa: 5/6.',
      },
      {
        id: 'martabak',
        ikon: '🥞',
        tempat: 'Warung Pak Udin',
        label:
          'Martabak manis dipotong 4 sama besar. Bagian yang diarsir sudah <strong>dibungkus</strong> untuk Nenek. Tulis pecahan martabak untuk Nenek.',
        model: { shape: 'circle', num: 1, den: 4 },
        keterangan: 'arsir = untuk Nenek',
        jawab: pq(1, 4),
        hints: ['Ada berapa potong sama besar seluruhnya? Berapa yang dibungkus?'],
        temuan: '1 dari 4 bagian sama besar ditulis 1/4 — sehari-hari disebut "seperempat".',
      },
      {
        id: 'gelas',
        ikon: '🥛',
        tempat: 'Dapur Bu Sari',
        label:
          'Gelas ukur diberi garis sehingga terbagi 3 bagian sama besar. Susu mengisi bagian yang diarsir. Tulis pecahan gelas yang terisi susu.',
        model: { shape: 'bar', num: 2, den: 3 },
        keterangan: 'arsir = terisi susu',
        jawab: pq(2, 3),
        hints: ['Penyebut = banyak bagian sama besar pada gelas ukur.'],
        temuan: '2 dari 3 bagian sama besar ditulis 2/3, dibaca "dua per tiga".',
      },
      {
        id: 'pita',
        ikon: '🎀',
        tempat: 'Kelas prakarya',
        label:
          'Pita sepanjang 1 meter dibagi 10 bagian sama panjang. Bagian yang diarsir sudah <strong>dipakai</strong> untuk hiasan. Tulis pecahan pita yang dipakai.',
        model: { shape: 'bar', num: 7, den: 10 },
        keterangan: 'arsir = dipakai',
        jawab: pq(7, 10),
        satuan: 'm',
        hints: ['Hitung kotak yang diarsir dan seluruh kotak sama panjang.'],
        temuan: '7 dari 10 bagian sama panjang ditulis 7/10, dibaca "tujuh per sepuluh".',
      },
      {
        id: 'martabakUtuh',
        ikon: '🥞',
        tempat: 'Arisan RT',
        label:
          'Di meja ada martabak yang masih <strong>utuh</strong> dan martabak lain yang dipotong 2 sama besar. Bagian yang diarsir belum dimakan. Tulis banyak martabak yang belum dimakan.',
        model: { shape: 'circle', whole: 1, num: 1, den: 2 },
        keterangan: 'arsir = belum dimakan',
        jawab: pq(1, 2, 1),
        hints: [
          'Ada benda yang masih utuh: tulis banyaknya di kotak "bulat".',
          'Martabak kedua dipotong 2 sama besar dan tinggal 1 potong.',
        ],
        temuan: '1 martabak utuh dan 1/2 martabak ditulis 1 1/2 — pecahan campuran.',
      },
      {
        id: 'sirup',
        ikon: '🧃',
        tempat: 'Toko Kelontong',
        label:
          'Botol sirup yang sama ukurannya: 2 botol masih <strong>penuh</strong>, satu botol lagi (dibagi 4 garis sama besar) terisi sebagian. Tulis banyak sirup dalam botol.',
        model: { shape: 'bar', whole: 2, num: 3, den: 4 },
        keterangan: 'arsir = berisi sirup',
        jawab: pq(3, 4, 2),
        satuan: 'botol',
        hints: [
          'Botol yang penuh ditulis sebagai bilangan bulat.',
          'Botol ketiga: berapa bagian terisi dari 4 bagian sama besar?',
        ],
        temuan: '2 botol penuh dan 3/4 botol ditulis 2 3/4, dibaca "dua tiga per empat".',
      },
      {
        id: 'waduk',
        ikon: '🌊',
        tempat: 'Waduk Jatiluhur',
        label:
          'Batas air normal waduk dianggap <strong>0</strong>. Saat kemarau, permukaan air <strong>turun di bawah</strong> batas normal sejauh bagian yang diarsir dari 1 meter (1 meter dibagi 4 sama besar). Tulis posisi permukaan air (meter).',
        model: { shape: 'bar', num: 3, den: 4 },
        keterangan: 'arsir = jarak turun',
        jawab: pq(3, 4, 0, true),
        satuan: 'm',
        hints: [
          'Hitung dulu besarnya: berapa bagian dari 4 bagian sama besar?',
          'Posisinya di bawah titik acuan 0 — pilih tanda − di depan pecahan.',
        ],
        temuan:
          'Di bawah titik acuan → pecahan negatif: −3/4 m, dibaca "negatif tiga per empat meter".',
      },
    ],
    amati: [
      {
        id: 'a1',
        tanya:
          'Amati tabel. Angka di <strong>bawah</strong> garis pecahan (penyebut) selalu sama dengan …',
        opsi: [
          { id: 'seluruh', label: 'banyak <strong>seluruh</strong> bagian sama besar' },
          { id: 'diambil', label: 'banyak bagian yang diarsir (diambil)' },
          { id: 'sisa', label: 'banyak bagian yang tidak diarsir' },
          { id: 'utuh', label: 'banyak benda yang utuh' },
        ],
        correct: 'seluruh',
        umpan: {
          seluruh:
            'Betul! 8, 6, 4, 3, 10, 2, 4, 4 — semuanya banyak bagian sama besar dari satu benda utuh. Angka ini disebut <strong>penyebut</strong>.',
          diambil: 'Lihat lagi: bagian yang diarsir ada di atas atau di bawah garis?',
          sisa: 'Pada pizza, bagian tidak diarsir ada 5, tetapi penyebutnya 8. Lihat lagi tabelnya.',
          utuh: 'Benda utuh ditulis di kotak "bulat", bukan di bawah garis. Lihat lagi.',
        },
      },
      {
        id: 'a2',
        tanya: 'Angka di <strong>atas</strong> garis pecahan (pembilang) menunjukkan …',
        opsi: [
          {
            id: 'dimaksud',
            label: 'banyak bagian yang <strong>dimaksud</strong> (dimakan, tersisa, dipakai, …)',
          },
          { id: 'seluruh', label: 'banyak seluruh bagian' },
          { id: 'selalu', label: 'selalu bagian yang dimakan' },
          { id: 'kecil', label: 'angka yang paling kecil pada cerita' },
        ],
        correct: 'dimaksud',
        umpan: {
          dimaksud:
            'Tepat! Pada cokelat, yang dimaksud adalah bagian yang tersisa (5), bukan yang dimakan (1). Angka ini disebut <strong>pembilang</strong>.',
          seluruh: 'Banyak seluruh bagian ada di bawah garis. Coba lagi.',
          selalu:
            'Pada cokelat, pembilangnya 5 — bagian yang tersisa. Jadi tidak selalu yang dimakan.',
          kecil: 'Bukan soal besar-kecil. Lihat apa yang diarsir pada setiap gambar.',
        },
      },
      {
        id: 'a3',
        tanya: 'Amati kolom <strong>Dibaca</strong>. Garis pecahan selalu dibaca dengan kata …',
        opsi: [
          { id: 'per', label: '"per"' },
          { id: 'dari', label: '"dari"' },
          { id: 'bagi', label: '"bagi"' },
          { id: 'tidak', label: 'tidak dibaca sama sekali' },
        ],
        correct: 'per',
        umpan: {
          per: 'Betul! 3/8 dibaca "tiga <strong>per</strong> delapan".',
          dari: '"3 dari 8 potong" memang menjelaskan maknanya, tetapi cara baca bakunya berbeda. Lihat lagi kolom Dibaca.',
          bagi: 'Lihat lagi kolom Dibaca: kata apa yang selalu muncul di antara dua bilangan?',
          tidak:
            'Tanpa kata penghubung, "tiga delapan" bisa disangka bilangan 38. Lihat lagi kolom Dibaca.',
        },
      },
      {
        id: 'a4',
        tanya:
          'Pada <strong>1 1/2</strong> dan <strong>2 3/4</strong> (pecahan campuran), bagian mana yang dibaca lebih dulu?',
        opsi: [
          { id: 'bulat', label: 'Bilangan bulatnya (banyak benda utuh)' },
          { id: 'pembilang', label: 'Pembilangnya' },
          { id: 'penyebut', label: 'Penyebutnya' },
          { id: 'bebas', label: 'Boleh bebas, asal semua dibaca' },
        ],
        correct: 'bulat',
        umpan: {
          bulat:
            'Tepat! Bilangan bulat ditulis di kiri, jadi dibaca lebih dulu: "dua tiga per empat".',
          pembilang: 'Lihat kolom Dibaca untuk 2 3/4: kata pertamanya "dua".',
          penyebut: 'Penyebut dibaca paling akhir. Lihat lagi kolom Dibaca.',
          bebas: 'Kalau bebas, "tiga per empat dua" bisa membingungkan. Lihat lagi kolom Dibaca.',
        },
      },
    ],
    nextLabel: 'Lanjut: Olah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — PENGOLAHAN DATA: PEMBILANG & PENYEBUT
     ---------------------------------------------------------- */
  olahBagian: {
    kicker: 'Tahap 4a · Pengolahan Data — Pembilang & Penyebut',
    syntax: DL + ' · Sintaks 4',
    goal: 'Mengolah data untuk menemukan makna pembilang dan penyebut serta syarat bagian sama besar.',
    guru: 'Pada pengarsir, minta murid menyebutkan dulu "dibagi berapa?" sebelum mengetuk. Pada soal syarat sama besar, tunjukkan kertas yang dilipat tidak sama besar sebagai contoh nyata.',
    judulA: 'A. Pengarsir pecahan',
    instruksiA:
      'Dengarkan pecahan yang dibacakan. Atur banyak bagian sama besar dengan tombol − dan +, lalu ketuk bagian-bagian yang perlu diarsir. Tekan "Periksa".',
    arsir: [
      {
        id: 's1',
        kata: 'lima per delapan',
        jawab: pq(5, 8),
        konteks: 'Kue lapis dipotong sama besar; Ayah memakan bagian yang dibacakan.',
      },
      {
        id: 's2',
        kata: 'dua per tiga',
        jawab: pq(2, 3),
        konteks: 'Botol minum dibagi garis sama besar; air mengisi bagian yang dibacakan.',
      },
      {
        id: 's3',
        kata: 'tiga per sepuluh',
        jawab: pq(3, 10),
        konteks:
          'Jalan setapak dibagi sama panjang; bagian yang sudah dicat sebanyak yang dibacakan.',
      },
    ],
    judulB: 'B. Pilah kata dalam cerita',
    instruksiB:
      'Setiap kalimat berasal dari cerita sehari-hari. Tentukan apakah bilangan pada kalimat itu menjadi pembilang, penyebut, atau bilangan bulat pada pecahan.',
    opsiPilah: [
      { id: 'pembilang', label: 'Pembilang (atas)' },
      { id: 'penyebut', label: 'Penyebut (bawah)' },
      { id: 'bulat', label: 'Bilangan bulat (benda utuh)' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: 'Semangka dipotong menjadi 6 bagian sama besar.',
        correct: 'penyebut',
        explanation: '6 = banyak seluruh bagian sama besar → penyebut.',
      },
      {
        id: 'p2',
        teks: 'Rina memakan 2 potong semangka itu.',
        correct: 'pembilang',
        explanation: '2 = banyak bagian yang dimaksud (dimakan) → pembilang: 2/6.',
      },
      {
        id: 'p3',
        teks: 'Ayah membawa pulang 3 bungkus roti yang belum dibuka.',
        correct: 'bulat',
        explanation: '3 bungkus utuh → bilangan bulat pada pecahan campuran.',
      },
      {
        id: 'p4',
        teks: 'Tali dibagi menjadi 10 bagian yang sama panjang.',
        correct: 'penyebut',
        explanation: '10 = banyak seluruh bagian sama panjang → penyebut.',
      },
      {
        id: 'p5',
        teks: '7 bagian tali itu sudah dipakai untuk pramuka.',
        correct: 'pembilang',
        explanation: '7 = banyak bagian yang dipakai → pembilang: 7/10.',
      },
      {
        id: 'p6',
        teks: 'Masih ada 1 loyang bolu yang utuh di lemari.',
        correct: 'bulat',
        explanation: '1 loyang utuh → bilangan bulat.',
      },
    ],
    judulC: 'C. Harus sama besar?',
    syarat: [
      {
        id: 'c1',
        tanya:
          'Roti dipotong menjadi 4 potong, tetapi ukurannya <strong>berbeda-beda</strong>. Dodi mengambil 1 potong. Apakah Dodi pasti mendapat 1/4 roti?',
        opsi: [
          { id: 'tidak', label: 'Belum tentu, karena potongannya tidak sama besar' },
          { id: 'ya', label: 'Ya, karena rotinya dipotong menjadi 4' },
          { id: 'satu', label: 'Ya, karena Dodi mengambil 1 potong' },
          { id: 'delapan', label: 'Tidak, harus dipotong 8 dulu' },
        ],
        correct: 'tidak',
        umpan: {
          tidak:
            'Tepat! Pecahan hanya berlaku bila satu benda utuh dibagi menjadi bagian yang <strong>sama besar</strong>.',
          ya: 'Kalau potongan Dodi paling besar, apakah bagiannya sama dengan potongan terkecil? Coba lagi.',
          satu: 'Satu potong besar dan satu potong kecil tidak sama nilainya. Coba lagi.',
          delapan: 'Banyaknya potongan bukan masalahnya. Coba perhatikan ukuran potongannya.',
        },
      },
      {
        id: 'c2',
        tanya: 'Mengapa penyebut sebuah pecahan tidak boleh <strong>0</strong>?',
        opsi: [
          { id: 'utuh', label: 'Karena satu benda utuh tidak mungkin dibagi menjadi 0 bagian' },
          { id: 'kecil', label: 'Karena 0 terlalu kecil untuk ditulis' },
          { id: 'boleh', label: 'Sebenarnya boleh, asal pembilangnya juga 0' },
          { id: 'atas', label: 'Karena 0 hanya boleh ditulis di atas garis' },
        ],
        correct: 'utuh',
        umpan: {
          utuh: 'Betul! Penyebut = banyak bagian sama besar; benda tidak bisa dibagi menjadi 0 bagian.',
          kecil: 'Bukan soal kecil. Ingat makna penyebut: dibagi menjadi berapa bagian?',
          boleh: 'Coba bayangkan: kue dibagi menjadi 0 bagian — mungkinkah? Coba lagi.',
          atas: 'Pikirkan makna penyebut: dibagi menjadi berapa bagian sama besar?',
        },
      },
    ],
    temuan: [
      'Pecahan menyatakan bagian dari satu benda utuh yang dibagi menjadi bagian-bagian <strong>sama besar</strong>.',
      '<strong>Penyebut</strong> (di bawah garis) = banyak seluruh bagian sama besar, dan tidak boleh 0.',
      '<strong>Pembilang</strong> (di atas garis) = banyak bagian yang dimaksud: dimakan, tersisa, dipakai, diarsir.',
      'Benda yang masih <strong>utuh</strong> ditulis sebagai bilangan bulat di kiri pecahan (pecahan campuran).',
    ],
    nextLabel: 'Lanjut: Baca & Tulis →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — PENGOLAHAN DATA: BACA & TULIS
     Pasangan: 'baca' → opsiCaraBacaPecahan, 'tulis' → opsiNotasiPecahan.
     ---------------------------------------------------------- */
  olahBaca: {
    kicker: 'Tahap 4b · Pengolahan Data — Baca & Tulis',
    syntax: DL + ' · Sintaks 4',
    goal: 'Mengolah data untuk menemukan pola cara membaca dan menuliskan pecahan biasa, campuran, dan negatif.',
    guru: 'Minta pasangan bergantian mendikte dan menulis. Dengarkan apakah murid membaca "per" dan membaca kata "negatif" lebih dulu. Sebutan "setengah" dan "seperempat" boleh, tetapi ajak murid menyebut juga bentuk bakunya.',
    judulA: 'A. Pasangkan notasi dan cara baca',
    instruksiA: 'Pilih pasangan yang tepat untuk setiap pecahan atau cara baca.',
    pasang: [
      { id: 'q1', arah: 'baca', pecahan: pq(5, 12) },
      { id: 'q2', arah: 'tulis', pecahan: pq(4, 9) },
      { id: 'q3', arah: 'baca', pecahan: pq(2, 3, 1) },
      { id: 'q4', arah: 'tulis', pecahan: pq(1, 4, 3) },
      { id: 'q5', arah: 'baca', pecahan: pq(3, 5, 0, true) },
      { id: 'q6', arah: 'tulis', pecahan: pq(7, 8, 0, true) },
    ],
    judulB: 'B. Tulis dari dikte',
    instruksiB:
      'Pasanganmu membacakan pecahan berikut. Tulis pecahannya pada kotak bersusun (isi kotak "bulat" hanya bila perlu, pilih tanda − bila ada kata "negatif").',
    tulisNotasi: [
      {
        id: 'n1',
        jawab: pq(2, 5, 0, true),
        hints: ['Kata "negatif" → pilih tanda −.', '"dua per lima": pembilang 2, penyebut 5.'],
      },
      {
        id: 'n2',
        jawab: pq(1, 4, 3),
        hints: ['Kata pertama "tiga" adalah bilangan bulat — tulis di kotak "bulat".'],
      },
      {
        id: 'n3',
        jawab: pq(7, 10),
        hints: ['Bilangan sebelum "per" ditulis di atas garis.'],
      },
      {
        id: 'n4',
        jawab: pq(1, 2, 1, true),
        hints: [
          'Ada kata "negatif" → tanda −.',
          'Setelah "negatif", ada bilangan bulat "satu", lalu pecahan "satu per dua".',
        ],
      },
    ],
    judulC: 'C. Ketik cara bacanya',
    instruksiC: 'Ketik cara membaca setiap pecahan dengan huruf, tanpa satuan.',
    tulisBacaan: [
      {
        id: 'b1',
        jawab: pq(5, 6),
        hints: ['Baca pembilang, lalu "per", lalu penyebut.'],
      },
      {
        id: 'b2',
        jawab: pq(3, 5, 2),
        hints: ['Baca bilangan bulatnya lebih dulu.'],
      },
      {
        id: 'b3',
        jawab: pq(7, 8, 0, true),
        hints: ['Tanda − di depan dibaca dengan kata apa?'],
      },
      {
        id: 'b4',
        jawab: pq(1, 4),
        hints: ['Boleh sebutan sehari-hari, tetapi coba juga bentuk bakunya: "… per …".'],
      },
    ],
    temuan: [
      'Pecahan <strong>a/b</strong> dibaca "a per b" — pembilang, kata "per", lalu penyebut.',
      'Pecahan campuran dibaca mulai dari bilangan bulatnya: 2 3/5 → "dua tiga per lima".',
      'Pecahan negatif ditulis dengan tanda − di depan dan dibaca "negatif …": −7/8 → "negatif tujuh per delapan".',
      '"Setengah", "seperempat", "tiga perempat" adalah sebutan sehari-hari; bentuk bakunya "satu per dua", "satu per empat", "tiga per empat".',
    ],
    nextLabel: 'Lanjut: Buktikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Membuktikan temuan dengan menguji pernyataan, lalu membandingkannya dengan dugaan awal dan hipotesis.',
    guru: 'Setelah murid memilah, minta setiap pasangan memilih satu pernyataan SALAH dan memperbaikinya dengan lantang. Lalu bahas perbandingan dugaan: apa yang berubah dari pikiran awal mereka?',
    judulA: 'A. Benar atau salah?',
    opsiPernyataan: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'v1',
        teks: '3/5 dibaca "tiga per lima".',
        correct: 'benar',
        explanation: 'Pembilang 3, kata "per", penyebut 5.',
      },
      {
        id: 'v2',
        teks: 'Pada pecahan 3/5, angka 5 menunjukkan banyak bagian yang diambil.',
        correct: 'salah',
        explanation:
          '5 adalah penyebut: banyak seluruh bagian sama besar. Yang diambil 3 (pembilang).',
      },
      {
        id: 'v3',
        teks: 'Roti dipotong 4 dengan ukuran berbeda-beda; satu potongnya pasti bernilai 1/4 roti.',
        correct: 'salah',
        explanation: 'Pecahan menuntut bagian yang sama besar.',
      },
      {
        id: 'v4',
        teks: 'Pecahan campuran 2 1/3 dibaca "dua satu per tiga".',
        correct: 'benar',
        explanation: 'Bilangan bulat dibaca lebih dulu, lalu pecahannya.',
      },
      {
        id: 'v5',
        teks: '−4/7 dibaca "minus empat per tujuh".',
        correct: 'salah',
        explanation: 'Tanda − di depan bilangan dibaca "negatif": "negatif empat per tujuh".',
      },
      {
        id: 'v6',
        teks: 'Penyebut sebuah pecahan tidak boleh 0.',
        correct: 'benar',
        explanation: 'Benda utuh tidak mungkin dibagi menjadi 0 bagian.',
      },
      {
        id: 'v7',
        teks: '"Setengah" adalah sebutan sehari-hari untuk 1/2; cara baca bakunya "satu per dua".',
        correct: 'benar',
        explanation: 'Sebutan sehari-hari boleh dipakai, tetapi bentuk bakunya selalu "… per …".',
      },
      {
        id: 'v8',
        teks: 'Suhu 3/4 derajat di bawah nol ditulis 3/4 °C.',
        correct: 'salah',
        explanation: 'Di bawah nol → negatif: −3/4 °C.',
      },
    ],
    judulB: 'B. Bandingkan dengan dugaan awalmu',
    nextLabel: 'Lanjut: Tarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Merumuskan kesimpulan tentang cara menuliskan dan membaca pecahan dalam kehidupan sehari-hari.',
    guru: 'Setelah kesimpulan lengkap, minta beberapa murid membacakannya dengan kalimat sendiri dan memberi satu contoh pecahan baru dari rumah mereka. Tuliskan rangkuman di papan tulis sebagai catatan bersama.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      {
        id: 'k1',
        awal: 'Pada pecahan a/b, a disebut pembilang dan menunjukkan',
        correct: 'banyakDimaksud',
      },
      { id: 'k2', awal: 'b disebut penyebut dan menunjukkan', correct: 'banyakSeluruh' },
      { id: 'k3', awal: 'Pecahan a/b dibaca', correct: 'bacaPer' },
      {
        id: 'k4',
        awal: 'Pecahan campuran seperti 2 1/2 ditulis dan dibaca dengan',
        correct: 'bulatDulu',
      },
      {
        id: 'k5',
        awal: 'Pecahan −3/4 ditulis dengan tanda − di depan dan dibaca',
        correct: 'bacaNegatif',
      },
      { id: 'k6', awal: 'Sebutan "setengah" dan "seperempat"', correct: 'sehari' },
    ],
    bank: [
      { id: 'banyakDimaksud', teks: 'banyak bagian yang diambil, diarsir, atau dimaksud' },
      {
        id: 'banyakSeluruh',
        teks: 'banyak seluruh bagian sama besar dari satu benda utuh (tidak boleh 0)',
      },
      { id: 'bacaPer', teks: '"a per b" — pembilang dulu, lalu kata "per", lalu penyebut' },
      {
        id: 'bulatDulu',
        teks: 'bilangan bulat di kiri, jadi dibaca lebih dulu: "dua satu per dua"',
      },
      { id: 'bacaNegatif', teks: '"negatif tiga per empat"' },
      {
        id: 'sehari',
        teks: 'adalah sebutan sehari-hari untuk 1/2 dan 1/4; bentuk bakunya "satu per dua" dan "satu per empat"',
      },
      { id: 'banyakSisa', teks: 'selalu banyak bagian yang tersisa' },
      { id: 'bacaDari', teks: '"a b" tanpa kata penghubung, misalnya "tiga empat"' },
      { id: 'bacaMinus', teks: '"minus tiga per empat"' },
    ],
    rangkuman: [
      'Pecahan menyatakan bagian dari satu benda utuh yang dibagi menjadi bagian-bagian <strong>sama besar</strong>.',
      'Pada a/b: <strong>pembilang</strong> a = bagian yang dimaksud, <strong>penyebut</strong> b = seluruh bagian sama besar (b ≠ 0).',
      'a/b dibaca "<strong>a per b</strong>": 3/8 → "tiga per delapan".',
      'Pecahan campuran: bilangan bulat dibaca lebih dulu: 2 3/4 → "dua tiga per empat".',
      'Pecahan negatif (di bawah titik acuan) ditulis dengan tanda − di depan dan dibaca "<strong>negatif</strong> …": −3/4 → "negatif tiga per empat".',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Bank 12 soal; setiap murid mendapat `banyak` soal sesuai
     `komposisi` (dipilih & diurutkan acak). Isian 'tulis' diperiksa
     periksaTeksPecahan, isian 'baca' diperiksa cekCaraBacaPecahan.
     Opsi pilihan ganda diacak (optionOrder).
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan konsep',
    goal: 'Menerapkan cara menuliskan dan membaca pecahan pada situasi sehari-hari yang baru.',
    guru: 'Murid mengerjakan mandiri. Setiap murid mendapat kombinasi soal acak, jadi dorong mereka menjelaskan jawabannya kepada pasangan setelah selesai. Amati murid yang masih menukar pembilang-penyebut atau membaca "minus".',
    instruksi:
      'Kerjakan setiap soal. Pada isian pecahan, ketik dengan garis miring, misalnya 3/4, pecahan campuran 2 1/2 (beri spasi), dan pecahan negatif -3/4. Pada isian cara baca, ketik dengan huruf tanpa satuan.',
    banyak: 8,
    komposisi: { tulis: 3, baca: 2, choice: 3 },
    soal: [
      {
        id: 't1',
        type: 'input',
        mode: 'tulis',
        cerita: 'Kue bolu dipotong 12 sama besar. Setelah acara, di piring tersisa 5 potong.',
        pertanyaan: 'Tuliskan pecahan kue bolu yang tersisa.',
        jawab: pq(5, 12),
        explanation:
          '5 potong tersisa dari 12 potong sama besar: 5/12, dibaca "lima per dua belas".',
        hints: ['Penyebut = seluruh potong sama besar.', 'Pembilang = potong yang tersisa.'],
        reveal: 'Jawaban: <strong>5/12</strong>.',
      },
      {
        id: 't2',
        type: 'input',
        mode: 'tulis',
        cerita: 'Guru mendiktekan sebuah pecahan: "negatif tiga per sepuluh".',
        pertanyaan: 'Tuliskan pecahan itu dengan angka.',
        jawab: pq(3, 10, 0, true),
        explanation: '"Negatif" menjadi tanda − di depan: −3/10.',
        hints: ['"Negatif" → ketik tanda - di depan.', '"tiga per sepuluh" → 3/10.'],
        reveal: 'Jawaban: <strong>−3/10</strong>.',
      },
      {
        id: 't3',
        type: 'input',
        mode: 'tulis',
        cerita:
          'Ibu membeli satu kantong gula 1 kg yang masih utuh, ditambah satu kantong kecil berisi 1 bagian dari 1 kg yang dibagi 4 sama besar.',
        pertanyaan: 'Tuliskan banyak gula (kg) sebagai pecahan campuran.',
        jawab: pq(1, 4, 1),
        explanation: '1 kg utuh dan 1/4 kg ditulis 1 1/4 kg, dibaca "satu satu per empat".',
        hints: ['Tulis bilangan bulat, spasi, lalu pecahannya.'],
        reveal: 'Jawaban: <strong>1 1/4</strong> kg.',
      },
      {
        id: 't4',
        type: 'input',
        mode: 'tulis',
        cerita:
          'Hari Senin ada 8 jam pelajaran yang sama panjang. Sebanyak 3 jam di antaranya adalah Matematika.',
        pertanyaan: 'Tuliskan pecahan jam pelajaran Matematika pada hari Senin.',
        jawab: pq(3, 8),
        explanation: '3 dari 8 jam pelajaran: 3/8, dibaca "tiga per delapan".',
        hints: ['Penyebut = seluruh jam pelajaran; pembilang = jam Matematika.'],
        reveal: 'Jawaban: <strong>3/8</strong>.',
      },
      {
        id: 't5',
        type: 'input',
        mode: 'baca',
        cerita: 'Resep kolak pisang meminta santan sebanyak 2/3 gelas.',
        tampil: pq(2, 3),
        pertanyaan: 'Ketik cara membaca pecahan ini (tanpa satuan).',
        jawab: pq(2, 3),
        explanation: '2/3 dibaca "dua per tiga".',
        hints: ['Pembilang, "per", penyebut.'],
        reveal: 'Jawaban: "<strong>dua per tiga</strong>".',
      },
      {
        id: 't6',
        type: 'input',
        mode: 'baca',
        cerita: 'Pita untuk lomba tujuh belasan panjangnya 3 1/2 meter.',
        tampil: pq(1, 2, 3),
        pertanyaan: 'Ketik cara membaca pecahan ini (tanpa satuan).',
        jawab: pq(1, 2, 3),
        explanation: '3 1/2 dibaca "tiga satu per dua" (sehari-hari: "tiga setengah").',
        hints: ['Bilangan bulat dibaca lebih dulu.'],
        reveal: 'Jawaban: "<strong>tiga satu per dua</strong>".',
      },
      {
        id: 't7',
        type: 'input',
        mode: 'baca',
        cerita: 'Petugas mencatat permukaan air kolam renang turun di bawah batas normal: −1/4 m.',
        tampil: pq(1, 4, 0, true),
        pertanyaan: 'Ketik cara membaca pecahan ini (tanpa satuan).',
        jawab: pq(1, 4, 0, true),
        explanation: '−1/4 dibaca "negatif satu per empat".',
        hints: ['Tanda − di depan dibaca "negatif", lebih dulu.'],
        reveal: 'Jawaban: "<strong>negatif satu per empat</strong>".',
      },
      {
        id: 't8',
        type: 'choice',
        cerita: 'Sebuah semangka dipotong 8 sama besar. Sebanyak 3 potong sudah dimakan.',
        pertanyaan: 'Pecahan semangka yang <strong>belum</strong> dimakan adalah …',
        options: [
          { id: 'a', label: '5/8' },
          { id: 'b', label: '3/8' },
          { id: 'c', label: '8/5' },
          { id: 'd', label: '5/3' },
        ],
        correct: 'a',
        explanation: 'Belum dimakan 8 − 3 = 5 potong dari 8 potong sama besar: 5/8.',
      },
      {
        id: 't9',
        type: 'choice',
        cerita: 'Di papan pengumuman tertulis: "4/9 murid kelas VII ikut ekstrakurikuler pramuka."',
        pertanyaan: 'Cara baku membaca 4/9 adalah …',
        options: [
          { id: 'a', label: 'empat per sembilan' },
          { id: 'b', label: 'sembilan per empat' },
          { id: 'c', label: 'empat sembilan' },
          { id: 'd', label: 'empat dari sembilan' },
        ],
        correct: 'a',
        explanation: '4/9 dibaca "empat per sembilan".',
      },
      {
        id: 't10',
        type: 'choice',
        cerita:
          'Sebuah pizza dipotong menjadi 4 potong yang ukurannya berbeda-beda. Rudi mengambil 1 potong.',
        pertanyaan: 'Pernyataan yang tepat adalah …',
        options: [
          { id: 'a', label: 'Belum tentu 1/4 pizza, karena potongannya tidak sama besar.' },
          { id: 'b', label: 'Rudi pasti mendapat 1/4 pizza.' },
          { id: 'c', label: 'Rudi pasti mendapat 1/3 pizza.' },
          { id: 'd', label: 'Rudi mendapat 4/1 pizza.' },
        ],
        correct: 'a',
        explanation: 'Pecahan hanya berlaku bila bagiannya sama besar.',
      },
      {
        id: 't11',
        type: 'choice',
        cerita: 'Nenek membacakan resep: "satu tiga per empat cangkir tepung terigu".',
        pertanyaan: 'Notasi yang tepat untuk takaran itu adalah …',
        options: [
          { id: 'a', label: '1 3/4 cangkir' },
          { id: 'b', label: '13/4 cangkir' },
          { id: 'c', label: '3/4 1 cangkir' },
          { id: 'd', label: '1/34 cangkir' },
        ],
        correct: 'a',
        explanation: 'Bilangan bulat 1 ditulis di kiri, diberi jarak, lalu 3/4: 1 3/4 cangkir.',
      },
      {
        id: 't12',
        type: 'choice',
        cerita: 'Permukaan air sungai turun 2/5 meter di bawah batas normal (batas normal = 0).',
        pertanyaan: 'Pasangan tulisan dan cara baca manakah yang tepat?',
        options: [
          { id: 'a', label: '−2/5 m, dibaca "negatif dua per lima meter"' },
          { id: 'b', label: '−2/5 m, dibaca "minus dua per lima meter"' },
          { id: 'c', label: '2/5 m, dibaca "dua per lima meter"' },
          { id: 'd', label: '2/5− m, dibaca "dua lima negatif meter"' },
        ],
        correct: 'a',
        explanation:
          'Di bawah batas normal → negatif: −2/5 m, dibaca "negatif dua per lima meter".',
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
    goal: 'Merefleksikan proses menemukan cara menuliskan dan membaca pecahan dalam kehidupan sehari-hari.',
    guru: 'Beri waktu hening 3 menit untuk menulis. Jawaban penilaian diri bisa menjadi dasar pengelompokan pada pertemuan berikutnya (pecahan senilai & membandingkan pecahan).',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Tuliskan satu contoh pecahan yang pernah kamu temui di rumah atau di sekitarmu. Bagaimana menulis dan membacanya?',
        placeholder: 'Contohnya … ditulis … dan dibaca …',
      },
      {
        id: 'r2',
        teks: 'Mengapa bagian-bagian sebuah benda harus sama besar agar bisa dinyatakan dengan pecahan?',
        placeholder: 'Bagian harus sama besar karena …',
      },
      {
        id: 'r3',
        teks: 'Bagian mana yang masih membingungkan atau ingin kamu pelajari lebih lanjut?',
        placeholder: 'Aku masih bingung tentang …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu membaca dan menuliskan pecahan sekarang?',
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
    teks: 'Kamu telah menemukan cara baku menuliskan dan membaca pecahan biasa, pecahan campuran, dan pecahan negatif dalam kehidupan sehari-hari.',
    contoh: [
      { ikon: '🥞', nama: 'Martabak', pecahan: pq(3, 8), satuan: 'loyang' },
      { ikon: '🧵', nama: 'Kain batik', pecahan: pq(1, 2, 2), satuan: 'meter' },
      { ikon: '❄️', nama: 'Suhu freezer', pecahan: pq(1, 2, 0, true), satuan: 'derajat Celsius' },
    ],
    capaian: [
      'Menentukan pembilang (bagian yang dimaksud) dan penyebut (seluruh bagian sama besar) dari situasi sehari-hari.',
      'Menuliskan pecahan biasa, pecahan campuran (bilangan bulat di kiri), dan pecahan negatif (tanda − di depan).',
      'Membaca pecahan dengan kata "per", membaca bilangan bulat pecahan campuran lebih dulu, dan membaca tanda − sebagai "negatif".',
      'Mengenali sebutan sehari-hari (setengah, seperempat) beserta bentuk bakunya.',
    ],
  },
};
