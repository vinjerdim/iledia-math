'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Relasi Antara Dua Himpunan
   Fase D — SMP Kelas VIII · Topik 16 Relasi dan Fungsi

   Tujuan Pembelajaran:
   Mengidentifikasi konsep relasi antara dua himpunan dan
   menyajikannya dalam bentuk diagram panah, tabel, dan himpunan
   pasangan berurutan pada berbagai situasi kehidupan sehari-hari.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'koleksi'
     Sintaks 4 — Data processing ............ tahap 'olahPasangan' & 'olahRelasi'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas:
     1. Stimulasi   — kartu survei klub olahraga kelas VIII-B: siapa
                      menyukai olahraga apa. Murid MENDUGA cara mencatat
                      yang paling rapi (tidak dinilai) + alasan.
     2. Masalah     — memilih rumusan masalah & menulis hipotesis.
     3. Data        — (A) merakit diagram panah "menyukai" dengan
                      mengetuk anggota A lalu anggota B, diperiksa dan
                      diberi umpan balik (panah kurang/berlebih/terbalik);
                      (B) memindahkan data yang sama ke tabel silang.
     4. Olah pasangan — memilih pasangan berurutan yang benar dari chip
                      acak (termasuk pengecoh terbalik), lalu menjawab
                      pertanyaan penuntun: urutan, banyak pasangan,
                      anggota tanpa pasangan.
     5. Olah relasi — pertanyaan penuntun konsep relasi, domain,
                      kodomain, range; memilah nama relasi bilangan.
     6. Bukti       — menguji temuan pada relasi baru "faktor dari"
                      (diagram → tabel & pasangan otomatis), lalu
                      menanggapi miskonsepsi.
     7. Simpulan    — menyusun kalimat kesimpulan dari bank kalimat.
     8. Uji terap   — 8 soal kontekstual (piket, ibu kota, kendaraan,
                      jajanan, bacaan, bilangan).
     9. Refleksi    — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan.

   Konvensi: relasi ditulis sebagai array pasangan berurutan
   [[anggota A, anggota B], …]. Kunci jawaban relasi bilangan diuji
   terhadap relasiDariAturan() di tests/mpi-16.1-data.test.js.
   ============================================================ */

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1',
    goal: 'Mengamati data hubungan antara dua kelompok benda dan menduga cara mencatatnya dengan rapi.',
    guru: 'Bacakan cerita lalu minta beberapa murid membacakan kartu survei. Tanyakan: “Kalau data ini ada 30 orang, bagaimana cara mencatatnya supaya mudah dibaca?” Jangan membenarkan atau menyalahkan dugaan; tampung beragam cara (garis, tabel, daftar) di papan tulis sebagai bahan tahap berikutnya.',
    judul: 'Survei Klub Olahraga Kelas VIII-B',
    cerita:
      'Nadia, ketua kelas VIII-B, sedang mendata teman-temannya untuk pekan olahraga sekolah. Panitia menyediakan lima pilihan: futsal, voli, renang, badminton, dan basket. Nadia menyebar kartu survei, lalu mendapat jawaban dari lima teman. Ia ingin mencatat “siapa menyukai olahraga apa” supaya panitia mudah membacanya.',
    A: ['Nadia', 'Raka', 'Sinta', 'Dimas', 'Putri'],
    B: ['Futsal', 'Voli', 'Renang', 'Badminton', 'Basket'],
    survei: [
      { nama: 'Nadia', ikon: '👧', kutipan: 'Aku suka badminton.', suka: ['Badminton'] },
      {
        nama: 'Raka',
        ikon: '👦',
        kutipan: 'Aku suka futsal. Renang juga suka!',
        suka: ['Futsal', 'Renang'],
      },
      {
        nama: 'Sinta',
        ikon: '👧',
        kutipan: 'Voli favoritku, badminton juga seru.',
        suka: ['Voli', 'Badminton'],
      },
      { nama: 'Dimas', ikon: '👦', kutipan: 'Futsal, dong!', suka: ['Futsal'] },
      {
        nama: 'Putri',
        ikon: '👧',
        kutipan: 'Belum ada yang kusuka dari daftar ini. Aku lebih suka membaca.',
        suka: [],
      },
    ],
    pertanyaan:
      'Menurut dugaanmu, cara apa yang paling rapi untuk mencatat “siapa menyukai olahraga apa”?',
    opsi: [
      {
        id: 'panah',
        label: 'Menulis nama dan olahraga dalam dua kelompok, lalu menghubungkannya dengan panah',
      },
      { id: 'tabel', label: 'Membuat tabel: nama di baris, olahraga di kolom, lalu diberi tanda' },
      { id: 'pasangan', label: 'Menulis pasangan nama–olahraga, misalnya (Raka, Futsal)' },
      { id: 'paragraf', label: 'Menyalin semua jawaban survei menjadi satu paragraf panjang' },
    ],
    alasanLabel: 'Mengapa kamu memilih cara itu?',
    alasanPlaceholder: 'Tulis alasanmu dengan kalimatmu sendiri…',
    catatan:
      'Tidak ada jawaban benar atau salah di sini. Simpan dugaanmu, nanti kamu akan mengujinya sendiri.',
    nextLabel: 'Lanjut ke Rumusan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: 'Discovery Learning · Sintaks 2',
    goal: 'Merumuskan masalah yang akan diselidiki dan menuliskan hipotesis.',
    guru: 'Biarkan murid mencoba memilih. Bila memilih rumusan yang kurang tepat, ajak mereka membaca umpan balik lalu mencoba lagi. Minta 2–3 murid membacakan hipotesisnya; hipotesis tidak harus benar.',
    pengantar:
      'Data Nadia berisi dua kelompok: kelompok teman dan kelompok olahraga. Setiap teman bisa “dihubungkan” dengan olahraga yang disukainya. Hubungan seperti ini akan kita selidiki.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'm1',
        label:
          'Bagaimana cara menyajikan hubungan “menyukai” antara himpunan teman dan himpunan olahraga agar mudah dibaca, dan aturan apa yang berlaku?',
      },
      { id: 'm2', label: 'Olahraga apa yang paling banyak disukai di kelas VIII-B?' },
      { id: 'm3', label: 'Berapa banyak teman yang mengisi kartu survei?' },
      { id: 'm4', label: 'Mengapa Putri tidak menyukai olahraga?' },
    ],
    correct: 'm1',
    umpan: {
      m1: 'Tepat! Masalah kita adalah <strong>cara menyajikan hubungan</strong> antara dua himpunan dan aturannya.',
      m2: 'Pertanyaan menarik, tetapi itu soal statistik (mencari yang terbanyak). Kita ingin tahu cara menyajikan <em>hubungannya</em>. Coba lagi.',
      m3: 'Itu bisa dijawab langsung dengan menghitung. Yang ingin kita selidiki adalah cara menyajikan hubungan nama dan olahraga. Coba lagi.',
      m4: 'Itu pertanyaan tentang selera Putri, bukan masalah matematika. Coba lagi.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: bagaimana cara menyajikan hubungan itu, dan bagaimana dengan Putri yang tidak memilih olahraga apa pun?',
    hipotesisPlaceholder: 'Menurutku, hubungan itu bisa disajikan dengan …',
    nextLabel: 'Lanjut Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Menyajikan data survei sebagai diagram panah, lalu sebagai tabel.',
    guru: 'Tunjukkan cara mengetuk: ketuk nama dulu, lalu ketuk olahraganya. Ketuk lagi untuk menghapus panah. Bila murid kesulitan, minta mereka membaca kartu survei satu per satu dan mencentangnya. Untuk kelas tanpa gawai, guru dapat memproyeksikan media dan murid maju bergantian.',
    labelA: 'A = Teman',
    labelB: 'B = Olahraga',
    namaRelasi: 'menyukai',
    instruksiPanah:
      'Ketuk sebuah nama di himpunan A, lalu ketuk olahraga yang disukainya di himpunan B untuk menarik panah. Ketuk lagi olahraga yang sama untuk menghapus panahnya.',
    instruksiTabel:
      'Sekarang pindahkan data yang sama ke tabel. Ketuk sel pada baris nama dan kolom olahraga yang disukainya untuk memberi tanda ✓.',
    temuanPanah:
      'Diagram panahmu sudah tepat! Setiap panah menghubungkan satu anggota A dengan satu anggota B.',
    temuanTabel:
      'Tabelmu sudah tepat! Banyak tanda ✓ sama dengan banyak panah pada diagram: keduanya menyimpan data yang sama.',
    nextLabel: 'Lanjut Mengolah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MENGOLAH DATA: PASANGAN BERURUTAN
     ---------------------------------------------------------- */
  olahPasangan: {
    kicker: 'Tahap 4 · Mengolah Data (1)',
    syntax: 'Discovery Learning · Sintaks 4',
    goal: 'Menuliskan relasi sebagai himpunan pasangan berurutan dan menemukan pentingnya urutan.',
    guru: 'Setelah murid memeriksa chip, bahas pengecoh (Futsal, Raka): apakah “Futsal menyukai Raka”? Tekankan bahwa anggota himpunan asal (A) selalu ditulis lebih dulu. Ajak murid menghitung panah untuk menjawab banyak pasangan.',
    pengantar:
      'Satu panah dari Raka ke Futsal dapat ditulis singkat sebagai pasangan <strong>(Raka, Futsal)</strong>. Pasangan seperti ini disebut <strong>pasangan berurutan</strong>.',
    instruksiChip:
      'Pilih SEMUA pasangan berurutan yang sesuai dengan relasi “menyukai” dari himpunan teman ke himpunan olahraga, lalu tekan Periksa.',
    chips: [
      { id: 'c1', a: 'Nadia', b: 'Badminton' },
      { id: 'c2', a: 'Raka', b: 'Futsal' },
      { id: 'c3', a: 'Raka', b: 'Renang' },
      { id: 'c4', a: 'Sinta', b: 'Voli' },
      { id: 'c5', a: 'Sinta', b: 'Badminton' },
      { id: 'c6', a: 'Dimas', b: 'Futsal' },
      { id: 'x1', a: 'Futsal', b: 'Raka' },
      { id: 'x2', a: 'Badminton', b: 'Nadia' },
      { id: 'x3', a: 'Putri', b: 'Basket' },
      { id: 'x4', a: 'Nadia', b: 'Voli' },
    ],
    temuanChip:
      'Himpunan pasangan berurutan relasi “menyukai” sudah lengkap. Perhatikan: setiap pasangan diawali nama teman (anggota A), baru olahraganya (anggota B).',
    tanya: [
      {
        id: 'urutan',
        tanya: 'Mengapa (Futsal, Raka) BUKAN pasangan yang tepat untuk relasi ini?',
        opsi: [
          {
            id: 'a',
            label:
              'Karena urutannya terbalik: anggota A (nama) harus ditulis lebih dulu, lalu anggota B (olahraga)',
          },
          { id: 'b', label: 'Karena Raka sebenarnya tidak menyukai futsal' },
          { id: 'c', label: 'Karena pasangan berurutan hanya boleh berisi bilangan' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! (Futsal, Raka) berarti “Futsal menyukai Raka” — tidak masuk akal. Urutan dalam pasangan berurutan itu penting.',
          b: 'Coba lihat kartu survei Raka lagi: Raka memang menyukai futsal. Jadi masalahnya ada pada urutan penulisan.',
          c: 'Anggota pasangan boleh berupa nama, benda, atau bilangan. Perhatikan urutan penulisannya.',
        },
      },
      {
        id: 'banyak',
        tanya: 'Ada berapa pasangan berurutan pada relasi “menyukai” ini?',
        opsi: [
          { id: 'a', label: '6' },
          { id: 'b', label: '5' },
          { id: 'c', label: '4' },
          { id: 'd', label: '25' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! Banyak pasangan berurutan = banyak panah pada diagram = banyak tanda ✓ pada tabel, yaitu 6.',
          b: '5 adalah banyak teman. Raka dan Sinta masing-masing punya dua pasangan, sedangkan Putri tidak punya. Hitung panahnya.',
          c: '4 adalah banyak olahraga yang dipilih. Satu olahraga bisa dipilih lebih dari satu teman. Hitung panahnya.',
          d: '25 adalah banyak semua sel tabel (5 × 5). Yang dihitung hanya sel yang bertanda ✓.',
        },
      },
      {
        id: 'putri',
        tanya: 'Putri tidak mempunyai pasangan. Bagaimana menuliskannya?',
        opsi: [
          {
            id: 'a',
            label:
              'Putri tetap anggota himpunan A, tetapi tidak muncul di himpunan pasangan berurutan',
          },
          { id: 'b', label: 'Tulis (Putri, —) agar Putri tidak terlupa' },
          { id: 'c', label: 'Hapus Putri dari himpunan A karena tidak punya pasangan' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Anggota A boleh tidak punya pasangan. Putri tetap anggota A, hanya tidak ada panah dari Putri.',
          b: 'Pasangan berurutan harus berisi dua anggota yang berelasi. Putri tidak berelasi dengan olahraga mana pun, jadi tidak ditulis.',
          c: 'Putri tetap anggota himpunan teman yang disurvei. Menghapusnya justru mengubah data.',
        },
      },
    ],
    nextLabel: 'Lanjut Menemukan Konsep Relasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGOLAH DATA: KONSEP RELASI
     ---------------------------------------------------------- */
  olahRelasi: {
    kicker: 'Tahap 5 · Mengolah Data (2)',
    syntax: 'Discovery Learning · Sintaks 4',
    goal: 'Menemukan pengertian relasi, daerah asal, daerah kawan, daerah hasil, dan mengenali nama relasi.',
    guru: 'Minta murid menunjuk bagian diagram panah saat menjawab (himpunan kiri, himpunan kanan, anggota yang mendapat panah). Pada pemilahan, dorong murid menguji setiap pasangan dengan kalimat, mis. “1 setengah dari 2 — benar”.',
    pengantar:
      'Hubungan “menyukai” yang memasangkan anggota himpunan teman dengan anggota himpunan olahraga disebut <strong>relasi</strong>. Jawab pertanyaan berikut sambil mengamati diagram panahmu.',
    konsep: [
      {
        id: 'relasi',
        tanya: 'Dari temuanmu, apa yang dimaksud relasi dari himpunan A ke himpunan B?',
        opsi: [
          {
            id: 'a',
            label: 'Aturan yang memasangkan anggota himpunan A dengan anggota himpunan B',
          },
          { id: 'b', label: 'Gabungan semua anggota himpunan A dan himpunan B' },
          { id: 'c', label: 'Anggota yang sama pada himpunan A dan himpunan B' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Relasi adalah aturan yang memasangkan anggota A dengan anggota B, contohnya “menyukai”.',
          b: 'Itu gabungan (A ∪ B). Relasi tidak menggabungkan, tetapi memasangkan. Coba lagi.',
          c: 'Itu irisan (A ∩ B). Nama teman dan nama olahraga tidak ada yang sama, tetapi tetap bisa dipasangkan. Coba lagi.',
        },
      },
      {
        id: 'domain',
        tanya:
          'Himpunan asal panah, A = {Nadia, Raka, Sinta, Dimas, Putri}, disebut daerah asal atau …',
        opsi: [
          { id: 'a', label: 'domain' },
          { id: 'b', label: 'kodomain' },
          { id: 'c', label: 'range' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! Daerah asal = domain = himpunan tempat panah berangkat (himpunan A), termasuk Putri.',
          b: 'Kodomain (daerah kawan) adalah himpunan tujuan panah, yaitu himpunan B. Coba lagi.',
          c: 'Range (daerah hasil) hanya berisi anggota B yang mendapat panah. Coba lagi.',
        },
      },
      {
        id: 'kodomain',
        tanya:
          'Himpunan tujuan panah, B = {Futsal, Voli, Renang, Badminton, Basket}, disebut daerah kawan atau …',
        opsi: [
          { id: 'a', label: 'kodomain' },
          { id: 'b', label: 'domain' },
          { id: 'c', label: 'pasangan berurutan' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! Daerah kawan = kodomain = seluruh himpunan B, termasuk Basket yang tidak dipilih siapa pun.',
          b: 'Domain adalah himpunan asal panah (himpunan A). Coba lagi.',
          c: 'Pasangan berurutan adalah (a, b), bukan himpunan B. Coba lagi.',
        },
      },
      {
        id: 'range',
        tanya:
          'Anggota B yang MENDAPAT panah membentuk daerah hasil (range). Range relasi ini adalah …',
        opsi: [
          { id: 'a', label: '{Futsal, Voli, Renang, Badminton}' },
          { id: 'b', label: '{Futsal, Voli, Renang, Badminton, Basket}' },
          { id: 'c', label: '{Nadia, Raka, Sinta, Dimas}' },
          { id: 'd', label: '{Futsal, Badminton}' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Basket tidak mendapat panah, jadi tidak termasuk range. Range selalu bagian dari kodomain.',
          b: 'Itu seluruh kodomain. Apakah Basket mendapat panah? Coba lagi.',
          c: 'Itu anggota A yang punya panah. Range diambil dari himpunan B. Coba lagi.',
          d: 'Futsal dan Badminton memang dipilih dua orang, tetapi Voli dan Renang juga mendapat panah. Coba lagi.',
        },
      },
    ],
    instruksiNama:
      'Relasi juga ada pada bilangan. Pilih nama relasi yang tepat untuk setiap himpunan pasangan berurutan dari A ke B.',
    opsiNama: [
      { id: 'setengah', label: 'setengah dari' },
      { id: 'kurang', label: 'kurang dari' },
      { id: 'faktor', label: 'faktor dari' },
      { id: 'duaKali', label: 'dua kali dari' },
    ],
    item: [
      {
        id: 'n1',
        A: [1, 2, 3],
        B: [2, 4, 6],
        pairs: [
          [1, 2],
          [2, 4],
          [3, 6],
        ],
        correct: 'setengah',
        explanation: '1 setengah dari 2, 2 setengah dari 4, 3 setengah dari 6.',
      },
      {
        id: 'n2',
        A: [1, 2, 3],
        B: [1, 2, 3],
        pairs: [
          [1, 2],
          [1, 3],
          [2, 3],
        ],
        correct: 'kurang',
        explanation:
          '1 < 2, 1 < 3, dan 2 < 3. Pasangan (3, 3) tidak ada karena 3 tidak kurang dari 3.',
      },
      {
        id: 'n3',
        A: [2, 3],
        B: [4, 6, 9],
        pairs: [
          [2, 4],
          [2, 6],
          [3, 6],
          [3, 9],
        ],
        correct: 'faktor',
        explanation:
          '2 membagi habis 4 dan 6; 3 membagi habis 6 dan 9. Satu anggota A boleh punya beberapa pasangan.',
      },
      {
        id: 'n4',
        A: [4, 6, 8],
        B: [2, 3, 4],
        pairs: [
          [4, 2],
          [6, 3],
          [8, 4],
        ],
        correct: 'duaKali',
        explanation:
          '4 = 2 × 2, 6 = 2 × 3, 8 = 2 × 4. Anggota A adalah dua kali anggota B pasangannya.',
      },
    ],
    nextLabel: 'Lanjut ke Pembuktian →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    syntax: 'Discovery Learning · Sintaks 5',
    goal: 'Menguji temuan pada relasi baru dan menanggapi pendapat yang keliru.',
    guru: 'Minta murid membandingkan dugaan tahap 1 dan hipotesis tahap 2 dengan hasil pembuktian. Tekankan bahwa ketiga penyajian (diagram panah, tabel, pasangan berurutan) menyimpan informasi yang sama, sehingga pilihan cara hanya soal kebutuhan.',
    prediksiLabel: 'Dugaanmu di tahap 1',
    hipotesisLabel: 'Hipotesismu di tahap 2',
    uji: {
      A: [2, 3, 4, 5],
      B: [2, 4, 6, 8],
      pairs: [
        [2, 2],
        [2, 4],
        [2, 6],
        [2, 8],
        [3, 6],
        [4, 4],
        [4, 8],
      ],
      labelA: 'A',
      labelB: 'B',
      namaRelasi: 'faktor dari',
    },
    instruksiUji:
      'Uji temuanmu pada relasi baru! Buat diagram panah relasi “faktor dari” dari A = {2, 3, 4, 5} ke B = {2, 4, 6, 8}. (a faktor dari b bila b habis dibagi a.)',
    temuanUji:
      'Diagram panahmu tepat. Lihat: tabel dan himpunan pasangan berurutan di bawah dibuat otomatis dari panahmu — ketiganya menyimpan informasi yang sama.',
    kesimpulanTiga:
      'Diagram panah, tabel, dan himpunan pasangan berurutan adalah tiga cara menyajikan relasi yang SAMA. Angka 2 punya empat pasangan, sedangkan 5 tidak punya pasangan — keduanya boleh.',
    kesimpulanDugaan: {
      panah:
        'Dugaanmu tentang diagram panah terbukti rapi. Ternyata tabel dan pasangan berurutan sama rapinya, karena isinya sama persis.',
      tabel:
        'Dugaanmu tentang tabel terbukti rapi. Ternyata diagram panah dan pasangan berurutan sama rapinya, karena isinya sama persis.',
      pasangan:
        'Dugaanmu tentang pasangan berurutan terbukti rapi dan singkat. Ternyata diagram panah dan tabel memuat informasi yang sama persis.',
      paragraf:
        'Paragraf panjang memang memuat datanya, tetapi sulit dibaca. Diagram panah, tabel, dan pasangan berurutan jauh lebih rapi — dan ketiganya memuat informasi yang sama.',
    },
    instruksiSoal:
      'Tanggapi pendapat teman-teman berikut. Setiap pendapat hanya bisa dijawab satu kali.',
    soal: [
      {
        id: 's1',
        pernyataan:
          '<strong>Dika:</strong> “Pada relasi, setiap anggota A harus punya tepat satu panah.”',
        options: [
          {
            id: 'o1',
            label: 'Tidak setuju — anggota A boleh punya satu, lebih dari satu, atau tanpa panah',
          },
          { id: 'o2', label: 'Setuju — setiap anggota A harus punya tepat satu panah' },
          { id: 'o3', label: 'Setuju — tetapi hanya pada relasi bilangan' },
        ],
        correct: 'o1',
        explanation:
          'Pada relasi “faktor dari”, 2 punya empat panah dan 5 tidak punya panah. Pada survei, Raka punya dua panah dan Putri tidak punya.',
      },
      {
        id: 's2',
        pernyataan: '<strong>Rara:</strong> “(2, 4) dan (4, 2) sama saja karena angkanya sama.”',
        options: [
          { id: 'o1', label: 'Tidak setuju — urutan dalam pasangan berurutan itu penting' },
          { id: 'o2', label: 'Setuju — anggotanya sama, jadi pasangannya sama' },
          { id: 'o3', label: 'Setuju — urutan hanya penting pada nama, bukan bilangan' },
        ],
        correct: 'o1',
        explanation:
          '(2, 4) berarti “2 faktor dari 4” (benar), sedangkan (4, 2) berarti “4 faktor dari 2” (salah). Urutannya selalu (anggota A, anggota B).',
      },
      {
        id: 's3',
        pernyataan:
          '<strong>Bima:</strong> “Diagram panah, tabel, dan himpunan pasangan berurutan dari relasi yang sama memuat informasi yang sama.”',
        options: [
          { id: 'o1', label: 'Setuju — ketiganya hanya berbeda cara menyajikan' },
          { id: 'o2', label: 'Tidak setuju — tabel memuat lebih banyak informasi' },
          { id: 'o3', label: 'Tidak setuju — hanya diagram panah yang lengkap' },
        ],
        correct: 'o1',
        explanation:
          'Setiap panah = satu tanda ✓ pada tabel = satu pasangan berurutan. Isinya sama, hanya tampilannya berbeda.',
      },
      {
        id: 's4',
        pernyataan:
          '<strong>Lala:</strong> “Basket tidak dipilih siapa pun, jadi Basket harus dihapus dari himpunan B.”',
        options: [
          {
            id: 'o1',
            label: 'Tidak setuju — Basket tetap anggota kodomain, hanya bukan anggota range',
          },
          { id: 'o2', label: 'Setuju — anggota B tanpa panah bukan bagian relasi' },
          { id: 'o3', label: 'Setuju — kodomain dan range selalu sama' },
        ],
        correct: 'o1',
        explanation:
          'Kodomain adalah seluruh himpunan B yang disediakan. Range hanya anggota B yang mendapat panah, jadi range bisa lebih sedikit dari kodomain.',
      },
    ],
    nextLabel: 'Lanjut Menarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    syntax: 'Discovery Learning · Sintaks 6',
    goal: 'Merumuskan kesimpulan tentang relasi dan tiga cara penyajiannya.',
    guru: 'Setelah kesimpulan lengkap, minta murid menuliskannya di buku catatan dengan contoh mereka sendiri (mis. relasi “tinggal di” antara teman dan nama desa).',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan hanya dipakai sekali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'g1', awal: 'Relasi dari himpunan A ke himpunan B adalah', correct: 'b1' },
      { id: 'g2', awal: 'Pada diagram panah, setiap pasangan', correct: 'b2' },
      { id: 'g3', awal: 'Pada tabel, setiap pasangan', correct: 'b3' },
      { id: 'g4', awal: 'Pada pasangan berurutan (a, b),', correct: 'b4' },
      { id: 'g5', awal: 'Pada sebuah relasi, anggota A', correct: 'b5' },
    ],
    bank: [
      { id: 'b1', teks: 'aturan yang memasangkan anggota himpunan A dengan anggota himpunan B.' },
      { id: 'b2', teks: 'digambar sebagai panah dari anggota A ke anggota B.' },
      { id: 'b3', teks: 'ditandai pada sel di baris anggota A dan kolom anggota B.' },
      { id: 'b4', teks: 'anggota A selalu ditulis lebih dulu, lalu anggota B.' },
      {
        id: 'b5',
        teks: 'boleh punya satu pasangan, lebih dari satu pasangan, atau tidak punya pasangan.',
      },
      { id: 'b6', teks: 'harus punya tepat satu panah ke anggota B.' },
      { id: 'b7', teks: 'urutannya bebas, karena (a, b) sama dengan (b, a).' },
    ],
    rangkuman: [
      '<strong>Relasi</strong> adalah aturan yang memasangkan anggota himpunan A dengan anggota himpunan B.',
      'Relasi dapat disajikan dengan <strong>diagram panah</strong>, <strong>tabel</strong>, atau <strong>himpunan pasangan berurutan</strong> — ketiganya memuat informasi yang sama.',
      'Pada pasangan berurutan <strong>(a, b)</strong>, a anggota A dan b anggota B; urutan tidak boleh ditukar.',
      '<strong>Domain</strong> (daerah asal) = himpunan A, <strong>kodomain</strong> (daerah kawan) = himpunan B, <strong>range</strong> (daerah hasil) = anggota B yang mendapat pasangan.',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Discovery Learning · Penerapan',
    goal: 'Menerapkan konsep relasi dan tiga cara penyajiannya pada situasi sehari-hari.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang banyak salah untuk dibahas bersama. Tanyakan alasan jawaban, bukan hanya hurufnya.',
    instruksi:
      'Kerjakan setiap soal. Bila ragu, buka petunjuk. Setelah menjawab, baca penjelasannya sebelum lanjut.',
    soal: [
      {
        type: 'choice',
        konteks: '🧹 Jadwal piket',
        cerita:
          'Tabel berikut menunjukkan relasi “piket pada hari” dari himpunan murid ke himpunan hari.',
        visual: 'tabel',
        relasi: {
          A: ['Ani', 'Budi', 'Cici'],
          B: ['Senin', 'Selasa', 'Rabu'],
          pairs: [
            ['Ani', 'Senin'],
            ['Budi', 'Rabu'],
            ['Cici', 'Senin'],
          ],
          labelA: 'Murid',
          labelB: 'Hari',
        },
        pertanyaan: 'Himpunan pasangan berurutan dari relasi tersebut adalah …',
        kunciPasangan: true,
        options: [
          { id: 'o1', label: '{(Ani, Senin), (Budi, Rabu), (Cici, Senin)}' },
          { id: 'o2', label: '{(Senin, Ani), (Rabu, Budi), (Senin, Cici)}' },
          { id: 'o3', label: '{(Ani, Senin), (Budi, Selasa), (Cici, Senin)}' },
          { id: 'o4', label: '{(Ani, Senin), (Budi, Rabu)}' },
        ],
        correct: 'o1',
        hints: ['Baca tabel per baris: nama murid, lalu hari yang bertanda ✓.'],
        explanation:
          'Setiap tanda ✓ menjadi satu pasangan (murid, hari). Urutannya anggota A (murid) lebih dulu.',
      },
      {
        type: 'choice',
        konteks: '🗺️ Provinsi & ibu kota',
        cerita:
          'Diketahui himpunan pasangan berurutan {(Jawa Barat, Bandung), (Jawa Tengah, Semarang), (Jawa Timur, Surabaya)} dari himpunan provinsi ke himpunan kota.',
        pertanyaan: 'Nama relasi yang tepat dari himpunan provinsi ke himpunan kota adalah …',
        options: [
          { id: 'o1', label: 'beribu kota' },
          { id: 'o2', label: 'ibu kota dari' },
          { id: 'o3', label: 'lebih luas dari' },
          { id: 'o4', label: 'bertetangga dengan' },
        ],
        correct: 'o1',
        hints: ['Baca pasangan pertama sebagai kalimat: “Jawa Barat … Bandung”.'],
        explanation:
          '“Jawa Barat beribu kota Bandung.” Relasi “ibu kota dari” berarah sebaliknya: dari kota ke provinsi, mis. (Bandung, Jawa Barat).',
      },
      {
        type: 'choice',
        konteks: '🔢 Bilangan',
        cerita:
          'Relasi “setengah dari” dari A = {1, 2, 3, 4} ke B = {2, 4, 6, 8, 10} disajikan dengan diagram panah berikut.',
        visual: 'panah',
        relasi: {
          A: [1, 2, 3, 4],
          B: [2, 4, 6, 8, 10],
          pairs: [
            [1, 2],
            [2, 4],
            [3, 6],
            [4, 8],
          ],
          aturan: 'setengah',
          labelA: 'A',
          labelB: 'B',
          namaRelasi: 'setengah dari',
        },
        pertanyaan: 'Anggota kodomain yang BUKAN anggota range adalah …',
        options: [
          { id: 'o1', label: '10' },
          { id: 'o2', label: '1' },
          { id: 'o3', label: '2' },
          { id: 'o4', label: 'tidak ada' },
        ],
        correct: 'o1',
        hints: ['Kodomain = himpunan B. Cari anggota B yang tidak menerima panah.'],
        explanation:
          'Tidak ada anggota A yang setengah dari 10 (5 bukan anggota A), jadi 10 tidak mendapat panah. Range = {2, 4, 6, 8}.',
      },
      {
        type: 'choice',
        konteks: '🚲 Berangkat sekolah',
        cerita: 'Diagram panah berikut menunjukkan relasi “berangkat sekolah dengan”.',
        visual: 'panah',
        relasi: {
          A: ['Eko', 'Fani', 'Gita', 'Hadi'],
          B: ['Sepeda', 'Angkot', 'Jalan kaki'],
          pairs: [
            ['Eko', 'Sepeda'],
            ['Fani', 'Angkot'],
            ['Gita', 'Sepeda'],
            ['Gita', 'Jalan kaki'],
            ['Hadi', 'Angkot'],
          ],
          labelA: 'Murid',
          labelB: 'Cara',
          namaRelasi: 'berangkat sekolah dengan',
        },
        pertanyaan: 'Pernyataan yang BENAR berdasarkan diagram tersebut adalah …',
        options: [
          { id: 'o1', label: 'Gita mempunyai dua pasangan, dan itu boleh pada relasi' },
          { id: 'o2', label: 'Diagram salah karena Gita punya dua panah' },
          { id: 'o3', label: '(Sepeda, Eko) adalah anggota relasi tersebut' },
          { id: 'o4', label: 'Jalan kaki bukan anggota range' },
        ],
        correct: 'o1',
        hints: ['Ingat temuanmu: berapa panah yang boleh dimiliki satu anggota A?'],
        explanation:
          'Gita kadang naik sepeda, kadang jalan kaki, sehingga punya dua pasangan. (Sepeda, Eko) terbalik; Jalan kaki mendapat panah dari Gita sehingga termasuk range.',
      },
      {
        type: 'choice',
        konteks: '🧮 Bilangan',
        cerita: 'Diketahui A = {1, 2, 3} dan B = {2, 3}.',
        relasi: {
          A: [1, 2, 3],
          B: [2, 3],
          pairs: [
            [1, 2],
            [1, 3],
            [2, 3],
          ],
          aturan: 'kurang',
        },
        pertanyaan: 'Himpunan pasangan berurutan relasi “kurang dari” dari A ke B adalah …',
        kunciPasangan: true,
        options: [
          { id: 'o1', label: '{(1, 2), (1, 3), (2, 3)}' },
          { id: 'o2', label: '{(1, 2), (1, 3), (2, 3), (3, 3)}' },
          { id: 'o3', label: '{(2, 1), (3, 1), (3, 2)}' },
          { id: 'o4', label: '{(1, 2), (2, 3)}' },
        ],
        correct: 'o1',
        hints: [
          'Uji setiap anggota A dengan setiap anggota B: apakah a < b?',
          '3 < 2? 3 < 3? Keduanya salah, jadi 3 tidak punya pasangan.',
        ],
        explanation:
          '1 < 2, 1 < 3, 2 < 3 benar. 2 < 2 dan semua pasangan dari 3 salah, jadi 3 tidak punya pasangan.',
      },
      {
        type: 'choice',
        konteks: '🍢 Jajanan kantin',
        cerita:
          'Tabel berikut menunjukkan relasi “berharga” dari himpunan jajanan ke himpunan harga B = {Rp2.000, Rp3.000, Rp5.000, Rp10.000}.',
        visual: 'daftar',
        relasi: {
          A: ['Cilok', 'Risol', 'Donat', 'Martabak mini'],
          B: ['Rp2.000', 'Rp3.000', 'Rp5.000', 'Rp10.000'],
          pairs: [
            ['Cilok', 'Rp2.000'],
            ['Risol', 'Rp3.000'],
            ['Donat', 'Rp3.000'],
            ['Martabak mini', 'Rp5.000'],
          ],
          labelA: 'Jajanan',
          labelB: 'Harga',
        },
        pertanyaan: 'Daerah hasil (range) relasi tersebut adalah …',
        options: [
          { id: 'o1', label: '{Rp2.000, Rp3.000, Rp5.000}' },
          { id: 'o2', label: '{Rp2.000, Rp3.000, Rp5.000, Rp10.000}' },
          { id: 'o3', label: '{Cilok, Risol, Donat, Martabak mini}' },
          { id: 'o4', label: '{Rp3.000}' },
        ],
        correct: 'o1',
        hints: ['Range hanya berisi harga yang benar-benar dipasangkan dengan jajanan.'],
        explanation:
          'Harga yang muncul: Rp2.000, Rp3.000 (dua kali, ditulis sekali), dan Rp5.000. Rp10.000 hanya anggota kodomain.',
      },
      {
        type: 'choice',
        konteks: '📚 Pojok baca',
        cerita:
          'Tabel berikut menunjukkan relasi “senang membaca” dari himpunan murid ke himpunan jenis buku.',
        visual: 'tabel',
        relasi: {
          A: ['Ika', 'Joni', 'Kiki'],
          B: ['Komik', 'Novel', 'Sains'],
          pairs: [
            ['Ika', 'Komik'],
            ['Ika', 'Novel'],
            ['Joni', 'Sains'],
            ['Kiki', 'Komik'],
            ['Kiki', 'Sains'],
          ],
          labelA: 'Murid',
          labelB: 'Buku',
        },
        pertanyaan: 'Jika tabel ini diubah menjadi diagram panah, banyak panahnya adalah …',
        kunciBanyak: true,
        options: [
          { id: 'o1', label: '5' },
          { id: 'o2', label: '3' },
          { id: 'o3', label: '9' },
          { id: 'o4', label: '6' },
        ],
        correct: 'o1',
        hints: ['Satu tanda ✓ pada tabel = satu panah pada diagram.'],
        explanation: 'Ada 5 tanda ✓, jadi ada 5 panah (dan 5 pasangan berurutan).',
      },
      {
        type: 'choice',
        konteks: '🔁 Bilangan',
        cerita: 'Relasi “faktor dari” dari A = {2, 3, 5} ke B = {4, 6, 9, 10}.',
        relasi: {
          A: [2, 3, 5],
          B: [4, 6, 9, 10],
          pairs: [
            [2, 4],
            [2, 6],
            [2, 10],
            [3, 6],
            [3, 9],
            [5, 10],
          ],
          aturan: 'faktor',
        },
        pertanyaan: 'Pasangan berurutan berikut yang BUKAN anggota relasi tersebut adalah …',
        options: [
          { id: 'o1', label: '(4, 2)' },
          { id: 'o2', label: '(5, 10)' },
          { id: 'o3', label: '(2, 10)' },
          { id: 'o4', label: '(3, 9)' },
        ],
        correct: 'o1',
        hints: ['Anggota pertama pasangan harus anggota A dan membagi habis anggota kedua.'],
        explanation:
          '(4, 2) terbalik: 4 bukan anggota A, dan 4 bukan faktor dari 2. Yang benar adalah (2, 4).',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Discovery Learning · Penutup',
    goal: 'Merenungkan proses penemuan dan menilai pemahaman diri.',
    guru: 'Gunakan jawaban refleksi untuk mengetahui murid yang masih bingung soal urutan pasangan atau perbedaan kodomain dan range. Jawaban hanya tersimpan di perangkat murid.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Dari ketiga cara (diagram panah, tabel, pasangan berurutan), mana yang paling kamu sukai? Mengapa?',
        placeholder: 'Aku paling suka … karena …',
      },
      {
        id: 'r2',
        teks: 'Apakah dugaan dan hipotesismu di awal terbukti? Apa yang berubah dari pemikiranmu?',
        placeholder: 'Awalnya aku mengira … ternyata …',
      },
      {
        id: 'r3',
        teks: 'Tuliskan satu contoh relasi di sekitarmu, lengkap dengan himpunan A, himpunan B, dan nama relasinya.',
        placeholder: 'Contoh: A = {…}, B = {…}, relasi “…”',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menyajikan relasi dengan tiga cara sekarang?',
    diriOpsi: [
      { id: 'd1', label: '🌟 Sangat yakin, bisa menjelaskan ke teman' },
      { id: 'd2', label: '🙂 Yakin, tapi masih perlu latihan' },
      { id: 'd3', label: '🤔 Masih bingung di beberapa bagian' },
      { id: 'd4', label: '🆘 Perlu dibantu guru' },
    ],
    nextLabel: 'Simpan & Selesai',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, penemuanmu tuntas!',
    teks: 'Kamu telah menemukan sendiri konsep relasi dan tiga cara menyajikannya.',
    capaian: [
      'Mengidentifikasi relasi sebagai aturan yang memasangkan anggota dua himpunan.',
      'Menyajikan relasi dengan diagram panah, tabel, dan himpunan pasangan berurutan.',
      'Menjelaskan pentingnya urutan pada pasangan berurutan (a, b).',
      'Membedakan domain, kodomain, dan range sebuah relasi.',
      'Menerapkan relasi pada situasi sehari-hari dan bilangan.',
    ],
  },
};
