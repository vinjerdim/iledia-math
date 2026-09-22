'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Konsep Rasio & Menyederhanakan Perbandingan
   Fase D — SMP Kelas 7

   Tujuan Pembelajaran:
   Menjelaskan konsep rasio serta menyederhanakan perbandingan dua
   besaran sejenis dan berbeda satuan dalam masalah kontekstual
   sehari-hari dengan tepat.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'koleksi'
     Sintaks 4 — Data processing ............ tahap 'olahData' & 'satuan'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Peran guru saat media dipakai:
     tahap 1–2  memancing rasa ingin tahu, TIDAK membenarkan atau
                menyalahkan prediksi murid;
     tahap 3–5  berkeliling antar kelompok, mengajukan pertanyaan
                pelacak ("apa yang tetap? apa yang berubah?"),
                membiarkan media memberi petunjuk berjenjang;
     tahap 6–7  mengonfirmasi kesimpulan murid dan menautkannya ke
                istilah formal (rasio, FPB, besaran sejenis);
     tahap 8–10 menilai penerapan dan memandu refleksi.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan.
   ============================================================ */

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI (Discovery Learning: stimulation)
     Konflik kognitif: bilangannya berbeda, tetapi rasanya sama.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    goal: 'Mengamati dua campuran dan memperkirakan mana yang lebih manis.',
    judul: 'Dua Gelas Es Jeruk',
    cerita:
      'Di kantin sekolah, Bu Ida membuat dua gelas es jeruk dengan takaran sendok yang sama besar.',
    gelas: [
      { id: 'A', nama: 'Gelas A', gula: 2, air: 6 },
      { id: 'B', nama: 'Gelas B', gula: 3, air: 9 },
    ],
    satuanGula: 'sendok gula',
    satuanAir: 'sendok air',
    pertanyaan: 'Menurut dugaanmu, es jeruk di gelas mana yang terasa lebih manis?',
    opsi: [
      { id: 'a', label: 'Gelas A lebih manis' },
      { id: 'b', label: 'Gelas B lebih manis' },
      { id: 'sama', label: 'Sama manis' },
      { id: 'takTentu', label: 'Tidak dapat ditentukan' },
    ],
    alasanLabel: 'Mengapa kamu menduga begitu?',
    alasanPlaceholder: 'Tulis alasanmu dengan kalimatmu sendiri…',
    catatan:
      'Di tahap ini belum ada jawaban benar atau salah. Dugaanmu akan disimpan, lalu kamu sendiri yang mengujinya pada tahap Pembuktian.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH (problem statement)
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    goal: 'Merumuskan pertanyaan yang tepat agar kedua gelas dapat dibandingkan secara adil.',
    pengantar:
      'Agar dugaanmu dapat diuji, masalahnya perlu dirumuskan dengan jelas lebih dulu. Perhatikan: banyak gula Gelas B memang lebih banyak, tetapi airnya juga lebih banyak.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      { id: 'r1', label: 'Berapa banyak sendok gula pada Gelas A dan Gelas B?' },
      {
        id: 'r2',
        label:
          'Bagaimana cara membandingkan banyak gula terhadap banyak air pada setiap gelas, agar tingkat manis keduanya dapat dibandingkan secara adil?',
      },
      { id: 'r3', label: 'Gelas manakah yang isinya paling banyak?' },
      { id: 'r4', label: 'Berapa selisih banyak sendok air pada kedua gelas?' },
    ],
    correct: 'r2',
    umpan: {
      r1: 'Pertanyaan ini hanya membaca data, belum membandingkan apa pun. Banyak gula saja tidak menentukan tingkat manis.',
      r2: 'Tepat. Tingkat manis ditentukan oleh <em>hubungan</em> antara banyak gula dan banyak air, bukan oleh banyak gula saja.',
      r3: 'Isi gelas yang lebih banyak belum tentu lebih manis — segelas besar bisa saja encer.',
      r4: 'Selisih hanya menjawab "berapa lebihnya", bukan "berapa kali lipatnya". Rasa manis tidak ditentukan selisih.',
    },
    hipotesisLabel: 'Tulis dugaan sementaramu (hipotesis)',
    hipotesisPlaceholder:
      'Contoh: saya menduga kedua gelas dapat dibandingkan jika banyak gula dibagi banyak air…',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA (data collection)
     Bagian A: mencatat pasangan bilangan dari situasi nyata.
     Bagian B: mengenali tiga bentuk penulisan rasio.
     Bagian C: mencocokkan pernyataan dengan bentuk rasionya.
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    goal: 'Mencatat pasangan bilangan dari situasi sehari-hari dan mengenali cara menuliskannya.',
    instruksiA:
      'Baca setiap situasi, lalu catat pasangan bilangannya pada kolom yang tersedia. Perhatikan urutan yang diminta — urutan pada rasio tidak boleh ditukar.',
    situasi: [
      {
        id: 's1',
        judul: 'Es jeruk Gelas A',
        teks: '2 sendok gula dicampur 6 sendok air.',
        minta: 'gula : air',
        a: 2,
        b: 6,
        labelA: 'gula',
        labelB: 'air',
      },
      {
        id: 's2',
        judul: 'Es jeruk Gelas B',
        teks: '3 sendok gula dicampur 9 sendok air.',
        minta: 'gula : air',
        a: 3,
        b: 9,
        labelA: 'gula',
        labelB: 'air',
      },
      {
        id: 's3',
        judul: 'Murid kelas 7A',
        teks: 'Terdapat 12 murid putra dan 18 murid putri.',
        minta: 'putra : putri',
        a: 12,
        b: 18,
        labelA: 'putra',
        labelB: 'putri',
      },
      {
        id: 's4',
        judul: 'Kotak pensil Rani',
        teks: 'Berisi 8 pensil dan 10 pulpen.',
        minta: 'pensil : pulpen',
        a: 8,
        b: 10,
        labelA: 'pensil',
        labelB: 'pulpen',
      },
    ],
    bentuk: {
      judul: 'Tiga cara menuliskan rasio yang sama',
      teks: 'Perbandingan gula terhadap air pada Gelas A dapat ditulis dalam tiga bentuk berikut, dan ketiganya bermakna sama.',
      contoh: [
        { bentuk: '2 : 6', nama: 'bentuk titik dua', baca: 'dibaca "dua berbanding enam"' },
        { bentuk: '2/6', nama: 'bentuk pecahan', baca: 'menegaskan bahwa rasio adalah hasil bagi' },
        {
          bentuk: '2 berbanding 6',
          nama: 'bentuk kalimat',
          baca: 'dipakai saat menjelaskan lisan',
        },
      ],
    },
    instruksiC:
      'Sekarang uji pemahamanmu. Pilih bentuk rasio yang tepat untuk setiap pernyataan — perhatikan urutan besaran yang disebut lebih dulu.',
    cocok: [
      {
        id: 'c1',
        pernyataan: 'Banyak gula dibanding banyak air pada <strong>Gelas A</strong>',
        options: [
          { id: 'o1', label: '2 : 6' },
          { id: 'o2', label: '6 : 2' },
          { id: 'o3', label: '2 : 8' },
          { id: 'o4', label: '6 : 8' },
        ],
        correct: 'o1',
        explanation:
          'Yang disebut lebih dulu adalah <strong>gula</strong> (2 sendok), lalu <strong>air</strong> (6 sendok), sehingga ditulis 2 : 6.',
      },
      {
        id: 'c2',
        pernyataan: 'Banyak air dibanding banyak gula pada <strong>Gelas A</strong>',
        options: [
          { id: 'o1', label: '6 : 2' },
          { id: 'o2', label: '2 : 6' },
          { id: 'o3', label: '6 : 8' },
          { id: 'o4', label: '8 : 6' },
        ],
        correct: 'o1',
        explanation:
          'Urutannya dibalik menjadi air lebih dulu, sehingga 6 : 2. Ini menunjukkan urutan pada rasio tidak boleh ditukar sembarangan.',
      },
      {
        id: 'c3',
        pernyataan: 'Banyak murid putra dibanding <strong>seluruh</strong> murid kelas 7A',
        options: [
          { id: 'o1', label: '12 : 30' },
          { id: 'o2', label: '12 : 18' },
          { id: 'o3', label: '18 : 30' },
          { id: 'o4', label: '30 : 12' },
        ],
        correct: 'o1',
        explanation:
          'Seluruh murid = 12 + 18 = 30 orang. Perbandingan bagian terhadap keseluruhan ditulis 12 : 30.',
      },
      {
        id: 'c4',
        pernyataan: 'Banyak pulpen dibanding banyak pensil di kotak pensil Rani',
        options: [
          { id: 'o1', label: '10 : 8' },
          { id: 'o2', label: '8 : 10' },
          { id: 'o3', label: '10 : 18' },
          { id: 'o4', label: '8 : 18' },
        ],
        correct: 'o1',
        explanation: 'Pulpen (10) disebut lebih dulu, lalu pensil (8), sehingga ditulis 10 : 8.',
      },
    ],
    nextLabel: 'Lanjut: Olah Datanya →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENGOLAHAN DATA (data processing)
     Besaran SEJENIS dengan SATUAN SAMA → bagi dengan FPB.
     ---------------------------------------------------------- */
  olahData: {
    kicker: 'Tahap 4 · Pengolahan Data',
    goal: 'Menemukan cara menyederhanakan perbandingan dua besaran sejenis bersatuan sama.',
    instruksi:
      'Perbandingan dapat ditulis lebih ringkas tanpa mengubah maknanya. Pada setiap kasus: cari bilangan terbesar yang membagi habis kedua bilangan (FPB), lalu bagi keduanya dengan bilangan itu.',
    kasus: [
      {
        id: 'k1',
        judul: 'Es jeruk Gelas A',
        konteks: '2 sendok gula : 6 sendok air',
        a: 2,
        b: 6,
        hints: [
          'Cari bilangan terbesar yang dapat membagi habis 2 dan 6 sekaligus.',
          'Faktor 2 → 1, 2. Faktor 6 → 1, 2, 3, 6. Faktor persekutuan terbesarnya adalah 2.',
        ],
        makna: 'Artinya setiap 1 sendok gula dicampur 3 sendok air.',
      },
      {
        id: 'k2',
        judul: 'Es jeruk Gelas B',
        konteks: '3 sendok gula : 9 sendok air',
        a: 3,
        b: 9,
        hints: [
          'Bilangan berapa yang membagi habis 3 dan juga 9?',
          'Faktor 3 → 1, 3. Faktor 9 → 1, 3, 9. FPB-nya adalah 3.',
        ],
        makna: 'Artinya setiap 1 sendok gula dicampur 3 sendok air — perhatikan hasilnya!',
      },
      {
        id: 'k3',
        judul: 'Murid kelas 7A',
        konteks: '12 murid putra : 18 murid putri',
        a: 12,
        b: 18,
        hints: [
          'Kedua bilangan sama-sama habis dibagi 2, tetapi carilah pembagi yang paling besar.',
          'Faktor persekutuan 12 dan 18 → 1, 2, 3, 6. Yang terbesar adalah 6.',
        ],
        makna: 'Artinya setiap 2 murid putra sebanding dengan 3 murid putri.',
      },
      {
        id: 'k4',
        judul: 'Kotak pensil Rani',
        konteks: '8 pensil : 10 pulpen',
        a: 8,
        b: 10,
        hints: [
          'Keduanya bilangan genap. Bilangan genap terbesar berapa yang membagi habis 8 dan 10?',
          'Faktor persekutuan 8 dan 10 → 1, 2. FPB-nya adalah 2.',
        ],
        makna: 'Artinya setiap 4 pensil sebanding dengan 5 pulpen.',
      },
    ],
    temuan:
      'Perhatikan Gelas A dan Gelas B: bilangannya berbeda (2 : 6 dan 3 : 9), tetapi bentuk paling sederhananya <strong>sama</strong>. Simpan temuan ini — kamu akan memakainya untuk menguji dugaan awalmu.',
    nextLabel: 'Lanjut: Satuan Berbeda →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENGOLAHAN DATA LANJUT
     Besaran SEJENIS dengan SATUAN BERBEDA → samakan satuan dulu.
     ---------------------------------------------------------- */
  satuan: {
    kicker: 'Tahap 5 · Pengolahan Data (Lanjut)',
    goal: 'Menyederhanakan perbandingan dua besaran sejenis yang satuannya berbeda.',
    instruksi:
      'Perbandingan hanya bermakna bila kedua besaran diukur dengan satuan yang sama. Pada setiap kasus: (1) pilih satuan acuan, (2) ubah besaran yang belum sesuai, (3) sederhanakan hasilnya.',
    langkahLabel: ['Pilih satuan acuan', 'Samakan satuannya', 'Sederhanakan'],
    kasus: [
      {
        id: 'u1',
        judul: 'Lama belajar',
        teks: 'Dina belajar selama <strong>2 jam</strong>, sedangkan Rio belajar selama <strong>45 menit</strong>.',
        minta: 'lama belajar Dina : lama belajar Rio',
        besaranA: { nilai: 2, satuan: 'jam', tampil: '2 jam' },
        besaranB: { nilai: 45, satuan: 'menit', tampil: '45 menit' },
        opsiSatuan: [
          { id: 'menit', label: 'Ubah semuanya ke menit' },
          { id: 'jam', label: 'Ubah semuanya ke jam' },
          { id: 'detik', label: 'Ubah semuanya ke detik' },
        ],
        correctSatuan: 'menit',
        umpanSatuan: {
          menit:
            'Tepat. Dengan satuan menit, kedua besaran menjadi bilangan bulat sehingga mudah disederhanakan.',
          jam: 'Boleh saja, tetapi 45 menit menjadi 0,75 jam — muncul bilangan pecahan yang menyulitkan penyederhanaan.',
          detik:
            'Hasilnya tetap benar, tetapi bilangannya menjadi sangat besar (7.200 dan 2.700) dan tidak praktis.',
        },
        konversi: { faktorTeks: '1 jam = 60 menit', nilaiA: 120, nilaiB: 45, satuan: 'menit' },
        sederhana: { a: 8, b: 3 },
        hints: [
          'Ubah 2 jam menjadi menit lebih dulu: 2 × 60.',
          'Setelah menjadi 120 : 45, cari FPB dari 120 dan 45, yaitu 15.',
        ],
        makna: 'Artinya setiap 8 menit Dina belajar, Rio belajar 3 menit.',
      },
      {
        id: 'u2',
        judul: 'Berat bahan kue',
        teks: 'Ibu memakai <strong>1,5 kg</strong> tepung dan <strong>300 g</strong> gula.',
        minta: 'berat tepung : berat gula',
        besaranA: { nilai: 1.5, satuan: 'kg', tampil: '1,5 kg' },
        besaranB: { nilai: 300, satuan: 'g', tampil: '300 g' },
        opsiSatuan: [
          { id: 'g', label: 'Ubah semuanya ke gram' },
          { id: 'kg', label: 'Ubah semuanya ke kilogram' },
          { id: 'tidak', label: 'Tidak perlu disamakan' },
        ],
        correctSatuan: 'g',
        umpanSatuan: {
          g: 'Tepat. Dengan satuan gram, 1,5 kg menjadi 1.500 g sehingga keduanya bilangan bulat.',
          kg: 'Boleh, tetapi 300 g menjadi 0,3 kg sehingga muncul bilangan desimal.',
          tidak:
            'Tidak bisa. Membandingkan 1,5 dengan 300 tanpa menyamakan satuan akan memberi kesimpulan yang keliru.',
        },
        konversi: { faktorTeks: '1 kg = 1.000 g', nilaiA: 1500, nilaiB: 300, satuan: 'g' },
        sederhana: { a: 5, b: 1 },
        hints: [
          'Ubah 1,5 kg menjadi gram: 1,5 × 1.000.',
          'Setelah menjadi 1.500 : 300, FPB-nya adalah 300.',
        ],
        makna: 'Artinya berat tepung 5 kali berat gula.',
      },
      {
        id: 'u3',
        judul: 'Panjang pita',
        teks: 'Pita Sinta panjangnya <strong>2,5 m</strong>, pita Dewi <strong>75 cm</strong>.',
        minta: 'panjang pita Sinta : panjang pita Dewi',
        besaranA: { nilai: 2.5, satuan: 'm', tampil: '2,5 m' },
        besaranB: { nilai: 75, satuan: 'cm', tampil: '75 cm' },
        opsiSatuan: [
          { id: 'cm', label: 'Ubah semuanya ke sentimeter' },
          { id: 'm', label: 'Ubah semuanya ke meter' },
          { id: 'mm', label: 'Ubah semuanya ke milimeter' },
        ],
        correctSatuan: 'cm',
        umpanSatuan: {
          cm: 'Tepat. 2,5 m menjadi 250 cm sehingga kedua bilangan bulat dan mudah dibandingkan.',
          m: 'Boleh, tetapi 75 cm menjadi 0,75 m sehingga muncul bilangan desimal.',
          mm: 'Hasilnya tetap benar, tetapi bilangannya jadi besar (2.500 dan 750) tanpa manfaat tambahan.',
        },
        konversi: { faktorTeks: '1 m = 100 cm', nilaiA: 250, nilaiB: 75, satuan: 'cm' },
        sederhana: { a: 10, b: 3 },
        hints: [
          'Ubah 2,5 m menjadi sentimeter: 2,5 × 100.',
          'Setelah menjadi 250 : 75, FPB dari 250 dan 75 adalah 25.',
        ],
        makna: 'Artinya setiap 10 cm pita Sinta sebanding dengan 3 cm pita Dewi.',
      },
      {
        id: 'u4',
        judul: 'Isi botol minuman',
        teks: 'Botol Andi berisi <strong>1,2 L</strong> air, botol Bima berisi <strong>800 mL</strong>.',
        minta: 'isi botol Andi : isi botol Bima',
        besaranA: { nilai: 1.2, satuan: 'L', tampil: '1,2 L' },
        besaranB: { nilai: 800, satuan: 'mL', tampil: '800 mL' },
        opsiSatuan: [
          { id: 'ml', label: 'Ubah semuanya ke mililiter' },
          { id: 'l', label: 'Ubah semuanya ke liter' },
          { id: 'tidak', label: 'Tidak perlu disamakan' },
        ],
        correctSatuan: 'ml',
        umpanSatuan: {
          ml: 'Tepat. 1,2 L menjadi 1.200 mL sehingga keduanya bilangan bulat.',
          l: 'Boleh, tetapi 800 mL menjadi 0,8 L sehingga muncul bilangan desimal.',
          tidak:
            'Tidak bisa. Angka 1,2 dan 800 berasal dari satuan berbeda, jadi belum dapat dibandingkan langsung.',
        },
        konversi: { faktorTeks: '1 L = 1.000 mL', nilaiA: 1200, nilaiB: 800, satuan: 'mL' },
        sederhana: { a: 3, b: 2 },
        hints: [
          'Ubah 1,2 L menjadi mililiter: 1,2 × 1.000.',
          'Setelah menjadi 1.200 : 800, FPB dari 1.200 dan 800 adalah 400.',
        ],
        makna: 'Artinya setiap 3 gelas isi botol Andi sebanding dengan 2 gelas isi botol Bima.',
      },
    ],
    nextLabel: 'Lanjut: Buktikan Dugaanmu →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — PEMBUKTIAN (verification)
     Murid menguji prediksinya sendiri + menelaah non-contoh.
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    goal: 'Menguji dugaan awal dengan perbandingan yang sudah disederhanakan.',
    prediksiLabel: 'Dugaanmu pada Tahap 1',
    prediksiTeks: {
      a: 'Gelas A lebih manis',
      b: 'Gelas B lebih manis',
      sama: 'Sama manis',
      takTentu: 'Tidak dapat ditentukan',
    },
    instruksi:
      'Kembali ke dua gelas es jeruk. Sederhanakan perbandingan gula : air pada masing-masing gelas, lalu bandingkan hasilnya.',
    uji: [
      { id: 'A', nama: 'Gelas A', a: 2, b: 6, sederhanaA: 1, sederhanaB: 3 },
      { id: 'B', nama: 'Gelas B', a: 3, b: 9, sederhanaA: 1, sederhanaB: 3 },
    ],
    kesimpulan:
      'Kedua gelas memiliki perbandingan gula : air yang sama, yaitu <strong>1 : 3</strong>. Jadi <strong>kedua es jeruk sama manisnya</strong>, meskipun banyak gulanya berbeda.',
    kesimpulanBenar: 'Dugaanmu di Tahap 1 ternyata sudah tepat. Sekarang kamu punya buktinya!',
    kesimpulanKeliru:
      'Dugaan awalmu ternyata berbeda dengan hasil pembuktian. Itu hal yang wajar dan justru berharga — di situlah penemuan terjadi.',
    instruksiSoal:
      'Uji pemahamanmu dengan tiga kasus berikut. Perhatikan baik-baik, ada kasus yang sengaja dibuat untuk menguji ketelitianmu.',
    soal: [
      {
        id: 'v1',
        pernyataan:
          'Rina berkata, <em>"Gelas B pasti lebih manis, sebab gulanya 3 sendok sedangkan Gelas A hanya 2 sendok."</em> Tanggapan mana yang paling tepat?',
        options: [
          {
            id: 'o1',
            label:
              'Rina keliru. Tingkat manis ditentukan perbandingan gula terhadap air, dan keduanya sama-sama 1 : 3.',
          },
          { id: 'o2', label: 'Rina benar, karena gula yang lebih banyak pasti lebih manis.' },
          { id: 'o3', label: 'Rina benar, karena isi Gelas B lebih banyak daripada Gelas A.' },
          {
            id: 'o4',
            label:
              'Rina keliru, karena seharusnya Gelas A yang lebih manis (gulanya lebih sedikit).',
          },
        ],
        correct: 'o1',
        explanation:
          'Banyak gula saja belum cukup. Karena airnya juga bertambah dengan perbandingan yang sama, tingkat manis kedua gelas tetap sama, yaitu 1 : 3.',
      },
      {
        id: 'v2',
        pernyataan:
          'Pada Gelas A selisih air dan gula adalah 6 − 2 = 4, sedangkan pada Gelas B adalah 9 − 3 = 6. Selisihnya berbeda, tetapi rasanya sama. Pernyataan mana yang benar?',
        options: [
          {
            id: 'o1',
            label:
              'Rasio membandingkan dua besaran dengan cara <strong>membagi</strong>, bukan mengurangi, sehingga selisih yang berbeda tidak berarti rasionya berbeda.',
          },
          {
            id: 'o2',
            label: 'Berarti perhitungan sebelumnya salah, kedua gelas seharusnya berbeda rasa.',
          },
          { id: 'o3', label: 'Rasio dan selisih selalu memberikan kesimpulan yang sama.' },
          { id: 'o4', label: 'Rasio sebaiknya dihitung dengan mengurangkan kedua besaran.' },
        ],
        correct: 'o1',
        explanation:
          'Inilah pembeda penting: selisih menjawab "berapa lebihnya", sedangkan rasio menjawab "berapa kali lipatnya". 2 : 6 dan 3 : 9 sama-sama bernilai 1/3.',
      },
      {
        id: 'v3',
        pernyataan:
          'Sebuah mobil menempuh 3 km dalam waktu 20 menit. Manakah pernyataan yang <strong>benar</strong> mengenai 3 km : 20 menit?',
        options: [
          {
            id: 'o1',
            label:
              'Km dan menit adalah besaran <strong>tak sejenis</strong>, sehingga satuannya tidak dapat dihilangkan; perbandingan ini dibaca sebagai laju, yaitu 3 km setiap 20 menit.',
          },
          { id: 'o2', label: 'Dapat langsung disederhanakan menjadi 3 : 20 tanpa satuan.' },
          {
            id: 'o3',
            label: 'Satuan menit harus diubah ke km lebih dulu agar dapat disederhanakan.',
          },
          { id: 'o4', label: 'Perbandingan ini tidak bermakna dan tidak dapat digunakan.' },
        ],
        correct: 'o1',
        explanation:
          'Menyederhanakan sampai satuannya hilang hanya berlaku untuk besaran <strong>sejenis</strong> (panjang dengan panjang, waktu dengan waktu). Panjang dibanding waktu menghasilkan besaran baru, yaitu laju — dan satuannya tetap ditulis.',
      },
    ],
    nextLabel: 'Lanjut: Susun Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — GENERALISASI (generalization)
     Murid menyusun sendiri kalimat kesimpulan dari bank kartu.
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    goal: 'Merumuskan kesimpulan umum tentang rasio dan cara menyederhanakannya.',
    instruksi:
      'Lengkapi ketiga kalimat kesimpulan berikut dengan memilih potongan kalimat yang tepat. Hati-hati, ada beberapa potongan pengecoh.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      {
        id: 'g1',
        awal: 'Rasio (perbandingan) dua besaran adalah',
        correct: 'b3',
      },
      {
        id: 'g2',
        awal: 'Untuk menyederhanakan perbandingan dua besaran sejenis, kedua bilangan dibagi dengan',
        correct: 'b1',
      },
      {
        id: 'g3',
        awal: 'Jika satuan kedua besaran berbeda, langkah pertama yang harus dilakukan adalah',
        correct: 'b5',
      },
    ],
    bank: [
      { id: 'b1', teks: 'FPB (faktor persekutuan terbesar) dari kedua bilangan itu.' },
      { id: 'b2', teks: 'selisih dari kedua bilangan itu.' },
      {
        id: 'b3',
        teks: 'hasil membandingkan dua besaran dengan cara membagi, yang dapat ditulis a : b, a/b, atau "a berbanding b".',
      },
      { id: 'b4', teks: 'hasil menjumlahkan kedua besaran lalu membaginya dengan dua.' },
      { id: 'b5', teks: 'menyamakan satuan kedua besaran lebih dulu, baru disederhanakan.' },
      { id: 'b6', teks: 'langsung membagi bilangan yang besar dengan bilangan yang kecil.' },
    ],
    rangkuman: [
      'Rasio membandingkan dua besaran dengan cara <strong>membagi</strong>, bukan mengurangi.',
      'Urutan penyebutan menentukan penulisan: gula : air (2 : 6) berbeda makna dengan air : gula (6 : 2).',
      'Bentuk paling sederhana diperoleh dengan membagi kedua bilangan dengan <strong>FPB</strong>-nya. Nilai rasio tidak berubah.',
      'Besaran <strong>sejenis</strong> yang satuannya berbeda harus <strong>disamakan satuannya lebih dulu</strong>.',
      'Besaran <strong>tak sejenis</strong> (mis. km dan menit) tidak dapat dihilangkan satuannya — hasilnya berupa laju.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP (penerapan pada masalah kontekstual)
     Dirender createExerciseStage: campuran 'input' dan 'choice'.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    goal: 'Menerapkan konsep rasio pada masalah kontekstual sehari-hari.',
    instruksi:
      'Enam soal berikut memuat kasus satuan sama maupun satuan berbeda. Gunakan petunjuk bila diperlukan.',
    soal: [
      {
        id: 't1',
        type: 'choice',
        cerita:
          'Di kelas 7B terdapat 16 murid putra dan 20 murid putri untuk kegiatan kerja kelompok.',
        pertanyaan: 'Bentuk paling sederhana dari perbandingan putra : putri adalah…',
        options: [
          { id: 'o1', label: '4 : 5' },
          { id: 'o2', label: '5 : 4' },
          { id: 'o3', label: '8 : 10' },
          { id: 'o4', label: '16 : 36' },
        ],
        correct: 'o1',
        explanation: 'FPB dari 16 dan 20 adalah 4, sehingga 16 : 20 = (16 ÷ 4) : (20 ÷ 4) = 4 : 5.',
      },
      {
        id: 't2',
        type: 'input',
        cerita: 'Sebuah denah lapangan memuat perbandingan panjang : lebar sebesar 24 : 36.',
        pertanyaan:
          'Setelah disederhanakan, perbandingan itu menjadi a : b. Berapa nilai <strong>a</strong>?',
        jawab: 2,
        suffix: '',
        hints: [
          'Cari FPB dari 24 dan 36 lebih dulu.',
          'Faktor persekutuan 24 dan 36 → 1, 2, 3, 4, 6, 12. FPB-nya 12.',
        ],
        reveal:
          '24 : 36 dibagi FPB-nya (12) menjadi <strong>2 : 3</strong>, sehingga nilai a adalah <strong>2</strong>.',
      },
      {
        id: 't3',
        type: 'choice',
        cerita: 'Panjang pita Sinta 1,2 m, sedangkan panjang pita Dewi 90 cm.',
        pertanyaan: 'Perbandingan panjang pita Sinta : Dewi dalam bentuk paling sederhana adalah…',
        options: [
          { id: 'o1', label: '4 : 3' },
          { id: 'o2', label: '3 : 4' },
          { id: 'o3', label: '1,2 : 90' },
          { id: 'o4', label: '12 : 9' },
        ],
        correct: 'o1',
        explanation:
          'Samakan satuan lebih dulu: 1,2 m = 120 cm. Lalu 120 : 90 dibagi FPB-nya (30) menjadi 4 : 3.',
      },
      {
        id: 't4',
        type: 'input',
        cerita: 'Dalam sebuah keranjang terdapat 15 jeruk dan 25 apel.',
        pertanyaan:
          'Perbandingan banyak jeruk terhadap <strong>seluruh</strong> buah adalah 3 : n. Berapa nilai <strong>n</strong>?',
        jawab: 8,
        suffix: '',
        hints: [
          'Hitung dulu banyak seluruh buah: jeruk ditambah apel.',
          'Seluruh buah = 15 + 25 = 40. Sederhanakan 15 : 40 dengan FPB 5.',
        ],
        reveal:
          'Seluruh buah 15 + 25 = 40. Maka 15 : 40 dibagi 5 menjadi <strong>3 : 8</strong>, sehingga n = <strong>8</strong>.',
      },
      {
        id: 't5',
        type: 'choice',
        cerita: 'Waktu tempuh Andi ke sekolah 1 jam, sedangkan Budi 40 menit.',
        pertanyaan: 'Perbandingan waktu tempuh Andi : Budi adalah…',
        options: [
          { id: 'o1', label: '3 : 2' },
          { id: 'o2', label: '1 : 40' },
          { id: 'o3', label: '2 : 3' },
          { id: 'o4', label: '40 : 60' },
        ],
        correct: 'o1',
        explanation:
          'Samakan satuan: 1 jam = 60 menit. Lalu 60 : 40 dibagi FPB-nya (20) menjadi 3 : 2.',
      },
      {
        id: 't6',
        type: 'input',
        cerita: 'Resep bolu memerlukan 250 g tepung dan 200 g gula.',
        pertanyaan:
          'Perbandingan tepung : gula dalam bentuk paling sederhana adalah a : b. Berapa nilai <strong>a + b</strong>?',
        jawab: 9,
        suffix: '',
        hints: [
          'Sederhanakan 250 : 200 lebih dulu, baru jumlahkan kedua bilangannya.',
          'FPB dari 250 dan 200 adalah 50, sehingga bentuk sederhananya 5 : 4.',
        ],
        reveal:
          '250 : 200 dibagi 50 menjadi <strong>5 : 4</strong>, sehingga a + b = 5 + 4 = <strong>9</strong>.',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    goal: 'Menyadari proses berpikir sendiri selama menemukan konsep rasio.',
    pertanyaan: [
      {
        id: 'f1',
        teks: 'Bandingkan dugaanmu di Tahap 1 dengan hasil pembuktian di Tahap 6. Apa yang berubah dari cara berpikirmu?',
        placeholder: 'Awalnya saya mengira… ternyata…',
      },
      {
        id: 'f2',
        teks: 'Bagian mana yang paling menantang: mencari FPB, atau menyamakan satuan? Mengapa?',
        placeholder: 'Bagian yang paling menantang bagi saya adalah…',
      },
      {
        id: 'f3',
        teks: 'Tuliskan satu contoh perbandingan yang kamu temui sendiri di rumah atau di sekolah, lalu sederhanakan.',
        placeholder: 'Contoh: di rumah ada … dibanding …, bentuk sederhananya …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat menyederhanakan perbandingan sekarang?',
    diriOpsi: [
      { id: 'd1', label: 'Sangat yakin, saya bisa menjelaskannya ke teman' },
      { id: 'd2', label: 'Cukup yakin, sesekali masih perlu petunjuk' },
      { id: 'd3', label: 'Belum yakin, saya ingin berlatih lagi' },
    ],
    nextLabel: 'Selesaikan Pembelajaran →',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    kicker: 'Tahap 10 · Selesai',
    judul: 'Kerja bagus, kamu sudah menemukannya sendiri!',
    teks: 'Kamu telah menempuh seluruh tahap penemuan: dari menduga, merumuskan masalah, mengumpulkan dan mengolah data, membuktikan, sampai menarik kesimpulan sendiri.',
    capaian: [
      'Menjelaskan konsep rasio sebagai hasil membandingkan dua besaran dengan cara membagi.',
      'Menuliskan rasio dalam bentuk a : b, a/b, dan kalimat "a berbanding b".',
      'Menyederhanakan perbandingan dua besaran sejenis bersatuan sama menggunakan FPB.',
      'Menyamakan satuan lebih dulu sebelum menyederhanakan perbandingan bersatuan berbeda.',
      'Membedakan besaran sejenis dan tak sejenis serta rasio dan selisih.',
    ],
  },
};
