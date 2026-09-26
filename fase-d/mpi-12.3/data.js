'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Bentuk Akar & Pangkat Pecahan
   Fase D — SMP Kelas VIII · Topik 12 Bilangan Berpangkat dan Bentuk Akar

   Tujuan Pembelajaran:
   Mengonversi bentuk akar menjadi bentuk pangkat pecahan dan
   sebaliknya, serta menyederhanakan bentuk akar.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'akar', 'pola' & 'sederhana'
     Sintaks 4 — Data processing ............ tahap 'olah'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi   (5')  — "Petak Kebun Persegi": kebun kelas seluas
                            72 m²; kalkulator menampilkan sisi 8,4852…,
                            sedangkan papan rencana Pak Gani menulis
                            √72 = 72^(1/2) = 6√2 m. Murid MENDUGA arti
                            72^(1/2) + alasan (tidak dinilai).
     2. Masalah     (4')  — memilih rumusan masalah & menulis hipotesis.
     3. Akar        (12') — Lab Persegi & Kubus (luas → sisi √, volume →
                            rusuk ∛), isian akar bulat, lalu "Detektif
                            Eksponen": memakai sifat (aᵐ)ⁿ = aᵐˣⁿ dari
                            MPI 12.2 untuk menemukan a^(1/2) = √a dan
                            a^(1/3) = ∛a.
     4. Pola        (10') — tangga nilai 64^(1/2), 64^(1/3), 64^(1/6),
                            64^(2/3), 64^(3/2), ∛(8²) & (∛8)² → tabel
                            ringkas → menemukan ⁿ√(aᵐ) = a^(m/n).
     5. Sederhana   (12') — Ubin Faktor Kembar: faktor prima di dalam
                            akar, ketuk n faktor sama untuk keluar dari
                            akar; menulis √72 = 6√2, √48 = 4√3,
                            ∛54 = 3∛2 dengan diagnosa miskonsepsi.
     6. Olah data   (10') — pertanyaan penuntun, misi Konverter Akar ⇄
                            Pangkat, pilah 8 pernyataan tepat/keliru.
     7. Pembuktian  (8')  — membuktikan dugaan awal; 6 soal konversi dua
                            arah & menyederhanakan berpengecoh.
     8. Simpulan    (5')  — melengkapi kalimat dari bank kalimat acak.
     9. Uji terap   (10') — 8 soal kontekstual (ubin, akuarium, layar,
                            kotak kado, kebun).
    10. Refleksi    (4')  — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan. Ubin faktor
   juga ditampilkan dalam urutan acak (makeTwinTileState).

   Notasi teks: a^(p/q) untuk pangkat pecahan, √ ∛ ∜ ⁿ√ untuk akar,
   mis. '∛(5²)'. Teks dirender menjadi HTML oleh tulisAkarHTML().
   Metadata `cek` dipakai tes untuk menghitung ulang kunci dengan
   engine seksi 45 (tests/mpi-12.3-data.test.js):
     { jenis: 'pangkat',   n, r, m }  label benar = formatPangkatPecahan(r, m, n)
     { jenis: 'akar',      a, p, q }  label benar = formatAkar(1, q, a, p)
     { jenis: 'sederhana', r, n }     label benar = bentuk akar paling sederhana
     { jenis: 'nilai',     a, p, q }  label/jawab = nilai a^(p/q) (eksak)
   ============================================================ */

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1',
    goal: 'Mengamati tiga cara menuliskan panjang sisi kebun persegi dan menduga artinya.',
    guru: 'Bacakan cerita bersama. Tanyakan: “Mengapa kalkulator dan papan Pak Gani menulis jawabannya berbeda? Apakah keduanya benar?” Biarkan murid menduga tanpa dikoreksi.',
    judul: 'Petak Kebun Persegi',
    luas: 72,
    cerita:
      'Kelas VIII-B mendapat petak kebun sekolah berbentuk persegi seluas 72 m². Dina ingin memasang pagar bambu, jadi ia perlu tahu panjang sisi kebun. Ia mencari bilangan yang jika dikuadratkan hasilnya 72.',
    kalkulator: '8,4852813…',
    kalkulatorLabel: 'Layar kalkulator Dina',
    papanLabel: 'Papan rencana Pak Gani',
    papan: 'sisi = √72 = 72^(1/2) = 6√2 m',
    pertanyaan:
      'Menurut dugaanmu, apa arti tulisan 72^(1/2) (72 pangkat setengah) di papan Pak Gani?',
    opsi: [
      { id: 'akar', label: 'Sama dengan √72, yaitu bilangan yang jika dikuadratkan hasilnya 72' },
      { id: 'bagi', label: '72 dibagi 2, yaitu 36' },
      { id: 'kali', label: '72 dikalikan ½ lalu dikuadratkan' },
      { id: 'kecil', label: 'Bilangan yang sangat kecil, karena pangkatnya pecahan' },
    ],
    dugaanTepat: 'akar',
    alasanLabel: 'Mengapa kamu menduga begitu? (tulis singkat)',
    alasanPlaceholder: 'Menurutku … karena …',
    catatan:
      'Belum ada jawaban benar atau salah. Dugaanmu akan kamu buktikan sendiri, termasuk mengapa √72 boleh ditulis 6√2.',
    nextLabel: 'Lanjut ke Rumusan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: 'Discovery Learning · Sintaks 2',
    goal: 'Merumuskan pertanyaan inti yang akan diselidiki dan menuliskan hipotesis.',
    guru: 'Arahkan murid memilih pertanyaan yang mencakup HUBUNGAN akar–pangkat dan cara MENYEDERHANAKAN. Hipotesis boleh keliru; yang penting dapat diuji.',
    pengantar:
      'Papan Pak Gani memunculkan beberapa pertanyaan. Pilih pertanyaan yang paling tepat untuk kita selidiki bersama.',
    pertanyaan: 'Pertanyaan manakah yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'inti',
        label:
          'Apa hubungan bentuk akar dengan pangkat pecahan, bagaimana mengubah satu bentuk ke bentuk lainnya, dan bagaimana menyederhanakan bentuk akar seperti √72?',
      },
      { id: 'desimal', label: 'Berapa semua angka di belakang koma dari √72?' },
      { id: 'luas', label: 'Berapa luas kebun jika panjang sisinya 72 m?' },
      { id: 'bibit', label: 'Berapa banyak bibit cabai yang dapat ditanam di kebun?' },
    ],
    correct: 'inti',
    umpan: {
      inti: 'Tepat! Pertanyaan ini mencakup HUBUNGAN akar dan pangkat pecahan, cara MENGUBAH bentuknya, dan cara MENYEDERHANAKAN bentuk akar.',
      desimal:
        'Angka di belakang koma √72 tidak pernah berhenti. Yang menarik justru cara menuliskannya dengan tepat tanpa desimal.',
      luas: 'Luasnya sudah diketahui, 72 m². Yang dicari adalah cara menulis panjang sisinya.',
      bibit:
        'Pertanyaan itu menarik untuk berkebun, tetapi masalah kita adalah cara menulis √72 dan 72^(1/2).',
    },
    hipotesisLabel: 'Tulis hipotesismu: apa hubungan √72, 72^(1/2), dan 6√2?',
    hipotesisPlaceholder: 'Menurutku, √72 sama dengan 72^(1/2) karena … dan menjadi 6√2 karena …',
    nextLabel: 'Mulai Lab Persegi & Kubus →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MENGUMPULKAN DATA A: AKAR & PANGKAT SATU PER N
     ---------------------------------------------------------- */
  akar: {
    kicker: 'Tahap 3 · Mengumpulkan Data (A)',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Mengumpulkan data sisi persegi dan rusuk kubus, lalu menemukan arti pangkat ½ dan ⅓.',
    guru: 'Minta pasangan bergantian menggeser. Tanyakan: “Luas berapa saja yang sisinya bilangan bulat?” Pada Detektif Eksponen, ingatkan sifat pangkat dari pangkat dari MPI 12.2.',
    instruksi:
      'Geser luas persegi dan volume kubus. Coba minimal 4 luas pada persegi dan 3 volume pada kubus. Perhatikan kapan sisi atau rusuknya berupa bilangan bulat.',
    jejakMin: { persegi: 4, kubus: 3 },
    belumCukup: 'Coba lebih banyak nilai pada persegi dan kubus dulu untuk mengumpulkan data.',
    instruksiLangkah:
      'Catat hasil pengamatanmu. Tanda √ (akar kuadrat) mencari SISI persegi dari luasnya; tanda ∛ (akar pangkat tiga) mencari RUSUK kubus dari volumenya.',
    langkah: [
      {
        id: 'a1',
        r: 49,
        n: 2,
        jawab: 7,
        label: 'Persegi dengan luas 49 satuan². Panjang sisinya √49 = …',
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
        label: 'Kubus dengan volume 125 satuan³. Panjang rusuknya ∛125 = …',
        hints: ['Coba 5 × 5 × 5.'],
        temuan: '∛125 = 5 karena 5³ = 125.',
      },
    ],
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
        tanya: 'Dengan cara yang sama, (8ˣ)³ = 8¹. Nilai x dan artinya adalah …',
        opsi: [
          { id: 'sepertiga', label: 'x = 1/3, jadi 8^(1/3) = ∛8 = 2' },
          { id: 'tiga', label: 'x = 3, jadi 8³ = 512' },
          { id: 'bagi', label: 'x = 1/3, jadi 8^(1/3) = 8 : 3' },
          { id: 'akar2', label: 'x = 1/3, jadi 8^(1/3) = √8' },
        ],
        correct: 'sepertiga',
        umpan: {
          sepertiga: 'Tepat! (8^(1/3))³ = 8¹ dan (∛8)³ = 2 × 2 × 2 = 8. Jadi 8^(1/3) = ∛8 = 2.',
          tiga: '(8³)³ = 8⁹, bukan 8¹. Kita butuh x × 3 = 1.',
          bagi: 'x = 1/3 sudah benar, tetapi pangkat ⅓ bukan membagi tiga. Cari bilangan yang dipangkatkan 3 hasilnya 8.',
          akar2:
            'x = 1/3 sudah benar, tetapi pangkat ⅓ berpasangan dengan akar pangkat TIGA (∛), bukan akar kuadrat.',
        },
      },
    ],
    temuan:
      'Temuan: a^(1/2) = √a dan a^(1/3) = ∛a. Penyebut pecahan pangkat menunjukkan jenis akarnya!',
    nextLabel: 'Lanjut ke Tangga Pangkat Pecahan →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MENGUMPULKAN DATA B: POLA PANGKAT m/n
     ---------------------------------------------------------- */
  pola: {
    kicker: 'Tahap 4 · Mengumpulkan Data (B)',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Menghitung nilai pangkat pecahan dari 64 dan menemukan hubungan a^(m/n) dengan bentuk akar.',
    guru: 'Beri waktu murid mencoba 64^(2/3) sendiri. Pancing dengan: “Pangkat 2/3 = 1/3 × 2. Mana yang dikerjakan dulu?” Tekankan bahwa ∛(8²) dan (∛8)² hasilnya sama.',
    cerita:
      'Pak Gani membawa 64 ubin kecil. 64 bisa disusun menjadi persegi 8 × 8, kubus 4 × 4 × 4, bahkan 2 × 2 × 2 × 2 × 2 × 2. Mari hitung nilai pangkat pecahan dari 64!',
    instruksi:
      'Hitung setiap nilai. Ingat temuanmu: penyebut pangkat menunjukkan jenis akar, dan pembilang menunjukkan pangkat biasa.',
    langkah: [
      {
        id: 'p1',
        cek: { a: 64, p: 1, q: 2 },
        jawab: 8,
        label: '64^(1/2) = √64 = …',
        hints: ['Persegi 8 × 8 berisi 64 ubin.'],
        temuan: '64^(1/2) = √64 = 8.',
      },
      {
        id: 'p2',
        cek: { a: 64, p: 1, q: 3 },
        jawab: 4,
        label: '64^(1/3) = ∛64 = …',
        hints: ['Kubus 4 × 4 × 4 berisi 64 ubin.'],
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
        id: 't1',
        tanya: 'Dari tabel, a^(m/n) dapat ditulis dalam bentuk akar sebagai …',
        opsi: [
          {
            id: 'benar',
            label: 'ⁿ√(aᵐ) — pembilang m menjadi pangkat, penyebut n menjadi indeks akar',
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
    ],
    nextLabel: 'Lanjut ke Ubin Faktor Kembar →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGUMPULKAN DATA C: MENYEDERHANAKAN BENTUK AKAR
     ---------------------------------------------------------- */
  sederhana: {
    kicker: 'Tahap 5 · Mengumpulkan Data (C)',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Menemukan cara menyederhanakan bentuk akar dengan mengelompokkan faktor prima yang kembar.',
    guru: 'Tunjukkan dulu bahwa √(2 × 2) = √4 = 2: sepasang faktor kembar “keluar” dari akar sebagai satu faktor. Untuk ∛, butuh TIGA faktor kembar. Minta murid menjelaskan ke pasangannya sebelum mengisi.',
    cerita:
      'Kembali ke kebun: √72 m. Pak Gani menulis 72 sebagai perkalian faktor prima: 72 = 2 × 2 × 2 × 3 × 3. Ubin-ubin faktor itu ada di dalam tanda akar.',
    aturan:
      'Aturan main: di dalam √, ketuk DUA ubin yang sama → keduanya keluar sebagai satu ubin, karena √(2 × 2) = 2. Di dalam ∛, butuh TIGA ubin yang sama, karena ∛(3 × 3 × 3) = 3.',
    umpanUbin: {
      beda: 'Ubin yang dikelompokkan harus bernilai SAMA (kembar).',
      kelompok: 'Satu kelompok kembar keluar dari akar!',
    },
    ubin: [
      {
        id: 'u1',
        r: 72,
        n: 2,
        label: 'Sederhanakan √72 (sisi kebun)',
        hints: [
          'Di luar akar ada 2 dan 3. Kalikan keduanya.',
          'Di dalam akar tersisa satu ubin 2.',
          '√72 = (2 × 3)√2.',
        ],
        temuan:
          '√72 = √(36 × 2) = √36 × √2 = 6√2. Itulah tulisan Pak Gani! 36 adalah faktor kuadrat TERBESAR dari 72.',
      },
      {
        id: 'u2',
        r: 48,
        n: 2,
        label: 'Sederhanakan √48',
        hints: [
          '48 = 2 × 2 × 2 × 2 × 3. Ada dua pasang ubin 2.',
          'Di luar akar: 2 × 2 = 4.',
          'Di dalam akar tersisa 3.',
        ],
        temuan: '√48 = √(16 × 3) = 4√3.',
      },
      {
        id: 'u3',
        r: 54,
        n: 3,
        label: 'Sederhanakan ∛54',
        hints: [
          '54 = 2 × 3 × 3 × 3. Untuk ∛ butuh tiga ubin kembar.',
          'Tiga ubin 3 keluar sebagai satu ubin 3.',
          'Di dalam akar tersisa 2.',
        ],
        temuan: '∛54 = ∛(27 × 2) = 3∛2. Untuk ∛, cari faktor KUBIK terbesar (27 = 3³).',
      },
    ],
    tanya: [
      {
        id: 's1',
        tanya: 'Pada √72 = √(36 × 2) = 6√2, bilangan 36 adalah …',
        opsi: [
          { id: 'benar', label: 'faktor bilangan kuadrat terbesar dari 72' },
          { id: 'terbesar', label: 'faktor terbesar dari 72' },
          { id: 'setengah', label: 'setengah dari 72' },
          { id: 'sisa', label: 'sisa dari 72 dikurangi 36' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! 36 = 6² adalah faktor kuadrat terbesar, jadi √36 = 6 dapat keluar dari akar.',
          terbesar:
            'Faktor terbesar 72 (selain 72) adalah 36, tetapi yang penting 36 adalah bilangan KUADRAT (6²).',
          setengah:
            'Kebetulan 36 = 72 : 2, tetapi yang penting 36 adalah bilangan kuadrat. Pada √48, faktornya 16, bukan 24.',
          sisa: 'Bentuk akar disederhanakan dengan PERKALIAN faktor, bukan pengurangan.',
        },
      },
      {
        id: 's2',
        tanya: 'Rudi menulis √72 = 2√18. Mengapa jawaban itu belum paling sederhana?',
        opsi: [
          {
            id: 'benar',
            label: '18 masih memuat faktor kuadrat 9, sehingga √18 = 3√2 dan 2√18 = 6√2',
          },
          { id: 'salah', label: 'Karena 2√18 tidak sama nilainya dengan √72' },
          { id: 'genap', label: 'Karena bilangan di dalam akar harus ganjil' },
          { id: 'kecil', label: 'Karena bilangan di luar akar harus lebih besar dari 5' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! Nilainya sama, tetapi masih bisa disederhanakan. Gunakan faktor kuadrat TERBESAR agar sekali jalan.',
          salah:
            '2√18 = √(4 × 18) = √72, jadi nilainya SAMA. Masalahnya, 18 masih memuat faktor kuadrat.',
          genap:
            '√2 sudah paling sederhana walau 2 genap. Yang diperiksa adalah faktor kuadrat, bukan genap/ganjil.',
          kecil:
            'Tidak ada aturan seperti itu. Yang diperiksa adalah faktor kuadrat di dalam akar.',
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
    goal: 'Mengolah temuan menjadi aturan konversi akar ⇄ pangkat pecahan dan aturan menyederhanakan.',
    guru: 'Saat misi konverter, minta murid menyebutkan dulu nilai a, m, dan n sebelum menekan tombol. Diskusikan pernyataan pilah yang paling banyak dijawab keliru.',
    pengantar:
      'Gunakan data dari Lab, Tangga Pangkat 64, dan Ubin Faktor Kembar untuk menjawab pertanyaan penuntun berikut.',
    konsep: [
      {
        id: 'k1',
        tanya: 'Bentuk pangkat pecahan dari ⁵√(3²) adalah …',
        opsi: [
          { id: 'benar', label: '3^(2/5)' },
          { id: 'tukar', label: '3^(5/2)' },
          { id: 'basis', label: '2^(3/5)' },
          { id: 'kurang', label: '3^(2−5)' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! Pangkat di dalam akar (2) menjadi pembilang, indeks akar (5) menjadi penyebut.',
          tukar: 'Terbalik. Indeks akar 5 menjadi PENYEBUT, pangkat 2 menjadi pembilang.',
          basis: 'Basisnya tetap bilangan di dalam akar, yaitu 3.',
          kurang: 'Tidak ada pengurangan. Indeks akar menjadi penyebut pecahan pangkat.',
        },
      },
      {
        id: 'k2',
        tanya: 'Bentuk akar dari 7^(3/4) adalah …',
        opsi: [
          { id: 'benar', label: '∜(7³)' },
          { id: 'tukar', label: '∛(7⁴)' },
          { id: 'koef', label: '4√(7³)' },
          { id: 'bagi', label: '7³ : 4' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! Penyebut 4 menjadi indeks akar, pembilang 3 menjadi pangkat 7.',
          tukar:
            'Terbalik. Penyebut (4) menjadi indeks akar, pembilang (3) menjadi pangkat di dalam akar.',
          koef: 'Angka 4 ditulis kecil di KIRI ATAS tanda akar (indeks), bukan besar di depan akar sebagai pengali.',
          bagi: 'Penyebut pecahan pangkat bukan pembagi, melainkan indeks akar.',
        },
      },
      {
        id: 'k3',
        tanya: 'Bentuk akar dikatakan PALING SEDERHANA bila …',
        opsi: [
          {
            id: 'benar',
            label:
              'bilangan di dalam akar tidak lagi memuat faktor bilangan kuadrat (untuk ∛: kubik) selain 1',
          },
          {
            id: 'kecil',
            label: 'bilangan di dalam akar sekecil mungkin, walaupun nilainya berubah',
          },
          { id: 'prima', label: 'bilangan di luar akar adalah bilangan prima' },
          { id: 'hilang', label: 'tanda akarnya hilang' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! Misalnya 6√2 sudah paling sederhana karena 2 tidak memuat faktor kuadrat selain 1.',
          kecil: 'Nilainya tidak boleh berubah! Menyederhanakan hanya mengubah cara menulis.',
          prima:
            '6√2 sudah paling sederhana walau 6 bukan prima. Yang diperiksa adalah bilangan DI DALAM akar.',
          hilang: '√2 tidak dapat dihilangkan tanda akarnya, tetapi sudah paling sederhana.',
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
        temuan: '∛(5²) = 5^(2/3).',
      },
      {
        id: 'm2',
        teks: 'Tampilkan 2^(3/4). Apa bentuk akarnya?',
        target: { a: 2, m: 3, n: 4 },
        temuan: '2^(3/4) = ∜(2³).',
      },
      {
        id: 'm3',
        teks: 'Tampilkan 10^(1/2). Apa bentuk akarnya?',
        target: { a: 10, m: 1, n: 2 },
        temuan: '10^(1/2) = √10. Indeks 2 biasanya tidak ditulis.',
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
        explanation: 'Pangkat 2 menjadi pembilang, indeks 3 menjadi penyebut.',
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
        teks: '√50 = 5√2',
        cek: { jenis: 'sederhana', r: 50, n: 2, luar: 5, dalam: 2 },
        correct: 'tepat',
        explanation: '√50 = √(25 × 2) = 5√2.',
      },
      {
        id: 'q6',
        teks: '√12 = 4√3',
        cek: { jenis: 'sederhana', r: 12, n: 2, luar: 4, dalam: 3 },
        correct: 'keliru',
        explanation: 'Faktor 4 harus diakarkan dulu: √12 = √(4 × 3) = 2√3.',
      },
      {
        id: 'q7',
        teks: '∛16 = 2∛2',
        cek: { jenis: 'sederhana', r: 16, n: 3, luar: 2, dalam: 2 },
        correct: 'tepat',
        explanation: '∛16 = ∛(8 × 2) = 2∛2, karena 8 = 2³.',
      },
      {
        id: 'q8',
        teks: '√32 = 2√8',
        cek: { jenis: 'sederhana', r: 32, n: 2, luar: 2, dalam: 8 },
        correct: 'keliru',
        explanation:
          'Nilainya sama, tetapi belum paling sederhana: 8 masih memuat faktor kuadrat 4. √32 = √(16 × 2) = 4√2.',
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
    goal: 'Membuktikan dugaan awal dan menguji temuan pada soal konversi dan penyederhanaan.',
    guru: 'Minta murid memeriksa 6√2 dengan kalkulator: 6 × 1,4142… = 8,485… sama dengan layar kalkulator Dina. Bahas pengecoh yang paling banyak dipilih.',
    prediksiLabel: 'Dugaan awalmu',
    hipotesisLabel: 'Hipotesismu',
    kesimpulanDugaan: {
      akar: 'Dugaanmu terbukti! 72^(1/2) = √72, bilangan yang jika dikuadratkan hasilnya 72. Lalu √72 = √(36 × 2) = 6√2. Cek kalkulator: 6 × 1,4142… = 8,485…, sama dengan layar Dina.',
      bagi: 'Dugaanmu belum tepat: 72 : 2 = 36, padahal 36 × 36 = 1.296, bukan 72. 72^(1/2) = √72 = 6√2 ≈ 8,485.',
      kali: 'Dugaanmu belum tepat: pangkat ½ bukan mengalikan dengan ½. 72^(1/2) = √72 = 6√2 ≈ 8,485.',
      kecil:
        'Dugaanmu belum tepat: 72^(1/2) = √72 ≈ 8,485, tidak kecil. Pangkat pecahan berarti bentuk akar.',
    },
    instruksiSoal:
      'Uji temuanmu. Setiap soal hanya bisa dijawab sekali, jadi periksa dengan teliti sebelum memilih.',
    soal: [
      {
        id: 'v1',
        pernyataan: 'Bentuk pangkat pecahan dari √72 adalah …',
        options: [
          { id: 'benar', label: '72^(1/2)' },
          { id: 'kuadrat', label: '72²' },
          { id: 'tukar', label: '2^(1/72)' },
          { id: 'bagi', label: '72 : 2' },
        ],
        correct: 'benar',
        cek: { jenis: 'pangkat', n: 2, r: 72, m: 1 },
        explanation: '√72 berindeks 2 (tidak ditulis) dan pangkat di dalamnya 1: 72^(1/2).',
      },
      {
        id: 'v2',
        pernyataan: 'Bentuk akar dari 10^(2/3) adalah …',
        options: [
          { id: 'benar', label: '∛(10²)' },
          { id: 'tukar', label: '√(10³)' },
          { id: 'koef', label: '3√(10²)' },
          { id: 'bagi', label: '10² : 3' },
        ],
        correct: 'benar',
        cek: { jenis: 'akar', a: 10, p: 2, q: 3 },
        explanation: 'Penyebut 3 menjadi indeks akar, pembilang 2 menjadi pangkat: ∛(10²).',
      },
      {
        id: 'v3',
        pernyataan: 'Bentuk paling sederhana dari √72 adalah …',
        options: [
          { id: 'benar', label: '6√2' },
          { id: 'belum', label: '2√18' },
          { id: 'lupa', label: '36√2' },
          { id: 'belum2', label: '3√8' },
        ],
        correct: 'benar',
        cek: { jenis: 'sederhana', r: 72, n: 2 },
        explanation: '72 = 36 × 2 dengan 36 faktor kuadrat terbesar, jadi √72 = 6√2.',
      },
      {
        id: 'v4',
        pernyataan: 'Bentuk paling sederhana dari √45 adalah …',
        options: [
          { id: 'benar', label: '3√5' },
          { id: 'tukar', label: '5√3' },
          { id: 'lupa', label: '9√5' },
          { id: 'hilang', label: '15' },
        ],
        correct: 'benar',
        cek: { jenis: 'sederhana', r: 45, n: 2 },
        explanation: '√45 = √(9 × 5) = 3√5.',
      },
      {
        id: 'v5',
        pernyataan: 'Bentuk paling sederhana dari ∛54 adalah …',
        options: [
          { id: 'benar', label: '3∛2' },
          { id: 'lupa', label: '27∛2' },
          { id: 'indeks', label: '3√2' },
          { id: 'tukar', label: '2∛3' },
        ],
        correct: 'benar',
        cek: { jenis: 'sederhana', r: 54, n: 3 },
        explanation: '∛54 = ∛(27 × 2) = 3∛2. Indeks akarnya tetap 3.',
      },
      {
        id: 'v6',
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
    ],
    nextLabel: 'Lanjut Menarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 8 · Menarik Kesimpulan',
    syntax: 'Discovery Learning · Sintaks 6',
    goal: 'Menyusun kesimpulan tentang konversi bentuk akar ⇄ pangkat pecahan dan cara menyederhanakan bentuk akar.',
    guru: 'Setelah kesimpulan tepat, minta murid menyalinnya ke buku catatan dengan satu contoh buatan sendiri untuk setiap kalimat.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan hanya dipakai satu kali; beberapa potongan adalah pengecoh. Pratinjau di bawah pilihan menampilkan notasinya.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'g1', awal: 'Akar pangkat n dari a, yaitu ⁿ√a, dapat ditulis', correct: 'c1' },
      { id: 'g2', awal: 'Secara umum, ⁿ√(aᵐ) sama dengan', correct: 'c2' },
      { id: 'g3', awal: 'Sebaliknya, a^(m/n) dapat ditulis sebagai', correct: 'c3' },
      { id: 'g4', awal: 'Untuk menyederhanakan √b, tulis b sebagai', correct: 'c4' },
      { id: 'g5', awal: 'Lalu keluarkan akar faktor kuadratnya:', correct: 'c5' },
      {
        id: 'g6',
        awal: 'Bentuk akar sudah paling sederhana bila bilangan di dalam akar',
        correct: 'c6',
      },
    ],
    bank: [
      { id: 'c1', teks: 'a^(1/n), yaitu a pangkat 1/n' },
      {
        id: 'c2',
        teks: 'a^(m/n): pangkat di dalam akar menjadi pembilang, indeks akar menjadi penyebut',
      },
      { id: 'c3', teks: 'ⁿ√(aᵐ) atau (ⁿ√a)ᵐ' },
      {
        id: 'c4',
        teks: 'perkalian faktor bilangan kuadrat TERBESAR dan faktor lain, mis. √72 = √(36 × 2)',
      },
      { id: 'c5', teks: '√(a² × b) = a√b, sehingga √72 = 6√2' },
      { id: 'c6', teks: 'tidak lagi memuat faktor bilangan kuadrat (untuk ∛: kubik) selain 1' },
      { id: 'd1', teks: 'a^(n/m): indeks akar menjadi pembilang' },
      { id: 'd2', teks: 'a : n' },
      { id: 'd3', teks: '√(a² × b) = a²√b, sehingga √72 = 36√2' },
      { id: 'd4', teks: 'sekecil mungkin walaupun nilainya berubah' },
    ],
    rangkuman: [
      'ⁿ√a = a^(1/n), misalnya √9 = 9^(1/2) = 3 dan ∛8 = 8^(1/3) = 2.',
      'ⁿ√(aᵐ) = (ⁿ√a)ᵐ = a^(m/n): pangkat di dalam akar → pembilang, indeks akar → penyebut.',
      'Contoh: ∛(5²) = 5^(2/3) dan 7^(3/4) = ∜(7³).',
      'Menyederhanakan: √72 = √(36 × 2) = √36 × √2 = 6√2; ∛54 = ∛(27 × 2) = 3∛2.',
      'Bentuk paling sederhana: bilangan di dalam akar tidak memuat faktor kuadrat (∛: kubik) selain 1.',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 9 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan konversi bentuk akar ⇄ pangkat pecahan dan penyederhanaan bentuk akar pada berbagai konteks.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang sering dijawab keliru untuk dibahas bersama.',
    instruksi:
      'Kerjakan soal satu per satu. Untuk soal isian, kamu boleh mencoba lagi. Desimal ditulis dengan koma, mis. 8,48.',
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
        konteks: 'Layar persegi',
        cerita:
          'Layar sebuah jam pintar berbentuk persegi dengan luas 50 cm². Panjang sisinya √50 cm.',
        pertanyaan: 'Bentuk paling sederhana dari √50 adalah …',
        options: [
          { id: 'benar', label: '5√2' },
          { id: 'tukar', label: '2√5' },
          { id: 'lupa', label: '25√2' },
          { id: 'salah', label: '10√5' },
        ],
        correct: 'benar',
        cek: { jenis: 'sederhana', r: 50, n: 2 },
        explanation: '√50 = √(25 × 2) = 5√2.',
        hints: ['Cari faktor kuadrat terbesar dari 50.'],
      },
      {
        id: 's5',
        type: 'input',
        konteks: 'Pangkat pecahan',
        cerita: 'Dina menemukan soal tantangan: 16^(3/4).',
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
        cerita: 'Sebuah kotak kado berbentuk kubus bervolume 16 dm³. Panjang rusuknya ∛16 dm.',
        pertanyaan: 'Bentuk paling sederhana dari ∛16 adalah …',
        options: [
          { id: 'benar', label: '2∛2' },
          { id: 'lupa', label: '8∛2' },
          { id: 'indeks', label: '2√2' },
          { id: 'kuadrat', label: '4∛1' },
        ],
        correct: 'benar',
        cek: { jenis: 'sederhana', r: 16, n: 3 },
        explanation: '∛16 = ∛(8 × 2) = 2∛2, karena 8 = 2³.',
        hints: ['Untuk ∛, cari faktor KUBIK terbesar (1, 8, 27, …).'],
      },
      {
        id: 's7',
        type: 'choice',
        konteks: 'Menulis ulang',
        cerita: 'Pak Gani menulis ⁵√(2³) di papan tulis.',
        pertanyaan: 'Bentuk pangkat pecahannya adalah …',
        options: [
          { id: 'benar', label: '2^(3/5)' },
          { id: 'tukar', label: '2^(5/3)' },
          { id: 'basis', label: '3^(2/5)' },
          { id: 'kali', label: '2¹⁵' },
        ],
        correct: 'benar',
        cek: { jenis: 'pangkat', n: 5, r: 2, m: 3 },
        explanation:
          'Pangkat di dalam akar (3) menjadi pembilang, indeks (5) menjadi penyebut: 2^(3/5).',
        hints: ['Pembilang = pangkat di dalam akar; penyebut = indeks akar.'],
      },
      {
        id: 's8',
        type: 'input',
        konteks: 'Pagar kebun',
        cerita: 'Sisi kebun kelas VIII-B adalah 6√2 m. Gunakan √2 ≈ 1,414.',
        pertanyaan: 'Kira-kira berapa meter panjang sisi kebun? (tulis dengan koma)',
        jawab: 8.484,
        toleransi: 0.005,
        cek: { jenis: 'hampiran', r: 72, akarDalam: 1.414 },
        explanation: '6√2 ≈ 6 × 1,414 = 8,484 m, sama dengan layar kalkulator Dina (8,485…).',
        hints: ['6√2 artinya 6 × √2.', '6 × 1,414 = ?'],
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
        teks: 'Jelaskan dengan kata-katamu sendiri cara mengubah ∛(5²) menjadi pangkat pecahan.',
        placeholder: 'Pertama aku melihat … lalu …',
      },
      {
        id: 'q2',
        teks: 'Mengapa √72 boleh ditulis 6√2? Ceritakan dengan ubin faktor kembar.',
        placeholder: '72 = 2 × 2 × 2 × 3 × 3, lalu …',
      },
      {
        id: 'q3',
        teks: 'Bagian mana yang paling membingungkan? Bagaimana kamu mengatasinya?',
        placeholder: 'Yang paling membingungkan …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat mengonversi dan menyederhanakan bentuk akar sekarang?',
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
    judul: 'Hebat! Kamu menemukan rahasia bentuk akar',
    teks: 'Sisi kebun VIII-B kini bisa kamu tulis dengan tiga cara yang sama nilainya: √72 = 72^(1/2) = 6√2 m.',
    capaian: [
      'Mengubah bentuk akar ⁿ√(aᵐ) menjadi pangkat pecahan a^(m/n).',
      'Mengubah pangkat pecahan a^(m/n) menjadi bentuk akar dan menghitung nilainya.',
      'Menyederhanakan bentuk akar dengan faktor kuadrat/kubik terbesar.',
      'Mengenali miskonsepsi: pembilang–penyebut tertukar dan faktor yang lupa diakarkan.',
    ],
  },
};
