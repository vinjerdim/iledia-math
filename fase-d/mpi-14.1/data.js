'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Relasi antara Dua Himpunan dalam Kehidupan Sehari-hari
   Fase D — SMP Kelas VIII · Topik 14 Relasi dan Fungsi

   Tujuan Pembelajaran:
   Menjelaskan konsep relasi sebagai hubungan antar-anggota dua
   himpunan melalui contoh dalam kehidupan sehari-hari.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'kumpul'
     Sintaks 4 — Data processing ............ tahap 'olah'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi     (7')  — "Papan Ekskul Kelas VIII-B": kartu cerita
                              lima murid dan ekskul yang diikutinya.
                              Murid MENDUGA aturan hubungan murid–ekskul
                              (tidak dinilai).
     2. Masalah       (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data          (20') — A: menarik panah murid → ekskul pada diagram
                              panah; B: mencentang tabel silang kota →
                              makanan khas; C: memilih chip pasangan
                              berurutan relasi "faktor dari" (ada pengecoh
                              terbalik). Semua diperiksa dengan diagnosa
                              kurang/lebih/terbalik.
     4. Olah data     (15') — tiga penyajian relasi ekskul disandingkan
                              (diagram panah, tabel, himpunan pasangan
                              berurutan); pertanyaan penuntun bertahap
                              (anggota tanpa pasangan, bercabang, urutan
                              pasangan, aturan, daerah hasil); kartu
                              istilah.
     5. Pembuktian    (15') — lab aturan: himpunan A dan B yang sama diberi
                              tiga aturan berbeda; murid memprediksi panah
                              lalu memeriksanya; membandingkan dugaan awal;
                              pilah miskonsepsi.
     6. Simpulan      (7')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap     (15') — delapan soal konteks (warna favorit, negara–
                              ibu kota, ukuran sepatu, hobi, makanan hewan,
                              alat musik) dan bilangan: pilihan ganda
                              berpengecoh, diagram panah, tabel silang, dan
                              chip pasangan berurutan.
     8. Refleksi      (5')  — refleksi tertulis & penilaian diri.

   Setiap relasi ditulis sebagai { labelA, labelB, namaRelasi, A, B,
   pasangan: [[a, b], …] } dan dirender dengan komponen seksi 25
   shared/engine.js (buildArrowDiagram, buildRelationTable,
   buildRelationListTable, buildPairChips, diagnosaRelasi,
   pesanDiagnosaRelasi). Relasi bilangan memuat `aturan` (faktor,
   setengah, kuadrat, lebih, duaKali) yang dicek ulang oleh
   tests/mpi-14.1-data.test.js; relasi konteks memuat `cerita`
   [{ a, b: [...], teks }] yang harus cocok dengan pasangannya.
   Pertanyaan bertanda `cek` ({ jenis: 'pasangan' | 'range' |
   'tanpaPasangan' | 'lebihSatu' }) kuncinya dihitung ulang oleh tes.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan, sehingga tiap murid
   (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  kasus: {
    kelas: 'VIII-B',
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; dibandingkan pada tahap Pembuktian.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati cerita pendaftaran ekskul lalu menduga aturan hubungan antara murid dan ekskul.',
    tp: 'Menjelaskan konsep relasi sebagai hubungan antar-anggota dua himpunan melalui contoh dalam kehidupan sehari-hari.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menyatakan hubungan antar-anggota dua himpunan dari cerita sehari-hari dengan diagram panah, tabel, dan pasangan berurutan.',
      'Menemukan bahwa relasi ditentukan oleh aturan hubungan, bukan oleh urutan atau tampilan anggota.',
      'Menjelaskan bahwa anggota himpunan pertama boleh tidak berpasangan atau berpasangan dengan lebih dari satu anggota himpunan kedua.',
      'Menentukan daerah asal, daerah kawan, dan daerah hasil sebuah relasi dalam konteks sehari-hari.',
    ],
    guru: 'Tayangkan Papan Ekskul. Tanyakan: "Bagaimana cara paling rapi menunjukkan siapa ikut ekskul apa?" Tampung semua dugaan tentang aturannya (harus satu-satu? boleh kosong?) tanpa dikoreksi — murid akan mengujinya sendiri.',
    judul: 'Papan Ekskul Kelas VIII-B',
    cerita:
      'Ketua kelas VIII-B sedang merekap pendaftaran ekstrakurikuler (ekskul). Ada lima murid dan lima pilihan ekskul. Setiap murid menceritakan ekskul yang diikutinya:',
    pertanyaan:
      'Dugaanmu: aturan apa yang berlaku pada hubungan “mengikuti ekskul” antara kelompok murid dan kelompok ekskul?',
    opsi: [
      { id: 'satu', label: 'Setiap murid harus dipasangkan dengan tepat satu ekskul.' },
      {
        id: 'bebas',
        label:
          'Seorang murid boleh dipasangkan dengan lebih dari satu ekskul, dan boleh ada murid tanpa pasangan.',
      },
      {
        id: 'semua',
        label: 'Setiap murid harus punya pasangan, tetapi boleh lebih dari satu ekskul.',
      },
      {
        id: 'tidak',
        label: 'Murid dan ekskul tidak bisa dihubungkan secara matematika.',
      },
    ],
    alasanLabel: 'Mengapa kamu menduga begitu?',
    alasanPlaceholder: 'Contoh: karena Nadia ikut … sedangkan Putri …',
    catatan:
      'Belum ada jawaban benar atau salah di sini. Simpan dugaanmu — nanti kamu sendiri yang akan membuktikannya.',
    nextLabel: 'Simpan Dugaan & Lanjut →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan inti tentang cara menyatakan hubungan antar-anggota dua himpunan.',
    guru: 'Arahkan agar pertanyaannya bersifat umum: berlaku untuk dua kelompok benda apa pun, bukan hanya murid dan ekskul. Tulis beberapa hipotesis di papan untuk diuji nanti.',
    pengantar:
      'Wali kelas ingin rekap ekskul yang mudah dibaca: siapa ikut apa, siapa yang belum ikut, dan ekskul mana yang belum ada peminatnya. Hubungan seperti ini juga muncul di banyak tempat lain — kota dan makanan khasnya, negara dan ibu kotanya, bilangan dan faktornya.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'relasi',
        label:
          'Bagaimana cara menyatakan hubungan antara anggota-anggota dua himpunan, dan aturan apa yang berlaku pada hubungan itu?',
      },
      { id: 'terbanyak', label: 'Ekskul mana yang paling banyak peminatnya?' },
      { id: 'jumlah', label: 'Berapa banyak murid di kelas VIII-B?' },
      { id: 'jadwal', label: 'Hari apa jadwal latihan futsal?' },
    ],
    correct: 'relasi',
    umpan: {
      relasi:
        '<strong>Tepat.</strong> Kita akan mengumpulkan beberapa contoh hubungan dua himpunan, menyajikannya dengan berbagai cara, lalu menemukan apa yang disebut <em>relasi</em>.',
      terbanyak:
        'Pertanyaan ini hanya menghitung satu ekskul, tidak menjelaskan cara menyatakan hubungan murid dengan ekskul. Coba pilih lagi.',
      jumlah:
        'Banyak murid hanya membahas satu himpunan saja, padahal yang kita selidiki adalah hubungan antara dua himpunan. Coba pilih lagi.',
      jadwal:
        'Jadwal latihan tidak berkaitan dengan hubungan antar-anggota himpunan. Coba pilih lagi.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu bagaimana cara paling jelas menunjukkan hubungan murid dan ekskul?',
    hipotesisPlaceholder: 'Contoh: mungkin dengan menarik garis dari … ke …',
    nextLabel: 'Mulai Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA
     A: diagram panah ekskul. B: tabel silang kota–makanan khas.
     C: chip pasangan berurutan "faktor dari".
     ---------------------------------------------------------- */
  kumpul: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengumpulkan data hubungan antar-anggota dua himpunan dengan diagram panah, tabel, dan pasangan berurutan.',
    guru: 'Minta pasangan murid membaca setiap kalimat cerita lalu menarik panah satu per satu. Jika murid bertanya "Putri ke mana?", kembalikan pertanyaannya: "Menurut ceritanya, Putri ikut ekskul apa?"',
    judulA: 'A. Diagram panah: murid → ekskul',
    instruksiA:
      'Ketuk nama murid, lalu ketuk ekskul yang diikutinya untuk menarik panah. Ketuk ekskul yang sama sekali lagi untuk menghapus panah. Gunakan cerita di bawah.',
    ekskul: {
      labelA: 'Murid',
      labelB: 'Ekskul',
      namaRelasi: 'mengikuti ekskul',
      A: ['Nadia', 'Raka', 'Sinta', 'Bima', 'Putri'],
      B: ['Futsal', 'Voli', 'Renang', 'Pramuka', 'Tari'],
      pasangan: [
        ['Nadia', 'Futsal'],
        ['Nadia', 'Pramuka'],
        ['Raka', 'Voli'],
        ['Sinta', 'Voli'],
        ['Sinta', 'Renang'],
        ['Bima', 'Futsal'],
      ],
      cerita: [
        {
          a: 'Nadia',
          b: ['Futsal', 'Pramuka'],
          teks: 'Nadia: “Aku ikut Futsal hari Selasa dan Pramuka hari Jumat.”',
        },
        { a: 'Raka', b: ['Voli'], teks: 'Raka: “Aku hanya ikut Voli.”' },
        {
          a: 'Sinta',
          b: ['Voli', 'Renang'],
          teks: 'Sinta: “Aku ikut Voli bersama Raka, juga Renang.”',
        },
        { a: 'Bima', b: ['Futsal'], teks: 'Bima: “Aku satu tim Futsal dengan Nadia.”' },
        {
          a: 'Putri',
          b: [],
          teks: 'Putri: “Semester ini aku belum ikut ekskul apa pun, aku fokus les musik.”',
        },
      ],
      hints: [
        'Kerjakan satu murid satu per satu: baca kalimatnya, lalu tarik panah ke setiap ekskul yang ia sebut.',
        'Nadia dan Sinta masing-masing menyebut dua ekskul. Putri tidak menyebut ekskul apa pun.',
      ],
      temuan:
        'Diagram panahmu lengkap: 6 panah. Perhatikan — Nadia dan Sinta punya dua panah, Putri tidak punya panah, dan tidak ada panah menuju Tari.',
    },
    judulB: 'B. Tabel silang: kota → makanan khas',
    instruksiB:
      'Hubungan dua himpunan juga bisa dicatat dengan tabel. Centang sel pada baris kota dan kolom makanan khasnya. Ketuk sel yang sama untuk menghapus centang.',
    kota: {
      labelA: 'Kota',
      labelB: 'Makanan',
      namaRelasi: 'punya makanan khas',
      A: ['Bandung', 'Palembang', 'Yogyakarta', 'Padang'],
      B: ['Batagor', 'Pempek', 'Gudeg', 'Bakpia', 'Rendang', 'Papeda'],
      pasangan: [
        ['Bandung', 'Batagor'],
        ['Palembang', 'Pempek'],
        ['Yogyakarta', 'Gudeg'],
        ['Yogyakarta', 'Bakpia'],
        ['Padang', 'Rendang'],
      ],
      cerita: [
        { a: 'Bandung', b: ['Batagor'], teks: 'Bandung terkenal dengan Batagor.' },
        { a: 'Palembang', b: ['Pempek'], teks: 'Oleh-oleh khas Palembang adalah Pempek.' },
        {
          a: 'Yogyakarta',
          b: ['Gudeg', 'Bakpia'],
          teks: 'Di Yogyakarta, wisatawan mencari Gudeg dan Bakpia.',
        },
        { a: 'Padang', b: ['Rendang'], teks: 'Rendang berasal dari Padang.' },
      ],
      hints: [
        'Setiap baris adalah satu kota. Baca kalimat kota itu, lalu centang kolom makanannya.',
        'Yogyakarta punya dua makanan khas. Papeda berasal dari Papua, yang tidak ada di daftar kota.',
      ],
      temuan:
        'Tabelmu lengkap: 5 centang. Yogyakarta berpasangan dengan dua makanan, sedangkan kolom Papeda kosong karena Papua tidak ada di himpunan kota.',
    },
    judulC: 'C. Pasangan berurutan: bilangan',
    instruksiC:
      'Hubungan juga bisa ditulis sebagai pasangan berurutan (a, b): a dari himpunan A, b dari himpunan B. Pilih SEMUA pasangan yang memenuhi aturan “a faktor dari b”, lalu periksa.',
    bilangan: {
      labelA: 'A',
      labelB: 'B',
      namaRelasi: 'faktor dari',
      aturan: 'faktor',
      A: [2, 3, 5],
      B: [4, 6, 9, 10],
      pasangan: [
        [2, 4],
        [2, 6],
        [2, 10],
        [3, 6],
        [3, 9],
        [5, 10],
      ],
      chips: [
        { id: 'c1', a: 2, b: 4 },
        { id: 'c2', a: 2, b: 6 },
        { id: 'c3', a: 2, b: 10 },
        { id: 'c4', a: 3, b: 6 },
        { id: 'c5', a: 3, b: 9 },
        { id: 'c6', a: 5, b: 10 },
        { id: 'x1', a: 4, b: 2 },
        { id: 'x2', a: 6, b: 3 },
        { id: 'x3', a: 3, b: 4 },
        { id: 'x4', a: 5, b: 6 },
        { id: 'x5', a: 2, b: 9 },
      ],
      hints: [
        '“a faktor dari b” artinya b habis dibagi a. Contoh: 2 faktor dari 6 karena 6 : 2 = 3.',
        'Bilangan pertama pada pasangan harus dari A = {2, 3, 5}. Pasangan seperti (4, 2) urutannya terbalik.',
      ],
      temuan:
        'Tepat: {(2, 4), (2, 6), (2, 10), (3, 6), (3, 9), (5, 10)}. Pasangan (4, 2) dan (6, 3) ditolak karena urutannya terbalik — anggota A selalu di depan.',
    },
    nextLabel: 'Olah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — OLAH DATA
     Tiga penyajian relasi ekskul → pertanyaan penuntun → istilah.
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 4 · Olah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Mengolah data relasi ekskul dalam tiga penyajian untuk menemukan ciri-ciri relasi.',
    guru: 'Minta setiap pasangan menunjuk satu panah pada diagram dan menemukan pasangannya di tabel serta di himpunan pasangan berurutan. Diskusikan mengapa Putri tetap ditulis di himpunan murid walaupun tidak punya panah.',
    instruksi:
      'Ini relasi “mengikuti ekskul” yang kamu kumpulkan, ditulis dengan tiga cara. Bandingkan ketiganya, lalu jawab pertanyaan penuntun satu per satu.',
    judulPenyajian: ['Diagram panah', 'Tabel', 'Himpunan pasangan berurutan'],
    pertanyaan: [
      {
        id: 'sama',
        tanya: 'Diagram panah, tabel, dan himpunan pasangan berurutan di atas …',
        opsi: [
          { id: 'sama', label: 'menyatakan hubungan yang sama dengan cara berbeda.' },
          { id: 'beda', label: 'menyatakan tiga hubungan yang berbeda.' },
          { id: 'diagram', label: 'hanya diagram panah yang benar-benar menunjukkan hubungan.' },
          { id: 'kurang', label: 'tabelnya kurang lengkap karena ada tanda “—”.' },
        ],
        correct: 'sama',
        umpan: {
          sama: '<strong>Tepat.</strong> Setiap panah Nadia → Futsal muncul sebagai baris Nadia: Futsal di tabel dan sebagai pasangan (Nadia, Futsal). Ketiganya setara.',
          beda: 'Coba telusuri panah Nadia → Futsal. Apakah ia juga ada di tabel dan di himpunan pasangan? Coba lagi.',
          diagram:
            'Tabel dan himpunan pasangan berurutan memuat informasi yang persis sama dengan panahnya. Coba lagi.',
          kurang:
            'Tanda “—” justru informasi: Putri tidak punya pasangan. Tidak ada data yang hilang. Coba lagi.',
        },
      },
      {
        id: 'tanpa',
        tanya: 'Anggota himpunan Murid yang tidak mempunyai pasangan adalah …',
        opsi: [
          { id: 'benar', label: 'Putri' },
          { id: 'bima', label: 'Bima' },
          { id: 'tari', label: 'Tari' },
          { id: 'tidakAda', label: 'Tidak ada, semua murid punya pasangan' },
        ],
        correct: 'benar',
        cek: { jenis: 'tanpaPasangan' },
        umpan: {
          benar:
            '<strong>Tepat.</strong> Putri tidak punya panah, tetapi ia tetap anggota himpunan Murid. Hubungan itu tetap sah: dalam relasi, <strong>boleh ada anggota himpunan pertama yang tidak berpasangan</strong>.',
          bima: 'Bima punya satu panah ke Futsal. Coba lagi.',
          tari: 'Tari adalah anggota himpunan Ekskul, bukan himpunan Murid. Coba lagi.',
          tidakAda: 'Lihat baris yang bertanda “—” di tabel. Coba lagi.',
        },
      },
      {
        id: 'banyak',
        tanya: 'Anggota himpunan Murid yang mempunyai lebih dari satu pasangan adalah …',
        opsi: [
          { id: 'benar', label: 'Nadia dan Sinta' },
          { id: 'rakaBima', label: 'Raka dan Bima' },
          { id: 'futsalVoli', label: 'Futsal dan Voli' },
          { id: 'putri', label: 'Putri' },
        ],
        correct: 'benar',
        cek: { jenis: 'lebihSatu' },
        umpan: {
          benar:
            '<strong>Tepat.</strong> Nadia dan Sinta masing-masing punya dua panah. Jadi, <strong>satu anggota himpunan pertama boleh berpasangan dengan lebih dari satu anggota himpunan kedua</strong>.',
          rakaBima: 'Raka dan Bima masing-masing hanya punya satu panah. Coba lagi.',
          futsalVoli:
            'Futsal dan Voli memang menerima dua panah, tetapi keduanya anggota himpunan Ekskul. Pertanyaannya tentang himpunan Murid. Coba lagi.',
          putri: 'Putri malah tidak punya pasangan sama sekali. Coba lagi.',
        },
      },
      {
        id: 'urutan',
        tanya: 'Mengapa pasangan berurutan (Nadia, Futsal) tidak boleh ditulis (Futsal, Nadia)?',
        opsi: [
          {
            id: 'benar',
            label:
              'Karena anggota himpunan pertama (Murid) selalu ditulis di depan, anggota himpunan kedua (Ekskul) di belakang.',
          },
          { id: 'abjad', label: 'Karena harus diurutkan menurut abjad.' },
          { id: 'pendek', label: 'Karena kata yang lebih pendek ditulis lebih dulu.' },
          { id: 'boleh', label: 'Sebenarnya boleh, keduanya sama saja.' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Urutan pada pasangan berurutan punya arti: (Nadia, Futsal) dibaca “Nadia mengikuti ekskul Futsal”. (Futsal, Nadia) akan dibaca “Futsal mengikuti ekskul Nadia” — tidak masuk akal.',
          abjad:
            'Futsal lebih dulu menurut abjad, tetapi pasangannya tetap (Nadia, Futsal). Urutannya bukan soal abjad. Coba lagi.',
          pendek:
            'Panjang kata tidak berpengaruh. Coba baca pasangan itu sebagai kalimat. Coba lagi.',
          boleh:
            'Ingat chip (4, 2) pada aturan “faktor dari”: 4 bukan faktor dari 2. Membalik urutan mengubah artinya. Coba lagi.',
        },
      },
      {
        id: 'aturan',
        tanya: 'Apa yang menentukan apakah seorang murid dipasangkan dengan sebuah ekskul?',
        opsi: [
          {
            id: 'benar',
            label: 'Aturan hubungannya, yaitu “mengikuti ekskul”, sesuai cerita.',
          },
          { id: 'posisi', label: 'Posisi nama murid dan ekskul di dalam daftar.' },
          { id: 'huruf', label: 'Huruf awal nama murid dan nama ekskul.' },
          { id: 'acak', label: 'Dipilih secara acak oleh ketua kelas.' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Hubungan yang memasangkan anggota satu himpunan dengan anggota himpunan lain menurut aturan tertentu disebut <strong>relasi</strong>. “Mengikuti ekskul” adalah nama relasinya.',
          posisi:
            'Jika daftar diacak ulang, Nadia tetap mengikuti Futsal dan Pramuka. Posisi tidak menentukan. Coba lagi.',
          huruf:
            'Nadia berpasangan dengan Futsal dan Pramuka — huruf awalnya tidak sama dengan N. Coba lagi.',
          acak: 'Pasangan dibuat berdasarkan cerita setiap murid, bukan diacak. Coba lagi.',
        },
      },
      {
        id: 'range',
        tanya:
          'Himpunan anggota Ekskul yang menerima panah disebut daerah hasil (range). Daerah hasil relasi ini adalah …',
        opsi: [
          { id: 'benar', label: '{Futsal, Voli, Renang, Pramuka}' },
          { id: 'kodomain', label: '{Futsal, Voli, Renang, Pramuka, Tari}' },
          { id: 'domain', label: '{Nadia, Raka, Sinta, Bima}' },
          { id: 'dua', label: '{Futsal, Voli}' },
        ],
        correct: 'benar',
        cek: { jenis: 'range' },
        umpan: {
          benar:
            '<strong>Tepat.</strong> Tari tidak menerima panah, jadi tidak termasuk daerah hasil — walaupun tetap anggota himpunan Ekskul (daerah kawan).',
          kodomain:
            'Itu seluruh himpunan Ekskul (daerah kawan). Apakah Tari menerima panah? Coba lagi.',
          domain:
            'Itu anggota himpunan Murid yang punya pasangan. Daerah hasil diambil dari himpunan kedua. Coba lagi.',
          dua: 'Futsal dan Voli hanya ekskul yang menerima dua panah. Ekskul yang menerima satu panah juga termasuk. Coba lagi.',
        },
      },
    ],
    istilah: [
      {
        label: 'Relasi',
        teks: 'Aturan yang memasangkan anggota himpunan A dengan anggota himpunan B, mis. “mengikuti ekskul”.',
      },
      {
        label: 'Daerah asal (domain)',
        teks: 'Himpunan pertama, asal panah: {Nadia, Raka, Sinta, Bima, Putri}.',
      },
      {
        label: 'Daerah kawan (kodomain)',
        teks: 'Himpunan kedua, tujuan panah: {Futsal, Voli, Renang, Pramuka, Tari}.',
      },
      {
        label: 'Daerah hasil (range)',
        teks: 'Anggota daerah kawan yang menerima panah: {Futsal, Voli, Renang, Pramuka}.',
      },
      {
        label: 'Tiga cara penyajian',
        teks: 'Diagram panah, tabel, dan himpunan pasangan berurutan (a, b).',
      },
    ],
    nextLabel: 'Buktikan Temuanmu →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN
     A: lab tiga aturan. B: dugaan awal. C: pilah miskonsepsi.
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Membuktikan bahwa aturan menentukan pasangan relasi dan menguji dugaan awal tentang relasi.',
    guru: 'Minta murid memprediksi panah sebelum menekan Periksa. Setelah ketiga aturan terbukti, tanyakan: "Himpunannya sama, mengapa diagramnya berbeda?" Arahkan pada kesimpulan bahwa aturanlah yang menentukan relasi.',
    judulA: 'A. Lab Aturan: himpunan sama, aturan berbeda',
    instruksiA:
      'Himpunan A = {2, 3, 4} dan B = {4, 6, 8, 9} tetap sama. Untuk setiap aturan, tarik panah dari a ke b yang memenuhi “a … b”, lalu tekan Periksa.',
    lab: {
      labelA: 'A',
      labelB: 'B',
      A: [2, 3, 4],
      B: [4, 6, 8, 9],
      aturan: [
        {
          id: 'setengah',
          namaRelasi: 'setengah dari',
          aturan: 'setengah',
          pasangan: [
            [2, 4],
            [3, 6],
            [4, 8],
          ],
          hints: ['a setengah dari b artinya b = 2 × a. Contoh: 3 setengah dari 6.'],
          temuan: 'Setiap anggota A tepat punya satu pasangan: (2, 4), (3, 6), (4, 8).',
        },
        {
          id: 'faktor',
          namaRelasi: 'faktor dari',
          aturan: 'faktor',
          pasangan: [
            [2, 4],
            [2, 6],
            [2, 8],
            [3, 6],
            [3, 9],
            [4, 4],
            [4, 8],
          ],
          hints: [
            'a faktor dari b artinya b habis dibagi a.',
            'Jangan lupa: 4 juga faktor dari 4 sendiri (4 : 4 = 1).',
          ],
          temuan: 'Kali ini 2 punya tiga pasangan, 3 dan 4 masing-masing dua pasangan.',
        },
        {
          id: 'kuadrat',
          namaRelasi: 'kuadratnya',
          aturan: 'kuadrat',
          pasangan: [
            [2, 4],
            [3, 9],
          ],
          hints: [
            '“a kuadratnya b” artinya a × a = b. Contoh: 3 × 3 = 9.',
            '4 × 4 = 16. Apakah 16 ada di B?',
          ],
          temuan:
            'Hanya (2, 4) dan (3, 9). Anggota 4 tidak punya pasangan karena 16 tidak ada di B — dan relasinya tetap sah.',
        },
      ],
      kesimpulan:
        'Himpunan A dan B tidak berubah, tetapi tiga aturan menghasilkan tiga relasi berbeda. Jadi, <strong>aturan hubungannya yang menentukan pasangan-pasangan relasi</strong>.',
    },
    dugaanBenar: 'bebas',
    judulB: 'B. Bandingkan dengan dugaan awalmu',
    judulC: 'C. Pilah pernyataan',
    instruksiC: 'Berdasarkan semua data dan lab, pilah setiap pernyataan: benar atau salah?',
    opsiPilah: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pilah: [
      {
        id: 'v1',
        teks: 'Setiap anggota himpunan pertama harus mempunyai pasangan.',
        correct: 'salah',
        explanation:
          'Putri tidak punya ekskul dan 4 tidak punya pasangan pada aturan “kuadratnya”, tetapi keduanya tetap relasi yang sah.',
      },
      {
        id: 'v2',
        teks: 'Satu anggota himpunan pertama boleh dipasangkan dengan lebih dari satu anggota himpunan kedua.',
        correct: 'benar',
        explanation: 'Nadia mengikuti Futsal dan Pramuka; 2 faktor dari 4, 6, dan 8.',
      },
      {
        id: 'v3',
        teks: 'Pada relasi “mengikuti ekskul”, pasangan (Futsal, Nadia) sama artinya dengan (Nadia, Futsal).',
        correct: 'salah',
        explanation:
          'Pasangan berurutan: anggota himpunan pertama di depan. (Futsal, Nadia) tidak termasuk relasi ini.',
      },
      {
        id: 'v4',
        teks: 'Relasi hanya bisa dibuat antara himpunan bilangan.',
        correct: 'salah',
        explanation:
          'Murid–ekskul dan kota–makanan khas adalah relasi antara himpunan yang anggotanya bukan bilangan.',
      },
      {
        id: 'v5',
        teks: 'Dua himpunan yang sama dapat mempunyai relasi yang berbeda, tergantung aturannya.',
        correct: 'benar',
        explanation:
          'Lab Aturan: A dan B tetap, tetapi “setengah dari”, “faktor dari”, dan “kuadratnya” menghasilkan pasangan berbeda.',
      },
      {
        id: 'v6',
        teks: 'Anggota himpunan kedua yang tidak menerima panah tetap termasuk daerah kawan, tetapi tidak termasuk daerah hasil.',
        correct: 'benar',
        explanation:
          'Tari dan Papeda tetap anggota himpunan kedua (daerah kawan), tetapi tidak termasuk daerah hasil.',
      },
    ],
    nextLabel: 'Tarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN (GENERALISASI)
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Menyusun kesimpulan umum tentang pengertian, penyajian, dan ciri-ciri relasi.',
    guru: 'Setelah kalimat lengkap, minta beberapa murid menyebut satu contoh relasi lain dari kehidupan sehari-hari (mis. murid–warna favorit, hewan–makanannya) beserta nama relasinya.',
    instruksi:
      'Lengkapi setiap awal kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan dipakai paling banyak satu kali, dan ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'Relasi dari himpunan A ke himpunan B adalah', correct: 'b1' },
      { id: 'k2', awal: 'Sebuah relasi dapat disajikan dengan', correct: 'b2' },
      { id: 'k3', awal: 'Pada pasangan berurutan (a, b),', correct: 'b3' },
      { id: 'k4', awal: 'Dalam sebuah relasi, anggota himpunan A', correct: 'b4' },
      { id: 'k5', awal: 'Daerah hasil (range) adalah', correct: 'b5' },
    ],
    bank: [
      {
        id: 'b1',
        teks: 'aturan yang memasangkan anggota-anggota himpunan A dengan anggota-anggota himpunan B.',
      },
      { id: 'b2', teks: 'diagram panah, tabel, atau himpunan pasangan berurutan.' },
      {
        id: 'b3',
        teks: 'a anggota himpunan A dan b anggota himpunan B; urutannya tidak boleh ditukar.',
      },
      {
        id: 'b4',
        teks: 'boleh tidak berpasangan atau berpasangan dengan lebih dari satu anggota himpunan B.',
      },
      { id: 'b5', teks: 'himpunan anggota B yang mempunyai pasangan di A.' },
      { id: 'x1', teks: 'daftar anggota himpunan A yang diurutkan menurut abjad.' },
      { id: 'x2', teks: 'diagram panah saja.' },
      { id: 'x3', teks: 'urutan a dan b boleh ditukar tanpa mengubah arti.' },
      { id: 'x4', teks: 'harus berpasangan dengan tepat satu anggota himpunan B.' },
      { id: 'x5', teks: 'seluruh anggota himpunan B.' },
    ],
    rangkuman: [
      'Relasi adalah aturan yang menghubungkan anggota-anggota himpunan A (daerah asal) dengan anggota-anggota himpunan B (daerah kawan).',
      'Relasi dapat disajikan dengan diagram panah, tabel, atau himpunan pasangan berurutan (a, b) dengan a ∈ A dan b ∈ B.',
      'Anggota A boleh tidak berpasangan atau berpasangan dengan lebih dari satu anggota B.',
      'Daerah hasil (range) adalah anggota B yang mempunyai pasangan; himpunan yang sama dapat mempunyai relasi berbeda bila aturannya berbeda.',
    ],
    nextLabel: 'Terapkan Konsepnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     tipe 'pilih' : pilihan ganda (opsi diacak app.js); `tampil`
                    menentukan penyajian relasi pada soal.
     tipe 'panah' : tarik panah pada diagram.
     tipe 'tabel' : centang tabel silang.
     tipe 'chips' : pilih pasangan berurutan.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan konsep',
    goal: 'Menyatakan dan menafsirkan relasi antar-anggota dua himpunan dalam berbagai konteks sehari-hari.',
    guru: 'Biarkan murid mengerjakan mandiri. Catat pesan diagnosa yang sering muncul (mis. pasangan terbalik atau mengira daerah hasil = daerah kawan) untuk dibahas bersama di akhir.',
    instruksi:
      'Kerjakan setiap soal. Ada soal pilihan ganda, menarik panah, mencentang tabel, dan memilih pasangan berurutan. Gunakan tombol nomor untuk berpindah soal.',
    soal: [
      {
        id: 's1',
        tipe: 'pilih',
        tampil: 'cerita',
        labelA: 'Murid',
        labelB: 'Warna',
        namaRelasi: 'menyukai warna',
        A: ['Dodi', 'Eka', 'Fajar', 'Gina'],
        B: ['Merah', 'Biru', 'Hijau'],
        pasangan: [
          ['Dodi', 'Biru'],
          ['Eka', 'Merah'],
          ['Fajar', 'Biru'],
          ['Gina', 'Hijau'],
        ],
        cerita:
          'Dodi dan Fajar menyukai warna Biru, Eka menyukai Merah, dan Gina menyukai Hijau. Relasinya “menyukai warna” dari himpunan Murid ke himpunan Warna.',
        tanya: 'Himpunan pasangan berurutan yang tepat untuk relasi itu adalah …',
        opsi: [
          { id: 'benar', label: '{(Dodi, Biru), (Eka, Merah), (Fajar, Biru), (Gina, Hijau)}' },
          { id: 'terbalik', label: '{(Biru, Dodi), (Merah, Eka), (Biru, Fajar), (Hijau, Gina)}' },
          { id: 'kurang', label: '{(Dodi, Biru), (Eka, Merah), (Gina, Hijau)}' },
          { id: 'salah', label: '{(Dodi, Biru), (Eka, Merah), (Fajar, Hijau), (Gina, Hijau)}' },
        ],
        correct: 'benar',
        cek: { jenis: 'pasangan' },
        umpan: {
          benar: '<strong>Tepat!</strong>',
          terbalik:
            'Urutannya terbalik. Anggota himpunan pertama (Murid) ditulis di depan: (Dodi, Biru).',
          kurang: 'Ada pasangan yang hilang. Fajar juga menyukai warna Biru.',
          salah: 'Fajar menyukai Biru, bukan Hijau. Baca lagi ceritanya.',
        },
        hints: ['Tulis satu pasangan untuk setiap kalimat “… menyukai …”, nama murid di depan.'],
        pembahasan:
          'Setiap murid dipasangkan dengan warna yang disukainya, nama murid di depan: (Dodi, Biru), (Eka, Merah), (Fajar, Biru), (Gina, Hijau). Dua murid boleh berpasangan dengan warna yang sama.',
      },
      {
        id: 's2',
        tipe: 'panah',
        labelA: 'Negara',
        labelB: 'Kota',
        namaRelasi: 'beribu kota',
        A: ['Indonesia', 'Malaysia', 'Thailand', 'Jepang'],
        B: ['Jakarta', 'Tokyo', 'Bangkok', 'Manila', 'Kuala Lumpur'],
        pasangan: [
          ['Indonesia', 'Jakarta'],
          ['Malaysia', 'Kuala Lumpur'],
          ['Thailand', 'Bangkok'],
          ['Jepang', 'Tokyo'],
        ],
        cerita:
          'Untuk tugas IPS, buatlah diagram panah relasi “beribu kota” dari himpunan Negara ke himpunan Kota.',
        hints: [
          'Ibu kota Indonesia adalah Jakarta, ibu kota Malaysia adalah Kuala Lumpur.',
          'Manila adalah ibu kota Filipina, yang tidak ada di himpunan Negara.',
        ],
        pembahasan:
          'Indonesia → Jakarta, Malaysia → Kuala Lumpur, Thailand → Bangkok, Jepang → Tokyo. Manila tidak menerima panah, jadi daerah hasilnya {Jakarta, Tokyo, Bangkok, Kuala Lumpur}.',
      },
      {
        id: 's3',
        tipe: 'tabel',
        labelA: 'Murid',
        labelB: 'Ukuran',
        namaRelasi: 'memakai sepatu ukuran',
        A: ['Gita', 'Hana', 'Iwan', 'Joko'],
        B: [37, 38, 39, 40],
        pasangan: [
          ['Gita', 37],
          ['Hana', 38],
          ['Iwan', 40],
          ['Joko', 40],
        ],
        cerita:
          'Pendataan sepatu olahraga: Gita memakai ukuran 37, Hana ukuran 38, sedangkan Iwan dan Joko sama-sama memakai ukuran 40. Centang tabel relasi “memakai sepatu ukuran”.',
        hints: ['Setiap baris adalah satu murid; centang satu kolom ukuran sepatunya.'],
        pembahasan:
          'Centang (Gita, 37), (Hana, 38), (Iwan, 40), (Joko, 40). Kolom 39 kosong: tidak ada yang memakai ukuran 39.',
      },
      {
        id: 's4',
        tipe: 'chips',
        labelA: 'P',
        labelB: 'Q',
        namaRelasi: 'lebih dari',
        aturan: 'lebih',
        A: [3, 5, 7],
        B: [4, 6],
        pasangan: [
          [5, 4],
          [7, 4],
          [7, 6],
        ],
        chips: [
          { id: 'c1', a: 5, b: 4 },
          { id: 'c2', a: 7, b: 4 },
          { id: 'c3', a: 7, b: 6 },
          { id: 'x1', a: 4, b: 5 },
          { id: 'x2', a: 6, b: 7 },
          { id: 'x3', a: 3, b: 4 },
          { id: 'x4', a: 5, b: 6 },
        ],
        cerita:
          'Diketahui P = {3, 5, 7} dan Q = {4, 6}. Pilih semua pasangan berurutan relasi “lebih dari” dari P ke Q.',
        hints: [
          'Untuk setiap a di P, cari b di Q dengan a lebih besar dari b.',
          '3 tidak lebih dari 4 maupun 6, jadi 3 tidak punya pasangan.',
        ],
        pembahasan:
          '5 lebih dari 4; 7 lebih dari 4 dan 6. Jadi {(5, 4), (7, 4), (7, 6)}. Pasangan (4, 5) dan (6, 7) urutannya terbalik.',
      },
      {
        id: 's5',
        tipe: 'pilih',
        tampil: 'panah',
        labelA: 'Murid',
        labelB: 'Hobi',
        namaRelasi: 'mempunyai hobi',
        A: ['Lina', 'Maya', 'Niko', 'Oki'],
        B: ['Membaca', 'Menggambar', 'Bersepeda', 'Memasak'],
        pasangan: [
          ['Lina', 'Membaca'],
          ['Maya', 'Membaca'],
          ['Maya', 'Menggambar'],
          ['Niko', 'Membaca'],
        ],
        cerita: 'Diagram panah berikut menunjukkan relasi “mempunyai hobi” di kelompok belajar.',
        tanya: 'Daerah hasil (range) relasi tersebut adalah …',
        opsi: [
          { id: 'benar', label: '{Membaca, Menggambar}' },
          { id: 'kodomain', label: '{Membaca, Menggambar, Bersepeda, Memasak}' },
          { id: 'domain', label: '{Lina, Maya, Niko}' },
          { id: 'satu', label: '{Membaca}' },
        ],
        correct: 'benar',
        cek: { jenis: 'range' },
        umpan: {
          benar: '<strong>Tepat!</strong>',
          kodomain:
            'Itu daerah kawan (seluruh himpunan Hobi). Bersepeda dan Memasak tidak menerima panah.',
          domain: 'Itu anggota himpunan Murid. Daerah hasil diambil dari himpunan kedua.',
          satu: 'Menggambar juga menerima panah dari Maya.',
        },
        hints: ['Daerah hasil = anggota himpunan Hobi yang menerima sedikitnya satu panah.'],
        pembahasan:
          'Panah menuju Membaca (dari Lina, Maya, Niko) dan Menggambar (dari Maya). Daerah hasilnya {Membaca, Menggambar}. Oki tidak punya panah — itu tetap sah.',
      },
      {
        id: 's6',
        tipe: 'pilih',
        tampil: 'daftar',
        labelA: 'Hewan',
        labelB: 'Makanan',
        namaRelasi: 'memakan',
        A: ['Kucing', 'Kambing', 'Kelinci', 'Ayam'],
        B: ['Ikan', 'Rumput', 'Wortel', 'Jagung'],
        pasangan: [
          ['Kucing', 'Ikan'],
          ['Kambing', 'Rumput'],
          ['Kelinci', 'Wortel'],
          ['Kelinci', 'Rumput'],
          ['Ayam', 'Jagung'],
        ],
        cerita:
          'Tabel berikut menunjukkan relasi “memakan” dari himpunan Hewan ke himpunan Makanan di kebun sekolah.',
        tanya: 'Anggota daerah asal yang mempunyai lebih dari satu pasangan adalah …',
        opsi: [
          { id: 'benar', label: 'Kelinci' },
          { id: 'kucing', label: 'Kucing' },
          { id: 'rumput', label: 'Rumput' },
          { id: 'ayam', label: 'Ayam' },
        ],
        correct: 'benar',
        cek: { jenis: 'lebihSatu' },
        umpan: {
          benar: '<strong>Tepat!</strong>',
          kucing: 'Kucing hanya berpasangan dengan Ikan.',
          rumput:
            'Rumput memang dipasangkan dua kali, tetapi Rumput anggota daerah kawan (Makanan), bukan daerah asal.',
          ayam: 'Ayam hanya berpasangan dengan Jagung.',
        },
        hints: ['Lihat baris tabel yang berisi lebih dari satu makanan.'],
        pembahasan:
          'Kelinci memakan Wortel dan Rumput, jadi Kelinci punya dua pasangan: (Kelinci, Wortel) dan (Kelinci, Rumput).',
      },
      {
        id: 's7',
        tipe: 'panah',
        labelA: 'K',
        labelB: 'L',
        namaRelasi: 'dua kali dari',
        aturan: 'duaKali',
        A: [4, 6, 8],
        B: [1, 2, 3, 4, 5],
        pasangan: [
          [4, 2],
          [6, 3],
          [8, 4],
        ],
        cerita:
          'Diketahui K = {4, 6, 8} dan L = {1, 2, 3, 4, 5}. Gambarlah diagram panah relasi “dua kali dari” dari K ke L.',
        hints: ['“a dua kali dari b” artinya a = 2 × b. Contoh: 6 dua kali dari 3.'],
        pembahasan:
          '4 = 2 × 2, 6 = 2 × 3, 8 = 2 × 4. Jadi panahnya 4 → 2, 6 → 3, 8 → 4. Anggota 1 dan 5 di L tidak menerima panah.',
      },
      {
        id: 's8',
        tipe: 'pilih',
        tampil: 'tabel',
        labelA: 'Murid',
        labelB: 'Alat musik',
        namaRelasi: 'memainkan',
        A: ['Putu', 'Rina', 'Sandi', 'Tono'],
        B: ['Gitar', 'Piano', 'Angklung'],
        pasangan: [
          ['Putu', 'Gitar'],
          ['Putu', 'Angklung'],
          ['Rina', 'Piano'],
          ['Tono', 'Angklung'],
        ],
        cerita:
          'Tabel silang berikut menunjukkan relasi “memainkan” dari himpunan Murid ke himpunan Alat musik untuk pentas seni.',
        tanya: 'Anggota daerah asal yang tidak mempunyai pasangan adalah …',
        opsi: [
          { id: 'benar', label: 'Sandi' },
          { id: 'rina', label: 'Rina' },
          { id: 'tono', label: 'Tono' },
          { id: 'tidakAda', label: 'Tidak ada, setiap murid pasti punya pasangan' },
        ],
        correct: 'benar',
        cek: { jenis: 'tanpaPasangan' },
        umpan: {
          benar: '<strong>Tepat!</strong>',
          rina: 'Rina mempunyai centang pada kolom Piano.',
          tono: 'Tono mempunyai centang pada kolom Angklung.',
          tidakAda: 'Perhatikan baris yang tidak memiliki centang sama sekali.',
        },
        hints: ['Cari baris yang semua selnya kosong.'],
        pembahasan:
          'Baris Sandi tidak bercentang, jadi Sandi tidak punya pasangan. Relasinya tetap sah karena anggota daerah asal boleh tidak berpasangan.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses menemukan dan menerapkan konsep relasi.',
    guru: 'Baca jawaban refleksi secara acak. Murid yang masih menganggap setiap anggota harus berpasangan tepat satu perlu didampingi — konsep itu akan dibahas khusus pada materi fungsi.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri apa itu relasi, lalu beri satu contoh dari kehidupanmu sehari-hari.',
        placeholder: 'Relasi adalah … Contohnya relasi “…” dari himpunan … ke himpunan …',
      },
      {
        id: 'r2',
        teks: 'Di antara diagram panah, tabel, dan pasangan berurutan, penyajian mana yang paling mudah bagimu? Mengapa?',
        placeholder: 'Yang paling mudah adalah … karena …',
      },
      {
        id: 'r3',
        teks: 'Kesalahan apa yang paling perlu kamu waspadai saat menuliskan sebuah relasi?',
        placeholder: 'Aku perlu ingat bahwa …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat menjelaskan konsep relasi sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '🙂 Yakin — aku bisa menyajikan relasi dengan tiga cara' },
      { id: 'ragu', label: '🤔 Masih ragu soal urutan pasangan atau daerah hasil' },
      { id: 'bantuan', label: '🙋 Aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, rekap ekskul Kelas VIII-B kini rapi!',
    teks: 'Kamu tidak sekadar menghafal definisi — kamu menarik panah, mencentang tabel, memilih pasangan berurutan, menguji aturan, lalu menemukan sendiri apa itu relasi.',
    capaian: [
      'Menyatakan hubungan antar-anggota dua himpunan dengan diagram panah, tabel, dan himpunan pasangan berurutan.',
      'Menemukan bahwa aturan hubungan yang menentukan pasangan-pasangan relasi.',
      'Menjelaskan bahwa anggota daerah asal boleh tidak berpasangan atau berpasangan lebih dari satu.',
      'Menentukan daerah asal, daerah kawan, dan daerah hasil relasi.',
      'Menerapkan konsep relasi pada berbagai contoh kehidupan sehari-hari.',
    ],
  },
};
