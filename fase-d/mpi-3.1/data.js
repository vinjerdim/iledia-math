'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Rasio & Rasio Ekuivalen dalam Situasi Sehari-hari
   — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menjelaskan konsep rasio dan rasio ekuivalen sebagai perbandingan
   dua besaran melalui pengamatan situasi sehari-hari.

   Model pembelajaran: INQUIRY LEARNING (Inkuiri Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Orientasi .................. 'orientasi'
     Sintaks 2 — Merumuskan masalah ......... 'masalah'
     Sintaks 3 — Merumuskan hipotesis ....... 'hipotesis'
     Sintaks 4 — Mengumpulkan data .......... 'dataRasio', 'dataSetara' & 'dataPilah'
     Sintaks 5 — Menguji hipotesis .......... 'uji'
     Sintaks 6 — Merumuskan kesimpulan ...... 'simpulan'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Orientasi   (8')  — "Kedai Es Sirup Kelas VII": tiga gelas es
                            sirup racikan teman (2 : 3, 4 : 6, 3 : 4).
                            Murid MENDUGA gelas mana yang sama manis, apa
                            akibat menambah takaran yang sama, dan apakah
                            2 : 3 sama dengan 3 : 2 (tidak dinilai).
     2. Masalah     (5')  — memilih rumusan masalah penyelidikan.
     3. Hipotesis   (7')  — memilih dugaan tentang cara menjaga rasa,
                            urutan suku, dan rasio bagian terhadap
                            keseluruhan, lalu menulis hipotesis sendiri.
     4a. Data 1     (10') — Lab Amati Rasio: enam situasi bergambar ikon
                            (piket kelas, resep, buah, cat, skor); murid
                            menulis rasio a : b — isian berdiagnosa
                            (urutan tertukar, bagian vs keseluruhan,
                            tambah sama), lalu menjawab pertanyaan temuan.
     4b. Data 2     (14') — Lab Racik: mengubah takaran sirup–air dengan
                            × 2, × 3, : 2, + 1, + 2 dan mengamati warna
                            gelas & vonis rasa; tabel catatan terisi
                            otomatis; diagram pita 6 : 9 → 2 : 3; langkah
                            isian suku hilang & menyederhanakan dengan FPB.
     4c. Data 3     (8')  — Lab Cek Ekuivalen: memilah tujuh pasangan rasio
                            sehari-hari; setelah memilih, muncul bukti
                            bentuk sederhana & perkalian silang.
     5. Uji         (8')  — pernyataan benar/salah, lalu dugaan &
                            hipotesis dibandingkan dengan data.
     6. Simpulan    (5')  — menyusun kesimpulan dari bank kalimat.
     7. Uji terap   (10') — enam soal diambil acak dari bank dua belas
                            soal (isian berdiagnosa & pilihan ganda).
     8. Refleksi    (5')  — rekap, refleksi tertulis, penilaian diri.

   Notasi baku: rasio ditulis "a : b" (dibaca "a banding b") dengan
   spasi di kedua sisi titik dua; bilangan besar memakai titik ribuan
   (15.000). Kunci jawaban rasio disimpan sebagai bilangan (cek.a, cek.b)
   agar dapat dihitung engine.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Soal uji terap juga
   diambil acak dari bank.

   Konsistensi kunci jawaban diuji tests/mpi-3.1-data.test.js terhadap
   engine seksi 67 (kunciRasioSituasi, rasioSetara, sederhanakanRasio,
   bandingRasaRasio, nilaiRasioHilang, periksaSoalRasio).
   ============================================================ */

var IL = 'Inquiry Learning';

var DATA = {
  meta: {
    judul: 'Rasio & Rasio Ekuivalen dalam Situasi Sehari-hari',
  },

  tahap: [
    { id: 'orientasi', label: 'Orientasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'hipotesis', label: 'Hipotesis' },
    { id: 'dataRasio', label: 'Lab Amati' },
    { id: 'dataSetara', label: 'Lab Racik' },
    { id: 'dataPilah', label: 'Lab Cek' },
    { id: 'uji', label: 'Uji Hipotesis' },
    { id: 'simpulan', label: 'Simpulan' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Konteks yang dipakai di seluruh modul. */
  konteks: {
    minuman: { ikon: '🍹', nama: 'Minuman' },
    kelas: { ikon: '🏫', nama: 'Kelas' },
    dapur: { ikon: '🥞', nama: 'Dapur' },
    kebun: { ikon: '🌱', nama: 'Kebun' },
    kerajinan: { ikon: '🎨', nama: 'Kerajinan' },
    olahraga: { ikon: '⚽', nama: 'Olahraga' },
    belanja: { ikon: '🛒', nama: 'Belanja' },
  },

  /* Satuan & nama bahan untuk gelas es sirup. */
  bahan: { namaA: 'sirup', namaB: 'air', satuan: 'takar' },

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI
     Tiga gelas es sirup. Dugaan TIDAK dinilai; diuji sendiri pada
     tahap Uji Hipotesis. `baku` = jawaban menurut engine (lihat cek).
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    syntax: IL + ' · Sintaks 1',
    goal: 'Mengamati tiga gelas es sirup racikan teman, lalu menduga mana yang rasanya sama tanpa mencicipinya.',
    tp: 'Menjelaskan konsep rasio dan rasio ekuivalen sebagai perbandingan dua besaran melalui pengamatan situasi sehari-hari.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menuliskan rasio dua besaran dari situasi sehari-hari dalam bentuk a : b dengan urutan yang benar.',
      'Membedakan rasio bagian terhadap bagian dengan rasio bagian terhadap keseluruhan.',
      'Menjelaskan bahwa rasio ekuivalen diperoleh dengan mengalikan atau membagi kedua suku dengan bilangan yang sama.',
      'Menyederhanakan rasio dengan FPB dan memeriksa apakah dua rasio ekuivalen.',
      'Menentukan suku yang belum diketahui pada rasio ekuivalen dalam masalah sehari-hari.',
    ],
    guru: 'Tampilkan ketiga gelas. Minta pasangan murid memutuskan dalam 1–2 menit tanpa menghitung rumit. Jangan membenarkan atau menyalahkan — perbedaan pendapat ("B kan lebih banyak sirupnya, pasti lebih manis!") menjadi bahan penyelidikan. Bila memungkinkan, siapkan sirup, air, dan sendok takar untuk demonstrasi nyata.',
    judul: 'Kedai Es Sirup Kelas VII',
    pengantar:
      'Pada hari pasar sekolah, Kelas VII membuka Kedai Es Sirup. Tiga anggota kelompok meracik es sirup dengan takaran berbeda. Pembeli ingin semua gelas rasanya sama. Apakah racikan mereka sudah sama manisnya?',
    gelas: [
      { id: 'gA', nama: 'Gelas A', siapa: 'Raka', a: 2, b: 3 },
      { id: 'gB', nama: 'Gelas B', siapa: 'Sinta', a: 4, b: 6 },
      { id: 'gC', nama: 'Gelas C', siapa: 'Dimas', a: 3, b: 4 },
    ],
    dugaan: [
      {
        id: 'dSama',
        tanya: 'Gelas mana yang rasanya sama manis dengan Gelas A?',
        opsi: [
          { id: 'gB', label: 'Gelas B (4 takar sirup : 6 takar air)' },
          { id: 'gC', label: 'Gelas C (3 takar sirup : 4 takar air)' },
          { id: 'keduanya', label: 'Gelas B dan Gelas C' },
          { id: 'tidakAda', label: 'Tidak ada yang sama' },
        ],
        baku: 'gB',
        cek: { jenis: 'setaraGelas', acuan: 'gA' },
        pembahasan:
          '4 : 6 diperoleh dari 2 : 3 dengan mengalikan kedua takaran dengan 2, jadi Gelas B sama manis. Gelas C (3 : 4) diperoleh dengan menambah 1 pada kedua takaran, jadi rasanya berbeda.',
      },
      {
        id: 'dTambah',
        tanya:
          'Dimas membuat Gelas C dengan menambahkan 1 takar sirup dan 1 takar air ke resep Gelas A. Dibanding Gelas A, rasa Gelas C …',
        opsi: [
          { id: 'sama', label: 'sama manis' },
          { id: 'lebihPekat', label: 'lebih manis' },
          { id: 'lebihEncer', label: 'lebih tawar' },
        ],
        baku: 'lebihPekat',
        cek: { jenis: 'rasa', a: 2, b: 3, c: 3, d: 4 },
        pembahasan:
          'Sirup Gelas A adalah 2 dari 5 bagian, sedangkan Gelas C 3 dari 7 bagian. Perkalian silang 2 × 4 = 8 kurang dari 3 × 3 = 9, jadi Gelas C sedikit lebih manis — menambah sama banyak mengubah rasa.',
      },
      {
        id: 'dUrutan',
        tanya:
          'Raka menulis rasio sirup terhadap air Gelas A sebagai 2 : 3, sedangkan Sinta menulis 3 : 2. Apakah keduanya sama?',
        opsi: [
          { id: 'sama', label: 'Sama saja, bilangannya sama' },
          { id: 'beda', label: 'Berbeda, urutan menunjukkan besaran mana yang dibandingkan' },
          { id: 'total', label: 'Sama, asalkan jumlahnya sama-sama 5' },
        ],
        baku: 'beda',
        cek: { jenis: 'urutan', a: 2, b: 3 },
        pembahasan:
          '2 : 3 berarti 2 takar sirup untuk setiap 3 takar air. 3 : 2 berarti 3 takar sirup untuk setiap 2 takar air — minuman yang jauh lebih manis. Urutan suku harus mengikuti urutan besaran yang disebut.',
      },
    ],
    alasanLabel: 'Tuliskan alasan dugaanmu (boleh singkat):',
    alasanPlaceholder: 'Menurutku Gelas … sama manis dengan Gelas A karena …',
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
    goal: 'Memilih pertanyaan penyelidikan yang tepat dari situasi Kedai Es Sirup.',
    guru: 'Ajak murid membedakan pertanyaan yang dapat diselidiki dengan data (perbandingan takaran) dan pertanyaan yang di luar fokus (harga, ukuran gelas). Biarkan mereka mencoba lagi bila memilih yang kurang tepat.',
    pengantar:
      'Kalian berbeda pendapat tentang gelas mana yang sama manis. Sebelum menyelidiki, rumuskan dulu pertanyaan yang ingin dijawab.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'rasio',
        label:
          'Bagaimana membandingkan dua besaran dengan rasio, dan kapan dua rasio dikatakan ekuivalen (sama nilainya)?',
      },
      { id: 'harga', label: 'Berapa harga jual satu gelas es sirup agar kedai untung?' },
      { id: 'ukuran', label: 'Gelas mana yang ukurannya paling besar?' },
      { id: 'total', label: 'Berapa jumlah seluruh takaran sirup dan air yang dipakai hari ini?' },
    ],
    correct: 'rasio',
    umpan: {
      rasio:
        'Tepat! Pertanyaan ini dapat dijawab dengan mengamati dan membandingkan takaran — itulah yang akan kita selidiki.',
      harga:
        'Harga memang penting untuk kedai, tetapi tidak menjawab mengapa rasa ketiga gelas berbeda. Cari pertanyaan tentang perbandingan takaran.',
      ukuran:
        'Ketiga gelas berukuran sama. Rasa bergantung pada perbandingan sirup dan air, bukan ukuran gelas.',
      total:
        'Menjumlahkan semua takaran tidak memberi tahu apakah rasanya sama. Yang menentukan rasa adalah perbandingan sirup terhadap air.',
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
    goal: 'Menyusun dugaan sementara tentang rasio dan cara menjaga rasa minuman tetap sama.',
    guru: 'Tekankan bahwa hipotesis adalah dugaan yang akan diuji, jadi tidak ada pilihan yang "dihukum". Minta setiap pasangan menulis satu kalimat hipotesis dengan bahasa sendiri.',
    pengantar:
      'Jawab dugaan berikut sesuai pendapatmu sekarang, lalu tulis hipotesismu dalam satu atau dua kalimat.',
    dugaan: [
      {
        id: 'hOperasi',
        tanya:
          'Agar rasa es sirup tetap sama ketika dibuat lebih banyak, takaran sirup dan air harus …',
        opsi: [
          { id: 'kali', label: 'dikali (atau dibagi) dengan bilangan yang sama' },
          { id: 'tambah', label: 'ditambah dengan bilangan yang sama' },
          { id: 'sirupSaja', label: 'sirupnya saja yang ditambah' },
        ],
        baku: 'kali',
        cek: { jenis: 'operasi', a: 2, b: 3 },
        pembahasan:
          'Di Lab Racik, × 2 dan × 3 menjaga warna tetap sama (2 : 3 = 4 : 6 = 6 : 9), sedangkan + 1 mengubah warna (2 : 3 menjadi 3 : 4).',
      },
      {
        id: 'hUrutan',
        tanya: 'Rasio 2 : 3 dan rasio 3 : 2 …',
        opsi: [
          { id: 'sama', label: 'menyatakan hal yang sama' },
          { id: 'beda', label: 'menyatakan hal berbeda karena urutan sukunya berbeda' },
          { id: 'total', label: 'sama karena jumlah sukunya sama-sama 5' },
        ],
        baku: 'beda',
        cek: { jenis: 'urutan' },
        pembahasan:
          'Di Lab Amati, menulis 3 : 2 untuk "susu terhadap tepung" (2 gelas susu, 3 gelas tepung) dinilai tertukar. Suku pertama selalu besaran yang disebut lebih dulu.',
      },
      {
        id: 'hKeseluruhan',
        tanya:
          'Gelas A berisi 2 takar sirup dan 3 takar air. Rasio sirup terhadap SELURUH isi gelas adalah …',
        opsi: [
          { id: 'r23', label: '2 : 3' },
          { id: 'r25', label: '2 : 5' },
          { id: 'r35', label: '3 : 5' },
        ],
        baku: 'r25',
        cek: { jenis: 'situasi', a: 2, b: 3, P: 'a', Q: 'total' },
        pembahasan:
          'Seluruh isi gelas adalah 2 + 3 = 5 takar, jadi sirup terhadap seluruh isi adalah 2 : 5. Rasio 2 : 3 membandingkan bagian dengan bagian (sirup terhadap air).',
      },
    ],
    hipotesisLabel: 'Tulis hipotesismu:',
    hipotesisPlaceholder:
      'Menurutku, dua rasio akan bernilai sama (ekuivalen) jika …, sedangkan rasa akan berubah jika …',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — LAB AMATI RASIO
     Situasi bergambar ikon. cek.a/cek.b = banyak kelompok 1/2;
     P/Q ∈ 'a' | 'b' | 'total' → "rasio P terhadap Q".
     ---------------------------------------------------------- */
  dataRasio: {
    kicker: 'Tahap 4a · Lab Amati Rasio',
    syntax: IL + ' · Sintaks 4',
    goal: 'Mengamati benda di sekitar sekolah dan menuliskan rasio dua besaran dengan urutan yang benar.',
    guru: 'Biarkan murid menghitung ikon sendiri. Saat muncul diagnosa "tertukar" atau "keseluruhan", minta pasangan membaca ulang kalimat soal dengan menunjuk besaran yang disebut lebih dulu. Rasio ekuivalen (mis. 2 : 3 untuk 4 : 6) diterima di tahap ini.',
    pengantar:
      'Rasio membandingkan dua besaran, ditulis a : b dan dibaca "a banding b". Hitung benda pada setiap gambar, lalu tulis rasionya, mis. 4 : 6.',
    situasi: [
      {
        id: 'sPiket',
        konteks: 'kelas',
        cerita: 'Kelompok piket hari Senin terdiri atas murid laki-laki dan murid perempuan.',
        kelompok: [
          { ikon: '🧑', n: 4, nama: 'murid laki-laki' },
          { ikon: '👧', n: 6, nama: 'murid perempuan' },
        ],
        tanya: 'Tulis rasio banyak murid laki-laki terhadap banyak murid perempuan.',
        cek: { jenis: 'situasi', a: 4, b: 6, P: 'a', Q: 'b' },
        hints: [
          'Besaran yang disebut lebih dulu adalah murid laki-laki, jadi banyaknya menjadi suku pertama.',
          'Ada 4 murid laki-laki dan 6 murid perempuan. Tulis 4 : 6.',
        ],
      },
      {
        id: 'sPiketTotal',
        konteks: 'kelas',
        cerita: 'Masih kelompok piket yang sama.',
        kelompok: [
          { ikon: '🧑', n: 4, nama: 'murid laki-laki' },
          { ikon: '👧', n: 6, nama: 'murid perempuan' },
        ],
        tanya: 'Tulis rasio banyak murid perempuan terhadap SELURUH anggota kelompok.',
        cek: { jenis: 'situasi', a: 4, b: 6, P: 'b', Q: 'total' },
        hints: [
          'Seluruh anggota kelompok = murid laki-laki + murid perempuan.',
          'Seluruh anggota ada 4 + 6 = 10 orang. Rasio murid perempuan terhadap seluruh anggota adalah 6 : 10.',
        ],
      },
      {
        id: 'sPancake',
        konteks: 'dapur',
        cerita: 'Resep pancake Bu Kantin memakai gelas tepung dan gelas susu.',
        kelompok: [
          { ikon: '🥣', n: 3, nama: 'gelas tepung' },
          { ikon: '🥛', n: 2, nama: 'gelas susu' },
        ],
        tanya: 'Tulis rasio susu terhadap tepung.',
        cek: { jenis: 'situasi', a: 3, b: 2, P: 'b', Q: 'a' },
        hints: [
          'Perhatikan urutannya: yang disebut lebih dulu adalah susu, bukan tepung.',
          'Ada 2 gelas susu dan 3 gelas tepung, jadi rasio susu terhadap tepung adalah 2 : 3.',
        ],
      },
      {
        id: 'sBuah',
        konteks: 'kebun',
        cerita: 'Di keranjang hasil panen kebun sekolah ada jeruk dan apel.',
        kelompok: [
          { ikon: '🍊', n: 5, nama: 'jeruk' },
          { ikon: '🍎', n: 3, nama: 'apel' },
        ],
        tanya: 'Tulis rasio banyak jeruk terhadap seluruh buah di keranjang.',
        cek: { jenis: 'situasi', a: 5, b: 3, P: 'a', Q: 'total' },
        hints: [
          'Hitung dulu seluruh buah: jeruk ditambah apel.',
          'Seluruh buah ada 5 + 3 = 8. Rasio jeruk terhadap seluruh buah adalah 5 : 8.',
        ],
      },
      {
        id: 'sCat',
        konteks: 'kerajinan',
        cerita:
          'Untuk mengecat papan mading menjadi merah muda, dicampur kaleng cat merah dan kaleng cat putih.',
        kelompok: [
          { ikon: '🟥', n: 1, nama: 'kaleng cat merah' },
          { ikon: '⬜', n: 3, nama: 'kaleng cat putih' },
        ],
        tanya: 'Tulis rasio cat putih terhadap cat merah.',
        cek: { jenis: 'situasi', a: 1, b: 3, P: 'b', Q: 'a' },
        hints: [
          'Suku pertama adalah cat putih karena disebut lebih dulu.',
          'Ada 3 kaleng cat putih dan 1 kaleng cat merah, jadi rasionya 3 : 1.',
        ],
      },
      {
        id: 'sBasket',
        konteks: 'olahraga',
        cerita: 'Tim basket kelas mencatat hasil pertandingan semester ini.',
        kelompok: [
          { ikon: '🏆', n: 8, nama: 'kali menang' },
          { ikon: '❌', n: 4, nama: 'kali kalah' },
        ],
        tanya: 'Tulis rasio banyak kemenangan terhadap banyak kekalahan.',
        cek: { jenis: 'situasi', a: 8, b: 4, P: 'a', Q: 'b' },
        hints: [
          'Suku pertama adalah banyak kemenangan.',
          'Tim menang 8 kali dan kalah 4 kali, jadi rasionya 8 : 4 (atau 2 : 1).',
        ],
      },
    ],
    temuan: [
      {
        id: 'tArti',
        tanya: 'Apa arti rasio 4 : 6 pada kelompok piket?',
        opsi: [
          {
            id: 'banding',
            label: 'Banyak murid laki-laki dibandingkan dengan banyak murid perempuan, 4 banding 6',
          },
          { id: 'selisih', label: 'Murid perempuan 2 orang lebih banyak daripada murid laki-laki' },
          { id: 'jumlah', label: 'Kelompok piket berisi 4 + 6 = 10 murid' },
        ],
        correct: 'banding',
        umpan: {
          banding:
            'Tepat! Rasio membandingkan dua besaran: untuk setiap 4 murid laki-laki ada 6 murid perempuan.',
          selisih:
            'Itu selisih (6 − 4 = 2), bukan rasio. Rasio membandingkan besar keduanya dengan "banding", bukan dengan pengurangan.',
          jumlah:
            'Itu banyak anggota seluruhnya. Rasio 4 : 6 tidak menjumlahkan, tetapi membandingkan laki-laki dengan perempuan.',
        },
      },
      {
        id: 'tUrutan',
        tanya: 'Mengapa rasio susu terhadap tepung adalah 2 : 3, bukan 3 : 2?',
        opsi: [
          {
            id: 'urutan',
            label: 'Suku pertama mengikuti besaran yang disebut lebih dulu, yaitu susu',
          },
          { id: 'kecil', label: 'Bilangan yang lebih kecil selalu ditulis di depan' },
          { id: 'bebas', label: 'Sebenarnya bebas, 2 : 3 dan 3 : 2 sama saja' },
        ],
        correct: 'urutan',
        umpan: {
          urutan:
            'Tepat! "Rasio susu terhadap tepung" → susu dulu (2), lalu tepung (3). Menukar urutan berarti membandingkan hal yang lain.',
          kecil:
            'Tidak selalu. Rasio cat putih terhadap cat merah adalah 3 : 1 — bilangan besar di depan karena cat putih disebut lebih dulu.',
          bebas:
            '2 : 3 berarti 2 susu untuk 3 tepung; 3 : 2 berarti 3 susu untuk 2 tepung. Adonannya jauh berbeda, jadi urutan penting.',
        },
      },
      {
        id: 'tKeseluruhan',
        tanya:
          'Bagaimana menuliskan rasio bagian terhadap keseluruhan, seperti jeruk terhadap seluruh buah?',
        opsi: [
          { id: 'total', label: 'Suku kedua adalah jumlah semua bagian (5 + 3 = 8), jadi 5 : 8' },
          { id: 'bagian', label: 'Bandingkan dengan bagian yang lain saja, jadi 5 : 3' },
          { id: 'selisih', label: 'Pakai selisihnya, jadi 5 : 2' },
        ],
        correct: 'total',
        umpan: {
          total:
            'Tepat! Rasio bagian terhadap keseluruhan memakai jumlah semua bagian sebagai suku kedua.',
          bagian:
            '5 : 3 adalah rasio jeruk terhadap apel (bagian terhadap bagian). Keseluruhan berarti semua buah: 5 + 3.',
          selisih:
            'Selisih tidak dipakai dalam rasio. Keseluruhan berarti semua buah dijumlahkan: 5 + 3 = 8.',
        },
      },
    ],
    nextLabel: 'Lanjut: Lab Racik →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — LAB RACIK (RASIO EKUIVALEN)
     Aksi lab dicek engine operasiRasio. Langkah isian berjawaban
     bulat (buildDlStep); jawab = nilaiRasioHilang / gcd.
     ---------------------------------------------------------- */
  dataSetara: {
    kicker: 'Tahap 4b · Lab Racik',
    syntax: IL + ' · Sintaks 4',
    goal: 'Bereksperimen mengubah takaran sirup dan air untuk menemukan kapan rasanya tetap sama.',
    guru: 'Beri waktu murid bereksperimen bebas sebelum mengisi langkah. Tanyakan: "Tombol mana yang membuat warnanya tetap? Mengapa + 1 mengubahnya padahal keduanya ditambah sama banyak?" Hubungkan warna gelas dengan kadar sirup (berapa bagian dari seluruh isi).',
    pengantar:
      'Mulai dari resep Gelas A: 2 takar sirup : 3 takar air. Tekan tombol untuk mengubah KEDUA takaran sekaligus, lalu amati warna gelas dan catatan percobaanmu.',
    lab: {
      a: 2,
      b: 3,
      namaA: 'sirup',
      namaB: 'air',
      satuan: 'takar',
      aksi: [
        { id: 'kali2', label: '× 2 keduanya' },
        { id: 'kali3', label: '× 3 keduanya' },
        { id: 'bagi2', label: ': 2 keduanya' },
        { id: 'tambah1', label: '+ 1 keduanya' },
        { id: 'tambah2', label: '+ 2 keduanya' },
      ],
      misi: [
        { id: 'kali', label: 'Kalikan kedua takaran dengan bilangan yang sama.' },
        { id: 'tambah', label: 'Tambahkan bilangan yang sama ke kedua takaran.' },
        {
          id: 'bagi',
          label: 'Bagi kedua takaran dengan bilangan yang sama (kalikan dulu agar bisa dibagi 2).',
        },
      ],
    },
    pita: {
      a: 6,
      b: 9,
      grup: 3,
      namaA: 'Sirup',
      namaB: 'Air',
      teks: 'Racikan 6 takar sirup : 9 takar air dapat dibagi menjadi 3 kelompok sama besar. Setiap kelompok berisi 2 takar sirup : 3 takar air, jadi 6 : 9 ekuivalen dengan 2 : 3. Bilangan 3 adalah FPB dari 6 dan 9.',
    },
    langkah: [
      {
        id: 'lAir',
        label:
          'Kedai memakai 6 takar sirup. Agar rasanya sama dengan 2 : 3, air yang diperlukan … takar. (2 : 3 = 6 : …)',
        jawab: 9,
        cek: { jenis: 'hilang', a: 2, b: 3, x: 6, posisi: 'kanan' },
        hints: [
          'Dari 2 takar menjadi 6 takar sirup, takarannya dikali berapa?',
          '2 × 3 = 6, jadi air juga dikali 3: 3 × 3 = …',
        ],
        temuan: '2 : 3 = 6 : 9 — kedua suku dikali 3, rasanya tetap sama.',
      },
      {
        id: 'lSirup',
        label: 'Tersedia 12 takar air. Sirup yang diperlukan … takar. (2 : 3 = … : 12)',
        jawab: 8,
        cek: { jenis: 'hilang', a: 2, b: 3, x: 12, posisi: 'kiri' },
        hints: [
          'Dari 3 takar menjadi 12 takar air, takarannya dikali berapa?',
          '3 × 4 = 12, jadi sirup juga dikali 4: 2 × 4 = …',
        ],
        temuan: '2 : 3 = 8 : 12 — kedua suku dikali 4.',
      },
      {
        id: 'lFpb',
        label:
          'Racikan Sinta yang lain berisi 12 takar sirup : 18 takar air. FPB dari 12 dan 18 adalah …',
        jawab: 6,
        cek: { jenis: 'fpb', a: 12, b: 18 },
        hints: [
          'Tulis faktor 12: 1, 2, 3, 4, 6, 12. Tulis faktor 18: 1, 2, 3, 6, 9, 18.',
          'Faktor sekutu yang paling besar adalah …',
        ],
        temuan: 'FPB 12 dan 18 adalah 6. Bilangan ini dipakai untuk menyederhanakan rasio.',
      },
      {
        id: 'lSederhana',
        label: 'Bagi kedua suku dengan FPB-nya: 12 : 18 = 2 : …',
        jawab: 3,
        cek: { jenis: 'hilang', a: 12, b: 18, x: 2, posisi: 'kanan' },
        hints: ['12 : 6 = 2. Suku kedua juga dibagi 6.', '18 : 6 = …'],
        temuan:
          '12 : 18 = 2 : 3. Bentuk paling sederhananya sama dengan Gelas A, jadi racikan Sinta sama manis!',
      },
      {
        id: 'lLima',
        label: 'Sederhanakan racikan pembeli: 15 takar sirup : 25 takar air = 3 : …',
        jawab: 5,
        cek: { jenis: 'hilang', a: 15, b: 25, x: 3, posisi: 'kanan' },
        hints: ['15 dibagi berapa menjadi 3?', '15 : 5 = 3, jadi 25 : 5 = …'],
        temuan: '15 : 25 = 3 : 5. Ini tidak ekuivalen dengan 2 : 3, karena 2 × 5 ≠ 3 × 3.',
      },
    ],
    temuan: [
      {
        id: 'tKali',
        tanya: 'Saat kedua takaran dikali 2 atau dikali 3, rasa (warna) minuman …',
        opsi: [
          { id: 'sama', label: 'tetap sama, karena rasionya ekuivalen' },
          { id: 'manis', label: 'makin manis, karena sirupnya bertambah' },
          { id: 'tawar', label: 'makin tawar, karena airnya bertambah' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Tepat! 2 : 3 = 4 : 6 = 6 : 9. Sirup dan air bertambah dengan kelipatan yang sama, jadi kadar sirupnya tetap.',
          manis:
            'Sirup memang bertambah, tetapi air juga bertambah dengan kelipatan yang sama. Lihat lagi warna kedua gelas di lab.',
          tawar:
            'Air memang bertambah, tetapi sirup juga bertambah dengan kelipatan yang sama. Lihat lagi warna kedua gelas di lab.',
        },
      },
      {
        id: 'tTambah',
        tanya: 'Saat kedua takaran ditambah 1, rasa minuman …',
        opsi: [
          { id: 'berubah', label: 'berubah, karena rasio barunya tidak ekuivalen' },
          { id: 'sama', label: 'tetap sama, karena keduanya ditambah sama banyak' },
          { id: 'selaluTawar', label: 'pasti lebih tawar, karena air selalu lebih banyak' },
        ],
        correct: 'berubah',
        umpan: {
          berubah:
            'Tepat! 2 : 3 menjadi 3 : 4, dan 2 × 4 ≠ 3 × 3. Menambah bilangan yang sama mengubah perbandingan.',
          sama: 'Coba lihat catatan percobaan: setelah + 1, kolom "ekuivalen?" bertanda ✗ dan warnanya berubah.',
          selaluTawar:
            'Dari 2 : 3, menambah 1 justru membuat lebih manis (3 dari 7 bagian > 2 dari 5 bagian). Yang pasti: rasanya berubah.',
        },
      },
      {
        id: 'tSyarat',
        tanya: 'Dua rasio dikatakan ekuivalen jika …',
        opsi: [
          {
            id: 'kali',
            label:
              'rasio yang satu dapat diperoleh dari yang lain dengan mengalikan atau membagi kedua suku dengan bilangan yang sama (bukan nol)',
          },
          { id: 'selisih', label: 'selisih kedua sukunya sama' },
          { id: 'jumlah', label: 'jumlah kedua sukunya sama' },
        ],
        correct: 'kali',
        umpan: {
          kali: 'Tepat! Karena itu bentuk paling sederhananya juga sama, mis. 12 : 18 dan 2 : 3.',
          selisih:
            '2 : 3 dan 3 : 4 selisihnya sama-sama 1, tetapi rasanya berbeda. Selisih tidak menentukan rasio.',
          jumlah:
            '2 : 3 dan 3 : 2 jumlahnya sama-sama 5, tetapi rasanya sangat berbeda. Jumlah tidak menentukan rasio.',
        },
      },
    ],
    nextLabel: 'Lanjut: Lab Cek →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — LAB CEK EKUIVALEN
     correct = 'setara' bila rasioSetara(r1, r2), selain itu 'beda'.
     ---------------------------------------------------------- */
  dataPilah: {
    kicker: 'Tahap 4c · Lab Cek Ekuivalen',
    syntax: IL + ' · Sintaks 4',
    goal: 'Memilah pasangan rasio dari situasi sehari-hari: ekuivalen atau tidak.',
    guru: 'Dorong murid memakai dua cara pemeriksaan yang muncul setelah memilih (menyederhanakan dan perkalian silang). Pasangan 8 : 12 dan 10 : 15 sengaja dipilih: tidak ada yang kelipatan langsung, tetapi bentuk sederhananya sama.',
    pengantar:
      'Untuk setiap pasangan, putuskan apakah kedua rasio ekuivalen. Setelah memilih, periksa buktinya: bentuk paling sederhana dan perkalian silang.',
    kategori: [
      { id: 'setara', label: 'Ekuivalen' },
      { id: 'beda', label: 'Tidak ekuivalen' },
    ],
    pasangan: [
      {
        id: 'pNasi',
        konteks: 'dapur',
        teks: 'Menanak nasi: 2 gelas beras : 3 gelas air, dan 6 gelas beras : 9 gelas air. Rasio 2 : 3 dan 6 : 9.',
        r1: { a: 2, b: 3 },
        r2: { a: 6, b: 9 },
        correct: 'setara',
        explanation: '6 : 9 disederhanakan dengan FPB 3 menjadi 2 : 3. Kedua suku dikali 3.',
      },
      {
        id: 'pKelas',
        konteks: 'kelas',
        teks: 'Murid laki-laki : perempuan di VII-A adalah 12 : 16, di VII-B adalah 3 : 4.',
        r1: { a: 12, b: 16 },
        r2: { a: 3, b: 4 },
        correct: 'setara',
        explanation:
          '12 : 16 dibagi FPB 4 menjadi 3 : 4. Perbandingannya sama walaupun banyak muridnya berbeda.',
      },
      {
        id: 'pCat',
        konteks: 'kerajinan',
        teks: 'Cat merah muda: racikan pertama 1 : 3 (merah : putih), racikan kedua 2 : 4.',
        r1: { a: 1, b: 3 },
        r2: { a: 2, b: 4 },
        correct: 'beda',
        explanation:
          '2 : 4 = 1 : 2, bukan 1 : 3. Kedua suku hanya ditambah 1, jadi warnanya lebih merah.',
      },
      {
        id: 'pSirup',
        konteks: 'minuman',
        teks: 'Es sirup: racikan Dina 4 : 5 (sirup : air), racikan Eko 5 : 6.',
        r1: { a: 4, b: 5 },
        r2: { a: 5, b: 6 },
        correct: 'beda',
        explanation:
          'Perkalian silang 4 × 6 = 24 dan 5 × 5 = 25 tidak sama. Menambah 1 mengubah rasio.',
      },
      {
        id: 'pBuku',
        konteks: 'belanja',
        teks: 'Koperasi: 3 buku seharga Rp15.000, dan 5 buku seharga Rp25.000. Rasio banyak buku terhadap harga 3 : 15.000 dan 5 : 25.000.',
        r1: { a: 3, b: 15000 },
        r2: { a: 5, b: 25000 },
        correct: 'setara',
        explanation:
          'Keduanya disederhanakan menjadi 1 : 5.000 (harga satu buku Rp5.000). Perkalian silang 3 × 25.000 = 5 × 15.000 = 75.000.',
      },
      {
        id: 'pSkor',
        konteks: 'kelas',
        teks: 'Lomba cerdas cermat: tim VII-A mencatat skor 10 : 15 dan tim VII-B mencatat 15 : 10 (skor sendiri : skor lawan).',
        r1: { a: 10, b: 15 },
        r2: { a: 15, b: 10 },
        correct: 'beda',
        explanation:
          '10 : 15 = 2 : 3, sedangkan 15 : 10 = 3 : 2. Urutannya tertukar, jadi perbandingannya berbeda.',
      },
      {
        id: 'pLari',
        konteks: 'olahraga',
        teks: 'Latihan lari: Ani 8 putaran dalam 12 menit, Budi 10 putaran dalam 15 menit. Rasio 8 : 12 dan 10 : 15.',
        r1: { a: 8, b: 12 },
        r2: { a: 10, b: 15 },
        correct: 'setara',
        explanation:
          '8 : 12 = 2 : 3 dan 10 : 15 = 2 : 3. Walaupun 10 bukan kelipatan 8, bentuk paling sederhananya sama.',
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
    guru: 'Setelah pernyataan dipilah, minta pasangan membacakan satu dugaan yang dikoreksi data dan menjelaskan buktinya dari lab. Hargai murid yang berani mengubah hipotesisnya.',
    judulA: 'A. Benar atau salah menurut data?',
    judulB: 'B. Dugaanmu vs data',
    opsiPernyataan: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'v46',
        teks: '4 : 6 ekuivalen dengan 2 : 3.',
        correct: 'benar',
        cek: { jenis: 'setara', a: 4, b: 6, c: 2, d: 3 },
        explanation: '4 : 6 dibagi 2 menjadi 2 : 3 (Gelas A dan Gelas B sama manis).',
      },
      {
        id: 'v34',
        teks: '2 : 3 ekuivalen dengan 3 : 4 karena kedua suku sama-sama bertambah 1.',
        correct: 'salah',
        cek: { jenis: 'setara', a: 2, b: 3, c: 3, d: 4 },
        explanation:
          '2 × 4 = 8 dan 3 × 3 = 9 tidak sama. Menambah bilangan yang sama mengubah rasio.',
      },
      {
        id: 'v53',
        teks: 'Rasio 5 : 3 sama dengan 3 : 5.',
        correct: 'salah',
        cek: { jenis: 'setara', a: 5, b: 3, c: 3, d: 5 },
        explanation:
          'Urutan suku penting: 5 : 3 dan 3 : 5 membandingkan besaran dengan arah berlawanan.',
      },
      {
        id: 'v1824',
        teks: 'Bentuk paling sederhana dari 18 : 24 adalah 3 : 4.',
        correct: 'benar',
        cek: { jenis: 'sederhana', a: 18, b: 24, c: 3, d: 4 },
        explanation: 'FPB 18 dan 24 adalah 6; 18 : 6 = 3 dan 24 : 6 = 4.',
      },
      {
        id: 'v812',
        teks: 'Resep 2 : 3 yang dibuat 4 kali lipat menjadi 8 : 12.',
        correct: 'benar',
        cek: { jenis: 'setara', a: 2, b: 3, c: 8, d: 12 },
        explanation: 'Kedua suku dikali 4: 2 × 4 = 8 dan 3 × 4 = 12.',
      },
      {
        id: 'vLari',
        teks: '8 : 12 dan 10 : 15 ekuivalen, walaupun 10 bukan kelipatan 8.',
        correct: 'benar',
        cek: { jenis: 'setara', a: 8, b: 12, c: 10, d: 15 },
        explanation:
          'Keduanya sama dengan 2 : 3 setelah disederhanakan; perkalian silang 8 × 15 = 12 × 10 = 120.',
      },
      {
        id: 'v1218',
        teks: 'Bentuk paling sederhana dari 12 : 18 adalah 4 : 6.',
        correct: 'salah',
        cek: { jenis: 'sederhana', a: 12, b: 18, c: 4, d: 6 },
        explanation: '4 : 6 masih bisa dibagi 2. Bentuk paling sederhananya 2 : 3 (dibagi FPB 6).',
      },
      {
        id: 'vKeseluruhan',
        teks: 'Rasio dapat membandingkan bagian dengan keseluruhan, misalnya sirup terhadap seluruh isi Gelas A adalah 2 : 5.',
        correct: 'benar',
        explanation:
          'Seluruh isi Gelas A adalah 2 + 3 = 5 takar, jadi sirup terhadap seluruh isi adalah 2 : 5.',
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
    goal: 'Menyusun kesimpulan tentang rasio dan rasio ekuivalen dari hasil penyelidikan.',
    guru: 'Minta beberapa pasangan membacakan kesimpulan lengkapnya, lalu kaitkan kembali dengan rumusan masalah di tahap 2.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai satu kali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'kArti', awal: 'Rasio a : b', correct: 'bUrutan' },
      { id: 'kSetara', awal: 'Rasio ekuivalen diperoleh', correct: 'bKali' },
      { id: 'kCek', awal: 'Dua rasio dapat diperiksa ekuivalen atau tidak', correct: 'bCek' },
      { id: 'kTambah', awal: 'Menambahkan bilangan yang sama pada kedua suku', correct: 'bUbah' },
    ],
    bank: [
      {
        id: 'bUrutan',
        teks: 'membandingkan besaran pertama (a) terhadap besaran kedua (b), sehingga urutannya tidak boleh ditukar.',
      },
      {
        id: 'bKali',
        teks: 'dengan mengalikan atau membagi kedua suku dengan bilangan yang sama (bukan nol).',
      },
      {
        id: 'bCek',
        teks: 'dengan menyederhanakan keduanya memakai FPB, atau dengan perkalian silang (a × d = b × c).',
      },
      { id: 'bUbah', teks: 'mengubah perbandingannya, sehingga hasilnya tidak ekuivalen.' },
      { id: 'bSelalu', teks: 'selalu menghasilkan rasio yang ekuivalen.' },
      { id: 'bSelisih', teks: 'dengan melihat apakah selisih kedua sukunya sama.' },
      { id: 'bBebas', teks: 'boleh ditulis dalam urutan apa saja asalkan bilangannya sama.' },
    ],
    rangkuman: [
      'Rasio <strong>a : b</strong> dibaca "a banding b" dan membandingkan dua besaran. Urutan suku mengikuti urutan besaran yang disebut.',
      'Rasio dapat membandingkan <strong>bagian dengan bagian</strong> (sirup : air = 2 : 3) atau <strong>bagian dengan keseluruhan</strong> (sirup : seluruh isi = 2 : 5).',
      'Rasio ekuivalen: kalikan atau bagi kedua suku dengan bilangan yang sama, mis. <strong>2 : 3 = 4 : 6 = 6 : 9</strong>.',
      'Bentuk paling sederhana diperoleh dengan membagi kedua suku dengan FPB-nya: <strong>12 : 18 = 2 : 3</strong>.',
      'Cek ekuivalen dengan perkalian silang: a : b ekuivalen c : d jika <strong>a × d = b × c</strong>. Menambah bilangan yang sama pada kedua suku mengubah rasio.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Diambil acak `banyak` soal sesuai `komposisi` dari bank.
     Soal isian diperiksa periksaSoalRasio (engine seksi 67).
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan rasio dan rasio ekuivalen untuk menyelesaikan masalah sehari-hari.',
    guru: 'Murid bekerja mandiri. Amati pesan diagnosa yang muncul (tertukar, keseluruhan, tambah sama) sebagai bahan umpan balik individual.',
    instruksi:
      'Kerjakan enam soal berikut. Tulis rasio dengan tanda titik dua, mis. 2 : 3. Untuk soal isian bilangan, tulis satu bilangan bulat.',
    banyak: 6,
    komposisi: { input: 3, choice: 3 },
    soal: [
      {
        id: 'iBuku',
        type: 'input',
        konteks: 'kelas',
        cerita: 'Di pojok baca kelas ada 9 buku cerita dan 6 buku pelajaran.',
        pertanyaan:
          'Tulis rasio buku pelajaran terhadap buku cerita dalam bentuk paling sederhana.',
        cek: { jenis: 'situasi', a: 9, b: 6, P: 'b', Q: 'a', sederhana: true },
        placeholder: 'mis. 2 : 3',
        hints: [
          'Suku pertama adalah buku pelajaran (6), suku kedua buku cerita (9).',
          '6 : 9 masih bisa disederhanakan. FPB 6 dan 9 adalah 3.',
        ],
        reveal: 'Jawaban: 2 : 3.',
        explanation: 'Buku pelajaran : buku cerita = 6 : 9, dibagi FPB 3 menjadi 2 : 3.',
      },
      {
        id: 'iKebun',
        type: 'input',
        konteks: 'kebun',
        cerita: 'Kebun sekolah ditanami 7 pohon cabai dan 5 pohon tomat.',
        pertanyaan: 'Tulis rasio pohon tomat terhadap seluruh pohon di kebun.',
        cek: { jenis: 'situasi', a: 7, b: 5, P: 'b', Q: 'total' },
        placeholder: 'mis. 2 : 3',
        hints: [
          'Seluruh pohon = pohon cabai + pohon tomat.',
          'Seluruh pohon ada 7 + 5 = 12. Suku pertama adalah pohon tomat.',
        ],
        reveal: 'Jawaban: 5 : 12.',
        explanation: 'Pohon tomat : seluruh pohon = 5 : (7 + 5) = 5 : 12.',
      },
      {
        id: 'iTeh',
        type: 'input',
        konteks: 'minuman',
        cerita:
          'Resep es teh kedai: 1 takar teh pekat : 4 takar air. Untuk satu termos besar dipakai 5 takar teh pekat.',
        pertanyaan: 'Berapa takar air yang diperlukan agar rasanya sama?',
        cek: { jenis: 'hilang', a: 1, b: 4, x: 5, posisi: 'kanan' },
        satuan: 'takar',
        placeholder: 'mis. 12',
        hints: [
          'Teh pekat bertambah dari 1 menjadi 5 takar, artinya dikali 5.',
          'Air juga dikali 5: 4 × 5 = …',
        ],
        reveal: 'Jawaban: 20 takar air.',
        explanation: '1 : 4 = 5 : 20, kedua suku dikali 5.',
      },
      {
        id: 'iKue',
        type: 'input',
        konteks: 'dapur',
        cerita:
          'Adonan kue kantin memakai 3 gelas tepung untuk setiap 2 butir telur. Hari ini Bu Kantin memakai 8 butir telur.',
        pertanyaan: 'Berapa gelas tepung yang diperlukan agar adonannya sama?',
        cek: { jenis: 'hilang', a: 3, b: 2, x: 8, posisi: 'kiri' },
        satuan: 'gelas',
        placeholder: 'mis. 12',
        hints: [
          'Telur bertambah dari 2 menjadi 8 butir, artinya dikali 4.',
          'Tepung juga dikali 4: 3 × 4 = …',
        ],
        reveal: 'Jawaban: 12 gelas tepung.',
        explanation: '3 : 2 = 12 : 8, kedua suku dikali 4.',
      },
      {
        id: 'iGol',
        type: 'input',
        konteks: 'olahraga',
        cerita: 'Dalam satu musim, tim futsal sekolah mencetak 18 gol dan kemasukan 24 gol.',
        pertanyaan:
          'Tulis rasio gol yang dicetak terhadap gol kemasukan dalam bentuk paling sederhana.',
        cek: { jenis: 'sederhana', a: 18, b: 24 },
        placeholder: 'mis. 2 : 3',
        hints: ['Mulai dari 18 : 24.', 'FPB 18 dan 24 adalah 6. Bagi kedua suku dengan 6.'],
        reveal: 'Jawaban: 3 : 4.',
        explanation: '18 : 24 dibagi FPB 6 menjadi 3 : 4.',
      },
      {
        id: 'iPensil',
        type: 'input',
        konteks: 'belanja',
        cerita:
          'Di koperasi, harga 3 pensil adalah Rp6.000. Rasio banyak pensil terhadap harga selalu sama.',
        pertanyaan: 'Berapa rupiah harga 5 pensil?',
        cek: { jenis: 'hilang', a: 3, b: 6000, x: 5, posisi: 'kanan' },
        satuan: 'rupiah',
        placeholder: 'mis. 8.000',
        hints: [
          'Sederhanakan dulu 3 : 6.000 menjadi 1 : 2.000 (harga satu pensil).',
          '5 pensil = 5 × 2.000 = …',
        ],
        reveal: 'Jawaban: 10.000 rupiah (Rp10.000).',
        explanation: '3 : 6.000 = 1 : 2.000 = 5 : 10.000.',
      },
      {
        id: 'cSetara35',
        type: 'choice',
        konteks: 'minuman',
        cerita: 'Resep jus jambu: 3 gelas jambu : 5 gelas air.',
        pertanyaan: 'Racikan mana yang rasanya sama dengan resep itu?',
        cek: { jenis: 'pilihSetara', a: 3, b: 5 },
        options: [
          { id: 'a', label: '9 : 15' },
          { id: 'b', label: '5 : 3' },
          { id: 'c', label: '4 : 6' },
          { id: 'd', label: '6 : 8' },
        ],
        correct: 'a',
        explanation:
          '9 : 15 diperoleh dengan mengalikan 3 : 5 dengan 3. 4 : 6 dan 6 : 8 ditambah sama banyak, sedangkan 5 : 3 urutannya tertukar.',
      },
      {
        id: 'cTidak46',
        type: 'choice',
        konteks: 'kelas',
        cerita: 'Rasio murid yang membawa bekal terhadap yang jajan di kelas VII-D adalah 4 : 6.',
        pertanyaan: 'Manakah rasio yang TIDAK ekuivalen dengan 4 : 6?',
        cek: { jenis: 'pilihTidakSetara', a: 4, b: 6 },
        options: [
          { id: 'a', label: '5 : 7' },
          { id: 'b', label: '2 : 3' },
          { id: 'c', label: '8 : 12' },
          { id: 'd', label: '6 : 9' },
        ],
        correct: 'a',
        explanation:
          '5 : 7 diperoleh dengan menambah 1, sehingga tidak ekuivalen. 2 : 3, 8 : 12, dan 6 : 9 semuanya sama dengan 2 : 3.',
      },
      {
        id: 'cKelas',
        type: 'choice',
        konteks: 'kelas',
        cerita: 'Di kelas VII-C ada 14 murid laki-laki dan 16 murid perempuan.',
        pertanyaan: 'Rasio murid laki-laki terhadap seluruh murid kelas adalah …',
        cek: { jenis: 'situasi', a: 14, b: 16, P: 'a', Q: 'total' },
        options: [
          { id: 'a', label: '14 : 30' },
          { id: 'b', label: '14 : 16' },
          { id: 'c', label: '16 : 30' },
          { id: 'd', label: '30 : 14' },
        ],
        correct: 'a',
        explanation:
          'Seluruh murid ada 14 + 16 = 30. Rasio laki-laki terhadap seluruh murid adalah 14 : 30 (= 7 : 15).',
      },
      {
        id: 'cSederhana',
        type: 'choice',
        konteks: 'belanja',
        cerita: 'Di kantin terjual 20 roti dan 35 gelas minuman.',
        pertanyaan: 'Bentuk paling sederhana rasio roti terhadap minuman adalah …',
        cek: { jenis: 'sederhana', a: 20, b: 35 },
        options: [
          { id: 'a', label: '4 : 7' },
          { id: 'b', label: '7 : 4' },
          { id: 'c', label: '5 : 7' },
          { id: 'd', label: '10 : 25' },
        ],
        correct: 'a',
        explanation: 'FPB 20 dan 35 adalah 5; 20 : 5 = 4 dan 35 : 5 = 7.',
      },
      {
        id: 'cCat',
        type: 'choice',
        konteks: 'kerajinan',
        cerita: 'Cat hijau muda dibuat dari 2 kaleng cat biru dan 5 kaleng cat kuning.',
        pertanyaan: 'Racikan biru : kuning mana yang warnanya sama?',
        cek: { jenis: 'pilihSetara', a: 2, b: 5 },
        options: [
          { id: 'a', label: '6 : 15' },
          { id: 'b', label: '3 : 6' },
          { id: 'c', label: '4 : 7' },
          { id: 'd', label: '5 : 2' },
        ],
        correct: 'a',
        explanation:
          '6 : 15 = 2 : 5 (dikali 3). 3 : 6 dan 4 : 7 diperoleh dengan menambah, sedangkan 5 : 2 urutannya tertukar.',
      },
      {
        id: 'cJus',
        type: 'choice',
        konteks: 'minuman',
        cerita: 'Resep jus mangga: 1 gelas mangga : 2 gelas susu.',
        pertanyaan: 'Racikan mana yang rasanya BERBEDA dari resep itu?',
        cek: { jenis: 'pilihTidakSetara', a: 1, b: 2 },
        options: [
          { id: 'a', label: '2 : 3' },
          { id: 'b', label: '2 : 4' },
          { id: 'c', label: '3 : 6' },
          { id: 'd', label: '5 : 10' },
        ],
        correct: 'a',
        explanation:
          '2 : 3 diperoleh dengan menambah 1, sedangkan yang lain adalah 1 : 2 dikali 2, 3, dan 5.',
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
    goal: 'Merefleksikan proses penyelidikan dan pemahaman tentang rasio.',
    guru: 'Gunakan jawaban refleksi untuk mengetahui murid yang masih berpikir aditif ("tambah sama berarti sama"). Rencanakan penguatan dengan benda nyata untuk mereka.',
    pertanyaan: [
      {
        id: 'rArti',
        teks: 'Dengan kata-katamu sendiri, apa itu rasio? Beri satu contoh dari kehidupanmu.',
        placeholder: 'Rasio adalah … Contohnya …',
      },
      {
        id: 'rCek',
        teks: 'Bagaimana caramu memeriksa apakah dua rasio ekuivalen?',
        placeholder: 'Aku memeriksanya dengan …',
      },
      {
        id: 'rDugaan',
        teks: 'Dugaan mana yang berubah setelah kamu menyelidiki? Mengapa berubah?',
        placeholder: 'Awalnya aku menduga … ternyata …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menjelaskan rasio dan rasio ekuivalen sekarang?',
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
    teks: 'Kamu sudah menyelidiki rasio dan rasio ekuivalen dari situasi sehari-hari. Kedai Es Sirup Kelas VII kini bisa membuat banyak gelas dengan rasa yang sama.',
    contoh: [
      {
        konteks: 'minuman',
        teks: '2 : 3 = 4 : 6 = 6 : 9',
        keterangan: 'Kali atau bagi kedua suku → rasa tetap sama.',
      },
      {
        konteks: 'dapur',
        teks: '2 : 3 ≠ 3 : 2',
        keterangan: 'Urutan suku mengikuti besaran yang disebut.',
      },
      {
        konteks: 'kebun',
        teks: '5 : 3 dan 5 : 8',
        keterangan: 'Bagian : bagian dan bagian : keseluruhan.',
      },
    ],
    capaian: [
      'Menuliskan rasio dua besaran dalam bentuk a : b dengan urutan yang benar.',
      'Membedakan rasio bagian terhadap bagian dan bagian terhadap keseluruhan.',
      'Menemukan bahwa rasio ekuivalen diperoleh dengan mengalikan atau membagi kedua suku dengan bilangan yang sama.',
      'Menyederhanakan rasio dengan FPB dan memeriksa rasio ekuivalen dengan perkalian silang.',
    ],
  },
};
