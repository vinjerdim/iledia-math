'use strict';

/* ============================================================
   data.js — Konten pembelajaran
   Matematika: Bunga Tunggal dan Bunga Majemuk
   Fase F — SMK Rekayasa Perangkat Lunak
   ============================================================ */

var DATA = {
  meta: {
    title: 'Bunga Tunggal dan Bunga Majemuk',
    subject: 'Matematika — Fase F (SMK RPL)',
    goal: 'Saya dapat menjelaskan konsep bunga tunggal dan bunga majemuk serta membedakan karakteristik keduanya berdasarkan keterkaitannya dengan pola barisan aritmetika dan geometri.',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — EKSPLORASI BUNGA TUNGGAL
     ---------------------------------------------------------- */
  eksplorasiBT: {
    title: 'Mengenal Pola Bunga Tunggal',
    instruction:
      'Tekan tombol untuk mengungkap nilai uang di setiap akhir tahun. Amati pola kenaikannya, lalu identifikasi suku pertama (a) dan kenaikan tetap (b).',
    konteks: [
      {
        id: 'bt1',
        badge: 'Tabungan Koperasi',
        icon: '🏫',
        story:
          'Fauzan menyimpan <strong>Rp 1.000.000</strong> di koperasi sekolah. Koperasi memberi <strong>bunga tunggal 10% per tahun</strong> — dihitung selalu dari modal awal, bukan dari saldo.',
        terms: [1000000, 1100000, 1200000, 1300000, 1400000, 1500000],
        labels: ['Awal', 'Thn 1', 'Thn 2', 'Thn 3', 'Thn 4', 'Thn 5'],
        unit: 'rupiah',
        a: 1000000,
        b: 100000,
        hint_a: 'Suku pertama (a) = modal awal = nilai uang pada "Awal".',
        hint_b:
          'Bunga per tahun = 10% × Rp 1.000.000 = Rp 100.000 (selalu sama karena dihitung dari modal awal!).',
      },
      {
        id: 'bt2',
        badge: 'Pinjaman Usaha',
        icon: '🏪',
        story:
          'Ibu Rani meminjam <strong>Rp 2.000.000</strong> untuk modal warung dengan <strong>bunga tunggal 5% per tahun</strong> dari pokok pinjaman awal.',
        terms: [2000000, 2100000, 2200000, 2300000, 2400000, 2500000],
        labels: ['Awal', 'Thn 1', 'Thn 2', 'Thn 3', 'Thn 4', 'Thn 5'],
        unit: 'rupiah',
        a: 2000000,
        b: 100000,
        hint_a: 'Suku pertama (a) = modal awal = total pinjaman di awal.',
        hint_b: 'Bunga per tahun = 5% × Rp 2.000.000 = Rp 100.000 (tetap karena bunga tunggal).',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 3 — RUMUS BUNGA TUNGGAL
     ---------------------------------------------------------- */
  rumusBT: {
    title: 'Menemukan Rumus Bunga Tunggal',
    instruction:
      'Amati tabel pola di bawah ini untuk menemukan rumus Mₙ = M₀(1 + n·i), lalu hubungkan dengan rumus barisan aritmetika.',
    modal: 1000000,
    bunga_persen: 10,
    beda: 100000,
    konteks: 'Tabungan koperasi Fauzan: M₀ = Rp 1.000.000, i = 10%, b = Rp 100.000',
    tableRows: [
      { n: 0, bentuk: 'M₀', expanded: '1.000.000', Mn: 1000000 },
      { n: 1, bentuk: 'M₀ + 1×(M₀·i)', expanded: '1.000.000 + 1×100.000', Mn: 1100000 },
      { n: 2, bentuk: 'M₀ + 2×(M₀·i)', expanded: '1.000.000 + 2×100.000', Mn: 1200000 },
      { n: 3, bentuk: 'M₀ + 3×(M₀·i)', expanded: '1.000.000 + 3×100.000', Mn: 1300000 },
      { n: 4, bentuk: 'M₀ + 4×(M₀·i)', expanded: '1.000.000 + 4×100.000', Mn: 1400000 },
      { n: 'n', bentuk: 'M₀ + n×(M₀·i)', expanded: 'M₀(1 + n·i)', Mn: null },
    ],
    steps: [
      {
        id: 'bt_s1',
        question:
          'Lanjutkan pola tabel. Berapa nilai <strong>M₅</strong> (tabungan di akhir tahun ke-5)?',
        answer: '1500000',
        hint: 'M₅ = M₀ + 5×(M₀×i) = 1.000.000 + 5×100.000 = 1.000.000 + 500.000 = ?',
        explanation:
          'M₅ = 1.000.000 + 5×100.000 = <strong>Rp 1.500.000</strong>. Tiap tahun naik Rp 100.000 — ini adalah beda (b) dalam barisan aritmetika!',
      },
      {
        id: 'bt_s2',
        question:
          'Gunakan rumus Mₙ = M₀(1 + n·i). Berapa nilai <strong>M₈</strong> (tabungan di akhir tahun ke-8)?',
        answer: '1800000',
        hint: 'M₈ = 1.000.000 × (1 + 8 × 0,10) = 1.000.000 × (1 + 0,8) = 1.000.000 × 1,8 = ?',
        explanation:
          'M₈ = 1.000.000 × (1 + 8×0,10) = 1.000.000 × 1,8 = <strong>Rp 1.800.000</strong>.',
      },
    ],
    koneksiArtimatika: {
      penjelasan: 'Barisan M₀, M₁, M₂, M₃, ... adalah <strong>barisan aritmetika</strong> dengan:',
      poin: [
        'Suku pertama <strong>a = M₀</strong> (modal awal)',
        'Beda <strong>b = M₀ × i</strong> (bunga per periode — selalu sama!)',
        'Rumus suku ke-n: Mₙ = M₀ + n×b = M₀(1 + n·i)',
      ],
    },
  },

  /* ----------------------------------------------------------
     TAHAP 4 — EKSPLORASI BUNGA MAJEMUK
     ---------------------------------------------------------- */
  eksplorasiBM: {
    title: 'Mengenal Pola Bunga Majemuk',
    instruction:
      'Tekan tombol untuk mengungkap nilai di setiap periode. Amati pola rasionya, lalu identifikasi suku pertama (a) dan rasio (r).',
    konteks: [
      {
        id: 'bm1',
        badge: 'Pertumbuhan Pengguna App',
        icon: '📱',
        story:
          'Tim RPL meluncurkan aplikasi mobile. Bulan ke-0 ada <strong>500 pengguna</strong>. Setiap bulan jumlah pengguna berlipat dua — ini mencerminkan <strong>bunga majemuk 100% per bulan</strong> (r = 2).',
        terms: [500, 1000, 2000, 4000, 8000, 16000],
        labels: ['Bln 0', 'Bln 1', 'Bln 2', 'Bln 3', 'Bln 4', 'Bln 5'],
        unit: 'pengguna',
        a: 500,
        r: 2,
        hint_a: 'Suku pertama (a) = jumlah pengguna awal saat Bln 0.',
        hint_r: 'Hitung: 1.000 ÷ 500 = ? Cek juga: 2.000 ÷ 1.000 = ? Apakah rasionya selalu sama?',
      },
      {
        id: 'bm2',
        badge: 'Konten Video Viral',
        icon: '🔥',
        story:
          'Video tutorial RPL menjadi viral. Jam ke-0 ditonton <strong>50 orang</strong>. Setiap jam jumlah penonton menjadi <strong>3 kali lipat</strong> — ini mencerminkan bunga majemuk dengan r = 3.',
        terms: [50, 150, 450, 1350, 4050, 12150],
        labels: ['Jam 0', 'Jam 1', 'Jam 2', 'Jam 3', 'Jam 4', 'Jam 5'],
        unit: 'penonton',
        a: 50,
        r: 3,
        hint_a: 'Suku pertama (a) = jumlah penonton awal di Jam 0.',
        hint_r: 'Hitung: 150 ÷ 50 = ? Cek juga: 450 ÷ 150 = ? Apakah rasionya selalu sama?',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 5 — RUMUS BUNGA MAJEMUK
     ---------------------------------------------------------- */
  rumusBM: {
    title: 'Menemukan Rumus Bunga Majemuk',
    instruction:
      'Amati tabel pola di bawah ini untuk menemukan rumus Mₙ = M₀ × rⁿ, lalu hubungkan dengan rumus barisan geometri.',
    modal: 500,
    rasio: 2,
    konteks: 'Pengguna aplikasi RPL: M₀ = 500, r = 2 (berlipat dua tiap bulan)',
    tableRows: [
      { n: 0, bentuk: 'M₀', expanded: '500', Mn: 500 },
      { n: 1, bentuk: 'M₀ × r¹', expanded: '500 × 2¹', Mn: 1000 },
      { n: 2, bentuk: 'M₀ × r²', expanded: '500 × 2²', Mn: 2000 },
      { n: 3, bentuk: 'M₀ × r³', expanded: '500 × 2³', Mn: 4000 },
      { n: 4, bentuk: 'M₀ × r⁴', expanded: '500 × 2⁴', Mn: 8000 },
      { n: 'n', bentuk: 'M₀ × rⁿ', expanded: 'M₀ × rⁿ', Mn: null },
    ],
    steps: [
      {
        id: 'bm_s1',
        question:
          'Lanjutkan pola tabel. Berapa nilai <strong>M₅</strong> (pengguna di bulan ke-5)?',
        answer: '16000',
        hint: 'M₅ = 500 × 2⁵ = 500 × 32 = ?',
        explanation:
          'M₅ = 500 × 2⁵ = 500 × 32 = <strong>16.000 pengguna</strong>. Bandingkan dengan bunga tunggal — pertumbuhannya jauh lebih cepat!',
      },
      {
        id: 'bm_s2',
        question:
          'Gunakan rumus Mₙ = M₀ × rⁿ. Berapa nilai <strong>M₇</strong> (pengguna di bulan ke-7)?',
        answer: '64000',
        hint: 'M₇ = 500 × 2⁷ = 500 × 128 = ?',
        explanation:
          'M₇ = 500 × 2⁷ = 500 × 128 = <strong>64.000 pengguna</strong>. Pertumbuhan eksponensial!',
      },
    ],
    koneksiGeometri: {
      penjelasan: 'Barisan M₀, M₁, M₂, M₃, ... adalah <strong>barisan geometri</strong> dengan:',
      poin: [
        'Suku pertama <strong>a = M₀</strong> (modal/nilai awal)',
        'Rasio <strong>r = (1 + i)</strong> — perbandingan antar suku selalu sama!',
        'Rumus suku ke-n: Mₙ = M₀ × rⁿ = M₀ × (1 + i)ⁿ',
      ],
    },
  },

  /* ----------------------------------------------------------
     TAHAP 6 — PERBANDINGAN INTERAKTIF
     ---------------------------------------------------------- */
  perbandingan: {
    title: 'Bunga Tunggal vs. Bunga Majemuk',
    instruction:
      'Amati perbedaan pertumbuhan uang antara bunga tunggal (aritmetika) dan bunga majemuk (geometri) untuk modal dan suku bunga yang sama.',
    contohModal: 1000000,
    contohBunga: 10,
    tableData: [
      { n: 1, bt: 1100000, bm: 1100000 },
      { n: 2, bt: 1200000, bm: 1210000 },
      { n: 3, bt: 1300000, bm: 1331000 },
      { n: 4, bt: 1400000, bm: 1464100 },
      { n: 5, bt: 1500000, bm: 1610510 },
      { n: 6, bt: 1600000, bm: 1771561 },
      { n: 7, bt: 1700000, bm: 1948717 },
      { n: 8, bt: 1800000, bm: 2143589 },
      { n: 9, bt: 1900000, bm: 2357948 },
      { n: 10, bt: 2000000, bm: 2593742 },
    ],
    kunciPerbedaan: [
      '<strong>Bunga Tunggal</strong>: bunga dihitung dari <em>modal awal</em> setiap periode → kenaikan tetap (linear) → barisan ARITMETIKA.',
      '<strong>Bunga Majemuk</strong>: bunga dihitung dari <em>saldo terkini</em> (modal + bunga sebelumnya) → kenaikan semakin besar (eksponensial) → barisan GEOMETRI.',
      'Keduanya menghasilkan nilai yang sama di periode ke-1, namun BM selalu <em>lebih besar</em> setelah itu.',
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 7 — LATIHAN CAMPURAN
     ---------------------------------------------------------- */
  latihan: {
    title: 'Latihan Campuran',
    instruction:
      'Kerjakan soal-soal berikut. Gunakan rumus yang sesuai — Mₙ = M₀(1+n·i) untuk BT, dan Mₙ = M₀·rⁿ untuk BM.',
    soal: [
      {
        id: 'l1',
        tipe: 'bt',
        tipeBadge: 'Bunga Tunggal',
        konteks: 'Siti mendepositokan Rp 4.000.000 dengan bunga tunggal 5% per tahun.',
        question: 'Berapa nilai depositonya setelah <strong>6 tahun</strong>?',
        type: 'input',
        answer: 5200000,
        unit: 'rupiah',
        hints: [
          'Gunakan Mₙ = M₀(1 + n·i) dengan M₀ = 4.000.000, i = 0,05, n = 6.',
          'M₆ = 4.000.000 × (1 + 6 × 0,05) = 4.000.000 × (1 + 0,30) = 4.000.000 × 1,3 = ?',
        ],
        explanation:
          'M₆ = 4.000.000 × (1 + 6×0,05) = 4.000.000 × 1,3 = <strong>Rp 5.200.000</strong>.',
      },
      {
        id: 'l2',
        tipe: 'bt',
        tipeBadge: 'Bunga Tunggal',
        konteks: 'Orang tua Budi meminjam Rp 2.500.000 dengan bunga tunggal 8% per tahun.',
        question: 'Berapa kenaikan bunga tetap <strong>(beda b)</strong> setiap tahunnya?',
        type: 'input',
        answer: 200000,
        unit: 'rupiah',
        hints: [
          'Beda (b) = M₀ × i = modal awal × suku bunga per tahun.',
          'b = 2.500.000 × 0,08 = ?',
        ],
        explanation:
          'b = 2.500.000 × 0,08 = <strong>Rp 200.000</strong>. Setiap tahun nilai pinjaman bertambah Rp 200.000.',
      },
      {
        id: 'l3',
        tipe: 'bm',
        tipeBadge: 'Bunga Majemuk',
        konteks:
          'Sebuah startup mendapat investasi awal Rp 500 juta. Nilai investasi berlipat dua setiap tahun (r = 2).',
        question: 'Berapa nilai investasi (dalam jutaan rupiah) setelah <strong>5 tahun</strong>?',
        type: 'input',
        answer: 16000,
        unit: 'juta rupiah',
        hints: [
          'Gunakan Mₙ = M₀ × rⁿ dengan M₀ = 500, r = 2, n = 5.',
          'M₅ = 500 × 2⁵ = 500 × 32 = ?',
        ],
        explanation:
          'M₅ = 500 × 2⁵ = 500 × 32 = <strong>16.000 juta rupiah</strong> (Rp 16 miliar)!',
      },
      {
        id: 'l4',
        tipe: 'bm',
        tipeBadge: 'Bunga Majemuk',
        konteks: 'Dika menabung Rp 1.000.000 di bank dengan bunga majemuk 10% per tahun.',
        question: 'Berapa nilai tabungan Dika setelah <strong>2 tahun</strong>?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: 'Rp 1.200.000 (BT: 1.000.000 × 1,2)' },
          { id: 'opt_b', label: 'Rp 1.210.000 (BM: 1.000.000 × 1,1²)' },
          { id: 'opt_c', label: 'Rp 1.100.000 (hanya tahun ke-1)' },
        ],
        correct: 'opt_b',
        hint: 'Bunga majemuk: Mₙ = M₀ × (1+i)ⁿ. M₂ = 1.000.000 × (1,10)² = 1.000.000 × 1,21 = ?',
        explanation:
          'M₂ = 1.000.000 × (1,10)² = 1.000.000 × 1,21 = <strong>Rp 1.210.000</strong>. Berbeda dengan BT yang hanya Rp 1.200.000!',
      },
      {
        id: 'l5',
        tipe: 'identifikasi',
        tipeBadge: 'Identifikasi Tipe',
        konteks: null,
        question:
          'Seorang nasabah mencatat nilai tabungannya: <strong>500.000 → 600.000 → 720.000 → 864.000</strong>. Termasuk jenis bunga apa?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: 'Bunga Tunggal (barisan aritmetika)' },
          { id: 'opt_b', label: 'Bunga Majemuk (barisan geometri)' },
          { id: 'opt_c', label: 'Tidak bisa ditentukan' },
        ],
        correct: 'opt_b',
        hint: 'Cek beda: 600.000−500.000=100.000, 720.000−600.000=120.000 (tidak sama). Cek rasio: 600.000÷500.000=1,2, 720.000÷600.000=1,2 (sama!). Ini barisan geometri.',
        explanation:
          'Rasio: 600÷500 = 720÷600 = 864÷720 = <strong>1,2</strong> (konstan). Ini barisan <strong>geometri → Bunga Majemuk</strong> dengan r = 1,2 (i = 20% per periode).',
      },
      {
        id: 'l6',
        tipe: 'identifikasi',
        tipeBadge: 'Bandingkan',
        konteks: null,
        question:
          'Raka memiliki dua pilihan tabungan selama 3 tahun, modal Rp 10.000.000, bunga 20%/tahun. Mana yang menghasilkan lebih banyak?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: 'Pilihan A — Bunga Tunggal: Rp 16.000.000' },
          { id: 'opt_b', label: 'Pilihan B — Bunga Majemuk: Rp 17.280.000' },
          { id: 'opt_c', label: 'Sama saja, hasil keduanya identik' },
        ],
        correct: 'opt_b',
        hint: 'BT: M₃ = 10.000.000 × (1 + 3×0,2) = 10.000.000 × 1,6 = 16.000.000. BM: M₃ = 10.000.000 × (1,2)³ = 10.000.000 × 1,728 = 17.280.000.',
        explanation:
          'BT: 10.000.000 × 1,6 = <strong>Rp 16.000.000</strong>. BM: 10.000.000 × 1,728 = <strong>Rp 17.280.000</strong>. Pilihan B (<strong>Bunga Majemuk</strong>) lebih menguntungkan!',
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
          'Dengan kata-katamu sendiri, jelaskan <strong>perbedaan mendasar</strong> antara cara menghitung bunga tunggal dan bunga majemuk.',
        placeholder: 'Tuliskan penjelasanmu...',
      },
      {
        id: 'r2',
        question:
          'Mengapa bunga tunggal berkaitan dengan <strong>barisan aritmetika</strong>? Apa yang menjadi "beda (b)"-nya?',
        placeholder: 'Ceritakan pemahamanmu...',
      },
      {
        id: 'r3',
        question:
          'Mengapa bunga majemuk berkaitan dengan <strong>barisan geometri</strong>? Apa yang menjadi "rasio (r)"-nya?',
        placeholder: 'Ceritakan pemahamanmu...',
      },
      {
        id: 'r4',
        question:
          'Sebagai calon pengembang aplikasi fintech, kapan kamu akan menggunakan rumus bunga tunggal dan kapan bunga majemuk? Berikan contoh fitur aplikasinya.',
        placeholder: 'Tuliskan ide aplikasimu...',
      },
    ],
  },
};
