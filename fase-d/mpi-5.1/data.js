'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Unsur-Unsur Bentuk Aljabar — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Mengidentifikasi variabel, konstanta, koefisien, dan suku pada bentuk
   aljabar yang dikenali dari situasi sehari-hari dan model konkret.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahVariabel', 'olahKoefisien'
                                         & 'olahSuku'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi    (7')  — "Bazar Kelas VII": nota belanja Rina
                             3k + 2j + 2.000 dan kantong kelereng Raka.
                             Murid MENDUGA bagian mana yang dapat berubah,
                             arti angka 3, dan banyak bagiannya (tidak
                             dinilai).
     2. Masalah      (5')  — memilih pertanyaan inti penyelidikan lalu
                             menulis dugaan sementara (hipotesis).
     3. Lab Kantong  (15') — model konkret: kantong berisi kelereng yang
                             banyaknya belum diketahui (variabel), banyak
                             kantong (koefisien), kelereng lepas
                             (konstanta), dan kantong/kelereng merah yang
                             dikurangkan (tanda negatif). Murid memodelkan
                             empat cerita, mencocokkan model, lalu menulis
                             dan MENCATAT bentuk aljabarnya (isian
                             berdiagnosa).
     4a. Olah Variabel & Konstanta (8') — pertanyaan temuan dari tabel
                             pengamatan, Ketuk Unsur, isian berdiagnosa.
     4b. Olah Koefisien (8') — banyak kantong = koefisien, koefisien
                             tersirat 1 dan −1, tanda ikut koefisien.
     4c. Olah Suku   (7')  — bagian yang dipisahkan + / −, konstanta juga
                             suku, 4x adalah satu suku.
     5. Verifikasi   (10') — memilah bagian dari bentuk aljabar baru,
                             memilah pernyataan, membandingkan dugaan
                             awal serta hipotesis dengan temuan.
     6. Generalisasi (5')  — menyusun definisi keempat unsur dari bank
                             kalimat acak.
     7. Uji terap    (12') — delapan soal diambil acak dari bank enam
                             belas soal (isian berdiagnosa & pilihan
                             ganda berpengecoh miskonsepsi).
     8. Refleksi     (3')  — rekap, refleksi tertulis, penilaian diri.

   Notasi kunci jawaban (`cek`, lihat engine seksi 74):
     { bentuk, minta: 'koefisien', variabel } → koefisien bertanda
     { bentuk, minta: 'konstanta' }           → konstanta bertanda
     { bentuk, minta: 'banyakSuku' }          → banyak suku
     { bentuk, minta: 'variabel' }            → daftar variabel
     { bentuk, minta: 'suku', ke }            → suku ke-ke (bertanda)
     { model, minta: 'bentuk' }               → bentuk aljabar dari model
     { bentuk, minta: 'jenis', bagian }       → jenis bagian
   model = { x, y, lepas } (banyak kantong x, kantong y, kelereng lepas;
   negatif = dikurangkan).

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Soal uji terap juga
   diambil acak dari bank dan opsi pilihan gandanya dibangun engine
   (opsiSoalUnsur) lalu diacak.

   Konsistensi kunci jawaban diuji tests/mpi-5.1-data.test.js terhadap
   engine seksi 74 (unsurBentuk, jenisBagianAljabar, periksaSoalUnsur,
   jawabSoalUnsur, opsiSoalUnsur).
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  meta: {
    judul: 'Unsur-Unsur Bentuk Aljabar',
  },

  tahap: [
    { id: 'stimulasi', label: 'Stimulasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'koleksi', label: 'Lab Kantong' },
    { id: 'olahVariabel', label: 'Variabel & Konstanta' },
    { id: 'olahKoefisien', label: 'Koefisien' },
    { id: 'olahSuku', label: 'Suku' },
    { id: 'verifikasi', label: 'Verifikasi' },
    { id: 'generalisasi', label: 'Generalisasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Label konteks soal (ikon + nama). */
  konteks: {
    bazar: { ikon: '🛍️', nama: 'Bazar' },
    kantong: { ikon: '👝', nama: 'Model Kantong' },
    sekolah: { ikon: '🏫', nama: 'Sekolah' },
    simbol: { ikon: '🔤', nama: 'Bentuk Aljabar' },
  },

  /* Legenda warna unsur (dipakai di beberapa tahap). */
  legenda: [
    { cls: 'aljabar-var', label: 'variabel' },
    { cls: 'aljabar-koef', label: 'koefisien' },
    { cls: 'aljabar-konst', label: 'konstanta' },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; dibandingkan dengan temuan pada tahap
     Verifikasi. `baku` = jawaban menurut engine bila ada `cek`.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati nota belanja dan kantong kelereng di bazar kelas, lalu menduga arti setiap bagian bentuk aljabarnya.',
    tp: 'Mengidentifikasi variabel, konstanta, koefisien, dan suku pada bentuk aljabar yang dikenali dari situasi sehari-hari dan model konkret.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Memodelkan situasi sehari-hari dengan kantong & kelereng, lalu menuliskan bentuk aljabarnya.',
      'Menunjukkan variabel pada bentuk aljabar dan menjelaskan nilai apa yang diwakilinya.',
      'Menentukan koefisien setiap variabel, termasuk koefisien 1, −1, dan koefisien negatif.',
      'Menentukan konstanta beserta tandanya.',
      'Menyebutkan suku-suku dan banyak suku pada sebuah bentuk aljabar.',
    ],
    guru: 'Tampilkan kedua kartu. Biarkan pasangan murid menebak arti huruf dan angka tanpa istilah resmi dulu. Jangan membenarkan atau menyalahkan — dugaan seperti "k artinya kue" atau "3k + 2j + 2.000 ada 6 bagian" justru menjadi bahan penemuan.',
    judul: 'Bazar Kelas VII',
    pengantar:
      'Kelas VII mengadakan bazar. Harga di setiap stan baru ditentukan pagi nanti, jadi panitia mencatat belanja dengan huruf. Raka di stan permainan juga menyiapkan kantong-kantong kelereng yang isinya belum dihitung.',
    kartu: [
      {
        id: 'kNota',
        ikon: '🧾',
        judul: 'Nota belanja Rina',
        teks: 'Rina membeli 3 bungkus kue dan 2 botol jus, lalu membayar parkir sepeda Rp2.000. Harga sebungkus kue ditulis k rupiah dan harga sebotol jus j rupiah.',
        bentuk: '3k + 2j + 2.000',
      },
      {
        id: 'kKantong',
        ikon: '👝',
        judul: 'Kelereng Raka',
        teks: 'Raka membawa 3 kantong kelereng. Isi setiap kantong sama banyak, tetapi belum dihitung — kita sebut x butir. Ia juga memegang 2 kelereng lepas.',
        model: { x: 3, lepas: 2 },
      },
    ],
    dugaan: [
      {
        id: 'dBerubah',
        tanya:
          'Pada nota 3k + 2j + 2.000, bagian mana yang nilainya belum diketahui dan dapat berubah?',
        opsi: [
          { id: 'kj', label: 'k dan j' },
          { id: 'angka32', label: '3 dan 2' },
          { id: 'parkir', label: '2.000' },
          { id: 'semua', label: 'Semua bilangan pada nota' },
        ],
        baku: 'kj',
        cek: { bentuk: '3k + 2j + 2.000', minta: 'variabel' },
        pembahasan:
          'k dan j mewakili harga yang belum ditentukan, jadi nilainya dapat berubah. Huruf seperti ini disebut variabel.',
      },
      {
        id: 'dTiga',
        tanya: 'Apa arti angka 3 pada 3k?',
        opsi: [
          { id: 'banyak', label: 'Banyak bungkus kue yang dibeli' },
          { id: 'harga', label: 'Harga sebungkus kue, Rp3.000' },
          { id: 'urutan', label: 'Kue yang ketiga' },
          { id: 'nilaiK', label: 'Nilai k adalah 3' },
        ],
        baku: 'banyak',
        pembahasan:
          '3k artinya 3 × k: tiga bungkus kue, masing-masing seharga k rupiah. Bilangan 3 ini disebut koefisien dari k.',
      },
      {
        id: 'dBagian',
        tanya: 'Bentuk 3k + 2j + 2.000 terdiri atas berapa bagian yang dijumlahkan?',
        opsi: [
          { id: 'b3', label: '3 bagian' },
          { id: 'b2', label: '2 bagian (hanya yang berhuruf)' },
          { id: 'b5', label: '5 bagian' },
          { id: 'b6', label: '6 bagian' },
        ],
        baku: 'b3',
        cek: { bentuk: '3k + 2j + 2.000', minta: 'banyakSuku' },
        pembahasan:
          'Ada 3 bagian yang dipisahkan tanda +: 3k, 2j, dan 2.000. Setiap bagian disebut suku — termasuk 2.000 yang tidak berhuruf.',
      },
    ],
    alasanLabel: 'Menurutmu, mengapa panitia memakai huruf k dan j? Tulis singkat.',
    alasanPlaceholder: 'Contoh: karena harganya belum …',
    catatan:
      'Dugaan ini belum dinilai. Kalian akan memeriksanya sendiri dengan memodelkan cerita memakai kantong dan kelereng.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — PROBLEM STATEMENT
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan penyelidikan tentang bagian-bagian bentuk aljabar, lalu menulis hipotesis.',
    guru: 'Arahkan murid pada pertanyaan yang dapat diselidiki dengan model kantong. Pertanyaan menghitung total belanja belum bisa dijawab karena harganya belum diketahui — bahas mengapa.',
    pengantar:
      'Bentuk seperti 3k + 2j + 2.000 dan 3x + 2 memuat huruf, bilangan yang menempel pada huruf, bilangan yang berdiri sendiri, serta tanda + dan −. Pertanyaan mana yang paling tepat untuk diselidiki hari ini?',
    pertanyaan: 'Pilih pertanyaan inti penyelidikan kita:',
    opsi: [
      {
        id: 'inti',
        label:
          'Apa nama dan arti setiap bagian bentuk aljabar — huruf, bilangan di depan huruf, bilangan yang berdiri sendiri, dan bagian yang dipisahkan + atau −?',
      },
      { id: 'total', label: 'Berapa rupiah total belanja Rina di bazar?' },
      { id: 'huruf', label: 'Mengapa harga kue harus ditulis dengan huruf k, bukan huruf lain?' },
      { id: 'hitung', label: 'Bagaimana cara menjumlahkan 3k dengan 2j?' },
    ],
    correct: 'inti',
    umpan: {
      inti: 'Tepat! Pertanyaan ini dapat kita selidiki dengan memodelkan cerita dan mengamati bentuk aljabarnya.',
      total:
        'Harga kue dan jus belum diketahui, jadi totalnya belum bisa dihitung. Justru itulah mengapa huruf dipakai. Pilih pertanyaan tentang bagian-bagian bentuknya.',
      huruf:
        'Huruf apa pun boleh dipakai; k hanya dipilih agar mudah diingat. Yang lebih penting: apa yang diwakili huruf itu dan bagian lain bentuknya.',
      hitung:
        'Itu materi operasi aljabar yang akan datang. Sebelum menghitung, kita perlu mengenali dulu bagian-bagian bentuk aljabar.',
    },
    hipotesisLabel:
      'Tulis dugaan sementaramu (hipotesis): apa arti huruf, bilangan di depan huruf, dan bilangan yang berdiri sendiri?',
    hipotesisPlaceholder:
      'Contoh: menurutku huruf mewakili …, bilangan di depan huruf menyatakan …',
    nextLabel: 'Lanjut: Lab Kantong →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — DATA COLLECTION: LAB KANTONG
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Mengumpulkan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Memodelkan empat cerita dengan kantong dan kelereng, lalu mencatat bentuk aljabarnya di tabel pengamatan.',
    guru: 'Murid bergantian: satu membaca cerita dan mengatur model, yang lain menulis bentuk aljabarnya. Saat ada kantong merah, tanyakan: "Kata apa di cerita yang membuat kantong ini dikurangkan?"',
    pengantar:
      'Di stan permainan, setiap kantong berisi kelereng yang banyaknya sama tetapi belum dihitung. Kantong biru berisi x butir, kantong hijau berisi y butir. Kantong atau kelereng yang harus diserahkan (dikurangkan) ditandai merah.',
    tips: [
      'Benda yang isinya belum diketahui → kantong. Benda yang banyaknya sudah pasti → kelereng lepas.',
      'Kata "memberikan", "menyerahkan", atau "dikurangi" berarti kantong/kelereng itu dikurangkan (nilai negatif).',
      'Tulis kantong lebih dulu, lalu kelereng lepas, misalnya 2x + y − 3.',
    ],
    lab: {
      huruf: ['x', 'y'],
      batas: 5,
      batasLepas: 9,
      situasi: [
        {
          id: 'sRaka',
          judul: 'Kelereng Raka',
          cerita: 'Raka membawa 3 kantong biru dan 2 kelereng lepas.',
          model: { x: 3, lepas: 2 },
        },
        {
          id: 'sSinta',
          judul: 'Hadiah Sinta',
          cerita:
            'Sinta menyiapkan 2 kantong biru, 1 kantong hijau, dan 4 kelereng lepas untuk hadiah.',
          model: { x: 2, y: 1, lepas: 4 },
        },
        {
          id: 'sDimas',
          judul: 'Kelereng Dimas',
          cerita: 'Dimas membawa 4 kantong biru, lalu memberikan 3 kelereng lepas kepada adiknya.',
          model: { x: 4, lepas: -3 },
        },
        {
          id: 'sNadia',
          judul: 'Pinjaman Nadia',
          cerita:
            'Nadia memegang 2 kantong biru dan 5 kelereng lepas, tetapi masih harus menyerahkan 1 kantong hijau kepada panitia.',
          model: { x: 2, y: -1, lepas: 5 },
        },
      ],
    },
    selesaiTeks:
      'Keempat cerita sudah dimodelkan dan dicatat. Amati tabel: dari mana asal huruf, bilangan di depan huruf, dan bilangan yang berdiri sendiri?',
    nextLabel: 'Lanjut: Olah Data Variabel & Konstanta →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — DATA PROCESSING: VARIABEL & KONSTANTA
     ---------------------------------------------------------- */
  olahVariabel: {
    kicker: 'Tahap 4a · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan ciri variabel dan konstanta dari tabel pengamatan.',
    guru: 'Minta murid menunjuk kolom tabel yang menjadi sumber huruf dan kolom yang menjadi bilangan yang berdiri sendiri. Tekankan: variabel mewakili BILANGAN, bukan nama benda.',
    judul: 'Huruf dan bilangan yang berdiri sendiri',
    pengantar:
      'Lihat kembali tabel pengamatanmu. Huruf x dan y selalu berasal dari kantong, sedangkan bilangan yang berdiri sendiri berasal dari kelereng lepas.',
    temuan: [
      {
        id: 'tvHuruf',
        tanya: 'Pada model, apa yang diwakili huruf x?',
        opsi: [
          { id: 'isi', label: 'Banyak kelereng di dalam satu kantong biru, yang belum diketahui' },
          { id: 'nama', label: 'Nama kantong biru' },
          { id: 'banyakKantong', label: 'Banyak kantong biru' },
          { id: 'lepas', label: 'Banyak kelereng lepas' },
        ],
        correct: 'isi',
        umpan: {
          isi: 'Tepat! x mewakili sebuah bilangan — isi satu kantong — yang belum diketahui.',
          nama: 'x bukan nama atau singkatan benda. x mewakili sebuah bilangan: banyak kelereng di dalam satu kantong.',
          banyakKantong:
            'Banyak kantong ditulis sebagai bilangan di depan x (mis. 3 pada 3x). x sendiri mewakili isi satu kantong.',
          lepas: 'Kelereng lepas ditulis sebagai bilangan yang berdiri sendiri, tanpa huruf.',
        },
      },
      {
        id: 'tvMengapa',
        tanya: 'Mengapa isi kantong ditulis dengan huruf, bukan angka?',
        opsi: [
          { id: 'belum', label: 'Karena nilainya belum diketahui dan dapat berubah-ubah' },
          { id: 'singkat', label: 'Karena huruf lebih singkat daripada angka' },
          { id: 'besar', label: 'Karena isinya pasti lebih dari 9' },
          { id: 'aturan', label: 'Karena kantong biru selalu ditulis x' },
        ],
        correct: 'belum',
        umpan: {
          belum:
            'Tepat! Huruf yang mewakili bilangan yang belum diketahui atau dapat berubah disebut variabel.',
          singkat:
            'Bukan soal singkat. Huruf dipakai karena kita belum tahu bilangannya — isinya bisa 5, 12, atau berapa saja.',
          besar:
            'Kita tidak tahu isinya berapa, bisa sedikit atau banyak. Itulah mengapa dipakai huruf.',
          aturan:
            'Huruf apa pun boleh dipakai. Yang penting huruf itu mewakili bilangan yang belum diketahui.',
        },
      },
      {
        id: 'tvLepas',
        tanya: 'Kelereng lepas ditulis sebagai bilangan tanpa huruf. Apa ciri bilangan ini?',
        opsi: [
          { id: 'tetap', label: 'Nilainya sudah pasti (tetap), tidak bergantung pada isi kantong' },
          { id: 'berubah', label: 'Nilainya berubah mengikuti isi kantong' },
          { id: 'kali', label: 'Bilangan itu dikalikan dengan x' },
          { id: 'positif', label: 'Bilangan itu selalu positif' },
        ],
        correct: 'tetap',
        umpan: {
          tetap: 'Tepat! Suku yang hanya berupa bilangan, tanpa variabel, disebut konstanta.',
          berubah:
            'Banyak kelereng lepas sudah dihitung, jadi nilainya tidak ikut berubah walaupun isi kantong berubah.',
          kali: 'Kelereng lepas tidak dikalikan dengan x — ia berdiri sendiri, dihubungkan dengan tanda + atau −.',
          positif: 'Tidak selalu. Lihat cerita Dimas: kelereng yang diberikan menjadi −3.',
        },
      },
    ],
    ketuk: [
      { id: 'kv1', bentuk: '2x + y + 4', mode: 'variabel' },
      { id: 'kv2', bentuk: '5p − 3q − 8', mode: 'konstanta' },
    ],
    langkah: [
      {
        id: 'lv1',
        label: 'Tuliskan semua variabel pada bentuk 4m + n − 7.',
        cek: { bentuk: '4m + n − 7', minta: 'variabel' },
        placeholder: 'mis. a, b',
        hints: ['Variabel adalah huruf. Cari semua huruf pada bentuk itu, tulis dipisah koma.'],
        temuan: 'Variabelnya m dan n — keduanya huruf yang mewakili bilangan yang belum diketahui.',
      },
      {
        id: 'lv2',
        label: 'Berapa konstanta pada bentuk 4m + n − 7?',
        cek: { bentuk: '4m + n − 7', minta: 'konstanta' },
        placeholder: 'mis. −3',
        hints: [
          'Konstanta adalah bilangan yang berdiri sendiri, tanpa huruf.',
          'Perhatikan tanda di depannya. Seperti cerita Dimas, "− 7" berarti 7 dikurangkan.',
        ],
        temuan: 'Konstantanya −7. Tanda − di depan 7 ikut menjadi milik konstanta itu.',
      },
    ],
    ringkasan:
      'Variabel adalah huruf yang mewakili bilangan yang belum diketahui atau dapat berubah. Konstanta adalah suku yang hanya berupa bilangan (tanpa variabel), beserta tandanya.',
    nextLabel: 'Lanjut: Olah Data Koefisien →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — DATA PROCESSING: KOEFISIEN
     ---------------------------------------------------------- */
  olahKoefisien: {
    kicker: 'Tahap 4b · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan hubungan banyak kantong dengan koefisien, termasuk koefisien 1, −1, dan koefisien negatif.',
    guru: 'Bandingkan baris Sinta (1 kantong hijau → y) dan Nadia (1 kantong hijau dikurangkan → −y). Tanyakan: "Kalau tidak ada angka yang ditulis, berapa banyak kantongnya?"',
    judul: 'Bilangan yang menempel di depan huruf',
    pengantar:
      'Pada tabel, kolom "Kantong x" dan "Kantong y" menjadi bilangan yang menempel di depan huruf. Bilangan itu disebut koefisien.',
    temuan: [
      {
        id: 'tkTiga',
        tanya: 'Pada model Raka, 3 kantong biru ditulis 3x. Bilangan 3 menyatakan …',
        opsi: [
          { id: 'banyak', label: 'banyak kantong biru, yaitu koefisien dari x' },
          { id: 'isi', label: 'isi setiap kantong biru' },
          { id: 'lepas', label: 'banyak kelereng lepas' },
          { id: 'tambah', label: 'x ditambah 3' },
        ],
        correct: 'banyak',
        umpan: {
          banyak: 'Tepat! 3x = 3 × x. Bilangan yang menempel di depan variabel disebut koefisien.',
          isi: 'Isi setiap kantong adalah x. Bilangan 3 menyatakan banyak kantongnya.',
          lepas: 'Kelereng lepas Raka adalah 2, ditulis terpisah: 3x + 2.',
          tambah: '3x berarti 3 × x (x + x + x), bukan x + 3.',
        },
      },
      {
        id: 'tkSatu',
        tanya: 'Sinta punya 1 kantong hijau dan menuliskannya y, tanpa angka. Berapa koefisien y?',
        opsi: [
          { id: 'satu', label: '1' },
          { id: 'nol', label: '0, karena tidak ada angkanya' },
          { id: 'tidakAda', label: 'Tidak punya koefisien' },
          { id: 'y', label: 'y' },
        ],
        correct: 'satu',
        umpan: {
          satu: 'Tepat! y = 1 × y. Angka 1 biasanya tidak ditulis, tetapi koefisiennya tetap 1.',
          nol: 'Kalau koefisiennya 0, tidak ada kantong sama sekali! Sinta punya 1 kantong, jadi y = 1 × y.',
          tidakAda: 'Setiap variabel punya koefisien. Satu kantong y berarti y = 1 × y.',
          y: 'y adalah variabelnya. Koefisien berupa bilangan: berapa banyak kantong y?',
        },
      },
      {
        id: 'tkNegatif',
        tanya:
          'Nadia harus menyerahkan 1 kantong hijau, sehingga ditulis 2x − y + 5. Berapa koefisien y?',
        opsi: [
          { id: 'minSatu', label: '−1' },
          { id: 'satu', label: '1' },
          { id: 'nol', label: '0' },
          { id: 'lima', label: '5' },
        ],
        correct: 'minSatu',
        umpan: {
          minSatu: 'Tepat! −y = −1 × y. Tanda − di depan suku ikut menjadi milik koefisiennya.',
          satu: 'Kantong hijau itu dikurangkan (merah), jadi tandanya ikut: koefisien y adalah −1.',
          nol: 'Ada satu kantong hijau yang dikurangkan, jadi koefisiennya bukan 0, melainkan −1.',
          lima: '5 adalah kelereng lepas — itu konstanta, bukan koefisien y.',
        },
      },
    ],
    ketuk: [],
    langkah: [
      {
        id: 'lk1',
        label: 'Berapa koefisien p pada bentuk 5p − 2q + 1?',
        cek: { bentuk: '5p − 2q + 1', minta: 'koefisien', variabel: 'p' },
        placeholder: 'mis. 4',
        hints: ['Koefisien p adalah bilangan yang menempel tepat di depan p.'],
        temuan: 'Koefisien p adalah 5 — ada "5 kantong p".',
      },
      {
        id: 'lk2',
        label: 'Berapa koefisien q pada bentuk 5p − 2q + 1?',
        cek: { bentuk: '5p − 2q + 1', minta: 'koefisien', variabel: 'q' },
        placeholder: 'mis. −3',
        hints: ['Perhatikan tanda di depan 2q. Kantong q itu ditambahkan atau dikurangkan?'],
        temuan: 'Koefisien q adalah −2. Tanda − ikut menjadi milik koefisien.',
      },
      {
        id: 'lk3',
        label: 'Berapa koefisien a pada bentuk a + 6?',
        cek: { bentuk: 'a + 6', minta: 'koefisien', variabel: 'a' },
        placeholder: 'mis. 2',
        hints: ['Tidak ada angka di depan a. Berapa banyak "kantong a"?'],
        temuan: 'Koefisien a adalah 1, karena a = 1 × a.',
      },
      {
        id: 'lk4',
        label: 'Berapa koefisien m pada bentuk 8 − m?',
        cek: { bentuk: '8 − m', minta: 'koefisien', variabel: 'm' },
        placeholder: 'mis. 1',
        hints: ['Tidak ada angka di depan m, tetapi ada tanda −.', '−m sama dengan −1 × m.'],
        temuan: 'Koefisien m adalah −1, karena −m = −1 × m.',
      },
    ],
    ringkasan:
      'Koefisien adalah bilangan yang menempel di depan variabel, beserta tandanya. x berarti 1 × x (koefisien 1) dan −x berarti −1 × x (koefisien −1).',
    nextLabel: 'Lanjut: Olah Data Suku →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — DATA PROCESSING: SUKU
     ---------------------------------------------------------- */
  olahSuku: {
    kicker: 'Tahap 4c · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan cara menentukan suku dan banyak suku pada bentuk aljabar.',
    guru: 'Kaitkan dengan model: setiap jenis kantong dan kelompok kelereng lepas adalah satu "kelompok" yang dihubungkan tanda + atau −. Luruskan miskonsepsi "4x itu dua suku".',
    judul: 'Bagian-bagian yang dipisahkan + dan −',
    pengantar:
      'Pada model Nadia, ada tiga kelompok: kantong biru, kantong hijau yang dikurangkan, dan kelereng lepas. Bentuknya 2x − y + 5. Setiap kelompok menjadi satu bagian yang dipisahkan tanda + atau −.',
    temuan: [
      {
        id: 'tsNama',
        tanya: 'Bagian-bagian bentuk aljabar yang dipisahkan tanda + atau − disebut …',
        opsi: [
          { id: 'suku', label: 'suku' },
          { id: 'variabel', label: 'variabel' },
          { id: 'koefisien', label: 'koefisien' },
          { id: 'konstanta', label: 'konstanta' },
        ],
        correct: 'suku',
        umpan: {
          suku: 'Tepat! 2x − y + 5 punya tiga suku: 2x, −y, dan 5.',
          variabel: 'Variabel hanya hurufnya. Bagian seperti 2x atau 5 disebut suku.',
          koefisien:
            'Koefisien hanya bilangan di depan huruf. Bagian utuh seperti 2x disebut suku.',
          konstanta:
            'Konstanta hanya suku yang berupa bilangan. Bagian seperti 2x juga termasuk, jadi namanya suku.',
        },
      },
      {
        id: 'tsKonstanta',
        tanya: 'Apakah 5 (kelereng lepas) pada 2x − y + 5 termasuk suku?',
        opsi: [
          { id: 'ya', label: 'Ya — konstanta juga suku' },
          { id: 'tidak', label: 'Tidak — suku harus memuat huruf' },
          { id: 'kadang', label: 'Hanya jika bilangannya positif' },
          { id: 'koef', label: 'Tidak — 5 adalah koefisien' },
        ],
        correct: 'ya',
        umpan: {
          ya: 'Tepat! Konstanta adalah suku yang tidak memuat variabel. Jadi bentuk ini punya 3 suku.',
          tidak:
            'Suku tidak harus berhuruf. Setiap bagian yang dipisahkan + atau − adalah suku, termasuk 5.',
          kadang:
            'Tanda tidak menentukan sebuah bagian disebut suku atau bukan. −3 pun tetap suku.',
          koef: '5 tidak menempel pada huruf, jadi bukan koefisien. 5 adalah konstanta, dan konstanta juga suku.',
        },
      },
      {
        id: 'tsEmpatX',
        tanya: 'Dimas menulis 4x − 3. Berapa banyak suku pada 4x?',
        opsi: [
          { id: 'satu', label: '1 suku, karena 4 dan x menempel (4 × x)' },
          { id: 'dua', label: '2 suku: 4 dan x' },
          { id: 'empat', label: '4 suku, karena ada 4 kantong' },
          { id: 'nol', label: 'Bukan suku, karena tidak ada tanda +' },
        ],
        correct: 'satu',
        umpan: {
          satu: 'Tepat! Koefisien dan variabel yang menempel membentuk satu suku. Jadi 4x − 3 punya 2 suku.',
          dua: '4 dan x tidak dipisahkan tanda + atau −; keduanya dikalikan (4 × x). Jadi 4x adalah satu suku.',
          empat: 'Empat kantong yang sejenis ditulis bersama sebagai satu suku: 4x.',
          nol: 'Suku pertama biasanya tidak diawali tanda +, tetapi tetap suku. 4x adalah satu suku.',
        },
      },
    ],
    ketuk: [{ id: 'ks1', bentuk: '3k + 2j + 2.000', mode: 'suku' }],
    langkah: [
      {
        id: 'ls1',
        label: 'Berapa banyak suku pada bentuk 6a − b + 3?',
        cek: { bentuk: '6a − b + 3', minta: 'banyakSuku' },
        placeholder: 'mis. 2',
        hints: ['Hitung bagian-bagian yang dipisahkan tanda + atau −. Jangan lupa konstantanya.'],
        temuan: 'Ada 3 suku: 6a, −b, dan 3.',
      },
      {
        id: 'ls2',
        label: 'Tuliskan suku kedua dari bentuk 6a − b + 3.',
        cek: { bentuk: '6a − b + 3', minta: 'suku', ke: 2 },
        placeholder: 'mis. 2x',
        hints: [
          'Suku pertama adalah 6a. Suku kedua ada sesudah tanda berikutnya.',
          'Tanda di depan suku ikut menjadi milik suku itu.',
        ],
        temuan: 'Suku kedua adalah −b. Tandanya ikut ditulis.',
      },
    ],
    ringkasan:
      'Suku adalah bagian bentuk aljabar yang dipisahkan tanda + atau −, beserta tandanya. Konstanta juga suku, dan koefisien beserta variabelnya (mis. 4x) adalah satu suku.',
    nextLabel: 'Lanjut: Verifikasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — VERIFICATION
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Verifikasi',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji temuan pada bentuk aljabar baru dan membandingkannya dengan dugaan awal.',
    guru: 'Pada bagian B, minta murid memberi contoh pendukung atau contoh penyangkal untuk setiap pernyataan sebelum memilih.',
    judulA: 'A. Bagian ini disebut apa?',
    pengantarA: 'Setiap butir menunjuk satu bagian dari sebuah bentuk aljabar baru. Pilih namanya.',
    kategori: [
      { id: 'variabel', label: 'Variabel' },
      { id: 'koefisien', label: 'Koefisien' },
      { id: 'konstanta', label: 'Konstanta' },
      { id: 'suku', label: 'Suku' },
    ],
    bagian: [
      {
        id: 'vb1',
        bentuk: '6p + 4',
        bagian: '6',
        konteks: 'Harga 6 pensil (p rupiah per pensil) ditambah Rp4 ribu.',
        correct: 'koefisien',
        explanation: '6 menempel di depan variabel p, jadi 6 adalah koefisien p.',
      },
      {
        id: 'vb2',
        bentuk: '6p + 4',
        bagian: '4',
        correct: 'konstanta',
        explanation: '4 berdiri sendiri tanpa variabel, jadi 4 adalah konstanta.',
      },
      {
        id: 'vb3',
        bentuk: '2a − 3b',
        bagian: 'b',
        correct: 'variabel',
        explanation:
          'b adalah huruf yang mewakili bilangan yang belum diketahui — sebuah variabel.',
      },
      {
        id: 'vb4',
        bentuk: '2a − 3b',
        bagian: '−3b',
        correct: 'suku',
        explanation: '−3b adalah bagian yang dipisahkan tanda −, beserta tandanya — sebuah suku.',
      },
      {
        id: 'vb5',
        bentuk: 'x − 9',
        bagian: '−9',
        correct: 'konstanta',
        explanation:
          '−9 hanya berupa bilangan tanpa variabel, jadi konstanta (dan tandanya negatif).',
      },
      {
        id: 'vb6',
        bentuk: '10t + 5.000',
        bagian: '10',
        konteks: 'Ongkos kirim: Rp5.000 ditambah 10 rupiah untuk setiap t gram paket.',
        correct: 'koefisien',
        explanation: '10 menempel di depan t, jadi 10 adalah koefisien t.',
      },
      {
        id: 'vb7',
        bentuk: '7 + 2y',
        bagian: 'y',
        correct: 'variabel',
        explanation:
          'y adalah huruf yang mewakili bilangan — variabel. Urutan suku tidak mengubah namanya.',
      },
      {
        id: 'vb8',
        bentuk: '7 + 2y',
        bagian: '2y',
        correct: 'suku',
        explanation: '2y (koefisien 2 dan variabel y) adalah satu suku.',
      },
    ],
    judulB: 'B. Selalu benar, kadang-kadang benar, atau salah?',
    opsiPernyataan: [
      { id: 'benar', label: 'Selalu benar' },
      { id: 'kadang', label: 'Kadang-kadang benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'p1',
        teks: 'Setiap variabel pada bentuk aljabar mempunyai koefisien, walaupun angkanya tidak ditulis.',
        correct: 'benar',
        explanation: 'x = 1 × x dan −x = −1 × x, jadi koefisiennya 1 atau −1.',
      },
      {
        id: 'p2',
        teks: 'Pada 5 − 2x, koefisien x adalah 2.',
        correct: 'salah',
        explanation: 'Tanda − ikut menjadi milik koefisien, jadi koefisien x adalah −2.',
      },
      {
        id: 'p3',
        teks: 'Konstanta juga merupakan suku.',
        correct: 'benar',
        explanation: 'Konstanta adalah suku yang tidak memuat variabel.',
      },
      {
        id: 'p4',
        teks: 'Huruf k pada 3k + 2j berarti "kue".',
        correct: 'salah',
        explanation: 'k mewakili sebuah bilangan, yaitu harga sebungkus kue — bukan bendanya.',
      },
      {
        id: 'p5',
        teks: 'Sebuah bentuk aljabar memiliki konstanta.',
        correct: 'kadang',
        explanation: '3x + 2 memiliki konstanta 2, tetapi 3x + y tidak memiliki konstanta.',
      },
      {
        id: 'p6',
        teks: '4x terdiri atas dua suku, yaitu 4 dan x.',
        correct: 'salah',
        explanation: '4x = 4 × x adalah satu suku; suku dipisahkan tanda + atau −.',
      },
      {
        id: 'p7',
        teks: 'Banyak suku sebuah bentuk aljabar sama dengan banyak variabelnya.',
        correct: 'kadang',
        explanation:
          'x + y punya 2 suku dan 2 variabel, tetapi x + 2 punya 2 suku dan hanya 1 variabel.',
      },
    ],
    judulC: 'C. Dugaan awal vs temuan',
    nextLabel: 'Lanjut: Generalisasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — GENERALIZATION
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Generalisasi',
    syntax: DL + ' · Sintaks 6',
    goal: 'Menyusun definisi variabel, koefisien, konstanta, dan suku berdasarkan temuan.',
    guru: 'Minta setiap pasangan membacakan satu definisi beserta contoh dari Lab Kantong sebelum memeriksa.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari bank kalimat. Setiap potongan hanya dipakai satu kali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'gVar', awal: 'Variabel adalah', correct: 'b1' },
      { id: 'gKoef', awal: 'Koefisien adalah', correct: 'b2' },
      { id: 'gKonst', awal: 'Konstanta adalah', correct: 'b3' },
      { id: 'gSuku', awal: 'Suku adalah', correct: 'b4' },
    ],
    bank: [
      { id: 'b1', teks: 'huruf yang mewakili bilangan yang belum diketahui atau dapat berubah.' },
      {
        id: 'b2',
        teks: 'bilangan yang menempel di depan variabel beserta tandanya; x berarti koefisiennya 1.',
      },
      { id: 'b3', teks: 'suku yang hanya berupa bilangan, tanpa variabel, beserta tandanya.' },
      {
        id: 'b4',
        teks: 'bagian bentuk aljabar yang dipisahkan tanda + atau −, beserta tandanya.',
      },
      { id: 'b5', teks: 'singkatan dari nama benda pada soal cerita.' },
      { id: 'b6', teks: 'setiap angka yang tertulis pada bentuk aljabar.' },
      { id: 'b7', teks: 'bilangan yang selalu bernilai positif.' },
    ],
    contoh: '2x − y + 5',
    rangkuman: [
      'Pada <strong>2x − y + 5</strong>: variabelnya <strong>x</strong> dan <strong>y</strong> (isi kantong yang belum diketahui).',
      'Koefisien x adalah <strong>2</strong> (dua kantong biru) dan koefisien y adalah <strong>−1</strong> (satu kantong hijau yang dikurangkan).',
      'Konstantanya <strong>5</strong> (lima kelereng lepas).',
      'Suku-sukunya <strong>2x</strong>, <strong>−y</strong>, dan <strong>5</strong> — ada 3 suku.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Bank 16 soal; diambil acak sesuai komposisi.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    goal: 'Menerapkan temuan untuk mengidentifikasi unsur bentuk aljabar dari situasi sehari-hari, model kantong, dan bentuk simbolik.',
    guru: 'Murid mengerjakan mandiri. Pesan salah berupa diagnosa miskonsepsi; minta murid membacanya sebelum mencoba lagi.',
    instruksi:
      'Jawab setiap soal. Tanda negatif boleh diketik sebagai tanda minus biasa (-). Jika keliru, baca pesannya lalu coba lagi.',
    banyak: 8,
    komposisi: { input: 5, choice: 3 },
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: 'bazar',
        cerita:
          'Stan Bu Ani menjual paket donat: 4 donat seharga d rupiah per donat ditambah kotak kemasan Rp1.500. Harga paketnya 4d + 1.500.',
        pertanyaan: 'Berapa koefisien d?',
        cek: { bentuk: '4d + 1.500', minta: 'koefisien', variabel: 'd' },
        hints: ['Koefisien adalah bilangan yang menempel di depan variabel d.'],
        reveal: 'Jawaban: 4.',
        explanation: 'Koefisien d adalah 4, yaitu banyak donat dalam satu paket.',
      },
      {
        id: 't2',
        type: 'input',
        konteks: 'bazar',
        cerita:
          'Kak Bima membawa Rp50.000, lalu membeli 3 gelas es teh seharga e rupiah per gelas. Sisa uangnya 50.000 − 3e.',
        pertanyaan: 'Berapa koefisien e?',
        cek: { bentuk: '50.000 − 3e', minta: 'koefisien', variabel: 'e' },
        hints: ['Perhatikan tanda di depan 3e: uang untuk es teh ditambahkan atau dikurangkan?'],
        reveal: 'Jawaban: −3.',
        explanation:
          'Koefisien e adalah −3, karena uang untuk 3 gelas es teh dikurangkan dari 50.000.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: 'sekolah',
        cerita:
          'Biaya mencetak modul kelas adalah 250h + 3.000 rupiah, dengan h banyak halaman dan Rp3.000 biaya sampul.',
        pertanyaan: 'Berapa konstanta pada bentuk tersebut?',
        cek: { bentuk: '250h + 3.000', minta: 'konstanta' },
        hints: ['Konstanta adalah bilangan yang berdiri sendiri, tanpa variabel.'],
        reveal: 'Jawaban: 3.000.',
        explanation: 'Konstantanya 3.000 (biaya sampul), sedangkan 250 adalah koefisien h.',
      },
      {
        id: 't4',
        type: 'input',
        konteks: 'simbol',
        cerita: 'Diketahui bentuk aljabar 7m − n − 8.',
        pertanyaan: 'Berapa konstantanya?',
        cek: { bentuk: '7m − n − 8', minta: 'konstanta' },
        hints: ['Cari suku tanpa huruf, lalu perhatikan tanda di depannya.'],
        reveal: 'Jawaban: −8.',
        explanation: 'Konstantanya −8, karena tanda − ikut menjadi milik konstanta.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: 'simbol',
        cerita: 'Diketahui bentuk aljabar x − 5y + 2.',
        pertanyaan: 'Berapa banyak suku pada bentuk tersebut?',
        cek: { bentuk: 'x − 5y + 2', minta: 'banyakSuku' },
        hints: ['Hitung bagian yang dipisahkan tanda + atau −, termasuk konstanta.'],
        reveal: 'Jawaban: 3.',
        explanation: 'Ada 3 suku: x, −5y, dan 2.',
      },
      {
        id: 't6',
        type: 'input',
        konteks: 'kantong',
        cerita:
          'Model: 2 kantong biru (x), 1 kantong hijau (y), dan 3 kelereng lepas yang dikurangkan (merah).',
        pertanyaan: 'Tuliskan bentuk aljabar untuk model ini.',
        cek: { model: { x: 2, y: 1, lepas: -3 }, minta: 'bentuk' },
        hints: [
          'Kantong biru → suku x, kantong hijau → suku y, kelereng lepas → konstanta.',
          'Kelereng merah berarti dikurangkan, jadi konstantanya negatif.',
        ],
        reveal: 'Jawaban: 2x + y − 3.',
        explanation: 'Bentuknya 2x + y − 3: koefisien x = 2, koefisien y = 1, konstanta −3.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: 'kantong',
        cerita:
          'Model: 1 kantong biru (x), 2 kantong hijau yang dikurangkan (merah), dan 6 kelereng lepas.',
        pertanyaan: 'Tuliskan bentuk aljabar untuk model ini.',
        cek: { model: { x: 1, y: -2, lepas: 6 }, minta: 'bentuk' },
        hints: [
          'Satu kantong biru cukup ditulis x.',
          'Dua kantong hijau yang dikurangkan ditulis − 2y.',
        ],
        reveal: 'Jawaban: x − 2y + 6.',
        explanation: 'Bentuknya x − 2y + 6: koefisien x = 1, koefisien y = −2, konstanta 6.',
      },
      {
        id: 't8',
        type: 'input',
        konteks: 'simbol',
        cerita: 'Diketahui bentuk aljabar 3a + 5 − c.',
        pertanyaan: 'Tuliskan semua variabelnya (pisahkan dengan koma).',
        cek: { bentuk: '3a + 5 − c', minta: 'variabel' },
        hints: ['Variabel adalah huruf. Urutan suku boleh acak — periksa semuanya.'],
        reveal: 'Jawaban: a, c.',
        explanation: 'Variabelnya a, c. Bilangan 3 adalah koefisien dan 5 adalah konstanta.',
      },
      {
        id: 't9',
        type: 'input',
        konteks: 'simbol',
        cerita: 'Diketahui bentuk aljabar 9 − 4t + s.',
        pertanyaan: 'Tuliskan suku kedua.',
        cek: { bentuk: '9 − 4t + s', minta: 'suku', ke: 2 },
        hints: ['Suku pertama adalah 9. Suku kedua beserta tandanya ada sesudahnya.'],
        reveal: 'Jawaban: −4t.',
        explanation: 'Suku kedua adalah −4t; tanda − ikut menjadi milik suku itu.',
      },
      {
        id: 't10',
        type: 'input',
        konteks: 'sekolah',
        cerita:
          'Uang kas minggu ini adalah 2.000s − 15.000 rupiah: s siswa membayar Rp2.000, lalu Rp15.000 dipakai membeli sapu.',
        pertanyaan: 'Berapa konstantanya?',
        cek: { bentuk: '2.000s − 15.000', minta: 'konstanta' },
        hints: ['Uang untuk membeli sapu ditambahkan atau dikurangkan?'],
        reveal: 'Jawaban: −15.000.',
        explanation: 'Konstantanya −15.000, karena uang membeli sapu dikurangkan dari kas.',
      },
      {
        id: 'c1',
        type: 'choice',
        konteks: 'bazar',
        cerita: 'Harga paket donat Bu Ani adalah 4d + 1.500 rupiah.',
        pertanyaan: 'Bilangan 1.500 pada bentuk tersebut disebut …',
        cek: { bentuk: '4d + 1.500', minta: 'jenis', bagian: '1.500' },
        explanation: '1.500 berdiri sendiri tanpa variabel, jadi disebut konstanta.',
      },
      {
        id: 'c2',
        type: 'choice',
        konteks: 'bazar',
        cerita: 'Belanja Rina ditulis 3k + 2j + 2.000.',
        pertanyaan: 'Huruf j pada bentuk tersebut disebut …',
        cek: { bentuk: '3k + 2j + 2.000', minta: 'jenis', bagian: 'j' },
        explanation:
          'j adalah variabel: huruf yang mewakili harga sebotol jus (sebuah bilangan), bukan singkatan "jus".',
      },
      {
        id: 'c3',
        type: 'choice',
        konteks: 'simbol',
        cerita: 'Diketahui bentuk aljabar 8 − y + 3x.',
        pertanyaan: 'Berapa koefisien y?',
        cek: { bentuk: '8 − y + 3x', minta: 'koefisien', variabel: 'y' },
        explanation: 'Koefisien y adalah −1, karena −y = −1 × y.',
      },
      {
        id: 'c4',
        type: 'choice',
        konteks: 'simbol',
        cerita: 'Diketahui bentuk aljabar 5p + 2q − r + 10.',
        pertanyaan: 'Berapa banyak suku pada bentuk tersebut?',
        cek: { bentuk: '5p + 2q − r + 10', minta: 'banyakSuku' },
        explanation: 'Ada 4 suku: 5p, 2q, −r, dan 10.',
      },
      {
        id: 'c5',
        type: 'choice',
        konteks: 'kantong',
        cerita:
          'Model: 3 kantong biru (x), 1 kantong hijau yang dikurangkan, dan 2 kelereng lepas yang dikurangkan.',
        pertanyaan: 'Bentuk aljabar yang tepat untuk model ini adalah …',
        cek: { model: { x: 3, y: -1, lepas: -2 }, minta: 'bentuk' },
        explanation: 'Bentuknya 3x − y − 2: kantong dan kelereng merah dikurangkan.',
      },
      {
        id: 'c6',
        type: 'choice',
        konteks: 'simbol',
        cerita: 'Diketahui bentuk aljabar 6a + b − 9.',
        pertanyaan: 'Suku ketiga dari bentuk tersebut adalah …',
        cek: { bentuk: '6a + b − 9', minta: 'suku', ke: 3 },
        explanation: 'Suku ketiga adalah −9, beserta tandanya.',
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
    guru: 'Ajak beberapa murid membacakan jawaban pertanyaan kedua. Catat miskonsepsi yang masih muncul untuk pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Bagaimana model kantong dan kelereng membantumu membedakan variabel, koefisien, dan konstanta?',
        placeholder: 'Kantong menunjukkan …, banyak kantong menunjukkan …, kelereng lepas …',
      },
      {
        id: 'r2',
        teks: 'Kesalahan apa yang hampir kamu lakukan hari ini (mis. melupakan tanda −)? Bagaimana cara menghindarinya?',
        placeholder: 'Aku hampir …, jadi lain kali aku …',
      },
      {
        id: 'r3',
        teks: 'Buat satu cerita belanja sendiri, tulis bentuk aljabarnya, lalu sebutkan unsur-unsurnya.',
        placeholder: 'Ceritaku: … Bentuknya: … Variabel: …, koefisien: …, konstanta: …, suku: …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu mengidentifikasi unsur bentuk aljabar sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — aku bisa menjelaskannya kepada teman' },
      { id: 'yakin', label: '👍 Yakin — sesekali masih perlu melihat contoh' },
      { id: 'ragu', label: '🤔 Masih ragu pada tanda negatif atau koefisien 1' },
      { id: 'bantuan', label: '🙋 Perlu bantuan guru lagi' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat! Kamu sudah menemukan unsur-unsur bentuk aljabar.',
    teks: 'Dari kantong dan kelereng di bazar, kamu menemukan sendiri arti setiap bagian bentuk aljabar.',
    contoh: [
      { bentuk: '3k + 2j + 2.000', keterangan: 'Nota belanja Rina di bazar' },
      { bentuk: '2x − y + 5', keterangan: 'Model kantong Nadia' },
      { bentuk: '50.000 − 3e', keterangan: 'Sisa uang Kak Bima' },
    ],
    capaian: [
      'Memodelkan cerita sehari-hari dengan kantong & kelereng lalu menuliskan bentuk aljabarnya.',
      'Menunjukkan variabel dan menjelaskan bilangan yang diwakilinya.',
      'Menentukan koefisien, termasuk koefisien 1, −1, dan koefisien negatif.',
      'Menentukan konstanta beserta tandanya.',
      'Menyebutkan suku-suku dan banyak suku sebuah bentuk aljabar.',
    ],
  },
};
