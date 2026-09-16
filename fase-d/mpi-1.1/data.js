'use strict';

/* ============================================================
   data.js — Konten pembelajaran
   Matematika: Bilangan Bulat pada Garis Bilangan
   Fase D — SMP (Kelas 7)
   ============================================================ */

var DATA = {
  meta: {
    title: 'Bilangan Bulat pada Garis Bilangan',
    subject: 'Matematika — Fase D (SMP)',
    goal: 'Saya dapat membaca, menulis, dan membandingkan urutan bilangan bulat pada garis bilangan serta menggunakannya untuk memodelkan situasi nyata.',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — KENALI BILANGAN BULAT
     ---------------------------------------------------------- */
  kenaliBulat: {
    title: 'Mengenal Bilangan Bulat',
    instruction:
      'Pilih setiap kartu untuk menemukan bagaimana bilangan bulat muncul dalam kehidupan sehari-hari. Amati pola bilangan positif, nol, dan negatif.',
    konteks: [
      {
        id: 'suhu',
        badge: 'Suhu Kota',
        icon: '🌡️',
        story:
          'Saat musim kemarau, suhu beberapa kota tercatat sebagai berikut. Perhatikan bagaimana suhu di atas 0°C ditulis dengan bilangan positif dan suhu di bawah 0°C ditulis dengan bilangan negatif.',
        items: [
          { label: 'Puncak (malam)', value: -5, note: '5 derajat di bawah nol', color: 'blue' },
          { label: 'Dieng Plateau', value: -2, note: '2 derajat di bawah nol', color: 'blue' },
          { label: 'Titik Beku Air', value: 0, note: 'Titik nol (batas)', color: 'neutral' },
          { label: 'Bandung', value: 18, note: '18 derajat di atas nol', color: 'orange' },
          { label: 'Jakarta', value: 32, note: '32 derajat di atas nol', color: 'orange' },
        ],
        unit: '°C',
        insight:
          'Makin kecil bilangan, makin dingin suhunya. Suhu −5°C lebih dingin dari −2°C, karena −5 terletak lebih jauh ke kiri pada garis bilangan.',
      },
      {
        id: 'lantai',
        badge: 'Lantai Gedung',
        icon: '🏢',
        story:
          'Sebuah pusat perbelanjaan bertingkat menggunakan bilangan bulat untuk menomori lantainya. Lantai di bawah tanah (basement) menggunakan bilangan negatif.',
        items: [
          { label: 'Basement 2 (Parkir)', value: -2, note: 'Dua lantai di bawah tanah', color: 'blue' },
          { label: 'Basement 1 (Parkir)', value: -1, note: 'Satu lantai di bawah tanah', color: 'blue' },
          { label: 'Lantai Dasar', value: 0, note: 'Pintu masuk utama', color: 'neutral' },
          { label: 'Lantai 1 (Fashion)', value: 1, note: 'Satu lantai di atas tanah', color: 'orange' },
          { label: 'Lantai 2 (Food Court)', value: 2, note: 'Dua lantai di atas tanah', color: 'orange' },
        ],
        unit: '',
        insight:
          'Lift menekan tombol −2 untuk turun ke Basement 2. Bilangan negatif menunjukkan posisi di bawah titik referensi (lantai dasar = 0).',
      },
      {
        id: 'skor',
        badge: 'Skor Kuis',
        icon: '🎮',
        story:
          'Dalam sebuah kuis berhadiah, setiap jawaban benar mendapat +10 poin, jawaban salah mendapat −5 poin, dan pertanyaan dilewati bernilai 0 poin.',
        items: [
          { label: 'Salah 2× berturut', value: -10, note: '2 jawaban salah', color: 'blue' },
          { label: 'Salah 1×', value: -5, note: '1 jawaban salah', color: 'blue' },
          { label: 'Dilewati', value: 0, note: 'Tidak ada perubahan skor', color: 'neutral' },
          { label: 'Benar 1×', value: 10, note: '1 jawaban benar', color: 'orange' },
          { label: 'Benar 3× berturut', value: 30, note: '3 jawaban benar', color: 'orange' },
        ],
        unit: 'poin',
        insight:
          'Skor −10 lebih rendah dari skor −5 dalam papan peringkat. Pemain dengan skor −5 berada di posisi yang lebih baik daripada pemain dengan skor −10.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 3 — GARIS BILANGAN
     ---------------------------------------------------------- */
  garisBilangan: {
    title: 'Membaca Garis Bilangan',
    instruction:
      'Setiap soal menampilkan sebuah titik pada garis bilangan. Ketikkan bilangan bulat yang ditunjukkan oleh titik tersebut.',
    soal: [
      {
        id: 'gb1',
        nilai: -7,
        hint: 'Hitung mundur dari nol ke kiri: −1, −2, −3, ..., sampai titik merah.',
        explanation: 'Titik itu berada 7 langkah di sebelah kiri nol, sehingga nilainya adalah −7.',
      },
      {
        id: 'gb2',
        nilai: 4,
        hint: 'Hitung maju dari nol ke kanan: 1, 2, 3, 4. Titik berada 4 langkah ke kanan.',
        explanation: 'Titik itu berada 4 langkah di sebelah kanan nol, sehingga nilainya adalah 4.',
      },
      {
        id: 'gb3',
        nilai: -3,
        hint: 'Titik berada di antara −2 dan −4, tepat di posisi −3.',
        explanation: 'Titik itu berada 3 langkah di sebelah kiri nol, sehingga nilainya adalah −3.',
      },
      {
        id: 'gb4',
        nilai: 0,
        hint: 'Titik tepat berada di tengah garis bilangan, di antara bilangan positif dan negatif.',
        explanation:
          'Titik itu tepat berada di titik nol (0) — bukan positif, bukan negatif. Nol adalah bagian dari bilangan bulat.',
      },
      {
        id: 'gb5',
        nilai: 8,
        hint: 'Hitung mulai dari nol ke kanan sampai titik merah.',
        explanation: 'Titik itu berada 8 langkah di sebelah kanan nol, sehingga nilainya adalah 8.',
      },
      {
        id: 'gb6',
        nilai: -10,
        hint: 'Titik berada di ujung kiri garis bilangan kita, tepat di −10.',
        explanation:
          'Titik itu berada 10 langkah di sebelah kiri nol. Semakin ke kiri, semakin kecil nilainya.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MEMBANDINGKAN
     ---------------------------------------------------------- */
  membandingkan: {
    title: 'Membandingkan Bilangan Bulat',
    instruction:
      'Bandingkan dua bilangan yang ditampilkan. Pilih simbol yang tepat: < (kurang dari), = (sama dengan), atau > (lebih dari).',
    soal: [
      {
        id: 'mb1',
        a: -3,
        b: 2,
        answer: '<',
        hint: 'Temukan kedua bilangan pada garis bilangan. Bilangan di sebelah kiri selalu lebih kecil.',
        explanation:
          '−3 < 2, karena −3 terletak di sebelah kiri 2 pada garis bilangan. Semua bilangan negatif lebih kecil dari bilangan positif.',
      },
      {
        id: 'mb2',
        a: -5,
        b: -1,
        answer: '<',
        hint: 'Keduanya negatif. Di antara dua bilangan negatif, bilangan yang angkanya lebih besar justru lebih kecil nilainya.',
        explanation:
          '−5 < −1, karena −5 terletak di sebelah kiri −1. Semakin jauh ke kiri garis bilangan, semakin kecil nilainya.',
      },
      {
        id: 'mb3',
        a: 0,
        b: -4,
        answer: '>',
        hint: 'Nol selalu berada di sebelah kanan bilangan negatif pada garis bilangan.',
        explanation:
          '0 > −4, karena 0 terletak di sebelah kanan −4. Nol lebih besar dari semua bilangan negatif.',
      },
      {
        id: 'mb4',
        a: -7,
        b: -7,
        answer: '=',
        hint: 'Perhatikan kedua angkanya. Apakah keduanya benar-benar sama?',
        explanation: '−7 = −7. Kedua bilangan memiliki nilai yang persis sama.',
      },
      {
        id: 'mb5',
        a: 6,
        b: -8,
        answer: '>',
        hint: 'Bilangan positif selalu lebih besar dari bilangan negatif.',
        explanation:
          '6 > −8, karena 6 terletak di sebelah kanan −8. Semua bilangan positif lebih besar dari bilangan negatif.',
      },
      {
        id: 'mb6',
        a: -2,
        b: -9,
        answer: '>',
        hint: 'Keduanya negatif. Bayangkan posisinya di garis bilangan: mana yang lebih ke kanan?',
        explanation:
          '−2 > −9, karena −2 terletak di sebelah kanan −9 pada garis bilangan. Di antara dua bilangan negatif, yang angkanya lebih kecil justru lebih besar nilainya.',
      },
      {
        id: 'mb7',
        a: 5,
        b: 5,
        answer: '=',
        hint: 'Periksa angkanya dengan teliti.',
        explanation: '5 = 5. Kedua bilangan positif ini memiliki nilai yang sama.',
      },
      {
        id: 'mb8',
        a: -1,
        b: 1,
        answer: '<',
        hint: 'Ingat: −1 berada di kiri nol, sedangkan 1 berada di kanan nol.',
        explanation:
          '−1 < 1, karena −1 terletak di sebelah kiri 1. Meskipun angkanya sama (1), tanda negatif membuatnya lebih kecil.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGURUTKAN
     ---------------------------------------------------------- */
  mengurutkan: {
    title: 'Mengurutkan Bilangan Bulat',
    instruction:
      'Urutkan bilangan-bilangan berikut dari yang terkecil ke terbesar dengan mengklik setiap angka secara berurutan.',
    soal: [
      {
        id: 'urt1',
        badge: 'Suhu Kota',
        story: 'Suhu pagi hari di lima kota pegunungan dunia (dalam °C):',
        angka: [-3, 1, -7, 4, 0],
        acak: [1, -7, 0, -3, 4],
        unit: '°C',
        hint: 'Bayangkan garis bilangan. Cari bilangan yang paling jauh di sebelah kiri (paling negatif) terlebih dahulu.',
        explanation:
          'Urutan dari terkecil ke terbesar: −7, −3, 0, 1, 4. Bilangan paling negatif = paling kecil. Semakin ke kanan garis bilangan, semakin besar nilainya.',
      },
      {
        id: 'urt2',
        badge: 'Skor Permainan',
        story: 'Skor akhir lima pemain dalam sebuah turnamen kartu:',
        angka: [-10, 5, -2, 8, -5],
        acak: [5, -10, -2, 8, -5],
        unit: 'poin',
        hint: 'Mulai dari skor yang paling buruk (paling negatif). Ingat: −10 lebih kecil dari −5.',
        explanation:
          'Urutan dari terkecil ke terbesar: −10, −5, −2, 5, 8. Pemain dengan skor tertinggi (8) menang; skor terendah (−10) kalah.',
      },
      {
        id: 'urt3',
        badge: 'Ketinggian',
        story: 'Ketinggian lima lokasi terhadap permukaan laut (dalam meter):',
        angka: [3, -4, -1, 6, -8],
        acak: [-4, 6, 3, -8, -1],
        unit: 'm',
        hint: 'Bilangan negatif = di bawah permukaan laut; bilangan positif = di atas permukaan laut. Temukan yang paling dalam dahulu.',
        explanation:
          'Urutan dari terkecil ke terbesar: −8, −4, −1, 3, 6. Nilai −8 m artinya 8 meter di bawah permukaan laut — paling rendah dari semua lokasi.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 6 — SITUASI NYATA
     ---------------------------------------------------------- */
  situasiNyata: {
    title: 'Bilangan Bulat dalam Situasi Nyata',
    instruction:
      'Gunakan pemahamanmu tentang bilangan bulat untuk menyelesaikan masalah dari situasi nyata berikut.',
    soal: [
      {
        id: 'sn1',
        badge: 'Cuaca',
        icon: '🌡️',
        story:
          'Badan Meteorologi mencatat suhu dini hari di Dieng Plateau adalah <strong>−4°C</strong>, sedangkan suhu di Bandung pada saat yang sama adalah <strong>17°C</strong>. Perbedaan suhu ini sangat terasa jika bepergian dari satu kota ke kota lain.',
        question:
          'Jika kamu mengurutkan kedua suhu dari yang terdingin ke terhangat, urutannya adalah:',
        type: 'choice',
        options: [
          { id: 'opt_a', label: '17°C, kemudian −4°C' },
          { id: 'opt_b', label: '−4°C, kemudian 17°C' },
          { id: 'opt_c', label: 'Keduanya sama karena sama-sama satu angka' },
        ],
        correct: 'opt_b',
        hint: 'Pada garis bilangan, bilangan yang lebih ke kiri adalah yang lebih dingin (lebih kecil).',
        explanation:
          '−4 < 17, sehingga −4°C lebih dingin. Urutan dari terdingin ke terhangat adalah: <strong>−4°C, kemudian 17°C</strong>. Dieng jauh lebih dingin dari Bandung.',
      },
      {
        id: 'sn2',
        badge: 'Gedung',
        icon: '🏢',
        story:
          'Rafi naik lift dari Basement 2 (lantai −2) menuju lantai parkir Basement 1 (lantai −1), lalu terus naik ke Lantai Dasar (lantai 0), dan akhirnya ke Lantai 3 untuk ke bioskop.',
        question: 'Manakah urutan lantai yang benar dari posisi terendah ke tertinggi?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: '−2, −1, 0, 3' },
          { id: 'opt_b', label: '−1, −2, 0, 3' },
          { id: 'opt_c', label: '3, 0, −1, −2' },
        ],
        correct: 'opt_a',
        hint: 'Pikirkan garis bilangan vertikal: semakin ke bawah, semakin kecil nilainya.',
        explanation:
          'Urutan dari terendah ke tertinggi: <strong>−2, −1, 0, 3</strong>. Basement 2 paling bawah (−2), kemudian Basement 1 (−1), Lantai Dasar (0), dan Lantai 3 paling atas.',
      },
      {
        id: 'sn3',
        badge: 'Keuangan',
        icon: '💳',
        story:
          'Dua teman memiliki situasi keuangan yang berbeda. Andi memiliki tabungan sebesar <strong>+Rp 250.000</strong> (saldo positif). Budi memiliki utang sebesar <strong>Rp 300.000</strong> yang diwakili dengan <strong>−300.000</strong> (saldo negatif).',
        question: 'Siapa yang kondisi keuangannya lebih baik, dan mengapa?',
        type: 'choice',
        options: [
          {
            id: 'opt_a',
            label: 'Andi, karena +250.000 > −300.000 (saldo positif lebih baik dari negatif)',
          },
          {
            id: 'opt_b',
            label: 'Budi, karena angka 300.000 lebih besar dari 250.000',
          },
          {
            id: 'opt_c',
            label: 'Sama saja karena keduanya punya uang',
          },
        ],
        correct: 'opt_a',
        hint: 'Semua bilangan positif lebih besar dari bilangan negatif, tanpa memandang angkanya.',
        explanation:
          '<strong>Andi</strong> kondisinya lebih baik. +250.000 > −300.000 karena bilangan positif selalu lebih besar dari bilangan negatif. Andi punya tabungan, sedangkan Budi punya utang.',
      },
      {
        id: 'sn4',
        badge: 'Kapal Selam',
        icon: '🌊',
        story:
          'Sebuah kapal selam berada pada kedalaman <strong>−45 meter</strong> (45 meter di bawah permukaan laut). Kapal selam lain berada pada kedalaman <strong>−80 meter</strong>.',
        question: 'Kapal selam mana yang berada lebih DEKAT ke permukaan laut?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: 'Kapal selam di −45 meter' },
          { id: 'opt_b', label: 'Kapal selam di −80 meter' },
          { id: 'opt_c', label: 'Sama saja jaraknya' },
        ],
        correct: 'opt_a',
        hint: 'Permukaan laut = 0. Mana bilangan yang lebih besar (lebih dekat ke 0): −45 atau −80?',
        explanation:
          'Kapal selam di <strong>−45 meter</strong> lebih dekat ke permukaan laut. −45 > −80, artinya −45 terletak lebih ke kanan (lebih dekat ke 0) pada garis bilangan. Semakin besar nilainya, semakin dekat ke permukaan.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 7 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    title: 'Refleksi Pembelajaran',
    note: 'Refleksi ini membantu kamu merangkum pemahamanmu hari ini. Jawaban <strong>tidak dikirim ke mana pun</strong> — hanya ditampilkan di layarmu.',
    soal: [
      {
        id: 'r1',
        question:
          'Dengan kata-katamu sendiri, jelaskan apa yang dimaksud dengan <strong>bilangan bulat negatif</strong>. Berikan satu contoh dari kehidupan sehari-hari!',
        placeholder: 'Tuliskan penjelasanmu...',
      },
      {
        id: 'r2',
        question:
          'Mengapa <strong>−5 lebih kecil dari −1</strong>? Jelaskan menggunakan konsep garis bilangan.',
        placeholder: 'Jelaskan dengan garis bilangan...',
      },
      {
        id: 'r3',
        question:
          'Ceritakan satu situasi nyata di kehidupanmu sehari-hari di mana bilangan bulat negatif digunakan, selain yang sudah dibahas dalam media ini.',
        placeholder: 'Ceritakan situasinya...',
      },
      {
        id: 'r4',
        question:
          'Bagian mana yang paling menantang bagimu dalam belajar bilangan bulat hari ini? Apa yang ingin kamu pelajari lebih lanjut?',
        placeholder: 'Tuliskan di sini...',
      },
    ],
  },
};
