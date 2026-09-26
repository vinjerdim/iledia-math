'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Unsur-unsur & Jaring-jaring Prisma
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Tujuan Pembelajaran:
   Mengidentifikasi unsur-unsur prisma (titik sudut, rusuk alas/atas,
   rusuk tegak, sisi alas/atas, sisi tegak, tinggi) serta
   jaring-jaring prisma.

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
     1. Stimulasi   — etalase toko kemasan "Kardus Ceria": kotak
                      cokelat, kotak kue, tempat pensil, tenda mainan.
                      Murid MENDUGA kesamaan bentuknya + alasan
                      (tidak dinilai).
     2. Masalah     — memilih rumusan masalah & menulis hipotesis.
     3. Amati       — penjelajah prisma 3D: memutar prisma segitiga s.d.
                      segienam, menandai titik sudut/rusuk/sisi dengan
                      mengetuk, mengisi tabel unsur (berdiagnosa), lalu
                      menamai unsur (sisi alas/atas/tegak, rusuk tegak,
                      tinggi).
     4. Bongkar     — pelipat jaring: melipat/membuka jaring-jaring tiga
                      kemasan; perakit jaring: menempel dua segitiga pada
                      sabuk persegi panjang lalu menguji lipatannya.
     5. Olah data   — pertanyaan penuntun pola 2n, 3n, n + 2; prediksi
                      tabel untuk prisma segidelapan & segisepuluh;
                      memilah 6 jaring-jaring: dapat/tidak dapat dilipat.
     6. Pembuktian  — menghitung unsur prisma segidelapan di penjelajah,
                      memprediksi lalu melipat dua jaring baru, dan
                      menanggapi miskonsepsi.
     7. Simpulan    — menyusun kalimat kesimpulan dari bank kalimat.
     8. Uji terap   — 8 soal kontekstual.
     9. Refleksi    — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan.

   Jaring-jaring ditulis sebagai spec sabuk (lihat shared/engine.js
   seksi 31): { n, sabuk, atas: [i], alas: [i], s, h }. Semua kunci
   (banyak unsur, dapat/tidak dilipat) diuji terhadap engine di
   tests/mpi-22.1-data.test.js.
   ============================================================ */

var OPSI_LIPAT = [
  { id: 'bisa', label: 'Dapat dilipat menjadi prisma' },
  { id: 'tidak', label: 'Tidak dapat dilipat menjadi prisma' },
];

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1 (Stimulation)',
    goal: 'Mengamati benda-benda kemasan di sekitar dan menduga kesamaan bentuknya.',
    tp: 'Mengidentifikasi unsur-unsur prisma (titik sudut, rusuk alas/atas, rusuk tegak, sisi alas/atas, sisi tegak, tinggi) serta jaring-jaring prisma.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menunjukkan titik sudut, rusuk, sisi, dan tinggi pada sebuah prisma.',
      'Menemukan hubungan banyak titik sudut, rusuk, dan sisi prisma segi-n dengan n.',
      'Menamai prisma berdasarkan bentuk sisi alasnya.',
      'Menentukan apakah sebuah jaring-jaring dapat dilipat menjadi prisma.',
    ],
    guru: 'Tampilkan atau bawa benda nyata (kotak cokelat batang, kotak kue, tempat pensil). Biarkan murid menduga tanpa dikoreksi; dugaan akan diuji di tahap-tahap berikutnya.',
    judul: 'Etalase Toko Kemasan “Kardus Ceria”',
    cerita:
      'Bu Rina membuka toko kemasan. Di etalasenya berjajar empat benda: kotak cokelat batang, kotak kue, tempat pensil, dan tenda mainan. Semuanya dibuat dari selembar karton yang dipotong lalu dilipat.',
    benda: [
      { id: 'cokelat', nama: '🍫 Kotak cokelat batang', n: 3, sumbu: 'rebah', tinggi: 2.6 },
      { id: 'kue', nama: '🎂 Kotak kue', n: 4, sumbu: 'tegak', tinggi: 1 },
      { id: 'pensil', nama: '✏️ Tempat pensil', n: 6, sumbu: 'rebah', tinggi: 2.6 },
      { id: 'tenda', nama: '⛺ Tenda mainan', n: 3, sumbu: 'rebah', tinggi: 1.6 },
    ],
    pertanyaan: 'Menurut dugaanmu, apa kesamaan bentuk keempat benda itu?',
    opsi: [
      {
        id: 'kongruen',
        label:
          'Semuanya punya dua sisi yang bentuk dan ukurannya sama, saling berhadapan dan sejajar',
      },
      { id: 'balok', label: 'Semuanya berbentuk balok' },
      { id: 'lengkung', label: 'Semuanya punya sisi yang melengkung' },
      { id: 'puncak', label: 'Semuanya punya satu titik puncak di atas' },
    ],
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
    guru: 'Diskusikan mengapa pembuat kotak perlu tahu banyak rusuk, sisi, dan bentuk bentangan karton. Terima hipotesis apa pun selama bisa diuji.',
    pengantar:
      'Bu Rina ingin membuat kotak-kotak baru dari karton. Agar tidak salah potong, ia perlu tahu bagian-bagian kotak (sisi, rusuk, titik sudut) dan bentuk bentangan karton sebelum dilipat, yang disebut jaring-jaring.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'unsur',
        label:
          'Unsur apa saja yang dimiliki prisma, berapa banyaknya, dan seperti apa jaring-jaringnya?',
      },
      { id: 'harga', label: 'Berapa harga karton untuk membuat satu kotak?' },
      { id: 'warna', label: 'Warna apa yang paling menarik untuk kotak kemasan?' },
      { id: 'volume', label: 'Berapa banyak air yang dapat ditampung kotak kue?' },
    ],
    correct: 'unsur',
    umpan: {
      unsur:
        'Tepat! Pertanyaan ini bisa diselidiki dengan mengamati, menghitung, dan membongkar kotak.',
      harga:
        'Harga memang penting untuk toko, tetapi tidak menjelaskan bentuk kotak. Coba pilih yang lain.',
      warna: 'Warna tidak mengubah bentuk kotak. Pilih pertanyaan tentang bagian-bagian kotak.',
      volume:
        'Volume akan dipelajari nanti. Sekarang Bu Rina perlu tahu bagian-bagian dan bentangan kotaknya.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu, apa hubungan bentuk alas prisma dengan banyak sisi dan rusuknya?',
    hipotesisPlaceholder: 'Menurutku, makin banyak sudut pada alasnya, …',
    nextLabel: 'Lanjut Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MENGAMATI UNSUR
     ---------------------------------------------------------- */
  amati: {
    kicker: 'Tahap 3 · Mengumpulkan Data: Mengamati Unsur',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Mengamati dan menghitung titik sudut, rusuk, dan sisi berbagai prisma.',
    guru: 'Dorong murid memutar prisma sebelum menghitung sisi: sisi di belakang hanya bisa diketuk setelah terlihat. Tanyakan “Bagaimana kamu memastikan tidak ada yang terhitung dua kali?”.',
    instruksi:
      'Pilih sebuah prisma, lalu putar dan miringkan untuk melihat semua bagiannya. Pilih jenis unsur (titik sudut, rusuk, atau sisi), lalu ketuk unsur itu satu per satu pada gambar. Penghitung di bawah gambar membantumu menghitung.',
    tabelRows: [3, 4, 5, 6],
    tabelCaption: 'Banyak unsur setiap prisma',
    instruksiTabel:
      'Catat hasil pengamatanmu. Tabel baru bisa diperiksa setelah semua kotak terisi.',
    tanyaInstruksi:
      'Perhatikan prisma segitiga ABC.DEF pada penjelajah (ketuk unsurnya untuk melihat nama). Jawab pertanyaan berikut.',
    tanya: [
      {
        id: 'i1',
        tanya: 'Pada prisma ABC.DEF, sisi ABC dan sisi DEF disebut …',
        opsi: [
          { id: 'alasatas', label: 'sisi alas dan sisi atas (tutup)' },
          { id: 'tegak', label: 'sisi tegak' },
          { id: 'rusuk', label: 'rusuk tegak' },
          { id: 'diagonal', label: 'bidang diagonal' },
        ],
        correct: 'alasatas',
        umpan: {
          alasatas:
            'Tepat! Dua sisi yang berhadapan ini disebut sisi alas dan sisi atas. Bentuknya menentukan nama prisma.',
          tegak:
            'Sisi tegak adalah sisi yang menghubungkan alas dan atas, seperti ABED. Coba lagi.',
          rusuk:
            'Rusuk adalah ruas garis pertemuan dua sisi, bukan bidang. ABC adalah sebuah bidang.',
          diagonal:
            'Bidang diagonal memotong bagian dalam prisma. ABC dan DEF berada di permukaan. Coba lagi.',
        },
      },
      {
        id: 'i2',
        tanya: 'Rusuk AD, BE, dan CF disebut …',
        opsi: [
          { id: 'tegak', label: 'rusuk tegak' },
          { id: 'alas', label: 'rusuk alas' },
          { id: 'atas', label: 'rusuk atas' },
          { id: 'diagonal', label: 'diagonal sisi' },
        ],
        correct: 'tegak',
        umpan: {
          tegak: 'Tepat! Rusuk tegak menghubungkan titik pada alas dengan titik pada sisi atas.',
          alas: 'Rusuk alas adalah AB, BC, dan CA, yang membatasi sisi alas. Coba lagi.',
          atas: 'Rusuk atas adalah DE, EF, dan FD. Coba lagi.',
          diagonal:
            'Diagonal sisi menghubungkan dua titik yang tidak bersebelahan pada satu sisi. AD adalah tepi prisma.',
        },
      },
      {
        id: 'i3',
        tanya: 'Sisi tegak pada prisma tegak berbentuk …',
        opsi: [
          { id: 'pp', label: 'persegi panjang' },
          { id: 'segitiga', label: 'segitiga' },
          { id: 'alas', label: 'sama dengan bentuk alasnya' },
          { id: 'trapesium', label: 'trapesium' },
        ],
        correct: 'pp',
        umpan: {
          pp: 'Tepat! Pada prisma tegak, setiap sisi tegak berbentuk persegi panjang (atau persegi).',
          segitiga:
            'Segitiga adalah bentuk alas prisma segitiga. Ketuk sisi ABED dan perhatikan bentuknya.',
          alas: 'Itu bentuk sisi alas dan sisi atas. Perhatikan sisi yang berdiri tegak.',
          trapesium:
            'Perhatikan lagi: sisi tegak punya dua pasang sisi sejajar dan empat sudut siku-siku.',
        },
      },
      {
        id: 'i4',
        tanya: 'Sisi alas dan sisi atas sebuah prisma selalu …',
        opsi: [
          { id: 'kongruen', label: 'sejajar dan kongruen (sama bentuk dan ukuran)' },
          { id: 'tegaklurus', label: 'tegak lurus satu sama lain' },
          { id: 'beda', label: 'berbeda ukuran, yang atas lebih kecil' },
          { id: 'pp', label: 'berbentuk persegi panjang' },
        ],
        correct: 'kongruen',
        umpan: {
          kongruen: 'Tepat! Inilah ciri utama prisma: dua sisi yang sejajar dan kongruen.',
          tegaklurus: 'Putar prisma: sisi alas dan atas saling berhadapan, tidak berpotongan.',
          beda: 'Bila sisi atas lebih kecil, bangunnya menjadi limas terpancung, bukan prisma. Coba lagi.',
          pp: 'Tidak selalu. Pada prisma segitiga, alas dan atasnya berbentuk segitiga.',
        },
      },
      {
        id: 'i5',
        tanya: 'Tinggi prisma tegak sama dengan panjang …',
        opsi: [
          { id: 'tegak', label: 'rusuk tegaknya' },
          { id: 'alas', label: 'rusuk alasnya' },
          { id: 'keliling', label: 'keliling alasnya' },
          { id: 'diagonal', label: 'diagonal alasnya' },
        ],
        correct: 'tegak',
        umpan: {
          tegak:
            'Tepat! Tinggi prisma adalah jarak antara sisi alas dan sisi atas, yaitu panjang rusuk tegaknya.',
          alas: 'Rusuk alas terletak mendatar pada alas. Tinggi diukur dari alas ke atas.',
          keliling: 'Keliling alas adalah panjang tepi alas, bukan jarak alas ke atas.',
          diagonal:
            'Diagonal alas terletak mendatar pada alas. Tinggi diukur tegak dari alas ke atas.',
        },
      },
    ],
    temuan:
      'Temuanmu: prisma punya dua sisi yang sejajar dan kongruen (sisi alas & sisi atas), sisi-sisi tegak berbentuk persegi panjang, serta rusuk alas, rusuk atas, dan rusuk tegak.',
    nextLabel: 'Lanjut Membongkar Kotak →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MEMBONGKAR & MERAKIT JARING-JARING
     ---------------------------------------------------------- */
  bongkar: {
    kicker: 'Tahap 4 · Mengumpulkan Data: Membongkar Kotak',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Mengamati jaring-jaring prisma dengan melipat dan merakitnya.',
    guru: 'Bila memungkinkan, sediakan kotak kemasan bekas yang bisa digunting murid di sepanjang rusuknya. Bandingkan bentangan karton nyata dengan simulasi.',
    instruksiLipat:
      'Pilih sebuah kemasan. Geser penggeser “Lipat” atau tekan ▶ Lipat untuk melihat bentangan karton berubah menjadi kotak, lalu ◀ Buka untuk membentangkannya lagi. Lipat penuh ketiga kemasan.',
    lipat: {
      3: { n: 3, atas: [1], alas: [1], s: 1, h: 2.2 },
      4: { n: 4, atas: [1], alas: [1], s: 1.2, h: 0.9 },
      6: { n: 6, atas: [2], alas: [2], s: 0.7, h: 2 },
    },
    namaKemasan: {
      3: '🍫 Kotak cokelat',
      4: '🎂 Kotak kue',
      6: '✏️ Tempat pensil',
    },
    tanyaLipat: [
      {
        id: 'b1',
        tanya: 'Jaring-jaring kotak cokelat (prisma segitiga) terdiri atas …',
        opsi: [
          { id: '3pp2s', label: '3 persegi panjang dan 2 segitiga' },
          { id: '2pp3s', label: '2 persegi panjang dan 3 segitiga' },
          { id: '5pp', label: '5 persegi panjang' },
          { id: '3s', label: '3 segitiga saja' },
        ],
        correct: '3pp2s',
        umpan: {
          '3pp2s':
            'Tepat! 3 persegi panjang menjadi sisi tegak, 2 segitiga menjadi alas dan tutup.',
          '2pp3s': 'Hitung lagi bagian yang berwarna biru (persegi panjang) dan oranye (segitiga).',
          '5pp':
            'Jumlah kepingnya memang 5, tetapi tidak semuanya persegi panjang. Perhatikan warnanya.',
          '3s': 'Buka jaring-jaringnya lagi: ada keping persegi panjang juga.',
        },
      },
      {
        id: 'b2',
        tanya: 'Saat dilipat, rangkaian persegi panjang pada jaring-jaring menjadi …',
        opsi: [
          { id: 'tegak', label: 'sisi-sisi tegak prisma' },
          { id: 'alas', label: 'sisi alas dan sisi atas' },
          { id: 'rusuk', label: 'rusuk-rusuk prisma' },
          { id: 'titik', label: 'titik-titik sudut prisma' },
        ],
        correct: 'tegak',
        umpan: {
          tegak: 'Tepat! Persegi panjang-persegi panjang itu melingkar menjadi sisi tegak prisma.',
          alas: 'Alas dan tutup berasal dari keping segi-n (berwarna oranye). Coba lagi.',
          rusuk: 'Rusuk adalah garis lipatan dan tepi keping, bukan kepingnya. Coba lagi.',
          titik: 'Titik sudut adalah pojok-pojok keping. Keping itu sendiri menjadi sisi.',
        },
      },
      {
        id: 'b3',
        tanya: 'Banyak persegi panjang pada jaring-jaring tempat pensil (prisma segienam) adalah …',
        opsi: [
          { id: '6', label: '6' },
          { id: '2', label: '2' },
          { id: '8', label: '8' },
          { id: '12', label: '12' },
        ],
        correct: '6',
        umpan: {
          6: 'Tepat! Alas segienam punya 6 rusuk, jadi ada 6 sisi tegak berbentuk persegi panjang.',
          2: '2 adalah banyak keping segienam (alas dan tutup). Hitung keping persegi panjangnya.',
          8: '8 adalah banyak semua keping. Hitung persegi panjangnya saja.',
          12: 'Itu banyak titik sudut prisma segienam. Hitung keping persegi panjangnya.',
        },
      },
    ],
    instruksiRakit:
      'Sekarang giliranmu merakit jaring-jaring kotak cokelat. Ketuk tanda + untuk menempelkan segitiga pada tepi atas atau tepi bawah persegi panjang (ketuk lagi untuk melepasnya). Tekan “Lipat & Uji” untuk mencoba melipatnya. Temukan paling sedikit dua jaring-jaring berbeda yang berhasil.',
    rakit: { n: 3, s: 1, h: 1.6 },
    targetRakit: 2,
    tanyaRakit: [
      {
        id: 'b4',
        tanya:
          'Agar jaring-jaring dapat dilipat menjadi prisma segitiga, letak kedua segitiga harus …',
        opsi: [
          {
            id: 'seberang',
            label: 'satu di tepi atas dan satu di tepi bawah rangkaian persegi panjang',
          },
          { id: 'atas', label: 'keduanya di tepi atas rangkaian persegi panjang' },
          { id: 'bebas', label: 'bebas di mana saja, asal ada dua segitiga' },
          { id: 'ujung', label: 'keduanya di ujung kanan rangkaian' },
        ],
        correct: 'seberang',
        umpan: {
          seberang: 'Tepat! Satu segitiga menutup bagian atas, yang lain menutup bagian bawah.',
          atas: 'Coba rakit seperti itu lalu lipat: keduanya menumpuk di atas dan bagian bawah terbuka.',
          bebas:
            'Tidak bebas. Coba tempel keduanya di tepi yang sama, lalu lipat. Apa yang terjadi?',
          ujung:
            'Segitiga harus menempel pada tepi atas atau bawah persegi panjang, bukan di sampingnya.',
        },
      },
    ],
    temuan:
      'Temuanmu: jaring-jaring prisma segi-n terdiri atas n persegi panjang (menjadi sisi tegak) dan dua segi-n yang kongruen (menjadi alas dan tutup). Kedua segi-n harus berada di sisi yang berseberangan.',
    nextLabel: 'Lanjut Mengolah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGOLAH DATA
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 5 · Mengolah Data',
    syntax: 'Discovery Learning · Sintaks 4 (Data Processing)',
    goal: 'Menemukan pola banyak unsur prisma segi-n dan ciri jaring-jaring prisma.',
    guru: 'Minta murid membaca tabel secara mendatar (per prisma) dan menurun (per unsur). Tanyakan: “Berapa kali n banyak titik sudutnya? Dari mana tambahan 2 pada banyak sisi?”.',
    instruksiPola:
      'Lihat kembali tabel hasil pengamatanmu, lalu jawab pertanyaan untuk prisma dengan alas segi-n.',
    konsep: [
      {
        id: 'o1',
        tanya: 'Banyak titik sudut prisma segi-n adalah …',
        opsi: [
          { id: '2n', label: '2n' },
          { id: 'n', label: 'n' },
          { id: 'n+2', label: 'n + 2' },
          { id: '3n', label: '3n' },
        ],
        correct: '2n',
        umpan: {
          '2n': 'Tepat! Ada n titik sudut pada alas dan n titik sudut pada sisi atas: n + n = 2n.',
          n: 'n adalah banyak titik sudut pada satu alas saja. Bagaimana dengan sisi atasnya?',
          'n+2': 'Cek pada prisma segitiga: 3 + 2 = 5, padahal titik sudutnya 6.',
          '3n': 'Cek pada prisma segitiga: 3 × 3 = 9, padahal titik sudutnya 6.',
        },
      },
      {
        id: 'o2',
        tanya: 'Banyak rusuk prisma segi-n adalah …',
        opsi: [
          { id: '3n', label: '3n' },
          { id: '2n', label: '2n' },
          { id: 'n+2', label: 'n + 2' },
          { id: '2n+2', label: '2n + 2' },
        ],
        correct: '3n',
        umpan: {
          '3n': 'Tepat! n rusuk alas + n rusuk atas + n rusuk tegak = 3n.',
          '2n': '2n baru rusuk alas dan rusuk atas. Rusuk tegaknya belum terhitung.',
          'n+2': 'Cek pada prisma segiempat: 4 + 2 = 6, padahal rusuknya 12.',
          '2n+2': 'Cek pada prisma segitiga: 2 × 3 + 2 = 8, padahal rusuknya 9.',
        },
      },
      {
        id: 'o3',
        tanya: 'Banyak sisi prisma segi-n adalah …',
        opsi: [
          { id: 'n+2', label: 'n + 2' },
          { id: 'n', label: 'n' },
          { id: '2n', label: '2n' },
          { id: '3n', label: '3n' },
        ],
        correct: 'n+2',
        umpan: {
          'n+2': 'Tepat! Ada n sisi tegak ditambah 2 sisi (alas dan atas).',
          n: 'n baru banyak sisi tegaknya. Sisi alas dan sisi atas juga dihitung.',
          '2n': 'Cek pada prisma segitiga: 2 × 3 = 6, padahal sisinya 5.',
          '3n': 'Cek pada prisma segitiga: 3 × 3 = 9, padahal sisinya 5.',
        },
      },
      {
        id: 'o4',
        tanya: 'Nama sebuah prisma ditentukan oleh …',
        opsi: [
          { id: 'alas', label: 'bentuk sisi alasnya' },
          { id: 'rusuk', label: 'banyak rusuknya' },
          { id: 'tinggi', label: 'tingginya' },
          { id: 'tegak', label: 'bentuk sisi tegaknya' },
        ],
        correct: 'alas',
        umpan: {
          alas: 'Tepat! Alas segitiga → prisma segitiga, alas segienam → prisma segienam.',
          rusuk: 'Banyak rusuk mengikuti bentuk alas, tetapi namanya diambil dari bentuk alas.',
          tinggi: 'Prisma tinggi maupun pendek dengan alas segitiga tetap disebut prisma segitiga.',
          tegak:
            'Sisi tegak prisma tegak selalu persegi panjang, jadi tidak bisa membedakan nama prisma.',
        },
      },
    ],
    instruksiPrediksi:
      'Gunakan pola yang kamu temukan untuk memprediksi banyak unsur prisma berikut tanpa menggambarnya.',
    prediksiRows: [8, 10],
    prediksiCaption: 'Prediksi banyak unsur',
    instruksiPilah:
      'Bu Rina menerima enam rancangan bentangan karton. Tentukan rancangan mana yang dapat dilipat menjadi prisma. Warna oranye menandai segi-n, biru menandai persegi panjang.',
    opsiKlas: OPSI_LIPAT,
    pilah: [
      {
        id: 'j1',
        nama: 'Rancangan A (prisma segitiga)',
        spec: { n: 3, atas: [0], alas: [0], s: 1, h: 1.6 },
        correct: 'bisa',
        explanation: '3 persegi panjang dan 2 segitiga berseberangan: dapat dilipat.',
      },
      {
        id: 'j2',
        nama: 'Rancangan B (prisma segitiga)',
        spec: { n: 3, atas: [0], alas: [2], s: 1, h: 1.6 },
        correct: 'bisa',
        explanation:
          'Segitiga boleh menempel pada persegi panjang yang berbeda, asal satu di atas dan satu di bawah.',
      },
      {
        id: 'j3',
        nama: 'Rancangan C (prisma segitiga)',
        spec: { n: 3, atas: [0, 2], alas: [], s: 1, h: 1.6 },
        correct: 'tidak',
        explanation:
          'Kedua segitiga berada di tepi atas: saat dilipat keduanya menumpuk dan bagian bawah terbuka.',
      },
      {
        id: 'j4',
        nama: 'Rancangan D (prisma segiempat)',
        spec: { n: 4, sabuk: 3, atas: [1], alas: [1], s: 1, h: 1.4 },
        correct: 'tidak',
        explanation:
          'Hanya ada 3 persegi panjang, padahal prisma segiempat butuh 4 sisi tegak. Tersisa celah.',
      },
      {
        id: 'j5',
        nama: 'Rancangan E (prisma segienam)',
        spec: { n: 6, atas: [1], alas: [4], s: 0.6, h: 1.4 },
        correct: 'bisa',
        explanation:
          '6 persegi panjang dan 2 segienam berseberangan: dapat dilipat menjadi prisma segienam.',
      },
      {
        id: 'j6',
        nama: 'Rancangan F (prisma segilima)',
        spec: { n: 5, sabuk: 6, atas: [2], alas: [3], s: 0.7, h: 1.4 },
        correct: 'tidak',
        explanation:
          'Ada 6 persegi panjang, padahal prisma segilima hanya punya 5 sisi tegak. Ada yang menumpuk.',
      },
    ],
    temuan:
      'Pola yang kamu temukan: prisma segi-n memiliki 2n titik sudut, 3n rusuk, dan (n + 2) sisi. Jaring-jaring prisma segi-n tersusun atas n persegi panjang dan dua segi-n yang letaknya berseberangan.',
    nextLabel: 'Lanjut ke Pembuktian →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    syntax: 'Discovery Learning · Sintaks 5 (Verification)',
    goal: 'Membuktikan pola dan ciri jaring-jaring pada prisma baru, lalu meluruskan miskonsepsi.',
    guru: 'Minta murid membandingkan hasil hitungan langsung dengan prediksi dari pola. Bila berbeda, telusuri bersama bagian mana yang terlewat.',
    n: 8,
    instruksiHitung:
      'Buktikan prediksimu untuk prisma segidelapan. Tandai dan hitung langsung unsurnya pada penjelajah, lalu tulis hasilnya.',
    langkah: [
      {
        id: 'titik',
        label: 'Banyak titik sudut prisma segidelapan (hasil menghitung langsung)',
        hints: [
          'Pilih “Tandai titik sudut”, lalu ketuk semua titik, termasuk yang di belakang.',
          'Ada 8 titik pada alas dan 8 titik pada sisi atas.',
        ],
      },
      {
        id: 'rusuk',
        label: 'Banyak rusuk prisma segidelapan',
        hints: [
          'Hitung per kelompok: rusuk alas, rusuk atas, lalu rusuk tegak.',
          '8 rusuk alas + 8 rusuk atas + 8 rusuk tegak.',
        ],
      },
      {
        id: 'sisi',
        label: 'Banyak sisi prisma segidelapan',
        hints: [
          'Putar prisma agar sisi di belakang dan di bawah terlihat.',
          '8 sisi tegak + sisi alas + sisi atas.',
        ],
      },
    ],
    instruksiJaring:
      'Dua rancangan baru datang. Prediksi dulu apakah bisa dilipat menjadi prisma, lalu lipat untuk membuktikannya.',
    opsiPrediksi: OPSI_LIPAT,
    jaring: [
      {
        id: 'v1',
        nama: 'Kotak lampion (prisma segienam)',
        spec: { n: 6, atas: [0], alas: [5], s: 0.6, h: 1.5 },
      },
      {
        id: 'v2',
        nama: 'Kotak mainan (prisma segilima)',
        spec: { n: 5, atas: [1, 3], alas: [], s: 0.7, h: 1.5 },
      },
    ],
    instruksiMiskonsepsi:
      'Beberapa teman punya pendapat berbeda. Tanggapi setiap pendapat berdasarkan temuanmu.',
    soal: [
      {
        id: 'mk1',
        teks: 'Doni: “Kaleng susu berbentuk tabung juga prisma, karena punya dua alas yang sama dan sejajar.”',
        options: [
          {
            id: 'lengkung',
            label:
              'Doni keliru: tabung punya sisi lengkung, tidak punya sisi tegak persegi panjang maupun rusuk tegak.',
          },
          { id: 'benar', label: 'Doni benar, karena alas dan tutup tabung kongruen.' },
          { id: 'tinggi', label: 'Doni benar, karena tabung juga punya tinggi.' },
          { id: 'noalas', label: 'Doni keliru, karena tabung tidak punya alas.' },
        ],
        correct: 'lengkung',
        explanation:
          'Prisma adalah bangun ruang sisi datar. Tabung memang punya dua alas kongruen, tetapi selimutnya melengkung.',
      },
      {
        id: 'mk2',
        teks: 'Sari: “Piramida (limas segiempat) adalah prisma segiempat, karena alasnya persegi.”',
        options: [
          {
            id: 'satu',
            label:
              'Sari keliru: limas hanya punya satu alas, sisi tegaknya segitiga yang bertemu di satu titik puncak.',
          },
          { id: 'benar', label: 'Sari benar, karena alasnya segiempat.' },
          { id: 'datar', label: 'Sari benar, karena semua sisinya datar.' },
          { id: 'rusuk', label: 'Sari keliru, karena limas tidak punya rusuk.' },
        ],
        correct: 'satu',
        explanation:
          'Prisma selalu punya dua sisi sejajar yang kongruen dan sisi tegak persegi panjang. Limas tidak.',
      },
      {
        id: 'mk3',
        teks: 'Rani: “Asal ada 4 persegi panjang dan 2 persegi, bentangannya pasti bisa dilipat menjadi kotak kue.”',
        options: [
          {
            id: 'letak',
            label: 'Rani keliru: letak keping juga menentukan, kedua persegi harus berseberangan.',
          },
          { id: 'benar', label: 'Rani benar, banyak kepingnya sudah cukup.' },
          { id: 'warna', label: 'Rani benar, asal kepingnya sama warna.' },
          { id: 'delapan', label: 'Rani keliru, kotak kue butuh 8 persegi panjang.' },
        ],
        correct: 'letak',
        explanation:
          'Ingat rancangan C: kepingnya lengkap tetapi kedua segi-n sepihak, sehingga tidak dapat dilipat menjadi prisma.',
      },
      {
        id: 'mk4',
        teks: 'Budi menghitung rusuk prisma segilima: “5 rusuk alas + 5 rusuk atas = 10 rusuk.”',
        options: [
          { id: '15', label: 'Budi keliru: masih ada 5 rusuk tegak, jadi rusuknya 15.' },
          { id: '10', label: 'Budi benar, rusuknya 10.' },
          { id: '7', label: 'Budi keliru, rusuknya 7.' },
          { id: '20', label: 'Budi keliru, rusuknya 20.' },
        ],
        correct: '15',
        explanation: 'Banyak rusuk prisma segi-n adalah 3n. Untuk n = 5: 3 × 5 = 15.',
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
    goal: 'Menyusun kesimpulan tentang unsur-unsur dan jaring-jaring prisma.',
    guru: 'Minta beberapa murid membacakan kesimpulan dengan kalimat sendiri dan membandingkannya dengan dugaan/hipotesis awal.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari daftar. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'Prisma adalah bangun ruang yang', correct: 'definisi' },
      { id: 'k2', awal: 'Nama prisma ditentukan oleh', correct: 'nama' },
      { id: 'k3', awal: 'Rusuk prisma segi-n terdiri atas', correct: 'rusuk' },
      { id: 'k4', awal: 'Prisma segi-n memiliki', correct: 'rumus' },
      { id: 'k5', awal: 'Jaring-jaring prisma segi-n terdiri atas', correct: 'jaring' },
      { id: 'k6', awal: 'Agar jaring-jaring dapat dilipat menjadi prisma,', correct: 'syarat' },
    ],
    bank: [
      {
        id: 'definisi',
        teks: 'dibatasi dua sisi sejajar yang kongruen (alas dan atas) serta sisi-sisi tegak berbentuk persegi panjang.',
      },
      { id: 'nama', teks: 'bentuk sisi alasnya.' },
      { id: 'rusuk', teks: 'n rusuk alas, n rusuk atas, dan n rusuk tegak.' },
      { id: 'rumus', teks: '2n titik sudut, 3n rusuk, dan (n + 2) sisi.' },
      { id: 'jaring', teks: 'n persegi panjang dan dua segi-n yang kongruen.' },
      {
        id: 'syarat',
        teks: 'kedua segi-n harus berada di sisi yang berseberangan pada rangkaian persegi panjang.',
      },
      { id: 'x1', teks: 'n titik sudut, 2n rusuk, dan n sisi.' },
      { id: 'x2', teks: 'banyak rusuk tegaknya saja.' },
      { id: 'x3', teks: 'kedua segi-n boleh berada di sisi yang sama.' },
    ],
    dugaanJudul: 'Bandingkan dengan dugaan awalmu',
    tanggapanDugaan: {
      kongruen:
        'Dugaanmu tepat! Kesamaannya adalah dua sisi sejajar yang kongruen, yaitu sisi alas dan sisi atas. Benda-benda itu berbentuk prisma.',
      balok:
        'Ternyata hanya kotak kue yang berbentuk balok (prisma segiempat). Kesamaan semuanya: dua sisi sejajar yang kongruen, jadi semuanya prisma.',
      lengkung:
        'Ternyata semua sisinya datar. Kesamaannya: dua sisi sejajar yang kongruen, jadi semuanya prisma.',
      puncak:
        'Bangun dengan satu titik puncak adalah limas. Keempat benda itu tidak punya puncak; semuanya punya dua sisi sejajar yang kongruen, yaitu prisma.',
    },
    rangkuman: [
      'Unsur prisma: <strong>titik sudut</strong>, <strong>rusuk</strong> (rusuk alas, rusuk atas, rusuk tegak), dan <strong>sisi</strong> (sisi alas, sisi atas, sisi tegak).',
      'Tinggi prisma tegak = panjang rusuk tegaknya.',
      'Prisma segi-n: <strong>2n</strong> titik sudut, <strong>3n</strong> rusuk, <strong>n + 2</strong> sisi.',
      'Jaring-jaring prisma segi-n: <strong>n persegi panjang</strong> + <strong>2 segi-n kongruen</strong> yang berseberangan.',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Discovery Learning · Penerapan',
    goal: 'Menerapkan pengetahuan unsur-unsur dan jaring-jaring prisma pada situasi sehari-hari.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang banyak salah untuk dibahas bersama, dan minta murid menjelaskan cara menghitungnya.',
    instruksi:
      'Kerjakan setiap soal. Bila ragu, buka petunjuk. Setelah menjawab, baca penjelasannya sebelum lanjut.',
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: '⛺ Tenda pramuka',
        cerita:
          'Tenda pramuka berbentuk prisma segitiga yang berdiri pada salah satu sisi tegaknya.',
        pertanyaan: 'Berapa banyak sisi tenda itu (termasuk bagian yang menempel di tanah)?',
        cek: { n: 3, jenis: 'sisi' },
        jawab: 5,
        satuan: 'sisi',
        hints: ['Prisma segitiga: n = 3.', 'Banyak sisi = n + 2.'],
        explanation: 'Prisma segitiga punya 3 sisi tegak + 2 sisi segitiga = 5 sisi.',
      },
      {
        id: 't2',
        type: 'input',
        konteks: '✏️ Tempat pensil',
        cerita:
          'Tempat pensil Wulan berbentuk prisma segienam. Wulan ingin menempel pita hias di setiap rusuknya.',
        pertanyaan: 'Berapa banyak rusuk yang harus ditempeli pita?',
        cek: { n: 6, jenis: 'rusuk' },
        jawab: 18,
        satuan: 'rusuk',
        hints: ['Prisma segienam: n = 6.', 'Banyak rusuk = 3n.'],
        explanation: '6 rusuk alas + 6 rusuk atas + 6 rusuk tegak = 18 rusuk.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: '🏮 Lampion kertas',
        cerita:
          'Lampion berbentuk prisma segidelapan. Di setiap titik sudutnya dipasang manik-manik.',
        pertanyaan: 'Berapa banyak manik-manik yang dibutuhkan?',
        cek: { n: 8, jenis: 'titik' },
        jawab: 16,
        satuan: 'manik-manik',
        hints: ['Prisma segidelapan: n = 8.', 'Banyak titik sudut = 2n.'],
        explanation: '8 titik sudut pada alas + 8 titik sudut pada sisi atas = 16.',
      },
      {
        id: 't4',
        type: 'choice',
        konteks: '🎁 Kotak hadiah',
        cerita: 'Sebuah kotak hadiah berbentuk prisma dan memiliki 7 sisi.',
        pertanyaan: 'Prisma apakah kotak hadiah itu?',
        cek: { n: 5, jenis: 'sisi', nilai: 7 },
        options: [
          { id: 'segilima', label: 'Prisma segilima' },
          { id: 'segitujuh', label: 'Prisma segitujuh' },
          { id: 'segienam', label: 'Prisma segienam' },
          { id: 'segiempat', label: 'Prisma segiempat' },
        ],
        correct: 'segilima',
        hints: ['Banyak sisi = n + 2 = 7.'],
        explanation: 'n + 2 = 7, jadi n = 5. Alasnya segilima: prisma segilima.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: '🥤 Kerangka sedotan',
        cerita:
          'Anton membuat kerangka prisma segiempat dari sedotan. Setiap rusuk memakai satu sedotan.',
        pertanyaan: 'Berapa banyak sedotan yang dibutuhkan Anton?',
        cek: { n: 4, jenis: 'rusuk' },
        jawab: 12,
        satuan: 'sedotan',
        hints: ['Kerangka dibentuk oleh rusuk-rusuk prisma.', 'Banyak rusuk = 3n dengan n = 4.'],
        explanation: '4 rusuk alas + 4 rusuk atas + 4 rusuk tegak = 12 sedotan.',
      },
      {
        id: 't6',
        type: 'choice',
        konteks: '🍫 Kotak cokelat',
        cerita: 'Bu Rina akan memotong karton untuk kotak cokelat berbentuk prisma segitiga.',
        pertanyaan: 'Rancangan mana yang dapat dilipat menjadi kotak cokelat?',
        options: [
          {
            id: 'valid',
            teks: 'Tiga persegi panjang, satu segitiga di atas dan satu di bawah',
            jaring: { n: 3, atas: [0], alas: [1], s: 1, h: 1.6 },
          },
          {
            id: 'sepihak',
            teks: 'Tiga persegi panjang, dua segitiga di atas',
            jaring: { n: 3, atas: [0, 1], alas: [], s: 1, h: 1.6 },
          },
          {
            id: 'lebih',
            teks: 'Empat persegi panjang dan dua segitiga berseberangan',
            jaring: { n: 3, sabuk: 4, atas: [1], alas: [2], s: 1, h: 1.6 },
          },
          {
            id: 'kurang',
            teks: 'Dua persegi panjang dan dua segitiga berseberangan',
            jaring: { n: 3, sabuk: 2, atas: [0], alas: [1], s: 1, h: 1.6 },
          },
        ],
        correct: 'valid',
        hints: ['Butuh tepat 3 persegi panjang dan 2 segitiga yang berseberangan.'],
        explanation:
          'Prisma segitiga butuh 3 persegi panjang dan 2 segitiga, dengan satu segitiga di atas dan satu di bawah rangkaian persegi panjang.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: '🔍 Prisma misteri',
        cerita: 'Sebuah prisma memiliki 27 rusuk.',
        pertanyaan: 'Berapa banyak sisi prisma itu?',
        cek: { n: 9, jenis: 'sisi', rusuk: 27 },
        jawab: 11,
        satuan: 'sisi',
        hints: ['Banyak rusuk = 3n = 27, jadi n = …', 'Banyak sisi = n + 2.'],
        explanation: '3n = 27 sehingga n = 9 (prisma segisembilan). Banyak sisinya 9 + 2 = 11.',
      },
      {
        id: 't8',
        type: 'choice',
        konteks: '🪥 Kemasan pasta gigi',
        cerita: 'Kemasan pasta gigi berbentuk prisma segiempat ABCD.EFGH dengan alas ABCD.',
        pertanyaan: 'Manakah yang merupakan rusuk tegak?',
        options: [
          { id: 'AE', label: 'AE' },
          { id: 'AB', label: 'AB' },
          { id: 'EF', label: 'EF' },
          { id: 'AC', label: 'AC' },
        ],
        correct: 'AE',
        hints: ['Rusuk tegak menghubungkan titik pada alas ABCD dengan titik pada sisi atas EFGH.'],
        explanation:
          'AE menghubungkan titik A pada alas dengan titik E pada sisi atas. AB rusuk alas, EF rusuk atas, AC diagonal sisi alas.',
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
    guru: 'Gunakan jawaban refleksi untuk mengetahui murid yang masih lupa rusuk tegak atau sisi alas-atas saat menghitung. Jawaban hanya tersimpan di perangkat murid.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Dengan kalimatmu sendiri, sebutkan unsur-unsur prisma dan cara menghitung banyaknya.',
        placeholder: 'Unsur prisma adalah … Banyaknya bisa dihitung dengan …',
      },
      {
        id: 'r2',
        teks: 'Apakah dugaan dan hipotesismu di awal terbukti? Apa yang berubah dari pemikiranmu?',
        placeholder: 'Awalnya aku mengira … ternyata …',
      },
      {
        id: 'r3',
        teks: 'Bagaimana caramu memastikan sebuah bentangan karton bisa dilipat menjadi prisma?',
        placeholder: 'Aku memeriksa …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu mengidentifikasi unsur-unsur dan jaring-jaring prisma sekarang?',
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
    teks: 'Kamu telah menemukan sendiri unsur-unsur prisma dan ciri jaring-jaringnya dengan mengamati, menghitung, melipat, dan merakit.',
    capaian: [
      'Menunjukkan titik sudut, rusuk alas, rusuk atas, rusuk tegak, sisi alas, sisi atas, sisi tegak, dan tinggi prisma.',
      'Menemukan bahwa prisma segi-n memiliki 2n titik sudut, 3n rusuk, dan (n + 2) sisi.',
      'Menamai prisma berdasarkan bentuk sisi alasnya.',
      'Mengenali jaring-jaring prisma: n persegi panjang dan dua segi-n kongruen yang berseberangan.',
      'Menentukan apakah sebuah rancangan bentangan dapat dilipat menjadi prisma.',
    ],
  },
};
