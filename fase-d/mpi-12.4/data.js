'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Operasi Hitung Bentuk Akar
   Fase D — SMP Kelas VIII · Topik 12 Bilangan Berpangkat dan Bentuk Akar

   Tujuan Pembelajaran:
   Melakukan operasi hitung (penjumlahan, pengurangan, perkalian,
   pembagian, dan merasionalkan penyebut) pada bentuk akar.

   Prasyarat: fase-d/mpi-12.3 (bentuk akar ⇄ pangkat pecahan,
   menyederhanakan bentuk akar, mis. √72 = 6√2).

   Gagasan kunci yang dibangun di seluruh modul:
     • bentuk akar diperlakukan seperti variabel aljabar: √3 berperan
       seperti x, sehingga 2√3 + 5√3 = 7√3 (hanya suku SEJENIS);
     • suku yang tampak berbeda bisa sejenis setelah disederhanakan
       (√12 + √27 = 2√3 + 3√3 = 5√3), dan sebaliknya (√8 + √12 tidak);
     • a√b × c√d = (a × c)√(b × d) dan a√b : c√d = (a : c)√(b : d),
       lalu hasilnya disederhanakan; √a × √a = a;
     • merasionalkan: a/√b × √b/√b = a√b/b (dikali 1, nilai tetap);
       a/(p ± √q) dikali sekawan p ∓ √q karena (p + √q)(p − √q) = p² − q;
     • miskonsepsi yang dilawan: √a + √b = √(a + b), koefisien dikalikan
       pada penjumlahan, radikan dijumlahkan pada perkalian, radikan
       dikurangkan pada pembagian, penyebut tidak ikut dikalikan,
       √b × √b = b², dan tanda sekawan tidak dibalik.

   Model pembelajaran: COOPERATIVE LEARNING tipe JIGSAW (sintaks Arends,
   dengan skor tim ala STAD). Pemetaan sintaks ke tahap media:

     Fase 1 — Menyampaikan tujuan & memotivasi ........ 'tujuan'
     Fase 2 — Menyajikan informasi ..................... 'informasi'
     Fase 3 — Mengorganisasikan murid ke tim asal ...... 'tim'
     Fase 4 — Membimbing kelompok bekerja & belajar:
              a. kelompok ahli + mengajar tim asal ..... 'ahli'
              b. misi tim asal ......................... 'misiOperasi',
                                                         'misiKonteks'
              c. diskusi tim ........................... 'misiDiskusi'
     Fase 5 — Evaluasi (individu) ...................... 'kuis'
     Fase 6 — Memberikan penghargaan ................... 'penghargaan'
     Penutup ........................................... 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, tim asal heterogen 4 murid,
   satu perangkat per tim; kuis dikerjakan per murid):
     1. Tujuan      (6')  — "Kebun Sekolah": pagar dua petak persegi
                            (√50 + √18), luas bedeng (√8 × √2), lebar
                            petak (6/√3). Tim MENDUGA hasilnya (tidak
                            dinilai; dicek setelah tahap ahli).
     2. Informasi   (7')  — √a × √a = a, menyederhanakan akar, analogi
                            suku sejenis 2x + 5x, bilangan irasional;
                            pertanyaan penuntun berdiagnosa.
     3. Tim asal    (4')  — nama tim, anggota, kesepakatan; EMPAT kartu
                            AHLI (penjumlahan & pengurangan, perkalian,
                            pembagian, merasionalkan penyebut) dibagikan
                            acak. Anggota ke-5 menjadi pendamping ahli.
     4. Ahli        (20') — Jigsaw: tiap ahli berkumpul dengan ahli
                            sejenis dari tim lain, menguji nilai dengan
                            bilangan kuadrat sempurna (mis. √9 + √16 vs
                            √(9 + 16)), menemukan aturannya, lalu kembali
                            MENGAJARI tim asal dan memandu dua soal
                            stasiun berdiagnosa.
     5. Misi 1      (12') — "Bengkel Akar": delapan soal campuran. Pilih
                            strategi (termasuk jebakan tidak sejenis dan
                            sekawan) → ahli strategi itu memimpin → isi
                            hasil paling sederhana (diagnosa).
     6. Misi 2      (10') — "Proyek Kebun": lima soal kontekstual
                            (pagar, bedeng, tali, papan nama, lahan)
                            diselesaikan langkah demi langkah.
     7. Misi 3      (6')  — "Cek Pendapat Teman": delapan pernyataan
                            Benar/Salah berisi miskonsepsi + catatan Juru
                            Bicara.
     8. Kuis        (10') — kuis individu: tujuh soal diambil acak dari
                            bank empat belas soal.
     9. Penghargaan (2')  — poin tim (50% misi + 50% kuis) → predikat.
    10. Refleksi    (3')  — refleksi konsep & kerja sama, penilaian diri.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban benar sering di depan). app.js
   mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray / ensureOpAkarStepState dari
   shared/engine.js) sehingga tiap tim dan tiap Reset mendapat urutan
   berbeda — termasuk dugaan, penuntun, kesimpulan stasiun ahli,
   pilihan strategi di setiap langkah, pernyataan diskusi, soal kuis yang
   terpilih beserta opsinya, dan penilaian diri.

   Notasi teks: √ untuk akar kuadrat, mis. '3√2', '√(9 + 16)', '6/√3'.
   Teks dirender menjadi HTML oleh tulisAkarHTML().

   Konvensi soal operasi (engine seksi 46):
     { op: 'jumlah', suku: [{ k, r }] }           k bertanda (−1 = −√r)
     { op: 'kali' | 'bagi', a: { k, r }, b: { k, r } }
     { op: 'rasional', p, q: { k, r } }           p/(k√r)
     { op: 'sekawan', p, a, c, r }                p/(a + c√r), c = ±1
   Metadata `cek` pada dugaan, pernyataan, dan kuis dipakai
   tests/mpi-12.4-data.test.js untuk menghitung ulang kunci jawaban
   dengan hasilOperasiAkar & formatBentukAkar.
   ============================================================ */

var CL = 'Cooperative Learning (Jigsaw)';

var OPSI_BENAR_SALAH = [
  { id: 'benar', label: '✓ Benar' },
  { id: 'salah', label: '✗ Salah' },
];

var DATA = {
  meta: {
    judul: 'Operasi Hitung Bentuk Akar',
  },

  tahap: [
    { id: 'tujuan', label: 'Tujuan' },
    { id: 'informasi', label: 'Informasi' },
    { id: 'tim', label: 'Tim Asal' },
    { id: 'ahli', label: 'Ahli' },
    { id: 'misiOperasi', label: 'Misi 1' },
    { id: 'misiKonteks', label: 'Misi 2' },
    { id: 'misiDiskusi', label: 'Misi 3' },
    { id: 'kuis', label: 'Kuis' },
    { id: 'penghargaan', label: 'Penghargaan' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Peran bergilir pada setiap misi tim (buildCoopRoleBar). */
  peranMisi: [
    {
      id: 'pembaca',
      ikon: '📖',
      nama: 'Pembaca Soal',
      tugas: 'Membacakan soal dan menunjuk koefisien serta bilangan di dalam akar.',
    },
    {
      id: 'penulis',
      ikon: '✍️',
      nama: 'Penulis',
      tugas: 'Mengetuk pilihan dan mengetik jawaban setelah tim sepakat.',
    },
    {
      id: 'pemeriksa',
      ikon: '🔍',
      nama: 'Pemeriksa',
      tugas: 'Bertanya "Sudah paling sederhana? Semua setuju?" sebelum Periksa ditekan.',
    },
    {
      id: 'jubir',
      ikon: '🎤',
      nama: 'Juru Bicara',
      tugas: 'Menjelaskan alasan tim dengan kalimat sendiri.',
    },
  ],

  /* ---------- Fase 1: tujuan & motivasi ---------- */
  tujuan: {
    kicker: 'Tahap 1 · Tujuan & Motivasi',
    goal: 'Mengenali tujuan belajar dan menduga hasil operasi bentuk akar dalam masalah kebun sekolah.',
    syntax: CL + ' · Fase 1',
    guru: 'Ceritakan masalah Kebun Sekolah. Minta setiap murid menduga sendiri (1 menit), lalu bandingkan dengan teman satu tim. Banyak murid akan memilih √68 karena "50 + 18 = 68" — jangan dikoreksi dulu; dugaan dicek setelah para ahli selesai mengajar.',
    judul: 'Proyek Kebun Sekolah',
    pengantar:
      'Kelas VIII menata kebun sekolah. Luas setiap petak sudah diketahui, tetapi panjang sisinya berupa bentuk akar. Bagaimana cara menjumlahkan, mengalikan, dan membagi bentuk akar dengan tepat?',
    tp: 'Melakukan operasi hitung (penjumlahan, pengurangan, perkalian, pembagian, dan merasionalkan penyebut) pada bentuk akar.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menjumlahkan dan mengurangkan bentuk akar sejenis, termasuk yang harus disederhanakan lebih dulu.',
      'Mengalikan bentuk akar dan menyederhanakan hasilnya.',
      'Membagi bentuk akar dan menyederhanakan hasilnya.',
      'Merasionalkan penyebut berbentuk a/√b dan a/(p ± √q), lalu menerapkannya pada masalah kontekstual.',
    ],
    dugaan: [
      {
        id: 'dJumlah',
        ikon: '🌱',
        tanya:
          'Dua petak persegi seluas 50 m² dan 18 m² berjajar. Panjang sisi gabungannya = √50 + √18 = … m',
        opsi: [
          { id: 'a', label: '8√2' },
          { id: 'b', label: '√68' },
          { id: 'c', label: '15√2' },
          { id: 'd', label: '68' },
        ],
        kunci: 'a',
        cek: {
          op: 'jumlah',
          suku: [
            { k: 1, r: 50 },
            { k: 1, r: 18 },
          ],
        },
        penjelasan:
          '√50 + √18 = 5√2 + 3√2 = 8√2 m (≈ 11,3 m). Periksa dengan kalkulator: √68 ≈ 8,2 m, terlalu pendek!',
      },
      {
        id: 'dKali',
        ikon: '🧺',
        tanya: 'Sebuah bedeng berukuran √8 m × √2 m. Luasnya = √8 × √2 = … m²',
        opsi: [
          { id: 'a', label: '4' },
          { id: 'b', label: '√10' },
          { id: 'c', label: '16' },
          { id: 'd', label: '2√2' },
        ],
        kunci: 'a',
        cek: { op: 'kali', a: { k: 1, r: 8 }, b: { k: 1, r: 2 } },
        penjelasan: '√8 × √2 = √(8 × 2) = √16 = 4 m².',
      },
      {
        id: 'dRasional',
        ikon: '📐',
        tanya:
          'Petak persegi panjang seluas 6 m² memiliki panjang √3 m. Lebarnya = 6/√3 = … m (tanpa akar di penyebut)',
        opsi: [
          { id: 'a', label: '2√3' },
          { id: 'b', label: '6√3' },
          { id: 'c', label: '√2' },
          { id: 'd', label: '2' },
        ],
        kunci: 'a',
        cek: { op: 'rasional', p: 6, q: { k: 1, r: 3 } },
        penjelasan: '6/√3 = (6 × √3)/(√3 × √3) = 6√3/3 = 2√3 m (≈ 3,46 m).',
      },
    ],
    alasanLabel: 'Tulis alasan dugaan tim kalian (singkat).',
    alasanPlaceholder: 'Menurut kami … karena …',
    catatan:
      'Belum ada jawaban benar atau salah. Dugaan kalian akan dicek setelah para ahli selesai mengajar.',
    nextLabel: 'Lanjut ke Informasi →',
  },

  /* ---------- Fase 2: menyajikan informasi ---------- */
  informasi: {
    kicker: 'Tahap 2 · Menyajikan Informasi',
    goal: 'Mengingat kembali arti dan penyederhanaan bentuk akar serta konsep suku sejenis.',
    syntax: CL + ' · Fase 2',
    guru: 'Tayangkan tahap ini di depan kelas dan bahas pertanyaan penuntun bersama (±7 menit). JANGAN mengajarkan aturan operasi di sini — aturan akan ditemukan sendiri oleh kelompok ahli.',
    pengantar:
      'Sebelum berbagi tugas sebagai ahli, ingat kembali bentuk akar yang sudah kamu pelajari di MPI 12.3.',
    ingatJudul: 'Ingat kembali',
    ingat: [
      '√a adalah bilangan tak negatif yang kuadratnya a, sehingga √a × √a = a. Contoh: √7 × √7 = 7.',
      'Menyederhanakan bentuk akar: keluarkan faktor kuadrat terbesar. Contoh: √72 = √(36 × 2) = 6√2.',
      'Pada 6√2, bilangan 6 disebut koefisien dan 2 disebut bilangan di dalam akar (radikan).',
      'Dalam aljabar, 2x + 5x = 7x karena sukunya sejenis. Bentuk akar juga punya aturan "sejenis".',
    ],
    penuntun: [
      {
        id: 'p1',
        tanya: '√7 × √7 = …',
        opsi: [
          { id: 'a', label: '7' },
          { id: 'b', label: '49' },
          { id: 'c', label: '√14' },
          { id: 'd', label: '14' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! √7 adalah bilangan yang bila dikuadratkan menghasilkan 7, jadi √7 × √7 = 7.',
          b: '49 adalah 7 × 7. Yang dikalikan di sini adalah √7 dengan dirinya sendiri, hasilnya 7.',
          c: 'Bilangan di dalam akar tidak dijumlahkan. √7 × √7 berarti kuadrat dari √7.',
          d: '14 = 7 + 7. Perkalian √7 × √7 bukan penjumlahan.',
        },
      },
      {
        id: 'p2',
        tanya: '√50 dalam bentuk paling sederhana adalah …',
        opsi: [
          { id: 'a', label: '5√2' },
          { id: 'b', label: '25√2' },
          { id: 'c', label: '2√5' },
          { id: 'd', label: '10√5' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! √50 = √(25 × 2) = √25 × √2 = 5√2.',
          b: 'Faktor 25 harus diakarkan dulu sebelum keluar: √25 = 5, jadi hasilnya 5√2.',
          c: 'Bilangan di luar dan di dalam akar tertukar. √50 = √(25 × 2): yang keluar adalah √25 = 5.',
          d: '(10√5)² = 500, bukan 50. Cari faktor kuadrat terbesar dari 50, yaitu 25.',
        },
      },
      {
        id: 'p3',
        tanya: '2x + 5x = 7x, tetapi 2x + 5y tidak dapat ditulis sebagai satu suku karena …',
        opsi: [
          { id: 'a', label: 'sukunya tidak sejenis (variabelnya berbeda)' },
          { id: 'b', label: 'koefisiennya berbeda' },
          { id: 'c', label: 'sebenarnya bisa, hasilnya 7xy' },
          { id: 'd', label: 'x dan y harus dikalikan lebih dulu' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Hanya suku sejenis yang dapat digabung. Ingat aturan ini saat menjumlahkan bentuk akar.',
          b: 'Koefisien berbeda tidak masalah (2x + 5x = 7x). Yang penting variabelnya sama.',
          c: 'Coba x = 1, y = 2: 2x + 5y = 12, sedangkan 7xy = 14. Jadi tidak sama.',
          d: 'Penjumlahan tidak berubah menjadi perkalian. 2x + 5y tetap 2x + 5y.',
        },
      },
      {
        id: 'p4',
        tanya:
          'Manakah yang merupakan bilangan irasional (tidak dapat ditulis sebagai pecahan biasa)?',
        opsi: [
          { id: 'a', label: '√5' },
          { id: 'b', label: '√9' },
          { id: 'c', label: '3/4' },
          { id: 'd', label: '0,5' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! √5 ≈ 2,2360679… desimalnya tidak berhenti dan tidak berulang. Pecahan berpenyebut √5 sulit dihitung, sehingga penyebutnya perlu dirasionalkan.',
          b: '√9 = 3, bilangan bulat, jadi rasional.',
          c: '3/4 sudah berbentuk pecahan biasa, jadi rasional.',
          d: '0,5 = 1/2, jadi rasional.',
        },
      },
    ],
    syaratJudul: 'Petunjuk untuk para ahli',
    syarat:
      'Perlakukan √2, √3, √5, … seperti variabel dalam aljabar. Sebelum menghitung, SEDERHANAKAN setiap bentuk akar lebih dulu!',
    nextLabel: 'Bentuk Tim Asal →',
  },

  /* ---------- Fase 3: mengorganisasikan kelompok ---------- */
  tim: {
    kicker: 'Tahap 3 · Bentuk Tim Asal',
    goal: 'Membentuk tim asal, menyepakati aturan kerja sama, dan menerima kartu ahli.',
    syntax: CL + ' · Fase 3',
    guru: 'Bentuk tim asal heterogen berisi 4 murid (boleh 5: anggota kelima menjadi pendamping ahli dan ikut ke kelompok ahli yang sama; bila hanya 2–3 murid, seorang murid memegang lebih dari satu kartu). Tegaskan prinsip Jigsaw: setiap ahli adalah SATU-SATUNYA sumber aturan operasinya di tim. Skor tim juga bergantung pada kuis SETIAP anggota.',
    namaTimLabel: 'Nama tim asal',
    namaTimPlaceholder: 'Contoh: Tim Akar Kuat',
    anggotaLabel: 'Nama anggota tim',
    minAnggota: 2,
    maksAnggota: 5,
    kesepakatanJudul: 'Kesepakatan tim (centang semua)',
    kesepakatan: [
      {
        id: 'ahli',
        teks: 'Setiap ahli bertanggung jawab mempelajari operasinya sampai bisa mengajarkannya.',
      },
      {
        id: 'dengar',
        teks: 'Saat seorang ahli mengajar, anggota lain mendengarkan dan boleh bertanya.',
      },
      { id: 'setuju', teks: 'Tombol jawaban baru ditekan setelah semua anggota setuju.' },
      { id: 'bantu', teks: 'Anggota yang sudah paham menjelaskan, bukan menjawabkan.' },
    ],
    acakLabel: '🎲 Bagikan Kartu Ahli',
    acakUlangLabel: '🎲 Bagikan Ulang Kartu Ahli',
    ahliJudul: 'Kartu ahli tim kalian',
    ahliCatatan:
      'Pada tahap berikutnya, setiap ahli berkumpul dengan ahli yang sama dari tim lain (kelompok ahli), lalu kembali untuk mengajari tim asal.',
    nextLabel: 'Menuju Kelompok Ahli →',
  },

  /* ---------- Fase 4a: kelompok ahli (Jigsaw) ---------- */
  ahli: {
    kicker: 'Tahap 4 · Kelompok Ahli',
    goal: 'Menemukan aturan satu operasi bentuk akar di kelompok ahli, lalu mengajarkannya kepada tim asal.',
    syntax: CL + ' · Fase 4',
    guru: 'Kelompok ahli (±12 menit): ahli sejenis dari beberapa tim duduk bersama mengerjakan bagian ① dan ②. Kembali ke tim asal (±8 menit): ahli mengajarkan aturannya memakai contoh tabel, lalu memandu tim mengerjakan bagian ③. Luruskan bila ahli hanya menghafal rumus tanpa alasan.',
    pengantar:
      'Setiap stasiun adalah tugas satu ahli. Di kelompok ahli: uji nilai pada tabel (semua bilangan di dalam akar adalah bilangan kuadrat sempurna, jadi nilainya bulat atau pecahan), lalu temukan aturannya. Kembali ke tim asal: ajarkan aturanmu, lalu pandu tim mengerjakan soal stasiun.',
    ajarLabel:
      'Ahli sudah kembali ke tim asal dan menjelaskan aturan ini dengan contoh tabel. Semua anggota paham.',
    stasiun: [
      {
        id: 'jumlah',
        ujiTeks:
          'Hitung nilai Bentuk A dan Bentuk B pada setiap baris, lalu lihat apakah keduanya sama. Contoh: √9 = 3, jadi 2√9 = 6.',
        uji: [
          { k1: 2, k2: 3, r: 9 },
          { k1: 5, k2: 2, r: 4 },
          { a: 9, b: 16 },
          { a: 36, b: 64 },
        ],
        tanya: {
          id: 'hJumlah',
          tanya: 'Dari tabel, kesimpulan yang tepat adalah …',
          opsi: [
            { id: 'sejenis', label: 'a√c + b√c = (a + b)√c, tetapi √a + √b ≠ √(a + b)' },
            { id: 'radikan', label: '√a + √b = √(a + b) untuk semua bilangan' },
            { id: 'kali', label: 'a√c + b√c = (a × b)√c' },
            { id: 'tidak', label: 'bentuk akar tidak pernah dapat dijumlahkan' },
          ],
          correct: 'sejenis',
          umpan: {
            sejenis:
              'Tepat! 2√9 + 3√9 = 15 = (2 + 3)√9, seperti 2x + 3x = 5x. Namun √9 + √16 = 7, sedangkan √(9 + 16) = 5. Bilangan di dalam akar TIDAK dijumlahkan.',
            radikan:
              'Cek baris ketiga: √9 + √16 = 3 + 4 = 7, sedangkan √(9 + 16) = √25 = 5. Tidak sama!',
            kali: 'Cek baris pertama: 2√9 + 3√9 = 15, sedangkan (2 × 3)√9 = 18. Koefisien dijumlahkan, bukan dikalikan.',
            tidak:
              'Baris pertama dan kedua menunjukkan suku sejenis DAPAT dijumlahkan: 2√9 + 3√9 = (2 + 3)√9.',
          },
        },
        analogi:
          'Seperti 2x + 3x = 5x dan 5x − 2x = 3x: bila bilangan di dalam akarnya sama, yang dijumlah atau dikurangkan hanya koefisiennya. Suku yang tampak berbeda disederhanakan dulu, mis. √12 = 2√3.',
        soal: [
          {
            id: 'sj1',
            op: 'jumlah',
            suku: [
              { k: 3, r: 5 },
              { k: 4, r: 5 },
              { k: -2, r: 5 },
            ],
          },
          {
            id: 'sj2',
            op: 'jumlah',
            suku: [
              { k: 1, r: 12 },
              { k: 1, r: 27 },
            ],
            hints: ['Sederhanakan dulu: √12 = √(4 × 3) dan √27 = √(9 × 3).'],
          },
        ],
      },
      {
        id: 'kali',
        ujiTeks:
          'Hitung nilai Bentuk A (kalikan nilainya) dan Bentuk B (hitung di dalam kurung dulu), lalu bandingkan.',
        uji: [
          { a: 4, b: 9 },
          { a: 9, b: 25 },
          { k1: 2, a: 4, k2: 3, b: 9 },
          { k1: 3, a: 16, k2: 2, b: 4 },
        ],
        tanya: {
          id: 'hKali',
          tanya: 'Dari tabel, a√b × c√d sama dengan …',
          opsi: [
            { id: 'kalikan', label: '(a × c)√(b × d)' },
            { id: 'jumlah', label: '(a + c)√(b + d)' },
            { id: 'campur', label: '(a × c)√(b + d)' },
            { id: 'koef', label: '(a + c)√(b × d)' },
          ],
          correct: 'kalikan',
          umpan: {
            kalikan:
              'Tepat! 2√4 × 3√9 = 4 × 9 = 36 dan (2 × 3)√(4 × 9) = 6 × 6 = 36. Koefisien dikali koefisien, akar dikali akar.',
            jumlah: 'Cek baris pertama: √4 × √9 = 6, sedangkan √(4 + 9) = √13 bukan 6.',
            campur: 'Bilangan di dalam akar dikalikan: √4 × √9 = 6 = √36, bukan √13.',
            koef: 'Cek baris ketiga: 2√4 × 3√9 = 36, sedangkan (2 + 3)√36 = 30. Koefisien juga dikalikan.',
          },
        },
        analogi:
          'Koefisien dikalikan dengan koefisien, bilangan di dalam akar dikalikan dengan bilangan di dalam akar, lalu hasilnya disederhanakan. Ingat √a × √a = a.',
        soal: [
          {
            id: 'sk1',
            op: 'kali',
            a: { k: 2, r: 3 },
            b: { k: 5, r: 6 },
            hints: ['2 × 5 = 10 dan √3 × √6 = √18. Lalu sederhanakan √18 = √(9 × 2).'],
          },
          { id: 'sk2', op: 'kali', a: { k: 1, r: 6 }, b: { k: 1, r: 15 } },
        ],
      },
      {
        id: 'bagi',
        ujiTeks:
          'Hitung nilai Bentuk A (bagi nilainya) dan Bentuk B (hitung di dalam kurung dulu), lalu bandingkan.',
        uji: [
          { a: 36, b: 4 },
          { a: 100, b: 25 },
          { k1: 6, a: 16, k2: 2, b: 4 },
          { k1: 10, a: 81, k2: 5, b: 9 },
        ],
        tanya: {
          id: 'hBagi',
          tanya: 'Dari tabel, a√b : c√d sama dengan …',
          opsi: [
            { id: 'bagikan', label: '(a : c)√(b : d)' },
            { id: 'kurang', label: '(a − c)√(b − d)' },
            { id: 'campur', label: '(a : c)√(b − d)' },
            { id: 'kali', label: '(a × c)√(b : d)' },
          ],
          correct: 'bagikan',
          umpan: {
            bagikan:
              'Tepat! √36 : √4 = 6 : 2 = 3 dan √(36 : 4) = √9 = 3. Koefisien dibagi koefisien, akar dibagi akar.',
            kurang: 'Cek baris pertama: √36 : √4 = 3, sedangkan √(36 − 4) = √32 bukan 3.',
            campur: 'Bilangan di dalam akar dibagi, bukan dikurangkan: √36 : √4 = 3 = √9.',
            kali: 'Cek baris ketiga: 6√16 : 2√4 = 24 : 4 = 6, sedangkan (6 × 2)√4 = 24. Koefisien juga dibagi.',
          },
        },
        analogi:
          'Koefisien dibagi koefisien, bilangan di dalam akar dibagi bilangan di dalam akar, lalu hasilnya disederhanakan.',
        soal: [
          { id: 'sb1', op: 'bagi', a: { k: 1, r: 72 }, b: { k: 1, r: 2 } },
          {
            id: 'sb2',
            op: 'bagi',
            a: { k: 10, r: 15 },
            b: { k: 2, r: 3 },
            hints: ['10 : 2 = 5 dan √15 : √3 = √(15 : 3).'],
          },
        ],
      },
      {
        id: 'rasional',
        ujiTeks:
          'Bentuk B diperoleh dengan mengalikan pembilang DAN penyebut Bentuk A dengan akar penyebutnya. Hitung nilai keduanya (boleh berupa pecahan, mis. 1/2).',
        uji: [
          { p: 1, b: 4 },
          { p: 3, b: 9 },
          { p: 6, b: 4 },
          { p: 10, b: 25 },
        ],
        tanya: {
          id: 'hRasional',
          tanya: 'Mengapa a/√b boleh diubah menjadi a√b/b?',
          opsi: [
            { id: 'kali1', label: 'karena dikalikan √b/√b = 1, nilainya tetap dan √b × √b = b' },
            { id: 'pembilang', label: 'karena cukup pembilangnya saja yang dikalikan √b' },
            { id: 'kuadrat', label: 'karena √b × √b = b², jadi penyebutnya b²' },
            { id: 'beda', label: 'nilainya berubah, tetapi bentuknya lebih rapi' },
          ],
          correct: 'kali1',
          umpan: {
            kali1:
              'Tepat! Mengalikan dengan √b/√b sama dengan mengalikan 1, sehingga nilainya tidak berubah, dan penyebutnya menjadi √b × √b = b (rasional).',
            pembilang:
              'Bila hanya pembilang yang dikalikan, nilainya berubah: 1/√4 = 1/2, tetapi √4/√4 = 1. Pembilang DAN penyebut harus dikalikan.',
            kuadrat: '√4 × √4 = 2 × 2 = 4, bukan 16. Jadi √b × √b = b.',
            beda: 'Tabel menunjukkan nilai Bentuk A dan Bentuk B selalu SAMA, mis. 1/√4 = 1/2 = √4/4.',
          },
        },
        analogi:
          'Tantangan sekawan: bila penyebutnya p + √q, kalikan dengan p − √q (tanda dibalik), karena (p + √q)(p − √q) = p² − q. Contoh: (3 + √5)(3 − √5) = 9 − 5 = 4.',
        soal: [
          { id: 'sr1', op: 'rasional', p: 10, q: { k: 1, r: 5 } },
          {
            id: 'sr2',
            op: 'rasional',
            p: 3,
            q: { k: 2, r: 2 },
            hints: [
              'Kalikan pembilang dan penyebut dengan √2: penyebutnya menjadi 2 × √2 × √2 = 4.',
            ],
          },
        ],
      },
    ],
    dugaanJudul: 'Cek dugaan tim di Tahap 1',
    nextLabel: 'Mulai Misi 1 →',
  },

  /* ---------- Fase 4b: misi 1 — bengkel akar ---------- */
  misiOperasi: {
    kicker: 'Tahap 5 · Misi 1: Bengkel Akar',
    goal: 'Memilih strategi yang tepat lalu menghitung operasi bentuk akar sampai paling sederhana.',
    syntax: CL + ' · Fase 4',
    guru: 'Pastikan ahli strategi yang dipilih benar-benar memimpin (menjelaskan), bukan sekadar mengetik. Soal √8 + √12 adalah jebakan tidak sejenis dan soal sekawan dipimpin Ahli Merasionalkan. Catat tim yang masih menjumlahkan bilangan di dalam akar.',
    ronde: 1,
    pengantar:
      'Untuk setiap soal: (1) Pembaca menunjuk koefisien dan bilangan di dalam akar, (2) tim memilih strategi, (3) ahli strategi itu memimpin perhitungan, (4) Pemeriksa bertanya "Sudah paling sederhana?" sebelum Periksa ditekan.',
    soal: [
      {
        id: 'm1',
        op: 'jumlah',
        suku: [
          { k: 2, r: 3 },
          { k: 7, r: 3 },
          { k: -4, r: 3 },
        ],
      },
      {
        id: 'm2',
        op: 'jumlah',
        suku: [
          { k: 1, r: 50 },
          { k: -1, r: 8 },
        ],
        hints: ['√50 = 5√2 dan √8 = 2√2.'],
      },
      {
        id: 'm3',
        op: 'jumlah',
        suku: [
          { k: 1, r: 8 },
          { k: 1, r: 12 },
        ],
      },
      {
        id: 'm4',
        op: 'kali',
        a: { k: 3, r: 2 },
        b: { k: 4, r: 10 },
        hints: ['3 × 4 = 12 dan √2 × √10 = √20 = √(4 × 5).'],
      },
      {
        id: 'm5',
        op: 'bagi',
        a: { k: 1, r: 96 },
        b: { k: 1, r: 2 },
        hints: ['√96 : √2 = √48, lalu sederhanakan √48 = √(16 × 3).'],
      },
      { id: 'm6', op: 'rasional', p: 15, q: { k: 1, r: 3 } },
      {
        id: 'm7',
        op: 'rasional',
        p: 7,
        q: { k: 1, r: 2 },
        hints: [
          '7/√2 × √2/√2 = 7√2/2. Karena 7 dan 2 tidak punya faktor sekutu, pecahan itu sudah paling sederhana.',
        ],
      },
      {
        id: 'm8',
        op: 'sekawan',
        p: 6,
        a: 3,
        c: -1,
        r: 3,
        hints: [
          'Sekawan dari 3 − √3 adalah 3 + √3.',
          'Penyebut: (3 − √3)(3 + √3) = 9 − 3 = 6. Pembilang: 6(3 + √3).',
        ],
      },
    ],
    nextLabel: 'Lanjut ke Misi 2 →',
  },

  /* ---------- Fase 4b: misi 2 — proyek kebun ---------- */
  misiKonteks: {
    kicker: 'Tahap 6 · Misi 2: Proyek Kebun',
    goal: 'Menerapkan operasi bentuk akar secara berurutan untuk menyelesaikan masalah kontekstual.',
    syntax: CL + ' · Fase 4',
    guru: 'Soal bertahap memerlukan beberapa ahli bergantian memimpin. Minta Juru Bicara menjelaskan mengapa operasinya penjumlahan/perkalian/pembagian dan mengapa hasil akhirnya masuk akal (bandingkan dengan hampiran desimal).',
    ronde: 2,
    pengantar:
      'Selesaikan setiap masalah langkah demi langkah. Setiap langkah memakai SATU strategi; ahli strategi itu yang memimpin. Langkah berikutnya muncul setelah langkah sebelumnya tuntas.',
    soal: [
      {
        id: 'c1',
        ikon: '🌱',
        cerita:
          'Dua petak persegi seluas 50 m² dan 18 m² berjajar. Pak Gani memasang kawat sepanjang sisi gabungan kedua petak sebanyak 3 lapis.',
        langkah: [
          {
            label: 'Panjang sisi gabungan (m):',
            soal: {
              op: 'jumlah',
              suku: [
                { k: 1, r: 50 },
                { k: 1, r: 18 },
              ],
              satuan: 'm',
            },
          },
          {
            label: 'Panjang kawat untuk 3 lapis (m):',
            soal: { op: 'kali', a: { k: 3, r: 1 }, b: { k: 8, r: 2 }, satuan: 'm' },
            lanjut: true,
          },
        ],
      },
      {
        id: 'c2',
        ikon: '🧺',
        cerita:
          'Bedeng sayur berbentuk persegi panjang berukuran √12 m × √6 m. Satu karung pupuk cukup untuk lahan seluas √2 m².',
        langkah: [
          {
            label: 'Luas bedeng (m²):',
            soal: { op: 'kali', a: { k: 1, r: 12 }, b: { k: 1, r: 6 }, satuan: 'm²' },
          },
          {
            label: 'Banyak karung pupuk yang diperlukan:',
            soal: { op: 'bagi', a: { k: 6, r: 2 }, b: { k: 1, r: 2 }, satuan: 'karung' },
            lanjut: true,
          },
        ],
      },
      {
        id: 'c3',
        ikon: '🧵',
        cerita:
          'Tali rafia sepanjang √108 m dipotong sama panjang, masing-masing √3 m, untuk mengikat tanaman tomat.',
        langkah: [
          {
            label: 'Banyak potongan tali:',
            soal: { op: 'bagi', a: { k: 1, r: 108 }, b: { k: 1, r: 3 }, satuan: 'potong' },
          },
        ],
      },
      {
        id: 'c4',
        ikon: '🔺',
        cerita:
          'Papan nama kebun berbentuk segitiga sama sisi dengan panjang sisi 12/√3 dm. Tepi papan akan diberi pita.',
        langkah: [
          {
            label: 'Panjang sisi dengan penyebut rasional (dm):',
            soal: { op: 'rasional', p: 12, q: { k: 1, r: 3 }, satuan: 'dm' },
          },
          {
            label: 'Panjang pita untuk keliling papan (dm):',
            soal: { op: 'kali', a: { k: 3, r: 1 }, b: { k: 4, r: 3 }, satuan: 'dm' },
            lanjut: true,
          },
        ],
      },
      {
        id: 'c5',
        ikon: '🏡',
        cerita:
          'Lahan pembibitan berbentuk persegi panjang seluas 4 m² dengan panjang (3 + √5) m. Lebarnya = 4/(3 + √5) m.',
        langkah: [
          {
            label: 'Lebar lahan dengan penyebut rasional (m):',
            soal: {
              op: 'sekawan',
              p: 4,
              a: 3,
              c: 1,
              r: 5,
              satuan: 'm',
              hints: ['Kalikan pembilang dan penyebut dengan sekawan 3 − √5.'],
            },
          },
        ],
      },
    ],
    nextLabel: 'Lanjut ke Misi 3 →',
  },

  /* ---------- Fase 4c: misi 3 — diskusi ---------- */
  misiDiskusi: {
    kicker: 'Tahap 7 · Misi 3: Cek Pendapat Teman',
    goal: 'Menilai kebenaran pernyataan tentang operasi bentuk akar dan menjelaskan kekeliruannya.',
    syntax: CL + ' · Fase 4',
    guru: 'Setiap pernyataan hanya bisa dijawab sekali, jadi tim harus berdiskusi dulu. Minta Juru Bicara beberapa tim membacakan catatannya di depan kelas.',
    ronde: 3,
    pengantar:
      'Beberapa teman menulis pernyataan berikut. Diskusikan dalam tim, lalu tentukan Benar atau Salah. Setiap pernyataan hanya bisa dijawab sekali!',
    opsi: OPSI_BENAR_SALAH,
    pernyataan: [
      {
        id: 'd1',
        teks: '√2 + √3 = √5',
        cek: {
          soal: {
            op: 'jumlah',
            suku: [
              { k: 1, r: 2 },
              { k: 1, r: 3 },
            ],
          },
          klaim: { b: 1, r: 5 },
        },
        correct: 'salah',
        explanation:
          '√2 dan √3 tidak sejenis, jadi tidak dapat digabung. Cek hampirannya: √2 + √3 ≈ 1,41 + 1,73 = 3,14, sedangkan √5 ≈ 2,24.',
      },
      {
        id: 'd2',
        teks: '√12 + √3 = 3√3',
        cek: {
          soal: {
            op: 'jumlah',
            suku: [
              { k: 1, r: 12 },
              { k: 1, r: 3 },
            ],
          },
          klaim: { b: 3, r: 3 },
        },
        correct: 'benar',
        explanation: '√12 = 2√3, sehingga √12 + √3 = 2√3 + √3 = 3√3.',
      },
      {
        id: 'd3',
        teks: '√3 × √12 = 6',
        cek: { soal: { op: 'kali', a: { k: 1, r: 3 }, b: { k: 1, r: 12 } }, klaim: { a: 6 } },
        correct: 'benar',
        explanation: '√3 × √12 = √36 = 6.',
      },
      {
        id: 'd4',
        teks: '2√3 × 3√3 = 6√3',
        cek: { soal: { op: 'kali', a: { k: 2, r: 3 }, b: { k: 3, r: 3 } }, klaim: { b: 6, r: 3 } },
        correct: 'salah',
        explanation: '2√3 × 3√3 = (2 × 3)(√3 × √3) = 6 × 3 = 18. Ingat √3 × √3 = 3.',
      },
      {
        id: 'd5',
        teks: '√20 : √5 = 2',
        cek: { soal: { op: 'bagi', a: { k: 1, r: 20 }, b: { k: 1, r: 5 } }, klaim: { a: 2 } },
        correct: 'benar',
        explanation: '√20 : √5 = √(20 : 5) = √4 = 2.',
      },
      {
        id: 'd6',
        teks: '6/√2 = 3√2',
        cek: { soal: { op: 'rasional', p: 6, q: { k: 1, r: 2 } }, klaim: { b: 3, r: 2 } },
        correct: 'benar',
        explanation: '6/√2 × √2/√2 = 6√2/2 = 3√2.',
      },
      {
        id: 'd7',
        teks: '1/√3 = √3',
        cek: { soal: { op: 'rasional', p: 1, q: { k: 1, r: 3 } }, klaim: { b: 1, r: 3 } },
        correct: 'salah',
        explanation:
          'Penyebutnya juga harus dikalikan √3: 1/√3 × √3/√3 = √3/3. Cek hampiran: 1/√3 ≈ 0,58, sedangkan √3 ≈ 1,73.',
      },
      {
        id: 'd8',
        teks: '1/(√2 + 1) = √2 − 1',
        cek: { soal: { op: 'sekawan', p: 1, a: 1, c: 1, r: 2 }, klaim: { a: -1, b: 1, r: 2 } },
        correct: 'benar',
        explanation:
          'Kalikan dengan sekawan √2 − 1: penyebutnya (√2 + 1)(√2 − 1) = 2 − 1 = 1, sehingga hasilnya √2 − 1.',
      },
    ],
    jubirLabel:
      'Juru Bicara: tuliskan satu kekeliruan yang paling sering terjadi dan cara tim kalian menghindarinya.',
    jubirPlaceholder: 'Kekeliruan yang sering terjadi adalah … Cara menghindarinya …',
    nextLabel: 'Lanjut ke Kuis Individu →',
  },

  /* ---------- Fase 5: evaluasi individu ---------- */
  kuis: {
    kicker: 'Tahap 8 · Kuis Individu',
    goal: 'Menunjukkan kemampuan melakukan operasi hitung bentuk akar secara mandiri.',
    syntax: CL + ' · Fase 5',
    guru: 'Kuis dikerjakan SENDIRI-SENDIRI tanpa bantuan tim. Soal diambil acak dari bank sehingga tiap murid/tim mendapat soal berbeda. Jawaban hanya bisa dipilih sekali.',
    instruksi: 'Kerjakan sendiri. Jawaban pilihan ganda hanya dapat dipilih sekali.',
    banyak: 7,
    komposisi: { jumlah: 2, kali: 1, bagi: 1, rasional: 1, sekawan: 1, konteks: 1 },
    soal: [
      {
        id: 'k1',
        jenis: 'jumlah',
        type: 'choice',
        cek: {
          op: 'jumlah',
          suku: [
            { k: 4, r: 7 },
            { k: 2, r: 7 },
            { k: -1, r: 7 },
          ],
        },
        cerita: 'Sederhanakan bentuk berikut.',
        pertanyaan: '4√7 + 2√7 − √7 = …',
        options: [
          { id: 'a', label: '5√7' },
          { id: 'b', label: '6√7' },
          { id: 'c', label: '5√21' },
          { id: 'd', label: '8√7' },
        ],
        correct: 'a',
        explanation: 'Suku sejenis: koefisiennya dijumlah/dikurangkan, 4 + 2 − 1 = 5, jadi 5√7.',
      },
      {
        id: 'k2',
        jenis: 'jumlah',
        type: 'choice',
        cek: {
          op: 'jumlah',
          suku: [
            { k: 1, r: 75 },
            { k: 1, r: 12 },
          ],
        },
        cerita: 'Sederhanakan bentuk berikut.',
        pertanyaan: '√75 + √12 = …',
        options: [
          { id: 'a', label: '7√3' },
          { id: 'b', label: '√87' },
          { id: 'c', label: '7√6' },
          { id: 'd', label: '10√3' },
        ],
        correct: 'a',
        explanation: '√75 = 5√3 dan √12 = 2√3, sehingga jumlahnya 7√3.',
      },
      {
        id: 'k3',
        jenis: 'jumlah',
        type: 'choice',
        cek: {
          op: 'jumlah',
          suku: [
            { k: 1, r: 45 },
            { k: -1, r: 20 },
          ],
        },
        cerita: 'Sederhanakan bentuk berikut.',
        pertanyaan: '√45 − √20 = …',
        options: [
          { id: 'a', label: '√5' },
          { id: 'b', label: '5' },
          { id: 'c', label: '1' },
          { id: 'd', label: '5√5' },
        ],
        correct: 'a',
        explanation: '√45 = 3√5 dan √20 = 2√5, sehingga 3√5 − 2√5 = √5 (bukan √(45 − 20) = 5).',
      },
      {
        id: 'k4',
        jenis: 'kali',
        type: 'choice',
        cek: { op: 'kali', a: { k: 2, r: 6 }, b: { k: 3, r: 2 } },
        cerita: 'Tentukan hasil perkalian dalam bentuk paling sederhana.',
        pertanyaan: '2√6 × 3√2 = …',
        options: [
          { id: 'a', label: '12√3' },
          { id: 'b', label: '6√8' },
          { id: 'c', label: '5√12' },
          { id: 'd', label: '6√3' },
        ],
        correct: 'a',
        explanation: '2 × 3 = 6 dan √6 × √2 = √12 = 2√3, sehingga hasilnya 6 × 2√3 = 12√3.',
      },
      {
        id: 'k5',
        jenis: 'kali',
        type: 'choice',
        cek: { op: 'kali', a: { k: 1, r: 3 }, b: { k: 1, r: 27 } },
        cerita: 'Tentukan hasil perkalian berikut.',
        pertanyaan: '√3 × √27 = …',
        options: [
          { id: 'a', label: '9' },
          { id: 'b', label: '√30' },
          { id: 'c', label: '81' },
          { id: 'd', label: '3√3' },
        ],
        correct: 'a',
        explanation: '√3 × √27 = √81 = 9.',
      },
      {
        id: 'k6',
        jenis: 'bagi',
        type: 'choice',
        cek: { op: 'bagi', a: { k: 1, r: 150 }, b: { k: 1, r: 6 } },
        cerita: 'Tentukan hasil pembagian berikut.',
        pertanyaan: '√150 : √6 = …',
        options: [
          { id: 'a', label: '5' },
          { id: 'b', label: '12' },
          { id: 'c', label: '25' },
          { id: 'd', label: '5√6' },
        ],
        correct: 'a',
        explanation: '√150 : √6 = √(150 : 6) = √25 = 5 (bukan √(150 − 6) = 12).',
      },
      {
        id: 'k7',
        jenis: 'bagi',
        type: 'choice',
        cek: { op: 'bagi', a: { k: 18, r: 10 }, b: { k: 3, r: 2 } },
        cerita: 'Tentukan hasil pembagian dalam bentuk paling sederhana.',
        pertanyaan: '18√10 : 3√2 = …',
        options: [
          { id: 'a', label: '6√5' },
          { id: 'b', label: '6√8' },
          { id: 'c', label: '15√5' },
          { id: 'd', label: '21√5' },
        ],
        correct: 'a',
        explanation: '18 : 3 = 6 dan √10 : √2 = √5, sehingga hasilnya 6√5.',
      },
      {
        id: 'k8',
        jenis: 'rasional',
        type: 'choice',
        cek: { op: 'rasional', p: 12, q: { k: 1, r: 6 } },
        cerita: 'Rasionalkan penyebut pecahan berikut.',
        pertanyaan: '12/√6 = …',
        options: [
          { id: 'a', label: '2√6' },
          { id: 'b', label: '12√6' },
          { id: 'c', label: '6√2' },
          { id: 'd', label: '√6/2' },
        ],
        correct: 'a',
        explanation: '12/√6 × √6/√6 = 12√6/6 = 2√6.',
      },
      {
        id: 'k9',
        jenis: 'rasional',
        type: 'choice',
        cek: { op: 'rasional', p: 5, q: { k: 1, r: 10 } },
        cerita: 'Rasionalkan penyebut pecahan berikut.',
        pertanyaan: '5/√10 = …',
        options: [
          { id: 'a', label: '√10/2' },
          { id: 'b', label: '5√10' },
          { id: 'c', label: '√10/5' },
          { id: 'd', label: '2√10' },
        ],
        correct: 'a',
        explanation: '5/√10 × √10/√10 = 5√10/10 = √10/2.',
      },
      {
        id: 'k10',
        jenis: 'rasional',
        type: 'choice',
        cek: { op: 'rasional', p: 9, q: { k: 2, r: 3 } },
        cerita: 'Rasionalkan penyebut pecahan berikut.',
        pertanyaan: '9/(2√3) = …',
        options: [
          { id: 'a', label: '3√3/2' },
          { id: 'b', label: '9√3/2' },
          { id: 'c', label: '3√3' },
          { id: 'd', label: '3√3/4' },
        ],
        correct: 'a',
        explanation: '9/(2√3) × √3/√3 = 9√3/(2 × 3) = 9√3/6 = 3√3/2.',
      },
      {
        id: 'k11',
        jenis: 'sekawan',
        type: 'choice',
        cek: { op: 'sekawan', p: 2, a: 1, c: 1, r: 3 },
        cerita: 'Rasionalkan penyebut pecahan berikut dengan bentuk sekawan.',
        pertanyaan: '2/(√3 + 1) = …',
        options: [
          { id: 'a', label: '√3 − 1' },
          { id: 'b', label: '√3 + 1' },
          { id: 'c', label: '2√3 − 2' },
          { id: 'd', label: '1 − √3' },
        ],
        correct: 'a',
        explanation:
          'Kalikan dengan sekawan √3 − 1: penyebut (√3 + 1)(√3 − 1) = 3 − 1 = 2, pembilang 2(√3 − 1). Hasilnya √3 − 1.',
      },
      {
        id: 'k12',
        jenis: 'sekawan',
        type: 'choice',
        cek: { op: 'sekawan', p: 4, a: 3, c: -1, r: 5 },
        cerita: 'Rasionalkan penyebut pecahan berikut dengan bentuk sekawan.',
        pertanyaan: '4/(3 − √5) = …',
        options: [
          { id: 'a', label: '3 + √5' },
          { id: 'b', label: '3 − √5' },
          { id: 'c', label: '12 + 4√5' },
          { id: 'd', label: '(3 + √5)/2' },
        ],
        correct: 'a',
        explanation:
          'Kalikan dengan sekawan 3 + √5: penyebut 9 − 5 = 4, pembilang 4(3 + √5). Hasilnya 3 + √5.',
      },
      {
        id: 'k13',
        jenis: 'konteks',
        type: 'choice',
        cek: {
          op: 'jumlah',
          suku: [
            { k: 1, r: 32 },
            { k: 1, r: 18 },
          ],
          satuan: 'm',
        },
        cerita: 'Dua tiang bambu setinggi √32 m dan √18 m disambung lurus untuk tiang bendera.',
        pertanyaan: 'Tinggi tiang setelah disambung adalah …',
        options: [
          { id: 'a', label: '7√2 m' },
          { id: 'b', label: '√50 m' },
          { id: 'c', label: '12√2 m' },
          { id: 'd', label: '7√4 m' },
        ],
        correct: 'a',
        explanation: '√32 + √18 = 4√2 + 3√2 = 7√2 m.',
      },
      {
        id: 'k14',
        jenis: 'konteks',
        type: 'choice',
        cek: { op: 'rasional', p: 10, q: { k: 1, r: 5 }, satuan: 'cm' },
        cerita: 'Sebuah kartu persegi panjang memiliki luas 10 cm² dan panjang √5 cm.',
        pertanyaan: 'Lebar kartu itu (penyebut dirasionalkan) adalah …',
        options: [
          { id: 'a', label: '2√5 cm' },
          { id: 'b', label: '10√5 cm' },
          { id: 'c', label: '√5/2 cm' },
          { id: 'd', label: '5√2 cm' },
        ],
        correct: 'a',
        explanation: 'Lebar = 10/√5 = 10√5/5 = 2√5 cm.',
      },
    ],
    nextLabel: 'Lihat Penghargaan Tim →',
  },

  /* ---------- Fase 6: penghargaan ---------- */
  penghargaan: {
    kicker: 'Tahap 9 · Penghargaan Tim',
    goal: 'Merayakan hasil kerja sama tim berdasarkan skor misi dan kuis individu.',
    syntax: CL + ' · Fase 6',
    guru: 'Umumkan predikat setiap tim. Beri penghargaan khusus "Ahli Terbaik" kepada ahli yang penjelasannya paling membantu (tanyakan kepada anggota tim). Tekankan bahwa kuis individu ikut menentukan poin tim.',
    bobot:
      'Poin tim = 50% skor stasiun ahli & misi (benar pada percobaan pertama) + 50% skor kuis individu.',
    pujianLabel: 'Tulis satu pujian untuk ahli di tim kalian (siapa dan apa yang ia ajarkan).',
    pujianPlaceholder:
      'Contoh: Terima kasih Dimas, penjelasanmu dengan tabel uji membuatku paham mengapa √9 + √16 bukan √25.',
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ---------- Penutup ---------- */
  refleksi: {
    kicker: 'Tahap 10 · Refleksi',
    goal: 'Merefleksikan pemahaman konsep dan cara bekerja sama dalam tim.',
    syntax: CL + ' · Penutup',
    guru: 'Minta 2–3 murid membacakan jawaban refleksi. Catat murid yang memilih "belum yakin" untuk pendampingan pada pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Mengapa √50 + √18 = 8√2 dan bukan √68? Jelaskan dengan kata-katamu.',
        placeholder: 'Tulis jawabanmu…',
      },
      {
        id: 'r2',
        teks: 'Mengapa mengalikan pembilang dan penyebut dengan √b tidak mengubah nilai pecahan?',
        placeholder: 'Karena …',
      },
      {
        id: 'r3',
        teks: 'Berikan satu contoh dari kehidupan sehari-hari yang memerlukan operasi bentuk akar.',
        placeholder: 'Contoh: panjang pagar kebun, …',
      },
      {
        id: 'r4',
        teks: 'Apa yang kamu pelajari dari teman ahli di timmu? Apa yang kamu sumbangkan sebagai ahli?',
        placeholder: 'Tulis jawabanmu…',
      },
    ],
    diriLabel: 'Seberapa yakin kamu melakukan operasi hitung bentuk akar sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '😄 Sangat yakin — aku bisa menjelaskannya kepada teman' },
      { id: 'yakin', label: '🙂 Yakin — aku bisa mengerjakan sendiri' },
      { id: 'cukup', label: '😐 Cukup — kadang masih tertukar aturannya' },
      { id: 'belum', label: '😟 Belum yakin — aku masih perlu dibantu' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  selesai: {
    judul: 'Misi Jigsaw Tuntas!',
    teks: 'Kalian sudah menemukan, mengajarkan, dan menerapkan aturan operasi hitung bentuk akar untuk menyelesaikan masalah kebun sekolah.',
    capaian: [
      'Menjumlahkan dan mengurangkan bentuk akar sejenis: a√c ± b√c = (a ± b)√c.',
      'Menyederhanakan dulu sebelum menjumlahkan, dan mengenali suku yang tidak sejenis.',
      'Mengalikan bentuk akar: a√b × c√d = (a × c)√(b × d).',
      'Membagi bentuk akar: a√b : c√d = (a : c)√(b : d).',
      'Merasionalkan penyebut a/√b dan a/(p ± √q) dengan bentuk sekawan.',
      'Menjadi ahli yang mengajarkan satu operasi kepada tim.',
    ],
  },
};
