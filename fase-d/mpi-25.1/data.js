'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Koordinat Kartesius, Sifat Bangun Datar & Ide Awal
   Transformasi — Fase D, SMP Kelas IX (Topik 25: Transformasi Tunggal)

   Tujuan Pembelajaran:
   Mengidentifikasi kemampuan prasyarat berupa penentuan koordinat
   titik dan sifat bangun datar pada bidang koordinat Kartesius serta
   menjelaskan ide awal transformasi geometri dari contoh kehidupan
   sehari-hari.

   Model pembelajaran: INQUIRY LEARNING (Inkuiri Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Orientasi .................. 'orientasi'
     Sintaks 2 — Merumuskan masalah ......... 'masalah'
     Sintaks 3 — Merumuskan hipotesis ....... 'hipotesis'
     Sintaks 4 — Mengumpulkan data .......... 'dataTitik', 'dataBangun' & 'dataGerak'
     Sintaks 5 — Menguji hipotesis .......... 'uji'
     Sintaks 6 — Merumuskan kesimpulan ...... 'simpulan'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Orientasi   (7')  — "Denah Panggung Pensi Kelas IX": lantai aula
                            berpetak menjadi bidang Kartesius dengan titik
                            asal O di tengah panggung. Properti dipasang,
                            digeser, dicerminkan, diputar, dan logo kelas
                            diperbesar proyektor. Murid MENDUGA (tidak dinilai).
     2. Masalah     (4')  — memilih rumusan masalah penyelidikan.
     3. Hipotesis   (6')  — memilih dugaan tentang arti (x, y) dan apa
                            yang tetap/berubah saat bangun "bergerak", lalu
                            menulis hipotesis sendiri.
     4a. Lab Titik  (12') — PRASYARAT 1: memasang lima properti di empat
                            kuadran dan pada sumbu dengan mengetuk bidang
                            (atau tombol panah); diagnosa miskonsepsi x–y
                            tertukar & tanda terbalik; membaca koordinat
                            titik pada denah; pertanyaan temuan.
     4b. Lab Bangun (12') — PRASYARAT 2: melengkapi titik keempat persegi
                            panjang, jajargenjang, dan layang-layang;
                            membaca tabel sifat (panjang sisi dari selisih
                            koordinat, sisi sejajar, sudut siku); memilih
                            jenis bangun & panjang sisi; pertanyaan temuan.
     4c. Lab Gerak  (12') — IDE TRANSFORMASI: memilah delapan contoh
                            sehari-hari ke geser/cermin/putar/perbesar;
                            mencoba keempat gerakan pada bendera & papan
                            nama, mencatat koordinat asal → bayangan serta
                            ukuran, bentuk, dan arah hadapnya.
     5. Uji         (6')  — pernyataan benar/salah, lalu dugaan &
                            hipotesis dibandingkan dengan data.
     6. Simpulan    (5')  — melengkapi kalimat kesimpulan dari bank
                            potongan (ada pengecoh).
     7. Uji terap   (10') — delapan soal pilihan ganda diambil acak dari
                            bank sesuai komposisi; opsi berpengecoh
                            dibangun engine (opsiSoalKts).
     8. Refleksi    (6')  — rekap, menjelaskan dengan kata sendiri,
                            penilaian diri.

   Titik ditulis [x, y] (engine seksi 91, sumbu y ke atas). Kunci
   titik keempat, jenis bangun, bayangan, dan uji terap dihitung ulang
   oleh engine dan dicocokkan di tests/mpi-25.1-data.test.js.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Soal uji terap juga
   diambil acak dari bank dan opsinya dibangun engine lalu diacak.
   ============================================================ */

var IL = 'Inquiry Learning';

var DATA = {
  meta: {
    judul: 'Koordinat Kartesius, Sifat Bangun Datar & Ide Awal Transformasi',
  },

  tahap: [
    { id: 'orientasi', label: 'Orientasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'hipotesis', label: 'Hipotesis' },
    { id: 'dataTitik', label: 'Lab Titik' },
    { id: 'dataBangun', label: 'Lab Bangun' },
    { id: 'dataGerak', label: 'Lab Gerak' },
    { id: 'uji', label: 'Uji Hipotesis' },
    { id: 'simpulan', label: 'Simpulan' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Uji Hipotesis.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    syntax: IL + ' · Sintaks 1',
    goal: 'Mengamati denah panggung berpetak dan menduga cara menuliskan letak properti serta perubahan saat properti dipindahkan.',
    tp: 'Mengidentifikasi kemampuan prasyarat berupa penentuan koordinat titik dan sifat bangun datar pada bidang koordinat Kartesius serta menjelaskan ide awal transformasi geometri dari contoh kehidupan sehari-hari.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menentukan dan menuliskan koordinat (x, y) sebuah titik di keempat kuadran dan pada sumbu.',
      'Memasang titik pada bidang Kartesius dari koordinatnya tanpa menukar x dan y.',
      'Menentukan titik sudut yang hilang dan panjang sisi bangun datar dari koordinatnya.',
      'Mengenali jenis segi empat dari sifatnya (sisi sejajar, sisi sama panjang, sudut siku-siku).',
      'Menjelaskan ide geser, cermin, putar, dan perbesar dari contoh sehari-hari serta apa yang tetap dan berubah pada bangunnya.',
    ],
    guru: 'Tampilkan denah di layar dan ceritakan persiapan pentas seni. Minta pasangan murid memilih dugaannya dalam 2 menit tanpa dinilai. Catat dugaan yang berbeda (mis. "(2, −3)" vs "(−3, 2)") di papan tulis sebagai bahan penyelidikan.',
    judul: 'Denah Panggung Pensi Kelas IX',
    pengantar:
      'Kelas IX menyiapkan pentas seni di aula. Lantai aula berubin persegi, jadi Kak Dimas dari seksi dekorasi menggambar denahnya di kertas berpetak. Titik tengah panggung diberi nama O. Garis mendatar melalui O menjadi sumbu-x (kanan positif) dan garis tegak melalui O menjadi sumbu-y (atas positif). Sekarang setiap properti — lampu, mikrofon, bendera hias — harus dipasang tepat pada titiknya, dan sebagian akan digeser, dibalik, diputar, bahkan diperbesar lewat proyektor.',
    gambar: {
      bendera: [
        [1, 1],
        [3, 1],
        [1, 3],
      ],
      geser: { jenis: 'geser', dx: 3, dy: 2 },
      lampu: [-3, 2],
    },
    dugaan: [
      {
        id: 'dLetak',
        tanya:
          'Lampu sorot (titik ?) dipasang 3 petak ke KIRI dan 2 petak ke ATAS dari O. Bagaimana menuliskan letaknya?',
        opsi: [
          { id: 'benar', label: '(−3, 2)' },
          { id: 'tukar', label: '(2, −3)' },
          { id: 'positif', label: '(3, 2)' },
          { id: 'tukarTanda', label: '(−2, 3)' },
        ],
        baku: 'benar',
        pembahasan:
          'Di Lab Titik: bilangan pertama adalah langkah mendatar (kiri = negatif) dan bilangan kedua langkah tegak (atas = positif), jadi (−3, 2). (2, −3) adalah titik lain di kuadran IV.',
      },
      {
        id: 'dGeser',
        tanya:
          'Bendera hias segitiga (biru) digeser ke posisi oranye. Menurutmu, apa yang berubah?',
        opsi: [
          { id: 'posisi', label: 'Hanya letaknya; bentuk dan ukurannya tetap' },
          { id: 'ukuran', label: 'Ukurannya ikut berubah' },
          { id: 'bentuk', label: 'Bentuknya ikut berubah' },
          { id: 'nihil', label: 'Tidak ada yang berubah sama sekali' },
        ],
        baku: 'posisi',
        pembahasan:
          'Di Lab Gerak: pada geser, setiap sisi bayangan sama panjang dengan sisi asal — hanya koordinatnya yang berpindah, mis. A(1, 1) menjadi A′(4, 3).',
      },
      {
        id: 'dProyektor',
        tanya: 'Logo kelas dari proyektor tampak di layar 2 kali lebih besar. Apa yang tetap?',
        opsi: [
          { id: 'bentuk', label: 'Bentuk dan besar sudutnya tetap, ukurannya berubah' },
          { id: 'ukuran', label: 'Ukurannya tetap, bentuknya berubah' },
          { id: 'semua', label: 'Ukuran dan bentuknya tetap' },
          { id: 'tidak', label: 'Tidak ada yang tetap' },
        ],
        baku: 'bentuk',
        pembahasan:
          'Di Lab Gerak: perbesar 2 kali membuat semua koordinat (dan panjang sisi) dikali 2, tetapi bentuk bendera tetap sama — sebangun dengan aslinya.',
      },
    ],
    alasanLabel: 'Tuliskan alasan dugaanmu (boleh singkat):',
    alasanPlaceholder: 'Menurutku lampu sorot ditulis … karena …',
    catatan:
      'Dugaanmu tidak dinilai. Simpan baik-baik — kamu akan mengujinya sendiri dengan data di tahap Uji Hipotesis.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MERUMUSKAN MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: IL + ' · Sintaks 2',
    goal: 'Memilih pertanyaan penyelidikan yang tepat dari masalah denah panggung.',
    guru: 'Ajak murid membedakan pertanyaan penyelidikan matematika (letak & perubahan bangun) dengan pertanyaan persiapan acara yang bukan matematika. Biarkan murid mencoba lagi bila memilih yang kurang tepat.',
    pengantar:
      'Kak Dimas ingin semua anggota seksi dekorasi bisa membaca denah yang sama tanpa salah tempat, dan tahu apa yang terjadi pada properti saat dipindahkan. Rumuskan dulu pertanyaan yang akan diselidiki.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'posisi',
        label:
          'Bagaimana menentukan letak titik dan bangun pada denah dengan koordinat, dan apa yang tetap atau berubah saat bangun digeser, dicerminkan, diputar, atau diperbesar?',
      },
      { id: 'warna', label: 'Warna apa yang paling cocok untuk properti panggung?' },
      { id: 'biaya', label: 'Berapa biaya menyewa lampu sorot untuk pentas seni?' },
      { id: 'ubin', label: 'Berapa banyak ubin lantai aula seluruhnya?' },
    ],
    correct: 'posisi',
    umpan: {
      posisi:
        'Tepat! Pertanyaan ini menuntun kita menyelidiki koordinat titik, sifat bangun pada denah, dan perubahan bangun saat bergerak.',
      warna:
        'Warna penting untuk keindahan, tetapi bukan masalah letak dan gerak bangun pada denah.',
      biaya: 'Biaya sewa tidak membantu memasang properti tepat pada titiknya.',
      ubin: 'Banyak ubin seluruh aula tidak menjawab di mana properti dipasang atau bagaimana ia berpindah.',
    },
    nextLabel: 'Lanjut: Rumuskan Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MERUMUSKAN HIPOTESIS
     Pilihan dugaan TIDAK dinilai; dibandingkan dengan data di tahap Uji.
     ---------------------------------------------------------- */
  hipotesis: {
    kicker: 'Tahap 3 · Merumuskan Hipotesis',
    syntax: IL + ' · Sintaks 3',
    goal: 'Menyusun dugaan sementara tentang arti koordinat (x, y) dan perubahan bangun saat bergerak.',
    guru: 'Tekankan bahwa hipotesis adalah dugaan yang akan diuji, jadi tidak ada pilihan yang "dihukum". Minta setiap pasangan menulis satu kalimat hipotesis dengan bahasa sendiri.',
    pengantar:
      'Jawab dugaan berikut sesuai pendapatmu sekarang, lalu tulis hipotesismu. Kamu akan mengujinya di tiga lab.',
    dugaan: [
      {
        id: 'hUrutan',
        tanya: 'Pada koordinat (a, b), bilangan a menyatakan …',
        opsi: [
          { id: 'mendatar', label: 'langkah mendatar dari O (searah sumbu-x)' },
          { id: 'tegak', label: 'langkah tegak dari O (searah sumbu-y)' },
          { id: 'jarak', label: 'jarak lurus dari O ke titik' },
          { id: 'kuadran', label: 'nomor kuadran tempat titik berada' },
        ],
        baku: 'mendatar',
        pembahasan:
          'Di Lab Titik, memasang (−3, 2) berarti 3 langkah mendatar ke kiri lalu 2 langkah tegak ke atas. Menukar urutannya memberi titik yang berbeda.',
      },
      {
        id: 'hTetap',
        tanya: 'Saat bangun digeser, dicerminkan, atau diputar, ukuran dan bentuknya …',
        opsi: [
          { id: 'tetap', label: 'tetap sama' },
          { id: 'berubah', label: 'selalu berubah' },
          { id: 'geserSaja', label: 'tetap hanya saat digeser' },
        ],
        baku: 'tetap',
        pembahasan:
          'Di catatan Lab Gerak, geser, cermin, dan putar selalu bertanda "Ukuran tetap: Ya" dan "Bentuk tetap: Ya". Yang berubah hanya letak (dan arah hadap pada cermin).',
      },
      {
        id: 'hPerbesar',
        tanya: 'Saat bangun diperbesar 2 kali dari O, yang berubah adalah …',
        opsi: [
          { id: 'ukuran', label: 'ukurannya, sedangkan bentuknya tetap' },
          { id: 'bentuk', label: 'bentuknya, sedangkan ukurannya tetap' },
          { id: 'tidak', label: 'tidak ada yang berubah' },
        ],
        baku: 'ukuran',
        pembahasan:
          'Di Lab Gerak, perbesar 2 kali bertanda "Ukuran tetap: Tidak" tetapi "Bentuk tetap: Ya": sisi-sisinya dikali 2 dan sudutnya sama.',
      },
    ],
    hipotesisLabel: 'Tulis hipotesismu:',
    hipotesisPlaceholder:
      'Menurutku, koordinat (x, y) ditulis dengan … dan saat bangun digeser/dicerminkan/diputar/diperbesar, yang tetap adalah …',
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — LAB TITIK (prasyarat 1: koordinat titik)
     ---------------------------------------------------------- */
  dataTitik: {
    kicker: 'Tahap 4a · Lab Titik',
    syntax: IL + ' · Sintaks 4',
    goal: 'Memasang dan membaca koordinat titik di keempat kuadran dan pada sumbu.',
    guru: 'Peragakan sekali di layar: "Mulai dari O, jalan mendatar dulu sejauh x, baru naik/turun sejauh y." Bagi murid yang menukar x dan y, minta mereka mengucapkan langkahnya keras-keras. Murid yang belum terbiasa dengan layar sentuh dapat memakai tombol panah setelah bidang difokuskan.',
    pengantar:
      'Ketuk titik pada bidang untuk menaruh penanda (atau fokuskan bidang lalu pakai tombol panah), kemudian tekan "Periksa titik". Pasang kelima properti sesuai daftar.',
    tugas: [
      { id: 'tLampu', nama: 'Lampu sorot', label: 'L', ikon: '💡', p: [-3, 2] },
      { id: 'tMik', nama: 'Mikrofon', label: 'M', ikon: '🎤', p: [4, 1] },
      { id: 'tSpeaker', nama: 'Pengeras suara', label: 'S', ikon: '🔊', p: [-5, -3] },
      { id: 'tKamera', nama: 'Kamera', label: 'K', ikon: '🎥', p: [2, -4] },
      { id: 'tTirai', nama: 'Tali tirai', label: 'T', ikon: '🎀', p: [0, 5] },
    ],
    petunjuk: [
      'Selalu mulai dari titik asal O(0, 0).',
      'Bilangan pertama (x): langkah MENDATAR — positif ke kanan, negatif ke kiri.',
      'Bilangan kedua (y): langkah TEGAK — positif ke atas, negatif ke bawah. Jika x = 0, titiknya tepat di sumbu-y.',
    ],
    bacaJudul: 'Baca koordinat properti lain di denah',
    baca: [
      { id: 'bJuri', nama: 'Kursi juri', label: 'J', p: [5, -2] },
      { id: 'bPot', nama: 'Pot bunga', label: 'P', p: [-1, -4] },
      { id: 'bKipas', nama: 'Kipas angin', label: 'A', p: [-4, 3] },
    ],
    temuan: [
      {
        id: 'tKuadran',
        tanya: 'Titik di kiri bawah O, seperti S(−5, −3), selalu bertanda …',
        opsi: [
          { id: 'iii', label: 'x negatif dan y negatif (kuadran III)' },
          { id: 'iv', label: 'x positif dan y negatif (kuadran IV)' },
          { id: 'ii', label: 'x negatif dan y positif (kuadran II)' },
          { id: 'i', label: 'x positif dan y positif (kuadran I)' },
        ],
        correct: 'iii',
        umpan: {
          iii: 'Tepat! Kiri berarti x negatif, bawah berarti y negatif: kuadran III.',
          iv: 'x positif berarti di KANAN O. Titik S berada di kiri.',
          ii: 'y positif berarti di ATAS O. Titik S berada di bawah.',
          i: 'Kuadran I ada di kanan atas O. Periksa lagi tanda kedua koordinat S.',
        },
      },
      {
        id: 'tSumbu',
        tanya: 'Tali tirai T(0, 5) berada …',
        opsi: [
          { id: 'sumbuY', label: 'tepat pada sumbu-y, karena x = 0' },
          { id: 'sumbuX', label: 'tepat pada sumbu-x, karena x = 0' },
          { id: 'kuadranI', label: 'di kuadran I, karena 5 positif' },
          { id: 'asal', label: 'di titik asal O' },
        ],
        correct: 'sumbuY',
        umpan: {
          sumbuY: 'Tepat! Tidak ada langkah mendatar (x = 0), jadi T berada pada sumbu-y.',
          sumbuX: 'Titik pada sumbu-x justru bernilai y = 0. Untuk T, x-nya yang bernilai 0.',
          kuadranI: 'Kuadran I membutuhkan x DAN y positif. Di sini x = 0.',
          asal: 'Titik asal adalah (0, 0). T masih 5 langkah ke atas dari O.',
        },
      },
      {
        id: 'tUrutan',
        tanya: 'Mengapa (−3, 2) dan (2, −3) bukan titik yang sama?',
        opsi: [
          {
            id: 'urutan',
            label:
              'Urutan menentukan: bilangan pertama langkah mendatar, bilangan kedua langkah tegak',
          },
          { id: 'sama', label: 'Sebenarnya keduanya titik yang sama' },
          { id: 'tanda', label: 'Karena tanda negatif boleh diabaikan' },
          { id: 'besar', label: 'Karena (2, −3) lebih besar daripada (−3, 2)' },
        ],
        correct: 'urutan',
        umpan: {
          urutan: 'Tepat! (−3, 2) ada di kuadran II, sedangkan (2, −3) di kuadran IV.',
          sama: 'Coba pasang keduanya: (−3, 2) di kiri atas, (2, −3) di kanan bawah — berbeda.',
          tanda: 'Tanda negatif menunjukkan arah (kiri/bawah), jadi tidak boleh diabaikan.',
          besar:
            'Titik tidak dibandingkan besar-kecilnya; yang penting letaknya. Urutan x lalu y menentukan letak.',
        },
      },
    ],
    nextLabel: 'Lanjut: Lab Bangun →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — LAB BANGUN (prasyarat 2: sifat bangun datar)
     pts = [A, B, C, D]; murid memasang D. Jenis bangun dicek tes
     dengan jenisSegiEmpat (engine seksi 91).
     ---------------------------------------------------------- */
  dataBangun: {
    kicker: 'Tahap 4b · Lab Bangun',
    syntax: IL + ' · Sintaks 4',
    goal: 'Menentukan titik sudut yang hilang, panjang sisi, dan jenis segi empat dari koordinatnya.',
    guru: 'Ingatkan sifat-sifat segi empat dari kelas VII sebelum murid mencoba. Untuk titik yang hilang, tanyakan: "Dari B ke C kita bergerak berapa langkah? Lakukan langkah yang sama dari A." Tabel sifat muncul setelah titik tepat, sebagai data untuk mengenali jenis bangun.',
    pengantar:
      'Tiga properti panggung baru dipasang tiga titik sudutnya. Tentukan titik keempat dengan mengetuk bidang, lalu pakai tabel sifat untuk menjawab pertanyaannya.',
    bangun: [
      {
        id: 'bPanggung',
        nama: 'Panggung utama',
        ikon: '🎭',
        jenis: 'persegiPanjang',
        titik: ['A', 'B', 'C', 'D'],
        pts: [
          [-4, -1],
          [4, -1],
          [4, 3],
          [-4, 3],
        ],
        perintah: 'Panggung utama berbentuk persegi panjang ABCD. Di mana titik D?',
        umpan:
          'Belum tepat. Persegi panjang punya sudut siku-siku: D harus tepat di atas A dan sejajar dengan C.',
        ukur: { dari: 0, ke: 1, nama: 'AB (lebar panggung)', satuan: 'petak' },
      },
      {
        id: 'bKarpet',
        nama: 'Karpet penari',
        ikon: '💃',
        jenis: 'jajargenjang',
        titik: ['P', 'Q', 'R', 'S'],
        pts: [
          [-5, -5],
          [-1, -5],
          [1, -2],
          [-3, -2],
        ],
        perintah: 'Karpet penari berbentuk jajargenjang PQRS. Di mana titik S?',
        umpan:
          'Belum tepat. Pada jajargenjang, PS sejajar dan sama panjang dengan QR: dari Q ke R kita bergerak 2 ke kanan dan 3 ke atas — lakukan langkah yang sama dari P.',
        ukur: { dari: 3, ke: 2, nama: 'SR (sisi atas karpet)', satuan: 'petak' },
      },
      {
        id: 'bHiasan',
        nama: 'Hiasan layang-layang',
        ikon: '🪁',
        jenis: 'layangLayang',
        titik: ['K', 'L', 'M', 'N'],
        pts: [
          [3, -5],
          [5, -2],
          [3, 4],
          [1, -2],
        ],
        perintah:
          'Hiasan dinding berbentuk layang-layang KLMN dengan KL = KN dan LM = NM. Rangka KM tegak lurus. Di mana titik N?',
        umpan:
          'Belum tepat. Layang-layang ini simetris terhadap rangka tegak KM (x = 3): N adalah pasangan L di seberang rangka, sama tinggi dan sama jauh.',
        ukur: { dari: 0, ke: 2, nama: 'KM (rangka tegak)', satuan: 'petak' },
      },
    ],
    temuan: [
      {
        id: 'tBeda',
        tanya:
          'Dari tabel sifat, apa yang membedakan panggung (persegi panjang) dan karpet (jajargenjang)?',
        opsi: [
          {
            id: 'siku',
            label:
              'Keduanya punya dua pasang sisi sejajar, tetapi hanya persegi panjang yang sudutnya siku-siku',
          },
          { id: 'sejajar', label: 'Hanya persegi panjang yang punya sisi sejajar' },
          { id: 'sisi', label: 'Jajargenjang punya empat sisi sama panjang' },
          { id: 'sama', label: 'Tidak ada bedanya' },
        ],
        correct: 'siku',
        umpan: {
          siku: 'Tepat! Persegi panjang adalah jajargenjang yang keempat sudutnya siku-siku.',
          sejajar: 'Lihat lagi tabel karpet: PQ ∥ RS dan QR ∥ SP juga bertanda "Ya".',
          sisi: 'PQ panjangnya 4 petak, sedangkan QR miring dan lebih pendek — sisinya tidak sama panjang semua.',
          sama: 'Bandingkan baris "Keempat sudut siku-siku?" pada kedua tabel.',
        },
      },
      {
        id: 'tPanjang',
        tanya: 'Panjang sisi MENDATAR seperti AB dapat dihitung dari koordinat dengan …',
        opsi: [
          { id: 'selisihX', label: 'selisih koordinat x kedua ujungnya' },
          { id: 'jumlahX', label: 'jumlah koordinat x kedua ujungnya' },
          { id: 'selisihY', label: 'selisih koordinat y kedua ujungnya' },
          { id: 'jumlahSemua', label: 'jumlah semua koordinat kedua ujungnya' },
        ],
        correct: 'selisihX',
        umpan: {
          selisihX: 'Tepat! AB: dari x = −4 sampai x = 4, selisihnya 4 − (−4) = 8 petak.',
          jumlahX: '−4 + 4 = 0, padahal panggung jelas tidak 0 petak lebarnya.',
          selisihY: 'Pada sisi mendatar, koordinat y kedua ujung SAMA (−1), jadi selisihnya 0.',
          jumlahSemua: 'Menjumlahkan semua koordinat tidak memberi panjang sisi.',
        },
      },
    ],
    nextLabel: 'Lanjut: Lab Gerak →',
  },

  /* ----------------------------------------------------------
     TAHAP 4c — LAB GERAK (ide awal transformasi)
     contoh.gerak = id KTS_GERAK (engine seksi 91). Bayangan setiap
     bangun oleh setiap preset dicek tes tetap di dalam bidang −6 … 6.
     ---------------------------------------------------------- */
  dataGerak: {
    kicker: 'Tahap 4c · Lab Gerak',
    syntax: IL + ' · Sintaks 4',
    goal: 'Mengaitkan contoh sehari-hari dengan geser, cermin, putar, dan perbesar, lalu mengamati apa yang tetap dan berubah pada bangun.',
    guru: 'Peragakan dengan benda nyata: geser buku di meja, cerminkan tangan di kaca, putar penghapus di satu jari, dan perbesar foto di ponsel. Tekankan istilah resminya baru diperkenalkan sebagai nama: translasi, refleksi, rotasi, dilatasi — rumusnya akan dipelajari di pertemuan berikutnya.',
    pengantar:
      'Bagian A: pilah contoh sehari-hari ke jenis gerakannya. Bagian B: coba setiap gerakan pada bendera hias dan papan nama, lalu amati tabel koordinat dan tanda tetap/berubah.',
    contohJudul: 'A. Gerakan apa yang terjadi?',
    contoh: [
      {
        id: 'cEskalator',
        teks: '🛗 Penonton berdiri diam di eskalator yang naik lurus ke lantai dua.',
        gerak: 'geser',
        explanation:
          'Seluruh badan berpindah dengan arah dan jarak yang sama tanpa berputar: geser.',
      },
      {
        id: 'cCermin',
        teks: '🪞 Bayangan wajah penari di cermin rias ruang ganti.',
        gerak: 'cermin',
        explanation: 'Bayangan di cermin terbalik kiri-kanan dan sama jauh dari cermin: cermin.',
      },
      {
        id: 'cKipas',
        teks: '🌀 Baling-baling kipas angin aula yang berputar.',
        gerak: 'putar',
        explanation: 'Setiap baling-baling berputar mengelilingi satu titik pusat: putar.',
      },
      {
        id: 'cZoom',
        teks: '📱 Foto penampilan diperbesar di layar ponsel dengan dua jari.',
        gerak: 'perbesar',
        explanation: 'Gambarnya makin besar tetapi bentuknya tetap: perbesar.',
      },
      {
        id: 'cLaci',
        teks: '🗄️ Laci meja panitia ditarik keluar lurus.',
        gerak: 'geser',
        explanation: 'Laci berpindah lurus tanpa berputar atau berubah ukuran: geser.',
      },
      {
        id: 'cJam',
        teks: '🕒 Jarum jam dinding aula bergerak dari angka 12 ke angka 3.',
        gerak: 'putar',
        explanation: 'Jarum berputar 90° mengelilingi pusat jam: putar.',
      },
      {
        id: 'cKupu',
        teks: '🦋 Gambar kupu-kupu dilukis di satu sisi kertas, lalu kertas dilipat agar catnya menempel di sisi lain.',
        gerak: 'cermin',
        explanation: 'Cetakan di sisi lain terbalik terhadap garis lipatan: cermin.',
      },
      {
        id: 'cProyektor',
        teks: '📽️ Logo kelas pada laptop dipancarkan proyektor ke layar besar.',
        gerak: 'perbesar',
        explanation: 'Logo di layar jauh lebih besar dengan bentuk yang sama: perbesar.',
      },
    ],
    labJudul: 'B. Lab Gerak',
    lab: {
      bangun: [
        {
          id: 'bendera',
          nama: 'Bendera hias',
          ikon: '🚩',
          titik: ['A', 'B', 'C'],
          pts: [
            [1, 1],
            [3, 1],
            [1, 3],
          ],
        },
        {
          id: 'papan',
          nama: 'Papan nama',
          ikon: '🪧',
          titik: ['P', 'Q', 'R', 'S'],
          pts: [
            [-3, 1],
            [-1, 1],
            [-1, 2],
            [-3, 2],
          ],
        },
      ],
      preset: [
        { id: 'geser1', t: { jenis: 'geser', dx: 3, dy: 2 } },
        { id: 'geser2', t: { jenis: 'geser', dx: 2, dy: -4 } },
        { id: 'cerminX', t: { jenis: 'cermin', sumbu: 'x' } },
        { id: 'cerminY', t: { jenis: 'cermin', sumbu: 'y' } },
        { id: 'putar90', t: { jenis: 'putar', sudut: 90 } },
        { id: 'putar180', t: { jenis: 'putar', sudut: 180 } },
        { id: 'perbesar2', t: { jenis: 'perbesar', k: 2 } },
      ],
    },
    labSyarat: 'Coba minimal satu gerakan dari setiap jenis: geser, cermin, putar, dan perbesar.',
    temuan: [
      {
        id: 'tUkuran',
        tanya: 'Pada geser, cermin, dan putar, ukuran dan bentuk bangun …',
        opsi: [
          { id: 'tetap', label: 'tetap sama; yang berubah letaknya (dan arah hadap pada cermin)' },
          { id: 'besar', label: 'menjadi lebih besar' },
          { id: 'kecil', label: 'menjadi lebih kecil' },
          { id: 'bentuk', label: 'bentuknya berubah, ukurannya tetap' },
        ],
        correct: 'tetap',
        umpan: {
          tetap: 'Tepat! Ketiga gerakan ini hanya memindahkan bangun tanpa mengubah ukurannya.',
          besar:
            'Lihat catatan percobaan: kolom "Ukuran tetap?" untuk geser, cermin, dan putar bertanda "Ya".',
          kecil:
            'Lihat catatan percobaan: tidak ada sisi yang memendek pada geser, cermin, atau putar.',
          bentuk: 'Lihat catatan percobaan: kolom "Bentuk tetap?" juga bertanda "Ya".',
        },
      },
      {
        id: 'tArah',
        tanya: 'Gerakan mana yang membuat arah hadap bendera TERBALIK?',
        opsi: [
          { id: 'cermin', label: 'Cermin (refleksi)' },
          { id: 'geser', label: 'Geser (translasi)' },
          { id: 'putar', label: 'Putar (rotasi)' },
          { id: 'perbesar', label: 'Perbesar (dilatasi)' },
        ],
        correct: 'cermin',
        umpan: {
          cermin:
            'Tepat! Seperti bayangan di cermin, bendera yang tadinya menghadap kanan kini menghadap kiri.',
          geser: 'Pada geser, bendera tetap menghadap ke arah yang sama — hanya berpindah tempat.',
          putar:
            'Pada putar, bendera ikut berputar tetapi tidak terbalik. Lihat kolom "Arah hadap tetap?".',
          perbesar: 'Pada perbesar, bendera hanya membesar dan menghadap ke arah yang sama.',
        },
      },
      {
        id: 'tKali',
        tanya: 'Pada perbesar 2 kali dari O, koordinat setiap titik …',
        opsi: [
          { id: 'kali', label: 'dikali 2, mis. B(3, 1) menjadi B′(6, 2)' },
          { id: 'tambah', label: 'ditambah 2, mis. B(3, 1) menjadi B′(5, 3)' },
          { id: 'tetap', label: 'tetap sama' },
          { id: 'bagi', label: 'dibagi 2' },
        ],
        correct: 'kali',
        umpan: {
          kali: 'Tepat! Jarak setiap titik dari O menjadi 2 kali lipat, jadi x dan y dikali 2.',
          tambah:
            'Lihat tabel: B(3, 1) menjadi (6, 2), bukan (5, 3). Koordinatnya dikali, bukan ditambah.',
          tetap: 'Bayangan berada di tempat lain dan lebih besar, jadi koordinatnya berubah.',
          bagi: 'Dibagi 2 akan memperkecil bangun. Pada perbesaran, koordinat dikali 2.',
        },
      },
      {
        id: 'tGeser',
        tanya: 'Bendera digeser 3 ke kanan dan 2 ke atas. Titik A(1, 1) menjadi …',
        opsi: [
          { id: 'benar', label: 'A′(4, 3)' },
          { id: 'tukar', label: 'A′(3, 4)' },
          { id: 'geser', label: 'A′(3, 2)' },
          { id: 'kurang', label: 'A′(−2, −1)' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Tepat! x bertambah 3 (1 + 3 = 4) dan y bertambah 2 (1 + 2 = 3).',
          tukar: 'Langkah ke kanan menambah x, langkah ke atas menambah y: (1 + 3, 1 + 2).',
          geser: '(3, 2) adalah besar geserannya, bukan letak A′. Tambahkan ke koordinat A.',
          kurang: 'Ke kanan dan ke atas berarti MENAMBAH koordinat, bukan mengurangi.',
        },
      },
    ],
    nextLabel: 'Lanjut: Uji Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGUJI HIPOTESIS
     ---------------------------------------------------------- */
  uji: {
    kicker: 'Tahap 5 · Menguji Hipotesis',
    syntax: IL + ' · Sintaks 5',
    goal: 'Menguji pernyataan dan dugaan awal dengan data dari ketiga lab.',
    guru: 'Setelah pernyataan dipilah, minta pasangan membacakan satu dugaan yang dikoreksi data dan menunjukkan buktinya (titik di Lab Titik, tabel sifat, atau catatan Lab Gerak). Hargai murid yang berani mengubah hipotesisnya.',
    judulA: 'A. Benar atau salah menurut data?',
    judulB: 'B. Dugaanmu vs data',
    opsiPernyataan: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'vUrutan',
        teks: 'Titik (−3, 2) dan (2, −3) adalah titik yang sama karena bilangannya sama.',
        correct: 'salah',
        explanation: 'Urutan menentukan letak: (−3, 2) di kuadran II, (2, −3) di kuadran IV.',
      },
      {
        id: 'vKuadran',
        teks: 'Titik dengan x negatif dan y positif berada di kuadran II.',
        correct: 'benar',
        explanation: 'Kuadran II di kiri atas O, mis. lampu sorot L(−3, 2).',
      },
      {
        id: 'vSumbu',
        teks: 'Titik (0, 5) berada di kuadran I.',
        correct: 'salah',
        explanation: 'Karena x = 0, titik itu tepat pada sumbu-y, tidak termasuk kuadran mana pun.',
      },
      {
        id: 'vPanjang',
        teks: 'Panjang sisi mendatar dapat dihitung dari selisih koordinat x kedua ujungnya.',
        correct: 'benar',
        explanation: 'Panggung AB: 4 − (−4) = 8 petak.',
      },
      {
        id: 'vGeser',
        teks: 'Saat digeser, ukuran bendera bertambah besar.',
        correct: 'salah',
        explanation: 'Catatan Lab Gerak: pada geser, "Ukuran tetap" bertanda Ya.',
      },
      {
        id: 'vCermin',
        teks: 'Pencerminan membuat arah hadap bangun terbalik, tetapi ukurannya tetap.',
        correct: 'benar',
        explanation:
          'Bendera yang dicerminkan menghadap ke arah sebaliknya dengan sisi yang sama panjang.',
      },
      {
        id: 'vPerbesar',
        teks: 'Perbesaran 2 kali dari O mengubah bentuk bangun.',
        correct: 'salah',
        explanation: 'Ukurannya berubah (sisi dikali 2), tetapi bentuk dan sudutnya tetap.',
      },
    ],
    nextLabel: 'Lanjut: Rumuskan Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MERUMUSKAN KESIMPULAN
     ---------------------------------------------------------- */
  simpulan: {
    kicker: 'Tahap 6 · Merumuskan Kesimpulan',
    syntax: IL + ' · Sintaks 6',
    goal: 'Merumuskan kesimpulan tentang koordinat titik, sifat bangun pada bidang Kartesius, dan ide awal transformasi.',
    guru: 'Minta beberapa pasangan membacakan kesimpulan lengkapnya, lalu kaitkan dengan rumusan masalah di tahap 2. Perkenalkan bahwa keempat gerakan tadi disebut transformasi geometri dan akan dipelajari satu per satu.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai satu kali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      {
        id: 'kKoordinat',
        awal: 'Koordinat titik (x, y) dibaca dari titik asal O:',
        correct: 'bKoordinat',
      },
      {
        id: 'kPanjang',
        awal: 'Panjang sisi yang sejajar sumbu dapat dihitung dari',
        correct: 'bPanjang',
      },
      {
        id: 'kTetap',
        awal: 'Pada geser (translasi), cermin (refleksi), dan putar (rotasi),',
        correct: 'bTetap',
      },
      {
        id: 'kPerbesar',
        awal: 'Pada perbesaran (dilatasi),',
        correct: 'bPerbesar',
      },
    ],
    bank: [
      {
        id: 'bKoordinat',
        teks: 'x langkah mendatar (kanan positif), lalu y langkah tegak (atas positif).',
      },
      { id: 'bPanjang', teks: 'selisih koordinat yang berubah pada kedua ujungnya.' },
      { id: 'bTetap', teks: 'ukuran dan bentuk bangun tetap; yang berubah letaknya.' },
      { id: 'bPerbesar', teks: 'ukuran bangun berubah, tetapi bentuknya tetap.' },
      { id: 'bTukar', teks: 'y langkah mendatar, lalu x langkah tegak.' },
      { id: 'bJumlah', teks: 'jumlah semua koordinat kedua ujungnya.' },
      { id: 'bBerubah', teks: 'ukuran dan bentuk bangun selalu berubah.' },
    ],
    rangkuman: [
      'Koordinat <strong>(x, y)</strong>: mulai dari O, <strong>x</strong> langkah mendatar (kanan +, kiri −) lalu <strong>y</strong> langkah tegak (atas +, bawah −). Urutannya tidak boleh ditukar.',
      'Tanda koordinat menentukan <strong>kuadran</strong>: I (+, +), II (−, +), III (−, −), IV (+, −). Titik yang salah satu koordinatnya 0 berada <strong>pada sumbu</strong>.',
      'Dari koordinat kita dapat menghitung <strong>panjang sisi</strong> yang sejajar sumbu (selisih koordinat) dan mengenali <strong>jenis bangun</strong> dari sisi sejajar, sisi sama panjang, dan sudut siku-siku.',
      'Gerakan bangun pada bidang disebut <strong>transformasi</strong>: <strong>geser (translasi)</strong>, <strong>cermin (refleksi)</strong>, <strong>putar (rotasi)</strong>, dan <strong>perbesar/perkecil (dilatasi)</strong>.',
      'Translasi, refleksi, dan rotasi <strong>tidak mengubah ukuran dan bentuk</strong>; refleksi membalik arah hadap. Dilatasi <strong>mengubah ukuran</strong> tetapi <strong>bentuk tetap</strong>.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     Diambil acak sesuai `komposisi` (per `minta`) dari bank. Opsi
     dibangun opsiSoalKts (engine seksi 91) lalu diacak di app.js.
     gambar: 'titik' (tampilkan titik p berlabel) | 'bangun' (pts).
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan koordinat, sifat bangun, dan ide transformasi pada situasi baru.',
    guru: 'Murid bekerja mandiri. Amati pesan umpan balik yang sering muncul (x–y tertukar, tanda terbalik, jenis bangun tertukar) sebagai data kemampuan prasyarat sebelum masuk materi transformasi.',
    instruksi:
      'Kerjakan delapan soal berikut. Ingat: (x, y) — mendatar dulu, baru tegak; periksa sifat bangun sebelum menamainya.',
    banyak: 8,
    komposisi: {
      koordinat: 1,
      kuadran: 1,
      titikKeempat: 1,
      panjang: 1,
      jenisBangun: 1,
      gerak: 2,
      bayangan: 1,
    },
    soal: [
      {
        id: 'sK1',
        minta: 'koordinat',
        ikon: '📍',
        p: [-2, 4],
        label: 'R',
        gambar: 'titik',
        cerita: 'Pada denah sekolah, ruang OSIS ditandai titik R.',
        pertanyaan: 'Apa koordinat titik R?',
        explanation: 'R berada 2 petak ke kiri (x = −2) dan 4 petak ke atas (y = 4): (−2, 4).',
      },
      {
        id: 'sK2',
        minta: 'koordinat',
        ikon: '📍',
        p: [3, -5],
        label: 'G',
        gambar: 'titik',
        cerita: 'Gerbang parkir sepeda ditandai titik G pada denah.',
        pertanyaan: 'Apa koordinat titik G?',
        explanation: 'G berada 3 petak ke kanan (x = 3) dan 5 petak ke bawah (y = −5): (3, −5).',
      },
      {
        id: 'sK3',
        minta: 'koordinat',
        ikon: '📍',
        p: [-5, -1],
        label: 'W',
        gambar: 'titik',
        cerita: 'Wastafel di pojok kantin ditandai titik W.',
        pertanyaan: 'Apa koordinat titik W?',
        explanation: 'W berada 5 petak ke kiri (x = −5) dan 1 petak ke bawah (y = −1): (−5, −1).',
      },
      {
        id: 'sQ1',
        minta: 'kuadran',
        ikon: '🧭',
        p: [4, -3],
        cerita: 'Tempat sampah kelas dipasang di titik (4, −3).',
        pertanyaan: 'Di mana letak titik itu?',
        explanation: 'x = 4 positif dan y = −3 negatif, jadi kuadran IV.',
      },
      {
        id: 'sQ2',
        minta: 'kuadran',
        ikon: '🧭',
        p: [-6, 2],
        cerita: 'Papan pengumuman berada di titik (−6, 2).',
        pertanyaan: 'Di mana letak titik itu?',
        explanation: 'x = −6 negatif dan y = 2 positif, jadi kuadran II.',
      },
      {
        id: 'sQ3',
        minta: 'kuadran',
        ikon: '🧭',
        p: [-3, 0],
        cerita: 'Tiang bendera berdiri di titik (−3, 0).',
        pertanyaan: 'Di mana letak titik itu?',
        explanation: 'y = 0, jadi titik itu tepat pada sumbu-x, tidak di kuadran mana pun.',
      },
      {
        id: 'sT1',
        minta: 'titikKeempat',
        ikon: '🟦',
        jenis: 'persegiPanjang',
        pts: [
          [-2, -3],
          [5, -3],
          [5, 1],
        ],
        cerita:
          'Lapangan voli berbentuk persegi panjang ABCD dengan A(−2, −3), B(5, −3), dan C(5, 1).',
        pertanyaan: 'Koordinat titik D adalah …',
        explanation: 'D tepat di atas A dan sejajar dengan C: D = A + C − B = (−2, 1).',
      },
      {
        id: 'sT2',
        minta: 'titikKeempat',
        ikon: '🟪',
        jenis: 'jajargenjang',
        pts: [
          [-4, -2],
          [1, -2],
          [3, 2],
        ],
        cerita: 'Taman bunga berbentuk jajargenjang PQRS dengan P(−4, −2), Q(1, −2), dan R(3, 2).',
        pertanyaan: 'Koordinat titik S adalah …',
        explanation:
          'Dari Q ke R: 2 ke kanan, 4 ke atas. Dari P lakukan langkah yang sama: S = (−2, 2).',
      },
      {
        id: 'sT3',
        minta: 'titikKeempat',
        ikon: '🟩',
        jenis: 'persegi',
        pts: [
          [-1, -1],
          [3, -1],
          [3, 3],
        ],
        cerita: 'Petak kebun berbentuk persegi KLMN dengan K(−1, −1), L(3, −1), dan M(3, 3).',
        pertanyaan: 'Koordinat titik N adalah …',
        explanation: 'N tepat di atas K dan sejajar dengan M: N = K + M − L = (−1, 3).',
      },
      {
        id: 'sP1',
        minta: 'panjang',
        ikon: '📏',
        p: [-3, 2],
        q: [4, 2],
        satuan: 'meter',
        cerita:
          'Pagar lurus dipasang dari titik (−3, 2) ke titik (4, 2) pada denah berskala 1 petak = 1 meter.',
        pertanyaan: 'Berapa panjang pagar itu?',
        explanation: 'Sisi mendatar: selisih x = 4 − (−3) = 7, jadi 7 meter.',
      },
      {
        id: 'sP2',
        minta: 'panjang',
        ikon: '📏',
        p: [1, -4],
        q: [1, 3],
        satuan: 'meter',
        cerita:
          'Jalan setapak lurus menghubungkan titik (1, −4) dan (1, 3) pada denah berskala 1 petak = 1 meter.',
        pertanyaan: 'Berapa panjang jalan setapak itu?',
        explanation: 'Sisi tegak: selisih y = 3 − (−4) = 7, jadi 7 meter.',
      },
      {
        id: 'sP3',
        minta: 'panjang',
        ikon: '📏',
        p: [-5, -2],
        q: [-1, -2],
        satuan: 'meter',
        cerita:
          'Bangku panjang ditaruh dari titik (−5, −2) sampai (−1, −2) pada denah berskala 1 petak = 1 meter.',
        pertanyaan: 'Berapa panjang bangku itu?',
        explanation: 'Sisi mendatar: selisih x = −1 − (−5) = 4, jadi 4 meter.',
      },
      {
        id: 'sJ1',
        minta: 'jenisBangun',
        ikon: '🔷',
        gambar: 'bangun',
        titik: ['A', 'B', 'C', 'D'],
        pts: [
          [-3, 0],
          [3, 0],
          [1, 3],
          [-1, 3],
        ],
        cerita:
          'Atap panggung kecil digambar sebagai ABCD dengan A(−3, 0), B(3, 0), C(1, 3), D(−1, 3).',
        pertanyaan: 'Bangun ABCD berbentuk …',
        explanation:
          'AB ∥ DC (keduanya mendatar), tetapi BC tidak sejajar AD: hanya satu pasang sisi sejajar, jadi trapesium.',
      },
      {
        id: 'sJ2',
        minta: 'jenisBangun',
        ikon: '🔷',
        gambar: 'bangun',
        titik: ['P', 'Q', 'R', 'S'],
        pts: [
          [0, -3],
          [2, 0],
          [0, 3],
          [-2, 0],
        ],
        cerita: 'Ubin hias digambar sebagai PQRS dengan P(0, −3), Q(2, 0), R(0, 3), S(−2, 0).',
        pertanyaan: 'Bangun PQRS berbentuk …',
        explanation:
          'Keempat sisinya sama panjang dan dua pasang sisinya sejajar, tetapi sudutnya tidak siku-siku: belah ketupat.',
      },
      {
        id: 'sJ3',
        minta: 'jenisBangun',
        ikon: '🔷',
        gambar: 'bangun',
        titik: ['K', 'L', 'M', 'N'],
        pts: [
          [-4, -2],
          [2, -2],
          [4, 2],
          [-2, 2],
        ],
        cerita:
          'Spanduk miring digambar sebagai KLMN dengan K(−4, −2), L(2, −2), M(4, 2), N(−2, 2).',
        pertanyaan: 'Bangun KLMN berbentuk …',
        explanation:
          'Dua pasang sisi sejajar (KL ∥ NM, LM ∥ KN), tetapi sudutnya tidak siku-siku dan sisinya tidak sama: jajargenjang.',
      },
      {
        id: 'sG1',
        minta: 'gerak',
        ikon: '🚪',
        gerak: 'geser',
        cerita: 'Pintu geser kelas didorong lurus ke kanan sejauh 1 meter.',
        pertanyaan: 'Gerakan pintu itu termasuk …',
        explanation: 'Pintu berpindah lurus dengan arah dan jarak yang sama: geser (translasi).',
      },
      {
        id: 'sG2',
        minta: 'gerak',
        ikon: '🎡',
        gerak: 'putar',
        cerita:
          'Kursi bianglala berpindah dari posisi paling bawah ke paling atas mengelilingi poros.',
        pertanyaan: 'Gerakan kursi bianglala itu termasuk …',
        explanation: 'Kursi bergerak mengelilingi satu titik pusat (poros): putar (rotasi).',
      },
      {
        id: 'sG3',
        minta: 'gerak',
        ikon: '🏞️',
        gerak: 'cermin',
        cerita: 'Gunung terlihat terbalik di permukaan danau yang tenang.',
        pertanyaan: 'Bayangan gunung di danau itu menunjukkan …',
        explanation:
          'Permukaan danau berperan seperti cermin, sehingga bayangannya terbalik: cermin (refleksi).',
      },
      {
        id: 'sG4',
        minta: 'gerak',
        ikon: '🔎',
        gerak: 'perbesar',
        cerita:
          'Huruf kecil di kemasan obat tampak lebih besar saat dilihat melalui kaca pembesar.',
        pertanyaan: 'Perubahan huruf itu menunjukkan …',
        explanation: 'Ukuran huruf membesar tetapi bentuknya tetap: perbesar (dilatasi).',
      },
      {
        id: 'sG5',
        minta: 'gerak',
        ikon: '🧩',
        gerak: 'putar',
        cerita: 'Kepingan puzzle diputar seperempat putaran agar pas di tempatnya.',
        pertanyaan: 'Gerakan kepingan puzzle itu termasuk …',
        explanation: 'Kepingan berputar mengelilingi satu titik: putar (rotasi).',
      },
      {
        id: 'sB1',
        minta: 'bayangan',
        ikon: '🚩',
        p: [2, 1],
        t: { jenis: 'geser', dx: -4, dy: 3 },
        cerita: 'Bendera di titik (2, 1) digeser 4 petak ke kiri dan 3 petak ke atas.',
        pertanyaan: 'Di mana letak bendera sekarang?',
        explanation: 'x berkurang 4 (2 − 4 = −2) dan y bertambah 3 (1 + 3 = 4): (−2, 4).',
      },
      {
        id: 'sB2',
        minta: 'bayangan',
        ikon: '🪞',
        p: [3, 2],
        t: { jenis: 'cermin', sumbu: 'y' },
        cerita: 'Gambar bintang di titik (3, 2) dicerminkan terhadap sumbu-y.',
        pertanyaan: 'Di mana letak bayangan bintang itu?',
        explanation:
          'Cermin sumbu-y: jarak ke sumbu-y tetap 3 tetapi pindah ke kiri, y tetap: (−3, 2).',
      },
      {
        id: 'sB3',
        minta: 'bayangan',
        ikon: '🔍',
        p: [-2, 3],
        t: { jenis: 'perbesar', k: 2 },
        cerita: 'Gambar pada denah diperbesar 2 kali dari titik O. Salah satu titiknya (−2, 3).',
        pertanyaan: 'Di mana letak titik itu setelah diperbesar?',
        explanation: 'Kedua koordinat dikali 2: (−2 × 2, 3 × 2) = (−4, 6).',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses penyelidikan dan menjelaskan koordinat serta ide transformasi dengan kata sendiri.',
    guru: 'Gunakan rekap dan jawaban refleksi sebagai asesmen diagnostik prasyarat: kelompokkan murid yang masih menukar x–y atau keliru menamai segi empat untuk pendampingan sebelum materi translasi.',
    pertanyaan: [
      {
        id: 'rKoordinat',
        teks: 'Jelaskan kepada temanmu cara memasang titik (−3, 2) pada bidang Kartesius.',
        placeholder: 'Mulai dari O, lalu …',
      },
      {
        id: 'rDugaan',
        teks: 'Dugaan mana yang berubah setelah kamu menyelidiki? Mengapa berubah?',
        placeholder: 'Awalnya aku menduga … ternyata …',
      },
      {
        id: 'rSehari',
        teks: 'Sebutkan satu contoh geser, cermin, putar, atau perbesar lain di sekitarmu, lalu jelaskan apa yang tetap dan apa yang berubah.',
        placeholder: 'Contohnya … Yang tetap … yang berubah …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menentukan koordinat titik dan mengenali gerakan bangun?',
    diriOpsi: [
      { id: 'yakin', label: '🌟 Sangat yakin, aku bisa menjelaskan ke teman' },
      { id: 'cukup', label: '🙂 Cukup yakin' },
      { id: 'ragu', label: '🤔 Masih ragu di beberapa bagian' },
      { id: 'belum', label: '🙋 Belum yakin, aku perlu bantuan' },
    ],
    nextLabel: 'Simpan & Selesai',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Penyelidikan Selesai!',
    teks: 'Denah panggung siap! Kak Dimas kini yakin setiap properti terpasang tepat di koordinatnya, dan seksi dekorasi tahu apa yang terjadi saat properti digeser, dicerminkan, diputar, atau diperbesar.',
    contoh: [
      { teks: 'L(−3, 2)', keterangan: 'x mendatar dulu, lalu y tegak' },
      { teks: '4 − (−4) = 8', keterangan: 'Panjang sisi dari selisih koordinat' },
      { teks: 'Geser · Cermin · Putar · Perbesar', keterangan: 'Ide awal transformasi geometri' },
    ],
    capaian: [
      'Menentukan dan memasang koordinat titik di keempat kuadran dan pada sumbu.',
      'Menentukan titik sudut yang hilang, panjang sisi, dan jenis segi empat dari koordinatnya.',
      'Mengaitkan contoh sehari-hari dengan geser, cermin, putar, dan perbesar.',
      'Menjelaskan bahwa geser, cermin, dan putar mempertahankan ukuran & bentuk, sedangkan perbesar mengubah ukuran saja.',
    ],
  },
};
