'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Asosiasi Dua Variabel — Tabel Kontingensi &
   Diagram Pencar
   Fase F — SMK Rekayasa Perangkat Lunak (Kelas XII)
   Topik 11 · Penyelidikan Statistika

   Tujuan Pembelajaran:
   Mengidentifikasi asosiasi antara dua variabel kategorikal dan
   numerikal melalui tabel kontingensi dan diagram pencar pada data
   nyata.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ............ tahap 'stimulasi'
     Sintaks 2 — Problem statement ...... tahap 'masalah'
     Sintaks 3 — Data collection ........ tahap 'koleksiKategori' & 'koleksiNumerik'
     Sintaks 4 — Data processing ........ tahap 'olah'
     Sintaks 5 — Verification ........... tahap 'verifikasi'
     Sintaks 6 — Generalization ......... tahap 'generalisasi'
     Penerapan & penutup ................ 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 45 menit, murid berpasangan):
     1. Stimulasi   (7')  — mading digital sekolah memuat dua klaim:
                            ekskul coding ↔ lulus sertifikasi, dan lama
                            latihan mengetik ↔ kecepatan mengetik; murid
                            melihat cuplikan lembar survei mentah lalu
                            MENDUGA apakah klaim didukung (tidak dinilai).
     2. Masalah     (8')  — memilih rumusan masalah (pertanyaan penuntun
                            berumpan balik), memilah enam variabel menjadi
                            kategorikal/numerik, menulis hipotesis.
     3. Data A      (12') — penghitung turus: 20 kartu data siswa ditandai
                            satu per satu lalu dihitung ke tabel
                            kontingensi 2 × 2 beserta totalnya; setelah
                            benar, tabel lengkap 80 siswa ditampilkan.
     4. Data B      (12') — plotter diagram pencar: 8 pasangan data
                            diplot sendiri (klik/ketuk atau keyboard) dengan
                            diagnosa sumbu tertukar; lalu diagram pencar
                            lengkap 24 siswa ditampilkan.
     5. Olah data   (15') — menghitung persen baris, membandingkan tampilan
                            frekuensi ↔ persen dan batang tersegmen 100%;
                            mengamati arah & kerapatan titik dengan garis
                            tren; pertanyaan penuntun.
     6. Pembuktian  (15') — membandingkan dugaan awal dengan data; memilah
                            4 diagram pencar & 3 tabel kontingensi (ada
                            jebakan frekuensi mentah); menilai 4 pernyataan
                            miskonsepsi; Lab Data Kelas (opsional) untuk
                            data nyata yang dikumpulkan di kelas.
     7. Simpulan    (6')  — menyusun kesimpulan dari bank kalimat acak.
     8. Uji terap   (10') — delapan soal konteks RPL (isian & pilihan).
     9. Refleksi    (5')  — rekap, refleksi tertulis, penilaian diri.

   Metadata `cek` pada soal dipakai tes untuk memeriksa kunci jawaban
   dengan fungsi shared/engine.js seksi 33 (bukan disalin manual).

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan, sehingga tiap
   murid (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var DL = 'Discovery Learning';

/* Kategori variabel survei. */
var KAT_EKSKUL = [
  { id: 'ya', label: 'Ikut ekskul coding' },
  { id: 'tidak', label: 'Tidak ikut' },
];
var KAT_SERT = [
  { id: 'lulus', label: 'Lulus sertifikasi' },
  { id: 'belum', label: 'Belum lulus' },
];
var KAT_YA_TIDAK = [
  { id: 'ya', label: 'Ya' },
  { id: 'tidak', label: 'Tidak' },
];

/* Pilihan arah asosiasi untuk diagram pencar. */
var OPSI_ARAH = [
  { id: 'positif', label: 'Asosiasi positif' },
  { id: 'negatif', label: 'Asosiasi negatif' },
  { id: 'tidak', label: 'Tidak ada asosiasi' },
];

/* Pilihan dugaan klaim (tidak dinilai). */
function opsiDugaan() {
  return [
    { id: 'didukung', label: 'Klaim ini didukung data' },
    { id: 'tidak', label: 'Klaim ini tidak didukung data' },
    { id: 'terbalik', label: 'Data justru menunjukkan kebalikannya' },
    { id: 'ragu', label: 'Belum bisa dipastikan sebelum data diolah' },
  ];
}

var DATA = {
  meta: {
    title: 'Asosiasi Dua Variabel: Tabel Kontingensi & Diagram Pencar',
    goal: 'Mengidentifikasi asosiasi antara dua variabel kategorikal dan numerikal melalui tabel kontingensi dan diagram pencar pada data nyata.',
  },

  /* Urutan & label tahap (dipakai app.js dan dicek terhadap manifest). */
  tahap: [
    { id: 'stimulasi', label: 'Stimulasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'koleksiKategori', label: 'Data Kategori' },
    { id: 'koleksiNumerik', label: 'Data Numerik' },
    { id: 'olah', label: 'Olah Data' },
    { id: 'verifikasi', label: 'Pembuktian' },
    { id: 'generalisasi', label: 'Simpulan' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Dataset survei siswa kelas XII RPL (dipakai lintas tahap). */
  survei: {
    judul: 'Survei Siswa XII RPL SMK Nusantara',
    ekskul: { key: 'ekskul', label: 'Ekskul coding', kategori: KAT_EKSKUL },
    sertifikasi: { key: 'sert', label: 'Sertifikasi', kategori: KAT_SERT },
    /* Frekuensi sel seluruh responden (80 siswa): baris ekskul, kolom sertifikasi. */
    sel: [
      [24, 6],
      [20, 30],
    ],
    /* 20 kartu data untuk dihitung sendiri (turus). */
    kartu: [
      { id: 'k01', nama: 'Ani', ekskul: 'ya', sert: 'lulus' },
      { id: 'k02', nama: 'Bima', ekskul: 'tidak', sert: 'belum' },
      { id: 'k03', nama: 'Citra', ekskul: 'tidak', sert: 'lulus' },
      { id: 'k04', nama: 'Dimas', ekskul: 'ya', sert: 'lulus' },
      { id: 'k05', nama: 'Eka', ekskul: 'tidak', sert: 'belum' },
      { id: 'k06', nama: 'Fajar', ekskul: 'ya', sert: 'belum' },
      { id: 'k07', nama: 'Gita', ekskul: 'ya', sert: 'lulus' },
      { id: 'k08', nama: 'Hana', ekskul: 'tidak', sert: 'belum' },
      { id: 'k09', nama: 'Irfan', ekskul: 'tidak', sert: 'lulus' },
      { id: 'k10', nama: 'Joko', ekskul: 'tidak', sert: 'belum' },
      { id: 'k11', nama: 'Kirana', ekskul: 'ya', sert: 'lulus' },
      { id: 'k12', nama: 'Lutfi', ekskul: 'tidak', sert: 'belum' },
      { id: 'k13', nama: 'Maya', ekskul: 'tidak', sert: 'lulus' },
      { id: 'k14', nama: 'Nanda', ekskul: 'ya', sert: 'lulus' },
      { id: 'k15', nama: 'Oki', ekskul: 'tidak', sert: 'belum' },
      { id: 'k16', nama: 'Putri', ekskul: 'ya', sert: 'belum' },
      { id: 'k17', nama: 'Rafi', ekskul: 'tidak', sert: 'lulus' },
      { id: 'k18', nama: 'Salsa', ekskul: 'ya', sert: 'lulus' },
      { id: 'k19', nama: 'Tegar', ekskul: 'tidak', sert: 'belum' },
      { id: 'k20', nama: 'Umi', ekskul: 'tidak', sert: 'lulus' },
    ],
    /* Latihan mengetik (jam/minggu) vs kecepatan mengetik (kata/menit). */
    xLabel: 'Latihan mengetik (jam/minggu)',
    yLabel: 'Kecepatan mengetik (kata/menit)',
    satuanX: 'jam',
    satuanY: 'kpm',
    sumbuX: { min: 0, max: 10, step: 1 },
    sumbuY: { min: 0, max: 70, step: 5 },
    /* 8 titik yang diplot sendiri oleh murid (kelipatan langkah sumbu). */
    plot: [
      { id: 'p1', label: 'Ani', x: 1, y: 25 },
      { id: 'p2', label: 'Bima', x: 2, y: 30 },
      { id: 'p3', label: 'Citra', x: 3, y: 30 },
      { id: 'p4', label: 'Dimas', x: 4, y: 40 },
      { id: 'p5', label: 'Eka', x: 5, y: 45 },
      { id: 'p6', label: 'Fajar', x: 6, y: 45 },
      { id: 'p7', label: 'Gita', x: 7, y: 55 },
      { id: 'p8', label: 'Hana', x: 9, y: 60 },
    ],
    /* 16 titik responden lain (ditampilkan setelah plot selesai). */
    lainnya: [
      { id: 'n01', x: 0, y: 20 },
      { id: 'n02', x: 0, y: 28 },
      { id: 'n03', x: 1, y: 22 },
      { id: 'n04', x: 2, y: 35 },
      { id: 'n05', x: 3, y: 38 },
      { id: 'n06', x: 3, y: 27 },
      { id: 'n07', x: 4, y: 33 },
      { id: 'n08', x: 5, y: 38 },
      { id: 'n09', x: 5, y: 50 },
      { id: 'n10', x: 6, y: 52 },
      { id: 'n11', x: 7, y: 48 },
      { id: 'n12', x: 8, y: 50 },
      { id: 'n13', x: 8, y: 62 },
      { id: 'n14', x: 9, y: 57 },
      { id: 'n15', x: 10, y: 65 },
      { id: 'n16', x: 10, y: 58 },
    ],
    /* Kunci tahap olah & verifikasi (dicek tes terhadap engine). */
    asosiasiKategori: 'ada',
    arahNumerik: 'positif',
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati dua klaim di mading sekolah beserta lembar data mentahnya, lalu menduga apakah klaim itu didukung data.',
    tp: 'Mengidentifikasi asosiasi antara dua variabel kategorikal dan numerikal melalui tabel kontingensi dan diagram pencar pada data nyata.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Membedakan variabel kategorikal dan numerik.',
      'Menyusun tabel kontingensi dan membandingkan persen baris.',
      'Memplot diagram pencar dan membaca arah serta kerapatan pola titik.',
      'Membedakan asosiasi dengan sebab-akibat.',
    ],
    guru: 'Bacakan kedua klaim dengan nada "berita viral". Tanyakan: <em>"Bagaimana kita tahu klaim ini benar?"</em> Biarkan murid menduga tanpa menghitung. Jangan membenarkan atau menyalahkan — dugaan akan diuji sendiri di tahap Pembuktian.',
    judul: 'Mading Digital XII RPL',
    cerita:
      'OSIS memasang dua klaim di mading digital sekolah. Klaim itu diambil dari survei 80 siswa kelas XII RPL. Berikut cuplikan lembar surveinya.',
    klaim: [
      {
        id: 'klaimA',
        ikon: '🏅',
        teks: '“Siswa yang ikut ekskul coding lebih mungkin lulus sertifikasi dibanding yang tidak ikut.”',
        tanya: 'Dugaanmu tentang klaim ekskul coding:',
        opsi: opsiDugaan(),
      },
      {
        id: 'klaimB',
        ikon: '⌨️',
        teks: '“Makin lama berlatih mengetik setiap minggu, makin cepat kecepatan mengetiknya.”',
        tanya: 'Dugaanmu tentang klaim latihan mengetik:',
        opsi: opsiDugaan(),
      },
    ],
    /* Cuplikan lembar survei mentah (8 baris pertama). */
    kolomLembar: [
      'Nama',
      'Ekskul coding',
      'Sertifikasi',
      'Latihan (jam/minggu)',
      'Kecepatan (kpm)',
    ],
    lembar: [
      ['Ani', 'Ya', 'Lulus', 1, 25],
      ['Bima', 'Tidak', 'Belum', 2, 30],
      ['Citra', 'Tidak', 'Lulus', 3, 30],
      ['Dimas', 'Ya', 'Lulus', 4, 40],
      ['Eka', 'Tidak', 'Belum', 5, 45],
      ['Fajar', 'Ya', 'Belum', 6, 45],
      ['Gita', 'Ya', 'Lulus', 7, 55],
      ['Hana', 'Tidak', 'Belum', 9, 60],
    ],
    alasanLabel:
      'Mengapa kamu menduga begitu? Apa yang sulit dari membaca data mentah seperti ini?',
    alasanPlaceholder: 'Contoh: aku melihat … tetapi sulit karena …',
    catatan: 'Dugaanmu tidak dinilai. Kamu akan membuktikannya sendiri dengan data.',
    nextLabel: 'Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan penyelidikan dan mengenali jenis variabel yang diselidiki.',
    guru: 'Tekankan kata <strong>asosiasi</strong>: dua variabel berasosiasi bila nilai/kategori yang satu cenderung berkaitan dengan nilai/kategori yang lain. Saat memilah variabel, minta murid menyebut contoh nilainya — kategori berupa label, numerik berupa bilangan hasil mengukur/menghitung.',
    pengantar:
      'Klaim di mading belum tentu benar. Agar bisa diuji, kita perlu pertanyaan penyelidikan yang jelas dan tahu jenis data apa yang dimiliki.',
    pertanyaan: {
      id: 'rumusan',
      tanya: 'Rumusan masalah manakah yang paling tepat untuk menguji kedua klaim di mading?',
      opsi: [
        {
          id: 'tepat',
          label:
            'Apakah terdapat asosiasi antara ikut ekskul coding dan status sertifikasi, serta antara lama latihan mengetik dan kecepatan mengetik?',
        },
        { id: 'rerata', label: 'Berapa rata-rata kecepatan mengetik siswa XII RPL?' },
        { id: 'sebab', label: 'Apakah ekskul coding membuat semua siswa pasti lulus sertifikasi?' },
        { id: 'banyak', label: 'Berapa banyak siswa yang ikut ekskul coding?' },
      ],
      correct: 'tepat',
      umpan: {
        tepat:
          'Tepat! Pertanyaan ini menyelidiki <strong>hubungan dua variabel</strong> pada kedua klaim sekaligus dan bisa dijawab dengan data survei.',
        rerata:
          'Rata-rata hanya menggambarkan <em>satu</em> variabel. Klaim di mading membicarakan hubungan <em>dua</em> variabel.',
        sebab:
          'Kata "membuat" dan "pasti" berarti sebab-akibat mutlak. Data survei hanya dapat menunjukkan apakah ada <em>kecenderungan</em> (asosiasi).',
        banyak:
          'Itu hanya menghitung satu kategori. Kita perlu melihat kaitan ekskul dengan sertifikasi.',
      },
    },
    pilahInstruksi: 'Pilah setiap variabel: kategorikal atau numerik?',
    opsiJenis: [
      { id: 'kategorikal', label: 'Kategorikal' },
      { id: 'numerik', label: 'Numerik' },
    ],
    variabel: [
      {
        id: 'v1',
        teks: 'Ikut ekskul coding (Ya / Tidak)',
        correct: 'kategorikal',
        explanation: 'Nilainya berupa label kelompok, bukan hasil mengukur.',
      },
      {
        id: 'v2',
        teks: 'Status sertifikasi (Lulus / Belum)',
        correct: 'kategorikal',
        explanation: 'Nilainya berupa kategori “Lulus” atau “Belum”.',
      },
      {
        id: 'v3',
        teks: 'Lama latihan mengetik (jam per minggu)',
        correct: 'numerik',
        explanation:
          'Nilainya bilangan hasil mengukur waktu, bisa dijumlah atau dibandingkan besarnya.',
      },
      {
        id: 'v4',
        teks: 'Kecepatan mengetik (kata per menit)',
        correct: 'numerik',
        explanation: 'Nilainya bilangan hasil mengukur, mis. 45 kata per menit.',
      },
      {
        id: 'v5',
        teks: 'Konsentrasi favorit (Web / Mobile / Game)',
        correct: 'kategorikal',
        explanation: 'Walaupun ada tiga pilihan, nilainya tetap label kategori.',
      },
      {
        id: 'v6',
        teks: 'Nilai ujian kompetensi (0–100)',
        correct: 'numerik',
        explanation: 'Nilainya bilangan yang bisa diurutkan dan dihitung selisihnya.',
      },
    ],
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu, apakah kedua pasangan variabel itu berasosiasi? Seperti apa bentuknya?',
    hipotesisPlaceholder: 'Contoh: aku menduga siswa yang ikut ekskul … dan makin lama latihan …',
    minPanjang: 15,
    nextLabel: 'Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA A (kategorikal)
     ---------------------------------------------------------- */
  koleksiKategori: {
    kicker: 'Tahap 3 · Pengumpulan Data (A)',
    syntax: DL + ' · Sintaks 3',
    goal: 'Merangkum data dua variabel kategorikal ke dalam tabel kontingensi.',
    guru: 'Sarankan murid bekerja berpasangan: satu membaca kartu, satu menulis turus di kertas. Tunjukkan bahwa setiap siswa masuk <em>tepat satu</em> sel. Setelah benar, jelaskan istilah <strong>tabel kontingensi</strong> dan totalnya.',
    pengantar:
      'Berikut 20 kartu data siswa. Setiap siswa punya dua kategori: ekskul coding dan status sertifikasi. Ketuk kartu yang sudah kamu hitung agar tidak terhitung dua kali.',
    turusLabel: 'Kartu data siswa',
    tabelInstruksi:
      'Isi tabel kontingensi: berapa siswa pada setiap pasangan kategori? Lengkapi juga totalnya.',
    judulBaris: 'Ekskul coding',
    judulKolom: 'Sertifikasi',
    hints: [
      'Hitung dulu kartu yang “Ikut ekskul coding” <em>dan</em> “Lulus sertifikasi”.',
      'Total baris = jumlah sel pada baris itu. Total semua harus sama dengan banyak kartu (20).',
    ],
    temuan:
      'Tabel kontingensi merangkum <strong>frekuensi setiap pasangan kategori</strong> dari dua variabel kategorikal. Data mentah yang panjang menjadi jauh lebih mudah dibaca.',
    lengkapJudul: 'Tabel lengkap seluruh responden (80 siswa)',
    lengkapCatatan:
      'Kamu tadi menghitung 20 kartu. Tim OSIS melakukan hal yang sama untuk seluruh 80 responden.',
    nextLabel: 'Data Numerik →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENGUMPULAN DATA B (numerik)
     ---------------------------------------------------------- */
  koleksiNumerik: {
    kicker: 'Tahap 4 · Pengumpulan Data (B)',
    syntax: DL + ' · Sintaks 3',
    goal: 'Menyajikan data dua variabel numerik berpasangan sebagai titik-titik pada diagram pencar.',
    guru: 'Sebelum memplot, tanyakan: "Variabel mana yang di sumbu mendatar?" Tekankan bahwa <strong>satu siswa = satu titik (x, y)</strong>. Amati murid yang menukar x dan y — media akan memberi tahu.',
    pengantar:
      'Setiap siswa punya dua bilangan: lama latihan mengetik (x) dan kecepatan mengetik (y). Plot data 8 siswa berikut satu per satu pada diagram pencar.',
    temuan:
      'Diagram pencar menampilkan <strong>setiap pasangan data numerik sebagai satu titik</strong>. Pola sebaran titik-titik itulah yang akan kita baca.',
    lengkapJudul: 'Diagram pencar seluruh 24 siswa yang mengisi data latihan',
    lengkapCatatan: 'Titik oranye adalah 8 titik yang kamu plot sendiri.',
    nextLabel: 'Olah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENGOLAHAN DATA
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 5 · Pengolahan Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Mengolah tabel kontingensi menjadi persen baris dan membaca arah serta kerapatan pola diagram pencar.',
    guru: 'Bagian A: biarkan murid merasakan dulu bahwa 24 vs 20 "hampir sama", lalu ajak menghitung persen. Tanyakan mengapa pembandingnya 30 dan 50, bukan 80. Bagian B: nyalakan garis tren bersama-sama dan minta murid menggambarkan arahnya dengan gerakan tangan.',
    judulA: 'A. Tabel kontingensi: frekuensi atau persen?',
    pengantarA:
      'Jika hanya melihat frekuensi, siswa yang lulus adalah 24 (ikut ekskul) dan 20 (tidak ikut) — hampir sama. Tetapi banyak siswa di kedua kelompok berbeda. Hitung persennya.',
    langkahPersen: [
      {
        label:
          'Dari 30 siswa yang <strong>ikut ekskul</strong>, 24 lulus sertifikasi. Berapa persen?',
        jawab: 80,
        cek: { baris: 0, kolom: 0 },
        hints: ['Persen = 24 ÷ 30 × 100%.'],
        temuan: '24 ÷ 30 × 100% = <strong>80%</strong> siswa yang ikut ekskul lulus sertifikasi.',
      },
      {
        label:
          'Dari 50 siswa yang <strong>tidak ikut</strong> ekskul, 20 lulus sertifikasi. Berapa persen?',
        jawab: 40,
        cek: { baris: 1, kolom: 0 },
        hints: ['Persen = 20 ÷ 50 × 100%.'],
        temuan:
          '20 ÷ 50 × 100% = <strong>40%</strong> siswa yang tidak ikut ekskul lulus sertifikasi.',
      },
    ],
    modeFrekuensi: 'Tampilkan frekuensi',
    modePersen: 'Tampilkan persen baris',
    tanyaKategori: [
      {
        id: 'qMentah',
        tanya: 'Mengapa membandingkan frekuensi 24 dengan 20 secara langsung bisa menyesatkan?',
        opsi: [
          {
            id: 'ukuran',
            label:
              'Banyak siswa di kedua kelompok berbeda (30 vs 50), jadi perlu dibandingkan dengan persen dari kelompoknya masing-masing.',
          },
          {
            id: 'kecil',
            label: 'Karena selisih 4 terlalu kecil sehingga pasti tidak ada hubungan.',
          },
          {
            id: 'total',
            label: 'Karena seharusnya setiap sel dibagi total seluruh siswa (80).',
          },
          { id: 'tidak', label: 'Tidak menyesatkan; 24 > 20 sudah cukup menjadi bukti.' },
        ],
        correct: 'ukuran',
        umpan: {
          ukuran:
            'Tepat! Kelompok yang lebih besar wajar punya frekuensi lebih besar. <strong>Persen baris</strong> membuat perbandingan menjadi adil.',
          kecil:
            'Selisih frekuensi tidak bisa dinilai tanpa melihat ukuran kelompok. Ingat: 24 dari 30, tetapi 20 dari 50.',
          total:
            'Membagi dengan 80 hanya memberi porsi dari seluruh siswa. Untuk membandingkan kelompok, bagi dengan total <em>baris</em> masing-masing.',
          tidak: 'Coba perhatikan: kelompok tidak ikut ekskul jauh lebih besar (50 siswa).',
        },
      },
      {
        id: 'qArti',
        tanya: 'Persen lulus 80% (ikut ekskul) dan 40% (tidak ikut). Apa artinya?',
        opsi: [
          {
            id: 'ada',
            label:
              'Persen lulus kedua kelompok berbeda jauh, jadi ada asosiasi antara ikut ekskul coding dan status sertifikasi.',
          },
          { id: 'tidak', label: 'Tidak ada asosiasi karena di kedua kelompok ada yang lulus.' },
          { id: 'sebab', label: 'Ekskul coding pasti menjadi penyebab siswa lulus sertifikasi.' },
          { id: 'sama', label: 'Kedua kelompok sama saja karena banyak yang lulus hampir sama.' },
        ],
        correct: 'ada',
        umpan: {
          ada: 'Benar! Perbedaan persen baris sebesar 40 poin menunjukkan <strong>asosiasi</strong>: kategori ekskul berkaitan dengan peluang lulus.',
          tidak:
            'Asosiasi tidak dilihat dari "ada yang lulus atau tidak", tetapi dari apakah persennya berbeda antar-kelompok.',
          sebab:
            'Asosiasi belum membuktikan sebab-akibat. Bisa jadi siswa yang memang rajin cenderung ikut ekskul <em>dan</em> lulus.',
          sama: 'Itu jebakan frekuensi mentah. Bandingkan persennya: 80% vs 40%.',
        },
      },
      {
        id: 'qTidak',
        tanya: 'Kapan dua variabel kategorikal dikatakan TIDAK berasosiasi?',
        opsi: [
          { id: 'persenSama', label: 'Jika persen baris setiap kelompok (hampir) sama.' },
          { id: 'frekSama', label: 'Jika frekuensi semua sel sama besar.' },
          { id: 'totalSama', label: 'Jika total setiap baris sama besar.' },
          { id: 'adaNol', label: 'Jika ada sel yang frekuensinya 0.' },
        ],
        correct: 'persenSama',
        umpan: {
          persenSama:
            'Tepat! Jika komposisinya sama di setiap kelompok, mengetahui kategori yang satu tidak memberi petunjuk tentang kategori yang lain.',
          frekSama:
            'Frekuensi sel bisa berbeda walau tidak ada asosiasi, misalnya 30–30 dan 10–10. Yang menentukan adalah persennya.',
          totalSama:
            'Total baris hanya ukuran kelompok, tidak memberi tahu hubungan kedua variabel.',
          adaNol: 'Sel bernilai 0 justru sering menandakan asosiasi yang kuat.',
        },
      },
    ],
    judulB: 'B. Diagram pencar: ke mana arah titik-titiknya?',
    pengantarB:
      'Amati diagram pencar 24 siswa. Nyalakan garis tren untuk membantu melihat kecenderungan umumnya.',
    trenLabel: 'Tampilkan garis tren',
    tanyaNumerik: [
      {
        id: 'qArah',
        tanya: 'Ketika lama latihan mengetik bertambah, kecepatan mengetik cenderung …',
        opsi: [
          { id: 'naik', label: 'ikut naik' },
          { id: 'turun', label: 'turun' },
          { id: 'tetap', label: 'tetap sama' },
          { id: 'acak', label: 'berubah acak tanpa pola' },
        ],
        correct: 'naik',
        umpan: {
          naik: 'Benar! Titik-titik cenderung naik dari kiri bawah ke kanan atas. Pola ini disebut <strong>asosiasi positif</strong>.',
          turun:
            'Perhatikan: titik di kanan (latihan lama) berada lebih tinggi, bukan lebih rendah.',
          tetap: 'Jika tetap, titik-titik akan membentuk garis mendatar. Coba nyalakan garis tren.',
          acak: 'Memang tidak semua titik lurus, tetapi ada kecenderungan umum yang jelas. Nyalakan garis tren.',
        },
      },
      {
        id: 'qRapat',
        tanya: 'Bagaimana sebaran titik-titik terhadap garis tren?',
        opsi: [
          {
            id: 'rapat',
            label: 'Cukup rapat di sekitar garis yang naik, jadi asosiasi positifnya kuat.',
          },
          { id: 'menyebar', label: 'Menyebar ke segala arah, jadi tidak ada asosiasi.' },
          {
            id: 'turunRapat',
            label: 'Rapat di sekitar garis yang turun, jadi asosiasinya negatif kuat.',
          },
          {
            id: 'tepat',
            label: 'Semua titik tepat di garis, jadi setiap siswa pasti mengikuti rumus.',
          },
        ],
        correct: 'rapat',
        umpan: {
          rapat:
            'Tepat! Makin rapat titik mengikuti suatu garis, makin <strong>kuat</strong> asosiasinya. Makin menyebar, makin lemah.',
          menyebar: 'Sebagian besar titik justru dekat dengan garis tren yang naik.',
          turunRapat: 'Garis trennya naik, bukan turun.',
          tepat:
            'Tidak semua titik tepat di garis (mis. ada siswa 3 jam dengan 38 kpm). Data nyata hampir selalu bervariasi.',
        },
      },
      {
        id: 'qNegatif',
        tanya: 'Lalu, seperti apa diagram pencar yang menunjukkan asosiasi NEGATIF?',
        opsi: [
          {
            id: 'turun',
            label: 'Titik-titik cenderung turun: jika x bertambah, y cenderung berkurang.',
          },
          { id: 'kiri', label: 'Titik-titik berkumpul di sebelah kiri diagram.' },
          { id: 'minus', label: 'Titik-titik memiliki koordinat bernilai negatif.' },
          { id: 'sedikit', label: 'Banyak titiknya sedikit, kurang dari 10.' },
        ],
        correct: 'turun',
        umpan: {
          turun: 'Benar! Asosiasi negatif: titik cenderung turun dari kiri atas ke kanan bawah.',
          kiri: 'Letak kumpulan titik bukan penentu arah asosiasi. Perhatikan kecenderungan naik/turunnya.',
          minus:
            'Negatif di sini menunjukkan <em>arah</em> hubungan, bukan tanda bilangan pada koordinat.',
          sedikit: 'Banyak titik tidak menentukan arah asosiasi.',
        },
      },
    ],
    nextLabel: 'Buktikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Membuktikan dugaan awal dengan data dan menguji pemahaman pada data lain, termasuk data nyata kelas.',
    guru: 'Diskusikan bagian A secara klasikal: dugaan mana yang berubah setelah melihat data? Pada bagian C, beri waktu murid menghitung persen baris sendiri (boleh dengan kalkulator). Lab Data Kelas: kumpulkan data nyata sederhana dari kelas (mis. tinggi badan & rentang lengan dengan meteran), masukkan bersama di layar, lalu minta murid menafsirkan polanya.',
    judulA: 'A. Bandingkan dugaan awal dengan data',
    dataKlaim: {
      klaimA:
        'Persen lulus: 80% (ikut ekskul) vs 40% (tidak ikut). Ada asosiasi — klaim didukung data.',
      klaimB:
        'Titik-titik cenderung naik dan cukup rapat: asosiasi positif yang kuat — klaim didukung data.',
    },
    kunciKlaim: { klaimA: 'didukung', klaimB: 'didukung' },
    judulB: 'B. Pilah diagram pencar berikut',
    pencar: [
      {
        id: 'd1',
        judul: 'Ukuran file (MB) vs waktu unduh (detik)',
        xLabel: 'Ukuran file (MB)',
        yLabel: 'Waktu unduh (detik)',
        titik: [
          { x: 5, y: 3 },
          { x: 10, y: 5 },
          { x: 20, y: 9 },
          { x: 25, y: 11 },
          { x: 30, y: 14 },
          { x: 40, y: 16 },
          { x: 50, y: 21 },
          { x: 60, y: 24 },
          { x: 75, y: 31 },
          { x: 80, y: 33 },
          { x: 90, y: 36 },
          { x: 100, y: 41 },
        ],
        correct: 'positif',
        explanation: 'Makin besar file, makin lama waktu unduhnya: titik naik rapat.',
      },
      {
        id: 'd2',
        judul: 'Banyak tab browser terbuka vs RAM tersisa (GB)',
        xLabel: 'Tab terbuka',
        yLabel: 'RAM tersisa (GB)',
        titik: [
          { x: 2, y: 6.5 },
          { x: 4, y: 6 },
          { x: 5, y: 5.8 },
          { x: 6, y: 5.2 },
          { x: 8, y: 4.8 },
          { x: 10, y: 4.1 },
          { x: 12, y: 3.5 },
          { x: 14, y: 3.2 },
          { x: 15, y: 2.9 },
          { x: 16, y: 2.4 },
          { x: 18, y: 2.1 },
          { x: 20, y: 1.4 },
        ],
        correct: 'negatif',
        explanation: 'Makin banyak tab, RAM tersisa makin sedikit: titik turun.',
      },
      {
        id: 'd3',
        judul: 'Nomor absen vs nilai ujian kompetensi',
        xLabel: 'Nomor absen',
        yLabel: 'Nilai ujian',
        titik: [
          { x: 1, y: 78 },
          { x: 2, y: 65 },
          { x: 3, y: 90 },
          { x: 4, y: 72 },
          { x: 5, y: 84 },
          { x: 6, y: 60 },
          { x: 7, y: 88 },
          { x: 8, y: 70 },
          { x: 9, y: 75 },
          { x: 10, y: 92 },
          { x: 11, y: 63 },
          { x: 12, y: 81 },
          { x: 13, y: 69 },
          { x: 14, y: 86 },
          { x: 15, y: 74 },
          { x: 16, y: 67 },
        ],
        correct: 'tidak',
        explanation:
          'Titik menyebar tanpa arah naik atau turun; nomor absen tidak berkaitan dengan nilai.',
      },
      {
        id: 'd4',
        judul: 'Lama main gim per hari (jam) vs nilai ujian',
        xLabel: 'Main gim (jam/hari)',
        yLabel: 'Nilai ujian',
        titik: [
          { x: 0, y: 85 },
          { x: 1, y: 88 },
          { x: 1, y: 75 },
          { x: 2, y: 80 },
          { x: 2, y: 70 },
          { x: 3, y: 78 },
          { x: 3, y: 65 },
          { x: 4, y: 72 },
          { x: 4, y: 60 },
          { x: 5, y: 68 },
          { x: 5, y: 58 },
          { x: 6, y: 62 },
          { x: 6, y: 74 },
          { x: 7, y: 55 },
          { x: 8, y: 60 },
        ],
        correct: 'negatif',
        explanation:
          'Titik cenderung turun walau cukup menyebar: asosiasi negatif, tetapi tidak sekuat diagram tab browser.',
      },
    ],
    judulC: 'C. Pilah tabel kontingensi berikut',
    opsiTabel: [
      { id: 'ada', label: 'Ada asosiasi' },
      { id: 'tidak', label: 'Tidak ada asosiasi' },
    ],
    tabel: [
      {
        id: 't1',
        judul: 'Sistem operasi HP vs hasil ujian kompetensi',
        judulBaris: 'OS HP',
        judulKolom: 'Hasil ujian',
        baris: [
          { id: 'android', label: 'Android' },
          { id: 'ios', label: 'iOS' },
        ],
        kolom: [
          { id: 'lulus', label: 'Lulus' },
          { id: 'belum', label: 'Belum' },
        ],
        sel: [
          [36, 12],
          [9, 3],
        ],
        correct: 'tidak',
        explanation:
          'Android: 36 dari 48 = 75% lulus; iOS: 9 dari 12 = 75% lulus. Persennya sama, jadi tidak ada asosiasi.',
      },
      {
        id: 't2',
        judul: 'Latihan soal daring vs ketuntasan materi',
        judulBaris: 'Latihan daring',
        judulKolom: 'Ketuntasan',
        baris: [
          { id: 'rutin', label: 'Rutin' },
          { id: 'jarang', label: 'Jarang' },
        ],
        kolom: [
          { id: 'tuntas', label: 'Tuntas' },
          { id: 'belum', label: 'Belum' },
        ],
        sel: [
          [27, 3],
          [12, 18],
        ],
        correct: 'ada',
        explanation:
          'Rutin: 27 dari 30 = 90% tuntas; jarang: 12 dari 30 = 40% tuntas. Berbeda jauh → ada asosiasi.',
      },
      {
        id: 't3',
        judul: 'Sif belajar vs pernah terlambat mengumpulkan tugas',
        judulBaris: 'Sif',
        judulKolom: 'Terlambat mengumpulkan',
        baris: [
          { id: 'pagi', label: 'Pagi' },
          { id: 'siang', label: 'Siang' },
        ],
        kolom: [
          { id: 'pernah', label: 'Pernah' },
          { id: 'tidak', label: 'Tidak pernah' },
        ],
        sel: [
          [30, 30],
          [10, 10],
        ],
        correct: 'tidak',
        explanation:
          'Jebakan! Frekuensi 30 vs 10 berbeda jauh, tetapi persennya sama-sama 50%. Tidak ada asosiasi.',
      },
    ],
    judulD: 'D. Benar atau salah?',
    opsiPernyataan: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 's1',
        teks: 'Jika dua variabel berasosiasi, pasti variabel yang satu menyebabkan variabel yang lain.',
        correct: 'salah',
        explanation:
          'Asosiasi ≠ sebab-akibat. Keduanya bisa dipengaruhi faktor lain, mis. kerajinan belajar.',
      },
      {
        id: 's2',
        teks: 'Jika ukuran kelompok berbeda, bandingkan persen baris, bukan frekuensi mentahnya.',
        correct: 'benar',
        explanation:
          'Persen baris membuat kelompok besar dan kecil dapat dibandingkan secara adil.',
      },
      {
        id: 's3',
        teks: 'Satu titik pencilan pada diagram pencar tidak otomatis menghapus pola umum sekumpulan data.',
        correct: 'benar',
        explanation:
          'Asosiasi adalah kecenderungan umum; satu titik yang menyimpang tidak membatalkannya.',
      },
      {
        id: 's4',
        teks: 'Diagram pencar tepat dipakai untuk melihat asosiasi antara jenis kelamin dan pilihan ekskul.',
        correct: 'salah',
        explanation:
          'Keduanya variabel kategorikal, jadi yang tepat adalah tabel kontingensi. Diagram pencar untuk dua variabel numerik.',
      },
    ],
    judulE: 'E. Lab Data Kelas (data nyata kelasmu)',
    pengantarE:
      'Kumpulkan data nyata dari teman sekelasmu, lalu masukkan di sini. Contoh: ukur tinggi badan dan rentang lengan (ujung jari kiri–kanan saat tangan direntangkan), atau tanyakan "punya laptop di rumah?" dan "pernah membuat program di luar tugas sekolah?".',
    labNumerik: { xLabel: 'Tinggi badan (cm)', yLabel: 'Rentang lengan (cm)' },
    labKategori: {
      a: { label: 'Punya laptop di rumah', kategori: KAT_YA_TIDAK },
      b: { label: 'Pernah membuat program di luar tugas', kategori: KAT_YA_TIDAK },
    },
    labCatatanLabel: 'Apa yang kamu temukan dari data kelasmu? (opsional)',
    labCatatanPlaceholder: 'Contoh: titik-titiknya cenderung … jadi …',
    labOpsional: 'Lab ini opsional dan tidak dinilai. Datanya tersimpan di perangkat ini saja.',
    nextLabel: 'Susun Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — GENERALISASI
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Merumuskan cara mengidentifikasi asosiasi dua variabel kategorikal dan dua variabel numerik.',
    guru: 'Setelah kesimpulan tepat, minta satu pasangan menjelaskannya dengan contoh data kelas dari Lab Data Kelas. Tegaskan kembali bahwa asosiasi tidak sama dengan sebab-akibat.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai sekali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      {
        id: 'k1',
        awal: 'Asosiasi dua variabel kategorikal diselidiki dengan',
        correct: 'tabel',
      },
      {
        id: 'k2',
        awal: 'Pada tabel kontingensi, ada asosiasi bila',
        correct: 'persen',
      },
      {
        id: 'k3',
        awal: 'Asosiasi dua variabel numerik diselidiki dengan diagram pencar; asosiasi positif tampak bila',
        correct: 'naik',
      },
      {
        id: 'k4',
        awal: 'Asosiasi negatif tampak bila titik cenderung turun, sedangkan tidak ada asosiasi bila',
        correct: 'acak',
      },
      {
        id: 'k5',
        awal: 'Walaupun dua variabel berasosiasi,',
        correct: 'kausal',
      },
    ],
    bank: [
      { id: 'tabel', teks: 'tabel kontingensi yang memuat frekuensi setiap pasangan kategori.' },
      {
        id: 'persen',
        teks: 'persen baris antar-kelompok berbeda cukup jauh; bila (hampir) sama, tidak ada asosiasi.',
      },
      { id: 'naik', teks: 'titik-titik cenderung naik dari kiri bawah ke kanan atas.' },
      { id: 'acak', teks: 'titik-titik menyebar tanpa arah naik atau turun.' },
      {
        id: 'kausal',
        teks: 'belum tentu yang satu menyebabkan yang lain; perlu bukti lain untuk menyimpulkan sebab-akibat.',
      },
      {
        id: 'dFrek',
        teks: 'frekuensi mentah terbesar selalu menunjukkan kelompok yang lebih unggul.',
      },
      { id: 'dPencar', teks: 'diagram pencar dengan sumbu berisi nama-nama kategori.' },
      { id: 'dPasti', teks: 'berarti variabel yang satu pasti menyebabkan variabel yang lain.' },
    ],
    rangkuman: [
      '<strong>Kategorikal × kategorikal</strong> → tabel kontingensi → bandingkan <strong>persen baris</strong>.',
      '<strong>Numerik × numerik</strong> → diagram pencar → baca <strong>arah</strong> (naik/turun/tanpa pola) dan <strong>kerapatan</strong> titik.',
      'Asosiasi positif: naik bersama. Asosiasi negatif: yang satu naik, yang lain turun.',
      'Asosiasi hanya menunjukkan kecenderungan, <strong>bukan bukti sebab-akibat</strong>.',
    ],
    nextLabel: 'Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Mengidentifikasi asosiasi dua variabel dari tabel kontingensi dan diagram pencar pada konteks RPL.',
    guru: 'Murid mengerjakan mandiri. Perhatikan murid yang masih membandingkan frekuensi mentah atau menyimpulkan sebab-akibat; ajak mereka kembali ke persen baris dan kata "cenderung".',
    instruksi:
      'Kerjakan setiap soal. Jawaban isian berupa bilangan persen tanpa tanda %, gunakan koma untuk desimal (mis. 37,5).',
    soal: [
      {
        type: 'input',
        cerita:
          'Survei 65 siswa: apakah mereka memakai linter saat ngoding, dan apakah kodenya lolos code review pertama.',
        tabel: {
          judulBaris: 'Pakai linter',
          judulKolom: 'Code review',
          baris: KAT_YA_TIDAK,
          kolom: [
            { id: 'lolos', label: 'Lolos' },
            { id: 'revisi', label: 'Perlu revisi' },
          ],
          sel: [
            [32, 8],
            [10, 15],
          ],
        },
        pertanyaan: 'Berapa persen siswa <strong>pengguna linter</strong> yang kodenya lolos?',
        jawab: 80,
        satuan: '%',
        cek: { persenBaris: [0, 0] },
        hints: ['Pengguna linter ada 32 + 8 = 40 siswa.', 'Persen = 32 ÷ 40 × 100%.'],
        reveal: '<strong>80%</strong>, karena 32 ÷ 40 × 100% = 80%.',
      },
      {
        type: 'input',
        cerita: 'Masih dari survei linter yang sama.',
        tabel: {
          judulBaris: 'Pakai linter',
          judulKolom: 'Code review',
          baris: KAT_YA_TIDAK,
          kolom: [
            { id: 'lolos', label: 'Lolos' },
            { id: 'revisi', label: 'Perlu revisi' },
          ],
          sel: [
            [32, 8],
            [10, 15],
          ],
        },
        pertanyaan:
          'Berapa persen siswa yang <strong>tidak</strong> memakai linter yang kodenya lolos?',
        jawab: 40,
        satuan: '%',
        cek: { persenBaris: [1, 0] },
        hints: ['Yang tidak memakai linter ada 10 + 15 = 25 siswa.', 'Persen = 10 ÷ 25 × 100%.'],
        reveal: '<strong>40%</strong>, karena 10 ÷ 25 × 100% = 40%.',
      },
      {
        type: 'choice',
        cerita:
          'Dari survei linter: 80% pengguna linter lolos, sedangkan yang tidak memakai hanya 40%.',
        pertanyaan: 'Kesimpulan yang paling tepat adalah …',
        options: [
          {
            id: 'ada',
            label: 'Ada asosiasi: persen lolos pengguna linter 40 poin lebih tinggi.',
          },
          { id: 'frek', label: 'Tidak ada asosiasi karena banyak siswa kedua kelompok berbeda.' },
          { id: 'lolos', label: 'Tidak ada asosiasi karena di kedua kelompok ada yang lolos.' },
          { id: 'sebab', label: 'Linter pasti satu-satunya penyebab kode lolos review.' },
        ],
        correct: 'ada',
        cek: {
          sel: [
            [32, 8],
            [10, 15],
          ],
          asosiasi: 'ada',
        },
        explanation:
          'Persen baris 80% vs 40% berbeda jauh, jadi ada asosiasi. Tetapi asosiasi belum membuktikan linter satu-satunya penyebab.',
      },
      {
        type: 'choice',
        cerita:
          'Tim infrastruktur mencatat suhu ruang server dan kecepatan kipas pendingin setiap jam.',
        pencar: {
          xLabel: 'Suhu ruang (°C)',
          yLabel: 'Kipas (×100 rpm)',
          titik: [
            { x: 20, y: 8 },
            { x: 21, y: 9 },
            { x: 22, y: 11 },
            { x: 23, y: 10 },
            { x: 24, y: 13 },
            { x: 25, y: 14 },
            { x: 26, y: 14 },
            { x: 27, y: 17 },
            { x: 28, y: 18 },
            { x: 29, y: 19 },
            { x: 30, y: 21 },
          ],
        },
        pertanyaan: 'Jenis asosiasi pada diagram pencar tersebut adalah …',
        options: [
          { id: 'positif', label: 'Asosiasi positif' },
          { id: 'negatif', label: 'Asosiasi negatif' },
          { id: 'tidak', label: 'Tidak ada asosiasi' },
          { id: 'kategori', label: 'Tidak bisa ditentukan karena bukan tabel kontingensi' },
        ],
        correct: 'positif',
        cek: { arah: 'positif' },
        explanation:
          'Makin tinggi suhu, makin kencang kipas: titik naik dari kiri bawah ke kanan atas.',
      },
      {
        type: 'choice',
        cerita:
          'Seorang kreator konten mencatat panjang username dan jumlah pengikut 14 akun teman.',
        pencar: {
          xLabel: 'Panjang username (karakter)',
          yLabel: 'Pengikut (ratus)',
          titik: [
            { x: 5, y: 12 },
            { x: 6, y: 4 },
            { x: 7, y: 15 },
            { x: 8, y: 7 },
            { x: 8, y: 13 },
            { x: 9, y: 3 },
            { x: 10, y: 10 },
            { x: 11, y: 14 },
            { x: 12, y: 5 },
            { x: 12, y: 11 },
            { x: 13, y: 8 },
            { x: 14, y: 13 },
            { x: 15, y: 4 },
            { x: 16, y: 9 },
          ],
        },
        pertanyaan: 'Jenis asosiasi pada diagram pencar tersebut adalah …',
        options: [
          { id: 'positif', label: 'Asosiasi positif' },
          { id: 'negatif', label: 'Asosiasi negatif' },
          { id: 'tidak', label: 'Tidak ada asosiasi' },
          { id: 'kategori', label: 'Tidak bisa ditentukan karena bukan tabel kontingensi' },
        ],
        correct: 'tidak',
        cek: { arah: 'tidak' },
        explanation:
          'Titik menyebar tanpa arah naik atau turun: panjang username tidak berkaitan dengan jumlah pengikut.',
      },
      {
        type: 'choice',
        cerita:
          'Guru ingin menyelidiki apakah sistem operasi laptop siswa (Windows/Linux/macOS) berasosiasi dengan bahasa pemrograman favorit (Python/JavaScript/Java).',
        pertanyaan: 'Penyajian data yang paling tepat adalah …',
        options: [
          { id: 'tabel', label: 'Tabel kontingensi 3 × 3' },
          { id: 'pencar', label: 'Diagram pencar' },
          { id: 'garis', label: 'Diagram garis terhadap waktu' },
          { id: 'rerata', label: 'Rata-rata sistem operasi setiap bahasa' },
        ],
        correct: 'tabel',
        cek: { jenis: ['kategorikal', 'kategorikal'] },
        explanation:
          'Kedua variabel kategorikal, jadi disajikan dengan tabel kontingensi (3 kategori × 3 kategori).',
      },
      {
        type: 'choice',
        cerita:
          'Data 30 hari menunjukkan asosiasi positif antara banyak cangkir kopi yang diminum tim dan banyak bug yang ditemukan.',
        pertanyaan: 'Pernyataan yang paling tepat adalah …',
        options: [
          {
            id: 'asosiasi',
            label:
              'Ada asosiasi, tetapi belum tentu kopi penyebab bug; keduanya bisa dipengaruhi hal lain, mis. tenggat yang padat.',
          },
          { id: 'kopi', label: 'Kopi menyebabkan bug, jadi tim harus berhenti minum kopi.' },
          { id: 'bug', label: 'Bug pasti menyebabkan tim minum kopi.' },
          {
            id: 'tidak',
            label: 'Tidak ada asosiasi karena kopi tidak berhubungan dengan pemrograman.',
          },
        ],
        correct: 'asosiasi',
        cek: { kausal: false },
        explanation: 'Asosiasi hanya menunjukkan kecenderungan bersama, bukan bukti sebab-akibat.',
      },
      {
        type: 'input',
        cerita:
          'Survei 80 lulusan: ikut bootcamp pemrograman atau tidak, dan apakah mendapat tempat magang.',
        tabel: {
          judulBaris: 'Ikut bootcamp',
          judulKolom: 'Magang',
          baris: KAT_YA_TIDAK,
          kolom: [
            { id: 'dapat', label: 'Dapat' },
            { id: 'belum', label: 'Belum' },
          ],
          sel: [
            [18, 6],
            [21, 35],
          ],
        },
        pertanyaan:
          'Berapa <strong>selisih poin persen</strong> siswa yang mendapat magang antara kelompok bootcamp dan bukan bootcamp?',
        jawab: 37.5,
        satuan: 'poin persen',
        cek: { selisihKolom: 0 },
        hints: [
          'Bootcamp: 18 ÷ 24 × 100% = …; bukan bootcamp: 21 ÷ 56 × 100% = …',
          'Selisih = persen bootcamp − persen bukan bootcamp.',
        ],
        reveal: '75% − 37,5% = <strong>37,5 poin persen</strong>.',
      },
    ],
    nextLabel: 'Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses penemuan dan pemahaman tentang asosiasi dua variabel.',
    guru: 'Baca beberapa refleksi secara anonim. Gunakan jawaban pertanyaan 3 sebagai bahan proyek penyelidikan statistika pada pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Apa beda cara menyelidiki asosiasi dua variabel kategorikal dan dua variabel numerik?',
        placeholder: 'Untuk kategorikal aku memakai … sedangkan untuk numerik …',
      },
      {
        id: 'r2',
        teks: 'Mengapa frekuensi mentah bisa menyesatkan? Berikan contohnya.',
        placeholder: 'Frekuensi mentah menyesatkan jika …',
      },
      {
        id: 'r3',
        teks: 'Data nyata apa di sekolah atau dunia RPL yang ingin kamu selidiki asosiasinya?',
        placeholder: 'Aku ingin menyelidiki apakah … berasosiasi dengan …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat mengidentifikasi asosiasi dua variabel sekarang?',
    diriOpsi: [
      { id: 'sangat', label: 'Sangat yakin — bisa menjelaskan ke teman' },
      { id: 'yakin', label: 'Yakin, tetapi masih perlu berlatih' },
      { id: 'ragu', label: 'Masih ragu, terutama saat menghitung persen baris' },
      { id: 'bingung', label: 'Belum paham, perlu dibantu' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Penyelidikan Selesai!',
    teks: 'Kamu sudah menemukan sendiri cara mengidentifikasi asosiasi dua variabel dari data.',
    capaian: [
      'Membedakan variabel kategorikal dan numerik.',
      'Menyusun tabel kontingensi dan membandingkan persen baris.',
      'Memplot diagram pencar dan membaca arah serta kerapatan pola titik.',
      'Membedakan asosiasi dengan sebab-akibat.',
    ],
    berikutnya:
      'Pertanyaan untuk materi berikutnya: bagaimana merancang penyelidikan statistika sendiri — dari pertanyaan, mengumpulkan data nyata, hingga menyimpulkan?',
  },
};
