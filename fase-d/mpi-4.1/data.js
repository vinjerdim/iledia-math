'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Pola pada Susunan Benda — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Mengenali dan mendeskripsikan keteraturan pola pada susunan benda
   (batang korek api, ubin, kursi) dengan mengamati, mencatat, dan
   membandingkan tiap tahap susunan.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahKorek', 'olahUbin' & 'olahKursi'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi    (7')  — "Persiapan Pentas Seni Kelas VII": hiasan
                             pagar dari korek api, lantai panggung dari
                             ubin, dan meja-kursi tamu. Murid mengamati
                             tahap 1–3 lalu MENDUGA tahap 4 (tidak
                             dinilai).
     2. Masalah      (5')  — memilih pertanyaan inti penyelidikan lalu
                             menulis dugaan sementara (hipotesis).
     3. Lab Susun    (15') — memilih susunan, menggeser tahap 1–4,
                             menyorot benda yang baru ditambahkan, lalu
                             MENGHITUNG & MENCATAT banyak benda di tabel
                             pengamatan (isian berdiagnosa: tahap
                             tertukar, menghitung bagian secara terpisah).
     4a–c. Olah      (18') — tiap susunan: mengisi jembatan selisih antar
                             tahap (pelacak selisih seksi 32), menjawab
                             pertanyaan temuan (apa yang ditambahkan,
                             mengapa, bagaimana keteraturannya), lalu
                             memprediksi tahap berikutnya dan mencocokkan
                             dengan gambar.
     5. Verifikasi   (10') — memilah enam susunan baru (tetap /
                             bertingkat / tidak teratur), memilah
                             pernyataan, dan membandingkan dugaan awal
                             serta hipotesis dengan data.
     6. Generalisasi (5')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap    (12') — delapan soal diambil acak dari bank enam
                             belas soal (isian berdiagnosa & pilihan
                             ganda berpengecoh miskonsepsi).
     8. Refleksi     (3')  — rekap, refleksi tertulis, penilaian diri.

   Notasi kunci jawaban (`cek`, lihat engine seksi 71):
     { jenis, n }                    → banyak benda tahap n
     { jenis, n, minta: 'tambahan' } → benda baru pada tahap n
     { suku: [..], n }               → suku ke-n barisan
     { jenis | suku, minta: 'keteraturan' } → 'tetap' | 'bertingkat' |
                                       'tidakTeratur'
   jenis: korekPersegi, korekSegitiga, ubinPersegi, ubinL, ubinTangga,
   kursiDeret, kursiTerpisah (POLA_BENDA di shared/engine.js).

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Soal uji terap juga
   diambil acak dari bank dan opsi pilihan gandanya dibangun engine
   (opsiSoalPola) lalu diacak.

   Konsistensi kunci jawaban diuji tests/mpi-4.1-data.test.js terhadap
   engine seksi 71 (banyakBendaPola, jenisKeteraturan, periksaSoalPola,
   jawabSoalPola, opsiSoalPola).
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  meta: {
    judul: 'Pola pada Susunan Benda',
  },

  tahap: [
    { id: 'stimulasi', label: 'Stimulasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'koleksi', label: 'Lab Susun' },
    { id: 'olahKorek', label: 'Olah Korek Api' },
    { id: 'olahUbin', label: 'Olah Ubin' },
    { id: 'olahKursi', label: 'Olah Kursi' },
    { id: 'verifikasi', label: 'Verifikasi' },
    { id: 'generalisasi', label: 'Generalisasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Label konteks soal (ikon + nama). */
  konteks: {
    korek: { ikon: '🔥', nama: 'Korek Api' },
    ubin: { ikon: '🟫', nama: 'Ubin' },
    kursi: { ikon: '🪑', nama: 'Kursi' },
    lain: { ikon: '📦', nama: 'Benda Lain' },
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; dibandingkan dengan data pada tahap
     Verifikasi. `baku` = jawaban menurut engine (lihat cek).
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati tiga susunan benda untuk pentas seni, lalu menduga banyak benda pada tahap berikutnya.',
    tp: 'Mengenali dan mendeskripsikan keteraturan pola pada susunan benda (batang korek api, ubin, kursi) dengan mengamati, mencatat, dan membandingkan tiap tahap susunan.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Mengamati susunan benda tahap demi tahap dan menghitung banyak bendanya dengan teliti.',
      'Mencatat banyak benda setiap tahap dalam tabel pengamatan.',
      'Membandingkan dua tahap berurutan untuk menemukan benda yang baru ditambahkan (selisihnya).',
      'Membedakan pola yang bertambah tetap, bertambah bertingkat, dan tidak teratur.',
      'Mendeskripsikan keteraturan pola dengan kata-kata dan memakainya untuk menentukan banyak benda pada tahap berikutnya.',
    ],
    guru: 'Tampilkan ketiga susunan. Minta pasangan murid mengamati tahap 1–3 tanpa menghitung rumit, lalu memilih dugaan untuk tahap 4. Jangan membenarkan atau menyalahkan — perbedaan dugaan (mis. "korek api tahap 4 pasti 16 karena 4 × 4!") justru menjadi bahan penemuan.',
    judul: 'Persiapan Pentas Seni Kelas VII',
    pengantar:
      'Kelas VII menyiapkan panggung pentas seni. Raka membuat hiasan pagar dari batang korek api, Sinta menata lantai panggung dari ubin, dan Dimas menyusun meja serta kursi untuk tamu. Setiap susunan dibuat bertahap. Amati tahap 1 sampai 3 berikut.',
    susunan: [
      {
        id: 'sKorek',
        jenis: 'korekPersegi',
        judul: 'Hiasan pagar dari korek api',
        teks: 'Raka menambah satu persegi di setiap tahap.',
      },
      {
        id: 'sUbin',
        jenis: 'ubinPersegi',
        judul: 'Lantai panggung dari ubin',
        teks: 'Sinta memperbesar lantai persegi di setiap tahap.',
      },
      {
        id: 'sKursi',
        jenis: 'kursiDeret',
        judul: 'Meja dan kursi tamu',
        teks: 'Dimas menyambung satu meja lagi di setiap tahap.',
      },
    ],
    dugaan: [
      {
        id: 'dKorek',
        tanya: 'Berapa batang korek api pada hiasan pagar tahap 4?',
        opsi: [
          { id: 'k13', label: '13 batang' },
          { id: 'k16', label: '16 batang (4 persegi × 4 batang)' },
          { id: 'k12', label: '12 batang' },
          { id: 'k11', label: '11 batang' },
        ],
        baku: 'k13',
        cek: { jenis: 'korekPersegi', n: 4 },
        pembahasan:
          'Setiap tahap bertambah 3 batang: 4, 7, 10, 13. Persegi baru memakai satu batang persegi sebelumnya.',
      },
      {
        id: 'dUbin',
        tanya: 'Berapa ubin pada lantai panggung tahap 4?',
        opsi: [
          { id: 'u16', label: '16 ubin' },
          { id: 'u12', label: '12 ubin (bertambah 3 lagi)' },
          { id: 'u13', label: '13 ubin' },
          { id: 'u10', label: '10 ubin' },
        ],
        baku: 'u16',
        cek: { jenis: 'ubinPersegi', n: 4 },
        pembahasan:
          'Lantainya 4 × 4 = 16 ubin. Tambahannya 3, 5, 7 — tidak selalu sama, tetapi berubah teratur.',
      },
      {
        id: 'dKursi',
        tanya: 'Berapa kursi di sekeliling 4 meja pada tahap 4?',
        opsi: [
          { id: 'r10', label: '10 kursi' },
          { id: 'r16', label: '16 kursi (4 meja × 4 kursi)' },
          { id: 'r8', label: '8 kursi' },
          { id: 'r12', label: '12 kursi' },
        ],
        baku: 'r10',
        cek: { jenis: 'kursiDeret', n: 4 },
        pembahasan:
          'Setiap meja baru menambah 2 kursi (atas dan bawah): 4, 6, 8, 10. Kursi di ujung hanya bergeser.',
      },
    ],
    alasanLabel: 'Bagaimana kamu menduganya? Tulis singkat caramu.',
    alasanPlaceholder: 'Contoh: aku melihat setiap tahap bertambah …',
    catatan:
      'Dugaan ini belum dinilai. Kalian akan memeriksanya sendiri dengan mengamati, mencatat, dan membandingkan setiap tahap.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — PROBLEM STATEMENT
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Memilih pertanyaan inti yang akan diselidiki dan menuliskan dugaan sementara.',
    guru: 'Ajak murid membedakan pertanyaan yang hanya menanyakan satu angka dengan pertanyaan yang menyelidiki keteraturan. Hipotesis boleh keliru — yang penting dapat diuji dengan data.',
    pengantar:
      'Dugaan kalian di tahap 1 bisa berbeda-beda. Agar dapat memastikannya, kita perlu pertanyaan penyelidikan yang tepat.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'mInti',
        label:
          'Bagaimana banyak benda berubah dari satu tahap ke tahap berikutnya, dan apakah perubahannya teratur?',
      },
      { id: 'mWarna', label: 'Warna korek api apa yang paling bagus untuk hiasan pagar?' },
      { id: 'mSatu', label: 'Berapa banyak ubin yang dipakai Sinta pada tahap 2?' },
      { id: 'mKali', label: 'Apakah banyak benda selalu dikali dua setiap tahap?' },
    ],
    correct: 'mInti',
    umpan: {
      mInti:
        'Tepat! Pertanyaan ini menyelidiki perubahan dari tahap ke tahap, sehingga berlaku untuk ketiga susunan.',
      mWarna:
        'Warna tidak berhubungan dengan banyak benda. Pilih pertanyaan tentang pola banyaknya.',
      mSatu:
        'Pertanyaan ini cukup dijawab dengan menghitung satu gambar. Kita ingin menyelidiki keteraturan di semua tahap.',
      mKali:
        'Pertanyaan ini sudah menebak aturannya lebih dulu. Pilih pertanyaan yang lebih terbuka agar data yang menjawabnya.',
    },
    hipotesisLabel: 'Tulis dugaan sementaramu (hipotesis) tentang pola ketiga susunan itu.',
    hipotesisPlaceholder:
      'Contoh: aku menduga setiap tahap selalu bertambah dengan banyak benda yang sama …',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — DATA COLLECTION (Lab Susun)
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Mengumpulkan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengamati setiap tahap ketiga susunan, menghitung banyak bendanya, dan mencatatnya di tabel pengamatan.',
    guru: 'Murid bergantian: satu menggeser tahap dan menunjuk benda, satu lagi menghitung dan mencatat. Dorong murid menyalakan "Sorot benda yang baru ditambahkan" untuk melihat apa yang berubah. Pesan diagnosa (mis. menghitung persegi secara terpisah) bisa diangkat dalam diskusi kelas.',
    pengantar:
      'Pilih susunan, geser tahapnya dengan tombol − dan +, lalu hitung bendanya. Catat banyak benda tahap 1 sampai 4 untuk ketiga susunan. Mejanya tidak ikut dihitung — hanya kursinya.',
    lab: {
      jenisList: ['korekPersegi', 'ubinPersegi', 'kursiDeret'],
      tahapCatat: 4,
      tahapMaks: 4,
    },
    tips: [
      'Hitung dengan teratur, misalnya batang mendatar dulu, lalu batang tegak.',
      'Nyalakan sorot: benda oranye adalah benda yang baru ditambahkan dari tahap sebelumnya.',
      'Batang korek api yang dipakai dua persegi sekaligus hanya dihitung satu kali.',
    ],
    selesaiTeks:
      'Data ketiga susunan sudah tercatat. Sekarang olah datanya: bandingkan setiap dua tahap yang berurutan.',
    nextLabel: 'Lanjut: Olah Data Korek Api →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — DATA PROCESSING: korek api
     ---------------------------------------------------------- */
  olahKorek: {
    kicker: 'Tahap 4a · Mengolah Data Korek Api',
    syntax: DL + ' · Sintaks 4',
    goal: 'Membandingkan tahap berurutan pada hiasan korek api untuk menemukan keteraturannya.',
    guru: 'Minta murid menunjuk di gambar batang mana saja yang baru. Tanyakan: "Mengapa persegi baru hanya butuh 3 batang, padahal persegi punya 4 sisi?" Prediksi tahap 10 dilakukan dengan melanjutkan pola, bukan menggambar.',
    jenis: 'korekPersegi',
    judul: 'Hiasan pagar korek api',
    pengantar:
      'Ini data yang kamu catat. Isi setiap "jembatan" dengan banyak batang yang ditambahkan dari satu tahap ke tahap berikutnya.',
    temuan: [
      {
        id: 'tkTambah',
        tanya: 'Berapa batang korek api yang ditambahkan pada setiap tahap?',
        opsi: [
          { id: 'tiga', label: 'Selalu 3 batang' },
          { id: 'empat', label: 'Selalu 4 batang' },
          { id: 'beda', label: 'Berbeda-beda setiap tahap' },
          { id: 'satu', label: 'Selalu 1 persegi, jadi 1 batang' },
        ],
        correct: 'tiga',
        umpan: {
          tiga: 'Tepat! Jembatan selisihnya +3, +3, +3.',
          empat:
            'Persegi memang punya 4 sisi, tetapi lihat jembatan selisihnya: berapa yang benar-benar ditambahkan?',
          beda: 'Periksa lagi jembatan selisihmu — apakah nilainya benar-benar berbeda?',
          satu: 'Yang ditambahkan memang 1 persegi, tetapi pertanyaannya tentang banyak batang.',
        },
      },
      {
        id: 'tkAlasan',
        tanya: 'Mengapa tambahannya 3 batang, bukan 4?',
        opsi: [
          {
            id: 'bersama',
            label: 'Persegi baru memakai satu batang milik persegi sebelumnya sebagai sisinya',
          },
          { id: 'kecil', label: 'Persegi baru ukurannya lebih kecil' },
          { id: 'hilang', label: 'Ada satu batang yang dibuang setiap tahap' },
          { id: 'kebetulan', label: 'Hanya kebetulan, tidak ada alasannya' },
        ],
        correct: 'bersama',
        umpan: {
          bersama:
            'Tepat! Satu sisi dipakai bersama oleh dua persegi, sehingga cukup 3 batang baru.',
          kecil: 'Semua persegi sama besar. Nyalakan sorot di Lab Susun dan amati batang oranye.',
          hilang: 'Tidak ada batang yang dibuang. Amati batang mana yang dipakai dua persegi.',
          kebetulan:
            'Ada alasannya! Amati sisi kanan persegi lama — ternyata juga menjadi sisi kiri persegi baru.',
        },
      },
      {
        id: 'tkDeskripsi',
        tanya: 'Deskripsi pola mana yang paling tepat?',
        opsi: [
          {
            id: 'tepat',
            label: 'Tahap 1 terdiri atas 4 batang, lalu setiap tahap bertambah 3 batang.',
          },
          { id: 'kali', label: 'Banyak batang = 4 × nomor tahap.' },
          {
            id: 'mulai3',
            label: 'Tahap 1 terdiri atas 3 batang, lalu setiap tahap bertambah 3 batang.',
          },
          { id: 'acak', label: 'Banyak batang bertambah tidak teratur.' },
        ],
        correct: 'tepat',
        umpan: {
          tepat:
            'Tepat! Inilah keteraturan pola hiasan korek api: mulai dari 4, bertambah 3 terus.',
          kali: 'Cek tahap 2: 4 × 2 = 8, padahal datanya 7 batang.',
          mulai3: 'Hitung lagi tahap 1: satu persegi memerlukan 4 batang.',
          acak: 'Tambahannya selalu +3, jadi polanya teratur.',
        },
      },
    ],
    langkah: [
      {
        id: 'pk5',
        label: 'Tanpa menggambar, berapa batang korek api pada tahap 5?',
        cek: { jenis: 'korekPersegi', n: 5 },
        satuan: 'batang',
        hints: ['Tahap 4 terdiri atas 13 batang.', 'Tambahkan 3 batang: 13 + 3 = …'],
        temuan: 'Benar, 16 batang: 13 + 3. Cocokkan dengan gambar tahap 5 di bawah.',
      },
      {
        id: 'pk7',
        label: 'Berapa batang korek api pada tahap 7?',
        cek: { jenis: 'korekPersegi', n: 7 },
        satuan: 'batang',
        hints: ['Lanjutkan dari tahap 5 (16 batang).', 'Tahap 6 = 16 + 3, tahap 7 = tahap 6 + 3.'],
        temuan: 'Benar, 22 batang: 16 → 19 → 22.',
      },
      {
        id: 'pk10',
        label:
          'Raka ingin membuat hiasan sampai tahap 10. Berapa batang korek api yang ia perlukan?',
        cek: { jenis: 'korekPersegi', n: 10 },
        satuan: 'batang',
        hints: ['Dari tahap 7 ke tahap 10 ada 3 kali penambahan.', '22 + 3 + 3 + 3 = …'],
        temuan:
          'Benar, 31 batang. Cara cepat: tahap 1 ada 4 batang, ditambah 9 kali 3 batang: 4 + 27 = 31.',
      },
    ],
    buktiLabel: 'Bukti dari gambar: tahap 5 (benda baru disorot)',
    nextLabel: 'Lanjut: Olah Data Ubin →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — DATA PROCESSING: ubin
     ---------------------------------------------------------- */
  olahUbin: {
    kicker: 'Tahap 4b · Mengolah Data Ubin',
    syntax: DL + ' · Sintaks 4',
    goal: 'Membandingkan tahap berurutan pada lantai ubin dan menemukan bahwa tambahannya berubah secara teratur.',
    guru: 'Bagian ini menantang dugaan bahwa semua pola bertambah tetap. Minta murid mewarnai (menyorot) ubin baru dan menyebut bentuknya — huruf L yang makin panjang. Tanyakan: "Berapa tambahan berikutnya?"',
    jenis: 'ubinPersegi',
    judul: 'Lantai panggung dari ubin',
    pengantar:
      'Isi jembatan selisih untuk lantai ubin. Apakah tambahannya sama seperti pada korek api?',
    temuan: [
      {
        id: 'tuTambah',
        tanya: 'Bagaimana tambahan ubin dari tahap ke tahap?',
        opsi: [
          { id: 'naik2', label: 'Tambahannya 3, 5, 7 — setiap kali 2 lebih banyak' },
          { id: 'tetap', label: 'Tambahannya selalu sama' },
          { id: 'acak', label: 'Tambahannya tidak teratur' },
          { id: 'kali2', label: 'Banyak ubinnya selalu dikali dua' },
        ],
        correct: 'naik2',
        umpan: {
          naik2: 'Tepat! Tambahannya tidak sama, tetapi berubah teratur: +3, +5, +7.',
          tetap: 'Lihat jembatan selisihmu: +3, +5, +7. Apakah sama?',
          acak: 'Perhatikan tambahannya: 3, 5, 7. Adakah aturannya?',
          kali2: 'Coba cek: 1 × 2 = 2, padahal tahap 2 terdiri atas 4 ubin.',
        },
      },
      {
        id: 'tuBentuk',
        tanya: 'Nyalakan sorot di Lab Susun. Ubin baru selalu membentuk …',
        opsi: [
          { id: 'L', label: 'Huruf L (siku) di sisi kanan dan bawah yang makin panjang' },
          { id: 'baris', label: 'Satu baris ubin di bawah saja' },
          { id: 'tengah', label: 'Ubin di tengah lantai' },
          { id: 'sama', label: 'Bentuk yang sama besar setiap tahap' },
        ],
        correct: 'L',
        umpan: {
          L: 'Tepat! Bentuk L itu makin panjang 1 ubin di setiap lengannya, jadi tambahannya naik 2.',
          baris: 'Ada juga ubin baru di sisi kanan. Amati ubin oranye sekali lagi.',
          tengah: 'Ubin baru ada di tepi, bukan di tengah.',
          sama: 'Bentuk L-nya makin besar setiap tahap, karena itu tambahannya ikut bertambah.',
        },
      },
      {
        id: 'tuDeskripsi',
        tanya: 'Deskripsi pola mana yang paling tepat?',
        opsi: [
          {
            id: 'tepat',
            label:
              'Tahap 1 terdiri atas 1 ubin; tambahannya 3, 5, 7, … sehingga setiap tahap tambahannya 2 lebih banyak.',
          },
          {
            id: 'tetap3',
            label: 'Tahap 1 terdiri atas 1 ubin, lalu setiap tahap bertambah 3 ubin.',
          },
          { id: 'tetap2', label: 'Setiap tahap selalu bertambah 2 ubin.' },
          { id: 'acak', label: 'Pola ubin tidak teratur sehingga tidak dapat dilanjutkan.' },
        ],
        correct: 'tepat',
        umpan: {
          tepat: 'Tepat! Pola ini bertambah bertingkat. Tahap n berbentuk persegi n × n.',
          tetap3: 'Itu hanya benar dari tahap 1 ke tahap 2. Tahap 3 ke tahap 4 bertambah 7.',
          tetap2: 'Yang bertambah 2 adalah TAMBAHANNYA, bukan banyak ubinnya.',
          acak: 'Tambahannya 3, 5, 7 — teratur! Jadi pola ini dapat dilanjutkan.',
        },
      },
    ],
    langkah: [
      {
        id: 'pu5baru',
        label: 'Berapa ubin BARU yang ditambahkan dari tahap 4 ke tahap 5?',
        cek: { jenis: 'ubinPersegi', n: 5, minta: 'tambahan' },
        satuan: 'ubin',
        hints: ['Tambahannya 3, 5, 7, … — setiap kali 2 lebih banyak.', '7 + 2 = …'],
        temuan: 'Benar, 9 ubin baru. Tambahannya: 3, 5, 7, 9.',
      },
      {
        id: 'pu5',
        label: 'Jadi, berapa ubin pada tahap 5?',
        cek: { jenis: 'ubinPersegi', n: 5 },
        satuan: 'ubin',
        hints: ['Tahap 4 terdiri atas 16 ubin.', '16 + 9 = …'],
        temuan: 'Benar, 25 ubin = 5 × 5. Cocokkan dengan gambar tahap 5 di bawah.',
      },
      {
        id: 'pu6',
        label: 'Berapa ubin pada tahap 6?',
        cek: { jenis: 'ubinPersegi', n: 6 },
        satuan: 'ubin',
        hints: ['Tambahan berikutnya 9 + 2 = 11.', '25 + 11 = …'],
        temuan: 'Benar, 36 ubin: 25 + 11, sama dengan lantai persegi 6 × 6.',
      },
    ],
    buktiLabel: 'Bukti dari gambar: tahap 5 (ubin baru disorot)',
    nextLabel: 'Lanjut: Olah Data Kursi →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — DATA PROCESSING: kursi
     ---------------------------------------------------------- */
  olahKursi: {
    kicker: 'Tahap 4c · Mengolah Data Kursi',
    syntax: DL + ' · Sintaks 4',
    goal: 'Membandingkan tahap berurutan pada susunan meja-kursi dan mendeskripsikan keteraturannya.',
    guru: 'Ajak murid membandingkan dengan meja yang diletakkan terpisah (4 kursi per meja). Soal tahap 10 sengaja memancing jawaban "2 × tahap 5 = 24"; minta murid menjelaskan mengapa cara menggandakan keliru.',
    jenis: 'kursiDeret',
    judul: 'Meja dan kursi tamu',
    pengantar: 'Isi jembatan selisih untuk susunan meja-kursi tamu.',
    temuan: [
      {
        id: 'trTambah',
        tanya: 'Berapa kursi yang ditambahkan setiap kali satu meja disambung?',
        opsi: [
          { id: 'dua', label: 'Selalu 2 kursi' },
          { id: 'empat', label: 'Selalu 4 kursi' },
          { id: 'naik', label: 'Makin lama makin banyak' },
          { id: 'satu', label: 'Selalu 1 kursi' },
        ],
        correct: 'dua',
        umpan: {
          dua: 'Tepat! Jembatan selisihnya +2, +2, +2.',
          empat:
            'Satu meja memang dikelilingi 4 kursi bila berdiri sendiri. Bagaimana bila disambung?',
          naik: 'Lihat jembatan selisihmu — tambahannya tetap, tidak makin banyak.',
          satu: 'Ada kursi baru di atas DAN di bawah meja baru.',
        },
      },
      {
        id: 'trAlasan',
        tanya: 'Mengapa tambahannya hanya 2 kursi?',
        opsi: [
          {
            id: 'ujung',
            label:
              'Kursi di ujung hanya bergeser; yang benar-benar baru hanya kursi di atas dan di bawah meja baru',
          },
          { id: 'kecil', label: 'Meja barunya lebih kecil' },
          { id: 'kurang', label: 'Kursinya tidak cukup' },
          { id: 'kebetulan', label: 'Hanya kebetulan' },
        ],
        correct: 'ujung',
        umpan: {
          ujung:
            'Tepat! Dua kursi di ujung kiri dan kanan selalu ada, jadi setiap meja hanya menambah 2 kursi.',
          kecil: 'Semua meja sama besar. Amati kursi oranye saat sorot dinyalakan.',
          kurang: 'Ini bukan soal persediaan kursi. Amati posisi kursi di ujung meja.',
          kebetulan:
            'Ada alasannya! Perhatikan kursi di ujung kanan sebelum dan sesudah meja disambung.',
        },
      },
      {
        id: 'trDeskripsi',
        tanya: 'Deskripsi pola mana yang paling tepat?',
        opsi: [
          {
            id: 'tepat',
            label: 'Tahap 1 terdiri atas 4 kursi, lalu setiap tahap bertambah 2 kursi.',
          },
          { id: 'kali4', label: 'Banyak kursi = 4 × banyak meja.' },
          { id: 'kali2', label: 'Banyak kursi = 2 × banyak meja.' },
          { id: 'naik', label: 'Tambahan kursinya 2, 4, 6, … (bertingkat).' },
        ],
        correct: 'tepat',
        umpan: {
          tepat: 'Tepat! Pola meja-kursi bertambah tetap: 4, 6, 8, 10, …',
          kali4: 'Cek tahap 2: 4 × 2 = 8, padahal datanya 6 kursi.',
          kali2: 'Cek tahap 1: 2 × 1 = 2, padahal 1 meja dikelilingi 4 kursi.',
          naik: 'Jembatan selisihmu selalu +2, jadi tambahannya tetap.',
        },
      },
    ],
    langkah: [
      {
        id: 'pr5',
        label: 'Berapa kursi untuk 5 meja yang disambung (tahap 5)?',
        cek: { jenis: 'kursiDeret', n: 5 },
        satuan: 'kursi',
        hints: ['Tahap 4 memerlukan 10 kursi.', '10 + 2 = …'],
        temuan: 'Benar, 12 kursi. Cocokkan dengan gambar tahap 5 di bawah.',
      },
      {
        id: 'pr7',
        label: 'Berapa kursi untuk 7 meja yang disambung?',
        cek: { jenis: 'kursiDeret', n: 7 },
        satuan: 'kursi',
        hints: ['Dari tahap 5 ke tahap 7 ada 2 kali penambahan.', '12 + 2 + 2 = …'],
        temuan: 'Benar, 16 kursi: 12 → 14 → 16.',
      },
      {
        id: 'pr10',
        label: 'Dimas menyambung 10 meja. Berapa kursi yang diperlukan?',
        cek: { jenis: 'kursiDeret', n: 10 },
        satuan: 'kursi',
        hints: [
          'Hati-hati: 2 × 12 = 24 tidak tepat, karena kursi ujungnya terhitung dua kali.',
          'Setiap meja punya kursi atas dan bawah (10 × 2), ditambah 2 kursi ujung.',
        ],
        temuan: 'Benar, 22 kursi: 10 meja × 2 kursi + 2 kursi di ujung.',
      },
    ],
    buktiLabel: 'Bukti dari gambar: tahap 5 (kursi baru disorot)',
    nextLabel: 'Lanjut: Verifikasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — VERIFICATION
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Verifikasi',
    syntax: DL + ' · Sintaks 5',
    goal: 'Memeriksa temuan pada susunan benda yang baru dan membandingkan dugaan awal dengan data.',
    guru: 'Murid memilah susunan baru tanpa bantuan rumus: cukup hitung tambahannya. Susunan "penonton" sengaja tidak teratur — bahas bahwa tidak semua barisan bilangan adalah pola. Tutup dengan membandingkan dugaan di tahap 1 dengan data.',
    judulA: 'A. Pilah susunan baru',
    pengantarA:
      'Amati setiap susunan, hitung tambahannya dari tahap ke tahap, lalu pilih jenis keteraturannya.',
    kategori: [
      { id: 'tetap', label: 'Bertambah tetap' },
      { id: 'bertingkat', label: 'Bertambah bertingkat' },
      { id: 'tidakTeratur', label: 'Tidak teratur' },
    ],
    susunan: [
      {
        id: 'vSegitiga',
        jenis: 'korekSegitiga',
        teks: 'Segitiga korek api berjajar',
        correct: 'tetap',
        explanation:
          'Banyak batangnya 3, 5, 7, … — setiap segitiga baru menambah 2 batang karena satu sisinya dipakai bersama.',
      },
      {
        id: 'vL',
        jenis: 'ubinL',
        teks: 'Ubin berbentuk huruf L',
        correct: 'tetap',
        explanation:
          'Banyak ubinnya 1, 3, 5, … — setiap lengan bertambah 1 ubin, jadi tambahannya selalu 2.',
      },
      {
        id: 'vTangga',
        jenis: 'ubinTangga',
        teks: 'Ubin bertingkat seperti tangga',
        correct: 'bertingkat',
        explanation:
          'Banyak ubinnya 1, 3, 6, … — tambahannya 2, 3, 4, … karena kolom baru selalu 1 ubin lebih tinggi.',
      },
      {
        id: 'vTerpisah',
        jenis: 'kursiTerpisah',
        teks: 'Meja terpisah, masing-masing dikelilingi kursi',
        correct: 'tetap',
        explanation:
          'Banyak kursinya 4, 8, 12, … — setiap meja terpisah menambah 4 kursi karena tidak ada kursi yang dipakai bersama.',
      },
      {
        id: 'vPenonton',
        suku: [5, 9, 6, 12],
        labelTahap: 'Hari',
        teks: 'Banyak penonton yang datang ke latihan pentas pada hari ke-1 sampai ke-4',
        correct: 'tidakTeratur',
        explanation:
          'Perubahannya +4, −3, +6 — tidak ada aturan yang tetap, jadi banyak penonton hari ke-5 tidak dapat ditentukan dari pola.',
      },
      {
        id: 'vGelas',
        suku: [2, 6, 12, 20],
        teks: 'Banyak gelas plastik pada menara hiasan tahap 1 sampai 4',
        correct: 'bertingkat',
        explanation: 'Tambahannya 4, 6, 8 — setiap tahap tambahannya 2 lebih banyak.',
      },
    ],
    judulB: 'B. Benar, salah, atau kadang-kadang benar?',
    opsiPernyataan: [
      { id: 'benar', label: 'Selalu benar' },
      { id: 'salah', label: 'Salah' },
      { id: 'kadang', label: 'Kadang-kadang benar' },
    ],
    pernyataan: [
      {
        id: 'nSelisih',
        teks: 'Selisih banyak benda dua tahap berurutan sama dengan banyak benda yang baru ditambahkan.',
        correct: 'benar',
        explanation:
          'Benda tahap berikutnya = benda tahap sebelumnya + benda baru, jadi selisihnya pasti benda baru.',
      },
      {
        id: 'nSamaBanyak',
        teks: 'Setiap tahap, banyak benda yang ditambahkan selalu sama.',
        correct: 'kadang',
        explanation:
          'Benar untuk korek api (+3) dan kursi (+2), tetapi tidak untuk lantai ubin (+3, +5, +7).',
      },
      {
        id: 'nKali',
        teks: 'Banyak batang korek api = 4 × banyak persegi.',
        correct: 'salah',
        explanation:
          'Persegi yang bersebelahan memakai satu batang bersama, jadi banyak batangnya 4, 7, 10, … bukan 4, 8, 12, …',
      },
      {
        id: 'nGanda',
        teks: 'Banyak kursi pada tahap 10 = 2 × banyak kursi pada tahap 5.',
        correct: 'salah',
        explanation: 'Tahap 5 = 12 kursi, tetapi tahap 10 = 22 kursi, bukan 24.',
      },
      {
        id: 'nLanjut',
        teks: 'Jika keteraturan suatu pola sudah ditemukan, tahap berikutnya dapat ditentukan tanpa menggambar.',
        correct: 'benar',
        explanation:
          'Itulah gunanya menemukan keteraturan: kita cukup melanjutkan tambahannya, seperti tahap 10 korek api = 31 batang.',
      },
      {
        id: 'nBarisan',
        teks: 'Setiap barisan bilangan pasti mempunyai pola yang teratur.',
        correct: 'salah',
        explanation: 'Banyak penonton 5, 9, 6, 12 berubah tanpa aturan, jadi tidak teratur.',
      },
    ],
    judulC: 'C. Dugaanmu vs data',
    nextLabel: 'Lanjut: Generalisasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — GENERALIZATION
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Generalisasi',
    syntax: DL + ' · Sintaks 6',
    goal: 'Menyusun kesimpulan tentang cara mengenali dan mendeskripsikan keteraturan pola susunan benda.',
    guru: 'Minta pasangan membacakan kesimpulan yang sudah tersusun, lalu memberi contoh dari susunan mana pun yang mereka amati. Kalimat pengecoh (dikali dua, menggandakan) bisa dibahas sebagai miskonsepsi.',
    instruksi:
      'Lengkapi setiap awal kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai satu kali; ada potongan yang tidak terpakai.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      {
        id: 'gCara',
        awal: 'Untuk mengenali pola susunan benda, kita',
        correct: 'bCara',
      },
      {
        id: 'gSelisih',
        awal: 'Selisih banyak benda pada dua tahap yang berurutan menunjukkan',
        correct: 'bSelisih',
      },
      {
        id: 'gTetap',
        awal: 'Jika tambahannya selalu sama (korek api +3, kursi +2), polanya',
        correct: 'bTetap',
      },
      {
        id: 'gTingkat',
        awal: 'Jika tambahannya berubah secara teratur (ubin +3, +5, +7), polanya',
        correct: 'bTingkat',
      },
      {
        id: 'gBersama',
        awal: 'Benda yang dipakai bersama oleh dua bagian yang bersebelahan',
        correct: 'bBersama',
      },
    ],
    bank: [
      {
        id: 'bCara',
        teks: 'mengamati setiap tahap, mencatat banyak bendanya dalam tabel, lalu membandingkan tahap yang berurutan.',
      },
      { id: 'bSelisih', teks: 'banyak benda yang baru ditambahkan pada tahap itu.' },
      {
        id: 'bTetap',
        teks: 'bertambah tetap: tahap berikutnya = tahap sebelumnya + tambahan yang sama.',
      },
      {
        id: 'bTingkat',
        teks: 'bertambah bertingkat: tambahan berikutnya juga mengikuti aturan (+9, +11, …).',
      },
      {
        id: 'bBersama',
        teks: 'hanya dihitung sekali, sehingga tambahannya lebih sedikit daripada bila bagiannya terpisah.',
      },
      { id: 'xKali', teks: 'selalu dikali dua dari tahap sebelumnya.' },
      {
        id: 'xGanda',
        teks: 'dapat diperoleh dengan menggandakan banyak benda pada tahap separuhnya.',
      },
      { id: 'xTebak', teks: 'cukup ditebak dari gambar terakhir tanpa perlu dicatat.' },
    ],
    rangkuman: [
      '<strong>Amati – catat – bandingkan:</strong> hitung benda tiap tahap, catat di tabel, lalu cari selisih dua tahap berurutan.',
      '<strong>Bertambah tetap:</strong> tambahannya selalu sama. Korek api: 4, 7, 10, 13, … (+3). Kursi: 4, 6, 8, 10, … (+2).',
      '<strong>Bertambah bertingkat:</strong> tambahannya berubah teratur. Ubin: 1, 4, 9, 16, … (+3, +5, +7, …).',
      '<strong>Tidak teratur:</strong> tambahannya tidak mengikuti aturan, sehingga tahap berikutnya tidak dapat ditentukan dari pola.',
      '<strong>Deskripsikan dengan kata-kata:</strong> sebutkan banyak benda tahap 1 dan aturan tambahannya, lalu lanjutkan untuk tahap yang ditanyakan.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Bank 16 soal; app memilih 4 isian + 4 pilihan ganda secara acak.
     Opsi pilihan ganda dibangun engine (opsiSoalPola) lalu diacak.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan keteraturan pola untuk menentukan banyak benda pada tahap tertentu dan menentukan jenis keteraturannya.',
    guru: 'Murid bekerja mandiri. Amati pesan diagnosa yang muncul (tahap tertukar, menghitung bagian terpisah, mengalikan tambahan, menggandakan) sebagai bahan umpan balik individual. Minta murid menuliskan tambahan polanya sebelum menghitung.',
    instruksi:
      'Kerjakan delapan soal berikut. Tentukan dulu tambahan dari tahap ke tahap, lalu lanjutkan polanya. Tulis jawaban berupa satu bilangan bulat.',
    banyak: 8,
    komposisi: { input: 4, choice: 4 },
    soal: [
      {
        id: 'iKorek6',
        type: 'input',
        konteks: 'korek',
        jenis: 'korekPersegi',
        cerita: 'Raka memperpanjang hiasan pagarnya: 4, 7, 10, 13 batang untuk 1, 2, 3, 4 persegi.',
        pertanyaan: 'Berapa batang korek api untuk 6 persegi berjajar?',
        cek: { jenis: 'korekPersegi', n: 6 },
        satuan: 'batang',
        hints: ['Setiap persegi baru menambah 3 batang.', '13 + 3 + 3 = …'],
        reveal: 'Jawaban: 19 batang.',
        explanation: 'Dari tahap 4 (13 batang) ditambah 3 dua kali: 13 + 6 = 19 batang.',
      },
      {
        id: 'iKorek12',
        type: 'input',
        konteks: 'korek',
        jenis: 'korekPersegi',
        cerita: 'Hiasan pagar korek api akan dibuat sepanjang 12 persegi berjajar.',
        pertanyaan: 'Berapa batang korek api yang diperlukan?',
        cek: { jenis: 'korekPersegi', n: 12 },
        satuan: 'batang',
        hints: [
          'Tahap 1 terdiri atas 4 batang, lalu bertambah 3 setiap tahap.',
          'Dari tahap 1 ke tahap 12 ada 11 kali penambahan: 4 + 11 × 3 = …',
        ],
        reveal: 'Jawaban: 37 batang.',
        explanation: '4 + 11 × 3 = 4 + 33 = 37 batang.',
      },
      {
        id: 'iSegitiga5',
        type: 'input',
        konteks: 'korek',
        jenis: 'korekSegitiga',
        cerita: 'Segitiga korek api berjajar memerlukan 3, 5, 7 batang untuk 1, 2, 3 segitiga.',
        pertanyaan: 'Berapa batang korek api untuk 5 segitiga berjajar?',
        cek: { jenis: 'korekSegitiga', n: 5 },
        satuan: 'batang',
        hints: ['Setiap segitiga baru menambah 2 batang.', '7 + 2 + 2 = …'],
        reveal: 'Jawaban: 11 batang.',
        explanation: '3, 5, 7, 9, 11 — segitiga ke-5 memerlukan 11 batang.',
      },
      {
        id: 'iUbin7',
        type: 'input',
        konteks: 'ubin',
        jenis: 'ubinPersegi',
        cerita: 'Lantai ubin persegi: tahap 1, 2, 3, 4 memerlukan 1, 4, 9, 16 ubin.',
        pertanyaan: 'Berapa ubin pada tahap 7?',
        cek: { jenis: 'ubinPersegi', n: 7 },
        satuan: 'ubin',
        hints: ['Tambahannya 3, 5, 7, 9, 11, 13, …', 'Tahap 7 berbentuk persegi 7 × 7.'],
        reveal: 'Jawaban: 49 ubin.',
        explanation: '16 + 9 + 11 + 13 = 49 ubin, sama dengan 7 × 7.',
      },
      {
        id: 'iUbinBaru',
        type: 'input',
        konteks: 'ubin',
        jenis: 'ubinPersegi',
        cerita:
          'Sinta memperbesar lantai ubin persegi dari tahap 7 (7 × 7) menjadi tahap 8 (8 × 8).',
        pertanyaan: 'Berapa ubin BARU yang harus ia tambahkan?',
        cek: { jenis: 'ubinPersegi', n: 8, minta: 'tambahan' },
        satuan: 'ubin',
        hints: [
          'Tambahannya 3, 5, 7, … — tambahan ke tahap 8 adalah bilangan ganjil berikutnya.',
          '64 − 49 = …',
        ],
        reveal: 'Jawaban: 15 ubin.',
        explanation: '8 × 8 − 7 × 7 = 64 − 49 = 15 ubin baru (bentuk L dengan lengan 8 ubin).',
      },
      {
        id: 'iKursi8',
        type: 'input',
        konteks: 'kursi',
        jenis: 'kursiDeret',
        cerita: 'Meja disambung berderet: 1, 2, 3 meja memerlukan 4, 6, 8 kursi.',
        pertanyaan: 'Berapa kursi untuk 8 meja yang disambung?',
        cek: { jenis: 'kursiDeret', n: 8 },
        satuan: 'kursi',
        hints: ['Setiap meja baru menambah 2 kursi.', '8 meja × 2 kursi + 2 kursi ujung = …'],
        reveal: 'Jawaban: 18 kursi.',
        explanation: '8 × 2 + 2 = 18 kursi.',
      },
      {
        id: 'iKursi15',
        type: 'input',
        konteks: 'kursi',
        jenis: 'kursiDeret',
        cerita: 'Untuk jamuan makan, panitia menyambung 15 meja menjadi satu deret panjang.',
        pertanyaan: 'Berapa kursi yang diperlukan?',
        cek: { jenis: 'kursiDeret', n: 15 },
        satuan: 'kursi',
        hints: [
          'Pola kursi: 4, 6, 8, … (bertambah 2).',
          'Setiap meja punya kursi atas dan bawah, ditambah 2 kursi di ujung.',
        ],
        reveal: 'Jawaban: 32 kursi.',
        explanation: '15 × 2 + 2 = 32 kursi.',
      },
      {
        id: 'iAula',
        type: 'input',
        konteks: 'kursi',
        cerita: 'Kursi di aula disusun bertingkat: baris ke-1, ke-2, ke-3 berisi 12, 16, 20 kursi.',
        pertanyaan: 'Jika polanya berlanjut, berapa kursi pada baris ke-7?',
        cek: { suku: [12, 16, 20], n: 7 },
        satuan: 'kursi',
        hints: ['Setiap baris bertambah 4 kursi.', '20 + 4 + 4 + 4 + 4 = …'],
        reveal: 'Jawaban: 36 kursi.',
        explanation: '12, 16, 20, 24, 28, 32, 36 — baris ke-7 berisi 36 kursi.',
      },
      {
        id: 'cTerpisah',
        type: 'choice',
        konteks: 'kursi',
        jenis: 'kursiTerpisah',
        cerita: 'Di kantin, setiap meja diletakkan terpisah dan dikelilingi 4 kursi.',
        pertanyaan: 'Berapa kursi untuk 6 meja terpisah?',
        cek: { jenis: 'kursiTerpisah', n: 6 },
        satuan: 'kursi',
        explanation:
          'Mejanya terpisah, jadi tidak ada kursi yang dipakai bersama: 4, 8, 12, … tahap 6 = 24 kursi.',
      },
      {
        id: 'cL',
        type: 'choice',
        konteks: 'ubin',
        jenis: 'ubinL',
        cerita: 'Ubin berbentuk huruf L memerlukan 1, 3, 5, 7 ubin pada tahap 1 sampai 4.',
        pertanyaan: 'Berapa ubin pada tahap 9?',
        cek: { jenis: 'ubinL', n: 9 },
        satuan: 'ubin',
        explanation: 'Setiap tahap bertambah 2 ubin: 1 + 8 × 2 = 17 ubin.',
      },
      {
        id: 'cTangga',
        type: 'choice',
        konteks: 'ubin',
        jenis: 'ubinTangga',
        cerita: 'Ubin bertingkat seperti tangga memerlukan 1, 3, 6, 10 ubin pada tahap 1 sampai 4.',
        pertanyaan: 'Berapa ubin pada tahap 6?',
        cek: { jenis: 'ubinTangga', n: 6 },
        satuan: 'ubin',
        explanation: 'Tambahannya 2, 3, 4, 5, 6: 10 + 5 + 6 = 21 ubin.',
      },
      {
        id: 'cGelas',
        type: 'choice',
        konteks: 'lain',
        cerita:
          'Hiasan dinding dari tutup botol: tahap 1, 2, 3, 4 memakai 3, 7, 11, 15 tutup botol.',
        pertanyaan: 'Berapa tutup botol pada tahap 10?',
        cek: { suku: [3, 7, 11, 15], n: 10 },
        satuan: 'tutup',
        explanation: 'Setiap tahap bertambah 4: 3 + 9 × 4 = 39 tutup botol.',
      },
      {
        id: 'cSegitiga20',
        type: 'choice',
        konteks: 'korek',
        jenis: 'korekSegitiga',
        cerita: 'Segitiga korek api berjajar: 3, 5, 7, 9 batang untuk 1, 2, 3, 4 segitiga.',
        pertanyaan: 'Berapa batang untuk 20 segitiga berjajar?',
        cek: { jenis: 'korekSegitiga', n: 20 },
        satuan: 'batang',
        explanation:
          '3 + 19 × 2 = 41 batang. Bukan 20 × 3 = 60, karena sisi yang bersebelahan dipakai bersama.',
      },
      {
        id: 'cKetTangga',
        type: 'choice',
        konteks: 'ubin',
        jenis: 'ubinTangga',
        cerita: 'Ubin tangga: 1, 3, 6, 10 ubin pada tahap 1 sampai 4.',
        pertanyaan: 'Bagaimana keteraturan pola ini?',
        cek: { jenis: 'ubinTangga', minta: 'keteraturan' },
        explanation:
          'Tambahannya 2, 3, 4 — berubah teratur (setiap kali 1 lebih banyak), jadi bertambah bertingkat.',
      },
      {
        id: 'cKetKursi',
        type: 'choice',
        konteks: 'kursi',
        jenis: 'kursiDeret',
        cerita: 'Meja disambung berderet: 4, 6, 8, 10 kursi untuk 1, 2, 3, 4 meja.',
        pertanyaan: 'Bagaimana keteraturan pola ini?',
        cek: { jenis: 'kursiDeret', minta: 'keteraturan' },
        explanation: 'Tambahannya selalu 2 kursi, jadi bertambah tetap.',
      },
      {
        id: 'cKetPenonton',
        type: 'choice',
        konteks: 'lain',
        cerita:
          'Banyak murid yang meminjam buku di perpustakaan pada hari Senin–Kamis: 8, 15, 9, 20.',
        pertanyaan: 'Bagaimana keteraturan barisan ini?',
        cek: { suku: [8, 15, 9, 20], minta: 'keteraturan' },
        explanation: 'Perubahannya +7, −6, +11 — tidak mengikuti aturan, jadi tidak teratur.',
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
    goal: 'Merenungkan cara menemukan keteraturan pola dan menilai pemahaman diri.',
    guru: 'Beri waktu hening 3 menit. Ajak beberapa murid membacakan jawaban pertanyaan kedua untuk menguatkan kebiasaan "amati – catat – bandingkan".',
    pertanyaan: [
      {
        id: 'rSusunan',
        teks: 'Susunan mana yang paling menarik bagimu, dan bagaimana keteraturan polanya?',
        placeholder: 'Contoh: lantai ubin, karena tambahannya 3, 5, 7, …',
      },
      {
        id: 'rLangkah',
        teks: 'Langkah apa saja yang kamu lakukan untuk menemukan keteraturan sebuah pola?',
        placeholder: 'Contoh: aku menghitung setiap tahap, mencatat di tabel, lalu …',
      },
      {
        id: 'rDugaan',
        teks: 'Apakah dugaanmu di awal pelajaran tepat? Apa yang membuatmu berubah pikiran?',
        placeholder: 'Contoh: aku kira korek api tahap 4 ada 16 batang, ternyata …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat mendeskripsikan keteraturan pola susunan benda sekarang?',
    diriOpsi: [
      { id: 'sangat', label: 'Sangat yakin — aku bisa menjelaskannya kepada teman' },
      { id: 'yakin', label: 'Yakin — aku bisa mengerjakannya sendiri' },
      { id: 'cukup', label: 'Cukup yakin — kadang masih perlu melihat gambar' },
      { id: 'belum', label: 'Belum yakin — aku perlu latihan lagi' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Kamu sudah menemukan keteraturan pola!',
    teks: 'Dengan mengamati, mencatat, dan membandingkan setiap tahap, kamu dapat mendeskripsikan pola susunan benda dan melanjutkannya tanpa menggambar.',
    contoh: [
      { jenis: 'korekPersegi', keterangan: 'bertambah tetap +3' },
      { jenis: 'ubinPersegi', keterangan: 'bertambah bertingkat +3, +5, +7' },
      { jenis: 'kursiDeret', keterangan: 'bertambah tetap +2' },
    ],
    capaian: [
      'Menghitung dan mencatat banyak benda setiap tahap susunan korek api, ubin, dan kursi.',
      'Membandingkan dua tahap berurutan untuk menemukan benda yang baru ditambahkan.',
      'Membedakan pola yang bertambah tetap, bertambah bertingkat, dan tidak teratur.',
      'Mendeskripsikan keteraturan pola dengan kata-kata dan menentukan banyak benda pada tahap berikutnya.',
    ],
  },
};
