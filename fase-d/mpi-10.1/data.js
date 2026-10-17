'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Menyajikan Data Kategorik dalam Tabel Frekuensi &
   Diagram Batang — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menyajikan data kategorik dalam bentuk tabel frekuensi dan diagram
   batang dengan skala yang tepat pada situasi kehidupan sehari-hari.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahTabel', 'olahSkala'
                                         & 'olahBatang'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi    (7')  — "Survei Jajanan Kantin": Bu Sari, pengelola
                             kantin, mencatat jawaban 36 murid secara acak
                             dan OSIS memasang diagram di mading yang
                             sumbu tegaknya tidak dimulai dari 0. Murid
                             MENDUGA jajanan terfavorit, cara merapikan
                             catatan, kejujuran diagram mading, dan skala
                             sumbu (tidak dinilai).
     2. Masalah      (5')  — memilih pertanyaan inti penyelidikan lalu
                             menulis hipotesis.
     3. Lab Turus    (13') — membaca 36 kartu jawaban (urutan acak) satu
                             per satu, mengetuk baris kategori untuk
                             menambah turus, lalu menulis frekuensi dan
                             jumlahnya (isian berdiagnosa miskonsepsi
                             turus & jumlah).
     4a. Tabel       (8')  — turus berkelompok lima, jumlah frekuensi =
                             banyak data, data kategorik vs numerik.
     4b. Skala       (10') — Lab Skala: mencoba langkah 1, 2, 5, 10, 20
                             dan sumbu yang dimulai dari 15 pada data
                             ekstrakurikuler; menemukan syarat skala tepat
                             (mulai 0, jarak sama, langkah rapi, 5–10
                             garis bantu).
     4c. Diagram     (12') — Lab Diagram Batang: memilih langkah skala,
                             melengkapi judul & nama sumbu, mengatur tinggi
                             batang data kantin, lalu membaca diagram.
     5. Verifikasi   (10') — data BARU acak: prediksi langkah skala,
                             puncak sumbu & banyak data, buktikan dengan
                             membuat diagramnya, memilah pernyataan,
                             membandingkan dugaan.
     6. Generalisasi (5')  — menyusun kesimpulan dari bank kalimat.
     7. Uji terap    (12') — delapan soal diambil acak dari bank enam
                             belas soal (isian berdiagnosa & pilihan
                             ganda berpengecoh miskonsepsi).
     8. Refleksi     (3')  — rekap, refleksi tertulis, penilaian diri.

   Konvensi skala (engine seksi 79): sumbu tegak dimulai dari 0, jarak
   angkanya sama, dan langkahnya bilangan rapi (1, 2, 5, 10, 20, 25, 50,
   …) sehingga sumbu memuat 5–10 garis bantu di atas 0. Untuk data kecil
   (frekuensi terbesar < 5) langkah 1 tetap tepat.

   Notasi kunci jawaban (`cek`, lihat engine seksi 79):
     { minta: 'frekuensi', data, kategori, kat } | { minta: 'total', frek,
     kategori } | { minta: 'turus', n } | { minta: 'puncak' | 'garis', max,
     langkah } | { minta: 'baca', frek, kategori, langkah, kat } |
     { minta: 'selisih', frek, kategori, langkah, a, b } | { minta: 'skala',
     max } | { minta: 'terbanyak', frek, kategori } | { minta: 'cacat',
     frek, kategori, cacat }

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / ensureLabTurus / ensureLabBatang / shuffleArray dari
   shared/engine.js), sehingga tiap murid dan tiap Reset mendapat urutan
   berbeda. Urutan kartu survei, data verifikasi, dan soal uji terap juga
   diacak; opsi pilihan ganda uji terap dibangun engine (opsiSoalData)
   lalu diacak.

   Konsistensi kunci jawaban diuji tests/mpi-10.1-data.test.js terhadap
   engine seksi 79.
   ============================================================ */

var DL = 'Discovery Learning';

/* ---------- Kategori & data bersama ---------- */

var KAT_KANTIN = [
  { id: 'cilok', label: 'Cilok', ikon: '🍢' },
  { id: 'bakso', label: 'Bakso', ikon: '🍲' },
  { id: 'nasiGoreng', label: 'Nasi goreng', ikon: '🍛' },
  { id: 'batagor', label: 'Batagor', ikon: '🥟' },
  { id: 'roti', label: 'Roti', ikon: '🍞' },
];

/* Jawaban 36 murid kelas VII A, dicatat Bu Sari sesuai urutan datang. */
var SURVEI_KANTIN = [
  ['Ayu', 'cilok'],
  ['Bima', 'bakso'],
  ['Citra', 'cilok'],
  ['Dimas', 'nasiGoreng'],
  ['Eka', 'roti'],
  ['Fajar', 'cilok'],
  ['Gita', 'batagor'],
  ['Hadi', 'bakso'],
  ['Indah', 'cilok'],
  ['Joko', 'nasiGoreng'],
  ['Kirana', 'bakso'],
  ['Lukman', 'cilok'],
  ['Mega', 'batagor'],
  ['Nanda', 'cilok'],
  ['Oki', 'bakso'],
  ['Putri', 'nasiGoreng'],
  ['Rafi', 'cilok'],
  ['Sari', 'roti'],
  ['Tegar', 'bakso'],
  ['Umi', 'cilok'],
  ['Vino', 'batagor'],
  ['Wulan', 'nasiGoreng'],
  ['Yusuf', 'bakso'],
  ['Zahra', 'cilok'],
  ['Arif', 'nasiGoreng'],
  ['Bunga', 'cilok'],
  ['Candra', 'bakso'],
  ['Dewi', 'batagor'],
  ['Erlan', 'cilok'],
  ['Fitri', 'nasiGoreng'],
  ['Galih', 'bakso'],
  ['Hana', 'roti'],
  ['Irfan', 'cilok'],
  ['Jihan', 'batagor'],
  ['Kevin', 'bakso'],
  ['Laras', 'nasiGoreng'],
];

var KAT_EKSKUL = [
  { id: 'pramuka', label: 'Pramuka', ikon: '⛺' },
  { id: 'futsal', label: 'Futsal', ikon: '⚽' },
  { id: 'robotik', label: 'Robotik', ikon: '🤖' },
  { id: 'paduanSuara', label: 'Paduan suara', ikon: '🎤' },
  { id: 'tari', label: 'Tari', ikon: '💃' },
];

var KAT_EKSKUL4 = [
  { id: 'pramuka', label: 'Pramuka' },
  { id: 'futsal', label: 'Futsal' },
  { id: 'tari', label: 'Tari' },
  { id: 'robotik', label: 'Robotik' },
];

var KAT_WARNA4 = [
  { id: 'merah', label: 'Merah' },
  { id: 'biru', label: 'Biru' },
  { id: 'hijau', label: 'Hijau' },
  { id: 'kuning', label: 'Kuning' },
];

var KAT_GOLDAR = [
  { id: 'A', label: 'A' },
  { id: 'B', label: 'B' },
  { id: 'AB', label: 'AB' },
  { id: 'O', label: 'O' },
];

var KAT_TRANSPORT = [
  { id: 'jalan', label: 'Jalan kaki' },
  { id: 'sepeda', label: 'Sepeda' },
  { id: 'motor', label: 'Motor' },
  { id: 'angkot', label: 'Angkot' },
];

var KAT_HEWAN = [
  { id: 'kucing', label: 'Kucing' },
  { id: 'ayam', label: 'Ayam' },
  { id: 'ikan', label: 'Ikan' },
  { id: 'burung', label: 'Burung' },
];

var KAT_BUAH = [
  { id: 'jeruk', label: 'Jeruk' },
  { id: 'apel', label: 'Apel' },
  { id: 'mangga', label: 'Mangga' },
  { id: 'pisang', label: 'Pisang' },
];

var KAT_SAMPAH = [
  { id: 'botol', label: 'Botol' },
  { id: 'gelas', label: 'Gelas plastik' },
  { id: 'kantong', label: 'Kantong' },
  { id: 'sedotan', label: 'Sedotan' },
];

var KAT_MAPEL = [
  { id: 'mtk', label: 'Matematika' },
  { id: 'ipa', label: 'IPA' },
  { id: 'bind', label: 'B. Indonesia' },
  { id: 'pjok', label: 'PJOK' },
  { id: 'seni', label: 'Seni' },
];

var KAT_BUKU = [
  { id: 'komik', label: 'Komik' },
  { id: 'novel', label: 'Novel' },
  { id: 'ensiklopedia', label: 'Ensiklopedia' },
  { id: 'majalah', label: 'Majalah' },
];

var FREK_HEWAN = { kucing: 12, ayam: 7, ikan: 9, burung: 4 };
var FREK_BUAH = { jeruk: 16, apel: 11, mangga: 20, pisang: 7 };
var FREK_MAPEL = { mtk: 13, ipa: 11, bind: 9, pjok: 14, seni: 6 };
var FREK_BUKU = { komik: 24, novel: 18, ensiklopedia: 9, majalah: 12 };
var FREK_TRANSPORT = { jalan: 14, sepeda: 9, motor: 11, angkot: 4 };

var GOLDAR_20 = 'O A B O A O AB A O B O A O B A AB O A B O'.split(' ');

var EKSKUL_16 = [
  'pramuka',
  'futsal',
  'tari',
  'pramuka',
  'robotik',
  'futsal',
  'pramuka',
  'tari',
  'robotik',
  'futsal',
  'pramuka',
  'robotik',
  'tari',
  'futsal',
  'pramuka',
  'robotik',
];

var DATA = {
  meta: {
    judul: 'Menyajikan Data Kategorik',
  },

  tahap: [
    { id: 'stimulasi', label: 'Stimulasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'koleksi', label: 'Lab Turus' },
    { id: 'olahTabel', label: 'Tabel Frekuensi' },
    { id: 'olahSkala', label: 'Skala Sumbu' },
    { id: 'olahBatang', label: 'Diagram Batang' },
    { id: 'verifikasi', label: 'Verifikasi' },
    { id: 'generalisasi', label: 'Generalisasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Label konteks soal (ikon + nama). */
  konteks: {
    kantin: { ikon: '🍢', nama: 'Kantin & Jajanan' },
    sekolah: { ikon: '🏫', nama: 'Sekolah' },
    rumah: { ikon: '🏠', nama: 'Rumah & Keluarga' },
    lingkungan: { ikon: '🌳', nama: 'Lingkungan' },
    skala: { ikon: '📏', nama: 'Skala Sumbu' },
  },

  /* Data survei jajanan kantin (dipakai tahap 1, 3, 4a, 4c). */
  kantin: {
    judul: 'Jajanan Kesukaan Murid Kelas VII A',
    labelX: 'Jenis jajanan',
    labelY: 'Banyak murid',
    kategori: KAT_KANTIN,
    frek: { cilok: 12, bakso: 9, nasiGoreng: 7, batagor: 5, roti: 3 },
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; dibandingkan dengan temuan pada tahap
     Verifikasi. `baku` = jawaban menurut temuan.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati catatan survei yang masih acak dan diagram di mading, lalu menduga cara menyajikan data agar mudah dan jujur dibaca.',
    tp: 'Menyajikan data kategorik dalam bentuk tabel frekuensi dan diagram batang dengan skala yang tepat pada situasi kehidupan sehari-hari.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Membedakan data kategorik dari data numerik.',
      'Mencatat data kategorik dengan turus dan menyusun tabel frekuensi yang jumlahnya sama dengan banyak data.',
      'Memilih langkah skala sumbu tegak yang tepat: dimulai dari 0, jarak sama, langkah rapi, dan cukup 5–10 garis bantu.',
      'Menggambar diagram batang lengkap dengan judul, nama sumbu, dan batang yang tingginya sama dengan frekuensi.',
      'Membaca diagram batang dan mengenali diagram yang menyesatkan.',
    ],
    guru: 'Bacakan cerita Bu Sari. Tanyakan: "Jajanan apa yang paling disukai? Bagaimana kalian tahu?" Biarkan murid menebak dari catatan acak. Tunjukkan diagram mading dan tanyakan apakah cilok benar-benar disukai sepuluh kali lipat roti. Jangan membenarkan dugaan dulu.',
    judul: 'Survei Jajanan Kantin',
    pengantar:
      'Bu Sari, pengelola kantin sekolah, ingin tahu jajanan apa yang paling disukai murid kelas VII A agar tidak ada jajanan yang tersisa. Ia bertanya kepada 36 murid dan mencatat jawabannya sesuai urutan murid datang.',
    catatanJudul: 'Catatan Bu Sari',
    mading: {
      judul: 'Jajanan Favorit VII A (Mading OSIS)',
      cacat: 'mulaiBukanNol',
      mulai: 2,
      langkah: 1,
      teks: 'OSIS juga memasang diagram ini di mading. Batang cilok tampak sepuluh kali lebih tinggi daripada batang roti.',
    },
    dugaan: [
      {
        id: 'dTerbanyak',
        tanya: 'Dari catatan Bu Sari, jajanan apa yang paling banyak disukai?',
        opsi: [
          { id: 'cilok', label: 'Cilok' },
          { id: 'bakso', label: 'Bakso' },
          { id: 'nasiGoreng', label: 'Nasi goreng' },
          { id: 'batagor', label: 'Batagor' },
        ],
        baku: 'cilok',
        pembahasan:
          'Setelah diturus, cilok dipilih 12 murid, paling banyak di antara jajanan lainnya.',
      },
      {
        id: 'dCara',
        tanya: 'Cara paling rapi untuk menghitung catatan acak itu adalah …',
        opsi: [
          { id: 'turus', label: 'Membuat tabel berisi turus untuk setiap jajanan' },
          { id: 'abjad', label: 'Menulis ulang nama murid sesuai urutan abjad' },
          { id: 'kira', label: 'Memperkirakan saja dengan sekali lihat' },
          { id: 'gambar', label: 'Menggambar setiap jajanan sebanyak 36 kali' },
        ],
        baku: 'turus',
        pembahasan:
          'Turus mencatat setiap jawaban tepat satu kali pada baris jajanannya, lalu frekuensinya mudah dihitung.',
      },
      {
        id: 'dMading',
        tanya:
          'Pada diagram mading, batang cilok tampak 10 kali batang roti. Apakah peminat cilok benar-benar 10 kali peminat roti?',
        opsi: [
          { id: 'tidak', label: 'Tidak; ada yang keliru pada sumbu tegaknya' },
          { id: 'ya', label: 'Ya, karena batangnya 10 kali lebih tinggi' },
          { id: 'selalu', label: 'Ya, diagram buatan OSIS pasti benar' },
          { id: 'lebar', label: 'Tidak; batang roti terlalu lebar' },
        ],
        baku: 'tidak',
        pembahasan:
          'Sumbu tegak mading dimulai dari 2, bukan 0. Sebenarnya cilok 12 dan roti 3, jadi cilok hanya 4 kali roti.',
      },
      {
        id: 'dSkala',
        tanya: 'Frekuensi terbesar data ini 12. Angka pada sumbu tegak diagram batang sebaiknya …',
        opsi: [
          { id: 'l2', label: '0, 2, 4, 6, …, 12' },
          { id: 'l1', label: '0, 1, 2, 3, …, 12' },
          { id: 'l5', label: '0, 5, 10, 15' },
          { id: 'l3', label: '0, 3, 6, 9, 12' },
        ],
        baku: 'l2',
        cek: { minta: 'skala', max: 12 },
        pembahasan:
          'Langkah 2 rapi dan menghasilkan 6 garis bantu. Langkah 1 terlalu rapat (12 garis), langkah 5 terlalu renggang, dan langkah 3 tidak rapi.',
      },
    ],
    alasanLabel:
      'Bagaimana caramu menduga? Apakah kamu menghitung, memperkirakan, atau menebak? Tulis singkat.',
    alasanPlaceholder: 'Contoh: aku menduga cilok paling banyak karena …',
    catatan:
      'Dugaan ini belum dinilai. Kalian akan memeriksanya sendiri dengan menurus kartu jawaban dan membuat diagram batang.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — PROBLEM STATEMENT
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan penyelidikan tentang cara menyajikan data kategorik, lalu menulis hipotesis.',
    guru: 'Arahkan murid pada pertanyaan yang dapat dijawab dengan mengolah catatan Bu Sari. Bahas mengapa pertanyaan tentang harga atau resep tidak dapat dijawab dengan data survei ini.',
    pengantar:
      'Catatan Bu Sari sulit dibaca, dan diagram di mading tampak menipu. Bagaimana seharusnya data seperti ini disajikan?',
    pertanyaan: 'Pilih pertanyaan inti penyelidikan kita:',
    opsi: [
      {
        id: 'inti',
        label:
          'Bagaimana menyajikan data jajanan kesukaan dalam tabel frekuensi dan diagram batang dengan skala yang tepat agar mudah dan jujur dibaca?',
      },
      { id: 'harga', label: 'Berapa harga satu porsi cilok di kantin?' },
      { id: 'resep', label: 'Bagaimana resep membuat bakso yang enak?' },
      { id: 'jam', label: 'Pukul berapa kantin paling ramai?' },
    ],
    correct: 'inti',
    umpan: {
      inti: 'Tepat! Pertanyaan ini dapat kita selidiki dengan menurus, menyusun tabel frekuensi, dan mencoba berbagai skala diagram batang.',
      harga:
        'Harga tidak dicatat dalam survei Bu Sari. Pilih pertanyaan tentang cara menyajikan data kesukaan.',
      resep:
        'Resep tidak berkaitan dengan data survei. Pilih pertanyaan tentang cara menyajikan data.',
      jam: 'Bu Sari tidak mencatat waktu. Pertanyaan kita tentang menyajikan data jajanan kesukaan.',
    },
    hipotesisLabel:
      'Tulis dugaan sementaramu (hipotesis): bagaimana cara menyajikan data jajanan kesukaan agar mudah dan jujur dibaca?',
    hipotesisPlaceholder:
      'Contoh: menurutku data dihitung dulu dengan …, lalu digambar dengan sumbu tegak yang dimulai dari …',
    nextLabel: 'Lanjut: Lab Turus →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — DATA COLLECTION: LAB TURUS
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Mengumpulkan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mencatat jawaban survei satu per satu dengan turus, lalu menyusun tabel frekuensinya.',
    guru: 'Murid bergantian: satu membacakan kartu, yang lain mengetuk baris. Ingatkan bahwa garis kelima digambar miring mencoret empat garis sebelumnya. Setelah beberapa kartu, tombol percepat boleh dipakai agar waktu cukup. Minta murid memeriksa: jumlah frekuensi harus 36.',
    pengantar:
      'Kartu jawaban murid ditampilkan satu per satu dalam urutan acak. Baca isi kartunya, lalu ketuk baris jajanan yang sesuai untuk menambah satu turus. Setelah semua kartu diturus, tulis frekuensi setiap jajanan dan jumlahnya.',
    tips: [
      'Setiap kartu = satu turus pada baris jajanannya.',
      'Turus dikelompokkan per lima: empat garis tegak, lalu garis kelima digambar miring mencoretnya.',
      'Frekuensi = banyak turus. Hitung kelompok lima lebih dulu, lalu tambahkan sisanya.',
      'Jumlah semua frekuensi harus sama dengan banyak kartu.',
    ],
    lab: {
      percepatSetelah: 12,
      judulKategori: 'Jajanan',
      caption: 'Tabel frekuensi jajanan kesukaan murid kelas VII A',
      data: SURVEI_KANTIN.map(function (p, i) {
        return { id: 'm' + (i + 1), nama: p[0], nilai: p[1] };
      }),
    },
    selesaiTeks:
      'Data sudah tersaji dalam tabel frekuensi. Amati tabelmu: jajanan mana yang terbanyak? Berapa jumlah semua frekuensi?',
    nextLabel: 'Lanjut: Olah Tabel Frekuensi →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — DATA PROCESSING: TABEL FREKUENSI
     ---------------------------------------------------------- */
  olahTabel: {
    kicker: 'Tahap 4a · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan dari tabel frekuensi cara kerja turus, hubungan jumlah frekuensi dengan banyak data, dan ciri data kategorik.',
    guru: 'Minta murid menunjukkan pada tabelnya: "Kelompok lima ada berapa? Sisa berapa?" Tanyakan: "Apakah jajanan bisa diurutkan dari kecil ke besar seperti tinggi badan?" untuk memunculkan ciri data kategorik.',
    judul: 'Tabel frekuensimu',
    pengantar:
      'Perhatikan turus, frekuensi, dan baris jumlah pada tabelmu. Lalu jawab pertanyaan temuan berikut.',
    temuan: [
      {
        id: 'tLima',
        tanya:
          'Mengapa turus digambar berkelompok lima (empat garis tegak dicoret satu garis miring)?',
        opsi: [
          { id: 'cepat', label: 'Agar mudah dan cepat dihitung dengan kelipatan lima' },
          { id: 'indah', label: 'Agar tabelnya tampak lebih indah' },
          { id: 'wajib5', label: 'Karena setiap frekuensi pasti kelipatan lima' },
          { id: 'salah', label: 'Garis miring menandai jawaban yang salah' },
        ],
        correct: 'cepat',
        umpan: {
          cepat:
            'Tepat! Kelompok lima dihitung 5, 10, 15, …, lalu ditambah sisanya. Cilok: dua kelompok lima + 2 = 12.',
          indah:
            'Bukan soal keindahan. Coba hitung turus cilok: apa yang membuatnya cepat dihitung?',
          wajib5:
            'Frekuensi bakso 9, bukan kelipatan lima. Kelompok lima hanya membantu menghitung.',
          salah: 'Garis miring adalah garis kelima, tetap dihitung sebagai satu data.',
        },
      },
      {
        id: 'tJumlah',
        tanya: 'Jumlah semua frekuensi pada tabelmu sama dengan …',
        opsi: [
          { id: 'banyakData', label: 'banyak data (banyak murid yang ditanya)' },
          { id: 'banyakKat', label: 'banyak jenis jajanan' },
          { id: 'terbesar', label: 'frekuensi terbesar' },
          { id: 'tak', label: 'tidak ada hubungannya dengan banyak data' },
        ],
        correct: 'banyakData',
        umpan: {
          banyakData:
            'Tepat! 12 + 9 + 7 + 5 + 3 = 36, sama dengan banyak murid. Ini cara memeriksa apakah ada data yang terlewat.',
          banyakKat: 'Ada 5 jenis jajanan, tetapi jumlah frekuensinya 36. Lihat lagi baris jumlah.',
          terbesar: 'Frekuensi terbesar 12, sedangkan jumlahnya 36. Lihat lagi baris jumlah.',
          tak: 'Setiap murid memberi tepat satu jawaban. Jadi jumlahnya pasti berhubungan dengan banyak murid.',
        },
      },
      {
        id: 'tKategorik',
        tanya: 'Data jajanan kesukaan disebut data kategorik karena …',
        opsi: [
          {
            id: 'kelompok',
            label: 'isinya berupa nama atau kelompok, bukan hasil mengukur atau membilang',
          },
          { id: 'angka', label: 'datanya dapat dijumlahkan seperti bilangan' },
          { id: 'urut', label: 'datanya selalu dapat diurutkan dari kecil ke besar' },
          { id: 'sedikit', label: 'banyak datanya sedikit' },
        ],
        correct: 'kelompok',
        umpan: {
          kelompok:
            'Tepat! "Cilok" dan "bakso" adalah kategori. Yang kita hitung adalah frekuensi setiap kategori.',
          angka:
            'Kita tidak dapat menjumlahkan "cilok + bakso". Yang dijumlahkan hanya frekuensinya.',
          urut: 'Cilok tidak lebih besar atau lebih kecil dari bakso. Kategori tidak punya urutan nilai.',
          sedikit: 'Banyak sedikitnya data tidak menentukan jenis data. Perhatikan isi datanya.',
        },
      },
    ],
    pilah: {
      judul: 'Pilah: data kategorik atau data numerik?',
      pengantar:
        'Data kategorik berupa nama/kelompok. Data numerik berupa bilangan hasil mengukur atau membilang.',
      kategori: [
        { id: 'kategorik', label: 'Data kategorik' },
        { id: 'numerik', label: 'Data numerik' },
      ],
      butir: [
        {
          id: 'pJajan',
          teks: 'Jajanan kesukaan',
          correct: 'kategorik',
          explanation: 'Isinya nama jajanan (cilok, bakso, …).',
        },
        {
          id: 'pGoldar',
          teks: 'Golongan darah',
          correct: 'kategorik',
          explanation: 'Isinya kelompok A, B, AB, atau O.',
        },
        {
          id: 'pTransport',
          teks: 'Moda transportasi ke sekolah',
          correct: 'kategorik',
          explanation: 'Isinya jenis kendaraan: jalan kaki, sepeda, angkot, ….',
        },
        {
          id: 'pWarna',
          teks: 'Warna kesukaan',
          correct: 'kategorik',
          explanation: 'Isinya nama warna.',
        },
        {
          id: 'pTinggi',
          teks: 'Tinggi badan (cm)',
          correct: 'numerik',
          explanation: 'Isinya bilangan hasil mengukur, mis. 152 cm.',
        },
        {
          id: 'pSaudara',
          teks: 'Banyak saudara kandung',
          correct: 'numerik',
          explanation: 'Isinya bilangan hasil membilang, mis. 2 orang.',
        },
        {
          id: 'pTas',
          teks: 'Massa tas sekolah (kg)',
          correct: 'numerik',
          explanation: 'Isinya bilangan hasil menimbang, mis. 3,5 kg.',
        },
        {
          id: 'pEkskul',
          teks: 'Ekstrakurikuler yang diikuti',
          correct: 'kategorik',
          explanation: 'Isinya nama kegiatan: pramuka, futsal, tari, ….',
        },
      ],
    },
    langkah: [
      {
        id: 'lt1',
        label: 'Turus di atas menyatakan frekuensi berapa?',
        cek: { minta: 'turus', n: 13 },
        placeholder: 'mis. 10',
        hints: ['Setiap kelompok (empat tegak + satu miring) bernilai 5.'],
        temuan: 'Dua kelompok lima dan tiga garis: 5 + 5 + 3 = 13.',
      },
      {
        id: 'lt2',
        label:
          'Tabel di atas berisi warna kesukaan murid kelas VII B. Berapa banyak murid yang ditanya?',
        cek: {
          minta: 'total',
          frek: { merah: 8, biru: 11, hijau: 6, kuning: 5 },
          kategori: KAT_WARNA4,
        },
        placeholder: 'mis. 25',
        hints: ['Banyak data = jumlah semua frekuensi.'],
        temuan: '8 + 11 + 6 + 5 = 30 murid.',
      },
      {
        id: 'lt3',
        label: 'Data golongan darah 20 murid di atas. Berapa murid bergolongan darah O?',
        cek: { minta: 'frekuensi', data: GOLDAR_20, kategori: KAT_GOLDAR, kat: 'O' },
        placeholder: 'mis. 5',
        hints: ['Turuskan hanya data O: beri tanda setiap kali menemukan O.'],
        temuan: 'Ada 8 murid bergolongan darah O (A: 6, B: 4, AB: 2, O: 8; jumlah 20).',
      },
    ],
    ringkasan:
      'Tabel frekuensi memuat kategori, turus, dan frekuensi. Turus dikelompokkan per lima agar mudah dihitung, dan jumlah semua frekuensi sama dengan banyak data. Data kategorik berupa nama atau kelompok.',
    nextLabel: 'Lanjut: Olah Skala Sumbu →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — DATA PROCESSING: SKALA SUMBU TEGAK
     Kunci pemilahan dihitung engine (nilaiSkalaSumbu).
     ---------------------------------------------------------- */
  olahSkala: {
    kicker: 'Tahap 4b · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan ciri skala sumbu tegak yang tepat dengan mencoba berbagai langkah skala dan sumbu yang tidak dimulai dari 0.',
    guru: 'Minta murid mencoba langkah 1 lebih dulu, lalu 20, lalu 5 dan 10. Tanyakan: "Kapan diagram paling mudah dibaca?" Saat sumbu dimulai dari 15, minta mereka membandingkan batang Pramuka dan Tari dengan frekuensi sebenarnya.',
    judul: 'Lab Skala: data ekstrakurikuler',
    pengantar:
      'OSIS mendata ekstrakurikuler pilihan seluruh murid kelas VII. Coba minimal tiga langkah skala, lalu coba sumbu tegak yang dimulai dari 15. Amati apa yang berubah.',
    lab: {
      kategori: KAT_EKSKUL,
      frek: { pramuka: 48, futsal: 36, robotik: 30, paduanSuara: 22, tari: 18 },
      langkahOpsi: [1, 2, 5, 10, 20],
      mulaiLain: 15,
      minCoba: 3,
      judul: 'Ekstrakurikuler Pilihan Murid Kelas VII',
      labelX: 'Ekstrakurikuler',
      labelY: 'Banyak murid',
    },
    belumCukup:
      'Coba minimal tiga langkah skala dan sumbu yang dimulai dari 15 untuk membuka pertanyaan temuan.',
    temuan: [
      {
        id: 'kRapat',
        tanya: 'Saat langkah 1 dipakai untuk data ini, apa yang terjadi?',
        opsi: [
          { id: 'rapat', label: 'Garis bantunya sangat banyak (48 garis) dan berdesakan' },
          { id: 'tepat', label: 'Diagram menjadi paling mudah dibaca' },
          { id: 'pendek', label: 'Semua batang menjadi sangat pendek' },
          { id: 'hilang', label: 'Batang Tari tidak dapat digambar' },
        ],
        correct: 'rapat',
        umpan: {
          rapat:
            'Tepat! Untuk frekuensi sebesar 48, langkah 1 membuat sumbu terlalu rapat sehingga angkanya sulit dibaca.',
          tepat: 'Coba lihat lagi: angka pada sumbu tegak sampai berdesakan. Apakah mudah dibaca?',
          pendek: 'Batang menjadi pendek justru saat langkahnya besar, mis. 20.',
          hilang: 'Batang Tari tetap tergambar. Perhatikan garis bantunya.',
        },
      },
      {
        id: 'kNol',
        tanya:
          'Saat sumbu tegak dimulai dari 15, batang Pramuka tampak 11 kali batang Tari. Mengapa diagram ini menyesatkan?',
        opsi: [
          {
            id: 'sebanding',
            label:
              'Tinggi batang tidak lagi sebanding dengan frekuensi; sebenarnya 48 kurang dari 3 kali 18',
          },
          { id: 'benar', label: 'Tidak menyesatkan; Pramuka memang 11 kali Tari' },
          { id: 'warna', label: 'Karena semua batang berwarna sama' },
          { id: 'lebar', label: 'Karena batangnya terlalu lebar' },
        ],
        correct: 'sebanding',
        umpan: {
          sebanding:
            'Tepat! Bagian 0–15 "dipotong", sehingga batang yang pendek tampak jauh lebih pendek. Sumbu tegak harus dimulai dari 0.',
          benar: 'Hitung: 11 × 18 = 198, jauh dari 48. Jadi kesan dari tinggi batang itu salah.',
          warna:
            'Warna batang tidak mengubah kesan perbandingan. Lihat angka terbawah sumbu tegak.',
          lebar: 'Lebar batang tidak berubah. Lihat angka terbawah sumbu tegak.',
        },
      },
      {
        id: 'kTepat',
        tanya: 'Langkah skala yang tepat untuk frekuensi terbesar 48 adalah …',
        opsi: [
          { id: 'l5atau10', label: '5 atau 10: angkanya rapi dan cukup 5–10 garis bantu' },
          { id: 'l1', label: '1, agar setiap nilai punya garis sendiri' },
          { id: 'l20', label: '20, agar diagramnya pendek' },
          { id: 'l7', label: '7, karena 48 hampir sama dengan 7 × 7' },
        ],
        correct: 'l5atau10',
        umpan: {
          l5atau10:
            'Tepat! Langkah 5 memberi 10 garis (0–50) dan langkah 10 memberi 5 garis (0–50). Keduanya mudah dibaca.',
          l1: 'Langkah 1 memerlukan 48 garis bantu: terlalu rapat.',
          l20: 'Langkah 20 hanya memberi 3 garis bantu: batangnya sulit dibandingkan.',
          l7: 'Langkah 7 tidak rapi: sulit membaca nilai seperti 30 atau 36 di antara garisnya.',
        },
      },
    ],
    pilah: {
      judul: 'Pilah: skala tepat atau tidak tepat?',
      pengantar:
        'Periksa setiap sumbu tegak: dimulai dari 0? Jarak angkanya sama? Langkahnya rapi dan banyak garis bantunya 5–10?',
      kategori: [
        { id: 'tepat', label: 'Skala tepat' },
        { id: 'tidak', label: 'Skala tidak tepat' },
      ],
      butir: [
        {
          id: 's1',
          teks: 'Frekuensi terbesar 48; sumbu tegak 0, 5, 10, …, 50',
          cek: { max: 48, langkah: 5 },
          explanation: 'Dimulai dari 0, langkah 5 rapi, 10 garis bantu.',
        },
        {
          id: 's2',
          teks: 'Frekuensi terbesar 48; sumbu tegak 0, 1, 2, …, 48',
          cek: { max: 48, langkah: 1 },
          explanation: '48 garis bantu: terlalu rapat.',
        },
        {
          id: 's3',
          teks: 'Frekuensi terbesar 14; sumbu tegak 0, 2, 4, …, 14',
          cek: { max: 14, langkah: 2 },
          explanation: 'Dimulai dari 0, langkah 2 rapi, 7 garis bantu.',
        },
        {
          id: 's4',
          teks: 'Frekuensi terbesar 14; sumbu tegak 0, 7, 14',
          cek: { max: 14, langkah: 7 },
          explanation: 'Langkah 7 tidak rapi dan garisnya terlalu sedikit.',
        },
        {
          id: 's5',
          teks: 'Frekuensi terbesar 90; sumbu tegak 0, 10, 20, …, 90',
          cek: { max: 90, langkah: 10 },
          explanation: 'Dimulai dari 0, langkah 10 rapi, 9 garis bantu.',
        },
        {
          id: 's6',
          teks: 'Frekuensi terbesar 48; sumbu tegak 15, 20, 25, …, 50',
          cek: { max: 48, langkah: 5, mulai: 15 },
          explanation: 'Tidak dimulai dari 0: tinggi batang tidak sebanding dengan frekuensi.',
        },
        {
          id: 's7',
          teks: 'Frekuensi terbesar 20; sumbu tegak 0, 1, 2, 5, 10, 20 dengan jarak garis yang sama',
          cek: { max: 20, langkah: 1, intervalSama: false },
          explanation: 'Selisih angkanya tidak sama (1, 1, 3, 5, 10): batang menjadi menipu.',
        },
        {
          id: 's8',
          teks: 'Frekuensi terbesar 240; sumbu tegak 0, 25, 50, …, 250',
          cek: { max: 240, langkah: 25 },
          explanation: 'Dimulai dari 0, langkah 25 rapi, 10 garis bantu.',
        },
        {
          id: 's9',
          teks: 'Frekuensi terbesar 9; sumbu tegak 0, 1, 2, …, 9',
          cek: { max: 9, langkah: 1 },
          explanation: 'Untuk data kecil, langkah 1 tepat: 9 garis bantu.',
        },
      ],
    },
    langkah: [
      {
        id: 'ls1',
        label:
          'Frekuensi terbesar suatu data 48. Tulis SATU langkah skala yang tepat untuk sumbu tegaknya.',
        cek: { minta: 'skala', max: 48 },
        placeholder: 'mis. 2',
        hints: [
          'Langkah rapi: 1, 2, 5, 10, 20, …',
          'Banyak garis bantu = 48 : langkah (dibulatkan ke atas); usahakan 5–10 garis.',
        ],
        temuan: 'Langkah 5 (10 garis) atau 10 (5 garis) sama-sama tepat.',
      },
      {
        id: 'ls2',
        label: 'Dengan langkah 5 untuk frekuensi terbesar 48, berapa banyak garis bantu di atas 0?',
        cek: { minta: 'garis', max: 48, langkah: 5 },
        placeholder: 'mis. 8',
        hints: ['Hitung: 5, 10, 15, … sampai melewati atau sama dengan 48.'],
        temuan: 'Angkanya 5, 10, …, 50: ada 10 garis bantu.',
      },
      {
        id: 'ls3',
        label: 'Frekuensi terbesar 37 dan langkah skala 5. Berapa angka teratas pada sumbu tegak?',
        cek: { minta: 'puncak', max: 37, langkah: 5 },
        placeholder: 'mis. 30',
        hints: ['Cari kelipatan 5 terkecil yang tidak kurang dari 37.'],
        temuan: 'Kelipatan 5 terkecil yang ≥ 37 adalah 40.',
      },
    ],
    ringkasan:
      'Skala sumbu tegak tepat bila dimulai dari 0, jarak angkanya sama, dan langkahnya bilangan rapi (1, 2, 5, 10, 20, 25, 50, …) sehingga cukup 5–10 garis bantu. Angka teratas sumbu adalah kelipatan langkah yang tidak kurang dari frekuensi terbesar.',
    nextLabel: 'Lanjut: Olah Diagram Batang →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — DATA PROCESSING: DIAGRAM BATANG
     ---------------------------------------------------------- */
  olahBatang: {
    kicker: 'Tahap 4c · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menyajikan data kantin dalam diagram batang dengan skala tepat, lalu menemukan ciri diagram batang yang baik dan cara membacanya.',
    guru: 'Saat murid mengatur batang bakso (9) dengan langkah 2, tanyakan: "Ujungnya di garis mana?" Pesan diagnosa muncul bila murid menyamakan banyak kotak dengan frekuensi. Minta pasangan saling memeriksa judul dan nama sumbu.',
    judul: 'Lab Diagram Batang: data kantin',
    pengantar:
      'Pakai tabel frekuensi dari Lab Turus. Pilih langkah skala, lengkapi judul dan nama sumbu, lalu atur tinggi setiap batang.',
    belumCukup: 'Selesaikan diagram batangmu dulu untuk membuka pertanyaan temuan.',
    lab: {
      langkahOpsi: [1, 2, 3, 5],
      kelengkapan: [
        {
          id: 'judul',
          tanya: 'Judul yang tepat untuk diagram ini:',
          opsi: [
            { id: 'baku', label: 'Jajanan Kesukaan Murid Kelas VII A' },
            { id: 'diagram', label: 'Diagram Batang' },
            { id: 'kantin', label: 'Kantin Sekolah' },
            { id: 'harga', label: 'Harga Jajanan di Kantin' },
          ],
          correct: 'baku',
          umpan: {
            diagram: 'Judul harus menjelaskan data apa yang disajikan, bukan jenis diagramnya.',
            kantin: 'Terlalu umum. Data apa tentang kantin yang disajikan?',
            harga: 'Bu Sari tidak mencatat harga. Data kita tentang jajanan kesukaan.',
          },
        },
        {
          id: 'labelX',
          tanya: 'Nama sumbu mendatar (di bawah batang):',
          opsi: [
            { id: 'baku', label: 'Jenis jajanan' },
            { id: 'banyak', label: 'Banyak murid' },
            { id: 'nama', label: 'Nama murid' },
          ],
          correct: 'baku',
          umpan: {
            banyak:
              'Banyak murid dibaca pada sumbu tegak. Di bawah batang tertulis kategori jajanan.',
            nama: 'Nama murid tidak muncul pada diagram. Setiap batang mewakili satu jenis jajanan.',
          },
        },
        {
          id: 'labelY',
          tanya: 'Nama sumbu tegak (angka skala):',
          opsi: [
            { id: 'baku', label: 'Banyak murid' },
            { id: 'jenis', label: 'Jenis jajanan' },
            { id: 'harga', label: 'Harga (rupiah)' },
          ],
          correct: 'baku',
          umpan: {
            jenis:
              'Jenis jajanan ada di sumbu mendatar. Angka pada sumbu tegak menyatakan frekuensi.',
            harga: 'Angka pada sumbu tegak adalah frekuensi: banyak murid yang memilih.',
          },
        },
      ],
    },
    diagramLatihan: {
      judul: 'Transportasi Murid Kelas VII B ke Sekolah',
      labelX: 'Moda transportasi',
      labelY: 'Banyak murid',
      kategori: KAT_TRANSPORT,
      frek: FREK_TRANSPORT,
      langkah: 2,
    },
    temuan: [
      {
        id: 'bLebar',
        tanya: 'Bagaimana seharusnya lebar dan jarak antarbatang pada diagram batang?',
        opsi: [
          { id: 'sama', label: 'Semua batang sama lebar dan jaraknya sama' },
          { id: 'frek', label: 'Batang berfrekuensi besar dibuat lebih lebar' },
          { id: 'bebas', label: 'Bebas, asalkan tingginya benar' },
          { id: 'rapat', label: 'Batang harus saling menempel tanpa jarak' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Tepat! Hanya TINGGI batang yang menyatakan frekuensi, jadi lebar dan jaraknya dibuat sama.',
          frek: 'Batang yang lebih lebar tampak lebih besar sehingga menipu. Frekuensi cukup ditunjukkan oleh tinggi.',
          bebas: 'Lebar yang berbeda-beda memberi kesan keliru. Lihat lagi diagrammu.',
          rapat:
            'Pada diagram batang data kategorik, batang-batang diberi jarak karena setiap kategori terpisah.',
        },
      },
      {
        id: 'bAntara',
        tanya: 'Frekuensi bakso 9 dan langkah skalanya 2. Di mana ujung batang bakso?',
        opsi: [
          { id: 'tengah', label: 'Di tengah-tengah antara garis 8 dan garis 10' },
          { id: 'g8', label: 'Tepat pada garis 8' },
          { id: 'g10', label: 'Tepat pada garis 10' },
          { id: 'kotak9', label: 'Pada garis bantu ke-9 dari bawah' },
        ],
        correct: 'tengah',
        umpan: {
          tengah:
            'Tepat! 9 berada di antara 8 dan 10, tepat di tengahnya. Frekuensi tidak harus jatuh pada garis bantu.',
          g8: 'Garis 8 berarti 8 murid, padahal bakso dipilih 9 murid.',
          g10: 'Garis 10 berarti 10 murid, padahal bakso dipilih 9 murid.',
          kotak9:
            'Dengan langkah 2, garis ke-9 bernilai 18. Baca angka skalanya, jangan menghitung kotak.',
        },
      },
      {
        id: 'bUrut',
        tanya: 'Bolehkah batang pada diagram batang data kategorik diurutkan dari yang tertinggi?',
        opsi: [
          {
            id: 'boleh',
            label: 'Boleh; kategori tidak punya urutan nilai, jadi urutan batang boleh diatur',
          },
          { id: 'abjad', label: 'Tidak boleh; batang harus urut abjad' },
          { id: 'wajib', label: 'Wajib selalu diurutkan dari yang terendah' },
          { id: 'ubah', label: 'Tidak boleh karena frekuensinya akan berubah' },
        ],
        correct: 'boleh',
        umpan: {
          boleh:
            'Tepat! Urutan dari tertinggi sering memudahkan perbandingan, tetapi urutan lain juga benar asal tingginya tepat.',
          abjad: 'Tidak ada aturan abjad. Urutan kategori boleh dipilih bebas.',
          wajib: 'Tidak ada kewajiban seperti itu. Urutan kategori boleh dipilih bebas.',
          ubah: 'Memindahkan urutan batang tidak mengubah frekuensi setiap kategori.',
        },
      },
    ],
    pilah: {
      judul: 'Pilah: bagian yang wajib ada pada diagram batang',
      pengantar: 'Mana yang wajib ada agar diagram batang dapat dibaca dengan benar?',
      kategori: [
        { id: 'wajib', label: 'Wajib ada' },
        { id: 'pilihan', label: 'Tidak wajib (hiasan/pilihan)' },
      ],
      butir: [
        {
          id: 'wJudul',
          teks: 'Judul diagram',
          correct: 'wajib',
          explanation: 'Judul menjelaskan data apa yang disajikan.',
        },
        {
          id: 'wSumbuY',
          teks: 'Nama sumbu tegak (mis. "Banyak murid")',
          correct: 'wajib',
          explanation: 'Pembaca perlu tahu arti angka pada sumbu tegak.',
        },
        {
          id: 'wKategori',
          teks: 'Nama kategori di bawah setiap batang',
          correct: 'wajib',
          explanation: 'Tanpa nama kategori, batang tidak dapat dikenali.',
        },
        {
          id: 'wSkala',
          teks: 'Angka skala sumbu tegak yang dimulai dari 0',
          correct: 'wajib',
          explanation: 'Skala diperlukan untuk membaca frekuensi dengan jujur.',
        },
        {
          id: 'wLebar',
          teks: 'Batang yang sama lebar',
          correct: 'wajib',
          explanation: 'Lebar yang berbeda memberi kesan keliru.',
        },
        {
          id: 'pWarna',
          teks: 'Warna batang yang berbeda-beda',
          correct: 'pilihan',
          explanation: 'Boleh, tetapi tidak wajib. Satu warna pun sudah benar.',
        },
        {
          id: 'pGambar',
          teks: 'Gambar hiasan jajanan di pojok',
          correct: 'pilihan',
          explanation: 'Hiasan tidak membawa informasi data.',
        },
        {
          id: 'pUrut',
          teks: 'Batang diurutkan dari yang tertinggi',
          correct: 'pilihan',
          explanation: 'Urutan kategori boleh dipilih bebas.',
        },
      ],
    },
    langkah: [
      {
        id: 'lb1',
        label: 'Baca diagram di atas: berapa murid yang naik sepeda?',
        cek: {
          minta: 'baca',
          frek: FREK_TRANSPORT,
          kategori: KAT_TRANSPORT,
          langkah: 2,
          kat: 'sepeda',
        },
        placeholder: 'mis. 6',
        hints: ['Ujung batang sepeda berada di antara dua garis bantu. Angka berapa di tengahnya?'],
        temuan: 'Ujung batang sepeda di tengah garis 8 dan 10: 9 murid.',
      },
      {
        id: 'lb2',
        label: 'Berapa murid yang naik motor?',
        cek: {
          minta: 'baca',
          frek: FREK_TRANSPORT,
          kategori: KAT_TRANSPORT,
          langkah: 2,
          kat: 'motor',
        },
        placeholder: 'mis. 6',
        hints: ['Telusuri ujung batang motor secara mendatar ke sumbu tegak.'],
        temuan: 'Ujung batang motor di tengah garis 10 dan 12: 11 murid.',
      },
      {
        id: 'lb3',
        label: 'Berapa lebih banyak murid yang berjalan kaki daripada yang naik angkot?',
        cek: {
          minta: 'selisih',
          frek: FREK_TRANSPORT,
          kategori: KAT_TRANSPORT,
          langkah: 2,
          a: 'jalan',
          b: 'angkot',
        },
        placeholder: 'mis. 6',
        hints: ['Baca kedua frekuensi, lalu kurangkan yang besar dengan yang kecil.'],
        temuan: 'Jalan kaki 14 dan angkot 4: selisihnya 14 − 4 = 10 murid.',
      },
    ],
    ringkasan:
      'Diagram batang memuat judul, nama sumbu, nama kategori, dan skala yang dimulai dari 0. Batang sama lebar dan berjarak sama; tingginya sama dengan frekuensi, walaupun ujungnya bisa berada di antara dua garis bantu.',
    nextLabel: 'Lanjut: Verifikasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — VERIFICATION
     Data baru dipilih acak dari bank; langkah prediksi dibangun
     app.js dari engine (skala, puncak, total).
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Verifikasi',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji temuan pada data baru dengan memprediksi skala lalu membuktikannya lewat diagram batang, memilah pernyataan, dan membandingkannya dengan dugaan awal.',
    guru: 'Pada bagian A, minta murid menulis prediksi di kertas lebih dulu. Murid yang mendapat data berbeda dapat saling menukar hasil. Pada bagian B, minta contoh pendukung atau contoh penyangkal untuk setiap pernyataan.',
    judulA: 'A. Prediksi lalu buktikan',
    pengantarA:
      'Kamu mendapat data baru yang frekuensinya lebih besar. Prediksi langkah skala, angka teratas sumbu, dan banyak datanya. Lalu buktikan dengan membuat diagram batangnya.',
    buktiJudul: 'Buktikan: buat diagram batangnya',
    buktiTeks:
      'Terbukti! Dengan skala yang tepat, setiap batang mudah dibaca dan tingginya sebanding dengan frekuensinya.',
    bank: [
      {
        id: 'vTransport',
        ikon: '🚲',
        nama: 'Transportasi ke sekolah',
        judul: 'Moda Transportasi Murid Kelas VII ke Sekolah',
        labelX: 'Moda transportasi',
        labelY: 'Banyak murid',
        kategori: [
          { id: 'jalan', label: 'Jalan kaki' },
          { id: 'sepeda', label: 'Sepeda' },
          { id: 'motor', label: 'Motor' },
          { id: 'angkot', label: 'Angkot' },
          { id: 'mobil', label: 'Mobil' },
        ],
        frek: { jalan: 64, sepeda: 38, motor: 52, angkot: 21, mobil: 9 },
      },
      {
        id: 'vGoldar',
        ikon: '🩸',
        nama: 'Golongan darah',
        judul: 'Golongan Darah Murid Kelas VII C',
        labelX: 'Golongan darah',
        labelY: 'Banyak murid',
        kategori: KAT_GOLDAR,
        frek: { A: 9, B: 7, AB: 3, O: 13 },
      },
      {
        id: 'vWarna',
        ikon: '🎨',
        nama: 'Warna kesukaan',
        judul: 'Warna Kesukaan Murid Kelas VII A dan VII B',
        labelX: 'Warna',
        labelY: 'Banyak murid',
        kategori: [
          { id: 'merah', label: 'Merah' },
          { id: 'biru', label: 'Biru' },
          { id: 'hijau', label: 'Hijau' },
          { id: 'kuning', label: 'Kuning' },
          { id: 'ungu', label: 'Ungu' },
        ],
        frek: { merah: 15, biru: 27, hijau: 18, kuning: 8, ungu: 12 },
      },
      {
        id: 'vOlahraga',
        ikon: '⚽',
        nama: 'Olahraga favorit',
        judul: 'Olahraga Favorit Murid SMP Harapan',
        labelX: 'Cabang olahraga',
        labelY: 'Banyak murid',
        kategori: [
          { id: 'sepakBola', label: 'Sepak bola' },
          { id: 'bulutangkis', label: 'Bulu tangkis' },
          { id: 'voli', label: 'Voli' },
          { id: 'basket', label: 'Basket' },
          { id: 'renang', label: 'Renang' },
        ],
        frek: { sepakBola: 85, bulutangkis: 70, voli: 45, basket: 30, renang: 20 },
      },
    ],
    judulB: 'B. Selalu benar, kadang-kadang benar, atau salah?',
    opsiPernyataan: [
      { id: 'selalu', label: 'Selalu benar' },
      { id: 'kadang', label: 'Kadang-kadang benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'v1',
        teks: 'Jumlah semua frekuensi pada tabel frekuensi sama dengan banyak data.',
        correct: 'selalu',
        explanation: 'Setiap data tercatat tepat satu kali pada satu kategori.',
      },
      {
        id: 'v2',
        teks: 'Sumbu tegak diagram batang boleh dimulai dari angka selain 0.',
        correct: 'salah',
        explanation:
          'Bila tidak dimulai dari 0, tinggi batang tidak sebanding dengan frekuensinya.',
      },
      {
        id: 'v3',
        teks: 'Langkah skala 1 adalah skala yang tepat.',
        correct: 'kadang',
        explanation: 'Tepat bila frekuensi terbesar kecil (≤ 10); terlalu rapat untuk data besar.',
      },
      {
        id: 'v4',
        teks: 'Ujung batang selalu jatuh tepat pada garis bantu.',
        correct: 'kadang',
        explanation: 'Bila frekuensinya bukan kelipatan langkah, ujungnya di antara dua garis.',
      },
      {
        id: 'v5',
        teks: 'Batang yang lebih lebar menunjukkan frekuensi yang lebih besar.',
        correct: 'salah',
        explanation: 'Frekuensi hanya ditunjukkan oleh tinggi batang; semua batang sama lebar.',
      },
      {
        id: 'v6',
        teks: 'Pada diagram batang yang benar, batang tertinggi menunjukkan kategori dengan frekuensi terbesar.',
        correct: 'selalu',
        explanation: 'Tinggi batang sebanding dengan frekuensi bila skala dimulai dari 0.',
      },
    ],
    judulC: 'C. Bandingkan dengan dugaan awalmu',
    nextLabel: 'Lanjut: Generalisasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — GENERALIZATION
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Generalisasi',
    syntax: DL + ' · Sintaks 6',
    goal: 'Menyusun kesimpulan tentang cara menyajikan data kategorik dalam tabel frekuensi dan diagram batang dengan skala yang tepat.',
    guru: 'Minta setiap pasangan membacakan satu kesimpulan sambil menunjuk contohnya pada tabel atau diagram buatan mereka sebelum memeriksa.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'g1', awal: 'Data kategorik adalah data', correct: 'b1' },
      { id: 'g2', awal: 'Pada tabel frekuensi, jumlah semua frekuensi', correct: 'b2' },
      { id: 'g3', awal: 'Turus dicatat', correct: 'b3' },
      { id: 'g4', awal: 'Sumbu tegak diagram batang harus', correct: 'b4' },
      { id: 'g5', awal: 'Langkah skala yang tepat adalah', correct: 'b5' },
      { id: 'g6', awal: 'Batang-batang pada diagram batang', correct: 'b6' },
    ],
    bank: [
      { id: 'b1', teks: 'yang berupa nama atau kelompok, bukan hasil mengukur.' },
      { id: 'b2', teks: 'sama dengan banyak data.' },
      {
        id: 'b3',
        teks: 'satu garis untuk setiap data dan dikelompokkan per lima agar mudah dihitung.',
      },
      { id: 'b4', teks: 'dimulai dari 0 dengan jarak angka yang sama.' },
      {
        id: 'b5',
        teks: 'bilangan rapi (1, 2, 5, 10, …) sehingga sumbu memuat sekitar 5–10 garis bantu.',
      },
      { id: 'b6', teks: 'sama lebar, berjarak sama, dan tingginya sama dengan frekuensinya.' },
      { id: 'x1', teks: 'dimulai dari frekuensi terkecil agar perbedaannya tampak jelas.' },
      { id: 'x2', teks: 'sama dengan banyak kategori.' },
      { id: 'x3', teks: 'selalu 1 agar setiap nilai punya garis sendiri.' },
    ],
    rangkuman: [
      'Data kategorik (jajanan, golongan darah, transportasi) dicatat dengan turus lalu disajikan dalam tabel frekuensi.',
      'Jumlah frekuensi = banyak data; pakai untuk memeriksa apakah ada data yang terlewat.',
      'Skala sumbu tegak: mulai dari 0, jarak sama, langkah rapi, sekitar 5–10 garis bantu.',
      'Angka teratas sumbu = kelipatan langkah terkecil yang tidak kurang dari frekuensi terbesar.',
      'Diagram batang lengkap: judul, nama kedua sumbu, nama kategori, dan batang sama lebar setinggi frekuensinya.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Bank 16 soal; diambil acak sesuai komposisi. `diagram` (opsional)
     berisi judul, nama sumbu & langkah gambar diagram soal.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    goal: 'Menerapkan cara menyajikan dan membaca data kategorik pada situasi sehari-hari.',
    guru: 'Murid mengerjakan mandiri. Pesan salah berupa diagnosa miskonsepsi (mis. lupa menghitung garis miring turus, membaca kotak alih-alih angka skala); minta murid membacanya sebelum mencoba lagi.',
    instruksi:
      'Kerjakan setiap soal. Isian diperiksa langsung; pada pilihan ganda, baca umpan baliknya.',
    banyak: 8,
    komposisi: { input: 4, choice: 4 },
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: 'sekolah',
        cerita:
          'Ketua kelas menanyakan ekstrakurikuler pilihan 16 teman. Jawaban mereka tercatat di bawah ini.',
        pertanyaan: 'Berapa teman yang memilih Futsal?',
        cek: { minta: 'frekuensi', data: EKSKUL_16, kategori: KAT_EKSKUL4, kat: 'futsal' },
        hints: ['Turuskan hanya jawaban Futsal.'],
        explanation: 'Pramuka 5, Futsal 4, Tari 3, Robotik 4; jumlahnya 16.',
      },
      {
        id: 't2',
        type: 'input',
        konteks: 'rumah',
        cerita: 'Tabel berikut menyajikan hewan peliharaan murid kelas VII D.',
        pertanyaan: 'Berapa banyak murid yang didata?',
        cek: { minta: 'total', frek: FREK_HEWAN, kategori: KAT_HEWAN },
        hints: ['Jumlahkan semua frekuensi.'],
        explanation: '12 + 7 + 9 + 4 = 32 murid.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: 'kantin',
        cerita: 'Bu Sari menurus pembeli es teh selama jam istirahat seperti di bawah ini.',
        pertanyaan: 'Berapa banyak pembeli es teh?',
        cek: { minta: 'turus', n: 17 },
        hints: ['Setiap kelompok turus bernilai 5.'],
        explanation: 'Tiga kelompok lima dan dua garis: 15 + 2 = 17.',
      },
      {
        id: 't4',
        type: 'input',
        konteks: 'skala',
        cerita:
          'Rina akan menggambar diagram batang dengan frekuensi terbesar 43 dan langkah skala 5.',
        pertanyaan: 'Berapa angka teratas yang harus ia tulis pada sumbu tegak?',
        cek: { minta: 'puncak', max: 43, langkah: 5 },
        hints: ['Cari kelipatan 5 terkecil yang tidak kurang dari 43.'],
        explanation: 'Kelipatan 5 terkecil yang ≥ 43 adalah 45.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: 'skala',
        cerita: 'Frekuensi terbesar suatu data 64 dan langkah skala sumbu tegaknya 10.',
        pertanyaan: 'Berapa banyak garis bantu di atas 0?',
        cek: { minta: 'garis', max: 64, langkah: 10 },
        hints: ['Hitung 10, 20, 30, … sampai melewati 64.'],
        explanation: 'Angkanya 10, 20, …, 70: ada 7 garis bantu.',
      },
      {
        id: 't6',
        type: 'input',
        konteks: 'kantin',
        cerita: 'Diagram berikut menyajikan buah kesukaan murid kelas VII E.',
        pertanyaan: 'Berapa murid yang menyukai apel?',
        cek: { minta: 'baca', frek: FREK_BUAH, kategori: KAT_BUAH, langkah: 2, kat: 'apel' },
        diagram: {
          judul: 'Buah Kesukaan Murid Kelas VII E',
          labelX: 'Buah',
          labelY: 'Banyak murid',
          langkah: 2,
        },
        hints: ['Ujung batang apel berada di antara dua garis bantu.'],
        explanation: 'Ujung batang apel di tengah garis 10 dan 12: 11 murid.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: 'lingkungan',
        cerita: 'Saat Jumat Bersih, kelas VII mengumpulkan sampah plastik seperti pada diagram.',
        pertanyaan: 'Berapa lebih banyak botol daripada kantong yang terkumpul?',
        cek: {
          minta: 'selisih',
          frek: { botol: 35, gelas: 25, kantong: 15, sedotan: 10 },
          kategori: KAT_SAMPAH,
          langkah: 5,
          a: 'botol',
          b: 'kantong',
        },
        diagram: {
          judul: 'Sampah Plastik Jumat Bersih',
          labelX: 'Jenis sampah',
          labelY: 'Banyak sampah (buah)',
          langkah: 5,
        },
        hints: ['Baca kedua frekuensi pada sumbu tegak, lalu kurangkan.'],
        explanation: 'Botol 35 dan kantong 15: selisihnya 20.',
      },
      {
        id: 't8',
        type: 'input',
        konteks: 'skala',
        cerita: 'Frekuensi terbesar data warna kesukaan adalah 27.',
        pertanyaan: 'Tulis langkah skala yang tepat untuk sumbu tegaknya.',
        cek: { minta: 'skala', max: 27 },
        hints: ['Coba langkah rapi 2, 5, 10: mana yang memberi 5–10 garis bantu?'],
        explanation: 'Langkah 5 memberi 6 garis bantu (0–30).',
      },
      {
        id: 'c1',
        type: 'choice',
        konteks: 'skala',
        cerita: 'Data moda transportasi seluruh murid kelas VII mempunyai frekuensi terbesar 64.',
        pertanyaan: 'Skala sumbu tegak manakah yang tepat?',
        cek: { minta: 'skala', max: 64 },
        explanation: 'Langkah 10 rapi dan memberi 7 garis bantu (0–70).',
      },
      {
        id: 'c2',
        type: 'choice',
        konteks: 'skala',
        cerita: 'Data golongan darah satu kelas mempunyai frekuensi terbesar 14.',
        pertanyaan: 'Skala sumbu tegak manakah yang tepat?',
        cek: { minta: 'skala', max: 14 },
        explanation: 'Langkah 2 rapi dan memberi 7 garis bantu (0–14).',
      },
      {
        id: 'c3',
        type: 'choice',
        konteks: 'sekolah',
        cerita: 'Diagram berikut menyajikan mata pelajaran favorit murid kelas VII F.',
        pertanyaan: 'Mata pelajaran apa yang paling banyak difavoritkan?',
        cek: { minta: 'terbanyak', frek: FREK_MAPEL, kategori: KAT_MAPEL },
        diagram: {
          judul: 'Mata Pelajaran Favorit Kelas VII F',
          labelX: 'Mata pelajaran',
          labelY: 'Banyak murid',
          langkah: 2,
        },
        explanation: 'Batang PJOK paling tinggi (14), sedikit di atas Matematika (13).',
      },
      {
        id: 'c4',
        type: 'choice',
        konteks: 'sekolah',
        cerita: 'Petugas perpustakaan mencatat jenis buku yang dipinjam dalam satu minggu.',
        pertanyaan: 'Jenis buku apa yang paling sering dipinjam?',
        cek: { minta: 'terbanyak', frek: FREK_BUKU, kategori: KAT_BUKU },
        diagram: {
          judul: 'Buku yang Dipinjam Minggu Ini',
          labelX: 'Jenis buku',
          labelY: 'Banyak peminjaman',
          langkah: 5,
        },
        explanation: 'Batang komik paling tinggi: 24 kali dipinjam.',
      },
      {
        id: 'c5',
        type: 'choice',
        konteks: 'rumah',
        cerita: 'Dimas menggambar diagram hewan peliharaan teman sekelasnya.',
        pertanyaan: 'Apa yang keliru pada diagram Dimas?',
        cek: { minta: 'cacat', frek: FREK_HEWAN, kategori: KAT_HEWAN, cacat: 'mulaiBukanNol' },
        diagram: {
          judul: 'Hewan Peliharaan Murid Kelas VII D',
          labelX: 'Hewan',
          labelY: 'Banyak murid',
          langkah: 1,
        },
        explanation: 'Sumbu tegaknya dimulai dari 2, sehingga batang burung tampak sangat pendek.',
      },
      {
        id: 'c6',
        type: 'choice',
        konteks: 'kantin',
        cerita: 'Sebuah poster menampilkan diagram buah kesukaan murid.',
        pertanyaan: 'Apa yang keliru pada diagram poster itu?',
        cek: { minta: 'cacat', frek: FREK_BUAH, kategori: KAT_BUAH, cacat: 'intervalTakSama' },
        diagram: {
          judul: 'Buah Kesukaan Murid Kelas VII E',
          labelX: 'Buah',
          labelY: 'Banyak murid',
          langkah: 1,
        },
        explanation: 'Angka sumbunya 0, 1, 2, 5, 10, 20 dengan jarak garis yang sama: menipu.',
      },
      {
        id: 'c7',
        type: 'choice',
        konteks: 'sekolah',
        cerita: 'Laporan perpustakaan memuat diagram berikut.',
        pertanyaan: 'Apa yang keliru pada diagram laporan itu?',
        cek: { minta: 'cacat', frek: FREK_BUKU, kategori: KAT_BUKU, cacat: 'lebarBeda' },
        diagram: {
          judul: 'Buku yang Dipinjam Minggu Ini',
          labelX: 'Jenis buku',
          labelY: 'Banyak peminjaman',
          langkah: 5,
        },
        explanation: 'Lebar batangnya berbeda-beda sehingga kategori tertentu tampak lebih besar.',
      },
      {
        id: 'c8',
        type: 'choice',
        konteks: 'sekolah',
        cerita: 'Sinta menempelkan diagram ini di papan kelas tanpa keterangan apa pun.',
        pertanyaan: 'Apa yang kurang pada diagram Sinta?',
        cek: { minta: 'cacat', frek: FREK_MAPEL, kategori: KAT_MAPEL, cacat: 'tanpaJudul' },
        diagram: { langkah: 2 },
        explanation: 'Tanpa judul dan nama sumbu, pembaca tidak tahu data apa yang disajikan.',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    goal: 'Merefleksikan proses penemuan dan tingkat pemahaman diri.',
    guru: 'Ajak beberapa murid membacakan jawaban pertanyaan ketiga. Catat miskonsepsi yang masih muncul (mis. sumbu tidak dimulai dari 0, membaca kotak alih-alih angka skala) untuk pertemuan berikutnya tentang diagram lain.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Mengapa jumlah frekuensi harus sama dengan banyak data? Bagaimana kamu memakainya untuk memeriksa tabelmu?',
        placeholder: 'Tulis jawabanmu…',
      },
      {
        id: 'r2',
        teks: 'Bagaimana caramu memilih langkah skala yang tepat? Ceritakan dengan satu contoh.',
        placeholder: 'Tulis jawabanmu…',
      },
      {
        id: 'r3',
        teks: 'Pernahkah kamu melihat diagram yang menyesatkan (di iklan, berita, atau media sosial)? Apa yang membuatnya menyesatkan?',
        placeholder: 'Tulis jawabanmu…',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu menyajikan data dalam tabel frekuensi dan diagram batang sekarang?',
    diriOpsi: [
      { id: 'sangat', label: 'Sangat yakin, aku bisa menjelaskannya kepada teman' },
      { id: 'yakin', label: 'Yakin, walau kadang perlu melihat catatan' },
      { id: 'cukup', label: 'Cukup yakin, tetapi masih ragu memilih skala' },
      { id: 'belum', label: 'Belum yakin, aku perlu berlatih lagi' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat! Kamu sudah dapat menyajikan data kategorik.',
    teks: 'Dari catatan acak Bu Sari, kamu menyusun tabel frekuensi dengan turus, memilih skala sumbu tegak yang tepat, dan menggambar diagram batang yang mudah dan jujur dibaca.',
    capaian: [
      'Membedakan data kategorik dan data numerik.',
      'Menurus data dan menyusun tabel frekuensi yang jumlahnya sama dengan banyak data.',
      'Memilih langkah skala yang rapi dengan 5–10 garis bantu dan sumbu yang dimulai dari 0.',
      'Menggambar diagram batang lengkap dengan judul, nama sumbu, dan batang setinggi frekuensinya.',
      'Membaca diagram batang dan mengenali diagram yang menyesatkan.',
    ],
  },
};
