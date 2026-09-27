'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membandingkan & Mengurutkan Bilangan Berpangkat Bulat
   Fase D — SMP Kelas VIII · Topik 12 Bilangan Berpangkat dan Bentuk Akar

   Tujuan Pembelajaran:
   Membandingkan dan mengurutkan bilangan berpangkat bulat.

   Prasyarat: fase-d/mpi-12.1 (membaca & menulis bilangan berpangkat
   bulat positif) dan fase-d/mpi-12.2 (pangkat nol & negatif:
   a⁰ = 1, a⁻ⁿ = 1/aⁿ).

   Gagasan kunci yang dibangun di seluruh modul:
     • membandingkan bilangan berpangkat = membandingkan NILAINYA,
       bukan basis saja atau pangkat saja (2¹⁰ > 10³ walau 2 < 10);
     • basis sama (> 1): pangkat lebih besar → nilai lebih besar,
       termasuk pangkat negatif (2⁻³ > 2⁻⁵ karena −3 > −5);
     • pangkat sama & positif: basis lebih besar → nilai lebih besar;
       pangkat sama & negatif: basis lebih besar → nilai lebih KECIL;
     • basis berbeda bisa disamakan: 9⁴ = 3⁸ dan 27³ = 3⁹;
     • patokan 1 & tanda: a⁰ = 1, a⁻ⁿ (a > 1) di antara 0 dan 1, basis
       negatif berpangkat ganjil bernilai negatif;
     • miskonsepsi yang dilawan: a⁻ⁿ dianggap negatif, a⁰ dianggap 0,
       tanda minus pangkat diabaikan, tanda basis negatif diabaikan,
       hanya membandingkan basis/pangkat, dan aⁿ = a × n.

   Model pembelajaran: COOPERATIVE LEARNING tipe NUMBERED HEADS
   TOGETHER (NHT) dalam sintaks Arends, dengan skor tim ala STAD.
   Pemetaan sintaks ke tahap media:

     Fase 1 — Menyampaikan tujuan & memotivasi ....... 'tujuan'
     Fase 2 — Menyajikan informasi .................... 'informasi'
     Fase 3 — Mengorganisasikan murid ke kelompok
              (penomoran kepala NHT) .................. 'tim'
     Fase 4 — Membimbing kelompok bekerja & belajar
              (berpikir bersama → panggil nomor) ...... 'misiBanding',
                                                        'misiUrut',
                                                        'misiDiskusi'
     Fase 5 — Evaluasi (individu) ..................... 'kuis'
     Fase 6 — Memberikan penghargaan .................. 'penghargaan'
     Penutup .......................................... 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, tim heterogen 3–4 murid
   bernomor kepala, satu perangkat per tim; kuis dikerjakan per murid):
     1. Tujuan      (6')  — "Adu Pangkat": Rani mengklaim 2¹⁰ ribu
                            rupiah lebih besar daripada 10³ ribu milik
                            Bima; bakteri 10⁻⁶ m vs virus 10⁻⁷ m. Murid
                            MENDUGA (tidak dinilai), dicek di tahap 2.
     2. Informasi   (14') — Lab Timbang Pangkat: ubah basis & pangkat
                            dua bilangan, amati lambang & strategi yang
                            cocok, temukan minimal 3 strategi; enam
                            pertanyaan penuntun berdiagnosa; kartu
                            empat strategi; cek dugaan.
     3. Tim         (4')  — nama tim, anggota, kesepakatan; nomor kepala
                            dibagikan acak.
     4. Misi 1      (15') — "Bandingkan!": tujuh pasangan kontekstual.
                            Pilih strategi → pilih lambang <, >, =
                            (diagnosa miskonsepsi) → pilih makna konteks
                            → panggil nomor acak untuk menjelaskan.
     5. Misi 2      (10') — "Urutkan!": tiga set lima bilangan berpangkat
                            (ukuran benda renik, kombinasi sandi, kartu
                            skor campuran) disusun naik/turun dengan
                            kartu ketuk → panggil nomor.
     6. Misi 3      (8')  — "Cek Pendapat Teman": delapan pernyataan
                            Benar/Salah berisi miskonsepsi + catatan tim
                            → panggil nomor.
     7. Kuis        (12') — kuis individu: tujuh soal diambil acak dari
                            bank lima belas soal.
     8. Penghargaan (3')  — poin tim (50% misi + 50% kuis) → predikat.
     9. Refleksi    (4')  — refleksi konsep & kerja sama, penilaian diri.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban benar sering di depan). app.js
   mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / ensureTapOrderState / shuffleArray dari
   shared/engine.js) sehingga tiap tim dan tiap Reset mendapat urutan
   berbeda — termasuk dugaan, penuntun, pilihan strategi, lambang
   <, >, =, makna konteks, kartu yang diurutkan, pernyataan diskusi,
   soal kuis yang terpilih beserta opsinya, dan penilaian diri.

   Bilangan berpangkat ditulis { a, n } (basis bulat, pangkat bulat).
   Konsistensi kunci jawaban diuji tests/mpi-12.3-data.test.js terhadap
   engine seksi 51 (simbolBandingPangkat, urutanIdPangkat,
   ekstremPangkat, strategiBandingPangkat, teksPangkat).
   ============================================================ */

var CL = 'Cooperative Learning (NHT)';

/* Opsi Benar/Salah untuk misi Cek Pendapat Teman. */
var OPSI_BENAR_SALAH = [
  { id: 'benar', label: '✓ Benar' },
  { id: 'salah', label: '✗ Salah' },
];

var DATA = {
  meta: {
    title: 'Membandingkan & Mengurutkan Bilangan Berpangkat Bulat',
    goal: 'Membandingkan dan mengurutkan bilangan berpangkat bulat.',
  },

  /* Urutan & label tahap (dipakai app.js dan dicek terhadap manifest). */
  tahap: [
    { id: 'tujuan', label: 'Tujuan' },
    { id: 'informasi', label: 'Informasi' },
    { id: 'tim', label: 'Tim & Nomor' },
    { id: 'misiBanding', label: 'Misi 1' },
    { id: 'misiUrut', label: 'Misi 2' },
    { id: 'misiDiskusi', label: 'Misi 3' },
    { id: 'kuis', label: 'Kuis' },
    { id: 'penghargaan', label: 'Penghargaan' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — TUJUAN & MOTIVASI
     Dugaan TIDAK dinilai; dicek kembali di tahap Informasi.
     ---------------------------------------------------------- */
  tujuan: {
    kicker: 'Tahap 1 · Tujuan & Motivasi',
    syntax: CL + ' · Fase 1',
    goal: 'Menyadari bahwa membandingkan bilangan berpangkat tidak cukup dengan melihat basis atau pangkatnya saja.',
    guru: 'Tayangkan kartu "Adu Pangkat". Tanyakan: "Siapa yang benar, Rani atau Bima?" Biarkan murid berdebat singkat tanpa kalkulator dan jangan membenarkan dugaan — jawabannya ditemukan bersama di Lab Timbang Pangkat.',
    judul: 'Adu Pangkat!',
    cerita:
      'Rani dan Bima membandingkan hadiah tabungan. Rani: "Hadiahku 2¹⁰ ribu rupiah." Bima: "Punyaku 10³ ribu rupiah — pasti lebih besar, karena 10 jauh lebih besar daripada 2!" Di kelas IPA, mereka juga membaca bahwa bakteri berukuran sekitar 10⁻⁶ m, sedangkan virus sekitar 10⁻⁷ m.',
    kartu: [
      { ikon: '💰', label: 'Hadiah Rani', p: { a: 2, n: 10 }, satuan: 'ribu rupiah' },
      { ikon: '💰', label: 'Hadiah Bima', p: { a: 10, n: 3 }, satuan: 'ribu rupiah' },
      { ikon: '🦠', label: 'Bakteri', p: { a: 10, n: -6 }, satuan: 'meter' },
      { ikon: '🧬', label: 'Virus', p: { a: 10, n: -7 }, satuan: 'meter' },
    ],
    dugaan: [
      {
        id: 'hadiah',
        tanya: 'Dugaanmu: hadiah siapa yang lebih besar?',
        opsi: [
          { id: 'rani', label: 'Hadiah Rani (2¹⁰ ribu)' },
          { id: 'bima', label: 'Hadiah Bima (10³ ribu)' },
          { id: 'sama', label: 'Sama besar' },
        ],
        p: { a: 2, n: 10 },
        q: { a: 10, n: 3 },
      },
      {
        id: 'renik',
        tanya: 'Dugaanmu: mana yang berukuran lebih besar?',
        opsi: [
          { id: 'bakteri', label: 'Bakteri (10⁻⁶ m)' },
          { id: 'virus', label: 'Virus (10⁻⁷ m)' },
          { id: 'sama', label: 'Sama besar' },
        ],
        p: { a: 10, n: -6 },
        q: { a: 10, n: -7 },
      },
      {
        id: 'cara',
        tanya: 'Menurutmu, cara yang tepat untuk membandingkan dua bilangan berpangkat adalah …',
        opsi: [
          { id: 'nilai', label: 'Membandingkan nilainya (dengan strategi yang cocok)' },
          { id: 'basis', label: 'Cukup melihat basis mana yang lebih besar' },
          { id: 'pangkat', label: 'Cukup melihat pangkat mana yang lebih besar' },
          { id: 'kali', label: 'Mengalikan basis dengan pangkatnya' },
        ],
      },
    ],
    /* Kunci dugaan 'hadiah' & 'renik' diuji terhadap simbolBandingPangkat(p, q). */
    kunciDugaan: { hadiah: 'rani', renik: 'bakteri', cara: 'nilai' },
    alasanLabel: 'Tulis alasan dugaanmu:',
    alasanPlaceholder: 'Contoh: menurutku … karena …',
    catatan: 'Dugaanmu tidak dinilai. Kalian akan mengeceknya sendiri di tahap berikutnya.',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Membandingkan dan mengurutkan bilangan berpangkat bulat (pangkat positif, nol, dan negatif).',
    kriteria: [
      'Memilih strategi yang cocok: basis sama, pangkat sama, samakan basis, atau hitung nilai/patokan 1.',
      'Menuliskan lambang <, >, atau = dengan benar beserta alasannya.',
      'Mengurutkan beberapa bilangan berpangkat bulat dari terkecil ke terbesar dan sebaliknya.',
      'Menjelaskan jawaban tim dengan kata-kata sendiri saat nomornya dipanggil.',
    ],
    nextLabel: 'Lanjut: Lab Timbang Pangkat →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENYAJIKAN INFORMASI
     Lab timbang (temukan ≥ 3 strategi) → penuntun → kartu strategi.
     ---------------------------------------------------------- */
  informasi: {
    kicker: 'Tahap 2 · Menyajikan Informasi',
    syntax: CL + ' · Fase 2',
    goal: 'Menemukan empat strategi membandingkan bilangan berpangkat bulat melalui Lab Timbang Pangkat.',
    guru: 'Peragakan lab di layar secara klasikal: minta murid menebak lambang sebelum tombol ditekan. Arahkan agar kelas menemukan minimal tiga strategi (mis. 2⁴ vs 2⁶, 3⁴ vs 5⁴, 4⁵ vs 8³, 3⁰ vs 2⁻¹). Tekankan: yang dibandingkan adalah NILAI.',
    labJudul: 'Lab Timbang Pangkat',
    labPengantar:
      'Ubah basis dan pangkat Bilangan A dan B dengan tombol − dan +. Tebak dulu lambangnya, lalu amati lambang, strategi, dan alasan yang muncul. Temukan minimal 3 strategi yang berbeda!',
    labTarget: 3,
    labSaran: [
      'Coba basis yang sama, mis. 2⁴ dan 2⁶, lalu ubah pangkatnya menjadi negatif.',
      'Coba pangkat yang sama, mis. 3⁴ dan 5⁴, lalu jadikan pangkatnya −2.',
      'Coba 4⁵ dan 8³ — basisnya bisa disamakan menjadi 2.',
      'Coba pangkat 0 atau basis negatif, mis. 3⁰ dan 2⁻¹, atau (−2)³ dan (−2)².',
    ],
    penuntun: [
      {
        id: 'p1',
        tanya: 'Manakah yang lebih besar: 3⁴ atau 3⁶?',
        opsi: [
          { id: 'b', label: '3⁶' },
          { id: 'a', label: '3⁴' },
          { id: 'sama', label: 'Sama besar' },
          { id: 'tidak', label: 'Tidak bisa dibandingkan' },
        ],
        correct: 'b',
        umpan: {
          b: 'Tepat! Basis sama (3 > 1), jadi pangkat lebih besar → nilai lebih besar: 3⁶ = 729 > 3⁴ = 81.',
          a: 'Coba hitung: 3⁴ = 81 dan 3⁶ = 729. Dengan basis sama yang lebih dari 1, makin besar pangkat makin besar nilainya.',
          sama: 'Basisnya memang sama, tetapi pangkatnya berbeda, jadi nilainya berbeda: 81 dan 729.',
          tidak: 'Bisa! Basisnya sama, tinggal bandingkan pangkatnya.',
        },
      },
      {
        id: 'p2',
        tanya: 'Manakah yang lebih besar: 2⁻³ atau 2⁻⁵?',
        opsi: [
          { id: 'a', label: '2⁻³' },
          { id: 'b', label: '2⁻⁵' },
          { id: 'sama', label: 'Sama besar' },
          { id: 'neg', label: 'Keduanya negatif, jadi tidak ada yang lebih besar' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! 2⁻³ = 1/8 dan 2⁻⁵ = 1/32. Aturan basis sama tetap berlaku: −3 > −5, jadi 2⁻³ > 2⁻⁵.',
          b: 'Hati-hati: angka 5 memang lebih besar dari 3, tetapi pangkatnya −5 dan −3. Karena −3 > −5, maka 2⁻³ (= 1/8) > 2⁻⁵ (= 1/32).',
          sama: 'Pangkatnya berbeda, jadi nilainya berbeda: 1/8 dan 1/32.',
          neg: 'Pangkat negatif tidak membuat nilainya negatif! 2⁻³ = 1/8 dan 2⁻⁵ = 1/32, keduanya positif.',
        },
      },
      {
        id: 'p3',
        tanya: 'Manakah yang lebih besar: 3⁵ atau 4⁵?',
        opsi: [
          { id: 'b', label: '4⁵' },
          { id: 'a', label: '3⁵' },
          { id: 'sama', label: 'Sama besar, karena pangkatnya sama' },
          { id: 'tidak', label: 'Harus dihitung dulu, tidak ada cara lain' },
        ],
        correct: 'b',
        umpan: {
          b: 'Tepat! Pangkat sama dan positif, jadi basis lebih besar → nilai lebih besar: 4⁵ = 1.024 > 3⁵ = 243.',
          a: 'Kalikan: 3 × 3 × 3 × 3 × 3 = 243, sedangkan 4 × 4 × 4 × 4 × 4 = 1.024.',
          sama: 'Pangkat sama belum tentu nilai sama. Basisnya berbeda (3 dan 4).',
          tidak:
            'Menghitung memang boleh, tetapi ada cara cepat: pangkat sama & positif → bandingkan basisnya.',
        },
      },
      {
        id: 'p4',
        tanya: '4⁵ = (2²)⁵ = 2¹⁰ dan 8³ = (2³)³ = 2⁹. Jadi …',
        opsi: [
          { id: 'gt', label: '4⁵ > 8³' },
          { id: 'lt', label: '4⁵ < 8³' },
          { id: 'eq', label: '4⁵ = 8³' },
          { id: 'tidak', label: 'Tidak bisa dibandingkan karena basisnya berbeda' },
        ],
        correct: 'gt',
        umpan: {
          gt: 'Benar! Setelah basis disamakan menjadi 2, bandingkan pangkatnya: 10 > 9, jadi 4⁵ > 8³ (1.024 > 512).',
          lt: 'Basis 8 memang lebih besar, tetapi setelah disamakan: 2¹⁰ dan 2⁹. Pangkat 10 > 9.',
          eq: 'Keduanya memang berbasis 2, tetapi pangkatnya berbeda (10 dan 9).',
          tidak: 'Bisa! Basis 4 dan 8 sama-sama pangkat dari 2, jadi basisnya dapat disamakan.',
        },
      },
      {
        id: 'p5',
        tanya: 'Manakah yang lebih besar: 5⁰ atau 2⁻¹?',
        opsi: [
          { id: 'a', label: '5⁰' },
          { id: 'b', label: '2⁻¹' },
          { id: 'sama', label: 'Sama besar' },
          { id: 'nol', label: 'Keduanya bernilai 0 atau kurang' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Pakai patokan 1: 5⁰ = 1, sedangkan 2⁻¹ = 1/2 < 1.',
          b: 'Ingat: bilangan (bukan nol) berpangkat 0 bernilai 1, bukan 0. Jadi 5⁰ = 1 > 1/2 = 2⁻¹.',
          sama: '5⁰ = 1 dan 2⁻¹ = 1/2 — tidak sama.',
          nol: '5⁰ = 1 (bukan 0) dan 2⁻¹ = 1/2 (positif, bukan negatif).',
        },
      },
      {
        id: 'p6',
        tanya: 'Manakah yang lebih besar: (−2)³ atau (−2)²?',
        opsi: [
          { id: 'b', label: '(−2)²' },
          { id: 'a', label: '(−2)³' },
          { id: 'sama', label: 'Sama besar' },
          { id: 'tidak', label: 'Tidak bisa dibandingkan karena basisnya negatif' },
        ],
        correct: 'b',
        umpan: {
          b: 'Benar! Tentukan tandanya dulu: (−2)³ = −8 (pangkat ganjil → negatif) dan (−2)² = 4 (pangkat genap → positif).',
          a: 'Untuk basis negatif, aturan "pangkat lebih besar → lebih besar" tidak berlaku. (−2)³ = −8, sedangkan (−2)² = 4.',
          sama: '(−2)³ = −8 dan (−2)² = 4 — tandanya pun berbeda.',
          tidak: 'Bisa! Hitung nilainya: −8 dan 4, lalu bandingkan seperti bilangan bulat.',
        },
      },
    ],
    strategiJudul: 'Empat strategi membandingkan bilangan berpangkat',
    strategiContoh: {
      basisSama: '2⁻³ > 2⁻⁵ karena −3 > −5',
      pangkatSama: '6⁴ > 5⁴ karena 6 > 5 · 2⁻³ > 5⁻³ karena pangkatnya negatif',
      samakanBasis: '4⁵ = 2¹⁰ > 2⁹ = 8³',
      hitungNilai: '5⁰ = 1 > 1/2 = 2⁻¹ · (−2)³ = −8 < 4 = (−2)²',
    },
    urutJudul: 'Mengurutkan',
    urutTeks:
      'Untuk mengurutkan, bandingkan bilangan berpasangan dengan strategi di atas, atau kelompokkan dulu: negatif (< 0), antara 0 dan 1 (pangkat negatif), tepat 1 (pangkat nol), lalu lebih dari 1. Naik = terkecil ke terbesar; turun = terbesar ke terkecil.',
    dugaanJudul: 'Cek dugaanmu di awal',
    nextLabel: 'Lanjut: Bentuk Tim →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MENGORGANISASIKAN KELOMPOK (NHT)
     ---------------------------------------------------------- */
  tim: {
    kicker: 'Tahap 3 · Bentuk Tim & Nomor Kepala',
    syntax: CL + ' · Fase 3',
    goal: 'Membentuk tim heterogen, menyepakati aturan kerja, dan menerima nomor kepala.',
    guru: 'Bentuk tim 3–4 murid dengan kemampuan beragam. Jelaskan aturan NHT: setiap misi dikerjakan bersama sampai SEMUA anggota paham, karena media akan memanggil satu nomor secara acak untuk menjelaskan. Guru dapat mengonfirmasi penjelasan di centang "sudah menjelaskan".',
    namaTimLabel: 'Nama tim',
    namaTimPlaceholder: 'Contoh: Tim Pangkat Tiga',
    anggotaLabel: 'Nama anggota',
    minAnggota: 3,
    maksAnggota: 4,
    kesepakatanJudul: 'Kesepakatan tim',
    kesepakatan: [
      { id: 'paham', teks: 'Kami memastikan SETIAP anggota paham sebelum menekan pilihan.' },
      { id: 'jelas', teks: 'Siapa pun yang nomornya dipanggil siap menjelaskan jawaban tim.' },
      { id: 'hormat', teks: 'Kami saling mendengarkan dan membantu, bukan saling menyalahkan.' },
    ],
    acakLabel: '🎲 Bagikan Nomor Kepala',
    acakUlangLabel: '🎲 Acak Ulang Nomor',
    nomorJudul: 'Nomor kepala tim kalian',
    nomorCatatan:
      'Ingat nomormu! Di akhir setiap misi, satu nomor dipanggil acak untuk menjelaskan.',
    nextLabel: 'Mulai Misi 1 →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MISI 1: BANDINGKAN!
     Kunci strategi, lambang, & makna dihitung engine dari p dan q.
     makna: id 'p' (p lebih besar), 'q' (q lebih besar), 'sama'.
     ---------------------------------------------------------- */
  misiBanding: {
    kicker: 'Tahap 4 · Misi 1: Bandingkan!',
    syntax: CL + ' · Fase 4',
    goal: 'Membandingkan dua bilangan berpangkat bulat dengan strategi yang cocok dan memaknainya dalam konteks.',
    guru: 'Berkeliling dan dengarkan diskusi "kepala bersatu". Bila tim salah memilih lambang, tanyakan "Strategi apa yang kalian pakai? Coba cek nilainya." alih-alih memberi jawaban. Setelah semua soal selesai, konfirmasi penjelasan anggota yang nomornya dipanggil.',
    langkah: [
      'Baca konteksnya bersama. Pastikan semua anggota tahu apa yang dibandingkan.',
      '① Pilih strategi yang paling cocok.',
      '② Pilih lambang <, >, atau =. Salah? Baca petunjuknya, diskusikan, coba lagi.',
      '③ Pilih makna perbandingan dalam konteks.',
    ],
    soal: [
      {
        id: 'b1',
        ikon: '🦠',
        cerita:
          'Koloni bakteri A menjadi 2 kali lipat setiap jam; setelah 8 jam banyaknya 2⁸ sel. Koloni B setelah 11 jam banyaknya 2¹¹ sel.',
        p: { a: 2, n: 8 },
        q: { a: 2, n: 11 },
        maknaTanya: 'Jadi, …',
        makna: [
          { id: 'p', label: 'Koloni A lebih banyak.' },
          { id: 'q', label: 'Koloni B lebih banyak.' },
          { id: 'sama', label: 'Kedua koloni sama banyak.' },
        ],
      },
      {
        id: 'b2',
        ikon: '🔐',
        cerita:
          'Gembok A punya 4 roda, tiap roda berisi 6 simbol, sehingga ada 6⁴ kombinasi. Gembok B punya 4 roda, tiap roda berisi 5 angka, sehingga ada 5⁴ kombinasi.',
        p: { a: 6, n: 4 },
        q: { a: 5, n: 4 },
        maknaTanya: 'Gembok yang lebih sulit ditebak (kombinasinya lebih banyak) adalah …',
        makna: [
          { id: 'p', label: 'Gembok A.' },
          { id: 'q', label: 'Gembok B.' },
          { id: 'sama', label: 'Keduanya sama sulit.' },
        ],
      },
      {
        id: 'b3',
        ikon: '📨',
        cerita:
          'Sebuah pesan berantai di grup A terkirim ke 9⁴ akun, sedangkan di grup B terkirim ke 27³ akun.',
        p: { a: 9, n: 4 },
        q: { a: 27, n: 3 },
        maknaTanya: 'Jadi, …',
        makna: [
          { id: 'p', label: 'Pesan di grup A menjangkau lebih banyak akun.' },
          { id: 'q', label: 'Pesan di grup B menjangkau lebih banyak akun.' },
          { id: 'sama', label: 'Keduanya menjangkau akun yang sama banyak.' },
        ],
      },
      {
        id: 'b4',
        ikon: '🌫️',
        cerita:
          'Diameter sebutir debu sekitar 10⁻⁵ m, sedangkan diameter partikel asap sekitar 10⁻⁷ m.',
        p: { a: 10, n: -5 },
        q: { a: 10, n: -7 },
        maknaTanya: 'Jadi, …',
        makna: [
          { id: 'p', label: 'Butir debu lebih besar daripada partikel asap.' },
          { id: 'q', label: 'Partikel asap lebih besar daripada butir debu.' },
          { id: 'sama', label: 'Keduanya sama besar.' },
        ],
      },
      {
        id: 'b5',
        ikon: '🧃',
        cerita: 'Botol A berisi 7⁰ liter jus, sedangkan gelas B berisi 3⁻² liter jus.',
        p: { a: 7, n: 0 },
        q: { a: 3, n: -2 },
        maknaTanya: 'Jadi, …',
        makna: [
          { id: 'p', label: 'Jus di botol A lebih banyak.' },
          { id: 'q', label: 'Jus di gelas B lebih banyak.' },
          { id: 'sama', label: 'Jus di keduanya sama banyak.' },
        ],
      },
      {
        id: 'b6',
        ikon: '🃏',
        cerita:
          'Dalam permainan kartu ajaib, kartu A mengubah skor sebesar (−3)³ dan kartu B mengubah skor sebesar (−3)⁴. Makin besar nilainya, makin menguntungkan.',
        p: { a: -3, n: 3 },
        q: { a: -3, n: 4 },
        maknaTanya: 'Kartu yang lebih menguntungkan adalah …',
        makna: [
          { id: 'p', label: 'Kartu A.' },
          { id: 'q', label: 'Kartu B.' },
          { id: 'sama', label: 'Keduanya sama menguntungkan.' },
        ],
      },
      {
        id: 'b7',
        ikon: '🍰',
        cerita:
          'Sepotong kue A berukuran 2⁻³ loyang, sedangkan sepotong kue B berukuran 5⁻³ loyang.',
        p: { a: 2, n: -3 },
        q: { a: 5, n: -3 },
        maknaTanya: 'Jadi, …',
        makna: [
          { id: 'p', label: 'Potongan kue A lebih besar.' },
          { id: 'q', label: 'Potongan kue B lebih besar.' },
          { id: 'sama', label: 'Kedua potongan sama besar.' },
        ],
      },
    ],
    nhtTugas:
      'Jelaskan strategi yang tim pakai untuk salah satu soal, dan mengapa 9⁴ < 27³ walaupun pangkat 4 lebih besar dari 3.',
    nextLabel: 'Lanjut ke Misi 2 →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MISI 2: URUTKAN!
     Kunci urutan dihitung engine (urutanIdPangkat).
     ---------------------------------------------------------- */
  misiUrut: {
    kicker: 'Tahap 5 · Misi 2: Urutkan!',
    syntax: CL + ' · Fase 4',
    goal: 'Mengurutkan beberapa bilangan berpangkat bulat dari terkecil ke terbesar atau sebaliknya.',
    guru: 'Dorong tim mengelompokkan dulu: negatif, antara 0 dan 1, tepat 1, lebih dari 1. Tim boleh menulis nilai di kertas buram. Panggil nomor setelah ketiga set selesai.',
    langkah: [
      'Perhatikan arah urutan: naik (terkecil → terbesar) atau turun (terbesar → terkecil).',
      'Kelompokkan atau bandingkan berpasangan dengan strategi yang cocok.',
      'Ketuk kartu satu per satu untuk mengisi urutan, lalu tekan Periksa Urutan.',
    ],
    soal: [
      {
        id: 'u1',
        ikon: '🔬',
        judul: 'Ukuran benda renik (meter)',
        cerita: 'Urutkan ukuran benda-benda renik berikut dari yang terkecil.',
        arah: 'naik',
        startLabel: 'Terkecil',
        endLabel: 'Terbesar',
        separator: '<',
        items: [
          { id: 'pasir', a: 10, n: -3, teks: 'butir pasir halus' },
          { id: 'sel', a: 10, n: -5, teks: 'sel kulit' },
          { id: 'virus', a: 10, n: -7, teks: 'virus' },
          { id: 'molekul', a: 10, n: -9, teks: 'molekul gula' },
          { id: 'bakteri', a: 10, n: -6, teks: 'bakteri' },
        ],
      },
      {
        id: 'u2',
        ikon: '🔑',
        judul: 'Banyak kemungkinan kata sandi',
        cerita:
          'Lima aplikasi memakai aturan sandi yang berbeda. Urutkan banyak kemungkinan sandinya dari yang terbanyak (paling aman).',
        arah: 'turun',
        startLabel: 'Terbanyak',
        endLabel: 'Tersedikit',
        separator: '>',
        items: [
          { id: 'a1', a: 2, n: 6, teks: 'aplikasi A' },
          { id: 'a2', a: 3, n: 3, teks: 'aplikasi B' },
          { id: 'a3', a: 5, n: 2, teks: 'aplikasi C' },
          { id: 'a4', a: 4, n: 2, teks: 'aplikasi D' },
          { id: 'a5', a: 10, n: 1, teks: 'aplikasi E' },
        ],
      },
      {
        id: 'u3',
        ikon: '🃏',
        judul: 'Kartu skor permainan',
        cerita: 'Urutkan nilai kartu skor berikut dari yang terkecil.',
        arah: 'naik',
        startLabel: 'Terkecil',
        endLabel: 'Terbesar',
        separator: '<',
        items: [
          { id: 'k1', a: 2, n: -2, teks: 'kartu biru' },
          { id: 'k2', a: 3, n: 0, teks: 'kartu hijau' },
          { id: 'k3', a: 2, n: 3, teks: 'kartu emas' },
          { id: 'k4', a: 5, n: -1, teks: 'kartu ungu' },
          { id: 'k5', a: -2, n: 3, teks: 'kartu merah' },
        ],
      },
    ],
    salahTeks:
      'Kartu bertanda merah belum tepat. Bandingkan kartu itu dengan tetangganya memakai strategi yang cocok (atau hitung nilainya), lalu ketuk untuk memindahkannya.',
    nhtTugas:
      'Jelaskan cara tim mengurutkan set kartu skor: mengapa (−2)³ paling kecil dan mengapa 5⁻¹ < 2⁻² < 3⁰.',
    nextLabel: 'Lanjut ke Misi 3 →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MISI 3: CEK PENDAPAT TEMAN
     Butir ber-`cek` diuji terhadap simbolBandingPangkat.
     ---------------------------------------------------------- */
  misiDiskusi: {
    kicker: 'Tahap 6 · Misi 3: Cek Pendapat Teman',
    syntax: CL + ' · Fase 4',
    goal: 'Menilai kebenaran pendapat tentang perbandingan bilangan berpangkat dan memperbaiki miskonsepsi.',
    guru: 'Setiap pernyataan hanya bisa dijawab sekali — pastikan tim berdiskusi dulu. Pilih 2–3 pernyataan yang paling banyak salah untuk dibahas secara klasikal.',
    pengantar:
      'Teman-teman dari kelas lain menuliskan pendapat berikut. Diskusikan dalam tim: benar atau salah? Setiap pernyataan hanya bisa dijawab SEKALI.',
    opsi: OPSI_BENAR_SALAH,
    pernyataan: [
      {
        id: 's1',
        teks: '"2¹⁰ < 10³, karena basis 2 lebih kecil daripada basis 10."',
        correct: 'salah',
        cek: { p: { a: 2, n: 10 }, q: { a: 10, n: 3 }, sym: 'lt' },
        explanation:
          '2¹⁰ = 1.024 dan 10³ = 1.000, jadi 2¹⁰ > 10³. Membandingkan basis saja tidak cukup.',
      },
      {
        id: 's2',
        teks: '"2⁻³ bernilai negatif, jadi 2⁻³ < 0."',
        correct: 'salah',
        explanation:
          '2⁻³ = 1/8, bilangan positif. Pangkat negatif berarti kebalikan, bukan bilangan negatif.',
      },
      {
        id: 's3',
        teks: '"Jika basisnya sama dan lebih dari 1, bilangan dengan pangkat lebih besar bernilai lebih besar."',
        correct: 'benar',
        explanation: 'Benar, termasuk untuk pangkat negatif: 2⁻³ > 2⁻⁵ karena −3 > −5.',
      },
      {
        id: 's4',
        teks: '"(−2)³ > (−2)², karena pangkat 3 lebih besar daripada 2."',
        correct: 'salah',
        cek: { p: { a: -2, n: 3 }, q: { a: -2, n: 2 }, sym: 'gt' },
        explanation:
          '(−2)³ = −8 dan (−2)² = 4, jadi (−2)³ < (−2)². Untuk basis negatif, tentukan tandanya dulu.',
      },
      {
        id: 's5',
        teks: '"5⁰ = 3⁰, karena keduanya bernilai 1."',
        correct: 'benar',
        cek: { p: { a: 5, n: 0 }, q: { a: 3, n: 0 }, sym: 'eq' },
        explanation: 'Setiap bilangan bukan nol berpangkat 0 bernilai 1.',
      },
      {
        id: 's6',
        teks: '"10⁻⁶ < 10⁻⁵"',
        correct: 'benar',
        cek: { p: { a: 10, n: -6 }, q: { a: 10, n: -5 }, sym: 'lt' },
        explanation: '10⁻⁶ = 1/1.000.000 dan 10⁻⁵ = 1/100.000. Basis sama, −6 < −5.',
      },
      {
        id: 's7',
        teks: '"4⁵ = 8³, karena keduanya bisa ditulis sebagai 2 berpangkat."',
        correct: 'salah',
        cek: { p: { a: 4, n: 5 }, q: { a: 8, n: 3 }, sym: 'eq' },
        explanation:
          '4⁵ = 2¹⁰ dan 8³ = 2⁹. Basisnya sama-sama 2, tetapi pangkatnya berbeda: 4⁵ > 8³.',
      },
      {
        id: 's8',
        teks: '"2⁻⁵ > 2⁻³, karena 5 lebih besar daripada 3."',
        correct: 'salah',
        cek: { p: { a: 2, n: -5 }, q: { a: 2, n: -3 }, sym: 'gt' },
        explanation: 'Pangkatnya −5 dan −3, dan −5 < −3. Jadi 2⁻⁵ = 1/32 < 1/8 = 2⁻³.',
      },
    ],
    catatanLabel:
      'Catatan tim: tulis ulang satu pernyataan yang salah menjadi pernyataan yang benar.',
    catatanPlaceholder: 'Contoh: 2¹⁰ > 10³, karena …',
    nhtTugas:
      'Pilih satu pernyataan yang SALAH, lalu jelaskan letak kesalahannya dan perbaikannya.',
    nextLabel: 'Lanjut ke Kuis Individu →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — KUIS INDIVIDU
     Bank 15 soal; `komposisi` menentukan jumlah per jenis.
     `cek` dipakai tes untuk menghitung ulang kunci dengan engine:
       { jenis: 'lambang', p, q }       → correct = lambang p ☐ q
       { jenis: 'terbesar'|'terkecil' } → opsi ber-p, correct = ekstrem
       { jenis: 'urut', arah, items }   → label correct = urutan benar
     ---------------------------------------------------------- */
  kuis: {
    kicker: 'Tahap 7 · Kuis Individu',
    syntax: CL + ' · Fase 5',
    goal: 'Menunjukkan penguasaan individu dalam membandingkan dan mengurutkan bilangan berpangkat bulat.',
    guru: 'Kuis dikerjakan MANDIRI (bergantian di perangkat tim atau di perangkat masing-masing). Anggota tim tidak boleh saling membantu pada tahap ini.',
    instruksi: 'Kerjakan sendiri. Soal dan urutan pilihan diacak untuk setiap murid.',
    banyak: 7,
    komposisi: { lambang: 2, ekstrem: 2, urut: 1, konteks: 2 },
    soal: [
      {
        id: 'q1',
        jenis: 'lambang',
        cerita: 'Bandingkan 3⁵ dan 5³.',
        pertanyaan: 'Pernyataan yang benar adalah …',
        cek: { jenis: 'lambang', p: { a: 3, n: 5 }, q: { a: 5, n: 3 } },
        options: [
          { id: 'gt', label: '3⁵ > 5³' },
          { id: 'lt', label: '3⁵ < 5³' },
          { id: 'eq', label: '3⁵ = 5³' },
        ],
        correct: 'gt',
        explanation: '3⁵ = 243 dan 5³ = 125, jadi 3⁵ > 5³.',
      },
      {
        id: 'q2',
        jenis: 'lambang',
        cerita: 'Bandingkan 2⁻⁴ dan 2⁻².',
        pertanyaan: 'Pernyataan yang benar adalah …',
        cek: { jenis: 'lambang', p: { a: 2, n: -4 }, q: { a: 2, n: -2 } },
        options: [
          { id: 'lt', label: '2⁻⁴ < 2⁻²' },
          { id: 'gt', label: '2⁻⁴ > 2⁻²' },
          { id: 'eq', label: '2⁻⁴ = 2⁻²' },
        ],
        correct: 'lt',
        explanation: 'Basis sama dan −4 < −2, jadi 2⁻⁴ (= 1/16) < 2⁻² (= 1/4).',
      },
      {
        id: 'q3',
        jenis: 'lambang',
        cerita: 'Bandingkan 16² dan 4⁴.',
        pertanyaan: 'Pernyataan yang benar adalah …',
        cek: { jenis: 'lambang', p: { a: 16, n: 2 }, q: { a: 4, n: 4 } },
        options: [
          { id: 'eq', label: '16² = 4⁴' },
          { id: 'gt', label: '16² > 4⁴' },
          { id: 'lt', label: '16² < 4⁴' },
        ],
        correct: 'eq',
        explanation: 'Samakan basis: 16² = (2⁴)² = 2⁸ dan 4⁴ = (2²)⁴ = 2⁸. Keduanya 256.',
      },
      {
        id: 'q4',
        jenis: 'lambang',
        cerita: 'Bandingkan (−2)⁵ dan (−2)⁴.',
        pertanyaan: 'Pernyataan yang benar adalah …',
        cek: { jenis: 'lambang', p: { a: -2, n: 5 }, q: { a: -2, n: 4 } },
        options: [
          { id: 'lt', label: '(−2)⁵ < (−2)⁴' },
          { id: 'gt', label: '(−2)⁵ > (−2)⁴' },
          { id: 'eq', label: '(−2)⁵ = (−2)⁴' },
        ],
        correct: 'lt',
        explanation:
          '(−2)⁵ = −32 (pangkat ganjil) dan (−2)⁴ = 16 (pangkat genap), jadi (−2)⁵ < (−2)⁴.',
      },
      {
        id: 'q5',
        jenis: 'lambang',
        cerita: 'Bandingkan 10⁻² dan 5⁻².',
        pertanyaan: 'Pernyataan yang benar adalah …',
        cek: { jenis: 'lambang', p: { a: 10, n: -2 }, q: { a: 5, n: -2 } },
        options: [
          { id: 'lt', label: '10⁻² < 5⁻²' },
          { id: 'gt', label: '10⁻² > 5⁻²' },
          { id: 'eq', label: '10⁻² = 5⁻²' },
        ],
        correct: 'lt',
        explanation:
          'Pangkat sama dan negatif: basis lebih besar → nilai lebih kecil. 10⁻² = 1/100 < 1/25 = 5⁻².',
      },
      {
        id: 'q6',
        jenis: 'ekstrem',
        cerita: 'Perhatikan bilangan 2⁸, 4³, 3⁵, dan 5³.',
        pertanyaan: 'Bilangan yang nilainya paling besar adalah …',
        cek: { jenis: 'terbesar' },
        options: [
          { id: 'a', label: '2⁸', p: { a: 2, n: 8 } },
          { id: 'b', label: '4³', p: { a: 4, n: 3 } },
          { id: 'c', label: '3⁵', p: { a: 3, n: 5 } },
          { id: 'd', label: '5³', p: { a: 5, n: 3 } },
        ],
        correct: 'a',
        explanation: '2⁸ = 256, 4³ = 64, 3⁵ = 243, 5³ = 125. Terbesar: 2⁸.',
      },
      {
        id: 'q7',
        jenis: 'ekstrem',
        cerita: 'Perhatikan bilangan 3⁻², 2⁻³, 5⁰, dan 4⁻¹.',
        pertanyaan: 'Bilangan yang nilainya paling kecil adalah …',
        cek: { jenis: 'terkecil' },
        options: [
          { id: 'a', label: '3⁻²', p: { a: 3, n: -2 } },
          { id: 'b', label: '2⁻³', p: { a: 2, n: -3 } },
          { id: 'c', label: '5⁰', p: { a: 5, n: 0 } },
          { id: 'd', label: '4⁻¹', p: { a: 4, n: -1 } },
        ],
        correct: 'a',
        explanation: '3⁻² = 1/9, 2⁻³ = 1/8, 5⁰ = 1, 4⁻¹ = 1/4. Terkecil: 1/9 = 3⁻².',
      },
      {
        id: 'q8',
        jenis: 'ekstrem',
        cerita: 'Perhatikan bilangan 10⁻³, 10⁻⁵, 10⁻¹, dan 10⁻⁴.',
        pertanyaan: 'Bilangan yang nilainya paling besar adalah …',
        cek: { jenis: 'terbesar' },
        options: [
          { id: 'a', label: '10⁻¹', p: { a: 10, n: -1 } },
          { id: 'b', label: '10⁻⁵', p: { a: 10, n: -5 } },
          { id: 'c', label: '10⁻³', p: { a: 10, n: -3 } },
          { id: 'd', label: '10⁻⁴', p: { a: 10, n: -4 } },
        ],
        correct: 'a',
        explanation: 'Basis sama (10): pangkat terbesar adalah −1, jadi 10⁻¹ = 1/10 paling besar.',
      },
      {
        id: 'q9',
        jenis: 'ekstrem',
        cerita: 'Perhatikan bilangan (−3)³, (−2)⁴, 2⁻¹, dan 3⁰.',
        pertanyaan: 'Bilangan yang nilainya paling kecil adalah …',
        cek: { jenis: 'terkecil' },
        options: [
          { id: 'a', label: '(−3)³', p: { a: -3, n: 3 } },
          { id: 'b', label: '(−2)⁴', p: { a: -2, n: 4 } },
          { id: 'c', label: '2⁻¹', p: { a: 2, n: -1 } },
          { id: 'd', label: '3⁰', p: { a: 3, n: 0 } },
        ],
        correct: 'a',
        explanation: '(−3)³ = −27 adalah satu-satunya bilangan negatif, jadi paling kecil.',
      },
      {
        id: 'q10',
        jenis: 'urut',
        cerita: 'Bilangan: 2⁵, 3³, 4², 5².',
        pertanyaan: 'Urutan dari yang terkecil adalah …',
        cek: {
          jenis: 'urut',
          arah: 'naik',
          items: [
            { a: 2, n: 5 },
            { a: 3, n: 3 },
            { a: 4, n: 2 },
            { a: 5, n: 2 },
          ],
        },
        options: [
          { id: 'a', label: '4², 5², 3³, 2⁵' },
          { id: 'b', label: '2⁵, 3³, 4², 5²' },
          { id: 'c', label: '4², 5², 2⁵, 3³' },
          { id: 'd', label: '5², 4², 3³, 2⁵' },
        ],
        correct: 'a',
        explanation: '4² = 16, 5² = 25, 3³ = 27, 2⁵ = 32.',
      },
      {
        id: 'q11',
        jenis: 'urut',
        cerita: 'Bilangan: 10⁻², 10⁰, 10⁻⁴, 10¹.',
        pertanyaan: 'Urutan dari yang terbesar adalah …',
        cek: {
          jenis: 'urut',
          arah: 'turun',
          items: [
            { a: 10, n: -2 },
            { a: 10, n: 0 },
            { a: 10, n: -4 },
            { a: 10, n: 1 },
          ],
        },
        options: [
          { id: 'a', label: '10¹, 10⁰, 10⁻², 10⁻⁴' },
          { id: 'b', label: '10⁻⁴, 10⁻², 10⁰, 10¹' },
          { id: 'c', label: '10¹, 10⁰, 10⁻⁴, 10⁻²' },
          { id: 'd', label: '10⁻⁴, 10¹, 10⁻², 10⁰' },
        ],
        correct: 'a',
        explanation: 'Basis sama (10): urutkan pangkatnya dari yang terbesar: 1 > 0 > −2 > −4.',
      },
      {
        id: 'q12',
        jenis: 'urut',
        cerita: 'Bilangan: 3⁻¹, 3², 3⁰, 3⁻².',
        pertanyaan: 'Urutan dari yang terkecil adalah …',
        cek: {
          jenis: 'urut',
          arah: 'naik',
          items: [
            { a: 3, n: -1 },
            { a: 3, n: 2 },
            { a: 3, n: 0 },
            { a: 3, n: -2 },
          ],
        },
        options: [
          { id: 'a', label: '3⁻², 3⁻¹, 3⁰, 3²' },
          { id: 'b', label: '3⁻¹, 3⁻², 3⁰, 3²' },
          { id: 'c', label: '3⁰, 3⁻¹, 3⁻², 3²' },
          { id: 'd', label: '3², 3⁰, 3⁻¹, 3⁻²' },
        ],
        correct: 'a',
        explanation: 'Basis sama (3): urutkan pangkatnya dari yang terkecil: −2 < −1 < 0 < 2.',
      },
      {
        id: 'q13',
        jenis: 'konteks',
        cerita:
          'Ukuran beberapa benda: sel darah merah 10⁻⁵ m, bakteri 10⁻⁶ m, virus 10⁻⁷ m, butir pasir 10⁻³ m.',
        pertanyaan: 'Benda yang paling kecil adalah …',
        cek: { jenis: 'terkecil' },
        options: [
          { id: 'a', label: 'virus (10⁻⁷ m)', p: { a: 10, n: -7 } },
          { id: 'b', label: 'bakteri (10⁻⁶ m)', p: { a: 10, n: -6 } },
          { id: 'c', label: 'sel darah merah (10⁻⁵ m)', p: { a: 10, n: -5 } },
          { id: 'd', label: 'butir pasir (10⁻³ m)', p: { a: 10, n: -3 } },
        ],
        correct: 'a',
        explanation: 'Basis sama (10): pangkat terkecil adalah −7, jadi virus paling kecil.',
      },
      {
        id: 'q14',
        jenis: 'konteks',
        cerita: 'Kapasitas empat flashdisk: A = 2⁷ GB, B = 4³ GB, C = 8² GB, D = 16¹ GB.',
        pertanyaan: 'Flashdisk dengan kapasitas terbesar adalah …',
        cek: { jenis: 'terbesar' },
        options: [
          { id: 'a', label: 'flashdisk A (2⁷ GB)', p: { a: 2, n: 7 } },
          { id: 'b', label: 'flashdisk B (4³ GB)', p: { a: 4, n: 3 } },
          { id: 'c', label: 'flashdisk C (8² GB)', p: { a: 8, n: 2 } },
          { id: 'd', label: 'flashdisk D (16¹ GB)', p: { a: 16, n: 1 } },
        ],
        correct: 'a',
        explanation:
          'Samakan basis 2: 2⁷, 4³ = 2⁶, 8² = 2⁶, 16¹ = 2⁴. Pangkat terbesar: 2⁷ = 128 GB.',
      },
      {
        id: 'q15',
        jenis: 'konteks',
        cerita:
          'Dalam lomba cerdas cermat, Tim A mengumpulkan 3⁴ poin dan Tim B mengumpulkan 9² poin.',
        pertanyaan: 'Pernyataan yang benar adalah …',
        cek: { jenis: 'lambang', p: { a: 3, n: 4 }, q: { a: 9, n: 2 } },
        options: [
          { id: 'eq', label: 'Poin kedua tim sama banyak.' },
          { id: 'gt', label: 'Poin Tim A lebih banyak.' },
          { id: 'lt', label: 'Poin Tim B lebih banyak.' },
        ],
        correct: 'eq',
        explanation: '9² = (3²)² = 3⁴ = 81. Poin kedua tim sama.',
      },
    ],
    nextLabel: 'Lihat Penghargaan Tim →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — PENGHARGAAN
     ---------------------------------------------------------- */
  penghargaan: {
    kicker: 'Tahap 8 · Penghargaan Tim',
    syntax: CL + ' · Fase 6',
    goal: 'Merayakan kerja sama tim berdasarkan skor misi dan skor kuis individu.',
    guru: 'Umumkan predikat setiap tim. Beri apresiasi khusus pada anggota yang menjelaskan dengan jelas saat nomornya dipanggil.',
    bobot:
      'Poin tim = 50% skor misi (benar pada percobaan pertama + penjelasan nomor) + 50% skor kuis individu.',
    pujianLabel: 'Tulis satu pujian untuk teman satu tim (sebut namanya):',
    pujianPlaceholder: 'Contoh: Terima kasih Dimas, penjelasanmu soal 2⁻³ > 2⁻⁵ membuatku paham.',
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan pemahaman membandingkan & mengurutkan bilangan berpangkat serta proses kerja sama.',
    guru: 'Minta 2–3 murid membacakan refleksinya. Catat miskonsepsi yang masih muncul (mis. pangkat negatif dianggap negatif) untuk pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Mengapa 2¹⁰ > 10³ walaupun basis 2 lebih kecil daripada 10? Jelaskan dengan kata-katamu.',
        placeholder: 'Karena …',
      },
      {
        id: 'r2',
        teks: 'Strategi mana yang paling kamu sukai, dan kapan strategi itu TIDAK bisa dipakai?',
        placeholder: 'Aku suka strategi … tetapi tidak bisa dipakai ketika …',
      },
      {
        id: 'r3',
        teks: 'Bagaimana tim kalian memastikan setiap nomor siap menjelaskan?',
        placeholder: 'Kami …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu membandingkan dan mengurutkan bilangan berpangkat bulat sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '🙂 Yakin — kadang masih perlu menghitung nilainya' },
      { id: 'ragu', label: '🤔 Masih ragu pada pangkat negatif atau basis negatif' },
      { id: 'bantuan', label: '🆘 Masih butuh bantuan' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Misi Selesai!',
    teks: 'Kalian sudah membandingkan dan mengurutkan bilangan berpangkat bulat — bersama-sama.',
    capaian: [
      'Memilih strategi: basis sama, pangkat sama, samakan basis, atau hitung nilai/patokan 1.',
      'Menuliskan lambang <, >, = beserta alasannya dan memaknainya dalam konteks.',
      'Mengurutkan bilangan berpangkat bulat positif, nol, dan negatif secara naik maupun turun.',
      'Mengenali dan memperbaiki miskonsepsi, seperti "pangkat negatif berarti bilangan negatif".',
    ],
  },
};
