'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: PLDV & SPLDV pada Situasi Kontekstual
   Fase D — SMP Kelas VIII · Topik 16 Sistem Persamaan Linear Dua Variabel

   Tujuan Pembelajaran:
   Mengidentifikasi unsur-unsur dan menentukan pasangan nilai yang
   memenuhi persamaan linear dua variabel serta sistem persamaan linear
   dua variabel pada situasi kontekstual.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'kumpul'
     Sintaks 4 — Data processing ............ tahap 'olah'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi     (7')  — "Koperasi Sekolah": uang belanja Budi
                              Rp24.000 untuk roti & susu, lalu petunjuk
                              kedua "seluruhnya 7 buah". Murid MENDUGA
                              banyak jawaban (tidak dinilai).
     2. Masalah       (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data          (20') — A. kartu unsur: menuliskan variabel,
                              koefisien, dan konstanta tiga PLDV dari
                              cerita (berdiagnosa: tanda, tertukar,
                              konstanta↔koefisien, koefisien 1).
                              B. tabel pasangan: mengisi y untuk setiap x
                              pada 3x + 4y = 24 dan x + y = 7, lalu
                              melihat cek substitusi & kecacahannya.
     4. Olah data     (15') — kedua tabel + bidang koordinat disandingkan;
                              pertanyaan penuntun bertahap; kartu istilah
                              PLDV, unsur, penyelesaian PLDV, SPLDV,
                              penyelesaian SPLDV.
     5. Pembuktian    (15') — Lab SPLDV: menggeser x dan y, melihat
                              substitusi kedua persamaan dan titiknya;
                              membandingkan dugaan awal; memilah delapan
                              kalimat (PLDV / SPLDV / bukan keduanya)
                              berisi jebakan miskonsepsi.
     6. Simpulan      (7')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap     (15') — delapan soal kontekstual: isian unsur,
                              model PLDV dari cerita, pasangan memenuhi
                              PLDV/SPLDV berdiagnosa, isian nilai variabel,
                              jenis sistem, dan makna penyelesaian.
     8. Refleksi      (5')  — refleksi tertulis & penilaian diri.

   Setiap PLDV ditulis { a, b, c, vx?, vy? } = a·vx + b·vy = c (seksi 83
   shared/engine.js). Kunci jawaban (pasangan yang memenuhi, penyelesaian,
   jenis kalimat) dihitung ulang oleh tests/mpi-16.1-data.test.js.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan, sehingga tiap murid
   (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var DL = 'Discovery Learning';

/* Persamaan yang dipakai berulang (harga dalam ribuan rupiah). */
var PERS_ROTI = { a: 3, b: 4, c: 24 };
var PERS_BARANG = { a: 1, b: 1, c: 7 };
var PERS_PARKIR = [
  { a: 1, b: 1, c: 10 },
  { a: 2, b: 4, c: 28 },
];

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; dibandingkan pada tahap Pembuktian.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati teka-teki belanja di Koperasi Sekolah lalu menduga banyak jawabannya.',
    tp: 'Mengidentifikasi unsur-unsur dan menentukan pasangan nilai yang memenuhi persamaan linear dua variabel serta sistem persamaan linear dua variabel pada situasi kontekstual.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menuliskan situasi sehari-hari sebagai persamaan linear dua variabel (PLDV).',
      'Menunjukkan variabel, koefisien, dan konstanta pada sebuah PLDV.',
      'Menentukan pasangan nilai yang memenuhi PLDV dengan substitusi, dan menjelaskan bahwa pasangannya bisa lebih dari satu.',
      'Menentukan pasangan nilai yang memenuhi kedua persamaan sebuah SPLDV sekaligus dan memaknainya dalam situasi.',
    ],
    guru: 'Bacakan petunjuk pertama saja dulu. Tanyakan: "Berapa roti dan berapa susu yang dibeli Budi?" Tampung semua jawaban di papan. Baru setelah itu buka petunjuk kedua.',
    judul: 'Teka-teki Koperasi Sekolah',
    cerita:
      'Budi berbelanja di Koperasi Sekolah. Ia hanya membeli roti dan susu kotak, lalu menghabiskan seluruh uangnya. Ia memberi dua petunjuk:',
    kartu: [
      {
        ikon: '🥐',
        judul: 'Petunjuk 1',
        teks: 'Roti Rp3.000 per buah, susu Rp4.000 per kotak. Uangku Rp24.000 habis tepat.',
      },
      {
        ikon: '🧃',
        judul: 'Petunjuk 2',
        teks: 'Roti dan susu yang kubeli seluruhnya ada 7 buah.',
      },
    ],
    pertanyaan: 'Dugaanmu: berapa banyak jawaban (banyak roti, banyak susu) yang mungkin?',
    opsi: [
      {
        id: 'banyak',
        label:
          'Dari petunjuk 1 saja ada beberapa kemungkinan; setelah ditambah petunjuk 2 hanya tersisa satu jawaban.',
      },
      {
        id: 'satu',
        label: 'Petunjuk 1 saja sudah cukup; jawabannya pasti hanya satu.',
      },
      {
        id: 'tidakAda',
        label: 'Tidak ada jawaban, karena ada dua hal yang belum diketahui.',
      },
      {
        id: 'bebas',
        label: 'Jawabannya bebas — berapa pun banyak roti dan susunya pasti cocok.',
      },
    ],
    alasanLabel: 'Mengapa kamu menduga begitu?',
    alasanPlaceholder: 'Contoh: kalau Budi membeli 4 roti, maka uangnya tinggal …',
    catatan:
      'Belum ada jawaban benar atau salah di sini. Simpan dugaanmu — nanti kamu sendiri yang akan membuktikannya.',
    nextLabel: 'Simpan Dugaan & Lanjut →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan inti tentang cara menuliskan dan mencari pasangan nilai dua besaran yang belum diketahui.',
    guru: 'Arahkan agar pertanyaannya umum: berlaku untuk situasi apa pun dengan dua besaran yang belum diketahui, bukan hanya roti dan susu. Tulis beberapa hipotesis di papan untuk diuji nanti.',
    pengantar:
      'Teka-teki Budi memuat DUA besaran yang belum diketahui sekaligus: banyak roti dan banyak susu. Situasi seperti ini sering muncul — tiket dewasa dan anak, motor dan mobil di parkiran, kambing dan ayam di kandang.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'inti',
        label:
          'Bagaimana menuliskan situasi dengan dua besaran yang belum diketahui sebagai persamaan, lalu menemukan pasangan nilai yang memenuhinya?',
      },
      { id: 'harga', label: 'Mengapa harga susu lebih mahal daripada harga roti?' },
      { id: 'total', label: 'Berapa total uang yang dibelanjakan semua murid di koperasi?' },
      { id: 'enak', label: 'Roti rasa apa yang paling disukai murid?' },
    ],
    correct: 'inti',
    umpan: {
      inti: '<strong>Tepat.</strong> Pertanyaan ini berlaku untuk banyak situasi: menuliskan persamaannya, lalu mencari pasangan nilai yang membuatnya benar.',
      harga:
        'Harga sudah diketahui dari petunjuk. Yang belum diketahui adalah banyak roti dan susunya. Coba lagi.',
      total:
        'Total belanja Budi sudah diketahui (Rp24.000). Pertanyaan ini tidak membantu menemukan banyak roti dan susu. Coba lagi.',
      enak: 'Pertanyaan ini tidak bisa dijawab dengan matematika dari data yang ada. Coba lagi.',
    },
    hipotesisLabel: 'Tulis hipotesismu: bagaimana kira-kira cara menemukan banyak roti dan susu?',
    hipotesisPlaceholder: 'Contoh: mungkin dengan mencoba-coba banyak roti, lalu menghitung …',
    nextLabel: 'Mulai Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA
     A. kartu unsur (berurutan). B. tabel pasangan (berurutan).
     ---------------------------------------------------------- */
  kumpul: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Menuliskan unsur-unsur PLDV dari cerita dan mengumpulkan pasangan nilai yang memenuhinya.',
    guru: 'Minta pasangan murid membaca persamaan dengan suara keras: "tiga kali banyak roti ditambah empat kali banyak susu sama dengan dua puluh empat." Saat mengisi tabel, tanyakan: "Kalau x = 2, apakah y-nya masuk akal untuk banyak susu?"',
    judulA: 'A. Kenali unsur-unsurnya',
    instruksiA:
      'Setiap petunjuk dapat ditulis sebagai persamaan. Tulis variabelnya (hurufnya saja), koefisien setiap variabel, dan konstantanya. Tanda minus ikut ditulis.',
    unsur: [
      {
        id: 'u1',
        judul: 'Petunjuk 1 — uang belanja',
        cerita:
          'Misalkan x = banyak roti dan y = banyak susu. Dalam ribuan rupiah: 3 × banyak roti + 4 × banyak susu = 24.',
        pers: PERS_ROTI,
        temuan:
          'Variabelnya x dan y, koefisien x adalah 3 (harga roti), koefisien y adalah 4 (harga susu), dan konstantanya 24 (uang Budi).',
        hints: [
          'Variabel adalah huruf yang mewakili nilai yang belum diketahui.',
          'Koefisien adalah bilangan yang menempel di depan variabel; konstanta adalah bilangan tanpa variabel.',
        ],
      },
      {
        id: 'u2',
        judul: 'Petunjuk 2 — banyak barang',
        cerita: 'Banyak roti ditambah banyak susu seluruhnya 7 buah.',
        pers: PERS_BARANG,
        temuan:
          'Pada x + y = 7, koefisien x dan y sama-sama 1 — angka 1 biasanya tidak ditulis, tetapi tetap ada.',
        hints: [
          'Tidak ada angka di depan x? Ingat: x sama dengan 1 × x.',
          'Konstantanya adalah bilangan di ruas kanan.',
        ],
      },
      {
        id: 'u3',
        judul: 'Stan alat tulis',
        cerita:
          'Banyak pensil (p) dikurangi banyak pulpen (q) di etalase sama dengan 2, karena pensilnya 2 lebih banyak.',
        pers: { a: 1, b: -1, c: 2, vx: 'p', vy: 'q' },
        temuan:
          'Variabelnya p dan q. Koefisien q adalah −1, karena tanda minus di depan q ikut menjadi bagian koefisiennya.',
        hints: [
          'Variabelnya kali ini bukan x dan y. Huruf apa yang dipakai?',
          'Suku −q sama dengan (−1) × q. Tanda minus ikut menjadi bagian koefisien.',
        ],
      },
    ],
    judulB: 'B. Kumpulkan pasangan nilainya',
    instruksiB:
      'Untuk setiap banyak roti (x), cari banyak susu (y) yang membuat persamaannya benar. Boleh bilangan desimal (pakai koma), mis. 4,5.',
    tabel: [
      {
        id: 't1',
        judul: 'Petunjuk 1: 3x + 4y = 24',
        pers: PERS_ROTI,
        xs: [0, 2, 4, 6, 8],
        labelX: 'Roti',
        labelY: 'Susu',
        temuan:
          'Ada banyak pasangan yang memenuhi 3x + 4y = 24. Tetapi hanya (0, 6), (4, 3), dan (8, 0) yang masuk akal sebagai banyak roti dan susu — banyak benda harus bilangan cacah.',
        hints: [
          'Ganti x dengan nilainya. Contoh x = 4: 3 × 4 + 4y = 24, jadi 12 + 4y = 24.',
          'Dari 12 + 4y = 24 diperoleh 4y = 12. Jangan lupa membagi dengan 4.',
        ],
      },
      {
        id: 't2',
        judul: 'Petunjuk 2: x + y = 7',
        pers: PERS_BARANG,
        xs: [0, 1, 2, 3, 4, 5, 6, 7],
        labelX: 'Roti',
        labelY: 'Susu',
        temuan:
          'Petunjuk 2 juga punya banyak pasangan: (0, 7), (1, 6), (2, 5), … sampai (7, 0). Satu petunjuk saja belum cukup untuk memastikan jawabannya.',
        hints: ['Pasangan mana yang jumlahnya 7?', 'Contoh x = 3: 3 + y = 7, jadi y = 4.'],
      },
    ],
    nextLabel: 'Olah Datanya →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — OLAH DATA
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 4 · Pengolahan Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Membandingkan pasangan nilai kedua petunjuk untuk menemukan arti penyelesaian PLDV dan SPLDV.',
    guru: 'Minta murid menunjuk pasangan yang muncul di kedua tabel lebih dulu, lalu mencari titiknya di bidang koordinat. Tanyakan: "Apa artinya dua garis berpotongan di titik itu?"',
    instruksi:
      'Bandingkan kedua tabel dan titik-titiknya pada bidang koordinat. Titik bulat ● untuk petunjuk 1, titik kotak ■ untuk petunjuk 2.',
    sorot: { x: 4, y: 3 },
    pertanyaan: [
      {
        id: 'banyak',
        tanya: 'Berapa banyak pasangan (x, y) yang memenuhi 3x + 4y = 24?',
        opsi: [
          {
            id: 'benar',
            label:
              'Lebih dari satu — semua titik pada garisnya; untuk banyak benda ada tiga: (0, 6), (4, 3), (8, 0)',
          },
          { id: 'satu', label: 'Hanya satu, yaitu (4, 3)' },
          { id: 'nol', label: 'Tidak ada, karena ada dua variabel' },
          { id: 'dua', label: 'Tepat dua, yaitu (0, 6) dan (8, 0)' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Sebuah PLDV punya <strong>banyak</strong> pasangan penyelesaian. Konteks cerita (banyak benda) membatasinya menjadi bilangan cacah.',
          satu: '(4, 3) memang memenuhi, tetapi lihat tabelmu: (0, 6) dan (8, 0) juga membuat 3x + 4y = 24 benar. Coba lagi.',
          nol: 'Justru ada pasangan yang memenuhi — kamu sudah menemukannya di tabel. Coba lagi.',
          dua: 'Masih ada pasangan lain di tabelmu yang juga memenuhi. Periksa baris x = 4. Coba lagi.',
        },
      },
      {
        id: 'sama',
        tanya: 'Pasangan (x, y) mana yang muncul di KEDUA tabel?',
        opsi: [
          { id: 'benar', label: '(4, 3)' },
          { id: 'tukar', label: '(3, 4)' },
          { id: 'awal', label: '(0, 6)' },
          { id: 'akhir', label: '(7, 0)' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> (4, 3) memenuhi 3x + 4y = 24 <em>dan</em> x + y = 7. Pada bidang koordinat, kedua garis berpotongan di titik ini.',
          tukar:
            '(3, 4) ada di tabel petunjuk 2, tetapi 3 × 3 + 4 × 4 = 25, bukan 24. Perhatikan urutan pasangan (x, y). Coba lagi.',
          awal: '(0, 6) memenuhi petunjuk 1, tetapi 0 + 6 = 6, bukan 7. Coba lagi.',
          akhir: '(7, 0) memenuhi petunjuk 2, tetapi 3 × 7 + 4 × 0 = 21, bukan 24. Coba lagi.',
        },
      },
      {
        id: 'arti',
        tanya: 'Apa arti pasangan (4, 3) dalam cerita Budi?',
        opsi: [
          { id: 'benar', label: 'Budi membeli 4 roti dan 3 kotak susu' },
          { id: 'tukar', label: 'Budi membeli 3 roti dan 4 kotak susu' },
          { id: 'harga', label: 'Harga roti Rp4.000 dan harga susu Rp3.000' },
          { id: 'jumlah', label: 'Budi membelanjakan 4 + 3 = 7 ribu rupiah' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> x = banyak roti = 4 dan y = banyak susu = 3. Cek: 4 × Rp3.000 + 3 × Rp4.000 = Rp24.000, dan 4 + 3 = 7 buah.',
          tukar:
            'Nilai pertama pasangan adalah x (banyak roti), nilai kedua adalah y (banyak susu). Coba lagi.',
          harga:
            'Harga sudah diketahui sejak awal (koefisien). Variabel x dan y menyatakan banyak barang. Coba lagi.',
          jumlah: 'Budi membelanjakan Rp24.000. 7 adalah banyak barangnya. Coba lagi.',
        },
      },
      {
        id: 'pecah',
        tanya:
          'Pada 3x + 4y = 24, untuk x = 2 diperoleh y = 4,5. Mengapa pasangan (2; 4,5) tidak dipakai dalam cerita?',
        opsi: [
          {
            id: 'benar',
            label: 'Pasangan itu memenuhi persamaan, tetapi banyak susu tidak mungkin 4,5 kotak',
          },
          { id: 'salah', label: 'Karena pasangan itu tidak memenuhi 3x + 4y = 24' },
          { id: 'kecil', label: 'Karena 2 roti terlalu sedikit untuk Budi' },
          { id: 'besar', label: 'Karena y tidak boleh lebih besar daripada x' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> 3 × 2 + 4 × 4,5 = 24, jadi secara matematika memenuhi. Namun konteks cerita mengharuskan banyak benda berupa bilangan cacah.',
          salah: 'Coba substitusikan: 3 × 2 + 4 × 4,5 = 6 + 18 = 24. Ternyata memenuhi! Coba lagi.',
          kecil:
            'Tidak ada aturan tentang sedikit atau banyaknya roti. Perhatikan nilai y-nya. Coba lagi.',
          besar: 'Pada (0, 6) pun y lebih besar dari x, dan itu masuk akal. Coba lagi.',
        },
      },
    ],
    istilah: [
      {
        label: 'PLDV',
        teks: 'Persamaan linear dua variabel: ax + by = c, dengan dua variabel berpangkat satu, a dan b tidak nol.',
      },
      {
        label: 'Unsur PLDV',
        teks: 'Variabel (x, y), koefisien (a, b — bilangan di depan variabel, termasuk tandanya), dan konstanta (c).',
      },
      {
        label: 'Penyelesaian PLDV',
        teks: 'Pasangan berurutan (x, y) yang membuat persamaan benar saat disubstitusi. Banyaknya lebih dari satu.',
      },
      {
        label: 'SPLDV',
        teks: 'Sistem persamaan linear dua variabel: dua PLDV dengan variabel yang sama, berlaku bersamaan.',
      },
      {
        label: 'Penyelesaian SPLDV',
        teks: 'Pasangan (x, y) yang memenuhi KEDUA persamaan sekaligus — titik potong kedua garisnya.',
      },
    ],
    nextLabel: 'Buktikan Temuanmu →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji temuan bahwa penyelesaian SPLDV adalah pasangan yang memenuhi kedua persamaan sekaligus.',
    guru: 'Minta murid memprediksi dulu sebelum menekan tombol: "Kalau x ditambah 1, apakah persamaan 2 masih benar?" Pada sistem parkir, biarkan murid mencari sendiri tanpa tabel.',
    judulA: 'A. Lab SPLDV',
    instruksiA:
      'Geser nilai x dan y, lalu amati hasil substitusi kedua persamaan dan letak titiknya. Selesaikan keempat misi berikut.',
    lab: {
      maks: 10,
      sistem: [
        {
          id: 'roti',
          judul: '🥐 Roti & susu',
          cerita: 'x = banyak roti, y = banyak susu (harga dalam ribuan rupiah).',
          labelX: 'roti',
          labelY: 'susu',
          pers: [PERS_ROTI, PERS_BARANG],
        },
        {
          id: 'parkir',
          judul: '🛵 Parkir motor & mobil',
          cerita:
            'Di parkiran sekolah ada 10 kendaraan: motor (x) beroda 2 dan mobil (y) beroda 4. Seluruh rodanya 28.',
          labelX: 'motor',
          labelY: 'mobil',
          pers: PERS_PARKIR,
        },
      ],
    },
    misi: [
      { id: 'satu', teks: 'Roti & susu: temukan pasangan yang HANYA memenuhi persamaan 1.' },
      { id: 'dua', teks: 'Roti & susu: temukan pasangan yang HANYA memenuhi persamaan 2.' },
      { id: 'keduanya', teks: 'Roti & susu: temukan pasangan yang memenuhi KEDUA persamaan.' },
      { id: 'parkir', teks: 'Parkir: temukan banyak motor dan mobil yang memenuhi keduanya.' },
    ],
    kesimpulan:
      '<strong>Terbukti.</strong> Setiap persamaan dipenuhi banyak pasangan (semua titik pada garisnya), tetapi hanya satu pasangan yang memenuhi keduanya: titik potong kedua garis. Untuk parkir: 6 motor dan 4 mobil, karena 6 + 4 = 10 dan 2 × 6 + 4 × 4 = 28.',
    dugaanBenar: 'banyak',
    judulB: 'B. Bandingkan dengan dugaan awalmu',
    judulC: 'C. Pilah: PLDV, SPLDV, atau bukan keduanya?',
    instruksiC:
      'Perhatikan banyak variabel, pangkatnya, tanda relasinya, dan banyak persamaannya. Hati-hati dengan jebakan!',
    opsiPilah: [
      { id: 'pldv', label: 'PLDV' },
      { id: 'spldv', label: 'SPLDV' },
      { id: 'bukan', label: 'Bukan keduanya' },
    ],
    pilah: [
      {
        id: 'buah',
        teks: 'Banyak apel (a) dan jeruk (b) di keranjang seluruhnya 12: <strong>a + b = 12</strong>',
        kalimat: ['a + b = 12'],
        correct: 'pldv',
        explanation:
          'Satu persamaan, dua variabel (a dan b), masing-masing berpangkat satu — PLDV. Hurufnya tidak harus x dan y.',
      },
      {
        id: 'plsv',
        teks: 'Harga 3 buku ditambah Rp2.000 adalah Rp11.000: <strong>3x + 2 = 11</strong>',
        kalimat: ['3x + 2 = 11'],
        correct: 'bukan',
        explanation: 'Hanya ada satu variabel (x). Ini persamaan linear SATU variabel (PLSV).',
      },
      {
        id: 'tiket',
        teks: '10 tiket terjual, tiket dewasa Rp4.000 dan anak Rp2.000, total Rp28.000: <strong>x + y = 10</strong> dan <strong>4x + 2y = 28</strong>',
        kalimat: ['x + y = 10', '4x + 2y = 28'],
        correct: 'spldv',
        explanation: 'Dua PLDV dengan variabel yang sama (x dan y) yang berlaku bersamaan — SPLDV.',
      },
      {
        id: 'kuadrat',
        teks: 'Luas persegi bersisi x ditambah panjang tali y adalah 5: <strong>x² + y = 5</strong>',
        kalimat: ['x² + y = 5'],
        correct: 'bukan',
        explanation:
          'Variabel x berpangkat dua, sehingga persamaannya tidak linear. Pada PLDV setiap variabel berpangkat satu.',
      },
      {
        id: 'tidakSama',
        teks: 'Uang Sari untuk 2 pensil dan 3 penghapus paling banyak Rp12.000: <strong>2x + 3y ≤ 12</strong>',
        kalimat: ['2x + 3y ≤ 12'],
        correct: 'bukan',
        explanation:
          'Relasinya "≤", bukan "=". Ini pertidaksamaan, bukan persamaan — walaupun ada dua variabel.',
      },
      {
        id: 'luas',
        teks: 'Luas kebun berukuran p × q meter adalah 24 m²: <strong>pq = 24</strong>',
        kalimat: ['pq = 24'],
        correct: 'bukan',
        explanation:
          'pq berarti p dikali q — perkalian dua variabel membuat persamaannya tidak linear.',
      },
      {
        id: 'umur',
        teks: 'Jumlah umur kakak (m) dan adik (n) 9 tahun, selisihnya 3 tahun: <strong>m + n = 9</strong> dan <strong>m − n = 3</strong>',
        kalimat: ['m + n = 9', 'm − n = 3'],
        correct: 'spldv',
        explanation:
          'Dua PLDV bervariabel sama (m dan n). Tanda minus tidak mengubah jenisnya — tetap SPLDV.',
      },
      {
        id: 'beda',
        teks: 'Di kelas A: x + y = 30. Di kelas B: p + q = 28.',
        kalimat: ['x + y = 30', 'p + q = 28'],
        correct: 'bukan',
        explanation:
          'Masing-masing memang PLDV, tetapi variabelnya berbeda dan tidak saling terkait, sehingga bukan satu sistem (SPLDV).',
      },
    ],
    nextLabel: 'Susun Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Merumuskan unsur PLDV serta arti penyelesaian PLDV dan SPLDV dengan kata-kata sendiri.',
    guru: 'Minta beberapa pasangan membacakan kesimpulannya. Bandingkan dengan hipotesis di papan dari Tahap 2.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari bank kalimat. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'PLDV ax + by = c memuat', correct: 'b1' },
      {
        id: 'k2',
        awal: 'Pada PLDV, a dan b disebut koefisien, sedangkan c disebut',
        correct: 'b2',
      },
      { id: 'k3', awal: 'Sebuah pasangan (x, y) memenuhi PLDV jika', correct: 'b3' },
      { id: 'k4', awal: 'Sebuah PLDV mempunyai', correct: 'b4' },
      { id: 'k5', awal: 'Penyelesaian SPLDV adalah pasangan (x, y) yang', correct: 'b5' },
    ],
    bank: [
      { id: 'b1', teks: 'dua variabel yang masing-masing berpangkat satu dan tanda "=".' },
      { id: 'b2', teks: 'konstanta, yaitu bilangan tanpa variabel.' },
      { id: 'b3', teks: 'substitusinya membuat ruas kiri sama dengan ruas kanan.' },
      { id: 'b4', teks: 'banyak pasangan penyelesaian, bukan hanya satu.' },
      { id: 'b5', teks: 'memenuhi kedua persamaan sekaligus (titik potong kedua garis).' },
      { id: 'x1', teks: 'dua variabel yang boleh berpangkat dua.' },
      { id: 'x2', teks: 'variabel, yaitu huruf di depan bilangan.' },
      { id: 'x3', teks: 'hanya satu pasangan penyelesaian.' },
      { id: 'x4', teks: 'memenuhi salah satu persamaannya saja.' },
    ],
    rangkuman: [
      'PLDV berbentuk ax + by = c: x dan y variabel, a dan b koefisien (termasuk tandanya), c konstanta.',
      'Pasangan berurutan (x, y) memenuhi PLDV bila substitusinya membuat kedua ruas sama. Sebuah PLDV punya banyak pasangan penyelesaian.',
      'SPLDV terdiri atas dua PLDV bervariabel sama. Penyelesaiannya adalah pasangan yang memenuhi kedua persamaan sekaligus.',
      'Dalam situasi nyata, penyelesaian harus masuk akal, mis. banyak benda berupa bilangan cacah.',
    ],
    nextLabel: 'Terapkan Konsepnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     tipe 'isi'      : isian bilangan; kunci & diagnosa dari cek (seksi 83).
     tipe 'pilih'    : pilihan ganda berpengecoh (opsi diacak app.js).
     tipe 'pasangan' : pilih pasangan (x, y) yang memenuhi `pers` atau
                       `sistem`; kunci & umpan dari diagnosaPasangan*.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan konsep',
    goal: 'Mengidentifikasi unsur dan menentukan pasangan nilai yang memenuhi PLDV dan SPLDV pada situasi kontekstual.',
    guru: 'Biarkan murid mengerjakan mandiri. Catat pesan diagnosa yang sering muncul (mis. "urutan pasangan tertukar" atau "hanya memenuhi satu persamaan") untuk dibahas bersama di akhir.',
    instruksi:
      'Kerjakan setiap soal. Ada soal isian, pilihan ganda, dan memilih pasangan nilai. Gunakan tombol nomor untuk berpindah soal.',
    soal: [
      {
        id: 's1',
        tipe: 'isi',
        cerita:
          'Harga 2 buku tulis dan 3 pensil adalah Rp19.000. Dalam ribuan rupiah ditulis 2b + 3p = 19.',
        tanya: 'Berapa koefisien p?',
        cek: { pers: { a: 2, b: 3, c: 19, vx: 'b', vy: 'p' }, minta: 'koefY' },
        hints: ['Koefisien p adalah bilangan yang menempel tepat di depan huruf p.'],
        pembahasan:
          'Pada 2b + 3p = 19, koefisien b adalah 2, koefisien p adalah 3, dan konstantanya 19.',
      },
      {
        id: 's2',
        tipe: 'pilih',
        cerita:
          'Tiket museum: dewasa Rp10.000 dan anak Rp6.000. Sebuah keluarga membayar Rp52.000. Misalkan d = banyak tiket dewasa dan a = banyak tiket anak.',
        tanya: 'Persamaan mana yang tepat (dalam ribuan rupiah)?',
        opsi: [
          { id: 'benar', label: '10d + 6a = 52' },
          { id: 'tukar', label: '6d + 10a = 52' },
          { id: 'jumlah', label: 'd + a = 52' },
          { id: 'gabung', label: '16da = 52' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Harga setiap tiket dikalikan banyak tiketnya, lalu dijumlahkan.',
          tukar:
            'Harga Rp10.000 milik tiket dewasa (d), jadi 10 harus menjadi koefisien d, bukan a.',
          jumlah:
            '52 adalah total uang (ribuan rupiah), bukan banyak tiket. Harga tiket belum dipakai.',
          gabung:
            'Harga dewasa dan anak tidak boleh dijumlahkan lalu dikalikan banyak tiket; setiap jenis tiket dihitung sendiri-sendiri.',
        },
        hints: ['Uang untuk tiket dewasa = 10 × d. Uang untuk tiket anak = …'],
        pembahasan:
          'Uang tiket dewasa 10d, uang tiket anak 6a, jumlahnya 52: 10d + 6a = 52. Variabelnya d dan a, koefisiennya 10 dan 6, konstantanya 52.',
      },
      {
        id: 's3',
        tipe: 'pasangan',
        cerita: 'Masih tentang tiket museum: 10d + 6a = 52.',
        tanya: 'Pasangan (d, a) mana yang memenuhi persamaan tersebut?',
        pers: { a: 10, b: 6, c: 52, vx: 'd', vy: 'a' },
        opsi: [
          { id: 'p42', x: 4, y: 2 },
          { id: 'p24', x: 2, y: 4 },
          { id: 'p33', x: 3, y: 3 },
          { id: 'p51', x: 5, y: 1 },
        ],
        hints: [
          'Substitusikan setiap pasangan: nilai pertama untuk d, nilai kedua untuk a.',
          'Contoh (3, 3): 10 × 3 + 6 × 3 = 30 + 18 = 48. Belum 52.',
        ],
        pembahasan:
          '10 × 4 + 6 × 2 = 40 + 12 = 52, jadi (4, 2) memenuhi: 4 tiket dewasa dan 2 tiket anak.',
      },
      {
        id: 's4',
        tipe: 'isi',
        cerita:
          'Di kandang Pak Rahmat ada kambing (k) dan ayam (a). Seluruh kakinya 30, sehingga 4k + 2a = 30.',
        tanya: 'Jika ada 5 kambing, berapa banyak ayamnya?',
        cek: { pers: { a: 4, b: 2, c: 30, vx: 'k', vy: 'a' }, minta: 'y', x: 5 },
        hints: [
          'Ganti k dengan 5: 4 × 5 + 2a = 30.',
          'Dari 20 + 2a = 30 diperoleh 2a = 10. Lalu bagi dengan 2.',
        ],
        pembahasan:
          '4 × 5 + 2a = 30 → 20 + 2a = 30 → 2a = 10 → a = 5. Jadi (5, 5) memenuhi: 5 kambing dan 5 ayam.',
      },
      {
        id: 's5',
        tipe: 'pilih',
        cerita: 'Bu Guru menuliskan empat kelompok kalimat di papan tulis.',
        tanya: 'Manakah yang merupakan SPLDV?',
        opsi: [
          {
            id: 'benar',
            label: 'x + y = 10 dan 2x + 4y = 28',
            kalimat: ['x + y = 10', '2x + 4y = 28'],
          },
          { id: 'plsv', label: '3x + 2 = 11 dan x − 1 = 2', kalimat: ['3x + 2 = 11', 'x − 1 = 2'] },
          { id: 'beda', label: 'a + b = 5 dan p + q = 8', kalimat: ['a + b = 5', 'p + q = 8'] },
          {
            id: 'kuadrat',
            label: 'x² + y = 9 dan x + y = 3',
            kalimat: ['x² + y = 9', 'x + y = 3'],
          },
        ],
        correct: 'benar',
        umpan: {
          benar: '<strong>Tepat.</strong> Keduanya PLDV dengan variabel yang sama (x dan y).',
          plsv: 'Kedua persamaan itu hanya memuat satu variabel (x), jadi masing-masing PLSV.',
          beda: 'Masing-masing PLDV, tetapi variabelnya berbeda (a, b dan p, q), jadi tidak membentuk satu sistem.',
          kuadrat: 'x² berpangkat dua, sehingga persamaan pertama tidak linear.',
        },
        hints: ['SPLDV: dua persamaan, keduanya linear (pangkat satu), dua variabel yang sama.'],
        pembahasan:
          'x + y = 10 dan 2x + 4y = 28 sama-sama PLDV dengan variabel x dan y, sehingga membentuk SPLDV.',
      },
      {
        id: 's6',
        tipe: 'pasangan',
        cerita:
          'Rombongan membeli 8 tiket wahana: tiket dewasa (x) Rp5.000 dan tiket anak (y) Rp3.000, seluruhnya Rp34.000. Sistemnya: x + y = 8 dan 5x + 3y = 34.',
        tanya: 'Pasangan (x, y) mana yang merupakan penyelesaian SPLDV ini?',
        sistem: [
          { a: 1, b: 1, c: 8 },
          { a: 5, b: 3, c: 34 },
        ],
        opsi: [
          { id: 'p53', x: 5, y: 3 },
          { id: 'p35', x: 3, y: 5 },
          { id: 'p62', x: 6, y: 2 },
          { id: 'p28', x: 2, y: 8 },
        ],
        hints: [
          'Periksa setiap pasangan pada KEDUA persamaan.',
          'Pasangan yang jumlahnya 8 ada beberapa. Mana yang juga membuat 5x + 3y = 34?',
        ],
        pembahasan:
          '5 + 3 = 8 ✓ dan 5 × 5 + 3 × 3 = 25 + 9 = 34 ✓. Jadi (5, 3): 5 tiket dewasa dan 3 tiket anak.',
      },
      {
        id: 's7',
        tipe: 'pilih',
        cerita: 'Penyelesaian SPLDV pada soal sebelumnya adalah (5, 3).',
        tanya: 'Apa arti (5, 3) dalam situasi tiket wahana?',
        opsi: [
          { id: 'benar', label: 'Rombongan membeli 5 tiket dewasa dan 3 tiket anak' },
          { id: 'tukar', label: 'Rombongan membeli 3 tiket dewasa dan 5 tiket anak' },
          { id: 'harga', label: 'Harga tiket dewasa Rp5.000 dan tiket anak Rp3.000' },
          { id: 'total', label: 'Rombongan membayar 5 + 3 = 8 ribu rupiah' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> x = banyak tiket dewasa = 5 dan y = banyak tiket anak = 3.',
          tukar: 'Nilai pertama pasangan adalah x (tiket dewasa). Perhatikan urutannya.',
          harga:
            'Harga tiket adalah koefisien yang sudah diketahui. Variabelnya menyatakan banyak tiket.',
          total: 'Rombongan membayar Rp34.000. Angka 8 adalah banyak tiket.',
        },
        hints: ['Ingat lagi: x mewakili apa, dan y mewakili apa?'],
        pembahasan:
          'Pasangan (x, y) = (5, 3) berarti x = 5 tiket dewasa dan y = 3 tiket anak, sesuai pemisalan di awal.',
      },
      {
        id: 's8',
        tipe: 'isi',
        cerita:
          'Jumlah umur kakak (x) dan adik (y) 20 tahun, dan kakak 4 tahun lebih tua: x + y = 20 dan x − y = 4.',
        tanya: 'Berapa tahun umur kakak?',
        cek: {
          sistem: [
            { a: 1, b: 1, c: 20 },
            { a: 1, b: -1, c: 4 },
          ],
          minta: 'x',
        },
        hints: [
          'Daftar pasangan yang jumlahnya 20: (10, 10), (11, 9), (12, 8), …',
          'Dari pasangan itu, mana yang selisihnya 4?',
        ],
        pembahasan: '12 + 8 = 20 ✓ dan 12 − 8 = 4 ✓. Jadi kakak berumur 12 tahun dan adik 8 tahun.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses menemukan unsur dan penyelesaian PLDV serta SPLDV.',
    guru: 'Baca jawaban refleksi secara acak. Murid yang masih menganggap "PLDV hanya punya satu penyelesaian" atau sering menukar urutan pasangan perlu didampingi sebelum masuk metode penyelesaian SPLDV.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Tuliskan satu situasi dari kehidupanmu yang dapat ditulis sebagai PLDV. Sebutkan variabel, koefisien, dan konstantanya.',
        placeholder: 'Situasinya … Persamaannya … Variabelnya … koefisiennya … konstantanya …',
      },
      {
        id: 'r2',
        teks: 'Mengapa satu PLDV saja belum cukup untuk memastikan banyak roti dan susu yang dibeli Budi?',
        placeholder: 'Karena …',
      },
      {
        id: 'r3',
        teks: 'Bagaimana caramu memeriksa apakah sebuah pasangan nilai merupakan penyelesaian SPLDV?',
        placeholder: 'Aku …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat menentukan pasangan nilai yang memenuhi PLDV dan SPLDV?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '🙂 Yakin — aku bisa memeriksa pasangan dengan substitusi' },
      { id: 'ragu', label: '🤔 Masih ragu membedakan PLDV dan SPLDV' },
      { id: 'bantuan', label: '🙋 Aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, teka-teki Koperasi Sekolah terpecahkan!',
    teks: 'Kamu tidak sekadar menghafal rumus — kamu menulis persamaan dari cerita, mengumpulkan pasangan nilai, menguji titik-titiknya di lab, lalu menemukan sendiri arti penyelesaian PLDV dan SPLDV.',
    capaian: [
      'Menuliskan situasi sehari-hari sebagai PLDV ax + by = c.',
      'Menunjukkan variabel, koefisien, dan konstanta sebuah PLDV.',
      'Menentukan pasangan nilai yang memenuhi PLDV dengan substitusi, dan menyadari bahwa pasangannya banyak.',
      'Menentukan pasangan yang memenuhi kedua persamaan SPLDV sekaligus.',
      'Memaknai penyelesaian sesuai konteks (urutan pasangan & bilangan cacah).',
    ],
  },
};
