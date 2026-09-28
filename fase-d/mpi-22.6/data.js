'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Unsur-unsur & Jaring-jaring Limas
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Tujuan Pembelajaran:
   Mengidentifikasi unsur-unsur limas (titik sudut & titik puncak,
   rusuk alas, rusuk tegak, sisi alas, sisi tegak, tinggi limas)
   serta jaring-jaring limas.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'amati' & 'bongkar'
     Sintaks 4 — Data processing ............ tahap 'olah'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas:
     1. Stimulasi   — etalase Kios Kerajinan "Puncak Kertas": kemasan
                      teh celup, miniatur piramida, lampion, atap
                      gazebo. Murid MENDUGA kesamaan bentuknya + alasan
                      (tidak dinilai).
     2. Masalah     — memilih rumusan masalah & menulis hipotesis.
     3. Amati       — penjelajah limas 3D: memutar limas segitiga s.d.
                      segienam, menandai titik sudut/rusuk/sisi dengan
                      mengetuk, menampilkan garis tinggi limas (TO) dan
                      tinggi segitiga sisi tegak (TP), mengisi tabel
                      unsur (berdiagnosa), lalu menamai unsur limas.
     4. Bongkar     — pelipat jaring: melipat/membuka jaring-jaring tiga
                      kerajinan (susunan "kipas" dan "bunga"); perakit
                      jaring kipas: mengatur banyak segitiga lalu
                      menempel persegi alas dan menguji lipatannya.
     5. Olah data   — pertanyaan penuntun pola n + 1, 2n, n + 1; prediksi
                      tabel limas segidelapan & segisepuluh; memilah 6
                      jaring-jaring: dapat/tidak dapat dilipat.
     6. Pembuktian  — menghitung unsur limas segidelapan di penjelajah,
                      memprediksi lalu melipat dua jaring baru, dan
                      menanggapi miskonsepsi.
     7. Simpulan    — menyusun kalimat kesimpulan dari bank kalimat.
     8. Uji terap   — 8 soal kontekstual.
     9. Refleksi    — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan.

   Jaring-jaring ditulis sebagai spec limas (lihat shared/engine.js
   seksi 56): { n, susun: 'bunga', tepi: [i] } atau { n, susun: 'kipas',
   segitiga, alasPada: [j] }, ditambah ukuran s (sisi alas) dan t
   (tinggi segitiga sisi tegak). Semua kunci (banyak unsur, dapat/tidak
   dilipat) diuji terhadap engine di tests/mpi-22.6-data.test.js.
   ============================================================ */

var OPSI_LIPAT = [
  { id: 'bisa', label: 'Dapat dilipat menjadi limas' },
  { id: 'tidak', label: 'Tidak dapat dilipat menjadi limas' },
];

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1 (Stimulation)',
    goal: 'Mengamati benda-benda kerajinan di sekitar dan menduga kesamaan bentuknya.',
    tp: 'Mengidentifikasi unsur-unsur limas (titik sudut dan titik puncak, rusuk alas, rusuk tegak, sisi alas, sisi tegak, tinggi) serta jaring-jaring limas.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menunjukkan titik puncak, titik sudut, rusuk, sisi, dan tinggi pada sebuah limas.',
      'Menemukan hubungan banyak titik sudut, rusuk, dan sisi limas segi-n dengan n.',
      'Menamai limas berdasarkan bentuk sisi alasnya.',
      'Menentukan apakah sebuah jaring-jaring dapat dilipat menjadi limas.',
    ],
    guru: 'Bila ada, bawa benda nyata (kemasan teh celup segitiga, hiasan piramida, gambar atap joglo/gazebo). Biarkan murid menduga tanpa dikoreksi; dugaan akan diuji di tahap-tahap berikutnya.',
    judul: 'Kios Kerajinan “Puncak Kertas”',
    cerita:
      'Kak Laras membuka kios kerajinan kertas. Di etalasenya ada empat benda: kemasan teh celup, miniatur piramida, lampion, dan miniatur atap gazebo. Semuanya dibuat dari selembar karton yang dipotong lalu dilipat.',
    benda: [
      { id: 'teh', nama: '🍵 Kemasan teh celup', n: 3, tinggi: 1.1 },
      { id: 'piramida', nama: '🔺 Miniatur piramida', n: 4, tinggi: 1.2 },
      { id: 'lampion', nama: '🏮 Lampion', n: 5, tinggi: 1.6 },
      { id: 'gazebo', nama: '⛱️ Atap gazebo', n: 6, tinggi: 0.8 },
    ],
    pertanyaan: 'Menurut dugaanmu, apa kesamaan bentuk keempat benda itu?',
    opsi: [
      {
        id: 'puncak',
        label:
          'Semuanya punya satu alas, dan sisi-sisi lainnya berbentuk segitiga yang bertemu di satu titik di atas',
      },
      {
        id: 'kongruen',
        label: 'Semuanya punya dua sisi yang sama bentuk dan ukurannya, saling berhadapan',
      },
      { id: 'lengkung', label: 'Semuanya punya sisi yang melengkung' },
      { id: 'balok', label: 'Semuanya berbentuk balok' },
    ],
    dugaanTepat: 'puncak',
    alasanLabel: 'Tuliskan alasan dugaanmu.',
    alasanPlaceholder: 'Aku menduga begitu karena …',
    catatan:
      'Belum ada jawaban benar atau salah. Simpan dugaanmu, nanti kamu akan membuktikannya sendiri.',
    nextLabel: 'Lanjut ke Rumusan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: 'Discovery Learning · Sintaks 2 (Problem Statement)',
    goal: 'Merumuskan pertanyaan yang akan diselidiki dan menulis hipotesis.',
    guru: 'Diskusikan mengapa perajin perlu tahu banyak rusuk, sisi, dan bentuk bentangan karton sebelum memotong. Terima hipotesis apa pun selama bisa diuji.',
    pengantar:
      'Kak Laras ingin membuat kerajinan baru berbentuk limas. Agar tidak salah potong, ia perlu tahu bagian-bagian limas (titik puncak, sisi, rusuk, titik sudut) dan bentuk bentangan karton sebelum dilipat, yang disebut jaring-jaring.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'unsur',
        label:
          'Unsur apa saja yang dimiliki limas, berapa banyaknya, dan seperti apa jaring-jaringnya?',
      },
      { id: 'harga', label: 'Berapa harga jual satu miniatur piramida?' },
      { id: 'warna', label: 'Warna kertas apa yang paling disukai pembeli?' },
      { id: 'volume', label: 'Berapa banyak teh yang muat di dalam kemasan teh celup?' },
    ],
    correct: 'unsur',
    umpan: {
      unsur:
        'Tepat! Pertanyaan ini bisa diselidiki dengan mengamati, menghitung, dan membongkar kerajinannya.',
      harga:
        'Harga memang penting untuk kios, tetapi tidak menjelaskan bentuk kerajinan. Coba pilih yang lain.',
      warna: 'Warna tidak mengubah bentuk. Pilih pertanyaan tentang bagian-bagian limas.',
      volume:
        'Isi (volume) akan dipelajari nanti. Sekarang Kak Laras perlu tahu bagian-bagian dan bentangan limas.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu, apa hubungan bentuk alas limas dengan banyak sisi dan rusuknya?',
    hipotesisPlaceholder: 'Menurutku, makin banyak sudut pada alasnya, …',
    nextLabel: 'Lanjut Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MENGAMATI UNSUR
     ---------------------------------------------------------- */
  amati: {
    kicker: 'Tahap 3 · Mengumpulkan Data: Mengamati Unsur',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Mengamati dan menghitung titik sudut, rusuk, dan sisi berbagai limas.',
    guru: 'Dorong murid memutar dan memiringkan limas ke bawah untuk melihat alasnya. Tanyakan “Apakah titik puncak termasuk titik sudut?” dan “Bagaimana kamu memastikan tidak ada rusuk yang terhitung dua kali?”.',
    instruksi:
      'Pilih sebuah limas, lalu putar dan miringkan untuk melihat semua bagiannya (miringkan ke bawah untuk melihat alasnya). Pilih jenis unsur (titik sudut, rusuk, atau sisi), lalu ketuk unsur itu satu per satu pada gambar. Tekan “Tampilkan tinggi” untuk melihat garis tinggi.',
    tabelRows: [3, 4, 5, 6],
    tabelCaption: 'Banyak unsur setiap limas',
    instruksiTabel:
      'Catat hasil pengamatanmu. Tabel baru bisa diperiksa setelah semua kotak terisi.',
    tanyaInstruksi:
      'Perhatikan limas segiempat T.ABCD pada penjelajah (ketuk unsurnya untuk melihat nama, dan tampilkan garis tinggi). Jawab pertanyaan berikut.',
    tanya: [
      {
        id: 'i1',
        tanya: 'Pada limas T.ABCD, titik T disebut …',
        opsi: [
          { id: 'puncak', label: 'titik puncak' },
          { id: 'pusat', label: 'titik pusat alas' },
          { id: 'tengah', label: 'titik tengah rusuk' },
          { id: 'bukan', label: 'bukan titik sudut' },
        ],
        correct: 'puncak',
        umpan: {
          puncak:
            'Tepat! T adalah titik puncak, tempat semua sisi tegak bertemu. T juga termasuk titik sudut limas.',
          pusat: 'Titik pusat alas ada di tengah alas ABCD (titik O). T berada di atasnya.',
          tengah: 'Titik tengah rusuk terletak pada sebuah rusuk. T adalah ujung atas limas.',
          bukan: 'T adalah pertemuan beberapa rusuk, jadi T juga titik sudut. Coba lagi.',
        },
      },
      {
        id: 'i2',
        tanya: 'Rusuk TA, TB, TC, dan TD disebut …',
        opsi: [
          { id: 'tegak', label: 'rusuk tegak' },
          { id: 'alas', label: 'rusuk alas' },
          { id: 'tinggi', label: 'tinggi limas' },
          { id: 'diagonal', label: 'diagonal alas' },
        ],
        correct: 'tegak',
        umpan: {
          tegak: 'Tepat! Rusuk tegak menghubungkan titik puncak T dengan titik sudut pada alas.',
          alas: 'Rusuk alas adalah AB, BC, CD, dan DA, yang membatasi sisi alas. Coba lagi.',
          tinggi:
            'Tinggi limas adalah garis TO yang tegak lurus alas. TA miring, jadi bukan tinggi limas.',
          diagonal:
            'Diagonal alas menghubungkan dua titik alas yang tidak bersebelahan, misalnya AC.',
        },
      },
      {
        id: 'i3',
        tanya: 'Sisi tegak TAB, TBC, TCD, dan TDA berbentuk …',
        opsi: [
          { id: 'segitiga', label: 'segitiga' },
          { id: 'pp', label: 'persegi panjang' },
          { id: 'alas', label: 'sama dengan bentuk alasnya' },
          { id: 'trapesium', label: 'trapesium' },
        ],
        correct: 'segitiga',
        umpan: {
          segitiga:
            'Tepat! Setiap sisi tegak limas berbentuk segitiga yang salah satu titiknya adalah titik puncak.',
          pp: 'Persegi panjang adalah sisi tegak prisma. Ketuk sisi TAB dan perhatikan bentuknya.',
          alas: 'Itu bentuk sisi alas. Perhatikan sisi yang miring menuju puncak.',
          trapesium: 'Trapesium punya empat titik sudut. Sisi TAB hanya punya tiga: T, A, dan B.',
        },
      },
      {
        id: 'i4',
        tanya: 'Berapa banyak sisi alas yang dimiliki sebuah limas?',
        opsi: [
          { id: '1', label: 'satu' },
          { id: '2', label: 'dua, yaitu alas dan tutup' },
          { id: '0', label: 'tidak ada' },
          { id: 'n', label: 'sebanyak sisi tegaknya' },
        ],
        correct: '1',
        umpan: {
          1: 'Tepat! Limas hanya punya satu alas. Bentuk alas itulah yang memberi nama limas.',
          2: 'Dua sisi sejajar yang kongruen adalah ciri prisma. Limas tidak punya tutup, bagian atasnya meruncing ke puncak.',
          0: 'Miringkan limas ke bawah: ada sisi ABCD di bagian bawah. Itulah sisi alasnya.',
          n: 'Sisi tegak memang ada n, tetapi sisi alasnya hanya satu.',
        },
      },
      {
        id: 'i5',
        tanya: 'Tinggi limas adalah …',
        opsi: [
          { id: 'TO', label: 'garis TO, jarak titik puncak ke alas yang tegak lurus alas' },
          { id: 'TA', label: 'rusuk tegak TA' },
          { id: 'TP', label: 'garis TP, tinggi segitiga sisi tegak TAB' },
          { id: 'AB', label: 'rusuk alas AB' },
        ],
        correct: 'TO',
        umpan: {
          TO: 'Tepat! Tinggi limas diukur dari titik puncak tegak lurus ke alas, yaitu TO.',
          TA: 'TA adalah rusuk tegak yang miring. Tampilkan tinggi dan bandingkan TA dengan TO.',
          TP: 'TP adalah tinggi segitiga sisi tegak TAB, masih miring terhadap alas. Tinggi limas tegak lurus alas.',
          AB: 'AB terletak mendatar pada alas. Tinggi diukur dari puncak ke alas.',
        },
      },
    ],
    temuan:
      'Temuanmu: limas punya satu sisi alas, sisi-sisi tegak berbentuk segitiga yang bertemu di titik puncak, rusuk alas dan rusuk tegak, serta tinggi limas (TO) yang berbeda dengan rusuk tegak dan tinggi segitiga sisi tegak.',
    nextLabel: 'Lanjut Membongkar Kerajinan →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MEMBONGKAR & MERAKIT JARING-JARING
     ---------------------------------------------------------- */
  bongkar: {
    kicker: 'Tahap 4 · Mengumpulkan Data: Membongkar Kerajinan',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Mengamati jaring-jaring limas dengan melipat dan merakitnya.',
    guru: 'Bila memungkinkan, sediakan jaring-jaring limas dari karton untuk digunting dan dilipat murid. Bandingkan dua susunan jaring: “bunga” (segitiga mengelilingi alas) dan “kipas” (segitiga berjajar di satu puncak).',
    instruksiLipat:
      'Pilih sebuah kerajinan. Geser penggeser “Lipat” atau tekan ▶ Lipat untuk melihat bentangan karton berubah menjadi limas, lalu ◀ Buka untuk membentangkannya lagi. Lipat penuh ketiga kerajinan.',
    lipat: {
      3: { n: 3, susun: 'kipas', segitiga: 3, alasPada: [1], s: 1, t: 0.9 },
      4: { n: 4, susun: 'bunga', tepi: [0, 1, 2, 3], s: 1, t: 1.2 },
      6: { n: 6, susun: 'bunga', tepi: [0, 1, 2, 3, 4, 5], s: 0.6, t: 0.8 },
    },
    namaKemasan: {
      3: '🍵 Teh celup',
      4: '🔺 Piramida',
      6: '⛱️ Atap gazebo',
    },
    tanyaLipat: [
      {
        id: 'b1',
        tanya: 'Jaring-jaring miniatur piramida (limas segiempat) terdiri atas …',
        opsi: [
          { id: '1p4s', label: '1 persegi dan 4 segitiga' },
          { id: '2p4s', label: '2 persegi dan 4 segitiga' },
          { id: '1p4pp', label: '1 persegi dan 4 persegi panjang' },
          { id: '5s', label: '5 segitiga' },
        ],
        correct: '1p4s',
        umpan: {
          '1p4s': 'Tepat! 1 persegi menjadi alas, 4 segitiga menjadi sisi tegak.',
          '2p4s':
            'Hitung lagi keping berwarna oranye (alas). Limas tidak punya tutup, jadi alasnya hanya satu.',
          '1p4pp':
            'Keping biru pada jaring limas berbentuk segitiga, bukan persegi panjang. Perhatikan lagi.',
          '5s': 'Jumlah kepingnya memang 5, tetapi keping di tengah berbentuk persegi.',
        },
      },
      {
        id: 'b2',
        tanya: 'Saat jaring-jaring dilipat, titik-titik ujung segitiga yang jauh dari alas …',
        opsi: [
          { id: 'puncak', label: 'bertemu di satu titik, yaitu titik puncak limas' },
          { id: 'alas', label: 'menempel pada titik-titik sudut alas' },
          { id: 'terpisah', label: 'tetap terpisah satu sama lain' },
          { id: 'tutup', label: 'membentuk sisi atas yang sama dengan alas' },
        ],
        correct: 'puncak',
        umpan: {
          puncak: 'Tepat! Semua ujung segitiga bertemu menjadi titik puncak T.',
          alas: 'Lipat lagi pelan-pelan dan ikuti ujung segitiga: ujung itu naik ke atas, bukan ke alas.',
          terpisah:
            'Coba lipat penuh: kalau ujungnya terpisah, bangunnya tidak tertutup. Perhatikan puncaknya.',
          tutup: 'Limas tidak punya sisi atas. Ujung-ujung segitiga meruncing menjadi satu titik.',
        },
      },
      {
        id: 'b3',
        tanya: 'Banyak segitiga pada jaring-jaring atap gazebo (limas segienam) adalah …',
        opsi: [
          { id: '6', label: '6' },
          { id: '7', label: '7' },
          { id: '1', label: '1' },
          { id: '12', label: '12' },
        ],
        correct: '6',
        umpan: {
          6: 'Tepat! Alas segienam punya 6 rusuk alas, dan pada setiap rusuk alas menempel satu segitiga.',
          7: '7 adalah banyak semua keping. Hitung segitiganya saja.',
          1: '1 adalah banyak keping segienam (alas). Hitung keping segitiganya.',
          12: 'Itu banyak rusuk limas segienam. Hitung keping segitiganya.',
        },
      },
    ],
    instruksiRakit:
      'Sekarang giliranmu merakit jaring-jaring kipas untuk miniatur piramida. Atur banyak segitiga dengan tombol − dan +, lalu ketuk tanda + di bawah sebuah segitiga untuk menempelkan persegi alas (ketuk lagi untuk melepasnya). Tekan “Lipat & Uji” untuk mencoba melipatnya. Temukan paling sedikit dua jaring-jaring berbeda yang berhasil.',
    rakit: { n: 4, s: 1, t: 1.2, minSegitiga: 3, maxSegitiga: 5 },
    targetRakit: 2,
    tanyaRakit: [
      {
        id: 'b4',
        tanya: 'Agar jaring-jaring kipas dapat dilipat menjadi limas segiempat, jaring itu harus …',
        opsi: [
          {
            id: 'syarat',
            label:
              'punya tepat 4 segitiga dan 1 persegi yang menempel pada tepi salah satu segitiga',
          },
          { id: 'tengah', label: 'selalu menempelkan persegi pada segitiga yang paling tengah' },
          { id: 'dua', label: 'punya 4 segitiga dan 2 persegi' },
          { id: 'bebas', label: 'punya berapa pun segitiga, asal ada 1 persegi' },
        ],
        correct: 'syarat',
        umpan: {
          syarat:
            'Tepat! Segitiganya harus sebanyak sisi alas, dan persegi alasnya boleh menempel pada segitiga mana saja.',
          tengah:
            'Coba tempel persegi pada segitiga paling pinggir, lalu lipat. Ternyata juga berhasil!',
          dua: 'Coba rakit dengan dua persegi: saat dilipat keduanya menumpuk. Limas hanya punya satu alas.',
          bebas: 'Coba 3 atau 5 segitiga, lalu lipat. Apa yang terjadi pada sisi tegaknya?',
        },
      },
    ],
    temuan:
      'Temuanmu: jaring-jaring limas segi-n terdiri atas satu segi-n (menjadi alas) dan n segitiga (menjadi sisi tegak) yang ujungnya bertemu di titik puncak. Susunannya bisa bermacam-macam, asal banyak kepingnya tepat dan tidak ada yang menumpuk.',
    nextLabel: 'Lanjut Mengolah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGOLAH DATA
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 5 · Mengolah Data',
    syntax: 'Discovery Learning · Sintaks 4 (Data Processing)',
    goal: 'Menemukan pola banyak unsur limas segi-n dan ciri jaring-jaring limas.',
    guru: 'Minta murid membaca tabel secara mendatar (per limas) dan menurun (per unsur). Tanyakan: “Dari mana tambahan 1 pada banyak titik sudut dan banyak sisi?”. Bandingkan juga dengan pola prisma (2n, 3n, n + 2).',
    instruksiPola:
      'Lihat kembali tabel hasil pengamatanmu, lalu jawab pertanyaan untuk limas dengan alas segi-n.',
    konsep: [
      {
        id: 'o1',
        tanya: 'Banyak titik sudut limas segi-n adalah …',
        opsi: [
          { id: 'n+1', label: 'n + 1' },
          { id: 'n', label: 'n' },
          { id: '2n', label: '2n' },
          { id: 'n+2', label: 'n + 2' },
        ],
        correct: 'n+1',
        umpan: {
          'n+1': 'Tepat! Ada n titik sudut pada alas ditambah 1 titik puncak.',
          n: 'n baru titik sudut pada alas. Titik puncak juga termasuk titik sudut.',
          '2n': 'Cek pada limas segitiga: 2 × 3 = 6, padahal titik sudutnya 4.',
          'n+2': 'Cek pada limas segiempat: 4 + 2 = 6, padahal titik sudutnya 5.',
        },
      },
      {
        id: 'o2',
        tanya: 'Banyak rusuk limas segi-n adalah …',
        opsi: [
          { id: '2n', label: '2n' },
          { id: '3n', label: '3n' },
          { id: 'n+1', label: 'n + 1' },
          { id: 'n', label: 'n' },
        ],
        correct: '2n',
        umpan: {
          '2n': 'Tepat! n rusuk alas + n rusuk tegak = 2n.',
          '3n': '3n adalah banyak rusuk prisma. Limas tidak punya rusuk atas.',
          'n+1': 'Cek pada limas segiempat: 4 + 1 = 5, padahal rusuknya 8.',
          n: 'n baru rusuk alasnya. Rusuk tegaknya belum terhitung.',
        },
      },
      {
        id: 'o3',
        tanya: 'Banyak sisi limas segi-n adalah …',
        opsi: [
          { id: 'n+1', label: 'n + 1' },
          { id: 'n', label: 'n' },
          { id: 'n+2', label: 'n + 2' },
          { id: '2n', label: '2n' },
        ],
        correct: 'n+1',
        umpan: {
          'n+1': 'Tepat! Ada n sisi tegak ditambah 1 sisi alas.',
          n: 'n baru banyak sisi tegaknya. Sisi alas juga dihitung.',
          'n+2': 'n + 2 adalah banyak sisi prisma. Limas hanya punya satu alas.',
          '2n': 'Cek pada limas segitiga: 2 × 3 = 6, padahal sisinya 4.',
        },
      },
      {
        id: 'o4',
        tanya: 'Nama sebuah limas ditentukan oleh …',
        opsi: [
          { id: 'alas', label: 'bentuk sisi alasnya' },
          { id: 'tegak', label: 'bentuk sisi tegaknya' },
          { id: 'tinggi', label: 'tingginya' },
          { id: 'puncak', label: 'banyak titik puncaknya' },
        ],
        correct: 'alas',
        umpan: {
          alas: 'Tepat! Alas segitiga → limas segitiga, alas segienam → limas segienam.',
          tegak: 'Sisi tegak limas selalu segitiga, jadi tidak bisa membedakan nama limas.',
          tinggi: 'Limas tinggi maupun pendek dengan alas persegi tetap disebut limas segiempat.',
          puncak: 'Setiap limas hanya punya satu titik puncak, jadi tidak bisa membedakan namanya.',
        },
      },
    ],
    instruksiPrediksi:
      'Gunakan pola yang kamu temukan untuk memprediksi banyak unsur limas berikut tanpa menggambarnya.',
    prediksiRows: [8, 10],
    prediksiCaption: 'Prediksi banyak unsur',
    instruksiPilah:
      'Kak Laras menerima enam rancangan bentangan karton. Tentukan rancangan mana yang dapat dilipat menjadi limas. Warna oranye menandai alas, biru menandai segitiga sisi tegak.',
    opsiKlas: OPSI_LIPAT,
    pilah: [
      {
        id: 'j1',
        nama: 'Rancangan A (limas segiempat)',
        spec: { n: 4, susun: 'bunga', tepi: [0, 1, 2, 3], s: 1, t: 1.2 },
        correct: 'bisa',
        explanation: '1 persegi dikelilingi 4 segitiga: dapat dilipat menjadi limas segiempat.',
      },
      {
        id: 'j2',
        nama: 'Rancangan B (limas segiempat)',
        spec: { n: 4, susun: 'kipas', segitiga: 4, alasPada: [0], s: 1, t: 1.2 },
        correct: 'bisa',
        explanation:
          '4 segitiga berjajar di satu puncak dan 1 persegi pada tepi segitiga: dapat dilipat.',
      },
      {
        id: 'j3',
        nama: 'Rancangan C (limas segiempat)',
        spec: { n: 4, susun: 'bunga', tepi: [0, 1, 2], s: 1, t: 1.2 },
        correct: 'tidak',
        explanation:
          'Hanya ada 3 segitiga, padahal alas persegi butuh 4 sisi tegak. Tersisa celah.',
      },
      {
        id: 'j4',
        nama: 'Rancangan D (limas segitiga)',
        spec: { n: 3, susun: 'kipas', segitiga: 3, alasPada: [0, 2], s: 1, t: 0.9 },
        correct: 'tidak',
        explanation:
          'Ada dua alas segitiga, padahal limas hanya punya satu alas. Ada yang menumpuk.',
      },
      {
        id: 'j5',
        nama: 'Rancangan E (limas segilima)',
        spec: { n: 5, susun: 'kipas', segitiga: 5, alasPada: [2], s: 0.7, t: 1 },
        correct: 'bisa',
        explanation: '5 segitiga dan 1 segilima: dapat dilipat menjadi limas segilima.',
      },
      {
        id: 'j6',
        nama: 'Rancangan F (limas segiempat)',
        spec: { n: 4, susun: 'kipas', segitiga: 5, alasPada: [2], s: 1, t: 1.2 },
        correct: 'tidak',
        explanation:
          'Ada 5 segitiga, padahal limas segiempat hanya punya 4 sisi tegak. Ada yang menumpuk.',
      },
    ],
    temuan:
      'Pola yang kamu temukan: limas segi-n memiliki (n + 1) titik sudut, 2n rusuk, dan (n + 1) sisi. Jaring-jaring limas segi-n tersusun atas satu segi-n dan n segitiga.',
    nextLabel: 'Lanjut ke Pembuktian →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    syntax: 'Discovery Learning · Sintaks 5 (Verification)',
    goal: 'Membuktikan pola dan ciri jaring-jaring pada limas baru, lalu meluruskan miskonsepsi.',
    guru: 'Minta murid membandingkan hasil hitungan langsung dengan prediksi dari pola. Bila berbeda, telusuri bersama bagian mana yang terlewat (biasanya titik puncak atau sisi alas).',
    n: 8,
    instruksiHitung:
      'Buktikan prediksimu untuk limas segidelapan. Tandai dan hitung langsung unsurnya pada penjelajah, lalu tulis hasilnya.',
    langkah: [
      {
        id: 'titik',
        label: 'Banyak titik sudut limas segidelapan (hasil menghitung langsung)',
        hints: [
          'Pilih “Tandai titik sudut”, lalu ketuk semua titik, termasuk titik puncak.',
          'Ada 8 titik pada alas dan 1 titik puncak.',
        ],
      },
      {
        id: 'rusuk',
        label: 'Banyak rusuk limas segidelapan',
        hints: [
          'Hitung per kelompok: rusuk alas, lalu rusuk tegak.',
          '8 rusuk alas + 8 rusuk tegak.',
        ],
      },
      {
        id: 'sisi',
        label: 'Banyak sisi limas segidelapan',
        hints: ['Miringkan limas ke bawah agar sisi alas terlihat.', '8 sisi tegak + 1 sisi alas.'],
      },
    ],
    instruksiJaring:
      'Dua rancangan baru datang. Prediksi dulu apakah bisa dilipat menjadi limas, lalu lipat untuk membuktikannya.',
    opsiPrediksi: OPSI_LIPAT,
    jaring: [
      {
        id: 'v1',
        nama: 'Lampion (limas segilima)',
        spec: { n: 5, susun: 'bunga', tepi: [0, 1, 2, 3, 4], s: 0.7, t: 1 },
      },
      {
        id: 'v2',
        nama: 'Atap menara (limas segienam)',
        spec: { n: 6, susun: 'kipas', segitiga: 6, alasPada: [], s: 0.6, t: 1 },
      },
    ],
    instruksiMiskonsepsi:
      'Beberapa teman punya pendapat berbeda. Tanggapi setiap pendapat berdasarkan temuanmu.',
    soal: [
      {
        id: 'mk1',
        teks: 'Doni: “Nasi tumpeng dan topi ulang tahun berbentuk limas, karena punya satu alas dan satu puncak.”',
        options: [
          {
            id: 'lengkung',
            label:
              'Doni keliru: tumpeng berbentuk kerucut, alasnya lingkaran dan selimutnya melengkung, tidak punya sisi tegak segitiga.',
          },
          { id: 'benar', label: 'Doni benar, karena ada satu puncak.' },
          { id: 'alas', label: 'Doni benar, karena alasnya hanya satu.' },
          { id: 'tinggi', label: 'Doni keliru, karena tumpeng tidak punya tinggi.' },
        ],
        correct: 'lengkung',
        explanation:
          'Limas adalah bangun ruang sisi datar: alasnya segi-n dan sisi tegaknya segitiga. Kerucut punya sisi lengkung.',
      },
      {
        id: 'mk2',
        teks: 'Sari: “Tenda pramuka yang berbentuk prisma segitiga adalah limas segitiga, karena ada sisi berbentuk segitiga.”',
        options: [
          {
            id: 'prisma',
            label:
              'Sari keliru: tenda itu punya dua sisi segitiga yang sejajar dan kongruen serta tidak punya titik puncak, jadi prisma.',
          },
          { id: 'benar', label: 'Sari benar, karena ada sisi segitiga.' },
          { id: 'datar', label: 'Sari benar, karena semua sisinya datar.' },
          { id: 'rusuk', label: 'Sari keliru, karena limas tidak punya rusuk.' },
        ],
        correct: 'prisma',
        explanation:
          'Ciri limas: satu alas dan sisi-sisi tegak segitiga yang bertemu di satu titik puncak. Prisma punya dua sisi sejajar yang kongruen.',
      },
      {
        id: 'mk3',
        teks: 'Budi menghitung rusuk limas segilima: “5 rusuk alas + 5 rusuk atas + 5 rusuk tegak = 15 rusuk.”',
        options: [
          {
            id: '10',
            label: 'Budi keliru: limas tidak punya rusuk atas, jadi rusuknya 5 + 5 = 10.',
          },
          { id: '15', label: 'Budi benar, rusuknya 15.' },
          { id: '6', label: 'Budi keliru, rusuknya 6.' },
          { id: '5', label: 'Budi keliru, rusuknya 5.' },
        ],
        correct: '10',
        explanation: 'Banyak rusuk limas segi-n adalah 2n. Untuk n = 5: 2 × 5 = 10.',
      },
      {
        id: 'mk4',
        teks: 'Rani: “Tinggi limas T.ABCD sama dengan panjang rusuk tegak TA.”',
        options: [
          {
            id: 'TO',
            label:
              'Rani keliru: tinggi limas adalah TO yang tegak lurus alas, lebih pendek daripada rusuk TA yang miring.',
          },
          { id: 'benar', label: 'Rani benar, karena TA berawal dari titik puncak.' },
          { id: 'AB', label: 'Rani keliru, tinggi limas sama dengan rusuk alas AB.' },
          { id: 'TP', label: 'Rani benar, karena TA sama dengan tinggi segitiga TP.' },
        ],
        correct: 'TO',
        explanation:
          'Tampilkan garis tinggi pada penjelajah: TO tegak lurus alas, sedangkan TA dan TP miring. Karena itu TO lebih pendek.',
      },
    ],
    nextLabel: 'Lanjut Menarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    syntax: 'Discovery Learning · Sintaks 6 (Generalization)',
    goal: 'Menyusun kesimpulan tentang unsur-unsur dan jaring-jaring limas.',
    guru: 'Minta beberapa murid membacakan kesimpulan dengan kalimat sendiri dan membandingkannya dengan dugaan/hipotesis awal. Ajak juga membandingkan pola limas dengan pola prisma.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari daftar. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'Limas adalah bangun ruang yang', correct: 'definisi' },
      { id: 'k2', awal: 'Nama limas ditentukan oleh', correct: 'nama' },
      { id: 'k3', awal: 'Rusuk limas segi-n terdiri atas', correct: 'rusuk' },
      { id: 'k4', awal: 'Limas segi-n memiliki', correct: 'rumus' },
      { id: 'k5', awal: 'Jaring-jaring limas segi-n terdiri atas', correct: 'jaring' },
      { id: 'k6', awal: 'Tinggi limas adalah', correct: 'tinggi' },
    ],
    bank: [
      {
        id: 'definisi',
        teks: 'dibatasi satu alas berbentuk segi-n dan sisi-sisi tegak berbentuk segitiga yang bertemu di satu titik puncak.',
      },
      { id: 'nama', teks: 'bentuk sisi alasnya.' },
      { id: 'rusuk', teks: 'n rusuk alas dan n rusuk tegak.' },
      { id: 'rumus', teks: '(n + 1) titik sudut, 2n rusuk, dan (n + 1) sisi.' },
      { id: 'jaring', teks: 'satu segi-n dan n segitiga.' },
      { id: 'tinggi', teks: 'jarak titik puncak ke alas, diukur tegak lurus alas.' },
      { id: 'x1', teks: '2n titik sudut, 3n rusuk, dan (n + 2) sisi.' },
      { id: 'x2', teks: 'panjang rusuk tegaknya.' },
      { id: 'x3', teks: 'dua segi-n dan n segitiga.' },
    ],
    dugaanJudul: 'Bandingkan dengan dugaan awalmu',
    tanggapanDugaan: {
      puncak:
        'Dugaanmu tepat! Keempat benda itu punya satu alas dan sisi-sisi tegak segitiga yang bertemu di titik puncak. Benda-benda itu berbentuk limas.',
      kongruen:
        'Dua sisi sejajar yang kongruen adalah ciri prisma. Ternyata keempat benda itu hanya punya satu alas dan meruncing ke satu titik puncak: semuanya limas.',
      lengkung:
        'Ternyata semua sisinya datar. Kesamaannya: satu alas dan sisi-sisi tegak segitiga yang bertemu di titik puncak, jadi semuanya limas.',
      balok:
        'Balok punya dua sisi sejajar dan tidak punya puncak. Keempat benda itu meruncing ke satu titik puncak, jadi semuanya limas.',
    },
    rangkuman: [
      'Unsur limas: <strong>titik sudut</strong> (termasuk <strong>titik puncak</strong>), <strong>rusuk</strong> (rusuk alas, rusuk tegak), dan <strong>sisi</strong> (satu sisi alas, sisi-sisi tegak berbentuk segitiga).',
      '<strong>Tinggi limas</strong> (TO) = jarak titik puncak ke alas yang tegak lurus alas; berbeda dengan rusuk tegak (TA) dan tinggi segitiga sisi tegak (TP).',
      'Limas segi-n: <strong>n + 1</strong> titik sudut, <strong>2n</strong> rusuk, <strong>n + 1</strong> sisi.',
      'Jaring-jaring limas segi-n: <strong>1 segi-n</strong> + <strong>n segitiga</strong>, disusun tanpa menumpuk dan tanpa celah.',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Discovery Learning · Penerapan',
    goal: 'Menerapkan pengetahuan unsur-unsur dan jaring-jaring limas pada situasi sehari-hari.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang banyak salah untuk dibahas bersama, dan minta murid menjelaskan cara menghitungnya.',
    instruksi:
      'Kerjakan setiap soal. Bila ragu, buka petunjuk. Setelah menjawab, baca penjelasannya sebelum lanjut.',
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: '⛺ Tenda kemah',
        cerita:
          'Tenda kemah Raka berbentuk limas segiempat. Alasnya ikut dijahit menjadi lantai tenda.',
        pertanyaan: 'Berapa banyak sisi tenda itu (termasuk lantainya)?',
        cek: { n: 4, jenis: 'sisi' },
        jawab: 5,
        satuan: 'sisi',
        hints: ['Limas segiempat: n = 4.', 'Banyak sisi = n + 1.'],
        explanation: 'Limas segiempat punya 4 sisi tegak + 1 sisi alas = 5 sisi.',
      },
      {
        id: 't2',
        type: 'input',
        konteks: '⛱️ Atap gazebo',
        cerita:
          'Atap gazebo sekolah berbentuk limas segienam. Di setiap rusuknya akan dipasang lampu hias.',
        pertanyaan: 'Berapa banyak rusuk yang harus dipasangi lampu?',
        cek: { n: 6, jenis: 'rusuk' },
        jawab: 12,
        satuan: 'rusuk',
        hints: ['Limas segienam: n = 6.', 'Banyak rusuk = 2n.'],
        explanation: '6 rusuk alas + 6 rusuk tegak = 12 rusuk.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: '🏮 Lampion kertas',
        cerita: 'Lampion berbentuk limas segilima. Di setiap titik sudutnya dipasang manik-manik.',
        pertanyaan: 'Berapa banyak manik-manik yang dibutuhkan?',
        cek: { n: 5, jenis: 'titik' },
        jawab: 6,
        satuan: 'manik-manik',
        hints: ['Limas segilima: n = 5.', 'Banyak titik sudut = n + 1 (jangan lupa titik puncak).'],
        explanation: '5 titik sudut pada alas + 1 titik puncak = 6 manik-manik.',
      },
      {
        id: 't4',
        type: 'choice',
        konteks: '🎁 Kotak hadiah',
        cerita: 'Sebuah kotak hadiah berbentuk limas dan memiliki 8 sisi.',
        pertanyaan: 'Limas apakah kotak hadiah itu?',
        cek: { n: 7, jenis: 'sisi', nilai: 8 },
        options: [
          { id: 'segitujuh', label: 'Limas segitujuh' },
          { id: 'segidelapan', label: 'Limas segidelapan' },
          { id: 'segienam', label: 'Limas segienam' },
          { id: 'segiempat', label: 'Limas segiempat' },
        ],
        correct: 'segitujuh',
        hints: ['Banyak sisi = n + 1 = 8.'],
        explanation: 'n + 1 = 8, jadi n = 7. Alasnya segitujuh: limas segitujuh.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: '🥤 Kerangka sedotan',
        cerita:
          'Mira membuat kerangka limas segitiga dari sedotan. Setiap rusuk memakai satu sedotan.',
        pertanyaan: 'Berapa banyak sedotan yang dibutuhkan Mira?',
        cek: { n: 3, jenis: 'rusuk' },
        jawab: 6,
        satuan: 'sedotan',
        hints: ['Kerangka dibentuk oleh rusuk-rusuk limas.', 'Banyak rusuk = 2n dengan n = 3.'],
        explanation: '3 rusuk alas + 3 rusuk tegak = 6 sedotan.',
      },
      {
        id: 't6',
        type: 'choice',
        konteks: '🔺 Miniatur piramida',
        cerita: 'Kak Laras akan memotong karton untuk miniatur piramida berbentuk limas segiempat.',
        pertanyaan: 'Rancangan mana yang dapat dilipat menjadi miniatur piramida?',
        options: [
          {
            id: 'valid',
            teks: 'Empat segitiga berjajar dan satu persegi',
            jaring: { n: 4, susun: 'kipas', segitiga: 4, alasPada: [1], s: 1, t: 1.2 },
          },
          {
            id: 'dua-alas',
            teks: 'Empat segitiga berjajar dan dua persegi',
            jaring: { n: 4, susun: 'kipas', segitiga: 4, alasPada: [0, 3], s: 1, t: 1.2 },
          },
          {
            id: 'kurang',
            teks: 'Satu persegi dengan tiga segitiga',
            jaring: { n: 4, susun: 'bunga', tepi: [0, 1, 3], s: 1, t: 1.2 },
          },
          {
            id: 'lebih',
            teks: 'Lima segitiga berjajar dan satu persegi',
            jaring: { n: 4, susun: 'kipas', segitiga: 5, alasPada: [2], s: 1, t: 1.2 },
          },
        ],
        correct: 'valid',
        hints: ['Butuh tepat 1 persegi dan 4 segitiga.'],
        explanation:
          'Limas segiempat butuh tepat 1 persegi (alas) dan 4 segitiga (sisi tegak), tanpa keping yang menumpuk.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: '🔍 Limas misteri',
        cerita: 'Sebuah limas memiliki 16 rusuk.',
        pertanyaan: 'Berapa banyak sisi limas itu?',
        cek: { n: 8, jenis: 'sisi', rusuk: 16 },
        jawab: 9,
        satuan: 'sisi',
        hints: ['Banyak rusuk = 2n = 16, jadi n = …', 'Banyak sisi = n + 1.'],
        explanation: '2n = 16 sehingga n = 8 (limas segidelapan). Banyak sisinya 8 + 1 = 9.',
      },
      {
        id: 't8',
        type: 'choice',
        konteks: '🏛️ Atap menara',
        cerita:
          'Atap menara berbentuk limas segiempat T.ABCD dengan alas ABCD dan O titik pusat alas.',
        pertanyaan: 'Manakah yang merupakan rusuk tegak?',
        options: [
          { id: 'TA', label: 'TA' },
          { id: 'AB', label: 'AB' },
          { id: 'AC', label: 'AC' },
          { id: 'TO', label: 'TO' },
        ],
        correct: 'TA',
        hints: ['Rusuk tegak menghubungkan titik puncak T dengan titik sudut pada alas.'],
        explanation:
          'TA menghubungkan titik puncak T dengan titik A pada alas. AB rusuk alas, AC diagonal alas, TO tinggi limas.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Discovery Learning · Penutup',
    goal: 'Merenungkan proses penemuan dan menilai pemahaman diri.',
    guru: 'Gunakan jawaban refleksi untuk mengetahui murid yang masih lupa titik puncak atau sisi alas saat menghitung, atau yang menyamakan tinggi limas dengan rusuk tegak. Jawaban hanya tersimpan di perangkat murid.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Dengan kalimatmu sendiri, sebutkan unsur-unsur limas dan cara menghitung banyaknya.',
        placeholder: 'Unsur limas adalah … Banyaknya bisa dihitung dengan …',
      },
      {
        id: 'r2',
        teks: 'Apakah dugaan dan hipotesismu di awal terbukti? Apa yang berubah dari pemikiranmu?',
        placeholder: 'Awalnya aku mengira … ternyata …',
      },
      {
        id: 'r3',
        teks: 'Apa perbedaan unsur dan jaring-jaring limas dengan prisma yang sudah kamu pelajari?',
        placeholder: 'Limas berbeda dengan prisma karena …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu mengidentifikasi unsur-unsur dan jaring-jaring limas sekarang?',
    diriOpsi: [
      { id: 'd1', label: '🌟 Sangat yakin, bisa menjelaskan ke teman' },
      { id: 'd2', label: '🙂 Yakin, tapi masih perlu latihan' },
      { id: 'd3', label: '🤔 Masih bingung di beberapa bagian' },
      { id: 'd4', label: '🆘 Perlu dibantu guru' },
    ],
    nextLabel: 'Simpan & Selesai',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, penemuanmu tuntas!',
    teks: 'Kamu telah menemukan sendiri unsur-unsur limas dan ciri jaring-jaringnya dengan mengamati, menghitung, melipat, dan merakit.',
    capaian: [
      'Menunjukkan titik puncak, titik sudut, rusuk alas, rusuk tegak, sisi alas, sisi tegak, dan tinggi limas.',
      'Menemukan bahwa limas segi-n memiliki (n + 1) titik sudut, 2n rusuk, dan (n + 1) sisi.',
      'Menamai limas berdasarkan bentuk sisi alasnya.',
      'Mengenali jaring-jaring limas: satu segi-n dan n segitiga.',
      'Menentukan apakah sebuah rancangan bentangan dapat dilipat menjadi limas.',
    ],
  },
};
