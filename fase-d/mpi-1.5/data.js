'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membaca, Menuliskan & Membandingkan Bilangan Desimal
   dalam Kehidupan Sehari-hari — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Membaca, menuliskan, dan membandingkan bilangan desimal dalam
   konteks kehidupan sehari-hari.

   Notasi baku yang dipakai di seluruh modul (bilangan desimal ditulis
   sebagai STRING berkoma, mis. '3,07' — lihat engine seksi 19, 20, 37):
     • pemisah desimal adalah tanda KOMA (titik = pemisah ribuan);
     • angka di belakang koma menempati nilai tempat persepuluhan,
       perseratusan, perseribuan (1 = 10 persepuluhan = 100
       perseratusan = 1.000 perseribuan);
     • cara baca "koma": bagian bulat, kata "koma", lalu angka di
       belakang koma dibaca SATU PER SATU: 12,45 → "dua belas koma
       empat lima";
     • cara baca nilai tempat: angka di belakang koma dibaca sebagai
       satu bilangan diikuti nama tempat angka paling kanan: 3,07 →
       "tiga dan tujuh perseratus";
     • angka 0 pengisi tempat wajib ditulis & dibaca (3,07 ≠ 3,7);
       angka 0 di ujung kanan tidak mengubah nilai (0,5 = 0,50);
     • membandingkan: bagian bulat dulu, lalu angka pada nilai tempat
       yang sama mulai dari kiri (samakan banyak angka bila perlu).

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahBaca' & 'olahBanding'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi   (7')  — "Pekan Olahraga & Kantin Sekolah": empat
                            kabar (stopwatch lari, timbangan kantin,
                            termometer UKS, pita ukur lompat jauh).
                            Murid menduga cara membaca, menulis, dan
                            siapa yang lebih cepat/jauh — tidak dinilai.
     2. Masalah     (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data        (15') — "Lab Nilai Tempat": enam angka pada layar
                            alat ukur dirakit dengan blok desimal
                            (satuan, persepuluhan, perseratusan,
                            perseribuan), lalu dipilih cara bacanya;
                            tabel data terisi otomatis dan diamati.
     4a. Baca-Tulis (11') — memasangkan notasi ↔ cara baca, menulis
                            notasi dari dikte (diagnosa 0 pengisi
                            tempat, titik, koma bergeser), dan mengetik
                            cara baca.
     4b. Banding    (12') — tabel nilai tempat berdampingan + tombol
                            lambang berdiagnosa + makna dalam konteks;
                            menempatkan hasil lompat jauh pada garis
                            bilangan; mengurutkan catatan waktu lari.
     5. Bukti       (8')  — menguji pernyataan & membandingkan dengan
                            dugaan awal serta hipotesis.
     6. Simpulan    (7')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap   (10') — delapan soal diambil acak dari bank dua
                            belas soal (isian notasi, isian cara baca,
                            pilihan ganda membandingkan & mengurutkan).
     8. Refleksi    (3')  — refleksi tertulis & penilaian diri.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban benar sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / ensureTapOrderState / shuffleArray dari
   shared/engine.js), sehingga tiap murid dan tiap Reset mendapat urutan
   berbeda. Pilihan yang dibuat engine (opsiCaraBacaDesimal,
   opsiNotasiDesimal, opsiMaknaBandingDesimal, COMPARE_SYMBOLS) diacak
   dengan cara yang sama.

   Konsistensi kunci jawaban diuji tests/mpi-1.5-data.test.js terhadap
   engine seksi 19, 20, dan 37.
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  meta: {
    judul: 'Membaca, Menuliskan & Membandingkan Bilangan Desimal dalam Kehidupan Sehari-hari',
  },

  tahap: [
    { id: 'stimulasi', label: 'Stimulasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'koleksi', label: 'Data' },
    { id: 'olahBaca', label: 'Baca & Tulis' },
    { id: 'olahBanding', label: 'Bandingkan' },
    { id: 'verifikasi', label: 'Bukti' },
    { id: 'generalisasi', label: 'Simpulan' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Bukti.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati bilangan desimal pada alat ukur sehari-hari dan menyampaikan dugaan cara membaca, menuliskan, dan membandingkannya.',
    guru: 'Bila ada, tunjukkan stopwatch, timbangan digital, atau termometer sungguhan. Minta pasangan murid membaca lantang angka pada setiap layar sebelum menjawab dugaan — dengarkan apakah muncul "koma empat puluh lima", "titik", atau "koma lima" untuk 1,05. Jangan membenarkan atau menyalahkan dulu; dugaan ini akan diuji murid sendiri di tahap Bukti.',
    judul: 'Pekan Olahraga & Kantin Sekolah',
    pengantar:
      'Hari ini SMP Nusantara mengadakan pekan olahraga. Panitia, petugas UKS, dan Bu Kantin sibuk mencatat angka-angka dari alat ukur. Angka-angka itu memakai tanda koma — tetapi bagaimana cara membaca, menulis, dan membandingkannya?',
    kabar: [
      {
        id: 'lari',
        ikon: '⏱️',
        sumber: 'Stopwatch Lomba Lari 100 m',
        teks: 'Catatan waktu Beni tertera di stopwatch panitia. Andi, pelari sebelumnya, mencatat 12,5 detik.',
        nilai: '12,45',
        satuan: 'detik',
      },
      {
        id: 'timbangan',
        ikon: '⚖️',
        sumber: 'Timbangan Digital Kantin',
        teks: 'Bu Kantin menimbang tepung untuk kue, lalu menulis di buku: "satu dan lima perseratus kilogram".',
        nilai: '1,05',
        satuan: 'kg',
      },
      {
        id: 'suhu',
        ikon: '🌡️',
        sumber: 'Termometer UKS',
        teks: 'Setelah lari, suhu tubuh Rara diperiksa petugas UKS.',
        nilai: '37,5',
        satuan: '°C',
      },
      {
        id: 'lompat',
        ikon: '📏',
        sumber: 'Pita Ukur Lompat Jauh',
        teks: 'Lompatan Dewi diukur panitia. Citra, peserta sebelumnya, melompat sejauh 3,7 m.',
        nilai: '3,68',
        satuan: 'm',
      },
    ],
    dugaan: [
      {
        id: 'd1',
        tanya: 'Bagaimana dugaanmu cara membaca catatan waktu Beni <strong>12,45 detik</strong>?',
        opsi: [
          { id: 'a', label: '"dua belas koma empat lima detik"' },
          { id: 'b', label: '"dua belas koma empat puluh lima detik"' },
          { id: 'c', label: '"seribu dua ratus empat puluh lima detik"' },
          { id: 'd', label: '"dua belas titik empat lima detik"' },
        ],
        baku: 'a',
        pembahasan:
          'Setelah kata "koma", angka dibaca satu per satu: "dua belas koma empat lima". Boleh juga menurut nilai tempat: "dua belas dan empat puluh lima perseratus".',
      },
      {
        id: 'd2',
        tanya:
          'Bu Kantin menulis <strong>"satu dan lima perseratus kilogram"</strong>. Angka berapa yang muncul di layar timbangan?',
        opsi: [
          { id: 'a', label: '1,05' },
          { id: 'b', label: '1,5' },
          { id: 'c', label: '1,005' },
          { id: 'd', label: '1.05' },
        ],
        baku: 'a',
        pembahasan:
          '"Perseratus" berarti angka 5 menempati tempat perseratusan (angka kedua di belakang koma), jadi tempat persepuluhan diisi 0: 1,05.',
      },
      {
        id: 'd3',
        tanya:
          'Andi mencatat <strong>12,5 detik</strong>, Beni <strong>12,45 detik</strong>. Siapa yang berlari lebih cepat?',
        opsi: [
          { id: 'a', label: 'Beni, karena 12,45 < 12,5 (waktunya lebih singkat)' },
          { id: 'b', label: 'Andi, karena 12,5 < 12,45 (sebab 5 < 45)' },
          { id: 'c', label: 'Sama cepat, karena bagian bulatnya sama-sama 12' },
          { id: 'd', label: 'Tidak bisa dibandingkan, karena banyak angkanya berbeda' },
        ],
        baku: 'a',
        pembahasan:
          'Samakan banyak angkanya: 12,45 dan 12,50. Pada persepuluhan 4 < 5, jadi 12,45 < 12,5. Waktu lebih singkat berarti Beni lebih cepat.',
      },
      {
        id: 'd4',
        tanya:
          'Citra melompat <strong>3,7 m</strong>, Dewi <strong>3,68 m</strong>. Siapa yang melompat lebih jauh?',
        opsi: [
          { id: 'a', label: 'Citra, karena 3,7 > 3,68' },
          { id: 'b', label: 'Dewi, karena 68 lebih besar daripada 7' },
          { id: 'c', label: 'Dewi, karena angka di belakang komanya lebih banyak' },
          { id: 'd', label: 'Sama jauh' },
        ],
        baku: 'a',
        pembahasan:
          'Bandingkan dari nilai tempat paling kiri: satuan sama-sama 3, persepuluhan 7 > 6. Jadi 3,7 > 3,68 — Citra melompat lebih jauh.',
      },
    ],
    alasanLabel: 'Mengapa kamu memilih dugaan-dugaan itu? (boleh singkat)',
    alasanPlaceholder: 'Menurutku … karena …',
    catatan:
      'Tidak ada jawaban salah di tahap ini. Simpan dugaanmu — kamu akan mengujinya sendiri di tahap Bukti.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan inti yang akan diselidiki dan menuliskan hipotesis.',
    guru: 'Tanyakan: "Kalau Bu Kantin menulis 1,5 padahal maksudnya 1,05 kg, apa yang terjadi?" (kuenya gagal, harga salah). "Kalau juri salah membandingkan 12,5 dan 12,45, siapa yang dirugikan?" Hipotesis boleh keliru; yang penting murid berani menuliskannya.',
    pengantar:
      'Teman-teman membaca angka-angka itu dengan cara berbeda: ada yang bilang "dua belas koma empat puluh lima", ada yang menulis 1,5 untuk tepung Bu Kantin, bahkan ada yang yakin Andi lebih cepat karena 5 < 45. Supaya tidak ada juara yang salah dan kue tidak gagal, kita perlu menyelidiki sesuatu.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'inti',
        label:
          'Bagaimana cara membaca, menuliskan, dan membandingkan bilangan desimal yang muncul dalam kehidupan sehari-hari?',
      },
      { id: 'rata', label: 'Berapa rata-rata catatan waktu seluruh pelari 100 m?' },
      { id: 'harga', label: 'Berapa harga 1 kg tepung di kantin sekolah?' },
      { id: 'suka', label: 'Cabang olahraga apa yang paling disukai murid kelas VII?' },
    ],
    correct: 'inti',
    umpan: {
      inti: 'Tepat! Pertanyaan ini bisa kamu jawab sendiri dengan mengumpulkan dan mengolah data bilangan desimal dari berbagai alat ukur.',
      rata: 'Itu soal menghitung. Masalah kita adalah membaca "12,45" dan menentukan siapa yang lebih cepat. Coba pilih lagi.',
      harga:
        'Harga memang penting, tetapi masalah kita adalah menulis "satu dan lima perseratus" dengan angka. Coba pilih lagi.',
      suka: 'Itu soal selera. Masalah kita adalah cara membaca, menulis, dan membandingkan angka berkoma. Coba pilih lagi.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: "Angka di belakang koma dibaca …, dan untuk membandingkan dua bilangan desimal kita …"',
    hipotesisPlaceholder: 'Angka di belakang koma dibaca …',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA: LAB NILAI TEMPAT
     Setiap situasi menampilkan angka pada layar alat ukur. Murid
     merakitnya dengan blok desimal (buildDecimalBuilder, cara baca
     disembunyikan), lalu memilih cara bacanya (opsiCaraBacaDesimal).
     Bagian bulat `nilai` harus 0–9 (satu blok satuan per angka) dan
     maksimal tiga angka di belakang koma — diuji.
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengumpulkan data: merakit bilangan desimal dari alat ukur sehari-hari dengan blok nilai tempat lalu membacanya.',
    guru: 'Biarkan murid merakit sendiri. Bila murid memasang 8 batang persepuluhan untuk 4,08, tanyakan: "Angka 8 itu angka ke berapa di belakang koma? Jadi ia menempati tempat apa?" Tunjukkan bahwa 1 batang persepuluhan = 10 kotak perseratusan (dapat dibuktikan dengan kertas berpetak 10 × 10).',
    instruksi:
      'Ada enam angka pada layar alat ukur di sekolah. Rakit setiap angka dengan tombol − dan + pada blok satuan, persepuluhan, perseratusan, dan perseribuan sampai bilangan rakitanmu sama dengan layar, lalu tekan "Periksa Rakitan". Setelah itu, pilih cara membacanya.',
    legendaJudul: 'Ukuran blok',
    tanyaBaca: 'Bagaimana cara membaca bilangan ini (tanpa satuan)?',
    situasi: [
      {
        id: 'cabai',
        ikon: '🌶️',
        tempat: 'Lapak sayur kantin',
        alat: 'Timbangan',
        teks: 'Bu Kantin menimbang cabai untuk sambal.',
        nilai: '0,25',
        satuan: 'kg',
        temuan:
          '0,25 = 0 satuan, 2 persepuluhan, 5 perseratusan. Dibaca "nol koma dua lima" atau "dua puluh lima perseratus".',
      },
      {
        id: 'tinggi',
        ikon: '📏',
        tempat: 'Ruang UKS',
        alat: 'Pengukur tinggi badan',
        teks: 'Petugas UKS mengukur tinggi badan Bima.',
        nilai: '1,52',
        satuan: 'm',
        temuan:
          '1,52 = 1 satuan, 5 persepuluhan, 2 perseratusan. Dibaca "satu koma lima dua" atau "satu dan lima puluh dua perseratus".',
      },
      {
        id: 'vitamin',
        ikon: '💊',
        tempat: 'Kotak obat UKS',
        alat: 'Label kemasan',
        teks: 'Label kemasan menunjukkan berat vitamin C dalam satu tablet.',
        nilai: '0,5',
        satuan: 'gram',
        temuan:
          '0,5 = 5 persepuluhan. Dibaca "nol koma lima" atau "lima persepuluh" — setengah gram.',
      },
      {
        id: 'hujan',
        ikon: '🌧️',
        tempat: 'Pos cuaca sekolah',
        alat: 'Penakar hujan',
        teks: 'Klub sains mencatat curah hujan tadi pagi.',
        nilai: '4,08',
        satuan: 'cm',
        temuan:
          'Tidak ada batang persepuluhan, jadi tempat persepuluhan diisi 0: 4,08. Dibaca "empat koma nol delapan" atau "empat dan delapan perseratus".',
      },
      {
        id: 'lompat',
        ikon: '🏅',
        tempat: 'Lapangan lompat jauh',
        alat: 'Pita ukur',
        teks: 'Panitia mencatat lompatan Dewi.',
        nilai: '3,68',
        satuan: 'm',
        temuan:
          '3,68 = 3 satuan, 6 persepuluhan, 8 perseratusan. Dibaca "tiga koma enam delapan" atau "tiga dan enam puluh delapan perseratus".',
      },
      {
        id: 'emas',
        ikon: '💍',
        tempat: 'Hadiah juara',
        alat: 'Timbangan emas',
        teks: 'Medali juara dilapisi emas. Toko emas menimbang lapisannya.',
        nilai: '2,005',
        satuan: 'gram',
        temuan:
          'Tempat persepuluhan dan perseratusan kosong, diisi 0: 2,005. Dibaca "dua koma nol nol lima" atau "dua dan lima perseribu".',
      },
    ],
    amati: [
      {
        id: 'a1',
        tanya:
          'Amati tabel. Angka <strong>pertama</strong> di belakang koma menempati nilai tempat …',
        opsi: [
          { id: 'sepuluh', label: 'persepuluhan' },
          { id: 'seratus', label: 'perseratusan' },
          { id: 'satuan', label: 'satuan' },
          { id: 'puluhan', label: 'puluhan' },
        ],
        correct: 'sepuluh',
        umpan: {
          sepuluh:
            'Betul! Angka ke-1 di belakang koma = persepuluhan, ke-2 = perseratusan, ke-3 = perseribuan.',
          seratus: 'Perseratusan adalah angka ke-2 di belakang koma. Lihat lagi kolom tabelnya.',
          satuan: 'Satuan ada di depan koma. Lihat lagi tabelnya.',
          puluhan: 'Puluhan ada di depan koma, di kiri satuan. Lihat lagi.',
        },
      },
      {
        id: 'a2',
        tanya: 'Lihat ukuran blok. 1 blok <strong>satuan</strong> sama dengan …',
        opsi: [
          { id: 'sepuluh', label: '10 batang persepuluhan' },
          { id: 'seratus', label: '100 batang persepuluhan' },
          { id: 'satu', label: '1 batang persepuluhan' },
          { id: 'lima', label: '5 batang persepuluhan' },
        ],
        correct: 'sepuluh',
        umpan: {
          sepuluh:
            'Tepat! 1 = 10 persepuluhan = 100 perseratusan = 1.000 perseribuan. Setiap geser satu tempat ke kanan, nilainya 10 kali lebih kecil.',
          seratus: '100 bagian itu kotak perseratusan, bukan batang persepuluhan. Coba lagi.',
          satu: 'Satu batang hanya sepersepuluh blok satuan. Coba lagi.',
          lima: 'Lima batang baru setengah blok satuan. Coba lagi.',
        },
      },
      {
        id: 'a3',
        tanya:
          'Amati kolom <strong>Dibaca (koma)</strong>. Setelah kata "koma", angka-angkanya dibaca …',
        opsi: [
          { id: 'satu', label: 'satu per satu, misalnya "koma lima dua"' },
          { id: 'bulat', label: 'sebagai satu bilangan, misalnya "koma lima puluh dua"' },
          { id: 'kanan', label: 'dari kanan ke kiri' },
          { id: 'tidak', label: 'tidak dibaca, cukup bagian bulatnya' },
        ],
        correct: 'satu',
        umpan: {
          satu: 'Betul! 1,52 dibaca "satu koma lima dua" — angka di belakang koma dibaca satu per satu.',
          bulat:
            'Lihat lagi kolom Dibaca (koma) untuk 1,52: "satu koma lima dua", bukan "lima puluh dua".',
          kanan: 'Angka tetap dibaca dari kiri ke kanan. Lihat lagi tabelnya.',
          tidak: 'Tanpa angka di belakang koma, 1,52 m dan 1 m terdengar sama. Lihat lagi.',
        },
      },
      {
        id: 'a4',
        tanya:
          'Pada <strong>4,08</strong> dan <strong>2,005</strong>, mengapa ada angka 0 di belakang koma?',
        opsi: [
          {
            id: 'pengisi',
            label: 'Untuk mengisi nilai tempat yang kosong agar angka 8 dan 5 tetap di tempatnya',
          },
          { id: 'hiasan', label: 'Hanya hiasan, boleh dihapus' },
          { id: 'negatif', label: 'Menandakan bilangannya negatif' },
          { id: 'besar', label: 'Supaya bilangannya menjadi lebih besar' },
        ],
        correct: 'pengisi',
        umpan: {
          pengisi:
            'Tepat! Tanpa 0, 4,08 menjadi 4,8 — angka 8 pindah dari perseratusan ke persepuluhan dan nilainya berubah.',
          hiasan:
            'Coba rakit 4,8 lalu bandingkan dengan 4,08: blok yang terpasang berbeda! Coba lagi.',
          negatif:
            'Bilangan negatif ditandai tanda − di depan, bukan 0 di belakang koma. Coba lagi.',
          besar: 'Rakit 4,08 dan 4,8: mana yang lebih banyak bloknya? Coba lagi.',
        },
      },
      {
        id: 'a5',
        tanya:
          'Amati kolom <strong>Dibaca (nilai tempat)</strong>. Kata "persepuluh", "perseratus", atau "perseribu" di akhir ditentukan oleh …',
        opsi: [
          { id: 'kanan', label: 'nilai tempat angka paling kanan' },
          { id: 'kiri', label: 'nilai tempat angka paling kiri' },
          { id: 'bulat', label: 'besar bagian bulatnya' },
          { id: 'nol', label: 'banyaknya angka 0' },
        ],
        correct: 'kanan',
        umpan: {
          kanan: 'Betul! 2,005: angka paling kanan (5) di perseribuan → "dua dan lima perseribu".',
          kiri: 'Pada 1,52, angka paling kiri di belakang koma adalah 5 (persepuluhan), tetapi dibaca "…perseratus". Coba lagi.',
          bulat: '0,25 dan 1,52 bagian bulatnya berbeda, tetapi sama-sama "perseratus". Coba lagi.',
          nol: '0,25 tidak punya 0 di belakang koma, tetapi dibaca "perseratus". Coba lagi.',
        },
      },
    ],
    nextLabel: 'Lanjut: Olah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — PENGOLAHAN DATA: BACA & TULIS
     Pasangan: 'baca' → opsiCaraBacaDesimal, 'tulis' → opsiNotasiDesimal
     (dikte memakai cara baca `dikte`: 'koma' | 'nilai').
     ---------------------------------------------------------- */
  olahBaca: {
    kicker: 'Tahap 4a · Pengolahan Data — Baca & Tulis',
    syntax: DL + ' · Sintaks 4',
    goal: 'Mengolah data untuk menemukan pola cara membaca dan menuliskan bilangan desimal, termasuk angka 0 pengisi tempat.',
    guru: 'Minta pasangan bergantian mendikte dan menulis. Dengarkan apakah murid membaca angka di belakang koma satu per satu dan tidak melewatkan "nol". Pada dikte nilai tempat ("lima dan enam perseribu"), tanyakan: "perseribu berarti ada berapa angka di belakang koma?"',
    judulA: 'A. Pasangkan notasi dan cara baca',
    instruksiA: 'Pilih pasangan yang tepat untuk setiap bilangan atau cara baca.',
    pasang: [
      { id: 'q1', arah: 'baca', nilai: '12,45' },
      { id: 'q2', arah: 'tulis', nilai: '3,07', dikte: 'nilai' },
      { id: 'q3', arah: 'baca', nilai: '0,125' },
      { id: 'q4', arah: 'tulis', nilai: '1,05', dikte: 'koma' },
      { id: 'q5', arah: 'baca', nilai: '2,005' },
      { id: 'q6', arah: 'tulis', nilai: '0,5', dikte: 'nilai' },
    ],
    judulB: 'B. Tulis dari dikte',
    instruksiB:
      'Pasanganmu membacakan bilangan berikut. Tulis bilangannya dengan angka dan tanda koma.',
    tulisNotasi: [
      {
        id: 'n1',
        jawab: '6,09',
        dikte: 'nilai',
        hints: [
          '"Perseratus" → ada dua angka di belakang koma.',
          'Angka 9 di perseratusan, jadi persepuluhan diisi 0.',
        ],
      },
      {
        id: 'n2',
        jawab: '0,75',
        dikte: 'koma',
        hints: ['"Nol koma" → bagian bulatnya 0. Setelah koma tulis 7 lalu 5.'],
      },
      {
        id: 'n3',
        jawab: '5,006',
        dikte: 'nilai',
        hints: [
          '"Perseribu" → ada tiga angka di belakang koma.',
          'Angka 6 di perseribuan; persepuluhan dan perseratusan diisi 0.',
        ],
      },
      {
        id: 'n4',
        jawab: '10,4',
        dikte: 'koma',
        hints: ['Bagian bulat "sepuluh" ditulis 10, lalu koma, lalu 4.'],
      },
    ],
    judulC: 'C. Ketik cara bacanya',
    instruksiC:
      'Ketik cara membaca setiap bilangan dengan huruf, tanpa satuan. Cara baca "koma" maupun cara baca nilai tempat sama-sama diterima.',
    tulisBacaan: [
      { id: 'b1', jawab: '8,25', hints: ['Bagian bulat, kata "koma", lalu angka satu per satu.'] },
      { id: 'b2', jawab: '0,06', hints: ['Jangan lewatkan angka 0 setelah koma.'] },
      { id: 'b3', jawab: '15,3', hints: ['"lima belas koma …"'] },
      {
        id: 'b4',
        jawab: '7,025',
        hints: ['Ada tiga angka di belakang koma: 0, 2, 5 — semuanya dibaca.'],
      },
    ],
    temuan: [
      'Pemisah desimal di Indonesia adalah tanda <strong>koma</strong>, dibaca "koma" (titik dipakai untuk ribuan).',
      'Cara baca "koma": bagian bulat, kata "koma", lalu angka di belakang koma <strong>satu per satu</strong>: 12,45 → "dua belas koma empat lima".',
      'Cara baca nilai tempat: angka di belakang koma dibaca sebagai satu bilangan + nama tempat angka paling kanan: 3,07 → "tiga dan tujuh perseratus".',
      'Angka <strong>0 pengisi tempat</strong> wajib ditulis dan dibaca: "lima dan enam perseribu" → 5,006, bukan 5,6.',
    ],
    nextLabel: 'Lanjut: Bandingkan →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — PENGOLAHAN DATA: MEMBANDINGKAN & MENGURUTKAN
     A. pasangan: tabel nilai tempat berdampingan, tombol lambang
        (buildPilihSimbolDesimal) lalu makna konteks
        (opsiMaknaBandingDesimal; `tema` → KATA_BANDING_DESIMAL /
        KATA_BANDING_PECAHAN). `kalimat` memuat ___ untuk kata makna.
     B. garis bilangan: urutan tampil `letak.nilai` diacak.
     C. urutkan catatan waktu: jawaban = urutan naik (tercepat dulu).
     ---------------------------------------------------------- */
  olahBanding: {
    kicker: 'Tahap 4b · Pengolahan Data — Membandingkan',
    syntax: DL + ' · Sintaks 4',
    goal: 'Mengolah data untuk menemukan cara membandingkan dan mengurutkan bilangan desimal berdasarkan nilai tempat.',
    guru: 'Saat murid memilih lambang yang salah, minta mereka membaca tabel nilai tempat kolom demi kolom dari kiri. Tekankan bahwa "lebih banyak angka" bukan berarti "lebih besar". Pada garis bilangan, minta murid menghitung garis kecil dari label terdekat.',
    judulA: 'A. Siapa yang lebih …?',
    instruksiA:
      'Amati tabel nilai tempat setiap pasangan, pilih lambang <, >, atau =, lalu tentukan artinya dalam cerita.',
    pasangan: [
      {
        id: 'p1',
        ikon: '⏱️',
        konteks: 'Lomba lari 100 m',
        namaA: 'Andi',
        namaB: 'Beni',
        a: '12,5',
        b: '12,45',
        satuan: 'detik',
        tema: 'lari',
        kalimat: 'Andi berlari ___ daripada Beni.',
      },
      {
        id: 'p2',
        ikon: '📏',
        konteks: 'Lomba lompat jauh',
        namaA: 'Citra',
        namaB: 'Dewi',
        a: '3,7',
        b: '3,68',
        satuan: 'm',
        tema: 'jarak',
        kalimat: 'Lompatan Citra ___ daripada lompatan Dewi.',
      },
      {
        id: 'p3',
        ikon: '🧂',
        konteks: 'Belanja kantin',
        namaA: 'Gula',
        namaB: 'Garam',
        a: '0,5',
        b: '0,50',
        satuan: 'kg',
        tema: 'berat',
        kalimat: 'Gula yang dibeli Bu Kantin ___ dengan garamnya.',
      },
      {
        id: 'p4',
        ikon: '🌡️',
        konteks: 'Pemeriksaan UKS',
        namaA: 'Bima',
        namaB: 'Rara',
        a: '36,8',
        b: '37,5',
        satuan: '°C',
        tema: 'suhu',
        kalimat: 'Suhu tubuh Bima ___ daripada suhu tubuh Rara.',
      },
      {
        id: 'p5',
        ikon: '🌧️',
        konteks: 'Pos cuaca sekolah',
        namaA: 'Senin',
        namaB: 'Selasa',
        a: '4,08',
        b: '4,1',
        satuan: 'cm',
        tema: 'banyak',
        kalimat: 'Hujan hari Senin ___ daripada hujan hari Selasa.',
      },
    ],
    judulB: 'B. Tempatkan pada garis bilangan',
    instruksiB:
      'Hasil lompat jauh empat peserta dicatat dalam meter. Ketuk letak setiap hasil pada garis bilangan. Setiap garis kecil bernilai 0,01.',
    letak: {
      min: '3,6',
      max: '3,8',
      digits: 2,
      labelEvery: 10,
      nilai: [
        { value: '3,68', teks: 'Dewi' },
        { value: '3,7', teks: 'Citra' },
        { value: '3,65', teks: 'Eka' },
        { value: '3,72', teks: 'Fajar' },
      ],
    },
    tanyaLetak: {
      id: 'l1',
      tanya: 'Amati garis bilangan. Bilangan yang letaknya <strong>lebih kanan</strong> …',
      opsi: [
        { id: 'besar', label: 'selalu lebih besar' },
        { id: 'kecil', label: 'selalu lebih kecil' },
        { id: 'panjang', label: 'selalu punya lebih banyak angka di belakang koma' },
        { id: 'bebas', label: 'tidak ada hubungannya dengan besar bilangan' },
      ],
      correct: 'besar',
      umpan: {
        besar: 'Tepat! 3,72 di kanan 3,7 → 3,72 > 3,7. Lompatan Fajar paling jauh.',
        kecil: 'Garis bilangan bertambah ke kanan. Coba lagi.',
        panjang: '3,7 di kanan 3,68, padahal angkanya lebih sedikit. Coba lagi.',
        bebas: 'Garis bilangan tersusun dari kecil (kiri) ke besar (kanan). Coba lagi.',
      },
    },
    judulC: 'C. Urutkan juara lari',
    instruksiC:
      'Empat finalis lari 100 m mencatat waktu berikut. Urutkan dari juara 1 (tercepat = waktu paling singkat) sampai juara 4. Gunakan tabel nilai tempat sebagai bantuan.',
    urut: [
      { id: 'andi', nama: 'Andi', nilai: '12,5' },
      { id: 'beni', nama: 'Beni', nilai: '12,45' },
      { id: 'candra', nama: 'Candra', nilai: '12,08' },
      { id: 'doni', nama: 'Doni', nilai: '12,405' },
    ],
    temuan: [
      'Bandingkan dulu <strong>bagian bulat</strong>; bila sama, bandingkan angka pada nilai tempat yang sama mulai dari <strong>kiri</strong> (persepuluhan, perseratusan, …).',
      '<strong>Samakan banyak angka</strong> di belakang koma dengan menambah 0 di ujung kanan: 12,5 = 12,50, jadi 12,45 < 12,50.',
      'Lebih banyak angka di belakang koma <strong>tidak</strong> berarti lebih besar: 3,7 > 3,68.',
      'Pada garis bilangan, bilangan yang lebih kanan lebih besar. Dalam cerita, "lebih kecil" bisa berarti lebih cepat, lebih dingin, atau lebih sedikit.',
    ],
    nextLabel: 'Lanjut: Buktikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Membuktikan temuan dengan menguji pernyataan, lalu membandingkannya dengan dugaan awal dan hipotesis.',
    guru: 'Setelah murid memilah, minta setiap pasangan memilih satu pernyataan SALAH dan memperbaikinya dengan lantang, misalnya dengan merakit kedua bilangan pada blok. Lalu bahas perbandingan dugaan: apa yang berubah dari pikiran awal mereka?',
    judulA: 'A. Benar atau salah?',
    opsiPernyataan: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'v1',
        teks: '0,8 lebih besar daripada 0,75.',
        correct: 'benar',
        explanation: 'Persepuluhan: 8 > 7, jadi 0,8 > 0,75 (0,80 > 0,75).',
      },
      {
        id: 'v2',
        teks: 'Bilangan desimal yang angka di belakang komanya lebih banyak pasti lebih besar.',
        correct: 'salah',
        explanation: '3,7 punya lebih sedikit angka daripada 3,68, tetapi 3,7 > 3,68.',
      },
      {
        id: 'v3',
        teks: '0,5 kg dan 0,50 kg sama beratnya.',
        correct: 'benar',
        explanation: 'Angka 0 di ujung kanan bagian desimal tidak mengubah nilai.',
      },
      {
        id: 'v4',
        teks: '3,07 dibaca "tiga koma tujuh".',
        correct: 'salah',
        explanation: 'Angka 0 pengisi tempat ikut dibaca: "tiga koma nol tujuh".',
      },
      {
        id: 'v5',
        teks: '"Lima dan dua perseratus" ditulis 5,02.',
        correct: 'benar',
        explanation: 'Perseratus → dua angka di belakang koma; angka 2 di perseratusan: 5,02.',
      },
      {
        id: 'v6',
        teks: 'Pelari dengan catatan 12,45 detik lebih cepat daripada pelari dengan catatan 12,5 detik.',
        correct: 'benar',
        explanation: '12,45 < 12,50; waktu lebih singkat berarti lebih cepat.',
      },
      {
        id: 'v7',
        teks: 'Penulisan baku Indonesia untuk empat koma enam adalah 4.6.',
        correct: 'salah',
        explanation: 'Di Indonesia pemisah desimal adalah koma: 4,6.',
      },
      {
        id: 'v8',
        teks: 'Karena 9 > 1, maka 2,9 > 10,1.',
        correct: 'salah',
        explanation: 'Bandingkan bagian bulat dulu: 2 < 10, jadi 2,9 < 10,1.',
      },
    ],
    judulB: 'B. Bandingkan dengan dugaan awalmu',
    nextLabel: 'Lanjut: Tarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Merumuskan kesimpulan tentang cara membaca, menuliskan, dan membandingkan bilangan desimal dalam kehidupan sehari-hari.',
    guru: 'Setelah kesimpulan lengkap, minta beberapa murid membacakannya dengan kalimat sendiri dan memberi satu contoh bilangan desimal baru dari rumah (label kemasan, struk belanja, rapor kesehatan). Tuliskan rangkuman di papan tulis.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      {
        id: 'k1',
        awal: 'Angka-angka di belakang koma berturut-turut menempati nilai tempat',
        correct: 'tempat',
      },
      {
        id: 'k2',
        awal: 'Dengan cara baca "koma", bagian bulat dibaca, lalu kata "koma", lalu',
        correct: 'satuSatu',
      },
      {
        id: 'k3',
        awal: 'Dengan cara baca nilai tempat, 3,07 dibaca',
        correct: 'nilaiTempat',
      },
      { id: 'k4', awal: 'Saat menulis bilangan desimal, angka 0', correct: 'nolPengisi' },
      { id: 'k5', awal: 'Untuk membandingkan dua bilangan desimal,', correct: 'bandingKiri' },
      {
        id: 'k6',
        awal: 'Menambah angka 0 di ujung kanan bagian desimal',
        correct: 'nolAkhir',
      },
    ],
    bank: [
      { id: 'tempat', teks: 'persepuluhan, perseratusan, perseribuan' },
      {
        id: 'satuSatu',
        teks: 'angka di belakang koma dibaca satu per satu: 12,45 → "dua belas koma empat lima"',
      },
      { id: 'nilaiTempat', teks: '"tiga dan tujuh perseratus"' },
      {
        id: 'nolPengisi',
        teks: 'mengisi nilai tempat yang kosong: "lima perseratus" → 0,05',
      },
      {
        id: 'bandingKiri',
        teks: 'bandingkan bagian bulat dulu, lalu angka pada nilai tempat yang sama mulai dari kiri',
      },
      { id: 'nolAkhir', teks: 'tidak mengubah nilainya: 0,5 = 0,50' },
      {
        id: 'banyakAngka',
        teks: 'bilangan dengan lebih banyak angka di belakang koma selalu lebih besar',
      },
      {
        id: 'bacaBulat',
        teks: 'angka di belakang koma dibaca sebagai satu bilangan: 12,45 → "dua belas koma empat puluh lima"',
      },
      { id: 'titik', teks: 'ditulis dengan tanda titik sebagai pemisah desimal, misalnya 3.07' },
    ],
    rangkuman: [
      'Angka di belakang koma menempati nilai tempat <strong>persepuluhan, perseratusan, perseribuan</strong>; 1 = 10 persepuluhan = 100 perseratusan.',
      'Bilangan desimal dibaca "<strong>… koma …</strong>" dengan angka di belakang koma dibaca satu per satu (12,45 → "dua belas koma empat lima"), atau menurut nilai tempat angka paling kanan (3,07 → "tiga dan tujuh perseratus").',
      'Angka <strong>0 pengisi tempat</strong> wajib ditulis: "satu dan lima perseratus" → 1,05.',
      'Membandingkan: bagian bulat dulu, lalu nilai tempat yang sama dari kiri; samakan banyak angka dengan menambah 0 di kanan (12,5 = 12,50 > 12,45).',
      'Dalam konteks, maknanya disesuaikan: waktu lebih kecil = lebih cepat, suhu lebih kecil = lebih dingin, jarak lebih besar = lebih jauh.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Bank 12 soal; setiap murid mendapat `banyak` soal sesuai
     `komposisi` (dipilih & diurutkan acak). Isian 'tulis' diperiksa
     diagnosaTulisDesimal, isian 'baca' diperiksa cekCaraBacaDesimal.
     Opsi pilihan ganda diacak (optionOrder).
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan konsep',
    goal: 'Menerapkan cara membaca, menuliskan, dan membandingkan bilangan desimal pada situasi sehari-hari yang baru.',
    guru: 'Murid mengerjakan mandiri. Setiap murid mendapat kombinasi soal acak, jadi dorong mereka menjelaskan jawabannya kepada pasangan setelah selesai. Amati murid yang masih melewatkan angka 0 atau menganggap "lebih banyak angka = lebih besar".',
    instruksi:
      'Kerjakan setiap soal. Pada isian bilangan, ketik dengan tanda koma, misalnya 3,07. Pada isian cara baca, ketik dengan huruf tanpa satuan.',
    banyak: 8,
    komposisi: { tulis: 2, baca: 2, choice: 4 },
    soal: [
      {
        id: 't1',
        type: 'input',
        mode: 'tulis',
        cerita: 'Bidan membacakan berat badan bayi: "tiga koma nol lima kilogram".',
        pertanyaan: 'Tuliskan berat bayi itu dengan angka (tanpa satuan).',
        jawab: '3,05',
        explanation: 'Setelah koma: 0 lalu 5 → 3,05 kg.',
        hints: ['Tulis bagian bulat, koma, lalu angka yang dibacakan satu per satu.'],
        reveal: 'Jawaban: <strong>3,05</strong>.',
      },
      {
        id: 't2',
        type: 'input',
        mode: 'tulis',
        cerita: 'Penjual emas berkata: "dua dan tujuh perseribu gram".',
        pertanyaan: 'Tuliskan berat emas itu dengan angka (tanpa satuan).',
        jawab: '2,007',
        explanation: 'Perseribu → tiga angka di belakang koma; 7 di perseribuan: 2,007 gram.',
        hints: [
          '"Perseribu" berarti ada tiga angka di belakang koma.',
          'Isi tempat yang kosong dengan 0.',
        ],
        reveal: 'Jawaban: <strong>2,007</strong>.',
      },
      {
        id: 't3',
        type: 'input',
        mode: 'tulis',
        cerita:
          'Guru olahraga mencatat lemparan cakram Rudi: "delapan dan dua puluh lima perseratus meter".',
        pertanyaan: 'Tuliskan jarak lemparan itu dengan angka (tanpa satuan).',
        jawab: '8,25',
        explanation: 'Dua puluh lima perseratus = 0,25 → 8,25 m.',
        hints: ['"Perseratus" berarti dua angka di belakang koma.'],
        reveal: 'Jawaban: <strong>8,25</strong>.',
      },
      {
        id: 't4',
        type: 'input',
        mode: 'baca',
        cerita: 'Termometer menunjukkan suhu badan adik 38,6 °C.',
        tampil: '38,6',
        pertanyaan: 'Ketik cara membaca bilangan ini (tanpa satuan).',
        jawab: '38,6',
        explanation: '38,6 dibaca "tiga puluh delapan koma enam".',
        hints: ['Bagian bulat, kata "koma", lalu angka di belakang koma.'],
        reveal: 'Jawaban: "<strong>tiga puluh delapan koma enam</strong>".',
      },
      {
        id: 't5',
        type: 'input',
        mode: 'baca',
        cerita: 'Penakar hujan sekolah mencatat curah hujan 0,08 cm.',
        tampil: '0,08',
        pertanyaan: 'Ketik cara membaca bilangan ini (tanpa satuan).',
        jawab: '0,08',
        explanation: '0,08 dibaca "nol koma nol delapan" atau "delapan perseratus".',
        hints: ['Angka 0 setelah koma ikut dibaca.'],
        reveal: 'Jawaban: "<strong>nol koma nol delapan</strong>".',
      },
      {
        id: 't6',
        type: 'input',
        mode: 'baca',
        cerita: 'Panjang pensil baru Sinta 14,25 cm.',
        tampil: '14,25',
        pertanyaan: 'Ketik cara membaca bilangan ini (tanpa satuan).',
        jawab: '14,25',
        explanation: '14,25 dibaca "empat belas koma dua lima".',
        hints: ['Angka di belakang koma dibaca satu per satu.'],
        reveal: 'Jawaban: "<strong>empat belas koma dua lima</strong>".',
      },
      {
        id: 't7',
        type: 'choice',
        cerita: 'Tiga pelari mencatat waktu: Eko 11,9 detik, Fani 11,85 detik, Gita 12,1 detik.',
        pertanyaan: 'Siapa yang paling cepat?',
        options: [
          { id: 'a', label: 'Fani (11,85 detik)' },
          { id: 'b', label: 'Eko (11,9 detik)' },
          { id: 'c', label: 'Gita (12,1 detik)' },
          { id: 'd', label: 'Eko dan Fani sama cepat' },
        ],
        correct: 'a',
        explanation: '11,85 < 11,90 < 12,1. Waktu paling singkat = paling cepat: Fani.',
      },
      {
        id: 't8',
        type: 'choice',
        cerita: 'Botol A berisi 0,45 liter air, botol B berisi 0,5 liter air.',
        pertanyaan: 'Lambang yang tepat untuk 0,45 ☐ 0,5 adalah …',
        options: [
          { id: 'a', label: '&lt;' },
          { id: 'b', label: '&gt;' },
          { id: 'c', label: '=' },
          { id: 'd', label: 'tidak dapat ditentukan' },
        ],
        correct: 'a',
        explanation: '0,45 dan 0,50: persepuluhan 4 < 5, jadi 0,45 < 0,5.',
      },
      {
        id: 't9',
        type: 'choice',
        cerita: 'Tinggi empat tanaman kacang hijau (cm): 2,3; 2,03; 2,33; 2,303.',
        pertanyaan: 'Urutan dari yang paling pendek adalah …',
        options: [
          { id: 'a', label: '2,03; 2,3; 2,303; 2,33' },
          { id: 'b', label: '2,3; 2,03; 2,33; 2,303' },
          { id: 'c', label: '2,3; 2,33; 2,03; 2,303' },
          { id: 'd', label: '2,303; 2,33; 2,3; 2,03' },
        ],
        correct: 'a',
        explanation: 'Samakan: 2,030; 2,300; 2,303; 2,330 → 2,03 < 2,3 < 2,303 < 2,33.',
      },
      {
        id: 't10',
        type: 'choice',
        cerita: 'Susu kotak A bertuliskan 0,25 L, susu kotak B bertuliskan 0,250 L.',
        pertanyaan: 'Pernyataan yang tepat adalah …',
        options: [
          { id: 'a', label: 'Isi keduanya sama banyak.' },
          { id: 'b', label: 'Susu B lebih banyak karena angkanya lebih banyak.' },
          { id: 'c', label: 'Susu A lebih banyak karena angkanya lebih sedikit.' },
          { id: 'd', label: 'Tidak dapat dibandingkan.' },
        ],
        correct: 'a',
        explanation: 'Angka 0 di ujung kanan tidak mengubah nilai: 0,25 = 0,250.',
      },
      {
        id: 't11',
        type: 'choice',
        cerita: 'Label kemasan obat menuliskan kandungan 5,008 gram.',
        pertanyaan: 'Cara baca yang tepat adalah …',
        options: [
          { id: 'a', label: 'lima koma nol nol delapan' },
          { id: 'b', label: 'lima koma delapan' },
          { id: 'c', label: 'lima dan delapan perseratus' },
          { id: 'd', label: 'lima ribu delapan' },
        ],
        correct: 'a',
        explanation:
          'Semua angka di belakang koma dibaca: "lima koma nol nol delapan" (= "lima dan delapan perseribu").',
      },
      {
        id: 't12',
        type: 'choice',
        cerita: 'Semangka beratnya 3,5 kg dan melon beratnya 3,45 kg.',
        pertanyaan: 'Pernyataan yang tepat adalah …',
        options: [
          { id: 'a', label: 'Semangka lebih berat, karena 3,50 > 3,45.' },
          { id: 'b', label: 'Melon lebih berat, karena 45 > 5.' },
          { id: 'c', label: 'Keduanya sama berat.' },
          { id: 'd', label: 'Melon lebih berat, karena angkanya lebih banyak.' },
        ],
        correct: 'a',
        explanation: 'Persepuluhan: 5 > 4, jadi 3,5 > 3,45 — semangka lebih berat.',
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
    goal: 'Merefleksikan proses menemukan cara membaca, menuliskan, dan membandingkan bilangan desimal.',
    guru: 'Beri waktu hening 3 menit untuk menulis. Jawaban penilaian diri bisa menjadi dasar pengelompokan pada pertemuan berikutnya (mengubah pecahan ↔ desimal & operasi desimal).',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Tuliskan satu bilangan desimal yang pernah kamu temui di rumah atau di sekitarmu. Bagaimana menulis dan membacanya?',
        placeholder: 'Contohnya … ditulis … dan dibaca …',
      },
      {
        id: 'r2',
        teks: 'Mengapa 3,7 bisa lebih besar daripada 3,68 walaupun angkanya lebih sedikit?',
        placeholder: '3,7 lebih besar karena …',
      },
      {
        id: 'r3',
        teks: 'Bagian mana yang masih membingungkan atau ingin kamu pelajari lebih lanjut?',
        placeholder: 'Aku masih bingung tentang …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu membaca, menulis, dan membandingkan bilangan desimal sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'cukup', label: '🙂 Cukup yakin — sesekali masih perlu berpikir' },
      { id: 'ragu', label: '🤔 Masih ragu — perlu latihan lagi' },
      { id: 'belum', label: '🙋 Belum paham — aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, kamu menemukannya sendiri!',
    teks: 'Kamu telah menemukan cara membaca, menuliskan, dan membandingkan bilangan desimal dari alat ukur dalam kehidupan sehari-hari.',
    contoh: [
      { ikon: '⏱️', nama: 'Lari 100 m', nilai: '12,45', satuan: 'detik' },
      { ikon: '⚖️', nama: 'Tepung kue', nilai: '1,05', satuan: 'kilogram' },
      { ikon: '💍', nama: 'Lapisan emas', nilai: '2,005', satuan: 'gram' },
    ],
    capaian: [
      'Menentukan nilai tempat angka di belakang koma: persepuluhan, perseratusan, perseribuan.',
      'Membaca bilangan desimal dengan cara "koma" (angka satu per satu) maupun cara nilai tempat.',
      'Menuliskan bilangan desimal dari kata-kata, termasuk angka 0 pengisi tempat.',
      'Membandingkan dan mengurutkan bilangan desimal berdasarkan nilai tempat serta memaknainya dalam konteks (lebih cepat, lebih jauh, lebih dingin).',
    ],
  },
};
