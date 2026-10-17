'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Merumuskan Pertanyaan Statistik
   — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Merumuskan pertanyaan statistik yang dapat dijawab dengan data
   tentang diri dan lingkungan sekolah.

   Model pembelajaran: INQUIRY LEARNING (Inkuiri Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Orientasi .................. 'orientasi'
     Sintaks 2 — Merumuskan masalah ......... 'masalah'
     Sintaks 3 — Merumuskan hipotesis ....... 'hipotesis'
     Sintaks 4 — Mengumpulkan data .......... 'dataTanya', 'dataPilah' & 'dataRakit'
     Sintaks 5 — Menguji hipotesis .......... 'uji'
     Sintaks 6 — Merumuskan kesimpulan ...... 'simpulan'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Orientasi   (8')  — "Kotak Usul OSIS": OSIS ingin mengisi mading
                            "Fakta Kelas VII" dari usul pertanyaan murid.
                            Murid MENDUGA usul mana yang perlu dijawab
                            dengan data (tidak dinilai).
     2. Masalah     (4')  — memilih rumusan masalah penyelidikan.
     3. Hipotesis   (6')  — memilih dugaan tentang ciri pertanyaan yang
                            dijawab dengan data, lalu menulis hipotesis.
     4a. Data 1     (12') — Lab Tanya Kelas: kartu pertanyaan ditanyakan
                            kepada 32 murid virtual (jawaban disimulasikan
                            engine); murid mencatat jawaban seragam atau
                            beragam, lalu menjawab pertanyaan temuan.
     4b. Data 2     (8')  — Lab Pilah: sepuluh pertanyaan tentang diri dan
                            sekolah dipilah statistik / bukan statistik;
                            bukti tiga ciri muncul setelah memilih.
     4c. Data 3     (12') — Lab Rakit: merakit pertanyaan dari keping
                            kata tanya + yang dicatat + kelompok, diperiksa
                            berdiagnosa, menentukan jenis data dan cara
                            mengumpulkan, lalu memperbaiki pertanyaan kabur.
     5. Uji         (8')  — pernyataan benar/salah, lalu dugaan &
                            hipotesis dibandingkan dengan data.
     6. Simpulan    (5')  — menyusun kesimpulan dari bank kalimat.
     7. Uji terap   (12') — delapan soal pilihan ganda diambil acak dari
                            bank enam belas soal sesuai komposisi.
     8. Refleksi    (5')  — rekap, merumuskan satu pertanyaan statistik
                            sendiri dengan ceklis ciri, penilaian diri.

   Ciri pertanyaan ditulis sebagai `ciri` (lihat engine seksi 80):
     { jelas, banyak, beragam } → klasifikasiPertanyaan → statistik / alasan
   Kunci Lab Pilah, Lab Tanya, dan uji terap dihitung ulang oleh engine
   dan dicocokkan di tests/mpi-10.1-data.test.js.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Soal uji terap juga
   diambil acak dari bank dan opsinya dibangun engine (opsiSoalStatistik)
   lalu diacak.
   ============================================================ */

var IL = 'Inquiry Learning';

/* Ciri yang sering dipakai. */
var CIRI_STAT = { jelas: true, banyak: true, beragam: true };
var CIRI_SATU_JAWABAN = { jelas: true, banyak: true, beragam: false };
var CIRI_SATU_ORANG = { jelas: true, banyak: false, beragam: false };
var CIRI_TAK_JELAS = { jelas: false, banyak: true, beragam: true };

var DATA = {
  meta: {
    judul: 'Merumuskan Pertanyaan Statistik',
  },

  tahap: [
    { id: 'orientasi', label: 'Orientasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'hipotesis', label: 'Hipotesis' },
    { id: 'dataTanya', label: 'Lab Tanya' },
    { id: 'dataPilah', label: 'Lab Pilah' },
    { id: 'dataRakit', label: 'Lab Rakit' },
    { id: 'uji', label: 'Uji Hipotesis' },
    { id: 'simpulan', label: 'Simpulan' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Konteks yang dipakai di seluruh modul. */
  konteks: {
    diri: { ikon: '🙋', nama: 'Diri Sendiri' },
    kelas: { ikon: '👥', nama: 'Kelas' },
    sekolah: { ikon: '🏫', nama: 'Sekolah' },
  },

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Uji Hipotesis.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    syntax: IL + ' · Sintaks 1',
    goal: 'Mengamati usul pertanyaan untuk mading kelas, lalu menduga pertanyaan mana yang perlu dijawab dengan data.',
    tp: 'Merumuskan pertanyaan statistik yang dapat dijawab dengan data tentang diri dan lingkungan sekolah.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Membedakan pertanyaan statistik dari pertanyaan yang hanya punya satu jawaban pasti.',
      'Menjelaskan tiga ciri pertanyaan statistik: yang dicatat jelas, ditanyakan kepada suatu kelompok, dan jawabannya dapat beragam.',
      'Merumuskan pertanyaan statistik tentang diri dan lingkungan sekolah dengan kata tanya, yang dicatat, dan kelompok yang tepat.',
      'Memperbaiki pertanyaan yang kabur atau hanya untuk satu orang menjadi pertanyaan statistik.',
      'Menentukan jenis data (kategorik atau numerik) dan cara mengumpulkan data untuk menjawab pertanyaan statistik.',
    ],
    guru: 'Bacakan cerita kotak usul. Minta pasangan murid membaca keenam usul lalu memutuskan dugaannya dalam 2 menit. Jangan membenarkan atau menyalahkan — perbedaan pendapat ("tinggi badan Ketua OSIS kan bilangan, berarti data!") menjadi bahan penyelidikan.',
    judul: 'Kotak Usul OSIS: Kenali Kelas & Sekolahku',
    pengantar:
      'OSIS akan membuat mading "Fakta Kelas VII". Setiap kelas boleh mengusulkan pertanyaan yang jawabannya akan dipajang. Kotak usul sudah terisi, tetapi Kak Dinda, ketua OSIS, bingung: ada pertanyaan yang cukup dijawab sekali, ada yang harus ditanyakan ke banyak murid, dan ada yang sulit dijawab.',
    usul: [
      { id: 'uBel', ikon: '🔔', teks: 'Jam berapa bel masuk sekolah kita?' },
      { id: 'uTransport', ikon: '🚲', teks: 'Apa moda transportasi ke sekolah murid kelas VII?' },
      { id: 'uTinggi', ikon: '📏', teks: 'Berapa tinggi badan Ketua OSIS?' },
      { id: 'uTidur', ikon: '😴', teks: 'Berapa jam waktu tidur malam murid kelas VII?' },
      { id: 'uKeren', ikon: '🌟', teks: 'Apakah murid kelas VII keren?' },
      { id: 'uOlahraga', ikon: '⚽', teks: 'Apa olahraga kesukaan murid kelas VII?' },
    ],
    dugaan: [
      {
        id: 'dBel',
        tanya: 'Untuk menjawab "Jam berapa bel masuk sekolah kita?", kita perlu bertanya kepada …',
        opsi: [
          { id: 'satu', label: 'Cukup satu sumber, misalnya jadwal sekolah' },
          { id: 'semua', label: 'Semua murid kelas VII' },
          { id: 'tidakBisa', label: 'Tidak bisa dijawab' },
        ],
        baku: 'satu',
        pembahasan:
          'Di Lab Tanya, 32 murid menjawab sama: 07.00. Jawabannya satu dan pasti, jadi tidak perlu mengumpulkan data.',
      },
      {
        id: 'dMading',
        tanya: 'Usul mana yang jawabannya paling perlu dikumpulkan dari banyak murid?',
        opsi: [
          { id: 'tidur', label: 'Berapa jam waktu tidur malam murid kelas VII?' },
          { id: 'tinggi', label: 'Berapa tinggi badan Ketua OSIS?' },
          { id: 'bel', label: 'Jam berapa bel masuk sekolah kita?' },
          { id: 'keren', label: 'Apakah murid kelas VII keren?' },
        ],
        baku: 'tidur',
        pembahasan:
          'Waktu tidur setiap murid berbeda-beda, jadi jawabannya harus dikumpulkan dari seluruh kelompok. Tinggi Ketua OSIS hanya satu orang, bel masuk hanya satu jawaban, dan "keren" tidak jelas ukurannya.',
      },
      {
        id: 'dCiri',
        tanya:
          'Menurutmu, apa yang membuat sebuah pertanyaan perlu dijawab dengan data dari banyak orang?',
        opsi: [
          { id: 'beragam', label: 'Jawabannya bisa berbeda-beda dari satu orang ke orang lain' },
          { id: 'berapa', label: 'Pertanyaannya memakai kata "berapa"' },
          { id: 'panjang', label: 'Pertanyaannya panjang dan sulit' },
          { id: 'bilangan', label: 'Jawabannya pasti berupa bilangan' },
        ],
        baku: 'beragam',
        pembahasan:
          'Di Lab Tanya, kartu yang jawabannya beragam (moda transportasi, waktu tidur) perlu dikumpulkan dari kelompok. Kata "berapa" atau jawaban bilangan saja tidak menjamin — tinggi badan Ketua OSIS juga bilangan.',
      },
    ],
    alasanLabel: 'Tuliskan alasan dugaanmu (boleh singkat):',
    alasanPlaceholder: 'Menurutku usul … perlu ditanyakan ke banyak murid karena …',
    catatan:
      'Dugaanmu tidak dinilai. Simpan baik-baik — kamu akan mengujinya sendiri dengan data di tahap Uji Hipotesis.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MERUMUSKAN MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: IL + ' · Sintaks 2',
    goal: 'Memilih pertanyaan penyelidikan yang tepat dari masalah kotak usul.',
    guru: 'Ajak murid membedakan pertanyaan penyelidikan (tentang ciri pertanyaan) dengan salah satu usul di kotak. Biarkan mereka mencoba lagi bila memilih yang kurang tepat.',
    pengantar:
      'Kak Dinda hanya ingin memajang usul yang benar-benar dijawab dengan data. Sebelum menyelidiki, rumuskan dulu pertanyaan yang ingin kalian jawab.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'ciri',
        label:
          'Apa ciri pertanyaan yang dapat dijawab dengan data, dan bagaimana merumuskannya tentang diri dan sekolah kita?',
      },
      { id: 'olahraga', label: 'Apa olahraga kesukaan murid kelas VII?' },
      { id: 'banyak', label: 'Berapa banyak usul yang ada di kotak OSIS?' },
      { id: 'mading', label: 'Bagaimana cara menghias mading supaya menarik?' },
    ],
    correct: 'ciri',
    umpan: {
      ciri: 'Tepat! Pertanyaan ini menuntun kita menyelidiki ciri-ciri pertanyaan yang dijawab dengan data — itulah yang akan kita selidiki.',
      olahraga:
        'Itu salah satu usul untuk mading, bukan masalah yang kita selidiki. Kita ingin tahu ciri pertanyaan yang dijawab dengan data.',
      banyak:
        'Banyak usul hanya satu bilangan. Yang membuat Kak Dinda bingung adalah usul mana yang dijawab dengan data dan mengapa.',
      mading:
        'Hiasan mading memang penting, tetapi bukan masalah matematikanya. Fokuslah pada ciri pertanyaan yang dijawab dengan data.',
    },
    nextLabel: 'Lanjut: Rumuskan Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MERUMUSKAN HIPOTESIS
     Pilihan dugaan TIDAK dinilai; dibandingkan dengan data di tahap Uji.
     ---------------------------------------------------------- */
  hipotesis: {
    kicker: 'Tahap 3 · Merumuskan Hipotesis',
    syntax: IL + ' · Sintaks 3',
    goal: 'Menyusun dugaan sementara tentang ciri pertanyaan yang dijawab dengan data.',
    guru: 'Tekankan bahwa hipotesis adalah dugaan yang akan diuji, jadi tidak ada pilihan yang "dihukum". Minta setiap pasangan menulis satu kalimat hipotesis dengan bahasa sendiri.',
    pengantar:
      'Jawab dugaan berikut sesuai pendapatmu sekarang, lalu tulis hipotesismu dalam satu atau dua kalimat.',
    dugaan: [
      {
        id: 'hSama',
        tanya:
          'Sebuah pertanyaan ditanyakan ke 32 murid dan semua jawabannya pasti sama. Pertanyaan itu …',
        opsi: [
          { id: 'bukan', label: 'tidak perlu dijawab dengan mengumpulkan data' },
          { id: 'statistik', label: 'tetap perlu dijawab dengan mengumpulkan data' },
          { id: 'tergantung', label: 'tergantung panjang pertanyaannya' },
        ],
        baku: 'bukan',
        pembahasan:
          'Di Lab Tanya, kartu bel masuk menghasilkan satu jawaban saja (07.00). Jawaban yang pasti sama cukup dicari sekali.',
      },
      {
        id: 'hSaya',
        tanya: '"Berapa tinggi badan saya?" termasuk pertanyaan yang …',
        opsi: [
          { id: 'satu', label: 'bukan statistik, karena hanya tentang satu orang' },
          { id: 'bilangan', label: 'statistik, karena jawabannya bilangan' },
          { id: 'ukur', label: 'statistik, karena bisa diukur dengan meteran' },
        ],
        baku: 'satu',
        pembahasan:
          'Di Lab Tanya, kartu tinggi badan Ketua OSIS hanya punya satu responden dan satu jawaban. Di Lab Rakit, kelompok "saya" ditolak karena datanya hanya satu.',
      },
      {
        id: 'hKeren',
        tanya: '"Apakah murid kelas VII keren?" sulit dijawab dengan data karena …',
        opsi: [
          { id: 'kabur', label: '"keren" tidak jelas bagaimana mencatat dan membandingkannya' },
          { id: 'pendek', label: 'kalimatnya terlalu pendek' },
          { id: 'mudah', label: 'tidak sulit, jawabannya pasti "ya"' },
        ],
        baku: 'kabur',
        pembahasan:
          'Di Lab Pilah dan Lab Rakit, kata seperti "enak" dan "kehebatan" ditandai tidak jelas. Ukuran setiap orang berbeda, jadi jawabannya tidak dapat dicatat sebagai data yang sama.',
      },
      {
        id: 'hBerapa',
        tanya: 'Apakah pertanyaan statistik harus diawali kata "berapa"?',
        opsi: [
          { id: 'tidak', label: 'Tidak, kata "apa" juga bisa asal jawabannya beragam' },
          { id: 'ya', label: 'Ya, harus diawali "berapa"' },
          { id: 'bilangan', label: 'Ya, karena data selalu berupa bilangan' },
        ],
        baku: 'tidak',
        pembahasan:
          '"Apa moda transportasi ke sekolah murid kelas VII A?" menghasilkan jawaban beragam berupa nama (data kategorik). Kata tanya menyesuaikan jenis jawabannya.',
      },
    ],
    hipotesisLabel: 'Tulis hipotesismu:',
    hipotesisPlaceholder:
      'Menurutku, pertanyaan yang dijawab dengan data adalah pertanyaan yang … dan ditanyakan kepada …',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — LAB TANYA KELAS
     Jawaban 32 murid virtual disimulasikan simulasiJawabanKelas
     (engine seksi 80). Kunci catatan = kunciCatatTanya(ciri).
     ---------------------------------------------------------- */
  dataTanya: {
    kicker: 'Tahap 4a · Lab Tanya Kelas',
    syntax: IL + ' · Sintaks 4',
    goal: 'Mengumpulkan jawaban kelas untuk setiap kartu pertanyaan, lalu mencatat apakah jawabannya seragam atau beragam.',
    guru: 'Jawaban murid virtual berbeda untuk setiap murid nyata. Minta pasangan membandingkan hasil di layar mereka: angka persisnya berbeda, tetapi kartu yang beragam tetap beragam dan kartu bel masuk tetap satu jawaban. Bila waktu memungkinkan, tanyakan satu kartu langsung ke kelas nyata.',
    pengantar:
      'Ketuk setiap kartu untuk menanyakannya kepada 32 murid virtual kelas VII A. Amati jawaban mereka, lalu catat: seragam atau beragam?',
    lab: {
      responden: 32,
      pertanyaan: [
        {
          id: 'tTransport',
          ikon: '🚲',
          teks: 'Apa moda transportasi ke sekolah murid kelas VII A?',
          ciri: CIRI_STAT,
          jawab: {
            kategori: [
              { label: 'Jalan kaki', bobot: 6 },
              { label: 'Sepeda', bobot: 5 },
              { label: 'Diantar motor', bobot: 10 },
              { label: 'Angkot', bobot: 6 },
              { label: 'Bus sekolah', bobot: 5 },
            ],
          },
        },
        {
          id: 'tBel',
          ikon: '🔔',
          teks: 'Jam berapa bel masuk sekolah kita?',
          ciri: CIRI_SATU_JAWABAN,
          jawab: { tetap: '07.00' },
        },
        {
          id: 'tTidur',
          ikon: '😴',
          teks: 'Berapa jam waktu tidur malam murid kelas VII A?',
          ciri: CIRI_STAT,
          jawab: { rentang: [6, 10], satuan: 'jam' },
        },
        {
          id: 'tTinggi',
          ikon: '📏',
          teks: 'Berapa tinggi badan Ketua OSIS?',
          ciri: CIRI_SATU_ORANG,
          jawab: { rentang: [155, 165], satuan: 'cm' },
        },
        {
          id: 'tSaudara',
          ikon: '👨‍👩‍👧',
          teks: 'Berapa banyak saudara kandung murid kelas VII A?',
          ciri: CIRI_STAT,
          jawab: { rentang: [0, 4], satuan: 'orang' },
        },
      ],
    },
    temuan: [
      {
        id: 'tmBeda',
        tanya: 'Apa beda jawaban kartu moda transportasi dan kartu bel masuk?',
        opsi: [
          { id: 'tepat', label: 'Moda transportasi beragam, bel masuk hanya satu jawaban' },
          { id: 'samaBeragam', label: 'Keduanya sama-sama beragam' },
          { id: 'samaSeragam', label: 'Keduanya sama-sama satu jawaban' },
          { id: 'terbalik', label: 'Bel masuk beragam, moda transportasi satu jawaban' },
        ],
        correct: 'tepat',
        umpan: {
          tepat:
            'Tepat! Setiap murid punya cara sendiri ke sekolah, sedangkan bel masuk sama bagi semua orang.',
          samaBeragam: 'Lihat lagi kartu bel masuk: semua 32 murid menjawab 07.00.',
          samaSeragam: 'Lihat lagi kartu moda transportasi: ada beberapa jawaban berbeda.',
          terbalik: 'Kebalikannya. Periksa lagi ringkasan jawaban kedua kartu.',
        },
      },
      {
        id: 'tmTinggi',
        tanya: 'Mengapa kartu tinggi badan Ketua OSIS hanya punya satu jawaban?',
        opsi: [
          { id: 'satuOrang', label: 'Karena hanya satu orang yang ditanya atau diukur' },
          { id: 'tidakUkur', label: 'Karena tinggi badan tidak bisa diukur' },
          { id: 'samaTinggi', label: 'Karena semua murid sama tinggi' },
          { id: 'bilangan', label: 'Karena jawabannya berupa bilangan' },
        ],
        correct: 'satuOrang',
        umpan: {
          satuOrang:
            'Tepat! Datanya hanya satu karena pertanyaannya tentang satu orang. Bandingkan dengan kartu saudara kandung yang ditanyakan ke seluruh kelas.',
          tidakUkur:
            'Tinggi badan bisa diukur dengan meteran. Masalahnya ada pada siapa yang ditanya.',
          samaTinggi: 'Yang ditanyakan bukan tinggi semua murid, melainkan tinggi satu orang saja.',
          bilangan:
            'Kartu waktu tidur juga berupa bilangan, tetapi jawabannya beragam. Perhatikan siapa yang ditanya.',
        },
      },
      {
        id: 'tmCiri',
        tanya: 'Pertanyaan yang perlu dijawab dengan mengumpulkan data adalah pertanyaan yang …',
        opsi: [
          { id: 'tepat', label: 'ditanyakan kepada suatu kelompok dan jawabannya dapat beragam' },
          { id: 'bilangan', label: 'jawabannya selalu berupa bilangan' },
          { id: 'pasti', label: 'jawabannya satu dan pasti' },
          { id: 'satuOrang', label: 'ditanyakan kepada orang yang paling tahu' },
        ],
        correct: 'tepat',
        umpan: {
          tepat:
            'Tepat! Inilah ciri pertanyaan statistik: mengantisipasi jawaban yang beragam dari suatu kelompok.',
          bilangan:
            'Kartu moda transportasi jawabannya berupa nama, tetapi tetap perlu dikumpulkan dari kelompok.',
          pasti:
            'Jawaban yang pasti, seperti bel masuk, justru tidak perlu dikumpulkan dari banyak orang.',
          satuOrang:
            'Satu orang hanya memberi satu jawaban. Pertanyaan statistik ditanyakan kepada kelompok.',
        },
      },
    ],
    nextLabel: 'Lanjut: Lab Pilah →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — LAB PILAH
     `correct` dicocokkan dengan klasifikasiPertanyaan(ciri) di tes.
     ---------------------------------------------------------- */
  dataPilah: {
    kicker: 'Tahap 4b · Lab Pilah',
    syntax: IL + ' · Sintaks 4',
    goal: 'Memilah pertanyaan tentang diri dan sekolah menjadi pertanyaan statistik atau bukan.',
    guru: 'Pertanyaan "Berapa banyak buku di rak kelasku?" dan "Apa ukuran sepatu saya?" sengaja berjawaban bilangan sebagai pengecoh. Minta murid menunjukkan ciri mana yang tidak terpenuhi.',
    pengantar:
      'Untuk setiap pertanyaan, putuskan apakah termasuk pertanyaan statistik. Setelah memilih, periksa buktinya: tiga ciri pertanyaan statistik.',
    kategori: [
      { id: 'statistik', label: 'Pertanyaan statistik' },
      { id: 'bukan', label: 'Bukan pertanyaan statistik' },
    ],
    pertanyaan: [
      {
        id: 'pBuku',
        konteks: 'kelas',
        teks: 'Berapa banyak buku yang dibaca murid kelas VII dalam sebulan?',
        ciri: CIRI_STAT,
        correct: 'statistik',
        explanation:
          'Setiap murid membaca buku dengan banyak yang berbeda, dan yang dicatat jelas.',
      },
      {
        id: 'pRak',
        konteks: 'kelas',
        teks: 'Berapa banyak buku di rak kelasku?',
        ciri: CIRI_SATU_ORANG,
        correct: 'bukan',
        explanation:
          'Hanya ada satu rak, jadi cukup dihitung sekali dan datanya hanya satu bilangan.',
      },
      {
        id: 'pMapel',
        konteks: 'kelas',
        teks: 'Apa mata pelajaran kesukaan murid kelas VII B?',
        ciri: CIRI_STAT,
        correct: 'statistik',
        explanation: 'Jawabannya berupa nama mata pelajaran yang beragam dari murid satu kelas.',
      },
      {
        id: 'pUltah',
        konteks: 'sekolah',
        teks: 'Kapan ulang tahun sekolah kita?',
        ciri: CIRI_SATU_JAWABAN,
        correct: 'bukan',
        explanation: 'Tanggalnya satu dan pasti; cukup dicari di dokumen sekolah.',
      },
      {
        id: 'pPerjalanan',
        konteks: 'sekolah',
        teks: 'Berapa menit lama perjalanan murid kelas VII dari rumah ke sekolah?',
        ciri: CIRI_STAT,
        correct: 'statistik',
        explanation: 'Jarak dan kendaraan setiap murid berbeda, jadi lamanya beragam.',
      },
      {
        id: 'pKantin',
        konteks: 'sekolah',
        teks: 'Apakah kantin sekolah kita enak?',
        ciri: CIRI_TAK_JELAS,
        correct: 'bukan',
        explanation:
          '"Enak" tidak jelas ukurannya. Perbaikannya, misalnya: "Apa menu kantin kesukaan murid kelas VII?"',
      },
      {
        id: 'pSepatu',
        konteks: 'diri',
        teks: 'Apa ukuran sepatu saya?',
        ciri: CIRI_SATU_ORANG,
        correct: 'bukan',
        explanation: 'Hanya tentang satu orang, jadi datanya hanya satu.',
      },
      {
        id: 'pSaku',
        konteks: 'diri',
        teks: 'Berapa rupiah uang saku harian murid kelas VII A?',
        ciri: CIRI_STAT,
        correct: 'statistik',
        explanation:
          'Uang saku setiap murid dapat berbeda, dan yang dicatat jelas (rupiah per hari).',
      },
      {
        id: 'pWali',
        konteks: 'sekolah',
        teks: 'Siapa nama wali kelas VII A?',
        ciri: CIRI_SATU_JAWABAN,
        correct: 'bukan',
        explanation: 'Semua murid VII A akan memberi jawaban yang sama.',
      },
      {
        id: 'pTas',
        konteks: 'kelas',
        teks: 'Apa warna tas murid kelas VII C?',
        ciri: CIRI_STAT,
        correct: 'statistik',
        explanation: 'Warna tas murid beragam; datanya dapat dikumpulkan dengan pengamatan.',
      },
    ],
    nextLabel: 'Lanjut: Lab Rakit →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — LAB RAKIT PERTANYAAN
     Rakitan diperiksa periksaRakitPertanyaan (engine seksi 80).
     ---------------------------------------------------------- */
  dataRakit: {
    kicker: 'Tahap 4c · Lab Rakit Pertanyaan',
    syntax: IL + ' · Sintaks 4',
    goal: 'Merakit pertanyaan statistik dari kata tanya, yang dicatat, dan kelompok, lalu menentukan jenis data dan cara mengumpulkannya.',
    guru: 'Biarkan murid mencoba rakitan yang keliru (kelompok "saya", kata tanya tidak cocok) dan membaca diagnosanya. Tanyakan: "Data apa yang akan kamu catat di tabel? Siapa saja yang akan kamu tanya?"',
    pengantar:
      'Pilih satu keping dari setiap baris untuk merakit pertanyaan, lalu periksa. Simpan minimal dua pertanyaan statistik: satu berdata kategorik dan satu berdata numerik.',
    lab: {
      minSimpan: 2,
      kataTanya: [
        { id: 'apa', label: 'Apa' },
        { id: 'berapa', label: 'Berapa' },
      ],
      variabel: [
        {
          id: 'olahraga',
          frasa: 'olahraga kesukaan',
          tanya: 'apa',
          jenis: 'kategorik',
          cara: 'survei',
        },
        {
          id: 'transport',
          frasa: 'moda transportasi ke sekolah',
          tanya: 'apa',
          jenis: 'kategorik',
          cara: 'survei',
        },
        { id: 'tas', frasa: 'warna tas', tanya: 'apa', jenis: 'kategorik', cara: 'pengamatan' },
        {
          id: 'tinggi',
          frasa: 'tinggi badan (cm)',
          tanya: 'berapa',
          jenis: 'numerik',
          cara: 'pengukuran',
        },
        {
          id: 'tidur',
          frasa: 'jam tidur malam',
          tanya: 'berapa',
          jenis: 'numerik',
          cara: 'survei',
        },
        {
          id: 'saudara',
          frasa: 'banyak saudara kandung',
          tanya: 'berapa',
          jenis: 'numerik',
          cara: 'survei',
        },
        { id: 'hebat', frasa: 'kehebatan', tanya: 'apa', jelas: false },
      ],
      kelompok: [
        { id: 'kelasA', frasa: 'murid kelas VII A', banyak: true },
        { id: 'semuaVII', frasa: 'murid kelas VII di sekolah kita', banyak: true },
        { id: 'guru', frasa: 'guru di sekolah kita', banyak: true },
        { id: 'saya', frasa: 'saya', banyak: false },
        { id: 'kepsek', frasa: 'kepala sekolah kita', banyak: false },
      ],
    },
    perbaikiJudul: '🛠️ Perbaiki pertanyaan dari kotak usul',
    perbaiki: [
      {
        id: 'fOlahraga',
        tanya:
          'Usul "Apakah murid suka olahraga?" kurang jelas siapa yang ditanya. Perbaikan mana yang menjadi pertanyaan statistik?',
        opsi: [
          { id: 'tepat', label: 'Apa olahraga kesukaan murid kelas VII A?' },
          { id: 'saya', label: 'Apakah saya suka olahraga?' },
          { id: 'kabur', label: 'Apakah olahraga itu menyenangkan?' },
          { id: 'jadwal', label: 'Kapan jadwal olahraga kelas VII A?' },
        ],
        correct: 'tepat',
        umpan: {
          tepat:
            'Tepat! Kelompoknya jelas (murid kelas VII A), yang dicatat jelas (olahraga kesukaan), dan jawabannya beragam.',
          saya: 'Pertanyaan ini hanya tentang satu orang, jadi datanya hanya satu.',
          kabur: '"Menyenangkan" tidak jelas ukurannya dan tidak jelas siapa yang ditanya.',
          jadwal: 'Jadwal olahraga satu dan pasti; semua murid VII A menjawab sama.',
        },
      },
      {
        id: 'fRajin',
        tanya:
          'Usul "Apakah murid kelas VII rajin?" tidak jelas apa yang dicatat. Perbaikan mana yang paling tepat?',
        opsi: [
          {
            id: 'tepat',
            label: 'Berapa kali dalam sebulan murid kelas VII mengumpulkan PR tepat waktu?',
          },
          { id: 'sangat', label: 'Apakah murid kelas VII sangat rajin?' },
          { id: 'siapa', label: 'Siapa murid paling rajin di kelas VII?' },
          { id: 'guru', label: 'Berapa banyak PR yang diberikan guru minggu ini?' },
        ],
        correct: 'tepat',
        umpan: {
          tepat:
            'Tepat! "Rajin" diganti dengan sesuatu yang dapat dihitung: banyak PR yang dikumpulkan tepat waktu oleh setiap murid.',
          sangat: 'Menambah kata "sangat" tidak membuat "rajin" lebih jelas ukurannya.',
          siapa: 'Jawabannya satu nama saja, dan "paling rajin" tetap tidak jelas ukurannya.',
          guru: 'Banyak PR dari guru satu dan pasti — semua murid menjawab sama.',
        },
      },
    ],
    nextLabel: 'Lanjut: Uji Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGUJI HIPOTESIS
     ---------------------------------------------------------- */
  uji: {
    kicker: 'Tahap 5 · Menguji Hipotesis',
    syntax: IL + ' · Sintaks 5',
    goal: 'Menguji dugaan dan hipotesis dengan data dari ketiga lab.',
    guru: 'Setelah pernyataan dipilah, minta pasangan membacakan satu dugaan yang dikoreksi data dan menunjukkan buktinya dari lab. Hargai murid yang berani mengubah hipotesisnya.',
    judulA: 'A. Benar atau salah menurut data?',
    judulB: 'B. Dugaanmu vs data',
    opsiPernyataan: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'vBerapa',
        teks: 'Pertanyaan statistik selalu diawali kata "berapa".',
        correct: 'salah',
        explanation:
          '"Apa moda transportasi ke sekolah murid kelas VII A?" juga pertanyaan statistik; jawabannya berupa nama.',
      },
      {
        id: 'vSama',
        teks: 'Jika semua orang pasti memberi jawaban yang sama, pertanyaan itu bukan pertanyaan statistik.',
        correct: 'benar',
        explanation: 'Kartu bel masuk menghasilkan satu jawaban dari 32 murid.',
      },
      {
        id: 'vSaya',
        teks: '"Berapa tinggi badan saya?" adalah pertanyaan statistik karena jawabannya bilangan.',
        correct: 'salah',
        explanation: 'Pertanyaan itu hanya tentang satu orang, jadi datanya hanya satu.',
      },
      {
        id: 'vCiri',
        teks: 'Pertanyaan statistik ditanyakan kepada suatu kelompok dan jawabannya dapat beragam.',
        correct: 'benar',
        explanation:
          'Inilah yang terlihat pada kartu moda transportasi, waktu tidur, dan saudara kandung.',
      },
      {
        id: 'vKeren',
        teks: '"Apakah kelas kita keren?" perlu diperbaiki karena tidak jelas apa yang dicatat.',
        correct: 'benar',
        explanation: '"Keren" tidak punya ukuran yang sama bagi semua orang.',
      },
      {
        id: 'vJenis',
        teks: 'Jawaban "Apa olahraga kesukaan murid kelas VII A?" berupa data numerik.',
        correct: 'salah',
        explanation: 'Jawabannya berupa nama olahraga, jadi datanya kategorik.',
      },
      {
        id: 'vUkur',
        teks: 'Data tinggi badan murid kelas VII dikumpulkan dengan pengukuran.',
        correct: 'benar',
        explanation: 'Tinggi badan diukur memakai meteran atau alat ukur tinggi badan.',
      },
      {
        id: 'vRagam',
        teks: 'Makin banyak jawaban yang berbeda, makin tidak berguna pertanyaan itu.',
        correct: 'salah',
        explanation:
          'Justru keragaman jawaban itulah yang ingin diketahui dan dirangkum dengan data.',
      },
    ],
    nextLabel: 'Lanjut: Rumuskan Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MERUMUSKAN KESIMPULAN
     ---------------------------------------------------------- */
  simpulan: {
    kicker: 'Tahap 6 · Merumuskan Kesimpulan',
    syntax: IL + ' · Sintaks 6',
    goal: 'Menyusun kesimpulan tentang ciri dan cara merumuskan pertanyaan statistik.',
    guru: 'Minta beberapa pasangan membacakan kesimpulan lengkapnya, lalu kaitkan kembali dengan rumusan masalah di tahap 2 dan usul-usul di kotak OSIS.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai satu kali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      {
        id: 'kDefinisi',
        awal: 'Pertanyaan statistik adalah pertanyaan yang',
        correct: 'bDefinisi',
      },
      { id: 'kBukan', awal: 'Pertanyaan yang jawabannya satu dan pasti', correct: 'bBukan' },
      { id: 'kRumus', awal: 'Untuk merumuskan pertanyaan statistik,', correct: 'bRumus' },
      { id: 'kJenis', awal: 'Jawaban pertanyaan statistik dapat berupa', correct: 'bJenis' },
    ],
    bank: [
      {
        id: 'bDefinisi',
        teks: 'dijawab dengan mengumpulkan data dari suatu kelompok dan jawabannya dapat beragam.',
      },
      { id: 'bBukan', teks: 'atau hanya tentang satu orang bukan pertanyaan statistik.' },
      {
        id: 'bRumus',
        teks: 'tentukan dengan jelas apa yang dicatat dan kelompok yang akan ditanya.',
      },
      {
        id: 'bJenis',
        teks: 'data kategorik (kelompok/nama) atau data numerik (bilangan hasil menghitung/mengukur).',
      },
      { id: 'bBerapa', teks: 'selalu diawali kata "berapa".' },
      { id: 'bSatu', teks: 'cukup ditanyakan kepada orang yang paling tahu.' },
      { id: 'bBilangan', teks: 'selalu berupa bilangan.' },
    ],
    rangkuman: [
      '<strong>Pertanyaan statistik</strong> mengantisipasi jawaban yang <strong>beragam</strong> dan dijawab dengan <strong>mengumpulkan data</strong> dari suatu kelompok.',
      'Tiga ciri: <strong>yang dicatat jelas</strong>, <strong>ditanyakan kepada kelompok</strong>, dan <strong>jawabannya dapat beragam</strong>.',
      'Bukan pertanyaan statistik: jawabannya satu dan pasti (bel masuk), hanya tentang satu orang (tinggi badan saya), atau tidak jelas ukurannya (keren, enak).',
      'Rumus merakit: <strong>kata tanya + yang dicatat + kelompok</strong>. "Apa" untuk jawaban kelompok/nama, "Berapa" untuk jawaban bilangan.',
      'Tentukan jenis datanya (<strong>kategorik</strong> atau <strong>numerik</strong>) dan cara mengumpulkannya (<strong>survei</strong>, <strong>pengukuran</strong>, atau <strong>pengamatan</strong>).',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Diambil acak sesuai `komposisi` (per `minta`) dari bank. Opsi
     dibangun opsiSoalStatistik (engine seksi 80) lalu diacak di app.js.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan ciri pertanyaan statistik untuk memilih, memperbaiki, dan merencanakan pengumpulan data.',
    guru: 'Murid bekerja mandiri. Amati pesan umpan balik yang muncul (hanya satu orang, satu jawaban pasti, tidak jelas) sebagai bahan umpan balik individual.',
    instruksi:
      'Kerjakan delapan soal berikut. Periksa tiga ciri pertanyaan statistik sebelum memilih jawaban.',
    banyak: 8,
    komposisi: { pilihStatistik: 3, perbaiki: 1, alasan: 2, jenisData: 1, cara: 1 },
    soal: [
      {
        id: 'sPilih1',
        minta: 'pilihStatistik',
        konteks: 'sekolah',
        cerita: 'Kelas VII B ingin mengetahui kebiasaan sarapan teman-temannya.',
        pertanyaan: 'Pertanyaan mana yang merupakan pertanyaan statistik?',
        pilihan: [
          {
            id: 'a',
            teks: 'Apa menu sarapan murid kelas VII B pagi ini?',
            ciri: CIRI_STAT,
          },
          { id: 'b', teks: 'Apa menu sarapan saya pagi ini?', ciri: CIRI_SATU_ORANG },
          { id: 'c', teks: 'Jam berapa kantin sekolah dibuka?', ciri: CIRI_SATU_JAWABAN },
          { id: 'd', teks: 'Apakah sarapan itu enak?', ciri: CIRI_TAK_JELAS },
        ],
        explanation:
          'Menu sarapan setiap murid VII B dapat berbeda, kelompoknya jelas, dan yang dicatat jelas.',
      },
      {
        id: 'sPilih2',
        minta: 'pilihStatistik',
        konteks: 'diri',
        cerita: 'Raka ingin menulis fakta tentang tubuh murid untuk mading UKS.',
        pertanyaan: 'Pertanyaan mana yang merupakan pertanyaan statistik?',
        pilihan: [
          { id: 'a', teks: 'Berapa berat badan saya?', ciri: CIRI_SATU_ORANG },
          { id: 'b', teks: 'Berapa berat badan (kg) murid kelas VII?', ciri: CIRI_STAT },
          { id: 'c', teks: 'Berapa berat timbangan di UKS?', ciri: CIRI_SATU_ORANG },
          { id: 'd', teks: 'Apakah murid kelas VII sehat sekali?', ciri: CIRI_TAK_JELAS },
        ],
        explanation: 'Berat badan murid kelas VII beragam dan dapat diukur dengan timbangan.',
      },
      {
        id: 'sPilih3',
        minta: 'pilihStatistik',
        konteks: 'kelas',
        cerita: 'Pengurus perpustakaan ingin menambah koleksi buku sesuai minat murid.',
        pertanyaan: 'Pertanyaan mana yang merupakan pertanyaan statistik?',
        pilihan: [
          { id: 'a', teks: 'Jam berapa perpustakaan tutup?', ciri: CIRI_SATU_JAWABAN },
          { id: 'b', teks: 'Apakah perpustakaan kita bagus?', ciri: CIRI_TAK_JELAS },
          {
            id: 'c',
            teks: 'Apa jenis buku kesukaan murid kelas VII?',
            ciri: CIRI_STAT,
          },
          { id: 'd', teks: 'Siapa nama petugas perpustakaan?', ciri: CIRI_SATU_JAWABAN },
        ],
        explanation: 'Jenis buku kesukaan murid beragam (komik, novel, ensiklopedia, …).',
      },
      {
        id: 'sPilih4',
        minta: 'pilihStatistik',
        konteks: 'sekolah',
        cerita: 'Tim Adiwiyata ingin mengurangi sampah plastik di sekolah.',
        pertanyaan: 'Pertanyaan mana yang merupakan pertanyaan statistik?',
        pilihan: [
          {
            id: 'a',
            teks: 'Berapa banyak botol plastik yang dibawa setiap murid kelas VII dalam seminggu?',
            ciri: CIRI_STAT,
          },
          { id: 'b', teks: 'Berapa banyak tempat sampah di depan kelasku?', ciri: CIRI_SATU_ORANG },
          { id: 'c', teks: 'Apakah sampah plastik itu jelek?', ciri: CIRI_TAK_JELAS },
          { id: 'd', teks: 'Hari apa jadwal Jumat Bersih?', ciri: CIRI_SATU_JAWABAN },
        ],
        explanation:
          'Banyak botol plastik setiap murid dapat berbeda dan dapat dihitung sebagai data.',
      },
      {
        id: 'sPerbaiki1',
        minta: 'perbaiki',
        konteks: 'sekolah',
        cerita: 'Usul di kotak OSIS: "Apakah jajanan kantin mahal?"',
        pertanyaan: 'Perbaikan mana yang membuatnya menjadi pertanyaan statistik?',
        pilihan: [
          {
            id: 'a',
            teks: 'Berapa rupiah yang dibelanjakan murid kelas VII di kantin setiap hari?',
            ciri: CIRI_STAT,
          },
          { id: 'b', teks: 'Apakah jajanan kantin sangat mahal?', ciri: CIRI_TAK_JELAS },
          { id: 'c', teks: 'Berapa harga cilok di kantin?', ciri: CIRI_SATU_JAWABAN },
          { id: 'd', teks: 'Berapa rupiah uang jajan saya hari ini?', ciri: CIRI_SATU_ORANG },
        ],
        explanation:
          '"Mahal" diganti dengan yang dapat dicatat (rupiah yang dibelanjakan) dan ditanyakan ke kelompok murid kelas VII.',
      },
      {
        id: 'sPerbaiki2',
        minta: 'perbaiki',
        konteks: 'diri',
        cerita: 'Usul di kotak OSIS: "Berapa lama saya bermain gim setiap hari?"',
        pertanyaan: 'Perbaikan mana yang membuatnya menjadi pertanyaan statistik?',
        pilihan: [
          {
            id: 'a',
            teks: 'Berapa lama kakak saya bermain gim setiap hari?',
            ciri: CIRI_SATU_ORANG,
          },
          {
            id: 'b',
            teks: 'Berapa menit murid kelas VII bermain gim setiap hari?',
            ciri: CIRI_STAT,
          },
          { id: 'c', teks: 'Apakah bermain gim itu seru?', ciri: CIRI_TAK_JELAS },
          { id: 'd', teks: 'Kapan jam istirahat sekolah kita?', ciri: CIRI_SATU_JAWABAN },
        ],
        explanation:
          'Kelompoknya diganti dari "saya" menjadi murid kelas VII, sehingga jawabannya beragam.',
      },
      {
        id: 'sAlasan1',
        minta: 'alasan',
        konteks: 'diri',
        cerita: 'Nadia menulis pertanyaan: "Berapa nomor sepatu saya?"',
        pertanyaan: 'Mengapa pertanyaan itu bukan pertanyaan statistik?',
        ciri: CIRI_SATU_ORANG,
        explanation: 'Pertanyaannya hanya tentang Nadia sendiri, jadi datanya hanya satu.',
      },
      {
        id: 'sAlasan2',
        minta: 'alasan',
        konteks: 'sekolah',
        cerita: 'Bima menulis pertanyaan: "Hari apa upacara bendera di sekolah kita?"',
        pertanyaan: 'Mengapa pertanyaan itu bukan pertanyaan statistik?',
        ciri: CIRI_SATU_JAWABAN,
        explanation: 'Semua murid akan menjawab "Senin" — jawabannya satu dan pasti.',
      },
      {
        id: 'sAlasan3',
        minta: 'alasan',
        konteks: 'kelas',
        cerita: 'Tari menulis pertanyaan: "Apakah murid kelas VII A baik hati?"',
        pertanyaan: 'Mengapa pertanyaan itu bukan pertanyaan statistik?',
        ciri: CIRI_TAK_JELAS,
        explanation: '"Baik hati" tidak jelas ukurannya, sehingga jawabannya sulit dicatat.',
      },
      {
        id: 'sAlasan4',
        minta: 'alasan',
        konteks: 'sekolah',
        cerita: 'Joni menulis pertanyaan: "Berapa banyak murid yang terdaftar di kelas VII A?"',
        pertanyaan: 'Mengapa pertanyaan itu bukan pertanyaan statistik?',
        ciri: CIRI_SATU_JAWABAN,
        explanation:
          'Banyak murid terdaftar hanya satu bilangan dan dapat dilihat di daftar hadir.',
      },
      {
        id: 'sJenis1',
        minta: 'jenisData',
        konteks: 'kelas',
        cerita: 'Pertanyaan statistik: "Apa golongan darah murid kelas VII A?"',
        pertanyaan: 'Jawabannya termasuk jenis data apa?',
        ciri: CIRI_STAT,
        jenis: 'kategorik',
        explanation: 'Golongan darah berupa kelompok (A, B, AB, O), jadi datanya kategorik.',
      },
      {
        id: 'sJenis2',
        minta: 'jenisData',
        konteks: 'diri',
        cerita:
          'Pertanyaan statistik: "Berapa menit murid kelas VII belajar di rumah setiap malam?"',
        pertanyaan: 'Jawabannya termasuk jenis data apa?',
        ciri: CIRI_STAT,
        jenis: 'numerik',
        explanation: 'Jawabannya berupa bilangan (menit), jadi datanya numerik.',
      },
      {
        id: 'sJenis3',
        minta: 'jenisData',
        konteks: 'sekolah',
        cerita: 'Pertanyaan statistik: "Apa ekstrakurikuler yang diikuti murid kelas VII?"',
        pertanyaan: 'Jawabannya termasuk jenis data apa?',
        ciri: CIRI_STAT,
        jenis: 'kategorik',
        explanation: 'Jawabannya berupa nama kegiatan (Pramuka, PMR, futsal, …): data kategorik.',
      },
      {
        id: 'sCara1',
        minta: 'cara',
        konteks: 'diri',
        cerita: 'Pertanyaan statistik: "Berapa sentimeter panjang telapak kaki murid kelas VII B?"',
        pertanyaan: 'Cara paling tepat untuk mengumpulkan datanya adalah …',
        ciri: CIRI_STAT,
        cara: 'pengukuran',
        explanation: 'Panjang telapak kaki diukur dengan penggaris atau meteran.',
      },
      {
        id: 'sCara2',
        minta: 'cara',
        konteks: 'sekolah',
        cerita:
          'Pertanyaan statistik: "Apa jenis kendaraan yang mengantar murid kelas VII sampai di gerbang sekolah pagi ini?"',
        pertanyaan: 'Cara paling tepat untuk mengumpulkan datanya adalah …',
        ciri: CIRI_STAT,
        cara: 'pengamatan',
        explanation:
          'Petugas dapat berdiri di gerbang, melihat langsung, lalu mencatat dengan turus.',
      },
      {
        id: 'sCara3',
        minta: 'cara',
        konteks: 'kelas',
        cerita: 'Pertanyaan statistik: "Apa cita-cita murid kelas VII C?"',
        pertanyaan: 'Cara paling tepat untuk mengumpulkan datanya adalah …',
        ciri: CIRI_STAT,
        cara: 'survei',
        explanation: 'Cita-cita hanya dapat diketahui dengan bertanya atau memakai angket.',
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
    goal: 'Merefleksikan proses penyelidikan dan merumuskan pertanyaan statistik sendiri.',
    guru: 'Kumpulkan pertanyaan statistik buatan murid sebagai bahan pengumpulan data pada pertemuan berikutnya (Topik 11: penyajian data). Perhatikan murid yang masih menulis pertanyaan untuk satu orang.',
    milikkuLabel:
      'Rumuskan satu pertanyaan statistik tentang dirimu dan teman-teman atau lingkungan sekolahmu:',
    milikkuPlaceholder: 'mis. Berapa menit murid kelas VII A berjalan dari rumah ke sekolah?',
    cekLabel: 'Periksa pertanyaanmu sendiri — centang ciri yang sudah terpenuhi:',
    cek: [
      { id: 'cJelas', label: 'Jelas apa yang akan dicatat' },
      { id: 'cKelompok', label: 'Ditanyakan kepada suatu kelompok, bukan satu orang' },
      { id: 'cRagam', label: 'Jawabannya dapat beragam' },
      { id: 'cCara', label: 'Aku tahu cara mengumpulkan datanya' },
    ],
    pertanyaan: [
      {
        id: 'rBeda',
        teks: 'Dengan kata-katamu sendiri, apa beda pertanyaan statistik dan bukan statistik? Beri satu contoh masing-masing.',
        placeholder: 'Pertanyaan statistik adalah … contohnya … Bukan statistik misalnya …',
      },
      {
        id: 'rDugaan',
        teks: 'Dugaan mana yang berubah setelah kamu menyelidiki? Mengapa berubah?',
        placeholder: 'Awalnya aku menduga … ternyata …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu merumuskan pertanyaan statistik sekarang?',
    diriOpsi: [
      { id: 'yakin', label: '🌟 Sangat yakin, aku bisa menjelaskan ke teman' },
      { id: 'cukup', label: '🙂 Cukup yakin' },
      { id: 'ragu', label: '🤔 Masih ragu di beberapa bagian' },
      { id: 'belum', label: '🙋 Belum yakin, aku perlu bantuan' },
    ],
    nextLabel: 'Simpan & Selesai',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Penyelidikan Selesai!',
    teks: 'Kamu sudah menyelidiki ciri pertanyaan statistik. Kak Dinda kini tahu usul mana yang dijawab dengan data untuk mading "Fakta Kelas VII".',
    contoh: [
      {
        konteks: 'kelas',
        teks: 'Statistik ✓',
        keterangan: 'Apa moda transportasi ke sekolah murid kelas VII A?',
      },
      {
        konteks: 'sekolah',
        teks: 'Satu jawaban ✗',
        keterangan: 'Jam berapa bel masuk sekolah kita?',
      },
      {
        konteks: 'diri',
        teks: 'Satu orang ✗',
        keterangan: 'Berapa tinggi badan saya?',
      },
    ],
    capaian: [
      'Membedakan pertanyaan statistik dari pertanyaan berjawaban satu dan pasti.',
      'Menemukan tiga ciri pertanyaan statistik: yang dicatat jelas, ditanyakan kepada kelompok, dan jawabannya beragam.',
      'Merakit dan memperbaiki pertanyaan statistik tentang diri dan lingkungan sekolah.',
      'Menentukan jenis data dan cara mengumpulkan data untuk menjawabnya.',
    ],
  },
};
