'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Bunga Tunggal dengan Barisan & Deret Aritmetika
   Fase F — SMK Rekayasa Perangkat Lunak

   Tujuan Pembelajaran:
   Menerapkan konsep barisan dan deret aritmetika untuk menentukan
   bunga dan nilai akhir modal pada masalah bunga tunggal.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'koleksi'
     Sintaks 4 — Data processing ............ tahap 'olahBunga' & 'olahModal'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 45 menit, murid berpasangan):
     1. Stimulasi    (7')  — "Buku Tabungan Raka": hasil freelance membuat
                             website UMKM, Rp2.000.000 disimpan di koperasi
                             sekolah dengan bunga tunggal 6% per tahun.
                             Saldo tahun 0–3 tampak, tahun ke-10 = ?;
                             murid menduga (tidak dinilai) + alasan.
     2. Masalah      (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data         (15') — menghitung sendiri buku tabungan tahun 1–4:
                             bunga tahun ke-n, total bunga, dan saldo;
                             lalu memilah pernyataan benar/salah
                             (termasuk miskonsepsi "bunga dari saldo").
     4a. Olah bunga  (10') — bunga per tahun tetap M₀ × i; total bunga =
                             deret aritmetika dengan b = 0, sehingga
                             Sₙ = n × a → Bₙ = M₀ × i × n.
     4b. Olah modal  (12') — barisan saldo M₀, M₁, M₂, … adalah barisan
                             aritmetika (a = M₀, b = M₀ × i). Mₙ = U₍ₙ₊₁₎
                             → Mₙ = M₀ + n × M₀ × i = M₀(1 + n × i).
     5. Pembuktian   (12') — uji rumus pada tabel, buktikan dugaan tahun
                             ke-10, dan periksa periode bulanan
                             (6% per tahun = 0,5% per bulan).
     6. Simpulan     (7')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap    (17') — delapan masalah kontekstual: mencari bunga,
                             nilai akhir, lama periode n, suku bunga i,
                             dan modal awal M₀ (isian & pilihan ganda).
     8. Refleksi     (5')  — refleksi tertulis & penilaian diri.

   Notasi: M₀ modal awal, i suku bunga per periode (desimal),
   n banyak periode, Bₙ total bunga n periode, Mₙ nilai akhir modal.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan, sehingga tiap murid
   (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  /* Kasus yang dipakai sepanjang modul. */
  kasus: {
    nama: 'Raka',
    M0: 2000000,
    persenTahun: 6,
    targetLaptop: 2600000,
    tahunTarget: 5,
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Pembuktian.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati buku tabungan berbunga tunggal dan menduga saldo pada tahun yang jauh.',
    guru: 'Tayangkan buku tabungan Raka. Tanyakan: "Apa yang tetap dan apa yang berubah dari tahun ke tahun?" Minta murid menduga saldo tahun ke-10 <em>tanpa kalkulator</em>. Tampung semua dugaan tanpa dikoreksi — murid akan mengujinya sendiri pada tahap Pembuktian.',
    judul: 'Buku Tabungan Raka',
    cerita:
      'Raka, siswa RPL, mendapat Rp2.000.000 dari proyek freelance membuat website UMKM. Uang itu ia simpan di koperasi sekolah yang memberi bunga tunggal 6% per tahun. Ia ingin membeli laptop seharga Rp2.600.000.',
    aturan: 'Bunga tunggal 6% per tahun, selalu dihitung dari setoran awal.',
    tampilTahun: 3,
    tahunDitanya: 10,
    pertanyaan: 'Dugaanmu: berapa saldo tabungan Raka pada akhir tahun ke-10?',
    opsi: [
      { id: 's3200', label: 'Rp3.200.000', nilai: 3200000 },
      { id: 's3582', label: 'Rp3.581.695', nilai: 3581695 },
      { id: 's3080', label: 'Rp3.080.000', nilai: 3080000 },
      { id: 's1200', label: 'Rp1.200.000', nilai: 1200000 },
    ],
    alasanLabel: 'Bagaimana kamu mendapatkan dugaan itu?',
    alasanPlaceholder: 'Contoh: setiap tahun saldonya bertambah …, jadi setelah 10 tahun …',
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
    goal: 'Merumuskan pertanyaan inti yang perlu diselidiki agar dugaan dapat diuji.',
    guru: 'Arahkan diskusi pada pertanyaan besar: adakah cara umum menghitung bunga dan saldo setelah n periode tanpa menghitung tahun demi tahun, dan apa hubungannya dengan barisan & deret aritmetika yang sudah dipelajari? Tulis hipotesis murid di papan.',
    pengantar:
      'Menghitung saldo tahun demi tahun sampai tahun ke-10 memang bisa, tetapi lama. Bagaimana jika koperasi ingin membuat aplikasi yang langsung menampilkan saldo untuk tahun berapa pun?',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'pola',
        label:
          'Bagaimana pola bunga dan saldo tiap tahun, dan adakah rumus untuk langsung menghitung bunga serta saldo setelah n tahun?',
      },
      { id: 'kali', label: 'Berapa hasil 6 × 2.000.000?' },
      { id: 'laptop', label: 'Merek laptop apa yang paling cocok untuk siswa RPL?' },
      { id: 'setahun', label: 'Berapa bunga yang diterima Raka pada tahun pertama saja?' },
    ],
    correct: 'pola',
    umpan: {
      pola: '<strong>Tepat.</strong> Kita akan <em>menemukan</em> pola bunga dan saldo, lalu menurunkan rumus bunga (Bₙ) dan nilai akhir modal (Mₙ) dengan bantuan barisan & deret aritmetika.',
      kali: '6 × 2.000.000 = 12.000.000 — jauh melebihi saldo Raka. Persen harus dibagi 100 dulu. Lagi pula, kita butuh cara untuk tahun berapa pun. Coba pilih lagi.',
      laptop:
        'Menarik untuk didiskusikan, tetapi tidak menjawab soal saldo tabungan. Coba pilih lagi.',
      setahun:
        'Bunga tahun pertama penting sebagai awal, tetapi yang ingin kita ketahui adalah bunga dan saldo setelah <em>banyak</em> tahun. Coba pilih lagi.',
    },
    hipotesisLabel: 'Tulis hipotesismu: bagaimana cara cepat menghitung saldo setelah n tahun?',
    hipotesisPlaceholder: 'Contoh: mungkin setoran awal ditambah n kali bunga setahun …',
    nextLabel: 'Mulai Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA
     Bagian A: isi buku tabungan tahun 1–4.
     Bagian B: pilah pernyataan benar/salah.
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengumpulkan data bunga per tahun, total bunga, dan saldo akhir tabungan Raka.',
    guru: 'Pastikan murid menghitung 6% dari Rp2.000.000 (bukan dari saldo terakhir). Ajukan pertanyaan pelacak: "Bunga tahun ke-2 dihitung dari uang yang mana?" Biarkan petunjuk berjenjang bekerja lebih dulu sebelum membantu.',
    instruksiA:
      'Lengkapi buku tabungan Raka untuk 4 tahun pertama. Ingat aturan koperasi: bunga 6% per tahun dihitung dari setoran awal Rp2.000.000. Kamu boleh menulis titik ribuan, mis. 120.000.',
    tabelN: 4,
    kolom: {
      bunga: 'Bunga tahun ke-n (Rp)',
      total: 'Total bunga Bₙ (Rp)',
      saldo: 'Saldo akhir Mₙ (Rp)',
    },
    hintsTabel: [
      'Bunga setahun = 6% × 2.000.000 = 6/100 × 2.000.000. Pada bunga tunggal, angka ini sama untuk setiap tahun.',
      'Total bunga Bₙ = bunga tahun 1 + … + bunga tahun ke-n. Saldo Mₙ = 2.000.000 + Bₙ.',
      'Contoh tahun ke-2: bunga 120.000, total bunga 240.000, saldo 2.240.000.',
    ],
    instruksiB: 'Amati tabelmu. Pilah setiap pernyataan berikut: benar atau salah?',
    opsiPilah: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: 'Bunga yang diterima Raka setiap tahun selalu sama, yaitu Rp120.000.',
        correct: 'benar',
        explanation:
          'Pada bunga tunggal, bunga selalu dihitung dari setoran awal: 6% × 2.000.000 = 120.000 setiap tahun.',
      },
      {
        id: 'p2',
        teks: 'Bunga tahun ke-2 lebih besar karena dihitung dari saldo Rp2.120.000.',
        correct: 'salah',
        explanation:
          'Itu cara <em>bunga majemuk</em>. Pada bunga tunggal, bunga tahun ke-2 tetap dihitung dari Rp2.000.000.',
      },
      {
        id: 'p3',
        teks: 'Barisan saldo 2.000.000, 2.120.000, 2.240.000, … adalah barisan aritmetika dengan beda 120.000.',
        correct: 'benar',
        explanation:
          'Setiap tahun saldo bertambah tetap 120.000 — ciri barisan aritmetika dengan b = 120.000.',
      },
      {
        id: 'p4',
        teks: 'Total bunga 3 tahun sama dengan 3 × 120.000.',
        correct: 'benar',
        explanation:
          'B₃ = 120.000 + 120.000 + 120.000 = 3 × 120.000 = 360.000. Menjumlahkan suku-suku yang sama = mengalikan.',
      },
      {
        id: 'p5',
        teks: 'Saldo setelah 4 tahun sama dengan 4 × 2.000.000.',
        correct: 'salah',
        explanation:
          '4 × 2.000.000 = 8.000.000 — setoran awal tidak dikalikan. Yang bertambah hanya bunganya: M₄ = 2.000.000 + 4 × 120.000 = 2.480.000.',
      },
    ],
    nextLabel: 'Olah Data: Bunga →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — OLAH DATA: TOTAL BUNGA SEBAGAI DERET ARITMETIKA
     ---------------------------------------------------------- */
  olahBunga: {
    kicker: 'Tahap 4 · Olah Data (Bunga)',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan rumus total bunga tunggal Bₙ dari deret aritmetika.',
    guru: 'Ingatkan rumus Sₙ deret aritmetika dari pertemuan sebelumnya. Tekankan bahwa deret dengan beda b = 0 tetap deret aritmetika. Minta murid menjelaskan mengapa b = 0 pada deret bunga.',
    instruksi:
      'Deret bunga Raka: 120.000 + 120.000 + 120.000 + … Isi langkah-langkah berikut untuk menemukan cara cepat menghitung total bunga.',
    langkah: [
      {
        label: 'Bunga satu tahun = 6% × Rp2.000.000 = …',
        jawab: 120000,
        hints: ['6% = 6/100 = 0,06.', '0,06 × 2.000.000 = 6 × 20.000.'],
        temuan: 'Bunga satu periode = M₀ × i = 2.000.000 × 0,06 = 120.000.',
        cek: { jenis: 'bunga', M0: 2000000, i: 0.06, n: 1 },
      },
      {
        label: 'Total bunga 4 tahun: B₄ = 120.000 + 120.000 + 120.000 + 120.000 = …',
        jawab: 480000,
        hints: [
          'Cocokkan dengan kolom total bunga di tabelmu.',
          'Empat kali 120.000 = 4 × 120.000.',
        ],
        temuan: 'B₄ = 480.000 — sama dengan 4 × 120.000.',
        cek: { jenis: 'bunga', M0: 2000000, i: 0.06, n: 4 },
      },
      {
        label:
          'Pakai rumus deret aritmetika Sₙ = n/2 × (2a + (n − 1)b) dengan a = 120.000, b = 0, n = 10. Total bunga 10 tahun B₁₀ = …',
        jawab: 1200000,
        hints: [
          'Karena b = 0, bagian (n − 1)b = 0. Jadi 2a + 0 = 240.000.',
          'S₁₀ = 10/2 × 240.000 = 5 × 240.000.',
        ],
        temuan:
          'B₁₀ = 1.200.000. Dengan b = 0, rumus Sₙ menjadi n/2 × 2a = n × a — cukup dikalikan!',
        cek: { jenis: 'bunga', M0: 2000000, i: 0.06, n: 10 },
      },
    ],
    pertanyaan: [
      {
        id: 'ab',
        tanya: 'Deret total bunga 120.000 + 120.000 + 120.000 + … adalah deret aritmetika dengan …',
        opsi: [
          { id: 'benar', label: 'a = M₀ × i dan b = 0' },
          { id: 'am0', label: 'a = M₀ dan b = M₀ × i' },
          { id: 'bsama', label: 'a = M₀ × i dan b = M₀ × i' },
          { id: 'ai', label: 'a = i dan b = 0' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Suku pertamanya bunga satu periode (M₀ × i = 120.000), dan suku berikutnya tidak berubah, jadi b = 0.',
          am0: 'Itu ciri barisan <em>saldo</em>, bukan deret <em>bunga</em>. Suku-suku deret bunga semuanya 120.000. Coba lagi.',
          bsama:
            'Jika b = M₀ × i, suku kedua menjadi 240.000. Padahal bunga tahun ke-2 tetap 120.000. Coba lagi.',
          ai: 'i = 0,06 adalah suku bunga, bukan besar bunga dalam rupiah. Suku pertama deret = 120.000. Coba lagi.',
        },
      },
      {
        id: 'rumusB',
        tanya:
          'Karena b = 0, Sₙ = n/2 × (2a + 0) = n × a. Jadi total bunga tunggal selama n periode adalah …',
        opsi: [
          { id: 'benar', label: 'Bₙ = M₀ × i × n' },
          { id: 'pangkat', label: 'Bₙ = M₀ × iⁿ' },
          { id: 'tambah', label: 'Bₙ = M₀ + n × i' },
          { id: 'satu', label: 'Bₙ = M₀ × i' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> n × a dengan a = M₀ × i memberi <strong>Bₙ = M₀ × i × n</strong>. Cek: 2.000.000 × 0,06 × 10 = 1.200.000 ✓.',
          pangkat:
            'Pangkat muncul pada barisan geometri, bukan pada deret dengan suku yang sama. Cek n = 2: 2.000.000 × 0,06² = 7.200, bukan 240.000. Coba lagi.',
          tambah:
            'M₀ + n × i mencampur rupiah dengan persen. Cek n = 2: hasilnya 2.000.000,12 — tidak masuk akal. Coba lagi.',
          satu: 'M₀ × i hanya bunga <em>satu</em> periode. Untuk n periode, bunganya dijumlahkan n kali. Coba lagi.',
        },
      },
    ],
    nextLabel: 'Olah Data: Nilai Akhir Modal →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — OLAH DATA: SALDO SEBAGAI BARISAN ARITMETIKA
     ---------------------------------------------------------- */
  olahModal: {
    kicker: 'Tahap 5 · Olah Data (Nilai Akhir Modal)',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan rumus nilai akhir modal Mₙ dari barisan aritmetika saldo.',
    guru: 'Soroti perbedaan indeks: M₀ adalah suku pertama (U₁), sehingga Mₙ = U₍ₙ₊₁₎. Minta murid menjelaskan mengapa rumusnya memakai n (bukan n − 1) seperti pada Uₙ.',
    instruksi:
      'Perhatikan barisan saldo Raka dari awal menabung (M₀) sampai akhir tahun ke-4 (M₄). Setiap busur menunjukkan pertambahan saldo per tahun.',
    tampilN: 5,
    langkah: [
      {
        label: 'Beda barisan saldo: b = M₁ − M₀ = 2.120.000 − 2.000.000 = …',
        jawab: 120000,
        hints: ['Beda barisan saldo sama dengan bunga satu periode.'],
        temuan: 'b = 120.000 = M₀ × i. Barisan saldo: a = M₀ = 2.000.000, b = M₀ × i = 120.000.',
        cek: { jenis: 'beda', M0: 2000000, i: 0.06 },
      },
      {
        label: 'Saldo akhir tahun ke-6: M₆ = M₀ + 6 × b = …',
        jawab: 2720000,
        hints: ['6 × 120.000 = 720.000.', 'M₆ = 2.000.000 + 720.000.'],
        temuan: 'M₆ = 2.720.000. Dari M₀ ke M₆ ada 6 kali pertambahan b.',
        cek: { jenis: 'akhir', M0: 2000000, i: 0.06, n: 6 },
      },
    ],
    pertanyaan: [
      {
        id: 'suku',
        tanya: 'Pada barisan M₀, M₁, M₂, …, saldo M₆ adalah suku ke berapa?',
        opsi: [
          { id: 'u7', label: 'U₇ (suku ke-7)' },
          { id: 'u6', label: 'U₆ (suku ke-6)' },
          { id: 'u5', label: 'U₅ (suku ke-5)' },
          { id: 'u12', label: 'U₁₂ (suku ke-12)' },
        ],
        correct: 'u7',
        umpan: {
          u7: '<strong>Tepat.</strong> Karena M₀ = U₁, maka M₆ = U₇ dan secara umum Mₙ = U₍ₙ₊₁₎ = a + (n + 1 − 1)b = a + n × b.',
          u6: 'Hitung sukunya: M₀ = U₁, M₁ = U₂, … Sukunya selalu satu lebih besar dari indeks M. Coba lagi.',
          u5: 'Terlalu kecil. Ingat barisan dimulai dari M₀, dan M₀ adalah suku pertama. Coba lagi.',
          u12: 'Suku ke-12 terlalu jauh — itu seolah indeksnya dikali dua. Daftarkan M₀, M₁, … lalu hitung urutannya. Coba lagi.',
        },
      },
      {
        id: 'rumusM',
        tanya: 'Dengan a = M₀ dan b = M₀ × i, nilai akhir modal setelah n periode adalah …',
        opsi: [
          { id: 'benar', label: 'Mₙ = M₀ + n × M₀ × i = M₀(1 + n × i)' },
          { id: 'majemuk', label: 'Mₙ = M₀(1 + i)ⁿ' },
          { id: 'kurang', label: 'Mₙ = M₀ + (n − 1) × M₀ × i' },
          { id: 'bunga', label: 'Mₙ = n × M₀ × i' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Mₙ = a + n × b = M₀ + n × M₀ × i = <strong>M₀(1 + n × i)</strong>, atau singkatnya <strong>Mₙ = M₀ + Bₙ</strong>.',
          majemuk:
            'Itu rumus bunga <em>majemuk</em> (barisan geometri). Cek n = 2: 2.000.000 × 1,06² = 2.247.200, bukan 2.240.000 seperti di tabel. Coba lagi.',
          kurang:
            'Bentuk (n − 1) dipakai untuk Uₙ bila suku pertama U₁. Di sini M₀ sudah suku pertama, jadi Mₙ = U₍ₙ₊₁₎. Cek n = 1: hasilnya 2.000.000, padahal M₁ = 2.120.000. Coba lagi.',
          bunga: 'n × M₀ × i hanya total bunganya. Setoran awal M₀ belum ditambahkan. Coba lagi.',
        },
      },
    ],
    nextLabel: 'Buktikan Rumusnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN (VERIFIKASI)
     A: uji pada tabel. B: buktikan dugaan tahun ke-10.
     C: periode bulanan.
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji rumus Bₙ dan Mₙ pada data, membuktikan dugaan awal, dan memeriksa periode bulanan.',
    guru: 'Minta satu murid menghitung saldo tahun demi tahun sementara yang lain memakai rumus, lalu bandingkan hasil dan waktunya. Pada grup C, tekankan bahwa i dan n harus memakai satuan waktu yang sama.',
    judulA: 'A. Uji pada buku tabungan (tahun 1–4)',
    judulB: 'B. Buktikan dugaan awalmu: saldo tahun ke-10',
    judulC: 'C. Bagaimana jika periodenya bulan?',
    uji: [
      {
        grup: 'A',
        label: 'M₄ = 2.000.000 × (1 + 4 × 0,06) = …',
        jawab: 2480000,
        hints: ['1 + 4 × 0,06 = 1 + 0,24 = 1,24.', '2.000.000 × 1,24.'],
        bukti: 'M₄ = 2.480.000 — sama dengan saldo tahun ke-4 di tabelmu. ✓',
        cek: { jenis: 'akhir', M0: 2000000, i: 0.06, n: 4 },
      },
      {
        grup: 'A',
        label: 'Kapan Raka bisa membeli laptop Rp2.600.000? Hitung dulu M₅ = …',
        jawab: 2600000,
        hints: ['M₅ = 2.000.000 × (1 + 5 × 0,06) = 2.000.000 × 1,3.'],
        bukti: 'M₅ = 2.600.000 — tepat harga laptop. Raka bisa membelinya pada akhir tahun ke-5.',
        cek: { jenis: 'akhir', M0: 2000000, i: 0.06, n: 5 },
      },
      {
        grup: 'B',
        label: 'Total bunga 10 tahun: B₁₀ = M₀ × i × 10 = …',
        jawab: 1200000,
        hints: ['2.000.000 × 0,06 = 120.000.', '120.000 × 10.'],
        bukti: 'B₁₀ = 1.200.000 — sama dengan hasil rumus Sₙ pada tahap Olah Bunga.',
        cek: { jenis: 'bunga', M0: 2000000, i: 0.06, n: 10 },
      },
      {
        grup: 'B',
        label: 'Saldo akhir tahun ke-10: M₁₀ = M₀ + B₁₀ = …',
        jawab: 3200000,
        hints: ['2.000.000 + 1.200.000.'],
        bukti: 'M₁₀ = 3.200.000 — dihitung dalam dua langkah, bukan sepuluh!',
        cek: { jenis: 'akhir', M0: 2000000, i: 0.06, n: 10 },
      },
      {
        grup: 'C',
        label: 'Koperasi juga menulis bunganya per bulan. 6% per tahun = … % per bulan',
        jawab: 0.5,
        rational: true,
        hints: ['Satu tahun = 12 bulan.', '6 : 12 = …  (tulis desimal dengan koma, mis. 0,5)'],
        bukti: '6% per tahun = 0,5% per bulan, jadi i = 0,005 bila n dihitung dalam bulan.',
        cek: { jenis: 'persenBulan', persenTahun: 6 },
      },
      {
        grup: 'C',
        label:
          'Jika Raka menarik tabungannya setelah 8 bulan, total bunganya = 2.000.000 × 0,5% × 8 = …',
        jawab: 80000,
        hints: ['0,5% × 2.000.000 = 10.000 per bulan.', '10.000 × 8.'],
        bukti:
          'B₈ = 80.000. Rumusnya sama; yang penting i dan n memakai satuan waktu yang sama (per bulan dengan bulan).',
        cek: { jenis: 'bunga', M0: 2000000, i: 0.005, n: 8 },
      },
    ],
    dugaanBenar: 's3200',
    nextLabel: 'Tarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN (GENERALISASI)
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Menyusun kesimpulan umum tentang bunga tunggal dan kaitannya dengan barisan & deret aritmetika.',
    guru: 'Setelah kalimat lengkap, minta beberapa murid membacakan kesimpulannya, lalu minta mereka menjelaskan perbedaan bunga tunggal dan bunga majemuk dengan kata-kata sendiri.',
    instruksi:
      'Lengkapi setiap awal kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan dipakai paling banyak satu kali, dan ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      {
        id: 'k1',
        awal: 'Pada bunga tunggal, bunga setiap periode selalu sama karena',
        correct: 'b1',
      },
      { id: 'k2', awal: 'Total bunga selama n periode adalah', correct: 'b2' },
      { id: 'k3', awal: 'Nilai akhir modal setelah n periode adalah', correct: 'b3' },
      {
        id: 'k4',
        awal: 'Barisan saldo M₀, M₁, M₂, … adalah barisan aritmetika dengan',
        correct: 'b4',
      },
      { id: 'k5', awal: 'Suku bunga i dan banyak periode n harus', correct: 'b5' },
    ],
    bank: [
      { id: 'b1', teks: 'bunga dihitung dari modal awal M₀, yaitu M₀ × i.' },
      { id: 'b2', teks: 'Bₙ = M₀ × i × n (deret aritmetika dengan b = 0).' },
      { id: 'b3', teks: 'Mₙ = M₀ + Bₙ = M₀(1 + n × i).' },
      { id: 'b4', teks: 'suku pertama M₀ dan beda M₀ × i.' },
      {
        id: 'b5',
        teks: 'memakai satuan waktu yang sama (per tahun dengan tahun, per bulan dengan bulan).',
      },
      { id: 'x1', teks: 'bunga dihitung dari saldo periode sebelumnya.' },
      { id: 'x2', teks: 'Mₙ = M₀(1 + i)ⁿ.' },
      { id: 'x3', teks: 'suku pertama M₀ × i dan rasio (1 + i).' },
    ],
    rangkuman: [
      'Bunga satu periode = M₀ × i, sama untuk setiap periode.',
      'Total bunga: Bₙ = M₀ × i × n — jumlah n suku deret aritmetika dengan a = M₀ × i dan b = 0.',
      'Nilai akhir modal: Mₙ = M₀ + Bₙ = M₀(1 + n × i) — suku ke-(n + 1) barisan aritmetika dengan a = M₀ dan b = M₀ × i.',
      'Samakan satuan waktu: suku bunga per tahun dipakai dengan n dalam tahun; per bulan dengan n dalam bulan (i per bulan = i per tahun : 12).',
    ],
    nextLabel: 'Terapkan Rumusnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Campuran isian ('input') dan pilihan ganda ('choice').
     Metadata `bunga` dipakai tes untuk memeriksa kunci jawaban:
       cari  'bunga' | 'akhir' | 'n' | 'i' | 'M0'
       dari  'bunga' | 'akhir' — besaran yang diketahui (target)
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menentukan bunga, nilai akhir modal, lama periode, suku bunga, atau modal awal pada masalah bunga tunggal.',
    guru: 'Dorong murid menulis dulu M₀, i, n, Bₙ, atau Mₙ yang diketahui, dan memeriksa kesamaan satuan waktu i dan n. Diskusikan soal yang paling banyak salah di akhir sesi.',
    instruksi:
      'Selesaikan setiap masalah. Tuliskan dulu apa yang diketahui (M₀, i, n, Bₙ, atau Mₙ), samakan satuan waktunya, lalu pilih rumus yang cocok. Jawaban rupiah boleh ditulis dengan titik ribuan.',
    soal: [
      {
        type: 'input',
        cerita:
          'Dina meminjam Rp3.000.000 di koperasi untuk membeli laptop. Koperasi menetapkan bunga tunggal 1% per bulan, dan pinjaman dilunasi dalam 10 bulan.',
        pertanyaan: 'Berapa rupiah <strong>total bunga</strong> yang harus Dina bayar?',
        jawab: 300000,
        bunga: { cari: 'bunga', M0: 3000000, i: 0.01, n: 10 },
        hints: [
          'Diketahui M₀ = 3.000.000, i = 1% = 0,01 per bulan, n = 10 bulan.',
          'B₁₀ = 3.000.000 × 0,01 × 10.',
        ],
        reveal: 'B₁₀ = 3.000.000 × 0,01 × 10 = 30.000 × 10 = <strong>Rp300.000</strong>.',
      },
      {
        type: 'input',
        cerita:
          'Sebuah startup menyimpan dana cadangan sewa server Rp5.000.000 dalam deposito berbunga tunggal 4% per tahun.',
        pertanyaan: 'Berapa rupiah <strong>nilai akhir</strong> deposito itu setelah 3 tahun?',
        jawab: 5600000,
        bunga: { cari: 'akhir', M0: 5000000, i: 0.04, n: 3 },
        hints: [
          'Mₙ = M₀(1 + n × i) dengan M₀ = 5.000.000, i = 0,04, n = 3.',
          '1 + 3 × 0,04 = 1,12. M₃ = 5.000.000 × 1,12.',
        ],
        reveal:
          'M₃ = 5.000.000 × (1 + 3 × 0,04) = 5.000.000 × 1,12 = <strong>Rp5.600.000</strong>.',
      },
      {
        type: 'choice',
        cerita:
          'Sari menabung Rp1.500.000 hasil menjual template desain di koperasi dengan bunga tunggal 1,5% per bulan.',
        pertanyaan: 'Berapa saldo tabungan Sari setelah 6 bulan?',
        options: [
          { id: 'a', label: 'Rp1.635.000', nilai: 1635000 },
          { id: 'b', label: 'Rp1.640.165', nilai: 1640165 },
          { id: 'c', label: 'Rp135.000', nilai: 135000 },
          { id: 'd', label: 'Rp1.522.500', nilai: 1522500 },
        ],
        correct: 'a',
        bunga: { cari: 'akhir', M0: 1500000, i: 0.015, n: 6 },
        hints: ['Bunga sebulan = 1,5% × 1.500.000 = 22.500. Total bunga 6 bulan = 6 × 22.500.'],
        explanation:
          'B₆ = 6 × 22.500 = 135.000, sehingga M₆ = 1.500.000 + 135.000 = Rp1.635.000. (Rp1.640.165 adalah hasil bunga majemuk, Rp135.000 hanya bunganya, dan Rp1.522.500 saldo satu bulan.)',
      },
      {
        type: 'input',
        cerita:
          'Bima menabung Rp2.400.000 dengan bunga tunggal 0,5% per bulan. Saat diambil, total bunga yang ia terima Rp144.000.',
        pertanyaan: 'Berapa <strong>bulan</strong> Bima menabung?',
        jawab: 12,
        bunga: { cari: 'n', dari: 'bunga', M0: 2400000, i: 0.005, target: 144000 },
        hints: [
          'Bunga sebulan = 0,5% × 2.400.000 = 12.000.',
          'Bₙ = 12.000 × n = 144.000 → n = 144.000 : 12.000.',
        ],
        reveal: 'Bunga sebulan 12.000, jadi n = 144.000 : 12.000 = <strong>12 bulan</strong>.',
      },
      {
        type: 'input',
        cerita:
          'Modal Rp4.000.000 disimpan dengan bunga tunggal selama 3 tahun dan nilai akhirnya menjadi Rp4.840.000.',
        pertanyaan: 'Berapa <strong>persen</strong> suku bunganya per tahun? (tulis angkanya saja)',
        jawab: 7,
        bunga: { cari: 'i', dari: 'akhir', M0: 4000000, n: 3, target: 4840000 },
        hints: [
          'Total bunga B₃ = 4.840.000 − 4.000.000 = 840.000. Bunga setahun = 840.000 : 3.',
          'Bunga setahun 280.000. i = 280.000 : 4.000.000 = … lalu ubah ke persen.',
        ],
        reveal:
          'B₃ = 840.000, bunga setahun = 280.000, i = 280.000 : 4.000.000 = 0,07 = <strong>7%</strong> per tahun.',
      },
      {
        type: 'input',
        cerita:
          'Sebuah tabungan berbunga tunggal 5% per tahun menghasilkan total bunga Rp150.000 setelah 2 tahun.',
        pertanyaan: 'Berapa rupiah <strong>modal awal</strong> tabungan itu?',
        jawab: 1500000,
        bunga: { cari: 'M0', dari: 'bunga', i: 0.05, n: 2, target: 150000 },
        hints: ['B₂ = M₀ × 0,05 × 2 = M₀ × 0,1.', 'M₀ × 0,1 = 150.000 → M₀ = 150.000 : 0,1.'],
        reveal: 'M₀ × 0,05 × 2 = 150.000 → M₀ × 0,1 = 150.000 → M₀ = <strong>Rp1.500.000</strong>.',
      },
      {
        type: 'choice',
        cerita:
          'Aplikasi koperasi menampilkan saldo tabungan berbunga tunggal milik Tono per bulan: Rp800.000, Rp824.000, Rp848.000, …',
        pertanyaan: 'Berapa suku bunga tunggal tabungan Tono per bulan?',
        options: [
          { id: 'a', label: '3%', nilai: 3 },
          { id: 'b', label: '24%', nilai: 24 },
          { id: 'c', label: '2,4%', nilai: 2.4 },
          { id: 'd', label: '0,3%', nilai: 0.3 },
        ],
        correct: 'a',
        bunga: { cari: 'i', saldo: [800000, 824000, 848000] },
        hints: ['Beda barisan saldo = bunga sebulan = 824.000 − 800.000.', 'i = beda : M₀.'],
        explanation:
          'Beda barisan b = 24.000 = M₀ × i, sehingga i = 24.000 : 800.000 = 0,03 = 3% per bulan.',
      },
      {
        type: 'input',
        cerita:
          'Rina menabung Rp1.200.000 dengan bunga tunggal 10% per tahun untuk membeli monitor seharga Rp1.800.000.',
        pertanyaan:
          'Setelah berapa <strong>tahun</strong> saldonya tepat cukup untuk membeli monitor?',
        jawab: 5,
        bunga: { cari: 'n', dari: 'akhir', M0: 1200000, i: 0.1, target: 1800000 },
        hints: [
          'Total bunga yang dibutuhkan = 1.800.000 − 1.200.000 = 600.000.',
          'Bunga setahun = 10% × 1.200.000 = 120.000. n = 600.000 : 120.000.',
        ],
        reveal:
          'Butuh bunga 600.000, bunga setahun 120.000, jadi n = 600.000 : 120.000 = <strong>5 tahun</strong>.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses menemukan rumus bunga tunggal dari barisan & deret aritmetika.',
    guru: 'Baca jawaban refleksi secara acak dan gunakan untuk menentukan murid yang perlu pendampingan tambahan sebelum masuk ke bunga majemuk.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri mengapa saldo tabungan berbunga tunggal membentuk barisan aritmetika.',
        placeholder: 'Karena bunganya setiap periode …',
      },
      {
        id: 'r2',
        teks: 'Mengapa suku bunga dan banyak periode harus memakai satuan waktu yang sama? Beri contoh.',
        placeholder: 'Jika bunganya per bulan, maka …',
      },
      {
        id: 'r3',
        teks: 'Di mana kamu bisa memakai rumus bunga tunggal dalam dunia RPL atau kehidupan sehari-hari?',
        placeholder: 'Misalnya membuat fitur simulasi tabungan di aplikasi …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu dapat menentukan bunga dan nilai akhir modal bunga tunggal sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '🙂 Yakin — aku bisa memakai rumusnya' },
      { id: 'ragu', label: '🤔 Masih ragu, terutama soal mencari n, i, atau M₀' },
      { id: 'bantuan', label: '🙋 Aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, kamu menemukan rumus bunga tunggal sendiri!',
    teks: 'Kamu tidak sekadar menghafal rumus — kamu melihat sendiri bahwa bunga tunggal adalah deret aritmetika dan saldonya barisan aritmetika.',
    capaian: [
      'Mengumpulkan data bunga, total bunga, dan saldo dari buku tabungan.',
      'Menemukan Bₙ = M₀ × i × n dari deret aritmetika dengan beda 0.',
      'Menemukan Mₙ = M₀(1 + n × i) dari barisan aritmetika saldo.',
      'Menguji rumus pada data, membuktikan dugaan awal, dan menyesuaikan periode bulanan.',
      'Menentukan bunga, nilai akhir, lama periode, suku bunga, dan modal awal pada masalah kontekstual.',
    ],
  },
};
