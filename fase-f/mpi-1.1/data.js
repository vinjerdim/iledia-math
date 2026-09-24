'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Barisan dan Deret Aritmetika
   Fase F — SMK Rekayasa Perangkat Lunak

   Tujuan Pembelajaran:
   Menjelaskan pola barisan aritmetika, menurunkan rumus suku ke-n
   dan jumlah n suku deret aritmetika, serta menerapkannya dalam
   menyelesaikan masalah kontekstual.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'koleksi'
     Sintaks 4 — Data processing ............ tahap 'olahUn' & 'olahSn'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 45 menit, murid berpasangan/kelompok kecil):
     1. Stimulasi (10')  — kasus XP naik level di game; murid menduga
                           XP level 20 & total XP tanpa menghitung.
     2. Masalah   (5')   — memilih pertanyaan inti & menulis hipotesis.
     3. Data      (15')  — mengungkap suku tiga konteks RPL, mencari
                           a dan b, memilah barisan aritmetika/bukan.
     4. Olah data (20')  — tabel pola koefisien b → rumus Uₙ;
                           trik Gauss (maju + mundur) → rumus Sₙ.
     5. Bukti     (10')  — menguji rumus pada data nyata & dugaan awal.
     6. Simpulan  (10')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap (15')  — enam masalah kontekstual RPL.
     8. Refleksi  (5')   — refleksi tertulis & penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/shuffleArray() dari shared/engine.js, satu kali
   saat state disiapkan, sehingga tiap murid (dan tiap Reset) mendapat
   urutan berbeda.
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Konflik kognitif: suku ke-20 dan jumlah 20 suku terasa
     "harus ditulis satu per satu". Dugaan TIDAK dinilai.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati pola kenaikan XP dan menduga XP pada level yang jauh.',
    guru: 'Bacakan kasusnya dengan antusias. Minta murid menduga <em>tanpa kalkulator dan tanpa menulis 20 suku</em>. Jangan membenarkan atau menyalahkan dugaan apa pun — dugaan ini akan diuji sendiri oleh murid pada tahap Pembuktian.',
    judul: 'XP Naik Level di Game Buatan Dimas',
    cerita:
      'Dimas, siswa RPL, sedang membuat game edukasi. Agar tantangannya meningkat, XP yang dibutuhkan untuk naik level ia atur bertambah secara teratur.',
    terms: [120, 150, 180, 210],
    labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4'],
    tail: { label: 'Level 20', value: '?' },
    satuan: 'XP',
    pertanyaanUn: 'Dugaanmu: berapa XP yang dibutuhkan untuk naik di Level 20?',
    opsiUn: [
      { id: 'u690', label: '690 XP' },
      { id: 'u720', label: '720 XP' },
      { id: 'u600', label: '600 XP' },
      { id: 'u2400', label: '2.400 XP' },
    ],
    pertanyaanSn: 'Dugaanmu: berapa total XP dari Level 1 sampai Level 20?',
    opsiSn: [
      { id: 's8100', label: '8.100 XP' },
      { id: 's13800', label: '13.800 XP' },
      { id: 's6900', label: '6.900 XP' },
      { id: 's4050', label: '4.050 XP' },
    ],
    alasanLabel: 'Bagaimana kamu mendapatkan dugaan itu?',
    alasanPlaceholder: 'Contoh: aku melihat XP selalu bertambah …',
    catatan:
      'Belum ada jawaban benar atau salah di sini. Simpan dugaanmu — nanti kamu sendiri yang akan membuktikannya.',
    nextLabel: 'Simpan Dugaan & Lanjut →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan inti yang perlu dijawab agar dugaan dapat diuji.',
    guru: 'Arahkan diskusi pada dua pertanyaan besar: (1) aturan umum suku ke-n, (2) aturan umum jumlah n suku. Tampung hipotesis murid di papan tulis tanpa dikoreksi.',
    pengantar:
      'Menulis XP level 1 sampai 20 satu per satu memang bisa, tetapi lama dan rawan salah. Bagaimana jika Dimas nanti membuat 100 level?',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'rumus',
        label:
          'Adakah aturan umum untuk menghitung XP level ke-n dan total XP n level tanpa menulis semua levelnya?',
      },
      { id: 'tambah', label: 'Berapa XP level 21 jika kita terus menambahkan satu per satu?' },
      { id: 'kali', label: 'Berapa hasil 120 dikali 20?' },
      { id: 'game', label: 'Game apa yang paling cocok dibuat Dimas?' },
    ],
    correct: 'rumus',
    umpan: {
      rumus:
        '<strong>Tepat.</strong> Inilah dua pertanyaan penyelidikan kita: aturan <em>suku ke-n</em> dan aturan <em>jumlah n suku pertama</em>.',
      tambah:
        'Cara ini tetap mengharuskan kita menulis semua suku. Cari pertanyaan yang membawa ke <em>aturan umum</em>.',
      kali: 'Mengalikan 120 × 20 menganggap XP tiap level sama, padahal XP bertambah. Coba pilih lagi.',
      game: 'Pertanyaan ini menarik, tetapi tidak membantu menjawab soal XP. Coba pilih lagi.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu, apa yang membuat XP bertambah secara teratur, dan bagaimana memanfaatkannya?',
    hipotesisPlaceholder: 'Contoh: setiap naik level XP bertambah angka yang sama, jadi …',
    nextLabel: 'Mulai Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA
     Bagian A: ungkap suku, cari a dan b (3 konteks RPL).
     Bagian B: pilah barisan aritmetika / bukan.
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengumpulkan data suku-suku barisan dan menemukan apa yang tetap di antara suku berurutan.',
    guru: 'Berkeliling antarkelompok. Ajukan pertanyaan pelacak: "Apa yang berubah? Apa yang tetap? Bagaimana jika bedanya negatif?" Biarkan media memberi petunjuk berjenjang lebih dulu sebelum guru membantu.',
    instruksiA:
      'Ungkap suku-suku barisan (minimal 4 suku), amati selisih dua suku yang berurutan, lalu isi suku pertama (a) dan beda (b).',
    minReveal: 4,
    konteks: [
      {
        id: 'lab',
        badge: 'Kursi Lab Bertingkat',
        icon: '🪑',
        cerita:
          'Lab multimedia sekolah berbentuk tribun. Baris paling depan berisi 12 kursi, baris di belakangnya selalu lebih banyak dengan pola teratur.',
        terms: [12, 15, 18, 21, 24, 27],
        labels: ['Baris 1', 'Baris 2', 'Baris 3', 'Baris 4', 'Baris 5', 'Baris 6'],
        satuan: 'kursi',
        a: 12,
        b: 3,
        hints: [
          'Suku pertama (a) adalah banyak kursi di <strong>Baris 1</strong>.',
          'Beda (b) = suku berikutnya − suku sebelumnya, mis. 15 − 12.',
        ],
      },
      {
        id: 'hosting',
        badge: 'Biaya Hosting',
        icon: '☁️',
        cerita:
          'Tim RPL menyewa server cloud untuk aplikasi kantin. Biaya bulan pertama Rp150 ribu, lalu naik tetap setiap bulan karena kapasitas ditambah.',
        terms: [150, 175, 200, 225, 250, 275],
        labels: ['Bulan 1', 'Bulan 2', 'Bulan 3', 'Bulan 4', 'Bulan 5', 'Bulan 6'],
        satuan: 'ribu rupiah',
        a: 150,
        b: 25,
        hints: [
          'Suku pertama (a) adalah biaya <strong>Bulan 1</strong> (dalam ribu rupiah).',
          'Hitung 175 − 150, lalu 200 − 175. Apakah hasilnya sama?',
        ],
      },
      {
        id: 'storage',
        badge: 'Sisa Penyimpanan Server',
        icon: '💾',
        cerita:
          'Server backup mula-mula memiliki ruang kosong 500 GB. Setiap minggu, file backup memakai ruang dengan jumlah yang sama.',
        terms: [500, 460, 420, 380, 340, 300],
        labels: ['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4', 'Mgg 5', 'Mgg 6'],
        satuan: 'GB',
        a: 500,
        b: -40,
        hints: [
          'Suku pertama (a) adalah ruang kosong di <strong>Minggu 1</strong>.',
          'Hitung 460 − 500. Hasilnya negatif karena barisannya <em>turun</em>. Tulis dengan tanda minus, mis. −10.',
        ],
      },
    ],
    temuanA:
      'Pada ketiga data, selisih dua suku yang berurutan <strong>selalu sama</strong>. Selisih tetap ini disebut <strong>beda (b)</strong>; boleh positif (naik) atau negatif (turun).',
    instruksiB:
      'Gunakan temuanmu. Tentukan apakah setiap barisan berikut termasuk barisan aritmetika.',
    opsiPilah: [
      { id: 'ya', label: 'Barisan aritmetika' },
      { id: 'bukan', label: 'Bukan barisan aritmetika' },
    ],
    pilah: [
      {
        id: 'p1',
        barisan: '5, 9, 13, 17, …',
        correct: 'ya',
        explanation: 'Selisihnya selalu +4, jadi beda tetap b = 4.',
      },
      {
        id: 'p2',
        barisan: '2, 4, 8, 16, …',
        correct: 'bukan',
        explanation:
          'Selisihnya +2, +4, +8 — berubah-ubah. Barisan ini dikali 2 (barisan geometri).',
      },
      {
        id: 'p3',
        barisan: '30, 24, 18, 12, …',
        correct: 'ya',
        explanation: 'Selisihnya selalu −6, jadi beda tetap b = −6 (barisan turun).',
      },
      {
        id: 'p4',
        barisan: '1, 4, 9, 16, …',
        correct: 'bukan',
        explanation: 'Selisihnya +3, +5, +7 — tidak tetap. Ini barisan bilangan kuadrat.',
      },
    ],
    nextLabel: 'Olah Data: Cari Aturan Uₙ →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — PENGOLAHAN DATA: RUMUS Uₙ
     ---------------------------------------------------------- */
  olahUn: {
    kicker: 'Tahap 4 · Pengolahan Data (Uₙ)',
    syntax: DL + ' · Sintaks 4',
    goal: 'Mengolah pola koefisien beda untuk menurunkan rumus suku ke-n.',
    guru: 'Minta kelompok membaca kolom koefisien secara vertikal: 0, 1, 2, 3, … Tanyakan: "Koefisien b selalu kurang berapa dari n?" Biarkan murid sendiri yang mengucapkan "n − 1".',
    konteks: 'Kursi lab bertingkat: a = 12, b = 3',
    a: 12,
    b: 3,
    instruksi:
      'Setiap suku dapat ditulis sebagai suku pertama ditambah beberapa kali beda. Isi berapa kali beda (b) ditambahkan pada setiap baris.',
    baris: [1, 2, 3, 4, 5, 10, 25],
    hints: [
      'U₂ = 15 = 12 + <strong>1</strong> × 3. U₃ = 18 = 12 + <strong>2</strong> × 3. Lanjutkan polanya.',
      'Dari Baris 1 ke Baris n, beda ditambahkan sebanyak "banyak lompatan" di antara kotak-kotak itu.',
      'Banyak lompatan selalu satu kurang dari nomor suku: koefisien = n − 1.',
    ],
    temuanTabel:
      'Koefisien b selalu <strong>satu kurang</strong> dari nomor suku. Suku ke-10 memuat 9 kali beda, suku ke-25 memuat 24 kali beda.',
    pertanyaanRumus: 'Berdasarkan pola pada tabel, rumus umum suku ke-n adalah …',
    opsiRumus: [
      { id: 'benar', label: 'Uₙ = a + (n − 1)b' },
      { id: 'nb', label: 'Uₙ = a + nb' },
      { id: 'geo', label: 'Uₙ = a × bⁿ⁻¹' },
      { id: 'kali', label: 'Uₙ = (a + b) × n' },
    ],
    correctRumus: 'benar',
    umpanRumus: {
      benar: '<strong>Hebat!</strong> Kamu menemukan rumus suku ke-n barisan aritmetika.',
      nb: 'Uji dengan n = 1: 12 + 1 × 3 = 15, padahal U₁ = 12. Koefisien b harus 0 saat n = 1.',
      geo: 'Rumus ini memakai perkalian berulang (pangkat), padahal suku kita bertambah dengan penjumlahan.',
      kali: 'Uji dengan n = 1: (12 + 3) × 1 = 15, padahal U₁ = 12. Coba lagi.',
    },
    ujiLabel: 'Pakai rumus temuanmu: berapa kursi di Baris 20?',
    ujiJawab: 69,
    ujiHints: ['U₂₀ = a + (20 − 1)b = 12 + 19 × 3.'],
    nextLabel: 'Lanjut: Cari Aturan Sₙ →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — PENGOLAHAN DATA: RUMUS Sₙ (trik Gauss)
     ---------------------------------------------------------- */
  olahSn: {
    kicker: 'Tahap 4 · Pengolahan Data (Sₙ)',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan rumus jumlah n suku pertama dengan menjumlahkan deret maju dan mundur.',
    guru: 'Ceritakan singkat kisah Carl Friedrich Gauss kecil yang menjumlahkan 1 + 2 + … + 100 dalam hitungan detik. Tekankan bahwa setiap pasangan (depan + belakang) bernilai sama, lalu biarkan murid menemukan mengapa hasilnya harus dibagi 2.',
    konteks: 'Total kursi 6 baris pertama lab: 12 + 15 + 18 + 21 + 24 + 27',
    terms: [12, 15, 18, 21, 24, 27],
    langkah: [
      {
        id: 'pasangan',
        label: 'Jumlahkan setiap pasangan atas–bawah. Berapa nilai setiap pasangan?',
        jawab: 39,
        hints: ['Pasangan pertama: 12 + 27. Pasangan kedua: 15 + 24. Apa yang kamu perhatikan?'],
        temuan:
          'Setiap pasangan bernilai sama: <strong>39 = a + U₆</strong> (suku pertama + suku terakhir).',
      },
      {
        id: 'banyak',
        label: 'Ada berapa pasangan seperti itu?',
        jawab: 6,
        hints: ['Setiap suku punya satu pasangan. Ada berapa suku yang dijumlahkan?'],
        temuan: 'Banyak pasangan = banyak suku = <strong>n = 6</strong>.',
      },
      {
        id: 'duaS',
        label: 'Baris atas dan bawah sama-sama bernilai S₆. Berapa 2 × S₆?',
        jawab: 234,
        hints: ['2 × S₆ = banyak pasangan × nilai tiap pasangan = 6 × 39.'],
        temuan: '2 × S₆ = 6 × 39 = <strong>234</strong>.',
      },
      {
        id: 's',
        label: 'Jadi, berapa S₆ (total kursi 6 baris pertama)?',
        jawab: 117,
        hints: ['Kita menjumlahkan deret dua kali, jadi bagi hasilnya dengan 2.'],
        temuan:
          'S₆ = 234 ÷ 2 = <strong>117</strong>. Cek manual: 12 + 15 + 18 + 21 + 24 + 27 = 117 ✓',
      },
    ],
    pertanyaan1: 'Dari langkah tadi, bentuk umum jumlah n suku pertama adalah …',
    opsi1: [
      { id: 'benar', label: 'Sₙ = n/2 × (a + Uₙ)' },
      { id: 'lupa2', label: 'Sₙ = n × (a + Uₙ)' },
      { id: 'tengah', label: 'Sₙ = (a + Uₙ) / 2' },
      { id: 'nun', label: 'Sₙ = n × Uₙ' },
    ],
    correct1: 'benar',
    umpan1: {
      benar:
        '<strong>Tepat.</strong> n pasangan bernilai (a + Uₙ), dibagi 2 karena deret ditulis dua kali.',
      lupa2: 'Itu adalah nilai 2 × Sₙ. Ingat, kita menjumlahkan deret dua kali (maju + mundur).',
      tengah: 'Itu hanya rata-rata suku pertama dan terakhir. Masih perlu dikalikan banyak suku.',
      nun: 'Uji: 6 × 27 = 162 ≠ 117. Tidak semua suku sebesar suku terakhir.',
    },
    pertanyaan2:
      'Sering kali Uₙ belum diketahui. Substitusikan Uₙ = a + (n − 1)b ke rumus tadi. Hasilnya …',
    opsi2: [
      { id: 'benar', label: 'Sₙ = n/2 × (2a + (n − 1)b)' },
      { id: 'satuA', label: 'Sₙ = n/2 × (a + (n − 1)b)' },
      { id: 'nb', label: 'Sₙ = n/2 × (2a + nb)' },
      { id: 'tanpa2', label: 'Sₙ = n × (2a + (n − 1)b)' },
    ],
    correct2: 'benar',
    umpan2: {
      benar:
        '<strong>Luar biasa!</strong> a + a + (n − 1)b = 2a + (n − 1)b. Kamu menurunkan rumus Sₙ sendiri.',
      satuA: 'a + Uₙ = a + a + (n − 1)b. Ada berapa a di situ?',
      nb: 'Suku ke-n memuat (n − 1) kali beda, bukan n kali. Coba lagi.',
      tanpa2: 'Pembagian 2 dari langkah sebelumnya hilang. Coba lagi.',
    },
    nextLabel: 'Buktikan Rumusmu →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji rumus Uₙ dan Sₙ pada data nyata serta membuktikan dugaan awal.',
    guru: 'Minta murid membandingkan hasil rumus dengan data/penjumlahan manual. Pada bagian dugaan, beri apresiasi pada proses berpikir, bukan pada tepat-tidaknya dugaan awal.',
    uji: [
      {
        id: 'hU6',
        grup: 'A',
        label: 'Biaya hosting (a = 150, b = 25). Hitung U₆ dengan rumus (ribu rupiah).',
        jawab: 275,
        hints: ['U₆ = 150 + (6 − 1) × 25.'],
        bukti: 'Data Bulan 6 pada tahap Pengumpulan Data juga 275 ✓',
      },
      {
        id: 'hS6',
        grup: 'A',
        label: 'Hitung S₆: total biaya hosting 6 bulan pertama (ribu rupiah).',
        jawab: 1275,
        hints: ['S₆ = 6/2 × (2 × 150 + 5 × 25) = 3 × (300 + 125).'],
        bukti: 'Cek manual: 150 + 175 + 200 + 225 + 250 + 275 = 1.275 ✓',
      },
      {
        id: 'xU20',
        grup: 'B',
        label: 'XP game Dimas (a = 120, b = 30). Hitung XP Level 20.',
        jawab: 690,
        hints: ['U₂₀ = 120 + 19 × 30.'],
        bukti: 'U₂₀ = 120 + 570 = 690 XP.',
      },
      {
        id: 'xS20',
        grup: 'B',
        label: 'Hitung total XP Level 1 sampai Level 20.',
        jawab: 8100,
        hints: [
          'Pakai Sₙ = n/2 × (a + Uₙ) dengan U₂₀ yang baru kamu hitung.',
          'S₂₀ = 20/2 × (120 + 690) = 10 × 810.',
        ],
        bukti: 'S₂₀ = 10 × 810 = 8.100 XP.',
      },
    ],
    judulA: 'A. Uji rumus pada data biaya hosting',
    judulB: 'B. Kembali ke dugaan awalmu',
    dugaanUnBenar: 'u690',
    dugaanSnBenar: 's8100',
    nextLabel: 'Tarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Merumuskan kesimpulan tentang pola, rumus Uₙ, dan rumus Sₙ barisan dan deret aritmetika.',
    guru: 'Minta perwakilan kelompok membacakan kesimpulannya. Konfirmasi dan kaitkan dengan istilah formal: suku pertama (a), beda (b), suku ke-n (Uₙ), deret, jumlah n suku pertama (Sₙ).',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'Barisan aritmetika adalah barisan bilangan yang', correct: 'b1' },
      { id: 'k2', awal: 'Beda (b) barisan aritmetika dapat dihitung dengan', correct: 'b2' },
      { id: 'k3', awal: 'Suku ke-n barisan aritmetika dirumuskan', correct: 'b3' },
      { id: 'k4', awal: 'Jumlah n suku pertama deret aritmetika dirumuskan', correct: 'b4' },
    ],
    bank: [
      { id: 'b1', teks: 'selisih dua suku berurutannya selalu tetap' },
      { id: 'b2', teks: 'b = Uₙ − Uₙ₋₁' },
      { id: 'b3', teks: 'Uₙ = a + (n − 1)b' },
      { id: 'b4', teks: 'Sₙ = n/2 × (2a + (n − 1)b) atau Sₙ = n/2 × (a + Uₙ)' },
      { id: 'x1', teks: 'hasil bagi dua suku berurutannya selalu tetap' },
      { id: 'x2', teks: 'b = Uₙ × Uₙ₋₁' },
      { id: 'x3', teks: 'Uₙ = a + nb' },
      { id: 'x4', teks: 'Sₙ = n × (a + Uₙ)' },
    ],
    rangkuman: [
      'Barisan aritmetika: U₁, U₂, U₃, … dengan selisih tetap <strong>b = Uₙ − Uₙ₋₁</strong>.',
      'Suku ke-n: <strong>Uₙ = a + (n − 1)b</strong> — suku pertama ditambah (n − 1) kali beda.',
      'Deret aritmetika: U₁ + U₂ + … + Uₙ, dengan jumlah <strong>Sₙ = n/2 × (a + Uₙ) = n/2 × (2a + (n − 1)b)</strong>.',
    ],
    nextLabel: 'Terapkan pada Masalah Nyata →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP (dirender createExerciseStage)
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    goal: 'Menerapkan rumus Uₙ dan Sₙ untuk menyelesaikan masalah kontekstual.',
    guru: 'Amati strategi murid: apakah mereka menentukan a, b, dan n lebih dulu sebelum memilih rumus? Soal pilihan ganda dapat dijadikan bahan diskusi pengecoh.',
    instruksi:
      'Tentukan dulu a, b, dan n dari cerita, lalu pilih rumus yang sesuai. Tulis jawaban berupa bilangan bulat (tanpa satuan).',
    soal: [
      {
        type: 'input',
        cerita:
          'Nadia magang di software house. Uang saku bulan pertama Rp1.500.000 dan naik Rp100.000 setiap bulan.',
        pertanyaan: 'Berapa rupiah uang saku Nadia pada <strong>bulan ke-8</strong>?',
        jawab: 2200000,
        hints: [
          'a = 1.500.000, b = 100.000, n = 8. Yang ditanya suku ke-8 (Uₙ).',
          'U₈ = 1.500.000 + 7 × 100.000.',
        ],
        explanation: 'U₈ = 1.500.000 + (8 − 1) × 100.000 = Rp2.200.000.',
        reveal: 'U₈ = 1.500.000 + 7 × 100.000 = <strong>2.200.000</strong>.',
      },
      {
        type: 'choice',
        cerita:
          'Auditorium sekolah untuk expo RPL memiliki 15 baris kursi. Baris pertama 20 kursi dan setiap baris berikutnya bertambah 4 kursi.',
        pertanyaan: 'Berapa <strong>total kursi</strong> di auditorium?',
        options: [
          { id: 'a', label: '720 kursi' },
          { id: 'b', label: '1.440 kursi' },
          { id: 'c', label: '76 kursi' },
          { id: 'd', label: '750 kursi' },
        ],
        correct: 'a',
        explanation:
          'S₁₅ = 15/2 × (2 × 20 + 14 × 4) = 7,5 × 96 = 720. (1.440 lupa dibagi 2; 76 adalah U₁₅; 750 memakai nb, bukan (n − 1)b.)',
      },
      {
        type: 'input',
        cerita:
          'Aplikasi to-do list buatan kelas XI RPL diunduh 250 kali pada minggu pertama. Setiap minggu, unduhan bertambah 50 kali dari minggu sebelumnya.',
        pertanyaan:
          'Pada <strong>minggu ke berapa</strong> unduhan mingguannya mencapai 1.000 kali?',
        jawab: 16,
        hints: [
          'Yang dicari n, bukan Uₙ. Tulis 1.000 = 250 + (n − 1) × 50.',
          '(n − 1) × 50 = 750, jadi n − 1 = 15.',
        ],
        explanation: '1.000 = 250 + (n − 1) × 50 → n − 1 = 15 → n = 16.',
        reveal: '(n − 1) × 50 = 750 → n − 1 = 15 → n = <strong>16</strong>.',
      },
      {
        type: 'choice',
        cerita:
          'Raka menambah jumlah baris kode programnya secara teratur setiap hari. Pada hari ke-3 ia menulis 14 baris, dan pada hari ke-7 ia menulis 30 baris.',
        pertanyaan: 'Berapa baris kode yang ditulis Raka pada <strong>hari ke-10</strong>?',
        options: [
          { id: 'a', label: '42 baris' },
          { id: 'b', label: '46 baris' },
          { id: 'c', label: '38 baris' },
          { id: 'd', label: '54 baris' },
        ],
        correct: 'a',
        explanation: 'U₇ − U₃ = 4b = 16 → b = 4; a = 14 − 2 × 4 = 6; U₁₀ = 6 + 9 × 4 = 42.',
      },
      {
        type: 'input',
        cerita:
          'Dewi menabung untuk membeli laptop. Bulan pertama ia menabung Rp200.000, dan setiap bulan tabungannya ditambah Rp50.000 lebih banyak dari bulan sebelumnya.',
        pertanyaan: 'Berapa rupiah <strong>total tabungan</strong> Dewi setelah 12 bulan?',
        jawab: 5700000,
        hints: [
          'Yang ditanya jumlah (Sₙ). a = 200.000, b = 50.000, n = 12.',
          'S₁₂ = 12/2 × (2 × 200.000 + 11 × 50.000) = 6 × 950.000.',
        ],
        explanation: 'S₁₂ = 6 × (400.000 + 550.000) = Rp5.700.000.',
        reveal: 'S₁₂ = 6 × 950.000 = <strong>5.700.000</strong>.',
      },
      {
        type: 'input',
        cerita:
          'Pada sprint pertama, tim QA menemukan 60 bug. Setelah perbaikan rutin, banyak bug berkurang 7 setiap sprint.',
        pertanyaan: 'Berapa bug yang tersisa pada <strong>sprint ke-8</strong>?',
        jawab: 11,
        hints: ['Bug berkurang, jadi beda negatif: b = −7.', 'U₈ = 60 + (8 − 1) × (−7) = 60 − 49.'],
        explanation: 'U₈ = 60 + 7 × (−7) = 60 − 49 = 11 bug.',
        reveal: 'U₈ = 60 − 49 = <strong>11</strong>.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    goal: 'Merefleksikan proses menemukan rumus dan kesiapan menerapkannya.',
    guru: 'Pilih 2–3 murid untuk membagikan refleksinya. Gunakan penilaian diri untuk menentukan murid yang memerlukan pendampingan lanjutan.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Dengan kata-katamu sendiri, mengapa suku ke-n memuat (n − 1) kali beda, bukan n kali?',
        placeholder: 'Tuliskan penjelasanmu …',
      },
      {
        id: 'r2',
        teks: 'Bagian mana dari penurunan rumus Sₙ yang paling membuatmu "aha!"? Mengapa?',
        placeholder: 'Tuliskan pengalamanmu …',
      },
      {
        id: 'r3',
        teks: 'Sebutkan satu masalah di bidang RPL yang bisa diselesaikan dengan barisan atau deret aritmetika.',
        placeholder: 'Contoh: menghitung total biaya server …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menerapkan rumus Uₙ dan Sₙ sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '🙂 Yakin — tetapi masih perlu melihat catatan' },
      { id: 'ragu', label: '🤔 Masih ragu — perlu latihan lagi' },
      { id: 'bingung', label: '🆘 Belum paham — perlu bimbingan guru' },
    ],
    nextLabel: 'Simpan Refleksi & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Penemuanmu Tuntas!',
    teks: 'Kamu tidak sekadar menghafal rumus — kamu menemukannya sendiri dari data, mengujinya, lalu menerapkannya.',
    capaian: [
      'Menjelaskan pola barisan aritmetika melalui beda yang tetap.',
      'Menurunkan rumus suku ke-n: Uₙ = a + (n − 1)b.',
      'Menurunkan rumus jumlah n suku pertama: Sₙ = n/2 × (2a + (n − 1)b).',
      'Menerapkan kedua rumus pada masalah kontekstual RPL.',
    ],
  },
};
