'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Sifat-sifat Operasi Bilangan Berpangkat Bulat
   Fase D — SMP Kelas VIII · Topik 12 Bilangan Berpangkat dan Bentuk Akar

   Tujuan Pembelajaran:
   Menerapkan sifat-sifat operasi bilangan berpangkat bulat
   (perkalian, pembagian, dan pangkat dari pangkat) dalam
   penyelesaian soal.

   Prasyarat: fase-d/mpi-12.1 (membaca & menulis bilangan berpangkat,
   pangkat nol & negatif).

   Gagasan kunci yang dibangun di seluruh modul:
     • aⁿ = perkalian berulang a sebanyak n faktor; a⁰ = 1, a⁻ⁿ = 1/aⁿ;
     • perkalian basis sama → faktor digabung → aᵐ × aⁿ = aᵐ⁺ⁿ;
     • pembagian basis sama → faktor sama dicoret → aᵐ : aⁿ = aᵐ⁻ⁿ
       (hasilnya boleh berpangkat nol atau negatif);
     • pangkat dari pangkat → aᵐ dikalikan n kali → (aᵐ)ⁿ = aᵐˣⁿ;
     • sifat hanya berlaku untuk BASIS YANG SAMA;
     • miskonsepsi yang dilawan: eksponen dikalikan pada perkalian,
       dibagi pada pembagian, dijumlahkan pada pangkat dari pangkat,
       basis ikut dikalikan (2³ × 3² = 6⁵), tanda eksponen terbalik,
       dan penjumlahan dianggap perkalian (2³ + 2⁴ = 2⁷).

   Model pembelajaran: COOPERATIVE LEARNING tipe JIGSAW (sintaks Arends,
   dengan skor tim ala STAD). Pemetaan sintaks ke tahap media:

     Fase 1 — Menyampaikan tujuan & memotivasi ........ 'tujuan'
     Fase 2 — Menyajikan informasi ..................... 'informasi'
     Fase 3 — Mengorganisasikan murid ke tim asal ...... 'tim'
     Fase 4 — Membimbing kelompok bekerja & belajar:
              a. kelompok ahli + mengajar tim asal ..... 'ahli'
              b. misi tim asal ......................... 'misiSederhana',
                                                         'misiRantai'
              c. diskusi tim ........................... 'misiDiskusi'
     Fase 5 — Evaluasi (individu) ...................... 'kuis'
     Fase 6 — Memberikan penghargaan ................... 'penghargaan'
     Penutup ........................................... 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, tim asal heterogen 3–4 murid,
   satu perangkat per tim; kuis dikerjakan per murid):
     1. Tujuan      (6')  — "Galeri Foto Kelas": tiga masalah memori
                            foto (2³ × 2⁴, 2¹⁰ : 2⁶, (2³)²). Tim MENDUGA
                            hasilnya sebagai satu bilangan berpangkat
                            (tidak dinilai; dicek setelah tahap ahli).
     2. Informasi   (8')  — mengingat arti aⁿ, a⁰, a⁻ⁿ; pertanyaan
                            penuntun berdiagnosa; syarat basis sama.
     3. Tim asal    (4')  — nama tim, anggota, kesepakatan; kartu AHLI
                            (perkalian, pembagian, pangkat dari pangkat)
                            dibagikan acak. Anggota ke-4 menjadi
                            pendamping ahli.
     4. Ahli        (20') — Jigsaw: tiap ahli berkumpul dengan ahli
                            sejenis dari tim lain, mengamati ubin faktor,
                            melengkapi tabel pola (nilai dihitung dari
                            DEFINISI), menemukan hubungan eksponen, lalu
                            kembali MENGAJARI tim asal dan memandu dua
                            soal stasiun (eksponen nol & negatif).
     5. Misi 1      (12') — "Sederhanakan!": tujuh soal. Pilih sifat
                            (termasuk jebakan basis berbeda) → ahli sifat
                            itu memimpin → isi eksponen (diagnosa) → nilai.
     6. Misi 2      (12') — "Rantai Sifat": enam soal gabungan &
                            kontekstual (memori, bakteri, tandon air)
                            diselesaikan langkah demi langkah.
     7. Misi 3      (6')  — "Cek Pendapat Teman": delapan pernyataan
                            Benar/Salah berisi miskonsepsi + catatan Juru
                            Bicara.
     8. Kuis        (8')  — kuis individu: enam soal diambil acak dari
                            bank dua belas soal.
     9. Penghargaan (2')  — poin tim (50% misi + 50% kuis) → predikat.
    10. Refleksi    (2')  — refleksi konsep & kerja sama, penilaian diri.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban benar sering di depan). app.js
   mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js) sehingga
   tiap tim dan tiap Reset mendapat urutan berbeda — termasuk dugaan,
   penuntun, pertanyaan hubungan eksponen, pilihan sifat di setiap
   langkah, pernyataan diskusi, soal kuis yang terpilih beserta opsinya,
   dan penilaian diri.

   Konvensi soal:
     langkah sifat  { id, op: 'kali'|'bagi'|'pangkat'|'basisBeda', a, m, n,
                      b (basis kedua untuk basisBeda), nilai: bool }
     rantai sifat   { id, a, awal, langkah: [{ op, n }], nilai, satuan }
     `a` boleh bilangan bulat atau huruf ('p', 'y').
   Konsistensi kunci jawaban diuji tests/mpi-12.2-data.test.js terhadap
   engine seksi 30 & 44 (pangkatBulat, cekSifatEksponen, hasilSoalSifat,
   hasilRantai, teksRantai, diagnosaEksponenSifat).
   ============================================================ */

var CL = 'Cooperative Learning (Jigsaw)';

var OPSI_BENAR_SALAH = [
  { id: 'benar', label: '✓ Benar' },
  { id: 'salah', label: '✗ Salah' },
];

var DATA = {
  meta: {
    judul: 'Sifat-sifat Operasi Bilangan Berpangkat Bulat',
  },

  tahap: [
    { id: 'tujuan', label: 'Tujuan' },
    { id: 'informasi', label: 'Informasi' },
    { id: 'tim', label: 'Tim Asal' },
    { id: 'ahli', label: 'Ahli' },
    { id: 'misiSederhana', label: 'Misi 1' },
    { id: 'misiRantai', label: 'Misi 2' },
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
      tugas: 'Membacakan soal dan menunjuk basis serta eksponennya.',
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
      tugas: 'Bertanya "Basisnya sama? Semua setuju?" sebelum Periksa ditekan.',
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
    goal: 'Mengenali tujuan belajar dan menduga cara menyederhanakan operasi bilangan berpangkat.',
    syntax: CL + ' · Fase 1',
    guru: 'Ceritakan masalah galeri foto kelas. Minta setiap murid menduga sendiri (1 menit), lalu bandingkan dengan teman satu tim. Banyak murid akan memilih 2¹² karena "3 × 4 = 12" — jangan dikoreksi dulu; dugaan dicek setelah para ahli selesai mengajar.',
    judul: 'Galeri Foto Kelas VIII',
    pengantar:
      'Kelas VIII sedang menyusun galeri foto digital kegiatan sekolah. Semua ukurannya ternyata berupa bilangan berpangkat dengan basis 2. Apakah hasilnya bisa ditulis singkat sebagai SATU bilangan berpangkat?',
    tp: 'Menerapkan sifat-sifat operasi bilangan berpangkat bulat (perkalian, pembagian, dan pangkat dari pangkat) dalam penyelesaian soal.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menyederhanakan perkalian bilangan berpangkat berbasis sama: aᵐ × aⁿ.',
      'Menyederhanakan pembagian bilangan berpangkat berbasis sama: aᵐ : aⁿ, termasuk hasil berpangkat nol dan negatif.',
      'Menyederhanakan pangkat dari pangkat: (aᵐ)ⁿ.',
      'Menggabungkan beberapa sifat untuk menyelesaikan soal kontekstual, serta mengenali kapan sifat TIDAK berlaku.',
    ],
    dugaan: [
      {
        id: 'dKali',
        ikon: '📁',
        tanya:
          'Ada <strong>2⁴ folder</strong>, tiap folder berisi <strong>2³ foto</strong>. Banyak foto seluruhnya = 2³ × 2⁴ = …',
        opsi: [
          { id: 'a', label: '2⁷' },
          { id: 'b', label: '2¹²' },
          { id: 'c', label: '4⁷' },
          { id: 'd', label: '2¹' },
        ],
        kunci: 'a',
        penjelasan: '2³ × 2⁴ = (2 × 2 × 2) × (2 × 2 × 2 × 2) = 7 faktor 2 = 2⁷ = 128 foto.',
      },
      {
        id: 'dBagi',
        ikon: '💾',
        tanya:
          '<strong>2¹⁰ foto</strong> dibagi rata ke <strong>2⁶ flashdisk</strong>. Isi tiap flashdisk = 2¹⁰ : 2⁶ = …',
        opsi: [
          { id: 'a', label: '2⁴' },
          { id: 'b', label: '2¹⁶' },
          { id: 'c', label: '1⁴' },
          { id: 'd', label: '2⁶⁰' },
        ],
        kunci: 'a',
        penjelasan:
          '2¹⁰ : 2⁶ — enam faktor 2 dicoret dari sepuluh faktor 2, tersisa 4 faktor: 2⁴ = 16 foto.',
      },
      {
        id: 'dPangkat',
        ikon: '🖼️',
        tanya:
          'Sebuah stiker persegi berukuran 2³ piksel × 2³ piksel, yaitu <strong>(2³)²</strong> piksel. (2³)² = …',
        opsi: [
          { id: 'a', label: '2⁶' },
          { id: 'b', label: '2⁵' },
          { id: 'c', label: '2⁹' },
          { id: 'd', label: '4³' },
        ],
        kunci: 'a',
        penjelasan: '(2³)² = 2³ × 2³ = 6 faktor 2 = 2⁶ = 64 piksel.',
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
    goal: 'Mengingat kembali arti bilangan berpangkat bulat dan syarat basis sama.',
    syntax: CL + ' · Fase 2',
    guru: 'Tayangkan tahap ini di depan kelas dan bahas pertanyaan penuntun bersama (±8 menit). JANGAN mengajarkan ketiga sifat di sini — sifat akan ditemukan sendiri oleh kelompok ahli.',
    pengantar:
      'Sebelum berbagi tugas sebagai ahli, ingat kembali arti bilangan berpangkat yang sudah kamu pelajari di MPI 12.1.',
    ingatJudul: 'Ingat kembali',
    contoh: [
      { a: 2, n: 5, teks: 'dibaca "dua pangkat lima": basis 2, eksponen 5, ada 5 faktor 2.' },
      { a: -3, n: 4, teks: 'basis negatif ditulis dalam kurung; ada 4 faktor (−3).' },
    ],
    ingat: [
      'aⁿ = a × a × … × a (n faktor). <strong>a</strong> disebut basis, <strong>n</strong> disebut eksponen (pangkat).',
      'a⁰ = 1 untuk a ≠ 0, misalnya 7⁰ = 1.',
      'a⁻ⁿ = 1/aⁿ untuk a ≠ 0, misalnya 2⁻³ = 1/2³ = 1/8.',
    ],
    penuntun: [
      {
        id: 'p1',
        tanya: '(−3)⁴ artinya …',
        opsi: [
          { id: 'a', label: '(−3) × (−3) × (−3) × (−3)' },
          { id: 'b', label: '(−3) × 4' },
          { id: 'c', label: '(−3) + (−3) + (−3) + (−3)' },
          { id: 'd', label: '−(3 × 3 × 3 × 3)' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Eksponen 4 menyatakan BANYAK FAKTOR: (−3) dikalikan berulang 4 kali, hasilnya 81.',
          b: 'Eksponen bukan pengali. (−3) × 4 = −12, sedangkan (−3)⁴ = 81.',
          c: 'Itu penjumlahan berulang (= −12). Bilangan berpangkat adalah PERKALIAN berulang.',
          d: 'Itu −3⁴ (tanpa kurung), bernilai −81. Karena ada kurung, basisnya −3, sehingga hasilnya positif 81.',
        },
      },
      {
        id: 'p2',
        tanya: 'Nilai 5⁰ adalah …',
        opsi: [
          { id: 'a', label: '1' },
          { id: 'b', label: '0' },
          { id: 'c', label: '5' },
          { id: 'd', label: 'Tidak dapat ditentukan' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! Setiap bilangan (selain 0) berpangkat nol bernilai 1.',
          b: 'Pangkat nol tidak berarti hasilnya nol. Pada tangga pangkat, 5¹ = 5 lalu dibagi 5 menjadi 5⁰ = 1.',
          c: '5 adalah nilai 5¹. Turun satu anak tangga (dibagi 5) menghasilkan 5⁰ = 1.',
          d: '5⁰ dapat ditentukan, yaitu 1. Yang tidak didefinisikan adalah 0⁰.',
        },
      },
      {
        id: 'p3',
        tanya: '2⁻³ sama dengan …',
        opsi: [
          { id: 'a', label: '1/8' },
          { id: 'b', label: '−8' },
          { id: 'c', label: '−6' },
          { id: 'd', label: '8' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! 2⁻³ = 1/2³ = 1/8. Eksponen negatif berarti kebalikan, bukan bilangan negatif.',
          b: 'Tanda negatif pada eksponen tidak membuat hasilnya negatif. 2⁻³ = 1/2³ = 1/8.',
          c: 'Eksponen bukan pengali: 2⁻³ ≠ 2 × (−3). Ingat a⁻ⁿ = 1/aⁿ.',
          d: '8 adalah 2³. Eksponen negatif berarti kebalikannya: 1/8.',
        },
      },
      {
        id: 'p4',
        tanya:
          '2³ × 3² TIDAK dapat ditulis sebagai satu bilangan berpangkat dengan sifat, karena …',
        opsi: [
          { id: 'a', label: 'basisnya berbeda (2 dan 3)' },
          { id: 'b', label: 'eksponennya berbeda (3 dan 2)' },
          { id: 'c', label: 'hasilnya bukan bilangan genap' },
          { id: 'd', label: 'sebenarnya bisa: 2³ × 3² = 6⁵' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! Faktor 2 dan faktor 3 tidak bisa "digabung". Hitung nilainya: 8 × 9 = 72.',
          b: 'Eksponen berbeda tidak masalah (misalnya 2³ × 2² tetap bisa disederhanakan). Yang penting basisnya sama.',
          c: 'Genap atau ganjil tidak berpengaruh. Perhatikan basisnya: 2 dan 3.',
          d: '6⁵ = 7.776, padahal 2³ × 3² = 8 × 9 = 72. Basis tidak boleh ikut dikalikan.',
        },
      },
    ],
    syaratJudul: 'Satu syarat penting',
    syarat:
      'Sifat-sifat yang akan ditemukan para ahli hanya berlaku bila BASISNYA SAMA. Periksa basis lebih dulu sebelum menyederhanakan!',
    nextLabel: 'Bentuk Tim Asal →',
  },

  /* ---------- Fase 3: mengorganisasikan kelompok ---------- */
  tim: {
    kicker: 'Tahap 3 · Bentuk Tim Asal',
    goal: 'Membentuk tim asal, menyepakati aturan kerja sama, dan menerima kartu ahli.',
    syntax: CL + ' · Fase 3',
    guru: 'Bentuk tim asal heterogen berisi 3 murid (boleh 4: anggota keempat menjadi pendamping ahli dan ikut ke kelompok ahli yang sama). Tegaskan prinsip Jigsaw: setiap ahli adalah SATU-SATUNYA sumber sifatnya di tim, jadi tim bergantung pada penjelasannya. Skor tim juga bergantung pada kuis SETIAP anggota.',
    namaTimLabel: 'Nama tim asal',
    namaTimPlaceholder: 'Contoh: Tim Eksponen',
    anggotaLabel: 'Nama anggota tim',
    minAnggota: 2,
    maksAnggota: 4,
    kesepakatanJudul: 'Kesepakatan tim (centang semua)',
    kesepakatan: [
      {
        id: 'ahli',
        teks: 'Setiap ahli bertanggung jawab mempelajari sifatnya sampai bisa mengajarkannya.',
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
    goal: 'Menemukan satu sifat operasi bilangan berpangkat di kelompok ahli, lalu mengajarkannya kepada tim asal.',
    syntax: CL + ' · Fase 4',
    guru: 'Kelompok ahli (±12 menit): ahli sejenis dari beberapa tim duduk bersama mengerjakan bagian ① dan ②. Kembali ke tim asal (±8 menit): ahli mengajarkan sifatnya memakai ubin faktor, lalu memandu tim mengerjakan bagian ③. Keliling dan dengarkan penjelasan ahli; luruskan bila ahli hanya menghafal rumus tanpa alasan.',
    pengantar:
      'Setiap stasiun adalah tugas satu ahli. Di kelompok ahli: amati ubin faktor, lengkapi tabel pola, dan temukan hubungan eksponennya. Kembali ke tim asal: ajarkan sifatmu, lalu pandu tim mengerjakan soal stasiun.',
    ajarLabel:
      'Ahli sudah kembali ke tim asal dan menjelaskan sifat ini dengan ubin faktor. Semua anggota paham.',
    stasiun: [
      {
        id: 'kali',
        ubin: { jenis: 'kali', a: 2, m: 3, n: 2 },
        ubinTeks:
          '2³ × 2² = (2 × 2 × 2) × (2 × 2). Hitung banyak faktor 2 seluruhnya setelah digabung.',
        pola: {
          operasi: 'kali',
          baris: [
            { a: 2, m: 2, n: 3 },
            { a: 2, m: 3, n: 4 },
            { a: 10, m: 2, n: 3 },
          ],
        },
        polaInstruksi:
          'Hitung nilai setiap bentuk (kalikan nilainya), lalu tulis hasilnya sebagai satu bilangan berpangkat aᵏ.',
        tanya: {
          id: 'hKali',
          tanya: 'Dari tabel, bagaimana eksponen hasil k diperoleh dari m dan n pada aᵐ × aⁿ?',
          opsi: [
            { id: 'jumlah', label: 'k = m + n' },
            { id: 'kali', label: 'k = m × n' },
            { id: 'kurang', label: 'k = m − n' },
            { id: 'basis', label: 'basisnya ikut dikalikan, eksponennya tetap' },
          ],
          correct: 'jumlah',
          umpan: {
            jumlah:
              'Tepat! 2² × 2³ = 2⁵ (2 + 3 = 5) dan 2³ × 2⁴ = 2⁷ (3 + 4 = 7). Faktor-faktornya digabung, jadi eksponennya DIJUMLAHKAN.',
            kali: 'Cek baris pertama: 2² × 2³ = 32 = 2⁵, bukan 2⁶ = 64. Eksponennya tidak dikalikan.',
            kurang:
              'Cek baris kedua: 2³ × 2⁴ = 128 = 2⁷. Hasil perkalian justru makin besar, bukan makin kecil.',
            basis:
              'Basis tetap 2 di semua baris (2² × 2³ = 2⁵, bukan 4⁵). Yang berubah adalah eksponennya.',
          },
        },
        soal: [
          { id: 'sk1', op: 'kali', a: 5, m: 4, n: 3 },
          { id: 'sk2', op: 'kali', a: 3, m: 5, n: -2 },
        ],
      },
      {
        id: 'bagi',
        ubin: { jenis: 'bagi', a: 2, m: 5, n: 2, coret: true },
        ubinTeks:
          '2⁵ : 2² ditulis sebagai pecahan. Setiap faktor 2 di atas yang berpasangan dengan faktor 2 di bawah dicoret. Berapa faktor yang tersisa?',
        pola: {
          operasi: 'bagi',
          baris: [
            { a: 2, m: 5, n: 2 },
            { a: 3, m: 6, n: 2 },
            { a: 10, m: 5, n: 3 },
          ],
        },
        polaInstruksi:
          'Hitung nilai setiap bentuk (bagi nilainya), lalu tulis hasilnya sebagai satu bilangan berpangkat aᵏ.',
        tanya: {
          id: 'hBagi',
          tanya: 'Dari tabel, bagaimana eksponen hasil k diperoleh dari m dan n pada aᵐ : aⁿ?',
          opsi: [
            { id: 'kurang', label: 'k = m − n' },
            { id: 'bagi', label: 'k = m : n' },
            { id: 'jumlah', label: 'k = m + n' },
            { id: 'balik', label: 'k = n − m' },
          ],
          correct: 'kurang',
          umpan: {
            kurang:
              'Tepat! 2⁵ : 2² = 2³ (5 − 2 = 3) dan 3⁶ : 3² = 3⁴ (6 − 2 = 4). Faktor yang sama dicoret, jadi eksponennya DIKURANGKAN.',
            bagi: 'Cek baris kedua: 3⁶ : 3² = 729 : 9 = 81 = 3⁴, bukan 3³ = 27. Eksponennya tidak dibagi.',
            jumlah: 'Pembagian membuat hasilnya lebih kecil: 2⁵ : 2² = 8 = 2³, bukan 2⁷.',
            balik:
              'Urutannya terbalik: 2⁵ : 2² = 2³, yaitu 5 − 2. Eksponen yang DIBAGI dikurangi eksponen PEMBAGI.',
          },
        },
        soal: [
          { id: 'sb1', op: 'bagi', a: 7, m: 9, n: 4 },
          { id: 'sb2', op: 'bagi', a: 2, m: 3, n: 5, nilai: true },
        ],
      },
      {
        id: 'pangkat',
        ubin: { jenis: 'pangkat', a: 2, m: 3, n: 2 },
        ubinTeks:
          '(2³)² = 2³ × 2³: ada 2 kelompok, tiap kelompok berisi 3 faktor 2. Berapa faktor 2 seluruhnya?',
        pola: {
          operasi: 'pangkat',
          baris: [
            { a: 2, m: 2, n: 3 },
            { a: 2, m: 4, n: 2 },
            { a: 10, m: 3, n: 2 },
          ],
        },
        polaInstruksi:
          'Hitung dulu nilai di dalam kurung, lalu pangkatkan. Tulis hasilnya sebagai satu bilangan berpangkat aᵏ.',
        tanya: {
          id: 'hPangkat',
          tanya: 'Dari tabel, bagaimana eksponen hasil k diperoleh dari m dan n pada (aᵐ)ⁿ?',
          opsi: [
            { id: 'kali', label: 'k = m × n' },
            { id: 'jumlah', label: 'k = m + n' },
            { id: 'pangkat', label: 'k = mⁿ' },
            { id: 'kurang', label: 'k = m − n' },
          ],
          correct: 'kali',
          umpan: {
            kali: 'Tepat! (2²)³ = 2⁶ (2 × 3 = 6) dan (2⁴)² = 2⁸ (4 × 2 = 8). aᵐ dikalikan n kali, jadi eksponennya DIKALIKAN.',
            jumlah:
              'Cek baris pertama: (2²)³ = 4³ = 64 = 2⁶, bukan 2⁵ = 32. Eksponennya tidak dijumlahkan.',
            pangkat:
              'Cek baris pertama: (2²)³ = 2⁶, sedangkan 2³ = 8 akan membuat hasilnya 2⁸ = 256. Eksponen tidak dipangkatkan.',
            kurang: 'Memangkatkan lagi membuat hasil makin besar: (2⁴)² = 256 = 2⁸, bukan 2².',
          },
        },
        soal: [
          { id: 'sp1', op: 'pangkat', a: 5, m: 3, n: 4 },
          { id: 'sp2', op: 'pangkat', a: 10, m: -2, n: 3 },
        ],
      },
    ],
    dugaanJudul: 'Cek dugaan tim di Tahap 1',
    nextLabel: 'Mulai Misi 1 →',
  },

  /* ---------- Fase 4b: misi 1 — sederhanakan ---------- */
  misiSederhana: {
    kicker: 'Tahap 5 · Misi 1: Sederhanakan!',
    goal: 'Memilih sifat yang tepat lalu menyederhanakan operasi bilangan berpangkat berbasis sama.',
    syntax: CL + ' · Fase 4',
    guru: 'Pastikan ahli sifat yang dipilih benar-benar memimpin (menjelaskan), bukan sekadar mengetik. Soal ke-4 adalah jebakan basis berbeda — tanyakan "Mengapa sifat tidak bisa dipakai?". Catat tim yang masih menjawab eksponen dikalikan pada perkalian.',
    ronde: 1,
    pengantar:
      'Untuk setiap soal: (1) Pemeriksa bertanya "Basisnya sama?", (2) tim memilih sifat yang dipakai, (3) ahli sifat itu memimpin menghitung eksponen, lalu (4) bila diminta, hitung nilainya.',
    soal: [
      { id: 'm1', op: 'kali', a: -2, m: 3, n: 4, nilai: true },
      { id: 'm2', op: 'bagi', a: 10, m: 8, n: 5, nilai: true },
      { id: 'm3', op: 'pangkat', a: 3, m: 2, n: 3 },
      { id: 'm4', op: 'basisBeda', a: 2, m: 3, b: 3, n: 2, nilai: true },
      { id: 'm5', op: 'bagi', a: 4, m: 2, n: 5, nilai: true },
      { id: 'm6', op: 'pangkat', a: 'p', m: 4, n: -2 },
      { id: 'm7', op: 'kali', a: 'y', m: 6, n: -6 },
    ],
    nextLabel: 'Lanjut ke Misi 2 →',
  },

  /* ---------- Fase 4b: misi 2 — rantai sifat ---------- */
  misiRantai: {
    kicker: 'Tahap 6 · Misi 2: Rantai Sifat',
    goal: 'Menerapkan beberapa sifat secara berurutan untuk menyelesaikan soal gabungan dan kontekstual.',
    syntax: CL + ' · Fase 4',
    guru: 'Soal gabungan memerlukan beberapa ahli bergantian memimpin. Minta Juru Bicara menjelaskan urutan langkahnya. Untuk soal kontekstual, tanyakan: "Mengapa operasinya perkalian/pembagian?"',
    ronde: 2,
    pengantar:
      'Selesaikan setiap soal langkah demi langkah. Setiap langkah memakai SATU sifat; ahli sifat itu yang memimpin. Kerjakan dari dalam kurung dan dari kiri ke kanan.',
    soal: [
      {
        id: 'r1',
        a: 2,
        awal: 3,
        langkah: [
          { op: 'kali', n: 5 },
          { op: 'bagi', n: 4 },
        ],
        nilai: true,
      },
      {
        id: 'r2',
        a: 3,
        awal: 2,
        langkah: [
          { op: 'pangkat', n: 4 },
          { op: 'bagi', n: 5 },
        ],
        nilai: true,
      },
      {
        id: 'r3',
        a: 5,
        awal: 4,
        langkah: [
          { op: 'kali', n: -2 },
          { op: 'pangkat', n: 3 },
        ],
      },
      {
        id: 'r4',
        ikon: '💾',
        cerita:
          'Sebuah flashdisk berkapasitas 2⁵ GB. Satu GB = 2¹⁰ MB, dan satu foto berukuran 2² MB.',
        tanya: 'Berapa banyak foto yang muat di flashdisk? (kapasitas dalam MB dibagi ukuran foto)',
        a: 2,
        awal: 5,
        langkah: [
          { op: 'kali', n: 10 },
          { op: 'bagi', n: 2 },
        ],
        nilai: true,
        satuan: 'foto',
      },
      {
        id: 'r5',
        ikon: '🦠',
        cerita:
          'Mula-mula ada 2⁴ bakteri. Setiap 20 menit setiap bakteri membelah menjadi 2, sehingga dalam 3 jam (9 kali membelah) banyaknya dikali 2⁹. Semua bakteri lalu dibagi rata ke 2⁵ cawan.',
        tanya: 'Berapa bakteri di setiap cawan?',
        a: 2,
        awal: 4,
        langkah: [
          { op: 'kali', n: 9 },
          { op: 'bagi', n: 5 },
        ],
        nilai: true,
        satuan: 'bakteri',
      },
      {
        id: 'r6',
        ikon: '🚰',
        cerita:
          'Tandon air sekolah berbentuk kubus dengan rusuk 10² cm, sehingga volumenya (10²)³ cm³. Satu liter = 10³ cm³.',
        tanya: 'Berapa liter air yang dapat ditampung tandon itu?',
        a: 10,
        awal: 2,
        langkah: [
          { op: 'pangkat', n: 3 },
          { op: 'bagi', n: 3 },
        ],
        nilai: true,
        satuan: 'liter',
      },
    ],
    nextLabel: 'Lanjut ke Misi 3 →',
  },

  /* ---------- Fase 4c: misi 3 — diskusi ---------- */
  misiDiskusi: {
    kicker: 'Tahap 7 · Misi 3: Cek Pendapat Teman',
    goal: 'Menilai kebenaran pernyataan tentang sifat bilangan berpangkat dan menjelaskan kekeliruannya.',
    syntax: CL + ' · Fase 4',
    guru: 'Setiap pernyataan hanya bisa dijawab sekali, jadi tim harus berdiskusi dulu. Minta Juru Bicara beberapa tim membacakan catatannya di depan kelas.',
    ronde: 3,
    pengantar:
      'Beberapa teman menulis pernyataan berikut. Diskusikan dalam tim, lalu tentukan Benar atau Salah. Setiap pernyataan hanya bisa dijawab sekali!',
    opsi: OPSI_BENAR_SALAH,
    pernyataan: [
      {
        id: 'd1',
        teks: '2³ × 2⁴ = 2¹²',
        cek: { jenis: 'sifat', op: 'kali', a: 2, m: 3, n: 4, k: 12 },
        correct: 'salah',
        explanation:
          'Pada perkalian basis sama, eksponen dijumlahkan: 2³ × 2⁴ = 2³⁺⁴ = 2⁷ = 128, bukan 2¹².',
      },
      {
        id: 'd2',
        teks: '(2³)⁴ = 2¹²',
        cek: { jenis: 'sifat', op: 'pangkat', a: 2, m: 3, n: 4, k: 12 },
        correct: 'benar',
        explanation: 'Pangkat dari pangkat: eksponen dikalikan, (2³)⁴ = 2³ˣ⁴ = 2¹².',
      },
      {
        id: 'd3',
        teks: '6⁸ : 6² = 6⁴',
        cek: { jenis: 'sifat', op: 'bagi', a: 6, m: 8, n: 2, k: 4 },
        correct: 'salah',
        explanation: 'Pada pembagian, eksponen dikurangkan, bukan dibagi: 6⁸ : 6² = 6⁸⁻² = 6⁶.',
      },
      {
        id: 'd4',
        teks: '2³ × 3⁴ = 6⁷',
        cek: { jenis: 'basisBeda', a: 2, m: 3, b: 3, n: 4, c: 6, k: 7 },
        correct: 'salah',
        explanation:
          'Basisnya berbeda, jadi sifat tidak berlaku. 2³ × 3⁴ = 8 × 81 = 648, sedangkan 6⁷ = 279.936.',
      },
      {
        id: 'd5',
        teks: '5⁴ : 5⁴ = 5⁰ = 1',
        cek: { jenis: 'sifat', op: 'bagi', a: 5, m: 4, n: 4, k: 0 },
        correct: 'benar',
        explanation: '5⁴ : 5⁴ = 5⁴⁻⁴ = 5⁰, dan bilangan yang dibagi dirinya sendiri bernilai 1.',
      },
      {
        id: 'd6',
        teks: '3² : 3⁵ = 3⁻³ = 1/27',
        cek: { jenis: 'sifat', op: 'bagi', a: 3, m: 2, n: 5, k: -3 },
        correct: 'benar',
        explanation: '3² : 3⁵ = 3²⁻⁵ = 3⁻³ = 1/3³ = 1/27.',
      },
      {
        id: 'd7',
        teks: '(−2)² × (−2)³ = (−2)⁵ = −32',
        cek: { jenis: 'sifat', op: 'kali', a: -2, m: 2, n: 3, k: 5 },
        correct: 'benar',
        explanation:
          '(−2)² × (−2)³ = (−2)⁵. Lima faktor negatif (ganjil) menghasilkan bilangan negatif: −32.',
      },
      {
        id: 'd8',
        teks: '2³ + 2⁴ = 2⁷',
        cek: { jenis: 'jumlah', a: 2, m: 3, n: 4, k: 7 },
        correct: 'salah',
        explanation:
          'Sifat eksponen berlaku untuk PERKALIAN, bukan penjumlahan. 2³ + 2⁴ = 8 + 16 = 24, sedangkan 2⁷ = 128.',
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
    goal: 'Menunjukkan kemampuan menerapkan sifat operasi bilangan berpangkat secara mandiri.',
    syntax: CL + ' · Fase 5',
    guru: 'Kuis dikerjakan SENDIRI-SENDIRI tanpa bantuan tim. Soal diambil acak dari bank sehingga tiap murid/tim mendapat soal berbeda. Jawaban hanya bisa dipilih sekali.',
    instruksi: 'Kerjakan sendiri. Jawaban pilihan ganda hanya dapat dipilih sekali.',
    banyak: 6,
    komposisi: { kali: 1, bagi: 1, pangkat: 1, gabung: 2, konteks: 1 },
    soal: [
      {
        id: 'k1',
        jenis: 'kali',
        type: 'choice',
        cek: { a: 3, awal: 4, langkah: [{ op: 'kali', n: 5 }] },
        cerita: 'Sederhanakan perkalian bilangan berpangkat berikut.',
        pertanyaan: '3⁴ × 3⁵ = …',
        options: [
          { id: 'a', label: '3⁹' },
          { id: 'b', label: '3²⁰' },
          { id: 'c', label: '9⁹' },
          { id: 'd', label: '3¹' },
        ],
        correct: 'a',
        explanation: 'Basis sama, eksponen dijumlahkan: 3⁴⁺⁵ = 3⁹.',
      },
      {
        id: 'k2',
        jenis: 'kali',
        type: 'choice',
        cek: { a: -5, awal: 2, langkah: [{ op: 'kali', n: -6 }] },
        cerita: 'Sederhanakan perkalian bilangan berpangkat berikut.',
        pertanyaan: '(−5)² × (−5)⁻⁶ = …',
        options: [
          { id: 'a', label: '(−5)⁻⁴' },
          { id: 'b', label: '(−5)⁻¹²' },
          { id: 'c', label: '(−5)⁸' },
          { id: 'd', label: '25⁻⁴' },
        ],
        correct: 'a',
        explanation: 'Eksponen dijumlahkan: 2 + (−6) = −4, jadi hasilnya (−5)⁻⁴.',
      },
      {
        id: 'k3',
        jenis: 'bagi',
        type: 'choice',
        cek: { a: 7, awal: 12, langkah: [{ op: 'bagi', n: 3 }] },
        cerita: 'Sederhanakan pembagian bilangan berpangkat berikut.',
        pertanyaan: '7¹² : 7³ = …',
        options: [
          { id: 'a', label: '7⁹' },
          { id: 'b', label: '7⁴' },
          { id: 'c', label: '7¹⁵' },
          { id: 'd', label: '1⁹' },
        ],
        correct: 'a',
        explanation: 'Basis sama, eksponen dikurangkan: 7¹²⁻³ = 7⁹ (bukan dibagi: 12 : 3 = 4).',
      },
      {
        id: 'k4',
        jenis: 'bagi',
        type: 'choice',
        cek: { a: 10, awal: 2, langkah: [{ op: 'bagi', n: 6 }], bentuk: 'nilai' },
        cerita: 'Tentukan nilai pembagian bilangan berpangkat berikut.',
        pertanyaan: 'Nilai 10² : 10⁶ adalah …',
        options: [
          { id: 'a', label: '1/10.000' },
          { id: 'b', label: '−10.000' },
          { id: 'c', label: '10.000' },
          { id: 'd', label: '1/1.000' },
        ],
        correct: 'a',
        explanation: '10² : 10⁶ = 10²⁻⁶ = 10⁻⁴ = 1/10⁴ = 1/10.000.',
      },
      {
        id: 'k5',
        jenis: 'pangkat',
        type: 'choice',
        cek: { a: 2, awal: 5, langkah: [{ op: 'pangkat', n: 3 }] },
        cerita: 'Sederhanakan pangkat dari pangkat berikut.',
        pertanyaan: '(2⁵)³ = …',
        options: [
          { id: 'a', label: '2¹⁵' },
          { id: 'b', label: '2⁸' },
          { id: 'c', label: '2¹²⁵' },
          { id: 'd', label: '6⁵' },
        ],
        correct: 'a',
        explanation: 'Pangkat dari pangkat: eksponen dikalikan, 5 × 3 = 15, jadi 2¹⁵.',
      },
      {
        id: 'k6',
        jenis: 'pangkat',
        type: 'choice',
        cek: { a: 'x', awal: 3, langkah: [{ op: 'pangkat', n: -4 }] },
        cerita: 'Sederhanakan bentuk aljabar berpangkat berikut (x ≠ 0).',
        pertanyaan: '(x³)⁻⁴ = …',
        options: [
          { id: 'a', label: 'x⁻¹²' },
          { id: 'b', label: 'x⁻¹' },
          { id: 'c', label: 'x⁷' },
          { id: 'd', label: 'x¹²' },
        ],
        correct: 'a',
        explanation: 'Eksponen dikalikan: 3 × (−4) = −12, jadi x⁻¹².',
      },
      {
        id: 'k7',
        jenis: 'gabung',
        type: 'choice',
        cek: {
          a: 2,
          awal: 5,
          langkah: [
            { op: 'kali', n: 3 },
            { op: 'bagi', n: 6 },
          ],
        },
        cerita: 'Sederhanakan dengan menerapkan lebih dari satu sifat.',
        pertanyaan: '2⁵ × 2³ : 2⁶ = …',
        options: [
          { id: 'a', label: '2²' },
          { id: 'b', label: '2¹⁴' },
          { id: 'c', label: '2⁻²' },
          { id: 'd', label: '2⁸' },
        ],
        correct: 'a',
        explanation: '2⁵ × 2³ = 2⁸, lalu 2⁸ : 2⁶ = 2².',
      },
      {
        id: 'k8',
        jenis: 'gabung',
        type: 'choice',
        cek: {
          a: 3,
          awal: 2,
          langkah: [
            { op: 'pangkat', n: 3 },
            { op: 'bagi', n: 4 },
          ],
          bentuk: 'nilai',
        },
        cerita: 'Tentukan nilai bentuk berikut dengan menerapkan sifat.',
        pertanyaan: 'Nilai (3²)³ : 3⁴ adalah …',
        options: [
          { id: 'a', label: '9' },
          { id: 'b', label: '3' },
          { id: 'c', label: '27' },
          { id: 'd', label: '1/9' },
        ],
        correct: 'a',
        explanation: '(3²)³ = 3⁶, lalu 3⁶ : 3⁴ = 3² = 9.',
      },
      {
        id: 'k9',
        jenis: 'gabung',
        type: 'choice',
        cek: {
          a: 5,
          awal: 3,
          langkah: [
            { op: 'kali', n: -1 },
            { op: 'pangkat', n: 2 },
          ],
        },
        cerita: 'Sederhanakan dengan menerapkan lebih dari satu sifat.',
        pertanyaan: '(5³ × 5⁻¹)² = …',
        options: [
          { id: 'a', label: '5⁴' },
          { id: 'b', label: '5⁻⁶' },
          { id: 'c', label: '5⁸' },
          { id: 'd', label: '5³' },
        ],
        correct: 'a',
        explanation: 'Dalam kurung: 5³ × 5⁻¹ = 5², lalu (5²)² = 5⁴.',
      },
      {
        id: 'k10',
        jenis: 'konteks',
        type: 'choice',
        cek: { a: 2, awal: 20, langkah: [{ op: 'bagi', n: 8 }] },
        cerita: 'Sebuah server menyimpan 2²⁰ berkas yang dibagi rata ke dalam 2⁸ folder.',
        pertanyaan: 'Banyak berkas di setiap folder adalah …',
        options: [
          { id: 'a', label: '2¹² berkas' },
          { id: 'b', label: '2²⁸ berkas' },
          { id: 'c', label: '2¹⁶⁰ berkas' },
          { id: 'd', label: '1¹² berkas' },
        ],
        correct: 'a',
        explanation: 'Dibagi rata → pembagian: 2²⁰ : 2⁸ = 2²⁰⁻⁸ = 2¹² berkas.',
      },
      {
        id: 'k11',
        jenis: 'konteks',
        type: 'choice',
        cek: { a: 10, awal: 4, langkah: [{ op: 'kali', n: 3 }] },
        cerita:
          'Satu gelas berisi sekitar 10⁴ butir gula pasir. Satu karung berisi gula sebanyak 10³ gelas.',
        pertanyaan: 'Banyak butir gula dalam satu karung sekitar …',
        options: [
          { id: 'a', label: '10⁷ butir' },
          { id: 'b', label: '10¹² butir' },
          { id: 'c', label: '20⁷ butir' },
          { id: 'd', label: '10¹ butir' },
        ],
        correct: 'a',
        explanation: '10³ gelas × 10⁴ butir = 10³⁺⁴ = 10⁷ butir.',
      },
      {
        id: 'k12',
        jenis: 'konteks',
        type: 'choice',
        cek: { a: 3, awal: 4, langkah: [{ op: 'pangkat', n: 2 }] },
        cerita: 'Lantai sebuah ruang berbentuk persegi dengan panjang sisi 3⁴ cm.',
        pertanyaan: 'Luas lantai itu, yaitu (3⁴)² cm², sama dengan …',
        options: [
          { id: 'a', label: '3⁸ cm²' },
          { id: 'b', label: '3⁶ cm²' },
          { id: 'c', label: '3¹⁶ cm²' },
          { id: 'd', label: '9⁴ cm²' },
        ],
        correct: 'a',
        explanation: 'Luas = sisi × sisi = (3⁴)² = 3⁴ˣ² = 3⁸ cm².',
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
      'Contoh: Terima kasih Rina, penjelasanmu dengan ubin faktor membuatku paham mengapa eksponennya dijumlahkan.',
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
        teks: 'Mengapa 2³ × 2⁴ = 2⁷ dan bukan 2¹²? Jelaskan dengan kata-katamu (boleh memakai ubin faktor).',
        placeholder: 'Tulis jawabanmu…',
      },
      {
        id: 'r2',
        teks: 'Kapan sifat-sifat bilangan berpangkat TIDAK dapat dipakai? Beri satu contoh.',
        placeholder: 'Contoh: bila basisnya …',
      },
      {
        id: 'r3',
        teks: 'Berikan satu contoh dari kehidupan sehari-hari yang memerlukan operasi bilangan berpangkat.',
        placeholder: 'Contoh: memori komputer, pertumbuhan bakteri, …',
      },
      {
        id: 'r4',
        teks: 'Apa yang kamu pelajari dari teman ahli di timmu? Apa yang kamu sumbangkan sebagai ahli?',
        placeholder: 'Tulis jawabanmu…',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menerapkan sifat-sifat bilangan berpangkat sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '😄 Sangat yakin — aku bisa menjelaskannya kepada teman' },
      { id: 'yakin', label: '🙂 Yakin — aku bisa mengerjakan sendiri' },
      { id: 'cukup', label: '😐 Cukup — kadang masih tertukar sifatnya' },
      { id: 'belum', label: '😟 Belum yakin — aku masih perlu dibantu' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  selesai: {
    judul: 'Misi Jigsaw Tuntas!',
    teks: 'Kalian sudah menemukan, mengajarkan, dan menerapkan tiga sifat operasi bilangan berpangkat bulat untuk menyelesaikan soal.',
    capaian: [
      'Menyederhanakan perkalian bilangan berpangkat berbasis sama: aᵐ × aⁿ = aᵐ⁺ⁿ.',
      'Menyederhanakan pembagian bilangan berpangkat berbasis sama: aᵐ : aⁿ = aᵐ⁻ⁿ, termasuk hasil berpangkat nol dan negatif.',
      'Menyederhanakan pangkat dari pangkat: (aᵐ)ⁿ = aᵐˣⁿ.',
      'Menggabungkan beberapa sifat untuk menyelesaikan soal kontekstual.',
      'Mengenali bahwa sifat hanya berlaku untuk basis yang sama.',
      'Menjadi ahli yang mengajarkan satu sifat kepada tim.',
    ],
  },
};
