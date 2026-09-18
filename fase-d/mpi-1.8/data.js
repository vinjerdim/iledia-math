'use strict';

/* ============================================================
   data.js — Konten pembelajaran
   Matematika: Rancangan Anggaran Belanja
   Fase D (SMP) — Materi 1.8
   ============================================================ */

var DATA = {
  meta: {
    title: 'Rancangan Anggaran Belanja',
    subject: 'Matematika — Fase D (SMP)',
    goal: 'Saya dapat menyusun dan mempresentasikan rancangan anggaran belanja pribadi/kelompok yang rasional dengan memanfaatkan seluruh operasi aritmatika bilangan bulat, rasional, dan desimal.',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — EKSPLORASI OPERASI
     ---------------------------------------------------------- */
  eksplorasiOperasi: {
    title: 'Eksplorasi Operasi Aritmatika dalam Anggaran',
    instruction:
      'Setiap tim panitia menghadapi tantangan berbeda. Selesaikan setiap langkah dengan operasi aritmatika yang tepat!',
    konteks: [
      {
        id: 'k1',
        badge: 'Tim Dekorasi',
        icon: '🎨',
        story:
          'Tim dekorasi Kelas 8B berbelanja ke toko perlengkapan. Mereka mencatat setiap pengeluaran agar tidak melebihi jatah anggaran dekorasi.',
        items: [
          { nama: 'Spanduk (2 lembar)', harga: 85000 },
          { nama: 'Balon (2 pak)', harga: 48000 },
          { nama: 'Kain latar panggung', harga: 127000 },
          { nama: 'Pita dan lilin hias', harga: 35000 },
        ],
        operasi_label: 'Penjumlahan & Pengurangan',
        steps: [
          {
            id: 's1',
            question:
              'Hitung <strong>total belanja</strong> tim dekorasi.',
            hint: '85.000 + 48.000 + 127.000 + 35.000 = ? Jumlahkan satu per satu.',
            answer: 295000,
            explanation:
              '85.000 + 48.000 + 127.000 + 35.000 = <strong>Rp 295.000</strong>. Operasi penjumlahan digunakan untuk menjumlahkan seluruh pengeluaran.',
          },
          {
            id: 's2',
            question:
              'Jatah anggaran dekorasi adalah <strong>Rp 300.000</strong>. Berapa <strong>sisa anggaran</strong> setelah berbelanja?',
            hint: 'Sisa = Jatah − Total belanja → 300.000 − 295.000 = ?',
            answer: 5000,
            explanation:
              '300.000 − 295.000 = <strong>Rp 5.000</strong>. Tim dekorasi sangat efisien — hampir tepat sesuai anggaran!',
          },
        ],
      },
      {
        id: 'k2',
        badge: 'Tim Penampilan',
        icon: '🎭',
        story:
          'Kelompok tari menyewa kostum untuk 4 penari. Toko penyewaan memberi diskon 12,5% karena mereka menyewa lebih dari 3 kostum sekaligus.',
        items: [
          { nama: 'Harga sewa per kostum', harga: 55000 },
          { nama: 'Jumlah kostum', harga_label: '4 kostum' },
          { nama: 'Diskon diberikan', harga_label: '12,5%' },
        ],
        operasi_label: 'Perkalian & Desimal (Persen)',
        steps: [
          {
            id: 's1',
            question:
              'Berapa total harga sewa <strong>sebelum diskon</strong>? (4 kostum × Rp 55.000)',
            hint: '4 × 55.000 = ? Kalikan jumlah kostum dengan harga satuan.',
            answer: 220000,
            explanation:
              '4 × Rp 55.000 = <strong>Rp 220.000</strong>. Perkalian digunakan untuk menghitung harga beberapa item dengan harga sama.',
          },
          {
            id: 's2',
            question:
              'Diskon 12,5% dari Rp 220.000 adalah berapa rupiah?',
            hint: '12,5% = 12,5/100 = 0,125. Jadi diskon = 220.000 × 0,125 = ?',
            answer: 27500,
            explanation:
              '220.000 × 0,125 = <strong>Rp 27.500</strong>. Persen ditulis sebagai desimal: 12,5% = 0,125.',
          },
          {
            id: 's3',
            question:
              'Berapa harga yang harus dibayar <strong>setelah diskon</strong>?',
            hint: 'Harga akhir = harga asli − nilai diskon → 220.000 − 27.500 = ?',
            answer: 192500,
            explanation:
              '220.000 − 27.500 = <strong>Rp 192.500</strong>. Harga setelah diskon = harga asli dikurangi nilai diskon.',
          },
        ],
      },
      {
        id: 'k3',
        badge: 'Tim Teknis',
        icon: '🔊',
        story:
          'Tim teknis menyewa sound system seharga Rp 240.000. Biaya ini ditanggung bersama oleh 5 kelompok penampil. Selain itu, mereka ingin mengetahui nilai 1/4 dari total anggaran kelas.',
        items: [
          { nama: 'Sewa sound system', harga: 240000 },
          { nama: 'Ditanggung bersama oleh', harga_label: '5 kelompok' },
          { nama: 'Total anggaran kelas', harga: 600000 },
        ],
        operasi_label: 'Pembagian & Pecahan',
        steps: [
          {
            id: 's1',
            question:
              'Berapa biaya sound system <strong>per kelompok</strong>? (Rp 240.000 ÷ 5)',
            hint: '240.000 ÷ 5 = ? Bagi total biaya dengan jumlah kelompok.',
            answer: 48000,
            explanation:
              '240.000 ÷ 5 = <strong>Rp 48.000</strong> per kelompok. Pembagian digunakan untuk membagi biaya secara merata.',
          },
          {
            id: 's2',
            question:
              '<strong>1/4 dari total anggaran kelas</strong> (Rp 600.000) adalah berapa?',
            hint: '1/4 × 600.000 = 600.000 ÷ 4 = ? Pecahan berarti membagi.',
            answer: 150000,
            explanation:
              '1/4 × 600.000 = 600.000 ÷ 4 = <strong>Rp 150.000</strong>. Pecahan 1/4 artinya bagian pertama dari empat bagian yang sama.',
          },
        ],
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MENYUSUN RINCIAN
     ---------------------------------------------------------- */
  menyusunRincian: {
    title: 'Menyusun Rincian Anggaran',
    instruction:
      'Hitung biaya setiap pos anggaran. Pilih dan gunakan operasi yang tepat!',
    soal: [
      {
        id: 'mr1',
        kategori: 'Konsumsi',
        icon: '🍱',
        konteks:
          '35 siswa masing-masing mendapat 1 porsi snack seharga Rp 4.000.',
        question: 'Berapa <strong>total biaya snack</strong> untuk seluruh siswa?',
        answer: 140000,
        hints: [
          'Total = jumlah siswa × harga per porsi.',
          '35 × 4.000 = ? (Petunjuk: 35 × 4 = 140, tambahkan tiga angka nol.)',
        ],
        explanation:
          '35 × Rp 4.000 = <strong>Rp 140.000</strong>. Biaya total snack untuk 35 siswa.',
        operasi: '×',
      },
      {
        id: 'mr2',
        kategori: 'Penampilan',
        icon: '🎭',
        konteks: 'Kelompok tari menyewa 4 kostum, masing-masing Rp 28.500.',
        question: 'Berapa <strong>total biaya sewa kostum</strong>?',
        answer: 114000,
        hints: [
          '4 kostum × Rp 28.500 = ?',
          '4 × 28.500 = (4 × 28.000) + (4 × 500) = 112.000 + 2.000 = ?',
        ],
        explanation:
          '4 × Rp 28.500 = <strong>Rp 114.000</strong>. Harga satuan mengandung angka ratusan.',
        operasi: '×',
      },
      {
        id: 'mr3',
        kategori: 'Teknis',
        icon: '🔊',
        konteks:
          'Perlengkapan teknis: sewa sound system Rp 125.000, sewa mic Rp 35.000, dan kabel Rp 12.500.',
        question: 'Berapa <strong>total biaya perlengkapan teknis</strong>?',
        answer: 172500,
        hints: [
          'Jumlahkan ketiga harga: 125.000 + 35.000 + 12.500 = ?',
          '125.000 + 35.000 = 160.000, lalu ditambah 12.500.',
        ],
        explanation:
          '125.000 + 35.000 + 12.500 = <strong>Rp 172.500</strong>. Salah satu harga mengandung angka 500.',
        operasi: '+',
      },
      {
        id: 'mr4',
        kategori: 'Dekorasi',
        icon: '🎨',
        konteks:
          'Backdrop panggung seharga Rp 90.000 mendapat diskon 10%.',
        question:
          'Berapa <strong>harga yang harus dibayar</strong> setelah diskon?',
        answer: 81000,
        hints: [
          'Langkah 1: Hitung nilai diskon = 90.000 × 10% = 90.000 × 0,1 = 9.000.',
          'Langkah 2: Harga bayar = harga asli − diskon = 90.000 − 9.000 = ?',
        ],
        explanation:
          'Diskon 10% = 9.000. Harga bayar = 90.000 − 9.000 = <strong>Rp 81.000</strong>.',
        operasi: '× dan −',
      },
      {
        id: 'mr5',
        kategori: 'Konsumsi',
        icon: '🥤',
        konteks:
          'Minuman: 35 botol air mineral @ Rp 2.500 ditambah 2 galon air minum @ Rp 18.000.',
        question: 'Berapa <strong>total biaya minuman</strong>?',
        answer: 123500,
        hints: [
          'Hitung dua kelompok terpisah: (35 × 2.500) + (2 × 18.000).',
          '35 × 2.500 = 87.500 dan 2 × 18.000 = 36.000. Jumlahkan keduanya.',
        ],
        explanation:
          '(35 × 2.500) + (2 × 18.000) = 87.500 + 36.000 = <strong>Rp 123.500</strong>.',
        operasi: '× dan +',
      },
      {
        id: 'mr6',
        kategori: 'Rekapitulasi',
        icon: '📋',
        konteks:
          'Rincian anggaran: dekorasi Rp 81.000, konsumsi Rp 263.500, penampilan Rp 114.000, teknis Rp 172.500, lain-lain Rp 35.000.',
        question:
          'Berapa <strong>total seluruh anggaran</strong> yang direncanakan?',
        answer: 666000,
        hints: [
          'Jumlahkan semua pos: 81.000 + 263.500 + 114.000 + 172.500 + 35.000 = ?',
          '81.000 + 263.500 = 344.500 → + 114.000 = 458.500 → + 172.500 = 631.000 → + 35.000 = ?',
        ],
        explanation:
          '81.000 + 263.500 + 114.000 + 172.500 + 35.000 = <strong>Rp 666.000</strong>. Totalnya melebihi anggaran Rp 600.000 — harus direvisi!',
        operasi: '+',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 4 — ANALISIS ANGGARAN
     ---------------------------------------------------------- */
  analisisAnggaran: {
    title: 'Analisis Anggaran dengan Pecahan & Desimal',
    instruction:
      'Selesaikan soal analisis anggaran berikut menggunakan operasi bilangan rasional dan desimal.',
    soal: [
      {
        id: 'aa1',
        question:
          'Pos konsumsi dianggarkan <strong>Rp 150.000</strong> dari total anggaran <strong>Rp 600.000</strong>. Berapa bagian pecahan konsumsi dari total anggaran?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: '1/3' },
          { id: 'opt_b', label: '1/4' },
          { id: 'opt_c', label: '1/5' },
        ],
        correct: 'opt_b',
        hint: '150.000 / 600.000 = ? Sederhanakan: bagi pembilang dan penyebut dengan angka yang sama.',
        explanation:
          '150.000 / 600.000 = 15/60 = 1/4. Konsumsi menggunakan <strong>1/4</strong> dari total anggaran.',
      },
      {
        id: 'aa2',
        question:
          'Vendor sound system memberi diskon <strong>12,5%</strong> dari harga <strong>Rp 160.000</strong>. Berapa nilai diskonnya (dalam rupiah)?',
        type: 'input',
        answer: 20000,
        hints: [
          '12,5% = 0,125. Kalikan dengan harga asli: 160.000 × 0,125 = ?',
          '160.000 × 0,1 = 16.000 dan 160.000 × 0,025 = 4.000. Jumlahkan keduanya.',
        ],
        explanation:
          '160.000 × 0,125 = 160.000 ÷ 8 = <strong>Rp 20.000</strong>. Nilai diskon adalah Rp 20.000.',
      },
      {
        id: 'aa3',
        question:
          'Kain dekorasi dibeli total <strong>Rp 127.500</strong> untuk <strong>8,5 meter</strong>. Berapa harga kain per meter?',
        type: 'input',
        answer: 15000,
        hints: [
          'Harga per meter = total harga ÷ jumlah meter = 127.500 ÷ 8,5.',
          'Petunjuk: 127.500 ÷ 8,5 = 1.275.000 ÷ 85. Coba bagi 1.275 dengan 8,5.',
        ],
        explanation:
          '127.500 ÷ 8,5 = <strong>Rp 15.000</strong> per meter. Operasi pembagian dengan bilangan desimal.',
      },
      {
        id: 'aa4',
        question:
          'Total belanja sudah <strong>Rp 487.500</strong> dari anggaran <strong>Rp 600.000</strong>. Berapa <strong>sisa anggaran</strong>?',
        type: 'input',
        answer: 112500,
        hints: [
          'Sisa = Anggaran − Total belanja.',
          '600.000 − 487.500 = ?',
        ],
        explanation:
          '600.000 − 487.500 = <strong>Rp 112.500</strong>. Masih ada sisa yang bisa dimanfaatkan.',
      },
      {
        id: 'aa5',
        question:
          'Panitia mengalokasikan <strong>2/5 dari total anggaran Rp 600.000</strong> untuk penampilan dan teknis. Berapa rupiah alokasinya?',
        type: 'input',
        answer: 240000,
        hints: [
          '2/5 × 600.000 = ? Hitung dulu 1/5-nya.',
          '1/5 × 600.000 = 600.000 ÷ 5 = 120.000. Lalu dikali 2.',
        ],
        explanation:
          '2/5 × 600.000 = 2 × (600.000 ÷ 5) = 2 × 120.000 = <strong>Rp 240.000</strong>.',
      },
      {
        id: 'aa6',
        question:
          'Biaya dekorasi Rp 156.000 ditanggung oleh <strong>4 orang panitia</strong>. Berapa iuran per orang?',
        type: 'input',
        answer: 39000,
        hints: [
          'Iuran per orang = total biaya ÷ jumlah orang.',
          '156.000 ÷ 4 = ?',
        ],
        explanation:
          '156.000 ÷ 4 = <strong>Rp 39.000</strong> per orang panitia dekorasi.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 5 — FINALISASI RANCANGAN
     ---------------------------------------------------------- */
  finalisasiRancangan: {
    title: 'Finalisasi Rancangan Anggaran',
    instruction:
      'Susun rancangan anggaran kelasmu! Isi jumlah item dan harga satuan untuk setiap pos. Pastikan total tidak melebihi Rp 600.000.',
    batas: 600000,
    kategori: [
      {
        id: 'dekorasi',
        nama: 'Dekorasi',
        icon: '🎨',
        hint_contoh: 'Spanduk, balon, kain latar, hiasan',
        satuan: 'item',
      },
      {
        id: 'konsumsi',
        nama: 'Konsumsi',
        icon: '🍱',
        hint_contoh: 'Snack, minuman, buah',
        satuan: 'porsi',
      },
      {
        id: 'penampilan',
        nama: 'Penampilan',
        icon: '🎭',
        hint_contoh: 'Sewa kostum, properti, riasan',
        satuan: 'item',
      },
      {
        id: 'teknis',
        nama: 'Teknis',
        icon: '🔊',
        hint_contoh: 'Sewa sound, mic, kabel',
        satuan: 'set',
      },
      {
        id: 'lainnya',
        nama: 'Lain-lain',
        icon: '📋',
        hint_contoh: 'Dokumentasi, kebersihan, dll.',
        satuan: 'item',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 6 — PRESENTASI RANCANGAN
     ---------------------------------------------------------- */
  presentasiRancangan: {
    title: 'Presentasi Rancangan Anggaran',
    instruction:
      'Sampaikan rancangan anggaranmu! Tuliskan alasan dan pertimbangan dalam menyusun anggaran ini, lalu jawab pertanyaan hitungan berikut.',
    narasi_placeholder:
      'Contoh: Kami mengalokasikan sebagian besar anggaran untuk konsumsi karena… Kami memilih sewa kostum karena lebih hemat daripada membeli…',
    soal: [
      {
        id: 'p1',
        label: 'Hitungan 1 — Persentase Penggunaan',
        question:
          'Berapa persen (%) total anggaranmu dari batas maksimal Rp 600.000? (Bulatkan ke bilangan bulat terdekat)',
        tipe: 'hitung_persen',
        hint: 'Persen = (Total anggaranmu ÷ 600.000) × 100. Gunakan nilai total dari tabel di atas.',
      },
      {
        id: 'p2',
        label: 'Hitungan 2 — Iuran Per Siswa',
        question:
          'Jika biaya konsumsimu dibagi rata oleh 35 siswa, berapa iuran per siswa? (Bulatkan ke ratusan terdekat)',
        tipe: 'hitung_bagi',
        hint: 'Iuran = Biaya konsumsimu ÷ 35. Bulatkan ke kelipatan 100 terdekat.',
      },
    ],
    refleksi_placeholder:
      'Tuliskan minimal 2 alasan mengapa anggaran yang kamu susun sudah rasional…',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    title: 'Refleksi Pembelajaran',
    note: 'Refleksi ini membantu kamu merangkum pembelajaran hari ini. Jawaban <strong>tidak dikirim ke mana pun</strong> — hanya ditampilkan di layarmu.',
    soal: [
      {
        id: 'ref1',
        question:
          'Operasi aritmatika mana (penjumlahan, pengurangan, perkalian, pembagian) yang paling sering kamu gunakan saat menyusun anggaran? Mengapa?',
        placeholder: 'Tuliskan jawabanmu...',
      },
      {
        id: 'ref2',
        question:
          'Apa perbedaan yang kamu rasakan saat menghitung dengan <strong>bilangan bulat</strong>, <strong>pecahan</strong>, dan <strong>desimal</strong> dalam konteks anggaran?',
        placeholder: 'Tuliskan jawabanmu...',
      },
      {
        id: 'ref3',
        question:
          'Apakah anggaran yang kamu susun pada tahap Finalisasi benar-benar "rasional"? Apa kriteria anggaran yang rasional menurutmu?',
        placeholder: 'Tuliskan jawabanmu...',
      },
      {
        id: 'ref4',
        question:
          'Jika anggaran kelas dikurangi 20%, berapa anggaran barunya? Pos mana yang akan kamu kurangi dan bagaimana cara menghitungnya?',
        placeholder: 'Tuliskan jawabanmu...',
      },
    ],
  },
};
