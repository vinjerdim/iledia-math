'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membandingkan & Mengurutkan Bilangan Bulat
   Fase D — SMP Kelas 7

   Tujuan Pembelajaran:
   Membandingkan dan mengurutkan bilangan bulat menggunakan garis
   bilangan sebagai alat bantu.

   Gagasan kunci yang dibangun sepanjang modul:
     • pada garis bilangan mendatar, bilangan di sebelah KANAN selalu
       lebih besar daripada bilangan di sebelah kirinya;
     • setiap bilangan negatif < 0 < setiap bilangan positif;
     • di antara dua bilangan negatif, yang lebih dekat ke 0 lebih besar
       (−2 > −7), meskipun angka tanpa tandanya lebih kecil;
     • mengurutkan naik = membaca titik dari kiri ke kanan; mengurutkan
       turun = dari kanan ke kiri.

   Model pembelajaran: COOPERATIVE LEARNING (tipe STAD).
   Pemetaan sintaks ke tahap media:

     Fase 1 — Menyampaikan tujuan & memotivasi ...... tahap 'orientasi'
     Fase 2 — Menyajikan informasi ................... tahap 'informasi'
     Fase 3 — Mengorganisasikan kelompok belajar ..... tahap 'tim'
     Fase 4 — Membimbing kelompok bekerja & belajar .. tahap 'misi'
     Fase 5 — Evaluasi ............................... tahap 'evaluasi'
     Fase 6 — Memberikan penghargaan ................. tahap 'penghargaan'
     Refleksi proses kelompok & penutup .............. 'refleksi', 'selesai'

   Unsur kooperatif yang dirancang di media:
     • saling ketergantungan positif — empat peran (Pembaca Soal,
       Penempat Garis, Pemeriksa, Juru Bicara) diacak lalu DIROTASI
       setiap misi, sehingga semua anggota memegang semua peran;
     • tanggung jawab individu — kuis tahap 5 dikerjakan sendiri dan
       skornya menyumbang poin tim;
     • interaksi tatap muka & keterampilan sosial — setiap misi
       menuntut kesepakatan tim sebelum mengetuk jawaban;
     • evaluasi proses kelompok — refleksi kerja sama di tahap 7.

   Rangkaian aktivitas (± 2 × 40 menit, kelompok heterogen 3–4 murid,
   satu perangkat per kelompok; kuis individu boleh di perangkat
   masing-masing):
     1. Orientasi     (7')  — "Laporan Cuaca Pagi": menduga tempat
                              paling dingin; mengenal tujuan & kriteria.
     2. Informasi     (13') — menjelajah garis bilangan (ketuk dua
                              titik → bandingkan), pertanyaan penuntun,
                              dan kartu aturan membandingkan.
     3. Bentuk Tim    (5')  — nama tim, anggota, kesepakatan, acak peran.
     4. Misi Tim      (30') — Misi 1 Bandingkan (<, >, =), Misi 2
                              Urutkan (naik & turun), Misi 3 Diskusi
                              Kesalahan (Benar/Salah beserta alasan).
     5. Kuis Individu (12') — delapan soal, dikerjakan sendiri.
     6. Penghargaan   (5')  — skor tim + skor individu → predikat STAD.
     7. Refleksi      (8')  — refleksi pribadi & kerja sama kelompok.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/ensureTapOrderState()/
   shuffleArray() dari shared/engine.js, satu kali saat state
   disiapkan, sehingga tiap kelompok (dan tiap Reset) mendapat urutan
   pilihan, kartu, pasangan bilangan, dan soal kuis yang berbeda.
   ============================================================ */

var CL = 'Cooperative Learning';

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI (Fase 1)
     Dugaan TIDAK dinilai; diuji lagi di akhir tahap Informasi
     dan pada soal pertama kuis individu.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    syntax: CL + ' · Fase 1',
    goal: 'Mengetahui tujuan belajar hari ini dan menyampaikan dugaan awal.',
    guru: 'Bacakan laporan cuaca seperti penyiar radio. Minta murid menduga sendiri dulu (10 detik), baru berdiskusi dengan teman sebangku. Jangan membenarkan dugaan apa pun — dugaan ini akan diuji di akhir tahap Informasi. Sampaikan tujuan dan kriteria keberhasilan dengan bahasa sederhana.',
    tujuan:
      'Hari ini kita belajar membandingkan dan mengurutkan bilangan bulat dengan bantuan garis bilangan — lalu menyelesaikan misi bersama tim.',
    kriteria: [
      'Aku bisa menentukan bilangan mana yang lebih besar atau lebih kecil dengan melihat letaknya pada garis bilangan.',
      'Aku bisa menuliskan perbandingan dengan lambang <, >, atau =.',
      'Aku bisa mengurutkan beberapa bilangan bulat dari yang terkecil maupun dari yang terbesar.',
      'Aku bisa menjelaskan alasanku kepada teman satu tim.',
    ],
    judul: 'Laporan Cuaca Pagi',
    cerita:
      'Selamat pagi, pendengar Radio Sekolah! Berikut suhu udara pukul 05.00 di empat tempat wisata pegunungan di Indonesia:',
    tempat: [
      { id: 'dieng', nama: 'Dieng', ikon: '🌫️', suhu: -3 },
      { id: 'jaya', nama: 'Puncak Jaya', ikon: '🏔️', suhu: -8 },
      { id: 'ranu', nama: 'Ranu Kumbolo', ikon: '🏕️', suhu: -1 },
      { id: 'bromo', nama: 'Bromo', ikon: '🌋', suhu: 4 },
    ],
    pertanyaan: 'Menurut dugaanmu, tempat mana yang paling dingin pagi itu?',
    opsi: [
      { id: 'dieng', label: 'Dieng (−3 °C)' },
      { id: 'jaya', label: 'Puncak Jaya (−8 °C)' },
      { id: 'ranu', label: 'Ranu Kumbolo (−1 °C)' },
      { id: 'bromo', label: 'Bromo (4 °C)' },
    ],
    dugaanBenar: 'jaya',
    alasanLabel: 'Mengapa kamu menduga begitu? (boleh singkat)',
    alasanPlaceholder: 'Menurutku tempat itu paling dingin karena …',
    catatan:
      'Belum ada jawaban benar atau salah. Simpan dugaanmu — kamu akan mengujinya dengan garis bilangan di tahap berikutnya.',
    nextLabel: 'Lanjut: Temukan Aturannya →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENYAJIKAN INFORMASI (Fase 2)
     ---------------------------------------------------------- */
  informasi: {
    kicker: 'Tahap 2 · Temukan Aturan',
    syntax: CL + ' · Fase 2',
    goal: 'Menemukan cara membandingkan dua bilangan bulat dari letaknya pada garis bilangan.',
    guru: 'Peragakan satu contoh di papan tulis (mis. 3 dan 5), lalu biarkan murid menjelajah sendiri. Tekankan kata kunci "letak": yang di kanan lebih besar. Saat membahas pertanyaan penuntun, minta satu murid menjelaskan dengan menunjuk garis bilangan, bukan menghafal aturan.',
    min: -10,
    max: 10,
    jelajahJudul: 'Jelajah: bandingkan dua titik',
    jelajahInstruksi:
      'Ketuk dua titik mana saja pada garis bilangan. Media akan menunjukkan bilangan mana yang lebih besar. Coba pasangan positif–positif, negatif–negatif, dan negatif–positif!',
    jelajahMin: 3,
    tanyaJudul: 'Pertanyaan penuntun',
    tanya: [
      {
        id: 'kanan',
        tanya:
          'Dari jelajahmu: pada garis bilangan mendatar, makin ke <strong>kanan</strong> letak suatu bilangan, nilainya makin …',
        opsi: [
          { id: 'besar', label: 'besar' },
          { id: 'kecil', label: 'kecil' },
          { id: 'sama', label: 'sama saja, letak tidak berpengaruh' },
          { id: 'tentu', label: 'tergantung tanda positif atau negatifnya' },
        ],
        correct: 'besar',
        umpan: {
          besar:
            'Tepat! Letak menentukan nilai: bilangan di sebelah kanan <strong>selalu</strong> lebih besar, baik positif maupun negatif.',
          kecil:
            'Coba lihat 2 dan 6: 6 di sebelah kanan 2, dan 6 lebih besar. Jadi makin ke kanan, makin …?',
          sama: 'Letak justru sangat berpengaruh. Bandingkan 1 dan 8 pada garis bilangan: mana yang lebih kanan dan mana yang lebih besar?',
          tentu:
            'Aturan letak berlaku untuk semua bilangan bulat. Coba ketuk −6 dan −2: −2 lebih kanan, dan −2 &gt; −6.',
        },
      },
      {
        id: 'negneg',
        tanya:
          'Mana yang <strong>lebih besar</strong>: <span class="num-chip">−2</span> atau <span class="num-chip">−7</span>?',
        opsi: [
          { id: 'm2', label: '−2, karena letaknya di sebelah kanan −7' },
          { id: 'm7', label: '−7, karena 7 lebih besar daripada 2' },
          { id: 'sama', label: 'Sama besar, karena keduanya negatif' },
          { id: 'tak', label: 'Tidak bisa dibandingkan' },
        ],
        correct: 'm2',
        umpan: {
          m2: 'Benar! −2 lebih dekat ke 0 sehingga berada di kanan −7. Jadi <strong>−2 &gt; −7</strong>.',
          m7: 'Hati-hati! Jangan membandingkan angkanya saja. Ketuk −2 dan −7: mana yang lebih kanan?',
          sama: 'Keduanya negatif, tetapi letaknya berbeda. Mana yang lebih dekat ke 0?',
          tak: 'Semua bilangan bulat bisa dibandingkan lewat letaknya pada garis bilangan. Coba lagi.',
        },
      },
      {
        id: 'nol',
        tanya: 'Bagaimana setiap bilangan <strong>negatif</strong> jika dibandingkan dengan 0?',
        opsi: [
          { id: 'kecil', label: 'Selalu lebih kecil daripada 0' },
          { id: 'besar', label: 'Selalu lebih besar daripada 0' },
          { id: 'kadang', label: 'Kadang lebih besar, kadang lebih kecil' },
          { id: 'sama', label: 'Sama dengan 0' },
        ],
        correct: 'kecil',
        umpan: {
          kecil:
            'Tepat! Semua bilangan negatif berada di kiri 0, jadi selalu lebih kecil daripada 0 — dan juga lebih kecil daripada semua bilangan positif.',
          besar: 'Lihat garis bilangan: di sisi mana bilangan negatif berada terhadap 0?',
          kadang:
            'Coba beberapa bilangan negatif (−1, −5, −10). Apakah ada yang berada di kanan 0?',
          sama: 'Hanya 0 yang sama dengan 0. Bilangan negatif berada di sisi kiri 0.',
        },
      },
      {
        id: 'lambang',
        tanya:
          'Tim Laut menulis perbandingan <span class="num-chip">−9</span> dan <span class="num-chip">4</span>. Tulisan mana yang benar?',
        opsi: [
          { id: 'a', label: '−9 &lt; 4' },
          { id: 'b', label: '−9 &gt; 4' },
          { id: 'c', label: '4 &lt; −9' },
          { id: 'd', label: '−9 = 4' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! −9 di kiri 4, jadi −9 <strong>kurang dari</strong> 4. Ujung lancip lambang &lt; selalu menunjuk bilangan yang lebih kecil.',
          b: 'Lambang &gt; berarti "lebih dari". Apakah −9 lebih besar daripada 4? Lihat letaknya.',
          c: '"4 &lt; −9" berarti 4 lebih kecil daripada −9. Padahal 4 berada di sebelah kanan.',
          d: 'Keduanya menempati titik yang berbeda, jadi tidak sama.',
        },
      },
    ],
    aturanJudul: 'Kartu Aturan Tim',
    aturan: [
      'Pada garis bilangan mendatar, bilangan di sebelah <strong>kanan</strong> lebih besar daripada bilangan di sebelah kirinya.',
      'Setiap bilangan negatif &lt; 0 &lt; setiap bilangan positif.',
      'Di antara dua bilangan negatif, yang <strong>lebih dekat ke 0</strong> lebih besar: −2 &gt; −7.',
      'Lambang: <strong>&lt;</strong> "kurang dari", <strong>&gt;</strong> "lebih dari", <strong>=</strong> "sama dengan". Ujung lancipnya menunjuk bilangan yang lebih kecil.',
      '<strong>Urutan naik</strong> (terkecil → terbesar) = baca titik dari kiri ke kanan; <strong>urutan turun</strong> (terbesar → terkecil) = dari kanan ke kiri.',
    ],
    dugaanJudul: 'Cek dugaanmu di tahap 1',
    nextLabel: 'Lanjut: Bentuk Tim →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MENGORGANISASIKAN KELOMPOK (Fase 3)
     ---------------------------------------------------------- */
  tim: {
    kicker: 'Tahap 3 · Bentuk Tim',
    syntax: CL + ' · Fase 3',
    goal: 'Membentuk tim, menyepakati aturan kerja, dan membagi peran secara adil.',
    guru: 'Bentuk kelompok heterogen 3–4 murid (campuran kemampuan & jenis kelamin) sebelum pelajaran. Satu perangkat per kelompok. Jelaskan bahwa peran akan diacak lalu bergiliran di setiap misi sehingga semua anggota mendapat kesempatan yang sama. Keliling kelas memastikan setiap tim menulis nama anggotanya.',
    maksAnggota: 4,
    minAnggota: 2,
    namaTimLabel: 'Nama tim',
    namaTimPlaceholder: 'mis. Tim Pinguin',
    anggotaLabel: 'Nama anggota (2–4 orang)',
    kesepakatanJudul: 'Kesepakatan tim',
    kesepakatan: [
      { id: 'dengar', teks: 'Kami mendengarkan pendapat setiap anggota sebelum menjawab.' },
      { id: 'sepakat', teks: 'Kami baru mengetuk jawaban setelah semua anggota setuju.' },
      { id: 'bantu', teks: 'Kami menjelaskan, bukan sekadar memberi tahu jawaban, kepada teman.' },
    ],
    acakLabel: '🎲 Acak Peran',
    acakUlangLabel: '🎲 Acak Ulang',
    peranJudul: 'Peran awal tim kalian',
    peranCatatan:
      'Peran bergeser satu orang setiap misi, jadi setiap anggota akan mencoba peran yang berbeda.',
    nextLabel: 'Mulai Misi Tim →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MEMBIMBING KELOMPOK (Fase 4)
     ---------------------------------------------------------- */
  misi: {
    kicker: 'Tahap 4 · Misi Tim',
    syntax: CL + ' · Fase 4',
    goal: 'Bekerja sama membandingkan dan mengurutkan bilangan bulat menggunakan garis bilangan.',
    guru: 'Berkeliling ke setiap tim. Pastikan Penempat Garis tidak mengetuk sebelum tim sepakat dan Juru Bicara bisa menjelaskan alasannya. Ajukan pertanyaan penuntun ("Mana yang lebih dekat ke 0?", "Titik mana yang paling kiri?") alih-alih memberi jawaban. Skor tim dihitung dari jawaban yang benar pada percobaan pertama.',
    min: -10,
    max: 10,

    /* Misi 1 — Bandingkan: 4 pasangan diambil acak dari bank */
    m1: {
      judul: 'Misi 1 · Bandingkan',
      tab: '1 · Bandingkan',
      instruksi:
        'Tempatkan kedua bilangan pada garis bilangan, lalu pilih lambang yang tepat untuk mengisi kotak.',
      banyak: 4,
      bank: [
        {
          id: 'suhu',
          ikon: '🌡️',
          konteks: 'Suhu pagi di Wamena −2 °C, sedangkan di Dieng −5 °C.',
          a: -2,
          b: -5,
          ta: 'Wamena',
          tb: 'Dieng',
          simpulan: 'Jadi, Dieng lebih dingin daripada Wamena.',
        },
        {
          id: 'selam',
          ikon: '🤿',
          konteks: 'Ayu menyelam sampai kedalaman −8 m, Bima sampai −3 m.',
          a: -8,
          b: -3,
          ta: 'Ayu',
          tb: 'Bima',
          simpulan: 'Jadi, Ayu menyelam lebih dalam daripada Bima.',
        },
        {
          id: 'lift',
          ikon: '🛗',
          konteks: 'Lift berhenti di lantai parkir B2 (−2), lalu di lantai 3 (3).',
          a: -2,
          b: 3,
          ta: 'Parkir B2',
          tb: 'Lantai 3',
          simpulan: 'Jadi, lantai 3 lebih tinggi daripada lantai parkir B2.',
        },
        {
          id: 'kuis',
          ikon: '🏅',
          konteks: 'Pada lomba cerdas cermat, skor Tim Merah −4, skor Tim Biru 0.',
          a: 0,
          b: -4,
          ta: 'Tim Biru',
          tb: 'Tim Merah',
          simpulan: 'Jadi, skor Tim Biru lebih tinggi daripada Tim Merah.',
        },
        {
          id: 'gim',
          ikon: '🎮',
          konteks: 'Dalam sebuah gim, poin Raka −6 dan poin Sinta −9.',
          a: -9,
          b: -6,
          ta: 'Sinta',
          tb: 'Raka',
          simpulan: 'Jadi, poin Raka lebih besar daripada poin Sinta.',
        },
        {
          id: 'tinggi',
          ikon: '⛰️',
          konteks:
            'Sebuah bukit kecil setinggi 7 m di atas permukaan laut; dasar kolam 7 m di bawahnya (−7).',
          a: 7,
          b: -7,
          ta: 'Bukit',
          tb: 'Dasar kolam',
          simpulan: 'Jadi, 7 dan −7 berjarak sama dari 0 tetapi 7 jauh lebih besar.',
        },
        {
          id: 'kulkas',
          ikon: '🧊',
          konteks: 'Freezer kecil Lina bersuhu −4 °C; freezer Doni juga −4 °C.',
          a: -4,
          b: -4,
          ta: 'Freezer Lina',
          tb: 'Freezer Doni',
          simpulan: 'Jadi, kedua freezer sama dinginnya.',
        },
      ],
    },

    /* Misi 2 — Urutkan */
    m2: {
      judul: 'Misi 2 · Urutkan',
      tab: '2 · Urutkan',
      instruksi:
        'Tempatkan kelima bilangan pada garis bilangan, lalu susun kartu sesuai perintah. Gunakan letak titik sebagai petunjuk!',
      set: [
        {
          id: 'penyelam',
          ikon: '🐠',
          judul: 'Kedalaman Penyelam',
          cerita:
            'Lima penyelam berhenti di kedalaman berbeda (0 = permukaan laut). Urutkan dari yang <strong>paling dalam</strong> ke yang <strong>paling dangkal</strong>.',
          arah: 'naik',
          startLabel: 'Paling dalam',
          endLabel: 'Paling dangkal',
          separator: '<',
          satuan: 'm',
          data: [
            { id: 'citra', nama: 'Citra', nilai: -9 },
            { id: 'ayu', nama: 'Ayu', nilai: -6 },
            { id: 'eko', nama: 'Eko', nilai: -4 },
            { id: 'bima', nama: 'Bima', nilai: -2 },
            { id: 'dewi', nama: 'Dewi', nilai: 0 },
          ],
          temuan:
            'Urutan <strong>naik</strong> (terkecil → terbesar) sama dengan membaca titik dari <strong>kiri ke kanan</strong>.',
        },
        {
          id: 'kota',
          ikon: '🌍',
          judul: 'Suhu Kota Dunia',
          cerita:
            'Suhu pagi di lima kota pada bulan Januari. Urutkan dari kota yang <strong>paling hangat</strong> ke yang <strong>paling dingin</strong>.',
          arah: 'turun',
          startLabel: 'Paling hangat',
          endLabel: 'Paling dingin',
          separator: '>',
          satuan: '°C',
          data: [
            { id: 'jakarta', nama: 'Jakarta', nilai: 9 },
            { id: 'tokyo', nama: 'Tokyo', nilai: 3 },
            { id: 'seoul', nama: 'Seoul', nilai: -1 },
            { id: 'oslo', nama: 'Oslo', nilai: -4 },
            { id: 'moskow', nama: 'Moskow', nilai: -7 },
          ],
          temuan:
            'Urutan <strong>turun</strong> (terbesar → terkecil) sama dengan membaca titik dari <strong>kanan ke kiri</strong>.',
        },
      ],
    },

    /* Misi 3 — Diskusi Kesalahan */
    m3: {
      judul: 'Misi 3 · Diskusi Kesalahan',
      tab: '3 · Diskusi',
      instruksi:
        'Murid lain menulis pernyataan berikut. Diskusikan dalam tim: benar atau salah? Pemeriksa memastikan semua setuju sebelum memilih.',
      opsi: [
        { id: 'benar', label: 'Benar' },
        { id: 'salah', label: 'Salah' },
      ],
      pernyataan: [
        {
          id: 'p1',
          teks: '"−8 &gt; −3, karena 8 lebih besar daripada 3."',
          correct: 'salah',
          explanation:
            'Tanda negatif tidak boleh diabaikan. −8 berada di kiri −3, jadi <strong>−8 &lt; −3</strong>.',
        },
        {
          id: 'p2',
          teks: '"0 lebih besar daripada setiap bilangan negatif."',
          correct: 'benar',
          explanation: 'Semua bilangan negatif berada di sebelah kiri 0.',
        },
        {
          id: 'p3',
          teks: '"−1 adalah bilangan bulat negatif yang terbesar."',
          correct: 'benar',
          explanation:
            '−1 adalah bilangan negatif yang paling dekat ke 0, jadi paling kanan di antara bilangan negatif.',
        },
        {
          id: 'p4',
          teks: '"Urutan dari yang terkecil: −2, −5, 0, 3."',
          correct: 'salah',
          explanation:
            '−5 berada di kiri −2, jadi −5 lebih kecil. Urutan yang benar: <strong>−5, −2, 0, 3</strong>.',
        },
        {
          id: 'p5',
          teks: '"Jika titik a berada di sebelah kiri titik b pada garis bilangan, maka a &lt; b."',
          correct: 'benar',
          explanation: 'Inilah aturan utama: yang lebih kiri lebih kecil.',
        },
        {
          id: 'p6',
          teks: '"−10 &lt; −12, karena −10 lebih dekat ke 0."',
          correct: 'salah',
          explanation:
            'Alasannya benar, tetapi kesimpulannya terbalik. Karena −10 lebih dekat ke 0, −10 berada di kanan −12, jadi <strong>−10 &gt; −12</strong>.',
        },
      ],
      jubirLabel:
        'Juru Bicara: tuliskan penjelasan tim untuk salah satu pernyataan yang SALAH (akan dibacakan di depan kelas).',
      jubirPlaceholder: 'Pernyataan … salah karena pada garis bilangan …',
    },
    nextLabel: 'Lanjut: Kuis Individu →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — EVALUASI (Fase 5): kuis individu
     createExerciseStage; urutan soal dan urutan opsi diacak.
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 5 · Kuis Individu',
    syntax: CL + ' · Fase 5',
    goal: 'Menunjukkan kemampuan membandingkan dan mengurutkan bilangan bulat secara mandiri.',
    guru: 'Kuis dikerjakan SENDIRI tanpa bantuan teman (tanggung jawab individu). Bila perangkat terbatas, anggota bergiliran; anggota lain menunggu di luar layar. Skor setiap anggota menyumbang poin tim di tahap Penghargaan.',
    instruksi:
      'Kerjakan sendiri, ya! Gunakan garis bilangan pada soal sebagai alat bantu. Skormu akan menyumbang poin tim.',
    nextLabel: 'Lihat Penghargaan Tim →',
    soal: [
      {
        id: 'e1',
        type: 'choice',
        cerita:
          'Ingat laporan cuaca pagi: Dieng −3 °C, Puncak Jaya −8 °C, Ranu Kumbolo −1 °C, Bromo 4 °C.',
        pertanyaan: 'Tempat mana yang paling dingin?',
        garis: { min: -10, max: 5 },
        options: [
          { id: 'jaya', label: 'Puncak Jaya' },
          { id: 'dieng', label: 'Dieng' },
          { id: 'ranu', label: 'Ranu Kumbolo' },
          { id: 'bromo', label: 'Bromo' },
        ],
        correct: 'jaya',
        explanation: '−8 berada paling kiri, jadi Puncak Jaya paling dingin.',
      },
      {
        id: 'e2',
        type: 'choice',
        cerita: 'Isilah kotak dengan lambang yang tepat.',
        pertanyaan:
          '<span class="num-chip num-chip--lg">−6</span> ☐ <span class="num-chip num-chip--lg">−2</span>',
        garis: { min: -8, max: 2 },
        options: [
          { id: 'lt', label: '&lt; (kurang dari)' },
          { id: 'gt', label: '&gt; (lebih dari)' },
          { id: 'eq', label: '= (sama dengan)' },
        ],
        correct: 'lt',
        explanation: '−6 di kiri −2, jadi −6 &lt; −2.',
      },
      {
        id: 'e3',
        type: 'input',
        cerita: 'Perhatikan garis bilangan di bawah.',
        pertanyaan:
          'Bilangan bulat <strong>terbesar</strong> yang <strong>kurang dari −3</strong> adalah …',
        garis: { min: -8, max: 2 },
        jawab: -4,
        hints: [
          'Bilangan yang kurang dari −3 berada di sebelah kiri −3.',
          'Di antara titik-titik di kiri −3, pilih yang paling dekat dengan −3.',
        ],
        explanation:
          '−4 adalah titik pertama di sebelah kiri −3, jadi −4 &lt; −3 dan paling dekat dengan −3.',
        reveal: 'Titik pertama di kiri −3 adalah <strong>−4</strong>.',
      },
      {
        id: 'e4',
        type: 'choice',
        cerita: 'Bilangan: 4, −7, 0, −2, 1.',
        pertanyaan:
          'Urutan dari yang <strong>terkecil</strong> ke yang <strong>terbesar</strong> adalah …',
        garis: { min: -8, max: 5 },
        options: [
          { id: 'a', label: '−7, −2, 0, 1, 4' },
          { id: 'b', label: '−2, −7, 0, 1, 4' },
          { id: 'c', label: '0, 1, −2, 4, −7' },
          { id: 'd', label: '4, 1, 0, −2, −7' },
        ],
        correct: 'a',
        explanation: 'Dari kiri ke kanan: −7, −2, 0, 1, 4.',
      },
      {
        id: 'e5',
        type: 'choice',
        cerita: 'Bilangan: −3, 5, −8, 2.',
        pertanyaan:
          'Urutan dari yang <strong>terbesar</strong> ke yang <strong>terkecil</strong> adalah …',
        garis: { min: -9, max: 6 },
        options: [
          { id: 'a', label: '5, 2, −3, −8' },
          { id: 'b', label: '5, 2, −8, −3' },
          { id: 'c', label: '−8, −3, 2, 5' },
          { id: 'd', label: '−3, −8, 2, 5' },
        ],
        correct: 'a',
        explanation: 'Dari kanan ke kiri: 5, 2, −3, −8.',
      },
      {
        id: 'e6',
        type: 'input',
        cerita: 'Perhatikan garis bilangan di bawah.',
        pertanyaan:
          'Ada berapa bilangan bulat yang <strong>lebih dari −5</strong> dan <strong>kurang dari 2</strong>?',
        garis: { min: -7, max: 4 },
        jawab: 6,
        hints: [
          'Titik-titik itu berada di antara −5 dan 2, tanpa −5 dan 2 sendiri.',
          'Tuliskan satu per satu: −4, −3, … lalu hitung banyaknya.',
        ],
        explanation: 'Bilangannya −4, −3, −2, −1, 0, 1 — ada 6 bilangan bulat.',
        reveal: 'Bilangannya −4, −3, −2, −1, 0, 1 — ada <strong>6</strong> bilangan bulat.',
      },
      {
        id: 'e7',
        type: 'choice',
        cerita:
          'Tiga kapal selam berada di kedalaman −120 m, −85 m, dan −200 m di bawah permukaan laut.',
        pertanyaan: 'Kapal selam yang paling dekat ke permukaan laut berada di kedalaman …',
        options: [
          { id: 'a', label: '−85 m' },
          { id: 'b', label: '−120 m' },
          { id: 'c', label: '−200 m' },
          { id: 'd', label: 'Ketiganya sama dekat' },
        ],
        correct: 'a',
        explanation: '−85 paling dekat ke 0, jadi −85 &gt; −120 &gt; −200.',
      },
      {
        id: 'e8',
        type: 'choice',
        cerita: 'Periksa setiap pernyataan dengan membayangkan garis bilangan.',
        pertanyaan: 'Pernyataan mana yang <strong>benar</strong>?',
        options: [
          { id: 'a', label: '−7 &lt; −3' },
          { id: 'b', label: '−15 &gt; −11' },
          { id: 'c', label: '−4 &lt; −9' },
          { id: 'd', label: '0 &lt; −1' },
        ],
        correct: 'a',
        explanation: '−7 berada di kiri −3, jadi −7 &lt; −3 benar.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 6 — PENGHARGAAN (Fase 6)
     ---------------------------------------------------------- */
  penghargaan: {
    kicker: 'Tahap 6 · Penghargaan Tim',
    syntax: CL + ' · Fase 6',
    goal: 'Merayakan hasil kerja sama tim dan menghargai kontribusi setiap anggota.',
    guru: 'Umumkan predikat setiap tim di depan kelas (Tim Baik, Tim Hebat, Tim Super) — semua tim mendapat apresiasi. Bila anggota mengerjakan kuis di perangkat berbeda, rata-ratakan skor kuis anggota secara manual. Minta Juru Bicara tiap tim membacakan pujian untuk teman satu tim.',
    bobot: 'Poin tim = 50% skor misi (benar pada percobaan pertama) + 50% skor kuis individu.',
    pujianLabel: 'Tulis satu pujian untuk teman satu tim (sebut namanya dan apa yang ia lakukan).',
    pujianPlaceholder: 'Terima kasih, … karena …',
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 7 · Refleksi',
    syntax: 'Refleksi proses kelompok',
    goal: 'Merefleksikan pemahaman pribadi dan cara tim bekerja sama.',
    guru: 'Beri waktu hening 3 menit untuk refleksi pribadi, lalu 3 menit untuk refleksi kerja sama tim. Undang dua tim membagikan satu hal yang akan mereka perbaiki di kerja kelompok berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Bagaimana caramu menentukan bilangan yang lebih besar di antara dua bilangan negatif?',
        placeholder: 'Aku melihat letaknya pada garis bilangan …',
      },
      {
        id: 'r2',
        teks: 'Bagian mana yang tadinya membingungkan, dan siapa/apa yang membantumu memahaminya?',
        placeholder: 'Tadinya aku bingung … lalu …',
      },
    ],
    kerjaJudul: 'Bagaimana kerja sama tim kita?',
    kerja: [
      { id: 'k1', teks: 'Setiap anggota mendapat kesempatan berbicara.' },
      { id: 'k2', teks: 'Kami menjalankan peran masing-masing dengan baik.' },
      { id: 'k3', teks: 'Kami menjawab setelah semua anggota setuju.' },
    ],
    kerjaOpsi: [
      { id: 'selalu', label: '😄 Selalu' },
      { id: 'sering', label: '🙂 Sering' },
      { id: 'kadang', label: '😐 Kadang-kadang' },
      { id: 'belum', label: '🌱 Belum' },
    ],
    diriLabel: 'Seberapa yakin kamu sekarang membandingkan dan mengurutkan bilangan bulat?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '👍 Yakin — kadang masih melihat garis bilangan' },
      { id: 'cukup', label: '🤔 Cukup — bilangan negatif masih sering tertukar' },
      { id: 'belum', label: '🙋 Belum — aku perlu latihan lagi bersama guru' },
    ],
    nextLabel: 'Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Misi Tim Tuntas!',
    teks: 'Kalian sudah membandingkan dan mengurutkan bilangan bulat dengan garis bilangan — sambil bekerja sama sebagai tim.',
    capaian: [
      'Menentukan bilangan yang lebih besar/kecil dari letaknya pada garis bilangan.',
      'Menuliskan perbandingan dengan lambang <, >, dan =.',
      'Mengurutkan bilangan bulat naik (kiri → kanan) dan turun (kanan → kiri).',
      'Menemukan dan menjelaskan kesalahan umum, mis. "−8 > −3".',
      'Menjalankan peran dalam tim dan menghargai kontribusi teman.',
    ],
  },
};
