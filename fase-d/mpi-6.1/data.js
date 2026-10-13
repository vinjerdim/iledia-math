'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Kalimat Terbuka, Persamaan & PLSV — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menjelaskan konsep kalimat terbuka, persamaan, dan persamaan linear
   satu variabel melalui eksplorasi situasi keseimbangan dan contoh
   kehidupan sehari-hari.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahKalimat', 'olahPersamaan'
                                         & 'olahPlsv'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi    (7')  — "Neraca Warung Bu Sari": sekotak teh yang
                             beratnya belum diketahui seimbang dengan
                             beban 1 kg, dan kalimat-kalimat di papan
                             kelas ("3 + 4 = 8", "Ia ketua kelas VII A",
                             "x + 2 = 5"). Murid MENDUGA mana yang dapat
                             dinilai benar/salah dan berapa berat teh
                             (tidak dinilai).
     2. Masalah      (5')  — memilih pertanyaan inti penyelidikan lalu
                             menulis dugaan sementara (hipotesis).
     3. Lab Neraca   (15') — empat neraca seimbang dengan kotak berbobot
                             x kg dan beban 1 kg. Murid menulis kalimat
                             "=" tiap neraca (isian berdiagnosa), lalu
                             MENGUJI beberapa nilai x: neraca miring →
                             kalimat salah, neraca seimbang → kalimat
                             benar. Semua uji tercatat di tabel.
     4a. Olah Kalimat Terbuka (8') — kalimat yang sama bisa benar atau
                             salah bergantung nilai variabel; pernyataan
                             vs kalimat terbuka (pernyataan salah tetap
                             pernyataan); mencari nilai pengganti.
     4b. Olah Persamaan (8') — neraca seimbang ⇔ tanda "="; persamaan
                             vs pertidaksamaan vs bentuk aljabar; menulis
                             persamaan dari cerita umur.
     4c. Olah PLSV   (8')  — ciri PLSV: satu variabel, pangkat satu,
                             tanda "="; memilah contoh bukan PLSV;
                             menulis & menyelesaikan PLSV harga buku.
     5. Verifikasi   (10') — memilah kalimat BARU ke lima jenis,
                             memilah pernyataan konsep, membandingkan
                             dugaan awal serta hipotesis dengan temuan.
     6. Generalisasi (5')  — menyusun definisi pernyataan, kalimat
                             terbuka, persamaan, PLSV, dan penyelesaian
                             dari bank kalimat acak.
     7. Uji terap    (12') — delapan soal diambil acak dari bank enam
                             belas soal (isian berdiagnosa & pilihan
                             ganda berpengecoh miskonsepsi).
     8. Refleksi     (3')  — rekap, refleksi tertulis, penilaian diri.

   Notasi kunci jawaban (`cek`, lihat engine seksi 75):
     { kalimat, minta: 'jenis' }        → jenis kalimat (jenisKalimatMtk)
     { kalimat, minta: 'kebenaran' }    → 'benar' | 'salah' | 'terbuka'
     { kalimat, minta: 'penyelesaian' } → nilai variabel yang membuat benar
     { kalimat, minta: 'kalimat' }      → menulis PLSV dari cerita
   Neraca = { kiri: { x, lepas }, kanan: { x, lepas } } (banyak kotak x
   kg dan banyak beban 1 kg di setiap piring).

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Soal uji terap juga
   diambil acak dari bank dan opsi pilihan gandanya dibangun engine
   (opsiSoalKalimat) lalu diacak.

   Konsistensi kunci jawaban diuji tests/mpi-6.1-data.test.js terhadap
   engine seksi 75.
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  meta: {
    judul: 'Kalimat Terbuka, Persamaan & PLSV',
  },

  tahap: [
    { id: 'stimulasi', label: 'Stimulasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'koleksi', label: 'Lab Neraca' },
    { id: 'olahKalimat', label: 'Kalimat Terbuka' },
    { id: 'olahPersamaan', label: 'Persamaan' },
    { id: 'olahPlsv', label: 'PLSV' },
    { id: 'verifikasi', label: 'Verifikasi' },
    { id: 'generalisasi', label: 'Generalisasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Label konteks soal (ikon + nama). */
  konteks: {
    neraca: { ikon: '⚖️', nama: 'Neraca' },
    warung: { ikon: '🏪', nama: 'Warung' },
    sekolah: { ikon: '🏫', nama: 'Sekolah' },
    simbol: { ikon: '🔤', nama: 'Kalimat Matematika' },
  },

  /* Nama jenis kalimat untuk tampilan (id = jenisKalimatMtk). */
  namaJenis: {
    pernyataan: 'Pernyataan',
    kalimatTerbuka: 'Kalimat terbuka (bukan persamaan)',
    persamaan: 'Persamaan (bukan PLSV)',
    plsv: 'Persamaan linear satu variabel (PLSV)',
    bentuk: 'Bentuk aljabar (belum kalimat)',
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; dibandingkan dengan temuan pada tahap
     Verifikasi. `baku` = jawaban menurut engine bila ada `cek`.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati neraca seimbang di warung dan kalimat-kalimat di papan kelas, lalu menduga kapan sebuah kalimat dapat dinilai benar atau salah.',
    tp: 'Menjelaskan konsep kalimat terbuka, persamaan, dan persamaan linear satu variabel melalui eksplorasi situasi keseimbangan dan contoh kehidupan sehari-hari.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Membedakan pernyataan (sudah pasti benar atau salah) dengan kalimat terbuka (memuat variabel).',
      'Menentukan nilai pengganti variabel yang membuat kalimat terbuka menjadi pernyataan benar, dengan bantuan neraca.',
      'Menjelaskan bahwa persamaan adalah kalimat terbuka yang memakai tanda "=", seperti neraca yang seimbang.',
      'Menyebutkan ciri persamaan linear satu variabel (PLSV) dan memilah contoh yang bukan PLSV.',
      'Menulis PLSV dari situasi sehari-hari.',
    ],
    guru: 'Tampilkan kedua kartu. Biarkan pasangan murid berdebat: apakah "3 + 4 = 8" termasuk kalimat yang benar, salah, atau tidak dapat dinilai? Jangan membenarkan atau menyalahkan dulu — dugaan seperti "kalimat yang salah bukan pernyataan" justru menjadi bahan penemuan.',
    judul: 'Neraca Warung Bu Sari',
    pengantar:
      'Di warung Bu Sari ada neraca dua piring. Sekotak teh celup belum tercantum beratnya. Sementara itu, di papan kelas tertulis beberapa kalimat. Amati keduanya.',
    kartu: [
      {
        id: 'kNeraca',
        ikon: '⚖️',
        judul: 'Neraca Bu Sari',
        teks: 'Bu Sari menaruh 1 kotak teh (beratnya x kg) dan 2 beban 1 kg di piring kiri. Di piring kanan ada 5 beban 1 kg. Neraca seimbang.',
        neraca: { kiri: { x: 1, lepas: 2 }, kanan: { lepas: 5 } },
      },
      {
        id: 'kPapan',
        ikon: '🧑‍🏫',
        judul: 'Kalimat di papan kelas',
        teks: 'Bu Guru menulis empat kalimat ini:',
        kalimat: [
          'Jakarta adalah ibu kota Indonesia.',
          '3 + 4 = 8',
          'Ia adalah ketua kelas VII A.',
          'x + 2 = 5',
        ],
      },
    ],
    dugaan: [
      {
        id: 'dSalah',
        tanya: 'Kalimat "3 + 4 = 8" termasuk kalimat yang …',
        opsi: [
          { id: 'salah', label: 'sudah pasti bernilai salah' },
          { id: 'benar', label: 'sudah pasti bernilai benar' },
          { id: 'terbuka', label: 'belum dapat ditentukan benar atau salahnya' },
          { id: 'bukan', label: 'bukan kalimat, karena isinya salah' },
        ],
        baku: 'salah',
        cek: { kalimat: '3 + 4 = 8', minta: 'kebenaran' },
        pembahasan:
          'Tidak ada variabel, jadi nilainya sudah pasti: 3 + 4 = 7, bukan 8. Kalimat yang sudah pasti benar ATAU salah disebut pernyataan — meskipun salah, ia tetap pernyataan.',
      },
      {
        id: 'dIa',
        tanya: 'Apakah kalimat "Ia adalah ketua kelas VII A" benar atau salah?',
        opsi: [
          { id: 'tergantung', label: 'Bergantung pada siapa yang dimaksud dengan "ia"' },
          { id: 'benar', label: 'Pasti benar' },
          { id: 'salah', label: 'Pasti salah' },
          { id: 'bukan', label: 'Bukan kalimat' },
        ],
        baku: 'tergantung',
        pembahasan:
          'Kata "ia" belum jelas menunjuk siapa, seperti variabel x yang belum jelas nilainya. Kalimat seperti ini disebut kalimat terbuka: benar-salahnya bergantung pada pengganti "ia".',
      },
      {
        id: 'dTeh',
        tanya: 'Pada neraca Bu Sari, berapa kg berat sekotak teh (x)?',
        opsi: [
          { id: 'tiga', label: '3' },
          { id: 'lima', label: '5' },
          { id: 'tujuh', label: '7' },
          { id: 'dua', label: '2' },
        ],
        baku: 'tiga',
        cek: { kalimat: 'x + 2 = 5', minta: 'penyelesaian' },
        pembahasan:
          'Neraca seimbang hanya jika x = 3, karena 3 + 2 = 5. Nilai pengganti yang membuat kalimat x + 2 = 5 benar disebut penyelesaian.',
      },
    ],
    alasanLabel:
      'Menurutmu, apa persamaan antara kata "ia" pada kalimat ketiga dan huruf x pada kalimat keempat? Tulis singkat.',
    alasanPlaceholder: 'Contoh: keduanya belum jelas …',
    catatan:
      'Dugaan ini belum dinilai. Kalian akan memeriksanya sendiri dengan menguji neraca di Lab Neraca.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — PROBLEM STATEMENT
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan penyelidikan tentang kalimat yang dapat dan belum dapat dinilai benar-salahnya, lalu menulis hipotesis.',
    guru: 'Arahkan murid pada pertanyaan yang dapat diselidiki dengan neraca. Pertanyaan harga teh belum bisa dijawab karena informasinya tidak ada — bahas mengapa.',
    pengantar:
      'Ada kalimat yang sudah pasti benar atau salah (3 + 4 = 8), ada pula yang bergantung pada sesuatu yang belum jelas ("ia", x). Neraca Bu Sari juga hanya seimbang untuk berat teh tertentu. Pertanyaan mana yang paling tepat untuk diselidiki hari ini?',
    pertanyaan: 'Pilih pertanyaan inti penyelidikan kita:',
    opsi: [
      {
        id: 'inti',
        label:
          'Kapan sebuah kalimat matematika sudah dapat dinilai benar atau salah, kapan belum, dan apa ciri kalimat bertanda "=" seperti x + 2 = 5?',
      },
      { id: 'harga', label: 'Berapa harga sekotak teh di warung Bu Sari?' },
      { id: 'neraca', label: 'Bagaimana cara membuat neraca dua piring sendiri?' },
      { id: 'huruf', label: 'Mengapa huruf yang dipakai x, bukan huruf lain?' },
    ],
    correct: 'inti',
    umpan: {
      inti: 'Tepat! Pertanyaan ini dapat kita selidiki dengan menguji nilai x pada neraca dan mengamati kalimatnya.',
      harga:
        'Harga teh tidak tercantum di cerita, dan bukan itu yang ingin kita pahami. Pilih pertanyaan tentang kalimat dan keseimbangan.',
      neraca:
        'Membuat neraca menarik, tetapi fokus kita adalah apa yang diceritakan neraca tentang kalimat matematika.',
      huruf:
        'Huruf apa pun boleh dipakai sebagai variabel. Yang lebih penting: bagaimana huruf itu memengaruhi benar-salahnya kalimat.',
    },
    hipotesisLabel:
      'Tulis dugaan sementaramu (hipotesis): kapan kalimat x + 2 = 5 bernilai benar, dan apa bedanya dengan 3 + 4 = 8?',
    hipotesisPlaceholder: 'Contoh: menurutku x + 2 = 5 benar jika …, sedangkan 3 + 4 = 8 …',
    nextLabel: 'Lanjut: Lab Neraca →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — DATA COLLECTION: LAB NERACA
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Mengumpulkan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Menulis kalimat matematika untuk empat neraca seimbang, lalu menguji beberapa nilai x dan mencatat hasilnya.',
    guru: 'Murid bergantian: satu menulis kalimat dan memilih nilai x, yang lain memprediksi arah neraca sebelum tombol "Uji" ditekan. Dorong murid sengaja mencoba nilai yang salah agar tabel memuat data "salah" dan "benar".',
    pengantar:
      'Setiap kotak oranye berisi barang yang beratnya belum diketahui, yaitu x kg. Setiap beban ungu beratnya 1 kg. Pada cerita, keempat neraca dalam keadaan seimbang.',
    tips: [
      'Ruas kiri = isi piring kiri, ruas kanan = isi piring kanan. Neraca seimbang ditulis dengan tanda =.',
      'Dua kotak x ditulis 2x; kotak dan beban dihubungkan dengan tanda +.',
      'Ujilah beberapa nilai x, bukan hanya satu. Perhatikan kapan neraca seimbang dan kapan miring.',
    ],
    lab: {
      huruf: 'x',
      batas: 10,
      situasi: [
        {
          id: 'sTeh',
          judul: 'Teh celup',
          cerita:
            'Piring kiri: 1 kotak teh (x kg) dan 2 beban 1 kg. Piring kanan: 5 beban 1 kg. Neraca seimbang.',
          kiri: { x: 1, lepas: 2 },
          kanan: { lepas: 5 },
        },
        {
          id: 'sGula',
          judul: 'Kantong gula',
          cerita:
            'Piring kiri: 2 kantong gula yang sama (masing-masing x kg) dan 1 beban 1 kg. Piring kanan: 9 beban 1 kg. Neraca seimbang.',
          kiri: { x: 2, lepas: 1 },
          kanan: { lepas: 9 },
        },
        {
          id: 'sKopi',
          judul: 'Kopi bubuk',
          cerita:
            'Piring kiri: 3 bungkus kopi yang sama (masing-masing x kg). Piring kanan: 1 bungkus kopi yang sama dan 6 beban 1 kg. Neraca seimbang.',
          kiri: { x: 3 },
          kanan: { x: 1, lepas: 6 },
        },
        {
          id: 'sBeras',
          judul: 'Kantong beras',
          cerita:
            'Piring kiri: 2 kantong beras yang sama (masing-masing x kg) dan 3 beban 1 kg. Piring kanan: 1 kantong beras yang sama dan 8 beban 1 kg. Neraca seimbang.',
          kiri: { x: 2, lepas: 3 },
          kanan: { x: 1, lepas: 8 },
        },
      ],
    },
    selesaiTeks:
      'Keempat neraca sudah ditulis kalimatnya dan diuji. Amati tabel: apakah setiap kalimat selalu benar? Untuk nilai x berapa ia benar?',
    nextLabel: 'Lanjut: Olah Data Kalimat Terbuka →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — DATA PROCESSING: PERNYATAAN & KALIMAT TERBUKA
     ---------------------------------------------------------- */
  olahKalimat: {
    kicker: 'Tahap 4a · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan perbedaan pernyataan dan kalimat terbuka dari tabel pengamatan.',
    guru: 'Tunjuk satu baris tabel: "Kalimatnya sama, mengapa kadang benar kadang salah?" Tekankan bahwa pernyataan yang salah tetap pernyataan — yang membedakan adalah ada tidaknya variabel.',
    judul: 'Kalimat yang sama, nilai x berbeda',
    pengantar:
      'Lihat kembali tabel Lab Neraca. Setiap kalimat diuji dengan beberapa nilai x. Apa yang kamu perhatikan?',
    temuan: [
      {
        id: 'tkBerubah',
        tanya: 'Kalimat x + 2 = 5 diuji dengan beberapa nilai x. Bagaimana nilai kebenarannya?',
        opsi: [
          { id: 'berubah', label: 'Benar untuk x = 3, salah untuk nilai x lainnya' },
          { id: 'selaluBenar', label: 'Selalu benar untuk semua nilai x' },
          { id: 'selaluSalah', label: 'Selalu salah karena memuat huruf' },
          { id: 'tidakBisa', label: 'Tidak dapat diuji karena x bukan bilangan' },
        ],
        correct: 'berubah',
        umpan: {
          berubah:
            'Tepat! Nilai kebenarannya bergantung pada bilangan pengganti x. Hanya x = 3 yang membuat neraca seimbang.',
          selaluBenar:
            'Lihat tabelmu: x = 2 atau x = 4 membuat neraca miring, jadi kalimatnya salah untuk nilai itu.',
          selaluSalah: 'Coba ingat: saat x diganti 3, neraca seimbang dan kalimatnya benar.',
          tidakBisa:
            'x mewakili sebuah bilangan, jadi dapat diganti bilangan lalu diuji — seperti di Lab Neraca.',
        },
      },
      {
        id: 'tkMengapa',
        tanya: 'Mengapa x + 2 = 5 belum dapat dinilai benar atau salah sebelum x diganti bilangan?',
        opsi: [
          { id: 'variabel', label: 'Karena memuat variabel x yang nilainya belum ditentukan' },
          { id: 'tanda', label: 'Karena memakai tanda =' },
          { id: 'pendek', label: 'Karena kalimatnya terlalu pendek' },
          { id: 'besar', label: 'Karena bilangan 5 terlalu besar' },
        ],
        correct: 'variabel',
        umpan: {
          variabel:
            'Tepat! Kalimat yang memuat variabel sehingga benar-salahnya belum dapat ditentukan disebut kalimat terbuka.',
          tanda:
            'Kalimat 3 + 4 = 7 juga memakai tanda =, tetapi sudah pasti benar. Bedanya ada pada x.',
          pendek:
            'Panjang kalimat tidak berpengaruh. Yang berpengaruh adalah huruf x yang belum diketahui nilainya.',
          besar: 'Bilangan 5 tidak masalah. Masalahnya, nilai x belum ditentukan.',
        },
      },
      {
        id: 'tkPasti',
        tanya: 'Bagaimana dengan kalimat 3 + 4 = 8 di papan kelas?',
        opsi: [
          {
            id: 'pastiSalah',
            label: 'Sudah pasti salah karena tidak ada variabel — ia pernyataan',
          },
          { id: 'terbuka', label: 'Belum dapat ditentukan, sama seperti x + 2 = 5' },
          { id: 'bukan', label: 'Bukan kalimat matematika karena isinya salah' },
          { id: 'benar', label: 'Benar, karena memakai tanda =' },
        ],
        correct: 'pastiSalah',
        umpan: {
          pastiSalah:
            'Tepat! Kalimat yang sudah pasti benar atau salah disebut pernyataan. Pernyataan yang salah tetap pernyataan.',
          terbuka: 'Pada 3 + 4 = 8 tidak ada variabel yang perlu diganti. Hitung saja: 3 + 4 = 7.',
          bukan:
            'Kalimat yang salah tetap kalimat. Justru karena kita dapat memastikan salahnya, ia disebut pernyataan.',
          benar: 'Memakai tanda = tidak membuat kalimat benar. Hitung: 3 + 4 = 7, bukan 8.',
        },
      },
    ],
    pilah: {
      skema: 'kebenaran',
      judul: 'Pilah kalimat',
      pengantar: 'Pernyataan benar, pernyataan salah, atau kalimat terbuka?',
      kategori: [
        { id: 'benar', label: 'Pernyataan benar' },
        { id: 'salah', label: 'Pernyataan salah' },
        { id: 'terbuka', label: 'Kalimat terbuka' },
      ],
      butir: [
        {
          id: 'pk1',
          kalimat: '12 − 5 = 7',
          correct: 'benar',
          explanation: 'Tanpa variabel dan 12 − 5 memang 7, jadi ini pernyataan yang benar.',
        },
        {
          id: 'pk2',
          kalimat: '2 × 6 = 15',
          correct: 'salah',
          explanation: '2 × 6 = 12, bukan 15. Tanpa variabel, jadi ini pernyataan yang salah.',
        },
        {
          id: 'pk3',
          kalimat: 'n + 4 = 10',
          correct: 'terbuka',
          explanation:
            'Memuat variabel n. Benar jika n = 6 dan salah untuk nilai lain, jadi ini kalimat terbuka.',
        },
        {
          id: 'pk4',
          kalimat: '9 > 12',
          correct: 'salah',
          explanation:
            '9 tidak lebih dari 12. Kalimat ini sudah pasti salah, jadi pernyataan salah.',
        },
        {
          id: 'pk5',
          kalimat: 'p − 3 < 8',
          correct: 'terbuka',
          explanation:
            'Memuat variabel p, jadi benar-salahnya bergantung pada nilai p: kalimat terbuka.',
        },
        {
          id: 'pk6',
          kalimat: '4 + 4 = 8',
          correct: 'benar',
          explanation: 'Tanpa variabel dan 4 + 4 memang 8: pernyataan yang benar.',
        },
      ],
    },
    langkah: [
      {
        id: 'lk1',
        label:
          'Ganti n dengan sebuah bilangan agar kalimat n + 4 = 10 menjadi pernyataan BENAR. n = …',
        cek: { kalimat: 'n + 4 = 10', minta: 'penyelesaian' },
        placeholder: 'mis. 5',
        hints: [
          'Bilangan berapa yang jika ditambah 4 hasilnya 10?',
          'Uji tebakanmu: ganti n dengan tebakanmu, lalu hitung ruas kiri.',
        ],
        temuan:
          'n = 6 membuat 6 + 4 = 10 bernilai benar. Pengganti lain, mis. n = 5, membuat kalimatnya salah.',
      },
      {
        id: 'lk2',
        label:
          'Ganti k dengan sebuah bilangan agar kalimat k − 3 = 9 menjadi pernyataan BENAR. k = …',
        cek: { kalimat: 'k − 3 = 9', minta: 'penyelesaian' },
        placeholder: 'mis. 5',
        hints: [
          'Bilangan berapa yang jika dikurangi 3 hasilnya 9?',
          'Uji tebakanmu: ganti k dengan tebakanmu, lalu hitung ruas kiri.',
        ],
        temuan:
          'k = 12 membuat 12 − 3 = 9 bernilai benar. Kalimat terbuka berubah menjadi pernyataan.',
      },
    ],
    ringkasan:
      'Pernyataan adalah kalimat yang sudah pasti benar atau salah (tidak memuat variabel). Kalimat terbuka memuat variabel, sehingga benar-salahnya bergantung pada nilai pengganti variabel. Setelah variabel diganti bilangan, kalimat terbuka menjadi pernyataan.',
    nextLabel: 'Lanjut: Olah Data Persamaan →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — DATA PROCESSING: PERSAMAAN
     ---------------------------------------------------------- */
  olahPersamaan: {
    kicker: 'Tahap 4b · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan bahwa persamaan adalah kalimat terbuka bertanda "=", seperti neraca yang seimbang.',
    guru: 'Bandingkan ketiga kartu. Tanyakan: "Kalimat mana yang menggambarkan neraca seimbang? Mana yang menggambarkan neraca miring? Mana yang hanya isi satu piring?"',
    judul: 'Tanda "=" dan neraca seimbang',
    pengantar:
      'Semua kalimat di Lab Neraca memakai tanda "=" karena kedua piring sama berat. Bandingkan dengan kalimat lain di bawah ini.',
    kartu: [
      {
        kalimat: '2x + 1 = 9',
        keterangan: 'Neraca seimbang: berat kedua piring sama.',
        neraca: { kiri: { x: 2, lepas: 1 }, kanan: { lepas: 9 } },
      },
      {
        kalimat: '2x + 1 < 9',
        keterangan: 'Piring kiri lebih ringan daripada piring kanan.',
        neraca: { kiri: { x: 2, lepas: 1 }, kanan: { lepas: 9 } },
        x: 3,
      },
      {
        kalimat: '2x + 1',
        keterangan: 'Hanya isi piring kiri — tidak dibandingkan dengan apa pun.',
      },
    ],
    temuan: [
      {
        id: 'tpTanda',
        tanya: 'Neraca yang seimbang dimodelkan dengan tanda apa?',
        opsi: [
          { id: 'sama', label: 'Tanda sama dengan (=)' },
          { id: 'kurang', label: 'Tanda kurang dari (<)' },
          { id: 'tidakSama', label: 'Tanda tidak sama dengan (≠)' },
          { id: 'tanpa', label: 'Tanpa tanda, cukup ditulis 2x + 1' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Tepat! Ruas kiri dan ruas kanan sama nilainya, seperti kedua piring yang sama berat.',
          kurang: 'Tanda < menggambarkan piring kiri yang lebih ringan, bukan neraca seimbang.',
          tidakSama: 'Tanda ≠ berarti kedua ruas TIDAK sama — kebalikan dari seimbang.',
          tanpa:
            '2x + 1 hanya menggambarkan isi satu piring. Kita perlu tanda untuk membandingkan dua piring.',
        },
      },
      {
        id: 'tpBeda',
        tanya: 'Apa beda 2x + 1 = 9 dengan 2x + 1 < 9?',
        opsi: [
          {
            id: 'tanda',
            label: 'Keduanya kalimat terbuka, tetapi hanya yang bertanda "=" disebut persamaan',
          },
          { id: 'keduanya', label: 'Keduanya persamaan karena memuat variabel' },
          { id: 'pernyataan', label: 'Kalimat bertanda < adalah pernyataan' },
          { id: 'tidakAda', label: 'Tidak ada bedanya' },
        ],
        correct: 'tanda',
        umpan: {
          tanda: 'Tepat! Persamaan adalah kalimat terbuka yang memakai tanda "=".',
          keduanya:
            'Memuat variabel membuat keduanya kalimat terbuka. Tetapi persamaan harus memakai tanda "=".',
          pernyataan:
            '2x + 1 < 9 masih memuat variabel x, jadi benar-salahnya bergantung pada x. Itu kalimat terbuka, bukan pernyataan.',
          tidakAda: 'Perhatikan tandanya: = dan < menggambarkan keadaan neraca yang berbeda.',
        },
      },
      {
        id: 'tpBentuk',
        tanya: 'Apakah 2x + 1 (tanpa tanda hubung) dapat dinilai benar atau salah?',
        opsi: [
          {
            id: 'tidak',
            label: 'Tidak — itu bentuk aljabar, belum kalimat, karena tidak ada tanda hubung',
          },
          { id: 'benar', label: 'Ya, selalu benar' },
          { id: 'salah', label: 'Ya, selalu salah' },
          { id: 'persamaan', label: 'Ya, karena ia persamaan' },
        ],
        correct: 'tidak',
        umpan: {
          tidak:
            'Tepat! Tanpa =, <, >, atau ≠, tidak ada yang dibandingkan. 2x + 1 adalah bentuk aljabar.',
          benar: 'Benar terhadap apa? Tidak ada ruas kedua yang dibandingkan dengan 2x + 1.',
          salah: 'Salah terhadap apa? Tidak ada ruas kedua yang dibandingkan dengan 2x + 1.',
          persamaan: 'Persamaan memerlukan tanda "=". Pada 2x + 1 tidak ada tanda itu.',
        },
      },
    ],
    pilah: {
      skema: 'persamaan',
      judul: 'Persamaan atau bukan?',
      pengantar: 'Pilih jenis setiap kalimat.',
      kategori: [
        { id: 'persamaan', label: 'Persamaan' },
        { id: 'kalimatTerbuka', label: 'Kalimat terbuka, bukan persamaan' },
        { id: 'pernyataan', label: 'Pernyataan' },
        { id: 'bentuk', label: 'Bentuk aljabar (belum kalimat)' },
      ],
      butir: [
        {
          id: 'pp1',
          kalimat: 'a + 7 = 12',
          correct: 'persamaan',
          explanation: 'Memuat variabel a dan tanda "=": persamaan.',
        },
        {
          id: 'pp2',
          kalimat: 'y − 2 > 5',
          correct: 'kalimatTerbuka',
          explanation:
            'Memuat variabel, tetapi tandanya ">" — kalimat terbuka yang bukan persamaan.',
        },
        {
          id: 'pp3',
          kalimat: '3m + 4',
          correct: 'bentuk',
          explanation: 'Tidak ada tanda hubung, jadi belum kalimat. Ini bentuk aljabar.',
        },
        {
          id: 'pp4',
          kalimat: '8 + 2 = 10',
          correct: 'pernyataan',
          explanation:
            'Bertanda "=", tetapi tanpa variabel dan sudah pasti benar: pernyataan, bukan persamaan.',
        },
        {
          id: 'pp5',
          kalimat: '5 = 2p − 1',
          correct: 'persamaan',
          explanation: 'Variabel boleh di ruas kanan. Ada variabel p dan tanda "=": persamaan.',
        },
        {
          id: 'pp6',
          kalimat: 'q ≠ 3',
          correct: 'kalimatTerbuka',
          explanation:
            'Memuat variabel, tetapi tandanya "≠", bukan "=": kalimat terbuka, bukan persamaan.',
        },
      ],
    },
    langkah: [
      {
        id: 'lp1',
        label:
          'Umur Dimas ditambah 4 tahun sama dengan 17 tahun. Misalkan umur Dimas a tahun. Tulis persamaannya.',
        cek: { kalimat: 'a + 4 = 17', minta: 'kalimat' },
        placeholder: 'mis. a + 1 = 9',
        hints: ['"Umur Dimas ditambah 4" menjadi ruas kiri. "Sama dengan 17" menjadi = 17.'],
        temuan:
          'a + 4 = 17 adalah persamaan: kalimat terbuka dengan tanda =, seperti neraca seimbang.',
      },
      {
        id: 'lp2',
        label: 'Nilai a berapa yang membuat a + 4 = 17 bernilai benar? a = …',
        cek: { kalimat: 'a + 4 = 17', minta: 'penyelesaian' },
        placeholder: 'mis. 10',
        hints: ['Bilangan berapa yang jika ditambah 4 hasilnya 17?'],
        temuan:
          'a = 13, karena 13 + 4 = 17. Nilai yang membuat persamaan benar disebut penyelesaian: umur Dimas 13 tahun.',
      },
    ],
    ringkasan:
      'Persamaan adalah kalimat terbuka yang memakai tanda "=" — seperti neraca yang seimbang. Kalimat terbuka dengan tanda <, >, atau ≠ bukan persamaan, dan bentuk aljabar tanpa tanda hubung belum merupakan kalimat. Nilai variabel yang membuat persamaan benar disebut penyelesaian.',
    nextLabel: 'Lanjut: Olah Data PLSV →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — DATA PROCESSING: PLSV
     ---------------------------------------------------------- */
  olahPlsv: {
    kicker: 'Tahap 4c · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan ciri persamaan linear satu variabel (PLSV) dan membedakannya dari persamaan lain.',
    guru: 'Tuliskan x + y = 10 dan x² = 9 di papan. Tanyakan: "Apa yang berbeda dari persamaan-persamaan neraca kita?" Ajak murid mencari pasangan (x, y) yang memenuhi x + y = 10 untuk menunjukkan bahwa ada dua nilai yang belum diketahui.',
    judul: 'Persamaan dari Lab Neraca',
    pengantar:
      'Persamaan-persamaan dari Lab Neraca punya ciri yang sama. Persamaan seperti itu disebut persamaan linear satu variabel (PLSV).',
    temuan: [
      {
        id: 'tvBanyak',
        tanya: 'Persamaan-persamaan di Lab Neraca memuat berapa variabel?',
        opsi: [
          { id: 'satu', label: 'Satu variabel saja, yaitu x' },
          { id: 'dua', label: 'Dua variabel' },
          { id: 'suku', label: 'Sebanyak suku yang memuat x' },
          { id: 'nol', label: 'Tidak ada variabel' },
        ],
        correct: 'satu',
        umpan: {
          satu: 'Tepat! Meskipun x muncul di kedua ruas (mis. 3x = x + 6), variabelnya tetap satu: x.',
          dua: 'Hanya ada huruf x. Huruf yang sama dihitung satu variabel.',
          suku: '3x = x + 6 memuat dua suku ber-x, tetapi hurufnya sama — tetap satu variabel.',
          nol: 'Huruf x adalah variabel yang mewakili berat kotak.',
        },
      },
      {
        id: 'tvPangkat',
        tanya: 'Berapa pangkat variabel x pada persamaan-persamaan itu?',
        opsi: [
          { id: 'satu', label: 'Pangkat satu (ditulis x, bukan x² atau x³)' },
          { id: 'dua', label: 'Pangkat dua' },
          { id: 'koef', label: 'Sama dengan koefisiennya' },
          { id: 'nol', label: 'Pangkat nol' },
        ],
        correct: 'satu',
        umpan: {
          satu: 'Tepat! Variabel berpangkat satu inilah yang disebut LINEAR.',
          dua: 'x² berarti x × x. Di Lab Neraca kita hanya menjumlahkan kotak, tidak mengalikan x dengan x.',
          koef: '2x berarti 2 × x. Bilangan 2 adalah koefisien, bukan pangkat. Pangkat x tetap satu.',
          nol: 'x ditulis tanpa angka pangkat, artinya x¹ — pangkat satu.',
        },
      },
      {
        id: 'tvDua',
        tanya: 'Mengapa x + y = 10 bukan PLSV?',
        opsi: [
          { id: 'duaVar', label: 'Karena memuat dua variabel, x dan y' },
          { id: 'tanda', label: 'Karena tidak memakai tanda =' },
          { id: 'pangkat', label: 'Karena variabelnya berpangkat dua' },
          { id: 'pernyataan', label: 'Karena ia pernyataan' },
        ],
        correct: 'duaVar',
        umpan: {
          duaVar:
            'Tepat! Persamaan ini punya dua nilai yang belum diketahui (mis. 3 dan 7, atau 4 dan 6).',
          tanda:
            'x + y = 10 memakai tanda =, jadi ia persamaan. Masalahnya ada pada banyak variabelnya.',
          pangkat: 'x dan y berpangkat satu. Hitunglah banyak hurufnya.',
          pernyataan: 'Ada variabel, jadi ia kalimat terbuka — bukan pernyataan.',
        },
      },
      {
        id: 'tvKuadrat',
        tanya: 'Mengapa x² = 9 bukan PLSV?',
        opsi: [
          { id: 'pangkat', label: 'Karena variabelnya berpangkat dua, jadi tidak linear' },
          { id: 'duaVar', label: 'Karena memuat dua variabel' },
          { id: 'tanda', label: 'Karena tidak memakai tanda =' },
          { id: 'besar', label: 'Karena 9 terlalu besar' },
        ],
        correct: 'pangkat',
        umpan: {
          pangkat:
            'Tepat! x² = x × x. PLSV hanya memuat variabel berpangkat satu (dan memang x² = 9 punya dua penyelesaian: 3 dan −3).',
          duaVar: 'Hanya ada satu huruf, x. Perhatikan angka kecil di atas x.',
          tanda: 'x² = 9 memakai tanda =, jadi ia persamaan. Perhatikan pangkat x.',
          besar: 'Besar bilangan tidak berpengaruh. Perhatikan pangkat x.',
        },
      },
    ],
    pilah: {
      skema: 'plsv',
      judul: 'PLSV atau bukan?',
      pengantar: 'Periksa tiga ciri: tanda "=", satu variabel, pangkat satu.',
      kategori: [
        { id: 'plsv', label: 'PLSV' },
        { id: 'duaVariabel', label: 'Bukan PLSV: lebih dari satu variabel' },
        { id: 'pangkatDua', label: 'Bukan PLSV: variabel berpangkat dua' },
        { id: 'bukanPersamaan', label: 'Bukan PLSV: bukan persamaan' },
      ],
      butir: [
        {
          id: 'pv1',
          kalimat: '4t − 1 = 11',
          correct: 'plsv',
          explanation: 'Tanda "=", satu variabel t, berpangkat satu: PLSV.',
        },
        {
          id: 'pv2',
          kalimat: 'a + b = 9',
          correct: 'duaVariabel',
          explanation: 'Ada dua variabel, a dan b, jadi bukan persamaan linear SATU variabel.',
        },
        {
          id: 'pv3',
          kalimat: 'k² + 1 = 10',
          correct: 'pangkatDua',
          explanation: 'k berpangkat dua, jadi tidak linear.',
        },
        {
          id: 'pv4',
          kalimat: '2m + 3 > 7',
          correct: 'bukanPersamaan',
          explanation: 'Tandanya ">", bukan "=". Ini kalimat terbuka, bukan persamaan.',
        },
        {
          id: 'pv5',
          kalimat: '7 = 3 + r',
          correct: 'plsv',
          explanation:
            'Variabel r di ruas kanan tidak masalah: satu variabel, pangkat satu, tanda "=".',
        },
        {
          id: 'pv6',
          kalimat: 'p + 2q = 8',
          correct: 'duaVariabel',
          explanation: 'Ada dua variabel, p dan q.',
        },
      ],
    },
    langkah: [
      {
        id: 'lv1',
        label:
          'Harga 3 buku tulis yang sama ditambah sebuah pensil seharga Rp2 ribu adalah Rp17 ribu. Misalkan harga sebuah buku tulis b ribu rupiah. Tulis PLSV-nya.',
        cek: { kalimat: '3b + 2 = 17', minta: 'kalimat' },
        placeholder: 'mis. 2b + 1 = 9',
        hints: [
          'Harga 3 buku tulis = 3 × b = 3b.',
          'Ruas kiri: harga 3 buku ditambah harga pensil. Ruas kanan: total harganya.',
        ],
        temuan: '3b + 2 = 17 adalah PLSV: ada tanda =, satu variabel b, dan b berpangkat satu.',
      },
      {
        id: 'lv2',
        label: 'Berapa harga sebuah buku tulis? Tentukan b yang membuat 3b + 2 = 17 benar. b = …',
        cek: { kalimat: '3b + 2 = 17', minta: 'penyelesaian' },
        placeholder: 'mis. 4',
        hints: [
          'Harga 3 buku saja berapa? Kurangi dulu harga pensilnya: 17 − 2.',
          'Lalu satu buku = harga 3 buku dibagi 3. Ujilah jawabanmu dengan substitusi.',
        ],
        temuan:
          'b = 5, karena 3 × 5 + 2 = 17. Harga sebuah buku tulis Rp5 ribu — penyelesaian PLSV menjawab masalah sehari-hari.',
      },
    ],
    ringkasan:
      'Persamaan linear satu variabel (PLSV) adalah persamaan yang memuat tepat satu variabel dan variabel itu berpangkat satu. Persamaan dengan dua variabel (x + y = 10) atau variabel berpangkat dua (x² = 9) bukan PLSV.',
    nextLabel: 'Lanjut: Verifikasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — VERIFICATION
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Verifikasi',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji temuan pada kalimat-kalimat baru dan membandingkannya dengan dugaan awal.',
    guru: 'Pada bagian B, minta murid memberi contoh pendukung atau contoh penyangkal untuk setiap pernyataan sebelum memilih.',
    judulA: 'A. Termasuk jenis apakah kalimat ini?',
    pengantarA:
      'Periksa berurutan: adakah tanda hubung? adakah variabel? tandanya "="? berapa variabel dan pangkatnya?',
    kategori: [
      { id: 'pernyataan', label: 'Pernyataan' },
      { id: 'kalimatTerbuka', label: 'Kalimat terbuka, bukan persamaan' },
      { id: 'persamaan', label: 'Persamaan, bukan PLSV' },
      { id: 'plsv', label: 'PLSV' },
      { id: 'bentuk', label: 'Bentuk aljabar (belum kalimat)' },
    ],
    bagian: [
      {
        id: 'vb1',
        kalimat: '6 + 9 = 14',
        correct: 'pernyataan',
        explanation: 'Tanpa variabel; 6 + 9 = 15, jadi kalimat ini pernyataan yang salah.',
      },
      {
        id: 'vb2',
        kalimat: '20 − 8 = 12',
        correct: 'pernyataan',
        explanation: 'Tanpa variabel dan sudah pasti benar: pernyataan.',
      },
      {
        id: 'vb3',
        kalimat: 'r + 5 < 12',
        konteks: 'Berat tas Rina (r kg) ditambah 5 kg kurang dari 12 kg.',
        correct: 'kalimatTerbuka',
        explanation: 'Memuat variabel r dengan tanda "<": kalimat terbuka, bukan persamaan.',
      },
      {
        id: 'vb4',
        kalimat: '2a + 3b = 12',
        correct: 'persamaan',
        explanation: 'Bertanda "=" tetapi memuat dua variabel (a dan b), jadi bukan PLSV.',
      },
      {
        id: 'vb5',
        kalimat: 'n² − 1 = 8',
        correct: 'persamaan',
        explanation: 'Bertanda "=" tetapi n berpangkat dua, jadi bukan PLSV.',
      },
      {
        id: 'vb6',
        kalimat: '5h − 4 = 16',
        konteks:
          '5 kotak donat (h donat per kotak) dikurangi 4 donat yang dimakan menyisakan 16 donat.',
        correct: 'plsv',
        explanation: 'Tanda "=", satu variabel h, berpangkat satu: PLSV.',
      },
      {
        id: 'vb7',
        kalimat: '9 = 2w + 1',
        correct: 'plsv',
        explanation: 'Variabel w di ruas kanan, berpangkat satu, dan bertanda "=": PLSV.',
      },
      {
        id: 'vb8',
        kalimat: '7c + 2',
        correct: 'bentuk',
        explanation: 'Tidak ada tanda hubung, jadi belum kalimat. Ini bentuk aljabar.',
      },
      {
        id: 'vb9',
        kalimat: 'z ≠ 0',
        correct: 'kalimatTerbuka',
        explanation: 'Memuat variabel z dengan tanda "≠": kalimat terbuka, bukan persamaan.',
      },
    ],
    judulB: 'B. Selalu benar, kadang-kadang benar, atau salah?',
    opsiPernyataan: [
      { id: 'selalu', label: 'Selalu benar' },
      { id: 'kadang', label: 'Kadang-kadang benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'vp1',
        teks: 'Setiap persamaan adalah kalimat terbuka.',
        correct: 'selalu',
        explanation:
          'Persamaan adalah kalimat terbuka yang bertanda "=", jadi setiap persamaan pasti kalimat terbuka.',
      },
      {
        id: 'vp2',
        teks: 'Setiap kalimat terbuka adalah persamaan.',
        correct: 'kadang',
        explanation:
          'Hanya kalimat terbuka bertanda "=" yang merupakan persamaan. Contoh penyangkal: x + 3 > 7.',
      },
      {
        id: 'vp3',
        teks: 'Kalimat yang bernilai salah bukan pernyataan.',
        correct: 'salah',
        explanation:
          'Pernyataan boleh bernilai salah, mis. 6 + 9 = 14. Yang penting nilainya sudah pasti.',
      },
      {
        id: 'vp4',
        teks: 'Persamaan yang memuat variabel berpangkat dua adalah PLSV.',
        correct: 'salah',
        explanation: 'PLSV hanya memuat variabel berpangkat satu. n² − 1 = 8 bukan PLSV.',
      },
      {
        id: 'vp5',
        teks: 'Jika variabel pada sebuah kalimat terbuka diganti bilangan, hasilnya pernyataan yang benar.',
        correct: 'kadang',
        explanation:
          'Hasilnya selalu pernyataan, tetapi bisa benar atau salah. Untuk x + 2 = 5, x = 3 menghasilkan pernyataan benar; x = 4 menghasilkan pernyataan salah.',
      },
      {
        id: 'vp6',
        teks: 'x = 4 adalah penyelesaian 2x + 1 = 9, karena 2 × 4 + 1 = 9.',
        correct: 'selalu',
        explanation:
          'Substitusi x = 4 membuat kedua ruas sama (9 = 9), jadi 4 memang penyelesaiannya.',
      },
    ],
    judulC: 'C. Bandingkan dengan dugaan awalmu',
    nextLabel: 'Lanjut: Generalisasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — GENERALIZATION
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Generalisasi',
    syntax: DL + ' · Sintaks 6',
    goal: 'Menyusun definisi pernyataan, kalimat terbuka, persamaan, PLSV, dan penyelesaian berdasarkan temuan.',
    guru: 'Minta setiap pasangan membacakan satu definisi beserta contoh dari Lab Neraca sebelum memeriksa.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari bank kalimat. Setiap potongan hanya dipakai satu kali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'gPern', awal: 'Pernyataan adalah', correct: 'b1' },
      { id: 'gTerbuka', awal: 'Kalimat terbuka adalah', correct: 'b2' },
      { id: 'gPers', awal: 'Persamaan adalah', correct: 'b3' },
      { id: 'gPlsv', awal: 'Persamaan linear satu variabel (PLSV) adalah', correct: 'b4' },
      { id: 'gSelesai', awal: 'Penyelesaian persamaan adalah', correct: 'b5' },
    ],
    bank: [
      { id: 'b1', teks: 'kalimat yang sudah dapat ditentukan benar atau salahnya.' },
      {
        id: 'b2',
        teks: 'kalimat yang memuat variabel, sehingga benar-salahnya bergantung pada nilai pengganti variabel.',
      },
      { id: 'b3', teks: 'kalimat terbuka yang memakai tanda sama dengan (=).' },
      {
        id: 'b4',
        teks: 'persamaan yang memuat tepat satu variabel dan variabel itu berpangkat satu.',
      },
      {
        id: 'b5',
        teks: 'nilai pengganti variabel yang membuat persamaan menjadi pernyataan yang benar.',
      },
      { id: 'b6', teks: 'kalimat yang selalu bernilai benar.' },
      { id: 'b7', teks: 'bentuk aljabar yang tidak memakai tanda hubung apa pun.' },
      { id: 'b8', teks: 'persamaan yang variabelnya boleh berpangkat dua.' },
    ],
    contoh: '2x + 3 = x + 8',
    rangkuman: [
      '<strong>2x + 3 = x + 8</strong> memuat variabel x, jadi ia <strong>kalimat terbuka</strong>; karena bertanda "=", ia juga <strong>persamaan</strong>.',
      'Variabelnya hanya x dan berpangkat satu, jadi ia <strong>PLSV</strong> (neraca kantong beras di Lab Neraca).',
      'Jika x diganti 4: ruas kiri 2 × 4 + 3 = 11, ruas kanan 4 + 8 = 12 → pernyataan <strong>salah</strong>.',
      'Jika x diganti 5: ruas kiri 2 × 5 + 3 = 13, ruas kanan 5 + 8 = 13 → pernyataan <strong>benar</strong>. Jadi penyelesaiannya <strong>x = 5</strong>.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Bank 16 soal; diambil acak sesuai komposisi.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    goal: 'Menerapkan temuan untuk mengenali jenis kalimat, menulis PLSV dari situasi sehari-hari, dan menentukan penyelesaiannya.',
    guru: 'Murid mengerjakan mandiri. Pesan salah berupa diagnosa miskonsepsi beserta cek substitusi; minta murid membacanya sebelum mencoba lagi.',
    instruksi:
      'Jawab setiap soal. Penyelesaian boleh ditulis 4 atau x = 4; tanda negatif boleh diketik sebagai minus biasa (-). Jika keliru, baca pesannya lalu coba lagi.',
    banyak: 8,
    komposisi: { input: 4, choice: 4 },
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: 'simbol',
        cerita: 'Perhatikan kalimat terbuka p + 6 = 15.',
        pertanyaan: 'Bilangan berapa pengganti p yang membuat kalimat itu benar?',
        cek: { kalimat: 'p + 6 = 15', minta: 'penyelesaian' },
        hints: ['Bilangan berapa yang jika ditambah 6 hasilnya 15?'],
        reveal: 'Jawaban: p = 9.',
        explanation: 'p = 9, karena 9 + 6 = 15.',
      },
      {
        id: 't2',
        type: 'input',
        konteks: 'neraca',
        cerita:
          'Piring kiri berisi 3 kotak x kg dan 1 beban 1 kg; piring kanan berisi 10 beban 1 kg. Neraca seimbang: 3x + 1 = 10.',
        pertanyaan: 'Berapa kg berat satu kotak?',
        cek: { kalimat: '3x + 1 = 10', minta: 'penyelesaian' },
        neraca: { kiri: { x: 3, lepas: 1 }, kanan: { lepas: 10 } },
        hints: [
          'Ambil 1 beban dari kedua piring: 3 kotak seimbang dengan 9 beban.',
          'Bagi 9 beban sama rata ke 3 kotak.',
        ],
        reveal: 'Jawaban: x = 3.',
        explanation: 'x = 3, karena 3 × 3 + 1 = 10.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: 'warung',
        cerita:
          'Uang Nia (n ribu rupiah) dipakai membeli teh seharga Rp7 ribu, sisanya Rp5 ribu. Persamaannya n − 7 = 5.',
        pertanyaan: 'Berapa ribu rupiah uang Nia mula-mula?',
        cek: { kalimat: 'n − 7 = 5', minta: 'penyelesaian' },
        hints: ['Bilangan berapa yang jika dikurangi 7 hasilnya 5?'],
        reveal: 'Jawaban: n = 12.',
        explanation: 'n = 12, karena 12 − 7 = 5. Uang Nia mula-mula Rp12 ribu.',
      },
      {
        id: 't4',
        type: 'input',
        konteks: 'simbol',
        cerita: 'Perhatikan persamaan 2y + 5 = 17.',
        pertanyaan: 'Tentukan penyelesaiannya.',
        cek: { kalimat: '2y + 5 = 17', minta: 'penyelesaian' },
        hints: ['2y + 5 = 17 berarti 2y = 12.', 'Ujilah jawabanmu dengan substitusi.'],
        reveal: 'Jawaban: y = 6.',
        explanation: 'y = 6, karena 2 × 6 + 5 = 17.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: 'warung',
        cerita:
          'Bu Sari menimbang 4 bungkus gula yang sama beratnya. Berat semuanya 12 kg. Misalkan berat sebungkus gula g kg.',
        pertanyaan: 'Tulis PLSV untuk situasi ini.',
        cek: { kalimat: '4g = 12', minta: 'kalimat' },
        hints: ['Berat 4 bungkus = 4 × g = 4g.'],
        reveal: 'Jawaban: 4g = 12.',
        explanation: 'Persamaannya 4g = 12 (penyelesaiannya g = 3).',
      },
      {
        id: 't6',
        type: 'input',
        konteks: 'sekolah',
        cerita:
          'Banyak murid kelas VII A dikurangi 5 murid yang sakit sama dengan 27 murid yang hadir. Misalkan banyak murid kelas VII A adalah m.',
        pertanyaan: 'Tulis PLSV untuk situasi ini.',
        cek: { kalimat: 'm − 5 = 27', minta: 'kalimat' },
        hints: ['"Dikurangi 5" ditulis − 5. "Sama dengan 27" ditulis = 27.'],
        reveal: 'Jawaban: m − 5 = 27.',
        explanation: 'Persamaannya m − 5 = 27 (penyelesaiannya m = 32).',
      },
      {
        id: 't7',
        type: 'input',
        konteks: 'neraca',
        cerita:
          'Piring kiri berisi 2 kotak x kg dan 4 beban 1 kg. Piring kanan berisi 10 beban 1 kg. Neraca seimbang.',
        pertanyaan: 'Tulis kalimat matematika untuk neraca ini.',
        cek: { kalimat: '2x + 4 = 10', minta: 'kalimat' },
        neraca: { kiri: { x: 2, lepas: 4 }, kanan: { lepas: 10 } },
        hints: ['Ruas kiri = isi piring kiri, ruas kanan = isi piring kanan.'],
        reveal: 'Jawaban: 2x + 4 = 10.',
        explanation: 'Kalimatnya 2x + 4 = 10 (penyelesaiannya x = 3).',
      },
      {
        id: 't8',
        type: 'input',
        konteks: 'sekolah',
        cerita:
          'Rani menabung u ribu rupiah setiap hari selama 5 hari. Ditambah tabungan lamanya Rp10 ribu, tabungannya sekarang Rp35 ribu.',
        pertanyaan: 'Tulis PLSV untuk situasi ini.',
        cek: { kalimat: '5u + 10 = 35', minta: 'kalimat' },
        hints: ['Tabungan 5 hari = 5 × u = 5u.'],
        reveal: 'Jawaban: 5u + 10 = 35.',
        explanation: 'Persamaannya 5u + 10 = 35 (penyelesaiannya u = 5).',
      },
      {
        id: 't9',
        type: 'choice',
        konteks: 'simbol',
        cerita: 'Perhatikan kalimat 8 − 3 = 6.',
        pertanyaan: 'Termasuk jenis apakah kalimat ini?',
        cek: { kalimat: '8 − 3 = 6', minta: 'jenis' },
        explanation:
          'Tanpa variabel dan sudah pasti salah (8 − 3 = 5), jadi kalimat ini pernyataan yang salah.',
      },
      {
        id: 't10',
        type: 'choice',
        konteks: 'warung',
        cerita: 'Harga a kg apel dan b kg jeruk: a + 2b = 11 (dalam puluhan ribu rupiah).',
        pertanyaan: 'Termasuk jenis apakah kalimat a + 2b = 11?',
        cek: { kalimat: 'a + 2b = 11', minta: 'jenis' },
        explanation:
          'Bertanda "=", tetapi memuat dua variabel (a dan b), jadi persamaan yang bukan PLSV.',
      },
      {
        id: 't11',
        type: 'choice',
        konteks: 'sekolah',
        cerita: 'Luas lantai persegi yang sisinya y meter adalah 16 m², ditulis y² = 16.',
        pertanyaan: 'Termasuk jenis apakah kalimat y² = 16?',
        cek: { kalimat: 'y² = 16', minta: 'jenis' },
        explanation: 'Bertanda "=", tetapi y berpangkat dua, jadi persamaan yang bukan PLSV.',
      },
      {
        id: 't12',
        type: 'choice',
        konteks: 'sekolah',
        cerita:
          'Nilai ulangan Kiki (k) dikali 3 lalu dikurangi 1 hasilnya lebih dari 8: 3k − 1 > 8.',
        pertanyaan: 'Termasuk jenis apakah kalimat 3k − 1 > 8?',
        cek: { kalimat: '3k − 1 > 8', minta: 'jenis' },
        explanation:
          'Memuat variabel k dengan tanda ">", jadi kalimat terbuka yang bukan persamaan.',
      },
      {
        id: 't13',
        type: 'choice',
        konteks: 'warung',
        cerita: 'Dua bungkus roti yang sama seharga 6 ribu rupiah: 6 = 2d.',
        pertanyaan: 'Termasuk jenis apakah kalimat 6 = 2d?',
        cek: { kalimat: '6 = 2d', minta: 'jenis' },
        explanation: 'Bertanda "=", satu variabel d, berpangkat satu: PLSV.',
      },
      {
        id: 't14',
        type: 'choice',
        konteks: 'simbol',
        cerita: 'Perhatikan kalimat x + 9 = 12.',
        pertanyaan: 'Kalimat ini termasuk …',
        cek: { kalimat: 'x + 9 = 12', minta: 'kebenaran' },
        explanation:
          'Memuat variabel x, jadi benar-salahnya bergantung pada pengganti x (benar hanya jika x = 3): kalimat terbuka.',
      },
      {
        id: 't15',
        type: 'choice',
        konteks: 'simbol',
        cerita: 'Perhatikan persamaan 5t − 2 = 13.',
        pertanyaan: 'Berapakah penyelesaiannya?',
        cek: { kalimat: '5t − 2 = 13', minta: 'penyelesaian' },
        explanation: 't = 3, karena 5 × 3 − 2 = 13.',
      },
      {
        id: 't16',
        type: 'choice',
        konteks: 'warung',
        cerita:
          'Bu Sari menjual 2 kg telur seharga t ribu rupiah per kg dan sebungkus garam Rp6 ribu. Totalnya Rp62 ribu.',
        pertanyaan: 'PLSV manakah yang sesuai dengan cerita?',
        cek: { kalimat: '2t + 6 = 62', minta: 'kalimat' },
        explanation:
          'Persamaannya 2t + 6 = 62: harga 2 kg telur (2t) ditambah garam (6) sama dengan 62.',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    goal: 'Merefleksikan proses penemuan dan tingkat pemahaman diri.',
    guru: 'Ajak beberapa murid membacakan jawaban pertanyaan pertama. Catat miskonsepsi yang masih muncul (mis. "kalimat salah bukan pernyataan") untuk pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan bahasamu perbedaan pernyataan dan kalimat terbuka. Beri satu contoh masing-masing.',
        placeholder: 'Pernyataan adalah …, contohnya …; kalimat terbuka adalah …, contohnya …',
      },
      {
        id: 'r2',
        teks: 'Bagaimana neraca membantumu memahami arti tanda "=" dan penyelesaian persamaan?',
        placeholder: 'Neraca seimbang artinya …, nilai x yang membuat seimbang …',
      },
      {
        id: 'r3',
        teks: 'Tulis satu situasi sehari-hari yang dapat dimodelkan dengan PLSV, lalu tulis persamaannya.',
        placeholder: 'Situasiku: … Misalkan … = x. Persamaannya: …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menjelaskan kalimat terbuka, persamaan, dan PLSV sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — aku bisa menjelaskannya kepada teman' },
      { id: 'yakin', label: '👍 Yakin — sesekali masih perlu melihat contoh' },
      { id: 'ragu', label: '🤔 Masih ragu membedakan persamaan dan PLSV' },
      { id: 'bantuan', label: '🙋 Perlu bantuan guru lagi' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat! Kamu sudah menemukan arti kalimat terbuka, persamaan, dan PLSV.',
    teks: 'Dari neraca di warung Bu Sari, kamu menemukan sendiri bahwa tanda "=" berarti seimbang, dan bahwa penyelesaian adalah nilai yang membuat neraca seimbang.',
    contoh: [
      { kalimat: '3 + 4 = 8', keterangan: 'Kalimat di papan kelas' },
      { kalimat: 'p − 3 < 8', keterangan: 'Kalimat dengan tanda <' },
      { kalimat: 'x + y = 10', keterangan: 'Dua nilai yang belum diketahui' },
      { kalimat: '2x + 1 = 9', keterangan: 'Neraca kantong gula' },
    ],
    capaian: [
      'Membedakan pernyataan (sudah pasti benar atau salah) dengan kalimat terbuka.',
      'Menentukan nilai pengganti yang membuat kalimat terbuka menjadi pernyataan benar dengan bantuan neraca.',
      'Menjelaskan persamaan sebagai kalimat terbuka bertanda "=", seperti neraca seimbang.',
      'Menyebutkan ciri PLSV dan memilah persamaan yang bukan PLSV.',
      'Menulis PLSV dari situasi sehari-hari dan memeriksa penyelesaiannya dengan substitusi.',
    ],
  },
};
