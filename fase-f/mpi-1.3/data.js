'use strict';
/* =========================================================================
   MPI 1.3 — Learning Content Data
   All educational content separated from application logic.
   Mata Pelajaran: Matematika Fase F
   TP: Menganalisis dan Membedakan Pola Aritmetika dan Geometri
   ========================================================================= */

/* -------------------------------------------------------------------------
   EXPLORATION CASES
   Two side-by-side contextual cases for student pattern identification.
   No labels given — students must identify the pattern from data structure.
   Case A: Arithmetic (constant difference = 150.000)
   Case B: Geometric  (constant ratio   = 1.5)
   ------------------------------------------------------------------------- */
const CASES = {
  caseA: {
    id: 'caseA',
    title: 'Kasus 1: Program Tabungan Bersama',
    context: `Sekelompok siswa SMK membuat program tabungan bersama. Setiap bulan, seluruh anggota menyumbang dana secara rutin. Berikut catatan total tabungan kelompok mereka:`,
    periodLabel: 'Bulan ke-',
    valueLabel: 'Total Tabungan (Rp)',
    data: [
      { period: 1, value: 200000 },
      { period: 2, value: 350000 },
      { period: 3, value: 500000 },
      { period: 4, value: 650000 },
      { period: 5, value: 800000 },
    ],
    variables: [
      { key: 'Nilai awal (bulan pertama)', value: 'Rp200.000' },
      { key: 'Pola perubahan', value: '?' },
    ],
    guideQuestion: 'Hitung selisih antar nilai dari bulan ke bulan. Apakah selisihnya selalu sama?',
    correctPattern: 'arithmetic',
    correctIndicators: ['difference', 'equal_addition'],
    difference: 150000,
    ratio: null,
  },
  caseB: {
    id: 'caseB',
    title: 'Kasus 2: Dana Usaha dengan Reinvestasi',
    context: `Kelompok siswa lain mengelola dana usaha. Mereka mereinvestasikan sebagian keuntungan sehingga dana terus berkembang setiap bulan. Berikut perkembangan dana usaha mereka:`,
    periodLabel: 'Bulan ke-',
    valueLabel: 'Dana Usaha (Rp)',
    data: [
      { period: 1, value: 400000 },
      { period: 2, value: 600000 },
      { period: 3, value: 900000 },
      { period: 4, value: 1350000 },
      { period: 5, value: 2025000 },
    ],
    variables: [
      { key: 'Nilai awal (bulan pertama)', value: 'Rp400.000' },
      { key: 'Pola perubahan', value: '?' },
    ],
    guideQuestion: 'Coba hitung: hasil bagi nilai bulan ini dengan nilai bulan sebelumnya. Apakah hasilnya selalu sama?',
    correctPattern: 'geometric',
    correctIndicators: ['ratio', 'growing_fast'],
    difference: null,
    ratio: 1.5,
  },
};

/* -------------------------------------------------------------------------
   PATTERN INDICATOR OPTIONS
   Students select ONE indicator per case to justify their pattern choice.
   ------------------------------------------------------------------------- */
const INDICATORS = [
  {
    id: 'difference',
    label: 'Selisih antar suku selalu sama (beda tetap, +d)',
    correctFor: 'arithmetic',
  },
  {
    id: 'ratio',
    label: 'Rasio antar suku selalu sama (perbandingan tetap, ×r)',
    correctFor: 'geometric',
  },
  {
    id: 'growing_fast',
    label: 'Pertambahan nilai semakin besar setiap periodenya',
    correctFor: 'geometric',
  },
  {
    id: 'equal_addition',
    label: 'Setiap periode bertambah dengan jumlah yang sama persis',
    correctFor: 'arithmetic',
  },
];

/* -------------------------------------------------------------------------
   COMPARISON CLASSIFICATION CARDS
   Students sort each characteristic into Aritmetika or Geometri.
   ------------------------------------------------------------------------- */
const COMPARISON_CARDS = [
  {
    id: 'cc1',
    text: 'Setiap suku diperoleh dengan menambahkan bilangan tetap (+d)',
    correct: 'arithmetic',
  },
  {
    id: 'cc2',
    text: 'Setiap suku diperoleh dengan mengalikan bilangan tetap (×r)',
    correct: 'geometric',
  },
  {
    id: 'cc3',
    text: 'Grafik pertumbuhan membentuk garis lurus',
    correct: 'arithmetic',
  },
  {
    id: 'cc4',
    text: 'Grafik pertumbuhan membentuk kurva melengkung ke atas',
    correct: 'geometric',
  },
  {
    id: 'cc5',
    text: 'Rumus: Uₙ = a + (n − 1)d',
    correct: 'arithmetic',
  },
  {
    id: 'cc6',
    text: 'Rumus: Uₙ = a × r ⁽ⁿ⁻¹⁾',
    correct: 'geometric',
  },
];

/* -------------------------------------------------------------------------
   BRANCHING SCENARIO
   "Pemilihan Rencana Keuangan Usaha Kecil SMK"
   Plan A: Arithmetic  (a=500000, d=250000)
   Plan B: Geometric   (a=500000, r=1.3)
   Target: month 12
   A(12) = 500000 + 11×250000 = 3.250.000  (exact)
   B(12) = 500000 × 1.3^11   ≈ 8.960.802  (accept within ±5%)
   ------------------------------------------------------------------------- */
const SCENARIO = {
  context: `Kelompok usaha kecil SMK "Kreasi Nusantara" memiliki modal awal Rp500.000. Mereka sedang mempertimbangkan dua rencana pengembangan modal untuk 12 bulan ke depan.`,
  targetPeriod: 12,

  planA: {
    id: 'planA',
    label: 'Rencana A',
    title: 'Penambahan Modal Tetap',
    description: `Setiap bulan, kelompok mengalokasikan keuntungan bersih sebesar Rp250.000 untuk menambah modal usaha. Modal bertambah dengan jumlah yang sama setiap bulannya.`,
    type: 'arithmetic',
    params: { a: 500000, d: 250000 },
    data: [
      { period: 1, value: 500000 },
      { period: 2, value: 750000 },
      { period: 3, value: 1000000 },
      { period: 4, value: 1250000 },
      { period: 5, value: 1500000 },
    ],
    formulaOptions: [
      {
        id: 'fA_correct',
        label: 'Uₙ = 500.000 + (n − 1) × 250.000',
        correct: true,
        explanation: 'Tepat. Ini rumus aritmetika Uₙ = a + (n−1)d, dengan a = Rp500.000 dan d = Rp250.000.',
      },
      {
        id: 'fA_wrong_geom',
        label: 'Uₙ = 500.000 × 1,3 ⁽ⁿ⁻¹⁾',
        correct: false,
        explanation: 'Ini rumus geometri (perkalian). Rencana A menggunakan penambahan tetap, bukan perkalian. Periksa kembali data: apakah perubahannya berupa penjumlahan atau perkalian?',
      },
      {
        id: 'fA_wrong_n',
        label: 'Uₙ = 500.000 + n × 250.000',
        correct: false,
        explanation: 'Hampir benar, tetapi ada kesalahan pada indeks. Coba hitung untuk n=1: 500.000 + 1×250.000 = 750.000 — padahal pada bulan pertama, modalnya Rp500.000. Perhatikan bahwa rumusnya menggunakan (n−1), bukan n.',
      },
    ],
  },

  planB: {
    id: 'planB',
    label: 'Rencana B',
    title: 'Reinvestasi Persentase Keuntungan',
    description: `Modal usaha bertumbuh karena reinvestasi keuntungan. Setiap bulan, nilai modal bertumbuh sebesar 30% dari nilai modal bulan sebelumnya. Jumlah pertambahan berbeda setiap bulan.`,
    type: 'geometric',
    params: { a: 500000, r: 1.3 },
    data: [
      { period: 1, value: 500000 },
      { period: 2, value: 650000 },
      { period: 3, value: 845000 },
      { period: 4, value: 1098500 },
      { period: 5, value: 1428050 },
    ],
    formulaOptions: [
      {
        id: 'fB_correct',
        label: 'Uₙ = 500.000 × 1,3 ⁽ⁿ⁻¹⁾',
        correct: true,
        explanation: 'Tepat. Ini rumus geometri Uₙ = a × r^(n−1), dengan a = Rp500.000 dan r = 1,3.',
      },
      {
        id: 'fB_wrong_arith',
        label: 'Uₙ = 500.000 + (n − 1) × 150.000',
        correct: false,
        explanation: 'Ini rumus aritmetika (penambahan tetap). Tetapi perhatikan data Rencana B: selisihnya adalah 150.000, 195.000, 253.500 — selisih yang berbeda setiap bulan, bukan tetap. Periksa rasio antar nilai, bukan selisihnya.',
      },
      {
        id: 'fB_wrong_exp',
        label: 'Uₙ = 500.000 × 1,3ⁿ',
        correct: false,
        explanation: 'Hampir benar, tetapi eksponen harus (n−1), bukan n. Coba hitung untuk n=1: 500.000 × 1,3¹ = 650.000 — padahal nilai bulan pertama adalah Rp500.000. Gunakan (n−1) agar suku pertama menghasilkan nilai awal a.',
      },
    ],
  },
};

/* -------------------------------------------------------------------------
   SELF-ASSESSMENT ITEMS
   ------------------------------------------------------------------------- */
const SELF_ASSESSMENT = [
  {
    id: 'sa1',
    text: 'Saya dapat membedakan pola aritmetika dan geometri berdasarkan data yang diberikan.',
  },
  {
    id: 'sa2',
    text: 'Saya dapat menemukan beda (d) atau rasio (r) dari tabel data.',
  },
  {
    id: 'sa3',
    text: 'Saya dapat memilih formula yang sesuai untuk pola aritmetika maupun geometri.',
  },
  {
    id: 'sa4',
    text: 'Saya dapat memodelkan masalah kontekstual menggunakan salah satu pola tersebut.',
  },
  {
    id: 'sa5',
    text: 'Saya dapat menggunakan hasil perhitungan matematis untuk mendukung pengambilan keputusan.',
  },
];

const SA_LEVELS = [
  { value: 'sudah', label: 'Sudah bisa' },
  { value: 'perlu-latihan', label: 'Perlu latihan lagi' },
  { value: 'belum', label: 'Belum bisa' },
];

/* -------------------------------------------------------------------------
   FEEDBACK TEMPLATES
   Diagnostic messages for each interaction. Kept separate so content
   can be updated without touching application logic.
   ------------------------------------------------------------------------- */
const FEEDBACK = {
  exploration: {
    bothCorrect: {
      type: 'correct',
      heading: 'Analisis tepat!',
      body: 'Kamu berhasil mengidentifikasi kedua pola dengan benar. Kunci perbedaannya: pada Kasus 1, selisih antar nilai selalu Rp150.000 — ini tanda beda tetap (aritmetika). Pada Kasus 2, rasio antar nilai selalu 1,5 — ini tanda rasio tetap (geometri).',
    },
    wrongCaseA: {
      type: 'hint',
      heading: 'Periksa kembali Kasus 1',
      body: 'Coba hitung selisih dari bulan ke bulan: Rp350.000 − Rp200.000 = ? Rp500.000 − Rp350.000 = ? Rp650.000 − Rp500.000 = ? Jika hasilnya selalu sama, itu tandanya ada <strong>beda tetap</strong>.',
    },
    wrongCaseB: {
      type: 'hint',
      heading: 'Periksa kembali Kasus 2',
      body: 'Coba hitung hasil bagi: Rp600.000 ÷ Rp400.000 = ? Rp900.000 ÷ Rp600.000 = ? Rp1.350.000 ÷ Rp900.000 = ? Jika hasilnya selalu sama, itu tandanya ada <strong>rasio tetap</strong>.',
    },
    wrongBoth: {
      type: 'hint',
      heading: 'Mari periksa ulang keduanya',
      body: 'Untuk <strong>Kasus 1</strong>: hitung selisih nilai dari bulan ke bulan — apakah selalu sama? Untuk <strong>Kasus 2</strong>: hitung hasil bagi nilai dari bulan ke bulan — apakah selalu sama? Jawaban dari kedua pertanyaan itu adalah kunci membedakan aritmetika dan geometri.',
    },
    wrongIndicatorOnly: {
      type: 'hint',
      heading: 'Pilihan pola sudah tepat, periksa indikatornya',
      body: 'Identifikasi polamu sudah benar! Tetapi indikator yang kamu pilih perlu disesuaikan. Ingat: pola aritmetika ditandai oleh <strong>selisih tetap (+d)</strong>, pola geometri ditandai oleh <strong>rasio tetap (×r)</strong>.',
    },
  },

  comparison: {
    allCorrect: {
      type: 'correct',
      heading: 'Klasifikasi tepat!',
      body: 'Kamu berhasil mengklasifikasikan semua karakteristik dengan benar. Perbedaan inti: aritmetika beroperasi dengan penjumlahan tetap, geometri beroperasi dengan perkalian tetap.',
    },
    hasError: {
      type: 'hint',
      heading: 'Ada beberapa yang perlu diperbaiki',
      body: 'Periksa kembali karakteristik yang ditandai merah. Fokus pada pertanyaan: "Operasi apa yang menghubungkan suku-suku berurutan?" — penjumlahan tetap atau perkalian tetap?',
    },
  },

  scenario: {
    patternCorrect: {
      type: 'correct',
      body: 'Identifikasi pola tepat!',
    },
    patternWrongA: {
      type: 'hint',
      body: 'Periksa kembali data Rencana A. Hitung selisih antar nilai: Rp750.000 − Rp500.000 = ? Rp1.000.000 − Rp750.000 = ? Apakah selisihnya selalu sama?',
    },
    patternWrongB: {
      type: 'hint',
      body: 'Periksa kembali data Rencana B. Hitung hasil bagi antar nilai: Rp650.000 ÷ Rp500.000 = ? Rp845.000 ÷ Rp650.000 = ? Apakah rasionya selalu sama?',
    },
    calcCorrect: {
      type: 'correct',
      heading: 'Perhitungan tepat!',
      body: 'Pemodelan dan penerapan formula sudah benar.',
    },
    calcWrongModelRight: {
      type: 'hint',
      heading: 'Formula tepat, cek hasil hitungnya',
      body: 'Formula yang kamu pilih sudah sesuai, tetapi hasil hitungnya berbeda dari yang diharapkan. Coba substitusikan n = 12 ke dalam formula dengan teliti. Untuk operasi pangkat, hitung terlebih dahulu sebelum perkalian.',
    },
    decisionCorrect: {
      type: 'correct',
      heading: 'Keputusan berdasarkan data!',
      body: 'Betul. Pada bulan ke-12, Rencana B menghasilkan modal yang jauh lebih besar karena pertumbuhan geometri (eksponensial) melampaui pertumbuhan aritmetika (linier) setelah beberapa periode.',
    },
    decisionWrong: {
      type: 'hint',
      heading: 'Bandingkan kembali hasil perhitunganmu',
      body: 'Bandingkan nilai U₁₂ yang kamu hitung untuk masing-masing rencana. Mana yang lebih besar? Pilihan terbaik untuk memaksimalkan modal di bulan ke-12 adalah rencana dengan nilai U₁₂ lebih tinggi.',
    },
  },
};
