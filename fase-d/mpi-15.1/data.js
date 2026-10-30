'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Fungsi Linear & Non-linear dari Pola Perubahan Nilai
   Fase D — SMP Kelas VIII · Topik 15 Fungsi Linear dan Non-linear

   Tujuan Pembelajaran:
   Mengidentifikasi ciri fungsi linear dan non linear berdasarkan pola
   perubahan nilai pada tabel dan situasi kontekstual.

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
     1. Stimulasi     (7')  — "Pasar Malam Sekolah": kartu tarif parkir
                              dan luas spanduk persegi. Murid MENDUGA
                              perbedaan pola keduanya (tidak dinilai).
     2. Masalah       (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data          (20') — empat situasi stand (parkir, spanduk, saldo
                              kartu jajan, lipatan origami): melengkapi
                              nilai y yang kosong dan menghitung Δy setiap
                              langkah pada tabel perubahan. Isian Δy
                              didiagnosa (terbalik/jumlah/menyalin suku).
     4. Olah data     (15') — tabel + grafik keempat situasi disandingkan
                              dengan kolom Δy/Δx, ditambah data tarif ojek
                              (x melompat); pertanyaan penuntun bertahap;
                              kartu istilah laju perubahan, fungsi linear,
                              fungsi non-linear.
     5. Pembuktian    (15') — Lab Pola Perubahan: mengubah m dan c pada
                              y = mx + c, mencoba y = x², y = 2ˣ, y = 12/x,
                              dan menyalakan "x melompat"; membandingkan
                              dugaan awal; memilah tujuh tabel kontekstual
                              (linear / non-linear) berisi jebakan
                              miskonsepsi.
     6. Simpulan      (7')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap     (15') — delapan soal kontekstual: klasifikasi tabel
                              berdiagnosa (lilin, bak air, bakteri, obat),
                              pilihan ganda berpengecoh (taksi, kue bulat,
                              situasi linear), dan isian nilai berikutnya
                              (fotokopi brosur).
     8. Refleksi      (5')  — refleksi tertulis & penilaian diri.

   Setiap tabel ditulis sebagai { xs, aturan } (aturan seksi 82
   shared/engine.js: linear/kuadrat/eksponen/kebalikan) atau { xs, ys }
   bila polanya tidak berbentuk aturan baku. Nilai y, Δy, Δy/Δx, dan
   jenis fungsinya dihitung ulang oleh tests/mpi-15.1-data.test.js.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan, sehingga tiap murid
   (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; dibandingkan pada tahap Pembuktian.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati dua pola harga dan ukuran di Pasar Malam Sekolah lalu menduga perbedaannya.',
    tp: 'Mengidentifikasi ciri fungsi linear dan non linear berdasarkan pola perubahan nilai pada tabel dan situasi kontekstual.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menghitung perubahan nilai (Δx, Δy) dan laju perubahan Δy/Δx dari tabel.',
      'Menemukan bahwa fungsi linear memiliki laju perubahan yang tetap, sedangkan fungsi non-linear tidak.',
      'Menjelaskan bahwa laju tetap boleh bernilai positif, negatif, atau nol, dan tetap berlaku saat jarak antar-nilai x tidak sama.',
      'Mengidentifikasi fungsi linear dan non-linear dari tabel dan situasi kehidupan sehari-hari.',
    ],
    guru: 'Tayangkan kedua kartu. Tanyakan: "Keduanya sama-sama naik. Apakah naiknya sama?" Tampung semua dugaan tanpa dikoreksi — murid akan mengujinya sendiri.',
    judul: 'Pasar Malam Sekolah',
    cerita:
      'Kelas VIII menyiapkan Pasar Malam Sekolah. Bendahara panitia mencatat dua hal berikut:',
    kartu: [
      {
        ikon: '🛵',
        judul: 'Tarif parkir',
        teks: '1 jam Rp3.000 · 2 jam Rp4.000 · 3 jam Rp5.000 · 4 jam Rp6.000',
      },
      {
        ikon: '🖼️',
        judul: 'Spanduk persegi',
        teks: 'Sisi 1 m → luas 1 m² · sisi 2 m → 4 m² · sisi 3 m → 9 m² · sisi 4 m → 16 m²',
      },
    ],
    pertanyaan: 'Dugaanmu: apa perbedaan pola tarif parkir dan luas spanduk?',
    opsi: [
      {
        id: 'tetap',
        label:
          'Tarif parkir bertambah dengan besar yang sama setiap jam, sedangkan luas spanduk bertambah makin besar.',
      },
      { id: 'sama', label: 'Tidak ada bedanya, keduanya sama-sama terus naik.' },
      {
        id: 'spanduk',
        label:
          'Luas spanduk bertambah dengan besar yang sama, sedangkan tarif parkir bertambah makin besar.',
      },
      { id: 'besar', label: 'Bedanya hanya pada besar bilangannya: ribuan dan satuan.' },
    ],
    alasanLabel: 'Mengapa kamu menduga begitu?',
    alasanPlaceholder: 'Contoh: karena dari 1 jam ke 2 jam tarifnya naik …',
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
    goal: 'Merumuskan pertanyaan inti tentang cara mengenali pola perubahan nilai sebuah fungsi.',
    guru: 'Arahkan agar pertanyaannya umum: berlaku untuk tabel dan situasi apa pun, bukan hanya parkir. Tulis beberapa hipotesis di papan untuk diuji nanti.',
    pengantar:
      'Panitia ingin menaksir biaya dan ukuran barang lain sebelum membelinya. Untuk itu mereka perlu tahu: apakah suatu nilai berubah secara teratur dengan besar yang sama, atau tidak? Pola seperti ini muncul di banyak tempat — tarif ojek, isi bak air, saldo kartu, hingga pertumbuhan bakteri.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'pola',
        label:
          'Bagaimana cara mengenali dari tabel dan situasinya apakah suatu nilai berubah dengan besar yang tetap atau tidak?',
      },
      { id: 'mahal', label: 'Stand mana yang paling mahal di Pasar Malam Sekolah?' },
      { id: 'jumlah', label: 'Berapa jumlah seluruh tarif parkir dalam satu malam?' },
      { id: 'warna', label: 'Warna apa yang paling cocok untuk spanduk?' },
    ],
    correct: 'pola',
    umpan: {
      pola: '<strong>Tepat.</strong> Kita akan mengumpulkan data dari beberapa situasi, menghitung perubahan nilainya, lalu menemukan ciri <em>fungsi linear</em> dan <em>fungsi non-linear</em>.',
      mahal:
        'Membandingkan harga stand tidak menjelaskan bagaimana sebuah nilai berubah. Coba pilih lagi.',
      jumlah:
        'Menjumlahkan tarif hanya menghasilkan satu bilangan, bukan pola perubahan. Coba pilih lagi.',
      warna: 'Warna spanduk tidak berkaitan dengan pola perubahan nilai. Coba pilih lagi.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu bagaimana cara mengetahui apakah perubahan suatu nilai selalu sama besar?',
    hipotesisPlaceholder: 'Contoh: mungkin dengan menghitung selisih …',
    nextLabel: 'Mulai Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA
     Empat situasi; setiap tabel: isi y yang kosong & Δy per langkah.
     ---------------------------------------------------------- */
  kumpul: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengumpulkan data perubahan nilai (Δx dan Δy) dari empat situasi di Pasar Malam Sekolah.',
    guru: 'Minta pasangan murid menghitung y dari cerita lebih dulu, lalu Δy = nilai sesudah − nilai sebelum. Jika murid bertanya tanda negatif, kembalikan: "Saldonya bertambah atau berkurang?"',
    instruksi:
      'Untuk setiap situasi: lengkapi nilai y yang kosong, lalu isi kolom Δy (perubahan y dari baris sebelumnya). Δx sudah dihitung untukmu. Tekan Periksa bila sudah lengkap.',
    situasi: [
      {
        id: 'parkir',
        nama: 'Parkir',
        judul: 'A. Tarif parkir sepeda motor',
        cerita:
          'Tarif parkir Pasar Malam Sekolah: Rp2.000 saat masuk, ditambah Rp1.000 untuk setiap jam.',
        labelX: 'Lama parkir (jam)',
        labelY: 'Tarif (Rp)',
        xs: [1, 2, 3, 4, 5],
        aturan: { jenis: 'linear', m: 1000, c: 2000 },
        kosong: [3, 4],
        hints: [
          'Tarif 4 jam = Rp2.000 + 4 × Rp1.000.',
          'Δy = nilai y sesudah − nilai y sebelum. Contoh: 4.000 − 3.000 = 1.000.',
        ],
        temuan: 'Setiap jam bertambah 1, tarifnya selalu bertambah Rp1.000.',
      },
      {
        id: 'spanduk',
        nama: 'Spanduk',
        judul: 'B. Luas spanduk persegi',
        cerita:
          'Panitia mencetak spanduk berbentuk persegi. Jika sisinya s meter, luasnya s × s meter persegi.',
        labelX: 'Sisi (m)',
        labelY: 'Luas (m²)',
        xs: [1, 2, 3, 4, 5],
        aturan: { jenis: 'kuadrat' },
        kosong: [3, 4],
        hints: [
          'Luas spanduk bersisi 4 m = 4 × 4.',
          'Hitung Δy satu per satu: 4 − 1, 9 − 4, dan seterusnya.',
        ],
        temuan: 'Setiap sisi bertambah 1 m, luasnya bertambah 3, 5, 7, 9 m² — makin besar.',
      },
      {
        id: 'saldo',
        nama: 'Saldo',
        judul: 'C. Saldo kartu jajan',
        cerita:
          'Bima mengisi kartu jajan Rp50.000. Setiap hari pasar malam ia membeli satu paket makanan seharga Rp8.000.',
        labelX: 'Hari ke-',
        labelY: 'Sisa saldo (Rp)',
        xs: [0, 1, 2, 3, 4],
        aturan: { jenis: 'linear', m: -8000, c: 50000 },
        kosong: [3, 4],
        hints: [
          'Setiap hari saldo dikurangi Rp8.000.',
          'Saldo berkurang, jadi Δy bernilai negatif: 42.000 − 50.000 = −8.000.',
        ],
        temuan: 'Setiap hari bertambah 1, saldonya selalu berkurang Rp8.000 (Δy = −8.000).',
      },
      {
        id: 'lipat',
        nama: 'Lipat kertas',
        judul: 'D. Lipatan kertas origami',
        cerita:
          'Di stand origami, selembar kertas dilipat dua berulang kali. Setiap lipatan menggandakan banyak lapisan kertas.',
        labelX: 'Banyak lipatan',
        labelY: 'Banyak lapisan',
        xs: [0, 1, 2, 3, 4],
        aturan: { jenis: 'eksponen', r: 2 },
        kosong: [3, 4],
        hints: [
          'Banyak lapisan selalu dikali 2 setiap lipatan: 1, 2, 4, …',
          'Hitung Δy satu per satu: 2 − 1, 4 − 2, dan seterusnya.',
        ],
        temuan: 'Setiap lipatan bertambah 1, lapisannya bertambah 1, 2, 4, 8 — makin besar.',
      },
    ],
    nextLabel: 'Olah Datanya →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — OLAH DATA
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 4 · Pengolahan Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Membandingkan pola Δy dan Δy/Δx serta grafik keempat situasi untuk menemukan ciri fungsi linear dan non-linear.',
    guru: 'Biarkan pasangan murid berdiskusi sebelum memilih jawaban. Tekankan kolom Δy/Δx: bagaimana jika x tidak naik 1-1? Data ojek disiapkan untuk memancing diskusi itu.',
    instruksi:
      'Inilah keempat tabelmu, kini dengan kolom Δy/Δx (perubahan y untuk setiap perubahan x sebesar 1) dan grafiknya. Bandingkan, lalu jawab pertanyaan di bawahnya.',
    ojek: {
      judul: 'Data tambahan: tarif ojek daring',
      cerita:
        'Tarif ojek daring ke pasar malam: Rp4.000 ditambah Rp2.500 per km. Rina mencatat tarif untuk beberapa jarak yang tidak berurutan.',
      labelX: 'Jarak (km)',
      labelY: 'Tarif (Rp)',
      xs: [2, 4, 5, 8],
      aturan: { jenis: 'linear', m: 2500, c: 4000 },
    },
    pertanyaan: [
      {
        id: 'tetap',
        tanya: 'Pada situasi mana Δy selalu sama setiap kali x bertambah 1?',
        opsi: [
          { id: 'benar', label: 'Parkir dan Saldo' },
          { id: 'naik', label: 'Parkir, Spanduk, dan Lipat kertas' },
          { id: 'besar', label: 'Spanduk dan Lipat kertas' },
          { id: 'satu', label: 'Parkir saja' },
        ],
        correct: 'benar',
        cek: { jenis: 'linear' },
        umpan: {
          benar:
            '<strong>Tepat.</strong> Tarif parkir selalu bertambah 1.000 dan saldo selalu berkurang 8.000. Perubahannya <strong>tetap</strong>.',
          naik: 'Ketiganya memang naik, tetapi lihat kolom Δy Spanduk dan Lipat kertas: apakah selalu sama? Coba lagi.',
          besar:
            'Justru pada Spanduk dan Lipat kertas Δy-nya berubah-ubah (makin besar). Coba lagi.',
          satu: 'Saldo memang berkurang, tetapi berkurangnya selalu 8.000 — itu juga tetap. Coba lagi.',
        },
      },
      {
        id: 'grafik',
        tanya: 'Perhatikan grafiknya. Bagaimana letak titik-titik pada situasi Parkir dan Saldo?',
        opsi: [
          { id: 'benar', label: 'Terletak pada satu garis lurus' },
          { id: 'lengkung', label: 'Membentuk lengkungan yang makin curam' },
          { id: 'acak', label: 'Tersebar tidak beraturan' },
          { id: 'datar', label: 'Selalu mendatar' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Perubahan yang tetap membuat titik-titiknya <strong>segaris</strong>. Pada Spanduk dan Lipat kertas titiknya melengkung.',
          lengkung:
            'Lengkungan makin curam tampak pada Spanduk dan Lipat kertas. Lihat lagi grafik Parkir dan Saldo.',
          acak: 'Titik-titiknya teratur sekali. Coba tarik garis putus-putusnya dengan mata.',
          datar:
            'Grafik Parkir naik dan grafik Saldo turun, jadi tidak mendatar. Perhatikan apakah keduanya lurus.',
        },
      },
      {
        id: 'turun',
        tanya: 'Saldo kartu jajan terus berkurang. Bagaimana perubahannya?',
        opsi: [
          {
            id: 'benar',
            label: 'Selalu berkurang Rp8.000 per hari, jadi perubahannya tetap walaupun negatif',
          },
          { id: 'tidakTetap', label: 'Perubahannya tidak tetap karena nilainya turun' },
          { id: 'makin', label: 'Berkurang makin cepat setiap hari' },
          { id: 'nol', label: 'Tidak ada perubahan sama sekali' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Laju perubahannya −8.000 per hari. <strong>Laju yang tetap boleh bernilai negatif.</strong>',
          tidakTetap:
            'Turun bukan berarti tidak tetap. Lihat kolom Δy Saldo: apakah nilainya sama semua? Coba lagi.',
          makin: 'Δy saldo selalu −8.000, tidak makin besar. Coba lagi.',
          nol: 'Saldonya jelas berubah dari 50.000 menjadi 18.000. Coba lagi.',
        },
      },
      {
        id: 'naik',
        tanya: 'Luas spanduk dan banyak lapisan kertas juga terus naik. Apakah perubahannya tetap?',
        opsi: [
          {
            id: 'benar',
            label: 'Tidak, Δy-nya makin besar sehingga laju perubahannya berubah-ubah',
          },
          { id: 'ya', label: 'Ya, karena nilainya selalu naik' },
          { id: 'kecil', label: 'Tidak, Δy-nya makin kecil' },
          { id: 'dua', label: 'Ya, Δy-nya selalu 2' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Spanduk: 3, 5, 7, 9. Lipat kertas: 1, 2, 4, 8. <strong>Selalu naik belum tentu perubahannya tetap.</strong>',
          ya: 'Selalu naik tidak sama dengan naik dengan besar yang sama. Lihat kolom Δy-nya. Coba lagi.',
          kecil: 'Bandingkan Δy pertama dan terakhir: mana yang lebih besar? Coba lagi.',
          dua: 'Pada Spanduk, Δy-nya 3, 5, 7, 9 — selisih Δy-nya memang 2, tetapi Δy-nya sendiri tidak sama. Coba lagi.',
        },
      },
      {
        id: 'lompat',
        tanya:
          'Pada tabel tarif ojek, Δy-nya 5.000, 2.500, dan 7.500 — tidak sama. Apa yang perlu dibandingkan?',
        opsi: [
          {
            id: 'benar',
            label: 'Δy/Δx; hasilnya selalu 2.500, jadi perubahannya tetap',
          },
          {
            id: 'dy',
            label: 'Tidak perlu, Δy berbeda berarti perubahannya tidak tetap',
          },
          { id: 'y', label: 'Nilai y saja; karena terus naik maka perubahannya tetap' },
          { id: 'dx', label: 'Δx saja; karena berbeda-beda maka perubahannya tidak tetap' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> 5.000 : 2 = 2.500, 2.500 : 1 = 2.500, 7.500 : 3 = 2.500. Bila x tidak naik 1-1, bandingkan <strong>Δy/Δx</strong>.',
          dy: 'Jarak x-nya juga tidak sama (Δx = 2, 1, 3). Wajar Δy-nya berbeda. Coba bagi Δy dengan Δx.',
          y: 'Ingat Spanduk: selalu naik belum tentu tetap. Coba bagi Δy dengan Δx.',
          dx: 'Δx yang berbeda hanya menunjukkan jarak x yang dicatat. Coba bagi Δy dengan Δx.',
        },
      },
    ],
    istilah: [
      {
        label: 'Laju perubahan',
        teks: 'Δy/Δx — besar perubahan y untuk setiap perubahan x sebesar 1.',
      },
      {
        label: 'Fungsi linear',
        teks: 'Laju perubahannya tetap; titik-titik grafiknya segaris. Contoh: tarif parkir, saldo kartu.',
      },
      {
        label: 'Fungsi non-linear',
        teks: 'Laju perubahannya berubah-ubah; titik-titik grafiknya tidak segaris. Contoh: luas spanduk, lapisan kertas.',
      },
      {
        label: 'Ingat!',
        teks: 'Laju yang tetap boleh positif (naik), negatif (turun), atau nol (mendatar).',
      },
    ],
    nextLabel: 'Buktikan Temuanmu →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN
     A: Lab Pola Perubahan. B: dugaan awal. C: pilah tabel.
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji temuan bahwa laju perubahan tetap adalah ciri fungsi linear pada banyak aturan dan situasi.',
    guru: 'Minta murid memprediksi dulu sebelum menekan tombol: "Kalau m diganti negatif, apakah Δy/Δx masih tetap?" Setelah lab, tanyakan mengapa saat x melompat Δy berubah-ubah tetapi Δy/Δx tidak.',
    judulA: 'A. Lab Pola Perubahan',
    instruksiA:
      'Ubah aturannya dan amati tabel, kolom Δy/Δx, serta grafiknya. Selesaikan ketiga misi berikut.',
    misi: [
      { id: 'm', teks: 'Coba minimal dua nilai m berbeda pada y = mx + c (boleh negatif atau 0).' },
      { id: 'jenis', teks: 'Coba juga aturan y = x², y = 2ˣ, dan y = 12/x.' },
      {
        id: 'lompat',
        teks: 'Nyalakan “Nilai x melompat”, lalu bandingkan kolom Δy dan Δy/Δx.',
      },
    ],
    kesimpulan:
      '<strong>Terbukti.</strong> Untuk setiap m dan c, aturan y = mx + c selalu punya Δy/Δx = m yang tetap dan grafiknya lurus — bahkan saat x melompat. Aturan y = x², y = 2ˣ, dan y = 12/x punya laju yang berubah-ubah dan grafiknya melengkung.',
    dugaanBenar: 'tetap',
    judulB: 'B. Bandingkan dengan dugaan awalmu',
    judulC: 'C. Pilah: linear atau non-linear?',
    instruksiC:
      'Setiap tabel berasal dari situasi di sekitar pasar malam. Hitung Δy/Δx-nya, lalu pilih jenis fungsinya. Hati-hati dengan jebakan!',
    opsiPilah: [
      { id: 'linear', label: 'Fungsi linear' },
      { id: 'nonlinear', label: 'Fungsi non-linear' },
    ],
    pilah: [
      {
        id: 'kursi',
        teks: 'Tinggi tumpukan kursi plastik terhadap banyak kursi.',
        labelX: 'Banyak kursi',
        labelY: 'Tinggi (cm)',
        xs: [1, 2, 3, 4],
        aturan: { jenis: 'linear', m: 4, c: 76 },
        correct: 'linear',
        explanation: 'Setiap kursi ditambah, tingginya selalu bertambah 4 cm. Lajunya tetap 4.',
      },
      {
        id: 'tiket',
        teks: 'Harga tiket masuk wahana terhadap lama bermain — harganya Rp5.000 berapa jam pun.',
        labelX: 'Lama (jam)',
        labelY: 'Harga (Rp)',
        xs: [1, 2, 3, 4],
        aturan: { jenis: 'linear', m: 0, c: 5000 },
        correct: 'linear',
        explanation:
          'Δy selalu 0, jadi laju perubahannya tetap (nol). Grafiknya garis mendatar — tetap fungsi linear.',
      },
      {
        id: 'galon',
        teks: 'Sisa air galon stand minuman terhadap hari; Raka mencatat pada hari yang tidak berurutan.',
        labelX: 'Hari ke-',
        labelY: 'Sisa air (L)',
        xs: [0, 2, 3, 6],
        aturan: { jenis: 'linear', m: -3, c: 19 },
        correct: 'linear',
        explanation:
          'Δy-nya −6, −3, −9 memang berbeda, tetapi Δx-nya 2, 1, 3. Δy/Δx selalu −3, jadi linear.',
      },
      {
        id: 'kabar',
        teks: 'Banyak orang yang mendengar kabar berantai; setiap orang menyampaikan ke 3 orang baru.',
        labelX: 'Putaran',
        labelY: 'Banyak orang',
        xs: [0, 1, 2, 3],
        aturan: { jenis: 'eksponen', r: 3 },
        correct: 'nonlinear',
        explanation: 'Δy-nya 2, 6, 18 — makin besar. Selalu naik, tetapi lajunya tidak tetap.',
      },
      {
        id: 'waktu',
        teks: 'Waktu tempuh 60 km menuju pasar malam terhadap kecepatan kendaraan.',
        labelX: 'Kecepatan (km/jam)',
        labelY: 'Waktu (jam)',
        xs: [10, 20, 30, 60],
        aturan: { jenis: 'kebalikan', k: 60 },
        correct: 'nonlinear',
        explanation:
          'Nilainya turun, tetapi Δy/Δx-nya −0,3; −0,1; lalu sekitar −0,03 — berubah-ubah. Turun belum tentu linear.',
      },
      {
        id: 'salaman',
        teks: 'Banyak salaman bila setiap dua anggota panitia bersalaman tepat satu kali.',
        labelX: 'Banyak orang',
        labelY: 'Banyak salaman',
        xs: [2, 3, 4, 5],
        ys: [1, 3, 6, 10],
        correct: 'nonlinear',
        explanation: 'Δy-nya 2, 3, 4 — bertambah terus, jadi laju perubahannya tidak tetap.',
      },
      {
        id: 'taplak',
        teks: 'Luas taplak meja persegi terhadap panjang sisinya.',
        labelX: 'Sisi (dm)',
        labelY: 'Luas (dm²)',
        xs: [2, 4, 6, 8],
        aturan: { jenis: 'kuadrat' },
        correct: 'nonlinear',
        explanation:
          'Δx-nya selalu 2, tetapi Δy-nya 12, 20, 28 — makin besar. Sama seperti spanduk.',
      },
    ],
    nextLabel: 'Susun Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Merumuskan ciri fungsi linear dan non-linear dengan kata-kata sendiri.',
    guru: 'Minta beberapa pasangan membacakan kesimpulannya. Bandingkan dengan hipotesis di papan dari Tahap 2.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari bank kalimat. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      {
        id: 'k1',
        awal: 'Untuk mengenali jenis fungsi dari tabel, kita menghitung',
        correct: 'b1',
      },
      { id: 'k2', awal: 'Jika Δy/Δx selalu sama, fungsinya', correct: 'b2' },
      { id: 'k3', awal: 'Jika Δy/Δx berubah-ubah, fungsinya', correct: 'b3' },
      { id: 'k4', awal: 'Laju perubahan yang tetap boleh bernilai', correct: 'b4' },
      {
        id: 'k5',
        awal: 'Bila jarak antar-nilai x tidak sama, yang dibandingkan adalah',
        correct: 'b5',
      },
    ],
    bank: [
      { id: 'b1', teks: 'perubahan x (Δx), perubahan y (Δy), dan laju perubahan Δy/Δx.' },
      { id: 'b2', teks: 'linear, dan titik-titik grafiknya terletak pada satu garis lurus.' },
      { id: 'b3', teks: 'non-linear, dan titik-titik grafiknya tidak segaris.' },
      { id: 'b4', teks: 'positif (naik), negatif (turun), atau nol (mendatar).' },
      { id: 'b5', teks: 'hasil bagi Δy/Δx, bukan Δy saja.' },
      { id: 'x1', teks: 'nilai y terbesar dan terkecil saja.' },
      { id: 'x2', teks: 'linear jika nilai y-nya selalu naik.' },
      { id: 'x3', teks: 'positif saja, sebab laju negatif berarti non-linear.' },
      { id: 'x4', teks: 'Δy saja, tanpa memperhatikan Δx.' },
    ],
    rangkuman: [
      'Pola perubahan nilai diamati dengan menghitung Δx, Δy, dan laju perubahan Δy/Δx pada pasangan nilai yang berurutan.',
      'Fungsi linear memiliki laju perubahan yang tetap; titik-titik grafiknya segaris.',
      'Fungsi non-linear memiliki laju perubahan yang berubah-ubah; titik-titik grafiknya tidak segaris.',
      'Laju tetap boleh positif, negatif, atau nol. Selalu naik atau selalu turun belum tentu linear.',
    ],
    nextLabel: 'Terapkan Konsepnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     tipe 'jenis' : klasifikasi tabel (opsiJenis diacak app.js);
                    umpan balik salah dari diagnosaJenisFungsi seksi 82.
     tipe 'pilih' : pilihan ganda berpengecoh (opsi diacak app.js).
     tipe 'isi'   : isian nilai y pada xTanya.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan konsep',
    goal: 'Mengidentifikasi fungsi linear dan non-linear dari tabel dan situasi kontekstual.',
    guru: 'Biarkan murid mengerjakan mandiri. Catat pesan diagnosa yang sering muncul (mis. "selalu naik dikira linear" atau "mengabaikan Δx") untuk dibahas bersama di akhir.',
    instruksi:
      'Kerjakan setiap soal. Ada soal menentukan jenis fungsi dari tabel, pilihan ganda, dan isian. Gunakan tombol nomor untuk berpindah soal.',
    opsiJenis: [
      { id: 'linear', label: 'Fungsi linear' },
      { id: 'nonlinear', label: 'Fungsi non-linear' },
    ],
    soal: [
      {
        id: 's1',
        tipe: 'jenis',
        cerita: 'Sebatang lilin hias di stand dekorasi dinyalakan. Tingginya dicatat setiap jam.',
        labelX: 'Waktu (jam)',
        labelY: 'Tinggi lilin (cm)',
        xs: [0, 1, 2, 3, 4],
        aturan: { jenis: 'linear', m: -3, c: 24 },
        tanya: 'Hubungan waktu dan tinggi lilin merupakan …',
        hints: ['Hitung Δy setiap jam. Apakah selalu sama, walaupun negatif?'],
        pembahasan:
          'Δy selalu −3 untuk setiap Δx = 1, jadi lajunya tetap −3 cm per jam. Fungsi linear yang turun.',
      },
      {
        id: 's2',
        tipe: 'jenis',
        cerita:
          'Bak air di stand cuci tangan diisi dari keran. Raka mencatat isinya pada menit yang tidak berurutan.',
        labelX: 'Waktu (menit)',
        labelY: 'Isi bak (L)',
        xs: [1, 3, 4, 7],
        aturan: { jenis: 'linear', m: 4, c: 5 },
        tanya: 'Hubungan waktu dan isi bak merupakan …',
        hints: ['Δx-nya tidak sama. Bandingkan Δy/Δx, bukan Δy saja.'],
        pembahasan: 'Δy = 8, 4, 12 dan Δx = 2, 1, 3. Δy/Δx selalu 4 liter per menit, jadi linear.',
      },
      {
        id: 's3',
        tipe: 'pilih',
        cerita:
          'Tarif taksi menuju pasar malam: Rp7.000 saat buka pintu, ditambah Rp5.000 untuk setiap km.',
        labelX: 'Jarak (km)',
        labelY: 'Tarif (Rp)',
        xs: [1, 2, 3, 4],
        aturan: { jenis: 'linear', m: 5000, c: 7000 },
        tanya: 'Pernyataan yang tepat tentang hubungan jarak dan tarif taksi adalah …',
        opsi: [
          {
            id: 'benar',
            label: 'Fungsi linear, karena tarif selalu bertambah Rp5.000 untuk setiap 1 km',
          },
          { id: 'awal', label: 'Fungsi non-linear, karena ada biaya buka pintu Rp7.000' },
          { id: 'naik', label: 'Fungsi linear, karena tarifnya selalu naik' },
          { id: 'mahal', label: 'Fungsi non-linear, karena tarifnya makin mahal' },
        ],
        correct: 'benar',
        umpan: {
          benar: '<strong>Tepat!</strong>',
          awal: 'Biaya buka pintu hanya dibayar sekali. Setelah itu tarif bertambah sama besar setiap km.',
          naik: 'Jenisnya benar, tetapi alasannya keliru: luas spanduk juga selalu naik, padahal non-linear. Pilih alasan yang memakai laju perubahan.',
          mahal:
            'Makin mahal tidak berarti non-linear. Hitung pertambahan tarif setiap 1 km: apakah sama?',
        },
        hints: ['Tulis tabelnya: 1 km → 12.000, 2 km → 17.000, … lalu hitung Δy.'],
        pembahasan:
          'Tarif: 12.000, 17.000, 22.000, 27.000. Δy selalu 5.000 untuk Δx = 1, jadi lajunya tetap — fungsi linear.',
      },
      {
        id: 's4',
        tipe: 'pilih',
        cerita:
          'Stand kue menjual kue bulat. Luas permukaan kue: L = 22/7 × r × r. Untuk jari-jari 7, 14, dan 21 cm, luasnya 154, 616, dan 1.386 cm².',
        labelX: 'Jari-jari (cm)',
        labelY: 'Luas (cm²)',
        xs: [7, 14, 21],
        aturan: { jenis: 'kuadrat', a: 22 / 7 },
        tanya: 'Hubungan jari-jari dan luas permukaan kue adalah …',
        opsi: [
          {
            id: 'benar',
            label: 'Fungsi non-linear, karena Δy-nya 462 lalu 770 untuk Δx yang sama',
          },
          { id: 'dx', label: 'Fungsi linear, karena jari-jarinya bertambah tetap 7 cm' },
          { id: 'naik', label: 'Fungsi linear, karena luasnya selalu naik' },
          { id: 'turun', label: 'Fungsi non-linear, karena luasnya turun' },
        ],
        correct: 'benar',
        umpan: {
          benar: '<strong>Tepat!</strong>',
          dx: 'Δx memang tetap, tetapi yang menentukan adalah Δy/Δx. Hitung 616 − 154 dan 1.386 − 616.',
          naik: 'Selalu naik belum tentu linear. Hitung Δy-nya: apakah sama?',
          turun: 'Luasnya justru naik. Periksa lagi datanya.',
        },
        hints: ['Hitung 616 − 154 dan 1.386 − 616. Apakah hasilnya sama?'],
        pembahasan:
          'Δy = 462 lalu 770, padahal Δx sama-sama 7. Laju perubahannya 66 lalu 110 — berubah-ubah, jadi non-linear.',
      },
      {
        id: 's5',
        tipe: 'jenis',
        cerita: 'Di pameran sains, banyak bakteri pada sepotong roti berlipat dua setiap jam.',
        labelX: 'Waktu (jam)',
        labelY: 'Banyak bakteri',
        xs: [0, 1, 2, 3, 4],
        aturan: { jenis: 'eksponen', a: 100, r: 2 },
        tanya: 'Hubungan waktu dan banyak bakteri merupakan …',
        hints: ['Hitung Δy setiap jam: 200 − 100, 400 − 200, …'],
        pembahasan:
          'Δy = 100, 200, 400, 800 — makin besar walaupun Δx selalu 1. Laju perubahannya berubah-ubah, jadi non-linear.',
      },
      {
        id: 's6',
        tipe: 'isi',
        cerita:
          'Fotokopi brosur pasar malam: biaya Rp2.000 per pesanan ditambah Rp150 per lembar. Bendahara mencatat tabel berikut.',
        labelX: 'Banyak lembar',
        labelY: 'Biaya (Rp)',
        xs: [10, 20, 30, 40],
        aturan: { jenis: 'linear', m: 150, c: 2000 },
        xTanya: 60,
        tanya: 'Berapa rupiah biaya fotokopi 60 lembar?',
        jebakan: {
          nilai: 9500,
          pesan:
            'Kamu menambahkan satu kali Δy (1.500) ke biaya 40 lembar. Padahal dari 40 ke 60 lembar, x bertambah 20 — dua kali langkah 10.',
        },
        hints: [
          'Setiap 10 lembar, biaya bertambah 1.500. Jadi laju perubahannya 150 per lembar.',
          'Dari 40 ke 60 lembar, x bertambah 20, jadi biaya bertambah 20 × 150.',
        ],
        pembahasan:
          'Δy/Δx = 1.500 : 10 = 150. Dari 40 ke 60 lembar biaya bertambah 20 × 150 = 3.000, jadi 8.000 + 3.000 = Rp11.000.',
      },
      {
        id: 's7',
        tipe: 'jenis',
        cerita:
          'Petugas UKS menjelaskan: kadar obat dalam darah berkurang menjadi setengahnya setiap 4 jam.',
        labelX: 'Waktu (jam)',
        labelY: 'Kadar obat (mg)',
        xs: [0, 4, 8, 12],
        ys: [800, 400, 200, 100],
        tanya: 'Hubungan waktu dan kadar obat merupakan …',
        hints: ['Kadarnya selalu turun. Apakah turunnya selalu sama besar?'],
        pembahasan:
          'Δy = −400, −200, −100 untuk Δx yang sama (4 jam). Turunnya makin kecil, jadi lajunya berubah-ubah — non-linear.',
      },
      {
        id: 's8',
        tipe: 'pilih',
        cerita: 'Panitia mendata beberapa hubungan di pasar malam.',
        tanya: 'Manakah situasi yang merupakan fungsi linear?',
        opsi: [
          {
            id: 'benar',
            label: 'Upah petugas kebersihan Rp60.000 untuk setiap hari kerja',
            aturan: { jenis: 'linear', m: 60000, c: 0 },
          },
          {
            id: 'lipat',
            label: 'Banyak lapisan kertas yang dilipat dua berulang kali',
            aturan: { jenis: 'eksponen', r: 2 },
          },
          {
            id: 'persegi',
            label: 'Luas lantai stand persegi terhadap panjang sisinya',
            aturan: { jenis: 'kuadrat' },
          },
          {
            id: 'bagi',
            label: 'Bagian tiap anak bila 12 kue dibagi rata kepada x anak',
            aturan: { jenis: 'kebalikan', k: 12 },
          },
        ],
        correct: 'benar',
        umpan: {
          benar: '<strong>Tepat!</strong>',
          lipat: 'Lapisannya 1, 2, 4, 8, … — bertambah makin besar, jadi non-linear.',
          persegi: 'Luasnya 1, 4, 9, 16, … — Δy-nya 3, 5, 7, … tidak tetap.',
          bagi: 'Bagiannya 12, 6, 4, 3, … — turunnya makin kecil, jadi non-linear.',
        },
        hints: [
          'Bayangkan tabel setiap situasi untuk x = 1, 2, 3, 4. Mana yang Δy-nya selalu sama?',
        ],
        pembahasan:
          'Upah: 60.000, 120.000, 180.000, … bertambah tetap 60.000 setiap hari — fungsi linear. Ketiga situasi lainnya mempunyai Δy yang berubah-ubah.',
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
    goal: 'Merefleksikan proses menemukan dan menerapkan ciri fungsi linear dan non-linear.',
    guru: 'Baca jawaban refleksi secara acak. Murid yang masih menganggap "selalu naik pasti linear" atau "turun pasti non-linear" perlu didampingi sebelum masuk materi grafik fungsi linear.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri perbedaan fungsi linear dan non-linear, lalu beri satu contoh dari kehidupanmu.',
        placeholder: 'Fungsi linear … sedangkan fungsi non-linear … Contohnya …',
      },
      {
        id: 'r2',
        teks: 'Mengapa kita perlu membandingkan Δy/Δx, bukan hanya Δy?',
        placeholder: 'Karena …',
      },
      {
        id: 'r3',
        teks: 'Jebakan apa yang paling perlu kamu waspadai saat menentukan jenis fungsi dari tabel?',
        placeholder: 'Aku perlu ingat bahwa …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat mengenali fungsi linear dan non-linear sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '🙂 Yakin — aku bisa menghitung Δy/Δx dan menentukan jenisnya' },
      { id: 'ragu', label: '🤔 Masih ragu saat nilai x melompat atau nilainya turun' },
      { id: 'bantuan', label: '🙋 Aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, hitungan panitia Pasar Malam kini rapi!',
    teks: 'Kamu tidak sekadar menghafal definisi — kamu menghitung perubahan nilai, membandingkan grafik, menguji banyak aturan di lab, lalu menemukan sendiri ciri fungsi linear dan non-linear.',
    capaian: [
      'Menghitung Δx, Δy, dan laju perubahan Δy/Δx dari tabel.',
      'Menemukan bahwa fungsi linear memiliki laju perubahan tetap dan grafik yang segaris.',
      'Menemukan bahwa fungsi non-linear memiliki laju perubahan yang berubah-ubah.',
      'Menjelaskan bahwa laju tetap boleh negatif atau nol, dan memakai Δy/Δx saat x melompat.',
      'Mengidentifikasi fungsi linear dan non-linear pada berbagai situasi sehari-hari.',
    ],
  },
};
