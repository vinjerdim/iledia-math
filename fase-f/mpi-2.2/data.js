'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Jumlah n Suku Pertama Deret Geometri (Sₙ)
   Fase F — SMK Rekayasa Perangkat Lunak

   Tujuan Pembelajaran:
   Menemukan dan membuktikan rumus jumlah n suku pertama deret
   geometri (Sₙ), serta menerapkannya untuk menyelesaikan masalah
   kontekstual yang melibatkan deret aritmetika dan geometri.

   Model pembelajaran: PROBLEM-BASED LEARNING (PBL).
   Masalah pemantik: "Kontrak Maintenance Aplikasi Nadia".
   Nadia, lulusan RPL, ditawari kontrak merawat aplikasi kasir
   sebuah UMKM dengan dua pilihan skema bayaran bulanan:
     • Paket A "Naik Tetap"     : Rp2.000.000, naik Rp250.000/bulan
                                  (deret aritmetika, a = 2.000.000, b = 250.000)
     • Paket B "Bonus Berlipat" : Rp200.000, dua kali lipat tiap bulan
                                  (deret geometri, a = 200.000, r = 2)
   Konflik kognitif: bulan-bulan awal Paket A jauh unggul, tetapi
     S₆: A = 15.750.000 > B = 12.600.000
     S₇: A = 19.250.000 < B = 25.400.000
     S₈: A = 23.000.000 < B = 51.000.000
   Paket terbaik BERGANTUNG pada lama kontrak — menjumlahkan satu
   per satu melelahkan, sehingga murid butuh rumus Sₙ geometri.

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ...... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar  'organisasi'
     Sintaks 3 — Membimbing penyelidikan ........... 'selidikPola', 'selidikBukti',
                                                     'ujiRumus', 'latih'
     Sintaks 4 — Mengembangkan & menyajikan hasil .. 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi proses  'evaluasi'
     Penutup ....................................... 'refleksi', 'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — murid menulis dugaan dan pertanyaan
       sendiri, menyusun rencana penyelidikan, lalu membandingkan
       dugaan awal dengan hasil perhitungan dan merefleksikannya.
     • Bermakna (meaningful) — rumus lahir dari keputusan nyata yang
       dekat dengan lulusan RPL: memilih skema bayaran kontrak kerja;
       latihan memakai konteks unduhan aplikasi, server, dan tabungan.
     • Menggembirakan (joyful) — mencoret pasangan kembar hingga rumus
       "muncul sendiri", grafik total yang bisa digeser, dan poster
       rekomendasi kelompok yang dipresentasikan.

   Rangkaian aktivitas (± 2 × 45 menit; kelompok 3–4 murid, satu
   perangkat per kelompok atau per murid):
     1. Orientasi      (8')  — cerita kontrak Nadia, tabel 3 bulan,
                               dugaan awal (tidak dinilai), pertanyaan
                               pemantik.
     2. Organisasi     (7')  — membagi peran, memilah informasi
                               (diketahui/ditanya/tidak diperlukan),
                               menyusun urutan rencana penyelidikan.
     3. Selidik pola   (10') — mengenali A aritmetika & B geometri,
                               melengkapi tabel Sₙ kedua paket (n = 1–5),
                               memilah pernyataan tentang pola Sₙ.
     4. Selidik bukti  (15') — trik "kalikan r, geser, kurangkan" pada
                               S₅ paket B, lalu pertanyaan penuntun hingga
                               Sₙ = a(rⁿ − 1)/(r − 1), bentuk r < 1, dan
                               alasan syarat r ≠ 1.
     5. Uji rumus      (7')  — tabel jumlah manual vs rumus (slider n),
                               uji pada data, menyusun simpulan.
     6. Latihan        (12') — tujuh masalah kontekstual campuran deret
                               aritmetika & geometri.
     7. Karya          (12') — menghitung total 6 & 8 bulan, grafik,
                               titik balik, rekomendasi + poster untuk
                               dipresentasikan.
     8. Evaluasi       (8')  — menilai pendapat teman, dugaan vs hasil,
                               satu masalah transfer.
     9. Refleksi       (5')  — rekap capaian, refleksi tertulis,
                               keyakinan diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/ensureTapOrderState()/
   shuffleArray() dari shared/engine.js, satu kali saat state disiapkan,
   sehingga tiap murid (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var PBL = 'Problem Based Learning';

var DATA = {
  /* Dua skema bayaran yang dipakai sepanjang modul. */
  paket: {
    A: { id: 'A', nama: 'Paket A “Naik Tetap”', ikon: '📈', a: 2000000, b: 250000 },
    B: { id: 'B', nama: 'Paket B “Bonus Berlipat”', ikon: '🚀', a: 200000, r: 2 },
  },

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI PADA MASALAH  (PBL sintaks 1)
     Dugaan TIDAK dinilai; dibandingkan dengan hasil pada Evaluasi.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi Masalah',
    syntax: PBL + ' · Sintaks 1',
    goal: 'Memahami masalah kontrak Nadia dan menuliskan dugaan awal.',
    guru: 'Bacakan cerita dengan antusias, lalu tanyakan: "Kalau kalian Nadia, pilih yang mana?" Tampung semua dugaan tanpa dikoreksi. Tekankan bahwa kelompok harus bisa <em>membuktikan</em> pilihannya dengan perhitungan, bukan perasaan.',
    judul: 'Kontrak Maintenance Aplikasi Nadia',
    cerita:
      'Nadia baru lulus dari jurusan RPL. Sebuah UMKM memintanya merawat aplikasi kasir mereka dengan kontrak beberapa bulan. Pemilik UMKM menawarkan dua skema bayaran bulanan, dan Nadia boleh memilih salah satunya.',
    tabelBulan: 3,
    pertanyaan:
      'Dugaanmu: jika kontraknya 8 bulan, paket mana yang memberi TOTAL bayaran lebih besar?',
    opsi: [
      { id: 'A', label: 'Paket A “Naik Tetap”' },
      { id: 'B', label: 'Paket B “Bonus Berlipat”' },
      { id: 'sama', label: 'Kurang lebih sama saja' },
    ],
    dugaanN: 8,
    dugaanBenar: 'B',
    alasanLabel: 'Mengapa kamu menduga begitu?',
    alasanPlaceholder: 'Contoh: bulan pertama Paket A sudah jauh lebih besar, jadi …',
    pemantikLabel:
      'Pertanyaan pemantik: apa yang perlu kalian ketahui atau hitung agar bisa memberi saran yang pasti kepada Nadia?',
    pemantikPlaceholder: 'Contoh: total bayaran tiap paket selama …',
    catatan:
      'Belum ada jawaban benar atau salah. Simpan dugaanmu — di akhir pelajaran kamu akan membuktikannya sendiri.',
    nextLabel: 'Simpan Dugaan & Lanjut →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENGORGANISASI MURID  (PBL sintaks 2)
     ---------------------------------------------------------- */
  organisasi: {
    kicker: 'Tahap 2 · Organisasi Belajar',
    syntax: PBL + ' · Sintaks 2',
    goal: 'Membagi peran, memilah informasi, dan menyusun rencana penyelidikan.',
    guru: 'Pastikan setiap anggota kelompok punya peran. Saat memilah informasi, tanyakan: "Apakah lantai kantor mengubah jumlah bayaran?" Biarkan kelompok berdebat soal urutan rencana sebelum menekan Periksa.',
    judulPeran: 'A. Bagi peran di kelompokmu',
    instruksiPeran:
      'Tulis nama anggota untuk setiap peran (boleh dikosongkan jika belajar mandiri).',
    peran: [
      {
        id: 'ketua',
        ikon: '🧭',
        nama: 'Manajer Proyek',
        tugas: 'Memimpin diskusi dan menjaga waktu.',
      },
      {
        id: 'hitung',
        ikon: '🧮',
        nama: 'Analis Data',
        tugas: 'Menghitung suku dan jumlah deret.',
      },
      {
        id: 'uji',
        ikon: '🔍',
        nama: 'Penguji (QA)',
        tugas: 'Memeriksa ulang setiap hasil hitungan.',
      },
      {
        id: 'saji',
        ikon: '🎤',
        nama: 'Presenter',
        tugas: 'Menyajikan rekomendasi kelompok di depan kelas.',
      },
    ],
    judulInfo: 'B. Pilah informasi dari cerita',
    instruksiInfo:
      'Tentukan apakah setiap informasi termasuk yang diketahui, yang ditanyakan, atau tidak diperlukan.',
    infoOpsi: [
      { id: 'tahu', label: 'Diketahui' },
      { id: 'tanya', label: 'Ditanyakan' },
      { id: 'tidak', label: 'Tidak diperlukan' },
    ],
    info: [
      {
        id: 'i1',
        teks: 'Paket A: bulan pertama Rp2.000.000, lalu naik Rp250.000 setiap bulan.',
        correct: 'tahu',
        explanation: 'Ini suku pertama dan beda deret Paket A.',
      },
      {
        id: 'i2',
        teks: 'Paket B: bulan pertama Rp200.000, lalu menjadi dua kali lipat setiap bulan.',
        correct: 'tahu',
        explanation: 'Ini suku pertama dan rasio deret Paket B.',
      },
      {
        id: 'i3',
        teks: 'Paket mana yang memberi total bayaran lebih besar selama masa kontrak?',
        correct: 'tanya',
        explanation: 'Inilah masalah yang harus dijawab: membandingkan jumlah n suku kedua deret.',
      },
      {
        id: 'i4',
        teks: 'Lama kontrak yang sedang dipertimbangkan adalah 6 atau 8 bulan.',
        correct: 'tahu',
        explanation: 'Lama kontrak adalah banyak suku (n) yang dijumlahkan.',
      },
      {
        id: 'i5',
        teks: 'Kantor UMKM itu berada di lantai 3 sebuah ruko.',
        correct: 'tidak',
        explanation: 'Letak kantor tidak memengaruhi besar bayaran.',
      },
      {
        id: 'i6',
        teks: 'Aplikasi kasir itu dibuat dengan bahasa pemrograman PHP.',
        correct: 'tidak',
        explanation: 'Bahasa pemrograman tidak dipakai untuk menghitung total bayaran.',
      },
    ],
    judulRencana: 'C. Susun rencana penyelidikan',
    instruksiRencana: 'Ketuk kartu sesuai urutan langkah kerja kelompokmu dari yang pertama.',
    rencana: [
      { id: 'r1', label: 'Kenali jenis pola bayaran tiap paket' },
      { id: 'r2', label: 'Kumpulkan data bayaran & total beberapa bulan pertama' },
      { id: 'r3', label: 'Temukan dan buktikan rumus jumlah n suku deret geometri' },
      { id: 'r4', label: 'Uji rumus pada data yang sudah dikumpulkan' },
      { id: 'r5', label: 'Hitung & bandingkan total kedua paket untuk 6 dan 8 bulan' },
      { id: 'r6', label: 'Sajikan rekomendasi untuk Nadia' },
    ],
    rencanaUrut: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'],
    rencanaSukses:
      '<strong>Rencana kelompokmu siap.</strong> Media ini akan menemanimu mengikuti langkah-langkah tersebut.',
    nextLabel: 'Mulai Penyelidikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENYELIDIKAN: POLA & DATA  (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikPola: {
    kicker: 'Tahap 3 · Selidiki Pola',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Mengenali jenis deret tiap paket dan mengumpulkan data jumlah bayaran Sₙ.',
    guru: 'Minta Analis Data menghitung dan Penguji memeriksa ulang. Ajukan pertanyaan pelacak: "Bagaimana Sₙ Paket B bertambah dari baris ke baris? Bandingkan dengan Uₙ-nya."',
    judulPola: 'A. Kenali pola bayaran',
    pertanyaan: [
      {
        id: 'qA',
        tanya: 'Bayaran Paket A (2.000.000; 2.250.000; 2.500.000; …) membentuk barisan …',
        opsi: [
          { id: 'aritB', label: 'aritmetika dengan beda b = 250.000' },
          { id: 'geo', label: 'geometri dengan rasio r = 250.000' },
          { id: 'aritA', label: 'aritmetika dengan beda b = 2.000.000' },
          { id: 'bukan', label: 'bukan aritmetika maupun geometri' },
        ],
        correct: 'aritB',
        umpan: {
          aritB:
            '<strong>Tepat.</strong> Setiap bulan bayaran <em>ditambah</em> 250.000 yang sama: barisan aritmetika.',
          geo: 'Rasio adalah <em>pengali</em>. 2.000.000 × 250.000 jelas bukan 2.250.000. Coba lagi.',
          aritA: '2.000.000 adalah suku pertama (a), bukan bedanya. Hitung U₂ − U₁.',
          bukan: 'Coba hitung U₂ − U₁ dan U₃ − U₂. Apakah hasilnya sama?',
        },
      },
      {
        id: 'qB',
        tanya: 'Bayaran Paket B (200.000; 400.000; 800.000; …) membentuk barisan …',
        opsi: [
          { id: 'geo2', label: 'geometri dengan rasio r = 2' },
          { id: 'arit', label: 'aritmetika dengan beda b = 200.000' },
          { id: 'geo200', label: 'geometri dengan rasio r = 200.000' },
          { id: 'arit2', label: 'aritmetika dengan beda b = 2' },
        ],
        correct: 'geo2',
        umpan: {
          geo2: '<strong>Tepat.</strong> Setiap bulan bayaran <em>dikali</em> 2: barisan geometri dengan a = 200.000 dan r = 2.',
          arit: 'U₂ − U₁ = 200.000, tetapi U₃ − U₂ = 400.000. Bedanya tidak tetap. Coba lagi.',
          geo200: '200.000 adalah suku pertama (a). Rasionya U₂ : U₁ = 400.000 : 200.000.',
          arit2: 'Angka 2 adalah pengali, bukan tambahan. Coba lagi.',
        },
      },
    ],
    judulTabel: 'B. Kumpulkan data total bayaran',
    instruksiTabel:
      'Bayaran tiap bulan (Uₙ) sudah tertulis. Lengkapi total bayaran dari bulan 1 sampai bulan ke-n (Sₙ) untuk kedua paket. Boleh memakai titik pemisah ribuan.',
    tabelN: 5,
    hintsTabel: [
      'Sₙ adalah jumlah SEMUA bayaran dari bulan 1 sampai bulan ke-n.',
      'Sₙ = Sₙ₋₁ + Uₙ. Contoh Paket B: S₂ = 200.000 + 400.000 = 600.000.',
    ],
    judulPilah: 'C. Amati tabelmu',
    instruksiPilah: 'Pilah setiap pernyataan berikut: benar atau salah?',
    pilahOpsi: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: 'Untuk kedua paket, Sₙ − Sₙ₋₁ selalu sama dengan Uₙ.',
        correct: 'benar',
        explanation:
          'Menambah satu bulan berarti menambah bayaran bulan itu, mis. S₄ − S₃ Paket B = 3.000.000 − 1.400.000 = 1.600.000 = U₄.',
      },
      {
        id: 'p2',
        teks: 'S₅ Paket B dapat dihitung dengan n/2 × (a + Uₙ) = 5/2 × (200.000 + 3.200.000).',
        correct: 'salah',
        explanation:
          'Hasilnya 8.500.000, padahal S₅ = 6.200.000. Rumus Sₙ aritmetika hanya berlaku bila bedanya tetap.',
      },
      {
        id: 'p3',
        teks: 'Untuk Paket B, setiap Sₙ sama dengan 2 × Uₙ − 200.000.',
        correct: 'benar',
        explanation:
          'Misalnya S₅ = 2 × 3.200.000 − 200.000 = 6.200.000. Pola menarik ini akan kita buktikan!',
      },
      {
        id: 'p4',
        teks: 'Karena total 5 bulan Paket A lebih besar, Paket A pasti lebih untung untuk kontrak berapa pun lamanya.',
        correct: 'salah',
        explanation:
          'Perhatikan Uₙ: bayaran Paket B berlipat dua dan akan menyalip. Kita perlu menghitung total untuk n yang lebih besar.',
      },
      {
        id: 'p5',
        teks: 'Barisan S₁, S₂, S₃, … Paket B (200.000; 600.000; 1.400.000; …) juga barisan geometri.',
        correct: 'salah',
        explanation:
          '600.000 : 200.000 = 3, tetapi 1.400.000 : 600.000 ≈ 2,33. Rasionya tidak tetap.',
      },
    ],
    nextLabel: 'Temukan Rumus Sₙ Geometri →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENYELIDIKAN: MENEMUKAN & MEMBUKTIKAN Sₙ  (sintaks 3)
     Deret paket B ditulis dalam ribu rupiah agar muat di grid.
     ---------------------------------------------------------- */
  selidikBukti: {
    kicker: 'Tahap 4 · Temukan & Buktikan Sₙ',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menemukan dan membuktikan rumus jumlah n suku pertama deret geometri.',
    guru: 'Tanyakan sebelum mencoret: "Kalau S₅ dikali 2, suku-suku apa yang muncul?" Setelah pasangan kembar tercoret, minta Presenter menjelaskan mengapa hanya dua suku yang tersisa. Pada bagian umum, tulis setiap langkah aljabar di papan.',
    a: 200,
    r: 2,
    n: 5,
    judulA: 'A. Trik “kalikan r, geser, kurangkan” pada Paket B',
    instruksiA:
      'Baris atas adalah S₅ Paket B (dalam ribu rupiah). Baris bawah adalah 2 × S₅: setiap suku dikali 2 lalu digeser satu kolom. Ketuk pasangan suku kembar untuk mencoretnya saat kedua baris dikurangkan.',
    satuan: 'Nilai dalam ribu rupiah (200 = Rp200.000).',
    langkah: [
      {
        label: 'Setelah pasangan kembar dicoret, suku baris 2S₅ yang tersisa adalah …',
        jawab: 6400,
        hints: ['Lihat kotak paling kanan di baris bawah: 3.200 × 2.'],
        temuan: 'Tersisa 6.400 (= a·r⁵) di baris bawah dan 200 (= a) di baris atas.',
      },
      {
        label: '2S₅ − S₅ = 6.400 − 200. Karena 2S₅ − S₅ = S₅, maka S₅ = …',
        jawab: 6200,
        hints: ['Kurangkan: 6.400 − 200.'],
        temuan:
          'S₅ = 6.200 ribu = Rp6.200.000 — sama dengan tabelmu, tanpa menjumlahkan satu per satu!',
      },
    ],
    judulB: 'B. Berlaku untuk semua deret geometri?',
    instruksiB:
      'Sekarang pakai deret geometri umum Sₙ = a + ar + ar² + … + arⁿ⁻¹. Jawab pertanyaan penuntun berikut satu per satu.',
    pertanyaan: [
      {
        id: 'g1',
        tanya: 'Kalikan kedua ruas dengan r. Maka r·Sₙ = …',
        opsi: [
          { id: 'benar', label: 'ar + ar² + ar³ + … + arⁿ' },
          { id: 'kurang', label: 'ar + ar² + ar³ + … + arⁿ⁻¹' },
          { id: 'tetap', label: 'a + ar + ar² + … + arⁿ' },
          { id: 'tambah', label: 'a + r + ar + … + arⁿ⁻¹' },
        ],
        correct: 'benar',
        umpan: {
          benar: '<strong>Tepat.</strong> Setiap pangkat r naik satu: a → ar, …, arⁿ⁻¹ → arⁿ.',
          kurang: 'Suku terakhir arⁿ⁻¹ juga dikali r. Menjadi apa?',
          tetap: 'Suku pertama a ikut dikali r sehingga menjadi ar, bukan tetap a.',
          tambah: 'Mengalikan dengan r tidak sama dengan menambahkan r. Coba lagi.',
        },
      },
      {
        id: 'g2',
        tanya:
          'Kurangkan: r·Sₙ − Sₙ. Suku ar sampai arⁿ⁻¹ saling menghilangkan, sehingga tersisa …',
        opsi: [
          { id: 'benar', label: 'arⁿ − a' },
          { id: 'n1', label: 'arⁿ⁻¹ − a' },
          { id: 'ar', label: 'ar − a' },
          { id: 'plus', label: 'arⁿ + a' },
        ],
        correct: 'benar',
        umpan: {
          benar: '<strong>Tepat.</strong> Sama seperti Paket B: 6.400 − 200 = a·r⁵ − a.',
          n1: 'arⁿ⁻¹ muncul di KEDUA baris sehingga ikut tercoret. Suku apa yang hanya ada di baris r·Sₙ?',
          ar: 'ar muncul di kedua baris sehingga tercoret. Lihat suku paling kanan baris r·Sₙ.',
          plus: 'Suku a berasal dari Sₙ yang dikurangkan, jadi tandanya negatif.',
        },
      },
      {
        id: 'g3',
        tanya: 'r·Sₙ − Sₙ = Sₙ(r − 1) = a(rⁿ − 1). Maka Sₙ = …',
        opsi: [
          { id: 'benar', label: 'a(rⁿ − 1) / (r − 1)' },
          { id: 'n1', label: 'a(rⁿ⁻¹ − 1) / (r − 1)' },
          { id: 'bagir', label: 'a(rⁿ − 1) / r' },
          { id: 'tanpaa', label: '(rⁿ − 1) / (r − 1)' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Terbukti!</strong> Kedua ruas dibagi (r − 1). Cek Paket B: 200(2⁵ − 1)/(2 − 1) = 6.200. ✓',
          n1: 'Dari langkah sebelumnya yang tersisa arⁿ, bukan arⁿ⁻¹. Coba lagi.',
          bagir: 'Faktor di depan Sₙ adalah (r − 1), bukan r.',
          tanpaa: 'Faktor a di ruas kanan jangan hilang.',
        },
      },
      {
        id: 'g4',
        tanya: 'Mengapa rumus itu hanya berlaku untuk r ≠ 1?',
        opsi: [
          {
            id: 'benar',
            label: 'Jika r = 1 penyebutnya 0; semua suku sama sehingga Sₙ = n × a',
          },
          { id: 'negatif', label: 'Jika r = 1 hasilnya selalu negatif' },
          { id: 'besar', label: 'Jika r = 1 jumlahnya menjadi tak terhingga' },
          { id: 'bebas', label: 'Sebenarnya rumus itu berlaku untuk semua r' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Pembagian dengan 0 tidak terdefinisi. Untuk r = 1 cukup hitung n × a.',
          negatif: 'Coba substitusi r = 1: penyebutnya r − 1 = 0. Apa masalahnya?',
          besar: 'Untuk r = 1 deretnya a + a + … + a, jumlahnya berhingga yaitu n × a.',
          bebas: 'Coba substitusi r = 1 ke penyebut (r − 1). Apa yang terjadi?',
        },
      },
      {
        id: 'g5',
        tanya: 'Untuk 0 < r < 1 (deret menurun), bentuk yang lebih nyaman dipakai adalah …',
        opsi: [
          { id: 'benar', label: 'Sₙ = a(1 − rⁿ) / (1 − r)' },
          { id: 'balik', label: 'Sₙ = a(1 − r) / (1 − rⁿ)' },
          { id: 'n1', label: 'Sₙ = a(1 − rⁿ⁻¹) / (1 − r)' },
          { id: 'arit', label: 'Sₙ = n/2 × (a + Uₙ)' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Pembilang dan penyebut sama-sama dikali −1, nilainya tidak berubah — tetapi tidak ada bilangan negatif.',
          balik: 'Pembilang dan penyebutnya tertukar. Cukup kalikan keduanya dengan −1.',
          n1: 'Pangkatnya tetap n, sama seperti bentuk sebelumnya.',
          arit: 'Itu rumus deret aritmetika. Deret geometri punya rasio, bukan beda.',
        },
      },
    ],
    nextLabel: 'Uji Rumusnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENYELIDIKAN: UJI RUMUS & SIMPULAN  (sintaks 3)
     ---------------------------------------------------------- */
  ujiRumus: {
    kicker: 'Tahap 5 · Uji Rumus',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menguji rumus Sₙ geometri pada beberapa deret dan menyusun kesimpulan.',
    guru: 'Minta Penguji (QA) mencoba nilai n yang paling besar dan memastikan semua baris bertanda ✓. Tanyakan: "Apakah cukup menguji beberapa n? Mengapa bukti aljabar tadi lebih kuat?"',
    judulA: 'A. Bandingkan jumlah manual dengan rumus',
    instruksiA:
      'Pilih deret, lalu geser slider n. Kolom kiri menjumlahkan suku satu per satu, kolom kanan memakai rumus Sₙ.',
    deret: [
      { id: 'B', label: 'Paket B (ribu rupiah): 200, 400, 800, …', a: 200, r: 2 },
      { id: 'bola', label: 'Pantulan bola (cm): 64, 32, 16, …', a: 64, r: 0.5 },
    ],
    maxN: 8,
    judulB: 'B. Gunakan rumusnya',
    uji: [
      {
        label: 'Total 8 bulan Paket B: S₈ = 200.000 × (2⁸ − 1) / (2 − 1) = … rupiah',
        jawab: 51000000,
        cek: { a: 200000, r: 2, n: 8 },
        hints: ['2⁸ = 256, jadi 2⁸ − 1 = 255.', 'S₈ = 200.000 × 255.'],
        bukti: 'S₈ Paket B = Rp51.000.000.',
      },
      {
        label:
          'Bola memantul 64, 32, 16, … cm. Total 6 pantulan: S₆ = 64 × (1 − (½)⁶) / (1 − ½) = … cm',
        jawab: 126,
        cek: { a: 64, r: 0.5, n: 6 },
        hints: ['(½)⁶ = 1/64, jadi 1 − 1/64 = 63/64.', 'S₆ = 64 × 63/64 : ½ = 63 × 2.'],
        bukti: 'S₆ = 126 cm. Cek manual: 64 + 32 + 16 + 8 + 4 + 2 = 126. ✓',
      },
    ],
    judulC: 'C. Susun kesimpulan',
    instruksiC:
      'Lengkapi setiap awal kalimat dengan potongan yang tepat. Setiap potongan dipakai paling banyak satu kali, dan ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      {
        id: 'k1',
        awal: 'Untuk deret geometri dengan r > 1, jumlah n suku pertamanya adalah',
        correct: 'b1',
      },
      {
        id: 'k2',
        awal: 'Untuk deret geometri dengan 0 < r < 1, lebih nyaman memakai',
        correct: 'b2',
      },
      {
        id: 'k3',
        awal: 'Rumus itu terbukti karena r·Sₙ − Sₙ menghapus semua suku kembar sehingga tersisa',
        correct: 'b3',
      },
      { id: 'k4', awal: 'Jika r = 1, semua suku sama sehingga', correct: 'b4' },
    ],
    bank: [
      { id: 'b1', teks: 'Sₙ = a(rⁿ − 1) / (r − 1).' },
      { id: 'b2', teks: 'Sₙ = a(1 − rⁿ) / (1 − r).' },
      { id: 'b3', teks: 'arⁿ − a.' },
      { id: 'b4', teks: 'Sₙ = n × a.' },
      { id: 'x1', teks: 'Sₙ = n/2 × (a + Uₙ).' },
      { id: 'x2', teks: 'arⁿ⁻¹ − a.' },
    ],
    rangkuman: [
      'Sₙ = a(rⁿ − 1) / (r − 1) untuk r > 1.',
      'Sₙ = a(1 − rⁿ) / (1 − r) untuk 0 < r < 1 (nilainya sama, hanya bentuknya berbeda).',
      'Bukti: r·Sₙ − Sₙ = arⁿ − a karena suku ar sampai arⁿ⁻¹ saling menghilangkan.',
      'Deret aritmetika tetap memakai Sₙ = n/2 × (2a + (n − 1)b). Kenali dulu jenis deretnya!',
    ],
    nextLabel: 'Latihan Masalah Kontekstual →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — LATIHAN MASALAH KONTEKSTUAL  (sintaks 3)
     Campuran isian ('input') dan pilihan ganda ('choice').
     `deret` = metadata untuk tes kunci jawaban (tests/).
     ---------------------------------------------------------- */
  latih: {
    kicker: 'Tahap 6 · Latihan Masalah',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menyelesaikan masalah kontekstual yang melibatkan deret aritmetika dan geometri.',
    guru: 'Biasakan murid menulis "jenis deret, a, b atau r, n" sebelum menghitung. Soal yang paling banyak salah dibahas bersama di akhir tahap ini.',
    instruksi:
      'Kenali dulu jenis deretnya (aritmetika atau geometri), tulis a, b atau r, dan n, lalu pilih rumus Sₙ yang tepat.',
    soal: [
      {
        type: 'input',
        cerita:
          'Raka menabung untuk membeli SSD baru. Minggu pertama ia menabung Rp20.000, dan setiap minggu tabungannya Rp5.000 lebih banyak dari minggu sebelumnya.',
        pertanyaan: 'Berapa rupiah total tabungan Raka setelah 12 minggu?',
        jawab: 570000,
        deret: { jenis: 'aritmetika', a: 20000, beda: 5000, n: 12 },
        hints: [
          'Bertambah tetap Rp5.000 → deret aritmetika: a = 20.000, b = 5.000, n = 12.',
          'S₁₂ = 12/2 × (2 × 20.000 + 11 × 5.000) = 6 × 95.000.',
        ],
        explanation: 'S₁₂ = 6 × (40.000 + 55.000) = 6 × 95.000 = Rp570.000.',
        reveal: 'S₁₂ = 12/2 × (40.000 + 55.000) = 6 × 95.000 = <strong>Rp570.000</strong>.',
      },
      {
        type: 'input',
        cerita:
          'Game edukasi buatan siswa RPL diunduh 50 kali pada hari pertama. Setiap hari, banyak unduhan menjadi 3 kali lipat hari sebelumnya.',
        pertanyaan: 'Berapa total unduhan selama 6 hari pertama?',
        jawab: 18200,
        deret: { jenis: 'geometri', a: 50, beda: 3, n: 6 },
        hints: [
          'Dikali 3 setiap hari → deret geometri: a = 50, r = 3, n = 6.',
          'S₆ = 50 × (3⁶ − 1) / (3 − 1) = 50 × 728 / 2.',
        ],
        explanation: 'S₆ = 50 × (729 − 1) / 2 = 50 × 364 = 18.200 unduhan.',
        reveal: 'S₆ = 50 × (3⁶ − 1) / (3 − 1) = 50 × 364 = <strong>18.200</strong> unduhan.',
      },
      {
        type: 'choice',
        cerita:
          'Sebuah ruang server punya 10 baris rak. Baris pertama berisi 6 unit server, dan setiap baris berikutnya berisi 3 unit lebih banyak.',
        pertanyaan: 'Berapa unit server seluruhnya?',
        deret: { jenis: 'aritmetika', a: 6, beda: 3, n: 10 },
        options: [
          { id: 'o195', label: '195 unit', nilai: 195 },
          { id: 'o210', label: '210 unit', nilai: 210 },
          { id: 'o390', label: '390 unit', nilai: 390 },
          { id: 'o3069', label: '3.069 unit', nilai: 3069 },
        ],
        correct: 'o195',
        explanation:
          'Bertambah tetap → aritmetika: S₁₀ = 10/2 × (2 × 6 + 9 × 3) = 5 × 39 = 195 unit. (210 muncul jika memakai 10b, 390 jika lupa membagi 2, 3.069 jika salah menganggapnya geometri.)',
      },
      {
        type: 'choice',
        cerita:
          'Sebuah server memproses 1.024 tugas pada jam pertama. Setiap jam berikutnya, banyak tugas yang diproses tinggal setengah dari jam sebelumnya.',
        pertanyaan: 'Berapa total tugas yang diproses selama 5 jam?',
        deret: { jenis: 'geometri', a: 1024, beda: 0.5, n: 5 },
        options: [
          { id: 'o1984', label: '1.984 tugas', nilai: 1984 },
          { id: 'o2016', label: '2.016 tugas', nilai: 2016 },
          { id: 'o2048', label: '2.048 tugas', nilai: 2048 },
          { id: 'o5120', label: '5.120 tugas', nilai: 5120 },
        ],
        correct: 'o1984',
        explanation:
          'Deret geometri menurun, a = 1.024, r = ½: S₅ = 1.024 × (1 − (½)⁵) / (1 − ½) = 2.048 × 31/32 = 1.984 tugas. (2.016 adalah S₆, 5.120 = 5 × 1.024.)',
      },
      {
        type: 'choice',
        cerita:
          'Biaya sewa cloud sebuah startup tahun pertama Rp1.000.000 dan naik 10% setiap tahun (tahun berikutnya = 1,1 × tahun sebelumnya).',
        pertanyaan: 'Perhitungan mana yang tepat untuk total biaya sewa 5 tahun?',
        deret: { jenis: 'geometri' },
        options: [
          { id: 'geo', label: '1.000.000 × (1,1⁵ − 1) / (1,1 − 1)' },
          { id: 'arit', label: '5/2 × (2 × 1.000.000 + 4 × 100.000)' },
          { id: 'n1', label: '1.000.000 × (1,1⁴ − 1) / (1,1 − 1)' },
          { id: 'kali', label: '5 × 1.000.000 × 1,1' },
        ],
        correct: 'geo',
        explanation:
          'Naik 10% berarti dikali 1,1 → deret geometri a = 1.000.000, r = 1,1, n = 5: S₅ = 1.000.000 × (1,1⁵ − 1) / 0,1 = Rp6.105.100. Rumus aritmetika menganggap kenaikannya tetap Rp100.000, padahal kenaikannya ikut membesar.',
      },
      {
        type: 'input',
        cerita:
          'Sebuah pesan promosi aplikasi dikirim ke 4 orang pada tahap 1. Pada setiap tahap berikutnya, tiap penerima meneruskannya ke 4 orang baru.',
        pertanyaan: 'Berapa total penerima pesan dari tahap 1 sampai tahap 5?',
        jawab: 1364,
        deret: { jenis: 'geometri', a: 4, beda: 4, n: 5 },
        hints: [
          'Penerima tiap tahap: 4, 16, 64, … → geometri a = 4, r = 4.',
          'S₅ = 4 × (4⁵ − 1) / (4 − 1) = 4 × 1.023 / 3.',
        ],
        explanation: 'S₅ = 4 × (1.024 − 1) / 3 = 4 × 341 = 1.364 orang.',
        reveal: 'S₅ = 4 × (4⁵ − 1) / 3 = 4 × 341 = <strong>1.364</strong> orang.',
      },
      {
        type: 'input',
        cerita:
          'Pemakaian penyimpanan cloud sebuah aplikasi: bulan pertama bertambah 3 GB, dan setiap bulan tambahannya dua kali tambahan bulan sebelumnya.',
        pertanyaan: 'Setelah berapa bulan total pemakaiannya tepat mencapai 93 GB?',
        jawab: 5,
        deret: { jenis: 'geometri', a: 3, beda: 2, target: 93 },
        hints: ['Sₙ = 3 × (2ⁿ − 1) / (2 − 1) = 93.', '2ⁿ − 1 = 31, jadi 2ⁿ = 32.'],
        explanation: '3(2ⁿ − 1) = 93 → 2ⁿ − 1 = 31 → 2ⁿ = 32 → n = 5 bulan.',
        reveal: '3(2ⁿ − 1) = 93 → 2ⁿ = 32 → n = <strong>5</strong> bulan.',
      },
    ],
    nextLabel: 'Susun Rekomendasi untuk Nadia →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENGEMBANGKAN & MENYAJIKAN HASIL KARYA  (sintaks 4)
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 7 · Sajikan Hasil',
    syntax: PBL + ' · Sintaks 4',
    goal: 'Menjawab masalah Nadia dengan rumus Sₙ dan menyajikan rekomendasi kelompok.',
    guru: 'Beri waktu tiap kelompok 2 menit untuk mempresentasikan poster. Minta kelompok lain bertanya: "Bagaimana jika kontraknya 7 bulan?" Hargai kelompok yang dugaan awalnya berbeda dari hasil namun jujur mengakuinya.',
    judulA: 'A. Hitung total bayaran',
    hitung: [
      {
        paket: 'A',
        n: 6,
        label: 'Paket A, 6 bulan (aritmetika): S₆ = 6/2 × (2 × 2.000.000 + 5 × 250.000) = …',
        jawab: 15750000,
        hints: ['2 × 2.000.000 + 5 × 250.000 = 5.250.000.', 'S₆ = 3 × 5.250.000.'],
        bukti: 'S₆ Paket A = Rp15.750.000.',
      },
      {
        paket: 'B',
        n: 6,
        label: 'Paket B, 6 bulan (geometri): S₆ = 200.000 × (2⁶ − 1) / (2 − 1) = …',
        jawab: 12600000,
        hints: ['2⁶ = 64, jadi 2⁶ − 1 = 63.', 'S₆ = 200.000 × 63.'],
        bukti: 'S₆ Paket B = Rp12.600.000 — untuk 6 bulan, Paket A masih unggul.',
      },
      {
        paket: 'A',
        n: 8,
        label: 'Paket A, 8 bulan: S₈ = 8/2 × (2 × 2.000.000 + 7 × 250.000) = …',
        jawab: 23000000,
        hints: ['2 × 2.000.000 + 7 × 250.000 = 5.750.000.', 'S₈ = 4 × 5.750.000.'],
        bukti: 'S₈ Paket A = Rp23.000.000.',
      },
      {
        paket: 'B',
        n: 8,
        label: 'Paket B, 8 bulan: S₈ = 200.000 × (2⁸ − 1) / (2 − 1) = …',
        jawab: 51000000,
        hints: ['2⁸ − 1 = 255.', 'S₈ = 200.000 × 255.'],
        bukti: 'S₈ Paket B = Rp51.000.000 — lebih dari dua kali lipat Paket A!',
      },
    ],
    judulB: 'B. Cari titik balik',
    instruksiB:
      'Geser slider untuk melihat total bayaran kedua paket sampai bulan ke-n. Kapan Paket B mulai menyalip?',
    maxN: 10,
    titikBalikN: 7,
    titikBalik: {
      id: 'titik',
      tanya: 'Paket B memberi total lebih besar mulai kontrak berapa bulan?',
      opsi: [
        { id: 'n7', label: '7 bulan', nilai: 7 },
        { id: 'n6', label: '6 bulan', nilai: 6 },
        { id: 'n8', label: '8 bulan', nilai: 8 },
        { id: 'n5', label: '5 bulan', nilai: 5 },
      ],
      correct: 'n7',
      umpan: {
        n7: '<strong>Tepat.</strong> S₇: Paket A Rp19.250.000, Paket B Rp25.400.000. Mulai 7 bulan, Paket B unggul.',
        n6: 'Pada 6 bulan Paket A masih unggul (15.750.000 > 12.600.000). Geser slider sedikit lagi.',
        n8: 'Pada 8 bulan B memang unggul, tetapi apakah 7 bulan juga sudah unggul? Periksa grafiknya.',
        n5: 'Pada 5 bulan Paket A masih jauh unggul (12.500.000 > 6.200.000).',
      },
    },
    judulC: 'C. Rekomendasi kelompok',
    rekomendasi: {
      id: 'rekom',
      tanya: 'Rekomendasi paling tepat untuk Nadia adalah …',
      opsi: [
        {
          id: 'tergantung',
          label:
            'Pilih Paket A jika kontrak ≤ 6 bulan, pilih Paket B jika kontrak 7 bulan atau lebih',
        },
        { id: 'selaluB', label: 'Selalu pilih Paket B karena bayarannya berlipat dua' },
        { id: 'selaluA', label: 'Selalu pilih Paket A karena bulan pertamanya jauh lebih besar' },
        { id: 'sama', label: 'Pilih yang mana saja karena totalnya hampir sama' },
      ],
      correct: 'tergantung',
      umpan: {
        tergantung:
          '<strong>Rekomendasi yang berbasis bukti!</strong> Jawabannya bergantung pada lama kontrak, dan rumus Sₙ membuktikannya.',
        selaluB:
          'Untuk kontrak 6 bulan, Paket B justru kalah Rp3.150.000. Lihat lagi hasil hitunganmu.',
        selaluA: 'Untuk kontrak 8 bulan, Paket A kalah Rp28.000.000! Lihat lagi hasil hitunganmu.',
        sama: 'Selisihnya bisa jutaan rupiah. Bandingkan S₆ dan S₈ kedua paket.',
      },
    },
    pesanLabel: 'Tulis pesan singkat kelompokmu untuk Nadia (akan tampil di poster):',
    pesanPlaceholder: 'Contoh: Nadia, tanyakan dulu lama kontraknya. Jika …',
    posterJudul: 'Rekomendasi untuk Nadia',
    posterFooter: 'Disusun dengan rumus Sₙ deret aritmetika & geometri.',
    nextLabel: 'Evaluasi Proses →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — MENGANALISIS & MENGEVALUASI PROSES  (sintaks 5)
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 8 · Evaluasi Proses',
    syntax: PBL + ' · Sintaks 5',
    goal: 'Mengevaluasi cara berpikir, membandingkan dugaan awal dengan hasil, dan menguji pemahaman pada masalah baru.',
    guru: 'Diskusikan kesalahan pada pendapat teman sebagai miskonsepsi yang wajar. Minta murid yang dugaannya meleset menjelaskan apa yang membuat dugaannya berubah.',
    judulA: 'A. Nilai pendapat teman',
    instruksiA:
      'Beberapa murid kelas lain menulis pendapat berikut. Apakah pendapat mereka tepat atau keliru?',
    pendapatOpsi: [
      { id: 'tepat', label: 'Tepat' },
      { id: 'keliru', label: 'Keliru' },
    ],
    pendapat: [
      {
        id: 'e1',
        teks: 'Rani: “Deret 3 + 6 + 12 + 24 + 48, jadi S₅ = n × Uₙ = 5 × 48 = 240.”',
        correct: 'keliru',
        explanation:
          'n × Uₙ menganggap semua suku sebesar suku terakhir. S₅ = 3(2⁵ − 1)/(2 − 1) = 93.',
      },
      {
        id: 'e2',
        teks: 'Bima: “Untuk 5 + 10 + 20 + 40, S₄ = 5(2⁴ − 1)/(2 − 1) = 75.”',
        correct: 'tepat',
        explanation: '5 × 15 = 75, dan 5 + 10 + 20 + 40 = 75. ✓',
      },
      {
        id: 'e3',
        teks: 'Tono: “Rumus n/2 × (a + Uₙ) juga boleh dipakai untuk deret geometri.”',
        correct: 'keliru',
        explanation:
          'Rumus itu bergantung pada pasangan suku yang jumlahnya sama, dan itu hanya terjadi bila bedanya tetap (aritmetika).',
      },
      {
        id: 'e4',
        teks: 'Sari: “Untuk r = ½, a(1 − rⁿ)/(1 − r) dan a(rⁿ − 1)/(r − 1) memberi hasil yang sama.”',
        correct: 'tepat',
        explanation:
          'Bentuk kedua sama dengan bentuk pertama yang pembilang dan penyebutnya dikali −1.',
      },
      {
        id: 'e5',
        teks: 'Dewi: “Suku ke-4 deret 2, 6, 18, … adalah 2 × 3⁴ = 162.”',
        correct: 'keliru',
        explanation: 'Uₙ = a·rⁿ⁻¹, jadi U₄ = 2 × 3³ = 54. Pangkatnya n − 1, bukan n.',
      },
    ],
    judulB: 'B. Dugaan awalmu vs hasil perhitungan',
    judulC: 'C. Masalah baru',
    transfer: {
      label:
        'Sebuah file 81 MB dikompresi berulang; setiap putaran menghasilkan cadangan berukuran ⅓ cadangan sebelumnya: 81, 27, 9, … MB. Total ukuran 5 cadangan pertama = … MB',
      jawab: 121,
      cek: { a: 81, r: 1 / 3, n: 5 },
      hints: [
        'Geometri menurun: a = 81, r = ⅓, n = 5. Pakai Sₙ = a(1 − rⁿ)/(1 − r).',
        'Atau jumlahkan: 81 + 27 + 9 + 3 + 1.',
      ],
      bukti: 'S₅ = 81 × (1 − 1/243) / (2/3) = 121 MB. Cek: 81 + 27 + 9 + 3 + 1 = 121. ✓',
    },
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses menemukan, membuktikan, dan menerapkan rumus Sₙ.',
    guru: 'Baca jawaban refleksi secara acak. Murid yang memilih "perlu bantuan" didampingi pada pertemuan berikutnya, terutama pada langkah r·Sₙ − Sₙ.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri mengapa Sₙ = a(rⁿ − 1)/(r − 1) selalu benar untuk r ≠ 1.',
        placeholder: 'Jika Sₙ dikali r lalu dikurangi Sₙ …',
      },
      {
        id: 'r2',
        teks: 'Bagaimana caramu memutuskan memakai rumus deret aritmetika atau geometri pada sebuah masalah?',
        placeholder: 'Aku melihat dulu apakah suku-sukunya ditambah atau dikali …',
      },
      {
        id: 'r3',
        teks: 'Apa yang paling mengejutkanmu dari masalah kontrak Nadia, dan di mana lagi kamu bisa memakai ide ini?',
        placeholder: 'Aku kaget ternyata …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu dapat membuktikan dan memakai rumus Sₙ deret geometri sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '🙂 Yakin — aku bisa memakai rumusnya' },
      { id: 'ragu', label: '🤔 Masih ragu di bagian pembuktian' },
      { id: 'bantuan', label: '🙋 Aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Keren, masalah Nadia terpecahkan!',
    teks: 'Kamu menemukan dan membuktikan rumus Sₙ deret geometri, lalu memakainya bersama rumus deret aritmetika untuk mengambil keputusan nyata.',
    capaian: [
      'Mengenali deret aritmetika dan geometri dari masalah kontekstual.',
      'Menemukan Sₙ = a(rⁿ − 1)/(r − 1) dengan trik “kalikan r, geser, kurangkan”.',
      'Membuktikan rumus untuk deret geometri umum dan memahami syarat r ≠ 1.',
      'Menguji rumus pada data, termasuk deret menurun (0 < r < 1).',
      'Menyelesaikan masalah kontekstual deret aritmetika dan geometri, serta menyajikan rekomendasi berbasis bukti.',
    ],
  },
};
