'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membaca, Menuliskan & Membandingkan Notasi Ilmiah
   Fase D — SMP Kelas VIII · Topik 12 Bilangan Berpangkat dan Bentuk Akar

   Tujuan Pembelajaran:
   Membaca, menuliskan, dan membandingkan bilangan dalam notasi ilmiah.

   Prasyarat: fase-d/mpi-12.1 & 12.2 (bilangan berpangkat bulat,
   termasuk pangkat nol dan negatif) dan fase-d/mpi-1.5 (desimal).

   Notasi di berkas ini (lihat engine seksi 53):
     • setiap bilangan ditulis sn(m, e) = m × 10ᵉ dengan mantisa m
       berupa STRING berkoma ('4,5', '12,7') agar perbandingan EKSAK;
     • data boleh ditulis dalam bentuk tidak baku (sn('12,7', 6)) atau
       bentuk panjang (bentuk: 'panjang' → ditampilkan '0,000008');
     • **teks** ditebalkan; teks tidak memuat HTML sehingga lambang
       < dan > ditulis apa adanya.

   Model pembelajaran: PROBLEM BASED LEARNING (PBL).
   Masalah pemantik: "Papan Info Semesta Mini" untuk Pameran Sains
   kelas VIII. Kelompok menerima catatan data dari buku dan internet
   yang bentuknya campur aduk:
     • bentuk panjang — jarak Bumi–Bulan 384.000.000 m, sel darah merah
       0,000008 m;
     • notasi ilmiah — jarak Bumi–Matahari 1,5 × 10¹¹ m, massa elektron
       9,11 × 10⁻³¹ kg, massa proton 1,67 × 10⁻²⁷ kg;
     • tidak baku — diameter Bumi 12,7 × 10⁶ m, virus 0,12 × 10⁻⁶ m,
       jarak Mars–Matahari 228 × 10⁹ m.
   Konflik kognitif: "elektron lebih berat karena 9,11 > 1,67",
   "10⁻⁹ > 10⁻⁷ karena 9 > 7", "12,7 × 10⁶ sudah notasi ilmiah", dan
   "384.000.000 = 3,84 × 10⁶ karena ada 6 angka nol". Kelompok harus
   membaca, membakukan, lalu membandingkan untuk menyusun papan.

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ....... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar . 'organisasi'
     Sintaks 3 — Membimbing penyelidikan ............ 'selidikBaca',
                                                      'selidikTulis',
                                                      'selidikBanding'
     Sintaks 4 — Mengembangkan & menyajikan karya ... 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi ........ 'evaluasi'
     Penerapan & penutup ............................ 'terapkan', 'refleksi',
                                                      'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — murid menulis dugaan & hipotesis,
       memilah informasi, menyusun rencana sendiri, lalu menguji
       dugaannya dan merefleksikan strateginya.
     • Bermakna (meaningful) — semua bilangan berasal dari data sains
       nyata (atom, sel, planet); notasi ilmiah dipakai karena bentuk
       panjangnya sulit dibaca dan dibandingkan.
     • Menggembirakan (joyful) — Lab Geser Koma, Pita Orde 10ⁿ yang
       bisa diketuk, umpan balik yang menunjuk letak kekeliruan, dan
       Papan Info Semesta Mini yang dipresentasikan.

   Rangkaian aktivitas (± 2 × 40 menit; kelompok 3–4 murid):
     1. Orientasi     (8')  — cerita, kartu catatan data, dugaan awal
                              (tidak dinilai), pertanyaan inti, hipotesis.
     2. Organisasi    (6')  — memilih peran, memilah informasi, dan
                              mengurutkan rencana penyelidikan.
     3. Selidik A     (10') — Lab Geser Koma: geser koma sampai mantisa
                              di antara 1 dan 10, amati pangkatnya;
                              pertanyaan penuntun; membaca notasi ilmiah.
     4. Selidik B     (10') — memilah baku/tidak baku, bentuk panjang →
                              notasi ilmiah, membakukan, notasi ilmiah →
                              bentuk panjang (opsi berdiagnosa).
     5. Selidik C     (12') — pasangan data: lambang <, >, = berdiagnosa
                              + makna konteks; Pita Orde 10ⁿ dunia mikro;
                              memilih strategi.
     6. Karya         (12') — mengurutkan dunia mikro & dunia raksasa,
                              memperkirakan "berapa kali lipat", memilih
                              alasan, menulis pesan → Papan Info.
     7. Evaluasi      (8')  — menilai pendapat teman, dugaan vs hasil,
                              menyusun simpulan dari bank kalimat.
     8. Uji terap     (10') — 8 soal acak dari bank 16 soal.
     9. Refleksi      (4')  — rekap capaian, refleksi tertulis, keyakinan.

   Catatan pengacakan: SEMUA daftar pilihan di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di urutan pertama), begitu pula
   opsi berdiagnosa buatan engine (opsiTulisIlmiah, opsiBakukanIlmiah,
   opsiPanjangIlmiah, opsiBacaIlmiah, opsiMaknaBandingIlmiah,
   COMPARE_SYMBOLS). app.js mengacaknya SEKALI saat state disiapkan
   (ensureShuffledOrder / ensureSortStates / ensureTapOrderState /
   shuffleArray dari shared/engine.js) dan menyimpannya di State,
   sehingga tiap murid dan tiap Reset mendapat urutan berbeda.

   Konsistensi kunci jawaban diuji tests/mpi-12.6-data.test.js terhadap
   engine seksi 53.
   ============================================================ */

var PBL = 'Problem Based Learning';

/* Bilangan m × 10ᵉ (mantisa string berkoma). */
function sn(m, e) {
  return { m: m, e: e };
}

var DATA = {
  meta: {
    title: 'Membaca, Menuliskan & Membandingkan Notasi Ilmiah',
    goal: 'Membaca, menuliskan, dan membandingkan bilangan dalam notasi ilmiah.',
  },

  /* Urutan & label tahap (dipakai app.js dan dicek terhadap manifest). */
  tahap: [
    { id: 'orientasi', label: 'Masalah' },
    { id: 'organisasi', label: 'Organisasi' },
    { id: 'selidikBaca', label: 'Geser Koma' },
    { id: 'selidikTulis', label: 'Tulis Baku' },
    { id: 'selidikBanding', label: 'Bandingkan' },
    { id: 'karya', label: 'Karya' },
    { id: 'evaluasi', label: 'Evaluasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /*
   * Data masalah pemantik — dipakai di beberapa tahap.
   * bentuk: 'panjang' → ditampilkan sebagai bentuk panjang (0,000008);
   * selain itu ditampilkan persis sebagai m × 10ᵉ (boleh tidak baku).
   */
  benda: [
    /* Dunia raksasa (meter) */
    {
      id: 'bulan',
      ikon: '🌙',
      nama: 'Jarak Bumi–Bulan',
      x: sn('3,84', 8),
      bentuk: 'panjang',
      satuan: 'm',
    },
    { id: 'matahari', ikon: '☀️', nama: 'Jarak Bumi–Matahari', x: sn('1,5', 11), satuan: 'm' },
    { id: 'bumi', ikon: '🌍', nama: 'Diameter Bumi', x: sn('12,7', 6), satuan: 'm' },
    { id: 'mars', ikon: '🔴', nama: 'Jarak Mars–Matahari', x: sn('228', 9), satuan: 'm' },
    { id: 'dMatahari', ikon: '🌞', nama: 'Diameter Matahari', x: sn('1,39', 9), satuan: 'm' },
    /* Dunia mikro (meter) */
    {
      id: 'pasir',
      ikon: '🏖️',
      nama: 'Butir pasir halus',
      x: sn('2', -4),
      bentuk: 'panjang',
      satuan: 'm',
    },
    { id: 'rambut', ikon: '💇', nama: 'Tebal rambut', x: sn('8', -5), satuan: 'm' },
    {
      id: 'darah',
      ikon: '🩸',
      nama: 'Sel darah merah',
      x: sn('8', -6),
      bentuk: 'panjang',
      satuan: 'm',
    },
    {
      id: 'bakteri',
      ikon: '🦠',
      nama: 'Bakteri E. coli',
      x: sn('2', -6),
      bentuk: 'panjang',
      satuan: 'm',
    },
    { id: 'virus', ikon: '🧫', nama: 'Virus corona', x: sn('0,12', -6), satuan: 'm' },
    { id: 'dna', ikon: '🧬', nama: 'Lebar untai DNA', x: sn('2', -9), satuan: 'm' },
    { id: 'atom', ikon: '⚛️', nama: 'Atom hidrogen', x: sn('1,06', -10), satuan: 'm' },
    /* Massa (kilogram) */
    { id: 'mBumi', ikon: '🌏', nama: 'Massa Bumi', x: sn('5,97', 24), satuan: 'kg' },
    { id: 'proton', ikon: '🔵', nama: 'Massa proton', x: sn('1,67', -27), satuan: 'kg' },
    { id: 'elektron', ikon: '⚪', nama: 'Massa elektron', x: sn('9,11', -31), satuan: 'kg' },
  ],

  /* ---------- Sintaks 1: orientasi pada masalah ---------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi Masalah',
    goal: 'Memahami masalah Papan Info Semesta Mini dan menduga cara membaca, menulis, serta membandingkan bilangan yang sangat besar dan sangat kecil.',
    syntax: PBL + ' · Sintaks 1',
    guru: 'Bacakan kisahnya dengan antusias, lalu tunjukkan kartu catatan data. Tanyakan: "Coba bacakan 0,000008 dengan cepat! Mudah tidak?" Minta murid menduga sendiri lebih dulu (tidak dinilai). Banyak murid akan menjawab elektron lebih berat karena 9,11 > 1,67 — jangan dikoreksi; dugaan akan diuji pada penyelidikan.',
    judul: 'Papan Info Semesta Mini',
    pengantar:
      'Kelas VIII akan membuat Papan Info Semesta Mini untuk Pameran Sains: benda-benda dari yang paling kecil (atom, DNA, virus) sampai yang paling besar (planet dan jarak ke Matahari). Kelompokmu menerima catatan data dari buku dan internet — tetapi bentuk bilangannya campur aduk. Ada yang ditulis panjang, ada yang memakai notasi ilmiah, ada pula yang ditulis tidak baku.',
    catatan: [
      {
        id: 'raksasa',
        ikon: '🪐',
        judul: 'Dunia Raksasa',
        teks: 'Jarak dan ukuran benda langit, dalam meter.',
        benda: ['bulan', 'matahari', 'bumi', 'mars'],
      },
      {
        id: 'mikro',
        ikon: '🔬',
        judul: 'Dunia Mikro',
        teks: 'Ukuran benda yang sangat kecil, dalam meter.',
        benda: ['darah', 'bakteri', 'virus', 'dna'],
      },
      {
        id: 'massa',
        ikon: '⚖️',
        judul: 'Massa',
        teks: 'Massa benda, dalam kilogram.',
        benda: ['mBumi', 'proton', 'elektron'],
      },
    ],
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Membaca, menuliskan, dan membandingkan bilangan dalam notasi ilmiah.',
    kriteria: [
      'Membaca bilangan dalam notasi ilmiah a × 10ⁿ dengan tepat, termasuk pangkat negatif.',
      'Menuliskan bilangan yang sangat besar atau sangat kecil dalam notasi ilmiah baku (1 ≤ a < 10), dan sebaliknya.',
      'Membakukan notasi ilmiah yang belum baku, misalnya 12,7 × 10⁶ = 1,27 × 10⁷.',
      'Membandingkan dan mengurutkan bilangan dalam notasi ilmiah: bandingkan pangkat 10 lebih dulu, lalu mantisanya.',
    ],
    dugaan: [
      {
        id: 'massa',
        tanya:
          'Mana yang lebih berat: **elektron** (9,11 × 10⁻³¹ kg) atau **proton** (1,67 × 10⁻²⁷ kg)?',
        cek: { p: sn('9,11', -31), q: sn('1,67', -27) },
        opsi: [
          { id: 'proton', label: 'Proton lebih berat' },
          { id: 'elektron', label: 'Elektron lebih berat' },
          { id: 'sama', label: 'Keduanya sama berat' },
        ],
        baku: 'proton',
        pembahasan:
          'Bandingkan pangkat 10-nya dulu: −27 > −31, jadi 1,67 × 10⁻²⁷ > 9,11 × 10⁻³¹. Proton kira-kira 1.800 kali lebih berat!',
      },
      {
        id: 'tulis',
        tanya: 'Diameter sel darah merah **0,000008 m**. Dalam notasi ilmiah ditulis …',
        cek: { desimal: '0,000008' },
        opsi: [
          { id: 'tepat', label: '8 × 10⁻⁶' },
          { id: 'nol', label: '8 × 10⁻⁵' },
          { id: 'arah', label: '8 × 10⁶' },
        ],
        baku: 'tepat',
        pembahasan:
          'Koma digeser 6 kali ke kanan sampai mantisanya 8, jadi 0,000008 = 8 × 10⁻⁶ (bukan 10⁻⁵ walaupun nolnya lima).',
      },
      {
        id: 'baku',
        tanya: 'Diameter Bumi ditulis **12,7 × 10⁶ m**. Apakah itu sudah notasi ilmiah baku?',
        cek: { x: sn('12,7', 6) },
        opsi: [
          { id: 'belum7', label: 'Belum; bentuk bakunya 1,27 × 10⁷' },
          { id: 'sudah', label: 'Sudah baku' },
          { id: 'belum5', label: 'Belum; bentuk bakunya 1,27 × 10⁵' },
        ],
        baku: 'belum7',
        pembahasan:
          'Mantisa 12,7 tidak di antara 1 dan 10. Koma digeser 1 kali ke kiri (12,7 → 1,27), jadi pangkatnya bertambah 1: 1,27 × 10⁷.',
      },
    ],
    alasanLabel: 'Bagaimana caramu menduga? Tulis alasanmu dengan singkat.',
    alasanPlaceholder: 'Contoh: Menurutku … karena …',
    pertanyaan: 'Apa masalah yang harus diselesaikan kelompokmu?',
    masalahOpsi: [
      {
        id: 'inti',
        label:
          'Menuliskan semua data dalam notasi ilmiah baku, membacanya dengan benar, lalu membandingkan dan mengurutkannya untuk Papan Info.',
      },
      {
        id: 'jumlah',
        label: 'Menjumlahkan semua data untuk mengetahui total ukuran alam semesta.',
      },
      { id: 'salin', label: 'Menyalin semua data apa adanya karena catatannya pasti sudah benar.' },
      {
        id: 'panjang',
        label: 'Mengubah semua data ke bentuk panjang supaya tidak perlu memakai notasi ilmiah.',
      },
    ],
    masalahCorrect: 'inti',
    masalahUmpan: {
      inti: 'Tepat! Papan Info membutuhkan data yang ditulis seragam (notasi ilmiah baku), dibaca dengan benar, lalu diurutkan dari yang terkecil sampai yang terbesar.',
      jumlah:
        'Datanya berbeda jenis (jarak, ukuran, massa), jadi tidak masuk akal dijumlahkan. Papan Info justru membandingkan dan mengurutkan.',
      salin:
        'Coba lihat lagi: ada data yang belum baku (12,7 × 10⁶) dan ada yang ditulis panjang. Kalau disalin apa adanya, pengunjung sulit membandingkan.',
      panjang:
        'Bentuk panjang seperti 0,000000002 atau 5.970.000.000.000.000.000.000.000 sangat sulit dibaca dan mudah salah hitung nolnya. Itulah gunanya notasi ilmiah.',
    },
    hipotesisLabel:
      'Hipotesis kelompok: bagaimana cara kalian membandingkan dua bilangan dalam notasi ilmiah?',
    hipotesisPlaceholder: 'Contoh: Kami menduga yang dibandingkan lebih dulu adalah …',
    nextLabel: 'Organisasi Kelompok →',
  },

  /* ---------- Sintaks 2: mengorganisasi belajar ---------- */
  organisasi: {
    kicker: 'Tahap 2 · Mengorganisasi Belajar',
    goal: 'Membagi peran, memilah informasi yang diperlukan, dan menyusun rencana penyelidikan.',
    syntax: PBL + ' · Sintaks 2',
    guru: 'Pastikan setiap anggota memegang satu peran berbeda. Saat memilah informasi, tanyakan: "Apakah warna papan membantu kita membandingkan bilangan?" Rencana yang tersusun menjadi peta tiga penyelidikan berikutnya.',
    peranLabel: 'Pilih peranmu di kelompok',
    peran: [
      {
        id: 'pembaca',
        label: '📖 Pembaca Data — membacakan setiap bilangan dengan cara baca yang benar.',
      },
      { id: 'penulis', label: '✍️ Penulis Notasi — menuliskan data dalam notasi ilmiah baku.' },
      { id: 'pembanding', label: '⚖️ Pembanding — memeriksa urutan dan lambang <, >, =.' },
      { id: 'jubir', label: '🎤 Juru Bicara — menyusun pesan dan mempresentasikan papan.' },
    ],
    judulPilah: 'Pilah informasinya',
    opsiPilah: [
      { id: 'diketahui', label: 'Diketahui' },
      { id: 'ditanya', label: 'Ditanyakan' },
      { id: 'tidakPerlu', label: 'Tidak diperlukan' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: 'Jarak Bumi–Bulan 384.000.000 m.',
        correct: 'diketahui',
        explanation: 'Ini data dari catatan — sudah diketahui, tetapi masih dalam bentuk panjang.',
      },
      {
        id: 'p2',
        teks: 'Massa elektron 9,11 × 10⁻³¹ kg.',
        correct: 'diketahui',
        explanation: 'Ini data yang diketahui dan sudah ditulis dalam notasi ilmiah.',
      },
      {
        id: 'p3',
        teks: 'Benda mana yang paling kecil dan mana yang paling besar?',
        correct: 'ditanya',
        explanation: 'Inilah yang harus dijawab lewat Papan Info — jadi ditanyakan.',
      },
      {
        id: 'p4',
        teks: 'Bagaimana notasi ilmiah baku dari setiap data?',
        correct: 'ditanya',
        explanation: 'Kalian harus menuliskan ulang data dalam bentuk baku — jadi ditanyakan.',
      },
      {
        id: 'p5',
        teks: 'Papan Info akan dicetak dengan warna biru tua.',
        correct: 'tidakPerlu',
        explanation: 'Warna papan tidak membantu membaca atau membandingkan bilangan.',
      },
      {
        id: 'p6',
        teks: 'Pameran Sains dimulai pukul 08.00.',
        correct: 'tidakPerlu',
        explanation: 'Waktu pameran tidak diperlukan untuk menyelesaikan masalah bilangan.',
      },
    ],
    judulRencana: 'Susun rencana penyelidikan',
    instruksiRencana: 'Urutkan langkah kerja kelompok dari yang pertama sampai yang terakhir.',
    rencana: [
      { id: 'r1', label: 'Kenali bentuk tiap bilangan: panjang, notasi ilmiah, atau tidak baku' },
      { id: 'r2', label: 'Tulis semua data dalam notasi ilmiah baku' },
      { id: 'r3', label: 'Bandingkan pangkat 10, lalu mantisa bila pangkatnya sama' },
      { id: 'r4', label: 'Susun dan presentasikan Papan Info' },
    ],
    nextLabel: 'Mulai Penyelidikan A →',
  },

  /* ---------- Sintaks 3a: Lab Geser Koma & membaca ---------- */
  selidikBaca: {
    kicker: 'Tahap 3 · Penyelidikan A — Lab Geser Koma',
    goal: 'Menemukan hubungan banyak geseran koma dengan pangkat 10, syarat bentuk baku, dan cara membaca notasi ilmiah.',
    syntax: PBL + ' · Sintaks 3',
    guru: 'Biarkan murid bereksperimen dengan tombol geser. Ajukan pertanyaan: "Koma digeser ke kiri, pangkatnya naik atau turun? Mengapa nilainya tetap sama?" Tekankan: yang dihitung adalah banyak GESERAN koma, bukan banyak angka nol.',
    labJudul: 'Lab Geser Koma',
    labPengantar:
      'Pilih satu bilangan, lalu geser komanya. Setiap geseran mengubah mantisa dan pangkat 10, tetapi nilainya tetap sama. Temukan bentuk baku (mantisa di antara 1 dan 10) untuk keempat bilangan!',
    lab: [
      { id: 'cahaya', ikon: '⚡', nama: 'Kecepatan cahaya', satuan: 'm/s', x: sn('3', 8) },
      { id: 'penduduk', ikon: '👥', nama: 'Penduduk Indonesia', satuan: 'jiwa', x: sn('2,8', 8) },
      { id: 'darah', ikon: '🩸', nama: 'Sel darah merah', satuan: 'm', x: sn('8', -6) },
      { id: 'kertas', ikon: '📄', nama: 'Tebal selembar kertas', satuan: 'm', x: sn('1', -4) },
    ],
    amatiJudul: 'Amati hasil lab kalian',
    amati: [
      {
        id: 'a1',
        tanya:
          'Kecepatan cahaya 300.000.000 m/s: koma digeser ke **kiri 8 kali** sampai mantisanya 3. Pangkat 10-nya menjadi …',
        opsi: [
          { id: 'a', label: '8, jadi 3 × 10⁸' },
          { id: 'b', label: '−8, jadi 3 × 10⁻⁸' },
          { id: 'c', label: '9, karena bilangannya terdiri atas 9 angka' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! Setiap geseran ke kiri membagi mantisa dengan 10, jadi pangkat 10 bertambah satu agar nilainya tetap: 8 geseran → 10⁸.',
          b: 'Bilangannya sangat BESAR, jadi pangkatnya positif. Pangkat negatif untuk bilangan di antara 0 dan 1.',
          c: 'Yang dihitung adalah banyak geseran koma, bukan banyak angka. Hitung ulang di lab.',
        },
      },
      {
        id: 'a2',
        tanya:
          'Sel darah merah 0,000008 m: koma digeser ke **kanan 6 kali** sampai mantisanya 8. Pangkat 10-nya menjadi …',
        opsi: [
          { id: 'a', label: '−6, jadi 8 × 10⁻⁶' },
          { id: 'b', label: '6, jadi 8 × 10⁶' },
          { id: 'c', label: '−5, karena ada lima angka nol di belakang koma' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! Bilangan di antara 0 dan 1 → koma digeser ke kanan → pangkatnya negatif.',
          b: '8 × 10⁶ = 8.000.000, sangat besar! Untuk bilangan kecil, pangkatnya negatif.',
          c: 'Hitung geserannya, bukan nolnya: koma harus melewati 5 angka nol DAN angka 8, jadi 6 geseran.',
        },
      },
      {
        id: 'a3',
        tanya: 'Kapan bentuk **a × 10ⁿ** disebut notasi ilmiah **baku**?',
        opsi: [
          { id: 'a', label: 'Saat 1 ≤ a < 10 dan n bilangan bulat' },
          { id: 'b', label: 'Saat a bilangan bulat' },
          { id: 'c', label: 'Saat n bilangan positif' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Mantisa harus lebih dari atau sama dengan 1 dan kurang dari 10, misalnya 3, 2,8, atau 9,11.',
          b: '2,8 × 10⁸ baku walaupun 2,8 bukan bilangan bulat, sedangkan 12 × 10⁵ tidak baku. Lihat nilai mantisanya.',
          c: '8 × 10⁻⁶ baku walaupun pangkatnya negatif. Syaratnya ada pada mantisa.',
        },
      },
      {
        id: 'a4',
        tanya: 'Pada **9,11 × 10⁻³¹**, bilangan 9,11 disebut … dan −31 disebut …',
        opsi: [
          { id: 'a', label: 'mantisa (koefisien) dan pangkat (eksponen)' },
          { id: 'b', label: 'basis dan mantisa' },
          { id: 'c', label: 'pangkat dan basis' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! Basisnya selalu 10. Mantisa 9,11 dan pangkat −31.',
          b: 'Basis notasi ilmiah selalu 10. Bilangan 9,11 adalah mantisa.',
          c: 'Pangkat adalah −31 (bilangan kecil di atas 10). Bilangan 9,11 adalah mantisa.',
        },
      },
    ],
    bacaJudul: 'Bacakan dengan benar',
    bacaInstruksi: 'Pembaca Data membacakan, anggota lain memilih cara baca yang tepat.',
    baca: [
      { id: 'b1', konteks: 'Kecepatan cahaya', x: sn('3', 8), satuan: 'm/s' },
      { id: 'b2', konteks: 'Massa elektron', x: sn('9,11', -31), satuan: 'kg' },
      { id: 'b3', konteks: 'Jarak Bumi–Matahari', x: sn('1,5', 11), satuan: 'm' },
      { id: 'b4', konteks: 'Sel darah merah', x: sn('8', -6), satuan: 'm' },
    ],
    temuan: [
      'Notasi ilmiah baku: a × 10ⁿ dengan 1 ≤ a < 10 dan n bilangan bulat.',
      'Koma digeser ke kiri (bilangan besar) → pangkat positif; ke kanan (bilangan di antara 0 dan 1) → pangkat negatif.',
      'Pangkat = banyak geseran koma, bukan banyak angka nol.',
      'Cara baca: mantisa, lalu "kali sepuluh pangkat …" termasuk kata "negatif" bila pangkatnya negatif.',
    ],
    nextLabel: 'Lanjut ke Penyelidikan B →',
  },

  /* ---------- Sintaks 3b: menuliskan notasi ilmiah ---------- */
  selidikTulis: {
    kicker: 'Tahap 4 · Penyelidikan B — Tulis dalam Bentuk Baku',
    goal: 'Menuliskan bilangan dalam notasi ilmiah baku, membakukan bentuk yang belum baku, dan menuliskan kembali dalam bentuk panjang.',
    syntax: PBL + ' · Sintaks 3',
    guru: 'Penulis Notasi memimpin tahap ini. Saat ada jawaban keliru, minta kelompok membaca umpan baliknya bersama lalu mencoba di Lab Geser Koma. Tekankan aturan: mantisa dikecilkan → pangkat bertambah; mantisa dibesarkan → pangkat berkurang.',
    judulA: 'A. Sudah baku atau belum?',
    instruksiA: 'Periksa mantisanya: apakah di antara 1 dan 10?',
    opsiBaku: [
      { id: 'baku', label: 'Sudah baku' },
      { id: 'belum', label: 'Belum baku' },
    ],
    pilahBaku: [
      { id: 'k1', x: sn('4,5', -5), correct: 'baku' },
      { id: 'k2', x: sn('45', -6), correct: 'belum' },
      { id: 'k3', x: sn('0,8', 3), correct: 'belum' },
      { id: 'k4', x: sn('1', 9), correct: 'baku' },
      { id: 'k5', x: sn('10', 4), correct: 'belum' },
      { id: 'k6', x: sn('9,99', -2), correct: 'baku' },
    ],
    judulB: 'B. Bentuk panjang → notasi ilmiah',
    instruksiB: 'Tulis data berikut dalam notasi ilmiah baku.',
    tulis: [
      { id: 't1', ikon: '🌙', nama: 'Jarak Bumi–Bulan', desimal: '384.000.000', satuan: 'm' },
      { id: 't2', ikon: '📄', nama: 'Tebal selembar kertas', desimal: '0,0001', satuan: 'm' },
      { id: 't3', ikon: '🦠', nama: 'Bakteri E. coli', desimal: '0,000002', satuan: 'm' },
      { id: 't4', ikon: '🗺️', nama: 'Luas daratan Indonesia', desimal: '1.905.000', satuan: 'km²' },
    ],
    judulC: 'C. Bakukan!',
    instruksiC: 'Data berikut belum baku. Pilih bentuk bakunya.',
    bakukan: [
      { id: 'u1', ikon: '🌍', nama: 'Diameter Bumi', x: sn('12,7', 6), satuan: 'm' },
      { id: 'u2', ikon: '🧫', nama: 'Virus corona', x: sn('0,12', -6), satuan: 'm' },
      { id: 'u3', ikon: '🔴', nama: 'Jarak Mars–Matahari', x: sn('228', 9), satuan: 'm' },
    ],
    judulD: 'D. Notasi ilmiah → bentuk panjang',
    instruksiD: 'Pengunjung pameran ingin melihat bentuk panjangnya. Pilih yang tepat.',
    panjang: [
      { id: 'q1', ikon: '🌐', nama: 'Penduduk dunia', x: sn('8', 9), satuan: 'jiwa' },
      { id: 'q2', ikon: '🧫', nama: 'Virus corona', x: sn('1,2', -7), satuan: 'm' },
      { id: 'q3', ikon: '💇', nama: 'Tebal rambut', x: sn('8', -5), satuan: 'm' },
    ],
    temuan: [
      'Mantisa ≥ 10 → geser koma ke kiri, pangkat BERTAMBAH: 12,7 × 10⁶ = 1,27 × 10⁷.',
      'Mantisa < 1 → geser koma ke kanan, pangkat BERKURANG: 0,12 × 10⁻⁶ = 1,2 × 10⁻⁷.',
      'Dari notasi ilmiah ke bentuk panjang: pangkat positif → koma ke kanan; pangkat negatif → koma ke kiri.',
    ],
    nextLabel: 'Lanjut ke Penyelidikan C →',
  },

  /* ---------- Sintaks 3c: membandingkan ---------- */
  selidikBanding: {
    kicker: 'Tahap 5 · Penyelidikan C — Bandingkan',
    goal: 'Membandingkan dua bilangan dalam notasi ilmiah dan menempatkan benda pada pita orde 10ⁿ.',
    syntax: PBL + ' · Sintaks 3',
    guru: 'Pembanding memimpin. Setelah lambang terpilih, minta murid mengucapkan alasannya: "pangkatnya … lebih besar/kecil, jadi …". Pada pasangan pangkat negatif, gambarkan garis bilangan −10 … 0 di papan tulis.',
    judulA: 'A. Bandingkan pasangan data',
    instruksiA: 'Pilih lambang yang tepat, lalu lengkapi maknanya dalam cerita.',
    pasangan: [
      {
        id: 'q1',
        ikon: '⚖️',
        namaA: 'Massa elektron',
        a: sn('9,11', -31),
        namaB: 'massa proton',
        b: sn('1,67', -27),
        satuan: 'kg',
        tema: 'berat',
        kalimat: 'Jadi, elektron ___ daripada proton.',
      },
      {
        id: 'q2',
        ikon: '🌙',
        namaA: 'Jarak Bumi–Bulan',
        a: sn('3,84', 8),
        namaB: 'jarak Bumi–Matahari',
        b: sn('1,5', 11),
        satuan: 'm',
        tema: 'jarak',
        kalimat: 'Jadi, Bulan ___ dari Bumi daripada Matahari.',
      },
      {
        id: 'q3',
        ikon: '🧬',
        namaA: 'Lebar untai DNA',
        a: sn('2', -9),
        namaB: 'sel darah merah',
        b: sn('8', -6),
        satuan: 'm',
        tema: 'panjang',
        kalimat: 'Jadi, lebar untai DNA ___ daripada diameter sel darah merah.',
      },
      {
        id: 'q4',
        ikon: '👥',
        namaA: 'Penduduk Indonesia',
        a: sn('2,8', 8),
        namaB: 'penduduk Amerika Serikat',
        b: sn('3,4', 8),
        satuan: 'jiwa',
        tema: 'banyak',
        kalimat: 'Jadi, penduduk Indonesia ___ daripada penduduk Amerika Serikat.',
      },
      {
        id: 'q5',
        ikon: '🔴',
        namaA: 'Jarak Mars–Matahari',
        a: sn('228', 9),
        namaB: 'jarak Bumi–Matahari',
        b: sn('1,5', 11),
        satuan: 'm',
        tema: 'jarak',
        kalimat: 'Jadi, Mars ___ dari Matahari daripada Bumi.',
      },
      {
        id: 'q6',
        ikon: '🩸',
        namaA: 'Sel darah merah (buku A)',
        a: sn('8', -6),
        bentukA: 'panjang',
        namaB: 'sel darah merah (buku B)',
        b: sn('8', -6),
        satuan: 'm',
        tema: 'panjang',
        kalimat: 'Jadi, ukuran pada buku A ___ dengan ukuran pada buku B.',
      },
    ],
    judulB: 'B. Pita Orde 10ⁿ — Dunia Mikro',
    instruksiB:
      'Tempatkan setiap benda pada anak tangga pangkat 10 dari bentuk bakunya. Anak tangga di kanan berarti 10 kali lebih besar daripada anak tangga di kirinya.',
    pita: ['atom', 'dna', 'virus', 'bakteri', 'darah', 'rambut', 'pasir'],
    pitaRungs: [-10, -9, -8, -7, -6, -5, -4],
    judulC: 'C. Pilih strategi yang tepat',
    strategi: [
      {
        id: 's1',
        cek: { p: sn('9,11', -31), q: sn('1,67', -27), strategi: 'pangkatBeda' },
        tanya:
          'Untuk **9,11 × 10⁻³¹** dan **1,67 × 10⁻²⁷** (keduanya baku), langkah yang paling cepat adalah …',
        opsi: [
          { id: 'a', label: 'Bandingkan pangkat 10-nya: −31 dan −27' },
          { id: 'b', label: 'Bandingkan mantisanya: 9,11 dan 1,67' },
          { id: 'c', label: 'Tulis keduanya dalam bentuk panjang lalu hitung nolnya' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Pangkat berbeda → pangkat yang lebih besar (−27) menang. Mantisa tidak perlu dilihat.',
          b: 'Mantisa hanya dibandingkan bila pangkatnya sama. Selisih satu pangkat saja sudah berarti 10 kali lipat.',
          c: 'Bisa, tetapi sangat lama dan rawan salah menghitung 30-an angka nol. Notasi ilmiah dibuat agar kita cukup melihat pangkatnya.',
        },
      },
      {
        id: 's2',
        cek: { p: sn('2,8', 8), q: sn('3,4', 8), strategi: 'pangkatSama' },
        tanya: 'Untuk **2,8 × 10⁸** dan **3,4 × 10⁸**, langkah yang tepat adalah …',
        opsi: [
          { id: 'a', label: 'Pangkatnya sama, jadi bandingkan mantisanya: 2,8 < 3,4' },
          { id: 'b', label: 'Pangkatnya sama, jadi kedua bilangan sama besar' },
          { id: 'c', label: 'Bandingkan banyak angka pada mantisanya' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! Pangkat sama → mantisa yang lebih besar, bilangannya lebih besar.',
          b: 'Pangkat sama belum berarti nilainya sama. Mantisa 2,8 dan 3,4 berbeda.',
          c: 'Banyak angka tidak menentukan besar-kecilnya. Bandingkan nilai mantisanya.',
        },
      },
      {
        id: 's3',
        cek: { p: sn('228', 9), q: sn('1,5', 11), strategi: 'bakukan' },
        tanya: 'Untuk **228 × 10⁹** dan **1,5 × 10¹¹**, langkah pertama yang tepat adalah …',
        opsi: [
          { id: 'a', label: 'Bakukan dulu: 228 × 10⁹ = 2,28 × 10¹¹' },
          { id: 'b', label: 'Langsung simpulkan 228 × 10⁹ lebih kecil karena 9 < 11' },
          { id: 'c', label: 'Bandingkan 228 dan 1,5 saja' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Setelah baku, pangkatnya sama-sama 11, lalu 2,28 > 1,5. Jadi Mars lebih jauh.',
          b: 'Hati-hati: 228 × 10⁹ belum baku, jadi pangkat 9 belum bisa dibandingkan langsung.',
          c: 'Mantisa baru boleh dibandingkan jika keduanya baku dan pangkatnya sama.',
        },
      },
    ],
    temuan: [
      'Bakukan dulu setiap bilangan.',
      'Pangkat 10 berbeda → pangkat lebih besar, bilangan lebih besar (−27 > −31, jadi 10⁻²⁷ > 10⁻³¹).',
      'Pangkat 10 sama → bandingkan mantisanya.',
      'Naik satu anak tangga pangkat = 10 kali lebih besar.',
    ],
    nextLabel: 'Susun Karya →',
  },

  /* ---------- Sintaks 4: mengembangkan & menyajikan karya ---------- */
  karya: {
    kicker: 'Tahap 6 · Menyajikan Karya',
    goal: 'Menyusun Papan Info Semesta Mini: mengurutkan data, memperkirakan perbandingan, dan menyampaikan alasan.',
    syntax: PBL + ' · Sintaks 4',
    guru: 'Beri waktu kelompok menyusun papan lalu presentasi ±2 menit. Setiap anggota menjelaskan satu baris papan sesuai perannya. Minta kelompok lain menanggapi: "Setujukah kalian dengan urutannya? Mengapa?"',
    judul1: 'Urutkan Dunia Mikro (terkecil → terbesar)',
    urutMikro: ['virus', 'bakteri', 'darah', 'dna', 'rambut', 'atom'],
    judul2: 'Urutkan Dunia Raksasa (terbesar → terkecil)',
    urutRaksasa: ['matahari', 'bumi', 'mars', 'bulan', 'dMatahari'],
    judul3: 'Berapa kali lipat?',
    tanyaKali: {
      id: 'kali',
      cek: { p: sn('1,5', 11), q: sn('12,7', 6), orde: 4 },
      tanya:
        'Jarak Bumi–Matahari (**1,5 × 10¹¹ m**) kira-kira berapa kali diameter Bumi (**12,7 × 10⁶ m**)?',
      opsi: [
        { id: 'a', label: 'Sekitar 10⁴ kali (belasan ribu kali)' },
        { id: 'b', label: 'Sekitar 10⁵ kali' },
        { id: 'c', label: 'Sekitar 4 kali' },
        { id: 'd', label: 'Sekitar 10¹⁷ kali' },
      ],
      correct: 'a',
      umpan: {
        a: 'Tepat! 12,7 × 10⁶ = 1,27 × 10⁷. Selisih pangkatnya 11 − 7 = 4, jadi sekitar 10⁴ kali (1,5 × 10¹¹ : 1,27 × 10⁷ ≈ 12.000).',
        b: 'Kamu memakai pangkat 6 dari bentuk yang belum baku. Bakukan dulu: 12,7 × 10⁶ = 1,27 × 10⁷.',
        c: 'Selisih pangkat 4 berarti 10⁴ kali, bukan 4 kali. Setiap satu pangkat = 10 kali lipat.',
        d: 'Pangkat tidak dijumlahkan. Untuk "berapa kali", pangkatnya dikurangkan.',
      },
    },
    judul4: 'Alasan kelompok',
    tanyaAlasan: {
      id: 'alasan',
      tanya: 'Alasan yang paling tepat untuk urutan pada Papan Info kalian adalah …',
      opsi: [
        {
          id: 'a',
          label:
            'Semua data dibakukan dulu, lalu dibandingkan pangkat 10-nya; bila pangkatnya sama, dibandingkan mantisanya.',
        },
        { id: 'b', label: 'Data diurutkan menurut mantisanya saja.' },
        { id: 'c', label: 'Data diurutkan menurut banyak angka nol yang tertulis.' },
        { id: 'd', label: 'Data diurutkan menurut panjang tulisannya.' },
      ],
      correct: 'a',
      umpan: {
        a: 'Tepat! Inilah strategi yang kalian temukan pada penyelidikan.',
        b: 'Mantisa saja menyesatkan: 9,11 × 10⁻³¹ justru jauh lebih kecil daripada 1,67 × 10⁻²⁷.',
        c: 'Banyak nol berbeda dengan banyak geseran koma, dan bentuk tidak baku bisa menipu.',
        d: 'Panjang tulisan tidak menunjukkan besar bilangan: 0,000000002 panjang tetapi sangat kecil.',
      },
    },
    pesanLabel: 'Pesan kelompok untuk pengunjung pameran',
    pesanPlaceholder:
      'Contoh: Virus corona berukuran 1,2 × 10⁻⁷ m, sekitar 100 kali lebih kecil daripada …',
    posterJudul: 'Papan Info Semesta Mini',
    posterFooter: 'Semua data ditulis dalam notasi ilmiah baku a × 10ⁿ (1 ≤ a < 10).',
    nextLabel: 'Evaluasi Proses →',
  },

  /* ---------- Sintaks 5: analisis & evaluasi ---------- */
  evaluasi: {
    kicker: 'Tahap 7 · Analisis & Evaluasi',
    goal: 'Menilai pendapat teman, menguji dugaan awal, dan menyusun simpulan.',
    syntax: PBL + ' · Sintaks 5',
    guru: 'Diskusikan pendapat teman satu per satu: minta kelompok menunjukkan letak kekeliruan dengan bahasa sendiri. Bandingkan hipotesis awal dengan hasil penyelidikan — hargai dugaan yang terkoreksi sebagai bagian dari belajar.',
    judulA: 'A. Setujukah kamu dengan pendapat teman?',
    opsiPendapat: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pendapat: [
      {
        id: 'e1',
        teks: 'Dina: "9,11 × 10⁻³¹ lebih besar daripada 1,67 × 10⁻²⁷ karena 9,11 > 1,67."',
        cek: { jenis: 'banding', p: sn('9,11', -31), q: sn('1,67', -27), klaim: 'gt' },
        correct: 'salah',
        explanation:
          'Pangkat dibandingkan lebih dulu: −31 < −27, jadi 9,11 × 10⁻³¹ < 1,67 × 10⁻²⁷.',
      },
      {
        id: 'e2',
        teks: 'Raka: "10⁻⁹ lebih kecil daripada 10⁻⁷ karena −9 < −7."',
        cek: { jenis: 'banding', p: sn('1', -9), q: sn('1', -7), klaim: 'lt' },
        correct: 'benar',
        explanation: 'Benar. 10⁻⁹ = 0,000000001 dan 10⁻⁷ = 0,0000001.',
      },
      {
        id: 'e3',
        teks: 'Sari: "12,7 × 10⁶ sudah notasi ilmiah baku."',
        cek: { jenis: 'baku', x: sn('12,7', 6), klaim: true },
        correct: 'salah',
        explanation: 'Mantisa 12,7 ≥ 10, jadi belum baku. Bentuk bakunya 1,27 × 10⁷.',
      },
      {
        id: 'e4',
        teks: 'Budi: "0,000008 = 8 × 10⁻⁶ karena koma digeser 6 kali ke kanan."',
        cek: { jenis: 'tulis', desimal: '0,000008', x: sn('8', -6) },
        correct: 'benar',
        explanation: 'Benar. Enam geseran ke kanan memberi pangkat −6.',
      },
      {
        id: 'e5',
        teks: 'Tono: "3,84 × 10⁸ dibaca tiga koma delapan empat kali sepuluh pangkat delapan."',
        cek: {
          jenis: 'baca',
          x: sn('3,84', 8),
          bacaan: 'tiga koma delapan empat kali sepuluh pangkat delapan',
        },
        correct: 'benar',
        explanation: 'Benar. Angka di belakang koma dibaca satu per satu.',
      },
      {
        id: 'e6',
        teks: 'Maya: "384.000.000 = 3,84 × 10⁶ karena ada 6 angka nol."',
        cek: { jenis: 'tulis', desimal: '384.000.000', x: sn('3,84', 6) },
        correct: 'salah',
        explanation: 'Yang dihitung geseran koma, bukan nol: 384.000.000 = 3,84 × 10⁸.',
      },
    ],
    judulB: 'B. Dugaan awal vs hasil penyelidikan',
    judulC: 'C. Susun simpulan kelompok',
    instruksiC: 'Lengkapi setiap kalimat dengan potongan yang tepat dari bank kalimat.',
    selectPlaceholder: 'Pilih lanjutan kalimat…',
    kalimat: [
      { id: 'g1', awal: 'Notasi ilmiah baku ditulis a × 10ⁿ dengan', correct: 'k1' },
      {
        id: 'g2',
        awal: 'Untuk bilangan yang lebih dari 10, koma digeser ke kiri sehingga',
        correct: 'k2',
      },
      {
        id: 'g3',
        awal: 'Untuk bilangan di antara 0 dan 1, koma digeser ke kanan sehingga',
        correct: 'k3',
      },
      { id: 'g4', awal: 'Untuk membandingkan, bakukan dulu, lalu', correct: 'k4' },
    ],
    bank: [
      { id: 'k1', teks: '1 ≤ a < 10 dan n bilangan bulat.' },
      { id: 'k2', teks: 'pangkatnya positif.' },
      { id: 'k3', teks: 'pangkatnya negatif.' },
      { id: 'k4', teks: 'bandingkan pangkat 10; bila pangkatnya sama, bandingkan mantisanya.' },
      { id: 'k5', teks: 'bandingkan mantisanya saja.' },
      { id: 'k6', teks: 'pangkatnya sama dengan banyak angka nol.' },
    ],
    rangkuman: [
      'Notasi ilmiah baku: a × 10ⁿ, dengan 1 ≤ a < 10 dan n bilangan bulat.',
      'Cara baca: 4,5 × 10⁻⁵ → "empat koma lima kali sepuluh pangkat negatif lima".',
      'Menulis: pangkat = banyak geseran koma; bilangan besar → pangkat positif, bilangan di antara 0 dan 1 → pangkat negatif.',
      'Membakukan: mantisa dikecilkan → pangkat bertambah; mantisa dibesarkan → pangkat berkurang.',
      'Membandingkan: bakukan, bandingkan pangkat 10, lalu mantisa bila pangkatnya sama.',
    ],
    nextLabel: 'Uji Terap →',
  },

  /* ---------- Uji terap (mandiri) ---------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: PBL + ' · Masalah baru',
    goal: 'Menerapkan cara membaca, menuliskan, dan membandingkan notasi ilmiah pada masalah baru.',
    guru: 'Murid mengerjakan secara mandiri. Catat soal yang paling sering salah, lalu bahas di akhir tahap bersama seluruh kelas.',
    instruksi:
      'Kerjakan secara mandiri. Soal pilihan ganda hanya bisa dijawab sekali; soal isian boleh dicoba lagi dan ada petunjuk.',
    banyak: 8,
    komposisi: { baca: 1, tulis: 2, bakukan: 1, banding: 3, urut: 1 },
    /*
     * Opsi soal baca/tulis/bakukan dibuat engine (opsiBacaIlmiah,
     * opsiTulisIlmiah, opsiBakukanIlmiah) sehingga kuncinya pasti
     * konsisten. Soal banding memakai `items` + `cari`; soal urut memakai
     * `items` + `arah` + `opsi` (urutan id) dengan `correct`.
     */
    soal: [
      {
        id: 't1',
        jenis: 'baca',
        cerita: 'Massa sebutir debu halus sekitar 7 × 10⁻¹⁰ kg.',
        x: sn('7', -10),
        pertanyaan: 'Cara membaca 7 × 10⁻¹⁰ yang tepat adalah …',
      },
      {
        id: 't2',
        jenis: 'baca',
        cerita: 'Di dalam 18 gram air terdapat sekitar 6,02 × 10²³ molekul air.',
        x: sn('6,02', 23),
        pertanyaan: 'Cara membaca 6,02 × 10²³ yang tepat adalah …',
      },
      {
        id: 't3',
        jenis: 'baca',
        cerita: 'Penduduk Tiongkok sekitar 1,4 × 10⁹ jiwa.',
        x: sn('1,4', 9),
        pertanyaan: 'Cara membaca 1,4 × 10⁹ yang tepat adalah …',
      },
      {
        id: 't4',
        jenis: 'tulis',
        cerita: 'Diameter sebutir serbuk sari sekitar 0,000025 m.',
        desimal: '0,000025',
        pertanyaan: 'Notasi ilmiah baku dari 0,000025 adalah …',
      },
      {
        id: 't5',
        jenis: 'tulis',
        cerita: 'Jarak Matahari ke Pluto sekitar 5.900.000.000 km.',
        desimal: '5.900.000.000',
        pertanyaan: 'Notasi ilmiah baku dari 5.900.000.000 adalah …',
      },
      {
        id: 't6',
        jenis: 'tulis',
        type: 'input',
        cerita: 'Panjang seekor tungau debu sekitar 0,0003 m.',
        desimal: '0,0003',
        pertanyaan: '0,0003 = 3 × 10ⁿ. Berapakah n? Tulis pangkatnya saja.',
        hints: [
          'Hitung berapa kali koma digeser ke kanan sampai mantisanya 3.',
          'Bilangan di antara 0 dan 1 → pangkatnya negatif.',
        ],
      },
      {
        id: 't7',
        jenis: 'tulis',
        type: 'input',
        cerita: 'Jarak Bumi ke Matahari sekitar 150.000.000 km.',
        desimal: '150.000.000',
        pertanyaan: '150.000.000 = 1,5 × 10ⁿ. Berapakah n? Tulis pangkatnya saja.',
        hints: [
          'Hitung berapa kali koma digeser ke kiri sampai mantisanya 1,5.',
          'Angka 5 ikut dilewati, jadi jangan hanya menghitung nol.',
        ],
      },
      {
        id: 't8',
        jenis: 'bakukan',
        cerita: 'Tebal sebuah kartu tercatat 0,5 × 10⁻³ m.',
        x: sn('0,5', -3),
        pertanyaan: 'Bentuk baku dari 0,5 × 10⁻³ adalah …',
      },
      {
        id: 't9',
        jenis: 'bakukan',
        cerita: 'Pengguna sebuah aplikasi belajar tercatat 64 × 10⁵ orang.',
        x: sn('64', 5),
        pertanyaan: 'Bentuk baku dari 64 × 10⁵ adalah …',
      },
      {
        id: 't10',
        jenis: 'bakukan',
        cerita: 'Sebuah wahana antariksa menempuh 0,03 × 10¹² m.',
        x: sn('0,03', 12),
        pertanyaan: 'Bentuk baku dari 0,03 × 10¹² adalah …',
      },
      {
        id: 't11',
        jenis: 'banding',
        cerita:
          'Massa partikel: elektron 9,11 × 10⁻³¹ kg, proton 1,67 × 10⁻²⁷ kg, neutron 1,675 × 10⁻²⁷ kg.',
        pertanyaan: 'Partikel mana yang paling ringan?',
        cari: 'terkecil',
        items: [
          { id: 'elektron', nama: 'Elektron', x: sn('9,11', -31) },
          { id: 'proton', nama: 'Proton', x: sn('1,67', -27) },
          { id: 'neutron', nama: 'Neutron', x: sn('1,675', -27) },
        ],
      },
      {
        id: 't12',
        jenis: 'banding',
        cerita: 'Diameter planet: Jupiter 1,43 × 10⁸ m, Saturnus 116 × 10⁶ m, Bumi 12,7 × 10⁶ m.',
        pertanyaan: 'Planet mana yang diameternya paling besar?',
        cari: 'terbesar',
        items: [
          { id: 'jupiter', nama: 'Jupiter', x: sn('1,43', 8) },
          { id: 'saturnus', nama: 'Saturnus', x: sn('116', 6) },
          { id: 'bumi', nama: 'Bumi', x: sn('12,7', 6) },
        ],
      },
      {
        id: 't13',
        jenis: 'banding',
        cerita: 'Panjang bakteri: A = 0,000003 m, B = 2,5 × 10⁻⁶ m, C = 0,4 × 10⁻⁵ m.',
        pertanyaan: 'Bakteri mana yang paling panjang?',
        cari: 'terbesar',
        items: [
          { id: 'a', nama: 'Bakteri A', x: sn('3', -6) },
          { id: 'b', nama: 'Bakteri B', x: sn('2,5', -6) },
          { id: 'c', nama: 'Bakteri C', x: sn('0,4', -5) },
        ],
      },
      {
        id: 't14',
        jenis: 'banding',
        cerita: 'Ukuran virus: A = 8 × 10⁻⁸ m, B = 1,5 × 10⁻⁷ m, C = 9 × 10⁻⁹ m.',
        pertanyaan: 'Virus mana yang paling kecil?',
        cari: 'terkecil',
        items: [
          { id: 'a', nama: 'Virus A', x: sn('8', -8) },
          { id: 'b', nama: 'Virus B', x: sn('1,5', -7) },
          { id: 'c', nama: 'Virus C', x: sn('9', -9) },
        ],
      },
      {
        id: 't15',
        jenis: 'urut',
        cerita: 'Tebal rambut 8 × 10⁻⁵ m, tebal kertas 1 × 10⁻⁴ m, sel darah merah 8 × 10⁻⁶ m.',
        pertanyaan: 'Urutan dari yang terkecil ke yang terbesar adalah …',
        arah: 'naik',
        items: [
          { id: 'rambut', nama: 'rambut', x: sn('8', -5) },
          { id: 'kertas', nama: 'kertas', x: sn('1', -4) },
          { id: 'darah', nama: 'sel darah merah', x: sn('8', -6) },
        ],
        opsi: [
          { id: 'a', urutan: ['darah', 'rambut', 'kertas'] },
          { id: 'b', urutan: ['kertas', 'darah', 'rambut'] },
          { id: 'c', urutan: ['rambut', 'kertas', 'darah'] },
          { id: 'd', urutan: ['kertas', 'rambut', 'darah'] },
        ],
        correct: 'a',
      },
      {
        id: 't16',
        jenis: 'urut',
        cerita:
          'Jarak dari Bumi: Bulan 3,84 × 10⁸ m, Venus (saat terdekat) 4 × 10¹⁰ m, Matahari 1,5 × 10¹¹ m.',
        pertanyaan: 'Urutan dari yang terjauh ke yang terdekat adalah …',
        arah: 'turun',
        items: [
          { id: 'bulan', nama: 'Bulan', x: sn('3,84', 8) },
          { id: 'venus', nama: 'Venus', x: sn('4', 10) },
          { id: 'matahari', nama: 'Matahari', x: sn('1,5', 11) },
        ],
        opsi: [
          { id: 'a', urutan: ['matahari', 'venus', 'bulan'] },
          { id: 'b', urutan: ['venus', 'bulan', 'matahari'] },
          { id: 'c', urutan: ['bulan', 'venus', 'matahari'] },
          { id: 'd', urutan: ['venus', 'matahari', 'bulan'] },
        ],
        correct: 'a',
      },
    ],
    nextLabel: 'Refleksi →',
  },

  /* ---------- Refleksi ---------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    goal: 'Merefleksikan strategi dan kerja sama selama menyelesaikan masalah.',
    syntax: PBL + ' · Refleksi',
    guru: 'Minta dua atau tiga murid membacakan refleksinya. Murid yang memilih "belum yakin" dapat diajak mencoba Lab Geser Koma lagi pada pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Mengapa ilmuwan menulis bilangan yang sangat besar atau sangat kecil dalam notasi ilmiah?',
        placeholder: 'Menurutku notasi ilmiah berguna karena …',
      },
      {
        id: 'r2',
        teks: 'Kekeliruan apa yang paling sering kamu atau kelompokmu lakukan, dan bagaimana cara menghindarinya?',
        placeholder: 'Kami sempat keliru saat … Sekarang kami …',
      },
      {
        id: 'r3',
        teks: 'Di mana lagi kamu pernah melihat bilangan yang sangat besar atau sangat kecil?',
        placeholder: 'Contohnya …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu sekarang membaca, menuliskan, dan membandingkan notasi ilmiah?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — aku bisa menjelaskannya kepada teman' },
      { id: 'yakin', label: '🙂 Yakin — aku bisa mengerjakan sendiri' },
      { id: 'cukup', label: '🤔 Cukup — kadang masih perlu melihat catatan' },
      { id: 'belum', label: '🙋 Belum yakin — aku masih perlu bantuan' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ---------- Selesai ---------- */
  selesai: {
    judul: 'Papan Info Semesta Mini Selesai!',
    teks: 'Kalian berhasil membaca, menuliskan, dan membandingkan bilangan dari dunia atom sampai dunia planet dengan notasi ilmiah.',
    contoh: [
      { ikon: '⚖️', nama: 'Elektron vs proton', a: sn('9,11', -31), b: sn('1,67', -27) },
      { ikon: '🔴', nama: 'Mars vs Bumi ke Matahari', a: sn('2,28', 11), b: sn('1,5', 11) },
      { ikon: '🧬', nama: 'DNA vs virus', a: sn('2', -9), b: sn('1,2', -7) },
    ],
    capaian: [
      'Membaca notasi ilmiah, termasuk pangkat negatif.',
      'Menuliskan bilangan besar dan kecil dalam notasi ilmiah baku.',
      'Membakukan notasi ilmiah yang belum baku.',
      'Membandingkan dan mengurutkan bilangan dalam notasi ilmiah.',
      'Menyajikan Papan Info Semesta Mini bersama kelompok.',
    ],
  },
};
