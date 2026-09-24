'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Jumlah n Suku Pertama Deret Aritmetika (Sₙ)
   Fase F — SMK Rekayasa Perangkat Lunak

   Tujuan Pembelajaran:
   Menemukan dan membuktikan rumus jumlah n suku pertama deret
   aritmetika (Sₙ), serta menggunakannya untuk menyelesaikan
   masalah sederhana terkait deret aritmetika.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'koleksi'
     Sintaks 4 — Data processing ............ tahap 'olahVisual' & 'olahAljabar'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 45 menit, murid berpasangan):
     1. Stimulasi    (8')  — "Tangga Piksel": level game berbentuk tangga
                             blok 3, 5, 7, …; murid menduga total blok
                             30 anak tangga tanpa menghitung satu per satu.
     2. Masalah      (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data         (15') — membangun tangga dengan slider, mengisi tabel
                             Uₙ & Sₙ (n = 1–5), lalu memilah pernyataan
                             tentang pola Sₙ (benar/salah).
     4a. Bukti visual (12') — menyalin & memutar tangga 180° hingga
                             terbentuk persegi panjang n × (a + Uₙ);
                             menemukan Sₙ = n/2 (a + Uₙ).
     4b. Bukti aljabar (12') — menulis Sₙ maju & mundur, menjumlahkan
                             pasangan, lalu substitusi Uₙ = a + (n − 1)b
                             → Sₙ = n/2 (2a + (n − 1)b).
     5. Pembuktian   (10') — menguji kedua bentuk rumus pada data dan
                             membuktikan dugaan awal.
     6. Simpulan     (8')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap    (15') — enam masalah sederhana (isian & pilihan ganda).
     8. Refleksi     (5')  — refleksi tertulis & penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan, sehingga tiap murid
   (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  /* Tangga blok yang dipakai sepanjang modul: aₖ = 3, 5, 7, … */
  tangga: { a: 3, b: 2, maxN: 8 },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Pembuktian.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati tangga blok dan menduga banyak blok total untuk tangga yang panjang.',
    guru: 'Tampilkan gambar tangga di layar. Minta murid menduga <em>tanpa kalkulator dan tanpa menjumlahkan 30 bilangan</em>. Tampung semua dugaan tanpa dikoreksi — murid akan mengujinya sendiri pada tahap Pembuktian.',
    judul: 'Tangga Piksel di Game Buatan Raka',
    cerita:
      'Raka, siswa RPL, sedang membuat level game platformer. Ia menyusun tangga dari blok piksel: anak tangga pertama setinggi 3 blok, dan setiap anak tangga berikutnya 2 blok lebih tinggi.',
    nTampil: 4,
    tail: { label: 'Anak tangga 30', value: '?' },
    pertanyaan: 'Dugaanmu: berapa banyak blok yang dibutuhkan untuk tangga dengan 30 anak tangga?',
    opsi: [
      { id: 's960', label: '960 blok' },
      { id: 's1830', label: '1.830 blok' },
      { id: 's90', label: '90 blok' },
      { id: 's1920', label: '1.920 blok' },
    ],
    alasanLabel: 'Bagaimana kamu mendapatkan dugaan itu?',
    alasanPlaceholder: 'Contoh: anak tangga terakhir sekitar … blok, jadi totalnya …',
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
    goal: 'Merumuskan pertanyaan inti yang perlu diselidiki agar dugaan dapat diuji.',
    guru: 'Arahkan diskusi pada satu pertanyaan besar: adakah cara umum menghitung jumlah n suku tanpa menjumlahkan satu per satu, dan <em>mengapa</em> cara itu pasti benar? Tulis hipotesis murid di papan tanpa dikoreksi.',
    pengantar:
      'Menjumlahkan 3 + 5 + 7 + … sampai 30 suku memang bisa, tetapi lama dan rawan salah. Bagaimana jika level berikutnya punya 200 anak tangga?',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'rumus',
        label:
          'Adakah rumus umum untuk jumlah n suku pertama deret aritmetika, dan bagaimana membuktikan bahwa rumus itu selalu benar?',
      },
      { id: 'kali', label: 'Berapa hasil 30 dikali 3 blok?' },
      { id: 'terakhir', label: 'Berapa tinggi anak tangga ke-30 saja?' },
      { id: 'warna', label: 'Warna blok apa yang paling cocok untuk tangga itu?' },
    ],
    correct: 'rumus',
    umpan: {
      rumus:
        '<strong>Tepat.</strong> Kita akan <em>menemukan</em> rumus jumlah n suku pertama (Sₙ) dan <em>membuktikan</em> bahwa rumus itu berlaku untuk semua n.',
      kali: 'Mengalikan 30 × 3 menganggap setiap anak tangga setinggi 3 blok, padahal tingginya bertambah. Coba pilih lagi.',
      terakhir:
        'Tinggi anak tangga ke-30 memang penting, tetapi yang ditanyakan adalah <em>jumlah</em> seluruh blok. Coba pilih lagi.',
      warna:
        'Pertanyaan ini menarik untuk desain, tetapi tidak menjawab soal banyak blok. Coba pilih lagi.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu, bagaimana cara cepat menghitung jumlah seluruh blok?',
    hipotesisPlaceholder: 'Contoh: mungkin banyak anak tangga dikali tinggi rata-ratanya …',
    nextLabel: 'Mulai Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA
     Bagian A: bangun tangga (slider) & isi tabel Uₙ, Sₙ.
     Bagian B: pilah pernyataan benar/salah tentang Sₙ.
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengumpulkan data banyak blok per anak tangga (Uₙ) dan banyak blok total (Sₙ).',
    guru: 'Minta murid benar-benar menggeser slider dan menghitung. Ajukan pertanyaan pelacak: "Bagaimana Sₙ berubah dari satu baris ke baris berikutnya? Apakah perubahannya tetap?" Biarkan petunjuk berjenjang bekerja lebih dulu.',
    instruksiA:
      'Geser slider untuk membangun tangga. Angka di bawah tiap kolom = banyak blok anak tangga itu. Lengkapi tabel: Uₙ = blok anak tangga ke-n, Sₙ = blok total dari anak tangga 1 sampai n.',
    tabelN: 5,
    hintsTabel: [
      'Uₙ adalah tinggi kolom ke-n saja. Sₙ adalah jumlah SEMUA kolom dari 1 sampai n.',
      'Sₙ = Sₙ₋₁ + Uₙ. Contoh: S₂ = S₁ + U₂ = 3 + 5 = 8.',
    ],
    instruksiB: 'Amati tabelmu. Pilah setiap pernyataan berikut: benar atau salah?',
    opsiPilah: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: 'Selisih dua jumlah berurutan, Sₙ − Sₙ₋₁, selalu sama dengan Uₙ.',
        correct: 'benar',
        explanation:
          'Misalnya S₄ − S₃ = 24 − 15 = 9 = U₄. Menambah satu anak tangga = menambah Uₙ blok.',
      },
      {
        id: 'p2',
        teks: 'Barisan S₁, S₂, S₃, … (3, 8, 15, 24, …) juga barisan aritmetika.',
        correct: 'salah',
        explanation:
          'Selisihnya 5, 7, 9, … — tidak tetap. Jadi Sₙ tidak bisa dicari dengan rumus Uₙ biasa.',
      },
      {
        id: 'p3',
        teks: 'S₅ dapat dihitung dengan n × a = 5 × 3.',
        correct: 'salah',
        explanation:
          '5 × 3 = 15, padahal S₅ = 35. Cara ini menganggap semua anak tangga setinggi yang pertama.',
      },
      {
        id: 'p4',
        teks: 'S₅ dapat dihitung dengan n × Uₙ = 5 × 11.',
        correct: 'salah',
        explanation:
          '5 × 11 = 55, terlalu besar: cara ini menganggap semua anak tangga setinggi yang terakhir.',
      },
      {
        id: 'p5',
        teks: 'S₅ = 35 sama dengan 5 × 7, dan 7 adalah rata-rata U₁ dan U₅, yaitu (3 + 11) : 2.',
        correct: 'benar',
        explanation:
          'Menarik! Jumlah = banyak suku × rata-rata suku pertama dan terakhir. Kita akan membuktikan mengapa.',
      },
    ],
    nextLabel: 'Olah Data: Bukti Visual →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — OLAH DATA: BUKTI VISUAL
     Dua tangga identik (satu diputar 180°) → persegi panjang.
     ---------------------------------------------------------- */
  olahVisual: {
    kicker: 'Tahap 4 · Olah Data (Bukti Visual)',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan rumus Sₙ dengan menggabungkan dua tangga menjadi persegi panjang.',
    guru: 'Tanyakan sebelum menekan tombol: "Jika tangga ini disalin lalu diputar setengah putaran, bangun apa yang terbentuk?" Setelah persegi panjang muncul, tekankan bahwa blok biru hanya separuh dari persegi panjang.',
    n: 5,
    instruksi:
      'Ini tangga dengan 5 anak tangga (blok biru). Tekan tombol untuk menyalin tangga, memutarnya 180°, lalu menempelkannya di atas tangga asli (blok oranye).',
    tombol: '🔄 Salin & Putar 180°',
    langkah: [
      {
        label: 'Ada berapa kolom (lebar) persegi panjang yang terbentuk?',
        jawab: 5,
        hints: ['Hitung banyak kolom dari kiri ke kanan. Sama dengan banyak anak tangga, n.'],
        temuan: 'Lebar persegi panjang = n = 5.',
      },
      {
        label: 'Berapa tinggi setiap kolom (blok biru + blok oranye)?',
        jawab: 14,
        hints: [
          'Lihat kolom pertama: berapa blok biru, berapa blok oranye?',
          'Kolom pertama: 3 biru + 11 oranye. Periksa kolom lain — apakah tingginya sama?',
        ],
        temuan: 'Setiap kolom tingginya 14 = 3 + 11 = a + U₅. Tinggi semua kolom SAMA!',
      },
      {
        label: 'Berapa banyak blok seluruh persegi panjang?',
        jawab: 70,
        hints: ['Luas persegi panjang = lebar × tinggi.'],
        temuan: 'Persegi panjang = 5 × 14 = 70 blok = dua tangga = 2 × S₅.',
      },
      {
        label: 'Jadi, berapa banyak blok biru saja (S₅)?',
        jawab: 35,
        hints: ['Blok biru dan oranye sama banyak, masing-masing separuh persegi panjang.'],
        temuan: 'S₅ = 70 : 2 = 35 — cocok dengan tabelmu!',
      },
    ],
    pertanyaan1: 'Untuk tangga dengan n anak tangga, tinggi setiap kolom persegi panjang selalu …',
    opsi1: [
      { id: 'aun', label: 'a + Uₙ (suku pertama + suku terakhir)' },
      { id: '2a', label: '2a (dua kali suku pertama)' },
      { id: 'un-a', label: 'Uₙ − a' },
      { id: 'nb', label: 'n + b' },
    ],
    correct1: 'aun',
    umpan1: {
      aun: '<strong>Tepat.</strong> Kolom ke-k berisi Uₖ blok biru dan U₍ₙ₊₁₋ₖ₎ blok oranye; jumlahnya selalu a + Uₙ.',
      '2a': 'Coba lihat kolom pertama: 3 biru + 11 oranye = 14, bukan 2 × 3 = 6.',
      'un-a': 'Blok biru dan oranye ditumpuk (dijumlahkan), bukan dikurangkan. Coba lagi.',
      nb: 'Untuk n = 5, n + b = 7, padahal tinggi kolom 14. Coba lagi.',
    },
    pertanyaan2: 'Persegi panjang = 2 tangga = n × (a + Uₙ). Maka rumus Sₙ adalah …',
    opsi2: [
      { id: 'benar', label: 'Sₙ = n/2 × (a + Uₙ)' },
      { id: 'tanpa2', label: 'Sₙ = n × (a + Uₙ)' },
      { id: 'tanpan', label: 'Sₙ = (a + Uₙ) / 2' },
      { id: 'hanyaun', label: 'Sₙ = n/2 × Uₙ' },
    ],
    correct2: 'benar',
    umpan2: {
      benar: '<strong>Kamu menemukannya!</strong> 2Sₙ = n(a + Uₙ), sehingga Sₙ = n/2 × (a + Uₙ).',
      tanpa2: 'n × (a + Uₙ) adalah seluruh persegi panjang = DUA tangga. Satu tangga berapa?',
      tanpan: '(a + Uₙ) / 2 hanya rata-rata satu kolom. Banyak kolomnya (n) belum dihitung.',
      hanyaun: 'Tinggi kolom persegi panjang adalah a + Uₙ, bukan Uₙ saja. Coba lagi.',
    },
    sliderLabel: 'Coba n lain — apakah selalu terbentuk persegi panjang?',
    nextLabel: 'Olah Data: Bukti Aljabar →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — OLAH DATA: BUKTI ALJABAR
     Sₙ ditulis maju & mundur, lalu dijumlahkan per pasangan.
     ---------------------------------------------------------- */
  olahAljabar: {
    kicker: 'Tahap 5 · Olah Data (Bukti Aljabar)',
    syntax: DL + ' · Sintaks 4',
    goal: 'Membuktikan rumus Sₙ secara aljabar untuk sembarang a, b, dan n.',
    guru: 'Hubungkan dengan bukti visual: baris "mundur" adalah tangga oranye yang diputar. Minta murid menjelaskan dengan kata-kata sendiri mengapa setiap pasangan bernilai sama.',
    instruksi:
      'Deret aritmetika umum ditulis dua kali: maju (dari a) dan mundur (dari Uₙ). Klik setiap kolom untuk menjumlahkan pasangan suku yang sejajar.',
    kolom: [
      { atas: 'a', bawah: 'Uₙ' },
      { atas: 'a + b', bawah: 'Uₙ − b' },
      { atas: 'a + 2b', bawah: 'Uₙ − 2b' },
      { atas: '…', bawah: '…', titik: true },
      { atas: 'Uₙ', bawah: 'a' },
    ],
    hasilPasangan: 'a + Uₙ',
    pertanyaan: [
      {
        id: 'q1',
        tanya: 'Setiap pasangan suku bernilai …',
        opsi: [
          { id: 'aun', label: 'a + Uₙ' },
          { id: '2a', label: '2a' },
          { id: 'ab', label: 'a + b' },
          { id: 'un', label: 'Uₙ' },
        ],
        correct: 'aun',
        umpan: {
          aun: '<strong>Tepat.</strong> +b di atas selalu “dibatalkan” −b di bawah.',
          '2a': 'Perhatikan kolom pertama: a + Uₙ, bukan a + a.',
          ab: 'Perhatikan kolom kedua: (a + b) + (Uₙ − b). Suku b saling menghilangkan.',
          un: 'Jangan lupakan suku a. Coba jumlahkan kolom pertama lagi.',
        },
      },
      {
        id: 'q2',
        tanya: 'Ada berapa pasangan seluruhnya?',
        opsi: [
          { id: 'n', label: 'n pasangan' },
          { id: 'n2', label: 'n/2 pasangan' },
          { id: 'n1', label: 'n − 1 pasangan' },
          { id: '2n', label: '2n pasangan' },
        ],
        correct: 'n',
        umpan: {
          n: '<strong>Tepat.</strong> Setiap suku punya satu pasangan di baris bawah, jadi ada n kolom — baik n genap maupun ganjil.',
          n2: 'n/2 pasangan muncul jika suku dipasangkan dalam SATU baris (trik Gauss). Di sini kita memakai DUA baris.',
          n1: 'Hitung kolomnya: dari suku ke-1 sampai suku ke-n ada n kolom.',
          '2n': 'Ada 2n suku, tetapi setiap pasangan berisi dua suku. Berapa pasangannya?',
        },
      },
      {
        id: 'q3',
        tanya: 'Baris maju + baris mundur = 2Sₙ = n(a + Uₙ). Jadi Sₙ = …',
        opsi: [
          { id: 'benar', label: 'n/2 × (a + Uₙ)' },
          { id: 'kali', label: 'n × (a + Uₙ)' },
          { id: 'dua', label: '2n × (a + Uₙ)' },
          { id: 'bagi', label: '(a + Uₙ) / 2n' },
        ],
        correct: 'benar',
        umpan: {
          benar: '<strong>Terbukti!</strong> Hasilnya sama dengan bukti visual tangga.',
          kali: 'Itu nilai 2Sₙ. Bagi kedua ruas dengan 2.',
          dua: 'Dari 2Sₙ = n(a + Uₙ), kedua ruas dibagi 2, bukan dikali 2.',
          bagi: 'Hanya ruas kiri yang punya faktor 2. n tetap sebagai pengali.',
        },
      },
      {
        id: 'q4',
        tanya: 'Jika Uₙ belum diketahui, substitusikan Uₙ = a + (n − 1)b. Diperoleh Sₙ = …',
        opsi: [
          { id: 'benar', label: 'n/2 × (2a + (n − 1)b)' },
          { id: 'satu-a', label: 'n/2 × (a + (n − 1)b)' },
          { id: 'nb', label: 'n/2 × (2a + nb)' },
          { id: 'tanpa2', label: 'n × (2a + (n − 1)b)' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> a + Uₙ = a + a + (n − 1)b = 2a + (n − 1)b. Kini kita punya dua bentuk rumus Sₙ.',
          'satu-a': 'a + Uₙ = a + [a + (n − 1)b]. Ada berapa a?',
          nb: 'Uₙ = a + (n − 1)b, bukan a + nb. Periksa lagi suku b-nya.',
          tanpa2: 'Faktor n/2 dari langkah sebelumnya jangan hilang.',
        },
      },
    ],
    nextLabel: 'Uji Rumusnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN (VERIFIKASI)
     A: uji dua bentuk rumus pada data tangga.
     B: buktikan dugaan awal (30 anak tangga).
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji kedua bentuk rumus Sₙ pada data dan membuktikan dugaan awal.',
    guru: 'Minta satu pasangan murid menjumlahkan 3 + 5 + … + 17 secara manual sementara yang lain memakai rumus, lalu bandingkan hasil dan waktunya.',
    judulA: 'A. Uji pada data tangga (a = 3, b = 2)',
    judulB: 'B. Buktikan dugaan awalmu: 30 anak tangga',
    uji: [
      {
        grup: 'A',
        label: 'Pakai Sₙ = n/2 × (a + Uₙ) untuk n = 5 (U₅ = 11). S₅ = …',
        jawab: 35,
        hints: ['S₅ = 5/2 × (3 + 11) = 5/2 × 14.'],
        bukti: 'S₅ = 35, sama dengan hasil menjumlahkan di tabel. n = 5 ganjil pun tetap berlaku.',
      },
      {
        grup: 'A',
        label: 'Pakai Sₙ = n/2 × (2a + (n − 1)b) untuk n = 8. S₈ = …',
        jawab: 80,
        hints: ['2a + (n − 1)b = 2(3) + 7(2) = 6 + 14 = 20.', 'S₈ = 8/2 × 20 = 4 × 20.'],
        bukti: 'S₈ = 80. Cek manual: 3 + 5 + 7 + 9 + 11 + 13 + 15 + 17 = 80. ✓',
      },
      {
        grup: 'B',
        label: 'Tinggi anak tangga ke-30: U₃₀ = a + 29b = …',
        jawab: 61,
        hints: ['U₃₀ = 3 + 29 × 2.'],
        bukti: 'U₃₀ = 61 blok.',
      },
      {
        grup: 'B',
        label: 'Total blok 30 anak tangga: S₃₀ = 30/2 × (3 + 61) = …',
        jawab: 960,
        hints: ['30/2 = 15, dan 3 + 61 = 64.', '15 × 64 = 960? Hitung 15 × 60 + 15 × 4.'],
        bukti: 'S₃₀ = 960 blok — dihitung dalam dua langkah, bukan 30 penjumlahan!',
      },
    ],
    dugaanBenar: 's960',
    nextLabel: 'Tarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN (GENERALISASI)
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Menyusun kesimpulan umum tentang rumus Sₙ dan buktinya dengan kata-kata sendiri.',
    guru: 'Setelah kalimat lengkap, minta beberapa murid membacakan kesimpulannya lalu menjelaskan ulang bukti tangga tanpa melihat layar.',
    instruksi:
      'Lengkapi setiap awal kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan dipakai paling banyak satu kali, dan ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      {
        id: 'k1',
        awal: 'Jika suku pertama dan suku terakhir diketahui, jumlah n suku pertama deret aritmetika adalah',
        correct: 'b1',
      },
      {
        id: 'k2',
        awal: 'Jika suku terakhir belum diketahui tetapi beda b diketahui, gunakan',
        correct: 'b2',
      },
      {
        id: 'k3',
        awal: 'Rumus itu terbukti karena deret yang ditulis maju dan mundur',
        correct: 'b3',
      },
      { id: 'k4', awal: 'Dengan kata lain, Sₙ sama dengan n dikali', correct: 'b4' },
      {
        id: 'k5',
        awal: 'Karena Sₙ = Sₙ₋₁ + Uₙ, suku ke-n dapat dicari dari jumlahnya dengan',
        correct: 'b5',
      },
    ],
    bank: [
      { id: 'b1', teks: 'Sₙ = n/2 × (a + Uₙ).' },
      { id: 'b2', teks: 'Sₙ = n/2 × (2a + (n − 1)b).' },
      { id: 'b3', teks: 'membentuk n pasangan yang masing-masing bernilai a + Uₙ.' },
      { id: 'b4', teks: 'rata-rata suku pertama dan suku terakhir.' },
      { id: 'b5', teks: 'Uₙ = Sₙ − Sₙ₋₁.' },
      { id: 'x1', teks: 'Sₙ = n × Uₙ.' },
      { id: 'x2', teks: 'Uₙ = Sₙ + Sₙ₋₁.' },
    ],
    rangkuman: [
      'Sₙ = n/2 × (a + Uₙ) — dipakai bila suku terakhir diketahui.',
      'Sₙ = n/2 × (2a + (n − 1)b) — dipakai bila yang diketahui a, b, dan n.',
      'Bukti: dua salinan deret (maju + mundur) membentuk n pasangan bernilai a + Uₙ, sehingga 2Sₙ = n(a + Uₙ).',
      'Uₙ = Sₙ − Sₙ₋₁ untuk n ≥ 2.',
    ],
    nextLabel: 'Terapkan Rumusnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Campuran isian ('input') dan pilihan ganda ('choice').
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menggunakan rumus Sₙ untuk menyelesaikan masalah sederhana deret aritmetika.',
    guru: 'Dorong murid menulis dulu a, b, n, atau Uₙ yang diketahui sebelum memilih bentuk rumus. Diskusikan soal yang paling banyak salah di akhir sesi.',
    instruksi:
      'Selesaikan setiap masalah. Tuliskan dulu apa yang diketahui (a, b, n, atau Uₙ), lalu pilih bentuk rumus Sₙ yang paling cocok.',
    soal: [
      {
        type: 'input',
        cerita:
          'Auditorium sekolah punya 15 baris kursi. Baris pertama berisi 20 kursi dan setiap baris di belakangnya bertambah 4 kursi.',
        pertanyaan: 'Berapa banyak kursi seluruhnya?',
        jawab: 720,
        hints: [
          'Diketahui a = 20, b = 4, n = 15. Pakai Sₙ = n/2 × (2a + (n − 1)b).',
          '2a + 14b = 40 + 56 = 96. S₁₅ = 15/2 × 96.',
        ],
        explanation: 'S₁₅ = 15/2 × (40 + 56) = 15/2 × 96 = 720 kursi.',
        reveal: 'S₁₅ = 15/2 × (2·20 + 14·4) = 15/2 × 96 = <strong>720</strong> kursi.',
      },
      {
        type: 'input',
        cerita:
          'Nadia menabung untuk membeli laptop. Hari pertama Rp5.000, dan setiap hari tabungannya Rp1.000 lebih banyak dari hari sebelumnya.',
        pertanyaan: 'Berapa rupiah total tabungan Nadia setelah 30 hari?',
        jawab: 585000,
        hints: [
          'a = 5.000, b = 1.000, n = 30.',
          '2a + 29b = 10.000 + 29.000 = 39.000. S₃₀ = 15 × 39.000.',
        ],
        explanation: 'S₃₀ = 30/2 × (10.000 + 29.000) = 15 × 39.000 = Rp585.000.',
        reveal: 'S₃₀ = 15 × (2·5.000 + 29·1.000) = 15 × 39.000 = <strong>Rp585.000</strong>.',
      },
      {
        type: 'choice',
        cerita:
          'Programmer menguji perulangan yang menjumlahkan bilangan ganjil 1 + 3 + 5 + … + 99.',
        pertanyaan: 'Berapa hasil yang seharusnya dicetak program?',
        options: [
          { id: 'o2500', label: '2.500' },
          { id: 'o5000', label: '5.000' },
          { id: 'o2450', label: '2.450' },
          { id: 'o2550', label: '2.550' },
        ],
        correct: 'o2500',
        explanation:
          'Ada 50 bilangan ganjil (a = 1, U₅₀ = 99). S₅₀ = 50/2 × (1 + 99) = 25 × 100 = 2.500.',
      },
      {
        type: 'input',
        cerita:
          'Selama 10 minggu, banyak commit Git tim bertambah tetap setiap minggu. Minggu pertama 12 commit, minggu ke-10 sebanyak 57 commit.',
        pertanyaan: 'Berapa total commit selama 10 minggu?',
        jawab: 345,
        hints: [
          'Suku pertama dan suku terakhir sudah diketahui. Pakai Sₙ = n/2 × (a + Uₙ).',
          'S₁₀ = 10/2 × (12 + 57) = 5 × 69.',
        ],
        explanation: 'S₁₀ = 5 × (12 + 57) = 5 × 69 = 345 commit.',
        reveal: 'S₁₀ = 10/2 × (12 + 57) = 5 × 69 = <strong>345</strong> commit.',
      },
      {
        type: 'choice',
        cerita: 'Jumlah n suku pertama suatu deret aritmetika dirumuskan Sₙ = n² + 2n.',
        pertanyaan: 'Berapa suku ke-5 (U₅) deret tersebut?',
        options: [
          { id: 'o11', label: '11' },
          { id: 'o35', label: '35' },
          { id: 'o59', label: '59' },
          { id: 'o9', label: '9' },
        ],
        correct: 'o11',
        explanation:
          'U₅ = S₅ − S₄ = (25 + 10) − (16 + 8) = 35 − 24 = 11. (Ini deret tangga piksel kita: 3 + 5 + 7 + …!)',
      },
      {
        type: 'input',
        cerita:
          'Sebuah server mencatat jumlah log yang bertambah tetap setiap jam. Dalam 12 jam tercatat 360 log, dan pada jam pertama tercatat 8 log.',
        pertanyaan: 'Berapa log yang tercatat pada jam ke-12 (U₁₂)?',
        jawab: 52,
        hints: [
          'Pakai Sₙ = n/2 × (a + Uₙ): 360 = 12/2 × (8 + U₁₂).',
          '360 = 6 × (8 + U₁₂), sehingga 8 + U₁₂ = 60.',
        ],
        explanation: '360 = 6 × (8 + U₁₂) → 8 + U₁₂ = 60 → U₁₂ = 52 log.',
        reveal: '360 = 6 × (8 + U₁₂) → 8 + U₁₂ = 60 → U₁₂ = <strong>52</strong> log.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses menemukan dan membuktikan rumus Sₙ.',
    guru: 'Baca jawaban refleksi secara acak dan gunakan untuk menentukan murid yang perlu pendampingan tambahan pada pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri mengapa Sₙ = n/2 × (a + Uₙ) selalu benar.',
        placeholder: 'Jika tangga disalin dan diputar …',
      },
      {
        id: 'r2',
        teks: 'Kapan kamu memilih bentuk n/2 × (a + Uₙ) dan kapan n/2 × (2a + (n − 1)b)?',
        placeholder: 'Aku memakai bentuk pertama jika …',
      },
      {
        id: 'r3',
        teks: 'Di mana kamu bisa memakai rumus Sₙ dalam dunia RPL atau kehidupan sehari-hari?',
        placeholder: 'Misalnya menghitung total …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat membuktikan dan memakai rumus Sₙ sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '🙂 Yakin — aku bisa memakai rumusnya' },
      { id: 'ragu', label: '🤔 Masih ragu di bagian pembuktian' },
      { id: 'bantuan', label: '🙋 Aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, kamu menemukan dan membuktikan rumus Sₙ!',
    teks: 'Kamu tidak sekadar menghafal rumus — kamu melihat sendiri mengapa rumus itu benar, lewat tangga piksel dan lewat aljabar.',
    capaian: [
      'Mengumpulkan data Uₙ dan Sₙ dari tangga blok.',
      'Menemukan Sₙ = n/2 × (a + Uₙ) lewat bukti visual persegi panjang.',
      'Membuktikan rumus secara aljabar dan menurunkan bentuk n/2 × (2a + (n − 1)b).',
      'Menguji rumus pada data dan membuktikan dugaan awal.',
      'Menggunakan rumus Sₙ untuk menyelesaikan masalah sederhana.',
    ],
  },
};
