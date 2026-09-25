'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membandingkan & Mengurutkan Pecahan dalam Kehidupan
   Sehari-hari — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Membandingkan dan mengurutkan bilangan rasional (pecahan) dalam
   konteks kehidupan sehari-hari.

   Gagasan kunci yang dibangun di seluruh modul:
     • pecahan adalah SATU bilangan dengan letak tertentu pada garis
       bilangan; makin ke kanan makin besar;
     • penyebut sama → bandingkan pembilang; pembilang sama → penyebut
       lebih kecil berarti bagian lebih besar;
     • patokan ½ dan 1 mempercepat perbandingan;
     • menyamakan penyebut (KPK) selalu berhasil;
     • pecahan negatif: yang besarannya lebih besar justru lebih kecil
       (−3/4 < −1/2); pecahan campuran dibandingkan bilangan bulatnya
       lebih dulu;
     • miskonsepsi yang dilawan: "penyebut besar = pecahan besar",
       "pembilang sama = nilai sama", membandingkan pembilang & penyebut
       seperti bilangan bulat, "sama-sama kurang satu bagian", mengabaikan
       bilangan bulat, mengabaikan tanda negatif.

   Model pembelajaran: COOPERATIVE LEARNING tipe JIGSAW (sintaks Arends,
   dengan skor tim). Pemetaan sintaks ke tahap media:

     Fase 1 — Menyampaikan tujuan & memotivasi ........ 'tujuan'
     Fase 2 — Menyajikan informasi ..................... 'informasi'
     Fase 3 — Mengorganisasikan murid ke tim asal ...... 'tim'
     Fase 4 — Membimbing kelompok bekerja & belajar:
              a. kelompok ahli + mengajar tim asal ..... 'ahli'
              b. misi tim asal ......................... 'misiBanding',
                                                         'misiUrut'
              c. diskusi tim ........................... 'misiDiskusi'
     Fase 5 — Evaluasi (individu) ...................... 'kuis'
     Fase 6 — Memberikan penghargaan ................... 'penghargaan'
     Penutup ........................................... 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, tim asal heterogen 3–4 murid,
   satu perangkat per tim; kuis dikerjakan per murid):
     1. Tujuan      (6')  — "Rebutan Martabak": tiga anak makan 3/8, 2/5,
                            dan 1/2 martabak. Murid menduga siapa makan
                            paling banyak & paling sedikit.
     2. Informasi   (12') — pita pecahan sama panjang & garis bilangan
                            0–1, pertanyaan penuntun, perluasan ke pecahan
                            negatif (permukaan air kolam) → aturan umum.
     3. Tim asal    (5')  — nama tim, anggota, kesepakatan; kartu AHLI
                            (4 strategi) dibagikan acak.
     4. Ahli        (17') — Jigsaw: tiap ahli berkumpul dengan ahli
                            sejenis dari tim lain (kelompok ahli),
                            mempelajari contoh & kalimat kunci
                            strateginya, lalu kembali dan MEMANDU tim
                            asal mengerjakan dua soal stasiunnya
                            (diagnosa miskonsepsi pada setiap lambang).
     5. Misi 1      (12') — "Bandingkan!": lima pasangan konteks (resep,
                            pita, jarak, waktu, kedalaman air). Pilih
                            strategi → ahli strategi itu memimpin → pilih
                            lambang <, >, = → pilih makna konteks.
     6. Misi 2      (10') — "Urutkan!": tiga set pecahan (biasa, campuran,
                            negatif) disusun naik/turun dengan kartu
                            ketuk, dicek pada garis bilangan.
     7. Misi 3      (8')  — "Cek Pendapat Teman": tujuh pernyataan
                            Benar/Salah berisi miskonsepsi + catatan Juru
                            Bicara.
     8. Kuis        (8')  — kuis individu: enam soal diambil acak dari
                            bank sebelas soal.
     9. Penghargaan (3')  — poin tim (50% misi + 50% kuis) → predikat.
    10. Refleksi    (4')  — refleksi konsep & kerja sama, penilaian diri.

   Penulisan pecahan: nilai ditulis sebagai teks "3/4", "−1 1/2" (diurai
   engine: pecahanDari). Di dalam teks tampilan, token {3/4} atau
   {1 1/2} dirender sebagai pecahan bersusun oleh renderFracText().

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar". app.js mengacaknya SEKALI saat state disiapkan
   (ensureShuffledOrder / ensureOrderState / ensureSortStates /
   shuffleArray dari shared/engine.js), sehingga tiap tim dan tiap Reset
   mendapat urutan berbeda — termasuk dugaan, penuntun, lambang <, >, =,
   strategi, makna, kartu yang diurutkan, pernyataan diskusi, soal kuis
   yang terpilih beserta opsinya, dan penilaian diri.

   Konsistensi kunci jawaban diuji tests/mpi-1.4-data.test.js terhadap
   engine seksi 36 (simbolBandingPecahan, strategiBerlaku, …).
   ============================================================ */

var CL = 'Cooperative Learning (Jigsaw)';

/* Opsi lambang untuk soal kuis pilihan ganda. */
var OPSI_LAMBANG = [
  { id: 'lt', label: '&lt; (kurang dari)' },
  { id: 'gt', label: '&gt; (lebih dari)' },
  { id: 'eq', label: '= (sama dengan)' },
];

/* Opsi strategi untuk soal kuis jenis strategi (id = STRATEGI_BANDING_PECAHAN). */
var OPSI_STRATEGI = [
  { id: 'penyebutSama', label: 'Penyebut sama → bandingkan pembilangnya' },
  { id: 'pembilangSama', label: 'Pembilang sama → penyebut lebih kecil, bagian lebih besar' },
  { id: 'patokan', label: 'Bandingkan dengan patokan {1/2} atau 1' },
  { id: 'samakanPenyebut', label: 'Samakan penyebut dengan KPK' },
];

var DATA = {
  meta: {
    judul: 'Membandingkan & Mengurutkan Pecahan dalam Kehidupan Sehari-hari',
  },

  tahap: [
    { id: 'tujuan', label: 'Tujuan' },
    { id: 'informasi', label: 'Informasi' },
    { id: 'tim', label: 'Tim Asal' },
    { id: 'ahli', label: 'Ahli' },
    { id: 'misiBanding', label: 'Misi 1' },
    { id: 'misiUrut', label: 'Misi 2' },
    { id: 'misiDiskusi', label: 'Misi 3' },
    { id: 'kuis', label: 'Kuis' },
    { id: 'penghargaan', label: 'Penghargaan' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* ---------- Fase 1: tujuan & motivasi ---------- */
  tujuan: {
    kicker: 'Tahap 1 · Tujuan & Motivasi',
    goal: 'Mengenali tujuan belajar dan menduga cara membandingkan pecahan.',
    syntax: CL + ' · Fase 1',
    guru: 'Ceritakan kisah martabak dengan antusias. Minta murid menduga sendiri lebih dulu (1 menit), lalu bandingkan dugaan dengan teman sebangku. Banyak murid akan memilih Dimas karena "8 paling besar" — jangan dikoreksi dulu; dugaan akan diuji pada tahap Informasi.',
    judul: 'Rebutan Martabak',
    pengantar:
      'Tiga martabak manis berukuran sama dibeli untuk Dimas, Sari, dan Rafi. Martabak Dimas dipotong 8 bagian sama besar, Sari 5 bagian, dan Rafi 2 bagian. Setelah makan, ternyata:',
    tokoh: [
      { id: 'dimas', nama: 'Dimas', p: '3/8', teks: 'makan 3 dari 8 potong' },
      { id: 'sari', nama: 'Sari', p: '2/5', teks: 'makan 2 dari 5 potong' },
      { id: 'rafi', nama: 'Rafi', p: '1/2', teks: 'makan 1 dari 2 potong' },
    ],
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Membandingkan dan mengurutkan bilangan rasional (pecahan) dalam konteks kehidupan sehari-hari.',
    kriteria: [
      'Memakai lambang <, >, = dengan tepat untuk dua pecahan, termasuk pecahan campuran dan negatif.',
      'Memilih strategi yang cocok: penyebut sama, pembilang sama, patokan ½, atau menyamakan penyebut.',
      'Menjelaskan arti perbandingan dalam konteks (lebih banyak, lebih jauh, lebih dalam, …).',
      'Mengurutkan beberapa pecahan dari terkecil ke terbesar dan sebaliknya.',
    ],
    dugaan: [
      {
        id: 'banyak',
        tanya: 'Menurut dugaanmu, siapa yang makan martabak <strong>paling banyak</strong>?',
        opsi: [
          { id: 'dimas', label: 'Dimas ({3/8} martabak)' },
          { id: 'sari', label: 'Sari ({2/5} martabak)' },
          { id: 'rafi', label: 'Rafi ({1/2} martabak)' },
        ],
      },
      {
        id: 'sedikit',
        tanya: 'Siapa yang makan martabak <strong>paling sedikit</strong>?',
        opsi: [
          { id: 'dimas', label: 'Dimas ({3/8} martabak)' },
          { id: 'sari', label: 'Sari ({2/5} martabak)' },
          { id: 'rafi', label: 'Rafi ({1/2} martabak)' },
        ],
      },
    ],
    kunciDugaan: { banyak: 'rafi', sedikit: 'dimas' },
    alasanLabel: 'Bagaimana caramu menentukan? Tulis dugaanmu dengan singkat.',
    alasanPlaceholder: 'Contoh: Menurutku … karena …',
    catatan:
      'Dugaanmu belum dinilai. Kalian akan mengujinya dengan pita pecahan dan garis bilangan pada tahap berikutnya.',
    nextLabel: 'Uji Dugaan →',
  },

  /* ---------- Fase 2: menyajikan informasi ---------- */
  informasi: {
    kicker: 'Tahap 2 · Pita Pecahan & Garis Bilangan',
    goal: 'Menemukan bahwa pecahan dibandingkan dari nilainya — letaknya pada garis bilangan — bukan dari besar angka pembilang atau penyebutnya.',
    syntax: CL + ' · Fase 2',
    guru: 'Tampilkan pita pecahan di layar. Tanyakan: "Mengapa 3/8 lebih kecil padahal angkanya lebih besar?" Setelah semua pertanyaan penuntun terjawab, tulis aturan umum di papan dan umumkan bahwa cara-cara cepat membandingkan akan dipelajari oleh para ahli di tahap Jigsaw.',
    pengantar:
      'Ketiga martabak sama besar, jadi kita gambar sebagai pita yang sama panjang. Bagian berwarna menunjukkan yang dimakan.',
    penuntun: [
      {
        id: 'p1',
        tanya:
          'Pada pita di atas, bagian berwarna milik siapa yang <strong>paling panjang</strong>?',
        opsi: [
          { id: 'dimas', label: 'Dimas ({3/8})' },
          { id: 'sari', label: 'Sari ({2/5})' },
          { id: 'rafi', label: 'Rafi ({1/2})' },
        ],
        correct: 'rafi',
        umpan: {
          dimas:
            'Lihat lagi pitanya. Dimas memang punya potongan paling banyak (3), tetapi tiap potongannya paling kecil karena martabaknya dibagi 8.',
          sari: 'Bagian Sari lebih panjang daripada Dimas, tetapi belum mencapai garis tengah (½).',
          rafi: 'Tepat! Rafi makan tepat setengah martabak — bagian berwarnanya paling panjang.',
        },
      },
      {
        id: 'p2',
        tanya:
          'Pada garis bilangan 0 sampai 1, pecahan yang nilainya <strong>lebih besar</strong> letaknya …',
        opsi: [
          { id: 'kanan', label: 'lebih ke kanan (lebih dekat ke 1)' },
          { id: 'kiri', label: 'lebih ke kiri (lebih dekat ke 0)' },
          { id: 'penyebut', label: 'bergantung pada penyebutnya saja' },
        ],
        correct: 'kanan',
        umpan: {
          kanan:
            'Benar! Sama seperti bilangan bulat: makin ke kanan makin besar. {1/2} berada paling kanan di antara ketiganya.',
          kiri: 'Coba lihat letak {1/2} dan {3/8}. Mana yang lebih dekat ke 1?',
          penyebut:
            'Letak pecahan ditentukan oleh NILAINYA (pembilang dan penyebut bersama-sama), bukan penyebutnya saja.',
        },
      },
      {
        id: 'p3',
        tanya: 'Jadi, mana yang lebih besar: {3/8} atau {2/5}?',
        cek: { a: '3/8', b: '2/5', cari: 'besar' },
        opsi: [
          { id: 'a', label: '{3/8}, karena 3 &gt; 2 dan 8 &gt; 5' },
          { id: 'b', label: '{2/5}, karena bagian berwarnanya lebih panjang' },
          { id: 'sama', label: 'Sama besar, karena sama-sama kurang dari setengah' },
        ],
        correct: 'b',
        umpan: {
          a: 'Hati-hati! Pembilang dan penyebut tidak dibandingkan terpisah seperti bilangan bulat. Penyebut 8 justru membuat tiap potongan lebih kecil.',
          b: 'Tepat! {3/8} &lt; {2/5}. Jika penyebutnya disamakan menjadi 40: {15/40} &lt; {16/40}.',
          sama: 'Keduanya memang kurang dari ½, tetapi tidak sama panjang. Perhatikan lagi ujung bagian berwarnanya.',
        },
      },
      {
        id: 'p4',
        tanya:
          'Permukaan air kolam A berada {3/4} m di bawah bibir kolam (−{3/4}), kolam B −{1/2} m. Bilangan mana yang <strong>lebih kecil</strong>?',
        cek: { a: '-3/4', b: '-1/2', cari: 'kecil' },
        opsi: [
          { id: 'a', label: '−{3/4}, karena letaknya lebih kiri' },
          { id: 'b', label: '−{1/2}, karena {1/2} &lt; {3/4}' },
          { id: 'sama', label: 'Sama saja, keduanya negatif' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! −{3/4} berada lebih kiri daripada −{1/2}, jadi −{3/4} &lt; −{1/2}. Artinya permukaan air kolam A lebih dalam.',
          b: 'Awas tanda negatif! Pada garis bilangan, −{3/4} lebih jauh ke kiri dari 0 dibanding −{1/2}. Yang lebih kiri lebih kecil.',
          sama: 'Keduanya negatif, tetapi letaknya berbeda pada garis bilangan. Lihat gambar garisnya.',
        },
      },
    ],
    perluasan: {
      judul: 'Bagaimana dengan pecahan negatif?',
      teks: 'Garis bilangan juga memuat pecahan negatif. Permukaan air kolam A −{3/4} m dan kolam B −{1/2} m (di bawah bibir kolam):',
      pecahan: ['-3/4', '-1/2'],
      garis: { min: -1, max: 0 },
    },
    aturanJudul: 'Aturan yang kita temukan',
    aturan: [
      'Pecahan adalah <strong>satu bilangan</strong>. Pada garis bilangan, <strong>makin ke kanan makin besar</strong>.',
      'Jangan membandingkan pembilang dan penyebut secara terpisah seperti bilangan bulat: {3/8} &lt; {2/5} walaupun 3 &gt; 2 dan 8 &gt; 5.',
      'Penyebut lebih besar berarti satu utuh dibagi lebih banyak, sehingga <strong>tiap bagian lebih kecil</strong>.',
      'Pecahan negatif selalu lebih kecil daripada 0 dan pecahan positif; di antara dua pecahan negatif, yang besarannya lebih besar justru <strong>lebih kecil</strong> (−{3/4} &lt; −{1/2}).',
      'Mengurutkan <strong>naik</strong> = dari terkecil (paling kiri) ke terbesar; <strong>turun</strong> = sebaliknya.',
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
    namaTimPlaceholder: 'Contoh: Tim Martabak',
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
    goal: 'Menguasai satu strategi membandingkan pecahan lalu mengajarkannya kepada tim asal.',
    syntax: CL + ' · Fase 4 (Jigsaw)',
    guru: 'Langkah 1 (8 menit): para ahli sejenis dari semua tim berkumpul di meja ahli, membaca contoh, dan berlatih mengucapkan kalimat kunci. Langkah 2 (9 menit): ahli kembali ke tim asal, membuka stasiunnya di perangkat tim, lalu MEMANDU tim mengerjakan dua soal — ahli bertanya, bukan menjawabkan. Keliling dan dengarkan apakah kalimat kunci diucapkan dengan kata-kata sendiri.',
    pengantar:
      'Langkah 1 — di kelompok ahli: pelajari contoh dan kalimat kunci strategimu. Langkah 2 — di tim asal: buka stasiunmu, ajarkan kalimat kuncinya, lalu pandu tim mengerjakan dua soal.',
    stasiun: [
      {
        id: 'penyebutSama',
        contoh: {
          cerita:
            'Loyang kue dipotong 8 bagian sama besar. Ayah makan {3/8} loyang, Ibu {5/8} loyang.',
          a: '3/8',
          b: '5/8',
          nama: ['Ayah', 'Ibu'],
        },
        soal: [
          {
            id: 'ps1',
            cerita:
              'Lina sudah membaca {4/9} buku cerita, Bayu sudah membaca {7/9} buku yang sama.',
            a: '4/9',
            b: '7/9',
          },
          {
            id: 'ps2',
            cerita:
              'Dalam meter, seekor ikan berenang di −{5/6} dan seekor kepiting di −{1/6} dari permukaan kolam.',
            a: '-5/6',
            b: '-1/6',
          },
        ],
      },
      {
        id: 'pembilangSama',
        contoh: {
          cerita:
            'Dua martabak sama besar. Martabak A dipotong 3 bagian, B dipotong 5 bagian. Tono makan 1 potong A ({1/3}), Tini 1 potong B ({1/5}).',
          a: '1/3',
          b: '1/5',
          nama: ['Tono', 'Tini'],
        },
        soal: [
          {
            id: 'pb1',
            cerita:
              'Botol sirup A terisi {3/4} bagian, botol B yang sama besar terisi {3/8} bagian.',
            a: '3/4',
            b: '3/8',
          },
          {
            id: 'pb2',
            cerita: 'Rina mengecat {2/9} dinding, Doni mengecat {2/5} dinding yang sama luasnya.',
            a: '2/9',
            b: '2/5',
          },
        ],
      },
      {
        id: 'patokan',
        contoh: {
          cerita: 'Tangki air A terisi {3/7} bagian, tangki B yang sama terisi {5/8} bagian.',
          a: '3/7',
          b: '5/8',
          nama: ['Tangki A', 'Tangki B'],
        },
        soal: [
          {
            id: 'pt1',
            cerita:
              'Kelas 7A menghabiskan {4/9} kardus air mineral, kelas 7B {5/8} kardus yang sama.',
            a: '4/9',
            b: '5/8',
          },
          {
            id: 'pt2',
            cerita: 'Andi berlari {7/8} km, Beni berlari {1 1/6} km.',
            a: '7/8',
            b: '1 1/6',
          },
        ],
      },
      {
        id: 'samakanPenyebut',
        contoh: {
          cerita: 'Pita merah panjangnya {2/3} m, pita biru {3/4} m.',
          a: '2/3',
          b: '3/4',
          nama: ['Merah', 'Biru'],
        },
        soal: [
          {
            id: 'sp1',
            cerita: 'Kebun Pak Ali ditanami jagung {5/6} bagian, kebun Pak Budi {7/9} bagian.',
            a: '5/6',
            b: '7/9',
          },
          {
            id: 'sp2',
            cerita: 'Siti menabung {5/8} uang sakunya, Wati menabung {2/3} uang sakunya.',
            a: '5/8',
            b: '2/3',
          },
        ],
      },
    ],
    ajarLabel:
      'Ahli sudah mengajarkan kalimat kunci ini kepada tim asal dengan kata-katanya sendiri.',
    nextLabel: 'Mulai Misi 1 →',
  },

  /* ---------- Fase 4b: misi tim asal ---------- */
  misiBanding: {
    kicker: 'Tahap 5 · Misi 1: Bandingkan!',
    goal: 'Membandingkan dua pecahan dalam konteks dengan strategi yang tepat, lambang <, >, =, dan makna konteksnya.',
    syntax: CL + ' · Fase 4',
    guru: 'Pastikan ahli strategi yang dipilih tim benar-benar memimpin penjelasan. Bila tim salah memilih lambang, tanyakan: "Strategi siapa yang bisa dipakai? Coba minta ahlinya menjelaskan." Setiap strategi yang dapat dipakai diterima; umpan balik menyebutkan cara tercepat.',
    ronde: 0,
    langkah: [
      'Pembaca Soal membacakan situasi.',
      'Tim memilih strategi — ahli strategi itu memimpin perhitungan.',
      'Tim memilih lambang <, >, atau = lalu makna perbandingannya.',
    ],
    soal: [
      {
        id: 'b1',
        tema: 'banyak',
        cerita: 'Resep bolu pisang memakai {3/4} cangkir tepung terigu dan {2/3} cangkir gula.',
        a: { p: '3/4', teks: 'tepung terigu' },
        b: { p: '2/3', teks: 'gula' },
        tanyaMakna: 'Jadi, dibandingkan gula, tepung terigu yang dipakai …',
      },
      {
        id: 'b2',
        tema: 'panjang',
        cerita: 'Untuk prakarya, Beni memotong pita {5/8} m dan Ani memotong pita {5/6} m.',
        a: { p: '5/8', teks: 'pita Beni' },
        b: { p: '5/6', teks: 'pita Ani' },
        tanyaMakna: 'Jadi, dibandingkan pita Ani, pita Beni …',
      },
      {
        id: 'b3',
        tema: 'jarak',
        cerita: 'Jarak rumah Eka ke sekolah {2/5} km, sedangkan jarak rumah Dika {7/10} km.',
        a: { p: '2/5', teks: 'rumah Eka' },
        b: { p: '7/10', teks: 'rumah Dika' },
        tanyaMakna: 'Jadi, dibandingkan rumah Dika, rumah Eka ke sekolah …',
      },
      {
        id: 'b4',
        tema: 'waktu',
        cerita: 'Fajar berlatih bulu tangkis {3/4} jam, sedangkan Gita berlatih {9/12} jam.',
        a: { p: '3/4', teks: 'latihan Fajar' },
        b: { p: '9/12', teks: 'latihan Gita' },
        tanyaMakna: 'Jadi, dibandingkan latihan Gita, latihan Fajar …',
      },
      {
        id: 'b5',
        tema: 'tinggi',
        cerita:
          'Musim kemarau: permukaan air sumur A berada {3/4} m di bawah tanda normal (−{3/4}), sumur B −{5/6} m.',
        a: { p: '-3/4', teks: 'permukaan air sumur A' },
        b: { p: '-5/6', teks: 'permukaan air sumur B' },
        tanyaMakna: 'Jadi, dibandingkan sumur B, permukaan air sumur A …',
      },
    ],
    catatanLabel:
      'Catatan tim: strategi mana yang paling sering kalian pakai? Mengapa strategi itu paling mudah bagi tim kalian?',
    catatanPlaceholder: 'Contoh: Kami paling sering memakai patokan ½ karena …',
    nextLabel: 'Lanjut ke Misi 2 →',
  },

  misiUrut: {
    kicker: 'Tahap 6 · Misi 2: Urutkan!',
    goal: 'Mengurutkan beberapa pecahan — biasa, campuran, dan negatif — secara naik atau turun dalam konteks.',
    syntax: CL + ' · Fase 4',
    guru: 'Dorong tim membagi kerja: ahli patokan mengelompokkan pecahan di bawah/di atas ½ atau 1, ahli samakan penyebut memeriksa pasangan yang berdekatan. Setelah urutan tepat, minta tim membaca urutan dari garis bilangan.',
    ronde: 1,
    langkah: [
      'Pembaca Soal membacakan situasi dan arah urutan (naik/turun).',
      'Tim mengelompokkan pecahan dengan patokan (negatif, di bawah ½, di atas ½, lebih dari 1).',
      'Ketuk kartu sesuai urutan, lalu periksa dengan garis bilangan.',
    ],
    soal: [
      {
        id: 'u1',
        tema: 'banyak',
        arah: 'naik',
        cerita:
          'Bahan resep bolu (dalam cangkir): tepung {3/4}, gula {1/2}, susu {2/3}, minyak {1/3}.',
        fromLabel: 'Paling sedikit',
        toLabel: 'Paling banyak',
        items: [
          { id: 'tepung', p: '3/4', teks: 'tepung' },
          { id: 'gula', p: '1/2', teks: 'gula' },
          { id: 'susu', p: '2/3', teks: 'susu' },
          { id: 'minyak', p: '1/3', teks: 'minyak' },
        ],
      },
      {
        id: 'u2',
        tema: 'jarak',
        arah: 'turun',
        cerita: 'Jarak rumah ke sekolah (km): Hana {1 1/4}, Iwan {5/6}, Joko {1 2/5}, Kiki {3/4}.',
        fromLabel: 'Paling jauh',
        toLabel: 'Paling dekat',
        items: [
          { id: 'hana', p: '1 1/4', teks: 'Hana' },
          { id: 'iwan', p: '5/6', teks: 'Iwan' },
          { id: 'joko', p: '1 2/5', teks: 'Joko' },
          { id: 'kiki', p: '3/4', teks: 'Kiki' },
        ],
      },
      {
        id: 'u3',
        tema: 'tinggi',
        arah: 'naik',
        cerita:
          'Tinggi permukaan air terhadap tanda normal di lima pos pantau sungai (m): pos A −{3/4}, pos B {1/2}, pos C −{1/3}, pos D {1 1/4}, pos E −{1 1/2}.',
        fromLabel: 'Paling rendah',
        toLabel: 'Paling tinggi',
        items: [
          { id: 'posA', p: '-3/4', teks: 'pos A' },
          { id: 'posB', p: '1/2', teks: 'pos B' },
          { id: 'posC', p: '-1/3', teks: 'pos C' },
          { id: 'posD', p: '1 1/4', teks: 'pos D' },
          { id: 'posE', p: '-1 1/2', teks: 'pos E' },
        ],
      },
    ],
    nextLabel: 'Lanjut ke Misi 3 →',
  },

  /* ---------- Fase 4c: diskusi tim ---------- */
  misiDiskusi: {
    kicker: 'Tahap 7 · Misi 3: Cek Pendapat Teman',
    goal: 'Menilai kebenaran pernyataan perbandingan & urutan pecahan serta menjelaskan alasannya.',
    syntax: CL + ' · Fase 4',
    guru: 'Pernyataan berasal dari kesalahan yang sering dibuat murid. Minta tim berdiskusi sampai sepakat sebelum memilih (setiap pernyataan hanya bisa dijawab sekali). Minta ahli yang strateginya paling cocok menjelaskan setiap pernyataan. Pilih dua Juru Bicara secara acak untuk membacakan catatan timnya.',
    ronde: 2,
    pengantar:
      'Teman-teman dari kelas lain menuliskan pendapat berikut. Diskusikan dengan strategi para ahli, lalu putuskan: Benar atau Salah?',
    opsi: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'd1',
        teks: '"{1/3} &gt; {1/2}, karena 3 lebih besar daripada 2."',
        correct: 'salah',
        cek: { jenis: 'lambang', a: '1/3', b: '1/2', sym: 'gt' },
        explanation:
          'Pembilangnya sama (1). Penyebut 3 berarti bagiannya lebih kecil daripada bagian penyebut 2, jadi {1/3} &lt; {1/2}.',
      },
      {
        id: 'd2',
        teks: '"{3/4} = {5/6}, karena keduanya sama-sama kurang 1 bagian untuk menjadi 1 utuh."',
        correct: 'salah',
        cek: { jenis: 'lambang', a: '3/4', b: '5/6', sym: 'eq' },
        explanation:
          'Bagian yang kurang tidak sama besar: {1/4} &gt; {1/6}. Samakan penyebut: {9/12} &lt; {10/12}, jadi {3/4} &lt; {5/6}.',
      },
      {
        id: 'd3',
        teks: '"{2/5} &lt; {2/3}."',
        correct: 'benar',
        cek: { jenis: 'lambang', a: '2/5', b: '2/3', sym: 'lt' },
        explanation:
          'Pembilangnya sama (2). Sepertiga lebih besar daripada seperlima, jadi {2/5} &lt; {2/3}.',
      },
      {
        id: 'd4',
        teks: '"−{3/4} &gt; −{1/2}, karena {3/4} &gt; {1/2}."',
        correct: 'salah',
        cek: { jenis: 'lambang', a: '-3/4', b: '-1/2', sym: 'gt' },
        explanation:
          '−{3/4} berada lebih kiri daripada −{1/2} pada garis bilangan, jadi −{3/4} &lt; −{1/2}. Tanda negatif membalik urutan besarannya.',
      },
      {
        id: 'd5',
        teks: '"{1 1/5} &gt; {7/8}, karena {1 1/5} lebih dari 1 sedangkan {7/8} kurang dari 1."',
        correct: 'benar',
        cek: { jenis: 'lambang', a: '1 1/5', b: '7/8', sym: 'gt' },
        explanation: 'Strategi patokan 1: {7/8} &lt; 1 &lt; {1 1/5}. Tepat!',
      },
      {
        id: 'd6',
        teks: '"Urutan naik {1/4}, {3/8}, {1/2}, {2/3} sudah benar."',
        correct: 'benar',
        cek: { jenis: 'urut', nilai: ['1/4', '3/8', '1/2', '2/3'], arah: 'naik' },
        explanation:
          'Dengan penyebut 24: {6/24}, {9/24}, {12/24}, {16/24} — makin besar dari kiri ke kanan.',
      },
      {
        id: 'd7',
        teks: '"Pita {5/6} m lebih pendek daripada pita {4/5} m."',
        correct: 'salah',
        cek: { jenis: 'makna', a: '5/6', b: '4/5', klaim: 'kecil' },
        explanation:
          'Samakan penyebut 30: {25/30} &gt; {24/30}. Jadi pita {5/6} m justru lebih panjang.',
      },
    ],
    jubirLabel:
      'Catatan Juru Bicara: pernyataan mana yang paling membuat tim kalian berdebat? Strategi ahli mana yang menyelesaikannya?',
    jubirPlaceholder: 'Contoh: Kami sempat mengira 3/4 = 5/6, tetapi Ahli Samakan Penyebut …',
    nextLabel: 'Lanjut ke Kuis Individu →',
  },

  /* ---------- Fase 5: evaluasi (kuis individu) ---------- */
  kuis: {
    kicker: 'Tahap 8 · Kuis Individu',
    goal: 'Menunjukkan kemampuan membandingkan dan mengurutkan pecahan secara mandiri.',
    syntax: CL + ' · Fase 5',
    guru: 'Kuis dikerjakan SENDIRI-SENDIRI tanpa bantuan tim (bila memakai satu perangkat, anggota bergiliran dan mereset kuis dengan tombol Ulangi bila tersedia). Soal diambil acak dari bank sehingga tiap murid mendapat soal berbeda. Jawaban hanya bisa dipilih sekali.',
    instruksi: 'Kerjakan sendiri. Jawaban pilihan ganda hanya dapat dipilih sekali.',
    banyak: 6,
    komposisi: { lambang: 2, makna: 1, ekstrem: 1, urut: 1, strategi: 1 },
    soal: [
      {
        id: 'k1',
        jenis: 'lambang',
        type: 'choice',
        a: '5/8',
        b: '3/5',
        cerita: 'Botol sirup A berisi {5/8} liter, botol B berisi {3/5} liter.',
        pertanyaan: 'Lambang yang tepat untuk <strong>{5/8} ☐ {3/5}</strong> adalah …',
        options: OPSI_LAMBANG,
        correct: 'gt',
        explanation: 'Samakan penyebut 40: {25/40} &gt; {24/40}, jadi {5/8} &gt; {3/5}.',
      },
      {
        id: 'k2',
        jenis: 'lambang',
        type: 'choice',
        a: '2/9',
        b: '2/7',
        cerita: 'Adik menghabiskan {2/9} roti tawar, kakak {2/7} roti tawar yang sama.',
        pertanyaan: 'Lambang yang tepat untuk <strong>{2/9} ☐ {2/7}</strong> adalah …',
        options: OPSI_LAMBANG,
        correct: 'lt',
        explanation:
          'Pembilangnya sama. Sepersembilan lebih kecil daripada sepertujuh, jadi {2/9} &lt; {2/7}.',
      },
      {
        id: 'k3',
        jenis: 'lambang',
        type: 'choice',
        a: '-2/3',
        b: '-3/5',
        cerita: 'Suhu sebuah cairan percobaan −{2/3} °C, sedangkan cairan lain −{3/5} °C.',
        pertanyaan: 'Lambang yang tepat untuk <strong>−{2/3} ☐ −{3/5}</strong> adalah …',
        options: OPSI_LAMBANG,
        correct: 'lt',
        explanation:
          'Besarannya: {2/3} = {10/15} &gt; {3/5} = {9/15}. Karena negatif, −{2/3} lebih kiri, jadi −{2/3} &lt; −{3/5}.',
      },
      {
        id: 'k4',
        jenis: 'makna',
        type: 'choice',
        tema: 'banyak',
        a: '3/10',
        b: '1/4',
        cerita:
          'Uang saku Rudi dibelanjakan {3/10} bagian untuk buku dan {1/4} bagian untuk jajan.',
        pertanyaan: 'Dibandingkan uang jajan, uang untuk buku …',
        options: [
          { id: 'kecil', label: 'lebih sedikit' },
          { id: 'besar', label: 'lebih banyak' },
          { id: 'sama', label: 'sama banyaknya' },
        ],
        correct: 'besar',
        explanation: 'Samakan penyebut 20: {6/20} &gt; {5/20}, jadi uang untuk buku lebih banyak.',
      },
      {
        id: 'k5',
        jenis: 'makna',
        type: 'choice',
        tema: 'tinggi',
        a: '-1/2',
        b: '-2/5',
        cerita: 'Penyelam A berada −{1/2} m dan penyelam B −{2/5} m dari permukaan kolam renang.',
        pertanyaan: 'Dibandingkan penyelam B, posisi penyelam A …',
        options: [
          { id: 'kecil', label: 'lebih dalam' },
          { id: 'besar', label: 'lebih dangkal' },
          { id: 'sama', label: 'sama dalamnya' },
        ],
        correct: 'kecil',
        explanation:
          '−{1/2} = −{5/10} &lt; −{4/10} = −{2/5}. Lebih kecil di bawah permukaan berarti lebih dalam.',
      },
      {
        id: 'k6',
        jenis: 'ekstrem',
        type: 'choice',
        cari: 'terbesar',
        cerita: 'Empat anak bersepeda pada hari Minggu.',
        pertanyaan: 'Siapa yang bersepeda <strong>paling jauh</strong>?',
        options: [
          { id: 'nadia', p: '4/5', label: 'Nadia — {4/5} km' },
          { id: 'omar', p: '7/10', label: 'Omar — {7/10} km' },
          { id: 'putri', p: '5/6', label: 'Putri — {5/6} km' },
          { id: 'raka', p: '3/4', label: 'Raka — {3/4} km' },
        ],
        correct: 'putri',
        explanation:
          'Samakan penyebut 60: {48/60}, {42/60}, {50/60}, {45/60}. Terbesar {5/6} km (Putri).',
      },
      {
        id: 'k7',
        jenis: 'ekstrem',
        type: 'choice',
        cari: 'terkecil',
        cerita: 'Empat bungkus kacang ditimbang di warung.',
        pertanyaan: 'Bungkus mana yang <strong>paling ringan</strong>?',
        options: [
          { id: 'a', p: '2/3', label: 'Bungkus A — {2/3} kg' },
          { id: 'b', p: '3/5', label: 'Bungkus B — {3/5} kg' },
          { id: 'c', p: '5/8', label: 'Bungkus C — {5/8} kg' },
          { id: 'd', p: '7/12', label: 'Bungkus D — {7/12} kg' },
        ],
        correct: 'd',
        explanation:
          'Samakan penyebut 120: {80/120}, {72/120}, {75/120}, {70/120}. Paling ringan {7/12} kg.',
      },
      {
        id: 'k8',
        jenis: 'urut',
        type: 'choice',
        arah: 'naik',
        nilai: ['2/3', '3/5', '5/6', '1/2'],
        cerita: 'Bagian tugas proyek yang sudah selesai: tim A {2/3}, B {3/5}, C {5/6}, D {1/2}.',
        pertanyaan:
          'Urutan dari yang <strong>paling sedikit</strong> ke <strong>paling banyak</strong> adalah …',
        options: [
          { id: 'o1', label: '{1/2}, {3/5}, {2/3}, {5/6}' },
          { id: 'o2', label: '{1/2}, {2/3}, {3/5}, {5/6}' },
          { id: 'o3', label: '{5/6}, {2/3}, {3/5}, {1/2}' },
          { id: 'o4', label: '{2/3}, {1/2}, {3/5}, {5/6}' },
        ],
        correct: 'o1',
        explanation: 'Samakan penyebut 30: {15/30}, {18/30}, {20/30}, {25/30}.',
      },
      {
        id: 'k9',
        jenis: 'urut',
        type: 'choice',
        arah: 'turun',
        nilai: ['1 1/2', '5/4', '1 1/3', '7/8'],
        cerita:
          'Waktu belajar (jam) empat murid kemarin: Tia {1 1/2}, Umar {5/4}, Vina {1 1/3}, Wawan {7/8}.',
        pertanyaan:
          'Urutan dari yang <strong>paling lama</strong> ke <strong>paling singkat</strong> adalah …',
        options: [
          { id: 'o1', label: '{1 1/2}, {1 1/3}, {5/4}, {7/8}' },
          { id: 'o2', label: '{1 1/2}, {5/4}, {1 1/3}, {7/8}' },
          { id: 'o3', label: '{7/8}, {5/4}, {1 1/3}, {1 1/2}' },
          { id: 'o4', label: '{5/4}, {1 1/2}, {1 1/3}, {7/8}' },
        ],
        correct: 'o1',
        explanation:
          '{5/4} = {1 1/4}. Bandingkan bagian pecahannya: {1/2} &gt; {1/3} &gt; {1/4}, lalu {7/8} kurang dari 1.',
      },
      {
        id: 'k10',
        jenis: 'strategi',
        type: 'choice',
        a: '4/7',
        b: '4/9',
        cerita: 'Rani ingin membandingkan {4/7} dan {4/9} dengan cepat.',
        pertanyaan: 'Strategi yang <strong>paling cepat</strong> dipakai adalah …',
        options: OPSI_STRATEGI,
        correct: 'pembilangSama',
        explanation:
          'Pembilangnya sama (4). Sepertujuh lebih besar daripada sepersembilan, jadi {4/7} &gt; {4/9}.',
      },
      {
        id: 'k11',
        jenis: 'strategi',
        type: 'choice',
        a: '3/7',
        b: '5/9',
        cerita: 'Tomi ingin membandingkan {3/7} dan {5/9} dengan cepat.',
        pertanyaan: 'Strategi yang <strong>paling cepat</strong> dipakai adalah …',
        options: OPSI_STRATEGI,
        correct: 'patokan',
        explanation:
          '{3/7} kurang dari ½ (karena 3 &lt; 3½), sedangkan {5/9} lebih dari ½ (karena 5 &gt; 4½). Jadi {3/7} &lt; {5/9}.',
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
      'Poin tim = 50% skor misi & stasiun ahli (benar pada percobaan pertama) + 50% skor kuis individu.',
    pujianLabel: 'Tulis satu pujian untuk ahli di tim kalian (siapa dan apa yang ia ajarkan).',
    pujianPlaceholder:
      'Contoh: Terima kasih Sinta, penjelasanmu tentang patokan ½ membuatku cepat membandingkan.',
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
        teks: 'Mengapa 3/8 lebih kecil daripada 2/5 padahal angka 3 dan 8 lebih besar? Jelaskan dengan kata-katamu.',
        placeholder: 'Tulis jawabanmu…',
      },
      {
        id: 'r2',
        teks: 'Strategi ahli mana yang paling kamu sukai? Berikan satu contoh pecahan yang cocok dengan strategi itu.',
        placeholder: 'Contoh: Patokan ½, karena …',
      },
      {
        id: 'r3',
        teks: 'Berikan satu contoh dari kehidupanmu yang memerlukan membandingkan atau mengurutkan pecahan.',
        placeholder: 'Contoh: resep kue, jarak lari, isi botol…',
      },
      {
        id: 'r4',
        teks: 'Apa yang kamu pelajari dari teman ahli di timmu? Apa yang kamu sumbangkan sebagai ahli?',
        placeholder: 'Tulis jawabanmu…',
      },
    ],
    diriLabel: 'Seberapa yakin kamu membandingkan dan mengurutkan pecahan sekarang?',
    diriOpsi: [
      { id: 'yakin', label: '😄 Yakin — aku bisa menjelaskannya ke teman' },
      { id: 'cukup', label: '🙂 Cukup yakin — kadang masih perlu menyamakan penyebut dulu' },
      { id: 'belum', label: '🤔 Belum yakin — aku masih bingung dengan pecahan negatif/campuran' },
    ],
    nextLabel: 'Simpan & Selesai',
  },

  selesai: {
    judul: 'Misi Jigsaw Tuntas!',
    teks: 'Kalian sudah membandingkan dan mengurutkan pecahan dalam berbagai konteks sehari-hari dengan empat strategi para ahli.',
    capaian: [
      'Membandingkan dua pecahan dengan lambang <, >, =, termasuk pecahan campuran dan negatif.',
      'Memilih strategi yang cocok: penyebut sama, pembilang sama, patokan ½/1, atau samakan penyebut.',
      'Menjelaskan arti perbandingan dalam konteks: lebih banyak, lebih panjang, lebih jauh, lebih dalam.',
      'Mengurutkan beberapa pecahan secara naik dan turun.',
      'Menjadi ahli yang mengajarkan satu strategi kepada tim.',
    ],
  },
};
