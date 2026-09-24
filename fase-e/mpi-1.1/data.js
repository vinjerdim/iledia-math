'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Sifat-sifat Eksponen Bulat
   Fase E (Kelas X) — SMK Rekayasa Perangkat Lunak

   Tujuan Pembelajaran:
   Menemukan dan menjelaskan sifat-sifat eksponen bulat (positif,
   negatif, dan nol), termasuk makna a⁰ = 1 dan a⁻ⁿ = 1/aⁿ, melalui
   pengamatan pola dan penalaran.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'koleksi'
     Sintaks 4 — Data processing ............ tahap 'olahSifat' & 'olahNolNegatif'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 45 menit, murid berpasangan):
     1. Stimulasi     (7')  — "Zoom PixelKu": Dina membuat fitur zoom di
                              aplikasi editor gambar. Tombol ×2 / ÷2
                              menghasilkan faktor skala 2⁴, 2³, 2², 2¹, …
                              Berapa 2⁰ (tanpa klik) dan 2⁻² (dua kali
                              ÷2)? Murid menduga (tidak dinilai) + alasan.
     2. Masalah       (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data          (15') — A: tangga pangkat basis 2 dan 3 sampai
                              pangkat −2 (isian eksak, diagnosa
                              miskonsepsi); B: ubin faktor untuk
                              perkalian, pembagian, pangkat dari pangkat,
                              pangkat dari perkalian; C: pilah pernyataan.
     4a. Olah sifat   (12') — dari ubin faktor ke aturan eksponen:
                              aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ : aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐˣⁿ,
                              (ab)ⁿ = aⁿbⁿ, (a : b)ⁿ = aⁿ : bⁿ.
     4b. Olah nol/neg (12') — dua jalan penalaran: pola tangga pangkat
                              10 (tiap turun ÷10) dan sifat pembagian
                              (aⁿ : aⁿ = a⁰ = 1; a² : a⁵ = a⁻³ = 1/a³);
                              mengapa a ≠ 0.
     5. Pembuktian    (12') — lab uji sifat (eksponen positif, nol,
                              negatif) termasuk mencari contoh penyangkal
                              dua dugaan keliru; membuktikan dugaan awal;
                              memilah miskonsepsi.
     6. Simpulan      (7')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap     (15') — delapan soal (isian & pilihan ganda),
                              termasuk konteks KB/MB dan zoom.
     8. Refleksi      (5')  — refleksi tertulis & penilaian diri.

   Metadata `cek` pada setiap langkah isian/soal dipakai tes untuk
   memeriksa kunci jawaban secara numerik (bebas dari rumus sifat):
     { jenis: 'nilai',  a, n }             jawab = aⁿ
     { jenis: 'setara', a, kali, bagi, luar }
          a^jawab = (Π a^kali ÷ Π a^bagi)^luar; unsur kali/bagi berupa
          n (aⁿ) atau [m, n] ((aᵐ)ⁿ)
     { jenis: 'jumlah', suku: [[a, n], …] } jawab = Σ aⁿ

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan, sehingga tiap murid
   (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  kasus: {
    nama: 'Dina',
    aplikasi: 'PixelKu',
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Pembuktian.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati pola faktor skala zoom lalu menduga nilai 2⁰ dan 2⁻².',
    guru: 'Tayangkan tabel zoom PixelKu. Tanyakan: "Apa yang terjadi pada faktor skala setiap kali eksponennya berkurang 1?" Minta murid menduga 2⁰ dan 2⁻² <em>tanpa</em> diberi tahu aturannya. Tampung semua dugaan (termasuk 0 dan −4) tanpa dikoreksi.',
    judul: 'Zoom di Aplikasi PixelKu',
    cerita:
      'Dina, siswi RPL, sedang membuat fitur zoom untuk aplikasi editor gambar PixelKu. Setiap klik tombol "×2" memperbesar gambar dua kali lipat, dan setiap klik "÷2" memperkecilnya menjadi setengah. Dina menuliskan faktor skalanya sebagai bilangan berpangkat 2.',
    aturan:
      'Eksponen = banyak klik ×2 (positif) atau ÷2 (negatif) dari ukuran asli. Eksponen 0 berarti tidak ada klik sama sekali.',
    tangga: { a: 2, dari: 4, sampai: -2, diketahui: [4, 3, 2, 1] },
    pertanyaan: 'Dugaanmu: berapa nilai 2⁰ (ukuran asli) dan 2⁻² (dua kali klik ÷2)?',
    opsi: [
      { id: 'o1', label: '2⁰ = 1 dan 2⁻² = 1/4' },
      { id: 'o2', label: '2⁰ = 0 dan 2⁻² = −4' },
      { id: 'o3', label: '2⁰ = 2 dan 2⁻² = −2' },
      { id: 'o4', label: '2⁰ = 0 dan 2⁻² = 1/4' },
    ],
    alasanLabel: 'Bagaimana kamu mendapatkan dugaan itu?',
    alasanPlaceholder: 'Contoh: dari 2⁴ ke 2³ nilainya …, jadi dari 2¹ ke 2⁰ …',
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
    goal: 'Merumuskan pertanyaan inti tentang pola dan makna eksponen bulat.',
    guru: 'Arahkan pada dua hal: (1) aturan apa yang berlaku saat bilangan berpangkat dikalikan, dibagi, atau dipangkatkan, dan (2) apa makna eksponen 0 dan eksponen negatif, yang tidak bisa diartikan sebagai "perkalian berulang". Tulis hipotesis murid di papan.',
    pengantar:
      'Selama ini 2⁴ diartikan sebagai 2 × 2 × 2 × 2 (empat faktor 2). Tetapi apa artinya "nol faktor 2" atau "minus dua faktor 2"? Dina perlu aturan yang jelas agar kode zoom-nya tidak salah hitung.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'pola',
        label:
          'Pola apa yang berlaku saat bilangan berpangkat dikalikan, dibagi, atau dipangkatkan, dan apa makna eksponen nol serta eksponen negatif?',
      },
      { id: 'hitung', label: 'Berapa hasil 2 × 2 × 2 × 2?' },
      { id: 'zoom', label: 'Berapa kali maksimal tombol zoom boleh ditekan?' },
      { id: 'kalku', label: 'Tombol kalkulator mana yang dipakai untuk menghitung pangkat?' },
    ],
    correct: 'pola',
    umpan: {
      pola: '<strong>Tepat.</strong> Kita akan <em>menemukan</em> sifat-sifat eksponen dari pola, lalu memakainya untuk memaknai a⁰ dan a⁻ⁿ.',
      hitung:
        '2 × 2 × 2 × 2 = 16 sudah terlihat di tabel. Pertanyaan ini tidak membantu memaknai 2⁰ atau 2⁻². Coba pilih lagi.',
      zoom: 'Itu keputusan desain aplikasi, bukan pertanyaan matematika tentang pola eksponen. Coba pilih lagi.',
      kalku:
        'Kalkulator bisa menghitung, tetapi tidak menjelaskan <em>mengapa</em> 2⁰ bernilai seperti itu. Coba pilih lagi.',
    },
    hipotesisLabel: 'Tulis hipotesismu: menurutmu apa makna 2⁰ dan 2⁻²?',
    hipotesisPlaceholder: 'Contoh: mungkin setiap eksponen turun 1, nilainya …',
    nextLabel: 'Mulai Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA
     A: tangga pangkat. B: ubin faktor. C: pilah pernyataan.
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengumpulkan data nilai bilangan berpangkat dan banyak faktornya.',
    guru: 'Biarkan murid menemukan sendiri bahwa setiap turun satu anak tangga nilainya dibagi basis. Jika murid menulis 2⁰ = 0 atau 2⁻¹ = −2, jangan langsung dikoreksi — ajukan pertanyaan pelacak: "Dari 2¹ ke 2⁰, operasi apa yang dilakukan pada anak tangga sebelumnya?"',
    judulA: 'A. Tangga pangkat',
    instruksiA:
      'Lengkapi kedua tangga pangkat. Perhatikan apa yang terjadi setiap kali eksponen turun 1. Tulis pecahan dengan garis miring, mis. 1/4.',
    tangga: [
      { id: 'tg2', a: 2, dari: 4, sampai: -2, diketahui: [4] },
      { id: 'tg3', a: 3, dari: 3, sampai: -2, diketahui: [3] },
    ],
    hintsTangga: [
      'Dari 2⁴ = 16 ke 2³ nilainya dibagi 2 (16 : 2 = 8). Teruskan pola "dibagi 2" sampai anak tangga terbawah.',
      '2¹ = 2, jadi 2⁰ = 2 : 2. Lalu 2⁻¹ = 2⁰ : 2 (tulis sebagai pecahan).',
      'Untuk basis 3: 3⁰ = 3 : 3 = 1, 3⁻¹ = 1 : 3 = 1/3, 3⁻² = 1/3 : 3 = 1/9.',
    ],
    judulB: 'B. Ubin faktor',
    instruksiB:
      'Setiap ubin adalah satu faktor. Hitung banyak faktor, lalu tulis hasilnya sebagai satu bilangan berpangkat.',
    ubin: [
      {
        visual: { jenis: 'kali', a: 2, m: 3, n: 2 },
        label: '2³ × 2² = (2 × 2 × 2) × (2 × 2). Banyak faktor 2 seluruhnya = …',
        jawab: 5,
        hints: ['Hitung ubin biru dan ubin oranye bersama-sama.'],
        temuan: '5 faktor 2, jadi 2³ × 2² = 2⁵. Perhatikan: 3 + 2 = 5.',
        cek: { jenis: 'setara', a: 2, kali: [3, 2] },
      },
      {
        visual: { jenis: 'bagi', a: 3, m: 5, n: 2, coret: true },
        label:
          '3⁵ : 3² ditulis sebagai pecahan. Coret pasangan faktor atas–bawah. Sisa faktor 3 = …',
        jawab: 3,
        hints: ['Setiap pasangan 3/3 = 1, jadi boleh dicoret.', 'Ada 5 faktor di atas, 2 dicoret.'],
        temuan: 'Sisa 3 faktor, jadi 3⁵ : 3² = 3³. Perhatikan: 5 − 2 = 3.',
        cek: { jenis: 'setara', a: 3, kali: [5], bagi: [2] },
      },
      {
        visual: { jenis: 'pangkat', a: 2, m: 2, n: 3 },
        label: '(2²)³ = 2² × 2² × 2². Banyak faktor 2 seluruhnya = …',
        jawab: 6,
        hints: ['Ada 3 kelompok, masing-masing berisi 2 faktor.'],
        temuan: '6 faktor 2, jadi (2²)³ = 2⁶. Perhatikan: 2 × 3 = 6.',
        cek: { jenis: 'setara', a: 2, kali: [[2, 3]] },
      },
      {
        visual: { jenis: 'kaliBasis', a: 2, b: 5, n: 3 },
        label: '(2 × 5)³ = (2 × 5)(2 × 5)(2 × 5). Banyak faktor 2 di dalamnya = …',
        jawab: 3,
        hints: ['Hitung ubin biru (angka 2) saja.'],
        temuan:
          'Ada 3 faktor 2 dan 3 faktor 5, jadi (2 × 5)³ = 2³ × 5³. Pangkatnya "dibagikan" ke setiap faktor.',
        cek: { jenis: 'setara', a: 2, kali: [1, 1, 1] },
      },
    ],
    judulC: 'C. Pilah pernyataan',
    instruksiC: 'Amati data yang kamu kumpulkan. Pilah setiap pernyataan: benar atau salah?',
    opsiPilah: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: 'Setiap kali eksponen turun 1, nilai bilangan berpangkat dibagi dengan basisnya.',
        correct: 'benar',
        explanation: 'Pada tangga basis 2: 16 → 8 → 4 → 2 → 1 → 1/2 → 1/4, selalu dibagi 2.',
      },
      {
        id: 'p2',
        teks: '2⁰ = 0, karena tidak ada faktor 2 sama sekali.',
        correct: 'salah',
        explanation:
          'Tangga pangkatmu menunjukkan 2⁰ = 2¹ : 2 = 1. "Tidak ada faktor" berarti tidak ada yang mengubah nilai 1.',
      },
      {
        id: 'p3',
        teks: '2⁻¹ dan 3⁻¹ bernilai negatif.',
        correct: 'salah',
        explanation:
          '2⁻¹ = 1/2 dan 3⁻¹ = 1/3 — keduanya positif. Membagi bilangan positif tidak pernah menghasilkan bilangan negatif.',
      },
      {
        id: 'p4',
        teks: '3⁻² = 1/9, dan 9 = 3². Jadi 3⁻² = 1/3².',
        correct: 'benar',
        explanation: 'Pangkat negatif menghasilkan kebalikan (1 per …) dari pangkat positifnya.',
      },
      {
        id: 'p5',
        teks: '2³ × 2² = 2⁶, karena eksponennya dikalikan.',
        correct: 'salah',
        explanation:
          'Ubin faktor menunjukkan hanya ada 5 faktor 2, jadi 2³ × 2² = 2⁵ (eksponen dijumlahkan: 3 + 2).',
      },
    ],
    nextLabel: 'Olah Data: Sifat Operasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — OLAH DATA: SIFAT OPERASI BILANGAN BERPANGKAT
     ---------------------------------------------------------- */
  olahSifat: {
    kicker: 'Tahap 4 · Olah Data (Sifat Operasi)',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan sifat perkalian, pembagian, dan pemangkatan bilangan berpangkat dari ubin faktor.',
    guru: 'Minta murid menjelaskan hubungan antara banyak ubin dan operasi pada eksponen (jumlah, selisih, kali) sebelum memilih rumus. Tekankan bahwa sifat hanya berlaku untuk basis yang sama.',
    instruksi:
      'Hitung eksponen atau nilainya dengan bantuan ubin faktor. Setiap langkah dibuka setelah langkah sebelumnya benar.',
    langkah: [
      {
        visual: { jenis: 'kali', a: 5, m: 3, n: 4 },
        label: '5³ × 5⁴ = 5ᵏ. Nilai k = …',
        jawab: 7,
        hints: ['Hitung seluruh ubin: 3 ubin biru dan 4 ubin oranye.'],
        temuan: '5³ × 5⁴ = 5⁷, dan 3 + 4 = 7.',
        cek: { jenis: 'setara', a: 5, kali: [3, 4] },
      },
      {
        visual: { jenis: 'bagi', a: 7, m: 6, n: 2, coret: true },
        label: '7⁶ : 7² = 7ᵏ. Nilai k = …',
        jawab: 4,
        hints: ['Coret pasangan faktor atas–bawah. Berapa yang tersisa di atas?'],
        temuan: '7⁶ : 7² = 7⁴, dan 6 − 2 = 4.',
        cek: { jenis: 'setara', a: 7, kali: [6], bagi: [2] },
      },
      {
        visual: { jenis: 'pangkat', a: 3, m: 2, n: 4 },
        label: '(3²)⁴ = 3ᵏ. Nilai k = …',
        jawab: 8,
        hints: ['Ada 4 kelompok berisi 2 faktor 3.'],
        temuan: '(3²)⁴ = 3⁸, dan 2 × 4 = 8.',
        cek: { jenis: 'setara', a: 3, kali: [[2, 4]] },
      },
      {
        visual: { jenis: 'kaliBasis', a: 2, b: 5, n: 3 },
        label: '(2 × 5)³ = 2³ × 5³ = 8 × 125 = …',
        jawab: 1000,
        hints: ['8 × 125 = 8 × 100 + 8 × 25.', 'Periksa: (2 × 5)³ = 10³.'],
        temuan: '8 × 125 = 1.000 = 10³. Jadi (2 × 5)³ = 2³ × 5³.',
        cek: { jenis: 'nilai', a: 10, n: 3 },
      },
      {
        label: '(6 : 3)⁴ = 2⁴ = 16. Sekarang hitung 6⁴ : 3⁴ = 1.296 : 81 = …',
        jawab: 16,
        hints: ['81 × 10 = 810, 81 × 16 = 1.296.'],
        temuan:
          '6⁴ : 3⁴ = 16 = (6 : 3)⁴. Pangkat dari pembagian dibagikan ke pembilang dan penyebut.',
        cek: { jenis: 'nilai', a: 2, n: 4 },
      },
    ],
    pertanyaan: [
      {
        id: 'kali',
        tanya: 'Dari 2³ × 2² = 2⁵ dan 5³ × 5⁴ = 5⁷, untuk basis a yang sama: aᵐ × aⁿ = …',
        opsi: [
          { id: 'benar', label: 'aᵐ⁺ⁿ' },
          { id: 'kaliE', label: 'aᵐˣⁿ' },
          { id: 'basis', label: '(a × a)ᵐ⁺ⁿ' },
          { id: 'kurang', label: 'aᵐ⁻ⁿ' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Banyak faktor digabung, jadi eksponennya <strong>dijumlahkan</strong>.',
          kaliE: 'Cek dengan ubin: 2³ × 2² punya 5 faktor, bukan 3 × 2 = 6 faktor. Coba lagi.',
          basis:
            'Basisnya tetap a — yang bertambah hanya banyak faktornya. (2 × 2)⁵ = 4⁵ jauh lebih besar dari 2⁵. Coba lagi.',
          kurang: 'Mengurangkan eksponen terjadi pada pembagian, bukan perkalian. Coba lagi.',
        },
      },
      {
        id: 'bagi',
        tanya: 'Dari 3⁵ : 3² = 3³ dan 7⁶ : 7² = 7⁴, untuk a ≠ 0: aᵐ : aⁿ = …',
        opsi: [
          { id: 'benar', label: 'aᵐ⁻ⁿ' },
          { id: 'bagiE', label: 'a^(m : n)' },
          { id: 'tambah', label: 'aᵐ⁺ⁿ' },
          { id: 'satu', label: '1ᵐ⁻ⁿ' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Setiap pasangan faktor atas–bawah dicoret, jadi eksponennya <strong>dikurangkan</strong>.',
          bagiE: 'Cek: 7⁶ : 7² = 7⁴, sedangkan 6 : 2 = 3. Eksponen tidak dibagi. Coba lagi.',
          tambah:
            'Pembagian mengurangi banyak faktor, jadi eksponennya tidak bertambah. Coba lagi.',
          satu: 'Pasangan yang dicoret bernilai 1, tetapi faktor sisanya tetap a. Coba lagi.',
        },
      },
      {
        id: 'pangkat',
        tanya: 'Dari (2²)³ = 2⁶ dan (3²)⁴ = 3⁸: (aᵐ)ⁿ = …',
        opsi: [
          { id: 'benar', label: 'aᵐˣⁿ' },
          { id: 'tambah', label: 'aᵐ⁺ⁿ' },
          { id: 'susun', label: 'a^(mⁿ)' },
          { id: 'kaliBasis', label: '(a × n)ᵐ' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Ada n kelompok berisi m faktor, jadi seluruhnya m × n faktor — eksponennya <strong>dikalikan</strong>.',
          tambah: '(2²)³ punya 6 faktor, bukan 2 + 3 = 5 faktor. Coba lagi.',
          susun:
            'm pangkat n terlalu besar: (2²)³ akan menjadi 2⁸ = 256, padahal nilainya 4³ = 64 = 2⁶. Coba lagi.',
          kaliBasis: 'Basisnya tetap a. Yang berubah hanya banyak faktornya. Coba lagi.',
        },
      },
      {
        id: 'basis',
        tanya: 'Dari (2 × 5)³ = 2³ × 5³: (a × b)ⁿ = …',
        opsi: [
          { id: 'benar', label: 'aⁿ × bⁿ' },
          { id: 'satu', label: 'a × bⁿ' },
          { id: 'tambah', label: 'aⁿ + bⁿ' },
          { id: 'dobel', label: '(a × b)²ⁿ' },
        ],
        correct: 'benar',
        umpan: {
          benar: '<strong>Tepat.</strong> Setiap faktor di dalam kurung ikut dipangkatkan n.',
          satu: 'Cek: (2 × 5)³ = 1.000, sedangkan 2 × 5³ = 250. Faktor a juga harus dipangkatkan. Coba lagi.',
          tambah: 'Cek: 2³ + 5³ = 133, bukan 1.000. Sifat ini tentang perkalian. Coba lagi.',
          dobel: 'Banyak kelompok (2 × 5) tetap n, bukan 2n. Coba lagi.',
        },
      },
      {
        id: 'bagiBasis',
        tanya: 'Dari (6 : 3)⁴ = 6⁴ : 3⁴, untuk b ≠ 0: (a : b)ⁿ = …',
        opsi: [
          { id: 'benar', label: 'aⁿ : bⁿ' },
          { id: 'atas', label: 'aⁿ : b' },
          { id: 'kurang', label: 'aⁿ − bⁿ' },
          { id: 'bawah', label: 'a : bⁿ' },
        ],
        correct: 'benar',
        umpan: {
          benar: '<strong>Tepat.</strong> Pembilang dan penyebut sama-sama dipangkatkan n.',
          atas: 'Cek: 6⁴ : 3 = 432, bukan 16. Penyebut juga dipangkatkan. Coba lagi.',
          kurang: 'Cek: 6⁴ − 3⁴ = 1.215, bukan 16. Coba lagi.',
          bawah: 'Cek: 6 : 3⁴ = 6/81, bukan 16. Pembilang juga dipangkatkan. Coba lagi.',
        },
      },
    ],
    rumus: [
      { label: 'Perkalian', teks: 'aᵐ × aⁿ = aᵐ⁺ⁿ' },
      { label: 'Pembagian (a ≠ 0)', teks: 'aᵐ : aⁿ = aᵐ⁻ⁿ' },
      { label: 'Pangkat dari pangkat', teks: '(aᵐ)ⁿ = aᵐˣⁿ' },
      { label: 'Pangkat dari perkalian', teks: '(a × b)ⁿ = aⁿ × bⁿ' },
      { label: 'Pangkat dari pembagian (b ≠ 0)', teks: '(a : b)ⁿ = aⁿ : bⁿ' },
    ],
    nextLabel: 'Olah Data: Pangkat Nol & Negatif →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — OLAH DATA: MAKNA PANGKAT NOL & NEGATIF
     ---------------------------------------------------------- */
  olahNolNegatif: {
    kicker: 'Tahap 5 · Olah Data (Pangkat Nol & Negatif)',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menalar makna a⁰ = 1 dan a⁻ⁿ = 1/aⁿ melalui pola tangga pangkat dan sifat pembagian.',
    guru: 'Tunjukkan bahwa dua jalan penalaran yang berbeda (pola dan sifat pembagian) sampai pada kesimpulan yang sama — itulah alasan matematikawan mendefinisikan a⁰ = 1 dan a⁻ⁿ = 1/aⁿ. Bahas mengapa a = 0 dikecualikan.',
    judulA: 'Jalan 1 · Pola tangga pangkat 10',
    instruksiA:
      '10³ = 1.000, 10² = 100, 10¹ = 10. Teruskan polanya ke bawah. Tulis pecahan dengan garis miring (1/10) atau desimal berkoma (0,1).',
    tangga: { a: 10, dari: 3, sampai: -2, diketahui: [3, 2, 1] },
    langkahA: [
      {
        n: 0,
        label: '10⁰ = 10¹ : 10 = …',
        jawab: 1,
        hints: ['10 : 10 = …'],
        temuan: '10⁰ = 1.',
        cek: { jenis: 'nilai', a: 10, n: 0 },
      },
      {
        n: -1,
        label: '10⁻¹ = 10⁰ : 10 = …',
        jawab: 0.1,
        rational: true,
        hints: ['1 : 10 = 1/10 (atau 0,1).'],
        temuan: '10⁻¹ = 1/10 = 1/10¹.',
        cek: { jenis: 'nilai', a: 10, n: -1 },
      },
      {
        n: -2,
        label: '10⁻² = 10⁻¹ : 10 = …',
        jawab: 0.01,
        rational: true,
        hints: ['1/10 : 10 = 1/100 (atau 0,01).'],
        temuan: '10⁻² = 1/100 = 1/10². Pola: 10⁻ⁿ = 1/10ⁿ.',
        cek: { jenis: 'nilai', a: 10, n: -2 },
      },
    ],
    judulB: 'Jalan 2 · Sifat pembagian aᵐ : aⁿ = aᵐ⁻ⁿ',
    instruksiB:
      'Sifat pembagian yang kamu temukan juga harus berlaku saat m = n atau m < n. Hitung langsung, lalu bandingkan dengan hasil sifatnya.',
    langkahB: [
      {
        visual: { jenis: 'bagi', a: 2, m: 3, n: 3, coret: true },
        label: 'Hitung langsung: 2³ : 2³ = 8 : 8 = …',
        jawab: 1,
        hints: ['Bilangan (bukan nol) dibagi dirinya sendiri.'],
        temuan:
          'Menurut sifat pembagian, 2³ : 2³ = 2³⁻³ = 2⁰. Keduanya harus sama, jadi <strong>2⁰ = 1</strong>.',
        cek: { jenis: 'nilai', a: 2, n: 0 },
      },
      {
        visual: { jenis: 'bagi', a: 2, m: 2, n: 5, coret: true },
        label: 'Hitung langsung: 2² : 2⁵ = 4 : 32 = … (pecahan paling sederhana)',
        jawab: 0.125,
        rational: true,
        hints: ['4/32 disederhanakan dengan membagi pembilang dan penyebut dengan 4.'],
        temuan:
          'Menurut sifat pembagian, 2² : 2⁵ = 2²⁻⁵ = 2⁻³. Jadi <strong>2⁻³ = 1/8 = 1/2³</strong> — sisa 3 faktor 2 ada di penyebut.',
        cek: { jenis: 'nilai', a: 2, n: -3 },
      },
    ],
    pertanyaan: [
      {
        id: 'nol',
        tanya: 'Dari 10⁰ = 1 dan 2³ : 2³ = 2⁰ = 1, dapat disimpulkan bahwa untuk a ≠ 0 …',
        opsi: [
          { id: 'benar', label: 'a⁰ = 1' },
          { id: 'nol', label: 'a⁰ = 0' },
          { id: 'a', label: 'a⁰ = a' },
          { id: 'tak', label: 'a⁰ tidak mempunyai nilai' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> a⁰ = aⁿ : aⁿ = 1. Pada zoom PixelKu, 2⁰ = 1 artinya ukuran asli (tidak diperbesar, tidak diperkecil).',
          nol: 'Tangga pangkat menunjukkan 10¹ : 10 = 1, bukan 0. Membagi tidak pernah membuat bilangan positif menjadi 0. Coba lagi.',
          a: 'a¹ = a. Untuk turun ke a⁰ masih harus dibagi a sekali lagi. Coba lagi.',
          tak: 'Dua jalan penalaran memberi hasil yang sama dan jelas: 1. Coba lagi.',
        },
      },
      {
        id: 'negatif',
        tanya: 'Dari 10⁻² = 1/10² dan 2⁻³ = 1/2³, untuk a ≠ 0: a⁻ⁿ = …',
        opsi: [
          { id: 'benar', label: '1/aⁿ' },
          { id: 'minus', label: '−aⁿ' },
          { id: 'kali', label: '−a × n' },
          { id: 'basis', label: '(−a)ⁿ' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> a⁻ⁿ adalah <strong>kebalikan</strong> dari aⁿ: a⁻ⁿ = 1/aⁿ, sehingga a⁻ⁿ × aⁿ = a⁰ = 1.',
          minus:
            'Cek: 2⁻³ = 1/8, bukan −8. Tanda minus pada eksponen tidak membuat hasilnya negatif. Coba lagi.',
          kali: 'Cek: 2⁻³ = 1/8, bukan −6. Eksponen tidak dikalikan dengan basis. Coba lagi.',
          basis: 'Cek: (−2)³ = −8, padahal 2⁻³ = 1/8. Coba lagi.',
        },
      },
      {
        id: 'syarat',
        tanya: 'Mengapa sifat a⁰ = 1 dan a⁻ⁿ = 1/aⁿ hanya berlaku untuk a ≠ 0?',
        opsi: [
          { id: 'benar', label: 'Karena 0⁰ = 0 : 0 dan 0⁻ⁿ = 1/0ⁿ memuat pembagian dengan nol' },
          { id: 'bukan', label: 'Karena 0 bukan bilangan bulat' },
          { id: 'selalu', label: 'Karena 0 dipangkatkan berapa pun selalu 0' },
          { id: 'negatif', label: 'Karena hasilnya selalu negatif' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Kedua makna itu diturunkan dari pembagian aⁿ : aⁿ dan 1 : aⁿ. Jika a = 0, pembaginya 0 — tak terdefinisi.',
          bukan: '0 termasuk bilangan bulat. Masalahnya ada pada pembagian. Coba lagi.',
          selalu:
            'Itu benar untuk eksponen positif (0³ = 0), tetapi 0⁰ dan 0⁻² justru tidak bisa dihitung. Mengapa? Coba lagi.',
          negatif: 'Tidak ada hasil negatif di sini. Pikirkan: 0⁻² = 1/0² = 1/0. Coba lagi.',
        },
      },
      {
        id: 'tanda',
        tanya: 'Bilangan 5⁻² bernilai …',
        opsi: [
          { id: 'benar', label: 'positif, yaitu 1/25' },
          { id: 'neg25', label: 'negatif, yaitu −25' },
          { id: 'neg10', label: 'negatif, yaitu −10' },
          { id: 'negfrac', label: 'negatif, yaitu −1/25' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> 5⁻² = 1/5² = 1/25. Eksponen negatif memindahkan faktor ke penyebut, bukan mengubah tanda.',
          neg25: 'Itu −5², bukan 5⁻². Coba lagi.',
          neg10: 'Itu 5 × (−2). Pangkat bukan perkalian basis dengan eksponen. Coba lagi.',
          negfrac: 'Bentuk pecahannya sudah benar, tetapi 1/25 tidak negatif. Coba lagi.',
        },
      },
    ],
    rumus: [
      { label: 'Pangkat nol (a ≠ 0)', teks: 'a⁰ = 1' },
      { label: 'Pangkat negatif (a ≠ 0)', teks: 'a⁻ⁿ = 1/aⁿ' },
    ],
    nextLabel: 'Buktikan Sifat-sifatnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN (VERIFIKASI)
     A: lab uji sifat. B: buktikan dugaan awal. C: pilah miskonsepsi.
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji sifat-sifat eksponen pada eksponen positif, nol, dan negatif, lalu membuktikan dugaan awal.',
    guru: 'Minta setiap pasangan mencari satu contoh penyangkal untuk Dugaan A dan Dugaan B, lalu membandingkannya dengan pasangan lain. Tekankan: satu contoh penyangkal cukup untuk menggugurkan dugaan, tetapi banyak contoh yang cocok belum membuktikan sifat — itulah alasan kita menurunkannya dari ubin faktor.',
    judulA: 'A. Lab uji sifat eksponen',
    instruksiA:
      'Pilih sifat, atur a, m, dan n (boleh nol atau negatif), lalu catat hasilnya. Selesaikan daftar periksa: uji tiap sifat dengan eksponen nol/negatif, dan cari contoh penyangkal untuk dua dugaan keliru.',
    lab: {
      sifat: ['kali', 'bagi', 'pangkat', 'kaliBasis', 'bagiBasis', 'salahKali', 'salahNegatif'],
      syarat: [
        { sifat: 'kali', min: 2, nonPositif: true },
        { sifat: 'bagi', min: 2, nonPositif: true },
        { sifat: 'pangkat', min: 2, nonPositif: true },
        { sifat: 'salahKali', min: 1, sangkal: true },
        { sifat: 'salahNegatif', min: 1, sangkal: true },
      ],
      batasA: [-5, 5],
      batasE: [-4, 4],
    },
    judulB: 'B. Buktikan dugaan awalmu',
    uji: [
      {
        label: 'Faktor skala tanpa klik: 2⁰ = …',
        jawab: 1,
        hints: ['Gunakan a⁰ = 1.'],
        bukti: '2⁰ = 1: gambar tetap berukuran asli. ✓',
        cek: { jenis: 'nilai', a: 2, n: 0 },
      },
      {
        label: 'Faktor skala setelah dua kali klik ÷2: 2⁻² = …',
        jawab: 0.25,
        rational: true,
        hints: ['Gunakan a⁻ⁿ = 1/aⁿ: 2⁻² = 1/2².'],
        bukti: '2⁻² = 1/4: gambar menjadi seperempat ukuran asli. ✓',
        cek: { jenis: 'nilai', a: 2, n: -2 },
      },
    ],
    dugaanBenar: 'o1',
    judulC: 'C. Awas miskonsepsi!',
    instruksiC: 'Pilah setiap pernyataan: benar atau salah?',
    opsiPilah: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pilah: [
      {
        id: 'v1',
        teks: '(−3)⁰ = 1',
        correct: 'benar',
        explanation: 'Basisnya −3 dan −3 ≠ 0, sehingga (−3)⁰ = 1.',
      },
      {
        id: 'v2',
        teks: '−3⁰ = 1',
        correct: 'salah',
        explanation: 'Tanpa kurung, yang dipangkatkan hanya 3: −3⁰ = −(3⁰) = −1.',
      },
      {
        id: 'v3',
        teks: '5⁻¹ = −5',
        correct: 'salah',
        explanation: '5⁻¹ = 1/5. Eksponen negatif berarti kebalikan, bukan bilangan negatif.',
      },
      {
        id: 'v4',
        teks: '2⁻³ × 2³ = 1',
        correct: 'benar',
        explanation: '2⁻³ × 2³ = 2⁻³⁺³ = 2⁰ = 1. Periksa: 1/8 × 8 = 1.',
      },
      {
        id: 'v5',
        teks: '(2³)² = 2⁹',
        correct: 'salah',
        explanation:
          '(2³)² = 2³ × 2³ = 2⁶ = 64, sedangkan 2⁹ = 512. Eksponen dikalikan: 3 × 2 = 6.',
      },
      {
        id: 'v6',
        teks: '0⁻² dapat dihitung, hasilnya 0.',
        correct: 'salah',
        explanation:
          '0⁻² = 1/0² = 1/0 — pembagian dengan nol, tak terdefinisi. Itulah syarat a ≠ 0.',
      },
    ],
    nextLabel: 'Tarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN (GENERALISASI)
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Menyusun kesimpulan umum tentang sifat-sifat eksponen bulat serta makna a⁰ dan a⁻ⁿ.',
    guru: 'Setelah kalimat lengkap, minta beberapa murid menjelaskan dengan kata-kata sendiri mengapa a⁰ = 1 (bukan 0) dan mengapa a⁻ⁿ bukan bilangan negatif.',
    instruksi:
      'Lengkapi setiap awal kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan dipakai paling banyak satu kali, dan ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'Mengalikan bilangan berpangkat dengan basis sama', correct: 'b1' },
      { id: 'k2', awal: 'Membagi bilangan berpangkat dengan basis sama (a ≠ 0)', correct: 'b2' },
      { id: 'k3', awal: 'Memangkatkan bilangan berpangkat', correct: 'b3' },
      { id: 'k4', awal: 'Pangkat dari perkalian atau pembagian dua bilangan', correct: 'b4' },
      { id: 'k5', awal: 'Setiap bilangan a ≠ 0 yang dipangkatkan nol', correct: 'b5' },
      { id: 'k6', awal: 'Bilangan berpangkat negatif a⁻ⁿ (a ≠ 0)', correct: 'b6' },
    ],
    bank: [
      { id: 'b1', teks: 'eksponennya dijumlahkan: aᵐ × aⁿ = aᵐ⁺ⁿ.' },
      { id: 'b2', teks: 'eksponennya dikurangkan: aᵐ : aⁿ = aᵐ⁻ⁿ.' },
      { id: 'b3', teks: 'eksponennya dikalikan: (aᵐ)ⁿ = aᵐˣⁿ.' },
      { id: 'b4', teks: 'dibagikan ke setiap faktor: (ab)ⁿ = aⁿbⁿ dan (a : b)ⁿ = aⁿ : bⁿ.' },
      { id: 'b5', teks: 'bernilai 1, karena a⁰ = aⁿ : aⁿ = 1.' },
      { id: 'b6', teks: 'adalah kebalikan dari aⁿ, yaitu a⁻ⁿ = 1/aⁿ.' },
      { id: 'x1', teks: 'eksponennya dikalikan: aᵐ × aⁿ = aᵐˣⁿ.' },
      { id: 'x2', teks: 'bernilai 0, karena tidak ada faktor a.' },
      { id: 'x3', teks: 'bernilai negatif, yaitu a⁻ⁿ = −aⁿ.' },
    ],
    rangkuman: [
      'aᵐ × aⁿ = aᵐ⁺ⁿ dan aᵐ : aⁿ = aᵐ⁻ⁿ (a ≠ 0) — banyak faktor digabung atau dicoret.',
      '(aᵐ)ⁿ = aᵐˣⁿ, (a × b)ⁿ = aⁿ × bⁿ, dan (a : b)ⁿ = aⁿ : bⁿ (b ≠ 0).',
      'a⁰ = 1 untuk a ≠ 0: pola tangga pangkat (aⁿ turun satu = dibagi a) dan sifat aⁿ : aⁿ = a⁰ sama-sama memberi 1.',
      'a⁻ⁿ = 1/aⁿ untuk a ≠ 0: eksponen negatif berarti kebalikan, bukan bilangan negatif.',
      'Sifat-sifat tersebut berlaku untuk semua eksponen bulat — positif, nol, maupun negatif.',
    ],
    nextLabel: 'Terapkan Sifatnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Campuran isian ('input') dan pilihan ganda ('choice').
     Opsi pilihan ganda memuat `nilai` agar tes dapat memastikan
     hanya satu opsi yang cocok dengan `cek`.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menggunakan sifat-sifat eksponen bulat untuk menyederhanakan bentuk dan menentukan nilai.',
    guru: 'Dorong murid menuliskan sifat yang dipakai di setiap langkah. Diskusikan soal yang paling banyak salah di akhir sesi, terutama yang melibatkan eksponen negatif.',
    instruksi:
      'Selesaikan setiap soal. Tuliskan sifat yang kamu pakai. Jawaban pecahan boleh ditulis dengan garis miring (1/8) atau desimal berkoma (0,125).',
    soal: [
      {
        type: 'input',
        cerita:
          'Sebuah hash table dalam program Dina mempunyai 2⁵ slot. Karena datanya bertambah, ukurannya diperbesar 2³ kali lipat.',
        pertanyaan: 'Ukuran barunya 2⁵ × 2³ = 2ᵏ slot. Berapa <strong>k</strong>?',
        jawab: 8,
        cek: { jenis: 'setara', a: 2, kali: [5, 3] },
        hints: ['Basisnya sama, jadi gunakan aᵐ × aⁿ = aᵐ⁺ⁿ.'],
        reveal: '2⁵ × 2³ = 2⁵⁺³ = 2⁸, jadi <strong>k = 8</strong> (256 slot).',
      },
      {
        type: 'choice',
        cerita: 'Sederhanakan bentuk aljabar berikut (x ≠ 0).',
        pertanyaan: '(x³)⁴ : x⁵ = …',
        options: [
          { id: 'a', label: 'x⁷', nilai: 7 },
          { id: 'b', label: 'x²', nilai: 2 },
          { id: 'c', label: 'x¹⁷', nilai: 17 },
          { id: 'd', label: 'x⁶⁰', nilai: 60 },
        ],
        correct: 'a',
        cek: { jenis: 'setara', a: 2, kali: [[3, 4]], bagi: [5] },
        hints: ['Kerjakan pangkat dari pangkat dulu: (x³)⁴ = x³ˣ⁴.'],
        explanation:
          '(x³)⁴ = x¹², lalu x¹² : x⁵ = x¹²⁻⁵ = x⁷. (x² dari 3 + 4 − 5, x¹⁷ dari 12 + 5, x⁶⁰ dari 12 × 5.)',
      },
      {
        type: 'input',
        cerita: 'Hitung nilai bentuk berikut.',
        pertanyaan: '5⁰ + 4⁻¹ = … (tulis pecahan atau desimal)',
        jawab: 1.25,
        cek: {
          jenis: 'jumlah',
          suku: [
            [5, 0],
            [4, -1],
          ],
        },
        hints: ['5⁰ = 1 dan 4⁻¹ = 1/4.', '1 + 1/4 = 5/4.'],
        reveal: '5⁰ + 4⁻¹ = 1 + 1/4 = <strong>5/4 = 1,25</strong>.',
      },
      {
        type: 'choice',
        cerita: 'Tentukan nilai bilangan berpangkat berikut.',
        pertanyaan: '3⁻² = …',
        options: [
          { id: 'a', label: '1/9', nilai: 1 / 9 },
          { id: 'b', label: '−9', nilai: -9 },
          { id: 'c', label: '−6', nilai: -6 },
          { id: 'd', label: '1/6', nilai: 1 / 6 },
        ],
        correct: 'a',
        cek: { jenis: 'nilai', a: 3, n: -2 },
        hints: ['a⁻ⁿ = 1/aⁿ.'],
        explanation: '3⁻² = 1/3² = 1/9. Eksponen negatif tidak membuat hasilnya negatif.',
      },
      {
        type: 'input',
        cerita:
          'Dalam komputer, 1 KB = 2¹⁰ byte dan 1 MB = 2²⁰ byte. Dina ingin tahu berapa KB dalam 1 MB.',
        pertanyaan: '1 MB = 2²⁰ : 2¹⁰ KB = 2ᵏ KB. Berapa <strong>k</strong>?',
        jawab: 10,
        cek: { jenis: 'setara', a: 2, kali: [20], bagi: [10] },
        hints: ['Gunakan aᵐ : aⁿ = aᵐ⁻ⁿ.'],
        reveal: '2²⁰ : 2¹⁰ = 2²⁰⁻¹⁰ = 2¹⁰, jadi <strong>k = 10</strong> (1 MB = 1.024 KB).',
      },
      {
        type: 'input',
        cerita: 'Di PixelKu, Dina menekan tombol ÷2 sebanyak lima kali dari ukuran asli.',
        pertanyaan: 'Faktor skalanya 2⁻⁵ = … (tulis pecahan)',
        jawab: 1 / 32,
        cek: { jenis: 'nilai', a: 2, n: -5 },
        hints: ['2⁻⁵ = 1/2⁵.', '2⁵ = 32.'],
        reveal: '2⁻⁵ = 1/2⁵ = <strong>1/32</strong> dari ukuran asli.',
      },
      {
        type: 'choice',
        cerita: 'Perhatikan tanda kurung dan basisnya.',
        pertanyaan: 'Manakah yang bernilai 1?',
        options: [
          { id: 'a', label: '(−7)⁰', nilai: 1 },
          { id: 'b', label: '−7⁰', nilai: -1 },
          { id: 'c', label: '7⁻¹', nilai: 1 / 7 },
          { id: 'd', label: '0⁷', nilai: 0 },
        ],
        correct: 'a',
        cek: { jenis: 'nilai', a: -7, n: 0 },
        hints: ['Basis (−7) ≠ 0. Pada −7⁰, yang dipangkatkan hanya 7.'],
        explanation: '(−7)⁰ = 1. Sebaliknya −7⁰ = −1, 7⁻¹ = 1/7, dan 0⁷ = 0.',
      },
      {
        type: 'input',
        cerita: 'Sederhanakan dengan sifat-sifat eksponen.',
        pertanyaan: '(2⁻³ × 2⁵)² = 2ᵏ. Berapa <strong>k</strong>?',
        jawab: 4,
        cek: { jenis: 'setara', a: 2, kali: [-3, 5], luar: 2 },
        hints: ['Di dalam kurung: 2⁻³ × 2⁵ = 2⁻³⁺⁵.', 'Lalu (2²)² = 2²ˣ².'],
        reveal: '2⁻³ × 2⁵ = 2², lalu (2²)² = 2⁴, jadi <strong>k = 4</strong>.',
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
    goal: 'Merefleksikan proses menemukan sifat-sifat eksponen bulat.',
    guru: 'Baca jawaban refleksi secara acak dan gunakan untuk menentukan murid yang perlu pendampingan tambahan, terutama tentang eksponen nol dan negatif.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri mengapa a⁰ = 1, bukan 0.',
        placeholder: 'Karena setiap eksponen turun 1, nilainya …',
      },
      {
        id: 'r2',
        teks: 'Jelaskan mengapa 2⁻³ bernilai positif. Apa arti tanda minus pada eksponen?',
        placeholder: 'Tanda minus pada eksponen berarti …',
      },
      {
        id: 'r3',
        teks: 'Di mana kamu menemukan bilangan berpangkat dalam dunia RPL atau kehidupan sehari-hari?',
        placeholder: 'Misalnya ukuran memori 2¹⁰ byte, fitur zoom, …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu dapat menjelaskan dan memakai sifat-sifat eksponen bulat sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '🙂 Yakin — aku bisa memakai sifat-sifatnya' },
      { id: 'ragu', label: '🤔 Masih ragu, terutama soal eksponen nol dan negatif' },
      { id: 'bantuan', label: '🙋 Aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, kamu menemukan sifat-sifat eksponen sendiri!',
    teks: 'Kamu tidak sekadar menghafal — kamu melihat dari pola dan ubin faktor mengapa eksponen dijumlahkan, dikurangkan, atau dikalikan, dan mengapa a⁰ = 1 serta a⁻ⁿ = 1/aⁿ.',
    capaian: [
      'Mengumpulkan data nilai bilangan berpangkat pada tangga pangkat dan ubin faktor.',
      'Menemukan sifat perkalian, pembagian, dan pemangkatan bilangan berpangkat.',
      'Menalar makna a⁰ = 1 dan a⁻ⁿ = 1/aⁿ lewat pola dan sifat pembagian, serta alasan a ≠ 0.',
      'Menguji sifat pada eksponen positif, nol, dan negatif, serta menyangkal dugaan keliru.',
      'Menerapkan sifat-sifat eksponen pada soal dan konteks RPL (memori, zoom).',
    ],
  },
};
