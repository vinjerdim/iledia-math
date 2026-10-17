'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Perkalian & Pembagian Bilangan Berpangkat pada Bentuk
   Aljabar
   Fase D — SMP Kelas VIII · Topik 13 Operasi Bilangan Berpangkat dan
   Bentuk Akar

   Tujuan Pembelajaran:
   Menerapkan sifat perkalian dan pembagian bilangan berpangkat berbasis
   sama untuk menyederhanakan bentuk aljabar berpangkat.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'kumpul'
     Sintaks 4 — Data processing ............ tahap 'olah'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi     (7')  — "Mading Sains Nadia": petak berukuran
                              3x² × 2x³ cm. Murid MENDUGA bentuk
                              sederhana luasnya (tidak dinilai).
     2. Masalah       (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data          (20') — A: ubin faktor x³ × x⁴, a² × a⁶ (hitung
                              faktor gabungan) dan x⁶ : x², y⁵ : y³
                              (coret pasangan faktor); B: tabel pola
                              numerik perkalian & pembagian (basis 2, 3,
                              5) dengan kamus pangkat — hitung nilai,
                              baca sebagai aᵏ (diagnosa eksponen keliru);
                              C: pilah pernyataan dari data.
     4. Olah data     (15') — kolom m, n, k disorot; pertanyaan penuntun
                              (k dari m dan n, perlakuan koefisien, syarat
                              basis sama); ubin bentuk aljabar disusun
                              ulang per variabel (3x² × 4x³, 12x⁵ : 4x²,
                              2a³b × 5ab²); kartu rumus.
     5. Pembuktian    (15') — lab uji sifat (eksponen bulat positif) +
                              contoh penyangkal dua dugaan teman;
                              membuktikan dugaan awal; pilah miskonsepsi
                              (koefisien dijumlah, eksponen dibagi, basis
                              berbeda, penjumlahan).
     6. Simpulan      (7')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap     (15') — sembilan soal menyederhanakan bentuk aljabar
                              (isian koefisien & eksponen berdiagnosa
                              miskonsepsi dan pilihan ganda berpengecoh),
                              termasuk konteks luas papan mading dan
                              tinggi kardus.
     8. Refleksi      (5')  — refleksi tertulis & penilaian diri.

   Metadata `cek` pada setiap langkah isian dipakai tes untuk memeriksa
   kunci secara numerik dengan Math.pow (bebas dari sifat yang sedang
   dipelajari):
     { jenis: 'faktor', op, m, n }        banyak faktor pada aᵐ op aⁿ
     { jenis: 'koef', op, a, b }          koefisien hasil a op b
     { jenis: 'eksponen', op, a, b, v }   eksponen variabel v pada a op b
   Butir pilah verifikasi dapat memuat cek { op, a, b, klaim } yang
   dibandingkan secara numerik. Soal uji terap memakai pohon ekspresi
   monomial (shared/engine.js seksi 39); opsi pilihan ganda dan langkah
   pembahasan satu operasi dibuat engine seksi 81
   (opsiKaliBagiMonomial, langkahKaliBagiMonomial).

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan, sehingga tiap murid
   (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var DL = 'Discovery Learning';

/* Suku bentuk aljabar { koef, pangkat } — daun pohon ekspresi seksi 39. */
function sukuAljabar(koef, pangkat) {
  return { koef: koef, pangkat: pangkat };
}

var SUKU_PETAK = {
  a: sukuAljabar(3, { x: 2 }),
  b: sukuAljabar(2, { x: 3 }),
};
var SUKU_OLAH = {
  kali: { a: sukuAljabar(3, { x: 2 }), b: sukuAljabar(4, { x: 3 }) },
  bagi: { a: sukuAljabar(12, { x: 5 }), b: sukuAljabar(4, { x: 2 }) },
  dua: { a: sukuAljabar(2, { a: 3, b: 1 }), b: sukuAljabar(5, { a: 1, b: 2 }) },
};

var DATA = {
  kasus: {
    nama: 'Nadia',
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Pembuktian.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati ukuran petak mading lalu menduga bentuk sederhana dari 3x² × 2x³.',
    tp: 'Menerapkan sifat perkalian dan pembagian bilangan berpangkat berbasis sama untuk menyederhanakan bentuk aljabar berpangkat.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Mengumpulkan data perkalian dan pembagian bilangan berpangkat berbasis sama dengan ubin faktor dan tabel pola.',
      'Menemukan hubungan eksponen hasil dengan eksponen awal serta cara mengolah koefisien.',
      'Menguji sifat dan menyangkal dugaan keliru dengan contoh penyangkal.',
      'Menyederhanakan bentuk aljabar berpangkat, termasuk dalam masalah kontekstual.',
    ],
    guru: 'Tayangkan petak mading. Tanyakan: "Bisakah luas 3x² × 2x³ ditulis lebih ringkas?" Tampung semua dugaan (6x⁶, 5x⁵, dan lainnya) tanpa dikoreksi — murid akan mengujinya sendiri.',
    judul: 'Petak Mading Sains Nadia',
    cerita:
      'Nadia, anggota Tim Mading Sains Kelas VIII, merancang petak-petak berukuran fleksibel: panjang petak 3x² cm dan lebarnya 2x³ cm, dengan x bergantung pada ukuran kertas. Untuk menghitung banyak cat, Nadia menulis luasnya sebagai 3x² × 2x³. Ia yakin bentuk itu bisa ditulis jauh lebih ringkas.',
    aturan:
      'Luas persegi panjang = panjang × lebar. Di sini panjang dan lebarnya berupa bentuk aljabar berpangkat.',
    soal: SUKU_PETAK,
    pertanyaan: 'Dugaanmu: 3x² × 2x³ sama dengan …',
    opsi: [
      { id: 'o1', label: '6x⁵' },
      { id: 'o2', label: '6x⁶' },
      { id: 'o3', label: '5x⁵' },
      { id: 'o4', label: '5x⁶' },
    ],
    alasanLabel: 'Bagaimana kamu mendapatkan dugaan itu?',
    alasanPlaceholder: 'Contoh: aku melihat angka 3 dan 2, lalu eksponen 2 dan 3, kemudian …',
    catatan:
      'Belum ada jawaban benar atau salah di sini. Simpan dugaanmu — nanti kamu sendiri yang akan membuktikannya.',
    nextLabel: 'Simpan Dugaan & Lanjut →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan inti tentang eksponen dan koefisien pada perkalian dan pembagian bentuk berpangkat berbasis sama.',
    guru: 'Arahkan murid agar pertanyaannya bersifat umum: berlaku untuk variabel dan eksponen apa pun, bukan hanya untuk petak Nadia. Tulis beberapa hipotesis di papan untuk diuji nanti.',
    pengantar:
      'Nadia juga harus membagi: luas mading 24x⁵ cm² dibagi rata menjadi petak selebar 4x² cm. Menghitung untuk setiap nilai x satu per satu lama dan rawan salah. Nadia butuh aturan umum untuk mengalikan dan membagi bentuk berpangkat.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'pola',
        label:
          'Bagaimana eksponen dan koefisien hasil diperoleh saat bentuk berpangkat berbasis sama dikalikan atau dibagi?',
      },
      { id: 'nilai', label: 'Berapa luas petak jika x = 2?' },
      { id: 'cat', label: 'Berapa kaleng cat yang harus dibeli Nadia?' },
      { id: 'warna', label: 'Warna apa yang paling cocok untuk mading sains?' },
    ],
    correct: 'pola',
    umpan: {
      pola: '<strong>Tepat.</strong> Kita akan mengumpulkan banyak contoh, mencari <em>pola</em> eksponen dan koefisiennya, lalu menuliskannya sebagai aturan umum.',
      nilai:
        'Mengganti x = 2 hanya menjawab satu ukuran petak. Pertanyaan ini tidak membantu menemukan aturan untuk semua nilai x. Coba pilih lagi.',
      cat: 'Banyak cat memang penting bagi Nadia, tetapi tidak menjelaskan <em>pola</em> eksponennya. Coba pilih lagi.',
      warna:
        'Pertanyaan ini tidak berkaitan dengan perkalian dan pembagian bentuk berpangkat. Coba pilih lagi.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu apa yang terjadi pada eksponen dan koefisien saat dua bentuk berpangkat dikalikan?',
    hipotesisPlaceholder: 'Contoh: mungkin eksponennya … dan koefisiennya …',
    nextLabel: 'Mulai Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA
     A: ubin faktor variabel. B: tabel pola numerik (kali, bagi).
     C: pilah pernyataan.
     ---------------------------------------------------------- */
  kumpul: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengumpulkan data banyak faktor dan nilai hasil perkalian serta pembagian bilangan berpangkat berbasis sama.',
    guru: 'Minta murid benar-benar menghitung ubin dan nilai, bukan menebak eksponen. Jika murid menulis k = m × n, minta ia mencari nilai aᵏ tersebut di kamus pangkat dan membandingkannya dengan hasil hitungnya.',
    judulA: 'A. Ubin faktor',
    instruksiA:
      'Setiap ubin adalah satu faktor. Hitung banyak faktor yang terbentuk saat bentuk berpangkat dikalikan, atau yang tersisa setelah pasangan faktor yang sama dicoret pada pembagian (x/x = 1).',
    ubin: [
      {
        visual: { jenis: 'kali', a: 'x', m: 3, n: 4 },
        label: 'x³ × x⁴ = (x · x · x) × (x · x · x · x). Banyak faktor x seluruhnya = …',
        jawab: 7,
        hints: ['Hitung ubin di kedua kelompok bersama-sama.'],
        temuan: '3 faktor digabung dengan 4 faktor = 7 faktor, jadi x³ × x⁴ = x⁷.',
        cek: { jenis: 'faktor', op: 'kali', m: 3, n: 4 },
      },
      {
        visual: { jenis: 'kali', a: 'a', m: 2, n: 6 },
        label: 'a² × a⁶. Banyak faktor a seluruhnya = …',
        jawab: 8,
        hints: ['Kelompok pertama berisi 2 ubin, kelompok kedua berisi 6 ubin.'],
        temuan: '2 faktor + 6 faktor = 8 faktor, jadi a² × a⁶ = a⁸.',
        cek: { jenis: 'faktor', op: 'kali', m: 2, n: 6 },
      },
      {
        visual: { jenis: 'bagi', a: 'x', m: 6, n: 2, coret: true },
        label:
          'x⁶ : x² ditulis sebagai pecahan. Setiap pasangan x/x = 1 dicoret. Sisa faktor x di atas = …',
        jawab: 4,
        hints: ['Ada 6 faktor di atas; 2 di antaranya dicoret bersama 2 faktor di bawah.'],
        temuan: '6 faktor dikurangi 2 faktor yang dicoret = 4 faktor, jadi x⁶ : x² = x⁴.',
        cek: { jenis: 'faktor', op: 'bagi', m: 6, n: 2 },
      },
      {
        visual: { jenis: 'bagi', a: 'y', m: 5, n: 3, coret: true },
        label: 'y⁵ : y³. Sisa faktor y setelah pasangan dicoret = …',
        jawab: 2,
        hints: ['Coret 3 pasang y/y. Berapa ubin di atas yang belum tercoret?'],
        temuan: '5 faktor dikurangi 3 faktor yang dicoret = 2 faktor, jadi y⁵ : y³ = y².',
        cek: { jenis: 'faktor', op: 'bagi', m: 5, n: 3 },
      },
    ],
    judulB: 'B. Tabel pola bilangan',
    instruksiB:
      'Apakah pola ubin juga berlaku untuk bilangan? Untuk setiap baris: hitung nilainya dengan bantuan kamus pangkat, lalu cari nilai itu di kamus dan tulis eksponennya (k). Tabel pembagian terbuka setelah tabel perkalian benar semua.',
    kamus: [
      { id: 'k2', a: 2, dari: 1, sampai: 10 },
      { id: 'k3', a: 3, dari: 1, sampai: 6 },
      { id: 'k5', a: 5, dari: 1, sampai: 4 },
    ],
    pola: [
      {
        id: 'pk',
        operasi: 'kali',
        judul: 'B1. Perkalian bilangan berpangkat berbasis sama',
        instruksi: 'Contoh: 2² × 2³ = 4 × 8 = 32, dan 32 = 2⁵, jadi k = 5.',
        baris: [
          { a: 2, m: 2, n: 3 },
          { a: 2, m: 3, n: 4 },
          { a: 2, m: 1, n: 5 },
          { a: 3, m: 2, n: 3 },
          { a: 5, m: 1, n: 2 },
        ],
        hints: [
          'Baca nilai kedua faktor dari kamus pangkat, lalu kalikan.',
          'Cari hasil kalinya di kamus pangkat dengan basis yang sama. Eksponen di atas nilai itu adalah k.',
        ],
        temuan:
          'Datamu lengkap: 2² × 2³ = 2⁵, 2³ × 2⁴ = 2⁷, 2¹ × 2⁵ = 2⁶, 3² × 3³ = 3⁵, 5¹ × 5² = 5³.',
      },
      {
        id: 'pb',
        operasi: 'bagi',
        judul: 'B2. Pembagian bilangan berpangkat berbasis sama',
        instruksi: 'Contoh: 2⁶ : 2² = 64 : 4 = 16, dan 16 = 2⁴, jadi k = 4.',
        baris: [
          { a: 2, m: 6, n: 2 },
          { a: 2, m: 8, n: 3 },
          { a: 2, m: 10, n: 4 },
          { a: 3, m: 5, n: 2 },
          { a: 5, m: 4, n: 1 },
        ],
        hints: [
          'Baca nilai yang dibagi dan pembaginya dari kamus pangkat, lalu bagi.',
          'Mis. 2⁸ : 2³ = 256 : 8 = 32. Cari 32 di kamus pangkat 2.',
        ],
        temuan:
          'Datamu lengkap: 2⁶ : 2² = 2⁴, 2⁸ : 2³ = 2⁵, 2¹⁰ : 2⁴ = 2⁶, 3⁵ : 3² = 3³, 5⁴ : 5¹ = 5³.',
      },
    ],
    judulC: 'C. Pilah pernyataan',
    instruksiC: 'Amati data yang kamu kumpulkan. Pilah setiap pernyataan: benar atau salah?',
    opsiPilah: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: 'x³ × x⁴ = x⁷, karena ada 3 + 4 = 7 faktor x.',
        correct: 'benar',
        explanation:
          'Ubin faktor menunjukkan 3 faktor digabung dengan 4 faktor menjadi 7 faktor x.',
      },
      {
        id: 'p2',
        teks: '2³ × 2⁴ = 2¹², karena 3 × 4 = 12.',
        correct: 'salah',
        explanation: 'Tabelmu menunjukkan 2³ × 2⁴ = 8 × 16 = 128 = 2⁷, sedangkan 2¹² = 4.096.',
      },
      {
        id: 'p3',
        teks: '2⁸ : 2³ = 32 = 2⁵.',
        correct: 'benar',
        explanation: '256 : 8 = 32, dan di kamus pangkat 2, 32 = 2⁵.',
      },
      {
        id: 'p4',
        teks: '2⁸ : 2⁴ = 2², karena eksponennya dibagi (8 : 4 = 2).',
        correct: 'salah',
        explanation: '256 : 16 = 16 = 2⁴. Eksponen hasilnya 4, bukan hasil bagi 8 : 4.',
      },
      {
        id: 'p5',
        teks: 'Pada x⁶ : x², setiap pasangan x/x yang dicoret bernilai 1, sehingga tidak mengubah hasil.',
        correct: 'benar',
        explanation: 'x/x = 1 (untuk x ≠ 0), dan mengalikan dengan 1 tidak mengubah nilai.',
      },
    ],
    nextLabel: 'Olah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — OLAH DATA
     Kolom m, n, k → hubungan eksponen; koefisien; basis sama;
     ubin bentuk aljabar disusun ulang.
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 4 · Olah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan hubungan eksponen hasil (k) dengan eksponen awal (m dan n), cara mengolah koefisien, dan syarat basis sama.',
    guru: 'Minta setiap pasangan menjelaskan pola kolom m, n, k dengan kalimat sendiri sebelum memilih jawaban. Saat ubin bentuk aljabar disusun ulang, tekankan bahwa urutan faktor boleh ditukar (sifat komutatif & asosiatif), sehingga koefisien dan setiap variabel bisa dikumpulkan sendiri-sendiri.',
    instruksi:
      'Data tabelmu kini dilengkapi kolom m, n, dan k. Amati hubungan k dengan m dan n pada setiap tabel, lalu jawab pertanyaan penuntun.',
    pertanyaan: [
      {
        id: 'kali',
        tanya: 'Tabel perkalian aᵐ × aⁿ = aᵏ: bagaimana k diperoleh dari m dan n?',
        opsi: [
          { id: 'benar', label: 'k = m + n' },
          { id: 'kaliE', label: 'k = m × n' },
          { id: 'kurang', label: 'k = m − n' },
          { id: 'pangkatE', label: 'k = mⁿ' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> 2 + 3 = 5, 3 + 4 = 7, 1 + 5 = 6, 1 + 2 = 3. Eksponennya <strong>dijumlahkan</strong>: aᵐ × aⁿ = aᵐ⁺ⁿ.',
          kaliE: 'Cek baris 2³ × 2⁴: k = 7, sedangkan 3 × 4 = 12. Coba lagi.',
          kurang: 'Cek baris 2² × 2³: k = 5, sedangkan 2 − 3 bukan 5. Coba lagi.',
          pangkatE: 'Cek baris 2² × 2³: k = 5, sedangkan 2³ = 8. Coba lagi.',
        },
      },
      {
        id: 'bagi',
        tanya: 'Tabel pembagian aᵐ : aⁿ = aᵏ (m > n): bagaimana k diperoleh dari m dan n?',
        opsi: [
          { id: 'benar', label: 'k = m − n' },
          { id: 'bagiE', label: 'k = m : n' },
          { id: 'tambah', label: 'k = m + n' },
          { id: 'balik', label: 'k = n − m' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> 6 − 2 = 4, 8 − 3 = 5, 10 − 4 = 6, 5 − 2 = 3. Eksponennya <strong>dikurangkan</strong>: aᵐ : aⁿ = aᵐ⁻ⁿ.',
          bagiE: 'Cek baris 2⁸ : 2³: k = 5, sedangkan 8 : 3 bukan bilangan bulat. Coba lagi.',
          tambah:
            'Pembagian membuat nilainya mengecil, jadi eksponennya tidak mungkin bertambah. Coba lagi.',
          balik:
            'Cek baris 2⁶ : 2²: k = 4, sedangkan 2 − 6 bukan 4. Urutannya terbalik. Coba lagi.',
        },
      },
      {
        id: 'koef',
        tanya: 'Pada 3x² × 4x³, bagaimana koefisien 3 dan 4 diolah?',
        opsi: [
          { id: 'benar', label: 'Dikalikan: 3 × 4 = 12' },
          { id: 'jumlah', label: 'Dijumlahkan: 3 + 4 = 7' },
          { id: 'tetap', label: 'Tidak diolah, ditulis berdampingan: 34' },
          { id: 'pangkat', label: 'Dipangkatkan: 3⁴ = 81' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> 3x² × 4x³ = 3 · x · x × 4 · x · x · x. Urutan faktor boleh ditukar, jadi bilangannya dikumpulkan: 3 × 4 = 12.',
          jumlah:
            'Koefisien adalah faktor bilangan, dan di antara keduanya ada tanda kali. Coba ganti x = 1: 3 × 4 = 12, bukan 7. Coba lagi.',
          tetap: 'Menulis 34 berarti tiga puluh empat, bukan 3 × 4. Coba lagi.',
          pangkat:
            'Tidak ada yang dipangkatkan 4 di sini. Coba ganti x = 1: 3 × 4 = 12. Coba lagi.',
        },
      },
      {
        id: 'basis',
        tanya: 'Kapan eksponen boleh langsung dijumlahkan atau dikurangkan?',
        opsi: [
          { id: 'benar', label: 'Bila basisnya (variabelnya) sama' },
          { id: 'eksponen', label: 'Bila eksponennya sama' },
          { id: 'koef', label: 'Bila koefisiennya sama' },
          { id: 'selalu', label: 'Selalu, untuk basis apa pun' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Ubin hanya bisa digabung atau dicoret bila faktornya sama. x² × y³ tetap x²y³ karena faktor x dan y berbeda.',
          eksponen:
            'Cek 2² × 3²: nilainya 4 × 9 = 36, bukan 2⁴ atau 3⁴. Eksponen sama tidak cukup. Coba lagi.',
          koef: 'Koefisien tidak menentukan boleh tidaknya eksponen digabung. Coba lagi.',
          selalu:
            'Cek 2³ × 3² = 8 × 9 = 72. Tidak ada bilangan berpangkat dengan eksponen 5 yang bernilai 72 dari basis 2 atau 3. Coba lagi.',
        },
      },
    ],
    judulLangkah: 'Bagaimana dengan bentuk aljabar yang berkoefisien?',
    instruksiLangkah:
      'Ubin disusun ulang: koefisien dikumpulkan, lalu setiap variabel dikumpulkan. Tentukan koefisien dan eksponen hasilnya.',
    langkah: [
      {
        visualMono: { jenis: 'kali', a: SUKU_OLAH.kali.a, b: SUKU_OLAH.kali.b, kelompok: true },
        label: '3x² × 4x³ = (3 × 4) · (x · x) · (x · x · x). Koefisien hasil = …',
        jawab: 12,
        hints: ['Kalikan kedua bilangan ungu.'],
        temuan: 'Koefisien dikalikan seperti bilangan biasa: 3 × 4 = 12.',
        cek: { jenis: 'koef', op: 'kali', a: SUKU_OLAH.kali.a, b: SUKU_OLAH.kali.b },
      },
      {
        label: '… dan eksponen x pada hasil = …',
        jawab: 5,
        hints: ['Hitung semua ubin x, atau jumlahkan eksponennya.'],
        temuan: '3x² × 4x³ = 12x²⁺³ = 12x⁵.',
        cek: { jenis: 'eksponen', op: 'kali', a: SUKU_OLAH.kali.a, b: SUKU_OLAH.kali.b, v: 'x' },
      },
      {
        visualMono: { jenis: 'bagi', a: SUKU_OLAH.bagi.a, b: SUKU_OLAH.bagi.b, coret: true },
        label: '12x⁵ : 4x² ditulis sebagai pecahan, pasangan x/x dicoret. Koefisien hasil = …',
        jawab: 3,
        hints: ['Bagilah bilangan ungu di atas dengan bilangan ungu di bawah.'],
        temuan: 'Koefisien dibagi seperti bilangan biasa: 12 : 4 = 3.',
        cek: { jenis: 'koef', op: 'bagi', a: SUKU_OLAH.bagi.a, b: SUKU_OLAH.bagi.b },
      },
      {
        label: '… dan eksponen x pada hasil = …',
        jawab: 3,
        hints: ['Hitung ubin x di atas yang tidak tercoret.'],
        temuan: '12x⁵ : 4x² = 3x⁵⁻² = 3x³.',
        cek: { jenis: 'eksponen', op: 'bagi', a: SUKU_OLAH.bagi.a, b: SUKU_OLAH.bagi.b, v: 'x' },
      },
      {
        visualMono: { jenis: 'kali', a: SUKU_OLAH.dua.a, b: SUKU_OLAH.dua.b, kelompok: true },
        label: '2a³b × 5ab²: dua variabel diurus sendiri-sendiri. Eksponen a pada hasil = …',
        jawab: 4,
        hints: ['a pada suku kedua ditulis tanpa eksponen, artinya a¹.'],
        temuan: 'Faktor a: a³ × a¹ = a³⁺¹ = a⁴.',
        cek: { jenis: 'eksponen', op: 'kali', a: SUKU_OLAH.dua.a, b: SUKU_OLAH.dua.b, v: 'a' },
      },
      {
        label: '… dan eksponen b pada hasil = …',
        jawab: 3,
        hints: ['b pada suku pertama berarti b¹.'],
        temuan: 'Faktor b: b¹ × b² = b³. Jadi 2a³b × 5ab² = 10a⁴b³.',
        cek: { jenis: 'eksponen', op: 'kali', a: SUKU_OLAH.dua.a, b: SUKU_OLAH.dua.b, v: 'b' },
      },
    ],
    rumus: [
      { label: 'Perkalian (basis sama)', teks: 'aᵐ × aⁿ = aᵐ⁺ⁿ' },
      { label: 'Pembagian (a ≠ 0, m > n)', teks: 'aᵐ : aⁿ = aᵐ⁻ⁿ' },
      {
        label: 'Bentuk aljabar',
        teks: 'koefisien dikali/dibagi; eksponen tiap variabel dijumlah/dikurang',
      },
    ],
    nextLabel: 'Buktikan Polanya →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN (VERIFIKASI)
     A: lab uji sifat. B: buktikan dugaan awal. C: pilah miskonsepsi.
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji sifat pada banyak contoh, menyangkal dugaan keliru, dan membuktikan dugaan awal.',
    guru: 'Minta setiap pasangan mencari satu contoh penyangkal untuk tiap dugaan teman, lalu membandingkannya. Tekankan: satu contoh penyangkal cukup untuk menggugurkan dugaan, sedangkan ubin faktor menjelaskan MENGAPA sifatnya selalu berlaku.',
    judulA: 'A. Lab uji sifat',
    instruksiA:
      'Pilih sifat, atur a, m, dan n (eksponen bulat positif), lalu catat hasilnya. Selesaikan daftar periksa: uji tiap sifat dua kali dan cari contoh penyangkal untuk dugaan kedua temanmu.',
    lab: {
      sifat: ['kali', 'bagi', 'salahKali', 'salahBagi'],
      nama: {
        salahKali: 'Dugaan Bima',
        salahBagi: 'Dugaan Citra',
      },
      syarat: [
        { sifat: 'kali', min: 2 },
        { sifat: 'bagi', min: 2 },
        { sifat: 'salahKali', min: 1, sangkal: true },
        { sifat: 'salahBagi', min: 1, sangkal: true },
      ],
      positif: true,
      batasA: [1, 10],
      batasE: [1, 6],
    },
    judulB: 'B. Buktikan dugaan awalmu',
    instruksiB: 'Kembali ke petak mading Nadia: 3x² × 2x³.',
    uji: [
      {
        label: 'Luas petak 3x² × 2x³. Koefisien hasil = …',
        jawab: 6,
        hints: ['Koefisien dikalikan seperti bilangan biasa.'],
        temuan: 'Koefisien: 3 × 2 = 6.',
        cek: { jenis: 'koef', op: 'kali', a: SUKU_PETAK.a, b: SUKU_PETAK.b },
      },
      {
        label: '… dan eksponen x pada hasil = …',
        jawab: 5,
        hints: ['Gunakan aᵐ × aⁿ = aᵐ⁺ⁿ.'],
        temuan: '3x² × 2x³ = (3 × 2)x²⁺³ = 6x⁵ cm². Cek x = 2: 12 × 16 = 192 dan 6 × 32 = 192. ✓',
        cek: { jenis: 'eksponen', op: 'kali', a: SUKU_PETAK.a, b: SUKU_PETAK.b, v: 'x' },
      },
    ],
    dugaanBenar: 'o1',
    judulC: 'C. Awas miskonsepsi!',
    instruksiC: 'Pilah setiap pernyataan: benar atau salah? Kamu boleh mengujinya dengan x = 2.',
    opsiPilah: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pilah: [
      {
        id: 'v1',
        teks: '2x³ × 3x⁴ = 6x⁷',
        correct: 'benar',
        explanation: 'Koefisien 2 × 3 = 6, eksponen 3 + 4 = 7.',
        cek: {
          op: 'kali',
          a: sukuAljabar(2, { x: 3 }),
          b: sukuAljabar(3, { x: 4 }),
          klaim: sukuAljabar(6, { x: 7 }),
        },
      },
      {
        id: 'v2',
        teks: '2x³ × 3x⁴ = 5x⁷',
        correct: 'salah',
        explanation:
          'Koefisien tidak dijumlahkan, tetapi dikalikan: 2 × 3 = 6. Cek x = 1: 2 × 3 = 6, bukan 5.',
        cek: {
          op: 'kali',
          a: sukuAljabar(2, { x: 3 }),
          b: sukuAljabar(3, { x: 4 }),
          klaim: sukuAljabar(5, { x: 7 }),
        },
      },
      {
        id: 'v3',
        teks: 'a⁶ : a² = a³',
        correct: 'salah',
        explanation: 'Eksponen dikurangkan, bukan dibagi: a⁶⁻² = a⁴. Cek a = 2: 64 : 4 = 16 = 2⁴.',
        cek: {
          op: 'bagi',
          a: sukuAljabar(1, { a: 6 }),
          b: sukuAljabar(1, { a: 2 }),
          klaim: sukuAljabar(1, { a: 3 }),
        },
      },
      {
        id: 'v4',
        teks: '10p⁵q² : 2p²q² = 5p³',
        correct: 'benar',
        explanation: '10 : 2 = 5, p⁵⁻² = p³, dan q²⁻² = q⁰ = 1, jadi q tidak tertulis lagi.',
        cek: {
          op: 'bagi',
          a: sukuAljabar(10, { p: 5, q: 2 }),
          b: sukuAljabar(2, { p: 2, q: 2 }),
          klaim: sukuAljabar(5, { p: 3 }),
        },
      },
      {
        id: 'v5',
        teks: 'y⁴ × y⁴ = y¹⁶',
        correct: 'salah',
        explanation: 'Eksponen dijumlahkan, bukan dikalikan: y⁴⁺⁴ = y⁸.',
        cek: {
          op: 'kali',
          a: sukuAljabar(1, { y: 4 }),
          b: sukuAljabar(1, { y: 4 }),
          klaim: sukuAljabar(1, { y: 16 }),
        },
      },
      {
        id: 'v6',
        teks: 'x² × y³ = (xy)⁵',
        correct: 'salah',
        explanation:
          'Basisnya berbeda, jadi eksponen tidak boleh digabung. Cek x = 2, y = 3: 4 × 27 = 108, sedangkan 6⁵ = 7.776. Bentuk sederhananya tetap x²y³.',
      },
      {
        id: 'v7',
        teks: 'x³ + x⁴ = x⁷',
        correct: 'salah',
        explanation:
          'Sifat ini untuk perkalian, bukan penjumlahan. Cek x = 2: 8 + 16 = 24, sedangkan 2⁷ = 128.',
      },
    ],
    nextLabel: 'Tarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN (GENERALISASI)
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Menyusun kesimpulan umum tentang perkalian dan pembagian bentuk berpangkat berbasis sama, termasuk perlakuan koefisien.',
    guru: 'Setelah kalimat lengkap, minta beberapa murid menjelaskan dengan kata-kata sendiri mengapa eksponen dijumlahkan (bukan dikalikan) pada perkalian, dengan merujuk pada ubin faktor atau tabel pola.',
    instruksi:
      'Lengkapi setiap awal kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan dipakai paling banyak satu kali, dan ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'Mengalikan dua bentuk berpangkat dengan basis sama', correct: 'b1' },
      {
        id: 'k2',
        awal: 'Membagi dua bentuk berpangkat dengan basis sama (a ≠ 0, m > n)',
        correct: 'b2',
      },
      {
        id: 'k3',
        awal: 'Koefisien bentuk aljabar, seperti 3 dan 4 pada 3x² × 4x⁵,',
        correct: 'b3',
      },
      { id: 'k4', awal: 'Eksponen hanya boleh digabung untuk faktor-faktor yang', correct: 'b4' },
    ],
    bank: [
      { id: 'b1', teks: 'eksponennya dijumlahkan: aᵐ × aⁿ = aᵐ⁺ⁿ.' },
      { id: 'b2', teks: 'eksponennya dikurangkan: aᵐ : aⁿ = aᵐ⁻ⁿ.' },
      { id: 'b3', teks: 'dikalikan atau dibagi seperti bilangan biasa.' },
      { id: 'b4', teks: 'basisnya sama; variabel yang berbeda diurus sendiri-sendiri.' },
      { id: 'x1', teks: 'eksponennya dikalikan: aᵐ × aⁿ = aᵐˣⁿ.' },
      { id: 'x2', teks: 'eksponennya dibagi: aᵐ : aⁿ = a^(m : n).' },
      { id: 'x3', teks: 'dijumlahkan atau dikurangkan seperti eksponennya.' },
      { id: 'x4', teks: 'eksponennya sama, walaupun basisnya berbeda.' },
    ],
    rangkuman: [
      'aᵐ × aⁿ = aᵐ⁺ⁿ — faktor-faktor digabung, jadi eksponen dijumlahkan.',
      'aᵐ : aⁿ = aᵐ⁻ⁿ untuk a ≠ 0 dan m > n — pasangan faktor dicoret, jadi eksponen dikurangkan.',
      'Pada bentuk aljabar, koefisien dikalikan atau dibagi, sedangkan eksponen setiap variabel diolah sendiri-sendiri: 3x²y × 4x⁵y³ = 12x⁷y⁴.',
      'Sifat ini hanya berlaku untuk basis yang sama dan untuk operasi kali atau bagi — bukan untuk penjumlahan.',
    ],
    nextLabel: 'Terapkan Sifatnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     tipe 'isian': isi koefisien & eksponen (diagnosa seksi 81/39).
     tipe 'pilih': opsi dari opsiKaliBagiMonomial (diacak app.js).
     Pembahasan satu operasi dibuat langkahKaliBagiMonomial; soal
     bertingkat memuat `pembahasan` sendiri.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan konsep',
    goal: 'Menerapkan sifat perkalian dan pembagian bilangan berpangkat berbasis sama untuk menyederhanakan bentuk aljabar berpangkat.',
    guru: 'Biarkan murid mengerjakan mandiri. Perhatikan pesan diagnosa yang sering muncul (mis. koefisien dijumlah atau eksponen dikali) untuk dibahas bersama di akhir.',
    instruksi:
      'Sederhanakan setiap bentuk. Pada soal isian, tulis koefisien lalu eksponen setiap variabel. Pada soal pilihan, pilih bentuk paling sederhana.',
    labelIsian: 'Isi koefisien dan eksponen setiap variabel:',
    labelPilih: 'Bentuk paling sederhananya adalah …',
    soal: [
      {
        id: 's1',
        tipe: 'isian',
        ekspresi: {
          op: 'kali',
          a: sukuAljabar(2, { x: 3 }),
          b: sukuAljabar(5, { x: 4 }),
        },
        vars: ['x'],
        hints: ['Koefisien: 2 × 5.', 'Eksponen x dijumlahkan: 3 + 4.'],
      },
      {
        id: 's2',
        tipe: 'pilih',
        ekspresi: {
          op: 'kali',
          a: sukuAljabar(1, { a: 5, b: 2 }),
          b: sukuAljabar(1, { a: 3, b: 4 }),
        },
        vars: ['a', 'b'],
        hints: ['Urus a dan b sendiri-sendiri: a⁵ × a³ dan b² × b⁴.'],
      },
      {
        id: 's3',
        tipe: 'isian',
        ekspresi: {
          op: 'kali',
          a: sukuAljabar(3, { p: 2, q: 1 }),
          b: sukuAljabar(4, { p: 5, q: 3 }),
        },
        vars: ['p', 'q'],
        hints: ['Koefisien: 3 × 4.', 'q pada suku pertama berarti q¹, jadi q¹ × q³ = q¹⁺³.'],
      },
      {
        id: 's4',
        tipe: 'isian',
        ekspresi: {
          op: 'bagi',
          a: sukuAljabar(15, { x: 7 }),
          b: sukuAljabar(3, { x: 2 }),
        },
        vars: ['x'],
        hints: ['Koefisien: 15 : 3.', 'Eksponen x dikurangkan: 7 − 2.'],
      },
      {
        id: 's5',
        tipe: 'pilih',
        ekspresi: {
          op: 'bagi',
          a: sukuAljabar(20, { a: 6, b: 4 }),
          b: sukuAljabar(5, { a: 2, b: 1 }),
        },
        vars: ['a', 'b'],
        hints: ['Koefisien: 20 : 5.', 'a⁶ : a² dan b⁴ : b¹ — eksponen dikurangkan.'],
      },
      {
        id: 's6',
        tipe: 'isian',
        cerita:
          'Papan mading Kelas VIII berbentuk persegi panjang dengan panjang 4x³ cm dan lebar 3x² cm. Luasnya = panjang × lebar.',
        ekspresi: {
          op: 'kali',
          a: sukuAljabar(4, { x: 3 }),
          b: sukuAljabar(3, { x: 2 }),
        },
        vars: ['x'],
        hints: ['Luas = 4x³ × 3x².', 'Koefisien 4 × 3, eksponen x: 3 + 2.'],
      },
      {
        id: 's7',
        tipe: 'isian',
        cerita:
          'Sebuah kardus perlengkapan mading bervolume 24a⁵b³ cm³ dengan luas alas 6a²b cm². Tinggi kardus = volume : luas alas.',
        ekspresi: {
          op: 'bagi',
          a: sukuAljabar(24, { a: 5, b: 3 }),
          b: sukuAljabar(6, { a: 2, b: 1 }),
        },
        vars: ['a', 'b'],
        hints: ['Tinggi = 24a⁵b³ : 6a²b.', 'Koefisien 24 : 6; a⁵⁻² dan b³⁻¹.'],
      },
      {
        id: 's8',
        tipe: 'isian',
        ekspresi: {
          op: 'bagi',
          a: sukuAljabar(8, { x: 5, y: 2 }),
          b: sukuAljabar(2, { x: 3, y: 2 }),
        },
        vars: ['x', 'y'],
        hints: [
          'Koefisien 8 : 2; x⁵⁻³.',
          'y² : y² = y²⁻² = y⁰ = 1. Tulis eksponen y = 0 (y hilang dari hasil).',
        ],
      },
      {
        id: 's9',
        tipe: 'isian',
        ekspresi: {
          op: 'bagi',
          a: {
            op: 'kali',
            a: sukuAljabar(6, { m: 4, n: 3 }),
            b: sukuAljabar(2, { m: 1, n: 2 }),
          },
          b: sukuAljabar(4, { m: 3, n: 2 }),
        },
        vars: ['m', 'n'],
        hints: [
          'Kerjakan pembilangnya dulu: 6m⁴n³ × 2mn².',
          'Pembilangnya 12m⁵n⁵. Lalu bagi dengan 4m³n².',
        ],
        pembahasan: [
          'Pembilang: 6m⁴n³ × 2mn² = (6 × 2)m⁴⁺¹n³⁺² = 12m⁵n⁵',
          'Pembagian: 12m⁵n⁵ : 4m³n² = (12 : 4)m⁵⁻³n⁵⁻² = 3m²n³',
          'Hasil: 3m²n³',
        ],
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses menemukan dan menerapkan sifat perkalian dan pembagian bentuk berpangkat.',
    guru: 'Baca jawaban refleksi secara acak dan gunakan untuk menentukan murid yang perlu pendampingan, terutama yang masih menjumlahkan koefisien atau mengalikan eksponen.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri mengapa 3x² × 2x³ = 6x⁵, bukan 6x⁶ atau 5x⁵.',
        placeholder: 'Dari ubin faktor aku melihat …',
      },
      {
        id: 'r2',
        teks: 'Bagian mana dari kegiatan (ubin faktor, tabel pola, lab, pilah miskonsepsi) yang paling membantumu? Mengapa?',
        placeholder: 'Yang paling membantu adalah …',
      },
      {
        id: 'r3',
        teks: 'Kesalahan apa yang paling perlu kamu waspadai saat menyederhanakan bentuk aljabar berpangkat?',
        placeholder: 'Aku perlu ingat bahwa …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat menyederhanakan bentuk aljabar berpangkat sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '🙂 Yakin — aku bisa memakai sifat-sifatnya' },
      { id: 'ragu', label: '🤔 Masih ragu kapan eksponen dijumlah atau dikurang' },
      { id: 'bantuan', label: '🙋 Aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, petak mading Nadia kini punya rumus ringkas!',
    teks: 'Kamu tidak sekadar menghafal — kamu menghitung ubin faktor, membaca pola tabel, menguji dugaan, lalu memakai sifat perkalian dan pembagian berbasis sama untuk menyederhanakan bentuk aljabar.',
    capaian: [
      'Mengumpulkan data perkalian dan pembagian bilangan berpangkat dengan ubin faktor dan tabel pola.',
      'Menemukan bahwa eksponen dijumlahkan pada perkalian dan dikurangkan pada pembagian berbasis sama.',
      'Menemukan bahwa koefisien dikalikan atau dibagi seperti bilangan biasa.',
      'Menyangkal dugaan keliru dengan contoh penyangkal.',
      'Menyederhanakan bentuk aljabar berpangkat, termasuk dalam masalah kontekstual.',
    ],
  },
};
