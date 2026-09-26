'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Koefisien Korelasi & Kesesuaian Model Linear
   Fase F — SMK Rekayasa Perangkat Lunak (Kelas XII)
   Topik 11 · Penyelidikan Statistika

   Tujuan Pembelajaran:
   Menganalisis kekuatan dan arah hubungan antara dua variabel
   menggunakan koefisien korelasi serta mengevaluasi kesesuaian model
   linear terhadap data.

   Model pembelajaran: PROBLEM BASED LEARNING (PBL).
   Masalah pemantik: "Dasbor Analitik NgodingYuk".
   Kak Nadia (product manager aplikasi belajar coding NgodingYuk) ingin
   menambahkan fitur "Prediksi" di dasbor analitik. Tim magang RPL
   menerima empat pasang metrik dari 10 pengguna/rilis dan harus
   merekomendasikan pasangan mana yang layak diberi model garis lurus:
     A. Jam latihan per minggu ↔ skor ujian        r ≈ 0,97, residu acak
     B. Notifikasi per hari ↔ rating aplikasi       r ≈ −0,59
     C. Waktu muat halaman ↔ bounce rate            r ≈ 0,96, residu LENGKUNG
     D. Nomor ID pengguna ↔ skor ujian              r ≈ 0,04
   Konflik kognitif: "r mendekati 1 berarti model linear pasti cocok".
   Pasangan C punya r hampir sama tinggi dengan A, tetapi plot residunya
   berpola lengkung (+ + − − − − − − + +), sehingga garis lurus kurang
   sesuai. Di Lab Pencilan, satu akun uji QA yang ikut tercatat membuat
   r pasangan A anjlok dari 0,97 menjadi 0,57.

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ....... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar . 'organisasi'
     Sintaks 3 — Membimbing penyelidikan ............ 'selidikArah',
                                                      'selidikHitung',
                                                      'selidikKesesuaian'
     Sintaks 4 — Mengembangkan & menyajikan karya ... 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi ........ 'evaluasi'
     Penerapan & penutup ............................ 'terapkan', 'refleksi',
                                                      'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — kelompok menulis dugaan & hipotesis,
       memilah informasi, menyusun rencana, lalu menguji dugaannya
       sendiri dan merefleksikan strategi.
     • Bermakna (meaningful) — metrik dasbor aplikasi sungguhan di dunia
       RPL; keputusan kelompok menentukan fitur yang dibangun untuk
       klien.
     • Menggembirakan (joyful) — Penjelajah r dengan slider, tantangan
       "tebak r", Lab Pencilan ketuk-titik, dan Kartu Rekomendasi Dasbor
       yang dipresentasikan.

   Rangkaian aktivitas (± 2 × 45 menit; kelompok 3–4 murid):
     1. Orientasi     (8')  — pesan klien, empat diagram pencar metrik,
                              dugaan awal (tidak dinilai), rumusan masalah,
                              hipotesis.
     2. Organisasi    (6')  — memilih peran, memilah informasi
                              (diketahui/ditanya/tidak diperlukan),
                              mengurutkan rencana penyelidikan.
     3. Selidik A     (12') — Penjelajah r (slider −1 … 1), tantangan
                              tebak r empat diagram, pertanyaan penuntun
                              arah & kekuatan.
     4. Selidik B     (15') — menghitung r data mini langkah demi langkah
                              (Sxy, Sxx, Syy, r; diagnosa r², kemiringan,
                              lupa akar, tanda); =CORREL untuk empat
                              pasangan & klasifikasi arah–kekuatan; Lab
                              Pencilan.
     5. Selidik C     (12') — r² sebagai proporsi variasi; plot residu A vs
                              C (acak vs lengkung); r tinggi belum tentu
                              model linear sesuai.
     6. Karya         (12') — keputusan per pasangan → Kartu Rekomendasi
                              Dasbor + pesan untuk klien.
     7. Evaluasi      (10') — menilai pendapat teman, dugaan vs hasil,
                              menyusun simpulan dari bank kalimat acak.
     8. Uji terap     (10') — 8 soal acak dari bank 14 soal.
     9. Refleksi      (5')  — rekap capaian, refleksi tertulis, keyakinan.

   Catatan pengacakan: SEMUA daftar pilihan di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di urutan pertama). app.js
   mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / ensureTapOrderState / shuffleArray dari
   shared/engine.js) dan menyimpannya di State, sehingga tiap murid dan
   tiap Reset mendapat urutan berbeda.

   Kunci arah, kekuatan, pola residu, dan keputusan setiap pasangan
   diperiksa tests/mpi-f-11.3-data.test.js dengan fungsi engine seksi 50
   (bukan disalin manual). Metadata `cek` pada soal uji terap dipakai
   untuk tujuan yang sama.
   ============================================================ */

var PBL = 'Problem Based Learning';

var DATA = {
  meta: {
    judul: 'Koefisien Korelasi & Kesesuaian Model Linear',
  },

  tahap: [
    { id: 'orientasi', label: 'Masalah' },
    { id: 'organisasi', label: 'Organisasi' },
    { id: 'selidikArah', label: 'Arah & Kekuatan' },
    { id: 'selidikHitung', label: 'Hitung r' },
    { id: 'selidikKesesuaian', label: 'Kesesuaian' },
    { id: 'karya', label: 'Karya' },
    { id: 'evaluasi', label: 'Evaluasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  klien: { nama: 'Kak Nadia', peran: 'Product Manager', aplikasi: 'NgodingYuk' },

  /*
   * Empat pasangan metrik dasbor. `kunci` diverifikasi tes terhadap
   * keputusanModelLinear (engine seksi 50).
   */
  pasangan: [
    {
      id: 'A',
      ikon: '⏱️',
      judul: 'Jam latihan ↔ Skor ujian',
      xNama: 'Jam latihan per minggu',
      yNama: 'Skor ujian',
      satuanX: 'jam',
      satuanY: 'poin',
      plot: { x: { min: 0, max: 12, step: 2 }, y: { min: 30, max: 100, step: 10 } },
      titik: [
        { id: 'a1', x: 1, y: 48 },
        { id: 'a2', x: 2, y: 55 },
        { id: 'a3', x: 3, y: 52 },
        { id: 'a4', x: 4, y: 63 },
        { id: 'a5', x: 5, y: 60 },
        { id: 'a6', x: 6, y: 70 },
        { id: 'a7', x: 7, y: 74 },
        { id: 'a8', x: 8, y: 71 },
        { id: 'a9', x: 9, y: 82 },
        { id: 'a10', x: 10, y: 85 },
      ],
      kunci: { arah: 'positif', kekuatan: 'kuat', pola: 'acak', keputusan: 'layak' },
    },
    {
      id: 'B',
      ikon: '🔔',
      judul: 'Notifikasi ↔ Rating aplikasi',
      xNama: 'Notifikasi per hari',
      yNama: 'Rating aplikasi',
      satuanX: 'notifikasi',
      satuanY: 'bintang',
      plot: { x: { min: 0, max: 12, step: 2 }, y: { min: 3, max: 5, step: 0.5 } },
      titik: [
        { id: 'b1', x: 1, y: 4.4 },
        { id: 'b2', x: 2, y: 4.7 },
        { id: 'b3', x: 3, y: 3.9 },
        { id: 'b4', x: 4, y: 4.5 },
        { id: 'b5', x: 5, y: 4.6 },
        { id: 'b6', x: 6, y: 3.8 },
        { id: 'b7', x: 7, y: 4.3 },
        { id: 'b8', x: 8, y: 3.6 },
        { id: 'b9', x: 9, y: 4.2 },
        { id: 'b10', x: 10, y: 3.7 },
      ],
      kunci: { arah: 'negatif', kekuatan: 'sedang', pola: 'acak', keputusan: 'lemah' },
    },
    {
      id: 'C',
      ikon: '🐢',
      judul: 'Waktu muat ↔ Bounce rate',
      xNama: 'Waktu muat halaman (detik)',
      yNama: 'Bounce rate (%)',
      satuanX: 'detik',
      satuanY: '%',
      plot: { x: { min: 0, max: 6, step: 1 }, y: { min: 0, max: 80, step: 10 } },
      titik: [
        { id: 'c1', x: 1, y: 20 },
        { id: 'c2', x: 1.5, y: 21 },
        { id: 'c3', x: 2, y: 23 },
        { id: 'c4', x: 2.5, y: 26 },
        { id: 'c5', x: 3, y: 30 },
        { id: 'c6', x: 3.5, y: 35 },
        { id: 'c7', x: 4, y: 42 },
        { id: 'c8', x: 4.5, y: 50 },
        { id: 'c9', x: 5, y: 59 },
        { id: 'c10', x: 5.5, y: 70 },
      ],
      kunci: { arah: 'positif', kekuatan: 'kuat', pola: 'lengkung', keputusan: 'bukanLinear' },
    },
    {
      id: 'D',
      ikon: '🔢',
      judul: 'Nomor ID pengguna ↔ Skor ujian',
      xNama: 'Nomor ID pengguna',
      yNama: 'Skor ujian',
      satuanX: '',
      satuanY: 'poin',
      plot: { x: { min: 0, max: 50, step: 10 }, y: { min: 50, max: 90, step: 10 } },
      titik: [
        { id: 'd1', x: 3, y: 72 },
        { id: 'd2', x: 7, y: 58 },
        { id: 'd3', x: 12, y: 85 },
        { id: 'd4', x: 18, y: 64 },
        { id: 'd5', x: 21, y: 79 },
        { id: 'd6', x: 26, y: 55 },
        { id: 'd7', x: 30, y: 88 },
        { id: 'd8', x: 35, y: 70 },
        { id: 'd9', x: 41, y: 61 },
        { id: 'd10', x: 47, y: 76 },
      ],
      kunci: { arah: 'tidak', kekuatan: 'sangatLemah', pola: 'acak', keputusan: 'tidakAda' },
    },
  ],

  /* Titik pencilan pasangan A (hanya dipakai Lab Pencilan tahap 4). */
  pencilan: {
    id: 'a11',
    x: 9,
    y: 40,
    nama: 'Akun uji QA',
    pencilan: true,
    alasan:
      'Akun milik tim QA untuk menguji fitur ujian; skornya asal-asalan dan bukan pengguna sungguhan.',
  },

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI PADA MASALAH (PBL sintaks 1)
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Evaluasi.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi pada Masalah',
    syntax: PBL + ' · Sintaks 1',
    goal: 'Memahami masalah klien tentang empat pasang metrik dasbor, lalu menyampaikan dugaan awal tentang hubungan mana yang cocok dimodelkan dengan garis lurus.',
    tp: 'Menganalisis kekuatan dan arah hubungan antara dua variabel menggunakan koefisien korelasi serta mengevaluasi kesesuaian model linear terhadap data.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menentukan arah (positif/negatif) dan kekuatan hubungan dua variabel dari diagram pencar dan nilai r.',
      'Menghitung koefisien korelasi r = Sxy : √(Sxx × Syy) dan memeriksanya dengan teknologi (=CORREL).',
      'Menjelaskan pengaruh pencilan terhadap r dan menafsirkan r² sebagai proporsi variasi yang dijelaskan model.',
      'Mengevaluasi kesesuaian model linear dengan r dan pola plot residu, lalu memberi rekomendasi yang beralasan.',
    ],
    guru: 'Bacakan pesan klien, lalu tanyakan: "Kalau grafiknya naik terus, apakah garis lurus pasti cocok?" Biarkan kelompok berdebat tentang pasangan C. Catat argumen seperti "r besar berarti modelnya bagus" di papan — argumen ini akan diuji di tahap Kesesuaian. Jangan memberi jawaban.',
    judul: 'Dasbor Analitik NgodingYuk',
    pesanKlien:
      'Halo tim magang RPL! Saya mau menambahkan fitur "Prediksi" di dasbor NgodingYuk: dari satu metrik, dasbor menebak metrik lain memakai garis lurus. Ini empat pasang metrik dari data pengguna kita. Tolong rekomendasikan pasangan mana yang layak diberi fitur prediksi garis lurus, dan jelaskan alasannya dengan angka. — Kak Nadia, Product Manager',
    pengantar:
      'Setiap pasangan berisi data 10 pengguna atau 10 rilis. Amati diagram pencarnya: apakah titik-titik naik, turun, atau menyebar? Apakah polanya lurus atau melengkung?',
    dugaan: [
      {
        id: 'd1',
        tanya: 'Menurutmu, pasangan mana yang PALING layak diberi fitur prediksi garis lurus?',
        opsi: [
          { id: 'A', label: 'A — Jam latihan ↔ Skor ujian' },
          { id: 'B', label: 'B — Notifikasi ↔ Rating aplikasi' },
          { id: 'C', label: 'C — Waktu muat ↔ Bounce rate' },
          { id: 'D', label: 'D — Nomor ID pengguna ↔ Skor ujian' },
        ],
        baku: 'A',
        pembahasan:
          'Pasangan A punya r ≈ 0,97 dengan residu acak. Pasangan C juga punya r tinggi (≈ 0,96), tetapi residunya berpola lengkung sehingga garis lurus kurang sesuai.',
      },
      {
        id: 'd2',
        tanya: 'Bila koefisien korelasi r hampir 1, model garis lurus …',
        opsi: [
          { id: 'belum', label: 'belum tentu sesuai — perlu dicek pola datanya' },
          { id: 'pasti', label: 'pasti sesuai untuk data itu' },
          { id: 'sebab', label: 'membuktikan x menyebabkan y' },
          { id: 'tidak', label: 'pasti tidak sesuai' },
        ],
        baku: 'belum',
        pembahasan:
          'r hanya mengukur seberapa lurus-rapat hubungan linear. Data melengkung pun bisa punya r tinggi; plot residu yang menentukan kesesuaiannya.',
      },
    ],
    alasanLabel: 'Tuliskan alasan dugaan kelompokmu',
    alasanPlaceholder: 'Contoh: pasangan … paling layak karena titik-titiknya …',
    pertanyaan: 'Masalah apa yang sebenarnya harus diselesaikan tim?',
    masalahOpsi: [
      {
        id: 'inti',
        label:
          'Seberapa kuat dan ke arah mana hubungan setiap pasangan metrik, dan apakah model garis lurus sesuai untuk dipakai memprediksi?',
      },
      { id: 'rata', label: 'Berapa rata-rata skor ujian semua pengguna NgodingYuk?' },
      { id: 'warna', label: 'Warna grafik apa yang paling menarik untuk dasbor?' },
      { id: 'terbanyak', label: 'Pengguna mana yang paling lama berlatih coding?' },
    ],
    masalahCorrect: 'inti',
    masalahUmpan: {
      inti: 'Tepat! Ada dua hal yang dicari: <strong>kekuatan & arah hubungan</strong> (koefisien korelasi) dan <strong>kesesuaian model linear</strong> untuk tiap pasangan.',
      rata: 'Rata-rata hanya melihat satu variabel. Fitur prediksi membutuhkan hubungan DUA variabel.',
      warna:
        'Tampilan memang penting, tetapi klien meminta rekomendasi berdasarkan angka hubungan data.',
      terbanyak:
        'Itu cukup dibaca dari tabel. Yang ditanyakan klien adalah hubungan antarvariabel untuk prediksi.',
    },
    hipotesisLabel: 'Hipotesis kelompok',
    hipotesisPlaceholder:
      'Contoh: Kami menduga pasangan … memiliki hubungan … yang paling kuat, sehingga …',
    nextLabel: 'Lanjut: Atur Kelompok →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENGORGANISASI BELAJAR (PBL sintaks 2)
     ---------------------------------------------------------- */
  organisasi: {
    kicker: 'Tahap 2 · Mengorganisasi Belajar',
    syntax: PBL + ' · Sintaks 2',
    goal: 'Membagi peran, memilah informasi yang diperlukan, dan menyusun rencana penyelidikan.',
    guru: 'Pastikan setiap anggota memegang satu peran. Saat pemilahan, tanyakan mengapa "nama lengkap pengguna" tidak diperlukan dan mengapa nomor ID tetap dianalisis walaupun tampak tidak bermakna. Rencana yang benar dipakai sebagai peta tiga penyelidikan berikutnya.',
    peranLabel: 'Pilih peranmu di kelompok',
    peran: [
      { id: 'analis', label: '📊 Analis Data — membaca diagram pencar & plot residu' },
      { id: 'operator', label: '💻 Operator Teknologi — menjalankan lab & spreadsheet' },
      { id: 'pencatat', label: '📝 Pencatat — mencatat nilai r dan keputusan kelompok' },
      { id: 'presenter', label: '🎤 Presenter — menyajikan Kartu Rekomendasi ke klien' },
    ],
    judulPilah: 'Pilah informasinya',
    opsiPilah: [
      { id: 'diketahui', label: 'Diketahui' },
      { id: 'ditanya', label: 'Ditanya' },
      { id: 'tidakPerlu', label: 'Tidak diperlukan' },
    ],
    pilah: [
      {
        id: 'i1',
        teks: 'Data 10 pengguna/rilis untuk empat pasang metrik',
        correct: 'diketahui',
        explanation: 'Inilah data dua variabel numerik yang akan dianalisis.',
      },
      {
        id: 'i2',
        teks: 'Fitur prediksi dasbor memakai model garis lurus',
        correct: 'diketahui',
        explanation: 'Jenis model yang akan dievaluasi sudah ditentukan klien.',
      },
      {
        id: 'i3',
        teks: 'Arah dan kekuatan hubungan setiap pasangan metrik',
        correct: 'ditanya',
        explanation: 'Dijawab dengan koefisien korelasi r.',
      },
      {
        id: 'i4',
        teks: 'Pasangan mana yang layak diberi model garis lurus',
        correct: 'ditanya',
        explanation: 'Keputusan akhir untuk klien, dinilai dari r dan pola residu.',
      },
      {
        id: 'i5',
        teks: 'Nama lengkap setiap pengguna',
        correct: 'tidakPerlu',
        explanation: 'Analisis hanya memakai pasangan nilai (x, y), dan nama adalah data pribadi.',
      },
      {
        id: 'i6',
        teks: 'Logo dan warna tema dasbor',
        correct: 'tidakPerlu',
        explanation: 'Tampilan tidak memengaruhi hubungan antarvariabel.',
      },
    ],
    judulRencana: 'Susun rencana penyelidikan',
    instruksiRencana: 'Ketuk langkah-langkah berikut sesuai urutan kerja yang masuk akal.',
    rencana: [
      { id: 'r1', label: '👀 Amati diagram pencar setiap pasangan metrik' },
      { id: 'r2', label: '🧭 Kenali arah & kekuatan hubungan dari nilai r' },
      { id: 'r3', label: '🧮 Hitung r dan periksa dengan spreadsheet' },
      { id: 'r4', label: '📉 Periksa kesesuaian model dengan r² & plot residu' },
      { id: 'r5', label: '📨 Buat Kartu Rekomendasi untuk klien' },
    ],
    nextLabel: 'Mulai Penyelidikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENYELIDIKAN A: ARAH & KEKUATAN (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikArah: {
    kicker: 'Tahap 3 · Penyelidikan A — Arah & Kekuatan',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menemukan hubungan antara tanda dan besar koefisien korelasi r dengan arah dan kerapatan titik pada diagram pencar.',
    guru: 'Operator Teknologi menggeser slider, anggota lain menebak bentuk diagram SEBELUM slider dilepas. Minta kelompok mencoba r = 1, r = −1, dan r = 0. Pada tantangan tebak r, minta murid menjelaskan petunjuk yang dipakai: arah naik/turun dan seberapa rapat titik ke garis.',
    judulJelajah: 'Penjelajah r: geser dan amati',
    instruksiJelajah:
      'Geser nilai r dari −1 sampai 1. Amati arah titik-titik dan seberapa rapat titik mengumpul di sekitar garis. Coba juga r = 0.',
    geserMinimal: 5,
    judulTebak: 'Tantangan: tebak r!',
    instruksiTebak:
      'Setiap diagram dibuat dengan salah satu nilai r di bawahnya. Pasangkan setiap diagram dengan nilai r yang tepat.',
    tebak: [
      { id: 'g1', r: 0.8 },
      { id: 'g2', r: -0.9 },
      { id: 'g3', r: 0.1 },
      { id: 'g4', r: -0.4 },
    ],
    tanya: [
      {
        id: 'a1',
        tanya: 'Apa yang ditunjukkan oleh TANDA koefisien korelasi r (positif atau negatif)?',
        opsi: [
          { id: 'arah', label: 'Arah hubungan: naik bersama (positif) atau berlawanan (negatif)' },
          { id: 'kuat', label: 'Kekuatan hubungan' },
          { id: 'banyak', label: 'Banyaknya data' },
          { id: 'baik', label: 'Positif berarti baik, negatif berarti buruk' },
        ],
        correct: 'arah',
        umpan: {
          arah: 'Tepat! r > 0: x naik, y cenderung naik. r < 0: x naik, y cenderung turun.',
          kuat: 'Kekuatan dibaca dari BESAR |r| (seberapa dekat ke 1 atau −1), bukan dari tandanya.',
          banyak: 'Banyak data tidak terlihat dari tanda r.',
          baik: 'Negatif tidak berarti buruk. r = −0,9 justru hubungan yang sangat kuat, hanya arahnya berlawanan.',
        },
      },
      {
        id: 'a2',
        tanya: 'Mana hubungan yang PALING kuat?',
        opsi: [
          { id: 'n09', label: 'r = −0,9' },
          { id: 'p08', label: 'r = 0,8' },
          { id: 'p01', label: 'r = 0,1' },
          { id: 'n04', label: 'r = −0,4' },
        ],
        correct: 'n09',
        umpan: {
          n09: 'Benar! |−0,9| = 0,9 paling dekat ke 1, sehingga titik paling rapat di sekitar garis.',
          p08: 'r = 0,8 memang kuat, tetapi |−0,9| = 0,9 lebih besar. Kekuatan dibaca dari nilai mutlak.',
          p01: 'r = 0,1 hampir nol: titik menyebar tanpa arah yang jelas.',
          n04: '|−0,4| = 0,4 tergolong sedang, masih lebih lemah dari 0,9.',
        },
      },
      {
        id: 'a3',
        tanya: 'Bila r ≈ 0, kesimpulan yang tepat adalah …',
        opsi: [
          { id: 'linear', label: 'Hampir tidak ada hubungan LINEAR antara kedua variabel' },
          { id: 'sama', label: 'Nilai x dan y selalu sama' },
          { id: 'nol', label: 'Semua nilai y sama dengan nol' },
          { id: 'kuat', label: 'Hubungannya sangat kuat tetapi mendatar' },
        ],
        correct: 'linear',
        umpan: {
          linear:
            'Tepat! r hanya mengukur hubungan garis lurus. Titik-titik menyebar tanpa arah naik atau turun yang jelas.',
          sama: 'r ≈ 0 justru berarti x tidak membantu menebak y dengan garis lurus.',
          nol: 'r bukan nilai y. r ≈ 0 berbicara tentang pola pasangan (x, y).',
          kuat: 'Di Penjelajah r, r = 0 memberi titik yang menyebar, bukan rapat di satu garis.',
        },
      },
    ],
    temuan: [
      'Koefisien korelasi r selalu berada di antara −1 dan 1.',
      'Tanda r menunjukkan ARAH: r > 0 hubungan positif (naik bersama), r < 0 hubungan negatif (berlawanan).',
      'Besar |r| menunjukkan KEKUATAN: |r| ≥ 0,7 kuat, 0,4–0,7 sedang, 0,2–0,4 lemah, < 0,2 hampir tidak ada hubungan linear; |r| = 1 sempurna.',
    ],
    nextLabel: 'Lanjut: Hitung r →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENYELIDIKAN B: MENGHITUNG r (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikHitung: {
    kicker: 'Tahap 4 · Penyelidikan B — Menghitung r',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menghitung koefisien korelasi r langkah demi langkah, memeriksanya dengan teknologi, dan menyelidiki pengaruh pencilan.',
    guru: 'Bagi tugas: satu murid menjumlahkan kolom (x − x̄)(y − ȳ), satu murid kolom (x − x̄)², satu murid kolom (y − ȳ)². Setelah r ditemukan, tanyakan mengapa hasil kali (x − x̄)(y − ȳ) yang positif membuat r positif. Pada Lab Pencilan, tekankan: data hanya boleh dikeluarkan bila ada ALASAN yang sah, bukan agar r terlihat bagus.',
    judulMini: 'A. Hitung r data uji beta',
    instruksiMini:
      'Lima penguji beta mencatat jam latihan (x) dan skor kuis (y). Rata-ratanya x̄ = 3 dan ȳ = 10. Lengkapi jumlah setiap kolom, lalu hitung r = Sxy : √(Sxx × Syy).',
    mini: {
      titik: [
        { id: 'm1', nama: 'Penguji 1', x: 1, y: 8 },
        { id: 'm2', nama: 'Penguji 2', x: 2, y: 6 },
        { id: 'm3', nama: 'Penguji 3', x: 3, y: 10 },
        { id: 'm4', nama: 'Penguji 4', x: 4, y: 14 },
        { id: 'm5', nama: 'Penguji 5', x: 5, y: 12 },
      ],
      plot: { x: { min: 0, max: 6, step: 1 }, y: { min: 0, max: 16, step: 2 } },
    },
    langkah: [
      {
        id: 'sxy',
        kunci: 'sxy',
        label: 'Sxy = Σ(x − x̄)(y − ȳ) = 4 + 4 + 0 + 4 + 4 = …',
        hints: ['Jumlahkan kolom (x − x̄)(y − ȳ).', '4 + 4 + 0 + 4 + 4.'],
        temuan: 'Sxy = 16 (positif → arah hubungan positif).',
      },
      {
        id: 'sxx',
        kunci: 'sxx',
        label: 'Sxx = Σ(x − x̄)² = 4 + 1 + 0 + 1 + 4 = …',
        hints: ['Jumlahkan kolom (x − x̄)².', '4 + 1 + 0 + 1 + 4.'],
        temuan: 'Sxx = 10.',
      },
      {
        id: 'syy',
        kunci: 'syy',
        label: 'Syy = Σ(y − ȳ)² = 4 + 16 + 0 + 16 + 4 = …',
        hints: ['Jumlahkan kolom (y − ȳ)².', '4 + 16 + 0 + 16 + 4.'],
        temuan: 'Syy = 40.',
      },
    ],
    langkahR: {
      label: 'r = Sxy : √(Sxx × Syy) = 16 : √(10 × 40) = …',
      hint: '10 × 40 = 400 dan √400 = 20. Lalu 16 : 20 = …',
    },
    judulTekno: 'B. Periksa dengan teknologi: =CORREL',
    instruksiTekno:
      'Operator Teknologi menjalankan =CORREL untuk keempat pasangan metrik. Baca nilai r dan meterannya, lalu kelompokkan setiap pasangan.',
    tombolTekno: '▶ Jalankan =CORREL untuk 4 pasangan',
    rentangX: 'A2:A11',
    rentangY: 'B2:B11',
    judulKelompok: 'Kelompokkan arah & kekuatan hubungannya',
    opsiKelompok: [
      { id: 'kuatPositif', label: 'Positif kuat' },
      { id: 'sedangNegatif', label: 'Negatif sedang' },
      { id: 'sangatLemah', label: 'Hampir tidak ada' },
      { id: 'kuatNegatif', label: 'Negatif kuat' },
    ],
    judulPencilan: 'C. Lab Pencilan: satu data bisa mengubah r!',
    instruksiPencilan:
      'Data pasangan A ternyata ikut mencatat satu akun uji milik tim QA (titik oranye). Ketuk titik itu (atau tombolnya) untuk mengeluarkan dan memasukkannya kembali. Amati r dan garis regresinya.',
    tanyaPencilan: [
      {
        id: 'b1',
        tanya: 'Apa pengaruh akun uji QA terhadap r pasangan A?',
        opsi: [
          { id: 'turun', label: 'r turun drastis dari sekitar 0,97 menjadi sekitar 0,57' },
          { id: 'tetap', label: 'r tidak berubah karena hanya satu titik' },
          { id: 'naik', label: 'r naik mendekati 1' },
          { id: 'negatif', label: 'r berubah menjadi negatif' },
        ],
        correct: 'turun',
        umpan: {
          turun:
            'Tepat! Satu pencilan yang jauh dari pola bisa menurunkan r dengan tajam — dari kuat menjadi sedang.',
          tetap: 'Coba ketuk titik oranye lagi dan bandingkan kedua kartu r. Selisihnya besar.',
          naik: 'Titik itu jauh di bawah pola naik, jadi justru melemahkan hubungan.',
          negatif: 'r tetap positif (≈ 0,57), hanya kekuatannya berkurang.',
        },
      },
      {
        id: 'b2',
        tanya: 'Kapan tim BOLEH mengeluarkan akun uji QA dari data?',
        opsi: [
          {
            id: 'alasan',
            label: 'Karena ada alasan sah: akun itu bukan pengguna sungguhan (data uji)',
          },
          { id: 'bagus', label: 'Kapan saja, supaya r terlihat lebih bagus' },
          { id: 'semua', label: 'Semua titik yang jauh dari garis harus selalu dihapus' },
          { id: 'jangan', label: 'Tidak pernah; data apa pun tidak boleh dikeluarkan' },
        ],
        correct: 'alasan',
        umpan: {
          alasan:
            'Benar! Pencilan diselidiki dulu. Dikeluarkan hanya bila terbukti bukan bagian dari populasi (data uji, salah input) dan keputusan itu dilaporkan.',
          bagus: 'Menghapus data demi angka yang bagus adalah manipulasi data — tidak jujur.',
          semua:
            'Titik yang jauh bisa jadi informasi penting. Selidiki penyebabnya sebelum memutuskan.',
          jangan:
            'Data yang jelas salah atau bukan bagian populasi (mis. akun uji) boleh dikeluarkan asalkan dilaporkan.',
        },
      },
    ],
    temuan: [
      'r = Sxy : √(Sxx × Syy), dengan Sxy = Σ(x − x̄)(y − ȳ), Sxx = Σ(x − x̄)², Syy = Σ(y − ȳ)².',
      'Tanda r mengikuti tanda Sxy; spreadsheet menghitungnya dengan =CORREL(rentang x; rentang y).',
      'Satu pencilan dapat mengubah r secara drastis. Pencilan diselidiki dulu dan hanya dikeluarkan dengan alasan yang sah.',
    ],
    nextLabel: 'Lanjut: Evaluasi Model →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENYELIDIKAN C: KESESUAIAN MODEL LINEAR (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikKesesuaian: {
    kicker: 'Tahap 5 · Penyelidikan C — Kesesuaian Model Linear',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Mengevaluasi kesesuaian model linear dengan koefisien determinasi r² dan pola plot residu.',
    guru: 'Tampilkan plot residu A dan C berdampingan. Tanyakan: "Kalau garisnya memang cocok, residu seharusnya bagaimana?" Arahkan murid ke gagasan residu acak di sekitar nol. Untuk C, minta kelompok menunjuk di mana garis lurus meremehkan dan melebih-lebihkan bounce rate.',
    judulR2: 'A. Apa arti r²?',
    instruksiR2:
      'Koefisien determinasi r² menyatakan proporsi (persen) variasi y yang dapat dijelaskan oleh model linear dari x.',
    tanyaR2: {
      id: 'c1',
      tanya: 'Pasangan A: r ≈ 0,97 sehingga r² ≈ 0,94. Artinya …',
      opsi: [
        {
          id: 'variasi',
          label: 'Sekitar 94% variasi skor ujian dapat dijelaskan oleh model linear jam latihan',
        },
        { id: 'benar', label: '94% prediksi skor pasti tepat' },
        { id: 'pengguna', label: '94% pengguna berlatih setiap minggu' },
        { id: 'sebab', label: 'Jam latihan pasti menjadi satu-satunya penyebab skor naik' },
      ],
      correct: 'variasi',
      umpan: {
        variasi:
          'Tepat! Sisanya (≈ 6%) dipengaruhi faktor lain yang tidak ada di model, misalnya kualitas tidur atau tingkat kesulitan soal.',
        benar:
          'r² tidak menyatakan persen prediksi yang tepat; setiap prediksi tetap punya residu.',
        pengguna: 'r² berbicara tentang variasi y yang dijelaskan model, bukan tentang pengguna.',
        sebab:
          'Korelasi tidak sama dengan sebab-akibat. r² tinggi hanya menunjukkan hubungan linear yang kuat.',
      },
    },
    judulResidu: 'B. Plot residu: acak atau berpola?',
    instruksiResidu:
      'Plot residu menggambar residu e = y − ŷ setiap titik terhadap garis regresi. Bandingkan plot residu pasangan A dan C, lalu tentukan polanya.',
    residuPasangan: ['A', 'C'],
    opsiPola: [
      { id: 'acak', label: 'Acak di sekitar nol — tanpa pola' },
      { id: 'lengkung', label: 'Berpola lengkung (positif–negatif–positif)' },
      { id: 'corong', label: 'Makin melebar seperti corong' },
    ],
    umpanPola: {
      acak: 'Residu naik-turun acak di sekitar garis nol: garis lurus menangkap pola data dengan baik.',
      lengkung:
        'Residu positif di ujung-ujung dan negatif di tengah: data melengkung, garis lurus meleset secara sistematis.',
      corong:
        'Perhatikan lagi: lebar sebaran residu tidak bertambah terus dari kiri ke kanan. Lihat urutan tandanya.',
    },
    tanyaSesuai: [
      {
        id: 'c2',
        tanya:
          'Pasangan C punya r ≈ 0,96, hampir setinggi pasangan A. Apakah model garis lurus sesuai untuk C?',
        opsi: [
          {
            id: 'kurang',
            label:
              'Kurang sesuai — residunya berpola lengkung, jadi prediksi meleset secara sistematis',
          },
          { id: 'sesuai', label: 'Sesuai, karena r-nya sangat tinggi' },
          {
            id: 'tidakAda',
            label: 'Tidak ada hubungan sama sekali antara waktu muat dan bounce rate',
          },
          { id: 'negatif', label: 'Sesuai, asal kemiringannya dibuat negatif' },
        ],
        correct: 'kurang',
        umpan: {
          kurang:
            'Tepat! r tinggi hanya berarti titik-titik dekat dengan SUATU garis. Pola lengkung pada residu menunjukkan bentuk hubungannya bukan garis lurus.',
          sesuai:
            'Inilah jebakannya! r tinggi belum menjamin model linear sesuai. Lihat plot residu C: tandanya berpola +, −, +.',
          tidakAda:
            'Hubungannya justru kuat (bounce rate naik tajam saat halaman lambat), hanya bentuknya melengkung.',
          negatif: 'Data C naik, jadi kemiringan negatif malah makin salah.',
        },
      },
      {
        id: 'c3',
        tanya: 'Apa saran yang paling tepat untuk pasangan C?',
        opsi: [
          {
            id: 'lengkung',
            label:
              'Pakai model lengkung (tidak linear), atau batasi prediksi pada rentang yang hampir lurus',
          },
          { id: 'hapus', label: 'Hapus titik-titik di ujung agar datanya lurus' },
          { id: 'garis', label: 'Tetap pakai garis lurus tanpa catatan apa pun' },
          { id: 'ganti', label: 'Ganti variabel y dengan rating aplikasi' },
        ],
        correct: 'lengkung',
        umpan: {
          lengkung:
            'Tepat! Model harus mengikuti bentuk data. Garis lurus boleh dipakai terbatas dengan catatan ketidakpastiannya.',
          hapus:
            'Menghapus data agar cocok dengan model tidak jujur. Model yang harus menyesuaikan data.',
          garis:
            'Prediksi di ujung-ujung rentang akan meleset jauh; klien perlu tahu keterbatasannya.',
          ganti:
            'Pertanyaan klien tetap tentang waktu muat dan bounce rate; mengganti variabel tidak menjawabnya.',
        },
      },
    ],
    temuan: [
      'Koefisien determinasi r² = proporsi variasi y yang dijelaskan model linear (mis. r² = 0,94 → 94%).',
      'Model linear sesuai bila |r| kuat DAN plot residu acak di sekitar nol.',
      'Residu yang berpola (mis. lengkung) menandakan model garis lurus kurang sesuai, walaupun r tinggi.',
    ],
    nextLabel: 'Lanjut: Susun Rekomendasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — KARYA: KARTU REKOMENDASI DASBOR (PBL sintaks 4)
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 6 · Mengembangkan & Menyajikan Karya',
    syntax: PBL + ' · Sintaks 4',
    goal: 'Menyusun rekomendasi fitur prediksi untuk setiap pasangan metrik berdasarkan r, r², dan pola residu.',
    guru: 'Minta setiap kelompok menjelaskan satu keputusan dengan tiga bukti: nilai r, tafsir arah-kekuatannya, dan pola residu. Presenter menyajikan kartu seolah di depan klien (± 2 menit).',
    instruksi:
      'Untuk setiap pasangan, pilih keputusan yang paling tepat. Ringkasan r, r², dan pola residu ditampilkan sebagai bukti.',
    tanyaKeputusan: 'Keputusan untuk pasangan ini:',
    opsiKeputusan: [
      { id: 'layak', label: '✅ Layak — model garis lurus sesuai untuk prediksi' },
      {
        id: 'bukanLinear',
        label: '〰️ Hubungan kuat tetapi melengkung — garis lurus kurang sesuai',
      },
      { id: 'lemah', label: '⚠️ Hubungan linear sedang/lemah — prediksi kurang andal' },
      { id: 'tidakAda', label: '⛔ Hampir tidak ada hubungan linear — jangan dibuat prediksi' },
    ],
    umpanKeputusan: {
      layak: 'r kuat dan residu acak: model garis lurus menggambarkan data dengan baik.',
      bukanLinear:
        'r tinggi, tetapi plot residu berpola lengkung: bentuk hubungannya bukan garis lurus.',
      lemah:
        'Arahnya terlihat, tetapi titik menyebar cukup jauh dari garis; prediksinya kurang tepat.',
      tidakAda:
        'r hampir 0: nomor ID tidak membantu menebak skor. Wajar, karena ID hanya nomor urut.',
    },
    pesanLabel: 'Tulis pesan singkat kelompokmu untuk Kak Nadia',
    pesanPlaceholder:
      'Contoh: Kami merekomendasikan fitur prediksi untuk pasangan A karena r = 0,97 dan residunya acak, sedangkan …',
    posterJudul: 'Kartu Rekomendasi — Fitur Prediksi Dasbor NgodingYuk',
    posterFooter: 'Tim Magang RPL · Dianalisis dengan koefisien korelasi, r², dan plot residu',
    nextLabel: 'Lanjut: Evaluasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — ANALISIS & EVALUASI (PBL sintaks 5)
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 7 · Analisis & Evaluasi',
    syntax: PBL + ' · Sintaks 5',
    goal: 'Menilai pendapat teman, membandingkan dugaan awal dengan hasil penyelidikan, dan menyusun simpulan.',
    guru: 'Gunakan pendapat yang keliru sebagai bahan diskusi: minta murid membuktikannya dengan Penjelajah r, Lab Pencilan, atau plot residu. Tekankan perbedaan korelasi dan sebab-akibat.',
    judulA: 'A. Tepat atau keliru?',
    opsiPendapat: [
      { id: 'tepat', label: 'Tepat' },
      { id: 'keliru', label: 'Keliru' },
    ],
    pendapat: [
      {
        id: 'e1',
        teks: 'Raka: "r = −0,85 menunjukkan hubungan yang lemah karena nilainya negatif."',
        correct: 'keliru',
        explanation:
          'Kekuatan dibaca dari |r| = 0,85 → kuat. Tanda negatif hanya menunjukkan arah.',
      },
      {
        id: 'e2',
        teks: 'Sari: "Pasangan C punya r ≈ 0,96, jadi garis lurus pasti cocok."',
        correct: 'keliru',
        explanation: 'Plot residu C berpola lengkung; r tinggi belum menjamin model linear sesuai.',
      },
      {
        id: 'e3',
        teks: 'Dimas: "r² = 0,94 berarti sekitar 94% variasi skor dijelaskan oleh model jam latihan."',
        correct: 'tepat',
        explanation: 'Itulah tafsir koefisien determinasi r².',
      },
      {
        id: 'e4',
        teks: 'Putri: "Korelasi kuat antara jam latihan dan skor membuktikan latihan PASTI menyebabkan skor naik."',
        correct: 'keliru',
        explanation:
          'Korelasi bukan bukti sebab-akibat; bisa ada faktor lain, misalnya motivasi pengguna.',
      },
      {
        id: 'e5',
        teks: 'Bagas: "Satu pencilan bisa menurunkan r dengan drastis, jadi pencilan harus diselidiki dulu."',
        correct: 'tepat',
        explanation: 'Akun uji QA menurunkan r pasangan A dari 0,97 menjadi 0,57.',
      },
      {
        id: 'e6',
        teks: 'Lina: "r ≈ 0 pada pasangan D berarti nomor ID tidak membantu menebak skor dengan garis lurus."',
        correct: 'tepat',
        explanation: 'r ≈ 0,04 → hampir tidak ada hubungan linear.',
      },
      {
        id: 'e7',
        teks: 'Yoga: "Nilai r bisa lebih dari 1 kalau datanya sangat banyak."',
        correct: 'keliru',
        explanation: 'Berapa pun banyak datanya, r selalu berada di antara −1 dan 1.',
      },
      {
        id: 'e8',
        teks: 'Nadia: "Model linear sesuai bila r kuat dan residunya tersebar acak di sekitar nol."',
        correct: 'tepat',
        explanation: 'Kedua bukti itu dipakai bersama untuk mengevaluasi kesesuaian model.',
      },
    ],
    judulB: 'B. Dugaan awal vs hasil penyelidikan',
    judulC: 'C. Susun simpulan kelompok',
    instruksiC:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai sekali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'Tanda koefisien korelasi r menunjukkan', correct: 'b1' },
      { id: 'k2', awal: 'Kekuatan hubungan linear dibaca dari', correct: 'b2' },
      { id: 'k3', awal: 'Koefisien determinasi r² menyatakan', correct: 'b3' },
      { id: 'k4', awal: 'Model linear dinilai sesuai bila', correct: 'b4' },
    ],
    bank: [
      { id: 'b1', teks: 'arah hubungan: positif (naik bersama) atau negatif (berlawanan).' },
      { id: 'b2', teks: 'nilai mutlak |r|: makin dekat ke 1, makin kuat.' },
      { id: 'b3', teks: 'proporsi variasi y yang dijelaskan oleh model linear.' },
      { id: 'b4', teks: '|r| kuat dan plot residunya acak di sekitar nol.' },
      { id: 'x1', teks: 'bahwa x pasti menyebabkan perubahan y.' },
      { id: 'x2', teks: 'banyaknya titik yang tepat dilalui garis.' },
      { id: 'x3', teks: 'r bernilai lebih dari 1.' },
    ],
    rangkuman: [
      'Koefisien korelasi <strong>r = Sxy / √(Sxx · Syy)</strong> selalu bernilai −1 ≤ r ≤ 1; spreadsheet: <code>=CORREL</code>.',
      '<strong>Tanda r</strong> menunjukkan arah (positif/negatif); <strong>|r|</strong> menunjukkan kekuatan: ≥ 0,7 kuat, 0,4–0,7 sedang, 0,2–0,4 lemah, &lt; 0,2 hampir tidak ada.',
      '<strong>r²</strong> (koefisien determinasi) = proporsi variasi y yang dijelaskan model linear.',
      'Model linear <strong>sesuai</strong> bila |r| kuat dan <strong>plot residu acak</strong>; residu berpola (lengkung) berarti garis lurus kurang sesuai.',
      'Pencilan dapat mengubah r secara drastis, dan <strong>korelasi bukan sebab-akibat</strong>.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP (masalah baru)
     Delapan soal diambil acak dari bank empat belas soal.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: PBL + ' · Masalah baru',
    goal: 'Menerapkan koefisien korelasi dan evaluasi kesesuaian model linear pada masalah baru.',
    guru: 'Murid mengerjakan secara mandiri. Amati soal mana yang sering meminta petunjuk; bahas satu soal dengan diagnosa terbanyak di akhir tahap.',
    instruksi:
      'Kerjakan secara mandiri. Soal pilihan ganda hanya bisa dijawab sekali; soal isian boleh dicoba lagi dan ada petunjuk. Gunakan koma untuk desimal, mis. 0,75 atau −0,6.',
    banyak: 8,
    komposisi: { choice: 6, isian: 2 },
    soal: [
      {
        id: 't1',
        type: 'choice',
        cerita:
          'Tim server mencatat banyak pengguna aktif dan waktu respons API. Spreadsheet memberi r = 0,86.',
        pertanyaan: 'Arah dan kekuatan hubungannya adalah …',
        options: [
          { id: 'pk', label: 'Positif kuat' },
          { id: 'nk', label: 'Negatif kuat' },
          { id: 'ps', label: 'Positif sedang' },
          { id: 'tidak', label: 'Hampir tidak ada hubungan' },
        ],
        correct: 'pk',
        cek: { tipe: 'tafsir', r: 0.86 },
        explanation: 'r > 0 → positif; |r| = 0,86 ≥ 0,7 → kuat.',
      },
      {
        id: 't2',
        type: 'choice',
        cerita:
          'Data aplikasi belajar: persentase baterai saat membuka aplikasi dan lama sesi belajar memberi r = −0,52.',
        pertanyaan: 'Arah dan kekuatan hubungannya adalah …',
        options: [
          { id: 'ns', label: 'Negatif sedang' },
          { id: 'nk', label: 'Negatif kuat' },
          { id: 'ps', label: 'Positif sedang' },
          { id: 'nl', label: 'Negatif lemah' },
        ],
        correct: 'ns',
        cek: { tipe: 'tafsir', r: -0.52 },
        explanation: 'r < 0 → negatif; 0,4 ≤ |r| = 0,52 < 0,7 → sedang.',
      },
      {
        id: 't3',
        type: 'choice',
        cerita:
          'Empat pasangan metrik aplikasi memiliki r: P = 0,62; Q = −0,91; R = 0,35; S = 0,05.',
        pertanyaan: 'Pasangan dengan hubungan linear PALING kuat adalah …',
        options: [
          { id: 'Q', label: 'Q (r = −0,91)' },
          { id: 'P', label: 'P (r = 0,62)' },
          { id: 'R', label: 'R (r = 0,35)' },
          { id: 'S', label: 'S (r = 0,05)' },
        ],
        correct: 'Q',
        cek: { tipe: 'terkuat', r: { P: 0.62, Q: -0.91, R: 0.35, S: 0.05 } },
        explanation: 'Kekuatan dibaca dari |r|: |−0,91| = 0,91 paling besar.',
      },
      {
        id: 't4',
        type: 'choice',
        cerita: 'Seorang murid menghitung koefisien korelasi dan mendapat r = 1,35.',
        pertanyaan: 'Tanggapan yang tepat adalah …',
        options: [
          { id: 'salah', label: 'Pasti ada kesalahan hitung, karena −1 ≤ r ≤ 1' },
          { id: 'sangat', label: 'Hubungannya sangat kuat, lebih dari sempurna' },
          { id: 'persen', label: 'Artinya 135% variasi dijelaskan model' },
          { id: 'wajar', label: 'Wajar bila datanya banyak' },
        ],
        correct: 'salah',
        explanation:
          'r selalu di antara −1 dan 1; hasil 1,35 menandakan salah hitung (mis. lupa akar).',
      },
      {
        id: 't5',
        type: 'choice',
        cerita:
          'Model linear ukuran unggahan foto → waktu unggah punya r = 0,95, tetapi plot residunya: + + − − − − − + + (berurutan dari x kecil ke besar).',
        pertanyaan: 'Kesimpulan yang tepat tentang model linear itu adalah …',
        options: [
          { id: 'kurang', label: 'Kurang sesuai, karena residunya berpola lengkung' },
          { id: 'sesuai', label: 'Sesuai, karena r = 0,95' },
          { id: 'tidakAda', label: 'Tidak ada hubungan antara ukuran dan waktu unggah' },
          { id: 'sebab', label: 'Ukuran foto pasti satu-satunya penyebab waktu unggah' },
        ],
        correct: 'kurang',
        explanation:
          'Residu berpola (bukan acak) menandakan hubungan melengkung; garis lurus kurang sesuai.',
      },
      {
        id: 't6',
        type: 'choice',
        cerita:
          'Data jam pemakaian aplikasi (x) dan kuota terpakai dalam GB (y) untuk enam pengguna: (1; 0,6), (2; 1,1), (3; 1,4), (4; 2,1), (5; 2,4), (6; 3,1).',
        pertanyaan: 'Keputusan tentang model garis lurus untuk data ini adalah …',
        options: [
          { id: 'layak', label: 'Layak — hubungan positif kuat dengan residu acak' },
          { id: 'bukanLinear', label: 'Hubungan kuat tetapi melengkung' },
          { id: 'lemah', label: 'Hubungan linear lemah' },
          { id: 'tidakAda', label: 'Tidak ada hubungan linear' },
        ],
        correct: 'layak',
        cek: {
          tipe: 'keputusan',
          titik: [
            { x: 1, y: 0.6 },
            { x: 2, y: 1.1 },
            { x: 3, y: 1.4 },
            { x: 4, y: 2.1 },
            { x: 5, y: 2.4 },
            { x: 6, y: 3.1 },
          ],
        },
        explanation: 'r ≈ 0,99 (positif kuat) dan residunya berganti tanda secara acak.',
      },
      {
        id: 't7',
        type: 'choice',
        cerita: 'Data x ada di sel A2:A21 dan data y di sel B2:B21.',
        pertanyaan: 'Rumus sel untuk koefisien korelasi r adalah …',
        options: [
          { id: 'correl', label: '=CORREL(A2:A21;B2:B21)' },
          { id: 'rsq', label: '=RSQ(B2:B21;A2:A21)' },
          { id: 'slope', label: '=SLOPE(B2:B21;A2:A21)' },
          { id: 'average', label: '=AVERAGE(A2:B21)' },
        ],
        correct: 'correl',
        explanation: '=CORREL memberi r; =RSQ memberi r²; =SLOPE memberi kemiringan garis regresi.',
      },
      {
        id: 't8',
        type: 'choice',
        cerita:
          'Survei menunjukkan r = 0,8 antara banyak kafe di suatu kota dan banyak startup teknologi di kota itu.',
        pertanyaan: 'Pernyataan yang tepat adalah …',
        options: [
          {
            id: 'faktor',
            label:
              'Keduanya berhubungan kuat, tetapi bisa dipengaruhi faktor lain (mis. jumlah penduduk)',
          },
          { id: 'sebab', label: 'Membuka kafe pasti menambah jumlah startup' },
          { id: 'balik', label: 'Startup pasti menyebabkan kafe dibuka' },
          { id: 'lemah', label: 'Hubungannya lemah karena r kurang dari 1' },
        ],
        correct: 'faktor',
        explanation:
          'Korelasi bukan sebab-akibat. Kota besar cenderung punya banyak kafe DAN banyak startup.',
      },
      {
        id: 't9',
        type: 'choice',
        cerita:
          'Data rating dan unduhan 12 aplikasi memberi r = 0,74. Setelah satu aplikasi dengan data unduhan salah input dikeluarkan, r = 0,31.',
        pertanyaan: 'Pernyataan yang tepat adalah …',
        options: [
          {
            id: 'pengaruh',
            label:
              'Satu titik berpengaruh besar; laporkan r tanpa data salah input beserta alasannya',
          },
          { id: 'pakaiBesar', label: 'Tetap laporkan r = 0,74 karena lebih besar' },
          { id: 'sama', label: 'Kedua nilai r sama saja artinya' },
          { id: 'hapusLagi', label: 'Terus hapus data sampai r mendekati 1' },
        ],
        correct: 'pengaruh',
        explanation:
          'Data salah input bukan bagian populasi, sehingga boleh dikeluarkan dan dilaporkan. Memilih angka demi terlihat bagus tidak jujur.',
      },
      {
        id: 't10',
        type: 'input',
        mode: 'isian',
        cerita: 'Dari suatu data diperoleh Sxy = 24, Sxx = 16, dan Syy = 64.',
        pertanyaan: 'Berapa koefisien korelasi r?',
        jawab: 0.75,
        diagnosa: 'korelasi',
        cek: { tipe: 'rincian', sxy: 24, sxx: 16, syy: 64 },
        hints: ['r = Sxy : √(Sxx × Syy).', '16 × 64 = 1.024 dan √1.024 = 32. Lalu 24 : 32.'],
        reveal: 'r = 24 : √(16 × 64) = 24 : 32 = 0,75.',
        explanation: 'Hubungan positif kuat.',
      },
      {
        id: 't11',
        type: 'input',
        mode: 'isian',
        cerita:
          'Dari data waktu tunggu antrean server diperoleh Sxy = −18, Sxx = 20, dan Syy = 45.',
        pertanyaan: 'Berapa koefisien korelasi r?',
        jawab: -0.6,
        diagnosa: 'korelasi',
        cek: { tipe: 'rincian', sxy: -18, sxx: 20, syy: 45 },
        hints: [
          'r = Sxy : √(Sxx × Syy); tanda r mengikuti tanda Sxy.',
          '√(20 × 45) = √900 = 30. Lalu −18 : 30.',
        ],
        reveal: 'r = −18 : √(20 × 45) = −18 : 30 = −0,6.',
        explanation: 'Hubungan negatif sedang.',
      },
      {
        id: 't12',
        type: 'input',
        mode: 'isian',
        cerita: 'Model linear banyak fitur → waktu pengembangan memiliki r = 0,9.',
        pertanyaan: 'Berapa persen variasi waktu pengembangan yang dijelaskan model (r² × 100)?',
        jawab: 81,
        satuan: '%',
        cek: { tipe: 'persenR2', r: 0.9 },
        hints: ['Kuadratkan r: 0,9 × 0,9.', 'r² = 0,81, lalu kalikan 100.'],
        reveal: 'r² = 0,9² = 0,81 → 81%.',
        explanation: 'Sekitar 81% variasi waktu pengembangan dijelaskan oleh banyak fitur.',
      },
      {
        id: 't13',
        type: 'input',
        mode: 'isian',
        cerita: 'Hubungan jarak pengguna ke server dan kecepatan unduh memiliki r = −0,7.',
        pertanyaan: 'Berapa koefisien determinasi r²?',
        jawab: 0.49,
        cek: { tipe: 'r2', r: -0.7 },
        hints: [
          'Kuadratkan r. Ingat: bilangan negatif dikuadratkan menjadi positif.',
          '(−0,7) × (−0,7) = …',
        ],
        reveal: 'r² = (−0,7)² = 0,49.',
        explanation: 'Sekitar 49% variasi kecepatan unduh dijelaskan oleh jarak ke server.',
      },
      {
        id: 't14',
        type: 'input',
        mode: 'isian',
        cerita: 'Dari data diperoleh Sxy = 30, Sxx = 25, dan Syy = 36.',
        pertanyaan: 'Berapa koefisien korelasi r?',
        jawab: 1,
        diagnosa: 'korelasi',
        cek: { tipe: 'rincian', sxy: 30, sxx: 25, syy: 36 },
        hints: ['√(25 × 36) = √900.', '30 : 30 = …'],
        reveal: 'r = 30 : √(25 × 36) = 30 : 30 = 1.',
        explanation: 'r = 1: hubungan positif sempurna — semua titik tepat pada satu garis naik.',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan strategi, pemakaian teknologi, dan perasaan setelah menyelesaikan masalah dasbor.',
    guru: 'Beri waktu hening 3 menit untuk menulis. Minta 2–3 murid membagikan contoh dua variabel dari proyek RPL mereka yang ingin diuji korelasinya.',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Mengapa r yang tinggi saja belum cukup untuk menyatakan model linear sesuai?',
        placeholder: 'Contoh: karena r hanya mengukur … sedangkan pola residu …',
      },
      {
        id: 'q2',
        teks: 'Apa yang kamu pelajari dari Lab Pencilan tentang kejujuran dalam mengolah data?',
        placeholder: 'Contoh: data boleh dikeluarkan hanya jika …',
      },
      {
        id: 'q3',
        teks: 'Pasangan variabel apa di proyek RPL yang ingin kamu uji korelasinya? Apa dugaanmu?',
        placeholder: 'Contoh: banyak baris kode dan banyak bug, dugaanku …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menganalisis korelasi dan mengevaluasi model linear sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '😊 Yakin — aku bisa mengerjakan sendiri' },
      { id: 'cukup', label: '🙂 Cukup — kadang masih perlu petunjuk' },
      { id: 'belum', label: '🤔 Belum yakin — aku perlu berlatih lagi' },
    ],
    nextLabel: 'Simpan Refleksi & Selesai →',
  },

  selesai: {
    judul: 'Rekomendasi Terkirim ke Klien!',
    teks: 'Kamu berhasil menganalisis arah dan kekuatan hubungan dengan koefisien korelasi serta mengevaluasi kesesuaian model linear untuk dasbor NgodingYuk.',
    contoh: [
      { ikon: '🧮', nama: 'Koefisien korelasi', isi: 'r = Sxy / √(Sxx · Syy)' },
      { ikon: '🧭', nama: 'Arah & kekuatan', isi: 'tanda r & |r|' },
      { ikon: '📊', nama: 'Koefisien determinasi', isi: 'r² = proporsi variasi' },
      { ikon: '📉', nama: 'Model sesuai', isi: '|r| kuat + residu acak' },
    ],
    capaian: [
      'Menentukan arah dan kekuatan hubungan dua variabel dari diagram pencar dan nilai r.',
      'Menghitung koefisien korelasi r langkah demi langkah dan memeriksanya dengan =CORREL.',
      'Menjelaskan pengaruh pencilan terhadap r dan menafsirkan r².',
      'Mengevaluasi kesesuaian model linear dengan r dan pola plot residu, lalu memberi rekomendasi beralasan.',
    ],
  },
};
