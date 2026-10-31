'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Rerata (Mean) Data Tunggal —
   Fase D, SMP Kelas VIII · Topik 20

   Tujuan Pembelajaran:
   Menentukan dan menafsirkan rerata (mean) dari data tunggal pada
   konteks sehari-hari.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahRumus' & 'olahMakna'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi    (7')  — "Siapa Juara Bank Sampah?": Kelompok Melati
                             (4 anggota, 18 kg) vs Kelompok Kenanga
                             (6 anggota, 24 kg). Murid MENDUGA kelompok
                             mana yang lebih rajin, apakah bagian rata
                             harus berupa nilai data, dan pengaruh satu
                             nilai besar (tidak dinilai).
     2. Masalah      (5')  — memilih pertanyaan inti penyelidikan, lalu
                             menulis hipotesis.
     3. Lab          (18') — Lab Ratakan Menara (Pekan Literasi): tiap
                             balok = 1 buku yang dibaca. Murid memindahkan
                             balok antarmenara sampai rata pada tiga regu:
                             hasil bulat, ada nilai 0, dan ada sisa balok
                             yang harus "dipotong" (hasil desimal).
     4a. Rumus       (12') — tabel temuan (jumlah balok tetap, banyak
                             menara, tinggi rata) → pola rerata = jumlah ÷
                             banyak data; dua isian berdiagnosa miskonsepsi
                             (lupa membagi, nilai 0 diabaikan, median,
                             modus, pembulatan).
     4b. Makna       (12') — Lab Titik Seimbang: menggeser penyangga papan
                             berdiagram titik sampai seimbang (jarak total
                             kiri = kanan), lalu menambah satu pencilan;
                             pertanyaan penuntun & pemilahan tafsiran.
     5. Verifikasi   (10') — tiga data BARU diambil acak dari bank enam
                             konteks: menghitung rerata, membuktikannya
                             dengan papan seimbang, menafsirkannya, lalu
                             membandingkan dugaan awal.
     6. Generalisasi (4')  — menyusun definisi, cara, dan makna rerata.
     7. Uji terap    (10') — delapan soal diambil acak dari bank delapan
                             belas soal (hitung, pilih rerata, data hilang,
                             tafsiran).
     8. Refleksi     (2')  — rekap, refleksi tertulis, penilaian diri.

   Kunci jawaban rerata, data hilang, opsi berpengecoh, dan diagnosa
   miskonsepsi TIDAK ditulis tangan: semuanya dihitung app.js dengan
   rerataData(), dataHilangDariRerata(), opsiRerata(), diagnosaRerata()
   dari shared/engine.js seksi 87.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Data verifikasi dan soal
   uji terap juga diambil acak.

   Konsistensi kunci jawaban diuji tests/mpi-20.1-data.test.js terhadap
   engine seksi 87.
   ============================================================ */

var DL = 'Discovery Learning';

/* Pilihan Benar/Salah untuk pemilahan pernyataan. */
var OPSI_BENAR_SALAH = [
  { id: 'benar', label: 'Benar' },
  { id: 'salah', label: 'Salah' },
];

var DATA = {
  konteks: {
    sekolah: { ikon: '🏫', nama: 'Sekolah' },
    rumah: { ikon: '🏠', nama: 'Rumah' },
    olahraga: { ikon: '⚽', nama: 'Olahraga' },
    lingkungan: { ikon: '♻️', nama: 'Lingkungan' },
    konsep: { ikon: '📊', nama: 'Konsep Rerata' },
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; dibandingkan dengan temuan pada tahap
     Verifikasi. `baku` diuji ulang di tes dari data kelompok.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati hasil bank sampah dua kelompok yang banyak anggotanya berbeda, lalu menduga cara membandingkannya dengan adil.',
    tp: 'Menentukan dan menafsirkan rerata (mean) dari data tunggal pada konteks sehari-hari.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menemukan bahwa rerata adalah tinggi menara setelah semua balok diratakan (dibagi rata).',
      'Menentukan rerata data tunggal dengan rumus jumlah seluruh nilai data ÷ banyak data, termasuk data bernilai 0.',
      'Menuliskan rerata yang tidak bulat sebagai bilangan desimal.',
      'Menafsirkan rerata sebagai bagian rata dan titik seimbang data, serta menjelaskan pengaruh nilai yang sangat besar atau kecil.',
      'Memakai rerata untuk membandingkan dan mengambil keputusan pada masalah sehari-hari.',
    ],
    guru: 'Tampilkan dua kantong sampah plastik (atau gambarnya) dan tuliskan data kedua kelompok di papan. Biarkan murid berdebat "lebih banyak = lebih rajin?" dengan bahasa mereka sendiri — jangan memperkenalkan istilah rerata dulu; perbedaan dugaan menjadi bahan penyelidikan.',
    judul: 'Siapa Juara Bank Sampah?',
    pengantar:
      'Pekan ini OSIS mengadakan lomba bank sampah plastik antarkelompok. Hasil timbangan setiap anggota (dalam kg) tercatat di bawah ini. Panitia ingin memberi piala "Kelompok Paling Rajin". Kelompok mana yang pantas menang?',
    kelompok: [
      {
        id: 'melati',
        ikon: '🌼',
        nama: 'Kelompok Melati',
        anggota: ['Ayu', 'Bima', 'Cici', 'Deni'],
        data: [5, 3, 6, 4],
      },
      {
        id: 'kenanga',
        ikon: '🌸',
        nama: 'Kelompok Kenanga',
        anggota: ['Euis', 'Fikri', 'Gilang', 'Hesti', 'Indra', 'Joni'],
        data: [3, 5, 4, 2, 6, 4],
      },
    ],
    satuan: 'kg',
    tambahanKenanga: 15,
    dugaan: [
      {
        id: 'dRajin',
        tanya: 'Kelompok mana yang lebih rajin mengumpulkan sampah plastik?',
        opsi: [
          { id: 'kenanga', label: 'Kenanga, karena total sampahnya lebih banyak' },
          { id: 'melati', label: 'Melati, karena bagian tiap anggotanya lebih banyak' },
          { id: 'sama', label: 'Sama rajinnya' },
          { id: 'ragu', label: 'Tidak bisa dibandingkan karena banyak anggotanya berbeda' },
        ],
        baku: 'melati',
        temuan:
          'Bagian rata Melati 18 ÷ 4 = 4,5 kg per anggota, sedangkan Kenanga 24 ÷ 6 = 4 kg per anggota. Total Kenanga lebih besar karena anggotanya lebih banyak, tetapi per anggota Melati lebih rajin.',
      },
      {
        id: 'dBukanData',
        tanya: 'Jika sampah Kelompok Melati dibagi rata ke semua anggota, bagian tiap anggota …',
        opsi: [
          {
            id: 'nilaiData',
            label: 'pasti sama dengan salah satu hasil anggota (3, 4, 5, atau 6 kg)',
          },
          { id: 'bukanData', label: 'boleh bukan hasil anggota mana pun, bahkan berupa desimal' },
          { id: 'bulat', label: 'selalu berupa bilangan bulat' },
          { id: 'terbesar', label: 'sama dengan hasil anggota yang paling banyak' },
        ],
        baku: 'bukanData',
        temuan:
          'Bagian rata Melati 4,5 kg — tidak ada anggota yang membawa tepat 4,5 kg, dan hasilnya berupa desimal.',
      },
      {
        id: 'dPencilan',
        tanya:
          'Seorang anggota baru Kenanga ternyata membawa 15 kg. Bagian rata Kelompok Kenanga akan …',
        opsi: [
          { id: 'naik', label: 'naik' },
          { id: 'turun', label: 'turun' },
          { id: 'tetap', label: 'tetap, karena hanya satu orang' },
          { id: 'acak', label: 'bisa naik atau turun, tergantung urutan datanya' },
        ],
        baku: 'naik',
        temuan:
          'Bagian rata menjadi (24 + 15) ÷ 7 ≈ 5,6 kg — naik cukup jauh hanya karena satu nilai yang sangat besar.',
      },
    ],
    catatan:
      'Belum perlu yakin! Simpan dugaanmu. Di tahap Pembuktian kamu akan mengecek apakah dugaan ini benar.',
    nextLabel: 'Lanjut ke Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan inti yang akan diselidiki dan menulis hipotesis.',
    guru: 'Arahkan murid menyadari bahwa membandingkan total saja tidak adil bila banyak anggota berbeda. Terima hipotesis apa pun selama dapat diuji, mis. "bagi rata dulu, baru bandingkan".',
    pengantar:
      'Kelompok Kenanga mengumpulkan lebih banyak sampah, tetapi anggotanya juga lebih banyak. Kita perlu ukuran yang adil untuk membandingkan kelompok yang ukurannya berbeda.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'rata',
        label:
          'Berapa bagian tiap anggota jika hasil kelompok dibagi rata, dan bagaimana cara menghitungnya?',
      },
      { id: 'total', label: 'Kelompok mana yang total sampahnya paling banyak?' },
      { id: 'juara', label: 'Siapa anggota yang membawa sampah paling banyak?' },
      { id: 'anggota', label: 'Kelompok mana yang anggotanya paling banyak?' },
    ],
    correct: 'rata',
    umpan: {
      rata: 'Tepat! Membagi rata hasil kelompok membuat kelompok besar dan kecil bisa dibandingkan dengan adil. Inilah yang akan kita selidiki.',
      total:
        'Total memang mudah dihitung, tetapi kelompok yang anggotanya lebih banyak tentu cenderung mengumpulkan lebih banyak. Itu belum adil.',
      juara:
        'Itu membandingkan perorangan, bukan kelompok. Piala diberikan untuk kelompok paling rajin.',
      anggota: 'Banyak anggota tidak menunjukkan kerajinan. Kelompok kecil pun bisa lebih rajin.',
    },
    hipotesisLabel: 'Hipotesisku: cara adil membandingkan kedua kelompok adalah …',
    hipotesisPlaceholder: 'Contoh: membagi total sampah dengan banyak anggota, lalu …',
    nextLabel: 'Lanjut ke Lab →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA: LAB RATAKAN MENARA
     Tiap balok = 1 buku. `isian` meminta tinggi rata setelah
     menara rata; kuncinya rerataData(data).
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Meratakan menara balok buku yang dibaca tiap murid dan mencatat tinggi ratanya.',
    guru: 'Bila memungkinkan, peragakan dengan kubus satuan atau tumpukan buku sungguhan. Tanyakan: "Apakah jumlah balok berubah saat dipindah?" Untuk Regu 3, biarkan murid menemukan sendiri bahwa sisa balok perlu dipotong agar adil.',
    pengantar:
      'Pekan Literasi Kelas VIII mencatat banyak buku yang dibaca tiap murid dalam sebulan. Setiap balok mewakili 1 buku. Pindahkan balok dari menara tinggi ke menara rendah sampai semua menara sama tinggi — seperti membagi buku secara rata.',
    caraMain: [
      'Ketuk menara yang akan diambil satu baloknya (menara itu ditandai oranye).',
      'Ketuk menara tujuan untuk menaruh balok itu. Balok pindahan bercorak garis.',
      'Ulangi sampai semua menara sama tinggi. Garis putus-putus menunjukkan tinggi awal.',
    ],
    satuan: 'buku',
    regu: [
      {
        id: 'regu1',
        nama: 'Regu Baca 1',
        anggota: ['Ani', 'Budi', 'Citra', 'Dodi'],
        data: [6, 2, 5, 3],
        tanya: 'Setelah rata, setiap menara setinggi … balok.',
        hints: [
          'Hitung balok pada salah satu menara setelah semuanya sama tinggi.',
          'Jumlah balok tidak berubah: 16 balok dibagi ke 4 menara.',
        ],
        temuan:
          'Empat menara masing-masing 4 balok. Jumlah balok tetap 16 — hanya dibagi rata ke 4 murid.',
      },
      {
        id: 'regu2',
        nama: 'Regu Baca 2',
        anggota: ['Eka', 'Fajar', 'Gita', 'Hana', 'Iwan'],
        data: [5, 0, 4, 3, 3],
        tanya: 'Setelah rata, setiap menara setinggi … balok.',
        hints: [
          'Fajar belum membaca buku (0 balok), tetapi menaranya tetap ikut diratakan.',
          'Ada 15 balok yang dibagi ke 5 menara, termasuk menara Fajar.',
        ],
        temuan:
          'Menara Fajar yang kosong ikut menerima balok. 15 balok dibagi ke 5 menara (bukan 4), sehingga tiap menara 3 balok.',
      },
      {
        id: 'regu3',
        nama: 'Regu Baca 3',
        anggota: ['Joko', 'Kiki', 'Lina', 'Maya'],
        data: [4, 1, 3, 2],
        tanya:
          'Dua menara masih lebih tinggi 1 balok. Jika 2 balok sisa itu dipotong dan dibagi rata ke 4 menara, setiap menara setinggi … balok.',
        hints: [
          'Setiap menara sudah punya 2 balok utuh. Sisa 2 balok dibagi ke 4 menara: 2 ÷ 4 = … balok.',
          'Tinggi tiap menara = 2 + 2/4 balok. Tulis dalam desimal dengan koma.',
        ],
        temuan:
          'Tiap menara 2 balok utuh ditambah 2/4 = 0,5 balok, jadi 2,5 balok. Sama dengan 10 balok ÷ 4 menara = 2,5. Hasil bagi rata boleh berupa desimal!',
      },
    ],
    kolom: ['Regu', 'Data (buku)', 'Jumlah balok', 'Banyak menara', 'Tinggi rata'],
    tabelJudul: 'Tabel hasil Lab Ratakan Menara',
    selesai:
      'Semua menara sudah kamu ratakan. Perhatikan tabelmu: adakah hubungan antara jumlah balok, banyak menara, dan tinggi rata?',
    nextLabel: 'Lanjut Olah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — OLAH DATA: MENEMUKAN RUMUS
     `latihan` berisi data isian; kunci & diagnosa dari engine.
     ---------------------------------------------------------- */
  olahRumus: {
    kicker: 'Tahap 4 · Pengolahan Data (Rumus)',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan cara menghitung tinggi rata (rerata) tanpa memindahkan balok.',
    guru: 'Minta pasangan membandingkan kolom tabel dan menyampaikan pola dengan bahasa sendiri sebelum membuka pertanyaan berikutnya. Kenalkan istilah "rerata" (mean) dan lambang x̄ setelah pola ditemukan.',
    instruksi:
      'Amati tabel hasil labmu, lalu jawab pertanyaan penuntun satu per satu. Pertanyaan berikutnya terbuka setelah jawabanmu tepat.',
    pertanyaan: [
      {
        id: 'qTetap',
        tanya: 'Bandingkan jumlah balok sebelum dan sesudah menara diratakan. Apa yang terjadi?',
        opsi: [
          { id: 'tetap', label: 'Jumlahnya tetap sama' },
          { id: 'tambah', label: 'Jumlahnya bertambah' },
          { id: 'kurang', label: 'Jumlahnya berkurang' },
          { id: 'acak', label: 'Kadang bertambah, kadang berkurang' },
        ],
        correct: 'tetap',
        umpan: {
          tetap: 'Benar! Balok hanya dipindah, tidak ditambah atau dibuang. Jumlah data tetap.',
          tambah: 'Coba hitung lagi: kamu hanya memindah balok, tidak menambah balok baru.',
          kurang: 'Tidak ada balok yang dibuang. Hitung lagi jumlah balok setelah rata.',
          acak: 'Lihat tabelmu: pada ketiga regu, jumlah balok sebelum dan sesudah selalu sama.',
        },
      },
      {
        id: 'qRumus',
        tanya: 'Bagaimana mendapatkan tinggi rata dari jumlah balok dan banyak menara?',
        opsi: [
          { id: 'bagi', label: 'Tinggi rata = jumlah balok ÷ banyak menara' },
          { id: 'kali', label: 'Tinggi rata = jumlah balok × banyak menara' },
          { id: 'kurang', label: 'Tinggi rata = jumlah balok − banyak menara' },
          { id: 'tengah', label: 'Tinggi rata = tinggi menara yang di tengah' },
        ],
        correct: 'bagi',
        umpan: {
          bagi: 'Tepat! 16 ÷ 4 = 4, 15 ÷ 5 = 3, dan 10 ÷ 4 = 2,5. Tinggi rata inilah yang disebut REREATA (mean).',
          kali: 'Coba Regu 1: 16 × 4 = 64, padahal tinggi ratanya 4. Operasinya bukan kali.',
          kurang: 'Coba Regu 1: 16 − 4 = 12, padahal tinggi ratanya 4. Operasinya bukan kurang.',
          tengah:
            'Menara di tengah bergantung urutan duduk, dan pada Regu 3 tinggi ratanya 2,5 — tidak ada menara setinggi itu.',
        },
      },
      {
        id: 'qNol',
        tanya: 'Pada Regu 2, Fajar membaca 0 buku. Bagaimana data Fajar dalam perhitungan?',
        opsi: [
          { id: 'ikut', label: 'Tetap dihitung: jumlah 15 dibagi 5 murid' },
          { id: 'abaikan', label: 'Diabaikan: jumlah 15 dibagi 4 murid' },
          { id: 'satu', label: 'Dianggap 1 buku agar adil' },
          { id: 'kurangi', label: 'Dikurangkan dari jumlah buku' },
        ],
        correct: 'ikut',
        umpan: {
          ikut: 'Benar! Menara Fajar ikut menerima balok saat diratakan. Data 0 tetap data, sehingga menambah banyak data.',
          abaikan:
            'Ingat lab: menara Fajar ikut diratakan dan mendapat 3 balok. Jika diabaikan, hasilnya 3,75 — tidak sesuai tabel.',
          satu: 'Mengubah data berarti mengubah fakta. Fajar memang membaca 0 buku.',
          kurangi: 'Nilai 0 tidak mengubah jumlah, tetapi tetap dihitung sebagai satu data.',
        },
      },
    ],
    temuan: [
      { label: 'Rerata (mean)', teks: 'tinggi menara setelah semua balok diratakan' },
      { label: 'Rumus', teks: 'rerata = jumlah seluruh nilai data ÷ banyak data' },
      { label: 'Lambang', teks: 'x̄ = (x₁ + x₂ + … + xₙ) ÷ n' },
    ],
    latihanJudul: 'Coba tanpa balok',
    latihanInstruksi:
      'Hitung reratanya dengan rumus yang baru kamu temukan. Tulis desimal dengan koma, mis. 2,5.',
    latihan: [
      {
        id: 'l1',
        nama: 'Regu Baca 4',
        anggota: ['Nia', 'Oki', 'Putri', 'Qori', 'Rafi', 'Sari'],
        data: [7, 0, 4, 5, 0, 8],
        satuan: 'buku',
        hints: [
          'Jumlahkan keenam data, termasuk yang bernilai 0.',
          'Ada 6 murid, jadi pembaginya 6.',
        ],
      },
      {
        id: 'l2',
        nama: 'Regu Baca 5',
        anggota: ['Tono', 'Umi', 'Vina', 'Wati', 'Yogi'],
        data: [2, 5, 3, 4, 2],
        satuan: 'buku',
        hints: [
          'Jumlah datanya 16, banyak datanya 5.',
          '16 ÷ 5 tidak bulat. Lanjutkan pembagiannya sampai desimal.',
        ],
      },
    ],
    nextLabel: 'Lanjut: Makna Rerata →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — OLAH DATA: MAKNA RERATA (TITIK SEIMBANG)
     ---------------------------------------------------------- */
  olahMakna: {
    kicker: 'Tahap 5 · Pengolahan Data (Makna)',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan bahwa rerata adalah titik seimbang data dan mengamati pengaruh nilai yang sangat besar.',
    guru: 'Peragakan dengan penggaris dan koin di atas pensil bila ada. Tekankan bahwa titik seimbang memakai JARAK tiap data ke penyangga, sehingga data yang jauh "lebih berat". Diskusikan kapan rerata kurang mewakili data.',
    instruksi:
      'Setiap titik adalah satu murid yang diletakkan pada papan sesuai banyak buku yang dibacanya. Geser penyangga ungu sampai papan seimbang.',
    papan: [
      {
        id: 'sb1',
        judul: 'Papan A — Regu Baca 1',
        anggota: ['Ani', 'Budi', 'Citra', 'Dodi'],
        data: [6, 2, 5, 3],
        awal: 1,
        min: 0,
        max: 15,
        temuan:
          'Seimbang di 4 — sama dengan rerata Regu 1. Jarak total di kiri (2 + 1) sama dengan di kanan (1 + 2).',
      },
      {
        id: 'sb2',
        judul: 'Papan B — Nino bergabung dan membaca 14 buku',
        anggota: ['Ani', 'Budi', 'Citra', 'Dodi', 'Nino'],
        data: [6, 2, 5, 3, 14],
        awal: 4,
        min: 0,
        max: 15,
        temuan:
          'Satu titik yang jauh di kanan menarik titik seimbang dari 4 ke 6, padahal empat dari lima murid membaca kurang dari 6 buku.',
      },
    ],
    langkah: 0.5,
    pertanyaan: [
      {
        id: 'qSeimbang',
        tanya:
          'Saat papan seimbang, bagaimana jarak total titik di kiri penyangga dibanding di kanan?',
        opsi: [
          { id: 'sama', label: 'Sama besar' },
          { id: 'kiriBesar', label: 'Di kiri lebih besar' },
          { id: 'kananBesar', label: 'Di kanan lebih besar' },
          { id: 'banyakTitik', label: 'Banyak titik di kiri sama dengan banyak titik di kanan' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Benar! Rerata adalah titik seimbang: kelebihan data di atas rerata tepat menutup kekurangan data di bawah rerata.',
          kiriBesar: 'Jika kiri lebih besar, papan miring ke kiri — belum seimbang.',
          kananBesar: 'Jika kanan lebih besar, papan miring ke kanan — belum seimbang.',
          banyakTitik:
            'Lihat Papan B: seimbang di 6 dengan 4 titik di kiri dan hanya 1 di kanan. Yang sama adalah jarak totalnya.',
        },
      },
      {
        id: 'qGeser',
        tanya: 'Setelah Nino (14 buku) bergabung, titik seimbang bergeser ke mana?',
        opsi: [
          { id: 'kanan', label: 'Ke kanan: rerata naik dari 4 menjadi 6' },
          { id: 'kiri', label: 'Ke kiri: rerata turun' },
          { id: 'tetap', label: 'Tetap di 4 karena hanya satu murid' },
          { id: 'ujung', label: 'Ke 14, sama dengan data Nino' },
        ],
        correct: 'kanan',
        umpan: {
          kanan: 'Tepat! (16 + 14) ÷ 5 = 30 ÷ 5 = 6. Satu nilai besar menaikkan rerata.',
          kiri: 'Nilai 14 lebih besar dari rerata lama, jadi ia menarik penyangga ke kanan.',
          tetap: 'Satu data yang jauh pun mengubah jumlah dan banyak data. Hitung: 30 ÷ 5.',
          ujung: 'Penyangga di 14 membuat papan miring jauh ke kiri. Rerata ada di antara data.',
        },
      },
      {
        id: 'qMewakili',
        tanya:
          'Rerata baru 6 buku, padahal empat dari lima murid membaca kurang dari 6 buku. Artinya …',
        opsi: [
          {
            id: 'pencilan',
            label:
              'nilai yang sangat besar (pencilan) dapat menarik rerata sehingga kurang mewakili sebagian besar data',
          },
          { id: 'salahHitung', label: 'perhitungan reratanya pasti salah' },
          { id: 'semua6', label: 'setiap murid sebenarnya membaca 6 buku' },
          { id: 'buang', label: 'data Nino harus dibuang karena tidak adil' },
        ],
        correct: 'pencilan',
        umpan: {
          pencilan:
            'Benar! Rerata memakai semua nilai, sehingga satu nilai ekstrem dapat menggesernya. Saat menafsirkan rerata, perhatikan juga apakah ada pencilan.',
          salahHitung: 'Hitungannya benar: 30 ÷ 5 = 6. Yang perlu diperhatikan adalah maknanya.',
          semua6:
            'Rerata 6 berarti bagian rata, bukan banyak buku yang benar-benar dibaca tiap murid.',
          buang:
            'Data Nino nyata dan tidak boleh dibuang begitu saja. Kita cukup berhati-hati saat menafsirkan rerata.',
        },
      },
    ],
    temuan: [
      { label: 'Bagian rata', teks: 'rerata = bagian tiap data jika jumlahnya dibagi rata' },
      { label: 'Titik seimbang', teks: 'jarak total data di kiri rerata = di kanan rerata' },
      { label: 'Pencilan', teks: 'nilai yang sangat jauh dapat menggeser rerata' },
    ],
    pilahJudul: 'Benar atau salah?',
    pilahInstruksi: 'Pilah setiap pernyataan tentang tafsiran rerata berikut.',
    pilah: [
      {
        id: 'pDesimal',
        teks: 'Rerata Regu Baca 3 adalah 2,5 buku. Artinya ada murid yang membaca tepat 2,5 buku.',
        correct: 'salah',
        explanation:
          'Tidak ada murid yang membaca 2,5 buku. Rerata adalah bagian rata, tidak harus sama dengan salah satu data.',
      },
      {
        id: 'pBagi',
        teks: 'Rerata 2,5 buku berarti jika semua buku yang dibaca dibagi rata, tiap murid kebagian 2,5 buku.',
        correct: 'benar',
        explanation: 'Itulah makna rerata sebagai bagian rata: 10 buku ÷ 4 murid = 2,5 buku.',
      },
      {
        id: 'pAntara',
        teks: 'Rerata selalu terletak di antara nilai terkecil dan terbesar data (atau sama bila semua data sama).',
        correct: 'benar',
        explanation:
          'Meratakan menara tidak pernah membuat menara lebih tinggi dari yang tertinggi atau lebih rendah dari yang terendah.',
      },
      {
        id: 'pNol',
        teks: 'Data bernilai 0 boleh diabaikan saat menghitung rerata.',
        correct: 'salah',
        explanation: 'Data 0 tetap dihitung sebagai banyak data (pembagi), seperti menara Fajar.',
      },
      {
        id: 'pPencilan',
        teks: 'Satu nilai yang sangat besar dapat menaikkan rerata cukup jauh.',
        correct: 'benar',
        explanation: 'Nino yang membaca 14 buku menaikkan rerata regu dari 4 menjadi 6.',
      },
      {
        id: 'pPasti',
        teks: 'Rerata uang saku kelas Rp12.000 berarti setiap murid pasti membawa Rp12.000.',
        correct: 'salah',
        explanation:
          'Rerata tidak menjamin nilai tiap murid. Ada yang membawa lebih, ada yang kurang; jika dibagi rata barulah tiap murid Rp12.000.',
      },
    ],
    nextLabel: 'Lanjut ke Pembuktian →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN
     Bank data baru; `ambil` data diambil acak. Kunci rerata dihitung
     dari `data`. `tafsir` berpilihan dengan umpan per opsi.
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Membuktikan temuan pada data baru: menghitung rerata, mengeceknya dengan papan seimbang, dan menafsirkannya.',
    guru: 'Setiap pasangan mendapat data acak yang berbeda — minta mereka saling menukar hasil dengan pasangan lain. Tanyakan alasan di balik setiap tafsiran, bukan hanya angkanya.',
    ambil: 3,
    judulA: 'A. Data baru dari sekitar kita',
    instruksiA:
      'Hitung rerata setiap data. Setelah tepat, papan seimbang akan membuktikan hasilmu, lalu tafsirkan maknanya.',
    bank: [
      {
        id: 'vSaku',
        konteks: 'sekolah',
        nama: 'Uang saku harian',
        cerita: 'Uang saku harian 5 anggota OSIS (dalam ribu rupiah).',
        anggota: ['Dewi', 'Eko', 'Fani', 'Gani', 'Hadi'],
        data: [10, 8, 12, 15, 10],
        satuan: 'ribu rupiah',
        max: 16,
        tafsir: {
          tanya: 'Apa makna rerata uang saku tersebut?',
          opsi: [
            {
              id: 'bagi',
              label:
                'Jika semua uang saku dikumpulkan lalu dibagi rata, tiap anggota mendapat Rp11.000',
            },
            { id: 'ada', label: 'Ada anggota yang uang sakunya tepat Rp11.000' },
            { id: 'kebanyakan', label: 'Kebanyakan anggota membawa Rp11.000' },
            { id: 'terbanyak', label: 'Uang saku terbesar adalah Rp11.000' },
          ],
          correct: 'bagi',
          umpan: {
            bagi: 'Tepat! 55 ribu dibagi rata ke 5 anggota = 11 ribu per anggota.',
            ada: 'Lihat datanya: tidak ada yang membawa tepat 11 ribu. Rerata tidak harus berupa nilai data.',
            kebanyakan: 'Yang paling sering muncul adalah 10 ribu, bukan 11 ribu.',
            terbanyak:
              'Uang saku terbesar 15 ribu. Rerata selalu di antara nilai terkecil dan terbesar.',
          },
        },
      },
      {
        id: 'vTanaman',
        konteks: 'lingkungan',
        nama: 'Tinggi tanaman kacang hijau',
        cerita: 'Tinggi 6 tanaman kacang hijau pada hari ke-7 percobaan IPA (dalam cm).',
        anggota: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
        data: [6, 8, 5, 9, 7, 7],
        satuan: 'cm',
        max: 10,
        tafsir: {
          tanya: 'Tanaman T4 tingginya 9 cm. Dibandingkan rerata, tanaman T4 …',
          opsi: [
            { id: 'atas2', label: '2 cm di atas rerata' },
            { id: 'bawah2', label: '2 cm di bawah rerata' },
            { id: 'sama', label: 'sama dengan rerata' },
            { id: 'atas9', label: '9 cm di atas rerata' },
          ],
          correct: 'atas2',
          umpan: {
            atas2: 'Benar! Rerata 7 cm, jadi 9 − 7 = 2 cm di atas rerata.',
            bawah2: '9 lebih besar dari rerata 7, jadi di atas rerata, bukan di bawah.',
            sama: 'Rerata tanaman 7 cm, bukan 9 cm.',
            atas9: 'Bandingkan selisihnya dengan rerata (7 cm), bukan dengan 0.',
          },
        },
      },
      {
        id: 'vKuis',
        konteks: 'sekolah',
        nama: 'Skor kuis Matematika',
        cerita: 'Skor kuis Matematika 8 murid (skala 0–10).',
        anggota: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'],
        data: [8, 6, 9, 7, 10, 5, 8, 7],
        satuan: '',
        max: 10,
        tafsir: {
          tanya:
            'Reratanya 7,5, padahal tidak ada murid yang mendapat skor 7,5. Mengapa bisa begitu?',
          opsi: [
            {
              id: 'bagiRata',
              label:
                'Rerata adalah hasil bagi rata jumlah skor, tidak harus sama dengan salah satu data',
            },
            { id: 'salah', label: 'Perhitungannya pasti salah' },
            { id: 'hilang', label: 'Ada skor yang belum dicatat' },
            { id: 'desimal', label: 'Rerata selalu berupa bilangan desimal' },
          ],
          correct: 'bagiRata',
          umpan: {
            bagiRata: 'Tepat! 60 ÷ 8 = 7,5 — bagian rata, bukan skor salah satu murid.',
            salah: 'Coba hitung ulang: 60 ÷ 8 memang 7,5.',
            hilang: 'Kedelapan skor sudah lengkap. Rerata memang boleh bukan nilai data.',
            desimal: 'Tidak selalu. Rerata Regu Baca 1 adalah 4, bilangan bulat.',
          },
        },
      },
      {
        id: 'vGol',
        konteks: 'olahraga',
        nama: 'Gol tim futsal',
        cerita: 'Banyak gol tim futsal sekolah dalam 8 pertandingan.',
        anggota: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'],
        data: [2, 0, 3, 1, 0, 3, 5, 2],
        satuan: 'gol',
        max: 6,
        tafsir: {
          tanya: 'Ada dua pertandingan tanpa gol (0). Saat menghitung rerata, nilai 0 itu …',
          opsi: [
            { id: 'ikut', label: 'tetap dihitung, sehingga pembaginya 8 pertandingan' },
            { id: 'abaikan', label: 'diabaikan, sehingga pembaginya 6 pertandingan' },
            { id: 'satu', label: 'diganti 1 agar tidak merugikan tim' },
            { id: 'jumlahSaja', label: 'hanya dihitung pada jumlah, tidak pada pembagi' },
          ],
          correct: 'ikut',
          umpan: {
            ikut: 'Benar! 16 gol ÷ 8 pertandingan = 2 gol per pertandingan.',
            abaikan:
              'Pertandingan tanpa gol tetap pertandingan. Jika diabaikan, rerata menjadi terlalu besar.',
            satu: 'Data tidak boleh diubah. Tim memang tidak mencetak gol pada dua pertandingan itu.',
            jumlahSaja:
              'Nilai 0 tidak menambah jumlah, tetapi tetap menambah banyak data (pembagi).',
          },
        },
      },
      {
        id: 'vTidur',
        konteks: 'rumah',
        nama: 'Lama tidur malam',
        cerita: 'Lama tidur malam 5 anggota keluarga Pak Ruslan (dalam jam).',
        anggota: ['Ayah', 'Ibu', 'Rani', 'Rudi', 'Nenek'],
        data: [8, 7, 9, 6, 8],
        satuan: 'jam',
        max: 10,
        tafsir: {
          tanya:
            'Dokter menyarankan tidur 8–10 jam per malam untuk remaja dan dewasa muda. Berdasarkan reratanya, …',
          opsi: [
            {
              id: 'kurang',
              label: 'rerata 7,6 jam masih di bawah 8 jam — rata-rata keluarga ini kurang tidur',
            },
            { id: 'semua', label: 'semua anggota keluarga kurang tidur' },
            { id: 'cukup', label: 'rerata sudah memenuhi saran dokter' },
            { id: 'tidakBisa', label: 'tidak dapat disimpulkan apa pun dari rerata' },
          ],
          correct: 'kurang',
          umpan: {
            kurang: 'Tepat! 38 ÷ 5 = 7,6 jam, kurang dari 8 jam.',
            semua:
              'Ayah, Rani, dan Nenek tidur 8 jam atau lebih. Rerata tidak menggambarkan setiap anggota.',
            cukup: 'Rerata 7,6 jam masih di bawah 8 jam.',
            tidakBisa:
              'Rerata dapat dibandingkan dengan saran dokter untuk menilai kebiasaan keluarga.',
          },
        },
      },
      {
        id: 'vSampah',
        konteks: 'lingkungan',
        nama: 'Setoran bank sampah',
        cerita: 'Setoran sampah plastik Kelas VIII B ke bank sampah selama 6 hari (dalam kg).',
        anggota: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
        data: [3, 5, 0, 4, 6, 6],
        satuan: 'kg',
        max: 8,
        tafsir: {
          tanya: 'Target bank sampah adalah rerata 5 kg per hari. Apa kesimpulannya?',
          opsi: [
            { id: 'belum', label: 'Belum tercapai: reratanya kurang 1 kg per hari dari target' },
            { id: 'tercapai6', label: 'Tercapai, karena ada hari dengan setoran 6 kg' },
            { id: 'tercapaiJumlah', label: 'Tercapai, karena jumlahnya 24 kg' },
            { id: 'tidakBisa', label: 'Tidak bisa dihitung karena ada hari dengan 0 kg' },
          ],
          correct: 'belum',
          umpan: {
            belum: 'Benar! 24 ÷ 6 = 4 kg per hari, kurang 1 kg dari target 5 kg.',
            tercapai6: 'Target memakai rerata semua hari, bukan setoran terbesar.',
            tercapaiJumlah:
              'Target 5 kg per hari selama 6 hari berarti 30 kg. Jumlah 24 kg belum cukup.',
            tidakBisa: 'Hari dengan 0 kg tetap dihitung: jumlah 24 kg dibagi 6 hari.',
          },
        },
      },
    ],
    judulB: 'B. Kembali ke lomba bank sampah',
    instruksiB:
      'Sekarang kamu bisa menjawab masalah di awal. Hitung bagian rata (rerata) sampah per anggota setiap kelompok.',
    judulC: 'C. Bagaimana dengan dugaan awalmu?',
    kesimpulan:
      'Pada setiap data baru, jumlah ÷ banyak data selalu tepat di titik seimbang papan. Temuanmu terbukti!',
    nextLabel: 'Lanjut ke Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Menyusun sendiri pengertian, cara menghitung, dan makna rerata.',
    guru: 'Minta beberapa pasangan membacakan kesimpulan lengkap, lalu tuliskan rangkuman bersama di papan. Bedakan rerata dari "nilai tengah" dan "nilai terbanyak" yang akan dipelajari berikutnya.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai sekali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'g1', awal: 'Rerata (mean) sekumpulan data tunggal adalah', correct: 'b1' },
      { id: 'g2', awal: 'Data yang bernilai 0', correct: 'b2' },
      { id: 'g3', awal: 'Rerata dapat ditafsirkan sebagai', correct: 'b3' },
      { id: 'g4', awal: 'Rerata tidak harus', correct: 'b4' },
      {
        id: 'g5',
        awal: 'Nilai yang jauh lebih besar atau lebih kecil dari data lainnya',
        correct: 'b5',
      },
    ],
    bank: [
      { id: 'b1', teks: 'jumlah seluruh nilai data dibagi banyak data.' },
      { id: 'b2', teks: 'tetap dihitung, sehingga ikut menambah banyak data (pembagi).' },
      { id: 'b3', teks: 'bagian tiap data bila jumlahnya dibagi rata, atau titik seimbang data.' },
      { id: 'b4', teks: 'sama dengan salah satu nilai data, dan boleh berupa desimal.' },
      { id: 'b5', teks: 'dapat menggeser rerata sehingga kurang mewakili sebagian besar data.' },
      { id: 'x1', teks: 'nilai yang paling sering muncul pada data.' },
      { id: 'x2', teks: 'nilai di tengah setelah data diurutkan.' },
      { id: 'x3', teks: 'jumlah seluruh nilai data dikali banyak data.' },
    ],
    rangkuman: [
      'Rerata = jumlah seluruh nilai data ÷ banyak data, ditulis x̄ = (x₁ + x₂ + … + xₙ) ÷ n.',
      'Semua data dihitung, termasuk data bernilai 0.',
      'Rerata adalah bagian rata dan titik seimbang data; letaknya di antara nilai terkecil dan terbesar.',
      'Rerata boleh berupa desimal dan tidak harus sama dengan salah satu data.',
      'Waspadai pencilan: satu nilai ekstrem dapat membuat rerata kurang mewakili data.',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     tipe 'hitung'      isian rerata; kunci rerataData, diagnosa
                        diagnosaRerata.
     tipe 'pilihRerata' pilihan ganda; opsi dari opsiRerata.
     tipe 'hilang'      isian data yang hilang; kunci
                        dataHilangDariRerata, diagnosa
                        diagnosaDataHilang.
     tipe 'pilih'       pilihan ganda tafsiran; opsi, correct & umpan.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan rerata untuk menyelesaikan dan menafsirkan masalah sehari-hari.',
    guru: 'Soal diambil acak sehingga tiap murid mendapat paket berbeda. Amati diagnosa yang sering muncul (lupa nilai 0, median, pembulatan) sebagai bahan umpan balik klasikal.',
    instruksi:
      'Kerjakan delapan soal berikut. Tulis desimal dengan koma. Gunakan petunjuk bila perlu; pembahasan muncul setelah jawabanmu tepat.',
    banyak: 8,
    komposisi: { hitung: 2, pilihRerata: 1, hilang: 2, pilih: 3 },
    soal: [
      {
        id: 'h1',
        tipe: 'hitung',
        konteks: 'sekolah',
        cerita: 'Nilai ulangan Bahasa Indonesia 6 murid: 80, 75, 90, 85, 70, 80.',
        data: [80, 75, 90, 85, 70, 80],
        satuan: '',
        tanya: 'Berapa rerata nilai ulangan keenam murid?',
        hints: ['Jumlahkan keenam nilai.', 'Jumlahnya 480. Bagi dengan banyak murid.'],
        pembahasan: 'Jumlah = 480, banyak data = 6, rerata = 480 ÷ 6 = 80.',
      },
      {
        id: 'h2',
        tipe: 'hitung',
        konteks: 'rumah',
        cerita:
          'Uang jajan Rina selama 5 hari (ribu rupiah): 5, 7, 6, 0, 8. Pada hari keempat Rina membawa bekal sehingga tidak jajan.',
        data: [5, 7, 6, 0, 8],
        satuan: 'ribu rupiah',
        tanya: 'Berapa rerata uang jajan Rina per hari?',
        hints: [
          'Hari tanpa jajan (0) tetap termasuk 5 hari.',
          'Jumlahnya 26 ribu. Bagi dengan 5 hari dan tulis hasilnya dengan koma.',
        ],
        pembahasan:
          'Jumlah = 26, banyak data = 5 (termasuk hari bernilai 0), rerata = 26 ÷ 5 = 5,2 ribu rupiah.',
      },
      {
        id: 'h3',
        tipe: 'hitung',
        konteks: 'olahraga',
        cerita: 'Hasil lompat jauh Bayu dalam 4 kali percobaan (meter): 3,2; 2,8; 3,5; 3,1.',
        data: [3.2, 2.8, 3.5, 3.1],
        satuan: 'm',
        tanya: 'Berapa rerata hasil lompat jauh Bayu?',
        hints: [
          'Jumlahkan keempat hasil: 3,2 + 2,8 + 3,5 + 3,1.',
          'Jumlahnya 12,6. Bagi dengan 4.',
        ],
        pembahasan: 'Jumlah = 12,6 m, banyak data = 4, rerata = 12,6 ÷ 4 = 3,15 m.',
      },
      {
        id: 'h4',
        tipe: 'hitung',
        konteks: 'lingkungan',
        cerita:
          'Botol plastik yang dikumpulkan Pramuka selama 6 hari: 12, 15, 9, 0, 14, 10. Hari keempat hujan deras sehingga tidak ada kegiatan.',
        data: [12, 15, 9, 0, 14, 10],
        satuan: 'botol',
        tanya: 'Berapa rerata botol yang dikumpulkan per hari?',
        hints: [
          'Hari hujan (0 botol) tetap dihitung sebagai salah satu dari 6 hari.',
          'Jumlahnya 60 botol.',
        ],
        pembahasan: 'Jumlah = 60, banyak data = 6, rerata = 60 ÷ 6 = 10 botol per hari.',
      },
      {
        id: 'h5',
        tipe: 'hitung',
        konteks: 'rumah',
        cerita: 'Telur yang dihasilkan ayam Bu Sri selama seminggu: 4, 5, 3, 6, 5, 4, 8.',
        data: [4, 5, 3, 6, 5, 4, 8],
        satuan: 'butir',
        tanya: 'Berapa rerata telur per hari?',
        hints: ['Ada 7 hari dalam seminggu.', 'Jumlahnya 35 butir.'],
        pembahasan: 'Jumlah = 35, banyak data = 7, rerata = 35 ÷ 7 = 5 butir per hari.',
      },
      {
        id: 'r1',
        tipe: 'pilihRerata',
        konteks: 'sekolah',
        cerita: 'Tinggi badan 5 pengurus kelas (cm): 150, 145, 160, 152, 148.',
        data: [150, 145, 160, 152, 148],
        satuan: 'cm',
        tanya: 'Rerata tinggi badan kelima pengurus kelas adalah …',
        hints: ['Jumlah tinggi badannya 755 cm.', 'Bagi jumlah itu dengan banyak pengurus.'],
        pembahasan: 'Jumlah = 755, banyak data = 5, rerata = 755 ÷ 5 = 151 cm.',
      },
      {
        id: 'r2',
        tipe: 'pilihRerata',
        konteks: 'olahraga',
        cerita: 'Gol yang dicetak Rafa dalam 6 pertandingan: 2, 0, 3, 1, 0, 6.',
        data: [2, 0, 3, 1, 0, 6],
        satuan: 'gol',
        tanya: 'Rerata gol Rafa per pertandingan adalah …',
        hints: [
          'Pertandingan tanpa gol tetap dihitung.',
          'Jumlah golnya 12, banyak pertandingannya 6.',
        ],
        pembahasan: 'Jumlah = 12, banyak data = 6 (termasuk dua nilai 0), rerata = 12 ÷ 6 = 2 gol.',
      },
      {
        id: 'r3',
        tipe: 'pilihRerata',
        konteks: 'rumah',
        cerita: 'Air minum yang dihabiskan Doni selama 5 hari (liter): 2; 1,5; 2,5; 2; 3.',
        data: [2, 1.5, 2.5, 2, 3],
        satuan: 'liter',
        tanya: 'Rerata air minum Doni per hari adalah …',
        hints: ['Jumlahnya 11 liter.', '11 ÷ 5 tidak bulat; lanjutkan sampai desimal.'],
        pembahasan: 'Jumlah = 11, banyak data = 5, rerata = 11 ÷ 5 = 2,2 liter.',
      },
      {
        id: 'm1',
        tipe: 'hilang',
        konteks: 'sekolah',
        cerita: 'Dimas ingin rerata 4 nilai ulangannya 85. Tiga nilai pertamanya 80, 75, dan 90.',
        diketahui: [80, 75, 90],
        rerata: 85,
        satuan: '',
        tanya: 'Berapa nilai yang harus Dimas peroleh pada ulangan keempat?',
        hints: [
          'Agar reratanya 85, jumlah keempat nilai harus 85 × 4.',
          'Jumlah yang dibutuhkan 340. Kurangi dengan jumlah tiga nilai yang sudah ada.',
        ],
        pembahasan:
          'Jumlah dibutuhkan = 85 × 4 = 340. Jumlah tiga nilai = 245. Nilai keempat = 340 − 245 = 95.',
      },
      {
        id: 'm2',
        tipe: 'hilang',
        konteks: 'olahraga',
        cerita:
          'Rerata skor 5 lemparan bola basket Sinta adalah 7. Skor empat lemparan pertama 6, 8, 5, dan 9.',
        diketahui: [6, 8, 5, 9],
        rerata: 7,
        satuan: '',
        tanya: 'Berapa skor lemparan kelima Sinta?',
        hints: ['Jumlah kelima skor = 7 × 5.', 'Jumlah empat skor yang diketahui adalah 28.'],
        pembahasan:
          'Jumlah seluruh skor = 7 × 5 = 35. Jumlah empat skor = 28. Skor kelima = 35 − 28 = 7.',
      },
      {
        id: 'm3',
        tipe: 'hilang',
        konteks: 'lingkungan',
        cerita:
          'Rerata sampah organik yang diolah menjadi kompos selama 5 hari adalah 4 kg. Catatan empat hari: 3, 5, 2, 4 kg. Catatan hari kelima hilang.',
        diketahui: [3, 5, 2, 4],
        rerata: 4,
        satuan: 'kg',
        tanya: 'Berapa kg sampah yang diolah pada hari kelima?',
        hints: ['Jumlah sampah 5 hari = 4 × 5.', 'Jumlah empat hari yang tercatat adalah 14 kg.'],
        pembahasan:
          'Jumlah 5 hari = 4 × 5 = 20 kg. Empat hari = 14 kg. Hari kelima = 20 − 14 = 6 kg.',
      },
      {
        id: 'm4',
        tipe: 'hilang',
        konteks: 'rumah',
        cerita:
          'Rerata tabungan Lia selama 6 minggu adalah 10 ribu rupiah per minggu. Tabungan lima minggu pertama: 8, 12, 15, 9, 11 ribu.',
        diketahui: [8, 12, 15, 9, 11],
        rerata: 10,
        satuan: 'ribu rupiah',
        tanya: 'Berapa tabungan Lia pada minggu keenam?',
        hints: ['Jumlah tabungan 6 minggu = 10 × 6.', 'Jumlah lima minggu pertama adalah 55 ribu.'],
        pembahasan:
          'Jumlah 6 minggu = 10 × 6 = 60 ribu. Lima minggu = 55 ribu. Minggu keenam = 60 − 55 = 5 ribu rupiah.',
      },
      {
        id: 'p1',
        tipe: 'pilih',
        konteks: 'konsep',
        cerita: 'Hasil survei: rerata banyak saudara kandung murid Kelas VIII A adalah 1,8 orang.',
        tanya: 'Pernyataan yang tepat adalah …',
        opsi: [
          {
            id: 'bagiRata',
            label:
              'Jika seluruh saudara dibagi rata, tiap murid kebagian 1,8 — rerata tidak harus bilangan bulat',
          },
          { id: 'ada', label: 'Ada murid yang memiliki 1,8 saudara' },
          { id: 'kebanyakan', label: 'Sebagian besar murid memiliki tepat 1,8 saudara' },
          {
            id: 'salah',
            label: 'Survei itu pasti salah karena banyak orang tidak mungkin desimal',
          },
        ],
        correct: 'bagiRata',
        umpan: {
          bagiRata: 'Tepat! Rerata adalah bagian rata, sehingga boleh berupa desimal.',
          ada: 'Banyak saudara selalu bilangan bulat. Rerata 1,8 adalah hasil bagi rata, bukan data seseorang.',
          kebanyakan:
            'Tidak ada yang punya tepat 1,8 saudara. Rerata tidak harus sama dengan data.',
          salah: 'Survei bisa saja benar. Rerata boleh desimal walaupun datanya bilangan bulat.',
        },
        hints: ['Ingat Regu Baca 3: rerata 2,5 buku padahal tak ada yang membaca 2,5 buku.'],
        pembahasan: 'Rerata 1,8 = jumlah saudara ÷ banyak murid. Hasil bagi rata boleh desimal.',
      },
      {
        id: 'p2',
        tipe: 'pilih',
        konteks: 'sekolah',
        cerita: 'Rerata nilai 5 murid adalah 70. Seorang murid baru dengan nilai 70 bergabung.',
        tanya: 'Rerata keenam murid sekarang …',
        opsi: [
          { id: 'tetap', label: 'tetap 70' },
          { id: 'naik', label: 'naik' },
          { id: 'turun', label: 'turun' },
          { id: 'tidakTahu', label: 'tidak bisa ditentukan tanpa nilai kelima murid' },
        ],
        correct: 'tetap',
        umpan: {
          tetap:
            'Benar! (350 + 70) ÷ 6 = 420 ÷ 6 = 70. Data yang sama dengan rerata tidak menggeser titik seimbang.',
          naik: 'Rerata naik hanya bila data baru lebih besar dari rerata lama.',
          turun: 'Rerata turun hanya bila data baru lebih kecil dari rerata lama.',
          tidakTahu: 'Cukup jumlahnya: 70 × 5 = 350. Tambah 70, lalu bagi 6.',
        },
        hints: ['Jumlah nilai 5 murid = 70 × 5 = 350.', 'Hitung (350 + 70) ÷ 6.'],
        pembahasan: 'Jumlah lama 350, jumlah baru 420, rerata baru 420 ÷ 6 = 70 — tetap.',
      },
      {
        id: 'p3',
        tipe: 'pilih',
        konteks: 'lingkungan',
        cerita:
          'Rerata tinggi 4 tanaman cabai adalah 10 cm. Ternyata ada salah catat: satu tanaman yang ditulis 10 cm seharusnya 30 cm.',
        tanya: 'Rerata tinggi yang benar adalah …',
        opsi: [
          { id: 'r15', label: '15 cm' },
          { id: 'r30', label: '30 cm' },
          { id: 'r20', label: '20 cm' },
          { id: 'r12', label: '12,5 cm' },
        ],
        correct: 'r15',
        umpan: {
          r15: 'Tepat! Jumlah lama 40 cm bertambah 20 cm menjadi 60 cm; 60 ÷ 4 = 15 cm.',
          r30: 'Itu hanya tinggi satu tanaman. Rerata memakai keempat tanaman.',
          r20: 'Selisih 20 cm harus dibagi rata ke 4 tanaman, bukan ditambahkan langsung ke rerata.',
          r12: 'Coba hitung lagi jumlahnya: 10 × 4 = 40, lalu 40 − 10 + 30 = 60.',
        },
        hints: ['Jumlah tinggi lama = 10 × 4 = 40 cm.', 'Jumlah yang benar = 40 − 10 + 30.'],
        pembahasan: 'Jumlah benar = 40 − 10 + 30 = 60 cm, rerata = 60 ÷ 4 = 15 cm.',
      },
      {
        id: 'p4',
        tipe: 'pilih',
        konteks: 'sekolah',
        cerita: 'Uang saku 5 murid (ribu rupiah): 10, 12, 10, 11, 57. Reratanya 20 ribu rupiah.',
        tanya: 'Apakah rerata 20 ribu mewakili uang saku kebanyakan murid?',
        opsi: [
          {
            id: 'kurang',
            label:
              'Kurang mewakili: satu nilai sangat besar (57) menarik rerata naik, padahal empat murid hanya 10–12 ribu',
          },
          { id: 'mewakili', label: 'Mewakili, karena rerata selalu menggambarkan semua murid' },
          { id: 'salah', label: 'Reratanya salah hitung' },
          { id: 'semua20', label: 'Mewakili, karena setiap murid membawa sekitar 20 ribu' },
        ],
        correct: 'kurang',
        umpan: {
          kurang:
            'Benar! Nilai 57 adalah pencilan yang menggeser rerata jauh dari kebanyakan data.',
          mewakili: 'Lihat datanya: empat murid membawa 10–12 ribu, jauh di bawah 20 ribu.',
          salah: 'Hitungannya benar: 100 ÷ 5 = 20. Masalahnya ada pada maknanya.',
          semua20:
            'Tidak ada murid yang membawa sekitar 20 ribu. Empat murid 10–12 ribu, satu 57 ribu.',
        },
        hints: ['Ingat Papan B: Nino dengan 14 buku menggeser titik seimbang.'],
        pembahasan:
          'Rerata 100 ÷ 5 = 20 ribu tertarik oleh pencilan 57. Rerata menjadi kurang mewakili kebanyakan data.',
      },
      {
        id: 'p5',
        tipe: 'pilih',
        konteks: 'sekolah',
        cerita:
          'Kelas VIII A (30 murid) memperoleh rerata nilai 78, sedangkan Kelas VIII B (25 murid) rerata 80.',
        tanya: 'Pernyataan yang benar adalah …',
        opsi: [
          {
            id: 'bLebih',
            label: 'Rata-rata murid VIII B lebih tinggi, walaupun jumlah nilai VIII A lebih besar',
          },
          { id: 'aLebih', label: 'Kelas VIII A lebih baik karena muridnya lebih banyak' },
          {
            id: 'setiap',
            label: 'Setiap murid VIII B nilainya lebih tinggi daripada setiap murid VIII A',
          },
          { id: 'tidakBisa', label: 'Tidak bisa dibandingkan karena banyak muridnya berbeda' },
        ],
        correct: 'bLebih',
        umpan: {
          bLebih:
            'Tepat! Jumlah nilai VIII A = 30 × 78 = 2.340 dan VIII B = 25 × 80 = 2.000, tetapi per murid VIII B lebih tinggi.',
          aLebih: 'Banyak murid tidak menunjukkan nilai yang lebih baik. Bandingkan reratanya.',
          setiap:
            'Rerata tidak menjamin nilai setiap murid. Bisa saja ada murid VIII A yang nilainya lebih tinggi.',
          tidakBisa:
            'Justru rerata membuat kelompok berbeda ukuran bisa dibandingkan — seperti lomba bank sampah.',
        },
        hints: ['Ingat lomba bank sampah: total besar belum tentu lebih rajin per anggota.'],
        pembahasan:
          'Rerata membandingkan per murid: 80 > 78. Jumlah nilai VIII A (2.340) lebih besar hanya karena muridnya lebih banyak.',
      },
      {
        id: 'p6',
        tipe: 'pilih',
        konteks: 'konsep',
        cerita: 'Bayangkan sembarang kumpulan data tunggal.',
        tanya: 'Rerata data tersebut selalu …',
        opsi: [
          {
            id: 'antara',
            label:
              'terletak di antara nilai terkecil dan terbesar (bisa sama bila semua data sama)',
          },
          { id: 'salahSatu', label: 'sama dengan salah satu nilai data' },
          { id: 'bulat', label: 'berupa bilangan bulat' },
          { id: 'lebihBesar', label: 'lebih besar daripada nilai yang paling sering muncul' },
        ],
        correct: 'antara',
        umpan: {
          antara:
            'Benar! Meratakan menara tidak pernah melebihi menara tertinggi atau di bawah menara terendah.',
          salahSatu: 'Rerata Regu Baca 3 adalah 2,5, padahal tidak ada data 2,5.',
          bulat: 'Rerata bisa desimal, seperti 2,5 buku atau 7,6 jam.',
          lebihBesar: 'Tidak selalu. Pada data 1, 5, 5, reratanya 3,67 — lebih kecil dari 5.',
        },
        hints: ['Pikirkan Lab Ratakan Menara: setinggi apa menara setelah rata?'],
        pembahasan:
          'Saat diratakan, menara tertinggi turun dan terendah naik, sehingga rerata selalu di antara nilai terkecil dan terbesar.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Refleksi',
    syntax: 'Penutup',
    goal: 'Merenungkan proses penemuan dan menilai pemahaman diri.',
    guru: 'Bacakan beberapa jawaban refleksi (tanpa nama). Jadikan pertanyaan ketiga tugas di rumah: mengumpulkan satu data tunggal di rumah, menghitung reratanya, dan menuliskan maknanya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri apa arti rerata dan bagaimana menghitungnya.',
        placeholder: 'Contoh: rerata itu seperti meratakan menara, jadi …',
      },
      {
        id: 'r2',
        teks: 'Kesalahan apa yang pernah kamu lakukan saat menghitung rerata? Bagaimana cara menghindarinya?',
        placeholder: 'Tulis dengan kalimatmu sendiri …',
      },
      {
        id: 'r3',
        teks: 'Sebutkan satu data di rumah atau sekolahmu yang reratanya berguna diketahui, dan untuk apa.',
        placeholder: 'Contoh: rerata pengeluaran listrik per bulan untuk …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat menentukan dan menafsirkan rerata data tunggal?',
    diriOpsi: [
      { id: 'sangat', label: '😄 Sangat yakin — bisa menjelaskan ke teman' },
      { id: 'yakin', label: '🙂 Yakin, sesekali masih perlu melihat catatan' },
      { id: 'ragu', label: '😐 Masih ragu pada beberapa bagian' },
      { id: 'belum', label: '😟 Belum yakin, perlu dibimbing lagi' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, penyelidikanmu tuntas!',
    teks: 'Kamu telah menemukan sendiri arti, cara menghitung, dan cara menafsirkan rerata data tunggal.',
    capaian: [
      'Meratakan menara balok dan menemukan bahwa jumlah data tidak berubah.',
      'Merumuskan rerata = jumlah seluruh nilai data ÷ banyak data, termasuk data bernilai 0.',
      'Menuliskan rerata yang tidak bulat sebagai bilangan desimal.',
      'Menemukan rerata sebagai titik seimbang dan mengamati pengaruh pencilan.',
      'Menafsirkan dan memakai rerata untuk membandingkan serta mengambil keputusan sehari-hari.',
    ],
  },
};
