'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Perkalian & Pembagian Pecahan dalam Masalah Kontekstual
   — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menerapkan operasi perkalian dan pembagian pada bilangan rasional
   (pecahan) untuk menyelesaikan masalah kontekstual.

   Gagasan kunci yang dibangun di seluruh modul:
     • bilangan bulat × pecahan = penjumlahan berulang; hanya pembilang
       yang dikalikan (3 × 2/5 = 6/5), penyebut = ukuran potongan tetap;
     • pecahan × pecahan = "bagian dari bagian" (2/3 × 3/4 = 2/3 dari
       3/4); pembilang × pembilang, penyebut × penyebut — penyebut TIDAK
       perlu disamakan;
     • a : c/d = "berapa banyak c/d di dalam a" = a × d/c (kali
       kebalikan pembagi); hasilnya bisa memuat sisa pecahan;
     • pecahan campuran diubah ke pecahan biasa dulu; tanda hasil
       mengikuti aturan tanda bilangan bulat (MPI 2.2);
     • miskonsepsi yang dilawan: "perkalian selalu memperbesar,
       pembagian selalu memperkecil", pembagi tidak dibalik, membalik
       bilangan pertama, menyamakan penyebut lalu mempertahankannya,
       mengalikan bilangan bulat ke pembilang DAN penyebut, mengalikan
       bagian bulat & pecahan secara terpisah, lupa tanda negatif.

   Model pembelajaran: COOPERATIVE LEARNING tipe JIGSAW (sintaks Arends,
   dengan skor tim). Pemetaan sintaks ke tahap media:

     Fase 1 — Menyampaikan tujuan & memotivasi ........ 'tujuan'
     Fase 2 — Menyajikan informasi ..................... 'informasi'
     Fase 3 — Mengorganisasikan murid ke tim asal ...... 'tim'
     Fase 4 — Membimbing kelompok bekerja & belajar:
              a. kelompok ahli + mengajar tim asal ..... 'ahli'
              b. misi tim asal ......................... 'misiAjar',
                                                         'misiHitung'
              c. diskusi tim ........................... 'misiDiskusi'
     Fase 5 — Evaluasi (individu) ...................... 'kuis'
     Fase 6 — Memberikan penghargaan ................... 'penghargaan'
     Penutup ........................................... 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, tim asal heterogen 3–4 murid,
   satu perangkat per tim; kuis dikerjakan per murid). Konteks tunggal:
   "Dapur Koperasi Kelas" menyiapkan pesanan Bazar Sekolah.
     1. Tujuan      (6')  — dua pesanan bazar: {1/2} dari {3/4} kg tepung
                            dan 6 kg gula dalam kantong {1/2} kg. Murid
                            menduga: hasilnya lebih besar atau lebih kecil?
     2. Informasi   (10') — model luas {1/2} × {3/4} dan pita kelompok
                            6 : {1/2}; pertanyaan penuntun → aturan umum
                            & cek dugaan.
     3. Tim asal    (5')  — nama tim, anggota, kesepakatan; kartu AHLI
                            (4 strategi) dibagikan acak.
     4. Ahli        (17') — Jigsaw: ahli sejenis dari tim lain berkumpul
                            (kelompok ahli), menjelajah contoh interaktif
                            & kalimat kunci, lalu kembali MEMANDU tim asal
                            mengerjakan dua soal stasiunnya.
     5. Misi 1      (10') — "Operasi Apa?": lima pesanan. Pilih kalimat
                            matematika → pilih ahli yang memimpin → pilih
                            hasil (pengecoh miskonsepsi).
     6. Misi 2      (10') — "Hitung Pesanan": empat masalah isian dengan
                            diagnosa miskonsepsi & langkah penyelesaian.
     7. Misi 3      (7')  — "Cek Pendapat Teman": pernyataan Benar/Salah
                            + catatan Juru Bicara.
     8. Kuis        (8')  — kuis individu: enam soal diambil acak dari
                            bank sepuluh soal (pilihan ganda & isian).
     9. Penghargaan (3')  — poin tim (50% misi + 50% kuis) → predikat.
    10. Refleksi    (4')  — refleksi konsep & kerja sama, penilaian diri.

   Penulisan bilangan: nilai ditulis sebagai teks '3/4', '2 1/2',
   '-3/4', atau bulat '5' (diurai engine seksi 62/63). Di dalam teks
   tampilan, token {3/4} atau {1 1/2} dirender sebagai pecahan bersusun
   oleh renderFracText(). Penanda %HASIL% pada `makna` diganti hasil
   operasi oleh app.js.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar". app.js mengacaknya SEKALI saat state disiapkan
   (ensureShuffledOrder / ensureSortStates / shuffleArray /
   assignCoopRoles dari shared/engine.js), sehingga tiap tim dan tiap
   Reset mendapat urutan berbeda — termasuk dugaan, penuntun, kartu ahli,
   pilihan hasil (opsiKaliBagiPecahan), kalimat matematika, ahli
   pemimpin, pernyataan diskusi, soal kuis yang terpilih beserta
   opsinya, dan penilaian diri.

   Konsistensi kunci jawaban diuji tests/mpi-2.4-data.test.js terhadap
   engine seksi 63 (kaliBagiPecahan, opsiKaliBagiPecahan,
   jenisOperasiKaliBagi, …).
   ============================================================ */

var CL = 'Cooperative Learning (Jigsaw)';

/*
 * Kartu ahli Jigsaw. id = jenis operasi dari jenisOperasiKaliBagi()
 * (engine seksi 63), sehingga ahli yang "berlaku" untuk suatu soal
 * dapat ditentukan otomatis. Dipakai juga sebagai daftar peran untuk
 * coopRoleAssignment / buildCoopTeamCard (seksi 12).
 */
var STRATEGI_KALI_BAGI = [
  {
    id: 'kaliBulat',
    ikon: '🔁',
    nama: 'Ahli Kali Bilangan Bulat',
    ringkas: 'n × {a/b} = penjumlahan berulang',
    tugas: 'Mengajarkan perkalian bilangan bulat dengan pecahan sebagai penjumlahan berulang.',
    kunci:
      'Bilangan bulat × pecahan adalah penjumlahan berulang: 3 × {2/5} = {2/5} + {2/5} + {2/5}. Kalikan bilangan bulat dengan PEMBILANG saja; penyebut (ukuran potongan) tetap.',
  },
  {
    id: 'kaliPecahan',
    ikon: '🔲',
    nama: 'Ahli Bagian dari Bagian',
    ringkas: '{a/b} × {c/d} = {a/b} bagian dari {c/d}',
    tugas: 'Mengajarkan perkalian pecahan dengan pecahan memakai model luas.',
    kunci:
      '{a/b} × {c/d} berarti {a/b} BAGIAN DARI {c/d}. Kalikan pembilang dengan pembilang dan penyebut dengan penyebut — penyebut tidak perlu disamakan.',
  },
  {
    id: 'bagi',
    ikon: '📏',
    nama: 'Ahli Pembagian',
    ringkas: 'a : {c/d} = a × {d/c}',
    tugas: 'Mengajarkan pembagian oleh pecahan sebagai "berapa banyak … di dalam …".',
    kunci:
      'a : {c/d} berarti BERAPA BANYAK {c/d} DI DALAM a. Hasilnya sama dengan a × {d/c}: biarkan yang dibagi, BALIK pembaginya, lalu kalikan.',
  },
  {
    id: 'campuranTanda',
    ikon: '🔄',
    nama: 'Ahli Campuran & Tanda',
    ringkas: 'Campuran → biasa, tentukan tanda',
    tugas: 'Mengajarkan cara mengolah pecahan campuran dan pecahan negatif.',
    kunci:
      'Ubah pecahan campuran menjadi pecahan biasa dulu ({1 1/2} = {3/2}). Tentukan tanda seperti bilangan bulat: tanda sama → positif, tanda berbeda → negatif. Sederhanakan hasilnya.',
  },
];

var DATA = {
  meta: {
    judul: 'Perkalian & Pembagian Pecahan dalam Masalah Kontekstual',
  },

  tahap: [
    { id: 'tujuan', label: 'Tujuan' },
    { id: 'informasi', label: 'Informasi' },
    { id: 'tim', label: 'Tim Asal' },
    { id: 'ahli', label: 'Ahli' },
    { id: 'misiAjar', label: 'Misi 1' },
    { id: 'misiHitung', label: 'Misi 2' },
    { id: 'misiDiskusi', label: 'Misi 3' },
    { id: 'kuis', label: 'Kuis' },
    { id: 'penghargaan', label: 'Penghargaan' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* ---------- Fase 1: tujuan & motivasi ---------- */
  tujuan: {
    kicker: 'Tahap 1 · Tujuan & Motivasi',
    goal: 'Mengenali tujuan belajar dan menduga hasil perkalian & pembagian pecahan.',
    syntax: CL + ' · Fase 1',
    guru: 'Ceritakan pesanan bazar dengan antusias. Minta murid menduga sendiri (1 menit), lalu bandingkan dengan teman sebangku. Banyak murid mengira "dikali pasti makin besar" dan "dibagi pasti makin kecil" — jangan dikoreksi dulu; dugaan diuji pada tahap Informasi.',
    judul: 'Dapur Koperasi Kelas: Pesanan Bazar',
    pengantar:
      'Kelas kalian membuka stan kue di Bazar Sekolah. Dapur koperasi menerima dua catatan pesanan dari Bu Sari, wali kelas:',
    catatan: [
      {
        ikon: '🥣',
        judul: 'Tepung untuk kue kering',
        teks: 'Di lemari ada {3/4} kg tepung. Pakai {1/2} bagiannya untuk kue kering.',
      },
      {
        ikon: '🛍️',
        judul: 'Gula dalam kantong',
        teks: 'Ada 6 kg gula pasir. Masukkan ke kantong kecil yang masing-masing berisi {1/2} kg.',
      },
    ],
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Menerapkan operasi perkalian dan pembagian pada bilangan rasional (pecahan) untuk menyelesaikan masalah kontekstual.',
    kriteria: [
      'Menentukan operasi (× atau :) dan kalimat matematika yang tepat dari sebuah masalah.',
      'Menghitung hasil kali pecahan dengan bilangan bulat maupun dengan pecahan.',
      'Menghitung hasil bagi dengan mengalikan kebalikan pembagi.',
      'Mengolah pecahan campuran dan pecahan negatif, lalu menyederhanakan hasilnya.',
      'Menjelaskan arti hasil perhitungan dalam konteks masalah.',
    ],
    dugaan: [
      {
        id: 'kali',
        tanya:
          'Tepung yang dipakai adalah {1/2} × {3/4} kg. Menurut dugaanmu, hasilnya <strong>lebih besar</strong> atau <strong>lebih kecil</strong> daripada {3/4} kg?',
        opsi: [
          { id: 'besar', label: 'Lebih besar daripada {3/4} kg' },
          { id: 'kecil', label: 'Lebih kecil daripada {3/4} kg' },
          { id: 'sama', label: 'Sama dengan {3/4} kg' },
        ],
      },
      {
        id: 'bagi',
        tanya:
          'Banyak kantong adalah 6 : {1/2}. Menurut dugaanmu, hasilnya <strong>lebih besar</strong> atau <strong>lebih kecil</strong> daripada 6?',
        opsi: [
          { id: 'besar', label: 'Lebih besar daripada 6' },
          { id: 'kecil', label: 'Lebih kecil daripada 6' },
          { id: 'sama', label: 'Sama dengan 6' },
        ],
      },
    ],
    kunciDugaan: { kali: 'kecil', bagi: 'besar' },
    alasanLabel: 'Bagaimana caramu menduga? Tulis alasanmu dengan singkat.',
    alasanPlaceholder: 'Contoh: Menurutku hasilnya lebih … karena …',
    catatanDugaan:
      'Dugaanmu belum dinilai. Kalian akan mengujinya dengan model luas dan pita pecahan pada tahap berikutnya.',
    nextLabel: 'Uji Dugaan →',
  },

  /* ---------- Fase 2: menyajikan informasi ---------- */
  informasi: {
    kicker: 'Tahap 2 · Model Luas & Pita Kelompok',
    goal: 'Menemukan makna perkalian pecahan ("bagian dari") dan pembagian pecahan ("berapa banyak … di dalam …").',
    syntax: CL + ' · Fase 2',
    guru: 'Tampilkan kedua gambar di layar. Tanyakan: "Kalau kita mengambil setengah dari sesuatu, apakah hasilnya bertambah?" dan "Berapa kantong setengah kilo yang muat dalam 1 kg?" Setelah semua pertanyaan penuntun terjawab, tulis aturan umum di papan dan umumkan bahwa empat cara menghitung akan dipelajari oleh para ahli.',
    kali: {
      judul: '🥣 {1/2} dari {3/4} kg tepung',
      teks: 'Persegi melambangkan 1 kg. Kolom oranye menunjukkan {3/4} kg. Baris biru mengambil {1/2} bagiannya. Kotak ungu terarsir dua kali.',
      a: '1/2',
      b: '3/4',
    },
    bagi: {
      judul: '🛍️ Kantong {1/2} kg di dalam 6 kg gula',
      teks: 'Setiap kotak pita melambangkan 1 kg. Setiap warna adalah satu kantong {1/2} kg.',
      total: '6',
      ukuran: '1/2',
    },
    penuntun: [
      {
        id: 'p1',
        tanya: 'Pada model luas, berapa bagian persegi yang terarsir dua kali (ungu)?',
        opsi: [
          { id: 'a', label: '{3/8} — 3 dari 8 kotak' },
          { id: 'b', label: '{3/4} — 3 dari 4 kolom' },
          { id: 'c', label: '{1/2} — 1 dari 2 baris' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! {1/2} × {3/4} = {3/8}. Perhatikan: 1 × 3 = 3 (pembilang) dan 2 × 4 = 8 (penyebut).',
          b: '{3/4} adalah seluruh kolom oranye — tepung yang ada di lemari. Yang dipakai hanya sebagian darinya.',
          c: '{1/2} adalah bagian yang diambil, tetapi diambil dari {3/4}, bukan dari 1 kg. Hitung kotak ungunya.',
        },
      },
      {
        id: 'p2',
        tanya: 'Mengapa {1/2} × {3/4} kg lebih kecil daripada {3/4} kg?',
        opsi: [
          {
            id: 'sebagian',
            label: 'Karena kita mengambil sebagian (kurang dari 1 kali) dari {3/4}',
          },
          {
            id: 'selalu',
            label: 'Karena perkalian pecahan selalu menghasilkan bilangan lebih kecil',
          },
          { id: 'penyebut', label: 'Karena penyebutnya bertambah besar' },
        ],
        correct: 'sebagian',
        umpan: {
          sebagian:
            'Benar! Dikali {1/2} berarti mengambil setengahnya. Mengalikan dengan bilangan antara 0 dan 1 membuat hasilnya lebih kecil.',
          selalu:
            'Tidak selalu! 3 × {3/4} = {9/4}, lebih besar dari {3/4}. Hasilnya mengecil hanya jika pengalinya kurang dari 1.',
          penyebut:
            'Penyebutnya memang membesar, tetapi pembilangnya juga bisa membesar. Yang menentukan: kita mengambil sebagian dari {3/4}.',
        },
      },
      {
        id: 'p3',
        tanya: 'Pada pita, ada berapa kantong {1/2} kg di dalam 6 kg gula?',
        opsi: [
          { id: '12', label: '12 kantong' },
          { id: '3', label: '3 kantong' },
          { id: '6', label: '6 kantong' },
        ],
        correct: '12',
        umpan: {
          12: 'Tepat! Setiap 1 kg berisi 2 kantong {1/2} kg, jadi 6 kg berisi 6 × 2 = 12 kantong.',
          3: '3 adalah hasil 6 × {1/2} — itu berarti mengambil setengah dari 6 kg. Hitung berapa kantong yang muat.',
          6: 'Setiap kotak pita (1 kg) berisi dua warna. Hitung lagi semua warnanya.',
        },
      },
      {
        id: 'p4',
        tanya: 'Jadi, 6 : {1/2} = 12. Hasil itu sama dengan …',
        opsi: [
          { id: 'kali2', label: '6 × 2, karena kebalikan {1/2} adalah 2' },
          { id: 'kaliSetengah', label: '6 × {1/2}' },
          { id: 'bagi2', label: '6 : 2' },
        ],
        correct: 'kali2',
        umpan: {
          kali2:
            'Benar! Membagi dengan {1/2} sama dengan mengalikan dengan kebalikannya, yaitu {2/1} = 2. Inilah kunci Ahli Pembagian.',
          kaliSetengah: '6 × {1/2} = 3, bukan 12. Pembaginya perlu DIBALIK dulu.',
          bagi2: '6 : 2 = 3 — artinya membagi menjadi 2 bagian, bukan kantong berukuran {1/2} kg.',
        },
      },
    ],
    aturanJudul: 'Aturan yang kita temukan',
    aturan: [
      '<strong>Perkalian</strong> {a/b} × {c/d} berarti {a/b} bagian dari {c/d}: kalikan pembilang × pembilang dan penyebut × penyebut.',
      '<strong>Pembagian</strong> a : {c/d} berarti berapa banyak {c/d} di dalam a: a : {c/d} = a × {d/c} (kali kebalikan pembagi).',
      'Dikali bilangan antara 0 dan 1 → hasilnya <strong>lebih kecil</strong>; dibagi bilangan antara 0 dan 1 → hasilnya <strong>lebih besar</strong>.',
      'Pecahan campuran diubah menjadi pecahan biasa dulu; tanda hasil mengikuti aturan tanda bilangan bulat.',
      'Selalu <strong>sederhanakan</strong> hasilnya dan artikan kembali dalam konteks soal.',
    ],
    dugaanJudul: 'Cek dugaanmu di Tahap 1',
    nextLabel: 'Bentuk Tim Asal →',
  },

  /* ---------- Fase 3: mengorganisasikan kelompok ---------- */
  tim: {
    kicker: 'Tahap 3 · Bentuk Tim Asal',
    goal: 'Membentuk tim asal, menyepakati aturan kerja sama, dan menerima kartu ahli.',
    syntax: CL + ' · Fase 3',
    guru: 'Bentuk tim asal heterogen berisi 4 murid (boleh 3; seorang anggota memegang dua kartu ahli). Tegaskan prinsip Jigsaw: setiap anggota adalah SATU-SATUNYA ahli strateginya di tim, jadi tim bergantung pada penjelasannya. Skor tim juga bergantung pada kuis SETIAP anggota.',
    namaTimLabel: 'Nama tim asal',
    namaTimPlaceholder: 'Contoh: Tim Bolu Pandan',
    anggotaLabel: 'Nama anggota tim',
    minAnggota: 3,
    maksAnggota: 4,
    kesepakatanJudul: 'Kesepakatan tim (centang semua)',
    kesepakatan: [
      {
        id: 'ahli',
        teks: 'Setiap ahli bertanggung jawab mempelajari strateginya sampai bisa mengajarkannya.',
      },
      {
        id: 'dengar',
        teks: 'Saat seorang ahli mengajar, anggota lain mendengarkan dan boleh bertanya.',
      },
      { id: 'setuju', teks: 'Tombol jawaban baru ditekan setelah semua anggota setuju.' },
      { id: 'bantu', teks: 'Anggota yang sudah paham menjelaskan, bukan menjawabkan.' },
    ],
    acakLabel: '🎲 Bagikan Kartu Ahli',
    acakUlangLabel: '🎲 Bagikan Ulang Kartu Ahli',
    ahliJudul: 'Kartu ahli tim kalian',
    ahliCatatan:
      'Pada tahap berikutnya, setiap ahli berkumpul dengan ahli yang sama dari tim lain, lalu kembali untuk mengajari tim asal.',
    nextLabel: 'Menuju Kelompok Ahli →',
  },

  /* ---------- Fase 4a: kelompok ahli (Jigsaw) ---------- */
  ahli: {
    kicker: 'Tahap 4 · Kelompok Ahli (Jigsaw)',
    goal: 'Menguasai satu strategi perkalian/pembagian pecahan lalu mengajarkannya kepada tim asal.',
    syntax: CL + ' · Fase 4 (Jigsaw)',
    guru: 'Langkah 1 (8 menit): para ahli sejenis dari semua tim berkumpul di meja ahli, menjelajah contoh interaktif, membuka langkah satu per satu, dan berlatih mengucapkan kalimat kunci. Langkah 2 (9 menit): ahli kembali ke tim asal, membuka stasiunnya di perangkat tim, lalu MEMANDU tim mengerjakan dua soal — ahli bertanya, bukan menjawabkan.',
    pengantar:
      'Langkah 1 — di kelompok ahli: jelajahi contoh, buka langkahnya satu per satu, dan hafalkan kalimat kunci. Langkah 2 — di tim asal: buka stasiunmu, ajarkan kalimat kuncinya, lalu pandu tim mengerjakan dua soal.',
    stasiun: [
      {
        id: 'kaliBulat',
        contoh: {
          cerita:
            'Untuk satu loyang puding diperlukan {2/5} liter susu. Berapa liter susu untuk beberapa loyang?',
          a: '3',
          op: '×',
          b: '2/5',
          satuan: 'liter',
        },
        eksplor: {
          jenis: 'kaliBulat',
          pecahan: '2/5',
          min: 1,
          maks: 5,
          awal: 3,
          benda: 'loyang',
        },
        soal: [
          {
            id: 'kb1',
            cerita:
              'Setiap porsi es buah memakai {3/8} kg semangka. Berapa kg semangka untuk 4 porsi?',
            a: '4',
            op: '×',
            b: '3/8',
            satuan: 'kg',
          },
          {
            id: 'kb2',
            cerita:
              'Setiap kue bolu memerlukan {2/3} sendok makan vanili cair. Berapa sendok makan vanili untuk 6 kue?',
            a: '6',
            op: '×',
            b: '2/3',
            satuan: 'sendok makan',
          },
        ],
      },
      {
        id: 'kaliPecahan',
        contoh: {
          cerita:
            'Bu Sari punya {3/4} loyang brownies. {2/3} bagian dari brownies itu dijual di bazar. Berapa loyang yang dijual?',
          a: '2/3',
          op: '×',
          b: '3/4',
          satuan: 'loyang',
        },
        eksplor: { jenis: 'luas' },
        soal: [
          {
            id: 'kp1',
            cerita:
              '{1/2} dari {3/5} kg mentega dipakai untuk kue kering. Berapa kg mentega yang dipakai?',
            a: '1/2',
            op: '×',
            b: '3/5',
            satuan: 'kg',
          },
          {
            id: 'kp2',
            cerita:
              'Kebun sekolah {4/5} bagiannya ditanami sayur. {3/4} bagian kebun sayur itu ditanami bayam. Berapa bagian kebun yang ditanami bayam?',
            a: '3/4',
            op: '×',
            b: '4/5',
            satuan: 'bagian kebun',
          },
        ],
      },
      {
        id: 'bagi',
        contoh: {
          cerita:
            'Ada {3/4} kg gula pasir yang akan dimasukkan ke kantong kecil. Berapa kantong yang terisi?',
          a: '3/4',
          op: ':',
          b: '1/8',
          satuan: 'kantong',
        },
        eksplor: {
          jenis: 'bagi',
          total: '3/4',
          ukuran: ['1/8', '1/4', '3/8', '1/2'],
          awal: '1/8',
          benda: 'kantong',
        },
        soal: [
          {
            id: 'bg1',
            cerita:
              'Dua liter sirup dituang ke gelas yang masing-masing berisi {1/4} liter. Berapa gelas yang terisi?',
            a: '2',
            op: ':',
            b: '1/4',
            satuan: 'gelas',
          },
          {
            id: 'bg2',
            cerita:
              'Pita sepanjang {5/6} m dipotong-potong {1/3} m untuk pita kado. Berapa potong pita yang didapat?',
            a: '5/6',
            op: ':',
            b: '1/3',
            satuan: 'potong',
            catatan: 'Artinya 2 potong utuh dan sisa setengah potong.',
          },
        ],
      },
      {
        id: 'campuranTanda',
        contoh: {
          cerita:
            'Suhu ruang pendingin berubah −{1 1/2} °C setiap jam (turun {1 1/2} °C). Berapa perubahan suhunya dalam {2/3} jam?',
          a: '-1 1/2',
          op: '×',
          b: '2/3',
          satuan: '°C',
        },
        eksplor: { jenis: 'langkah' },
        soal: [
          {
            id: 'ct1',
            cerita:
              'Satu adonan roti memerlukan {2 1/4} cangkir tepung. Dapur hanya membuat {2/3} adonan. Berapa cangkir tepung yang diperlukan?',
            a: '2 1/4',
            op: '×',
            b: '2/3',
            satuan: 'cangkir',
          },
          {
            id: 'ct2',
            cerita:
              'Permukaan air tangki dapur berubah −{3/4} m dalam {1 1/2} jam. Berapa perubahan permukaan air setiap jam?',
            a: '-3/4',
            op: ':',
            b: '1 1/2',
            satuan: 'm per jam',
          },
        ],
      },
    ],
    langkahLabel: 'Buka langkah berikutnya',
    ajarLabel:
      'Ahli sudah mengajarkan kalimat kunci ini kepada tim asal dengan kata-katanya sendiri.',
    nextLabel: 'Mulai Misi 1 →',
  },

  /* ---------- Fase 4b: misi tim asal ---------- */
  misiAjar: {
    kicker: 'Tahap 5 · Misi 1: Operasi Apa?',
    goal: 'Mengubah masalah pesanan menjadi kalimat matematika yang tepat, memilih ahli yang memimpin, lalu menentukan hasilnya.',
    syntax: CL + ' · Fase 4',
    guru: 'Fokus misi ini adalah MEMODELKAN masalah. Bila tim salah memilih kalimat, tanyakan: "Apakah kita mengambil sebagian, menjumlahkan berulang, atau mencari berapa banyak yang muat?" Pastikan ahli yang dipilih benar-benar memimpin perhitungan.',
    ronde: 0,
    langkah: [
      'Pembaca Soal membacakan pesanan.',
      'Tim memilih kalimat matematika yang tepat.',
      'Ahli strategi yang cocok memimpin perhitungan, lalu tim memilih hasilnya.',
    ],
    soal: [
      {
        id: 'm1',
        ikon: '🥜',
        cerita:
          'Pesanan: 5 bungkus kacang bawang, setiap bungkus {3/4} kg. Berapa kg kacang yang perlu dibeli?',
        a: '5',
        op: '×',
        b: '3/4',
        satuan: 'kg',
        kalimat: [
          {
            id: 'benar',
            label: '5 × {3/4}',
            umpan: 'Tepat! {3/4} kg dijumlahkan 5 kali → perkalian bilangan bulat dengan pecahan.',
          },
          {
            id: 'bagi',
            label: '5 : {3/4}',
            umpan:
              'Pembagian dipakai untuk mencari berapa banyak {3/4} di dalam 5. Di sini kita mengumpulkan 5 bungkus — penjumlahan berulang.',
          },
          {
            id: 'tukar',
            label: '{3/4} : 5',
            umpan:
              'Itu membagi {3/4} kg menjadi 5 bagian. Pesanannya justru 5 bungkus masing-masing {3/4} kg.',
          },
          {
            id: 'tambah',
            label: '5 + {3/4}',
            umpan: 'Bukan 5 kg ditambah {3/4} kg. Ada 5 bungkus yang masing-masing {3/4} kg.',
          },
        ],
        makna: 'Jadi, kacang yang perlu dibeli %HASIL% kg.',
      },
      {
        id: 'm2',
        ikon: '🍰',
        cerita:
          'Tersedia {2/3} loyang bolu pandan. {1/2} bagiannya dijual pada pagi hari. Berapa loyang yang terjual pagi itu?',
        a: '1/2',
        op: '×',
        b: '2/3',
        satuan: 'loyang',
        kalimat: [
          {
            id: 'benar',
            label: '{1/2} × {2/3}',
            umpan: 'Tepat! "{1/2} bagian dari {2/3}" → perkalian pecahan dengan pecahan.',
          },
          {
            id: 'bagi',
            label: '{2/3} : {1/2}',
            umpan:
              'Itu mencari berapa banyak {1/2} loyang di dalam {2/3} loyang. Soalnya mengambil setengah BAGIAN dari {2/3} loyang.',
          },
          {
            id: 'kurang',
            label: '{2/3} − {1/2}',
            umpan:
              'Pengurangan berarti mengambil {1/2} loyang utuh. Yang diambil adalah {1/2} BAGIAN dari bolu yang tersisa.',
          },
          {
            id: 'tukar',
            label: '{1/2} : {2/3}',
            umpan: 'Kata "bagian dari" menandakan perkalian, bukan pembagian.',
          },
        ],
        makna: 'Jadi, bolu yang terjual pagi itu %HASIL% loyang.',
      },
      {
        id: 'm3',
        ikon: '🧋',
        cerita:
          'Ada 4 liter es teh. Setiap gelas diisi {2/5} liter. Berapa gelas yang bisa diisi penuh?',
        a: '4',
        op: ':',
        b: '2/5',
        satuan: 'gelas',
        kalimat: [
          {
            id: 'benar',
            label: '4 : {2/5}',
            umpan: 'Tepat! "Berapa banyak {2/5} liter di dalam 4 liter" → pembagian.',
          },
          {
            id: 'kali',
            label: '4 × {2/5}',
            umpan: '4 × {2/5} = {8/5} liter — itu isi 4 gelas, bukan banyak gelas dari 4 liter.',
          },
          {
            id: 'tukar',
            label: '{2/5} : 4',
            umpan: 'Itu membagi {2/5} liter ke 4 gelas. Yang dibagi seharusnya 4 liter es teh.',
          },
          {
            id: 'kurang',
            label: '4 − {2/5}',
            umpan:
              'Pengurangan hanya menuang SATU gelas. Kita ingin tahu berapa gelas yang bisa diisi.',
          },
        ],
        makna: 'Jadi, es teh itu cukup untuk %HASIL% gelas.',
      },
      {
        id: 'm4',
        ikon: '🧀',
        cerita:
          'Ada {3/4} kg keju parut yang dibagi rata untuk 3 loyang pizza mini. Berapa kg keju untuk setiap loyang?',
        a: '3/4',
        op: ':',
        b: '3',
        satuan: 'kg',
        kalimat: [
          {
            id: 'benar',
            label: '{3/4} : 3',
            umpan: 'Tepat! {3/4} kg dibagi rata menjadi 3 bagian → pembagian oleh bilangan bulat.',
          },
          {
            id: 'tukar',
            label: '3 : {3/4}',
            umpan:
              'Itu mencari berapa banyak {3/4} di dalam 3. Yang dibagi seharusnya kejunya ({3/4} kg).',
          },
          {
            id: 'kali',
            label: '{3/4} × 3',
            umpan: 'Perkalian akan menghasilkan keju untuk 3 kali lipat, padahal kejunya dibagi.',
          },
          {
            id: 'kurang',
            label: '3 − {3/4}',
            umpan: 'Tidak ada yang dikurangi. Keju dibagi rata ke 3 loyang.',
          },
        ],
        makna: 'Jadi, setiap loyang mendapat %HASIL% kg keju.',
      },
      {
        id: 'm5',
        ikon: '🍦',
        cerita:
          'Saat dibekukan, suhu adonan es krim berubah −{1 1/4} °C setiap menit. Berapa perubahan suhunya selama {2 2/5} menit?',
        a: '-1 1/4',
        op: '×',
        b: '2 2/5',
        satuan: '°C',
        kalimat: [
          {
            id: 'benar',
            label: '−{1 1/4} × {2 2/5}',
            umpan:
              'Tepat! Perubahan per menit dikali lamanya. Ada pecahan campuran dan bilangan negatif — panggil juga Ahli Campuran & Tanda.',
          },
          {
            id: 'positif',
            label: '{1 1/4} × {2 2/5}',
            umpan: 'Hampir! Suhunya TURUN, jadi perubahannya negatif: −{1 1/4} °C per menit.',
          },
          {
            id: 'bagi',
            label: '−{1 1/4} : {2 2/5}',
            umpan:
              'Pembagian mencari perubahan per menit. Di sini perubahan per menit sudah diketahui.',
          },
          {
            id: 'tambah',
            label: '−{1 1/4} + {2 2/5}',
            umpan:
              'Perubahan −{1 1/4} °C terjadi SETIAP menit, jadi dijumlahkan berulang → dikali.',
          },
        ],
        makna: 'Jadi, suhu adonan berubah %HASIL% °C.',
      },
    ],
    nextLabel: 'Lanjut ke Misi 2 →',
  },

  misiHitung: {
    kicker: 'Tahap 6 · Misi 2: Hitung Pesanan',
    goal: 'Menyelesaikan masalah pesanan dengan menuliskan sendiri hasil perkalian atau pembagian pecahan.',
    syntax: CL + ' · Fase 4',
    guru: 'Setiap soal dipimpin ahli yang cocok (ditunjukkan di atas soal). Bila tim menulis jawaban keliru, umpan balik menyebutkan miskonsepsinya — minta ahli menjelaskan ulang sebelum tim mencoba lagi. Langkah lengkap muncul setelah jawaban benar; minta Juru Bicara membacakannya.',
    ronde: 1,
    langkah: [
      'Pembaca Soal membacakan pesanan; tim menuliskan kalimat matematikanya di kertas.',
      'Ahli yang ditunjuk memimpin perhitungan langkah demi langkah.',
      'Pemeriksa bertanya "Semua setuju?" lalu mengetik jawaban (pecahan biasa, campuran, atau bulat).',
    ],
    soal: [
      {
        id: 'h1',
        ikon: '🍩',
        cerita:
          'Resep donat untuk 12 orang memerlukan {3/4} kg tepung. Pesanan untuk 18 orang berarti {1 1/2} kali resep. Berapa kg tepung yang diperlukan?',
        a: '3/4',
        op: '×',
        b: '1 1/2',
        satuan: 'kg',
        hints: [
          'Ubah {1 1/2} menjadi pecahan biasa: {3/2}.',
          'Kalikan pembilang dengan pembilang, penyebut dengan penyebut: {3/4} × {3/2}.',
        ],
      },
      {
        id: 'h2',
        ikon: '🥥',
        cerita:
          'Ada {2 1/2} liter santan. Santan dimasukkan ke wadah kecil yang masing-masing berisi {1/4} liter. Berapa wadah yang terisi?',
        a: '2 1/2',
        op: ':',
        b: '1/4',
        satuan: 'wadah',
        hints: [
          'Berapa banyak {1/4} di dalam {2 1/2}? Ubah {2 1/2} menjadi {5/2}.',
          'Balik pembaginya: {5/2} : {1/4} = {5/2} × {4/1}.',
        ],
      },
      {
        id: 'h3',
        ikon: '🎀',
        cerita:
          'Pita hiasan stan sepanjang {4 1/2} m dipotong sama panjang menjadi 6 bagian. Berapa meter panjang setiap potongan?',
        a: '4 1/2',
        op: ':',
        b: '6',
        satuan: 'm',
        hints: [
          'Ubah {4 1/2} menjadi {9/2}. Kebalikan dari 6 adalah {1/6}.',
          'Hitung {9/2} × {1/6}, lalu sederhanakan.',
        ],
      },
      {
        id: 'h4',
        ikon: '💰',
        cerita:
          'Selama bazar, kas kelas berubah −{3/5} ratus ribu rupiah setiap hari untuk sewa tenda. Berapa perubahan kas selama {2 1/2} hari?',
        a: '-3/5',
        op: '×',
        b: '2 1/2',
        satuan: 'ratus ribu rupiah',
        hints: [
          'Tanda berbeda (negatif × positif) → hasilnya negatif.',
          'Ubah {2 1/2} menjadi {5/2}, lalu hitung {3/5} × {5/2} dan beri tanda negatif.',
        ],
      },
    ],
    nextLabel: 'Lanjut ke Misi 3 →',
  },

  /* ---------- Fase 4c: diskusi tim ---------- */
  misiDiskusi: {
    kicker: 'Tahap 7 · Misi 3: Cek Pendapat Teman',
    goal: 'Menilai kebenaran pernyataan tentang perkalian & pembagian pecahan serta menjelaskan alasannya.',
    syntax: CL + ' · Fase 4',
    guru: 'Pernyataan berasal dari kesalahan yang sering dibuat murid. Minta tim berdiskusi sampai sepakat sebelum memilih (setiap pernyataan hanya bisa dijawab sekali). Minta ahli yang strateginya paling cocok menjelaskan setiap pernyataan. Pilih dua Juru Bicara secara acak untuk membacakan catatan timnya.',
    ronde: 2,
    pengantar:
      'Panitia bazar dari kelas lain menuliskan pendapat berikut. Diskusikan dengan strategi para ahli, lalu putuskan: Benar atau Salah?',
    opsi: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'd1',
        teks: '"Hasil perkalian selalu lebih besar daripada bilangan yang dikalikan."',
        correct: 'salah',
        cek: { a: '1/2', op: '×', b: '3/4', banding: '3/4', klaim: 'besar' },
        explanation:
          'Tidak selalu. {1/2} × {3/4} = {3/8}, lebih kecil dari {3/4}, karena kita hanya mengambil setengahnya.',
      },
      {
        id: 'd2',
        teks: '"{3/4} : {1/8} = {3/32}, karena pembilang dikali pembilang dan penyebut dikali penyebut."',
        correct: 'salah',
        cek: { a: '3/4', op: ':', b: '1/8', hasil: '3/32' },
        explanation:
          'Pembaginya belum dibalik. {3/4} : {1/8} = {3/4} × {8/1} = 6 — ada 6 kantong {1/8} kg di dalam {3/4} kg.',
      },
      {
        id: 'd3',
        teks: '"Membagi dengan {1/2} sama dengan mengalikan dengan 2."',
        correct: 'benar',
        cek: { a: '5', op: ':', b: '1/2', setara: { op: '×', b: '2' } },
        explanation:
          'Benar. Kebalikan {1/2} adalah 2, jadi a : {1/2} = a × 2. Contoh: 5 : {1/2} = 10 = 5 × 2.',
      },
      {
        id: 'd4',
        teks: '"3 × {2/5} = {6/15}, karena pembilang dan penyebut sama-sama dikali 3."',
        correct: 'salah',
        cek: { a: '3', op: '×', b: '2/5', hasil: '6/15' },
        explanation:
          '{6/15} hanya pecahan senilai dengan {2/5}. Bilangan bulat mengalikan pembilang saja: 3 × {2/5} = {6/5} = {1 1/5}.',
      },
      {
        id: 'd5',
        teks: '"{2 1/2} × {1 1/2} = {2 1/4}, karena 2 × 1 = 2 dan {1/2} × {1/2} = {1/4}."',
        correct: 'salah',
        cek: { a: '2 1/2', op: '×', b: '1 1/2', hasil: '2 1/4' },
        explanation:
          'Bagian bulat dan pecahan tidak boleh dikali terpisah. {5/2} × {3/2} = {15/4} = {3 3/4}.',
      },
      {
        id: 'd6',
        teks: '"−{2/3} × (−{3/4}) = {1/2}."',
        correct: 'benar',
        cek: { a: '-2/3', op: '×', b: '-3/4', hasil: '1/2' },
        explanation: 'Benar. Tanda sama → positif. {2/3} × {3/4} = {6/12} = {1/2}.',
      },
      {
        id: 'd7',
        teks: '"Jika 4 dibagi dengan pecahan yang kurang dari 1, misalnya {2/5}, hasilnya lebih besar daripada 4."',
        correct: 'benar',
        cek: { a: '4', op: ':', b: '2/5', banding: '4', klaim: 'besar' },
        explanation:
          'Benar. 4 : {2/5} = 4 × {5/2} = 10. Banyak potongan kecil yang muat di dalam 4, jadi hasilnya lebih dari 4.',
      },
    ],
    jubirLabel:
      'Catatan Juru Bicara: pernyataan mana yang paling membuat tim kalian berdebat? Strategi ahli mana yang menyelesaikannya?',
    jubirPlaceholder:
      'Contoh: Kami sempat mengira 3 × 2/5 = 6/15, tetapi Ahli Kali Bilangan Bulat …',
    nextLabel: 'Lanjut ke Kuis Individu →',
  },

  /* ---------- Fase 5: evaluasi (kuis individu) ---------- */
  kuis: {
    kicker: 'Tahap 8 · Kuis Individu',
    goal: 'Menunjukkan kemampuan menerapkan perkalian dan pembagian pecahan secara mandiri.',
    syntax: CL + ' · Fase 5',
    guru: 'Kuis dikerjakan SENDIRI-SENDIRI tanpa bantuan tim. Soal diambil acak dari bank sehingga tiap murid mendapat soal berbeda; pilihan jawaban juga diacak. Pilihan ganda hanya bisa dipilih sekali; isian boleh dicoba lagi, tetapi poin hanya untuk benar pada percobaan pertama.',
    instruksi:
      'Kerjakan sendiri. Pilihan ganda hanya dapat dipilih sekali. Tulis isian sebagai pecahan paling sederhana, pecahan campuran, atau bilangan bulat.',
    banyak: 6,
    komposisi: { choice: 3, input: 3 },
    soal: [
      {
        id: 'q1',
        type: 'choice',
        cerita: 'Setiap botol berisi {2/3} liter jus jambu. Panitia menyiapkan 5 botol.',
        pertanyaan: 'Banyak jus seluruhnya adalah … liter.',
        a: '5',
        op: '×',
        b: '2/3',
        satuan: 'liter',
      },
      {
        id: 'q2',
        type: 'choice',
        cerita: 'Ada {5/6} kg kacang tanah. {3/5} bagiannya diolah menjadi bumbu pecel.',
        pertanyaan: 'Kacang yang diolah menjadi bumbu adalah … kg.',
        a: '3/5',
        op: '×',
        b: '5/6',
        satuan: 'kg',
      },
      {
        id: 'q3',
        type: 'choice',
        cerita: '3 kg beras dimasukkan ke kantong-kantong berisi {3/8} kg.',
        pertanyaan: 'Banyak kantong yang terisi adalah …',
        a: '3',
        op: ':',
        b: '3/8',
        satuan: 'kantong',
      },
      {
        id: 'q4',
        type: 'choice',
        cerita: 'Suhu lemari pembeku berubah −{2/3} °C dalam 4 menit dengan laju tetap.',
        pertanyaan: 'Perubahan suhu setiap menit adalah … °C.',
        a: '-2/3',
        op: ':',
        b: '4',
        satuan: '°C',
      },
      {
        id: 'q5',
        type: 'choice',
        cerita: 'Rafi punya pita {1 1/3} m. {3/4} bagiannya dipakai untuk menghias kotak.',
        pertanyaan: 'Panjang pita yang dipakai adalah … m.',
        a: '3/4',
        op: '×',
        b: '1 1/3',
        satuan: 'm',
      },
      {
        id: 'q6',
        type: 'input',
        cerita: 'Lahan bazar seluas {3/4} hektare. {2/5} bagiannya dipakai untuk area parkir.',
        pertanyaan: 'Berapa hektare luas area parkir?',
        a: '2/5',
        op: '×',
        b: '3/4',
        satuan: 'hektare',
        hints: [
          '"{2/5} bagian dari {3/4}" → {2/5} × {3/4}.',
          'Kalikan: (2 × 3)/(5 × 4), lalu sederhanakan.',
        ],
      },
      {
        id: 'q7',
        type: 'input',
        cerita: 'Ada {4 1/2} liter susu. Setiap resep puding memerlukan {3/4} liter susu.',
        pertanyaan: 'Berapa resep puding yang bisa dibuat?',
        a: '4 1/2',
        op: ':',
        b: '3/4',
        satuan: 'resep',
        hints: ['Ubah {4 1/2} menjadi {9/2}.', 'Balik pembagi: {9/2} × {4/3}.'],
      },
      {
        id: 'q8',
        type: 'input',
        cerita: 'Untuk taplak meja stan diperlukan 6 potong kain, masing-masing {5/8} m.',
        pertanyaan: 'Berapa meter kain yang diperlukan?',
        a: '6',
        op: '×',
        b: '5/8',
        satuan: 'm',
        hints: [
          '6 × {5/8} = (6 × 5)/8.',
          'Sederhanakan {30/8}, lalu tulis sebagai pecahan campuran.',
        ],
      },
      {
        id: 'q9',
        type: 'input',
        cerita:
          'Saat kemarau, permukaan air kolam ikan sekolah berubah −{1 1/2} cm setiap hari. Berapa perubahannya selama {2 2/3} hari?',
        pertanyaan: 'Berapa cm perubahan permukaan air?',
        a: '-1 1/2',
        op: '×',
        b: '2 2/3',
        satuan: 'cm',
        hints: ['Tanda berbeda → hasil negatif.', 'Ubah ke pecahan biasa: {3/2} × {8/3}.'],
      },
      {
        id: 'q10',
        type: 'input',
        cerita: 'Ada {7/8} kg cokelat batang yang dibungkus per {1/4} kg.',
        pertanyaan: 'Berapa bungkus yang didapat? (Boleh berupa pecahan campuran.)',
        a: '7/8',
        op: ':',
        b: '1/4',
        satuan: 'bungkus',
        hints: [
          'Berapa banyak {1/4} di dalam {7/8}?',
          'Balik pembagi: {7/8} × {4/1}, lalu sederhanakan.',
        ],
      },
    ],
    nextLabel: 'Lihat Penghargaan Tim →',
  },

  /* ---------- Fase 6: penghargaan ---------- */
  penghargaan: {
    kicker: 'Tahap 9 · Penghargaan Tim',
    goal: 'Merayakan hasil kerja sama tim berdasarkan skor misi dan kuis individu.',
    syntax: CL + ' · Fase 6',
    guru: 'Umumkan predikat setiap tim. Beri penghargaan khusus "Ahli Terbaik" kepada ahli yang penjelasannya paling membantu (tanyakan kepada anggota tim). Tekankan bahwa kuis individu ikut menentukan poin tim.',
    bobot:
      'Poin tim = 50% skor stasiun ahli & misi (benar pada percobaan pertama) + 50% skor kuis individu.',
    pujianLabel: 'Tulis satu pujian untuk ahli di tim kalian (siapa dan apa yang ia ajarkan).',
    pujianPlaceholder:
      'Contoh: Terima kasih Dewi, penjelasanmu tentang membalik pembagi membuatku paham pembagian pecahan.',
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ---------- Penutup ---------- */
  refleksi: {
    kicker: 'Tahap 10 · Refleksi',
    goal: 'Merefleksikan pemahaman konsep dan cara bekerja sama dalam tim.',
    syntax: CL + ' · Penutup',
    guru: 'Minta 2–3 murid membacakan jawaban refleksi. Catat murid yang memilih "belum yakin" untuk pendampingan pada pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Mengapa {1/2} × {3/4} lebih kecil daripada {3/4}, sedangkan 6 : {1/2} lebih besar daripada 6? Jelaskan dengan kata-katamu.',
        placeholder: 'Tulis jawabanmu…',
      },
      {
        id: 'r2',
        teks: 'Bagaimana kamu memutuskan sebuah masalah diselesaikan dengan perkalian atau pembagian?',
        placeholder: 'Contoh: Jika ada kata "bagian dari" …',
      },
      {
        id: 'r3',
        teks: 'Berikan satu contoh dari kehidupanmu yang memerlukan perkalian atau pembagian pecahan.',
        placeholder: 'Contoh: resep kue, membagi pita, mengisi botol…',
      },
      {
        id: 'r4',
        teks: 'Apa yang kamu pelajari dari teman ahli di timmu? Apa yang kamu sumbangkan sebagai ahli?',
        placeholder: 'Tulis jawabanmu…',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu mengalikan dan membagi pecahan dalam masalah sehari-hari sekarang?',
    diriOpsi: [
      { id: 'yakin', label: '😄 Yakin — aku bisa menjelaskannya ke teman' },
      { id: 'cukup', label: '🙂 Cukup yakin — kadang masih lupa membalik pembagi' },
      { id: 'belum', label: '🤔 Belum yakin — aku masih bingung dengan pecahan campuran/negatif' },
    ],
    nextLabel: 'Simpan & Selesai',
  },

  selesai: {
    judul: 'Misi Jigsaw Tuntas!',
    teks: 'Pesanan bazar beres! Kalian sudah menerapkan perkalian dan pembagian pecahan untuk menyelesaikan masalah dengan empat strategi para ahli.',
    capaian: [
      'Menentukan operasi dan kalimat matematika yang tepat dari masalah sehari-hari.',
      'Mengalikan pecahan dengan bilangan bulat (penjumlahan berulang) dan dengan pecahan (bagian dari bagian).',
      'Membagi dengan pecahan melalui "berapa banyak … di dalam …" dan kali kebalikan.',
      'Mengolah pecahan campuran dan negatif, lalu menyederhanakan hasilnya.',
      'Menjadi ahli yang mengajarkan satu strategi kepada tim.',
    ],
  },
};
