'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Operasi Hitung Bilangan Desimal & Konversi
   Pecahan–Desimal dalam Masalah Kontekstual — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menerapkan operasi aritmatika pada bilangan desimal serta
   mengonversi pecahan dan desimal untuk menyelesaikan masalah
   kontekstual.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahTambah', 'olahKaliBagi' & 'olahKonversi'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi    (7')  — "Struk Koperasi & Dapur Kelas": gula dan
                             terigu ditimbang, kain flanel dipotong,
                             sirup dituang ke gelas, label mentega ¾ kg.
                             Murid MENDUGA hasilnya (tidak dinilai).
     2. Masalah      (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data         (15') — "Lab Desimal": enam percobaan dengan tiga
                             alat — Petak Seratus (mengarsir pecahan &
                             model luas perkalian), Papan Bersusun (koma
                             sejajar vs. rata kanan), dan Gelas Takar
                             (pembagian sebagai "berapa takaran di dalam
                             total"). Hasil dicatat lewat isian
                             berdiagnosa; tabel data terisi otomatis.
     4a. Olah + −    (8')  — memilah susunan bersusun yang benar/keliru,
                             menemukan peran nol pengisi, lalu menghitung.
     4b. Olah × :    (10') — tabel pola 3 × 4 → 0,3 × 0,4 (letak koma =
                             jumlah angka desimal) dan 15 : 3 → 1,5 : 0,3
                             (geser koma pembagi & yang dibagi bersama).
     4c. Konversi    (10') — pecahan → desimal (penyebut 10/100/1000 atau
                             pembilang : penyebut, termasuk desimal
                             berulang) dan desimal → pecahan (penyebut
                             10ⁿ lalu sederhanakan).
     5. Bukti        (7')  — menguji pernyataan & membandingkan dengan
                             dugaan awal serta hipotesis.
     6. Simpulan     (5')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap    (10') — delapan soal diambil acak dari bank enam
                             belas soal kontekstual (isian & pilihan ganda).
     8. Refleksi     (3')  — refleksi tertulis & penilaian diri.

   Notasi baku: pemisah desimal KOMA (2,05), pecahan ditulis a/b atau
   campuran "1 1/4", desimal berulang diberi tanda … (0,333…).

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban benar sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Soal uji terap juga
   diambil acak dari bank.

   Konsistensi kunci jawaban diuji tests/mpi-2.5-data.test.js terhadap
   engine seksi 64 (hasilOperasiDesimal, diagnosaOperasiDesimal,
   pecahanKeDesimal, desimalKePecahan, diagnosaKonversiPD).
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  meta: {
    judul: 'Operasi Hitung Desimal & Konversi Pecahan–Desimal dalam Masalah Kontekstual',
  },

  tahap: [
    { id: 'stimulasi', label: 'Stimulasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'koleksi', label: 'Data' },
    { id: 'olahTambah', label: 'Pola + −' },
    { id: 'olahKaliBagi', label: 'Pola × :' },
    { id: 'olahKonversi', label: 'Konversi' },
    { id: 'verifikasi', label: 'Bukti' },
    { id: 'generalisasi', label: 'Simpulan' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Konteks yang dipakai di seluruh modul. */
  konteks: {
    belanja: { ikon: '🛒', nama: 'Koperasi' },
    dapur: { ikon: '🍳', nama: 'Dapur' },
    ukur: { ikon: '📏', nama: 'Ukuran' },
    takar: { ikon: '🥤', nama: 'Takaran' },
    gerak: { ikon: '🏃', nama: 'Olahraga' },
  },

  /* Nama alat Lab Desimal. */
  alat: {
    arsir: { ikon: '🟦', nama: 'Petak Seratus' },
    susun: { ikon: '🧮', nama: 'Papan Bersusun' },
    luas: { ikon: '🔲', nama: 'Model Luas' },
    tuang: { ikon: '🥤', nama: 'Gelas Takar' },
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Bukti.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati struk koperasi dan catatan dapur kelas, lalu menyampaikan dugaan hasil hitungannya.',
    tp: 'Menerapkan operasi aritmatika pada bilangan desimal serta mengonversi pecahan dan desimal untuk menyelesaikan masalah kontekstual.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menjumlahkan dan mengurangkan bilangan desimal dengan menyejajarkan koma (memakai nol pengisi bila perlu).',
      'Mengalikan bilangan desimal dan menentukan letak koma hasilnya dari banyak angka di belakang koma.',
      'Membagi bilangan desimal dengan menggeser koma pembagi dan yang dibagi bersama-sama.',
      'Mengubah pecahan menjadi desimal (termasuk desimal berulang) dan desimal menjadi pecahan paling sederhana.',
      'Memilih operasi yang tepat untuk menyelesaikan masalah belanja, takaran, dan ukuran, lalu menafsirkan hasilnya.',
    ],
    guru: 'Bacakan struk dan catatan dapur. Minta pasangan murid menyampaikan dugaan beserta cara berpikirnya. Jangan membenarkan atau menyalahkan dulu — perbedaan dugaan (mis. 0,12 vs 1,2) menjadi rasa ingin tahu yang akan diselidiki di Lab Desimal.',
    judul: 'Struk Koperasi & Dapur Kelas',
    pengantar:
      'Kelas VII-C sedang menyiapkan bazar kue. Bendahara mencatat belanja di koperasi, sementara tim dapur menakar bahan. Semua angkanya berbentuk desimal atau pecahan!',
    kabar: [
      {
        id: 'kGula',
        konteks: 'belanja',
        sumber: 'Struk Koperasi',
        teks: 'Gula pasir 1,25 kg dan tepung terigu 0,8 kg dimasukkan ke kantong yang sama.',
        sorot: '1,25 kg + 0,8 kg',
      },
      {
        id: 'kKain',
        konteks: 'ukur',
        sumber: 'Tim Dekorasi',
        teks: 'Kain flanel untuk taplak stand dipotong berukuran 0,3 m × 0,4 m.',
        sorot: '0,3 m × 0,4 m',
      },
      {
        id: 'kSirup',
        konteks: 'takar',
        sumber: 'Tim Minuman',
        teks: 'Sebotol sirup 1,5 L dituang ke gelas-gelas kecil berisi 0,3 L.',
        sorot: '1,5 L : 0,3 L',
      },
      {
        id: 'kMentega',
        konteks: 'dapur',
        sumber: 'Resep Kue',
        teks: 'Resep meminta 3/4 kg mentega, tetapi timbangan digital hanya menampilkan angka desimal.',
        sorot: '3/4 kg = … kg',
      },
    ],
    dugaan: [
      {
        id: 'dGula',
        tanya: 'Berapa berat isi kantong itu?',
        jenis: 'hitung',
        a: '1,25',
        op: '+',
        b: '0,8',
        opsi: [
          { id: 'baku', label: '2,05 kg' },
          { id: 'rata', label: '1,33 kg' },
          { id: 'geser', label: '20,5 kg' },
          { id: 'balik', label: '0,45 kg' },
        ],
        baku: 'baku',
        pembahasan:
          'Koma disejajarkan: 1,25 + 0,80 = 2,05. Hasil 1,33 muncul bila angka disusun rata kanan (125 + 8).',
      },
      {
        id: 'dKain',
        tanya: 'Berapa meter persegi luas kain itu?',
        jenis: 'hitung',
        a: '0,3',
        op: '×',
        b: '0,4',
        opsi: [
          { id: 'baku', label: '0,12 m²' },
          { id: 'geser', label: '1,2 m²' },
          { id: 'tambah', label: '0,7 m²' },
          { id: 'bulat', label: '12 m²' },
        ],
        baku: 'baku',
        pembahasan:
          '3 × 4 = 12, lalu banyak angka di belakang koma 1 + 1 = 2, jadi 0,3 × 0,4 = 0,12. Pada Model Luas, 12 dari 100 petak terarsir dua kali.',
      },
      {
        id: 'dSirup',
        tanya: 'Berapa gelas yang terisi penuh?',
        jenis: 'hitung',
        a: '1,5',
        op: ':',
        b: '0,3',
        opsi: [
          { id: 'baku', label: '5 gelas' },
          { id: 'geser', label: '0,5 gelas' },
          { id: 'besar', label: '50 gelas' },
          { id: 'kali', label: '0,45 gelas' },
        ],
        baku: 'baku',
        pembahasan:
          '1,5 : 0,3 = 15 : 3 = 5. Pada Gelas Takar, botol 1,5 L habis setelah dituang ke 5 gelas.',
      },
      {
        id: 'dMentega',
        tanya: 'Angka berapa yang harus muncul di timbangan digital?',
        jenis: 'keDesimal',
        soal: '3/4',
        opsi: [
          { id: 'baku', label: '0,75 kg' },
          { id: 'koma', label: '3,4 kg' },
          { id: 'gabung', label: '0,34 kg' },
          { id: 'geser', label: '7,5 kg' },
        ],
        baku: 'baku',
        pembahasan:
          '3/4 = 75/100 = 0,75. Pembilang dan penyebut tidak boleh langsung dipisah koma (3,4) atau digabung (0,34).',
      },
    ],
    alasanLabel: 'Bagaimana kamu memperoleh dugaan itu?',
    alasanPlaceholder: 'Tulis caramu berpikir dengan kalimatmu sendiri…',
    catatan:
      'Belum ada jawaban benar atau salah di tahap ini. Dugaanmu disimpan, lalu kamu sendiri yang mengujinya pada tahap Bukti.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan yang akan diselidiki dan menuliskan hipotesis.',
    guru: 'Bila murid memilih rumusan yang kurang tepat, ajukan pertanyaan balik: "Kalau pertanyaan itu terjawab, apakah kita bisa menghitung berat kantong, luas kain, banyak gelas, DAN angka di timbangan?"',
    pengantar:
      'Keempat catatan memakai bilangan desimal dan pecahan dengan operasi yang berbeda (+, ×, :) serta perubahan bentuk (pecahan → desimal). Dugaan teman-temanmu ternyata berbeda-beda, terutama soal letak koma. Kita perlu cara yang pasti.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'r1',
        label:
          'Bagaimana cara menjumlahkan, mengurangkan, mengalikan, dan membagi bilangan desimal serta mengubah pecahan ke desimal (dan sebaliknya) untuk menyelesaikan masalah belanja, ukuran, dan takaran?',
      },
      { id: 'r2', label: 'Berapa harga gula pasir per kilogram di koperasi sekolah?' },
      {
        id: 'r3',
        label: 'Bagaimana cara menghitung desimal dengan mengabaikan komanya supaya lebih cepat?',
      },
      { id: 'r4', label: 'Mengapa timbangan digital tidak bisa menampilkan pecahan?' },
    ],
    correct: 'r1',
    umpan: {
      r1: 'Tepat. Keempat catatan membutuhkan operasi hitung desimal dan konversi pecahan–desimal.',
      r2: 'Itu hanya sebuah fakta harga dan tidak membantu menghitung luas kain atau banyak gelas.',
      r3: 'Koma justru menentukan nilai bilangan: 0,12 dan 12 sangat berbeda. Kita perlu tahu di mana letak koma yang benar.',
      r4: 'Pertanyaan menarik untuk pelajaran teknologi, tetapi tidak membantu menyelesaikan keempat perhitungan.',
    },
    hipotesisLabel: 'Tulis dugaan sementaramu (hipotesis)',
    hipotesisPlaceholder:
      'Contoh: saya menduga pada perkalian desimal, banyak angka di belakang koma hasilnya …',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA: LAB DESIMAL
     Setiap percobaan memakai satu alat. Isian baru terbuka setelah
     alat diatur sesuai percobaan.
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Melakukan percobaan dengan Petak Seratus, Papan Bersusun, Model Luas, dan Gelas Takar, lalu mencatat hasilnya.',
    guru: 'Satu murid mengoperasikan alat, pasangannya mencatat, lalu bergantian. Tanyakan: "Satu petak bernilai berapa? Satu baris bernilai berapa?" dan "Mengapa koma harus sejajar?"',
    instruksi:
      'Kerjakan percobaan satu per satu. Atur alatnya lebih dulu sesuai petunjuk, amati, lalu catat hasilnya. Satu petak = 0,01 dan satu baris (10 petak) = 0,1.',
    opsiSusun: [
      { id: 'koma', label: 'Koma sejajar' },
      { id: 'kanan', label: 'Rata kanan' },
    ],
    umpanSusun: {
      koma: 'Tepat! Koma sejajar membuat satuan di bawah satuan, persepuluhan di bawah persepuluhan, dan perseratusan di bawah perseratusan.',
      kanan:
        'Pada susunan rata kanan, angka 8 (8 persepuluhan) berada di bawah angka 5 (5 perseratusan) — nilai tempatnya berbeda. Coba pilih susunan yang lain.',
    },
    percobaan: [
      {
        id: 'k1',
        konteks: 'dapur',
        alat: 'arsir',
        cerita: 'Resep meminta 3/4 kg mentega. Arsir 3/4 bagian Petak Seratus.',
        soal: '3/4',
        arsir: 75,
        atur: 'Arsir 75 petak (3/4 dari 100 petak).',
        hints: [
          '3/4 dari 100 petak = 75 petak. Satu petak bernilai 0,01.',
          '75 petak = 75 perseratus = 0,75.',
        ],
        temuan:
          '3/4 = 75/100 = <strong>0,75</strong>. Mengarsir 100 petak membantu menjadikan penyebutnya 100.',
      },
      {
        id: 'k2',
        konteks: 'ukur',
        alat: 'arsir',
        cerita: 'Tim dekorasi memakai 2/5 gulung pita. Arsir 2/5 bagian Petak Seratus.',
        soal: '2/5',
        arsir: 40,
        atur: 'Arsir 40 petak (2/5 dari 100 petak = 4 baris).',
        hints: ['1/5 dari 100 petak = 20 petak, jadi 2/5 = 40 petak = 4 baris.'],
        temuan:
          '2/5 = 4/10 = 40/100 = <strong>0,4</strong>. Empat baris penuh = 4 persepuluh = 0,4 (sama dengan 0,40).',
      },
      {
        id: 'k3',
        konteks: 'belanja',
        alat: 'susun',
        cerita: 'Gula 1,25 kg dan terigu 0,8 kg dimasukkan ke satu kantong.',
        a: '1,25',
        op: '+',
        b: '0,8',
        hints: [
          'Pilih susunan yang komanya sejajar. 0,8 boleh ditulis 0,80.',
          '1,25 + 0,80: perseratusan 5 + 0 = 5, persepuluhan 2 + 8 = 10 (simpan 1), satuan 1 + 0 + 1 = 2.',
        ],
        temuan:
          'Dengan koma sejajar: 1,25 + 0,80 = <strong>2,05</strong>. Nol pengisi (0,8 → 0,80) tidak mengubah nilai.',
      },
      {
        id: 'k4',
        konteks: 'belanja',
        alat: 'susun',
        cerita: 'Bendahara membawa 2 kg gula, lalu memakai 0,75 kg untuk adonan. Berapa sisanya?',
        a: '2',
        op: '−',
        b: '0,75',
        hints: [
          'Tulis 2 sebagai 2,00 supaya koma sejajar dengan 0,75.',
          '2,00 − 0,75: pinjam dari satuan, hasilnya 1,25.',
        ],
        temuan:
          '2,00 − 0,75 = <strong>1,25</strong>. Bilangan bulat punya koma tersembunyi di belakangnya: 2 = 2,00.',
      },
      {
        id: 'k5',
        konteks: 'ukur',
        alat: 'luas',
        cerita: 'Kain flanel berukuran 0,3 m × 0,4 m. Petak Seratus mewakili kain 1 m × 1 m.',
        a: '0,3',
        op: '×',
        b: '0,4',
        baris: 3,
        kolom: 4,
        atur: 'Atur 3 baris (0,3) dan 4 kolom (0,4). Petak yang terarsir dua kali adalah luas kain.',
        hints: [
          'Hitung petak berwarna gabungan (terarsir dua kali): 3 × 4 petak.',
          '12 petak dari 100 petak = 12 perseratus.',
        ],
        temuan:
          '0,3 × 0,4 = 12 perseratus = <strong>0,12</strong>. Hasilnya lebih kecil daripada 0,3 dan 0,4!',
      },
      {
        id: 'k6',
        konteks: 'takar',
        alat: 'tuang',
        cerita: 'Sirup 1,5 L dituang ke gelas-gelas berisi 0,3 L sampai botol kosong.',
        a: '1,5',
        op: ':',
        b: '0,3',
        atur: 'Tekan "Tuang 1 gelas" sampai botol kosong, sambil menghitung gelasnya.',
        hints: [
          'Hitung banyak gelas yang sudah dituang sampai botol kosong.',
          '0,3 + 0,3 + 0,3 + 0,3 + 0,3 = 1,5.',
        ],
        temuan:
          '1,5 : 0,3 = <strong>5</strong> gelas. Pembagian menjawab "ada berapa 0,3 di dalam 1,5?" — hasilnya lebih besar daripada 1,5!',
      },
    ],
    amati: [
      {
        id: 'a1',
        tanya:
          'Percobaan 3–4: agar penjumlahan dan pengurangan desimal benar, bagian yang harus sejajar adalah …',
        opsi: [
          { id: 'koma', label: 'koma (nilai tempat yang sama)' },
          { id: 'kanan', label: 'angka paling kanan' },
          { id: 'kiri', label: 'angka paling kiri' },
          { id: 'bebas', label: 'tidak perlu sejajar' },
        ],
        correct: 'koma',
        umpan: {
          koma: 'Benar. Koma sejajar → nilai tempat yang sama berada dalam satu kolom.',
          kanan:
            'Rata kanan membuat 0,8 dijumlahkan seolah-olah 0,08. Lihat lagi susunan yang keliru di Papan Bersusun.',
          kiri: 'Rata kiri juga mencampur nilai tempat. Lihat Papan Bersusun percobaan 3.',
          bebas: 'Tanpa disejajarkan, 8 persepuluh bisa terjumlah sebagai 8 perseratus.',
        },
      },
      {
        id: 'a2',
        tanya: 'Percobaan 5: 0,3 × 0,4 = 0,12. Apa yang kamu amati?',
        opsi: [
          { id: 'kecil', label: 'Hasil kalinya lebih kecil daripada kedua bilangan' },
          { id: 'besar', label: 'Hasil kalinya lebih besar daripada kedua bilangan' },
          { id: 'sama', label: 'Hasil kalinya sama dengan 0,3 + 0,4' },
          { id: 'satu', label: 'Hasil kalinya selalu 1,2' },
        ],
        correct: 'kecil',
        umpan: {
          kecil:
            'Tepat. Mengalikan dengan bilangan kurang dari 1 berarti mengambil "sebagian", jadi hasilnya mengecil.',
          besar: '0,12 lebih kecil daripada 0,3 maupun 0,4. Lihat lagi luas petak yang terarsir.',
          sama: '0,3 + 0,4 = 0,7, sedangkan Model Luas menunjukkan 12 petak = 0,12.',
          satu: '3 × 4 = 12, tetapi Model Luas hanya mengarsir 12 dari 100 petak = 0,12.',
        },
      },
      {
        id: 'a3',
        tanya: 'Percobaan 6: 1,5 : 0,3 = 5. Hasil ini sama dengan …',
        opsi: [
          { id: 'b15', label: '15 : 3' },
          { id: 'b153', label: '1,5 : 3' },
          { id: 'b1503', label: '15 : 0,3' },
          { id: 'k15', label: '1,5 × 0,3' },
        ],
        correct: 'b15',
        umpan: {
          b15: 'Benar! 1,5 dan 0,3 sama-sama dikali 10 menjadi 15 dan 3; hasil baginya tetap 5.',
          b153: '1,5 : 3 = 0,5, bukan 5. Hanya pembaginya yang dikali 10.',
          b1503: '15 : 0,3 = 50. Hanya yang dibagi yang dikali 10.',
          k15: '1,5 × 0,3 = 0,45 — itu perkalian, bukan pembagian.',
        },
      },
      {
        id: 'a4',
        tanya: 'Percobaan 1–2: cara mengubah pecahan seperti 3/4 menjadi desimal adalah …',
        opsi: [
          { id: 'seratus', label: 'menjadikan penyebutnya 10, 100, atau 1000' },
          { id: 'koma', label: 'menulis pembilang, koma, lalu penyebut (3,4)' },
          { id: 'gabung', label: 'menulis 0, koma, lalu pembilang dan penyebut (0,34)' },
          { id: 'kurang', label: 'mengurangkan penyebut dengan pembilang' },
        ],
        correct: 'seratus',
        umpan: {
          seratus:
            'Tepat. 3/4 = 75/100 = 0,75 dan 2/5 = 4/10 = 0,4. Penyebut 10, 100, 1000 langsung menjadi nilai tempat.',
          koma: '3,4 lebih besar daripada 3, padahal 3/4 kurang dari 1.',
          gabung: '0,34 = 34/100, bukan 75/100. Lihat lagi petak yang kamu arsir.',
          kurang: '4 − 3 = 1 tidak ada hubungannya dengan nilai 3/4.',
        },
      },
    ],
    nextLabel: 'Lanjut: Olah Data Penjumlahan & Pengurangan →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — PENGOLAHAN DATA: PENJUMLAHAN & PENGURANGAN
     ---------------------------------------------------------- */
  olahTambah: {
    kicker: 'Tahap 4a · Pengolahan Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Membedakan susunan bersusun yang benar dan yang keliru, lalu menemukan cara menjumlahkan dan mengurangkan desimal.',
    guru: 'Minta murid menunjuk kolom satuan dan persepuluhan pada setiap susunan sebelum menjawab. Tekankan bahwa nol pengisi tidak mengubah nilai (0,8 = 0,80) tetapi membantu menyejajarkan.',
    judulA: 'A. Susunan mana yang benar?',
    instruksiA:
      'Amati setiap susunan bersusun, lalu tentukan apakah susunannya benar. Setiap butir dijawab sekali, lalu langsung dibahas.',
    opsiSusunan: [
      { id: 'benar', label: '✓ Susunan benar' },
      { id: 'keliru', label: '✗ Susunan keliru' },
    ],
    pilah: [
      {
        id: 's1',
        a: '3,5',
        op: '+',
        b: '1,25',
        rataKanan: false,
        teks: '3,5 + 1,25',
        correct: 'benar',
        explanation:
          'Koma sejajar; 3,5 ditulis 3,50 sehingga perseratusan berada dalam satu kolom.',
      },
      {
        id: 's2',
        a: '3,5',
        op: '+',
        b: '1,25',
        rataKanan: true,
        teks: '3,5 + 1,25',
        correct: 'keliru',
        explanation:
          'Rata kanan: angka 5 (persepuluhan) berada di atas angka 5 (perseratusan). Nilai tempatnya bercampur.',
      },
      {
        id: 's3',
        a: '4',
        op: '−',
        b: '1,6',
        rataKanan: false,
        teks: '4 − 1,6',
        correct: 'benar',
        explanation: '4 ditulis 4,0 sehingga komanya sejajar dengan 1,6.',
      },
      {
        id: 's4',
        a: '12,3',
        op: '+',
        b: '0,45',
        rataKanan: true,
        teks: '12,3 + 0,45',
        correct: 'keliru',
        explanation: 'Koma tidak sejajar. Yang benar: 12,30 + 0,45 dengan koma dalam satu kolom.',
      },
      {
        id: 's5',
        a: '7,25',
        op: '−',
        b: '2,5',
        rataKanan: false,
        teks: '7,25 − 2,5',
        correct: 'benar',
        explanation: '2,5 ditulis 2,50; koma, satuan, dan persepuluhan sudah sejajar.',
      },
    ],
    judulB: 'B. Temukan polanya',
    pola: [
      {
        id: 'p1',
        tanya: 'Mengapa 0,8 boleh ditulis 0,80 saat dijumlahkan dengan 1,25?',
        opsi: [
          { id: 'sama', label: 'Karena nilainya sama: 8 persepuluh = 80 perseratus' },
          { id: 'besar', label: 'Karena 0,80 lebih besar daripada 0,8' },
          { id: 'kecil', label: 'Karena 0,80 lebih kecil daripada 0,8' },
          { id: 'aturan', label: 'Karena semua desimal harus punya dua angka di belakang koma' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Tepat. Menambah nol di ujung kanan bagian desimal tidak mengubah nilai.',
          besar: 'Coba arsir di Petak Seratus: 8 baris (0,8) sama dengan 80 petak (0,80).',
          kecil: '8 baris dan 80 petak menutupi luas yang sama.',
          aturan:
            'Tidak ada aturan seperti itu. Nol pengisi hanya dipakai agar banyak angkanya sama.',
        },
      },
      {
        id: 'p2',
        tanya: 'Pada 2 − 0,75, bilangan 2 sebaiknya ditulis …',
        opsi: [
          { id: 'dua', label: '2,00' },
          { id: 'dua0', label: '0,02' },
          { id: 'dua2', label: '0,2' },
          { id: 'dua200', label: '200' },
        ],
        correct: 'dua',
        umpan: {
          dua: 'Benar. 2 = 2,00, sehingga bisa dikurangi 0,75 kolom demi kolom: hasilnya 1,25.',
          dua0: '0,02 adalah 2 perseratus, jauh lebih kecil daripada 2.',
          dua2: '0,2 adalah 2 persepuluh, bukan 2 utuh.',
          dua200: '200 adalah dua ratus. Komanya tidak boleh dihilangkan.',
        },
      },
    ],
    judulC: 'C. Hitung',
    instruksiC:
      'Susun di bukumu dengan koma sejajar (tambahkan nol pengisi bila perlu), lalu ketik hasilnya.',
    hitung: [
      {
        id: 'h1',
        a: '3,5',
        op: '+',
        b: '1,25',
        hints: ['3,50 + 1,25'],
      },
      {
        id: 'h2',
        a: '12,3',
        op: '+',
        b: '0,45',
        hints: ['12,30 + 0,45'],
      },
      {
        id: 'h3',
        a: '4',
        op: '−',
        b: '1,6',
        hints: ['4,0 − 1,6', 'Pinjam 1 satuan = 10 persepuluh.'],
      },
      {
        id: 'h4',
        a: '10',
        op: '−',
        b: '3,75',
        hints: ['10,00 − 3,75'],
      },
    ],
    temuan: [
      'Pada penjumlahan dan pengurangan desimal, <strong>koma disejajarkan</strong> sehingga nilai tempat yang sama berada dalam satu kolom.',
      'Tambahkan <strong>nol pengisi</strong> agar banyak angka di belakang koma sama: 0,8 = 0,80 dan 2 = 2,00.',
      'Koma pada hasil berada <strong>lurus di bawah</strong> koma kedua bilangan.',
    ],
    nextLabel: 'Lanjut: Olah Data Perkalian & Pembagian →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — PENGOLAHAN DATA: PERKALIAN & PEMBAGIAN
     ---------------------------------------------------------- */
  olahKaliBagi: {
    kicker: 'Tahap 4b · Pengolahan Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Melengkapi tabel pola untuk menemukan letak koma pada perkalian dan cara membagi bilangan desimal.',
    guru: 'Arahkan murid membandingkan setiap baris tabel dengan baris sebelumnya: "Angka-angkanya sama, apa yang berubah?" Hindari menyebut aturan sebelum murid menemukannya sendiri.',
    judulA: 'A. Tabel pola perkalian',
    instruksiA:
      'Lengkapi hasil yang kosong. Bantuan: hitung tanpa koma lebih dulu, lalu pikirkan letak komanya (Model Luas: 0,3 × 0,4 = 12 petak dari 100).',
    polaKali: [
      { id: 'pk1', a: '3', b: '4', tampil: true },
      { id: 'pk2', a: '0,3', b: '4', tampil: false, hints: ['0,3 × 4 = 0,3 + 0,3 + 0,3 + 0,3'] },
      {
        id: 'pk3',
        a: '0,3',
        b: '0,4',
        tampil: false,
        hints: ['Ingat Model Luas: 12 dari 100 petak.'],
      },
      {
        id: 'pk4',
        a: '0,03',
        b: '0,4',
        tampil: false,
        hints: ['3 × 4 = 12; banyak angka di belakang koma: 2 + 1 = 3.'],
      },
    ],
    pasangKali: [
      {
        id: 'q1',
        tanya:
          'Bandingkan kolom "angka di belakang koma". Banyak angka di belakang koma pada hasil kali sama dengan …',
        opsi: [
          { id: 'jumlah', label: 'jumlah banyak angka di belakang koma kedua bilangan' },
          { id: 'maks', label: 'banyak angka di belakang koma bilangan yang paling panjang' },
          { id: 'kali', label: 'hasil kali banyak angka di belakang koma kedua bilangan' },
          { id: 'satu', label: 'selalu satu angka' },
        ],
        correct: 'jumlah',
        umpan: {
          jumlah:
            'Tepat! 0,3 (1 angka) × 0,4 (1 angka) → 1 + 1 = 2 angka: 0,12. 0,03 (2) × 0,4 (1) → 3 angka: 0,012.',
          maks: 'Bila begitu, 0,3 × 0,4 = 1,2. Padahal Model Luas menunjukkan 0,12.',
          kali: '1 × 1 = 1, sehingga 0,3 × 0,4 = 1,2 — tidak cocok dengan Model Luas.',
          satu: 'Lihat baris 0,03 × 0,4 = 0,012: ada tiga angka di belakang koma.',
        },
      },
    ],
    judulB: 'B. Tabel pola pembagian',
    instruksiB:
      'Lengkapi hasil yang kosong. Bantuan: pikirkan "ada berapa pembagi di dalam yang dibagi?" (Gelas Takar).',
    polaBagi: [
      { id: 'pb1', a: '15', b: '3', tampil: true },
      { id: 'pb2', a: '1,5', b: '0,3', tampil: false, hints: ['Ingat Gelas Takar percobaan 6.'] },
      {
        id: 'pb3',
        a: '0,15',
        b: '0,03',
        tampil: false,
        hints: ['Ada berapa 3 perseratus di dalam 15 perseratus?'],
      },
      { id: 'pb4', a: '150', b: '30', tampil: false, hints: ['150 : 30 = 15 : 3'] },
    ],
    pasangBagi: [
      {
        id: 'q2',
        tanya:
          'Semua baris tabel pembagian hasilnya 5. Apa yang terjadi pada bilangan yang dibagi dan pembaginya?',
        opsi: [
          { id: 'samaKali', label: 'Keduanya dikali (atau dibagi) dengan bilangan yang sama' },
          { id: 'hanyaA', label: 'Hanya yang dibagi yang dikali 10' },
          { id: 'hanyaB', label: 'Hanya pembagi yang dikali 10' },
          { id: 'tambah', label: 'Keduanya ditambah bilangan yang sama' },
        ],
        correct: 'samaKali',
        umpan: {
          samaKali:
            'Tepat! 1,5 : 0,3 → (× 10) → 15 : 3. Geser koma pembagi DAN yang dibagi ke kanan sebanyak yang sama sampai pembagi menjadi bilangan bulat.',
          hanyaA: '15 : 0,3 = 50, bukan 5. Bila hanya satu yang dikali, hasilnya berubah.',
          hanyaB: '1,5 : 3 = 0,5, bukan 5.',
          tambah: '(1,5 + 1) : (0,3 + 1) = 2,5 : 1,3 bukan 5. Penjumlahan mengubah hasil bagi.',
        },
      },
    ],
    judulC: 'C. Hitung',
    instruksiC:
      'Perkalian: kalikan tanpa koma, lalu letakkan koma. Pembagian: geser koma pembagi dan yang dibagi bersama, lalu bagi.',
    hitung: [
      {
        id: 'kb1',
        a: '2,5',
        op: '×',
        b: '1,2',
        hints: ['25 × 12 = 300; ada 1 + 1 = 2 angka di belakang koma.'],
      },
      {
        id: 'kb2',
        a: '0,6',
        op: '×',
        b: '0,05',
        hints: ['6 × 5 = 30; ada 1 + 2 = 3 angka di belakang koma.'],
      },
      { id: 'kb3', a: '7,2', op: ':', b: '0,9', hints: ['Kalikan keduanya dengan 10: 72 : 9.'] },
      {
        id: 'kb4',
        a: '4,5',
        op: ':',
        b: '0,15',
        hints: ['Kalikan keduanya dengan 100: 450 : 15.'],
      },
    ],
    temuan: [
      'Perkalian: kalikan seperti bilangan bulat, lalu <strong>banyak angka di belakang koma hasil = jumlah</strong> banyak angka di belakang koma kedua bilangan.',
      'Mengalikan dengan bilangan antara 0 dan 1 membuat hasilnya <strong>lebih kecil</strong> (0,3 × 0,4 = 0,12).',
      'Pembagian: kalikan pembagi <strong>dan</strong> yang dibagi dengan 10, 100, … yang sama sampai pembagi bulat; hasil baginya tetap (1,5 : 0,3 = 15 : 3).',
      'Membagi dengan bilangan antara 0 dan 1 membuat hasilnya <strong>lebih besar</strong> (1,5 : 0,3 = 5).',
    ],
    nextLabel: 'Lanjut: Olah Data Konversi →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — PENGOLAHAN DATA: KONVERSI PECAHAN ↔ DESIMAL
     ---------------------------------------------------------- */
  olahKonversi: {
    kicker: 'Tahap 4c · Pengolahan Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan cara mengubah pecahan menjadi desimal (termasuk desimal berulang) dan desimal menjadi pecahan paling sederhana.',
    guru: 'Pada bagian B, ajak murid melakukan pembagian bersusun 1 : 3 di buku dan mengamati sisa yang selalu 1. Pada bagian C, tekankan "dibaca → ditulis": 0,25 dibaca dua puluh lima perseratus, jadi 25/100.',
    judulA: 'A. Pecahan → desimal: jadikan penyebutnya 10, 100, atau 1000',
    instruksiA:
      'Ubah setiap pecahan menjadi desimal. Bantuan: cari pengali agar penyebutnya menjadi 10, 100, atau 1000.',
    keDesimal: [
      { id: 'kd1', soal: '1/4', hints: ['1/4 = 25/100'] },
      { id: 'kd2', soal: '3/5', hints: ['3/5 = 6/10'] },
      { id: 'kd3', soal: '7/8', hints: ['8 × 125 = 1000, jadi 7/8 = 875/1000.'] },
      { id: 'kd4', soal: '1 1/2', hints: ['1 1/2 = 1 + 5/10'] },
    ],
    judulB: 'B. Bila penyebutnya tidak bisa dijadikan 10, 100, atau 1000',
    pembagian: {
      soal: '1/3',
      langkah: [
        '1 : 3 = 0, sisa 1 → turunkan 0 → 10 : 3 = 3, sisa 1',
        '10 : 3 = 3, sisa 1 → 10 : 3 = 3, sisa 1 → …',
      ],
    },
    berulang: [
      {
        id: 'b1',
        tanya: 'Sisa pembagian 1 : 3 selalu 1, sehingga angka 3 terus muncul. Jadi 1/3 = …',
        opsi: [
          { id: 'ulang', label: '0,333… (angka 3 berulang terus)' },
          { id: 'satu', label: '0,3 tepat' },
          { id: 'koma', label: '1,3' },
          { id: 'gabung', label: '0,13' },
        ],
        correct: 'ulang',
        umpan: {
          ulang:
            'Tepat! 1/3 adalah desimal berulang. Kita tulis 0,333… atau dibulatkan 0,33 bila diperlukan.',
          satu: '0,3 × 3 = 0,9, belum 1. Masih ada sisa, jadi pembagiannya belum berhenti.',
          koma: '1,3 lebih besar daripada 1, padahal 1/3 kurang dari 1.',
          gabung: '0,13 bukan hasil 1 : 3. Jangan menggabungkan pembilang dan penyebut.',
        },
      },
      {
        id: 'b2',
        tanya: 'Pecahan mana yang menghasilkan desimal BERULANG?',
        opsi: [
          { id: 'enam', label: '1/6' },
          { id: 'delapan', label: '1/8' },
          { id: 'lima', label: '2/5' },
          { id: 'dua', label: '1/20' },
        ],
        correct: 'enam',
        umpan: {
          enam: 'Benar. 6 = 2 × 3; faktor 3 membuat penyebutnya tidak bisa dijadikan 10, 100, 1000 → 1/6 = 0,1666…',
          delapan: '1/8 = 125/1000 = 0,125 — berhenti.',
          lima: '2/5 = 4/10 = 0,4 — berhenti.',
          dua: '1/20 = 5/100 = 0,05 — berhenti.',
        },
      },
    ],
    keDesimalBerulang: [
      {
        id: 'kb1',
        soal: '2/3',
        hints: [
          'Hitung 2 : 3 dengan pembagian bersusun.',
          'Tulis dua angka di belakang koma, mis. 0,66 atau 0,67, atau beri tanda … (0,666…).',
        ],
      },
    ],
    judulC: 'C. Desimal → pecahan paling sederhana',
    instruksiC:
      'Tulis desimal sebagai pecahan berpenyebut 10, 100, atau 1000 (lihat banyak angka di belakang koma), lalu sederhanakan. Contoh: 0,75 = 75/100 = 3/4.',
    kePecahan: [
      { id: 'kp1', soal: '0,6', hints: ['0,6 = 6/10; bagi pembilang dan penyebut dengan 2.'] },
      { id: 'kp2', soal: '0,25', hints: ['0,25 = 25/100; FPB(25, 100) = 25.'] },
      { id: 'kp3', soal: '1,75', hints: ['1,75 = 1 75/100 = 1 3/4. Boleh juga ditulis 7/4.'] },
      { id: 'kp4', soal: '0,125', hints: ['0,125 = 125/1000; FPB(125, 1000) = 125.'] },
    ],
    temuan: [
      'Pecahan → desimal: jadikan penyebutnya <strong>10, 100, atau 1000</strong> (3/4 = 75/100 = 0,75), atau hitung <strong>pembilang : penyebut</strong>.',
      'Bila penyebut (paling sederhana) memuat faktor selain 2 dan 5, desimalnya <strong>berulang</strong>: 1/3 = 0,333…, 1/6 = 0,1666….',
      'Desimal → pecahan: banyak angka di belakang koma menentukan penyebut (1 angka → 10, 2 angka → 100, 3 angka → 1000), lalu <strong>sederhanakan</strong> dengan FPB.',
    ],
    nextLabel: 'Lanjut: Buktikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji pernyataan dengan temuan, lalu membandingkannya dengan dugaan dan hipotesis awal.',
    guru: 'Minta murid membuktikan setiap pernyataan dengan aturan yang ditemukan (koma sejajar, jumlah angka desimal, geser koma, penyebut 10/100/1000), bukan sekadar menebak. Bahas miskonsepsi "perkalian selalu memperbesar".',
    judulA: 'A. Benar atau salah?',
    opsiPernyataan: [
      { id: 'benar', label: '✓ Benar' },
      { id: 'salah', label: '✗ Salah' },
    ],
    pernyataan: [
      {
        id: 'v1',
        teks: 'Hasil perkalian selalu lebih besar daripada bilangan yang dikalikan.',
        correct: 'salah',
        explanation: 'Contoh penyangkal: 0,5 × 0,4 = 0,2, lebih kecil daripada 0,5 maupun 0,4.',
      },
      {
        id: 'v2',
        teks: '0,5 × 0,5 = 2,5',
        correct: 'salah',
        cek: { a: '0,5', op: '×', b: '0,5', klaim: '2,5' },
        explanation: '5 × 5 = 25, dengan 1 + 1 = 2 angka di belakang koma: 0,5 × 0,5 = 0,25.',
      },
      {
        id: 'v3',
        teks: 'Membagi dengan 0,5 hasilnya sama dengan mengalikan dengan 2.',
        correct: 'benar',
        explanation: 'Ada dua 0,5 di dalam setiap 1, misalnya 3 : 0,5 = 30 : 5 = 6 = 3 × 2.',
      },
      {
        id: 'v4',
        teks: '1,2 + 0,35 = 1,55',
        correct: 'benar',
        cek: { a: '1,2', op: '+', b: '0,35', klaim: '1,55' },
        explanation: '1,20 + 0,35 = 1,55 dengan koma sejajar.',
      },
      {
        id: 'v5',
        teks: '0,7 + 0,6 = 0,13',
        correct: 'salah',
        cek: { a: '0,7', op: '+', b: '0,6', klaim: '0,13' },
        explanation: '7 persepuluh + 6 persepuluh = 13 persepuluh = 1,3.',
      },
      {
        id: 'v6',
        teks: '0,4 = 4/100',
        correct: 'salah',
        konversi: { soal: '0,4', klaim: '4/100' },
        explanation: 'Satu angka di belakang koma → penyebut 10: 0,4 = 4/10 = 2/5.',
      },
      {
        id: 'v7',
        teks: '1/8 = 0,125',
        correct: 'benar',
        konversi: { soal: '1/8', klaim: '0,125' },
        explanation: '1/8 = 125/1000 = 0,125.',
      },
    ],
    judulB: 'B. Bandingkan dengan dugaanmu',
    nextLabel: 'Lanjut: Tarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Merumuskan aturan operasi hitung bilangan desimal dan konversi pecahan–desimal.',
    guru: 'Minta beberapa pasangan membacakan kesimpulannya dengan kalimat sendiri sebelum memeriksa. Tuliskan rangkuman di papan tulis.',
    instruksi:
      'Lengkapi setiap kalimat dengan memilih potongan yang tepat. Setiap potongan hanya dipakai sekali, dan ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      {
        id: 'g1',
        awal: 'Saat menjumlahkan atau mengurangkan bilangan desimal secara bersusun,',
        correct: 'b1',
      },
      {
        id: 'g2',
        awal: 'Pada perkalian desimal, banyak angka di belakang koma hasil kali sama dengan',
        correct: 'b2',
      },
      { id: 'g3', awal: 'Pada pembagian desimal, pembagi dan yang dibagi', correct: 'b3' },
      { id: 'g4', awal: 'Untuk mengubah pecahan menjadi desimal,', correct: 'b4' },
      { id: 'g5', awal: 'Untuk mengubah desimal menjadi pecahan,', correct: 'b5' },
      {
        id: 'g6',
        awal: 'Pecahan yang penyebutnya tidak bisa dijadikan 10, 100, atau 1000',
        correct: 'b6',
      },
    ],
    bank: [
      { id: 'b1', teks: 'koma disejajarkan dan nol pengisi ditambahkan bila perlu.' },
      { id: 'b2', teks: 'jumlah banyak angka di belakang koma kedua bilangan.' },
      { id: 'b3', teks: 'dikali 10, 100, … yang sama sampai pembaginya bilangan bulat.' },
      {
        id: 'b4',
        teks: 'jadikan penyebutnya 10, 100, atau 1000, atau hitung pembilang : penyebut.',
      },
      {
        id: 'b5',
        teks: 'tulis dengan penyebut 10ⁿ sesuai banyak angka desimal, lalu sederhanakan.',
      },
      { id: 'b6', teks: 'menghasilkan desimal berulang, mis. 1/3 = 0,333….' },
      { id: 'x1', teks: 'angka paling kanan disejajarkan tanpa memperhatikan koma.' },
      { id: 'x2', teks: 'tulis pembilang, koma, lalu penyebutnya (3/4 = 3,4).' },
      { id: 'x3', teks: 'hanya pembaginya yang dikali 10.' },
    ],
    rangkuman: [
      '<strong>+ dan −</strong>: koma sejajar, nol pengisi bila perlu. Contoh: 1,25 + 0,80 = 2,05; 2,00 − 0,75 = 1,25.',
      '<strong>×</strong>: kalikan tanpa koma, angka desimal hasil = jumlah angka desimal. Contoh: 0,3 × 0,4 = 0,12.',
      '<strong>:</strong>: geser koma pembagi & yang dibagi bersama. Contoh: 1,5 : 0,3 = 15 : 3 = 5.',
      '<strong>Pecahan → desimal</strong>: 3/4 = 75/100 = 0,75; 1/3 = 0,333… (berulang).',
      '<strong>Desimal → pecahan</strong>: 0,125 = 125/1000 = 1/8.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Delapan soal diambil acak dari bank (komposisi per jenis).
     jenis 'hitung' → diagnosaOperasiDesimal; 'keDesimal' /
     'kePecahan' → diagnosaKonversiPD.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan operasi hitung desimal dan konversi pecahan–desimal untuk menyelesaikan masalah belanja, ukuran, takaran, dan olahraga.',
    guru: 'Setiap murid mendapat soal acak yang berbeda. Minta murid menuliskan kalimat matematikanya di buku sebelum mengetik jawaban. Harga ditulis dalam ribuan rupiah agar tidak tertukar dengan pemisah desimal.',
    instruksi:
      'Tulis kalimat matematikanya di bukumu, lalu ketik hasilnya. Gunakan koma untuk desimal (mis. 2,05) dan garis miring untuk pecahan (mis. 3/4 atau 1 1/4).',
    banyak: 8,
    komposisi: { input: 6, choice: 2 },
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: 'gerak',
        jenis: 'hitung',
        a: '1,25',
        op: '+',
        b: '0,8',
        satuan: 'km',
        cerita: 'Dina berlari 1,25 km pada pagi hari dan 0,8 km pada sore hari.',
        pertanyaan: 'Berapa kilometer jarak lari Dina hari itu?',
        hints: ['Jarak total → dijumlahkan: 1,25 + 0,8.', 'Sejajarkan koma: 1,25 + 0,80.'],
        reveal: '1,25 + 0,80 = 2,05, jadi Dina berlari 2,05 km.',
        explanation: 'Koma sejajar mencegah hasil keliru 1,33.',
      },
      {
        id: 't2',
        type: 'input',
        konteks: 'ukur',
        jenis: 'hitung',
        a: '5',
        op: '−',
        b: '1,35',
        satuan: 'm',
        cerita: 'Pita sepanjang 5 m dipotong 1,35 m untuk menghias stand.',
        pertanyaan: 'Berapa meter sisa pita?',
        hints: ['Sisa → dikurangi: 5 − 1,35.', 'Tulis 5 sebagai 5,00.'],
        reveal: '5,00 − 1,35 = 3,65, jadi sisa pita 3,65 m.',
        explanation: 'Bilangan bulat 5 ditulis 5,00 agar komanya sejajar.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: 'belanja',
        jenis: 'hitung',
        a: '2,5',
        op: '×',
        b: '12,4',
        satuan: 'ribu rupiah',
        cerita: 'Harga beras di koperasi 12,4 ribu rupiah per kg. Ibu kantin membeli 2,5 kg.',
        pertanyaan: 'Berapa ribu rupiah yang harus dibayar?',
        hints: [
          'Harga total = berat × harga per kg = 2,5 × 12,4.',
          '25 × 124 = 3.100; ada 2 angka di belakang koma.',
        ],
        reveal: '2,5 × 12,4 = 31, jadi harganya 31 ribu rupiah (Rp31.000).',
        explanation: '3.100 dengan 2 angka di belakang koma menjadi 31,00 = 31.',
      },
      {
        id: 't4',
        type: 'input',
        konteks: 'gerak',
        jenis: 'hitung',
        a: '45,5',
        op: ':',
        b: '1,3',
        satuan: 'km per liter',
        cerita: 'Motor Pak Udin menempuh 45,5 km dengan 1,3 liter bensin.',
        pertanyaan: 'Berapa kilometer yang ditempuh dengan 1 liter bensin?',
        hints: ['Jarak per liter = 45,5 : 1,3.', 'Kalikan keduanya dengan 10: 455 : 13.'],
        reveal: '45,5 : 1,3 = 455 : 13 = 35, jadi 35 km per liter.',
        explanation: 'Koma pembagi dan yang dibagi digeser bersama satu tempat.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: 'ukur',
        jenis: 'hitung',
        a: '1,2',
        op: '×',
        b: '0,8',
        satuan: 'm²',
        cerita: 'Taplak meja stand berbentuk persegi panjang berukuran 1,2 m × 0,8 m.',
        pertanyaan: 'Berapa meter persegi luas taplak itu?',
        hints: [
          'Luas = panjang × lebar = 1,2 × 0,8.',
          '12 × 8 = 96; ada 1 + 1 = 2 angka di belakang koma.',
        ],
        reveal: '1,2 × 0,8 = 0,96, jadi luasnya 0,96 m².',
        explanation: 'Hasil kali dengan 0,8 lebih kecil daripada 1,2.',
      },
      {
        id: 't6',
        type: 'input',
        konteks: 'takar',
        jenis: 'hitung',
        a: '2,4',
        op: ':',
        b: '0,2',
        satuan: 'gelas',
        cerita: 'Jus jeruk 2,4 L dituang ke gelas-gelas berisi 0,2 L.',
        pertanyaan: 'Berapa gelas yang terisi?',
        hints: ['Banyak gelas = 2,4 : 0,2.', 'Kalikan keduanya dengan 10: 24 : 2.'],
        reveal: '2,4 : 0,2 = 24 : 2 = 12, jadi 12 gelas.',
        explanation: 'Ada 12 kali 0,2 L di dalam 2,4 L.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: 'gerak',
        jenis: 'hitung',
        a: '15,2',
        op: '−',
        b: '14,75',
        satuan: 'detik',
        cerita:
          'Minggu lalu Budi berlari 100 m dalam 15,2 detik. Minggu ini catatan waktunya 14,75 detik.',
        pertanyaan: 'Berapa detik Budi lebih cepat dibanding minggu lalu?',
        hints: ['Selisih waktu = 15,2 − 14,75.', 'Tulis 15,2 sebagai 15,20.'],
        reveal: '15,20 − 14,75 = 0,45, jadi Budi 0,45 detik lebih cepat.',
        explanation: 'Nol pengisi membuat perseratusan bisa dikurangkan kolom demi kolom.',
      },
      {
        id: 't8',
        type: 'input',
        konteks: 'ukur',
        jenis: 'hitung',
        a: '3',
        op: '×',
        b: '0,75',
        satuan: 'm',
        cerita: 'Tim dekorasi membutuhkan 3 potong kain yang masing-masing panjangnya 0,75 m.',
        pertanyaan: 'Berapa meter kain yang dibutuhkan seluruhnya?',
        hints: ['3 × 0,75 = 0,75 + 0,75 + 0,75.', '3 × 75 = 225; ada 2 angka di belakang koma.'],
        reveal: '3 × 0,75 = 2,25, jadi dibutuhkan 2,25 m kain.',
        explanation: 'Mengalikan dengan bilangan bulat sama dengan penjumlahan berulang.',
      },
      {
        id: 't9',
        type: 'input',
        konteks: 'dapur',
        jenis: 'keDesimal',
        soal: '3/8',
        satuan: 'kg',
        cerita: 'Resep pizza meminta 3/8 kg keju parut. Timbangan dapur hanya menampilkan desimal.',
        pertanyaan: 'Angka berapa (dalam kg) yang harus muncul di timbangan?',
        hints: ['Jadikan penyebutnya 1000: 8 × 125 = 1000.', '3/8 = 375/1000.'],
        reveal: '3/8 = 375/1000 = 0,375, jadi timbangan menunjukkan 0,375 kg.',
        explanation: 'Penyebut 1000 → tiga angka di belakang koma.',
      },
      {
        id: 't10',
        type: 'input',
        konteks: 'gerak',
        jenis: 'keDesimal',
        soal: '1 3/4',
        satuan: 'jam',
        cerita:
          'Lomba jalan sehat berlangsung selama 1 3/4 jam. Panitia menulis lamanya dalam bentuk desimal.',
        pertanyaan: 'Berapa jam lama lomba dalam bentuk desimal?',
        hints: ['1 3/4 = 1 + 3/4.', '3/4 = 75/100 = 0,75.'],
        reveal: '1 3/4 = 1 + 0,75 = 1,75 jam.',
        explanation:
          'Bagian bulat tetap di depan koma; bagian pecahan menjadi angka di belakang koma.',
      },
      {
        id: 't11',
        type: 'input',
        konteks: 'gerak',
        jenis: 'kePecahan',
        soal: '0,6',
        cerita: 'Hasil survei: 0,6 bagian murid kelas VII memilih voli sebagai ekstrakurikuler.',
        pertanyaan: 'Tulis 0,6 sebagai pecahan paling sederhana.',
        hints: ['0,6 = 6/10.', 'Bagi pembilang dan penyebut dengan 2.'],
        reveal: '0,6 = 6/10 = 3/5, jadi 3/5 bagian murid memilih voli.',
        explanation: 'Satu angka di belakang koma → penyebut 10, lalu disederhanakan.',
      },
      {
        id: 't12',
        type: 'input',
        konteks: 'takar',
        jenis: 'kePecahan',
        soal: '1,25',
        cerita:
          'Label botol minyak goreng menulis isi 1,25 L. Nenek lebih suka menyebutnya dalam pecahan.',
        pertanyaan: 'Tulis 1,25 sebagai pecahan paling sederhana (boleh pecahan campuran).',
        hints: ['1,25 = 125/100 = 1 25/100.', 'FPB(25, 100) = 25.'],
        reveal: '1,25 = 1 25/100 = 1 1/4, jadi isinya 1 1/4 L.',
        explanation: 'Boleh juga ditulis 5/4.',
      },
      {
        id: 'c1',
        type: 'choice',
        konteks: 'takar',
        cerita: 'Botol air 2 L akan dituang ke gelas-gelas berisi 0,25 L.',
        pertanyaan: 'Kalimat matematika mana yang tepat untuk menghitung banyak gelas?',
        options: [
          { id: 'a', label: '2 : 0,25' },
          { id: 'b', label: '2 × 0,25' },
          { id: 'c', label: '0,25 : 2' },
          { id: 'd', label: '2 − 0,25' },
        ],
        correct: 'a',
        explanation: '"Ada berapa 0,25 di dalam 2?" → 2 : 0,25 = 200 : 25 = 8 gelas.',
      },
      {
        id: 'c2',
        type: 'choice',
        konteks: 'ukur',
        cerita: 'Kartu nama berukuran 0,4 dm × 0,2 dm.',
        pertanyaan: 'Berapa desimeter persegi luas kartu nama itu?',
        jenis: 'hitung',
        a: '0,4',
        op: '×',
        b: '0,2',
        options: [
          { id: 'a', label: '0,08 dm²' },
          { id: 'b', label: '0,8 dm²' },
          { id: 'c', label: '0,6 dm²' },
          { id: 'd', label: '8 dm²' },
        ],
        correct: 'a',
        explanation: '4 × 2 = 8; banyak angka di belakang koma 1 + 1 = 2 → 0,08 dm².',
      },
      {
        id: 'c3',
        type: 'choice',
        konteks: 'belanja',
        cerita: 'Rani membeli 2/5 kg cabai, sedangkan Bima membeli 0,45 kg cabai.',
        pertanyaan: 'Pernyataan manakah yang tepat?',
        options: [
          { id: 'a', label: 'Bima membeli lebih banyak, karena 2/5 = 0,4 < 0,45.' },
          { id: 'b', label: 'Rani membeli lebih banyak, karena 2/5 = 2,5 > 0,45.' },
          { id: 'c', label: 'Keduanya sama banyak, karena 2/5 = 0,45.' },
          { id: 'd', label: 'Rani membeli lebih banyak, karena 2/5 = 0,25 dan 25 > 0,45.' },
        ],
        correct: 'a',
        explanation: '2/5 = 4/10 = 0,40. Bandingkan 0,40 dengan 0,45: 0,45 lebih besar.',
      },
      {
        id: 'c4',
        type: 'choice',
        konteks: 'dapur',
        cerita: 'Resep kue meminta 0,2 kg gula halus. Ibu memakai sendok takar berbentuk pecahan.',
        pertanyaan: 'Pecahan paling sederhana yang sama dengan 0,2 adalah …',
        jenis: 'kePecahan',
        soal: '0,2',
        options: [
          { id: 'a', label: '1/5' },
          { id: 'b', label: '2/100' },
          { id: 'c', label: '1/2' },
          { id: 'd', label: '2/10' },
        ],
        correct: 'a',
        explanation: '0,2 = 2/10 = 1/5. 2/10 nilainya sama tetapi belum paling sederhana.',
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
    goal: 'Merefleksikan proses menemukan aturan operasi hitung desimal dan konversi pecahan–desimal.',
    guru: 'Beri waktu hening 3 menit untuk menulis. Jawaban penilaian diri dapat menjadi dasar pengelompokan pada pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri mengapa 0,3 × 0,4 hasilnya 0,12, bukan 1,2.',
        placeholder: 'Hasilnya 0,12 karena …',
      },
      {
        id: 'r2',
        teks: 'Buat satu cerita sendiri tentang belanja, takaran, atau ukuran yang memakai desimal atau pecahan, lalu tulis kalimat matematika dan hasilnya.',
        placeholder: 'Ceritaku: … Kalimat matematikanya: …',
      },
      {
        id: 'r3',
        teks: 'Bagian mana yang masih membingungkan atau ingin kamu pelajari lebih lanjut?',
        placeholder: 'Aku masih bingung tentang …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menghitung desimal dan mengubah pecahan ↔ desimal sekarang?',
    diriOpsi: [
      { id: 'yakin', label: '🌟 Yakin — aku bisa menjelaskan ke teman' },
      { id: 'cukup', label: '👍 Cukup yakin — sesekali masih perlu melihat catatan' },
      { id: 'ragu', label: '🤔 Masih ragu — terutama soal letak koma' },
      { id: 'belum', label: '🙋 Belum paham — aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, kamu menemukannya sendiri!',
    teks: 'Kamu telah menemukan aturan operasi hitung bilangan desimal dan cara mengubah pecahan ↔ desimal, lalu memakainya untuk menyelesaikan masalah belanja, ukuran, takaran, dan olahraga.',
    contoh: [
      {
        konteks: 'belanja',
        teks: '1,25 + 0,8 = 2,05',
        keterangan: 'berat gula dan terigu 2,05 kg',
      },
      { konteks: 'ukur', teks: '0,3 × 0,4 = 0,12', keterangan: 'luas kain flanel 0,12 m²' },
      { konteks: 'takar', teks: '1,5 : 0,3 = 5', keterangan: 'sirup cukup untuk 5 gelas' },
      { konteks: 'dapur', teks: '3/4 = 0,75', keterangan: 'mentega 0,75 kg di timbangan' },
    ],
    capaian: [
      'Menjumlahkan dan mengurangkan desimal dengan koma sejajar.',
      'Menentukan letak koma pada hasil kali dan menggeser koma pada pembagian.',
      'Mengubah pecahan menjadi desimal (berhenti maupun berulang) dan desimal menjadi pecahan paling sederhana.',
      'Memilih operasi yang tepat dan menafsirkan hasilnya dalam masalah sehari-hari.',
    ],
  },
};
