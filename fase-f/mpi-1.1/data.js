'use strict';

/* ============================================================
   data.js — Konten pembelajaran
   Matematika: Barisan dan Deret Aritmetika
   Fase F — SMK Rekayasa Perangkat Lunak
   ============================================================ */

var DATA = {
  meta: {
    title: 'Barisan dan Deret Aritmetika',
    subject: 'Matematika — Fase F (SMK RPL)',
    goal: 'Saya dapat mengidentifikasi pola, menentukan rumus suku ke-n (Uₙ), dan menghitung jumlah n suku pertama (Sₙ) pada barisan dan deret aritmetika.',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — EKSPLORASI POLA
     ---------------------------------------------------------- */
  eksplorasi: {
    title: 'Mengenal Pola Barisan Aritmetika',
    instruction:
      'Tekan tombol untuk mengungkap suku berikutnya. Amati pola yang terbentuk, lalu tentukan suku pertama (a) dan beda (b).',
    konteks: [
      {
        id: 'ctx1',
        badge: 'Kursi Bioskop',
        story:
          'Sebuah bioskop memiliki kursi yang bertambah secara teratur di setiap barisnya. Baris ke-1 memiliki 8 kursi, baris ke-2 memiliki 13 kursi, dan seterusnya.',
        icon: '🎬',
        terms: [8, 13, 18, 23, 28, 33],
        labels: ['Baris 1', 'Baris 2', 'Baris 3', 'Baris 4', 'Baris 5', 'Baris 6'],
        unit: 'kursi',
        a: 8,
        b: 5,
        hint_a: 'Suku pertama adalah jumlah kursi di baris ke-1.',
        hint_b: 'Berapa selisih jumlah kursi antara dua baris yang berurutan?',
      },
      {
        id: 'ctx2',
        badge: 'Biaya Hosting',
        story:
          'Tim pengembang RPL menyewa server cloud. Bulan pertama biayanya Rp 200.000. Setiap bulan biaya bertambah Rp 50.000 karena kapasitas ditingkatkan.',
        icon: '☁️',
        terms: [200, 250, 300, 350, 400, 450],
        labels: ['Bln 1', 'Bln 2', 'Bln 3', 'Bln 4', 'Bln 5', 'Bln 6'],
        unit: 'ribu rupiah',
        a: 200,
        b: 50,
        hint_a: 'Suku pertama adalah biaya di bulan ke-1 (dalam ribu rupiah).',
        hint_b: 'Berapa kenaikan biaya dari satu bulan ke bulan berikutnya?',
      },
      {
        id: 'ctx3',
        badge: 'Commit GitHub',
        story:
          'Rahel sedang belajar Git. Minggu pertama ia membuat 3 commit, minggu kedua 7 commit, dan seterusnya — bertambah secara teratur.',
        icon: '💻',
        terms: [3, 7, 11, 15, 19, 23],
        labels: ['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4', 'Mgg 5', 'Mgg 6'],
        unit: 'commit',
        a: 3,
        b: 4,
        hint_a: 'Suku pertama adalah jumlah commit di minggu ke-1.',
        hint_b: 'Berapa tambahan commit dari satu minggu ke minggu berikutnya?',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 3 — TEMUKAN RUMUS Uₙ
     ---------------------------------------------------------- */
  rumusUn: {
    title: 'Menemukan Rumus Suku ke-n (Uₙ)',
    instruction:
      'Lengkapi tabel berikut untuk menemukan pola, lalu turunkan rumus Uₙ secara mandiri.',
    barisan: [3, 7, 11, 15, 19],
    a: 3,
    b: 4,
    konteks: 'Commit GitHub Rahel: 3, 7, 11, 15, 19, ...',
    tableRows: [
      { n: 1, bentuk: 'a', expanded: '3', Un: 3 },
      { n: 2, bentuk: 'a + b', expanded: '3 + 4', Un: 7 },
      { n: 3, bentuk: 'a + 2b', expanded: '3 + 2×4', Un: 11 },
      { n: 4, bentuk: 'a + 3b', expanded: '3 + 3×4', Un: 15 },
      { n: 5, bentuk: 'a + 4b', expanded: '3 + 4×4', Un: 19 },
      { n: 'n', bentuk: 'a + (n−1)b', expanded: '3 + (n−1)×4', Un: null },
    ],
    steps: [
      {
        id: 's1',
        question:
          'Perhatikan kolom "Bentuk Umum". Berapa kali <strong>b</strong> ditambahkan untuk mendapatkan suku ke-4?',
        answer: '3',
        hint: 'U₄ = a + ?×b. Lihat polanya: U₁ tidak ada b, U₂ ada 1b, U₃ ada 2b, U₄ ada...?',
        explanation:
          'Untuk suku ke-4, b ditambahkan sebanyak 3 kali: U₄ = a + 3b. Polanya: Uₙ = a + (n−1)b.',
      },
      {
        id: 's2',
        question: 'Berapa nilai <strong>U₁₀</strong> pada barisan commit Rahel (a=3, b=4)?',
        answer: '39',
        hint: 'Gunakan rumus Uₙ = a + (n−1)b dengan n=10, a=3, b=4.',
        explanation:
          'U₁₀ = 3 + (10−1)×4 = 3 + 9×4 = 3 + 36 = 39. Rahel membuat 39 commit di minggu ke-10.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 4 — LATIHAN Uₙ
     ---------------------------------------------------------- */
  latihanUn: {
    title: 'Latihan Menghitung Suku ke-n',
    instruction: 'Hitung nilai Uₙ yang diminta. Gunakan rumus Uₙ = a + (n−1)b.',
    soal: [
      {
        id: 'u1',
        konteks: null,
        barisan_display: '3, 7, 11, 15, ...',
        question: 'Tentukan <strong>U₁₀</strong> dari barisan 3, 7, 11, 15, ...',
        a: 3,
        b: 4,
        n: 10,
        answer: 39,
        hints: [
          'Identifikasi: a = 3 (suku pertama), b = 7 − 3 = 4 (beda). Gunakan Uₙ = a + (n−1)b dengan n = 10.',
          'U₁₀ = 3 + (10−1) × 4 = 3 + 9 × 4 = 3 + ... Hitung 9 × 4 terlebih dahulu.',
        ],
        explanation: 'U₁₀ = a + (n−1)b = 3 + (10−1)×4 = 3 + 36 = <strong>39</strong>.',
      },
      {
        id: 'u2',
        konteks: null,
        barisan_display: '50, 46, 42, 38, ...',
        question: 'Tentukan <strong>U₈</strong> dari barisan 50, 46, 42, 38, ...',
        a: 50,
        b: -4,
        n: 8,
        answer: 22,
        hints: [
          'Barisan ini menurun. Hitung beda: b = 46 − 50 = −4. Gunakan Uₙ = a + (n−1)b dengan n = 8.',
          'U₈ = 50 + (8−1) × (−4) = 50 + 7 × (−4) = 50 + ... Hitung 7 × (−4) terlebih dahulu.',
        ],
        explanation:
          'U₈ = 50 + (8−1)×(−4) = 50 + (−28) = <strong>22</strong>. Beda negatif → barisan menurun.',
      },
      {
        id: 'u3',
        konteks: 'Biaya hosting server naik Rp 50.000 per bulan, mulai dari Rp 200.000.',
        barisan_display: '200, 250, 300, 350, ... (ribu rupiah)',
        question: 'Berapa biaya hosting di <strong>bulan ke-12</strong>?',
        a: 200,
        b: 50,
        n: 12,
        answer: 750,
        hints: [
          'a = 200 (biaya bulan pertama, dalam ribu), b = 50 (kenaikan tiap bulan). Cari U₁₂.',
          'U₁₂ = 200 + (12−1) × 50 = 200 + 11 × 50 = 200 + ... Berapa 11 × 50?',
        ],
        explanation:
          'U₁₂ = 200 + (12−1)×50 = 200 + 550 = <strong>750</strong> (ribu rupiah). Biaya bulan ke-12 adalah Rp 750.000.',
      },
      {
        id: 'u4',
        konteks: null,
        barisan_display: '5, 12, 19, 26, ...',
        question: 'Diketahui a = 5 dan b = 7. Tentukan <strong>U₂₀</strong>.',
        a: 5,
        b: 7,
        n: 20,
        answer: 138,
        hints: [
          'Gunakan langsung rumus Uₙ = a + (n−1)b dengan a=5, b=7, n=20.',
          'U₂₀ = 5 + (20−1) × 7 = 5 + 19 × 7 = 5 + ... Hitung 19 × 7 = ?',
        ],
        explanation: 'U₂₀ = 5 + (20−1)×7 = 5 + 19×7 = 5 + 133 = <strong>138</strong>.',
      },
      {
        id: 'u5',
        konteks:
          'Dika menulis laporan magang. Hari pertama ia menulis 15 baris kode, setiap hari bertambah 8 baris.',
        barisan_display: '15, 23, 31, 39, ...',
        question: 'Berapa baris kode yang ditulis Dika di <strong>hari ke-15</strong>?',
        a: 15,
        b: 8,
        n: 15,
        answer: 127,
        hints: [
          'a = 15 (hari pertama), b = 8 (tambahan per hari). Cari U₁₅.',
          'U₁₅ = 15 + (15−1) × 8 = 15 + 14 × 8 = 15 + ... Berapa 14 × 8?',
        ],
        explanation:
          'U₁₅ = 15 + (15−1)×8 = 15 + 14×8 = 15 + 112 = <strong>127</strong> baris kode.',
      },
      {
        id: 'u6',
        konteks: null,
        barisan_display: '100, 95, 90, 85, ...',
        question: 'Pada suku keberapa barisan 100, 95, 90, 85, ... bernilai <strong>55</strong>?',
        a: 100,
        b: -5,
        n: null,
        answer: 10,
        hints: [
          'Gunakan Uₙ = a + (n−1)b, set Uₙ = 55. Jadi: 55 = 100 + (n−1)×(−5). Selesaikan untuk n.',
          '55 − 100 = (n−1)×(−5) → −45 = (n−1)×(−5) → n−1 = −45 ÷ (−5) = 9 → n = ?',
        ],
        explanation:
          '55 = 100 + (n−1)×(−5) → −45 = (n−1)×(−5) → n−1 = 9 → n = <strong>10</strong>. Jadi U₁₀ = 55.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 5 — EKSPLORASI Sₙ
     ---------------------------------------------------------- */
  ekspSn: {
    title: 'Menemukan Rumus Jumlah n Suku Pertama (Sₙ)',
    instruction:
      'Kita akan menemukan rumus Sₙ dengan trik yang digunakan matematikawan Carl Friedrich Gauss.',
    barisan: [3, 7, 11, 15, 19, 23, 27, 31],
    a: 3,
    b: 4,
    n_demo: 8,
    un_demo: 31,
    Sn_demo: 136,
    steps: [
      {
        id: 'g1',
        title: 'Tulis Deret Maju',
        desc: 'S₈ = 3 + 7 + 11 + 15 + 19 + 23 + 27 + 31',
      },
      {
        id: 'g2',
        title: 'Tulis Deret Mundur',
        desc: 'S₈ = 31 + 27 + 23 + 19 + 15 + 11 + 7 + 3',
      },
      {
        id: 'g3',
        title: 'Jumlahkan Keduanya',
        desc: '2S₈ = 34 + 34 + 34 + 34 + 34 + 34 + 34 + 34 = 8 × 34 = 272',
      },
      {
        id: 'g4',
        title: 'Bagi Dua',
        desc: 'S₈ = 272 ÷ 2 = 136',
      },
    ],
    gaussQuestion: {
      question:
        'Perhatikan: 34 = 3 + 31 = a + U₈ = a + Uₙ. Jadi 2Sₙ = n × (a + Uₙ). Karena Uₙ = a + (n−1)b, maka:',
      formula: 'Sₙ = n/2 × (2a + (n−1)b)',
      alt: 'atau: Sₙ = n/2 × (a + Uₙ)',
    },
    verifikasi: {
      question:
        'Verifikasi: Gunakan rumus untuk menghitung S₈ pada barisan di atas (a=3, b=4, n=8).',
      answer: 136,
      hint: 'S₈ = 8/2 × (2×3 + (8−1)×4) = 4 × (6 + 28) = 4 × 34 = ?',
      explanation:
        'S₈ = 8/2 × (2×3 + 7×4) = 4 × (6 + 28) = 4 × 34 = <strong>136</strong>. ✓ Sesuai dengan cara langsung!',
    },
  },

  /* ----------------------------------------------------------
     TAHAP 6 — LATIHAN Sₙ
     ---------------------------------------------------------- */
  latihanSn: {
    title: 'Latihan Menghitung Jumlah n Suku Pertama',
    instruction: 'Hitung nilai Sₙ yang diminta. Gunakan rumus Sₙ = n/2 × (2a + (n−1)b).',
    soal: [
      {
        id: 's1',
        barisan_display: '2, 5, 8, 11, ...',
        question: 'Tentukan <strong>S₁₀</strong> dari barisan 2, 5, 8, 11, ...',
        a: 2,
        b: 3,
        n: 10,
        answer: 155,
        hints: [
          'a = 2, b = 3. Gunakan Sₙ = n/2 × (2a + (n−1)b) dengan n=10.',
          'S₁₀ = 10/2 × (2×2 + (10−1)×3) = 5 × (4 + 27) = 5 × ... Berapa 4 + 27?',
        ],
        explanation: 'S₁₀ = 10/2 × (2×2 + 9×3) = 5 × (4 + 27) = 5 × 31 = <strong>155</strong>.',
      },
      {
        id: 's2',
        barisan_display: '4, 8, 12, 16, ...',
        question: 'Tentukan <strong>S₁₅</strong> dari barisan 4, 8, 12, 16, ...',
        a: 4,
        b: 4,
        n: 15,
        answer: 480,
        hints: [
          'a = 4, b = 4. Gunakan Sₙ = n/2 × (2a + (n−1)b) dengan n=15.',
          'S₁₅ = 15/2 × (2×4 + (15−1)×4) = 7,5 × (8 + 56) = 7,5 × ... Berapa 8 + 56?',
        ],
        explanation:
          'S₁₅ = 15/2 × (2×4 + 14×4) = 7,5 × (8 + 56) = 7,5 × 64 = <strong>480</strong>.',
      },
      {
        id: 's3',
        barisan_display: '100, 95, 90, 85, ...',
        question: 'Tentukan <strong>S₁₀</strong> dari barisan 100, 95, 90, 85, ...',
        a: 100,
        b: -5,
        n: 10,
        answer: 775,
        hints: [
          'Barisan menurun: a = 100, b = −5. Gunakan Sₙ = n/2 × (2a + (n−1)b) dengan n=10.',
          'S₁₀ = 10/2 × (2×100 + (10−1)×(−5)) = 5 × (200 + (−45)) = 5 × ... Berapa 200 − 45?',
        ],
        explanation:
          'S₁₀ = 10/2 × (200 + 9×(−5)) = 5 × (200 − 45) = 5 × 155 = <strong>775</strong>.',
      },
      {
        id: 's4',
        barisan_display: '10, 13, 16, 19, ...',
        question: 'Tentukan <strong>S₁₂</strong> dari barisan 10, 13, 16, 19, ...',
        a: 10,
        b: 3,
        n: 12,
        answer: 318,
        hints: [
          'a = 10, b = 3. Gunakan Sₙ = n/2 × (2a + (n−1)b) dengan n=12.',
          'S₁₂ = 12/2 × (2×10 + (12−1)×3) = 6 × (20 + 33) = 6 × ... Berapa 20 + 33?',
        ],
        explanation: 'S₁₂ = 12/2 × (2×10 + 11×3) = 6 × (20 + 33) = 6 × 53 = <strong>318</strong>.',
      },
      {
        id: 's5',
        barisan_display: '1, 3, 5, 7, ...',
        question:
          'Tentukan jumlah 20 bilangan ganjil pertama: <strong>S₂₀</strong> dari 1, 3, 5, 7, ...',
        a: 1,
        b: 2,
        n: 20,
        answer: 400,
        hints: [
          'Barisan bilangan ganjil: a = 1, b = 2. Cari S₂₀.',
          'S₂₀ = 20/2 × (2×1 + (20−1)×2) = 10 × (2 + 38) = 10 × ... Berapa 2 + 38?',
        ],
        explanation:
          'S₂₀ = 20/2 × (2 + 19×2) = 10 × (2 + 38) = 10 × 40 = <strong>400</strong>. Menarik: jumlah n bilangan ganjil pertama selalu = n²!',
      },
      {
        id: 's6',
        barisan_display: '50, 45, 40, 35, ...',
        question: 'Diketahui a = 50 dan b = −5. Tentukan <strong>S₈</strong>.',
        a: 50,
        b: -5,
        n: 8,
        answer: 260,
        hints: [
          'a = 50, b = −5. Gunakan Sₙ = n/2 × (2a + (n−1)b) dengan n=8.',
          'S₈ = 8/2 × (2×50 + (8−1)×(−5)) = 4 × (100 − 35) = 4 × ... Berapa 100 − 35?',
        ],
        explanation: 'S₈ = 8/2 × (100 + 7×(−5)) = 4 × (100 − 35) = 4 × 65 = <strong>260</strong>.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 7 — TANTANGAN KONTEKSTUAL
     ---------------------------------------------------------- */
  tantangan: {
    title: 'Tantangan Kontekstual',
    soal: [
      {
        id: 't1',
        badge: 'Biaya Berlangganan',
        icon: '📱',
        story:
          'Platform streaming populer menaikkan harga langganannya setiap bulan. Bulan pertama harganya <strong>Rp 50.000</strong>. Setiap bulan harga naik <strong>Rp 5.000</strong>.',
        question: 'Berapa biaya langganan di <strong>bulan ke-8</strong>?',
        type: 'input',
        answer: 85000,
        unit: 'rupiah',
        hint: 'Ini adalah masalah barisan aritmetika. a = 50.000, b = 5.000, n = 8. Gunakan Uₙ = a + (n−1)b.',
        explanation: 'U₈ = 50.000 + (8−1) × 5.000 = 50.000 + 35.000 = <strong>Rp 85.000</strong>.',
      },
      {
        id: 't2',
        badge: 'Storage Server',
        icon: '💾',
        story:
          'Kapasitas server tim RPL bertambah <strong>20 GB</strong> setiap bulan. Kapasitas awal di bulan pertama adalah <strong>100 GB</strong>.',
        question:
          'Berapa <strong>total kapasitas</strong> yang digunakan selama <strong>10 bulan</strong> pertama?',
        type: 'input',
        answer: 1900,
        unit: 'GB',
        hint: 'Ini adalah masalah deret aritmetika (jumlah kapasitas 10 bulan). a = 100, b = 20, n = 10. Gunakan Sₙ = n/2 × (2a + (n−1)b).',
        explanation:
          'S₁₀ = 10/2 × (2×100 + 9×20) = 5 × (200 + 180) = 5 × 380 = <strong>1.900 GB</strong>.',
      },
      {
        id: 't3',
        badge: 'Gaji Magang',
        icon: '💼',
        story:
          'Dika magang di perusahaan teknologi selama 6 bulan. Gaji bulan pertamanya <strong>Rp 1.200.000</strong> dan setiap bulan naik <strong>Rp 150.000</strong>.',
        question: 'Berapa <strong>total gaji</strong> yang diterima Dika selama 6 bulan magang?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: 'Rp 7.200.000' },
          { id: 'opt_b', label: 'Rp 9.450.000' },
          { id: 'opt_c', label: 'Rp 10.200.000' },
        ],
        correct: 'opt_b',
        hint: 'Gunakan Sₙ = n/2 × (2a + (n−1)b) dengan a = 1.200.000, b = 150.000, n = 6.',
        explanation:
          'S₆ = 6/2 × (2×1.200.000 + 5×150.000) = 3 × (2.400.000 + 750.000) = 3 × 3.150.000 = <strong>Rp 9.450.000</strong>.',
      },
      {
        id: 't4',
        badge: 'Bug Report',
        icon: '🐛',
        story:
          'Tim QA mencatat jumlah bug yang ditemukan per sprint. Sprint ke-1 ada <strong>25 bug</strong>, dan setiap sprint berkurang <strong>3 bug</strong> (tim makin mahir!).',
        question: 'Pada sprint keberapa jumlah bug menjadi <strong>7</strong>?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: 'Sprint ke-6' },
          { id: 'opt_b', label: 'Sprint ke-7' },
          { id: 'opt_c', label: 'Sprint ke-8' },
        ],
        correct: 'opt_b',
        hint: 'Gunakan Uₙ = a + (n−1)b, set Uₙ = 7. a = 25, b = −3. Selesaikan: 7 = 25 + (n−1)×(−3).',
        explanation:
          '7 = 25 + (n−1)×(−3) → −18 = (n−1)×(−3) → n−1 = 6 → n = <strong>7</strong>. Jadi pada sprint ke-7, jumlah bug menjadi 7.',
      },
    ],
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
        question:
          'Dengan kata-katamu sendiri, jelaskan apa yang dimaksud dengan <strong>barisan aritmetika</strong> dan apa itu <strong>beda (b)</strong>.',
        placeholder: 'Tuliskan penjelasanmu...',
      },
      {
        id: 'r2',
        question:
          'Bagaimana kamu mengingat rumus <strong>Uₙ = a + (n−1)b</strong>? Strategi apa yang kamu pakai?',
        placeholder: 'Ceritakan strategimu...',
      },
      {
        id: 'r3',
        question:
          'Berikan satu contoh <strong>barisan aritmetika</strong> dari kehidupan sehari-hari sebagai pelajar SMK RPL yang belum disebutkan dalam media ini.',
        placeholder: 'Contohmu...',
      },
      {
        id: 'r4',
        question:
          'Hal apa yang masih membingungkan atau ingin kamu pelajari lebih lanjut tentang barisan dan deret?',
        placeholder: 'Tuliskan pertanyaan atau kesulitanmu...',
      },
    ],
  },
};
