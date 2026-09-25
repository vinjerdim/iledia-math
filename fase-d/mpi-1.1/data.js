'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membaca & Menulis Bilangan Bulat dalam Kehidupan
   Sehari-hari — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Membaca dan menuliskan bilangan bulat (positif, negatif, nol)
   dalam konteks kehidupan sehari-hari.

   Notasi baku yang dipakai di seluruh modul:
     • keadaan di sisi negatif titik acuan (di bawah nol, di bawah
       lantai dasar/permukaan laut, rugi, utang, turun, kehilangan
       poin) ditulis dengan tanda − menempel di depan angka (−5) dan
       dibaca "negatif lima";
     • keadaan di sisi positif ditulis tanpa tanda (5) atau dengan
       tanda + (+5), dibaca "lima" atau "positif lima";
     • titik acuan ditulis 0, dibaca "nol" — bukan positif dan bukan
       negatif;
     • "minus" adalah nama operasi pengurangan (7 − 2), bukan cara
       baku membaca tanda bilangan negatif.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahPilah' & 'olahBaca'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi   (7')  — "Papan Kabar Pagi": empat potongan kabar
                            (cuaca Dieng, layar lift, papan selam,
                            catatan kas kelas). Murid menduga cara
                            membaca & menulis bilangannya.
     2. Masalah     (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data        (15') — "Jelajah Kota": delapan situasi pada skala
                            bertema (suhu, lift, laut, uang, skor).
                            Murid menulis bilangannya (diperiksa dengan
                            diagnosa miskonsepsi) lalu memilih cara
                            bacanya; tabel data terisi otomatis.
     4a. Kata Kunci (10') — memilah frasa sehari-hari ke positif /
                            negatif / nol dan menemukan pola kata kunci.
     4b. Baca-Tulis (13') — memasangkan notasi ↔ cara baca, menulis
                            notasi dari dikte, dan mengetik cara baca.
     5. Bukti       (10') — menguji pernyataan & membandingkan dengan
                            dugaan awal serta hipotesis.
     6. Simpulan    (7')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap   (10') — delapan soal diambil acak dari bank dua
                            belas soal (isian notasi, isian cara baca,
                            pilihan ganda).
     8. Refleksi    (3')  — refleksi tertulis & penilaian diri.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar". app.js mengacaknya SEKALI saat state disiapkan
   (ensureShuffledOrder / ensureSortStates / shuffleArray dari
   shared/engine.js), sehingga tiap murid dan tiap Reset mendapat
   urutan berbeda. Pilihan cara baca pada tahap Data dibuat engine
   (opsiCaraBaca) lalu diacak dengan cara yang sama.

   Konsistensi kunci jawaban diuji tests/mpi-1.1-data.test.js terhadap
   engine seksi 29 (nilaiKonteks, tandaKataKunci, bacaBulat, …).
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  meta: {
    judul: 'Membaca & Menulis Bilangan Bulat dalam Kehidupan Sehari-hari',
  },

  tahap: [
    { id: 'stimulasi', label: 'Stimulasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'koleksi', label: 'Data' },
    { id: 'olahPilah', label: 'Kata Kunci' },
    { id: 'olahBaca', label: 'Baca & Tulis' },
    { id: 'verifikasi', label: 'Bukti' },
    { id: 'generalisasi', label: 'Simpulan' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Bukti.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati bilangan bulat dalam kabar sehari-hari dan menyampaikan dugaan cara membaca serta menuliskannya.',
    guru: 'Bacakan setiap kabar dengan ekspresif. Minta pasangan murid membaca lantang bilangan yang disorot sebelum menjawab dugaan — dengarkan apakah muncul kata "minus", "min", atau "negatif", tetapi jangan membenarkan atau menyalahkan dulu. Dugaan ini akan diuji murid sendiri di tahap Bukti.',
    judul: 'Papan Kabar Pagi',
    pengantar:
      'Sebelum berangkat sekolah, Sari membuka grup kelas dan menemukan empat kabar ini. Semuanya memuat bilangan — tetapi ada yang ditulis dengan tanda, huruf, atau kata-kata.',
    kabar: [
      {
        id: 'cuaca',
        ikon: '🌡️',
        sumber: 'Info Cuaca Dieng',
        teks: 'Pagi ini suhu di kompleks Candi Arjuna turun sampai 3 derajat di bawah nol. Embun upas menyelimuti kebun kentang!',
        sorot: '−3 °C',
      },
      {
        id: 'lift',
        ikon: '🛗',
        sumber: 'Layar lift Mal Kota',
        teks: 'Parkir motor ada di lantai B2, dua lantai di bawah lantai dasar (lobi).',
        sorot: 'B2',
      },
      {
        id: 'selam',
        ikon: '🤿',
        sumber: 'Papan Klub Selam Bunaken',
        teks: 'Terumbu karang favorit berada 12 meter di bawah permukaan laut.',
        sorot: '12 m ↓',
      },
      {
        id: 'kas',
        ikon: '💰',
        sumber: 'Catatan Kas Kelas VII-B',
        teks: 'Bulan ini kas kelas rugi karena membeli spidol. Bendahara menulis sisa kas: −Rp15.000.',
        sorot: '−Rp15.000',
      },
    ],
    dugaan: [
      {
        id: 'd1',
        tanya: 'Bagaimana dugaanmu cara membaca suhu <strong>−3 °C</strong> di Dieng?',
        opsi: [
          { id: 'a', label: '"negatif tiga derajat Celsius"' },
          { id: 'b', label: '"minus tiga derajat Celsius"' },
          { id: 'c', label: '"tiga derajat Celsius negatif"' },
          { id: 'd', label: '"tiga derajat Celsius"' },
        ],
        baku: 'a',
        pembahasan: '−3 °C dibaca "negatif tiga derajat Celsius".',
      },
      {
        id: 'd2',
        tanya:
          'Jika lantai dasar (lobi) diberi bilangan <strong>0</strong>, bagaimana dugaanmu menuliskan lantai B2 dengan bilangan bulat?',
        opsi: [
          { id: 'a', label: '−2' },
          { id: 'b', label: '2−' },
          { id: 'c', label: '2' },
          { id: 'd', label: '(2)' },
        ],
        baku: 'a',
        pembahasan: 'Dua lantai di bawah lantai dasar ditulis −2, dibaca "negatif dua".',
      },
      {
        id: 'd3',
        tanya:
          'Bagaimana dugaanmu menuliskan letak terumbu <strong>12 meter di bawah permukaan laut</strong> sebagai bilangan bulat?',
        opsi: [
          { id: 'a', label: '−12 m' },
          { id: 'b', label: '12 m' },
          { id: 'c', label: '12− m' },
          { id: 'd', label: 'min 12 m' },
        ],
        baku: 'a',
        pembahasan:
          'Permukaan laut adalah titik acuan 0; di bawahnya ditulis negatif: −12 m, dibaca "negatif dua belas meter".',
      },
    ],
    alasanLabel: 'Mengapa kamu memilih dugaan-dugaan itu? (boleh singkat)',
    alasanPlaceholder: 'Menurutku … karena …',
    catatan:
      'Tidak ada jawaban salah di tahap ini. Simpan dugaanmu — kamu akan mengujinya sendiri di tahap Bukti.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan inti yang akan diselidiki dan menuliskan hipotesis.',
    guru: 'Tanyakan: "Kalau setiap orang menulis dan membaca bilangan ini dengan caranya sendiri, apa yang bisa terjadi?" (salah paham suhu, salah turun lantai, salah hitung kas). Hipotesis boleh keliru; yang penting murid berani menuliskannya dengan kalimat sendiri.',
    pengantar:
      'Teman-teman Sari membaca kabar itu dengan cara berbeda-beda: ada yang bilang "min tiga", ada yang bilang "negatif tiga", ada juga yang menulis "2−" untuk lantai B2. Supaya semua orang paham dengan cara yang sama, kita perlu menyelidiki sesuatu.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'inti',
        label:
          'Bagaimana cara baku menuliskan dan membaca bilangan bulat positif, negatif, dan nol yang muncul dalam kehidupan sehari-hari?',
      },
      { id: 'cuaca', label: 'Mengapa suhu di Dieng bisa lebih dingin daripada di Jakarta?' },
      { id: 'lift', label: 'Berapa banyak lantai parkir yang sebaiknya dimiliki sebuah mal?' },
      { id: 'kas', label: 'Bagaimana cara berhemat agar kas kelas tidak rugi lagi?' },
    ],
    correct: 'inti',
    umpan: {
      inti: 'Tepat! Pertanyaan ini bisa kamu jawab sendiri dengan mengumpulkan dan mengolah data bilangan dari berbagai situasi.',
      cuaca:
        'Itu pertanyaan IPA yang menarik, tetapi tidak menjawab kebingungan cara membaca "−3 °C". Coba pilih lagi.',
      lift: 'Itu soal desain gedung. Masalah kita adalah cara menuliskan nomor lantainya. Coba pilih lagi.',
      kas: 'Berhemat memang penting, tetapi masalah kita adalah cara menulis dan membaca "−Rp15.000". Coba pilih lagi.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: "Keadaan di bawah titik acuan ditulis dengan …, dibaca …, sedangkan titik acuannya ditulis …"',
    hipotesisPlaceholder: 'Keadaan di bawah titik acuan ditulis dengan …',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA: JELAJAH KOTA
     Setiap situasi ditampilkan pada skala konteks (buildSkalaKonteks);
     hanya titik acuan 0 yang berlabel, sehingga murid menghitung
     sendiri jaraknya. `jawab` = nilaiKonteks(besar, frasa) — diuji.
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengumpulkan data: menuliskan dan membaca bilangan untuk berbagai keadaan sehari-hari di atas, di bawah, dan tepat di titik acuan.',
    guru: 'Biarkan murid menghitung langkah dari titik acuan pada skala. Bila murid menulis "4" untuk keadaan di bawah nol, tanyakan: "Bagaimana pembaca membedakannya dengan 4 derajat di atas nol?" Pada skala yang satu langkahnya bernilai 50 atau 10.000, minta murid menjelaskan cara menghitungnya.',
    instruksi:
      'Jelajahi delapan tempat di kota. Pada setiap skala, cari titik acuan (0), hitung berapa langkah titik itu dari 0, perhatikan apakah di atas atau di bawah 0, lalu tuliskan bilangannya. Untuk keadaan di bawah titik acuan, ketik tanda - di depan angka. Setelah itu, pilih cara membacanya.',
    tanyaBaca: 'Bagaimana cara baku membaca bilangan ini (tanpa satuan)?',
    situasi: [
      {
        id: 'puncak',
        tema: 'suhu',
        tempat: 'Puncak Jaya, Papua',
        frasa: 'Suhu dini hari 4 derajat di bawah nol',
        label:
          'Suhu di Puncak Jaya pada dini hari: 4 derajat <strong>di bawah</strong> nol. Tulis suhunya.',
        besar: 4,
        jawab: -4,
        satuan: '°C',
        skala: { min: -6, max: 6 },
        hints: [
          'Titiknya 4 langkah di bawah 0. Keadaan di bawah nol perlu tanda khusus agar tidak tertukar dengan 4 derajat di atas nol.',
          'Ketik tanda - lalu angka 4.',
        ],
        temuan: 'Di bawah nol derajat → bilangan negatif: −4 °C.',
      },
      {
        id: 'kulkas',
        tema: 'suhu',
        tempat: 'Lemari es warung',
        frasa: 'Suhu lemari es 5 derajat di atas nol',
        label:
          'Suhu di dalam lemari es warung: 5 derajat <strong>di atas</strong> nol. Tulis suhunya.',
        besar: 5,
        jawab: 5,
        satuan: '°C',
        skala: { min: -6, max: 6 },
        hints: ['Titiknya 5 langkah di atas 0. Keadaan di atas nol cukup ditulis angkanya saja.'],
        temuan: 'Di atas nol derajat → bilangan positif: 5 °C (boleh ditulis +5 °C).',
      },
      {
        id: 'parkir',
        tema: 'gedung',
        tempat: 'Mal Kota',
        frasa: 'Parkir mobil 3 lantai di bawah lantai dasar',
        label:
          'Parkir mobil berada 3 lantai <strong>di bawah</strong> lantai dasar (lantai dasar = 0). Tulis nomor lantainya.',
        besar: 3,
        jawab: -3,
        satuan: '',
        skala: { min: -4, max: 5 },
        hints: [
          'Lantai dasar adalah 0. Parkir mobil berada 3 lantai di bawahnya.',
          'Gunakan cara yang sama seperti suhu di bawah nol: tanda - di depan angka.',
        ],
        temuan: 'Di bawah lantai dasar → bilangan negatif: lantai −3.',
      },
      {
        id: 'lobi',
        tema: 'gedung',
        tempat: 'Mal Kota',
        frasa: 'Lift berhenti di lantai dasar',
        label:
          'Lift berhenti di <strong>lantai dasar</strong>, tempat lobi. Tulis nomor lantainya.',
        besar: 0,
        jawab: 0,
        satuan: '',
        skala: { min: -4, max: 5 },
        hints: ['Lantai dasar adalah titik acuan — tidak di atas, tidak di bawah.'],
        temuan: 'Titik acuan ditulis 0 — tanpa tanda, karena 0 bukan positif dan bukan negatif.',
      },
      {
        id: 'kapal',
        tema: 'laut',
        tempat: 'Selat Makassar',
        frasa: 'Kapal selam berada 150 meter di bawah permukaan laut',
        label:
          'Sebuah kapal selam berada 150 meter <strong>di bawah</strong> permukaan laut. Perhatikan: 1 langkah = 50 m. Tulis posisinya (meter).',
        besar: 150,
        jawab: -150,
        satuan: 'm',
        skala: { min: -250, max: 150, langkah: 50 },
        hints: [
          'Hitung langkahnya dari permukaan laut: ada 3 langkah ke bawah, dan setiap langkah bernilai 50 m.',
          '3 × 50 = 150, dan posisinya di bawah permukaan laut. Ketik tanda - di depan 150.',
        ],
        temuan: 'Di bawah permukaan laut → bilangan negatif: −150 m.',
      },
      {
        id: 'elang',
        tema: 'laut',
        tempat: 'Tebing Uluwatu',
        frasa: 'Burung elang terbang 100 meter di atas permukaan laut',
        label:
          'Seekor elang terbang 100 meter <strong>di atas</strong> permukaan laut. Perhatikan: 1 langkah = 50 m. Tulis posisinya (meter).',
        besar: 100,
        jawab: 100,
        satuan: 'm',
        skala: { min: -250, max: 150, langkah: 50 },
        hints: ['Ada 2 langkah ke atas dari permukaan laut; 2 × 50 = 100.'],
        temuan: 'Di atas permukaan laut → bilangan positif: 100 m (boleh +100 m).',
      },
      {
        id: 'koperasi',
        tema: 'uang',
        tempat: 'Koperasi sekolah',
        frasa: 'Koperasi sekolah rugi Rp20.000 bulan lalu',
        label:
          'Bulan lalu koperasi sekolah <strong>rugi</strong> Rp20.000. Perhatikan: 1 langkah = Rp10.000. Tulis keadaan kas itu sebagai bilangan bulat (rupiah).',
        besar: 20000,
        jawab: -20000,
        satuan: 'rupiah',
        skala: { min: -50000, max: 30000, langkah: 10000 },
        hints: [
          'Titik acuannya impas (Rp0). Rugi berarti berada di bawah titik acuan.',
          'Tulis tanda - di depan 20000 (boleh dengan titik ribuan: 20.000).',
        ],
        temuan: 'Rugi → bilangan negatif: −20.000 (rupiah).',
      },
      {
        id: 'kuis',
        tema: 'skor',
        tempat: 'Lomba cerdas cermat',
        frasa: 'Tim Biru kehilangan 30 poin dari skor awal',
        label:
          'Di babak pertama lomba cerdas cermat, Tim Biru <strong>kehilangan</strong> 30 poin dari skor awal 0. Perhatikan: 1 langkah = 10 poin. Tulis skornya.',
        besar: 30,
        jawab: -30,
        satuan: 'poin',
        skala: { min: -50, max: 50, langkah: 10 },
        hints: [
          'Kehilangan poin berarti skornya turun di bawah skor awal 0.',
          '3 langkah × 10 poin = 30 poin di bawah 0.',
        ],
        temuan: 'Kehilangan poin → bilangan negatif: skor −30.',
      },
    ],
    amati: [
      {
        id: 'a1',
        tanya:
          'Amati kolom <strong>Tulisan</strong> pada tabel. Apa kesamaan cara menulis semua keadaan di bawah titik acuan?',
        opsi: [
          { id: 'depan', label: 'Diberi tanda negatif (−) di <strong>depan</strong> angka' },
          { id: 'belakang', label: 'Diberi tanda negatif (−) di <strong>belakang</strong> angka' },
          { id: 'kurung', label: 'Angkanya ditulis di dalam tanda kurung' },
          { id: 'polos', label: 'Tidak diberi tanda apa pun, sama seperti di atas titik acuan' },
        ],
        correct: 'depan',
        umpan: {
          depan:
            'Betul! −4, −3, −150, −20.000, dan −30 semuanya memakai tanda negatif di depan angka. Bilangan seperti ini disebut <strong>bilangan bulat negatif</strong>.',
          belakang: 'Lihat lagi kolom Tulisan: tanda − berada di sebelah mana angkanya?',
          kurung: 'Tidak ada tanda kurung di tabel. Lihat lagi kolom Tulisan.',
          polos: 'Kalau tanpa tanda, −4 dan 4 akan terlihat sama. Lihat lagi kolom Tulisan.',
        },
      },
      {
        id: 'a2',
        tanya:
          'Amati kolom <strong>Dibaca</strong>. Bilangan yang bertanda − selalu dibaca dengan diawali kata …',
        opsi: [
          { id: 'negatif', label: '"negatif"' },
          { id: 'minus', label: '"minus"' },
          { id: 'kurang', label: '"kurang"' },
          { id: 'bawah', label: '"bawah"' },
        ],
        correct: 'negatif',
        umpan: {
          negatif:
            'Betul! Tanda di depan bilangan dibaca lebih dulu dengan kata <strong>negatif</strong>: −4 dibaca "negatif empat".',
          minus:
            'Kata "minus" dipakai untuk operasi pengurangan, mis. 9 − 4. Lihat lagi kolom Dibaca.',
          kurang: '"Kurang" juga kata untuk pengurangan. Lihat lagi kolom Dibaca.',
          bawah:
            '"Di bawah" menjelaskan keadaannya, tetapi bukan cara membaca tandanya. Lihat lagi kolom Dibaca.',
        },
      },
      {
        id: 'a3',
        tanya:
          'Bagaimana cara menulis dan membaca keadaan yang <strong>tepat di titik acuan</strong> (lantai dasar)?',
        opsi: [
          { id: 'nol', label: 'Ditulis 0 tanpa tanda, dibaca "nol"' },
          { id: 'negnol', label: 'Ditulis −0, dibaca "negatif nol"' },
          { id: 'posnol', label: 'Ditulis +0, dibaca "positif nol"' },
          { id: 'kosong', label: 'Tidak bisa ditulis dengan bilangan' },
        ],
        correct: 'nol',
        umpan: {
          nol: 'Betul! Titik acuan ditulis 0 dan dibaca "nol". Nol bukan bilangan positif dan bukan bilangan negatif.',
          negnol:
            'Titik acuan tidak berada di bawah dirinya sendiri, jadi tidak perlu tanda negatif.',
          posnol:
            'Titik acuan tidak berada di atas dirinya sendiri, jadi tidak perlu tanda positif.',
          kosong: 'Lihat baris lantai dasar pada tabel: ada bilangannya, bukan?',
        },
      },
    ],
    nextLabel: 'Lanjut: Olah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — PENGOLAHAN DATA: KATA KUNCI
     `correct` = tandaKataKunci(teks) dan `jawab` = nilaiKonteks(besar,
     teks) — diuji.
     ---------------------------------------------------------- */
  olahPilah: {
    kicker: 'Tahap 4a · Pengolahan Data — Kata Kunci',
    syntax: DL + ' · Sintaks 4',
    goal: 'Mengolah data untuk menemukan kata-kata dalam kehidupan sehari-hari yang menunjukkan bilangan bulat positif, negatif, atau nol.',
    guru: 'Minta murid melingkari (menyebutkan) kata yang membuat mereka memilih jawaban, mis. "di bawah", "rugi", "tepat". Tekankan bahwa titik acuan harus ditentukan lebih dulu: lantai dasar, permukaan laut, 0 °C, impas, skor awal.',
    judulA: 'A. Pilah keadaan sehari-hari',
    instruksiA:
      'Setiap kalimat menggambarkan keadaan di sekitar kita. Tentukan apakah keadaan itu dinyatakan dengan bilangan bulat positif, negatif, atau nol.',
    opsiPilah: [
      { id: 'pos', label: 'Bilangan bulat positif' },
      { id: 'neg', label: 'Bilangan bulat negatif' },
      { id: 'nol', label: 'Nol (titik acuan)' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: 'Suhu di kutub selatan mencapai 25 derajat di bawah nol.',
        besar: 25,
        jawab: -25,
        correct: 'neg',
        explanation: 'Kata kunci "di bawah" nol → negatif: −25 °C.',
      },
      {
        id: 'p2',
        teks: 'Pesawat terbang 9.000 meter di atas permukaan laut.',
        besar: 9000,
        jawab: 9000,
        correct: 'pos',
        explanation: 'Kata kunci "di atas" permukaan laut → positif: 9.000 m.',
      },
      {
        id: 'p3',
        teks: 'Kantin sekolah untung Rp50.000 hari ini.',
        besar: 50000,
        jawab: 50000,
        correct: 'pos',
        explanation: 'Kata kunci "untung" → positif: 50.000 (rupiah).',
      },
      {
        id: 'p4',
        teks: 'Paman punya utang Rp200.000 di toko bangunan.',
        besar: 200000,
        jawab: -200000,
        correct: 'neg',
        explanation: 'Kata kunci "utang" → negatif: −200.000 (rupiah).',
      },
      {
        id: 'p5',
        teks: 'Lift berhenti di lantai dasar.',
        besar: 0,
        jawab: 0,
        correct: 'nol',
        explanation: 'Lantai dasar adalah titik acuan → 0.',
      },
      {
        id: 'p6',
        teks: 'Harga cabai turun Rp3.000 per kilogram.',
        besar: 3000,
        jawab: -3000,
        correct: 'neg',
        explanation: 'Kata kunci "turun" → perubahan negatif: −3.000 (rupiah).',
      },
      {
        id: 'p7',
        teks: 'Doni mendapat 15 poin di babak pertama.',
        besar: 15,
        jawab: 15,
        correct: 'pos',
        explanation: 'Kata kunci "mendapat" poin → positif: 15.',
      },
      {
        id: 'p8',
        teks: 'Seorang penyelam mengapung tepat di permukaan laut.',
        besar: 0,
        jawab: 0,
        correct: 'nol',
        explanation: 'Kata kunci "tepat" di permukaan laut (titik acuan) → 0.',
      },
      {
        id: 'p9',
        teks: 'Lina menarik tabungan Rp25.000 untuk membeli buku.',
        besar: 25000,
        jawab: -25000,
        correct: 'neg',
        explanation: 'Kata kunci "menarik" tabungan (uang keluar) → negatif: −25.000 (rupiah).',
      },
      {
        id: 'p10',
        teks: 'Ayah menyetor tabungan Rp100.000 ke bank.',
        besar: 100000,
        jawab: 100000,
        correct: 'pos',
        explanation: 'Kata kunci "menyetor" tabungan (uang masuk) → positif: 100.000 (rupiah).',
      },
    ],
    judulB: 'B. Temukan polanya',
    pola: [
      {
        id: 'k1',
        tanya:
          'Kata-kata seperti <em>di bawah, turun, rugi, utang, menarik (tabungan), kehilangan</em> menunjukkan bilangan bulat …',
        opsi: [
          { id: 'neg', label: 'negatif' },
          { id: 'pos', label: 'positif' },
          { id: 'nol', label: 'nol' },
          { id: 'bebas', label: 'bisa positif atau negatif, tergantung angkanya' },
        ],
        correct: 'neg',
        umpan: {
          neg: 'Betul! Kata-kata itu menunjukkan keadaan di sisi negatif titik acuan.',
          pos: 'Lihat lagi kalimat yang memuat kata "rugi" atau "di bawah" — jenis apa yang kamu pilih?',
          nol: 'Nol hanya untuk keadaan yang tepat di titik acuan.',
          bebas:
            'Angkanya menyatakan jarak dari titik acuan; kata kuncinyalah yang menentukan tanda.',
        },
      },
      {
        id: 'k2',
        tanya:
          'Kata-kata seperti <em>di atas, naik, untung, menyetor, mendapat</em> menunjukkan bilangan bulat …',
        opsi: [
          { id: 'pos', label: 'positif' },
          { id: 'neg', label: 'negatif' },
          { id: 'nol', label: 'nol' },
          { id: 'bebas', label: 'tidak dapat ditentukan' },
        ],
        correct: 'pos',
        umpan: {
          pos: 'Betul! Keadaan di sisi positif ditulis tanpa tanda atau dengan tanda +.',
          neg: 'Lihat lagi kalimat tentang untung dan menyetor tabungan.',
          nol: 'Nol hanya untuk keadaan yang tepat di titik acuan.',
          bebas: 'Kata kuncinya sudah cukup untuk menentukan tanda. Coba lagi.',
        },
      },
      {
        id: 'k3',
        tanya: 'Mengapa kita perlu menentukan <strong>titik acuan</strong> (nol) terlebih dahulu?',
        opsi: [
          {
            id: 'acuan',
            label:
              'Karena tanda positif atau negatif menyatakan letak keadaan terhadap titik acuan itu',
          },
          { id: 'besar', label: 'Karena titik acuan selalu bilangan yang paling besar' },
          { id: 'hias', label: 'Karena tanpa titik acuan tulisan terlihat kurang rapi' },
          {
            id: 'tidak',
            label: 'Sebenarnya tidak perlu; semua bilangan boleh ditulis tanpa tanda',
          },
        ],
        correct: 'acuan',
        umpan: {
          acuan:
            'Tepat! Lantai dasar, permukaan laut, 0 °C, impas, dan skor awal adalah titik acuan. Di atasnya positif, di bawahnya negatif.',
          besar: 'Titik acuan tidak selalu terbesar — di atasnya masih ada bilangan positif.',
          hias: 'Titik acuan bukan soal kerapian, tetapi soal makna tanda bilangan.',
          tidak: 'Tanpa tanda, "3 lantai di bawah" dan "3 lantai di atas" akan tertulis sama.',
        },
      },
    ],
    temuan: [
      'Tentukan dulu <strong>titik acuan</strong> (nol): 0 °C, lantai dasar, permukaan laut, impas, atau skor awal.',
      'Keadaan di bawah/berkurang dari titik acuan (<em>di bawah, turun, rugi, utang, menarik, kehilangan</em>) dinyatakan dengan bilangan bulat <strong>negatif</strong>.',
      'Keadaan di atas/bertambah dari titik acuan (<em>di atas, naik, untung, menyetor, mendapat</em>) dinyatakan dengan bilangan bulat <strong>positif</strong>.',
      'Keadaan tepat di titik acuan dinyatakan dengan <strong>0</strong>.',
    ],
    nextLabel: 'Lanjut: Baca & Tulis →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — PENGOLAHAN DATA: BACA & TULIS
     tulisNotasi diperiksa diagnosaTulisBulat, tulisBacaan diperiksa
     cekCaraBaca (lihat buildCekStep di engine).
     ---------------------------------------------------------- */
  olahBaca: {
    kicker: 'Tahap 4b · Pengolahan Data — Baca & Tulis',
    syntax: DL + ' · Sintaks 4',
    goal: 'Mengolah data untuk menemukan cara baku menuliskan dan membaca bilangan bulat, termasuk bilangan besar.',
    guru: 'Lakukan "dikte bilangan" singkat: satu murid membaca lantang, pasangannya menulis. Tekankan bahwa angka bilangan besar dibaca utuh ("seribu dua ratus lima puluh", bukan "satu dua lima nol") dan tanda dibaca lebih dulu.',
    judulA: 'A. Pasangkan tulisan dan cara bacanya',
    instruksiA:
      'Pilih jawaban yang menurutmu baku. Jika belum tepat, baca umpan baliknya lalu coba lagi.',
    pasang: [
      {
        id: 'b1',
        tanya: 'Cara baku membaca <span class="num-chip">−7</span> adalah …',
        opsi: [
          { id: 'a', label: 'negatif tujuh' },
          { id: 'b', label: 'tujuh negatif' },
          { id: 'c', label: 'minus tujuh' },
          { id: 'd', label: 'kurang tujuh' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Tanda di depan bilangan dibaca lebih dulu: "negatif", lalu angkanya.',
          b: 'Urutannya terbalik. Tanda ditulis di depan, jadi dibaca lebih dulu.',
          c: '"Minus" adalah nama operasi pengurangan, misalnya 9 − 7. Tanda bilangan negatif dibaca dengan kata lain.',
          d: '"Kurang" juga kata untuk pengurangan, bukan cara membaca tanda bilangan.',
        },
      },
      {
        id: 'b2',
        tanya: 'Notasi baku untuk <em>"negatif dua puluh lima"</em> adalah …',
        opsi: [
          { id: 'a', label: '−25' },
          { id: 'b', label: '25−' },
          { id: 'c', label: '(25)' },
          { id: 'd', label: '−2 5' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Kata "negatif" menjadi tanda − yang menempel di depan angka.',
          b: 'Tanda negatif tidak ditulis di belakang angka.',
          c: 'Tanda kurung bukan tanda bilangan negatif.',
          d: 'Bilangan 25 ditulis rapat, tanpa spasi di antara angkanya.',
        },
      },
      {
        id: 'b3',
        tanya: 'Cara baku membaca <span class="num-chip">+12</span> adalah …',
        opsi: [
          { id: 'a', label: '"positif dua belas" atau cukup "dua belas"' },
          { id: 'b', label: '"plus dua belas"' },
          { id: 'c', label: '"negatif dua belas"' },
          { id: 'd', label: '"satu dua positif"' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! +12 sama dengan 12, dibaca "positif dua belas" atau "dua belas".',
          b: '"Plus" adalah nama operasi penjumlahan. Tanda + di depan bilangan dibaca "positif".',
          c: 'Tanda + berarti positif, bukan negatif.',
          d: '12 dibaca sebagai satu bilangan: "dua belas", dan tandanya dibaca di depan.',
        },
      },
      {
        id: 'b4',
        tanya: 'Cara baku membaca <span class="num-chip">−1.250</span> adalah …',
        opsi: [
          { id: 'a', label: 'negatif seribu dua ratus lima puluh' },
          { id: 'b', label: 'negatif satu dua lima nol' },
          { id: 'c', label: 'minus seribu dua ratus lima puluh' },
          { id: 'd', label: 'negatif satu koma dua lima nol' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Tandanya dibaca "negatif", lalu bilangannya dibaca utuh: seribu dua ratus lima puluh.',
          b: 'Bilangan dibaca utuh sesuai nilai tempatnya, bukan angka demi angka.',
          c: 'Kata "minus" bukan cara baku membaca tanda bilangan negatif.',
          d: 'Titik pada 1.250 adalah pemisah ribuan, bukan koma desimal.',
        },
      },
    ],
    judulB: 'B. Dikte bilangan: tuliskan dengan angka',
    instruksiB:
      'Petugas koperasi membacakan catatan keuangan. Tuliskan bilangannya dengan notasi baku. Ketik tanda - untuk negatif; titik ribuan boleh dipakai atau tidak.',
    tulisNotasi: [
      {
        id: 'n1',
        bacaan: 'negatif dua ratus lima puluh',
        label:
          'Kas kelas: <em>"negatif dua ratus lima puluh"</em> ribu rupiah. Tulis bilangannya (dalam ribu).',
        jawab: -250,
        hints: ['"Negatif" berarti tanda − di depan.', 'Dua ratus lima puluh ditulis 250.'],
      },
      {
        id: 'n2',
        bacaan: 'negatif seribu lima ratus',
        label: 'Selisih harga: <em>"negatif seribu lima ratus"</em> rupiah. Tulis bilangannya.',
        jawab: -1500,
        hints: ['Seribu lima ratus ditulis 1.500 (atau 1500).', 'Jangan lupa tanda − di depan.'],
      },
      {
        id: 'n3',
        bacaan: 'tujuh puluh lima ribu',
        label: 'Untung penjualan: <em>"tujuh puluh lima ribu"</em> rupiah. Tulis bilangannya.',
        jawab: 75000,
        hints: ['Tidak ada kata "negatif", jadi bilangannya positif — ditulis tanpa tanda.'],
      },
    ],
    judulC: 'C. Bacakan: ketik cara membacanya',
    instruksiC:
      'Ketik cara membaca setiap bilangan dengan huruf, seperti saat kamu membacakannya dengan lantang. Satuan tidak perlu diketik.',
    tulisBacaan: [
      {
        id: 'c1',
        label: 'Suhu freezer es krim: <span class="num-chip">−18</span> °C',
        jawab: -18,
        hints: ['Baca tandanya lebih dulu, lalu angkanya sebagai satu bilangan.'],
      },
      {
        id: 'c2',
        label: 'Kedalaman Palung Weber di Laut Banda: <span class="num-chip">−7.200</span> m',
        jawab: -7200,
        hints: [
          'Titik pada 7.200 adalah pemisah ribuan: tujuh ribu dua ratus.',
          'Awali dengan kata "negatif".',
        ],
      },
      {
        id: 'c3',
        label:
          'Tinggi Gunung Rinjani: <span class="num-chip">3.726</span> m di atas permukaan laut',
        jawab: 3726,
        hints: ['Tiga ribu … ratus … puluh … — bilangan positif cukup dibaca angkanya.'],
      },
    ],
    temuan: [
      'Bilangan negatif ditulis dengan tanda <strong>−</strong> menempel di depan angka dan dibaca <strong>"negatif …"</strong> — bukan "minus".',
      'Bilangan positif ditulis tanpa tanda atau dengan tanda +, dibaca "…" atau "positif …".',
      'Angkanya dibaca utuh sesuai nilai tempat: −1.250 dibaca "negatif seribu dua ratus lima puluh".',
    ],
    nextLabel: 'Lanjut: Buktikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji temuan pada pernyataan baru, lalu membandingkannya dengan dugaan awal dan hipotesis.',
    guru: 'Minta pasangan murid menjelaskan alasan setiap pernyataan benar/salah dengan menunjuk data dari tahap sebelumnya. Pada bagian dugaan, ajak murid yang dugaannya berubah untuk bercerita apa yang membuatnya berubah pikiran.',
    judulA: 'A. Benar atau salah?',
    opsiPernyataan: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'v1',
        teks: '−12 °C dibaca "minus dua belas derajat Celsius".',
        correct: 'salah',
        explanation:
          'Cara bakunya "negatif dua belas derajat Celsius". "Minus" adalah nama operasi pengurangan.',
      },
      {
        id: 'v2',
        teks: 'Lantai dasar ditulis 0, dan 0 bukan bilangan positif maupun negatif.',
        correct: 'benar',
        explanation: 'Lantai dasar adalah titik acuan; 0 tidak bertanda.',
      },
      {
        id: 'v3',
        teks: 'Utang Rp5.000 dapat dinyatakan dengan bilangan −5.000 (rupiah).',
        correct: 'benar',
        explanation: 'Utang berada di bawah titik impas, jadi dinyatakan dengan bilangan negatif.',
      },
      {
        id: 'v4',
        teks: '"Lima negatif" adalah cara baku membaca −5.',
        correct: 'salah',
        explanation: 'Tanda dibaca lebih dulu: −5 dibaca "negatif lima".',
      },
      {
        id: 'v5',
        teks: 'Ketinggian +300 m dan 300 m menyatakan hal yang sama.',
        correct: 'benar',
        explanation: 'Tanda + boleh ditulis atau tidak untuk bilangan positif.',
      },
      {
        id: 'v6',
        teks: 'Kedalaman 40 meter di bawah permukaan laut ditulis 40− m.',
        correct: 'salah',
        explanation: 'Notasi bakunya −40 m: tanda negatif di depan angka.',
      },
      {
        id: 'v7',
        teks: 'Skor −20 dibaca "negatif dua puluh" dan berarti 20 poin di bawah skor awal.',
        correct: 'benar',
        explanation: 'Tanda − dibaca "negatif" dan menunjukkan keadaan di bawah titik acuan.',
      },
    ],
    judulB: 'B. Bandingkan dengan dugaan awalmu',
    nextLabel: 'Lanjut: Tarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Merumuskan kesimpulan tentang cara menuliskan dan membaca bilangan bulat dalam kehidupan sehari-hari.',
    guru: 'Setelah kesimpulan lengkap, minta beberapa murid membacakannya dengan kalimat sendiri dan memberi satu contoh baru dari kehidupan mereka. Tuliskan rangkuman di papan tulis sebagai catatan bersama.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      {
        id: 'k1',
        awal: 'Keadaan di bawah titik acuan (di bawah nol, turun, rugi, utang) dinyatakan dengan',
        correct: 'negatif',
      },
      { id: 'k2', awal: 'Bilangan bulat negatif ditulis dengan', correct: 'tandaDepan' },
      { id: 'k3', awal: 'Bilangan −20 dibaca', correct: 'bacaNegatif' },
      {
        id: 'k4',
        awal: 'Keadaan di atas titik acuan (di atas nol, naik, untung) ditulis',
        correct: 'tanpaTanda',
      },
      { id: 'k5', awal: 'Titik acuan ditulis 0, dibaca "nol", dan', correct: 'nolNetral' },
      { id: 'k6', awal: 'Kata "minus"', correct: 'minusOperasi' },
    ],
    bank: [
      { id: 'negatif', teks: 'bilangan bulat negatif' },
      { id: 'tandaDepan', teks: 'tanda − menempel di depan angka, misalnya −20' },
      { id: 'bacaNegatif', teks: '"negatif dua puluh"' },
      {
        id: 'tanpaTanda',
        teks: 'tanpa tanda atau dengan tanda +, dibaca angkanya saja atau "positif …"',
      },
      { id: 'nolNetral', teks: 'bukan bilangan positif maupun bilangan negatif' },
      {
        id: 'minusOperasi',
        teks: 'adalah nama operasi pengurangan, bukan cara baku membaca tanda bilangan negatif',
      },
      { id: 'tandaBelakang', teks: 'tanda − di belakang angka, misalnya 20−' },
      { id: 'bacaMinus', teks: '"minus dua puluh"' },
      { id: 'positif', teks: 'bilangan bulat positif' },
    ],
    rangkuman: [
      'Tentukan titik acuan (0): 0 °C, lantai dasar, permukaan laut, impas, skor awal.',
      'Di bawah titik acuan → negatif: <strong>−a</strong> dibaca "negatif a" (−15 dibaca "negatif lima belas").',
      'Di atas titik acuan → positif: <strong>a</strong> atau <strong>+a</strong> dibaca "a" atau "positif a".',
      'Tepat di titik acuan → <strong>0</strong>, dibaca "nol" (bukan positif, bukan negatif).',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP (createExerciseStage)
     Bank 12 soal; `banyak` soal diambil ACAK sesuai `komposisi`
     (lihat pilihSoalTerap di app.js). type 'input' punya mode:
       'tulis' → isian notasi, diperiksa diagnosaTulisBulat
       'baca'  → isian cara baca, diperiksa cekCaraBaca
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan konsep',
    goal: 'Menerapkan cara menulis dan membaca bilangan bulat pada situasi sehari-hari yang baru.',
    guru: 'Murid mengerjakan mandiri. Setiap murid mendapat kombinasi soal acak, jadi dorong mereka menjelaskan jawabannya kepada pasangan setelah selesai. Amati murid yang masih menulis tanda di belakang angka atau membaca "minus".',
    instruksi:
      'Kerjakan setiap soal. Pada isian notasi, ketik tanda - di depan angka untuk bilangan negatif. Pada isian cara baca, ketik dengan huruf tanpa satuan.',
    banyak: 8,
    komposisi: { tulis: 3, baca: 2, choice: 3 },
    soal: [
      {
        id: 't1',
        type: 'input',
        mode: 'tulis',
        cerita: 'Suhu di dalam freezer toko es krim adalah 18 derajat di bawah nol.',
        frasa: '18 derajat di bawah nol',
        besar: 18,
        pertanyaan: 'Tuliskan suhu itu sebagai bilangan bulat (°C).',
        jawab: -18,
        explanation:
          'Di bawah nol → negatif: −18 °C, dibaca "negatif delapan belas derajat Celsius".',
        hints: ['Di bawah nol → bilangan negatif.', 'Tanda − ditulis di depan angka 18.'],
        reveal: 'Jawaban: <strong>−18</strong> °C.',
      },
      {
        id: 't2',
        type: 'input',
        mode: 'tulis',
        cerita: 'Guru mendiktekan sebuah bilangan: "negatif seratus dua puluh".',
        pertanyaan: 'Tuliskan bilangan itu dengan angka.',
        jawab: -120,
        explanation: '"Negatif" menjadi tanda − di depan angka: −120.',
        hints: ['"Negatif" berarti tanda − di depan.', 'Seratus dua puluh ditulis 120.'],
        reveal: 'Jawaban: <strong>−120</strong>.',
      },
      {
        id: 't3',
        type: 'input',
        mode: 'tulis',
        cerita:
          'Lantai parkir paling bawah sebuah rumah sakit berada 3 lantai di bawah lantai dasar (lantai dasar = 0).',
        frasa: '3 lantai di bawah lantai dasar',
        besar: 3,
        pertanyaan: 'Tuliskan nomor lantai parkir itu sebagai bilangan bulat.',
        jawab: -3,
        explanation: '3 lantai di bawah lantai dasar ditulis −3, dibaca "negatif tiga".',
        hints: ['Di bawah lantai dasar → bilangan negatif.'],
        reveal: 'Jawaban: <strong>−3</strong>.',
      },
      {
        id: 't4',
        type: 'input',
        mode: 'tulis',
        cerita: 'Puncak Gunung Semeru berada 3.676 meter di atas permukaan laut.',
        frasa: '3.676 meter di atas permukaan laut',
        besar: 3676,
        pertanyaan: 'Tuliskan ketinggian itu sebagai bilangan bulat (meter).',
        jawab: 3676,
        explanation: 'Di atas permukaan laut → positif: 3.676 m (boleh ditulis +3.676 m).',
        hints: ['Di atas permukaan laut → bilangan positif, boleh tanpa tanda.'],
        reveal: 'Jawaban: <strong>3.676</strong> m.',
      },
      {
        id: 't5',
        type: 'input',
        mode: 'baca',
        cerita: 'Termometer di Ranu Kumbolo pada malam hari menunjukkan −5 °C.',
        pertanyaan: 'Ketik cara membaca bilangan <strong>−5</strong> (tanpa satuan).',
        jawab: -5,
        explanation: '−5 dibaca "negatif lima".',
        hints: ['Tanda − di depan bilangan dibaca dengan kata apa?'],
        reveal: 'Jawaban: "<strong>negatif lima</strong>".',
      },
      {
        id: 't6',
        type: 'input',
        mode: 'baca',
        cerita: 'Buku kas koperasi mencatat kerugian bulan Maret: −12.500 (rupiah).',
        pertanyaan: 'Ketik cara membaca bilangan <strong>−12.500</strong>.',
        jawab: -12500,
        explanation: '−12.500 dibaca "negatif dua belas ribu lima ratus".',
        hints: [
          'Titik pada 12.500 adalah pemisah ribuan: dua belas ribu lima ratus.',
          'Awali dengan kata "negatif".',
        ],
        reveal: 'Jawaban: "<strong>negatif dua belas ribu lima ratus</strong>".',
      },
      {
        id: 't7',
        type: 'input',
        mode: 'baca',
        cerita: 'Di papan skor, Tim Hijau memperoleh +40 poin.',
        pertanyaan: 'Ketik cara membaca bilangan <strong>+40</strong>.',
        jawab: 40,
        explanation: '+40 dibaca "empat puluh" atau "positif empat puluh".',
        hints: [
          'Tanda + boleh dibaca "positif" atau tidak dibaca sama sekali — tetapi bukan "plus".',
        ],
        reveal: 'Jawaban: "<strong>empat puluh</strong>" atau "positif empat puluh".',
      },
      {
        id: 't8',
        type: 'choice',
        cerita: 'Pada papan skor kuis, tim Merah memperoleh nilai −35.',
        pertanyaan: 'Bagaimana cara baku membaca nilai tim Merah?',
        options: [
          { id: 'a', label: 'negatif tiga puluh lima' },
          { id: 'b', label: 'tiga puluh lima negatif' },
          { id: 'c', label: 'minus tiga lima' },
          { id: 'd', label: 'positif tiga puluh lima' },
        ],
        correct: 'a',
        explanation:
          '−35 dibaca "negatif tiga puluh lima". Kata "minus" dipakai untuk operasi pengurangan.',
      },
      {
        id: 't9',
        type: 'choice',
        cerita:
          'Sebuah kapal selam berada 150 meter di bawah permukaan laut, sedangkan sebuah helikopter terbang 150 meter di atas permukaan laut.',
        pertanyaan: 'Pernyataan manakah yang tepat?',
        options: [
          { id: 'a', label: 'Posisi kapal selam −150 m dan helikopter 150 m.' },
          { id: 'b', label: 'Posisi kapal selam 150 m dan helikopter −150 m.' },
          { id: 'c', label: 'Keduanya ditulis 150 m karena jaraknya sama.' },
          { id: 'd', label: 'Posisi kapal selam 150− m dan helikopter +150 m.' },
        ],
        correct: 'a',
        explanation:
          'Keduanya berjarak 150 m dari permukaan laut, tetapi berlawanan arah. Tanda − di depan angka membedakan posisi di bawah permukaan laut.',
      },
      {
        id: 't10',
        type: 'choice',
        cerita: 'Keadaan manakah yang dinyatakan dengan bilangan 0?',
        pertanyaan: 'Pilih satu keadaan yang tepat.',
        options: [
          { id: 'a', label: 'Warung tidak untung dan tidak rugi (impas).' },
          { id: 'b', label: 'Suhu turun 1 derajat di bawah nol.' },
          { id: 'c', label: 'Lift naik satu lantai dari lantai dasar.' },
          { id: 'd', label: 'Rudi kehilangan 10 poin.' },
        ],
        correct: 'a',
        explanation: 'Impas adalah titik acuan keuangan, jadi dinyatakan dengan 0.',
      },
      {
        id: 't11',
        type: 'choice',
        cerita: 'Rina menulis di buku catatannya: "suhu malam ini min 7 derajat".',
        pertanyaan: 'Bagaimana notasi baku suhu itu?',
        options: [
          { id: 'a', label: '−7 °C' },
          { id: 'b', label: '7− °C' },
          { id: 'c', label: '(7) °C' },
          { id: 'd', label: '7 °C' },
        ],
        correct: 'a',
        explanation: 'Suhu di bawah nol ditulis −7 °C dan dibaca "negatif tujuh derajat Celsius".',
      },
      {
        id: 't12',
        type: 'choice',
        cerita: 'Permukaan Laut Mati berada 430 meter di bawah permukaan laut lepas.',
        pertanyaan: 'Pasangan tulisan dan cara baca manakah yang tepat?',
        options: [
          { id: 'a', label: '−430 m, dibaca "negatif empat ratus tiga puluh meter"' },
          { id: 'b', label: '−430 m, dibaca "minus empat ratus tiga puluh meter"' },
          { id: 'c', label: '430 m, dibaca "empat ratus tiga puluh meter"' },
          { id: 'd', label: '430− m, dibaca "empat tiga nol negatif meter"' },
        ],
        correct: 'a',
        explanation:
          'Di bawah permukaan laut → negatif: −430 m, dibaca "negatif empat ratus tiga puluh meter".',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses menemukan cara menulis dan membaca bilangan bulat dalam kehidupan sehari-hari.',
    guru: 'Beri waktu hening 3 menit untuk menulis. Jawaban penilaian diri bisa menjadi dasar pengelompokan pada pertemuan berikutnya (membandingkan & mengurutkan bilangan bulat).',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Tuliskan satu contoh bilangan bulat negatif yang pernah kamu temui di rumah atau di sekitarmu. Bagaimana menulis dan membacanya?',
        placeholder: 'Contohnya … ditulis … dan dibaca …',
      },
      {
        id: 'r2',
        teks: 'Mengapa semua orang perlu memakai cara baku yang sama untuk menulis dan membaca bilangan negatif?',
        placeholder: 'Kita perlu cara baku karena …',
      },
      {
        id: 'r3',
        teks: 'Bagian mana yang masih membingungkan atau ingin kamu pelajari lebih lanjut?',
        placeholder: 'Aku masih bingung tentang …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu membaca dan menuliskan bilangan bulat sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'cukup', label: '🙂 Cukup yakin — sesekali masih perlu berpikir' },
      { id: 'ragu', label: '🤔 Masih ragu — perlu latihan lagi' },
      { id: 'belum', label: '🙋 Belum paham — aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, kamu menemukannya sendiri!',
    teks: 'Kamu telah menemukan cara baku menuliskan dan membaca bilangan bulat positif, negatif, dan nol dalam kehidupan sehari-hari.',
    contoh: [
      { tema: 'suhu', teks: '−3 °C', baca: 'negatif tiga derajat Celsius' },
      { tema: 'gedung', teks: '0', baca: 'nol (lantai dasar)' },
      { tema: 'laut', teks: '3.676 m', baca: 'tiga ribu enam ratus tujuh puluh enam meter' },
    ],
    capaian: [
      'Menentukan titik acuan (0) dan kata kunci arah pada situasi sehari-hari.',
      'Menuliskan keadaan di bawah titik acuan dengan tanda negatif di depan angka (mis. −20.000 untuk rugi Rp20.000).',
      'Membaca bilangan negatif dengan kata "negatif" — bukan "minus" — dan bilangan positif dengan atau tanpa kata "positif".',
      'Mengenali 0 sebagai titik acuan yang bukan positif dan bukan negatif.',
    ],
  },
};
