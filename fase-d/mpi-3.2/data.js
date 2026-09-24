'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membandingkan & Mengurutkan Bilangan Desimal
   Fase D — SMP Kelas 7

   Tujuan Pembelajaran:
   Membandingkan dan mengurutkan beberapa bilangan desimal dengan
   tepat menggunakan nilai tempat dan garis bilangan, serta
   menjelaskan alasannya.

   Model pembelajaran: INQUIRY LEARNING (Inkuiri Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Orientasi .................. tahap 'orientasi'
     Sintaks 2 — Merumuskan masalah ......... tahap 'masalah'
     Sintaks 3 — Merumuskan hipotesis ....... tahap 'hipotesis'
     Sintaks 4 — Mengumpulkan data .......... tahap 'dataTempat' & 'dataGaris'
     Sintaks 5 — Menguji hipotesis .......... tahap 'uji'
     Sintaks 4–5 (siklus inkuiri kedua) ..... tahap 'urutkan'
     Sintaks 6 — Merumuskan kesimpulan ...... tahap 'simpulan'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas:
     1. Orientasi    — papan hasil lomba lari 100 m (12,5; 12,45;
                       12,08; 12,405 detik). Murid MENDUGA siapa juara
                       dan menduga "0,8 atau 0,75, mana lebih besar?"
                       disertai alasan (tidak dinilai).
     2. Masalah      — memilih rumusan masalah penyelidikan.
     3. Hipotesis    — memilih strategi dugaan cara membandingkan,
                       menduga lambang <, >, = empat pasangan desimal,
                       lalu menulis hipotesis dengan kalimat sendiri.
     4. Data: Tempat — tabel nilai tempat berdampingan: menentukan
                       nilai tempat pertama yang berbeda, menyamakan
                       banyak angka dengan 0 di akhir, memilih lambang
                       (umpan balik mendiagnosis miskonsepsi), lalu
                       menjawab pertanyaan temuan.
     5. Data: Garis  — menempatkan desimal pada garis bilangan 0–1 dan
                       "kaca pembesar" 0,7–0,8 serta 3,6–3,7; mengamati
                       letak bilangan yang lebih besar.
     6. Uji          — membandingkan hipotesis awal & dugaan lambang
                       dengan data, memilah pernyataan benar/salah,
                       dan membandingkan pasangan baru disertai alasan.
     7. Urutkan      — siklus inkuiri kedua: mengurutkan catatan waktu
                       (naik) dan berat paket (turun) dengan kartu
                       ketuk, dibantu tabel nilai tempat, lalu
                       menjelaskan alasan urutan.
     8. Simpulan     — menyusun kesimpulan dari bank kalimat.
     9. Uji terap    — soal kontekstual: memilih jawaban LALU memilih
                       alasan yang tepat.
    10. Refleksi     — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/ensureTapOrderState()/
   shuffleArray() dari shared/engine.js, satu kali saat state disiapkan.
   ============================================================ */

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    syntax: 'Inquiry Learning · Sintaks 1',
    goal: 'Mengamati masalah membandingkan bilangan desimal dan menduga jawabannya.',
    guru: 'Tampilkan papan hasil lomba di layar kelas. Terima semua dugaan tanpa membenarkan atau menyalahkan. Catat di papan tulis beberapa jawaban berbeda untuk teka-teki 0,8 dan 0,75 beserta alasannya, lalu jadikan perbedaan itu pertanyaan yang akan diselidiki kelas.',
    judul: 'Papan Hasil Lomba Lari 100 m',
    cerita:
      'Pada Pekan Olahraga Sekolah, empat pelari kelas 7 mencatat waktu tempuh lari 100 m dengan stopwatch digital. Pelari dengan waktu tempuh paling singkat menjadi juara.',
    pelari: [
      { id: 'andi', nama: 'Andi', waktu: '12,5', label: 'Andi (12,5 detik)' },
      { id: 'bima', nama: 'Bima', waktu: '12,45', label: 'Bima (12,45 detik)' },
      { id: 'citra', nama: 'Citra', waktu: '12,08', label: 'Citra (12,08 detik)' },
      { id: 'dimas', nama: 'Dimas', waktu: '12,405', label: 'Dimas (12,405 detik)' },
    ],
    benar: 'citra',
    pertanyaan: 'Menurut dugaanmu, siapa juara lomba lari ini?',
    tekaJudul: 'Teka-teki untuk diselidiki',
    tekaTeks:
      'Dua temanmu berdebat. Raka berkata, "0,75 lebih besar karena 75 lebih dari 8." Nia menjawab, "Bukan, 0,8 yang lebih besar!"',
    tekaPasangan: ['0,8', '0,75'],
    tekaPertanyaan: 'Menurut dugaanmu, mana yang lebih besar?',
    tekaOpsi: [
      { id: 'a', label: '0,8 lebih besar', nilai: '0,8' },
      { id: 'b', label: '0,75 lebih besar', nilai: '0,75' },
      { id: 'c', label: 'Keduanya sama besar', nilai: 'sama' },
    ],
    tekaBenar: 'a',
    alasanLabel: 'Tuliskan alasan dugaanmu:',
    alasanPlaceholder: 'Saya menduga … karena …',
    catatan:
      'Belum ada jawaban benar atau salah di tahap ini. Dugaan dan alasanmu akan kamu uji sendiri di tahap-tahap berikutnya.',
    nextLabel: 'Lanjut ke Merumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MERUMUSKAN MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: 'Inquiry Learning · Sintaks 2',
    goal: 'Merumuskan pertanyaan yang akan diselidiki.',
    guru: 'Ajak murid membedakan pertanyaan yang dapat diselidiki (mencari cara dan alasan) dengan pertanyaan yang hanya meminta satu fakta. Bila banyak yang keliru, bacakan kembali perdebatan Raka dan Nia.',
    pengantar:
      'Dugaan teman-temanmu tentang juara lomba dan teka-teki 0,8 atau 0,75 ternyata berbeda-beda. Sebelum menyelidiki, rumuskan dulu pertanyaan yang tepat.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'm1',
        label:
          'Bagaimana cara membandingkan dan mengurutkan bilangan desimal dengan tepat, dan mengapa cara itu benar?',
      },
      { id: 'm2', label: 'Berapa jumlah seluruh catatan waktu keempat pelari?' },
      { id: 'm3', label: 'Siapa pelari yang paling sering menang lomba di sekolah?' },
      { id: 'm4', label: 'Bagaimana cara membaca bilangan 12,405?' },
    ],
    correct: 'm1',
    umpan: {
      m1: '<strong>Tepat!</strong> Pertanyaan ini menuntunmu mencari <em>cara</em> sekaligus <em>alasan</em> — tepat untuk menyelesaikan perdebatan dan menentukan juara.',
      m2: 'Menjumlahkan waktu tidak membantu menentukan siapa yang tercepat. Pilih pertanyaan tentang cara membandingkan.',
      m3: 'Pertanyaan ini tidak bisa dijawab dari data lomba hari ini. Fokuslah pada bilangan desimal di papan hasil.',
      m4: 'Cara membaca sudah kamu pelajari sebelumnya. Masalah kita adalah menentukan mana yang lebih besar atau lebih kecil.',
    },
    nextLabel: 'Lanjut ke Merumuskan Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MERUMUSKAN HIPOTESIS
     ---------------------------------------------------------- */
  hipotesis: {
    kicker: 'Tahap 3 · Merumuskan Hipotesis',
    syntax: 'Inquiry Learning · Sintaks 3',
    goal: 'Mengajukan dugaan sementara tentang cara membandingkan bilangan desimal.',
    guru: 'Hipotesis tidak dinilai. Biarkan murid memilih strategi yang mereka yakini, termasuk yang keliru; strategi itu akan diuji dengan data di Tahap 6. Minta beberapa murid membacakan hipotesisnya.',
    instruksiStrategi: 'Menurutmu, bagaimana cara menentukan desimal mana yang lebih besar?',
    strategi: [
      {
        id: 's1',
        label: 'Bilangan yang punya lebih banyak angka di belakang koma adalah yang lebih besar.',
      },
      {
        id: 's2',
        label: 'Bilangan yang punya lebih sedikit angka di belakang koma adalah yang lebih besar.',
      },
      {
        id: 's3',
        label:
          'Bandingkan angka pada nilai tempat yang sama, mulai dari nilai tempat terbesar (paling kiri).',
      },
      { id: 's4', label: 'Abaikan komanya, lalu bandingkan seperti bilangan bulat.' },
    ],
    strategiBenar: 's3',
    tanggapan: {
      s1: 'Data menunjukkan 0,8 > 0,75 dan 3,7 > 3,68, padahal 0,8 dan 3,7 punya lebih sedikit angka di belakang koma. Hipotesis ini perlu direvisi.',
      s2: 'Data menunjukkan 0,45 > 0,4 padahal 0,45 punya lebih banyak angka di belakang koma, dan 0,5 = 0,50 walaupun banyak angkanya berbeda. Hipotesis ini perlu direvisi.',
      s3: 'Hipotesismu didukung data: setiap pasangan dapat dibandingkan dengan tepat melalui nilai tempat, dan hasilnya cocok dengan letaknya pada garis bilangan.',
      s4: 'Mengabaikan koma membuat 0,8 dibaca 8 dan 0,75 dibaca 75, padahal data menunjukkan 0,8 > 0,75. Hipotesis ini perlu direvisi.',
    },
    instruksiDugaan: 'Duga lambang yang tepat untuk setiap pasangan (boleh diubah):',
    dugaan: [
      { id: 'd1', a: '0,8', b: '0,75' },
      { id: 'd2', a: '3,7', b: '3,68' },
      { id: 'd3', a: '0,5', b: '0,50' },
      { id: 'd4', a: '2,09', b: '2,1' },
    ],
    hipotesisLabel: 'Tuliskan hipotesismu dengan kalimatmu sendiri:',
    hipotesisPlaceholder: 'Menurut saya, untuk membandingkan dua bilangan desimal …',
    nextLabel: 'Mulai Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MENGUMPULKAN DATA: NILAI TEMPAT
     ---------------------------------------------------------- */
  dataTempat: {
    kicker: 'Tahap 4 · Mengumpulkan Data (Nilai Tempat)',
    syntax: 'Inquiry Learning · Sintaks 4',
    goal: 'Mengumpulkan data perbandingan desimal dengan tabel nilai tempat.',
    guru: 'Minta murid menunjuk kolom tabel dari kiri ke kanan sambil menyebut angkanya. Tekankan bahwa angka 0 tambahan (tampak miring) tidak mengubah nilai, hanya membantu menyamakan banyak angka. Gunakan umpan balik miskonsepsi sebagai bahan diskusi kelas.',
    instruksi:
      'Selidiki setiap pasangan. Bandingkan angka-angka pada kolom nilai tempat yang sama, mulai dari kolom paling kiri.',
    pasangan: [
      { id: 'p1', a: '0,8', b: '0,75' },
      { id: 'p2', a: '3,7', b: '3,68' },
      { id: 'p3', a: '2,09', b: '2,1' },
      { id: 'p4', a: '4,52', b: '4,58' },
      { id: 'p5', a: '0,5', b: '0,50' },
    ],
    tanyaTempat: 'Pada nilai tempat mana angka kedua bilangan PERTAMA KALI berbeda?',
    opsiTempat: [
      { id: '0', label: 'Satuan' },
      { id: '1', label: 'Persepuluhan' },
      { id: '2', label: 'Perseratusan' },
      { id: 'none', label: 'Tidak ada — semua angkanya sama' },
    ],
    tanyaLambang: 'Pilih lambang yang tepat:',
    petunjukPad:
      'Angka 0 bercetak miring ditambahkan di ujung kanan agar banyak angka di belakang koma sama. Nilainya tidak berubah.',
    temuanJudul: 'Apa yang kamu temukan?',
    temuan: [
      {
        id: 't1',
        tanya:
          'Saat membandingkan dua bilangan desimal, nilai tempat mana yang diperiksa lebih dulu?',
        opsi: [
          { id: 'a', label: 'Nilai tempat terbesar (paling kiri), lalu bergeser ke kanan' },
          { id: 'b', label: 'Angka paling kanan lebih dulu' },
          { id: 'c', label: 'Hitung dulu banyak angka di belakang koma' },
        ],
        correct: 'a',
        umpan: {
          a: '<strong>Tepat.</strong> Nilai tempat di kiri bernilai lebih besar, jadi perbedaan di kiri yang menentukan.',
          b: 'Angka paling kanan bernilai paling kecil. Lihat lagi kolom mana yang disorot pada tabelmu.',
          c: 'Pada pasangan 0,8 dan 0,75, bilangan dengan angka lebih sedikit justru lebih besar. Banyak angka tidak menentukan.',
        },
      },
      {
        id: 't2',
        tanya: 'Menambahkan angka 0 di ujung kanan bagian desimal (0,8 → 0,80) …',
        opsi: [
          { id: 'a', label: 'tidak mengubah nilai bilangan' },
          { id: 'b', label: 'membuat bilangan 10 kali lebih besar' },
          { id: 'c', label: 'membuat bilangan lebih kecil' },
        ],
        correct: 'a',
        umpan: {
          a: '<strong>Tepat.</strong> 8 persepuluh = 80 perseratus, jadi 0,8 = 0,80. Pasangan 0,5 dan 0,50 juga membuktikannya.',
          b: 'Perhatikan pasangan 0,5 dan 0,50: semua angka pada setiap nilai tempat sama. Apakah nilainya berubah?',
          c: 'Angka 0 di ujung kanan tidak mengurangi nilai tempat mana pun. Periksa lagi pasangan 0,5 dan 0,50.',
        },
      },
      {
        id: 't3',
        tanya: 'Apakah banyaknya angka di belakang koma menentukan bilangan mana yang lebih besar?',
        opsi: [
          {
            id: 'a',
            label: 'Tidak. Yang menentukan adalah angka pada nilai tempat pertama yang berbeda.',
          },
          { id: 'b', label: 'Ya, makin banyak angka di belakang koma makin besar.' },
          { id: 'c', label: 'Ya, makin sedikit angka di belakang koma makin besar.' },
        ],
        correct: 'a',
        umpan: {
          a: '<strong>Tepat.</strong> 0,8 > 0,75 (lebih sedikit angka), tetapi 4,58 > 4,52 (sama banyak) dan 2,1 > 2,09 — yang menentukan adalah nilai tempat.',
          b: 'Bukti tandingan: 0,8 > 0,75 padahal 0,75 punya lebih banyak angka.',
          c: 'Bukti tandingan: 0,45 > 0,4 padahal 0,45 punya lebih banyak angka. Dan 0,5 = 0,50.',
        },
      },
    ],
    nextLabel: 'Lanjut ke Data Garis Bilangan →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGUMPULKAN DATA: GARIS BILANGAN
     ---------------------------------------------------------- */
  dataGaris: {
    kicker: 'Tahap 5 · Mengumpulkan Data (Garis Bilangan)',
    syntax: 'Inquiry Learning · Sintaks 4',
    goal: 'Mengumpulkan data letak bilangan desimal pada garis bilangan.',
    guru: 'Jelaskan bahwa "kaca pembesar" membagi ruas 0,7–0,8 menjadi 10 bagian sama besar, masing-masing 0,01. Minta murid menghitung garis kecil dengan jari sebelum mengetuk. Setelah selesai, tanyakan: bilangan mana yang lebih kanan, dan apa artinya?',
    instruksi:
      'Ketuk letak setiap bilangan pada garis bilangan. Perhatikan jarak setiap garis kecil.',
    garis: [
      {
        id: 'g1',
        judul: 'Garis bilangan 0 sampai 1 — setiap garis kecil bernilai 0,1',
        min: '0',
        max: '1',
        digits: 1,
        items: [
          { id: 'a', value: '0,3' },
          { id: 'b', value: '0,8' },
          { id: 'c', value: '0,50' },
        ],
        selesai:
          '<strong>Semua tepat!</strong> Perhatikan: 0,50 menempati titik yang sama dengan 0,5. Ruas bersorot kuning (0,7 sampai 0,8) akan kita perbesar.',
        zoom: { from: '0,7', to: '0,8' },
      },
      {
        id: 'g2',
        judul: 'Kaca pembesar: 0,7 sampai 0,8 — setiap garis kecil bernilai 0,01',
        min: '0,7',
        max: '0,8',
        digits: 2,
        fixedLabels: true,
        items: [
          { id: 'a', value: '0,75' },
          { id: 'b', value: '0,72' },
          { id: 'c', value: '0,8' },
          { id: 'd', value: '0,79' },
        ],
        selesai:
          '<strong>Semua tepat!</strong> 0,8 (= 0,80) berada di ujung kanan, di sebelah kanan 0,75.',
      },
      {
        id: 'g3',
        judul: 'Kaca pembesar: 3,6 sampai 3,7 — setiap garis kecil bernilai 0,01',
        min: '3,6',
        max: '3,7',
        digits: 2,
        fixedLabels: true,
        items: [
          { id: 'a', value: '3,68' },
          { id: 'b', value: '3,7' },
          { id: 'c', value: '3,65' },
        ],
        selesai: '<strong>Semua tepat!</strong> 3,7 (= 3,70) berada di sebelah kanan 3,68.',
      },
    ],
    amatiJudul: 'Amati garis bilanganmu',
    amati: [
      {
        id: 'a1',
        tanya: 'Pada garis bilangan, di mana letak bilangan yang lebih besar?',
        opsi: [
          { id: 'a', label: 'Di sebelah kanan bilangan yang lebih kecil' },
          { id: 'b', label: 'Di sebelah kiri bilangan yang lebih kecil' },
          { id: 'c', label: 'Tergantung banyaknya angka di belakang koma' },
        ],
        correct: 'a',
        umpan: {
          a: '<strong>Tepat.</strong> Makin ke kanan, makin besar nilainya.',
          b: 'Lihat garis 0 sampai 1: 0,8 berada di sebelah mana dari 0,3?',
          c: 'Letak ditentukan oleh nilai, bukan banyak angka. Lihat 0,50 dan 0,5.',
        },
      },
      {
        id: 'a2',
        tanya: 'Bagaimana letak 0,50 dibandingkan dengan 0,5?',
        opsi: [
          { id: 'a', label: 'Di titik yang sama, jadi 0,5 = 0,50' },
          { id: 'b', label: 'Di sebelah kanan 0,5' },
          { id: 'c', label: 'Di sebelah kiri 0,5' },
        ],
        correct: 'a',
        umpan: {
          a: '<strong>Tepat.</strong> Dua bilangan di titik yang sama nilainya sama.',
          b: 'Lihat lagi garis pertama: titik mana yang kamu ketuk untuk 0,50?',
          c: 'Lihat lagi garis pertama: titik mana yang kamu ketuk untuk 0,50?',
        },
      },
      {
        id: 'a3',
        tanya: 'Menurut garis kaca pembesar, pernyataan mana yang benar?',
        opsi: [
          { id: 'a', label: '0,8 > 0,75 karena 0,8 (= 0,80) terletak di sebelah kanan 0,75' },
          { id: 'b', label: '0,75 > 0,8 karena 75 lebih dari 8' },
          { id: 'c', label: '0,8 = 0,75 karena keduanya berada di antara 0,7 dan 0,8' },
        ],
        correct: 'a',
        umpan: {
          a: '<strong>Tepat.</strong> Teka-teki di Tahap 1 terjawab dengan bukti garis bilangan.',
          b: 'Pada garis kaca pembesar, 0,75 ada di tengah sedangkan 0,8 di ujung kanan. Mana yang lebih kanan?',
          c: 'Keduanya tidak di titik yang sama: 0,75 di tengah, 0,8 di ujung kanan.',
        },
      },
      {
        id: 'a4',
        tanya: 'Antara 3,68 dan 3,7, mana yang terletak lebih kanan?',
        opsi: [
          { id: 'a', label: '3,7' },
          { id: 'b', label: '3,68' },
          { id: 'c', label: 'Keduanya di titik yang sama' },
        ],
        correct: 'a',
        umpan: {
          a: '<strong>Tepat.</strong> 3,7 = 3,70, dua garis kecil di sebelah kanan 3,68. Jadi 3,7 > 3,68.',
          b: '3,68 berada 8 garis kecil dari 3,6, sedangkan 3,7 berada di ujung kanan (10 garis kecil).',
          c: 'Lihat garis ketiga: 3,68 dan 3,7 ditandai di titik yang berbeda.',
        },
      },
    ],
    nextLabel: 'Lanjut ke Menguji Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGUJI HIPOTESIS
     ---------------------------------------------------------- */
  uji: {
    kicker: 'Tahap 6 · Menguji Hipotesis',
    syntax: 'Inquiry Learning · Sintaks 5',
    goal: 'Menguji hipotesis dengan data dan menanggapi miskonsepsi.',
    guru: 'Beri waktu murid membandingkan hipotesisnya dengan data. Murid yang hipotesisnya belum tepat justru mendapat pengalaman penting: merevisi dugaan berdasarkan bukti. Diskusikan pernyataan yang paling banyak dijawab keliru.',
    hipotesisLabel: 'Strategi yang kamu pilih di Tahap 3',
    dugaanLabel: 'Dugaan lambangmu',
    dataLabel: 'Hasil data',
    instruksiPilah: 'Tentukan apakah setiap pernyataan benar atau salah:',
    opsiPilah: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pilah: [
      {
        id: 'q1',
        teks: '0,75 > 0,8 karena 75 lebih dari 8.',
        correct: 'salah',
        explanation:
          'Bandingkan persepuluhan: 7 < 8, jadi 0,75 < 0,8. Angka di belakang koma tidak dibaca sebagai bilangan bulat.',
      },
      {
        id: 'q2',
        teks: '0,5 = 0,50 = 0,500',
        correct: 'benar',
        explanation: 'Angka 0 di ujung kanan bagian desimal tidak mengubah nilai.',
      },
      {
        id: 'q3',
        teks: 'Semakin banyak angka di belakang koma, semakin besar bilangannya.',
        correct: 'salah',
        explanation: 'Contoh tandingan: 0,8 > 0,75 dan 3,7 > 3,68.',
      },
      {
        id: 'q4',
        teks: 'Semakin ke kanan letak bilangan pada garis bilangan, semakin besar nilainya.',
        correct: 'benar',
        explanation: 'Itulah yang kamu amati pada garis 0–1 dan kaca pembesar.',
      },
      {
        id: 'q5',
        teks: '2,1 > 2,09 karena angka persepuluhan 1 > 0.',
        correct: 'benar',
        explanation: 'Satuan sama (2); persepuluhan 1 > 0, jadi 2,1 > 2,09.',
      },
      {
        id: 'q6',
        teks: '0,4 > 0,45 karena 0,4 hanya punya persepuluhan.',
        correct: 'salah',
        explanation: '0,4 = 0,40. Persepuluhan sama (4); perseratusan 0 < 5, jadi 0,4 < 0,45.',
      },
    ],
    instruksiBanding:
      'Uji strategimu pada pasangan baru. Pilih lambang yang tepat; kamu boleh mencoba lagi.',
    banding: [
      { id: 'b1', a: '12,5', b: '12,45' },
      { id: 'b2', a: '6,03', b: '6,3' },
      { id: 'b3', a: '1,250', b: '1,25' },
      { id: 'b4', a: '10,1', b: '9,99' },
      { id: 'b5', a: '0,09', b: '0,1' },
    ],
    nextLabel: 'Lanjut ke Siklus Kedua: Mengurutkan →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENGURUTKAN (siklus inkuiri kedua)
     ---------------------------------------------------------- */
  urutkan: {
    kicker: 'Tahap 7 · Mengurutkan (Siklus Inkuiri Kedua)',
    syntax: 'Inquiry Learning · Sintaks 4–5',
    goal: 'Menerapkan temuan untuk mengurutkan beberapa bilangan desimal dan menjelaskan alasannya.',
    guru: 'Tantang murid: apakah strategi membandingkan dua bilangan berlaku untuk empat atau lima bilangan sekaligus? Sarankan membuka tabel nilai tempat hanya bila perlu, atau membayangkan letak setiap bilangan pada garis bilangan. Minta murid menjelaskan urutannya secara lisan kepada teman sebangku.',
    pengantar:
      'Pertanyaan baru: bisakah caramu membandingkan dua desimal dipakai untuk mengurutkan banyak desimal sekaligus? Selidiki dengan dua papan berikut.',
    tabelLabel: 'Lihat tabel nilai tempat',
    papan: [
      {
        id: 'u1',
        judul: 'Urutkan catatan waktu pelari dari yang TERKECIL (tercepat)',
        arah: 'naik',
        satuan: 'detik',
        bilangan: [
          { id: 'andi', value: '12,5', nama: 'Andi' },
          { id: 'bima', value: '12,45', nama: 'Bima' },
          { id: 'citra', value: '12,08', nama: 'Citra' },
          { id: 'dimas', value: '12,405', nama: 'Dimas' },
        ],
      },
      {
        id: 'u2',
        judul: 'Urutkan berat paket dari yang TERBERAT',
        arah: 'turun',
        satuan: 'kg',
        bilangan: [
          { id: 'k1', value: '2,3' },
          { id: 'k2', value: '2,03' },
          { id: 'k3', value: '2,33' },
          { id: 'k4', value: '2,303' },
          { id: 'k5', value: '2,033' },
        ],
      },
    ],
    tanyaJudul: 'Jelaskan urutanmu',
    tanya: [
      {
        id: 'r1',
        tanya: 'Jadi, siapa juara lomba lari di Tahap 1?',
        opsi: [
          { id: 'citra', label: 'Citra (12,08 detik)' },
          { id: 'andi', label: 'Andi (12,5 detik)' },
          { id: 'dimas', label: 'Dimas (12,405 detik)' },
          { id: 'bima', label: 'Bima (12,45 detik)' },
        ],
        correct: 'citra',
        umpan: {
          citra:
            '<strong>Tepat.</strong> 12,08 adalah waktu terkecil: satuan sama, persepuluhan 0 paling kecil. Bandingkan dengan dugaanmu di Tahap 1!',
          andi: '12,5 justru waktu terbesar (paling lambat). Juara adalah waktu terkecil.',
          dimas:
            '12,405 memang punya angka terbanyak, tetapi persepuluhannya 4 — lebih besar daripada persepuluhan 12,08.',
          bima: 'Persepuluhan 12,45 adalah 4, sedangkan 12,08 punya persepuluhan 0. Mana yang lebih kecil?',
        },
      },
      {
        id: 'r2',
        tanya: 'Mengapa 12,405 < 12,45?',
        opsi: [
          { id: 'a', label: 'Satuan & persepuluhan sama; angka perseratusan 0 < 5' },
          { id: 'b', label: 'Karena 12,405 punya lebih banyak angka di belakang koma' },
          { id: 'c', label: 'Karena angka perseribuan 12,405 adalah 5' },
        ],
        correct: 'a',
        umpan: {
          a: '<strong>Tepat.</strong> Tulis 12,45 sebagai 12,450: perbedaan pertama ada di perseratusan (0 < 5).',
          b: 'Banyak angka tidak menentukan. Cari nilai tempat pertama yang berbeda.',
          c: 'Perbedaan sudah muncul sebelum perseribuan. Periksa kolom perseratusan.',
        },
      },
      {
        id: 'r3',
        tanya: 'Mengapa 2,33 kg adalah paket terberat?',
        opsi: [
          {
            id: 'a',
            label:
              'Persepuluhan 3 dimiliki 2,3; 2,33; 2,303 — di antara ketiganya, perseratusan 2,33 paling besar (3)',
          },
          { id: 'b', label: 'Karena 2,303 punya angka perseribuan, jadi 2,33 kalah' },
          { id: 'c', label: 'Karena 33 adalah bilangan terbesar di belakang koma' },
        ],
        correct: 'a',
        umpan: {
          a: '<strong>Tepat.</strong> Bandingkan bertahap: satuan → persepuluhan → perseratusan.',
          b: 'Perbedaan antara 2,33 dan 2,303 sudah muncul di perseratusan (3 > 0), sebelum perseribuan.',
          c: 'Angka di belakang koma tidak dibaca sebagai bilangan bulat — 2,303 punya "303" tetapi lebih ringan.',
        },
      },
    ],
    nextLabel: 'Lanjut ke Merumuskan Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — MERUMUSKAN KESIMPULAN
     ---------------------------------------------------------- */
  simpulan: {
    kicker: 'Tahap 8 · Merumuskan Kesimpulan',
    syntax: 'Inquiry Learning · Sintaks 6',
    goal: 'Merumuskan kesimpulan cara membandingkan dan mengurutkan bilangan desimal.',
    guru: 'Setelah kesimpulan lengkap, minta murid membandingkannya dengan hipotesis di Tahap 3 dan menjawab rumusan masalah di Tahap 2 secara lisan.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari hasil penyelidikanmu. Setiap potongan hanya dipakai sekali.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      {
        id: 'k1',
        awal: 'Untuk membandingkan dua bilangan desimal, bandingkan angka pada nilai tempat yang sama',
        correct: 'b1',
      },
      {
        id: 'k2',
        awal: 'Angka 0 boleh ditambahkan di ujung kanan bagian desimal (0,8 = 0,80) karena',
        correct: 'b2',
      },
      { id: 'k3', awal: 'Banyaknya angka di belakang koma', correct: 'b3' },
      {
        id: 'k4',
        awal: 'Pada garis bilangan, bilangan desimal yang lebih besar terletak',
        correct: 'b4',
      },
      {
        id: 'k5',
        awal: 'Untuk mengurutkan beberapa bilangan desimal dari yang terkecil,',
        correct: 'b5',
      },
    ],
    bank: [
      {
        id: 'b1',
        teks: 'mulai dari nilai tempat terbesar (paling kiri) sampai menemukan angka yang berbeda.',
      },
      {
        id: 'b2',
        teks: 'nilainya tidak berubah, sehingga banyak angka di belakang koma dapat disamakan.',
      },
      { id: 'b3', teks: 'tidak menentukan besar kecilnya bilangan desimal.' },
      { id: 'b4', teks: 'di sebelah kanan bilangan yang lebih kecil.' },
      {
        id: 'b5',
        teks: 'bandingkan dengan nilai tempat, lalu susun dari yang letaknya paling kiri pada garis bilangan.',
      },
      { id: 'b6', teks: 'bilangan dengan angka terbanyak selalu yang terbesar.' },
      { id: 'b7', teks: 'di sebelah kiri bilangan yang lebih kecil.' },
      { id: 'b8', teks: 'mulai dari angka paling kanan karena angka itu paling menentukan.' },
    ],
    rangkuman: [
      'Bandingkan angka pada nilai tempat yang sama, <strong>mulai dari yang paling kiri</strong>. Nilai tempat pertama yang berbeda menentukan hasilnya: 0,<strong>8</strong> &gt; 0,<strong>7</strong>5.',
      'Samakan banyak angka di belakang koma dengan <strong>menambah 0 di ujung kanan</strong>: 0,8 = 0,80, jadi 0,80 &gt; 0,75.',
      '<strong>Banyak angka bukan penentu</strong>: 0,8 &gt; 0,75, tetapi 0,45 &gt; 0,4.',
      'Pada garis bilangan, bilangan yang <strong>lebih kanan lebih besar</strong>.',
      'Mengurutkan = membandingkan berulang kali. Urutan naik: 12,08 &lt; 12,405 &lt; 12,45 &lt; 12,5.',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — UJI TERAP
     Setiap soal: pilih jawaban, lalu pilih ALASAN yang tepat.
     `cek` dipakai tes (tests/mpi-3.2-data.test.js) untuk memastikan
     kunci jawaban cocok dengan perbandingan desimal:
       maks/min  — opsi.nilai terbesar/terkecil
       naik/turun — hanya opsi benar yang `urutan`-nya terurut
       banding   — opsi.sym benar = lambang a ☐ b
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 9 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan cara membandingkan dan mengurutkan desimal dalam masalah sehari-hari serta menjelaskan alasannya.',
    guru: 'Soal dikerjakan mandiri. Perhatikan murid yang memilih jawaban benar tetapi alasan keliru — itu tanda strategi yang belum mantap. Tanyakan alasan mereka secara lisan.',
    instruksi:
      'Pilih jawaban yang tepat, lalu pilih alasan yang paling tepat. Kamu boleh mencoba lagi bila keliru.',
    tanyaAlasan: 'Alasan yang paling tepat:',
    soal: [
      {
        id: 's1',
        konteks: '🌧️ Curah hujan',
        cerita:
          'Stasiun cuaca mencatat curah hujan harian: Senin 12,5 mm, Selasa 12,75 mm, Rabu 12,09 mm, Kamis 12,7 mm.',
        pertanyaan: 'Hari apa curah hujannya paling tinggi?',
        cek: { tipe: 'maks' },
        opsi: [
          { id: 'sen', label: 'Senin (12,5 mm)', nilai: '12,5' },
          { id: 'sel', label: 'Selasa (12,75 mm)', nilai: '12,75' },
          { id: 'rab', label: 'Rabu (12,09 mm)', nilai: '12,09' },
          { id: 'kam', label: 'Kamis (12,7 mm)', nilai: '12,7' },
        ],
        benar: 'sel',
        alasanOpsi: [
          {
            id: 'a',
            label:
              'Bagian bulat sama (12). Persepuluhan terbesar 7 (12,75 dan 12,7), lalu perseratusan 5 > 0.',
          },
          { id: 'b', label: 'Karena 75 lebih besar daripada 5, 9, dan 7.' },
          { id: 'c', label: 'Karena 12,75 punya angka paling banyak di belakang koma.' },
        ],
        alasanBenar: 'a',
      },
      {
        id: 's2',
        konteks: '🏊 Lomba renang',
        cerita:
          'Catatan waktu renang gaya bebas 50 m: Gita 32,4 detik, Hana 32,38 detik, Intan 32,43 detik, Joko 32,395 detik.',
        pertanyaan: 'Siapa perenang tercepat?',
        cek: { tipe: 'min' },
        opsi: [
          { id: 'gita', label: 'Gita (32,4 detik)', nilai: '32,4' },
          { id: 'hana', label: 'Hana (32,38 detik)', nilai: '32,38' },
          { id: 'intan', label: 'Intan (32,43 detik)', nilai: '32,43' },
          { id: 'joko', label: 'Joko (32,395 detik)', nilai: '32,395' },
        ],
        benar: 'hana',
        alasanOpsi: [
          {
            id: 'a',
            label:
              'Tercepat = waktu terkecil. Persepuluhan 3 dimiliki 32,38 dan 32,395; perseratusan 8 < 9.',
          },
          { id: 'b', label: 'Tercepat = waktu dengan angka paling sedikit di belakang koma.' },
          { id: 'c', label: 'Tercepat = waktu dengan angka paling banyak di belakang koma.' },
        ],
        alasanBenar: 'a',
      },
      {
        id: 's3',
        konteks: '📏 Tinggi badan',
        cerita: 'Tinggi badan empat murid: Dina 1,5 m, Eko 1,48 m, Fajar 1,505 m, Gilang 1,45 m.',
        pertanyaan: 'Urutan tinggi badan dari yang terpendek adalah …',
        cek: { tipe: 'naik' },
        opsi: [
          {
            id: 'o1',
            label: '1,45 m; 1,48 m; 1,5 m; 1,505 m',
            urutan: ['1,45', '1,48', '1,5', '1,505'],
          },
          {
            id: 'o2',
            label: '1,5 m; 1,45 m; 1,48 m; 1,505 m',
            urutan: ['1,5', '1,45', '1,48', '1,505'],
          },
          {
            id: 'o3',
            label: '1,45 m; 1,48 m; 1,505 m; 1,5 m',
            urutan: ['1,45', '1,48', '1,505', '1,5'],
          },
          {
            id: 'o4',
            label: '1,5 m; 1,505 m; 1,45 m; 1,48 m',
            urutan: ['1,5', '1,505', '1,45', '1,48'],
          },
        ],
        benar: 'o1',
        alasanOpsi: [
          {
            id: 'a',
            label:
              'Satuan semua 1. Persepuluhan 4 lebih kecil dari 5; lalu 1,45 < 1,48 dan 1,5 (= 1,500) < 1,505.',
          },
          { id: 'b', label: 'Urutkan dari bilangan yang angkanya paling sedikit.' },
          { id: 'c', label: '1,505 paling tinggi karena 505 bilangan terbesar.' },
        ],
        alasanBenar: 'a',
      },
      {
        id: 's4',
        konteks: '🍊 Berat buah',
        cerita:
          'Di timbangan digital, berat buah tertulis: apel 0,25 kg, jeruk 0,3 kg, pir 0,275 kg, mangga 0,209 kg.',
        pertanyaan: 'Buah mana yang paling berat?',
        cek: { tipe: 'maks' },
        opsi: [
          { id: 'apel', label: 'Apel (0,25 kg)', nilai: '0,25' },
          { id: 'jeruk', label: 'Jeruk (0,3 kg)', nilai: '0,3' },
          { id: 'pir', label: 'Pir (0,275 kg)', nilai: '0,275' },
          { id: 'mangga', label: 'Mangga (0,209 kg)', nilai: '0,209' },
        ],
        benar: 'jeruk',
        alasanOpsi: [
          {
            id: 'a',
            label:
              'Tulis dengan tiga angka: 0,250; 0,300; 0,275; 0,209. Persepuluhan 3 paling besar.',
          },
          { id: 'b', label: 'Karena 275 adalah bilangan terbesar di belakang koma.' },
          { id: 'c', label: 'Karena 0,209 memuat angka 9, angka terbesar.' },
        ],
        alasanBenar: 'a',
      },
      {
        id: 's5',
        konteks: '🎀 Panjang pita',
        cerita:
          'Pita Rina panjangnya 1,2 m dan pita Sari 1,15 m. Sari berkata, "Pitaku lebih panjang karena 15 lebih dari 2."',
        pertanyaan: 'Perbandingan yang benar adalah …',
        cek: { tipe: 'banding', a: '1,2', b: '1,15' },
        opsi: [
          { id: 'gt', label: '1,2 > 1,15 — pita Rina lebih panjang', sym: 'gt' },
          { id: 'lt', label: '1,2 < 1,15 — pita Sari lebih panjang', sym: 'lt' },
          { id: 'eq', label: '1,2 = 1,15 — sama panjang', sym: 'eq' },
        ],
        benar: 'gt',
        alasanOpsi: [
          {
            id: 'a',
            label:
              '1,2 = 1,20. Persepuluhan 2 > 1, jadi 1,2 > 1,15. Sari keliru membaca bagian desimal seperti bilangan bulat.',
          },
          { id: 'b', label: 'Sari benar karena 15 lebih dari 2.' },
          { id: 'c', label: 'Sama panjang karena satuannya sama-sama 1.' },
        ],
        alasanBenar: 'a',
      },
      {
        id: 's6',
        konteks: '📍 Garis bilangan',
        cerita: 'Empat titik ditandai pada garis bilangan: 5,06; 5,6; 5,066; 5,006.',
        pertanyaan: 'Titik mana yang terletak paling kanan?',
        cek: { tipe: 'maks' },
        opsi: [
          { id: 'a', label: '5,06', nilai: '5,06' },
          { id: 'b', label: '5,6', nilai: '5,6' },
          { id: 'c', label: '5,066', nilai: '5,066' },
          { id: 'd', label: '5,006', nilai: '5,006' },
        ],
        benar: 'b',
        alasanOpsi: [
          {
            id: 'a',
            label:
              'Paling kanan = paling besar. Hanya 5,6 yang persepuluhannya 6; yang lain persepuluhannya 0.',
          },
          { id: 'b', label: 'Paling kanan adalah bilangan dengan angka 6 paling banyak.' },
          { id: 'c', label: 'Paling kanan adalah bilangan dengan angka paling banyak.' },
        ],
        alasanBenar: 'a',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 10 · Refleksi',
    syntax: 'Refleksi',
    goal: 'Menyadari proses penyelidikan yang sudah dilakukan dan kemampuan diri.',
    guru: 'Bacalah jawaban refleksi untuk menemukan murid yang masih memegang miskonsepsi "lebih banyak angka lebih besar". Berikan pendampingan dengan tabel nilai tempat dan garis bilangan.',
    pertanyaan: [
      {
        id: 'f1',
        teks: 'Bandingkan hipotesismu di Tahap 3 dengan hasil pengujian di Tahap 6. Apa yang kamu revisi, dan data apa yang membuatmu yakin?',
        placeholder: 'Awalnya saya menduga … ternyata data menunjukkan …',
      },
      {
        id: 'f2',
        teks: 'Jelaskan kepada Raka (Tahap 1) mengapa 0,8 lebih besar daripada 0,75.',
        placeholder: 'Raka, coba lihat nilai tempat …',
      },
      {
        id: 'f3',
        teks: 'Tuliskan satu contoh sehari-hari yang memerlukan mengurutkan bilangan desimal, lalu urutkan.',
        placeholder: 'Contoh: harga …, berat …, waktu …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat membandingkan dan mengurutkan bilangan desimal sekarang?',
    diriOpsi: [
      { id: 'd1', label: 'Sangat yakin, saya bisa menjelaskan alasannya ke teman' },
      { id: 'd2', label: 'Cukup yakin, sesekali masih perlu tabel nilai tempat' },
      { id: 'd3', label: 'Belum yakin, saya ingin berlatih lagi' },
    ],
    nextLabel: 'Selesaikan Pembelajaran →',
  },

  /* ----------------------------------------------------------
     TAHAP 11 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Penyelidikanmu tuntas!',
    teks: 'Kamu telah menempuh seluruh langkah inkuiri: mengamati masalah, merumuskan pertanyaan, membuat hipotesis, mengumpulkan data, mengujinya, sampai merumuskan kesimpulan sendiri.',
    capaian: [
      'Membandingkan dua bilangan desimal dengan nilai tempat, mulai dari nilai tempat terbesar.',
      'Menyamakan banyak angka di belakang koma dengan menambahkan angka 0 tanpa mengubah nilai.',
      'Menempatkan bilangan desimal pada garis bilangan dan menggunakannya sebagai bukti perbandingan.',
      'Mengurutkan beberapa bilangan desimal dan menjelaskan alasannya.',
    ],
  },
};
