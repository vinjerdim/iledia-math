'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Penjumlahan & Pengurangan Pecahan dalam Masalah
   Kontekstual — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menerapkan operasi penjumlahan dan pengurangan pada bilangan
   rasional (pecahan) untuk menyelesaikan masalah kontekstual.

   Notasi di berkas ini (lihat engine seksi 62):
     • setiap bilangan ditulis sebagai STRING bentuk aslinya — pecahan
       '3/4', campuran '2 1/2', negatif '-3/4', bulat '5';
     • di dalam teks, token "{3/4}" / "{2 1/2}" dirender menjadi pecahan
       bersusun (renderFracText) dan tanda minus ditulis "−".

   Model pembelajaran: PROBLEM BASED LEARNING (PBL).
   Masalah pemantik: "Stand Kue 7C di Bazar Sekolah".
   Kelompok mengelola tiga catatan persiapan stand:
     • Tepung: persediaan 2 1/2 kg; bolu pisang butuh 3/4 kg dan donat
       butuh 1 1/3 kg — cukupkah, dan berapa sisanya?
     • Pita hias: satu gulung 5 m; hiasan meja 1 3/4 m dan spanduk
       2 1/2 m — berapa sisa pita?
     • Meja stand: 1/3 bagian untuk kue, 1/4 bagian untuk minuman,
       sisanya untuk kerajinan — berapa bagian untuk kerajinan?
   Konflik kognitif: "1/3 + 1/4 = 2/7" (penyebut ikut dijumlah),
   padahal 2/7 lebih kecil daripada 1/3. Kelompok harus menemukan
   mengapa penyebut perlu disamakan, bagaimana menangani pecahan
   campuran (meminjam 1 utuh) dan pecahan negatif, lalu memutuskan.

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ....... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar . 'organisasi'
     Sintaks 3 — Membimbing penyelidikan ............ 'selidikSama',
                                                      'selidikBeda',
                                                      'selidikCampuran'
     Sintaks 4 — Mengembangkan & menyajikan karya ... 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi ........ 'evaluasi'
     Penerapan & penutup ............................ 'terapkan', 'refleksi',
                                                      'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — murid menulis dugaan & hipotesis,
       memilah sub-masalah, menyusun rencana, lalu menguji dugaannya
       sendiri dan merefleksikan strateginya.
     • Bermakna (meaningful) — semua operasi berasal dari persiapan
       stand yang nyata; hasil hitungan langsung menjadi keputusan
       (cukup tidaknya tepung, sisa pita, pembagian meja).
     • Menggembirakan (joyful) — Lab Pita yang bisa dipotong-potong,
       umpan balik yang menunjuk letak kekeliruan, "detektif" solusi
       kelompok lain, dan Papan Solusi Stand yang dipresentasikan.

   Rangkaian aktivitas (± 2 × 40 menit; kelompok 3–4 murid):
     1. Orientasi     (8')  — cerita, catatan persiapan stand, dugaan awal
                              (tidak dinilai), rumusan masalah, hipotesis.
     2. Organisasi    (6')  — memilih peran, memilah sub-masalah ke
                              penjumlahan/pengurangan, menyusun rencana.
     3. Selidik A     (8')  — penyebut sama: pita pecahan + isian
                              berdiagnosa; pengamatan.
     4. Selidik B     (12') — Lab Pita: memilih potongan yang pas (KPK),
                              lalu menghitung; pengamatan.
     5. Selidik C     (12') — pecahan campuran (meminjam 1 utuh) dan
                              pecahan negatif di garis bilangan.
     6. Karya         (12') — Papan Solusi Stand: enam langkah hitung,
                              keputusan, pesan kelompok → presentasi.
     7. Evaluasi      (10') — detektif solusi kelompok lain, cek
                              kewajaran, dugaan vs hasil, simpulan.
     8. Uji terap     (10') — 8 soal acak dari bank 13 soal.
     9. Refleksi      (4')  — rekap capaian, refleksi tertulis, keyakinan.

   Catatan pengacakan: SEMUA daftar pilihan di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di urutan pertama). app.js
   mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / ensureTapOrderState / ensurePitaState /
   shuffleArray dari shared/engine.js) dan menyimpannya di State,
   sehingga tiap murid dan tiap Reset mendapat urutan berbeda. Pilihan
   buatan engine (opsiOperasiPecahan, pilihanPenyebutPita) diacak
   dengan cara yang sama.

   Konsistensi kunci jawaban diuji tests/mpi-2.3-data.test.js terhadap
   engine seksi 62.
   ============================================================ */

var PBL = 'Problem Based Learning';

var DATA = {
  meta: {
    judul: 'Penjumlahan & Pengurangan Pecahan dalam Masalah Kontekstual',
  },

  tahap: [
    { id: 'orientasi', label: 'Masalah' },
    { id: 'organisasi', label: 'Organisasi' },
    { id: 'selidikSama', label: 'Penyebut Sama' },
    { id: 'selidikBeda', label: 'Lab Pita' },
    { id: 'selidikCampuran', label: 'Campuran & Negatif' },
    { id: 'karya', label: 'Karya' },
    { id: 'evaluasi', label: 'Evaluasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Data masalah pemantik — dipakai di beberapa tahap. */
  tepung: { persediaan: '2 1/2', bolu: '3/4', donat: '1 1/3' },
  pita: { gulung: '5', meja: '1 3/4', spanduk: '2 1/2' },
  meja: { utuh: '1', kue: '1/3', minuman: '1/4' },

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI PADA MASALAH (PBL sintaks 1)
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Evaluasi.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi pada Masalah',
    syntax: PBL + ' · Sintaks 1',
    goal: 'Memahami masalah persiapan stand bazar dan merumuskan apa yang harus diselesaikan.',
    guru: 'Bacakan cerita dengan antusias, lalu minta kelompok membaca ketiga catatan. Biarkan murid menebak dulu — dugaan TIDAK dinilai. Pancing konflik: "Ada yang menjawab 1/3 + 1/4 = 2/7. Masuk akal?" Jangan beri jawaban; arahkan ke rumusan masalah dan hipotesis kelompok.',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Menerapkan operasi penjumlahan dan pengurangan pada bilangan rasional (pecahan) untuk menyelesaikan masalah kontekstual.',
    kriteria: [
      'Menjumlahkan dan mengurangkan pecahan berpenyebut sama dan berbeda dengan menyamakan penyebut (KPK).',
      'Menjumlahkan dan mengurangkan pecahan campuran dan pecahan negatif.',
      'Menuliskan kalimat matematika dari masalah sehari-hari dan menyederhanakan hasilnya.',
      'Memeriksa kewajaran hasil dan menjelaskan keputusan berdasarkan perhitungan.',
    ],
    judul: 'Stand Kue 7C di Bazar Sekolah',
    pengantar:
      'Sabtu depan sekolah mengadakan bazar. Kelas 7C membuka stand kue dan kerajinan. Bu Ratna, wali kelas, menitipkan tiga catatan persiapan. Panitia meminta jawaban yang pasti, bukan kira-kira — kalau salah hitung, stand bisa kekurangan bahan!',
    catatan: [
      {
        id: 'tepung',
        ikon: '🌾',
        judul: 'Catatan Tepung',
        teks: 'Di lemari kelas ada tepung terigu. Kita mau membuat bolu pisang dan donat.',
        data: [
          { ikon: '📦', nama: 'Persediaan tepung', nilai: '2 1/2', satuan: 'kg' },
          { ikon: '🍰', nama: 'Resep bolu pisang', nilai: '3/4', satuan: 'kg' },
          { ikon: '🍩', nama: 'Resep donat', nilai: '1 1/3', satuan: 'kg' },
        ],
      },
      {
        id: 'pita',
        ikon: '🎀',
        judul: 'Catatan Pita Hias',
        teks: 'Satu gulung pita dipakai untuk menghias meja dan spanduk stand.',
        data: [
          { ikon: '🧵', nama: 'Panjang satu gulung', nilai: '5', satuan: 'm' },
          { ikon: '🪑', nama: 'Hiasan tepi meja', nilai: '1 3/4', satuan: 'm' },
          { ikon: '🪧', nama: 'Hiasan spanduk', nilai: '2 1/2', satuan: 'm' },
        ],
      },
      {
        id: 'meja',
        ikon: '🪑',
        judul: 'Catatan Meja Stand',
        teks: 'Permukaan meja stand dibagi. Sisanya dipakai untuk memajang kerajinan.',
        data: [
          { ikon: '🧁', nama: 'Bagian untuk kue', nilai: '1/3', satuan: 'meja' },
          { ikon: '🥤', nama: 'Bagian untuk minuman', nilai: '1/4', satuan: 'meja' },
          { ikon: '🧶', nama: 'Bagian untuk kerajinan', nilai: '?', satuan: 'meja' },
        ],
      },
    ],
    dugaan: [
      {
        id: 'dTepung',
        tanya: 'Cukupkah tepung {2 1/2} kg untuk bolu pisang dan donat sekaligus?',
        opsi: [
          { id: 'cukup', label: 'Cukup, masih ada sisa' },
          { id: 'pas', label: 'Pas, tidak bersisa' },
          { id: 'kurang', label: 'Kurang' },
        ],
        baku: 'cukup',
        pembahasan:
          'Kebutuhan 3/4 + 1 1/3 = 2 1/12 kg, lebih sedikit dari 2 1/2 kg; sisanya 5/12 kg.',
      },
      {
        id: 'dMeja',
        tanya: 'Bagian meja untuk kue dan minuman: {1/3} + {1/4} = …',
        opsi: [
          { id: 'kpk', label: '7/12' },
          { id: 'naif', label: '2/7' },
          { id: 'kali', label: '1/12' },
          { id: 'pembilang', label: '2/12' },
        ],
        baku: 'kpk',
        a: '1/3',
        op: '+',
        b: '1/4',
        pembahasan: '1/3 = 4/12 dan 1/4 = 3/12, jadi 1/3 + 1/4 = 7/12 meja.',
      },
    ],
    alasanLabel: 'Bagaimana kelompokmu menebak? Tulis alasan singkatnya.',
    alasanPlaceholder: 'Contoh: kami menjumlahkan pembilang dengan pembilang …',
    pertanyaan: 'Apa masalah utama yang harus diselesaikan kelompokmu?',
    masalahOpsi: [
      {
        id: 'hitung',
        label:
          'Menghitung kebutuhan dan sisa tepung, sisa pita, serta bagian meja untuk kerajinan dengan tepat',
      },
      { id: 'harga', label: 'Menentukan harga jual setiap kue' },
      { id: 'menu', label: 'Memilih kue yang paling enak untuk dijual' },
      { id: 'kira', label: 'Memperkirakan banyak pembeli yang datang' },
    ],
    masalahCorrect: 'hitung',
    masalahUmpan: {
      hitung: 'Tepat! Semua catatan meminta hasil penjumlahan dan pengurangan pecahan yang pasti.',
      harga: 'Harga memang penting, tetapi tidak ada data harga di catatan Bu Ratna.',
      menu: 'Rasa kue tidak bisa dihitung dari catatan. Baca lagi apa yang ditanyakan.',
      kira: 'Banyak pembeli tidak ada di catatan. Fokus pada tepung, pita, dan meja.',
    },
    hipotesisLabel:
      'Hipotesis kelompok: bagaimana cara menjumlahkan pecahan yang penyebutnya berbeda?',
    hipotesisPlaceholder: 'Contoh: kami menduga penyebutnya harus dibuat sama dulu …',
    nextLabel: 'Bagi Tugas Kelompok →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENGORGANISASI MURID (PBL sintaks 2)
     ---------------------------------------------------------- */
  organisasi: {
    kicker: 'Tahap 2 · Mengorganisasi Belajar',
    syntax: PBL + ' · Sintaks 2',
    goal: 'Membagi peran, memilah sub-masalah menurut operasinya, dan menyusun rencana penyelidikan.',
    guru: 'Pastikan setiap anggota memegang peran berbeda dan bergiliran pada pertemuan berikutnya. Saat memilah, minta murid menunjuk kata kunci ("sisa", "seluruhnya", "dipakai") sebelum memilih operasi.',
    peranLabel: 'Pilih peranmu di kelompok',
    peran: [
      { id: 'penghitung', label: '🧮 Penghitung — menghitung langkah demi langkah' },
      { id: 'pencatat', label: '📝 Pencatat — menuliskan kalimat matematika' },
      { id: 'pemeriksa', label: '🔍 Pemeriksa — mengecek kewajaran hasil' },
      { id: 'penyaji', label: '🎤 Penyaji — mempresentasikan solusi kelompok' },
    ],
    judulPilah: 'Pilah sub-masalah: penjumlahan atau pengurangan?',
    opsiPilah: [
      { id: 'jumlah', label: 'Penjumlahan (+)' },
      { id: 'kurang', label: 'Pengurangan (−)' },
      { id: 'tidak', label: 'Tidak diperlukan' },
    ],
    pilah: [
      {
        id: 'pTepungTotal',
        teks: 'Banyak tepung yang dibutuhkan untuk bolu pisang dan donat seluruhnya',
        a: '3/4',
        op: '+',
        b: '1 1/3',
        correct: 'jumlah',
        explanation: 'Kebutuhan dua resep digabung: 3/4 + 1 1/3.',
      },
      {
        id: 'pTepungSisa',
        teks: 'Sisa tepung setelah kedua resep dibuat',
        a: '2 1/2',
        op: '-',
        b: '2 1/12',
        correct: 'kurang',
        explanation: 'Sisa = persediaan dikurangi kebutuhan: 2 1/2 − (kebutuhan).',
      },
      {
        id: 'pPitaPakai',
        teks: 'Panjang pita yang dipakai untuk meja dan spanduk',
        a: '1 3/4',
        op: '+',
        b: '2 1/2',
        correct: 'jumlah',
        explanation: 'Pemakaian meja dan spanduk digabung: 1 3/4 + 2 1/2.',
      },
      {
        id: 'pPitaSisa',
        teks: 'Sisa pita dari satu gulung 5 m',
        a: '5',
        op: '-',
        b: '4 1/4',
        correct: 'kurang',
        explanation: 'Sisa = panjang gulungan dikurangi pita yang dipakai.',
      },
      {
        id: 'pMejaKerajinan',
        teks: 'Bagian meja untuk kerajinan setelah kue dan minuman',
        a: '1',
        op: '-',
        b: '7/12',
        correct: 'kurang',
        explanation: 'Satu meja utuh (1) dikurangi bagian yang sudah terpakai.',
      },
      {
        id: 'pHarga',
        teks: 'Harga tepung Rp14.000 per kilogram',
        correct: 'tidak',
        explanation:
          'Catatan tidak menanyakan biaya, jadi harga tidak diperlukan untuk masalah ini.',
      },
    ],
    judulRencana: 'Susun rencana penyelidikan kelompok',
    instruksiRencana: 'Ketuk kartu sesuai urutan langkah yang akan kalian jalankan.',
    rencana: [
      { id: 'kalimat', label: '✍️ Tulis kalimat matematikanya' },
      { id: 'samakan', label: '✂️ Samakan penyebut' },
      { id: 'hitung', label: '➕ Jumlahkan/kurangkan pembilang' },
      { id: 'sederhana', label: '🔽 Sederhanakan hasilnya' },
      { id: 'cek', label: '✅ Cek kewajaran & simpulkan' },
    ],
    nextLabel: 'Mulai Penyelidikan A →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENYELIDIKAN A: PENYEBUT SAMA (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikSama: {
    kicker: 'Tahap 3 · Penyelidikan A — Penyebut Sama',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menemukan cara menjumlahkan dan mengurangkan pecahan yang penyebutnya sama.',
    guru: 'Minta murid mengamati pita sebelum mengetik jawaban. Bila muncul 3/10, tanyakan: "Pitanya dipotong menjadi berapa bagian? Apakah ukuran potongannya berubah setelah digabung?"',
    judul: 'Pita pecahan berpenyebut sama',
    instruksi:
      'Amati pita setiap soal. Biru = suku pertama, oranye = suku kedua. Lalu tulis hasilnya (pecahan paling sederhana).',
    hitung: [
      {
        id: 'sa1',
        a: '1/5',
        op: '+',
        b: '2/5',
        label:
          'Raka memakai {1/5} m pita, Dina {2/5} m. Panjang pita yang mereka pakai: {1/5} + {2/5} = …',
        satuan: 'm',
        hints: [
          'Potongannya berukuran sama (seperlima). Hitung saja banyak potongan biru dan oranye.',
          '1 potong + 2 potong = 3 potong seperlima.',
        ],
        temuan: '1/5 + 2/5 = 3/5. Penyebut tetap 5 karena ukuran potongannya tidak berubah.',
      },
      {
        id: 'sa2',
        a: '5/6',
        op: '-',
        b: '1/6',
        label: 'Ada {5/6} loyang bolu, terjual {1/6} loyang. Sisa bolu: {5/6} − {1/6} = …',
        satuan: 'loyang',
        hints: ['Ambil 1 potong dari 5 potong seperenam.', '4/6 masih bisa disederhanakan.'],
        temuan: '5/6 − 1/6 = 4/6 = 2/3. Hanya pembilang yang dikurangi, lalu disederhanakan.',
      },
      {
        id: 'sa3',
        a: '3/8',
        op: '+',
        b: '7/8',
        label: 'Gula {3/8} kg ditambah {7/8} kg. Seluruhnya: {3/8} + {7/8} = …',
        satuan: 'kg',
        hints: [
          'Jumlahkan pembilangnya: 3 + 7 = 10 potong seperdelapan.',
          '10/8 lebih dari 1 utuh. Ubah ke pecahan campuran, lalu sederhanakan.',
        ],
        temuan: '3/8 + 7/8 = 10/8 = 1 2/8 = 1 1/4. Hasil boleh lebih dari 1 utuh.',
      },
    ],
    amati: [
      {
        id: 'amSama1',
        tanya: 'Saat penyebutnya sama, bagian yang dijumlahkan atau dikurangkan adalah …',
        opsi: [
          { id: 'pembilang', label: 'Pembilangnya saja; penyebut tetap' },
          { id: 'keduanya', label: 'Pembilang dan penyebut' },
          { id: 'penyebut', label: 'Penyebutnya saja' },
        ],
        correct: 'pembilang',
        umpan: {
          pembilang: 'Benar! Penyebut menunjukkan ukuran potongan, dan ukurannya tidak berubah.',
          keduanya:
            'Coba lihat pita {1/5} + {2/5}: hasilnya tetap potongan seperlima, bukan sepersepuluh.',
          penyebut: 'Banyak potongannya yang bertambah, bukan ukurannya.',
        },
      },
      {
        id: 'amSama2',
        tanya: 'Mengapa {1/5} + {2/5} bukan {3/10}?',
        opsi: [
          { id: 'kecil', label: '3/10 lebih kecil daripada 2/5, padahal pitanya bertambah' },
          { id: 'besar', label: '3/10 terlalu besar' },
          { id: 'sama', label: '3/10 dan 3/5 sebenarnya sama' },
        ],
        correct: 'kecil',
        umpan: {
          kecil: 'Tepat! Menambah pita tidak mungkin membuatnya lebih pendek.',
          besar: 'Bandingkan: 3/10 = 0,3, sedangkan 2/5 = 0,4. Mana yang lebih besar?',
          sama: '3/10 = 0,3 dan 3/5 = 0,6. Nilainya berbeda.',
        },
      },
    ],
    temuan: [
      'Pecahan berpenyebut sama: jumlahkan/kurangkan pembilangnya, penyebut tetap.',
      'Penyebut adalah ukuran potongan, jadi tidak ikut dijumlah atau dikurangi.',
      'Hasil disederhanakan, dan bila lebih dari 1 ditulis sebagai pecahan campuran.',
    ],
    nextLabel: 'Lanjut ke Lab Pita →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENYELIDIKAN B: LAB PITA, PENYEBUT BERBEDA
     ---------------------------------------------------------- */
  selidikBeda: {
    kicker: 'Tahap 4 · Penyelidikan B — Lab Pita',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menemukan bahwa penyebut perlu disamakan (dengan KPK) sebelum pecahan dijumlah atau dikurangi.',
    guru: 'Biarkan kelompok mencoba potongan yang "tidak pas" dulu. Tanyakan: "Kenapa ada potongan yang hanya terarsir sebagian?" Hubungkan bilangan yang pas dengan kelipatan persekutuan, dan yang paling hemat dengan KPK.',
    judul: 'Lab Pita: potong supaya pas',
    instruksi:
      'Pilih menjadi berapa potongan sama besar setiap 1 utuh dipotong. Potongan yang pas untuk kedua pita membuat keduanya bisa digabung atau diambil. Setelah pas, tulis hasilnya.',
    percobaan: [
      {
        id: 'sb1',
        a: '1/2',
        op: '+',
        b: '1/3',
        cerita: 'Hiasan pita: {1/2} m merah dan {1/3} m putih disambung.',
        satuan: 'm',
        hints: ['Dengan 6 potong per utuh: 1/2 = 3/6 dan 1/3 = 2/6.', '3/6 + 2/6 = … /6'],
        temuan: '1/2 + 1/3 = 3/6 + 2/6 = 5/6. Penyebut disamakan menjadi 6 (KPK 2 dan 3).',
      },
      {
        id: 'sb2',
        a: '3/4',
        op: '-',
        b: '1/6',
        cerita: 'Ada {3/4} L sirup; {1/6} L dipakai untuk mencicipi.',
        satuan: 'L',
        hints: ['KPK 4 dan 6 adalah 12: 3/4 = 9/12 dan 1/6 = 2/12.', '9/12 − 2/12 = … /12'],
        temuan: '3/4 − 1/6 = 9/12 − 2/12 = 7/12.',
      },
      {
        id: 'sb3',
        a: '2/3',
        op: '+',
        b: '1/4',
        cerita: 'Meja: {2/3} bagian untuk kue basah dan {1/4} bagian untuk kue kering.',
        satuan: 'meja',
        hints: ['KPK 3 dan 4 adalah 12: 2/3 = 8/12 dan 1/4 = 3/12.', '8/12 + 3/12 = … /12'],
        temuan: '2/3 + 1/4 = 8/12 + 3/12 = 11/12.',
      },
    ],
    amati: [
      {
        id: 'amBeda1',
        tanya: 'Banyak potongan per utuh yang selalu pas untuk kedua pita adalah …',
        opsi: [
          { id: 'kelipatan', label: 'Kelipatan persekutuan kedua penyebut' },
          { id: 'jumlah', label: 'Jumlah kedua penyebut' },
          { id: 'besar', label: 'Penyebut yang paling besar' },
        ],
        correct: 'kelipatan',
        umpan: {
          kelipatan:
            'Benar! Potongan harus bisa membagi habis kedua pita, jadi habis dibagi kedua penyebut.',
          jumlah: 'Ingat percobaan {1/2} + {1/3}: 5 potong per utuh ternyata tidak pas.',
          besar: 'Untuk {1/2} + {1/3}, 3 potong per utuh tidak pas untuk pita {1/2}.',
        },
      },
      {
        id: 'amBeda2',
        tanya: 'Mengapa KPK menjadi pilihan paling praktis?',
        opsi: [
          {
            id: 'kecil',
            label: 'Bilangannya paling kecil, jadi hitungan & penyederhanaan lebih ringan',
          },
          { id: 'hanya', label: 'Hanya KPK yang memberi hasil benar' },
          { id: 'besar', label: 'KPK membuat hasilnya lebih besar' },
        ],
        correct: 'kecil',
        umpan: {
          kecil:
            'Tepat! Kelipatan lain juga benar, tetapi hasilnya perlu disederhanakan lebih jauh.',
          hanya: 'Coba ingat: 12 potong untuk {1/2} + {1/3} juga pas, hasilnya 10/12 = 5/6.',
          besar: 'Nilai hasil tidak berubah, berapa pun potongan yang pas.',
        },
      },
    ],
    temuan: [
      'Penyebut berbeda harus disamakan dulu agar ukuran potongannya sama.',
      'Penyebut bersama = kelipatan persekutuan; yang paling praktis adalah KPK.',
      'Pembilang ikut dikalikan dengan bilangan yang sama seperti penyebutnya (pecahan senilai).',
    ],
    nextLabel: 'Lanjut ke Pecahan Campuran & Negatif →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENYELIDIKAN C: CAMPURAN & NEGATIF
     ---------------------------------------------------------- */
  selidikCampuran: {
    kicker: 'Tahap 5 · Penyelidikan C — Campuran & Negatif',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menjumlahkan dan mengurangkan pecahan campuran dan pecahan negatif dalam konteks.',
    guru: 'Bandingkan dua cara: (1) ubah ke pecahan biasa, (2) pisahkan bilangan bulat dan pecahan. Soroti kasus meminjam 1 utuh. Untuk bagian negatif, minta murid menunjuk posisi di garis bilangan sebelum menghitung.',
    judulA: 'A. Pecahan campuran',
    instruksiA:
      'Kamu boleh mengubah ke pecahan biasa lebih dulu, atau memisahkan bilangan bulat dan pecahannya.',
    campuran: [
      {
        id: 'sc1',
        a: '2 1/2',
        op: '-',
        b: '3/4',
        label: 'Tepung {2 1/2} kg dipakai {3/4} kg untuk bolu. Sisanya: {2 1/2} − {3/4} = …',
        satuan: 'kg',
        hints: [
          'Ubah ke pecahan biasa: 2 1/2 = 5/2 = 10/4.',
          '10/4 − 3/4 = 7/4. Tulis sebagai pecahan campuran.',
        ],
        temuan: '2 1/2 − 3/4 = 10/4 − 3/4 = 7/4 = 1 3/4.',
      },
      {
        id: 'sc2',
        a: '1 2/3',
        op: '+',
        b: '2 1/2',
        label: 'Kain {1 2/3} m dan {2 1/2} m disambung. Panjangnya: {1 2/3} + {2 1/2} = …',
        satuan: 'm',
        hints: [
          'Bilangan bulat: 1 + 2 = 3. Pecahan: 2/3 + 1/2 = 4/6 + 3/6.',
          '7/6 = 1 1/6, jadi 3 + 1 1/6 = …',
        ],
        temuan: '1 2/3 + 2 1/2 = 3 + 7/6 = 3 + 1 1/6 = 4 1/6.',
      },
      {
        id: 'sc3',
        a: '3 1/4',
        op: '-',
        b: '1 3/4',
        label: 'Pita {3 1/4} m dipotong {1 3/4} m. Sisanya: {3 1/4} − {1 3/4} = …',
        satuan: 'm',
        hints: [
          '1/4 lebih kecil dari 3/4, jadi pinjam 1 utuh: 3 1/4 = 2 5/4.',
          '2 5/4 − 1 3/4 = 1 2/4 = …',
        ],
        temuan: '3 1/4 − 1 3/4 = 2 5/4 − 1 3/4 = 1 2/4 = 1 1/2 (meminjam 1 utuh).',
      },
    ],
    cara: [
      {
        id: 'cara1',
        tanya: 'Sinta menulis {3 1/4} − {1 3/4} = {2 2/4}. Di mana kelirunya?',
        opsi: [
          {
            id: 'pinjam',
            label: 'Ia mengurangi 3/4 − 1/4 (terbalik) dan tidak meminjam 1 utuh',
          },
          { id: 'bulat', label: 'Bilangan bulatnya seharusnya dijumlah' },
          { id: 'benar', label: 'Tidak ada yang keliru' },
        ],
        correct: 'pinjam',
        umpan: {
          pinjam: 'Tepat! 1/4 − 3/4 tidak bisa langsung, jadi 3 1/4 diubah menjadi 2 5/4 dulu.',
          bulat: 'Pada pengurangan, bilangan bulatnya juga dikurangi: 3 − 1.',
          benar: 'Cek dengan cara pecahan biasa: 13/4 − 7/4 = 6/4 = 1 1/2, bukan 2 1/2.',
        },
      },
      {
        id: 'cara2',
        tanya: 'Cara mana yang SELALU bisa dipakai untuk pecahan campuran?',
        opsi: [
          { id: 'biasa', label: 'Mengubah semua suku ke pecahan biasa lebih dulu' },
          { id: 'bulatSaja', label: 'Menghitung bilangan bulatnya saja' },
          { id: 'buang', label: 'Mengabaikan bilangan bulat' },
        ],
        correct: 'biasa',
        umpan: {
          biasa:
            'Benar! Cara memisah juga bisa, tetapi kadang perlu meminjam; cara pecahan biasa selalu berhasil.',
          bulatSaja: 'Bagian pecahannya juga harus dihitung.',
          buang: 'Bilangan bulat adalah bagian dari nilai pecahan campuran.',
        },
      },
    ],
    judulB: 'B. Pecahan negatif: kolam lomba memancing',
    instruksiB:
      'Panitia mencatat tinggi permukaan air kolam terhadap batas normal (0). Di bawah batas ditulis negatif.',
    garis: { min: -1, max: 2, ticks: 4 },
    negatif: [
      {
        id: 'sn1',
        a: '-3/4',
        op: '+',
        b: '1 1/2',
        label:
          'Pagi hari permukaan air −{3/4} m. Kolam diisi sehingga naik {1 1/2} m. Tinggi sekarang: −{3/4} + {1 1/2} = …',
        satuan: 'm',
        hints: [
          'Mulai di −3/4 pada garis bilangan, lalu bergerak ke kanan 1 1/2 = 6/4.',
          '−3/4 + 6/4 = 3/4',
        ],
        temuan: '−3/4 + 1 1/2 = −3/4 + 6/4 = 3/4 m, di atas batas normal.',
      },
      {
        id: 'sn2',
        a: '3/4',
        op: '-',
        b: '1 1/4',
        label: 'Sore hari air dipakai sehingga turun {1 1/4} m. Tinggi akhir: {3/4} − {1 1/4} = …',
        satuan: 'm',
        hints: [
          'Mulai di 3/4, bergerak ke kiri 1 1/4 = 5/4.',
          '3/4 − 5/4 = −2/4. Sederhanakan dan perhatikan tandanya.',
        ],
        temuan: '3/4 − 1 1/4 = 3/4 − 5/4 = −2/4 = −1/2 m, di bawah batas normal.',
      },
    ],
    tanyaNeg: [
      {
        id: 'neg1',
        tanya: 'Tinggi air −{1/2} m artinya …',
        opsi: [
          { id: 'bawah', label: 'Permukaan air {1/2} m di bawah batas normal' },
          { id: 'atas', label: 'Permukaan air {1/2} m di atas batas normal' },
          { id: 'kosong', label: 'Kolam kosong' },
        ],
        correct: 'bawah',
        umpan: {
          bawah: 'Benar! Tanda negatif berarti di bawah titik acuan (0).',
          atas: 'Di atas batas normal ditulis positif. Perhatikan tanda −.',
          kosong: 'Batas normal (0) bukan dasar kolam. Airnya masih ada.',
        },
      },
    ],
    temuan: [
      'Pecahan campuran: ubah ke pecahan biasa, atau pisahkan bulat dan pecahan (pinjam 1 utuh bila perlu).',
      'Menambah bilangan positif = bergerak ke kanan; mengurangi = bergerak ke kiri pada garis bilangan.',
      'Hasil bisa negatif bila yang dikurangi lebih besar; tanda − tetap ditulis.',
    ],
    nextLabel: 'Susun Papan Solusi →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGEMBANGKAN & MENYAJIKAN KARYA (PBL sintaks 4)
     Langkah berantai: `dari` = suku kedua adalah hasil langkah itu.
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 6 · Menyajikan Hasil Karya',
    syntax: PBL + ' · Sintaks 4',
    goal: 'Menyelesaikan masalah stand langkah demi langkah dan menyajikannya di Papan Solusi.',
    guru: 'Kelompok bekerja sesuai peran: pencatat menulis kalimat, penghitung menghitung, pemeriksa mengecek kewajaran. Beri waktu ±2 menit per kelompok untuk presentasi Papan Solusi.',
    judul: 'Papan Solusi Stand 7C',
    instruksi: 'Selesaikan setiap langkah. Hasil langkah sebelumnya dipakai di langkah berikutnya.',
    langkah: [
      {
        id: 'k1',
        bagian: 'tepung',
        a: '3/4',
        op: '+',
        b: '1 1/3',
        label: 'Tepung yang dibutuhkan bolu dan donat: {3/4} + {1 1/3} = …',
        satuan: 'kg',
        hints: [
          'Ubah 1 1/3 = 4/3, lalu samakan penyebut 4 dan 3 menjadi 12.',
          '9/12 + 16/12 = 25/12',
        ],
      },
      {
        id: 'k2',
        bagian: 'tepung',
        a: '2 1/2',
        op: '-',
        b: '2 1/12',
        dari: 'k1',
        label: 'Sisa tepung: {2 1/2} − {2 1/12} = …',
        satuan: 'kg',
        hints: ['2 1/2 = 2 6/12.', '2 6/12 − 2 1/12 = …'],
      },
      {
        id: 'k3',
        bagian: 'pita',
        a: '1 3/4',
        op: '+',
        b: '2 1/2',
        label: 'Pita yang dipakai meja dan spanduk: {1 3/4} + {2 1/2} = …',
        satuan: 'm',
        hints: ['Bulat: 1 + 2 = 3. Pecahan: 3/4 + 2/4 = 5/4 = 1 1/4.', '3 + 1 1/4 = …'],
      },
      {
        id: 'k4',
        bagian: 'pita',
        a: '5',
        op: '-',
        b: '4 1/4',
        dari: 'k3',
        label: 'Sisa pita dari satu gulung: 5 − {4 1/4} = …',
        satuan: 'm',
        hints: ['Tulis 5 = 4 4/4.', '4 4/4 − 4 1/4 = …'],
      },
      {
        id: 'k5',
        bagian: 'meja',
        a: '1/3',
        op: '+',
        b: '1/4',
        label: 'Bagian meja untuk kue dan minuman: {1/3} + {1/4} = …',
        satuan: 'meja',
        hints: ['KPK 3 dan 4 adalah 12.', '4/12 + 3/12 = …'],
      },
      {
        id: 'k6',
        bagian: 'meja',
        a: '1',
        op: '-',
        b: '7/12',
        dari: 'k5',
        label: 'Bagian meja untuk kerajinan: 1 − {7/12} = …',
        satuan: 'meja',
        hints: ['Satu meja utuh = 12/12.', '12/12 − 7/12 = …'],
      },
    ],
    keputusan: [
      {
        id: 'kpTepung',
        tanya: 'Jadi, apa keputusan kelompok tentang tepung?',
        opsi: [
          { id: 'cukup', label: 'Tepung cukup; masih bersisa {5/12} kg' },
          { id: 'beli', label: 'Harus membeli tepung lagi {5/12} kg' },
          { id: 'pas', label: 'Tepung pas, tidak bersisa' },
        ],
        correct: 'cukup',
        umpan: {
          cukup: 'Tepat! 2 1/12 kg < 2 1/2 kg, jadi tepung cukup dan bersisa 5/12 kg.',
          beli: 'Sisa 5/12 kg itu positif — artinya tepung lebih, bukan kurang.',
          pas: 'Hasil pengurangannya 5/12, bukan 0.',
        },
      },
      {
        id: 'kpCek',
        tanya: 'Pemeriksa mengecek: mengapa sisa pita {3/4} m masuk akal?',
        opsi: [
          { id: 'kurang1', label: 'Pemakaian 4 1/4 m hampir 5 m, jadi sisanya kurang dari 1 m' },
          { id: 'lebih', label: 'Sisa pita selalu lebih dari 1 m' },
          { id: 'tebak', label: 'Karena 3/4 adalah pecahan yang sering muncul' },
        ],
        correct: 'kurang1',
        umpan: {
          kurang1: 'Benar! Estimasi kasar seperti ini menjaga hasil tetap wajar.',
          lebih: 'Tidak selalu — tergantung berapa yang dipakai.',
          tebak: 'Kewajaran dicek dengan estimasi, bukan kebiasaan.',
        },
      },
    ],
    pesanLabel: 'Pesan kelompok untuk Bu Ratna (saran berdasarkan hasil hitungan)',
    pesanPlaceholder: 'Contoh: Tepung cukup, sisa 5/12 kg bisa dipakai untuk …',
    nextLabel: 'Lanjut ke Evaluasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENGANALISIS & MENGEVALUASI (PBL sintaks 5)
     Kategori cek → kode diagnosaOperasiPecahan (diuji).
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 7 · Analisis & Evaluasi',
    syntax: PBL + ' · Sintaks 5',
    goal: 'Menilai solusi kelompok lain, mengecek kewajaran, dan menyimpulkan langkah yang benar.',
    guru: 'Jadikan bagian detektif sebagai diskusi kelas: setiap kelompok menjelaskan satu kekeliruan. Bandingkan dugaan awal dengan hasil penyelidikan — hargai dugaan yang terkoreksi.',
    judulA: 'Detektif Solusi: periksa jawaban kelompok lain',
    opsiCek: [
      { id: 'benar', label: '✓ Benar' },
      { id: 'penyebut', label: 'Penyebut ikut dijumlah/dikurang' },
      { id: 'pembilang', label: 'Pembilang tidak ikut dikalikan' },
      { id: 'pinjam', label: 'Lupa meminjam 1 utuh' },
    ],
    kodeCek: {
      benar: 'benar',
      penyebut: 'penyebut-dijumlah',
      pembilang: 'pembilang-tidak-diubah',
      pinjam: 'meminjam',
    },
    cek: [
      {
        id: 'e1',
        kelompok: 'Kelompok Melati',
        a: '1/3',
        op: '+',
        b: '1/4',
        jawab: '2/7',
        correct: 'penyebut',
        explanation: 'Seharusnya 4/12 + 3/12 = 7/12. 2/7 bahkan lebih kecil dari 1/3.',
      },
      {
        id: 'e2',
        kelompok: 'Kelompok Mawar',
        a: '1/2',
        op: '+',
        b: '1/3',
        jawab: '2/6',
        correct: 'pembilang',
        explanation: 'Penyebut 6 sudah benar, tetapi 1/2 = 3/6 dan 1/3 = 2/6, jadi hasilnya 5/6.',
      },
      {
        id: 'e3',
        kelompok: 'Kelompok Anggrek',
        a: '3 1/4',
        op: '-',
        b: '1 3/4',
        jawab: '2 1/2',
        correct: 'pinjam',
        explanation: '3 1/4 = 2 5/4, jadi 2 5/4 − 1 3/4 = 1 2/4 = 1 1/2.',
      },
      {
        id: 'e4',
        kelompok: 'Kelompok Tulip',
        a: '3/4',
        op: '+',
        b: '1 1/3',
        jawab: '2 1/12',
        correct: 'benar',
        explanation: '9/12 + 16/12 = 25/12 = 2 1/12. Penyebut disamakan dengan benar.',
      },
      {
        id: 'e5',
        kelompok: 'Kelompok Kenanga',
        a: '2/5',
        op: '+',
        b: '1/5',
        jawab: '3/10',
        correct: 'penyebut',
        explanation: 'Penyebutnya sudah sama, jadi tetap 5: 2/5 + 1/5 = 3/5.',
      },
      {
        id: 'e6',
        kelompok: 'Kelompok Dahlia',
        a: '5',
        op: '-',
        b: '4 1/4',
        jawab: '3/4',
        correct: 'benar',
        explanation: '5 = 4 4/4, jadi 4 4/4 − 4 1/4 = 3/4.',
      },
    ],
    judulB: 'Cek kewajaran dengan estimasi',
    estimasi: [
      {
        id: 'es1',
        tanya: 'Tanpa menghitung teliti, {3/4} + {1 1/3} pasti …',
        opsi: [
          {
            id: 'antara23',
            label: 'antara 2 dan 3, karena 3/4 hampir 1 dan 1 1/3 sedikit di atas 1',
          },
          { id: 'kurang1', label: 'kurang dari 1' },
          { id: 'antara12', label: 'antara 1 dan 2' },
          { id: 'lebih3', label: 'lebih dari 3' },
        ],
        correct: 'antara23',
        umpan: {
          antara23: 'Tepat! Hasil teliti 2 1/12 cocok dengan estimasi.',
          kurang1: 'Satu sukunya saja sudah lebih dari 1.',
          antara12: '3/4 + 1 1/3 lebih dari 3/4 + 1 1/4 = 2. Coba estimasi lagi.',
          lebih3: 'Kedua suku masing-masing kurang dari 1 1/2, jadi jumlahnya kurang dari 3.',
        },
      },
      {
        id: 'es2',
        tanya: 'Jawaban {1/3} + {1/4} = {2/7} tidak wajar karena …',
        opsi: [
          { id: 'kecil', label: '2/7 lebih kecil daripada 1/3, padahal ada yang ditambahkan' },
          { id: 'ganjil', label: 'Penyebut hasil harus genap' },
          { id: 'satu', label: 'Hasil penjumlahan pecahan selalu lebih dari 1' },
        ],
        correct: 'kecil',
        umpan: {
          kecil: 'Benar! Hasil penjumlahan bilangan positif harus lebih besar dari tiap sukunya.',
          ganjil: 'Penyebut boleh ganjil. Bandingkan besar 2/7 dengan 1/3.',
          satu: 'Tidak selalu: 1/3 + 1/4 = 7/12 kurang dari 1.',
        },
      },
    ],
    judulC: 'Dugaan awal vs hasil penyelidikan',
    judulD: 'Susun simpulan kelompok',
    instruksiD:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan dipakai sekali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      {
        id: 'k1',
        awal: 'Sebelum menjumlahkan atau mengurangkan pecahan berpenyebut berbeda,',
        correct: 'samakan',
      },
      { id: 'k2', awal: 'Setelah penyebutnya sama,', correct: 'pembilang' },
      {
        id: 'k3',
        awal: 'Pada pengurangan pecahan campuran yang bagian pecahannya lebih kecil,',
        correct: 'pinjam',
      },
      { id: 'k4', awal: 'Hasil akhir', correct: 'sederhana' },
    ],
    bank: [
      { id: 'samakan', teks: 'samakan penyebutnya dengan KPK.' },
      { id: 'pembilang', teks: 'hanya pembilang yang dijumlah atau dikurang.' },
      { id: 'pinjam', teks: 'pinjam 1 utuh atau ubah ke pecahan biasa.' },
      { id: 'sederhana', teks: 'ditulis dalam bentuk paling sederhana dan dicek kewajarannya.' },
      { id: 'jumlahPenyebut', teks: 'jumlahkan juga penyebutnya.' },
      { id: 'abaikan', teks: 'abaikan bilangan bulatnya.' },
    ],
    rangkuman: [
      'Penyebut sama: a/c ± b/c = (a ± b)/c.',
      'Penyebut berbeda: samakan dengan KPK, pembilang ikut dikalikan, lalu hitung pembilangnya.',
      'Pecahan campuran: ubah ke pecahan biasa atau pisahkan bulat & pecahan (pinjam 1 utuh bila perlu).',
      'Pecahan negatif: gunakan garis bilangan; perhatikan tanda hasil.',
      'Selalu sederhanakan hasil dan cek kewajarannya dengan estimasi.',
    ],
    nextLabel: 'Uji Diri →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP: soal acak dari bank.
     choice + a/op/b → opsi dibuat engine (opsiOperasiPecahan);
     choice + options → kalimat matematika (benar = fmtOperasiPecahan).
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: PBL + ' · Masalah baru',
    goal: 'Menerapkan penjumlahan dan pengurangan pecahan pada masalah baru secara mandiri.',
    guru: 'Murid bekerja mandiri. Amati soal yang paling sering memunculkan diagnosa yang sama sebagai bahan penguatan pertemuan berikutnya.',
    instruksi: 'Kerjakan 8 soal yang dipilih acak. Tulis pecahan seperti 3/4, 1 1/2, atau −1/2.',
    banyak: 8,
    komposisi: { choice: 5, input: 3 },
    soal: [
      {
        id: 't1',
        type: 'choice',
        a: '1 1/2',
        op: '-',
        b: '3/4',
        cerita: 'Ibu membeli {1 1/2} kg gula dan memakai {3/4} kg untuk membuat kolak.',
        pertanyaan: 'Berapa kilogram sisa gula?',
        explanation: '1 1/2 − 3/4 = 6/4 − 3/4 = 3/4 kg.',
      },
      {
        id: 't2',
        type: 'choice',
        a: '2/3',
        op: '+',
        b: '3/4',
        cerita: 'Rani berlari {2/3} km, lalu berjalan {3/4} km.',
        pertanyaan: 'Berapa kilometer jarak yang ditempuh Rani seluruhnya?',
        explanation: '2/3 + 3/4 = 8/12 + 9/12 = 17/12 = 1 5/12 km.',
      },
      {
        id: 't3',
        type: 'choice',
        a: '1 1/4',
        op: '-',
        b: '2/3',
        cerita: 'Sebuah botol berisi {1 1/4} L sirup. Sebanyak {2/3} L dituang ke gelas-gelas.',
        pertanyaan: 'Berapa liter sirup yang tersisa di botol?',
        explanation: '1 1/4 − 2/3 = 15/12 − 8/12 = 7/12 L.',
      },
      {
        id: 't4',
        type: 'choice',
        a: '2/5',
        op: '+',
        b: '1/3',
        cerita: 'Kebun sekolah: {2/5} bagian ditanami cabai dan {1/3} bagian ditanami tomat.',
        pertanyaan: 'Berapa bagian kebun yang sudah ditanami?',
        explanation: '2/5 + 1/3 = 6/15 + 5/15 = 11/15 bagian.',
      },
      {
        id: 't5',
        type: 'choice',
        a: '-1/2',
        op: '+',
        b: '1 3/4',
        cerita:
          'Suhu dalam lemari pendingin −{1/2} °C. Saat pintunya terbuka, suhunya naik {1 3/4} °C.',
        pertanyaan: 'Berapa suhu lemari pendingin sekarang?',
        explanation: '−1/2 + 1 3/4 = −2/4 + 7/4 = 5/4 = 1 1/4 °C.',
      },
      {
        id: 't6',
        type: 'choice',
        a: '1 1/6',
        op: '+',
        b: '5/6',
        cerita: 'Ani mengerjakan PR selama {1 1/6} jam, lalu membaca buku {5/6} jam.',
        pertanyaan: 'Berapa jam Ani belajar seluruhnya?',
        explanation: '1 1/6 + 5/6 = 1 6/6 = 2 jam.',
      },
      {
        id: 't7',
        type: 'choice',
        a: '-1/4',
        op: '-',
        b: '2/3',
        cerita:
          'Permukaan air kolam berada {1/4} m di bawah batas normal, lalu turun lagi {2/3} m karena kemarau.',
        pertanyaan: 'Kalimat matematika yang tepat untuk tinggi permukaan air sekarang adalah …',
        options: [
          { id: 'benar', label: '−1/4 − 2/3' },
          { id: 'tambah', label: '−1/4 + 2/3' },
          { id: 'positif', label: '1/4 − 2/3' },
          { id: 'jumlah', label: '1/4 + 2/3' },
        ],
        correct: 'benar',
        explanation:
          'Mulai dari −1/4 (di bawah batas), turun berarti dikurangi: −1/4 − 2/3 = −11/12 m.',
      },
      {
        id: 't8',
        type: 'choice',
        a: '2 1/2',
        op: '-',
        b: '3/4',
        cerita: 'Galon berisi {2 1/2} L air. Sebanyak {3/4} L dipakai untuk menyiram tanaman.',
        pertanyaan: 'Kalimat matematika untuk sisa air adalah …',
        options: [
          { id: 'benar', label: '2 1/2 − 3/4' },
          { id: 'tambah', label: '2 1/2 + 3/4' },
          { id: 'balik', label: '3/4 − 2 1/2' },
          { id: 'negatif', label: '−2 1/2 − 3/4' },
        ],
        correct: 'benar',
        explanation: 'Sisa = isi awal − yang dipakai: 2 1/2 − 3/4 = 1 3/4 L.',
      },
      {
        id: 'i1',
        type: 'input',
        a: '2 1/4',
        op: '-',
        b: '1 2/3',
        satuan: 'km',
        cerita: 'Jarak rumah ke sekolah {2 1/4} km. Dodi sudah bersepeda {1 2/3} km.',
        pertanyaan: 'Berapa kilometer lagi yang harus ditempuh Dodi?',
        hints: ['Ubah ke pecahan biasa: 9/4 − 5/3.', 'Samakan penyebut 12: 27/12 − 20/12.'],
        explanation: 'Penyebut disamakan menjadi 12.',
      },
      {
        id: 'i2',
        type: 'input',
        a: '3/4',
        op: '+',
        b: '2/3',
        satuan: 'gelas',
        cerita: 'Resep kue membutuhkan {3/4} gelas santan dan {2/3} gelas air.',
        pertanyaan: 'Berapa gelas cairan yang dibutuhkan seluruhnya?',
        hints: ['KPK 4 dan 3 adalah 12.', '9/12 + 8/12 = 17/12'],
        explanation: 'Hasil lebih dari 1 ditulis sebagai pecahan campuran.',
      },
      {
        id: 'i3',
        type: 'input',
        a: '-2 1/2',
        op: '+',
        b: '3 3/4',
        satuan: 'ratus ribu rupiah',
        cerita:
          'Kas kelas tercatat −{2 1/2} ratus ribu rupiah (berutang). Hasil bazar menambah kas {3 3/4} ratus ribu rupiah.',
        pertanyaan: 'Berapa kas kelas sekarang?',
        hints: ['−2 1/2 = −10/4 dan 3 3/4 = 15/4.', '−10/4 + 15/4 = 5/4'],
        explanation: 'Kas kembali positif.',
      },
      {
        id: 'i4',
        type: 'input',
        a: '4',
        op: '-',
        b: '2 5/6',
        satuan: 'm',
        cerita: 'Sebatang kayu panjangnya 4 m dipotong {2 5/6} m untuk rak.',
        pertanyaan: 'Berapa meter sisa kayu?',
        hints: ['Tulis 4 = 3 6/6.', '3 6/6 − 2 5/6 = …'],
        explanation: 'Bilangan bulat 4 ditulis sebagai 3 6/6 agar bisa dikurangi.',
      },
      {
        id: 'i5',
        type: 'input',
        a: '-1 1/3',
        op: '+',
        b: '5/6',
        satuan: 'm',
        cerita:
          'Seorang penyelam berada {1 1/3} m di bawah permukaan air (−{1 1/3} m), lalu naik {5/6} m.',
        pertanyaan: 'Di posisi berapa penyelam sekarang?',
        hints: ['−1 1/3 = −8/6.', '−8/6 + 5/6 = −3/6. Sederhanakan.'],
        explanation: 'Penyelam masih di bawah permukaan, jadi hasilnya negatif.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan strategi, kekeliruan yang pernah terjadi, dan tingkat keyakinan.',
    guru: 'Minta 2–3 murid membacakan refleksinya. Catat miskonsepsi yang masih muncul untuk pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Mengapa penyebut perlu disamakan sebelum pecahan dijumlahkan? Jelaskan dengan kata-katamu sendiri.',
        placeholder: 'Karena penyebut menunjukkan …',
      },
      {
        id: 'r2',
        teks: 'Kekeliruan apa yang pernah kamu lakukan hari ini, dan bagaimana kamu memperbaikinya?',
        placeholder: 'Awalnya saya … lalu saya sadar …',
      },
      {
        id: 'r3',
        teks: 'Di mana lagi kamu menjumpai penjumlahan atau pengurangan pecahan di kehidupan sehari-hari?',
        placeholder: 'Misalnya saat memasak …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menjumlahkan dan mengurangkan pecahan sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin, bisa menjelaskan ke teman' },
      { id: 'yakin', label: '🙂 Yakin, sesekali masih perlu melihat catatan' },
      { id: 'ragu', label: '🤔 Masih ragu pada pecahan campuran/negatif' },
      { id: 'bantuan', label: '🙋 Masih perlu bantuan guru' },
    ],
    nextLabel: 'Selesai ✓',
  },

  selesai: {
    judul: 'Hebat! Stand 7C siap dibuka.',
    teks: 'Kamu sudah memakai penjumlahan dan pengurangan pecahan untuk mengambil keputusan nyata.',
    capaian: [
      'Menjumlahkan dan mengurangkan pecahan berpenyebut sama dan berbeda.',
      'Menyamakan penyebut dengan KPK dan menyederhanakan hasil.',
      'Mengoperasikan pecahan campuran (termasuk meminjam 1 utuh) dan pecahan negatif.',
      'Menyusun dan mempresentasikan solusi masalah kontekstual.',
    ],
    contoh: [
      { ikon: '🌾', nama: 'Sisa tepung', a: '2 1/2', op: '-', b: '2 1/12', satuan: 'kg' },
      { ikon: '🎀', nama: 'Sisa pita', a: '5', op: '-', b: '4 1/4', satuan: 'm' },
      { ikon: '🧶', nama: 'Meja kerajinan', a: '1', op: '-', b: '7/12', satuan: 'meja' },
    ],
  },
};
