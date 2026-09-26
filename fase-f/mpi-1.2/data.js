'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Rumus Suku ke-n Barisan Aritmetika
   Fase F — SMK Rekayasa Perangkat Lunak (Kelas XI)

   Tujuan Pembelajaran:
   Menentukan rumus suku ke-n barisan aritmetika dan menggunakannya
   untuk menyelesaikan masalah kontekstual sederhana.

   Prasyarat: fase-f/mpi-1.1 (konsep barisan aritmetika & beda).

   Gagasan kunci yang dibangun di seluruh modul:
     • menuju suku ke-n, beda ditambahkan ke suku pertama sebanyak
       (n − 1) kali → Uₙ = a + (n − 1)b;
     • bentuk sederhana Uₙ = bn + (a − b): koefisien n SELALU beda;
       rumus bisa dicek dengan n = 1 (harus menghasilkan U₁);
     • bila yang diketahui dua suku tak berurutan: b = (Uₙ − Uₘ)/(n − m),
       lalu a = Uₘ − (m − 1)b;
     • "suku keberapa bernilai x?" → selesaikan x = a + (n − 1)b;
     • rumus = fungsi: suku(n) dalam JavaScript;
     • miskonsepsi yang dilawan: Uₙ = a + nb, a dan b tertukar,
       (n + 1) kali beda, tanda beda pada barisan turun, dan jawaban
       n yang bukan bilangan asli.

   Model pembelajaran: COOPERATIVE LEARNING tipe NUMBERED HEADS
   TOGETHER (NHT) dalam sintaks Arends, dengan skor tim ala STAD.
   Pemetaan sintaks ke tahap media:

     Fase 1 — Menyampaikan tujuan & memotivasi ....... 'tujuan'
     Fase 2 — Menyajikan informasi .................... 'informasi'
     Fase 3 — Mengorganisasikan murid ke kelompok
              (penomoran kepala NHT) .................. 'tim'
     Fase 4 — Membimbing kelompok bekerja & belajar
              (berpikir bersama → panggil nomor) ...... 'misiRumus',
                                                         'misiDuaSuku',
                                                         'misiKonteks'
     Fase 5 — Evaluasi (individu) ..................... 'kuis'
     Fase 6 — Memberikan penghargaan .................. 'penghargaan'
     Penutup .......................................... 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 45 menit, tim heterogen 3–4 murid,
   satu perangkat per tim; kuis dikerjakan per murid):
     1. Tujuan      (7')  — "Lab Komputer Baru": baris 1 berisi 8 PC,
                            tiap baris bertambah 4. Murid MENDUGA banyak
                            PC di baris ke-25 dan cara tercepatnya
                            (tidak dinilai; dicek di tahap 2).
     2. Informasi   (15') — tabel pola U₁ = 8 + 0 × 4, U₂ = 8 + 1 × 4, …
                            → Uₙ = 8 + (n − 1) × 4; pertanyaan penuntun
                            → rumus umum, bentuk sederhana, fungsi JS,
                            cek dugaan.
     3. Tim         (5')  — nama tim, anggota, kesepakatan; NOMOR KEPALA
                            1–4 dibagikan acak.
     4. Misi 1      (15') — "Rakit Rumus": empat barisan (naik, turun,
                            negatif, desimal). Pilih a → isi b → isi
                            Uₙ = [ ]n + [ ] (diagnosa miskonsepsi) →
                            pilih isi fungsi suku(n). Panggil Nomor.
     5. Misi 2      (12') — "Dua Suku Diketahui": tiga log dengan Uₘ dan
                            Uₙ tak berurutan → b → a → rumus → suku
                            keberapa bernilai x. Panggil Nomor.
     6. Misi 3      (15') — "Masalah Kontekstual": empat masalah RPL
                            (langganan cloud, kursi lab, XP game, kuota).
                            Pilih a & b → rumus → jawaban → makna.
                            Panggil Nomor + catatan tim.
     7. Kuis        (10') — kuis individu: enam soal diambil acak dari
                            bank sepuluh soal.
     8. Penghargaan (3')  — poin tim (50% misi + 50% kuis) → predikat.
     9. Refleksi    (5')  — refleksi konsep & kerja sama, penilaian diri.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar". app.js mengacaknya SEKALI saat state disiapkan
   (ensureShuffledOrder / shuffleArray dari shared/engine.js), sehingga
   tiap tim dan tiap Reset mendapat urutan berbeda — termasuk dugaan,
   penuntun, suku pertama, kode JS, pasangan a & b, makna, soal kuis
   yang terpilih beserta opsinya, dan penilaian diri. Nomor kepala dan
   nomor yang dipanggil juga diacak.

   Konsistensi kunci jawaban diuji tests/mpi-f-1.2-data.test.js terhadap
   engine seksi 40 (rumusSuku, suku1DanBeda, nomorSukuDari, …).
   ============================================================ */

var CL = 'Cooperative Learning (NHT)';

var DATA = {
  meta: {
    title: 'Rumus Suku ke-n Barisan Aritmetika',
    goal: 'Menentukan rumus suku ke-n barisan aritmetika dan menggunakannya untuk menyelesaikan masalah kontekstual sederhana.',
  },

  /* Urutan & label tahap (dipakai app.js dan dicek terhadap manifest). */
  tahap: [
    { id: 'tujuan', label: 'Tujuan' },
    { id: 'informasi', label: 'Informasi' },
    { id: 'tim', label: 'Tim & Nomor' },
    { id: 'misiRumus', label: 'Misi 1' },
    { id: 'misiDuaSuku', label: 'Misi 2' },
    { id: 'misiKonteks', label: 'Misi 3' },
    { id: 'kuis', label: 'Kuis' },
    { id: 'penghargaan', label: 'Penghargaan' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — TUJUAN & MOTIVASI
     Dugaan TIDAK dinilai; dicek kembali di tahap Informasi.
     ---------------------------------------------------------- */
  tujuan: {
    kicker: 'Tahap 1 · Tujuan & Motivasi',
    syntax: CL + ' · Fase 1',
    goal: 'Mengenali masalah "suku yang jauh" dan mengetahui tujuan pembelajaran hari ini.',
    guru: 'Tayangkan denah lab. Tanyakan: "Kalau kita harus tahu baris ke-25, apakah harus menggambar 25 baris?" Biarkan murid menduga tanpa menghitung rinci; jangan membenarkan dugaan — jawabannya ditemukan bersama pada tahap Informasi.',
    judul: 'Lab Komputer Baru',
    cerita:
      'Sekolah membangun lab komputer bertingkat untuk jurusan RPL. Baris pertama berisi 8 PC, dan setiap baris di belakangnya selalu bertambah 4 PC. Teknisi ingin memesan kabel LAN untuk baris ke-25 — berapa PC yang ada di baris itu?',
    barisan: [8, 12, 16, 20],
    labelBaris: 'Baris',
    dugaan: [
      {
        id: 'u25',
        tanya: 'Dugaanmu: berapa PC di baris ke-25?',
        opsi: [
          { id: 'o104', label: '104 PC' },
          { id: 'o108', label: '108 PC' },
          { id: 'o100', label: '100 PC' },
          { id: 'o200', label: '200 PC' },
        ],
      },
      {
        id: 'cara',
        tanya: 'Menurutmu, cara paling efisien untuk menjawabnya adalah …',
        opsi: [
          { id: 'rumus', label: 'Menemukan aturan (rumus) yang langsung memberi baris ke-n' },
          { id: 'tulis', label: 'Menuliskan banyak PC baris demi baris sampai baris ke-25' },
          { id: 'kali', label: 'Mengalikan 25 × 8 karena baris pertama berisi 8 PC' },
          { id: 'tebak', label: 'Menebak angka yang kira-kira masuk akal' },
        ],
      },
    ],
    kunciDugaan: { u25: 'o104', cara: 'rumus' },
    alasanLabel: 'Tulis cara yang kamu pikirkan:',
    alasanPlaceholder: 'Contoh: dari baris 1 ke baris 25, angka 4 ditambahkan …',
    catatan: 'Dugaanmu tidak dinilai. Kalian akan mengeceknya sendiri di tahap berikutnya.',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Menentukan rumus suku ke-n barisan aritmetika dan menggunakannya untuk menyelesaikan masalah kontekstual sederhana.',
    kriteria: [
      'Menyusun rumus Uₙ = a + (n − 1)b dan menyederhanakannya menjadi Uₙ = bn + (a − b).',
      'Menentukan rumus suku ke-n dari barisan maupun dari dua suku yang diketahui.',
      'Menggunakan rumus untuk menghitung suku tertentu dan menentukan suku keberapa bernilai tertentu.',
      'Menjelaskan jawaban tim dengan kata-kata sendiri saat nomornya dipanggil.',
    ],
    nextLabel: 'Lanjut: Temukan Rumusnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENYAJIKAN INFORMASI
     Tabel pola (a = 8, b = 4) → pertanyaan penuntun → rumus.
     ---------------------------------------------------------- */
  informasi: {
    kicker: 'Tahap 2 · Menyajikan Informasi',
    syntax: CL + ' · Fase 2',
    goal: 'Menemukan rumus Uₙ = a + (n − 1)b dari pola banyaknya beda yang ditambahkan.',
    guru: 'Kerjakan tabel pola bersama secara klasikal (murid masih duduk bebas). Tekankan kata kunci: "beda ditambahkan sebanyak (n − 1) kali". Setelah rumus muncul, tunjukkan bahwa rumus adalah fungsi — di RPL kita menuliskannya sebagai function suku(n).',
    a: 8,
    b: 4,
    barisPola: 4,
    pengantar:
      'Baris 1 berisi 8 PC. Untuk sampai ke baris berikutnya, tambahkan 4. Isi tabel: berapa kali angka 4 ditambahkan ke 8 untuk mendapatkan setiap baris? Pada baris terakhir tuliskan bentuk umumnya untuk baris ke-n (petunjuk: pakai huruf n).',
    penuntun: [
      {
        id: 'p1',
        tanya: 'Untuk mendapatkan U₂₅ (baris ke-25), berapa kali beda 4 ditambahkan ke 8?',
        opsi: [
          { id: 'p24', label: '24 kali' },
          { id: 'p25', label: '25 kali' },
          { id: 'p26', label: '26 kali' },
          { id: 'p4', label: '4 kali' },
        ],
        correct: 'p24',
        umpan: {
          p24: 'Benar! Pola tabel: Uₖ mendapat (k − 1) kali beda. Jadi U₂₅ = 8 + 24 × 4 = 104.',
          p25: 'Hampir. Lihat tabel: U₂ mendapat 1 kali beda, U₃ mendapat 2 kali. Jadi U₂₅ mendapat …',
          p26: 'Terlalu banyak. U₁ sendiri belum mendapat tambahan beda sama sekali (0 kali).',
          p4: '4 adalah besar bedanya, bukan banyaknya penambahan. Hitung banyaknya "langkah" dari baris 1 ke baris 25.',
        },
      },
      {
        id: 'p2',
        tanya: 'Jika suku pertama a dan beda b, rumus suku ke-n adalah …',
        opsi: [
          { id: 'umum', label: 'Uₙ = a + (n − 1)b' },
          { id: 'anb', label: 'Uₙ = a + nb' },
          { id: 'ab', label: 'Uₙ = a × b × n' },
          { id: 'nplus', label: 'Uₙ = a + (n + 1)b' },
        ],
        correct: 'umum',
        umpan: {
          umum: 'Tepat! Suku pertama a, lalu beda b ditambahkan sebanyak (n − 1) kali.',
          anb: 'Coba cek dengan n = 1: a + 1·b = a + b, padahal U₁ = a. Beda baru ditambahkan (n − 1) kali.',
          ab: 'Barisan aritmetika dibentuk dengan MENAMBAHKAN beda, bukan mengalikan.',
          nplus:
            'Cek dengan n = 1: hasilnya a + 2b, bukan a. Banyaknya penambahan beda adalah (n − 1).',
        },
      },
      {
        id: 'p3',
        tanya: 'Bentuk sederhana dari Uₙ = 8 + (n − 1) × 4 adalah …',
        opsi: [
          { id: 's44', label: 'Uₙ = 4n + 4' },
          { id: 's48', label: 'Uₙ = 4n + 8' },
          { id: 's84', label: 'Uₙ = 8n + 4' },
          { id: 's4m', label: 'Uₙ = 4n − 4' },
        ],
        correct: 's44',
        umpan: {
          s44: 'Benar! 8 + 4n − 4 = 4n + 4. Cek: n = 1 → 8 ✓, n = 25 → 104 ✓.',
          s48: 'Jangan lupa mengalikan −1 dengan 4: 8 + (n − 1) × 4 = 8 + 4n − 4.',
          s84: 'Koefisien n berasal dari beda (4), bukan dari suku pertama.',
          s4m: 'Periksa tandanya: 8 − 4 = +4, bukan −4. Cek dengan n = 1: 4 − 4 = 0 ≠ 8.',
        },
      },
      {
        id: 'p4',
        tanya: 'Pada bentuk sederhana Uₙ = bn + (a − b), koefisien n selalu sama dengan …',
        opsi: [
          { id: 'beda', label: 'beda barisan (b)' },
          { id: 'a', label: 'suku pertama (a)' },
          { id: 'n', label: 'nomor suku (n)' },
          { id: 'amb', label: 'a − b' },
        ],
        correct: 'beda',
        umpan: {
          beda: 'Tepat! Itu sebabnya barisan naik punya koefisien positif dan barisan turun koefisien negatif.',
          a: 'Suku pertama "bersembunyi" di konstanta a − b, bukan pada koefisien n.',
          n: 'n adalah variabelnya. Yang dikalikan dengan n adalah beda.',
          amb: 'a − b adalah konstanta (bilangan tanpa n).',
        },
      },
    ],
    aturanJudul: 'Rumus suku ke-n barisan aritmetika',
    aturan: [
      'Uₙ = a + (n − 1)b, dengan a = suku pertama, b = beda, n = nomor suku.',
      'Bentuk sederhana: Uₙ = bn + (a − b) — koefisien n adalah beda.',
      'Selalu cek rumus dengan n = 1 (hasilnya harus U₁) dan n = 2.',
      'Suku keberapa bernilai x? Selesaikan persamaan x = a + (n − 1)b; n harus bilangan asli.',
    ],
    kodeJudul: 'Rumus = fungsi',
    kode: 'function suku(n) {\n  return 4 * n + 4; // Uₙ = 4n + 4\n}\n\nsuku(25); // 104',
    dugaanJudul: 'Cek dugaanmu di awal',
    nextLabel: 'Lanjut: Bentuk Tim →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MENGORGANISASIKAN KELOMPOK (NHT)
     ---------------------------------------------------------- */
  tim: {
    kicker: 'Tahap 3 · Bentuk Tim & Nomor Kepala',
    syntax: CL + ' · Fase 3',
    goal: 'Membentuk tim heterogen, menyepakati aturan kerja, dan menerima nomor kepala.',
    guru: 'Bentuk tim 3–4 murid dengan kemampuan beragam. Jelaskan aturan NHT: setiap misi dikerjakan bersama sampai SEMUA anggota paham, karena media akan memanggil satu nomor secara acak untuk menjelaskan. Guru dapat mengonfirmasi penjelasan di centang "sudah menjelaskan".',
    namaTimLabel: 'Nama tim',
    namaTimPlaceholder: 'Contoh: Tim Array',
    anggotaLabel: 'Nama anggota',
    minAnggota: 3,
    maksAnggota: 4,
    kesepakatanJudul: 'Kesepakatan tim',
    kesepakatan: [
      { id: 'paham', teks: 'Kami memastikan SETIAP anggota paham sebelum menekan Periksa.' },
      { id: 'jelas', teks: 'Siapa pun yang nomornya dipanggil siap menjelaskan jawaban tim.' },
      { id: 'hormat', teks: 'Kami saling mendengarkan dan membantu, bukan saling menyalahkan.' },
    ],
    acakLabel: '🎲 Bagikan Nomor Kepala',
    acakUlangLabel: '🎲 Acak Ulang Nomor',
    nomorJudul: 'Nomor kepala tim kalian',
    nomorCatatan:
      'Ingat nomormu! Di akhir setiap misi, satu nomor dipanggil acak untuk menjelaskan.',
    nextLabel: 'Mulai Misi 1 →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MISI 1: RAKIT RUMUS
     ---------------------------------------------------------- */
  misiRumus: {
    kicker: 'Tahap 4 · Misi 1: Rakit Rumus',
    syntax: CL + ' · Fase 4',
    goal: 'Menentukan suku pertama, beda, dan rumus suku ke-n dari sebuah barisan.',
    guru: 'Berkeliling dan dengarkan diskusi. Bila tim salah pada rumus, arahkan untuk mengecek dengan n = 1 alih-alih memberi jawaban. Setelah keempat barisan selesai, pastikan penjelasan anggota yang dipanggil dikonfirmasi.',
    langkah: [
      'Pilih suku pertama a.',
      'Hitung beda b.',
      'Tulis rumus dalam bentuk Uₙ = bn + (a − b).',
      'Pilih isi fungsi suku(n) yang sesuai dengan rumus.',
    ],
    soal: [
      {
        id: 'r1',
        ikon: '🎫',
        judul: 'Nomor tiket helpdesk yang dilayani petugas A',
        terms: [7, 12, 17, 22, 27],
      },
      {
        id: 'r2',
        ikon: '📦',
        judul: 'Sisa slot unggah (upload) setelah setiap batch',
        terms: [60, 53, 46, 39, 32],
      },
      {
        id: 'r3',
        ikon: '❄️',
        judul: 'Suhu ruang pendingin server (°C) setiap 10 menit setelah dinyalakan ulang',
        terms: [-9, -5, -1, 3, 7],
      },
      {
        id: 'r4',
        ikon: '⏱️',
        judul: 'Waktu render video (detik) untuk 1, 2, 3, … klip',
        terms: [2.5, 3.25, 4, 4.75, 5.5],
      },
    ],
    nhtTugas:
      'Jelaskan bagaimana tim kalian mendapatkan konstanta pada rumus barisan sisa slot unggah (Uₙ = −7n + 67).',
    nextLabel: 'Lanjut ke Misi 2 →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MISI 2: DUA SUKU DIKETAHUI
     ---------------------------------------------------------- */
  misiDuaSuku: {
    kicker: 'Tahap 5 · Misi 2: Dua Suku Diketahui',
    syntax: CL + ' · Fase 4',
    goal: 'Menentukan rumus suku ke-n dari dua suku tak berurutan dan mencari suku keberapa yang bernilai tertentu.',
    guru: 'Bantu tim yang kesulitan dengan pertanyaan: "Dari U₃ ke U₈ ada berapa langkah beda?" Anggota yang dipanggil perlu menjelaskan mengapa pembaginya n − m.',
    langkah: [
      'Hitung beda: b = (Uₙ − Uₘ) : (n − m).',
      'Hitung suku pertama: a = Uₘ − (m − 1)b.',
      'Tulis rumus suku ke-n.',
      'Tentukan suku keberapa yang bernilai sesuai soal.',
    ],
    soal: [
      {
        id: 'd1',
        ikon: '🖥️',
        cerita:
          'Log server mencatat banyak request per detik yang naik secara tetap. Pada menit ke-3 tercatat 14 request, pada menit ke-8 tercatat 39 request.',
        m: 3,
        um: 14,
        n: 8,
        un: 39,
        target: 99,
        tanyaTarget: 'Pada menit keberapa tercatat 99 request?',
      },
      {
        id: 'd2',
        ikon: '🔋',
        cerita:
          'Baterai laptop saat proses kompilasi berkurang secara tetap. Pada jam ke-2 tersisa 47%, pada jam ke-6 tersisa 31%.',
        m: 2,
        um: 47,
        n: 6,
        un: 31,
        target: 3,
        tanyaTarget: 'Pada jam keberapa baterai tersisa 3%?',
      },
      {
        id: 'd3',
        ikon: '📶',
        cerita:
          'Waktu muat (loading) halaman bertambah secara tetap setiap kali gambar ditambahkan. Dengan 4 gambar, waktu muat 5 detik; dengan 10 gambar, 8 detik.',
        m: 4,
        um: 5,
        n: 10,
        un: 8,
        target: 13,
        tanyaTarget: 'Dengan berapa gambar waktu muatnya 13 detik?',
      },
    ],
    nhtTugas:
      'Jelaskan mengapa pada log server beda dihitung dengan (39 − 14) : (8 − 3), bukan (39 − 14) : 8.',
    nextLabel: 'Lanjut ke Misi 3 →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MISI 3: MASALAH KONTEKSTUAL
     jenis 'suku' → jawab = Uₙ; jenis 'nomor' → jawab = n.
     ---------------------------------------------------------- */
  misiKonteks: {
    kicker: 'Tahap 6 · Misi 3: Masalah Kontekstual',
    syntax: CL + ' · Fase 4',
    goal: 'Menggunakan rumus suku ke-n untuk menyelesaikan masalah kontekstual sederhana.',
    guru: 'Minta tim membaca soal dua kali dan menandai mana a, b, dan n sebelum memilih. Diskusikan makna jawaban dalam konteks (satuan dan kewajaran).',
    langkah: [
      'Tentukan suku pertama a dan beda b dari cerita.',
      'Tulis rumus suku ke-n.',
      'Hitung jawaban yang ditanyakan.',
      'Pilih makna jawaban dalam konteks.',
    ],
    soal: [
      {
        id: 'k1',
        ikon: '☁️',
        jenis: 'suku',
        cerita:
          'Total biaya langganan cloud storage tim hingga bulan ke-1 adalah Rp120 ribu. Setiap bulan total biaya bertambah Rp45 ribu.',
        a: 120,
        b: 45,
        n: 10,
        tanya: 'Berapa total biaya (dalam ribu rupiah) hingga bulan ke-10?',
        jawab: 525,
        satuan: 'ribu rupiah',
        abOpsi: [
          { id: 'ab1', label: 'a = 120, b = 45' },
          { id: 'ab2', label: 'a = 45, b = 120' },
          { id: 'ab3', label: 'a = 165, b = 45' },
          { id: 'ab4', label: 'a = 120, b = 10' },
        ],
        abBenar: 'ab1',
        maknaOpsi: [
          { id: 'm1', label: 'Hingga bulan ke-10, total biaya langganan Rp525 ribu.' },
          { id: 'm2', label: 'Biaya langganan bulan ke-10 saja Rp525 ribu.' },
          { id: 'm3', label: 'Butuh 525 bulan untuk mencapai total Rp10 ribu.' },
          { id: 'm4', label: 'Setiap bulan tim membayar Rp525 ribu.' },
        ],
        maknaBenar: 'm1',
      },
      {
        id: 'k2',
        ikon: '💺',
        jenis: 'nomor',
        cerita:
          'Ruang presentasi proyek RPL disusun bertingkat. Baris pertama berisi 12 kursi, dan setiap baris berikutnya bertambah 3 kursi.',
        a: 12,
        b: 3,
        target: 45,
        tanya: 'Baris keberapa yang berisi 45 kursi?',
        jawab: 12,
        satuan: '',
        abOpsi: [
          { id: 'ab1', label: 'a = 12, b = 3' },
          { id: 'ab2', label: 'a = 3, b = 12' },
          { id: 'ab3', label: 'a = 12, b = 45' },
          { id: 'ab4', label: 'a = 15, b = 3' },
        ],
        abBenar: 'ab1',
        maknaOpsi: [
          { id: 'm1', label: 'Baris ke-12 berisi 45 kursi.' },
          { id: 'm2', label: 'Ada 12 kursi di baris ke-45.' },
          { id: 'm3', label: 'Ruangan itu hanya punya 12 kursi.' },
          { id: 'm4', label: 'Baris ke-45 berisi 12 kursi lebih banyak.' },
        ],
        maknaBenar: 'm1',
      },
      {
        id: 'k3',
        ikon: '🎮',
        jenis: 'suku',
        cerita:
          'Dalam game edukasi buatan kelasmu, naik ke level 1 butuh 250 XP. Setiap level berikutnya butuh 150 XP lebih banyak daripada level sebelumnya.',
        a: 250,
        b: 150,
        n: 20,
        tanya: 'Berapa XP yang dibutuhkan untuk naik ke level 20?',
        jawab: 3100,
        satuan: 'XP',
        abOpsi: [
          { id: 'ab1', label: 'a = 250, b = 150' },
          { id: 'ab2', label: 'a = 150, b = 250' },
          { id: 'ab3', label: 'a = 250, b = 20' },
          { id: 'ab4', label: 'a = 400, b = 150' },
        ],
        abBenar: 'ab1',
        maknaOpsi: [
          { id: 'm1', label: 'Untuk naik ke level 20 dibutuhkan 3.100 XP.' },
          { id: 'm2', label: 'Total XP dari level 1 sampai level 20 adalah 3.100 XP.' },
          { id: 'm3', label: 'Pemain butuh 20 level untuk mengumpulkan 250 XP.' },
          { id: 'm4', label: 'Setiap level butuh 3.100 XP.' },
        ],
        maknaBenar: 'm1',
      },
      {
        id: 'k4',
        ikon: '📱',
        jenis: 'suku',
        cerita:
          'Di akhir hari ke-1, sisa kuota internet hotspot kelas adalah 48 GB. Setiap hari kuota terpakai 2,5 GB secara tetap.',
        a: 48,
        b: -2.5,
        n: 12,
        tanya: 'Berapa GB sisa kuota di akhir hari ke-12?',
        jawab: 20.5,
        satuan: 'GB',
        abOpsi: [
          { id: 'ab1', label: 'a = 48, b = −2,5' },
          { id: 'ab2', label: 'a = 48, b = 2,5' },
          { id: 'ab3', label: 'a = −2,5, b = 48' },
          { id: 'ab4', label: 'a = 50,5, b = −2,5' },
        ],
        abBenar: 'ab1',
        maknaOpsi: [
          { id: 'm1', label: 'Di akhir hari ke-12 kuota masih tersisa 20,5 GB.' },
          { id: 'm2', label: 'Selama 12 hari kuota terpakai 20,5 GB.' },
          { id: 'm3', label: 'Kuota habis setelah 20,5 hari.' },
          { id: 'm4', label: 'Setiap hari kuota bertambah 20,5 GB.' },
        ],
        maknaBenar: 'm1',
      },
    ],
    nhtTugas:
      'Jelaskan langkah tim kalian menyelesaikan soal kursi ruang presentasi: bagaimana kalian tahu bahwa jawabannya nomor baris, bukan banyak kursi?',
    catatanLabel:
      'Catatan tim: tuliskan satu tips agar tidak salah memakai rumus pada soal cerita.',
    catatanPlaceholder: 'Contoh: tandai dulu mana suku pertama, beda, dan n; lalu …',
    nextLabel: 'Lanjut ke Kuis Individu →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — KUIS INDIVIDU
     Bank 10 soal; `komposisi` menentukan jumlah per jenis.
     Setiap soal menyimpan data (a, b, n / target) agar kuncinya
     diuji terhadap engine.
     ---------------------------------------------------------- */
  kuis: {
    kicker: 'Tahap 7 · Kuis Individu',
    syntax: CL + ' · Fase 5',
    goal: 'Menunjukkan penguasaan individu dalam menentukan dan menggunakan rumus suku ke-n.',
    guru: 'Kuis dikerjakan MANDIRI (bergantian di perangkat tim atau di perangkat masing-masing). Anggota tim tidak boleh saling membantu pada tahap ini.',
    instruksi: 'Kerjakan sendiri. Soal dan urutan pilihan diacak untuk setiap murid.',
    banyak: 6,
    komposisi: { rumus: 2, suku: 2, nomor: 1, konteks: 1 },
    soal: [
      {
        id: 'q1',
        jenis: 'rumus',
        type: 'choice',
        cerita: 'Barisan: 5, 9, 13, 17, …',
        pertanyaan: 'Rumus suku ke-n barisan tersebut adalah …',
        a: 5,
        b: 4,
        options: [
          { id: 'a', label: 'Uₙ = 4n + 1' },
          { id: 'b', label: 'Uₙ = 4n + 5' },
          { id: 'c', label: 'Uₙ = 5n + 4' },
          { id: 'd', label: 'Uₙ = 4n − 1' },
        ],
        correct: 'a',
        explanation: 'a = 5, b = 4 → Uₙ = 5 + (n − 1) × 4 = 4n + 1. Cek: n = 1 → 5 ✓.',
      },
      {
        id: 'q2',
        jenis: 'rumus',
        type: 'choice',
        cerita: 'Barisan: 40, 34, 28, 22, …',
        pertanyaan: 'Rumus suku ke-n barisan tersebut adalah …',
        a: 40,
        b: -6,
        options: [
          { id: 'a', label: 'Uₙ = −6n + 46' },
          { id: 'b', label: 'Uₙ = 6n + 34' },
          { id: 'c', label: 'Uₙ = −6n + 40' },
          { id: 'd', label: 'Uₙ = 40n − 6' },
        ],
        correct: 'a',
        explanation:
          'a = 40, b = −6 → Uₙ = 40 + (n − 1)(−6) = −6n + 46. Barisan turun, koefisien n negatif.',
      },
      {
        id: 'q3',
        jenis: 'rumus',
        type: 'choice',
        cerita: 'Barisan: 2,5; 3; 3,5; 4; …',
        pertanyaan: 'Rumus suku ke-n barisan tersebut adalah …',
        a: 2.5,
        b: 0.5,
        options: [
          { id: 'a', label: 'Uₙ = 0,5n + 2' },
          { id: 'b', label: 'Uₙ = 0,5n + 2,5' },
          { id: 'c', label: 'Uₙ = 2,5n + 0,5' },
          { id: 'd', label: 'Uₙ = 0,5n + 3' },
        ],
        correct: 'a',
        explanation: 'a = 2,5, b = 0,5 → Uₙ = 0,5n + (2,5 − 0,5) = 0,5n + 2.',
      },
      {
        id: 'q4',
        jenis: 'suku',
        type: 'choice',
        cerita: 'Suatu barisan aritmetika memiliki suku pertama 7 dan beda 3.',
        pertanyaan: 'Suku ke-20 barisan tersebut adalah …',
        a: 7,
        b: 3,
        n: 20,
        options: [
          { id: 'a', label: '64' },
          { id: 'b', label: '67' },
          { id: 'c', label: '60' },
          { id: 'd', label: '140' },
        ],
        correct: 'a',
        explanation: 'U₂₀ = 7 + 19 × 3 = 64. (67 muncul bila beda ditambahkan 20 kali.)',
      },
      {
        id: 'q5',
        jenis: 'suku',
        type: 'choice',
        cerita: 'Barisan: 12, 9, 6, 3, …',
        pertanyaan: 'Suku ke-15 barisan tersebut adalah …',
        a: 12,
        b: -3,
        n: 15,
        options: [
          { id: 'a', label: '−30' },
          { id: 'b', label: '−33' },
          { id: 'c', label: '54' },
          { id: 'd', label: '−27' },
        ],
        correct: 'a',
        explanation: 'U₁₅ = 12 + 14 × (−3) = 12 − 42 = −30.',
      },
      {
        id: 'q6',
        jenis: 'suku',
        type: 'choice',
        cerita: 'Pada suatu barisan aritmetika, U₃ = 11 dan U₇ = 27.',
        pertanyaan: 'Suku ke-10 barisan tersebut adalah …',
        m: 3,
        um: 11,
        mn: 7,
        umn: 27,
        n: 10,
        options: [
          { id: 'a', label: '39' },
          { id: 'b', label: '43' },
          { id: 'c', label: '40' },
          { id: 'd', label: '35' },
        ],
        correct: 'a',
        explanation: 'b = (27 − 11) : (7 − 3) = 4, a = 11 − 2 × 4 = 3, jadi U₁₀ = 3 + 9 × 4 = 39.',
      },
      {
        id: 'q7',
        jenis: 'nomor',
        type: 'choice',
        cerita: 'Barisan: 3, 7, 11, 15, …',
        pertanyaan: 'Suku keberapa yang bernilai 83?',
        a: 3,
        b: 4,
        target: 83,
        options: [
          { id: 'a', label: 'Suku ke-21' },
          { id: 'b', label: 'Suku ke-20' },
          { id: 'c', label: 'Suku ke-22' },
          { id: 'd', label: 'Suku ke-83' },
        ],
        correct: 'a',
        explanation: '83 = 3 + (n − 1) × 4 → n − 1 = 20 → n = 21.',
      },
      {
        id: 'q8',
        jenis: 'nomor',
        type: 'choice',
        cerita: 'Barisan: 100, 94, 88, 82, …',
        pertanyaan: 'Suku keberapa yang bernilai 46?',
        a: 100,
        b: -6,
        target: 46,
        options: [
          { id: 'a', label: 'Suku ke-10' },
          { id: 'b', label: 'Suku ke-9' },
          { id: 'c', label: 'Suku ke-11' },
          { id: 'd', label: 'Suku ke-46' },
        ],
        correct: 'a',
        explanation: '46 = 100 + (n − 1)(−6) → n − 1 = 9 → n = 10.',
      },
      {
        id: 'q9',
        jenis: 'konteks',
        type: 'choice',
        cerita:
          'Total pembayaran sewa server hingga bulan ke-1 adalah Rp75 ribu, dan total itu bertambah Rp50 ribu setiap bulan.',
        pertanyaan: 'Total pembayaran hingga bulan ke-12 adalah …',
        a: 75,
        b: 50,
        n: 12,
        options: [
          { id: 'a', label: 'Rp625 ribu' },
          { id: 'b', label: 'Rp675 ribu' },
          { id: 'c', label: 'Rp600 ribu' },
          { id: 'd', label: 'Rp900 ribu' },
        ],
        correct: 'a',
        explanation: 'U₁₂ = 75 + 11 × 50 = 625, jadi Rp625 ribu.',
      },
      {
        id: 'q10',
        jenis: 'konteks',
        type: 'choice',
        cerita: 'Sisa kuota di akhir hari ke-1 adalah 30 GB dan berkurang 1,5 GB setiap hari.',
        pertanyaan: 'Sisa kuota di akhir hari ke-15 adalah …',
        a: 30,
        b: -1.5,
        n: 15,
        options: [
          { id: 'a', label: '9 GB' },
          { id: 'b', label: '7,5 GB' },
          { id: 'c', label: '51 GB' },
          { id: 'd', label: '22,5 GB' },
        ],
        correct: 'a',
        explanation: 'U₁₅ = 30 + 14 × (−1,5) = 30 − 21 = 9 GB.',
      },
    ],
    nextLabel: 'Lihat Penghargaan Tim →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — PENGHARGAAN
     ---------------------------------------------------------- */
  penghargaan: {
    kicker: 'Tahap 8 · Penghargaan Tim',
    syntax: CL + ' · Fase 6',
    goal: 'Merayakan kerja sama tim berdasarkan skor misi dan skor kuis individu.',
    guru: 'Umumkan predikat setiap tim. Beri apresiasi khusus pada anggota yang menjelaskan dengan jelas saat nomornya dipanggil.',
    bobot: 'Poin tim = 50% skor misi (benar pada percobaan pertama) + 50% skor kuis individu.',
    pujianLabel: 'Tulis satu pujian untuk teman satu tim (sebut namanya):',
    pujianPlaceholder: 'Contoh: Terima kasih Rani, penjelasanmu tentang (n − 1) membuatku paham.',
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan pemahaman rumus suku ke-n dan proses kerja sama.',
    guru: 'Minta 2–3 murid membacakan refleksinya. Catat miskonsepsi yang masih muncul untuk pertemuan berikutnya (deret aritmetika).',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Dengan kata-katamu sendiri, mengapa rumusnya memakai (n − 1), bukan n?',
        placeholder: 'Karena suku pertama …',
      },
      {
        id: 'r2',
        teks: 'Langkah apa yang kamu lakukan untuk memastikan rumus yang kamu tulis sudah benar?',
        placeholder: 'Aku mengecek dengan …',
      },
      {
        id: 'r3',
        teks: 'Bagaimana tim kalian memastikan setiap nomor siap menjelaskan?',
        placeholder: 'Kami …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menentukan dan memakai rumus suku ke-n sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🚀 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '🙂 Yakin — kadang masih perlu mengecek' },
      { id: 'ragu', label: '🤔 Masih ragu di beberapa langkah' },
      { id: 'bantuan', label: '🆘 Masih butuh bantuan' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Misi Selesai!',
    teks: 'Kalian sudah menemukan, menulis, dan memakai rumus suku ke-n barisan aritmetika — bersama-sama.',
    capaian: [
      'Menyusun rumus Uₙ = a + (n − 1)b dari pola tabel.',
      'Menyederhanakan rumus menjadi Uₙ = bn + (a − b) dan menuliskannya sebagai fungsi.',
      'Menentukan rumus dari dua suku yang diketahui.',
      'Memakai rumus untuk menghitung suku tertentu dan nomor suku pada masalah kontekstual.',
    ],
  },
};
