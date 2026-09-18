'use strict';

/* ============================================================
   data.js — Konten pembelajaran
   Matematika: Merumuskan Solusi Transaksi Belanja
               dengan Teknik Estimasi dan Pembulatan
   Pisahkan dari app.js agar mudah dikustomisasi guru.
   ============================================================ */

const DATA = {
  meta: {
    title: 'Estimasi & Pembulatan Transaksi Belanja',
    subject: 'Matematika — Fase D (SMP Kelas 7)',
    goal: 'Saya dapat menggunakan teknik estimasi dan pembulatan untuk merumuskan solusi transaksi belanja.',
  },

  /* ----------------------------------------------------------
       TAHAP 2 — Latihan Pembulatan
       ---------------------------------------------------------- */
  pembulatan: {
    title: 'Latihan Pembulatan Harga',
    instruction:
      'Tentukan hasil pembulatan harga setiap barang sesuai instruksi. Pilih satu jawaban yang benar.',
    soal: [
      /* --- Pembulatan ke ribuan (Rp1.000) terdekat --- */
      {
        id: 'p1',
        harga: 24750,
        level: 1000,
        levelLabel: 'ribuan (Rp1.000) terdekat',
        correct: 25000,
        hint: 'Perhatikan angka ratusan: 7. Aturan: jika angka yang diperhatikan ≥ 5, bulatkan ke atas.',
        explanation:
          'Angka ratusan pada Rp24.750 adalah 7 (≥ 5), sehingga dibulatkan ke atas ke ribuan berikutnya → Rp25.000.',
      },
      {
        id: 'p2',
        harga: 8350,
        level: 1000,
        levelLabel: 'ribuan (Rp1.000) terdekat',
        correct: 8000,
        hint: 'Perhatikan angka ratusan: 3. Aturan: jika angka yang diperhatikan < 5, bulatkan ke bawah.',
        explanation:
          'Angka ratusan pada Rp8.350 adalah 3 (< 5), sehingga dibulatkan ke bawah → Rp8.000.',
      },
      {
        id: 'p3',
        harga: 17490,
        level: 1000,
        levelLabel: 'ribuan (Rp1.000) terdekat',
        correct: 17000,
        hint: 'Angka ratusan adalah 4. Bandingkan dengan 5: apakah 4 lebih kecil atau lebih besar dari 5?',
        explanation:
          'Angka ratusan pada Rp17.490 adalah 4 (< 5), sehingga dibulatkan ke bawah → Rp17.000.',
      },
      {
        id: 'p4',
        harga: 12650,
        level: 1000,
        levelLabel: 'ribuan (Rp1.000) terdekat',
        correct: 13000,
        hint: 'Angka ratusan adalah 6. Bandingkan dengan 5: apakah 6 lebih kecil atau lebih besar dari 5?',
        explanation:
          'Angka ratusan pada Rp12.650 adalah 6 (≥ 5), sehingga dibulatkan ke atas → Rp13.000.',
      },
      /* --- Pembulatan ke lima ribuan (Rp5.000) terdekat --- */
      {
        id: 'p5',
        harga: 34200,
        level: 5000,
        levelLabel: 'lima ribuan (Rp5.000) terdekat',
        correct: 35000,
        hint: 'Cari dua nilai Rp5.000-an terdekat di atas dan di bawah Rp34.200, yaitu Rp30.000 dan Rp35.000. Mana yang lebih dekat?',
        explanation:
          '|Rp34.200 − Rp30.000| = Rp4.200, sedangkan |Rp34.200 − Rp35.000| = Rp800. Karena lebih dekat ke Rp35.000, dibulatkan ke atas → Rp35.000.',
      },
      {
        id: 'p6',
        harga: 22800,
        level: 5000,
        levelLabel: 'lima ribuan (Rp5.000) terdekat',
        correct: 25000,
        hint: 'Dua nilai Rp5.000-an terdekat adalah Rp20.000 dan Rp25.000. Mana yang lebih dekat dengan Rp22.800?',
        explanation:
          '|Rp22.800 − Rp20.000| = Rp2.800, sedangkan |Rp22.800 − Rp25.000| = Rp2.200. Karena lebih dekat ke Rp25.000, dibulatkan ke atas → Rp25.000.',
      },
      /* --- Pembulatan ke sepuluh ribuan (Rp10.000) terdekat --- */
      {
        id: 'p7',
        harga: 46400,
        level: 10000,
        levelLabel: 'sepuluh ribuan (Rp10.000) terdekat',
        correct: 50000,
        hint: 'Perhatikan angka ribuan: 6. Aturan: jika angka yang diperhatikan ≥ 5, bulatkan ke atas ke sepuluh ribuan berikutnya.',
        explanation:
          'Angka ribuan pada Rp46.400 adalah 6 (≥ 5), sehingga dibulatkan ke atas → Rp50.000.',
      },
      {
        id: 'p8',
        harga: 73100,
        level: 10000,
        levelLabel: 'sepuluh ribuan (Rp10.000) terdekat',
        correct: 70000,
        hint: 'Perhatikan angka ribuan: 3. Aturan: jika angka yang diperhatikan < 5, bulatkan ke bawah ke sepuluh ribuan terdekat.',
        explanation:
          'Angka ribuan pada Rp73.100 adalah 3 (< 5), sehingga dibulatkan ke bawah → Rp70.000.',
      },
    ],
  },

  /* ----------------------------------------------------------
       TAHAP 3 — Estimasi Total Belanja
       ---------------------------------------------------------- */
  estimasi: {
    title: 'Estimasi Total Belanja',
    strategies: [
      {
        value: 1000,
        label: 'Ke ribuan (Rp1.000) terdekat',
        desc: 'Paling akurat; cocok jika anggaran sangat ketat.',
        example: 'Rp12.750 → Rp13.000',
      },
      {
        value: 5000,
        label: 'Ke lima ribuan (Rp5.000) terdekat',
        desc: 'Cukup cepat; keseimbangan antara akurasi dan kemudahan.',
        example: 'Rp12.750 → Rp15.000',
      },
      {
        value: 10000,
        label: 'Ke sepuluh ribuan (Rp10.000) terdekat',
        desc: 'Paling cepat; cocok untuk estimasi kasar, tapi bisa meleset jauh.',
        example: 'Rp12.750 → Rp10.000',
      },
    ],
    scenarios: [
      {
        id: 's1',
        label: 'Skenario 1',
        context: 'Kamu membawa uang Rp100.000 dan perlu membeli kebutuhan dapur berikut.',
        budget: 100000,
        items: [
          { nama: 'Beras 1 kg', harga: 12750 },
          { nama: 'Minyak Goreng', harga: 17450 },
          { nama: 'Gula Pasir', harga: 14900 },
          { nama: 'Telur (6 butir)', harga: 15350 },
        ],
        /*
                  Total sebenarnya: 60.450
                  Strategi ribuan: 13.000+17.000+15.000+15.000 = 60.000 → CUKUP ✓ (deviasi 0.7%)
                  Strategi lima ribuan: 15.000+15.000+15.000+15.000 = 60.000 → CUKUP ✓ (deviasi 0.7%)
                  Strategi sepuluh ribuan: 10.000+20.000+10.000+20.000 = 60.000 → CUKUP ✓ (deviasi 0.7%)
                  Skenario ini: semua strategi memberikan keputusan benar, fokus pada latihan pembulatan.
                */
      },
      {
        id: 's2',
        label: 'Skenario 2',
        context: 'Kamu membawa uang Rp50.000 dan ingin membeli perlengkapan sarapan berikut.',
        budget: 50000,
        items: [
          { nama: 'Roti Tawar', harga: 16750 },
          { nama: 'Susu Kotak', harga: 8350 },
          { nama: 'Biskuit', harga: 17450 },
          { nama: 'Permen', harga: 6750 },
        ],
        /*
                  Total sebenarnya: 49.300 (tepat di bawah anggaran!)
                  Strategi ribuan:
                    17.000+8.000+17.000+7.000 = 49.000 → CUKUP ✓ (actual 49.300 juga CUKUP; deviasi 0.6%)
                  Strategi lima ribuan:
                    15.000+10.000+15.000+5.000 = 45.000 → CUKUP ✓ (deviasi 8.7% — underestimasi, tapi keputusan benar)
                  Strategi sepuluh ribuan:
                    20.000+10.000+20.000+10.000 = 60.000 → TIDAK CUKUP ✗ (actual CUKUP! deviasi 21.7%)
                    ⇒ KASUS KRITIS: overestimasi berlebihan menyebabkan keputusan SALAH!
                */
      },
      {
        id: 's3',
        label: 'Skenario 3',
        context: 'Kamu membawa uang Rp75.000 dan perlu membeli perlengkapan mandi.',
        budget: 75000,
        items: [
          { nama: 'Detergen Sachet', harga: 24400 },
          { nama: 'Sabun Mandi', harga: 8750 },
          { nama: 'Sampo Sachet', harga: 5250 },
          { nama: 'Pasta Gigi', harga: 12650 },
        ],
        /*
                  Total sebenarnya: 51.050 (jauh di bawah anggaran)
                  Strategi ribuan:
                    24.000+9.000+5.000+13.000 = 51.000 → CUKUP ✓ (deviasi 0.1%)
                  Strategi lima ribuan:
                    25.000+10.000+5.000+15.000 = 55.000 → CUKUP ✓ (deviasi 7.7%)
                  Strategi sepuluh ribuan:
                    20.000+10.000+10.000+10.000 = 50.000 → CUKUP ✓ (deviasi 2.1%)
                  Semua strategi memberi keputusan benar; fokus pada perbandingan akurasi.
                */
      },
    ],
  },

  /* ----------------------------------------------------------
       TAHAP 4 — Decision Challenge
       ---------------------------------------------------------- */
  tantangan: {
    title: 'Decision Challenge',
    challenges: [
      {
        id: 'c1',
        label: 'Tantangan 1',
        context:
          'Kamu memiliki uang Rp50.000 untuk membeli alat tulis sekolah. Pilih barang-barang yang menurutmu masih sesuai anggaran.',
        budget: 50000,
        minSelect: 2,
        items: [
          { id: 'i1', nama: 'Buku Tulis (5 pcs)', harga: 12750 },
          { id: 'i2', nama: 'Pensil 2B', harga: 4350 },
          { id: 'i3', nama: 'Penghapus', harga: 3150 },
          { id: 'i4', nama: 'Penggaris 30cm', harga: 7900 },
          { id: 'i5', nama: 'Spidol Warna', harga: 24500 },
        ],
        /* Total semua: 52.650 — melebihi anggaran!
                   Beli semua kecuali spidol: 12.750+4.350+3.150+7.900 = 28.150 ✓
                   Buku+Pensil+Penggaris+Spidol: 12.750+4.350+7.900+24.500 = 49.500 ✓ (tepat di bawah 50.000!)
                   Buku+Penghapus+Penggaris+Spidol: 12.750+3.150+7.900+24.500 = 48.300 ✓
                   Buku+Penggaris+Lem+Spidol: i1+i4+i5 = 12750+7900+24500 = 45.150 ✓ */
      },
      {
        id: 'c2',
        label: 'Tantangan 2',
        context:
          'Kamu membawa uang Rp35.000 untuk membeli camilan. Pilih barang yang sesuai anggaran.',
        budget: 35000,
        minSelect: 2,
        items: [
          { id: 'j1', nama: 'Keripik Singkong', harga: 8900 },
          { id: 'j2', nama: 'Coklat Batang', harga: 14250 },
          { id: 'j3', nama: 'Minuman Sachet', harga: 3750 },
          { id: 'j4', nama: 'Biskuit Kaleng', harga: 22500 },
          { id: 'j5', nama: 'Permen (1 bungkus)', harga: 6500 },
        ],
        /* Total semua: 55.900 — melebihi anggaran!
                   j4+j1: 31.400 ✓; j4+j5: 29.000 ✓; j4+j3: 26.250 ✓
                   j4+j1+j3: 35.150 — melebihi anggaran! (jebakan: terlihat muat)
                   j1+j2+j3: 26.900 ✓; j1+j2+j5: 29.650 ✓; j1+j2+j3+j5: 33.400 ✓
                   j2+j4: 36.750 — melebihi anggaran! */
      },
      {
        id: 'c3',
        label: 'Tantangan 3',
        context:
          'Kamu memiliki uang Rp80.000 untuk membeli perlengkapan piknik. Pilih barang yang sesuai anggaran.',
        budget: 80000,
        minSelect: 3,
        items: [
          { id: 'k1', nama: 'Air Mineral (6 btl)', harga: 21900 },
          { id: 'k2', nama: 'Nasi Kotak', harga: 18500 },
          { id: 'k3', nama: 'Buah Potong', harga: 15750 },
          { id: 'k4', nama: 'Kue Basah', harga: 12350 },
          { id: 'k5', nama: 'Jus Buah (kotak)', harga: 28900 },
          { id: 'k6', nama: 'Snack Keripik', harga: 9400 },
        ],
        /* Total semua: 106.800 — jauh melebihi anggaran!
                   k5+k1+k3+k4: 28.900+21.900+15.750+12.350 = 78.900 ✓ (nyaris habis!)
                   k5+k1+k2: 69.300 ✓
                   k1+k2+k3+k4: 68.500 ✓
                   k5+k1+k2+k6: 78.700 ✓
                   k5+k1+k2+k4: 81.650 — melebihi anggaran! */
      },
    ],
  },

  /* ----------------------------------------------------------
       TAHAP 5 — Asesmen Formatif
       ---------------------------------------------------------- */
  asesmen: {
    title: 'Asesmen Formatif',
    instruction:
      'Jawab setiap pertanyaan dengan memilih satu jawaban yang paling tepat. Feedback akan ditampilkan setelah jawaban dikunci.',
    soal: [
      {
        id: 'a1',
        pertanyaan:
          'Seorang siswa ingin memastikan uangnya cukup sebelum ke kasir. Strategi pembulatan mana yang paling aman?',
        pilihan: [
          {
            id: 'a',
            teks: 'Bulatkan semua harga ke bawah agar estimasi total lebih kecil dari harga sebenarnya.',
          },
          {
            id: 'b',
            teks: 'Bulatkan semua harga ke atas agar estimasi total lebih besar dari harga sebenarnya.',
          },
          { id: 'c', teks: 'Tidak perlu membulatkan; langsung perkirakan secara kasar saja.' },
          { id: 'd', teks: 'Hanya bulatkan harga barang yang nilainya ganjil.' },
        ],
        correct: 'b',
        explanation:
          'Membulatkan ke atas (overestimation) lebih aman jika tujuanmu memastikan uang cukup. Estimasimu akan selalu lebih besar dari total sebenarnya, sehingga kamu tidak akan kekurangan uang di kasir. Perlu diingat: pembulatan ke atas yang terlalu besar dapat menyebabkan estimasi yang jauh meleset dan malah salah dalam mengambil keputusan.',
      },
      {
        id: 'a2',
        pertanyaan: 'Berapa hasil pembulatan Rp13.450 ke ribuan terdekat?',
        pilihan: [
          { id: 'a', teks: 'Rp13.000' },
          { id: 'b', teks: 'Rp13.400' },
          { id: 'c', teks: 'Rp13.500' },
          { id: 'd', teks: 'Rp14.000' },
        ],
        correct: 'a',
        explanation:
          'Angka ratusan pada Rp13.450 adalah 4. Karena 4 < 5, dibulatkan ke bawah → Rp13.000. Aturan dasar: jika digit yang diperhatikan kurang dari 5, bulatkan ke bawah; jika 5 atau lebih, bulatkan ke atas.',
      },
      {
        id: 'a3',
        pertanyaan:
          'Budi menganggarkan Rp60.000. Estimasinya Rp58.000, tetapi total sebenarnya ternyata Rp61.500. Apa simpulannya?',
        pilihan: [
          { id: 'a', teks: 'Estimasi Budi tepat karena selisihnya kecil.' },
          { id: 'b', teks: 'Estimasi Budi terlalu tinggi; dia tidak akan kekurangan uang.' },
          { id: 'c', teks: 'Estimasi Budi terlalu rendah; dia akan kekurangan uang di kasir.' },
          { id: 'd', teks: 'Estimasi Budi tidak berguna karena tetap ada selisih.' },
        ],
        correct: 'c',
        explanation:
          'Estimasi Budi (Rp58.000) lebih rendah dari total sebenarnya (Rp61.500) → underestimation. Karena total sebenarnya (Rp61.500) melebihi anggaran (Rp60.000), Budi kekurangan uang Rp1.500. Ini menunjukkan risiko membulatkan ke bawah ketika anggaran sangat ketat.',
      },
      {
        id: 'a4',
        pertanyaan: 'Kapan estimasi lebih tepat digunakan daripada perhitungan presisi?',
        pilihan: [
          {
            id: 'a',
            teks: 'Saat ingin mengetahui kembalian yang tepat setelah membayar di kasir.',
          },
          {
            id: 'b',
            teks: 'Saat perlu memperkirakan dengan cepat apakah uang cukup sebelum memilih barang.',
          },
          { id: 'c', teks: 'Saat kasir menghitung total harga menggunakan mesin kasir.' },
          { id: 'd', teks: 'Saat mengisi laporan keuangan resmi sekolah.' },
        ],
        correct: 'b',
        explanation:
          'Estimasi paling berguna untuk pengambilan keputusan cepat, seperti memperkirakan apakah uangmu cukup sebelum ke kasir. Untuk mengetahui kembalian tepat, laporan keuangan, atau perhitungan kasir, diperlukan perhitungan presisi.',
      },
      {
        id: 'a5',
        pertanyaan:
          'Ani membulatkan tiga harga ke sepuluh ribuan terdekat: Rp23.800, Rp11.500, dan Rp38.200. Berapa total estimasinya?',
        pilihan: [
          { id: 'a', teks: 'Rp20.000 + Rp10.000 + Rp40.000 = Rp70.000' },
          { id: 'b', teks: 'Rp20.000 + Rp12.000 + Rp38.000 = Rp70.000' },
          { id: 'c', teks: 'Rp24.000 + Rp12.000 + Rp38.000 = Rp74.000' },
          { id: 'd', teks: 'Rp30.000 + Rp20.000 + Rp40.000 = Rp90.000' },
        ],
        correct: 'a',
        explanation:
          'Rp23.800 → angka ribuan adalah 3 (< 5) → dibulatkan ke bawah → Rp20.000. Rp11.500 → angka ribuan adalah 1 (< 5) → Rp10.000. Rp38.200 → angka ribuan adalah 8 (≥ 5) → dibulatkan ke atas → Rp40.000. Total estimasi = Rp70.000.',
      },
    ],
  },

  /* ----------------------------------------------------------
       TAHAP 6 — Refleksi
       ---------------------------------------------------------- */
  refleksi: {
    title: 'Refleksi Pembelajaran',
    instruction:
      'Luangkan waktu untuk merenungkan pengalamanmu. Tidak ada jawaban benar atau salah. Jawab setidaknya 3 pertanyaan untuk melanjutkan.',
    questions: [
      {
        id: 'r1',
        label: 'Strategi Estimasiku',
        prompt:
          'Saat melakukan estimasi tadi, kamu cenderung membulatkan ke atas, ke bawah, atau campuran? Mengapa kamu memilih strategi itu?',
        placeholder:
          'Contoh: Saya cenderung membulatkan ke atas supaya lebih aman, karena saya tidak mau kekurangan uang di kasir...',
      },
      {
        id: 'r2',
        label: 'Akurasi Estimasiku',
        prompt:
          'Seberapa dekat estimasimu dengan total sebenarnya? Apa yang menurutmu membuat estimasimu lebih akurat atau kurang akurat?',
        placeholder:
          'Contoh: Estimasi saya cukup dekat saat menggunakan pembulatan ke ribuan, tetapi meleset jauh saat ke sepuluh ribuan...',
      },
      {
        id: 'r3',
        label: 'Manfaat Estimasi dalam Kehidupan',
        prompt:
          'Dalam situasi apa dalam kehidupan sehari-hari kamu merasa estimasi lebih berguna daripada menghitung persis?',
        placeholder:
          'Contoh: Saat belanja di pasar tanpa kalkulator, atau saat antri panjang di kasir dan ingin tahu apakah uangku cukup...',
      },
      {
        id: 'r4',
        label: 'Kesimpulanku',
        prompt:
          'Apa yang kamu pelajari tentang hubungan antara estimasi, pembulatan, dan keputusan keuangan sehari-hari?',
        placeholder: 'Tuliskan kesimpulan pemahamanmu di sini...',
      },
    ],
  },
};
