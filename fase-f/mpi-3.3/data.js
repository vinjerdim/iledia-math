'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membandingkan Bunga Tunggal & Bunga Majemuk
   Fase F — SMK Rekayasa Perangkat Lunak

   Tujuan Pembelajaran:
   Membandingkan bunga tunggal dan bunga majemuk serta menyelesaikan
   masalah keuangan kontekstual yang melibatkan keduanya secara tepat.

   Model pembelajaran: PROBLEM BASED LEARNING (PBL).
   Masalah pemantik: "Dana Hibah Startup Tim Kodekita".
   Tim Kodekita (siswa RPL) memenangi hibah inkubator Rp20.000.000.
   Dana harus diparkir dulu sampai tim siap mendirikan usaha — bisa
   3 tahun lagi, bisa juga 6 tahun lagi. Dua tawaran:
     • Koperasi A : bunga TUNGGAL 12% per tahun  → Mₙ = M₀(1 + 0,12n)
     • Bank B     : bunga MAJEMUK 10% per tahun  → Mₙ = M₀ × 1,1ⁿ
   Konflik kognitif: persen Koperasi A lebih besar dan saldonya unggul
   pada tahun 1–4, tetapi Bank B menyalip mulai tahun ke-5:
     n = 3 : A 27.200.000 > B 26.620.000
     n = 5 : A 32.000.000 < B 32.210.200
     n = 6 : A 34.400.000 < B 35.431.220
   Tawaran terbaik BERGANTUNG pada jangka waktu (dan tujuan: menabung
   atau meminjam), sehingga murid harus membandingkan keduanya dengan
   perhitungan, bukan dengan melihat persennya saja.

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ...... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar  'organisasi'
     Sintaks 3 — Membimbing penyelidikan ........... 'selidikCara', 'selidikSalip',
                                                     'latih'
     Sintaks 4 — Mengembangkan & menyajikan hasil .. 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi proses  'evaluasi'
     Penutup ....................................... 'refleksi', 'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — murid menulis dugaan dan pertanyaan
       sendiri, menyusun rencana, lalu membandingkan dugaan awal dengan
       hasil perhitungan dan merefleksikannya.
     • Bermakna (meaningful) — keputusan finansial nyata yang dekat
       dengan lulusan RPL: memarkir dana hibah startup, meminjam untuk
       laptop/server, memilih tabungan.
     • Menggembirakan (joyful) — "duel tawaran" interaktif untuk
       menemukan tahun ketika bunga majemuk menyalip, dan poster
       rekomendasi kelompok yang dipresentasikan.

   Rangkaian aktivitas (± 2 × 45 menit; kelompok 3–4 murid, satu
   perangkat per kelompok atau per murid, kalkulator boleh dipakai):
     1. Orientasi      (8')  — cerita hibah Kodekita, kartu dua tawaran,
                               buku tabungan tahun 0–1, dugaan untuk
                               6 tahun (tidak dinilai), pertanyaan pemantik.
     2. Organisasi     (7')  — membagi peran, memilah informasi
                               (diketahui/ditanya/tidak diperlukan),
                               menyusun urutan rencana penyelidikan.
     3. Selidik cara   (15') — melengkapi buku tabungan kedua tawaran
                               tahun 1–4, pertanyaan penuntun (bunga tetap
                               vs bunga berbunga, barisan aritmetika vs
                               geometri, rumus Mₙ), memilah ciri "Tunggal /
                               Majemuk / Keduanya".
     4. Selidik salip  (12') — duel tawaran (tombol −/+ tahun & grafik),
                               menemukan tahun menyalip, menjelaskan
                               sebabnya, membuktikan dengan rumus.
     5. Latihan        (15') — sembilan masalah keuangan kontekstual:
                               bunga tunggal, nilai akhir & bunga majemuk,
                               selisih, memilih tabungan, memilih pinjaman,
                               pemajemukan semesteran, mencari n.
     6. Karya          (12') — menghitung saldo untuk 3 & 6 tahun,
                               menyusun rekomendasi + poster untuk
                               dipresentasikan.
     7. Evaluasi       (8')  — menilai pendapat teman, dugaan vs hasil,
                               satu masalah transfer (pinjaman server).
     8. Refleksi       (5')  — rekap capaian, refleksi tertulis,
                               keyakinan diri.

   Notasi: M₀ modal awal, i suku bunga per periode (desimal),
   n banyak periode, Mₙ nilai akhir modal (saldo / total pinjaman).

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/ensureTapOrderState()/
   shuffleArray() dari shared/engine.js, satu kali saat state disiapkan,
   sehingga tiap murid (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var PBL = 'Problem Based Learning';

var DATA = {
  /* Kasus yang dipakai sepanjang modul. */
  kasus: {
    tim: 'Kodekita',
    M0: 20000000,
    tunggal: { id: 'A', nama: 'Koperasi A', ikon: '🏦', persen: 12, i: 0.12 },
    majemuk: { id: 'B', nama: 'Bank B', ikon: '🏛️', persen: 10, i: 0.1 },
    jangka: { pendek: 3, panjang: 6 },
    salipN: 5,
  },

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI PADA MASALAH  (PBL sintaks 1)
     Dugaan TIDAK dinilai; dibandingkan dengan hasil pada Evaluasi.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi Masalah',
    syntax: PBL + ' · Sintaks 1',
    goal: 'Memahami masalah dana hibah tim Kodekita dan menuliskan dugaan awal.',
    guru: 'Bacakan cerita, lalu tanyakan: "Kalau kalian bendahara Kodekita, pilih yang mana?" Kebanyakan murid akan memilih 12% karena persennya lebih besar. Tampung semua dugaan tanpa dikoreksi — tekankan bahwa kelompok harus <em>membuktikan</em> pilihannya dengan perhitungan.',
    judul: 'Dana Hibah Startup Tim Kodekita',
    cerita:
      'Tim Kodekita, empat siswa RPL, memenangi hibah inkubator bisnis sebesar Rp20.000.000 untuk startup aplikasi mereka. Dana itu belum akan dipakai sekarang: bisa 3 tahun lagi setelah mereka lulus, bisa juga 6 tahun lagi setelah punya pengalaman kerja. Sambil menunggu, dana harus disimpan di salah satu dari dua tempat berikut.',
    aturan: {
      tunggal: 'Bunga tunggal 12% per tahun — bunga selalu dihitung dari setoran awal.',
      majemuk: 'Bunga majemuk 10% per tahun — bunga dihitung dari saldo tahun sebelumnya.',
    },
    pertanyaan:
      'Dugaanmu: jika dana disimpan 6 tahun, tempat mana yang memberi saldo akhir lebih besar?',
    opsi: [
      { id: 'A', label: 'Koperasi A (bunga tunggal 12%)' },
      { id: 'B', label: 'Bank B (bunga majemuk 10%)' },
      { id: 'sama', label: 'Kurang lebih sama saja' },
    ],
    dugaanN: 6,
    dugaanBenar: 'B',
    alasanLabel: 'Mengapa kamu menduga begitu?',
    alasanPlaceholder: 'Contoh: 12% lebih besar daripada 10%, jadi …',
    pemantikLabel:
      'Pertanyaan pemantik: apa yang perlu kalian ketahui atau hitung agar bisa memberi saran yang pasti kepada tim Kodekita?',
    pemantikPlaceholder: 'Contoh: saldo kedua tempat setelah …',
    catatan:
      'Belum ada jawaban benar atau salah. Simpan dugaanmu — di akhir pelajaran kamu akan membuktikannya sendiri.',
    nextLabel: 'Simpan Dugaan & Lanjut →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENGORGANISASI MURID  (PBL sintaks 2)
     ---------------------------------------------------------- */
  organisasi: {
    kicker: 'Tahap 2 · Organisasi Belajar',
    syntax: PBL + ' · Sintaks 2',
    goal: 'Membagi peran, memilah informasi, dan menyusun rencana penyelidikan.',
    guru: 'Pastikan setiap anggota punya peran. Saat memilah informasi, tanyakan: "Apakah jumlah anggota tim mengubah saldo?" Biarkan kelompok berdebat soal urutan rencana sebelum mencoba.',
    judulPeran: 'A. Bagi peran di kelompokmu',
    instruksiPeran:
      'Tulis nama anggota untuk setiap peran (boleh dikosongkan jika belajar mandiri).',
    peran: [
      {
        id: 'ketua',
        ikon: '🧭',
        nama: 'Manajer Proyek',
        tugas: 'Memimpin diskusi dan menjaga waktu.',
      },
      {
        id: 'hitung',
        ikon: '🧮',
        nama: 'Analis Keuangan',
        tugas: 'Menghitung bunga dan saldo kedua tawaran.',
      },
      {
        id: 'uji',
        ikon: '🔍',
        nama: 'Penguji (QA)',
        tugas: 'Memeriksa ulang setiap hasil hitungan.',
      },
      {
        id: 'saji',
        ikon: '🎤',
        nama: 'Presenter',
        tugas: 'Menyajikan rekomendasi kelompok di depan kelas.',
      },
    ],
    judulInfo: 'B. Pilah informasi dari cerita',
    instruksiInfo:
      'Tentukan apakah setiap informasi termasuk yang diketahui, yang ditanyakan, atau tidak diperlukan.',
    infoOpsi: [
      { id: 'tahu', label: 'Diketahui' },
      { id: 'tanya', label: 'Ditanyakan' },
      { id: 'tidak', label: 'Tidak diperlukan' },
    ],
    info: [
      {
        id: 'i1',
        teks: 'Dana hibah yang disimpan sebesar Rp20.000.000.',
        correct: 'tahu',
        explanation: 'Ini modal awal M₀ untuk kedua tawaran.',
      },
      {
        id: 'i2',
        teks: 'Koperasi A memberi bunga tunggal 12% per tahun.',
        correct: 'tahu',
        explanation: 'Jenis bunga dan suku bunga (i = 0,12) tawaran pertama.',
      },
      {
        id: 'i3',
        teks: 'Bank B memberi bunga majemuk 10% per tahun.',
        correct: 'tahu',
        explanation: 'Jenis bunga dan suku bunga (i = 0,1) tawaran kedua.',
      },
      {
        id: 'i4',
        teks: 'Dana akan dipakai 3 tahun lagi atau 6 tahun lagi.',
        correct: 'tahu',
        explanation: 'Lama menyimpan adalah banyak periode n yang dibandingkan.',
      },
      {
        id: 'i5',
        teks: 'Tempat mana yang memberi saldo lebih besar untuk 3 tahun dan untuk 6 tahun?',
        correct: 'tanya',
        explanation: 'Inilah masalah yang harus dijawab: membandingkan nilai akhir kedua tawaran.',
      },
      {
        id: 'i6',
        teks: 'Tim Kodekita beranggotakan empat siswa kelas XI RPL.',
        correct: 'tidak',
        explanation: 'Banyak anggota tim tidak memengaruhi besar bunga.',
      },
      {
        id: 'i7',
        teks: 'Aplikasi startup mereka dibuat dengan framework Flutter.',
        correct: 'tidak',
        explanation: 'Teknologi aplikasi tidak dipakai untuk menghitung saldo.',
      },
    ],
    judulRencana: 'C. Susun rencana penyelidikan',
    instruksiRencana: 'Ketuk kartu sesuai urutan langkah kerja kelompokmu dari yang pertama.',
    rencana: [
      { id: 'r1', label: 'Pahami cara kerja bunga tunggal dan bunga majemuk' },
      { id: 'r2', label: 'Hitung saldo kedua tawaran untuk beberapa tahun pertama' },
      { id: 'r3', label: 'Bandingkan saldo dan cari kapan salah satunya menyalip' },
      { id: 'r4', label: 'Hitung saldo 3 tahun dan 6 tahun dengan rumus' },
      { id: 'r5', label: 'Sajikan rekomendasi untuk tim Kodekita' },
    ],
    rencanaUrut: ['r1', 'r2', 'r3', 'r4', 'r5'],
    rencanaSukses:
      '<strong>Rencana kelompokmu siap.</strong> Media ini akan menemanimu mengikuti langkah-langkah tersebut.',
    nextLabel: 'Mulai Penyelidikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENYELIDIKAN: CARA KERJA KEDUA BUNGA  (sintaks 3)
     Tabel: kolom "Bunga A" diberikan (tetap), kolom lain diisi.
     ---------------------------------------------------------- */
  selidikCara: {
    kicker: 'Tahap 3 · Selidiki Cara Kerja',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Mengumpulkan data saldo kedua tawaran dan membandingkan cara kerja bunga tunggal dan bunga majemuk.',
    guru: 'Minta Analis Keuangan menghitung dan Penguji memeriksa. Ajukan pertanyaan pelacak: "Bunga Bank B tahun ke-2 dihitung dari uang yang mana?" Pastikan murid menyadari bahwa bunga tahun lalu ikut berbunga.',
    judulTabel: 'A. Lengkapi buku tabungan kedua tawaran',
    instruksiTabel:
      'Bunga Koperasi A sudah tertulis. Lengkapi saldo Koperasi A, lalu bunga dan saldo Bank B untuk tahun ke-1 sampai ke-4. Boleh memakai titik pemisah ribuan.',
    tabelN: 4,
    hintsTabel: [
      'Koperasi A: saldo tahun ini = saldo tahun lalu + 2.400.000 (12% dari modal awal Rp20.000.000).',
      'Bank B: bunga tahun ini = 10% × saldo tahun LALU. Contoh tahun ke-2: 10% × 22.000.000 = 2.200.000.',
      'Bank B: saldo tahun ini = saldo tahun lalu + bunga tahun ini, atau saldo tahun lalu × 1,1.',
    ],
    tabelSukses:
      '<strong>Buku tabunganmu lengkap.</strong> Bunga Koperasi A selalu sama, sedangkan bunga Bank B terus bertambah. Sampai tahun ke-4, saldo Koperasi A masih unggul.',
    judulPola: 'B. Bandingkan cara kerjanya',
    instruksiPola: 'Jawab pertanyaan penuntun berikut satu per satu berdasarkan tabelmu.',
    pertanyaan: [
      {
        id: 'q1',
        tanya: 'Bunga Koperasi A selalu Rp2.400.000 setiap tahun karena …',
        opsi: [
          { id: 'modal', label: 'bunganya selalu dihitung dari modal awal Rp20.000.000' },
          { id: 'saldo', label: 'bunganya dihitung dari saldo tahun sebelumnya' },
          { id: 'turun', label: 'suku bunganya turun setiap tahun' },
          { id: 'bonus', label: 'koperasi memberi bonus tetap di akhir tahun' },
        ],
        correct: 'modal',
        umpan: {
          modal:
            '<strong>Tepat.</strong> Pada bunga tunggal, bunga = M₀ × i = 20.000.000 × 0,12 = 2.400.000 setiap tahun.',
          saldo:
            'Jika dihitung dari saldo, bunga tahun ke-2 menjadi 12% × 22.400.000 — tidak sama dengan 2.400.000. Lihat lagi tabelmu.',
          turun: 'Suku bunganya tetap 12% per tahun. Dari uang mana bunga itu dihitung?',
          bonus: 'Tidak ada bonus dalam cerita. Hitung 12% × 20.000.000.',
        },
      },
      {
        id: 'q2',
        tanya:
          'Bunga Bank B makin besar dari tahun ke tahun (2.000.000; 2.200.000; 2.420.000; …) karena …',
        opsi: [
          {
            id: 'berbunga',
            label: 'bunga tahun lalu ikut masuk saldo dan ikut berbunga (bunga berbunga)',
          },
          { id: 'naik', label: 'suku bunga Bank B naik 10% setiap tahun' },
          { id: 'modal', label: 'bunganya selalu dihitung dari modal awal' },
          { id: 'setor', label: 'tim Kodekita menambah setoran setiap tahun' },
        ],
        correct: 'berbunga',
        umpan: {
          berbunga:
            '<strong>Tepat.</strong> Pada bunga majemuk, bunga = i × saldo sebelumnya. Saldo makin besar, bunganya pun makin besar.',
          naik: 'Suku bunganya tetap 10% per tahun. Yang berubah adalah uang yang dikenai bunga.',
          modal:
            'Jika dari modal awal, bunganya selalu 2.000.000. Kenyataannya tahun ke-2 sudah 2.200.000.',
          setor: 'Tidak ada setoran tambahan. Saldo bertambah hanya karena bunga.',
        },
      },
      {
        id: 'q3',
        tanya:
          'Saldo Koperasi A 20.000.000; 22.400.000; 24.800.000; 27.200.000; … membentuk barisan …',
        opsi: [
          { id: 'arit', label: 'aritmetika dengan beda b = 2.400.000' },
          { id: 'geo', label: 'geometri dengan rasio r = 1,12' },
          { id: 'arit12', label: 'aritmetika dengan beda b = 12' },
          { id: 'bukan', label: 'bukan aritmetika maupun geometri' },
        ],
        correct: 'arit',
        umpan: {
          arit: '<strong>Tepat.</strong> Setiap tahun saldo <em>ditambah</em> 2.400.000 yang sama.',
          geo: '22.400.000 × 1,12 = 25.088.000, bukan 24.800.000. Rasionya tidak tetap.',
          arit12: '12 adalah persennya. Hitung selisih dua saldo yang berurutan.',
          bukan: 'Coba hitung selisih saldo berurutan. Apakah selalu sama?',
        },
      },
      {
        id: 'q4',
        tanya: 'Saldo Bank B 20.000.000; 22.000.000; 24.200.000; 26.620.000; … membentuk barisan …',
        opsi: [
          { id: 'geo', label: 'geometri dengan rasio r = 1,1' },
          { id: 'arit', label: 'aritmetika dengan beda b = 2.000.000' },
          { id: 'geo01', label: 'geometri dengan rasio r = 0,1' },
          { id: 'bukan', label: 'bukan aritmetika maupun geometri' },
        ],
        correct: 'geo',
        umpan: {
          geo: '<strong>Tepat.</strong> Setiap tahun saldo <em>dikali</em> 1,1 (= 1 + 10%).',
          arit: 'Selisihnya 2.000.000 lalu 2.200.000 — tidak tetap. Coba bagi dua saldo berurutan.',
          geo01:
            'Dikali 0,1 justru menghasilkan bunganya saja. Saldo baru = saldo lama × (1 + 0,1).',
          bukan:
            'Coba bagi dua saldo berurutan: 22.000.000 : 20.000.000 dan 24.200.000 : 22.000.000.',
        },
      },
      {
        id: 'q5',
        tanya: 'Maka rumus saldo setelah n tahun (Mₙ) untuk kedua tawaran adalah …',
        opsi: [
          { id: 'benar', label: 'A: Mₙ = M₀(1 + n × i)   ·   B: Mₙ = M₀(1 + i)ⁿ' },
          { id: 'tukar', label: 'A: Mₙ = M₀(1 + i)ⁿ   ·   B: Mₙ = M₀(1 + n × i)' },
          { id: 'kali', label: 'A: Mₙ = M₀ × n × i   ·   B: Mₙ = M₀ × iⁿ' },
          { id: 'sama', label: 'Keduanya: Mₙ = M₀(1 + n × i)' },
        ],
        correct: 'benar',
        umpan: {
          benar:
            '<strong>Tepat.</strong> Bunga tunggal: M₀ ditambah n kali bunga tetap. Bunga majemuk: M₀ dikali (1 + i) sebanyak n kali.',
          tukar: 'Terbalik. Barisan aritmetika (tambah tetap) milik bunga tunggal.',
          kali: 'M₀ × n × i hanya total bunganya, belum termasuk modal. M₀ × iⁿ juga tidak cocok dengan tabel.',
          sama: 'Cek Bank B tahun ke-2: 20.000.000 × (1 + 2 × 0,1) = 24.000.000, padahal saldonya 24.200.000.',
        },
      },
    ],
    judulPilah: 'C. Pilah ciri-cirinya',
    instruksiPilah:
      'Ciri berikut milik bunga tunggal, bunga majemuk, atau keduanya? Pilih satu untuk setiap ciri.',
    pilahOpsi: [
      { id: 'tunggal', label: 'Bunga tunggal' },
      { id: 'majemuk', label: 'Bunga majemuk' },
      { id: 'keduanya', label: 'Keduanya' },
    ],
    pilah: [
      {
        id: 'c1',
        teks: 'Bunga setiap periode dihitung dari modal awal saja.',
        correct: 'tunggal',
        explanation: 'Bunga tunggal: bunga = M₀ × i setiap periode.',
      },
      {
        id: 'c2',
        teks: 'Bunga periode sebelumnya ikut dikenai bunga (bunga berbunga).',
        correct: 'majemuk',
        explanation: 'Bunga majemuk dihitung dari saldo sebelumnya yang sudah memuat bunga.',
      },
      {
        id: 'c3',
        teks: 'Besar bunga setiap periode selalu sama.',
        correct: 'tunggal',
        explanation: 'Koperasi A selalu Rp2.400.000; bunga Bank B terus bertambah.',
      },
      {
        id: 'c4',
        teks: 'Saldo membentuk barisan geometri dengan rasio r = 1 + i.',
        correct: 'majemuk',
        explanation: 'Mₙ = M₀(1 + i)ⁿ: saldo dikali (1 + i) setiap periode.',
      },
      {
        id: 'c5',
        teks: 'Saldo membentuk barisan aritmetika dengan beda b = M₀ × i.',
        correct: 'tunggal',
        explanation: 'Mₙ = M₀(1 + n × i): saldo ditambah M₀ × i setiap periode.',
      },
      {
        id: 'c6',
        teks: 'Selama suku bunganya positif, saldo selalu bertambah setiap periode.',
        correct: 'keduanya',
        explanation:
          'Keduanya menambah bunga positif ke saldo; yang berbeda hanya besar tambahannya.',
      },
      {
        id: 'c7',
        teks: 'Jika suku bunga dan modalnya sama, bunga periode pertama sama besar.',
        correct: 'keduanya',
        explanation:
          'Pada periode pertama saldo sebelumnya masih M₀, jadi keduanya memberi bunga M₀ × i. Perbedaan baru muncul di periode ke-2.',
      },
    ],
    nextLabel: 'Adu Kedua Tawaran →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENYELIDIKAN: KAPAN MENYALIP?  (sintaks 3)
     ---------------------------------------------------------- */
  selidikSalip: {
    kicker: 'Tahap 4 · Kapan Menyalip?',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Membandingkan saldo kedua tawaran dari tahun ke tahun, menemukan kapan bunga majemuk menyalip, dan membuktikannya dengan rumus.',
    guru: 'Biarkan kelompok menekan tombol + sendiri dan berseru ketika pemenangnya berganti. Tanyakan: "Persen Bank B lebih kecil, mengapa bisa menang?" Minta Presenter menjelaskan dengan kata "bunga berbunga".',
    judulA: 'A. Duel tawaran',
    instruksiA:
      'Tekan tombol + dan − untuk mengubah lama menyimpan. Amati kartu yang unggul dan grafiknya. Jelajahi minimal sampai tahun ke-6.',
    maxN: 8,
    syaratMaks: 6,
    pesanJelajah: 'Tekan + sampai minimal tahun ke-6 untuk membuka pertanyaan.',
    pertanyaan: [
      {
        id: 'salip',
        tanya: 'Bank B mulai memberi saldo lebih besar daripada Koperasi A pada tahun ke- …',
        opsi: [
          { id: 'n5', label: 'Tahun ke-5', nilai: 5 },
          { id: 'n4', label: 'Tahun ke-4', nilai: 4 },
          { id: 'n6', label: 'Tahun ke-6', nilai: 6 },
          { id: 'tidak', label: 'Tidak pernah, karena 12% > 10%', nilai: null },
        ],
        correct: 'n5',
        umpan: {
          n5: '<strong>Tepat.</strong> Tahun ke-4: A Rp29.600.000 > B Rp29.282.000. Tahun ke-5: A Rp32.000.000 < B Rp32.210.200.',
          n4: 'Tahun ke-4 Koperasi A masih unggul Rp318.000. Tekan + sekali lagi.',
          n6: 'Tahun ke-6 Bank B memang unggul, tetapi apakah tahun ke-5 juga sudah unggul?',
          tidak: 'Coba tekan + sampai tahun ke-6. Kartu mana yang bertanda 🏆?',
        },
      },
      {
        id: 'sebab',
        tanya: 'Mengapa Bank B yang persennya lebih kecil akhirnya bisa menyalip?',
        opsi: [
          {
            id: 'berbunga',
            label:
              'Bunga Bank B dihitung dari saldo yang terus membesar, sehingga bunganya bertambah tiap tahun; bunga Koperasi A tetap Rp2.400.000',
          },
          { id: 'naik', label: 'Suku bunga Bank B naik menjadi lebih dari 12% setelah 4 tahun' },
          { id: 'turun', label: 'Bunga Koperasi A makin kecil setiap tahun' },
          { id: 'bonus', label: 'Bank B memberi bonus khusus pada tahun ke-5' },
        ],
        correct: 'berbunga',
        umpan: {
          berbunga:
            '<strong>Tepat.</strong> Bunga Bank B tahun ke-5 sudah Rp2.928.200 — lebih besar dari Rp2.400.000. Tambahan yang terus membesar akhirnya mengejar selisih awal.',
          naik: 'Suku bunga Bank B tetap 10%. Yang membesar adalah saldo yang dikenai bunga.',
          turun: 'Bunga Koperasi A tetap Rp2.400.000 setiap tahun, tidak berkurang.',
          bonus: 'Tidak ada bonus. Semua tambahan berasal dari bunga 10% per tahun.',
        },
      },
    ],
    judulB: 'B. Buktikan dengan rumus',
    instruksiB:
      'Hitung dengan rumus yang kamu temukan (kalkulator boleh dipakai), lalu cocokkan dengan duel tawaran.',
    langkah: [
      {
        label: 'Koperasi A tahun ke-2: M₂ = 20.000.000 × (1 + 2 × 0,12) = …',
        jawab: 24800000,
        cek: { jenis: 'tunggal', M0: 20000000, i: 0.12, n: 2 },
        hints: ['1 + 2 × 0,12 = 1,24.', 'M₂ = 20.000.000 × 1,24.'],
        temuan: 'M₂ Koperasi A = Rp24.800.000.',
      },
      {
        label: 'Bank B tahun ke-2: M₂ = 20.000.000 × 1,1² = …',
        jawab: 24200000,
        cek: { jenis: 'majemuk', M0: 20000000, i: 0.1, n: 2 },
        hints: ['1,1² = 1,21.', 'M₂ = 20.000.000 × 1,21.'],
        temuan: 'M₂ Bank B = Rp24.200.000 — Koperasi A unggul Rp600.000.',
      },
      {
        label: 'Koperasi A tahun ke-5: M₅ = 20.000.000 × (1 + 5 × 0,12) = …',
        jawab: 32000000,
        cek: { jenis: 'tunggal', M0: 20000000, i: 0.12, n: 5 },
        hints: ['1 + 5 × 0,12 = 1,6.', 'M₅ = 20.000.000 × 1,6.'],
        temuan: 'M₅ Koperasi A = Rp32.000.000.',
      },
      {
        label: 'Bank B tahun ke-5: M₅ = 20.000.000 × 1,1⁵ = …',
        jawab: 32210200,
        cek: { jenis: 'majemuk', M0: 20000000, i: 0.1, n: 5 },
        hints: ['1,1⁵ = 1,61051.', 'M₅ = 20.000.000 × 1,61051.'],
        temuan:
          'M₅ Bank B = Rp32.210.200 — kini Bank B unggul Rp210.200. Rumus membuktikan hasil duel!',
      },
    ],
    rangkuman: [
      'Bunga tunggal: bunga tetap setiap periode, saldo barisan aritmetika, Mₙ = M₀(1 + n × i).',
      'Bunga majemuk: bunga berbunga, saldo barisan geometri, Mₙ = M₀(1 + i)ⁿ.',
      'Persen yang lebih besar belum tentu lebih menguntungkan: bunga majemuk bisa menyalip bila jangka waktunya cukup panjang.',
      'Bandingkan tawaran dengan menghitung Mₙ keduanya untuk n yang sama.',
    ],
    nextLabel: 'Latihan Masalah Keuangan →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — LATIHAN MASALAH KEUANGAN KONTEKSTUAL  (sintaks 3)
     Campuran isian ('input') dan pilihan ganda ('choice').
     `cek`/`tawaran` = metadata untuk tes kunci jawaban (tests/).
     ---------------------------------------------------------- */
  latih: {
    kicker: 'Tahap 5 · Latihan Masalah',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menyelesaikan masalah keuangan kontekstual yang melibatkan bunga tunggal dan bunga majemuk.',
    guru: 'Biasakan murid menulis "jenis bunga, M₀, i, n" sebelum menghitung. Untuk soal pinjaman, tegaskan bahwa yang dicari adalah total bayar TERKECIL. Soal yang paling banyak salah dibahas bersama.',
    instruksi:
      'Tentukan dulu jenis bunganya (tunggal atau majemuk), tulis M₀, i, dan n, lalu pilih rumus yang tepat. Tulis jawaban rupiah tanpa "Rp", boleh dengan titik pemisah ribuan.',
    soal: [
      {
        type: 'input',
        cerita:
          'Dika menabung Rp5.000.000 di koperasi sekolah dengan bunga tunggal 6% per tahun untuk membeli monitor kedua.',
        pertanyaan: 'Berapa rupiah total bunga yang diterima Dika setelah 4 tahun?',
        jawab: 1200000,
        cek: { jenis: 'bungaTunggal', M0: 5000000, i: 0.06, n: 4 },
        hints: ['Bunga tunggal: total bunga = M₀ × i × n.', '5.000.000 × 0,06 × 4 = 300.000 × 4.'],
        explanation: 'Total bunga = 5.000.000 × 0,06 × 4 = Rp1.200.000.',
        reveal: 'Bunga = 5.000.000 × 0,06 × 4 = <strong>Rp1.200.000</strong>.',
      },
      {
        type: 'input',
        cerita:
          'Sinta menyimpan honor proyek website Rp8.000.000 di bank dengan bunga majemuk 5% per tahun.',
        pertanyaan: 'Berapa rupiah saldo Sinta setelah 3 tahun?',
        jawab: 9261000,
        cek: { jenis: 'majemuk', M0: 8000000, i: 0.05, n: 3 },
        hints: ['Bunga majemuk: Mₙ = M₀(1 + i)ⁿ.', '1,05³ = 1,157625; M₃ = 8.000.000 × 1,157625.'],
        explanation: 'M₃ = 8.000.000 × 1,05³ = 8.000.000 × 1,157625 = Rp9.261.000.',
        reveal: 'M₃ = 8.000.000 × 1,05³ = <strong>Rp9.261.000</strong>.',
      },
      {
        type: 'input',
        cerita:
          'Rp10.000.000 disimpan selama 3 tahun dengan suku bunga 8% per tahun. Bayu membandingkan jika bunganya tunggal dan jika bunganya majemuk.',
        pertanyaan: 'Berapa rupiah selisih saldo akhir kedua cara itu?',
        jawab: 197120,
        cek: { jenis: 'selisih', M0: 10000000, iT: 0.08, iM: 0.08, n: 3 },
        hints: [
          'Tunggal: 10.000.000 × (1 + 3 × 0,08) = 12.400.000.',
          'Majemuk: 10.000.000 × 1,08³ = 10.000.000 × 1,259712. Lalu kurangkan.',
        ],
        explanation: 'Majemuk Rp12.597.120 − tunggal Rp12.400.000 = Rp197.120.',
        reveal: '12.597.120 − 12.400.000 = <strong>Rp197.120</strong> (majemuk lebih besar).',
      },
      {
        type: 'choice',
        cerita:
          'Rara akan menyimpan Rp15.000.000 selama 2 tahun. Tabungan X memberi bunga tunggal 9% per tahun; tabungan Y memberi bunga majemuk 8% per tahun.',
        pertanyaan: 'Tabungan mana yang memberi saldo akhir lebih besar?',
        tawaran: {
          tujuan: 'simpan',
          n: 2,
          list: [
            { id: 'X', jenis: 'tunggal', M0: 15000000, i: 0.09 },
            { id: 'Y', jenis: 'majemuk', M0: 15000000, i: 0.08 },
          ],
        },
        options: [
          { id: 'X', label: 'Tabungan X (tunggal 9%)' },
          { id: 'Y', label: 'Tabungan Y (majemuk 8%)' },
          { id: 'sama', label: 'Sama besar' },
          { id: 'kurang', label: 'Tidak bisa ditentukan tanpa tahu nama banknya' },
        ],
        correct: 'X',
        explanation:
          'X: 15.000.000 × (1 + 2 × 0,09) = Rp17.700.000. Y: 15.000.000 × 1,08² = Rp17.496.000. Untuk 2 tahun, X lebih besar Rp204.000 — jangka pendek belum cukup bagi bunga majemuk untuk menyalip.',
      },
      {
        type: 'choice',
        cerita:
          'Raka meminjam Rp6.000.000 untuk membeli laptop pemrograman dan melunasinya sekaligus setelah 3 tahun. Pinjaman P memakai bunga tunggal 11% per tahun; pinjaman Q memakai bunga majemuk 10% per tahun.',
        pertanyaan: 'Pinjaman mana yang lebih ringan (total pelunasan lebih kecil)?',
        tawaran: {
          tujuan: 'pinjam',
          n: 3,
          list: [
            { id: 'P', jenis: 'tunggal', M0: 6000000, i: 0.11 },
            { id: 'Q', jenis: 'majemuk', M0: 6000000, i: 0.1 },
          ],
        },
        options: [
          { id: 'P', label: 'Pinjaman P (tunggal 11%)' },
          { id: 'Q', label: 'Pinjaman Q (majemuk 10%)' },
          { id: 'sama', label: 'Sama besar' },
          { id: 'persen', label: 'Pasti Q, karena persennya lebih kecil' },
        ],
        correct: 'P',
        explanation:
          'P: 6.000.000 × (1 + 3 × 0,11) = Rp7.980.000. Q: 6.000.000 × 1,1³ = Rp7.986.000. Untuk peminjam yang dicari total TERKECIL, jadi P lebih ringan Rp6.000 walaupun persennya lebih besar.',
      },
      {
        type: 'input',
        cerita:
          'Nabila menyimpan Rp4.000.000 dengan bunga majemuk 8% per tahun yang dihitung setiap semester (2 kali setahun).',
        pertanyaan: 'Berapa rupiah saldo Nabila setelah 1 tahun?',
        jawab: 4326400,
        cek: { jenis: 'majemuk', M0: 4000000, i: 0.04, n: 2 },
        hints: [
          'Per semester: i = 8% : 2 = 4% = 0,04, dan n = 1 × 2 = 2 periode.',
          'M₂ = 4.000.000 × 1,04² = 4.000.000 × 1,0816.',
        ],
        explanation: 'i = 0,04, n = 2: M₂ = 4.000.000 × 1,0816 = Rp4.326.400.',
        reveal: 'M₂ = 4.000.000 × 1,04² = <strong>Rp4.326.400</strong>.',
      },
      {
        type: 'choice',
        cerita:
          'Rp10.000.000 disimpan selama 1 tahun dengan suku bunga 6% per tahun, sekali dengan bunga tunggal dan sekali dengan bunga majemuk tahunan.',
        pertanyaan: 'Pernyataan mana yang benar?',
        options: [
          { id: 'sama', label: 'Saldo keduanya sama, yaitu Rp10.600.000' },
          { id: 'majemuk', label: 'Saldo bunga majemuk lebih besar Rp36.000' },
          { id: 'tunggal', label: 'Saldo bunga tunggal lebih besar karena dihitung dari modal' },
          { id: 'kuadrat', label: 'Saldo bunga majemuk Rp11.236.000' },
        ],
        correct: 'sama',
        explanation:
          'Pada periode pertama, bunga majemuk dan tunggal sama-sama M₀ × i = Rp600.000, jadi saldo keduanya Rp10.600.000. (Rp36.000 adalah selisih pada tahun ke-2; Rp11.236.000 adalah saldo majemuk tahun ke-2.)',
      },
      {
        type: 'input',
        cerita:
          'Kevin menyimpan Rp10.000.000 dengan bunga majemuk 5% per tahun untuk biaya sertifikasi cloud.',
        pertanyaan: 'Berapa rupiah total bunga yang ia peroleh setelah 2 tahun?',
        jawab: 1025000,
        cek: { jenis: 'bungaMajemuk', M0: 10000000, i: 0.05, n: 2 },
        hints: [
          'Total bunga majemuk = Mₙ − M₀.',
          'M₂ = 10.000.000 × 1,05² = 11.025.000; kurangi modal awal.',
        ],
        explanation:
          'M₂ = 10.000.000 × 1,1025 = 11.025.000, bunga = 11.025.000 − 10.000.000 = Rp1.025.000.',
        reveal: 'Bunga = 11.025.000 − 10.000.000 = <strong>Rp1.025.000</strong>.',
      },
      {
        type: 'input',
        cerita:
          'Lutfi menyimpan Rp5.000.000 dengan bunga tunggal 8% per tahun. Ia ingin saldonya menjadi Rp7.000.000 untuk membeli kamera konten.',
        pertanyaan: 'Setelah berapa tahun saldonya tepat Rp7.000.000?',
        jawab: 5,
        cek: { jenis: 'nTunggal', M0: 5000000, i: 0.08, target: 7000000 },
        hints: [
          'Bunga yang dibutuhkan: 7.000.000 − 5.000.000 = 2.000.000.',
          'Bunga per tahun 5.000.000 × 0,08 = 400.000. Berapa tahun agar terkumpul 2.000.000?',
        ],
        explanation: '2.000.000 : 400.000 = 5 tahun.',
        reveal: 'n = (7.000.000 − 5.000.000) : (5.000.000 × 0,08) = <strong>5</strong> tahun.',
      },
    ],
    nextLabel: 'Susun Rekomendasi untuk Kodekita →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGEMBANGKAN & MENYAJIKAN HASIL KARYA  (sintaks 4)
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 6 · Sajikan Hasil',
    syntax: PBL + ' · Sintaks 4',
    goal: 'Menjawab masalah tim Kodekita dengan perhitungan dan menyajikan rekomendasi kelompok.',
    guru: 'Beri waktu tiap kelompok 2 menit untuk mempresentasikan poster. Minta kelompok lain bertanya: "Bagaimana jika dana dipakai 4 tahun lagi?" atau "Bagaimana jika uangnya pinjaman?" Hargai kelompok yang jujur mengakui dugaan awalnya meleset.',
    judulA: 'A. Hitung saldo untuk kedua rencana',
    hitung: [
      {
        label: 'Koperasi A, 3 tahun: M₃ = 20.000.000 × (1 + 3 × 0,12) = …',
        jawab: 27200000,
        cek: { jenis: 'tunggal', M0: 20000000, i: 0.12, n: 3 },
        hints: ['1 + 3 × 0,12 = 1,36.', 'M₃ = 20.000.000 × 1,36.'],
        temuan: 'M₃ Koperasi A = Rp27.200.000.',
      },
      {
        label: 'Bank B, 3 tahun: M₃ = 20.000.000 × 1,1³ = …',
        jawab: 26620000,
        cek: { jenis: 'majemuk', M0: 20000000, i: 0.1, n: 3 },
        hints: ['1,1³ = 1,331.', 'M₃ = 20.000.000 × 1,331.'],
        temuan: 'M₃ Bank B = Rp26.620.000 — untuk 3 tahun, Koperasi A unggul Rp580.000.',
      },
      {
        label: 'Koperasi A, 6 tahun: M₆ = 20.000.000 × (1 + 6 × 0,12) = …',
        jawab: 34400000,
        cek: { jenis: 'tunggal', M0: 20000000, i: 0.12, n: 6 },
        hints: ['1 + 6 × 0,12 = 1,72.', 'M₆ = 20.000.000 × 1,72.'],
        temuan: 'M₆ Koperasi A = Rp34.400.000.',
      },
      {
        label: 'Bank B, 6 tahun: M₆ = 20.000.000 × 1,1⁶ = …',
        jawab: 35431220,
        cek: { jenis: 'majemuk', M0: 20000000, i: 0.1, n: 6 },
        hints: ['1,1⁶ = 1,771561.', 'M₆ = 20.000.000 × 1,771561.'],
        temuan: 'M₆ Bank B = Rp35.431.220 — untuk 6 tahun, Bank B unggul Rp1.031.220.',
      },
    ],
    judulB: 'B. Putuskan untuk setiap rencana',
    rekomPendek: {
      id: 'pendek',
      tanya: 'Jika dana dipakai 3 tahun lagi, tim Kodekita sebaiknya menyimpan di …',
      opsi: [
        { id: 'A', label: 'Koperasi A (bunga tunggal 12%)' },
        { id: 'B', label: 'Bank B (bunga majemuk 10%)' },
        { id: 'sama', label: 'Mana saja, hasilnya sama' },
      ],
      correct: 'A',
      umpan: {
        A: '<strong>Tepat.</strong> Rp27.200.000 > Rp26.620.000 — untuk jangka pendek, bunga tunggal 12% lebih untung.',
        B: 'Lihat hasil hitunganmu: untuk 3 tahun, Bank B baru Rp26.620.000.',
        sama: 'Selisihnya Rp580.000. Bandingkan lagi M₃ keduanya.',
      },
    },
    rekomPanjang: {
      id: 'panjang',
      tanya: 'Jika dana dipakai 6 tahun lagi, tim Kodekita sebaiknya menyimpan di …',
      opsi: [
        { id: 'B', label: 'Bank B (bunga majemuk 10%)' },
        { id: 'A', label: 'Koperasi A (bunga tunggal 12%)' },
        { id: 'sama', label: 'Mana saja, hasilnya sama' },
      ],
      correct: 'B',
      umpan: {
        B: '<strong>Tepat.</strong> Rp35.431.220 > Rp34.400.000 — bunga berbunga menang dalam jangka panjang.',
        A: 'Lihat hasil hitunganmu: untuk 6 tahun, Koperasi A hanya Rp34.400.000.',
        sama: 'Selisihnya lebih dari satu juta rupiah. Bandingkan lagi M₆ keduanya.',
      },
    },
    judulC: 'C. Rekomendasi kelompok',
    rekomendasi: {
      id: 'rekom',
      tanya: 'Rekomendasi paling tepat untuk tim Kodekita adalah …',
      opsi: [
        {
          id: 'tergantung',
          label:
            'Pilih Koperasi A jika dana dipakai dalam 4 tahun atau kurang; pilih Bank B jika disimpan 5 tahun atau lebih',
        },
        { id: 'selaluA', label: 'Selalu pilih Koperasi A karena 12% lebih besar dari 10%' },
        { id: 'selaluB', label: 'Selalu pilih Bank B karena bunga majemuk selalu lebih untung' },
        { id: 'sama', label: 'Pilih yang mana saja karena selisihnya kecil' },
      ],
      correct: 'tergantung',
      umpan: {
        tergantung:
          '<strong>Rekomendasi berbasis bukti!</strong> Jawabannya bergantung pada lama menyimpan, dan perhitungan Mₙ membuktikannya.',
        selaluA: 'Untuk 6 tahun, Koperasi A kalah Rp1.031.220. Persen besar belum tentu untung.',
        selaluB: 'Untuk 3 tahun, Bank B justru kalah Rp580.000. Lihat lagi hasil hitunganmu.',
        sama: 'Selisihnya bisa lebih dari satu juta rupiah — cukup untuk membeli lisensi software!',
      },
    },
    pesanLabel: 'Tulis pesan singkat kelompokmu untuk tim Kodekita (akan tampil di poster):',
    pesanPlaceholder: 'Contoh: Tentukan dulu kapan dana dipakai. Jika …',
    posterJudul: 'Rekomendasi untuk Tim Kodekita',
    posterFooter: 'Disusun dengan Mₙ = M₀(1 + n × i) dan Mₙ = M₀(1 + i)ⁿ.',
    nextLabel: 'Evaluasi Proses →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENGANALISIS & MENGEVALUASI PROSES  (sintaks 5)
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 7 · Evaluasi Proses',
    syntax: PBL + ' · Sintaks 5',
    goal: 'Mengevaluasi cara berpikir, membandingkan dugaan awal dengan hasil, dan menguji pemahaman pada masalah baru.',
    guru: 'Bahas pendapat yang keliru sebagai miskonsepsi yang wajar, terutama "majemuk selalu lebih untung". Minta murid yang dugaannya meleset menjelaskan apa yang mengubah pikirannya.',
    judulA: 'A. Nilai pendapat teman',
    instruksiA:
      'Beberapa murid kelas lain menulis pendapat berikut. Apakah pendapat mereka tepat atau keliru?',
    pendapatOpsi: [
      { id: 'tepat', label: 'Tepat' },
      { id: 'keliru', label: 'Keliru' },
    ],
    pendapat: [
      {
        id: 'e1',
        teks: 'Rani: “Bunga majemuk selalu lebih menguntungkan penabung daripada bunga tunggal.”',
        correct: 'keliru',
        explanation:
          'Bergantung pada suku bunga dan jangka waktu. Kodekita: Koperasi A (tunggal 12%) unggul sampai tahun ke-4.',
      },
      {
        id: 'e2',
        teks: 'Bima: “Jika suku bunga dan modalnya sama, saldo bunga majemuk tidak pernah lebih kecil daripada bunga tunggal.”',
        correct: 'tepat',
        explanation:
          'Periode pertama sama besar; sesudahnya bunga majemuk dihitung dari saldo yang lebih besar, jadi selalu lebih besar.',
      },
      {
        id: 'e3',
        teks: 'Tono: “Untuk meminjam, pilih saja bunga majemuk karena persennya lebih kecil.”',
        correct: 'keliru',
        explanation:
          'Peminjam mencari total bayar terkecil. Pinjaman Raka: tunggal 11% (Rp7.980.000) lebih ringan daripada majemuk 10% (Rp7.986.000).',
      },
      {
        id: 'e4',
        teks: 'Sari: “Bunga tunggal 12% selama 5 tahun berarti total bunganya 60% dari modal.”',
        correct: 'tepat',
        explanation: 'Bunga tunggal = M₀ × i × n = M₀ × 0,12 × 5 = 0,6 × M₀.',
      },
      {
        id: 'e5',
        teks: 'Dewi: “Bunga majemuk 10% selama 5 tahun berarti total bunganya 50% dari modal.”',
        correct: 'keliru',
        explanation:
          '1,1⁵ − 1 = 0,61051, jadi total bunganya ±61% dari modal — lebih dari 50% karena bunga berbunga.',
      },
    ],
    judulB: 'B. Dugaan awalmu vs hasil perhitungan',
    judulC: 'C. Masalah baru',
    transfer: {
      label:
        'Startup Kodekita meminjam Rp10.000.000 untuk menyewa server dan melunasinya sekaligus setelah 3 tahun. Koperasi menawarkan bunga tunggal 10% per tahun; bank menawarkan bunga majemuk 8% per tahun. Berapa rupiah yang dihemat jika memilih pinjaman yang total pelunasannya lebih kecil?',
      jawab: 402880,
      cek: { jenis: 'selisih', M0: 10000000, iT: 0.1, iM: 0.08, n: 3 },
      hints: [
        'Tunggal: 10.000.000 × (1 + 3 × 0,1) = 13.000.000.',
        'Majemuk: 10.000.000 × 1,08³ = 12.597.120. Pilih yang lebih kecil, lalu hitung selisihnya.',
      ],
      bukti:
        'Pinjaman bank (majemuk 8%) Rp12.597.120 lebih ringan daripada koperasi Rp13.000.000. Hemat Rp402.880.',
    },
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses membandingkan bunga tunggal dan bunga majemuk serta memakainya untuk mengambil keputusan.',
    guru: 'Baca jawaban refleksi secara acak. Murid yang memilih "perlu bantuan" didampingi pada pertemuan berikutnya, terutama saat memilih rumus Mₙ yang tepat.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri perbedaan bunga tunggal dan bunga majemuk.',
        placeholder: 'Pada bunga tunggal, bunganya dihitung dari … sedangkan pada bunga majemuk …',
      },
      {
        id: 'r2',
        teks: 'Langkah apa yang akan kamu lakukan sebelum memilih tabungan atau pinjaman di dunia nyata?',
        placeholder: 'Aku akan menghitung dulu …',
      },
      {
        id: 'r3',
        teks: 'Apa yang paling mengejutkanmu dari masalah tim Kodekita?',
        placeholder: 'Aku kaget ternyata …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu dapat membandingkan bunga tunggal dan bunga majemuk pada masalah keuangan sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '🙂 Yakin — aku bisa memakai kedua rumusnya' },
      { id: 'ragu', label: '🤔 Masih ragu memilih rumus yang tepat' },
      { id: 'bantuan', label: '🙋 Aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Keren, masalah tim Kodekita terpecahkan!',
    teks: 'Kamu membandingkan bunga tunggal dan bunga majemuk, menemukan bahwa persen yang lebih besar belum tentu lebih untung, dan memakai perhitungan untuk mengambil keputusan keuangan.',
    capaian: [
      'Menjelaskan perbedaan cara kerja bunga tunggal (bunga tetap) dan bunga majemuk (bunga berbunga).',
      'Mengaitkan saldo bunga tunggal dengan barisan aritmetika dan saldo bunga majemuk dengan barisan geometri.',
      'Menentukan kapan bunga majemuk menyalip bunga tunggal dan menjelaskan sebabnya.',
      'Menyelesaikan masalah tabungan dan pinjaman yang melibatkan kedua jenis bunga.',
      'Menyajikan rekomendasi keuangan yang didukung perhitungan.',
    ],
  },
};
