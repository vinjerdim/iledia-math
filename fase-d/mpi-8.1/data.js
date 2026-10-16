'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Hubungan Antar Sudut — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menemukan hubungan sudut berpelurus, berpenyiku, dan bertolak
   belakang melalui pengukuran dan pengamatan pada dua garis yang
   berpotongan.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahPelurus', 'olahTolak'
                                         & 'olahPenyiku'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi    (7')  — "Gunting, Perempatan, dan Bingkai": gunting
                             terbuka dan perempatan jalan sebagai dua
                             garis berpotongan, serta pojok bingkai yang
                             siku-siku dibagi tali hiasan. Satu sudut
                             diketahui; murid MENDUGA besar sudut di
                             seberang dan di sebelahnya (tidak dinilai).
     2. Masalah      (5')  — memilih pertanyaan inti penyelidikan lalu
                             menulis dugaan sementara (hipotesis).
     3. Lab Sudut    (18') — A. dua garis berpotongan: memutar garis CD
                             (seret atau stepper), memasang busur derajat
                             virtual pada ∠1–∠4, MEMBACA besarnya
                             sendiri (isian berdiagnosa salah skala),
                             lalu mencatat minimal tiga posisi.
                             B. dua garis tegak lurus + sinar OE: membaca
                             ∠1 dan ∠2 pada minimal dua posisi.
     4a. Berpelurus  (8')  — dari tabel: ∠1 + ∠2 = ∠2 + ∠3 = … = 180°
                             karena keduanya membentuk garis lurus.
     4b. Bertolak    (8')  — ∠1 = ∠3 dan ∠2 = ∠4; alasannya: keduanya
         belakang            pelurus dari sudut yang sama.
     4c. Berpenyiku  (7')  — dari tabel B: ∠1 + ∠2 = 90°; membedakan
                             penyiku dan pelurus.
     5. Verifikasi   (10') — posisi BARU acak: memprediksi tiga sudut dari
                             satu sudut, lalu membuktikannya dengan busur;
                             memilah pernyataan; membandingkan dugaan
                             awal & hipotesis.
     6. Generalisasi (5')  — menyusun kesimpulan ketiga hubungan dari
                             bank kalimat acak.
     7. Uji terap    (12') — delapan soal diambil acak dari bank enam
                             belas soal (isian berdiagnosa & pilihan
                             ganda berpengecoh miskonsepsi).
     8. Refleksi     (3')  — rekap, refleksi tertulis, penilaian diri.

   Notasi kunci jawaban (`cek`, lihat engine seksi 77):
     { minta: 'jumlah' | 'pelurus' | 'penyiku' | 'tolakBelakang', sudut }
     { minta: 'cari', diketahui: { k, nilai }, ditanya }  (k: 0 = ∠1)
     { minta: 'jenis', mode, pasangan: [i, j] } | { minta: 'jenis', sudut: [a, b] }
     { minta: 'aljabar', relasi, a: [p, q], b: [r, s], tanya: 'x' | 'sudut' }
   Langkah berlabel `lab` memakai data tabel Lab Sudut murid sendiri:
   app.js mengisi `cek.sudut` dan teks label dari baris tabel itu.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Posisi verifikasi dan
   soal uji terap juga diambil acak; opsi pilihan gandanya dibangun
   engine (opsiSoalSudut) lalu diacak.

   Konsistensi kunci jawaban diuji tests/mpi-8.1-data.test.js terhadap
   engine seksi 77.
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  meta: {
    judul: 'Hubungan Antar Sudut',
  },

  tahap: [
    { id: 'stimulasi', label: 'Stimulasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'koleksi', label: 'Lab Sudut' },
    { id: 'olahPelurus', label: 'Berpelurus' },
    { id: 'olahTolak', label: 'Bertolak Belakang' },
    { id: 'olahPenyiku', label: 'Berpenyiku' },
    { id: 'verifikasi', label: 'Verifikasi' },
    { id: 'generalisasi', label: 'Generalisasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Label konteks soal (ikon + nama). */
  konteks: {
    gunting: { ikon: '✂️', nama: 'Gunting' },
    jalan: { ikon: '🛣️', nama: 'Jalan & Rambu' },
    bangunan: { ikon: '🏠', nama: 'Bangunan & Benda' },
    gambar: { ikon: '📐', nama: 'Gambar Geometri' },
    aljabar: { ikon: '🔤', nama: 'Bentuk Aljabar' },
  },

  /* Nama jenis pasangan untuk tampilan. */
  namaJenis: {
    berpelurus: 'Berpelurus',
    berpenyiku: 'Berpenyiku',
    bertolakBelakang: 'Bertolak belakang',
    bukanKeduanya: 'Bukan pasangan istimewa',
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; dibandingkan dengan temuan pada tahap
     Verifikasi. `baku` = jawaban menurut engine bila ada `cek`.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati sudut-sudut pada gunting, perempatan jalan, dan pojok bingkai, lalu menduga besar sudut yang belum diketahui.',
    tp: 'Menemukan hubungan sudut berpelurus, berpenyiku, dan bertolak belakang melalui pengukuran dan pengamatan pada dua garis yang berpotongan.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Mengukur besar sudut dengan busur derajat secara tepat (membaca skala yang benar).',
      'Menunjukkan pasangan sudut berpelurus, berpenyiku, dan bertolak belakang pada dua garis yang berpotongan.',
      'Menemukan dari data pengukuran bahwa sudut berpelurus berjumlah 180°, sudut berpenyiku berjumlah 90°, dan sudut bertolak belakang sama besar.',
      'Menjelaskan mengapa sudut bertolak belakang selalu sama besar.',
      'Menentukan besar sudut yang belum diketahui dengan memakai hubungan antarsudut.',
    ],
    guru: 'Bawa gunting sungguhan bila ada. Buka-tutup gunting di depan kelas dan tanyakan: "Kalau sudut di ujung gunting membesar, apa yang terjadi pada sudut di pegangannya?" Jangan membenarkan dugaan dulu — dugaan yang berbeda-beda menjadi bahan penyelidikan.',
    judul: 'Gunting, Perempatan, dan Bingkai',
    pengantar:
      'Dua bilah gunting yang terbuka dan dua jalan yang bersilangan sama-sama membentuk dua garis yang berpotongan. Pojok bingkai foto membentuk sudut siku-siku. Amati sudut-sudutnya.',
    kartu: [
      {
        id: 'kGunting',
        ikon: '✂️',
        judul: 'Gunting terbuka',
        teks: 'Sudut di antara ujung bilah gunting (∠1) besarnya 50°.',
        gambar: { mode: 'potong', t: 50, label: ['50°', '?', '?', '?'] },
      },
      {
        id: 'kJalan',
        ikon: '🛣️',
        judul: 'Perempatan jalan',
        teks: 'Jalan Melati memotong Jalan Kenanga. Satu sudut di perempatan besarnya 65°.',
        gambar: { mode: 'potong', t: 65, label: ['65°', '?', '?', '?'] },
      },
      {
        id: 'kBingkai',
        ikon: '🖼️',
        judul: 'Pojok bingkai foto',
        teks: 'Pojok bingkai siku-siku (90°) dibagi tali hiasan OE. Satu bagiannya 30°.',
        gambar: { mode: 'siku', t: 30, label: ['30°', '?'] },
      },
    ],
    dugaan: [
      {
        id: 'dSeberang',
        tanya: 'Pada gunting, ∠1 = 50°. Berapa besar ∠3 yang BERHADAPAN dengan ∠1?',
        opsi: [
          { id: 'o50', label: '50°' },
          { id: 'o130', label: '130°' },
          { id: 'o40', label: '40°' },
          { id: 'o310', label: '310°' },
        ],
        baku: 'o50',
        cek: { minta: 'cari', diketahui: { k: 0, nilai: 50 }, ditanya: 2 },
        pembahasan:
          '∠3 = 50°. Sudut yang berhadapan (bertolak belakang) selalu sama besar — kamu mengukurnya sendiri di Lab Sudut.',
      },
      {
        id: 'dSebelah',
        tanya: 'Masih pada gunting itu, berapa besar ∠2 yang BERSEBELAHAN dengan ∠1?',
        opsi: [
          { id: 'o130', label: '130°' },
          { id: 'o50', label: '50°' },
          { id: 'o40', label: '40°' },
          { id: 'o180', label: '180°' },
        ],
        baku: 'o130',
        cek: { minta: 'cari', diketahui: { k: 0, nilai: 50 }, ditanya: 1 },
        pembahasan:
          '∠2 = 130°. ∠1 dan ∠2 bersama-sama membentuk garis lurus, jadi jumlahnya 180° (berpelurus): 180° − 50° = 130°.',
      },
      {
        id: 'dLebar',
        tanya: 'Jika gunting dibuka makin lebar sehingga ∠1 membesar, apa yang terjadi pada ∠3?',
        opsi: [
          { id: 'ikut', label: 'Ikut membesar dan tetap sama dengan ∠1' },
          { id: 'mengecil', label: 'Mengecil' },
          { id: 'tetap', label: 'Tetap, tidak berubah' },
          { id: 'acak', label: 'Berubah tanpa aturan' },
        ],
        baku: 'ikut',
        pembahasan:
          'Di Lab Sudut, setiap kali garis diputar, ∠1 dan ∠3 berubah bersama dan selalu sama besar.',
      },
      {
        id: 'dSiku',
        tanya: 'Pada pojok bingkai, ∠1 = 30°. Berapa besar ∠2, bagian lainnya?',
        opsi: [
          { id: 'o60', label: '60°' },
          { id: 'o150', label: '150°' },
          { id: 'o30', label: '30°' },
          { id: 'o90', label: '90°' },
        ],
        baku: 'o60',
        cek: { minta: 'penyiku', sudut: 30 },
        pembahasan:
          '∠2 = 60°. Kedua bagian bersama-sama membentuk sudut siku-siku, jadi jumlahnya 90° (berpenyiku): 90° − 30° = 60°.',
      },
    ],
    alasanLabel:
      'Bagaimana caramu menduga? Apakah kamu menebak, memperkirakan dari gambar, atau memakai aturan tertentu? Tulis singkat.',
    alasanPlaceholder: 'Contoh: aku menduga ∠3 = … karena …',
    catatan:
      'Dugaan ini belum dinilai. Kalian akan memeriksanya sendiri dengan mengukur sudut memakai busur di Lab Sudut.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — PROBLEM STATEMENT
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan penyelidikan tentang hubungan besar sudut-sudut pada dua garis berpotongan, lalu menulis hipotesis.',
    guru: 'Arahkan murid pada pertanyaan yang dapat dijawab dengan mengukur dan mengamati. Pertanyaan tentang panjang jalan atau harga gunting tidak dapat dijawab dengan busur — bahas mengapa.',
    pengantar:
      'Dugaan kalian tentang ∠2 dan ∠3 mungkin berbeda-beda. Apakah ada aturan yang SELALU berlaku pada sudut-sudut di dua garis berpotongan, berapa pun besar sudut-sudutnya?',
    pertanyaan: 'Pilih pertanyaan inti penyelidikan kita:',
    opsi: [
      {
        id: 'inti',
        label:
          'Bagaimana hubungan besar sudut-sudut yang bersebelahan, yang berhadapan, dan yang membentuk sudut siku-siku pada dua garis yang berpotongan?',
      },
      { id: 'panjang', label: 'Berapa panjang Jalan Melati sampai perempatan?' },
      { id: 'harga', label: 'Berapa harga gunting yang paling tajam?' },
      { id: 'busur', label: 'Siapa penemu busur derajat?' },
    ],
    correct: 'inti',
    umpan: {
      inti: 'Tepat! Pertanyaan ini dapat kita selidiki dengan memutar garis, mengukur sudut dengan busur, dan mengamati polanya.',
      panjang:
        'Panjang jalan tidak dapat diukur dengan busur, dan bukan itu yang ingin kita pahami. Pilih pertanyaan tentang besar sudut.',
      harga:
        'Harga gunting tidak berhubungan dengan besar sudutnya. Pilih pertanyaan tentang hubungan sudut-sudut.',
      busur:
        'Sejarah busur menarik, tetapi tidak menjawab bagaimana hubungan sudut-sudut pada dua garis berpotongan.',
    },
    hipotesisLabel:
      'Tulis dugaan sementaramu (hipotesis): bagaimana hubungan ∠1 dengan ∠2 (bersebelahan), ∠1 dengan ∠3 (berhadapan), dan dua bagian sudut siku-siku?',
    hipotesisPlaceholder:
      'Contoh: menurutku ∠1 dan ∠2 …, ∠1 dan ∠3 …, dua bagian sudut siku-siku …',
    nextLabel: 'Lanjut: Lab Sudut →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — DATA COLLECTION: LAB SUDUT
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Mengumpulkan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengukur keempat sudut pada dua garis berpotongan di beberapa posisi, serta dua bagian sudut siku-siku yang dibagi sinar, lalu mencatatnya di tabel pengamatan.',
    guru: 'Murid bergantian: satu memutar garis dan memasang busur, yang lain membaca skala dan mengetik hasilnya. Pastikan murid meletakkan 0° pada lengan pertama sudut. Bila muncul pesan "salah skala", minta murid menunjukkan skala mana yang dibacanya.',
    pengantar:
      'Garis AB dan garis CD berpotongan di titik O dan membentuk empat sudut: ∠1, ∠2, ∠3, ∠4. Putar garis CD, pasang busur pada setiap sudut, baca besarnya, lalu catat ke tabel. Setelah itu, selidiki juga dua garis yang tegak lurus dengan sebuah sinar OE.',
    tips: [
      'Ketuk sebuah sudut untuk memasang busur. Angka 0 diletakkan pada lengan pertama sudut; bacalah skala BIRU (dalam) sampai lengan keduanya.',
      'Skala abu-abu (luar) dimulai dari arah sebaliknya. Membaca skala yang salah menghasilkan pelurus sudutnya!',
      'Seret bulatan oranye atau tekan tombol − / + untuk memutar garis. Cobalah posisi sudut lancip dan sudut tumpul.',
    ],
    lab: {
      potong: { min: 15, max: 165, langkah: 5, awal: 50, minPosisi: 3 },
      siku: { min: 10, max: 80, langkah: 5, awal: 30, minPosisi: 2 },
    },
    selesaiTeks:
      'Data sudah terkumpul. Amati kedua tabelmu: adakah angka yang selalu sama, atau jumlah yang selalu sama, berapa pun posisi garisnya?',
    nextLabel: 'Lanjut: Olah Data Berpelurus →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — DATA PROCESSING: SUDUT BERPELURUS
     ---------------------------------------------------------- */
  olahPelurus: {
    kicker: 'Tahap 4a · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan dari tabel pengamatan bahwa dua sudut yang bersebelahan pada satu garis lurus selalu berjumlah 180°.',
    guru: 'Minta murid menjumlahkan ∠1 + ∠2 pada setiap baris tabel. Tanyakan: "Mengapa jumlahnya tidak berubah walaupun garis diputar?" Tunjukkan bahwa sinar OA dan OB membentuk garis lurus (sudut lurus 180°).',
    judul: 'Tabel pengamatan A',
    data: 'potong',
    sorot: [0, 1],
    pengantar:
      'Pada gambar, ∠1 dan ∠2 disorot: keduanya bersebelahan dan lengan luarnya (OB dan OA) membentuk garis lurus AB. Bandingkan dengan tabelmu.',
    temuan: [
      {
        id: 'tpJumlah',
        tanya: 'Berapa ∠1 + ∠2 pada setiap posisi di tabelmu?',
        opsi: [
          { id: 'o180', label: 'Selalu 180°' },
          { id: 'o90', label: 'Selalu 90°' },
          { id: 'o360', label: 'Selalu 360°' },
          { id: 'ubah', label: 'Berubah-ubah sesuai posisi garis' },
        ],
        correct: 'o180',
        umpan: {
          o180: 'Tepat! Berapa pun posisinya, ∠1 + ∠2 = 180°. Begitu pula ∠2 + ∠3, ∠3 + ∠4, dan ∠4 + ∠1.',
          o90: 'Jumlahkan satu baris tabelmu, mis. 50° + 130°. Hasilnya lebih dari 90°.',
          o360: '360° adalah jumlah KEEMPAT sudut (satu putaran). Yang ditanyakan hanya dua sudut yang bersebelahan.',
          ubah: 'Besar ∠1 dan ∠2 memang berubah, tetapi coba jumlahkan keduanya pada setiap baris. Apa yang kamu perhatikan?',
        },
      },
      {
        id: 'tpAlasan',
        tanya: 'Mengapa ∠1 + ∠2 selalu menghasilkan jumlah itu?',
        opsi: [
          { id: 'lurus', label: 'Karena bersama-sama keduanya membentuk sudut lurus (garis AB)' },
          { id: 'siku', label: 'Karena keduanya membentuk sudut siku-siku' },
          { id: 'sama', label: 'Karena ∠1 dan ∠2 sama besar' },
          { id: 'kebetulan', label: 'Hanya kebetulan pada posisi yang kita pilih' },
        ],
        correct: 'lurus',
        umpan: {
          lurus:
            'Tepat! Sinar OB dan OA membentuk garis lurus, dan sudut lurus besarnya 180°. ∠1 dan ∠2 membagi sudut lurus itu menjadi dua.',
          siku: 'Sudut siku-siku besarnya 90°. Lihat gambar: lengan luar ∠1 dan ∠2 membentuk garis lurus, bukan siku-siku.',
          sama: 'Lihat tabel: ∠1 dan ∠2 umumnya tidak sama besar (mis. 50° dan 130°), tetapi jumlahnya tetap.',
          kebetulan:
            'Kamu sudah mencoba beberapa posisi berbeda dan hasilnya selalu sama. Itu tanda ada aturan, bukan kebetulan.',
        },
      },
      {
        id: 'tpNama',
        tanya: 'Dua sudut yang jumlahnya 180° disebut sudut …',
        opsi: [
          { id: 'pelurus', label: 'Berpelurus' },
          { id: 'penyiku', label: 'Berpenyiku' },
          { id: 'tolak', label: 'Bertolak belakang' },
          { id: 'lancip', label: 'Lancip' },
        ],
        correct: 'pelurus',
        umpan: {
          pelurus:
            'Tepat! ∠1 dan ∠2 saling berpelurus: ∠2 adalah PELURUS ∠1 (pelengkap menjadi sudut lurus).',
          penyiku:
            'Berpenyiku berarti jumlahnya 90° (melengkapi sudut siku-siku). Jumlah ∠1 + ∠2 adalah 180°.',
          tolak:
            'Bertolak belakang adalah sudut yang BERHADAPAN, mis. ∠1 dan ∠3. ∠1 dan ∠2 bersebelahan.',
          lancip:
            'Lancip adalah jenis satu sudut (kurang dari 90°), bukan nama hubungan dua sudut.',
        },
      },
    ],
    pilah: {
      judul: 'Berpelurus atau bukan?',
      pengantar:
        'Gunakan gambar dua garis berpotongan di atas. Tentukan apakah setiap pasangan sudut berpelurus.',
      kategori: [
        { id: 'berpelurus', label: 'Berpelurus (jumlah 180°)' },
        { id: 'bukanPelurus', label: 'Bukan berpelurus' },
      ],
      butir: [
        {
          id: 'pp1',
          pasangan: [0, 1],
          explanation: '∠1 dan ∠2 bersebelahan pada garis AB: berpelurus.',
        },
        {
          id: 'pp2',
          pasangan: [1, 2],
          explanation: '∠2 dan ∠3 bersebelahan pada garis CD: berpelurus.',
        },
        {
          id: 'pp3',
          pasangan: [2, 3],
          explanation: '∠3 dan ∠4 bersebelahan pada garis AB: berpelurus.',
        },
        {
          id: 'pp4',
          pasangan: [3, 0],
          explanation: '∠4 dan ∠1 bersebelahan pada garis CD: berpelurus.',
        },
        {
          id: 'pp5',
          pasangan: [0, 2],
          explanation:
            '∠1 dan ∠3 berhadapan, bukan bersebelahan. Jumlahnya 180° hanya bila keduanya 90°.',
        },
        {
          id: 'pp6',
          pasangan: [1, 3],
          explanation: '∠2 dan ∠4 berhadapan, bukan bersebelahan pada satu garis lurus.',
        },
      ],
    },
    langkah: [
      {
        id: 'lp1',
        lab: { mode: 'potong', baris: 0, pasangan: [0, 1] },
        cek: { minta: 'jumlah' },
        label: 'Posisi {p} di tabelmu: ∠{a} = {va} dan ∠{b} = {vb}. Berapa ∠{a} + ∠{b}?',
        placeholder: 'mis. 90',
        hints: ['Jumlahkan kedua besar sudut itu.'],
        temuan: 'Jumlahnya 180°: ∠1 dan ∠2 berpelurus.',
      },
      {
        id: 'lp2',
        lab: { mode: 'potong', baris: 1, pasangan: [2, 3] },
        cek: { minta: 'jumlah' },
        label: 'Posisi {p} di tabelmu: ∠{a} = {va} dan ∠{b} = {vb}. Berapa ∠{a} + ∠{b}?',
        placeholder: 'mis. 90',
        hints: ['Jumlahkan kedua besar sudut itu.', 'Apakah hasilnya sama seperti posisi 1?'],
        temuan: 'Jumlahnya 180° lagi, walaupun posisi garisnya berbeda.',
      },
      {
        id: 'lp3',
        cek: { minta: 'pelurus', sudut: 65 },
        label:
          'Pada perempatan Jalan Melati, satu sudut besarnya 65°. Tanpa mengukur, berapa besar sudut yang bersebelahan dengannya pada jalan yang sama?',
        placeholder: 'mis. 25',
        hints: ['Keduanya membentuk garis lurus, jadi jumlahnya 180°.', 'Hitung 180° − 65°.'],
        temuan: '180° − 65° = 115°. Pelurus sudut a° adalah (180 − a)°.',
      },
    ],
    ringkasan:
      'Dua sudut yang bersebelahan dan lengan luarnya membentuk garis lurus selalu berjumlah 180°. Pasangan seperti ini disebut sudut BERPELURUS; masing-masing adalah pelurus yang lain. Pelurus a° = (180 − a)°. Pada dua garis berpotongan ada empat pasang sudut berpelurus: ∠1 & ∠2, ∠2 & ∠3, ∠3 & ∠4, ∠4 & ∠1.',
    nextLabel: 'Lanjut: Olah Data Bertolak Belakang →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — DATA PROCESSING: SUDUT BERTOLAK BELAKANG
     ---------------------------------------------------------- */
  olahTolak: {
    kicker: 'Tahap 4b · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan dari tabel pengamatan bahwa dua sudut yang berhadapan (bertolak belakang) selalu sama besar, lalu menjelaskan alasannya.',
    guru: 'Tutup kolom ∠3 di tabel dan minta murid menebaknya dari ∠1. Lalu bimbing penalarannya: ∠1 + ∠2 = 180° dan ∠2 + ∠3 = 180°, jadi ∠1 dan ∠3 sama-sama "180° dikurangi ∠2".',
    judul: 'Tabel pengamatan A',
    data: 'potong',
    sorot: [0, 2],
    pengantar:
      'Sekarang ∠1 dan ∠3 yang disorot: keduanya berhadapan, dibatasi kedua garis yang sama tetapi membuka ke arah berlawanan. Bandingkan kolom ∠1 dengan ∠3, dan ∠2 dengan ∠4.',
    temuan: [
      {
        id: 'ttSama',
        tanya: 'Apa yang kamu perhatikan pada kolom ∠1 dan ∠3 di setiap posisi?',
        opsi: [
          { id: 'sama', label: 'Besarnya selalu sama' },
          { id: 'o180', label: 'Jumlahnya selalu 180°' },
          { id: 'o90', label: 'Jumlahnya selalu 90°' },
          { id: 'acak', label: 'Tidak ada hubungannya' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Tepat! ∠1 = ∠3 di setiap posisi. Hal yang sama terjadi pada ∠2 dan ∠4.',
          o180: 'Jumlah 180° berlaku untuk sudut yang BERSEBELAHAN. Lihat lagi kolom ∠1 dan ∠3: bandingkan angkanya.',
          o90: 'Coba jumlahkan satu baris, mis. 50° + 50° = 100°. Jumlahnya tidak tetap 90°. Bandingkan angkanya saja.',
          acak: 'Lihat tabelmu baris demi baris. Apakah ∠1 dan ∠3 pernah berbeda?',
        },
      },
      {
        id: 'ttAlasan',
        tanya: 'Mengapa ∠1 dan ∠3 selalu sama besar?',
        opsi: [
          { id: 'pelurusSama', label: 'Karena keduanya sama-sama pelurus dari ∠2' },
          { id: 'gambar', label: 'Karena gambarnya terlihat sama' },
          { id: 'lancip', label: 'Karena keduanya selalu sudut lancip' },
          { id: 'siku', label: 'Karena kedua garis selalu tegak lurus' },
        ],
        correct: 'pelurusSama',
        umpan: {
          pelurusSama:
            'Tepat! ∠1 = 180° − ∠2 dan ∠3 = 180° − ∠2. Karena keduanya "180° dikurangi sudut yang sama", hasilnya pasti sama.',
          gambar:
            'Gambar bisa menipu. Alasan yang kuat memakai hubungan yang sudah kita temukan: sudut berpelurus berjumlah 180°.',
          lancip: 'Pada posisi lain ∠1 dan ∠3 tumpul (mis. 110°), tetapi tetap sama besar.',
          siku: 'Pada sebagian besar posisi garisnya tidak tegak lurus, tetapi ∠1 tetap sama dengan ∠3.',
        },
      },
      {
        id: 'ttNama',
        tanya: 'Pasangan sudut yang saling berhadapan pada titik potong dua garis disebut sudut …',
        opsi: [
          { id: 'tolak', label: 'Bertolak belakang' },
          { id: 'pelurus', label: 'Berpelurus' },
          { id: 'penyiku', label: 'Berpenyiku' },
          { id: 'sehadap', label: 'Bersebelahan' },
        ],
        correct: 'tolak',
        umpan: {
          tolak:
            'Tepat! ∠1 & ∠3 serta ∠2 & ∠4 adalah sudut bertolak belakang, dan besarnya selalu sama.',
          pelurus: 'Sudut berpelurus bersebelahan dan berjumlah 180°. ∠1 dan ∠3 berhadapan.',
          penyiku: 'Sudut berpenyiku berjumlah 90°. ∠1 dan ∠3 sama besar, bukan berjumlah 90°.',
          sehadap: '∠1 dan ∠3 justru tidak bersebelahan; di antara keduanya ada ∠2.',
        },
      },
    ],
    pilah: {
      judul: 'Berpelurus atau bertolak belakang?',
      gambar: { mode: 'potong', t: 115 },
      pengantar:
        'Gambar di bawah memakai nama sudut tiga huruf (titik sudutnya O di tengah). Tentukan jenis setiap pasangan.',
      kategori: [
        { id: 'berpelurus', label: 'Berpelurus' },
        { id: 'bertolakBelakang', label: 'Bertolak belakang' },
      ],
      butir: [
        {
          id: 'pt1',
          pasangan: [0, 2],
          explanation: '∠BOC dan ∠AOD berhadapan di titik O: bertolak belakang (sama besar).',
        },
        {
          id: 'pt2',
          pasangan: [1, 3],
          explanation: '∠COA dan ∠DOB berhadapan: bertolak belakang (sama besar).',
        },
        {
          id: 'pt3',
          pasangan: [0, 1],
          explanation: '∠BOC dan ∠COA bersebelahan pada garis AB: berpelurus.',
        },
        {
          id: 'pt4',
          pasangan: [2, 3],
          explanation: '∠AOD dan ∠DOB bersebelahan pada garis AB: berpelurus.',
        },
        {
          id: 'pt5',
          pasangan: [3, 0],
          explanation: '∠DOB dan ∠BOC bersebelahan pada garis CD: berpelurus.',
        },
      ],
    },
    langkah: [
      {
        id: 'lt1',
        lab: { mode: 'potong', baris: 2, pasangan: [0] },
        cek: { minta: 'tolakBelakang' },
        label: 'Posisi {p} di tabelmu: ∠1 = {va}. Tanpa melihat kolom ∠3, berapa besar ∠3?',
        placeholder: 'mis. 45',
        hints: ['∠1 dan ∠3 berhadapan (bertolak belakang).', 'Sudut bertolak belakang sama besar.'],
        temuan: '∠3 = ∠1. Cocokkan dengan tabelmu!',
      },
      {
        id: 'lt2',
        lab: { mode: 'potong', baris: 2, pasangan: [0] },
        cek: { minta: 'pelurus' },
        label: 'Masih posisi {p}: ∠1 = {va}. Berapa besar ∠2 = 180° − ∠1?',
        placeholder: 'mis. 45',
        hints: ['∠1 dan ∠2 berpelurus.', 'Kurangkan ∠1 dari 180°.'],
        temuan:
          'Dan ∠4 = ∠2 karena keduanya bertolak belakang. Dari SATU sudut, keempat sudut dapat ditentukan.',
      },
      {
        id: 'lt3',
        cek: { minta: 'tolakBelakang', sudut: 112 },
        label:
          'Dua bilah gunting membentuk sudut 112° di bagian pegangan. Berapa besar sudut yang berhadapan dengannya di bagian ujung bilah?',
        placeholder: 'mis. 45',
        hints: ['Sudut di pegangan dan di ujung bilah saling berhadapan.'],
        temuan: '112°. Sudut bertolak belakang sama besar, baik lancip maupun tumpul.',
      },
    ],
    ringkasan:
      'Dua sudut yang saling berhadapan pada titik potong dua garis disebut sudut BERTOLAK BELAKANG, dan besarnya selalu sama: ∠1 = ∠3 dan ∠2 = ∠4. Alasannya: ∠1 = 180° − ∠2 dan ∠3 = 180° − ∠2, jadi keduanya pelurus dari sudut yang sama.',
    nextLabel: 'Lanjut: Olah Data Berpenyiku →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — DATA PROCESSING: SUDUT BERPENYIKU
     ---------------------------------------------------------- */
  olahPenyiku: {
    kicker: 'Tahap 4c · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan dari tabel pengamatan B bahwa dua bagian sudut siku-siku selalu berjumlah 90°, dan membedakannya dari sudut berpelurus.',
    guru: 'Tekankan bahwa garis AB ⊥ CD sehingga ∠BOC siku-siku (90°). Ajak murid membuat "jembatan keledai": peNYIKU → SIKU-siku → 90°; peLURUS → garis LURUS → 180°.',
    judul: 'Tabel pengamatan B',
    data: 'siku',
    sorot: [0, 1],
    pengantar:
      'Garis AB tegak lurus garis CD, sehingga ∠BOC siku-siku. Sinar OE membagi sudut siku-siku itu menjadi ∠1 dan ∠2. Amati tabel B.',
    temuan: [
      {
        id: 'tsJumlah',
        tanya: 'Berapa ∠1 + ∠2 pada setiap posisi di tabel B?',
        opsi: [
          { id: 'o90', label: 'Selalu 90°' },
          { id: 'o180', label: 'Selalu 180°' },
          { id: 'sama', label: '∠1 selalu sama dengan ∠2' },
          { id: 'ubah', label: 'Berubah-ubah sesuai posisi sinar' },
        ],
        correct: 'o90',
        umpan: {
          o90: 'Tepat! Berapa pun posisi sinar OE, ∠1 + ∠2 = 90°.',
          o180: 'Jumlahkan satu baris tabel B, mis. 30° + 60°. Hasilnya bukan 180°.',
          sama: '∠1 = ∠2 hanya bila keduanya 45°. Lihat posisi lain di tabelmu.',
          ubah: 'Besar ∠1 dan ∠2 memang berubah, tetapi jumlahnya? Coba jumlahkan setiap baris.',
        },
      },
      {
        id: 'tsNama',
        tanya: 'Dua sudut yang jumlahnya 90° disebut sudut …',
        opsi: [
          { id: 'penyiku', label: 'Berpenyiku' },
          { id: 'pelurus', label: 'Berpelurus' },
          { id: 'tolak', label: 'Bertolak belakang' },
          { id: 'siku', label: 'Siku-siku' },
        ],
        correct: 'penyiku',
        umpan: {
          penyiku:
            'Tepat! ∠1 dan ∠2 saling berpenyiku: ∠2 adalah PENYIKU ∠1 (pelengkap menjadi sudut siku-siku).',
          pelurus: 'Berpelurus berarti jumlahnya 180° (garis lurus). Di sini jumlahnya 90°.',
          tolak:
            'Bertolak belakang adalah sudut yang berhadapan dan sama besar. ∠1 dan ∠2 bersebelahan.',
          siku: 'Siku-siku adalah satu sudut yang besarnya 90°. ∠1 dan ∠2 masing-masing bukan siku-siku; JUMLAHNYA yang 90°.',
        },
      },
      {
        id: 'tsBeda',
        tanya: 'Penyiku 40° adalah 50°. Berapa pelurus 40°?',
        opsi: [
          { id: 'o140', label: '140°' },
          { id: 'o50', label: '50°' },
          { id: 'o40', label: '40°' },
          { id: 'o320', label: '320°' },
        ],
        correct: 'o140',
        umpan: {
          o140: 'Tepat! Pelurus 40° = 180° − 40° = 140°. Pelurus selalu 90° lebih besar daripada penyiku.',
          o50: 'Itu penyikunya (90° − 40°). Pelurus melengkapi menjadi 180°.',
          o40: 'Pelurus tidak sama besar dengan sudutnya, kecuali sudut 90°. Hitung 180° − 40°.',
          o320: 'Itu 360° − 40° (satu putaran). Pelurus melengkapi menjadi 180°, bukan 360°.',
        },
      },
    ],
    pilah: {
      judul: 'Berpenyiku, berpelurus, atau bukan keduanya?',
      pengantar: 'Setiap butir memuat besar dua sudut. Tentukan jenis pasangannya dari jumlahnya.',
      kategori: [
        { id: 'berpenyiku', label: 'Berpenyiku' },
        { id: 'berpelurus', label: 'Berpelurus' },
        { id: 'bukanKeduanya', label: 'Bukan keduanya' },
      ],
      butir: [
        { id: 'ps1', sudut: [35, 55], explanation: '35° + 55° = 90°: berpenyiku.' },
        { id: 'ps2', sudut: [35, 145], explanation: '35° + 145° = 180°: berpelurus.' },
        {
          id: 'ps3',
          sudut: [45, 45],
          explanation: '45° + 45° = 90°: berpenyiku. Dua sudut berpenyiku boleh sama besar.',
        },
        { id: 'ps4', sudut: [120, 60], explanation: '120° + 60° = 180°: berpelurus.' },
        {
          id: 'ps5',
          sudut: [40, 40],
          explanation: '40° + 40° = 80°: bukan 90° maupun 180°, jadi bukan keduanya.',
        },
        { id: 'ps6', sudut: [72, 18], explanation: '72° + 18° = 90°: berpenyiku.' },
      ],
    },
    langkah: [
      {
        id: 'ls1',
        lab: { mode: 'siku', baris: 0, pasangan: [0, 1] },
        cek: { minta: 'jumlah' },
        label: 'Posisi {p} di tabel B: ∠{a} = {va} dan ∠{b} = {vb}. Berapa ∠{a} + ∠{b}?',
        placeholder: 'mis. 180',
        hints: ['Jumlahkan kedua besar sudut itu.'],
        temuan: 'Jumlahnya 90°: ∠1 dan ∠2 berpenyiku.',
      },
      {
        id: 'ls2',
        cek: { minta: 'penyiku', sudut: 35 },
        label:
          'Sebuah tali hiasan membagi pojok bingkai siku-siku. Satu bagian besarnya 35°. Berapa besar bagian lainnya?',
        placeholder: 'mis. 145',
        hints: ['Kedua bagian membentuk sudut siku-siku, jadi jumlahnya 90°.', 'Hitung 90° − 35°.'],
        temuan: '90° − 35° = 55°. Penyiku a° adalah (90 − a)°.',
      },
      {
        id: 'ls3',
        cek: { minta: 'pelurus', sudut: 35 },
        label: 'Sekarang bandingkan: berapa PELURUS sudut 35°?',
        placeholder: 'mis. 55',
        hints: ['Pelurus melengkapi menjadi sudut lurus 180°.'],
        temuan: '180° − 35° = 145°. Jangan tertukar: penyiku → 90°, pelurus → 180°.',
      },
    ],
    ringkasan:
      'Dua sudut yang jumlahnya 90° disebut sudut BERPENYIKU; masing-masing adalah penyiku yang lain. Penyiku a° = (90 − a)°. Pada dua garis yang tegak lurus, sinar yang membagi sudut siku-siku menghasilkan dua sudut berpenyiku. Ingat: penyiku → siku-siku (90°), pelurus → garis lurus (180°).',
    nextLabel: 'Lanjut: Verifikasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — VERIFICATION
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Verifikasi',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji temuan pada posisi garis yang baru dengan memprediksi lalu mengukur, memilah pernyataan, dan membandingkannya dengan dugaan awal.',
    guru: 'Pada bagian A, minta murid menuliskan prediksinya di kertas lebih dulu sebelum mengetik. Pada bagian B, minta contoh pendukung atau contoh penyangkal untuk setiap pernyataan.',
    judulA: 'A. Prediksi lalu buktikan',
    pengantarA:
      'Komputer memilih posisi garis yang BARU secara acak. Hanya satu sudut yang diketahui. Prediksi ketiga sudut lainnya memakai temuanmu, lalu buktikan dengan busur.',
    prediksi: { min: 20, max: 160, langkah: 5, kecuali: [90] },
    buktiLabel: '📐 Ukur dengan busur untuk membuktikan',
    buktiTeks:
      'Hasil pengukuran busur sama dengan prediksimu. Temuanmu berlaku juga pada posisi yang belum pernah kamu ukur.',
    judulB: 'B. Selalu benar, kadang-kadang benar, atau salah?',
    opsiPernyataan: [
      { id: 'selalu', label: 'Selalu benar' },
      { id: 'kadang', label: 'Kadang-kadang benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'vp1',
        teks: 'Dua sudut yang bertolak belakang besarnya sama.',
        correct: 'selalu',
        explanation:
          'Keduanya pelurus dari sudut yang sama, jadi pasti sama besar pada posisi apa pun.',
      },
      {
        id: 'vp2',
        teks: 'Dua sudut yang berpelurus besarnya sama.',
        correct: 'kadang',
        explanation:
          'Hanya bila keduanya 90° (garis tegak lurus). Pada posisi lain, mis. 50° dan 130°, tidak sama.',
      },
      {
        id: 'vp3',
        teks: 'Penyiku sebuah sudut lancip juga sudut lancip.',
        correct: 'selalu',
        explanation: 'Bila 0° < a < 90°, maka 90° − a juga di antara 0° dan 90°.',
      },
      {
        id: 'vp4',
        teks: 'Pelurus sudut 70° adalah 20°.',
        correct: 'salah',
        explanation: '20° adalah penyikunya. Pelurus 70° = 180° − 70° = 110°.',
      },
      {
        id: 'vp5',
        teks: 'Pada dua garis berpotongan, jumlah keempat sudutnya 360°.',
        correct: 'selalu',
        explanation: 'Dua pasang sudut berpelurus: 180° + 180° = 360° (satu putaran penuh).',
      },
      {
        id: 'vp6',
        teks: 'Sudut tumpul mempunyai penyiku.',
        correct: 'salah',
        explanation:
          'Sudut tumpul lebih dari 90°, jadi tidak ada sudut positif yang menggenapkannya menjadi 90°.',
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
    goal: 'Menyusun kesimpulan tentang sudut berpelurus, berpenyiku, dan bertolak belakang berdasarkan temuan.',
    guru: 'Minta setiap pasangan membacakan satu kesimpulan beserta contoh dari tabel Lab Sudut mereka sebelum memeriksa.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari bank kalimat. Setiap potongan hanya dipakai satu kali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'gPelurus', awal: 'Dua sudut berpelurus adalah dua sudut yang', correct: 'b1' },
      { id: 'gPenyiku', awal: 'Dua sudut berpenyiku adalah dua sudut yang', correct: 'b2' },
      {
        id: 'gTolak',
        awal: 'Pada dua garis yang berpotongan, dua sudut yang bertolak belakang',
        correct: 'b3',
      },
      { id: 'gAlasan', awal: 'Sudut bertolak belakang sama besar karena', correct: 'b4' },
    ],
    bank: [
      { id: 'b1', teks: 'jumlahnya 180°, seperti dua sudut bersebelahan pada satu garis lurus.' },
      { id: 'b2', teks: 'jumlahnya 90°, sehingga bersama-sama membentuk sudut siku-siku.' },
      { id: 'b3', teks: 'saling berhadapan pada titik potongnya dan besarnya selalu sama.' },
      { id: 'b4', teks: 'keduanya merupakan pelurus dari sudut yang sama.' },
      { id: 'b5', teks: 'jumlahnya 360°.' },
      { id: 'b6', teks: 'besarnya selalu 90°.' },
      { id: 'b7', teks: 'gambarnya terlihat sama besar.' },
    ],
    contoh: { mode: 'potong', t: 40 },
    rangkuman: [
      '<strong>Berpelurus:</strong> ∠1 + ∠2 = 180°, jadi pelurus a° = (180 − a)°. Contoh: pelurus 40° adalah 140°.',
      '<strong>Bertolak belakang:</strong> ∠1 = ∠3 dan ∠2 = ∠4. Contoh: ∠1 = 40° → ∠3 = 40°, ∠2 = ∠4 = 140°.',
      '<strong>Berpenyiku:</strong> dua sudut berjumlah 90°, jadi penyiku a° = (90 − a)°. Contoh: penyiku 40° adalah 50°.',
      'Dari SATU sudut pada dua garis berpotongan, ketiga sudut lainnya dapat ditentukan tanpa mengukur.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Bank 16 soal; diambil acak sesuai komposisi. Soal ber-cek 'cari'
     dan 'jenis' (pasangan) diberi gambar oleh app.js.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    goal: 'Menerapkan hubungan sudut berpelurus, berpenyiku, dan bertolak belakang untuk menentukan besar sudut dan jenis pasangan sudut.',
    guru: 'Murid mengerjakan mandiri. Pesan salah berupa diagnosa miskonsepsi (mis. tertukar penyiku dan pelurus); minta murid membacanya sebelum mencoba lagi.',
    instruksi:
      'Jawab setiap soal. Tulis besar sudut dengan angka saja (tanda ° boleh ditulis atau tidak). Jika keliru, baca pesannya lalu coba lagi.',
    banyak: 8,
    komposisi: { input: 4, choice: 4 },
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: 'gunting',
        cerita:
          'Dua bilah gunting yang terbuka membentuk dua garis berpotongan. Sudut di antara ujung bilahnya (∠1) besarnya 38°.',
        pertanyaan: 'Berapa besar ∠2 yang bersebelahan dengan ∠1?',
        cek: { minta: 'cari', diketahui: { k: 0, nilai: 38 }, ditanya: 1 },
        hints: ['∠1 dan ∠2 berpelurus.', 'Hitung 180° − 38°.'],
        explanation: '∠1 dan ∠2 berpelurus: 180° − 38° = 142°.',
      },
      {
        id: 't2',
        type: 'input',
        konteks: 'jalan',
        cerita:
          'Jalan Merdeka memotong Jalan Sudirman. Salah satu sudut di perempatan (∠2) besarnya 115°.',
        pertanyaan: 'Berapa besar ∠4?',
        cek: { minta: 'cari', diketahui: { k: 1, nilai: 115 }, ditanya: 3 },
        hints: ['Letak ∠2 dan ∠4 berhadapan.', 'Sudut bertolak belakang sama besar.'],
        explanation: '∠2 dan ∠4 bertolak belakang, jadi ∠4 = 115°.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: 'bangunan',
        cerita:
          'Sebuah tangga bersandar pada dinding dan berdiri di lantai datar. Sudut antara tangga dan lantai di sisi dinding besarnya 72°.',
        pertanyaan: 'Berapa besar sudut antara tangga dan lantai di sisi lainnya (pelurusnya)?',
        cek: { minta: 'pelurus', sudut: 72 },
        hints: ['Lantai berupa garis lurus, jadi kedua sudut berjumlah 180°.'],
        explanation: 'Pelurus 72° = 180° − 72° = 108°.',
      },
      {
        id: 't4',
        type: 'input',
        konteks: 'bangunan',
        cerita:
          'Pojok bingkai foto yang siku-siku dibagi oleh pita hiasan menjadi dua sudut. Salah satunya 27°.',
        pertanyaan: 'Berapa besar sudut yang lain?',
        cek: { minta: 'penyiku', sudut: 27 },
        hints: ['Kedua sudut membentuk sudut siku-siku (90°).', 'Hitung 90° − 27°.'],
        explanation: 'Kedua sudut berpenyiku: 90° − 27° = 63°.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: 'aljabar',
        cerita:
          'Pada dua garis berpotongan, sepasang sudut bertolak belakang besarnya (3x + 15)° dan (5x − 25)°.',
        pertanyaan: 'Tentukan nilai x.',
        cek: { minta: 'aljabar', relasi: 'bertolakBelakang', a: [3, 15], b: [5, -25], tanya: 'x' },
        hints: [
          'Sudut bertolak belakang sama besar: 3x + 15 = 5x − 25.',
          'Kumpulkan suku x di satu ruas: 15 + 25 = 5x − 3x.',
        ],
        explanation: '3x + 15 = 5x − 25 → 40 = 2x → x = 20 (kedua sudut 75°).',
      },
      {
        id: 't6',
        type: 'input',
        konteks: 'aljabar',
        cerita: 'Dua sudut berpelurus besarnya (2x + 20)° dan (x + 40)°.',
        pertanyaan: 'Berapa besar sudut yang pertama, (2x + 20)°?',
        cek: { minta: 'aljabar', relasi: 'berpelurus', a: [2, 20], b: [1, 40], tanya: 'sudut' },
        hints: [
          'Sudut berpelurus berjumlah 180°: (2x + 20) + (x + 40) = 180.',
          'Setelah x ditemukan, substitusikan ke 2x + 20.',
        ],
        explanation: '3x + 60 = 180 → x = 40, jadi sudut pertama 2 × 40 + 20 = 100°.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: 'aljabar',
        cerita: 'Dua sudut berpenyiku besarnya (x + 10)° dan (2x − 10)°.',
        pertanyaan: 'Tentukan nilai x.',
        cek: { minta: 'aljabar', relasi: 'berpenyiku', a: [1, 10], b: [2, -10], tanya: 'x' },
        hints: ['Sudut berpenyiku berjumlah 90°: (x + 10) + (2x − 10) = 90.'],
        explanation: '3x = 90 → x = 30 (sudut-sudutnya 40° dan 50°).',
      },
      {
        id: 't8',
        type: 'input',
        konteks: 'jalan',
        cerita: 'Rambu perlintasan kereta berbentuk huruf X. Pada rambu itu, ∠4 = 47°.',
        pertanyaan: 'Berapa besar ∠1?',
        cek: { minta: 'cari', diketahui: { k: 3, nilai: 47 }, ditanya: 0 },
        hints: ['∠4 dan ∠1 bersebelahan pada satu garis lurus.'],
        explanation: '∠4 dan ∠1 berpelurus: 180° − 47° = 133°.',
      },
      {
        id: 't9',
        type: 'choice',
        konteks: 'gambar',
        cerita: 'Perhatikan ∠1 dan ∠3 yang disorot pada gambar dua garis berpotongan.',
        pertanyaan: 'Pasangan ∠1 dan ∠3 termasuk sudut …',
        cek: { minta: 'jenis', mode: 'potong', pasangan: [0, 2] },
        explanation: '∠1 dan ∠3 berhadapan di titik potong: bertolak belakang, sama besar.',
      },
      {
        id: 't10',
        type: 'choice',
        konteks: 'gambar',
        cerita: 'Perhatikan ∠2 dan ∠3 yang disorot pada gambar dua garis berpotongan.',
        pertanyaan: 'Pasangan ∠2 dan ∠3 termasuk sudut …',
        cek: { minta: 'jenis', mode: 'potong', pasangan: [1, 2] },
        explanation: '∠2 dan ∠3 bersebelahan pada garis CD: berpelurus, jumlahnya 180°.',
      },
      {
        id: 't11',
        type: 'choice',
        konteks: 'bangunan',
        cerita: 'Dua sudut pada kusen jendela besarnya 32° dan 58°.',
        pertanyaan: 'Kedua sudut itu termasuk pasangan sudut …',
        cek: { minta: 'jenis', sudut: [32, 58] },
        explanation: '32° + 58° = 90°: berpenyiku.',
      },
      {
        id: 't12',
        type: 'choice',
        konteks: 'jalan',
        cerita: 'Dua sudut bersebelahan di pertigaan jalan besarnya 125° dan 55°.',
        pertanyaan: 'Kedua sudut itu termasuk pasangan sudut …',
        cek: { minta: 'jenis', sudut: [125, 55] },
        explanation: '125° + 55° = 180°: berpelurus.',
      },
      {
        id: 't13',
        type: 'choice',
        konteks: 'gambar',
        cerita: 'Garis AB dan CD berpotongan di O. Besar ∠AOD = 64°.',
        pertanyaan: 'Berapa besar ∠BOC, sudut yang bertolak belakang dengan ∠AOD?',
        cek: { minta: 'tolakBelakang', sudut: 64 },
        explanation: 'Sudut bertolak belakang sama besar: ∠BOC = 64°.',
      },
      {
        id: 't14',
        type: 'choice',
        konteks: 'gambar',
        cerita: 'Sebuah sudut besarnya 52°.',
        pertanyaan: 'Berapa besar penyiku sudut itu?',
        cek: { minta: 'penyiku', sudut: 52 },
        explanation: 'Penyiku 52° = 90° − 52° = 38°.',
      },
      {
        id: 't15',
        type: 'choice',
        konteks: 'aljabar',
        cerita: 'Dua sudut bertolak belakang besarnya (4x − 10)° dan (2x + 30)°.',
        pertanyaan: 'Berapa besar masing-masing sudut itu?',
        cek: {
          minta: 'aljabar',
          relasi: 'bertolakBelakang',
          a: [4, -10],
          b: [2, 30],
          tanya: 'sudut',
        },
        explanation: '4x − 10 = 2x + 30 → x = 20, jadi besar sudutnya 4 × 20 − 10 = 70°.',
      },
      {
        id: 't16',
        type: 'choice',
        konteks: 'gunting',
        cerita: 'Pada gunting yang terbuka, ∠3 = 105°.',
        pertanyaan: 'Berapa besar ∠4?',
        cek: { minta: 'cari', diketahui: { k: 2, nilai: 105 }, ditanya: 3 },
        explanation: '∠3 dan ∠4 berpelurus: 180° − 105° = 75°.',
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
    guru: 'Ajak beberapa murid membacakan jawaban pertanyaan kedua. Catat miskonsepsi yang masih muncul (mis. penyiku dan pelurus tertukar, atau membaca skala busur yang salah) untuk pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan bahasamu perbedaan sudut berpelurus, berpenyiku, dan bertolak belakang. Beri satu contoh benda untuk masing-masing.',
        placeholder: 'Berpelurus artinya …, contohnya …',
      },
      {
        id: 'r2',
        teks: 'Mengapa sudut bertolak belakang selalu sama besar? Jelaskan alasannya, bukan hanya karena "terlihat sama".',
        placeholder: 'Karena ∠1 = 180° − ∠2 dan …',
      },
      {
        id: 'r3',
        teks: 'Kesalahan apa yang pernah kamu alami saat membaca busur atau menghitung sudut hari ini, dan bagaimana kamu memperbaikinya?',
        placeholder: 'Aku sempat … lalu aku …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menentukan besar sudut dengan hubungan antarsudut sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — aku bisa menjelaskannya kepada teman' },
      { id: 'yakin', label: '👍 Yakin — sesekali masih perlu melihat gambar' },
      { id: 'ragu', label: '🤔 Masih sering tertukar penyiku dan pelurus' },
      { id: 'bantuan', label: '🙋 Perlu bantuan guru lagi' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat! Kamu sudah menemukan hubungan antar sudut.',
    teks: 'Dengan memutar garis dan mengukur sudut sendiri, kamu menemukan bahwa sudut berpelurus berjumlah 180°, sudut berpenyiku berjumlah 90°, dan sudut bertolak belakang selalu sama besar.',
    contoh: [
      {
        jenis: 'berpelurus',
        gambar: { mode: 'potong', t: 60, label: ['60°', '120°', null, null], sorot: [0, 1] },
        rumus: '∠1 + ∠2 = 180°',
      },
      {
        jenis: 'bertolakBelakang',
        gambar: { mode: 'potong', t: 60, label: ['60°', null, '60°', null], sorot: [0, 2] },
        rumus: '∠1 = ∠3',
      },
      {
        jenis: 'berpenyiku',
        gambar: { mode: 'siku', t: 25, label: ['25°', '65°'], sorot: [0, 1] },
        rumus: '∠1 + ∠2 = 90°',
      },
    ],
    capaian: [
      'Mengukur besar sudut dengan busur derajat dan membaca skala yang tepat.',
      'Menemukan bahwa dua sudut berpelurus berjumlah 180°.',
      'Menemukan bahwa dua sudut berpenyiku berjumlah 90°.',
      'Menemukan dan menjelaskan mengapa sudut bertolak belakang sama besar.',
      'Menentukan besar sudut yang belum diketahui dengan hubungan antarsudut.',
    ],
  },
};
