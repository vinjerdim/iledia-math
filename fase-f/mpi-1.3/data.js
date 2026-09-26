'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Deret Aritmetika & Rumus Jumlah n Suku Pertama
   Fase F — SMK Rekayasa Perangkat Lunak (Kelas XI)
   Topik 1 · Barisan dan Deret Aritmetika

   Tujuan Pembelajaran:
   Menjelaskan konsep deret aritmetika dan menentukan rumus jumlah
   n suku pertama deret aritmetika.

   Prasyarat: fase-f/mpi-1.1 (barisan aritmetika & beda) dan
   fase-f/mpi-1.2 (rumus suku ke-n Uₙ = a + (n − 1)b).

   Model pembelajaran: PROBLEM BASED LEARNING (PBL).
   Masalah pemantik: "Lencana Coder Konsisten".
   Kak Rani, product owner aplikasi belajar NgodingYuk, memberi XP
   login harian: hari ke-1 = 15 XP, lalu setiap hari bertambah 5 XP.
   Pengguna yang login 30 hari berturut-turut mendapat lencana "Coder
   Konsisten". Kak Rani bertanya: "Berapa total XP setelah 30 hari?
   Itu akan jadi syarat lencana. Dan pada hari ke berapa total XP
   pengguna pertama kali mencapai 1.000 XP (level Perunggu)?"
   Tiga anggota tim menjawab berbeda (konflik kognitif):
     • Dimas — 30 × U₃₀ = 30 × 160 = 4.800 XP (semua hari dianggap 160)
     • Raka  — 30 × (U₁ + U₃₀) = 30 × 175 = 5.250 XP (lupa membagi 2)
     • Sari  — menjumlah 30 baris spreadsheet satu per satu: 2.625 XP
               (benar, tetapi "bagaimana kalau lencana 365 hari?")
   Penyelidikan membawa murid dari konsep deret (jumlah berjalan Sₙ)
   ke "trik Gauss" (deret ditulis maju & mundur → 2Sₙ = n(a + Uₙ))
   hingga rumus umum Sₙ = n/2 (2a + (n − 1)b). Kunci: S₃₀ = 2.625 XP,
   total ≥ 1.000 XP pertama kali pada hari ke-18 (S₁₇ = 935,
   S₁₈ = 1.035), dan S₃₆₅ = 337.625 XP.

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ....... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar . 'organisasi'
     Sintaks 3 — Membimbing penyelidikan ............ 'selidikKonsep',
                                                      'selidikPasangan',
                                                      'selidikRumus'
     Sintaks 4 — Mengembangkan & menyajikan karya ... 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi ........ 'evaluasi'
     Penerapan & penutup ............................ 'terapkan', 'refleksi',
                                                      'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — kelompok menulis dugaan & hipotesis,
       memilah informasi, menyusun rencana, lalu menguji dugaan dan tiga
       usulan teman dengan bukti (tabel uji rumus) dan merefleksikannya.
     • Bermakna (meaningful) — konteks gamifikasi aplikasi yang akrab
       bagi murid RPL; rumus dipakai untuk keputusan produk (syarat
       lencana, level) dan diterjemahkan menjadi fungsi JavaScript.
     • Menggembirakan (joyful) — tangga XP yang dibalik & ditumpuk
       menjadi persegi panjang, tabel pasangan Gauss yang diketuk, lab
       slider "kejar 1.000 XP", dan Laporan Lencana untuk klien.

   Rangkaian aktivitas (± 2 × 45 menit; kelompok 3–4 murid):
     1. Orientasi     (8')  — pesan klien, tabel XP 7 hari, tiga usulan,
                              dugaan awal (tidak dinilai), rumusan
                              masalah, hipotesis.
     2. Organisasi    (5')  — memilih peran, memilah informasi
                              (diketahui/ditanya/tidak diperlukan),
                              mengurutkan rencana penyelidikan.
     3. Selidik A     (12') — konsep deret: melengkapi jumlah berjalan
                              S₁…S₆, pertanyaan penuntun Sₙ = Sₙ₋₁ + Uₙ
                              dan Uₙ = Sₙ − Sₙ₋₁, memilah barisan / deret
                              aritmetika / bukan keduanya.
     4. Selidik B     (15') — trik Gauss: tangga XP dibalik & ditumpuk
                              membentuk persegi panjang, tabel pasangan
                              maju–mundur, menghitung 2S₆ dan S₆, menguji
                              pada banyak suku ganjil.
     5. Selidik C     (15') — merumuskan Sₙ = n/2 (a + Uₙ) lalu
                              Sₙ = n/2 (2a + (n − 1)b); menguji rumus,
                              cara Dimas, dan cara Raka pada n = 1…8;
                              memilih fungsi JavaScript jumlahDeret().
     6. Karya         (12') — U₃₀ & S₃₀ dengan diagnosa miskonsepsi, lab
                              "kejar 1.000 XP", hari minimal, lencana 365
                              hari, pesan klien → Laporan Lencana.
     7. Evaluasi      (10') — menilai pendapat teman, dugaan vs hasil,
                              menyusun simpulan dari bank kalimat acak.
     8. Uji terap     (10') — 8 soal acak dari bank 14 soal.
     9. Refleksi      (3')  — rekap capaian, refleksi tertulis, keyakinan.

   Catatan pengacakan: SEMUA daftar pilihan di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di urutan pertama). app.js
   mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / ensureTapOrderState / shuffleArray dari
   shared/engine.js) dan menyimpannya di State, sehingga tiap murid dan
   tiap Reset mendapat urutan berbeda. Soal uji terap bertanda `gen`
   dibangkitkan opsinya oleh opsiJumlahDeret() (kunci + pengecoh dari
   miskonsepsi) lalu ikut diacak.

   Metadata `cek` / `gen` pada data & soal dipakai
   tests/mpi-f-1.3-data.test.js untuk memeriksa kunci jawaban dengan
   fungsi engine seksi 21 & 42 (bukan disalin manual).
   ============================================================ */

var PBL = 'Problem Based Learning';

var DATA = {
  meta: {
    judul: 'Deret Aritmetika & Rumus Jumlah n Suku Pertama',
  },

  tahap: [
    { id: 'orientasi', label: 'Masalah' },
    { id: 'organisasi', label: 'Organisasi' },
    { id: 'selidikKonsep', label: 'Deret' },
    { id: 'selidikPasangan', label: 'Pasangan' },
    { id: 'selidikRumus', label: 'Rumus' },
    { id: 'karya', label: 'Karya' },
    { id: 'evaluasi', label: 'Evaluasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Data masalah pemantik — dipakai di beberapa tahap. */
  masalah: {
    a: 15,
    b: 5,
    hari: 30,
    target: 1000,
    hariSetahun: 365,
    satuan: 'XP',
    aplikasi: 'NgodingYuk',
    klien: 'Kak Rani',
    hariTabel: 7,
    /* Kunci (diverifikasi tes terhadap engine). */
    u30: 160,
    s30: 2625,
    nTarget: 18,
    s365: 337625,
  },

  /* Usulan anggota tim (urutan wajar; tidak ditampilkan sebagai pilihan). */
  usulan: [
    {
      id: 'dimas',
      label: 'Cara Dimas',
      rumus: '30 × U₃₀ = 30 × 160',
      pola: 'n-kali-un',
      cara: 'XP hari terakhir dikalikan banyak hari',
    },
    {
      id: 'raka',
      label: 'Cara Raka',
      rumus: '30 × (U₁ + U₃₀) = 30 × 175',
      pola: 'lupa-bagi-dua',
      cara: 'XP hari pertama + hari terakhir, dikali banyak hari',
    },
    {
      id: 'sari',
      label: 'Cara Sari',
      rumus: '15 + 20 + 25 + … + 160',
      pola: null,
      cara: 'dijumlah satu per satu di 30 baris spreadsheet',
    },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI PADA MASALAH (PBL sintaks 1)
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Evaluasi.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi pada Masalah',
    syntax: PBL + ' · Sintaks 1',
    goal: 'Memahami masalah total XP harian yang terus bertambah, lalu menyampaikan dugaan awal tentang cara menghitung totalnya.',
    guru: 'Bacakan pesan klien, lalu tanyakan: "Tiga jawaban, tiga angka berbeda — siapa yang benar, dan adakah cara yang cepat sekaligus tepat?" Biarkan kelompok berdebat dan catat argumen di papan (mis. "Dimas benar karena 30 hari × XP"). Jangan memberi jawaban; argumen ini diuji pada tahap Rumus.',
    judul: 'Lencana "Coder Konsisten" di NgodingYuk',
    pesanKlien:
      'Halo tim RPL! Di aplikasi NgodingYuk, pengguna yang login mendapat XP: hari ke-1 dapat 15 XP, lalu setiap hari bertambah 5 XP. Kami ingin memberi lencana "Coder Konsisten" untuk yang login 30 hari berturut-turut. Berapa total XP-nya setelah 30 hari? Itu akan jadi syarat lencana. Satu lagi: pada hari ke berapa total XP pengguna pertama kali mencapai 1.000 XP (level Perunggu)? — Kak Rani, Product Owner',
    pengantar:
      'Dimas, Raka, dan Sari mencoba menghitung total XP 30 hari. Jawaban mereka berbeda-beda.',
    dugaan: [
      {
        id: 'd1',
        tanya: 'Menurutmu, cara siapa yang menghasilkan total XP 30 hari yang benar?',
        opsi: [
          { id: 'sari', label: 'Cara Sari — dijumlah satu per satu' },
          { id: 'dimas', label: 'Cara Dimas — 30 × 160 = 4.800 XP' },
          { id: 'raka', label: 'Cara Raka — 30 × (15 + 160) = 5.250 XP' },
          { id: 'tidak', label: 'Tidak ada yang benar' },
        ],
        baku: 'sari',
        pembahasan:
          'Hanya cara Sari yang tepat (2.625 XP). Dimas menganggap setiap hari 160 XP, Raka menghitung dua kali lipat karena lupa membagi 2.',
      },
      {
        id: 'd2',
        tanya: 'Adakah cara cepat menghitung total XP tanpa menjumlah satu per satu?',
        opsi: [
          { id: 'ada', label: 'Ada — pasti ada pola yang bisa dijadikan rumus' },
          { id: 'tidak', label: 'Tidak ada — harus dijumlah satu per satu' },
          { id: 'akhir', label: 'Cukup kalikan banyak hari dengan XP hari terakhir' },
          { id: 'awal', label: 'Cukup kalikan banyak hari dengan XP hari pertama' },
        ],
        baku: 'ada',
        pembahasan:
          'Pasangkan suku depan dengan suku belakang: Sₙ = n/2 (a + Uₙ) = 30/2 × (15 + 160) = 2.625 XP — tanpa menjumlah 30 baris.',
      },
    ],
    alasanLabel: 'Tuliskan alasan dugaan kelompokmu',
    alasanPlaceholder: 'Contoh: cara Dimas kurang tepat karena …',
    pertanyaan: 'Masalah apa yang sebenarnya harus diselesaikan tim?',
    masalahOpsi: [
      {
        id: 'inti',
        label:
          'Bagaimana rumus total XP sampai hari ke-n, agar total 30 hari dan hari saat total mencapai 1.000 XP dapat dihitung cepat dan tepat?',
      },
      { id: 'harian', label: 'Berapa XP yang didapat tepat pada hari ke-30 saja?' },
      { id: 'beda', label: 'Berapa kenaikan XP dari satu hari ke hari berikutnya?' },
      { id: 'desain', label: 'Seperti apa gambar lencana "Coder Konsisten" yang menarik?' },
    ],
    masalahCorrect: 'inti',
    masalahUmpan: {
      inti: 'Tepat! Yang dicari adalah <strong>total</strong> XP (jumlah semua suku), dan caranya harus bisa dipakai untuk n berapa pun.',
      harian:
        'XP hari ke-30 (U₃₀) hanya satu suku. Klien menanyakan TOTAL XP dari hari ke-1 sampai hari ke-30.',
      beda: 'Kenaikan 5 XP per hari sudah diketahui dari pesan klien. Itu bahan, bukan pertanyaannya.',
      desain:
        'Desain gambar penting untuk tim desain, tetapi tidak menjawab pertanyaan klien tentang total XP.',
    },
    hipotesisLabel: 'Hipotesis kelompok',
    hipotesisPlaceholder:
      'Contoh: Kami menduga total XP 30 hari sekitar … karena …, dan cara cepatnya adalah …',
    nextLabel: 'Lanjut: Atur Kelompok →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENGORGANISASI BELAJAR (PBL sintaks 2)
     ---------------------------------------------------------- */
  organisasi: {
    kicker: 'Tahap 2 · Mengorganisasi Belajar',
    syntax: PBL + ' · Sintaks 2',
    goal: 'Membagi peran, memilah informasi yang diperlukan, dan menyusun rencana penyelidikan.',
    guru: 'Pastikan setiap anggota memegang satu peran; Operator memegang perangkat, anggota lain memberi instruksi. Saat pemilahan, tanyakan mengapa "banyak pengguna NgodingYuk" tidak diperlukan. Rencana yang benar menjadi peta tiga penyelidikan berikutnya.',
    peranLabel: 'Pilih peranmu di kelompok',
    peran: [
      { id: 'analis', label: '📊 Analis Pola — membaca tabel, tangga XP, dan pola' },
      { id: 'operator', label: '💻 Operator — memegang perangkat dan menjalankan lab' },
      { id: 'pencatat', label: '📝 Pencatat — mencatat hitungan dan keputusan kelompok' },
      { id: 'presenter', label: '🎤 Presenter — menyajikan Laporan Lencana ke klien' },
    ],
    judulPilah: 'Pilah informasinya',
    opsiPilah: [
      { id: 'diketahui', label: 'Diketahui' },
      { id: 'ditanya', label: 'Ditanya' },
      { id: 'tidakPerlu', label: 'Tidak diperlukan' },
    ],
    pilah: [
      {
        id: 'i1',
        teks: 'XP hari ke-1 adalah 15 XP',
        correct: 'diketahui',
        explanation: 'Ini suku pertama: a = U₁ = 15.',
      },
      {
        id: 'i2',
        teks: 'XP bertambah 5 setiap hari',
        correct: 'diketahui',
        explanation: 'Ini beda barisan: b = 5. XP harian membentuk barisan aritmetika.',
      },
      {
        id: 'i3',
        teks: 'Lencana diberikan setelah login 30 hari berturut-turut',
        correct: 'diketahui',
        explanation: 'Banyak suku yang dijumlahkan: n = 30.',
      },
      {
        id: 'i4',
        teks: 'Total XP yang terkumpul setelah 30 hari',
        correct: 'ditanya',
        explanation: 'Ini jumlah 30 suku pertama, S₃₀ — syarat lencana.',
      },
      {
        id: 'i5',
        teks: 'Hari ke berapa total XP pertama kali mencapai 1.000 XP',
        correct: 'ditanya',
        explanation: 'Mencari n terkecil dengan Sₙ ≥ 1.000.',
      },
      {
        id: 'i6',
        teks: 'Warna ikon lencana yang diinginkan klien',
        correct: 'tidakPerlu',
        explanation: 'Warna ikon tidak memengaruhi perhitungan XP.',
      },
      {
        id: 'i7',
        teks: 'Jumlah pengguna NgodingYuk saat ini 12.000 orang',
        correct: 'tidakPerlu',
        explanation: 'Total XP dihitung untuk SATU pengguna yang login setiap hari.',
      },
    ],
    judulRencana: 'Susun rencana penyelidikan',
    instruksiRencana: 'Ketuk langkah-langkah berikut sesuai urutan kerja yang masuk akal.',
    rencana: [
      { id: 'r1', label: '👀 Bedakan XP harian dengan total XP pada beberapa hari pertama' },
      { id: 'r2', label: '🔗 Pasangkan XP hari depan dengan hari belakang untuk mencari pola' },
      { id: 'r3', label: '🧮 Rumuskan total XP untuk n hari, lalu uji rumusnya' },
      { id: 'r4', label: '🏅 Hitung total 30 hari dan hari saat total mencapai 1.000 XP' },
      { id: 'r5', label: '📨 Sajikan Laporan Lencana untuk klien' },
    ],
    nextLabel: 'Mulai Penyelidikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENYELIDIKAN A: KONSEP DERET (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikKonsep: {
    kicker: 'Tahap 3 · Penyelidikan A — Barisan & Deret',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Membedakan barisan dan deret aritmetika, serta menyusun jumlah berjalan Sₙ = U₁ + U₂ + … + Uₙ.',
    guru: 'Minta Pencatat membacakan kolom Uₙ lalu kolom Sₙ dengan kata-kata: "XP hari ini" vs "XP terkumpul sampai hari ini". Tekankan penulisan: barisan dipisah koma, deret dihubungkan tanda +. Bila murid menjumlah ulang dari awal untuk setiap Sₙ, tanyakan: "Bisakah memakai S sebelumnya?"',
    judulTabel: 'Catatan XP 6 hari pertama',
    instruksiTabel:
      'Kolom Uₙ adalah XP yang didapat pada hari ke-n. Isi kolom Sₙ: total XP yang terkumpul dari hari ke-1 sampai hari ke-n.',
    hariTabel: 6,
    hintsTabel: [
      'S₁ = U₁ = 15. S₂ = U₁ + U₂ = 15 + 20.',
      'Tidak perlu menjumlah ulang dari awal: S₃ = S₂ + U₃.',
    ],
    tanya: [
      {
        id: 'a1',
        tanya:
          'Pada tabel, kolom U<sub>n</sub> membentuk <em>barisan</em>. Kolom S<sub>n</sub> menyatakan …',
        opsi: [
          { id: 'total', label: 'Total XP sampai hari ke-n: Sₙ = U₁ + U₂ + … + Uₙ' },
          { id: 'harian', label: 'XP yang didapat pada hari ke-n saja' },
          { id: 'beda', label: 'Kenaikan XP dari hari sebelumnya' },
          { id: 'rata', label: 'Rata-rata XP setiap hari' },
        ],
        correct: 'total',
        umpan: {
          total:
            'Tepat! Sₙ adalah jumlah n suku pertama. Penjumlahan suku-suku barisan aritmetika disebut deret aritmetika.',
          harian: 'Itu Uₙ (suku ke-n). Sₙ mengumpulkan semua XP dari hari ke-1 sampai hari ke-n.',
          beda: 'Kenaikan harian adalah beda b = 5, dan nilainya tetap. Sₙ terus membesar.',
          rata: 'Rata-rata akan lebih kecil. Sₙ adalah total, bukan rata-rata.',
        },
      },
      {
        id: 'a2',
        tanya:
          'Cara tercepat memperoleh S<sub>6</sub> bila S<sub>5</sub> = 125 sudah diketahui adalah …',
        opsi: [
          { id: 'tambah', label: 'S₆ = S₅ + U₆ = 125 + 40' },
          { id: 'beda', label: 'S₆ = S₅ + b = 125 + 5' },
          { id: 'suku', label: 'S₆ = U₅ + U₆ = 35 + 40' },
          { id: 'kali', label: 'S₆ = 6 × U₆ = 6 × 40' },
        ],
        correct: 'tambah',
        umpan: {
          tambah:
            'Benar! Jumlah sampai hari ke-6 = jumlah sampai hari ke-5 ditambah XP hari ke-6: Sₙ = Sₙ₋₁ + Uₙ.',
          beda: 'Yang ditambahkan adalah XP hari ke-6 (U₆ = 40), bukan kenaikannya (5).',
          suku: 'Itu hanya dua suku terakhir. S₆ memuat enam suku.',
          kali: '6 × 40 menganggap setiap hari mendapat 40 XP, padahal hari-hari awal lebih sedikit.',
        },
      },
      {
        id: 'a3',
        tanya:
          'Sebaliknya, jika S<sub>5</sub> = 125 dan S<sub>4</sub> = 90, maka U<sub>5</sub> = …',
        opsi: [
          { id: 'kurang', label: '35, karena U₅ = S₅ − S₄' },
          { id: 'jumlah', label: '215, karena U₅ = S₅ + S₄' },
          { id: 'bagi', label: '25, karena U₅ = S₅ ÷ 5' },
          { id: 'b', label: '5, karena bedanya 5' },
        ],
        correct: 'kurang',
        umpan: {
          kurang: 'Tepat! Selisih dua jumlah berurutan adalah suku terakhirnya: Uₙ = Sₙ − Sₙ₋₁.',
          jumlah: 'S₅ + S₄ menghitung empat suku pertama dua kali. Coba selisihnya.',
          bagi: 'S₅ ÷ 5 adalah rata-rata XP lima hari, bukan XP hari ke-5.',
          b: 'Beda adalah selisih dua SUKU berurutan. Selisih dua JUMLAH berurutan adalah suku.',
        },
      },
    ],
    judulPilah: 'Barisan atau deret?',
    instruksiPilah:
      'Pilah setiap bentuk: barisan aritmetika, deret aritmetika, atau bukan keduanya (selisih suku berurutannya tidak tetap).',
    opsiPilah: [
      { id: 'barisan', label: 'Barisan aritmetika' },
      { id: 'deret', label: 'Deret aritmetika' },
      { id: 'bukan', label: 'Bukan keduanya' },
    ],
    pilah: [
      {
        id: 's1',
        teks: '15, 20, 25, 30, 35',
        correct: 'barisan',
        suku: [15, 20, 25, 30, 35],
        explanation: 'Suku-suku dipisah koma dengan beda tetap 5: barisan aritmetika.',
      },
      {
        id: 's2',
        teks: '15 + 20 + 25 + 30 + 35',
        correct: 'deret',
        suku: [15, 20, 25, 30, 35],
        explanation:
          'Suku-suku barisan aritmetika dijumlahkan: deret aritmetika (nilainya S₅ = 125).',
      },
      {
        id: 's3',
        teks: '100 + 90 + 80 + 70',
        correct: 'deret',
        suku: [100, 90, 80, 70],
        explanation: 'Deret aritmetika turun dengan beda −10.',
      },
      {
        id: 's4',
        teks: '−4, −1, 2, 5, 8',
        correct: 'barisan',
        suku: [-4, -1, 2, 5, 8],
        explanation: 'Beda tetap 3; ditulis dengan koma, jadi barisan.',
      },
      {
        id: 's5',
        teks: '2 + 4 + 8 + 16',
        correct: 'bukan',
        suku: [2, 4, 8, 16],
        explanation:
          'Selisihnya 2, 4, 8 — tidak tetap. Ini deret geometri, bukan deret aritmetika.',
      },
      {
        id: 's6',
        teks: '1, 4, 9, 16, 25',
        correct: 'bukan',
        suku: [1, 4, 9, 16, 25],
        explanation: 'Selisihnya 3, 5, 7, 9 — tidak tetap, jadi bukan barisan aritmetika.',
      },
      {
        id: 's7',
        teks: '1 + 2 + 3 + … + 100',
        correct: 'deret',
        suku: [1, 2, 3, 4, 5],
        explanation: 'Jumlah bilangan asli 1 sampai 100: deret aritmetika dengan beda 1.',
      },
    ],
    temuan: [
      'Barisan aritmetika adalah daftar suku yang bedanya tetap, ditulis dipisah koma: U₁, U₂, U₃, …',
      'Deret aritmetika adalah jumlah suku-suku barisan aritmetika: Sₙ = U₁ + U₂ + … + Uₙ.',
      'Jumlah berjalan: Sₙ = Sₙ₋₁ + Uₙ, dan sebaliknya Uₙ = Sₙ − Sₙ₋₁.',
      'Menjumlah satu per satu itu benar, tetapi lambat untuk n besar — kita butuh cara cepat.',
    ],
    nextLabel: 'Lanjut: Cari Pola Pasangan →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENYELIDIKAN B: TRIK GAUSS (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikPasangan: {
    kicker: 'Tahap 4 · Penyelidikan B — Pasangan Suku (Trik Gauss)',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menemukan bahwa deret yang ditulis maju dan mundur membentuk pasangan bernilai sama, sehingga 2Sₙ = n(a + Uₙ).',
    guru: 'Ceritakan singkat kisah Carl Friedrich Gauss kecil yang menjumlahkan 1 + 2 + … + 100 dalam hitungan detik. Operator menekan tombol "Balik & tumpuk"; minta kelompok menjelaskan mengapa semua kolom jadi sama tinggi. Tekankan: persegi panjang itu berisi DUA deret, jadi luasnya 2Sₙ.',
    hari: 6,
    judulTangga: 'Tangga XP 6 hari',
    instruksiTangga:
      'Setiap batang menunjukkan XP satu hari. Tinggi semua batang jika disusun adalah S₆. Tekan tombol untuk membuat salinan tangga, membaliknya, lalu menumpuknya di atas tangga asli.',
    tombolBalik: '🔄 Balik & tumpuk salinannya',
    tombolUlang: '↩️ Tampilkan tangga asli saja',
    judulPasangan: 'Tabel pasangan: tulis maju, tulis mundur',
    instruksiPasangan:
      'Baris pertama S₆ ditulis maju, baris kedua S₆ ditulis mundur. Ketuk setiap "?" untuk menjumlahkan pasangan satu kolom.',
    langkah: [
      {
        id: 'p1',
        label: 'Semua pasangan bernilai 55. Ada 6 pasangan, jadi 2S₆ = 6 × 55 = …',
        ukuran: 'duaS',
        hints: ['Kalikan banyak pasangan dengan nilai tiap pasangan.', '6 × 55 = 6 × 50 + 6 × 5.'],
        temuan: '2S₆ = 330 — ini jumlah DUA deret (maju dan mundur).',
      },
      {
        id: 'p2',
        label: 'Karena 330 adalah jumlah dua deret yang sama, S₆ = 330 ÷ 2 = …',
        ukuran: 'S',
        hints: ['Bagi 2Sₙ dengan 2.', '330 ÷ 2.'],
        temuan: 'S₆ = 165 — sama dengan hasil tabel jumlah berjalan di tahap sebelumnya!',
      },
    ],
    tanya: [
      {
        id: 'b1',
        tanya: 'Mengapa setiap pasangan (kolom) bernilai sama, yaitu 55?',
        opsi: [
          {
            id: 'imbang',
            label:
              'Ke kanan suku atas naik 5, sedangkan suku bawah turun 5, sehingga jumlahnya tetap',
          },
          { id: 'kebetulan', label: 'Kebetulan saja untuk deret XP ini' },
          { id: 'genap', label: 'Karena banyak sukunya genap' },
          { id: 'sama', label: 'Karena semua suku deret sama besar' },
        ],
        correct: 'imbang',
        umpan: {
          imbang:
            'Tepat! Beda yang ditambahkan di atas diimbangi beda yang dikurangkan di bawah. Jumlahnya selalu a + Uₙ.',
          kebetulan:
            'Coba deret aritmetika lain: 2 + 5 + 8 + 11 + 14 ditulis mundur juga berpasangan 16. Ini selalu terjadi.',
          genap: 'Banyak suku ganjil pun tetap berlaku — lihat pertanyaan berikutnya.',
          sama: 'Suku-sukunya berbeda (15, 20, …, 40), tetapi JUMLAH pasangannya sama.',
        },
      },
      {
        id: 'b2',
        tanya:
          'Pada deret n suku yang ditulis maju dan mundur, ada berapa pasangan dan berapa nilai tiap pasangan?',
        opsi: [
          { id: 'n', label: 'n pasangan, masing-masing a + Uₙ' },
          { id: 'nb', label: 'n − 1 pasangan, masing-masing b' },
          { id: 'dua', label: '2 pasangan, masing-masing Sₙ' },
          { id: 'beda', label: 'n pasangan dengan nilai yang berbeda-beda' },
        ],
        correct: 'n',
        umpan: {
          n: 'Benar! Setiap kolom berisi satu pasangan bernilai a + Uₙ, jadi 2Sₙ = n(a + Uₙ).',
          nb: 'Beda b adalah selisih suku berurutan, bukan jumlah pasangan kolom.',
          dua: 'Ada dua BARIS (deret maju dan mundur), tetapi pasangan dihitung per kolom.',
          beda: 'Lihat hasil ketukanmu: semua kolom bernilai sama.',
        },
      },
      {
        id: 'b3',
        tanya: 'Apakah cara ini berlaku untuk banyak suku ganjil, misalnya 2 + 5 + 8 + 11 + 14?',
        opsi: [
          {
            id: 'tetap',
            label: 'Tetap berlaku: 5 pasangan bernilai 16, jadi S₅ = 5 × 16 ÷ 2 = 40',
          },
          { id: 'tidak', label: 'Tidak berlaku karena suku tengah tidak punya pasangan' },
          { id: 'buang', label: 'Suku tengah harus dibuang lebih dulu' },
          { id: 'tambah', label: 'Harus ditambah satu suku agar banyaknya genap' },
        ],
        correct: 'tetap',
        umpan: {
          tetap:
            'Tepat! Saat ditulis mundur, suku tengah (8) berpasangan dengan dirinya sendiri: 8 + 8 = 16. Periksa: 2 + 5 + 8 + 11 + 14 = 40.',
          tidak:
            'Dengan menulis deret dua kali, setiap kolom punya pasangan — termasuk suku tengah (8 + 8).',
          buang: 'Membuang suku mengubah jumlahnya. Tulis saja deret maju dan mundur.',
          tambah: 'Menambah suku mengubah soalnya. Cara maju–mundur bekerja untuk n berapa pun.',
        },
      },
    ],
    contohGanjil: [2, 5, 8, 11, 14],
    temuan: [
      'Tulis Sₙ maju dan mundur, lalu jumlahkan per kolom: setiap kolom bernilai a + Uₙ.',
      'Ada n kolom, jadi 2Sₙ = n(a + Uₙ).',
      'Karena 2Sₙ memuat dua deret, Sₙ = n(a + Uₙ) ÷ 2. Cara ini berlaku untuk n genap maupun ganjil.',
    ],
    nextLabel: 'Lanjut: Rumuskan →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENYELIDIKAN C: MERUMUSKAN & MENGUJI (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikRumus: {
    kicker: 'Tahap 5 · Penyelidikan C — Merumuskan & Menguji',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menentukan rumus jumlah n suku pertama Sₙ = n/2 (a + Uₙ) = n/2 (2a + (n − 1)b), lalu mengujinya bersama cara Dimas dan Raka.',
    guru: 'Minta kelompok menuliskan sendiri langkah substitusi di buku sebelum memilih jawaban. Saat menguji, minta murid memperhatikan baris n = 1: cara Dimas cocok di n = 1 tetapi gagal di n lain — satu contoh cocok belum membuktikan rumus benar. Siswa RPL dapat mengetik fungsi jumlahDeret() di konsol peramban.',
    judulRakit: 'A. Rakit rumusnya',
    instruksiRakit: 'Dari temuan 2Sₙ = n(a + Uₙ), susun rumus Sₙ langkah demi langkah.',
    tanyaRakit: [
      {
        id: 'c1',
        tanya: 'Dari 2S<sub>n</sub> = n(a + U<sub>n</sub>), rumus S<sub>n</sub> adalah …',
        opsi: [
          { id: 'ujung', label: 'Sₙ = n/2 (a + Uₙ)' },
          { id: 'lupa', label: 'Sₙ = n (a + Uₙ)' },
          { id: 'akhir', label: 'Sₙ = n × Uₙ' },
          { id: 'rata', label: 'Sₙ = (a + Uₙ) ÷ n' },
        ],
        correct: 'ujung',
        umpan: {
          ujung:
            'Tepat! Kedua ruas dibagi 2. Rumus ini dipakai bila suku pertama dan suku terakhir diketahui.',
          lupa: 'Itu masih 2Sₙ. Bagi kedua ruas dengan 2.',
          akhir: 'n × Uₙ menganggap semua suku sebesar suku terakhir (cara Dimas).',
          rata: 'Pembagiannya dengan 2, bukan dengan n.',
        },
      },
      {
        id: 'c2',
        tanya:
          'Jika U<sub>n</sub> belum diketahui, substitusikan U<sub>n</sub> = a + (n − 1)b ke rumus tersebut. Hasilnya …',
        opsi: [
          { id: 'umum', label: 'Sₙ = n/2 (2a + (n − 1)b)' },
          { id: 'nb', label: 'Sₙ = n/2 (2a + nb)' },
          { id: 'satuA', label: 'Sₙ = n/2 (a + (n − 1)b)' },
          { id: 'tanpaBagi', label: 'Sₙ = n (2a + (n − 1)b)' },
        ],
        correct: 'umum',
        umpan: {
          umum: 'Benar! a + Uₙ = a + a + (n − 1)b = 2a + (n − 1)b.',
          nb: 'Suku ke-n adalah a + (n − 1)b, bukan a + nb. Periksa lagi yang dikalikan dengan b.',
          satuA: 'Ada dua a: satu dari suku pertama, satu dari dalam Uₙ. Jadi 2a.',
          tanpaBagi: 'Faktor ½ dari rumus sebelumnya hilang. Hasilnya menjadi 2Sₙ.',
        },
      },
    ],
    judulUji: 'B. Uji rumus pada deret XP',
    instruksiUji:
      'Ketuk setiap cara untuk mengujinya pada n = 1 sampai 8. Kolom kiri adalah total XP yang dijumlah satu per satu.',
    ujiN: 8,
    uji: [
      { id: 'rumus', label: 'Rumus Sₙ = n/2 (2a + (n − 1)b)', pola: null },
      { id: 'dimas', label: 'Cara Dimas: n × Uₙ', pola: 'n-kali-un' },
      { id: 'raka', label: 'Cara Raka: n × (a + Uₙ)', pola: 'lupa-bagi-dua' },
    ],
    tanyaUji: {
      id: 'c3',
      tanya: 'Kesimpulan dari hasil uji ketiga cara adalah …',
      opsi: [
        { id: 'rumus', label: 'Hanya rumus Sₙ = n/2 (2a + (n − 1)b) cocok untuk semua n' },
        { id: 'dimas', label: 'Cara Dimas benar karena cocok pada n = 1' },
        { id: 'semua', label: 'Ketiga cara sama-sama benar' },
        { id: 'raka', label: 'Cara Raka benar karena hasilnya selalu genap' },
      ],
      correct: 'rumus',
      umpan: {
        rumus:
          'Tepat! Rumus cocok pada setiap baris. Cara Dimas hanya kebetulan cocok di n = 1, dan cara Raka selalu dua kali lipat.',
        dimas: 'Satu baris yang cocok belum membuktikan rumus benar. Lihat baris n = 2 sampai 8.',
        semua: 'Perhatikan tanda ✗ pada tabel cara Dimas dan Raka.',
        raka: 'Genap atau tidak bukan ukuran kebenaran. Hasil Raka selalu 2 kali total sebenarnya.',
      },
    },
    judulKode: 'C. Jadikan fungsi JavaScript',
    instruksiKode:
      'Tim ingin fitur "Total XP-mu" di aplikasi menghitung Sₙ langsung dari a, b, dan n tanpa perulangan.',
    tanyaKode: {
      id: 'c4',
      tanya: 'Isi badan fungsi <code>jumlahDeret(a, b, n)</code> yang tepat adalah …',
      opsi: [
        { id: 'benar', label: 'return n / 2 * (2 * a + (n - 1) * b);' },
        { id: 'nb', label: 'return n / 2 * (2 * a + n * b);' },
        { id: 'tanpaBagi', label: 'return n * (2 * a + (n - 1) * b);' },
        { id: 'suku', label: 'return a + (n - 1) * b;' },
      ],
      correct: 'benar',
      umpan: {
        benar:
          'Tepat! Fungsi ini langsung memberi Sₙ untuk n berapa pun — lebih cepat daripada perulangan 365 kali.',
        nb: 'Periksa bagian b: seharusnya (n - 1) * b.',
        tanpaBagi: 'Faktor n / 2 menjadi n — hasilnya dua kali lipat (kesalahan Raka).',
        suku: 'Itu rumus suku ke-n (Uₙ), bukan jumlahnya.',
      },
    },
    kodeUji: [
      { n: 7, catatan: 'total seminggu' },
      { n: 30, catatan: 'syarat lencana' },
      { n: 365, catatan: 'setahun — kekhawatiran Sari terjawab' },
    ],
    temuan: [
      'Rumus jumlah n suku pertama bila suku terakhir diketahui: Sₙ = n/2 (a + Uₙ).',
      'Rumus umum dari a dan b: Sₙ = n/2 (2a + (n − 1)b).',
      'Rumus diuji pada banyak nilai n; cocok pada satu nilai saja belum cukup.',
    ],
    nextLabel: 'Lanjut: Kerjakan Pesanan Klien →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGEMBANGKAN & MENYAJIKAN KARYA (PBL sintaks 4)
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 6 · Mengembangkan & Menyajikan Karya',
    syntax: PBL + ' · Sintaks 4',
    goal: 'Menjawab kedua pertanyaan klien dengan rumus Sₙ, lalu menyajikannya dalam Laporan Lencana.',
    guru: 'Kelompok bekerja mandiri; datangi kelompok yang mendapat diagnosa miskonsepsi dan minta mereka menjelaskan kembali tabel pasangan. Pada lab 1.000 XP, tanyakan mengapa jawabannya hari ke-18, bukan 17. Beri tiap kelompok 2 menit presentasi laporan.',
    judulHitung: 'A. Syarat lencana: total XP 30 hari',
    langkahSuku: {
      label: 'XP hari ke-30: U₃₀ = 15 + (30 − 1) × 5 = …',
      hints: [
        'Uₙ = a + (n − 1)b dengan a = 15, b = 5, n = 30.',
        '29 × 5 = 145, lalu tambahkan 15.',
      ],
      temuan: 'U₃₀ = 160 XP — suku terakhir deret.',
    },
    labelJumlah: 'Total XP 30 hari: S₃₀ = 30/2 × (15 + 160) = …',
    hintsJumlah: ['Sₙ = n/2 (a + Uₙ): 30/2 = 15.', '15 × 175.'],
    judulLab: 'B. Kejar 1.000 XP',
    instruksiLab:
      'Geser n untuk melihat total XP Sₙ. Temukan hari PERTAMA saat total XP mencapai atau melewati 1.000 XP.',
    labMaks: 30,
    langkahTarget: {
      label: 'Total XP pertama kali mencapai 1.000 XP pada hari ke- …',
      hints: [
        'Cari n terkecil dengan Sₙ ≥ 1.000. Bandingkan S₁₇ dan S₁₈ di lab.',
        'S₁₇ = 935 masih kurang dari 1.000; S₁₈ = 1.035 sudah melewatinya.',
      ],
      temuan: 'Hari ke-18: S₁₇ = 935 XP (belum), S₁₈ = 1.035 XP (tercapai).',
    },
    tanyaSetahun: {
      id: 'k1',
      tanya:
        'Kak Rani juga ingin lencana "Coder Setahun" untuk 365 hari login berturut-turut. Cara paling efisien menghitung syarat XP-nya adalah …',
      opsi: [
        { id: 'rumus', label: 'Memakai Sₙ = n/2 (2a + (n − 1)b) atau jumlahDeret(15, 5, 365)' },
        { id: 'sari', label: 'Menjumlah 365 baris spreadsheet satu per satu' },
        { id: 'dimas', label: 'Menghitung 365 × U₃₆₅' },
        { id: 'kira', label: 'Mengira-ngira dari grafik tangga XP' },
      ],
      correct: 'rumus',
      umpan: {
        rumus: 'Tepat! S₃₆₅ = 365/2 × (30 + 364 × 5) = 337.625 XP — dihitung dalam satu langkah.',
        sari: 'Hasilnya benar, tetapi lambat dan rawan salah ketik. Rumus memberi hasil yang sama dalam satu langkah.',
        dimas: 'Itu cara Dimas yang terbukti keliru: hasilnya terlalu besar.',
        kira: 'Grafik membantu memahami, tetapi syarat lencana perlu angka yang tepat.',
      },
    },
    pesanLabel: 'Tulis pesan singkat kelompokmu untuk Kak Rani',
    pesanPlaceholder: 'Contoh: Syarat lencana Coder Konsisten sebaiknya 2.625 XP karena …',
    posterJudul: 'Laporan Lencana — NgodingYuk',
    posterFooter: 'Tim RPL · Dihitung dengan rumus jumlah n suku pertama deret aritmetika',
    nextLabel: 'Lanjut: Evaluasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — ANALISIS & EVALUASI (PBL sintaks 5)
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 7 · Analisis & Evaluasi',
    syntax: PBL + ' · Sintaks 5',
    goal: 'Menilai pendapat teman, membandingkan dugaan awal dengan hasil penyelidikan, dan menyusun simpulan.',
    guru: 'Gunakan pendapat yang keliru sebagai bahan diskusi: minta murid membuktikannya dengan tabel pasangan atau tabel uji rumus. Sebelum menyusun simpulan, tanyakan: "Apa beda Uₙ dan Sₙ?"',
    judulA: 'A. Tepat atau keliru?',
    opsiPendapat: [
      { id: 'tepat', label: 'Tepat' },
      { id: 'keliru', label: 'Keliru' },
    ],
    pendapat: [
      {
        id: 'e1',
        teks: 'Dimas: "Total XP 30 hari = 30 × 160 = 4.800 XP."',
        correct: 'keliru',
        explanation:
          'Tidak setiap hari mendapat 160 XP; hari-hari awal lebih sedikit. Totalnya 2.625 XP.',
      },
      {
        id: 'e2',
        teks: 'Raka: "Total XP 30 hari = 30 × (15 + 160) = 5.250 XP."',
        correct: 'keliru',
        explanation: '30 × (15 + 160) adalah 2S₃₀ (deret maju + mundur). Harus dibagi 2.',
      },
      {
        id: 'e3',
        teks: 'Sari: "Menjumlah satu per satu memang benar, tetapi rumus Sₙ jauh lebih cepat untuk n besar."',
        correct: 'tepat',
        explanation:
          'Keduanya memberi 2.625 XP, tetapi rumus langsung berlaku untuk n = 365 sekalipun.',
      },
      {
        id: 'e4',
        teks: 'Nadia: "Uₙ adalah XP pada hari ke-n, sedangkan Sₙ adalah total XP sampai hari ke-n."',
        correct: 'tepat',
        explanation: 'Uₙ satu suku; Sₙ jumlah n suku pertama.',
      },
      {
        id: 'e5',
        teks: 'Bagas: "Rumus Sₙ = n/2 (a + Uₙ) hanya berlaku bila banyak sukunya genap."',
        correct: 'keliru',
        explanation:
          'Dengan deret maju–mundur, suku tengah berpasangan dengan dirinya sendiri. Berlaku untuk semua n.',
      },
      {
        id: 'e6',
        teks: 'Putri: "Jika S₁₀ dan S₉ diketahui, maka U₁₀ = S₁₀ − S₉."',
        correct: 'tepat',
        explanation: 'S₁₀ = S₉ + U₁₀, jadi U₁₀ = S₁₀ − S₉.',
      },
      {
        id: 'e7',
        teks: 'Yoga: "Sₙ = n/2 (2a + nb) juga benar karena bedanya hanya sedikit."',
        correct: 'keliru',
        explanation:
          'Suku terakhir adalah a + (n − 1)b. Memakai nb menambah n/2 × b yang tidak ada (S₃₀ menjadi 2.700).',
      },
      {
        id: 'e8',
        teks: 'Lina: "3 + 7 + 11 + 15 adalah deret aritmetika karena selisih suku berurutannya tetap."',
        correct: 'tepat',
        explanation: 'Beda tetap 4 dan suku-sukunya dijumlahkan.',
      },
    ],
    judulB: 'B. Dugaan awal vs hasil penyelidikan',
    judulC: 'C. Susun simpulan kelompok',
    instruksiC:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai sekali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'Deret aritmetika adalah', correct: 'b1' },
      {
        id: 'k2',
        awal: 'Jika deret ditulis maju dan mundur lalu dijumlahkan per kolom,',
        correct: 'b2',
      },
      { id: 'k3', awal: 'Rumus jumlah n suku pertama deret aritmetika adalah', correct: 'b3' },
      { id: 'k4', awal: 'Suku ke-n dapat diperoleh dari jumlah suku dengan', correct: 'b4' },
    ],
    bank: [
      { id: 'b1', teks: 'jumlah suku-suku barisan aritmetika, U₁ + U₂ + … + Uₙ.' },
      { id: 'b2', teks: 'setiap kolom bernilai a + Uₙ sehingga 2Sₙ = n(a + Uₙ).' },
      { id: 'b3', teks: 'Sₙ = n/2 (a + Uₙ) = n/2 (2a + (n − 1)b).' },
      { id: 'b4', teks: 'Uₙ = Sₙ − Sₙ₋₁.' },
      { id: 'x1', teks: 'daftar suku yang dipisahkan tanda koma dengan beda tetap.' },
      { id: 'x2', teks: 'Sₙ = n × Uₙ.' },
      { id: 'x3', teks: 'Uₙ = Sₙ + Sₙ₋₁.' },
    ],
    rangkuman: [
      '<strong>Deret aritmetika</strong> adalah jumlah suku-suku barisan aritmetika: <strong>Sₙ = U₁ + U₂ + … + Uₙ</strong>.',
      'Deret yang ditulis maju dan mundur membentuk <strong>n pasangan</strong> yang masing-masing bernilai <strong>a + Uₙ</strong>, sehingga 2Sₙ = n(a + Uₙ).',
      'Rumus jumlah n suku pertama: <strong>Sₙ = n/2 (a + Uₙ)</strong> atau <strong>Sₙ = n/2 (2a + (n − 1)b)</strong>.',
      'Hubungan suku dan jumlah: <strong>Sₙ = Sₙ₋₁ + Uₙ</strong> dan <strong>Uₙ = Sₙ − Sₙ₋₁</strong>.',
      'Waspadai kesalahan umum: <strong>n × Uₙ</strong>, lupa <strong>÷ 2</strong>, dan <strong>nb</strong> alih-alih <strong>(n − 1)b</strong>.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP (masalah baru)
     Delapan soal diambil acak dari bank empat belas soal. Soal
     bertanda `gen` memakai opsi dari opsiJumlahDeret(a, b, n).
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: PBL + ' · Masalah baru',
    goal: 'Menerapkan konsep deret dan rumus jumlah n suku pertama pada masalah baru.',
    guru: 'Murid mengerjakan secara mandiri. Amati diagnosa yang paling sering muncul (lupa ÷ 2, n × Uₙ, atau nb) dan bahas satu soal di akhir tahap.',
    instruksi:
      'Kerjakan secara mandiri. Soal pilihan ganda hanya bisa dijawab sekali; soal isian boleh dicoba lagi dan ada petunjuk.',
    banyak: 8,
    komposisi: { choice: 5, isian: 3 },
    soal: [
      {
        id: 't1',
        type: 'choice',
        gen: { a: 20, b: 2, n: 15, satuan: 'kursi' },
        cerita:
          'Auditorium sekolah untuk pameran karya RPL: baris pertama berisi 20 kursi, setiap baris berikutnya bertambah 2 kursi. Ada 15 baris.',
        pertanyaan: 'Berapa banyak kursi seluruhnya?',
        explanation: 'U₁₅ = 20 + 14 × 2 = 48, S₁₅ = 15/2 × (20 + 48) = 510 kursi.',
      },
      {
        id: 't2',
        type: 'choice',
        gen: { a: 3, b: 2, n: 20, satuan: 'commit' },
        cerita:
          'Dalam tantangan 20 hari, Fajar membuat 3 commit pada hari pertama dan menambah 2 commit setiap hari.',
        pertanyaan: 'Berapa total commit Fajar selama 20 hari?',
        explanation: 'U₂₀ = 3 + 19 × 2 = 41, S₂₀ = 20/2 × (3 + 41) = 440 commit.',
      },
      {
        id: 't3',
        type: 'choice',
        gen: { a: 10000, b: 5000, n: 12, satuan: 'rupiah' },
        cerita:
          'Untuk membeli domain & hosting, Laras menabung Rp10.000 pada minggu pertama, lalu setiap minggu tabungannya Rp5.000 lebih banyak dari minggu sebelumnya.',
        pertanyaan: 'Berapa total tabungan Laras setelah 12 minggu?',
        explanation:
          'U₁₂ = 10.000 + 11 × 5.000 = 65.000, S₁₂ = 12/2 × (10.000 + 65.000) = 450.000 rupiah.',
      },
      {
        id: 't4',
        type: 'choice',
        gen: { a: 7, b: -3, n: 10 },
        cerita: 'Diketahui deret aritmetika turun 7 + 4 + 1 + (−2) + …',
        pertanyaan: 'Berapa jumlah 10 suku pertamanya?',
        explanation: 'U₁₀ = 7 + 9 × (−3) = −20, S₁₀ = 10/2 × (7 + (−20)) = 5 × (−13) = −65.',
      },
      {
        id: 't5',
        type: 'choice',
        gen: { a: 1, b: 1, n: 100 },
        cerita: 'Guru Gauss kecil meminta murid menjumlahkan 1 + 2 + 3 + … + 100.',
        pertanyaan: 'Berapa hasilnya?',
        explanation: 'S₁₀₀ = 100/2 × (1 + 100) = 50 × 101 = 5.050.',
      },
      {
        id: 't6',
        type: 'choice',
        cerita: 'Perhatikan bentuk-bentuk berikut.',
        pertanyaan: 'Manakah yang merupakan deret aritmetika?',
        options: [
          { id: 'deret', label: '4 + 9 + 14 + 19' },
          { id: 'barisan', label: '4, 9, 14, 19' },
          { id: 'geo', label: '2 + 6 + 18 + 54' },
          { id: 'kuadrat', label: '1 + 4 + 9 + 16' },
        ],
        correct: 'deret',
        cek: {
          tipe: 'jenis',
          suku: { deret: [4, 9, 14, 19], geo: [2, 6, 18, 54], kuadrat: [1, 4, 9, 16] },
        },
        explanation:
          '4 + 9 + 14 + 19 berbeda tetap 5 dan dijumlahkan. "4, 9, 14, 19" adalah barisan (tidak dijumlahkan); dua lainnya selisihnya tidak tetap.',
      },
      {
        id: 't7',
        type: 'choice',
        cerita:
          'Aplikasi mencatat total unduhan: sampai hari ke-7 ada 280 unduhan, sampai hari ke-8 ada 336 unduhan.',
        pertanyaan: 'Berapa unduhan pada hari ke-8 saja?',
        options: [
          { id: 'selisih', label: '56 unduhan' },
          { id: 'jumlah', label: '616 unduhan' },
          { id: 'rata', label: '42 unduhan' },
          { id: 'total', label: '336 unduhan' },
        ],
        correct: 'selisih',
        cek: { tipe: 'selisih', sn: 336, snm1: 280 },
        explanation: 'U₈ = S₈ − S₇ = 336 − 280 = 56.',
      },
      {
        id: 't8',
        type: 'choice',
        cerita:
          'Suatu deret aritmetika memiliki suku pertama a, suku terakhir Uₙ, dan banyak suku n.',
        pertanyaan: 'Rumus jumlah n suku pertamanya adalah …',
        options: [
          { id: 'benar', label: 'Sₙ = n/2 (a + Uₙ)' },
          { id: 'lupa', label: 'Sₙ = n (a + Uₙ)' },
          { id: 'akhir', label: 'Sₙ = n × Uₙ' },
          { id: 'bagiN', label: 'Sₙ = (a + Uₙ) ÷ n' },
        ],
        correct: 'benar',
        explanation: '2Sₙ = n(a + Uₙ), sehingga Sₙ = n/2 (a + Uₙ).',
      },
      {
        id: 't9',
        type: 'input',
        mode: 'isian',
        cerita: 'Diketahui deret aritmetika 5 + 8 + 11 + …',
        pertanyaan: 'Hitung jumlah 12 suku pertamanya (S₁₂).',
        cek: { tipe: 'jumlah', a: 5, b: 3, n: 12 },
        jawab: 258,
        hints: [
          'a = 5, b = 3, n = 12. Hitung dulu U₁₂ = 5 + 11 × 3.',
          'S₁₂ = 12/2 × (5 + 38) = 6 × 43.',
        ],
        reveal: 'U₁₂ = 38, S₁₂ = 6 × 43 = 258.',
        explanation: 'Jumlah 12 suku pertama adalah 258.',
      },
      {
        id: 't10',
        type: 'input',
        mode: 'isian',
        cerita:
          'Blog tutorial ngoding milik kelas XI RPL dibaca 40 orang pada minggu pertama, dan setiap minggu pembacanya bertambah 12 orang.',
        pertanyaan: 'Berapa total pembaca selama 10 minggu?',
        cek: { tipe: 'jumlah', a: 40, b: 12, n: 10 },
        jawab: 940,
        satuan: 'pembaca',
        hints: ['U₁₀ = 40 + 9 × 12 = 148.', 'S₁₀ = 10/2 × (40 + 148) = 5 × 188.'],
        reveal: 'S₁₀ = 5 × 188 = 940.',
        explanation: 'Total pembaca 10 minggu adalah 940 orang.',
      },
      {
        id: 't11',
        type: 'input',
        mode: 'isian',
        cerita: 'Suatu deret aritmetika memiliki suku pertama 6 dan suku ke-20 bernilai 101.',
        pertanyaan: 'Berapa jumlah 20 suku pertamanya?',
        cek: { tipe: 'ujung', a: 6, un: 101, n: 20 },
        jawab: 1070,
        hints: [
          'Suku pertama dan terakhir diketahui: Sₙ = n/2 (a + Uₙ).',
          'S₂₀ = 20/2 × (6 + 101) = 10 × 107.',
        ],
        reveal: 'S₂₀ = 10 × 107 = 1.070.',
        explanation: 'Tidak perlu mencari b bila suku terakhir sudah diketahui.',
      },
      {
        id: 't12',
        type: 'input',
        mode: 'isian',
        cerita:
          'Kuota server gratis sebuah proyek berkurang: hari pertama dipakai 50 GB, dan setiap hari pemakaian turun 4 GB.',
        pertanyaan: 'Berapa total pemakaian selama 8 hari?',
        cek: { tipe: 'jumlah', a: 50, b: -4, n: 8 },
        jawab: 288,
        satuan: 'GB',
        hints: ['Beda negatif: b = −4. U₈ = 50 + 7 × (−4) = 22.', 'S₈ = 8/2 × (50 + 22) = 4 × 72.'],
        reveal: 'S₈ = 4 × 72 = 288.',
        explanation: 'Total pemakaian 8 hari adalah 288 GB.',
      },
      {
        id: 't13',
        type: 'input',
        mode: 'isian',
        cerita:
          'Di gim edukasi, pemain mendapat 10 koin pada level 1, 20 koin pada level 2, 30 koin pada level 3, dan seterusnya.',
        pertanyaan:
          'Setelah menyelesaikan level ke berapa total koin pemain pertama kali mencapai 550 koin?',
        cek: { tipe: 'nMin', a: 10, b: 10, target: 550 },
        jawab: 10,
        hints: [
          'Cari n terkecil dengan Sₙ = n/2 (20 + (n − 1) × 10) ≥ 550.',
          'Coba n = 9: S₉ = 450. Coba n = 10: S₁₀ = 5 × 110.',
        ],
        reveal: 'S₉ = 450 < 550 dan S₁₀ = 550, jadi level ke-10.',
        explanation: 'Total koin tepat 550 pada level ke-10.',
      },
      {
        id: 't14',
        type: 'input',
        mode: 'isian',
        cerita:
          'Jumlah 15 suku pertama suatu deret aritmetika adalah 480, dan jumlah 14 suku pertamanya 434.',
        pertanyaan: 'Berapa suku ke-15?',
        cek: { tipe: 'selisih', sn: 480, snm1: 434 },
        jawab: 46,
        hints: ['Uₙ = Sₙ − Sₙ₋₁.', 'U₁₅ = 480 − 434.'],
        reveal: 'U₁₅ = 480 − 434 = 46.',
        explanation: 'Selisih dua jumlah berurutan adalah suku terakhirnya.',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan konsep deret, cara menemukan rumus, dan perasaan setelah menyelesaikan masalah lencana.',
    guru: 'Beri waktu hening 3 menit untuk menulis. Minta 2–3 murid membagikan di fitur aplikasi mana deret aritmetika bisa dipakai.',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Dengan kata-katamu sendiri, apa beda barisan, deret, Uₙ, dan Sₙ?',
        placeholder: 'Contoh: barisan adalah …, sedangkan deret adalah …',
      },
      {
        id: 'q2',
        teks: 'Mengapa pada rumus Sₙ = n/2 (a + Uₙ) ada pembagian dengan 2?',
        placeholder: 'Contoh: karena deret ditulis dua kali …',
      },
      {
        id: 'q3',
        teks: 'Fitur aplikasi apa lagi yang bisa memakai rumus jumlah deret aritmetika?',
        placeholder: 'Contoh: menghitung total poin misi harian …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menentukan jumlah n suku pertama deret aritmetika sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '😊 Yakin — aku bisa mengerjakan sendiri' },
      { id: 'cukup', label: '🙂 Cukup — kadang masih perlu petunjuk' },
      { id: 'belum', label: '🤔 Belum yakin — aku perlu berlatih lagi' },
    ],
    nextLabel: 'Simpan Refleksi & Selesai →',
  },

  selesai: {
    judul: 'Lencana Siap Diluncurkan!',
    teks: 'Kamu berhasil menjelaskan konsep deret aritmetika, menemukan rumus jumlah n suku pertama, dan memakainya untuk menjawab klien.',
    contoh: [
      { ikon: '➕', nama: 'Deret aritmetika', isi: 'Sₙ = U₁ + U₂ + … + Uₙ' },
      { ikon: '🔗', nama: 'Dari suku terakhir', isi: 'Sₙ = n/2 (a + Uₙ)' },
      { ikon: '🧮', nama: 'Rumus umum', isi: 'Sₙ = n/2 (2a + (n − 1)b)' },
      { ikon: '🏅', nama: 'Syarat lencana', isi: 'S₃₀ = 2.625 XP' },
    ],
    capaian: [
      'Membedakan barisan dan deret aritmetika serta menyusun jumlah berjalan Sₙ.',
      'Menemukan pola pasangan suku (trik Gauss): 2Sₙ = n(a + Uₙ).',
      'Menentukan dan menguji rumus Sₙ = n/2 (a + Uₙ) = n/2 (2a + (n − 1)b).',
      'Memakai rumus Sₙ untuk menyelesaikan masalah kontekstual dan menuliskannya sebagai fungsi.',
    ],
  },
};
