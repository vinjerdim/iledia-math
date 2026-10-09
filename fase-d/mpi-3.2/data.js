'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Masalah Kontekstual Rasio & Konversi Satuan
   — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menyelesaikan masalah kontekstual yang melibatkan rasio dan
   penyederhanaan rasio, termasuk konversi satuan.

   Model pembelajaran: COOPERATIVE LEARNING tipe THINK-PAIR-SHARE.
   Setiap misi inti berjalan dalam siklus
     Think (Pikir)  — murid mengerjakan SENDIRI lalu mengunci jawaban;
     Pair (Pasang)  — murid membandingkan jawaban dengan pasangan,
                      berdiskusi, lalu memilih jawaban kesepakatan;
     Share (Bagi)   — juru bicara pasangan (dipilih acak) berbagi
                      ke kelas dengan kalimat pemantik.
   Pemetaan fase ke tahap media:

     Persiapan ..................... 'tujuan'
     Think ......................... 'pikir'    (Lab Samakan Satuan)
     Pair .......................... 'pasang'   (empat rasio bersatuan)
     Share ......................... 'berbagi'  (strategi penyelesaian)
     Think → Pair → Share .......... 'masalah'  (masalah kontekstual)
     Akuntabilitas individu ........ 'latihan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan) dengan tema
   "Persiapan Kemah Kelas VII":
     1. Tujuan     (5')  — TP & kriteria, pemanasan menyederhanakan
                           12 : 18, nama diri & pasangan, aturan main TPS.
     2. Pikir      (12') — "Tali tenda 2 m dan tali jemuran 50 cm":
                           murid MENDUGA rasionya sendiri (tidak dinilai,
                           pengecoh 1 : 25 dsb.), lalu mencoba Lab Samakan
                           Satuan (ubah semua ke cm / ke m), mengisi
                           langkah konversi → rasio → FPB berdiagnosa,
                           menafsirkan hasil, dan menulis strategi.
     3. Pasang     (12') — empat pertanyaan TPS rasio bersatuan berbeda
                           (waktu, massa, volume, panjang): pikir → catat
                           jawaban pasangan → sepakati; opsi pengecoh
                           dibangkitkan engine dari miskonsepsi.
     4. Berbagi    (8')  — pasangan menyusun langkah strategi dari bank
                           kalimat acak; juru bicara acak berbagi.
     5. Masalah    (18') — empat masalah kemah (minuman jahe, membagi
                           gula, jalur jelajah, jadwal acara): memilih
                           strategi lewat TPS, lalu langkah isian
                           berdiagnosa; juru bicara menjelaskan satu
                           masalah ke kelas.
     6. Uji mandiri(12') — delapan soal acak dari bank tujuh belas soal.
     7. Refleksi   (3')  — refleksi tertulis, penilaian diri & pasangan.

   Jenis pemeriksaan isian (engine seksi 68, periksaSoalRasioSatuan):
     cek = { jenis: 'satuan', a, satA, b, satB, sederhana }  rasio a satA : b satB
           { jenis: 'konversi', nilai, dari, ke }            nilai dari = … ke
           { jenis: 'bagi', total, satTotal, a, b, bagian, satJawab }
           { jenis: 'hilangSatuan', a, b, x, satX, posisi, satJawab }
           { jenis: 'sederhana', a, b }                      (seksi 67)
   `jawab` = jawaban baku (teks) dan diuji sama dengan
   jawabSoalRasioSatuan.

   Notasi baku: rasio "a : b" dengan spasi di kedua sisi titik dua;
   ribuan memakai titik (1.200), desimal memakai koma (1,5).

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban benar sering di urutan pertama). Opsi
   pertanyaan TPS tahap Pikir & Pasang dibangkitkan opsiRasioSatuan
   (urutan wajar juga). app.js mengacaknya SEKALI saat state disiapkan
   (ensureTpsStates / ensureShuffledOrder / shuffleArray dari
   shared/engine.js), sehingga tiap murid dan tiap Reset mendapat urutan
   berbeda. Soal uji mandiri juga diambil acak dari bank.

   Konsistensi kunci jawaban diuji tests/mpi-3.2-data.test.js terhadap
   engine seksi 68.
   ============================================================ */

var TPS = 'Think-Pair-Share';

var DATA = {
  meta: {
    judul: 'Masalah Kontekstual Rasio & Konversi Satuan',
  },

  tahap: [
    { id: 'tujuan', label: 'Tujuan' },
    { id: 'pikir', label: 'Pikir' },
    { id: 'pasang', label: 'Berpasangan' },
    { id: 'berbagi', label: 'Berbagi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'latihan', label: 'Uji Mandiri' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  konteks: {
    tenda: { ikon: '🏕️', nama: 'Perlengkapan' },
    dapur: { ikon: '🍳', nama: 'Dapur Kemah' },
    jadwal: { ikon: '⏱️', nama: 'Jadwal' },
    jelajah: { ikon: '🥾', nama: 'Jelajah' },
    minuman: { ikon: '🥤', nama: 'Minuman' },
  },

  /* Fakta konversi yang ditampilkan sebagai kartu bantuan. */
  fakta: [
    { besaran: 'Panjang', teks: '1 km = 1.000 m · 1 m = 100 cm' },
    { besaran: 'Massa', teks: '1 kg = 1.000 g · 1 ons = 100 g' },
    { besaran: 'Volume', teks: '1 L = 1.000 mL' },
    { besaran: 'Waktu', teks: '1 jam = 60 menit' },
  ],

  /* ---------- Tahap 1: Tujuan & pasangan ---------- */
  tujuan: {
    kicker: 'Tahap 1 · Tujuan & Pasangan',
    syntax: TPS + ' · Persiapan',
    goal: 'Mengetahui tujuan belajar, mengingat cara menyederhanakan rasio, dan menyiapkan pasangan belajar.',
    guru: 'Bentuk pasangan sebangku (bila jumlah murid ganjil, satu kelompok boleh bertiga — tulis dua nama di kolom pasangan). Sepakati tanda waktu: Pikir ± 2 menit tanpa bicara, Berpasangan ± 4 menit, Berbagi ± 1 menit per pasangan.',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Menyelesaikan masalah kontekstual yang melibatkan rasio dan penyederhanaan rasio, termasuk konversi satuan.',
    kriteria: [
      'Menyamakan satuan dua besaran (panjang, massa, volume, waktu) sebelum menuliskan rasionya.',
      'Menyederhanakan rasio dengan membagi kedua suku dengan FPB-nya, termasuk rasio dengan suku desimal.',
      'Menentukan suku yang belum diketahui dan membagi suatu jumlah menurut rasio tertentu dalam satuan yang diminta.',
      'Menafsirkan arti rasio paling sederhana dalam konteks masalah.',
      'Menjelaskan strategi penyelesaian kepada pasangan dan kepada kelas.',
    ],
    apersepsi: {
      label: 'Ingat kembali materi 3.1: sederhanakan rasio 12 : 18.',
      cek: { jenis: 'sederhana', a: 12, b: 18 },
      jawab: '2 : 3',
      placeholder: 'mis. 4 : 5',
      hints: [
        'Cari bilangan terbesar yang membagi habis 12 dan 18 (FPB).',
        'FPB 12 dan 18 adalah 6. Bagi kedua suku dengan 6.',
      ],
      temuan:
        'Kedua suku dibagi FPB 6: 12 : 18 = 2 : 3. Hari ini kita memakai cara ini pada besaran yang <strong>satuannya berbeda</strong>.',
    },
    aturan: [
      '<strong>🤔 Pikir</strong> — kerjakan sendiri dulu, tanpa berbicara. Kunci jawabanmu.',
      '<strong>👥 Berpasangan</strong> — tanyakan jawaban pasanganmu, bandingkan, lalu jelaskan alasan masing-masing sampai kalian sepakat.',
      '<strong>📢 Berbagi</strong> — juru bicara yang dipilih acak menjelaskan strategi pasangan ke kelas.',
      'Jawaban yang berbeda bukan masalah — justru itu bahan diskusi terbaik!',
    ],
    namaSayaLabel: 'Namaku',
    namaPasanganLabel: 'Nama pasanganku',
    nextLabel: 'Mulai: Pikir Sendiri →',
  },

  /* ---------- Tahap 2: Pikir (Lab Samakan Satuan) ---------- */
  pikir: {
    kicker: 'Tahap 2 · Pikir: Samakan Satuannya',
    syntax: TPS + ' · Think',
    tps: 'pikir',
    pesan: 'Kerjakan sendiri tanpa berdiskusi. Pasanganmu juga sedang berpikir sendiri.',
    goal: 'Menemukan sendiri bahwa satuan harus disamakan dulu sebelum rasio disederhanakan.',
    guru: 'Jaga suasana hening agar setiap murid punya jawaban sendiri. Dugaan awal TIDAK dinilai — biasanya banyak murid menjawab 2 : 50 = 1 : 25. Biarkan; Lab Samakan Satuan akan menunjukkan sendiri mengapa itu keliru.',
    cerita: {
      ikon: '🏕️',
      judul: 'Tali untuk Kemah',
      teks: 'Regu Elang menyiapkan perlengkapan kemah. Tali tenda panjangnya 2 m, sedangkan tali jemuran panjangnya 50 cm.',
    },
    tanya: 'Berapa rasio panjang tali tenda terhadap panjang tali jemuran?',
    cek: { jenis: 'satuan', a: 2, satA: 'm', b: 50, satB: 'cm' },
    dugaanLabel: 'Dugaanku (tidak dinilai):',
    lab: {
      a: 2,
      satA: 'm',
      b: 50,
      satB: 'cm',
      namaA: 'Tali tenda',
      namaB: 'Tali jemuran',
      pilihan: ['cm', 'm'],
    },
    labJudul: '🔬 Lab Samakan Satuan',
    labInstruksi:
      'Coba kedua tombol: ubah semua ke cm, lalu ubah semua ke m. Perhatikan panjang batang dan rasio paling sederhananya.',
    langkah: [
      {
        label: 'Ubah panjang tali tenda ke sentimeter: 2 m = … cm',
        cek: { jenis: 'konversi', nilai: 2, dari: 'm', ke: 'cm' },
        jawab: '200',
        satuan: 'cm',
        placeholder: 'mis. 20',
        hints: ['1 m = 100 cm.', '2 m = 2 × 100 cm.'],
      },
      {
        label: 'Tulis rasio tali tenda : tali jemuran dalam sentimeter.',
        cek: { jenis: 'satuan', a: 2, satA: 'm', b: 50, satB: 'cm', sederhana: false },
        jawab: '200 : 50',
        placeholder: 'mis. 20 : 5',
        hints: ['Tali tenda 200 cm, tali jemuran 50 cm.', 'Suku pertama milik tali tenda.'],
      },
      {
        label: 'Sederhanakan rasionya sampai paling sederhana.',
        cek: { jenis: 'satuan', a: 2, satA: 'm', b: 50, satB: 'cm' },
        jawab: '4 : 1',
        placeholder: 'mis. 3 : 2',
        hints: ['FPB 200 dan 50 adalah 50.', '200 : 50 = 4 dan 50 : 50 = 1.'],
        temuan:
          'Rasio panjang tali tenda terhadap tali jemuran adalah <strong>4 : 1</strong>, bukan 1 : 25. Satuannya harus sama dulu!',
      },
    ],
    tafsir: [
      {
        id: 'pt1',
        tanya: 'Rasio 4 : 1 berarti …',
        opsi: [
          { id: 'a', label: 'tali tenda 4 kali panjang tali jemuran' },
          { id: 'b', label: 'tali tenda lebih panjang 4 cm daripada tali jemuran' },
          { id: 'c', label: 'tali jemuran 4 kali panjang tali tenda' },
          { id: 'd', label: 'tali tenda panjangnya 4 m' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! 200 cm = 4 × 50 cm. Rasio membandingkan "berapa kali lipat".',
          b: 'Rasio bukan selisih. Selisih kedua tali adalah 150 cm, tetapi perbandingannya 4 : 1.',
          c: 'Urutannya terbalik. Suku pertama (4) milik tali tenda.',
          d: 'Rasio tidak menyebut panjang sebenarnya — 4 : 1 hanya membandingkan.',
        },
      },
      {
        id: 'pt2',
        tanya: 'Di Lab, saat semua diubah ke meter rasionya 2 : 0,5. Bentuk paling sederhananya …',
        opsi: [
          { id: 'a', label: 'tetap 4 : 1 — satuan apa pun boleh, asalkan sama' },
          { id: 'b', label: '2 : 0,5 — rasio dengan desimal tidak bisa disederhanakan' },
          { id: 'c', label: '1 : 25 — karena sama dengan 2 : 50' },
          { id: 'd', label: '20 : 5 — karena dikali 10' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! 2 : 0,5 dikali 10 menjadi 20 : 5, lalu dibagi 5 menjadi 4 : 1 — hasilnya sama.',
          b: 'Kalikan kedua suku dengan 10 agar bulat: 20 : 5. Setelah itu masih bisa disederhanakan.',
          c: '2 : 50 adalah rasio TANPA menyamakan satuan, jadi tidak tepat.',
          d: '20 : 5 memang ekuivalen, tetapi belum paling sederhana (FPB-nya 5).',
        },
      },
    ],
    strategiLabel: 'Tulis strategimu dalam satu-dua kalimat (akan kamu ceritakan ke pasangan):',
    strategiPlaceholder: 'Pertama aku …, lalu …',
    nextLabel: 'Lanjut: Berpasangan →',
  },

  /* ---------- Tahap 3: Berpasangan ---------- */
  pasang: {
    kicker: 'Tahap 3 · Berpasangan: Rasio Bersatuan Berbeda',
    syntax: TPS + ' · Pair',
    tps: ['pikir', 'pasang'],
    pesan:
      'Untuk setiap soal: pilih sendiri, tanyakan jawaban pasanganmu, lalu sepakati jawaban terbaik.',
    goal: 'Menyederhanakan rasio dua besaran bersatuan berbeda bersama pasangan dan menyepakati jawabannya.',
    guru: 'Kelilingi kelas dan dengarkan pasangan yang jawabannya berbeda. Tanyakan: "Satuan apa yang kalian pilih? Mengapa?" Opsi pengecoh mewakili miskonsepsi nyata: tanpa konversi, salah faktor (1 jam = 100 menit), tertukar, dan belum paling sederhana.',
    /* Opsi tiap soal dibangkitkan opsiRasioSatuan(cek); correct = 'benar'. */
    soal: [
      {
        id: 'pq1',
        konteks: 'jadwal',
        cerita: 'Lari pagi berlangsung 1 jam, sedangkan senam pagi 45 menit.',
        tanya:
          'Rasio lama lari pagi terhadap lama senam pagi dalam bentuk paling sederhana adalah …',
        cek: { a: 1, satA: 'jam', b: 45, satB: 'menit' },
        diskusi: 'Berapa menit dalam 1 jam? Apakah 1 jam = 100 menit?',
      },
      {
        id: 'pq2',
        konteks: 'dapur',
        cerita: 'Bekal regu: 1,5 kg beras dan 300 g kacang hijau.',
        tanya:
          'Rasio massa beras terhadap massa kacang hijau dalam bentuk paling sederhana adalah …',
        cek: { a: 1.5, satA: 'kg', b: 300, satB: 'g' },
        diskusi: '1,5 kg itu berapa gram? Lalu berapa FPB kedua suku?',
      },
      {
        id: 'pq3',
        konteks: 'minuman',
        cerita: 'Satu jeriken berisi 2 L air minum. Satu botol kecil berisi 250 mL.',
        tanya:
          'Rasio volume jeriken terhadap volume botol kecil dalam bentuk paling sederhana adalah …',
        cek: { a: 2, satA: 'L', b: 250, satB: 'mL' },
        diskusi:
          'Apa artinya rasio yang kalian sepakati? Berapa botol kecil untuk mengisi satu jeriken?',
      },
      {
        id: 'pq4',
        konteks: 'jelajah',
        cerita: 'Jalur jelajah hutan panjangnya 1,2 km, sedangkan jalur sungai 800 m.',
        tanya:
          'Rasio panjang jalur hutan terhadap jalur sungai dalam bentuk paling sederhana adalah …',
        cek: { a: 1.2, satA: 'km', b: 800, satB: 'm' },
        diskusi: 'Satuan mana yang membuat kedua suku menjadi bilangan bulat?',
      },
    ],
    nextLabel: 'Lanjut: Berbagi →',
  },

  /* ---------- Tahap 4: Berbagi ---------- */
  berbagi: {
    kicker: 'Tahap 4 · Berbagi Strategi',
    syntax: TPS + ' · Share',
    tps: 'berbagi',
    pesan: 'Susun strategi kalian berdua, lalu juru bicara membagikannya ke kelas.',
    goal: 'Menyusun dan membagikan langkah-langkah menyederhanakan rasio dua besaran bersatuan berbeda.',
    guru: 'Panggil 2–3 juru bicara secara acak. Minta pasangan lain menanggapi: "Apakah langkah kalian sama? Adakah cara lain?" Tekankan bahwa satuan apa pun boleh dipakai asalkan SAMA, dan hasil paling sederhananya tetap sama.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari pilihan. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      {
        id: 'k1',
        awal: 'Jika dua besaran satuannya berbeda, langkah pertama adalah',
        correct: 'samakan',
      },
      {
        id: 'k2',
        awal: 'Setelah satuannya sama, rasio ditulis',
        correct: 'urutan',
      },
      {
        id: 'k3',
        awal: 'Jika ada suku desimal, misalnya 2 : 0,5,',
        correct: 'kali10',
      },
      {
        id: 'k4',
        awal: 'Agar paling sederhana,',
        correct: 'fpb',
      },
    ],
    bank: [
      { id: 'samakan', teks: 'mengubah keduanya ke satuan yang sama (konversi satuan).' },
      { id: 'urutan', teks: 'sesuai urutan besaran yang ditanyakan.' },
      { id: 'kali10', teks: 'kalikan kedua suku dengan 10, 100, … sampai keduanya bulat.' },
      { id: 'fpb', teks: 'bagi kedua suku dengan FPB-nya.' },
      { id: 'abaikan', teks: 'langsung membandingkan bilangannya tanpa melihat satuan.' },
      { id: 'tambah', teks: 'tambahkan bilangan yang sama pada kedua suku.' },
      { id: 'besar', teks: 'selalu tulis bilangan yang lebih besar lebih dulu.' },
    ],
    rangkuman: [
      '1. Samakan satuan kedua besaran (pilih satuan yang membuat sukunya bulat).',
      '2. Tulis rasio sesuai urutan yang ditanya.',
      '3. Bila ada desimal, kalikan kedua suku dengan 10, 100, … sampai bulat.',
      '4. Bagi kedua suku dengan FPB-nya.',
      '5. Tafsirkan: a : b berarti besaran pertama a/b kali besaran kedua.',
    ],
    pemantik: [
      'Strategi kami adalah …',
      'Kesalahan yang sering terjadi adalah …, karena …',
      'Contoh dari Lab: 2 m : 50 cm = … : … = 4 : 1.',
    ],
    nextLabel: 'Lanjut: Masalah Kontekstual →',
  },

  /* ---------- Tahap 5: Masalah kontekstual ---------- */
  masalah: {
    kicker: 'Tahap 5 · Masalah Kontekstual Kemah',
    syntax: TPS + ' · Think → Pair → Share',
    tps: ['pikir', 'pasang', 'berbagi'],
    pesan:
      'Setiap masalah: pilih strategi sendiri, sepakati dengan pasangan, lalu hitung langkah demi langkah.',
    goal: 'Menyelesaikan masalah kontekstual yang melibatkan rasio, penyederhanaan rasio, dan konversi satuan.',
    guru: 'Murid dapat menghitung di buku sebelum mengetik. Perhatikan pesan diagnosa yang muncul (tanpa konversi, dibagi suku, satu bagian) sebagai bahan tanya-jawab. Di akhir, minta juru bicara menjelaskan satu masalah lengkap dengan satuannya.',
    soal: [
      {
        id: 'm1',
        konteks: 'minuman',
        cerita:
          'Panitia membuat minuman jahe hangat. Resepnya: sirup jahe : air = 1 : 4. Tersedia 750 mL sirup jahe.',
        pertanyaan: 'Berapa liter air yang diperlukan agar rasanya sesuai resep?',
        model: {
          id: 'mq1',
          tanya: 'Strategi yang tepat untuk masalah ini adalah …',
          opsi: [
            { id: 'a', label: 'Kalikan kedua suku 1 : 4 dengan 750, lalu ubah mL ke L' },
            { id: 'b', label: 'Tambahkan 749 pada kedua suku 1 : 4' },
            { id: 'c', label: 'Bagi 750 mL dengan 4' },
            { id: 'd', label: 'Ubah 750 mL menjadi 750 L lebih dulu' },
          ],
          correct: 'a',
          umpan: {
            a: 'Tepat! 1 : 4 = 750 : 3.000 (dalam mL), lalu 3.000 mL diubah ke liter.',
            b: 'Menambah bilangan yang sama mengubah rasa (rasio). Gunakan perkalian.',
            c: 'Air 4 kali sirup, jadi dikali 4, bukan dibagi 4.',
            d: '1 L = 1.000 mL, jadi 750 mL kurang dari 1 L — bukan 750 L.',
          },
          diskusi: 'Air lebih banyak atau lebih sedikit daripada sirup? Berapa kali lipat?',
        },
        langkah: [
          {
            label: 'Banyak air dalam mililiter: 1 : 4 = 750 : …',
            cek: {
              jenis: 'hilangSatuan',
              a: 1,
              b: 4,
              x: 750,
              satX: 'mL',
              posisi: 'kanan',
              satJawab: 'mL',
            },
            jawab: '3.000',
            satuan: 'mL',
            placeholder: 'mis. 1.500',
            hints: ['Sirup dikali 750 (1 → 750), maka air juga dikali 750.', '4 × 750 = …'],
          },
          {
            label: 'Ubah ke liter: 3.000 mL = … L',
            cek: { jenis: 'konversi', nilai: 3000, dari: 'mL', ke: 'L' },
            jawab: '3',
            satuan: 'L',
            placeholder: 'mis. 1,5',
            hints: ['1 L = 1.000 mL.', '3.000 : 1.000 = …'],
            temuan:
              'Diperlukan <strong>3 L air</strong>. Periksa: 750 mL : 3.000 mL = 1 : 4 ✓ — sesuai resep.',
          },
        ],
      },
      {
        id: 'm2',
        konteks: 'dapur',
        cerita:
          'Regu punya 2 kg gula pasir. Gula dibagi untuk minuman dan kue dengan rasio minuman : kue = 3 : 2.',
        pertanyaan: 'Berapa gram gula untuk minuman?',
        model: {
          id: 'mq2',
          tanya: 'Strategi yang tepat untuk masalah ini adalah …',
          opsi: [
            {
              id: 'a',
              label: 'Ubah 2 kg ke gram, bagi dengan 3 + 2 = 5 bagian, lalu ambil 3 bagian',
            },
            { id: 'b', label: 'Ubah 2 kg ke gram, lalu bagi dengan 3' },
            { id: 'c', label: 'Ubah 2 kg ke gram, lalu kalikan 3 dan bagi 2' },
            { id: 'd', label: 'Hitung 2 × 3 = 6, jadi 6 gram' },
          ],
          correct: 'a',
          umpan: {
            a: 'Tepat! Seluruh gula dibagi menjadi 3 + 2 = 5 bagian sama besar, minuman mendapat 3 bagian.',
            b: 'Gula dibagi menjadi 5 bagian (3 + 2), bukan 3 bagian.',
            c: 'Itu membandingkan minuman dengan kue, padahal yang diketahui adalah TOTAL gula.',
            d: 'Satuannya harus diubah dulu (2 kg = 2.000 g), dan rasio 3 : 2 berarti 5 bagian.',
          },
          diskusi: 'Ada berapa bagian seluruhnya? Berapa gram satu bagian?',
        },
        langkah: [
          {
            label: 'Ubah ke gram: 2 kg = … g',
            cek: { jenis: 'konversi', nilai: 2, dari: 'kg', ke: 'g' },
            jawab: '2.000',
            satuan: 'g',
            placeholder: 'mis. 200',
            hints: ['1 kg = 1.000 g.'],
          },
          {
            label: 'Gula untuk minuman (3 dari 5 bagian) = … g',
            cek: {
              jenis: 'bagi',
              total: 2,
              satTotal: 'kg',
              a: 3,
              b: 2,
              bagian: 'a',
              satJawab: 'g',
            },
            jawab: '1.200',
            satuan: 'g',
            placeholder: 'mis. 500',
            hints: ['Satu bagian = 2.000 g : 5 = 400 g.', 'Minuman mendapat 3 bagian: 3 × 400 g.'],
            temuan:
              'Gula untuk minuman <strong>1.200 g</strong> dan untuk kue 800 g. Periksa: 1.200 : 800 = 3 : 2 ✓ dan 1.200 + 800 = 2.000 g ✓.',
          },
        ],
      },
      {
        id: 'm3',
        konteks: 'jelajah',
        cerita: 'Jalur jelajah A panjangnya 2,4 km. Jalur jelajah B panjangnya 1.800 m.',
        pertanyaan:
          'Berapa rasio panjang jalur A terhadap jalur B dalam bentuk paling sederhana? Apa artinya?',
        model: {
          id: 'mq3',
          tanya: 'Strategi yang tepat untuk masalah ini adalah …',
          opsi: [
            { id: 'a', label: 'Ubah 2,4 km menjadi 2.400 m, lalu bagi kedua suku dengan FPB' },
            { id: 'b', label: 'Sederhanakan 2,4 : 1.800 langsung' },
            { id: 'c', label: 'Ubah 2,4 km menjadi 240 m, lalu sederhanakan' },
            { id: 'd', label: 'Kurangkan 2.400 m − 1.800 m' },
          ],
          correct: 'a',
          umpan: {
            a: 'Tepat! Setelah satuan sama (meter), rasio 2.400 : 1.800 disederhanakan dengan FPB.',
            b: '2,4 dalam km dan 1.800 dalam m — satuannya belum sama.',
            c: '1 km = 1.000 m, jadi 2,4 km = 2.400 m, bukan 240 m.',
            d: 'Pengurangan menghasilkan selisih, bukan rasio.',
          },
          diskusi: 'Apakah jalur A lebih panjang? Berapa kali panjang jalur B?',
        },
        langkah: [
          {
            label: 'Ubah ke meter: 2,4 km = … m',
            cek: { jenis: 'konversi', nilai: 2.4, dari: 'km', ke: 'm' },
            jawab: '2.400',
            satuan: 'm',
            placeholder: 'mis. 240',
            hints: ['1 km = 1.000 m.', '2,4 × 1.000 = …'],
          },
          {
            label: 'Rasio jalur A : jalur B paling sederhana = …',
            cek: { jenis: 'satuan', a: 2.4, satA: 'km', b: 1800, satB: 'm' },
            jawab: '4 : 3',
            placeholder: 'mis. 3 : 2',
            hints: ['2.400 : 1.800, FPB-nya 600.', '2.400 : 600 = 4 dan 1.800 : 600 = 3.'],
            temuan:
              'Rasio <strong>4 : 3</strong>: setiap 4 langkah di jalur A sebanding dengan 3 langkah di jalur B — jalur A lebih panjang, yaitu 4/3 kali jalur B.',
          },
        ],
      },
      {
        id: 'm4',
        konteks: 'jadwal',
        cerita:
          'Malam api unggun berlangsung 1 jam 30 menit. Pentas seni tiap regu di dalamnya berlangsung 45 menit.',
        pertanyaan:
          'Berapa rasio lama api unggun terhadap lama pentas seni dalam bentuk paling sederhana?',
        model: {
          id: 'mq4',
          tanya: 'Strategi yang tepat untuk masalah ini adalah …',
          opsi: [
            { id: 'a', label: 'Ubah 1 jam 30 menit menjadi 90 menit, lalu sederhanakan 90 : 45' },
            { id: 'b', label: 'Ubah 1 jam 30 menit menjadi 130 menit' },
            { id: 'c', label: 'Tulis 1,30 : 45' },
            { id: 'd', label: 'Tulis 45 : 90 karena 45 disebut lebih dulu' },
          ],
          correct: 'a',
          umpan: {
            a: 'Tepat! 1 jam = 60 menit, jadi 1 jam 30 menit = 90 menit.',
            b: '1 jam = 60 menit, bukan 100 menit. 1 jam 30 menit = 60 + 30 menit.',
            c: '1 jam 30 menit = 1,5 jam (bukan 1,30), dan satuannya belum sama dengan menit.',
            d: 'Yang ditanya: api unggun TERHADAP pentas seni — api unggun menjadi suku pertama.',
          },
          diskusi: 'Mengapa 1 jam 30 menit tidak sama dengan 1,3 jam?',
        },
        langkah: [
          {
            label: '1 jam 30 menit = 1,5 jam = … menit',
            cek: { jenis: 'konversi', nilai: 1.5, dari: 'jam', ke: 'menit' },
            jawab: '90',
            satuan: 'menit',
            placeholder: 'mis. 100',
            hints: ['1 jam = 60 menit.', '60 menit + 30 menit = …'],
          },
          {
            label: 'Rasio api unggun : pentas seni paling sederhana = …',
            cek: { jenis: 'satuan', a: 1.5, satA: 'jam', b: 45, satB: 'menit' },
            jawab: '2 : 1',
            placeholder: 'mis. 3 : 1',
            hints: ['90 : 45, FPB-nya 45.'],
            temuan:
              'Rasio <strong>2 : 1</strong>: api unggun berlangsung 2 kali lama pentas seni. Jadi ada waktu 45 menit lagi untuk acara lain.',
          },
        ],
      },
    ],
    nextLabel: 'Lanjut: Uji Mandiri →',
  },

  /* ---------- Tahap 6: Uji mandiri ---------- */
  latihan: {
    kicker: 'Tahap 6 · Uji Mandiri',
    syntax: 'Akuntabilitas Individu',
    goal: 'Menyelesaikan masalah kontekstual rasio dan konversi satuan secara mandiri.',
    guru: 'Fase ini dikerjakan SENDIRI. Setiap murid mendapat soal acak yang berbeda dari pasangannya. Minta murid menuliskan konversi satuannya di buku.',
    instruksi:
      'Kerjakan sendiri. Tulis rasio dengan tanda titik dua, mis. 4 : 1. Untuk jawaban bilangan, pakai titik untuk ribuan (1.200) dan koma untuk desimal (1,5).',
    banyak: 8,
    komposisi: { input: 6, choice: 2 },
    soal: [
      {
        id: 'iTiang',
        type: 'input',
        konteks: 'tenda',
        cerita: 'Tiang bendera perkemahan tingginya 6 m. Tongkat pramuka tingginya 150 cm.',
        pertanyaan:
          'Tulis rasio tinggi tiang bendera terhadap tinggi tongkat dalam bentuk paling sederhana.',
        cek: { jenis: 'satuan', a: 6, satA: 'm', b: 150, satB: 'cm' },
        jawab: '4 : 1',
        hints: ['6 m = 600 cm.', '600 : 150, FPB-nya 150.'],
        explanation: '6 m = 600 cm; 600 : 150 dibagi FPB 150 menjadi 4 : 1.',
      },
      {
        id: 'iTenda',
        type: 'input',
        konteks: 'jadwal',
        cerita: 'Memasang tenda memerlukan 40 menit. Memasak makan siang memerlukan 2 jam.',
        pertanyaan:
          'Tulis rasio waktu memasang tenda terhadap waktu memasak dalam bentuk paling sederhana.',
        cek: { jenis: 'satuan', a: 40, satA: 'menit', b: 2, satB: 'jam' },
        jawab: '1 : 3',
        hints: ['2 jam = 120 menit.', '40 : 120, FPB-nya 40.'],
        explanation: '2 jam = 120 menit; 40 : 120 dibagi FPB 40 menjadi 1 : 3.',
      },
      {
        id: 'iTepung',
        type: 'input',
        konteks: 'dapur',
        cerita: 'Adonan pisang goreng memakai 750 g tepung dan 1,5 kg pisang.',
        pertanyaan: 'Tulis rasio massa tepung terhadap massa pisang dalam bentuk paling sederhana.',
        cek: { jenis: 'satuan', a: 750, satA: 'g', b: 1.5, satB: 'kg' },
        jawab: '1 : 2',
        hints: ['1,5 kg = 1.500 g.', '750 : 1.500, FPB-nya 750.'],
        explanation: '1,5 kg = 1.500 g; 750 : 1.500 dibagi FPB 750 menjadi 1 : 2.',
      },
      {
        id: 'iTermos',
        type: 'input',
        konteks: 'minuman',
        cerita: 'Sebuah termos berisi 1,2 L teh. Satu gelas berisi 200 mL.',
        pertanyaan:
          'Tulis rasio volume termos terhadap volume gelas dalam bentuk paling sederhana.',
        cek: { jenis: 'satuan', a: 1.2, satA: 'L', b: 200, satB: 'mL' },
        jawab: '6 : 1',
        hints: ['1,2 L = 1.200 mL.', '1.200 : 200, FPB-nya 200.'],
        explanation: '1,2 L = 1.200 mL; 1.200 : 200 = 6 : 1, jadi isi termos cukup untuk 6 gelas.',
      },
      {
        id: 'iKawat',
        type: 'input',
        konteks: 'tenda',
        cerita: 'Gulungan kawat panjangnya 3,5 m. Setiap pengait tenda memerlukan 70 cm kawat.',
        pertanyaan:
          'Tulis rasio panjang gulungan kawat terhadap panjang satu pengait (paling sederhana).',
        cek: { jenis: 'satuan', a: 3.5, satA: 'm', b: 70, satB: 'cm' },
        jawab: '5 : 1',
        hints: ['3,5 m = 350 cm.', '350 : 70, FPB-nya 70.'],
        explanation: '3,5 m = 350 cm; 350 : 70 = 5 : 1, cukup untuk 5 pengait.',
      },
      {
        id: 'iJus',
        type: 'input',
        konteks: 'minuman',
        cerita:
          'Sebanyak 1,5 L jus jeruk dibagi untuk Regu Elang dan Regu Rajawali dengan rasio 2 : 3.',
        pertanyaan: 'Berapa mililiter jus untuk Regu Elang?',
        cek: { jenis: 'bagi', total: 1.5, satTotal: 'L', a: 2, b: 3, bagian: 'a', satJawab: 'mL' },
        jawab: '600',
        satuan: 'mL',
        hints: [
          '1,5 L = 1.500 mL, dibagi menjadi 2 + 3 = 5 bagian.',
          'Satu bagian 300 mL; Elang 2 bagian.',
        ],
        explanation: '1.500 mL : 5 = 300 mL per bagian; Regu Elang 2 × 300 = 600 mL.',
      },
      {
        id: 'iTali',
        type: 'input',
        konteks: 'tenda',
        cerita: 'Seutas tali 12 m dipotong menjadi dua bagian dengan rasio 1 : 3.',
        pertanyaan: 'Berapa sentimeter panjang potongan yang lebih pendek?',
        cek: { jenis: 'bagi', total: 12, satTotal: 'm', a: 1, b: 3, bagian: 'a', satJawab: 'cm' },
        jawab: '300',
        satuan: 'cm',
        hints: ['12 m = 1.200 cm, dibagi menjadi 1 + 3 = 4 bagian.', 'Potongan pendek = 1 bagian.'],
        explanation: '1.200 cm : 4 = 300 cm; potongan pendek 300 cm dan panjang 900 cm.',
      },
      {
        id: 'iSesi',
        type: 'input',
        konteks: 'jadwal',
        cerita: 'Sesi kegiatan 1 jam dibagi untuk materi dan permainan dengan rasio 2 : 3.',
        pertanyaan: 'Berapa menit waktu untuk permainan?',
        cek: {
          jenis: 'bagi',
          total: 1,
          satTotal: 'jam',
          a: 2,
          b: 3,
          bagian: 'b',
          satJawab: 'menit',
        },
        jawab: '36',
        satuan: 'menit',
        hints: ['1 jam = 60 menit, dibagi menjadi 2 + 3 = 5 bagian.', 'Permainan = 3 bagian.'],
        explanation: '60 menit : 5 = 12 menit per bagian; permainan 3 × 12 = 36 menit.',
      },
      {
        id: 'iPupuk',
        type: 'input',
        konteks: 'jelajah',
        cerita:
          'Untuk menyiram tanaman di bumi perkemahan dibuat larutan pupuk cair : air = 1 : 20. Tersedia 150 mL pupuk cair.',
        pertanyaan: 'Berapa liter air yang diperlukan?',
        cek: {
          jenis: 'hilangSatuan',
          a: 1,
          b: 20,
          x: 150,
          satX: 'mL',
          posisi: 'kanan',
          satJawab: 'L',
        },
        jawab: '3',
        satuan: 'L',
        hints: ['Air = 20 × 150 mL = 3.000 mL.', '3.000 mL = … L'],
        explanation: '1 : 20 = 150 : 3.000 (mL); 3.000 mL = 3 L.',
      },
      {
        id: 'iSemen',
        type: 'input',
        konteks: 'tenda',
        cerita: 'Untuk menanam tiang, campuran semen : pasir = 1 : 3. Tersedia 500 g semen.',
        pertanyaan: 'Berapa kilogram pasir yang diperlukan?',
        cek: {
          jenis: 'hilangSatuan',
          a: 1,
          b: 3,
          x: 500,
          satX: 'g',
          posisi: 'kanan',
          satJawab: 'kg',
        },
        jawab: '1,5',
        satuan: 'kg',
        hints: ['Pasir = 3 × 500 g = 1.500 g.', '1.500 g = … kg (desimal pakai koma).'],
        explanation: '1 : 3 = 500 : 1.500 (g); 1.500 g = 1,5 kg.',
      },
      {
        id: 'iJam',
        type: 'input',
        konteks: 'jadwal',
        cerita: 'Perjalanan bus ke bumi perkemahan memerlukan 2,5 jam.',
        pertanyaan: 'Berapa menit lama perjalanan itu?',
        cek: { jenis: 'konversi', nilai: 2.5, dari: 'jam', ke: 'menit' },
        jawab: '150',
        satuan: 'menit',
        hints: ['1 jam = 60 menit.', '2,5 × 60 = …'],
        explanation: '2,5 jam = 2,5 × 60 menit = 150 menit.',
      },
      {
        id: 'iBotol',
        type: 'input',
        konteks: 'minuman',
        cerita: 'Sebuah botol berisi 1.250 mL air.',
        pertanyaan: 'Berapa liter isi botol itu?',
        cek: { jenis: 'konversi', nilai: 1250, dari: 'mL', ke: 'L' },
        jawab: '1,25',
        satuan: 'L',
        hints: ['1 L = 1.000 mL, jadi dibagi 1.000.', 'Desimal ditulis dengan koma.'],
        explanation: '1.250 mL : 1.000 = 1,25 L.',
      },
      {
        id: 'cTali',
        type: 'choice',
        konteks: 'tenda',
        cerita: 'Tali A panjangnya 3 m dan tali B panjangnya 75 cm.',
        pertanyaan: 'Rasio panjang tali A terhadap tali B dalam bentuk paling sederhana adalah …',
        cek: { jenis: 'satuan', a: 3, satA: 'm', b: 75, satB: 'cm' },
        options: [
          { id: 'a', label: '4 : 1' },
          { id: 'b', label: '1 : 25' },
          { id: 'c', label: '300 : 75' },
          { id: 'd', label: '1 : 4' },
        ],
        correct: 'a',
        explanation: '3 m = 300 cm; 300 : 75 dibagi FPB 75 menjadi 4 : 1.',
      },
      {
        id: 'cBenar',
        type: 'choice',
        konteks: 'jadwal',
        cerita: 'Periksa setiap pernyataan dengan menyamakan satuan lebih dulu.',
        pertanyaan: 'Pernyataan yang BENAR adalah …',
        options: [
          { id: 'a', label: '1 jam : 20 menit = 3 : 1' },
          { id: 'b', label: '1 jam : 20 menit = 1 : 20' },
          { id: 'c', label: '2 kg : 500 g = 1 : 250' },
          { id: 'd', label: '1 L : 250 mL = 1 : 4' },
        ],
        correct: 'a',
        /* Rasio pada tiap opsi dibandingkan dengan rasio engine (tes). */
        cekOpsi: {
          a: { a: 1, satA: 'jam', b: 20, satB: 'menit' },
          b: { a: 1, satA: 'jam', b: 20, satB: 'menit' },
          c: { a: 2, satA: 'kg', b: 500, satB: 'g' },
          d: { a: 1, satA: 'L', b: 250, satB: 'mL' },
        },
        explanation:
          '1 jam = 60 menit, jadi 60 : 20 = 3 : 1. Yang lain keliru: 2 kg : 500 g = 4 : 1 dan 1 L : 250 mL = 4 : 1.',
      },
      {
        id: 'cLangkah',
        type: 'choice',
        konteks: 'jelajah',
        cerita: 'Dimas ingin menyederhanakan rasio 1,2 km : 400 m.',
        pertanyaan: 'Langkah pertama yang tepat adalah …',
        options: [
          { id: 'a', label: 'Mengubah 1,2 km menjadi 1.200 m' },
          { id: 'b', label: 'Membagi 1,2 dan 400 dengan FPB-nya' },
          { id: 'c', label: 'Menukar urutannya menjadi 400 : 1,2' },
          { id: 'd', label: 'Mengubah 400 m menjadi 400.000 km' },
        ],
        correct: 'a',
        explanation: 'Samakan satuan dulu: 1,2 km = 1.200 m, lalu 1.200 : 400 = 3 : 1.',
      },
      {
        id: 'cGula',
        type: 'choice',
        konteks: 'dapur',
        cerita: 'Gula 3 kg dibagi untuk regu putra dan putri dengan rasio 1 : 2.',
        pertanyaan: 'Bagian regu putra adalah …',
        cek: { jenis: 'bagi', total: 3, satTotal: 'kg', a: 1, b: 2, bagian: 'a', satJawab: 'g' },
        options: [
          { id: 'a', label: '1.000 g' },
          { id: 'b', label: '1.500 g' },
          { id: 'c', label: '2.000 g' },
          { id: 'd', label: '1 g' },
        ],
        correct: 'a',
        explanation: '3 kg = 3.000 g dibagi 1 + 2 = 3 bagian; putra 1 bagian = 1.000 g.',
      },
      {
        id: 'cSenam',
        type: 'choice',
        konteks: 'jadwal',
        cerita: 'Senam pagi 45 menit, sedangkan jelajah alam 1,5 jam.',
        pertanyaan: 'Rasio lama senam terhadap lama jelajah dalam bentuk paling sederhana adalah …',
        cek: { jenis: 'satuan', a: 45, satA: 'menit', b: 1.5, satB: 'jam' },
        options: [
          { id: 'a', label: '1 : 2' },
          { id: 'b', label: '30 : 1' },
          { id: 'c', label: '3 : 10' },
          { id: 'd', label: '2 : 1' },
        ],
        correct: 'a',
        explanation: '1,5 jam = 90 menit; 45 : 90 dibagi FPB 45 menjadi 1 : 2.',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ---------- Tahap 7: Refleksi ---------- */
  refleksi: {
    kicker: 'Tahap 7 · Refleksi',
    syntax: 'Refleksi Individu & Pasangan',
    goal: 'Merefleksikan pemahaman rasio dengan konversi satuan dan kerja sama dengan pasangan.',
    guru: 'Baca beberapa jawaban refleksi untuk menentukan murid yang perlu pendampingan. Penilaian kerja pasangan membantu memantau kualitas diskusi.',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Mengapa 2 m : 50 cm tidak sama dengan 2 : 50? Jelaskan dengan kalimatmu sendiri.',
        placeholder: 'Karena …',
      },
      {
        id: 'q2',
        teks: 'Apa yang berubah dari jawabanmu setelah berdiskusi dengan pasangan?',
        placeholder: 'Awalnya aku menjawab …, setelah berdiskusi …',
      },
      {
        id: 'q3',
        teks: 'Di mana lagi kamu menemui rasio dengan satuan berbeda dalam kehidupan sehari-hari?',
        placeholder: 'Misalnya saat …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menyelesaikan masalah rasio yang satuannya berbeda?',
    diriOpsi: [
      { id: 'yakin', label: '😄 Yakin — aku bisa menjelaskannya kepada teman' },
      { id: 'cukup', label: '🙂 Cukup yakin — kadang masih perlu melihat fakta konversi' },
      { id: 'belum', label: '🤔 Belum yakin — aku masih perlu berlatih' },
    ],
    pasanganLabel: 'Bagaimana kerja sama kalian berdua hari ini?',
    pasanganOpsi: [
      { id: 'seimbang', label: '🤝 Kami bergantian menjelaskan dan saling mendengarkan' },
      { id: 'dominan', label: '🗣️ Kebanyakan hanya satu orang yang berbicara' },
      { id: 'kurang', label: '😶 Kami belum benar-benar berdiskusi' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ---------- Tahap 8: Selesai ---------- */
  selesai: {
    judul: 'Hebat, regu kalian siap berkemah!',
    teks: 'Kalian sudah menyamakan satuan, menyederhanakan rasio, dan menyelesaikan masalah persiapan kemah bersama pasangan.',
    aturan: [
      { teks: '2 m : 50 cm = 200 : 50 = 4 : 1', ket: 'samakan satuan, lalu bagi FPB' },
      { teks: '1 jam : 45 menit = 60 : 45 = 4 : 3', ket: '1 jam = 60 menit, bukan 100' },
      { teks: '2 : 0,5 = 20 : 5 = 4 : 1', ket: 'suku desimal dikali 10 agar bulat' },
      { teks: '2.000 g dibagi 3 : 2 → 1.200 g', ket: 'total : (3 + 2) × 3' },
    ],
    capaian: [
      'Menyamakan satuan panjang, massa, volume, dan waktu sebelum menuliskan rasio.',
      'Menyederhanakan rasio dengan FPB, termasuk rasio bersuku desimal.',
      'Menentukan suku yang belum diketahui dan membagi jumlah menurut rasio.',
      'Menafsirkan rasio paling sederhana dalam konteks persiapan kemah.',
      'Menyepakati dan membagikan strategi bersama pasangan.',
    ],
  },
};
