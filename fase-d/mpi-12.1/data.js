'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membaca & Menulis Bilangan Berpangkat
   Fase D — SMP Kelas VIII · Topik 12 Bilangan Berpangkat dan Bentuk Akar

   Tujuan Pembelajaran:
   Membaca dan menuliskan bilangan berpangkat bulat positif dalam
   berbagai bentuk notasi (notasi pangkat aⁿ, perkalian berulang,
   bacaan kata, serta bacaan khusus kuadrat & kubik) beserta
   unsur-unsurnya (basis dan pangkat).

   Catatan cakupan: pangkat NOL dan NEGATIF sengaja tidak dibahas di
   sini — keduanya dipelajari di fase-d/mpi-12.2 (Sifat-sifat Operasi
   Bilangan Berpangkat Bulat) sebagai hasil sifat pembagian aᵐ ÷ aⁿ.
   Basis tetap boleh bilangan bulat apa pun, termasuk negatif (ditulis
   dalam kurung) — yang dipersempit adalah PANGKATnya, bukan basisnya.

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
     4. Notasi      (12') — tangga pangkat (luas persegi & volume kubus)
                            menemukan pola aⁿ, lalu mengenal bacaan khusus
                            KUADRAT (pangkat 2) & KUBIK (pangkat 3);
                            latihan mengenali bentuk notasi yang setara
                            (perkalian berulang ⇄ notasi pangkat ⇄ bacaan
                            kata) + mengetik cara baca.
     5. Olah data   (12') — pertanyaan penuntun (basis, pangkat, kurung,
                            kuadrat/kubik), ketuk basis/pangkat pada 5
                            ekspresi, pilah 8 cara baca: tepat/keliru.
     6. Pembuktian  (12') — membuktikan dugaan awal; menulis 2 kalimat
                            bacaan dalam notasi, membaca 3 notasi (boleh
                            memakai kuadrat/kubik), lalu menanggapi 4
                            miskonsepsi.
     7. Simpulan    (5')  — menyusun kesimpulan dari bank kalimat acak.
     8. Uji terap   (10') — 8 soal kontekstual (astronomi, memori
                            komputer, bakteri, geometri, …).
     9. Refleksi    (2')  — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan.

   Konvensi bilangan berpangkat: { a, n, negLuar } — a basis (bulat),
   n pangkat (bulat positif), negLuar true untuk −aⁿ (tanda di luar
   pangkat). Metadata `cek` pada soal pilihan/isian dipakai tes untuk
   menghitung ulang kunci dengan engine (tests/mpi-12.1-data.test.js):
     { jenis: 'baca',    a, n, negLuar }  label opsi benar = bacaPangkat()
     { jenis: 'tulis',   a, n, negLuar }  label opsi benar = ekspresiPangkat()
     { jenis: 'basis' | 'pangkat', a, n } jawab isian = basis / pangkat

   cekBacaPangkat() (shared/engine.js) menerima "kuadrat"/"kubik" sebagai
   sinonim yang setara dengan "pangkat dua"/"pangkat tiga" pada bacaan
   yang diketik murid.
   ============================================================ */

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1',
    goal: 'Mengamati masalah menulis perkalian berulang yang sangat panjang dan menduga cara menyingkatnya.',
    tp: 'Membaca dan menuliskan bilangan berpangkat bulat positif dalam berbagai bentuk notasi, beserta unsur-unsurnya (basis dan pangkat).',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menuliskan perkalian berulang dalam bentuk pangkat aⁿ.',
      'Menentukan basis dan pangkat, termasuk basis negatif dan tanda di luar pangkat.',
      'Membaca bilangan berpangkat dengan cara baku, termasuk bacaan khusus kuadrat dan kubik.',
      'Menuliskan bilangan berpangkat dari bacaan yang didiktekan, dalam berbagai bentuk notasi.',
    ],
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
          'Bagaimana menulis dan membaca perkalian berulang secara singkat, apa saja unsur-unsurnya, dan bagaimana bentuk-bentuk penulisannya (notasinya)?',
      },
      { id: 'hasil', label: 'Berapakah hasil dari 2 × 10?' },
      { id: 'kertas', label: 'Berapa lembar kertas yang dibutuhkan Bima?' },
      { id: 'rapi', label: 'Bagaimana cara melipat kertas supaya rapi?' },
    ],
    correct: 'inti',
    umpan: {
      inti: 'Tepat! Pertanyaan ini mencakup cara MENULIS, cara MEMBACA, UNSUR-UNSUR (basis & pangkat), serta BERBAGAI BENTUK notasinya.',
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
    nextLabel: 'Lanjut ke Notasi Bilangan Berpangkat →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MENGUMPULKAN DATA B: BERBAGAI BENTUK NOTASI
     ---------------------------------------------------------- */
  pola: {
    kicker: 'Tahap 4 · Mengumpulkan Data (B)',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Menemukan pola bilangan berpangkat dari konteks luas & volume, lalu mengenal berbagai bentuk notasinya: perkalian berulang, notasi pangkat, dan bacaan kata (termasuk kuadrat & kubik).',
    guru: 'Tekankan bahwa satu bilangan berpangkat bisa ditulis/dibaca dengan beberapa cara yang setara. Perkenalkan istilah "kuadrat" (pangkat 2, berkaitan dengan luas bidang datar) dan "kubik" (pangkat 3, berkaitan dengan volume bangun ruang) — keduanya sinonim yang diterima untuk "pangkat dua"/"pangkat tiga".',
    cerita:
      'Sekelompok arsitek sedang mencatat pola bilangan berpangkat pada dua tangga di bawah ini. Baris pangkat 2 nanti akan berkaitan dengan luas taman berbentuk persegi, dan baris pangkat 3 akan berkaitan dengan volume bak air berbentuk kubus.',
    instruksi:
      'Isi anak tangga yang kosong. Setiap turun satu anak tangga, pangkatnya berkurang 1 dan nilainya DIBAGI basis.',
    tangga: [
      {
        id: 't6',
        judul: 'Tangga pangkat 6',
        a: 6,
        dari: 4,
        sampai: 1,
        diketahui: [4, 3],
      },
      {
        id: 't4',
        judul: 'Tangga pangkat 4',
        a: 4,
        dari: 5,
        sampai: 1,
        diketahui: [5, 4],
      },
    ],
    temuanTangga:
      'Pola membagi ini berlaku untuk setiap bilangan berpangkat: aⁿ berarti a dikalikan berulang sebanyak n faktor. Khususnya, pangkat 2 (luas bidang datar) sering disebut <strong>kuadrat</strong>, dan pangkat 3 (volume bangun ruang) sering disebut <strong>kubik</strong> — keduanya boleh dibaca dengan istilah khusus ini atau dengan “pangkat dua”/“pangkat tiga” seperti biasa.',
    instruksiBaca:
      'Bilangan berpangkat punya cara baca baku. Ketik cara membacanya dengan kata-kata (boleh memakai “kuadrat”/“kubik” bila pangkatnya 2 atau 3).',
    baca: [
      {
        id: 'b1',
        jenis: 'baca',
        a: 6,
        n: 2,
        label: 'Ketik cara membaca 6² (luas taman sisi 6 m)',
        hints: [
          'Pola bacaannya: “[basis] pangkat [pangkat]”.',
          'Karena pangkatnya 2, kamu juga boleh memakai istilah khusus untuk luas.',
          'Dibaca “enam pangkat dua” atau “enam kuadrat”.',
        ],
        temuan: '6² = 36. Pangkat 2 boleh dibaca “pangkat dua” atau “kuadrat”.',
      },
      {
        id: 'b2',
        jenis: 'baca',
        a: 4,
        n: 3,
        label: 'Ketik cara membaca 4³ (volume bak air rusuk 4 m)',
        hints: [
          'Basisnya 4, pangkatnya 3.',
          'Karena pangkatnya 3, kamu juga boleh memakai istilah khusus untuk volume.',
          'Dibaca “empat pangkat tiga” atau “empat kubik”.',
        ],
        temuan: '4³ = 64. Pangkat 3 boleh dibaca “pangkat tiga” atau “kubik”.',
      },
      {
        id: 'b3',
        jenis: 'baca',
        a: -2,
        n: 5,
        label: 'Ketik cara membaca (−2)⁵',
        hints: ['Basisnya −2 (ada kurung).', 'Dibaca “negatif dua pangkat lima”.'],
        temuan:
          '(−2)⁵ = −32. Basis negatif tetap dibaca “negatif …” di depan, pangkatnya tetap bulat positif.',
      },
    ],
    instruksiBentuk:
      'Setiap bilangan berpangkat punya beberapa bentuk notasi yang setara: perkalian berulang, notasi pangkat, dan bacaan kata. Cocokkan pasangannya.',
    bentuk: [
      {
        id: 'f1',
        tanya: 'Bentuk lain dari 5 × 5 adalah …',
        opsi: [
          { id: 'benar', label: '5² — juga disebut “lima kuadrat”' },
          { id: 'tukar', label: '2⁵ — juga disebut “dua pangkat lima”' },
          { id: 'kali', label: '5 × 2' },
          { id: 'tiga', label: '5³ — juga disebut “lima kubik”' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! Ada 2 faktor 5, jadi ditulis 5² dan boleh disebut “lima kuadrat”.',
          tukar: 'Basis dan pangkatnya tertukar. Yang dikalikan berulang adalah 5, bukan 2.',
          kali: '5 × 5 bukan 5 × 2. Hitung ulang banyak faktornya.',
          tiga: 'Faktornya cuma 2 (bukan 3), jadi bukan bentuk kubik.',
        },
      },
      {
        id: 'f2',
        tanya: '“Tujuh kubik” sama artinya dengan …',
        opsi: [
          { id: 'benar', label: '7³ = 7 × 7 × 7' },
          { id: 'kuadrat', label: '7² = 7 × 7' },
          { id: 'tukar', label: '3⁷' },
          { id: 'kali', label: '7 × 3' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! “Kubik” adalah sebutan khusus untuk pangkat 3, jadi 7³ = 7 × 7 × 7.',
          kuadrat: '“Kuadrat” adalah sebutan untuk pangkat 2, bukan pangkat 3.',
          tukar: 'Basis dan pangkatnya tertukar. Basisnya 7, bukan 3.',
          kali: 'Pangkat berarti perkalian berulang, bukan 7 × 3.',
        },
      },
      {
        id: 'f3',
        tanya: 'Bentuk pangkat dari 9 × 9 × 9 × 9 adalah …',
        opsi: [
          { id: 'benar', label: '9⁴, dibaca “sembilan pangkat empat”' },
          { id: 'kuadrat', label: '9², dibaca “sembilan kuadrat”' },
          { id: 'kubik', label: '9³, dibaca “sembilan kubik”' },
          { id: 'tukar', label: '4⁹, dibaca “empat pangkat sembilan”' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! Ada 4 faktor 9, sehingga ditulis 9⁴. Pangkat 4 tidak punya sebutan khusus seperti kuadrat/kubik.',
          kuadrat: 'Faktornya ada 4, bukan 2, sehingga bukan bentuk kuadrat.',
          kubik: 'Faktornya ada 4, bukan 3, sehingga bukan bentuk kubik.',
          tukar: 'Basis dan pangkatnya tertukar. Yang dikalikan berulang adalah 9.',
        },
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
    goal: 'Mengolah temuan menjadi aturan membaca dan menulis bilangan berpangkat beserta unsurnya, termasuk bentuk bacaan khusus kuadrat & kubik.',
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
        tanya: 'Bilangan 7² sering disebut juga …',
        opsi: [
          { id: 'benar', label: '“tujuh kuadrat”' },
          { id: 'kubik', label: '“tujuh kubik”' },
          { id: 'tukar', label: '“dua pangkat tujuh”' },
          { id: 'ganda', label: '“tujuh ganda”' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! Pangkat 2 punya sebutan khusus “kuadrat”, jadi 7² = “tujuh kuadrat” = “tujuh pangkat dua”.',
          kubik: '“Kubik” adalah sebutan untuk pangkat 3, sedangkan 7² pangkatnya 2.',
          tukar: 'Basis dan pangkatnya tertukar. Basisnya 7, bukan 2.',
          ganda: '“Ganda” bukan istilah baku bilangan berpangkat.',
        },
      },
      {
        id: 'k5',
        tanya: 'Bilangan 4³ sering disebut juga …',
        opsi: [
          { id: 'benar', label: '“empat kubik”' },
          { id: 'kuadrat', label: '“empat kuadrat”' },
          { id: 'tukar', label: '“tiga pangkat empat”' },
          { id: 'kali', label: '“empat kali tiga”' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! Pangkat 3 punya sebutan khusus “kubik”, jadi 4³ = “empat kubik” = “empat pangkat tiga”.',
          kuadrat: '“Kuadrat” adalah sebutan untuk pangkat 2, sedangkan 4³ pangkatnya 3.',
          tukar: 'Basis dan pangkatnya tertukar. Basisnya 4, bukan 3.',
          kali: '4³ = 4 × 4 × 4, bukan 4 × 3.',
        },
      },
    ],
    instruksiAnatomi:
      'Ketuk bagian yang diminta pada setiap bilangan berpangkat. Perhatikan tanda − di luar pangkat!',
    anatomi: [
      { id: 'a1', a: 5, n: 3, target: 'basis' },
      { id: 'a2', a: 9, n: 6, target: 'pangkat' },
      { id: 'a3', a: -4, n: 2, target: 'basis' },
      { id: 'a4', a: 4, n: 2, negLuar: true, target: 'basis' },
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
        id: 'p6',
        a: 2,
        n: 7,
        bacaan: 'tujuh pangkat dua',
        correct: 'keliru',
        explanation: 'Basis dan pangkat tertukar. Seharusnya “dua pangkat tujuh”.',
      },
      {
        id: 'p8',
        a: 4,
        n: 3,
        bacaan: 'empat kali tiga',
        correct: 'keliru',
        explanation: '4³ = 4 × 4 × 4, bukan 4 × 3. Dibaca “empat pangkat tiga” atau “empat kubik”.',
      },
      {
        id: 'p9',
        a: 8,
        n: 2,
        bacaan: 'delapan kuadrat',
        correct: 'tepat',
        explanation: 'Pangkat 2 disebut juga “kuadrat”, jadi 8² boleh dibaca “delapan kuadrat”.',
      },
      {
        id: 'p10',
        a: 3,
        n: 3,
        bacaan: 'tiga kali tiga kubik',
        correct: 'keliru',
        explanation:
          'Cukup disebut “tiga kubik” atau “tiga pangkat tiga”; kata “kali” tidak perlu ditambahkan.',
      },
      {
        id: 'p11',
        a: 5,
        n: 4,
        bacaan: 'lima kuadrat',
        correct: 'keliru',
        explanation:
          '5⁴ pangkatnya 4 (bukan 2), sehingga tidak disebut kuadrat. Dibaca “lima pangkat empat”.',
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
        id: 'v2',
        jenis: 'tulis',
        a: -2,
        n: 3,
        label: '“negatif dua pangkat tiga”',
        hints: ['Kata “negatif” dibaca sebelum basis, jadi basisnya −2.', 'Basis −2, pangkat 3.'],
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
    instruksiBaca:
      'Uji 2 — Ketik cara membaca setiap bilangan berpangkat berikut (boleh memakai “kuadrat”/“kubik” bila pangkatnya 2 atau 3).',
    baca: [
      {
        id: 'r3',
        jenis: 'baca',
        a: -6,
        n: 2,
        label: 'Ketik cara membaca (−6)²',
        hints: [
          'Basisnya −6 (ada kurung).',
          'Dibaca “negatif enam pangkat dua” atau “negatif enam kuadrat”.',
        ],
      },
      {
        id: 'r4',
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
      {
        id: 'r5',
        jenis: 'baca',
        a: 9,
        n: 3,
        label: 'Ketik cara membaca 9³',
        hints: ['Basis 9, pangkat 3.', 'Dibaca “sembilan pangkat tiga” atau “sembilan kubik”.'],
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
        id: 'm5',
        pernyataan: 'Dodi: “6 kuadrat artinya 6 × 2 = 12.”',
        options: [
          { id: 'benar', label: 'Dodi keliru: 6 kuadrat artinya 6², yaitu 6 × 6 = 36.' },
          { id: 'setuju', label: 'Dodi benar.' },
          { id: 'kubik', label: 'Dodi keliru: 6 kuadrat artinya 6³ = 216.' },
          { id: 'tambah', label: 'Dodi keliru: 6 kuadrat artinya 6 + 6 = 12.' },
        ],
        correct: 'benar',
        explanation:
          '“Kuadrat” adalah sebutan lain untuk pangkat 2, bukan dikalikan 2. Jadi 6 kuadrat = 6² = 6 × 6 = 36.',
      },
      {
        id: 'm6',
        pernyataan: 'Wati: “5³ dan 5 kubik adalah dua bilangan yang berbeda.”',
        options: [
          {
            id: 'benar',
            label:
              'Wati keliru: 5³ dan “5 kubik” adalah bentuk notasi berbeda untuk bilangan yang sama.',
          },
          { id: 'setuju', label: 'Wati benar, keduanya berbeda.' },
          { id: 'kuadrat', label: 'Wati keliru: “5 kubik” sebenarnya berarti 5².' },
          { id: 'kali', label: 'Wati keliru: “5 kubik” sebenarnya berarti 5 × 3.' },
        ],
        correct: 'benar',
        explanation:
          '5³ (notasi pangkat) dan “5 kubik” (bacaan kata) adalah dua bentuk notasi yang setara untuk bilangan yang sama, yaitu 5 × 5 × 5 = 125.',
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
    goal: 'Menyusun kesimpulan tentang cara membaca dan menulis bilangan berpangkat beserta unsur dan berbagai bentuk notasinya.',
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
      {
        id: 'g6',
        awal: 'Bentuk berpangkat 2 dan berpangkat 3 masing-masing punya bacaan khusus, yaitu',
        correct: 'c6',
      },
    ],
    bank: [
      { id: 'c1', teks: 'aⁿ' },
      { id: 'c2', teks: 'basis, yaitu bilangan yang dikalikan berulang' },
      { id: 'c3', teks: 'pangkat (eksponen), yaitu banyak faktor yang dikalikan' },
      { id: 'c4', teks: '“a pangkat n”' },
      { id: 'c5', teks: 'di dalam kurung, misalnya (−3)⁴' },
      { id: 'c6', teks: '“kuadrat” (pangkat 2) dan “kubik” (pangkat 3)' },
      { id: 'd1', teks: 'a × n' },
      { id: 'd2', teks: '“a kali n”' },
      { id: 'd3', teks: 'tanpa kurung, misalnya −3⁴' },
      { id: 'd4', teks: '“ganda” (pangkat 2) dan “tripel” (pangkat 3)' },
    ],
    rangkuman: [
      'a × a × … × a (n faktor) = aⁿ; a = <strong>basis</strong>, n = <strong>pangkat</strong>.',
      'aⁿ dibaca “a pangkat n”, mis. 2⁵ dibaca “dua pangkat lima”.',
      'Basis negatif ditulis dalam kurung: (−3)⁴ dibaca “negatif tiga pangkat empat”. −3⁴ dibaca “negatif dari tiga pangkat empat”.',
      'Bentuk pangkat 2 dan pangkat 3 punya bacaan khusus: 6² = “enam kuadrat”, 4³ = “empat kubik” — setara dengan “pangkat dua”/“pangkat tiga”.',
      'Satu bilangan berpangkat punya beberapa bentuk notasi yang setara: perkalian berulang (5 × 5), notasi pangkat (5²), dan bacaan kata (“lima kuadrat”).',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan cara membaca dan menulis bilangan berpangkat pada berbagai konteks dan bentuk notasi.',
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
          { id: 'kuadrat', label: '2⁴, dibaca “dua kuadrat”' },
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
          { id: 'kubik', label: '−3³' },
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
        konteks: 'Geometri — luas persegi',
        cerita: 'Sebuah taman persegi bersisi 9 m. Luasnya ditulis 9² m².',
        pertanyaan: 'Berapakah PANGKAT dari 9² pada bentuk luas persegi tersebut?',
        jawab: 2,
        cek: { jenis: 'pangkat', a: 9, n: 2 },
        explanation:
          '9² memiliki basis 9 dan pangkat 2; bentuk pangkat 2 disebut juga “kuadrat”, sesuai untuk menghitung luas (2 dimensi).',
        hints: ['Pangkat adalah angka kecil di kanan atas.'],
      },
      {
        id: 's9',
        type: 'choice',
        konteks: 'Geometri — volume kubus',
        cerita: 'Sebuah bak air kubus berusuk 7 m. Volumenya ditulis 7 × 7 × 7 m³.',
        pertanyaan: 'Bentuk pangkat dan bacaan khususnya adalah …',
        options: [
          { id: 'benar', label: '7³, disebut juga “tujuh kubik”' },
          { id: 'kuadrat', label: '7², disebut juga “tujuh kuadrat”' },
          { id: 'tukar', label: '3⁷, disebut juga “tiga pangkat tujuh”' },
          { id: 'kali', label: '7 × 3' },
        ],
        correct: 'benar',
        cek: { jenis: 'tulis', a: 7, n: 3 },
        explanation:
          'Ada 3 faktor 7 (rusuk × rusuk × rusuk): ditulis 7³, sesuai untuk volume (3 dimensi), disebut juga “tujuh kubik”.',
        hints: ['Hitung banyak faktor 7 pada perkalian tersebut.'],
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
        teks: 'Bagian mana yang paling membingungkan (mis. kurung, kuadrat, kubik)? Bagaimana kamu mengatasinya?',
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
      'Membaca bilangan berpangkat dengan cara baku, termasuk bacaan khusus kuadrat dan kubik.',
      'Menuliskan bilangan berpangkat dari bacaan yang didiktekan, dalam berbagai bentuk notasi.',
    ],
  },
};
