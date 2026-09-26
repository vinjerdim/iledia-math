'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Sifat Operasi Bilangan Berpangkat
   Fase E (Kelas X) — SMK Rekayasa Perangkat Lunak

   Tujuan Pembelajaran:
   Menggeneralisasi sifat perkalian dan pembagian bilangan berpangkat
   bulat positif serta sifat perpangkatan dari perpangkatan melalui
   eksplorasi pola numerik.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'koleksi'
     Sintaks 4 — Data processing ............ tahap 'olah'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 45 menit, murid berpasangan):
     1. Stimulasi     (7')  — "Folder server Raka": 2³ KB per blok,
                              2⁴ blok per folder. Tabel pangkat 2
                              ditampilkan; murid MENDUGA 2³ × 2⁴ sebagai
                              satu bilangan berpangkat (tidak dinilai).
     2. Masalah       (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data          (20') — A: melengkapi tabel pangkat basis 2 dan 3
                              (kamus nilai); B: tiga tabel eksplorasi
                              pola — perkalian, pembagian, pangkat dari
                              pangkat — hitung nilai, baca sebagai aᵏ
                              (diagnosa eksponen keliru); C: pilah
                              pernyataan dari data.
     4. Olah data     (15') — kolom m, n, k disorot; pertanyaan penuntun
                              menemukan hubungan k dengan m dan n; pola
                              diuji pada basis baru (10 dan 5).
     5. Pembuktian    (15') — lab uji sifat (eksponen bulat positif)
                              + mencari contoh penyangkal tiga dugaan
                              teman; ubin faktor menjelaskan MENGAPA
                              polanya berlaku; membuktikan dugaan awal;
                              memilah miskonsepsi.
     6. Simpulan      (7')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap     (15') — delapan soal (isian & pilihan ganda) dalam
                              konteks RPL (KB/MB/GB, PIN heksadesimal,
                              file log).
     8. Refleksi      (5')  — refleksi tertulis & penilaian diri.

   Metadata `cek` pada setiap langkah isian/soal dipakai tes untuk
   memeriksa kunci jawaban secara numerik (bebas dari rumus sifat):
     { jenis: 'nilai',  a, n }             jawab = aⁿ
     { jenis: 'setara', a, kali, bagi, luar }
          a^jawab = (Π a^kali ÷ Π a^bagi)^luar; unsur kali/bagi berupa
          n (aⁿ) atau [m, n] ((aᵐ)ⁿ)
   Seluruh eksponen bulat positif; pembagian selalu m > n.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan, sehingga tiap murid
   (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  kasus: {
    nama: 'Raka',
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Pembuktian.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati tabel pangkat 2 lalu menduga hasil 2³ × 2⁴ sebagai satu bilangan berpangkat.',
    tp: 'Menggeneralisasi sifat perkalian dan pembagian bilangan berpangkat bulat positif serta sifat perpangkatan dari perpangkatan melalui eksplorasi pola numerik.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Mengumpulkan data hasil perkalian, pembagian, dan perpangkatan bilangan berpangkat.',
      'Menemukan hubungan eksponen hasil dengan eksponen awal dari pola numerik.',
      'Menguji pola pada basis lain dan menyangkal dugaan keliru dengan contoh penyangkal.',
      'Menerapkan sifat-sifat bilangan berpangkat pada soal dan konteks RPL.',
    ],
    guru: 'Tayangkan tabel pangkat 2. Tanyakan: "Bisakah kita menulis 2³ × 2⁴ sebagai satu bilangan berpangkat 2 tanpa kalkulator?" Tampung semua dugaan (termasuk 2¹² dan 4⁷) tanpa dikoreksi — murid akan mengujinya sendiri.',
    judul: 'Folder di Server Raka',
    cerita:
      'Raka, siswa RPL yang magang di tim server, menyimpan data dalam blok berukuran 2³ KB. Satu folder berisi 2⁴ blok, jadi ukuran satu folder adalah 2³ × 2⁴ KB. Temannya menghitung 8 × 16 dengan kalkulator, tetapi Raka yakin ada jalan pintas: hasilnya bisa langsung ditulis sebagai satu bilangan berpangkat 2.',
    aturan:
      'Ukuran memori komputer selalu berupa bilangan berpangkat 2. Tabel di samping adalah "kamus" nilainya.',
    tabel: { a: 2, dari: 1, sampai: 10, diketahui: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    sorot: [3, 4],
    soalDugaan: { operasi: 'kali', a: 2, m: 3, n: 4 },
    pertanyaan: 'Dugaanmu: 2³ × 2⁴ sama dengan …',
    opsi: [
      { id: 'o1', label: '2⁷' },
      { id: 'o2', label: '2¹²' },
      { id: 'o3', label: '4⁷' },
      { id: 'o4', label: '4¹²' },
    ],
    alasanLabel: 'Bagaimana kamu mendapatkan dugaan itu?',
    alasanPlaceholder: 'Contoh: aku melihat eksponen 3 dan 4, lalu …',
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
    goal: 'Merumuskan pertanyaan inti tentang pola eksponen pada perkalian, pembagian, dan perpangkatan.',
    guru: 'Arahkan murid agar pertanyaannya bersifat umum: berlaku untuk basis dan eksponen apa pun, bukan hanya untuk 2³ × 2⁴. Tulis beberapa hipotesis murid di papan untuk diuji nanti.',
    pengantar:
      'Raka tidak hanya mengalikan. Ia juga membagi ukuran file (mis. 2¹⁰ : 2³) dan memangkatkan ukuran (mis. (2²)³). Menghitung nilainya satu per satu lama dan rawan salah. Raka butuh aturan umum.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'pola',
        label:
          'Bagaimana eksponen hasil diperoleh dari eksponen-eksponen awal saat bilangan berpangkat berbasis sama dikalikan, dibagi, atau dipangkatkan?',
      },
      { id: 'hitung', label: 'Berapa hasil 8 × 16?' },
      { id: 'kalku', label: 'Tombol kalkulator mana yang dipakai untuk menghitung pangkat?' },
      { id: 'satuan', label: 'Berapa byte dalam 1 KB?' },
    ],
    correct: 'pola',
    umpan: {
      pola: '<strong>Tepat.</strong> Kita akan mengumpulkan banyak contoh, mencari <em>pola</em> eksponennya, lalu menuliskannya sebagai aturan umum.',
      hitung:
        '8 × 16 = 128 hanya menjawab satu soal. Pertanyaan ini tidak membantu menemukan aturan untuk soal lain. Coba pilih lagi.',
      kalku:
        'Kalkulator memang bisa menghitung, tetapi tidak menjelaskan <em>pola</em> eksponennya. Coba pilih lagi.',
      satuan:
        '1 KB = 2¹⁰ byte adalah fakta yang dihafal, bukan pertanyaan tentang pola operasi. Coba pilih lagi.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu apa yang terjadi pada eksponen saat dua bilangan berpangkat dikalikan?',
    hipotesisPlaceholder: 'Contoh: mungkin eksponennya …',
    nextLabel: 'Mulai Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA
     A: tabel pangkat. B: tabel pola (kali, bagi, pangkat).
     C: pilah pernyataan.
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengumpulkan data numerik hasil perkalian, pembagian, dan perpangkatan bilangan berpangkat.',
    guru: 'Pastikan murid benar-benar menghitung nilai lalu mencarinya di tabel pangkat — bukan menebak eksponen. Jika murid menulis k = m × n pada perkalian, minta ia mencari nilai 2ᵏ tersebut di tabel dan membandingkannya dengan hasil hitungnya.',
    judulA: 'A. Tabel pangkat (kamus nilai)',
    instruksiA:
      'Lengkapi kedua tabel. Setiap naik satu eksponen, nilainya dikali basis. Tabel ini akan kamu pakai untuk membaca hasil sebagai bilangan berpangkat.',
    tabelPangkat: [
      { id: 'tp2', a: 2, dari: 1, sampai: 12, diketahui: [1, 2, 3] },
      { id: 'tp3', a: 3, dari: 1, sampai: 6, diketahui: [1, 2] },
    ],
    hintsTabel: [
      '2³ = 8, jadi 2⁴ = 8 × 2 = 16. Teruskan: kalikan 2 setiap naik satu eksponen.',
      '2¹⁰ = 1.024 dan 2¹² = 4.096. Untuk basis 3: 3³ = 27, 3⁴ = 81, 3⁵ = 243, 3⁶ = 729.',
    ],
    judulB: 'B. Eksplorasi pola',
    instruksiB:
      'Untuk setiap baris: hitung nilainya dengan bantuan tabel pangkat, lalu cari nilai itu di tabel dan tulis eksponennya (k). Tabel berikutnya terbuka setelah tabel ini benar semua.',
    pola: [
      {
        id: 'pk',
        operasi: 'kali',
        judul: 'B1. Perkalian bilangan berpangkat',
        instruksi: 'Contoh: 2² × 2³ = 4 × 8 = 32, dan 32 = 2⁵, jadi k = 5.',
        baris: [
          { a: 2, m: 2, n: 3 },
          { a: 2, m: 3, n: 4 },
          { a: 2, m: 1, n: 5 },
          { a: 2, m: 4, n: 4 },
          { a: 3, m: 2, n: 3 },
        ],
        hints: [
          'Baca nilai kedua faktor dari tabel pangkat, lalu kalikan.',
          'Cari hasil kalinya di tabel pangkat dengan basis yang sama. Eksponen di atas nilai itu adalah k.',
        ],
        temuan:
          'Datamu lengkap: 2² × 2³ = 2⁵, 2³ × 2⁴ = 2⁷, 2¹ × 2⁵ = 2⁶, 2⁴ × 2⁴ = 2⁸, 3² × 3³ = 3⁵.',
      },
      {
        id: 'pb',
        operasi: 'bagi',
        judul: 'B2. Pembagian bilangan berpangkat',
        instruksi: 'Contoh: 2⁶ : 2² = 64 : 4 = 16, dan 16 = 2⁴, jadi k = 4.',
        baris: [
          { a: 2, m: 6, n: 2 },
          { a: 2, m: 8, n: 3 },
          { a: 2, m: 5, n: 1 },
          { a: 2, m: 10, n: 4 },
          { a: 3, m: 5, n: 2 },
        ],
        hints: [
          'Baca nilai pembilang dan penyebut dari tabel pangkat, lalu bagi.',
          'Mis. 2⁸ : 2³ = 256 : 8 = 32. Cari 32 di tabel pangkat 2.',
        ],
        temuan:
          'Datamu lengkap: 2⁶ : 2² = 2⁴, 2⁸ : 2³ = 2⁵, 2⁵ : 2¹ = 2⁴, 2¹⁰ : 2⁴ = 2⁶, 3⁵ : 3² = 3³.',
      },
      {
        id: 'pp',
        operasi: 'pangkat',
        judul: 'B3. Pangkat dari bilangan berpangkat',
        instruksi: 'Contoh: (2²)³ = 4³ = 4 × 4 × 4 = 64, dan 64 = 2⁶, jadi k = 6.',
        baris: [
          { a: 2, m: 2, n: 3 },
          { a: 2, m: 3, n: 2 },
          { a: 2, m: 2, n: 4 },
          { a: 2, m: 3, n: 3 },
          { a: 3, m: 2, n: 3 },
        ],
        hints: [
          '(2³)² artinya 2³ × 2³ = 8 × 8. Hitung isi kurung dulu, lalu kalikan dengan dirinya sendiri sebanyak eksponen luar.',
          'Mis. (2³)³ = 8 × 8 × 8 = 512. Cari 512 di tabel pangkat 2.',
        ],
        temuan:
          'Datamu lengkap: (2²)³ = 2⁶, (2³)² = 2⁶, (2²)⁴ = 2⁸, (2³)³ = 2⁹, (3²)³ = 3⁶. Perhatikan: (2²)³ dan (2³)² sama-sama 2⁶!',
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
        teks: 'Hasil perkalian dua bilangan berpangkat 2 selalu dapat ditulis sebagai satu bilangan berpangkat 2.',
        correct: 'benar',
        explanation: 'Semua hasil di tabel B1 (32, 128, 64, 256) ada di tabel pangkat 2.',
      },
      {
        id: 'p2',
        teks: '2³ × 2⁴ = 2¹², karena 3 × 4 = 12.',
        correct: 'salah',
        explanation: 'Tabelmu menunjukkan 2³ × 2⁴ = 8 × 16 = 128 = 2⁷, sedangkan 2¹² = 4.096.',
      },
      {
        id: 'p3',
        teks: '2⁸ : 2³ = 32 = 2⁵.',
        correct: 'benar',
        explanation: '256 : 8 = 32, dan di tabel pangkat 2, 32 = 2⁵.',
      },
      {
        id: 'p4',
        teks: '(2²)³ dan (2³)² bernilai sama.',
        correct: 'benar',
        explanation: '(2²)³ = 4³ = 64 dan (2³)² = 8² = 64. Keduanya 2⁶.',
      },
      {
        id: 'p5',
        teks: '2⁸ : 2⁴ = 2², karena eksponennya dibagi (8 : 4 = 2).',
        correct: 'salah',
        explanation: '256 : 16 = 16 = 2⁴. Eksponen hasilnya 4, bukan hasil bagi 8 : 4.',
      },
    ],
    nextLabel: 'Olah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — OLAH DATA
     Kolom m, n, k → hubungan eksponen; uji pada basis baru.
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 4 · Olah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan hubungan eksponen hasil (k) dengan eksponen awal (m dan n) pada setiap operasi.',
    guru: 'Minta setiap pasangan menjelaskan pola pada kolom m, n, k dengan kalimat sendiri sebelum memilih rumus. Tekankan bahwa semua data memakai basis yang sama dalam satu bentuk.',
    instruksi:
      'Data tabelmu kini dilengkapi kolom m, n, dan k. Amati hubungan k dengan m dan n pada setiap tabel, lalu jawab pertanyaan penuntun.',
    pertanyaan: [
      {
        id: 'kali',
        tanya: 'Tabel perkalian aᵐ × aⁿ = aᵏ: bagaimana k diperoleh dari m dan n?',
        opsi: [
          { id: 'benar', label: 'k = m + n' },
          { id: 'kaliE', label: 'k = m × n' },
          { id: 'kurang', label: 'k = m − n' },
          { id: 'pangkatE', label: 'k = mⁿ' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> 2 + 3 = 5, 3 + 4 = 7, 1 + 5 = 6, 4 + 4 = 8. Eksponennya <strong>dijumlahkan</strong>: aᵐ × aⁿ = aᵐ⁺ⁿ.',
          kaliE:
            'Cek baris 2³ × 2⁴: k = 7, sedangkan 3 × 4 = 12. (Baris 2⁴ × 2⁴ kebetulan cocok karena 4 + 4 = 4 × 2.) Coba lagi.',
          kurang: 'Cek baris 2² × 2³: k = 5, sedangkan 2 − 3 bukan 5. Coba lagi.',
          pangkatE: 'Cek baris 2² × 2³: k = 5, sedangkan 2³ = 8. Coba lagi.',
        },
      },
      {
        id: 'bagi',
        tanya: 'Tabel pembagian aᵐ : aⁿ = aᵏ (m > n): bagaimana k diperoleh dari m dan n?',
        opsi: [
          { id: 'benar', label: 'k = m − n' },
          { id: 'bagiE', label: 'k = m : n' },
          { id: 'tambah', label: 'k = m + n' },
          { id: 'balik', label: 'k = n − m' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> 6 − 2 = 4, 8 − 3 = 5, 5 − 1 = 4, 10 − 4 = 6. Eksponennya <strong>dikurangkan</strong>: aᵐ : aⁿ = aᵐ⁻ⁿ.',
          bagiE: 'Cek baris 2⁸ : 2³: k = 5, sedangkan 8 : 3 bukan bilangan bulat. Coba lagi.',
          tambah:
            'Pembagian membuat nilainya mengecil, jadi eksponennya tidak mungkin bertambah. Coba lagi.',
          balik:
            'Cek baris 2⁶ : 2²: k = 4, sedangkan 2 − 6 bukan 4. Urutannya terbalik. Coba lagi.',
        },
      },
      {
        id: 'pangkat',
        tanya: 'Tabel pangkat dari pangkat (aᵐ)ⁿ = aᵏ: bagaimana k diperoleh dari m dan n?',
        opsi: [
          { id: 'benar', label: 'k = m × n' },
          { id: 'tambah', label: 'k = m + n' },
          { id: 'susun', label: 'k = mⁿ' },
          { id: 'kurang', label: 'k = m − n' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> 2 × 3 = 6, 3 × 2 = 6, 2 × 4 = 8, 3 × 3 = 9. Eksponennya <strong>dikalikan</strong>: (aᵐ)ⁿ = aᵐˣⁿ.',
          tambah: 'Cek baris (2²)³: k = 6, sedangkan 2 + 3 = 5. Coba lagi.',
          susun: 'Cek baris (2³)²: k = 6, sedangkan 3² = 9. Coba lagi.',
          kurang: 'Cek baris (2²)⁴: k = 8, sedangkan 2 − 4 bukan 8. Coba lagi.',
        },
      },
    ],
    judulLangkah: 'Apakah polanya berlaku untuk basis lain?',
    instruksiLangkah:
      'Uji polamu pada basis yang belum ada di tabel. Hitung nilainya bila perlu, lalu tentukan k.',
    langkah: [
      {
        label: '10² × 10³ = 100 × 1.000 = 100.000 = 10ᵏ. Nilai k = …',
        jawab: 5,
        hints: ['Hitung banyak angka nol pada 100.000.', 'Bandingkan dengan 2 + 3.'],
        temuan: '10² × 10³ = 10⁵, dan 2 + 3 = 5. Pola perkalian tetap berlaku.',
        cek: { jenis: 'setara', a: 10, kali: [2, 3] },
      },
      {
        label: '5⁷ : 5⁴ = 5ᵏ. Nilai k = …',
        jawab: 3,
        hints: ['Gunakan pola pembagian yang kamu temukan.', 'Periksa: 78.125 : 625 = 125 = 5³.'],
        temuan: '5⁷ : 5⁴ = 5³ = 125, dan 7 − 4 = 3. Pola pembagian tetap berlaku.',
        cek: { jenis: 'setara', a: 5, kali: [7], bagi: [4] },
      },
      {
        label: '(10²)³ = 100³ = 1.000.000 = 10ᵏ. Nilai k = …',
        jawab: 6,
        hints: ['Hitung banyak angka nol pada 1.000.000.', 'Bandingkan dengan 2 × 3.'],
        temuan: '(10²)³ = 10⁶, dan 2 × 3 = 6. Pola pangkat dari pangkat tetap berlaku.',
        cek: { jenis: 'setara', a: 10, kali: [[2, 3]] },
      },
    ],
    rumus: [
      { label: 'Perkalian', teks: 'aᵐ × aⁿ = aᵐ⁺ⁿ' },
      { label: 'Pembagian (a ≠ 0, m > n)', teks: 'aᵐ : aⁿ = aᵐ⁻ⁿ' },
      { label: 'Pangkat dari pangkat', teks: '(aᵐ)ⁿ = aᵐˣⁿ' },
    ],
    nextLabel: 'Buktikan Polanya →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN (VERIFIKASI)
     A: lab uji sifat. B: mengapa? (ubin faktor).
     C: buktikan dugaan awal. D: pilah miskonsepsi.
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji pola pada banyak contoh, menyangkal dugaan keliru, dan menjelaskan mengapa polanya berlaku.',
    guru: 'Minta setiap pasangan mencari satu contoh penyangkal untuk tiap dugaan teman, lalu membandingkannya. Tekankan: satu contoh penyangkal cukup untuk menggugurkan dugaan, tetapi banyak contoh cocok belum membuktikan — karena itu kita melihat ubin faktor untuk tahu MENGAPA polanya selalu berlaku.',
    judulA: 'A. Lab uji sifat',
    instruksiA:
      'Pilih sifat, atur a, m, dan n (eksponen bulat positif), lalu catat hasilnya. Selesaikan daftar periksa: uji tiap sifat dua kali dan cari contoh penyangkal untuk dugaan ketiga temanmu.',
    lab: {
      sifat: ['kali', 'bagi', 'pangkat', 'salahKali', 'salahBagi', 'salahPangkat'],
      nama: {
        salahKali: 'Dugaan Beni',
        salahBagi: 'Dugaan Citra',
        salahPangkat: 'Dugaan Dodi',
      },
      syarat: [
        { sifat: 'kali', min: 2 },
        { sifat: 'bagi', min: 2 },
        { sifat: 'pangkat', min: 2 },
        { sifat: 'salahKali', min: 1, sangkal: true },
        { sifat: 'salahBagi', min: 1, sangkal: true },
        { sifat: 'salahPangkat', min: 1, sangkal: true },
      ],
      positif: true,
      batasA: [1, 10],
      batasE: [1, 4],
    },
    judulB: 'B. Mengapa polanya selalu berlaku?',
    instruksiB:
      'Setiap ubin adalah satu faktor. Hitung banyak faktor untuk melihat asal-usul penjumlahan, pengurangan, dan perkalian eksponen.',
    ubin: [
      {
        visual: { jenis: 'kali', a: 2, m: 3, n: 4 },
        label: '2³ × 2⁴ = (2 × 2 × 2) × (2 × 2 × 2 × 2). Banyak faktor 2 seluruhnya = …',
        jawab: 7,
        hints: ['Hitung ubin di kedua kelompok bersama-sama.'],
        temuan:
          '3 faktor digabung dengan 4 faktor = 7 faktor. Itulah sebabnya eksponen <strong>dijumlahkan</strong>.',
        cek: { jenis: 'setara', a: 2, kali: [1, 1, 1, 1, 1, 1, 1] },
      },
      {
        visual: { jenis: 'bagi', a: 2, m: 6, n: 2, coret: true },
        label:
          '2⁶ : 2² ditulis sebagai pecahan. Setiap pasangan 2/2 = 1 dicoret. Sisa faktor 2 = …',
        jawab: 4,
        hints: ['Ada 6 faktor di atas; 2 di antaranya dicoret bersama 2 faktor di bawah.'],
        temuan:
          '6 faktor dikurangi 2 faktor yang dicoret = 4 faktor. Itulah sebabnya eksponen <strong>dikurangkan</strong>.',
        cek: { jenis: 'setara', a: 2, kali: [1, 1, 1, 1] },
      },
      {
        visual: { jenis: 'pangkat', a: 2, m: 3, n: 2 },
        label: '(2³)² = 2³ × 2³. Banyak faktor 2 seluruhnya = …',
        jawab: 6,
        hints: ['Ada 2 kelompok, masing-masing berisi 3 faktor.'],
        temuan:
          '2 kelompok × 3 faktor = 6 faktor. Itulah sebabnya eksponen <strong>dikalikan</strong>.',
        cek: { jenis: 'setara', a: 2, kali: [1, 1, 1, 1, 1, 1] },
      },
    ],
    judulC: 'C. Buktikan dugaan awalmu',
    uji: [
      {
        label: 'Ukuran folder Raka: 2³ × 2⁴ = 2ᵏ KB. Nilai k = …',
        jawab: 7,
        hints: ['Gunakan aᵐ × aⁿ = aᵐ⁺ⁿ.'],
        bukti: '2³ × 2⁴ = 2³⁺⁴ = 2⁷ = 128 KB — sama dengan 8 × 16 = 128. ✓',
        cek: { jenis: 'setara', a: 2, kali: [3, 4] },
      },
    ],
    dugaanBenar: 'o1',
    judulD: 'D. Awas miskonsepsi!',
    instruksiD: 'Pilah setiap pernyataan: benar atau salah?',
    opsiPilah: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pilah: [
      {
        id: 'v1',
        teks: '2³ × 3² = 6⁵',
        correct: 'salah',
        explanation:
          'Basisnya berbeda, jadi sifat perkalian tidak berlaku. 2³ × 3² = 8 × 9 = 72, sedangkan 6⁵ = 7.776.',
      },
      {
        id: 'v2',
        teks: '2³ + 2⁴ = 2⁷',
        correct: 'salah',
        explanation:
          'Sifatnya untuk perkalian, bukan penjumlahan. 2³ + 2⁴ = 8 + 16 = 24, sedangkan 2⁷ = 128.',
      },
      {
        id: 'v3',
        teks: '(2³)² = 2⁹',
        correct: 'salah',
        explanation: '(2³)² = 8² = 64 = 2⁶. Eksponennya dikalikan (3 × 2), bukan 3².',
      },
      {
        id: 'v4',
        teks: '5⁸ : 5² = 5⁶',
        correct: 'benar',
        explanation: 'Basis sama dan 8 > 2, jadi eksponen dikurangkan: 8 − 2 = 6.',
      },
      {
        id: 'v5',
        teks: '10⁴ × 10³ = 10⁷',
        correct: 'benar',
        explanation: '10.000 × 1.000 = 10.000.000 = 10⁷, dan 4 + 3 = 7.',
      },
      {
        id: 'v6',
        teks: '3⁶ : 3² = 3³',
        correct: 'salah',
        explanation: '3⁶ : 3² = 729 : 9 = 81 = 3⁴. Eksponennya dikurangkan (6 − 2), bukan dibagi.',
      },
    ],
    nextLabel: 'Tarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN (GENERALISASI)
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Menyusun kesimpulan umum tentang sifat perkalian, pembagian, dan pangkat dari pangkat bilangan berpangkat bulat positif.',
    guru: 'Setelah kalimat lengkap, minta beberapa murid menjelaskan dengan kata-kata sendiri mengapa eksponen dijumlahkan (bukan dikalikan) pada perkalian, dengan merujuk pada data tabel atau ubin faktor.',
    instruksi:
      'Lengkapi setiap awal kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan dipakai paling banyak satu kali, dan ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'Mengalikan dua bilangan berpangkat dengan basis sama', correct: 'b1' },
      {
        id: 'k2',
        awal: 'Membagi dua bilangan berpangkat dengan basis sama (a ≠ 0, m > n)',
        correct: 'b2',
      },
      { id: 'k3', awal: 'Memangkatkan bilangan berpangkat', correct: 'b3' },
      { id: 'k4', awal: 'Ketiga sifat tersebut hanya berlaku bila', correct: 'b4' },
    ],
    bank: [
      { id: 'b1', teks: 'eksponennya dijumlahkan: aᵐ × aⁿ = aᵐ⁺ⁿ.' },
      { id: 'b2', teks: 'eksponennya dikurangkan: aᵐ : aⁿ = aᵐ⁻ⁿ.' },
      { id: 'b3', teks: 'eksponennya dikalikan: (aᵐ)ⁿ = aᵐˣⁿ.' },
      { id: 'b4', teks: 'basis bilangan-bilangan berpangkatnya sama.' },
      { id: 'x1', teks: 'eksponennya dikalikan: aᵐ × aⁿ = aᵐˣⁿ.' },
      { id: 'x2', teks: 'eksponennya dibagi: aᵐ : aⁿ = a^(m : n).' },
      { id: 'x3', teks: 'eksponennya dijumlahkan: (aᵐ)ⁿ = aᵐ⁺ⁿ.' },
      { id: 'x4', teks: 'eksponen bilangan-bilangan berpangkatnya sama.' },
    ],
    rangkuman: [
      'aᵐ × aⁿ = aᵐ⁺ⁿ — faktor-faktor digabung, jadi eksponen dijumlahkan.',
      'aᵐ : aⁿ = aᵐ⁻ⁿ untuk a ≠ 0 dan m > n — pasangan faktor dicoret, jadi eksponen dikurangkan.',
      '(aᵐ)ⁿ = aᵐˣⁿ — ada n kelompok berisi m faktor, jadi eksponen dikalikan.',
      'Sifat-sifat ini hanya berlaku untuk basis yang sama dan untuk operasi kali, bagi, serta pangkat — bukan untuk penjumlahan.',
    ],
    nextLabel: 'Terapkan Sifatnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Campuran isian ('input') dan pilihan ganda ('choice').
     Opsi pilihan ganda memuat `nilai` (eksponen basis cek.a) agar tes
     dapat memastikan hanya satu opsi yang cocok dengan `cek`.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menggunakan sifat perkalian, pembagian, dan pangkat dari pangkat untuk menyederhanakan bentuk dan menyelesaikan masalah.',
    guru: 'Dorong murid menuliskan sifat yang dipakai di setiap langkah. Diskusikan soal yang paling banyak salah di akhir sesi.',
    instruksi: 'Selesaikan setiap soal. Tuliskan sifat yang kamu pakai.',
    soal: [
      {
        type: 'input',
        cerita: 'Dalam komputer, 1 KB = 2¹⁰ byte dan 1 MB = 2¹⁰ KB.',
        pertanyaan: '1 MB = 2¹⁰ × 2¹⁰ byte = 2ᵏ byte. Berapa <strong>k</strong>?',
        jawab: 20,
        cek: { jenis: 'setara', a: 2, kali: [10, 10] },
        hints: ['Basisnya sama, jadi gunakan aᵐ × aⁿ = aᵐ⁺ⁿ.'],
        reveal: '2¹⁰ × 2¹⁰ = 2¹⁰⁺¹⁰ = 2²⁰, jadi <strong>k = 20</strong> (1.048.576 byte).',
      },
      {
        type: 'choice',
        cerita:
          'Sebuah flashdisk berkapasitas 2³⁰ byte (1 GB). Satu file video berukuran 2²⁰ byte (1 MB).',
        pertanyaan: 'Berapa banyak file video yang muat? 2³⁰ : 2²⁰ = …',
        options: [
          { id: 'a', label: '2¹⁰', nilai: 10 },
          { id: 'b', label: '2⁵⁰', nilai: 50 },
          { id: 'c', label: '2⁶⁰⁰', nilai: 600 },
          { id: 'd', label: '1¹⁰', nilai: 0 },
        ],
        correct: 'a',
        cek: { jenis: 'setara', a: 2, kali: [30], bagi: [20] },
        hints: ['Gunakan aᵐ : aⁿ = aᵐ⁻ⁿ.'],
        explanation:
          '2³⁰ : 2²⁰ = 2³⁰⁻²⁰ = 2¹⁰ = 1.024 file. (2⁵⁰ dari 30 + 20, 2⁶⁰⁰ dari 30 × 20, 1¹⁰ dari ikut membagi basisnya 2 : 2 — basis tetap 2.)',
      },
      {
        type: 'input',
        cerita:
          'Sebuah PIN terdiri atas 4 digit heksadesimal. Setiap digit punya 16 = 2⁴ kemungkinan, sehingga banyak PIN yang mungkin adalah 16⁴ = (2⁴)⁴.',
        pertanyaan: '(2⁴)⁴ = 2ᵏ. Berapa <strong>k</strong>?',
        jawab: 16,
        cek: { jenis: 'setara', a: 2, kali: [[4, 4]] },
        hints: ['Gunakan (aᵐ)ⁿ = aᵐˣⁿ.'],
        reveal: '(2⁴)⁴ = 2⁴ˣ⁴ = 2¹⁶, jadi <strong>k = 16</strong> (65.536 PIN).',
      },
      {
        type: 'choice',
        cerita: 'Sederhanakan bentuk aljabar berikut (x ≠ 0).',
        pertanyaan: 'x⁵ × x³ : x² = …',
        options: [
          { id: 'a', label: 'x⁶', nilai: 6 },
          { id: 'b', label: 'x¹⁰', nilai: 10 },
          { id: 'c', label: 'x¹³', nilai: 13 },
          { id: 'd', label: 'x¹⁷', nilai: 17 },
        ],
        correct: 'a',
        cek: { jenis: 'setara', a: 2, kali: [5, 3], bagi: [2] },
        hints: ['Kerjakan dari kiri: x⁵ × x³ = x⁵⁺³.', 'Lalu x⁸ : x² = x⁸⁻².'],
        explanation:
          'x⁵ × x³ = x⁸, lalu x⁸ : x² = x⁶. (x¹⁰ dari 5 + 3 + 2, x¹³ dari 5 × 3 − 2, x¹⁷ dari 5 × 3 + 2.)',
      },
      {
        type: 'input',
        cerita:
          'Sebuah file log server berukuran 2⁵ KB. Setiap hari ukurannya menjadi dua kali lipat. Setelah 7 hari ukurannya 2⁵ × 2⁷ KB.',
        pertanyaan: '2⁵ × 2⁷ = 2ᵏ KB. Berapa <strong>k</strong>?',
        jawab: 12,
        cek: { jenis: 'setara', a: 2, kali: [5, 7] },
        hints: ['Menjadi dua kali lipat selama 7 hari berarti dikali 2 sebanyak 7 kali, yaitu 2⁷.'],
        reveal: '2⁵ × 2⁷ = 2¹², jadi <strong>k = 12</strong> (4.096 KB).',
      },
      {
        type: 'choice',
        cerita: 'Tentukan bentuk paling sederhana.',
        pertanyaan: '(3²)⁴ = …',
        options: [
          { id: 'a', label: '3⁸', nilai: 8 },
          { id: 'b', label: '3⁶', nilai: 6 },
          { id: 'c', label: '3¹⁶', nilai: 16 },
          { id: 'd', label: '3²', nilai: 2 },
        ],
        correct: 'a',
        cek: { jenis: 'setara', a: 3, kali: [[2, 4]] },
        hints: ['Gunakan (aᵐ)ⁿ = aᵐˣⁿ.'],
        explanation: '(3²)⁴ = 3²ˣ⁴ = 3⁸. (3⁶ dari 2 + 4, 3¹⁶ dari 2⁴, 3² dari 4 − 2.)',
      },
      {
        type: 'input',
        cerita: 'Sifat pembagian membuat perhitungan besar menjadi ringan.',
        pertanyaan: 'Hitung nilai 5⁶ : 5⁴ = …',
        jawab: 25,
        cek: { jenis: 'nilai', a: 5, n: 2 },
        hints: ['5⁶ : 5⁴ = 5⁶⁻⁴.', '5² = 5 × 5.'],
        reveal: '5⁶ : 5⁴ = 5² = <strong>25</strong> — tanpa perlu menghitung 15.625 : 625.',
      },
      {
        type: 'input',
        cerita: 'Gabungkan beberapa sifat sekaligus.',
        pertanyaan: '(2³ × 2²)² = 2ᵏ. Berapa <strong>k</strong>?',
        jawab: 10,
        cek: { jenis: 'setara', a: 2, kali: [3, 2], luar: 2 },
        hints: ['Di dalam kurung: 2³ × 2² = 2³⁺².', 'Lalu (2⁵)² = 2⁵ˣ².'],
        reveal: '2³ × 2² = 2⁵, lalu (2⁵)² = 2¹⁰, jadi <strong>k = 10</strong>.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses menemukan sifat operasi bilangan berpangkat dari pola numerik.',
    guru: 'Baca jawaban refleksi secara acak dan gunakan untuk menentukan murid yang perlu pendampingan tambahan, terutama yang masih mengalikan eksponen pada perkalian.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri mengapa 2³ × 2⁴ = 2⁷, bukan 2¹².',
        placeholder: 'Dari tabel aku melihat …',
      },
      {
        id: 'r2',
        teks: 'Bagian mana dari eksplorasi pola (tabel pangkat, tabel pola, lab, ubin faktor) yang paling membantumu menemukan sifatnya? Mengapa?',
        placeholder: 'Yang paling membantu adalah …',
      },
      {
        id: 'r3',
        teks: 'Di mana kamu menemukan perkalian atau pembagian bilangan berpangkat dalam dunia RPL?',
        placeholder: 'Misalnya konversi KB ke MB, …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat menjelaskan dan memakai ketiga sifat ini sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '🙂 Yakin — aku bisa memakai sifat-sifatnya' },
      { id: 'ragu', label: '🤔 Masih ragu membedakan kapan eksponen dijumlah atau dikali' },
      { id: 'bantuan', label: '🙋 Aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, kamu menemukan sifat-sifat ini sendiri!',
    teks: 'Kamu tidak sekadar menghafal — kamu mengumpulkan data numerik, melihat polanya, mengujinya, dan menjelaskan mengapa eksponen dijumlahkan, dikurangkan, atau dikalikan.',
    capaian: [
      'Melengkapi tabel pangkat dan mengumpulkan data hasil perkalian, pembagian, dan perpangkatan.',
      'Menemukan hubungan eksponen hasil dengan eksponen awal dari pola numerik.',
      'Menguji pola pada basis lain dan menyangkal dugaan keliru dengan contoh penyangkal.',
      'Menjelaskan mengapa polanya berlaku dengan ubin faktor.',
      'Menerapkan sifat-sifat tersebut pada soal dan konteks RPL.',
    ],
  },
};
