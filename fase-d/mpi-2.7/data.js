'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Literasi Finansial — Diskon, Untung–Rugi & Anggaran
   Sederhana — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menerapkan operasi aritmatika bilangan real dalam menyelesaikan
   masalah literasi finansial, seperti diskon, untung-rugi, dan
   penyusunan anggaran sederhana.

   Notasi di berkas ini (lihat engine seksi 66):
     • uang ditulis sebagai ANGKA rupiah (250000 = Rp250.000) dan persen
       sebagai angka (20 = 20%);
     • langkah isian memakai `jenis` engine: 'diskonAkhir',
       'diskonPotongan', 'diskonSetara', 'promo', 'untungBesar',
       'untungPersen', 'hargaJual', 'sisaAnggaran', 'persenPos', 'nilai'
       — kuncinya DIHITUNG engine (jawabFinansial), bukan ditulis tangan.

   Model pembelajaran: PROBLEM BASED LEARNING (PBL).
   Masalah pemantik: "Stand Es Teh Lemon 7D di Bazar Kewirausahaan".
   Kelompok memegang dana kas kelas Rp500.000 dan harus:
     • berbelanja paling hemat — paket bahan Rp250.000 (Toko Grosir Maju:
       diskon 20% + 10%; Toko Sumber Rejeki: diskon 30%) dan 80 cup
       Rp1.000 (Maju: beli 3 gratis 1; Rejeki: diskon 20%);
     • menentukan harga jual per gelas agar untung 25% dari modal, dan
       menghitung akibatnya bila penjualan sepi (hanya 60 gelas);
     • menyusun anggaran dana kas yang tidak defisit, menyisihkan
       tabungan ≥ 20%, dan membatasi belanja keinginan ≤ 10%.
   Konflik kognitif: "diskon 20% + 10% = diskon 30%" (padahal 28%) dan
   "untung Rp80.000 dari Rp400.000 = 20%" (persen dari harga jual,
   padahal terhadap modal = 25%).

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ....... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar . 'organisasi'
     Sintaks 3 — Membimbing penyelidikan ............ 'selidikDiskon',
                                                      'selidikUntung',
                                                      'selidikAnggaran'
     Sintaks 4 — Mengembangkan & menyajikan karya ... 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi ........ 'evaluasi'
     Penerapan & penutup ............................ 'terapkan', 'refleksi',
                                                      'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — murid menduga, merumuskan masalah dan
       hipotesis, memilih peran, memilah sub-masalah, menyusun rencana,
       lalu menguji dugaannya sendiri dan merefleksikan strateginya.
     • Bermakna (meaningful) — semua hitungan berasal dari keputusan
       usaha yang nyata: toko mana yang dipilih, berapa harga jual,
       bagaimana dana kas dibagi; hasilnya langsung menjadi keputusan.
     • Menggembirakan (joyful) — Lab Diskon yang bisa diatur, Timbangan
       Untung–Rugi yang miring, Papan Anggaran dengan daftar syarat yang
       tercentang, "detektif" solusi kelompok lain, dan poster rencana
       usaha yang dipresentasikan.

   Rangkaian aktivitas (± 2 × 40 menit; kelompok 3–4 murid):
     1. Orientasi   (8')  — cerita, papan promo dua toko, dugaan awal
                            (tidak dinilai), rumusan masalah, hipotesis.
     2. Organisasi  (6')  — memilih peran, memilah sub-masalah ke diskon /
                            untung–rugi / anggaran, menyusun rencana kerja.
     3. Selidik A   (12') — Lab Diskon (diskon tunggal vs bertingkat),
                            promo beli–gratis, isian berdiagnosa, temuan.
     4. Selidik B   (12') — Timbangan Untung–Rugi, harga pokok, untung &
                            persennya, rugi saat sepi, isian, temuan.
     5. Selidik C   (10') — memilah kebutuhan/keinginan/tabungan, Papan
                            Anggaran sampai semua syarat terpenuhi, temuan.
     6. Karya       (10') — Papan Rencana Usaha: enam langkah hitung,
                            keputusan, pesan kelompok → poster & struk.
     7. Evaluasi    (10') — detektif solusi kelompok lain, dugaan vs hasil,
                            menyusun simpulan.
     8. Uji terap   (8')  — 8 soal acak dari bank 14 soal.
     9. Refleksi    (4')  — rekap capaian, refleksi tertulis, keyakinan.

   Catatan pengacakan: SEMUA daftar pilihan di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di urutan pertama). app.js
   mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / ensureTapOrderState / shuffleArray dari
   shared/engine.js) dan menyimpannya di State, sehingga tiap murid dan
   tiap Reset mendapat urutan berbeda. Pilihan buatan engine
   (opsiFinansial pada soal pilihan ganda uji terap) diacak dengan cara
   yang sama.
   ============================================================ */

var PBL = 'Problem Based Learning';

var DATA = {
  meta: {
    judul: 'Literasi Finansial: Diskon, Untung–Rugi & Anggaran Sederhana',
  },

  tahap: [
    { id: 'orientasi', label: 'Masalah' },
    { id: 'organisasi', label: 'Organisasi' },
    { id: 'selidikDiskon', label: 'Lab Diskon' },
    { id: 'selidikUntung', label: 'Untung–Rugi' },
    { id: 'selidikAnggaran', label: 'Anggaran' },
    { id: 'karya', label: 'Karya' },
    { id: 'evaluasi', label: 'Evaluasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Label konteks soal: ikon + nama. */
  konteks: {
    belanja: { ikon: '🛒', nama: 'Belanja' },
    dagang: { ikon: '🏷️', nama: 'Berdagang' },
    anggaran: { ikon: '🐷', nama: 'Anggaran' },
  },

  /* ----------------------------------------------------------
     Data masalah pemantik — dipakai di beberapa tahap.
     ---------------------------------------------------------- */
  barang: {
    bahan: { nama: 'Paket bahan es teh lemon', ikon: '🍋', harga: 250000, qty: 1 },
    cup: { nama: 'Cup plastik + tutup', ikon: '🥤', harga: 1000, qty: 80 },
    pelengkap: { nama: 'Es batu, gula & kantong', ikon: '🧊', biaya: 85000 },
  },
  toko: [
    {
      id: 'maju',
      nama: 'Toko Grosir Maju',
      ikon: '🏪',
      promo: {
        bahan: { jenis: 'bertingkat', persen: [20, 10], label: 'Diskon 20% + 10%' },
        cup: { jenis: 'beliGratis', beli: 3, gratis: 1, label: 'Beli 3 gratis 1' },
      },
    },
    {
      id: 'rejeki',
      nama: 'Toko Sumber Rejeki',
      ikon: '🏬',
      promo: {
        bahan: { jenis: 'diskon', persen: 30, label: 'Diskon 30%' },
        cup: { jenis: 'diskon', persen: 20, label: 'Diskon 20%' },
      },
    },
  ],
  usaha: {
    gelas: 80,
    targetPersen: 25,
    hargaJual: 5000,
    terjualSepi: 60,
    modal: 320000,
  },
  anggaran: {
    dana: 500000,
    langkah: 5000,
    pos: [
      { id: 'belanja', nama: 'Bahan & cup', ikon: '🛒', jenis: 'kebutuhan' },
      { id: 'pelengkap', nama: 'Es batu & gula', ikon: '🧊', jenis: 'kebutuhan' },
      { id: 'dekorasi', nama: 'Dekorasi stand', ikon: '🎈', jenis: 'keinginan' },
      { id: 'hadiah', nama: 'Hadiah undian', ikon: '🎁', jenis: 'keinginan' },
      { id: 'tabungan', nama: 'Tabungan kas', ikon: '🐷', jenis: 'tabungan' },
    ],
    /* Draf anggaran Raka (sengaja belum memenuhi syarat). */
    draf: { belanja: 235000, pelengkap: 85000, dekorasi: 80000, hadiah: 60000, tabungan: 40000 },
    syarat: {
      tabunganMinPersen: 20,
      keinginanMaksPersen: 10,
      wajib: { belanja: 235000, pelengkap: 85000 },
    },
  },

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI PADA MASALAH (PBL sintaks 1)
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Evaluasi.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi pada Masalah',
    syntax: PBL + ' · Sintaks 1',
    goal: 'Memahami masalah usaha stand bazar dan merumuskan apa yang harus diselesaikan kelompok.',
    guru: 'Bacakan cerita dengan antusias dan tunjukkan papan promo kedua toko. Biarkan murid menebak — dugaan TIDAK dinilai. Pancing konflik: "Diskon 20% + 10% sama saja dengan 30%, kan?" dan "Untung Rp80.000 dari Rp400.000 itu 20%?" Jangan beri jawaban; arahkan ke rumusan masalah dan hipotesis kelompok.',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Menerapkan operasi aritmatika bilangan real dalam menyelesaikan masalah literasi finansial, seperti diskon, untung-rugi, dan penyusunan anggaran sederhana.',
    kriteria: [
      'Menghitung potongan dan harga setelah diskon tunggal, diskon bertingkat, serta promo beli–gratis, lalu memilih penawaran yang paling hemat.',
      'Menentukan untung atau rugi beserta persennya terhadap harga beli, dan menentukan harga jual dari persen untung yang direncanakan.',
      'Menyusun anggaran sederhana yang tidak defisit dan menyisihkan tabungan, lalu menghitung sisa dan persen setiap pos.',
      'Menjelaskan keputusan keuangan berdasarkan perhitungan dan memeriksa kewajarannya.',
    ],
    judul: 'Stand Es Teh Lemon 7D di Bazar Kewirausahaan',
    pengantar:
      'Bulan depan sekolah mengadakan Bazar Kewirausahaan. Kelas 7D membuka stand es teh lemon dan memegang dana kas kelas Rp500.000. Pak Bima, wali kelas, berpesan: "Belanjalah sehemat mungkin, tentukan harga jual yang membuat kita untung 25%, dan jangan habiskan semua uang kas — sisihkan tabungan!" Dua toko grosir menawarkan promo yang berbeda.',
    catatanKelompok: [
      'Kita membuat 80 gelas es teh lemon.',
      'Belanja: 1 paket bahan es teh lemon (harga normal Rp250.000) dan 80 cup plastik (Rp1.000 per buah).',
      'Es batu, gula & kantong dibeli di kantin: Rp85.000 (tanpa promo).',
      'Target: untung 25% dari modal. Dana kas: Rp500.000.',
    ],
    dugaan: [
      {
        id: 'dDiskon',
        tanya:
          'Paket bahan Rp250.000: di Toko Maju diskon 20% + 10%, di Toko Rejeki diskon 30%. Mana yang lebih murah?',
        opsi: [
          { id: 'rejeki', label: 'Toko Rejeki lebih murah' },
          { id: 'sama', label: 'Sama saja, keduanya diskon 30%' },
          { id: 'maju', label: 'Toko Maju lebih murah' },
        ],
        baku: 'rejeki',
        pembahasan:
          'Toko Maju: Rp250.000 → Rp200.000 → Rp180.000 (setara diskon 28%). Toko Rejeki: Rp175.000.',
      },
      {
        id: 'dUntung',
        tanya:
          'Jika modal Rp320.000 dan seluruh es teh terjual Rp400.000, berapa persen untungnya?',
        opsi: [
          { id: 'p25', label: '25%' },
          { id: 'p20', label: '20%' },
          { id: 'p80', label: '80%' },
        ],
        baku: 'p25',
        pembahasan: 'Untung Rp80.000 dibandingkan modal Rp320.000: 80.000 : 320.000 × 100% = 25%.',
      },
      {
        id: 'dTabung',
        tanya: 'Kapan sebaiknya uang tabungan kas disisihkan?',
        opsi: [
          { id: 'awal', label: 'Di awal, saat menyusun anggaran' },
          { id: 'sisa', label: 'Dari sisa setelah semua keperluan dibeli' },
          { id: 'tidak', label: 'Tidak perlu, uang kas boleh habis' },
        ],
        baku: 'awal',
        pembahasan:
          'Tabungan yang direncanakan di awal pasti tersedia; tabungan "dari sisa" sering tidak tersisa sama sekali.',
      },
    ],
    alasanLabel: 'Bagaimana kelompokmu menebak? Tulis alasan singkatnya.',
    alasanPlaceholder: 'Contoh: kami menjumlahkan 20% dan 10% karena …',
    pertanyaan: 'Apa masalah utama yang harus diselesaikan kelompokmu?',
    masalahOpsi: [
      {
        id: 'rencana',
        label:
          'Menghitung belanja paling hemat, harga jual agar untung 25%, dan anggaran dana kas yang tetap menyisakan tabungan',
      },
      { id: 'rasa', label: 'Memilih rasa es teh yang paling disukai pembeli' },
      {
        id: 'semua',
        label: 'Menghabiskan dana kas Rp500.000 untuk membuat stand semeriah mungkin',
      },
      { id: 'pembeli', label: 'Menebak berapa banyak pembeli yang akan datang ke bazar' },
    ],
    masalahCorrect: 'rencana',
    masalahUmpan: {
      rencana:
        'Tepat! Ada tiga sub-masalah yang semuanya bisa dihitung: diskon, untung–rugi, dan anggaran.',
      rasa: 'Rasa penting untuk penjualan, tetapi tidak bisa dihitung dari catatan kelompok.',
      semua: 'Pak Bima justru berpesan agar uang kas tidak dihabiskan. Baca lagi pesannya.',
      pembeli:
        'Banyak pembeli tidak bisa dipastikan. Kita akan menghitung beberapa kemungkinan penjualan nanti.',
    },
    hipotesisLabel:
      'Hipotesis kelompok: bagaimana cara menghitung harga setelah dua kali diskon, dan persen untung dibandingkan dengan apa?',
    hipotesisPlaceholder: 'Contoh: kami menduga diskon kedua dihitung dari …',
    nextLabel: 'Bagi Tugas Kelompok →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENGORGANISASI MURID (PBL sintaks 2)
     ---------------------------------------------------------- */
  organisasi: {
    kicker: 'Tahap 2 · Mengorganisasi Belajar',
    syntax: PBL + ' · Sintaks 2',
    goal: 'Membagi peran, memilah sub-masalah menurut jenisnya, dan menyusun rencana kerja kelompok.',
    guru: 'Pastikan setiap anggota memegang peran berbeda. Saat memilah, minta murid menunjuk kata kunci ("diskon", "untung", "sisa", "tabungan") sebelum memilih jenis masalah. Rencana kerja dipakai sebagai daftar periksa selama penyelidikan.',
    peranLabel: 'Pilih peranmu di kelompok',
    peran: [
      { id: 'surveyor', label: '🔎 Surveyor harga — membandingkan promo toko' },
      { id: 'bendahara', label: '💼 Bendahara — menghitung modal & anggaran' },
      { id: 'penjual', label: '🏷️ Penjual — menentukan harga jual' },
      { id: 'pencatat', label: '📝 Pencatat — menulis kalimat matematika & presentasi' },
    ],
    judulPilah: 'Pilah sub-masalah: termasuk masalah apa?',
    opsiPilah: [
      { id: 'diskon', label: 'Diskon & promo' },
      { id: 'untung', label: 'Untung–rugi' },
      { id: 'anggaran', label: 'Anggaran' },
    ],
    pilah: [
      {
        id: 'pBahan',
        teks: 'Harga paket bahan Rp250.000 setelah diskon 20% + 10%',
        correct: 'diskon',
        explanation: 'Ada potongan harga dalam persen — ini masalah diskon.',
      },
      {
        id: 'pCup',
        teks: 'Harga 80 cup dengan promo beli 3 gratis 1',
        correct: 'diskon',
        explanation: 'Promo beli–gratis juga memotong harga yang dibayar.',
      },
      {
        id: 'pJual',
        teks: 'Harga jual per gelas agar untung 25% dari modal',
        correct: 'untung',
        explanation: 'Membandingkan harga jual dengan modal adalah masalah untung–rugi.',
      },
      {
        id: 'pSepi',
        teks: 'Akibatnya bila hanya 60 gelas yang terjual',
        correct: 'untung',
        explanation: 'Pendapatan bisa lebih kecil dari modal — kita menghitung untung atau rugi.',
      },
      {
        id: 'pTabung',
        teks: 'Berapa rupiah dana kas yang disisihkan untuk tabungan',
        correct: 'anggaran',
        explanation: 'Membagi dana kas ke beberapa pos termasuk menyusun anggaran.',
      },
      {
        id: 'pDekor',
        teks: 'Batas uang untuk dekorasi stand dan hadiah undian',
        correct: 'anggaran',
        explanation: 'Batas belanja setiap pos ditentukan dalam anggaran.',
      },
    ],
    judulRencana: 'Susun rencana kerja kelompok',
    instruksiRencana: 'Ketuk kartu sesuai urutan langkah yang akan kalian jalankan.',
    rencana: [
      { id: 'banding', label: '🏪 Bandingkan harga promo di dua toko' },
      { id: 'modal', label: '🧾 Hitung modal total' },
      { id: 'jual', label: '🏷️ Tentukan harga jual per gelas' },
      { id: 'risiko', label: '⚖️ Hitung untung/rugi bila penjualan sepi' },
      { id: 'anggaran', label: '🐷 Susun anggaran & tabungan kas' },
      { id: 'sajikan', label: '🎤 Sajikan rencana usaha' },
    ],
    nextLabel: 'Mulai Penyelidikan A →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENYELIDIKAN A: LAB DISKON (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikDiskon: {
    kicker: 'Tahap 3 · Penyelidikan A — Lab Diskon',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menemukan cara menghitung harga setelah diskon tunggal, diskon bertingkat, dan promo beli–gratis.',
    guru: 'Biarkan murid mengatur Lab Diskon sendiri: samakan diskon 20% + 10% lalu 30% + 0%, dan bandingkan harga akhirnya. Tanyakan: "Diskon 10% itu dihitung dari harga yang mana?" Arahkan murid menulis kalimat matematika sebelum mengetik jawaban.',
    labJudul: '🔬 Lab Diskon: paket bahan Rp250.000',
    labTeks:
      'Atur diskon pertama dan diskon tambahan. Coba 20% + 10% (Toko Maju), lalu 30% + 0% (Toko Rejeki). Perhatikan batang harga dan kotak "diskon setara".',
    labHarga: 250000,
    labAwal: { p1: 0, p2: 0 },
    labMisi: [
      { id: 'mMaju', p1: 20, p2: 10, teks: 'Atur 20% + 10% seperti Toko Maju' },
      { id: 'mRejeki', p1: 30, p2: 0, teks: 'Atur 30% + 0% seperti Toko Rejeki' },
    ],
    instruksi: 'Tulis kalimat matematikanya di buku, lalu isi jawabanmu.',
    langkah: [
      {
        id: 'ld1',
        jenis: 'diskonPotongan',
        harga: 250000,
        persen: 20,
        label: 'Potongan pertama di Toko Maju: 20% × Rp250.000 = …',
        hints: ['20% = 20/100.', '20/100 × 250.000 = 250.000 : 100 × 20.'],
      },
      {
        id: 'ld2',
        jenis: 'diskonAkhir',
        harga: 250000,
        persen: [20, 10],
        label: 'Harga bahan di Toko Maju setelah diskon 20% lalu 10% = …',
        hints: [
          'Setelah diskon 20%, harganya Rp200.000.',
          'Diskon 10% dihitung dari Rp200.000: 10% × 200.000 = 20.000.',
        ],
        temuan:
          'Diskon kedua dihitung dari harga yang SUDAH turun, jadi potongannya lebih kecil daripada 10% × Rp250.000.',
      },
      {
        id: 'ld3',
        jenis: 'diskonSetara',
        persen: [20, 10],
        label: 'Diskon 20% + 10% setara dengan diskon tunggal berapa persen?',
        hints: [
          'Potongan total = Rp250.000 − Rp180.000.',
          'Persen = potongan total : harga awal × 100%.',
        ],
        temuan:
          '20% + 10% hanya setara 28%, bukan 30%. Jadi Toko Rejeki (diskon 30%) lebih hemat untuk bahan.',
      },
      {
        id: 'ld4',
        jenis: 'promo',
        promo: { jenis: 'beliGratis', harga: 1000, beli: 3, gratis: 1 },
        qty: 80,
        label: 'Harga 80 cup di Toko Maju (Rp1.000 per cup, beli 3 gratis 1) = …',
        hints: [
          'Satu paket = beli 3 dapat 4 cup. 80 cup = 80 : 4 = 20 paket.',
          'Yang dibayar 20 × 3 = 60 cup.',
        ],
        temuan:
          'Beli 3 gratis 1 berarti membayar 3 dari 4 barang — setara diskon 25%, lebih hemat daripada diskon 20% di Toko Rejeki (Rp64.000).',
      },
    ],
    amati: [
      {
        id: 'aBertingkat',
        tanya: 'Mengapa diskon 20% + 10% tidak sama dengan diskon 30%?',
        opsi: [
          {
            id: 'sisa',
            label: 'Diskon 10% dihitung dari harga setelah diskon pertama (Rp200.000)',
          },
          { id: 'kasir', label: 'Karena kasir Toko Maju salah menghitung' },
          { id: 'jumlah', label: 'Sebenarnya sama, persen diskon boleh dijumlahkan' },
          { id: 'besar', label: 'Diskon 10% dihitung dari harga yang lebih besar dari Rp250.000' },
        ],
        correct: 'sisa',
        umpan: {
          sisa: 'Tepat! Dasar perhitungan diskon kedua lebih kecil, jadi potongannya juga lebih kecil.',
          kasir:
            'Hitunganmu di Lab Diskon sama dengan kasir. Lihat dasar perhitungan diskon kedua.',
          jumlah:
            'Coba lagi di Lab Diskon: 20% + 10% menghasilkan Rp180.000, sedangkan 30% Rp175.000.',
          besar: 'Diskon kedua dihitung dari harga yang sudah TURUN, bukan yang lebih besar.',
        },
      },
      {
        id: 'aGratis',
        tanya: 'Promo "beli 3 gratis 1" setara dengan diskon berapa persen?',
        opsi: [
          { id: 'p25', label: '25%' },
          { id: 'p33', label: '33%' },
          { id: 'p75', label: '75%' },
          { id: 'p30', label: '30%' },
        ],
        correct: 'p25',
        umpan: {
          p25: 'Tepat! 1 dari 4 cup gratis: 1/4 = 25%.',
          p33: 'Kamu membandingkan 1 gratis dengan 3 yang dibayar. Bandingkan dengan SEMUA cup yang dibawa pulang (4).',
          p75: '75% adalah bagian yang DIBAYAR (3 dari 4), bukan yang gratis.',
          p30: 'Hitung lagi: dari setiap 4 cup, berapa yang gratis?',
        },
      },
      {
        id: 'aPilih',
        tanya: 'Jadi, belanja paling hemat untuk kelompok kita adalah …',
        opsi: [
          { id: 'campur', label: 'Bahan di Toko Rejeki, cup di Toko Maju' },
          { id: 'maju', label: 'Semua di Toko Maju' },
          { id: 'rejeki', label: 'Semua di Toko Rejeki' },
          { id: 'tukar', label: 'Bahan di Toko Maju, cup di Toko Rejeki' },
        ],
        correct: 'campur',
        umpan: {
          campur: 'Tepat! Rp175.000 + Rp60.000 = Rp235.000 — kombinasi termurah.',
          maju: 'Rp180.000 + Rp60.000 = Rp240.000. Ada kombinasi yang lebih murah.',
          rejeki: 'Rp175.000 + Rp64.000 = Rp239.000. Ada kombinasi yang lebih murah.',
          tukar: 'Rp180.000 + Rp64.000 = Rp244.000 — justru paling mahal.',
        },
      },
    ],
    nextLabel: 'Lanjut ke Penyelidikan B →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENYELIDIKAN B: UNTUNG–RUGI (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikUntung: {
    kicker: 'Tahap 4 · Penyelidikan B — Untung & Rugi',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menentukan untung atau rugi beserta persennya terhadap modal, serta harga jual dari target untung.',
    guru: 'Minta murid memainkan Timbangan: mulai dari impas (Rp4.000 × 80 gelas), naikkan harga jual, lalu kurangi banyak terjual. Tanyakan: "Persen untung dibandingkan dengan uang yang mana: modal atau pendapatan?" Diskusikan risiko bila penjualan sepi.',
    modalRincian: [
      { nama: 'Bahan (Toko Rejeki)', nilai: 175000 },
      { nama: '80 cup (Toko Maju)', nilai: 60000 },
      { nama: 'Es batu, gula & kantong', nilai: 85000 },
    ],
    timbangJudul: '⚖️ Timbangan Untung–Rugi',
    timbangTeks:
      'Modal kelompok Rp320.000. Atur harga jual per gelas dan banyak gelas yang terjual. Lengan yang lebih berat akan turun.',
    timbangAwal: { jual: 4000, terjual: 80 },
    timbangOpsi: {
      modal: 320000,
      satuan: 'gelas',
      langkahJual: 500,
      minJual: 2000,
      maksJual: 8000,
      langkahTerjual: 4,
      maksTerjual: 100,
    },
    instruksi: 'Tulis kalimat matematikanya di buku, lalu isi jawabanmu.',
    langkah: [
      {
        id: 'lu1',
        jenis: 'nilai',
        jawab: 4000,
        label: 'Harga pokok (modal) per gelas: Rp320.000 : 80 gelas = …',
        hints: ['Bagi modal total dengan banyak gelas.', '320.000 : 80 = 32.000 : 8.'],
        temuan: 'Bila dijual Rp4.000 per gelas, kelompok IMPAS — tidak untung, tidak rugi.',
      },
      {
        id: 'lu2',
        jenis: 'untungBesar',
        beli: 320000,
        jual: 400000,
        label: 'Dijual Rp5.000 per gelas dan 80 gelas terjual (Rp400.000). Besar untungnya = …',
        hints: ['Untung = pendapatan − modal.', '400.000 − 320.000.'],
      },
      {
        id: 'lu3',
        jenis: 'untungPersen',
        beli: 320000,
        jual: 400000,
        label: 'Persen untungnya terhadap modal = …',
        hints: ['Persen untung = untung : modal × 100%.', '80.000 : 320.000 = 1/4.'],
        temuan:
          'Persen untung selalu dibandingkan dengan MODAL (harga beli), bukan dengan pendapatan.',
      },
      {
        id: 'lu4',
        jenis: 'untungBesar',
        beli: 320000,
        jual: 300000,
        label: 'Bila penjualan sepi, hanya 60 gelas terjual (Rp300.000). Besar kerugiannya = …',
        hints: [
          'Pendapatan lebih kecil dari modal → rugi.',
          'Rugi = modal − pendapatan = 320.000 − 300.000.',
        ],
      },
      {
        id: 'lu5',
        jenis: 'untungPersen',
        beli: 320000,
        jual: 300000,
        label: 'Persen kerugiannya terhadap modal = …',
        hints: ['Persen rugi = rugi : modal × 100%.', '20.000 : 320.000 × 100%.'],
        temuan: 'Rugi 6,25% — kecil, tetapi tetap rugi. Kelompok perlu cadangan dana.',
      },
    ],
    amati: [
      {
        id: 'aDasar',
        tanya: 'Persen untung atau rugi dihitung dengan membandingkan untung/rugi terhadap …',
        opsi: [
          { id: 'modal', label: 'modal (harga beli)' },
          { id: 'jual', label: 'pendapatan (harga jual)' },
          { id: 'dana', label: 'dana kas Rp500.000' },
          { id: 'gelas', label: 'banyak gelas yang terjual' },
        ],
        correct: 'modal',
        umpan: {
          modal: 'Tepat! Untung 25% berarti untungnya seperempat dari modal.',
          jual: 'Itu kekeliruan yang sering terjadi: Rp80.000 : Rp400.000 = 20%, bukan 25%.',
          dana: 'Dana kas tidak semuanya dipakai sebagai modal. Bandingkan dengan modal Rp320.000.',
          gelas: 'Banyak gelas tidak bersatuan rupiah. Persen membandingkan dua nilai rupiah.',
        },
      },
      {
        id: 'aImpas',
        tanya:
          'Dengan harga Rp5.000 per gelas, berapa gelas MINIMAL harus terjual agar tidak rugi?',
        opsi: [
          { id: 'g64', label: '64 gelas' },
          { id: 'g60', label: '60 gelas' },
          { id: 'g80', label: '80 gelas' },
          { id: 'g65', label: '65 gelas' },
        ],
        correct: 'g64',
        umpan: {
          g64: 'Tepat! 64 × Rp5.000 = Rp320.000 = modal (impas). Coba di Timbangan.',
          g60: '60 × Rp5.000 = Rp300.000, masih kurang dari modal → rugi.',
          g80: '80 gelas memang untung, tetapi bukan yang paling sedikit.',
          g65: '65 gelas sudah untung, tetapi ada jumlah yang lebih sedikit yang sudah impas.',
        },
      },
      {
        id: 'aHargaJual',
        tanya: 'Harga jual per gelas agar untung 25% dihitung dengan …',
        opsi: [
          { id: 'kali', label: 'Rp4.000 + 25% × Rp4.000 = Rp5.000' },
          { id: 'tambah', label: 'Rp4.000 + 25 = Rp4.025' },
          { id: 'untung', label: '25% × Rp4.000 = Rp1.000' },
          { id: 'kurang', label: 'Rp4.000 − 25% × Rp4.000 = Rp3.000' },
        ],
        correct: 'kali',
        umpan: {
          kali: 'Tepat! Harga jual = harga beli + untung, dan untung = 25% × harga beli.',
          tambah:
            'Angka persen tidak boleh langsung ditambahkan ke rupiah. Ubah dulu 25% menjadi rupiah.',
          untung: 'Rp1.000 itu baru untungnya. Harga jual = harga beli + untung.',
          kurang:
            'Mengurangkan berarti RUGI 25%. Untuk untung, harga jual lebih besar dari harga beli.',
        },
      },
    ],
    nextLabel: 'Lanjut ke Penyelidikan C →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENYELIDIKAN C: ANGGARAN (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikAnggaran: {
    kicker: 'Tahap 5 · Penyelidikan C — Anggaran Dana Kas',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menyusun anggaran sederhana yang tidak defisit dan menyisihkan tabungan, serta menghitung sisa dan persen pos.',
    guru: 'Saat memilah, minta murid menjelaskan beda kebutuhan dan keinginan dengan contoh mereka sendiri. Di Papan Anggaran, biarkan kelompok berdebat pos mana yang dikurangi; tekankan bahwa tabungan disisihkan di awal, bukan dari sisa.',
    judulPilah: 'Kebutuhan, keinginan, atau tabungan?',
    opsiPilah: [
      { id: 'kebutuhan', label: 'Kebutuhan' },
      { id: 'keinginan', label: 'Keinginan' },
      { id: 'tabungan', label: 'Tabungan' },
    ],
    pilah: [
      {
        id: 'kBahan',
        teks: '🍋 Paket bahan es teh lemon',
        correct: 'kebutuhan',
        explanation: 'Tanpa bahan, es teh tidak bisa dibuat — wajib dibeli.',
      },
      {
        id: 'kCup',
        teks: '🥤 Cup plastik + tutup',
        correct: 'kebutuhan',
        explanation: 'Es teh harus diberi wadah untuk dijual.',
      },
      {
        id: 'kLampu',
        teks: '💡 Lampu hias berkedip untuk spanduk',
        correct: 'keinginan',
        explanation: 'Membuat stand meriah, tetapi stand tetap bisa berjualan tanpanya.',
      },
      {
        id: 'kHadiah',
        teks: '🎁 Hadiah undian untuk pembeli',
        correct: 'keinginan',
        explanation: 'Menarik pembeli, tetapi tidak wajib — besarnya perlu dibatasi.',
      },
      {
        id: 'kKas',
        teks: '🐷 Dana cadangan dikembalikan ke kas kelas',
        correct: 'tabungan',
        explanation: 'Uang yang disisihkan untuk keperluan mendatang atau bila penjualan sepi.',
      },
      {
        id: 'kKaus',
        teks: '👕 Kaus seragam baru untuk penjaga stand',
        correct: 'keinginan',
        explanation: 'Penjaga stand tetap bisa memakai seragam sekolah.',
      },
    ],
    papanJudul: '🐷 Papan Anggaran Dana Kas',
    papanTeks:
      'Ini draf anggaran Raka. Ubah nilai setiap pos dengan tombol − dan + sampai SEMUA syarat tercentang.',
    papanSelesai:
      'Anggaranmu memenuhi semua syarat! Pos kebutuhan aman, keinginan dibatasi, dan tabungan disisihkan lebih dulu.',
    instruksi: 'Hitung dengan teliti, lalu isi jawabanmu.',
    langkah: [
      {
        id: 'la1',
        jenis: 'sisaAnggaran',
        pemasukan: 500000,
        pengeluaran: [235000, 85000, 50000],
        label:
          'Dana kas Rp500.000 dipakai untuk bahan & cup Rp235.000, es batu & gula Rp85.000, serta dekorasi & hadiah Rp50.000. Sisa dana = …',
        hints: [
          'Jumlahkan dulu semua pengeluaran.',
          'Sisa = 500.000 − (235.000 + 85.000 + 50.000).',
        ],
      },
      {
        id: 'la2',
        jenis: 'persenPos',
        pemasukan: 500000,
        nilai: 100000,
        label: 'Tabungan kas Rp100.000 dari dana Rp500.000 = … % dana',
        hints: ['Persen pos = nilai pos : dana × 100%.', '100.000 : 500.000 = 1/5.'],
        temuan:
          'Tabungan 20% memenuhi syarat Pak Bima, dan masih tersisa Rp30.000 sebagai cadangan.',
      },
    ],
    amati: [
      {
        id: 'aTabungAwal',
        tanya: 'Mengapa tabungan sebaiknya disisihkan di AWAL penyusunan anggaran?',
        opsi: [
          { id: 'pasti', label: 'Agar tabungan pasti ada dan belanja menyesuaikan sisanya' },
          { id: 'banyak', label: 'Agar uang belanja keinginan bisa lebih banyak' },
          { id: 'aturan', label: 'Karena tabungan selalu harus 50% dari dana' },
          { id: 'sama', label: 'Sama saja, disisihkan di awal atau dari sisa hasilnya pasti sama' },
        ],
        correct: 'pasti',
        umpan: {
          pasti: 'Tepat! "Bayar dirimu dulu": sisihkan tabungan, baru belanjakan sisanya.',
          banyak: 'Justru sebaliknya — tabungan di awal membatasi belanja keinginan.',
          aturan: 'Besar tabungan bergantung kesepakatan. Di sini syaratnya minimal 20%.',
          sama: 'Pada draf Raka, tabungan "dari sisa" hanya Rp40.000 (8%). Hasilnya tidak sama.',
        },
      },
      {
        id: 'aDefisit',
        tanya: 'Anggaran disebut DEFISIT bila …',
        opsi: [
          { id: 'lebih', label: 'jumlah pengeluaran lebih besar daripada pemasukan' },
          { id: 'sisa', label: 'masih ada sisa uang' },
          { id: 'tabung', label: 'ada pos tabungan' },
          { id: 'sama', label: 'pengeluaran sama dengan pemasukan' },
        ],
        correct: 'lebih',
        umpan: {
          lebih: 'Tepat! Sisa = pemasukan − pengeluaran bernilai negatif.',
          sisa: 'Masih ada sisa berarti anggaran aman, bukan defisit.',
          tabung: 'Pos tabungan justru membuat anggaran lebih sehat.',
          sama: 'Bila sama, sisanya Rp0 — pas, belum defisit.',
        },
      },
    ],
    nextLabel: 'Susun Karya Kelompok →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGEMBANGKAN & MENYAJIKAN KARYA (PBL sintaks 4)
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 6 · Mengembangkan & Menyajikan Karya',
    syntax: PBL + ' · Sintaks 4',
    goal: 'Menyusun Papan Rencana Usaha berisi perhitungan, keputusan, dan pesan kelompok untuk dipresentasikan.',
    guru: 'Setiap kelompok mengisi Papan Rencana Usaha, lalu Penyaji/Pencatat mempresentasikan poster dan struknya (± 2 menit). Kelompok lain menyiapkan satu pertanyaan "mengapa" untuk sesi evaluasi.',
    instruksi:
      'Isi keenam langkah hitung. Setiap langkah terbuka setelah langkah sebelumnya benar.',
    langkah: [
      {
        id: 'k1',
        jenis: 'diskonAkhir',
        harga: 250000,
        persen: [20, 10],
        label: 'Bahan di Toko Maju (diskon 20% + 10%) = …',
        hints: ['250.000 → 200.000 → …', 'Diskon 10% dari Rp200.000 = Rp20.000.'],
      },
      {
        id: 'k2',
        jenis: 'diskonAkhir',
        harga: 250000,
        persen: 30,
        label: 'Bahan di Toko Rejeki (diskon 30%) = …',
        hints: ['30% × 250.000 = 75.000.', 'Harga akhir = 250.000 − 75.000.'],
      },
      {
        id: 'k3',
        jenis: 'promo',
        promo: { jenis: 'diskon', harga: 1000, persen: 20 },
        qty: 80,
        label: '80 cup di Toko Rejeki (Rp1.000 per cup, diskon 20%) = …',
        hints: ['Harga normal 80 × Rp1.000 = Rp80.000.', 'Diskon 20% dari Rp80.000.'],
      },
      {
        id: 'k4',
        jenis: 'nilai',
        jawab: 320000,
        label:
          'Modal termurah = bahan termurah + cup termurah (Toko Maju Rp60.000) + es batu & gula Rp85.000 = …',
        hints: ['Bahan termurah Rp175.000 (Toko Rejeki).', '175.000 + 60.000 + 85.000.'],
      },
      {
        id: 'k5',
        jenis: 'hargaJual',
        beli: 4000,
        persen: 25,
        status: 'untung',
        label: 'Harga pokok Rp4.000 per gelas. Harga jual agar untung 25% = …',
        hints: ['Untung = 25% × Rp4.000.', 'Harga jual = Rp4.000 + untung.'],
      },
      {
        id: 'k6',
        jenis: 'sisaAnggaran',
        pemasukan: 500000,
        pengeluaran: [320000, 100000],
        label:
          'Dari dana kas Rp500.000 dipakai modal Rp320.000 dan disisihkan tabungan Rp100.000. Sisa untuk dekorasi & hadiah = …',
        hints: ['Jumlahkan modal dan tabungan.', 'Sisa = 500.000 − 420.000.'],
      },
    ],
    keputusan: {
      tanya: 'Keputusan kelompok:',
      opsi: [
        {
          id: 'tepat',
          label:
            'Bahan di Toko Rejeki, cup di Toko Maju, jual Rp5.000 per gelas, tabungan Rp100.000, dekorasi & hadiah paling banyak Rp50.000',
        },
        {
          id: 'maju',
          label:
            'Semua belanja di Toko Maju karena diskonnya 20% + 10% = 30%, jual Rp5.000 per gelas',
        },
        {
          id: 'murah',
          label: 'Jual Rp4.000 per gelas supaya laris, sisa uang kas untuk dekorasi',
        },
        {
          id: 'habis',
          label: 'Habiskan Rp500.000: modal Rp320.000 dan Rp180.000 untuk dekorasi & hadiah',
        },
      ],
      correct: 'tepat',
      umpan: {
        tepat: 'Keputusan yang didukung perhitungan! Siap dipresentasikan.',
        maju: 'Ingat temuan Lab Diskon: 20% + 10% hanya setara 28%, bahan di Toko Maju lebih mahal.',
        murah: 'Rp4.000 = harga pokok, artinya impas (untung 0%). Target kelompok untung 25%.',
        habis:
          'Tidak ada tabungan dan keinginan melebihi 10% dana — syarat Pak Bima tidak terpenuhi.',
      },
    },
    pesanLabel: 'Pesan kelompok untuk pembeli/teman (ditampilkan di poster)',
    pesanPlaceholder: 'Contoh: Belanja cerdas, untung pas, kas tetap aman!',
    posterJudul: 'Rencana Usaha Stand Es Teh Lemon 7D',
    posterFooter: 'Dihitung bersama oleh kelompok — siap dipresentasikan.',
    nextLabel: 'Lanjut ke Evaluasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENGANALISIS & MENGEVALUASI (PBL sintaks 5)
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 7 · Menganalisis & Mengevaluasi',
    syntax: PBL + ' · Sintaks 5',
    goal: 'Memeriksa solusi kelompok lain, membandingkan dugaan awal dengan hasil, dan merumuskan simpulan.',
    guru: 'Bacakan klaim kelompok lain seperti "kasus detektif". Minta murid menunjuk letak kekeliruan sebelum memilih kategori. Akhiri dengan membandingkan dugaan awal kelompok dan menyusun simpulan bersama.',
    judulDetektif: '🕵️ Detektif solusi: apa kekeliruannya?',
    opsiDetektif: [
      { id: 'tepat', label: 'Sudah tepat' },
      { id: 'dijumlah', label: 'Persen diskon dijumlahkan' },
      { id: 'dariJual', label: 'Persen dari harga jual' },
      { id: 'lupaUbah', label: 'Persen tidak diubah ke rupiah' },
      { id: 'tanpaPromo', label: 'Promo tidak diterapkan' },
    ],
    klaim: [
      {
        id: 'e1',
        teks: 'Kelompok Melati: "Diskon 20% + 10% = 30%, jadi bahan di Toko Maju juga Rp175.000."',
        correct: 'dijumlah',
        explanation:
          'Diskon kedua dihitung dari Rp200.000, sehingga harganya Rp180.000 (setara 28%).',
      },
      {
        id: 'e2',
        teks: 'Kelompok Anggrek: "Untung Rp80.000 dari penjualan Rp400.000, jadi untungnya 20%."',
        correct: 'dariJual',
        explanation: 'Persen untung dibandingkan dengan modal: 80.000 : 320.000 × 100% = 25%.',
      },
      {
        id: 'e3',
        teks: 'Kelompok Kenanga: "80 cup di Toko Maju: 80 × Rp1.000 = Rp80.000."',
        correct: 'tanpaPromo',
        explanation: 'Dengan beli 3 gratis 1, yang dibayar hanya 60 cup: Rp60.000.',
      },
      {
        id: 'e4',
        teks: 'Kelompok Mawar: "Diskon 30% dari Rp250.000: 250.000 − 30 = Rp249.970."',
        correct: 'lupaUbah',
        explanation: '30% harus diubah ke rupiah dulu: 30% × 250.000 = 75.000, jadi Rp175.000.',
      },
      {
        id: 'e5',
        teks: 'Kelompok Dahlia: "Bila hanya 60 gelas terjual, kita rugi Rp20.000 atau 6,25% dari modal."',
        correct: 'tepat',
        explanation: '320.000 − 300.000 = 20.000; 20.000 : 320.000 × 100% = 6,25%.',
      },
      {
        id: 'e6',
        teks: 'Kelompok Tulip: "Harga jual agar untung 25%: Rp4.000 + 25% × Rp4.000 = Rp5.000."',
        correct: 'tepat',
        explanation: 'Untung Rp1.000 per gelas = 25% dari harga pokok Rp4.000.',
      },
    ],
    judulDugaan: '🔁 Dugaan awal vs hasil penyelidikan',
    judulSimpulan: '🧩 Susun simpulan kelompok',
    instruksiSimpulan:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan dipakai sekali.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      {
        id: 's1',
        awal: 'Pada diskon bertingkat, diskon kedua dihitung',
        correct: 'b1',
      },
      { id: 's2', awal: 'Persen untung atau rugi dihitung', correct: 'b2' },
      { id: 's3', awal: 'Harga jual agar untung p% sama dengan', correct: 'b3' },
      { id: 's4', awal: 'Anggaran yang sehat', correct: 'b4' },
    ],
    bank: [
      {
        id: 'b1',
        teks: 'dari harga setelah diskon pertama, sehingga diskon totalnya lebih kecil dari jumlah persennya',
      },
      { id: 'b2', teks: 'dengan membandingkan besar untung/rugi terhadap modal (harga beli)' },
      { id: 'b3', teks: 'harga beli ditambah p% × harga beli' },
      {
        id: 'b4',
        teks: 'tidak defisit dan menyisihkan tabungan lebih dulu sebelum belanja keinginan',
      },
      { id: 'x1', teks: 'dari harga awal, jadi persen diskonnya cukup dijumlahkan' },
      { id: 'x2', teks: 'dengan membandingkan untung/rugi terhadap pendapatan (harga jual)' },
      { id: 'x3', teks: 'harga beli ditambah angka p rupiah' },
      { id: 'x4', teks: 'menghabiskan semua uang lalu menabung dari sisanya' },
    ],
    rangkuman: [
      'Diskon p% → potongan = p% × harga; harga akhir = harga − potongan = (100% − p%) × harga.',
      'Diskon bertingkat dihitung berurutan; 20% + 10% setara 28%, bukan 30%.',
      'Untung/rugi = pendapatan − modal; persen untung/rugi = besar untung/rugi : modal × 100%.',
      'Harga jual = harga beli + p% × harga beli (untung) atau − p% × harga beli (rugi).',
      'Anggaran: sisa = pemasukan − pengeluaran; persen pos = nilai pos : pemasukan × 100%.',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     UJI TERAP — soal dipilih acak dari bank sesuai komposisi.
     Soal pilihan ganda tidak menulis opsi: app.js membangunnya dari
     opsiFinansial(engine) lalu MENGACAK urutannya.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan operasi bilangan real untuk menyelesaikan masalah diskon, untung–rugi, dan anggaran yang baru.',
    guru: 'Setiap murid mendapat soal acak yang berbeda. Minta murid menuliskan kalimat matematikanya di buku sebelum menjawab, lalu bandingkan strategi antarpasangan.',
    instruksi:
      'Tulis kalimat matematikanya di bukumu, lalu jawab. Uang boleh ditulis 36.000 atau Rp36.000; persen boleh ditulis 12,5 atau 12,5%.',
    banyak: 8,
    komposisi: { input: 4, choice: 4 },
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: 'belanja',
        jenis: 'diskonAkhir',
        harga: 320000,
        persen: 25,
        cerita: 'Sepatu olahraga seharga Rp320.000 mendapat diskon 25%.',
        pertanyaan: 'Berapa harga sepatu yang harus dibayar?',
        hints: ['25% × 320.000 = 80.000.', 'Harga bayar = 320.000 − 80.000.'],
        reveal: 'Rp320.000 − Rp80.000 = Rp240.000.',
        explanation: 'Potongan 25% × Rp320.000 = Rp80.000, jadi dibayar Rp240.000.',
      },
      {
        id: 't2',
        type: 'input',
        konteks: 'belanja',
        jenis: 'diskonPotongan',
        harga: 180000,
        persen: 15,
        cerita: 'Tas sekolah seharga Rp180.000 diberi diskon 15%.',
        pertanyaan: 'Berapa rupiah potongan harganya?',
        hints: ['15% = 15/100.', '180.000 : 100 × 15.'],
        reveal: '15% × Rp180.000 = Rp27.000.',
        explanation: 'Potongan = 15/100 × Rp180.000 = Rp27.000.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: 'belanja',
        jenis: 'diskonAkhir',
        harga: 400000,
        persen: [50, 20],
        cerita: 'Jaket Rp400.000 mendapat diskon 50% + 20% saat cuci gudang.',
        pertanyaan: 'Berapa harga jaket setelah kedua diskon?',
        hints: ['Setelah diskon 50%: Rp200.000.', 'Diskon 20% dihitung dari Rp200.000.'],
        reveal: 'Rp400.000 → Rp200.000 → Rp160.000.',
        explanation:
          'Diskon 20% dari Rp200.000 = Rp40.000, jadi harganya Rp160.000 (bukan Rp120.000).',
      },
      {
        id: 't4',
        type: 'input',
        konteks: 'dagang',
        jenis: 'untungPersen',
        beli: 150000,
        jual: 195000,
        cerita: 'Bu Sari membeli kerupuk seharga Rp150.000 dan menjual semuanya Rp195.000.',
        pertanyaan: 'Berapa persen untung Bu Sari?',
        hints: ['Untung = 195.000 − 150.000 = 45.000.', 'Persen = 45.000 : 150.000 × 100%.'],
        reveal: '45.000 : 150.000 × 100% = 30%.',
        explanation: 'Untung Rp45.000 dibandingkan modal Rp150.000 = 30%.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: 'dagang',
        jenis: 'untungBesar',
        beli: 250000,
        jual: 215000,
        cerita: 'Koperasi membeli payung Rp250.000, tetapi hanya laku Rp215.000.',
        pertanyaan: 'Berapa rupiah kerugian koperasi?',
        hints: ['Harga jual lebih kecil → rugi.', 'Rugi = 250.000 − 215.000.'],
        reveal: 'Rp250.000 − Rp215.000 = Rp35.000.',
        explanation: 'Rugi = modal − pendapatan = Rp35.000 (ditulis positif, statusnya rugi).',
      },
      {
        id: 't6',
        type: 'input',
        konteks: 'dagang',
        jenis: 'hargaJual',
        beli: 12000,
        persen: 20,
        status: 'untung',
        cerita: 'Dimas membeli gantungan kunci Rp12.000 per buah dan ingin untung 20%.',
        pertanyaan: 'Berapa harga jual per buah?',
        hints: ['Untung = 20% × 12.000 = 2.400.', 'Harga jual = 12.000 + 2.400.'],
        reveal: 'Rp12.000 + Rp2.400 = Rp14.400.',
        explanation: 'Harga jual = harga beli + 20% × harga beli = Rp14.400.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: 'anggaran',
        jenis: 'sisaAnggaran',
        pemasukan: 300000,
        pengeluaran: [120000, 75000, 45000],
        cerita:
          'Uang saku Nara sebulan Rp300.000. Ia memakai Rp120.000 untuk transportasi, Rp75.000 untuk makan siang, dan Rp45.000 untuk pulsa.',
        pertanyaan: 'Berapa sisa uang saku Nara?',
        hints: ['Jumlah pengeluaran = 120.000 + 75.000 + 45.000.', 'Sisa = 300.000 − 240.000.'],
        reveal: 'Rp300.000 − Rp240.000 = Rp60.000.',
        explanation: 'Pengeluaran Rp240.000, jadi sisanya Rp60.000.',
      },
      {
        id: 't8',
        type: 'input',
        konteks: 'anggaran',
        jenis: 'persenPos',
        pemasukan: 300000,
        nilai: 75000,
        cerita: 'Dari uang saku Rp300.000, Nara menabung Rp75.000 di awal bulan.',
        pertanyaan: 'Berapa persen uang saku yang ditabung?',
        hints: ['Persen = 75.000 : 300.000 × 100%.', '75.000 : 300.000 = 1/4.'],
        reveal: '75.000 : 300.000 × 100% = 25%.',
        explanation: 'Seperempat uang saku ditabung, yaitu 25%.',
      },
      {
        id: 't9',
        type: 'choice',
        konteks: 'belanja',
        jenis: 'diskonSetara',
        persen: [30, 20],
        cerita: 'Toko buku memberi diskon 30% ditambah diskon member 20%.',
        pertanyaan: 'Diskon itu setara dengan diskon tunggal berapa persen?',
        explanation:
          'Sisa harga = 70% × 80% = 56%, jadi diskon setara 100% − 56% = 44% (bukan 50%).',
      },
      {
        id: 't10',
        type: 'choice',
        konteks: 'belanja',
        jenis: 'promo',
        promo: { jenis: 'beliGratis', harga: 4000, beli: 2, gratis: 1 },
        qty: 9,
        cerita: 'Donat Rp4.000 per buah dengan promo beli 2 gratis 1. Rani membawa pulang 9 donat.',
        pertanyaan: 'Berapa rupiah yang dibayar Rani?',
        explanation:
          '9 donat = 3 paket (beli 2 dapat 3), yang dibayar 6 donat × Rp4.000 = Rp24.000.',
      },
      {
        id: 't11',
        type: 'choice',
        konteks: 'dagang',
        jenis: 'untungPersen',
        beli: 80000,
        jual: 100000,
        cerita: 'Pak Ujang membeli sayur Rp80.000 dan menjual semuanya Rp100.000.',
        pertanyaan: 'Berapa persen untungnya?',
        explanation:
          'Untung Rp20.000 : modal Rp80.000 × 100% = 25% (bukan 20%, yang dibandingkan dengan harga jual).',
      },
      {
        id: 't12',
        type: 'choice',
        konteks: 'dagang',
        jenis: 'hargaJual',
        beli: 60000,
        persen: 10,
        status: 'rugi',
        cerita: 'Sebuah kipas angin dibeli Rp60.000, lalu dijual dengan rugi 10%.',
        pertanyaan: 'Berapa harga jual kipas angin itu?',
        explanation:
          'Rugi 10% × Rp60.000 = Rp6.000, jadi harga jual Rp60.000 − Rp6.000 = Rp54.000.',
      },
      {
        id: 't13',
        type: 'choice',
        konteks: 'belanja',
        jenis: 'promo',
        promo: { jenis: 'potongan', harga: 9000, potongan: 5000, minBelanja: 50000 },
        qty: 6,
        cerita:
          'Toko alat tulis memberi potongan Rp5.000 untuk belanja minimal Rp50.000. Gita membeli 6 buku gambar @Rp9.000.',
        pertanyaan: 'Berapa rupiah yang dibayar Gita?',
        explanation: 'Belanja 6 × Rp9.000 = Rp54.000 ≥ Rp50.000, jadi dipotong Rp5.000: Rp49.000.',
      },
      {
        id: 't14',
        type: 'choice',
        konteks: 'belanja',
        jenis: 'diskonAkhir',
        harga: 150000,
        persen: [20, 10],
        cerita: 'Celana seharga Rp150.000 mendapat diskon 20% + 10%.',
        pertanyaan: 'Berapa harga celana setelah kedua diskon?',
        explanation: 'Rp150.000 → Rp120.000 → Rp108.000 (diskon 10% dari Rp120.000).',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     REFLEKSI & SELESAI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Refleksi',
    goal: 'Merefleksikan strategi, kekeliruan yang ditemukan, dan penerapan literasi finansial dalam kehidupan.',
    guru: 'Beri waktu hening 3 menit untuk menulis. Undang beberapa murid membagikan rencana keuangan pribadinya (tanpa menyebut nominal bila sensitif).',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Kekeliruan apa yang paling sering kamu atau kelompokmu lakukan hari ini? Bagaimana cara menghindarinya?',
        placeholder: 'Contoh: kami sempat menjumlahkan persen diskon …',
      },
      {
        id: 'r2',
        teks: 'Saat berbelanja dengan keluarga, promo mana yang akan kamu periksa lebih teliti? Mengapa?',
        placeholder: 'Contoh: promo diskon bertingkat, karena …',
      },
      {
        id: 'r3',
        teks: 'Susun rencana singkat anggaran uang sakumu: berapa persen untuk tabungan?',
        placeholder: 'Contoh: aku akan menyisihkan 20% di awal minggu …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu menyelesaikan masalah diskon, untung–rugi, dan anggaran sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — bisa menjelaskan ke teman' },
      { id: 'yakin', label: '😊 Yakin — sesekali perlu mengecek' },
      { id: 'ragu', label: '🤔 Masih ragu di beberapa bagian' },
      { id: 'belum', label: '🙋 Belum yakin — perlu latihan lagi' },
    ],
    nextLabel: 'Selesai →',
  },

  selesai: {
    judul: 'Rencana usaha siap dijalankan!',
    teks: 'Kamu sudah menerapkan operasi bilangan real untuk berbelanja hemat, menentukan harga jual, menghitung untung–rugi, dan menyusun anggaran.',
    contoh: [
      { konteks: 'belanja', teks: '20% + 10% ≈ 28%', keterangan: 'diskon kedua dari harga sisa' },
      { konteks: 'dagang', teks: 'Untung : modal × 100%', keterangan: 'persen untung/rugi' },
      { konteks: 'anggaran', teks: 'Tabung dulu, belanja kemudian', keterangan: 'anggaran sehat' },
    ],
    capaian: [
      'Menghitung harga setelah diskon tunggal, bertingkat, dan promo beli–gratis, lalu memilih yang paling hemat.',
      'Menentukan untung/rugi, persennya terhadap modal, dan harga jual dari target untung.',
      'Menyusun anggaran yang tidak defisit dengan tabungan yang disisihkan lebih dulu.',
      'Memeriksa solusi orang lain dan menjelaskan keputusan keuangan dengan perhitungan.',
    ],
  },
};
