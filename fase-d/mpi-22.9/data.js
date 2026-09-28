'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Volume Limas
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Tujuan Pembelajaran:
   Menentukan rumus volume limas.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'tuang' & 'belah'
     Sintaks 4 — Data processing ............ tahap 'olah'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas:
     1. Stimulasi   — Toko Cokelat “Piramida Manis”: cokelat cair dicetak
                      dalam cetakan limas, lalu dikemas dalam kotak prisma
                      beralas & bertinggi sama. Berapa cetakan untuk
                      memenuhi satu kotak? Murid MENDUGA + alasan (tidak
                      dinilai).
     2. Masalah     — memilih rumusan masalah & menulis hipotesis.
     3. Tuang       — Lab Tuang: mengisi wadah limas dengan pasir lalu
                      menuangnya ke wadah prisma pasangannya (alas &
                      tinggi sama) sampai penuh, pada tiga bentuk alas
                      (persegi, segitiga, persegi panjang). Kartu isian
                      berdiagnosa (V prisma, banyak tuangan, V limas),
                      lalu pertanyaan penuntun: V limas = ⅓ V prisma.
     4. Belah       — Lab Belah Kubus: kubus cokelat dibelah dari pusatnya
                      menjadi 6 limas persegi kongruen. Kartu isian
                      (V kubus, V satu limas, luas alas, tinggi = ½ rusuk,
                      La × t, (La × t) ÷ V limas) dan pertanyaan penuntun
                      → bukti kedua bahwa V limas = ⅓ × La × t.
     5. Olah data   — kartu data tiga limas (La, t, La × t, V limas dari
                      percobaan, (La × t) ÷ V), pertanyaan pola, dan
                      memilah kartu “cara tepat / tidak tepat”.
     6. Pembuktian  — cetakan tugu: mencari tinggi limas dari tₛ
                      (Pythagoras), cara percobaan (⅓ volume prisma)
                      vs dugaan rumus → hasilnya sama; menanggapi tiga
                      miskonsepsi teman.
     7. Simpulan    — menyusun kalimat kesimpulan dari bank kalimat.
     8. Uji terap   — 8 soal kontekstual.
     9. Refleksi    — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan.

   Alas limas ditulis sebagai titik-titik poligon dalam cm (lihat
   shared/engine.js seksi 47 & 59). Semua kunci (luas alas, volume,
   tinggi, pengecoh) diuji terhadap engine di
   tests/mpi-22.9-data.test.js.
   ============================================================ */

var DATA = {
  /* ----------------------------------------------------------
     LIMAS — cetakan (dipakai tahap 1, 3, 5)
     ---------------------------------------------------------- */
  limas: [
    {
      id: 'persegi',
      nama: '🍫 Cetakan cokelat',
      bentuk: 'limas persegi',
      alas: [
        [0, 0],
        [6, 0],
        [6, 6],
        [0, 6],
      ],
      t: 9,
      infoAlas: 'persegi 6 cm × 6 cm, tinggi 9 cm',
      caraLuasAlas: '6 × 6',
    },
    {
      id: 'segitiga',
      nama: '🧀 Cetakan keju',
      bentuk: 'limas segitiga',
      alas: [
        [0, 6],
        [8, 6],
        [8, 0],
      ],
      t: 6,
      adaSetengah: true,
      infoAlas: 'segitiga siku-siku 8 cm & 6 cm, tinggi 6 cm',
      caraLuasAlas: '½ × 8 × 6',
    },
    {
      id: 'persegipanjang',
      nama: '🍬 Cetakan permen',
      bentuk: 'limas persegi panjang',
      alas: [
        [0, 0],
        [8, 0],
        [8, 5],
        [0, 5],
      ],
      t: 6,
      infoAlas: 'persegi panjang 8 cm × 5 cm, tinggi 6 cm',
      caraLuasAlas: '8 × 5',
    },
    {
      id: 'besar',
      nama: '🎂 Hiasan kue',
      bentuk: 'limas persegi',
      alas: [
        [0, 0],
        [12, 0],
        [12, 12],
        [0, 12],
      ],
      t: 10,
      infoAlas: 'persegi 12 cm × 12 cm, tinggi 10 cm',
      caraLuasAlas: '12 × 12',
    },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1 (Stimulation)',
    goal: 'Mengamati cetakan cokelat berbentuk limas dan menduga hubungan isinya dengan kotak prisma.',
    tp: 'Menentukan rumus volume limas.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menunjukkan melalui percobaan menuang bahwa volume limas adalah ⅓ volume prisma yang alas dan tingginya sama.',
      'Menjelaskan mengapa kubus dapat dibelah menjadi 6 limas yang sama dan menghubungkannya dengan rumus volume limas.',
      'Menemukan rumus volume limas: V = ⅓ × luas alas × tinggi limas.',
      'Membedakan tinggi limas dengan tinggi sisi tegak dan mencari tinggi limas dengan teorema Pythagoras bila perlu.',
      'Menggunakan rumus volume limas untuk menyelesaikan masalah sehari-hari.',
    ],
    guru: 'Bawa cetakan berbentuk limas (atau buat dari karton) dan kotak prisma yang alas dan tingginya sama. Tanyakan “berapa cetakan untuk memenuhi kotak?” dan biarkan murid menduga tanpa dikoreksi; dugaan akan diuji pada Lab Tuang.',
    judul: 'Toko Cokelat “Piramida Manis”',
    cerita:
      'Bu Sari menjual cokelat berbentuk limas. Cokelat cair dituang ke cetakan limas, lalu setelah beku dikemas dalam kotak berbentuk prisma. Alas dan tinggi kotak dibuat SAMA dengan cetakannya. Bu Sari ingin tahu berapa cm³ cokelat cair untuk satu cetakan agar bisa menghitung modal.',
    pertanyaan:
      'Menurut dugaanmu, berapa cetakan limas penuh cokelat cair yang dibutuhkan untuk memenuhi satu kotak prisma?',
    opsi: [
      { id: 'dua', label: '2 cetakan — isi limas setengah isi prisma' },
      { id: 'tiga', label: '3 cetakan — isi limas sepertiga isi prisma' },
      { id: 'empat', label: '4 cetakan — isi limas seperempat isi prisma' },
      { id: 'satu', label: '1 cetakan — isinya sama saja karena alas dan tingginya sama' },
    ],
    dugaanTepat: 'tiga',
    alasanLabel: 'Tuliskan alasan dugaanmu.',
    alasanPlaceholder: 'Aku menduga begitu karena …',
    catatan:
      'Belum ada jawaban benar atau salah. Simpan dugaanmu, nanti kamu akan membuktikannya sendiri di Lab Tuang.',
    nextLabel: 'Lanjut ke Rumusan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: 'Discovery Learning · Sintaks 2 (Problem Statement)',
    goal: 'Merumuskan pertanyaan yang akan diselidiki dan menulis hipotesis.',
    guru: 'Tekankan bahwa banyak cokelat cair = volume (isi) cetakan. Ingatkan rumus volume prisma dari materi 22.4, lalu terima hipotesis apa pun selama bisa diuji dengan percobaan menuang.',
    pengantar:
      'Banyak cokelat cair untuk satu cetakan sama dengan VOLUME cetakan limas itu. Volume kotak prisma sudah bisa dihitung: luas alas × tinggi. Bu Sari ingin tahu hubungan keduanya agar punya rumus volume limas.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'rumus',
        label:
          'Bagaimana hubungan volume limas dengan volume prisma yang alas dan tingginya sama, sehingga rumus volume limas dapat ditemukan?',
      },
      { id: 'harga', label: 'Berapa harga satu kilogram cokelat batang di pasar?' },
      { id: 'luas', label: 'Berapa luas kertas pembungkus untuk menutup cetakan limas?' },
      { id: 'rusuk', label: 'Berapa banyak rusuk yang dimiliki cetakan limas persegi?' },
    ],
    correct: 'rumus',
    umpan: {
      rumus:
        'Tepat! Pertanyaan ini bisa diselidiki dengan menuang isi limas ke prisma pasangannya.',
      harga:
        'Harga penting untuk modal, tetapi Bu Sari harus tahu dulu berapa cm³ cokelatnya. Coba pilih yang lain.',
      luas: 'Kertas pembungkus berhubungan dengan luas permukaan (materi 22.7), bukan isi cetakan. Coba pilih yang lain.',
      rusuk:
        'Banyak rusuk sudah kamu pelajari di materi 22.6 dan tidak menjawab banyak cokelat. Coba pilih yang lain.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu, volume limas berapa bagian dari volume prisma yang alas dan tingginya sama?',
    hipotesisPlaceholder: 'Menurutku, volume limas adalah …',
    nextLabel: 'Mulai Lab Tuang →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — LAB TUANG
     ---------------------------------------------------------- */
  tuang: {
    kicker: 'Tahap 3 · Mengumpulkan Data (1)',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Menuang isi wadah limas ke wadah prisma yang alas dan tingginya sama, lalu mencatat hasilnya.',
    guru: 'Bila ada alat peraga, lakukan percobaan nyata dengan pasir atau beras. Minta murid memastikan wadah limas diisi rata sampai puncak setiap kali. Tanyakan: “Apakah hasilnya sama untuk bentuk alas yang lain?”',
    instruksi:
      'Pilih pasangan wadah. Tekan 🪣 Isi limas dengan pasir, lalu ⤵ Tuang ke prisma. Ulangi sampai prisma penuh dan hitung berapa kali kamu menuang. Lakukan pada ketiga pasangan.',
    lab: ['persegi', 'segitiga', 'persegipanjang'],
    syaratLab:
      'Untuk melanjutkan: penuhi prisma pada ketiga pasangan wadah dengan menuang isi limas.',
    instruksiKartu:
      'Lengkapi kartu setiap pasangan. Volume prisma = luas alas × tinggi; volume limas = volume prisma ÷ banyak tuangan.',
    tanya: [
      {
        id: 'u1',
        tanya: 'Pada ketiga pasangan, berapa kali isi limas dituang sampai prisma penuh?',
        opsi: [
          { id: '3', label: 'Selalu 3 kali' },
          { id: '2', label: 'Selalu 2 kali' },
          { id: 'beda', label: 'Berbeda-beda, tergantung bentuk alasnya' },
          { id: '6', label: 'Selalu 6 kali' },
        ],
        correct: '3',
        umpan: {
          3: 'Tepat! Pada alas persegi, segitiga, dan persegi panjang, prisma selalu penuh setelah 3 kali tuang.',
          2: 'Periksa lagi Lab Tuang: setelah 2 kali tuang, prisma baru terisi ⅔ bagian.',
          beda: 'Periksa ketiga pasangan: bentuk alasnya berbeda, tetapi banyak tuangannya sama.',
          6: 'Enam adalah banyak limas pada Lab Belah Kubus nanti. Di Lab Tuang, hitung lagi banyak tuangannya.',
        },
      },
      {
        id: 'u2',
        tanya: 'Jadi, volume limas sama dengan … volume prisma yang alas dan tingginya sama.',
        opsi: [
          { id: 'sepertiga', label: '⅓ kali' },
          { id: 'setengah', label: '½ kali' },
          { id: 'tiga', label: '3 kali' },
          { id: 'sama', label: 'sama dengan' },
        ],
        correct: 'sepertiga',
        umpan: {
          sepertiga: 'Tepat! Tiga limas penuh mengisi satu prisma, jadi satu limas = ⅓ prisma.',
          setengah: 'Kalau ½, prisma sudah penuh setelah 2 kali tuang. Kenyataannya perlu 3 kali.',
          tiga: 'Terbalik: PRISMA yang 3 kali volume limas. Limas lebih kecil daripada prisma.',
          sama: 'Walaupun alas dan tingginya sama, limas makin menyempit ke puncak sehingga isinya lebih sedikit.',
        },
      },
      {
        id: 'u3',
        tanya: 'Mengapa isi limas lebih sedikit daripada prisma yang alas dan tingginya sama?',
        opsi: [
          {
            id: 'runcing',
            label: 'Karena limas makin menyempit ke atas sampai satu titik puncak',
          },
          { id: 'alas', label: 'Karena alas limas lebih kecil daripada alas prisma' },
          { id: 'tinggi', label: 'Karena limas lebih pendek daripada prisma' },
          { id: 'bahan', label: 'Karena bahan wadah limas lebih tebal' },
        ],
        correct: 'runcing',
        umpan: {
          runcing:
            'Tepat! Penampang prisma sama besar dari bawah sampai atas, sedangkan penampang limas mengecil sampai titik puncak.',
          alas: 'Alas keduanya dibuat SAMA persis. Perhatikan bentuknya ke arah atas.',
          tinggi: 'Tinggi keduanya juga dibuat sama. Perhatikan bentuknya ke arah puncak.',
          bahan: 'Di lab ini, tebal wadah diabaikan. Perhatikan bentuk limas ke arah puncak.',
        },
      },
    ],
    temuan:
      'Pada ketiga pasangan, prisma penuh setelah 3 kali tuang. Jadi volume limas = ⅓ × volume prisma yang alas dan tingginya sama = ⅓ × luas alas × tinggi.',
    nextLabel: 'Lanjut: Belah Kubus →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — LAB BELAH KUBUS
     ---------------------------------------------------------- */
  belah: {
    kicker: 'Tahap 4 · Mengumpulkan Data (2)',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Membelah kubus menjadi 6 limas yang sama dan menghubungkan volumenya dengan luas alas × tinggi.',
    guru: 'Bila memungkinkan, tunjukkan model 6 limas karton yang dapat dirangkai menjadi kubus. Tekankan bahwa puncak semua limas di pusat kubus, sehingga tinggi setiap limas = ½ rusuk kubus.',
    instruksi:
      'Bu Sari juga menjual kotak cokelat kubus yang bisa dipecah menjadi potongan limas. Tekan ✂️ Belah untuk memisahkan potongannya, amati bentuk dan ukurannya, lalu isi kartu.',
    kubus: { s: 6, nama: '🎲 Kotak cokelat kubus' },
    syaratLab: 'Untuk melanjutkan: belah kubus dan amati keenam limasnya.',
    kartuJudul: '🎲 Kubus cokelat rusuk 6 cm',
    hints: [
      'Volume kubus = 6 × 6 × 6.',
      'Keenam limas sama besar, jadi volume satu limas = volume kubus ÷ 6.',
      'Alas limas = satu sisi kubus (6 × 6). Tinggi limas = jarak pusat kubus ke sisi = ½ × 6.',
    ],
    tanya: [
      {
        id: 'b1',
        tanya: 'Mengapa keenam limas hasil belahan sama besar?',
        opsi: [
          {
            id: 'kongruen',
            label: 'Alasnya sisi-sisi kubus yang sama dan puncaknya sama-sama di pusat kubus',
          },
          { id: 'warna', label: 'Karena warnanya sama' },
          { id: 'kebetulan', label: 'Hanya kebetulan, bisa saja berbeda' },
          { id: 'atas', label: 'Karena semuanya menghadap ke atas' },
        ],
        correct: 'kongruen',
        umpan: {
          kongruen:
            'Tepat! Alasnya persegi yang sama dan jarak pusat ke setiap sisi kubus sama, jadi keenam limas kongruen.',
          warna: 'Warna hanya untuk membedakan. Bandingkan alas dan tinggi setiap limas.',
          kebetulan:
            'Bukan kebetulan: pusat kubus berjarak sama ke keenam sisinya, dan semua sisi kubus sama.',
          atas: 'Arahnya berbeda-beda (atas, bawah, kiri, kanan, depan, belakang), tetapi ukurannya sama.',
        },
      },
      {
        id: 'b2',
        tanya: 'Tinggi setiap limas sama dengan …',
        opsi: [
          { id: 'setengah', label: '½ × rusuk kubus' },
          { id: 'rusuk', label: 'rusuk kubus' },
          { id: 'sepertiga', label: '⅓ × rusuk kubus' },
          { id: 'diagonal', label: 'diagonal sisi kubus' },
        ],
        correct: 'setengah',
        umpan: {
          setengah:
            'Tepat! Puncak limas di pusat kubus, tepat di tengah antara dua sisi yang berhadapan.',
          rusuk: 'Kalau setinggi rusuk kubus, puncaknya menembus sisi kubus di seberangnya.',
          sepertiga: 'Pusat kubus ada di TENGAH-tengah kubus, bukan di sepertiganya.',
          diagonal:
            'Diagonal sisi terletak pada alas. Tinggi limas tegak lurus dari puncak ke alas.',
        },
      },
      {
        id: 'b3',
        tanya: 'Volume satu limas 36 cm³, sedangkan luas alas × tinggi = 36 × 3 = 108 cm³. Jadi …',
        opsi: [
          { id: 'rumus', label: 'V limas = ⅓ × luas alas × tinggi' },
          { id: 'setengah', label: 'V limas = ½ × luas alas × tinggi' },
          { id: 'penuh', label: 'V limas = luas alas × tinggi' },
          { id: 'seperenam', label: 'V limas = ⅙ × luas alas × tinggi' },
        ],
        correct: 'rumus',
        umpan: {
          rumus: 'Tepat! 36 = ⅓ × 108. Hasil ini sama dengan temuan di Lab Tuang.',
          setengah: '½ × 108 = 54, bukan 36. Coba bandingkan lagi.',
          penuh: '36 × 3 = 108 adalah volume prisma pasangannya. Limasnya hanya 36 cm³.',
          seperenam:
            '⅙ adalah bagian dari volume KUBUS (6³ = 216), bukan dari luas alas × tinggi limas. ⅙ × 108 = 18, bukan 36.',
        },
      },
    ],
    temuan:
      'Kubus rusuk 6 cm = 6 limas kongruen. Setiap limas: V = 216 ÷ 6 = 36 cm³, alas 36 cm², tinggi 3 cm, dan 36 = ⅓ × 36 × 3. Bukti kedua: V limas = ⅓ × luas alas × tinggi.',
    nextLabel: 'Lanjut ke Mengolah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGOLAH DATA
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 5 · Mengolah Data',
    syntax: 'Discovery Learning · Sintaks 4 (Data Processing)',
    goal: 'Mengolah data luas alas, tinggi, dan volume tiga limas untuk menemukan pola rumus volume limas.',
    guru: 'Murid bisa bekerja berpasangan: satu menghitung, satu memeriksa. Setelah ketiga kartu benar, minta murid menjelaskan mengapa (La × t) ÷ V selalu 3.',
    instruksiData:
      'Lengkapi kartu data ketiga cetakan. Volume limas diperoleh dari percobaan menuang (volume prisma pasangannya dibagi banyak tuangan).',
    limasIds: ['segitiga', 'persegipanjang', 'besar'],
    instruksiPola: 'Perhatikan ketiga kartu datamu, lalu jawab pertanyaan berikut.',
    konsep: [
      {
        id: 'k1',
        tanya: 'Pada ketiga kartu, (La × t) ÷ V limas selalu bernilai …',
        opsi: [
          { id: '3', label: '3' },
          { id: '2', label: '2' },
          { id: '6', label: '6' },
          { id: 'beda', label: 'berbeda-beda' },
        ],
        correct: '3',
        umpan: {
          3: 'Tepat! La × t selalu 3 kali volume limas, jadi V limas = ⅓ × La × t.',
          2: 'Periksa kartumu, mis. 1.440 ÷ 480 = 3, bukan 2.',
          6: 'Periksa kartumu, mis. 240 ÷ 80 = 3, bukan 6.',
          beda: 'Periksa lagi ketiga kartu: ukurannya berbeda, tetapi hasil baginya sama.',
        },
      },
      {
        id: 'k2',
        tanya: 'Tinggi mana yang dipakai dalam rumus volume limas?',
        opsi: [
          { id: 't', label: 'Tinggi limas: jarak tegak lurus dari puncak ke alas' },
          { id: 'ts', label: 'Tinggi segitiga sisi tegak (tₛ)' },
          { id: 'rusuk', label: 'Panjang rusuk tegak limas' },
          { id: 'alas', label: 'Panjang rusuk alas' },
        ],
        correct: 't',
        umpan: {
          t: 'Tepat! Sama seperti prisma pasangannya, tingginya diukur tegak lurus dari alas ke puncak.',
          ts: 'tₛ dipakai untuk luas sisi tegak (luas permukaan). Volume memakai tinggi limas.',
          rusuk: 'Rusuk tegak miring, lebih panjang daripada tinggi limas.',
          alas: 'Rusuk alas dipakai untuk menghitung luas alas, bukan tinggi.',
        },
      },
      {
        id: 'k3',
        tanya:
          'Limas A beralas segitiga dan limas B beralas persegi. Luas alas keduanya 40 cm² dan tingginya 6 cm. Bagaimana volumenya?',
        opsi: [
          { id: 'sama', label: 'Sama, yaitu 80 cm³' },
          { id: 'persegi', label: 'Limas B lebih besar karena alasnya persegi' },
          { id: 'segitiga', label: 'Limas A lebih besar karena alasnya segitiga' },
          { id: 'tidak', label: 'Tidak bisa dihitung tanpa panjang rusuk' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Tepat! Volume limas hanya bergantung pada luas alas dan tinggi: ⅓ × 40 × 6 = 80 cm³.',
          persegi: 'Bentuk alas tidak berpengaruh bila luasnya sama. Hitung ⅓ × 40 × 6.',
          segitiga: 'Bentuk alas tidak berpengaruh bila luasnya sama. Hitung ⅓ × 40 × 6.',
          tidak: 'Luas alas sudah diketahui, jadi rusuk tidak diperlukan: ⅓ × 40 × 6.',
        },
      },
    ],
    instruksiPilah:
      'Bu Sari menulis beberapa cara menghitung volume cetakan limas. Pilah: apakah caranya tepat?',
    opsiKlas: [
      { id: 'tepat', label: 'Cara tepat' },
      { id: 'salah', label: 'Cara tidak tepat' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: '⅓ × luas alas × tinggi limas',
        correct: 'tepat',
        explanation: 'Inilah rumus volume limas yang kamu temukan.',
      },
      {
        id: 'p2',
        teks: '(luas alas × tinggi limas) ÷ 3',
        correct: 'tepat',
        explanation: 'Mengalikan ⅓ sama dengan membagi 3.',
      },
      {
        id: 'p3',
        teks: '⅓ × volume prisma yang alas dan tingginya sama',
        correct: 'tepat',
        explanation: 'Sesuai Lab Tuang: tiga limas penuh mengisi satu prisma.',
      },
      {
        id: 'p4',
        teks: 'luas alas × tinggi limas',
        correct: 'salah',
        explanation: 'Itu volume prisma pasangannya, tiga kali volume limas.',
      },
      {
        id: 'p5',
        teks: '½ × luas alas × tinggi limas',
        correct: 'salah',
        explanation: 'Faktornya ⅓, bukan ½. Prisma baru penuh setelah 3 kali tuang.',
      },
      {
        id: 'p6',
        teks: '⅓ × luas alas × tinggi sisi tegak (tₛ)',
        correct: 'salah',
        explanation: 'tₛ lebih panjang daripada tinggi limas. Volume memakai tinggi limas.',
      },
    ],
    temuan: 'Volume limas = ⅓ × luas alas × tinggi limas, apa pun bentuk alasnya.',
    nextLabel: 'Lanjut ke Pembuktian →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    syntax: 'Discovery Learning · Sintaks 5 (Verification)',
    goal: 'Membuktikan dugaan rumus pada limas baru dengan dua cara dan menanggapi pendapat teman.',
    guru: 'Ingatkan teorema Pythagoras: segitiga TOP siku-siku di O, dengan TP = tₛ (sisi miring). Minta murid mengerjakan kedua cara, lalu bandingkan hasilnya. Pada bagian miskonsepsi, minta murid menjelaskan letak kesalahan teman dengan kata-katanya sendiri.',
    limas: {
      id: 'tugu',
      nama: '🗼 Cetakan tugu cokelat',
      n: 4,
      s: 12,
      ts: 10,
    },
    cerita:
      'Bu Sari membeli cetakan baru berbentuk limas persegi. Rusuk alasnya 12 cm dan tinggi segitiga sisi tegaknya (TP) 10 cm. Tinggi cetakan (TO) belum diketahui.',
    instruksiTinggi: 'Langkah awal — cari tinggi limas (t = TO).',
    langkahTinggi: [
      {
        id: 'h1',
        label: 'OP = jarak pusat alas ke tengah rusuk alas = ½ × 12 = … cm',
        kunci: 'apotema',
        hints: ['P di tengah rusuk alas, O di tengah persegi. Jaraknya setengah rusuk alas.'],
      },
      {
        id: 'h2',
        label: 'Segitiga TOP siku-siku di O, jadi t = TO = √(10² − 6²) = √64 = … cm',
        kunci: 'tinggi',
        hints: [
          'TP = tₛ adalah sisi miring, jadi kuadratnya DIKURANGI: 100 − 36 = 64.',
          'Bilangan berapa yang kuadratnya 64?',
        ],
      },
    ],
    instruksiPrisma:
      'Cara 1 — percobaan: isi cetakan dituang ke kotak prisma 12 cm × 12 cm × 8 cm dan kotak penuh setelah 3 kali tuang.',
    langkahPrisma: [
      {
        id: 'p1',
        label: 'Volume kotak prisma = 12 × 12 × 8 = … cm³',
        kunci: 'volumePrisma',
        hints: ['Volume prisma = luas alas × tinggi = 144 × 8.'],
      },
      {
        id: 'p2',
        label: 'Volume cetakan = volume kotak ÷ 3 = 1.152 ÷ 3 = … cm³',
        kunci: 'volume',
        hints: ['Kotak penuh setelah 3 kali tuang, jadi bagi 3.'],
      },
    ],
    instruksiRumus: 'Cara 2 — gunakan dugaan rumus dari tahap sebelumnya.',
    langkahRumus: [
      {
        id: 'r1',
        label: 'Luas alas = 12 × 12 = … cm²',
        kunci: 'luasAlas',
        hints: ['Luas persegi = sisi × sisi.'],
      },
      {
        id: 'r2',
        label: 'Volume = ⅓ × La × t = ⅓ × 144 × 8 = … cm³',
        kunci: 'volume',
        hints: ['⅓ × 144 = 48, lalu 48 × 8.'],
      },
    ],
    temuanSama:
      'Kedua cara menghasilkan 384 cm³. Dugaan rumus V = ⅓ × luas alas × tinggi terbukti pada limas baru!',
    instruksiMiskonsepsi:
      'Tiga temanmu menghitung volume cetakan tugu itu. Tanggapi pendapat mereka.',
    soal: [
      {
        id: 'm1',
        teks: 'Raka: “Volumenya 144 × 8 = 1.152 cm³.”',
        nilaiTeman: 1152,
        miskonsepsi: 'lupa-sepertiga',
        options: [
          { id: 'a', label: 'Kurang tepat, itu volume prisma pasangannya; harus dikali ⅓' },
          { id: 'b', label: 'Sudah tepat, sama seperti rumus volume prisma' },
          { id: 'c', label: 'Kurang tepat, seharusnya dikali ½' },
          { id: 'd', label: 'Kurang tepat, seharusnya memakai tₛ = 10 cm' },
        ],
        correct: 'a',
        explanation:
          '144 × 8 = 1.152 cm³ adalah volume kotak prisma. Cetakan limas hanya ⅓-nya: 1.152 ÷ 3 = 384 cm³.',
      },
      {
        id: 'm2',
        teks: 'Sinta: “⅓ × 144 × 10 = 480 cm³, karena tinggi sisi tegaknya 10 cm.”',
        nilaiTeman: 480,
        miskonsepsi: 'tinggi-sisi',
        options: [
          {
            id: 'a',
            label: 'Kurang tepat, volume memakai tinggi limas t = 8 cm, bukan tₛ',
          },
          { id: 'b', label: 'Sudah tepat, tinggi limas dan tinggi sisi tegak sama saja' },
          { id: 'c', label: 'Kurang tepat, ⅓ tidak perlu dipakai' },
          { id: 'd', label: 'Kurang tepat, luas alasnya seharusnya 12 × 10' },
        ],
        correct: 'a',
        explanation:
          'tₛ = 10 cm adalah sisi miring segitiga TOP, lebih panjang daripada tinggi limas. Volume memakai TO = 8 cm: ⅓ × 144 × 8 = 384 cm³.',
      },
      {
        id: 'm3',
        teks: 'Dimas: “½ × 144 × 8 = 576 cm³, seperti luas segitiga.”',
        nilaiTeman: 576,
        miskonsepsi: 'setengah',
        options: [
          {
            id: 'a',
            label: 'Kurang tepat, prisma baru penuh setelah 3 kali tuang, jadi faktornya ⅓',
          },
          { id: 'b', label: 'Sudah tepat, limas selalu setengah prisma' },
          { id: 'c', label: 'Kurang tepat, seharusnya tidak memakai pecahan' },
          { id: 'd', label: 'Kurang tepat, seharusnya ⅙ seperti belahan kubus' },
        ],
        correct: 'a',
        explanation:
          'Rumus luas segitiga (½) tidak berlaku untuk volume. Tiga cetakan mengisi satu kotak, jadi V = ⅓ × 144 × 8 = 384 cm³.',
      },
    ],
    nextLabel: 'Lanjut ke Menarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    syntax: 'Discovery Learning · Sintaks 6 (Generalization)',
    goal: 'Menyusun kesimpulan tentang rumus volume limas dari temuan sendiri.',
    guru: 'Setelah kesimpulan tepat, minta beberapa murid membacakannya dan menuliskan rumus di buku catatan beserta gambar limas dan prisma pasangannya. Bandingkan dengan rumus volume prisma dari materi 22.4.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari pilihan. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      {
        id: 'g1',
        awal: 'Isi limas harus dituang 3 kali untuk memenuhi prisma yang alas dan tingginya sama, sehingga volume limas adalah',
        correct: 'sepertiga',
      },
      {
        id: 'g2',
        awal: 'Karena volume prisma = luas alas × tinggi, rumus volume limas adalah',
        correct: 'rumus',
      },
      { id: 'g3', awal: 'Tinggi yang dipakai dalam rumus itu adalah', correct: 'tinggi' },
      { id: 'g4', awal: 'Rumus ini berlaku untuk limas dengan alas', correct: 'semua' },
    ],
    bank: [
      { id: 'sepertiga', teks: '⅓ × volume prisma tersebut.' },
      { id: 'rumus', teks: 'V = ⅓ × La × t.' },
      { id: 'tinggi', teks: 'tinggi limas, yaitu jarak tegak lurus dari puncak ke alas.' },
      { id: 'semua', teks: 'berbentuk apa pun: segitiga, segi empat, maupun segi banyak.' },
      { id: 'setengah', teks: '½ × volume prisma tersebut.' },
      { id: 'prisma', teks: 'V = La × t.' },
      { id: 'ts', teks: 'tinggi segitiga sisi tegak (tₛ).' },
      { id: 'persegi', teks: 'persegi saja.' },
    ],
    rangkuman: [
      'Volume limas = <strong>⅓ × volume prisma</strong> yang alas dan tingginya sama (tiga limas penuh mengisi satu prisma).',
      'Kubus dapat dibelah menjadi 6 limas kongruen dengan tinggi ½ rusuk; volume satu limas = ⅓ × luas alas × tinggi.',
      '<strong>V = ⅓ × La × t</strong>, dengan La = luas alas dan t = tinggi limas.',
      'Tinggi limas diukur tegak lurus dari puncak ke alas. Bila yang diketahui tₛ, cari t dengan Pythagoras: t² = tₛ² − (jarak pusat alas ke rusuk alas)².',
      'Rumus berlaku untuk semua bentuk alas; hitung luas alasnya dengan rumus bangun datar yang sesuai.',
    ],
    dugaanJudul: 'Bandingkan dengan dugaan awalmu',
    tanggapanDugaan: {
      tiga: 'Dugaanmu tepat! Tiga cetakan limas memenuhi satu kotak prisma, jadi V limas = ⅓ × La × t.',
      dua: 'Ternyata perlu 3 cetakan, bukan 2. Isi limas hanya ⅓ prisma: V = ⅓ × La × t.',
      empat: 'Ternyata cukup 3 cetakan, bukan 4. Isi limas ⅓ prisma: V = ⅓ × La × t.',
      satu: 'Walaupun alas dan tingginya sama, limas makin menyempit ke puncak. Perlu 3 cetakan: V = ⅓ × La × t.',
    },
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Discovery Learning · Penerapan',
    goal: 'Menggunakan rumus volume limas untuk menyelesaikan masalah sehari-hari.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang banyak salah (terutama lupa ⅓, memakai tₛ, dan mencari tinggi dari volume) untuk dibahas bersama.',
    instruksi:
      'Kerjakan setiap soal. Bila ragu, buka petunjuk. Setelah menjawab, baca penjelasannya sebelum lanjut.',
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: '🍫 Cokelat piramida',
        cerita: 'Sebuah cokelat berbentuk limas persegi dengan rusuk alas 4 cm dan tinggi 6 cm.',
        pertanyaan: 'Berapa cm³ cokelat cair untuk membuat satu cokelat itu?',
        cek: {
          luasAlas: 16,
          tinggi: 6,
          alas: [
            [0, 0],
            [4, 0],
            [4, 4],
            [0, 4],
          ],
        },
        jawab: 32,
        satuan: 'cm³',
        hints: ['Luas alas = 4 × 4 = 16 cm².', 'V = ⅓ × 16 × 6.'],
        explanation: 'V = ⅓ × 16 × 6 = 32 cm³.',
      },
      {
        id: 't2',
        type: 'choice',
        konteks: '⛺ Tenda pramuka',
        cerita: 'Tenda pramuka berbentuk limas persegi dengan rusuk alas 3 m dan tinggi 2 m.',
        pertanyaan: 'Berapa m³ volume udara di dalam tenda?',
        cek: { luasAlas: 9, tinggi: 2 },
        options: [
          { id: 'benar', label: '6 m³' },
          { id: 'lupa-sepertiga', label: '18 m³' },
          { id: 'setengah', label: '9 m³' },
          { id: 'jumlah-ukuran', label: '11 m³' },
        ],
        correct: 'benar',
        hints: ['Luas alas = 3 × 3 = 9 m².', 'Jangan lupa ⅓: V = ⅓ × 9 × 2.'],
        explanation: 'V = ⅓ × 9 × 2 = 6 m³.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: '🏛️ Monumen taman',
        cerita:
          'Monumen di taman kota berbentuk limas dengan alas persegi panjang 10 m × 6 m dan tinggi 9 m. Monumen itu dibuat pejal dari beton.',
        pertanyaan: 'Berapa m³ beton yang dibutuhkan?',
        cek: {
          luasAlas: 60,
          tinggi: 9,
          alas: [
            [0, 0],
            [10, 0],
            [10, 6],
            [0, 6],
          ],
        },
        jawab: 180,
        satuan: 'm³',
        hints: ['Luas alas = 10 × 6 = 60 m².', 'V = ⅓ × 60 × 9.'],
        explanation: 'V = ⅓ × 60 × 9 = 180 m³.',
      },
      {
        id: 't4',
        type: 'choice',
        konteks: '🧀 Keju limas segitiga',
        cerita:
          'Potongan keju berbentuk limas segitiga. Alasnya segitiga siku-siku dengan sisi siku-siku 6 cm dan 8 cm, dan tinggi keju 10 cm.',
        pertanyaan: 'Berapa volume keju itu?',
        cek: {
          luasAlas: 24,
          tinggi: 10,
          adaSetengah: true,
          alas: [
            [0, 0],
            [6, 0],
            [0, 8],
          ],
        },
        options: [
          { id: 'benar', label: '80 cm³' },
          { id: 'lupa-setengah', label: '160 cm³' },
          { id: 'lupa-sepertiga', label: '240 cm³' },
          { id: 'setengah', label: '120 cm³' },
        ],
        correct: 'benar',
        hints: ['Luas alas segitiga = ½ × 6 × 8.', 'Luas alas 24 cm², lalu V = ⅓ × 24 × 10.'],
        explanation: 'La = ½ × 6 × 8 = 24 cm². V = ⅓ × 24 × 10 = 80 cm³.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: '📐 Mencari tinggi',
        cerita:
          'Sebuah wadah lilin aroma berbentuk limas persegi dengan rusuk alas 9 cm. Volumenya 243 cm³.',
        pertanyaan: 'Berapa cm tinggi wadah itu?',
        cek: { cari: 'tinggi', volume: 243, luasAlas: 81 },
        jawab: 9,
        satuan: 'cm',
        hints: ['Luas alas = 9 × 9 = 81 cm².', '243 = ⅓ × 81 × t, jadi 27 × t = 243.'],
        explanation: '243 = ⅓ × 81 × t = 27 × t → t = 243 ÷ 27 = 9 cm.',
      },
      {
        id: 't6',
        type: 'choice',
        konteks: '💎 Hiasan kaca',
        cerita:
          'Hiasan kaca berbentuk limas persegi dengan rusuk alas 6 cm. Tinggi segitiga sisi tegaknya 5 cm.',
        pertanyaan: 'Berapa volume hiasan itu?',
        cek: { luasAlas: 36, tinggi: 4, tinggiSisi: 5, sisiAlas: 6 },
        options: [
          { id: 'benar', label: '48 cm³' },
          { id: 'tinggi-sisi', label: '60 cm³' },
          { id: 'lupa-sepertiga', label: '144 cm³' },
          { id: 'setengah', label: '72 cm³' },
        ],
        correct: 'benar',
        hints: [
          'Yang diketahui tₛ, bukan tinggi limas. Cari t = √(5² − 3²).',
          't = 4 cm. V = ⅓ × 36 × 4.',
        ],
        explanation: 't = √(25 − 9) = 4 cm. V = ⅓ × 36 × 4 = 48 cm³.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: '🍯 Wadah madu',
        cerita:
          'Wadah madu berbentuk limas persegi terbalik dengan rusuk alas 30 cm dan tinggi 10 cm. Wadah diisi madu sampai penuh.',
        pertanyaan: 'Berapa liter madu di dalam wadah itu?',
        cek: { luasAlas: 900, tinggi: 10, keLiter: true },
        jawab: 3,
        satuan: 'liter',
        hints: ['V = ⅓ × 900 × 10 = 3.000 cm³.', '1 liter = 1.000 cm³.'],
        explanation: 'V = ⅓ × 900 × 10 = 3.000 cm³ = 3 liter.',
      },
      {
        id: 't8',
        type: 'choice',
        konteks: '🥤 Dua gelas unik',
        cerita:
          'Kafe sekolah punya gelas berbentuk prisma dan gelas berbentuk limas. Alas dan tinggi kedua gelas sama. Gelas prisma berisi 360 mL jus bila penuh.',
        pertanyaan: 'Berapa mL jus yang muat di gelas limas?',
        cek: { cari: 'dariPrisma', volumePrisma: 360 },
        options: [
          { id: 'benar', label: '120 mL' },
          { id: 'setengah', label: '180 mL' },
          { id: 'sama', label: '360 mL' },
          { id: 'kali-tiga', label: '1.080 mL' },
        ],
        correct: 'benar',
        hints: ['Ingat Lab Tuang: limas = ⅓ prisma yang alas dan tingginya sama.'],
        explanation: 'Volume gelas limas = ⅓ × 360 = 120 mL.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Discovery Learning · Refleksi',
    goal: 'Merefleksikan proses menemukan rumus volume limas.',
    guru: 'Baca beberapa refleksi murid (dengan izin) untuk menutup pelajaran. Tanyakan: “Apa bedanya rumus volume limas dengan volume prisma, dan mengapa?”',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Jelaskan dengan kata-katamu sendiri mengapa rumus volume limas memakai ⅓.',
        placeholder: 'Karena di Lab Tuang …',
      },
      {
        id: 'q2',
        teks: 'Apa perbedaan tinggi limas dan tinggi sisi tegak? Mana yang dipakai untuk volume?',
        placeholder: 'Tinggi limas adalah …',
      },
      {
        id: 'q3',
        teks: 'Di mana lagi kamu bisa memakai volume limas dalam kehidupan sehari-hari?',
        placeholder: 'Misalnya saat …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menentukan volume limas sekarang?',
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
    judul: 'Hebat, kamu menemukan rumusnya sendiri!',
    teks: 'Sekarang Bu Sari bisa menghitung cokelat cair untuk cetakan limas apa pun, cukup dari luas alas dan tinggi cetakannya.',
    capaian: [
      'Menuang isi limas ke prisma pasangannya dan menemukan bahwa prisma penuh setelah 3 kali tuang.',
      'Membelah kubus menjadi 6 limas kongruen dan menghubungkan volumenya dengan luas alas × tinggi.',
      'Menemukan dan membuktikan rumus V = ⅓ × luas alas × tinggi limas.',
      'Membedakan tinggi limas dengan tinggi sisi tegak dan mencari tinggi limas dengan Pythagoras.',
      'Menggunakan rumus volume limas untuk cokelat, tenda, monumen, dan wadah madu.',
    ],
  },
};
