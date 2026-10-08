'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Pembulatan & Penaksiran untuk Menilai Kewajaran
   Jawaban — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menerapkan strategi pembulatan dan penaksiran (estimasi) hasil
   operasi aritmatika bilangan real untuk menilai kewajaran jawaban
   dalam masalah sehari-hari.

   Model pembelajaran: INQUIRY LEARNING (Inkuiri Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Orientasi .................. 'orientasi'
     Sintaks 2 — Merumuskan masalah ......... 'masalah'
     Sintaks 3 — Merumuskan hipotesis ....... 'hipotesis'
     Sintaks 4 — Mengumpulkan data .......... 'dataBulat', 'dataTaksir' & 'dataWajar'
     Sintaks 5 — Menguji hipotesis .......... 'uji'
     Sintaks 6 — Merumuskan kesimpulan ...... 'simpulan'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Orientasi   (8')  — "Persiapan Kemah Kelas VII": tiga teman
                            menghitung dengan kalkulator (belanja air
                            mineral, panjang jalur, air dalam gelas).
                            Murid MENDUGA mana jawaban yang wajar tanpa
                            menghitung persis + alasan (tidak dinilai).
     2. Masalah     (5')  — memilih rumusan masalah penyelidikan.
     3. Hipotesis   (7')  — memilih dugaan tentang aturan pembulatan,
                            arah taksiran, dan arti "wajar", lalu menulis
                            hipotesis dengan kalimat sendiri.
     4a. Data 1     (12') — Lab Pembulatan: garis bilangan dua titik
                            bulat & titik tengah, isian pembulatan
                            berdiagnosa (memotong, berantai, angka 5,
                            tempat salah, nol hilang), penjelajah
                            2,449 → satuan/persepuluhan/perseratusan.
     4b. Data 2     (12') — Lab Taksiran: membandingkan strategi (satuan
                            vs angka pertama), menaksir enam operasi +
                            − × : (termasuk bilangan negatif & bilangan
                            kompatibel), tabel data taksiran vs hasil
                            sebenarnya terisi otomatis.
     4c. Data 3     (8')  — Lab Kewajaran: memilah tujuh "jawaban
                            kalkulator" (wajar, koma bergeser, operasi
                            tertukar, tanda salah) dibantu meter
                            kewajaran.
     5. Uji         (8')  — dugaan & hipotesis vs data, menilai
                            pernyataan benar/salah.
     6. Simpulan    (5')  — menyusun kesimpulan dari bank kalimat.
     7. Uji terap   (10') — enam soal diambil acak dari bank empat belas
                            soal (isian berdiagnosa & pilihan ganda).
     8. Refleksi    (5')  — rekap, refleksi tertulis, penilaian diri.

   Notasi baku: pemisah desimal KOMA (2,5), pemisah ribuan TITIK
   (13.000). Di berkas ini bilangan ditulis tanpa titik ribuan
   ('48500') agar bisa dihitung eksak oleh engine; tampilannya
   diformat fmtBilanganBesar().

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Soal uji terap juga
   diambil acak dari bank.

   Konsistensi kunci jawaban diuji tests/mpi-2.6-data.test.js terhadap
   engine seksi 65 (bulatkanKeTempat, diagnosaPembulatan,
   taksirOperasi, arahTaksiran, nilaiKewajaran).
   ============================================================ */

var IL = 'Inquiry Learning';

var DATA = {
  meta: {
    judul: 'Pembulatan & Penaksiran untuk Menilai Kewajaran Jawaban',
  },

  tahap: [
    { id: 'orientasi', label: 'Orientasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'hipotesis', label: 'Hipotesis' },
    { id: 'dataBulat', label: 'Lab Bulat' },
    { id: 'dataTaksir', label: 'Lab Taksir' },
    { id: 'dataWajar', label: 'Lab Wajar' },
    { id: 'uji', label: 'Uji Hipotesis' },
    { id: 'simpulan', label: 'Simpulan' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Konteks yang dipakai di seluruh modul. */
  konteks: {
    belanja: { ikon: '🛒', nama: 'Belanja' },
    jalan: { ikon: '🥾', nama: 'Perjalanan' },
    dapur: { ikon: '🍲', nama: 'Dapur Kemah' },
    cuaca: { ikon: '🌡️', nama: 'Cuaca' },
    ukur: { ikon: '📏', nama: 'Ukuran' },
  },

  /* Nama strategi taksiran (engine taksirOperasi). */
  strategi: {
    satuan: 'bulatkan ke satuan terdekat',
    angkaPertama: 'bulatkan ke angka pertama (nilai tempat terbesar)',
    kompatibel: 'bilangan kompatibel (pembagi dibulatkan, yang dibagi diganti kelipatannya)',
  },

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI
     Tiga jawaban kalkulator. Dugaan TIDAK dinilai; diuji sendiri
     pada tahap Uji Hipotesis. `baku` = vonis nilaiKewajaran.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    syntax: IL + ' · Sintaks 1',
    goal: 'Mengamati tiga jawaban kalkulator dalam persiapan kemah, lalu menduga mana yang wajar tanpa menghitung persis.',
    tp: 'Menerapkan strategi pembulatan dan penaksiran (estimasi) hasil operasi aritmatika bilangan real untuk menilai kewajaran jawaban dalam masalah sehari-hari.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Membulatkan bilangan bulat dan desimal ke nilai tempat tertentu dengan aturan "kurang dari 5 tetap, 5 atau lebih naik".',
      'Menaksir hasil operasi +, −, ×, dan : dengan membulatkan bilangan lebih dulu (angka pertama, satuan, atau bilangan kompatibel).',
      'Menentukan apakah taksiran lebih besar atau lebih kecil daripada hasil sebenarnya.',
      'Menilai kewajaran jawaban dengan membandingkannya pada taksiran, serta mengenali kesalahan koma bergeser, operasi tertukar, dan tanda.',
      'Memakai pembulatan dan taksiran untuk mengambil keputusan dalam masalah sehari-hari (mis. uang cukup atau tidak).',
    ],
    guru: 'Tampilkan ketiga kartu. Minta pasangan murid memutuskan dalam 1 menit TANPA kalkulator dan tanpa menghitung persis. Jangan membenarkan atau menyalahkan — perbedaan pendapat dan alasan murid ("kok bisa jutaan?") menjadi bahan penyelidikan.',
    judul: 'Persiapan Kemah Kelas VII',
    pengantar:
      'Kelas VII-B akan berkemah di bumi perkemahan. Tiga panitia menghitung kebutuhan dengan kalkulator ponsel. Hasilnya langsung ditulis di papan pengumuman… tetapi apakah semuanya masuk akal?',
    kartu: [
      {
        id: 'kAir',
        konteks: 'belanja',
        siapa: 'Raka (bendahara)',
        teks: 'Membeli 6 dus air mineral, harga satu dus Rp48.500.',
        a: '48500',
        op: '×',
        b: '6',
        klaim: '2910000',
        satuan: 'rupiah',
      },
      {
        id: 'kJalur',
        konteks: 'jalan',
        siapa: 'Sinta (seksi acara)',
        teks: 'Jalur jelajah hari pertama 9,75 km, hari kedua 6,4 km.',
        a: '9,75',
        op: '+',
        b: '6,4',
        klaim: '16,15',
        satuan: 'km',
      },
      {
        id: 'kGelas',
        konteks: 'dapur',
        siapa: 'Dimas (seksi konsumsi)',
        teks: 'Air minum 4,8 liter dituang ke gelas-gelas 0,25 liter.',
        a: '4,8',
        op: ':',
        b: '0,25',
        klaim: '1,2',
        satuan: 'gelas',
      },
    ],
    opsiVonis: [
      { id: 'wajar', label: '👍 Wajar' },
      { id: 'tidak', label: '🚩 Tidak wajar' },
      { id: 'ragu', label: '🤷 Tidak bisa diketahui tanpa menghitung persis' },
    ],
    dugaan: [
      {
        id: 'dAir',
        kartu: 'kAir',
        tanya: 'Jawaban Raka: total harga air mineral Rp2.910.000. Menurutmu?',
        baku: 'tidak',
        pembahasan:
          'Taksiran 6 × Rp50.000 = Rp300.000. Jawaban Raka sekitar 10 kali lipat — koma/nol bergeser. Hasil sebenarnya Rp291.000.',
      },
      {
        id: 'dJalur',
        kartu: 'kJalur',
        tanya: 'Jawaban Sinta: panjang jalur 16,15 km. Menurutmu?',
        baku: 'wajar',
        pembahasan:
          'Taksiran 10 + 6 = 16 km, sangat dekat dengan 16,15 km. Jawabannya wajar (dan tepat).',
      },
      {
        id: 'dGelas',
        kartu: 'kGelas',
        tanya: 'Jawaban Dimas: cukup untuk 1,2 gelas. Menurutmu?',
        baku: 'tidak',
        pembahasan:
          'Taksiran 6 : 0,3 = 20 gelas. 1,2 adalah hasil 4,8 × 0,25 — operasinya tertukar. Hasil sebenarnya 19,2 → 19 gelas penuh.',
      },
    ],
    alasanLabel: 'Bagaimana kamu memutuskannya tanpa menghitung persis?',
    alasanPlaceholder: 'Aku membayangkan harga satu dus sekitar …',
    catatan:
      'Dugaanmu tidak dinilai. Simpan baik-baik — kamu sendiri yang akan mengujinya dengan data pada tahap Uji Hipotesis.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MERUMUSKAN MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: IL + ' · Sintaks 2',
    goal: 'Memilih pertanyaan penyelidikan yang bisa dijawab dengan mengumpulkan data.',
    guru: 'Bila murid memilih rumusan yang kurang tepat, tanyakan: "Kalau pertanyaan itu terjawab, apakah kita bisa menilai jawaban Raka, Sinta, DAN Dimas — juga jawaban lain yang belum kita lihat?"',
    pengantar:
      'Ketiga panitia memakai kalkulator, tetapi kalkulator hanya menghitung apa yang diketik. Salah ketik satu angka nol atau satu tombol operasi bisa membuat hasilnya kacau. Kita perlu cara CEPAT untuk memeriksa apakah sebuah jawaban masuk akal.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'r1',
        label:
          'Bagaimana cara membulatkan bilangan dan menaksir hasil operasi hitung untuk menilai apakah suatu jawaban wajar?',
      },
      { id: 'r2', label: 'Berapa harga satu dus air mineral di toko dekat sekolah?' },
      { id: 'r3', label: 'Merek kalkulator apa yang paling jarang salah?' },
      {
        id: 'r4',
        label: 'Bagaimana cara menghitung semua soal dengan tepat tanpa kalkulator sama sekali?',
      },
    ],
    correct: 'r1',
    umpan: {
      r1: 'Tepat. Pertanyaan ini berlaku umum dan bisa diselidiki dengan data: pembulatan, taksiran, lalu membandingkan jawaban.',
      r2: 'Itu hanya satu fakta harga. Jawabannya tidak membantu menilai jalur Sinta atau gelas Dimas.',
      r3: 'Kalkulator menghitung dengan benar apa yang DIKETIK. Masalahnya ada pada salah ketik, bukan mereknya.',
      r4: 'Menghitung tepat itu penting, tetapi lama. Kita mencari cara cepat untuk memeriksa kewajaran jawaban.',
    },
    nextLabel: 'Lanjut: Rumuskan Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MERUMUSKAN HIPOTESIS
     Pilihan TIDAK dinilai; `baku` dibandingkan pada tahap Uji.
     ---------------------------------------------------------- */
  hipotesis: {
    kicker: 'Tahap 3 · Merumuskan Hipotesis',
    syntax: IL + ' · Sintaks 3',
    goal: 'Menyusun dugaan sementara tentang pembulatan, taksiran, dan arti "jawaban wajar".',
    guru: 'Tekankan bahwa hipotesis boleh keliru — justru akan diuji dengan data. Minta setiap pasangan menuliskan hipotesis utamanya dalam satu atau dua kalimat.',
    pengantar:
      'Sebelum mengumpulkan data, tuliskan dulu apa yang kamu duga. Pilih jawaban yang paling sesuai dengan pendapatmu saat ini.',
    dugaan: [
      {
        id: 'h1',
        tanya: '2,47 km dibulatkan ke persepuluhan terdekat menjadi …',
        cek: { jenis: 'bulat', soal: '2,47', tempat: 'persepuluhan' },
        opsi: [
          { id: 'baku', label: '2,5 km' },
          { id: 'potong', label: '2,4 km' },
          { id: 'satuan', label: '2 km' },
          { id: 'tetap', label: '2,47 km (tidak berubah)' },
        ],
        baku: 'baku',
        pembahasan:
          'Angka di kanan persepuluhan adalah 7 (≥ 5), jadi angka 4 naik menjadi 5: 2,47 ≈ 2,5.',
      },
      {
        id: 'h2',
        tanya: 'Bilangan yang tepat berada di tengah, misalnya 3,45 ke persepuluhan, dibulatkan …',
        cek: { jenis: 'bulat', soal: '3,45', tempat: 'persepuluhan' },
        opsi: [
          { id: 'baku', label: 'ke atas: 3,5' },
          { id: 'bawah', label: 'ke bawah: 3,4' },
          { id: 'bebas', label: 'boleh ke atas atau ke bawah' },
        ],
        baku: 'baku',
        pembahasan: 'Menurut aturan pembulatan, angka penentu 5 dibulatkan ke atas: 3,45 ≈ 3,5.',
      },
      {
        id: 'h3',
        tanya: 'Taksiran 48,7 × 3,2 ≈ 50 × 3 dibandingkan dengan hasil sebenarnya akan …',
        cek: { jenis: 'arah', a: '48,7', op: '×', b: '3,2', strategi: 'angkaPertama' },
        opsi: [
          { id: 'baku', label: 'lebih kecil' },
          { id: 'lebih', label: 'lebih besar' },
          { id: 'sama', label: 'sama persis' },
          { id: 'acak', label: 'tidak bisa ditentukan' },
        ],
        baku: 'baku',
        pembahasan:
          '48,7 naik menjadi 50, tetapi 3,2 turun menjadi 3. Taksiran 150 ternyata lebih kecil daripada 155,84.',
      },
      {
        id: 'h4',
        tanya: 'Sebuah jawaban dianggap wajar bila …',
        opsi: [
          { id: 'baku', label: 'nilainya dekat dengan taksiran (tidak harus sama persis)' },
          { id: 'sama', label: 'nilainya sama persis dengan taksiran' },
          { id: 'kalkulator', label: 'dihitung dengan kalkulator' },
          { id: 'besar', label: 'nilainya bilangan besar' },
        ],
        baku: 'baku',
        pembahasan:
          'Taksiran hanya perkiraan. Jawaban wajar dekat dengan taksiran; jawaban 10 kali lipat atau bertanda berlawanan patut dicurigai.',
      },
    ],
    hipotesisLabel: 'Tulis hipotesismu dengan kalimatmu sendiri',
    hipotesisPlaceholder:
      'Contoh: aku menduga sebuah jawaban wajar jika hasilnya dekat dengan hitungan bilangan yang sudah dibulatkan, misalnya …',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — MENGUMPULKAN DATA: LAB PEMBULATAN
     Isian jenis 'bulat' diperiksa diagnosaPembulatan (engine 65).
     ---------------------------------------------------------- */
  dataBulat: {
    kicker: 'Tahap 4 · Mengumpulkan Data (1)',
    syntax: IL + ' · Sintaks 4',
    goal: 'Mengumpulkan data pembulatan pada garis bilangan, lalu menemukan angka yang menentukan arah pembulatan.',
    guru: 'Minta murid menunjuk dua titik bulat terdekat dan titik tengahnya sebelum mengetik. Bila muncul diagnosa "berantai", ajak murid membandingkan 2,449 dengan titik tengah 2,45 pada garis bilangan.',
    pengantar:
      'Setiap bilangan di bawah terletak di antara dua bilangan "bulat" pada tempat yang diminta. Amati letaknya terhadap titik tengah, lalu tulis hasil pembulatannya.',
    percobaan: [
      {
        id: 'b1',
        konteks: 'jalan',
        cerita: 'Aplikasi peta mencatat jalur jelajah 12,47 km.',
        soal: '12,47',
        tempat: 'persepuluhan',
        satuan: 'km',
        hints: [
          'Persepuluhan = satu angka di belakang koma. 12,47 terletak di antara 12,4 dan 12,5.',
          'Titik tengahnya 12,45. Angka di kanan persepuluhan adalah 7.',
        ],
      },
      {
        id: 'b2',
        konteks: 'dapur',
        cerita: 'Timbangan menunjukkan beras 3,45 kg.',
        soal: '3,45',
        tempat: 'persepuluhan',
        satuan: 'kg',
        hints: [
          '3,45 terletak di antara 3,4 dan 3,5.',
          '3,45 TEPAT di titik tengah. Angka penentu 5 dibulatkan ke atas.',
        ],
      },
      {
        id: 'b3',
        konteks: 'belanja',
        cerita: 'Harga satu tenda dome Rp48.750.',
        soal: '48750',
        tempat: 'ribuan',
        satuan: 'rupiah',
        hints: [
          '48.750 terletak di antara 48.000 dan 49.000; titik tengahnya 48.500.',
          'Angka di kanan tempat ribuan adalah 7 (ratusan). Ganti angka di kanannya dengan 0.',
        ],
      },
      {
        id: 'b4',
        konteks: 'dapur',
        cerita: 'Air di panci tersisa 2,449 liter.',
        soal: '2,449',
        tempat: 'persepuluhan',
        satuan: 'liter',
        hints: [
          '2,449 terletak di antara 2,4 dan 2,5; titik tengahnya 2,45.',
          'Lihat HANYA satu angka di kanan persepuluhan: 4. Jangan membulatkan dari angka paling kanan.',
        ],
      },
      {
        id: 'b5',
        konteks: 'cuaca',
        cerita: 'Suhu dini hari di puncak bukit −3,62 °C.',
        soal: '-3,62',
        tempat: 'satuan',
        satuan: '°C',
        hints: [
          '−3,62 terletak di antara −3 dan −4 pada garis bilangan.',
          'Angka di kanan satuan adalah 6 (≥ 5), jadi menjauh dari nol: −4.',
        ],
      },
    ],
    jelajah: {
      judul: '🔍 Penjelajah: satu bilangan, tiga tempat',
      teks: 'Bilangan 2,449 dibulatkan ke tempat yang berbeda. Ketuk tempatnya dan amati garis bilangannya.',
      soal: '2,449',
      tempat: [
        { id: 'satuan', label: 'Satuan' },
        { id: 'persepuluhan', label: 'Persepuluhan' },
        { id: 'perseratusan', label: 'Perseratusan' },
      ],
    },
    temuan: [
      {
        id: 'q1',
        tanya: 'Dari data, apa yang menentukan bilangan dibulatkan ke atas atau ke bawah?',
        opsi: [
          { id: 'kanan', label: 'Satu angka tepat di kanan tempat pembulatan' },
          { id: 'ujung', label: 'Angka paling kanan dari bilangan itu' },
          { id: 'kiri', label: 'Angka paling kiri dari bilangan itu' },
          { id: 'besar', label: 'Besar kecilnya seluruh bilangan' },
        ],
        correct: 'kanan',
        umpan: {
          kanan:
            'Tepat. Angka penentu itu menunjukkan bilangan berada sebelum atau sesudah titik tengah.',
          ujung:
            'Coba lihat 2,449: angka paling kanannya 9, tetapi hasilnya 2,4. Angka paling kanan tidak menentukan.',
          kiri: 'Angka paling kiri hanya menunjukkan besarnya bilangan, bukan arah pembulatan.',
          besar:
            '12,47 dan 2,449 sama-sama "besar", tetapi arah pembulatannya berbeda. Lihat angka penentunya.',
        },
      },
      {
        id: 'q2',
        tanya: 'Bilangan yang tepat di titik tengah (seperti 3,45) dibulatkan …',
        opsi: [
          { id: 'atas', label: 'ke atas' },
          { id: 'bawah', label: 'ke bawah' },
          { id: 'tetap', label: 'tidak dibulatkan' },
        ],
        correct: 'atas',
        umpan: {
          atas: 'Tepat. Kesepakatan pembulatan: angka penentu 5 dibulatkan ke atas (menjauh dari nol).',
          bawah: 'Periksa lagi data 3,45 kg. Hasil pembulatannya 3,5, bukan 3,4.',
          tetap:
            'Pembulatan selalu menghasilkan bilangan pada tempat yang diminta, termasuk untuk 3,45.',
        },
      },
      {
        id: 'q3',
        tanya: 'Mengapa 2,449 dibulatkan ke persepuluhan menjadi 2,4, bukan 2,5?',
        opsi: [
          {
            id: 'sekali',
            label: 'Karena pembulatan dilakukan sekali: angka penentunya 4, dan 2,449 < 2,45',
          },
          { id: 'berantai', label: 'Karena 9 membuat 4 naik, lalu 5 membuat 4 naik lagi' },
          { id: 'potong', label: 'Karena angka di belakang persepuluhan selalu dibuang' },
        ],
        correct: 'sekali',
        umpan: {
          sekali:
            'Tepat. Pembulatan berantai (2,449 → 2,45 → 2,5) menggeser bilangan melewati titik tengah.',
          berantai:
            'Itu pembulatan berantai. Pada garis bilangan, 2,449 berada SEBELUM titik tengah 2,45, jadi lebih dekat ke 2,4.',
          potong:
            'Bila selalu dibuang, 12,47 akan menjadi 12,4 — padahal hasilnya 12,5. Yang menentukan angka penentunya.',
        },
      },
    ],
    nextLabel: 'Lanjut: Lab Taksiran →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — MENGUMPULKAN DATA: LAB TAKSIRAN
     Isian jenis 'taksir' diperiksa diagnosaTaksiran (engine 65).
     ---------------------------------------------------------- */
  dataTaksir: {
    kicker: 'Tahap 4 · Mengumpulkan Data (2)',
    syntax: IL + ' · Sintaks 4',
    goal: 'Menaksir hasil operasi dengan bilangan bulatan, lalu membandingkan taksiran dengan hasil sebenarnya.',
    guru: 'Minta murid menghitung taksiran di kepala (tanpa kalkulator). Setelah tabel data penuh, tanyakan: "Kapan taksiran lebih besar? Kapan lebih kecil?" — jawabannya bergantung pada arah pembulatan setiap bilangan.',
    banding: {
      judul: '⚖️ Bandingkan dua strategi',
      teks: 'Seksi konsumsi memesan 48,7 kg sayur dengan harga 3,2 ribu rupiah per kg. Pilih strategi pembulatan dan amati taksirannya.',
      a: '48,7',
      op: '×',
      b: '3,2',
      opsi: [
        { id: 'satuan', label: 'Satuan terdekat' },
        { id: 'angkaPertama', label: 'Angka pertama' },
      ],
      catatan:
        'Strategi satuan lebih dekat ke hasil sebenarnya, tetapi strategi angka pertama paling mudah dihitung di kepala.',
    },
    pengantar:
      'Tulis taksiran setiap operasi. Bulatkan dulu setiap bilangan sesuai strategi, lalu hitung dengan bilangan bulatan. Hasil sebenarnya akan muncul di tabel data setelah taksiranmu benar.',
    percobaan: [
      {
        id: 'p1',
        konteks: 'belanja',
        cerita: '6 dus air mineral, satu dus Rp48.500.',
        a: '48500',
        op: '×',
        b: '6',
        strategi: 'angkaPertama',
        satuan: 'rupiah',
        hints: ['48.500 ≈ 50.000; 6 tetap 6.', '50.000 × 6 = 300.000.'],
      },
      {
        id: 'p2',
        konteks: 'jalan',
        cerita: 'Jalur hari pertama 9,75 km dan hari kedua 6,4 km.',
        a: '9,75',
        op: '+',
        b: '6,4',
        strategi: 'satuan',
        satuan: 'km',
        hints: ['9,75 ≈ 10 dan 6,4 ≈ 6.', '10 + 6 = 16.'],
      },
      {
        id: 'p3',
        konteks: 'dapur',
        cerita: 'Air 4,8 liter dituang ke gelas 0,25 liter.',
        a: '4,8',
        op: ':',
        b: '0,25',
        strategi: 'kompatibel',
        satuan: 'gelas',
        hints: [
          'Pembagi 0,25 ≈ 0,3. Cari kelipatan 0,3 yang dekat dengan 4,8 dan mudah dibagi: 6.',
          '6 : 0,3 = 60 : 3 = 20.',
        ],
      },
      {
        id: 'p4',
        konteks: 'belanja',
        cerita: '48,7 kg sayur, harga 3,2 ribu rupiah per kg.',
        a: '48,7',
        op: '×',
        b: '3,2',
        strategi: 'angkaPertama',
        satuan: 'ribu rupiah',
        hints: ['48,7 ≈ 50 dan 3,2 ≈ 3.', '50 × 3 = 150.'],
      },
      {
        id: 'p5',
        konteks: 'cuaca',
        cerita: 'Suhu −18,6 °C di ruang pendingin naik 7,3 °C saat pintunya dibuka.',
        a: '-18,6',
        op: '+',
        b: '7,3',
        strategi: 'satuan',
        satuan: '°C',
        hints: ['−18,6 ≈ −19 dan 7,3 ≈ 7.', '−19 + 7 = −12.'],
      },
      {
        id: 'p6',
        konteks: 'ukur',
        cerita: 'Tali 61,5 m dipotong 18,9 m untuk tiang bendera.',
        a: '61,5',
        op: '−',
        b: '18,9',
        strategi: 'angkaPertama',
        satuan: 'm',
        hints: ['61,5 ≈ 60 dan 18,9 ≈ 20.', '60 − 20 = 40.'],
      },
    ],
    temuan: [
      {
        id: 'q1',
        tanya: 'Mengapa taksiran bisa dihitung lebih cepat daripada hasil sebenarnya?',
        opsi: [
          { id: 'mudah', label: 'Bilangan bulatan mudah dihitung di kepala' },
          { id: 'tepat', label: 'Taksiran selalu sama dengan hasil sebenarnya' },
          { id: 'kecil', label: 'Taksiran selalu lebih kecil' },
        ],
        correct: 'mudah',
        umpan: {
          mudah: 'Tepat. 50.000 × 6 jauh lebih mudah daripada 48.500 × 6.',
          tepat: 'Lihat tabel data: taksiran 300.000, hasil sebenarnya 291.000. Tidak sama persis.',
          kecil: 'Lihat tabel data: ada taksiran yang lebih besar dan ada yang lebih kecil.',
        },
      },
      {
        id: 'q2',
        tanya:
          'Taksiran 6 dus air mineral (Rp300.000) lebih besar daripada hasil sebenarnya karena …',
        opsi: [
          { id: 'naik', label: '48.500 dibulatkan ke atas menjadi 50.000' },
          { id: 'kali', label: 'perkalian selalu memperbesar taksiran' },
          { id: 'enam', label: '6 dibulatkan ke atas' },
        ],
        correct: 'naik',
        umpan: {
          naik: 'Tepat. Bilangan yang dibulatkan ke atas membuat taksiran lebih besar.',
          kali: 'Periksa 48,7 × 3,2: taksirannya justru lebih kecil (150 < 155,84).',
          enam: '6 sudah bulat dan tidak berubah. Yang berubah adalah 48.500.',
        },
      },
      {
        id: 'q3',
        tanya: 'Untuk pembagian 4,8 : 0,25, strategi yang paling memudahkan adalah …',
        opsi: [
          {
            id: 'kompatibel',
            label: 'bilangan kompatibel: 0,25 ≈ 0,3 dan 4,8 diganti 6 (kelipatan 0,3)',
          },
          { id: 'satuan', label: 'membulatkan keduanya ke satuan: 5 : 0' },
          { id: 'potong', label: 'membuang semua angka di belakang koma' },
        ],
        correct: 'kompatibel',
        umpan: {
          kompatibel: 'Tepat. 6 : 0,3 = 20 bisa dihitung di kepala dan dekat dengan 19,2.',
          satuan:
            '0,25 dibulatkan ke satuan menjadi 0, dan pembagian dengan 0 tidak bisa dilakukan!',
          potong: 'Membuang angka di belakang koma membuat 0,25 menjadi 0 — tidak bisa membagi.',
        },
      },
      {
        id: 'q4',
        tanya: 'Bendahara membawa uang pas-pasan. Agar uang pasti cukup, harga barang sebaiknya …',
        opsi: [
          { id: 'atas', label: 'dibulatkan ke atas sebelum dijumlahkan' },
          { id: 'bawah', label: 'dibulatkan ke bawah sebelum dijumlahkan' },
          { id: 'abaikan', label: 'tidak perlu ditaksir' },
        ],
        correct: 'atas',
        umpan: {
          atas: 'Tepat. Taksiran ke atas lebih besar daripada total sebenarnya — kalau taksiran cukup, total pasti cukup.',
          bawah:
            'Taksiran ke bawah lebih kecil daripada total sebenarnya, jadi uang bisa kurang saat membayar.',
          abaikan: 'Justru taksiran membantu memutuskan cepat di toko sebelum sampai kasir.',
        },
      },
    ],
    nextLabel: 'Lanjut: Lab Kewajaran →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — MENGUMPULKAN DATA: LAB KEWAJARAN
     `correct` = kategori dari nilaiKewajaran (engine 65):
       tepat/wajar → 'wajar', koma-geser → 'koma',
       operasi-tertukar → 'tukar', tanda → 'tanda'.
     ---------------------------------------------------------- */
  dataWajar: {
    kicker: 'Tahap 4 · Mengumpulkan Data (3)',
    syntax: IL + ' · Sintaks 4',
    goal: 'Membandingkan jawaban kalkulator dengan taksirannya untuk mengelompokkan jawaban wajar dan jenis kesalahannya.',
    guru: 'Minta murid menaksir dulu di buku sebelum memilih. Meter kewajaran muncul setelah memilih sebagai data pembanding. Diskusikan: "Apakah jawaban wajar pasti tepat?" (lihat jawaban Lala).',
    pengantar:
      'Tujuh panitia lain juga memakai kalkulator. Taksir dulu setiap soal, lalu kelompokkan jawabannya.',
    kategori: [
      { id: 'wajar', label: '✓ Wajar' },
      { id: 'koma', label: '✗ Koma/nol bergeser' },
      { id: 'tukar', label: '✗ Operasi tertukar' },
      { id: 'tanda', label: '✗ Tanda salah' },
    ],
    jawaban: [
      {
        id: 'w1',
        siapa: 'Raka',
        a: '48500',
        op: '×',
        b: '6',
        klaim: '2910000',
        correct: 'koma',
        explanation:
          'Taksiran 50.000 × 6 = 300.000. Rp2.910.000 sekitar 10 kali lipat — ada nol berlebih. Hasil sebenarnya Rp291.000.',
      },
      {
        id: 'w2',
        siapa: 'Sinta',
        a: '9,75',
        op: '+',
        b: '6,4',
        klaim: '16,15',
        correct: 'wajar',
        explanation: 'Taksiran 10 + 6 = 16. Jawaban 16,15 dekat dengan taksiran.',
      },
      {
        id: 'w3',
        siapa: 'Dimas',
        a: '4,8',
        op: ':',
        b: '0,25',
        klaim: '1,2',
        correct: 'tukar',
        explanation:
          'Taksiran 6 : 0,3 = 20. Jawaban 1,2 adalah hasil 4,8 × 0,25 — tombol × dan : tertukar.',
      },
      {
        id: 'w4',
        siapa: 'Maya',
        a: '61,5',
        op: '−',
        b: '18,9',
        klaim: '4,26',
        correct: 'koma',
        explanation:
          'Taksiran 60 − 20 = 40. Jawaban 4,26 sepuluh kali lebih kecil — komanya bergeser. Seharusnya 42,6.',
      },
      {
        id: 'w5',
        siapa: 'Bima',
        a: '-18,6',
        op: '+',
        b: '7,3',
        klaim: '11,3',
        correct: 'tanda',
        explanation:
          'Taksiran −20 + 7 = −13 (negatif). Jawaban 11,3 bertanda positif. Seharusnya −11,3 °C.',
      },
      {
        id: 'w6',
        siapa: 'Lala',
        a: '12,5',
        op: '×',
        b: '3,8',
        klaim: '47,6',
        correct: 'wajar',
        explanation:
          'Taksiran 10 × 4 = 40, dan 47,6 dekat dengan taksiran — wajar. Namun hasil tepatnya 47,5: wajar belum tentu tepat!',
      },
      {
        id: 'w7',
        siapa: 'Tono',
        a: '2437',
        op: ':',
        b: '8',
        klaim: '30,4625',
        correct: 'koma',
        explanation:
          'Taksiran 2.400 : 8 = 300. Jawaban 30,4625 sepuluh kali lebih kecil. Seharusnya 304,625.',
      },
    ],
    nextLabel: 'Lanjut: Uji Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGUJI HIPOTESIS
     `cek` dipakai tes untuk mencocokkan kunci dengan engine.
     ---------------------------------------------------------- */
  uji: {
    kicker: 'Tahap 5 · Menguji Hipotesis',
    syntax: IL + ' · Sintaks 5',
    goal: 'Menguji pernyataan dengan data yang dikumpulkan, lalu membandingkan dugaan dan hipotesis awal dengan temuan.',
    guru: 'Minta murid membuktikan setiap pernyataan dengan data dari ketiga lab (garis bilangan, tabel taksiran, meter kewajaran), bukan dengan menebak. Bahas khusus pernyataan "wajar pasti tepat".',
    judulA: 'A. Benar atau salah menurut datamu?',
    opsiPernyataan: [
      { id: 'benar', label: '✓ Benar' },
      { id: 'salah', label: '✗ Salah' },
    ],
    pernyataan: [
      {
        id: 'v1',
        teks: 'Taksiran selalu sama dengan hasil sebenarnya.',
        correct: 'salah',
        explanation: 'Contoh: taksiran 50 × 3 = 150, hasil sebenarnya 48,7 × 3,2 = 155,84.',
      },
      {
        id: 'v2',
        teks: '3,45 dibulatkan ke persepuluhan terdekat menjadi 3,4.',
        correct: 'salah',
        cek: { jenis: 'bulat', soal: '3,45', tempat: 'persepuluhan', klaim: '3,4' },
        explanation: 'Angka penentu 5 dibulatkan ke atas: 3,45 ≈ 3,5.',
      },
      {
        id: 'v3',
        teks: 'Bila semua bilangan positif pada perkalian dibulatkan ke atas, taksirannya lebih besar daripada hasil sebenarnya.',
        correct: 'benar',
        explanation: 'Contoh: 48.500 × 6 ≈ 50.000 × 6 = 300.000 > 291.000.',
      },
      {
        id: 'v4',
        teks: 'Jawaban yang 10 kali lipat dari taksirannya patut dicurigai.',
        correct: 'benar',
        explanation:
          'Jawaban Raka (Rp2.910.000) dan Maya (4,26) menunjukkan koma atau nol yang bergeser.',
      },
      {
        id: 'v5',
        teks: '2,449 dibulatkan ke persepuluhan terdekat menjadi 2,5.',
        correct: 'salah',
        cek: { jenis: 'bulat', soal: '2,449', tempat: 'persepuluhan', klaim: '2,5' },
        explanation:
          'Angka penentunya 4, jadi 2,449 ≈ 2,4. Hasil 2,5 muncul dari pembulatan berantai.',
      },
      {
        id: 'v6',
        teks: 'Jawaban yang wajar pasti tepat.',
        correct: 'salah',
        explanation:
          'Jawaban Lala 47,6 wajar (dekat dengan taksiran 40), tetapi hasil tepatnya 47,5.',
      },
      {
        id: 'v7',
        teks: '48.750 dibulatkan ke ribuan terdekat menjadi 49.000.',
        correct: 'benar',
        cek: { jenis: 'bulat', soal: '48750', tempat: 'ribuan', klaim: '49000' },
        explanation: 'Angka di kanan ribuan adalah 7 (≥ 5), jadi 48 ribu naik menjadi 49 ribu.',
      },
    ],
    judulB: 'B. Bandingkan dengan dugaan & hipotesismu',
    nextLabel: 'Lanjut: Rumuskan Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MERUMUSKAN KESIMPULAN
     ---------------------------------------------------------- */
  simpulan: {
    kicker: 'Tahap 6 · Merumuskan Kesimpulan',
    syntax: IL + ' · Sintaks 6',
    goal: 'Merumuskan aturan pembulatan, strategi penaksiran, dan cara menilai kewajaran jawaban.',
    guru: 'Minta beberapa pasangan membacakan kesimpulannya dengan kalimat sendiri sebelum memeriksa. Tuliskan rangkuman di papan tulis sebagai "Daftar Periksa Kewajaran".',
    instruksi:
      'Lengkapi setiap kalimat dengan memilih potongan yang tepat. Setiap potongan hanya dipakai sekali, dan ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      {
        id: 'g1',
        awal: 'Untuk membulatkan ke suatu tempat, lihat satu angka tepat di kanannya:',
        correct: 'b1',
      },
      { id: 'g2', awal: 'Pembulatan dilakukan', correct: 'b2' },
      { id: 'g3', awal: 'Untuk menaksir hasil operasi hitung,', correct: 'b3' },
      { id: 'g4', awal: 'Pada pembagian, taksiran lebih mudah dengan', correct: 'b4' },
      {
        id: 'g5',
        awal: 'Saat berbelanja dengan uang terbatas, harga barang sebaiknya',
        correct: 'b5',
      },
      { id: 'g6', awal: 'Sebuah jawaban dikatakan wajar bila', correct: 'b6' },
    ],
    bank: [
      { id: 'b1', teks: 'kurang dari 5 → tetap; 5 atau lebih → angka pada tempat itu naik satu.' },
      {
        id: 'b2',
        teks: 'sekali saja dari bilangan aslinya, bukan berantai dari angka paling kanan.',
      },
      {
        id: 'b3',
        teks: 'bulatkan setiap bilangan lebih dulu, lalu hitung dengan bilangan bulatan.',
      },
      {
        id: 'b4',
        teks: 'bilangan kompatibel: pembagi dibulatkan, yang dibagi diganti kelipatannya.',
      },
      { id: 'b5', teks: 'dibulatkan ke atas agar uang pasti cukup.' },
      {
        id: 'b6',
        teks: 'nilainya dekat dengan taksiran; jika 10 kali lipat, bertanda berlawanan, atau jauh, periksa lagi.',
      },
      { id: 'x1', teks: 'angka paling kanan yang menentukan arah pembulatan.' },
      { id: 'x2', teks: 'dibulatkan ke bawah agar belanjaan terlihat lebih murah.' },
      { id: 'x3', teks: 'nilainya sama persis dengan taksiran.' },
    ],
    rangkuman: [
      '<strong>Pembulatan</strong>: 2,47 ≈ 2,5 (angka penentu 7); 3,45 ≈ 3,5 (5 naik); 2,449 ≈ 2,4 (sekali, bukan berantai); 48.750 ≈ 49.000 (ribuan).',
      '<strong>Taksiran</strong>: 48,7 × 3,2 ≈ 50 × 3 = 150; 9,75 + 6,4 ≈ 10 + 6 = 16.',
      '<strong>Bilangan kompatibel</strong>: 4,8 : 0,25 ≈ 6 : 0,3 = 20.',
      '<strong>Arah taksiran</strong>: bilangan dibulatkan ke atas → taksiran cenderung lebih besar; untuk belanja, bulatkan ke atas.',
      '<strong>Kewajaran</strong>: bandingkan jawaban dengan taksiran. Curigai jawaban 10 kali lipat (koma bergeser), hasil operasi lain, atau tanda berlawanan.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Enam soal diambil acak dari bank (komposisi per jenis).
     Isian: jenis 'bulat' → diagnosaPembulatan; 'taksir' →
     diagnosaTaksiran. Pilihan ganda: `cek` dipakai tes.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan pembulatan dan penaksiran untuk menilai kewajaran jawaban dan mengambil keputusan dalam masalah sehari-hari.',
    guru: 'Setiap murid mendapat soal acak yang berbeda. Minta murid menuliskan kalimat taksirannya di buku sebelum menjawab, lalu bandingkan strategi antarpasangan.',
    instruksi:
      'Tulis kalimat taksiran atau pembulatannya di bukumu, lalu jawab. Gunakan koma untuk desimal (mis. 2,5) dan titik untuk ribuan (mis. 13.000).',
    banyak: 6,
    komposisi: { input: 3, choice: 3 },
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: 'ukur',
        jenis: 'bulat',
        soal: '156,48',
        tempat: 'persepuluhan',
        satuan: 'cm',
        cerita: 'Tinggi badan Nanda diukur 156,48 cm.',
        pertanyaan: 'Bulatkan tinggi badan Nanda ke persepuluhan terdekat.',
        hints: ['156,48 terletak di antara 156,4 dan 156,5.', 'Angka penentunya 8 (≥ 5).'],
        reveal: '156,48 ≈ 156,5 cm.',
        explanation: 'Angka penentu 8 membuat angka persepuluhan naik dari 4 menjadi 5.',
      },
      {
        id: 't2',
        type: 'input',
        konteks: 'belanja',
        jenis: 'bulat',
        soal: '387650',
        tempat: 'ribuan',
        satuan: 'rupiah',
        cerita: 'Harga sebuah tenda keluarga Rp387.650.',
        pertanyaan: 'Bulatkan harga tenda ke ribuan terdekat.',
        hints: ['387.650 terletak di antara 387.000 dan 388.000.', 'Angka penentunya 6 (ratusan).'],
        reveal: '387.650 ≈ 388.000 rupiah.',
        explanation: 'Angka ratusan 6 ≥ 5, jadi 387 ribu naik menjadi 388 ribu.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: 'cuaca',
        jenis: 'bulat',
        soal: '-5,57',
        tempat: 'satuan',
        satuan: '°C',
        cerita: 'Termometer di puncak gunung menunjukkan −5,57 °C.',
        pertanyaan: 'Bulatkan suhu itu ke satuan terdekat.',
        hints: ['−5,57 terletak di antara −5 dan −6.', 'Angka penentunya 5 → menjauh dari nol.'],
        reveal: '−5,57 ≈ −6 °C.',
        explanation: 'Angka penentu 5 dibulatkan menjauh dari nol, menjadi −6.',
      },
      {
        id: 't4',
        type: 'input',
        konteks: 'jalan',
        jenis: 'bulat',
        soal: '2,96',
        tempat: 'persepuluhan',
        satuan: 'km',
        cerita: 'Jarak lari pagi peserta kemah 2,96 km.',
        pertanyaan: 'Bulatkan jarak itu ke persepuluhan terdekat.',
        hints: [
          '2,96 terletak di antara 2,9 dan 3,0.',
          'Angka penentunya 6, jadi 9 persepuluh naik.',
        ],
        reveal: '2,96 ≈ 3,0 km.',
        explanation:
          '9 persepuluh naik satu menjadi 10 persepuluh = 1 satuan, sehingga 2,96 ≈ 3,0.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: 'belanja',
        jenis: 'taksir',
        a: '19800',
        op: '×',
        b: '7',
        strategi: 'angkaPertama',
        satuan: 'rupiah',
        cerita: 'Panitia membeli 7 kotak nasi seharga Rp19.800 per kotak.',
        pertanyaan: 'Taksir total harganya dengan membulatkan ke angka pertama.',
        hints: ['19.800 ≈ 20.000.', '20.000 × 7 = …'],
        reveal: 'Taksiran 20.000 × 7 = 140.000 rupiah.',
        explanation: 'Hasil sebenarnya Rp138.600, dekat dengan taksiran Rp140.000.',
      },
      {
        id: 't6',
        type: 'input',
        konteks: 'jalan',
        jenis: 'taksir',
        a: '28,6',
        op: '+',
        b: '41,3',
        strategi: 'angkaPertama',
        satuan: 'km',
        cerita: 'Bus menempuh 28,6 km sebelum istirahat dan 41,3 km sesudahnya.',
        pertanyaan: 'Taksir jarak totalnya dengan membulatkan ke angka pertama.',
        hints: ['28,6 ≈ 30 dan 41,3 ≈ 40.', '30 + 40 = …'],
        reveal: 'Taksiran 30 + 40 = 70 km.',
        explanation: 'Hasil sebenarnya 69,9 km, sangat dekat dengan taksiran 70 km.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: 'dapur',
        jenis: 'taksir',
        a: '358',
        op: ':',
        b: '6,8',
        strategi: 'kompatibel',
        satuan: 'porsi',
        cerita: 'Tersedia 358 ons beras; satu porsi makan siang seluruh regu memerlukan 6,8 ons.',
        pertanyaan: 'Taksir banyak porsi dengan bilangan kompatibel.',
        hints: ['6,8 ≈ 7. Kelipatan 7 yang dekat dengan 358 dan mudah: 350.', '350 : 7 = …'],
        reveal: 'Taksiran 350 : 7 = 50 porsi.',
        explanation: 'Hasil sebenarnya sekitar 52,6 porsi, dekat dengan taksiran 50.',
      },
      {
        id: 'c1',
        type: 'choice',
        konteks: 'ukur',
        cerita: 'Alas tenda berukuran 39,8 dm × 5,1 dm.',
        pertanyaan: 'Taksiran luas alas yang paling tepat adalah …',
        cek: { jenis: 'taksir', a: '39,8', op: '×', b: '5,1' },
        options: [
          { id: 'a', label: '200 dm²' },
          { id: 'b', label: '2.000 dm²' },
          { id: 'c', label: '20 dm²' },
          { id: 'd', label: '45 dm²' },
        ],
        correct: 'a',
        explanation: '39,8 ≈ 40 dan 5,1 ≈ 5, jadi 40 × 5 = 200. Hasil sebenarnya 202,98 dm².',
      },
      {
        id: 'c2',
        type: 'choice',
        konteks: 'belanja',
        cerita: 'Kalkulator Fitri: 12 bungkus kopi @ Rp9.850 = Rp1.182.000.',
        pertanyaan: 'Apakah jawaban Fitri wajar?',
        cek: { jenis: 'wajar', a: '9850', op: '×', b: '12', klaim: '1182000' },
        options: [
          { id: 'a', label: 'Tidak wajar — taksirannya sekitar Rp100.000, nolnya berlebih' },
          { id: 'b', label: 'Wajar — kalkulator tidak pernah salah' },
          { id: 'c', label: 'Wajar — hasilnya memang jutaan' },
          { id: 'd', label: 'Tidak bisa dinilai tanpa menghitung persis' },
        ],
        correct: 'a',
        explanation:
          '10.000 × 10 = 100.000. Rp1.182.000 sekitar 10 kali lipat; seharusnya Rp118.200.',
      },
      {
        id: 'c3',
        type: 'choice',
        konteks: 'belanja',
        cerita:
          'Kamu membawa Rp50.000 untuk membeli 3 bungkus roti @ Rp8.900 dan sekotak susu Rp17.500.',
        pertanyaan: 'Dengan membulatkan setiap harga ke atas (ribuan), apakah uangmu cukup?',
        cek: { jenis: 'cukup', uang: '50000', harga: ['8900', '8900', '8900', '17500'] },
        options: [
          { id: 'a', label: 'Cukup — taksirannya 3 × 9.000 + 18.000 = 45.000' },
          { id: 'b', label: 'Tidak cukup — taksirannya lebih dari 50.000' },
          { id: 'c', label: 'Cukup — taksirannya 3 × 8.000 + 17.000 = 41.000' },
          { id: 'd', label: 'Tidak bisa diketahui tanpa kalkulator' },
        ],
        correct: 'a',
        explanation:
          'Dibulatkan ke atas, taksirannya 45.000 ≤ 50.000. Karena taksiran ke atas lebih besar daripada total sebenarnya (44.200), uangmu pasti cukup.',
      },
      {
        id: 'c4',
        type: 'choice',
        konteks: 'cuaca',
        cerita: 'Suhu malam −2,6 °C, lalu turun 4,8 °C menjelang subuh. Kalkulator Ani: 2,2 °C.',
        pertanyaan: 'Apakah jawaban Ani wajar?',
        cek: { jenis: 'wajar', a: '-2,6', op: '−', b: '4,8', klaim: '2,2' },
        options: [
          { id: 'a', label: 'Tidak wajar — taksirannya −3 − 5 = −8, jadi hasilnya pasti negatif' },
          { id: 'b', label: 'Wajar — 2,2 dekat dengan 2,6' },
          { id: 'c', label: 'Wajar — suhu naik menjelang subuh' },
          { id: 'd', label: 'Tidak bisa dinilai tanpa menghitung persis' },
        ],
        correct: 'a',
        explanation: 'Suhu turun dari bilangan negatif tetap negatif. Hasil sebenarnya −7,4 °C.',
      },
      {
        id: 'c5',
        type: 'choice',
        konteks: 'dapur',
        cerita: 'Gula 612 gram dibagi ke kantong-kantong kecil berisi 2,9 gram.',
        pertanyaan: 'Taksiran banyak kantong yang paling tepat adalah …',
        cek: { jenis: 'taksir', a: '612', op: ':', b: '2,9' },
        options: [
          { id: 'a', label: '200 kantong' },
          { id: 'b', label: '20 kantong' },
          { id: 'c', label: '2.000 kantong' },
          { id: 'd', label: '1.800 kantong' },
        ],
        correct: 'a',
        explanation: 'Bilangan kompatibel: 2,9 ≈ 3 dan 612 ≈ 600, jadi 600 : 3 = 200.',
      },
      {
        id: 'c6',
        type: 'choice',
        konteks: 'ukur',
        cerita: 'Panjang tali jemuran 4,75 m.',
        pertanyaan: 'Panjang tali dibulatkan ke satuan terdekat adalah …',
        cek: { jenis: 'bulat', soal: '4,75', tempat: 'satuan' },
        options: [
          { id: 'a', label: '5 m' },
          { id: 'b', label: '4 m' },
          { id: 'c', label: '4,8 m' },
          { id: 'd', label: '4,7 m' },
        ],
        correct: 'a',
        explanation: 'Angka penentunya 7 (persepuluhan), jadi 4 naik menjadi 5.',
      },
      {
        id: 'c7',
        type: 'choice',
        konteks: 'belanja',
        cerita: 'Empat teman menghitung 18,4 × 0,52 dengan kalkulator.',
        pertanyaan: 'Jawaban mana yang wajar?',
        cek: {
          jenis: 'pilihWajar',
          a: '18,4',
          op: '×',
          b: '0,52',
          klaim: { a: '9,568', b: '95,68', c: '0,9568', d: '-9,568' },
        },
        options: [
          { id: 'a', label: '9,568' },
          { id: 'b', label: '95,68' },
          { id: 'c', label: '0,9568' },
          { id: 'd', label: '−9,568' },
        ],
        correct: 'a',
        explanation:
          'Taksiran 20 × 0,5 = 10. Hanya 9,568 yang dekat dengan 10; 95,68 dan 0,9568 komanya bergeser, −9,568 tandanya salah.',
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
    goal: 'Merefleksikan proses menyelidiki pembulatan, taksiran, dan kewajaran jawaban.',
    guru: 'Beri waktu hening 3 menit untuk menulis. Jawaban penilaian diri dapat menjadi dasar pengelompokan pada pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri bagaimana kamu tahu jawaban Raka (Rp2.910.000) tidak wajar.',
        placeholder: 'Aku menaksir … sehingga …',
      },
      {
        id: 'r2',
        teks: 'Ceritakan satu kejadian sehari-hari ketika taksiran lebih berguna daripada hitungan tepat.',
        placeholder: 'Misalnya saat …',
      },
      {
        id: 'r3',
        teks: 'Bagian mana yang masih membingungkan atau ingin kamu pelajari lebih lanjut?',
        placeholder: 'Aku masih bingung tentang …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menilai kewajaran jawaban dengan taksiran sekarang?',
    diriOpsi: [
      { id: 'yakin', label: '🌟 Yakin — aku bisa menjelaskan ke teman' },
      { id: 'cukup', label: '👍 Cukup yakin — sesekali masih perlu melihat catatan' },
      { id: 'ragu', label: '🤔 Masih ragu — terutama soal pembulatan' },
      { id: 'belum', label: '🙋 Belum paham — aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, kamu sudah jadi pemeriksa jawaban!',
    teks: 'Kamu telah menyelidiki sendiri aturan pembulatan, strategi menaksir, dan cara menilai kewajaran jawaban kalkulator dalam persiapan kemah.',
    contoh: [
      {
        konteks: 'belanja',
        teks: '48.500 × 6 ≈ 300.000',
        keterangan: 'Rp2.910.000 tidak wajar — nolnya berlebih',
      },
      { konteks: 'jalan', teks: '9,75 + 6,4 ≈ 16', keterangan: '16,15 km wajar' },
      {
        konteks: 'dapur',
        teks: '4,8 : 0,25 ≈ 20',
        keterangan: '1,2 gelas tidak wajar — operasi tertukar',
      },
      { konteks: 'cuaca', teks: '−18,6 + 7,3 ≈ −12', keterangan: 'hasilnya pasti negatif' },
    ],
    capaian: [
      'Membulatkan bilangan bulat dan desimal ke nilai tempat tertentu.',
      'Menaksir hasil operasi +, −, ×, dan : dengan strategi yang sesuai.',
      'Menentukan apakah taksiran lebih besar atau lebih kecil daripada hasil sebenarnya.',
      'Menilai kewajaran jawaban dan mengenali kesalahan koma bergeser, operasi tertukar, serta tanda.',
    ],
  },
};
