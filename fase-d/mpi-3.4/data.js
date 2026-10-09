'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Perbandingan Senilai & Berbalik Nilai
   — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menganalisis perbandingan senilai dan berbalik nilai untuk
   menyelesaikan masalah proporsi dalam kehidupan sehari-hari.

   Model pembelajaran: INQUIRY LEARNING (Inkuiri Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Orientasi .................. 'orientasi'
     Sintaks 2 — Merumuskan masalah ......... 'masalah'
     Sintaks 3 — Merumuskan hipotesis ....... 'hipotesis'
     Sintaks 4 — Mengumpulkan data .......... 'dataSenilai', 'dataBerbalik' & 'dataPilah'
     Sintaks 5 — Menguji hipotesis .......... 'uji'
     Sintaks 6 — Merumuskan kesimpulan ...... 'simpulan'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Orientasi   (8')  — "Dapur Umum Bakti Sosial Kelas VII": dua
                            kejadian di dapur umum (beras → porsi nasi,
                            relawan → lama memasak). Murid MENDUGA
                            jawaban dan arah perubahannya (tidak dinilai).
     2. Masalah     (4')  — memilih rumusan masalah penyelidikan.
     3. Hipotesis   (6')  — memilih dugaan tentang pengali, ciri, dan
                            nilai tetap, lalu menulis hipotesis sendiri.
     4a. Data 1     (12') — Lab Senilai: stepper banyak beras → porsi;
                            batang memanjang bersama, tabel percobaan
                            (kolom y : x dan x × y), grafik titik.
                            Langkah isian berdiagnosa lalu temuan.
     4b. Data 2     (12') — Lab Berbalik Nilai: stepper banyak relawan
                            → lama memasak; persegi panjang yang luasnya
                            tetap, tabel & grafik. Langkah isian
                            berdiagnosa lalu temuan.
     4c. Data 3     (8')  — Lab Pilah: sembilan tabel sehari-hari
                            dipilah menjadi senilai / berbalik nilai /
                            bukan keduanya; bukti tabel hasil bagi &
                            hasil kali muncul setelah memilih.
     5. Uji         (8')  — pernyataan benar/salah, lalu dugaan &
                            hipotesis dibandingkan dengan data.
     6. Simpulan    (5')  — menyusun kesimpulan dari bank kalimat.
     7. Uji terap   (12') — delapan soal diambil acak dari bank enam
                            belas soal (isian berdiagnosa & pilihan
                            ganda berpengecoh miskonsepsi).
     8. Refleksi    (5')  — rekap, refleksi tertulis, penilaian diri.

   Notasi: x = besaran pertama, y = besaran kedua. Kunci jawaban
   disimpan sebagai `cek` (lihat engine seksi 70) agar dapat dihitung:
     { jenis: 'senilai' | 'berbalik', x1, y1, x2 }  → y2
     { jenis: 'bagi', x, y } → y : x      { jenis: 'kali', x, y } → x × y
     { jenis: 'jenis', baris: [{ x, y }] } → 'senilai' | 'berbalik' | 'bukan'
   Bilangan besar memakai titik ribuan (15.000), desimal memakai koma.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Soal uji terap juga
   diambil acak dari bank dan opsi pilihan gandanya dibangun engine
   (opsiSoalProporsi) lalu diacak.

   Konsistensi kunci jawaban diuji tests/mpi-3.4-data.test.js terhadap
   engine seksi 70 (jawabSoalProporsi, periksaSoalProporsi,
   jenisPerbandinganTabel, nilaiLabProporsi).
   ============================================================ */

var IL = 'Inquiry Learning';

var DATA = {
  meta: {
    judul: 'Perbandingan Senilai & Berbalik Nilai',
  },

  tahap: [
    { id: 'orientasi', label: 'Orientasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'hipotesis', label: 'Hipotesis' },
    { id: 'dataSenilai', label: 'Lab Senilai' },
    { id: 'dataBerbalik', label: 'Lab Berbalik' },
    { id: 'dataPilah', label: 'Lab Pilah' },
    { id: 'uji', label: 'Uji Hipotesis' },
    { id: 'simpulan', label: 'Simpulan' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Konteks yang dipakai di seluruh modul. */
  konteks: {
    dapur: { ikon: '🍚', nama: 'Dapur Umum' },
    belanja: { ikon: '🛒', nama: 'Belanja' },
    perjalanan: { ikon: '🚌', nama: 'Perjalanan' },
    kerja: { ikon: '🧹', nama: 'Gotong Royong' },
    ternak: { ikon: '🐔', nama: 'Peternakan' },
    kelas: { ikon: '🏫', nama: 'Sekolah' },
    alam: { ikon: '🌳', nama: 'Alam' },
  },

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Uji Hipotesis.
     `baku` = jawaban menurut engine (lihat cek).
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    syntax: IL + ' · Sintaks 1',
    goal: 'Mengamati dua kejadian di dapur umum, lalu menduga bagaimana satu besaran berubah ketika besaran lain berubah.',
    tp: 'Menganalisis perbandingan senilai dan berbalik nilai untuk menyelesaikan masalah proporsi dalam kehidupan sehari-hari.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Mengenali perbandingan senilai dan berbalik nilai dari situasi atau tabel dengan memeriksa hasil bagi dan hasil kali kedua besaran.',
      'Menjelaskan bahwa pada perbandingan senilai hasil bagi y : x tetap, sedangkan pada perbandingan berbalik nilai hasil kali x × y tetap.',
      'Membedakan perbandingan dari pola "naik sama-sama" atau "selisih tetap" yang bukan perbandingan senilai.',
      'Menentukan nilai yang belum diketahui pada perbandingan senilai dan berbalik nilai.',
      'Menyelesaikan masalah proporsi sehari-hari dan memeriksa kewajaran jawabannya.',
    ],
    guru: 'Bacakan cerita dapur umum. Minta pasangan murid memutuskan dugaan dalam 2 menit tanpa menghitung rumit. Jangan membenarkan atau menyalahkan — perbedaan pendapat ("relawan lebih banyak berarti waktunya juga lebih banyak!") menjadi bahan penyelidikan.',
    judul: 'Dapur Umum Bakti Sosial Kelas VII',
    pengantar:
      'Kelas VII membuka dapur umum untuk warga terdampak banjir. Bu Ratna mencatat dua hal: 4 kg beras menjadi 32 porsi nasi, dan 4 relawan menyelesaikan masakan dalam 60 menit. Besok kebutuhannya berubah. Bagaimana kalian memperkirakannya?',
    kejadian: [
      {
        id: 'kBeras',
        ikon: '🍚',
        judul: 'Beras dan porsi nasi',
        teks: '4 kg beras → 32 porsi nasi',
      },
      {
        id: 'kRelawan',
        ikon: '🧑‍🍳',
        judul: 'Relawan dan lama memasak',
        teks: '4 relawan → 60 menit',
      },
    ],
    dugaan: [
      {
        id: 'dPorsi',
        tanya: 'Jika besok dimasak 6 kg beras (dengan takaran yang sama), banyak porsi nasi …',
        opsi: [
          { id: 'p48', label: '48 porsi' },
          { id: 'p34', label: '34 porsi (bertambah 2 seperti berasnya)' },
          { id: 'p64', label: '64 porsi' },
          { id: 'p32', label: 'Tetap 32 porsi' },
        ],
        baku: 'p48',
        cek: { jenis: 'senilai', x1: 4, y1: 32, x2: 6 },
        nilaiBaku: 48,
        pembahasan:
          'Satu kg beras menjadi 32 : 4 = 8 porsi, jadi 6 kg menjadi 6 × 8 = 48 porsi. Beras dan porsi bertambah dengan pengali yang sama (× 1,5).',
      },
      {
        id: 'dWaktu',
        tanya: 'Jika besok ada 6 relawan yang bekerja sama cepatnya, lama memasak …',
        opsi: [
          { id: 'w40', label: '40 menit' },
          { id: 'w90', label: '90 menit' },
          { id: 'w58', label: '58 menit (berkurang 2 seperti selisih relawannya)' },
          { id: 'w60', label: 'Tetap 60 menit' },
        ],
        baku: 'w40',
        cek: { jenis: 'berbalik', x1: 4, y1: 60, x2: 6 },
        nilaiBaku: 40,
        pembahasan:
          'Pekerjaannya 4 × 60 = 240 "menit-relawan". Dibagi 6 relawan menjadi 240 : 6 = 40 menit. Relawan bertambah, waktunya justru berkurang.',
      },
      {
        id: 'dArah',
        tanya: 'Apa bedanya kedua kejadian itu?',
        opsi: [
          {
            id: 'arah',
            label: 'Beras dan porsi naik bersama, sedangkan relawan naik membuat waktu turun',
          },
          { id: 'sama', label: 'Keduanya sama: kalau yang satu naik, yang lain juga naik' },
          { id: 'acak', label: 'Tidak ada aturan, hasilnya bisa berapa saja' },
        ],
        baku: 'arah',
        cek: { jenis: 'arah' },
        pembahasan:
          'Di Lab Senilai, beras bertambah → porsi bertambah. Di Lab Berbalik Nilai, relawan bertambah → waktu berkurang. Keduanya tetap punya aturan: hasil bagi tetap dan hasil kali tetap.',
      },
    ],
    alasanLabel: 'Tuliskan alasan dugaanmu (boleh singkat):',
    alasanPlaceholder: 'Menurutku porsinya … karena … Sedangkan waktunya … karena …',
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
    goal: 'Memilih pertanyaan penyelidikan yang tepat dari situasi dapur umum.',
    guru: 'Ajak murid membedakan pertanyaan yang dapat diselidiki dengan data (hubungan dua besaran) dan pertanyaan di luar fokus (menu, harga satuan saja). Biarkan mereka mencoba lagi bila memilih yang kurang tepat.',
    pengantar:
      'Kalian berbeda pendapat tentang porsi nasi dan lama memasak. Sebelum menyelidiki, rumuskan dulu pertanyaan yang ingin dijawab.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'hubungan',
        label:
          'Bagaimana perubahan satu besaran memengaruhi besaran lain, dan bagaimana menghitung nilai yang belum diketahui pada perbandingan senilai dan berbalik nilai?',
      },
      { id: 'menu', label: 'Menu apa yang paling disukai warga di dapur umum?' },
      { id: 'harga', label: 'Berapa harga 1 kg beras di pasar hari ini?' },
      { id: 'jumlah', label: 'Berapa jumlah semua relawan dan semua porsi hari ini?' },
    ],
    correct: 'hubungan',
    umpan: {
      hubungan:
        'Tepat! Pertanyaan ini dapat dijawab dengan mengamati perubahan dua besaran — itulah yang akan kita selidiki.',
      menu: 'Menu memang penting, tetapi tidak menjawab berapa porsi atau berapa lama memasak. Cari pertanyaan tentang hubungan dua besaran.',
      harga:
        'Harga hari ini hanya satu bilangan. Kita ingin tahu bagaimana satu besaran berubah ketika besaran lain berubah.',
      jumlah:
        'Menjumlahkan relawan dan porsi tidak bermakna. Yang kita selidiki adalah bagaimana keduanya saling memengaruhi.',
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
    goal: 'Menyusun dugaan sementara tentang cara dua besaran berubah bersama.',
    guru: 'Tekankan bahwa hipotesis adalah dugaan yang akan diuji, jadi tidak ada pilihan yang "dihukum". Minta setiap pasangan menulis satu kalimat hipotesis dengan bahasa sendiri.',
    pengantar:
      'Jawab dugaan berikut sesuai pendapatmu sekarang, lalu tulis hipotesismu dalam satu atau dua kalimat.',
    dugaan: [
      {
        id: 'hSenilai',
        tanya: 'Jika beras dibuat 2 kali lipat, banyak porsi nasi …',
        opsi: [
          { id: 'kali', label: 'juga menjadi 2 kali lipat' },
          { id: 'tambah', label: 'bertambah 2 porsi' },
          { id: 'bagi', label: 'menjadi setengahnya' },
        ],
        baku: 'kali',
        pembahasan:
          'Di Lab Senilai, 2 kg → 16 porsi dan 4 kg → 32 porsi: beras × 2, porsi juga × 2.',
      },
      {
        id: 'hBerbalik',
        tanya: 'Jika relawan dibuat 2 kali lipat, lama memasak …',
        opsi: [
          { id: 'bagi', label: 'menjadi setengahnya' },
          { id: 'kali', label: 'juga menjadi 2 kali lipat' },
          { id: 'kurang', label: 'berkurang 2 menit' },
        ],
        baku: 'bagi',
        pembahasan:
          'Di Lab Berbalik Nilai, 3 relawan → 80 menit dan 6 relawan → 40 menit: relawan × 2, waktu : 2.',
      },
      {
        id: 'hCiri',
        tanya:
          'Umur adik dan umur kakak sama-sama bertambah setiap tahun. Apakah itu pasti perbandingan senilai?',
        opsi: [
          { id: 'belum', label: 'Belum tentu — hasil bagi kedua besaran harus tetap' },
          { id: 'ya', label: 'Ya, karena keduanya sama-sama naik' },
          { id: 'berbalik', label: 'Bukan, itu perbandingan berbalik nilai' },
        ],
        baku: 'belum',
        pembahasan:
          'Di Lab Pilah, umur adik : kakak = 5 : 9 lalu 8 : 12. Hasil baginya berubah (yang tetap hanya selisihnya), jadi bukan perbandingan senilai.',
      },
      {
        id: 'hTetap',
        tanya: 'Pada relawan dan lama memasak, apa yang selalu tetap?',
        opsi: [
          { id: 'kali', label: 'Hasil kali banyak relawan × lama memasak' },
          { id: 'bagi', label: 'Hasil bagi lama memasak : banyak relawan' },
          { id: 'jumlah', label: 'Jumlah banyak relawan + lama memasak' },
        ],
        baku: 'kali',
        pembahasan:
          'Pada tabel Lab Berbalik Nilai, kolom x × y selalu 240, sedangkan kolom y : x berubah-ubah.',
      },
    ],
    hipotesisLabel: 'Tulis hipotesismu:',
    hipotesisPlaceholder:
      'Menurutku, jika satu besaran dikali …, maka besaran lainnya … pada perbandingan senilai, sedangkan pada perbandingan berbalik nilai …',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — LAB SENILAI
     y = k × x (k = 8 porsi per kg). Langkah berjawaban satu bilangan
     diperiksa periksaSoalProporsi (engine seksi 70).
     ---------------------------------------------------------- */
  dataSenilai: {
    kicker: 'Tahap 4a · Lab Senilai',
    syntax: IL + ' · Sintaks 4',
    goal: 'Bereksperimen mengubah banyak beras dan mengamati perubahan banyak porsi nasi.',
    guru: 'Beri waktu murid mencoba bebas. Tanyakan: "Kolom mana di tabel yang angkanya selalu sama? Apa artinya bagi dapur umum?" Arahkan perhatian ke grafik: titik-titik segaris dan, bila diperpanjang, melalui titik (0, 0).',
    pengantar:
      'Takaran Bu Ratna: setiap 1 kg beras menjadi 8 porsi nasi. Tekan − dan + untuk mengubah banyak beras. Cobalah minimal empat nilai berbeda, lalu amati tabel dan grafiknya.',
    lab: {
      jenis: 'senilai',
      k: 8,
      pilihan: [1, 2, 3, 4, 5, 6, 7, 8],
      awal: 2,
      minCoba: 4,
      labelX: 'Banyak beras',
      namaX: 'Beras (kg)',
      namaY: 'Porsi nasi',
      satX: 'kg',
      satY: 'porsi',
    },
    langkah: [
      {
        id: 'ls1',
        label: 'Dari tabelmu: 3 kg beras menjadi 24 porsi. Hasil bagi porsi : beras = …',
        cek: { jenis: 'bagi', x: 3, y: 24 },
        satuan: 'porsi per kg',
        hints: ['Hasil bagi y : x berarti banyak porsi dibagi banyak beras.', '24 : 3 = …'],
        temuan:
          '24 : 3 = 8. Coba baris lain di tabelmu: hasil baginya selalu 8 — inilah nilai tetap perbandingan senilai.',
      },
      {
        id: 'ls2',
        label: '4 kg beras menjadi 32 porsi. Untuk 6 kg beras, banyak porsi = …',
        cek: { jenis: 'senilai', x1: 4, y1: 32, x2: 6 },
        satuan: 'porsi',
        hints: [
          'Hitung dulu porsi dari 1 kg beras: 32 : 4.',
          '1 kg → 8 porsi, jadi 6 kg → 6 × 8 = …',
        ],
        temuan: '6 kg → 48 porsi. Cara lain: 4 : 6 = 32 : y₂, sehingga y₂ = 32 × 6 : 4 = 48.',
      },
      {
        id: 'ls3',
        label:
          'Besok dibutuhkan 60 porsi. Dengan takaran 32 porsi dari 4 kg, beras yang dimasak = …',
        cek: { jenis: 'senilai', x1: 32, y1: 4, x2: 60 },
        satuan: 'kg',
        hints: [
          'Porsi naik, beras juga harus naik dengan pengali yang sama.',
          'Beras = 4 × 60 : 32. Jawaban boleh desimal, mis. 2,5.',
        ],
        temuan:
          '4 × 60 : 32 = 7,5 kg. Porsi × 1,875 → beras juga × 1,875. Nilai yang hilang dapat berupa desimal.',
      },
      {
        id: 'ls4',
        label: 'Harga 5 kg beras Rp70.000. Harga 8 kg beras yang sama = … rupiah',
        cek: { jenis: 'senilai', x1: 5, y1: 70000, x2: 8 },
        satuan: 'rupiah',
        placeholder: 'mis. 90.000',
        hints: [
          'Banyak beras dan harganya senilai: makin banyak beras, makin mahal.',
          'Harga 1 kg = 70.000 : 5 = 14.000. Harga 8 kg = 8 × 14.000 = …',
        ],
        temuan:
          '8 × 14.000 = Rp112.000. Harga dan banyak barang adalah contoh perbandingan senilai.',
      },
    ],
    temuan: [
      {
        id: 'tSenilaiTetap',
        tanya: 'Pada tabel Lab Senilai, kolom mana yang nilainya selalu sama?',
        opsi: [
          { id: 'bagi', label: 'Kolom y : x (hasil bagi porsi oleh beras), selalu 8' },
          { id: 'kali', label: 'Kolom x × y (hasil kali)' },
          { id: 'porsi', label: 'Kolom porsi nasi' },
          { id: 'tidakAda', label: 'Tidak ada yang tetap' },
        ],
        correct: 'bagi',
        umpan: {
          bagi: 'Tepat! Pada perbandingan senilai, hasil bagi y : x selalu tetap. Inilah "porsi per kg".',
          kali: 'Coba lihat lagi: kolom x × y bernilai 8, 32, 72, … — terus berubah.',
          porsi:
            'Banyak porsi berubah setiap kali beras diubah. Cari kolom yang angkanya sama di setiap baris.',
          tidakAda: 'Ada satu kolom yang selalu sama di setiap baris. Periksa kolom y : x.',
        },
      },
      {
        id: 'tSenilaiKali',
        tanya: 'Jika banyak beras dikali 3, banyak porsi …',
        opsi: [
          { id: 'kali', label: 'juga dikali 3' },
          { id: 'tambah', label: 'bertambah 3' },
          { id: 'bagi', label: 'dibagi 3' },
          { id: 'tetap', label: 'tetap' },
        ],
        correct: 'kali',
        umpan: {
          kali: 'Tepat! 2 kg → 16 porsi, 6 kg → 48 porsi. Kedua besaran dikali dengan bilangan yang sama.',
          tambah: 'Dari 2 kg ke 6 kg (dikali 3), porsinya dari 16 ke 48 — bukan bertambah 3.',
          bagi: 'Porsi tidak berkurang. Makin banyak beras, makin banyak porsi.',
          tetap: 'Porsi berubah ketika beras diubah. Lihat lagi tabelmu.',
        },
      },
      {
        id: 'tSenilaiGrafik',
        tanya: 'Bagaimana bentuk titik-titik pada grafik Lab Senilai?',
        opsi: [
          { id: 'lurus', label: 'Segaris lurus naik; bila diperpanjang melalui titik (0, 0)' },
          { id: 'turun', label: 'Melengkung turun' },
          { id: 'acak', label: 'Tersebar tanpa pola' },
          { id: 'datar', label: 'Mendatar' },
        ],
        correct: 'lurus',
        umpan: {
          lurus:
            'Tepat! Grafik perbandingan senilai berupa garis lurus yang melalui (0, 0): 0 kg beras → 0 porsi.',
          turun:
            'Grafik melengkung turun muncul di Lab Berbalik Nilai. Di sini makin ke kanan makin naik.',
          acak: 'Titik-titiknya teratur. Coba tambah beberapa titik lagi dan perhatikan.',
          datar: 'Grafik mendatar berarti porsinya tidak berubah. Di sini porsi naik terus.',
        },
      },
    ],
    nextLabel: 'Lanjut: Lab Berbalik Nilai →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — LAB BERBALIK NILAI
     y = k : x (k = 240 menit-relawan).
     ---------------------------------------------------------- */
  dataBerbalik: {
    kicker: 'Tahap 4b · Lab Berbalik Nilai',
    syntax: IL + ' · Sintaks 4',
    goal: 'Bereksperimen mengubah banyak relawan dan mengamati perubahan lama memasak.',
    guru: 'Kaitkan persegi panjang dengan "banyak pekerjaan": lebarnya banyak relawan, tingginya lama memasak, luasnya selalu 240. Tanyakan: "Mengapa luasnya tidak berubah walaupun bentuknya berubah?" Ingatkan asumsi: semua relawan bekerja sama cepat.',
    pengantar:
      'Memasak untuk dapur umum membutuhkan 240 menit kerja satu orang. Pekerjaan itu dibagi rata kepada relawan yang bekerja sama cepat. Ubah banyak relawan, coba minimal empat nilai, lalu amati tabel, persegi panjang, dan grafiknya.',
    lab: {
      jenis: 'berbalik',
      k: 240,
      pilihan: [1, 2, 3, 4, 5, 6, 8, 10, 12],
      awal: 4,
      minCoba: 4,
      labelX: 'Banyak relawan',
      namaX: 'Relawan (orang)',
      namaY: 'Lama memasak (menit)',
      satX: 'relawan',
      satY: 'menit',
    },
    langkah: [
      {
        id: 'lb1',
        label: 'Dari tabelmu: 6 relawan memasak 40 menit. Hasil kali relawan × menit = …',
        cek: { jenis: 'kali', x: 6, y: 40 },
        satuan: 'menit-relawan',
        hints: ['Hasil kali x × y berarti banyak relawan dikali lama memasak.', '6 × 40 = …'],
        temuan:
          '6 × 40 = 240. Di setiap baris tabelmu hasil kalinya juga 240 — inilah nilai tetap perbandingan berbalik nilai.',
      },
      {
        id: 'lb2',
        label: '4 relawan memasak 60 menit. Jika ada 5 relawan, lama memasak = …',
        cek: { jenis: 'berbalik', x1: 4, y1: 60, x2: 5 },
        satuan: 'menit',
        hints: [
          'Relawan bertambah, jadi waktunya harus berkurang.',
          'Hasil kali tetap: 4 × 60 = 5 × y₂, jadi y₂ = 240 : 5 = …',
        ],
        temuan: '240 : 5 = 48 menit. Relawan × 1,25 → waktu : 1,25.',
      },
      {
        id: 'lb3',
        label:
          'Masakan harus siap dalam 30 menit. Dengan data 60 menit untuk 4 relawan, relawan yang diperlukan = …',
        cek: { jenis: 'berbalik', x1: 60, y1: 4, x2: 30 },
        satuan: 'relawan',
        hints: [
          'Waktunya dipersingkat, jadi relawannya harus ditambah.',
          '60 × 4 = 30 × y₂, jadi y₂ = 240 : 30 = …',
        ],
        temuan: '240 : 30 = 8 relawan. Waktu : 2 → relawan × 2.',
      },
      {
        id: 'lb4',
        label:
          'Persediaan beras cukup untuk 120 warga selama 15 hari. Jika warga bertambah menjadi 150 orang, persediaan cukup untuk … hari',
        cek: { jenis: 'berbalik', x1: 120, y1: 15, x2: 150 },
        satuan: 'hari',
        hints: [
          'Warga bertambah → persediaan lebih cepat habis.',
          '120 × 15 = 150 × y₂, jadi y₂ = 1.800 : 150 = …',
        ],
        temuan:
          '1.800 : 150 = 12 hari. Banyak pemakai dan lama persediaan habis adalah contoh perbandingan berbalik nilai.',
      },
    ],
    temuan: [
      {
        id: 'tBerbalikTetap',
        tanya: 'Pada tabel Lab Berbalik Nilai, kolom mana yang nilainya selalu sama?',
        opsi: [
          { id: 'kali', label: 'Kolom x × y (hasil kali relawan dan menit), selalu 240' },
          { id: 'bagi', label: 'Kolom y : x (hasil bagi)' },
          { id: 'menit', label: 'Kolom lama memasak' },
          { id: 'tidakAda', label: 'Tidak ada yang tetap' },
        ],
        correct: 'kali',
        umpan: {
          kali: 'Tepat! Pada perbandingan berbalik nilai, hasil kali x × y selalu tetap — sama dengan luas persegi panjang di lab.',
          bagi: 'Coba lihat lagi: kolom y : x bernilai 60, 15, 6,67, … — terus berubah.',
          menit:
            'Lama memasak berubah ketika relawan diubah. Cari kolom yang angkanya sama di setiap baris.',
          tidakAda: 'Ada satu kolom yang selalu sama. Periksa kolom x × y.',
        },
      },
      {
        id: 'tBerbalikKali',
        tanya: 'Jika banyak relawan dikali 2, lama memasak …',
        opsi: [
          { id: 'bagi', label: 'dibagi 2 (menjadi setengahnya)' },
          { id: 'kali', label: 'dikali 2' },
          { id: 'kurang', label: 'berkurang 2 menit' },
          { id: 'tetap', label: 'tetap' },
        ],
        correct: 'bagi',
        umpan: {
          bagi: 'Tepat! 3 relawan → 80 menit, 6 relawan → 40 menit. Yang satu dikali, yang lain dibagi dengan bilangan yang sama.',
          kali: 'Lebih banyak relawan justru membuat pekerjaan lebih cepat selesai.',
          kurang:
            'Dari 3 ke 6 relawan, waktunya dari 80 ke 40 menit — berkurang setengahnya, bukan 2 menit.',
          tetap: 'Waktunya berubah ketika relawan diubah. Lihat lagi tabelmu.',
        },
      },
      {
        id: 'tBerbalikGrafik',
        tanya: 'Bagaimana bentuk titik-titik pada grafik Lab Berbalik Nilai?',
        opsi: [
          { id: 'lengkung', label: 'Melengkung turun dan tidak pernah menyentuh sumbu' },
          { id: 'lurus', label: 'Garis lurus naik melalui (0, 0)' },
          { id: 'lurusTurun', label: 'Garis lurus turun sampai menyentuh sumbu mendatar' },
          { id: 'acak', label: 'Tersebar tanpa pola' },
        ],
        correct: 'lengkung',
        umpan: {
          lengkung:
            'Tepat! Grafik berbalik nilai melengkung turun. Waktu tidak pernah menjadi 0 berapa pun banyak relawannya.',
          lurus: 'Garis lurus naik adalah grafik Lab Senilai. Di sini makin ke kanan makin turun.',
          lurusTurun:
            'Perhatikan jarak antartitik: turunnya makin landai, jadi bentuknya melengkung, bukan garis lurus.',
          acak: 'Titik-titiknya teratur. Coba tambah beberapa titik lagi dan perhatikan.',
        },
      },
    ],
    nextLabel: 'Lanjut: Lab Pilah →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — LAB PILAH
     correct = jenisPerbandinganTabel(baris) (diuji).
     ---------------------------------------------------------- */
  dataPilah: {
    kicker: 'Tahap 4c · Lab Pilah',
    syntax: IL + ' · Sintaks 4',
    goal: 'Memilah tabel dari kehidupan sehari-hari: senilai, berbalik nilai, atau bukan keduanya.',
    guru: 'Tabel umur adik–kakak dan kelereng Ani–Budi sengaja dipilih sebagai pengecoh: yang pertama "naik bersama", yang kedua "naik–turun", tetapi keduanya bukan perbandingan. Minta murid menunjukkan bukti dari kolom y : x dan x × y.',
    pengantar:
      'Untuk setiap tabel, putuskan jenis perbandingannya. Setelah memilih, periksa buktinya: hasil bagi y : x dan hasil kali x × y di setiap baris.',
    kategori: [
      { id: 'senilai', label: 'Senilai' },
      { id: 'berbalik', label: 'Berbalik nilai' },
      { id: 'bukan', label: 'Bukan keduanya' },
    ],
    tabel: [
      {
        id: 'pPulpen',
        konteks: 'belanja',
        teks: 'Banyak pulpen (x) dan harga (y, rupiah) di koperasi.',
        namaX: 'Pulpen',
        namaY: 'Harga (Rp)',
        baris: [
          { x: 2, y: 6000 },
          { x: 3, y: 9000 },
          { x: 5, y: 15000 },
        ],
        correct: 'senilai',
        explanation: 'Hasil bagi harga : pulpen selalu 3.000 (harga satu pulpen).',
      },
      {
        id: 'pBus',
        konteks: 'perjalanan',
        teks: 'Kecepatan bus (x, km/jam) dan waktu tempuh (y, jam) untuk jarak 120 km.',
        namaX: 'Kecepatan',
        namaY: 'Waktu (jam)',
        baris: [
          { x: 40, y: 3 },
          { x: 60, y: 2 },
          { x: 80, y: 1.5 },
        ],
        correct: 'berbalik',
        explanation: 'Hasil kali kecepatan × waktu selalu 120 (jaraknya).',
      },
      {
        id: 'pUmur',
        konteks: 'kelas',
        teks: 'Umur adik (x) dan umur kakak (y) pada tahun yang sama.',
        namaX: 'Umur adik',
        namaY: 'Umur kakak',
        baris: [
          { x: 5, y: 9 },
          { x: 8, y: 12 },
          { x: 10, y: 14 },
        ],
        correct: 'bukan',
        explanation:
          'Keduanya naik bersama, tetapi hasil baginya berubah (1,8; 1,5; 1,4). Yang tetap hanya selisihnya, 4 tahun.',
      },
      {
        id: 'pAyam',
        konteks: 'ternak',
        teks: 'Banyak ayam (x) dan lama persediaan pakan habis (y, hari).',
        namaX: 'Ayam',
        namaY: 'Hari',
        baris: [
          { x: 20, y: 30 },
          { x: 30, y: 20 },
          { x: 40, y: 15 },
        ],
        correct: 'berbalik',
        explanation:
          'Hasil kali ayam × hari selalu 600. Makin banyak ayam, pakan makin cepat habis.',
      },
      {
        id: 'pBensin',
        konteks: 'perjalanan',
        teks: 'Bensin yang dipakai (x, liter) dan jarak yang ditempuh motor (y, km).',
        namaX: 'Bensin (L)',
        namaY: 'Jarak (km)',
        baris: [
          { x: 2, y: 80 },
          { x: 5, y: 200 },
          { x: 7, y: 280 },
        ],
        correct: 'senilai',
        explanation: 'Hasil bagi jarak : bensin selalu 40 km per liter.',
      },
      {
        id: 'pKelompok',
        konteks: 'kelas',
        teks: 'Banyak murid per kelompok (x) dan banyak kelompok (y) dari 36 murid.',
        namaX: 'Murid/kelompok',
        namaY: 'Kelompok',
        baris: [
          { x: 3, y: 12 },
          { x: 4, y: 9 },
          { x: 6, y: 6 },
        ],
        correct: 'berbalik',
        explanation: 'Hasil kali selalu 36 (semua murid).',
      },
      {
        id: 'pPersegi',
        konteks: 'alam',
        teks: 'Panjang sisi petak kebun persegi (x, m) dan luasnya (y, m²).',
        namaX: 'Sisi (m)',
        namaY: 'Luas (m²)',
        baris: [
          { x: 1, y: 1 },
          { x: 2, y: 4 },
          { x: 3, y: 9 },
        ],
        correct: 'bukan',
        explanation:
          'Sisi × 2 membuat luas × 4, bukan × 2. Hasil bagi (1, 2, 3) dan hasil kali (1, 8, 27) sama-sama berubah.',
      },
      {
        id: 'pBayangan',
        konteks: 'alam',
        teks: 'Tinggi tiang (x, m) dan panjang bayangannya (y, m) pada waktu yang sama.',
        namaX: 'Tinggi (m)',
        namaY: 'Bayangan (m)',
        baris: [
          { x: 2, y: 3 },
          { x: 4, y: 6 },
          { x: 6, y: 9 },
        ],
        correct: 'senilai',
        explanation: 'Hasil bagi bayangan : tinggi selalu 1,5.',
      },
      {
        id: 'pKelereng',
        konteks: 'kelas',
        teks: '20 kelereng dibagi dua: milik Ani (x) dan milik Budi (y).',
        namaX: 'Kelereng Ani',
        namaY: 'Kelereng Budi',
        baris: [
          { x: 5, y: 15 },
          { x: 8, y: 12 },
          { x: 14, y: 6 },
        ],
        correct: 'bukan',
        explanation:
          'Ani naik, Budi turun — tetapi hasil kalinya berubah (75, 96, 84). Yang tetap adalah jumlahnya, 20.',
      },
    ],
    nextLabel: 'Lanjut: Uji Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGUJI HIPOTESIS
     Pernyataan bercek: 'nilai' → klaim dibandingkan jawabSoalProporsi;
     'jenis' → klaim dibandingkan jenisPerbandinganTabel.
     ---------------------------------------------------------- */
  uji: {
    kicker: 'Tahap 5 · Menguji Hipotesis',
    syntax: IL + ' · Sintaks 5',
    goal: 'Menguji dugaan dan hipotesis dengan data dari ketiga lab.',
    guru: 'Setelah pernyataan dipilah, minta pasangan membacakan satu dugaan yang dikoreksi data dan menunjukkan buktinya di tabel lab. Hargai murid yang berani mengubah hipotesisnya.',
    judulA: 'A. Benar atau salah menurut data?',
    judulB: 'B. Dugaanmu vs data',
    opsiPernyataan: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'vPorsi',
        teks: 'Jika 4 kg beras menjadi 32 porsi, maka 6 kg beras menjadi 48 porsi.',
        correct: 'benar',
        cek: { jenis: 'senilai', x1: 4, y1: 32, x2: 6 },
        klaim: '48',
        explanation: '1 kg → 8 porsi, jadi 6 kg → 48 porsi.',
      },
      {
        id: 'vWaktu',
        teks: 'Jika 4 relawan memasak 60 menit, maka 6 relawan memasak 90 menit.',
        correct: 'salah',
        cek: { jenis: 'berbalik', x1: 4, y1: 60, x2: 6 },
        klaim: '90',
        explanation:
          '90 menit diperoleh dengan cara senilai. Relawan bertambah, waktunya berkurang: 240 : 6 = 40 menit.',
      },
      {
        id: 'vNaik',
        teks: 'Jika dua besaran sama-sama bertambah, pasti perbandingannya senilai.',
        correct: 'salah',
        cek: {
          jenis: 'jenis',
          baris: [
            { x: 5, y: 9 },
            { x: 8, y: 12 },
          ],
        },
        klaim: 'senilai',
        explanation:
          'Umur adik dan kakak sama-sama bertambah, tetapi hasil baginya berubah. Senilai berarti hasil bagi y : x tetap.',
      },
      {
        id: 'vKali',
        teks: 'Pada perbandingan berbalik nilai, hasil kali kedua besaran selalu tetap.',
        correct: 'benar',
        explanation: 'Di Lab Berbalik Nilai, relawan × menit selalu 240.',
      },
      {
        id: 'vTambah',
        teks: 'Pada perbandingan senilai, jika x bertambah 2 maka y juga bertambah 2.',
        correct: 'salah',
        explanation:
          'Beras dari 2 kg ke 4 kg (bertambah 2), porsi dari 16 ke 32 (bertambah 16). Yang sama adalah pengalinya, bukan selisihnya.',
      },
      {
        id: 'vKelompok',
        teks: 'Banyak murid per kelompok dan banyak kelompok dari 36 murid adalah perbandingan berbalik nilai.',
        correct: 'benar',
        cek: {
          jenis: 'jenis',
          baris: [
            { x: 3, y: 12 },
            { x: 4, y: 9 },
            { x: 6, y: 6 },
          ],
        },
        klaim: 'berbalik',
        explanation: 'Hasil kalinya selalu 36.',
      },
      {
        id: 'vGrafik',
        teks: 'Grafik perbandingan senilai berupa garis lurus yang melalui titik (0, 0).',
        correct: 'benar',
        explanation: 'Titik-titik di Lab Senilai segaris dan 0 kg beras menghasilkan 0 porsi.',
      },
      {
        id: 'vPakan',
        teks: 'Pakan untuk 20 ayam cukup 30 hari. Untuk 40 ayam, pakan yang sama cukup 15 hari.',
        correct: 'benar',
        cek: { jenis: 'berbalik', x1: 20, y1: 30, x2: 40 },
        klaim: '15',
        explanation: 'Ayam × 2 → hari : 2. Hasil kali 20 × 30 = 40 × 15 = 600.',
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
    goal: 'Menyusun kesimpulan tentang perbandingan senilai dan berbalik nilai dari hasil penyelidikan.',
    guru: 'Minta beberapa pasangan membacakan kesimpulan lengkapnya, lalu kaitkan kembali dengan rumusan masalah di tahap 2 dan dugaan awal tentang porsi dan waktu.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai satu kali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'kSenilai', awal: 'Pada perbandingan senilai,', correct: 'bSenilai' },
      { id: 'kBerbalik', awal: 'Pada perbandingan berbalik nilai,', correct: 'bBerbalik' },
      { id: 'kCek', awal: 'Untuk mengenali jenis perbandingan dari tabel,', correct: 'bCek' },
      { id: 'kHitung', awal: 'Nilai yang belum diketahui dapat dicari', correct: 'bHitung' },
    ],
    bank: [
      {
        id: 'bSenilai',
        teks: 'jika satu besaran dikali n, besaran lain juga dikali n, sehingga hasil bagi y : x tetap.',
      },
      {
        id: 'bBerbalik',
        teks: 'jika satu besaran dikali n, besaran lain dibagi n, sehingga hasil kali x × y tetap.',
      },
      {
        id: 'bCek',
        teks: 'periksa apakah hasil bagi atau hasil kali kedua besaran tetap di setiap baris.',
      },
      {
        id: 'bHitung',
        teks: 'dengan y₂ = y₁ × x₂ : x₁ untuk senilai, atau y₂ = x₁ × y₁ : x₂ untuk berbalik nilai.',
      },
      { id: 'bSelisih', teks: 'selisih kedua besaran selalu tetap.' },
      { id: 'bNaik', teks: 'cukup lihat apakah kedua besaran sama-sama naik.' },
      { id: 'bTambah', teks: 'dengan menambahkan selisih x yang sama ke y.' },
    ],
    rangkuman: [
      '<strong>Senilai</strong>: x naik → y naik dengan pengali yang sama; <strong>y : x = tetap</strong>. Contoh: beras dan porsi, harga dan banyak barang.',
      '<strong>Berbalik nilai</strong>: x naik → y turun; x dikali n → y dibagi n; <strong>x × y = tetap</strong>. Contoh: relawan dan lama bekerja, kecepatan dan waktu tempuh.',
      'Menghitung senilai: <strong>y₂ = y₁ × x₂ : x₁</strong> (atau cari dulu nilai per satuan).',
      'Menghitung berbalik nilai: <strong>x₁ × y₁ = x₂ × y₂</strong>, jadi <strong>y₂ = x₁ × y₁ : x₂</strong>.',
      'Naik bersama atau selisih tetap belum tentu senilai. Selalu periksa hasil bagi dan hasil kalinya, lalu cek kewajaran jawaban.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Diambil acak `banyak` soal sesuai `komposisi` dari bank.
     Isian diperiksa periksaSoalProporsi; opsi pilihan ganda dibangun
     opsiSoalProporsi (engine seksi 70) lalu diacak di app.js.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan perbandingan senilai dan berbalik nilai untuk menyelesaikan masalah sehari-hari.',
    guru: 'Murid bekerja mandiri. Amati pesan diagnosa yang muncul (model tertukar, pola tambah, lupa membagi) sebagai bahan umpan balik individual. Minta murid menuliskan jenis perbandingannya sebelum menghitung.',
    instruksi:
      'Kerjakan delapan soal berikut. Tentukan dulu jenis perbandingannya, lalu hitung. Tulis satu bilangan; desimal memakai koma (mis. 7,5).',
    banyak: 8,
    komposisi: { input: 4, choice: 4 },
    soal: [
      {
        id: 'iResep',
        type: 'input',
        konteks: 'dapur',
        cerita: 'Resep kue bolu untuk 12 potong memakai 3 butir telur.',
        pertanyaan: 'Berapa butir telur yang diperlukan untuk 20 potong kue?',
        cek: { jenis: 'senilai', x1: 12, y1: 3, x2: 20 },
        satuan: 'butir',
        hints: ['Makin banyak potong kue, makin banyak telur: senilai.', 'Telur = 3 × 20 : 12 = …'],
        reveal: 'Jawaban: 5 butir.',
        explanation: '3 × 20 : 12 = 5. Satu butir telur untuk 4 potong kue.',
      },
      {
        id: 'iBensin',
        type: 'input',
        konteks: 'perjalanan',
        cerita: 'Sebuah motor menempuh 90 km dengan 2 liter bensin.',
        pertanyaan: 'Berapa km jarak yang dapat ditempuh dengan 5 liter bensin?',
        cek: { jenis: 'senilai', x1: 2, y1: 90, x2: 5 },
        satuan: 'km',
        hints: ['Bensin bertambah → jarak bertambah: senilai.', '1 liter → 45 km. 5 liter → …'],
        reveal: 'Jawaban: 225 km.',
        explanation: '90 : 2 = 45 km per liter, jadi 5 × 45 = 225 km.',
      },
      {
        id: 'iBuku',
        type: 'input',
        konteks: 'belanja',
        cerita: 'Harga 4 buku tulis Rp18.000.',
        pertanyaan: 'Berapa rupiah harga 10 buku tulis yang sama?',
        cek: { jenis: 'senilai', x1: 4, y1: 18000, x2: 10 },
        satuan: 'rupiah',
        hints: ['Harga satu buku = 18.000 : 4.', '4.500 × 10 = …'],
        reveal: 'Jawaban: Rp45.000.',
        explanation: '18.000 : 4 = 4.500 per buku, jadi 10 buku = 45.000 rupiah.',
      },
      {
        id: 'iTukang',
        type: 'input',
        konteks: 'kerja',
        cerita: 'Pagar sekolah dapat dicat oleh 6 orang dalam 10 hari.',
        pertanyaan:
          'Jika dikerjakan 4 orang yang sama cepatnya, berapa hari pekerjaan itu selesai?',
        cek: { jenis: 'berbalik', x1: 6, y1: 10, x2: 4 },
        satuan: 'hari',
        hints: [
          'Orangnya berkurang → waktunya bertambah: berbalik nilai.',
          '6 × 10 = 4 × y₂, jadi y₂ = 60 : 4 = …',
        ],
        reveal: 'Jawaban: 15 hari.',
        explanation: 'Hasil kali tetap 6 × 10 = 60, jadi 60 : 4 = 15 hari.',
      },
      {
        id: 'iKecepatan',
        type: 'input',
        konteks: 'perjalanan',
        cerita:
          'Bus study tour menempuh perjalanan dalam 3 jam dengan kecepatan rata-rata 60 km/jam.',
        pertanyaan: 'Berapa jam waktu tempuh jika kecepatan rata-ratanya 90 km/jam?',
        cek: { jenis: 'berbalik', x1: 60, y1: 3, x2: 90 },
        satuan: 'jam',
        hints: [
          'Makin cepat → makin singkat waktunya: berbalik nilai.',
          '60 × 3 = 90 × y₂, jadi y₂ = 180 : 90 = …',
        ],
        reveal: 'Jawaban: 2 jam.',
        explanation: 'Jaraknya 60 × 3 = 180 km, jadi 180 : 90 = 2 jam.',
      },
      {
        id: 'iPakan',
        type: 'input',
        konteks: 'ternak',
        cerita: 'Persediaan pakan cukup untuk 30 ekor kambing selama 12 hari.',
        pertanyaan:
          'Jika kambingnya dijual sebagian sehingga tinggal 24 ekor, pakan cukup untuk berapa hari?',
        cek: { jenis: 'berbalik', x1: 30, y1: 12, x2: 24 },
        satuan: 'hari',
        hints: [
          'Kambing berkurang → pakan lebih lama habis: berbalik nilai.',
          '30 × 12 = 24 × y₂, jadi y₂ = 360 : 24 = …',
        ],
        reveal: 'Jawaban: 15 hari.',
        explanation: '30 × 12 = 360, dan 360 : 24 = 15 hari.',
      },
      {
        id: 'iKeran',
        type: 'input',
        konteks: 'kelas',
        cerita: 'Bak air sekolah penuh dalam 45 menit jika diisi dengan 2 keran yang sama.',
        pertanyaan: 'Berapa menit bak itu penuh jika diisi dengan 3 keran yang sama?',
        cek: { jenis: 'berbalik', x1: 2, y1: 45, x2: 3 },
        satuan: 'menit',
        hints: [
          'Keran bertambah → bak lebih cepat penuh: berbalik nilai.',
          '2 × 45 = 3 × y₂, jadi y₂ = 90 : 3 = …',
        ],
        reveal: 'Jawaban: 30 menit.',
        explanation: '2 × 45 = 90, dan 90 : 3 = 30 menit.',
      },
      {
        id: 'iBibit',
        type: 'input',
        konteks: 'alam',
        cerita:
          'Untuk menanam 6 baris pohon di taman sekolah diperlukan 15 bibit (jumlah bibit setiap baris sama).',
        pertanyaan: 'Berapa bibit yang diperlukan untuk 10 baris?',
        cek: { jenis: 'senilai', x1: 6, y1: 15, x2: 10 },
        satuan: 'bibit',
        hints: ['Baris bertambah → bibit bertambah: senilai.', 'Bibit = 15 × 10 : 6 = …'],
        reveal: 'Jawaban: 25 bibit.',
        explanation: '15 × 10 : 6 = 25 bibit (2,5 bibit setiap baris).',
      },
      {
        id: 'cBeras',
        type: 'choice',
        konteks: 'dapur',
        cerita: 'Dapur umum memasak 5 kg beras untuk 40 porsi nasi.',
        pertanyaan: 'Berapa porsi nasi dari 8 kg beras dengan takaran yang sama?',
        cek: { jenis: 'senilai', x1: 5, y1: 40, x2: 8 },
        satuan: 'porsi',
        explanation: '40 : 5 = 8 porsi per kg, jadi 8 kg → 64 porsi.',
      },
      {
        id: 'cRelawan',
        type: 'choice',
        konteks: 'kerja',
        cerita: '8 relawan membersihkan taman kota dalam 3 jam.',
        pertanyaan: 'Berapa jam jika yang bekerja 12 relawan yang sama cepatnya?',
        cek: { jenis: 'berbalik', x1: 8, y1: 3, x2: 12 },
        satuan: 'jam',
        explanation: '8 × 3 = 24, dan 24 : 12 = 2 jam.',
      },
      {
        id: 'cMobil',
        type: 'choice',
        konteks: 'perjalanan',
        cerita: 'Dengan kecepatan 50 km/jam, sebuah mobil tiba dalam 6 jam.',
        pertanyaan: 'Berapa jam waktu tempuhnya jika kecepatannya 75 km/jam?',
        cek: { jenis: 'berbalik', x1: 50, y1: 6, x2: 75 },
        satuan: 'jam',
        explanation: '50 × 6 = 300 km, dan 300 : 75 = 4 jam.',
      },
      {
        id: 'cKain',
        type: 'choice',
        konteks: 'belanja',
        cerita: 'Harga 3 meter kain batik Rp135.000.',
        pertanyaan: 'Berapa harga 7 meter kain batik yang sama?',
        cek: { jenis: 'senilai', x1: 3, y1: 135000, x2: 7 },
        satuan: 'rupiah',
        explanation: '135.000 : 3 = 45.000 per meter, jadi 7 × 45.000 = 315.000 rupiah.',
      },
      {
        id: 'cTabelSenilai',
        type: 'choice',
        konteks: 'belanja',
        cerita: 'Tabel tiket museum: 2 tiket → Rp30.000, 3 tiket → Rp45.000, 6 tiket → Rp90.000.',
        pertanyaan: 'Termasuk perbandingan apakah banyak tiket dan harganya?',
        cek: {
          jenis: 'jenis',
          baris: [
            { x: 2, y: 30000 },
            { x: 3, y: 45000 },
            { x: 6, y: 90000 },
          ],
        },
        explanation: 'Hasil bagi harga : tiket selalu 15.000, jadi senilai.',
      },
      {
        id: 'cTabelBerbalik',
        type: 'choice',
        konteks: 'kelas',
        cerita:
          'Kue untuk kelas dibagi rata: 4 anak → 6 potong per anak, 6 anak → 4 potong, 8 anak → 3 potong.',
        pertanyaan: 'Termasuk perbandingan apakah banyak anak dan potong kue per anak?',
        cek: {
          jenis: 'jenis',
          baris: [
            { x: 4, y: 6 },
            { x: 6, y: 4 },
            { x: 8, y: 3 },
          ],
        },
        explanation: 'Hasil kali selalu 24 (semua potong kue), jadi berbalik nilai.',
      },
      {
        id: 'cTabelBukan',
        type: 'choice',
        konteks: 'alam',
        cerita: 'Tinggi tanaman: minggu ke-1 → 5 cm, minggu ke-2 → 8 cm, minggu ke-3 → 11 cm.',
        pertanyaan: 'Termasuk perbandingan apakah minggu dan tinggi tanaman?',
        cek: {
          jenis: 'jenis',
          baris: [
            { x: 1, y: 5 },
            { x: 2, y: 8 },
            { x: 3, y: 11 },
          ],
        },
        explanation:
          'Tingginya bertambah 3 cm setiap minggu, tetapi hasil bagi (5; 4; 3,67) dan hasil kali (5, 16, 33) sama-sama berubah. Bukan keduanya.',
      },
      {
        id: 'cPompa',
        type: 'choice',
        konteks: 'kerja',
        cerita: 'Kolam ikan dapat dikuras 3 pompa dalam 8 jam.',
        pertanyaan: 'Berapa jam jika dikuras 4 pompa yang sama?',
        cek: { jenis: 'berbalik', x1: 3, y1: 8, x2: 4 },
        satuan: 'jam',
        explanation: '3 × 8 = 24, dan 24 : 4 = 6 jam.',
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
    goal: 'Merefleksikan proses penyelidikan dan pemahaman tentang perbandingan senilai dan berbalik nilai.',
    guru: 'Gunakan jawaban refleksi untuk mengetahui murid yang masih berpikir aditif ("bertambah sama banyak") atau masih memilih cara hanya dari kata kunci. Rencanakan penguatan dengan tabel dan benda nyata.',
    pertanyaan: [
      {
        id: 'rBeda',
        teks: 'Dengan kata-katamu sendiri, apa beda perbandingan senilai dan berbalik nilai? Beri satu contoh masing-masing dari kehidupanmu.',
        placeholder: 'Senilai artinya … contohnya … Berbalik nilai artinya … contohnya …',
      },
      {
        id: 'rCek',
        teks: 'Bagaimana caramu memastikan jenis perbandingan sebelum menghitung?',
        placeholder: 'Aku memeriksa …',
      },
      {
        id: 'rDugaan',
        teks: 'Dugaan mana yang berubah setelah kamu menyelidiki? Mengapa berubah?',
        placeholder: 'Awalnya aku menduga … ternyata …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu menyelesaikan masalah perbandingan senilai dan berbalik nilai sekarang?',
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
    teks: 'Kamu sudah menyelidiki perbandingan senilai dan berbalik nilai. Dapur umum Kelas VII kini dapat menghitung beras, relawan, dan persediaan dengan tepat.',
    contoh: [
      {
        konteks: 'dapur',
        teks: 'y : x = tetap',
        keterangan: 'Senilai: 4 kg → 32 porsi, 6 kg → 48 porsi.',
      },
      {
        konteks: 'kerja',
        teks: 'x × y = tetap',
        keterangan: 'Berbalik nilai: 4 relawan → 60 menit, 6 relawan → 40 menit.',
      },
      {
        konteks: 'kelas',
        teks: 'Selisih tetap ≠ senilai',
        keterangan: 'Umur adik dan kakak bukan perbandingan senilai.',
      },
    ],
    capaian: [
      'Mengenali perbandingan senilai dan berbalik nilai dari situasi dan tabel.',
      'Menemukan bahwa hasil bagi tetap pada perbandingan senilai dan hasil kali tetap pada perbandingan berbalik nilai.',
      'Membedakan perbandingan dari pola naik bersama atau selisih tetap.',
      'Menghitung nilai yang belum diketahui dan menyelesaikan masalah proporsi sehari-hari.',
    ],
  },
};
