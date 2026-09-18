'use strict';

/* ============================================================
   data.js — Konten pembelajaran
   Matematika: Penjumlahan dan Pengurangan Bilangan Bulat
   Fase D — SMP (Kelas 7)
   ============================================================ */

var DATA = {
  meta: {
    title: 'Penjumlahan dan Pengurangan Bilangan Bulat',
    subject: 'Matematika — Fase D (SMP)',
    goal: 'Saya dapat menerapkan operasi penjumlahan dan pengurangan pada bilangan bulat untuk menyelesaikan masalah kontekstual perubahan nilai secara tepat.',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — EKSPLORASI VISUAL
     Setiap konteks: situasi nyata → garis bilangan interaktif
     ---------------------------------------------------------- */
  eksplorasi: {
    title: 'Perubahan Nilai di Garis Bilangan',
    instruction:
      'Amati situasi nyata berikut. Tentukan ke arah mana nilai berubah, lalu klik tombol untuk melihat perubahan tersebut pada garis bilangan.',
    konteks: [
      {
        id: 'suhu',
        badge: 'Perubahan Suhu',
        icon: '🌡️',
        story:
          'Pagi hari suhu di Lembang tercatat <strong>3°C</strong>. Saat malam tiba, suhu <strong>turun 7°C</strong>.',
        awal: 3,
        op: '-',
        nilai: 7,
        akhir: -4,
        nlMin: -10,
        nlMax: 10,
        unit: '°C',
        ekspresi: '3 − 7 = −4',
        kalimat: 'Suhu malam hari',
        pertanyaan: 'Berapa suhu di Lembang saat malam hari?',
        penjelasan:
          'Turun 7°C = bergerak <strong>7 langkah ke kiri</strong> dari +3 pada garis bilangan. Melintasi titik 0, hasilnya: <strong>3 − 7 = −4°C</strong>.',
      },
      {
        id: 'saldo',
        badge: 'Saldo Rekening',
        icon: '💳',
        story:
          'Saldo rekening Rama adalah <strong>−Rp 15.000</strong> (berhutang). Ia menerima transfer uang saku <strong>+Rp 25.000</strong>.',
        awal: -15,
        op: '+',
        nilai: 25,
        akhir: 10,
        nlMin: -20,
        nlMax: 15,
        unit: 'ribu rupiah',
        ekspresi: '−15 + 25 = 10',
        kalimat: 'Saldo setelah transfer',
        pertanyaan: 'Berapa saldo rekening Rama setelah menerima transfer?',
        penjelasan:
          'Menerima Rp 25.000 = bergerak <strong>25 langkah ke kanan</strong> dari −15. Melewati titik 0, hasilnya: <strong>−15 + 25 = +10 (ribu rupiah)</strong>.',
      },
      {
        id: 'penyelam',
        badge: 'Penyelam Laut',
        icon: '🤿',
        story:
          'Seorang penyelam berada di kedalaman <strong>−5 meter</strong> (5 m di bawah permukaan). Ia menyelam <strong>4 meter lebih dalam</strong>.',
        awal: -5,
        op: '-',
        nilai: 4,
        akhir: -9,
        nlMin: -14,
        nlMax: 4,
        unit: 'meter',
        ekspresi: '−5 − 4 = −9',
        kalimat: 'Kedalaman penyelam',
        pertanyaan: 'Berapa kedalaman penyelam sekarang?',
        penjelasan:
          'Turun 4 m = bergerak <strong>4 langkah ke kiri</strong> dari −5. Hasilnya: <strong>−5 − 4 = −9 meter</strong>.',
      },
      {
        id: 'skor',
        badge: 'Skor Kuis',
        icon: '🎯',
        story:
          'Skor Nara dalam kuis interaktif saat ini <strong>8 poin</strong>. Ia menjawab 6 soal salah; setiap salah mendapat <strong>−2 poin</strong>.',
        awal: 8,
        op: '+',
        nilai: -12,
        akhir: -4,
        nlMin: -10,
        nlMax: 14,
        unit: 'poin',
        ekspresi: '8 + (−12) = −4',
        kalimat: 'Skor akhir Nara',
        pertanyaan: 'Berapa skor akhir Nara?',
        penjelasan:
          '6 soal × (−2) = −12 poin. Menambahkan bilangan negatif = bergerak <strong>12 langkah ke kiri</strong> dari 8. Melewati 0, hasilnya: <strong>8 + (−12) = −4 poin</strong>.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 3 — POLA OPERASI
     Kartu dengan contoh → klik untuk lihat aturan
     ---------------------------------------------------------- */
  polaOperasi: {
    title: 'Menemukan Pola Operasi Bilangan Bulat',
    instruction:
      'Amati contoh-contoh dalam setiap kartu, lalu temukan polanya. Klik <strong>Lihat Aturan</strong> untuk melihat penjelasannya.',
    pola: [
      {
        id: 'p1',
        warna: 'orange',
        icon: '➕',
        judul: 'Positif + Positif',
        contoh: ['3 + 5 = 8', '7 + 4 = 11', '12 + 6 = 18'],
        formula: '(+a) + (+b) = +(a+b)',
        aturan:
          'Hasilnya selalu <strong>positif</strong>. Kedua nilai positif dijumlahkan dan hasilnya lebih besar dari keduanya.',
        arah: '→ Bergerak ke kanan',
        ingatan: 'Ibaratkan menambah saldo: semakin banyak ditambah, semakin besar nilainya.',
      },
      {
        id: 'p2',
        warna: 'blue',
        icon: '➖',
        judul: 'Negatif + Negatif',
        contoh: ['(−3) + (−5) = −8', '(−7) + (−4) = −11', '(−12) + (−6) = −18'],
        formula: '(−a) + (−b) = −(a+b)',
        aturan:
          'Hasilnya selalu <strong>negatif</strong>. Nilai absolutnya dijumlahkan, tanda negatif dipertahankan.',
        arah: '← Bergerak ke kiri',
        ingatan: 'Ibaratkan bertambah hutang: makin banyak hutang, makin dalam nilainya.',
      },
      {
        id: 'p3',
        warna: 'primary',
        icon: '↔️',
        judul: 'Berbeda Tanda',
        contoh: ['5 + (−3) = 2', '(−6) + 10 = 4', '8 + (−8) = 0'],
        formula: 'a + (−b) = a − b',
        aturan:
          'Kurangkan nilai absolutnya. Tanda hasilnya mengikuti bilangan yang nilai absolutnya lebih <strong>besar</strong>.',
        arah: '← atau → tergantung nilai mana lebih besar',
        ingatan:
          'Ibaratkan "tarik-menarik" — yang lebih kuat (nilai absolut lebih besar) yang menentukan arahnya.',
      },
      {
        id: 'p4',
        warna: 'warning',
        icon: '🔄',
        judul: 'Mengurangi Bilangan Negatif',
        contoh: ['5 − (−3) = 5 + 3 = 8', '(−2) − (−7) = −2 + 7 = 5', '4 − (−4) = 4 + 4 = 8'],
        formula: 'a − (−b) = a + b',
        aturan:
          '<strong>Mengurangi bilangan negatif sama dengan menambahkan kebalikannya.</strong> Dua tanda negatif menghasilkan positif.',
        arah: '→ Selalu bergerak ke kanan',
        ingatan:
          'Ibaratkan "menghapus hutang": jika hutang dihapus, artinya saldo bertambah (bergerak ke kanan).',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 4 — LATIHAN OPERASI
     ---------------------------------------------------------- */
  latihanOperasi: {
    title: 'Latihan Operasi Bilangan Bulat',
    instruction:
      'Hitung nilai dari setiap operasi. Gunakan garis bilangan mental atau aturan pola yang sudah dipelajari.',
    soal: [
      {
        id: 'o1',
        ekspresi: '8 + (−3)',
        answer: 5,
        hint: '8 + (−3) = 8 − 3. Bergerak 3 langkah ke kiri dari 8.',
        explanation:
          '8 + (−3) = 8 − 3 = <strong>5</strong>. Menambahkan negatif = bergerak ke kiri.',
      },
      {
        id: 'o2',
        ekspresi: '−6 + 10',
        answer: 4,
        hint: 'Bergerak 10 langkah ke kanan dari −6. Kamu akan melewati titik 0.',
        explanation:
          '−6 + 10 = <strong>4</strong>. Bergerak ke kanan melewati 0, hasilnya positif.',
      },
      {
        id: 'o3',
        ekspresi: '(−4) + (−7)',
        answer: -11,
        hint: 'Keduanya negatif. Jumlahkan nilai absolutnya, tanda tetap negatif: −(4+7).',
        explanation:
          '(−4) + (−7) = −(4+7) = <strong>−11</strong>. Dua negatif dijumlahkan → semakin negatif.',
      },
      {
        id: 'o4',
        ekspresi: '5 − 9',
        answer: -4,
        hint: 'Bergerak 9 langkah ke kiri dari 5. Kamu akan melewati titik 0.',
        explanation: '5 − 9 = <strong>−4</strong>. Bergerak ke kiri melewati 0, hasilnya negatif.',
      },
      {
        id: 'o5',
        ekspresi: '(−3) − 6',
        answer: -9,
        hint: '(−3) − 6 = (−3) + (−6). Keduanya negatif, jumlahkan nilai absolutnya.',
        explanation: '(−3) − 6 = (−3) + (−6) = −(3+6) = <strong>−9</strong>.',
      },
      {
        id: 'o6',
        ekspresi: '7 − (−4)',
        answer: 11,
        hint: 'Ingat pola: a − (−b) = a + b. Jadi 7 − (−4) = 7 + 4.',
        explanation:
          '7 − (−4) = 7 + 4 = <strong>11</strong>. Mengurangi negatif = menambahkan kebalikannya.',
      },
      {
        id: 'o7',
        ekspresi: '(−8) − (−3)',
        answer: -5,
        hint: '(−8) − (−3) = −8 + 3. Bergerak 3 langkah ke kanan dari −8.',
        explanation: '(−8) − (−3) = −8 + 3 = <strong>−5</strong>.',
      },
      {
        id: 'o8',
        ekspresi: '(−5) + 5',
        answer: 0,
        hint: 'Bilangan ini adalah lawan satu sama lain. Saling menghapuskan.',
        explanation:
          '(−5) + 5 = <strong>0</strong>. Suatu bilangan ditambah lawannya selalu sama dengan 0.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MASALAH KONTEKSTUAL
     ---------------------------------------------------------- */
  masalahKontekstual: {
    title: 'Masalah Kontekstual Perubahan Nilai',
    instruction:
      'Selesaikan setiap masalah berikut. Identifikasi nilai awal, jenis perubahan, dan nilai akhirnya.',
    soal: [
      {
        id: 'm1',
        badge: 'Perubahan Suhu',
        icon: '🌡️',
        story:
          'Suhu di kota Malang pagi hari <strong>18°C</strong>. Sore hari suhu <strong>naik 5°C</strong>. Malam hari suhu <strong>turun 12°C</strong> dari suhu sore.',
        question: 'Berapa suhu di Malang pada <strong>malam hari</strong>?',
        type: 'input',
        answer: 11,
        unit: '°C',
        hint: 'Langkah 1: Suhu sore = 18 + 5 = ? Langkah 2: Suhu malam = hasil langkah 1 − 12.',
        explanation: 'Suhu sore: 18 + 5 = 23°C. Suhu malam: 23 − 12 = <strong>11°C</strong>.',
        langkah: ['18 + 5 = 23 (suhu sore)', '23 − 12 = 11 (suhu malam)'],
      },
      {
        id: 'm2',
        badge: 'Saldo Rekening',
        icon: '🏦',
        story:
          'Saldo rekening Pak Budi adalah <strong>−Rp 50.000</strong> (berhutang). Ia kemudian menerima gaji <strong>Rp 200.000</strong>.',
        question: 'Berapa saldo Pak Budi <strong>setelah menerima gaji</strong>?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: 'Rp 250.000' },
          { id: 'opt_b', label: 'Rp 150.000' },
          { id: 'opt_c', label: '−Rp 150.000' },
        ],
        correct: 'opt_b',
        hint: 'Nilai awal: −50.000. Perubahan: +200.000. Hitung −50.000 + 200.000.',
        explanation:
          '−50.000 + 200.000 = <strong>Rp 150.000</strong>. Saldo Pak Budi sekarang positif karena melebihi jumlah hutangnya.',
      },
      {
        id: 'm3',
        badge: 'Ketinggian Pesawat',
        icon: '✈️',
        story:
          'Pesawat terbang di ketinggian <strong>8.000 m</strong>. Pesawat turun <strong>3.000 m</strong> untuk persiapan mendarat, lalu naik <strong>500 m</strong> untuk menghindari awan.',
        question: 'Berapa ketinggian pesawat <strong>saat ini</strong>?',
        type: 'input',
        answer: 5500,
        unit: 'meter',
        hint: 'Langkah 1: 8.000 − 3.000 = ? Langkah 2: hasil + 500.',
        explanation: '8.000 − 3.000 = 5.000. Kemudian 5.000 + 500 = <strong>5.500 meter</strong>.',
        langkah: ['8000 − 3000 = 5000 (setelah turun)', '5000 + 500 = 5500 (setelah naik)'],
      },
      {
        id: 'm4',
        badge: 'Skor Ujian',
        icon: '📝',
        story:
          'Dalam ulangan, setiap benar <strong>+4 poin</strong>, salah <strong>−2 poin</strong>, tidak dijawab <strong>0 poin</strong>. Dea menjawab: 20 benar, 5 salah, 5 tidak dijawab.',
        question: 'Berapa <strong>total skor</strong> Dea?',
        type: 'input',
        answer: 70,
        unit: 'poin',
        hint: 'Hitung masing-masing dulu: (20×4) = ? dan (5×(−2)) = ? Lalu jumlahkan semua.',
        explanation:
          '(20×4) + (5×(−2)) + (5×0) = 80 + (−10) + 0 = 80 − 10 = <strong>70 poin</strong>.',
        langkah: [
          '20 × 4 = 80 (poin jawaban benar)',
          '5 × (−2) = −10 (poin jawaban salah)',
          '80 + (−10) + 0 = 70 (total)',
        ],
      },
      {
        id: 'm5',
        badge: 'Pendaki Gunung',
        icon: '🏔️',
        story:
          'Seorang pendaki berada di ketinggian <strong>1.200 m</strong>. Ia mendaki <strong>400 m</strong>, lalu turun <strong>600 m</strong> karena cuaca buruk.',
        question: 'Di ketinggian berapa pendaki itu <strong>sekarang</strong>?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: '2.200 m' },
          { id: 'opt_b', label: '1.000 m' },
          { id: 'opt_c', label: '600 m' },
        ],
        correct: 'opt_b',
        hint: 'Langkah 1: 1.200 + 400 = 1.600. Langkah 2: 1.600 − 600 = ?',
        explanation: '1.200 + 400 = 1.600 m. Kemudian 1.600 − 600 = <strong>1.000 m</strong>.',
      },
      {
        id: 'm6',
        badge: 'Token Listrik',
        icon: '💡',
        story:
          'Saldo token listrik Ibu Sari <strong>−5 kWh</strong> (sudah melewati batas). Ia membeli token <strong>20 kWh</strong>, lalu menggunakan listrik <strong>8 kWh</strong>.',
        question: 'Berapa <strong>sisa saldo</strong> token listrik Ibu Sari?',
        type: 'input',
        answer: 7,
        unit: 'kWh',
        hint: 'Langkah 1: −5 + 20 = ? (setelah beli). Langkah 2: hasil − 8 (setelah pakai).',
        explanation: '−5 + 20 = 15 kWh. Kemudian 15 − 8 = <strong>7 kWh</strong>.',
        langkah: ['−5 + 20 = 15 (setelah beli token)', '15 − 8 = 7 (setelah pakai listrik)'],
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 6 — TANTANGAN
     Perubahan nilai berantai (multi-langkah)
     ---------------------------------------------------------- */
  tantangan: {
    title: 'Tantangan: Perubahan Nilai Berantai',
    instruction:
      'Setiap masalah memiliki beberapa perubahan berurutan. Hitung langkah demi langkah.',
    soal: [
      {
        id: 't1',
        badge: 'Kapal Selam Riset',
        icon: '🚢',
        story:
          'Kapal selam riset memulai dari permukaan laut (<strong>0 m</strong>). Menyelam <strong>30 m</strong>, lalu naik <strong>12 m</strong> untuk mengambil sampel, kemudian menyelam lagi <strong>18 m</strong>.',
        question:
          'Di kedalaman berapa kapal selam itu <strong>sekarang</strong>? (kedalaman = bilangan negatif)',
        type: 'input',
        answer: -36,
        unit: 'meter',
        hint: 'Mulai dari 0. Menyelam 30 m: 0 − 30 = −30. Naik 12 m: −30 + 12 = −18. Menyelam 18 m: −18 − 18 = ?',
        explanation: '0 − 30 = −30 → −30 + 12 = −18 → −18 − 18 = <strong>−36 meter</strong>.',
        langkah: [
          '0 − 30 = −30 (menyelam)',
          '−30 + 12 = −18 (naik)',
          '−18 − 18 = −36 (menyelam lagi)',
        ],
      },
      {
        id: 't2',
        badge: 'Game RPG',
        icon: '🎮',
        story:
          'Skor awal Farel: <strong>250 poin</strong>. Ia mengalahkan monster (<strong>+150</strong>), membeli senjata (<strong>−80</strong>), mendapat bonus harian (<strong>+50</strong>), lalu terkena jebakan (<strong>−120</strong>).',
        question: 'Berapa <strong>skor akhir</strong> Farel?',
        type: 'input',
        answer: 250,
        unit: 'poin',
        hint: 'Hitung berurutan: 250 + 150 = 400 → 400 − 80 = 320 → 320 + 50 = 370 → 370 − 120 = ?',
        explanation: '250+150=400 → 400−80=320 → 320+50=370 → 370−120=<strong>250 poin</strong>.',
        langkah: [
          '250 + 150 = 400 (kalahkan monster)',
          '400 − 80 = 320 (beli senjata)',
          '320 + 50 = 370 (bonus harian)',
          '370 − 120 = 250 (kena jebakan)',
        ],
      },
      {
        id: 't3',
        badge: 'Harga Saham',
        icon: '📈',
        story:
          'Harga saham PT. Maju Jaya hari Senin: <strong>Rp 2.500</strong>. Selasa <strong>+Rp150</strong>, Rabu <strong>−Rp300</strong>, Kamis <strong>+Rp75</strong>, Jumat <strong>−Rp200</strong>.',
        question: 'Berapa harga saham pada hari <strong>Jumat</strong>?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: 'Rp 2.125' },
          { id: 'opt_b', label: 'Rp 2.225' },
          { id: 'opt_c', label: 'Rp 2.275' },
        ],
        correct: 'opt_b',
        hint: 'Hitung berurutan: 2500 + 150 = 2650 → 2650 − 300 = 2350 → 2350 + 75 = 2425 → 2425 − 200 = ?',
        explanation:
          '2500+150=2650 → 2650−300=2350 → 2350+75=2425 → 2425−200=<strong>Rp 2.225</strong>.',
        langkah: [
          '2500 + 150 = 2650 (Selasa)',
          '2650 − 300 = 2350 (Rabu)',
          '2350 + 75 = 2425 (Kamis)',
          '2425 − 200 = 2225 (Jumat)',
        ],
      },
      {
        id: 't4',
        badge: 'Petualang Alam',
        icon: '🧗',
        story:
          'Penjelajah memulai di ketinggian <strong>500 m</strong>. Turun ke sebuah gua <strong>200 m di bawahnya</strong>, naik kembali <strong>350 m</strong>, lalu turun ke dasar jurang <strong>400 m di bawahnya</strong>.',
        question:
          'Di ketinggian berapa (dari permukaan laut) penjelajah itu <strong>sekarang</strong>?',
        type: 'input',
        answer: 250,
        unit: 'meter (dari permukaan laut)',
        hint: 'Langkah 1: 500 − 200 = 300. Langkah 2: 300 + 350 = 650. Langkah 3: 650 − 400 = ?',
        explanation:
          '500−200=300 → 300+350=650 → 650−400=<strong>250 m</strong> di atas permukaan laut.',
        langkah: [
          '500 − 200 = 300 (turun ke gua)',
          '300 + 350 = 650 (naik)',
          '650 − 400 = 250 (turun ke jurang)',
        ],
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 7 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    title: 'Refleksi Pembelajaran',
    note: 'Refleksi ini membantu merangkum pemahamanmu. Jawaban <strong>tidak dikirim ke mana pun</strong> — hanya untuk dirimu sendiri.',
    soal: [
      {
        id: 'r1',
        question:
          'Dengan kata-katamu sendiri, jelaskan bagaimana cara menghitung <strong>penjumlahan dengan bilangan negatif</strong>. Berikan satu contoh.',
        placeholder: 'Penjelasanmu...',
      },
      {
        id: 'r2',
        question:
          'Mengapa <strong>a − (−b) = a + b</strong>? Jelaskan dengan kalimatmu sendiri atau gunakan contoh dari kehidupan nyata.',
        placeholder: 'Penjelasanmu...',
      },
      {
        id: 'r3',
        question:
          'Dari semua konteks yang kamu pelajari (suhu, saldo, ketinggian, skor), <strong>mana yang paling mudah dipahami</strong> untuk menjelaskan operasi bilangan bulat? Mengapa?',
        placeholder: 'Jawabanmu...',
      },
      {
        id: 'r4',
        question:
          'Tuliskan <strong>satu pertanyaan</strong> yang masih ingin kamu tanyakan kepada guru tentang operasi penjumlahan dan pengurangan bilangan bulat.',
        placeholder: 'Pertanyaanmu...',
      },
    ],
  },
};
