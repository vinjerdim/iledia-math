'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membaca & Menuliskan Bentuk Akar serta Pangkat Pecahan
   Fase D — SMP Kelas VIII · Topik 12 Bilangan Berpangkat dan Bentuk Akar

   Tujuan Pembelajaran:
   Membaca dan menuliskan bentuk akar serta mengaitkannya dengan
   bilangan berpangkat pecahan.

   Prasyarat: fase-d/mpi-12.1 & 12.2 (membaca bilangan berpangkat,
   sifat pangkat dari pangkat (aᵐ)ⁿ = aᵐˣⁿ).

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'unsur', 'baca' & 'pola'
     Sintaks 4 — Data processing ............ tahap 'olah'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi   (5')  — "Hiasan Kelas": ubin persegi 49 cm² dan kotak
                            kado kubus 125 cm³; papan Bu Sari menulis
                            √49 dan ∛125 = 125^(1/3). Murid MENDUGA cara
                            membaca ∛125 dan arti 125^(1/3) + alasan
                            (tidak dinilai).
     2. Masalah     (4')  — memilih rumusan masalah & menulis hipotesis.
     3. Unsur       (12') — Lab Persegi & Kubus (luas → sisi √, volume →
                            rusuk ∛), isian akar bulat, lalu Anatomi
                            Bentuk Akar: mengetuk tanda akar, indeks,
                            radikan, dan pangkat radikan pada ∛(5²)
                            (urutan bagian diacak) + pertanyaan penuntun.
     4. Baca-tulis  (12') — memilih bacaan baku dari notasi, lalu
                            MENULISKAN notasi dari bacaan dengan papan
                            tulis akar (stepper indeks, radikan, pangkat)
                            berdiagnosa miskonsepsi.
     5. Pola        (12') — Detektif Eksponen: (a^(1/n))ⁿ = a sehingga
                            a^(1/2) = √a, a^(1/3) = ∛a; tangga nilai
                            64^(1/2) … 64^(3/2), ∛(8²) → tabel ringkas →
                            menemukan ⁿ√(aᵐ) = a^(m/n) & cara membacanya.
     6. Olah data   (10') — pertanyaan penuntun, misi Konverter Akar ⇄
                            Pangkat, pilah 8 pernyataan tepat/keliru.
     7. Pembuktian  (8')  — membuktikan dugaan awal; 6 soal membaca,
                            menulis, konversi dua arah, dan nilai.
     8. Simpulan    (5')  — melengkapi kalimat dari bank kalimat acak.
     9. Uji terap   (10') — 8 soal kontekstual (ubin, akuarium, kuis
                            radio, kotak kado, layar jam).
    10. Refleksi    (4')  — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan. Urutan bagian
   pada Anatomi Bentuk Akar juga diacak (makeAnatomiAkarState).

   Notasi teks: a^(p/q) untuk pangkat pecahan, √ ∛ ∜ ⁿ√ untuk akar,
   mis. '∛(5²)'. Teks dirender menjadi HTML oleh tulisAkarHTML().
   Metadata `cek` dipakai tes untuk menghitung ulang kunci dengan
   engine seksi 45 (tests/mpi-12.4-data.test.js):
     { jenis: 'pangkat',     n, r, m }  label benar = formatPangkatPecahan(r, m, n)
     { jenis: 'akar',        a, p, q }  label benar = formatAkar(1, q, a, p)
     { jenis: 'tulis',       n, r, m }  label benar = formatAkar(1, n, r, m)
     { jenis: 'baca',        n, r, m }  label benar = bacaAkar(1, n, r, m)
     { jenis: 'bacaPangkat', a, p, q }  label benar = bacaPangkatPecahan(a, p, q)
     { jenis: 'nilai',       a, p, q }  label/jawab = nilai a^(p/q) (eksak)
   ============================================================ */

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1',
    goal: 'Mengamati cara Bu Sari menuliskan sisi ubin dan rusuk kotak, lalu menduga cara membaca dan artinya.',
    tp: 'Membaca dan menuliskan bentuk akar serta mengaitkannya dengan bilangan berpangkat pecahan.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menyebutkan unsur bentuk akar: tanda akar, indeks, radikan, dan pangkat radikan.',
      'Membaca bentuk akar ⁿ√(aᵐ) dengan bacaan baku, mis. ∛(5²) dibaca “akar pangkat tiga dari 5 pangkat 2”.',
      'Menuliskan bentuk akar dari bacaannya dengan indeks dan pangkat di tempat yang benar.',
      'Mengubah bentuk akar ⁿ√(aᵐ) menjadi pangkat pecahan a^(m/n) dan sebaliknya, serta membacanya.',
    ],
    guru: 'Bacakan cerita bersama. Tanyakan: “Pernahkah kalian melihat tanda seperti ini? Bagaimana membacanya? Mengapa 125 dipangkatkan pecahan?” Biarkan murid menduga tanpa dikoreksi.',
    judul: 'Hiasan Kelas',
    cerita:
      'Rara menyiapkan hiasan kelas. Ia punya ubin persegi seluas 49 cm² dan kotak kado berbentuk kubus bervolume 125 cm³. Di papan tulis, Bu Sari menuliskan panjang sisi ubin dan panjang rusuk kotak dengan tanda yang belum pernah Rara lihat.',
    papanLabel: 'Papan tulis Bu Sari',
    papan: ['sisi ubin = √49 cm', 'rusuk kotak = ∛125 = 125^(1/3) cm'],
    pertanyaanBaca: 'Menurut dugaanmu, bagaimana cara membaca ∛125?',
    opsiBaca: [
      { id: 'baku', label: 'akar pangkat tiga dari 125' },
      { id: 'pangkat', label: 'akar 125 pangkat tiga' },
      { id: 'koef', label: 'tiga akar 125' },
      { id: 'bagi', label: '125 dibagi tiga' },
    ],
    dugaanBacaTepat: 'baku',
    pertanyaan: 'Menurut dugaanmu, apa arti tulisan 125^(1/3) (125 pangkat satu per tiga)?',
    opsi: [
      {
        id: 'akar',
        label: 'Sama dengan ∛125, yaitu bilangan yang jika dipangkatkan tiga hasilnya 125',
      },
      { id: 'bagi', label: '125 dibagi 3' },
      { id: 'kali', label: '125 dikalikan ⅓ lalu dipangkatkan tiga' },
      { id: 'kecil', label: 'Bilangan yang sangat kecil, karena pangkatnya pecahan' },
    ],
    dugaanTepat: 'akar',
    alasanLabel: 'Mengapa kamu menduga begitu? (tulis singkat)',
    alasanPlaceholder: 'Menurutku … karena …',
    catatan:
      'Belum ada jawaban benar atau salah. Dugaanmu akan kamu buktikan sendiri di tahap-tahap berikutnya.',
    nextLabel: 'Lanjut ke Rumusan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: 'Discovery Learning · Sintaks 2',
    goal: 'Merumuskan pertanyaan inti yang akan diselidiki dan menuliskan hipotesis.',
    guru: 'Arahkan murid memilih pertanyaan yang mencakup cara MEMBACA, cara MENULIS, dan HUBUNGAN bentuk akar dengan pangkat pecahan. Hipotesis boleh keliru; yang penting dapat diuji.',
    pengantar:
      'Papan Bu Sari memunculkan beberapa pertanyaan. Pilih pertanyaan yang paling tepat untuk kita selidiki bersama.',
    pertanyaan: 'Pertanyaan manakah yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'inti',
        label:
          'Bagaimana cara membaca dan menuliskan bentuk akar seperti ∛125, dan apa hubungannya dengan bilangan berpangkat pecahan seperti 125^(1/3)?',
      },
      { id: 'luas', label: 'Berapa luas ubin jika sisinya 49 cm?' },
      { id: 'harga', label: 'Berapa harga kotak kado bervolume 125 cm³?' },
      {
        id: 'kalkulator',
        label: 'Tombol kalkulator mana yang harus ditekan untuk menghitung 125?',
      },
    ],
    correct: 'inti',
    umpan: {
      inti: 'Tepat! Pertanyaan ini mencakup cara MEMBACA, cara MENULIS, dan HUBUNGAN bentuk akar dengan pangkat pecahan.',
      luas: 'Luas ubin sudah diketahui, 49 cm². Yang membingungkan adalah cara menulis dan membaca √49.',
      harga:
        'Pertanyaan itu menarik untuk berbelanja, tetapi masalah kita adalah arti tulisan ∛125 dan 125^(1/3).',
      kalkulator:
        'Kalkulator memang membantu, tetapi kita perlu tahu dulu arti tanda ∛ dan pangkat 1/3.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: bagaimana membaca ∛125, dan apa hubungan ∛125 dengan 125^(1/3)?',
    hipotesisPlaceholder: 'Menurutku, ∛125 dibaca … dan sama dengan 125^(1/3) karena …',
    nextLabel: 'Mulai Lab Persegi & Kubus →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MENGUMPULKAN DATA A: UNSUR BENTUK AKAR
     ---------------------------------------------------------- */
  unsur: {
    kicker: 'Tahap 3 · Mengumpulkan Data (A)',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Mengumpulkan data sisi persegi dan rusuk kubus, lalu mengenali unsur-unsur bentuk akar.',
    guru: 'Minta pasangan bergantian menggeser. Tanyakan: “Luas berapa saja yang sisinya bilangan bulat?” Saat anatomi, minta murid menyebut nama bagian dengan suara keras sebelum mengetuk.',
    instruksi:
      'Geser luas persegi dan volume kubus. Coba minimal 4 luas pada persegi dan 3 volume pada kubus. Perhatikan tanda akar yang dipakai untuk sisi dan untuk rusuk.',
    jejakMin: { persegi: 4, kubus: 3 },
    instruksiLangkah:
      'Catat hasil pengamatanmu. Tanda √ (akar kuadrat) mencari SISI persegi dari luasnya; tanda ∛ (akar pangkat tiga) mencari RUSUK kubus dari volumenya.',
    langkah: [
      {
        id: 'a1',
        r: 49,
        n: 2,
        jawab: 7,
        label: 'Ubin persegi seluas 49 cm². Panjang sisinya √49 = …',
        hints: [
          'Bilangan berapa yang dikalikan dengan dirinya sendiri hasilnya 49?',
          '7 × 7 = 49.',
        ],
        temuan: '√49 = 7 karena 7² = 49.',
      },
      {
        id: 'a2',
        r: 144,
        n: 2,
        jawab: 12,
        label: 'Persegi dengan luas 144 satuan². Panjang sisinya √144 = …',
        hints: ['Coba 10 × 10 = 100 (terlalu kecil). Naikkan sedikit.', '12 × 12 = 144.'],
        temuan: '√144 = 12 karena 12² = 144.',
      },
      {
        id: 'a3',
        r: 64,
        n: 3,
        jawab: 4,
        label: 'Kubus dengan volume 64 satuan³. Panjang rusuknya ∛64 = …',
        hints: [
          'Cari bilangan yang dikalikan TIGA kali dengan dirinya sendiri hasilnya 64.',
          '4 × 4 × 4 = 64.',
        ],
        temuan: '∛64 = 4 karena 4³ = 64.',
      },
      {
        id: 'a4',
        r: 125,
        n: 3,
        jawab: 5,
        label: 'Kotak kado kubus bervolume 125 cm³. Panjang rusuknya ∛125 = …',
        hints: ['Coba 5 × 5 × 5.'],
        temuan: '∛125 = 5 karena 5³ = 125.',
      },
    ],
    instruksiAnatomi:
      'Anatomi Bentuk Akar: bentuk akar juga bisa memuat pangkat di dalamnya, seperti ∛(5²). Ketuk bagian yang diminta satu per satu. Nama bagian akan muncul di bawah model.',
    anatomiContoh: { n: 3, r: 5, m: 2 },
    anatomiBagian: ['tanda', 'indeks', 'radikan', 'pangkat'],
    umpanAnatomi: {
      benar: 'Tepat! Bagian itu sudah kamu temukan.',
      salah: 'Belum tepat. Baca lagi nama bagian yang diminta, lalu coba bagian lain.',
    },
    tanya: [
      {
        id: 'u1',
        tanya: 'Pada √7 tidak tampak angka kecil di kiri atas tanda akar. Indeks akarnya adalah …',
        opsi: [
          { id: 'dua', label: '2, karena indeks 2 (akar kuadrat) tidak ditulis' },
          { id: 'tujuh', label: '7' },
          { id: 'satu', label: '1' },
          { id: 'nol', label: 'tidak ada indeksnya (0)' },
        ],
        correct: 'dua',
        umpan: {
          dua: 'Tepat! √7 = ²√7, yaitu akar kuadrat dari 7. Indeks 2 disepakati tidak ditulis.',
          tujuh: '7 adalah radikan, yaitu bilangan di bawah tanda akar.',
          satu: 'Akar pangkat 1 tidak mengubah apa pun, jadi tidak dipakai. √ sama dengan akar kuadrat.',
          nol: 'Setiap bentuk akar punya indeks. Ingat sisi persegi: √49 = 7 karena 7² = 49, jadi indeksnya 2.',
        },
      },
      {
        id: 'u2',
        tanya: 'Pada bentuk akar ⁵√(3⁴), manakah pasangan yang tepat?',
        opsi: [
          { id: 'benar', label: 'indeks 5, radikan 3, pangkat radikan 4' },
          { id: 'tukar', label: 'indeks 4, radikan 3, pangkat radikan 5' },
          { id: 'radikan', label: 'indeks 5, radikan 4, pangkat radikan 3' },
          { id: 'acak', label: 'indeks 3, radikan 5, pangkat radikan 4' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! Indeks di kiri atas tanda akar, radikan di bawah tanda akar, dan pangkat radikan di kanan atas radikan.',
          tukar:
            'Indeks dan pangkat radikan tertukar. Indeks ada di KIRI ATAS tanda akar; pangkat radikan ada di KANAN ATAS radikan.',
          radikan:
            'Radikan adalah bilangan besar di bawah tanda akar (3), sedangkan 4 adalah pangkatnya.',
          acak: 'Perhatikan posisinya: angka kecil di kiri atas tanda akar adalah indeks.',
        },
      },
    ],
    temuan:
      'Temuan: bentuk akar ⁿ√(aᵐ) terdiri atas tanda akar √, indeks n (kiri atas), radikan a (di bawah tanda akar), dan pangkat radikan m. Indeks 2 dan pangkat 1 tidak ditulis.',
    nextLabel: 'Lanjut ke Baca & Tulis →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MENGUMPULKAN DATA B: MEMBACA & MENULISKAN
     ---------------------------------------------------------- */
  baca: {
    kicker: 'Tahap 4 · Mengumpulkan Data (B)',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Menemukan pola bacaan baku bentuk akar, lalu menuliskan bentuk akar dari bacaannya.',
    guru: 'Minta satu murid membacakan, pasangannya menulis di papan tulis akar. Tekankan urutan bacaan: indeks → radikan → pangkat radikan.',
    instruksiBaca:
      'Pilih cara membaca yang tepat untuk setiap bentuk akar. Perhatikan urutan bagian yang disebutkan.',
    bacaan: [
      {
        id: 'b1',
        tanya: 'Cara membaca √10 adalah …',
        cek: { jenis: 'baca', n: 2, r: 10, m: 1 },
        opsi: [
          { id: 'benar', label: 'akar kuadrat dari 10' },
          { id: 'tukar', label: 'akar pangkat sepuluh dari 2' },
          { id: 'koef', label: '10 akar kuadrat' },
          { id: 'kuadrat', label: '10 kuadrat' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! Tanda √ tanpa indeks dibaca “akar kuadrat”, lalu disebut radikannya.',
          tukar: 'Radikan 10 ada di bawah tanda akar; indeksnya 2 (tidak ditulis).',
          koef: 'Bila ada bilangan di depan akar, barulah dibaca lebih dulu (mis. 3√10 “tiga akar kuadrat dari 10”). √10 tidak punya bilangan di depannya.',
          kuadrat: '“10 kuadrat” adalah 10² = 100, bukan √10.',
        },
      },
      {
        id: 'b2',
        tanya: 'Cara membaca ∛(5²) adalah …',
        cek: { jenis: 'baca', n: 3, r: 5, m: 2 },
        opsi: [
          { id: 'benar', label: 'akar pangkat tiga dari 5 pangkat 2' },
          { id: 'tukar', label: 'akar kuadrat dari 5 pangkat 3' },
          { id: 'koef', label: '3 akar 5 pangkat 2' },
          { id: 'kali', label: 'akar pangkat tiga dari 10' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! Sebut indeksnya dulu (“akar pangkat tiga”), lalu radikan (“dari 5”), lalu pangkat radikan (“pangkat 2”).',
          tukar: 'Indeks dan pangkat radikan tertukar. Indeks 3 ada di kiri atas tanda akar.',
          koef: 'Angka 3 bukan pengali di depan akar, melainkan indeks yang dibaca “akar pangkat tiga”.',
          kali: '5² = 5 × 5 = 25, bukan 5 × 2. Lagi pula, bacaan baku menyebut pangkatnya, bukan hasilnya.',
        },
      },
      {
        id: 'b3',
        tanya: 'Cara membaca ∜(2³) adalah …',
        cek: { jenis: 'baca', n: 4, r: 2, m: 3 },
        opsi: [
          { id: 'benar', label: 'akar pangkat empat dari 2 pangkat 3' },
          { id: 'tukar', label: 'akar pangkat tiga dari 2 pangkat 4' },
          { id: 'radikan', label: 'akar pangkat empat dari 3 pangkat 2' },
          { id: 'koef', label: '4 akar 2 pangkat 3' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! ∜ berindeks 4, radikannya 2, dan pangkat radikannya 3.',
          tukar: 'Indeks dan pangkat radikan tertukar. Indeks 4 ada di kiri atas tanda akar.',
          radikan:
            'Radikan dan pangkatnya tertukar. Radikan adalah bilangan besar di bawah tanda akar, yaitu 2.',
          koef: 'Angka 4 adalah indeks, dibaca “akar pangkat empat”, bukan pengali.',
        },
      },
      {
        id: 'b4',
        tanya: 'Cara membaca ⁵√7 adalah …',
        cek: { jenis: 'baca', n: 5, r: 7, m: 1 },
        opsi: [
          { id: 'benar', label: 'akar pangkat lima dari 7' },
          { id: 'tukar', label: 'akar pangkat tujuh dari 5' },
          { id: 'koef', label: '5 akar kuadrat dari 7' },
          { id: 'pangkat', label: '7 pangkat 5' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! Indeks 5 dibaca “akar pangkat lima”, radikannya 7.',
          tukar: 'Radikan adalah bilangan di bawah tanda akar (7); indeksnya 5.',
          koef: 'Angka 5 ditulis kecil di kiri atas: itu indeks, bukan pengali di depan akar.',
          pangkat: '7⁵ adalah 7 pangkat 5 — bentuk berpangkat, bukan bentuk akar.',
        },
      },
    ],
    instruksiTulis:
      'Papan Tulis Akar: dengarkan (baca) kalimatnya, atur indeks n, radikan a, dan pangkat radikan m dengan tombol − dan +, lalu tekan Periksa.',
    tulisAwal: { a: 2, m: 1, n: 2 },
    tulis: [
      {
        id: 't1',
        teks: 'akar pangkat tiga dari 7',
        target: { a: 7, m: 1, n: 3 },
        temuan: '“akar pangkat tiga dari 7” ditulis ∛7.',
      },
      {
        id: 't2',
        teks: 'akar pangkat empat dari 3 pangkat 2',
        target: { a: 3, m: 2, n: 4 },
        temuan: '“akar pangkat empat dari 3 pangkat 2” ditulis ∜(3²).',
      },
      {
        id: 't3',
        teks: 'akar kuadrat dari 6 pangkat 5',
        target: { a: 6, m: 5, n: 2 },
        temuan: '“akar kuadrat dari 6 pangkat 5” ditulis √(6⁵). Indeks 2 tidak ditulis.',
      },
    ],
    temuan:
      'Temuan: ⁿ√(aᵐ) dibaca “akar pangkat n dari a pangkat m”. Urutan bacaannya: indeks → radikan → pangkat radikan. Untuk indeks 2 cukup dibaca “akar kuadrat”.',
    nextLabel: 'Lanjut ke Detektif Eksponen →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGUMPULKAN DATA C: POLA PANGKAT PECAHAN
     ---------------------------------------------------------- */
  pola: {
    kicker: 'Tahap 5 · Mengumpulkan Data (C)',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Menemukan arti pangkat ½ dan ⅓, lalu hubungan a^(m/n) dengan bentuk akar ⁿ√(aᵐ).',
    guru: 'Ingatkan sifat pangkat dari pangkat dari MPI 12.1–12.2. Pada tangga 64, pancing dengan: “Pangkat 2/3 = 1/3 × 2. Mana yang dikerjakan dulu?” Tekankan bahwa ∛(8²) dan (∛8)² hasilnya sama.',
    instruksiDetektif:
      'Detektif Eksponen: bagaimana kalau pangkatnya pecahan? Gunakan sifat pangkat dari pangkat yang sudah kamu pelajari: (aᵐ)ⁿ = aᵐˣⁿ.',
    detektif: [
      {
        id: 'd1',
        tanya:
          'Kita cari x agar (9ˣ)² = 9¹. Menurut sifat pangkat dari pangkat, x × 2 = 1. Jadi x = …',
        opsi: [
          { id: 'setengah', label: 'x = 1/2' },
          { id: 'dua', label: 'x = 2' },
          { id: 'negdua', label: 'x = −2' },
          { id: 'nol', label: 'x = 0' },
        ],
        correct: 'setengah',
        umpan: {
          setengah: 'Tepat! (9^(1/2))² = 9^(1/2 × 2) = 9¹ = 9.',
          dua: 'Periksa: (9²)² = 9⁴, bukan 9¹. Kita butuh x × 2 = 1.',
          negdua: 'Periksa: (9⁻²)² = 9⁻⁴, bukan 9¹. Kita butuh x × 2 = 1.',
          nol: 'Periksa: (9⁰)² = 9⁰ = 1, bukan 9. Kita butuh x × 2 = 1.',
        },
      },
      {
        id: 'd2',
        tanya: 'Kita tahu (9^(1/2))² = 9 dan juga (√9)² = 3 × 3 = 9. Jadi 9^(1/2) sama dengan …',
        opsi: [
          { id: 'akar', label: '√9 = 3' },
          { id: 'bagi', label: '9 : 2 = 4,5' },
          { id: 'kali', label: '9 × ½ = 4,5' },
          { id: 'kuadrat', label: '9² = 81' },
        ],
        correct: 'akar',
        umpan: {
          akar: 'Tepat! Pangkat ½ sama artinya dengan akar kuadrat: 9^(1/2) = √9 = 3.',
          bagi: 'Periksa: 4,5 × 4,5 = 20,25, bukan 9. Pangkat ½ bukan membagi dua.',
          kali: 'Periksa: 4,5 × 4,5 = 20,25, bukan 9. Pangkat ½ bukan mengalikan dengan ½.',
          kuadrat: '9² = 81 adalah pangkat 2, bukan pangkat ½.',
        },
      },
      {
        id: 'd3',
        tanya: 'Dengan cara yang sama, (125ˣ)³ = 125¹. Nilai x dan artinya adalah …',
        opsi: [
          { id: 'sepertiga', label: 'x = 1/3, jadi 125^(1/3) = ∛125 = 5' },
          { id: 'tiga', label: 'x = 3, jadi 125³' },
          { id: 'bagi', label: 'x = 1/3, jadi 125^(1/3) = 125 : 3' },
          { id: 'akar2', label: 'x = 1/3, jadi 125^(1/3) = √125' },
        ],
        correct: 'sepertiga',
        umpan: {
          sepertiga:
            'Tepat! (125^(1/3))³ = 125¹ dan (∛125)³ = 5 × 5 × 5 = 125. Jadi rusuk kotak Rara: 125^(1/3) = ∛125 = 5 cm.',
          tiga: '(125³)³ = 125⁹, bukan 125¹. Kita butuh x × 3 = 1.',
          bagi: 'x = 1/3 sudah benar, tetapi pangkat ⅓ bukan membagi tiga. Cari bilangan yang dipangkatkan 3 hasilnya 125.',
          akar2:
            'x = 1/3 sudah benar, tetapi pangkat ⅓ berpasangan dengan akar pangkat TIGA (∛), bukan akar kuadrat.',
        },
      },
    ],
    temuanDetektif:
      'Temuan: a^(1/2) = √a dan a^(1/3) = ∛a. Penyebut pecahan pangkat menunjukkan indeks akarnya!',
    cerita:
      'Bu Sari membawa 64 kubus satuan. 64 bisa disusun menjadi persegi 8 × 8, kubus 4 × 4 × 4, bahkan 2 × 2 × 2 × 2 × 2 × 2. Mari hitung nilai pangkat pecahan dari 64!',
    instruksi:
      'Hitung setiap nilai. Ingat temuanmu: penyebut pangkat menunjukkan indeks akar, dan pembilang menunjukkan pangkat biasa.',
    langkah: [
      {
        id: 'p1',
        cek: { a: 64, p: 1, q: 2 },
        jawab: 8,
        label: '64^(1/2) = √64 = …',
        hints: ['Persegi 8 × 8 berisi 64 kubus satuan.'],
        temuan: '64^(1/2) = √64 = 8.',
      },
      {
        id: 'p2',
        cek: { a: 64, p: 1, q: 3 },
        jawab: 4,
        label: '64^(1/3) = ∛64 = …',
        hints: ['Kubus 4 × 4 × 4 berisi 64 kubus satuan.'],
        temuan: '64^(1/3) = ∛64 = 4.',
      },
      {
        id: 'p3',
        cek: { a: 64, p: 1, q: 6 },
        jawab: 2,
        label: '64^(1/6) = ⁶√64 = …',
        hints: [
          'Penyebut 6 → cari bilangan yang dikalikan ENAM kali dengan dirinya sendiri hasilnya 64.',
          '2 × 2 × 2 × 2 × 2 × 2 = 64.',
        ],
        temuan: '64^(1/6) = ⁶√64 = 2 karena 2⁶ = 64.',
      },
      {
        id: 'p4',
        cek: { a: 64, p: 2, q: 3 },
        jawab: 16,
        label: '64^(2/3) = (64^(1/3))² = (∛64)² = …',
        hints: ['Kerjakan akarnya dulu: ∛64 = 4.', 'Lalu kuadratkan: 4² = 4 × 4.'],
        temuan: '64^(2/3) = (∛64)² = 4² = 16.',
      },
      {
        id: 'p5',
        cek: { a: 64, p: 3, q: 2 },
        jawab: 512,
        label: '64^(3/2) = (√64)³ = …',
        hints: ['√64 = 8.', 'Lalu 8³ = 8 × 8 × 8.'],
        temuan: '64^(3/2) = (√64)³ = 8³ = 512.',
      },
      {
        id: 'p6',
        cek: { a: 8, p: 2, q: 3 },
        jawab: 4,
        label: 'Bandingkan: ∛(8²) = ∛64 = …  (dan (∛8)² = 2² = 4)',
        hints: ['8² = 64.', 'Kamu sudah tahu ∛64 dari langkah sebelumnya.'],
        temuan:
          '∛(8²) = (∛8)² = 4 = 8^(2/3). Memangkatkan dulu atau mengakarkan dulu, hasilnya SAMA.',
      },
    ],
    tabelJudul: 'Tabel temuanmu',
    tabel: [
      { a: 64, p: 1, q: 2 },
      { a: 64, p: 1, q: 3 },
      { a: 64, p: 1, q: 6 },
      { a: 64, p: 2, q: 3 },
      { a: 64, p: 3, q: 2 },
      { a: 8, p: 2, q: 3 },
    ],
    tanya: [
      {
        id: 'k1',
        tanya: 'Dari tabel, a^(m/n) dapat ditulis dalam bentuk akar sebagai …',
        opsi: [
          {
            id: 'benar',
            label: 'ⁿ√(aᵐ) — pembilang m menjadi pangkat radikan, penyebut n menjadi indeks akar',
          },
          { id: 'tukar', label: 'ᵐ√(aⁿ) — pembilang m menjadi indeks akar' },
          { id: 'bagi', label: 'aᵐ : n' },
          { id: 'kali', label: 'n × √(aᵐ)' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! Misalnya 64^(2/3) = ∛(64²) = (∛64)² = 16.',
          tukar:
            'Terbalik. Coba 64^(3/2): tabel menunjukkan (√64)³ = 512. Penyebut 2 menjadi indeks akar √.',
          bagi: 'Periksa: 64² : 3 bukan 16. Penyebut bukan pembagi, melainkan indeks akar.',
          kali: 'Penyebut n bukan pengali di depan akar, melainkan indeks akar.',
        },
      },
      {
        id: 'k2',
        tanya: 'Pangkat pecahan dibaca seperti pecahan biasa. Cara membaca 64^(2/3) adalah …',
        cek: { jenis: 'bacaPangkat', a: 64, p: 2, q: 3 },
        opsi: [
          { id: 'benar', label: '64 pangkat dua per tiga' },
          { id: 'tukar', label: '64 pangkat tiga per dua' },
          { id: 'kali', label: '64 pangkat dua kali tiga' },
          { id: 'akar', label: 'akar pangkat dua dari 64 pangkat 3' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! 2/3 dibaca “dua per tiga”, jadi 64^(2/3) dibaca “64 pangkat dua per tiga” — sama nilainya dengan “akar pangkat tiga dari 64 pangkat 2”.',
          tukar: 'Pembilang (2) dibaca lebih dulu, baru penyebut (3): “dua per tiga”.',
          kali: 'Garis pecahan dibaca “per”, bukan “kali”.',
          akar: 'Indeks dan pangkat tertukar. 64^(2/3) = ∛(64²), yaitu “akar pangkat tiga dari 64 pangkat 2”.',
        },
      },
    ],
    nextLabel: 'Lanjut Mengolah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGOLAH DATA
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 6 · Mengolah Data',
    syntax: 'Discovery Learning · Sintaks 4',
    goal: 'Mengolah temuan menjadi aturan membaca, menulis, dan mengubah bentuk akar ⇄ pangkat pecahan.',
    guru: 'Saat misi konverter, minta murid membacakan dulu bentuk yang diminta, lalu menyebutkan nilai a, m, dan n sebelum menekan tombol. Diskusikan pernyataan pilah yang paling banyak dijawab keliru.',
    pengantar:
      'Gunakan data dari Anatomi, Baca & Tulis, dan Tangga Pangkat 64 untuk menjawab pertanyaan penuntun berikut.',
    konsep: [
      {
        id: 'k1',
        tanya: 'Bentuk pangkat pecahan dari ⁵√(3²) adalah …',
        cek: { jenis: 'pangkat', n: 5, r: 3, m: 2 },
        opsi: [
          { id: 'benar', label: '3^(2/5)' },
          { id: 'tukar', label: '3^(5/2)' },
          { id: 'basis', label: '2^(3/5)' },
          { id: 'kurang', label: '3^(2−5)' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! Pangkat radikan (2) menjadi pembilang, indeks akar (5) menjadi penyebut.',
          tukar: 'Terbalik. Indeks akar 5 menjadi PENYEBUT, pangkat radikan 2 menjadi pembilang.',
          basis: 'Basisnya tetap radikan, yaitu 3.',
          kurang: 'Tidak ada pengurangan. Indeks akar menjadi penyebut pecahan pangkat.',
        },
      },
      {
        id: 'k2',
        tanya: 'Bentuk akar dari 7^(3/4) adalah …',
        cek: { jenis: 'akar', a: 7, p: 3, q: 4 },
        opsi: [
          { id: 'benar', label: '∜(7³)' },
          { id: 'tukar', label: '∛(7⁴)' },
          { id: 'koef', label: '4√(7³)' },
          { id: 'bagi', label: '7³ : 4' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! Penyebut 4 menjadi indeks akar, pembilang 3 menjadi pangkat radikan.',
          tukar:
            'Terbalik. Penyebut (4) menjadi indeks akar, pembilang (3) menjadi pangkat di dalam akar.',
          koef: 'Angka 4 ditulis kecil di KIRI ATAS tanda akar (indeks), bukan besar di depan akar sebagai pengali.',
          bagi: 'Penyebut pecahan pangkat bukan pembagi, melainkan indeks akar.',
        },
      },
      {
        id: 'k3',
        tanya:
          'Bentuk akar yang dibaca “akar pangkat tiga dari 2 pangkat 5” sama dengan pangkat pecahan …',
        cek: { jenis: 'pangkat', n: 3, r: 2, m: 5 },
        opsi: [
          { id: 'benar', label: '2^(5/3)' },
          { id: 'tukar', label: '2^(3/5)' },
          { id: 'basis', label: '5^(2/3)' },
          { id: 'kali', label: '2¹⁵' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! Bacaan itu ditulis ∛(2⁵) = 2^(5/3).',
          tukar: 'Indeksnya 3 (“akar pangkat tiga”), jadi 3 menjadi PENYEBUT.',
          basis: 'Radikannya 2 (“dari 2”), jadi basisnya 2.',
          kali: 'Indeks dan pangkat tidak dikalikan. Indeks menjadi penyebut: 5/3.',
        },
      },
    ],
    instruksiMisi:
      'Misi Konverter: atur a, m, dan n dengan tombol − dan + sampai konverter menampilkan bentuk yang diminta. Perhatikan warna: m (pembilang) dan n (penyebut).',
    konverterAwal: { a: 8, m: 1, n: 3 },
    misi: [
      {
        id: 'm1',
        teks: 'Tampilkan ∛(5²). Apa bentuk pangkat pecahannya?',
        target: { a: 5, m: 2, n: 3 },
        temuan: '∛(5²) = 5^(2/3), dibaca “5 pangkat dua per tiga”.',
      },
      {
        id: 'm2',
        teks: 'Tampilkan 2^(3/4). Apa bentuk akarnya?',
        target: { a: 2, m: 3, n: 4 },
        temuan: '2^(3/4) = ∜(2³), dibaca “akar pangkat empat dari 2 pangkat 3”.',
      },
      {
        id: 'm3',
        teks: 'Tampilkan 10^(1/2). Apa bentuk akarnya?',
        target: { a: 10, m: 1, n: 2 },
        temuan: '10^(1/2) = √10, dibaca “akar kuadrat dari 10”. Indeks 2 tidak ditulis.',
      },
    ],
    instruksiPilah:
      'Pilah setiap pernyataan berikut: TEPAT atau KELIRU? Setiap butir hanya bisa dijawab sekali.',
    opsiPilah: [
      { id: 'tepat', label: 'Tepat' },
      { id: 'keliru', label: 'Keliru' },
    ],
    pilah: [
      {
        id: 'q1',
        teks: '∛(4²) = 4^(2/3)',
        cek: { jenis: 'konversi', n: 3, r: 4, m: 2, pangkat: { a: 4, p: 2, q: 3 } },
        correct: 'tepat',
        explanation: 'Pangkat radikan 2 menjadi pembilang, indeks 3 menjadi penyebut.',
      },
      {
        id: 'q2',
        teks: '√5 = 5^(1/2)',
        cek: { jenis: 'konversi', n: 2, r: 5, m: 1, pangkat: { a: 5, p: 1, q: 2 } },
        correct: 'tepat',
        explanation: 'Akar kuadrat sama dengan pangkat ½.',
      },
      {
        id: 'q3',
        teks: '√(6³) = 6^(2/3)',
        cek: { jenis: 'konversi', n: 2, r: 6, m: 3, pangkat: { a: 6, p: 2, q: 3 } },
        correct: 'keliru',
        explanation: 'Pembilang dan penyebut tertukar. √(6³) = 6^(3/2).',
      },
      {
        id: 'q4',
        teks: '∜(3⁸) = 3^(4/8)',
        cek: { jenis: 'konversi', n: 4, r: 3, m: 8, pangkat: { a: 3, p: 4, q: 8 } },
        correct: 'keliru',
        explanation: 'Terbalik: ∜(3⁸) = 3^(8/4) = 3² = 9.',
      },
      {
        id: 'q5',
        teks: '⁵√(2³) dibaca “akar pangkat lima dari 2 pangkat 3”',
        cek: { jenis: 'baca', n: 5, r: 2, m: 3, bacaan: 'akar pangkat lima dari 2 pangkat 3' },
        correct: 'tepat',
        explanation: 'Indeks 5 → “akar pangkat lima”, radikan 2, pangkat radikan 3.',
      },
      {
        id: 'q6',
        teks: '√11 dibaca “akar pangkat sebelas dari 2”',
        cek: { jenis: 'baca', n: 2, r: 11, m: 1, bacaan: 'akar pangkat sebelas dari 2' },
        correct: 'keliru',
        explanation: '11 adalah radikan dan indeksnya 2: √11 dibaca “akar kuadrat dari 11”.',
      },
      {
        id: 'q7',
        teks: '9^(3/2) dibaca “9 pangkat tiga per dua”',
        cek: { jenis: 'bacaPangkat', a: 9, p: 3, q: 2, bacaan: '9 pangkat tiga per dua' },
        correct: 'tepat',
        explanation: '3/2 dibaca “tiga per dua”. Bentuk akarnya √(9³) = 27.',
      },
      {
        id: 'q8',
        teks: '“akar kuadrat dari 10” ditulis 2√10',
        cek: { jenis: 'tulis', n: 2, r: 10, m: 1, tulisan: '2√10' },
        correct: 'keliru',
        explanation:
          'Indeks 2 tidak ditulis, apalagi di depan akar. “akar kuadrat dari 10” ditulis √10; 2√10 berarti 2 × √10.',
      },
    ],
    nextLabel: 'Lanjut ke Pembuktian →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 7 · Pembuktian',
    syntax: 'Discovery Learning · Sintaks 5',
    goal: 'Membuktikan dugaan awal dan menguji temuan pada soal membaca, menulis, dan mengubah bentuk.',
    guru: 'Minta murid memeriksa ∛125 = 5 dengan 5 × 5 × 5. Bahas pengecoh yang paling banyak dipilih, terutama indeks–pangkat yang tertukar.',
    prediksiLabel: 'Dugaan awalmu',
    prediksiBacaLabel: 'Dugaan cara membaca ∛125',
    hipotesisLabel: 'Hipotesismu',
    kesimpulanBaca: {
      benar: 'Dugaan bacaanmu tepat: ∛125 dibaca “akar pangkat tiga dari 125”.',
      salah:
        'Bacaan bakunya adalah “akar pangkat tiga dari 125”: indeks disebut dulu, lalu radikan.',
    },
    kesimpulanDugaan: {
      akar: 'Dugaanmu terbukti! 125^(1/3) = ∛125, bilangan yang jika dipangkatkan tiga hasilnya 125, yaitu 5. Rusuk kotak kado Rara 5 cm.',
      bagi: 'Dugaanmu belum tepat: 125 : 3 ≈ 41,7, padahal 41,7³ jauh lebih dari 125. 125^(1/3) = ∛125 = 5.',
      kali: 'Dugaanmu belum tepat: pangkat ⅓ bukan mengalikan dengan ⅓. 125^(1/3) = ∛125 = 5.',
      kecil:
        'Dugaanmu belum tepat: 125^(1/3) = ∛125 = 5, tidak kecil. Pangkat pecahan berarti bentuk akar.',
    },
    instruksiSoal:
      'Uji temuanmu. Setiap soal hanya bisa dijawab sekali, jadi periksa dengan teliti sebelum memilih.',
    soal: [
      {
        id: 'v1',
        pernyataan: 'Cara membaca ∛(6²) yang tepat adalah …',
        options: [
          { id: 'benar', label: 'akar pangkat tiga dari 6 pangkat 2' },
          { id: 'tukar', label: 'akar kuadrat dari 6 pangkat 3' },
          { id: 'koef', label: '3 akar 6 pangkat 2' },
          { id: 'kali', label: 'akar pangkat tiga dari 12' },
        ],
        correct: 'benar',
        cek: { jenis: 'baca', n: 3, r: 6, m: 2 },
        explanation: 'Indeks 3 → “akar pangkat tiga”, radikan 6, pangkat radikan 2.',
      },
      {
        id: 'v2',
        pernyataan: 'Bentuk akar dari bacaan “akar pangkat empat dari 5 pangkat 3” adalah …',
        options: [
          { id: 'benar', label: '∜(5³)' },
          { id: 'tukar', label: '∛(5⁴)' },
          { id: 'koef', label: '4√(5³)' },
          { id: 'radikan', label: '∜(3⁵)' },
        ],
        correct: 'benar',
        cek: { jenis: 'tulis', n: 4, r: 5, m: 3 },
        explanation: 'Indeks 4 di kiri atas tanda akar, radikan 5, dan pangkat radikan 3: ∜(5³).',
      },
      {
        id: 'v3',
        pernyataan: 'Bentuk pangkat pecahan dari ∛125 adalah …',
        options: [
          { id: 'benar', label: '125^(1/3)' },
          { id: 'kubik', label: '125³' },
          { id: 'tukar', label: '3^(1/125)' },
          { id: 'bagi', label: '125 : 3' },
        ],
        correct: 'benar',
        cek: { jenis: 'pangkat', n: 3, r: 125, m: 1 },
        explanation: '∛125 berindeks 3 dan pangkat radikannya 1: 125^(1/3).',
      },
      {
        id: 'v4',
        pernyataan: 'Bentuk akar dari 10^(2/3) adalah …',
        options: [
          { id: 'benar', label: '∛(10²)' },
          { id: 'tukar', label: '√(10³)' },
          { id: 'koef', label: '3√(10²)' },
          { id: 'bagi', label: '10² : 3' },
        ],
        correct: 'benar',
        cek: { jenis: 'akar', a: 10, p: 2, q: 3 },
        explanation: 'Penyebut 3 menjadi indeks akar, pembilang 2 menjadi pangkat radikan: ∛(10²).',
      },
      {
        id: 'v5',
        pernyataan: 'Nilai dari 27^(2/3) adalah …',
        options: [
          { id: 'benar', label: '9' },
          { id: 'kali', label: '18' },
          { id: 'akar', label: '3' },
          { id: 'tukar', label: '729' },
        ],
        correct: 'benar',
        cek: { jenis: 'nilai', a: 27, p: 2, q: 3 },
        explanation: '27^(2/3) = (∛27)² = 3² = 9.',
      },
      {
        id: 'v6',
        pernyataan: 'Cara membaca 7^(3/4) adalah …',
        options: [
          { id: 'benar', label: '7 pangkat tiga per empat' },
          { id: 'tukar', label: '7 pangkat empat per tiga' },
          { id: 'kali', label: '7 pangkat tiga kali empat' },
          { id: 'akar', label: 'akar pangkat tiga dari 7 pangkat 4' },
        ],
        correct: 'benar',
        cek: { jenis: 'bacaPangkat', a: 7, p: 3, q: 4 },
        explanation:
          '3/4 dibaca “tiga per empat”. Bentuk akarnya ∜(7³), dibaca “akar pangkat empat dari 7 pangkat 3”.',
      },
    ],
    nextLabel: 'Lanjut Menarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 8 · Menarik Kesimpulan',
    syntax: 'Discovery Learning · Sintaks 6',
    goal: 'Menyusun kesimpulan tentang unsur, cara membaca, cara menulis, dan hubungan bentuk akar dengan pangkat pecahan.',
    guru: 'Setelah kesimpulan tepat, minta murid menyalinnya ke buku catatan dengan satu contoh buatan sendiri untuk setiap kalimat, lalu membacakannya ke pasangan.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan hanya dipakai satu kali; beberapa potongan adalah pengecoh. Pratinjau di bawah pilihan menampilkan notasinya.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'g1', awal: 'Bentuk akar ⁿ√(aᵐ) memuat tanda akar, indeks n,', correct: 'c1' },
      { id: 'g2', awal: 'Bentuk ⁵√(3⁴) dibaca', correct: 'c2' },
      { id: 'g3', awal: 'Pada akar kuadrat, indeks 2', correct: 'c3' },
      { id: 'g4', awal: 'Akar pangkat n dari a, yaitu ⁿ√a, sama dengan', correct: 'c4' },
      { id: 'g5', awal: 'Secara umum, ⁿ√(aᵐ) sama dengan', correct: 'c5' },
      {
        id: 'g6',
        awal: 'Sebaliknya, a^(m/n) dibaca “a pangkat m per n” dan ditulis',
        correct: 'c6',
      },
    ],
    bank: [
      { id: 'c1', teks: 'radikan a (di bawah tanda akar), dan pangkat radikan m' },
      { id: 'c2', teks: '“akar pangkat lima dari 3 pangkat 4”' },
      { id: 'c3', teks: 'tidak ditulis, mis. √10 dibaca “akar kuadrat dari 10”' },
      { id: 'c4', teks: 'a^(1/n), mis. ∛125 = 125^(1/3) = 5' },
      {
        id: 'c5',
        teks: 'a^(m/n): pangkat radikan menjadi pembilang, indeks akar menjadi penyebut',
      },
      { id: 'c6', teks: 'ⁿ√(aᵐ) atau (ⁿ√a)ᵐ' },
      { id: 'd1', teks: 'a^(n/m): indeks akar menjadi pembilang' },
      { id: 'd2', teks: '“akar pangkat empat dari 3 pangkat 5”' },
      { id: 'd3', teks: 'ditulis besar di depan tanda akar, mis. 2√10' },
      { id: 'd4', teks: 'a : n' },
    ],
    rangkuman: [
      'Unsur bentuk akar ⁿ√(aᵐ): tanda akar √, indeks n, radikan a, pangkat radikan m. Indeks 2 dan pangkat 1 tidak ditulis.',
      'Membaca: ⁿ√(aᵐ) dibaca “akar pangkat n dari a pangkat m”, mis. ∛(5²) “akar pangkat tiga dari 5 pangkat 2”; √10 “akar kuadrat dari 10”.',
      'ⁿ√a = a^(1/n), misalnya √9 = 9^(1/2) = 3 dan ∛125 = 125^(1/3) = 5.',
      'ⁿ√(aᵐ) = (ⁿ√a)ᵐ = a^(m/n): pangkat radikan → pembilang, indeks akar → penyebut.',
      'a^(m/n) dibaca “a pangkat m per n”, mis. 7^(3/4) “7 pangkat tiga per empat” = ∜(7³).',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 9 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan cara membaca, menulis, dan mengubah bentuk akar ⇄ pangkat pecahan pada berbagai konteks.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang sering dijawab keliru untuk dibahas bersama.',
    instruksi:
      'Kerjakan soal satu per satu. Untuk soal isian, kamu boleh mencoba lagi. Desimal ditulis dengan koma, mis. 4,47.',
    nextLabel: 'Lanjut ke Refleksi →',
    soal: [
      {
        id: 's1',
        type: 'input',
        konteks: 'Ubin lantai',
        cerita:
          'Sebuah ubin lantai berbentuk persegi memiliki luas 144 dm², sehingga panjang sisinya 144^(1/2) dm.',
        pertanyaan: 'Berapa dm panjang sisi ubin tersebut?',
        jawab: 12,
        cek: { jenis: 'nilai', a: 144, p: 1, q: 2 },
        explanation: '144^(1/2) = √144 = 12, karena 12 × 12 = 144.',
        hints: [
          'Pangkat ½ sama dengan akar kuadrat.',
          'Bilangan berapa dikuadratkan hasilnya 144?',
        ],
      },
      {
        id: 's2',
        type: 'choice',
        konteks: 'Akuarium kubus',
        cerita:
          'Sebuah akuarium berbentuk kubus bervolume 27.000 cm³. Panjang rusuknya ∛27.000 cm.',
        pertanyaan: 'Bentuk pangkat pecahan dari ∛27.000 adalah …',
        options: [
          { id: 'benar', label: '27.000^(1/3)' },
          { id: 'kubik', label: '27.000³' },
          { id: 'tukar', label: '3^(1/27000)' },
          { id: 'bagi', label: '27.000 : 3' },
        ],
        correct: 'benar',
        cek: { jenis: 'pangkat', n: 3, r: 27000, m: 1 },
        explanation: '∛ berindeks 3, jadi ∛27.000 = 27.000^(1/3).',
        hints: ['Indeks akar menjadi penyebut pecahan pangkat.'],
      },
      {
        id: 's3',
        type: 'input',
        konteks: 'Akuarium kubus',
        cerita: 'Masih akuarium tadi: rusuknya 27.000^(1/3) cm.',
        pertanyaan: 'Berapa cm panjang rusuk akuarium tersebut?',
        jawab: 30,
        cek: { jenis: 'nilai', a: 27000, p: 1, q: 3 },
        explanation: '30 × 30 × 30 = 27.000, jadi ∛27.000 = 30 cm.',
        hints: ['Coba bilangan kelipatan 10.', '30 × 30 × 30 = ?'],
      },
      {
        id: 's4',
        type: 'choice',
        konteks: 'Kuis radio',
        cerita:
          'Pembawa acara kuis radio membacakan soal: “Tuliskan akar pangkat tiga dari 2 pangkat 5.”',
        pertanyaan: 'Notasi yang harus ditulis peserta adalah …',
        options: [
          { id: 'benar', label: '∛(2⁵)' },
          { id: 'tukar', label: '⁵√(2³)' },
          { id: 'koef', label: '3√(2⁵)' },
          { id: 'radikan', label: '∛(5²)' },
        ],
        correct: 'benar',
        cek: { jenis: 'tulis', n: 3, r: 2, m: 5 },
        explanation: '“akar pangkat tiga” → indeks 3; “dari 2” → radikan 2; “pangkat 5” → ∛(2⁵).',
        hints: ['Urutan bacaan: indeks → radikan → pangkat radikan.'],
      },
      {
        id: 's5',
        type: 'input',
        konteks: 'Pangkat pecahan',
        cerita: 'Rara menemukan soal tantangan: 16^(3/4).',
        pertanyaan: 'Berapakah nilai 16^(3/4)?',
        jawab: 8,
        cek: { jenis: 'nilai', a: 16, p: 3, q: 4 },
        explanation: '16^(3/4) = (∜16)³ = 2³ = 8.',
        hints: ['Kerjakan akarnya dulu: ∜16 = 2 karena 2 × 2 × 2 × 2 = 16.', 'Lalu pangkatkan 3.'],
      },
      {
        id: 's6',
        type: 'choice',
        konteks: 'Kotak kado',
        cerita: 'Sebuah kotak kado berbentuk kubus bervolume 20 dm³. Panjang rusuknya ∛20 dm.',
        pertanyaan: 'Cara membaca ∛20 yang tepat adalah …',
        options: [
          { id: 'benar', label: 'akar pangkat tiga dari 20' },
          { id: 'indeks', label: 'akar kuadrat dari 20' },
          { id: 'koef', label: 'tiga akar 20' },
          { id: 'pangkat', label: '20 pangkat tiga' },
        ],
        correct: 'benar',
        cek: { jenis: 'baca', n: 3, r: 20, m: 1 },
        explanation: '∛ berindeks 3, jadi ∛20 dibaca “akar pangkat tiga dari 20”.',
        hints: ['Angka kecil 3 pada ∛ adalah indeks.'],
      },
      {
        id: 's7',
        type: 'choice',
        konteks: 'Menulis ulang',
        cerita: 'Bu Sari menulis ⁵√(2³) di papan tulis.',
        pertanyaan: 'Bentuk pangkat pecahannya adalah …',
        options: [
          { id: 'benar', label: '2^(3/5)' },
          { id: 'tukar', label: '2^(5/3)' },
          { id: 'basis', label: '3^(2/5)' },
          { id: 'kali', label: '2¹⁵' },
        ],
        correct: 'benar',
        cek: { jenis: 'pangkat', n: 5, r: 2, m: 3 },
        explanation: 'Pangkat radikan (3) menjadi pembilang, indeks (5) menjadi penyebut: 2^(3/5).',
        hints: ['Pembilang = pangkat radikan; penyebut = indeks akar.'],
      },
      {
        id: 's8',
        type: 'input',
        konteks: 'Layar jam pintar',
        cerita:
          'Layar jam pintar berbentuk persegi seluas 20 cm², jadi sisinya 20^(1/2) = √20 cm. Hasilnya bukan bilangan bulat, sehingga bentuk akar menuliskannya dengan tepat.',
        pertanyaan:
          'Kira-kira berapa cm panjang sisi layar? Tulis sampai dua angka di belakang koma.',
        jawab: 4.47,
        toleransi: 0.006,
        cek: { jenis: 'hampiran', a: 20, p: 1, q: 2 },
        explanation:
          '√20 ≈ 4,47 karena 4,47 × 4,47 ≈ 19,98. Bentuk √20 atau 20^(1/2) menuliskannya secara tepat, sedangkan 4,47 hanya hampiran.',
        hints: [
          '4 × 4 = 16 dan 5 × 5 = 25, jadi √20 di antara 4 dan 5.',
          'Coba 4,5 × 4,5 = 20,25 (sedikit terlalu besar).',
        ],
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 10 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 10 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses menemukan dan tingkat pemahaman.',
    guru: 'Baca beberapa refleksi secara acak (tanpa menyebut nama) untuk menutup pelajaran.',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Tuliskan cara membaca ∜(3⁵) dan jelaskan bagian mana yang disebut lebih dulu.',
        placeholder: '∜(3⁵) dibaca … karena …',
      },
      {
        id: 'q2',
        teks: 'Jelaskan dengan kata-katamu sendiri mengapa ∛125 sama dengan 125^(1/3).',
        placeholder: 'Karena (125^(1/3))³ = …',
      },
      {
        id: 'q3',
        teks: 'Bagian mana yang paling membingungkan? Bagaimana kamu mengatasinya?',
        placeholder: 'Yang paling membingungkan …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu dapat membaca, menulis, dan mengubah bentuk akar ⇄ pangkat pecahan sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '😄 Sangat yakin, bisa menjelaskan ke teman' },
      { id: 'yakin', label: '🙂 Yakin' },
      { id: 'ragu', label: '😐 Masih ragu pada beberapa bagian' },
      { id: 'belum', label: '😟 Belum yakin, perlu bantuan' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 11 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat! Kamu bisa membaca dan menulis bentuk akar',
    teks: 'Rusuk kotak kado Rara kini bisa kamu tulis, baca, dan hitung: ∛125 = 125^(1/3) = 5 cm.',
    trio: [
      { notasi: '∛125', label: 'Bentuk akar' },
      { notasi: '125^(1/3)', label: 'Pangkat pecahan' },
      { notasi: '5', label: 'Nilainya' },
    ],
    capaian: [
      'Menyebutkan unsur bentuk akar: tanda akar, indeks, radikan, dan pangkat radikan.',
      'Membaca bentuk akar ⁿ√(aᵐ) dan pangkat pecahan a^(m/n) dengan bacaan baku.',
      'Menuliskan bentuk akar dari bacaannya.',
      'Mengubah bentuk akar ⁿ√(aᵐ) menjadi pangkat pecahan a^(m/n) dan sebaliknya.',
    ],
  },
};
