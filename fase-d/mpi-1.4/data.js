'use strict';

/* ============================================================
   data.js — Konten pembelajaran
   Matematika: Membandingkan dan Mengubah Representasi Bilangan Rasional
   Pisahkan dari app.js agar mudah dikustomisasi guru.
   ============================================================ */

const DATA = {

  meta: {
    title: 'Eksplorasi Bilangan Rasional',
    subject: 'Matematika — Fase D (SMP)',
    goal: 'Saya dapat mengubah representasi bilangan rasional dan membandingkan nilainya.'
  },

  /* ----------------------------------------------------------
     TAHAP 2 — Eksplorasi Visual
     ---------------------------------------------------------- */
  eksplorasi: {
    title: 'Eksplorasi Visual Pecahan dan Desimal',
    instruction: 'Pilih sebuah pecahan untuk melihat model visualnya, lalu prediksi nilai desimalnya sebelum melihat hasilnya.',
    minRequired: 5,
    fractions: [
      {
        id: 'f1', num: 1, den: 2,
        hint: 'Jika sesuatu dibagi menjadi 2 bagian sama besar dan kamu mengambil 1 bagian, berapa persennya?',
        explanation: '1 ÷ 2 = 0,5. Setengah dari satu kesatuan sama dengan 50% atau 0,5. Ini adalah pecahan paling umum dalam kehidupan sehari-hari — "diskon setengah harga" artinya diskon 0,5.'
      },
      {
        id: 'f2', num: 1, den: 4,
        hint: 'Seperempat = 1 dari 4 bagian sama besar. Berapa persen dari keseluruhan? Ingat: 1/4 = 1/2 dari 1/2.',
        explanation: '1 ÷ 4 = 0,25. Satu per empat = 25% = 0,25. Strategi: 1/4 = 25/100 karena 1 × 25 = 25 dan 4 × 25 = 100.'
      },
      {
        id: 'f3', num: 3, den: 4,
        hint: '3/4 adalah 3 kali lipat dari 1/4. Jika 1/4 = 0,25, berapa nilai 3/4?',
        explanation: '3 ÷ 4 = 0,75. Tiga per empat = 75% = 0,75. Perhatikan pola: 3 × 0,25 = 0,75. Juga: 3/4 = 75/100.'
      },
      {
        id: 'f4', num: 1, den: 5,
        hint: 'Penyebut 5 istimewa: 5 × 2 = 10. Coba ubah ke per-sepuluhan dulu.',
        explanation: '1 ÷ 5 = 0,2. Strategi: 1/5 = 2/10 = 0,2 karena 1 × 2 = 2 dan 5 × 2 = 10. Penyebut 5 selalu mudah diubah ke 10.'
      },
      {
        id: 'f5', num: 2, den: 5,
        hint: '2/5 = 2 kali lipat dari 1/5. Jika 1/5 = 0,2, berapa 2/5?',
        explanation: '2 ÷ 5 = 0,4. Strategi: 2/5 = 4/10 = 0,4. Atau: 2 × 0,2 = 0,4. Pola: kelipatan 1/5 menghasilkan 0,2; 0,4; 0,6; 0,8; 1,0.'
      },
      {
        id: 'f6', num: 3, den: 5,
        hint: '3/5 = 3 kali lipat dari 1/5. Jika 1/5 = 0,2, berapa 3/5?',
        explanation: '3 ÷ 5 = 0,6. Strategi: 3/5 = 6/10 = 0,6. Atau: 3 × 0,2 = 0,6.'
      },
      {
        id: 'f7', num: 1, den: 8,
        hint: '1/8 lebih kecil dari 1/4 (0,25) dan lebih besar dari 0. Coba bagi: 10 ÷ 8 = 1 sisa 2, lanjutkan...',
        explanation: '1 ÷ 8 = 0,125. Langkah: 10÷8=1 (sisa 2) → 20÷8=2 (sisa 4) → 40÷8=5. Hasilnya 0,125. Ini adalah desimal berhenti.'
      },
      {
        id: 'f8', num: 3, den: 8,
        hint: '3/8 = 3 kali lipat dari 1/8. Jika 1/8 = 0,125, berapa 3/8?',
        explanation: '3 ÷ 8 = 0,375. Atau: 3 × 0,125 = 0,375. Perhatikan: 3/8 terletak di antara 1/4 (0,25) dan 1/2 (0,5) pada garis bilangan.'
      }
    ]
  },

  /* ----------------------------------------------------------
     TAHAP 3 — Konversi Terbimbing
     ---------------------------------------------------------- */
  konversi: {
    title: 'Latihan Konversi Pecahan ke Desimal',
    instruction: 'Ubah setiap pecahan ke bentuk desimal. Gunakan koma (,) sebagai tanda desimal.',
    soal: [
      {
        id: 'k1', num: 3, den: 4,
        correct: 0.75, display: '0,75', terminating: true,
        hints: [
          'Ingat: pecahan berarti pembagian. Hitung 3 ÷ 4. Mulai dengan 30 ÷ 4 = ... (sisa berapa?)',
          '30 ÷ 4 = 7 (sisa 2). Lanjutkan: 20 ÷ 4 = 5 (sisa 0). Hasilnya 0,75. Coba ketikkan 0,75!'
        ],
        explanation: '3 ÷ 4 = 0,75. Strategi: 3/4 = 75/100 karena 3 × 25 = 75 dan 4 × 25 = 100. Jadi 3/4 = 0,75.'
      },
      {
        id: 'k2', num: 2, den: 5,
        correct: 0.4, display: '0,4', terminating: true,
        hints: [
          'Penyebut 5 istimewa. Kalikan pembilang dan penyebut dengan 2 untuk mendapat penyebut 10.',
          '2/5 = (2×2)/(5×2) = 4/10. Berapa nilai desimal dari 4/10? (Ingat: per-sepuluhan ditulis di angka pertama setelah koma.)'
        ],
        explanation: '2 ÷ 5 = 0,4. Strategi: 2/5 = 4/10 = 0,4. Kalikan atas-bawah dengan 2 untuk mendapat penyebut 10.'
      },
      {
        id: 'k3', num: 7, den: 10,
        correct: 0.7, display: '0,7', terminating: true,
        hints: [
          'Perhatikan penyebutnya: tepat 10. Tempat pertama setelah koma desimal disebut "persepuluhan".',
          '7/10 berarti 7 per-sepuluhan. Cukup tulis 7 di tempat pertama setelah koma. Berapa hasilnya?'
        ],
        explanation: '7 ÷ 10 = 0,7. Penyebut 10 sangat mudah: langsung tulis pembilang (7) di tempat persepuluhan.'
      },
      {
        id: 'k4', num: 5, den: 8,
        correct: 0.625, display: '0,625', terminating: true,
        hints: [
          'Lakukan pembagian bersusun: 5 ÷ 8. Karena 8 > 5, tambahkan nol: 50 ÷ 8 = ? (sisa berapa?)',
          '50 ÷ 8 = 6 (sisa 2) → tulis 0,6. Lanjut: 20 ÷ 8 = 2 (sisa 4) → tulis 0,62. Lanjut: 40 ÷ 8 = 5 → tulis 0,625. Selesai!'
        ],
        explanation: '5 ÷ 8 = 0,625. Langkah: 50÷8=6 (sisa 2), 20÷8=2 (sisa 4), 40÷8=5. Hasil: 0,625 (desimal berhenti, tidak ada sisa akhir).'
      },
      {
        id: 'k5', num: 1, den: 3,
        correct: 1 / 3, display: '0,333...', terminating: false,
        tolerance: 0.005,
        hints: [
          'Coba bagi 1 ÷ 3 dengan pembagian bersusun. Hitung 10 ÷ 3 = ? (sisa berapa?)',
          '10 ÷ 3 = 3 (sisa 1) → 10 ÷ 3 = 3 (sisa 1) → Polanya terus berulang! Angka 3 tidak berhenti. Ketikkan "0,33" atau "0,333".'
        ],
        explanation: '1 ÷ 3 = 0,3333... (desimal berulang). Angka 3 berulang tanpa akhir — ini BUKAN kesalahan hitungan, memang begitu sifatnya. Ditulis 0,3̄ atau dibulatkan 0,333.'
      },
      {
        id: 'k6', num: 3, den: 5,
        correct: 0.6, display: '0,6', terminating: true,
        hints: [
          'Penyebut 5 istimewa: kalikan pembilang dan penyebut dengan 2.',
          '3/5 = (3×2)/(5×2) = 6/10. Berapa nilai desimal 6/10?'
        ],
        explanation: '3 ÷ 5 = 0,6. Strategi: 3/5 = 6/10 = 0,6. Pola: 1/5=0,2; 2/5=0,4; 3/5=0,6; 4/5=0,8.'
      },
      {
        id: 'k7', num: 9, den: 20,
        correct: 0.45, display: '0,45', terminating: true,
        hints: [
          'Ubah penyebut 20 menjadi 100. Berapa yang harus dikalikan? Kalikan pembilang dengan angka yang sama.',
          '9/20 = ?/100. Karena 20 × 5 = 100, maka 9 × 5 = 45. Jadi 9/20 = 45/100 = 0,...'
        ],
        explanation: '9 ÷ 20 = 0,45. Strategi: 9/20 × (5/5) = 45/100 = 0,45. Penyebut 20 mudah diubah ke 100 dengan mengalikan 5.'
      },
      {
        id: 'k8', num: 7, den: 25,
        correct: 0.28, display: '0,28', terminating: true,
        hints: [
          'Ubah penyebut 25 menjadi 100. Berapa 25 × ? = 100? Kalikan pembilangnya juga.',
          '7/25 = ?/100. Karena 25 × 4 = 100, maka 7 × 4 = 28. Jadi 7/25 = 28/100 = 0,...'
        ],
        explanation: '7 ÷ 25 = 0,28. Strategi: 7/25 × (4/4) = 28/100 = 0,28. Penyebut 25 mudah diubah ke 100 dengan mengalikan 4.'
      }
    ]
  },

  /* ----------------------------------------------------------
     TAHAP 4 — Membandingkan
     ---------------------------------------------------------- */
  bandingkan: {
    title: 'Latihan Membandingkan Bilangan Rasional',
    instruction: 'Pilih tanda yang tepat: < (kurang dari), = (sama dengan), atau > (lebih dari).',
    soal: [
      {
        id: 'b1',
        a: { type: 'fraction', num: 3, den: 5 },
        b: { type: 'decimal', value: 0.65 },
        answer: '<',
        hint: 'Ubah 3/5 ke desimal: 3 ÷ 5 = ?',
        explanation: '3/5 = 0,6 dan 0,65. Bandingkan digit per digit: 0,60 vs 0,65. Karena 60 < 65, maka 3/5 &lt; 0,65.',
        strategy: 'Ubah pecahan ke desimal, lalu bandingkan.'
      },
      {
        id: 'b2',
        a: { type: 'fraction', num: 7, den: 10 },
        b: { type: 'fraction', num: 3, den: 4 },
        answer: '<',
        hint: 'Ubah keduanya ke desimal: 7/10 = ? dan 3/4 = ?',
        explanation: '7/10 = 0,7 dan 3/4 = 0,75. Karena 0,7 &lt; 0,75, maka 7/10 &lt; 3/4.',
        strategy: 'Ubah keduanya ke desimal, lalu bandingkan.'
      },
      {
        id: 'b3',
        a: { type: 'mixed', whole: 1, num: 1, den: 2 },
        b: { type: 'decimal', value: 1.4 },
        answer: '>',
        hint: 'Ubah 1½ ke desimal: bagian bulat (1) ditambah nilai pecahan (1/2 = 0,5).',
        explanation: '1½ = 1 + 0,5 = 1,5 dan 1,4. Karena 1,5 &gt; 1,4, maka 1½ &gt; 1,4.',
        strategy: 'Ubah pecahan campuran ke desimal: bagian bulat + (pembilang ÷ penyebut).'
      },
      {
        id: 'b4',
        a: { type: 'fraction', num: 2, den: 3 },
        b: { type: 'decimal', value: 0.6 },
        answer: '>',
        hint: 'Ubah 2/3 ke desimal: 2 ÷ 3 = ? Perhatikan, ini menghasilkan desimal berulang.',
        explanation: '2/3 = 0,666... (desimal berulang). Bandingkan: 0,666... dengan 0,600. Karena 0,666... &gt; 0,600, maka 2/3 &gt; 0,6.',
        strategy: 'Ubah 2/3 ke desimal berulang, lalu bandingkan posisi desimalnya.'
      },
      {
        id: 'b5',
        a: { type: 'fraction', num: 4, den: 5 },
        b: { type: 'decimal', value: 0.78 },
        answer: '>',
        hint: 'Ubah 4/5 ke desimal: 4 ÷ 5 = ? (Ingat: penyebut 5, kalikan dengan 2.)',
        explanation: '4/5 = 0,8 dan 0,78. Karena 0,8 &gt; 0,78, maka 4/5 &gt; 0,78.',
        strategy: 'Ubah 4/5 ke desimal: 4/5 = 8/10 = 0,8.'
      },
      {
        id: 'b6',
        a: { type: 'fraction', num: 3, den: 8 },
        b: { type: 'decimal', value: 0.35 },
        answer: '>',
        hint: 'Ubah 3/8 ke desimal dengan pembagian bersusun: 3 ÷ 8.',
        explanation: '3/8 = 0,375 dan 0,35. Bandingkan: 0,375 vs 0,350. Karena 375 &gt; 350, maka 3/8 &gt; 0,35.',
        strategy: 'Ubah 3/8 ke desimal, lalu bandingkan dengan menambah nol di belakang 0,35 → 0,350.'
      }
    ]
  },

  /* ----------------------------------------------------------
     TAHAP 5 — Mengurutkan Produk
     ---------------------------------------------------------- */
  urutkan: {
    title: 'Mengurutkan Produk Berdasarkan Kandungan Gula',
    instruction: 'Urutkan produk-produk berikut dari kandungan gula TERKECIL ke TERBESAR. Geser kartu atau gunakan tombol ▲▼.',
    context: 'Penelitian sederhana mengukur kandungan gula (sendok makan/sdm) per sajian dari 6 produk kemasan. Representasinya sengaja dicampur antara pecahan dan desimal.',
    products: [
      { id: 'p1', name: 'Biskuit Gandum', sugar: { type: 'fraction', num: 1, den: 4 }, decimal: 0.25 },
      { id: 'p2', name: 'Yogurt Tawar', sugar: { type: 'decimal', value: 0.3 }, decimal: 0.3 },
      { id: 'p3', name: 'Teh Manis', sugar: { type: 'fraction', num: 7, den: 20 }, decimal: 0.35 },
      { id: 'p4', name: 'Jus Jeruk', sugar: { type: 'fraction', num: 3, den: 8 }, decimal: 0.375 },
      { id: 'p5', name: 'Susu Coklat', sugar: { type: 'decimal', value: 0.45 }, decimal: 0.45 },
      { id: 'p6', name: 'Sirup Buah', sugar: { type: 'fraction', num: 3, den: 5 }, decimal: 0.6 }
    ],
    correctOrder: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
    initialOrder: ['p3', 'p6', 'p1', 'p5', 'p2', 'p4'],
    /* Desimal produk untuk referensi konversi:
       p1 = 1/4 = 0,25 | p2 = 0,3 | p3 = 7/20 = 0,35
       p4 = 3/8 = 0,375 | p5 = 0,45 | p6 = 3/5 = 0,6 */
    checkHint: 'Ubah semua pecahan ke desimal terlebih dahulu, kemudian urutkan nilai desimalnya dari terkecil.'
  },

  /* ----------------------------------------------------------
     TAHAP 6 — Tantangan Kontekstual
     ---------------------------------------------------------- */
  tantangan: {
    title: 'Tantangan Kontekstual',
    soal: [
      {
        id: 't1',
        badge: 'Resep Masak',
        story: 'Ayah sedang membuat adonan pancake. Resepnya membutuhkan <strong>¾ cangkir tepung</strong> dan <strong>0,6 cangkir susu cair</strong>. Ayah ingin tahu bahan mana yang dibutuhkan lebih banyak.',
        question: 'Mana yang lebih banyak jumlahnya?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: 'Tepung (¾ cangkir)' },
          { id: 'opt_b', label: 'Susu cair (0,6 cangkir)' },
          { id: 'opt_c', label: 'Jumlahnya sama persis' }
        ],
        correct: 'opt_a',
        hint: 'Ubah ¾ ke desimal terlebih dahulu: 3 ÷ 4 = ?',
        explanation: '¾ = 0,75. Bandingkan: 0,75 dan 0,6. Karena 0,75 &gt; 0,6, tepung (¾ cangkir) lebih banyak dari susu cair (0,6 cangkir).'
      },
      {
        id: 't2',
        badge: 'Label Nutrisi',
        story: 'Budi memilih camilan di supermarket. <strong>Biskuit A</strong> mengandung <strong>2/5 gram protein</strong> per sajian. <strong>Biskuit B</strong> mengandung <strong>0,35 gram protein</strong> per sajian. Budi ingin biskuit dengan protein lebih tinggi.',
        question: 'Biskuit mana yang kandungan proteinnya lebih tinggi?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: 'Biskuit A (2/5 gram)' },
          { id: 'opt_b', label: 'Biskuit B (0,35 gram)' },
          { id: 'opt_c', label: 'Kandungannya sama' }
        ],
        correct: 'opt_a',
        hint: 'Ubah 2/5 ke desimal: 2 ÷ 5 = ? (Ingat: penyebut 5, kalikan dengan 2.)',
        explanation: '2/5 = 0,4. Bandingkan: 0,4 dan 0,35. Karena 0,4 &gt; 0,35, Biskuit A memiliki protein yang lebih tinggi.'
      },
      {
        id: 't3',
        badge: 'Promo Belanja',
        story: 'Siti ingin membeli sepatu. <strong>Toko Muda</strong> menawarkan <strong>diskon 2/5</strong> dari harga asli. <strong>Toko Seru</strong> menawarkan <strong>diskon 0,45</strong> dari harga asli. Siti ingin mendapatkan diskon paling besar.',
        question: 'Toko mana yang memberi diskon lebih besar?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: 'Toko Muda (diskon 2/5)' },
          { id: 'opt_b', label: 'Toko Seru (diskon 0,45)' },
          { id: 'opt_c', label: 'Diskonnya sama besar' }
        ],
        correct: 'opt_b',
        hint: 'Ubah 2/5 ke desimal: 2 ÷ 5 = ?',
        explanation: '2/5 = 0,4. Bandingkan: 0,4 dan 0,45. Karena 0,45 &gt; 0,4, Toko Seru memberikan diskon lebih besar.'
      },
      {
        id: 't4',
        badge: 'Kandungan Vitamin',
        story: 'Empat merek minuman kesehatan mengandung vitamin C per sajian:\n<ul class="story-list"><li><strong>Minuman A:</strong> <strong>⅓ gram</strong></li><li><strong>Minuman B:</strong> <strong>0,4 gram</strong></li><li><strong>Minuman C:</strong> <strong>⅜ gram</strong></li><li><strong>Minuman D:</strong> <strong>0,35 gram</strong></li></ul>',
        question: 'Urutkan dari kandungan vitamin C TERBESAR ke TERKECIL:',
        type: 'ordering',
        items: [
          { id: 'mA', label: 'Minuman A (⅓ g)', decimal: 1 / 3 },
          { id: 'mB', label: 'Minuman B (0,4 g)', decimal: 0.4 },
          { id: 'mC', label: 'Minuman C (⅜ g)', decimal: 3 / 8 },
          { id: 'mD', label: 'Minuman D (0,35 g)', decimal: 0.35 }
        ],
        initialOrder: ['mD', 'mA', 'mC', 'mB'],
        correctOrder: ['mB', 'mC', 'mD', 'mA'],
        hint: 'Ubah semua ke desimal dahulu: ⅓ ≈ 0,333..., ⅜ = 3 ÷ 8 = ?',
        explanation: 'Dalam desimal: A ≈ 0,333..., B = 0,4, C = 0,375, D = 0,35.<br>Urutan terbesar ke terkecil: B (0,4) &gt; C (0,375) &gt; D (0,35) &gt; A (0,333...)<br><em>Perhatikan: ⅓ adalah desimal berulang (0,333...) yang lebih kecil dari 0,35.</em>'
      }
    ]
  },

  /* ----------------------------------------------------------
     TAHAP 7 — Refleksi
     ---------------------------------------------------------- */
  refleksi: {
    title: 'Refleksi Pembelajaran',
    note: 'Refleksi ini membantu kamu merangkum pemahamanmu hari ini. Jawaban ditampilkan di layar dan <strong>tidak dikirim ke mana pun</strong>. Guru tetap menggunakan observasi dan diskusi langsung sebagai asesmen utama.',
    soal: [
      {
        id: 'r1',
        question: 'Bentuk mana yang menurutmu paling mudah digunakan untuk <strong>membandingkan</strong> dua bilangan rasional: pecahan atau desimal? Mengapa?',
        placeholder: 'Tuliskan pendapatmu...'
      },
      {
        id: 'r2',
        question: 'Strategi konversi apa yang paling membantumu? (Contoh: mengubah penyebut menjadi 10 atau 100, pembagian langsung, atau strategi lain.)',
        placeholder: 'Jelaskan strategimu...'
      },
      {
        id: 'r3',
        question: 'Bagaimana kamu <strong>memeriksa</strong> bahwa hasil konversimu sudah benar?',
        placeholder: 'Ceritakan cara kamu memeriksa...'
      },
      {
        id: 'r4',
        question: 'Konsep apa yang masih ingin kamu pelajari lebih lanjut tentang bilangan rasional?',
        placeholder: 'Tuliskan di sini...'
      }
    ]
  }

};
