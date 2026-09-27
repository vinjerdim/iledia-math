'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Bilangan Berpangkat Bulat Negatif & Nol
   Fase D — SMP Kelas VIII · Topik 12 Bilangan Berpangkat dan Bentuk Akar

   Tujuan Pembelajaran:
   Membaca dan menuliskan bilangan berpangkat bulat negatif dan nol
   beserta maknanya.

   Catatan cakupan: modul ini melanjutkan fase-d/mpi-12.1 (Membaca &
   Menulis Bilangan Berpangkat), yang membahas pangkat bulat POSITIF
   dan sengaja tidak membahas pangkat nol/negatif. Di sini basis tetap
   boleh bilangan bulat apa pun (termasuk negatif, ditulis dalam
   kurung), tetapi basis TIDAK BOLEH nol (0⁰ dan 0⁻ⁿ tak terdefinisi).

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'tangga' & 'makna'
     Sintaks 4 — Data processing ............ tahap 'olah'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi   (5')  — "Tangga Pangkat yang Terputus": tangga
                            pangkat 2 terhenti di pangkat 1, murid
                            menduga isi & makna anak tangga di
                            bawahnya (tidak dinilai).
     2. Masalah     (5')  — memilih rumusan masalah & menulis hipotesis.
     3. Tangga      (12') — tangga pangkat interaktif 3 basis (2, 5,
                            10) diteruskan dari pangkat 3 sampai −3;
                            menemukan pola "setiap turun satu anak
                            tangga, nilainya dibagi basis".
     4. Makna       (13') — konteks pengenceran larutan pembersih &
                            populasi bakteri mundur waktu untuk
                            memaknai a⁰ dan a⁻ⁿ; latihan menulis &
                            membaca notasi pangkat nol/negatif;
                            ketuk basis/pangkat/tanda.
     5. Olah data   (12') — pertanyaan penuntun makna & syarat a ≠ 0,
                            ketuk basis/pangkat pada contoh berpangkat
                            negatif, pilah 8 cara baca: tepat/keliru.
     6. Pembuktian  (12') — membuktikan dugaan awal; menulis & membaca
                            notasi pangkat nol/negatif, lalu menanggapi
                            4 miskonsepsi.
     7. Simpulan    (5')  — menyusun kesimpulan dari bank kalimat acak.
     8. Uji terap   (10') — 8 soal kontekstual (notasi ilmiah kecil,
                            pengenceran, populasi mundur waktu, dsb.).
     9. Refleksi    (2')  — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan.

   Konvensi bilangan berpangkat: { a, n, negLuar } — a basis (bulat,
   ≠ 0), n pangkat (bulat, boleh 0/negatif), negLuar true untuk −aⁿ
   (tanda di luar pangkat). Metadata `cek` pada soal pilihan/isian
   dipakai tes untuk menghitung ulang kunci dengan engine
   (tests/mpi-12.2-data.test.js):
     { jenis: 'baca',  a, n, negLuar }  label opsi benar = bacaPangkat()
     { jenis: 'tulis', a, n, negLuar }  label opsi benar = ekspresiPangkat()

   Fungsi engine (shared/engine.js) yang dipakai sudah generik untuk
   pangkat bulat apa pun: pangkatBulat, bacaPangkat, ekspresiPangkat,
   formatPangkat, formatBasis, formatPecahan, cekBacaPangkat,
   cekTulisPangkat, tulisPerkalianBerulang (n = 0 → "1"; n < 0 →
   "1 : (a × a × …)"), buildPowerLadder/bindPowerLadder,
   buildPowerAnatomy/bindPowerAnatomy, makePangkatStep/buildPangkatStep/
   bindPangkatStep.
   ============================================================ */

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1',
    goal: 'Mengamati tangga pangkat yang terputus dan menduga isi serta makna anak tangga di bawah pangkat 1.',
    tp: 'Membaca dan menuliskan bilangan berpangkat bulat negatif dan nol beserta maknanya.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menentukan nilai dan makna bilangan berpangkat nol (a⁰) dan berpangkat negatif (a⁻ⁿ).',
      'Menuliskan bilangan berpangkat nol dan negatif dalam notasi aⁿ.',
      'Membaca bilangan berpangkat nol dan negatif dengan cara baku.',
      'Menjelaskan mengapa basis bilangan berpangkat nol/negatif tidak boleh nol.',
    ],
    guru: 'Gambar tangga pangkat 2 di papan tulis sampai pangkat 1, lalu tanyakan apa yang terjadi bila tangga diteruskan ke bawah. Biarkan murid menduga tanpa dikoreksi; tanyakan "Mengapa kamu menduga begitu?" untuk memancing alasan.',
    judul: 'Tangga Pangkat yang Terputus',
    cerita:
      'Di buku catatan Kak Sari tertulis tangga pangkat 2: semakin ke atas, pangkatnya naik dan nilainya dikalikan 2. Sayangnya tangga itu berhenti di anak tangga paling bawah, pangkat 1, karena Kak Sari belum tahu apa yang terjadi jika pangkatnya diturunkan lagi.',
    catatanBima: '2⁴ = 16 → 2³ = 8 → 2² = 4 → 2¹ = 2 → 2⁰ = ? → 2⁻¹ = ? → 2⁻² = ?',
    keluhan:
      '“Kalau tangganya diturunkan lagi, apa nilai 2⁰ dan 2⁻¹? Kok bisa ada pangkat nol dan pangkat negatif?”',
    pertanyaan:
      'Menurut dugaanmu, kalau pola tangga (setiap naik satu anak tangga, nilainya ×2) diteruskan ke BAWAH, berapakah nilai 2⁰ dan 2⁻¹?',
    opsi: [
      {
        id: 'pola',
        label: '2⁰ = 1 dan 2⁻¹ = ½ — meneruskan pola “dibagi 2” setiap turun satu anak tangga',
      },
      { id: 'nol', label: '2⁰ = 0 dan 2⁻¹ = −2 — karena ada angka 0 dan tanda negatif' },
      { id: 'sama', label: '2⁰ = 2 dan 2⁻¹ = 2 — nilainya tetap sama seperti 2¹' },
      {
        id: 'negatif',
        label: '2⁰ = 0 dan 2⁻¹ = −½ — hasilnya jadi negatif karena pangkatnya negatif',
      },
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
    guru: 'Arahkan murid memilih pertanyaan yang bisa diselidiki (bukan sekadar menghitung satu soal). Hipotesis boleh keliru; yang penting dapat diuji.',
    pengantar:
      'Tangga pangkat yang terputus memunculkan beberapa pertanyaan. Pilih pertanyaan yang paling tepat untuk kita selidiki bersama.',
    pertanyaan: 'Pertanyaan manakah yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'inti',
        label:
          'Berapa nilai dan apa makna bilangan berpangkat nol dan negatif, serta bagaimana cara menuliskan dan membacanya?',
      },
      { id: 'hasil', label: 'Berapakah hasil dari 2⁴?' },
      { id: 'tangga', label: 'Berapa anak tangga yang digambar Kak Sari?' },
      { id: 'gambar', label: 'Bagaimana cara menggambar tangga yang rapi?' },
    ],
    correct: 'inti',
    umpan: {
      inti: 'Tepat! Pertanyaan ini mencakup NILAI, MAKNA, cara MENULIS, dan cara MEMBACA bilangan berpangkat nol dan negatif.',
      hasil:
        '2⁴ = 16 sudah diketahui dari tangga bagian atas. Yang belum diketahui adalah bagian bawah tangga: pangkat 0 dan negatif.',
      tangga:
        'Banyaknya anak tangga bukan masalah utama kita. Yang menjadi masalah adalah makna dan nilai anak tangga di bawah pangkat 1.',
      gambar:
        'Kerapian gambar menarik, tetapi masalah kita adalah nilai dan makna pangkat nol dan negatif.',
    },
    hipotesisLabel: 'Tulis hipotesismu: berapa nilai 2⁰ dan 2⁻¹, dan apa maknanya?',
    hipotesisPlaceholder: 'Menurutku, 2⁰ = … dan 2⁻¹ = … karena …',
    nextLabel: 'Mulai Menyelidiki Tangga Pangkat →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MENGUMPULKAN DATA A: TANGGA PANGKAT
     ---------------------------------------------------------- */
  tangga: {
    kicker: 'Tahap 3 · Mengumpulkan Data (A)',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Menemukan pola nilai bilangan berpangkat saat pangkatnya diturunkan sampai nol dan negatif.',
    guru: 'Tekankan pola "setiap turun satu anak tangga, nilai dibagi basis". Setelah tangga basis 10 selesai, hubungkan 10⁻¹ = 0,1 dan 10⁻² = 0,01 dengan nilai tempat desimal yang sudah dikenal murid.',
    cerita:
      'Lanjutkan tangga pangkat Kak Sari untuk tiga basis berbeda. Isi anak tangga yang kosong; kamu boleh menulis jawabannya sebagai pecahan (mis. 1/2) atau desimal (mis. 0,5).',
    instruksi:
      'Isi anak tangga yang kosong pada setiap tangga. Setiap turun satu anak tangga, pangkatnya berkurang 1 dan nilainya DIBAGI basis.',
    tangga: [
      { id: 'x2', judul: 'Tangga pangkat 2', a: 2, dari: 3, sampai: -3, diketahui: [3, 2] },
      { id: 'x5', judul: 'Tangga pangkat 5', a: 5, dari: 2, sampai: -2, diketahui: [2, 1] },
      { id: 'x10', judul: 'Tangga pangkat 10', a: 10, dari: 3, sampai: -3, diketahui: [3, 2] },
    ],
    temuanTangga:
      'Pola ini berlaku untuk basis apa pun (asalkan basisnya bukan 0): setiap turun satu anak tangga, nilainya dibagi basis. Tangga terus konsisten sampai <strong>a⁰ = 1</strong> dan pangkat negatif menghasilkan <strong>pecahan</strong> (mis. 2⁻² = ¼). Pada basis 10, hasil ini juga sama dengan bentuk desimal: 10⁻¹ = 0,1 dan 10⁻² = 0,01.',
    nextLabel: 'Lanjut Memaknai Pangkat Nol & Negatif →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MENGUMPULKAN DATA B: MAKNA PANGKAT NOL & NEGATIF
     ---------------------------------------------------------- */
  makna: {
    kicker: 'Tahap 4 · Mengumpulkan Data (B)',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Memaknai bilangan berpangkat nol dan negatif lewat konteks pengenceran larutan dan populasi bakteri mundur waktu, lalu berlatih menulis dan membacanya.',
    guru: 'Setelah cerita, tekankan bahwa pangkat 0 berarti "belum ada operasi kali/bagi yang dilakukan" (nilainya tetap 1×semula), sedangkan pangkat negatif berarti "kebalikan dari mengalikan berulang", yaitu membagi berulang.',
    ceritaLarutan:
      'Bu Wati mencampur larutan pembersih pekat, lalu mengencerkannya berkali-kali: setiap sekali diencerkan, kepekatannya menjadi setengah (dikali ½, atau dibagi 2) dari sebelumnya. Kepekatan larutan setelah diencerkan n kali ditulis (½)ⁿ = 2⁻ⁿ dari kepekatan semula.',
    tabelLarutan: [
      { label: 'Sebelum diencerkan sama sekali', a: 2, n: 0 },
      { label: 'Setelah diencerkan 1 kali', a: 2, n: -1 },
      { label: 'Setelah diencerkan 2 kali', a: 2, n: -2 },
      { label: 'Setelah diencerkan 3 kali', a: 2, n: -3 },
    ],
    maknaLarutan:
      '“Sebelum diencerkan sama sekali” berarti belum ada pengenceran yang terjadi — kepekatannya TETAP 100% dari semula, sehingga 2⁰ = 1 (dikali 1, tidak berubah). Setelah diencerkan n kali, kepekatannya menjadi 2⁻ⁿ = 1/2ⁿ dari semula — makin banyak diencerkan, makin kecil pecahannya.',
    ceritaBakteri:
      'Sekelompok bakteri membelah menjadi 2 setiap 20 menit. Saat ini (t = 0) banyaknya P bakteri. Berapa banyak bakteri 20 menit dan 40 menit SEBELUM sekarang?',
    tabelBakteri: [
      { label: 'Sekarang (t = 0)', a: 2, n: 0 },
      { label: '20 menit sebelum sekarang', a: 2, n: -1 },
      { label: '40 menit sebelum sekarang', a: 2, n: -2 },
    ],
    maknaBakteri:
      '“Sekarang” berarti belum mundur waktu sama sekali, sehingga banyak bakteri tetap P × 2⁰ = P (tidak berubah). Mundur 20 menit berarti banyak bakteri SEBELUM sempat membelah, yaitu P × 2⁻¹ = P/2 (setengah dari sekarang) — meneguhkan bahwa pangkat negatif adalah KEBALIKAN dari mengalikan berulang, yaitu membagi berulang.',
    instruksiTulis:
      'Tulis dalam bentuk pangkat: isi kotak BASIS (besar) dan kotak PANGKAT (kecil, boleh diisi 0 atau bilangan negatif).',
    langkah: [
      {
        id: 'm1',
        jenis: 'tulis',
        a: 2,
        n: 0,
        label: 'Kepekatan larutan sebelum diencerkan sama sekali (dikali 1)',
        hints: [
          'Basisnya tetap 2, sesuai basis pengenceran.',
          'Belum ada pengenceran yang terjadi, jadi pangkatnya nol.',
          'Basis 2, pangkat 0.',
        ],
        temuan: '2⁰ = 1: pangkat nol berarti belum ada operasi kali/bagi yang terjadi.',
      },
      {
        id: 'm2',
        jenis: 'tulis',
        a: 2,
        n: -1,
        label: 'Kepekatan larutan setelah diencerkan 1 kali (dibagi 2 sebanyak 1 kali)',
        hints: [
          'Basisnya 2.',
          'Diencerkan 1 kali berarti dibagi 2 sebanyak 1 kali → pangkat negatif 1.',
          'Basis 2, pangkat −1.',
        ],
        temuan: '2⁻¹ = ½: pangkat negatif 1 berarti dibagi basis sebanyak 1 kali.',
      },
      {
        id: 'm3',
        jenis: 'tulis',
        a: 2,
        n: -3,
        label: 'Kepekatan larutan setelah diencerkan 3 kali (dibagi 2 sebanyak 3 kali)',
        hints: [
          'Basisnya 2.',
          'Diencerkan 3 kali berarti dibagi 2 sebanyak 3 kali.',
          'Basis 2, pangkat −3.',
        ],
        temuan:
          '2⁻³ = ⅛: makin banyak diencerkan, makin negatif pangkatnya dan makin kecil nilainya.',
      },
      {
        id: 'm4',
        jenis: 'tulis',
        a: 5,
        n: -2,
        label: 'Banyak bakteri basis-5 (membelah 5×) 2 langkah SEBELUM sekarang',
        hints: [
          'Mundur waktu berarti pangkatnya negatif.',
          'Mundur 2 langkah berarti pangkat −2.',
          'Basis 5, pangkat −2.',
        ],
        temuan: '5⁻² = 1/25: mundur 2 langkah waktu = dibagi basis sebanyak 2 kali.',
      },
    ],
    instruksiBaca: 'Sekarang ketik cara membaca setiap bilangan berpangkat berikut.',
    baca: [
      {
        id: 'b1',
        jenis: 'baca',
        a: 3,
        n: 0,
        label: 'Ketik cara membaca 3⁰',
        hints: [
          'Pola bacaannya: “[basis] pangkat [pangkat]”.',
          'Pangkatnya nol, dibaca “nol”.',
          'Dibaca “tiga pangkat nol”.',
        ],
        temuan: '3⁰ = 1, dibaca “tiga pangkat nol”.',
      },
      {
        id: 'b2',
        jenis: 'baca',
        a: 4,
        n: -2,
        label: 'Ketik cara membaca 4⁻²',
        hints: [
          'Basisnya 4, pangkatnya −2.',
          'Pangkat negatif dibaca dengan kata “negatif” sebelum angkanya.',
          'Dibaca “empat pangkat negatif dua”.',
        ],
        temuan: '4⁻² = 1/16, dibaca “empat pangkat negatif dua”.',
      },
      {
        id: 'b3',
        jenis: 'baca',
        a: -2,
        n: -3,
        label: 'Ketik cara membaca (−2)⁻³',
        hints: [
          'Basisnya −2 (ada kurung).',
          'Pangkatnya −3.',
          'Dibaca “negatif dua pangkat negatif tiga”.',
        ],
        temuan: '(−2)⁻³ = −⅛, dibaca “negatif dua pangkat negatif tiga”.',
      },
    ],
    instruksiAnatomi:
      'Ketuk bagian yang diminta pada setiap bilangan berpangkat. Perhatikan tanda − di dalam maupun di luar kurung!',
    anatomi: [
      { id: 'ma1', a: 3, n: -4, target: 'pangkat' },
      { id: 'ma2', a: 7, n: 0, target: 'basis' },
      { id: 'ma3', a: -5, n: -2, target: 'basis' },
      { id: 'ma4', a: 6, n: -2, negLuar: true, target: 'pangkat' },
    ],
    umpanAnatomi: {
      basis:
        'Itu basisnya: bilangan yang dikalikan/dibagi berulang, ditulis besar. Yang diminta adalah pangkat.',
      pangkat:
        'Itu pangkatnya: angka kecil di kanan atas (boleh 0 atau negatif). Yang diminta adalah basis.',
      tanda: 'Tanda − di luar pangkat BUKAN bagian basis maupun pangkat.',
    },
    nextLabel: 'Lanjut Mengolah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGOLAH DATA
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 5 · Mengolah Data',
    syntax: 'Discovery Learning · Sintaks 4',
    goal: 'Mengolah temuan menjadi aturan nilai, makna, dan cara baca bilangan berpangkat nol dan negatif, termasuk syarat basis tidak boleh nol.',
    guru: 'Setelah pertanyaan penuntun, minta satu pasangan menjelaskan mengapa 0⁻² tidak terdefinisi sebelum murid lain mengerjakan bagian pemilahan.',
    pengantar:
      'Gunakan data dari tangga pangkat dan konteks pengenceran/mundur-waktu untuk menjawab pertanyaan penuntun berikut.',
    konsep: [
      {
        id: 'k1',
        tanya: 'Untuk a ≠ 0, nilai a⁰ selalu sama dengan …',
        opsi: [
          { id: 'benar', label: '1' },
          { id: 'nol', label: '0' },
          { id: 'a', label: 'a' },
          { id: 'tergantung', label: 'tergantung nilai a' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! Untuk a ≠ 0, a⁰ = 1 — sesuai pola tangga: 2⁰=1, 5⁰=1, 10⁰=1, dan sesuai makna "belum ada operasi yang terjadi".',
          nol: 'a⁰ BUKAN 0. Lihat kembali tangga pangkat: setelah 2¹=2 dibagi 2, hasilnya 1, bukan 0.',
          a: 'a⁰ tidak sama dengan a. Misalnya 5⁰ = 1, bukan 5.',
          tergantung: 'Nilai a⁰ selalu 1 untuk a ≠ 0 berapa pun, tidak tergantung nilai a.',
        },
      },
      {
        id: 'k2',
        tanya: 'Makna a⁻ⁿ (untuk a ≠ 0, n bulat positif) adalah …',
        opsi: [
          { id: 'benar', label: 'kebalikan (pecahan 1 per) aⁿ, yaitu 1/aⁿ' },
          { id: 'negatif', label: 'nilai negatif dari aⁿ, yaitu −aⁿ' },
          { id: 'kaliNegatif', label: 'a dikalikan −n' },
          { id: 'sama', label: 'sama dengan aⁿ' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! a⁻ⁿ = 1/aⁿ. Pangkat negatif berarti kebalikan (pecahan), bukan nilai negatif.',
          negatif: 'a⁻ⁿ tidak sama dengan −aⁿ. Misalnya 2⁻² = ¼ (positif), bukan −4.',
          kaliNegatif: 'Pangkat bukan pengali. 2⁻² bukan 2 × (−2).',
          sama: 'a⁻ⁿ dan aⁿ adalah kebalikan satu sama lain (hasil kali keduanya = 1), jadi tidak sama.',
        },
      },
      {
        id: 'k3',
        tanya: 'Cara membaca 5⁻³ yang baku adalah …',
        opsi: [
          { id: 'benar', label: '“lima pangkat negatif tiga”' },
          { id: 'minus', label: '“lima pangkat minus tiga”' },
          { id: 'negLima', label: '“negatif lima pangkat tiga”' },
          { id: 'kurang', label: '“lima dikurangi tiga pangkat”' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! Baca basisnya, lalu kata “pangkat”, lalu kata “negatif” sebelum pangkatnya.',
          minus: '“Minus” adalah nama operasi pengurangan. Tanda − pada pangkat dibaca “negatif”.',
          negLima:
            'Yang bertanda negatif adalah pangkatnya (−3), bukan basisnya. Basis 5 tetap positif.',
          kurang: '5⁻³ bukan pengurangan. Ini notasi pangkat: basis 5, pangkat −3.',
        },
      },
      {
        id: 'k4',
        tanya: 'Mengapa basis pada bilangan berpangkat nol/negatif tidak boleh 0?',
        opsi: [
          {
            id: 'benar',
            label: '0⁻ⁿ = 1/0ⁿ = 1/0, dan pembagian dengan 0 tidak terdefinisi.',
          },
          { id: 'genap', label: 'Karena 0 adalah bilangan genap.' },
          { id: 'kecil', label: 'Karena 0 terlalu kecil untuk dipangkatkan.' },
          { id: 'boleh', label: 'Sebenarnya boleh; 0⁻ⁿ selalu bernilai 0.' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            'Tepat! a⁻ⁿ = 1/aⁿ. Jika a = 0, penyebutnya 0, sehingga hasilnya tidak terdefinisi.',
          genap: 'Sifat genap/ganjil tidak berkaitan. Masalahnya ada pada pembagian dengan 0.',
          kecil: '0 bukan "terlalu kecil"; masalahnya adalah 1/0ⁿ berarti membagi dengan 0.',
          boleh: '0⁻ⁿ TIDAK terdefinisi, bukan bernilai 0. Coba hitung 1/0² — tidak ada hasilnya.',
        },
      },
    ],
    instruksiAnatomi: 'Ketuk bagian yang diminta pada setiap bilangan berpangkat berikut.',
    anatomi: [
      { id: 'oa1', a: 4, n: -5, target: 'basis' },
      { id: 'oa2', a: -3, n: 0, target: 'pangkat' },
      { id: 'oa3', a: 9, n: -2, target: 'pangkat' },
      { id: 'oa4', a: 7, n: -3, negLuar: true, target: 'basis' },
    ],
    umpanAnatomi: {
      basis:
        'Itu basisnya: bilangan yang dikalikan/dibagi berulang, ditulis besar. Yang diminta adalah pangkat.',
      pangkat:
        'Itu pangkatnya: angka kecil di kanan atas (boleh 0 atau negatif). Yang diminta adalah basis.',
      tanda:
        'Tanda − di luar pangkat BUKAN bagian basis. Basis −7 harus ditulis dengan kurung: (−7)⁻³.',
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
        a: 6,
        n: 0,
        bacaan: 'enam pangkat nol',
        correct: 'tepat',
        explanation: 'Basis 6 dibaca dulu, lalu “pangkat nol”.',
      },
      {
        id: 'p2',
        a: 3,
        n: -4,
        bacaan: 'tiga pangkat negatif empat',
        correct: 'tepat',
        explanation: 'Basis 3 dibaca dulu, lalu “pangkat negatif empat”.',
      },
      {
        id: 'p3',
        a: 5,
        n: -2,
        bacaan: 'lima pangkat minus dua',
        correct: 'keliru',
        explanation:
          'Tanda − pada pangkat dibaca “negatif”, bukan “minus”. Seharusnya “lima pangkat negatif dua”.',
      },
      {
        id: 'p4',
        a: -2,
        n: 0,
        bacaan: 'negatif dua pangkat nol',
        correct: 'tepat',
        explanation: 'Basisnya −2 (ada kurung), jadi dibaca “negatif dua pangkat nol”.',
      },
      {
        id: 'p5',
        a: 8,
        n: -3,
        bacaan: 'negatif delapan pangkat tiga',
        correct: 'keliru',
        explanation:
          'Basisnya tetap 8 (positif); yang negatif adalah pangkatnya. Seharusnya “delapan pangkat negatif tiga”.',
      },
      {
        id: 'p6',
        a: 4,
        n: -2,
        negLuar: true,
        bacaan: 'negatif dari empat pangkat negatif dua',
        correct: 'tepat',
        explanation:
          'Tanpa kurung, basisnya 4 dan tanda − di luar pangkat, dibaca “negatif dari …”.',
      },
      {
        id: 'p7',
        a: 9,
        n: 0,
        bacaan: 'sembilan pangkat kosong',
        correct: 'keliru',
        explanation: 'Pangkat 0 dibaca “nol”, bukan “kosong”. Seharusnya “sembilan pangkat nol”.',
      },
      {
        id: 'p8',
        a: -3,
        n: -3,
        bacaan: 'negatif tiga pangkat negatif tiga',
        correct: 'tepat',
        explanation: 'Basisnya −3 (ada kurung) dan pangkatnya −3, dibaca sesuai keduanya.',
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
      pola: 'Dugaanmu terbukti! Meneruskan pola “dibagi 2” setiap turun satu anak tangga: 2⁰ = 1 dan 2⁻¹ = ½.',
      nol: 'Dugaanmu belum tepat: 2⁰ bukan 0. Ingat pola tangga: 2¹ = 2, dibagi 2 hasilnya 1, jadi 2⁰ = 1. Dan 2⁻¹ = ½, bukan −2.',
      sama: 'Dugaanmu belum tepat: nilainya justru berubah (dibagi 2) setiap turun satu anak tangga. 2⁰ = 1 dan 2⁻¹ = ½, bukan tetap 2.',
      negatif:
        'Dugaanmu belum tepat: pangkat negatif TIDAK membuat hasilnya negatif. 2⁰ = 1 (bukan 0) dan 2⁻¹ = ½ (positif, bukan −½).',
    },
    instruksiTulis: 'Uji 1 — Tulis setiap bacaan berikut dalam bentuk pangkat.',
    tulis: [
      {
        id: 'v1',
        jenis: 'tulis',
        a: 7,
        n: 0,
        label: '“tujuh pangkat nol”',
        hints: ['Basisnya 7.', 'Kata “nol” menunjukkan pangkatnya 0.', 'Basis 7, pangkat 0.'],
      },
      {
        id: 'v2',
        jenis: 'tulis',
        a: 3,
        n: -5,
        label: '“tiga pangkat negatif lima”',
        hints: [
          'Basisnya 3.',
          'Kata “negatif” sebelum pangkat menunjukkan pangkatnya negatif.',
          'Basis 3, pangkat −5.',
        ],
      },
    ],
    instruksiBaca: 'Uji 2 — Ketik cara membaca setiap bilangan berpangkat berikut.',
    baca: [
      {
        id: 'r1',
        jenis: 'baca',
        a: -4,
        n: 0,
        label: 'Ketik cara membaca (−4)⁰',
        hints: ['Basisnya −4 (ada kurung).', 'Dibaca “negatif empat pangkat nol”.'],
      },
      {
        id: 'r2',
        jenis: 'baca',
        a: 6,
        n: -3,
        label: 'Ketik cara membaca 6⁻³',
        hints: ['Basisnya 6, pangkatnya −3.', 'Dibaca “enam pangkat negatif tiga”.'],
      },
    ],
    instruksiSoal:
      'Uji 3 — Tanggapi pendapat teman-teman berikut. Setiap soal hanya bisa dijawab sekali.',
    soal: [
      {
        id: 's1',
        pernyataan: 'Dodi: “5⁰ = 0, karena berapa pun dikali nol pangkatnya jadi nol.”',
        options: [
          {
            id: 'benar',
            label: 'Dodi keliru: 5⁰ = 1, bukan 0. Pangkat nol tidak berarti nilainya nol.',
          },
          { id: 'setuju', label: 'Dodi benar.' },
          { id: 'lima', label: 'Dodi keliru: 5⁰ = 5.' },
          { id: 'takTentu', label: 'Dodi keliru: 5⁰ tidak terdefinisi.' },
        ],
        correct: 'benar',
        explanation:
          'Untuk a ≠ 0, a⁰ selalu 1. Pangkat nol berarti belum ada operasi kali/bagi yang terjadi, bukan hasilnya nol.',
      },
      {
        id: 's2',
        pernyataan: 'Rani: “2⁻³ = −8, karena tanda pangkatnya negatif jadi hasilnya negatif.”',
        options: [
          { id: 'benar', label: 'Rani keliru: 2⁻³ = ⅛ (positif), yaitu kebalikan dari 2³ = 8.' },
          { id: 'setuju', label: 'Rani benar.' },
          { id: 'delapan', label: 'Rani keliru: 2⁻³ = 8.' },
          { id: 'negDelapan', label: 'Rani keliru: 2⁻³ = −⅛.' },
        ],
        correct: 'benar',
        explanation:
          'Pangkat negatif berarti kebalikan (pecahan 1/aⁿ), bukan nilai negatif. 2⁻³ = 1/2³ = ⅛.',
      },
      {
        id: 's3',
        pernyataan: 'Sinta: “0⁻² boleh dihitung, hasilnya 0.”',
        options: [
          {
            id: 'benar',
            label: 'Sinta keliru: 0⁻² = 1/0² = 1/0, tidak terdefinisi karena pembagian dengan 0.',
          },
          { id: 'setuju', label: 'Sinta benar, hasilnya 0.' },
          { id: 'satu', label: 'Sinta keliru: 0⁻² = 1.' },
          { id: 'negatif', label: 'Sinta keliru: 0⁻² = −2.' },
        ],
        correct: 'benar',
        explanation:
          'Basis bilangan berpangkat negatif tidak boleh 0, karena a⁻ⁿ = 1/aⁿ dan membagi dengan 0 tidak terdefinisi.',
      },
      {
        id: 's4',
        pernyataan: 'Wati: “3⁻² dibaca ‘tiga pangkat minus dua’.”',
        options: [
          {
            id: 'benar',
            label: 'Wati kurang tepat: dibaca “tiga pangkat negatif dua”, bukan “minus dua”.',
          },
          { id: 'setuju', label: 'Wati benar, keduanya boleh dipakai.' },
          { id: 'kurang', label: 'Wati keliru: dibaca “tiga dikurangi dua pangkat”.' },
          {
            id: 'positif',
            label: 'Wati keliru: 3⁻² dibaca sebagai bilangan positif tanpa kata tambahan.',
          },
        ],
        correct: 'benar',
        explanation:
          '“Minus” adalah nama operasi pengurangan. Tanda − pada pangkat dibaca dengan kata “negatif”.',
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
    goal: 'Menyusun kesimpulan tentang nilai, makna, dan cara membaca/menulis bilangan berpangkat nol dan negatif.',
    guru: 'Setelah kesimpulan tepat, minta murid menyalinnya ke buku catatan dengan contoh buatan sendiri.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan hanya dipakai satu kali; beberapa potongan adalah pengecoh.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'g1', awal: 'Untuk a ≠ 0, nilai a⁰ selalu sama dengan', correct: 'c1' },
      { id: 'g2', awal: 'Untuk a ≠ 0 dan n bulat positif, nilai a⁻ⁿ sama dengan', correct: 'c2' },
      { id: 'g3', awal: 'Pangkat nol bermakna', correct: 'c3' },
      { id: 'g4', awal: 'Pangkat negatif bermakna', correct: 'c4' },
      { id: 'g5', awal: 'Bentuk a⁻ⁿ dibaca', correct: 'c5' },
      { id: 'g6', awal: 'Basis bilangan berpangkat nol/negatif tidak boleh', correct: 'c6' },
    ],
    bank: [
      { id: 'c1', teks: '1' },
      { id: 'c2', teks: '1/aⁿ (kebalikan aⁿ)' },
      { id: 'c3', teks: 'belum ada operasi kali/bagi yang terjadi' },
      { id: 'c4', teks: 'kebalikan dari mengalikan berulang, yaitu membagi berulang' },
      { id: 'c5', teks: '“a pangkat negatif n”' },
      { id: 'c6', teks: '0 (nol), karena akan membagi dengan 0' },
      { id: 'd1', teks: '0' },
      { id: 'd2', teks: '−aⁿ (nilai negatif dari aⁿ)' },
      { id: 'd3', teks: 'hasil kali berulang sebanyak n kali' },
      { id: 'd4', teks: 'membuat hasilnya menjadi negatif' },
      { id: 'd5', teks: '“a dikurangi pangkat n”' },
      { id: 'd6', teks: 'negatif, karena hasilnya pasti positif' },
    ],
    rangkuman: [
      'Untuk a ≠ 0: a⁰ = 1. Pangkat nol bermakna belum ada operasi kali/bagi yang terjadi.',
      'Untuk a ≠ 0, n bulat positif: a⁻ⁿ = 1/aⁿ. Pangkat negatif bermakna kebalikan (membagi berulang), BUKAN nilai negatif.',
      'a⁻ⁿ dibaca “a pangkat negatif n”, mis. 2⁻³ dibaca “dua pangkat negatif tiga”. Tanda − pada pangkat dibaca “negatif”, bukan “minus”.',
      'Basis pada bilangan berpangkat nol/negatif tidak boleh 0, karena 0⁻ⁿ = 1/0ⁿ = 1/0 tidak terdefinisi.',
      'Pola tangga pangkat tetap konsisten: setiap turun satu anak tangga (pangkat berkurang 1), nilainya dibagi basis — berlaku juga saat melewati pangkat 0 ke pangkat negatif.',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan makna dan cara membaca/menuliskan bilangan berpangkat nol dan negatif pada berbagai konteks.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang sering dijawab keliru untuk dibahas bersama.',
    instruksi: 'Kerjakan soal satu per satu. Untuk soal isian, kamu boleh mencoba lagi.',
    nextLabel: 'Lanjut ke Refleksi →',
    soal: [
      {
        id: 't1',
        type: 'choice',
        konteks: 'Notasi ilmiah',
        cerita: 'Ukuran sebuah virus kira-kira 10⁻⁷ meter.',
        pertanyaan: 'Cara membaca 10⁻⁷ yang tepat adalah …',
        options: [
          { id: 'benar', label: 'sepuluh pangkat negatif tujuh' },
          { id: 'minus', label: 'sepuluh pangkat minus tujuh' },
          { id: 'negatifSepuluh', label: 'negatif sepuluh pangkat tujuh' },
          { id: 'kurang', label: 'sepuluh dikurangi tujuh pangkat' },
        ],
        correct: 'benar',
        cek: { jenis: 'baca', a: 10, n: -7 },
        explanation:
          '10⁻⁷: basis 10 (positif), pangkat −7, dibaca “sepuluh pangkat negatif tujuh”.',
        hints: ['Basisnya tetap positif; yang negatif adalah pangkatnya.'],
      },
      {
        id: 't2',
        type: 'choice',
        konteks: 'Pengenceran larutan',
        cerita: 'Larutan pembersih diencerkan 4 kali; setiap kali diencerkan, kepekatan dikali ½.',
        pertanyaan: 'Bentuk pangkat basis 2 untuk kepekatan setelah diencerkan 4 kali adalah …',
        options: [
          { id: 'benar', label: '2⁻⁴' },
          { id: 'positif', label: '2⁴' },
          { id: 'nol', label: '2⁰' },
          { id: 'negHasil', label: '−2⁴' },
        ],
        correct: 'benar',
        cek: { jenis: 'tulis', a: 2, n: -4 },
        explanation:
          'Diencerkan 4 kali berarti dibagi 2 sebanyak 4 kali, yaitu pangkat negatif 4: 2⁻⁴.',
        hints: ['Diencerkan = dibagi basis; makin banyak diencerkan, makin negatif pangkatnya.'],
      },
      {
        id: 't3',
        type: 'input',
        konteks: 'Nilai bilangan berpangkat',
        cerita: 'Perhatikan bilangan berpangkat 4⁻².',
        pertanyaan:
          'Berapakah nilai 4⁻² dalam bentuk pecahan paling sederhana? (tulis sebagai a/b, mis. 1/16)',
        jawab: 1 / 16,
        cek: { jenis: 'nilai', a: 4, n: -2 },
        explanation: '4⁻² = 1/4² = 1/16.',
        hints: ['a⁻ⁿ = 1/aⁿ.', 'Hitung dulu 4² = 16.'],
      },
      {
        id: 't4',
        type: 'choice',
        konteks: 'Populasi mundur waktu',
        cerita: 'Populasi bakteri membelah menjadi 3 setiap 1 jam. Sekarang (t = 0) ada P bakteri.',
        pertanyaan: 'Bentuk pangkat basis 3 untuk banyak bakteri 2 jam SEBELUM sekarang adalah …',
        options: [
          { id: 'benar', label: 'P × 3⁻²' },
          { id: 'positif', label: 'P × 3²' },
          { id: 'nol', label: 'P × 3⁰' },
          { id: 'tukar', label: 'P × 2⁻³' },
        ],
        correct: 'benar',
        cek: { jenis: 'tulis', a: 3, n: -2 },
        explanation:
          'Mundur waktu berarti pangkat negatif. Mundur 2 jam (2 langkah pembelahan) → pangkat −2: 3⁻².',
        hints: ['Mundur waktu = kebalikan dari maju waktu, jadi pangkatnya negatif.'],
      },
      {
        id: 't5',
        type: 'choice',
        konteks: 'Menulis dari bacaan',
        cerita: 'Guru mendiktekan: “sembilan pangkat nol”.',
        pertanyaan: 'Penulisan yang tepat adalah …',
        options: [
          { id: 'benar', label: '9⁰' },
          { id: 'nolHasil', label: '0⁹' },
          { id: 'satu', label: '9¹' },
          { id: 'negatif', label: '9⁻⁰' },
        ],
        correct: 'benar',
        cek: { jenis: 'tulis', a: 9, n: 0 },
        explanation: 'Basisnya 9, pangkatnya 0 (kata “nol” menunjukkan pangkat, bukan basis).',
        hints: ['Basis dibaca lebih dulu, baru pangkatnya.'],
      },
      {
        id: 't6',
        type: 'choice',
        konteks: 'Menulis dari bacaan',
        cerita: 'Guru mendiktekan: “tujuh pangkat negatif tiga”.',
        pertanyaan: 'Penulisan yang tepat adalah …',
        options: [
          { id: 'benar', label: '7⁻³' },
          { id: 'negTujuh', label: '(−7)³' },
          { id: 'positif', label: '7³' },
          { id: 'tukar', label: '3⁻⁷' },
        ],
        correct: 'benar',
        cek: { jenis: 'tulis', a: 7, n: -3 },
        explanation: 'Basisnya 7 (positif); kata “negatif” menunjukkan pangkatnya, yaitu −3.',
        hints: ['Yang bertanda negatif dalam bacaan ini adalah pangkatnya, bukan basisnya.'],
      },
      {
        id: 't7',
        type: 'input',
        konteks: 'Ukuran mikroskopis',
        cerita:
          'Diameter sebuah bakteri kira-kira 10⁻⁶ meter, sedangkan sebutir pasir kira-kira 10⁻³ meter.',
        pertanyaan: 'Berapakah PANGKAT untuk menuliskan ukuran bakteri (10 dipangkatkan berapa)?',
        jawab: -6,
        cek: { jenis: 'pangkat', a: 10, n: -6 },
        explanation: 'Diameter bakteri ditulis 10⁻⁶ meter, sehingga pangkatnya −6.',
        hints: ['Pangkat adalah angka kecil di kanan atas, termasuk tandanya.'],
      },
      {
        id: 't8',
        type: 'choice',
        konteks: 'Perbandingan nilai',
        cerita: 'Nilai 1/25 ingin ditulis dalam bentuk bilangan berpangkat basis 5.',
        pertanyaan: 'Bentuk pangkat basis 5 yang tepat adalah …',
        options: [
          { id: 'benar', label: '5⁻²' },
          { id: 'tukar', label: '5²' },
          { id: 'nol', label: '5⁰' },
          { id: 'negSatu', label: '5⁻¹' },
        ],
        correct: 'benar',
        cek: { jenis: 'tulis', a: 5, n: -2 },
        explanation:
          '5⁻² = 1/5² = 1/25. Semakin kecil (negatif) pangkatnya, semakin kecil nilainya.',
        hints: ['a⁻ⁿ = 1/aⁿ.', 'Hitung dulu 5² = 25.'],
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
        teks: 'Jelaskan dengan kata-katamu sendiri makna bilangan berpangkat nol dan bilangan berpangkat negatif.',
        placeholder: 'Pangkat nol bermakna … sedangkan pangkat negatif bermakna …',
      },
      {
        id: 'q2',
        teks: 'Bagian mana yang paling membingungkan (mis. cara baca, tanda negatif, syarat basis ≠ 0)? Bagaimana kamu mengatasinya?',
        placeholder: 'Yang paling membingungkan …',
      },
      {
        id: 'q3',
        teks: 'Di mana lagi kamu pernah melihat bilangan berpangkat negatif atau nol di sekitarmu?',
        placeholder: 'Misalnya pada …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu dapat membaca dan menulis bilangan berpangkat nol dan negatif sekarang?',
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
    judul: 'Hebat! Kamu menemukan makna bilangan berpangkat nol dan negatif',
    teks: 'Tangga pangkat Kak Sari yang terputus kini lengkap: 2⁰ = 1 dan 2⁻¹ = ½, mengikuti pola “dibagi basis” setiap turun satu anak tangga.',
    capaian: [
      'Menentukan nilai dan makna bilangan berpangkat nol (a⁰) dan berpangkat negatif (a⁻ⁿ).',
      'Menuliskan bilangan berpangkat nol dan negatif dalam notasi aⁿ.',
      'Membaca bilangan berpangkat nol dan negatif dengan cara baku.',
      'Menjelaskan mengapa basis bilangan berpangkat nol/negatif tidak boleh nol.',
    ],
  },
};
