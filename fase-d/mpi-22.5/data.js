'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Masalah Kontekstual Volume Prisma
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Tujuan Pembelajaran:
   Menyelesaikan masalah kontekstual yang berkaitan dengan volume
   prisma.

   Model pembelajaran: PROBLEM BASED LEARNING (PBL).
   Masalah pemantik: "Kolam Nila Adiwiyata".
   OSIS menitipkan surat berisi rencana kolam ikan nila sekolah:
     • 200 ekor bibit nila; kepadatan aman paling banyak 25 ekor per m³
       air (jadi butuh air ≥ 8 m³); lahan 4 m × 3 m;
     • tiga desain kolam — A balok, B prisma trapesium REBAH (dasar
       miring, dalam 1,4 m dan 0,8 m), C prisma segitiga REBAH
       (penampang V);
     • tandon air hujan balok 1 m × 1 m × 2 m, saat ini penuh;
     • pompa 20 liter/menit, hanya bisa dinyalakan pada jam sekolah
       07.00–14.00 (420 menit);
     • kekurangan air dibeli dari PDAM Rp5.000 per m³; bibit Rp300 per
       ekor; dana OSIS Rp100.000;
     • bibit dikarantina dulu dalam bak sudut (prisma segitiga tegak)
       berisi tepat 60 liter air.
   Konflik kognitif: "alas prisma selalu di bawah", "lupa ½ pada
   penampang V membuat kolam C tampak paling besar", "1 m³ = 100 atau
   1.000.000 liter", "4,4 kali → 4 kali", "tinggi air = V × luas alas".
   Hasil akhirnya: hanya kolam B yang cukup; pompa butuh 7 jam 20 menit
   (lebih lama dari jam sekolah) sehingga kelompok harus mengambil
   keputusan jadwal pengisian yang masuk akal, lalu menyajikannya.

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ....... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar . 'organisasi'
     Sintaks 3 — Membimbing penyelidikan ............ 'selidikKolam',
                                                      'selidikIsi',
                                                      'selidikAir'
     Sintaks 4 — Mengembangkan & menyajikan karya ... 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi ........ 'evaluasi'
     Penerapan & penutup ............................ 'terapkan', 'refleksi',
                                                      'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — murid menduga, memilah informasi,
       menyusun rencana, memeriksa lembar kerja kelompok lain, lalu
       merefleksikan strateginya.
     • Bermakna (meaningful) — setiap perhitungan menjawab kebutuhan
       nyata kolam sekolah (ikan, air, waktu, biaya) dan berujung pada
       keputusan yang disajikan kepada OSIS.
     • Menggembirakan (joyful) — gambar kolam 3D dengan alas yang
       disorot, Lab Isi Air yang bisa digeser, umpan balik yang menunjuk
       letak kekeliruan, dan Papan Proposal yang dipresentasikan.

   Rangkaian aktivitas (± 2 × 40 menit; kelompok 3–4 murid):
     1. Orientasi   (8')  — surat OSIS, gambar tiga desain kolam, dugaan
                            awal (tidak dinilai), rumusan masalah inti,
                            hipotesis kelompok.
     2. Organisasi  (6')  — memilih peran, memilah informasi
                            (diketahui/ditanya/tidak diperlukan),
                            menyusun urutan rencana penyelesaian.
     3. Kolam       (12') — mengenali alas prisma rebah, kartu data
                            luas alas, volume, dan banyak ikan tiap
                            desain berdiagnosa; memilih desain.
     4. Pengisian   (12') — m³ → liter, isi ulang tandon (bulat ke atas),
                            waktu pompa (menit → jam), biaya PDAM.
     5. Tinggi air  (10') — Lab Isi Air pada bak karantina: geser tinggi
                            air hingga tepat 60 liter, lalu buktikan
                            dengan tinggi = V : luas alas.
     6. Karya       (10') — keputusan desain & jadwal pompa, Papan
                            Proposal otomatis, kalimat presentasi.
     7. Evaluasi    (8')  — menilai lembar kerja Kelompok Cupang langkah
                            demi langkah, menarik pelajaran, refleksi
                            proses & hipotesis.
     8. Uji terap   (10') — 8 soal kontekstual berdiagnosa.
     9. Refleksi    (4')  — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/
   ensureTapOrderState()/shuffleArray() dari shared/engine.js, satu kali
   saat state disiapkan.

   Penampang kolam ditulis sebagai titik [x, z] dalam meter (x mendatar,
   z tegak); kolam memanjang sejauh `panjang` (= tinggi prisma). Alas bak
   ditulis sebagai titik [x, y] dalam cm. Semua kunci dihitung ulang
   dengan engine seksi 47, 54, dan 55 di tests/mpi-22.5-data.test.js.
   ============================================================ */

var PBL = 'Problem Based Learning';

var DATA = {
  /* ----------------------------------------------------------
     MASALAH PEMANTIK — dipakai di beberapa tahap
     ---------------------------------------------------------- */
  kolam: [
    {
      id: 'A',
      nama: 'Kolam A',
      bentuk: 'balok',
      penampang: [
        [0, 0],
        [3, 0],
        [3, 1],
        [0, 1],
      ],
      panjang: 2,
      adaSetengah: false,
      info: 'panjang 3 m, lebar 2 m, dalam 1 m (dasar rata)',
      infoAlas: 'persegi panjang 3 m × 1 m (sisi samping kolam).',
      caraLuasAlas: '3 × 1',
    },
    {
      id: 'B',
      nama: 'Kolam B',
      bentuk: 'prisma trapesium rebah',
      penampang: [
        [0, 0],
        [4, 0.6],
        [4, 1.4],
        [0, 1.4],
      ],
      panjang: 2,
      adaSetengah: true,
      info: 'panjang 4 m, lebar 2 m, dasar miring: dalam 1,4 m di satu ujung dan 0,8 m di ujung lain',
      infoAlas:
        'trapesium: sisi sejajar 1,4 m dan 0,8 m (kedalaman kedua ujung), jarak keduanya 4 m.',
      caraLuasAlas: '½ × (1,4 + 0,8) × 4',
    },
    {
      id: 'C',
      nama: 'Kolam C',
      bentuk: 'prisma segitiga rebah',
      penampang: [
        [0, 1.5],
        [1.2, 0],
        [2.4, 1.5],
      ],
      panjang: 4,
      adaSetengah: true,
      info: 'penampang berbentuk V: lebar atas 2,4 m, dalam 1,5 m di tengah, panjang 4 m',
      infoAlas: 'segitiga dengan alas 2,4 m (lebar permukaan) dan tinggi 1,5 m (kedalaman).',
      caraLuasAlas: '½ × 2,4 × 1,5',
    },
  ],
  lahan: { panjang: 4, lebar: 3 },
  kebutuhanIkan: 200,
  kepadatan: 25,
  tandon: {
    alas: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    t: 2,
  },
  pompa: { debit: 20, batasMenit: 420 },
  pdam: { harga: 5000 },
  bibit: { banyak: 200, harga: 300 },
  dana: 100000,
  bak: {
    id: 'bak',
    nama: '🛁 Bak karantina',
    alas: [
      [0, 0],
      [60, 0],
      [0, 50],
    ],
    t: 50,
    info: 'bak sudut: alas segitiga siku-siku 60 cm × 50 cm, tinggi bak 50 cm',
  },
  targetLiter: 60,

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI PADA MASALAH (PBL sintaks 1)
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi pada Masalah',
    syntax: PBL + ' · Sintaks 1',
    goal: 'Memahami masalah nyata pembuatan kolam nila sekolah dan menyampaikan dugaan awal kelompok.',
    tp: 'Menyelesaikan masalah kontekstual yang berkaitan dengan volume prisma.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Mengenali alas dan tinggi prisma pada benda nyata, termasuk prisma yang rebah.',
      'Menghitung volume prisma untuk menentukan daya tampung dan membandingkan beberapa pilihan.',
      'Mengubah satuan volume (m³, liter, cm³) dan membulatkan hasil sesuai konteks.',
      'Menghitung tinggi air, waktu pengisian, dan biaya, lalu menyajikan keputusan berdasarkan hitungan.',
    ],
    guru: 'Bacakan surat OSIS dengan antusias dan tunjukkan gambar tiga kolam. Tanyakan: “Kolam mana yang paling banyak airnya? Mana alas prismanya?” Jangan membenarkan dugaan murid — dugaan ini diuji sendiri pada tahap penyelidikan dan evaluasi.',
    judul: 'Kolam Nila Adiwiyata',
    pengantar:
      'Sekolahmu ikut program Sekolah Adiwiyata. OSIS ingin membuat kolam ikan nila di taman sekolah dan mengisinya dengan air hujan dari tandon. Kelompokmu ditunjuk menjadi tim perencana: memilih desain kolam, menghitung air yang dibutuhkan, lama pengisian, dan biayanya.',
    surat: [
      {
        id: 'sIkan',
        ikon: '🐟',
        judul: 'Ikan nila',
        butir: [
          'Ada 200 ekor bibit nila, harganya Rp300 per ekor.',
          'Agar ikan sehat, setiap 1 m³ air paling banyak diisi 25 ekor.',
        ],
      },
      {
        id: 'sKolam',
        ikon: '🏞️',
        judul: 'Desain kolam',
        butir: [
          'Lahan yang tersedia 4 m × 3 m. Ada tiga desain: A (balok), B (dasar miring), dan C (penampang V).',
          'Kolam diisi air sampai penuh.',
        ],
      },
      {
        id: 'sAir',
        ikon: '💧',
        judul: 'Sumber air',
        butir: [
          'Tandon air hujan berbentuk balok 1 m × 1 m × 2 m, saat ini penuh.',
          'Kekurangan air dibeli dari PDAM seharga Rp5.000 per m³.',
        ],
      },
      {
        id: 'sPompa',
        ikon: '⚙️',
        judul: 'Pompa air',
        butir: [
          'Pompa mengalirkan 20 liter air setiap menit.',
          'Pompa hanya boleh menyala pada jam sekolah, pukul 07.00–14.00.',
        ],
      },
      {
        id: 'sBak',
        ikon: '🛁',
        judul: 'Bak karantina',
        butir: ['Sebelum masuk kolam, bibit dikarantina di bak sudut berisi tepat 60 liter air.'],
      },
      {
        id: 'sDana',
        ikon: '💰',
        judul: 'Dana OSIS',
        butir: ['Dana yang tersedia Rp100.000 untuk bibit dan air PDAM.'],
      },
    ],
    dugaan: [
      {
        id: 'd1',
        tanya: 'Menurut kelompokmu, kolam mana yang paling banyak menampung air?',
        opsi: [
          { id: 'A', label: 'Kolam A (balok)' },
          { id: 'B', label: 'Kolam B (dasar miring)' },
          { id: 'C', label: 'Kolam C (penampang V)' },
          { id: 'sama', label: 'Sama saja, karena lahannya sama' },
        ],
      },
      {
        id: 'd2',
        tanya: 'Menurut kelompokmu, berapa lama pompa 20 liter/menit mengisi kolam sampai penuh?',
        opsi: [
          { id: 'sejam', label: 'Kurang dari 1 jam' },
          { id: 'tiga', label: 'Sekitar 1–3 jam' },
          { id: 'sehari', label: 'Sekitar 7 jam (hampir seharian sekolah)' },
          { id: 'lama', label: 'Berhari-hari' },
        ],
      },
    ],
    alasanLabel: 'Tuliskan alasan dugaan kelompokmu.',
    alasanPlaceholder: 'Kami menduga begitu karena …',
    catatanDugaan: 'Dugaan tidak dinilai. Kalian akan mengujinya sendiri pada tahap penyelidikan.',
    pertanyaan: 'Apa pertanyaan inti yang harus diselesaikan kelompokmu?',
    masalahOpsi: [
      {
        id: 'inti',
        label:
          'Kolam mana yang cukup untuk 200 ekor nila, berapa air yang dibutuhkan, berapa lama mengisinya, dan berapa biayanya?',
      },
      { id: 'keramik', label: 'Berapa banyak keramik untuk melapisi dinding kolam?' },
      { id: 'pagar', label: 'Berapa panjang pagar untuk mengelilingi lahan kolam?' },
      { id: 'panen', label: 'Berapa keuntungan dari menjual ikan nila saat panen?' },
    ],
    masalahCorrect: 'inti',
    masalahUmpan: {
      inti: 'Tepat! Daya tampung ikan, kebutuhan air, waktu pompa, dan biaya semuanya bergantung pada VOLUME kolam.',
      keramik:
        'Keramik berhubungan dengan luas permukaan. OSIS justru bertanya tentang air (isi) kolam dan ikannya.',
      pagar:
        'Panjang pagar dihitung dari keliling lahan, bukan isi kolam. Fokuslah pada air dan ikan.',
      panen: 'Surat OSIS tidak memuat data penjualan. Fokuslah pada kolam, air, dan dananya.',
    },
    hipotesisLabel:
      'Tulis hipotesis kelompokmu: langkah apa yang akan kalian lakukan untuk memilih kolam dan menghitung airnya?',
    hipotesisPlaceholder: 'Menurut kami, pertama-tama kita harus …',
    nextLabel: 'Lanjut: Atur Kelompok →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENGORGANISASI MURID (PBL sintaks 2)
     ---------------------------------------------------------- */
  organisasi: {
    kicker: 'Tahap 2 · Mengorganisasi Belajar',
    syntax: PBL + ' · Sintaks 2',
    goal: 'Membagi peran, memilah informasi dari surat OSIS, dan menyusun rencana penyelesaian.',
    guru: 'Pastikan setiap anggota memegang satu peran dan peran ditukar pada pertemuan berikutnya. Saat pemilahan, minta kelompok menjelaskan mengapa warna cat pagar tidak diperlukan. Rencana yang tersusun menjadi peta langkah pada tiga penyelidikan berikutnya.',
    peranLabel: 'Pilih peranmu di kelompok:',
    peran: [
      {
        id: 'ketua',
        label:
          '🧭 <strong>Ketua Tim</strong> — memastikan semua anggota berpendapat dan rencana diikuti.',
      },
      {
        id: 'ukur',
        label:
          '📏 <strong>Juru Ukur</strong> — menentukan alas dan tinggi prisma beserta ukurannya.',
      },
      {
        id: 'hitung',
        label: '🧮 <strong>Juru Hitung</strong> — menghitung volume dan mengubah satuan volume.',
      },
      {
        id: 'air',
        label:
          '💧 <strong>Juru Air</strong> — menghitung isi ulang tandon, waktu pompa, dan biaya air.',
      },
    ],
    judulPilah: 'Pilah informasi dari surat OSIS',
    opsiPilah: [
      { id: 'diketahui', label: 'Diketahui' },
      { id: 'ditanya', label: 'Ditanya' },
      { id: 'tidakPerlu', label: 'Tidak diperlukan' },
    ],
    pilah: [
      {
        id: 'i1',
        teks: 'Setiap 1 m³ air paling banyak diisi 25 ekor nila.',
        correct: 'diketahui',
        explanation: 'Kepadatan dipakai untuk menghitung banyak ikan yang aman di setiap kolam.',
      },
      {
        id: 'i2',
        teks: 'Kolam B dalamnya 1,4 m di satu ujung dan 0,8 m di ujung lain, panjang 4 m, lebar 2 m.',
        correct: 'diketahui',
        explanation: 'Ukuran ini dipakai untuk menghitung luas alas trapesium dan volume kolam B.',
      },
      {
        id: 'i3',
        teks: 'Pompa mengalirkan 20 liter air setiap menit.',
        correct: 'diketahui',
        explanation: 'Debit pompa dipakai untuk menghitung lama pengisian.',
      },
      {
        id: 'i4',
        teks: 'Kolam mana yang cukup untuk 200 ekor nila?',
        correct: 'ditanya',
        explanation: 'Ini keputusan pertama yang harus dijawab kelompok.',
      },
      {
        id: 'i5',
        teks: 'Berapa lama pompa bekerja sampai kolam penuh?',
        correct: 'ditanya',
        explanation: 'Lama pengisian menentukan jadwal kerja pompa.',
      },
      {
        id: 'i6',
        teks: 'Berapa biaya air PDAM, dan cukupkah dana Rp100.000?',
        correct: 'ditanya',
        explanation: 'Biaya ini akan disajikan dalam proposal kepada OSIS.',
      },
      {
        id: 'i7',
        teks: 'Pagar kolam akan dicat hijau.',
        correct: 'tidakPerlu',
        explanation: 'Warna pagar tidak memengaruhi volume air, ikan, waktu, maupun biaya air.',
      },
      {
        id: 'i8',
        teks: 'Nila dewasa bisa mencapai berat 500 gram.',
        correct: 'tidakPerlu',
        explanation: 'Berat ikan dewasa tidak dipakai dalam perhitungan kolam saat ini.',
      },
    ],
    judulRencana: 'Susun rencana penyelesaian kelompok',
    instruksiRencana: 'Ketuk langkah-langkah berikut sesuai urutan yang paling masuk akal.',
    rencana: [
      { id: 'r1', label: '🔍 Kenali alas dan tinggi prisma (bisa jadi prismanya rebah)' },
      { id: 'r2', label: '📐 Hitung luas alas, lalu volume = luas alas × tinggi' },
      { id: 'r3', label: '🔁 Ubah satuan volume sesuai kebutuhan (m³ → liter)' },
      { id: 'r4', label: '⚖️ Bandingkan dengan kebutuhan: ikan, tandon, pompa, dana' },
      { id: 'r5', label: '🪧 Ambil keputusan dan sajikan dalam proposal' },
    ],
    rencanaSukses:
      '<strong>Rencana tersusun!</strong> Alas & tinggi → volume → satuan → bandingkan kebutuhan → keputusan. Rencana ini kalian jalankan pada tiga penyelidikan berikutnya.',
    nextLabel: 'Mulai Penyelidikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENYELIDIKAN 1: DESAIN KOLAM (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikKolam: {
    kicker: 'Tahap 3 · Penyelidikan 1 — Desain Kolam',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Mengenali alas prisma rebah, menghitung volume tiga desain kolam, dan menentukan kolam yang cukup untuk 200 ekor nila.',
    guru: 'Tunjukkan bahwa sisi yang disorot jingga adalah ALAS prisma: dua sisi sejajar yang kongruen, meskipun berdiri tegak. Tinggi prisma adalah jarak kedua alas (lebar atau panjang kolam). Pantau kekeliruan “lupa ½” pada kolam B dan C — kolam C lalu tampak paling besar.',
    instruksi:
      'Perhatikan gambar setiap kolam. Sisi berwarna jingga adalah ALAS prisma. Kolam B dan C adalah prisma yang REBAH: alasnya berdiri di samping, dan tinggi prismanya adalah jarak antara kedua alas.',
    instruksiData:
      'Hitung luas alas, volume (m³), lalu banyak ikan yang aman (25 ekor setiap 1 m³) untuk setiap kolam.',
    tanya: [
      {
        id: 'k1',
        tanya: 'Kolam mana yang cukup untuk 200 ekor nila?',
        opsi: [
          { id: 'B', label: 'Kolam B' },
          { id: 'A', label: 'Kolam A' },
          { id: 'C', label: 'Kolam C' },
          { id: 'semua', label: 'Ketiganya cukup' },
        ],
        correct: 'B',
        umpan: {
          B: 'Tepat! Kolam B bervolume 8,8 m³ dan aman untuk 220 ekor, lebih dari 200.',
          A: 'Kolam A hanya 6 m³, aman untuk 150 ekor. Masih kurang dari 200.',
          C: 'Kolam C 7,2 m³, aman untuk 180 ekor. Kalau kamu mendapat 14,4 m³, periksa lagi: luas alas segitiga memakai ½.',
          semua:
            'Bandingkan banyak ikan di kartu data: 150, 220, dan 180 ekor. Hanya satu yang ≥ 200.',
        },
      },
      {
        id: 'k2',
        tanya:
          'Mengapa alas kolam B adalah trapesium di sisi samping, bukan persegi panjang di dasar kolam?',
        opsi: [
          {
            id: 'sejajar',
            label:
              'Alas prisma adalah dua sisi yang sejajar dan kongruen; pada kolam B keduanya trapesium',
          },
          { id: 'bawah', label: 'Alas prisma selalu sisi yang paling bawah' },
          { id: 'besar', label: 'Alas prisma adalah sisi yang paling luas' },
          { id: 'bebas', label: 'Sisi mana pun boleh dipakai sebagai alas' },
        ],
        correct: 'sejajar',
        umpan: {
          sejajar:
            'Tepat! Dua sisi trapesium itu sejajar dan kongruen, dan penampang kolam sama sepanjang lebarnya. Jadi V = luas trapesium × 2 m.',
          bawah:
            'Dasar kolam B miring dan tidak punya pasangan yang sejajar-kongruen, jadi bukan alas prisma. Coba pilih yang lain.',
          besar:
            'Alas tidak ditentukan oleh ukurannya, tetapi oleh pasangan sisi yang sejajar dan kongruen. Coba pilih yang lain.',
          bebas:
            'Kalau sisi yang dipilih bukan alas, luas alas × tinggi tidak menghasilkan volume. Coba pilih yang lain.',
        },
      },
    ],
    temuan:
      'Kolam B dipilih: 8,8 m³, aman untuk 220 ekor. Pada prisma rebah, alasnya tetap dua sisi sejajar yang kongruen, dan V = luas alas × tinggi prisma.',
    nextLabel: 'Lanjut: Penyelidikan 2 →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENYELIDIKAN 2: PENGISIAN KOLAM (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikIsi: {
    kicker: 'Tahap 4 · Penyelidikan 2 — Mengisi Kolam',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Mengubah volume kolam ke liter, menghitung isi ulang tandon, waktu pompa, dan biaya air PDAM.',
    guru: 'Juru Air memimpin tahap ini. Pantau tiga kekeliruan klasik: 1 m³ dianggap 100 atau 10 liter, 4,4 kali dibulatkan menjadi 4, dan volume dikali debit. Minta kelompok menjelaskan mengapa banyak isi ulang dibulatkan ke atas.',
    instruksi:
      'Isi kartu setiap kebutuhan. Boleh memakai titik ribuan (contoh 8.800) dan desimal dengan koma (contoh 4,4). Uang ditulis tanpa “Rp”.',
    tanya: [
      {
        id: 'i1',
        tanya: '1 m³ sama dengan …',
        opsi: [
          { id: '1000', label: '1.000 liter' },
          { id: '100', label: '100 liter' },
          { id: '10', label: '10 liter' },
          { id: '1000000', label: '1.000.000 liter' },
        ],
        correct: '1000',
        umpan: {
          1000: 'Tepat! 1 m³ = 10 dm × 10 dm × 10 dm = 1.000 dm³ = 1.000 liter.',
          100: '100 adalah faktor satuan LUAS (1 m² = 100 dm²). Volume punya tiga dimensi: 10 × 10 × 10.',
          10: '10 adalah faktor satuan PANJANG (1 m = 10 dm). Volume punya tiga dimensi: 10 × 10 × 10.',
          1000000: '1.000.000 adalah faktor m³ ke cm³. Liter sama dengan dm³.',
        },
      },
      {
        id: 'i2',
        tanya: 'Mengapa hasil 8.800 : 2.000 = 4,4 dibulatkan menjadi 5 kali mengisi tandon?',
        opsi: [
          {
            id: 'cukup',
            label: 'Agar air cukup; 4 kali hanya 8.000 liter, kurang dari 8.800 liter',
          },
          { id: 'dekat', label: 'Karena 4,4 lebih dekat ke 5 daripada ke 4' },
          { id: 'aturan', label: 'Karena semua bilangan desimal selalu dibulatkan ke atas' },
          { id: 'hemat', label: 'Agar airnya lebih hemat' },
        ],
        correct: 'cukup',
        umpan: {
          cukup:
            'Tepat! Kebutuhan harus terpenuhi, jadi banyak kali mengisi dibulatkan ke atas walau desimalnya kecil.',
          dekat:
            'Justru 4,4 lebih dekat ke 4. Pembulatan di sini bukan soal dekat-jauh, melainkan cukup atau tidak.',
          aturan:
            'Tidak selalu. Banyak ikan yang aman justru dibulatkan ke bawah. Pembulatan mengikuti konteks.',
          hemat: '5 kali justru lebih banyak daripada 4 kali. Alasannya adalah agar air cukup.',
        },
      },
      {
        id: 'i3',
        tanya:
          'Pompa hanya boleh menyala 07.00–14.00 (420 menit). Apa artinya bagi pengisian kolam?',
        opsi: [
          {
            id: 'duaHari',
            label: 'Kolam tidak penuh dalam satu hari sekolah; pengisian perlu 2 hari',
          },
          { id: 'cukup', label: 'Kolam pasti penuh sebelum pukul 14.00' },
          { id: 'tiga', label: 'Kolam penuh dalam 3 jam' },
          { id: 'tidakBisa', label: 'Kolam tidak mungkin diisi dengan pompa itu' },
        ],
        correct: 'duaHari',
        umpan: {
          duaHari: 'Tepat! Pompa butuh 440 menit, 20 menit lebih lama dari 420 menit jam sekolah.',
          cukup: '440 menit lebih dari 420 menit. Hitung lagi 8.800 : 20.',
          tiga: '3 jam = 180 menit; dengan 20 liter/menit baru 3.600 liter. Hitung lagi.',
          tidakBisa:
            'Pompa tetap bisa mengisinya, hanya waktunya lebih lama dari satu hari sekolah.',
        },
      },
    ],
    temuan:
      '8,8 m³ = 8.800 liter. Tandon diisi ulang 5 kali (bulat ke atas). Pompa butuh 440 menit = 7 jam 20 menit. Air PDAM (8,8 − 2) × Rp5.000 = Rp34.000.',
    nextLabel: 'Lanjut: Penyelidikan 3 →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENYELIDIKAN 3: TINGGI AIR BAK (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikAir: {
    kicker: 'Tahap 5 · Penyelidikan 3 — Tinggi Air Bak Karantina',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menentukan tinggi air pada bak prisma segitiga agar isinya tepat 60 liter, lalu membuktikannya dengan tinggi = V : luas alas.',
    guru: 'Biarkan murid menggeser tinggi air di Lab Isi Air sampai tepat 60 liter. Tanyakan: “Setiap naik 1 cm, air bertambah berapa?” (luas alas × 1 cm). Lalu minta mereka membuktikan tanpa lab: tinggi = volume : luas alas.',
    instruksi:
      'Bibit nila harus dikarantina dalam bak sudut berisi tepat 60 liter air. Geser tinggi air di Lab Isi Air sampai tepat 60 liter, lalu buktikan dengan hitungan di kartu.',
    instruksiData: 'Buktikan temuan lab dengan hitungan.',
    tanya: [
      {
        id: 'a1',
        tanya: 'Setiap tinggi air naik 1 cm, volume air di bak bertambah …',
        opsi: [
          { id: 'la', label: '1.500 cm³ (= luas alas × 1 cm)' },
          { id: 'keliling', label: '1.500 cm (= keliling alas)' },
          { id: 'tetap', label: 'Berbeda-beda, makin ke atas makin banyak' },
          { id: 'seribu', label: '1.000 cm³ (= 1 liter)' },
        ],
        correct: 'la',
        umpan: {
          la: 'Tepat! Setiap lapisan air setebal 1 cm berbentuk segitiga yang sama, isinya 1.500 cm³ = 1,5 liter.',
          keliling:
            'Keliling berbentuk panjang (cm), bukan isi. Lapisan air setebal 1 cm isinya luas alas × 1 cm.',
          tetap:
            'Pada prisma tegak, setiap lapisan sama besar karena bentuk alasnya sama dari bawah sampai atas.',
          seribu: 'Lihat bacaan lab saat tinggi air naik 1 cm: bertambah 1,5 liter, bukan 1 liter.',
        },
      },
      {
        id: 'a2',
        tanya: 'Rumus tinggi air bila volume air dan luas alas wadah prisma diketahui adalah …',
        opsi: [
          { id: 'bagi', label: 'tinggi = volume : luas alas' },
          { id: 'kali', label: 'tinggi = volume × luas alas' },
          { id: 'keliling', label: 'tinggi = volume : keliling alas' },
          { id: 'kurang', label: 'tinggi = volume − luas alas' },
        ],
        correct: 'bagi',
        umpan: {
          bagi: 'Tepat! Dari V = luas alas × t, maka t = V : luas alas = 60.000 : 1.500 = 40 cm.',
          kali: '60.000 × 1.500 = 90.000.000 cm, jauh lebih tinggi dari baknya. Coba pilih yang lain.',
          keliling: 'Air mengisi LUAS alas, bukan kelilingnya. Coba pilih yang lain.',
          kurang:
            'Volume dan luas alas satuannya berbeda, tidak bisa dikurangkan. Coba pilih yang lain.',
        },
      },
    ],
    temuan:
      'Tinggi air 40 cm (80% bak). Bila volume dan luas alas diketahui: tinggi = volume : luas alas.',
    nextLabel: 'Lanjut: Susun Karya →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGEMBANGKAN & MENYAJIKAN KARYA (PBL sintaks 4)
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 6 · Menyajikan Karya',
    syntax: PBL + ' · Sintaks 4',
    goal: 'Mengambil keputusan desain dan jadwal pengisian berdasarkan perhitungan, lalu menyusun dan menyajikan Papan Proposal kelompok.',
    guru: 'Minta setiap kelompok mempresentasikan Papan Proposal (1–2 menit) di depan kelas atau dalam galeri berjalan. Kelompok lain memberi satu pujian dan satu pertanyaan. Tekankan bahwa setiap keputusan harus didukung hasil hitung.',
    instruksi:
      'Hasil penyelidikan menunjukkan pompa butuh waktu lebih lama dari satu hari sekolah. Ambil keputusan yang masuk akal, lalu susun proposal untuk OSIS.',
    tanya: [
      {
        id: 'p1',
        tanya: 'Mengapa kelompok memilih kolam B?',
        opsi: [
          {
            id: 'volume',
            label: 'Volumenya 8,8 m³, aman untuk 220 ekor (≥ 200), dan muat di lahan',
          },
          { id: 'dalam', label: 'Kolam B paling dalam' },
          { id: 'panjang', label: 'Kolam B paling panjang, jadi pasti paling besar' },
          { id: 'murah', label: 'Kolam B paling murah' },
        ],
        correct: 'volume',
        umpan: {
          volume: 'Tepat! Keputusan didukung hasil hitung volume dan kepadatan ikan.',
          dalam:
            'Kolam C justru paling dalam (1,5 m), tetapi volumenya hanya 7,2 m³. Coba pilih yang lain.',
          panjang:
            'Kolam C juga 4 m panjangnya. Yang menentukan adalah volume hasil hitung. Coba pilih yang lain.',
          murah: 'Surat OSIS tidak memuat biaya pembuatan kolam. Coba pilih yang lain.',
        },
      },
      {
        id: 'p2',
        tanya:
          'Pompa butuh 440 menit, padahal hanya boleh menyala 420 menit per hari. Jadwal mana yang TEPAT?',
        opsi: [
          {
            id: 'duaHari',
            label: 'Hari 1: pompa 420 menit (8.400 liter); hari 2: 20 menit lagi (400 liter)',
          },
          { id: 'malam', label: 'Menyalakan pompa sampai malam tanpa izin' },
          { id: 'kurang', label: 'Mengisi 420 menit saja; kolam tidak perlu penuh' },
          { id: 'kolamA', label: 'Mengganti ke kolam A agar lebih cepat penuh' },
        ],
        correct: 'duaHari',
        umpan: {
          duaHari:
            'Tepat! 420 × 20 = 8.400 liter pada hari pertama, sisa 400 liter diisi 20 menit pada hari kedua. Aturan sekolah tetap dipatuhi.',
          malam:
            'Melanggar aturan OSIS: pompa hanya boleh menyala pada jam sekolah. Coba pilih yang lain.',
          kurang:
            'Kolam yang tidak penuh volumenya berkurang, sehingga tidak aman lagi untuk 200 ekor. Coba pilih yang lain.',
          kolamA: 'Kolam A hanya aman untuk 150 ekor. Coba pilih yang lain.',
        },
      },
    ],
    proposalJudul: 'Proposal Kolam Nila Adiwiyata',
    presentasiLabel:
      'Tulis kalimat presentasi kelompokmu untuk OSIS (keputusan + alasan berdasarkan hitungan).',
    presentasiPlaceholder:
      'Kami memilih kolam B karena … Air yang dibutuhkan … Pompa dinyalakan … Biayanya … sehingga …',
    penutup:
      'Semua angka dihitung dari V = luas alas × tinggi, dengan satuan dan pembulatan yang sesuai konteks.',
    nextLabel: 'Lanjut: Evaluasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENGANALISIS & MENGEVALUASI (PBL sintaks 5)
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 7 · Analisis & Evaluasi',
    syntax: PBL + ' · Sintaks 5',
    goal: 'Mengevaluasi proses penyelesaian masalah: memeriksa lembar kerja kelompok lain dan merefleksikan strategi sendiri.',
    guru: 'Bahas bersama langkah-langkah yang keliru pada lembar kerja Kelompok Cupang. Minta kelompok membandingkan hipotesis awal dengan hasil penyelidikan dan menuliskan satu hal yang akan mereka lakukan berbeda.',
    lembarJudul: '📝 Lembar kerja Kelompok Cupang',
    instruksiLembar:
      'Kelompok Cupang menyelesaikan masalah yang sama. Periksa setiap langkah mereka: benar atau keliru?',
    opsiNilai: [
      { id: 'benar', label: '✓ Benar' },
      { id: 'keliru', label: '✗ Keliru' },
    ],
    langkah: [
      {
        id: 'e1',
        teks: 'Luas alas kolam C = 2,4 × 1,5 = 3,6 m², jadi volumenya 3,6 × 4 = 14,4 m³.',
        correct: 'keliru',
        explanation: 'Alasnya segitiga, jadi luasnya ½ × 2,4 × 1,5 = 1,8 m² dan volumenya 7,2 m³.',
      },
      {
        id: 'e2',
        teks: 'Volume kolam B = ½ × (1,4 + 0,8) × 4 × 2 = 8,8 m³.',
        correct: 'benar',
        explanation: 'Luas alas trapesium 4,4 m² dikali tinggi prisma 2 m.',
      },
      {
        id: 'e3',
        teks: 'Kolam A 6 m³ aman untuk 6 × 25 = 150 ekor.',
        correct: 'benar',
        explanation: 'Setiap 1 m³ memuat paling banyak 25 ekor, jadi 6 × 25 = 150 ekor.',
      },
      {
        id: 'e4',
        teks: '8,8 m³ = 880 liter.',
        correct: 'keliru',
        explanation: '1 m³ = 1.000 liter, jadi 8,8 m³ = 8.800 liter.',
      },
      {
        id: 'e5',
        teks: 'Tandon 2.000 liter: 8.800 : 2.000 = 4,4, jadi tandon diisi 4 kali.',
        correct: 'keliru',
        explanation: '4 kali hanya 8.000 liter, belum cukup. Dibulatkan ke atas: 5 kali.',
      },
      {
        id: 'e6',
        teks: 'Pompa: 8.800 : 20 = 440 menit = 7 jam 20 menit.',
        correct: 'benar',
        explanation: '440 = 7 × 60 + 20.',
      },
      {
        id: 'e7',
        teks: 'Tinggi air bak = 60.000 × 1.500 = 90.000.000 cm.',
        correct: 'keliru',
        explanation: 'Tinggi = volume : luas alas = 60.000 : 1.500 = 40 cm.',
      },
    ],
    tanya: [
      {
        id: 'v1',
        tanya: 'Pelajaran terpenting dari lembar kerja Kelompok Cupang adalah …',
        opsi: [
          {
            id: 'alas',
            label:
              'Kenali alas prisma dengan benar, lalu perhatikan satuan volume dan arah pembulatan',
          },
          { id: 'kali', label: 'Kalikan saja semua ukuran yang ada di soal' },
          { id: 'bawah', label: 'Hasil bagi selalu dibulatkan ke bawah agar hemat' },
          { id: 'satuan', label: 'Satuan boleh diabaikan asal angkanya benar' },
        ],
        correct: 'alas',
        umpan: {
          alas: 'Tepat! Kekeliruan Kelompok Cupang berasal dari luas alas, satuan volume, pembulatan, dan rumus tinggi.',
          kali: 'Mengalikan semua ukuran membuat kolam C tampak 14,4 m³, padahal luas alas segitiga memakai ½. Coba pilih yang lain.',
          bawah:
            'Membulatkan isi ulang ke bawah membuat airnya kurang, seperti tandon 4 kali. Coba pilih yang lain.',
          satuan:
            'Mengabaikan satuan membuat 8,8 m³ terbaca 880 liter. Satuan sangat penting. Coba pilih yang lain.',
        },
      },
    ],
    dugaanJudul: 'Bandingkan dengan dugaan awal kelompokmu',
    tanggapanDugaan: {
      d1: {
        A: 'Kalian menduga kolam A. Ternyata A hanya 6 m³; yang terbesar B (8,8 m³).',
        B: 'Dugaan kalian tepat! Kolam B paling banyak menampung air, 8,8 m³.',
        C: 'Kalian menduga kolam C. C tampak besar, tetapi volumenya 7,2 m³, masih di bawah B (8,8 m³).',
        sama: 'Kalian menduga sama saja. Ternyata volume ketiganya berbeda: 6, 8,8, dan 7,2 m³.',
      },
      d2: {
        sejam:
          'Kalian menduga kurang dari 1 jam. Ternyata 8.800 liter : 20 liter/menit = 440 menit = 7 jam 20 menit.',
        tiga: 'Kalian menduga 1–3 jam. Ternyata pompa butuh 7 jam 20 menit.',
        sehari:
          'Dugaan kalian hampir tepat! Pompa butuh 7 jam 20 menit, sedikit lebih lama dari jam sekolah.',
        lama: 'Kalian menduga berhari-hari. Ternyata cukup 7 jam 20 menit, dibagi menjadi dua hari sekolah.',
      },
    },
    refleksiLabel:
      'Tulis evaluasi proses kelompokmu: langkah mana yang paling sulit, dan apa yang akan kalian lakukan berbeda lain kali?',
    refleksiPlaceholder: 'Langkah yang paling sulit adalah … Lain kali kami akan …',
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     cek.jenis mengikuti kandidatMasalahVolume (engine seksi 55).
     Soal pilihan ganda: options = opsiMasalahVolume(cek, satuanOpsi,
     { awalan }) — diacak app.js.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: PBL + ' · Penerapan',
    goal: 'Menyelesaikan masalah kontekstual lain yang berkaitan dengan volume prisma.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang banyak salah (luas alas, konversi satuan, pembulatan, tinggi air) untuk dibahas bersama.',
    instruksi:
      'Kerjakan setiap soal. Kenali dulu alas dan tinggi prismanya, lalu perhatikan satuan dan pembulatan. Bila ragu, buka petunjuk.',
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: '🐠 Akuarium',
        cerita: 'Akuarium berbentuk balok dengan alas 60 cm × 30 cm dan tinggi 40 cm.',
        pertanyaan: 'Berapa liter air yang dibutuhkan untuk mengisinya sampai penuh?',
        cek: {
          jenis: 'volume',
          alas: [
            [0, 0],
            [60, 0],
            [60, 30],
            [0, 30],
          ],
          luasAlas: 1800,
          kelilingAlas: 180,
          tinggi: 40,
          dari: 'cm3',
          ke: 'l',
        },
        jawab: 72,
        satuan: 'liter',
        hints: ['V = 60 × 30 × 40 = 72.000 cm³.', '1 liter = 1.000 cm³, jadi bagi dengan 1.000.'],
        explanation: 'V = 1.800 × 40 = 72.000 cm³ = 72 liter.',
      },
      {
        id: 't2',
        type: 'choice',
        konteks: '⛺ Tenda pramuka',
        cerita:
          'Tenda pramuka berbentuk prisma segitiga. Segitiga depannya beralas 3 m, tinggi 2 m, dan sisi miringnya 2,5 m. Panjang tenda 4 m.',
        pertanyaan: 'Berapa volume udara di dalam tenda?',
        cek: {
          jenis: 'volume',
          alas: [
            [0, 0],
            [3, 0],
            [1.5, 2],
          ],
          luasAlas: 3,
          kelilingAlas: 8,
          tinggi: 4,
          adaSetengah: true,
        },
        satuanOpsi: 'm³',
        options: [
          { id: 'benar', label: '12 m³' },
          { id: 'lupa-setengah', label: '24 m³' },
          { id: 'luas-permukaan', label: '38 m³' },
          { id: 'keliling', label: '32 m³' },
        ],
        correct: 'benar',
        hints: [
          'Alas prisma adalah segitiga di depan: ½ × 3 × 2 = 3 m².',
          'Tinggi prisma adalah panjang tenda, 4 m.',
        ],
        explanation: 'V = luas alas × tinggi = 3 × 4 = 12 m³.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: '🪣 Bak mandi',
        cerita:
          'Bak mandi berbentuk balok 80 cm × 60 cm × 50 cm diisi dengan jeriken yang masing-masing berisi 25 liter.',
        pertanyaan: 'Paling sedikit berapa kali jeriken dituang agar bak penuh?',
        cek: {
          jenis: 'isiUlang',
          volume: 240,
          isiWadah: 25,
          sumber: {
            alas: [
              [0, 0],
              [80, 0],
              [80, 60],
              [0, 60],
            ],
            t: 50,
            dari: 'cm3',
            ke: 'l',
            kunci: 'volume',
          },
        },
        jawab: 10,
        satuan: 'kali',
        hints: [
          'V bak = 80 × 60 × 50 = 240.000 cm³ = 240 liter.',
          '240 : 25 = 9,6 → bak harus penuh, jadi bulatkan ke atas.',
        ],
        explanation: '240 liter : 25 liter = 9,6, dibulatkan ke atas menjadi 10 kali.',
      },
      {
        id: 't4',
        type: 'choice',
        konteks: '🍚 Wadah beras',
        cerita: 'Wadah beras berbentuk prisma segitiga mempunyai volume 3.500 cm³.',
        pertanyaan: 'Berapa liter isi wadah itu?',
        cek: { jenis: 'konversi', nilai: 3500, dari: 'cm3', ke: 'l' },
        satuanOpsi: 'liter',
        options: [
          { id: 'benar', label: '3,5 liter' },
          { id: 'faktor-panjang', label: '350 liter' },
          { id: 'faktor-luas', label: '35 liter' },
          { id: 'arah-terbalik', label: '3.500.000 liter' },
        ],
        correct: 'benar',
        hints: ['1 liter = 1 dm³ = 1.000 cm³.', 'Dari cm³ ke liter, bagilah dengan 1.000.'],
        explanation: '3.500 : 1.000 = 3,5 liter.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: '🐡 Tinggi air akuarium',
        cerita: 'Akuarium berbentuk balok dengan alas 50 cm × 40 cm diisi 60 liter air.',
        pertanyaan: 'Berapa cm tinggi air di akuarium itu?',
        cek: {
          jenis: 'tinggi',
          alas: [
            [0, 0],
            [50, 0],
            [50, 40],
            [0, 40],
          ],
          volume: 60000,
          luasAlas: 2000,
          kelilingAlas: 180,
        },
        jawab: 30,
        satuan: 'cm',
        hints: [
          '60 liter = 60.000 cm³. Luas alas = 50 × 40 = 2.000 cm².',
          'Tinggi = V : luas alas.',
        ],
        explanation: 'Tinggi air = 60.000 : 2.000 = 30 cm.',
      },
      {
        id: 't6',
        type: 'choice',
        konteks: '🏊 Kolam renang anak',
        cerita:
          'Kolam renang anak berdasar miring: dalamnya 1 m di satu ujung dan 0,5 m di ujung lain, panjang 8 m, lebar 4 m. Kolam diisi pompa 100 liter per menit.',
        pertanyaan: 'Berapa jam waktu untuk mengisi kolam sampai penuh?',
        cek: {
          jenis: 'waktu',
          volume: 24000,
          debit: 100,
          keJam: true,
          sumber: {
            alas: [
              [0, 0],
              [8, 0.5],
              [8, 1],
              [0, 1],
            ],
            t: 4,
            dari: 'm3',
            ke: 'l',
            kunci: 'volume',
          },
        },
        satuanOpsi: 'jam',
        options: [
          { id: 'benar', label: '4 jam' },
          { id: 'kali-debit', label: '40.000 jam' },
          { id: 'satuan-waktu', label: '240 jam' },
          { id: 'dua-kali', label: '8 jam' },
        ],
        correct: 'benar',
        hints: [
          'Alasnya trapesium di sisi samping: ½ × (1 + 0,5) × 8 = 6 m². V = 6 × 4 = 24 m³ = 24.000 liter.',
          '24.000 : 100 = 240 menit. Ubah ke jam.',
        ],
        explanation: 'V = 24 m³ = 24.000 liter; 24.000 : 100 = 240 menit = 4 jam.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: '🍫 Cetakan cokelat',
        cerita:
          'Adonan cokelat 1 liter dituang ke cetakan berbentuk prisma segitiga. Segitiganya beralas 3 cm dan tinggi 4 cm, panjang cetakan 10 cm.',
        pertanyaan: 'Paling banyak berapa batang cokelat utuh yang dapat dibuat?',
        cek: {
          jenis: 'muat',
          volume: 1000,
          isiSatu: 60,
          sumber: {
            alas: [
              [0, 0],
              [3, 0],
              [1.5, 4],
            ],
            t: 10,
            kunci: 'isiSatu',
          },
        },
        jawab: 16,
        satuan: 'batang',
        hints: [
          'Volume satu cetakan = ½ × 3 × 4 × 10 = 60 cm³. 1 liter = 1.000 cm³.',
          '1.000 : 60 ≈ 16,67 → batang utuh dibulatkan ke bawah.',
        ],
        explanation: '1.000 : 60 ≈ 16,67; batang ke-17 tidak cukup adonannya, jadi 16 batang.',
      },
      {
        id: 't8',
        type: 'choice',
        konteks: '💧 Biaya air kolam',
        cerita:
          'Kolam ikan balok 2 m × 1,5 m × 1 m akan diisi penuh. Sudah ada 1 m³ air hujan; sisanya dibeli dari PDAM seharga Rp6.000 per m³.',
        pertanyaan: 'Berapa biaya air PDAM?',
        cek: {
          jenis: 'biaya',
          kebutuhan: 3,
          tersedia: 1,
          harga: 6000,
          faktorSatuan: 1000,
          sumber: {
            alas: [
              [0, 0],
              [2, 0],
              [2, 1.5],
              [0, 1.5],
            ],
            t: 1,
            kunci: 'kebutuhan',
          },
        },
        awalan: 'Rp',
        options: [
          { id: 'benar', label: 'Rp12.000' },
          { id: 'lupa-kurang', label: 'Rp18.000' },
          { id: 'lupa-konversi', label: 'Rp12.000.000' },
          { id: 'dua-kali', label: 'Rp24.000' },
        ],
        correct: 'benar',
        hints: ['V kolam = 2 × 1,5 × 1 = 3 m³.', 'Yang dibeli hanya 3 − 1 = 2 m³.'],
        explanation: 'Air yang dibeli 3 − 1 = 2 m³; biayanya 2 × Rp6.000 = Rp12.000.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: PBL + ' · Refleksi',
    goal: 'Merefleksikan proses menyelesaikan masalah kontekstual volume prisma.',
    guru: 'Baca beberapa refleksi murid (dengan izin) untuk menutup pelajaran. Tanyakan: “Apa yang kalian periksa lebih dulu sebelum memakai V = luas alas × tinggi?”',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Bagaimana cara mengenali alas prisma pada benda yang rebah, seperti kolam B?',
        placeholder: 'Alasnya adalah …',
      },
      {
        id: 'q2',
        teks: 'Kapan hasil bagi dibulatkan ke atas, dan kapan ke bawah? Beri contoh dari kolam nila.',
        placeholder: 'Dibulatkan ke atas saat … contohnya … Dibulatkan ke bawah saat …',
      },
      {
        id: 'q3',
        teks: 'Masalah apa di rumah atau di sekolahmu yang bisa diselesaikan dengan volume prisma?',
        placeholder: 'Misalnya saat …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menyelesaikan masalah volume prisma sekarang?',
    diriOpsi: [
      { id: 'yakin', label: '😄 Sangat yakin, aku bisa menjelaskannya ke teman' },
      { id: 'cukup', label: '🙂 Cukup yakin, kadang masih perlu melihat catatan' },
      { id: 'ragu', label: '🤔 Masih ragu, aku perlu berlatih lagi' },
      { id: 'bingung', label: '😟 Masih bingung, aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai ✓',
  },

  /* ----------------------------------------------------------
     SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Kolam nila siap diisi!',
    teks: 'Proposal kelompokmu menjawab kebutuhan OSIS dengan hitungan volume yang tepat, jadwal yang masuk akal, dan dana yang cukup.',
    capaian: [
      'Mengenali alas dan tinggi prisma pada kolam yang rebah, lalu menghitung volumenya.',
      'Memilih kolam dengan membandingkan volume dan daya tampung ikan.',
      'Mengubah m³ ke liter dan membulatkan isi ulang ke atas atau banyak benda ke bawah dengan tepat.',
      'Menghitung tinggi air, waktu pompa, dan biaya, lalu menyajikan keputusan dalam proposal.',
    ],
  },
};
