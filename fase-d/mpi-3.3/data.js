'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Skala pada Peta & Denah — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menggunakan skala untuk menentukan jarak sebenarnya dan jarak pada
   peta atau denah dalam masalah kontekstual.

   Notasi di berkas ini (lihat engine seksi 69):
     • setiap langkah isian & soal memakai `cek` dengan `jenis` engine:
         'asli'     { jPeta, satPeta, penyebut, satJawab } — jarak sebenarnya
         'peta'     { jAsli, satAsli, penyebut, satJawab } — jarak pada peta/denah
         'skala'    { jPeta, satPeta, jAsli, satAsli }     — skala 1 : n
         'konversi' { nilai, dari, ke }                    — ubah satuan
       Kuncinya DIHITUNG engine (jawabSoalSkala), bukan ditulis tangan;
       `jawab` di sini hanya dicek kesamaannya oleh tes.

   Model pembelajaran: PROBLEM BASED LEARNING (PBL).
   Masalah pemantik: "Jelajah Desa Wisata Kelas VII".
   Kelompok merencanakan rute jalan kaki study tour dari Balai Desa ke
   Sentra Gerabah (bus menjemput di sana) yang WAJIB melewati Museum
   Batik dan panjang sebenarnya TIDAK LEBIH DARI 3 km, memakai peta desa
   berskala 1 : 25.000. Kelompok juga menggambar Stand 7D (3 m × 2 m)
   pada denah aula berskala 1 : 200 untuk pameran hasil study tour.
   Konflik kognitif: "4 cm pada peta 1 : 25.000 = 100.000 m" (padahal
   100.000 cm = 1 km) dan "skala 1 : 1.000 menghasilkan gambar lebih
   besar daripada 1 : 200" (padahal makin besar penyebut, makin kecil
   gambarnya).

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ....... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar . 'organisasi'
     Sintaks 3 — Membimbing penyelidikan ............ 'selidikAsli',
                                                      'selidikPeta',
                                                      'selidikDenah'
     Sintaks 4 — Mengembangkan & menyajikan karya ... 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi ........ 'evaluasi'
     Penerapan & penutup ............................ 'terapkan', 'refleksi',
                                                      'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — murid menduga, merumuskan masalah dan
       hipotesis, memilih peran, memilah sub-masalah, menyusun rencana
       kerja, lalu menguji dugaannya sendiri dan merefleksikan strategi.
     • Bermakna (meaningful) — semua hitungan berasal dari keputusan
       nyata: rute mana yang aman ditempuh dan seberapa besar stand
       digambar di denah; hasilnya langsung menjadi keputusan kelompok.
     • Menggembirakan (joyful) — Lab Peta dengan penggaris yang
       ditempelkan pada jalan, Pembanding Skala yang memperbesar dan
       memperkecil gambar lapangan, Lab Denah untuk "membangun" stand,
       detektif solusi kelompok lain, dan poster rencana jelajah.

   Rangkaian aktivitas (± 2 × 40 menit; kelompok 3–4 murid):
     1. Orientasi   (8')  — cerita, peta desa, dugaan awal (tidak
                            dinilai), rumusan masalah, hipotesis.
     2. Organisasi  (6')  — memilih peran, memilah sub-masalah (jarak
                            sebenarnya / jarak pada peta / skala),
                            menyusun rencana kerja.
     3. Selidik A   (12') — Lab Peta: mengukur jalan dengan penggaris,
                            makna skala, jarak peta → jarak sebenarnya,
                            isian berdiagnosa, temuan.
     4. Selidik B   (12') — Pembanding Skala, jarak sebenarnya → jarak
                            pada peta, menentukan skala 1 : n, temuan.
     5. Selidik C   (10') — Lab Denah aula 1 : 200: mengatur stand
                            sampai 3 m × 2 m, ukuran aula/panggung/pintu
                            pada denah, temuan.
     6. Karya       (10') — Papan Rencana Jelajah: panjang tiga rute,
                            batas 3 km di peta, keputusan rute, pesan
                            kelompok → poster peta & denah.
     7. Evaluasi    (10') — detektif solusi kelompok lain, dugaan vs
                            hasil, menyusun simpulan.
     8. Uji terap   (8')  — 8 soal acak dari bank 16 soal.
     9. Refleksi    (4')  — rekap capaian, refleksi tertulis, keyakinan.

   Catatan pengacakan: SEMUA daftar pilihan di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di urutan pertama). app.js
   mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / ensureTapOrderState / shuffleArray dari
   shared/engine.js) dan menyimpannya di State, sehingga tiap murid dan
   tiap Reset mendapat urutan berbeda. Pilihan buatan engine
   (opsiSoalSkala pada soal pilihan ganda uji terap) diacak dengan cara
   yang sama.
   ============================================================ */

var PBL = 'Problem Based Learning';

var DATA = {
  meta: {
    judul: 'Skala pada Peta & Denah',
  },

  tahap: [
    { id: 'orientasi', label: 'Masalah' },
    { id: 'organisasi', label: 'Organisasi' },
    { id: 'selidikAsli', label: 'Lab Peta' },
    { id: 'selidikPeta', label: 'Jarak Peta' },
    { id: 'selidikDenah', label: 'Lab Denah' },
    { id: 'karya', label: 'Karya' },
    { id: 'evaluasi', label: 'Evaluasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Label konteks soal: ikon + nama. */
  konteks: {
    peta: { ikon: '🗺️', nama: 'Peta' },
    denah: { ikon: '📐', nama: 'Denah' },
    model: { ikon: '🚌', nama: 'Model & miniatur' },
  },

  /* ----------------------------------------------------------
     Data masalah pemantik — dipakai di beberapa tahap.
     Koordinat tempat dalam cm pada peta (petak 1 cm).
     ---------------------------------------------------------- */
  peta: {
    nama: 'Peta Desa Wisata Sukamaju',
    penyebut: 25000,
    lebar: 13,
    tinggi: 9,
    tempat: [
      { id: 'balai', nama: 'Balai Desa', ikon: '🏛️', x: 2, y: 7 },
      { id: 'museum', nama: 'Museum Batik', ikon: '🖼️', x: 2, y: 3 },
      { id: 'taman', nama: 'Taman Bambu', ikon: '🎋', x: 5, y: 7 },
      { id: 'gerabah', nama: 'Sentra Gerabah', ikon: '🏺', x: 8, y: 3 },
      { id: 'kebun', nama: 'Kebun Teh', ikon: '🍃', x: 11, y: 7 },
    ],
    jalan: [
      { id: 'bm', dari: 'balai', ke: 'museum' },
      { id: 'bt', dari: 'balai', ke: 'taman' },
      { id: 'mt', dari: 'museum', ke: 'taman' },
      { id: 'mg', dari: 'museum', ke: 'gerabah' },
      { id: 'tg', dari: 'taman', ke: 'gerabah' },
      { id: 'tk', dari: 'taman', ke: 'kebun' },
      { id: 'gk', dari: 'gerabah', ke: 'kebun' },
    ],
  },

  /* Batas jalan kaki (km) dan tiga rute calon dari Balai Desa ke Sentra Gerabah. */
  batasKm: 3,
  rute: [
    {
      id: 'ruteA',
      nama: 'Rute A',
      jalan: ['bm', 'mg'],
      teks: 'Balai Desa → Museum Batik → Sentra Gerabah',
      museum: true,
    },
    {
      id: 'ruteB',
      nama: 'Rute B',
      jalan: ['bt', 'mt', 'mg'],
      teks: 'Balai Desa → Taman Bambu → Museum Batik → Sentra Gerabah',
      museum: true,
    },
    {
      id: 'ruteC',
      nama: 'Rute C',
      jalan: ['bt', 'tg'],
      teks: 'Balai Desa → Taman Bambu → Sentra Gerabah',
      museum: false,
    },
  ],

  /* Denah aula untuk pameran hasil study tour. */
  denah: {
    penyebut: 200,
    ruang: { nama: 'Aula', p: 24, l: 14 },
    target: { nama: 'Stand 7D', p: 3, l: 2 },
    langkah: 0.5,
    awal: { p: 0.5, l: 0.5 },
  },

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI PADA MASALAH (PBL sintaks 1)
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Evaluasi.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi pada Masalah',
    syntax: PBL + ' · Sintaks 1',
    goal: 'Memahami masalah rute study tour dan denah pameran, lalu merumuskan apa yang harus diselesaikan kelompok.',
    guru: 'Tunjukkan peta desa dan bacakan pesan Bu Rina dengan antusias. Biarkan murid menebak — dugaan TIDAK dinilai. Pancing konflik: "4 cm di peta 1 : 25.000 berarti 100.000 meter, kan?" dan "Penyebut 1.000 lebih besar, berarti gambarnya lebih besar?" Jangan beri jawaban; arahkan ke rumusan masalah dan hipotesis kelompok.',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Menggunakan skala untuk menentukan jarak sebenarnya dan jarak pada peta atau denah dalam masalah kontekstual.',
    kriteria: [
      'Menjelaskan arti skala 1 : n pada peta atau denah dan mengukur jarak pada peta dengan penggaris.',
      'Menentukan jarak sebenarnya dari jarak pada peta atau denah, lalu menyatakannya dalam satuan yang sesuai (cm, m, atau km).',
      'Menentukan jarak pada peta atau denah dari jarak sebenarnya, dan menentukan skala dari pasangan jarak.',
      'Memilih keputusan dalam masalah kontekstual (rute, ukuran gambar) berdasarkan perhitungan skala dan memeriksa kewajarannya.',
    ],
    judul: 'Jelajah Desa Wisata Kelas VII',
    pengantar:
      'Kelas VII akan study tour ke Desa Wisata Sukamaju. Rombongan turun di Balai Desa, berjalan kaki, lalu dijemput bus di Sentra Gerabah. Bu Rina berpesan: "Rute kita wajib melewati Museum Batik, dan jalan kakinya jangan lebih dari 3 km. Sepulangnya, setiap kelompok membuka stand pameran di aula — gambarkan dulu stand kalian di denah aula." Kelompokmu memegang peta desa berskala 1 : 25.000.',
    catatanKelompok: [
      'Peta desa berskala 1 : 25.000 (petak peta 1 cm × 1 cm).',
      'Rute dari Balai Desa ke Sentra Gerabah wajib melewati Museum Batik.',
      'Panjang jalan kaki sebenarnya paling jauh 3 km.',
      'Stand 7D berukuran 3 m × 2 m digambar pada denah aula berskala 1 : 200.',
    ],
    dugaan: [
      {
        id: 'dJarak',
        tanya:
          'Pada peta berskala 1 : 25.000, sebuah jalan panjangnya 4 cm. Berapa panjang jalan sebenarnya?',
        opsi: [
          { id: 'km1', label: '1 km' },
          { id: 'm100rb', label: '100.000 m' },
          { id: 'cm25rb', label: '25.000 cm' },
        ],
        baku: 'km1',
        pembahasan: '4 × 25.000 = 100.000 cm = 1.000 m = 1 km.',
      },
      {
        id: 'dGambar',
        tanya:
          'Lapangan yang sama digambar dengan skala 1 : 200 dan dengan skala 1 : 1.000. Gambar mana yang lebih besar?',
        opsi: [
          { id: 's200', label: 'Gambar berskala 1 : 200' },
          { id: 's1000', label: 'Gambar berskala 1 : 1.000' },
          { id: 'sama', label: 'Sama besar, lapangannya sama' },
        ],
        baku: 's200',
        pembahasan:
          'Pada 1 : 200, 1 cm mewakili 2 m; pada 1 : 1.000, 1 cm mewakili 10 m. Makin besar penyebut, makin kecil gambarnya.',
      },
      {
        id: 'dRute',
        tanya:
          'Rute Balai Desa → Museum Batik → Sentra Gerabah panjangnya 10 cm pada peta. Apakah masih dalam batas 3 km?',
        opsi: [
          { id: 'ya', label: 'Ya, masih kurang dari 3 km' },
          { id: 'tidak', label: 'Tidak, rutenya terlalu jauh' },
          { id: 'tahu', label: 'Tidak bisa ditentukan dari peta' },
        ],
        baku: 'ya',
        pembahasan: '10 × 25.000 = 250.000 cm = 2,5 km, jadi masih di bawah 3 km.',
      },
    ],
    alasanLabel: 'Bagaimana kelompokmu menebak? Tulis alasan singkatnya.',
    alasanPlaceholder: 'Contoh: kami mengalikan 4 dengan 25.000 lalu …',
    pertanyaan: 'Apa masalah utama yang harus diselesaikan kelompokmu?',
    masalahOpsi: [
      {
        id: 'rencana',
        label:
          'Memilih rute lewat Museum Batik yang panjang sebenarnya tidak lebih dari 3 km, dan menggambar stand di denah aula sesuai skala',
      },
      { id: 'foto', label: 'Memilih tempat wisata yang paling bagus untuk berfoto' },
      { id: 'tebak', label: 'Menebak rute tercepat tanpa perlu mengukur peta' },
      { id: 'besar', label: 'Menggambar ulang peta desa supaya lebih besar dan berwarna' },
    ],
    masalahCorrect: 'rencana',
    masalahUmpan: {
      rencana:
        'Tepat! Ada dua masalah yang bisa dihitung dengan skala: panjang rute sebenarnya dan ukuran stand pada denah.',
      foto: 'Tempat berfoto memang seru, tetapi tidak menjawab pesan Bu Rina tentang rute dan denah.',
      tebak:
        'Menebak saja berisiko — bisa-bisa rombongan berjalan lebih dari 3 km. Peta berskala bisa diukur.',
      besar:
        'Peta yang ada sudah cukup. Yang perlu kita lakukan adalah memakai skalanya untuk menghitung.',
    },
    hipotesisLabel:
      'Hipotesis kelompok: bagaimana cara mengubah panjang di peta menjadi panjang sebenarnya, dan sebaliknya?',
    hipotesisPlaceholder: 'Contoh: kami menduga panjang di peta dikalikan dengan …',
    nextLabel: 'Bagi Tugas Kelompok →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENGORGANISASI MURID (PBL sintaks 2)
     ---------------------------------------------------------- */
  organisasi: {
    kicker: 'Tahap 2 · Mengorganisasi Belajar',
    syntax: PBL + ' · Sintaks 2',
    goal: 'Membagi peran, memilah sub-masalah menurut jenisnya, dan menyusun rencana kerja kelompok.',
    guru: 'Pastikan setiap anggota memegang peran berbeda. Saat memilah, minta murid menunjuk kata kunci: "di peta … sebenarnya berapa?" (jarak sebenarnya), "digambar … berapa cm?" (jarak pada peta), "skalanya berapa?" (skala). Rencana kerja dipakai sebagai daftar periksa selama penyelidikan.',
    peranLabel: 'Pilih peranmu di kelompok',
    peran: [
      { id: 'navigator', label: '📏 Navigator — mengukur jalan di peta dengan penggaris' },
      { id: 'penghitung', label: '🧮 Penghitung — mengubah jarak memakai skala' },
      { id: 'arsitek', label: '📐 Penata denah — menggambar stand di denah aula' },
      { id: 'jubir', label: '🎤 Juru bicara — mencatat & menyajikan rencana' },
    ],
    judulPilah: 'Pilah sub-masalah: apa yang dicari?',
    opsiPilah: [
      { id: 'asli', label: 'Jarak sebenarnya' },
      { id: 'peta', label: 'Jarak pada peta/denah' },
      { id: 'skala', label: 'Skala' },
    ],
    pilah: [
      {
        id: 'pJalan',
        teks: 'Jalan Balai Desa – Museum Batik panjangnya 4 cm di peta. Berapa km jalan sebenarnya?',
        correct: 'asli',
        explanation: 'Yang diketahui panjang di peta, yang dicari panjang di dunia nyata.',
      },
      {
        id: 'pRute',
        teks: 'Total rute 10 cm di peta. Apakah rute itu lebih pendek dari 3 km?',
        correct: 'asli',
        explanation:
          'Batas 3 km adalah jarak sebenarnya, jadi panjang di peta diubah ke jarak sebenarnya.',
      },
      {
        id: 'pStand',
        teks: 'Stand 3 m × 2 m akan digambar di denah aula. Berapa cm ukurannya di denah?',
        correct: 'peta',
        explanation: 'Yang diketahui ukuran sebenarnya, yang dicari ukuran pada gambar (denah).',
      },
      {
        id: 'pAula',
        teks: 'Aula sepanjang 24 m harus digambar di kertas. Berapa cm panjangnya pada denah?',
        correct: 'peta',
        explanation: 'Ukuran sebenarnya diubah menjadi ukuran pada denah.',
      },
      {
        id: 'pBrosur',
        teks: 'Pada brosur, jarak 8 cm mewakili 2,4 km. Berapa skala brosur itu?',
        correct: 'skala',
        explanation: 'Kedua jarak sudah diketahui; yang dicari perbandingannya, yaitu skala.',
      },
      {
        id: 'pLapangan',
        teks: 'Lapangan sepanjang 60 m digambar 12 cm. Skala gambar itu berapa?',
        correct: 'skala',
        explanation: 'Jarak gambar dan jarak sebenarnya diketahui, jadi yang dicari skalanya.',
      },
    ],
    judulRencana: 'Susun rencana kerja kelompok untuk memeriksa rute',
    instruksiRencana: 'Ketuk kartu sesuai urutan langkah yang akan kalian jalankan.',
    rencana: [
      { id: 'ukur', label: '📏 Ukur panjang tiap jalan di peta (cm)' },
      { id: 'kali', label: '✖️ Kalikan dengan penyebut skala' },
      { id: 'ubah', label: '🔄 Ubah hasilnya dari cm ke km' },
      { id: 'banding', label: '⚖️ Bandingkan dengan batas 3 km' },
      { id: 'sajikan', label: '🎤 Sajikan rute pilihan kelompok' },
    ],
    rencanaSalah:
      'Belum tepat. Pikirkan: yang bisa dikalikan skala adalah panjang yang sudah diukur, dan batas 3 km baru bisa dibandingkan setelah satuannya km.',
    nextLabel: 'Mulai Penyelidikan A →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENYELIDIKAN A: LAB PETA (PBL sintaks 3)
     Jarak pada peta → jarak sebenarnya.
     ---------------------------------------------------------- */
  selidikAsli: {
    kicker: 'Tahap 3 · Penyelidikan A — Lab Peta',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menemukan arti skala 1 : 25.000 dan cara menentukan jarak sebenarnya dari jarak pada peta.',
    guru: 'Biarkan navigator menempelkan penggaris pada tiga jalan misi dan membacakan panjangnya. Tanyakan: "1 cm di peta mewakili berapa cm sebenarnya? Berapa meter itu?" Minta penghitung menulis kalimat matematika (… × 25.000 = … cm = … km) sebelum mengetik jawaban.',
    labJudul: '🔬 Lab Peta: tempelkan penggaris pada jalan',
    labTeks:
      'Pilih jalan untuk mengukur panjangnya di peta. Hitung petaknya juga: setiap petak 1 cm. Selesaikan ketiga misi pengukuran.',
    misi: [
      { id: 'bm', teks: 'Ukur jalan Balai Desa – Museum Batik' },
      { id: 'mg', teks: 'Ukur jalan Museum Batik – Sentra Gerabah' },
      { id: 'bt', teks: 'Ukur jalan Balai Desa – Taman Bambu' },
    ],
    misiBelum: 'Selesaikan dulu ketiga misi pengukuran di Lab Peta.',
    instruksi: 'Tulis kalimat matematikanya di buku, lalu isi jawabanmu.',
    langkah: [
      {
        id: 'la1',
        label: 'Skala 1 : 25.000. Jarak 1 cm di peta mewakili … cm jarak sebenarnya.',
        cek: { jenis: 'asli', jPeta: 1, satPeta: 'cm', penyebut: 25000, satJawab: 'cm' },
        jawab: '25.000',
        satuan: 'cm',
        hints: ['Skala 1 : 25.000 berarti 1 bagian di peta mewakili 25.000 bagian sebenarnya.'],
      },
      {
        id: 'la2',
        label: '25.000 cm = … m',
        cek: { jenis: 'konversi', nilai: 25000, dari: 'cm', ke: 'm' },
        jawab: '250',
        satuan: 'm',
        hints: ['1 m = 100 cm.', 'Dari cm ke m: dibagi 100.'],
        temuan:
          'Jadi setiap 1 cm (satu petak) di peta mewakili 250 m — lihat batang skala di bawah peta.',
      },
      {
        id: 'la3',
        label:
          'Jalan Balai Desa – Museum Batik (ukur di Lab Peta). Jarak sebenarnya = panjang di peta × 25.000 = … cm',
        cek: { jenis: 'asli', jPeta: 4, satPeta: 'cm', penyebut: 25000, satJawab: 'cm' },
        jawab: '100.000',
        satuan: 'cm',
        hints: ['Panjang jalan itu di peta 4 cm.', '4 × 25.000 = …'],
      },
      {
        id: 'la4',
        label: 'Jadi jarak sebenarnya Balai Desa – Museum Batik = … km',
        cek: { jenis: 'asli', jPeta: 4, satPeta: 'cm', penyebut: 25000, satJawab: 'km' },
        jawab: '1',
        satuan: 'km',
        hints: ['1 km = 1.000 m = 100.000 cm.', '100.000 cm : 100.000 = … km'],
        temuan:
          'Hasil kali dengan penyebut masih dalam cm — satuan peta. Ubah ke km agar mudah dibayangkan.',
      },
      {
        id: 'la5',
        label: 'Jalan Museum Batik – Sentra Gerabah (ukur di Lab Peta) sebenarnya = … m',
        cek: { jenis: 'asli', jPeta: 6, satPeta: 'cm', penyebut: 25000, satJawab: 'm' },
        jawab: '1.500',
        satuan: 'm',
        hints: ['Panjangnya di peta 6 cm.', '6 × 25.000 = 150.000 cm. Lalu ubah ke m (: 100).'],
      },
      {
        id: 'la6',
        label: 'Jalan Balai Desa – Taman Bambu (ukur di Lab Peta) sebenarnya = … m',
        cek: { jenis: 'asli', jPeta: 3, satPeta: 'cm', penyebut: 25000, satJawab: 'm' },
        jawab: '750',
        satuan: 'm',
        hints: ['Panjangnya di peta 3 cm.', 'Cara cepat: 1 cm = 250 m, jadi 3 cm = 3 × 250 m.'],
        temuan: 'Jarak sebenarnya = jarak pada peta × penyebut skala, lalu satuannya diubah.',
      },
    ],
    amati: [
      {
        id: 'aArti',
        tanya: 'Apa arti skala 1 : 25.000 pada peta desa?',
        opsi: [
          { id: 'cmcm', label: '1 cm pada peta mewakili 25.000 cm jarak sebenarnya' },
          { id: 'cmm', label: '1 cm pada peta mewakili 25.000 m jarak sebenarnya' },
          { id: 'besar', label: 'Peta itu 25.000 kali lebih besar daripada desanya' },
          { id: 'mcm', label: '1 m pada peta mewakili 25.000 cm jarak sebenarnya' },
        ],
        correct: 'cmcm',
        umpan: {
          cmcm: 'Tepat! Kedua suku skala memakai satuan yang SAMA. 25.000 cm = 250 m.',
          cmm: 'Hati-hati: kedua suku skala bersatuan sama. 1 cm mewakili 25.000 cm, bukan 25.000 m.',
          besar: 'Terbalik — peta jauh lebih KECIL daripada desanya.',
          mcm: 'Satuan kedua suku skala harus sama, dan petanya diukur dalam cm.',
        },
      },
      {
        id: 'aCara',
        tanya: 'Bagaimana menentukan jarak sebenarnya dari jarak pada peta?',
        opsi: [
          { id: 'kali', label: 'Jarak pada peta dikali penyebut skala, lalu satuannya diubah' },
          { id: 'bagi', label: 'Jarak pada peta dibagi penyebut skala' },
          { id: 'tambah', label: 'Jarak pada peta ditambah penyebut skala' },
          { id: 'tetap', label: 'Jarak pada peta sama dengan jarak sebenarnya' },
        ],
        correct: 'kali',
        umpan: {
          kali: 'Tepat! Satu cm di peta mewakili 25.000 cm, jadi 4 cm mewakili 4 × 25.000 cm.',
          bagi: 'Kalau dibagi, hasilnya lebih kecil dari jarak di peta — padahal jarak sebenarnya jauh lebih panjang.',
          tambah: 'Skala adalah perbandingan, jadi hubungannya perkalian, bukan penjumlahan.',
          tetap: 'Peta adalah gambar yang diperkecil, jadi jarak sebenarnya jauh lebih panjang.',
        },
      },
      {
        id: 'aSatuan',
        tanya: 'Mengapa hasil 4 × 25.000 = 100.000 belum boleh ditulis "100.000 km"?',
        opsi: [
          {
            id: 'cm',
            label: 'Karena hasil kalinya masih dalam cm, satuan jarak di peta',
          },
          { id: 'salah', label: 'Karena perkaliannya salah, seharusnya 10.000' },
          { id: 'boleh', label: 'Sebenarnya boleh, satuan bisa dipilih bebas' },
          { id: 'm', label: 'Karena skala selalu dalam meter' },
        ],
        correct: 'cm',
        umpan: {
          cm: 'Tepat! 100.000 cm = 1.000 m = 1 km. Satuan hasil kali mengikuti satuan jarak peta.',
          salah:
            'Perkaliannya sudah benar: 4 × 25.000 = 100.000. Yang perlu diperhatikan satuannya.',
          boleh:
            'Satuan tidak bisa dipilih bebas — 100.000 km sama dengan dua setengah kali keliling bumi!',
          m: 'Skala tidak bersatuan; satuannya mengikuti satuan jarak yang diukur di peta (cm).',
        },
      },
    ],
    nextLabel: 'Lanjut ke Penyelidikan B →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENYELIDIKAN B: JARAK PADA PETA & SKALA (PBL sintaks 3)
     Jarak sebenarnya → jarak pada peta; menentukan skala.
     ---------------------------------------------------------- */
  selidikPeta: {
    kicker: 'Tahap 4 · Penyelidikan B — Jarak pada Peta & Menentukan Skala',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menemukan cara menentukan jarak pada peta dari jarak sebenarnya dan menentukan skala dari dua jarak.',
    guru: 'Di Pembanding Skala, minta kelompok menebak dulu sebelum menekan tombol: "Skala mana yang membuat gambar lapangan muat di kertas?" Tekankan: makin besar penyebut, makin kecil gambar. Untuk menentukan skala, ingatkan agar satuan disamakan dulu dan suku pertama dibuat 1.',
    labJudul: '🔍 Pembanding Skala: lapangan desa di kertas gambar',
    labTeks:
      'Lapangan desa akan digambar untuk papan informasi. Coba keempat skala dan perhatikan ukuran gambarnya.',
    banding: {
      nama: 'Lapangan desa',
      panjang: 40,
      lebar: 24,
      satuan: 'm',
      kertas: { p: 15, l: 10 },
      pilihan: [100, 200, 500, 1000],
    },
    misiTeks: 'Coba keempat skala',
    misiBelum: 'Coba dulu keempat skala di Pembanding Skala.',
    instruksi: 'Tulis kalimat matematikanya di buku, lalu isi jawabanmu.',
    langkah: [
      {
        id: 'lp1',
        label: 'Jarak sebenarnya Taman Bambu – Kebun Teh 1,5 km. 1,5 km = … cm',
        cek: { jenis: 'konversi', nilai: 1.5, dari: 'km', ke: 'cm' },
        jawab: '150.000',
        satuan: 'cm',
        hints: ['1 km = 100.000 cm.', '1,5 × 100.000 = …'],
      },
      {
        id: 'lp2',
        label: 'Pada peta 1 : 25.000, jalan Taman Bambu – Kebun Teh panjangnya … cm',
        cek: { jenis: 'peta', jAsli: 1.5, satAsli: 'km', penyebut: 25000, satJawab: 'cm' },
        jawab: '6',
        satuan: 'cm',
        hints: ['Jarak sebenarnya sudah dalam cm: 150.000 cm.', '150.000 : 25.000 = …'],
        temuan:
          'Cek dengan penggaris di Lab Peta: jalan Taman Bambu – Kebun Teh memang 6 cm! Jarak pada peta = jarak sebenarnya (cm) : penyebut skala.',
      },
      {
        id: 'lp3',
        label: 'Panjang lapangan desa 40 m. Pada gambar berskala 1 : 500 panjangnya … cm',
        cek: { jenis: 'peta', jAsli: 40, satAsli: 'm', penyebut: 500, satJawab: 'cm' },
        jawab: '8',
        satuan: 'cm',
        hints: ['40 m = 4.000 cm.', '4.000 : 500 = …'],
        temuan: 'Cocok dengan Pembanding Skala: pada skala 1 : 500 lapangan digambar 8 cm.',
      },
      {
        id: 'lp4',
        label: 'Jarak 4 cm pada peta mewakili 1 km. Skala peta itu = …',
        cek: { jenis: 'skala', jPeta: 4, satPeta: 'cm', jAsli: 1, satAsli: 'km' },
        jawab: '1 : 25.000',
        placeholder: 'mis. 1 : 500',
        hints: [
          'Samakan satuan: 1 km = 100.000 cm.',
          '4 : 100.000 — bagi kedua suku dengan 4 agar suku pertama 1.',
        ],
        temuan: 'Skala ini sama dengan skala yang tercetak di peta desa!',
      },
      {
        id: 'lp5',
        label: 'Brosur wisata: jarak 8 cm di brosur mewakili 2,4 km. Skala brosur = …',
        cek: { jenis: 'skala', jPeta: 8, satPeta: 'cm', jAsli: 2.4, satAsli: 'km' },
        jawab: '1 : 30.000',
        placeholder: 'mis. 1 : 500',
        hints: ['2,4 km = 240.000 cm.', '8 : 240.000 = 1 : …'],
        temuan:
          'Skala = jarak pada peta : jarak sebenarnya (satuan sama), disederhanakan menjadi 1 : n.',
      },
    ],
    amati: [
      {
        id: 'bCara',
        tanya: 'Bagaimana menentukan jarak pada peta dari jarak sebenarnya?',
        opsi: [
          {
            id: 'ubahBagi',
            label: 'Ubah jarak sebenarnya ke cm, lalu bagi dengan penyebut skala',
          },
          { id: 'kali', label: 'Kalikan jarak sebenarnya dengan penyebut skala' },
          { id: 'langsung', label: 'Bagi jarak sebenarnya (dalam km) dengan penyebut skala' },
          { id: 'kurang', label: 'Kurangi jarak sebenarnya dengan penyebut skala' },
        ],
        correct: 'ubahBagi',
        umpan: {
          ubahBagi: 'Tepat! Satuan disamakan dulu dengan satuan peta (cm), baru dibagi.',
          kali: 'Dikali justru membuat gambarnya jauh lebih besar dari aslinya. Peta itu diperkecil.',
          langsung:
            'Kalau km langsung dibagi, hasilnya masih dalam km — angka yang sangat kecil dan sulit diukur. Ubah dulu ke cm.',
          kurang: 'Skala adalah perbandingan; hubungannya pembagian, bukan pengurangan.',
        },
      },
      {
        id: 'bBesar',
        tanya: 'Skala 1 : 500 dan 1 : 1.000 — mana yang menghasilkan gambar lebih besar?',
        opsi: [
          { id: 's500', label: '1 : 500, karena 1 cm mewakili jarak yang lebih pendek (5 m)' },
          { id: 's1000', label: '1 : 1.000, karena penyebutnya lebih besar' },
          { id: 'sama', label: 'Sama besar, karena bendanya sama' },
          { id: 'kertas', label: 'Bergantung pada besar kertasnya' },
        ],
        correct: 's500',
        umpan: {
          s500: 'Tepat! Makin kecil penyebut skala, makin besar (makin rinci) gambarnya.',
          s1000: 'Coba lagi di Pembanding Skala: penyebut besar membuat gambarnya makin kecil.',
          sama: 'Bendanya sama, tetapi 1 cm mewakili jarak yang berbeda. Lihat Pembanding Skala.',
          kertas:
            'Ukuran gambar ditentukan skala, bukan kertas. Kertas hanya menentukan muat atau tidak.',
        },
      },
      {
        id: 'bSkala',
        tanya: 'Bagaimana menentukan skala dari jarak pada peta dan jarak sebenarnya?',
        opsi: [
          {
            id: 'samakan',
            label:
              'Samakan satuannya, tulis jarak peta : jarak sebenarnya, sederhanakan jadi 1 : n',
          },
          { id: 'langsung', label: 'Tulis langsung angkanya, mis. 4 cm dan 1 km → 4 : 1' },
          { id: 'balik', label: 'Tulis jarak sebenarnya : jarak peta' },
          { id: 'kurang', label: 'Kurangi jarak sebenarnya dengan jarak peta' },
        ],
        correct: 'samakan',
        umpan: {
          samakan: 'Tepat! 4 cm : 1 km = 4 cm : 100.000 cm = 1 : 25.000.',
          langsung: 'Satuannya berbeda (cm dan km). Samakan dulu, baru bandingkan.',
          balik: 'Skala selalu ditulis jarak pada peta : jarak sebenarnya, jadi bentuknya 1 : n.',
          kurang: 'Skala adalah perbandingan (rasio), bukan selisih.',
        },
      },
    ],
    nextLabel: 'Lanjut ke Penyelidikan C →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENYELIDIKAN C: LAB DENAH (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikDenah: {
    kicker: 'Tahap 5 · Penyelidikan C — Lab Denah Aula',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menggunakan skala denah 1 : 200 untuk menggambar stand dan membaca ukuran ruang.',
    guru: 'Minta penata denah mengatur stand di Lab Denah sampai ukuran sebenarnya 3 m × 2 m, lalu menjelaskan mengapa panjang dan lebar sama-sama dibagi 200. Tanyakan: "Kalau denah digambar ulang dengan skala 1 : 100, apa yang berubah?"',
    labJudul: '🏗️ Lab Denah: gambar Stand 7D (3 m × 2 m)',
    labTeks:
      'Denah aula berskala 1 : 200 (petak 1 cm). Atur panjang dan lebar stand di denah sampai ukuran sebenarnya tepat 3 m × 2 m.',
    misiBelum: 'Atur dulu Stand 7D di Lab Denah sampai ukurannya pas 3 m × 2 m.',
    instruksi: 'Tulis kalimat matematikanya di buku, lalu isi jawabanmu.',
    langkah: [
      {
        id: 'ld1',
        label: 'Panjang aula 24 m. Pada denah 1 : 200 panjangnya … cm',
        cek: { jenis: 'peta', jAsli: 24, satAsli: 'm', penyebut: 200, satJawab: 'cm' },
        jawab: '12',
        satuan: 'cm',
        hints: ['24 m = 2.400 cm.', '2.400 : 200 = …'],
      },
      {
        id: 'ld2',
        label: 'Lebar aula 14 m. Pada denah panjangnya … cm',
        cek: { jenis: 'peta', jAsli: 14, satAsli: 'm', penyebut: 200, satJawab: 'cm' },
        jawab: '7',
        satuan: 'cm',
        hints: ['14 m = 1.400 cm.', '1.400 : 200 = …'],
        temuan: 'Cocok dengan denah: aula digambar 12 petak × 7 petak.',
      },
      {
        id: 'ld3',
        label: 'Panggung pentas panjangnya 8 m. Pada denah panjangnya … cm',
        cek: { jenis: 'peta', jAsli: 8, satAsli: 'm', penyebut: 200, satJawab: 'cm' },
        jawab: '4',
        satuan: 'cm',
        hints: ['8 m = 800 cm.', '800 : 200 = …'],
      },
      {
        id: 'ld4',
        label: 'Lebar pintu aula di denah 1 cm. Lebar pintu sebenarnya … m',
        cek: { jenis: 'asli', jPeta: 1, satPeta: 'cm', penyebut: 200, satJawab: 'm' },
        jawab: '2',
        satuan: 'm',
        hints: ['1 × 200 = 200 cm.', '200 cm = … m'],
      },
      {
        id: 'ld5',
        label: 'Jarak antarstand di denah 0,75 cm. Jarak sebenarnya … m',
        cek: { jenis: 'asli', jPeta: 0.75, satPeta: 'cm', penyebut: 200, satJawab: 'm' },
        jawab: '1,5',
        satuan: 'm',
        hints: ['0,75 × 200 = 150 cm.', '150 cm = … m'],
        temuan:
          'Pada denah 1 : 200, setiap 1 cm mewakili 2 m — semua ukuran memakai skala yang sama.',
      },
    ],
    amati: [
      {
        id: 'cSama',
        tanya: 'Mengapa panjang DAN lebar stand sama-sama dibagi 200 saat digambar di denah?',
        opsi: [
          {
            id: 'semua',
            label: 'Skala berlaku untuk semua ukuran, sehingga bentuk gambar sama dengan aslinya',
          },
          { id: 'panjang', label: 'Sebenarnya cukup panjangnya saja yang dibagi 200' },
          { id: 'kebetulan', label: 'Kebetulan saja, lebar boleh dibagi bilangan lain' },
          { id: 'luas', label: 'Karena luasnya juga dibagi 200' },
        ],
        correct: 'semua',
        umpan: {
          semua:
            'Tepat! Semua ukuran diperkecil dengan perbandingan yang sama, jadi bentuknya tidak berubah.',
          panjang:
            'Kalau hanya panjang yang diperkecil, gambar stand menjadi pipih dan tidak sesuai aslinya.',
          kebetulan: 'Bukan kebetulan — satu gambar memakai satu skala untuk semua ukuran.',
          luas: 'Hati-hati: panjang dan lebar masing-masing dibagi 200, jadi luasnya justru dibagi 200 × 200.',
        },
      },
      {
        id: 'cUlang',
        tanya:
          'Jika denah aula digambar ulang dengan skala 1 : 100, ukuran aula di denah menjadi …',
        opsi: [
          { id: 'duaKali', label: '24 cm × 14 cm — dua kali lebih besar' },
          { id: 'setengah', label: '6 cm × 3,5 cm — setengah kali lebih kecil' },
          { id: 'tetap', label: 'Tetap 12 cm × 7 cm' },
          { id: 'seratus', label: '2.400 cm × 1.400 cm' },
        ],
        correct: 'duaKali',
        umpan: {
          duaKali:
            'Tepat! 2.400 cm : 100 = 24 cm. Penyebut setengahnya → gambar dua kali lebih besar.',
          setengah: 'Penyebut 100 lebih kecil dari 200, jadi gambarnya justru lebih besar.',
          tetap: 'Skalanya berubah, maka ukuran gambar juga berubah.',
          seratus: 'Itu ukuran aula sebenarnya dalam cm, belum dibagi penyebut skala.',
        },
      },
    ],
    nextLabel: 'Susun Karya Kelompok →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGEMBANGKAN & MENYAJIKAN KARYA (PBL sintaks 4)
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 6 · Mengembangkan & Menyajikan Karya',
    syntax: PBL + ' · Sintaks 4',
    goal: 'Menghitung panjang sebenarnya tiga rute, memutuskan rute terbaik, lalu menyajikan Papan Rencana Jelajah.',
    guru: 'Minta setiap kelompok menjelaskan hitungannya dari peta sebelum memutuskan rute. Pancing pemeriksaan kewajaran: "Kalau 1 cm = 250 m, masuk akalkah 14 cm sekitar 3,5 km?" Poster dipresentasikan bergiliran (gallery walk).',
    instruksi: 'Hitung panjang sebenarnya setiap rute dari panjangnya di peta (1 : 25.000).',
    langkah: [
      {
        id: 'kr1',
        label:
          'Rute A: Balai Desa → Museum Batik → Sentra Gerabah = 4 cm + 6 cm = 10 cm di peta. Panjang sebenarnya … km',
        cek: { jenis: 'asli', jPeta: 10, satPeta: 'cm', penyebut: 25000, satJawab: 'km' },
        jawab: '2,5',
        satuan: 'km',
        hints: ['10 × 25.000 = 250.000 cm.', '250.000 cm = … km (: 100.000)'],
      },
      {
        id: 'kr2',
        label:
          'Rute B: Balai Desa → Taman Bambu → Museum Batik → Sentra Gerabah = 3 + 5 + 6 = 14 cm. Panjang sebenarnya … km',
        cek: { jenis: 'asli', jPeta: 14, satPeta: 'cm', penyebut: 25000, satJawab: 'km' },
        jawab: '3,5',
        satuan: 'km',
        hints: ['14 × 25.000 = 350.000 cm.', '350.000 cm = … km'],
      },
      {
        id: 'kr3',
        label:
          'Rute C: Balai Desa → Taman Bambu → Sentra Gerabah = 3 + 5 = 8 cm. Panjang sebenarnya … km',
        cek: { jenis: 'asli', jPeta: 8, satPeta: 'cm', penyebut: 25000, satJawab: 'km' },
        jawab: '2',
        satuan: 'km',
        hints: ['8 × 25.000 = 200.000 cm.', '200.000 cm = … km'],
      },
      {
        id: 'kr4',
        label: 'Batas jalan kaki 3 km. Pada peta 1 : 25.000, batas itu sepanjang … cm',
        cek: { jenis: 'peta', jAsli: 3, satAsli: 'km', penyebut: 25000, satJawab: 'cm' },
        jawab: '12',
        satuan: 'cm',
        hints: ['3 km = 300.000 cm.', '300.000 : 25.000 = …'],
        temuan: 'Rute yang panjangnya di peta lebih dari 12 cm pasti lebih dari 3 km.',
      },
    ],
    keputusan: {
      id: 'putus',
      tanya: 'Rute mana yang dipilih kelompokmu?',
      opsi: [
        { id: 'ruteA', label: 'Rute A — lewat Museum Batik, 2,5 km' },
        { id: 'ruteB', label: 'Rute B — lewat Museum Batik, 3,5 km' },
        { id: 'ruteC', label: 'Rute C — paling pendek, 2 km' },
        { id: 'semua', label: 'Semua rute boleh dipilih' },
      ],
      correct: 'ruteA',
      umpan: {
        ruteA:
          'Tepat! Rute A memenuhi kedua syarat: melewati Museum Batik dan 2,5 km ≤ 3 km (10 cm ≤ 12 cm).',
        ruteB:
          'Rute B memang melewati Museum Batik, tetapi 3,5 km melebihi batas 3 km (14 cm > 12 cm).',
        ruteC: 'Rute C paling pendek, tetapi tidak melewati Museum Batik yang wajib dikunjungi.',
        semua:
          'Periksa lagi kedua syarat Bu Rina: wajib lewat Museum Batik dan tidak lebih dari 3 km.',
      },
    },
    pesanLabel: 'Pesan kelompok untuk rombongan (tampil di poster)',
    pesanPlaceholder: 'Contoh: Ikuti Rute A — 2,5 km saja, jangan lupa bawa air minum!',
    posterJudul: 'Papan Rencana Jelajah 7D',
    posterFooter: 'Dihitung dengan peta desa 1 : 25.000 dan denah aula 1 : 200',
    nextLabel: 'Evaluasi Bersama →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENGANALISIS & MENGEVALUASI (PBL sintaks 5)
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 7 · Menganalisis & Mengevaluasi',
    syntax: PBL + ' · Sintaks 5',
    goal: 'Memeriksa solusi kelompok lain, membandingkan dugaan awal dengan hasil, dan merumuskan simpulan.',
    guru: 'Bacakan klaim kelompok lain seperti "kasus detektif". Minta murid menunjuk letak kekeliruan sebelum memilih kategori. Akhiri dengan membandingkan dugaan awal kelompok dan menyusun simpulan bersama.',
    judulDetektif: '🕵️ Detektif solusi: apa kekeliruannya?',
    opsiDetektif: [
      { id: 'tepat', label: 'Sudah tepat' },
      { id: 'satuan', label: 'Satuan hasil tidak diubah' },
      { id: 'operasi', label: 'Operasinya terbalik (kali ↔ bagi)' },
      { id: 'terbalik', label: 'Suku skala tertukar' },
      { id: 'makna', label: 'Salah memahami besar-kecil skala' },
    ],
    klaim: [
      {
        id: 'e1',
        teks: 'Kelompok Rajawali: "Jalan 6 cm pada peta 1 : 25.000 panjangnya 150.000 km."',
        correct: 'satuan',
        explanation: '6 × 25.000 = 150.000 cm, bukan km. 150.000 cm = 1,5 km.',
      },
      {
        id: 'e2',
        teks: 'Kelompok Merpati: "Jarak 2 km digambar di peta 1 : 25.000: 2 × 25.000 = 50.000 cm."',
        correct: 'operasi',
        explanation: 'Dari jarak sebenarnya ke peta harus dibagi: 200.000 cm : 25.000 = 8 cm.',
      },
      {
        id: 'e3',
        teks: 'Kelompok Elang: "4 cm di peta mewakili 1 km, jadi skalanya 25.000 : 1."',
        correct: 'terbalik',
        explanation: 'Skala = jarak peta : jarak sebenarnya = 4 : 100.000 = 1 : 25.000.',
      },
      {
        id: 'e4',
        teks: 'Kelompok Kakatua: "Supaya gambar lapangan lebih besar, kami ganti skala 1 : 500 menjadi 1 : 1.000."',
        correct: 'makna',
        explanation:
          'Penyebut yang lebih besar membuat gambar lebih kecil. Pakai skala 1 : 200 atau 1 : 250.',
      },
      {
        id: 'e5',
        teks: 'Kelompok Cendrawasih: "Rute 10 cm di peta 1 : 25.000 = 250.000 cm = 2,5 km, masih di bawah 3 km."',
        correct: 'tepat',
        explanation: '10 × 25.000 = 250.000 cm = 2,5 km < 3 km.',
      },
      {
        id: 'e6',
        teks: 'Kelompok Kenari: "Stand 3 m pada denah 1 : 200: 300 cm : 200 = 1,5 cm."',
        correct: 'tepat',
        explanation: 'Ukuran sebenarnya diubah ke cm lalu dibagi penyebut skala.',
      },
    ],
    judulDugaan: '🔁 Dugaan awal vs hasil penyelidikan',
    judulSimpulan: '🧩 Susun simpulan kelompok',
    instruksiSimpulan:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan dipakai sekali.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 's1', awal: 'Skala 1 : n berarti', correct: 'b1' },
      { id: 's2', awal: 'Jarak sebenarnya diperoleh dengan', correct: 'b2' },
      { id: 's3', awal: 'Jarak pada peta atau denah diperoleh dengan', correct: 'b3' },
      { id: 's4', awal: 'Skala ditentukan dengan', correct: 'b4' },
      { id: 's5', awal: 'Makin besar penyebut skala,', correct: 'b5' },
    ],
    bank: [
      { id: 'b1', teks: '1 cm pada peta mewakili n cm jarak sebenarnya.' },
      {
        id: 'b2',
        teks: 'mengalikan jarak pada peta dengan penyebut skala, lalu mengubah satuannya.',
      },
      {
        id: 'b3',
        teks: 'mengubah jarak sebenarnya ke cm, lalu membaginya dengan penyebut skala.',
      },
      {
        id: 'b4',
        teks: 'menyamakan satuan, lalu menyederhanakan jarak peta : jarak sebenarnya menjadi 1 : n.',
      },
      { id: 'b5', teks: 'makin kecil gambar pada peta atau denah.' },
      { id: 'x1', teks: 'makin besar gambar pada peta atau denah.' },
      { id: 'x2', teks: 'menjumlahkan jarak pada peta dengan penyebut skala.' },
    ],
    simpulanSalah: 'Belum tepat — ingat kembali temuan ketiga penyelidikan.',
    rangkuman: [
      'Skala 1 : n — 1 cm pada peta/denah mewakili n cm jarak sebenarnya (kedua suku bersatuan sama).',
      'Jarak sebenarnya = jarak pada peta × n, lalu ubah satuannya (100.000 cm = 1 km).',
      'Jarak pada peta = jarak sebenarnya (dalam cm) : n.',
      'Skala = jarak pada peta : jarak sebenarnya (satuan disamakan), ditulis 1 : n.',
      'Makin besar n, makin kecil gambarnya; makin kecil n, makin besar dan rinci gambarnya.',
    ],
    nextLabel: 'Uji Kemampuanmu →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP (8 soal acak dari bank 16)
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan skala untuk menentukan jarak sebenarnya, jarak pada peta atau denah, dan skala dalam masalah baru.',
    guru: 'Setiap murid mendapat soal acak yang berbeda. Minta murid menuliskan kalimat matematikanya di buku sebelum menjawab, lalu bandingkan strategi antarpasangan.',
    instruksi:
      'Tulis kalimat matematikanya di bukumu, lalu jawab. Bilangan desimal memakai koma (mis. 2,5); skala ditulis 1 : n.',
    banyak: 8,
    komposisi: { input: 4, choice: 4 },
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: 'peta',
        cek: { jenis: 'asli', jPeta: 7, satPeta: 'cm', penyebut: 50000, satJawab: 'km' },
        jawab: '3,5',
        cerita: 'Pada peta berskala 1 : 50.000, jarak dua desa 7 cm.',
        pertanyaan: 'Berapa km jarak sebenarnya kedua desa?',
        hints: ['7 × 50.000 = 350.000 cm.', '350.000 cm : 100.000 = … km'],
        reveal: '7 × 50.000 = 350.000 cm = 3,5 km.',
        explanation: 'Jarak peta dikali penyebut, lalu cm diubah ke km.',
      },
      {
        id: 't2',
        type: 'input',
        konteks: 'peta',
        cek: { jenis: 'peta', jAsli: 12, satAsli: 'km', penyebut: 300000, satJawab: 'cm' },
        jawab: '4',
        cerita: 'Jarak kota A ke kota B 12 km. Kota itu digambar pada peta berskala 1 : 300.000.',
        pertanyaan: 'Berapa cm jarak kedua kota pada peta?',
        hints: ['12 km = 1.200.000 cm.', '1.200.000 : 300.000 = …'],
        reveal: '1.200.000 cm : 300.000 = 4 cm.',
        explanation: 'Jarak sebenarnya diubah ke cm, lalu dibagi penyebut skala.',
      },
      {
        id: 't3',
        type: 'input',
        konteks: 'peta',
        cek: { jenis: 'skala', jPeta: 5, satPeta: 'cm', jAsli: 2, satAsli: 'km' },
        jawab: '1 : 40.000',
        cerita: 'Pada sebuah peta, jarak 5 cm mewakili jarak sebenarnya 2 km.',
        pertanyaan: 'Berapa skala peta itu? (tulis 1 : n)',
        hints: ['2 km = 200.000 cm.', '5 : 200.000 = 1 : …'],
        reveal: '5 cm : 200.000 cm = 1 : 40.000.',
        explanation: 'Samakan satuan, lalu sederhanakan menjadi 1 : n.',
      },
      {
        id: 't4',
        type: 'input',
        konteks: 'denah',
        cek: { jenis: 'asli', jPeta: 3.5, satPeta: 'cm', penyebut: 100, satJawab: 'm' },
        jawab: '3,5',
        cerita: 'Denah rumah Dina berskala 1 : 100. Panjang kamar Dina pada denah 3,5 cm.',
        pertanyaan: 'Berapa meter panjang kamar sebenarnya?',
        hints: ['3,5 × 100 = 350 cm.', '350 cm = … m'],
        reveal: '3,5 × 100 = 350 cm = 3,5 m.',
        explanation: 'Pada skala 1 : 100, setiap 1 cm di denah mewakili 1 m.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: 'denah',
        cek: { jenis: 'peta', jAsli: 9, satAsli: 'm', penyebut: 150, satJawab: 'cm' },
        jawab: '6',
        cerita: 'Panjang ruang kelas 9 m. Ruang itu digambar pada denah berskala 1 : 150.',
        pertanyaan: 'Berapa cm panjang ruang kelas pada denah?',
        hints: ['9 m = 900 cm.', '900 : 150 = …'],
        reveal: '900 cm : 150 = 6 cm.',
        explanation: 'Ukuran sebenarnya diubah ke cm, lalu dibagi penyebut skala.',
      },
      {
        id: 't6',
        type: 'input',
        konteks: 'denah',
        cek: { jenis: 'skala', jPeta: 12, satPeta: 'cm', jAsli: 60, satAsli: 'm' },
        jawab: '1 : 500',
        cerita: 'Lapangan sepak bola mini sepanjang 60 m digambar 12 cm pada denah sekolah.',
        pertanyaan: 'Berapa skala denah itu? (tulis 1 : n)',
        hints: ['60 m = 6.000 cm.', '12 : 6.000 = 1 : …'],
        reveal: '12 cm : 6.000 cm = 1 : 500.',
        explanation: 'Samakan satuan, lalu bagi kedua suku dengan 12.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: 'peta',
        cek: { jenis: 'asli', jPeta: 6.5, satPeta: 'cm', penyebut: 2000000, satJawab: 'km' },
        jawab: '130',
        cerita: 'Pada peta pulau berskala 1 : 2.000.000, jarak dua kota 6,5 cm.',
        pertanyaan: 'Berapa km jarak sebenarnya?',
        hints: ['1 cm mewakili 2.000.000 cm = 20 km.', '6,5 × 20 km = …'],
        reveal: '6,5 × 2.000.000 = 13.000.000 cm = 130 km.',
        explanation: 'Jarak peta × penyebut, lalu ubah cm ke km (: 100.000).',
      },
      {
        id: 't8',
        type: 'input',
        konteks: 'model',
        cek: { jenis: 'asli', jPeta: 24, satPeta: 'cm', penyebut: 50, satJawab: 'm' },
        jawab: '12',
        cerita: 'Miniatur bus berskala 1 : 50. Panjang miniatur bus 24 cm.',
        pertanyaan: 'Berapa meter panjang bus sebenarnya?',
        hints: ['24 × 50 = 1.200 cm.', '1.200 cm = … m'],
        reveal: '24 × 50 = 1.200 cm = 12 m.',
        explanation:
          'Skala juga dipakai pada miniatur: ukuran model × penyebut = ukuran sebenarnya.',
      },
      {
        id: 't9',
        type: 'choice',
        konteks: 'peta',
        cek: { jenis: 'asli', jPeta: 9, satPeta: 'cm', penyebut: 25000, satJawab: 'km' },
        jawab: '2,25',
        cerita: 'Jalur sepeda pada peta berskala 1 : 25.000 panjangnya 9 cm.',
        pertanyaan: 'Berapa km panjang jalur sepeda sebenarnya?',
        explanation: '9 × 25.000 = 225.000 cm = 2,25 km.',
      },
      {
        id: 't10',
        type: 'choice',
        konteks: 'peta',
        cek: { jenis: 'peta', jAsli: 4.5, satAsli: 'km', penyebut: 150000, satJawab: 'cm' },
        jawab: '3',
        cerita:
          'Jarak sebenarnya pantai ke bandara 4,5 km. Keduanya digambar pada peta 1 : 150.000.',
        pertanyaan: 'Berapa cm jarak pantai ke bandara pada peta?',
        explanation: '4,5 km = 450.000 cm; 450.000 : 150.000 = 3 cm.',
      },
      {
        id: 't11',
        type: 'choice',
        konteks: 'peta',
        cek: { jenis: 'skala', jPeta: 3, satPeta: 'cm', jAsli: 600, satAsli: 'm' },
        jawab: '1 : 20.000',
        cerita: 'Pada peta kecamatan, jarak 3 cm mewakili 600 m.',
        pertanyaan: 'Berapa skala peta itu?',
        explanation: '600 m = 60.000 cm; 3 : 60.000 = 1 : 20.000.',
      },
      {
        id: 't12',
        type: 'choice',
        konteks: 'denah',
        cek: { jenis: 'asli', jPeta: 15, satPeta: 'cm', penyebut: 200, satJawab: 'm' },
        jawab: '30',
        cerita: 'Pada denah sekolah berskala 1 : 200, panjang lapangan upacara 15 cm.',
        pertanyaan: 'Berapa meter panjang lapangan upacara sebenarnya?',
        explanation: '15 × 200 = 3.000 cm = 30 m.',
      },
      {
        id: 't13',
        type: 'choice',
        konteks: 'denah',
        cek: { jenis: 'peta', jAsli: 18, satAsli: 'm', penyebut: 300, satJawab: 'cm' },
        jawab: '6',
        cerita: 'Taman sekolah panjangnya 18 m dan akan digambar pada denah berskala 1 : 300.',
        pertanyaan: 'Berapa cm panjang taman pada denah?',
        explanation: '18 m = 1.800 cm; 1.800 : 300 = 6 cm.',
      },
      {
        id: 't14',
        type: 'choice',
        konteks: 'denah',
        cek: { jenis: 'skala', jPeta: 8, satPeta: 'cm', jAsli: 12, satAsli: 'm' },
        jawab: '1 : 150',
        cerita: 'Pada denah perpustakaan, panjang ruang baca 8 cm. Panjang sebenarnya 12 m.',
        pertanyaan: 'Berapa skala denah perpustakaan?',
        explanation: '12 m = 1.200 cm; 8 : 1.200 = 1 : 150.',
      },
      {
        id: 't15',
        type: 'choice',
        konteks: 'peta',
        cek: { jenis: 'asli', jPeta: 4, satPeta: 'cm', penyebut: 1500000, satJawab: 'km' },
        jawab: '60',
        cerita: 'Pada peta provinsi berskala 1 : 1.500.000, jarak dua kabupaten 4 cm.',
        pertanyaan: 'Berapa km jarak sebenarnya?',
        explanation: '4 × 1.500.000 = 6.000.000 cm = 60 km.',
      },
      {
        id: 't16',
        type: 'choice',
        konteks: 'model',
        cek: { jenis: 'peta', jAsli: 48, satAsli: 'm', penyebut: 400, satJawab: 'cm' },
        jawab: '12',
        cerita: 'Maket gedung sekolah dibuat dengan skala 1 : 400. Tinggi gedung sebenarnya 48 m.',
        pertanyaan: 'Berapa cm tinggi gedung pada maket?',
        explanation: '48 m = 4.800 cm; 4.800 : 400 = 12 cm.',
      },
    ],
    nextLabel: 'Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Refleksi',
    goal: 'Merefleksikan strategi, kekeliruan yang ditemukan, dan penggunaan skala dalam kehidupan.',
    guru: 'Beri waktu hening 3 menit untuk menulis. Undang beberapa murid membagikan contoh peta atau denah yang pernah mereka lihat (peta digital, denah rumah, maket).',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Kekeliruan apa yang paling sering kamu atau kelompokmu lakukan hari ini? Bagaimana cara menghindarinya?',
        placeholder: 'Contoh: kami lupa mengubah cm menjadi km …',
      },
      {
        id: 'r2',
        teks: 'Bagaimana kamu memeriksa apakah jawaban jarak sebenarnya masuk akal?',
        placeholder: 'Contoh: aku ingat 1 cm mewakili 250 m, jadi …',
      },
      {
        id: 'r3',
        teks: 'Di mana lagi kamu menemukan skala dalam kehidupan sehari-hari?',
        placeholder: 'Contoh: peta di aplikasi ponsel, denah rumah, miniatur …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu menggunakan skala untuk menentukan jarak sebenarnya dan jarak pada peta sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — bisa menjelaskan ke teman' },
      { id: 'yakin', label: '😊 Yakin — sesekali perlu mengecek' },
      { id: 'ragu', label: '🤔 Masih ragu di beberapa bagian' },
      { id: 'belum', label: '🙋 Belum yakin — perlu latihan lagi' },
    ],
    nextLabel: 'Selesai →',
  },

  selesai: {
    judul: 'Rencana jelajah siap dijalankan!',
    teks: 'Kamu sudah memakai skala untuk mengubah jarak pada peta menjadi jarak sebenarnya, menggambar benda pada denah, dan menentukan skala dari dua jarak.',
    contoh: [
      {
        konteks: 'peta',
        teks: 'Sebenarnya = peta × n',
        keterangan: 'lalu ubah satuannya',
      },
      {
        konteks: 'denah',
        teks: 'Peta = sebenarnya (cm) : n',
        keterangan: 'satuan disamakan dulu',
      },
      {
        konteks: 'model',
        teks: 'Skala = peta : sebenarnya',
        keterangan: 'disederhanakan jadi 1 : n',
      },
    ],
    capaian: [
      'Menjelaskan arti skala 1 : n dan mengukur jarak pada peta.',
      'Menentukan jarak sebenarnya dari jarak pada peta atau denah dalam cm, m, atau km.',
      'Menentukan jarak pada peta atau denah dari jarak sebenarnya, serta menentukan skala.',
      'Memilih rute dan menggambar denah berdasarkan perhitungan skala, lalu memeriksa solusi orang lain.',
    ],
  },
};
