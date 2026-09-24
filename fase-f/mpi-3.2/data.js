'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Bunga Majemuk dengan Barisan & Deret Geometri
   Fase F — SMK Rekayasa Perangkat Lunak

   Tujuan Pembelajaran:
   Menerapkan konsep barisan dan deret geometri untuk menentukan
   nilai akhir modal pada masalah bunga majemuk.

   Model pembelajaran: INQUIRY LEARNING (Inkuiri Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Orientasi .................. tahap 'orientasi'
     Sintaks 2 — Merumuskan masalah ......... tahap 'masalah'
     Sintaks 3 — Merumuskan hipotesis ....... tahap 'hipotesis'
     Sintaks 4 — Mengumpulkan data .......... tahap 'dataSaldo' & 'dataPola'
     Sintaks 5 — Menguji hipotesis .......... tahap 'uji'
     Sintaks 4–5 (siklus inkuiri kedua) ..... tahap 'periode'
     Sintaks 6 — Merumuskan kesimpulan ...... tahap 'simpulan'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 45 menit, murid berpasangan,
   kalkulator boleh dipakai mulai tahap 5):
     1. Orientasi  (8')  — "Dua Tawaran untuk Nadia": hadiah lomba aplikasi
                           Rp10.000.000; Koperasi A bunga tunggal 10%/th
                           vs Bank B bunga majemuk 10%/th. Buku tabungan
                           tahun 0–2 tampak (tahun 1 sama, tahun 2 beda
                           Rp100.000). Murid MENDUGA saldo Bank B tahun
                           ke-5 dan tawaran yang lebih untung + alasan
                           (tidak dinilai).
     2. Masalah    (5')  — memilih rumusan masalah penyelidikan.
     3. Hipotesis  (5')  — memilih dugaan pola saldo Bank B lalu menulis
                           hipotesis dengan kalimat sendiri.
     4. Data saldo (17') — mengisi buku tabungan Bank B tahun 1–4
                           (bunga dari saldo sebelumnya); bereksplorasi
                           dengan simulator bunga majemuk (ubah M₀, i, n)
                           dan mengamati rasio Mₙ : Mₙ₋₁; memilah
                           pernyataan benar/salah.
     5. Olah pola  (12') — menemukan r = 1 + i, Mₙ = U₍ₙ₊₁₎ = M₀(1 + i)ⁿ,
                           dan total bunga Mₙ − M₀ (deret geometri).
     6. Uji        (12') — menguji rumus pada tabel, membuktikan dugaan
                           tahun ke-5, membandingkan dengan bunga tunggal
                           (grafik 10 tahun), memilah hasil uji hipotesis.
     7. Periode    (8')  — siklus inkuiri kedua: pemajemukan per semester
                           (i = p : m, n = t × m).
     8. Simpulan   (5')  — menyusun kesimpulan dari bank kalimat acak.
     9. Uji terap  (13') — sembilan masalah kontekstual: nilai akhir,
                           total bunga, M₀, n, i, selisih dengan bunga
                           tunggal, pemajemukan semesteran/triwulanan.
    10. Refleksi   (5')  — rekap, refleksi tertulis & penilaian diri.

   Notasi: M₀ modal awal, i suku bunga per periode (desimal),
   n banyak periode, Mₙ nilai akhir modal, Bₙ total bunga n periode.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan, sehingga tiap murid
   (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var IL = 'Inquiry Learning';

var DATA = {
  /* Kasus yang dipakai sepanjang modul. */
  kasus: {
    nama: 'Nadia',
    M0: 10000000,
    persenTahun: 10,
  },

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Uji Hipotesis.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    syntax: IL + ' · Sintaks 1',
    goal: 'Mengamati dua tawaran tabungan dan menduga saldo bunga majemuk pada tahun yang jauh.',
    guru: 'Tayangkan kedua buku tabungan. Tanyakan: "Tahun pertama saldonya sama, mengapa tahun kedua berbeda Rp100.000?" Minta murid menduga saldo Bank B tahun ke-5 <em>tanpa kalkulator</em>. Tampung semua dugaan dan alasannya tanpa dikoreksi — kelas akan mengujinya sendiri.',
    judul: 'Dua Tawaran untuk Nadia',
    cerita:
      'Nadia, siswa RPL, memenangi lomba aplikasi dan mendapat hadiah Rp10.000.000. Ia ingin menabungnya selama 5 tahun untuk modal usaha jasa pembuatan aplikasi. Ada dua tawaran dengan suku bunga yang sama, 10% per tahun.',
    tawaran: [
      {
        id: 'A',
        nama: 'Koperasi A',
        aturan: 'Bunga tunggal 10% per tahun — selalu dihitung dari setoran awal.',
      },
      {
        id: 'B',
        nama: 'Bank B',
        aturan: 'Bunga majemuk 10% per tahun — dihitung dari saldo tahun sebelumnya.',
      },
    ],
    tampilTahun: 2,
    tahunDitanya: 5,
    pertanyaan: 'Dugaanmu: berapa saldo Nadia di Bank B pada akhir tahun ke-5?',
    opsi: [
      { id: 'm161', label: 'Rp16.105.100', nilai: 16105100 },
      { id: 'm150', label: 'Rp15.000.000', nilai: 15000000 },
      { id: 'm200', label: 'Rp20.000.000', nilai: 20000000 },
      { id: 'm146', label: 'Rp14.641.000', nilai: 14641000 },
    ],
    pertanyaanUntung: 'Menurutmu, tawaran mana yang lebih menguntungkan Nadia setelah 5 tahun?',
    opsiUntung: [
      { id: 'a', label: 'Koperasi A (bunga tunggal)' },
      { id: 'b', label: 'Bank B (bunga majemuk)' },
      { id: 'sama', label: 'Sama saja, karena suku bunganya sama-sama 10%' },
    ],
    alasanLabel: 'Bagaimana kamu mendapatkan dugaan itu?',
    alasanPlaceholder: 'Contoh: di Bank B bunganya makin besar karena …',
    catatan:
      'Belum ada jawaban benar atau salah di sini. Simpan dugaanmu — kamu akan menyelidiki dan mengujinya sendiri.',
    nextLabel: 'Simpan Dugaan & Lanjut →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MERUMUSKAN MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: IL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan penyelidikan tentang pertumbuhan saldo bunga majemuk.',
    guru: 'Bandingkan dugaan kelas yang berbeda-beda. Arahkan murid pada pertanyaan: mengapa saldo Bank B tumbuh makin cepat, dan adakah rumus untuk langsung menghitung saldo setelah n tahun? Tulis rumusan masalah yang disepakati di papan.',
    pengantar:
      'Dugaan teman-temanmu berbeda-beda. Menghitung saldo tahun demi tahun memang bisa, tetapi bagaimana jika Nadia menabung 20 tahun, atau aplikasi bank harus menampilkan saldo untuk tahun berapa pun?',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'pola',
        label:
          'Bagaimana pola saldo pada bunga majemuk, dan adakah rumus untuk langsung menghitung nilai akhir modal setelah n periode?',
      },
      { id: 'kali', label: 'Berapa 10% dari Rp10.000.000?' },
      { id: 'dekat', label: 'Bank mana yang kantornya paling dekat dengan rumah Nadia?' },
      { id: 'tahun1', label: 'Berapa saldo Nadia di Bank B pada akhir tahun pertama saja?' },
    ],
    correct: 'pola',
    umpan: {
      pola: '<strong>Tepat.</strong> Rumusan ini bisa diselidiki dengan data: kita akan mengumpulkan saldo, mencari polanya, lalu menguji rumus nilai akhir modal.',
      kali: '10% dari Rp10.000.000 = Rp1.000.000 hanya bunga tahun pertama. Kita butuh cara untuk tahun berapa pun. Coba pilih lagi.',
      dekat:
        'Penting dalam kehidupan nyata, tetapi tidak bisa dijawab dengan matematika bunga. Coba pilih lagi.',
      tahun1:
        'Saldo tahun pertama sudah terlihat di buku tabungan (Rp11.000.000). Yang ingin kita ketahui adalah saldo setelah <em>banyak</em> tahun. Coba pilih lagi.',
    },
    nextLabel: 'Ajukan Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MERUMUSKAN HIPOTESIS (tidak dinilai)
     ---------------------------------------------------------- */
  hipotesis: {
    kicker: 'Tahap 3 · Merumuskan Hipotesis',
    syntax: IL + ' · Sintaks 3',
    goal: 'Mengajukan dugaan sementara tentang pola saldo bunga majemuk.',
    guru: 'Biarkan murid memilih dugaan yang berbeda — justru itu yang akan diuji. Minta 2–3 pasangan membacakan hipotesisnya dan alasan singkatnya. Jangan membenarkan atau menyalahkan dulu.',
    pengantar:
      'Ingat kembali: barisan aritmetika bertambah dengan beda tetap, barisan geometri dikali dengan rasio tetap. Perhatikan saldo Bank B: 10.000.000 → 11.000.000 → 12.100.000 → …',
    pertanyaan: 'Menurut dugaanmu, saldo Nadia di Bank B membentuk pola apa?',
    opsi: [
      {
        id: 'geometri',
        label: 'Barisan geometri — setiap tahun saldonya dikali bilangan yang sama.',
      },
      {
        id: 'aritmetika',
        label: 'Barisan aritmetika — setiap tahun saldonya bertambah jumlah yang sama.',
      },
      { id: 'tidak', label: 'Tidak berpola tetap — kenaikannya berubah-ubah.' },
    ],
    hipotesisLabel:
      'Tulis hipotesismu: bagaimana cara menghitung saldo Bank B setelah n tahun tanpa menghitung tahun demi tahun?',
    hipotesisPlaceholder: 'Contoh: mungkin saldo awal dikali … sebanyak n kali …',
    catatan:
      'Hipotesis adalah dugaan sementara yang akan kamu uji dengan data. Tidak apa-apa jika nanti ternyata keliru.',
    nextLabel: 'Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MENGUMPULKAN DATA (SALDO)
     A: isi buku tabungan Bank B tahun 1–4.
     B: eksplorasi simulator bunga majemuk.
     C: pilah pernyataan benar/salah.
     ---------------------------------------------------------- */
  dataSaldo: {
    kicker: 'Tahap 4 · Mengumpulkan Data',
    syntax: IL + ' · Sintaks 4',
    goal: 'Mengumpulkan data bunga dan saldo bunga majemuk, lalu mengamati polanya dengan simulator.',
    guru: 'Pastikan murid menghitung 10% dari saldo <em>tahun sebelumnya</em>, bukan dari Rp10.000.000. Ajukan pertanyaan pelacak: "Bunga tahun ke-3 dihitung dari uang yang mana?" Saat simulator, minta tiap pasangan mencoba minimal tiga pengaturan dan mencatat rasio saldo berurutan.',
    instruksiA:
      'Lengkapi buku tabungan Nadia di Bank B untuk 4 tahun pertama. Aturannya: bunga 10% dihitung dari saldo akhir tahun sebelumnya. Kamu boleh menulis titik ribuan, mis. 1.100.000.',
    tabelN: 4,
    kolom: {
      bunga: 'Bunga tahun ke-n (Rp)',
      saldo: 'Saldo akhir Mₙ (Rp)',
    },
    hintsTabel: [
      'Bunga tahun ke-1 = 10% × 10.000.000 = 1.000.000, sehingga M₁ = 11.000.000.',
      'Bunga tahun ke-2 = 10% × M₁ = 10% × 11.000.000. Saldo M₂ = M₁ + bunga tahun ke-2.',
      'Tahun ke-3: bunga = 10% × 12.100.000 = 1.210.000, saldo = 13.310.000.',
    ],
    judulSim: 'Simulator Bunga Majemuk',
    instruksiSim:
      'Ubah modal awal, suku bunga, dan banyak periode dengan tombol − dan +. Amati kolom Mₙ : Mₙ₋₁ dan bandingkan dengan kolom bunga tunggal. Coba minimal 3 pengaturan berbeda.',
    sim: {
      modal: [1000000, 5000000, 10000000, 25000000],
      persen: [2, 5, 8, 10, 12],
      maxN: 8,
      periode: 'Tahun',
      bandingTunggal: true,
    },
    minUbah: 3,
    instruksiB: 'Amati tabel dan simulatormu. Pilah setiap pernyataan berikut: benar atau salah?',
    opsiPilah: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: 'Bunga tahun ke-2 di Bank B = 10% × Rp11.000.000 = Rp1.100.000.',
        correct: 'benar',
        explanation:
          'Pada bunga majemuk, bunga dihitung dari saldo tahun sebelumnya (M₁ = 11.000.000), jadi bunganya 1.100.000.',
      },
      {
        id: 'p2',
        teks: 'Bunga yang diterima Nadia di Bank B selalu Rp1.000.000 setiap tahun.',
        correct: 'salah',
        explanation:
          'Itu ciri <em>bunga tunggal</em>. Di Bank B bunganya 1.000.000, 1.100.000, 1.210.000, … — makin besar karena bunga ikut berbunga.',
      },
      {
        id: 'p3',
        teks: 'Setiap tahun saldo di Bank B dikali 1,1.',
        correct: 'benar',
        explanation:
          'Saldo baru = saldo lama + 10% × saldo lama = saldo lama × (1 + 0,1) = saldo lama × 1,1.',
      },
      {
        id: 'p4',
        teks: 'Saldo Bank B adalah barisan aritmetika dengan beda Rp1.000.000.',
        correct: 'salah',
        explanation:
          'Selisih saldonya 1.000.000, 1.100.000, 1.210.000, … — tidak tetap, jadi bukan barisan aritmetika.',
      },
      {
        id: 'p5',
        teks: 'Di simulator, rasio Mₙ : Mₙ₋₁ selalu sama dengan 1 + i, berapa pun modal awalnya.',
        correct: 'benar',
        explanation:
          'Modal awal berapa pun, saldo selalu dikali (1 + i) setiap periode. Misalnya i = 8% → rasio 1,08.',
      },
    ],
    nextLabel: 'Olah Data: Cari Polanya →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGUMPULKAN & MENGOLAH DATA (POLA GEOMETRI)
     ---------------------------------------------------------- */
  dataPola: {
    kicker: 'Tahap 5 · Mengolah Data',
    syntax: IL + ' · Sintaks 4',
    goal: 'Menemukan rumus nilai akhir modal bunga majemuk dari barisan geometri saldo.',
    guru: 'Ingatkan rumus Uₙ = a·rⁿ⁻¹ dari pertemuan barisan geometri. Soroti perbedaan indeks: M₀ adalah suku pertama (U₁), sehingga Mₙ = U₍ₙ₊₁₎ dan pangkatnya n, bukan n − 1. Kalkulator boleh dipakai mulai tahap ini.',
    instruksi:
      'Perhatikan barisan saldo Nadia di Bank B dari awal menabung (M₀) sampai akhir tahun ke-4 (M₄). Setiap busur menunjukkan pengali dari satu tahun ke tahun berikutnya.',
    tampilN: 5,
    langkah: [
      {
        label: 'Rasio barisan saldo: r = M₁ : M₀ = 11.000.000 : 10.000.000 = …',
        jawab: 1.1,
        rational: true,
        hints: ['Tulis desimal dengan koma, mis. 1,5.', '11 : 10 = …'],
        temuan: 'r = 1,1 = 1 + 0,1 = 1 + i. Setiap tahun saldo dikali (1 + i).',
        cek: { jenis: 'rasio', i: 0.1 },
      },
      {
        label: 'Tanpa tabel: M₃ = M₀ × r × r × r = 10.000.000 × 1,1³ = …',
        jawab: 13310000,
        hints: ['1,1³ = 1,1 × 1,1 × 1,1 = 1,331.', '10.000.000 × 1,331.'],
        temuan:
          'M₃ = 13.310.000 — sama dengan tabelmu! Dari M₀ ke M₃ saldo dikali r sebanyak 3 kali.',
        cek: { jenis: 'akhir', M0: 10000000, i: 0.1, n: 3 },
      },
      {
        label: 'Bunga tahun ke-5 dihitung dari M₄: 10% × 14.641.000 = …',
        jawab: 1464100,
        hints: ['10% × 14.641.000 = 14.641.000 : 10.'],
        temuan:
          'Bunga tiap tahun 1.000.000; 1.100.000; 1.210.000; 1.331.000; 1.464.100 — juga barisan geometri dengan r = 1,1.',
        cek: { jenis: 'bungaKe', M0: 10000000, i: 0.1, n: 5 },
      },
    ],
    pertanyaan: [
      {
        id: 'suku',
        tanya: 'Pada barisan M₀, M₁, M₂, …, saldo M₄ adalah suku ke berapa?',
        opsi: [
          { id: 'u5', label: 'U₅ (suku ke-5)' },
          { id: 'u4', label: 'U₄ (suku ke-4)' },
          { id: 'u3', label: 'U₃ (suku ke-3)' },
          { id: 'u8', label: 'U₈ (suku ke-8)' },
        ],
        correct: 'u5',
        umpan: {
          u5: '<strong>Tepat.</strong> Karena M₀ = U₁, maka M₄ = U₅ dan secara umum Mₙ = U₍ₙ₊₁₎.',
          u4: 'Hitung sukunya: M₀ = U₁, M₁ = U₂, … Sukunya selalu satu lebih besar dari indeks M. Coba lagi.',
          u3: 'Terlalu kecil. Barisan dimulai dari M₀, dan M₀ adalah suku pertama. Coba lagi.',
          u8: 'Terlalu jauh — seolah indeksnya dikali dua. Daftarkan M₀, M₁, … lalu hitung urutannya. Coba lagi.',
        },
      },
      {
        id: 'rasio',
        tanya: 'Rasio barisan saldo bunga majemuk dengan suku bunga i per periode adalah …',
        opsi: [
          { id: 'satuI', label: 'r = 1 + i' },
          { id: 'i', label: 'r = i' },
          { id: 'm0i', label: 'r = M₀ × i' },
          { id: 'ni', label: 'r = 1 + n × i' },
        ],
        correct: 'satuI',
        umpan: {
          satuI:
            '<strong>Tepat.</strong> Saldo lama + i × saldo lama = saldo lama × (1 + i). Untuk i = 10%, r = 1,1.',
          i: 'Jika r = 0,1, saldo justru mengecil menjadi sepersepuluhnya. Coba lagi.',
          m0i: 'M₀ × i = 1.000.000 adalah bunga tahun pertama (rupiah), bukan pengali. Coba lagi.',
          ni: '1 + n × i berubah setiap tahun, padahal rasio barisan geometri tetap. Coba lagi.',
        },
      },
      {
        id: 'rumusM',
        tanya: 'Dengan a = M₀ dan r = 1 + i, nilai akhir modal Mₙ = U₍ₙ₊₁₎ = a × r⁽ⁿ⁺¹⁾⁻¹ = …',
        opsi: [
          { id: 'benar', label: 'Mₙ = M₀(1 + i)ⁿ' },
          { id: 'kurang', label: 'Mₙ = M₀(1 + i)ⁿ⁻¹' },
          { id: 'tunggal', label: 'Mₙ = M₀(1 + n × i)' },
          { id: 'pangkatI', label: 'Mₙ = M₀ × iⁿ' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> (n + 1) − 1 = n, sehingga <strong>Mₙ = M₀(1 + i)ⁿ</strong>. Cek n = 2: 10.000.000 × 1,1² = 12.100.000 ✓.',
          kurang:
            'Pangkat n − 1 dipakai untuk Uₙ. Di sini M₀ = U₁, jadi Mₙ = U₍ₙ₊₁₎. Cek n = 1: hasilnya 10.000.000, padahal M₁ = 11.000.000. Coba lagi.',
          tunggal:
            'Itu rumus bunga <em>tunggal</em> (barisan aritmetika). Cek n = 2: 10.000.000 × 1,2 = 12.000.000, bukan 12.100.000. Coba lagi.',
          pangkatI:
            'iⁿ = 0,1ⁿ makin kecil, padahal saldo makin besar. Yang dipangkatkan adalah (1 + i). Coba lagi.',
        },
      },
      {
        id: 'bunga',
        tanya: 'Total bunga majemuk selama n periode adalah …',
        opsi: [
          { id: 'benar', label: 'Bₙ = Mₙ − M₀ = M₀(1 + i)ⁿ − M₀' },
          { id: 'tunggal', label: 'Bₙ = M₀ × i × n' },
          { id: 'akhir', label: 'Bₙ = M₀(1 + i)ⁿ' },
          { id: 'satu', label: 'Bₙ = M₀ × i' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Total bunga = saldo akhir − setoran awal. Ini juga jumlah n suku deret geometri a = M₀ × i, r = 1 + i: 1.000.000 + 1.100.000 + 1.210.000 + 1.331.000 = 4.641.000 = M₄ − M₀ ✓.',
          tunggal:
            'M₀ × i × n menganggap bunga setiap tahun sama — itu bunga tunggal. Cek n = 2: 2.000.000, padahal bunga Bank B 2.100.000. Coba lagi.',
          akhir: 'M₀(1 + i)ⁿ adalah saldo akhir, sudah termasuk setoran awal. Coba lagi.',
          satu: 'M₀ × i hanya bunga tahun pertama. Coba lagi.',
        },
      },
    ],
    nextLabel: 'Uji Hipotesismu →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGUJI HIPOTESIS
     A: uji rumus pada tabel & buktikan dugaan tahun ke-5.
     B: bandingkan dengan bunga tunggal (grafik 10 tahun).
     ---------------------------------------------------------- */
  uji: {
    kicker: 'Tahap 6 · Menguji Hipotesis',
    syntax: IL + ' · Sintaks 5',
    goal: 'Menguji rumus Mₙ = M₀(1 + i)ⁿ pada data, membuktikan dugaan awal, dan membandingkan bunga majemuk dengan bunga tunggal.',
    guru: 'Minta murid membandingkan dugaan dan hipotesis awal dengan hasil rumus, lalu menjelaskan mengapa dugaannya terbukti atau terkoreksi. Pada grafik, tanyakan: "Mengapa selisih kedua saldo makin lama makin besar?"',
    judulA: 'A. Uji rumus pada tabel & buktikan dugaan tahun ke-5',
    judulB: 'B. Bunga majemuk vs bunga tunggal',
    judulC: 'C. Periksa hipotesis kelas',
    langkah: [
      {
        grup: 'A',
        label: 'Saldo Bank B akhir tahun ke-5: M₅ = 10.000.000 × 1,1⁵ = …',
        jawab: 16105100,
        hints: ['1,1⁵ = 1,61051 (gunakan kalkulator).', '10.000.000 × 1,61051.'],
        bukti: 'M₅ = 16.105.100 — dihitung dalam satu langkah, bukan lima!',
        cek: { jenis: 'akhir', M0: 10000000, i: 0.1, n: 5 },
      },
      {
        grup: 'B',
        label:
          'Setelah 5 tahun, selisih saldo Bank B dan Koperasi A = 16.105.100 − 10.000.000 × (1 + 5 × 0,1) = …',
        jawab: 1105100,
        hints: ['Saldo Koperasi A = 10.000.000 × 1,5 = 15.000.000.', '16.105.100 − 15.000.000.'],
        bukti: 'Bank B unggul Rp1.105.100 setelah 5 tahun, karena bunganya ikut berbunga.',
        cek: { jenis: 'selisih', M0: 10000000, i: 0.1, n: 5 },
      },
      {
        grup: 'B',
        label: 'Total bunga Bank B selama 5 tahun: B₅ = M₅ − M₀ = …',
        jawab: 6105100,
        hints: ['16.105.100 − 10.000.000.'],
        bukti: 'B₅ = 6.105.100, sedangkan bunga tunggal 5 tahun hanya 5.000.000.',
        cek: { jenis: 'bunga', M0: 10000000, i: 0.1, n: 5 },
      },
    ],
    dugaanBenar: 'm161',
    untungBenar: 'b',
    hipotesisBenar: 'geometri',
    bandingN: 10,
    instruksiC: 'Berdasarkan hasil uji, pilah setiap pernyataan: benar atau salah?',
    opsiPilah: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pilah: [
      {
        id: 'u1',
        teks: 'Hipotesis "saldo bunga majemuk membentuk barisan geometri" terbukti oleh data.',
        correct: 'benar',
        explanation:
          'Rasio saldo berurutan selalu 1,1 dan rumus M₀(1 + i)ⁿ cocok dengan semua data.',
      },
      {
        id: 'u2',
        teks: 'Pada akhir tahun pertama, bunga tunggal dan bunga majemuk memberi saldo yang sama.',
        correct: 'benar',
        explanation:
          'Untuk n = 1: M₀(1 + i)¹ = M₀(1 + 1 × i). Perbedaan baru muncul mulai tahun ke-2.',
      },
      {
        id: 'u3',
        teks: 'Selisih saldo bunga majemuk dan bunga tunggal selalu sama setiap tahun.',
        correct: 'salah',
        explanation:
          'Selisihnya 0; 100.000; 310.000; 641.000; 1.105.100; … — makin lama makin besar, seperti terlihat pada grafik.',
      },
      {
        id: 'u4',
        teks: 'Untuk menghitung saldo tahun ke-10 tetap harus menghitung tahun demi tahun.',
        correct: 'salah',
        explanation: 'Cukup satu langkah: M₁₀ = 10.000.000 × 1,1¹⁰ ≈ Rp25.937.425.',
      },
    ],
    nextLabel: 'Siklus Inkuiri Kedua →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — SIKLUS INKUIRI KEDUA: PERIODE PEMAJEMUKAN
     ---------------------------------------------------------- */
  periode: {
    kicker: 'Tahap 7 · Siklus Inkuiri Kedua',
    syntax: IL + ' · Sintaks 4–5',
    goal: 'Menyelidiki pengaruh periode pemajemukan (per semester) terhadap nilai akhir modal.',
    guru: 'Ajukan pertanyaan baru: "Bagaimana jika bunganya dimajemukkan setiap 6 bulan?" Minta murid menduga dulu (lebih besar, lebih kecil, atau sama), lalu menyelidikinya. Tekankan bahwa i dan n harus memakai satuan periode yang sama.',
    judul: 'Tawaran Ketiga: Bank C',
    cerita:
      'Bank C juga menawarkan bunga majemuk 10% per tahun, tetapi bunganya dimajemukkan setiap semester (6 bulan). Jadi bunga ditambahkan ke saldo 2 kali dalam setahun.',
    langkah: [
      {
        label: 'Suku bunga per semester: i = 10% : 2 = … %',
        jawab: 5,
        rational: true,
        hints: ['Satu tahun = 2 semester.', '10 : 2 = …'],
        temuan: 'i = 5% = 0,05 per semester.',
        cek: { jenis: 'persenPeriode', persenTahun: 10, kali: 2 },
      },
      {
        label: 'Banyak periode dalam 1 tahun: n = 1 × 2 = …',
        jawab: 2,
        hints: ['Periodenya semester. Ada berapa semester dalam 1 tahun?'],
        temuan: 'n = 2 semester.',
        cek: { jenis: 'nPeriode', tahun: 1, kali: 2 },
      },
      {
        label: 'Saldo Nadia di Bank C setelah 1 tahun: M₂ = 10.000.000 × 1,05² = …',
        jawab: 11025000,
        hints: ['1,05² = 1,05 × 1,05 = 1,1025.', '10.000.000 × 1,1025.'],
        temuan:
          'M₂ = 11.025.000 — lebih besar Rp25.000 daripada Bank B (11.000.000) karena bunga semester pertama ikut berbunga di semester kedua.',
        cek: { jenis: 'akhir', M0: 10000000, i: 0.05, n: 2 },
      },
    ],
    pertanyaan: [
      {
        id: 'lebih',
        tanya:
          'Dengan suku bunga tahunan yang sama, semakin sering bunga dimajemukkan dalam setahun, maka …',
        opsi: [
          { id: 'besar', label: 'nilai akhir modal makin besar' },
          { id: 'kecil', label: 'nilai akhir modal makin kecil' },
          { id: 'sama', label: 'nilai akhir modal tetap sama' },
          { id: 'dua', label: 'nilai akhir modal menjadi dua kali lipat' },
        ],
        correct: 'besar',
        umpan: {
          besar:
            '<strong>Tepat.</strong> Bunga lebih cepat ditambahkan ke saldo sehingga lebih cepat ikut berbunga: 11.025.000 > 11.000.000.',
          kecil:
            'Suku bunga per periode memang lebih kecil (5%), tetapi periodenya lebih banyak dan bunga ikut berbunga. Bandingkan 11.025.000 dengan 11.000.000. Coba lagi.',
          sama: 'Hasil penyelidikanmu menunjukkan 11.025.000 ≠ 11.000.000. Coba lagi.',
          dua: 'Tidak sebesar itu — selisihnya hanya Rp25.000 dalam setahun. Coba lagi.',
        },
      },
      {
        id: 'konversi',
        tanya:
          'Bunga majemuk 12% per tahun dimajemukkan setiap bulan selama 2 tahun. Nilai i dan n pada Mₙ = M₀(1 + i)ⁿ adalah …',
        opsi: [
          { id: 'benar', label: 'i = 1% = 0,01 dan n = 24' },
          { id: 'iTahun', label: 'i = 12% = 0,12 dan n = 24' },
          { id: 'nTahun', label: 'i = 1% = 0,01 dan n = 2' },
          { id: 'tahunan', label: 'i = 12% = 0,12 dan n = 2' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Periodenya bulan: i = 12% : 12 = 1% per bulan, n = 2 × 12 = 24 bulan.',
          iTahun:
            'n sudah dalam bulan, tetapi 12% masih per tahun. Satuannya harus sama. Coba lagi.',
          nTahun:
            'i sudah per bulan, tetapi n = 2 masih dalam tahun. Satuannya harus sama. Coba lagi.',
          tahunan: 'Itu berarti bunga dimajemukkan per tahun, bukan per bulan. Coba lagi.',
        },
      },
    ],
    nextLabel: 'Rumuskan Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — MERUMUSKAN KESIMPULAN
     ---------------------------------------------------------- */
  simpulan: {
    kicker: 'Tahap 8 · Merumuskan Kesimpulan',
    syntax: IL + ' · Sintaks 6',
    goal: 'Merumuskan kesimpulan tentang bunga majemuk dan kaitannya dengan barisan & deret geometri.',
    guru: 'Setelah kalimat lengkap, minta beberapa murid membacakan kesimpulannya dan menjawab kembali rumusan masalah di tahap 2. Minta mereka menjelaskan perbedaan bunga tunggal dan bunga majemuk dengan kata-kata sendiri.',
    instruksi:
      'Lengkapi setiap awal kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan dipakai paling banyak satu kali, dan ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'Pada bunga majemuk, bunga setiap periode dihitung dari', correct: 'b1' },
      {
        id: 'k2',
        awal: 'Barisan saldo M₀, M₁, M₂, … adalah barisan geometri dengan',
        correct: 'b2',
      },
      { id: 'k3', awal: 'Nilai akhir modal setelah n periode adalah', correct: 'b3' },
      { id: 'k4', awal: 'Total bunga majemuk selama n periode adalah', correct: 'b4' },
      {
        id: 'k5',
        awal: 'Jika bunga dimajemukkan m kali setahun selama t tahun, maka',
        correct: 'b5',
      },
    ],
    bank: [
      { id: 'b1', teks: 'saldo periode sebelumnya, sehingga bunga ikut berbunga.' },
      { id: 'b2', teks: 'suku pertama M₀ dan rasio r = 1 + i.' },
      { id: 'b3', teks: 'Mₙ = M₀(1 + i)ⁿ, yaitu suku ke-(n + 1) barisan geometri.' },
      { id: 'b4', teks: 'Bₙ = Mₙ − M₀ (jumlah n suku deret geometri a = M₀ × i, r = 1 + i).' },
      { id: 'b5', teks: 'i = suku bunga per tahun : m dan n = t × m.' },
      { id: 'x1', teks: 'modal awal M₀ saja, sehingga bunganya selalu sama.' },
      { id: 'x2', teks: 'Mₙ = M₀(1 + n × i).' },
      { id: 'x3', teks: 'suku pertama M₀ dan beda M₀ × i.' },
    ],
    rangkuman: [
      'Bunga majemuk: bunga periode ini dihitung dari saldo periode sebelumnya (bunga berbunga).',
      'Saldo M₀, M₁, M₂, … adalah barisan geometri dengan a = M₀ dan r = 1 + i.',
      'Nilai akhir modal: Mₙ = M₀(1 + i)ⁿ — suku ke-(n + 1) barisan geometri.',
      'Total bunga: Bₙ = Mₙ − M₀ — jumlah n suku deret geometri dengan a = M₀ × i dan r = 1 + i.',
      'Pemajemukan m kali setahun selama t tahun: i = p% : m dan n = t × m.',
    ],
    nextLabel: 'Terapkan Rumusnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — UJI TERAP
     Campuran isian ('input') dan pilihan ganda ('choice').
     Metadata `bunga` dipakai tes untuk memeriksa kunci jawaban:
       cari  'akhir' | 'bunga' | 'M0' | 'n' | 'i' | 'selisih'
       M0, i, n                          — langsung per periode, atau
       persenTahun, kali, tahun          — dikonversi konversiPeriode()
       target                            — nilai akhir yang diketahui
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 9 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menentukan nilai akhir modal, total bunga, modal awal, banyak periode, atau suku bunga pada masalah bunga majemuk.',
    guru: 'Izinkan kalkulator. Dorong murid menulis dulu M₀, i, n (dengan satuan periode yang sama) dan besaran yang dicari. Diskusikan soal yang paling banyak salah di akhir sesi.',
    instruksi:
      'Selesaikan setiap masalah. Tuliskan dulu M₀, i, dan n (samakan satuan periodenya), lalu gunakan Mₙ = M₀(1 + i)ⁿ. Kalkulator boleh dipakai. Jawaban rupiah dibulatkan ke rupiah terdekat dan boleh ditulis dengan titik ribuan.',
    soal: [
      {
        type: 'input',
        cerita:
          'Sebuah startup menyimpan dana cadangan sewa server Rp5.000.000 dalam deposito berbunga majemuk 8% per tahun.',
        pertanyaan: 'Berapa rupiah <strong>nilai akhir</strong> deposito itu setelah 2 tahun?',
        jawab: 5832000,
        bunga: { cari: 'akhir', M0: 5000000, i: 0.08, n: 2 },
        hints: ['M₀ = 5.000.000, i = 0,08, n = 2.', 'M₂ = 5.000.000 × 1,08² = 5.000.000 × 1,1664.'],
        reveal: 'M₂ = 5.000.000 × 1,08² = 5.000.000 × 1,1664 = <strong>Rp5.832.000</strong>.',
      },
      {
        type: 'input',
        cerita:
          'Rafi menabung Rp2.000.000 hasil menjual template desain di bank dengan bunga majemuk 5% per tahun.',
        pertanyaan: 'Berapa rupiah <strong>total bunga</strong> yang Rafi peroleh setelah 3 tahun?',
        jawab: 315250,
        bunga: { cari: 'bunga', M0: 2000000, i: 0.05, n: 3 },
        hints: [
          'Hitung dulu M₃ = 2.000.000 × 1,05³ = 2.000.000 × 1,157625.',
          'Total bunga = M₃ − M₀.',
        ],
        reveal:
          'M₃ = 2.000.000 × 1,157625 = 2.315.250, sehingga B₃ = 2.315.250 − 2.000.000 = <strong>Rp315.250</strong>.',
      },
      {
        type: 'choice',
        cerita:
          'Tim e-sport sekolah menyimpan uang hadiah Rp4.000.000 dengan bunga majemuk 10% per tahun.',
        pertanyaan: 'Berapa saldo tabungan tim setelah 3 tahun?',
        options: [
          { id: 'a', label: 'Rp5.324.000', nilai: 5324000 },
          { id: 'b', label: 'Rp5.200.000', nilai: 5200000 },
          { id: 'c', label: 'Rp1.324.000', nilai: 1324000 },
          { id: 'd', label: 'Rp5.856.400', nilai: 5856400 },
        ],
        correct: 'a',
        bunga: { cari: 'akhir', M0: 4000000, i: 0.1, n: 3 },
        hints: ['M₃ = 4.000.000 × 1,1³ = 4.000.000 × 1,331.'],
        explanation:
          'M₃ = 4.000.000 × 1,331 = Rp5.324.000. (Rp5.200.000 hasil bunga tunggal, Rp1.324.000 hanya bunganya, dan Rp5.856.400 saldo setelah 4 tahun.)',
      },
      {
        type: 'input',
        cerita:
          'Dina menyimpan Rp8.000.000 di bank yang memberi bunga majemuk 10% per tahun, dimajemukkan setiap semester.',
        pertanyaan: 'Berapa rupiah <strong>nilai akhir</strong> tabungan Dina setelah 1 tahun?',
        jawab: 8820000,
        bunga: { cari: 'akhir', M0: 8000000, persenTahun: 10, kali: 2, tahun: 1 },
        hints: [
          'Per semester: i = 10% : 2 = 5% = 0,05, dan n = 1 × 2 = 2.',
          'M₂ = 8.000.000 × 1,05² = 8.000.000 × 1,1025.',
        ],
        reveal:
          'i = 5% per semester, n = 2. M₂ = 8.000.000 × 1,1025 = <strong>Rp8.820.000</strong>.',
      },
      {
        type: 'input',
        cerita:
          'Sebuah tabungan berbunga majemuk 10% per tahun bernilai Rp6.655.000 setelah 3 tahun.',
        pertanyaan: 'Berapa rupiah <strong>modal awal</strong> tabungan itu?',
        jawab: 5000000,
        bunga: { cari: 'M0', i: 0.1, n: 3, target: 6655000 },
        hints: ['M₀ × 1,1³ = 6.655.000 → M₀ × 1,331 = 6.655.000.', 'M₀ = 6.655.000 : 1,331.'],
        reveal: 'M₀ = 6.655.000 : 1,1³ = 6.655.000 : 1,331 = <strong>Rp5.000.000</strong>.',
      },
      {
        type: 'input',
        cerita:
          'Bima menabung Rp1.000.000 dengan bunga majemuk 10% per tahun. Saat diambil, saldonya Rp1.464.100.',
        pertanyaan: 'Berapa <strong>tahun</strong> Bima menabung?',
        jawab: 4,
        bunga: { cari: 'n', M0: 1000000, i: 0.1, target: 1464100 },
        hints: [
          '1.000.000 × 1,1ⁿ = 1.464.100 → 1,1ⁿ = 1,4641.',
          'Kalikan 1,1 berulang: 1,1; 1,21; 1,331; … sampai 1,4641.',
        ],
        reveal: '1,1ⁿ = 1,4641 = 1,1⁴, jadi n = <strong>4 tahun</strong>.',
      },
      {
        type: 'choice',
        cerita:
          'Rp10.000.000 disimpan selama 3 tahun dengan suku bunga 10% per tahun. Nadia membandingkan bunga majemuk dan bunga tunggal.',
        pertanyaan: 'Berapa <strong>selisih</strong> nilai akhir bunga majemuk dan bunga tunggal?',
        options: [
          { id: 'a', label: 'Rp310.000', nilai: 310000 },
          { id: 'b', label: 'Rp0', nilai: 0 },
          { id: 'c', label: 'Rp3.310.000', nilai: 3310000 },
          { id: 'd', label: 'Rp100.000', nilai: 100000 },
        ],
        correct: 'a',
        bunga: { cari: 'selisih', M0: 10000000, i: 0.1, n: 3 },
        hints: ['Majemuk: 10.000.000 × 1,1³. Tunggal: 10.000.000 × (1 + 3 × 0,1).'],
        explanation:
          'Majemuk 13.310.000 − tunggal 13.000.000 = Rp310.000. (Rp3.310.000 adalah total bunga majemuk, Rp100.000 selisih setelah 2 tahun.)',
      },
      {
        type: 'choice',
        cerita:
          'Aplikasi bank menampilkan saldo tabungan berbunga majemuk milik Tono per tahun: Rp2.000.000; Rp2.160.000; Rp2.332.800; …',
        pertanyaan: 'Berapa suku bunga majemuk tabungan Tono per tahun?',
        options: [
          { id: 'a', label: '8%', nilai: 8 },
          { id: 'b', label: '16%', nilai: 16 },
          { id: 'c', label: '1,08%', nilai: 1.08 },
          { id: 'd', label: '0,8%', nilai: 0.8 },
        ],
        correct: 'a',
        bunga: { cari: 'i', saldo: [2000000, 2160000, 2332800] },
        hints: ['Rasio r = 2.160.000 : 2.000.000.', 'r = 1 + i.'],
        explanation:
          'r = 2.160.000 : 2.000.000 = 1,08 = 1 + i, sehingga i = 0,08 = 8% per tahun. (Cek: 2.160.000 × 1,08 = 2.332.800 ✓.)',
      },
      {
        type: 'input',
        cerita:
          'Koperasi sekolah menawarkan bunga majemuk 8% per tahun yang dimajemukkan setiap triwulan (3 bulan). Sari menabung Rp6.000.000.',
        pertanyaan: 'Berapa rupiah <strong>total bunga</strong> yang Sari peroleh setelah 6 bulan?',
        jawab: 242400,
        bunga: { cari: 'bunga', M0: 6000000, persenTahun: 8, kali: 4, tahun: 0.5 },
        hints: [
          'Per triwulan: i = 8% : 4 = 2% = 0,02. Dalam 6 bulan ada n = 2 triwulan.',
          'M₂ = 6.000.000 × 1,02² = 6.000.000 × 1,0404.',
        ],
        reveal:
          'M₂ = 6.000.000 × 1,0404 = 6.242.400, sehingga total bunga = <strong>Rp242.400</strong>.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 10 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses menyelidiki bunga majemuk dengan barisan & deret geometri.',
    guru: 'Baca jawaban refleksi secara acak dan gunakan untuk menentukan murid yang perlu pendampingan tambahan sebelum masuk ke materi anuitas.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri mengapa saldo bunga majemuk membentuk barisan geometri, sedangkan bunga tunggal membentuk barisan aritmetika.',
        placeholder: 'Pada bunga majemuk, bunganya dihitung dari …',
      },
      {
        id: 'r2',
        teks: 'Bandingkan hipotesis awalmu dengan hasil penyelidikan. Apa yang terbukti dan apa yang terkoreksi?',
        placeholder: 'Awalnya aku menduga …, ternyata …',
      },
      {
        id: 'r3',
        teks: 'Di mana kamu bisa memakai rumus bunga majemuk dalam dunia RPL atau kehidupan sehari-hari?',
        placeholder: 'Misalnya membuat fitur simulasi tabungan atau investasi di aplikasi …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat menentukan nilai akhir modal bunga majemuk sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '🙂 Yakin — aku bisa memakai rumusnya' },
      { id: 'ragu', label: '🤔 Masih ragu, terutama soal periode, mencari n, atau M₀' },
      { id: 'bantuan', label: '🙋 Aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 11 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, penyelidikanmu tentang bunga majemuk tuntas!',
    teks: 'Kamu mengajukan hipotesis, mengumpulkan data, lalu membuktikan sendiri bahwa saldo bunga majemuk adalah barisan geometri.',
    capaian: [
      'Mengumpulkan data bunga dan saldo bunga majemuk dari buku tabungan dan simulator.',
      'Menemukan rasio r = 1 + i dan rumus Mₙ = M₀(1 + i)ⁿ dari barisan geometri saldo.',
      'Menguji hipotesis dan membandingkan bunga majemuk dengan bunga tunggal.',
      'Menyesuaikan i dan n untuk pemajemukan per semester, triwulan, atau bulan.',
      'Menentukan nilai akhir, total bunga, modal awal, banyak periode, dan suku bunga pada masalah kontekstual.',
    ],
  },
};
