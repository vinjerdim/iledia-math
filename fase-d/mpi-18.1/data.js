'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Sisi & Sudut Bersesuaian, Kongruen vs Sebangun —
   Fase D, SMP Kelas VIII · Topik 18

   Tujuan Pembelajaran:
   Mengidentifikasi sisi dan sudut yang bersesuaian pada dua bangun
   datar serta membedakan bangun yang kongruen dan sebangun pada contoh
   di lingkungan sekitar.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahBersesuaian' & 'olahJenis'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi    (7')  — "Kembar atau Serupa?": ubin lantai, bendera
                             kecil & besar, layar ponsel & televisi, foto
                             & cetakannya, daun jendela kiri & kanan, denah
                             kelas. Murid MENDUGA apakah tiga pasangan
                             gambar sama persis, serupa beda ukuran, atau
                             berbeda (tidak dinilai).
     2. Masalah      (5')  — memilih pertanyaan inti penyelidikan, lalu
                             menulis hipotesis.
     3. Lab          (18') — Lab Jiplak & Ukur pada ubin trapesium ABCD:
                             menjiplak, memutar, membalik, dan menempelkan
                             jiplakan pada empat ubin lain; lalu mengukur
                             sisi & sudut ABCD dan ubin yang diperbesar
                             dengan penggaris & busur virtual.
     4a. Bersesuaian (12') — dari jiplakan yang berimpit: memasangkan
                             titik sudut, sisi, dan sudut yang bersesuaian
                             (bukan menurut urutan huruf), menulis notasi
                             ABCD ≅ …, termasuk pada bangun yang dibalik.
     4b. Jenis       (12') — tabel sisi & sudut bersesuaian tiga pasangan
                             → syarat kongruen & sebangun, jebakan luas
                             sama & sudut sama; memilah tujuh pasangan
                             benda.
     5. Verifikasi   (10') — tiga pasangan benda BARU diambil acak:
                             menentukan jenisnya dan sisi/sudut yang
                             bersesuaian, membandingkan dugaan awal,
                             memilah pernyataan benar/salah.
     6. Generalisasi (4')  — menyusun definisi & syarat.
     7. Uji terap    (10') — delapan soal diambil acak dari bank tujuh
                             belas soal (sisi, sudut, jenis, pilihan,
                             isian).
     8. Refleksi     (2')  — rekap, refleksi tertulis, penilaian diri.

   Bangun datar ditulis sebagai geometri { id, nama, titik, pts }
   (cm, sumbu y ke bawah; notasi shared/engine.js seksi 26). Kunci
   jawaban TIDAK ditulis tangan: pasangan titik/sisi/sudut bersesuaian
   dan jenis pasangan (kongruen/sebangun/tidak) dihitung app.js dengan
   korespondensiBangun() & klasifikasiBangun() (seksi 26 & 85), begitu
   pula opsi sisi/sudut/notasi beserta diagnosa miskonsepsinya.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Pasangan benda
   verifikasi dan soal uji terap juga diambil acak.

   Konsistensi kunci jawaban diuji tests/mpi-18.1-data.test.js terhadap
   engine seksi 26 & 85.
   ============================================================ */

var DL = 'Discovery Learning';
var AKAR3 = Math.sqrt(3);

/* ----------------------------------------------------------
   Bangun-bangun Lab Jiplak & Ukur (ubin trapesium siku-siku)
   ---------------------------------------------------------- */
var UBIN_ASAL = {
  id: 'asal',
  nama: 'Ubin ABCD',
  titik: ['A', 'B', 'C', 'D'],
  pts: [
    [0, 4],
    [6, 4],
    [3, 0],
    [0, 0],
  ],
};
/* ABCD diputar 90° searah jarum jam */
var UBIN_PUTAR = {
  id: 'putar',
  nama: 'Ubin KLMN',
  titik: ['K', 'L', 'M', 'N'],
  pts: [
    [4, 0],
    [0, 0],
    [0, 6],
    [4, 3],
  ],
};
/* ABCD dibalik (bayangan cermin) */
var UBIN_BALIK = {
  id: 'balik',
  nama: 'Ubin PQRS',
  titik: ['P', 'Q', 'R', 'S'],
  pts: [
    [0, 4],
    [3, 4],
    [6, 0],
    [0, 0],
  ],
};
/* ABCD diperbesar 1,5 kali */
var UBIN_BESAR = {
  id: 'besar',
  nama: 'Ubin EFGH',
  titik: ['E', 'F', 'G', 'H'],
  pts: [
    [0, 6],
    [9, 6],
    [4.5, 0],
    [0, 0],
  ],
};
/* trapesium sama kaki dengan luas sama (18 cm²) */
var UBIN_LAIN = {
  id: 'lain',
  nama: 'Ubin TUVW',
  titik: ['T', 'U', 'V', 'W'],
  pts: [
    [0, 4],
    [6, 4],
    [4.5, 0],
    [1.5, 0],
  ],
};

/* Pembuat bangun persegi panjang p × l (titik kiri-bawah searah jarum jam). */
function persegiPanjang(id, nama, titik, p, l) {
  return {
    id: id,
    nama: nama,
    titik: titik,
    pts: [
      [0, l],
      [p, l],
      [p, 0],
      [0, 0],
    ],
  };
}

var DATA = {
  meta: {
    judul: 'Sisi & Sudut Bersesuaian, Kongruen vs Sebangun',
  },

  /* Label konteks soal (ikon + nama). */
  konteks: {
    rumah: { ikon: '🏠', nama: 'Rumah' },
    sekolah: { ikon: '🏫', nama: 'Sekolah' },
    kota: { ikon: '🏙️', nama: 'Lingkungan & Kota' },
    karya: { ikon: '✂️', nama: 'Kerajinan & Foto' },
    konsep: { ikon: '📐', nama: 'Konsep Bangun Datar' },
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; dibandingkan dengan temuan pada tahap
     Verifikasi. `baku` dihitung ulang di tes dari jenis pasangan
     melalui `bakuDariJenis`.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati pasangan benda berbentuk sama di sekitar kita, lalu menduga apakah keduanya sama persis atau hanya serupa.',
    tp: 'Mengidentifikasi sisi dan sudut yang bersesuaian pada dua bangun datar serta membedakan bangun yang kongruen dan sebangun pada contoh di lingkungan sekitar.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menentukan pasangan titik sudut yang bersesuaian dengan mengimpitkan dua bangun (memutar atau membalik bila perlu).',
      'Menyebutkan sisi-sisi dan sudut-sudut yang bersesuaian pada dua bangun datar.',
      'Menjelaskan syarat dua bangun kongruen: sisi bersesuaian sama panjang dan sudut bersesuaian sama besar.',
      'Menjelaskan syarat dua bangun sebangun: sudut bersesuaian sama besar dan sisi bersesuaian sebanding.',
      'Membedakan pasangan benda yang kongruen, sebangun, atau tidak keduanya di lingkungan sekitar.',
    ],
    guru: 'Bawa benda nyata berpasangan: dua ubin, foto dan cetakan besarnya, dua penggaris segitiga, atau dua lembar kertas HVS dan kertas folio. Biarkan murid menebak dengan bahasa mereka sendiri ("kembar", "mirip", "beda") — jangan meluruskan istilah dulu; perbedaan dugaan menjadi bahan penyelidikan.',
    judul: 'Kembar atau Serupa?',
    pengantar:
      'Di sekitar kita banyak benda berpasangan yang bentuknya tampak sama. Ada yang benar-benar kembar, ada yang hanya serupa tetapi ukurannya berbeda. Bagaimana cara kita memastikannya?',
    kartu: [
      {
        id: 'kUbin',
        ikon: '🧱',
        judul: 'Ubin lantai',
        teks: 'Ubin-ubin dipasang diputar ke berbagai arah, tetapi tetap pas menutupi lantai.',
      },
      {
        id: 'kBendera',
        ikon: '🇮🇩',
        judul: 'Bendera kecil & besar',
        teks: 'Bendera meja dan bendera tiang upacara berbeda ukuran, tetapi bentuknya sama.',
      },
      {
        id: 'kLayar',
        ikon: '📱',
        judul: 'Layar ponsel & televisi',
        teks: 'Keduanya persegi panjang. Apakah gambar di ponsel pasti pas di layar televisi?',
      },
      {
        id: 'kFoto',
        ikon: '🖼️',
        judul: 'Foto & cetakannya',
        teks: 'Foto ukuran kecil dicetak besar untuk dipajang tanpa terlihat gepeng.',
      },
      {
        id: 'kJendela',
        ikon: '🪟',
        judul: 'Daun jendela kiri & kanan',
        teks: 'Dua daun jendela saling berhadapan seperti bayangan di cermin.',
      },
      {
        id: 'kDenah',
        ikon: '🗺️',
        judul: 'Denah kelas',
        teks: 'Denah di kertas jauh lebih kecil daripada ruang kelas yang digambarkannya.',
      },
    ],
    bakuDariJenis: { kongruen: 'kembar', sebangun: 'serupa', tidak: 'beda' },
    dugaan: [
      {
        id: 'dUbin',
        tanya: 'Dua ubin lantai di teras rumah, satu dipasang mendatar dan satu tegak.',
        p: persegiPanjang('ubin1', 'Ubin mendatar', ['A', 'B', 'C', 'D'], 3, 2),
        q: {
          id: 'ubin2',
          nama: 'Ubin tegak',
          titik: ['K', 'L', 'M', 'N'],
          pts: [
            [0, 3],
            [0, 0],
            [2, 0],
            [2, 3],
          ],
        },
        opsi: [
          { id: 'kembar', label: 'Sama bentuk dan sama ukuran' },
          { id: 'serupa', label: 'Sama bentuk, ukurannya berbeda' },
          { id: 'beda', label: 'Bentuknya berbeda' },
          { id: 'ragu', label: 'Tidak bisa dipastikan karena posisinya berbeda' },
        ],
        baku: 'kembar',
        temuan:
          'Setelah diputar 90°, ubin tegak menutupi ubin mendatar dengan tepat: sisi bersesuaian sama panjang dan sudut bersesuaian sama besar — kongruen.',
      },
      {
        id: 'dBendera',
        tanya: 'Bendera meja (2 dm × 3 dm) dan bendera kelas (4 dm × 6 dm).',
        p: persegiPanjang('bendera1', 'Bendera meja', ['A', 'B', 'C', 'D'], 3, 2),
        q: persegiPanjang('bendera2', 'Bendera kelas', ['P', 'Q', 'R', 'S'], 6, 4),
        opsi: [
          { id: 'kembar', label: 'Sama bentuk dan sama ukuran' },
          { id: 'serupa', label: 'Sama bentuk, ukurannya berbeda' },
          { id: 'beda', label: 'Bentuknya berbeda' },
          { id: 'ragu', label: 'Tidak bisa dipastikan karena posisinya berbeda' },
        ],
        baku: 'serupa',
        temuan:
          'Semua sudutnya 90° dan setiap sisi bendera kelas = 2 × sisi bendera meja yang bersesuaian — sebangun, tetapi tidak kongruen.',
      },
      {
        id: 'dLayar',
        tanya:
          'Layar ponsel (2 cm × 4 cm pada gambar) dan layar televisi (4,5 cm × 8 cm pada gambar).',
        p: persegiPanjang('ponsel', 'Layar ponsel', ['A', 'B', 'C', 'D'], 2, 4),
        q: persegiPanjang('tv', 'Layar televisi', ['P', 'Q', 'R', 'S'], 8, 4.5),
        opsi: [
          { id: 'kembar', label: 'Sama bentuk dan sama ukuran' },
          { id: 'serupa', label: 'Sama bentuk, ukurannya berbeda' },
          { id: 'beda', label: 'Bentuknya berbeda' },
          { id: 'ragu', label: 'Tidak bisa dipastikan karena posisinya berbeda' },
        ],
        baku: 'beda',
        temuan:
          'Sudutnya sama-sama 90°, tetapi sisi panjang dikali 2 sedangkan sisi pendek dikali 2,25. Sisi-sisinya tidak sebanding, jadi tidak sebangun — gambar ponsel tampak gepeng bila dipaksa memenuhi layar televisi.',
      },
    ],
    catatan:
      'Dugaanmu belum dinilai. Kamu akan menyelidikinya di Lab Jiplak & Ukur, lalu membandingkannya dengan temuanmu pada tahap Verifikasi.',
    nextLabel: 'Lanjut ke Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan yang akan diselidiki tentang pasangan bangun yang kembar dan yang serupa.',
    guru: 'Bandingkan dugaan beberapa pasangan murid di papan tulis. Tanyakan: "Bagaimana kalian bisa yakin dua ubin itu kembar padahal posisinya berbeda?" Arahkan agar pertanyaan inti berfokus pada membandingkan SISI dan SUDUT yang berpasangan.',
    pengantar:
      'Dugaan teman-temanmu berbeda-beda. Ada yang yakin dua ubin itu kembar, ada yang ragu karena letaknya berbeda. Ada juga yang mengira layar ponsel dan televisi sama bentuknya. Kita perlu cara yang pasti untuk membandingkan dua bangun.',
    pertanyaan: 'Pertanyaan apa yang paling tepat untuk diselidiki hari ini?',
    opsi: [
      {
        id: 'bandingkan',
        label:
          'Sisi dan sudut mana yang berpasangan pada dua bangun, dan bagaimana ukurannya jika dua bangun itu kembar atau hanya serupa?',
      },
      { id: 'luas', label: 'Berapa luas sebuah ubin trapesium?' },
      { id: 'warna', label: 'Warna ubin mana yang paling cocok untuk teras?' },
      { id: 'banyak', label: 'Berapa banyak ubin yang diperlukan untuk menutup lantai kelas?' },
    ],
    correct: 'bandingkan',
    umpan: {
      bandingkan:
        'Tepat! Dengan memasangkan sisi dan sudut lalu membandingkan ukurannya, kita dapat memastikan dua bangun kembar (kongruen) atau serupa (sebangun).',
      luas: 'Luas berguna, tetapi dua bangun yang luasnya sama belum tentu sama bentuknya. Kita perlu membandingkan bentuk dan ukurannya.',
      warna: 'Warna tidak memengaruhi bentuk dan ukuran bangun. Fokuslah pada sisi dan sudutnya.',
      banyak:
        'Itu soal pengubinan yang menarik, tetapi belum menjawab cara memastikan dua bangun kembar atau serupa.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu, apa yang harus sama agar dua bangun disebut kembar? Bagaimana jika hanya serupa?',
    hipotesisPlaceholder: 'Contoh: Menurutku dua bangun kembar jika semua sisinya …',
    nextLabel: 'Mulai Menyelidiki →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA (Lab Jiplak & Ukur)
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Menjiplak, memutar, membalik, dan mengukur ubin untuk mengumpulkan data tentang sisi dan sudutnya.',
    guru: 'Bila memungkinkan, bagikan kertas kalkir/plastik transparan dan ubin karton agar murid juga menjiplak sungguhan. Satu murid mengoperasikan jiplakan, satu lagi mencatat. Ajukan pertanyaan pancingan: "Ubin mana yang tidak bisa ditutup jiplakan, walau sudah diputar dan dibalik? Mengapa?"',
    judulA: 'A. Kertas jiplak',
    instruksiA:
      'Jiplak ubin ABCD, lalu tempelkan jiplakannya pada setiap ubin lain. Putar atau balik jiplakan sampai menutupi ubin itu dengan tepat (berimpit). Cobalah keempat ubin.',
    asal: UBIN_ASAL,
    calon: [UBIN_PUTAR, UBIN_BALIK, UBIN_BESAR, UBIN_LAIN],
    langkah: 90,
    judulB: 'B. Penggaris & busur',
    instruksiB:
      'Ubin EFGH tidak dapat ditutup jiplakan. Ukur semua sisi dan sudut ubin ABCD dan ubin EFGH untuk mencari tahu hubungan keduanya.',
    ukur: [UBIN_ASAL, UBIN_BESAR],
    tabelJudul: 'Tabel pengamatan jiplakan',
    kolom: ['Ubin', 'Hasil menempel jiplakan ABCD', 'Caranya'],
    temuanA:
      'Jiplakan ABCD dapat berimpit dengan ubin KLMN (diputar) dan ubin PQRS (dibalik), tetapi tidak dengan ubin EFGH dan TUVW.',
    temuanB:
      'Catat temuanmu: sudut-sudut ABCD dan EFGH ternyata sama besar, sedangkan sisi-sisinya berbeda panjang. Kita olah datanya pada tahap berikutnya.',
    nextLabel: 'Olah Data: Pasangan Bersesuaian →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — OLAH DATA: TITIK, SISI & SUDUT BERSESUAIAN
     `langkah` muncul berurutan; opsi, kunci, dan umpan balik
     dihitung engine dari pemetaan korespondensiBangun(p, q).
     ---------------------------------------------------------- */
  olahBersesuaian: {
    kicker: 'Tahap 4a · Pengolahan Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan cara menentukan titik sudut, sisi, dan sudut yang bersesuaian dari jiplakan yang berimpit.',
    guru: 'Peragakan dengan dua potong karton trapesium berlabel huruf berbeda. Saat murid memilih menurut urutan huruf (A ↔ K), tempelkan karton itu agar tampak bahwa A justru menempel pada L. Tekankan: pasangan ditentukan oleh LETAK saat diimpitkan, bukan oleh urutan huruf.',
    instruksi:
      'Ingat lagi: jiplakan ABCD berimpit dengan ubin KLMN setelah diputar. Saat berimpit, setiap titik, sisi, dan sudut ABCD menempel pada pasangannya di KLMN. Pasangan itu disebut bersesuaian.',
    langkah: [
      { id: 'lTitikA', p: UBIN_ASAL, q: UBIN_PUTAR, jenis: 'titik', i: 0 },
      { id: 'lTitikC', p: UBIN_ASAL, q: UBIN_PUTAR, jenis: 'titik', i: 2 },
      { id: 'lSisiAB', p: UBIN_ASAL, q: UBIN_PUTAR, jenis: 'sisi', i: 0 },
      { id: 'lSisiCD', p: UBIN_ASAL, q: UBIN_PUTAR, jenis: 'sisi', i: 2 },
      { id: 'lSudutB', p: UBIN_ASAL, q: UBIN_PUTAR, jenis: 'sudut', i: 1 },
      { id: 'lSudutD', p: UBIN_ASAL, q: UBIN_PUTAR, jenis: 'sudut', i: 3 },
      { id: 'lNotasi', p: UBIN_ASAL, q: UBIN_PUTAR, jenis: 'notasi', simbol: '≅' },
      { id: 'lBalikSisi', p: UBIN_ASAL, q: UBIN_BALIK, jenis: 'sisi', i: 0 },
      { id: 'lBalikSudut', p: UBIN_ASAL, q: UBIN_BALIK, jenis: 'sudut', i: 2 },
    ],
    judulLangkah: {
      titik: 'Titik {x} bersesuaian dengan titik …',
      sisi: 'Sisi {x} bersesuaian dengan sisi …',
      sudut: 'Sudut {x} bersesuaian dengan sudut …',
      notasi: 'Penulisan yang tepat untuk "{p} kongruen dengan {q}" adalah …',
    },
    pengantarBalik:
      'Sekarang ubin PQRS, yang berimpit dengan jiplakan setelah DIBALIK. Hati-hati: arah kelilingnya terbalik!',
    pertanyaan: [
      {
        id: 'bCara',
        tanya:
          'Dari kegiatan tadi, bagaimana cara yang tepat menentukan pasangan titik sudut yang bersesuaian?',
        opsi: [
          {
            id: 'impit',
            label: 'Impitkan kedua bangun, lalu lihat titik mana menempel pada titik mana',
          },
          {
            id: 'abjad',
            label: 'Pasangkan menurut urutan abjad: huruf pertama dengan huruf pertama',
          },
          { id: 'dekat', label: 'Pasangkan titik yang letaknya paling dekat di layar' },
          { id: 'atas', label: 'Pasangkan titik yang sama-sama berada paling atas' },
        ],
        correct: 'impit',
        umpan: {
          impit:
            'Tepat! Titik yang saling menempel saat kedua bangun berimpit (setelah diputar atau dibalik) adalah titik yang bersesuaian.',
          abjad:
            'Pada ubin KLMN, titik A justru menempel pada L, bukan K. Urutan abjad bergantung pada cara memberi nama, bukan pada letak.',
          dekat:
            'Letak di layar bergantung pada posisi gambar. Ubin yang diputar membuat titik-titiknya berpindah tempat.',
          atas: 'Setelah diputar, titik paling atas bisa berganti. Yang menentukan adalah titik mana yang menempel saat diimpitkan.',
        },
      },
      {
        id: 'bSisi',
        tanya: 'Pada ABCD dan KLMN yang berimpit, bagaimana panjang sisi-sisi yang bersesuaian?',
        opsi: [
          { id: 'sama', label: 'Sama panjang' },
          { id: 'beda', label: 'Selalu berbeda' },
          { id: 'dua', label: 'Sisi KLMN dua kali sisi ABCD' },
          { id: 'tak', label: 'Tidak dapat dibandingkan karena posisinya berbeda' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Tepat! Karena saling menempel tepat, sisi yang bersesuaian sama panjang, dan sudut yang bersesuaian sama besar.',
          beda: 'Ingat, jiplakan menutupi KLMN dengan tepat. Kalau panjangnya berbeda, apakah bisa berimpit?',
          dua: 'Jiplakan tidak diperbesar, hanya diputar. Jadi ukurannya tidak berubah.',
          tak: 'Memutar tidak mengubah panjang. Kita bisa membandingkan sisi yang saling menempel.',
        },
      },
      {
        id: 'bNotasi',
        tanya: 'Mengapa urutan huruf pada penulisan ABCD ≅ LMNK penting?',
        opsi: [
          { id: 'pasangan', label: 'Urutan huruf menunjukkan pasangan titik yang bersesuaian' },
          { id: 'abjad', label: 'Agar huruf-hurufnya tertulis menurut abjad' },
          { id: 'tidak', label: 'Tidak penting, ABCD ≅ KLMN juga sama saja' },
          { id: 'luas', label: 'Urutan huruf menunjukkan bangun mana yang lebih luas' },
        ],
        correct: 'pasangan',
        umpan: {
          pasangan:
            'Tepat! A ↔ L, B ↔ M, C ↔ N, D ↔ K. Dari notasinya saja kita dapat membaca sisi bersesuaian: AB ↔ LM, CD ↔ NK.',
          abjad:
            'Abjad tidak menunjukkan apa pun tentang letak. Huruf ditulis menurut pasangan titiknya.',
          tidak:
            'ABCD ≅ KLMN berarti A ↔ K, padahal A menempel pada L. Penulisan itu memberi pasangan yang keliru.',
          luas: 'Notasi kongruen menyatakan bangun yang sama ukurannya, jadi luasnya pun sama.',
        },
      },
    ],
    temuan: [
      {
        label: 'Titik sudut bersesuaian',
        teks: 'Titik-titik yang saling menempel saat dua bangun diimpitkan (setelah diputar, dibalik, atau diperbesar/diperkecil).',
      },
      {
        label: 'Sisi & sudut bersesuaian',
        teks: 'Sisi yang menghubungkan titik-titik bersesuaian, dan sudut di titik-titik bersesuaian.',
      },
      {
        label: 'Notasi',
        teks: 'Huruf ditulis menurut pasangan titik: ABCD ≅ LMNK berarti A ↔ L, B ↔ M, C ↔ N, D ↔ K.',
      },
    ],
    nextLabel: 'Olah Data: Kongruen atau Sebangun? →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — OLAH DATA: KONGRUEN ATAU SEBANGUN?
     Tabel dibangun buildCompareTable; pemetaan dihitung engine,
     kecuali `map` ditulis untuk pasangan yang tidak sebangun.
     Kunci pemilahan dihitung klasifikasiBangun().
     ---------------------------------------------------------- */
  olahJenis: {
    kicker: 'Tahap 4b · Pengolahan Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan syarat dua bangun kongruen dan syarat dua bangun sebangun dari tabel sisi dan sudut bersesuaian.',
    guru: 'Tampilkan ketiga tabel bersamaan. Minta murid menandai kolom keterangan: semua "sama", semua "× 1,5", atau campur. Tekankan dua jebakan: luas sama tidak menjamin kongruen, dan sudut sama saja belum cukup untuk sebangun (contoh persegi panjang 2 × 4 dan 3 × 4).',
    instruksi:
      'Perhatikan tabel sisi dan sudut bersesuaian dari hasil Lab. Kolom keterangan membandingkan ukuran tiap pasangan.',
    tabel: [
      {
        id: 'tbPutar',
        judul: 'Tabel 1 · Ubin ABCD dan ubin KLMN (berimpit)',
        p: UBIN_ASAL,
        q: UBIN_PUTAR,
      },
      {
        id: 'tbBesar',
        judul: 'Tabel 2 · Ubin ABCD dan ubin EFGH (diperbesar)',
        p: UBIN_ASAL,
        q: UBIN_BESAR,
      },
      {
        id: 'tbLain',
        judul: 'Tabel 3 · Ubin ABCD dan ubin TUVW (tidak berimpit, luasnya sama)',
        p: UBIN_ASAL,
        q: UBIN_LAIN,
        map: [0, 1, 2, 3],
      },
    ],
    pertanyaan: [
      {
        id: 'jKongruen',
        tanya: 'Tabel 1: apa yang kamu lihat pada ubin ABCD dan KLMN yang berimpit?',
        opsi: [
          {
            id: 'semua',
            label: 'Semua sisi bersesuaian sama panjang dan semua sudut bersesuaian sama besar',
          },
          { id: 'sudut', label: 'Hanya sudut-sudutnya yang sama besar' },
          { id: 'sisi', label: 'Hanya sisi-sisinya yang sama panjang' },
          { id: 'beda', label: 'Ada sisi yang berbeda panjang' },
        ],
        correct: 'semua',
        umpan: {
          semua:
            'Tepat! Dua bangun yang berimpit tepat disebut KONGRUEN (lambang ≅): sisi bersesuaian sama panjang dan sudut bersesuaian sama besar.',
          sudut: 'Lihat lagi baris sisi pada Tabel 1: keterangannya juga "sama".',
          sisi: 'Lihat lagi baris sudut pada Tabel 1: keterangannya juga "sama".',
          beda: 'Periksa lagi kolom keterangan Tabel 1: semua barisnya "sama".',
        },
      },
      {
        id: 'jSebangun',
        tanya: 'Tabel 2: bagaimana hubungan ukuran ubin ABCD dan EFGH?',
        opsi: [
          { id: 'kali', label: 'Sudut bersesuaian sama besar; setiap sisi EFGH = 1,5 × sisi ABCD' },
          { id: 'sudutKali', label: 'Sudut dan sisi EFGH semuanya 1,5 kali ABCD' },
          { id: 'tambah', label: 'Setiap sisi EFGH = sisi ABCD ditambah 3 cm' },
          { id: 'sama', label: 'Semua sisi dan sudutnya sama' },
        ],
        correct: 'kali',
        umpan: {
          kali: 'Tepat! Bangun yang sudut bersesuaiannya sama besar dan sisi bersesuaiannya sebanding (dikali bilangan yang sama, yaitu faktor skala) disebut SEBANGUN (lambang ∼).',
          sudutKali:
            'Lihat baris sudut: keterangannya "sama". Memperbesar bangun tidak mengubah besar sudut.',
          tambah:
            'Periksa: AB = 6 → EF = 9 (bertambah 3), tetapi CD = 3 → GH = 4,5 (bertambah 1,5). Bukan ditambah, melainkan dikali 1,5.',
          sama: 'Periksa lagi baris sisi pada Tabel 2: keterangannya "× 1,5", bukan "sama".',
        },
      },
      {
        id: 'jLuas',
        tanya: 'Ubin ABCD dan TUVW luasnya sama-sama 18 cm². Apakah keduanya kongruen?',
        opsi: [
          { id: 'tidak', label: 'Tidak, ada sudut bersesuaian yang tidak sama besar' },
          { id: 'ya', label: 'Ya, karena luasnya sama' },
          { id: 'trapesium', label: 'Ya, karena sama-sama trapesium' },
          { id: 'sebangun', label: 'Bukan kongruen, tetapi sebangun karena luasnya sama' },
        ],
        correct: 'tidak',
        umpan: {
          tidak:
            'Tepat! Luas yang sama tidak menjamin kongruen. Sudut-sudut TUVW berbeda dengan ABCD, jadi tidak kongruen dan tidak sebangun.',
          ya: 'Luas sama belum cukup. Lihat Tabel 3: ada sudut yang keterangannya "beda".',
          trapesium:
            'Sama-sama trapesium belum tentu sama bentuk. ABCD trapesium siku-siku, TUVW trapesium sama kaki.',
          sebangun:
            'Sebangun memerlukan sudut bersesuaian sama besar. Pada Tabel 3, sudutnya berbeda.',
        },
      },
      {
        id: 'jHubungan',
        tanya: 'Apakah setiap dua bangun yang kongruen pasti sebangun?',
        opsi: [
          { id: 'ya', label: 'Ya, kongruen adalah sebangun dengan faktor skala 1' },
          { id: 'tidak', label: 'Tidak, bangun sebangun harus berbeda ukuran' },
          { id: 'putar', label: 'Hanya jika salah satunya diputar' },
          { id: 'bebas', label: 'Kongruen dan sebangun tidak berhubungan' },
        ],
        correct: 'ya',
        umpan: {
          ya: 'Tepat! Bangun kongruen memenuhi syarat sebangun: sudut sama besar dan sisi sebanding dengan faktor skala 1. Jadi kongruen adalah sebangun yang istimewa.',
          tidak:
            'Syarat sebangun hanya sudut sama dan sisi sebanding. Faktor skala 1 juga sebanding, jadi bangun kongruen pun sebangun.',
          putar:
            'Diputar atau tidak, bentuk dan ukuran bangun tetap. Periksa syarat sebangun pada bangun kongruen.',
          bebas: 'Bandingkan syaratnya: syarat kongruen memuat semua syarat sebangun.',
        },
      },
      {
        id: 'jSudutSaja',
        tanya:
          'Pintu 2 m × 4 m dan jendela 3 m × 4 m sama-sama persegi panjang, semua sudutnya 90°. Apakah keduanya sebangun?',
        opsi: [
          {
            id: 'tidak',
            label: 'Tidak, karena 4 : 2 tidak sama dengan 4 : 3 (sisi tidak sebanding)',
          },
          { id: 'ya', label: 'Ya, karena semua sudutnya sama besar' },
          { id: 'persegi', label: 'Ya, karena semua persegi panjang pasti sebangun' },
          { id: 'kongruen', label: 'Kongruen, karena tingginya sama-sama 4 m' },
        ],
        correct: 'tidak',
        umpan: {
          tidak:
            'Tepat! Sisi panjang dikali 1 (4 → 4) tetapi sisi pendek dikali 1,5 (2 → 3). Tidak ada faktor skala yang sama, jadi tidak sebangun walaupun sudutnya sama.',
          ya: 'Sudut sama besar baru syarat pertama. Sisi bersesuaian juga harus sebanding.',
          persegi:
            'Ingat layar ponsel dan televisi: sama-sama persegi panjang, tetapi gambarnya gepeng. Periksa perbandingan sisinya.',
          kongruen:
            'Kongruen memerlukan SEMUA sisi bersesuaian sama panjang. Lebarnya berbeda (2 m dan 3 m).',
        },
      },
    ],
    temuan: [
      {
        label: 'Kongruen (≅)',
        teks: 'Sama bentuk dan sama ukuran: sisi-sisi bersesuaian sama panjang dan sudut-sudut bersesuaian sama besar.',
      },
      {
        label: 'Sebangun (∼)',
        teks: 'Sama bentuk: sudut-sudut bersesuaian sama besar dan sisi-sisi bersesuaian sebanding (dikali faktor skala yang sama).',
      },
      {
        label: 'Hubungannya',
        teks: 'Setiap dua bangun kongruen pasti sebangun (faktor skala 1), tetapi bangun sebangun belum tentu kongruen.',
      },
    ],
    pilahJudul: 'Pilah pasangan benda',
    pilahInstruksi:
      'Bandingkan setiap pasangan gambar (ukuran gambar sebanding dengan ukuran sebenarnya). Termasuk jenis apa pasangan itu?',
    pilah: [
      {
        id: 'pjRak',
        teks: 'Dua penyangga rak berbentuk segitiga siku-siku, yang satu dipasang terbalik.',
        p: {
          id: 'rak1',
          nama: 'Penyangga 1',
          titik: ['A', 'B', 'C'],
          pts: [
            [0, 3],
            [4, 3],
            [0, 0],
          ],
        },
        q: {
          id: 'rak2',
          nama: 'Penyangga 2',
          titik: ['P', 'Q', 'R'],
          pts: [
            [4, 3],
            [4, 0],
            [0, 0],
          ],
        },
        correct: 'kongruen',
        explanation:
          'Setelah diputar 180°, penyangga 2 menutupi penyangga 1 dengan tepat: sisi 3, 4, 5 dan sudut-sudutnya sama — kongruen.',
      },
      {
        id: 'pjFoto',
        teks: 'Foto 3 × 4 dan cetakan besarnya 4,5 × 6.',
        p: persegiPanjang('foto1', 'Foto', ['A', 'B', 'C', 'D'], 3, 4),
        q: persegiPanjang('foto2', 'Cetakan', ['P', 'Q', 'R', 'S'], 4.5, 6),
        correct: 'sebangun',
        explanation:
          'Semua sudut 90° dan kedua pasang sisi dikali 1,5 (3 → 4,5; 4 → 6) — sebangun, tidak kongruen.',
      },
      {
        id: 'pjPintu',
        teks: 'Daun pintu 2 × 4 dan daun jendela 3 × 4.',
        p: persegiPanjang('pintu', 'Pintu', ['A', 'B', 'C', 'D'], 2, 4),
        q: persegiPanjang('jendela', 'Jendela', ['P', 'Q', 'R', 'S'], 3, 4),
        correct: 'tidak',
        explanation:
          'Sudutnya sama-sama 90°, tetapi sisi pendek dikali 1,5 sedangkan sisi panjang dikali 1. Sisi tidak sebanding, jadi tidak sebangun.',
      },
      {
        id: 'pjKeramik',
        teks: 'Keramik persegi kecil bersisi 3 dan keramik persegi besar bersisi 5.',
        p: persegiPanjang('keramik1', 'Keramik kecil', ['A', 'B', 'C', 'D'], 3, 3),
        q: persegiPanjang('keramik2', 'Keramik besar', ['P', 'Q', 'R', 'S'], 5, 5),
        correct: 'sebangun',
        explanation:
          'Semua sudut persegi 90° dan semua sisinya dikali 5/3. Dua persegi selalu sebangun; kongruen hanya jika sisinya sama.',
      },
      {
        id: 'pjBelah',
        teks: 'Hiasan belah ketupat bersisi 3 dan hiasan persegi bersisi 3.',
        p: {
          id: 'belah',
          nama: 'Belah ketupat',
          titik: ['A', 'B', 'C', 'D'],
          pts: [
            [0, 0],
            [3, 0],
            [4.5, 1.5 * AKAR3],
            [1.5, 1.5 * AKAR3],
          ],
        },
        q: persegiPanjang('persegi', 'Persegi', ['P', 'Q', 'R', 'S'], 3, 3),
        correct: 'tidak',
        explanation:
          'Semua sisinya sama-sama 3, tetapi sudut belah ketupat 60° dan 120°, bukan 90°. Sisi sama saja belum cukup — tidak kongruen dan tidak sebangun.',
      },
      {
        id: 'pjLayang',
        teks: 'Layang-layang mainan kecil dan layang-layang besar.',
        p: {
          id: 'layang1',
          nama: 'Layang-layang kecil',
          titik: ['A', 'B', 'C', 'D'],
          pts: [
            [2, 0],
            [4, 1.5],
            [2, 5],
            [0, 1.5],
          ],
        },
        q: {
          id: 'layang2',
          nama: 'Layang-layang besar',
          titik: ['P', 'Q', 'R', 'S'],
          pts: [
            [3, 0],
            [6, 2.25],
            [3, 7.5],
            [0, 2.25],
          ],
        },
        correct: 'sebangun',
        explanation:
          'Sudut-sudut bersesuaian sama besar dan setiap sisi layang-layang besar = 1,5 × sisi yang kecil — sebangun.',
      },
      {
        id: 'pjSayap',
        teks: 'Daun jendela kiri dan kanan yang saling berhadapan.',
        p: {
          id: 'sayap1',
          nama: 'Daun kiri',
          titik: ['A', 'B', 'C', 'D'],
          pts: [
            [0, 4],
            [3, 4],
            [3, 0],
            [1, 0],
          ],
        },
        q: {
          id: 'sayap2',
          nama: 'Daun kanan',
          titik: ['P', 'Q', 'R', 'S'],
          pts: [
            [0, 0],
            [2, 0],
            [3, 4],
            [0, 4],
          ],
        },
        correct: 'kongruen',
        explanation:
          'Daun kanan adalah bayangan cermin daun kiri. Setelah dibalik, keduanya berimpit — kongruen.',
      },
    ],
    nextLabel: 'Lanjut ke Verifikasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — VERIFIKASI
     `ambil.bersesuaian` pasangan diambil acak dari pasangan yang
     memiliki tanyaSisi/tanyaSudut (pemetaan tunggal), ditambah
     `ambil.klasifikasi` pasangan dari sisanya.
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji temuan pada pasangan benda baru dan membandingkannya dengan dugaan awal.',
    guru: 'Setiap murid mendapat pasangan benda acak yang berbeda. Minta pasangan saling menjelaskan alasan dengan menyebut syaratnya ("sudutnya sama, sisinya dikali 2, jadi sebangun"), bukan sekadar "kelihatannya mirip".',
    judulA: 'A. Pasangan benda baru',
    instruksiA:
      'Untuk setiap pasangan, tentukan jenisnya. Bila keduanya kongruen atau sebangun, tentukan juga sisi dan sudut yang bersesuaian.',
    ambil: { bersesuaian: 2, klasifikasi: 1 },
    bank: [
      {
        id: 'vRak',
        ikon: '📚',
        nama: 'Siku rak buku',
        cerita: 'Rak buku kelas ditopang dua siku segitiga di kiri dan kanan, saling berhadapan.',
        p: {
          id: 'vRak1',
          nama: 'Siku kiri',
          titik: ['A', 'B', 'C'],
          pts: [
            [0, 3],
            [4, 3],
            [0, 0],
          ],
        },
        q: {
          id: 'vRak2',
          nama: 'Siku kanan',
          titik: ['K', 'L', 'M'],
          pts: [
            [0, 3],
            [4, 0],
            [4, 3],
          ],
        },
        tanyaSisi: 0,
        tanyaSudut: 2,
      },
      {
        id: 'vAtap',
        ikon: '🏠',
        nama: 'Maket atap rumah',
        cerita:
          'Bagian depan atap rumah dibuat maketnya oleh Dani. Atap asli lebih besar dan digambar terbalik arah.',
        p: {
          id: 'vAtap1',
          nama: 'Maket',
          titik: ['A', 'B', 'C'],
          pts: [
            [0, 3],
            [6, 3],
            [2, 0],
          ],
        },
        q: {
          id: 'vAtap2',
          nama: 'Atap asli',
          titik: ['P', 'Q', 'R'],
          pts: [
            [6, 0],
            [9, 4.5],
            [0, 4.5],
          ],
        },
        tanyaSisi: 1,
        tanyaSudut: 0,
      },
      {
        id: 'vJendela',
        ikon: '🪟',
        nama: 'Kaca jendela patri',
        cerita: 'Dua kaca jendela patri berbentuk trapesium siku-siku dipasang berhadapan.',
        p: {
          id: 'vJendela1',
          nama: 'Kaca kiri',
          titik: ['A', 'B', 'C', 'D'],
          pts: [
            [0, 4],
            [3, 4],
            [3, 0],
            [1, 0],
          ],
        },
        q: {
          id: 'vJendela2',
          nama: 'Kaca kanan',
          titik: ['K', 'L', 'M', 'N'],
          pts: [
            [0, 0],
            [2, 0],
            [3, 4],
            [0, 4],
          ],
        },
        tanyaSisi: 2,
        tanyaSudut: 3,
      },
      {
        id: 'vKebun',
        ikon: '🌱',
        nama: 'Kebun sekolah & denahnya',
        cerita:
          'Kebun sekolah berbentuk segi empat tak beraturan. Denahnya digambar lebih kecil dan diputar di kertas.',
        p: {
          id: 'vKebun1',
          nama: 'Kebun (gambar diperkecil)',
          titik: ['A', 'B', 'C', 'D'],
          pts: [
            [0, 0],
            [5, 0],
            [6, 3],
            [1, 4],
          ],
        },
        q: {
          id: 'vKebun2',
          nama: 'Denah',
          titik: ['P', 'Q', 'R', 'S'],
          pts: [
            [0, 0.5],
            [2, 0],
            [2, 2.5],
            [0.5, 3],
          ],
        },
        tanyaSisi: 0,
        tanyaSudut: 2,
      },
      {
        id: 'vBendera',
        ikon: '🇮🇩',
        nama: 'Bendera meja & bendera tiang',
        cerita: 'Bendera meja berukuran 2 dm × 3 dm, bendera tiang 6 dm × 9 dm.',
        p: persegiPanjang('vBendera1', 'Bendera meja', ['A', 'B', 'C', 'D'], 3, 2),
        q: persegiPanjang('vBendera2', 'Bendera tiang', ['P', 'Q', 'R', 'S'], 9, 6),
      },
      {
        id: 'vLayar',
        ikon: '📺',
        nama: 'Layar ponsel & televisi',
        cerita: 'Layar ponsel 2 × 4 dan layar televisi 4,5 × 8 (ukuran pada gambar).',
        p: persegiPanjang('vLayar1', 'Layar ponsel', ['A', 'B', 'C', 'D'], 2, 4),
        q: persegiPanjang('vLayar2', 'Layar televisi', ['P', 'Q', 'R', 'S'], 8, 4.5),
      },
      {
        id: 'vBuku',
        ikon: '📘',
        nama: 'Dua buku tulis',
        cerita: 'Dua buku tulis bermerek sama, satu tergeletak mendatar dan satu tegak.',
        p: persegiPanjang('vBuku1', 'Buku mendatar', ['A', 'B', 'C', 'D'], 5, 3.5),
        q: persegiPanjang('vBuku2', 'Buku tegak', ['P', 'Q', 'R', 'S'], 3.5, 5),
      },
    ],
    kesimpulan:
      'Temuanmu terbukti pada benda baru: pasangkan dulu titik-titik yang bersesuaian, lalu bandingkan sisi dan sudutnya. Semua sama → kongruen; sudut sama dan sisi sebanding → sebangun.',
    judulB: 'B. Bandingkan dengan dugaan awalmu',
    judulC: 'C. Benar atau salah?',
    instruksiC: 'Tentukan apakah setiap pernyataan berikut benar atau salah.',
    opsiPernyataan: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'nKongruenSebangun',
        teks: 'Dua bangun yang kongruen pasti sebangun.',
        correct: 'benar',
        explanation: 'Bangun kongruen memenuhi syarat sebangun dengan faktor skala 1.',
      },
      {
        id: 'nSebangunKongruen',
        teks: 'Dua bangun yang sebangun pasti kongruen.',
        correct: 'salah',
        explanation:
          'Bendera meja dan bendera tiang sebangun, tetapi ukurannya berbeda, jadi tidak kongruen.',
      },
      {
        id: 'nPersegiPanjang',
        teks: 'Dua persegi panjang pasti sebangun karena semua sudutnya 90°.',
        correct: 'salah',
        explanation:
          'Sisi-sisinya juga harus sebanding. Layar ponsel 2 × 4 dan televisi 4,5 × 8 tidak sebangun.',
      },
      {
        id: 'nLuas',
        teks: 'Dua bangun yang luasnya sama pasti kongruen.',
        correct: 'salah',
        explanation:
          'Ubin ABCD dan TUVW luasnya sama-sama 18 cm², tetapi sudutnya berbeda sehingga tidak kongruen.',
      },
      {
        id: 'nPersegi',
        teks: 'Setiap dua persegi pasti sebangun.',
        correct: 'benar',
        explanation:
          'Semua sudut persegi 90° dan keempat sisinya sama panjang, jadi sisi-sisinya selalu sebanding.',
      },
      {
        id: 'nHuruf',
        teks: 'Sisi bersesuaian dapat ditentukan dari urutan huruf nama bangunnya saja.',
        correct: 'salah',
        explanation:
          'Urutan huruf bergantung pada cara memberi nama. Pasangan ditentukan oleh titik yang menempel saat bangun diimpitkan.',
      },
      {
        id: 'nPutar',
        teks: 'Bangun yang diputar atau dibalik tetap kongruen dengan bangun aslinya.',
        correct: 'benar',
        explanation: 'Memutar dan membalik tidak mengubah panjang sisi maupun besar sudut.',
      },
    ],
    nextLabel: 'Susun Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — GENERALISASI
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Menyusun pengertian unsur bersesuaian serta syarat kongruen dan sebangun dari hasil penemuan.',
    guru: 'Setelah kalimat tersusun, minta beberapa murid membacakannya lalu menunjukkan contoh di kelas: dua meja kembar (kongruen), buku tulis dan sampulnya yang diperbesar di papan (sebangun), papan tulis dan pintu (tidak keduanya).',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai satu kali; ada dua potongan pengecoh.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'kTitik', awal: 'Titik-titik sudut yang bersesuaian adalah', correct: 'gTitik' },
      { id: 'kSisi', awal: 'Sisi-sisi yang bersesuaian adalah', correct: 'gSisi' },
      { id: 'kKongruen', awal: 'Dua bangun disebut kongruen jika', correct: 'gKongruen' },
      { id: 'kSebangun', awal: 'Dua bangun disebut sebangun jika', correct: 'gSebangun' },
      { id: 'kHubungan', awal: 'Setiap dua bangun yang kongruen', correct: 'gHubungan' },
    ],
    bank: [
      {
        id: 'gTitik',
        teks: 'titik-titik yang saling menempel saat kedua bangun diimpitkan (setelah diputar, dibalik, atau diperbesar).',
      },
      { id: 'gSisi', teks: 'sisi-sisi yang menghubungkan titik-titik sudut yang bersesuaian.' },
      {
        id: 'gKongruen',
        teks: 'sisi-sisi bersesuaian sama panjang dan sudut-sudut bersesuaian sama besar.',
      },
      {
        id: 'gSebangun',
        teks: 'sudut-sudut bersesuaian sama besar dan sisi-sisi bersesuaian sebanding.',
      },
      { id: 'gHubungan', teks: 'pasti sebangun, dengan faktor skala 1.' },
      { id: 'gxLuas', teks: 'luasnya sama walaupun bentuknya berbeda.' },
      { id: 'gxHuruf', teks: 'sisi-sisi yang namanya berurutan sama menurut abjad.' },
    ],
    rangkuman: [
      'Unsur BERSESUAIAN ditentukan dari titik yang saling menempel saat dua bangun diimpitkan, bukan dari urutan huruf.',
      'KONGRUEN (≅): sama bentuk dan ukuran — sisi bersesuaian sama panjang, sudut bersesuaian sama besar.',
      'SEBANGUN (∼): sama bentuk — sudut bersesuaian sama besar, sisi bersesuaian sebanding dengan faktor skala k.',
      'Kongruen adalah sebangun dengan k = 1. Luas sama, atau sudut sama saja, belum cukup.',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     `banyak` soal diambil acak dari bank sesuai `komposisi`.
     'sisi' / 'sudut' : kunci, opsi & umpan dari engine (p, q, i)
     'jenis'          : kunci = klasifikasiBangun(p, q)
     'pilih'          : opsi, correct & umpan ditulis di sini
     'isi'            : isian bilangan; kunci & umpan dari engine
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan temuan untuk menentukan unsur bersesuaian dan membedakan bangun kongruen dan sebangun pada situasi baru.',
    guru: 'Soal diambil acak, sehingga soal teman sebangku bisa berbeda. Saat murid keliru, minta ia membaca umpan balik lalu menunjukkan pasangan titik yang menempel dengan jarinya pada gambar.',
    instruksi:
      'Kerjakan delapan soal berikut. Pada soal bergambar, sisi atau sudut yang ditanyakan berwarna oranye.',
    banyak: 8,
    komposisi: { sisi: 2, sudut: 1, jenis: 2, pilih: 1, isi: 2 },
    soal: [
      {
        id: 'tsPenggaris',
        tipe: 'sisi',
        konteks: 'sekolah',
        cerita: 'Dua penggaris segitiga yang sama diletakkan dengan arah berbeda.',
        p: {
          id: 'tsP1',
          nama: 'Penggaris 1',
          titik: ['A', 'B', 'C'],
          pts: [
            [0, 0],
            [4, 0],
            [0, 3],
          ],
        },
        q: {
          id: 'tsP2',
          nama: 'Penggaris 2',
          titik: ['X', 'Y', 'Z'],
          pts: [
            [0, 0],
            [3, 0],
            [3, 4],
          ],
        },
        i: 0,
        tanya: 'Sisi AB bersesuaian dengan sisi …',
        hints: ['Cari titik sudut siku-siku pada kedua penggaris lebih dulu.'],
        pembahasan:
          'Sudut siku-siku A bersesuaian dengan sudut siku-siku Y. Sisi AB (4 cm) berimpit dengan sisi YZ (4 cm).',
      },
      {
        id: 'tsMaket',
        tipe: 'sisi',
        konteks: 'rumah',
        cerita:
          'Jendela trapesium pada maket rumah dan jendela aslinya (diperbesar dan digambar diputar).',
        p: {
          id: 'tsM1',
          nama: 'Jendela maket',
          titik: ['A', 'B', 'C', 'D'],
          pts: [
            [0, 3],
            [4, 3],
            [3, 0],
            [0, 0],
          ],
        },
        q: {
          id: 'tsM2',
          nama: 'Jendela asli',
          titik: ['P', 'Q', 'R', 'S'],
          pts: [
            [4.5, 4.5],
            [4.5, 0],
            [0, 0],
            [0, 6],
          ],
        },
        i: 1,
        tanya: 'Sisi BC bersesuaian dengan sisi …',
        hints: [
          'Sisi BC adalah sisi miring trapesium. Sisi miring pada jendela asli yang mana?',
          'Pasangkan titik siku-siku dulu: A dan D.',
        ],
        pembahasan:
          'Pemetaannya A ↔ R, B ↔ S, C ↔ P, D ↔ Q. Sisi BC (sisi miring) bersesuaian dengan sisi SP.',
      },
      {
        id: 'tsLantai',
        tipe: 'sisi',
        konteks: 'rumah',
        cerita: 'Dua keping parket lantai yang sama; satu dibalik dan diputar saat dipasang.',
        p: {
          id: 'tsL1',
          nama: 'Parket 1',
          titik: ['A', 'B', 'C', 'D'],
          pts: [
            [0, 0],
            [4, 0],
            [5, 3],
            [0, 2],
          ],
        },
        q: {
          id: 'tsL2',
          nama: 'Parket 2',
          titik: ['K', 'L', 'M', 'N'],
          pts: [
            [2, 0],
            [0, 0],
            [0, 4],
            [3, 5],
          ],
        },
        i: 3,
        tanya: 'Sisi DA bersesuaian dengan sisi …',
        hints: ['Sisi DA adalah sisi terpendek parket 1. Mana sisi terpendek parket 2?'],
        pembahasan:
          'Pemetaannya A ↔ L, B ↔ M, C ↔ N, D ↔ K. Sisi DA (2 cm) bersesuaian dengan sisi KL (2 cm).',
      },
      {
        id: 'tsLogo',
        tipe: 'sisi',
        konteks: 'karya',
        cerita:
          'Logo segitiga OSIS di kartu nama diperbesar dua kali untuk spanduk dan dipasang diputar.',
        p: {
          id: 'tsG1',
          nama: 'Logo kartu',
          titik: ['A', 'B', 'C'],
          pts: [
            [0, 2],
            [4, 2],
            [1, 0],
          ],
        },
        q: {
          id: 'tsG2',
          nama: 'Logo spanduk',
          titik: ['P', 'Q', 'R'],
          pts: [
            [4, 0],
            [0, 6],
            [4, 8],
          ],
        },
        i: 2,
        tanya: 'Sisi CA bersesuaian dengan sisi …',
        hints: [
          'Sisi CA adalah sisi terpendek logo kartu. Sisi bersesuaiannya juga terpendek pada logo spanduk.',
        ],
        pembahasan:
          'Pemetaannya A ↔ R, B ↔ P, C ↔ Q. Sisi CA bersesuaian dengan sisi QR, panjangnya dua kali CA.',
      },
      {
        id: 'tuAtap',
        tipe: 'sudut',
        konteks: 'rumah',
        cerita: 'Bagian depan atap rumah dan gambar kecilnya di buku arsitek (diputar).',
        p: {
          id: 'tuA1',
          nama: 'Atap',
          titik: ['A', 'B', 'C'],
          pts: [
            [0, 3],
            [6, 3],
            [2, 0],
          ],
        },
        q: {
          id: 'tuA2',
          nama: 'Gambar atap',
          titik: ['K', 'L', 'M'],
          pts: [
            [0, 4.5],
            [2.25, 1.5],
            [0, 0],
          ],
        },
        i: 0,
        tanya: 'Sudut A bersesuaian dengan sudut …',
        hints: [
          'Sudut A diapit sisi terpanjang dan sisi terpendek atap. Cari sudut yang diapit sisi serupa pada gambar.',
        ],
        pembahasan: 'Pemetaannya A ↔ M, B ↔ K, C ↔ L. Jadi sudut A bersesuaian dengan sudut M.',
      },
      {
        id: 'tuParket',
        tipe: 'sudut',
        konteks: 'rumah',
        cerita: 'Dua keping parket lantai yang sama; satu dibalik dan diputar saat dipasang.',
        p: {
          id: 'tuP1',
          nama: 'Parket 1',
          titik: ['A', 'B', 'C', 'D'],
          pts: [
            [0, 0],
            [4, 0],
            [5, 3],
            [0, 2],
          ],
        },
        q: {
          id: 'tuP2',
          nama: 'Parket 2',
          titik: ['K', 'L', 'M', 'N'],
          pts: [
            [2, 0],
            [0, 0],
            [0, 4],
            [3, 5],
          ],
        },
        i: 2,
        tanya: 'Sudut C bersesuaian dengan sudut …',
        hints: ['Sudut C adalah sudut paling lancip pada parket 1.'],
        pembahasan:
          'Pemetaannya A ↔ L, B ↔ M, C ↔ N, D ↔ K. Jadi sudut C bersesuaian dengan sudut N.',
      },
      {
        id: 'tuLahan',
        tipe: 'sudut',
        konteks: 'kota',
        cerita:
          'Lahan taman kota berbentuk trapesium dan denahnya yang diperkecil (digambar terbalik).',
        p: {
          id: 'tuL1',
          nama: 'Lahan (gambar diperkecil)',
          titik: ['A', 'B', 'C', 'D'],
          pts: [
            [0, 3],
            [6, 3],
            [4, 0],
            [1, 0],
          ],
        },
        q: {
          id: 'tuL2',
          nama: 'Denah',
          titik: ['P', 'Q', 'R', 'S'],
          pts: [
            [0, 0],
            [1, 1.5],
            [2.5, 1.5],
            [3, 0],
          ],
        },
        i: 1,
        tanya: 'Sudut B bersesuaian dengan sudut …',
        hints: [
          'Sisi terpanjang AB pada lahan bersesuaian dengan sisi terpanjang denah.',
          'Denah digambar terbalik: sisi panjangnya di atas.',
        ],
        pembahasan:
          'Pemetaannya A ↔ S, B ↔ P, C ↔ Q, D ↔ R. Jadi sudut B bersesuaian dengan sudut P.',
      },
      {
        id: 'tjKartu',
        tipe: 'jenis',
        konteks: 'karya',
        cerita: 'Kartu pelajar 2,7 × 4,3 dan pas foto 2 × 3 (dalam cm, digambar sesuai ukuran).',
        p: persegiPanjang('tjK1', 'Kartu pelajar', ['A', 'B', 'C', 'D'], 2.7, 4.3),
        q: persegiPanjang('tjK2', 'Pas foto', ['P', 'Q', 'R', 'S'], 2, 3),
        tanya: 'Termasuk jenis apa pasangan ini?',
        hints: ['Bandingkan 2,7 : 2 dengan 4,3 : 3. Apakah hasilnya sama?'],
        pembahasan:
          'Semua sudut 90°, tetapi 2,7 : 2 = 1,35 sedangkan 4,3 : 3 ≈ 1,43. Sisi tidak sebanding, jadi tidak sebangun dan tidak kongruen.',
      },
      {
        id: 'tjPersegi',
        tipe: 'jenis',
        konteks: 'rumah',
        cerita: 'Taplak meja persegi bersisi 2 dan karpet persegi bersisi 4,5 (dalam meter).',
        p: persegiPanjang('tjP1', 'Taplak', ['A', 'B', 'C', 'D'], 2, 2),
        q: persegiPanjang('tjP2', 'Karpet', ['P', 'Q', 'R', 'S'], 4.5, 4.5),
        tanya: 'Termasuk jenis apa pasangan ini?',
        hints: ['Semua sudut persegi sama. Apakah semua sisinya dikali bilangan yang sama?'],
        pembahasan: 'Semua sudut 90° dan semua sisi dikali 2,25 — sebangun, tidak kongruen.',
      },
      {
        id: 'tjSegitiga',
        tipe: 'jenis',
        konteks: 'sekolah',
        cerita: 'Dua bendera segitiga lomba yang dipasang berhadapan.',
        p: {
          id: 'tjS1',
          nama: 'Bendera kiri',
          titik: ['A', 'B', 'C'],
          pts: [
            [0, 0],
            [4, 0],
            [0, 3],
          ],
        },
        q: {
          id: 'tjS2',
          nama: 'Bendera kanan',
          titik: ['P', 'Q', 'R'],
          pts: [
            [4, 0],
            [0, 0],
            [4, 3],
          ],
        },
        tanya: 'Termasuk jenis apa pasangan ini?',
        hints: ['Bayangkan salah satu bendera dibalik. Apakah keduanya berimpit?'],
        pembahasan:
          'Bendera kanan adalah bayangan cermin bendera kiri. Sisi 3, 4, 5 dan sudut-sudutnya sama — kongruen.',
      },
      {
        id: 'tjJajar',
        tipe: 'jenis',
        konteks: 'kota',
        cerita:
          'Petak taman berbentuk jajargenjang dan petak berbentuk persegi panjang, luasnya sama-sama 12 m².',
        p: {
          id: 'tjJ1',
          nama: 'Jajargenjang',
          titik: ['A', 'B', 'C', 'D'],
          pts: [
            [1, 0],
            [5, 0],
            [4, 3],
            [0, 3],
          ],
        },
        q: persegiPanjang('tjJ2', 'Persegi panjang', ['P', 'Q', 'R', 'S'], 4, 3),
        tanya: 'Termasuk jenis apa pasangan ini?',
        hints: ['Luasnya memang sama. Bagaimana dengan sudut-sudutnya?'],
        pembahasan:
          'Sudut jajargenjang tidak 90°, jadi sudut bersesuaian tidak sama besar — tidak sebangun dan tidak kongruen, walaupun luasnya sama.',
      },
      {
        id: 'tjTrapesium',
        tipe: 'jenis',
        konteks: 'karya',
        cerita: 'Pola tas trapesium ukuran kecil dan ukuran besar pada kertas pola.',
        p: {
          id: 'tjT1',
          nama: 'Pola kecil',
          titik: ['A', 'B', 'C', 'D'],
          pts: [
            [0, 3],
            [4, 3],
            [3, 0],
            [0, 0],
          ],
        },
        q: {
          id: 'tjT2',
          nama: 'Pola besar',
          titik: ['P', 'Q', 'R', 'S'],
          pts: [
            [0, 6],
            [8, 6],
            [6, 0],
            [0, 0],
          ],
        },
        tanya: 'Termasuk jenis apa pasangan ini?',
        hints: ['Bandingkan setiap pasang sisi: dikali berapa?'],
        pembahasan:
          'Sudut bersesuaian sama besar dan semua sisi pola besar = 2 × sisi pola kecil — sebangun dengan faktor skala 2.',
      },
      {
        id: 'tpSyarat',
        tipe: 'pilih',
        konteks: 'konsep',
        cerita: 'Rina ingin memastikan dua ubin segi empat yang ia beli kongruen.',
        tanya: 'Apa yang harus Rina periksa?',
        opsi: [
          {
            id: 'semua',
            label: 'Semua sisi bersesuaian sama panjang dan semua sudut bersesuaian sama besar',
          },
          { id: 'luas', label: 'Luas kedua ubin sama' },
          { id: 'sudut', label: 'Semua sudut bersesuaian sama besar saja' },
          { id: 'keliling', label: 'Keliling kedua ubin sama' },
        ],
        correct: 'semua',
        umpan: {
          semua: 'Tepat! Itulah syarat dua bangun kongruen.',
          luas: 'Luas sama belum menjamin bentuknya sama. Ingat ubin ABCD dan TUVW.',
          sudut:
            'Sudut sama saja baru menunjukkan kemungkinan sebangun. Ukurannya juga harus sama.',
          keliling: 'Keliling sama belum menjamin setiap sisi bersesuaian sama panjang.',
        },
        hints: ['Ingat Tabel 1 pada tahap pengolahan data: apa saja yang keterangannya "sama"?'],
        pembahasan:
          'Dua bangun kongruen jika sisi-sisi bersesuaian sama panjang DAN sudut-sudut bersesuaian sama besar.',
      },
      {
        id: 'tpFoto',
        tipe: 'pilih',
        konteks: 'karya',
        cerita: 'Foto 4 × 6 akan dicetak ulang agar tidak tampak gepeng.',
        tanya: 'Ukuran cetakan manakah yang sebangun dengan foto itu?',
        opsi: [
          { id: 'enamSembilan', label: '6 × 9' },
          { id: 'enamDelapan', label: '6 × 8' },
          { id: 'limaTujuh', label: '5 × 7' },
          { id: 'delapanSepuluh', label: '8 × 10' },
        ],
        correct: 'enamSembilan',
        umpan: {
          enamSembilan: 'Tepat! 6 : 4 = 1,5 dan 9 : 6 = 1,5. Faktor skalanya sama, jadi sebangun.',
          enamDelapan: '6 : 4 = 1,5 tetapi 8 : 6 ≈ 1,33. Sisi tidak sebanding.',
          limaTujuh:
            'Kedua sisi ditambah 1, bukan dikali bilangan yang sama. 5 : 4 = 1,25 tetapi 7 : 6 ≈ 1,17.',
          delapanSepuluh: '8 : 4 = 2 tetapi 10 : 6 ≈ 1,67. Sisi tidak sebanding.',
        },
        hints: ['Hitung lebar baru : 4 dan tinggi baru : 6. Keduanya harus sama.'],
        pembahasan:
          'Ukuran sebangun memiliki faktor skala yang sama untuk lebar dan tinggi: 6 × 9 (k = 1,5).',
      },
      {
        id: 'tpKongruen',
        tipe: 'pilih',
        konteks: 'konsep',
        cerita: 'Diketahui segitiga ABC ≅ segitiga PQR.',
        tanya: 'Pasangan sisi yang pasti sama panjang adalah …',
        opsi: [
          { id: 'bcqr', label: 'BC dan QR' },
          { id: 'bcpq', label: 'BC dan PQ' },
          { id: 'abqr', label: 'AB dan QR' },
          { id: 'acpq', label: 'AC dan PQ' },
        ],
        correct: 'bcqr',
        umpan: {
          bcqr: 'Tepat! Dari notasi ABC ≅ PQR: B ↔ Q dan C ↔ R, jadi BC ↔ QR.',
          bcpq: 'Lihat urutan huruf pada notasi: B ↔ Q, C ↔ R. Jadi BC berpasangan dengan QR.',
          abqr: 'A ↔ P dan B ↔ Q, jadi AB berpasangan dengan PQ, bukan QR.',
          acpq: 'A ↔ P dan C ↔ R, jadi AC berpasangan dengan PR, bukan PQ.',
        },
        hints: [
          'Pasangkan huruf menurut urutan pada notasi: huruf ke-1 dengan ke-1, dan seterusnya.',
        ],
        pembahasan:
          'ABC ≅ PQR berarti A ↔ P, B ↔ Q, C ↔ R. Sisi bersesuaian: AB = PQ, BC = QR, AC = PR.',
      },
      {
        id: 'tiFoto',
        tipe: 'isi',
        konteks: 'karya',
        cerita:
          'Foto berukuran 4 cm × 6 cm diperbesar secara sebangun sehingga lebarnya menjadi 10 cm.',
        tanya: 'Berapa sentimeter tinggi foto setelah diperbesar?',
        satuan: 'cm',
        cek: { minta: 'sisi', a: 4, b: 10, c: 6 },
        hints: [
          'Faktor skala = lebar baru : lebar lama.',
          'Kalikan tinggi lama dengan faktor skala.',
        ],
        pembahasan: 'Faktor skala = 10 : 4 = 2,5. Tinggi baru = 6 × 2,5 = 15 cm.',
      },
      {
        id: 'tiDenah',
        tipe: 'isi',
        konteks: 'sekolah',
        cerita:
          'Denah lapangan sekolah sebangun dengan lapangan aslinya. Lebar lapangan 2 cm pada denah dan 16 m pada aslinya. Panjang lapangan pada denah 3,5 cm.',
        tanya: 'Berapa meter panjang lapangan sebenarnya?',
        satuan: 'm',
        cek: { minta: 'sisi', a: 2, b: 16, c: 3.5 },
        hints: ['Setiap 1 cm pada denah mewakili berapa meter?'],
        pembahasan: 'Faktor skala = 16 : 2 = 8 (1 cm ↔ 8 m). Panjang = 3,5 × 8 = 28 m.',
      },
      {
        id: 'tiProyektor',
        tipe: 'isi',
        konteks: 'sekolah',
        cerita:
          'Gambar di layar laptop berukuran 32 cm × 18 cm diproyeksikan sebangun ke dinding sehingga lebarnya 160 cm.',
        tanya: 'Berapa sentimeter tinggi gambar di dinding?',
        satuan: 'cm',
        cek: { minta: 'sisi', a: 32, b: 160, c: 18 },
        hints: ['Lebar 32 cm menjadi 160 cm, dikali berapa?'],
        pembahasan: 'Faktor skala = 160 : 32 = 5. Tinggi = 18 × 5 = 90 cm.',
      },
      {
        id: 'tiSudut',
        tipe: 'isi',
        konteks: 'rumah',
        cerita:
          'Maket atap rumah sebangun dengan atap aslinya dengan faktor skala 40. Sudut kemiringan atap pada maket 35°.',
        tanya: 'Berapa derajat sudut kemiringan yang bersesuaian pada atap asli?',
        satuan: '°',
        cek: { minta: 'sudut', nilai: 35, k: 40 },
        hints: ['Apa yang terjadi pada besar sudut saat bangun diperbesar?'],
        pembahasan:
          'Pada bangun sebangun, sudut-sudut bersesuaian sama besar. Sudut kemiringan atap asli tetap 35°.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Refleksi',
    syntax: 'Penutup',
    goal: 'Merenungkan proses penemuan dan menilai pemahaman diri.',
    guru: 'Bacakan beberapa jawaban refleksi (tanpa nama). Jadikan pertanyaan ketiga tugas pengamatan di rumah: memotret satu pasangan benda kongruen dan satu pasangan benda sebangun, lalu menandai sisi bersesuaiannya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Apa perbedaan kongruen dan sebangun menurut kata-katamu sendiri?',
        placeholder: 'Contoh: kongruen itu kembar, sedangkan sebangun …',
      },
      {
        id: 'r2',
        teks: 'Kesalahan apa yang pernah kamu lakukan saat menentukan sisi bersesuaian? Bagaimana cara menghindarinya?',
        placeholder: 'Tulis dengan kalimatmu sendiri …',
      },
      {
        id: 'r3',
        teks: 'Sebutkan satu pasangan benda kongruen dan satu pasangan benda sebangun di rumah atau sekolahmu.',
        placeholder: 'Contoh: dua daun pintu lemari (kongruen), …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu dapat menentukan sisi dan sudut bersesuaian serta membedakan bangun kongruen dan sebangun?',
    diriOpsi: [
      { id: 'sangat', label: '😄 Sangat yakin — bisa menjelaskan ke teman' },
      { id: 'yakin', label: '🙂 Yakin, sesekali masih perlu melihat catatan' },
      { id: 'ragu', label: '😐 Masih ragu pada beberapa bagian' },
      { id: 'belum', label: '😟 Belum yakin, perlu dibimbing lagi' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, penyelidikanmu tuntas!',
    teks: 'Kamu telah menemukan sendiri cara menentukan unsur bersesuaian dan membedakan bangun kongruen dan sebangun di sekitarmu.',
    capaian: [
      'Menjiplak, memutar, dan membalik bangun untuk menemukan pasangan yang berimpit.',
      'Menentukan titik sudut, sisi, dan sudut bersesuaian menurut letak, bukan urutan huruf.',
      'Menemukan syarat kongruen: sisi bersesuaian sama panjang dan sudut bersesuaian sama besar.',
      'Menemukan syarat sebangun: sudut bersesuaian sama besar dan sisi bersesuaian sebanding.',
      'Membedakan pasangan benda kongruen, sebangun, dan tidak keduanya di lingkungan sekitar.',
    ],
  },
};
