'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Unsur & Bidang Penyusun Bangun Ruang — Fase D,
   SMP Kelas VII

   Tujuan Pembelajaran:
   Mengidentifikasi unsur-unsur dan bidang penyusun prisma, tabung,
   limas, dan kerucut melalui pengamatan benda konkret di lingkungan
   sekitar.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahSisi', 'olahAlas'
                                         & 'olahPola'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi    (7')  — "Benda di Sekitar Kita": kotak susu, kaleng,
                             tumpeng, piramida hiasan, tenda, dan pensil.
                             Murid memegang benda sungguhan (bila ada)
                             lalu MENDUGA: benda mana yang menggelinding,
                             berapa sisi kaleng, berapa titik sudut
                             tumpeng (tidak dinilai).
     2. Masalah      (5')  — memilih pertanyaan inti penyelidikan lalu
                             menulis hipotesis.
     3. Lab Amati    (20') — memilih benda, memutar & memiringkan model
                             3D-nya, MENANDAI sisi, rusuk, dan titik
                             sudut/puncak satu per satu, mencatat banyaknya
                             (isian berdiagnosa miskonsepsi), lalu
                             MEMBONGKAR benda menjadi bidang penyusunnya.
                             Minimal empat benda yang mewakili prisma,
                             tabung, limas, dan kerucut.
     4a. Sisi        (8')  — sisi datar vs sisi lengkung, rusuk lurus vs
                             lengkung; mengapa tabung & kerucut tidak
                             punya titik sudut.
     4b. Alas        (8')  — keluarga dua alas (prisma–tabung) dan satu
                             alas + puncak (limas–kerucut); bidang
                             penyusun tiap bangun.
     4c. Pola        (7')  — pola banyak unsur prisma & limas segi-n.
     5. Verifikasi   (10') — benda BARU acak: prediksi keempat unsurnya,
                             buktikan pada model & bidang penyusunnya,
                             memilah pernyataan, membandingkan dugaan.
     6. Generalisasi (5')  — menyusun ciri tiap bangun dari bank kalimat.
     7. Uji terap    (12') — delapan soal diambil acak dari bank enam
                             belas soal (isian berdiagnosa & pilihan
                             ganda berpengecoh miskonsepsi).
     8. Refleksi     (3')  — rekap, refleksi tertulis, penilaian diri.

   Konvensi unsur (buku siswa): rusuk = pertemuan dua sisi (boleh lurus
   atau lengkung); titik sudut = pertemuan tiga rusuk atau lebih. Jadi
   tabung tidak punya titik sudut dan puncak kerucut disebut TITIK
   PUNCAK (bukan titik sudut). Lihat engine seksi 78.

   Notasi kunci jawaban (`cek`, lihat engine seksi 78):
     { minta: 'unsur', jenis, n, kolom }
     { minta: 'banyakBidang', jenis, n, bentuk }
     { minta: 'n', jenis, kolom, nilai }
     { minta: 'bangun', jenis, n } | { minta: 'bidang', jenis, n }

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Benda verifikasi dan
   soal uji terap juga diambil acak; opsi pilihan gandanya dibangun
   engine (opsiSoalRuang) lalu diacak.

   Konsistensi kunci jawaban diuji tests/mpi-9.1-data.test.js terhadap
   engine seksi 78.
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  meta: {
    judul: 'Unsur & Bidang Penyusun Bangun Ruang',
  },

  tahap: [
    { id: 'stimulasi', label: 'Stimulasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'koleksi', label: 'Lab Amati' },
    { id: 'olahSisi', label: 'Sisi & Rusuk' },
    { id: 'olahAlas', label: 'Alas & Bidang' },
    { id: 'olahPola', label: 'Pola Unsur' },
    { id: 'verifikasi', label: 'Verifikasi' },
    { id: 'generalisasi', label: 'Generalisasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Label konteks soal (ikon + nama). */
  konteks: {
    dapur: { ikon: '🍳', nama: 'Dapur & Makanan' },
    sekolah: { ikon: '🏫', nama: 'Sekolah' },
    bangunan: { ikon: '🏠', nama: 'Bangunan & Hiasan' },
    permainan: { ikon: '🎈', nama: 'Permainan & Kerajinan' },
    pola: { ikon: '🔢', nama: 'Pola Unsur' },
  },

  /* Nama bangun untuk tampilan ringkas. */
  namaJenis: {
    prisma: 'Prisma',
    tabung: 'Tabung',
    limas: 'Limas',
    kerucut: 'Kerucut',
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; dibandingkan dengan temuan pada tahap
     Verifikasi. `baku` = jawaban menurut temuan (diuji engine bila
     ada `cek`).
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati benda-benda berbentuk bangun ruang di sekitar kita, lalu menduga unsur-unsurnya.',
    tp: 'Mengidentifikasi unsur-unsur dan bidang penyusun prisma, tabung, limas, dan kerucut melalui pengamatan benda konkret di lingkungan sekitar.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menunjukkan sisi datar, sisi lengkung, rusuk, titik sudut, dan titik puncak pada benda konkret maupun modelnya.',
      'Menentukan banyak sisi, rusuk, dan titik sudut prisma, tabung, limas, dan kerucut.',
      'Menyebutkan bidang-bidang penyusun prisma, tabung, limas, dan kerucut.',
      'Membedakan keluarga dua alas (prisma, tabung) dan keluarga satu alas + puncak (limas, kerucut).',
      'Menemukan pola banyak unsur prisma dan limas segi-n.',
    ],
    guru: 'Bawa benda sungguhan: kotak susu, kaleng, tumpeng/kerucut karton, tenda mainan, pensil, atau piramida hiasan. Edarkan ke setiap pasangan dan minta mereka meraba permukaan dan pojoknya. Jangan membenarkan dugaan dulu — dugaan yang berbeda-beda menjadi bahan penyelidikan.',
    judul: 'Benda di Sekitar Kita',
    pengantar:
      'Lihatlah benda-benda ini. Semuanya berbentuk bangun ruang. Raba permukaannya: ada yang datar, ada yang melengkung. Ada yang punya pojok tajam, ada yang tidak.',
    kartu: [
      {
        id: 'kKotak',
        ikon: '🧃',
        judul: 'Kotak susu',
        teks: 'Permukaannya datar semua dan pojoknya tajam.',
        jenis: 'prisma',
        n: 4,
      },
      {
        id: 'kKaleng',
        ikon: '🥫',
        judul: 'Kaleng susu',
        teks: 'Bagian atas dan bawahnya datar, sekelilingnya melengkung.',
        jenis: 'tabung',
      },
      {
        id: 'kTumpeng',
        ikon: '🍚',
        judul: 'Nasi tumpeng',
        teks: 'Alasnya bundar dan ujungnya meruncing.',
        jenis: 'kerucut',
      },
      {
        id: 'kPiramida',
        ikon: '🔺',
        judul: 'Piramida hiasan',
        teks: 'Alasnya persegi dan keempat sisinya bertemu di ujung atas.',
        jenis: 'limas',
        n: 4,
      },
      {
        id: 'kTenda',
        ikon: '⛺',
        judul: 'Tenda pramuka',
        teks: 'Dilihat dari depan, tenda berbentuk segitiga.',
        jenis: 'prisma',
        n: 3,
      },
      {
        id: 'kPensil',
        ikon: '✏️',
        judul: 'Batang pensil',
        teks: 'Penampangnya segienam dan panjangnya sama dari ujung ke ujung.',
        jenis: 'prisma',
        n: 6,
      },
    ],
    dugaan: [
      {
        id: 'dGelinding',
        tanya: 'Benda mana yang dapat menggelinding bila didorong pelan di atas meja?',
        opsi: [
          { id: 'kaleng', label: 'Kaleng susu' },
          { id: 'kotak', label: 'Kotak susu' },
          { id: 'piramida', label: 'Piramida hiasan' },
          { id: 'tenda', label: 'Tenda pramuka' },
        ],
        baku: 'kaleng',
        pembahasan:
          'Kaleng mempunyai sisi lengkung (selimut), jadi dapat menggelinding. Kotak, piramida, dan tenda semua sisinya datar.',
      },
      {
        id: 'dSisiKaleng',
        tanya: 'Berapa banyak sisi (permukaan) kaleng susu yang tertutup?',
        opsi: [
          { id: 'o3', label: '3' },
          { id: 'o1', label: '1' },
          { id: 'o2', label: '2' },
          { id: 'o4', label: '4' },
        ],
        baku: 'o3',
        cek: { minta: 'unsur', jenis: 'tabung', kolom: 'sisi' },
        pembahasan:
          'Kaleng (tabung) mempunyai 3 sisi: 2 sisi datar (alas dan tutup) dan 1 sisi lengkung (selimut).',
      },
      {
        id: 'dTitikTumpeng',
        tanya: 'Berapa banyak titik sudut nasi tumpeng (kerucut)?',
        opsi: [
          { id: 'o0', label: '0' },
          { id: 'o1', label: '1' },
          { id: 'o2', label: '2' },
          { id: 'banyak', label: 'Banyak sekali, di sepanjang tepi alasnya' },
        ],
        baku: 'o0',
        cek: { minta: 'unsur', jenis: 'kerucut', kolom: 'titikSudut' },
        pembahasan:
          'Kerucut tidak mempunyai titik sudut. Ujung runcingnya disebut titik puncak, karena tidak ada rusuk yang bertemu di sana.',
      },
      {
        id: 'dBidangKotak',
        tanya: 'Kotak susu tersusun dari bidang-bidang datar berbentuk …',
        opsi: [
          { id: 'pp', label: 'Persegi panjang (atau persegi) saja' },
          { id: 'ppSegitiga', label: 'Persegi panjang dan segitiga' },
          { id: 'ppLingkaran', label: 'Persegi panjang dan lingkaran' },
          { id: 'segitiga', label: 'Segitiga saja' },
        ],
        baku: 'pp',
        pembahasan:
          'Kotak susu adalah prisma segiempat (balok): 2 segiempat sebagai alas dan tutup, ditambah 4 persegi panjang sebagai sisi tegak.',
      },
    ],
    alasanLabel:
      'Bagaimana caramu menduga? Apakah kamu meraba bendanya, membayangkan, atau menebak? Tulis singkat.',
    alasanPlaceholder: 'Contoh: aku menduga kaleng punya … sisi karena …',
    catatan:
      'Dugaan ini belum dinilai. Kalian akan memeriksanya sendiri dengan mengamati dan menandai unsur benda di Lab Amati.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — PROBLEM STATEMENT
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan penyelidikan tentang unsur dan bidang penyusun bangun ruang, lalu menulis hipotesis.',
    guru: 'Arahkan murid pada pertanyaan yang dapat dijawab dengan mengamati benda. Bahas mengapa pertanyaan tentang harga atau isi kaleng tidak dapat dijawab dengan menghitung sisi dan rusuk.',
    pengantar:
      'Dugaan kalian tentang kaleng, tumpeng, dan kotak mungkin berbeda-beda. Apa sebenarnya yang membedakan prisma, tabung, limas, dan kerucut?',
    pertanyaan: 'Pilih pertanyaan inti penyelidikan kita:',
    opsi: [
      {
        id: 'inti',
        label:
          'Unsur-unsur apa (sisi, rusuk, titik sudut) yang dimiliki prisma, tabung, limas, dan kerucut, dan bidang datar apa saja yang menyusunnya?',
      },
      { id: 'harga', label: 'Berapa harga sekaleng susu di warung dekat sekolah?' },
      { id: 'isi', label: 'Berapa mililiter susu yang dapat dimuat kaleng itu?' },
      { id: 'sejarah', label: 'Siapa yang membangun piramida di Mesir?' },
    ],
    correct: 'inti',
    umpan: {
      inti: 'Tepat! Pertanyaan ini dapat kita selidiki dengan mengamati benda, menandai unsurnya, dan membongkarnya menjadi bidang-bidang penyusun.',
      harga:
        'Harga tidak dapat diketahui dengan mengamati bentuk benda. Pilih pertanyaan tentang unsur bangun ruang.',
      isi: 'Isi kaleng berkaitan dengan volume, topik di pertemuan lain. Hari ini kita menyelidiki unsur dan bidang penyusunnya.',
      sejarah:
        'Sejarah piramida menarik, tetapi tidak menjawab apa yang membedakan prisma, tabung, limas, dan kerucut.',
    },
    hipotesisLabel:
      'Tulis dugaan sementaramu (hipotesis): apa yang membedakan prisma, tabung, limas, dan kerucut menurutmu?',
    hipotesisPlaceholder:
      'Contoh: menurutku tabung dan kerucut punya sisi …, sedangkan prisma dan limas …',
    nextLabel: 'Lanjut: Lab Amati →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — DATA COLLECTION: LAB AMATI BENDA
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Mengumpulkan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengamati benda-benda di sekitar, menandai dan menghitung sisi, rusuk, serta titik sudutnya, lalu membongkarnya menjadi bidang-bidang penyusun.',
    guru: 'Murid bergantian: satu memutar model dan menandai unsur, yang lain memegang benda sungguhan dan mencocokkan. Tanyakan: "Di mana dua sisi bertemu? Itulah rusuk." Bila muncul pesan tentang garis tepi gambar, minta murid memutar model dan mengamati garis itu berpindah. Konvensi buku siswa: puncak kerucut adalah titik puncak, bukan titik sudut.',
    pengantar:
      'Pilih sebuah benda. Putar dan miringkan modelnya, lalu ketuk setiap sisi, rusuk, dan titik sudut untuk menandainya. Catat banyaknya, lalu bongkar benda itu menjadi bidang-bidang penyusunnya. Amati minimal empat benda yang mewakili prisma, tabung, limas, dan kerucut.',
    tips: [
      'SISI adalah permukaan yang membatasi benda. Ada sisi datar dan ada sisi lengkung.',
      'RUSUK adalah tempat dua sisi bertemu. Rusuk boleh lurus atau melengkung.',
      'TITIK SUDUT adalah titik tempat tiga rusuk atau lebih bertemu. Ujung runcing yang tidak didatangi rusuk disebut TITIK PUNCAK.',
      'Geser "Miringkan" ke kiri untuk melihat bagian bawah benda: alasnya juga dihitung!',
    ],
    lab: {
      minBenda: 4,
      benda: [
        {
          id: 'kotakSusu',
          nama: 'Kotak susu',
          ikon: '🧃',
          jenis: 'prisma',
          n: 4,
          teks: 'Kotak susu UHT berbentuk balok tertutup.',
        },
        {
          id: 'kaleng',
          nama: 'Kaleng susu',
          ikon: '🥫',
          jenis: 'tabung',
          teks: 'Kaleng susu kental yang masih tersegel.',
        },
        {
          id: 'piramida',
          nama: 'Piramida hiasan',
          ikon: '🔺',
          jenis: 'limas',
          n: 4,
          teks: 'Hiasan meja dari kaca dengan alas persegi.',
        },
        {
          id: 'tumpeng',
          nama: 'Nasi tumpeng',
          ikon: '🍚',
          jenis: 'kerucut',
          teks: 'Nasi tumpeng beserta alasnya yang bundar.',
        },
        {
          id: 'tenda',
          nama: 'Tenda pramuka',
          ikon: '⛺',
          jenis: 'prisma',
          n: 3,
          teks: 'Tenda tertutup rapat, termasuk alas dan pintunya.',
        },
        {
          id: 'pensil',
          nama: 'Batang pensil',
          ikon: '✏️',
          jenis: 'prisma',
          n: 6,
          teks: 'Pensil baru yang belum diraut.',
        },
        {
          id: 'dadu',
          nama: 'Dadu limas',
          ikon: '🎲',
          jenis: 'limas',
          n: 3,
          teks: 'Dadu bermata empat dari permainan papan.',
        },
      ],
    },
    selesaiTeks:
      'Data sudah terkumpul. Amati tabelmu: bangun mana yang punya sisi lengkung? Bangun mana yang punya dua alas? Adakah pola pada banyak unsurnya?',
    nextLabel: 'Lanjut: Olah Data Sisi & Rusuk →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — DATA PROCESSING: SISI DATAR, SISI LENGKUNG & RUSUK
     Kunci pemilahan dihitung engine (punyaSisiLengkung).
     ---------------------------------------------------------- */
  olahSisi: {
    kicker: 'Tahap 4a · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan dari tabel pengamatan perbedaan sisi datar dan sisi lengkung, rusuk lurus dan rusuk lengkung, serta titik sudut dan titik puncak.',
    guru: 'Minta murid membandingkan baris tabung dan kerucut dengan baris prisma dan limas. Tanyakan: "Mengapa kaleng bisa menggelinding?" dan "Di mana rusuk kaleng?" Tekankan bahwa rusuk boleh melengkung.',
    judul: 'Tabel pengamatanmu',
    pengantar:
      'Bandingkan kolom sisi lengkung, rusuk, dan titik sudut pada tabelmu. Bangun mana yang berbeda dari yang lain?',
    temuan: [
      {
        id: 'sDatar',
        tanya: 'Menurut tabelmu, bangun mana yang SEMUA sisinya datar?',
        opsi: [
          { id: 'pl', label: 'Prisma dan limas' },
          { id: 'tk', label: 'Tabung dan kerucut' },
          { id: 'pt', label: 'Prisma dan tabung' },
          { id: 'semua', label: 'Keempat bangun' },
        ],
        correct: 'pl',
        umpan: {
          pl: 'Tepat! Kolom sisi lengkung prisma dan limas berisi 0. Semua sisinya bidang datar.',
          tk: 'Periksa lagi kolom sisi lengkung: tabung dan kerucut justru punya 1 sisi lengkung.',
          pt: 'Tabung punya selimut yang melengkung. Periksa kolom sisi lengkungnya.',
          semua: 'Tabung dan kerucut punya sisi lengkung. Lihat lagi kolom sisi lengkung.',
        },
      },
      {
        id: 'sLengkung',
        tanya: 'Apa yang dimiliki tabung dan kerucut, tetapi tidak dimiliki prisma dan limas?',
        opsi: [
          { id: 'lengkung', label: 'Sisi lengkung (selimut) dan rusuk lengkung' },
          { id: 'puncak', label: 'Titik puncak' },
          { id: 'alas', label: 'Sisi alas' },
          { id: 'tegak', label: 'Rusuk tegak' },
        ],
        correct: 'lengkung',
        umpan: {
          lengkung:
            'Tepat! Selimut tabung dan kerucut melengkung, sehingga rusuk tempat selimut bertemu alas juga melengkung.',
          puncak: 'Limas juga punya puncak, dan tabung tidak punya puncak. Cari yang lain.',
          alas: 'Keempat bangun sama-sama punya sisi alas.',
          tegak: 'Rusuk tegak justru dimiliki prisma dan limas, bukan tabung dan kerucut.',
        },
      },
      {
        id: 'sTitik',
        tanya: 'Mengapa tabung tidak mempunyai titik sudut?',
        opsi: [
          {
            id: 'tidakBertemu',
            label:
              'Rusuknya melengkung tanpa ujung, sehingga tidak ada tiga rusuk yang bertemu di satu titik',
          },
          { id: 'bulat', label: 'Karena tabung bulat sehingga titiknya tidak dapat dihitung' },
          { id: 'kecil', label: 'Karena titik sudutnya terlalu kecil untuk dilihat' },
          { id: 'gambar', label: 'Sebenarnya tabung punya 4 titik sudut di pojok gambarnya' },
        ],
        correct: 'tidakBertemu',
        umpan: {
          tidakBertemu:
            'Tepat! Titik sudut adalah tempat bertemunya tiga rusuk atau lebih. Pada tabung, kedua rusuknya berupa lingkaran yang tidak saling bertemu.',
          bulat: 'Bukan soal sulit dihitung. Ingat arti titik sudut: tempat rusuk-rusuk bertemu.',
          kecil: 'Coba putar model tabung: tidak ada pojok tajam sama sekali.',
          gambar:
            'Pojok pada gambar hanyalah ujung garis tepi gambar. Putar modelnya: "pojok" itu ikut berpindah, jadi bukan titik sudut.',
        },
      },
    ],
    pilah: {
      judul: 'Pilah benda lain di sekitarmu',
      pengantar:
        'Bayangkan benda-benda berikut dalam keadaan tertutup. Apakah semua sisinya datar, atau ada sisi yang melengkung?',
      kategori: [
        { id: 'datar', label: 'Semua sisinya datar' },
        { id: 'lengkung', label: 'Mempunyai sisi lengkung' },
      ],
      butir: [
        {
          id: 'pPipa',
          teks: '🪈 Pipa paralon yang kedua ujungnya ditutup',
          jenis: 'tabung',
          explanation: 'Pipa berbentuk tabung: selimutnya melengkung.',
        },
        {
          id: 'pTisu',
          teks: '🧻 Kotak tisu',
          jenis: 'prisma',
          n: 4,
          explanation: 'Kotak tisu berbentuk balok (prisma segiempat): semua sisinya datar.',
        },
        {
          id: 'pCokelat',
          teks: '🍫 Kemasan cokelat batangan berpenampang segitiga',
          jenis: 'prisma',
          n: 3,
          explanation:
            'Kemasan itu prisma segitiga: 2 segitiga dan 3 persegi panjang, semuanya datar.',
        },
        {
          id: 'pKerucut',
          teks: '🚧 Kerucut lalu lintas beserta alasnya',
          jenis: 'kerucut',
          explanation: 'Kerucut lalu lintas mempunyai selimut yang melengkung.',
        },
        {
          id: 'pLilin',
          teks: '🕯️ Lilin batang bulat',
          jenis: 'tabung',
          explanation: 'Lilin batang bulat berbentuk tabung dengan selimut lengkung.',
        },
        {
          id: 'pAtap',
          teks: '🏯 Hiasan atap joglo berbentuk limas beralas persegi',
          jenis: 'limas',
          n: 4,
          explanation: 'Limas: alas dan sisi-sisi tegaknya semua datar.',
        },
      ],
    },
    langkah: [
      {
        id: 'ls1',
        label: 'Berapa banyak sisi lengkung tabung?',
        cek: { minta: 'unsur', jenis: 'tabung', kolom: 'sisiLengkung' },
        placeholder: 'mis. 2',
        hints: [
          'Ketuk bagian yang melengkung pada model tabung.',
          'Selimut tabung satu bidang utuh.',
        ],
        temuan: 'Tabung mempunyai 1 sisi lengkung, yaitu selimutnya.',
      },
      {
        id: 'ls2',
        label: 'Berapa banyak rusuk kerucut?',
        cek: { minta: 'unsur', jenis: 'kerucut', kolom: 'rusuk' },
        placeholder: 'mis. 2',
        hints: [
          'Rusuk adalah tempat dua sisi bertemu.',
          'Pada kerucut, selimut hanya bertemu alas di satu lingkaran.',
        ],
        temuan: 'Kerucut mempunyai 1 rusuk lengkung: lingkaran tempat selimut bertemu alas.',
      },
      {
        id: 'ls3',
        label: 'Berapa banyak titik sudut kerucut?',
        cek: { minta: 'unsur', jenis: 'kerucut', kolom: 'titikSudut' },
        placeholder: 'mis. 1',
        hints: [
          'Titik sudut adalah tempat tiga rusuk atau lebih bertemu.',
          'Adakah rusuk yang menuju puncak kerucut?',
        ],
        temuan: 'Kerucut tidak punya titik sudut (0). Ujungnya disebut titik puncak.',
      },
      {
        id: 'ls4',
        label: 'Berapa banyak sisi lengkung prisma segilima?',
        cek: { minta: 'unsur', jenis: 'prisma', n: 5, kolom: 'sisiLengkung' },
        placeholder: 'mis. 1',
        hints: ['Apakah prisma punya permukaan yang melengkung?'],
        temuan: 'Prisma tidak punya sisi lengkung (0): semua sisinya datar.',
      },
    ],
    ringkasan:
      'Prisma dan limas hanya mempunyai sisi datar dan rusuk lurus. Tabung dan kerucut mempunyai sisi lengkung (selimut) dan rusuk lengkung, tetapi tidak mempunyai titik sudut. Puncak kerucut disebut titik puncak.',
    nextLabel: 'Lanjut: Olah Data Alas & Bidang →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — DATA PROCESSING: ALAS & BIDANG PENYUSUN
     Kunci pemilahan dihitung engine (kelompokAlas); teks butir dari
     teksBidangPenyusun.
     ---------------------------------------------------------- */
  olahAlas: {
    kicker: 'Tahap 4b · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan dari bidang penyusun bahwa prisma dan tabung mempunyai dua alas yang kongruen dan sejajar, sedangkan limas dan kerucut mempunyai satu alas dan satu puncak.',
    guru: 'Tunjukkan kaleng di samping kotak susu, dan tumpeng di samping piramida. Tanyakan: "Apa yang sama dari kaleng dan kotak susu?" Kaleng seperti prisma yang alasnya lingkaran; tumpeng seperti limas yang alasnya lingkaran.',
    judul: 'Bidang penyusun yang kamu temukan',
    pengantar:
      'Lihat kolom bidang penyusun pada tabelmu. Bandingkan kotak susu dengan kaleng, dan piramida dengan tumpeng.',
    temuan: [
      {
        id: 'aDua',
        tanya: 'Prisma dan tabung sama-sama mempunyai …',
        opsi: [
          {
            id: 'duaAlas',
            label: 'dua alas yang sama bentuk dan ukurannya (kongruen) serta sejajar',
          },
          { id: 'puncak', label: 'satu titik puncak' },
          { id: 'segitiga', label: 'sisi tegak berbentuk segitiga' },
          { id: 'lengkung', label: 'sisi lengkung' },
        ],
        correct: 'duaAlas',
        umpan: {
          duaAlas:
            'Tepat! Prisma punya dua segi-n kongruen, tabung punya dua lingkaran kongruen: alas dan tutup yang sejajar.',
          puncak: 'Prisma dan tabung tidak meruncing ke satu puncak. Lihat lagi bagian atasnya.',
          segitiga: 'Sisi tegak segitiga dimiliki limas, bukan prisma maupun tabung.',
          lengkung: 'Prisma tidak punya sisi lengkung. Cari ciri yang dimiliki keduanya.',
        },
      },
      {
        id: 'aSatu',
        tanya: 'Limas dan kerucut sama-sama mempunyai …',
        opsi: [
          { id: 'satuAlas', label: 'satu alas dan satu puncak' },
          { id: 'duaAlas', label: 'dua alas yang kongruen' },
          { id: 'pp', label: 'sisi tegak berbentuk persegi panjang' },
          { id: 'lengkung', label: 'sisi lengkung' },
        ],
        correct: 'satuAlas',
        umpan: {
          satuAlas:
            'Tepat! Sisi tegak limas dan selimut kerucut sama-sama meruncing dari alas menuju satu puncak.',
          duaAlas: 'Limas dan kerucut tidak punya tutup. Hanya ada satu alas.',
          pp: 'Sisi tegak limas berbentuk segitiga, bukan persegi panjang.',
          lengkung: 'Limas tidak punya sisi lengkung. Cari ciri yang dimiliki keduanya.',
        },
      },
      {
        id: 'aSelimut',
        tanya:
          'Saat dibongkar, selimut tabung menjadi bangun datar …, sedangkan selimut kerucut menjadi …',
        opsi: [
          { id: 'pj', label: 'persegi panjang; juring lingkaran' },
          { id: 'jp', label: 'juring lingkaran; persegi panjang' },
          { id: 'll', label: 'lingkaran; lingkaran' },
          { id: 'ps', label: 'persegi panjang; segitiga' },
        ],
        correct: 'pj',
        umpan: {
          pj: 'Tepat! Label kaleng yang dibuka berbentuk persegi panjang; topi kerucut yang dibuka berbentuk juring lingkaran.',
          jp: 'Tertukar. Bayangkan membuka label kaleng: bentuknya persegi panjang.',
          ll: 'Lingkaran adalah alasnya. Yang ditanyakan selimutnya.',
          ps: 'Selimut kerucut melengkung. Saat dibuka, tepi bawahnya tetap melengkung, jadi bukan segitiga.',
        },
      },
    ],
    pilah: {
      judul: 'Dua alas atau satu alas + puncak?',
      pengantar:
        'Setiap butir adalah daftar bidang penyusun sebuah bangun ruang. Tentukan apakah bangun itu beralas dua atau beralas satu dengan puncak.',
      kategori: [
        { id: 'duaAlas', label: 'Dua alas (keluarga prisma–tabung)' },
        { id: 'satuAlas', label: 'Satu alas + puncak (keluarga limas–kerucut)' },
      ],
      butir: [
        {
          id: 'bA',
          jenis: 'prisma',
          n: 5,
          explanation: 'Dua segilima sebagai alas dan tutup: prisma segilima.',
        },
        { id: 'bB', jenis: 'kerucut', explanation: 'Satu lingkaran dan satu juring: kerucut.' },
        {
          id: 'bC',
          jenis: 'limas',
          n: 6,
          explanation: 'Satu segienam dan enam segitiga: limas segienam.',
        },
        {
          id: 'bD',
          jenis: 'tabung',
          explanation: 'Dua lingkaran dan satu persegi panjang: tabung.',
        },
        {
          id: 'bE',
          jenis: 'prisma',
          n: 3,
          explanation: 'Dua segitiga sebagai alas dan tutup: prisma segitiga.',
        },
        {
          id: 'bF',
          jenis: 'limas',
          n: 4,
          explanation: 'Satu segiempat dan empat segitiga: limas segiempat.',
        },
      ],
    },
    langkah: [
      {
        id: 'la1',
        label: 'Prisma segilima disusun oleh berapa persegi panjang?',
        cek: { minta: 'banyakBidang', jenis: 'prisma', n: 5, bentuk: 'persegi panjang' },
        placeholder: 'mis. 7',
        hints: [
          'Persegi panjang menjadi sisi tegak prisma.',
          'Banyak sisi tegak = banyak sisi alas.',
        ],
        temuan: 'Prisma segilima mempunyai 5 sisi tegak berbentuk persegi panjang.',
      },
      {
        id: 'la2',
        label: 'Limas segienam disusun oleh berapa segitiga?',
        cek: { minta: 'banyakBidang', jenis: 'limas', n: 6, bentuk: 'segitiga' },
        placeholder: 'mis. 7',
        hints: ['Segitiga menjadi sisi tegak limas.', 'Setiap sisi alas mempunyai satu segitiga.'],
        temuan: 'Limas segienam mempunyai 6 sisi tegak berbentuk segitiga.',
      },
      {
        id: 'la3',
        label: 'Tabung disusun oleh berapa lingkaran?',
        cek: { minta: 'banyakBidang', jenis: 'tabung', bentuk: 'lingkaran' },
        placeholder: 'mis. 1',
        hints: ['Ingat: tabung mempunyai alas dan tutup.'],
        temuan: 'Tabung disusun oleh 2 lingkaran (alas dan tutup) dan 1 selimut.',
      },
      {
        id: 'la4',
        label: 'Prisma segitiga disusun oleh berapa segitiga?',
        cek: { minta: 'banyakBidang', jenis: 'prisma', n: 3, bentuk: 'segitiga' },
        placeholder: 'mis. 5',
        hints: [
          'Segitiga pada prisma segitiga adalah alas dan tutupnya.',
          'Sisi tegaknya persegi panjang.',
        ],
        temuan: 'Prisma segitiga mempunyai 2 segitiga (alas dan tutup) dan 3 persegi panjang.',
      },
    ],
    ringkasan:
      'Prisma (2 segi-n + n persegi panjang) dan tabung (2 lingkaran + selimut) mempunyai dua alas yang kongruen dan sejajar. Limas (1 segi-n + n segitiga) dan kerucut (1 lingkaran + selimut) mempunyai satu alas dan satu puncak. Selimut tabung berbentuk persegi panjang dan selimut kerucut berbentuk juring lingkaran bila dibuka.',
    nextLabel: 'Lanjut: Olah Data Pola Unsur →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — DATA PROCESSING: POLA UNSUR PRISMA & LIMAS SEGI-N
     Butir pilah berupa rumus a × n + b; kuncinya dihitung engine
     (rumusUnsurBangun). Tabel data dibangun app.js untuk `polaN`.
     ---------------------------------------------------------- */
  olahPola: {
    kicker: 'Tahap 4c · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan pola banyak titik sudut, rusuk, dan sisi prisma dan limas segi-n.',
    guru: 'Minta murid menjelaskan pola dengan menunjuk model, bukan menghafal: "Titik sudut prisma ada n di alas dan n di tutup, jadi 2 × n."',
    judul: 'Data prisma dan limas segi-n',
    pengantar:
      'Tabel berikut berisi data prisma dan limas dengan alas segitiga sampai segienam (n = banyak sisi alas). Cocokkan dengan benda yang kamu amati, lalu cari polanya.',
    polaN: [3, 4, 5, 6],
    temuan: [
      {
        id: 'pTitik',
        tanya: 'Banyak titik sudut prisma segi-n selalu …',
        opsi: [
          { id: 'dua', label: '2 × n (n di alas dan n di tutup)' },
          { id: 'plus1', label: 'n + 1' },
          { id: 'tiga', label: '3 × n' },
          { id: 'plus2', label: 'n + 2' },
        ],
        correct: 'dua',
        umpan: {
          dua: 'Tepat! Prisma segienam: 6 titik di alas + 6 titik di tutup = 12.',
          plus1: 'Itu pola titik sudut limas (n di alas + 1 puncak). Prisma punya tutup.',
          tiga: 'Itu pola rusuk prisma. Periksa kolom titik sudut.',
          plus2: 'Itu pola sisi prisma. Periksa kolom titik sudut.',
        },
      },
      {
        id: 'pRusuk',
        tanya: 'Banyak rusuk limas segi-n selalu …',
        opsi: [
          { id: 'dua', label: '2 × n (n rusuk alas dan n rusuk tegak)' },
          { id: 'tiga', label: '3 × n' },
          { id: 'plus1', label: 'n + 1' },
          { id: 'n', label: 'n' },
        ],
        correct: 'dua',
        umpan: {
          dua: 'Tepat! Limas segiempat: 4 rusuk alas + 4 rusuk tegak = 8.',
          tiga: 'Itu pola rusuk prisma. Limas tidak punya rusuk tutup.',
          plus1: 'Itu pola titik sudut atau sisi limas. Periksa kolom rusuk.',
          n: 'Itu baru rusuk alasnya. Masih ada rusuk tegak yang menuju puncak.',
        },
      },
      {
        id: 'pSisi',
        tanya: 'Mengapa banyak sisi prisma segi-n sama dengan n + 2?',
        opsi: [
          { id: 'tegak', label: 'Ada n sisi tegak, ditambah alas dan tutup' },
          { id: 'rusuk', label: 'Ada n rusuk, ditambah 2 titik' },
          { id: 'lengkung', label: 'Ada n sisi datar, ditambah 2 sisi lengkung' },
          { id: 'titik', label: 'Ada n titik sudut, ditambah 2 puncak' },
        ],
        correct: 'tegak',
        umpan: {
          tegak:
            'Tepat! Setiap sisi alas mempunyai satu sisi tegak (n), lalu ditambah alas dan tutup (2).',
          rusuk: 'Sisi dihitung dari bidang-bidangnya, bukan dari rusuk dan titik.',
          lengkung: 'Prisma tidak punya sisi lengkung.',
          titik: 'Prisma tidak punya puncak.',
        },
      },
    ],
    pilah: {
      judul: 'Pola milik prisma atau limas?',
      pengantar:
        'n adalah banyak sisi alas. Tentukan apakah setiap pola berikut berlaku untuk prisma segi-n atau limas segi-n.',
      kategori: [
        { id: 'prisma', label: 'Pola prisma segi-n' },
        { id: 'limas', label: 'Pola limas segi-n' },
      ],
      butir: [
        {
          id: 'r1',
          kolom: 'rusuk',
          a: 3,
          b: 0,
          explanation: 'Prisma: n rusuk alas + n rusuk tutup + n rusuk tegak.',
        },
        {
          id: 'r2',
          kolom: 'titikSudut',
          a: 1,
          b: 1,
          explanation: 'Limas: n titik di alas + 1 titik puncak.',
        },
        {
          id: 'r3',
          kolom: 'sisi',
          a: 1,
          b: 2,
          explanation: 'Prisma: n sisi tegak + alas + tutup.',
        },
        {
          id: 'r4',
          kolom: 'rusuk',
          a: 2,
          b: 0,
          explanation: 'Limas: n rusuk alas + n rusuk tegak.',
        },
        {
          id: 'r5',
          kolom: 'titikSudut',
          a: 2,
          b: 0,
          explanation: 'Prisma: n titik di alas + n titik di tutup.',
        },
        { id: 'r6', kolom: 'sisi', a: 1, b: 1, explanation: 'Limas: n sisi tegak + 1 alas.' },
      ],
    },
    langkah: [
      {
        id: 'lp1',
        label: 'Prisma segidelapan: berapa banyak titik sudutnya?',
        cek: { minta: 'unsur', jenis: 'prisma', n: 8, kolom: 'titikSudut' },
        placeholder: 'mis. 9',
        hints: ['Ada 8 titik di alas.', 'Tutupnya juga punya 8 titik: 2 × 8.'],
        temuan: 'Prisma segidelapan mempunyai 2 × 8 = 16 titik sudut.',
      },
      {
        id: 'lp2',
        label: 'Prisma segisepuluh: berapa banyak rusuknya?',
        cek: { minta: 'unsur', jenis: 'prisma', n: 10, kolom: 'rusuk' },
        placeholder: 'mis. 20',
        hints: ['Rusuk alas, rusuk tutup, dan rusuk tegak masing-masing 10.', '3 × 10.'],
        temuan: 'Prisma segisepuluh mempunyai 3 × 10 = 30 rusuk.',
      },
      {
        id: 'lp3',
        label: 'Limas segitujuh: berapa banyak sisinya?',
        cek: { minta: 'unsur', jenis: 'limas', n: 7, kolom: 'sisi' },
        placeholder: 'mis. 9',
        hints: ['Ada 7 sisi tegak berbentuk segitiga.', 'Jangan lupa alasnya: 7 + 1.'],
        temuan: 'Limas segitujuh mempunyai 7 + 1 = 8 sisi.',
      },
      {
        id: 'lp4',
        label: 'Sebuah prisma mempunyai 21 rusuk. Alasnya segi berapa? (tulis nilai n)',
        cek: { minta: 'n', jenis: 'prisma', kolom: 'rusuk', nilai: 21 },
        placeholder: 'mis. 5',
        hints: ['Rusuk prisma = 3 × n.', 'Bilangan berapa dikali 3 hasilnya 21?'],
        temuan: '3 × n = 21, jadi n = 7: prisma segitujuh.',
      },
    ],
    ringkasan:
      'Prisma segi-n: 2n titik sudut, 3n rusuk, n + 2 sisi. Limas segi-n: n + 1 titik sudut, 2n rusuk, n + 1 sisi. Polanya dapat dijelaskan dengan menunjuk unsur pada model.',
    nextLabel: 'Lanjut: Verifikasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — VERIFICATION
     Benda baru diambil acak dari `bank` saat state disiapkan.
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Verifikasi',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji temuan pada benda baru dengan memprediksi lalu membuktikan, memilah pernyataan, dan membandingkannya dengan dugaan awal.',
    guru: 'Pada bagian A, minta murid menulis prediksi di kertas lebih dulu sebelum mengetik. Pada bagian B, minta contoh pendukung atau contoh penyangkal untuk setiap pernyataan.',
    judulA: 'A. Prediksi lalu buktikan',
    pengantarA:
      'Komputer memilih sebuah benda BARU secara acak. Prediksi banyak unsurnya memakai temuanmu, lalu buktikan dengan mengamati modelnya.',
    bank: [
      { id: 'kado', nama: 'Kotak kado segilima', ikon: '🎁', jenis: 'prisma', n: 5 },
      { id: 'pensil8', nama: 'Pensil warna segidelapan', ikon: '🖍️', jenis: 'prisma', n: 8 },
      { id: 'lampion', nama: 'Lampion limas segienam', ikon: '🏮', jenis: 'limas', n: 6 },
      { id: 'kristal', nama: 'Hiasan kristal limas segilima', ikon: '💎', jenis: 'limas', n: 5 },
      { id: 'bedug', nama: 'Bedug', ikon: '🥁', jenis: 'tabung' },
      { id: 'kerucutJalan', nama: 'Kerucut lalu lintas', ikon: '🚧', jenis: 'kerucut' },
    ],
    buktiLabel: '🔍 Buktikan: amati model & bongkar bendanya',
    buktiTeks:
      'Hasil pengamatan sama dengan prediksimu. Temuanmu berlaku juga pada benda yang belum pernah kamu amati.',
    judulB: 'B. Selalu benar, kadang-kadang benar, atau salah?',
    opsiPernyataan: [
      { id: 'selalu', label: 'Selalu benar' },
      { id: 'kadang', label: 'Kadang-kadang benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'vp1',
        teks: 'Setiap prisma mempunyai dua alas yang kongruen dan sejajar.',
        correct: 'selalu',
        explanation: 'Alas dan tutup prisma selalu segi-n yang sama bentuk dan ukurannya.',
      },
      {
        id: 'vp2',
        teks: 'Banyak sisi limas sama dengan banyak titik sudutnya.',
        correct: 'selalu',
        explanation: 'Limas segi-n mempunyai n + 1 sisi dan n + 1 titik sudut.',
      },
      {
        id: 'vp3',
        teks: 'Sisi tegak limas berbentuk persegi panjang.',
        correct: 'salah',
        explanation: 'Sisi tegak limas berbentuk segitiga yang bertemu di titik puncak.',
      },
      {
        id: 'vp4',
        teks: 'Bangun ruang yang mempunyai puncak juga mempunyai titik sudut.',
        correct: 'kadang',
        explanation:
          'Benar untuk limas (rusuk-rusuk tegaknya bertemu di puncak), tetapi kerucut tidak punya titik sudut.',
      },
      {
        id: 'vp5',
        teks: 'Tabung dan kerucut mempunyai rusuk.',
        correct: 'selalu',
        explanation: 'Rusuknya melengkung: tabung punya 2 rusuk, kerucut punya 1 rusuk.',
      },
      {
        id: 'vp6',
        teks: 'Alas prisma berbentuk segitiga.',
        correct: 'kadang',
        explanation:
          'Alas prisma boleh segi-n apa saja: segitiga, segiempat, segilima, dan seterusnya.',
      },
      {
        id: 'vp7',
        teks: 'Rusuk selalu berupa ruas garis lurus.',
        correct: 'salah',
        explanation: 'Rusuk tabung dan kerucut berupa lengkungan (lingkaran).',
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
    goal: 'Menyusun kesimpulan tentang unsur dan bidang penyusun prisma, tabung, limas, dan kerucut berdasarkan temuan.',
    guru: 'Minta setiap pasangan membacakan satu kesimpulan sambil menunjukkan benda sungguhan yang sesuai sebelum memeriksa.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari bank kalimat. Setiap potongan hanya dipakai satu kali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'gPrisma', awal: 'Prisma segi-n adalah bangun ruang yang', correct: 'b1' },
      { id: 'gTabung', awal: 'Tabung adalah bangun ruang yang', correct: 'b2' },
      { id: 'gLimas', awal: 'Limas segi-n adalah bangun ruang yang', correct: 'b3' },
      { id: 'gKerucut', awal: 'Kerucut adalah bangun ruang yang', correct: 'b4' },
      { id: 'gRusuk', awal: 'Rusuk adalah', correct: 'b5' },
    ],
    bank: [
      {
        id: 'b1',
        teks: 'dibatasi dua segi-n yang kongruen dan sejajar serta n persegi panjang sebagai sisi tegak.',
      },
      {
        id: 'b2',
        teks: 'dibatasi dua lingkaran yang kongruen dan sejajar serta satu sisi lengkung (selimut), tanpa titik sudut.',
      },
      {
        id: 'b3',
        teks: 'dibatasi satu segi-n sebagai alas dan n segitiga yang bertemu di titik puncak.',
      },
      {
        id: 'b4',
        teks: 'dibatasi satu lingkaran sebagai alas dan satu sisi lengkung yang meruncing ke titik puncak.',
      },
      { id: 'b5', teks: 'garis pertemuan dua sisi, boleh lurus atau melengkung.' },
      { id: 'b6', teks: 'dibatasi enam persegi yang sama besar.' },
      { id: 'b7', teks: 'garis tepi yang terlihat pada gambar benda.' },
      { id: 'b8', teks: 'dibatasi dua segitiga dan tiga lingkaran.' },
    ],
    rangkuman: [
      '<strong>Prisma segi-n:</strong> 2 segi-n + n persegi panjang; n + 2 sisi, 3n rusuk, 2n titik sudut.',
      '<strong>Limas segi-n:</strong> 1 segi-n + n segitiga; n + 1 sisi, 2n rusuk, n + 1 titik sudut (termasuk puncak).',
      '<strong>Tabung:</strong> 2 lingkaran + selimut (persegi panjang bila dibuka); 3 sisi, 2 rusuk lengkung, tanpa titik sudut.',
      '<strong>Kerucut:</strong> 1 lingkaran + selimut (juring lingkaran bila dibuka); 2 sisi, 1 rusuk lengkung, 1 titik puncak, tanpa titik sudut.',
      'Prisma–tabung beralas dua (kongruen & sejajar); limas–kerucut beralas satu dan meruncing ke puncak.',
    ],
    contoh: [
      { jenis: 'prisma', n: 5 },
      { jenis: 'tabung' },
      { jenis: 'limas', n: 5 },
      { jenis: 'kerucut' },
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Bank 16 soal; diambil acak sesuai komposisi. Soal ber-cek 'unsur'
     diberi gambar model oleh app.js.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    goal: 'Menerapkan pengetahuan tentang unsur dan bidang penyusun bangun ruang pada benda-benda di sekitar.',
    guru: 'Murid mengerjakan mandiri. Pesan salah berupa diagnosa miskonsepsi (mis. lupa menghitung tutup, menganggap garis tepi gambar sebagai rusuk); minta murid membacanya sebelum mencoba lagi.',
    instruksi:
      'Jawab setiap soal. Tulis banyaknya dengan angka saja. Jika keliru, baca pesannya lalu coba lagi.',
    banyak: 8,
    komposisi: { input: 4, choice: 4 },
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: 'dapur',
        cerita: 'Bu Rina membeli cokelat batangan yang kemasannya berbentuk prisma segitiga.',
        pertanyaan: 'Berapa banyak rusuk kemasan cokelat itu?',
        cek: { minta: 'unsur', jenis: 'prisma', n: 3, kolom: 'rusuk' },
        hints: ['Hitung rusuk alas, rusuk tutup, dan rusuk tegak.', '3 + 3 + 3.'],
        explanation: 'Prisma segitiga mempunyai 3 × 3 = 9 rusuk.',
      },
      {
        id: 't2',
        type: 'input',
        konteks: 'sekolah',
        cerita: 'Kotak pensil Dimas berbentuk balok, yaitu prisma segiempat.',
        pertanyaan: 'Berapa banyak titik sudut kotak pensil itu?',
        cek: { minta: 'unsur', jenis: 'prisma', n: 4, kolom: 'titikSudut' },
        hints: ['Ada 4 titik di bagian bawah.', 'Tutupnya juga punya 4 titik.'],
        explanation: 'Prisma segiempat mempunyai 2 × 4 = 8 titik sudut.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: 'dapur',
        cerita: 'Kaleng biskuit Lebaran berbentuk tabung tertutup.',
        pertanyaan: 'Berapa banyak rusuk kaleng biskuit itu?',
        cek: { minta: 'unsur', jenis: 'tabung', kolom: 'rusuk' },
        hints: ['Rusuk adalah tempat dua sisi bertemu.', 'Selimut bertemu alas dan bertemu tutup.'],
        explanation: 'Tabung mempunyai 2 rusuk lengkung: di alas dan di tutup.',
      },
      {
        id: 't4',
        type: 'input',
        konteks: 'permainan',
        cerita: 'Andi membuat kerucut dari karton untuk hiasan, lengkap dengan alasnya.',
        pertanyaan: 'Berapa banyak titik sudut kerucut itu?',
        cek: { minta: 'unsur', jenis: 'kerucut', kolom: 'titikSudut' },
        hints: [
          'Titik sudut = tempat tiga rusuk atau lebih bertemu.',
          'Ujung kerucut disebut titik puncak.',
        ],
        explanation: 'Kerucut tidak mempunyai titik sudut (0); ujungnya adalah titik puncak.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: 'bangunan',
        cerita: 'Hiasan atap menara masjid berbentuk limas segienam yang utuh dengan alasnya.',
        pertanyaan: 'Berapa banyak sisi limas itu?',
        cek: { minta: 'unsur', jenis: 'limas', n: 6, kolom: 'sisi' },
        hints: ['Ada 6 sisi tegak berbentuk segitiga.', 'Tambahkan alasnya.'],
        explanation: 'Limas segienam mempunyai 6 + 1 = 7 sisi.',
      },
      {
        id: 't6',
        type: 'input',
        konteks: 'pola',
        cerita: 'Sebuah prisma mempunyai 30 rusuk.',
        pertanyaan: 'Alas prisma itu segi berapa? Tulis nilai n.',
        cek: { minta: 'n', jenis: 'prisma', kolom: 'rusuk', nilai: 30 },
        hints: ['Rusuk prisma = 3 × n.', '3 × n = 30.'],
        explanation: '3 × n = 30, jadi n = 10: prisma segisepuluh.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: 'pola',
        cerita: 'Sebuah limas mempunyai 9 titik sudut.',
        pertanyaan: 'Alas limas itu segi berapa? Tulis nilai n.',
        cek: { minta: 'n', jenis: 'limas', kolom: 'titikSudut', nilai: 9 },
        hints: ['Titik sudut limas = n + 1 (termasuk puncak).', 'n + 1 = 9.'],
        explanation: 'n + 1 = 9, jadi n = 8: limas segidelapan.',
      },
      {
        id: 't8',
        type: 'input',
        konteks: 'sekolah',
        cerita: 'Pak Guru membuat model prisma segienam dari karton.',
        pertanyaan: 'Berapa lembar karton berbentuk persegi panjang yang dibutuhkan?',
        cek: { minta: 'banyakBidang', jenis: 'prisma', n: 6, bentuk: 'persegi panjang' },
        hints: ['Persegi panjang menjadi sisi tegak.', 'Banyak sisi tegak = banyak sisi alas.'],
        explanation: 'Prisma segienam mempunyai 6 sisi tegak berbentuk persegi panjang.',
      },
      {
        id: 'c1',
        type: 'choice',
        konteks: 'dapur',
        cerita:
          'Sebuah wadah kue mempunyai dua sisi datar berbentuk lingkaran yang sama besar dan sejajar, serta satu sisi lengkung.',
        pertanyaan: 'Bangun ruang apakah wadah itu?',
        cek: { minta: 'bangun', jenis: 'tabung' },
        explanation:
          'Dua lingkaran kongruen yang sejajar dan satu selimut lengkung adalah ciri tabung.',
      },
      {
        id: 'c2',
        type: 'choice',
        konteks: 'bangunan',
        cerita:
          'Sebuah hiasan meja mempunyai alas segiempat dan empat sisi tegak berbentuk segitiga yang bertemu di satu titik.',
        pertanyaan: 'Bangun ruang apakah hiasan itu?',
        cek: { minta: 'bangun', jenis: 'limas', n: 4 },
        explanation:
          'Satu alas segiempat dan empat segitiga yang bertemu di puncak: limas segiempat.',
      },
      {
        id: 'c3',
        type: 'choice',
        konteks: 'sekolah',
        cerita: 'Rani akan membuat model limas segilima dari kertas karton.',
        pertanyaan: 'Bidang-bidang apa saja yang harus ia gunting?',
        cek: { minta: 'bidang', jenis: 'limas', n: 5 },
        explanation: 'Limas segilima disusun oleh 1 segilima (alas) dan 5 segitiga (sisi tegak).',
      },
      {
        id: 'c4',
        type: 'choice',
        konteks: 'dapur',
        cerita: 'Nasi tumpeng dicetak dalam cetakan kerucut yang tertutup alasnya.',
        pertanyaan: 'Bidang penyusun kerucut adalah …',
        cek: { minta: 'bidang', jenis: 'kerucut' },
        explanation:
          'Kerucut disusun oleh 1 lingkaran (alas) dan selimut yang bila dibuka berbentuk juring lingkaran.',
      },
      {
        id: 'c5',
        type: 'choice',
        konteks: 'permainan',
        cerita: 'Sebuah kotak hadiah berbentuk prisma segilima.',
        pertanyaan: 'Berapa banyak sisi kotak hadiah itu?',
        cek: { minta: 'unsur', jenis: 'prisma', n: 5, kolom: 'sisi' },
        explanation: 'Prisma segilima mempunyai 5 sisi tegak + alas + tutup = 7 sisi.',
      },
      {
        id: 'c6',
        type: 'choice',
        konteks: 'bangunan',
        cerita: 'Petugas memasang kerucut lalu lintas di tepi jalan.',
        pertanyaan: 'Berapa banyak rusuk kerucut lalu lintas itu (dengan alasnya)?',
        cek: { minta: 'unsur', jenis: 'kerucut', kolom: 'rusuk' },
        explanation: 'Kerucut mempunyai 1 rusuk lengkung, tempat selimut bertemu alas.',
      },
      {
        id: 'c7',
        type: 'choice',
        konteks: 'bangunan',
        cerita: 'Pipa paralon yang kedua ujungnya ditutup berbentuk tabung.',
        pertanyaan: 'Berapa banyak sisi lengkung pipa itu?',
        cek: { minta: 'unsur', jenis: 'tabung', kolom: 'sisiLengkung' },
        explanation: 'Tabung mempunyai 1 sisi lengkung, yaitu selimutnya yang utuh melingkar.',
      },
      {
        id: 'c8',
        type: 'choice',
        konteks: 'pola',
        cerita:
          'Sebuah bangun ruang mempunyai 1 sisi datar berbentuk lingkaran, 1 sisi lengkung, dan 1 titik puncak.',
        pertanyaan: 'Bangun ruang apakah itu?',
        cek: { minta: 'bangun', jenis: 'kerucut' },
        explanation:
          'Satu alas lingkaran dan selimut yang meruncing ke titik puncak adalah ciri kerucut.',
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
    guru: 'Ajak beberapa murid membacakan jawaban pertanyaan kedua. Catat miskonsepsi yang masih muncul (mis. garis tepi gambar dianggap rusuk, puncak kerucut dianggap titik sudut) untuk pertemuan berikutnya tentang jaring-jaring.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Sebutkan tiga benda di rumah atau sekolahmu yang berbentuk prisma, tabung, limas, atau kerucut. Tulis unsur dan bidang penyusun salah satunya.',
        placeholder: 'Di rumahku ada …, bentuknya …, sisinya …',
      },
      {
        id: 'r2',
        teks: 'Apa perbedaan titik sudut dan titik puncak? Mengapa puncak limas termasuk titik sudut, tetapi puncak kerucut tidak?',
        placeholder: 'Titik sudut adalah …, sedangkan …',
      },
      {
        id: 'r3',
        teks: 'Kesalahan apa yang pernah kamu alami saat menghitung unsur hari ini, dan bagaimana kamu memperbaikinya?',
        placeholder: 'Aku sempat … lalu aku …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menentukan unsur dan bidang penyusun bangun ruang sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — aku bisa menjelaskannya kepada teman' },
      { id: 'yakin', label: '👍 Yakin — sesekali masih perlu memutar model' },
      { id: 'ragu', label: '🤔 Masih sering lupa menghitung alas atau rusuk lengkung' },
      { id: 'bantuan', label: '🙋 Perlu bantuan guru lagi' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat! Kamu sudah mengenali unsur dan bidang penyusun bangun ruang.',
    teks: 'Dengan mengamati benda di sekitarmu, kamu menemukan sisi datar dan lengkung, rusuk lurus dan lengkung, titik sudut dan titik puncak, serta bidang-bidang penyusun prisma, tabung, limas, dan kerucut.',
    contoh: [
      { jenis: 'prisma', n: 3, benda: '⛺ Tenda' },
      { jenis: 'tabung', benda: '🥫 Kaleng' },
      { jenis: 'limas', n: 4, benda: '🔺 Piramida' },
      { jenis: 'kerucut', benda: '🍚 Tumpeng' },
    ],
    capaian: [
      'Menunjukkan sisi, rusuk, titik sudut, dan titik puncak pada benda dan modelnya.',
      'Menentukan banyak unsur prisma, tabung, limas, dan kerucut.',
      'Menyebutkan bidang penyusun keempat bangun ruang.',
      'Membedakan keluarga dua alas (prisma–tabung) dan satu alas + puncak (limas–kerucut).',
      'Menemukan pola banyak unsur prisma dan limas segi-n.',
    ],
  },
};
