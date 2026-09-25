'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membaca & Menulis Bilangan Berpangkat
   Fase D — SMP Kelas VIII · Topik 12 Bilangan Berpangkat dan Bentuk Akar

   Tujuan Pembelajaran:
   Membaca dan menulis bilangan berpangkat bulat positif, negatif,
   dan nol beserta unsur-unsurnya (basis dan pangkat).

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'lipat' & 'pola'
     Sintaks 4 — Data processing ............ tahap 'olah'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi   (7')  — "Kertas Lipat Ajaib": catatan Bima menulis
                            banyak lapisan kertas setelah 10 lipatan
                            sebagai 2 × 2 × … × 2 (10 faktor). Terlalu
                            panjang! Murid MENDUGA cara menulis singkatnya
                            + alasan (tidak dinilai).
     2. Masalah     (5')  — memilih rumusan masalah & menulis hipotesis.
     3. Lipat       (15') — simulator lipat kertas: mencatat perkalian
                            berulang & banyak lapisan; mengenal notasi
                            2³ (basis & pangkat) lalu menulis perkalian
                            berulang lain dengan "penulis pangkat".
     4. Pola        (12') — tangga pangkat 10 dan 2 dari pangkat 3 turun
                            ke −2 (tiap turun ÷ basis) + memotong kertas
                            jadi setengah: menemukan 10⁰, 10⁻¹, 2⁻¹, …
                            lalu MENGETIK cara baca pangkat nol & negatif.
     5. Olah data   (12') — pertanyaan penuntun (basis, pangkat, kurung,
                            cara baca), ketuk basis/pangkat pada 6
                            ekspresi, pilah 8 cara baca: tepat/keliru.
     6. Pembuktian  (12') — membuktikan dugaan awal; menulis 4 kalimat
                            bacaan dalam notasi, membaca 3 notasi, lalu
                            menanggapi 4 miskonsepsi.
     7. Simpulan    (5')  — menyusun kesimpulan dari bank kalimat acak.
     8. Uji terap   (10') — 8 soal kontekstual (astronomi, virus,
                            memori komputer, bakteri, …).
     9. Refleksi    (2')  — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan.

   Konvensi bilangan berpangkat: { a, n, negLuar } — a basis (bulat),
   n pangkat (bulat), negLuar true untuk −aⁿ (tanda di luar pangkat).
   Metadata `cek` pada soal pilihan/isian dipakai tes untuk menghitung
   ulang kunci dengan engine (tests/mpi-12.1-data.test.js):
     { jenis: 'baca',    a, n, negLuar }  label opsi benar = bacaPangkat()
     { jenis: 'tulis',   a, n, negLuar }  label opsi benar = ekspresiPangkat()
     { jenis: 'basis' | 'pangkat', a, n } jawab isian = basis / pangkat
   ============================================================ */

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1',
    goal: 'Mengamati masalah menulis perkalian berulang yang sangat panjang dan menduga cara menyingkatnya.',
    guru: 'Bacakan cerita bersama. Bila memungkinkan, peragakan melipat selembar kertas HVS 3–4 kali. Biarkan murid menduga tanpa dikoreksi; tanyakan "Mengapa kamu memilih itu?" untuk memancing alasan.',
    judul: 'Kertas Lipat Ajaib',
    cerita:
      'Bima melipat selembar kertas menjadi dua, lalu dilipat dua lagi, dan seterusnya. Setiap kali dilipat, banyak lapisan kertasnya menjadi dua kali lipat. Setelah 10 kali melipat (secara khayalan), Bima menulis catatan di bawah ini.',
    catatanBima: '2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = 1.024 lapis',
    keluhan:
      '“Tulisannya panjang sekali! Kalau 30 kali lipatan, aku harus menulis angka 2 sebanyak 30 kali…”',
    pertanyaan:
      'Menurut dugaanmu, bagaimana cara matematikawan menulis 2 × 2 × … × 2 (10 faktor) dengan lebih singkat?',
    opsi: [
      { id: 'pangkat', label: '2¹⁰ — angka 2, dengan angka kecil 10 di kanan atas' },
      { id: 'kali', label: '2 × 10' },
      { id: 'rangkai', label: '210 — angka 2 dan 10 ditulis berdampingan' },
      { id: 'balik', label: '10² — angka 10, dengan angka kecil 2 di kanan atas' },
    ],
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
    guru: 'Arahkan murid memilih pertanyaan yang bisa diselidiki (bukan sekadar menghitung). Hipotesis boleh keliru; yang penting dapat diuji.',
    pengantar:
      'Catatan Bima memunculkan beberapa pertanyaan. Pilih pertanyaan yang paling tepat untuk kita selidiki bersama.',
    pertanyaan: 'Pertanyaan manakah yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'inti',
        label:
          'Bagaimana menulis dan membaca perkalian berulang secara singkat, apa saja unsur-unsurnya, dan bagaimana bila pangkatnya nol atau negatif?',
      },
      { id: 'hasil', label: 'Berapakah hasil dari 2 × 10?' },
      { id: 'kertas', label: 'Berapa lembar kertas yang dibutuhkan Bima?' },
      { id: 'rapi', label: 'Bagaimana cara melipat kertas supaya rapi?' },
    ],
    correct: 'inti',
    umpan: {
      inti: 'Tepat! Pertanyaan ini mencakup cara MENULIS, cara MEMBACA, UNSUR-UNSUR (basis & pangkat), serta pangkat nol dan negatif.',
      hasil:
        'Catatan Bima bukan 2 × 10. Coba lihat lagi: angka 2 dikalikan dengan 2 berulang kali, bukan dengan 10.',
      kertas:
        'Bima hanya memakai selembar kertas. Yang menjadi masalah adalah cara menuliskan banyak lapisannya secara singkat.',
      rapi: 'Kerapian lipatan menarik, tetapi masalah kita adalah cara menulis dan membaca perkalian berulang yang panjang.',
    },
    hipotesisLabel: 'Tulis hipotesismu: bagaimana cara menulis dan membacanya?',
    hipotesisPlaceholder: 'Menurutku, 2 × 2 × … × 2 (10 faktor) ditulis … dan dibaca …',
    nextLabel: 'Mulai Percobaan Lipat Kertas →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MENGUMPULKAN DATA A: LIPAT KERTAS
     ---------------------------------------------------------- */
  lipat: {
    kicker: 'Tahap 3 · Mengumpulkan Data (A)',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Mencatat perkalian berulang dari percobaan lipat kertas, lalu menuliskannya dalam bentuk pangkat.',
    guru: 'Minta pasangan bergantian menekan tombol Lipat dan membacakan catatan tabel. Tekankan bahwa angka kecil di kanan atas menyatakan BANYAK FAKTOR, bukan pengali.',
    instruksi:
      'Tekan “Lipat dua” berkali-kali (minimal sampai 5 lipatan). Perhatikan garis lipatan saat kertas dibuka dan catatan pada tabel.',
    maxLipat: 6,
    minLipat: 5,
    belumCukup: 'Lipat kertas sampai minimal 5 lipatan dulu untuk mengumpulkan data.',
    notasiJudul: 'Cara singkat matematikawan',
    notasiTeks:
      'Perkalian berulang 2 × 2 × 2 (3 faktor) ditulis singkat <strong>2³</strong>. Angka yang dikalikan berulang ditulis besar dan disebut <strong>basis</strong>. Banyak faktornya ditulis kecil di kanan atas dan disebut <strong>pangkat</strong> (eksponen). 2³ dibaca <strong>“dua pangkat tiga”</strong>.',
    contoh: { a: 2, n: 3 },
    instruksiTulis:
      'Sekarang giliranmu. Tulis setiap perkalian berulang dalam bentuk pangkat: isi kotak BASIS (besar) dan kotak PANGKAT (kecil).',
    langkah: [
      {
        id: 'w1',
        jenis: 'tulis',
        a: 2,
        n: 5,
        label: 'Banyak lapisan setelah 5 lipatan: 2 × 2 × 2 × 2 × 2',
        hints: [
          'Bilangan apa yang dikalikan berulang? Itulah basisnya.',
          'Hitung ada berapa angka 2 yang dikalikan. Itulah pangkatnya.',
          'Basis 2, pangkat 5.',
        ],
        temuan: 'Lima faktor 2 → pangkatnya 5.',
      },
      {
        id: 'w2',
        jenis: 'tulis',
        a: 2,
        n: 10,
        label: 'Catatan Bima (10 lipatan): 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2',
        hints: [
          'Basisnya tetap 2.',
          'Hitung faktornya dengan menunjuk satu per satu.',
          'Basis 2, pangkat 10.',
        ],
        temuan: 'Catatan panjang Bima cukup ditulis 2¹⁰ — jauh lebih singkat!',
      },
      {
        id: 'w3',
        jenis: 'tulis',
        a: 3,
        n: 4,
        label: 'Kertas dilipat tiga sebanyak 4 kali: 3 × 3 × 3 × 3',
        hints: [
          'Basisnya bukan selalu 2. Bilangan apa yang dikalikan berulang di sini?',
          'Ada berapa faktor 3?',
          'Basis 3, pangkat 4.',
        ],
        temuan: 'Basis adalah bilangan yang dikalikan, pangkat adalah banyak faktornya.',
      },
      {
        id: 'w4',
        jenis: 'tulis',
        a: -2,
        n: 3,
        label: 'Perkalian bilangan negatif: (−2) × (−2) × (−2)',
        hints: [
          'Yang dikalikan berulang adalah −2, jadi basisnya juga −2 (tulis tanda − di kotak basis).',
          'Ada 3 faktor.',
          'Basis −2, pangkat 3. Hasil tulisannya (−2)³.',
        ],
        temuan: 'Basis negatif ditulis di dalam kurung: (−2)³, dibaca “negatif dua pangkat tiga”.',
      },
    ],
    tanya: [
      {
        id: 'l1',
        tanya: 'Pada 2⁵, angka 2 (angka besar) menyatakan …',
        opsi: [
          { id: 'basis', label: 'bilangan yang dikalikan berulang (basis)' },
          { id: 'faktor', label: 'banyak faktor yang dikalikan' },
          { id: 'hasil', label: 'hasil perkaliannya' },
          { id: 'tambah', label: 'bilangan yang ditambahkan berulang' },
        ],
        correct: 'basis',
        umpan: {
          basis: 'Tepat! Angka besar adalah BASIS, yaitu bilangan yang dikalikan berulang.',
          faktor: 'Banyak faktor ditunjukkan oleh angka kecil di kanan atas, bukan angka besar.',
          hasil: 'Hasil 2⁵ adalah 32, bukan 2. Angka 2 adalah bilangan yang dikalikan.',
          tambah: 'Pangkat menyatakan perkalian berulang, bukan penjumlahan berulang.',
        },
      },
      {
        id: 'l2',
        tanya: 'Pada 2⁵, angka kecil 5 di kanan atas menyatakan …',
        opsi: [
          { id: 'faktor', label: 'banyak faktor 2 yang dikalikan (pangkat)' },
          { id: 'kali', label: 'angka pengali: 2 × 5' },
          { id: 'basis', label: 'bilangan yang dikalikan berulang' },
          { id: 'lapis', label: 'banyak lapisan kertas' },
        ],
        correct: 'faktor',
        umpan: {
          faktor:
            'Tepat! Angka kecil di kanan atas adalah PANGKAT: banyak faktor basis yang dikalikan.',
          kali: '2⁵ bukan 2 × 5 = 10. Lihat tabel: 5 lipatan menghasilkan 32 lapis, yaitu 2 × 2 × 2 × 2 × 2.',
          basis: 'Bilangan yang dikalikan berulang adalah angka besar (basis), yaitu 2.',
          lapis: 'Banyak lapisannya 32, bukan 5. Angka 5 adalah banyak lipatan = banyak faktor 2.',
        },
      },
    ],
    nextLabel: 'Lanjut ke Pola Pangkat →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MENGUMPULKAN DATA B: POLA PANGKAT NOL & NEGATIF
     ---------------------------------------------------------- */
  pola: {
    kicker: 'Tahap 4 · Mengumpulkan Data (B)',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Menemukan makna pangkat nol dan pangkat negatif dari pola, lalu menuliskan cara bacanya.',
    guru: 'Tanyakan: “Setiap turun satu anak tangga, pangkatnya berkurang 1. Nilainya diapakan?” Biarkan murid menemukan pola ÷ basis. Isian pecahan boleh ditulis 1/10 atau 0,1.',
    cerita:
      'Kebalikan dari melipat, Bima kini MEMOTONG selembar kertas menjadi dua bagian sama besar, lalu memotong satu bagian itu menjadi dua lagi. Selembar utuh = 1 lembar; setelah satu kali dipotong = ½ lembar; setelah dua kali = ¼ lembar. Pola seperti ini juga muncul pada tangga pangkat.',
    instruksi:
      'Isi anak tangga yang kosong. Setiap turun satu anak tangga, pangkatnya berkurang 1 dan nilainya DIBAGI basis. Pecahan boleh ditulis seperti 1/10.',
    tangga: [
      {
        id: 't10',
        judul: 'Tangga pangkat 10',
        a: 10,
        dari: 3,
        sampai: -2,
        diketahui: [3, 2, 1],
      },
      {
        id: 't2',
        judul: 'Tangga pangkat 2 (potong kertas)',
        a: 2,
        dari: 3,
        sampai: -2,
        diketahui: [3, 2, 1],
      },
    ],
    temuanTangga:
      'Pola membagi terus berlanjut di bawah pangkat 1: pangkat 0 bernilai 1, lalu pangkat negatif menghasilkan pecahan. Jadi 2⁻¹ = ½ lembar dan 2⁻² = ¼ lembar kertas!',
    instruksiBaca:
      'Bilangan dengan pangkat nol dan negatif juga punya cara baca baku. Ketik cara membacanya dengan kata-kata.',
    baca: [
      {
        id: 'b1',
        jenis: 'baca',
        a: 10,
        n: 0,
        label: 'Ketik cara membaca 10⁰',
        hints: [
          'Pola bacaannya: “[basis] pangkat [pangkat]”.',
          'Pangkatnya 0 dibaca “nol”.',
          'Dibaca “sepuluh pangkat nol”.',
        ],
        temuan: '10⁰ = 1. Pangkat nol tetap dibaca “pangkat nol”.',
      },
      {
        id: 'b2',
        jenis: 'baca',
        a: 10,
        n: -2,
        label: 'Ketik cara membaca 10⁻²',
        hints: [
          'Pangkatnya −2. Tanda − di depan bilangan dibaca “negatif”.',
          'Jangan memakai kata “minus”; minus adalah nama operasi pengurangan.',
          'Dibaca “sepuluh pangkat negatif dua”.',
        ],
        temuan: '10⁻² = 1/100. Pangkat negatif dibaca “pangkat negatif …”.',
      },
      {
        id: 'b3',
        jenis: 'baca',
        a: 2,
        n: -1,
        label: 'Ketik cara membaca 2⁻¹ (½ lembar kertas)',
        hints: ['Basisnya 2, pangkatnya −1.', 'Dibaca “dua pangkat negatif satu”.'],
        temuan: '2⁻¹ = ½. Walaupun pangkatnya negatif, nilainya tetap positif.',
      },
    ],
    nextLabel: 'Lanjut Mengolah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGOLAH DATA
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 5 · Mengolah Data',
    syntax: 'Discovery Learning · Sintaks 4',
    goal: 'Mengolah temuan menjadi aturan membaca dan menulis bilangan berpangkat beserta unsurnya.',
    guru: 'Setelah pertanyaan penuntun, minta satu pasangan menjelaskan perbedaan (−3)⁴ dan −3⁴ di depan kelas sebelum murid lain mengerjakan bagian ketuk basis/pangkat.',
    pengantar:
      'Gunakan data dari percobaan lipat kertas dan tangga pangkat untuk menjawab pertanyaan penuntun berikut.',
    konsep: [
      {
        id: 'k1',
        tanya: 'Pada bentuk umum aⁿ, a disebut … dan n disebut …',
        opsi: [
          { id: 'benar', label: 'a basis, n pangkat (eksponen)' },
          { id: 'tukar', label: 'a pangkat, n basis' },
          { id: 'hasil', label: 'a hasil, n faktor' },
          { id: 'faktor', label: 'a faktor, n hasil' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! a adalah basis (bilangan yang dikalikan) dan n adalah pangkat (banyak faktornya).',
          tukar: 'Terbalik. Angka besar adalah basis; angka kecil di kanan atas adalah pangkat.',
          hasil: 'aⁿ adalah hasilnya, bukan a. Ingat 2⁵: 2 dikalikan 5 kali.',
          faktor: 'n bukan hasil. Pada 2⁵ = 32, hasilnya 32 sedangkan n = 5 adalah banyak faktor.',
        },
      },
      {
        id: 'k2',
        tanya: 'Cara membaca 2⁵ yang baku adalah …',
        opsi: [
          { id: 'benar', label: '“dua pangkat lima”' },
          { id: 'kali', label: '“dua kali lima”' },
          { id: 'tukar', label: '“lima pangkat dua”' },
          { id: 'rangkai', label: '“dua lima”' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! Baca basisnya, lalu kata “pangkat”, lalu pangkatnya.',
          kali: '2⁵ bukan 2 × 5. Angka kecil dibaca dengan kata “pangkat”.',
          tukar: 'Urutannya terbalik: basis (2) dibaca lebih dulu, baru pangkatnya (5).',
          rangkai: 'Ada kata yang hilang: “pangkat”.',
        },
      },
      {
        id: 'k3',
        tanya: 'Mengapa (−3)⁴ ditulis dengan kurung?',
        opsi: [
          {
            id: 'benar',
            label:
              'Agar jelas basisnya −3. Tanpa kurung, −3⁴ berarti negatif dari 3⁴ (basisnya 3).',
          },
          { id: 'hias', label: 'Kurung hanya hiasan dan boleh dihilangkan.' },
          { id: 'genap', label: 'Karena pangkatnya bilangan genap.' },
          { id: 'hasil', label: 'Agar hasilnya pasti negatif.' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! (−3)⁴ = (−3) × (−3) × (−3) × (−3) = 81, sedangkan −3⁴ = −(3 × 3 × 3 × 3) = −81.',
          hias: 'Kurung mengubah arti. (−3)⁴ = 81, sedangkan −3⁴ = −81.',
          genap: 'Kurung dipakai untuk basis negatif apa pun pangkatnya, mis. (−2)³.',
          hasil: '(−3)⁴ justru bernilai positif, 81. Kurung menandai bahwa −3 adalah basisnya.',
        },
      },
      {
        id: 'k4',
        tanya: 'Dari tangga pangkat 10, bagaimana 10⁰ ditulis nilainya dan dibaca?',
        opsi: [
          { id: 'benar', label: '10⁰ = 1, dibaca “sepuluh pangkat nol”' },
          { id: 'nol', label: '10⁰ = 0, dibaca “sepuluh pangkat nol”' },
          { id: 'basis', label: '10⁰ = 10, dibaca “sepuluh nol”' },
          { id: 'kali', label: '10⁰ = 1, dibaca “sepuluh kali nol”' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! 10¹ = 10, dibagi 10 menjadi 10⁰ = 1. Bacaannya tetap mengikuti pola “… pangkat …”.',
          nol: 'Cara bacanya benar, tetapi nilainya bukan 0. Dari 10¹ = 10, turun satu anak tangga berarti 10 : 10 = 1.',
          basis: '10⁰ bukan 10, dan ada kata yang hilang dalam bacaannya: “pangkat”.',
          kali: 'Nilainya benar, tetapi pangkat tidak dibaca “kali”.',
        },
      },
      {
        id: 'k5',
        tanya: 'Bagaimana cara membaca 10⁻², dan berapa nilainya?',
        opsi: [
          { id: 'benar', label: '“sepuluh pangkat negatif dua”, nilainya 1/100' },
          { id: 'minus', label: '“sepuluh minus dua”, nilainya 8' },
          { id: 'negnilai', label: '“sepuluh pangkat negatif dua”, nilainya −100' },
          { id: 'negbasis', label: '“negatif sepuluh pangkat dua”, nilainya 1/100' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! Tanda − pada pangkat dibaca “negatif”, dan nilainya 1 : 10 : 10 = 1/100.',
          minus: '10⁻² bukan pengurangan 10 − 2. Tanda − pada pangkat dibaca “negatif”.',
          negnilai:
            'Bacaannya benar, tetapi pangkat negatif tidak membuat nilainya negatif. Lihat tangga: 10⁻² = 1/100.',
          negbasis: 'Yang negatif adalah pangkatnya, bukan basisnya. Basis 10 dibaca lebih dulu.',
        },
      },
    ],
    instruksiAnatomi:
      'Ketuk bagian yang diminta pada setiap bilangan berpangkat. Perhatikan tanda − di luar pangkat!',
    anatomi: [
      { id: 'a1', a: 5, n: 3, target: 'basis' },
      { id: 'a2', a: 7, n: -2, target: 'pangkat' },
      { id: 'a3', a: -4, n: 2, target: 'basis' },
      { id: 'a4', a: 4, n: 2, negLuar: true, target: 'basis' },
      { id: 'a5', a: 10, n: 0, target: 'pangkat' },
      { id: 'a6', a: -1, n: 9, target: 'pangkat' },
    ],
    umpanAnatomi: {
      basis:
        'Itu basisnya: bilangan yang dikalikan berulang, ditulis besar. Yang diminta adalah pangkat.',
      pangkat: 'Itu pangkatnya: angka kecil di kanan atas. Yang diminta adalah basis.',
      tanda:
        'Tanda − di luar pangkat BUKAN bagian basis. Basis −4 harus ditulis dengan kurung: (−4)². Pada −4², basisnya 4.',
    },
    instruksiPilah:
      'Pilah setiap cara baca berikut: TEPAT atau KELIRU? Setiap butir hanya bisa dijawab sekali.',
    opsiPilah: [
      { id: 'tepat', label: 'Tepat' },
      { id: 'keliru', label: 'Keliru' },
    ],
    pilah: [
      {
        id: 'p1',
        a: 3,
        n: 4,
        bacaan: 'tiga pangkat empat',
        correct: 'tepat',
        explanation: 'Basis 3 dibaca dulu, lalu “pangkat empat”.',
      },
      {
        id: 'p2',
        a: 6,
        n: -3,
        bacaan: 'enam minus tiga',
        correct: 'keliru',
        explanation:
          'Seharusnya “enam pangkat negatif tiga”. Kata “pangkat” hilang dan “minus” tidak baku.',
      },
      {
        id: 'p3',
        a: -5,
        n: 2,
        bacaan: 'negatif lima pangkat dua',
        correct: 'tepat',
        explanation: 'Basisnya −5 (di dalam kurung), jadi dibaca “negatif lima pangkat dua”.',
      },
      {
        id: 'p4',
        a: 5,
        n: 2,
        negLuar: true,
        bacaan: 'negatif lima pangkat dua',
        correct: 'keliru',
        explanation:
          'Tanpa kurung, basisnya 5 dan tanda − berada di luar pangkat. Dibaca “negatif dari lima pangkat dua”.',
      },
      {
        id: 'p5',
        a: 8,
        n: 0,
        bacaan: 'delapan pangkat nol',
        correct: 'tepat',
        explanation: 'Pangkat nol dibaca “pangkat nol”.',
      },
      {
        id: 'p6',
        a: 2,
        n: 7,
        bacaan: 'tujuh pangkat dua',
        correct: 'keliru',
        explanation: 'Basis dan pangkat tertukar. Seharusnya “dua pangkat tujuh”.',
      },
      {
        id: 'p7',
        a: 10,
        n: -4,
        bacaan: 'sepuluh pangkat negatif empat',
        correct: 'tepat',
        explanation: 'Pangkat −4 dibaca “pangkat negatif empat”.',
      },
      {
        id: 'p8',
        a: 4,
        n: 3,
        bacaan: 'empat kali tiga',
        correct: 'keliru',
        explanation: '4³ = 4 × 4 × 4, bukan 4 × 3. Dibaca “empat pangkat tiga”.',
      },
    ],
    nextLabel: 'Lanjut ke Pembuktian →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    syntax: 'Discovery Learning · Sintaks 5',
    goal: 'Membuktikan dugaan awal dan menguji temuan dengan menulis, membaca, serta menanggapi miskonsepsi.',
    guru: 'Minta murid membandingkan dugaan awal dengan temuan. Diskusikan miskonsepsi yang paling banyak dipilih keliru di kelas.',
    prediksiLabel: 'Dugaan awalmu',
    hipotesisLabel: 'Hipotesismu',
    kesimpulanDugaan: {
      pangkat:
        'Dugaanmu terbukti! 2 × 2 × … × 2 (10 faktor) ditulis 2¹⁰ dan dibaca “dua pangkat sepuluh”.',
      kali: 'Dugaanmu belum tepat: 2 × 10 = 20, padahal catatan Bima bernilai 1.024. Bentuk singkatnya adalah 2¹⁰ (dua pangkat sepuluh).',
      rangkai:
        'Dugaanmu belum tepat: 210 adalah bilangan dua ratus sepuluh. Bentuk singkatnya adalah 2¹⁰, angka 10 ditulis kecil di kanan atas.',
      balik:
        'Dugaanmu hampir: bentuknya memang berpangkat, tetapi basis dan pangkatnya tertukar. 10² = 10 × 10 = 100. Yang benar 2¹⁰.',
    },
    instruksiTulis: 'Uji 1 — Tulis setiap bacaan berikut dalam bentuk pangkat.',
    tulis: [
      {
        id: 'v1',
        jenis: 'tulis',
        a: 5,
        n: -2,
        label: '“lima pangkat negatif dua”',
        hints: ['Basisnya 5.', 'Pangkatnya negatif dua: tulis −2 di kotak pangkat.'],
      },
      {
        id: 'v2',
        jenis: 'tulis',
        a: -2,
        n: 3,
        label: '“negatif dua pangkat tiga”',
        hints: ['Kata “negatif” dibaca sebelum basis, jadi basisnya −2.', 'Basis −2, pangkat 3.'],
      },
      {
        id: 'v3',
        jenis: 'tulis',
        a: 11,
        n: 0,
        label: '“sebelas pangkat nol”',
        hints: ['Basis 11.', 'Pangkat 0.'],
      },
      {
        id: 'v4',
        jenis: 'tulis',
        a: 10,
        n: 16,
        label: '“sepuluh pangkat enam belas”',
        hints: ['Basis 10.', 'Pangkat 16.'],
      },
    ],
    instruksiBaca: 'Uji 2 — Ketik cara membaca setiap bilangan berpangkat berikut.',
    baca: [
      {
        id: 'r1',
        jenis: 'baca',
        a: -6,
        n: 2,
        label: 'Ketik cara membaca (−6)²',
        hints: ['Basisnya −6 (ada kurung).', 'Dibaca “negatif enam pangkat dua”.'],
      },
      {
        id: 'r2',
        jenis: 'baca',
        a: 3,
        n: -4,
        label: 'Ketik cara membaca 3⁻⁴',
        hints: ['Basis 3, pangkat −4.', 'Dibaca “tiga pangkat negatif empat”.'],
      },
      {
        id: 'r3',
        jenis: 'baca',
        a: 3,
        n: 4,
        negLuar: true,
        label: 'Ketik cara membaca −3⁴ (tanpa kurung)',
        hints: [
          'Tanpa kurung, basisnya 3 dan tanda − berada di luar pangkat.',
          'Dibaca “negatif dari tiga pangkat empat”.',
        ],
      },
    ],
    instruksiSoal:
      'Uji 3 — Tanggapi pendapat teman-teman berikut. Setiap soal hanya bisa dijawab sekali.',
    soal: [
      {
        id: 'm1',
        pernyataan: 'Rani: “2³ artinya 2 × 3 = 6.”',
        options: [
          {
            id: 'benar',
            label: 'Rani keliru: 2³ = 2 × 2 × 2, yaitu 2 dikalikan sebanyak 3 faktor.',
          },
          { id: 'setuju', label: 'Rani benar.' },
          { id: 'tiga', label: 'Rani keliru: 2³ = 3 × 3.' },
          { id: 'tambah', label: 'Rani keliru: 2³ = 2 + 2 + 2.' },
        ],
        correct: 'benar',
        explanation: 'Pangkat 3 berarti ada 3 faktor 2 yang dikalikan: 2³ = 2 × 2 × 2 = 8.',
      },
      {
        id: 'm2',
        pernyataan: 'Doni membaca 5⁻² sebagai “lima minus dua”.',
        options: [
          { id: 'benar', label: 'Doni keliru: dibaca “lima pangkat negatif dua”.' },
          { id: 'setuju', label: 'Doni benar, minus dan negatif sama saja.' },
          { id: 'negbasis', label: 'Doni keliru: dibaca “negatif lima pangkat dua”.' },
          { id: 'kali', label: 'Doni keliru: dibaca “lima kali negatif dua”.' },
        ],
        correct: 'benar',
        explanation:
          'Kata “pangkat” tidak boleh hilang, dan tanda − pada bilangan dibaca “negatif”, bukan “minus”.',
      },
      {
        id: 'm3',
        pernyataan: 'Sinta: “Basis dari −3⁴ adalah −3.”',
        options: [
          {
            id: 'benar',
            label: 'Sinta keliru: tanpa kurung basisnya 3, tanda − ada di luar pangkat.',
          },
          { id: 'setuju', label: 'Sinta benar.' },
          { id: 'empat', label: 'Sinta keliru: basisnya 4.' },
          { id: 'negempat', label: 'Sinta keliru: basisnya −4.' },
        ],
        correct: 'benar',
        explanation: 'Basis −3 harus ditulis dengan kurung: (−3)⁴. Pada −3⁴, basisnya 3.',
      },
      {
        id: 'm4',
        pernyataan: 'Bayu: “Karena pangkatnya 0, bilangan 9⁰ tidak punya basis.”',
        options: [
          { id: 'benar', label: 'Bayu keliru: basis 9⁰ tetap 9 dan pangkatnya 0.' },
          { id: 'setuju', label: 'Bayu benar, basisnya hilang.' },
          { id: 'nol', label: 'Bayu keliru: basisnya 0.' },
          { id: 'satu', label: 'Bayu keliru: basisnya 1.' },
        ],
        correct: 'benar',
        explanation:
          '9⁰ tetap memiliki basis 9 dan pangkat 0; dibaca “sembilan pangkat nol” dan nilainya 1.',
      },
    ],
    nextLabel: 'Lanjut Menarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    syntax: 'Discovery Learning · Sintaks 6',
    goal: 'Menyusun kesimpulan tentang cara membaca dan menulis bilangan berpangkat beserta unsurnya.',
    guru: 'Setelah kesimpulan tepat, minta murid menyalinnya ke buku catatan dengan contoh buatan sendiri.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan hanya dipakai satu kali; beberapa potongan adalah pengecoh.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      {
        id: 'g1',
        awal: 'Perkalian berulang a × a × … × a (n faktor) ditulis singkat sebagai',
        correct: 'c1',
      },
      { id: 'g2', awal: 'Pada bentuk aⁿ, a disebut', correct: 'c2' },
      { id: 'g3', awal: 'Sedangkan n disebut', correct: 'c3' },
      { id: 'g4', awal: 'Bentuk aⁿ dibaca', correct: 'c4' },
      { id: 'g5', awal: 'Bila basisnya bilangan negatif, basis ditulis', correct: 'c5' },
      { id: 'g6', awal: 'Pangkat nol dan pangkat negatif dibaca', correct: 'c6' },
    ],
    bank: [
      { id: 'c1', teks: 'aⁿ' },
      { id: 'c2', teks: 'basis, yaitu bilangan yang dikalikan berulang' },
      { id: 'c3', teks: 'pangkat (eksponen), yaitu banyak faktor yang dikalikan' },
      { id: 'c4', teks: '“a pangkat n”' },
      { id: 'c5', teks: 'di dalam kurung, misalnya (−3)⁴' },
      {
        id: 'c6',
        teks: '“pangkat nol” dan “pangkat negatif …”, misalnya 5⁻² dibaca “lima pangkat negatif dua”',
      },
      { id: 'd1', teks: 'a × n' },
      { id: 'd2', teks: '“a kali n”' },
      { id: 'd3', teks: 'tanpa kurung, misalnya −3⁴' },
      { id: 'd4', teks: 'dengan kata “minus”, misalnya “lima minus dua”' },
    ],
    rangkuman: [
      'a × a × … × a (n faktor) = aⁿ; a = <strong>basis</strong>, n = <strong>pangkat</strong>.',
      'aⁿ dibaca “a pangkat n”, mis. 2⁵ dibaca “dua pangkat lima”.',
      'Basis negatif ditulis dalam kurung: (−3)⁴ dibaca “negatif tiga pangkat empat”. −3⁴ dibaca “negatif dari tiga pangkat empat”.',
      'Pangkat nol: 7⁰ dibaca “tujuh pangkat nol” (nilainya 1).',
      'Pangkat negatif: 5⁻² dibaca “lima pangkat negatif dua” (nilainya 1/25, tetap positif).',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan cara membaca dan menulis bilangan berpangkat pada berbagai konteks.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang sering dijawab keliru untuk dibahas bersama.',
    instruksi: 'Kerjakan soal satu per satu. Untuk soal isian, kamu boleh mencoba lagi.',
    nextLabel: 'Lanjut ke Refleksi →',
    soal: [
      {
        id: 's1',
        type: 'choice',
        konteks: 'Astronomi',
        cerita: 'Jarak Bumi ke bintang terdekat selain Matahari kira-kira 4 × 10¹⁶ meter.',
        pertanyaan: 'Cara membaca 10¹⁶ yang tepat adalah …',
        options: [
          { id: 'benar', label: 'sepuluh pangkat enam belas' },
          { id: 'tukar', label: 'enam belas pangkat sepuluh' },
          { id: 'kali', label: 'sepuluh kali enam belas' },
          { id: 'rangkai', label: 'seratus enam belas' },
        ],
        correct: 'benar',
        cek: { jenis: 'baca', a: 10, n: 16 },
        explanation: '10¹⁶: basis 10, pangkat 16, dibaca “sepuluh pangkat enam belas”.',
        hints: ['Baca basisnya dulu, lalu kata “pangkat”, lalu pangkatnya.'],
      },
      {
        id: 's2',
        type: 'input',
        konteks: 'Biologi',
        cerita: 'Ukuran sebuah virus sekitar 10⁻⁷ meter.',
        pertanyaan: 'Berapakah PANGKAT pada bilangan 10⁻⁷?',
        jawab: -7,
        cek: { jenis: 'pangkat', a: 10, n: -7 },
        explanation: 'Angka kecil di kanan atas adalah −7, dibaca “sepuluh pangkat negatif tujuh”.',
        hints: ['Pangkat adalah angka kecil di kanan atas.', 'Jangan lupa tandanya.'],
      },
      {
        id: 's3',
        type: 'choice',
        konteks: 'Memori komputer',
        cerita:
          'Kapasitas 1 kilobyte adalah 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 byte (10 faktor 2).',
        pertanyaan: 'Bentuk pangkat dari banyak byte tersebut adalah …',
        options: [
          { id: 'benar', label: '2¹⁰' },
          { id: 'tukar', label: '10²' },
          { id: 'kali', label: '2 × 10' },
          { id: 'basis', label: '10¹⁰' },
        ],
        correct: 'benar',
        cek: { jenis: 'tulis', a: 2, n: 10 },
        explanation: 'Basisnya 2 (yang dikalikan) dan pangkatnya 10 (banyak faktor): 2¹⁰.',
        hints: ['Bilangan apa yang dikalikan? Ada berapa faktor?'],
      },
      {
        id: 's4',
        type: 'input',
        konteks: 'Notasi',
        cerita: 'Perhatikan bilangan berpangkat (−5)³.',
        pertanyaan: 'Berapakah BASIS dari (−5)³?',
        jawab: -5,
        cek: { jenis: 'basis', a: -5, n: 3 },
        explanation: 'Basisnya −5 karena tanda − berada di dalam kurung bersama 5.',
        hints: ['Basis adalah bilangan di dalam kurung.', 'Tanda − ikut menjadi bagian basis.'],
      },
      {
        id: 's5',
        type: 'choice',
        konteks: 'Menulis dari bacaan',
        cerita: 'Guru mendiktekan: “negatif dua pangkat empat”.',
        pertanyaan: 'Penulisan yang tepat adalah …',
        options: [
          { id: 'benar', label: '(−2)⁴' },
          { id: 'luar', label: '−2⁴' },
          { id: 'negpangkat', label: '2⁻⁴' },
          { id: 'tukar', label: '4⁻²' },
        ],
        correct: 'benar',
        cek: { jenis: 'tulis', a: -2, n: 4 },
        explanation: 'Basisnya −2, jadi ditulis dalam kurung: (−2)⁴.',
        hints: ['Kata “negatif” dibaca sebelum basis, jadi basisnya negatif.'],
      },
      {
        id: 's6',
        type: 'choice',
        konteks: 'Menulis dari bacaan',
        cerita: 'Guru mendiktekan: “negatif dari tiga pangkat dua”.',
        pertanyaan: 'Penulisan yang tepat adalah …',
        options: [
          { id: 'benar', label: '−3²' },
          { id: 'kurung', label: '(−3)²' },
          { id: 'negpangkat', label: '3⁻²' },
          { id: 'tukar', label: '−2³' },
        ],
        correct: 'benar',
        cek: { jenis: 'tulis', a: 3, n: 2, negLuar: true },
        explanation: '“Negatif dari” menandakan tanda − di luar pangkat, basisnya 3: −3².',
        hints: ['“Negatif dari …” berarti tanda − tidak ikut dipangkatkan.'],
      },
      {
        id: 's7',
        type: 'choice',
        konteks: 'Pertumbuhan bakteri',
        cerita:
          'Sebuah bakteri membelah menjadi 2 setiap 20 menit. Setelah 6 kali membelah, banyak bakteri = 2 × 2 × 2 × 2 × 2 × 2.',
        pertanyaan: 'Pernyataan yang benar adalah …',
        options: [
          { id: 'benar', label: 'Ditulis 2⁶, dengan basis 2 dan pangkat 6.' },
          { id: 'tukar', label: 'Ditulis 6², dengan basis 6 dan pangkat 2.' },
          { id: 'unsur', label: 'Ditulis 2⁶, dengan basis 6 dan pangkat 2.' },
          { id: 'kali', label: 'Ditulis 2 × 6, dengan basis 2 dan pangkat 6.' },
        ],
        correct: 'benar',
        cek: { jenis: 'tulis', a: 2, n: 6 },
        explanation: 'Ada 6 faktor 2: ditulis 2⁶, basis 2, pangkat 6.',
        hints: ['Hitung banyak faktor 2.'],
      },
      {
        id: 's8',
        type: 'input',
        konteks: 'Pangkat nol',
        cerita: 'Pada tangga pangkat 3: 3² = 9, lalu 3¹ = 3, lalu 3⁰.',
        pertanyaan: 'Berapakah PANGKAT dari 3⁰?',
        jawab: 0,
        cek: { jenis: 'pangkat', a: 3, n: 0 },
        explanation: '3⁰ memiliki basis 3 dan pangkat 0; dibaca “tiga pangkat nol” (nilainya 1).',
        hints: ['Pangkat adalah angka kecil di kanan atas.'],
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses menemukan dan tingkat pemahaman.',
    guru: 'Baca beberapa refleksi secara acak (tanpa menyebut nama) untuk menutup pelajaran.',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Jelaskan dengan kata-katamu sendiri perbedaan basis dan pangkat.',
        placeholder: 'Basis adalah … sedangkan pangkat adalah …',
      },
      {
        id: 'q2',
        teks: 'Bagian mana yang paling membingungkan (mis. kurung, pangkat nol, pangkat negatif)? Bagaimana kamu mengatasinya?',
        placeholder: 'Yang paling membingungkan …',
      },
      {
        id: 'q3',
        teks: 'Di mana lagi kamu pernah melihat bilangan berpangkat di sekitarmu?',
        placeholder: 'Misalnya pada …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat membaca dan menulis bilangan berpangkat sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '😄 Sangat yakin, bisa menjelaskan ke teman' },
      { id: 'yakin', label: '🙂 Yakin' },
      { id: 'ragu', label: '😐 Masih ragu pada beberapa bagian' },
      { id: 'belum', label: '😟 Belum yakin, perlu bantuan' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat! Kamu menemukan cara menulis dan membaca bilangan berpangkat',
    teks: 'Catatan panjang Bima kini cukup ditulis 2¹⁰ dan dibaca “dua pangkat sepuluh”.',
    capaian: [
      'Menuliskan perkalian berulang dalam bentuk pangkat aⁿ.',
      'Menentukan basis dan pangkat, termasuk basis negatif dan tanda di luar pangkat.',
      'Membaca bilangan berpangkat positif, nol, dan negatif dengan cara baku.',
      'Menulis bilangan berpangkat dari bacaan yang didiktekan.',
    ],
  },
};
