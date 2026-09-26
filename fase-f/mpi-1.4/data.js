'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Proyek Mini Barisan & Deret Aritmetika
   Fase F — SMK Rekayasa Perangkat Lunak (Kelas XI)
   Topik 1 · Barisan dan Deret Aritmetika

   Tujuan Pembelajaran:
   Menyelesaikan masalah kontekstual yang melibatkan barisan dan deret
   aritmetika melalui proyek mini terapan.

   Prasyarat: fase-f/mpi-1.1 (beda), fase-f/mpi-1.2 (Uₙ = a + (n − 1)b)
   dan fase-f/mpi-1.3 (Sₙ = n/2 (2a + (n − 1)b)).

   Model pembelajaran: PROJECT BASED LEARNING (PjBL).
   Proyek: "Pameran Mini App Perencana".
   Bu Wulan, pembina Pameran Karya RPL, meneruskan tiga brief klien.
   Setiap kelompok memilih SATU brief, lalu membangun "mini app
   perencana" yang menjawab empat fitur: nilai pada periode ke-n (Uₙ),
   total sampai periode ke-n (Sₙ), kapan target tercapai (n minimal
   dengan Sₙ ≥ target), dan fitur lanjutan (mengatur ulang a atau b).
     • Tabungan Laptop (Koperasi Siswa) — a = Rp20.000, b = Rp5.000;
       U₂₄ = Rp135.000, S₂₄ = Rp1.860.000, target Rp4.000.000 tercapai
       minggu ke-37, beda minimal agar tercapai dalam 30 minggu = Rp8.000.
     • Log Server Sekolah (Tim IT) — a = 120 MB, b = 30 MB/hari;
       U₂₀ = 690 MB, S₂₀ = 8.100 MB, disk 30.000 MB penuh hari ke-42,
       pertambahan maksimal agar disk bertahan 60 hari = 12 MB/hari.
     • Kursi Pentas Seni (OSIS) — a = 20 kursi, b = 4 kursi/baris;
       U₁₅ = 76, S₁₅ = 720, 600 penonton butuh 14 baris, kursi baris
       pertama minimal agar 12 baris menampung 600 penonton = 28.
   Semua kunci DIHITUNG engine (hitungBriefDeret) dan diverifikasi tes.

   Pemetaan sintaks PjBL ke tahap media:

     Sintaks 1 — Penentuan pertanyaan mendasar ...... 'pertanyaan'
     Sintaks 2 — Mendesain perencanaan proyek ....... 'rencana'
     Sintaks 3 — Menyusun jadwal .................... 'jadwal'
     Sintaks 4 — Memonitor murid & kemajuan proyek .. 'modelMat',
                                                      'prototipe',
                                                      'ujiKasus'
     Sintaks 5 — Menguji hasil ...................... 'pameran'
     Asesmen penerapan .............................. 'terapkan'
     Sintaks 6 — Mengevaluasi pengalaman ............ 'refleksi'
     Penutup ........................................ 'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — kelompok merumuskan pertanyaan
       mendasar, merencanakan fitur, menyusun jadwal & definition of
       done, memantau kemajuan di papan kanban, lalu merefleksikan
       proses proyeknya.
     • Bermakna (meaningful) — brief klien nyata di sekolah; model
       matematika diterjemahkan menjadi fungsi JavaScript dan diuji
       dengan kasus uji seperti praktik test-driven development.
     • Menggembirakan (joyful) — memilih brief sendiri, lab perencana
       bergeser, test runner ✓/✗, "kode yang lolos padahal salah",
       Kartu Proyek untuk pameran.

   Rangkaian aktivitas (± 2 × 45 menit; kelompok 3–4 murid):
     1. Pertanyaan    (8')  — pesan pembina, tiga kartu brief, pemanasan
                              prasyarat Uₙ/Sₙ, pertanyaan mendasar,
                              memilah pertanyaan klien (suku/jumlah/kapan).
     2. Rencana       (8')  — memilih brief & peran, memetakan a, b, n,
                              target dari brief, memasangkan fitur mini
                              app dengan strateginya.
     3. Jadwal        (5')  — mengurutkan milestone, alokasi waktu,
                              definition of done, catatan pembagian tugas.
     4. M1 Model      (12') — kanban; rumus Uₙ brief, Uₙ klien, Sₙ klien
                              berdiagnosa miskonsepsi; cek kewajaran Sₙ.
     5. M2 Prototipe  (15') — lab perencana (slider a, b, n), n minimal
                              target, fitur lanjutan, kode kapanTercapai().
     6. M3 Uji Kasus  (15') — menghitung harapan kasus uji, menjalankan
                              kode tiga teman, memilih kode untuk di-merge,
                              menjelaskan "lolos padahal salah".
     7. Pameran       (12') — Kartu Proyek + pesan klien, penilaian
                              sejawat (klaim tepat/keliru), rubrik diri.
     8. Uji terap     (10') — 8 soal acak dari bank 14 soal.
     9. Refleksi      (5')  — rekap capaian, refleksi pengalaman proyek.

   Catatan pengacakan: SEMUA daftar pilihan di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di urutan pertama). app.js
   mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / ensureTapOrderState / shuffleArray dari
   shared/engine.js) dan menyimpannya di State, sehingga tiap murid dan
   tiap Reset mendapat urutan berbeda. Soal uji terap bertanda `gen`
   dibangkitkan opsinya oleh opsiJumlahDeret / opsiSukuDeret /
   opsiNMinimal (kunci + pengecoh dari miskonsepsi) lalu ikut diacak.

   Metadata `kunci` / `cek` / `gen` dipakai tests/mpi-f-1.4-data.test.js
   untuk memeriksa kunci jawaban dengan fungsi engine seksi 21, 42 & 43.
   ============================================================ */

var PJBL = 'Project Based Learning';

var DATA = {
  meta: {
    judul: 'Proyek Mini Barisan & Deret Aritmetika',
  },

  tahap: [
    { id: 'pertanyaan', label: 'Pertanyaan' },
    { id: 'rencana', label: 'Rencana' },
    { id: 'jadwal', label: 'Jadwal' },
    { id: 'modelMat', label: 'M1 Model' },
    { id: 'prototipe', label: 'M2 Prototipe' },
    { id: 'ujiKasus', label: 'M3 Uji' },
    { id: 'pameran', label: 'Pameran' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Kartu papan kanban (id = id tahap monitoring/pengujian). */
  milestone: [
    { id: 'modelMat', ikon: '🧮', label: 'M1 · Model matematika' },
    { id: 'prototipe', ikon: '🛠️', label: 'M2 · Prototipe mini app' },
    { id: 'ujiKasus', ikon: '🧪', label: 'M3 · Uji kasus kode' },
    { id: 'pameran', ikon: '🖼️', label: 'Pameran Kartu Proyek' },
  ],

  /* ----------------------------------------------------------
     BRIEF PROYEK — kunci dihitung ulang tes dengan hitungBriefDeret.
     lab: rentang slider lab perencana; lanjutan.ubah = slider yang
     diatur murid untuk fitur lanjutan.
     ---------------------------------------------------------- */
  brief: [
    {
      id: 'tabungan',
      ikon: '💻',
      judul: 'Tabungan Laptop',
      klien: 'Koperasi Siswa',
      rupiah: true,
      satuan: 'rupiah',
      periode: 'minggu',
      pesan:
        'Banyak siswa RPL ingin membeli laptop seharga Rp4.000.000. Kami membuat program menabung: minggu pertama setor Rp20.000, lalu setiap minggu setoran naik Rp5.000. Tolong buatkan mini app perencana tabungannya!',
      a: 20000,
      b: 5000,
      nSuku: 24,
      nJumlah: 24,
      target: 4000000,
      makna: {
        a: 'setoran minggu pertama',
        b: 'kenaikan setoran setiap minggu',
        n: 'banyak minggu yang ditanyakan klien untuk total tabungan',
        target: 'harga laptop (target tabungan)',
      },
      tanya: {
        suku: 'Berapa setoran pada minggu ke-24?',
        jumlah: 'Berapa total tabungan setelah 24 minggu?',
        target: 'Pada minggu ke berapa total tabungan pertama kali mencapai Rp4.000.000?',
        lanjutan:
          'Agar Rp4.000.000 terkumpul dalam 30 minggu (setoran awal tetap Rp20.000), berapa kenaikan setoran mingguan paling kecil? (kelipatan Rp1.000)',
      },
      lanjutan: { jenis: 'bedaMin', ubah: 'b', n: 30, target: 4000000, langkah: 1000 },
      lab: {
        a: { min: 5000, max: 50000, step: 5000 },
        b: { min: 0, max: 15000, step: 1000 },
        n: { min: 1, max: 52, step: 1 },
      },
      label: { a: 'Setoran minggu ke-1', b: 'Kenaikan per minggu', n: 'Minggu ke-n' },
      kunci: { un: 135000, sn: 1860000, nTarget: 37, lanjutan: 8000 },
    },
    {
      id: 'log',
      ikon: '🖥️',
      judul: 'Log Server Sekolah',
      klien: 'Tim IT Sekolah',
      rupiah: false,
      satuan: 'MB',
      periode: 'hari',
      pesan:
        'Server e-rapor menyimpan berkas log. Hari pertama log berukuran 120 MB, lalu setiap hari ukuran log harian bertambah 30 MB karena pengguna makin banyak. Disk cadangan kami hanya 30.000 MB. Kami butuh mini app untuk memantau kapasitasnya.',
      a: 120,
      b: 30,
      nSuku: 20,
      nJumlah: 20,
      target: 30000,
      makna: {
        a: 'ukuran log hari pertama (MB)',
        b: 'pertambahan ukuran log harian (MB)',
        n: 'banyak hari yang ditanyakan klien untuk total log',
        target: 'kapasitas disk cadangan (MB)',
      },
      tanya: {
        suku: 'Berapa ukuran log pada hari ke-20?',
        jumlah: 'Berapa total ukuran log selama 20 hari?',
        target: 'Pada hari ke berapa total log pertama kali mencapai 30.000 MB (disk penuh)?',
        lanjutan:
          'Tim IT ingin disk bertahan 60 hari (log hari pertama tetap 120 MB). Berapa pertambahan log harian paling besar yang masih aman? (bilangan bulat MB)',
      },
      lanjutan: { jenis: 'bedaMaks', ubah: 'b', n: 60, target: 30000, langkah: 1 },
      lab: {
        a: { min: 50, max: 300, step: 10 },
        b: { min: 0, max: 60, step: 1 },
        n: { min: 1, max: 90, step: 1 },
      },
      label: { a: 'Log hari ke-1', b: 'Pertambahan per hari', n: 'Hari ke-n' },
      kunci: { un: 690, sn: 8100, nTarget: 42, lanjutan: 12 },
    },
    {
      id: 'kursi',
      ikon: '🎭',
      judul: 'Kursi Pentas Seni',
      klien: 'OSIS',
      rupiah: false,
      satuan: 'kursi',
      periode: 'baris',
      pesan:
        'Untuk aplikasi tiket Pentas Seni, kursi aula disusun bertingkat: baris pertama 20 kursi, setiap baris berikutnya bertambah 4 kursi. Kami memperkirakan 600 penonton. Tolong buatkan mini app penghitung kursi!',
      a: 20,
      b: 4,
      nSuku: 15,
      nJumlah: 15,
      target: 600,
      makna: {
        a: 'banyak kursi baris pertama',
        b: 'pertambahan kursi setiap baris',
        n: 'banyak baris yang ditanyakan klien untuk total kursi',
        target: 'perkiraan banyak penonton',
      },
      tanya: {
        suku: 'Berapa kursi pada baris ke-15?',
        jumlah: 'Berapa kursi seluruhnya pada 15 baris?',
        target:
          'Paling sedikit berapa baris yang harus disiapkan agar 600 penonton mendapat kursi?',
        lanjutan:
          'Aula hanya muat 12 baris (pertambahan tetap 4 kursi per baris). Berapa kursi paling sedikit pada baris pertama agar 12 baris menampung 600 penonton?',
      },
      lanjutan: { jenis: 'sukuMin', ubah: 'a', n: 12, target: 600, langkah: 1 },
      lab: {
        a: { min: 10, max: 40, step: 1 },
        b: { min: 0, max: 10, step: 1 },
        n: { min: 1, max: 30, step: 1 },
      },
      label: { a: 'Kursi baris ke-1', b: 'Pertambahan per baris', n: 'Baris ke-n' },
      kunci: { un: 76, sn: 720, nTarget: 14, lanjutan: 28 },
    },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — PENENTUAN PERTANYAAN MENDASAR (PjBL sintaks 1)
     ---------------------------------------------------------- */
  pertanyaan: {
    kicker: 'Tahap 1 · Pertanyaan Mendasar',
    syntax: PJBL + ' · Sintaks 1',
    goal: 'Memahami tantangan proyek dan merumuskan pertanyaan mendasar yang akan dijawab mini app kelompok.',
    tp: 'Menyelesaikan masalah kontekstual yang melibatkan barisan dan deret aritmetika melalui proyek mini terapan.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Memetakan informasi masalah kontekstual ke a, b, n, dan target.',
      'Menggunakan Uₙ dan Sₙ untuk menjawab pertanyaan klien dan memeriksa kewajarannya.',
      'Menentukan kapan target tercapai dan mengatur ulang a atau b agar tenggat terpenuhi.',
      'Menyajikan hasil proyek dan menilai hasil kerja teman secara matematis.',
    ],
    guru: 'Bacakan pesan Bu Wulan dan tunjukkan ketiga brief. Tanyakan: "Apa kesamaan ketiga brief ini?" (ada sesuatu yang bertambah tetap setiap periode). Pemanasan menghidupkan kembali Uₙ dan Sₙ dari MPI 1.2–1.3. Jangan menentukan brief untuk kelompok; biarkan mereka memilih di tahap Rencana.',
    judul: 'Pameran Mini App Perencana',
    pesan:
      'Halo tim RPL! Dua minggu lagi ada Pameran Karya RPL. Tiga klien di sekolah butuh mini app perencana. Setiap kelompok memilih satu brief, membangun prototipenya, mengujinya, lalu memamerkan Kartu Proyek. Syarat utama: jawabannya harus tepat dan bisa dipertanggungjawabkan secara matematis. — Bu Wulan, Pembina Pameran',
    pertanyaanMendasar:
      'Bagaimana kita merancang mini app yang memakai barisan dan deret aritmetika untuk menjawab: berapa nilainya pada periode ke-n, berapa totalnya, dan kapan targetnya tercapai?',
    judulBrief: 'Tiga brief klien',
    judulPemanasan: 'Pemanasan: ingat lagi Uₙ dan Sₙ',
    pemanasan: [
      {
        id: 'p1',
        tanya:
          'Pada brief Tabungan Laptop, setoran minggu ke-1 Rp20.000 dan setiap minggu naik Rp5.000. Setoran mingguan itu membentuk …',
        opsi: [
          { id: 'aritmetika', label: 'Barisan aritmetika dengan a = 20.000 dan b = 5.000' },
          { id: 'tukar', label: 'Barisan aritmetika dengan a = 5.000 dan b = 20.000' },
          { id: 'geometri', label: 'Barisan geometri dengan rasio 5.000' },
          { id: 'acak', label: 'Bukan barisan, karena setorannya berubah-ubah' },
        ],
        correct: 'aritmetika',
        umpan: {
          aritmetika:
            'Tepat! Setoran bertambah tetap Rp5.000 setiap minggu: suku pertama a = 20.000, beda b = 5.000.',
          tukar:
            'Tertukar. Suku pertama adalah setoran minggu ke-1 (20.000); beda adalah kenaikannya (5.000).',
          geometri:
            'Setoran DITAMBAH 5.000, bukan dikali. Barisan dengan beda tetap adalah barisan aritmetika.',
          acak: 'Setorannya berubah, tetapi perubahannya selalu +5.000. Itu ciri barisan aritmetika.',
        },
      },
      {
        id: 'p2',
        tanya: 'Banyak kursi SELURUHNYA pada 15 baris aula dinyatakan dengan …',
        opsi: [
          { id: 'jumlah', label: 'S₁₅ — jumlah 15 suku pertama' },
          { id: 'suku', label: 'U₁₅ — suku ke-15' },
          { id: 'beda', label: 'b — beda barisan' },
          { id: 'n', label: 'n = 15 — banyak suku' },
        ],
        correct: 'jumlah',
        umpan: {
          jumlah: 'Benar! "Seluruhnya" berarti menjumlahkan semua baris: deret S₁₅.',
          suku: 'U₁₅ hanya kursi di baris ke-15. Yang ditanya adalah total semua baris.',
          beda: 'Beda adalah pertambahan kursi per baris (4), bukan totalnya.',
          n: 'n = 15 adalah banyak baris. Totalnya dihitung dengan Sₙ.',
        },
      },
      {
        id: 'p3',
        tanya: 'Pasangan rumus yang tepat untuk suku ke-n dan jumlah n suku pertama adalah …',
        opsi: [
          { id: 'benar', label: 'Uₙ = a + (n − 1)b  dan  Sₙ = n/2 (2a + (n − 1)b)' },
          { id: 'pakaiN', label: 'Uₙ = a + nb  dan  Sₙ = n/2 (2a + nb)' },
          { id: 'lupaBagi', label: 'Uₙ = a + (n − 1)b  dan  Sₙ = n (a + Uₙ)' },
          { id: 'kaliAkhir', label: 'Uₙ = a + (n − 1)b  dan  Sₙ = n × Uₙ' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! Dua rumus inilah "mesin" mini app kalian.',
          pakaiN: 'Suku pertama adalah a = a + 0 × b, jadi pengali b adalah (n − 1), bukan n.',
          lupaBagi: 'n(a + Uₙ) adalah deret maju + deret mundur = 2Sₙ. Jangan lupa bagi 2.',
          kaliAkhir:
            'n × Uₙ menganggap semua suku sebesar suku terakhir, padahal suku awal lebih kecil.',
        },
      },
    ],
    judulInti: 'Rumuskan pertanyaan mendasar proyek',
    inti: {
      id: 'inti',
      tanya: 'Pertanyaan mendasar yang harus dijawab proyek kalian adalah …',
      opsi: [
        {
          id: 'inti',
          label:
            'Bagaimana merancang mini app yang memakai barisan & deret aritmetika untuk menghitung nilai periode ke-n, total, dan kapan target tercapai?',
        },
        { id: 'tampilan', label: 'Bagaimana membuat tampilan mini app yang paling berwarna?' },
        { id: 'beda', label: 'Berapa kenaikan setoran, log, atau kursi pada setiap periode?' },
        { id: 'unduh', label: 'Aplikasi apa yang paling banyak diunduh siswa RPL?' },
      ],
      correct: 'inti',
      umpan: {
        inti: 'Tepat! Pertanyaan ini terbuka, menantang, dan hanya bisa dijawab dengan model barisan & deret. Tulis di papan kelompok.',
        tampilan:
          'Tampilan penting, tetapi klien meminta jawaban yang tepat secara matematis lebih dulu.',
        beda: 'Kenaikan sudah tertulis di brief. Itu bahan, bukan pertanyaan mendasarnya.',
        unduh: 'Menarik, tetapi tidak berhubungan dengan kebutuhan ketiga klien.',
      },
    },
    judulPilah: 'Pertanyaan klien ini dijawab dengan apa?',
    instruksiPilah:
      'Pilah setiap pertanyaan klien: dijawab dengan Uₙ (suku ke-n), Sₙ (jumlah n suku), atau mencari n (kapan target tercapai).',
    opsiPilah: [
      { id: 'suku', label: 'Uₙ — suku ke-n' },
      { id: 'jumlah', label: 'Sₙ — jumlah n suku' },
      { id: 'nMin', label: 'Cari n — kapan target tercapai' },
    ],
    pilah: [
      {
        id: 'q1',
        teks: '“Berapa setoran pada minggu ke-24?”',
        correct: 'suku',
        explanation: 'Setoran satu minggu saja: suku ke-24, U₂₄.',
      },
      {
        id: 'q2',
        teks: '“Berapa kursi di baris ke-15?”',
        correct: 'suku',
        explanation: 'Kursi pada satu baris: U₁₅.',
      },
      {
        id: 'q3',
        teks: '“Berapa total ukuran log selama 20 hari?”',
        correct: 'jumlah',
        explanation: 'Log hari ke-1 sampai ke-20 dijumlahkan: S₂₀.',
      },
      {
        id: 'q4',
        teks: '“Berapa kursi seluruhnya pada 15 baris?”',
        correct: 'jumlah',
        explanation: 'Semua baris dijumlahkan: S₁₅.',
      },
      {
        id: 'q5',
        teks: '“Minggu ke berapa total tabungan pertama kali mencapai Rp4.000.000?”',
        correct: 'nMin',
        explanation: 'Yang dicari adalah n terkecil dengan Sₙ ≥ 4.000.000.',
      },
      {
        id: 'q6',
        teks: '“Hari ke berapa disk 30.000 MB mulai penuh?”',
        correct: 'nMin',
        explanation: 'Disk penuh saat TOTAL log ≥ 30.000: n terkecil dengan Sₙ ≥ 30.000.',
      },
    ],
    nextLabel: 'Lanjut: Rencanakan Proyek →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENDESAIN PERENCANAAN PROYEK (PjBL sintaks 2)
     ---------------------------------------------------------- */
  rencana: {
    kicker: 'Tahap 2 · Desain Perencanaan Proyek',
    syntax: PJBL + ' · Sintaks 2',
    goal: 'Memilih brief, membagi peran, memetakan informasi brief ke a, b, n, dan target, serta merancang fitur mini app.',
    guru: 'Usahakan ketiga brief dipilih oleh kelompok yang berbeda agar pameran beragam. Saat pemetaan, minta Analis membacakan kalimat brief yang menjadi sumber setiap nilai. Brief dapat diganti selama tahap ini belum selesai.',
    briefLabel: 'Pilih brief kelompokmu',
    peranLabel: 'Pilih peranmu di tim proyek',
    peran: [
      { id: 'analis', label: '📊 Analis — menerjemahkan brief menjadi model matematika' },
      { id: 'programmer', label: '💻 Programmer — mengoperasikan lab & membaca kode' },
      { id: 'penguji', label: '🧪 Penguji — menyiapkan kasus uji & memeriksa hasil' },
      { id: 'presenter', label: '🎤 Presenter — menyajikan Kartu Proyek di pameran' },
    ],
    petaJudul: 'Petakan informasi brief',
    petaInstruksi:
      'Isi nilai setiap unsur dari brief yang kalian pilih. Uang cukup ditulis angkanya, mis. 20000 atau 20.000.',
    judulFitur: 'Rancang fitur mini app',
    instruksiFitur: 'Pasangkan setiap fitur mini app dengan strategi matematika yang tepat.',
    opsiFitur: [
      { id: 'suku', label: 'Uₙ = a + (n − 1)b' },
      { id: 'jumlah', label: 'Sₙ = n/2 (2a + (n − 1)b)' },
      { id: 'nMin', label: 'Cari n terkecil dengan Sₙ ≥ target' },
      { id: 'atur', label: 'Tetapkan n, lalu ubah a atau b sampai Sₙ memenuhi target/batas' },
    ],
    fitur: [
      {
        id: 'f1',
        teks: '🔢 Fitur 1 — Nilai pada periode ke-n',
        correct: 'suku',
        explanation: 'Nilai satu periode adalah suku ke-n.',
      },
      {
        id: 'f2',
        teks: '➕ Fitur 2 — Total sampai periode ke-n',
        correct: 'jumlah',
        explanation: 'Total adalah jumlah n suku pertama.',
      },
      {
        id: 'f3',
        teks: '🎯 Fitur 3 — Kapan target tercapai',
        correct: 'nMin',
        explanation:
          'Coba n = 1, 2, 3, … (atau lab) sampai Sₙ pertama kali ≥ target. n itulah jawabannya.',
      },
      {
        id: 'f4',
        teks: '⚙️ Fitur 4 — Atur ulang rencana agar tenggat terpenuhi',
        correct: 'atur',
        explanation:
          'Tenggat menetapkan n; yang diubah adalah suku pertama a atau beda b, lalu Sₙ diperiksa lagi.',
      },
    ],
    nextLabel: 'Lanjut: Susun Jadwal →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MENYUSUN JADWAL (PjBL sintaks 3)
     ---------------------------------------------------------- */
  jadwal: {
    kicker: 'Tahap 3 · Menyusun Jadwal',
    syntax: PJBL + ' · Sintaks 3',
    goal: 'Mengurutkan milestone proyek, membagi waktu, dan menyepakati kriteria selesai.',
    guru: 'Tuliskan tenggat setiap milestone di papan kelas. Tekankan "definition of done": milestone selesai bila hasilnya sudah diperiksa, bukan sekadar dikerjakan. Pantau kelompok yang ingin langsung ke pameran tanpa menguji.',
    judulUrut: 'Urutkan milestone proyek',
    instruksiUrut: 'Ketuk kartu milestone sesuai urutan kerja yang masuk akal.',
    urutan: [
      { id: 'u1', label: '🧮 M1 Model — rumus Uₙ, hitung Uₙ & Sₙ klien' },
      { id: 'u2', label: '🛠️ M2 Prototipe — lab perencana, target & fitur lanjutan' },
      { id: 'u3', label: '🧪 M3 Uji kasus — harapan & jalankan tes kode' },
      { id: 'u4', label: '🖼️ Pameran — Kartu Proyek & penilaian sejawat' },
      { id: 'u5', label: '🔁 Refleksi pengalaman proyek' },
    ],
    judulTanya: 'Waktu & kriteria selesai',
    tanya: [
      {
        id: 'j1',
        tanya:
          'Tersedia 60 menit untuk tiga milestone dan persiapan pameran. Pembagian waktu yang paling masuk akal adalah …',
        opsi: [
          { id: 'seimbang', label: 'M1 15′ · M2 20′ · M3 15′ · siapkan pameran 10′' },
          { id: 'awal', label: 'M1 45′ · M2 10′ · M3 5′ · pameran 0′' },
          { id: 'tanpaUji', label: 'M1 10′ · M2 50′ · uji kasus nanti saja kalau sempat' },
          { id: 'langsung', label: 'Langsung siapkan pameran 60′, hitungan menyusul' },
        ],
        correct: 'seimbang',
        umpan: {
          seimbang:
            'Seimbang! Prototipe paling banyak eksplorasi, uji kasus tetap mendapat waktu cukup.',
          awal: 'M1 terlalu lama; prototipe dan uji kasus jadi terburu-buru.',
          tanpaUji:
            'Tanpa uji kasus, kalian tidak tahu apakah mini app benar. Uji wajib dijadwalkan.',
          langsung: 'Kartu Proyek tanpa hitungan yang teruji hanya "poster kosong".',
        },
      },
      {
        id: 'j2',
        tanya: 'Kapan Milestone 3 (Uji kasus) dianggap SELESAI (definition of done)?',
        opsi: [
          {
            id: 'lulus',
            label: 'Semua kasus uji punya harapan yang benar dan kode terpilih lolos semua kasus',
          },
          { id: 'ketik', label: 'Saat kodenya sudah selesai diketik' },
          { id: 'satu', label: 'Saat kode lolos satu kasus uji' },
          { id: 'pendek', label: 'Saat kodenya paling pendek di antara kode teman' },
        ],
        correct: 'lulus',
        umpan: {
          lulus: 'Tepat! Kriteria yang bisa diperiksa membuat kemajuan proyek terukur.',
          ketik: 'Kode yang diketik belum tentu benar. Selesai berarti sudah terbukti lolos uji.',
          satu: 'Nanti kalian lihat: kode yang salah pun bisa lolos satu kasus!',
          pendek: 'Pendek tidak menjamin benar. Yang menentukan adalah hasil ujinya.',
        },
      },
    ],
    catatanLabel: 'Catatan jadwal: siapa mengerjakan apa (opsional)',
    catatanPlaceholder: 'Contoh: M1 — Analis & Penguji, tenggat menit ke-15 …',
    nextLabel: 'Mulai Milestone 1 →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MILESTONE 1: MODEL (PjBL sintaks 4)
     ---------------------------------------------------------- */
  modelMat: {
    kicker: 'Tahap 4 · Milestone 1 — Model Matematika',
    syntax: PJBL + ' · Sintaks 4',
    goal: 'Menyusun rumus Uₙ untuk brief, lalu menjawab pertanyaan klien tentang Uₙ dan Sₙ.',
    guru: 'Berkeliling ke setiap kelompok (monitoring). Gunakan papan kanban untuk menanyakan status: "Kartu mana yang sedang kalian kerjakan?" Bila diagnosa menunjukkan lupa ÷ 2 atau n × Uₙ, minta kelompok menjelaskan ulang asal-usul rumus Sₙ.',
    judulRumus: 'Rumus suku ke-n brief kelompokmu',
    instruksiRumus: 'Tulis Uₙ dalam bentuk sederhana Uₙ = (…)n + (…).',
    judulHitung: 'Jawab pertanyaan klien',
    judulCek: 'Checkpoint: apakah hasilmu masuk akal?',
    tanya: [
      {
        id: 'm1',
        tanya:
          'Untuk barisan naik (b > 0), cara cepat mengecek kewajaran S<sub>n</sub> adalah memastikan …',
        opsi: [
          { id: 'apit', label: 'n × a ≤ Sₙ ≤ n × Uₙ' },
          { id: 'kecil', label: 'Sₙ lebih kecil daripada Uₙ' },
          { id: 'kaliB', label: 'Sₙ = Uₙ × b' },
          { id: 'genap', label: 'Sₙ selalu bilangan genap' },
        ],
        correct: 'apit',
        umpan: {
          apit: 'Tepat! Setiap suku di antara a dan Uₙ, jadi totalnya di antara n × a dan n × Uₙ. Periksa angka kelompokmu!',
          kecil:
            'Terbalik: total n suku (Sₙ) lebih besar daripada satu suku (Uₙ) bila sukunya positif.',
          kaliB: 'Tidak ada hubungan seperti itu. Coba bandingkan Sₙ dengan n × a dan n × Uₙ.',
          genap: 'Sₙ bisa ganjil, mis. 5 + 7 + 9 = 21.',
        },
      },
    ],
    temuan: [
      'Uₙ = a + (n − 1)b menjawab fitur "nilai periode ke-n".',
      'Sₙ = n/2 (a + Uₙ) = n/2 (2a + (n − 1)b) menjawab fitur "total".',
      'Cek kewajaran: n × a ≤ Sₙ ≤ n × Uₙ untuk barisan naik.',
    ],
    nextLabel: 'Tandai M1 Selesai → Milestone 2',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MILESTONE 2: PROTOTIPE (PjBL sintaks 4)
     ---------------------------------------------------------- */
  prototipe: {
    kicker: 'Tahap 5 · Milestone 2 — Prototipe Mini App',
    syntax: PJBL + ' · Sintaks 4',
    goal: 'Memakai lab perencana untuk menentukan kapan target tercapai, menyelesaikan fitur lanjutan, dan memilih kode fungsinya.',
    guru: 'Minta Programmer menggeser slider sementara anggota lain memprediksi dulu ("menurutmu minggu ke berapa?"). Tanyakan mengapa jawabannya n yang PERTAMA kali mencapai target, bukan n saat tepat sama dengan target.',
    judulLab: 'Lab perencana: kapan target tercapai?',
    instruksiLab:
      'Geser n (dan boleh mencoba a atau b) untuk melihat Uₙ, Sₙ, dan batang terhadap target. Kembalikan ke nilai brief sebelum menjawab.',
    judulLanjutan: 'Fitur lanjutan',
    instruksiLanjutan:
      'Di lab ini banyak periode n dikunci pada tenggat klien. Ubah slider yang diizinkan sampai syarat klien terpenuhi dengan nilai paling hemat.',
    judulKode: 'Pilih kode fitur "kapan tercapai"',
    instruksiKode:
      'Programmer tim menulis empat versi isi fungsi kapanTercapai(a, b, target). Pilih yang mengembalikan periode PERTAMA saat total ≥ target.',
    tanyaKode: {
      id: 'k1',
      tanya: 'Isi fungsi <code>kapanTercapai(a, b, target)</code> yang tepat adalah …',
      opsi: [
        {
          id: 'benar',
          label:
            'let n = 0, total = 0; while (total < target) { n++; total += a + (n - 1) * b; } return n;',
        },
        {
          id: 'tambahB',
          label: 'let n = 0, total = a; while (total < target) { n++; total += b; } return n;',
        },
        {
          id: 'kembaliTotal',
          label:
            'let n = 0, total = 0; while (total < target) { n++; total += a + (n - 1) * b; } return total;',
        },
        {
          id: 'pakaiSuku',
          label: 'let n = 1; while (a + (n - 1) * b < target) { n++; } return n;',
        },
      ],
      correct: 'benar',
      umpan: {
        benar:
          'Tepat! Setiap putaran menambahkan suku ke-n ke total, dan berhenti begitu total ≥ target.',
        tambahB: 'Yang ditambahkan ke total seharusnya SUKU ke-n (a + (n − 1)b), bukan bedanya.',
        kembaliTotal:
          'Perhitungannya benar, tetapi fungsi harus mengembalikan periode n, bukan total.',
        pakaiSuku:
          'Kode ini mencari kapan SATU suku mencapai target (Uₙ ≥ target), bukan kapan totalnya mencapai target.',
      },
    },
    temuan: [
      'Target tercapai pada n terkecil dengan Sₙ ≥ target; periksa Sₙ₋₁ < target ≤ Sₙ.',
      'Bila tenggat menetapkan n, ubah a atau b lalu periksa Sₙ lagi.',
      'Algoritme "tambah suku sampai total ≥ target" menjadi fungsi kapanTercapai().',
    ],
    nextLabel: 'Tandai M2 Selesai → Milestone 3',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MILESTONE 3: UJI KASUS (PjBL sintaks 4)
     ---------------------------------------------------------- */
  ujiKasus: {
    kicker: 'Tahap 6 · Milestone 3 — Uji Kasus Kode',
    syntax: PJBL + ' · Sintaks 4',
    goal: 'Menghitung keluaran yang diharapkan untuk kasus uji, lalu menguji tiga versi fungsi jumlahDeret() dan memilih yang layak dipakai.',
    guru: 'Kaitkan dengan test-driven development: harapan ditulis SEBELUM kode dijalankan. Soroti kasus "jebakan": kode yang salah bisa lolos kasus tertentu (b = 0 atau suku terakhir 0). Ini alasan kasus uji harus beragam.',
    judulHarapan: 'Tulis harapan kasus uji',
    instruksiHarapan:
      'Seperti penguji perangkat lunak, hitung dulu Sₙ yang BENAR untuk setiap kasus sebelum kode dijalankan. Kasus 1 berasal dari brief kelompokmu.',
    kasus: [
      { id: 'k1', a: 5, b: 3, n: 4, hints: ['5 + 8 + 11 + 14', 'S₄ = 4/2 × (5 + 14)'] },
      { id: 'k2', a: 7, b: 0, n: 5, hints: ['Beda 0: semua suku sama, 7 + 7 + 7 + 7 + 7.'] },
      {
        id: 'k3',
        a: 10,
        b: -2,
        n: 6,
        hints: ['10 + 8 + 6 + 4 + 2 + 0', 'S₆ = 6/2 × (10 + 0)'],
      },
      { id: 'k4', a: 9, b: 4, n: 1, hints: ['Hanya satu suku: S₁ = U₁ = a.'] },
    ],
    judulRunner: 'Jalankan kode teman',
    instruksiRunner:
      'Tiga programmer mengirim versi fungsi jumlahDeret(a, b, n). Jalankan tes untuk setiap kode, lalu bandingkan hasilnya dengan harapan.',
    impls: [
      { id: 'loopKurang', nama: 'Kode Bima' },
      { id: 'rumus', nama: 'Kode Citra' },
      { id: 'pakaiN', nama: 'Kode Dodi' },
    ],
    tanya: [
      {
        id: 'rumus',
        tanya: 'Kode mana yang layak di-merge ke mini app kelompokmu?',
        opsi: [
          { id: 'rumus', label: 'Kode Citra — lolos semua kasus uji' },
          { id: 'loopKurang', label: 'Kode Bima — memakai perulangan, jadi pasti teliti' },
          { id: 'pakaiN', label: 'Kode Dodi — rumusnya paling pendek' },
          { id: 'semua', label: 'Ketiganya, karena masing-masing lolos minimal satu kasus' },
        ],
        correct: 'rumus',
        umpan: {
          rumus: 'Tepat! Hanya kode Citra yang hasilnya sama dengan harapan di semua kasus.',
          loopKurang:
            'Perulangan Bima memakai i < n sehingga suku terakhir tidak ikut dijumlah. Lihat kasus yang ✗.',
          pakaiN: 'Dodi memakai n × b, seharusnya (n − 1) × b. Lihat kasus yang ✗.',
          semua: 'Lolos satu kasus belum membuktikan kode benar. Kode harus lolos SEMUA kasus.',
        },
      },
      {
        id: 'dodi',
        tanya: 'Kode Dodi salah, tetapi lolos kasus a = 7, b = 0, n = 5. Mengapa?',
        opsi: [
          {
            id: 'bNol',
            label: 'Karena b = 0, sehingga n × b dan (n − 1) × b sama-sama bernilai 0',
          },
          { id: 'benar', label: 'Karena sebenarnya kode Dodi benar' },
          { id: 'ganjil', label: 'Karena n = 5 bilangan ganjil' },
          { id: 'prima', label: 'Karena a = 7 bilangan prima' },
        ],
        correct: 'bNol',
        umpan: {
          bNol: 'Tepat! Bug Dodi ada pada bagian b, dan kasus b = 0 "menyembunyikannya". Karena itu kasus uji harus beragam.',
          benar: 'Kode Dodi gagal pada kasus lain, jadi tidak benar.',
          ganjil: 'Kode Dodi juga gagal pada kasus dengan n ganjil lain. Perhatikan nilai b.',
          prima: 'Nilai a tidak berpengaruh pada bug ini. Perhatikan bagian yang dikalikan b.',
        },
      },
      {
        id: 'bima',
        tanya: 'Kode Bima salah, tetapi lolos kasus a = 10, b = −2, n = 6. Mengapa?',
        opsi: [
          {
            id: 'nol',
            label: 'Suku terakhir U₆ = 10 + 5 × (−2) = 0, jadi suku yang terlewat bernilai 0',
          },
          { id: 'negatif', label: 'Karena perulangan selalu benar untuk beda negatif' },
          { id: 'genap', label: 'Karena n = 6 bilangan genap' },
          { id: 'benar', label: 'Karena sebenarnya kode Bima benar' },
        ],
        correct: 'nol',
        umpan: {
          nol: 'Tepat! i < n melewatkan suku terakhir; kebetulan suku itu 0 sehingga totalnya tetap sama.',
          negatif: 'Beda negatif tidak memperbaiki bug i < n. Perhatikan nilai suku terakhir.',
          genap: 'Kode Bima gagal pada kasus lain dengan n genap (mis. n = 4).',
          benar: 'Kode Bima gagal pada kasus lain, jadi tidak benar.',
        },
      },
    ],
    temuan: [
      'Tulis harapan kasus uji sebelum menjalankan kode (test-driven).',
      'Kode yang salah bisa lolos kasus tertentu; gunakan kasus beragam: b = 0, n = 1, beda negatif, dan data brief.',
      'Kode layak dipakai bila lolos SEMUA kasus uji.',
    ],
    nextLabel: 'Tandai M3 Selesai → Pameran',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENGUJI HASIL: PAMERAN (PjBL sintaks 5)
     ---------------------------------------------------------- */
  pameran: {
    kicker: 'Tahap 7 · Pameran & Menguji Hasil',
    syntax: PJBL + ' · Sintaks 5',
    goal: 'Menyajikan Kartu Proyek, menilai klaim proyek kelompok lain, dan menilai proyek sendiri dengan rubrik.',
    guru: 'Atur pameran gaya "gallery walk": satu Presenter tinggal di meja, anggota lain berkunjung ke kelompok dengan brief berbeda. Penilaian sejawat di media berisi klaim yang sering muncul; minta murid menandai klaim serupa di kartu teman dengan catatan tempel.',
    posterJudul: 'Kartu Proyek Mini App Perencana',
    pesanLabel: 'Pesan singkat untuk klien (1–2 kalimat)',
    pesanPlaceholder: 'Contoh: Dengan setoran awal Rp20.000 naik Rp5.000, laptop terbeli pada …',
    posterFooter: 'Semua angka dihitung dengan Uₙ dan Sₙ serta diuji dengan kasus uji.',
    judulSejawat: 'Penilaian sejawat: klaim di Kartu Proyek teman',
    instruksiSejawat: 'Periksa setiap klaim. Tepat atau keliru?',
    opsiSejawat: [
      { id: 'benar', label: 'Tepat' },
      { id: 'keliru', label: 'Keliru' },
    ],
    sejawat: [
      {
        id: 'c1',
        teks: 'Tim Tabungan: “Setoran minggu ke-24 = 20.000 + 24 × 5.000 = Rp140.000.”',
        correct: 'keliru',
        cek: { tipe: 'suku', a: 20000, b: 5000, n: 24, klaim: 140000 },
        explanation: 'Pengali beda adalah (n − 1) = 23: U₂₄ = 20.000 + 23 × 5.000 = Rp135.000.',
      },
      {
        id: 'c2',
        teks: 'Tim Kursi: “14 baris cukup untuk 600 penonton karena S₁₄ = 644, sedangkan S₁₃ = 572.”',
        correct: 'benar',
        cek: { tipe: 'nMin', a: 20, b: 4, target: 600, klaim: 14 },
        explanation: 'Benar: S₁₃ = 572 < 600 ≤ S₁₄ = 644, jadi paling sedikit 14 baris.',
      },
      {
        id: 'c3',
        teks: 'Tim Log: “Total log 20 hari = 20 × 690 = 13.800 MB.”',
        correct: 'keliru',
        cek: { tipe: 'jumlah', a: 120, b: 30, n: 20, klaim: 13800 },
        explanation: 'n × Uₙ menganggap setiap hari 690 MB. S₂₀ = 20/2 × (120 + 690) = 8.100 MB.',
      },
      {
        id: 'c4',
        teks: 'Tim Log: “Disk 30.000 MB penuh pada hari ke-42 karena S₄₁ = 29.520 dan S₄₂ = 30.870.”',
        correct: 'benar',
        cek: { tipe: 'nMin', a: 120, b: 30, target: 30000, klaim: 42 },
        explanation: 'Benar: total pertama kali ≥ 30.000 pada hari ke-42.',
      },
      {
        id: 'c5',
        teks: 'Tim Tabungan: “Kode kami lolos kasus a = 7, b = 0, n = 5, jadi pasti benar untuk semua input.”',
        correct: 'keliru',
        explanation:
          'Satu kasus tidak cukup. Kasus b = 0 bahkan menyembunyikan bug pada bagian beda (seperti kode Dodi).',
      },
      {
        id: 'c6',
        teks: 'Tim Kursi: “Total kursi 15 baris = 15/2 × (20 + 76) = 720 kursi.”',
        correct: 'benar',
        cek: { tipe: 'jumlah', a: 20, b: 4, n: 15, klaim: 720 },
        explanation: 'Benar: U₁₅ = 76 dan S₁₅ = 15/2 × 96 = 720 kursi.',
      },
    ],
    judulRubrik: 'Penilaian diri dengan rubrik',
    instruksiRubrik: 'Pilih capaian yang paling jujur menggambarkan proyek kelompokmu.',
    rubrik: [
      {
        id: 'r1',
        kriteria: 'Ketepatan model & perhitungan',
        opsi: [
          {
            id: 'mahir',
            label: 'Mahir — semua jawaban klien tepat dan bisa dijelaskan dengan rumus',
          },
          { id: 'cakap', label: 'Cakap — sebagian besar tepat, penjelasan belum lengkap' },
          { id: 'berkembang', label: 'Berkembang — masih banyak yang perlu dibantu teman/guru' },
        ],
      },
      {
        id: 'r2',
        kriteria: 'Kualitas pengujian',
        opsi: [
          {
            id: 'mahir',
            label: 'Mahir — kasus uji beragam dan kami tahu mengapa kode lolos/gagal',
          },
          { id: 'cakap', label: 'Cakap — semua kasus dijalankan, alasan belum semua dipahami' },
          { id: 'berkembang', label: 'Berkembang — pengujian masih sekadarnya' },
        ],
      },
      {
        id: 'r3',
        kriteria: 'Kerja tim & presentasi',
        opsi: [
          { id: 'mahir', label: 'Mahir — semua anggota berperan dan bisa menjelaskan kartu' },
          { id: 'cakap', label: 'Cakap — sebagian besar anggota berperan aktif' },
          { id: 'berkembang', label: 'Berkembang — pekerjaan bertumpu pada satu-dua orang' },
        ],
      },
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP (asesmen penerapan)
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: PJBL + ' · Asesmen penerapan',
    goal: 'Menerapkan barisan dan deret aritmetika untuk menyelesaikan masalah kontekstual baru.',
    guru: 'Murid mengerjakan secara mandiri. Catat diagnosa yang paling sering muncul (lupa ÷ 2, n × Uₙ, a + nb, atau tertukar Uₙ dengan Sₙ) untuk dibahas bersama.',
    instruksi:
      'Kerjakan secara mandiri. Soal pilihan ganda hanya bisa dijawab sekali; soal isian boleh dicoba lagi dan ada petunjuk.',
    banyak: 8,
    komposisi: { choice: 5, isian: 3 },
    soal: [
      {
        id: 't1',
        type: 'choice',
        gen: { tipe: 'jumlah', a: 25, b: 5, n: 20, satuan: 'kursi' },
        cerita:
          'Tribun lapangan untuk class meeting: baris pertama 25 kursi, setiap baris berikutnya bertambah 5 kursi. Ada 20 baris.',
        pertanyaan: 'Berapa banyak kursi seluruhnya?',
        explanation: 'U₂₀ = 25 + 19 × 5 = 120, S₂₀ = 20/2 × (25 + 120) = 1.450 kursi.',
      },
      {
        id: 't2',
        type: 'choice',
        gen: { tipe: 'suku', a: 3, b: 2, n: 30, satuan: 'commit' },
        cerita:
          'Dalam tantangan 30 hari, Fajar membuat 3 commit pada hari pertama dan setiap hari menambah 2 commit dari hari sebelumnya.',
        pertanyaan: 'Berapa commit yang dibuat Fajar pada hari ke-30 saja?',
        explanation: 'U₃₀ = 3 + 29 × 2 = 61 commit (yang ditanya satu hari, bukan total).',
      },
      {
        id: 't3',
        type: 'choice',
        gen: { tipe: 'nMin', a: 10, b: 5, target: 500, awalan: 'hari ke-' },
        cerita:
          'Aplikasi kebugaran menantang pengguna: hari pertama 10 push-up, setiap hari bertambah 5 push-up.',
        pertanyaan: 'Pada hari ke berapa total push-up pertama kali mencapai 500?',
        explanation: 'S₁₂ = 450 < 500 dan S₁₃ = 13/2 × (10 + 70) = 520 ≥ 500, jadi hari ke-13.',
      },
      {
        id: 't4',
        type: 'choice',
        gen: { tipe: 'jumlah', a: 10000, b: 2000, n: 10, rupiah: true },
        cerita:
          'Laras menabung untuk membeli domain & hosting: minggu pertama Rp10.000, setiap minggu naik Rp2.000.',
        pertanyaan: 'Berapa total tabungan Laras setelah 10 minggu?',
        explanation:
          'U₁₀ = 10.000 + 9 × 2.000 = 28.000, S₁₀ = 10/2 × (10.000 + 28.000) = Rp190.000.',
      },
      {
        id: 't5',
        type: 'choice',
        gen: { tipe: 'suku', a: 120, b: 30, n: 10, satuan: 'MB' },
        cerita: 'Log aplikasi hari pertama 120 MB dan setiap hari bertambah 30 MB.',
        pertanyaan: 'Berapa ukuran log pada hari ke-10?',
        explanation: 'U₁₀ = 120 + 9 × 30 = 390 MB.',
      },
      {
        id: 't6',
        type: 'choice',
        gen: { tipe: 'nMin', a: 2, b: 2, target: 110, awalan: 'level ' },
        cerita:
          'Di sebuah game edukasi, level 1 memberi 2 koin, level 2 memberi 4 koin, level 3 memberi 6 koin, dan seterusnya.',
        pertanyaan: 'Setelah menyelesaikan level berapa total koin pertama kali mencapai 110?',
        explanation: 'S₉ = 90 < 110 dan S₁₀ = 10/2 × (2 + 20) = 110 ≥ 110, jadi level 10.',
      },
      {
        id: 't7',
        type: 'choice',
        cerita:
          'Sebuah fungsi jumlahDeret memakai perulangan for (let i = 1; i < n; i++) untuk menjumlahkan a + (i − 1)b.',
        pertanyaan: 'Apa yang sebenarnya dihitung fungsi itu?',
        options: [
          { id: 'kurang', label: 'Sₙ₋₁ — suku terakhir tidak ikut dijumlah' },
          { id: 'benar', label: 'Sₙ — jumlah n suku pertama' },
          { id: 'lebih', label: 'Sₙ₊₁ — satu suku terlalu banyak' },
          { id: 'dua', label: '2Sₙ — dijumlah dua kali' },
        ],
        correct: 'kurang',
        explanation: 'i < n berhenti di i = n − 1, jadi hanya n − 1 suku yang dijumlah: Sₙ₋₁.',
      },
      {
        id: 't8',
        type: 'choice',
        cerita:
          'Naura menabung Rp10.000 pada minggu pertama dan ingin total tabungannya minimal Rp1.000.000 dalam 20 minggu. Kenaikan setoran mingguannya dibuat tetap (kelipatan Rp500).',
        pertanyaan: 'Berapa kenaikan setoran mingguan paling kecil?',
        options: [
          { id: 'tepat', label: 'Rp4.500' },
          { id: 'kurang', label: 'Rp4.000' },
          { id: 'boros', label: 'Rp5.000' },
          { id: 'bukanKelipatan', label: 'Rp4.210' },
        ],
        correct: 'tepat',
        cek: {
          tipe: 'bedaMin',
          a: 10000,
          n: 20,
          target: 1000000,
          langkah: 500,
          jawab: 4500,
          rupiah: true,
        },
        explanation:
          'S₂₀ = 10 × (20.000 + 19b) ≥ 1.000.000 → 19b ≥ 80.000 → b ≥ 4.210,5. Kelipatan Rp500 terkecil: Rp4.500 (S₂₀ = Rp1.055.000; dengan Rp4.000 hanya Rp960.000).',
      },
      {
        id: 't9',
        type: 'choice',
        cerita:
          'Dasbor aplikasi mencatat total unduhan: sampai hari ke-9 ada 207 unduhan, sampai hari ke-10 ada 245 unduhan.',
        pertanyaan: 'Berapa unduhan pada hari ke-10 saja?',
        options: [
          { id: 'selisih', label: '38 unduhan' },
          { id: 'jumlah', label: '452 unduhan' },
          { id: 'rata', label: '24,5 unduhan' },
          { id: 'total', label: '245 unduhan' },
        ],
        correct: 'selisih',
        cek: { tipe: 'selisih', sn: 245, snm1: 207, jawab: 38 },
        explanation: 'U₁₀ = S₁₀ − S₉ = 245 − 207 = 38 unduhan.',
      },
      {
        id: 't10',
        type: 'input',
        mode: 'isian',
        satuan: 'soal',
        cerita:
          'Rafi berlatih soal coding: hari pertama 12 soal, setiap hari bertambah 4 soal, selama 15 hari.',
        pertanyaan: 'Berapa total soal yang dikerjakan Rafi selama 15 hari?',
        cek: { tipe: 'jumlah', a: 12, b: 4, n: 15 },
        jawab: 600,
        hints: [
          'a = 12, b = 4, n = 15. Hitung dulu U₁₅ = 12 + 14 × 4.',
          'S₁₅ = 15/2 × (12 + 68) = 15/2 × 80.',
        ],
        reveal: 'U₁₅ = 68, S₁₅ = 15/2 × 80 = 600.',
        explanation: 'Total soal selama 15 hari adalah 600.',
      },
      {
        id: 't11',
        type: 'input',
        mode: 'isian',
        satuan: 'unit',
        cerita:
          'Stok flashdisk di koperasi 500 unit pada bulan pertama, lalu setiap bulan berkurang 25 unit.',
        pertanyaan: 'Berapa stok flashdisk pada bulan ke-12?',
        cek: { tipe: 'suku', a: 500, b: -25, n: 12 },
        jawab: 225,
        hints: ['a = 500, b = −25 (berkurang), n = 12.', 'U₁₂ = 500 + 11 × (−25) = 500 − 275.'],
        reveal: 'U₁₂ = 500 − 275 = 225.',
        explanation: 'Stok bulan ke-12 adalah 225 unit.',
      },
      {
        id: 't12',
        type: 'input',
        mode: 'isian',
        satuan: '',
        cerita:
          'Klub robotik menjual stiker: minggu pertama terjual 40 lembar, setiap minggu naik 10 lembar. Target total penjualan 1.500 lembar.',
        pertanyaan: 'Pada minggu ke berapa total penjualan pertama kali mencapai 1.500 lembar?',
        cek: { tipe: 'nMin', a: 40, b: 10, target: 1500 },
        jawab: 15,
        hints: [
          'Hitung Sₙ = n/2 (80 + (n − 1) × 10) untuk beberapa n di sekitar 14–15.',
          'S₁₄ = 7 × 210 = 1.470 (belum), S₁₅ = 15/2 × 220 = 1.650.',
        ],
        reveal: 'S₁₄ = 1.470 < 1.500 ≤ S₁₅ = 1.650, jadi minggu ke-15.',
        explanation: 'Target tercapai pertama kali pada minggu ke-15.',
      },
      {
        id: 't13',
        type: 'input',
        mode: 'isian',
        satuan: 'MB',
        cerita:
          'Kuota internet bulanan kelas 12.000 MB untuk 30 hari. Pemakaian hari pertama 200 MB dan pemakaian harian direncanakan naik tetap setiap hari.',
        pertanyaan:
          'Berapa kenaikan pemakaian harian paling besar (bilangan bulat MB) agar kuota cukup untuk 30 hari?',
        cek: { tipe: 'bedaMaks', a: 200, n: 30, target: 12000, langkah: 1 },
        jawab: 13,
        hints: [
          'Syaratnya S₃₀ = 30/2 × (400 + 29b) ≤ 12.000.',
          '15 × (400 + 29b) ≤ 12.000 → 400 + 29b ≤ 800 → b ≤ 13,79…',
        ],
        reveal: 'b ≤ 13,79, jadi kenaikan paling besar 13 MB (S₃₀ = 11.655 MB).',
        explanation: 'Kenaikan 14 MB membuat S₃₀ = 12.090 MB, melebihi kuota.',
      },
      {
        id: 't14',
        type: 'input',
        mode: 'isian',
        satuan: 'soal',
        cerita:
          'Tim olimpiade ingin mengerjakan total paling sedikit 1.000 soal dalam 20 hari, dengan tambahan 3 soal setiap hari.',
        pertanyaan: 'Paling sedikit berapa soal yang harus dikerjakan pada hari pertama?',
        cek: { tipe: 'sukuMin', b: 3, n: 20, target: 1000, langkah: 1 },
        jawab: 22,
        hints: [
          'Syaratnya S₂₀ = 20/2 × (2a + 19 × 3) ≥ 1.000.',
          '10 × (2a + 57) ≥ 1.000 → 2a ≥ 43 → a ≥ 21,5.',
        ],
        reveal: 'a ≥ 21,5, jadi paling sedikit 22 soal (S₂₀ = 1.010).',
        explanation: 'Dengan 21 soal, S₂₀ = 990 masih kurang dari 1.000.',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — MENGEVALUASI PENGALAMAN (PjBL sintaks 6)
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Evaluasi Pengalaman',
    syntax: PJBL + ' · Sintaks 6',
    goal: 'Merefleksikan proses proyek, hal yang dipelajari dari pengujian, dan perbaikan untuk proyek berikutnya.',
    guru: 'Pimpin refleksi kelas singkat: apa yang berjalan baik, apa yang macet, dan apa yang akan diubah. Hubungkan dengan praktik retrospektif sprint di industri perangkat lunak.',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Bagian proyek mana yang paling menantang, dan bagaimana timmu mengatasinya?',
        placeholder: 'Contoh: menentukan kapan target tercapai, kami mengatasinya dengan …',
      },
      {
        id: 'q2',
        teks: 'Apa yang kamu pelajari dari kode yang “lolos uji padahal salah”?',
        placeholder: 'Contoh: kasus uji harus beragam karena …',
      },
      {
        id: 'q3',
        teks: 'Jika mengulang proyek ini, apa yang akan kamu ubah pada rencana atau jadwal tim?',
        placeholder: 'Contoh: kami akan menyiapkan kasus uji lebih awal …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu menyelesaikan masalah kontekstual barisan & deret aritmetika sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — aku bisa membimbing teman' },
      { id: 'yakin', label: '😊 Yakin — aku bisa mengerjakan sendiri' },
      { id: 'cukup', label: '🙂 Cukup — kadang masih perlu petunjuk' },
      { id: 'belum', label: '🤔 Belum yakin — aku perlu berlatih lagi' },
    ],
    nextLabel: 'Simpan Refleksi & Selesai →',
  },

  selesai: {
    judul: 'Mini App Siap Dipamerkan!',
    teks: 'Kamu berhasil menyelesaikan masalah kontekstual barisan dan deret aritmetika melalui proyek mini: dari brief klien, model, prototipe, pengujian, hingga pameran.',
    contoh: [
      { ikon: '🔢', nama: 'Nilai periode ke-n', isi: 'Uₙ = a + (n − 1)b' },
      { ikon: '➕', nama: 'Total n periode', isi: 'Sₙ = n/2 (2a + (n − 1)b)' },
      { ikon: '🎯', nama: 'Kapan target tercapai', isi: 'n terkecil: Sₙ₋₁ < target ≤ Sₙ' },
      { ikon: '🧪', nama: 'Uji kasus', isi: 'b = 0, n = 1, beda negatif, data brief' },
    ],
    capaian: [
      'Merumuskan pertanyaan mendasar dan memetakan brief klien ke a, b, n, dan target.',
      'Menggunakan Uₙ dan Sₙ untuk menjawab pertanyaan klien dan memeriksa kewajarannya.',
      'Menentukan kapan target tercapai dan mengatur ulang a atau b agar tenggat terpenuhi.',
      'Menguji fungsi JavaScript dengan kasus uji dan memilih kode yang benar.',
      'Menyajikan Kartu Proyek dan menilai hasil kerja teman secara matematis.',
    ],
  },
};
