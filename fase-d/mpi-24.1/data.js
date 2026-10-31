'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Pengaruh Perubahan Proporsional terhadap Sudut & Sisi
   Bangun Datar
   Fase D — SMP Kelas IX · Topik 24 Perubahan Proporsional Bangun
   Datar dan Ruang

   Tujuan Pembelajaran:
   Menjelaskan pengaruh perubahan panjang sisi secara proporsional
   terhadap besar sudut dan panjang sisi pada bangun datar melalui
   pengamatan dan pengukuran.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ............ 'stimulasi'
     Sintaks 2 — Problem statement ...... 'masalah'
     Sintaks 3 — Data collection ........ 'ukur', 'ubah'
     Sintaks 4 — Data processing ........ 'olahSisi', 'olahSudut'
     Sintaks 5 — Verification ........... 'verifikasi'
     Sintaks 6 — Generalization ......... 'generalisasi'
     Penerapan & penutup ................ 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 3 × 40 menit, murid berpasangan):
     1. Stimulasi    (8')  — Studio Mading Kelas: bendera kelas dicetak
                             2 kali lebih besar, foto poster ditarik
                             melebar di ponsel, bingkai poster ditambah
                             1 cm. Murid MENDUGA apa yang terjadi pada
                             sudut dan bentuk (tidak dinilai).
     2. Masalah      (5')  — memilih rumusan masalah & menulis hipotesis.
     3. Lab Ukur     (15') — mengukur sisi & sudut bendera ABC dan
                             cetakannya A′B′C′ (×1,5) dengan penggaris &
                             busur virtual; pertanyaan penuntun.
     4. Lab Ubah     (20') — mengubah bendera, poster, stiker, dan ubin:
                             kali k, tambah c, atau regang mendatar; hasil
                             diukur dan dicatat di tabel percobaan.
     5. Olah Sisi    (15') — rasio sisi baru ÷ sisi lama = k, sisi baru
                             = k × sisi lama, mencari sisi yang hilang,
                             keliling ikut dikali k.
     6. Olah Sudut   (15') — sudut tetap pada perubahan proporsional;
                             memilah 8 perubahan; kasus persegi panjang
                             (sudut tetap tetapi tidak proporsional) dan
                             persegi (ditambah tetap proporsional).
     7. Pembuktian   (15') — papan nama trapesium BARU: prediksi, ukur
                             hasil ×2, cocokkan, tanggapi miskonsepsi.
     8. Simpulan     (5')  — menyusun kesimpulan dari bank kalimat acak.
     9. Uji terap    (15') — 10 soal diambil acak dari bank 18 soal (isian
                             berdiagnosa & pilihan ganda berpengecoh).
    10. Refleksi     (5')  — rekap, refleksi tertulis, penilaian diri.

   Bangun datar ditulis sebagai { id, nama, jenis, titik, pts } (cm,
   sumbu y ke bawah; shared/engine.js seksi 26 & 90). Kunci hitungan
   ditulis sebagai objek `cek` (seksi 90) dan kunci pemilahan dihitung
   ulang dengan bandingUbahPP() di tests/mpi-24.1-data.test.js.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan. Teks DATA berupa
   teks biasa (di-escape app.js).
   ============================================================ */

var BANGUN_PPB = [
  {
    id: 'bendera',
    nama: 'Bendera kelas',
    jenis: 'segitiga',
    titik: ['A', 'B', 'C'],
    pts: [
      [0, 0],
      [0, 3],
      [4, 3],
    ],
  },
  {
    id: 'poster',
    nama: 'Poster',
    jenis: 'jajargenjang',
    titik: ['P', 'Q', 'R', 'S'],
    pts: [
      [0, 0],
      [4, 0],
      [4, 2],
      [0, 2],
    ],
  },
  {
    id: 'stiker',
    nama: 'Stiker persegi',
    jenis: 'jajargenjang',
    titik: ['K', 'L', 'M', 'N'],
    pts: [
      [0, 0],
      [3, 0],
      [3, 3],
      [0, 3],
    ],
  },
  {
    id: 'ubin',
    nama: 'Ubin hias',
    jenis: 'jajargenjang',
    titik: ['D', 'E', 'F', 'G'],
    pts: [
      [1.8, 0],
      [5.8, 0],
      [4, 2.4],
      [0, 2.4],
    ],
  },
  {
    id: 'papan',
    nama: 'Papan nama meja',
    jenis: 'trapesium',
    titik: ['T', 'U', 'V', 'W'],
    pts: [
      [1.5, 0],
      [4.5, 0],
      [6, 2],
      [0, 2],
    ],
  },
];

var OPSI_YA_TIDAK_PPB = [
  { id: 'ya', label: 'Proporsional — bentuk tetap' },
  { id: 'tidak', label: 'Tidak proporsional — bentuk berubah' },
];

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1 (Stimulation)',
    goal: 'Mengamati bangun datar yang diperbesar, ditarik, dan ditambah ukurannya, lalu menduga apa yang terjadi pada sudut dan bentuknya.',
    tp: 'Menjelaskan pengaruh perubahan panjang sisi secara proporsional terhadap besar sudut dan panjang sisi pada bangun datar melalui pengamatan dan pengukuran.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Mengukur panjang sisi dan besar sudut bangun datar sebelum dan sesudah diubah.',
      'Menentukan faktor perubahan k = sisi baru ÷ sisi lama.',
      'Menjelaskan bahwa pada perubahan proporsional setiap sisi dikali k yang sama dan besar sudut tetap.',
      'Membedakan perubahan proporsional dengan perubahan yang tidak proporsional (ditambah atau ditarik satu arah).',
    ],
    guru: 'Tampilkan ketiga gambar di layar kelas. Biarkan murid berpendapat bebas; dugaan belum dinilai dan akan ditanggapi kembali pada tahap Simpulan.',
    judul: 'Studio Mading Kelas',
    cerita:
      'Tim mading kelas IX sedang menyiapkan pameran. Bendera kelas dicetak dua kali lebih besar untuk lomba, foto poster ditarik melebar di ponsel agar memenuhi layar, dan bingkai poster ditambah 1 cm di setiap sisinya. Sekilas semuanya "hanya diperbesar". Benarkah bentuknya tetap sama?',
    galeri: [
      {
        id: 'g1',
        bangun: 'bendera',
        aksi: { jenis: 'kali', nilai: 2 },
        keterangan: 'Bendera dicetak 2 kali lebih besar',
      },
      {
        id: 'g2',
        bangun: 'poster',
        aksi: { jenis: 'regang', nilai: 2 },
        keterangan: 'Foto poster ditarik melebar di ponsel',
      },
      {
        id: 'g3',
        bangun: 'poster',
        aksi: { jenis: 'tambah', nilai: 1 },
        keterangan: 'Poster ditambah 1 cm di setiap sisi',
      },
    ],
    dugaan: [
      {
        id: 'd1',
        tanya: 'Jika setiap sisi bendera dikali 2, menurutmu apa yang terjadi pada sudut-sudutnya?',
        opsi: [
          { id: 'tetap', label: 'Besar sudutnya tetap sama' },
          { id: 'kali', label: 'Besar sudutnya ikut dikali 2' },
          { id: 'bagi', label: 'Besar sudutnya menjadi setengahnya' },
          { id: 'acak', label: 'Ada yang membesar, ada yang mengecil' },
        ],
      },
      {
        id: 'd2',
        tanya:
          'Agar bentuk poster tidak "gepeng" saat diperbesar, apa yang harus dilakukan pada sisi-sisinya?',
        opsi: [
          { id: 'kali', label: 'Setiap sisi dikali bilangan yang sama' },
          { id: 'tambah', label: 'Setiap sisi ditambah panjang yang sama' },
          { id: 'panjang', label: 'Cukup panjangnya saja yang diperbesar' },
          { id: 'bebas', label: 'Sisi boleh diubah sembarang, bentuk pasti tetap' },
        ],
      },
    ],
    alasanLabel: 'Tuliskan alasan dugaanmu (boleh singkat):',
    alasanPlaceholder: 'Menurutku … karena …',
    catatan:
      'Dugaanmu belum dinilai benar atau salah. Kamu akan membuktikannya sendiri dengan mengukur.',
    nextLabel: 'Lanjut ke Rumusan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: 'Discovery Learning · Sintaks 2 (Problem Statement)',
    goal: 'Merumuskan pertanyaan yang akan diselidiki dan menuliskan hipotesis.',
    guru: 'Tekankan kata kunci "proporsional": setiap sisi dikali bilangan yang SAMA. Hipotesis boleh keliru; yang penting dapat diuji dengan pengukuran.',
    pengantar:
      'Dari Studio Mading, kita melihat tiga cara mengubah ukuran bangun. Sebelum menyelidiki, tentukan dulu pertanyaan utamanya.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk diselidiki hari ini?',
    opsi: [
      {
        id: 'pengaruh',
        label:
          'Bagaimana pengaruh mengubah panjang sisi secara proporsional (dikali bilangan yang sama) terhadap besar sudut dan panjang sisi bangun datar?',
      },
      { id: 'luas', label: 'Berapa luas kertas yang dibutuhkan untuk mencetak poster?' },
      { id: 'gambar', label: 'Bagaimana cara menggambar bendera segitiga yang rapi?' },
      { id: 'banyak', label: 'Berapa banyak bendera yang dapat dibuat dari satu lembar kain?' },
    ],
    correct: 'pengaruh',
    umpan: {
      pengaruh:
        'Tepat! Pertanyaan ini dapat diselidiki dengan mengukur sisi dan sudut sebelum dan sesudah bangun diubah.',
      luas: 'Luas memang menarik, tetapi hari ini kita fokus pada SUDUT dan PANJANG SISI saat ukuran diubah.',
      gambar:
        'Menggambar rapi itu penting, tetapi pertanyaan ini tidak menyelidiki pengaruh perubahan ukuran.',
      banyak:
        'Pertanyaan ini tentang memotong kain, bukan tentang pengaruh perubahan sisi terhadap sudut dan sisi.',
    },
    hipotesisLabel: 'Tuliskan hipotesismu: jika setiap sisi dikali bilangan yang sama, maka …',
    hipotesisPlaceholder: 'Jika setiap sisi dikali 2, maka sudutnya … dan sisinya …',
    nextLabel: 'Mulai Mengukur →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — LAB UKUR (pengumpulan data)
     ---------------------------------------------------------- */
  ukur: {
    kicker: 'Tahap 3 · Mengumpulkan Data',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Mengukur panjang sisi dan besar sudut bendera ABC dan cetakannya A′B′C′.',
    guru: 'Bila memungkinkan, sediakan juga bendera kertas asli dan cetakan ×1,5 agar murid mengukur dengan penggaris dan busur sungguhan, lalu membandingkannya dengan hasil di layar.',
    instruksi:
      'Bendera kelas ABC dicetak ulang dengan setiap sisinya dikali 1,5 menjadi A′B′C′. Ketuk setiap sisi dan sudut pada KEDUA bendera untuk mengukurnya dengan penggaris dan busur virtual.',
    asli: 'bendera',
    k: 1.5,
    judulAsli: 'Bendera ABC (asli)',
    judulCetak: 'Bendera A′B′C′ (cetakan)',
    tanyaInstruksi: 'Bandingkan hasil pengukuranmu pada kedua bendera.',
    tanya: [
      {
        id: 'u1',
        tanya: 'Bandingkan ∠A′ dengan ∠A, ∠B′ dengan ∠B, dan ∠C′ dengan ∠C. Apa yang kamu temukan?',
        opsi: [
          { id: 'sama', label: 'Setiap pasang sudut sama besar' },
          { id: 'kali', label: 'Sudut cetakan 1,5 kali sudut asli' },
          { id: 'kecil', label: 'Sudut cetakan lebih kecil' },
          { id: 'tambah', label: 'Sudut cetakan bertambah 1,5°' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Benar! Walaupun bendera diperbesar, besar sudutnya tetap.',
          kali: 'Coba lihat lagi hasil busurmu: ∠A = 53° dan ∠A′ juga 53°. Sudutnya tidak dikali.',
          kecil: 'Periksa lagi hasil busurmu: kedua sudut menunjukkan angka yang sama.',
          tambah: 'Bandingkan angkanya: ∠B = 90° dan ∠B′ = 90°. Tidak ada tambahan.',
        },
      },
      {
        id: 'u2',
        tanya: 'Hitung A′B′ ÷ AB, B′C′ ÷ BC, dan C′A′ ÷ CA. Hasilnya …',
        opsi: [
          { id: 'sama', label: 'Semuanya 1,5' },
          { id: 'beda', label: 'Berbeda-beda untuk setiap sisi' },
          { id: 'satu', label: 'Semuanya 1' },
          { id: 'dua', label: 'Semuanya 2' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Tepat! 4,5 ÷ 3 = 6 ÷ 4 = 7,5 ÷ 5 = 1,5. Rasio setiap sisi bersesuaian sama.',
          beda: 'Coba hitung lagi: 4,5 ÷ 3, 6 ÷ 4, dan 7,5 ÷ 5. Apakah hasilnya memang berbeda?',
          satu: 'Rasio 1 berarti sisinya sama panjang. Padahal sisi cetakan lebih panjang.',
          dua: 'Periksa lagi: 4,5 ÷ 3 = 1,5, bukan 2.',
        },
      },
      {
        id: 'u3',
        tanya: 'Sekarang hitung selisihnya: A′B′ − AB, B′C′ − BC, dan C′A′ − CA. Hasilnya …',
        opsi: [
          { id: 'beda', label: 'Berbeda-beda: 1,5 cm; 2 cm; dan 2,5 cm' },
          { id: 'sama', label: 'Semuanya bertambah 1,5 cm' },
          { id: 'nol', label: 'Semuanya 0 cm' },
          { id: 'dua', label: 'Semuanya bertambah 2 cm' },
        ],
        correct: 'beda',
        umpan: {
          beda: 'Benar! Sisi yang lebih panjang bertambah lebih banyak. Perubahannya berupa PERKALIAN, bukan penambahan.',
          sama: 'Coba hitung: 4,5 − 3 = 1,5, tetapi 6 − 4 = 2. Selisihnya tidak sama.',
          nol: 'Sisi cetakan lebih panjang, jadi selisihnya tidak nol.',
          dua: 'Hanya B′C′ − BC yang bertambah 2 cm. Sisi lain bertambah berbeda.',
        },
      },
    ],
    temuan:
      'Temuan sementara: setelah setiap sisi dikali 1,5, sudut-sudutnya tetap, sedangkan setiap sisi baru = 1,5 × sisi lama (bertambahnya tidak sama).',
    nextLabel: 'Lanjut ke Lab Ubah Ukuran →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — LAB UBAH UKURAN (pengumpulan data)
     ---------------------------------------------------------- */
  ubah: {
    kicker: 'Tahap 4 · Mengumpulkan Data',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Mencoba tiga cara mengubah ukuran bangun datar dan mencatat pengaruhnya pada sisi dan sudut.',
    guru: 'Minta setiap pasangan mencoba ketiga jenis perubahan pada beberapa bangun. Arahkan murid yang hanya mencoba "kali" agar juga mencoba "tambah" dan "regang" pada persegi panjang dan persegi.',
    instruksi:
      'Pilih bangun, pilih cara mengubahnya, pilih nilainya, lalu tekan "Ubah & ukur". Amati gambar dan tabel hasil pengukuran. Lakukan minimal lima percobaan dengan ketiga cara perubahan.',
    lab: {
      bangun: ['bendera', 'poster', 'stiker', 'ubin'],
      nilai: { kali: [0.5, 1.5, 2, 3], tambah: [1, 1.5], regang: [1.5, 2] },
      minCoba: 5,
    },
    logJudul: '📒 Catatan percobaan',
    tanyaInstruksi: 'Gunakan catatan percobaanmu untuk menjawab.',
    tanya: [
      {
        id: 'b1',
        tanya:
          'Perubahan mana yang SELALU membuat rasio sisi sama dan sudut tetap pada semua bangun?',
        opsi: [
          { id: 'kali', label: 'Mengalikan setiap sisi dengan bilangan yang sama' },
          { id: 'tambah', label: 'Menambah setiap sisi dengan panjang yang sama' },
          { id: 'regang', label: 'Meregang ukuran mendatarnya saja' },
          { id: 'semua', label: 'Ketiga cara perubahan' },
        ],
        correct: 'kali',
        umpan: {
          kali: 'Tepat! Pada setiap bangun, dikali k membuat semua rasio sisi = k dan sudutnya tetap.',
          tambah:
            'Lihat catatanmu untuk bendera yang ditambah 1 cm: rasio sisinya berbeda dan sudutnya berubah.',
          regang: 'Saat diregang, ukuran tegaknya tidak berubah, jadi rasio sisinya tidak sama.',
          semua: 'Periksa catatanmu: "tambah" dan "regang" sering menghasilkan "Tidak".',
        },
      },
      {
        id: 'b2',
        tanya:
          'Bendera yang setiap sisinya ditambah 1 cm (3, 4, 5 menjadi 4, 5, 6). Apa yang terjadi pada sudutnya?',
        opsi: [
          { id: 'berubah', label: 'Sudutnya berubah, bentuknya tidak sama lagi' },
          { id: 'tetap', label: 'Sudutnya tetap, karena semua sisi bertambah sama' },
          { id: 'tambah', label: 'Setiap sudut bertambah 1°' },
          { id: 'kali', label: 'Setiap sudut dikali 1' },
        ],
        correct: 'berubah',
        umpan: {
          berubah:
            'Benar! ∠B yang semula 90° berubah menjadi sekitar 83°. Menambah panjang yang sama mengubah bentuk segitiga.',
          tetap: 'Coba ukur ∠B′ di Lab: hasilnya tidak lagi 90°.',
          tambah: 'Sudut tidak bertambah 1°. Ukur kembali dengan busur di Lab.',
          kali: 'Dikali 1 berarti tetap, padahal busur menunjukkan sudut yang berbeda.',
        },
      },
      {
        id: 'b3',
        tanya:
          'Poster 4 cm × 2 cm ditambah 1 cm setiap sisi menjadi 5 cm × 3 cm. Sudutnya tetap 90°. Apakah perubahannya proporsional?',
        opsi: [
          { id: 'tidak', label: 'Tidak, karena 5 ÷ 4 tidak sama dengan 3 ÷ 2' },
          { id: 'ya', label: 'Ya, karena sudutnya tetap 90°' },
          { id: 'ya2', label: 'Ya, karena semua sisi bertambah 1 cm' },
          { id: 'tidak2', label: 'Tidak, karena sudutnya berubah' },
        ],
        correct: 'tidak',
        umpan: {
          tidak:
            'Tepat! 5 ÷ 4 = 1,25 tetapi 3 ÷ 2 = 1,5. Sudut tetap saja BELUM cukup; rasio semua sisi juga harus sama.',
          ya: 'Semua persegi panjang memang bersudut 90°, tetapi bentuknya bisa lebih gemuk atau ramping. Bandingkan rasionya.',
          ya2: 'Bertambah sama panjang berbeda dengan dikali bilangan yang sama. Hitung 5 ÷ 4 dan 3 ÷ 2.',
          tidak2: 'Sudut persegi panjang tetap 90°. Alasannya ada pada rasio sisinya.',
        },
      },
      {
        id: 'b4',
        tanya:
          'Stiker persegi 3 cm ditambah 1 cm menjadi persegi 4 cm, dan Lab mencatat "proporsional". Mengapa?',
        opsi: [
          {
            id: 'persegi',
            label: 'Semua sisinya sama panjang, jadi setiap sisi dikali 4 ÷ 3 yang sama',
          },
          { id: 'selalu', label: 'Karena menambah panjang selalu proporsional' },
          { id: 'sudut', label: 'Karena sudut persegi ikut bertambah' },
          { id: 'kebetulan', label: 'Karena Lab salah menghitung' },
        ],
        correct: 'persegi',
        umpan: {
          persegi:
            'Benar! Ini kasus khusus: pada persegi, menambah sama panjang sama artinya dengan mengalikan dengan faktor yang sama.',
          selalu:
            'Tidak selalu. Ingat bendera dan poster yang ditambah: hasilnya tidak proporsional.',
          sudut: 'Sudut persegi selalu 90°, tidak bertambah.',
          kebetulan: 'Lab tidak salah. Hitung 4 ÷ 3 untuk keempat sisi: hasilnya sama.',
        },
      },
    ],
    temuan:
      'Temuan: perubahan proporsional (setiap sisi dikali bilangan yang sama) membuat rasio sisi sama dan sudut tetap. Menambah panjang yang sama atau meregang satu arah umumnya mengubah bentuk.',
    nextLabel: 'Lanjut Mengolah Data Sisi →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — OLAH SISI (pengolahan data)
     ---------------------------------------------------------- */
  olahSisi: {
    kicker: 'Tahap 5 · Mengolah Data',
    syntax: 'Discovery Learning · Sintaks 4 (Data Processing)',
    goal: 'Mengolah data panjang sisi: faktor perubahan k, sisi baru = k × sisi lama, dan sisi yang belum diketahui.',
    guru: 'Perhatikan murid yang menjawab dengan menambah selisih (miskonsepsi aditif). Minta mereka membandingkan dengan data Lab Ukur: selisih tiap sisi berbeda.',
    instruksiKonsep: 'Jawab dulu dua pertanyaan konsep dari data Lab Ukur dan Lab Ubah.',
    konsep: [
      {
        id: 'k1',
        tanya:
          'Pada perubahan proporsional dengan faktor k, hubungan sisi baru dan sisi lama adalah …',
        opsi: [
          { id: 'kali', label: 'sisi baru = k × sisi lama' },
          { id: 'tambah', label: 'sisi baru = sisi lama + k' },
          { id: 'bagi', label: 'sisi baru = sisi lama ÷ k' },
          { id: 'kuadrat', label: 'sisi baru = k × k × sisi lama' },
        ],
        correct: 'kali',
        umpan: {
          kali: 'Benar! Setiap sisi dikali faktor k yang sama.',
          tambah:
            'Jika ditambah k, selisih semua sisi sama. Data Lab Ukur menunjukkan selisihnya berbeda.',
          bagi: 'Dibagi k dipakai untuk mencari sisi LAMA dari sisi baru.',
          kuadrat: 'Sisi cukup dikali k satu kali.',
        },
      },
      {
        id: 'k2',
        tanya: 'Jika faktor perubahannya k = 0,5, maka bangunnya …',
        opsi: [
          { id: 'kecil', label: 'mengecil menjadi setengah ukuran, sudut tetap' },
          { id: 'besar', label: 'membesar dua kali, sudut tetap' },
          { id: 'sudut', label: 'mengecil dan sudutnya menjadi setengah' },
          { id: 'bentuk', label: 'bentuknya berubah karena k kurang dari 1' },
        ],
        correct: 'kecil',
        umpan: {
          kecil: 'Tepat! k < 1 memperkecil bangun; bentuk dan sudutnya tetap.',
          besar: 'k = 0,5 berarti setiap sisi menjadi setengahnya, jadi bangun mengecil.',
          sudut: 'Sudut tidak ikut dikali, baik k lebih dari 1 maupun kurang dari 1.',
          bentuk: 'Selama semua sisi dikali bilangan yang sama, bentuknya tetap.',
        },
      },
    ],
    langkahInstruksi:
      'Isi setiap titik-titik. Jawaban desimal memakai koma, mis. 1,5. Jika keliru, baca umpan baliknya lalu coba lagi.',
    langkah: [
      {
        id: 'l1',
        label: 'Bendera cetakan: A′B′ ÷ AB = 4,5 ÷ 3 = …',
        cek: { minta: 'faktor', lama: 3, baru: 4.5 },
        hints: ['Bagi panjang sisi baru dengan panjang sisi lama.'],
      },
      {
        id: 'l2',
        label: 'Poster 4 cm × 2 cm dicetak proporsional sehingga panjangnya 10 cm. Faktor k = …',
        cek: { minta: 'faktor', lama: 4, baru: 10 },
        hints: ['k = panjang baru ÷ panjang lama = 10 ÷ 4.'],
      },
      {
        id: 'l3',
        label: 'Lebar poster cetakan itu = … cm',
        cek: { minta: 'sisiHilang', a1: 4, a2: 10, b1: 2 },
        hints: [
          'Lebar juga dikali faktor yang sama, k = 2,5.',
          'Lebar baru = 2,5 × 2. Jangan menambah 6 cm seperti pada panjangnya!',
        ],
      },
      {
        id: 'l4',
        label: 'Stiker hasil perbesaran ×3 bersisi 9 cm. Sisi stiker semula = … cm',
        cek: { minta: 'sisiLama', baru: 9, k: 3 },
        hints: ['Sisi baru = 3 × sisi lama, jadi sisi lama = sisi baru ÷ 3.'],
      },
      {
        id: 'l5',
        label: 'Bendera 3 cm, 4 cm, 5 cm dicetak ×1,5. Keliling bendera cetakan = … cm',
        cek: { minta: 'kelilingBaru', sisi: [3, 4, 5], k: 1.5 },
        hints: [
          'Hitung dulu keliling bendera asli: 3 + 4 + 5.',
          'Setiap sisi dikali 1,5, jadi keliling juga dikali 1,5.',
        ],
      },
    ],
    temuan:
      'Temuan: pada perubahan proporsional, setiap sisi baru = k × sisi lama, dengan k = sisi baru ÷ sisi lama. Keliling pun ikut dikali k.',
    nextLabel: 'Lanjut Mengolah Data Sudut →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — OLAH SUDUT (pengolahan data)
     ---------------------------------------------------------- */
  olahSudut: {
    kicker: 'Tahap 6 · Mengolah Data',
    syntax: 'Discovery Learning · Sintaks 4 (Data Processing)',
    goal: 'Mengolah data besar sudut dan memilah perubahan yang proporsional dan yang tidak.',
    guru: 'Diskusikan kasus persegi panjang yang ditambah (sudut tetap, tetapi tidak proporsional) dan persegi yang ditambah (kasus khusus yang proporsional). Keduanya menguatkan bahwa syarat utamanya adalah rasio sisi yang sama.',
    langkahInstruksi: 'Tentukan besar sudut setelah bangun diubah secara proporsional.',
    langkah: [
      {
        id: 's1',
        label: 'Bendera diperbesar ×3. ∠B = 90°, maka ∠B′ = …',
        cek: { minta: 'sudutBaru', sudut: 90, k: 3 },
        hints: ['Ingat hasil busur di Lab Ukur: apakah sudut berubah saat bendera diperbesar?'],
      },
      {
        id: 's2',
        label: 'Bendera diperkecil ×0,5. ∠A ≈ 53°, maka ∠A′ = …',
        cek: { minta: 'sudutBaru', sudut: 53, k: 0.5 },
        hints: ['Diperkecil secara proporsional tetap tidak mengubah besar sudut.'],
      },
      {
        id: 's3',
        label: 'Ubin hias diperbesar ×2. ∠D ≈ 127°, maka ∠D′ = …',
        cek: { minta: 'sudutBaru', sudut: 127, k: 2 },
        hints: ['Sudut bersesuaian pada perubahan proporsional sama besar.'],
      },
    ],
    instruksiPilah:
      'Pilah setiap perubahan berikut: proporsional (bentuk tetap) atau tidak proporsional (bentuk berubah). Perhatikan gambar sebelum (biru) dan sesudah (oranye).',
    opsiKlas: OPSI_YA_TIDAK_PPB,
    pilah: [
      { id: 'p1', bangun: 'bendera', aksi: { jenis: 'kali', nilai: 2 }, correct: 'ya' },
      { id: 'p2', bangun: 'bendera', aksi: { jenis: 'tambah', nilai: 1 }, correct: 'tidak' },
      { id: 'p3', bangun: 'poster', aksi: { jenis: 'tambah', nilai: 1.5 }, correct: 'tidak' },
      { id: 'p4', bangun: 'poster', aksi: { jenis: 'regang', nilai: 2 }, correct: 'tidak' },
      { id: 'p5', bangun: 'stiker', aksi: { jenis: 'tambah', nilai: 1 }, correct: 'ya' },
      { id: 'p6', bangun: 'stiker', aksi: { jenis: 'regang', nilai: 1.5 }, correct: 'tidak' },
      { id: 'p7', bangun: 'ubin', aksi: { jenis: 'kali', nilai: 0.5 }, correct: 'ya' },
      { id: 'p8', bangun: 'ubin', aksi: { jenis: 'regang', nilai: 1.5 }, correct: 'tidak' },
    ],
    konsepInstruksi: 'Simpulkan dari hasil pemilahanmu.',
    konsep: [
      {
        id: 'o1',
        tanya: 'Sebuah perubahan ukuran disebut proporsional jika …',
        opsi: [
          { id: 'kali', label: 'setiap sisi dikali bilangan yang sama' },
          { id: 'sudut', label: 'sudutnya tetap, sisinya boleh berubah sembarang' },
          { id: 'tambah', label: 'setiap sisi ditambah panjang yang sama' },
          { id: 'besar', label: 'bangunnya menjadi lebih besar' },
        ],
        correct: 'kali',
        umpan: {
          kali: 'Benar! Rasio sisi baru ÷ sisi lama sama untuk semua sisi.',
          sudut: 'Ingat poster yang ditambah: sudutnya tetap 90° tetapi tidak proporsional.',
          tambah: 'Menambah sama panjang umumnya mengubah bentuk (kecuali kasus khusus persegi).',
          besar: 'Diperkecil pun bisa proporsional, misalnya ubin ×0,5.',
        },
      },
      {
        id: 'o2',
        tanya: 'Apa pengaruh perubahan proporsional terhadap besar sudut?',
        opsi: [
          { id: 'tetap', label: 'Setiap sudut tetap sama besar dengan sudut bersesuaian semula' },
          { id: 'kali', label: 'Setiap sudut dikali faktor k' },
          { id: 'tambah', label: 'Setiap sudut bertambah k derajat' },
          { id: 'jumlah', label: 'Jumlah sudutnya menjadi k kali lipat' },
        ],
        correct: 'tetap',
        umpan: {
          tetap: 'Tepat! Ukuran berubah, sudut dan bentuk tetap.',
          kali: 'Jika sudut dikali 2, jumlah sudut segitiga menjadi 360° — tidak mungkin!',
          tambah: 'Busur di Lab menunjukkan angka yang sama sebelum dan sesudah.',
          jumlah: 'Jumlah sudut segitiga selalu 180°, berapa pun ukurannya.',
        },
      },
    ],
    temuan:
      'Temuan: pada perubahan proporsional besar sudut TETAP. Sudut tetap saja belum cukup (contoh: persegi panjang yang ditambah); rasio semua sisi juga harus sama.',
    nextLabel: 'Lanjut ke Pembuktian →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 7 · Pembuktian',
    syntax: 'Discovery Learning · Sintaks 5 (Verification)',
    goal: 'Menguji temuan pada bangun baru: memprediksi, mengukur, lalu mencocokkan.',
    guru: 'Papan nama trapesium belum pernah dipakai di Lab, sehingga murid benar-benar menguji temuannya. Minta murid membacakan prediksinya sebelum mengukur.',
    bangun: 'papan',
    k: 2,
    instruksiPrediksi:
      'Papan nama meja TUVW berbentuk trapesium. Papan itu akan dibuat ulang dengan setiap sisinya dikali 2. Prediksi dulu sebelum mengukur!',
    opsiPrediksi: [
      { id: 'benar', label: 'Sudutnya tetap; setiap sisi menjadi 2 kali panjang semula' },
      { id: 'sudutKali', label: 'Sudutnya dikali 2; setiap sisi menjadi 2 kali panjang semula' },
      { id: 'tambah', label: 'Sudutnya tetap; setiap sisi bertambah 2 cm' },
      { id: 'tetap', label: 'Sudut dan sisinya tetap sama' },
    ],
    prediksiBenar: 'benar',
    judulAsli: 'Papan TUVW (semula)',
    judulBaru: 'Papan T′U′V′W′ (setiap sisi × 2)',
    instruksiUkur: 'Sekarang ukur semua sisi dan sudut papan semula dan papan baru.',
    instruksiHitung: 'Cocokkan hasil pengukuranmu.',
    langkah: [
      {
        id: 'v1',
        label: 'V′W′ ÷ VW = 12 ÷ 6 = …',
        cek: { minta: 'faktor', lama: 6, baru: 12 },
        hints: ['Bagi sisi baru dengan sisi lama.'],
      },
      {
        id: 'v2',
        label: '∠T ≈ 127°, maka ∠T′ = …',
        cek: { minta: 'sudutBaru', sudut: 127, k: 2 },
        hints: ['Lihat hasil busur pada papan baru.'],
      },
    ],
    instruksiMiskonsepsi: 'Tanggapi pendapat teman-temanmu berikut.',
    soal: [
      {
        id: 'm1',
        teks: 'Raka: "Segitiga diperbesar 2 kali, jadi sudut 60° menjadi 120°."',
        options: [
          { id: 'salah', label: 'Raka keliru; sudutnya tetap 60°' },
          { id: 'benar', label: 'Raka benar; sudut ikut dikali 2' },
          { id: 'setengah', label: 'Raka keliru; sudutnya menjadi 30°' },
          { id: 'tergantung', label: 'Tergantung panjang sisinya' },
        ],
        correct: 'salah',
        explanation:
          'Pada perubahan proporsional sudut tidak berubah. Jika setiap sudut dikali 2, jumlah sudut segitiga menjadi 360°, padahal selalu 180°.',
      },
      {
        id: 'm2',
        teks: 'Sinta: "Persegi panjang 6 cm × 4 cm aku perbesar menjadi 8 cm × 6 cm. Sudutnya tetap 90°, jadi pasti proporsional."',
        options: [
          { id: 'salah', label: 'Sinta keliru; 8 ÷ 6 tidak sama dengan 6 ÷ 4' },
          { id: 'benar', label: 'Sinta benar; sudut tetap berarti proporsional' },
          { id: 'salah2', label: 'Sinta keliru; sudutnya menjadi lebih dari 90°' },
          { id: 'benar2', label: 'Sinta benar; kedua sisi bertambah 2 cm' },
        ],
        correct: 'salah',
        explanation:
          '8 ÷ 6 ≈ 1,33 sedangkan 6 ÷ 4 = 1,5. Rasionya berbeda, jadi tidak proporsional walaupun sudutnya tetap 90°.',
      },
      {
        id: 'm3',
        teks: 'Dimas: "Sisi 3 cm diperbesar menjadi 6 cm. Maka sisi 5 cm menjadi 8 cm karena sama-sama bertambah 3 cm."',
        options: [
          { id: 'salah', label: 'Dimas keliru; sisi 5 cm menjadi 10 cm karena dikali 2' },
          { id: 'benar', label: 'Dimas benar; semua sisi bertambah sama' },
          { id: 'salah2', label: 'Dimas keliru; sisi 5 cm menjadi 7,5 cm' },
          { id: 'salah3', label: 'Dimas keliru; sisi 5 cm tetap 5 cm' },
        ],
        correct: 'salah',
        explanation:
          'Faktornya 6 ÷ 3 = 2, jadi sisi 5 cm menjadi 2 × 5 = 10 cm. Perubahan proporsional adalah perkalian, bukan penambahan.',
      },
    ],
    nextLabel: 'Lanjut ke Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 8 · Menarik Kesimpulan',
    syntax: 'Discovery Learning · Sintaks 6 (Generalization)',
    goal: 'Menyusun kesimpulan tentang pengaruh perubahan proporsional terhadap sudut dan sisi.',
    guru: 'Minta beberapa murid membacakan kesimpulan dengan kata-katanya sendiri sebelum memilih potongan kalimat.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      {
        id: 'g1',
        awal: 'Perubahan ukuran disebut proporsional jika',
        correct: 'b1',
      },
      {
        id: 'g2',
        awal: 'Pada perubahan proporsional dengan faktor k, panjang setiap sisi baru',
        correct: 'b2',
      },
      {
        id: 'g3',
        awal: 'Pada perubahan proporsional, besar setiap sudut',
        correct: 'b3',
      },
      {
        id: 'g4',
        awal: 'Jika setiap sisi ditambah panjang yang sama atau hanya ditarik ke satu arah,',
        correct: 'b4',
      },
    ],
    bank: [
      { id: 'b1', teks: 'setiap sisi dikali bilangan (faktor) yang sama.' },
      { id: 'b2', teks: 'sama dengan k × panjang sisi lama yang bersesuaian.' },
      { id: 'b3', teks: 'tetap sama dengan sudut bersesuaian semula.' },
      { id: 'b4', teks: 'bentuknya umumnya berubah karena rasio sisinya tidak sama.' },
      { id: 'x1', teks: 'ikut dikali k.' },
      { id: 'x2', teks: 'sama dengan panjang sisi lama ditambah k.' },
      { id: 'x3', teks: 'setiap sisi ditambah panjang yang sama.' },
    ],
    rangkuman: [
      'Faktor perubahan k = sisi baru ÷ sisi lama; k > 1 memperbesar, 0 < k < 1 memperkecil.',
      'Perubahan proporsional: sisi baru = k × sisi lama untuk SEMUA sisi, dan keliling ikut dikali k.',
      'Besar sudut tidak berubah, sehingga bentuk bangun tetap (sebangun dengan bangun semula).',
      'Sudut yang tetap saja belum menjamin proporsional: persegi panjang 4 × 2 yang menjadi 5 × 3 sudutnya tetap 90°, tetapi bentuknya berubah.',
    ],
    dugaanJudul: 'Menengok kembali dugaan awalmu',
    tanggapanDugaan: {
      d1: {
        tetap: 'Dugaanmu terbukti: sudut tetap sama besar saat setiap sisi dikali 2.',
        lain: 'Hasil pengukuranmu menunjukkan sudut TETAP sama besar ketika setiap sisi dikali 2. Tidak apa-apa, dugaan memang untuk diuji!',
      },
      d2: {
        kali: 'Dugaanmu terbukti: agar bentuk tetap, setiap sisi dikali bilangan yang sama.',
        lain: 'Lab Ubah menunjukkan bahwa bentuk hanya tetap jika SETIAP sisi dikali bilangan yang sama. Menambah atau meregang satu arah mengubah bentuk.',
      },
    },
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 9 · Uji Terap',
    syntax: 'Penerapan Konsep',
    goal: 'Menerapkan temuan pada masalah sehari-hari.',
    guru: 'Soal dipilih acak dari bank sehingga soal antarpasangan dapat berbeda. Gunakan umpan balik diagnosa untuk menemukan miskonsepsi yang masih muncul.',
    instruksi: 'Kerjakan 10 soal berikut. Jawaban desimal memakai koma, mis. 7,5.',
    nextLabel: 'Lanjut ke Refleksi →',
    banyak: 10,
    komposisi: { input: 5, choice: 5 },
    soal: [
      /* ---- isian ---- */
      {
        id: 'i1',
        type: 'input',
        konteks: 'Spanduk lomba',
        cerita:
          'Logo segitiga bersisi 6 cm diperbesar secara proporsional dengan faktor 2,5 untuk spanduk.',
        pertanyaan: 'Berapa panjang sisi logo pada spanduk?',
        cek: { minta: 'sisiBaru', lama: 6, k: 2.5 },
        gambar: { bangun: 'bendera', aksi: { jenis: 'kali', nilai: 2.5 } },
        hints: ['Sisi baru = k × sisi lama.', 'Hitung 2,5 × 6.'],
        explanation: 'Sisi baru = 2,5 × 6 = 15 cm.',
      },
      {
        id: 'i2',
        type: 'input',
        konteks: 'Cetak foto',
        cerita: 'Foto berukuran 4 cm × 6 cm dicetak proporsional sehingga lebarnya menjadi 10 cm.',
        pertanyaan: 'Berapa panjang foto cetakan?',
        cek: { minta: 'sisiHilang', a1: 4, a2: 10, b1: 6 },
        hints: ['Cari faktornya: k = 10 ÷ 4.', 'Panjang baru = k × 6.'],
        explanation: 'k = 10 ÷ 4 = 2,5, jadi panjang baru = 2,5 × 6 = 15 cm (bukan 6 + 6 = 12 cm).',
      },
      {
        id: 'i3',
        type: 'input',
        konteks: 'Denah lapangan',
        cerita:
          'Gambar lapangan bersisi 8 cm diperkecil secara proporsional menjadi 2 cm untuk denah.',
        pertanyaan: 'Berapa faktor perubahannya?',
        cek: { minta: 'faktor', lama: 8, baru: 2 },
        hints: ['k = sisi baru ÷ sisi lama.', 'Hitung 2 ÷ 8.'],
        explanation: 'k = 2 ÷ 8 = 0,25. Faktor kurang dari 1 berarti diperkecil.',
      },
      {
        id: 'i4',
        type: 'input',
        konteks: 'Bendera lomba',
        cerita:
          'Bendera segitiga memiliki sudut puncak 35°. Bendera itu diperbesar 3 kali secara proporsional.',
        pertanyaan: 'Berapa besar sudut puncak bendera besar?',
        cek: { minta: 'sudutBaru', sudut: 35, k: 3 },
        hints: ['Apakah sudut berubah pada perubahan proporsional?'],
        explanation: 'Sudut tetap 35°. Perubahan proporsional tidak mengubah besar sudut.',
      },
      {
        id: 'i5',
        type: 'input',
        konteks: 'Pagar taman',
        cerita:
          'Taman segitiga bersisi 5 m, 6 m, dan 7 m diperluas secara proporsional dengan faktor 1,5.',
        pertanyaan: 'Berapa keliling taman yang baru?',
        satuan: 'm',
        cek: { minta: 'kelilingBaru', sisi: [5, 6, 7], k: 1.5 },
        hints: ['Keliling lama = 5 + 6 + 7.', 'Keliling baru = 1,5 × keliling lama.'],
        explanation: 'Keliling lama 18 m, keliling baru = 1,5 × 18 = 27 m.',
      },
      {
        id: 'i6',
        type: 'input',
        konteks: 'Poster pameran',
        cerita:
          'Poster pameran adalah hasil perbesaran proporsional 3 kali dari rancangannya. Panjang poster 45 cm.',
        pertanyaan: 'Berapa panjang rancangan poster?',
        cek: { minta: 'sisiLama', baru: 45, k: 3 },
        hints: ['Panjang baru = 3 × panjang lama.', 'Panjang lama = 45 ÷ 3.'],
        explanation: 'Panjang rancangan = 45 ÷ 3 = 15 cm.',
      },
      {
        id: 'i7',
        type: 'input',
        konteks: 'Layang-layang',
        cerita:
          'Model layang-layang memiliki sisi pendek 12 cm dan sisi panjang 20 cm. Layang-layang aslinya dibuat proporsional dengan sisi pendek 30 cm.',
        pertanyaan: 'Berapa panjang sisi panjang layang-layang asli?',
        cek: { minta: 'sisiHilang', a1: 12, a2: 30, b1: 20 },
        hints: ['k = 30 ÷ 12.', 'Sisi panjang asli = k × 20.'],
        explanation: 'k = 30 ÷ 12 = 2,5, sehingga sisi panjang asli = 2,5 × 20 = 50 cm.',
      },
      {
        id: 'i8',
        type: 'input',
        konteks: 'Ubin hias',
        cerita:
          'Ubin jajargenjang memiliki sudut tumpul 118°. Ubin itu diperkecil proporsional dengan faktor 0,5 untuk gantungan kunci.',
        pertanyaan: 'Berapa besar sudut tumpul pada gantungan kunci?',
        cek: { minta: 'sudutBaru', sudut: 118, k: 0.5 },
        gambar: { bangun: 'ubin', aksi: { jenis: 'kali', nilai: 0.5 } },
        hints: ['Diperkecil secara proporsional juga tidak mengubah sudut.'],
        explanation: 'Sudutnya tetap 118°, karena perubahannya proporsional.',
      },

      /* ---- pilihan ganda berbasis cek ---- */
      {
        id: 'c1',
        type: 'choice',
        konteks: 'Bingkai foto',
        cerita: 'Bingkai foto 10 cm × 15 cm diperbesar proporsional sehingga lebarnya 20 cm.',
        pertanyaan: 'Berapa panjang bingkai yang baru?',
        cek: { minta: 'sisiHilang', a1: 10, a2: 20, b1: 15 },
        explanation: 'k = 20 ÷ 10 = 2, jadi panjang baru = 2 × 15 = 30 cm.',
      },
      {
        id: 'c2',
        type: 'choice',
        konteks: 'Rambu lalu lintas',
        cerita:
          'Rambu segitiga memiliki sudut 72°. Gambarnya diperkecil proporsional dengan faktor 0,5 untuk buku pelajaran.',
        pertanyaan: 'Berapa besar sudut itu pada gambar di buku?',
        cek: { minta: 'sudutBaru', sudut: 72, k: 0.5 },
        explanation: 'Sudut tetap 72°; hanya panjang sisinya yang menjadi setengah.',
      },
      {
        id: 'c3',
        type: 'choice',
        konteks: 'Model kapal',
        cerita:
          'Panjang lambung model kapal 6 cm. Pada poster, gambar kapal itu diperbesar proporsional sehingga panjangnya 24 cm.',
        pertanyaan: 'Berapa faktor perbesarannya?',
        cek: { minta: 'faktor', lama: 6, baru: 24 },
        explanation: 'k = 24 ÷ 6 = 4.',
      },
      {
        id: 'c4',
        type: 'choice',
        konteks: 'Papan pengumuman',
        cerita: 'Papan pengumuman 4 dm × 2 dm diperbesar proporsional dengan faktor 3.',
        pertanyaan: 'Berapa keliling papan yang baru?',
        satuan: 'dm',
        cek: { minta: 'kelilingBaru', sisi: [4, 2, 4, 2], k: 3 },
        gambar: { bangun: 'poster', aksi: { jenis: 'kali', nilai: 3 } },
        explanation: 'Keliling lama 12 dm, keliling baru = 3 × 12 = 36 dm.',
      },
      {
        id: 'c5',
        type: 'choice',
        konteks: 'Stiker kelas',
        cerita: 'Stiker persegi diperbesar proporsional dengan faktor 1,5 sehingga sisinya 18 cm.',
        pertanyaan: 'Berapa sisi stiker semula?',
        cek: { minta: 'sisiLama', baru: 18, k: 1.5 },
        explanation: 'Sisi semula = 18 ÷ 1,5 = 12 cm.',
      },

      /* ---- pilihan ganda konsep ---- */
      {
        id: 'c6',
        type: 'choice',
        konteks: 'Mading',
        cerita: 'Tim mading ingin memperbesar gambar segitiga tanpa mengubah bentuknya.',
        pertanyaan: 'Perubahan mana yang tepat?',
        options: [
          { id: 'kali', label: 'Setiap sisi dikali 3' },
          { id: 'tambah', label: 'Setiap sisi ditambah 3 cm' },
          { id: 'satu', label: 'Hanya sisi terpanjang yang dikali 3' },
          { id: 'campur', label: 'Satu sisi dikali 3, sisi lain dikali 2' },
        ],
        correct: 'kali',
        explanation:
          'Bentuk tetap hanya jika SETIAP sisi dikali bilangan yang sama. Menambah atau mengubah sebagian sisi mengubah bentuknya.',
      },
      {
        id: 'c7',
        type: 'choice',
        konteks: 'Taplak meja',
        cerita: 'Taplak persegi panjang 6 dm × 4 dm diganti dengan taplak 8 dm × 6 dm.',
        pertanyaan: 'Apakah perubahan ukuran itu proporsional?',
        gambar: { bangun: 'poster', aksi: { jenis: 'tambah', nilai: 1 } },
        options: [
          { id: 'tidak', label: 'Tidak, karena 8 ÷ 6 tidak sama dengan 6 ÷ 4' },
          { id: 'ya', label: 'Ya, karena sudutnya tetap 90°' },
          { id: 'ya2', label: 'Ya, karena setiap sisi bertambah 2 dm' },
          { id: 'tidak2', label: 'Tidak, karena sudutnya menjadi lebih besar' },
        ],
        correct: 'tidak',
        explanation:
          '8 ÷ 6 ≈ 1,33 dan 6 ÷ 4 = 1,5. Rasio sisinya berbeda, jadi tidak proporsional walaupun sudutnya tetap 90°.',
      },
      {
        id: 'c8',
        type: 'choice',
        konteks: 'Foto di ponsel',
        cerita:
          'Foto ditarik ke samping sehingga lebarnya 2 kali, tetapi tingginya tetap. Orang di foto tampak lebih gemuk.',
        pertanyaan: 'Mengapa bentuknya berubah?',
        gambar: { bangun: 'stiker', aksi: { jenis: 'regang', nilai: 2 } },
        options: [
          {
            id: 'rasio',
            label: 'Lebar dikali 2 tetapi tinggi dikali 1, jadi rasio sisinya tidak sama',
          },
          { id: 'sudut', label: 'Sudut pojok foto berubah dari 90°' },
          { id: 'tetap', label: 'Bentuknya tidak berubah, hanya ukurannya' },
          { id: 'kecil', label: 'Karena fotonya diperkecil' },
        ],
        correct: 'rasio',
        explanation:
          'Perubahan proporsional mengalikan SEMUA ukuran dengan faktor yang sama. Di sini lebar dikali 2, tinggi dikali 1.',
      },
      {
        id: 'c9',
        type: 'choice',
        konteks: 'Segitiga ABC',
        cerita: 'Segitiga ABC diperbesar proporsional dengan faktor 2 menjadi segitiga A′B′C′.',
        pertanyaan: 'Pernyataan mana yang benar?',
        options: [
          { id: 'benar', label: '∠A′ = ∠A dan A′B′ = 2 × AB' },
          { id: 'sudutKali', label: '∠A′ = 2 × ∠A dan A′B′ = 2 × AB' },
          { id: 'tambah', label: '∠A′ = ∠A dan A′B′ = AB + 2' },
          { id: 'terbalik', label: '∠A′ = 2 × ∠A dan A′B′ = AB' },
        ],
        correct: 'benar',
        explanation: 'Sudut bersesuaian tetap sama besar, sedangkan setiap sisi dikali faktor 2.',
      },
      {
        id: 'c10',
        type: 'choice',
        konteks: 'Dua persegi',
        cerita: 'Persegi bersisi 3 cm diubah menjadi persegi bersisi 5 cm.',
        pertanyaan: 'Apakah perubahan ini proporsional?',
        options: [
          { id: 'ya', label: 'Ya, setiap sisi dikali 5 ÷ 3 yang sama dan sudutnya tetap 90°' },
          { id: 'tidak', label: 'Tidak, karena setiap sisi ditambah 2 cm' },
          { id: 'tidak2', label: 'Tidak, karena ukurannya berbeda' },
          { id: 'ya2', label: 'Ya, karena luasnya bertambah' },
        ],
        correct: 'ya',
        explanation:
          'Semua sisi persegi sama panjang, sehingga setiap sisi dikali faktor yang sama (5 ÷ 3) dan sudutnya tetap 90°. Ini kasus khusus persegi.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 10 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 10 · Refleksi',
    syntax: 'Refleksi & Penilaian Diri',
    goal: 'Merefleksikan proses penemuan dan menilai pemahaman diri.',
    guru: 'Baca refleksi murid untuk melihat apakah mereka mampu menjelaskan dengan kata-kata sendiri mengapa sudut tetap dan sisi dikali k.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri: apa pengaruh perubahan proporsional terhadap sudut dan sisi?',
        placeholder: 'Jika setiap sisi dikali …, maka sudutnya … dan sisinya …',
      },
      {
        id: 'r2',
        teks: 'Mengapa poster yang ditambah 1 cm di setiap sisinya tidak proporsional, padahal sudutnya tetap 90°?',
        placeholder: 'Karena …',
      },
      {
        id: 'r3',
        teks: 'Di mana kamu bisa memakai temuan ini dalam kehidupan sehari-hari?',
        placeholder: 'Misalnya saat …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menjelaskan pengaruh perubahan proporsional sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin, bisa menjelaskan ke teman' },
      { id: 'yakin', label: '🙂 Yakin, sesekali masih ragu' },
      { id: 'kurang', label: '🤔 Kurang yakin, perlu latihan lagi' },
      { id: 'bingung', label: '🙋 Masih bingung, perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai',
  },

  /* ----------------------------------------------------------
     TAHAP 11 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Penyelidikan Selesai!',
    teks: 'Kamu telah menemukan sendiri bahwa perubahan proporsional mengalikan setiap sisi dengan faktor yang sama, sementara besar sudutnya tetap.',
    capaian: [
      'Mengukur sisi dan sudut bangun datar sebelum dan sesudah diubah.',
      'Menentukan faktor perubahan k = sisi baru ÷ sisi lama.',
      'Menghitung sisi baru, sisi lama, sisi yang belum diketahui, dan keliling hasil perubahan proporsional.',
      'Menjelaskan bahwa besar sudut tetap pada perubahan proporsional.',
      'Membedakan perubahan proporsional dengan perubahan yang ditambah atau ditarik satu arah.',
    ],
  },
};
