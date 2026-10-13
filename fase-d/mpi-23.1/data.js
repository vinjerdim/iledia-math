'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Keliling & Luas Bangun Datar — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menentukan keliling dan luas segitiga, persegi, persegi panjang,
   jajargenjang, trapesium, belah ketupat, dan layang-layang melalui
   kegiatan eksplorasi.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing),
   didahului ASESMEN DIAGNOSTIK prasyarat.
   Pemetaan sintaks ke tahap media:

     Asesmen diagnostik ................ 'diagnostik'
     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahPersegi', 'olahJajar',
                                         'olahTrapesium' & 'olahDiagonal'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 3 × 40 menit, murid berpasangan):
     0. Diagnostik   (8')  — sembilan butir prasyarat (nama & sifat
                             bangun, keliling sebagai panjang tepi, luas
                             sebagai banyak petak, satuan, tinggi,
                             perkalian & setengah). Tidak dinilai; hasilnya
                             berupa profil kesiapan per indikator + saran.
     1. Stimulasi    (7')  — "Proyek Taman Sekolah Kelas VII": denah tujuh
                             petak taman berbentuk bangun datar. Murid
                             MENDUGA pagar (keliling) & rumput (luas) yang
                             diperlukan (tidak dinilai).
     2. Masalah      (5')  — memilih pertanyaan inti penyelidikan lalu
                             menulis hipotesis.
     3. Lab Petak    (15') — mengatur ukuran persegi panjang & persegi,
                             menyalakan petak & ruas satuan, MENGHITUNG
                             lalu MENCATAT keliling dan luas (isian
                             berdiagnosa: keliling ↔ luas tertukar, dsb.).
     4a. Olah Persegi(10') — menemukan K = 2 × (p + l), L = p × l, dan
                             kasus khusus persegi dari catatan sendiri.
     4b. Olah Jajar  (15') — Lab Potong-Susun: jajargenjang dipotong-geser
                             menjadi persegi panjang (L = a × t); dua
                             segitiga sama menjadi jajargenjang
                             (L = ½ × a × t).
     4c. Olah Trap.  (10') — dua trapesium sama menjadi jajargenjang
                             beralas a + b (L = ½ × (a + b) × t).
     4d. Olah Diag.  (10') — belah ketupat & layang-layang dalam persegi
                             panjang d₁ × d₂ (L = ½ × d₁ × d₂).
     5. Verifikasi   (10') — memilah rumus luas untuk tujuh bangun baru,
                             menilai pernyataan, membandingkan dugaan awal
                             dan hipotesis dengan data.
     6. Generalisasi (5')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap    (12') — delapan soal diambil acak dari bank enam belas
                             soal (isian berdiagnosa & pilihan ganda
                             berpengecoh miskonsepsi).
     8. Refleksi     (3')  — rekap, refleksi tertulis, penilaian diri.

   Notasi kunci jawaban (`cek`, lihat engine seksi 73):
     { jenis, ukuran, minta: 'keliling' | 'luas' }
     { jenis, ukuran, minta: 'ukuran', cari, dari: 'luas' | 'keliling' }
     { jenis, minta: 'rumus' } → id rumus luas (RUMUS_LUAS)
   jenis: segitiga, persegi, persegiPanjang, jajargenjang, trapesium,
   belahKetupat, layangLayang (BANGUN_DATAR di shared/engine.js).
   `label` pada petak & soal = label gambar untuk buildBangunSVG.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / ensureDiagnostikStates / shuffleArray dari
   shared/engine.js), sehingga tiap murid dan tiap Reset mendapat urutan
   berbeda. Soal uji terap juga diambil acak dari bank dan opsi pilihan
   gandanya dibangun engine (opsiSoalBangun) lalu diacak.

   Konsistensi kunci jawaban diuji tests/mpi-23.1-data.test.js terhadap
   engine seksi 72–73.
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  meta: {
    judul: 'Keliling & Luas Bangun Datar',
  },

  tahap: [
    { id: 'diagnostik', label: 'Cek Kesiapan' },
    { id: 'stimulasi', label: 'Stimulasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'koleksi', label: 'Lab Petak' },
    { id: 'olahPersegi', label: 'Olah Persegi' },
    { id: 'olahJajar', label: 'Olah Jajargenjang' },
    { id: 'olahTrapesium', label: 'Olah Trapesium' },
    { id: 'olahDiagonal', label: 'Olah Diagonal' },
    { id: 'verifikasi', label: 'Verifikasi' },
    { id: 'generalisasi', label: 'Generalisasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Label konteks soal (ikon + nama). */
  konteks: {
    taman: { ikon: '🌱', nama: 'Taman' },
    rumah: { ikon: '🏠', nama: 'Rumah' },
    sekolah: { ikon: '🏫', nama: 'Sekolah' },
    kerajinan: { ikon: '✂️', nama: 'Kerajinan' },
    olahraga: { ikon: '⚽', nama: 'Olahraga' },
  },

  /* ----------------------------------------------------------
     TAHAP 0 — ASESMEN DIAGNOSTIK
     Butir sekali-jawab berpembahasan; tidak dinilai. Hasil diringkas
     per indikator prasyarat (ringkasDiagnostik).
     ---------------------------------------------------------- */
  diagnostik: {
    kicker: 'Tahap 0 · Asesmen Diagnostik',
    syntax: 'Asesmen Diagnostik',
    goal: 'Mengecek bekal awal tentang bangun datar, keliling, luas, dan perhitungan sebelum mulai bereksplorasi.',
    tp: 'Menentukan keliling dan luas segitiga, persegi, persegi panjang, jajargenjang, trapesium, belah ketupat, dan layang-layang melalui kegiatan eksplorasi.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Membedakan keliling (panjang seluruh tepi) dan luas (banyak petak satuan yang menutupi daerah) beserta satuannya.',
      'Menemukan rumus keliling dan luas persegi serta persegi panjang dengan menghitung ruas dan petak satuan.',
      'Menemukan rumus luas jajargenjang, segitiga, dan trapesium dengan memotong dan menyusunnya menjadi persegi panjang atau jajargenjang.',
      'Menemukan rumus luas belah ketupat dan layang-layang dari kedua diagonalnya.',
      'Menentukan keliling dan luas ketujuh bangun datar untuk menyelesaikan masalah sehari-hari.',
    ],
    guru: 'Asesmen diagnostik dikerjakan mandiri ± 8 menit dan TIDAK masuk nilai. Gunakan profil kesiapan untuk membentuk pasangan heterogen dan menentukan murid yang perlu didampingi, misalnya yang belum membedakan keliling dan luas atau belum mengenal tinggi.',
    judul: 'Cek kesiapan sebelum menjelajah',
    pengantar:
      'Jawab sembilan pertanyaan singkat berikut. Ini bukan ulangan — setiap jawaban langsung dibahas, dan hasilnya membantumu serta gurumu mengetahui bagian yang perlu diperkuat.',
    indikator: [
      {
        id: 'iBangun',
        label: 'Mengenal nama dan sifat bangun datar',
        saran:
          'Ulas kembali ciri tujuh bangun datar (sisi sejajar, sisi sama panjang, diagonal) dengan melihat gambar di Lab Petak dan Lab Potong-Susun.',
      },
      {
        id: 'iKeliling',
        label: 'Memahami keliling sebagai panjang tepi',
        saran:
          'Telusuri tepi buku atau meja dengan jari sambil menjumlahkan panjang setiap sisinya sampai kembali ke titik awal.',
      },
      {
        id: 'iLuas',
        label: 'Memahami luas sebagai banyak petak satuan',
        saran:
          'Hitung petak pada kertas berpetak. Ingat: luas = banyak petak yang menutupi daerah, satuannya persegi (cm², m²).',
      },
      {
        id: 'iTinggi',
        label: 'Mengenal tinggi bangun',
        saran:
          'Pakai pojok kertas sebagai penggaris siku: tinggi adalah garis dari puncak ke alas yang membentuk sudut siku-siku.',
      },
      {
        id: 'iHitung',
        label: 'Perkalian dan setengah dari bilangan',
        saran:
          'Latih perkalian dan membagi dua, mis. ½ × 8 × 5 = 4 × 5 = 20. Kerjakan yang di dalam kurung lebih dulu.',
      },
    ],
    butir: [
      {
        id: 'dNama',
        indikator: 'iBangun',
        gambar: {
          jenis: 'jajargenjang',
          ukuran: { a: 5, t: 3, g: 2 },
          aria: 'Gambar sebuah segi empat yang condong ke kanan.',
        },
        tanya: 'Apa nama bangun pada gambar ini?',
        opsi: [
          { id: 'jajar', label: 'Jajargenjang' },
          { id: 'trapesium', label: 'Trapesium' },
          { id: 'belah', label: 'Belah ketupat' },
          { id: 'pp', label: 'Persegi panjang' },
        ],
        correct: 'jajar',
        pembahasan:
          'Jajargenjang mempunyai dua pasang sisi sejajar yang sama panjang, tetapi sudutnya tidak siku-siku.',
      },
      {
        id: 'dSejajar',
        indikator: 'iBangun',
        tanya: 'Segi empat yang hanya mempunyai SEPASANG sisi sejajar adalah …',
        opsi: [
          { id: 'trapesium', label: 'Trapesium' },
          { id: 'jajar', label: 'Jajargenjang' },
          { id: 'layang', label: 'Layang-layang' },
          { id: 'persegi', label: 'Persegi' },
        ],
        correct: 'trapesium',
        pembahasan:
          'Trapesium hanya mempunyai sepasang sisi sejajar. Jajargenjang dan persegi mempunyai dua pasang; layang-layang tidak punya sisi sejajar.',
      },
      {
        id: 'dDiagonal',
        indikator: 'iBangun',
        tanya: 'Kedua diagonal belah ketupat dan kedua diagonal layang-layang sama-sama …',
        opsi: [
          { id: 'tegak', label: 'saling tegak lurus' },
          { id: 'sama', label: 'sama panjang' },
          { id: 'sejajar', label: 'sejajar' },
          { id: 'tidak', label: 'tidak berpotongan' },
        ],
        correct: 'tegak',
        pembahasan:
          'Diagonal belah ketupat dan layang-layang berpotongan membentuk sudut siku-siku (tegak lurus). Panjangnya boleh berbeda.',
      },
      {
        id: 'dPita',
        indikator: 'iKeliling',
        gambar: {
          jenis: 'persegiPanjang',
          ukuran: { p: 5, l: 3 },
          label: { sisi: true },
          satuan: 'm',
        },
        tanya:
          'Pak Budi memasang pita di sepanjang tepi papan pengumuman ini. Berapa panjang pita yang diperlukan?',
        opsi: [
          { id: 'k16', label: '16 m' },
          { id: 'k15', label: '15 m' },
          { id: 'k8', label: '8 m' },
          { id: 'k30', label: '30 m' },
        ],
        correct: 'k16',
        pembahasan: '5 + 3 + 5 + 3 = 16 m. Keliling adalah panjang SEMUA tepi yang dijumlahkan.',
      },
      {
        id: 'dPetak',
        indikator: 'iLuas',
        gambar: { jenis: 'persegiPanjang', ukuran: { p: 4, l: 3 }, petak: true },
        tanya: 'Daerah ini ditutupi petak-petak satuan. Berapa banyak petaknya?',
        opsi: [
          { id: 'p12', label: '12 petak' },
          { id: 'p14', label: '14 petak' },
          { id: 'p7', label: '7 petak' },
          { id: 'p10', label: '10 petak' },
        ],
        correct: 'p12',
        pembahasan:
          'Ada 3 baris, masing-masing 4 petak: 3 × 4 = 12 petak. Banyak petak yang menutupi daerah itulah luasnya.',
      },
      {
        id: 'dSatuan',
        indikator: 'iLuas',
        tanya: 'Satuan yang tepat untuk menyatakan luas lantai kelas adalah …',
        opsi: [
          { id: 'm2', label: 'm² (meter persegi)' },
          { id: 'm', label: 'm (meter)' },
          { id: 'kg', label: 'kg (kilogram)' },
          { id: 'l', label: 'L (liter)' },
        ],
        correct: 'm2',
        pembahasan:
          'Luas diukur dengan petak persegi bersisi 1 m, yaitu meter persegi (m²). Meter (m) dipakai untuk panjang dan keliling.',
      },
      {
        id: 'dTinggi',
        indikator: 'iTinggi',
        tanya: 'Tinggi sebuah segitiga adalah …',
        opsi: [
          { id: 'tegak', label: 'ruas garis dari titik puncak yang tegak lurus alas' },
          { id: 'panjang', label: 'sisi terpanjang segitiga' },
          { id: 'miring', label: 'sisi miring di sebelah kiri' },
          { id: 'alas', label: 'jarak dari ujung alas ke ujung alas yang lain' },
        ],
        correct: 'tegak',
        pembahasan:
          'Tinggi selalu tegak lurus (membentuk sudut siku-siku) terhadap alas. Sisi miring bukan tinggi.',
      },
      {
        id: 'dSetengah',
        indikator: 'iHitung',
        tanya: '½ × 8 × 5 = …',
        opsi: [
          { id: 'h20', label: '20' },
          { id: 'h40', label: '40' },
          { id: 'h13', label: '13' },
          { id: 'h6', label: '6,5' },
        ],
        correct: 'h20',
        pembahasan: '½ × 8 = 4, lalu 4 × 5 = 20.',
      },
      {
        id: 'dKurung',
        indikator: 'iHitung',
        tanya: '(6 + 4) × 3 = …',
        opsi: [
          { id: 'h30', label: '30' },
          { id: 'h18', label: '18' },
          { id: 'h13', label: '13' },
          { id: 'h24', label: '24' },
        ],
        correct: 'h30',
        pembahasan: 'Kerjakan yang di dalam kurung lebih dulu: 6 + 4 = 10, lalu 10 × 3 = 30.',
      },
    ],
    pesan: {
      siap: 'Bekalmu sudah kuat — kamu siap bereksplorasi!',
      sebagian: 'Bekalmu cukup. Perhatikan saran pada indikator bertanda ! selama bereksplorasi.',
      perlu:
        'Tidak apa-apa! Baca saran di bawah dan mintalah pendampingan guru — eksplorasi hari ini akan membantumu.',
    },
    nextLabel: 'Lanjut: Stimulasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; dibandingkan dengan data pada tahap
     Verifikasi. `baku` = jawaban menurut engine (lihat cek).
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati denah petak taman sekolah, lalu menduga panjang pagar dan luas rumput yang diperlukan.',
    guru: 'Tampilkan denah taman. Minta pasangan murid menduga tanpa menghitung rumit. Jangan membenarkan atau menyalahkan — perbedaan dugaan (mis. "luas jajargenjang = 6 × 5 = 30 m²" atau "luas sama berarti pagarnya juga sama") justru menjadi bahan penemuan.',
    judul: 'Proyek Taman Sekolah Kelas VII',
    pengantar:
      'OSIS mengajak Kelas VII merancang taman sekolah. Setiap petak taman berbentuk bangun datar. Tepi petak akan dipagari bambu (perlu tahu KELILING-nya) dan permukaannya ditanami rumput (perlu tahu LUAS-nya). Amati denah tujuh petak berikut.',
    petak: [
      {
        id: 'pMawar',
        jenis: 'persegi',
        ukuran: { s: 6 },
        nama: 'Petak Mawar',
        label: { sisi: [0] },
      },
      {
        id: 'pMelati',
        jenis: 'persegiPanjang',
        ukuran: { p: 9, l: 4 },
        nama: 'Petak Melati',
        label: { sisi: true },
      },
      {
        id: 'pAnggrek',
        jenis: 'jajargenjang',
        ukuran: { a: 6, t: 4, g: 3 },
        nama: 'Petak Anggrek',
        label: { sisi: true, tinggi: true },
      },
      {
        id: 'pKaktus',
        jenis: 'segitiga',
        ukuran: { a: 8, t: 3, g: 4 },
        nama: 'Petak Kaktus',
        label: { sisi: true, tinggi: true },
      },
      {
        id: 'pKolam',
        jenis: 'trapesium',
        ukuran: { a: 12, b: 6, t: 4, g: 3 },
        nama: 'Kolam Ikan',
        label: { sisi: [0, 2], tinggi: true },
      },
      {
        id: 'pLidah',
        jenis: 'belahKetupat',
        ukuran: { d1: 6, d2: 8 },
        nama: 'Petak Lidah Buaya',
        label: { diagonal: true },
      },
      {
        id: 'pKemangi',
        jenis: 'layangLayang',
        ukuran: { d1: 16, d2: 21, y: 6 },
        nama: 'Petak Kemangi',
        label: { diagonal: true },
      },
    ],
    dugaan: [
      {
        id: 'dPagar',
        tanya:
          'Petak Mawar (persegi 6 m × 6 m) dan Petak Melati (persegi panjang 9 m × 4 m): mana yang memerlukan pagar bambu lebih panjang?',
        opsi: [
          { id: 'melati', label: 'Petak Melati' },
          { id: 'mawar', label: 'Petak Mawar' },
          { id: 'sama', label: 'Sama panjang' },
        ],
        baku: 'melati',
        banding: { minta: 'keliling', petak: ['pMawar', 'pMelati'] },
        pembahasan:
          'Pagar Petak Mawar 6 + 6 + 6 + 6 = 24 m, Petak Melati 9 + 4 + 9 + 4 = 26 m. Petak Melati lebih panjang.',
      },
      {
        id: 'dRumput',
        tanya: 'Dari kedua petak itu, mana yang memerlukan rumput lebih banyak?',
        opsi: [
          { id: 'sama', label: 'Sama banyak' },
          { id: 'melati', label: 'Petak Melati' },
          { id: 'mawar', label: 'Petak Mawar' },
        ],
        baku: 'sama',
        banding: { minta: 'luas', petak: ['pMawar', 'pMelati'] },
        pembahasan:
          'Luas Petak Mawar 6 × 6 = 36 m² dan Petak Melati 9 × 4 = 36 m². Luasnya sama, padahal kelilingnya berbeda!',
      },
      {
        id: 'dAnggrek',
        tanya:
          'Petak Anggrek berbentuk jajargenjang: alas 6 m, sisi miring 5 m, tinggi 4 m. Berapa luasnya?',
        opsi: [
          { id: 'a24', label: '24 m²' },
          { id: 'a30', label: '30 m² (alas × sisi miring)' },
          { id: 'a12', label: '12 m² (setengah dari alas × tinggi)' },
          { id: 'a22', label: '22 m²' },
        ],
        baku: 'a24',
        cek: { jenis: 'jajargenjang', ukuran: { a: 6, t: 4, g: 3 }, minta: 'luas' },
        pembahasan:
          'Jajargenjang yang dipotong dan digeser menjadi persegi panjang 6 m × 4 m, jadi luasnya 24 m². Sisi miring tidak dipakai.',
      },
      {
        id: 'dLidah',
        tanya:
          'Petak Lidah Buaya berbentuk belah ketupat dengan diagonal 6 m dan 8 m. Berapa luasnya?',
        opsi: [
          { id: 'b24', label: '24 m²' },
          { id: 'b48', label: '48 m² (6 × 8)' },
          { id: 'b25', label: '25 m² (sisi × sisi)' },
          { id: 'b14', label: '14 m² (6 + 8)' },
        ],
        baku: 'b24',
        cek: { jenis: 'belahKetupat', ukuran: { d1: 6, d2: 8 }, minta: 'luas' },
        pembahasan:
          'Belah ketupat menempati tepat setengah persegi panjang 6 m × 8 m, jadi luasnya ½ × 6 × 8 = 24 m².',
      },
    ],
    alasanLabel: 'Bagaimana kamu menduganya? Tulis singkat caramu.',
    alasanPlaceholder: 'Contoh: aku menjumlahkan semua sisinya, lalu …',
    catatan:
      'Dugaan ini belum dinilai. Kalian akan memeriksanya sendiri dengan menghitung petak, memotong, dan menyusun bangun.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — PROBLEM STATEMENT
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Memilih pertanyaan inti yang akan diselidiki dan menuliskan dugaan sementara.',
    guru: 'Ajak murid membedakan pertanyaan yang hanya menanyakan satu petak dengan pertanyaan yang berlaku untuk semua bangun. Hipotesis boleh keliru — yang penting dapat diuji dengan eksplorasi.',
    pengantar:
      'Dugaan kalian di tahap 1 bisa berbeda-beda. Agar dapat memastikannya untuk SEMUA petak, kita perlu pertanyaan penyelidikan yang tepat.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'mInti',
        label:
          'Bagaimana cara menentukan keliling dan luas setiap bangun datar, dan apa hubungan luasnya dengan luas persegi panjang?',
      },
      { id: 'mHarga', label: 'Berapa harga satu batang bambu di toko bangunan?' },
      { id: 'mSatu', label: 'Berapa luas Petak Mawar saja?' },
      { id: 'mSama', label: 'Apakah semua petak taman sebaiknya berbentuk persegi?' },
    ],
    correct: 'mInti',
    umpan: {
      mInti:
        'Tepat! Pertanyaan ini menyelidiki cara menentukan keliling dan luas untuk ketujuh bangun sekaligus.',
      mHarga:
        'Harga bambu penting untuk belanja, tetapi tidak menjawab berapa panjang pagar dan luas rumput yang diperlukan.',
      mSatu:
        'Pertanyaan ini hanya untuk satu petak. Kita ingin cara yang berlaku untuk semua bangun.',
      mSama: 'Itu soal selera desain. Pilih pertanyaan tentang cara menentukan keliling dan luas.',
    },
    hipotesisLabel:
      'Tulis dugaan sementaramu (hipotesis) tentang cara menentukan luas bangun-bangun itu.',
    hipotesisPlaceholder:
      'Contoh: aku menduga luas jajargenjang bisa dicari seperti persegi panjang, yaitu …',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — DATA COLLECTION (Lab Petak)
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Mengumpulkan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengatur ukuran persegi panjang dan persegi, lalu menghitung dan mencatat keliling serta luasnya.',
    guru: 'Murid bergantian: satu mengatur ukuran dan menunjuk, satu lagi menghitung dan mencatat. Dorong murid mencoba ukuran besar (mis. 10 × 7) agar merasa perlu cara cepat selain menghitung satu per satu. Pesan diagnosa (mis. keliling dan luas tertukar) dapat diangkat dalam diskusi kelas.',
    pengantar:
      'Atur panjang dan lebar dengan tombol − dan +. Nyalakan petak satuan untuk menghitung LUAS dan tanda satuan panjang untuk menghitung KELILING. Catat paling sedikit tiga ukuran berbeda untuk persegi panjang dan tiga untuk persegi.',
    lab: {
      mode: 'petak',
      jenisList: ['persegiPanjang', 'persegi'],
      ukuran: {
        persegiPanjang: {
          p: { min: 1, max: 10, awal: 5 },
          l: { min: 1, max: 7, awal: 3 },
        },
        persegi: { s: { min: 1, max: 8, awal: 4 } },
      },
      minta: ['keliling', 'luas'],
      minCatat: 3,
    },
    tips: [
      'Keliling: telusuri tepi bangun dan hitung ruas satuan sampai kembali ke titik awal.',
      'Luas: hitung petak satuan yang menutupi bangun. Adakah cara lebih cepat daripada menghitung satu per satu?',
      'Coba ukuran yang besar. Perhatikan hubungan bilanganmu dengan panjang dan lebarnya.',
    ],
    selesaiTeks:
      'Data persegi panjang dan persegi sudah tercatat. Sekarang olah datanya: cari hubungan keliling dan luas dengan ukurannya.',
    nextLabel: 'Lanjut: Olah Data Persegi →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — DATA PROCESSING: persegi panjang & persegi
     ---------------------------------------------------------- */
  olahPersegi: {
    kicker: 'Tahap 4a · Mengolah Data Persegi Panjang & Persegi',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan rumus keliling dan luas persegi panjang serta persegi dari catatan Lab Petak.',
    guru: 'Minta murid membandingkan kolom p, l, K, dan L di tabel catatan mereka sendiri. Tanyakan: "Berapa petak dalam satu baris? Ada berapa baris?" untuk memunculkan p × l. Tekankan bahwa persegi adalah persegi panjang khusus (p = l = s).',
    pengantar:
      'Ini catatanmu dari Lab Petak. Bandingkan bilangan keliling dan luas dengan panjang serta lebarnya.',
    temuan: [
      {
        id: 'tpKeliling',
        tanya: 'Dari catatanmu, bagaimana keliling persegi panjang diperoleh dari p dan l?',
        opsi: [
          { id: 'dua', label: 'K = p + l + p + l = 2 × (p + l)' },
          { id: 'kali', label: 'K = p × l' },
          { id: 'tambah', label: 'K = p + l' },
          { id: 'empat', label: 'K = 4 × p' },
        ],
        correct: 'dua',
        umpan: {
          dua: 'Tepat! Tepi persegi panjang terdiri atas dua panjang dan dua lebar.',
          kali: 'p × l adalah banyak petak (luas). Keliling adalah panjang tepinya.',
          tambah: 'p + l baru setengah tepinya. Telusuri terus sampai kembali ke titik awal.',
          empat: '4 × p hanya benar bila panjang dan lebarnya sama (persegi).',
        },
      },
      {
        id: 'tpLuas',
        tanya: 'Bagaimana luas (banyak petak) diperoleh dari p dan l?',
        opsi: [
          { id: 'kali', label: 'L = p × l, karena ada l baris yang masing-masing berisi p petak' },
          { id: 'dua', label: 'L = 2 × (p + l)' },
          { id: 'tambah', label: 'L = p + l' },
          { id: 'kuadrat', label: 'L = p × p' },
        ],
        correct: 'kali',
        umpan: {
          kali: 'Tepat! Menghitung baris demi baris sama dengan mengalikan.',
          dua: '2 × (p + l) adalah kelilingnya, bukan banyak petak.',
          tambah: 'Coba ukuran 5 × 3: ada 15 petak, bukan 8.',
          kuadrat: 'p × p hanya benar bila lebarnya sama dengan panjangnya.',
        },
      },
      {
        id: 'tpPersegi',
        tanya:
          'Persegi adalah persegi panjang yang panjang dan lebarnya sama (s). Jadi rumus persegi adalah …',
        opsi: [
          { id: 'tepat', label: 'K = 4 × s dan L = s × s' },
          { id: 'tukar', label: 'K = s × s dan L = 4 × s' },
          { id: 'dua', label: 'K = 2 × s dan L = 2 × s' },
          { id: 'empat', label: 'K = 4 × s dan L = 4 × s' },
        ],
        correct: 'tepat',
        umpan: {
          tepat: 'Tepat! Ganti p dan l dengan s: K = 2 × (s + s) = 4 × s, L = s × s.',
          tukar: 'Rumusnya tertukar. Keliling = panjang tepi, luas = banyak petak.',
          dua: 'Persegi punya EMPAT sisi, dan luasnya s baris berisi s petak.',
          empat: 'Kelilingnya benar, tetapi luasnya s × s, bukan 4 × s.',
        },
      },
    ],
    langkah: [
      {
        id: 'lpMelatiK',
        label: 'Berapa panjang pagar Petak Melati (persegi panjang 9 m × 4 m)?',
        cek: { jenis: 'persegiPanjang', ukuran: { p: 9, l: 4 }, minta: 'keliling' },
        satuan: 'm',
        hints: ['Jumlahkan semua sisinya: p + l + p + l.', '2 × (9 + 4) = …'],
        temuan: 'Benar, 26 m: 2 × (9 + 4) = 26.',
      },
      {
        id: 'lpMelatiL',
        label: 'Berapa luas rumput Petak Melati?',
        cek: { jenis: 'persegiPanjang', ukuran: { p: 9, l: 4 }, minta: 'luas' },
        satuan: 'm²',
        hints: ['Ada 4 baris yang masing-masing berisi 9 petak.', '9 × 4 = …'],
        temuan: 'Benar, 36 m²: 9 × 4 = 36.',
      },
      {
        id: 'lpMawarK',
        label: 'Berapa panjang pagar Petak Mawar (persegi bersisi 6 m)?',
        cek: { jenis: 'persegi', ukuran: { s: 6 }, minta: 'keliling' },
        satuan: 'm',
        hints: ['Persegi punya empat sisi yang sama panjang.', '4 × 6 = …'],
        temuan: 'Benar, 24 m: 4 × 6 = 24.',
      },
      {
        id: 'lpMawarL',
        label: 'Berapa luas rumput Petak Mawar?',
        cek: { jenis: 'persegi', ukuran: { s: 6 }, minta: 'luas' },
        satuan: 'm²',
        hints: ['Luas persegi = s × s.', '6 × 6 = …'],
        temuan:
          'Benar, 36 m² — sama dengan Petak Melati, padahal kelilingnya berbeda (24 m dan 26 m)!',
      },
    ],
    rumus: ['persegiPanjang', 'persegi'],
    nextLabel: 'Lanjut: Olah Jajargenjang & Segitiga →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — DATA PROCESSING: jajargenjang & segitiga
     ---------------------------------------------------------- */
  olahJajar: {
    kicker: 'Tahap 4b · Mengolah Data Jajargenjang & Segitiga',
    syntax: DL + ' · Sintaks 4',
    goal: 'Memotong-menyusun jajargenjang dan segitiga untuk menemukan rumus luasnya.',
    guru: 'Bila memungkinkan, sediakan jajargenjang kertas dan gunting agar murid memotong sendiri. Tanyakan: "Apakah ada petak yang hilang setelah digeser?" dan "Mengapa sisi miring tidak dipakai?" Untuk segitiga, tegaskan bahwa yang dihitung hanya SATU dari dua segitiga.',
    pengantar:
      'Gunakan Lab Potong-Susun. Jalankan langkah 1 sampai 3, lalu hitung luas bangun aslinya. Coba paling sedikit dua ukuran untuk jajargenjang dan dua untuk segitiga.',
    lab: {
      mode: 'potong',
      jenisList: ['jajargenjang', 'segitiga'],
      ukuran: {
        jajargenjang: {
          a: { min: 2, max: 9, awal: 6 },
          t: { min: 1, max: 6, awal: 4 },
        },
        segitiga: {
          a: { min: 2, max: 9, awal: 6 },
          t: { min: 1, max: 6, awal: 4 },
        },
      },
      minta: ['luas'],
      minCatat: 2,
    },
    temuan: [
      {
        id: 'tjLuas',
        tanya:
          'Setelah dipotong dan digeser, jajargenjang menjadi persegi panjang yang panjangnya … dan lebarnya …',
        opsi: [
          { id: 'tepat', label: 'alas (a) dan tinggi (t), jadi L = a × t' },
          { id: 'miring', label: 'alas dan sisi miring, jadi L = a × b' },
          { id: 'setengah', label: 'alas dan tinggi, lalu luasnya dibagi 2' },
          { id: 'tukar', label: 'sisi miring dan tinggi' },
        ],
        correct: 'tepat',
        umpan: {
          tepat: 'Tepat! Tidak ada petak yang hilang, jadi luas jajargenjang = a × t.',
          miring:
            'Lihat lagi langkah 3: lebar persegi panjang itu adalah garis tinggi, bukan sisi miring.',
          setengah:
            'Jajargenjang berubah menjadi SATU persegi panjang utuh — tidak ada yang dibagi dua.',
          tukar: 'Panjang persegi panjang itu sama dengan alas jajargenjang.',
        },
      },
      {
        id: 'tjMiring',
        tanya: 'Mengapa sisi miring TIDAK dipakai untuk menghitung luas jajargenjang?',
        opsi: [
          {
            id: 'lebar',
            label: 'Lebar persegi panjang hasil susunan adalah tinggi, bukan sisi miring',
          },
          { id: 'pendek', label: 'Sisi miring selalu lebih pendek daripada tinggi' },
          { id: 'ukur', label: 'Sisi miring tidak dapat diukur' },
          { id: 'segitiga', label: 'Sisi miring hanya dipakai untuk segitiga' },
        ],
        correct: 'lebar',
        umpan: {
          lebar: 'Tepat! Sisi miring tetap dipakai untuk KELILING, tetapi tidak untuk luas.',
          pendek:
            'Justru sebaliknya: sisi miring lebih panjang daripada tinggi. Bandingkan pada gambar.',
          ukur: 'Sisi miring dapat diukur, dan dipakai untuk menghitung keliling.',
          segitiga: 'Luas segitiga juga memakai tinggi, bukan sisi miring.',
        },
      },
      {
        id: 'tsLuas',
        tanya:
          'Dua segitiga yang sama membentuk jajargenjang beralas a dan bertinggi t. Jadi luas SATU segitiga adalah …',
        opsi: [
          { id: 'tepat', label: '½ × a × t' },
          { id: 'penuh', label: 'a × t' },
          { id: 'dua', label: '2 × a × t' },
          { id: 'tambah', label: 'a + t' },
        ],
        correct: 'tepat',
        umpan: {
          tepat: 'Tepat! Satu segitiga = setengah jajargenjang = ½ × a × t.',
          penuh: 'a × t adalah luas jajargenjang yang dibentuk DUA segitiga.',
          dua: 'Luas satu segitiga lebih kecil, bukan lebih besar, daripada jajargenjangnya.',
          tambah: 'Luas diperoleh dari perkalian petak, bukan penjumlahan ukuran.',
        },
      },
    ],
    langkah: [
      {
        id: 'ljAnggrekL',
        label:
          'Petak Anggrek berbentuk jajargenjang: alas 6 m, sisi miring 5 m, tinggi 4 m. Berapa luasnya?',
        cek: { jenis: 'jajargenjang', ukuran: { a: 6, t: 4, g: 3 }, minta: 'luas' },
        satuan: 'm²',
        hints: ['Luas jajargenjang = alas × tinggi.', '6 × 4 = …'],
        temuan: 'Benar, 24 m². Sisi miring 5 m tidak dipakai untuk luas.',
      },
      {
        id: 'ljAnggrekK',
        label: 'Berapa panjang pagar Petak Anggrek?',
        cek: { jenis: 'jajargenjang', ukuran: { a: 6, t: 4, g: 3 }, minta: 'keliling' },
        satuan: 'm',
        hints: [
          'Keliling memakai sisi-sisinya: dua alas dan dua sisi miring.',
          '6 + 5 + 6 + 5 = …',
        ],
        temuan: 'Benar, 22 m: 2 × (6 + 5). Untuk keliling, sisi miring dipakai, tinggi tidak.',
      },
      {
        id: 'lsKaktusL',
        label:
          'Petak Kaktus berbentuk segitiga: alas 8 m, tinggi 3 m, kedua sisi miringnya 5 m. Berapa luasnya?',
        cek: { jenis: 'segitiga', ukuran: { a: 8, t: 3, g: 4 }, minta: 'luas' },
        satuan: 'm²',
        hints: ['Luas segitiga = ½ × alas × tinggi.', '½ × 8 × 3 = 4 × 3 = …'],
        temuan: 'Benar, 12 m²: ½ × 8 × 3.',
      },
      {
        id: 'lsKaktusK',
        label: 'Berapa panjang pagar Petak Kaktus?',
        cek: { jenis: 'segitiga', ukuran: { a: 8, t: 3, g: 4 }, minta: 'keliling' },
        satuan: 'm',
        hints: ['Jumlahkan ketiga sisinya.', '8 + 5 + 5 = …'],
        temuan: 'Benar, 18 m: 8 + 5 + 5.',
      },
    ],
    rumus: ['jajargenjang', 'segitiga'],
    nextLabel: 'Lanjut: Olah Trapesium →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — DATA PROCESSING: trapesium
     ---------------------------------------------------------- */
  olahTrapesium: {
    kicker: 'Tahap 4c · Mengolah Data Trapesium',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menyusun dua trapesium yang sama menjadi jajargenjang untuk menemukan rumus luas trapesium.',
    guru: 'Arahkan perhatian murid ke alas jajargenjang hasil susunan: terdiri atas sisi sejajar bawah satu trapesium dan sisi sejajar atas trapesium lainnya. Bandingkan dengan cara segitiga di tahap sebelumnya.',
    pengantar:
      'Gunakan Lab Potong-Susun untuk trapesium. Ubah ukurannya dan catat luas paling sedikit dua trapesium berbeda.',
    lab: {
      mode: 'potong',
      jenisList: ['trapesium'],
      ukuran: {
        trapesium: {
          a: { min: 3, max: 10, awal: 7 },
          b: { min: 1, max: 6, awal: 3 },
          t: { min: 1, max: 6, awal: 3 },
        },
      },
      minta: ['luas'],
      minCatat: 2,
    },
    temuan: [
      {
        id: 'ttAlas',
        tanya:
          'Dua trapesium yang sama disusun menjadi jajargenjang. Alas jajargenjang itu adalah …',
        opsi: [
          { id: 'jumlah', label: 'a + b (jumlah kedua sisi sejajar)' },
          { id: 'a', label: 'a saja' },
          { id: 'kali', label: 'a × b' },
          { id: 'miring', label: 'sisi miring trapesium' },
        ],
        correct: 'jumlah',
        umpan: {
          jumlah:
            'Tepat! Sisi bawah trapesium pertama bersambung dengan sisi atas trapesium kedua.',
          a: 'Amati langkah 3: alasnya lebih panjang daripada a.',
          kali: 'Kedua sisi itu bersambung (dijumlahkan), tidak dikalikan.',
          miring: 'Sisi miring menjadi sisi samping jajargenjang, bukan alasnya.',
        },
      },
      {
        id: 'ttLuas',
        tanya: 'Jadi luas SATU trapesium adalah …',
        opsi: [
          { id: 'tepat', label: '½ × (a + b) × t' },
          { id: 'penuh', label: '(a + b) × t' },
          { id: 'kali', label: '½ × a × b × t' },
          { id: 'satu', label: 'a × t' },
        ],
        correct: 'tepat',
        umpan: {
          tepat: 'Tepat! Satu trapesium = setengah jajargenjang beralas a + b.',
          penuh: '(a + b) × t adalah luas jajargenjang dari DUA trapesium.',
          kali: 'Kedua sisi sejajar dijumlahkan dulu, bukan dikalikan.',
          satu: 'Trapesium punya dua sisi sejajar; keduanya ikut menentukan luas.',
        },
      },
      {
        id: 'ttKeliling',
        tanya: 'Bagaimana menentukan keliling trapesium?',
        opsi: [
          { id: 'jumlah', label: 'Menjumlahkan keempat sisinya: a + b + c + d' },
          { id: 'dua', label: '2 × (a + b)' },
          { id: 'luas', label: '½ × (a + b) × t' },
          { id: 'tinggi', label: 'a + b + t' },
        ],
        correct: 'jumlah',
        umpan: {
          jumlah: 'Tepat! Keliling semua bangun = jumlah semua sisinya.',
          dua: 'Sisi-sisi trapesium belum tentu berpasangan sama panjang.',
          luas: 'Itu rumus luas, bukan keliling.',
          tinggi: 'Tinggi ada di dalam bangun, bukan di tepinya.',
        },
      },
    ],
    langkah: [
      {
        id: 'ltKolamL',
        label:
          'Kolam Ikan berbentuk trapesium: sisi sejajar 12 m dan 6 m, tinggi 4 m. Berapa luasnya?',
        cek: { jenis: 'trapesium', ukuran: { a: 12, b: 6, t: 4, g: 3 }, minta: 'luas' },
        satuan: 'm²',
        hints: ['Jumlahkan sisi sejajarnya dulu: 12 + 6 = 18.', '½ × 18 × 4 = …'],
        temuan: 'Benar, 36 m²: ½ × (12 + 6) × 4.',
      },
      {
        id: 'ltKolamK',
        label: 'Kedua sisi miring Kolam Ikan masing-masing 5 m. Berapa keliling kolam itu?',
        cek: { jenis: 'trapesium', ukuran: { a: 12, b: 6, t: 4, g: 3 }, minta: 'keliling' },
        satuan: 'm',
        hints: ['Jumlahkan keempat sisinya.', '12 + 5 + 6 + 5 = …'],
        temuan: 'Benar, 28 m: 12 + 5 + 6 + 5.',
      },
      {
        id: 'ltTinggi',
        label:
          'Kolam lain berbentuk trapesium dengan sisi sejajar 10 m dan 6 m serta luas 40 m². Berapa tingginya?',
        cek: {
          jenis: 'trapesium',
          ukuran: { a: 10, b: 6, t: 5, g: 2 },
          minta: 'ukuran',
          cari: 't',
          dari: 'luas',
        },
        satuan: 'm',
        hints: [
          '½ × (10 + 6) × t = 40, jadi 8 × t = 40.',
          'Bilangan berapa yang dikali 8 hasilnya 40?',
        ],
        temuan: 'Benar, 5 m: ½ × 16 × 5 = 40.',
      },
    ],
    rumus: ['trapesium'],
    nextLabel: 'Lanjut: Olah Belah Ketupat & Layang-layang →',
  },

  /* ----------------------------------------------------------
     TAHAP 4d — DATA PROCESSING: belah ketupat & layang-layang
     ---------------------------------------------------------- */
  olahDiagonal: {
    kicker: 'Tahap 4d · Mengolah Data Belah Ketupat & Layang-layang',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan rumus luas belah ketupat dan layang-layang dari kedua diagonalnya.',
    guru: 'Tunjukkan bahwa setiap segitiga siku-siku di dalam bangun punya "kembaran" di luar bangun (di dalam persegi panjang d₁ × d₂). Bandingkan dengan dugaan stimulasi "6 × 8 = 48 m²".',
    pengantar:
      'Gunakan Lab Potong-Susun untuk belah ketupat dan layang-layang. Catat luas paling sedikit dua ukuran untuk tiap bangun.',
    lab: {
      mode: 'potong',
      jenisList: ['belahKetupat', 'layangLayang'],
      ukuran: {
        belahKetupat: {
          d1: { min: 2, max: 10, awal: 6 },
          d2: { min: 2, max: 10, awal: 8 },
        },
        layangLayang: {
          d1: { min: 2, max: 10, awal: 6 },
          d2: { min: 3, max: 10, awal: 9 },
        },
      },
      minta: ['luas'],
      minCatat: 2,
    },
    temuan: [
      {
        id: 'tdBagian',
        tanya:
          'Persegi panjang di sekeliling bangun berukuran d₁ × d₂. Berapa bagian persegi panjang itu yang ditempati belah ketupat atau layang-layang?',
        opsi: [
          { id: 'setengah', label: 'Tepat setengahnya' },
          { id: 'penuh', label: 'Seluruhnya' },
          { id: 'seperempat', label: 'Seperempatnya' },
          { id: 'dua', label: 'Dua kalinya' },
        ],
        correct: 'setengah',
        umpan: {
          setengah: 'Tepat! Ada 4 segitiga di dalam dan 4 segitiga kembarannya di luar.',
          penuh: 'Lihat bagian oranye di luar bangun — persegi panjang tidak ditempati seluruhnya.',
          seperempat: 'Hitung segitiganya: 4 di dalam dan 4 di luar. Berapa bagian itu?',
          dua: 'Bangunnya berada di DALAM persegi panjang, jadi lebih kecil.',
        },
      },
      {
        id: 'tdLuas',
        tanya: 'Jadi luas belah ketupat dan layang-layang adalah …',
        opsi: [
          { id: 'tepat', label: '½ × d₁ × d₂' },
          { id: 'penuh', label: 'd₁ × d₂' },
          { id: 'sisi', label: 's × s' },
          { id: 'tambah', label: 'd₁ + d₂' },
        ],
        correct: 'tepat',
        umpan: {
          tepat: 'Tepat! Rumus yang sama berlaku untuk belah ketupat DAN layang-layang.',
          penuh: 'd₁ × d₂ adalah luas persegi panjang di sekelilingnya.',
          sisi: 's × s hanya untuk persegi. Belah ketupat sudutnya tidak siku-siku.',
          tambah: 'Luas diperoleh dari perkalian, bukan penjumlahan diagonal.',
        },
      },
      {
        id: 'tdKeliling',
        tanya: 'Keliling belah ketupat yang panjang sisinya s adalah …',
        opsi: [
          { id: 'empat', label: '4 × s' },
          { id: 'diag', label: 'd₁ + d₂' },
          { id: 'diag2', label: '2 × (d₁ + d₂)' },
          { id: 'kuadrat', label: 's × s' },
        ],
        correct: 'empat',
        umpan: {
          empat: 'Tepat! Keempat sisi belah ketupat sama panjang.',
          diag: 'Diagonal berada di dalam bangun; keliling memakai sisi.',
          diag2: 'Diagonal bukan tepi bangun. Telusuri sisi-sisinya.',
          kuadrat: 's × s adalah luas persegi, bukan keliling belah ketupat.',
        },
      },
    ],
    langkah: [
      {
        id: 'ldLidahL',
        label:
          'Petak Lidah Buaya berbentuk belah ketupat dengan diagonal 6 m dan 8 m. Berapa luasnya?',
        cek: { jenis: 'belahKetupat', ukuran: { d1: 6, d2: 8 }, minta: 'luas' },
        satuan: 'm²',
        hints: ['Luas = ½ × d₁ × d₂.', '½ × 6 × 8 = 3 × 8 = …'],
        temuan: 'Benar, 24 m² — bukan 48 m² seperti dugaan "6 × 8".',
      },
      {
        id: 'ldLidahK',
        label: 'Setiap sisi Petak Lidah Buaya 5 m. Berapa panjang pagarnya?',
        cek: { jenis: 'belahKetupat', ukuran: { d1: 6, d2: 8 }, minta: 'keliling' },
        satuan: 'm',
        hints: ['Belah ketupat punya empat sisi sama panjang.', '4 × 5 = …'],
        temuan: 'Benar, 20 m: 4 × 5.',
      },
      {
        id: 'ldKemangiL',
        label:
          'Petak Kemangi berbentuk layang-layang dengan diagonal 16 m dan 21 m. Berapa luasnya?',
        cek: { jenis: 'layangLayang', ukuran: { d1: 16, d2: 21, y: 6 }, minta: 'luas' },
        satuan: 'm²',
        hints: ['Rumusnya sama dengan belah ketupat: ½ × d₁ × d₂.', '½ × 16 × 21 = 8 × 21 = …'],
        temuan: 'Benar, 168 m²: ½ × 16 × 21.',
      },
      {
        id: 'ldKemangiK',
        label: 'Sisi-sisi Petak Kemangi 10 m, 10 m, 17 m, dan 17 m. Berapa panjang pagarnya?',
        cek: { jenis: 'layangLayang', ukuran: { d1: 16, d2: 21, y: 6 }, minta: 'keliling' },
        satuan: 'm',
        hints: ['Layang-layang punya dua pasang sisi sama panjang.', '2 × (10 + 17) = …'],
        temuan: 'Benar, 54 m: 2 × (10 + 17).',
      },
    ],
    rumus: ['belahKetupat', 'layangLayang'],
    nextLabel: 'Lanjut: Verifikasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — VERIFICATION
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Verifikasi',
    syntax: DL + ' · Sintaks 5',
    goal: 'Memeriksa temuan pada bangun-bangun baru dan membandingkan dugaan awal dengan data.',
    guru: 'Murid memilah rumus luas tanpa melihat catatan. Bahas pernyataan "kadang-kadang benar" dengan contoh tandingan (mis. persegi panjang 12 × 1 dan 6 × 6). Tutup dengan membandingkan dugaan di tahap 1 dengan data.',
    judulA: 'A. Pilih rumus luas yang tepat',
    pengantarA:
      'Amati setiap bangun baru, lalu pilih rumus luasnya. Ingat bangun apa yang terbentuk saat bangun itu dipotong-susun.',
    kategori: [
      'panjangKaliLebar',
      'sisiKaliSisi',
      'alasTinggi',
      'setengahAlasTinggi',
      'setengahJumlahSejajar',
      'setengahDiagonal',
    ],
    bangun: [
      {
        id: 'vParkir',
        jenis: 'persegiPanjang',
        ukuran: { p: 7, l: 3 },
        teks: 'Halaman parkir berbentuk persegi panjang',
        explanation: 'Persegi panjang: l baris berisi p petak, jadi L = p × l.',
      },
      {
        id: 'vUbin',
        jenis: 'persegi',
        ukuran: { s: 4 },
        teks: 'Ubin lantai berbentuk persegi',
        explanation: 'Persegi adalah persegi panjang dengan p = l = s, jadi L = s × s.',
      },
      {
        id: 'vLadang',
        jenis: 'jajargenjang',
        ukuran: { a: 5, t: 3, g: 2 },
        teks: 'Ladang jagung berbentuk jajargenjang',
        explanation: 'Dipotong dan digeser menjadi persegi panjang a × t, jadi L = a × t.',
      },
      {
        id: 'vBendera',
        jenis: 'segitiga',
        ukuran: { a: 6, t: 4, g: 1 },
        teks: 'Bendera lomba berbentuk segitiga',
        explanation: 'Dua segitiga yang sama membentuk jajargenjang, jadi L = ½ × a × t.',
      },
      {
        id: 'vAtap',
        jenis: 'trapesium',
        ukuran: { a: 7, b: 3, t: 3, g: 2 },
        teks: 'Sisi atap rumah berbentuk trapesium',
        explanation:
          'Dua trapesium yang sama membentuk jajargenjang beralas a + b, jadi L = ½ × (a + b) × t.',
      },
      {
        id: 'vHiasan',
        jenis: 'belahKetupat',
        ukuran: { d1: 4, d2: 6 },
        teks: 'Hiasan dinding berbentuk belah ketupat',
        explanation:
          'Belah ketupat menempati setengah persegi panjang d₁ × d₂, jadi L = ½ × d₁ × d₂.',
      },
      {
        id: 'vLayang',
        jenis: 'layangLayang',
        ukuran: { d1: 4, d2: 6, y: 2 },
        teks: 'Layang-layang di lapangan',
        explanation:
          'Seperti belah ketupat, layang-layang menempati setengah persegi panjang d₁ × d₂: L = ½ × d₁ × d₂.',
      },
    ],
    judulB: 'B. Benar, salah, atau kadang-kadang benar?',
    opsiPernyataan: [
      { id: 'benar', label: 'Selalu benar' },
      { id: 'salah', label: 'Salah' },
      { id: 'kadang', label: 'Kadang-kadang benar' },
    ],
    pernyataan: [
      {
        id: 'nSamaLuas',
        teks: 'Dua petak yang luasnya sama pasti kelilingnya juga sama.',
        correct: 'salah',
        explanation:
          'Petak Mawar (6 m × 6 m) dan Petak Melati (9 m × 4 m) sama-sama 36 m², tetapi kelilingnya 24 m dan 26 m.',
      },
      {
        id: 'nPersegi',
        teks: 'Persegi termasuk persegi panjang yang panjang dan lebarnya sama, sehingga rumus p × l juga berlaku untuknya.',
        correct: 'benar',
        explanation: 'Dengan p = l = s, rumus p × l menjadi s × s.',
      },
      {
        id: 'nMiring',
        teks: 'Luas jajargenjang dapat dihitung dengan alas × sisi miring.',
        correct: 'kadang',
        explanation:
          'Hanya benar bila sisi miringnya tegak lurus alas (jajargenjang itu persegi panjang). Biasanya sisi miring lebih panjang daripada tinggi.',
      },
      {
        id: 'nSegitiga',
        teks: 'Luas segitiga adalah setengah luas jajargenjang yang alas dan tingginya sama.',
        correct: 'benar',
        explanation:
          'Dua segitiga yang sama selalu dapat disusun menjadi jajargenjang seperti itu.',
      },
      {
        id: 'nDiagonal',
        teks: 'Rumus ½ × d₁ × d₂ berlaku untuk belah ketupat dan juga layang-layang.',
        correct: 'benar',
        explanation:
          'Diagonal keduanya saling tegak lurus, sehingga keduanya menempati setengah persegi panjang d₁ × d₂.',
      },
      {
        id: 'nTrapesium',
        teks: 'Luas trapesium = a × t, dengan a sisi sejajar yang terpanjang.',
        correct: 'salah',
        explanation: 'Kedua sisi sejajar dipakai: L = ½ × (a + b) × t.',
      },
      {
        id: 'nLebihBesar',
        teks: 'Jika luas suatu persegi panjang lebih besar, kelilingnya pasti lebih besar.',
        correct: 'kadang',
        explanation:
          'Persegi panjang 6 × 6 (luas 36, keliling 24) lebih luas daripada 12 × 1 (luas 12, keliling 26), tetapi kelilingnya lebih kecil.',
      },
    ],
    judulC: 'C. Dugaanmu vs data',
    nextLabel: 'Lanjut: Generalisasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — GENERALIZATION
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Generalisasi',
    syntax: DL + ' · Sintaks 6',
    goal: 'Menyusun kesimpulan tentang cara menentukan keliling dan luas ketujuh bangun datar.',
    guru: 'Minta pasangan membacakan kesimpulan yang sudah tersusun dan menunjukkan buktinya di Lab. Kalimat pengecoh (sisi miring, luas sama berarti keliling sama) dibahas sebagai miskonsepsi.',
    instruksi:
      'Lengkapi setiap awal kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai satu kali; ada potongan yang tidak terpakai.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'gKeliling', awal: 'Keliling suatu bangun datar adalah', correct: 'bKeliling' },
      { id: 'gLuas', awal: 'Luas suatu bangun datar adalah', correct: 'bLuas' },
      { id: 'gPP', awal: 'Luas persegi panjang = p × l karena', correct: 'bPP' },
      {
        id: 'gJajar',
        awal: 'Jajargenjang dapat dipotong dan digeser menjadi persegi panjang, sehingga',
        correct: 'bJajar',
      },
      {
        id: 'gSetengah',
        awal: 'Dua segitiga atau dua trapesium yang sama dapat disusun menjadi jajargenjang, sehingga',
        correct: 'bSetengah',
      },
      {
        id: 'gDiagonal',
        awal: 'Belah ketupat dan layang-layang menempati setengah persegi panjang d₁ × d₂, sehingga',
        correct: 'bDiagonal',
      },
    ],
    bank: [
      {
        id: 'bKeliling',
        teks: 'jumlah panjang semua sisi yang membatasinya, dengan satuan panjang (cm, m).',
      },
      {
        id: 'bLuas',
        teks: 'banyak petak satuan yang menutupi daerahnya, dengan satuan persegi (cm², m²).',
      },
      { id: 'bPP', teks: 'petaknya tersusun dalam l baris yang masing-masing berisi p petak.' },
      { id: 'bJajar', teks: 'luasnya = alas × tinggi (bukan alas × sisi miring).' },
      { id: 'bSetengah', teks: 'luas satu bangunnya = ½ × luas jajargenjang itu.' },
      { id: 'bDiagonal', teks: 'luasnya = ½ × d₁ × d₂.' },
      { id: 'xMiring', teks: 'luasnya = alas × sisi miring.' },
      { id: 'xSama', teks: 'dua bangun yang luasnya sama pasti kelilingnya juga sama.' },
      { id: 'xTambah', teks: 'jumlah semua petak di sekeliling tepinya saja.' },
    ],
    rangkuman: [
      '<strong>Keliling</strong> = jumlah panjang semua sisi (satuan panjang). <strong>Luas</strong> = banyak petak satuan (satuan persegi).',
      '<strong>Persegi panjang:</strong> K = 2 × (p + l), L = p × l. <strong>Persegi:</strong> K = 4 × s, L = s × s.',
      '<strong>Jajargenjang:</strong> L = a × t (potong-geser menjadi persegi panjang). <strong>Segitiga:</strong> L = ½ × a × t.',
      '<strong>Trapesium:</strong> L = ½ × (a + b) × t (dua trapesium menjadi jajargenjang beralas a + b).',
      '<strong>Belah ketupat & layang-layang:</strong> L = ½ × d₁ × d₂ (setengah persegi panjang d₁ × d₂).',
      '<strong>Keliling bangun apa pun:</strong> jumlahkan semua sisinya; tinggi dan diagonal tidak termasuk.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Bank 16 soal; app memilih 4 isian + 4 pilihan ganda secara acak.
     Opsi pilihan ganda dibangun engine (opsiSoalBangun) lalu diacak.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan rumus keliling dan luas ketujuh bangun datar untuk menyelesaikan masalah sehari-hari.',
    guru: 'Murid bekerja mandiri. Amati pesan diagnosa yang muncul (keliling–luas tertukar, lupa ½, memakai sisi miring, satuan keliru) sebagai bahan umpan balik individual. Minta murid menuliskan rumus sebelum menghitung.',
    instruksi:
      'Kerjakan delapan soal berikut. Tentukan dulu: yang ditanyakan keliling atau luas? Lalu pilih rumus yang tepat. Desimal ditulis dengan koma, mis. 17,5.',
    banyak: 8,
    komposisi: { input: 4, choice: 4 },
    soal: [
      {
        id: 'iKeramik',
        type: 'input',
        konteks: 'rumah',
        cerita: 'Lantai kamar Rina berbentuk persegi panjang 4 m × 3 m akan dipasangi keramik.',
        pertanyaan: 'Berapa luas lantai kamar itu?',
        cek: { jenis: 'persegiPanjang', ukuran: { p: 4, l: 3 }, minta: 'luas' },
        label: { sisi: true },
        satuan: 'm',
        hints: ['Luas persegi panjang = p × l.', '4 × 3 = …'],
        reveal: 'Jawaban: 12 m².',
        explanation: 'L = p × l = 4 × 3 = 12 m².',
      },
      {
        id: 'iKebun',
        type: 'input',
        konteks: 'taman',
        cerita:
          'Kebun sayur berbentuk persegi panjang 15 m × 8 m akan dipagari kawat di sekeliling tepinya.',
        pertanyaan: 'Berapa meter kawat yang diperlukan?',
        cek: { jenis: 'persegiPanjang', ukuran: { p: 15, l: 8 }, minta: 'keliling' },
        label: { sisi: true },
        satuan: 'm',
        hints: ['Keliling = 2 × (p + l).', '2 × (15 + 8) = 2 × 23 = …'],
        reveal: 'Jawaban: 46 m.',
        explanation: 'K = 2 × (15 + 8) = 46 m.',
      },
      {
        id: 'iBendera',
        type: 'input',
        konteks: 'sekolah',
        cerita: 'Bendera segitiga untuk lomba tujuh belasan memiliki alas 30 cm dan tinggi 45 cm.',
        pertanyaan: 'Berapa luas kain sebuah bendera itu?',
        cek: { jenis: 'segitiga', ukuran: { a: 30, t: 45, g: 15 }, minta: 'luas' },
        label: { sisi: [0], tinggi: true },
        satuan: 'cm',
        hints: ['Luas segitiga = ½ × a × t.', '½ × 30 × 45 = 15 × 45 = …'],
        reveal: 'Jawaban: 675 cm².',
        explanation: 'L = ½ × 30 × 45 = 675 cm².',
      },
      {
        id: 'iTaplak',
        type: 'input',
        konteks: 'rumah',
        cerita:
          'Taplak meja berbentuk persegi bersisi 80 cm akan diberi renda di sekeliling tepinya.',
        pertanyaan: 'Berapa sentimeter renda yang diperlukan?',
        cek: { jenis: 'persegi', ukuran: { s: 80 }, minta: 'keliling' },
        label: { sisi: [0] },
        satuan: 'cm',
        hints: ['Keliling persegi = 4 × s.', '4 × 80 = …'],
        reveal: 'Jawaban: 320 cm.',
        explanation: 'K = 4 × 80 = 320 cm.',
      },
      {
        id: 'iSawah',
        type: 'input',
        konteks: 'taman',
        cerita:
          'Sawah Pak Darto berbentuk jajargenjang dengan alas 25 m dan tinggi 12 m. Sisi miringnya 13 m.',
        pertanyaan: 'Berapa luas sawah itu?',
        cek: { jenis: 'jajargenjang', ukuran: { a: 25, t: 12, g: 5 }, minta: 'luas' },
        label: { sisi: true, tinggi: true },
        satuan: 'm',
        hints: ['Luas jajargenjang = a × t. Sisi miring tidak dipakai.', '25 × 12 = …'],
        reveal: 'Jawaban: 300 m².',
        explanation: 'L = a × t = 25 × 12 = 300 m².',
      },
      {
        id: 'iAtap',
        type: 'input',
        konteks: 'rumah',
        cerita:
          'Satu sisi atap rumah berbentuk trapesium dengan sisi sejajar 10 m dan 6 m serta tinggi 4 m.',
        pertanyaan: 'Berapa luas sisi atap itu?',
        cek: { jenis: 'trapesium', ukuran: { a: 10, b: 6, t: 4, g: 2 }, minta: 'luas' },
        label: { sisi: [0, 2], tinggi: true },
        satuan: 'm',
        hints: ['L = ½ × (a + b) × t.', '½ × (10 + 6) × 4 = ½ × 16 × 4 = …'],
        reveal: 'Jawaban: 32 m².',
        explanation: 'L = ½ × (10 + 6) × 4 = 32 m².',
      },
      {
        id: 'iLayang',
        type: 'input',
        konteks: 'kerajinan',
        cerita: 'Budi membuat layang-layang dengan kerangka (diagonal) 40 cm dan 60 cm.',
        pertanyaan: 'Berapa luas kertas yang menutupi layang-layang itu?',
        cek: { jenis: 'layangLayang', ukuran: { d1: 40, d2: 60, y: 20 }, minta: 'luas' },
        label: { diagonal: true },
        satuan: 'cm',
        hints: ['L = ½ × d₁ × d₂.', '½ × 40 × 60 = 20 × 60 = …'],
        reveal: 'Jawaban: 1.200 cm².',
        explanation: 'L = ½ × 40 × 60 = 1.200 cm².',
      },
      {
        id: 'iLebar',
        type: 'input',
        konteks: 'sekolah',
        cerita: 'Halaman upacara berbentuk persegi panjang dengan luas 96 m² dan panjang 12 m.',
        pertanyaan: 'Berapa lebar halaman itu?',
        cek: {
          jenis: 'persegiPanjang',
          ukuran: { p: 12, l: 8 },
          minta: 'ukuran',
          cari: 'l',
          dari: 'luas',
        },
        label: { sisi: [0] },
        satuan: 'm',
        hints: ['p × l = 96, jadi 12 × l = 96.', 'l = 96 : 12 = …'],
        reveal: 'Jawaban: 8 m.',
        explanation: 'l = 96 : 12 = 8 m, karena 12 × 8 = 96.',
      },
      {
        id: 'cHiasanL',
        type: 'choice',
        konteks: 'kerajinan',
        cerita: 'Hiasan dinding berbentuk belah ketupat dengan diagonal 12 cm dan 16 cm.',
        pertanyaan: 'Berapa luas hiasan itu?',
        cek: { jenis: 'belahKetupat', ukuran: { d1: 12, d2: 16 }, minta: 'luas' },
        label: { diagonal: true },
        satuan: 'cm',
        explanation: 'L = ½ × 12 × 16 = 96 cm².',
      },
      {
        id: 'cHiasanK',
        type: 'choice',
        konteks: 'kerajinan',
        cerita:
          'Tepi hiasan belah ketupat (diagonal 12 cm dan 16 cm, sisi 10 cm) akan diberi pita.',
        pertanyaan: 'Berapa panjang pita yang diperlukan?',
        cek: { jenis: 'belahKetupat', ukuran: { d1: 12, d2: 16 }, minta: 'keliling' },
        label: { sisi: [0], diagonal: true },
        satuan: 'cm',
        explanation: 'K = 4 × 10 = 40 cm. Diagonal tidak dipakai untuk keliling.',
      },
      {
        id: 'cPetakSegitiga',
        type: 'choice',
        konteks: 'taman',
        cerita: 'Petak bunga berbentuk segitiga dengan alas 10 m dan tinggi 6 m.',
        pertanyaan: 'Berapa luas petak bunga itu?',
        cek: { jenis: 'segitiga', ukuran: { a: 10, t: 6, g: 2 }, minta: 'luas' },
        label: { sisi: [0], tinggi: true },
        satuan: 'm',
        explanation: 'L = ½ × 10 × 6 = 30 m².',
      },
      {
        id: 'cKolam',
        type: 'choice',
        konteks: 'taman',
        cerita:
          'Kolam renang anak berbentuk trapesium dengan sisi sejajar 14 m dan 8 m serta tinggi 6 m.',
        pertanyaan: 'Berapa luas permukaan kolam itu?',
        cek: { jenis: 'trapesium', ukuran: { a: 14, b: 8, t: 6, g: 3 }, minta: 'luas' },
        label: { sisi: [0, 2], tinggi: true },
        satuan: 'm',
        explanation: 'L = ½ × (14 + 8) × 6 = 66 m².',
      },
      {
        id: 'cLapangan',
        type: 'choice',
        konteks: 'olahraga',
        cerita:
          'Pak guru berlari satu kali mengelilingi tepi lapangan basket berukuran 28 m × 15 m.',
        pertanyaan: 'Berapa meter jarak yang ditempuhnya?',
        cek: { jenis: 'persegiPanjang', ukuran: { p: 28, l: 15 }, minta: 'keliling' },
        label: { sisi: true },
        satuan: 'm',
        explanation: 'K = 2 × (28 + 15) = 86 m.',
      },
      {
        id: 'cSisiSenam',
        type: 'choice',
        konteks: 'olahraga',
        cerita: 'Keliling matras senam berbentuk persegi adalah 36 m.',
        pertanyaan: 'Berapa panjang sisinya?',
        cek: { jenis: 'persegi', ukuran: { s: 9 }, minta: 'ukuran', cari: 's', dari: 'keliling' },
        label: {},
        satuan: 'm',
        explanation: 's = 36 : 4 = 9 m, karena persegi punya empat sisi sama panjang.',
      },
      {
        id: 'cRumusJajar',
        type: 'choice',
        konteks: 'sekolah',
        cerita: 'Raka lupa rumus luas jajargenjang. Ia teringat kegiatan potong-geser di Lab.',
        pertanyaan: 'Rumus luas jajargenjang yang tepat adalah …',
        cek: { jenis: 'jajargenjang', minta: 'rumus' },
        gambar: { ukuran: { a: 6, t: 3, g: 2 }, label: { sisi: [0, 1], tinggi: true } },
        explanation: 'Jajargenjang dipotong-geser menjadi persegi panjang a × t, jadi L = a × t.',
      },
      {
        id: 'cRumusTrapesium',
        type: 'choice',
        konteks: 'sekolah',
        cerita: 'Sinta ingin menghitung luas papan nama berbentuk trapesium.',
        pertanyaan: 'Rumus luas trapesium yang tepat adalah …',
        cek: { jenis: 'trapesium', minta: 'rumus' },
        gambar: { ukuran: { a: 7, b: 3, t: 3, g: 2 }, label: { sisi: [0, 2], tinggi: true } },
        explanation:
          'Dua trapesium yang sama membentuk jajargenjang beralas a + b, jadi L = ½ × (a + b) × t.',
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
    goal: 'Merenungkan cara menemukan rumus keliling dan luas serta menilai pemahaman diri.',
    guru: 'Beri waktu hening 3 menit. Ajak beberapa murid membacakan jawaban pertanyaan kedua untuk menguatkan strategi "potong-susun menjadi bangun yang sudah dikenal".',
    pertanyaan: [
      {
        id: 'rBangun',
        teks: 'Rumus bangun mana yang paling menarik untuk kamu temukan, dan bagaimana caranya?',
        placeholder: 'Contoh: trapesium, karena dua trapesium bisa menjadi jajargenjang …',
      },
      {
        id: 'rBeda',
        teks: 'Dengan kata-katamu sendiri, apa perbedaan keliling dan luas?',
        placeholder: 'Contoh: keliling adalah …, sedangkan luas adalah …',
      },
      {
        id: 'rDugaan',
        teks: 'Apakah dugaanmu di awal pelajaran tepat? Apa yang membuatmu berubah pikiran?',
        placeholder: 'Contoh: aku kira luas belah ketupat 6 × 8 = 48 m², ternyata …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu dapat menentukan keliling dan luas ketujuh bangun datar sekarang?',
    diriOpsi: [
      { id: 'sangat', label: 'Sangat yakin — aku bisa menjelaskannya kepada teman' },
      { id: 'yakin', label: 'Yakin — aku bisa mengerjakannya sendiri' },
      { id: 'cukup', label: 'Cukup yakin — kadang masih perlu melihat rumus' },
      { id: 'belum', label: 'Belum yakin — aku perlu latihan lagi' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Kamu sudah menemukan rumus keliling & luas!',
    teks: 'Dengan menghitung petak, memotong, dan menyusun bangun, kamu menemukan sendiri cara menentukan keliling dan luas tujuh bangun datar — dan kini taman sekolah siap dirancang.',
    contoh: [
      'persegi',
      'persegiPanjang',
      'segitiga',
      'jajargenjang',
      'trapesium',
      'belahKetupat',
      'layangLayang',
    ],
    capaian: [
      'Membedakan keliling dan luas beserta satuannya.',
      'Menemukan rumus keliling dan luas persegi panjang serta persegi dari petak dan ruas satuan.',
      'Menemukan rumus luas jajargenjang, segitiga, dan trapesium dengan memotong-menyusun bangun.',
      'Menemukan rumus luas belah ketupat dan layang-layang dari kedua diagonalnya.',
      'Menentukan keliling dan luas ketujuh bangun datar dalam masalah sehari-hari.',
    ],
  },
};
