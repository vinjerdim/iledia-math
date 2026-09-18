'use strict';

/* ============================================================
   data.js — Konten pembelajaran
   Matematika: Literasi Finansial — Untung, Rugi & Diskon
   Fase D (SMP)
   ============================================================ */

var DATA = {
  meta: {
    title: 'Literasi Finansial: Untung, Rugi & Diskon',
    subject: 'Matematika — Fase D (SMP)',
    goal: 'Saya dapat menganalisis masalah literasi finansial (menghitung pendapatan, pengeluaran, keuntungan, kerugian, dan diskon) dengan menerapkan operasi aritmatika secara kritis.',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — EKSPLORASI TRANSAKSI
     ---------------------------------------------------------- */
  eksplorasiTransaksi: {
    title: 'Mengenal Pendapatan dan Pengeluaran',
    instruction:
      'Hitung pendapatan dari setiap produk (= Harga Jual × Jumlah Terjual). Isi kolom yang kosong, lalu tentukan apakah usaha tersebut untung atau rugi!',
    konteks: [
      {
        id: 'warung',
        badge: 'Warung Bu Sari',
        icon: '🏪',
        story:
          'Bu Sari menjalankan warung kelontong di depan rumahnya. Hari ini ia berhasil menjual tiga jenis produk. Bantu Bu Sari menghitung pendapatan dari setiap produknya!',
        produk: [
          { nama: 'Mie Instan', icon: '🍜', harga_beli: 2500, harga_jual: 3500, qty: 10 },
          { nama: 'Kopi Sachet', icon: '☕', harga_beli: 1500, harga_jual: 2500, qty: 20 },
          { nama: 'Air Mineral', icon: '💧', harga_beli: 3000, harga_jual: 5000, qty: 8 },
        ],
        /* Pendapatan: 35000 + 50000 + 40000 = 125000 */
        /* Modal:      25000 + 30000 + 24000 =  79000 */
        /* Untung: 46000 */
        total_pendapatan: 125000,
        total_modal: 79000,
        result_type: 'untung',
        result: 46000,
        hint_pendapatan:
          'Pendapatan setiap produk = Harga Jual × Jumlah Terjual. Contoh: Mie Instan = Rp3.500 × 10 = Rp35.000',
      },
      {
        id: 'kantin',
        badge: 'Kantin Sekolah',
        icon: '🍽️',
        story:
          'Ibu Dewi mengelola kantin di SMPN 7. Saat jam istirahat, ia melayani banyak siswa yang lapar. Yuk bantu Ibu Dewi menghitung pendapatannya!',
        produk: [
          { nama: 'Nasi Kuning', icon: '🍛', harga_beli: 5000, harga_jual: 8000, qty: 10 },
          { nama: 'Teh Manis', icon: '🧋', harga_beli: 2000, harga_jual: 3000, qty: 25 },
          { nama: 'Bakwan', icon: '🥘', harga_beli: 1000, harga_jual: 2000, qty: 30 },
        ],
        /* Pendapatan:  80000 + 75000 + 60000 = 215000 */
        /* Modal:       50000 + 50000 + 30000 = 130000 */
        /* Untung: 85000 */
        total_pendapatan: 215000,
        total_modal: 130000,
        result_type: 'untung',
        result: 85000,
        hint_pendapatan:
          'Pendapatan setiap produk = Harga Jual × Jumlah Terjual. Contoh: Nasi Kuning = Rp8.000 × 10 = Rp80.000',
      },
      {
        id: 'musiman',
        badge: 'Toko Musiman',
        icon: '🏷️',
        story:
          'Toko "Pantai Indah" mengobral produk musim panas karena musim hujan tiba. Mereka terpaksa menjual di bawah harga beli untuk menghabiskan stok. Apa yang terjadi?',
        produk: [
          { nama: 'Payung Pantai', icon: '⛱️', harga_beli: 40000, harga_jual: 30000, qty: 5 },
          { nama: 'Sandal Pantai', icon: '🩴', harga_beli: 35000, harga_jual: 25000, qty: 6 },
          { nama: 'Baju Renang', icon: '🩲', harga_beli: 80000, harga_jual: 60000, qty: 4 },
        ],
        /* Pendapatan: 150000 + 150000 + 240000 = 540000 */
        /* Modal:      200000 + 210000 + 320000 = 730000 */
        /* Rugi: 190000 */
        total_pendapatan: 540000,
        total_modal: 730000,
        result_type: 'rugi',
        result: 190000,
        hint_pendapatan:
          'Pendapatan setiap produk = Harga Jual × Jumlah Terjual. Contoh: Payung = Rp30.000 × 5 = Rp150.000',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 3 — UNTUNG & RUGI
     ---------------------------------------------------------- */
  untungRugi: {
    title: 'Menghitung Keuntungan dan Kerugian',
    instruction:
      'Tentukan apakah usaha untung atau rugi, lalu hitung nilainya. Masukkan angka saja (titik ribuan boleh diisi atau tidak).',
    soal: [
      {
        id: 'ur1',
        badge: 'Penjual Kue',
        icon: '🎂',
        story:
          'Ani membeli bahan-bahan kue seharga Rp120.000. Ia berhasil menjual semua kue dengan total pendapatan Rp175.000.',
        modal: 120000,
        pendapatan: 175000,
        result_type: 'untung',
        answer: 55000,
        hint: 'Karena Pendapatan (Rp175.000) > Modal (Rp120.000) → UNTUNG. Untung = Pendapatan − Modal = Rp175.000 − Rp120.000 = ?',
        explanation:
          'Untung = Pendapatan − Modal = Rp175.000 − Rp120.000 = <strong>Rp55.000</strong>. Ani untung karena pendapatan lebih besar dari modal.',
      },
      {
        id: 'ur2',
        badge: 'Penjual Es Krim',
        icon: '🍦',
        story:
          'Budi membeli es krim curah seharga Rp250.000. Setelah berjualan seharian, total penjualannya adalah Rp310.000.',
        modal: 250000,
        pendapatan: 310000,
        result_type: 'untung',
        answer: 60000,
        hint: 'Pendapatan (Rp310.000) > Modal (Rp250.000) → UNTUNG. Untung = Rp310.000 − Rp250.000 = ?',
        explanation:
          'Untung = Rp310.000 − Rp250.000 = <strong>Rp60.000</strong>. Budi berhasil meraih keuntungan dari berjualan es krim.',
      },
      {
        id: 'ur3',
        badge: 'Penjual Buku Bekas',
        icon: '📚',
        story:
          'Citra membeli koleksi buku bekas seharga Rp450.000. Karena buku-bukunya tidak diminati, ia hanya berhasil menjual seharga Rp390.000.',
        modal: 450000,
        pendapatan: 390000,
        result_type: 'rugi',
        answer: 60000,
        hint: 'Modal (Rp450.000) > Pendapatan (Rp390.000) → RUGI. Rugi = Modal − Pendapatan = Rp450.000 − Rp390.000 = ?',
        explanation:
          'Rugi = Modal − Pendapatan = Rp450.000 − Rp390.000 = <strong>Rp60.000</strong>. Citra rugi karena harga jual lebih rendah dari modal.',
      },
      {
        id: 'ur4',
        badge: 'Pedagang Snack',
        icon: '🍿',
        story:
          'Danu menyiapkan aneka snack untuk dijual di pesta dengan modal Rp85.000. Pesta berlangsung ramai dan ia berhasil meraup Rp130.000.',
        modal: 85000,
        pendapatan: 130000,
        result_type: 'untung',
        answer: 45000,
        hint: 'Pendapatan (Rp130.000) > Modal (Rp85.000) → UNTUNG. Untung = Rp130.000 − Rp85.000 = ?',
        explanation:
          'Untung = Rp130.000 − Rp85.000 = <strong>Rp45.000</strong>. Pesta yang ramai membantu Danu mendapat keuntungan besar.',
      },
      {
        id: 'ur5',
        badge: 'Pedagang Buah',
        icon: '🍎',
        story:
          'Eka membeli stok buah dengan total modal Rp350.000. Sebagian buah busuk sebelum terjual, sehingga pendapatannya hanya Rp280.000.',
        modal: 350000,
        pendapatan: 280000,
        result_type: 'rugi',
        answer: 70000,
        hint: 'Modal (Rp350.000) > Pendapatan (Rp280.000) → RUGI. Rugi = Modal − Pendapatan = Rp350.000 − Rp280.000 = ?',
        explanation:
          'Rugi = Modal − Pendapatan = Rp350.000 − Rp280.000 = <strong>Rp70.000</strong>. Buah yang busuk menyebabkan kerugian bagi Eka.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 4 — DISKON
     ---------------------------------------------------------- */
  diskon: {
    title: 'Memahami dan Menghitung Diskon',
    instruction:
      'Hitung dua hal: (1) nominal diskon dalam rupiah, dan (2) harga akhir setelah diskon. Gunakan rumus yang ditampilkan.',
    soal: [
      {
        id: 'd1',
        badge: 'Toko Sepatu',
        icon: '👠',
        produk: 'Sepatu Kasual',
        harga_awal: 300000,
        persen_diskon: 20,
        diskon: 60000,
        harga_akhir: 240000,
        hints: [
          'Langkah 1: Diskon = 20/100 × Rp300.000 = ?',
          'Langkah 2: Harga akhir = Rp300.000 − Rp60.000 = ?',
        ],
        explanation:
          'Diskon = 20/100 × Rp300.000 = <strong>Rp60.000</strong>. Harga akhir = Rp300.000 − Rp60.000 = <strong>Rp240.000</strong>.',
      },
      {
        id: 'd2',
        badge: 'Toko Pakaian',
        icon: '👕',
        produk: 'Baju Kaos',
        harga_awal: 150000,
        persen_diskon: 30,
        diskon: 45000,
        harga_akhir: 105000,
        hints: [
          'Langkah 1: Diskon = 30/100 × Rp150.000 = ?',
          'Langkah 2: Harga akhir = Rp150.000 − Rp45.000 = ?',
        ],
        explanation:
          'Diskon = 30/100 × Rp150.000 = <strong>Rp45.000</strong>. Harga akhir = Rp150.000 − Rp45.000 = <strong>Rp105.000</strong>.',
      },
      {
        id: 'd3',
        badge: 'Toko Tas',
        icon: '👜',
        produk: 'Tas Ransel',
        harga_awal: 480000,
        persen_diskon: 25,
        diskon: 120000,
        harga_akhir: 360000,
        hints: [
          'Langkah 1: Diskon = 25/100 × Rp480.000 = ?',
          'Langkah 2: Harga akhir = Rp480.000 − Rp120.000 = ?',
        ],
        explanation:
          'Diskon = 25/100 × Rp480.000 = <strong>Rp120.000</strong>. Harga akhir = Rp480.000 − Rp120.000 = <strong>Rp360.000</strong>.',
      },
      {
        id: 'd4',
        badge: 'Toko Buku',
        icon: '📖',
        produk: 'Buku Pelajaran',
        harga_awal: 80000,
        persen_diskon: 15,
        diskon: 12000,
        harga_akhir: 68000,
        hints: [
          'Langkah 1: Diskon = 15/100 × Rp80.000 = ?',
          'Langkah 2: Harga akhir = Rp80.000 − Rp12.000 = ?',
        ],
        explanation:
          'Diskon = 15/100 × Rp80.000 = <strong>Rp12.000</strong>. Harga akhir = Rp80.000 − Rp12.000 = <strong>Rp68.000</strong>.',
      },
      {
        id: 'd5',
        badge: 'Toko Elektronik',
        icon: '🎧',
        produk: 'Headphone',
        harga_awal: 1200000,
        persen_diskon: 10,
        diskon: 120000,
        harga_akhir: 1080000,
        hints: [
          'Langkah 1: Diskon = 10/100 × Rp1.200.000 = ?',
          'Langkah 2: Harga akhir = Rp1.200.000 − Rp120.000 = ?',
        ],
        explanation:
          'Diskon = 10/100 × Rp1.200.000 = <strong>Rp120.000</strong>. Harga akhir = Rp1.200.000 − Rp120.000 = <strong>Rp1.080.000</strong>.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 5 — LATIHAN GABUNGAN
     ---------------------------------------------------------- */
  latihanGabungan: {
    title: 'Latihan Gabungan',
    instruction:
      'Selesaikan berbagai masalah literasi finansial. Beberapa soal menggabungkan konsep untung/rugi dan diskon.',
    soal: [
      {
        id: 'lg1',
        type: 'input_ur',
        badge: 'Penjual Kain',
        icon: '🧵',
        story:
          'Bu Ani membeli kain batik seharga Rp600.000. Ia menjualnya dengan total pendapatan Rp780.000.',
        modal: 600000,
        pendapatan: 780000,
        result_type: 'untung',
        answer: 180000,
        hint: 'Pendapatan (780.000) > Modal (600.000) → Untung = 780.000 − 600.000 = ?',
        explanation: 'Untung = Rp780.000 − Rp600.000 = <strong>Rp180.000</strong>.',
      },
      {
        id: 'lg2',
        type: 'input_diskon',
        badge: 'Flash Sale',
        icon: '⚡',
        story:
          'Sebuah e-commerce mengadakan flash sale. Harga normal jaket Rp250.000, didiskon 40%. Berapa harga yang harus dibayar?',
        harga_awal: 250000,
        persen_diskon: 40,
        /* diskon = 100000, harga_akhir = 150000 */
        answer: 150000,
        hint: 'Diskon = 40/100 × Rp250.000 = Rp100.000. Harga akhir = Rp250.000 − Rp100.000 = ?',
        explanation:
          'Diskon = Rp100.000. Harga akhir = Rp250.000 − Rp100.000 = <strong>Rp150.000</strong>.',
      },
      {
        id: 'lg3',
        type: 'input_ur',
        badge: 'Penjual Laptop',
        icon: '💻',
        story:
          'Pak Budi membeli laptop bekas seharga Rp2.500.000 dan berhasil menjualnya seharga Rp2.200.000.',
        modal: 2500000,
        pendapatan: 2200000,
        result_type: 'rugi',
        answer: 300000,
        hint: 'Modal (2.500.000) > Pendapatan (2.200.000) → Rugi = 2.500.000 − 2.200.000 = ?',
        explanation: 'Rugi = Rp2.500.000 − Rp2.200.000 = <strong>Rp300.000</strong>.',
      },
      {
        id: 'lg4',
        type: 'input_diskon_nominal',
        badge: 'Promo Akhir Tahun',
        icon: '🎉',
        story:
          'Toko buku mengadakan promo akhir tahun. Harga normal kamus Rp120.000, didiskon 25%. Berapa nominal diskonnya?',
        harga_awal: 120000,
        persen_diskon: 25,
        /* diskon = 30000 */
        answer: 30000,
        hint: 'Nominal diskon = persen/100 × harga_awal = 25/100 × Rp120.000 = ?',
        explanation:
          'Nominal diskon = 25/100 × Rp120.000 = <strong>Rp30.000</strong>. (Harga bayar = Rp90.000.)',
      },
      {
        id: 'lg5',
        type: 'choice',
        badge: 'Keputusan Cerdas',
        icon: '🤔',
        story:
          'Seorang pedagang membeli 50 kaos dengan modal Rp1.250.000 (@ Rp25.000). Ia menjual 40 kaos @ Rp40.000 dan 10 kaos didiskon 20% dari harga Rp40.000. Berapa keuntungannya?',
        /* Pendapatan normal: 40 × 40.000 = 1.600.000 */
        /* Harga diskon: 40.000 × 80% = 32.000 */
        /* Pendapatan diskon: 10 × 32.000 = 320.000 */
        /* Total pendapatan: 1.920.000 */
        /* Untung: 1.920.000 − 1.250.000 = 670.000 */
        options: [
          { id: 'opt_a', label: 'Untung Rp670.000' },
          { id: 'opt_b', label: 'Untung Rp550.000' },
          { id: 'opt_c', label: 'Rugi Rp30.000' },
        ],
        correct: 'opt_a',
        hint: 'Hitung pendapatan kaos normal: 40 × Rp40.000 = Rp1.600.000. Harga diskon per kaos: Rp40.000 × 80% = Rp32.000. Pendapatan kaos diskon: 10 × Rp32.000 = Rp320.000. Total pendapatan = Rp1.920.000. Untung = Total Pendapatan − Modal.',
        explanation:
          'Pendapatan normal: 40 × Rp40.000 = Rp1.600.000. Harga diskon: Rp40.000 × 80% = Rp32.000. Pendapatan diskon: 10 × Rp32.000 = Rp320.000. Total pendapatan: Rp1.920.000. Untung = Rp1.920.000 − Rp1.250.000 = <strong>Rp670.000</strong>.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 6 — TANTANGAN
     ---------------------------------------------------------- */
  tantangan: {
    title: 'Tantangan Literasi Finansial',
    soal: [
      {
        id: 't1',
        badge: 'Laporan Keuangan',
        icon: '📊',
        story: 'Berikut laporan penjualan warung Bu Sari selama 3 hari:',
        table: [
          { hari: 'Senin', modal: 150000, pendapatan: 200000 },
          { hari: 'Selasa', modal: 180000, pendapatan: 165000 },
          { hari: 'Rabu', modal: 200000, pendapatan: 280000 },
        ],
        /* Senin: untung 50000 | Selasa: rugi 15000 | Rabu: untung 80000 */
        /* Total pendapatan: 645000 | Total modal: 530000 | Untung bersih: 115000 */
        questions: [
          {
            id: 't1q1',
            question: 'Pada hari apa Bu Sari mendapat keuntungan terbesar?',
            type: 'choice',
            options: [
              { id: 'opt_a', label: 'Senin (Untung Rp50.000)' },
              { id: 'opt_b', label: 'Selasa' },
              { id: 'opt_c', label: 'Rabu (Untung Rp80.000)' },
            ],
            correct: 'opt_c',
            explanation:
              'Senin: Rp200.000 − Rp150.000 = Rp50.000 (untung). Selasa: Rp165.000 < Rp180.000 → <strong>rugi</strong> Rp15.000. Rabu: Rp280.000 − Rp200.000 = <strong>Rp80.000</strong> (untung terbesar).',
          },
          {
            id: 't1q2',
            question: 'Berapa total keuntungan bersih Bu Sari selama 3 hari?',
            type: 'input',
            answer: 115000,
            hint: 'Total = Total Pendapatan − Total Modal = (200.000+165.000+280.000) − (150.000+180.000+200.000) = 645.000 − 530.000 = ?',
            explanation:
              'Total Pendapatan = Rp645.000. Total Modal = Rp530.000. Keuntungan bersih = Rp645.000 − Rp530.000 = <strong>Rp115.000</strong>.',
          },
        ],
      },
      {
        id: 't2',
        badge: 'Harga Jual Target',
        icon: '🎯',
        story:
          'Seorang pengusaha membeli 200 kaleng susu dengan harga Rp12.000 per kaleng. Ia ingin mendapat keuntungan 25% dari total modal.',
        /* Modal total = 200 × 12.000 = 2.400.000 */
        /* Target untung = 25% × 2.400.000 = 600.000 */
        /* Target pendapatan = 2.400.000 + 600.000 = 3.000.000 */
        /* Harga per kaleng = 3.000.000 / 200 = 15.000 */
        question: 'Berapa harga jual minimal per kaleng agar target terpenuhi?',
        answer: 15000,
        hint: 'Langkah 1: Modal total = 200 × Rp12.000 = Rp2.400.000. Langkah 2: Target untung = 25% × Rp2.400.000 = Rp600.000. Langkah 3: Total pendapatan yang dibutuhkan = Rp2.400.000 + Rp600.000 = Rp3.000.000. Langkah 4: Harga per kaleng = Rp3.000.000 ÷ 200 = ?',
        explanation:
          'Modal total = Rp2.400.000. Target untung 25% = Rp600.000. Pendapatan dibutuhkan = Rp3.000.000. Harga per kaleng = Rp3.000.000 ÷ 200 = <strong>Rp15.000</strong>.',
      },
      {
        id: 't3',
        badge: 'Diskon Bertingkat',
        icon: '🏷️',
        story:
          'Toko sepatu mengumumkan: "Diskon 20%, lalu diskon tambahan 10% untuk member!" Harga awal sepatu adalah Rp500.000.',
        /* Langkah 1: 500.000 × 80% = 400.000 */
        /* Langkah 2: 400.000 × 90% = 360.000 */
        /* Diskon 30% langsung: 500.000 × 70% = 350.000 */
        /* Diskon bertingkat LEBIH MAHAL → menguntungkan penjual */
        q1: {
          question: 'Harga akhir untuk member setelah diskon 20% kemudian 10% adalah…',
          options: [
            { id: 'opt_a', label: 'Rp350.000' },
            { id: 'opt_b', label: 'Rp360.000' },
            { id: 'opt_c', label: 'Rp370.000' },
          ],
          correct: 'opt_b',
          explanation:
            'Langkah 1: Rp500.000 − 20% = Rp500.000 × 80% = <strong>Rp400.000</strong>. Langkah 2: Rp400.000 − 10% = Rp400.000 × 90% = <strong>Rp360.000</strong>.',
        },
        q2: {
          question:
            'Apakah "diskon 20% lalu 10%" menghasilkan harga yang sama dengan "diskon 30% langsung"?',
          options: [
            { id: 'opt_a', label: 'Ya, hasilnya sama: Rp350.000.' },
            {
              id: 'opt_b',
              label:
                'Tidak, diskon bertingkat menghasilkan harga lebih tinggi (Rp360.000 > Rp350.000).',
            },
            { id: 'opt_c', label: 'Tidak, diskon bertingkat menghasilkan harga lebih rendah.' },
          ],
          correct: 'opt_b',
          explanation:
            'Diskon 30% langsung: Rp500.000 × 70% = <strong>Rp350.000</strong>. Diskon bertingkat: <strong>Rp360.000</strong>. Karena Rp360.000 > Rp350.000, diskon bertingkat menghasilkan harga <em>lebih tinggi</em> — lebih menguntungkan penjual! Diskon bertingkat tidak sama dengan menjumlahkan persennya.',
        },
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 7 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    title: 'Refleksi Pembelajaran',
    note: 'Refleksi ini membantu kamu merangkum pemahaman hari ini. Jawaban <strong>tidak dikirim ke mana pun</strong> — hanya tersimpan di browser ini.',
    soal: [
      {
        id: 'r1',
        question:
          'Dengan kata-katamu sendiri, apa perbedaan antara <strong>pendapatan</strong> dan <strong>modal</strong>? Kapan suatu usaha dikatakan untung, dan kapan dikatakan rugi?',
        placeholder: 'Tuliskan penjelasanmu di sini...',
      },
      {
        id: 'r2',
        question:
          'Jelaskan langkah-langkah menghitung <strong>harga setelah diskon</strong>! Berikan contoh dengan angka yang kamu buat sendiri.',
        placeholder: 'Contoh: Harga awal Rp..., diskon ...%, maka harga akhir = ...',
      },
      {
        id: 'r3',
        question:
          'Mengapa <strong>diskon bertingkat</strong> (misal: diskon 20% lalu 10%) TIDAK sama dengan diskon 30%? Jelaskan dengan kata-katamu sendiri.',
        placeholder: 'Tuliskan penjelasanmu...',
      },
      {
        id: 'r4',
        question:
          'Di mana saja kamu bisa menerapkan konsep <strong>untung, rugi, dan diskon</strong> dalam kehidupan sehari-hari sebagai pelajar SMP?',
        placeholder: 'Contoh situasi nyata...',
      },
    ],
  },
};
