'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Penjumlahan & Pengurangan Bilangan Bulat
   Fase D — SMP Kelas 7

   Tujuan Pembelajaran:
   Merepresentasikan bilangan bulat pada garis bilangan serta
   menjumlah dan mengurangkan bilangan bulat dengan tepat untuk
   menyelesaikan masalah kontekstual sederhana (suhu, saldo,
   ketinggian).

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'koleksi'
     Sintaks 4 — Data processing ............ tahap 'olahJumlah' & 'olahKurang'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas:
     1. Stimulasi   — suhu pagi di Puncak Jaya −3 °C lalu naik 5 °C;
                      murid MENDUGA suhu siang (tidak dinilai).
     2. Masalah     — memilih rumusan masalah & menulis hipotesis.
     3. Data        — (A) menempatkan bilangan dari konteks suhu,
                      ketinggian, dan saldo pada garis bilangan;
                      (B) bereksperimen dengan simulator lompatan dan
                      mencatat hasil empat percobaan.
     4. Olah (+)    — memilah arah lompatan, menghitung hasil, lalu
                      menemukan pola: +positif → kanan, +negatif → kiri.
     5. Olah (−)    — melengkapi pola 5 − 3, 5 − 2, … 5 − (−2) untuk
                      menemukan a − b = a + (−b), lalu memakainya.
     6. Bukti       — menguji dugaan tahap 1 & menanggapi miskonsepsi.
     7. Simpulan    — menyusun kalimat kesimpulan dari bank kalimat.
     8. Uji terap   — soal kontekstual suhu, saldo, ketinggian.
     9. Refleksi    — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/shuffleArray() dari shared/engine.js, satu
   kali saat state disiapkan.
   ============================================================ */

var DATA = {
  /* Rentang garis bilangan yang dipakai hampir di seluruh tahap. */
  garis: { min: -10, max: 10 },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1',
    goal: 'Mengamati perubahan suhu dan menduga hasilnya.',
    guru: 'Bacakan cerita dengan antusias. Jangan membenarkan atau menyalahkan dugaan murid — mintalah beberapa murid membacakan alasannya, lalu biarkan perbedaan pendapat itu menjadi rasa ingin tahu.',
    judul: 'Pagi yang Membeku di Puncak Jaya',
    cerita:
      'Tim pendaki bermalam di dekat Puncak Jaya, Papua. Pukul 05.00 termometer di tenda menunjukkan suhu 3 °C di bawah nol. Menjelang pukul 11.00, matahari bersinar dan suhu naik 5 °C.',
    suhuAwal: -3,
    naik: 5,
    captionAwal: 'Pukul 05.00',
    pertanyaan: 'Menurut dugaanmu, berapa suhu pada pukul 11.00?',
    opsi: [
      { id: 'p2', label: '2 °C' },
      { id: 'p8', label: '8 °C' },
      { id: 'm8', label: '−8 °C' },
      { id: 'm2', label: '−2 °C' },
    ],
    benar: 'p2',
    alasanLabel: 'Bagaimana kamu memperoleh dugaan itu?',
    alasanPlaceholder: 'Tulis caramu berpikir dengan kalimatmu sendiri…',
    teaserJudul: 'Masalah serupa juga muncul di tempat lain',
    teaser: [
      {
        ikon: '💰',
        teks: 'Kas kelas tersisa Rp10.000, lalu dipakai membeli bola Rp15.000. Kekurangannya dicatat sebagai utang. Berapa saldo kas sekarang?',
      },
      {
        ikon: '🤿',
        teks: 'Seorang penyelam berada 6 m di bawah permukaan laut, lalu naik 4 m. Di mana posisinya sekarang?',
      },
    ],
    catatan:
      'Belum ada jawaban benar atau salah di tahap ini. Dugaanmu disimpan, lalu kamu sendiri yang mengujinya pada tahap Pembuktian.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: 'Discovery Learning · Sintaks 2',
    goal: 'Merumuskan pertanyaan yang akan diselidiki.',
    guru: 'Bila murid memilih rumusan yang kurang tepat, ajukan pertanyaan balik: "Kalau pertanyaan itu terjawab, apakah kita bisa menghitung suhu siang, saldo kas, dan posisi penyelam?"',
    pengantar:
      'Ketiga masalah tadi memuat bilangan di bawah nol: suhu di bawah 0 °C, saldo yang berutang, dan posisi di bawah permukaan laut. Bilangan seperti ini disebut bilangan bulat negatif.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      { id: 'r1', label: 'Berapa suhu terendah yang pernah tercatat di Puncak Jaya?' },
      {
        id: 'r2',
        label:
          'Bagaimana cara menjumlah dan mengurangkan bilangan bulat, termasuk bilangan negatif, dengan bantuan garis bilangan?',
      },
      { id: 'r3', label: 'Mengapa suhu di puncak gunung bisa berada di bawah nol?' },
      { id: 'r4', label: 'Berapa hasil 3 + 5 bila tanda minusnya diabaikan saja?' },
    ],
    correct: 'r2',
    umpan: {
      r1: 'Pertanyaan ini menarik, tetapi jawabannya hanya sebuah fakta. Pertanyaan ini tidak membantu kita menghitung perubahan suhu, saldo, atau posisi.',
      r2: 'Tepat. Ketiga masalah memerlukan cara menjumlah dan mengurangkan bilangan bulat, dan garis bilangan dapat menjadi alat bantunya.',
      r3: 'Ini pertanyaan untuk pelajaran IPA. Kita perlu pertanyaan matematika yang membantu menghitung.',
      r4: 'Tanda minus justru penting: −3 °C dan 3 °C adalah suhu yang sangat berbeda.',
    },
    hipotesisLabel: 'Tulis dugaan sementaramu (hipotesis)',
    hipotesisPlaceholder:
      'Contoh: saya menduga suhu naik berarti bergerak ke … pada garis bilangan, sehingga …',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA
     A. Menempatkan bilangan dari konteks pada garis bilangan.
     B. Simulator lompatan + tabel percobaan.
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Merepresentasikan bilangan bulat dari konteks pada garis bilangan dan mengumpulkan data hasil operasi.',
    guru: 'Pada bagian A, minta murid menyebutkan dulu: "di atas/bawah nol? berarti kiri atau kanan 0?". Pada bagian B, beri keleluasaan bereksperimen dengan simulator sebelum mengisi tabel.',
    instruksiA:
      'Bagian A. Ubah setiap keadaan menjadi bilangan bulat, lalu ketuk letaknya pada garis bilangan. Keadaan di bawah nol, di bawah permukaan laut, atau utang ditulis sebagai bilangan negatif.',
    tempatkan: [
      { id: 'e1', value: -3, teks: 'suhu 3 °C di bawah nol' },
      { id: 'e2', value: -6, teks: 'penyelam 6 m di bawah permukaan laut' },
      { id: 'e3', value: 4, teks: 'lift naik ke lantai 4 di atas lobi' },
      { id: 'e4', value: -5, teks: 'utang kas kelas Rp5.000 (dalam ribuan)' },
      { id: 'e5', value: 0, teks: 'tepat di permukaan laut' },
    ],
    selesaiA:
      '<strong>Semua bilangan sudah menempati titik yang tepat.</strong> Bilangan negatif berada di kiri 0, bilangan positif di kanan 0.',
    instruksiB:
      'Bagian B. Gunakan simulator untuk bereksperimen: atur titik awal, pilih operasinya, lalu atur bilangan kedua. Amati arah dan panjang lompatannya.',
    simAwal: { a: -3, op: '+', b: 5 },
    instruksiTabel:
      'Atur simulator sesuai setiap percobaan di bawah ini, amati titik akhirnya, lalu catat hasilnya.',
    percobaan: [
      { id: 'p1', a: -3, op: '+', b: 5, konteks: 'Suhu −3 °C naik 5 °C' },
      { id: 'p2', a: 4, op: '+', b: -6, konteks: 'Lantai 4, lift turun 6 lantai' },
      { id: 'p3', a: -2, op: '+', b: -4, konteks: 'Utang 2 ribu, berutang lagi 4 ribu' },
      { id: 'p4', a: 2, op: '-', b: 5, konteks: 'Suhu 2 °C turun 5 °C' },
    ],
    nextLabel: 'Lanjut: Olah Data Penjumlahan →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENGOLAHAN DATA (PENJUMLAHAN)
     ---------------------------------------------------------- */
  olahJumlah: {
    kicker: 'Tahap 4 · Pengolahan Data: Penjumlahan',
    syntax: 'Discovery Learning · Sintaks 4',
    goal: 'Menemukan hubungan antara tanda bilangan kedua dan arah lompatan pada penjumlahan.',
    guru: 'Ajukan pertanyaan pelacak: "Apa yang menentukan arah lompatan: bilangan pertama atau bilangan kedua?" Biarkan murid menemukan polanya sebelum tahap ini ditutup.',
    instruksi:
      'Setiap garis bilangan menunjukkan titik awal dan lompatan untuk sebuah penjumlahan. Tentukan dulu arah lompatannya, lalu hitung hasilnya.',
    arahLabel: 'Ke mana arah lompatannya?',
    opsiArah: [
      { id: 'kanan', label: 'Ke kanan' },
      { id: 'kiri', label: 'Ke kiri' },
      { id: 'diam', label: 'Tidak bergerak' },
    ],
    kasus: [
      {
        id: 'j1',
        a: 3,
        b: 4,
        correct: 'kanan',
        explanation: 'Bilangan kedua (4) positif, maka lompatan 4 langkah ke kanan.',
        hints: ['Mulai dari 3, lompat 4 langkah ke kanan.', 'Hitung: 4, 5, 6, 7.'],
      },
      {
        id: 'j2',
        a: -5,
        b: 3,
        correct: 'kanan',
        explanation:
          'Walaupun titik awalnya negatif, bilangan kedua (3) positif sehingga lompatan tetap ke kanan.',
        hints: ['Mulai dari −5, lompat 3 langkah ke kanan (mendekati 0).', 'Hitung: −4, −3, −2.'],
      },
      {
        id: 'j3',
        a: 2,
        b: -6,
        correct: 'kiri',
        explanation: 'Bilangan kedua (−6) negatif, maka lompatan 6 langkah ke kiri.',
        hints: [
          'Mulai dari 2, lompat 6 langkah ke kiri. Kamu akan melewati 0.',
          'Hitung: 1, 0, −1, −2, −3, −4.',
        ],
      },
      {
        id: 'j4',
        a: -1,
        b: -4,
        correct: 'kiri',
        explanation:
          'Bilangan kedua (−4) negatif, maka lompatan 4 langkah ke kiri, makin jauh dari 0.',
        hints: ['Mulai dari −1, lompat 4 langkah ke kiri.', 'Hitung: −2, −3, −4, −5.'],
      },
    ],
    polaLabel: 'Dari keempat kasus, pola apa yang kamu temukan?',
    polaOpsi: [
      {
        id: 'q1',
        label:
          'Menambah bilangan <strong>positif</strong> berarti bergerak ke <strong>kanan</strong>; menambah bilangan <strong>negatif</strong> berarti bergerak ke <strong>kiri</strong>.',
      },
      { id: 'q2', label: 'Penjumlahan selalu menghasilkan bilangan yang lebih besar.' },
      { id: 'q3', label: 'Tanda hasil penjumlahan selalu sama dengan tanda bilangan pertama.' },
      { id: 'q4', label: 'Arah lompatan ditentukan oleh tanda bilangan pertama.' },
    ],
    polaCorrect: 'q1',
    polaUmpan: {
      q1: 'Tepat! Arah lompatan ditentukan oleh tanda bilangan yang ditambahkan.',
      q2: 'Periksa kasus 2 + (−6) = −4. Hasilnya justru lebih kecil dari 2.',
      q3: 'Periksa kasus −5 + 3 = −2 dan 2 + (−6) = −4. Tanda hasilnya tidak selalu mengikuti bilangan pertama.',
      q4: 'Periksa kasus −5 + 3: bilangan pertamanya negatif, tetapi lompatannya ke kanan.',
    },
    nextLabel: 'Lanjut: Olah Data Pengurangan →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENGOLAHAN DATA (PENGURANGAN)
     ---------------------------------------------------------- */
  olahKurang: {
    kicker: 'Tahap 5 · Pengolahan Data: Pengurangan',
    syntax: 'Discovery Learning · Sintaks 4',
    goal: 'Menemukan hubungan pengurangan dengan penjumlahan: a − b = a + (−b).',
    guru: 'Tekankan cara membaca pola di tabel: bilangan pengurang turun 1, hasil naik 1. Minta murid menjelaskan dengan kalimatnya sendiri mengapa 5 − (−1) lebih dari 5.',
    instruksiPola:
      'Perhatikan pola pengurangan di bawah ini. Setiap baris, bilangan pengurangnya berkurang 1. Lanjutkan polanya!',
    pola: [
      { b: 3, hasil: 2, tampil: true },
      { b: 2, hasil: 3, tampil: true },
      { b: 1, hasil: 4, tampil: true },
      {
        b: 0,
        hasil: 5,
        hints: ['Hasilnya naik 1 dari baris sebelumnya.'],
      },
      {
        b: -1,
        hasil: 6,
        hints: ['Pengurangnya turun 1 lagi (dari 0 ke −1). Hasilnya naik 1 lagi.'],
      },
      {
        b: -2,
        hasil: 7,
        hints: ['Teruskan pola: setiap pengurang turun 1, hasilnya naik 1.'],
      },
    ],
    polaA: 5,
    setaraLabel: 'Dari polanya, 5 − (−2) = 7. Penjumlahan mana yang memberi hasil yang sama?',
    setaraOpsi: [
      { id: 's1', label: '5 + 2' },
      { id: 's2', label: '5 − 2' },
      { id: 's3', label: '−5 + 2' },
      { id: 's4', label: '−5 − 2' },
    ],
    setaraCorrect: 's1',
    setaraUmpan: {
      s1: 'Tepat! Mengurangi −2 sama dengan menambah 2 (lawan dari −2).',
      s2: '5 − 2 = 3, bukan 7. Coba lagi.',
      s3: '−5 + 2 = −3, bukan 7. Coba lagi.',
      s4: '−5 − 2 = −7, bukan 7. Coba lagi.',
    },
    bandingJudul: 'Bandingkan dua lompatan ini',
    banding: { a: 5, b: 3 },
    bandingTeks:
      'Lompatan 5 − 3 dan 5 + (−3) sama persis: keduanya 3 langkah ke kiri dan berhenti di 2. Mengurangi suatu bilangan sama dengan menambah <strong>lawannya</strong>.',
    instruksiCocok:
      'Sekarang pakai temuanmu. Pilih penjumlahan yang setara dengan setiap pengurangan.',
    cocok: [
      {
        id: 'c1',
        a: -4,
        b: 3,
        options: [
          { id: 'o1', label: '−4 + (−3)' },
          { id: 'o2', label: '−4 + 3' },
          { id: 'o3', label: '4 + (−3)' },
          { id: 'o4', label: '4 + 3' },
        ],
        correct: 'o1',
        explanation: 'Mengurangi 3 sama dengan menambah −3, jadi −4 − 3 = −4 + (−3).',
      },
      {
        id: 'c2',
        a: 2,
        b: -6,
        options: [
          { id: 'o1', label: '2 + 6' },
          { id: 'o2', label: '2 + (−6)' },
          { id: 'o3', label: '−2 + 6' },
          { id: 'o4', label: '−2 + (−6)' },
        ],
        correct: 'o1',
        explanation: 'Mengurangi −6 sama dengan menambah 6, jadi 2 − (−6) = 2 + 6.',
      },
      {
        id: 'c3',
        a: -1,
        b: -5,
        options: [
          { id: 'o1', label: '−1 + 5' },
          { id: 'o2', label: '−1 + (−5)' },
          { id: 'o3', label: '1 + 5' },
          { id: 'o4', label: '1 + (−5)' },
        ],
        correct: 'o1',
        explanation: 'Mengurangi −5 sama dengan menambah 5, jadi −1 − (−5) = −1 + 5.',
      },
    ],
    instruksiHitung: 'Terakhir, hitung hasil pengurangannya dengan bantuan bentuk setaranya.',
    hitung: [
      {
        a: -4,
        b: 3,
        hints: ['−4 − 3 = −4 + (−3): mulai dari −4, lompat 3 langkah ke kiri.'],
      },
      {
        a: 2,
        b: -6,
        hints: ['2 − (−6) = 2 + 6: mulai dari 2, lompat 6 langkah ke kanan.'],
      },
    ],
    nextLabel: 'Lanjut: Buktikan Dugaanmu →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    syntax: 'Discovery Learning · Sintaks 5',
    goal: 'Menguji dugaan awal dan memeriksa kekeliruan umum dengan garis bilangan.',
    guru: 'Undang murid yang dugaan awalnya berbeda untuk menjelaskan apa yang berubah dari cara berpikirnya. Diskusikan kasus-kasus miskonsepsi secara klasikal.',
    prediksiLabel: 'Dugaanmu pada Tahap 1',
    uji: {
      label: 'Suhu pukul 11.00 = −3 + 5 = ? (°C)',
      hints: ['Mulai dari −3 pada garis bilangan, lalu lompat 5 langkah ke kanan (suhu naik).'],
      temuan:
        'Dari −3, lima langkah ke kanan berhenti di <strong>2</strong>. Jadi suhu pukul 11.00 adalah 2 °C.',
    },
    kesimpulanBenar: 'Dugaanmu di Tahap 1 ternyata tepat. Sekarang kamu punya buktinya!',
    kesimpulanKeliru:
      'Dugaan awalmu berbeda dengan hasil pembuktian. Itu wajar dan justru berharga — di situlah penemuan terjadi.',
    instruksiSoal:
      'Tiga teman menuliskan jawaban berikut. Periksa dengan garis bilangan, lalu pilih tanggapan yang paling tepat.',
    soal: [
      {
        id: 'v1',
        pernyataan:
          'Budi menulis <em>−3 + 5 = −8</em>, "karena angkanya dijumlah lalu diberi tanda minus." Tanggapan mana yang tepat?',
        options: [
          {
            id: 'o1',
            label: 'Budi keliru. Dari −3 lompat 5 langkah ke kanan berhenti di 2, jadi −3 + 5 = 2.',
          },
          { id: 'o2', label: 'Budi benar, karena ada tanda minus di depan 3.' },
          { id: 'o3', label: 'Budi keliru, jawaban yang benar adalah 8.' },
          { id: 'o4', label: 'Budi keliru, jawaban yang benar adalah −2.' },
        ],
        correct: 'o1',
        explanation:
          'Menambah 5 berarti bergerak ke kanan, bukan ke kiri. Hasilnya harus lebih besar daripada −3, yaitu 2.',
      },
      {
        id: 'v2',
        pernyataan:
          'Sari menulis <em>4 − (−2) = 2</em>, "karena dikurangi berarti hasilnya lebih kecil." Tanggapan mana yang tepat?',
        options: [
          {
            id: 'o1',
            label: 'Sari keliru. 4 − (−2) = 4 + 2 = 6, jadi hasilnya justru lebih besar.',
          },
          { id: 'o2', label: 'Sari benar, pengurangan selalu membuat hasil lebih kecil.' },
          { id: 'o3', label: 'Sari keliru, jawaban yang benar adalah −6.' },
          { id: 'o4', label: 'Sari keliru, jawaban yang benar adalah −2.' },
        ],
        correct: 'o1',
        explanation:
          'Mengurangi bilangan negatif sama dengan menambah lawannya. Karena −2 dilawan menjadi 2, hasilnya 4 + 2 = 6.',
      },
      {
        id: 'v3',
        pernyataan:
          'Suhu Kota A 3 °C, sedangkan Kota B −4 °C. Rudi berkata selisih suhunya 1 °C "karena 4 − 3 = 1." Tanggapan mana yang tepat?',
        options: [
          {
            id: 'o1',
            label:
              'Rudi keliru. Selisihnya 3 − (−4) = 7 °C; pada garis bilangan jarak dari −4 ke 3 adalah 7 langkah.',
          },
          { id: 'o2', label: 'Rudi benar, selisih suhunya 1 °C.' },
          { id: 'o3', label: 'Rudi keliru, selisihnya −1 °C.' },
          { id: 'o4', label: 'Rudi keliru, selisihnya −7 °C.' },
        ],
        correct: 'o1',
        explanation:
          'Hitung langkah dari −4 ke 3: 4 langkah menuju 0, lalu 3 langkah lagi, jadi 7 langkah. Secara hitungan 3 − (−4) = 3 + 4 = 7.',
      },
    ],
    nextLabel: 'Lanjut: Susun Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — GENERALISASI
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    syntax: 'Discovery Learning · Sintaks 6',
    goal: 'Merumuskan aturan umum penjumlahan dan pengurangan bilangan bulat.',
    guru: 'Setelah kalimat lengkap, minta dua atau tiga murid membacakan kesimpulan dengan bahasanya sendiri lalu tautkan ke istilah formal: lawan bilangan dan garis bilangan.',
    instruksi:
      'Lengkapi kalimat-kalimat kesimpulan berikut dengan memilih potongan kalimat yang tepat. Hati-hati, ada potongan pengecoh.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'g1', awal: 'Pada garis bilangan, bilangan bulat negatif terletak', correct: 'b1' },
      { id: 'g2', awal: 'Menambah bilangan positif berarti', correct: 'b2' },
      { id: 'g3', awal: 'Menambah bilangan negatif berarti', correct: 'b3' },
      { id: 'g4', awal: 'Mengurangi suatu bilangan sama dengan', correct: 'b4' },
    ],
    bank: [
      { id: 'b1', teks: 'di sebelah kiri 0; makin ke kiri, nilainya makin kecil.' },
      { id: 'b2', teks: 'bergerak ke kanan pada garis bilangan.' },
      { id: 'b3', teks: 'bergerak ke kiri pada garis bilangan.' },
      { id: 'b4', teks: 'menambah lawan bilangan itu: a − b = a + (−b).' },
      { id: 'b5', teks: 'di sebelah kanan 0, karena bertanda minus.' },
      { id: 'b6', teks: 'selalu menghasilkan bilangan yang lebih besar.' },
      { id: 'b7', teks: 'mengurangi lawan bilangan itu: a − b = a − (−b).' },
    ],
    rangkuman: [
      'Bilangan bulat negatif (−1, −2, −3, …) terletak di kiri 0, bilangan positif di kanan 0.',
      'Pada penjumlahan a + b, mulailah dari a lalu lompat sejauh b: ke <strong>kanan</strong> bila b positif, ke <strong>kiri</strong> bila b negatif.',
      'Pengurangan diubah menjadi penjumlahan dengan lawannya: <strong>a − b = a + (−b)</strong>. Contoh: 4 − (−2) = 4 + 2 = 6.',
      'Suhu naik, menyetor uang, dan naik ke atas dinyatakan dengan bilangan positif; suhu turun, utang, dan posisi di bawah permukaan laut dinyatakan dengan bilangan negatif.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP (createExerciseStage)
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Penerapan konsep',
    goal: 'Menyelesaikan masalah kontekstual suhu, saldo, dan ketinggian dengan operasi bilangan bulat.',
    guru: 'Amati murid yang sering membuka petunjuk. Ajak mereka menggambar garis bilangan di buku sebelum menghitung.',
    instruksi:
      'Enam soal berikut memuat konteks suhu, saldo, dan ketinggian. Ubah dulu ceritanya menjadi operasi bilangan bulat, lalu hitung.',
    soal: [
      {
        id: 't1',
        type: 'choice',
        konteks: '🌡️ Suhu',
        cerita: 'Suhu di dalam freezer −18 °C. Saat listrik padam, suhunya naik 7 °C.',
        pertanyaan: 'Berapa suhu freezer sekarang?',
        options: [
          { id: 'o1', label: '−11 °C' },
          { id: 'o2', label: '−25 °C' },
          { id: 'o3', label: '11 °C' },
          { id: 'o4', label: '25 °C' },
        ],
        correct: 'o1',
        explanation: 'Suhu naik berarti ditambah: −18 + 7 = −11. Suhu freezer menjadi −11 °C.',
      },
      {
        id: 't2',
        type: 'input',
        konteks: '💰 Saldo',
        cerita:
          'Kas kelas berisi Rp25.000. Kelas membeli perlengkapan kebersihan seharga Rp40.000 dan kekurangannya dicatat sebagai utang.',
        pertanyaan: 'Berapa saldo kas kelas sekarang, dalam <strong>ribu rupiah</strong>?',
        jawab: -15,
        suffix: 'ribu',
        hints: [
          'Membeli berarti saldo berkurang: 25 − 40.',
          '25 − 40 = 25 + (−40). Dari 25 lompat 40 ke kiri: 25 langkah sampai 0, lalu 15 langkah lagi.',
        ],
        reveal:
          '25 − 40 = 25 + (−40) = <strong>−15</strong>. Saldo kas −15 ribu rupiah, artinya kelas berutang Rp15.000.',
        explanation: '25 − 40 = −15. Saldo negatif berarti kelas masih berutang Rp15.000.',
      },
      {
        id: 't3',
        type: 'choice',
        konteks: '🌊 Ketinggian',
        cerita:
          'Seekor burung camar terbang 8 m di atas permukaan laut, lalu menukik 11 m ke bawah untuk menangkap ikan.',
        pertanyaan: 'Di manakah posisi burung camar itu sekarang?',
        options: [
          { id: 'o1', label: '3 m di bawah permukaan laut (−3 m)' },
          { id: 'o2', label: '3 m di atas permukaan laut (3 m)' },
          { id: 'o3', label: '19 m di atas permukaan laut (19 m)' },
          { id: 'o4', label: '19 m di bawah permukaan laut (−19 m)' },
        ],
        correct: 'o1',
        explanation:
          'Menukik ke bawah berarti dikurangi: 8 − 11 = 8 + (−11) = −3, yaitu 3 m di bawah permukaan laut.',
      },
      {
        id: 't4',
        type: 'input',
        konteks: '🌡️ Suhu',
        cerita:
          'Pada siang hari suhu di Dataran Tinggi Dieng 14 °C. Menjelang subuh suhunya turun menjadi −2 °C.',
        pertanyaan: 'Berapa derajat penurunan suhunya?',
        jawab: 16,
        suffix: '°C',
        hints: ['Penurunan suhu = suhu siang − suhu subuh = 14 − (−2).', '14 − (−2) = 14 + 2.'],
        reveal:
          '14 − (−2) = 14 + 2 = <strong>16</strong>. Suhunya turun 16 °C (14 langkah sampai 0, lalu 2 langkah lagi).',
        explanation: '14 − (−2) = 14 + 2 = 16. Suhunya turun 16 °C.',
      },
      {
        id: 't5',
        type: 'choice',
        konteks: '🌊 Ketinggian',
        cerita:
          'Sebuah kapal selam berada 50 m di bawah permukaan laut. Kapal itu naik 20 m, lalu turun lagi 35 m.',
        pertanyaan: 'Di manakah posisi akhir kapal selam?',
        options: [
          { id: 'o1', label: '−65 m' },
          { id: 'o2', label: '−5 m' },
          { id: 'o3', label: '−35 m' },
          { id: 'o4', label: '−105 m' },
        ],
        correct: 'o1',
        explanation:
          '−50 + 20 − 35 = −30 − 35 = −30 + (−35) = −65. Kapal selam berada 65 m di bawah permukaan laut.',
      },
      {
        id: 't6',
        type: 'input',
        konteks: '💰 Saldo',
        cerita: 'Catatan kantin menunjukkan Ani berutang Rp8.000. Hari ini Ani membayar Rp5.000.',
        pertanyaan: 'Berapa saldo catatan Ani sekarang, dalam <strong>ribu rupiah</strong>?',
        jawab: -3,
        suffix: 'ribu',
        hints: [
          'Utang Rp8.000 ditulis −8. Membayar berarti saldonya bertambah: −8 + 5.',
          'Dari −8 lompat 5 langkah ke kanan.',
        ],
        reveal: '−8 + 5 = <strong>−3</strong>. Ani masih berutang Rp3.000.',
        explanation: '−8 + 5 = −3. Ani masih berutang Rp3.000.',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Refleksi',
    goal: 'Menyadari proses berpikir sendiri selama menemukan aturan operasi bilangan bulat.',
    guru: 'Bacalah jawaban refleksi murid untuk menentukan siapa yang perlu pendampingan lanjutan, terutama pada pengurangan bilangan negatif.',
    pertanyaan: [
      {
        id: 'f1',
        teks: 'Bandingkan dugaanmu di Tahap 1 dengan hasil pembuktian di Tahap 6. Apa yang berubah dari cara berpikirmu?',
        placeholder: 'Awalnya saya mengira… ternyata…',
      },
      {
        id: 'f2',
        teks: 'Jelaskan dengan kalimatmu sendiri mengapa 4 − (−2) hasilnya lebih besar daripada 4.',
        placeholder: 'Menurut saya, karena…',
      },
      {
        id: 'f3',
        teks: 'Tuliskan satu contoh masalah sehari-hari yang memakai bilangan negatif, lalu selesaikan.',
        placeholder: 'Contoh: suhu … turun …, jadi …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat menjumlah dan mengurangkan bilangan bulat sekarang?',
    diriOpsi: [
      { id: 'd1', label: 'Sangat yakin, saya bisa menjelaskannya ke teman' },
      { id: 'd2', label: 'Cukup yakin, sesekali masih perlu garis bilangan' },
      { id: 'd3', label: 'Belum yakin, saya ingin berlatih lagi' },
    ],
    nextLabel: 'Selesaikan Pembelajaran →',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Kerja bagus, kamu sudah menemukannya sendiri!',
    teks: 'Kamu telah menempuh seluruh tahap penemuan: dari menduga, merumuskan masalah, mengumpulkan dan mengolah data, membuktikan, sampai menarik kesimpulan sendiri.',
    capaian: [
      'Merepresentasikan bilangan bulat dari konteks suhu, ketinggian, dan saldo pada garis bilangan.',
      'Menjumlahkan bilangan bulat dengan lompatan ke kanan (tambah positif) atau ke kiri (tambah negatif).',
      'Mengurangkan bilangan bulat dengan mengubahnya menjadi penjumlahan lawan: a − b = a + (−b).',
      'Menyelesaikan masalah kontekstual suhu, saldo, dan ketinggian dengan operasi bilangan bulat.',
    ],
  },
};
