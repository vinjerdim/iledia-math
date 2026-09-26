'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Masalah Kontekstual Bilangan Berpangkat Bulat
   Fase E (Kelas X) — SMK Rekayasa Perangkat Lunak
   Topik 1 Sifat-sifat Eksponen

   Tujuan Pembelajaran:
   Menggunakan sifat-sifat bilangan berpangkat bulat untuk
   menyelesaikan masalah kontekstual.

   Model pembelajaran: PROBLEM BASED LEARNING (PBL).
   Masalah pemantik: "Penyimpanan Aplikasi Galeri Karya Siswa".
   Kelompok murid berperan sebagai tim developer yang membangun
   aplikasi web Galeri Karya untuk sekolah. Klien (Bu Rina, wakil
   kepala sekolah) mengirim tiket kebutuhan:
     • foto karya dari tablet sekolah berukuran 2¹² × 2¹¹ piksel
       (4.096 × 2.048), setiap piksel 2² byte → 2²⁵ byte (32 MiB);
     • aplikasi mengompres foto menjadi 2⁻³ kali ukuran mentah → 2²²
       byte (4 MiB);
     • 2⁹ murid × 2⁴ foto per tahun = 2¹³ foto → 2³⁵ byte (32 GiB)
       per tahun;
     • tiga paket cloud: Nimbus 1 TiB = (2¹⁰)⁴ byte (Rp300.000/bulan),
       Stratus 256 GiB = (2¹⁰)³ × 2⁸ byte (Rp90.000/bulan), Cirrus
       64 GiB = 2⁶ × 2³⁰ byte (Rp30.000/bulan); foto harus tersimpan
       minimal 5 tahun → lama muat 2⁵ = 32, 2³ = 8, dan 2¹ = 2 tahun;
     • Wi-Fi sekolah mengunggah 2²³ byte per detik → satu foto
       2²² : 2²³ = 2⁻¹ detik, satu tahun 2¹³ × 2⁻¹ = 2¹² detik; video
       2²³ byte → 2⁰ = 1 detik.
   Konflik kognitif: "2¹² × 2¹¹ = 2¹³²", "2⁻³ berarti −8", "(2¹⁰)⁴ =
   2¹⁴", "2⁰ = 0", dan "paket terbesar pasti terbaik". Keputusan
   akhirnya: Paket Stratus (memenuhi 8 ≥ 5 tahun dan termurah), DENGAN
   syarat kompresi tetap aktif — tanpa kompresi kebutuhan 2³⁸ byte per
   tahun sehingga Stratus hanya cukup 2⁰ = 1 tahun.

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ....... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar . 'organisasi'
     Sintaks 3 — Membimbing penyelidikan ............ 'selidikUkuran',
                                                      'selidikKapasitas',
                                                      'selidikWaktu'
     Sintaks 4 — Mengembangkan & menyajikan karya ... 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi ........ 'evaluasi'
     Penerapan & penutup ............................ 'terapkan', 'refleksi',
                                                      'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — murid menduga, memilah informasi tiket,
       menyusun rencana, memilih sifat sebelum menghitung, memeriksa
       lembar kerja tim lain, lalu merefleksikan strateginya.
     • Bermakna (meaningful) — setiap perhitungan menjawab kebutuhan
       nyata aplikasi (ukuran file, kapasitas, waktu unggah) dan
       berujung pada rekomendasi paket untuk klien.
     • Menggembirakan (joyful) — peran tim developer, kartu langkah sifat
       dengan umpan balik yang menunjuk miskonsepsi, tabel banding paket
       yang terisi otomatis, dan Laporan Rekomendasi yang dipresentasikan.

   Rangkaian aktivitas (± 2 × 45 menit; kelompok 3–4 murid):
     1. Orientasi   (8')  — tiket klien, dugaan awal (tidak dinilai),
                            rumusan masalah inti, hipotesis kelompok.
     2. Organisasi  (7')  — memilih peran tim developer, memilah
                            informasi tiket (diketahui/ditanya/tidak
                            diperlukan), menyusun urutan rencana.
     3. Ukuran      (12') — kartu langkah sifat: ukuran foto mentah
                            (aᵐ × aⁿ), konversi ke MiB (aᵐ : aⁿ), dan
                            kompresi 2⁻³ (eksponen negatif).
     4. Kapasitas   (15') — foto per tahun, kebutuhan per tahun (GiB),
                            kapasitas tiap paket ((aᵐ)ⁿ) dan lama muat
                            (aᵐ : aⁿ); tabel banding paket.
     5. Waktu       (10') — waktu unggah: hasil pangkat negatif (2⁻¹
                            detik) dan pangkat nol (2⁰ = 1 detik).
     6. Karya       (10') — rekomendasi paket, skenario tanpa kompresi,
                            Laporan Rekomendasi otomatis, kalimat
                            presentasi untuk klien.
     7. Evaluasi    (8')  — menilai lembar kerja Tim Debug langkah demi
                            langkah, menarik pelajaran, membandingkan
                            dugaan awal, refleksi proses.
     8. Uji terap   (12') — 8 soal kontekstual RPL berdiagnosa.
     9. Refleksi    (5')  — rekap, refleksi tertulis, penilaian diri.

   Kunci setiap kartu penyelidikan ditulis eksplisit pada `kunci`
   ({ k, nilai }) dan diverifikasi tests/mpi-e-1.3-data.test.js dengan
   evaluasi numerik Math.pow (bebas dari sifat yang dipelajari) serta
   dengan hasilRantai (engine seksi 44). Soal uji terap memuat `cek`
   { a, op, m, n } untuk diagnosaNilaiPangkat (engine seksi 49).

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/
   ensureTapOrderState()/shuffleArray() dari shared/engine.js, satu kali
   saat state disiapkan, sehingga tiap murid (dan tiap Reset) mendapat
   urutan berbeda.
   ============================================================ */

var PBL = 'Problem Based Learning';

/* Kartu lama muat: kapasitas paket (rantai) lalu dibagi kebutuhan per tahun. */
function kartuLamaMuat(p, kPerTahun, lama, cerita) {
  return {
    id: 'lama-' + p.id,
    paket: p.id,
    ikon: p.ikon,
    judul: 'Lama muat ' + p.nama,
    cerita: cerita,
    tanya: p.nama + ' cukup untuk berapa tahun?',
    rantai: {
      a: 2,
      awal: p.kapasitas.awal,
      langkah: p.kapasitas.langkah.concat([{ op: 'bagi', n: kPerTahun }]),
      nilai: true,
      satuan: 'tahun',
    },
    kunci: { k: p.k - kPerTahun, nilai: lama },
  };
}

var FAKTA = {
  kLebar: 12,
  kTinggi: 11,
  kBytePiksel: 2,
  kFotoMentah: 25,
  kKompresi: -3,
  kFoto: 22,
  kMurid: 9,
  kFotoPerMurid: 4,
  kFotoPerTahun: 13,
  kPerTahun: 35,
  kUnggah: 23,
  minimalTahun: 5,
};

var PAKET = [
  {
    id: 'nimbus',
    ikon: '🌩️',
    nama: 'Paket Nimbus',
    teks: '1 TiB',
    bentuk: '(2¹⁰)⁴ byte',
    kapasitas: { a: 2, awal: 10, langkah: [{ op: 'pangkat', n: 4 }] },
    k: 40,
    harga: 300000,
  },
  {
    id: 'stratus',
    ikon: '🌥️',
    nama: 'Paket Stratus',
    teks: '256 GiB',
    bentuk: '(2¹⁰)³ × 2⁸ byte',
    kapasitas: {
      a: 2,
      awal: 10,
      langkah: [
        { op: 'pangkat', n: 3 },
        { op: 'kali', n: 8 },
      ],
    },
    k: 38,
    harga: 90000,
  },
  {
    id: 'cirrus',
    ikon: '🌤️',
    nama: 'Paket Cirrus',
    teks: '64 GiB',
    bentuk: '2⁶ × 2³⁰ byte',
    kapasitas: { a: 2, awal: 6, langkah: [{ op: 'kali', n: 30 }] },
    k: 36,
    harga: 30000,
  },
];

var DATA = {
  kasus: {
    klien: 'Bu Rina',
    aplikasi: 'Galeri Karya',
  },
  fakta: FAKTA,
  paket: PAKET,

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI PADA MASALAH (PBL sintaks 1)
     Dugaan TIDAK dinilai; ditanggapi pada tahap Evaluasi.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi pada Masalah',
    syntax: PBL + ' · Sintaks 1',
    goal: 'Memahami tiket klien aplikasi Galeri Karya dan menyampaikan dugaan awal tim.',
    tp: 'Menggunakan sifat-sifat bilangan berpangkat bulat untuk menyelesaikan masalah kontekstual.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menyatakan besaran nyata (ukuran file, kapasitas, waktu) dalam bentuk bilangan berpangkat.',
      'Memilih sifat perkalian, pembagian, atau pangkat dari pangkat yang sesuai dengan operasi pada masalah.',
      'Menafsirkan hasil berpangkat negatif dan pangkat nol dalam konteks (mis. 2⁻¹ detik, 2⁰ = 1).',
      'Mengambil dan menyajikan keputusan berdasarkan hasil perhitungan berpangkat.',
    ],
    guru: 'Bacakan tiket klien seperti rapat proyek sungguhan. Tanyakan: “Paket mana yang kalian pilih kalau hanya melihat harganya?” dan “Apa arti kompresi 2⁻³?” Jangan membenarkan dugaan murid — dugaan diuji sendiri pada tahap penyelidikan dan ditanggapi pada tahap evaluasi.',
    judul: 'Penyimpanan Aplikasi Galeri Karya',
    pengantar:
      'Sekolah ingin memamerkan foto karya murid secara daring. Kelompokmu adalah tim developer yang membangun aplikasi web Galeri Karya. Sebelum aplikasi dirilis, klien meminta rekomendasi paket penyimpanan cloud yang cukup dan hemat. Semua ukuran data di dunia komputer berbentuk pangkat dari 2, jadi sifat-sifat bilangan berpangkat akan menjadi alat utama tim kalian.',
    tiketJudul: '🎫 Tiket dari klien: Bu Rina, wakil kepala sekolah',
    surat: [
      {
        id: 'sFoto',
        ikon: '📷',
        judul: 'Foto karya',
        butir: [
          'Tablet sekolah memotret dengan resolusi 4.096 × 2.048 = 2¹² × 2¹¹ piksel.',
          'Setiap piksel disimpan dalam 4 = 2² byte (merah, hijau, biru, transparansi).',
        ],
      },
      {
        id: 'sKompresi',
        ikon: '🗜️',
        judul: 'Kompresi',
        butir: ['Sebelum disimpan, aplikasi mengompres foto menjadi 2⁻³ kali ukuran mentahnya.'],
      },
      {
        id: 'sPengguna',
        ikon: '👩‍🎓',
        judul: 'Pengguna',
        butir: ['Ada 512 = 2⁹ murid. Setiap murid mengunggah 16 = 2⁴ foto per tahun.'],
      },
      {
        id: 'sPaket',
        ikon: '☁️',
        judul: 'Paket cloud',
        butir: [
          'Nimbus 1 TiB = (2¹⁰)⁴ byte, Rp300.000 per bulan.',
          'Stratus 256 GiB = (2¹⁰)³ × 2⁸ byte, Rp90.000 per bulan.',
          'Cirrus 64 GiB = 2⁶ × 2³⁰ byte, Rp30.000 per bulan.',
          'Foto harus tersimpan minimal 5 tahun tanpa dihapus, dengan biaya sehemat mungkin.',
        ],
      },
      {
        id: 'sWifi',
        ikon: '📶',
        judul: 'Wi-Fi sekolah',
        butir: ['Kecepatan unggah 8 MiB = 2²³ byte per detik.'],
      },
    ],
    satuanJudul: '📐 Satuan data biner',
    satuan: '1 KiB = 2¹⁰ byte · 1 MiB = 2²⁰ byte · 1 GiB = 2³⁰ byte · 1 TiB = 2⁴⁰ byte',
    dugaan: [
      {
        id: 'd1',
        tanya: 'Menurut tim kalian, paket mana yang sebaiknya dipilih?',
        opsi: [
          { id: 'nimbus', label: 'Paket Nimbus, karena kapasitasnya paling besar' },
          { id: 'stratus', label: 'Paket Stratus, yang tengah-tengah' },
          { id: 'cirrus', label: 'Paket Cirrus, karena paling murah' },
          { id: 'ragu', label: 'Belum tahu, harus dihitung dulu' },
        ],
      },
      {
        id: 'd2',
        tanya: 'Menurut tim kalian, apa arti kompresi menjadi 2⁻³ kali ukuran mentah?',
        opsi: [
          { id: 'seperdelapan', label: 'Ukuran foto menjadi seperdelapannya' },
          { id: 'kurang8', label: 'Ukuran foto berkurang 8 byte' },
          { id: 'negatif', label: 'Ukuran foto menjadi −8 kali (negatif)' },
          { id: 'tiga', label: 'Ukuran foto dibagi 3' },
        ],
      },
    ],
    alasanLabel: 'Tuliskan alasan dugaan tim kalian.',
    alasanPlaceholder: 'Kami menduga begitu karena …',
    catatanDugaan: 'Dugaan tidak dinilai. Kalian akan mengujinya sendiri pada tahap penyelidikan.',
    pertanyaan: 'Apa pertanyaan inti yang harus dijawab tim kalian untuk klien?',
    masalahOpsi: [
      {
        id: 'inti',
        label:
          'Berapa kebutuhan penyimpanan foto per tahun, dan paket mana yang cukup untuk minimal 5 tahun dengan biaya paling hemat?',
      },
      { id: 'warna', label: 'Warna tema apa yang paling cocok untuk aplikasi Galeri Karya?' },
      { id: 'kamera', label: 'Tablet merek apa yang menghasilkan foto paling bagus?' },
      { id: 'murid', label: 'Berapa banyak murid yang akan menyukai aplikasi ini?' },
    ],
    masalahCorrect: 'inti',
    masalahUmpan: {
      inti: 'Tepat! Rekomendasi paket bergantung pada ukuran foto, banyak foto, kapasitas paket, dan harganya — semuanya berbentuk bilangan berpangkat.',
      warna:
        'Warna tema memang penting untuk tampilan, tetapi klien menanyakan PENYIMPANAN. Coba pilih yang lain.',
      kamera: 'Tablet sudah ditentukan klien. Fokuslah pada data yang harus disimpan.',
      murid:
        'Tiket tidak memuat data kesukaan pengguna. Pertanyaan klien adalah kapasitas dan biaya.',
    },
    hipotesisLabel:
      'Tulis hipotesis tim kalian: besaran apa yang harus dihitung lebih dulu, dan sifat pangkat apa yang mungkin dipakai?',
    hipotesisPlaceholder: 'Menurut kami, pertama-tama kita harus menghitung …',
    nextLabel: 'Lanjut: Atur Tim →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENGORGANISASI MURID (PBL sintaks 2)
     ---------------------------------------------------------- */
  organisasi: {
    kicker: 'Tahap 2 · Mengorganisasi Belajar',
    syntax: PBL + ' · Sintaks 2',
    goal: 'Membagi peran tim developer, memilah informasi tiket, dan menyusun rencana penyelesaian.',
    guru: 'Pastikan setiap anggota memegang satu peran dan peran ditukar pada pertemuan berikutnya. Saat pemilahan, minta tim menjelaskan mengapa warna tema dan framework tidak diperlukan. Rencana yang tersusun menjadi peta langkah pada tiga penyelidikan berikutnya.',
    peranLabel: 'Pilih peranmu di tim developer:',
    peran: [
      {
        id: 'po',
        label:
          '🧭 <strong>Product Owner</strong> — menjaga tim tetap menjawab kebutuhan klien dan memimpin diskusi.',
      },
      {
        id: 'analis',
        label:
          '🔎 <strong>Analis Data</strong> — menuliskan setiap besaran dalam bentuk bilangan berpangkat.',
      },
      {
        id: 'engineer',
        label:
          '🧮 <strong>Engineer Hitung</strong> — memilih sifat pangkat yang tepat lalu menghitung.',
      },
      {
        id: 'qa',
        label:
          '🧪 <strong>Penguji (QA)</strong> — memeriksa ulang setiap langkah dan satuan sebelum dilaporkan.',
      },
    ],
    judulPilah: 'Pilah informasi dari tiket klien',
    opsiPilah: [
      { id: 'diketahui', label: 'Diketahui' },
      { id: 'ditanya', label: 'Ditanya' },
      { id: 'tidakPerlu', label: 'Tidak diperlukan' },
    ],
    pilah: [
      {
        id: 'i1',
        teks: 'Foto mentah berukuran 2¹² × 2¹¹ piksel dengan 2² byte per piksel.',
        correct: 'diketahui',
        explanation: 'Data ini dipakai untuk menghitung ukuran satu foto mentah.',
      },
      {
        id: 'i2',
        teks: 'Aplikasi mengompres foto menjadi 2⁻³ kali ukuran mentahnya.',
        correct: 'diketahui',
        explanation: 'Faktor kompresi menentukan ukuran foto yang benar-benar disimpan.',
      },
      {
        id: 'i3',
        teks: 'Paket Stratus berkapasitas (2¹⁰)³ × 2⁸ byte seharga Rp90.000 per bulan.',
        correct: 'diketahui',
        explanation: 'Kapasitas dan harga paket dipakai untuk membandingkan paket.',
      },
      {
        id: 'i4',
        teks: 'Paket mana yang cukup untuk minimal 5 tahun dengan biaya paling hemat?',
        correct: 'ditanya',
        explanation: 'Ini keputusan utama yang diminta klien.',
      },
      {
        id: 'i5',
        teks: 'Berapa lama mengunggah semua foto satu tahun lewat Wi-Fi sekolah?',
        correct: 'ditanya',
        explanation: 'Klien perlu tahu apakah proses unggah mengganggu jaringan sekolah.',
      },
      {
        id: 'i6',
        teks: 'Warna tema aplikasi biru dan kuning sesuai logo sekolah.',
        correct: 'tidakPerlu',
        explanation: 'Warna tema tidak memengaruhi ukuran data maupun kapasitas.',
      },
      {
        id: 'i7',
        teks: 'Aplikasi dibangun dengan framework JavaScript kesukaan tim.',
        correct: 'tidakPerlu',
        explanation: 'Pilihan framework tidak dipakai dalam perhitungan penyimpanan.',
      },
      {
        id: 'i8',
        teks: 'Setiap murid mengunggah 2⁴ foto per tahun.',
        correct: 'diketahui',
        explanation: 'Dipakai untuk menghitung banyak foto per tahun.',
      },
    ],
    judulRencana: 'Susun rencana penyelesaian tim',
    instruksiRencana: 'Ketuk langkah-langkah berikut sesuai urutan yang paling masuk akal.',
    rencana: [
      { id: 'r1', label: '📷 Hitung ukuran satu foto mentah' },
      { id: 'r2', label: '🗜️ Terapkan kompresi 2⁻³' },
      { id: 'r3', label: '🗂️ Hitung kebutuhan penyimpanan per tahun' },
      { id: 'r4', label: '☁️ Hitung lama muat setiap paket' },
      { id: 'r5', label: '📶 Hitung waktu unggah' },
      { id: 'r6', label: '📝 Pilih paket & susun laporan untuk klien' },
    ],
    rencanaSukses:
      '<strong>Rencana tersusun!</strong> Ukuran foto → kompresi → kebutuhan per tahun → lama muat paket → waktu unggah → laporan. Rencana ini kalian jalankan pada tiga penyelidikan berikutnya.',
    nextLabel: 'Mulai Penyelidikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENYELIDIKAN 1: UKURAN SATU FOTO (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikUkuran: {
    kicker: 'Tahap 3 · Penyelidikan 1 — Ukuran Foto',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Memakai sifat perkalian dan pembagian bilangan berpangkat untuk menghitung ukuran satu foto, sebelum dan sesudah dikompresi.',
    guru: 'Minta Engineer Hitung menyebutkan sifat yang dipilih sebelum mengisi eksponen. Pantau miskonsepsi “eksponen dikalikan” (2¹³²) dan “2⁻³ = −8”. Tanyakan: “Mengapa hasilnya lebih kecil setelah dikali 2⁻³?”',
    instruksi:
      'Kerjakan kartu satu per satu. Pada setiap langkah: pilih sifat yang sesuai, isi eksponen hasilnya, lalu (bila diminta) hitung nilainya.',
    kartu: [
      {
        id: 'u1',
        ikon: '📷',
        judul: 'Ukuran satu foto mentah',
        cerita:
          'Foto berukuran 2¹² × 2¹¹ piksel dan setiap piksel memakai 2² byte. Ukuran foto = banyak piksel × byte per piksel.',
        tanya: 'Nyatakan ukuran foto mentah sebagai satu bilangan berpangkat (dalam byte).',
        rantai: {
          a: 2,
          awal: 12,
          langkah: [
            { op: 'kali', n: 11 },
            { op: 'kali', n: 2 },
          ],
        },
        kunci: { k: 25 },
      },
      {
        id: 'u2',
        ikon: '📏',
        judul: 'Ubah ke MiB',
        cerita: '1 MiB = 2²⁰ byte. Untuk mengubah byte ke MiB, bagilah dengan 2²⁰.',
        tanya: 'Berapa MiB ukuran foto mentah itu?',
        rantai: { a: 2, awal: 25, langkah: [{ op: 'bagi', n: 20 }], nilai: true, satuan: 'MiB' },
        kunci: { k: 5, nilai: 32 },
      },
      {
        id: 'u3',
        ikon: '🗜️',
        judul: 'Foto setelah dikompresi',
        cerita:
          'Aplikasi mengompres foto menjadi 2⁻³ kali ukuran mentahnya (2²⁵ byte), lalu hasilnya diubah ke MiB.',
        tanya: 'Berapa MiB ukuran foto yang benar-benar disimpan?',
        rantai: {
          a: 2,
          awal: 25,
          langkah: [
            { op: 'kali', n: -3 },
            { op: 'bagi', n: 20 },
          ],
          nilai: true,
          satuan: 'MiB',
        },
        kunci: { k: 2, nilai: 4 },
      },
    ],
    tanya: [
      {
        id: 'q1',
        tanya: 'Mengapa pada kartu pertama eksponen 12, 11, dan 2 dijumlahkan?',
        opsi: [
          {
            id: 'gabung',
            label:
              'Karena bilangan berpangkat berbasis sama dikalikan, sehingga faktor-faktor 2 digabung',
          },
          { id: 'kali', label: 'Karena pada soal perkalian eksponennya juga dikalikan' },
          { id: 'besar', label: 'Supaya hasilnya lebih besar' },
          { id: 'file', label: 'Karena ukuran file selalu dijumlahkan' },
        ],
        correct: 'gabung',
        umpan: {
          gabung:
            'Tepat! 2¹² × 2¹¹ × 2² berarti 12 + 11 + 2 = 25 faktor 2 yang dikalikan, jadi 2²⁵.',
          kali: 'Kalau eksponen dikalikan, hasilnya 2²⁶⁴ — jauh lebih besar daripada seluruh internet! Coba pilih yang lain.',
          besar:
            'Sifat pangkat tidak dipilih supaya hasil besar, tetapi sesuai operasinya. Coba lagi.',
          file: 'Yang dijumlahkan adalah EKSPONENNYA karena operasinya perkalian berbasis sama. Coba lagi.',
        },
      },
      {
        id: 'q2',
        tanya: 'Kompresi menjadi 2⁻³ kali ukuran mentah artinya …',
        opsi: [
          { id: 'seperdelapan', label: 'ukuran foto menjadi 1/8 ukuran mentah, karena 2⁻³ = 1/2³' },
          { id: 'kurang8', label: 'ukuran foto berkurang 8 byte' },
          { id: 'negatif', label: 'ukuran foto menjadi negatif' },
          { id: 'tiga', label: 'ukuran foto dibagi 3' },
        ],
        correct: 'seperdelapan',
        umpan: {
          seperdelapan: 'Tepat! 32 MiB × 1/8 = 4 MiB, sama dengan 2²⁵ × 2⁻³ = 2²².',
          kurang8:
            'Dikali 2⁻³ bukan dikurangi 8. Ingat a⁻ⁿ = 1/aⁿ, jadi 2⁻³ = 1/8. Coba pilih yang lain.',
          negatif:
            'Eksponen negatif TIDAK membuat bilangan negatif: 2⁻³ = 1/8 masih positif. Coba lagi.',
          tiga: '2⁻³ = 1/2³ = 1/8, bukan 1/3. Coba pilih yang lain.',
        },
      },
    ],
    temuan:
      'Perkalian berbasis sama → eksponen dijumlahkan. Mengubah satuan data berarti membagi dengan 2¹⁰, 2²⁰, atau 2³⁰ → eksponen dikurangkan. Dikali 2⁻³ sama dengan dibagi 2³.',
    nextLabel: 'Lanjut: Penyelidikan Kapasitas →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENYELIDIKAN 2: KEBUTUHAN & KAPASITAS (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikKapasitas: {
    kicker: 'Tahap 4 · Penyelidikan 2 — Kapasitas Paket',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menghitung kebutuhan penyimpanan per tahun dan lama muat setiap paket dengan sifat perkalian, pembagian, dan pangkat dari pangkat.',
    guru: 'Soroti miskonsepsi “(2¹⁰)⁴ = 2¹⁴”. Setelah tabel banding paket muncul, minta Product Owner membacakan paket mana yang memenuhi syarat klien dan mana yang paling hemat.',
    instruksi:
      'Hitung dulu kebutuhan satu tahun, lalu kapasitas dan lama muat setiap paket. Kartu berikutnya terbuka setelah kartu sebelumnya tuntas.',
    kartu: [
      {
        id: 'c1',
        ikon: '👩‍🎓',
        judul: 'Banyak foto per tahun',
        cerita: '2⁹ murid masing-masing mengunggah 2⁴ foto per tahun.',
        tanya: 'Berapa banyak foto yang diunggah dalam satu tahun?',
        rantai: { a: 2, awal: 9, langkah: [{ op: 'kali', n: 4 }], nilai: true, satuan: 'foto' },
        kunci: { k: 13, nilai: 8192 },
      },
      {
        id: 'c2',
        ikon: '🗂️',
        judul: 'Kebutuhan penyimpanan per tahun',
        cerita:
          'Setiap foto yang disimpan berukuran 2²² byte dan ada 2¹³ foto per tahun. 1 GiB = 2³⁰ byte.',
        tanya: 'Berapa GiB kebutuhan penyimpanan satu tahun?',
        rantai: {
          a: 2,
          awal: 22,
          langkah: [
            { op: 'kali', n: 13 },
            { op: 'bagi', n: 30 },
          ],
          nilai: true,
          satuan: 'GiB',
        },
        kunci: { k: 5, nilai: 32 },
      },
      kartuLamaMuat(
        PAKET[0],
        FAKTA.kPerTahun,
        32,
        'Kapasitas Paket Nimbus 1 TiB = (2¹⁰)⁴ byte. Kebutuhan per tahun 2³⁵ byte.'
      ),
      kartuLamaMuat(
        PAKET[1],
        FAKTA.kPerTahun,
        8,
        'Kapasitas Paket Stratus 256 GiB = (2¹⁰)³ × 2⁸ byte. Kebutuhan per tahun 2³⁵ byte.'
      ),
      kartuLamaMuat(
        PAKET[2],
        FAKTA.kPerTahun,
        2,
        'Kapasitas Paket Cirrus 64 GiB = 2⁶ × 2³⁰ byte. Kebutuhan per tahun 2³⁵ byte.'
      ),
    ],
    tabelJudul: '📊 Tabel banding paket',
    tanya: [
      {
        id: 'k1',
        tanya: 'Paket mana yang memenuhi syarat klien (foto tersimpan minimal 5 tahun)?',
        opsi: [
          { id: 'nimbusStratus', label: 'Paket Nimbus dan Paket Stratus' },
          { id: 'semua', label: 'Ketiga paket' },
          { id: 'nimbus', label: 'Hanya Paket Nimbus' },
          { id: 'cirrus', label: 'Hanya Paket Cirrus' },
        ],
        correct: 'nimbusStratus',
        umpan: {
          nimbusStratus: 'Tepat! Nimbus cukup 32 tahun dan Stratus 8 tahun; Cirrus hanya 2 tahun.',
          semua: 'Cirrus hanya cukup 2⁶⁺³⁰⁻³⁵ = 2¹ = 2 tahun, kurang dari 5 tahun. Coba lagi.',
          nimbus: 'Stratus juga cukup: 2³⁸ : 2³⁵ = 2³ = 8 tahun ≥ 5 tahun. Coba lagi.',
          cirrus: 'Cirrus memang termurah, tetapi hanya cukup 2 tahun. Coba lagi.',
        },
      },
      {
        id: 'k2',
        tanya: 'Mengapa (2¹⁰)⁴ sama dengan 2⁴⁰, bukan 2¹⁴?',
        opsi: [
          { id: 'kali', label: 'Karena 2¹⁰ dikalikan sebanyak 4 kali, jadi eksponennya 10 × 4' },
          { id: 'jumlah', label: 'Karena eksponen 10 dan 4 dijumlahkan' },
          { id: 'tulis', label: 'Karena angka 4 ditulis di belakang 10' },
          { id: 'sama', label: '2⁴⁰ dan 2¹⁴ sebenarnya sama saja' },
        ],
        correct: 'kali',
        umpan: {
          kali: 'Tepat! (2¹⁰)⁴ = 2¹⁰ × 2¹⁰ × 2¹⁰ × 2¹⁰ = 2¹⁰⁺¹⁰⁺¹⁰⁺¹⁰ = 2⁴⁰.',
          jumlah:
            'Menjumlahkan eksponen hanya untuk perkalian dua bilangan berpangkat berbasis sama. Coba lagi.',
          tulis:
            'Eksponen bukan disambung sebagai angka. Tuliskan (2¹⁰)⁴ sebagai perkalian berulang.',
          sama: '2¹⁴ = 16.384, sedangkan 2⁴⁰ lebih dari satu triliun. Coba lagi.',
        },
      },
    ],
    temuan:
      'Kebutuhan per tahun 2³⁵ byte (32 GiB). Lama muat = kapasitas : kebutuhan per tahun, jadi eksponennya dikurangkan. Pangkat dari pangkat → eksponen dikalikan.',
    nextLabel: 'Lanjut: Penyelidikan Waktu →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENYELIDIKAN 3: WAKTU UNGGAH (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikWaktu: {
    kicker: 'Tahap 5 · Penyelidikan 3 — Waktu Unggah',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menafsirkan hasil berpangkat negatif dan pangkat nol saat menghitung waktu unggah.',
    guru: 'Minta murid membaca 2⁻¹ detik sebagai “setengah detik”, bukan “−2 detik”. Pada kartu video, tanyakan: “Mengapa hasil bagi bilangan dengan dirinya sendiri sama dengan 1?” untuk memaknai a⁰ = 1.',
    instruksi:
      'Waktu unggah = ukuran data : kecepatan unggah. Wi-Fi sekolah mengunggah 2²³ byte per detik. Tulis nilai pecahan dengan garis miring, mis. 1/4.',
    kartu: [
      {
        id: 'w1',
        ikon: '📶',
        judul: 'Waktu unggah satu foto',
        cerita:
          'Satu foto yang disimpan berukuran 2²² byte, sedangkan kecepatan unggah 2²³ byte per detik.',
        tanya: 'Berapa detik waktu unggah satu foto?',
        rantai: { a: 2, awal: 22, langkah: [{ op: 'bagi', n: 23 }], nilai: true, satuan: 'detik' },
        kunci: { k: -1, nilai: 0.5 },
      },
      {
        id: 'w2',
        ikon: '⏱️',
        judul: 'Waktu unggah foto satu tahun',
        cerita: 'Ada 2¹³ foto per tahun, masing-masing butuh 2⁻¹ detik.',
        tanya: 'Berapa detik waktu unggah semua foto satu tahun?',
        rantai: { a: 2, awal: 13, langkah: [{ op: 'kali', n: -1 }], nilai: true, satuan: 'detik' },
        kunci: { k: 12, nilai: 4096 },
      },
      {
        id: 'w3',
        ikon: '🎬',
        judul: 'Video profil sekolah',
        cerita: 'Klien juga ingin mengunggah video profil berukuran 8 MiB = 2²³ byte.',
        tanya: 'Berapa detik waktu unggah video itu?',
        rantai: { a: 2, awal: 23, langkah: [{ op: 'bagi', n: 23 }], nilai: true, satuan: 'detik' },
        kunci: { k: 0, nilai: 1 },
      },
      {
        id: 'w4',
        ikon: '🐢',
        judul: 'Bagaimana tanpa kompresi?',
        cerita: 'Andaikan foto tidak dikompresi, sehingga ukurannya tetap 2²⁵ byte.',
        tanya: 'Berapa detik waktu unggah satu foto mentah?',
        rantai: { a: 2, awal: 25, langkah: [{ op: 'bagi', n: 23 }], nilai: true, satuan: 'detik' },
        kunci: { k: 2, nilai: 4 },
      },
    ],
    tanya: [
      {
        id: 'q1',
        tanya: 'Waktu 2⁻¹ detik untuk satu foto artinya …',
        opsi: [
          { id: 'setengah', label: 'setengah detik' },
          { id: 'minus2', label: '−2 detik' },
          { id: 'minus1', label: 'terlambat 1 detik' },
          { id: 'dua', label: '2 detik' },
        ],
        correct: 'setengah',
        umpan: {
          setengah: 'Tepat! 2⁻¹ = 1/2¹ = 1/2 detik. Foto lebih kecil daripada data per detik.',
          minus2: 'Waktu tidak mungkin negatif. Ingat a⁻ⁿ = 1/aⁿ. Coba lagi.',
          minus1: 'Eksponen −1 tidak berarti “terlambat”. 2⁻¹ = 1/2. Coba lagi.',
          dua: 'Itu kebalikannya. 2¹ = 2, sedangkan 2⁻¹ = 1/2. Coba lagi.',
        },
      },
      {
        id: 'q2',
        tanya: '2²³ : 2²³ = 2⁰ = 1 detik. Mengapa 2⁰ bernilai 1?',
        opsi: [
          { id: 'sama', label: 'Karena bilangan (≠ 0) yang dibagi dirinya sendiri hasilnya 1' },
          { id: 'nol', label: 'Seharusnya 0, karena eksponennya 0' },
          { id: 'dua', label: 'Seharusnya 2, karena basisnya 2' },
          { id: 'kebetulan', label: 'Hanya kebetulan untuk basis 2' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Tepat! Ukuran video sama dengan data per detik, jadi tepat 1 detik: a⁰ = 1 untuk a ≠ 0.',
          nol: 'Kalau 0 detik, video terunggah tanpa waktu — tidak masuk akal. Coba lagi.',
          dua: '2 = 2¹, bukan 2⁰. Coba lagi.',
          kebetulan: 'Berlaku untuk semua basis a ≠ 0: aⁿ : aⁿ = aⁿ⁻ⁿ = a⁰ = 1. Coba lagi.',
        },
      },
      {
        id: 'q3',
        tanya: '4.096 detik untuk unggah foto satu tahun kira-kira sama dengan …',
        opsi: [
          { id: 'jam', label: 'sekitar 68 menit, sedikit lebih dari 1 jam' },
          { id: 'menit', label: 'sekitar 41 menit' },
          { id: 'hari', label: 'sekitar 4 hari' },
          { id: 'empat', label: 'sekitar 4 menit' },
        ],
        correct: 'jam',
        umpan: {
          jam: 'Tepat! 4.096 : 60 ≈ 68 menit. Unggahan bisa dijadwalkan sepulang sekolah.',
          menit: '1 menit = 60 detik, bukan 100 detik. Coba lagi.',
          hari: '1 hari = 86.400 detik, jauh lebih besar. Coba lagi.',
          empat: '4 menit hanya 240 detik. Coba lagi.',
        },
      },
    ],
    temuan:
      'Hasil berpangkat negatif menyatakan pecahan: 2⁻¹ = 1/2. Pembagian dua bilangan berpangkat yang sama menghasilkan pangkat nol: aⁿ : aⁿ = a⁰ = 1. Tanpa kompresi, unggah satu foto butuh 4 detik, 8 kali lebih lama.',
    nextLabel: 'Lanjut: Susun Karya →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGEMBANGKAN & MENYAJIKAN KARYA (PBL sintaks 4)
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 6 · Menyajikan Karya',
    syntax: PBL + ' · Sintaks 4',
    goal: 'Mengambil keputusan paket berdasarkan perhitungan berpangkat, lalu menyusun dan menyajikan Laporan Rekomendasi untuk klien.',
    guru: 'Minta setiap tim mempresentasikan Laporan Rekomendasi (1–2 menit) seperti demo kepada klien. Tim lain memberi satu pujian dan satu pertanyaan. Tekankan bahwa setiap keputusan harus didukung hasil hitung, termasuk syarat kompresi.',
    instruksi:
      'Gunakan tabel banding paket untuk mengambil keputusan, lalu jawab pertanyaan lanjutan dari klien.',
    tanya: [
      {
        id: 'p1',
        tanya: 'Paket mana yang paling tepat direkomendasikan kepada klien?',
        opsi: [
          {
            id: 'stratus',
            label:
              'Paket Stratus: cukup 8 tahun (≥ 5 tahun) dan termurah di antara paket yang memenuhi',
          },
          { id: 'nimbus', label: 'Paket Nimbus: kapasitasnya terbesar, pasti terbaik' },
          { id: 'cirrus', label: 'Paket Cirrus: harganya paling murah' },
          { id: 'sama', label: 'Ketiganya sama saja' },
        ],
        correct: 'stratus',
        umpan: {
          stratus:
            'Tepat! Keputusan didukung hasil hitung: memenuhi syarat dan hemat Rp210.000 per bulan dibanding Nimbus.',
          nimbus:
            'Nimbus memang cukup 32 tahun, tetapi klien meminta biaya sehemat mungkin. Coba pilih yang lain.',
          cirrus: 'Cirrus hanya cukup 2 tahun, kurang dari syarat 5 tahun. Coba pilih yang lain.',
          sama: 'Lama muat dan harganya berbeda jauh. Lihat lagi tabel banding paket.',
        },
      },
      {
        id: 'p2',
        tanya:
          'Klien bertanya: “Bagaimana kalau kompresi dimatikan?” Kebutuhan per tahun menjadi 2²⁵ × 2¹³ = 2³⁸ byte. Paket Stratus (2³⁸ byte) cukup untuk berapa lama?',
        opsi: [
          { id: 'satu', label: '2³⁸ : 2³⁸ = 2⁰ = 1 tahun, jadi kompresi WAJIB tetap aktif' },
          { id: 'nol', label: '2³⁸ : 2³⁸ = 2⁰ = 0 tahun, tidak cukup sama sekali' },
          { id: 'delapan', label: 'Tetap 8 tahun, karena kapasitasnya tidak berubah' },
          { id: 'enamEmpat', label: '2³⁸ : 2³⁸ = 2⁶ = 64 tahun' },
        ],
        correct: 'satu',
        umpan: {
          satu: 'Tepat! Tanpa kompresi, Stratus penuh dalam 1 tahun. Rekomendasi Stratus berlaku DENGAN syarat kompresi aktif.',
          nol: 'Eksponen 0 bukan nilai 0: 2⁰ = 1. Coba pilih yang lain.',
          delapan: 'Kebutuhan per tahun naik 2³ kali lipat, jadi lama muat turun. Coba lagi.',
          enamEmpat: '38 − 38 = 0, bukan 6. Coba pilih yang lain.',
        },
      },
    ],
    laporanJudul: 'Laporan Rekomendasi Penyimpanan Galeri Karya',
    laporanSub: 'Disusun oleh tim developer untuk Bu Rina',
    presentasiLabel:
      'Tulis kalimat presentasi tim kalian untuk klien (keputusan + alasan berdasarkan hitungan berpangkat).',
    presentasiPlaceholder:
      'Kami merekomendasikan Paket … karena kebutuhan per tahun 2³⁵ byte, sehingga … Syaratnya …',
    penutup:
      'Semua angka dihitung dengan sifat-sifat bilangan berpangkat bulat: aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ : aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐˣⁿ, a⁻ⁿ = 1/aⁿ, dan a⁰ = 1.',
    nextLabel: 'Lanjut: Evaluasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENGANALISIS & MENGEVALUASI (PBL sintaks 5)
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 7 · Analisis & Evaluasi',
    syntax: PBL + ' · Sintaks 5',
    goal: 'Mengevaluasi proses penyelesaian masalah: memeriksa lembar kerja tim lain dan merefleksikan strategi sendiri.',
    guru: 'Bahas bersama langkah-langkah yang keliru pada lembar kerja Tim Debug. Minta tim membandingkan hipotesis awal dengan hasil penyelidikan dan menuliskan satu hal yang akan mereka lakukan berbeda.',
    lembarJudul: '📝 Lembar kerja Tim Debug',
    instruksiLembar:
      'Tim Debug menyelesaikan masalah yang sama. Periksa setiap langkah mereka: benar atau keliru?',
    opsiNilai: [
      { id: 'benar', label: '✓ Benar' },
      { id: 'keliru', label: '✗ Keliru' },
    ],
    langkah: [
      {
        id: 'e1',
        teks: 'Banyak piksel = 2¹² × 2¹¹ = 2¹³².',
        correct: 'keliru',
        explanation: 'Perkalian berbasis sama → eksponen DIJUMLAHKAN: 2¹²⁺¹¹ = 2²³.',
      },
      {
        id: 'e2',
        teks: 'Ukuran foto mentah = 2²³ × 2² = 2²⁵ byte = 32 MiB.',
        correct: 'benar',
        explanation: '23 + 2 = 25, dan 2²⁵ : 2²⁰ = 2⁵ = 32 MiB.',
      },
      {
        id: 'e3',
        teks: '2⁻³ = −8, jadi foto terkompresi berukuran 2²⁵ − 8 byte.',
        correct: 'keliru',
        explanation: '2⁻³ = 1/8, dan kompresi berarti DIKALI: 2²⁵ × 2⁻³ = 2²² byte.',
      },
      {
        id: 'e4',
        teks: 'Kebutuhan per tahun = 2²² × 2¹³ = 2³⁵ byte.',
        correct: 'benar',
        explanation: '22 + 13 = 35.',
      },
      {
        id: 'e5',
        teks: 'Paket Nimbus 1 TiB = (2¹⁰)⁴ = 2¹⁴ byte.',
        correct: 'keliru',
        explanation: 'Pangkat dari pangkat → eksponen DIKALIKAN: 2¹⁰ˣ⁴ = 2⁴⁰.',
      },
      {
        id: 'e6',
        teks: 'Lama muat Paket Stratus = 2³⁸ : 2³⁵ = 2³ = 8 tahun.',
        correct: 'benar',
        explanation: 'Pembagian berbasis sama → 38 − 35 = 3, dan 2³ = 8.',
      },
      {
        id: 'e7',
        teks: 'Waktu unggah satu foto = 2²² : 2²³ = 2⁻¹ = −2 detik.',
        correct: 'keliru',
        explanation: 'Eksponennya benar (−1), tetapi 2⁻¹ = 1/2 detik, bukan −2.',
      },
      {
        id: 'e8',
        teks: 'Tanpa kompresi, Stratus cukup 2³⁸ : 2³⁸ = 2⁰ = 0 tahun.',
        correct: 'keliru',
        explanation: 'a⁰ = 1, jadi Stratus masih cukup 1 tahun, bukan 0 tahun.',
      },
    ],
    tanya: [
      {
        id: 'v1',
        tanya: 'Pelajaran terpenting dari lembar kerja Tim Debug adalah …',
        opsi: [
          {
            id: 'sifat',
            label:
              'Pilih sifat sesuai operasinya, lalu ingat a⁻ⁿ = 1/aⁿ dan a⁰ = 1 saat menafsirkan hasil',
          },
          { id: 'kali', label: 'Eksponen sebaiknya selalu dikalikan agar cepat' },
          { id: 'negatif', label: 'Pangkat negatif selalu menghasilkan bilangan negatif' },
          { id: 'kalkulator', label: 'Bentuk pangkat tidak perlu, cukup pakai kalkulator' },
        ],
        correct: 'sifat',
        umpan: {
          sifat:
            'Tepat! Kekeliruan Tim Debug berasal dari salah memilih sifat dan salah menafsirkan a⁻ⁿ serta a⁰.',
          kali: 'Justru kekeliruan pertama Tim Debug terjadi karena mengalikan eksponen. Coba pilih yang lain.',
          negatif: '2⁻¹ = 1/2 bernilai positif. Coba pilih yang lain.',
          kalkulator:
            'Bentuk pangkat membuat hitungan 2³⁸ : 2³⁵ cukup dengan 38 − 35, tanpa angka raksasa. Coba lagi.',
        },
      },
    ],
    dugaanJudul: 'Bandingkan dengan dugaan awal tim kalian',
    tanggapanDugaan: {
      d1: {
        nimbus:
          'Kalian menduga Nimbus. Nimbus memang cukup 32 tahun, tetapi Stratus juga memenuhi (8 tahun) dan jauh lebih hemat.',
        stratus:
          'Dugaan kalian tepat! Stratus cukup 8 tahun dan termurah di antara paket yang memenuhi.',
        cirrus:
          'Kalian menduga Cirrus. Ternyata Cirrus hanya cukup 2 tahun, kurang dari syarat 5 tahun.',
        ragu: 'Sikap yang baik: kalian menunda kesimpulan sampai menghitung. Hasilnya, Stratus paling tepat.',
      },
      d2: {
        seperdelapan: 'Dugaan kalian tepat! 2⁻³ = 1/8, jadi foto 32 MiB menjadi 4 MiB.',
        kurang8:
          'Kalian menduga berkurang 8 byte. Ternyata dikali 2⁻³ = 1/8, jadi 32 MiB menjadi 4 MiB.',
        negatif:
          'Kalian menduga menjadi negatif. Ternyata pangkat negatif menyatakan kebalikan: 2⁻³ = 1/8, tetap positif.',
        tiga: 'Kalian menduga dibagi 3. Ternyata 2⁻³ = 1/2³ = 1/8, jadi ukurannya dibagi 8.',
      },
    },
    refleksiLabel:
      'Tulis evaluasi proses tim kalian: langkah mana yang paling sulit, dan apa yang akan kalian lakukan berbeda lain kali?',
    refleksiPlaceholder: 'Langkah yang paling sulit adalah … Lain kali kami akan …',
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     cek = { a, op, m, n } langkah sifat terakhir (diagnosaNilaiPangkat).
     Opsi pilihan dari opsiEksponenSoal (engine seksi 49) sudah memuat
     pengecoh miskonsepsi; urutannya diacak app.js.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: PBL + ' · Penerapan',
    goal: 'Menggunakan sifat-sifat bilangan berpangkat bulat untuk menyelesaikan masalah kontekstual lain di dunia perangkat lunak.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang banyak salah (eksponen dikalikan, pangkat negatif dibaca negatif, a⁰ dibaca 0) untuk dibahas bersama.',
    instruksi:
      'Kerjakan setiap soal. Tulis dulu besarannya sebagai bilangan berpangkat, pilih sifat yang tepat, lalu hitung. Bila ragu, buka petunjuk.',
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: '🖼️ Ikon aplikasi',
        cerita:
          'Ikon aplikasi berukuran 2⁶ × 2⁶ = 2¹² piksel. Setiap piksel disimpan dalam 2² byte.',
        pertanyaan: 'Berapa byte ukuran ikon itu?',
        cek: { a: 2, op: 'kali', m: 12, n: 2 },
        jawab: 16384,
        satuan: 'byte',
        hints: ['Ukuran = 2¹² × 2². Basisnya sama dan dikalikan.', '2¹² × 2² = 2¹⁴. Hitung 2¹⁴.'],
        explanation: '2¹² × 2² = 2¹²⁺² = 2¹⁴ = 16.384 byte (16 KiB).',
      },
      {
        id: 't2',
        type: 'choice',
        konteks: '⚡ Kecepatan prosesor',
        cerita:
          'Prosesor menjalankan satu instruksi dalam 10⁻⁹ detik. Program pengolah data menjalankan 10¹² instruksi.',
        pertanyaan: 'Berapa lama program itu berjalan?',
        cek: { a: 10, op: 'kali', m: 12, n: -9 },
        options: opsiEksponenSoal(10, 'kali', 12, -9, 'detik'),
        correct: 'benar',
        hints: ['Waktu = banyak instruksi × waktu per instruksi = 10¹² × 10⁻⁹.'],
        explanation: '10¹² × 10⁻⁹ = 10¹²⁺⁽⁻⁹⁾ = 10³ detik = 1.000 detik (± 17 menit).',
      },
      {
        id: 't3',
        type: 'input',
        konteks: '💾 Flashdisk tutorial',
        cerita:
          'Flashdisk berkapasitas 64 GiB = 2³⁶ byte. Setiap video tutorial pemrograman berukuran 1 GiB = 2³⁰ byte.',
        pertanyaan: 'Berapa banyak video yang muat di flashdisk itu?',
        cek: { a: 2, op: 'bagi', m: 36, n: 30 },
        jawab: 64,
        satuan: 'video',
        hints: ['Banyak video = 2³⁶ : 2³⁰.', '36 − 30 = 6. Hitung 2⁶.'],
        explanation: '2³⁶ : 2³⁰ = 2³⁶⁻³⁰ = 2⁶ = 64 video.',
      },
      {
        id: 't4',
        type: 'choice',
        konteks: '🔐 Kekuatan kata sandi',
        cerita:
          'Kata sandi aplikasi terdiri atas 8 karakter. Setiap karakter dipilih dari 64 = 2⁶ simbol, sehingga banyak kemungkinan kata sandi = (2⁶)⁸.',
        pertanyaan: 'Berapa banyak kemungkinan kata sandi dalam bentuk pangkat?',
        cek: { a: 2, op: 'pangkat', m: 6, n: 8 },
        options: opsiEksponenSoal(2, 'pangkat', 6, 8, 'kemungkinan'),
        correct: 'benar',
        hints: [
          '(2⁶)⁸ berarti 2⁶ dikalikan sebanyak 8 kali.',
          'Pangkat dari pangkat → eksponen dikalikan.',
        ],
        explanation: '(2⁶)⁸ = 2⁶ˣ⁸ = 2⁴⁸ kemungkinan (lebih dari 281 triliun).',
      },
      {
        id: 't5',
        type: 'input',
        konteks: '🎮 Pembaruan game',
        cerita:
          'Pembaruan game berukuran 2³¹ byte (2 GiB). Internet rumah mengunduh 2³¹ byte setiap menit.',
        pertanyaan: 'Berapa menit lama unduhnya?',
        cek: { a: 2, op: 'bagi', m: 31, n: 31 },
        jawab: 1,
        satuan: 'menit',
        hints: ['Lama unduh = 2³¹ : 2³¹.', '31 − 31 = 0. Berapa nilai 2⁰?'],
        explanation: '2³¹ : 2³¹ = 2⁰ = 1 menit.',
      },
      {
        id: 't6',
        type: 'choice',
        konteks: '📡 Sensor IoT kebun',
        cerita:
          'Sensor kelembapan di kebun sekolah mengirim paket data 2⁶ byte melalui jaringan berkecepatan 2¹⁰ byte per detik.',
        pertanyaan: 'Berapa detik waktu kirim satu paket data?',
        cek: { a: 2, op: 'bagi', m: 6, n: 10 },
        options: [
          { id: 'benar', label: '2⁻⁴ detik = 1/16 detik' },
          { id: 'tanda', label: '2⁴ detik = 16 detik' },
          { id: 'negatif', label: '−16 detik' },
          { id: 'jumlah', label: '2¹⁶ detik' },
        ],
        correct: 'benar',
        hints: [
          'Waktu = 2⁶ : 2¹⁰. Eksponen yang dibagi dikurangi eksponen pembagi.',
          '2⁻⁴ = 1/2⁴.',
        ],
        explanation: '2⁶ : 2¹⁰ = 2⁶⁻¹⁰ = 2⁻⁴ = 1/16 detik.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: '📈 Pengguna aplikasi kantin',
        cerita:
          'Aplikasi kantin digital awalnya dipakai 2⁵ orang. Setiap tahun penggunanya menjadi 2³ kali lipat, sehingga setelah 2 tahun banyak pengguna = 2⁵ × (2³)².',
        pertanyaan: 'Berapa banyak pengguna setelah 2 tahun?',
        rantai: {
          a: 2,
          awal: 3,
          langkah: [
            { op: 'pangkat', n: 2 },
            { op: 'kali', n: 5 },
          ],
        },
        cek: { a: 2, op: 'kali', m: 5, n: 6 },
        jawab: 2048,
        satuan: 'pengguna',
        hints: ['Sederhanakan dulu (2³)² = 2⁶.', 'Lalu 2⁵ × 2⁶ = 2¹¹. Hitung 2¹¹.'],
        explanation: '(2³)² = 2⁶, lalu 2⁵ × 2⁶ = 2¹¹ = 2.048 pengguna.',
      },
      {
        id: 't8',
        type: 'choice',
        konteks: '🗄️ Basis data terdistribusi',
        cerita: 'Basis data berisi 10⁹ baris dibagi sama rata ke 10³ server.',
        pertanyaan: 'Berapa baris yang disimpan setiap server?',
        cek: { a: 10, op: 'bagi', m: 9, n: 3 },
        options: opsiEksponenSoal(10, 'bagi', 9, 3, 'baris'),
        correct: 'benar',
        hints: ['Banyak baris per server = 10⁹ : 10³.'],
        explanation: '10⁹ : 10³ = 10⁹⁻³ = 10⁶ baris = 1.000.000 baris per server.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: PBL + ' · Refleksi',
    goal: 'Merefleksikan proses menyelesaikan masalah kontekstual dengan sifat-sifat bilangan berpangkat bulat.',
    guru: 'Baca beberapa refleksi murid (dengan izin) untuk menutup pelajaran. Tanyakan: “Apa yang kalian periksa lebih dulu sebelum menjumlahkan, mengurangkan, atau mengalikan eksponen?”',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Bagaimana kamu menentukan sifat mana yang dipakai: eksponen dijumlahkan, dikurangkan, atau dikalikan?',
        placeholder: 'Aku melihat operasinya dulu: kalau …',
      },
      {
        id: 'q2',
        teks: 'Apa arti hasil 2⁻¹ detik dan 2⁰ tahun dalam masalah Galeri Karya?',
        placeholder: '2⁻¹ detik artinya … sedangkan 2⁰ tahun artinya …',
      },
      {
        id: 'q3',
        teks: 'Masalah lain di dunia perangkat lunak apa yang bisa diselesaikan dengan sifat-sifat bilangan berpangkat?',
        placeholder: 'Misalnya saat menghitung …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu memakai sifat-sifat bilangan berpangkat untuk masalah nyata sekarang?',
    diriOpsi: [
      { id: 'yakin', label: '😄 Sangat yakin, aku bisa menjelaskannya ke teman' },
      { id: 'cukup', label: '🙂 Cukup yakin, kadang masih perlu melihat catatan' },
      { id: 'ragu', label: '🤔 Masih ragu, aku perlu berlatih lagi' },
      { id: 'bingung', label: '😟 Masih bingung, aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai ✓',
  },

  /* ----------------------------------------------------------
     SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Galeri Karya siap dirilis!',
    teks: 'Rekomendasi tim kalian menjawab kebutuhan klien dengan hitungan berpangkat yang tepat: kapasitas cukup, biaya hemat, dan waktu unggah terukur.',
    capaian: [
      'Menyatakan ukuran file, kapasitas, dan waktu dalam bentuk bilangan berpangkat.',
      'Memilih sifat perkalian, pembagian, atau pangkat dari pangkat sesuai operasinya.',
      'Menafsirkan hasil berpangkat negatif (2⁻¹ = 1/2) dan pangkat nol (2⁰ = 1) dalam konteks.',
      'Membandingkan paket, mengambil keputusan, dan menyajikan laporan untuk klien.',
    ],
  },
};
