'use strict';

/* ============================================================
   data.js — Konten pembelajaran
   Matematika: Barisan dan Deret Geometri
   Fase F — SMK Rekayasa Perangkat Lunak
   ============================================================ */

var DATA = {

  meta: {
    title: 'Barisan dan Deret Geometri',
    subject: 'Matematika — Fase F (SMK RPL)',
    goal: 'Saya dapat menentukan rasio (r), menghitung suku ke-n (Uₙ = a × rⁿ⁻¹), dan menjumlahkan n suku pertama (Sₙ) pada barisan dan deret geometri.'
  },

  /* ----------------------------------------------------------
     TAHAP 2 — EKSPLORASI RASIO
     ---------------------------------------------------------- */
  eksplorasi: {
    title: 'Mengenal Pola Barisan Geometri',
    instruction: 'Tekan tombol untuk mengungkap suku berikutnya. Amati pola yang terbentuk, lalu tentukan suku pertama (a) dan rasio (r).',
    konteks: [
      {
        id: 'ctx1',
        badge: 'Pertumbuhan Pengguna App',
        story: 'Tim RPL meluncurkan aplikasi dan memantau pertumbuhan pengguna. Bulan pertama ada 500 pengguna. Setiap bulan jumlah pengguna menjadi dua kali lipat.',
        icon: '🚀',
        terms: [500, 1000, 2000, 4000, 8000, 16000],
        labels: ['Bln 1', 'Bln 2', 'Bln 3', 'Bln 4', 'Bln 5', 'Bln 6'],
        unit: 'pengguna',
        a: 500,
        r: 2,
        hint_a: 'Suku pertama adalah jumlah pengguna di bulan ke-1.',
        hint_r: 'Hitung rasio: Suku ke-2 ÷ Suku ke-1 = 1.000 ÷ 500 = ? Coba cek juga Suku ke-3 ÷ Suku ke-2.'
      },
      {
        id: 'ctx2',
        badge: 'Nilai Investasi',
        story: 'Rika menginvestasikan uang tabungan di reksa dana. Nilai investasi awalnya Rp 100.000. Setiap tahun nilainya menjadi tiga kali lipat karena return investasi yang tinggi.',
        icon: '💰',
        terms: [100, 300, 900, 2700, 8100, 24300],
        labels: ['Thn 1', 'Thn 2', 'Thn 3', 'Thn 4', 'Thn 5', 'Thn 6'],
        unit: 'ribu rupiah',
        a: 100,
        r: 3,
        hint_a: 'Suku pertama adalah nilai investasi di tahun ke-1 (dalam ribu rupiah).',
        hint_r: 'Hitung rasio: Nilai tahun ke-2 ÷ Nilai tahun ke-1 = 300 ÷ 100 = ? Cek konsistensinya!'
      },
      {
        id: 'ctx3',
        badge: 'Kapasitas Server',
        story: 'Tim DevOps memulai dengan server berkapasitas 2 GB. Setiap kali upgrade perangkat keras, kapasitas penyimpanan menjadi dua kali lipat.',
        icon: '💾',
        terms: [2, 4, 8, 16, 32, 64],
        labels: ['Gen 1', 'Gen 2', 'Gen 3', 'Gen 4', 'Gen 5', 'Gen 6'],
        unit: 'GB',
        a: 2,
        r: 2,
        hint_a: 'Suku pertama adalah kapasitas di generasi pertama (dalam GB).',
        hint_r: 'Hitung rasio: Kapasitas Gen 2 ÷ Kapasitas Gen 1 = 4 ÷ 2 = ?'
      }
    ]
  },

  /* ----------------------------------------------------------
     TAHAP 3 — TEMUKAN RUMUS Uₙ
     ---------------------------------------------------------- */
  rumusUn: {
    title: 'Menemukan Rumus Suku ke-n (Uₙ)',
    instruction: 'Lengkapi tabel berikut untuk menemukan pola, lalu turunkan rumus Uₙ secara mandiri.',
    barisan: [500, 1000, 2000, 4000, 8000],
    a: 500,
    r: 2,
    konteks: 'Pengguna App: 500, 1.000, 2.000, 4.000, 8.000, ... (a = 500, r = 2)',
    tableRows: [
      { n: 1, bentuk: 'a', nilai_r: 'r⁰ = 1', Un: 500 },
      { n: 2, bentuk: 'a × r', nilai_r: 'r¹ = 2', Un: 1000 },
      { n: 3, bentuk: 'a × r²', nilai_r: 'r² = 4', Un: 2000 },
      { n: 4, bentuk: 'a × r³', nilai_r: 'r³ = 8', Un: 4000 },
      { n: 5, bentuk: 'a × r⁴', nilai_r: 'r⁴ = 16', Un: 8000 },
      { n: 'n', bentuk: 'a × rⁿ⁻¹', nilai_r: 'rⁿ⁻¹', Un: null }
    ],
    steps: [
      {
        id: 's1',
        question: 'Perhatikan kolom "Bentuk Umum". Berapa pangkat <strong>r</strong> pada suku ke-4?',
        answer: '3',
        hint: 'U₄ = a × r^?. Lihat polanya: U₁ ada r⁰, U₂ ada r¹, U₃ ada r², U₄ ada...?',
        explanation: 'Untuk suku ke-4, r berpangkat 3: U₄ = a × r³. Polanya: Uₙ = a × rⁿ⁻¹ — pangkat r selalu satu kurang dari nomor sukunya.'
      },
      {
        id: 's2',
        question: 'Berapa nilai <strong>U₆</strong> pada barisan pengguna app (a = 500, r = 2)?',
        answer: '16000',
        hint: 'Gunakan rumus Uₙ = a × rⁿ⁻¹ dengan n = 6, a = 500, r = 2. Hitung 2⁵ terlebih dahulu.',
        explanation: 'U₆ = 500 × 2⁵ = 500 × 32 = 16.000. Jumlah pengguna app di bulan ke-6!'
      }
    ]
  },

  /* ----------------------------------------------------------
     TAHAP 4 — LATIHAN Uₙ
     ---------------------------------------------------------- */
  latihanUn: {
    title: 'Latihan Menghitung Suku ke-n',
    instruction: 'Hitung nilai Uₙ yang diminta. Gunakan rumus Uₙ = a × rⁿ⁻¹.',
    soal: [
      {
        id: 'u1',
        konteks: null,
        barisan_display: '2, 6, 18, 54, ...',
        question: 'Tentukan <strong>U₇</strong> dari barisan 2, 6, 18, 54, ...',
        a: 2, r: 3, n: 7,
        answer: 1458,
        hints: [
          'Identifikasi: a = 2 (suku pertama), r = 6 ÷ 2 = 3 (rasio). Gunakan Uₙ = a × rⁿ⁻¹ dengan n = 7.',
          'U₇ = 2 × 3⁶ = 2 × 729 = ? Hitung 3⁶ = 3×3×3×3×3×3 terlebih dahulu.'
        ],
        explanation: 'U₇ = a × rⁿ⁻¹ = 2 × 3⁶ = 2 × 729 = <strong>1.458</strong>.'
      },
      {
        id: 'u2',
        konteks: null,
        barisan_display: '5, 10, 20, 40, ...',
        question: 'Tentukan <strong>U₈</strong> dari barisan 5, 10, 20, 40, ...',
        a: 5, r: 2, n: 8,
        answer: 640,
        hints: [
          'Identifikasi: a = 5, r = 10 ÷ 5 = 2. Gunakan Uₙ = a × rⁿ⁻¹ dengan n = 8.',
          'U₈ = 5 × 2⁷ = 5 × 128 = ? Hitung 2⁷ = 128 terlebih dahulu.'
        ],
        explanation: 'U₈ = 5 × 2⁷ = 5 × 128 = <strong>640</strong>.'
      },
      {
        id: 'u3',
        konteks: null,
        barisan_display: '96, 48, 24, 12, ...',
        question: 'Tentukan <strong>U₆</strong> dari barisan 96, 48, 24, 12, ...',
        a: 96, r: 0.5, n: 6,
        answer: 3,
        hints: [
          'Barisan ini menurun. Rasio: r = 48 ÷ 96 = 1/2. Gunakan Uₙ = a × rⁿ⁻¹ dengan a = 96, n = 6.',
          'U₆ = 96 × (1/2)⁵ = 96 ÷ 2⁵ = 96 ÷ 32 = ? Hitung 2⁵ = 32 terlebih dahulu.'
        ],
        explanation: 'U₆ = 96 × (1/2)⁵ = 96 ÷ 32 = <strong>3</strong>. Barisan geometri bisa menurun jika rasio 0 < r < 1.'
      },
      {
        id: 'u4',
        konteks: 'Malware menginfeksi 4 komputer pada hari pertama. Setiap hari jumlah infeksi baru menjadi tiga kali lipat.',
        barisan_display: '4, 12, 36, 108, ...',
        question: 'Berapa komputer yang terinfeksi di <strong>hari ke-5</strong>?',
        a: 4, r: 3, n: 5,
        answer: 324,
        hints: [
          'a = 4 (hari pertama), r = 3 (berlipat tiga). Cari U₅ = a × r⁴.',
          'U₅ = 4 × 3⁴ = 4 × 81 = ? Hitung 3⁴ = 3×3×3×3 terlebih dahulu.'
        ],
        explanation: 'U₅ = 4 × 3⁴ = 4 × 81 = <strong>324</strong> komputer terinfeksi di hari ke-5.'
      },
      {
        id: 'u5',
        konteks: null,
        barisan_display: '3, 6, 12, 24, ...',
        question: 'Pada suku keberapa barisan 3, 6, 12, 24, ... bernilai <strong>96</strong>?',
        a: 3, r: 2, n: null,
        answer: 6,
        hints: [
          'Gunakan Uₙ = a × rⁿ⁻¹, set Uₙ = 96. Dengan a = 3, r = 2: 96 = 3 × 2^(n−1). Selesaikan untuk n.',
          '96 ÷ 3 = 32. Jadi 2^(n−1) = 32 = 2⁵. Maka n−1 = 5, n = ?'
        ],
        explanation: '96 = 3 × 2^(n−1) → 32 = 2^(n−1) → n−1 = 5 → n = <strong>6</strong>. Jadi U₆ = 96.'
      },
      {
        id: 'u6',
        konteks: null,
        barisan_display: '1, 5, 25, 125, ...',
        question: 'Diketahui a = 1 dan r = 5. Tentukan <strong>U₅</strong>.',
        a: 1, r: 5, n: 5,
        answer: 625,
        hints: [
          'Gunakan langsung rumus Uₙ = a × rⁿ⁻¹ dengan a = 1, r = 5, n = 5.',
          'U₅ = 1 × 5⁴ = 5⁴ = ? Hitung 5×5×5×5.'
        ],
        explanation: 'U₅ = 1 × 5⁴ = 5 × 5 × 5 × 5 = <strong>625</strong>.'
      }
    ]
  },

  /* ----------------------------------------------------------
     TAHAP 5 — EKSPLORASI Sₙ
     ---------------------------------------------------------- */
  ekspSn: {
    title: 'Menemukan Rumus Jumlah n Suku Pertama (Sₙ)',
    instruction: 'Kita akan menurunkan rumus Sₙ secara aljabar menggunakan trik perkalian rasio.',
    barisan: [1, 2, 4, 8, 16],
    a: 1,
    r: 2,
    n_demo: 5,
    Sn_demo: 31,
    steps: [
      {
        id: 'd1',
        title: 'Tulis Deret Geometri',
        desc: 'S₅ = 1 + 2 + 4 + 8 + 16 = 31'
      },
      {
        id: 'd2',
        title: 'Kalikan Seluruh Ruas dengan r (= 2)',
        desc: '2S₅ = 2 + 4 + 8 + 16 + 32'
      },
      {
        id: 'd3',
        title: 'Kurangi: 2S₅ − S₅ (suku-suku yang sama saling menghapus)',
        desc: '2S₅ − S₅ = 32 − 1 = 31\nSehingga: S₅ × (2 − 1) = 1 × (2⁵ − 1)'
      },
      {
        id: 'd4',
        title: 'Bagi dengan (r − 1)',
        desc: 'S₅ = 1 × (2⁵ − 1) ÷ (2 − 1) = 31 ÷ 1 = 31 ✓'
      }
    ],
    formulaQuestion: {
      question: 'Dari penurunan di atas: Sₙ(r−1) = a(rⁿ − 1). Secara umum (untuk r ≠ 1):',
      formula: 'Sₙ = a(rⁿ − 1) / (r − 1)',
      alt: 'ekuivalen: Sₙ = a(1 − rⁿ) / (1 − r)'
    },
    verifikasi: {
      question: 'Verifikasi: Gunakan rumus untuk menghitung S₄ pada barisan 3, 6, 12, 24 (a=3, r=2, n=4).',
      answer: 45,
      hint: 'S₄ = 3 × (2⁴ − 1) ÷ (2 − 1) = 3 × (16 − 1) ÷ 1 = 3 × 15 = ?',
      explanation: 'S₄ = 3(2⁴ − 1)/(2 − 1) = 3 × 15 / 1 = <strong>45</strong>. ✓ Cocok: 3 + 6 + 12 + 24 = 45.'
    }
  },

  /* ----------------------------------------------------------
     TAHAP 6 — LATIHAN Sₙ
     ---------------------------------------------------------- */
  latihanSn: {
    title: 'Latihan Menghitung Jumlah n Suku Pertama',
    instruction: 'Hitung nilai Sₙ yang diminta. Gunakan rumus Sₙ = a(rⁿ − 1) / (r − 1).',
    soal: [
      {
        id: 's1',
        barisan_display: '1, 2, 4, 8, ...',
        question: 'Tentukan <strong>S₈</strong> dari barisan 1, 2, 4, 8, ...',
        a: 1, r: 2, n: 8,
        answer: 255,
        hints: [
          'a = 1, r = 2. Gunakan Sₙ = a(rⁿ − 1)/(r − 1) dengan n = 8.',
          'S₈ = 1 × (2⁸ − 1) / (2 − 1) = (256 − 1) / 1 = ? Hitung 2⁸ = 256 terlebih dahulu.'
        ],
        explanation: 'S₈ = 1 × (2⁸ − 1) / (2 − 1) = 255 / 1 = <strong>255</strong>.'
      },
      {
        id: 's2',
        barisan_display: '3, 6, 12, 24, ...',
        question: 'Tentukan <strong>S₆</strong> dari barisan 3, 6, 12, 24, ...',
        a: 3, r: 2, n: 6,
        answer: 189,
        hints: [
          'a = 3, r = 2. Gunakan Sₙ = a(rⁿ − 1)/(r − 1) dengan n = 6.',
          'S₆ = 3 × (2⁶ − 1) / (2 − 1) = 3 × (64 − 1) / 1 = 3 × 63 = ? Hitung 2⁶ = 64 terlebih dahulu.'
        ],
        explanation: 'S₆ = 3 × (2⁶ − 1) / (2 − 1) = 3 × 63 = <strong>189</strong>.'
      },
      {
        id: 's3',
        barisan_display: '5, 15, 45, 135, ...',
        question: 'Tentukan <strong>S₅</strong> dari barisan 5, 15, 45, 135, ...',
        a: 5, r: 3, n: 5,
        answer: 605,
        hints: [
          'a = 5, r = 3. Gunakan Sₙ = a(rⁿ − 1)/(r − 1) dengan n = 5.',
          'S₅ = 5 × (3⁵ − 1) / (3 − 1) = 5 × (243 − 1) / 2 = 5 × 242/2 = 5 × 121 = ? Hitung 3⁵ = 243.'
        ],
        explanation: 'S₅ = 5 × (3⁵ − 1) / (3 − 1) = 5 × 242 / 2 = 5 × 121 = <strong>605</strong>.'
      },
      {
        id: 's4',
        barisan_display: '2, 6, 18, 54, ...',
        question: 'Tentukan <strong>S₇</strong> dari barisan 2, 6, 18, 54, ...',
        a: 2, r: 3, n: 7,
        answer: 2186,
        hints: [
          'a = 2, r = 3. Gunakan Sₙ = a(rⁿ − 1)/(r − 1) dengan n = 7.',
          'S₇ = 2 × (3⁷ − 1) / (3 − 1) = 2 × (2187 − 1) / 2 = 2186. Hitung 3⁷ = 2187 dulu.'
        ],
        explanation: 'S₇ = 2 × (3⁷ − 1) / (3 − 1) = 2 × 2186 / 2 = <strong>2.186</strong>.'
      },
      {
        id: 's5',
        barisan_display: '4, 8, 16, 32, ...',
        question: 'Tentukan <strong>S₁₀</strong> dari barisan 4, 8, 16, 32, ...',
        a: 4, r: 2, n: 10,
        answer: 4092,
        hints: [
          'a = 4, r = 2. Gunakan Sₙ = a(rⁿ − 1)/(r − 1) dengan n = 10.',
          'S₁₀ = 4 × (2¹⁰ − 1) / (2 − 1) = 4 × (1024 − 1) / 1 = 4 × 1023 = ? Hitung 2¹⁰ = 1024.'
        ],
        explanation: 'S₁₀ = 4 × (2¹⁰ − 1) / (2 − 1) = 4 × 1023 = <strong>4.092</strong>.'
      },
      {
        id: 's6',
        barisan_display: '1, 3, 9, 27, ...',
        question: 'Tentukan <strong>S₆</strong> dari barisan 1, 3, 9, 27, ...',
        a: 1, r: 3, n: 6,
        answer: 364,
        hints: [
          'a = 1, r = 3. Gunakan Sₙ = a(rⁿ − 1)/(r − 1) dengan n = 6.',
          'S₆ = 1 × (3⁶ − 1) / (3 − 1) = (729 − 1) / 2 = 728 / 2 = ? Hitung 3⁶ = 729 dulu.'
        ],
        explanation: 'S₆ = 1 × (3⁶ − 1) / (3 − 1) = 728 / 2 = <strong>364</strong>.'
      }
    ]
  },

  /* ----------------------------------------------------------
     TAHAP 7 — TANTANGAN KONTEKSTUAL
     ---------------------------------------------------------- */
  tantangan: {
    title: 'Tantangan Kontekstual',
    soal: [
      {
        id: 't1',
        badge: 'Investasi Saham',
        icon: '💹',
        story: 'Ardi menginvestasikan <strong>Rp 5.000.000</strong> di reksa dana saham. Setiap tahun nilai investasinya berlipat <strong>dua kali</strong>.',
        question: 'Berapa nilai investasi Ardi di <strong>tahun ke-6</strong>?',
        type: 'input',
        answer: 160,
        unit: 'juta rupiah',
        hint: 'Ini adalah barisan geometri: a = 5 (juta), r = 2, n = 6. Gunakan Uₙ = a × rⁿ⁻¹.',
        explanation: 'U₆ = 5 × 2⁵ = 5 × 32 = <strong>160 juta rupiah</strong>. Investasi yang tumbuh eksponensial!'
      },
      {
        id: 't2',
        badge: 'Virus Komputer',
        icon: '🦠',
        story: 'Sebuah malware menginfeksi <strong>1 komputer</strong> pada hari pertama. Setiap hari, setiap komputer yang terinfeksi menyebarkan ke komputer lain sehingga total komputer terinfeksi menjadi <strong>tiga kali lipat</strong>.',
        question: 'Berapa <strong>total</strong> komputer yang telah terinfeksi setelah <strong>5 hari</strong>?',
        type: 'input',
        answer: 121,
        unit: 'komputer',
        hint: 'Ini adalah jumlah deret geometri. a = 1, r = 3, n = 5. Gunakan Sₙ = a(rⁿ − 1)/(r − 1).',
        explanation: 'S₅ = 1 × (3⁵ − 1) / (3 − 1) = (243 − 1) / 2 = 242 / 2 = <strong>121 komputer</strong>.'
      },
      {
        id: 't3',
        badge: 'Peluncuran Aplikasi',
        icon: '📱',
        story: 'Aplikasi buatan tim RPL diluncurkan dengan <strong>100 pengguna</strong> awal. Berkat strategi pemasaran digital, setiap bulan jumlah pengguna menjadi <strong>dua kali lipat</strong>.',
        question: 'Pada bulan ke berapa jumlah pengguna <strong>pertama kali mencapai 3.200</strong>?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: 'Bulan ke-5' },
          { id: 'opt_b', label: 'Bulan ke-6' },
          { id: 'opt_c', label: 'Bulan ke-7' }
        ],
        correct: 'opt_b',
        hint: 'Gunakan Uₙ = a × rⁿ⁻¹. Set Uₙ = 3200, a = 100, r = 2. Selesaikan: 3200 = 100 × 2^(n−1).',
        explanation: '3200 = 100 × 2^(n−1) → 32 = 2^(n−1) → 2⁵ = 2^(n−1) → n−1 = 5 → n = <strong>6</strong>. Bulan ke-6!'
      },
      {
        id: 't4',
        badge: 'Upgrade Server',
        icon: '⚡',
        story: 'Tim DevOps memiliki server dengan kapasitas awal <strong>8 GB</strong>. Setiap kali upgrade, kapasitas server menjadi <strong>tiga kali lipat</strong>. Mereka melakukan upgrade sebanyak 3 kali (total ada 4 generasi server).',
        question: 'Berapa <strong>total kapasitas</strong> seluruh generasi server (4 generasi)?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: '240 GB' },
          { id: 'opt_b', label: '320 GB' },
          { id: 'opt_c', label: '648 GB' }
        ],
        correct: 'opt_b',
        hint: 'Jumlahkan 4 suku pertama: a = 8, r = 3, n = 4. Gunakan Sₙ = a(rⁿ − 1)/(r − 1). Hitung 3⁴ = 81.',
        explanation: 'S₄ = 8 × (3⁴ − 1) / (3 − 1) = 8 × (81 − 1) / 2 = 8 × 80 / 2 = 8 × 40 = <strong>320 GB</strong>.'
      }
    ]
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    title: 'Refleksi Pembelajaran',
    note: 'Refleksi ini membantu kamu merangkum pemahaman hari ini. Jawaban <strong>tidak dikirim ke mana pun</strong> — hanya ditampilkan di layarmu.',
    soal: [
      {
        id: 'r1',
        question: 'Dengan kata-katamu sendiri, apa perbedaan antara <strong>barisan aritmetika</strong> dan <strong>barisan geometri</strong>? Apa yang membedakan cara menghitung sukunya?',
        placeholder: 'Tuliskan penjelasanmu...'
      },
      {
        id: 'r2',
        question: 'Bagaimana kamu mengingat rumus <strong>Uₙ = a × rⁿ⁻¹</strong>? Strategi apa yang membantumu?',
        placeholder: 'Ceritakan strategimu...'
      },
      {
        id: 'r3',
        question: 'Berikan satu contoh <strong>barisan geometri</strong> dari kehidupan sehari-hari sebagai pelajar SMK RPL yang belum disebutkan dalam media ini.',
        placeholder: 'Contohmu...'
      },
      {
        id: 'r4',
        question: 'Hal apa yang masih membingungkan atau ingin kamu pelajari lebih lanjut tentang barisan dan deret geometri?',
        placeholder: 'Tuliskan pertanyaan atau kesulitanmu...'
      }
    ]
  }

};
