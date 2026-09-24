'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membaca, Menulis & Menempatkan Bilangan Bulat
   Fase D — SMP Kelas 7

   Tujuan Pembelajaran:
   Membaca dan menuliskan bilangan bulat positif dan negatif sesuai
   notasi baku, serta menempatkannya pada garis bilangan.

   Notasi baku yang dipakai di seluruh modul:
     • bilangan negatif ditulis dengan tanda negatif menempel di depan
       angka (−5) dan dibaca "negatif lima";
     • bilangan positif ditulis tanpa tanda (5) atau dengan tanda +
       (+5), dibaca "lima" atau "positif lima";
     • 0 dibaca "nol", bukan positif dan bukan negatif;
     • "minus" adalah nama operasi pengurangan (7 − 2), bukan cara
       baku membaca tanda bilangan negatif.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'koleksi'
     Sintaks 4 — Data processing ............ tahap 'olahBaca' & 'olahGaris'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi     (7')  — "Catatan Reporter Cilik": empat teman
                              menulis "3 derajat di bawah nol" dengan
                              cara berbeda; murid menduga yang tepat.
     2. Masalah       (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data          (12') — membaca enam situasi nyata (termometer,
                              lift, laut) pada skala tegak, menuliskan
                              bilangannya, lalu mengamati pola tabel.
     4a. Baca & Tulis (12') — memilah positif/negatif/nol, lalu
                              memasangkan notasi ↔ cara baca baku.
     4b. Garis Bilangan (12') — menempatkan bilangan dari tabel data
                              pada garis bilangan & menemukan pola letak
                              (kiri/kanan nol, jarak, pasangan lawan).
     5. Pembuktian    (10') — menguji pernyataan & menempatkan bilangan
                              baru; membandingkan dengan dugaan awal.
     6. Simpulan      (7')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap     (10') — delapan soal (isian & pilihan ganda).
     8. Refleksi      (5')  — refleksi tertulis & penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan, sehingga tiap murid
   (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Pembuktian.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati berbagai cara menuliskan keadaan "di bawah nol" dan menyampaikan dugaan awal.',
    guru: 'Bacakan cerita dengan ekspresif, lalu minta pasangan murid berdiskusi 2 menit sebelum memilih. Jangan membenarkan atau menyalahkan pilihan apa pun — dugaan ini akan diuji murid sendiri di tahap Pembuktian. Pancing dengan pertanyaan: "Kalau kamu pembaca majalah, tulisan mana yang langsung kamu pahami?"',
    judul: 'Catatan Reporter Cilik',
    cerita:
      'Raka menjadi reporter cilik majalah sekolah saat karyawisata ke Dataran Tinggi Dieng. Pagi itu termometer menunjukkan suhu 3 derajat di bawah nol, sampai rumput tertutup embun beku! Empat temannya menuliskan suhu itu di buku catatan dengan cara yang berbeda-beda:',
    tulisan: [
      { nama: 'Ani', teks: '−3 °C' },
      { nama: 'Budi', teks: '3− °C' },
      { nama: 'Citra', teks: 'min 3 °C' },
      { nama: 'Dodi', teks: '3 °C' },
    ],
    pertanyaan:
      'Menurut dugaanmu, tulisan siapa yang paling tepat dan tidak membuat pembaca salah paham?',
    opsi: [
      { id: 'ani', label: 'Tulisan Ani: <strong>−3 °C</strong>' },
      { id: 'budi', label: 'Tulisan Budi: <strong>3− °C</strong>' },
      { id: 'citra', label: 'Tulisan Citra: <strong>min 3 °C</strong>' },
      { id: 'dodi', label: 'Tulisan Dodi: <strong>3 °C</strong>' },
    ],
    alasanLabel: 'Mengapa kamu memilih tulisan itu? (boleh singkat)',
    alasanPlaceholder: 'Menurutku tulisan itu paling tepat karena …',
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
    guru: 'Arahkan murid bahwa pertanyaan yang baik dapat dijawab dengan menyelidiki, bukan dengan menghafal fakta. Hipotesis boleh keliru; yang penting murid berani menuliskannya dengan kalimat sendiri.',
    pengantar:
      'Tulisan teman-teman Raka berbeda-beda. Supaya semua orang membaca dan menulis keadaan seperti ini dengan cara yang sama, kita perlu menyelidiki sesuatu.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'inti',
        label:
          'Bagaimana cara baku menulis dan membaca bilangan di bawah nol dan di atas nol, serta di mana letaknya pada garis bilangan?',
      },
      { id: 'rata', label: 'Berapa suhu rata-rata Dataran Tinggi Dieng dalam setahun?' },
      { id: 'sebab', label: 'Mengapa suhu di pegunungan lebih dingin daripada di pantai?' },
      { id: 'alat', label: 'Termometer jenis apa yang paling akurat untuk mengukur suhu?' },
    ],
    correct: 'inti',
    umpan: {
      inti: 'Tepat! Pertanyaan ini bisa kamu jawab sendiri dengan mengumpulkan dan mengolah data bilangan.',
      rata: 'Menarik, tetapi itu soal data cuaca, bukan soal cara menulis dan membaca bilangannya. Coba pilih lagi.',
      sebab:
        'Itu pertanyaan IPA yang bagus, tetapi tidak menjawab kebingungan cara menulis −3 atau 3−. Coba pilih lagi.',
      alat: 'Alat ukur memang penting, tetapi masalah kita adalah cara menuliskan hasilnya. Coba pilih lagi.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: "Bilangan di bawah nol ditulis dengan …, dibaca …, dan letaknya pada garis bilangan di sebelah … nol."',
    hipotesisPlaceholder: 'Bilangan di bawah nol ditulis dengan …',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA
     Setiap situasi ditampilkan pada skala tegak; hanya angka 0 yang
     berlabel sehingga murid menghitung sendiri jaraknya dari nol.
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengumpulkan data: menuliskan bilangan untuk berbagai keadaan di atas dan di bawah nol.',
    guru: 'Biarkan murid menghitung jarak dari titik nol pada skala tegak. Bila murid menulis "4" untuk keadaan di bawah nol, tanyakan: "Kalau begitu, bagaimana pembaca membedakannya dengan 4 derajat di atas nol?"',
    instruksi:
      'Amati titik pada setiap skala. Hitung berapa langkah titik itu dari 0, perhatikan apakah di atas atau di bawah 0, lalu tuliskan bilangannya. Untuk keadaan di bawah nol, ketik tanda - di depan angka.',
    situasi: [
      {
        id: 'jayawijaya',
        ikon: '🌡️',
        konteks: 'Termometer',
        label:
          'Suhu Puncak Jaya pada dini hari: 4 derajat <strong>di bawah</strong> nol. Tulis suhunya (°C).',
        posisi: 'di bawah nol',
        jawab: -4,
        allowNegative: true,
        hints: [
          'Titiknya berada 4 langkah di bawah 0. Keadaan di bawah nol perlu tanda khusus agar tidak tertukar dengan 4 derajat di atas nol.',
          'Ketik tanda - lalu angka 4.',
        ],
      },
      {
        id: 'kulkas',
        ikon: '🌡️',
        konteks: 'Termometer',
        label:
          'Suhu di dalam lemari es: 6 derajat <strong>di atas</strong> nol. Tulis suhunya (°C).',
        posisi: 'di atas nol',
        jawab: 6,
        hints: ['Titiknya 6 langkah di atas 0. Keadaan di atas nol cukup ditulis angkanya saja.'],
      },
      {
        id: 'parkir',
        ikon: '🛗',
        konteks: 'Lift gedung',
        label:
          'Lift berhenti di lantai parkir 2 lantai <strong>di bawah</strong> lantai dasar (lantai dasar = 0). Tulis nomor lantainya.',
        posisi: 'di bawah nol',
        jawab: -2,
        allowNegative: true,
        hints: [
          'Lantai dasar adalah 0. Lantai parkir berada 2 lantai di bawahnya.',
          'Gunakan cara yang sama seperti suhu di bawah nol: tanda - di depan angka.',
        ],
      },
      {
        id: 'dasar',
        ikon: '🛗',
        konteks: 'Lift gedung',
        label: 'Lift kembali ke lantai dasar, tempat pintu masuk utama. Tulis nomor lantainya.',
        posisi: 'tepat di nol',
        jawab: 0,
        hints: ['Lantai dasar adalah titik acuan — tidak di atas, tidak di bawah.'],
      },
      {
        id: 'penyelam',
        ikon: '🤿',
        konteks: 'Permukaan laut',
        label:
          'Seorang penyelam berada 8 meter <strong>di bawah</strong> permukaan laut (permukaan laut = 0). Tulis posisinya (meter).',
        posisi: 'di bawah nol',
        jawab: -8,
        allowNegative: true,
        hints: [
          'Hitung langkah dari 0 ke titik penyelam, lalu ingat ia berada di bawah permukaan.',
          'Ketik tanda - lalu angka 8.',
        ],
      },
      {
        id: 'camar',
        ikon: '🕊️',
        konteks: 'Permukaan laut',
        label:
          'Seekor burung camar terbang 7 meter <strong>di atas</strong> permukaan laut. Tulis posisinya (meter).',
        posisi: 'di atas nol',
        jawab: 7,
        hints: ['Burung camar berada 7 langkah di atas 0.'],
      },
    ],
    skalaMax: 8,
    amati: {
      pertanyaan:
        'Amati kolom "Tulisan" pada tabel. Apa kesamaan cara menulis semua keadaan di bawah nol?',
      opsi: [
        { id: 'depan', label: 'Diberi tanda negatif (−) di <strong>depan</strong> angka' },
        { id: 'belakang', label: 'Diberi tanda negatif (−) di <strong>belakang</strong> angka' },
        { id: 'kurung', label: 'Angkanya ditulis di dalam tanda kurung' },
        { id: 'polos', label: 'Tidak diberi tanda apa pun, sama seperti di atas nol' },
      ],
      correct: 'depan',
      umpan: {
        depan:
          'Betul! Semua keadaan di bawah nol ditulis dengan tanda negatif di depan angka: −4, −2, −8. Bilangan seperti ini disebut <strong>bilangan bulat negatif</strong>.',
        belakang: 'Lihat lagi kolom Tulisan: tanda − ada di sebelah mana angkanya?',
        kurung: 'Tidak ada tanda kurung di tabel. Lihat lagi kolom Tulisan.',
        polos: 'Kalau tanpa tanda, −4 dan 4 akan terlihat sama. Lihat lagi kolom Tulisan.',
      },
    },
    nextLabel: 'Lanjut: Olah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — PENGOLAHAN DATA: BACA & TULIS
     ---------------------------------------------------------- */
  olahBaca: {
    kicker: 'Tahap 4a · Pengolahan Data — Baca & Tulis',
    syntax: DL + ' · Sintaks 4',
    goal: 'Mengolah data untuk menemukan jenis bilangan bulat serta cara menulis dan membacanya secara baku.',
    guru: 'Diskusikan mengapa 0 bukan positif dan bukan negatif (0 adalah titik acuan). Tekankan bahwa kata "minus" dipakai untuk operasi pengurangan, sedangkan tanda di depan bilangan dibaca "negatif".',
    judulA: 'A. Pilah bilangan menurut jenisnya',
    instruksiA:
      'Untuk setiap bilangan, pilih jenisnya. Petunjuk: ingat kembali tabel data — mana yang di atas nol, di bawah nol, atau tepat di nol?',
    pilah: [
      {
        id: 'p1',
        teks: '−9',
        correct: 'neg',
        explanation: 'Ada tanda negatif di depan angka, jadi −9 adalah bilangan bulat negatif.',
      },
      {
        id: 'p2',
        teks: '14',
        correct: 'pos',
        explanation: 'Tanpa tanda berarti positif: 14 terletak di atas (di kanan) nol.',
      },
      {
        id: 'p3',
        teks: '0',
        correct: 'nol',
        explanation: '0 adalah titik acuan — tidak di atas dan tidak di bawah nol.',
      },
      {
        id: 'p4',
        teks: '+3',
        correct: 'pos',
        explanation: 'Tanda + menegaskan positif. +3 sama dengan 3.',
      },
      {
        id: 'p5',
        teks: '−1',
        correct: 'neg',
        explanation: '−1 adalah bilangan bulat negatif yang paling dekat dengan 0.',
      },
    ],
    opsiPilah: [
      { id: 'pos', label: 'Bilangan bulat positif' },
      { id: 'neg', label: 'Bilangan bulat negatif' },
      { id: 'nol', label: 'Bukan positif, bukan negatif' },
    ],
    judulB: 'B. Pasangkan tulisan dan cara bacanya',
    instruksiB:
      'Pilih jawaban yang menurutmu baku. Jika belum tepat, baca umpan baliknya lalu coba lagi.',
    baca: [
      {
        id: 'b1',
        tanya: 'Bagaimana cara baku membaca <span class="num-chip">−7</span>?',
        opsi: [
          { id: 'a', label: 'negatif tujuh' },
          { id: 'b', label: 'tujuh negatif' },
          { id: 'c', label: 'minus tujuh' },
          { id: 'd', label: 'positif tujuh' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Tanda di depan bilangan dibaca lebih dulu: "negatif", lalu angkanya.',
          b: 'Urutannya terbalik. Tanda ditulis di depan, jadi dibaca lebih dulu.',
          c: '"Minus" adalah nama operasi pengurangan, misalnya 9 − 7. Tanda bilangan negatif dibaca dengan kata lain.',
          d: 'Ada tanda − di depan angka, jadi bukan positif.',
        },
      },
      {
        id: 'b2',
        tanya: 'Tuliskan dengan notasi baku: <em>"negatif dua puluh lima"</em>',
        opsi: [
          { id: 'a', label: '−25' },
          { id: 'b', label: '25−' },
          { id: 'c', label: '(25)' },
          { id: 'd', label: '25' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Kata "negatif" menjadi tanda − yang menempel di depan angka.',
          b: 'Tanda negatif tidak ditulis di belakang angka.',
          c: 'Tanda kurung bukan tanda bilangan negatif.',
          d: 'Tanpa tanda, 25 adalah bilangan positif.',
        },
      },
      {
        id: 'b3',
        tanya: 'Bagaimana cara baku membaca <span class="num-chip">+12</span>?',
        opsi: [
          { id: 'a', label: 'positif dua belas (atau cukup "dua belas")' },
          { id: 'b', label: 'plus dua belas negatif' },
          { id: 'c', label: 'negatif dua belas' },
          { id: 'd', label: 'satu dua positif' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! +12 sama dengan 12, dibaca "positif dua belas" atau "dua belas".',
          b: 'Tidak ada tanda negatif pada +12.',
          c: 'Tanda + berarti positif, bukan negatif.',
          d: '12 dibaca sebagai satu bilangan: "dua belas".',
        },
      },
      {
        id: 'b4',
        tanya: 'Tuliskan dengan notasi baku: <em>"negatif seratus"</em>',
        opsi: [
          { id: 'a', label: '−100' },
          { id: 'b', label: '−1 00' },
          { id: 'c', label: '100−' },
          { id: 'd', label: '− 100 −' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Satu tanda negatif menempel di depan bilangan 100.',
          b: 'Bilangan 100 ditulis rapat tanpa spasi.',
          c: 'Tanda negatif tidak ditulis di belakang angka.',
          d: 'Cukup satu tanda negatif, di depan angka.',
        },
      },
    ],
    temuan: [
      'Bilangan bulat terdiri atas bilangan bulat <strong>negatif</strong> (−1, −2, −3, …), <strong>nol</strong>, dan bilangan bulat <strong>positif</strong> (1, 2, 3, …).',
      'Bilangan negatif ditulis dengan tanda <strong>−</strong> menempel di depan angka dan dibaca <strong>"negatif …"</strong>.',
      'Bilangan positif boleh ditulis tanpa tanda atau dengan tanda +, dibaca "…" atau "positif …".',
    ],
    nextLabel: 'Lanjut: Garis Bilangan →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — PENGOLAHAN DATA: GARIS BILANGAN
     ---------------------------------------------------------- */
  olahGaris: {
    kicker: 'Tahap 4b · Pengolahan Data — Garis Bilangan',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menempatkan bilangan bulat dari data pada garis bilangan dan menemukan pola letaknya.',
    guru: 'Kaitkan skala tegak (termometer, lift) dengan garis bilangan mendatar: "Putar termometer ke kanan — bagian di bawah nol pindah ke mana?" Minta murid menghitung langkah dari 0, bukan menebak.',
    instruksi:
      'Garis bilangan adalah termometer yang "direbahkan": bagian di atas nol pindah ke kanan, bagian di bawah nol pindah ke kiri. Ketuk titik yang tepat untuk setiap bilangan dari tabel datamu.',
    min: -10,
    max: 10,
    labelEvery: 5,
    tanya: [
      {
        id: 'q1',
        teks: 'Semua bilangan negatif yang kamu tempatkan berada di sebelah … 0.',
        opsi: [
          { id: 'a', label: 'kiri' },
          { id: 'b', label: 'kanan' },
          { id: 'c', label: 'tepat di atas' },
          { id: 'd', label: 'kadang kiri, kadang kanan' },
        ],
        correct: 'a',
        umpan: {
          a: 'Betul! Bilangan negatif selalu di kiri 0, bilangan positif di kanan 0.',
          b: 'Lihat lagi titik biru (−4, −2, −8) pada garis bilangan.',
          c: 'Semua titik berada tepat pada garis. Perhatikan sisinya terhadap 0.',
          d: 'Perhatikan lagi: adakah titik negatif di kanan 0?',
        },
      },
      {
        id: 'q2',
        teks: 'Titik −4 berjarak berapa satuan dari 0?',
        opsi: [
          { id: 'a', label: '4 satuan' },
          { id: 'b', label: '−4 satuan' },
          { id: 'c', label: '0 satuan' },
          { id: 'd', label: '8 satuan' },
        ],
        correct: 'a',
        umpan: {
          a: 'Betul! Angka di belakang tanda menunjukkan jaraknya dari 0; tandanya menunjukkan arahnya (kiri).',
          b: 'Jarak selalu dihitung sebagai banyak langkah, tidak pernah negatif. Tanda − hanya menunjukkan arah kiri.',
          c: 'Hitung langkah dari 0 ke −4.',
          d: 'Hitung lagi langkah dari 0 sampai −4.',
        },
      },
      {
        id: 'q3',
        teks: 'Bilangan manakah yang jaraknya dari 0 SAMA dengan 6, tetapi berada di sisi berlawanan?',
        opsi: [
          { id: 'a', label: '−6' },
          { id: 'b', label: '0' },
          { id: 'c', label: '7' },
          { id: 'd', label: '−4' },
        ],
        correct: 'a',
        umpan: {
          a: 'Betul! 6 dan −6 sama-sama 6 langkah dari 0, tetapi di sisi berlawanan. Pasangan seperti ini disebut <strong>lawan</strong> bilangan.',
          b: '0 adalah titik tengahnya, jaraknya 0 langkah.',
          c: '7 berada di sisi yang sama dengan 6.',
          d: '−4 memang di sisi berlawanan, tetapi jaraknya 4 langkah, bukan 6.',
        },
      },
    ],
    temuan:
      'Pada garis bilangan mendatar, 0 menjadi titik acuan. Bilangan negatif terletak di <strong>kiri</strong> 0, bilangan positif di <strong>kanan</strong> 0. Angka pada bilangan menyatakan <strong>jarak</strong> (banyak langkah) dari 0, sedangkan tandanya menyatakan <strong>arah</strong>.',
    nextLabel: 'Lanjut: Buktikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji temuan pada pernyataan dan bilangan baru, lalu membandingkannya dengan dugaan awal.',
    guru: 'Minta pasangan murid menjelaskan alasan setiap pernyataan benar/salah dengan menunjuk garis bilangan. Pada bagian dugaan, ajak murid yang dugaannya berubah untuk bercerita apa yang membuatnya berubah pikiran.',
    judulA: 'A. Benar atau salah?',
    pernyataan: [
      {
        id: 'v1',
        teks: '−12 dibaca "negatif dua belas".',
        correct: 'benar',
        explanation: 'Tanda − di depan bilangan dibaca "negatif".',
      },
      {
        id: 'v2',
        teks: 'Bilangan 0 termasuk bilangan bulat positif.',
        correct: 'salah',
        explanation: '0 adalah titik acuan: bukan positif dan bukan negatif.',
      },
      {
        id: 'v3',
        teks: 'Suhu 9 derajat di bawah nol ditulis 9− °C.',
        correct: 'salah',
        explanation: 'Notasi bakunya −9 °C: tanda negatif di depan angka.',
      },
      {
        id: 'v4',
        teks: 'Pada garis bilangan, −3 terletak 3 satuan di sebelah kiri 0.',
        correct: 'benar',
        explanation: 'Angka 3 adalah jaraknya, tanda − menunjukkan arah kiri.',
      },
      {
        id: 'v5',
        teks: '+8 dan 8 adalah bilangan yang sama.',
        correct: 'benar',
        explanation: 'Tanda + boleh ditulis atau tidak untuk bilangan positif.',
      },
      {
        id: 'v6',
        teks: 'Titik −7 terletak di sebelah kanan titik −2.',
        correct: 'salah',
        explanation:
          '−7 berjarak 7 langkah ke kiri dari 0, lebih jauh daripada −2. Jadi −7 di sebelah kiri −2.',
      },
    ],
    opsiPernyataan: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    judulB: 'B. Uji pada garis bilangan yang lebih panjang',
    instruksiB:
      'Tempatkan bilangan-bilangan baru ini. Angka berlabel hanya kelipatan 5 — hitung langkahnya!',
    min: -15,
    max: 15,
    labelEvery: 5,
    /* Empat bilangan diambil acak dari kumpulan ini (lihat initExerciseArrays). */
    kumpulan: [-13, -11, -7, -3, -1, 2, 4, 9, 12, 14],
    banyakUji: 4,
    judulC: 'C. Bandingkan dengan dugaan awalmu',
    dugaanBenar: 'ani',
    nextLabel: 'Lanjut: Tarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Merumuskan kesimpulan tentang notasi baku bilangan bulat dan letaknya pada garis bilangan.',
    guru: 'Setelah kesimpulan lengkap, minta beberapa murid membacakannya dengan kalimat sendiri. Tuliskan rangkuman di papan tulis sebagai catatan bersama.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'Bilangan bulat negatif ditulis dengan', correct: 'tandaDepan' },
      { id: 'k2', awal: 'Bilangan −6 dibaca', correct: 'bacaNegatif' },
      { id: 'k3', awal: 'Bilangan bulat positif ditulis', correct: 'tanpaTanda' },
      { id: 'k4', awal: 'Bilangan 0', correct: 'nolNetral' },
      {
        id: 'k5',
        awal: 'Pada garis bilangan mendatar, bilangan negatif terletak',
        correct: 'kiri',
      },
      { id: 'k6', awal: 'Bilangan 6 dan −6', correct: 'lawan' },
    ],
    bank: [
      { id: 'tandaDepan', teks: 'tanda − menempel di depan angka, misalnya −6' },
      { id: 'bacaNegatif', teks: '"negatif enam"' },
      { id: 'tanpaTanda', teks: 'tanpa tanda atau dengan tanda +, misalnya 6 atau +6' },
      { id: 'nolNetral', teks: 'bukan bilangan positif dan bukan bilangan negatif' },
      { id: 'kiri', teks: 'di sebelah kiri 0, sedangkan bilangan positif di sebelah kanan 0' },
      { id: 'lawan', teks: 'sama jauh dari 0 tetapi berada di sisi yang berlawanan' },
      { id: 'tandaBelakang', teks: 'tanda − di belakang angka, misalnya 6−' },
      { id: 'bacaTerbalik', teks: '"enam negatif"' },
      { id: 'kanan', teks: 'di sebelah kanan 0, sedangkan bilangan positif di sebelah kiri 0' },
    ],
    rangkuman: [
      'Bilangan bulat: …, −3, −2, −1, 0, 1, 2, 3, …',
      'Notasi baku negatif: <strong>−a</strong> dibaca "negatif a" (contoh: −15 dibaca "negatif lima belas").',
      'Notasi baku positif: <strong>a</strong> atau <strong>+a</strong> dibaca "a" atau "positif a".',
      'Pada garis bilangan: negatif di kiri 0, positif di kanan 0; angkanya = jarak dari 0.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP (createExerciseStage)
     Soal bertanda `garis` menampilkan garis bilangan statis.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan konsep',
    goal: 'Menerapkan notasi baku bilangan bulat dan garis bilangan pada soal baru.',
    guru: 'Murid mengerjakan mandiri. Amati murid yang masih menulis tanda di belakang angka atau membaca "minus", lalu berikan penguatan singkat secara individual.',
    instruksi:
      'Kerjakan setiap soal. Pada soal isian, ketik tanda - di depan angka untuk bilangan negatif.',
    soal: [
      {
        type: 'input',
        cerita: 'Suhu di dalam freezer sebuah toko es krim adalah 18 derajat di bawah nol.',
        pertanyaan: 'Tuliskan suhu itu dengan notasi bilangan bulat baku (dalam °C).',
        jawab: -18,
        explanation:
          'Di bawah nol → negatif: −18 °C, dibaca "negatif delapan belas derajat Celsius".',
        hints: ['Di bawah nol → bilangan negatif.', 'Tanda − ditulis di depan angka 18.'],
        reveal: 'Jawaban: <strong>−18</strong> °C, dibaca "negatif delapan belas derajat Celsius".',
      },
      {
        type: 'choice',
        cerita: 'Pada papan skor kuis, tim Merah memperoleh nilai −35.',
        pertanyaan: 'Bagaimana cara baku membaca nilai tim Merah?',
        options: [
          { id: 'a', label: 'negatif tiga puluh lima' },
          { id: 'b', label: 'tiga puluh lima negatif' },
          { id: 'c', label: 'minus tiga lima' },
          { id: 'd', label: 'positif tiga puluh lima' },
        ],
        correct: 'a',
        explanation:
          '−35 dibaca "negatif tiga puluh lima". Kata "minus" dipakai untuk operasi pengurangan.',
      },
      {
        type: 'input',
        cerita: 'Guru mendiktekan sebuah bilangan: "negatif seratus dua puluh".',
        pertanyaan: 'Tuliskan bilangan itu dengan angka.',
        jawab: -120,
        explanation: '"Negatif" menjadi tanda − di depan angka: −120.',
        hints: ['"Negatif" berarti tanda − di depan.', 'Seratus dua puluh ditulis 120.'],
        reveal: 'Jawaban: <strong>−120</strong>.',
      },
      {
        type: 'input',
        garis: { min: -10, max: 10, labelEvery: 5, titik: -7, label: 'A' },
        cerita: 'Perhatikan titik A pada garis bilangan berikut.',
        pertanyaan: 'Bilangan berapakah yang ditunjukkan titik A?',
        jawab: -7,
        explanation: 'Titik A berada 7 langkah di kiri 0, jadi A = −7 (dibaca "negatif tujuh").',
        hints: [
          'Titik A berada di sebelah kiri 0, jadi bilangannya negatif.',
          'Hitung langkah dari 0 ke titik A: ada berapa langkah?',
        ],
        reveal: 'Jawaban: <strong>−7</strong>. Titik A berada 7 langkah di kiri 0.',
      },
      {
        type: 'choice',
        cerita:
          'Sebuah kapal selam berada 150 meter di bawah permukaan laut, sedangkan sebuah helikopter terbang 150 meter di atas permukaan laut.',
        pertanyaan: 'Pernyataan manakah yang tepat?',
        options: [
          {
            id: 'a',
            label: 'Posisi kapal selam −150 dan helikopter 150; keduanya sama jauh dari 0.',
          },
          { id: 'b', label: 'Posisi kapal selam 150 dan helikopter −150.' },
          { id: 'c', label: 'Keduanya ditulis 150 karena jaraknya sama.' },
          { id: 'd', label: 'Kapal selam −150 lebih jauh dari 0 daripada helikopter.' },
        ],
        correct: 'a',
        explanation:
          '−150 dan 150 berjarak sama (150) dari 0, tetapi berlawanan arah. Tanda − membedakan keadaan di bawah permukaan laut.',
      },
      {
        type: 'input',
        garis: { min: -10, max: 10, labelEvery: 5, titik: 4, label: 'B' },
        cerita: 'Perhatikan titik B pada garis bilangan berikut.',
        pertanyaan: 'Bilangan berapakah yang ditunjukkan titik B?',
        jawab: 4,
        explanation: 'Titik B berada 4 langkah di kanan 0, jadi B = 4 (boleh ditulis +4).',
        hints: ['Titik B berada di sebelah kanan 0.', 'Hitung langkah dari 0 ke titik B.'],
        reveal:
          'Jawaban: <strong>4</strong> (boleh ditulis +4). Titik B berada 4 langkah di kanan 0.',
      },
      {
        type: 'choice',
        cerita: 'Rina berjalan dari titik 0 sejauh 6 satuan ke kiri pada garis bilangan.',
        pertanyaan: 'Di bilangan berapakah Rina berhenti?',
        options: [
          { id: 'a', label: '−6' },
          { id: 'b', label: '6' },
          { id: 'c', label: '6−' },
          { id: 'd', label: '−60' },
        ],
        correct: 'a',
        explanation: '6 satuan di kiri 0 adalah −6 (tanda − di depan angka).',
      },
      {
        type: 'input',
        cerita:
          'Lantai parkir paling bawah sebuah mal berada 3 lantai di bawah lantai dasar (lantai dasar = 0).',
        pertanyaan: 'Tuliskan nomor lantai parkir itu sebagai bilangan bulat.',
        jawab: -3,
        explanation: '3 lantai di bawah lantai dasar ditulis −3, dibaca "negatif tiga".',
        hints: ['Di bawah lantai dasar → bilangan negatif.'],
        reveal: 'Jawaban: <strong>−3</strong>, dibaca "negatif tiga".',
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
    goal: 'Merefleksikan proses menemukan notasi baku bilangan bulat dan letaknya pada garis bilangan.',
    guru: 'Beri waktu hening 3 menit untuk menulis. Jawaban penilaian diri bisa menjadi dasar pengelompokan pada pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Bagaimana caramu menjelaskan perbedaan −5 dan 5 kepada adik kelas? Gunakan contoh suhu atau lantai gedung.',
        placeholder: '−5 berarti … sedangkan 5 berarti …',
      },
      {
        id: 'r2',
        teks: 'Mengapa semua orang perlu memakai cara baku yang sama untuk menulis dan membaca bilangan negatif?',
        placeholder: 'Kita perlu cara baku karena …',
      },
      {
        id: 'r3',
        teks: 'Bagian mana yang masih membingungkan atau ingin kamu pelajari lebih lanjut?',
        placeholder: 'Aku masih bingung tentang …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu membaca, menulis, dan menempatkan bilangan bulat sekarang?',
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
    teks: 'Kamu telah menemukan cara baku menulis, membaca, dan menempatkan bilangan bulat positif dan negatif.',
    capaian: [
      'Menuliskan keadaan di bawah nol dengan tanda negatif di depan angka (mis. −3 °C).',
      'Membaca bilangan negatif dengan kata "negatif" dan bilangan positif dengan atau tanpa kata "positif".',
      'Mengenali 0 sebagai bilangan yang bukan positif dan bukan negatif.',
      'Menempatkan bilangan bulat pada garis bilangan: negatif di kiri 0, positif di kanan 0.',
    ],
  },
};
