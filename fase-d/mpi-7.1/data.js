'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Pertidaksamaan Linear Satu Variabel — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Menjelaskan konsep pertidaksamaan linear satu variabel dan
   membedakannya dari persamaan linear satu variabel melalui situasi
   kontekstual yang melibatkan batasan nilai.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahTanda', 'olahSolusi'
                                         & 'olahPtlsv'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi    (7')  — "Persiapan Study Tour Kelas VII": kardus
                             oleh-oleh yang harus TEPAT 6 kg dan tas
                             ransel yang PALING BANYAK 7 kg, beserta
                             papan pengumuman berisi kata batasan
                             (paling banyak, minimal, tidak lebih dari,
                             tepat). Murid MENDUGA berapa banyak nilai
                             yang memenuhi tiap situasi dan tanda apa
                             yang cocok (tidak dinilai).
     2. Masalah      (5')  — memilih pertanyaan inti penyelidikan lalu
                             menulis dugaan sementara (hipotesis).
     3. Lab Batas    (15') — empat situasi pada neraca (piring kiri =
                             barang, piring kanan = beban batas): tepat,
                             paling banyak, kurang dari, minimal. Murid
                             menulis kalimat matematikanya (isian
                             berdiagnosa), menguji nilai x 1–8 satu per
                             satu (neraca miring/seimbang + cek
                             substitusi), lalu menguji sisanya sekaligus.
                             Titik ✓/✗ tercatat di garis bilangan dan
                             tabel pengamatan.
     4a. Olah Tanda  (8')  — kata batasan ⇒ tanda <, >, ≤, ≥, atau =;
                             batas termasuk (≤, ≥) vs tidak (<, >).
     4b. Olah Solusi (8')  — persamaan dipenuhi SATU nilai,
                             pertidaksamaan dipenuhi BANYAK nilai; garis
                             bilangan dengan bulatan penuh/kosong.
     4c. Olah PtLSV  (8')  — ciri PtLSV: satu variabel, pangkat satu,
                             tanda <, >, ≤, ≥; bedanya dengan PLSV;
                             memilah contoh bukan PtLSV; menulis model.
     5. Verifikasi   (10') — memilah kalimat BARU ke PLSV / PtLSV /
                             bukan keduanya, memilah pernyataan konsep,
                             membandingkan dugaan awal & hipotesis.
     6. Generalisasi (5')  — menyusun definisi PtLSV dan perbedaannya
                             dengan PLSV dari bank kalimat acak.
     7. Uji terap    (12') — delapan soal diambil acak dari bank enam
                             belas soal (isian berdiagnosa & pilihan
                             ganda berpengecoh miskonsepsi).
     8. Refleksi     (3')  — rekap, refleksi tertulis, penilaian diri.

   Notasi kunci jawaban (`cek`, lihat engine seksi 76):
     { kalimat, minta: 'kalimat' }            → menulis kalimat dari cerita
     { kalimat, minta: 'jenisBatas' }         → 'plsv' | 'ptlsv' | 'bukanKeduanya'
     { frasa, minta: 'tanda' }                → id tanda (kurangSama, …)
     { kalimat, nilai, minta: 'memenuhi' }    → 'ya' | 'tidak'
     { kalimat, semesta, minta: 'himpunan' }  → bilangan bulat yang memenuhi
     { kalimat, semesta, minta: 'banyak' }    → banyaknya bilangan itu
   Situasi Lab Batas = { kiri: { x, lepas }, kanan: { lepas }, rel }.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Soal uji terap juga
   diambil acak dari bank dan opsi pilihan gandanya dibangun engine
   (opsiSoalBatas) lalu diacak.

   Konsistensi kunci jawaban diuji tests/mpi-7.1-data.test.js terhadap
   engine seksi 76.
   ============================================================ */

var DL = 'Discovery Learning';

var DATA = {
  meta: {
    judul: 'Pertidaksamaan Linear Satu Variabel',
  },

  tahap: [
    { id: 'stimulasi', label: 'Stimulasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'koleksi', label: 'Lab Batas' },
    { id: 'olahTanda', label: 'Kata & Tanda' },
    { id: 'olahSolusi', label: 'Banyak Nilai' },
    { id: 'olahPtlsv', label: 'PLSV vs PtLSV' },
    { id: 'verifikasi', label: 'Verifikasi' },
    { id: 'generalisasi', label: 'Generalisasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Label konteks soal (ikon + nama). */
  konteks: {
    perjalanan: { ikon: '🚌', nama: 'Perjalanan' },
    belanja: { ikon: '🛍️', nama: 'Belanja' },
    wahana: { ikon: '🎢', nama: 'Wahana' },
    simbol: { ikon: '🔤', nama: 'Kalimat Matematika' },
  },

  /* Nama jenis kalimat untuk tampilan (id = kelompokKalimatBatas 'persamaanAtau'). */
  namaJenis: {
    plsv: 'Persamaan linear satu variabel (PLSV)',
    ptlsv: 'Pertidaksamaan linear satu variabel (PtLSV)',
    bukanKeduanya: 'Bukan PLSV maupun PtLSV',
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; dibandingkan dengan temuan pada tahap
     Verifikasi. `baku` = jawaban menurut engine bila ada `cek`.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati dua situasi persiapan study tour — satu dengan nilai yang tepat, satu dengan batasan — lalu menduga berapa banyak nilai yang memenuhi masing-masing.',
    tp: 'Menjelaskan konsep pertidaksamaan linear satu variabel dan membedakannya dari persamaan linear satu variabel melalui situasi kontekstual yang melibatkan batasan nilai.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menerjemahkan kata batasan (paling banyak, minimal, kurang dari, lebih dari) menjadi tanda <, >, ≤, atau ≥.',
      'Menulis kalimat matematika dari situasi sehari-hari yang memuat batasan nilai.',
      'Menentukan nilai-nilai yang memenuhi pertidaksamaan dengan substitusi dan menggambarkannya pada garis bilangan.',
      'Menjelaskan perbedaan PLSV (tanda "=", satu penyelesaian) dan PtLSV (tanda <, >, ≤, ≥, banyak penyelesaian).',
      'Memilah kalimat yang termasuk PLSV, PtLSV, atau bukan keduanya beserta alasannya.',
    ],
    guru: 'Tampilkan kedua kartu. Biarkan pasangan murid berdebat: apakah bekal di tas ransel harus tepat 4 kg, atau boleh kurang? Jangan membenarkan dulu — dugaan "paling banyak 7 berarti harus 7" justru menjadi bahan penemuan.',
    judul: 'Persiapan Study Tour Kelas VII',
    pengantar:
      'Kelas VII akan study tour ke museum. Panitia menimbang barang bawaan dengan neraca dua piring: kotak oranye berisi barang yang beratnya x kg, beban ungu beratnya 1 kg. Amati kedua situasi dan papan pengumuman.',
    kartu: [
      {
        id: 'kOleh',
        ikon: '🎁',
        judul: 'Kardus oleh-oleh',
        teks: 'Kardus oleh-oleh untuk wali kelas harus TEPAT 6 kg. Isinya 1 kotak bakpia (x kg) dan 2 kg keripik.',
        neraca: { kiri: { x: 1, lepas: 2 }, kanan: { lepas: 6 } },
        x: 4,
        caption: 'Bakpia 4 kg → neraca seimbang',
      },
      {
        id: 'kTas',
        ikon: '🎒',
        judul: 'Tas ransel',
        teks: 'Berat tas ransel di bus PALING BANYAK 7 kg. Isinya 1 kotak bekal (x kg) dan 3 kg pakaian.',
        neraca: { kiri: { x: 1, lepas: 3 }, kanan: { lepas: 7 } },
        x: 2,
        caption: 'Bekal 2 kg → piring kanan (batas) lebih berat',
      },
      {
        id: 'kPapan',
        ikon: '📢',
        judul: 'Papan pengumuman',
        teks: 'Ketentuan study tour:',
        kalimat: [
          'Berat tas ransel paling banyak 7 kg.',
          'Peserta minimal berusia 12 tahun.',
          'Uang saku tidak lebih dari Rp100 ribu.',
          'Kardus oleh-oleh untuk wali kelas tepat 6 kg.',
        ],
      },
    ],
    dugaan: [
      {
        id: 'dOleh',
        tanya:
          'Berapa banyak nilai x (bilangan bulat 1–8) yang membuat kardus oleh-oleh TEPAT 6 kg?',
        opsi: [
          { id: 'satu', label: 'Hanya satu nilai' },
          { id: 'banyak', label: 'Banyak nilai' },
          { id: 'tidakAda', label: 'Tidak ada nilai yang cocok' },
          { id: 'semua', label: 'Semua nilai 1–8' },
        ],
        baku: 'satu',
        cek: { kalimat: 'x + 2 = 6', semesta: [1, 8], minta: 'banyak' },
        pembahasan:
          'Hanya x = 4, karena 4 + 2 = 6. Nilai lain membuat neraca miring. Situasi "tepat" dimodelkan dengan persamaan x + 2 = 6.',
      },
      {
        id: 'dTas',
        tanya: 'Agar tas ransel PALING BANYAK 7 kg, berapa kg bekal (x) yang boleh dibawa?',
        opsi: [
          { id: 'banyak', label: 'Boleh 1, 2, 3, atau 4 kg' },
          { id: 'tepat', label: 'Harus tepat 4 kg' },
          { id: 'lebih', label: 'Harus lebih dari 4 kg' },
          { id: 'kurang', label: 'Harus kurang dari 4 kg (4 kg tidak boleh)' },
        ],
        baku: 'banyak',
        cek: { kalimat: 'x + 3 ≤ 7', semesta: [1, 8], minta: 'himpunan' },
        pembahasan:
          'Bekal 1, 2, 3, atau 4 kg membuat tas 4–7 kg: semuanya tidak melebihi 7 kg. Situasi "paling banyak" dimodelkan dengan pertidaksamaan x + 3 ≤ 7 yang dipenuhi banyak nilai.',
      },
      {
        id: 'dTanda',
        tanya: 'Tanda apa yang paling cocok untuk kata "paling banyak"?',
        opsi: [
          { id: 'kurangSama', label: '≤ (kurang dari atau sama dengan)' },
          { id: 'kurang', label: '< (kurang dari)' },
          { id: 'lebihSama', label: '≥ (lebih dari atau sama dengan)' },
          { id: 'sama', label: '= (sama dengan)' },
        ],
        baku: 'kurangSama',
        cek: { frasa: 'paling banyak', minta: 'tanda' },
        pembahasan:
          '"Paling banyak 7" berarti 7 atau kurang — nilai 7 sendiri masih boleh. Tandanya ≤.',
      },
    ],
    alasanLabel:
      'Menurutmu, apa beda kata "tepat" dan "paling banyak" pada kedua situasi itu? Tulis singkat.',
    alasanPlaceholder: 'Contoh: kata "tepat" berarti …, sedangkan "paling banyak" …',
    catatan:
      'Dugaan ini belum dinilai. Kalian akan memeriksanya sendiri dengan menguji nilai x di Lab Batas.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — PROBLEM STATEMENT
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan penyelidikan tentang situasi bernilai tepat dan situasi berbatasan, lalu menulis hipotesis.',
    guru: 'Arahkan murid pada pertanyaan yang dapat diselidiki dengan neraca dan substitusi. Pertanyaan tentang harga tiket atau rute belum bisa dijawab dari data — bahas mengapa.',
    pengantar:
      'Kardus oleh-oleh harus tepat 6 kg, sedangkan tas ransel cukup tidak melebihi 7 kg. Keduanya memuat x, tetapi kata kuncinya berbeda. Pertanyaan mana yang paling tepat untuk diselidiki hari ini?',
    pertanyaan: 'Pilih pertanyaan inti penyelidikan kita:',
    opsi: [
      {
        id: 'inti',
        label:
          'Bagaimana menulis kalimat matematika untuk situasi yang memuat batasan (paling banyak, minimal, kurang dari), dan apa bedanya dengan situasi yang nilainya tepat?',
      },
      { id: 'tiket', label: 'Berapa harga tiket masuk museum untuk satu kelas?' },
      { id: 'rute', label: 'Rute bus mana yang paling cepat menuju museum?' },
      { id: 'neraca', label: 'Berapa harga neraca dua piring yang dipakai panitia?' },
    ],
    correct: 'inti',
    umpan: {
      inti: 'Tepat! Pertanyaan ini dapat kita selidiki dengan menulis kalimat matematika dan menguji nilai x di neraca.',
      tiket:
        'Harga tiket tidak ada di cerita, dan bukan itu yang ingin kita pahami. Pilih pertanyaan tentang kalimat dan batasan.',
      rute: 'Rute bus menarik, tetapi fokus kita adalah cara memodelkan batasan dengan kalimat matematika.',
      neraca:
        'Neraca hanyalah alat. Yang ingin kita pahami adalah apa yang ditunjukkan neraca tentang batasan nilai.',
    },
    hipotesisLabel:
      'Tulis dugaan sementaramu (hipotesis): kalimat matematika seperti apa yang cocok untuk tas ransel "paling banyak 7 kg", dan berapa banyak nilai x yang memenuhinya dibanding kardus "tepat 6 kg"?',
    hipotesisPlaceholder: 'Contoh: menurutku tas ransel ditulis …, dan nilai x yang memenuhi …',
    nextLabel: 'Lanjut: Lab Batas →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — DATA COLLECTION: LAB BATAS
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Mengumpulkan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Menulis kalimat matematika untuk empat situasi persiapan study tour, lalu menguji nilai x = 1 sampai 8 dan mencatat mana yang memenuhi.',
    guru: 'Murid bergantian: satu menulis kalimat dan memilih nilai x, yang lain memprediksi "memenuhi atau tidak" sebelum tombol "Uji" ditekan. Minta murid sengaja menguji nilai batas (mis. x = 4) dan memperhatikan bedanya pada "paling banyak" dan "kurang dari".',
    pengantar:
      'Piring kiri berisi barang bawaan: kotak oranye = x kg, beban ungu = 1 kg. Piring kanan berisi beban sebesar BATAS-nya. Tulis kalimat matematikanya, lalu uji nilai x satu per satu.',
    tips: [
      'Ruas kiri = isi piring kiri, ruas kanan = batasnya. Pilih tanda sesuai kata kuncinya: tepat (=), paling banyak (≤), kurang dari (<), minimal (≥), lebih dari (>).',
      'Ketik <= untuk ≤ dan >= untuk ≥. Dua kotak x ditulis 2x.',
      'Ujilah nilai batasnya juga. Apakah nilai batas termasuk yang memenuhi?',
    ],
    lab: {
      huruf: 'x',
      min: 1,
      max: 8,
      minUji: 3,
      situasi: [
        {
          id: 'sOleh',
          judul: 'Kardus oleh-oleh',
          frasa: 'tepat',
          cerita:
            'Kardus oleh-oleh untuk wali kelas harus tepat 6 kg. Piring kiri: 1 kotak bakpia (x kg) dan 2 beban 1 kg keripik. Piring kanan: 6 beban 1 kg.',
          kiri: { x: 1, lepas: 2 },
          kanan: { lepas: 6 },
          rel: '=',
        },
        {
          id: 'sTas',
          judul: 'Tas ransel',
          frasa: 'paling banyak',
          cerita:
            'Berat tas ransel paling banyak 7 kg. Piring kiri: 1 kotak bekal (x kg) dan 3 beban 1 kg pakaian. Piring kanan: 7 beban 1 kg sebagai batas.',
          kiri: { x: 1, lepas: 3 },
          kanan: { lepas: 7 },
          rel: '≤',
        },
        {
          id: 'sTroli',
          judul: 'Troli museum',
          frasa: 'kurang dari',
          cerita:
            'Troli kecil di museum hanya aman untuk beban kurang dari 9 kg. Piring kiri: 2 kardus suvenir yang sama (masing-masing x kg) dan 1 beban 1 kg. Piring kanan: 9 beban 1 kg sebagai batas.',
          kiri: { x: 2, lepas: 1 },
          kanan: { lepas: 9 },
          rel: '<',
        },
        {
          id: 'sDonasi',
          judul: 'Kardus donasi buku',
          frasa: 'minimal',
          cerita:
            'Agar ongkos kirimnya gratis, kardus donasi buku untuk perpustakaan desa minimal 6 kg. Piring kiri: 2 ikat buku yang sama (masing-masing x kg). Piring kanan: 6 beban 1 kg sebagai batas.',
          kiri: { x: 2 },
          kanan: { lepas: 6 },
          rel: '≥',
        },
      ],
    },
    selesaiTeks:
      'Keempat situasi sudah ditulis kalimatnya dan semua nilai x = 1–8 sudah diuji. Amati kolom "Banyaknya": situasi mana yang dipenuhi satu nilai, dan mana yang dipenuhi banyak nilai?',
    nextLabel: 'Lanjut: Olah Data Kata & Tanda →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — DATA PROCESSING: KATA BATASAN & TANDA
     ---------------------------------------------------------- */
  olahTanda: {
    kicker: 'Tahap 4a · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan hubungan kata batasan dengan tanda <, >, ≤, ≥, dan =, termasuk apakah nilai batasnya ikut memenuhi.',
    guru: 'Tunjuk baris "tas ransel" dan "troli" di tabel: "Mengapa x = 4 memenuhi yang satu tetapi tidak yang lain?" Tekankan arti garis di bawah tanda ≤ dan ≥: "atau sama dengan".',
    judul: 'Kata kunci di tabel pengamatan',
    pengantar:
      'Lihat kembali tabel Lab Batas. Setiap situasi memakai kata kunci yang berbeda, dan tandanya pun berbeda. Apa yang kamu perhatikan?',
    temuan: [
      {
        id: 'ttBatas',
        tanya: 'Pada tas ransel (paling banyak 7 kg), apakah bekal x = 4 kg memenuhi?',
        opsi: [
          { id: 'ya', label: 'Ya, karena 4 + 3 = 7 tidak melebihi 7' },
          { id: 'tidak', label: 'Tidak, karena tas harus kurang dari 7 kg' },
          { id: 'hanya', label: 'Ya, dan hanya x = 4 yang memenuhi' },
          { id: 'tidakTahu', label: 'Belum dapat ditentukan' },
        ],
        correct: 'ya',
        umpan: {
          ya: 'Tepat! "Paling banyak 7" berarti 7 masih boleh. Karena itu tandanya ≤ — ada garis "sama dengan" di bawahnya.',
          tidak:
            'Lihat tabelmu: x = 4 bertanda ✓. "Paling banyak 7" berarti 7 kg pun masih boleh, asal tidak lebih.',
          hanya: 'x = 4 memang memenuhi, tetapi lihat tabel: x = 1, 2, dan 3 juga memenuhi.',
          tidakTahu: 'Kita sudah mengujinya di Lab Batas: 4 + 3 = 7 dan 7 ≤ 7 benar.',
        },
      },
      {
        id: 'ttKurang',
        tanya: 'Pada troli (kurang dari 9 kg), mengapa x = 4 TIDAK memenuhi 2x + 1 < 9?',
        opsi: [
          { id: 'batas', label: 'Karena 2 × 4 + 1 = 9, dan 9 tidak kurang dari 9' },
          { id: 'besar', label: 'Karena 4 terlalu besar untuk troli' },
          { id: 'genap', label: 'Karena 4 bilangan genap' },
          { id: 'salahLab', label: 'Sebenarnya x = 4 memenuhi' },
        ],
        correct: 'batas',
        umpan: {
          batas:
            'Tepat! "Kurang dari 9" berarti 9 sendiri tidak termasuk. Tandanya < (tanpa garis "sama dengan").',
          besar:
            'Berat troli dengan x = 4 tepat 9 kg — sama dengan batasnya, bukan lebih. Masalahnya: "kurang dari" tidak termasuk 9.',
          genap:
            'Genap atau ganjil tidak berpengaruh. Hitunglah 2 × 4 + 1 lalu bandingkan dengan 9.',
          salahLab: 'Ujilah: 2 × 4 + 1 = 9, dan 9 < 9 salah. Jadi x = 4 tidak memenuhi.',
        },
      },
      {
        id: 'ttMinimal',
        tanya: 'Kardus donasi "minimal 6 kg" ditulis 2x ≥ 6. Apa arti tanda ≥?',
        opsi: [
          { id: 'lebihSama', label: 'Lebih dari atau sama dengan: 6 kg atau lebih boleh' },
          { id: 'kurangSama', label: 'Kurang dari atau sama dengan: 6 kg atau kurang' },
          { id: 'lebih', label: 'Lebih dari: 6 kg tidak boleh' },
          { id: 'sama', label: 'Harus tepat 6 kg' },
        ],
        correct: 'lebihSama',
        umpan: {
          lebihSama:
            'Tepat! "Minimal", "paling sedikit", dan "sekurang-kurangnya" berarti batas ke bawah — nilai batasnya masih boleh.',
          kurangSama:
            'Ingat, "minimal 6" berarti tidak boleh kurang dari 6. Arah tandanya ke "lebih".',
          lebih: 'Lihat tabel: x = 3 (2 × 3 = 6) bertanda ✓, jadi 6 kg boleh. Tandanya ≥, bukan >.',
          sama: 'Lihat tabel: x = 3, 4, 5, … semuanya memenuhi, tidak hanya satu nilai.',
        },
      },
      {
        id: 'ttTepat',
        tanya: 'Mengapa hanya kardus oleh-oleh yang memakai tanda "="?',
        opsi: [
          { id: 'tepat', label: 'Karena kata "tepat" berarti kedua ruas harus sama besar' },
          { id: 'ringan', label: 'Karena kardus oleh-oleh paling ringan' },
          { id: 'satuKotak', label: 'Karena isinya hanya satu kotak x' },
          { id: 'semua', label: 'Seharusnya semua situasi memakai "="' },
        ],
        correct: 'tepat',
        umpan: {
          tepat:
            'Tepat! Nilai yang tepat sama → tanda "=" (persamaan). Batasan → <, >, ≤, ≥ (pertidaksamaan).',
          ringan: 'Berat kardus tidak menentukan tanda. Yang menentukan adalah kata kuncinya.',
          satuKotak:
            'Tas ransel juga berisi satu kotak x, tetapi memakai ≤. Yang menentukan adalah kata kuncinya.',
          semua:
            'Tas ransel boleh kurang dari 7 kg, jadi kedua ruas tidak harus sama. Tanda "=" tidak cocok untuk batasan.',
        },
      },
    ],
    pilah: {
      skema: 'tanda',
      judul: 'Kata kunci → tanda',
      pengantar: 'Pilih tanda yang tepat untuk kata kunci pada setiap ketentuan.',
      kategori: [
        { id: 'kurangSama', label: '≤' },
        { id: 'lebihSama', label: '≥' },
        { id: 'kurang', label: '<' },
        { id: 'lebih', label: '>' },
        { id: 'sama', label: '=' },
      ],
      butir: [
        {
          id: 'pt1',
          frasa: 'Penumpang lift museum maksimal 8 orang.',
          correct: 'kurangSama',
          explanation: '"Maksimal 8" berarti 8 orang masih boleh, lebih tidak: ≤.',
        },
        {
          id: 'pt2',
          frasa: 'Tinggi badan pengunjung wahana lebih dari 120 cm.',
          correct: 'lebih',
          explanation: '"Lebih dari 120" berarti 120 cm sendiri belum boleh: >.',
        },
        {
          id: 'pt3',
          frasa: 'Nilai tugas proyek sekurang-kurangnya 75.',
          correct: 'lebihSama',
          explanation: '"Sekurang-kurangnya 75" berarti 75 atau lebih: ≥.',
        },
        {
          id: 'pt4',
          frasa: 'Suhu ruang penyimpanan fosil di bawah 25 °C.',
          correct: 'kurang',
          explanation: '"Di bawah 25" berarti 25 °C sendiri tidak termasuk: <.',
        },
        {
          id: 'pt5',
          frasa: 'Tiket masuk museum tepat Rp15 ribu.',
          correct: 'sama',
          explanation: '"Tepat" berarti nilainya sama persis: =.',
        },
        {
          id: 'pt6',
          frasa: 'Waktu istirahat makan siang tidak lebih dari 30 menit.',
          correct: 'kurangSama',
          explanation: '"Tidak lebih dari 30" berarti 30 menit atau kurang: ≤.',
        },
        {
          id: 'pt7',
          frasa: 'Tabungan study tour paling sedikit Rp50 ribu.',
          correct: 'lebihSama',
          explanation: '"Paling sedikit 50" berarti 50 atau lebih: ≥.',
        },
      ],
    },
    langkah: [
      {
        id: 'lt1',
        label:
          'Uang saku Dina u ribu rupiah. Ditambah Rp20 ribu dari kakaknya, uang sakunya paling banyak Rp100 ribu. Tulis kalimat matematikanya.',
        cek: { kalimat: 'u + 20 ≤ 100', minta: 'kalimat' },
        placeholder: 'mis. u + 5 ≤ 50',
        hints: [
          'Ruas kiri: uang saku Dina ditambah 20. Ruas kanan: batasnya, 100.',
          '"Paling banyak" → ≤ (ketik <=).',
        ],
        temuan: 'u + 20 ≤ 100. Kata "paling banyak" menjadi ≤ karena Rp100 ribu masih boleh.',
      },
      {
        id: 'lt2',
        label:
          'Panitia memesan b bus yang sama, masing-masing 40 kursi. Banyak kursi harus lebih dari 150 karena ada 150 peserta dan beberapa guru. Tulis kalimat matematikanya.',
        cek: { kalimat: '40b > 150', minta: 'kalimat' },
        placeholder: 'mis. 10b > 25',
        hints: ['Banyak kursi = 40 × b = 40b.', '"Lebih dari" → > (batas tidak termasuk).'],
        temuan: '40b > 150. Kata "lebih dari" menjadi > karena 150 kursi saja belum cukup.',
      },
    ],
    ringkasan:
      'Kata batasan diterjemahkan menjadi tanda: "paling banyak", "maksimal", "tidak lebih dari" → ≤; "minimal", "paling sedikit", "sekurang-kurangnya" → ≥; "kurang dari", "di bawah" → <; "lebih dari", "di atas" → >. Tanda ≤ dan ≥ TERMASUK nilai batasnya, sedangkan < dan > tidak. Kata "tepat" → =.',
    nextLabel: 'Lanjut: Olah Data Banyak Nilai →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — DATA PROCESSING: SATU NILAI ATAU BANYAK NILAI
     ---------------------------------------------------------- */
  olahSolusi: {
    kicker: 'Tahap 4b · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan bahwa persamaan dipenuhi satu nilai, sedangkan pertidaksamaan dipenuhi banyak nilai, lalu menggambarkannya pada garis bilangan.',
    guru: 'Bandingkan garis bilangan keempat situasi. Tanyakan: "Kalau kita boleh mencoba x = 9, 10, 20 pada kardus donasi, apakah tetap memenuhi?" Kenalkan bulatan penuh (batas termasuk) dan bulatan kosong (batas tidak termasuk).',
    judul: 'Garis bilangan hasil Lab Batas',
    pengantar:
      'Setiap garis bilangan memperlihatkan nilai x yang kamu uji: ✓ memenuhi, ✗ tidak memenuhi. Di bawahnya, penyelesaian digambar dengan bulatan dan arsiran.',
    kartu: [
      { kalimat: 'x + 2 = 6', keterangan: 'Kardus oleh-oleh (tepat)' },
      { kalimat: 'x + 3 ≤ 7', keterangan: 'Tas ransel (paling banyak)' },
      { kalimat: '2x + 1 < 9', keterangan: 'Troli museum (kurang dari)' },
      { kalimat: '2x ≥ 6', keterangan: 'Kardus donasi (minimal)' },
    ],
    garis: { min: 0, max: 8 },
    temuan: [
      {
        id: 'tsTepat',
        tanya: 'Berapa banyak nilai x yang memenuhi x + 2 = 6?',
        opsi: [
          { id: 'satu', label: 'Satu nilai saja, yaitu x = 4' },
          { id: 'empat', label: 'Empat nilai: 1, 2, 3, 4' },
          { id: 'tidakAda', label: 'Tidak ada' },
          { id: 'semua', label: 'Semua nilai 1–8' },
        ],
        correct: 'satu',
        umpan: {
          satu: 'Tepat! Persamaan seperti neraca yang hanya seimbang untuk satu nilai x.',
          empat: 'Itu nilai yang memenuhi x + 3 ≤ 7. Pada x + 2 = 6, coba x = 3: 5 ≠ 6.',
          tidakAda: 'Lihat tabel: x = 4 bertanda ✓ karena 4 + 2 = 6.',
          semua: 'Lihat tabel: hanya x = 4 yang bertanda ✓.',
        },
      },
      {
        id: 'tsBanyak',
        tanya: 'Bagaimana dengan pertidaksamaan seperti x + 3 ≤ 7 dan 2x ≥ 6?',
        opsi: [
          { id: 'banyak', label: 'Dipenuhi banyak nilai x' },
          { id: 'satu', label: 'Dipenuhi tepat satu nilai x' },
          { id: 'tidakAda', label: 'Tidak dipenuhi nilai apa pun' },
          { id: 'batasSaja', label: 'Hanya dipenuhi nilai batasnya' },
        ],
        correct: 'banyak',
        umpan: {
          banyak:
            'Tepat! x + 3 ≤ 7 dipenuhi 1, 2, 3, 4, dan 2x ≥ 6 dipenuhi 3, 4, 5, …, 8. Itulah beda utama pertidaksamaan.',
          satu: 'Lihat kolom "Banyaknya" di tabel: lebih dari satu nilai bertanda ✓.',
          tidakAda: 'Banyak nilai bertanda ✓ di tabelmu.',
          batasSaja:
            'Nilai batas hanya salah satunya. Pada x + 3 ≤ 7, x = 1, 2, dan 3 juga memenuhi.',
        },
      },
      {
        id: 'tsLanjut',
        tanya: 'Kita hanya menguji x sampai 8. Apakah x = 9 atau x = 20 juga memenuhi 2x ≥ 6?',
        opsi: [
          { id: 'ya', label: 'Ya, semua bilangan 3 atau lebih memenuhi — tidak berhenti di 8' },
          { id: 'tidak', label: 'Tidak, penyelesaiannya hanya sampai 8' },
          { id: 'sembilan', label: 'Hanya x = 9 yang juga memenuhi' },
          { id: 'tidakTahu', label: 'Tidak dapat diketahui tanpa neraca' },
        ],
        correct: 'ya',
        umpan: {
          ya: 'Tepat! 2 × 20 = 40 ≥ 6. Penyelesaiannya x ≥ 3, sehingga pada garis bilangan diarsir terus ke kanan.',
          tidak:
            'Cobalah substitusi: 2 × 9 = 18, dan 18 ≥ 6 benar. Angka 8 hanya batas pengujian kita.',
          sembilan: 'Coba juga x = 20: 2 × 20 = 40 ≥ 6 benar.',
          tidakTahu: 'Substitusi tidak memerlukan neraca: ganti x lalu bandingkan kedua ruas.',
        },
      },
      {
        id: 'tsBulatan',
        tanya:
          'Mengapa x < 4 digambar dengan bulatan KOSONG di 4, sedangkan x ≤ 4 dengan bulatan PENUH?',
        opsi: [
          {
            id: 'termasuk',
            label: 'Bulatan penuh: 4 termasuk penyelesaian; kosong: 4 tidak termasuk',
          },
          { id: 'hiasan', label: 'Hanya pilihan gambar, artinya sama saja' },
          { id: 'terbalik', label: 'Bulatan penuh: 4 tidak termasuk; kosong: 4 termasuk' },
          { id: 'besar', label: 'Bulatan penuh dipakai untuk bilangan yang lebih besar' },
        ],
        correct: 'termasuk',
        umpan: {
          termasuk: 'Tepat! Tanda ≤ dan ≥ → bulatan penuh; tanda < dan > → bulatan kosong.',
          hiasan:
            'Ingat troli: x = 4 tidak memenuhi 2x + 1 < 9, tetapi memenuhi x + 3 ≤ 7. Bulatan membedakannya.',
          terbalik: 'Kebalikannya: bulatan penuh berarti nilai itu ikut diarsir (termasuk).',
          besar: 'Besar bilangan tidak berpengaruh; yang berpengaruh adalah tandanya.',
        },
      },
    ],
    pilah: {
      skema: 'memenuhi',
      judul: 'Memenuhi atau tidak?',
      pengantar: 'Substitusikan nilai yang diberikan, lalu bandingkan kedua ruas.',
      kategori: [
        { id: 'ya', label: 'Memenuhi' },
        { id: 'tidak', label: 'Tidak memenuhi' },
      ],
      butir: [
        {
          id: 'ps1',
          kalimat: 'x + 3 ≤ 7',
          nilai: 4,
          correct: 'ya',
          explanation: '4 + 3 = 7 dan 7 ≤ 7 benar: batas termasuk.',
        },
        {
          id: 'ps2',
          kalimat: '2x + 1 < 9',
          nilai: 4,
          correct: 'tidak',
          explanation: '2 × 4 + 1 = 9 dan 9 < 9 salah: batas tidak termasuk.',
        },
        {
          id: 'ps3',
          kalimat: '2x ≥ 6',
          nilai: 7,
          correct: 'ya',
          explanation: '2 × 7 = 14 dan 14 ≥ 6 benar.',
        },
        {
          id: 'ps4',
          kalimat: 'x + 2 = 6',
          nilai: 5,
          correct: 'tidak',
          explanation: '5 + 2 = 7, bukan 6. Persamaan hanya dipenuhi x = 4.',
        },
        {
          id: 'ps5',
          kalimat: 'n − 2 > 3',
          nilai: 6,
          correct: 'ya',
          explanation: '6 − 2 = 4 dan 4 > 3 benar.',
        },
        {
          id: 'ps6',
          kalimat: 'n − 2 > 3',
          nilai: 5,
          correct: 'tidak',
          explanation: '5 − 2 = 3 dan 3 > 3 salah: batas tidak termasuk.',
        },
        {
          id: 'ps7',
          kalimat: '3p ≤ 12',
          nilai: 5,
          correct: 'tidak',
          explanation: '3 × 5 = 15 dan 15 ≤ 12 salah.',
        },
      ],
    },
    langkah: [
      {
        id: 'ls1',
        label:
          'Tulis semua bilangan bulat 1 sampai 8 yang memenuhi x + 1 < 5 (pisahkan dengan koma).',
        cek: { kalimat: 'x + 1 < 5', semesta: [1, 8], minta: 'himpunan' },
        placeholder: 'mis. 1, 2',
        hints: [
          'Ujilah satu per satu: x = 1 → 2 < 5? x = 2 → 3 < 5? …',
          'Ingat, "<" tidak termasuk batasnya: 4 + 1 = 5, dan 5 < 5 salah.',
        ],
        temuan: '{1, 2, 3}. Pertidaksamaan x + 1 < 5 dipenuhi banyak nilai, dan 4 tidak termasuk.',
      },
      {
        id: 'ls2',
        label: 'Berapa banyak bilangan bulat 1 sampai 8 yang memenuhi pertidaksamaan 2y ≥ 10?',
        cek: { kalimat: '2y ≥ 10', semesta: [1, 8], minta: 'banyak' },
        placeholder: 'mis. 2',
        hints: [
          '2 × 5 = 10 dan 10 ≥ 10 benar. Apakah y = 6, 7, 8 juga memenuhi?',
          'Hitung banyaknya bilangan dari 5 sampai 8.',
        ],
        temuan: '4 nilai, yaitu 5, 6, 7, 8 (dan seterusnya bila y boleh lebih dari 8).',
      },
      {
        id: 'ls3',
        label:
          'Bandingkan: berapa banyak bilangan bulat 1 sampai 8 yang memenuhi persamaan 2y = 10?',
        cek: { kalimat: '2y = 10', semesta: [1, 8], minta: 'banyak' },
        placeholder: 'mis. 3',
        hints: ['Bilangan berapa yang jika dikali 2 hasilnya tepat 10?'],
        temuan:
          '1 nilai saja, yaitu y = 5. Persamaan dipenuhi satu nilai; pertidaksamaan 2y ≥ 10 dipenuhi banyak nilai.',
      },
    ],
    ringkasan:
      'Persamaan linear satu variabel (seperti x + 2 = 6) dipenuhi tepat SATU nilai. Pertidaksamaan linear satu variabel (seperti x + 3 ≤ 7) dipenuhi BANYAK nilai, yaitu semua nilai yang tidak melanggar batasannya. Pada garis bilangan, penyelesaian pertidaksamaan digambar dengan bulatan penuh (≤, ≥: batas termasuk) atau bulatan kosong (<, >: batas tidak termasuk) dan arsiran ke arah nilai-nilai yang memenuhi.',
    nextLabel: 'Lanjut: Olah Data PLSV vs PtLSV →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — DATA PROCESSING: PLSV vs PtLSV
     ---------------------------------------------------------- */
  olahPtlsv: {
    kicker: 'Tahap 4c · Mengolah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan ciri pertidaksamaan linear satu variabel (PtLSV) dan membedakannya dari persamaan linear satu variabel (PLSV).',
    guru: 'Letakkan kedua kartu berdampingan. Minta murid menyebut tiga hal yang sama dan satu hal yang berbeda. Lalu tuliskan a + b ≤ 10 dan x² < 9 di papan: "Masih PtLSV-kah?"',
    judul: 'Dua kalimat dari Lab Batas',
    pengantar:
      'Kalimat kardus oleh-oleh adalah persamaan linear satu variabel (PLSV). Kalimat tas ransel disebut pertidaksamaan linear satu variabel (PtLSV). Bandingkan keduanya.',
    kartu: [
      {
        kalimat: 'x + 2 = 6',
        keterangan: 'PLSV — neraca harus seimbang: satu nilai x.',
        neraca: { kiri: { x: 1, lepas: 2 }, kanan: { lepas: 6 } },
        x: 4,
      },
      {
        kalimat: 'x + 3 ≤ 7',
        keterangan: 'PtLSV — piring kiri tidak boleh lebih berat: banyak nilai x.',
        neraca: { kiri: { x: 1, lepas: 3 }, kanan: { lepas: 7 } },
        x: 2,
      },
    ],
    temuan: [
      {
        id: 'tvSama',
        tanya: 'Apa yang SAMA dari x + 2 = 6 dan x + 3 ≤ 7?',
        opsi: [
          { id: 'ciri', label: 'Keduanya memuat satu variabel, x, yang berpangkat satu' },
          { id: 'tanda', label: 'Keduanya memakai tanda yang sama' },
          { id: 'solusi', label: 'Keduanya dipenuhi oleh nilai x yang sama persis' },
          { id: 'pernyataan', label: 'Keduanya pernyataan yang sudah pasti benar' },
        ],
        correct: 'ciri',
        umpan: {
          ciri: 'Tepat! Satu variabel dan pangkat satu — inilah arti "linear satu variabel" pada PLSV maupun PtLSV.',
          tanda: 'Perhatikan: yang satu memakai "=", yang lain memakai "≤".',
          solusi: 'x + 2 = 6 hanya dipenuhi 4, sedangkan x + 3 ≤ 7 dipenuhi 1, 2, 3, 4.',
          pernyataan:
            'Keduanya memuat variabel, jadi keduanya kalimat terbuka — benar-salahnya bergantung pada x.',
        },
      },
      {
        id: 'tvBeda',
        tanya: 'Apa yang BERBEDA dari keduanya?',
        opsi: [
          {
            id: 'tanda',
            label: 'Tandanya: PLSV memakai "=", PtLSV memakai <, >, ≤, atau ≥',
          },
          { id: 'huruf', label: 'Huruf variabelnya' },
          { id: 'pangkat', label: 'Pangkat variabelnya' },
          { id: 'ruas', label: 'PtLSV tidak mempunyai ruas kanan' },
        ],
        correct: 'tanda',
        umpan: {
          tanda:
            'Tepat! Tanda menentukan jenisnya, dan karena itu banyak penyelesaiannya pun berbeda.',
          huruf: 'Keduanya memakai x. Huruf apa pun boleh dipakai sebagai variabel.',
          pangkat: 'Keduanya berpangkat satu. Perhatikan tanda di antara kedua ruas.',
          ruas: 'x + 3 ≤ 7 mempunyai ruas kanan, yaitu 7 (batasnya).',
        },
      },
      {
        id: 'tvDua',
        tanya: 'Mengapa a + b ≤ 10 bukan PtLSV?',
        opsi: [
          { id: 'duaVar', label: 'Karena memuat dua variabel, a dan b' },
          { id: 'tanda', label: 'Karena tandanya ≤' },
          { id: 'pangkat', label: 'Karena variabelnya berpangkat dua' },
          { id: 'pernyataan', label: 'Karena ia pernyataan' },
        ],
        correct: 'duaVar',
        umpan: {
          duaVar: 'Tepat! PtLSV hanya memuat SATU variabel.',
          tanda: 'Tanda ≤ justru tanda pertidaksamaan. Masalahnya ada pada banyak variabelnya.',
          pangkat: 'a dan b berpangkat satu. Hitunglah banyak hurufnya.',
          pernyataan: 'Ada variabel, jadi ia kalimat terbuka — bukan pernyataan.',
        },
      },
      {
        id: 'tvKuadrat',
        tanya: 'Mengapa x² < 9 bukan PtLSV?',
        opsi: [
          { id: 'pangkat', label: 'Karena variabelnya berpangkat dua, jadi tidak linear' },
          { id: 'duaVar', label: 'Karena memuat dua variabel' },
          { id: 'tanda', label: 'Karena tandanya <' },
          { id: 'besar', label: 'Karena 9 terlalu besar' },
        ],
        correct: 'pangkat',
        umpan: {
          pangkat: 'Tepat! x² = x × x. PtLSV hanya memuat variabel berpangkat satu.',
          duaVar: 'Hanya ada satu huruf, x. Perhatikan angka kecil di atas x.',
          tanda: 'Tanda < adalah tanda pertidaksamaan. Perhatikan pangkat x.',
          besar: 'Besar bilangan tidak berpengaruh. Perhatikan pangkat x.',
        },
      },
    ],
    pilah: {
      skema: 'ptlsv',
      judul: 'PtLSV, PLSV, atau bukan keduanya?',
      pengantar: 'Periksa tandanya, banyak variabelnya, dan pangkat variabelnya.',
      kategori: [
        { id: 'ptlsv', label: 'PtLSV' },
        { id: 'plsv', label: 'PLSV' },
        { id: 'duaVariabel', label: 'Bukan keduanya: lebih dari satu variabel' },
        { id: 'pangkatDua', label: 'Bukan keduanya: variabel berpangkat dua' },
      ],
      butir: [
        {
          id: 'pv1',
          kalimat: '3m − 2 > 10',
          correct: 'ptlsv',
          explanation: 'Satu variabel m, berpangkat satu, bertanda ">": PtLSV.',
        },
        {
          id: 'pv2',
          kalimat: '3m − 2 = 10',
          correct: 'plsv',
          explanation: 'Satu variabel m, berpangkat satu, bertanda "=": PLSV.',
        },
        {
          id: 'pv3',
          kalimat: 'p + q ≥ 5',
          correct: 'duaVariabel',
          explanation: 'Ada dua variabel, p dan q, jadi bukan linear SATU variabel.',
        },
        {
          id: 'pv4',
          kalimat: 'k² ≤ 16',
          correct: 'pangkatDua',
          explanation: 'k berpangkat dua, jadi tidak linear.',
        },
        {
          id: 'pv5',
          kalimat: '12 ≥ 4t',
          correct: 'ptlsv',
          explanation:
            'Variabel t di ruas kanan tidak masalah: satu variabel, pangkat satu, tanda "≥".',
        },
        {
          id: 'pv6',
          kalimat: 'a + 2b < 9',
          correct: 'duaVariabel',
          explanation: 'Ada dua variabel, a dan b.',
        },
        {
          id: 'pv7',
          kalimat: '9 = 2c + 1',
          correct: 'plsv',
          explanation: 'Satu variabel c, berpangkat satu, bertanda "=": PLSV.',
        },
      ],
    },
    langkah: [
      {
        id: 'lv1',
        label:
          'Lift barang museum mengangkut k kardus pameran yang masing-masing 20 kg dan sebuah troli 40 kg. Muatan lift maksimal 500 kg. Tulis PtLSV-nya.',
        cek: { kalimat: '20k + 40 ≤ 500', minta: 'kalimat' },
        placeholder: 'mis. 10k + 5 ≤ 100',
        hints: [
          'Berat k kardus = 20 × k = 20k. Tambahkan berat troli.',
          '"Maksimal" → ≤ (ketik <=).',
        ],
        temuan: '20k + 40 ≤ 500 adalah PtLSV: satu variabel k, berpangkat satu, bertanda ≤.',
      },
      {
        id: 'lv2',
        label:
          'Tiket museum t ribu rupiah per orang. Tiket untuk 5 orang ditambah biaya parkir Rp10 ribu tepat Rp85 ribu. Tulis kalimat matematikanya.',
        cek: { kalimat: '5t + 10 = 85', minta: 'kalimat' },
        placeholder: 'mis. 2t + 5 = 25',
        hints: ['Harga 5 tiket = 5t.', '"Tepat" → =.'],
        temuan:
          '5t + 10 = 85 adalah PLSV, bukan PtLSV, karena kata "tepat" menghasilkan tanda "=". Penyelesaiannya hanya t = 15.',
      },
    ],
    ringkasan:
      'Pertidaksamaan linear satu variabel (PtLSV) adalah kalimat terbuka yang memuat tepat satu variabel berpangkat satu dengan tanda <, >, ≤, atau ≥. PLSV mempunyai ciri yang sama tetapi bertanda "=". Kalimat dengan dua variabel atau variabel berpangkat dua bukan PLSV maupun PtLSV.',
    nextLabel: 'Lanjut: Verifikasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — VERIFICATION
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Verifikasi',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji temuan pada kalimat-kalimat baru dan membandingkannya dengan dugaan awal.',
    guru: 'Pada bagian B, minta murid memberi contoh pendukung atau contoh penyangkal untuk setiap pernyataan sebelum memilih.',
    judulA: 'A. PLSV, PtLSV, atau bukan keduanya?',
    pengantarA:
      'Periksa berurutan: adakah variabel? hanya satu dan berpangkat satu? tandanya "=" atau <, >, ≤, ≥?',
    kategori: [
      { id: 'plsv', label: 'PLSV' },
      { id: 'ptlsv', label: 'PtLSV' },
      { id: 'bukanKeduanya', label: 'Bukan keduanya' },
    ],
    bagian: [
      {
        id: 'vb1',
        kalimat: 'x + 15 ≤ 40',
        konteks: 'Banyak siswa (x) ditambah 15 guru pendamping paling banyak 40 kursi.',
        correct: 'ptlsv',
        explanation: 'Satu variabel x, pangkat satu, tanda ≤: PtLSV.',
      },
      {
        id: 'vb2',
        kalimat: '4h = 60',
        konteks: 'Menabung h ribu rupiah selama 4 hari, totalnya tepat Rp60 ribu.',
        correct: 'plsv',
        explanation: 'Satu variabel h, pangkat satu, tanda "=": PLSV.',
      },
      {
        id: 'vb3',
        kalimat: '2w + 5 > 25',
        konteks: 'Dua kali skor kuis (w) ditambah bonus 5 lebih dari 25.',
        correct: 'ptlsv',
        explanation: 'Satu variabel w, pangkat satu, tanda >: PtLSV.',
      },
      {
        id: 'vb4',
        kalimat: 'p + l < 30',
        konteks: 'Panjang (p) dan lebar (l) spanduk berjumlah kurang dari 30 dm.',
        correct: 'bukanKeduanya',
        explanation: 'Ada dua variabel, p dan l: bukan PLSV maupun PtLSV.',
      },
      {
        id: 'vb5',
        kalimat: 's² ≥ 49',
        konteks: 'Luas taman persegi bersisi s meter minimal 49 m².',
        correct: 'bukanKeduanya',
        explanation: 's berpangkat dua, jadi tidak linear.',
      },
      {
        id: 'vb6',
        kalimat: '50 ≥ 5n',
        konteks: 'Uang Rp50 ribu cukup untuk membeli n roti seharga Rp5 ribu.',
        correct: 'ptlsv',
        explanation: 'Variabel n di ruas kanan, berpangkat satu, tanda ≥: PtLSV.',
      },
      {
        id: 'vb7',
        kalimat: '8 + 7 > 12',
        correct: 'bukanKeduanya',
        explanation:
          'Tidak ada variabel, jadi ia pernyataan (yang benar), bukan PLSV maupun PtLSV.',
      },
      {
        id: 'vb8',
        kalimat: '3 = d − 9',
        correct: 'plsv',
        explanation: 'Satu variabel d, pangkat satu, tanda "=": PLSV.',
      },
      {
        id: 'vb9',
        kalimat: 'm ≠ 5',
        correct: 'bukanKeduanya',
        explanation: 'Tanda ≠ bukan tanda pertidaksamaan PtLSV (<, >, ≤, ≥) dan bukan "=".',
      },
    ],
    judulB: 'B. Selalu benar, kadang-kadang benar, atau salah?',
    opsiPernyataan: [
      { id: 'selalu', label: 'Selalu benar' },
      { id: 'kadang', label: 'Kadang-kadang benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'vp1',
        teks: 'Setiap PtLSV memuat tepat satu variabel yang berpangkat satu.',
        correct: 'selalu',
        explanation:
          'Itulah arti "linear satu variabel". Kalimat dengan dua variabel atau x² bukan PtLSV.',
      },
      {
        id: 'vp2',
        teks: 'Kata "paling banyak" ditulis dengan tanda <.',
        correct: 'salah',
        explanation: '"Paling banyak 7" berarti 7 masih boleh, jadi tandanya ≤, bukan <.',
      },
      {
        id: 'vp3',
        teks: 'Nilai batas termasuk penyelesaian pertidaksamaan.',
        correct: 'kadang',
        explanation:
          'Termasuk bila tandanya ≤ atau ≥ (x = 4 memenuhi x + 3 ≤ 7), tetapi tidak bila tandanya < atau > (x = 4 tidak memenuhi 2x + 1 < 9).',
      },
      {
        id: 'vp4',
        teks: 'Persamaan x + 2 = 6 dan pertidaksamaan x + 2 ≤ 6 mempunyai banyak penyelesaian yang sama.',
        correct: 'salah',
        explanation:
          'x + 2 = 6 hanya dipenuhi x = 4, sedangkan x + 2 ≤ 6 dipenuhi 1, 2, 3, 4 (bilangan bulat 1–8).',
      },
      {
        id: 'vp5',
        teks: 'Jika x = 4 memenuhi x + 3 ≤ 7, maka x = 3 juga memenuhinya.',
        correct: 'selalu',
        explanation:
          '3 + 3 = 6 dan 6 ≤ 7 benar. Nilai yang lebih kecil membuat ruas kiri makin ringan.',
      },
      {
        id: 'vp6',
        teks: 'Situasi yang memakai kata "minimal" dimodelkan dengan PLSV.',
        correct: 'salah',
        explanation: '"Minimal" adalah batasan, jadi dimodelkan dengan PtLSV bertanda ≥.',
      },
    ],
    judulC: 'C. Bandingkan dengan dugaan awalmu',
    nextLabel: 'Lanjut: Generalisasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — GENERALIZATION
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Generalisasi',
    syntax: DL + ' · Sintaks 6',
    goal: 'Menyusun definisi PtLSV dan perbedaannya dengan PLSV berdasarkan temuan.',
    guru: 'Minta setiap pasangan membacakan satu kesimpulan beserta contoh dari Lab Batas sebelum memeriksa.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari bank kalimat. Setiap potongan hanya dipakai satu kali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'gPtlsv', awal: 'Pertidaksamaan linear satu variabel (PtLSV) adalah', correct: 'b1' },
      { id: 'gBeda', awal: 'Perbedaan PLSV dan PtLSV terletak pada', correct: 'b2' },
      { id: 'gSolPlsv', awal: 'Pada situasi bernilai tepat, PLSV dipenuhi oleh', correct: 'b3' },
      { id: 'gSolPtlsv', awal: 'Pada situasi berbatasan, PtLSV dipenuhi oleh', correct: 'b4' },
      {
        id: 'gFrasa',
        awal: 'Kata "paling banyak", "maksimal", dan "tidak lebih dari" ditulis dengan tanda',
        correct: 'b5',
      },
    ],
    bank: [
      {
        id: 'b1',
        teks: 'kalimat terbuka yang memuat tepat satu variabel berpangkat satu dengan tanda <, >, ≤, atau ≥.',
      },
      { id: 'b2', teks: 'tandanya: PLSV memakai "=", sedangkan PtLSV memakai <, >, ≤, atau ≥.' },
      { id: 'b3', teks: 'tepat satu nilai variabel.' },
      { id: 'b4', teks: 'banyak nilai variabel, yaitu semua nilai yang tidak melanggar batasan.' },
      { id: 'b5', teks: '≤, karena nilai batasnya sendiri masih boleh.' },
      { id: 'b6', teks: 'kalimat yang selalu bernilai benar.' },
      { id: 'b7', teks: '<, karena nilai batasnya sendiri tidak boleh.' },
      { id: 'b8', teks: 'banyak variabel yang berbeda-beda.' },
    ],
    contoh: 'x + 3 ≤ 7',
    rangkuman: [
      '<strong>x + 3 ≤ 7</strong> memuat satu variabel x berpangkat satu dengan tanda ≤, jadi ia <strong>PtLSV</strong> (tas ransel paling banyak 7 kg).',
      'Penyelesaiannya <strong>x ≤ 4</strong>; untuk bilangan bulat 1–8 yaitu <strong>{1, 2, 3, 4}</strong> — banyak nilai, batas 4 termasuk (bulatan penuh).',
      'Bandingkan dengan PLSV <strong>x + 2 = 6</strong> (kardus oleh-oleh tepat 6 kg) yang hanya dipenuhi <strong>x = 4</strong>.',
      'Kata batasan menentukan tanda: paling banyak (≤), minimal (≥), kurang dari (<), lebih dari (>); kata "tepat" menghasilkan "=".',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Bank 16 soal; diambil acak sesuai komposisi.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    goal: 'Menerapkan temuan untuk menulis PtLSV dari situasi berbatasan, menentukan nilai yang memenuhi, dan membedakan PtLSV dari PLSV.',
    guru: 'Murid mengerjakan mandiri. Pesan salah berupa diagnosa miskonsepsi beserta cek substitusi; minta murid membacanya sebelum mencoba lagi.',
    instruksi:
      'Jawab setiap soal. Ketik <= untuk ≤ dan >= untuk ≥. Daftar bilangan ditulis dipisah koma, mis. 1, 2, 3. Jika keliru, baca pesannya lalu coba lagi.',
    banyak: 8,
    komposisi: { input: 4, choice: 4 },
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: 'perjalanan',
        cerita:
          'Bagasi bus untuk setiap peserta paling banyak 15 kg. Koper Raka berisi pakaian p kg dan sepatu 3 kg.',
        pertanyaan: 'Tulis kalimat matematika untuk syarat bagasi Raka.',
        cek: { kalimat: 'p + 3 ≤ 15', minta: 'kalimat' },
        hints: ['Ruas kiri: berat pakaian ditambah sepatu.', '"Paling banyak" → ≤.'],
        reveal: 'Jawaban: p + 3 ≤ 15.',
        explanation: 'Kalimatnya p + 3 ≤ 15 (PtLSV, penyelesaiannya p ≤ 12).',
      },
      {
        id: 't2',
        type: 'input',
        konteks: 'wahana',
        cerita:
          'Waktu antre a menit ditambah 10 menit menonton film di planetarium harus kurang dari 45 menit.',
        pertanyaan: 'Tulis kalimat matematikanya.',
        cek: { kalimat: 'a + 10 < 45', minta: 'kalimat' },
        hints: ['"Kurang dari" → < (batas tidak termasuk).'],
        reveal: 'Jawaban: a + 10 < 45.',
        explanation: 'Kalimatnya a + 10 < 45 (PtLSV, penyelesaiannya a < 35).',
      },
      {
        id: 't3',
        type: 'input',
        konteks: 'belanja',
        cerita:
          'Ani membeli k kaus seharga Rp30 ribu per kaus di toko museum. Agar mendapat hadiah, belanjanya minimal Rp90 ribu.',
        pertanyaan: 'Tulis kalimat matematikanya.',
        cek: { kalimat: '30k ≥ 90', minta: 'kalimat' },
        hints: ['Harga k kaus = 30k.', '"Minimal" → ≥.'],
        reveal: 'Jawaban: 30k ≥ 90.',
        explanation: 'Kalimatnya 30k ≥ 90 (PtLSV, penyelesaiannya k ≥ 3).',
      },
      {
        id: 't4',
        type: 'input',
        konteks: 'belanja',
        cerita:
          'Tiket masuk 4 orang (t ribu rupiah per orang) ditambah sewa loker Rp8 ribu tepat Rp48 ribu.',
        pertanyaan: 'Tulis kalimat matematikanya.',
        cek: { kalimat: '4t + 8 = 48', minta: 'kalimat' },
        hints: ['Harga 4 tiket = 4t.', '"Tepat" → =.'],
        reveal: 'Jawaban: 4t + 8 = 48.',
        explanation: 'Kalimatnya 4t + 8 = 48 — PLSV, karena nilainya tepat (t = 10).',
      },
      {
        id: 't5',
        type: 'input',
        konteks: 'simbol',
        cerita: 'Perhatikan pertidaksamaan x + 4 ≤ 9.',
        pertanyaan:
          'Tulis semua bilangan bulat 1 sampai 8 yang memenuhinya (pisahkan dengan koma).',
        cek: { kalimat: 'x + 4 ≤ 9', semesta: [1, 8], minta: 'himpunan' },
        hints: ['Ujilah x = 5: 5 + 4 = 9, dan 9 ≤ 9 benar.', 'Bagaimana dengan x = 6?'],
        reveal: 'Jawaban: {1, 2, 3, 4, 5}.',
        explanation: 'Yang memenuhi {1, 2, 3, 4, 5}, karena x ≤ 5 (batas 5 termasuk).',
      },
      {
        id: 't6',
        type: 'input',
        konteks: 'simbol',
        cerita: 'Perhatikan pertidaksamaan 3n > 12.',
        pertanyaan:
          'Tulis semua bilangan bulat 1 sampai 8 yang memenuhinya (pisahkan dengan koma).',
        cek: { kalimat: '3n > 12', semesta: [1, 8], minta: 'himpunan' },
        hints: ['Ujilah n = 4: 3 × 4 = 12, dan 12 > 12 salah.'],
        reveal: 'Jawaban: {5, 6, 7, 8}.',
        explanation: 'Yang memenuhi {5, 6, 7, 8}, karena n > 4 (batas 4 tidak termasuk).',
      },
      {
        id: 't7',
        type: 'input',
        konteks: 'simbol',
        cerita: 'Perhatikan pertidaksamaan 2x − 1 < 9.',
        pertanyaan: 'Berapa banyak bilangan bulat 1 sampai 10 yang memenuhinya?',
        cek: { kalimat: '2x − 1 < 9', semesta: [1, 10], minta: 'banyak' },
        hints: ['Ujilah x = 5: 2 × 5 − 1 = 9, dan 9 < 9 salah.', 'Hitung yang lebih kecil dari 5.'],
        reveal: 'Jawaban: 4.',
        explanation: 'Ada 4 bilangan, yaitu 1, 2, 3, 4 (x < 5).',
      },
      {
        id: 't8',
        type: 'input',
        konteks: 'simbol',
        cerita: 'Perhatikan persamaan x + 2 = 8.',
        pertanyaan: 'Berapa banyak bilangan bulat 1 sampai 10 yang memenuhinya?',
        cek: { kalimat: 'x + 2 = 8', semesta: [1, 10], minta: 'banyak' },
        hints: ['Ini persamaan, bukan pertidaksamaan. Bilangan berapa yang ditambah 2 hasilnya 8?'],
        reveal: 'Jawaban: 1.',
        explanation: 'Hanya 1 bilangan, yaitu x = 6. Persamaan dipenuhi satu nilai.',
      },
      {
        id: 't9',
        type: 'choice',
        konteks: 'wahana',
        cerita:
          'Skor permainan Bima (s) dikali 5 lalu dikurangi 2 harus paling sedikit 18: 5s − 2 ≥ 18.',
        pertanyaan: 'Termasuk jenis apakah kalimat 5s − 2 ≥ 18?',
        cek: { kalimat: '5s − 2 ≥ 18', minta: 'jenisBatas' },
        explanation: 'Satu variabel s, pangkat satu, tanda ≥: PtLSV.',
      },
      {
        id: 't10',
        type: 'choice',
        konteks: 'belanja',
        cerita:
          'Tiga bungkus roti (a ribu rupiah per bungkus) ditambah Rp1 ribu tepat Rp13 ribu: 3a + 1 = 13.',
        pertanyaan: 'Termasuk jenis apakah kalimat 3a + 1 = 13?',
        cek: { kalimat: '3a + 1 = 13', minta: 'jenisBatas' },
        explanation: 'Satu variabel a, pangkat satu, tanda "=": PLSV.',
      },
      {
        id: 't11',
        type: 'choice',
        konteks: 'belanja',
        cerita: 'Harga p pensil dan q penghapus berjumlah lebih dari 6 ribu: p + q > 6.',
        pertanyaan: 'Termasuk jenis apakah kalimat p + q > 6?',
        cek: { kalimat: 'p + q > 6', minta: 'jenisBatas' },
        explanation: 'Memuat dua variabel (p dan q), jadi bukan PLSV maupun PtLSV.',
      },
      {
        id: 't12',
        type: 'choice',
        konteks: 'wahana',
        cerita: 'Penumpang perahu wisata tidak melebihi 8 orang.',
        pertanyaan: 'Tanda apa yang sesuai untuk kata "tidak melebihi"?',
        cek: { frasa: 'tidak melebihi', minta: 'tanda' },
        explanation: '"Tidak melebihi 8" berarti 8 orang masih boleh: ≤.',
      },
      {
        id: 't13',
        type: 'choice',
        konteks: 'perjalanan',
        cerita: 'Peserta study tour harus menabung sekurang-kurangnya Rp200 ribu.',
        pertanyaan: 'Tanda apa yang sesuai untuk kata "sekurang-kurangnya"?',
        cek: { frasa: 'sekurang-kurangnya', minta: 'tanda' },
        explanation: '"Sekurang-kurangnya 200" berarti 200 atau lebih: ≥.',
      },
      {
        id: 't14',
        type: 'choice',
        konteks: 'perjalanan',
        cerita: 'Kecepatan bus di area museum harus di bawah 20 km/jam.',
        pertanyaan: 'Tanda apa yang sesuai untuk kata "di bawah"?',
        cek: { frasa: 'di bawah', minta: 'tanda' },
        explanation: '"Di bawah 20" berarti 20 km/jam sendiri tidak termasuk: <.',
      },
      {
        id: 't15',
        type: 'choice',
        konteks: 'belanja',
        cerita:
          'Uang saku Tia m ribu rupiah. Setelah dikurangi Rp25 ribu untuk tiket, sisanya harus lebih dari Rp40 ribu.',
        pertanyaan: 'Kalimat matematika manakah yang sesuai?',
        cek: { kalimat: 'm − 25 > 40', minta: 'kalimat' },
        explanation: 'Kalimatnya m − 25 > 40: sisa uang (m − 25) lebih dari 40.',
      },
      {
        id: 't16',
        type: 'choice',
        konteks: 'simbol',
        cerita: 'Perhatikan pertidaksamaan 2x + 3 ≤ 11.',
        pertanyaan: 'Manakah semua bilangan bulat 1 sampai 8 yang memenuhinya?',
        cek: { kalimat: '2x + 3 ≤ 11', semesta: [1, 8], minta: 'himpunan' },
        explanation: 'Yang memenuhi {1, 2, 3, 4}: 2 × 4 + 3 = 11 ≤ 11 benar, 2 × 5 + 3 = 13 salah.',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    goal: 'Merefleksikan proses penemuan dan tingkat pemahaman diri.',
    guru: 'Ajak beberapa murid membacakan jawaban pertanyaan pertama. Catat miskonsepsi yang masih muncul (mis. "paling banyak ditulis <" atau "pertidaksamaan hanya punya satu jawaban") untuk pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan bahasamu perbedaan PLSV dan PtLSV. Beri satu contoh masing-masing dari kehidupan sehari-hari.',
        placeholder: 'PLSV adalah …, contohnya …; PtLSV adalah …, contohnya …',
      },
      {
        id: 'r2',
        teks: 'Mengapa x = 4 memenuhi x + 3 ≤ 7 tetapi tidak memenuhi 2x + 1 < 9? Apa yang kamu pelajari tentang nilai batas?',
        placeholder: 'Karena tanda ≤ …, sedangkan tanda < …',
      },
      {
        id: 'r3',
        teks: 'Tulis satu ketentuan di sekolah atau rumahmu yang memuat batasan, lalu tulis PtLSV-nya.',
        placeholder: 'Ketentuannya: … Misalkan … = x. PtLSV-nya: …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu membedakan PLSV dan PtLSV sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — aku bisa menjelaskannya kepada teman' },
      { id: 'yakin', label: '👍 Yakin — sesekali masih perlu melihat contoh' },
      { id: 'ragu', label: '🤔 Masih ragu memilih tanda ≤ atau <' },
      { id: 'bantuan', label: '🙋 Perlu bantuan guru lagi' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat! Kamu sudah menemukan arti pertidaksamaan linear satu variabel.',
    teks: 'Dari persiapan study tour, kamu menemukan sendiri bahwa batasan nilai ditulis dengan <, >, ≤, atau ≥ dan dipenuhi banyak nilai, sedangkan nilai yang tepat ditulis dengan "=" dan dipenuhi satu nilai.',
    semesta: [1, 8],
    contoh: [
      { kalimat: 'x + 2 = 6', keterangan: 'Kardus oleh-oleh (tepat 6 kg)' },
      { kalimat: 'x + 3 ≤ 7', keterangan: 'Tas ransel (paling banyak 7 kg)' },
      { kalimat: '2x + 1 < 9', keterangan: 'Troli museum (kurang dari 9 kg)' },
      { kalimat: '2x ≥ 6', keterangan: 'Kardus donasi (minimal 6 kg)' },
    ],
    capaian: [
      'Menerjemahkan kata batasan menjadi tanda <, >, ≤, atau ≥.',
      'Menulis kalimat matematika dari situasi sehari-hari yang memuat batasan nilai.',
      'Menentukan nilai-nilai yang memenuhi pertidaksamaan dengan substitusi dan garis bilangan.',
      'Menjelaskan perbedaan PLSV (satu penyelesaian) dan PtLSV (banyak penyelesaian).',
      'Memilah kalimat yang termasuk PLSV, PtLSV, atau bukan keduanya.',
    ],
  },
};
