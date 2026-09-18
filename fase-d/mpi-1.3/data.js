'use strict';

/* ============================================================
   data.js — Konten pembelajaran
   Matematika: Perkalian dan Pembagian Bilangan Bulat
   Fase D — SMP (Kelas 7)
   ============================================================ */

var DATA = {
  meta: {
    title: 'Perkalian dan Pembagian Bilangan Bulat',
    subject: 'Matematika — Fase D (SMP)',
    goal: 'Saya dapat menerapkan operasi perkalian dan pembagian pada bilangan bulat serta menggunakannya dalam penyelesaian masalah estimasi sederhana.',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — EKSPLORASI PERKALIAN
     3 konteks: +×+, +×−, −×−
     ---------------------------------------------------------- */
  eksplorasiKali: {
    title: 'Memahami Perkalian Bilangan Bulat',
    instruction:
      'Amati setiap situasi nyata berikut. Tekan tombol untuk melihat bagaimana perkalian bekerja dalam setiap konteks, lalu perhatikan tanda hasilnya.',
    konteks: [
      {
        id: 'kali_pp',
        badge: 'Positif × Positif',
        icon: '🏢',
        story:
          'Lift sebuah gedung bergerak <strong>naik 3 lantai</strong> setiap kali tombol ditekan. Tombol ditekan sebanyak <strong>4 kali</strong>.',
        ekspresi: '3 × 4',
        hasil: 12,
        hasilNegatif: false,
        unit: 'lantai',
        rows: 4,
        cols: 3,
        mode: 'pos',
        kalimat: 'Total lantai yang dinaiki',
        pertanyaan: 'Berapa total lantai yang dinaiki lift?',
        penjelasan:
          'Naik 3 lantai sebanyak 4 kali = <strong>3 + 3 + 3 + 3 = 12 lantai</strong>. Dua bilangan positif dikalikan menghasilkan <strong>bilangan positif</strong>.',
        ruleSummary:
          '<span style="color:var(--color-success-strong)">positif</span> × <span style="color:var(--color-success-strong)">positif</span> = <span style="color:var(--color-success-strong)">positif (+)</span>',
      },
      {
        id: 'kali_pn',
        badge: 'Positif × Negatif',
        icon: '🌡️',
        story:
          'Setiap jam, suhu di sebuah ruangan pendingin <strong>turun 2°C</strong>. Suhu "turun 2" berarti perubahannya adalah <strong>−2</strong>. Ini terjadi selama <strong>5 jam</strong>.',
        ekspresi: '5 × (−2)',
        hasil: -10,
        hasilNegatif: true,
        unit: '°C',
        rows: 5,
        cols: 2,
        mode: 'neg',
        kalimat: 'Total perubahan suhu',
        pertanyaan: 'Berapa total perubahan suhu setelah 5 jam?',
        penjelasan:
          '5 jam × (−2°C per jam) = <strong>(−2) + (−2) + (−2) + (−2) + (−2) = −10°C</strong>. Bilangan positif dikali bilangan negatif menghasilkan <strong>bilangan negatif</strong>.',
        ruleSummary:
          '<span style="color:var(--color-success-strong)">positif</span> × <span style="color:var(--color-error-strong)">negatif</span> = <span style="color:var(--color-error-strong)">negatif (−)</span>',
      },
      {
        id: 'kali_nn',
        badge: 'Negatif × Negatif',
        icon: '💳',
        story:
          'Seorang pedagang memiliki <strong>3 tagihan hutang</strong>, masing-masing sebesar <strong>Rp 4.000</strong>. Kini, semua tagihan tersebut <strong>dihapus</strong> (dinyatakan lunas). "Menghapus hutang" berarti mengalikan dengan <strong>−1</strong>.',
        ekspresi: '(−3) × (−4.000)',
        hasil: 12000,
        hasilNegatif: false,
        unit: 'rupiah',
        rows: 3,
        cols: 4,
        mode: 'remove',
        kalimat: 'Total perubahan keuangan',
        pertanyaan:
          'Jika "hutang" diwakili dengan bilangan negatif dan "menghapus" berarti ×(−1), berapakah perubahan keuangan pedagang itu?',
        penjelasan:
          'Menghapus 3 hutang × Rp 4.000 = <strong>+Rp 12.000</strong>. Dua bilangan negatif dikalikan menghasilkan <strong>bilangan positif</strong>. Ingat: "hilangnya hal negatif = hal positif".',
        ruleSummary:
          '<span style="color:var(--color-error-strong)">negatif</span> × <span style="color:var(--color-error-strong)">negatif</span> = <span style="color:var(--color-success-strong)">positif (+)</span>',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 3 — ATURAN TANDA
     Discovery: siswa menemukan pola tanda ×
     ---------------------------------------------------------- */
  aturanTanda: {
    title: 'Menemukan Aturan Tanda Perkalian',
    instruction:
      'Perhatikan contoh-contoh di bawah. Klik setiap sel berwarna abu-abu untuk mengungkap tanda hasilnya. Temukan polanya!',
    baris: [
      {
        id: 'at1',
        faktor1: '+4',
        faktor2: '+5',
        contoh: '4 × 5',
        hasil: 20,
        tanda: '+',
        mode: 'pos',
      },
      {
        id: 'at2',
        faktor1: '+4',
        faktor2: '−5',
        contoh: '4 × (−5)',
        hasil: -20,
        tanda: '−',
        mode: 'neg',
      },
      {
        id: 'at3',
        faktor1: '−4',
        faktor2: '+5',
        contoh: '(−4) × 5',
        hasil: -20,
        tanda: '−',
        mode: 'neg',
      },
      {
        id: 'at4',
        faktor1: '−4',
        faktor2: '−5',
        contoh: '(−4) × (−5)',
        hasil: 20,
        tanda: '+',
        mode: 'pos',
      },
    ],
    ringkasan:
      'Tanda sama → hasil <strong>positif (+)</strong>. Tanda berbeda → hasil <strong>negatif (−)</strong>. Aturan ini juga berlaku untuk <strong>pembagian</strong>!',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — LATIHAN PERKALIAN
     ---------------------------------------------------------- */
  latihanKali: {
    title: 'Latihan Perkalian Bilangan Bulat',
    instruction: 'Hitung hasil perkalian berikut. Perhatikan tanda bilangan dengan teliti.',
    soal: [
      {
        id: 'lk1',
        ekspresi: '6 × 7',
        a: 6,
        b: 7,
        op: '×',
        answer: 42,
        hints: [
          'Kedua bilangan bertanda positif. Hasilnya pasti positif.',
          '6 × 7 = 6 ditambahkan 7 kali = 42.',
        ],
        explanation: '6 × 7 = <strong>42</strong>. Positif × Positif = Positif.',
      },
      {
        id: 'lk2',
        ekspresi: '(−8) × 3',
        a: -8,
        b: 3,
        op: '×',
        answer: -24,
        hints: [
          'Tanda berbeda (negatif × positif). Hasilnya pasti negatif.',
          'Hitung nilai mutlaknya: 8 × 3 = 24, lalu beri tanda negatif.',
        ],
        explanation: '(−8) × 3 = <strong>−24</strong>. Negatif × Positif = Negatif.',
      },
      {
        id: 'lk3',
        ekspresi: '9 × (−5)',
        a: 9,
        b: -5,
        op: '×',
        answer: -45,
        hints: [
          'Tanda berbeda (positif × negatif). Hasilnya pasti negatif.',
          'Hitung: 9 × 5 = 45, lalu beri tanda negatif.',
        ],
        explanation: '9 × (−5) = <strong>−45</strong>. Positif × Negatif = Negatif.',
      },
      {
        id: 'lk4',
        ekspresi: '(−6) × (−7)',
        a: -6,
        b: -7,
        op: '×',
        answer: 42,
        hints: [
          'Tanda sama (negatif × negatif). Hasilnya pasti positif.',
          'Hitung: 6 × 7 = 42, hasilnya positif.',
        ],
        explanation: '(−6) × (−7) = <strong>42</strong>. Negatif × Negatif = Positif.',
      },
      {
        id: 'lk5',
        ekspresi: '(−12) × 4',
        a: -12,
        b: 4,
        op: '×',
        answer: -48,
        hints: [
          'Tanda berbeda. Hasilnya negatif.',
          'Hitung: 12 × 4 = 48, lalu beri tanda negatif → −48.',
        ],
        explanation: '(−12) × 4 = <strong>−48</strong>. Negatif × Positif = Negatif.',
      },
      {
        id: 'lk6',
        ekspresi: '(−11) × (−3)',
        a: -11,
        b: -3,
        op: '×',
        answer: 33,
        hints: [
          'Tanda sama (kedua negatif). Hasilnya positif.',
          'Hitung: 11 × 3 = 33, hasilnya positif.',
        ],
        explanation: '(−11) × (−3) = <strong>33</strong>. Negatif × Negatif = Positif.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 5 — EKSPLORASI PEMBAGIAN
     Hubungan invers perkalian–pembagian
     ---------------------------------------------------------- */
  eksplorasiBagi: {
    title: 'Memahami Pembagian Bilangan Bulat',
    instruction:
      'Pembagian adalah <strong>kebalikan (invers) dari perkalian</strong>. Amati pasangan perkalian dan pembagian berikut, lalu klik untuk mengungkap hasilnya.',
    pasangan: [
      {
        id: 'bp1',
        kali: '4 × 3 = 12',
        bagi: '12 ÷ 3 = ?',
        hasil_bagi: 4,
        tanda: '+',
        penjelasan:
          'Karena 4 × 3 = 12, maka 12 ÷ 3 = <strong>4</strong>. Positif ÷ Positif = <strong>Positif</strong>.',
      },
      {
        id: 'bp2',
        kali: '(−4) × 3 = −12',
        bagi: '(−12) ÷ 3 = ?',
        hasil_bagi: -4,
        tanda: '−',
        penjelasan:
          'Karena (−4) × 3 = −12, maka (−12) ÷ 3 = <strong>−4</strong>. Negatif ÷ Positif = <strong>Negatif</strong>.',
      },
      {
        id: 'bp3',
        kali: '4 × (−3) = −12',
        bagi: '(−12) ÷ (−3) = ?',
        hasil_bagi: 4,
        tanda: '+',
        penjelasan:
          'Karena 4 × (−3) = −12, maka (−12) ÷ (−3) = <strong>4</strong>. Negatif ÷ Negatif = <strong>Positif</strong>.',
      },
      {
        id: 'bp4',
        kali: '(−4) × (−3) = 12',
        bagi: '12 ÷ (−3) = ?',
        hasil_bagi: -4,
        tanda: '−',
        penjelasan:
          'Karena (−4) × (−3) = 12, maka 12 ÷ (−3) = <strong>−4</strong>. Positif ÷ Negatif = <strong>Negatif</strong>.',
      },
    ],
    ringkasan:
      'Aturan tanda untuk pembagian <strong>sama persis</strong> dengan perkalian: tanda sama → positif, tanda berbeda → negatif.',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — LATIHAN PEMBAGIAN
     ---------------------------------------------------------- */
  latihanBagi: {
    title: 'Latihan Pembagian Bilangan Bulat',
    instruction: 'Hitung hasil pembagian berikut. Ingat aturan tanda yang sama dengan perkalian.',
    soal: [
      {
        id: 'lb1',
        ekspresi: '35 ÷ 7',
        a: 35,
        b: 7,
        op: '÷',
        answer: 5,
        hints: [
          'Tanda sama (positif ÷ positif). Hasilnya positif.',
          'Tanya dirimu: 7 × ? = 35. Jawabannya 5.',
        ],
        explanation: '35 ÷ 7 = <strong>5</strong>. Positif ÷ Positif = Positif.',
      },
      {
        id: 'lb2',
        ekspresi: '(−42) ÷ 6',
        a: -42,
        b: 6,
        op: '÷',
        answer: -7,
        hints: [
          'Tanda berbeda (negatif ÷ positif). Hasilnya negatif.',
          'Nilai mutlak: 42 ÷ 6 = 7. Beri tanda negatif → −7.',
        ],
        explanation: '(−42) ÷ 6 = <strong>−7</strong>. Negatif ÷ Positif = Negatif.',
      },
      {
        id: 'lb3',
        ekspresi: '56 ÷ (−8)',
        a: 56,
        b: -8,
        op: '÷',
        answer: -7,
        hints: [
          'Tanda berbeda (positif ÷ negatif). Hasilnya negatif.',
          'Hitung: 56 ÷ 8 = 7, lalu beri tanda negatif → −7.',
        ],
        explanation: '56 ÷ (−8) = <strong>−7</strong>. Positif ÷ Negatif = Negatif.',
      },
      {
        id: 'lb4',
        ekspresi: '(−63) ÷ (−9)',
        a: -63,
        b: -9,
        op: '÷',
        answer: 7,
        hints: [
          'Tanda sama (negatif ÷ negatif). Hasilnya positif.',
          'Nilai mutlak: 63 ÷ 9 = 7. Hasilnya positif.',
        ],
        explanation: '(−63) ÷ (−9) = <strong>7</strong>. Negatif ÷ Negatif = Positif.',
      },
      {
        id: 'lb5',
        ekspresi: '(−80) ÷ (−4)',
        a: -80,
        b: -4,
        op: '÷',
        answer: 20,
        hints: ['Tanda sama. Hasilnya positif.', 'Hitung: 80 ÷ 4 = 20.'],
        explanation: '(−80) ÷ (−4) = <strong>20</strong>. Negatif ÷ Negatif = Positif.',
      },
      {
        id: 'lb6',
        ekspresi: '72 ÷ (−6)',
        a: 72,
        b: -6,
        op: '÷',
        answer: -12,
        hints: [
          'Tanda berbeda. Hasilnya negatif.',
          'Hitung: 72 ÷ 6 = 12, lalu beri tanda negatif → −12.',
        ],
        explanation: '72 ÷ (−6) = <strong>−12</strong>. Positif ÷ Negatif = Negatif.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 7 — ESTIMASI SEDERHANA
     Menggunakan perkalian/pembagian untuk memperkirakan
     ---------------------------------------------------------- */
  estimasi: {
    title: 'Estimasi dengan Perkalian dan Pembagian',
    instruction:
      'Estimasi berarti <strong>memperkirakan</strong> dengan cara yang masuk akal — bukan harus tepat, tetapi dekat dengan kenyataan. Gunakan perkalian atau pembagian untuk menjawab.',
    soal: [
      {
        id: 'e1',
        badge: 'Buku di Perpustakaan',
        icon: '📚',
        story:
          'Sebuah rak buku memiliki <strong>8 baris</strong> dan tiap baris menampung <strong>sekitar 12 buku</strong>. Perpustakaan memiliki <strong>15 rak</strong> seperti itu.',
        pertanyaan: 'Perkirakan berapa total buku di perpustakaan tersebut.',
        langkah: [
          'Buku per rak = 8 baris × 12 buku ≈ 96 buku ≈ <strong>100 buku</strong>',
          'Total buku ≈ 100 × 15 = <strong>1.500 buku</strong>',
        ],
        answer: 1440,
        toleransi: 0.25,
        unit: 'buku',
        hint: 'Hitung dulu buku per rak (8 × 12), lalu kalikan dengan jumlah rak (15).',
        explanation:
          '8 × 12 = 96 buku per rak. 96 × 15 = <strong>1.440 buku</strong>. Estimasi sekitar 1.440–1.500 buku diterima.',
      },
      {
        id: 'e2',
        badge: 'Pengeluaran Harian',
        icon: '🛒',
        story:
          'Sebuah keluarga mengeluarkan sekitar <strong>Rp 75.000</strong> per hari untuk kebutuhan makan. Perkirakan pengeluaran selama <strong>satu bulan</strong> (30 hari).',
        pertanyaan: 'Perkirakan total pengeluaran makan keluarga itu selama satu bulan.',
        langkah: [
          'Bulatkan: Rp 75.000 ≈ <strong>Rp 75.000</strong>',
          'Total = 75.000 × 30 = <strong>Rp 2.250.000</strong>',
        ],
        answer: 2250000,
        toleransi: 0.2,
        unit: 'rupiah',
        hint: 'Kalikan pengeluaran per hari (75.000) dengan jumlah hari dalam sebulan (30).',
        explanation: '75.000 × 30 = <strong>Rp 2.250.000</strong> per bulan.',
      },
      {
        id: 'e3',
        badge: 'Penurunan Suhu',
        icon: '❄️',
        story:
          'Suhu di sebuah kota tercatat <strong>turun 3°C setiap jam</strong> sejak tengah malam. Saat tengah malam suhu adalah <strong>4°C</strong>.',
        pertanyaan: 'Berapa suhu yang diperkirakan setelah 4 jam?',
        langkah: [
          'Perubahan suhu = (−3) × 4 = <strong>−12°C</strong>',
          'Suhu akhir = 4 + (−12) = <strong>−8°C</strong>',
        ],
        answer: -8,
        toleransi: 0,
        unit: '°C',
        hint: 'Hitung perubahan total: turun 3°C per jam × 4 jam. Lalu tambahkan ke suhu awal.',
        explanation:
          'Perubahan = (−3) × 4 = −12°C. Suhu akhir = 4 + (−12) = <strong>−8°C</strong>.',
      },
      {
        id: 'e4',
        badge: 'Pembagian Tugas',
        icon: '👥',
        story:
          'Sebuah kelas harus memproduksi <strong>144 buah produk kerajinan</strong>. Jika tugas dibagi rata kepada <strong>12 siswa</strong>, berapa produk yang harus dibuat tiap siswa?',
        pertanyaan: 'Berapa produk yang harus dibuat setiap siswa?',
        langkah: ['Tugas tiap siswa = 144 ÷ 12 = <strong>12 produk</strong>'],
        answer: 12,
        toleransi: 0,
        unit: 'produk',
        hint: 'Bagikan total produk (144) dengan jumlah siswa (12).',
        explanation: '144 ÷ 12 = <strong>12 produk</strong> per siswa.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 8 — TANTANGAN KONTEKSTUAL
     ---------------------------------------------------------- */
  tantangan: {
    title: 'Tantangan Kontekstual',
    soal: [
      {
        id: 't1',
        badge: 'Skor Permainan',
        icon: '🎮',
        story:
          'Dalam permainan trivia, setiap jawaban <strong>salah</strong> mengurangi skor sebesar <strong>5 poin</strong>. Arif menjawab salah sebanyak <strong>7 kali</strong>.',
        pertanyaan: 'Berapa total perubahan skor Arif?',
        type: 'input',
        answer: -35,
        unit: 'poin',
        hint: 'Setiap jawaban salah = −5 poin. Dikalikan 7 kali. Gunakan: 7 × (−5).',
        explanation: '7 × (−5) = <strong>−35 poin</strong>. Skor Arif berkurang 35 poin.',
      },
      {
        id: 't2',
        badge: 'Kedalaman Selam',
        icon: '🤿',
        story:
          'Seorang penyelam bergerak <strong>turun 4 meter per menit</strong>. Gerak turun dinyatakan dengan <strong>bilangan negatif</strong>.',
        pertanyaan: 'Berapa posisi penyelam setelah 9 menit (dimulai dari permukaan = 0 meter)?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: '−36 meter' },
          { id: 'opt_b', label: '+36 meter' },
          { id: 'opt_c', label: '−13 meter' },
        ],
        correct: 'opt_a',
        hint: 'Perubahan posisi = (−4) × 9. Hitung hasilnya.',
        explanation:
          '(−4) × 9 = <strong>−36 meter</strong>. Penyelam berada 36 meter di bawah permukaan.',
      },
      {
        id: 't3',
        badge: 'Pembagian Dana',
        icon: '💰',
        story:
          'Kelompok belajar mengalami kerugian total <strong>−Rp 48.000</strong> dari hasil usaha bersama. Kerugian ini dibagi rata kepada <strong>6 anggota</strong>.',
        pertanyaan: 'Berapa bagian kerugian yang ditanggung setiap anggota?',
        type: 'input',
        answer: -8000,
        unit: 'rupiah',
        hint: 'Bagi kerugian total dengan jumlah anggota: (−48.000) ÷ 6.',
        explanation:
          '(−48.000) ÷ 6 = <strong>−Rp 8.000</strong> per anggota. Setiap anggota menanggung rugi Rp 8.000.',
      },
      {
        id: 't4',
        badge: 'Perkiraan Produksi',
        icon: '🏭',
        story:
          'Sebuah mesin memproduksi <strong>−8 unit per jam</strong> (mesin menyusutkan persediaan). Mesin berjalan selama <strong>−6 jam</strong> (artinya sudah berhenti 6 jam lalu — dinyatakan negatif sebagai waktu lampau).',
        pertanyaan: 'Berapakah hasil kali (−8) × (−6)?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: '−48' },
          { id: 'opt_b', label: '+48' },
          { id: 'opt_c', label: '+14' },
        ],
        correct: 'opt_b',
        hint: 'Tanda sama (negatif × negatif) → hasilnya positif. Hitung: 8 × 6 = ?',
        explanation: '(−8) × (−6) = <strong>+48</strong>. Negatif × Negatif = Positif.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    title: 'Refleksi Pembelajaran',
    note: 'Refleksi ini membantu kamu merangkum pemahaman hari ini. Jawaban <strong>tidak dikirim ke mana pun</strong> — hanya ditampilkan di layarmu.',
    soal: [
      {
        id: 'r1',
        question:
          'Dengan kata-katamu sendiri, jelaskan <strong>aturan tanda</strong> pada perkalian dan pembagian bilangan bulat.',
        placeholder: 'Tuliskan penjelasanmu...',
      },
      {
        id: 'r2',
        question:
          'Berikan <strong>satu contoh situasi nyata</strong> (selain yang ada di media ini) di mana kamu perlu mengalikan atau membagi bilangan negatif.',
        placeholder: 'Contoh situasimu...',
      },
      {
        id: 'r3',
        question:
          'Bagaimana kamu menggunakan perkalian atau pembagian untuk <strong>memperkirakan (estimasi)</strong> suatu nilai? Apa strategi yang kamu pakai?',
        placeholder: 'Tuliskan strategimu...',
      },
      {
        id: 'r4',
        question:
          'Hal apa yang menurutmu paling menantang tentang perkalian dan pembagian bilangan bulat? Apa yang ingin kamu pelajari lebih lanjut?',
        placeholder: 'Tuliskan tantangan atau pertanyaanmu...',
      },
    ],
  },
};
