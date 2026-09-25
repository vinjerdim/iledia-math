'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membandingkan & Mengurutkan Bilangan Bulat dalam
   Kehidupan Sehari-hari — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Membandingkan dan mengurutkan bilangan bulat menggunakan garis
   bilangan dalam konteks kehidupan sehari-hari.

   Gagasan kunci yang dibangun di seluruh modul:
     • pada garis bilangan mendatar, bilangan di sebelah kanan selalu
       lebih besar daripada bilangan di sebelah kirinya;
     • setiap bilangan negatif < 0 < setiap bilangan positif;
     • di antara dua bilangan negatif, angka yang tampak lebih besar
       justru lebih kecil (−8 < −3) — miskonsepsi "abaikan tanda";
     • makna perbandingan mengikuti konteks: lebih kecil = lebih dingin,
       lebih dalam, lebih bawah, saldo lebih sedikit, skor lebih rendah;
     • mengurutkan naik = membaca garis dari kiri ke kanan, turun =
       dari kanan ke kiri.

   Model pembelajaran: COOPERATIVE LEARNING (sintaks Arends, dengan
   skor tim ala STAD). Pemetaan sintaks ke tahap media:

     Fase 1 — Menyampaikan tujuan & memotivasi ..... 'tujuan'
     Fase 2 — Menyajikan informasi .................. 'informasi'
     Fase 3 — Mengorganisasikan murid ke kelompok ... 'tim'
     Fase 4 — Membimbing kelompok bekerja & belajar . 'misiBanding',
                                                       'misiUrut',
                                                       'misiDiskusi'
     Fase 5 — Evaluasi ............................... 'kuis'
     Fase 6 — Memberikan penghargaan ................. 'penghargaan'
     Penutup ......................................... 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, tim heterogen 3–4 murid,
   satu perangkat per tim; kuis dikerjakan per murid):
     1. Tujuan      (7')  — "Laporan Cuaca Pagi": empat termometer kota.
                            Murid menduga kota paling dingin & paling
                            hangat serta menulis cara menentukannya.
     2. Informasi   (13') — Garis bilangan terpandu: menempatkan enam
                            bilangan konteks lalu menjawab pertanyaan
                            penuntun hingga menemukan aturan banding.
     3. Tim         (5')  — Nama tim, anggota, kesepakatan; peran
                            (Pembaca Soal, Penempat Garis, Pemeriksa,
                            Juru Bicara) diacak lalu dirotasi tiap misi.
     4. Misi 1      (12') — "Bandingkan!": lima pasangan konteks (suhu,
                            kedalaman, lantai, kas kelas, skor).
                            Tempatkan → pilih <, >, = (diagnosa
                            miskonsepsi) → pilih makna konteksnya.
     5. Misi 2      (12') — "Urutkan!": tiga set lima bilangan;
                            tempatkan di garis lalu susun kartu naik
                            atau turun dengan ketukan.
     6. Misi 3      (10') — "Cek Pendapat Teman": tujuh pernyataan
                            Benar/Salah berisi miskonsepsi; Juru Bicara
                            menulis penjelasan tim.
     7. Kuis        (12') — kuis individu: enam soal diambil acak dari
                            bank sepuluh soal (lambang, makna, nilai
                            ekstrem, pilihan urutan).
     8. Penghargaan (4')  — poin tim (50% misi + 50% kuis) → predikat
                            Tim Super / Tim Hebat / Tim Baik.
     9. Refleksi    (5')  — refleksi konsep & kerja sama, penilaian diri.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar". app.js mengacaknya SEKALI saat state disiapkan
   (ensureShuffledOrder / ensureSortStates / ensureTapOrderState /
   shuffleArray dari shared/engine.js), sehingga tiap murid dan tiap
   Reset mendapat urutan berbeda — termasuk urutan menempatkan bilangan,
   lambang <, >, =, opsi makna (dibuat engine: opsiMaknaBanding), kartu
   yang diurutkan, pernyataan diskusi, dan soal kuis yang terpilih.

   Konsistensi kunci jawaban diuji tests/mpi-1.2-data.test.js terhadap
   engine seksi 11 & 34 (compareSymbolId, idMaknaBanding, urutkanBulat, …).
   ============================================================ */

var CL = 'Cooperative Learning';

/* Opsi lambang untuk soal kuis pilihan ganda. */
var OPSI_LAMBANG = [
  { id: 'lt', label: '&lt; (kurang dari)' },
  { id: 'gt', label: '&gt; (lebih dari)' },
  { id: 'eq', label: '= (sama dengan)' },
];

var DATA = {
  meta: {
    judul: 'Membandingkan & Mengurutkan Bilangan Bulat dalam Kehidupan Sehari-hari',
  },

  tahap: [
    { id: 'tujuan', label: 'Tujuan' },
    { id: 'informasi', label: 'Informasi' },
    { id: 'tim', label: 'Bentuk Tim' },
    { id: 'misiBanding', label: 'Misi 1' },
    { id: 'misiUrut', label: 'Misi 2' },
    { id: 'misiDiskusi', label: 'Misi 3' },
    { id: 'kuis', label: 'Kuis' },
    { id: 'penghargaan', label: 'Penghargaan' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* ---------- Fase 1: tujuan & motivasi ---------- */
  tujuan: {
    kicker: 'Tahap 1 · Tujuan & Motivasi',
    goal: 'Mengenali tujuan belajar dan menduga cara membandingkan suhu yang negatif.',
    syntax: CL + ' · Fase 1',
    guru: 'Bacakan laporan cuaca dengan gaya penyiar. Minta murid menduga secara individu lebih dulu (1 menit), lalu bandingkan dugaan dengan teman sebangku. Jangan membenarkan atau menyalahkan dugaan — jawaban akan diuji bersama pada tahap Informasi.',
    judul: 'Laporan Cuaca Pagi',
    pengantar:
      'Selamat pagi! Berikut suhu udara pukul 05.00 di empat tempat di Indonesia. Dua di antaranya berada di pegunungan tinggi.',
    kota: [
      { id: 'dieng', nama: 'Dataran Tinggi Dieng', value: -2 },
      { id: 'jakarta', nama: 'Jakarta', value: 27 },
      { id: 'jaya', nama: 'Puncak Jaya', value: -6 },
      { id: 'lembang', nama: 'Lembang', value: 14 },
    ],
    termometer: { min: -10, max: 30, step: 10 },
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Membandingkan dan mengurutkan bilangan bulat menggunakan garis bilangan dalam konteks kehidupan sehari-hari.',
    kriteria: [
      'Menempatkan bilangan bulat pada garis bilangan.',
      'Memakai lambang <, >, = dengan tepat, termasuk untuk dua bilangan negatif.',
      'Menjelaskan arti perbandingan dalam konteks (lebih dingin, lebih dalam, …).',
      'Mengurutkan bilangan bulat dari terkecil ke terbesar dan sebaliknya.',
    ],
    dugaan: [
      {
        id: 'dingin',
        tanya: 'Menurut dugaanmu, tempat mana yang <strong>paling dingin</strong>?',
        opsi: [
          { id: 'dieng', label: 'Dataran Tinggi Dieng (−2 °C)' },
          { id: 'jakarta', label: 'Jakarta (27 °C)' },
          { id: 'jaya', label: 'Puncak Jaya (−6 °C)' },
          { id: 'lembang', label: 'Lembang (14 °C)' },
        ],
      },
      {
        id: 'hangat',
        tanya: 'Tempat mana yang <strong>paling hangat</strong>?',
        opsi: [
          { id: 'dieng', label: 'Dataran Tinggi Dieng (−2 °C)' },
          { id: 'jakarta', label: 'Jakarta (27 °C)' },
          { id: 'jaya', label: 'Puncak Jaya (−6 °C)' },
          { id: 'lembang', label: 'Lembang (14 °C)' },
        ],
      },
    ],
    kunciDugaan: { dingin: 'jaya', hangat: 'jakarta' },
    alasanLabel: 'Bagaimana caramu menentukan? Tulis dugaanmu dengan singkat.',
    alasanPlaceholder: 'Contoh: −6 lebih dingin karena …',
    catatan:
      'Dugaanmu belum dinilai. Kalian akan mengujinya dengan garis bilangan pada tahap berikutnya.',
    nextLabel: 'Uji dengan Garis Bilangan →',
  },

  /* ---------- Fase 2: menyajikan informasi ---------- */
  informasi: {
    kicker: 'Tahap 2 · Garis Bilangan',
    goal: 'Menemukan aturan membandingkan bilangan bulat dari letaknya pada garis bilangan.',
    syntax: CL + ' · Fase 2',
    guru: 'Peragakan satu penempatan di papan tulis (mis. −2), lalu biarkan murid menempatkan sisanya. Setelah pertanyaan penuntun, tuliskan aturan di papan dan minta murid menyalinnya dengan kata-kata sendiri.',
    pengantar:
      'Tempatkan setiap bilangan dari kehidupan sehari-hari pada garis bilangan. Perhatikan: di mana bilangan negatif berada, dan di mana bilangan positif berada?',
    garis: { min: -10, max: 10 },
    bilangan: [
      { value: -6, teks: 'suhu Puncak Jaya, °C' },
      { value: -2, teks: 'suhu Dieng, °C' },
      { value: 3, teks: 'lantai 3 sebuah mal' },
      { value: 0, teks: 'permukaan laut' },
      { value: -8, teks: 'penyelam 8 m di bawah permukaan laut' },
      { value: 5, teks: 'tim mendapat 5 poin' },
    ],
    penuntun: [
      {
        id: 'p1',
        tanya: 'Bilangan yang letaknya <strong>paling kiri</strong> adalah …',
        opsi: [
          { id: 'm8', label: '−8' },
          { id: 'nol', label: '0' },
          { id: 'p5', label: '5' },
          { id: 'm2', label: '−2' },
        ],
        correct: 'm8',
        umpan: {
          m8: 'Tepat! −8 berada 8 langkah di kiri 0 — paling jauh ke kiri. Bilangan paling kiri adalah yang <strong>paling kecil</strong>.',
          nol: '0 berada di tengah. Masih ada bilangan di sebelah kirinya.',
          p5: '5 justru berada paling kanan. Cari yang paling jauh di sebelah kiri 0.',
          m2: '−2 memang di kiri 0, tetapi hanya 2 langkah. Ada yang lebih jauh ke kiri.',
        },
      },
      {
        id: 'p2',
        tanya: 'Bandingkan −6 dan −2 pada garis. Letak −6 berada di sebelah …',
        opsi: [
          { id: 'kiriKecil', label: 'kiri −2, jadi −6 &lt; −2' },
          { id: 'kananBesar', label: 'kanan −2, jadi −6 &gt; −2' },
          { id: 'kiriBesar', label: 'kiri −2, tetapi −6 &gt; −2 karena 6 &gt; 2' },
        ],
        correct: 'kiriKecil',
        umpan: {
          kiriKecil:
            'Benar! Yang di kiri selalu lebih kecil, jadi −6 &lt; −2. Itu sebabnya Puncak Jaya (−6 °C) lebih dingin daripada Dieng (−2 °C).',
          kananBesar:
            'Lihat lagi garisnya: −6 berada 6 langkah di kiri 0, sedangkan −2 hanya 2 langkah.',
          kiriBesar:
            'Hati-hati! Jangan hanya membandingkan angkanya. Letak di kiri berarti lebih kecil, walaupun angka 6 tampak lebih besar daripada 2.',
        },
      },
      {
        id: 'p3',
        tanya: 'Pernyataan mana yang selalu benar?',
        opsi: [
          { id: 'negKecil', label: 'Setiap bilangan negatif lebih kecil daripada 0.' },
          { id: 'nolKecil', label: '0 lebih kecil daripada semua bilangan.' },
          {
            id: 'tergantung',
            label: 'Bilangan negatif bisa lebih besar daripada 0 jika angkanya besar.',
          },
        ],
        correct: 'negKecil',
        umpan: {
          negKecil:
            'Tepat! Semua bilangan negatif ada di kiri 0, jadi lebih kecil daripada 0 — dan juga lebih kecil daripada semua bilangan positif.',
          nolKecil: 'Bilangan negatif seperti −8 berada di kiri 0, jadi 0 bukan yang terkecil.',
          tergantung:
            'Sebesar apa pun angkanya, bilangan negatif tetap berada di kiri 0. Contoh: −100 &lt; 0.',
        },
      },
      {
        id: 'p4',
        tanya: 'Pada termometer, suhu yang bilangannya <strong>lebih kecil</strong> berarti …',
        opsi: [
          { id: 'dingin', label: 'lebih dingin' },
          { id: 'hangat', label: 'lebih hangat' },
          { id: 'sama', label: 'tidak ada hubungannya' },
        ],
        correct: 'dingin',
        umpan: {
          dingin:
            'Benar! Lebih kecil = lebih dingin. Begitu pula pada kedalaman laut: lebih kecil = lebih dalam; pada lantai gedung: lebih kecil = lebih bawah.',
          hangat: 'Coba ingat: −6 °C di Puncak Jaya, 27 °C di Jakarta. Mana yang lebih dingin?',
          sama: 'Ada hubungannya! Termometer adalah garis bilangan tegak: makin ke bawah, makin dingin.',
        },
      },
    ],
    aturanJudul: 'Aturan yang kita temukan',
    aturan: [
      'Pada garis bilangan mendatar, <strong>makin ke kanan makin besar</strong>, makin ke kiri makin kecil.',
      'Setiap bilangan negatif &lt; 0 &lt; setiap bilangan positif.',
      'Di antara dua bilangan negatif, angka yang tampak lebih besar justru lebih kecil: <strong>−8 &lt; −3</strong>.',
      '<strong>a &lt; b</strong> dibaca "a kurang dari b"; <strong>a &gt; b</strong> dibaca "a lebih dari b"; ujung runcing lambang menunjuk bilangan yang lebih kecil.',
      'Mengurutkan <strong>naik</strong> = membaca garis dari kiri ke kanan; <strong>turun</strong> = dari kanan ke kiri.',
    ],
    dugaanJudul: 'Cek dugaanmu di Tahap 1',
    nextLabel: 'Bentuk Tim →',
  },

  /* ---------- Fase 3: mengorganisasikan kelompok ---------- */
  tim: {
    kicker: 'Tahap 3 · Bentuk Tim',
    goal: 'Membentuk tim, menyepakati aturan kerja sama, dan menerima peran masing-masing.',
    syntax: CL + ' · Fase 3',
    guru: 'Bentuk tim heterogen 3–4 murid (campuran kemampuan & jenis kelamin). Tegaskan: skor tim bergantung pada kuis SETIAP anggota, jadi semua bertanggung jawab memastikan temannya paham. Peran dirotasi tiap misi agar semua mencoba setiap peran.',
    namaTimLabel: 'Nama tim',
    namaTimPlaceholder: 'Contoh: Tim Termometer',
    anggotaLabel: 'Nama anggota tim',
    minAnggota: 3,
    maksAnggota: 4,
    kesepakatanJudul: 'Kesepakatan tim (centang semua)',
    kesepakatan: [
      { id: 'peran', teks: 'Setiap anggota menjalankan perannya dan bergantian sesuai rotasi.' },
      { id: 'setuju', teks: 'Tombol Periksa baru ditekan setelah semua anggota setuju.' },
      { id: 'bantu', teks: 'Anggota yang sudah paham menjelaskan, bukan menjawabkan.' },
    ],
    acakLabel: '🎲 Acak Peran',
    acakUlangLabel: '🎲 Acak Ulang Peran',
    peranJudul: 'Peran tim',
    peranCatatan:
      'Peran bergeser satu anggota di setiap misi, sehingga semua mencoba setiap peran.',
    nextLabel: 'Mulai Misi 1 →',
  },

  /* ---------- Fase 4: misi tim ---------- */
  misiBanding: {
    kicker: 'Tahap 4 · Misi 1: Bandingkan!',
    goal: 'Membandingkan dua bilangan bulat dalam konteks dengan garis bilangan dan lambang <, >, =.',
    syntax: CL + ' · Fase 4',
    guru: 'Berkeliling dan dengarkan diskusi. Bila tim memilih lambang yang keliru, tanyakan: "Di mana letak kedua bilangan pada garis? Mana yang di kiri?" Pastikan Juru Bicara bisa menjelaskan jawaban dengan kalimat konteks.',
    ronde: 0,
    langkah: [
      'Pembaca Soal membacakan situasi.',
      'Penempat Garis mengetuk letak kedua bilangan setelah tim sepakat.',
      'Tim memilih lambang <, >, atau = lalu makna perbandingannya.',
    ],
    soal: [
      {
        id: 'b1',
        tema: 'suhu',
        cerita:
          'Pada pagi yang sama, termometer di Puncak Jaya menunjukkan −8 °C, sedangkan di Dieng −3 °C.',
        a: { value: -8, teks: 'Puncak Jaya' },
        b: { value: -3, teks: 'Dieng' },
        tanyaMakna: 'Jadi, dibandingkan Dieng, suhu di Puncak Jaya …',
      },
      {
        id: 'b2',
        tema: 'laut',
        cerita:
          'Rara menyelam 4 m di bawah permukaan laut (−4 m), sedangkan Bima menyelam 9 m di bawah permukaan laut (−9 m).',
        a: { value: -4, teks: 'Rara' },
        b: { value: -9, teks: 'Bima' },
        tanyaMakna: 'Jadi, dibandingkan posisi Bima, posisi Rara …',
      },
      {
        id: 'b3',
        tema: 'gedung',
        cerita:
          'Di sebuah mal, kantin berada di lantai 1, sedangkan parkir mobil berada di lantai B2 (−2).',
        a: { value: 1, teks: 'kantin' },
        b: { value: -2, teks: 'parkir' },
        tanyaMakna: 'Jadi, dibandingkan parkir mobil, kantin berada …',
      },
      {
        id: 'b4',
        tema: 'uang',
        cerita:
          'Dalam ribuan rupiah: kas Kelas 7A masih berutang Rp5.000 (−5), sedangkan kas Kelas 7B tepat impas (0).',
        a: { value: -5, teks: 'kas 7A' },
        b: { value: 0, teks: 'kas 7B' },
        tanyaMakna: 'Jadi, dibandingkan kas 7B, saldo kas 7A …',
      },
      {
        id: 'b5',
        tema: 'skor',
        cerita:
          'Pada lomba cerdas cermat, Tim Merah dan Tim Biru sama-sama kehilangan 4 poin, sehingga skor keduanya −4.',
        a: { value: -4, teks: 'Tim Merah' },
        b: { value: -4, teks: 'Tim Biru' },
        tanyaMakna: 'Jadi, dibandingkan skor Tim Biru, skor Tim Merah …',
      },
    ],
    catatanLabel: 'Catatan Juru Bicara: tulis satu kalimat perbandingan tim kalian (opsional).',
    catatanPlaceholder: 'Contoh: −8 < −3, jadi Puncak Jaya lebih dingin daripada Dieng.',
    nextLabel: 'Lanjut ke Misi 2 →',
  },

  misiUrut: {
    kicker: 'Tahap 5 · Misi 2: Urutkan!',
    goal: 'Mengurutkan beberapa bilangan bulat dari terkecil ke terbesar dan sebaliknya dengan bantuan garis bilangan.',
    syntax: CL + ' · Fase 4',
    guru: 'Minta Pemeriksa menanyakan "Urutan naik atau turun?" sebelum kartu disusun. Tim yang selesai lebih dulu diminta menjelaskan strateginya kepada tim lain.',
    ronde: 1,
    langkah: [
      'Tempatkan kelima bilangan pada garis bilangan.',
      'Baca garisnya: naik = dari kiri ke kanan, turun = dari kanan ke kiri.',
      'Ketuk kartu sesuai urutan, lalu tekan Periksa Urutan.',
    ],
    soal: [
      {
        id: 'u1',
        tema: 'suhu',
        arah: 'naik',
        cerita:
          'Suhu pagi (°C) di lima kota di Asia Timur saat musim dingin. Urutkan dari yang paling dingin ke yang paling hangat.',
        items: [
          { id: 'seoul', value: -5, teks: 'Seoul' },
          { id: 'beijing', value: -7, teks: 'Beijing' },
          { id: 'tokyo', value: 4, teks: 'Tokyo' },
          { id: 'sapporo', value: -2, teks: 'Sapporo' },
          { id: 'shanghai', value: 1, teks: 'Shanghai' },
        ],
        startLabel: 'Paling dingin',
        endLabel: 'Paling hangat',
        separator: '<',
      },
      {
        id: 'u2',
        tema: 'laut',
        arah: 'turun',
        cerita:
          'Posisi (meter) terhadap permukaan laut di sekitar dermaga. Urutkan dari yang paling tinggi ke yang paling rendah.',
        items: [
          { id: 'perahu', value: 0, teks: 'perahu' },
          { id: 'badut', value: -3, teks: 'ikan badut' },
          { id: 'camar', value: 6, teks: 'burung camar' },
          { id: 'kepiting', value: -10, teks: 'kepiting' },
          { id: 'penyu', value: -7, teks: 'penyu' },
        ],
        startLabel: 'Paling tinggi',
        endLabel: 'Paling rendah',
        separator: '>',
      },
      {
        id: 'u3',
        tema: 'skor',
        arah: 'turun',
        cerita:
          'Skor akhir lima tim pada lomba cerdas cermat (jawaban salah dikurangi poin). Susun papan peringkat dari skor tertinggi.',
        items: [
          { id: 'harimau', value: -2, teks: 'Tim Harimau' },
          { id: 'elang', value: 3, teks: 'Tim Elang' },
          { id: 'kancil', value: -4, teks: 'Tim Kancil' },
          { id: 'rusa', value: 5, teks: 'Tim Rusa' },
          { id: 'badak', value: 0, teks: 'Tim Badak' },
        ],
        startLabel: 'Skor tertinggi',
        endLabel: 'Skor terendah',
        separator: '>',
      },
    ],
    nextLabel: 'Lanjut ke Misi 3 →',
  },

  misiDiskusi: {
    kicker: 'Tahap 6 · Misi 3: Cek Pendapat Teman',
    goal: 'Menilai kebenaran pernyataan perbandingan & urutan bilangan bulat serta menjelaskan alasannya.',
    syntax: CL + ' · Fase 4',
    guru: 'Pernyataan berasal dari kesalahan yang sering dibuat murid. Minta tim berdiskusi sampai sepakat sebelum memilih (setiap pernyataan hanya bisa dijawab sekali). Pilih dua Juru Bicara secara acak untuk membacakan penjelasan timnya di depan kelas.',
    ronde: 2,
    pengantar:
      'Teman-teman dari kelas lain menuliskan pendapat berikut. Diskusikan dengan garis bilangan, lalu putuskan: Benar atau Salah?',
    garis: { min: -12, max: 6 },
    opsi: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'd1',
        teks: '"−8 &gt; −3, karena 8 lebih besar daripada 3."',
        correct: 'salah',
        cek: { jenis: 'lambang', a: -8, b: -3, sym: 'gt' },
        explanation:
          '−8 berada di kiri −3 pada garis bilangan, jadi −8 &lt; −3. Tanda negatif tidak boleh diabaikan.',
      },
      {
        id: 'd2',
        teks: '"0 adalah bilangan bulat yang paling kecil."',
        correct: 'salah',
        explanation:
          'Bilangan negatif (−1, −2, −3, …) berada di kiri 0, jadi semuanya lebih kecil daripada 0.',
      },
      {
        id: 'd3',
        teks: '"−1 &gt; −10."',
        correct: 'benar',
        cek: { jenis: 'lambang', a: -1, b: -10, sym: 'gt' },
        explanation:
          '−1 hanya 1 langkah di kiri 0, sedangkan −10 sepuluh langkah. −1 di kanan −10, jadi −1 &gt; −10.',
      },
      {
        id: 'd4',
        teks: '"Suhu −2 °C lebih dingin daripada suhu −5 °C."',
        correct: 'salah',
        cek: { jenis: 'makna', a: -2, b: -5, klaim: 'kecil' },
        explanation: '−2 &gt; −5, jadi −2 °C lebih hangat. Yang lebih dingin adalah −5 °C.',
      },
      {
        id: 'd5',
        teks: '"Penyelam di −12 m berada lebih dalam daripada penyelam di −7 m."',
        correct: 'benar',
        cek: { jenis: 'makna', a: -12, b: -7, klaim: 'kecil' },
        explanation:
          '−12 &lt; −7, dan di bawah permukaan laut bilangan yang lebih kecil berarti lebih dalam.',
      },
      {
        id: 'd6',
        teks: '"Urutan naik skor −6, −4, 0, 2, 5 sudah benar."',
        correct: 'benar',
        cek: { jenis: 'urut', nilai: [-6, -4, 0, 2, 5], arah: 'naik' },
        explanation: 'Dibaca dari kiri ke kanan pada garis bilangan: −6, −4, 0, 2, 5. Tepat!',
      },
      {
        id: 'd7',
        teks: '"Urutan lantai dari yang paling atas: 3, 1, −1, −2, 0."',
        correct: 'salah',
        cek: { jenis: 'urut', nilai: [3, 1, -1, -2, 0], arah: 'turun' },
        explanation:
          'Lantai dasar (0) berada di atas lantai −1 dan −2. Urutan yang benar: 3, 1, 0, −1, −2.',
      },
    ],
    jubirLabel:
      'Catatan Juru Bicara: pernyataan mana yang paling membuat tim kalian berdebat? Jelaskan alasan kalian dengan garis bilangan.',
    jubirPlaceholder: 'Contoh: Kami sempat mengira −8 > −3, tetapi pada garis bilangan …',
    nextLabel: 'Lanjut ke Kuis Individu →',
  },

  /* ---------- Fase 5: evaluasi (kuis individu) ---------- */
  kuis: {
    kicker: 'Tahap 7 · Kuis Individu',
    goal: 'Menunjukkan kemampuan membandingkan dan mengurutkan bilangan bulat secara mandiri.',
    syntax: CL + ' · Fase 5',
    guru: 'Kuis dikerjakan SENDIRI-SENDIRI tanpa bantuan tim (bila memakai satu perangkat, anggota bergiliran). Soal diambil acak dari bank sehingga tiap murid dapat soal berbeda. Jawaban pilihan ganda hanya bisa dipilih sekali.',
    instruksi: 'Kerjakan sendiri. Jawaban pilihan ganda hanya dapat dipilih sekali.',
    banyak: 6,
    komposisi: { lambang: 2, makna: 2, ekstrem: 1, urut: 1 },
    soal: [
      {
        id: 'k1',
        jenis: 'lambang',
        type: 'choice',
        a: -18,
        b: -6,
        cerita: 'Suhu di dalam freezer −18 °C, sedangkan suhu di dalam kotak es −6 °C.',
        pertanyaan: 'Lambang yang tepat untuk <strong>−18 ☐ −6</strong> adalah …',
        options: OPSI_LAMBANG,
        correct: 'lt',
        explanation:
          '−18 berada di kiri −6 pada garis bilangan, jadi −18 &lt; −6 (freezer lebih dingin).',
      },
      {
        id: 'k2',
        jenis: 'lambang',
        type: 'choice',
        a: 0,
        b: -3,
        cerita:
          'Saldo dompet digital Dimas Rp0, sedangkan saldo Rani −3 (ribu rupiah) karena berutang.',
        pertanyaan: 'Lambang yang tepat untuk <strong>0 ☐ −3</strong> adalah …',
        options: OPSI_LAMBANG,
        correct: 'gt',
        explanation: 'Setiap bilangan negatif lebih kecil daripada 0, jadi 0 &gt; −3.',
      },
      {
        id: 'k3',
        jenis: 'lambang',
        type: 'choice',
        a: -25,
        b: -40,
        cerita: 'Dasar Gua A berada 25 m di bawah permukaan tanah (−25), dasar Gua B 40 m (−40).',
        pertanyaan: 'Lambang yang tepat untuk <strong>−25 ☐ −40</strong> adalah …',
        options: OPSI_LAMBANG,
        correct: 'gt',
        explanation: '−25 berada di kanan −40, jadi −25 &gt; −40 walaupun 25 &lt; 40.',
      },
      {
        id: 'k4',
        jenis: 'makna',
        type: 'choice',
        tema: 'suhu',
        a: -4,
        b: 2,
        cerita: 'Suhu malam hari di Kota A −4 °C, sedangkan di Kota B 2 °C.',
        pertanyaan: 'Dibandingkan Kota B, suhu di Kota A …',
        options: [
          { id: 'kecil', label: 'lebih dingin' },
          { id: 'besar', label: 'lebih hangat' },
          { id: 'sama', label: 'sama suhunya' },
        ],
        correct: 'kecil',
        explanation: '−4 &lt; 2, dan suhu yang lebih kecil berarti lebih dingin.',
      },
      {
        id: 'k5',
        jenis: 'makna',
        type: 'choice',
        tema: 'laut',
        a: -15,
        b: -30,
        cerita: 'Kapal selam X berada di −15 m, sedangkan kapal selam Y di −30 m.',
        pertanyaan: 'Dibandingkan kapal selam Y, posisi kapal selam X …',
        options: [
          { id: 'kecil', label: 'lebih dalam' },
          { id: 'besar', label: 'lebih dangkal' },
          { id: 'sama', label: 'sama dalamnya' },
        ],
        correct: 'besar',
        explanation: '−15 &gt; −30, jadi X lebih dekat ke permukaan laut — lebih dangkal.',
      },
      {
        id: 'k6',
        jenis: 'makna',
        type: 'choice',
        tema: 'gedung',
        a: -3,
        b: -1,
        cerita: 'Mobil Pak Ali parkir di lantai B3 (−3), sedangkan mobil Bu Sri di lantai B1 (−1).',
        pertanyaan: 'Dibandingkan mobil Bu Sri, mobil Pak Ali berada …',
        options: [
          { id: 'kecil', label: 'lebih bawah' },
          { id: 'besar', label: 'lebih atas' },
          { id: 'sama', label: 'di lantai yang sama' },
        ],
        correct: 'kecil',
        explanation: '−3 &lt; −1, jadi lantai B3 berada lebih bawah daripada B1.',
      },
      {
        id: 'k7',
        jenis: 'ekstrem',
        type: 'input',
        cari: 'terkecil',
        nilai: [-3, 5, -9, 0, 2],
        cerita: 'Suhu rata-rata lima kota di Eropa pada bulan Januari (°C): −3, 5, −9, 0, 2.',
        pertanyaan: 'Ketik suhu yang <strong>paling dingin</strong>.',
        jawab: -9,
        hints: [
          'Suhu paling dingin adalah bilangan yang paling kecil — paling kiri pada garis bilangan.',
          'Bandingkan bilangan negatifnya saja: −3 dan −9. Mana yang lebih jauh di kiri 0?',
        ],
        reveal: 'Jawaban: <strong>−9</strong>.',
        explanation: '−9 berada paling kiri, jadi −9 °C adalah suhu paling dingin.',
      },
      {
        id: 'k8',
        jenis: 'ekstrem',
        type: 'input',
        cari: 'terbesar',
        nilai: [-8, -2, -5, -11],
        cerita:
          'Saldo empat dompet digital (ribu rupiah) setelah dipakai berutang: −8, −2, −5, −11.',
        pertanyaan: 'Ketik saldo yang <strong>paling besar</strong>.',
        jawab: -2,
        hints: [
          'Semua saldo negatif. Saldo paling besar adalah yang paling kanan pada garis bilangan.',
          'Yang paling dekat dengan 0 adalah yang paling besar.',
        ],
        reveal: 'Jawaban: <strong>−2</strong>.',
        explanation:
          '−2 paling dekat dengan 0 (paling kanan), jadi −2 adalah saldo terbesar — utangnya paling sedikit.',
      },
      {
        id: 'k9',
        jenis: 'urut',
        type: 'choice',
        arah: 'naik',
        nilai: [4, -6, 0, -1, 3],
        cerita: 'Suhu (°C) yang tercatat di sebuah desa pegunungan: 4, −6, 0, −1, 3.',
        pertanyaan:
          'Urutan dari yang <strong>paling dingin</strong> ke <strong>paling hangat</strong> adalah …',
        options: [
          { id: 'o1', label: '−6, −1, 0, 3, 4' },
          { id: 'o2', label: '−1, −6, 0, 3, 4' },
          { id: 'o3', label: '0, −1, −6, 3, 4' },
          { id: 'o4', label: '4, 3, 0, −1, −6' },
        ],
        correct: 'o1',
        explanation: 'Urutan naik dibaca dari kiri ke kanan pada garis bilangan: −6, −1, 0, 3, 4.',
      },
      {
        id: 'k10',
        jenis: 'urut',
        type: 'choice',
        arah: 'turun',
        nilai: [-20, 15, -5, 0, 10],
        cerita:
          'Posisi (meter) lima titik pada peta wisata pantai: bukit 15, menara pandang 10, pantai 0, karang −5, bangkai kapal −20.',
        pertanyaan:
          'Urutan dari yang <strong>paling tinggi</strong> ke <strong>paling rendah</strong> adalah …',
        options: [
          { id: 'o1', label: '15, 10, 0, −5, −20' },
          { id: 'o2', label: '15, 10, 0, −20, −5' },
          { id: 'o3', label: '−20, −5, 0, 10, 15' },
          { id: 'o4', label: '0, −5, 10, 15, −20' },
        ],
        correct: 'o1',
        explanation: 'Urutan turun dibaca dari kanan ke kiri: 15, 10, 0, −5, −20.',
      },
    ],
    nextLabel: 'Lihat Penghargaan Tim →',
  },

  /* ---------- Fase 6: penghargaan ---------- */
  penghargaan: {
    kicker: 'Tahap 8 · Penghargaan Tim',
    goal: 'Merayakan hasil kerja sama tim berdasarkan skor misi dan kuis individu.',
    syntax: CL + ' · Fase 6',
    guru: 'Umumkan predikat setiap tim di depan kelas. Tekankan bahwa kuis individu ikut menentukan poin tim, jadi saling membantu memahami itu penting. Beri kesempatan tim dengan predikat tertinggi membagikan strategi kerja samanya.',
    bobot: 'Poin tim = 50% skor misi (benar pada percobaan pertama) + 50% skor kuis individu.',
    pujianLabel: 'Tulis satu pujian untuk teman satu tim (siapa dan apa bantuannya).',
    pujianPlaceholder: 'Contoh: Terima kasih Sinta, penjelasanmu tentang −8 < −3 membuatku paham.',
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ---------- Penutup ---------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    goal: 'Merefleksikan pemahaman konsep dan cara bekerja sama dalam tim.',
    syntax: CL + ' · Penutup',
    guru: 'Minta 2–3 murid membacakan jawaban refleksi. Catat murid yang memilih "belum yakin" untuk pendampingan pada pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Bagaimana garis bilangan membantumu membandingkan dua bilangan negatif?',
        placeholder: 'Tulis jawabanmu…',
      },
      {
        id: 'r2',
        teks: 'Berikan satu contoh dari kehidupanmu sendiri yang memakai perbandingan bilangan bulat.',
        placeholder: 'Contoh: suhu di kulkas, lantai parkir, skor permainan…',
      },
      {
        id: 'r3',
        teks: 'Peran apa yang paling kamu sukai di tim? Apa yang kamu sumbangkan untuk tim?',
        placeholder: 'Tulis jawabanmu…',
      },
    ],
    diriLabel: 'Seberapa yakin kamu membandingkan dan mengurutkan bilangan bulat sekarang?',
    diriOpsi: [
      { id: 'yakin', label: '😄 Yakin — aku bisa menjelaskannya ke teman' },
      { id: 'cukup', label: '🙂 Cukup yakin — kadang masih perlu melihat garis bilangan' },
      { id: 'belum', label: '🤔 Belum yakin — aku masih bingung dengan bilangan negatif' },
    ],
    nextLabel: 'Simpan & Selesai',
  },

  selesai: {
    judul: 'Misi Tim Tuntas!',
    teks: 'Kalian sudah membandingkan dan mengurutkan bilangan bulat dengan garis bilangan dalam berbagai konteks sehari-hari.',
    capaian: [
      'Menempatkan bilangan bulat dari konteks sehari-hari pada garis bilangan.',
      'Membandingkan dua bilangan bulat dengan lambang <, >, =.',
      'Menjelaskan arti perbandingan: lebih dingin, lebih dalam, lebih bawah, lebih sedikit, lebih rendah.',
      'Mengurutkan bilangan bulat naik dan turun.',
      'Bekerja sama dalam tim dengan peran yang bergiliran.',
    ],
  },
};
