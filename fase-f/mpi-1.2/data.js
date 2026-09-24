'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Barisan dan Deret Geometri
   Fase F — SMK Rekayasa Perangkat Lunak

   Tujuan Pembelajaran:
   Menjelaskan pola barisan geometri, menurunkan rumus suku ke-n
   dan jumlah n suku deret geometri, serta membandingkan
   karakteristiknya dengan pola aritmetika dalam menyelesaikan
   masalah kontekstual.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'koleksi'
     Sintaks 4 — Data processing ............ tahap 'olahUn' & 'olahSn'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi' & 'bandingkan'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 45 menit, murid berpasangan/kelompok kecil):
     1. Stimulasi   (8')  — dua rencana promosi aplikasi: Plan A (+300
                            pengguna tiap bulan) vs Plan B (dua kali lipat
                            tiap bulan); murid menduga pemenang bulan ke-10
                            dan pemenang total 10 bulan.
     2. Masalah     (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data        (15') — mengungkap suku tiga konteks RPL, mencari a
                            dan r, memilah barisan aritmetika/geometri/
                            bukan keduanya.
     4. Olah data   (20') — tabel pangkat r → rumus Uₙ; trik "kalikan r,
                            geser, kurangkan" → rumus Sₙ.
     5. Bukti       (10') — menguji rumus pada data & dugaan awal.
     6. Simpulan    (7')  — menyusun kesimpulan dari bank kalimat acak.
     7. Bandingkan  (10') — grafik Plan A vs Plan B, titik salip,
                            memilah karakteristik aritmetika vs geometri.
     8. Uji terap   (10') — enam masalah kontekstual RPL campuran.
     9. Refleksi    (5')  — refleksi tertulis & penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan, sehingga tiap murid
   (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Konflik kognitif: Plan B unggul di bulan ke-10 tetapi kalah
     dalam total 10 bulan. Dugaan TIDAK dinilai.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati dua pola pertumbuhan pengguna aplikasi dan menduga mana yang lebih unggul.',
    guru: 'Bacakan kasusnya, lalu minta murid menduga <em>tanpa kalkulator dan tanpa menulis 10 suku</em>. Lakukan voting cepat di kelas. Jangan membenarkan atau menyalahkan dugaan apa pun — murid akan membuktikannya sendiri pada tahap Pembuktian dan Bandingkan.',
    judul: 'Dua Rencana Promosi Aplikasi "KantinKu"',
    cerita:
      'Tim RPL meluncurkan aplikasi pemesanan kantin. Mereka punya dua rencana promosi untuk menambah pengguna baru setiap bulan.',
    planA: {
      nama: 'Plan A — Iklan rutin',
      ket: 'Pengguna baru bertambah 300 orang lebih banyak dari bulan sebelumnya.',
      terms: [300, 600, 900, 1200],
    },
    planB: {
      nama: 'Plan B — Program ajak teman',
      ket: 'Setiap pengguna baru mengajak teman, sehingga pengguna baru menjadi dua kali lipat bulan sebelumnya.',
      terms: [10, 20, 40, 80],
    },
    labels: ['Bulan 1', 'Bulan 2', 'Bulan 3', 'Bulan 4'],
    tail: { label: 'Bulan 10', value: '?' },
    pertanyaanUn:
      'Dugaanmu: pada bulan ke-10, rencana mana yang mendatangkan pengguna baru lebih banyak?',
    opsiUn: [
      { id: 'a', label: 'Plan A (bertambah 300)' },
      { id: 'b', label: 'Plan B (dua kali lipat)' },
      { id: 'sama', label: 'Kira-kira sama banyak' },
    ],
    pertanyaanSn:
      'Dugaanmu: jika dijumlahkan dari bulan 1 sampai bulan 10, rencana mana yang total penggunanya lebih banyak?',
    opsiSn: [
      { id: 'a', label: 'Plan A (bertambah 300)' },
      { id: 'b', label: 'Plan B (dua kali lipat)' },
      { id: 'sama', label: 'Kira-kira sama banyak' },
    ],
    alasanLabel: 'Apa alasan dugaanmu?',
    alasanPlaceholder: 'Contoh: Plan B awalnya kecil, tetapi karena dikali 2 …',
    catatan:
      'Belum ada jawaban benar atau salah. Simpan dugaanmu — nanti kamu sendiri yang akan membuktikannya.',
    nextLabel: 'Simpan Dugaan & Lanjut →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan inti yang perlu diselidiki agar dugaan dapat diuji.',
    guru: 'Arahkan diskusi pada tiga hal: (1) aturan suku ke-n pola "dikali", (2) aturan jumlah n suku, (3) perbedaannya dengan pola "ditambah" yang sudah dipelajari di Materi 1.1. Tulis hipotesis murid di papan tulis tanpa dikoreksi.',
    pengantar:
      'Plan A mirip barisan aritmetika yang sudah kamu kenal: selalu ditambah bilangan yang sama. Plan B berbeda — setiap bulan dikali bilangan yang sama. Menulis sampai bulan ke-10, apalagi ke-24, memakan waktu dan rawan salah.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'rumus',
        label:
          'Adakah aturan umum untuk suku ke-n dan jumlah n suku pada pola "dikali bilangan tetap", dan apa bedanya dengan pola "ditambah bilangan tetap"?',
      },
      { id: 'bulan5', label: 'Berapa pengguna baru Plan B pada bulan ke-5?' },
      { id: 'biaya', label: 'Berapa biaya iklan yang dikeluarkan untuk Plan A?' },
      { id: 'pilih', label: 'Rencana mana yang lebih disukai tim RPL?' },
    ],
    correct: 'rumus',
    umpan: {
      rumus:
        '<strong>Tepat.</strong> Kita akan menyelidiki aturan <em>suku ke-n</em>, aturan <em>jumlah n suku pertama</em>, lalu <em>membandingkannya</em> dengan pola aritmetika.',
      bulan5:
        'Pertanyaan ini bisa dijawab dengan menulis 5 suku saja, tetapi tidak menghasilkan <em>aturan umum</em> untuk bulan ke-n. Coba pilih lagi.',
      biaya:
        'Biaya iklan tidak diberikan pada kasus ini dan tidak membantu membandingkan pertumbuhan pengguna. Coba pilih lagi.',
      pilih:
        'Selera tim tidak bisa diuji dengan matematika. Cari pertanyaan yang membawa ke aturan umum.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu, bagaimana cara mencari pengguna baru Plan B pada bulan ke-n tanpa menulis semua bulan?',
    hipotesisPlaceholder: 'Contoh: karena selalu dikali 2, mungkin 10 dikali 2 sebanyak …',
    nextLabel: 'Mulai Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA
     Bagian A: ungkap suku, cari a dan r (3 konteks RPL).
     Bagian B: pilah barisan aritmetika / geometri / bukan keduanya.
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengumpulkan data suku-suku barisan dan menemukan apa yang tetap di antara suku berurutan.',
    guru: 'Berkeliling antarkelompok. Ajukan pertanyaan pelacak: "Coba hitung selisihnya — tetap atau tidak? Sekarang coba bagi suku berikutnya dengan suku sebelumnya." Untuk data laptop, tanyakan: "Kalau nilainya mengecil, apakah rasionya lebih dari 1 atau kurang dari 1?"',
    instruksiA:
      'Ungkap suku-suku barisan (minimal 4 suku). Coba hitung selisih dua suku berurutan — tetapkah? Lalu coba bagi suku berikutnya dengan suku sebelumnya. Isi suku pertama (a) dan pengali tetapnya, yaitu rasio (r).',
    minReveal: 4,
    konteks: [
      {
        id: 'log',
        badge: 'File Log Server',
        icon: '📄',
        cerita:
          'Server aplikasi mencatat aktivitas pengguna di file log. Hari pertama ukurannya 5 MB, dan setiap hari ukuran log harian menjadi dua kali lipat karena pengguna terus bertambah.',
        terms: [5, 10, 20, 40, 80, 160],
        labels: ['Hari 1', 'Hari 2', 'Hari 3', 'Hari 4', 'Hari 5', 'Hari 6'],
        satuan: 'MB',
        a: 5,
        r: 2,
        hints: [
          'Suku pertama (a) adalah ukuran log pada <strong>Hari 1</strong>.',
          'Selisihnya 5, 10, 20 — tidak tetap. Coba bagi: 10 ÷ 5 = …, 20 ÷ 10 = …',
        ],
      },
      {
        id: 'retry',
        badge: 'Waktu Tunggu Retry API',
        icon: '🔁',
        cerita:
          'Saat koneksi ke API gagal, aplikasi mencoba lagi dengan waktu tunggu yang makin lama (exponential backoff): percobaan ke-1 menunggu 1 detik, lalu waktu tunggu dikali bilangan yang sama setiap percobaan.',
        terms: [1, 3, 9, 27, 81, 243],
        labels: ['Coba 1', 'Coba 2', 'Coba 3', 'Coba 4', 'Coba 5', 'Coba 6'],
        satuan: 'detik',
        a: 1,
        r: 3,
        hints: [
          'Suku pertama (a) adalah waktu tunggu pada <strong>percobaan ke-1</strong>.',
          'Hitung 3 ÷ 1, lalu 9 ÷ 3. Apakah hasilnya sama?',
        ],
      },
      {
        id: 'laptop',
        badge: 'Nilai Laptop Lab',
        icon: '💻',
        cerita:
          'Nilai buku sebuah laptop lab RPL menyusut setiap tahun. Tahun pertama nilainya Rp12.800 ribu, dan setiap tahun nilainya tinggal sebagian tetap dari nilai tahun sebelumnya.',
        terms: [12800, 6400, 3200, 1600, 800, 400],
        labels: ['Thn 1', 'Thn 2', 'Thn 3', 'Thn 4', 'Thn 5', 'Thn 6'],
        satuan: 'ribu rupiah',
        a: 12800,
        r: 0.5,
        hints: [
          'Suku pertama (a) adalah nilai laptop pada <strong>Tahun 1</strong>.',
          'Hitung 6.400 ÷ 12.800. Hasilnya kurang dari 1 karena nilainya mengecil. Boleh ditulis 1/2 atau 0,5.',
        ],
      },
    ],
    temuanA:
      'Pada ketiga data, selisih suku berurutan <strong>tidak tetap</strong>, tetapi <strong>hasil bagi</strong> suku berikutnya dengan suku sebelumnya <strong>selalu sama</strong>. Pengali tetap ini disebut <strong>rasio (r = Uₙ ÷ Uₙ₋₁)</strong>. Jika r &gt; 1 barisannya naik makin cepat; jika 0 &lt; r &lt; 1 barisannya turun makin lambat.',
    instruksiB:
      'Gunakan temuanmu. Periksa selisih dan hasil bagi setiap barisan, lalu tentukan jenisnya.',
    opsiPilah: [
      { id: 'arit', label: 'Aritmetika (+b tetap)' },
      { id: 'geo', label: 'Geometri (×r tetap)' },
      { id: 'bukan', label: 'Bukan keduanya' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: '3, 6, 12, 24, …',
        correct: 'geo',
        explanation: 'Selisihnya berubah (3, 6, 12), tetapi setiap suku dikali 2. Rasio r = 2.',
      },
      {
        id: 'p2',
        teks: '3, 6, 9, 12, …',
        correct: 'arit',
        explanation: 'Selisihnya selalu +3 (b = 3), sedangkan hasil baginya berubah (2; 1,5; …).',
      },
      {
        id: 'p3',
        teks: '81, 27, 9, 3, …',
        correct: 'geo',
        explanation: '27 ÷ 81 = 9 ÷ 27 = 3 ÷ 9 = 1/3. Rasio tetap r = 1/3 (barisan turun).',
      },
      {
        id: 'p4',
        teks: '2, 5, 10, 17, …',
        correct: 'bukan',
        explanation: 'Selisihnya 3, 5, 7 (tidak tetap) dan hasil baginya juga tidak tetap.',
      },
      {
        id: 'p5',
        teks: '100, 90, 80, 70, …',
        correct: 'arit',
        explanation:
          'Selisihnya selalu −10. Walau turun, polanya dikurangi (ditambah −10), bukan dikali.',
      },
      {
        id: 'p6',
        teks: '1, −2, 4, −8, …',
        correct: 'geo',
        explanation: 'Setiap suku dikali −2. Rasio boleh negatif — tanda sukunya berganti-ganti.',
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
    goal: 'Mengolah pola pangkat rasio untuk menurunkan rumus suku ke-n barisan geometri.',
    guru: 'Minta kelompok membaca kolom pangkat secara vertikal: 0, 1, 2, 3, … Tanyakan: "Pangkat r selalu kurang berapa dari n? Samakah dengan pola koefisien b di barisan aritmetika?" Biarkan murid sendiri yang mengucapkan "n − 1".',
    konteks: 'File log server: a = 5, r = 2',
    a: 5,
    r: 2,
    terms: [5, 10, 20, 40, 80],
    instruksi:
      'Setiap suku dapat ditulis sebagai suku pertama dikali rasio beberapa kali. Isi pangkat r (berapa kali dikali 2) pada setiap baris.',
    baris: [1, 2, 3, 4, 5, 8, 12],
    hints: [
      'U₂ = 10 = 5 × 2<sup>1</sup>. U₃ = 20 = 5 × 2 × 2 = 5 × 2<sup>2</sup>. U₁ = 5 = 5 × 2<sup>0</sup>.',
      'Dari Hari 1 ke Hari n ada berapa "lompatan ×2"? Hitung busur di antara kotak-kotak.',
      'Banyak lompatan selalu satu kurang dari nomor suku: pangkat = n − 1.',
    ],
    temuanTabel:
      'Pangkat r selalu <strong>satu kurang</strong> dari nomor suku. Suku ke-8 memuat 2<sup>7</sup>, suku ke-12 memuat 2<sup>11</sup>. Polanya sama dengan koefisien b di barisan aritmetika — bedanya, di sini berupa <em>pangkat</em> karena perkaliannya berulang.',
    pertanyaanRumus: 'Berdasarkan pola pada tabel, rumus umum suku ke-n barisan geometri adalah …',
    opsiRumus: [
      { id: 'benar', label: 'Uₙ = a · rⁿ⁻¹' },
      { id: 'rn', label: 'Uₙ = a · rⁿ' },
      { id: 'arit', label: 'Uₙ = a + (n − 1)r' },
      { id: 'kali', label: 'Uₙ = a · r · n' },
    ],
    correctRumus: 'benar',
    umpanRumus: {
      benar: '<strong>Hebat!</strong> Kamu menemukan rumus suku ke-n barisan geometri.',
      rn: 'Uji dengan n = 1: 5 × 2¹ = 10, padahal U₁ = 5. Pangkat r harus 0 saat n = 1.',
      arit: 'Ini pola aritmetika (ditambah). Uji n = 3: 5 + 2 × 2 = 9, padahal U₃ = 20.',
      kali: 'Uji n = 4: 5 × 2 × 4 = 40 ✓, tetapi n = 5: 5 × 2 × 5 = 50, padahal U₅ = 80. Perkaliannya berulang, bukan dikali n.',
    },
    ujiLabel: 'Pakai rumus temuanmu: berapa MB ukuran log pada Hari 10?',
    ujiJawab: 2560,
    ujiHints: ['U₁₀ = a · r⁹ = 5 × 2⁹.', '2⁹ = 512, jadi U₁₀ = 5 × 512.'],
    ujiTemuan: 'U₁₀ = 5 × 2⁹ = 5 × 512 = <strong>2.560 MB</strong>. Tanpa menulis 10 suku!',
    nextLabel: 'Lanjut: Cari Aturan Sₙ →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — PENGOLAHAN DATA: RUMUS Sₙ
     Trik "kalikan r, geser, kurangkan": suku kembar saling hapus.
     ---------------------------------------------------------- */
  olahSn: {
    kicker: 'Tahap 4 · Pengolahan Data (Sₙ)',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan rumus jumlah n suku pertama deret geometri dengan trik mengalikan r lalu mengurangkan.',
    guru: 'Ingatkan trik Gauss di deret aritmetika (maju + mundur). Tanyakan: "Apakah trik itu berhasil di sini? Pasangan 1 + 81 dan 3 + 27 tidak sama." Lalu perkenalkan ide baru: kalikan deret dengan r agar sukunya "bergeser" satu langkah. Biarkan murid mencoret sendiri suku kembarnya.',
    konteks: 'Total waktu tunggu 5 percobaan retry: S₅ = 1 + 3 + 9 + 27 + 81 (a = 1, r = 3)',
    terms: [1, 3, 9, 27, 81],
    r: 3,
    instruksiGrid:
      'Baris atas adalah S₅. Baris bawah adalah 3 × S₅: setiap suku dikali r = 3, sehingga sukunya bergeser satu kolom ke kanan. Klik setiap pasangan suku kembar (atas–bawah) untuk mencoretnya.',
    langkah: [
      {
        id: 'sisa',
        label: 'Setelah suku kembar dicoret, yang tersisa hanya 243 dan 1. Berapa 3S₅ − S₅?',
        jawab: 242,
        hints: ['Suku yang tersisa: 243 di baris bawah dan 1 di baris atas. Hitung 243 − 1.'],
        temuan:
          '3S₅ − S₅ = 243 − 1 = <strong>242</strong>. Perhatikan: 243 = a · r⁵ dan 1 = a. Jadi r·Sₙ − Sₙ = a·rⁿ − a.',
      },
      {
        id: 'duaS',
        label: '3S₅ − S₅ sama dengan (3 − 1) × S₅ = 2S₅. Jadi, berapa S₅?',
        jawab: 121,
        hints: ['2S₅ = 242. Bagi kedua ruas dengan 2 (yaitu r − 1).'],
        temuan: 'S₅ = 242 ÷ 2 = <strong>121</strong>. Cek manual: 1 + 3 + 9 + 27 + 81 = 121 ✓',
      },
    ],
    pertanyaan1: 'Tulis ulang langkahmu secara umum: (r − 1)Sₙ = a·rⁿ − a. Maka Sₙ = …',
    opsi1: [
      { id: 'benar', label: 'Sₙ = a(rⁿ − 1) / (r − 1)' },
      { id: 'n1', label: 'Sₙ = a(rⁿ⁻¹ − 1) / (r − 1)' },
      { id: 'bagiR', label: 'Sₙ = a(rⁿ − 1) / r' },
      { id: 'arit', label: 'Sₙ = n/2 × (a + Uₙ)' },
    ],
    correct1: 'benar',
    umpan1: {
      benar:
        '<strong>Tepat.</strong> a·rⁿ − a = a(rⁿ − 1), lalu kedua ruas dibagi (r − 1). Uji: 1 × (3⁵ − 1)/(3 − 1) = 242/2 = 121 ✓',
      n1: 'Suku yang tersisa di baris bawah adalah a·rⁿ (243 = 3⁵), bukan a·rⁿ⁻¹. Uji: (3⁴ − 1)/2 = 40 ≠ 121.',
      bagiR: 'Yang mengalikan Sₙ adalah (r − 1), bukan r. Uji: (243 − 1)/3 ≈ 80,7 ≠ 121.',
      arit: 'Itu rumus deret aritmetika. Uji: 5/2 × (1 + 81) = 205 ≠ 121. Trik Gauss tidak berlaku di sini.',
    },
    pertanyaan2:
      'Untuk data nilai laptop (r = 1/2), r − 1 dan rⁿ − 1 sama-sama negatif. Bentuk mana yang setara dan lebih nyaman dipakai saat 0 < r < 1?',
    opsi2: [
      { id: 'benar', label: 'Sₙ = a(1 − rⁿ) / (1 − r)' },
      { id: 'tanda', label: 'Sₙ = a(1 − rⁿ) / (r − 1)' },
      { id: 'tanpaBagi', label: 'Sₙ = a(1 − rⁿ)' },
      { id: 'arit', label: 'Sₙ = n/2 × (2a + (n − 1)r)' },
    ],
    correct2: 'benar',
    umpan2: {
      benar:
        '<strong>Luar biasa!</strong> Pembilang dan penyebut sama-sama dikali −1, jadi nilainya tidak berubah dan hasilnya positif.',
      tanda:
        'Hanya pembilangnya yang dibalik tandanya, sehingga hasilnya menjadi negatif. Balik keduanya.',
      tanpaBagi: 'Pembagian dengan (1 − r) hilang. Coba lagi.',
      arit: 'Itu rumus deret aritmetika dengan r menggantikan b. Polanya dikali, bukan ditambah.',
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
    guru: 'Minta murid membandingkan hasil rumus dengan data/penjumlahan manual. Pada bagian dugaan, beri apresiasi pada proses berpikir, bukan pada tepat-tidaknya dugaan awal. Soroti kejutan: Plan B menang di bulan ke-10 tetapi kalah total.',
    uji: [
      {
        id: 'lU6',
        grup: 'A',
        label: 'Nilai laptop (a = 12.800, r = 1/2). Hitung U₆ dengan rumus (ribu rupiah).',
        jawab: 400,
        hints: ['U₆ = 12.800 × (1/2)⁵ = 12.800 ÷ 32.'],
        bukti: 'Data Tahun 6 pada tahap Pengumpulan Data juga 400 ✓',
      },
      {
        id: 'lS6',
        grup: 'A',
        label: 'Hitung S₆: jumlah nilai laptop tahun 1–6 (ribu rupiah).',
        jawab: 25200,
        hints: [
          'Pakai Sₙ = a(1 − rⁿ)/(1 − r) = 12.800 × (1 − 1/64) ÷ (1/2).',
          '12.800 ÷ (1/2) = 25.600, dan 25.600 × 63/64 = 400 × 63.',
        ],
        bukti: 'Cek manual: 12.800 + 6.400 + 3.200 + 1.600 + 800 + 400 = 25.200 ✓',
      },
      {
        id: 'bU10',
        grup: 'B',
        label: 'Plan B (a = 10, r = 2). Berapa pengguna baru pada bulan ke-10?',
        jawab: 5120,
        hints: ['U₁₀ = 10 × 2⁹ = 10 × 512.'],
        bukti: 'Plan B: U₁₀ = 5.120 pengguna.',
      },
      {
        id: 'aU10',
        grup: 'B',
        label: 'Plan A (a = 300, b = 300). Berapa pengguna baru pada bulan ke-10?',
        jawab: 3000,
        hints: ['Ini barisan aritmetika: U₁₀ = a + 9b = 300 + 9 × 300.'],
        bukti: 'Plan A: U₁₀ = 3.000 pengguna. Di bulan ke-10, Plan B unggul.',
      },
      {
        id: 'bS10',
        grup: 'B',
        label: 'Berapa total pengguna Plan B dari bulan 1 sampai bulan 10?',
        jawab: 10230,
        hints: ['S₁₀ = 10 × (2¹⁰ − 1)/(2 − 1) = 10 × (1.024 − 1).'],
        bukti: 'Plan B: S₁₀ = 10.230 pengguna.',
      },
      {
        id: 'aS10',
        grup: 'B',
        label: 'Berapa total pengguna Plan A dari bulan 1 sampai bulan 10?',
        jawab: 16500,
        hints: ['Deret aritmetika: S₁₀ = 10/2 × (a + U₁₀) = 5 × (300 + 3.000).'],
        bukti: 'Plan A: S₁₀ = 16.500 pengguna. Dalam total 10 bulan, Plan A masih unggul!',
      },
    ],
    judulA: 'A. Uji rumus pada data nilai laptop (r = 1/2)',
    judulB: 'B. Kembali ke dugaan awalmu: Plan A vs Plan B',
    dugaanUnBenar: 'b',
    dugaanSnBenar: 'a',
    nextLabel: 'Tarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Merumuskan kesimpulan tentang pola, rumus Uₙ, dan rumus Sₙ barisan dan deret geometri.',
    guru: 'Minta perwakilan kelompok membacakan kesimpulannya. Konfirmasi dan kaitkan dengan istilah formal: suku pertama (a), rasio (r), suku ke-n (Uₙ), deret geometri, jumlah n suku pertama (Sₙ).',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'Barisan geometri adalah barisan bilangan yang', correct: 'b1' },
      { id: 'k2', awal: 'Rasio (r) barisan geometri dapat dihitung dengan', correct: 'b2' },
      { id: 'k3', awal: 'Suku ke-n barisan geometri dirumuskan', correct: 'b3' },
      {
        id: 'k4',
        awal: 'Jumlah n suku pertama deret geometri dengan r > 1 dirumuskan',
        correct: 'b4',
      },
      { id: 'k5', awal: 'Untuk 0 < r < 1, bentuk yang nyaman dipakai adalah', correct: 'b5' },
    ],
    bank: [
      { id: 'b1', teks: 'hasil bagi dua suku berurutannya selalu tetap' },
      { id: 'b2', teks: 'r = Uₙ ÷ Uₙ₋₁' },
      { id: 'b3', teks: 'Uₙ = a · rⁿ⁻¹' },
      { id: 'b4', teks: 'Sₙ = a(rⁿ − 1) / (r − 1)' },
      { id: 'b5', teks: 'Sₙ = a(1 − rⁿ) / (1 − r)' },
      { id: 'x1', teks: 'selisih dua suku berurutannya selalu tetap' },
      { id: 'x2', teks: 'r = Uₙ − Uₙ₋₁' },
      { id: 'x3', teks: 'Uₙ = a · rⁿ' },
      { id: 'x4', teks: 'Sₙ = n/2 × (a + Uₙ)' },
    ],
    rangkuman: [
      'Barisan geometri: U₁, U₂, U₃, … dengan pengali tetap <strong>r = Uₙ ÷ Uₙ₋₁</strong> (r ≠ 0, r ≠ 1).',
      'Suku ke-n: <strong>Uₙ = a · rⁿ⁻¹</strong> — suku pertama dikali r sebanyak (n − 1) kali.',
      'Deret geometri: U₁ + U₂ + … + Uₙ, dengan jumlah <strong>Sₙ = a(rⁿ − 1)/(r − 1)</strong> untuk r &gt; 1, atau <strong>Sₙ = a(1 − rⁿ)/(1 − r)</strong> untuk r &lt; 1.',
    ],
    nextLabel: 'Bandingkan dengan Aritmetika →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — BANDINGKAN ARITMETIKA vs GEOMETRI
     A: grafik Plan A vs Plan B + titik salip.
     B: pilah karakteristik (aritmetika / geometri).
     ---------------------------------------------------------- */
  bandingkan: {
    kicker: 'Tahap 7 · Bandingkan Pola',
    syntax: DL + ' · Sintaks 6 (lanjutan)',
    goal: 'Membandingkan karakteristik barisan aritmetika dan geometri untuk memilih model yang tepat.',
    guru: 'Tampilkan grafik di layar kelas. Geser slider perlahan dan minta murid menebak kapan batang oranye menyalip batang biru. Diskusikan: "Pertumbuhan mana yang cocok untuk gaji dengan kenaikan tetap? Untuk penyebaran pesan berantai?"',
    maxBulan: 12,
    aA: 300,
    bA: 300,
    aB: 10,
    rB: 2,
    labelA: 'Plan A (aritmetika, +300)',
    labelB: 'Plan B (geometri, ×2)',
    instruksiA:
      'Geser slider untuk menambah bulan. Pilih tampilan pengguna baru per bulan (Uₙ) atau total pengguna (Sₙ). Amati bentuk pertumbuhan kedua rencana.',
    langkah: [
      {
        id: 'salipUn',
        label: 'Mulai bulan ke berapa pengguna baru Plan B <em>melampaui</em> Plan A?',
        jawab: 10,
        hints: [
          'Pilih tampilan "Pengguna baru (Uₙ)", lalu geser slider dan bandingkan batangnya.',
          'Bulan 9: A = 2.700, B = 2.560. Bulan 10: A = 3.000, B = …',
        ],
        temuan: 'Bulan 10: Plan B = 5.120 &gt; Plan A = 3.000. Sebelumnya Plan A selalu unggul.',
      },
      {
        id: 'salipSn',
        label: 'Mulai bulan ke berapa <em>total</em> pengguna Plan B melampaui Plan A?',
        jawab: 11,
        hints: [
          'Pilih tampilan "Total pengguna (Sₙ)", lalu geser slider.',
          'Bulan 10: total A = 16.500, total B = 10.230. Periksa bulan 11.',
        ],
        temuan:
          'Bulan 11: total B = 20.470 &gt; total A = 19.800. Setelah itu jaraknya makin jauh — ciri pertumbuhan eksponensial.',
      },
    ],
    temuanGrafik:
      'Batang Plan A naik dengan <strong>tambahan yang sama</strong> (pola linear). Batang Plan B mula-mula kecil, tetapi <strong>kenaikannya sendiri makin besar</strong> (pola eksponensial), sehingga akhirnya menyalip dan meninggalkan Plan A jauh.',
    instruksiB:
      'Tentukan apakah setiap pernyataan berikut merupakan ciri barisan/deret aritmetika atau geometri.',
    opsiCiri: [
      { id: 'arit', label: 'Aritmetika' },
      { id: 'geo', label: 'Geometri' },
    ],
    ciri: [
      {
        id: 'c1',
        teks: 'Suku berikutnya diperoleh dengan <strong>menambahkan</strong> bilangan tetap.',
        correct: 'arit',
        explanation: 'Bilangan tetap yang ditambahkan disebut beda (b).',
      },
      {
        id: 'c2',
        teks: 'Suku berikutnya diperoleh dengan <strong>mengalikan</strong> bilangan tetap.',
        correct: 'geo',
        explanation: 'Pengali tetap disebut rasio (r).',
      },
      {
        id: 'c3',
        teks: 'Titik-titik sukunya pada grafik membentuk <strong>garis lurus</strong> (pertumbuhan linear).',
        correct: 'arit',
        explanation: 'Kenaikan tiap langkah sama besar, seperti batang Plan A.',
      },
      {
        id: 'c4',
        teks: 'Untuk r &gt; 1, grafiknya <strong>melengkung naik makin curam</strong> (pertumbuhan eksponensial).',
        correct: 'geo',
        explanation: 'Kenaikan tiap langkah ikut dikali r, seperti batang Plan B.',
      },
      {
        id: 'c5',
        teks: 'Suku ke-n: <strong>Uₙ = a + (n − 1)b</strong>',
        correct: 'arit',
        explanation: 'Suku pertama ditambah (n − 1) kali beda.',
      },
      {
        id: 'c6',
        teks: 'Suku ke-n: <strong>Uₙ = a · rⁿ⁻¹</strong>',
        correct: 'geo',
        explanation: 'Suku pertama dikali (n − 1) kali rasio.',
      },
      {
        id: 'c7',
        teks: 'Jumlah n suku dicari dengan trik <strong>mengalikan r lalu mengurangkan</strong>.',
        correct: 'geo',
        explanation: 'Suku kembar saling hapus sehingga Sₙ = a(rⁿ − 1)/(r − 1).',
      },
      {
        id: 'c8',
        teks: 'Jumlah n suku dicari dengan trik Gauss: <strong>pasangan depan–belakang bernilai sama</strong>.',
        correct: 'arit',
        explanation: 'Sₙ = n/2 × (a + Uₙ). Trik ini gagal pada deret geometri.',
      },
    ],
    tabel: [
      ['Aturan pola', '+ b (beda tetap)', '× r (rasio tetap)'],
      ['Mencari pola', 'b = Uₙ − Uₙ₋₁', 'r = Uₙ ÷ Uₙ₋₁'],
      ['Suku ke-n', 'Uₙ = a + (n − 1)b', 'Uₙ = a · rⁿ⁻¹'],
      ['Jumlah n suku', 'Sₙ = n/2 × (2a + (n − 1)b)', 'Sₙ = a(rⁿ − 1)/(r − 1)'],
      ['Bentuk grafik', 'Garis lurus (linear)', 'Lengkung (eksponensial)'],
      ['Contoh RPL', 'Biaya hosting naik tetap', 'Pesan berantai, file log berlipat'],
    ],
    nextLabel: 'Terapkan pada Masalah Nyata →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP (dirender createExerciseStage)
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    goal: 'Memilih model aritmetika atau geometri dan menerapkan rumusnya untuk menyelesaikan masalah kontekstual.',
    guru: 'Amati strategi murid: apakah mereka menentukan jenis pola (ditambah atau dikali) lebih dulu sebelum memilih rumus? Soal pilihan ganda dapat dijadikan bahan diskusi pengecoh.',
    instruksi:
      'Tentukan dulu apakah polanya ditambah (aritmetika) atau dikali (geometri), cari a, b atau r, dan n, lalu pilih rumus yang sesuai. Tulis jawaban berupa bilangan bulat (tanpa satuan).',
    soal: [
      {
        type: 'input',
        cerita:
          'Video tutorial coding di kanal sekolah ditonton 50 kali pada hari pertama. Setiap hari, penontonnya menjadi 3 kali lipat hari sebelumnya.',
        pertanyaan: 'Berapa penonton pada <strong>hari ke-6</strong>?',
        jawab: 12150,
        hints: [
          'Pola dikali 3 → geometri. a = 50, r = 3, n = 6. Yang ditanya Uₙ.',
          'U₆ = 50 × 3⁵ = 50 × 243.',
        ],
        explanation: 'U₆ = 50 × 3⁵ = 50 × 243 = 12.150 penonton.',
        reveal: 'U₆ = 50 × 3⁵ = <strong>12.150</strong>.',
      },
      {
        type: 'choice',
        cerita: 'Tim RPL sedang memilih model matematika yang tepat untuk beberapa situasi.',
        pertanyaan: 'Situasi manakah yang dimodelkan dengan <strong>barisan geometri</strong>?',
        options: [
          { id: 'a', label: 'Perangkat terinfeksi malware menjadi 3 kali lipat setiap jam.' },
          { id: 'b', label: 'Gaji programmer magang naik Rp150.000 setiap bulan.' },
          { id: 'c', label: 'Kursi auditorium bertambah 4 kursi setiap baris.' },
          { id: 'd', label: 'Kuota internet berkurang 2 GB setiap hari.' },
        ],
        correct: 'a',
        explanation:
          'Hanya malware yang dikali bilangan tetap (r = 3). Gaji, kursi, dan kuota bertambah/berkurang bilangan tetap → aritmetika.',
      },
      {
        type: 'input',
        cerita:
          'Admin grup mengirim pengumuman lomba coding ke 4 orang (tahap 1). Setiap penerima meneruskannya ke 4 orang baru, sehingga tahap 2 ada 16 penerima baru, dan seterusnya.',
        pertanyaan: 'Berapa <strong>total penerima</strong> pengumuman sampai tahap 5?',
        jawab: 1364,
        hints: [
          'Yang ditanya jumlah → Sₙ deret geometri. a = 4, r = 4, n = 5.',
          'S₅ = 4 × (4⁵ − 1)/(4 − 1) = 4 × 1.023 ÷ 3.',
        ],
        explanation: 'S₅ = 4(4⁵ − 1)/3 = 4 × 1.023/3 = 1.364 orang.',
        reveal: 'S₅ = 4 × 1.023 ÷ 3 = <strong>1.364</strong>.',
      },
      {
        type: 'choice',
        cerita:
          'Sebuah server dibeli seharga Rp80.000.000 (nilai tahun ke-1). Setiap tahun nilainya tinggal ¾ dari nilai tahun sebelumnya.',
        pertanyaan: 'Berapa nilai server pada <strong>tahun ke-4</strong>?',
        options: [
          { id: 'a', label: 'Rp33.750.000' },
          { id: 'b', label: 'Rp25.312.500' },
          { id: 'c', label: 'Rp20.000.000' },
          { id: 'd', label: 'Rp60.000.000' },
        ],
        correct: 'a',
        explanation:
          'U₄ = 80.000.000 × (¾)³ = 80.000.000 × 27/64 = Rp33.750.000. (Rp25.312.500 memakai pangkat n, bukan n − 1; Rp20.000.000 menganggap nilainya berkurang tetap Rp20 juta per tahun — pola aritmetika; Rp60.000.000 adalah nilai tahun ke-2.)',
      },
      {
        type: 'input',
        cerita:
          'Dua tawaran uang saku magang selama 6 bulan. Tawaran P: Rp1.000.000 di bulan pertama, naik Rp200.000 setiap bulan. Tawaran Q: Rp500.000 di bulan pertama, lalu dua kali lipat setiap bulan.',
        pertanyaan:
          'Berapa rupiah <strong>selisih total</strong> uang saku 6 bulan kedua tawaran (total Q − total P)?',
        jawab: 22500000,
        hints: [
          'P aritmetika: S₆ = 6/2 × (2 × 1.000.000 + 5 × 200.000). Q geometri: S₆ = 500.000 × (2⁶ − 1).',
          'Total P = 9.000.000; total Q = 500.000 × 63 = 31.500.000.',
        ],
        explanation:
          'Total P = 3 × 3.000.000 = Rp9.000.000; total Q = 500.000 × 63 = Rp31.500.000; selisih Rp22.500.000.',
        reveal: '31.500.000 − 9.000.000 = <strong>22.500.000</strong>.',
      },
      {
        type: 'input',
        cerita:
          'Pemakaian penyimpanan cloud sebuah aplikasi 3 GB pada bulan pertama, lalu dua kali lipat setiap bulan.',
        pertanyaan: 'Pada <strong>bulan ke berapa</strong> pemakaian bulanannya mencapai 96 GB?',
        jawab: 6,
        hints: ['Yang dicari n. Tulis 96 = 3 × 2ⁿ⁻¹.', '2ⁿ⁻¹ = 32 = 2⁵, jadi n − 1 = 5.'],
        explanation: '3 × 2ⁿ⁻¹ = 96 → 2ⁿ⁻¹ = 32 = 2⁵ → n = 6.',
        reveal: '2ⁿ⁻¹ = 32 = 2⁵ → n − 1 = 5 → n = <strong>6</strong>.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    goal: 'Merefleksikan proses menemukan rumus dan kesiapan memilih model yang tepat.',
    guru: 'Pilih 2–3 murid untuk membagikan refleksinya. Gunakan penilaian diri untuk menentukan murid yang memerlukan pendampingan lanjutan.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Dengan kata-katamu sendiri, apa perbedaan utama barisan aritmetika dan barisan geometri?',
        placeholder: 'Tuliskan penjelasanmu …',
      },
      {
        id: 'r2',
        teks: 'Mengapa trik "kalikan r lalu kurangkan" membuat hampir semua suku hilang?',
        placeholder: 'Tuliskan pengalamanmu …',
      },
      {
        id: 'r3',
        teks: 'Plan B unggul di bulan ke-10 tetapi kalah total 10 bulan. Jika kamu tim RPL, rencana mana yang kamu pilih untuk 6 bulan dan untuk 2 tahun? Mengapa?',
        placeholder: 'Contoh: untuk jangka pendek aku pilih …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu membedakan pola aritmetika & geometri serta memakai rumusnya sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '🙂 Yakin — tetapi masih perlu melihat catatan' },
      { id: 'ragu', label: '🤔 Masih ragu — perlu latihan lagi' },
      { id: 'bingung', label: '🆘 Belum paham — perlu bimbingan guru' },
    ],
    nextLabel: 'Simpan Refleksi & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Penemuanmu Tuntas!',
    teks: 'Kamu menemukan sendiri aturan pola "dikali", mengujinya pada data, lalu membandingkannya dengan pola "ditambah".',
    capaian: [
      'Menjelaskan pola barisan geometri melalui rasio yang tetap.',
      'Menurunkan rumus suku ke-n: Uₙ = a · rⁿ⁻¹.',
      'Menurunkan rumus jumlah n suku pertama: Sₙ = a(rⁿ − 1)/(r − 1).',
      'Membandingkan karakteristik barisan aritmetika dan geometri, lalu memilih model yang tepat untuk masalah kontekstual RPL.',
    ],
  },
};
