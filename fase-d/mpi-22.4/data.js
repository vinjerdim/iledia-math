'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Volume Prisma
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Tujuan Pembelajaran:
   Menentukan rumus volume prisma.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'kubus' & 'lapisan'
     Sintaks 4 — Data processing ............ tahap 'olah'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas:
     1. Stimulasi   — toko curah “Pojok Isi Ulang”: pelanggan membawa
                      wadah berbentuk prisma. Berapa cm³ isi setiap
                      wadah? Murid MENDUGA caranya + alasan (tidak dinilai).
     2. Masalah     — memilih rumusan masalah & menulis hipotesis.
     3. Kubus       — Lab Tumpuk mode kubus satuan: mengisi dua kotak
                      balok lapis demi lapis dengan kubus 1 cm³, mengisi
                      kartu (kubus satu lapisan, banyak lapisan, total
                      kubus, luas alas) berdiagnosa, lalu pertanyaan
                      penuntun: kubus satu lapisan = luas alas, banyak
                      lapisan = tinggi.
     4. Lapisan     — (a) membelah balok menurut diagonal alasnya menjadi
                      dua prisma segitiga kongruen → volume prisma
                      segitiga = ½ volume balok = luas alas segitiga ×
                      tinggi; (b) Lab Tumpuk mode lapisan: wadah beralas
                      segitiga & trapesium diisi lapisan setebal 1 cm,
                      kartu isian, pertanyaan penuntun.
     5. Olah data   — kartu data tiga wadah (La, t, V, V ÷ La),
                      pertanyaan penuntun pola, dan memilah kartu
                      “menghasilkan volume / tidak”.
     6. Pembuktian  — wadah beras baru: cara balok pembungkus (½ × p × l
                      × t) vs dugaan rumus → hasilnya sama; menanggapi
                      empat miskonsepsi teman.
     7. Simpulan    — menyusun kalimat kesimpulan dari bank kalimat.
     8. Uji terap   — 8 soal kontekstual.
     9. Refleksi    — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan.

   Alas prisma ditulis sebagai titik-titik poligon dalam cm (lihat
   shared/engine.js seksi 47 & 54). Semua kunci (luas alas, volume,
   konversi, pengecoh) diuji terhadap engine di
   tests/mpi-22.4-data.test.js.
   ============================================================ */

var DATA = {
  /* ----------------------------------------------------------
     PRISMA — wadah pelanggan (dipakai tahap 1, 3–5)
     ---------------------------------------------------------- */
  prisma: [
    {
      id: 'teh',
      nama: '🍵 Kotak teh',
      bentuk: 'prisma segiempat (balok)',
      alas: [
        [0, 0],
        [4, 0],
        [4, 3],
        [0, 3],
      ],
      t: 5,
      kubus: true,
      info: 'alas 4 cm × 3 cm, tinggi 5 cm',
      infoAlas: 'persegi panjang berukuran 4 cm × 3 cm',
      caraLuasAlas: '4 × 3',
    },
    {
      id: 'gula',
      nama: '🧂 Kotak gula',
      bentuk: 'prisma segiempat (balok)',
      alas: [
        [0, 0],
        [5, 0],
        [5, 4],
        [0, 4],
      ],
      t: 4,
      kubus: true,
      info: 'alas 5 cm × 4 cm, tinggi 4 cm',
      infoAlas: 'persegi panjang berukuran 5 cm × 4 cm',
      caraLuasAlas: '5 × 4',
    },
    {
      id: 'kacang',
      nama: '🥜 Wadah kacang',
      bentuk: 'prisma segitiga',
      alas: [
        [0, 0],
        [6, 0],
        [3, 4],
      ],
      t: 8,
      adaSetengah: true,
      info: 'alas segitiga 6 cm, tinggi segitiga 4 cm, tinggi wadah 8 cm',
      infoAlas: 'segitiga sama kaki dengan alas 6 cm, kaki 5 cm, dan tinggi segitiga 4 cm',
      caraLuasAlas: '½ × 6 × 4',
    },
    {
      id: 'camilan',
      nama: '🍪 Wadah camilan',
      bentuk: 'prisma trapesium',
      alas: [
        [0, 0],
        [7, 0],
        [4, 4],
        [0, 4],
      ],
      t: 5,
      adaSetengah: true,
      info: 'alas trapesium siku-siku, tinggi wadah 5 cm',
      infoAlas:
        'trapesium siku-siku dengan sisi sejajar 7 cm dan 4 cm, tinggi trapesium 4 cm, dan sisi miring 5 cm',
      caraLuasAlas: '½ × (7 + 4) × 4',
    },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1 (Stimulation)',
    goal: 'Mengamati wadah-wadah berbentuk prisma dan menduga cara menghitung isinya.',
    tp: 'Menentukan rumus volume prisma.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menjelaskan volume prisma sebagai banyak kubus satuan yang mengisi prisma sampai penuh.',
      'Menunjukkan bahwa prisma tersusun atas lapisan-lapisan setebal 1 satuan yang bentuknya sama dengan alasnya.',
      'Menemukan rumus volume prisma: V = luas alas × tinggi prisma.',
      'Menggunakan rumus volume prisma untuk menyelesaikan masalah sehari-hari.',
    ],
    guru: 'Bawa beberapa wadah nyata (kotak teh, wadah segitiga) dan kubus satuan/dadu bila ada. Tanyakan “berapa banyak isi yang muat?” dan biarkan murid menduga tanpa dikoreksi; dugaan akan diuji pada tahap-tahap berikutnya.',
    judul: 'Pojok Isi Ulang Bu Sari',
    cerita:
      'Di toko curah “Pojok Isi Ulang”, pelanggan membawa wadah sendiri untuk diisi teh, gula, kacang, atau camilan. Bu Sari ingin tahu berapa cm³ isi setiap wadah supaya bisa menakar dengan tepat dan menentukan harganya. Wadahnya berbentuk prisma dengan alas yang berbeda-beda.',
    galeri: ['teh', 'kacang', 'camilan'],
    pertanyaan: 'Menurut dugaanmu, bagaimana cara mengetahui isi (volume) sebuah wadah?',
    opsi: [
      { id: 'kubus', label: 'Menghitung berapa kubus kecil yang muat di dalamnya sampai penuh' },
      { id: 'kali3', label: 'Mengalikan panjang, lebar, dan tinggi wadah' },
      { id: 'luas', label: 'Menjumlahkan luas semua sisi wadah' },
      { id: 'rusuk', label: 'Menjumlahkan panjang semua rusuk wadah' },
    ],
    alasanLabel: 'Tuliskan alasan dugaanmu.',
    alasanPlaceholder: 'Aku menduga begitu karena …',
    catatan:
      'Belum ada jawaban benar atau salah. Simpan dugaanmu, nanti kamu akan membuktikannya sendiri.',
    nextLabel: 'Lanjut ke Rumusan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: 'Discovery Learning · Sintaks 2 (Problem Statement)',
    goal: 'Merumuskan pertanyaan yang akan diselidiki dan menulis hipotesis.',
    guru: 'Tekankan bahwa isi wadah = volume, dan satuan volume adalah satuan kubik (cm³). Terima hipotesis apa pun selama bisa diuji dengan mengisi wadah.',
    pengantar:
      'Isi sebuah wadah disebut volume, diukur dengan kubus satuan: 1 cm³ adalah isi kubus berukuran 1 cm × 1 cm × 1 cm. Bu Sari ingin punya cara cepat menghitung volume wadah prisma hanya dari ukuran alas dan tingginya.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'rumus',
        label: 'Bagaimana cara menghitung volume prisma dari ukuran alas dan tingginya?',
      },
      { id: 'karton', label: 'Berapa luas karton untuk membuat satu wadah?' },
      { id: 'harga', label: 'Berapa harga satu kilogram gula di toko itu?' },
      { id: 'rusuk', label: 'Berapa banyak rusuk yang dimiliki wadah kacang?' },
    ],
    correct: 'rumus',
    umpan: {
      rumus:
        'Tepat! Pertanyaan ini bisa diselidiki dengan mengisi wadah menggunakan kubus satuan dan lapisan.',
      karton:
        'Luas karton adalah luas permukaan (materi 22.2), bukan isi wadah. Coba pilih yang lain.',
      harga:
        'Harga penting untuk berjualan, tetapi Bu Sari harus tahu dulu isi wadahnya. Coba pilih yang lain.',
      rusuk: 'Banyak rusuk sudah kamu pelajari di materi 22.1 dan tidak menjawab isi wadah.',
    },
    hipotesisLabel: 'Tulis hipotesismu: menurutmu, volume prisma dihitung dari ukuran apa saja?',
    hipotesisPlaceholder: 'Menurutku, volume prisma dihitung dengan …',
    nextLabel: 'Mulai Mengisi Kotak →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MENGISI KOTAK DENGAN KUBUS SATUAN
     ---------------------------------------------------------- */
  kubus: {
    kicker: 'Tahap 3 · Mengumpulkan Data (1)',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Mengisi kotak balok dengan kubus satuan lapis demi lapis dan mencatat banyaknya.',
    guru: 'Bila ada kubus satuan/dadu, minta murid menyusun satu lapisan di atas alas kotak nyata. Tekankan: hitung kubus satu lapisan dulu, baru banyak lapisannya. Pantau murid yang menjumlahkan panjang dan lebar.',
    instruksi:
      'Pilih kotak, lalu tambahkan kubus satuan (1 cm³) lapis demi lapis dengan tombol “+ 1 lapis” atau penggeser sampai kotak penuh. Amati kisi kubus di sisi atas dan samping.',
    lab: ['teh', 'gula'],
    syaratLab: 'Untuk melanjutkan: isi kedua kotak sampai penuh.',
    instruksiKartu:
      'Isi kartu setiap kotak. Hitung kubus di satu lapisan (baris × kolom), banyak lapisan, lalu banyak kubus seluruhnya.',
    tanya: [
      {
        id: 'k1',
        tanya: 'Banyak kubus satuan di satu lapisan selalu sama dengan …',
        opsi: [
          { id: 'luas', label: 'luas alas kotak (panjang × lebar)' },
          { id: 'keliling', label: 'keliling alas kotak' },
          { id: 'tinggi', label: 'tinggi kotak' },
          { id: 'rusuk', label: 'banyak rusuk kotak' },
        ],
        correct: 'luas',
        umpan: {
          luas: 'Tepat! Satu lapisan menutup seluruh alas: kotak teh 4 × 3 = 12 kubus, luas alasnya 12 cm².',
          keliling:
            'Keliling hanya menghitung tepi alas (4 + 3 + 4 + 3 = 14), padahal kubus menutupi SELURUH alas.',
          tinggi: 'Tinggi kotak menentukan banyak LAPISAN, bukan isi satu lapisan.',
          rusuk: 'Balok punya 12 rusuk untuk kotak berukuran apa pun, jadi tidak ada hubungannya.',
        },
      },
      {
        id: 'k2',
        tanya: 'Banyak lapisan kubus sampai kotak penuh selalu sama dengan …',
        opsi: [
          { id: 'tinggi', label: 'tinggi kotak' },
          { id: 'panjang', label: 'panjang alas kotak' },
          { id: 'lebar', label: 'lebar alas kotak' },
          { id: 'luas', label: 'luas alas kotak' },
        ],
        correct: 'tinggi',
        umpan: {
          tinggi:
            'Tepat! Setiap lapisan setebal 1 cm, jadi kotak setinggi 5 cm berisi 5 lapisan, setinggi 4 cm berisi 4 lapisan.',
          panjang: 'Panjang alas menentukan banyak kubus dalam satu baris, bukan banyak lapisan.',
          lebar: 'Lebar alas menentukan banyak baris dalam satu lapisan, bukan banyak lapisan.',
          luas: 'Luas alas adalah isi SATU lapisan. Hitung lagi berapa lapisan yang kamu tumpuk.',
        },
      },
      {
        id: 'k3',
        tanya: 'Jadi, banyak kubus seluruhnya (volume kotak) dapat dihitung dengan …',
        opsi: [
          { id: 'lxt', label: 'luas alas × tinggi' },
          { id: 'lpt', label: 'luas alas + tinggi' },
          { id: 'kxt', label: 'keliling alas × tinggi' },
          { id: 'dua', label: '2 × luas alas + tinggi' },
        ],
        correct: 'lxt',
        umpan: {
          lxt: 'Tepat! Isi satu lapisan (luas alas) dikali banyak lapisan (tinggi): 12 × 5 = 60 dan 20 × 4 = 80.',
          lpt: 'Coba hitung: 12 + 5 = 17, padahal kotak teh berisi 60 kubus.',
          kxt: 'Coba hitung: 14 × 5 = 70, padahal kotak teh berisi 60 kubus.',
          dua: 'Coba hitung: 2 × 12 + 5 = 29, padahal kotak teh berisi 60 kubus.',
        },
      },
    ],
    temuan:
      'Kubus di satu lapisan = luas alas, banyak lapisan = tinggi. Volume balok = luas alas × tinggi.',
    nextLabel: 'Lanjut: Prisma Beralas Lain →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — BELAH BALOK & LAPISAN PRISMA
     ---------------------------------------------------------- */
  lapisan: {
    kicker: 'Tahap 4 · Mengumpulkan Data (2)',
    syntax: 'Discovery Learning · Sintaks 3 (Data Collection)',
    goal: 'Menyelidiki volume prisma yang alasnya bukan persegi panjang: membelah balok dan menumpuk lapisan.',
    guru: 'Peragakan dengan balok dari busa/sabun batang yang dipotong diagonal. Tanyakan: “Dua potongan ini sama besar? Jadi volume satu potongan berapa?” Pada Lab Tumpuk, tekankan bahwa setiap lapisan bentuknya sama dengan alas.',
    instruksiBelah:
      'Kotak teh (4 cm × 3 cm × 5 cm) dibelah menurut diagonal alasnya. Tekan ✂️ Belah & pisahkan, amati kedua potongannya, lalu isi kartu.',
    belah: { nama: 'Kotak teh', p: 4, l: 3, t: 5 },
    kartuBelahJudul: '✂️ Balok dibelah dua',
    hintsBelah: [
      'Volume balok = 4 × 3 × 5.',
      'Balok terbelah menjadi dua prisma yang sama persis, jadi volume satu prisma = ½ × volume balok.',
      'Alas prisma segitiga siku-siku dengan sisi siku-siku 4 cm dan 3 cm: luas = ½ × 4 × 3.',
    ],
    instruksiLapis:
      'Sekarang wadah yang alasnya segitiga dan trapesium. Isi setiap wadah dengan lapisan setebal 1 cm sampai penuh, lalu isi kartunya.',
    lab: ['kacang', 'camilan'],
    syaratLab: 'Untuk melanjutkan: isi kedua wadah sampai penuh.',
    tanya: [
      {
        id: 'l1',
        tanya: 'Setelah balok dibelah, apa yang kamu temukan tentang kedua prisma segitiga?',
        opsi: [
          { id: 'setengah', label: 'Keduanya kongruen, jadi volume masing-masing ½ volume balok' },
          { id: 'beda', label: 'Salah satu prisma lebih besar daripada yang lain' },
          { id: 'utuh', label: 'Volume satu prisma sama dengan volume balok utuh' },
          { id: 'tinggi', label: 'Tinggi prisma segitiga menjadi setengah tinggi balok' },
        ],
        correct: 'setengah',
        umpan: {
          setengah:
            'Tepat! 60 : 2 = 30 cm³, dan itu sama dengan luas alas segitiga × tinggi = 6 × 5.',
          beda: 'Diagonal membagi persegi panjang menjadi dua segitiga yang sama persis. Coba belah lagi dan bandingkan.',
          utuh: 'Balok terbagi menjadi DUA prisma, jadi masing-masing hanya setengahnya.',
          tinggi:
            'Balok dibelah tegak, jadi tinggi kedua prisma tetap 5 cm. Yang terbagi dua adalah alasnya.',
        },
      },
      {
        id: 'l2',
        tanya: 'Volume satu lapisan setebal 1 cm pada wadah prisma selalu sama dengan …',
        opsi: [
          { id: 'la', label: 'luas alas × 1' },
          { id: 'k', label: 'keliling alas × 1' },
          { id: 't', label: 'tinggi prisma' },
          { id: 'dua', label: '2 × luas alas' },
        ],
        correct: 'la',
        umpan: {
          la: 'Tepat! Setiap lapisan bentuknya sama dengan alas, jadi isinya luas alas × 1 cm.',
          k: 'Keliling hanya mengukur tepi alas. Isi lapisan ditentukan oleh luas daerahnya.',
          t: 'Tinggi prisma adalah banyak lapisan, bukan isi satu lapisan.',
          dua: 'Setiap lapisan hanya sekali luas alas. Angka 2 × luas alas muncul di rumus luas permukaan.',
        },
      },
      {
        id: 'l3',
        tanya: 'Cara “isi satu lapisan × banyak lapisan” ternyata berlaku untuk …',
        opsi: [
          { id: 'semua', label: 'semua prisma, apa pun bentuk alasnya' },
          { id: 'balok', label: 'balok saja' },
          { id: 'segitiga', label: 'prisma segitiga saja' },
          { id: 'persegi', label: 'prisma yang alasnya persegi saja' },
        ],
        correct: 'semua',
        umpan: {
          semua:
            'Tepat! Balok, prisma segitiga, dan prisma trapesium sama-sama tersusun dari lapisan yang kongruen dengan alasnya.',
          balok:
            'Wadah kacang (alas segitiga) dan wadah camilan (alas trapesium) juga bisa ditumpuk lapis demi lapis.',
          segitiga: 'Kotak teh dan wadah camilan juga dihitung dengan cara yang sama.',
          persegi: 'Alas kotak teh saja bukan persegi, tetapi caranya tetap berlaku.',
        },
      },
    ],
    temuan:
      'Prisma apa pun tersusun dari lapisan-lapisan setebal 1 satuan yang bentuknya sama dengan alas. Isi satu lapisan = luas alas, banyak lapisan = tinggi prisma.',
    nextLabel: 'Lanjut ke Mengolah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGOLAH DATA
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 5 · Mengolah Data',
    syntax: 'Discovery Learning · Sintaks 4 (Data Processing)',
    goal: 'Mengolah data luas alas, tinggi, dan volume tiga wadah untuk menemukan pola volume prisma.',
    guru: 'Murid bisa bekerja berpasangan: satu menghitung, satu memeriksa. Setelah ketiga kartu benar, minta murid membandingkan kolom “volume ÷ luas alas” dengan kolom tinggi.',
    instruksiData:
      'Lengkapi kartu data ketiga wadah. Volume diambil dari hasil menumpuk lapisan di Lab Tumpuk (isi satu lapisan × banyak lapisan).',
    prismaIds: ['teh', 'kacang', 'camilan'],
    instruksiPola: 'Perhatikan ketiga kartu datamu, lalu jawab pertanyaan berikut.',
    konsep: [
      {
        id: 'p1',
        tanya: 'Pada ketiga wadah, hasil volume ÷ luas alas selalu sama dengan …',
        opsi: [
          { id: 'tinggi', label: 'tinggi prisma' },
          { id: 'keliling', label: 'keliling alas' },
          { id: 'satu', label: 'angka 1' },
          { id: 'la', label: 'luas alas' },
        ],
        correct: 'tinggi',
        umpan: {
          tinggi:
            'Tepat! 60 ÷ 12 = 5, 96 ÷ 12 = 8, dan 110 ÷ 22 = 5, sama dengan tinggi setiap wadah.',
          keliling:
            'Keliling alas kotak teh 14 cm, tetapi 60 ÷ 12 = 5. Bandingkan dengan kolom tinggi.',
          satu: 'Periksa kartumu: 60 ÷ 12 = 5, bukan 1.',
          la: 'Periksa kartumu: 96 ÷ 12 = 8, sedangkan luas alas wadah kacang 12 cm².',
        },
      },
      {
        id: 'p2',
        tanya: 'Jadi, volume setiap wadah sama dengan …',
        opsi: [
          { id: 'rumus', label: 'luas alas × tinggi prisma' },
          { id: 'lp', label: '2 × luas alas + keliling alas × tinggi' },
          { id: 'kali3', label: 'panjang × lebar × tinggi, untuk semua prisma' },
          { id: 'sepertiga', label: '⅓ × luas alas × tinggi prisma' },
        ],
        correct: 'rumus',
        umpan: {
          rumus: 'Tepat! V = luas alas × tinggi berlaku untuk ketiga wadah.',
          lp: 'Itu rumus luas permukaan (luas pembungkus), bukan isi wadah.',
          kali3:
            'Panjang × lebar × tinggi hanya untuk balok, karena luas alasnya = panjang × lebar. Wadah kacang alasnya segitiga.',
          sepertiga: 'Coba hitung: ⅓ × 12 × 5 = 20, padahal kotak teh berisi 60 cm³.',
        },
      },
      {
        id: 'p3',
        tanya:
          'Kotak teh (alas persegi panjang) dan wadah kacang (alas segitiga) sama-sama beralas 12 cm². Jika tingginya dibuat sama, volumenya …',
        opsi: [
          { id: 'sama', label: 'sama, karena luas alas dan tingginya sama' },
          { id: 'teh', label: 'kotak teh lebih besar, karena alasnya persegi panjang' },
          { id: 'kacang', label: 'wadah kacang lebih besar, karena alasnya segitiga' },
          { id: 'tidak', label: 'tidak bisa dibandingkan karena bentuk alasnya berbeda' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Tepat! Volume hanya bergantung pada luas alas dan tinggi, bukan bentuk alasnya.',
          teh: 'Bentuk alas tidak menentukan isi. Setiap lapisan keduanya sama-sama berisi 12 cm³.',
          kacang:
            'Bentuk alas tidak menentukan isi. Setiap lapisan keduanya sama-sama berisi 12 cm³.',
          tidak:
            'Bisa dibandingkan: hitung isi satu lapisan (luas alas) lalu kalikan banyak lapisan.',
        },
      },
    ],
    instruksiPilah:
      'Bu Sari menulis beberapa cara menghitung. Pilah: apakah cara ini menghasilkan VOLUME prisma?',
    opsiKlas: [
      { id: 'volume', label: 'Menghasilkan volume' },
      { id: 'bukan', label: 'Bukan volume' },
    ],
    pilah: [
      {
        id: 'q1',
        teks: 'Luas alas × tinggi prisma',
        correct: 'volume',
        explanation: 'Isi satu lapisan (luas alas) dikali banyak lapisan (tinggi).',
      },
      {
        id: 'q2',
        teks: 'Banyak kubus satuan di satu lapisan × banyak lapisan',
        correct: 'volume',
        explanation: 'Inilah cara menghitung banyak kubus satuan yang mengisi prisma sampai penuh.',
      },
      {
        id: 'q3',
        teks: '½ × volume balok, untuk prisma segitiga hasil belahan diagonal balok',
        correct: 'volume',
        explanation:
          'Balok terbelah menjadi dua prisma segitiga kongruen, masing-masing setengahnya.',
      },
      {
        id: 'q4',
        teks: '2 × luas alas + keliling alas × tinggi',
        correct: 'bukan',
        explanation: 'Itu luas permukaan (luas pembungkus), satuannya cm², bukan isi.',
      },
      {
        id: 'q5',
        teks: 'Keliling alas × tinggi prisma',
        correct: 'bukan',
        explanation: 'Itu luas selimut (sisi-sisi tegak), bukan isi prisma.',
      },
      {
        id: 'q6',
        teks: 'Luas alas + tinggi prisma',
        correct: 'bukan',
        explanation:
          'Isi satu lapisan harus DIKALI banyak lapisan. Menjumlahkan luas dan panjang tidak bermakna.',
      },
      {
        id: 'q7',
        teks: '⅓ × luas alas × tinggi prisma',
        correct: 'bukan',
        explanation:
          'Faktor ⅓ dipakai untuk limas (materi berikutnya), bukan prisma yang lapisannya sama besar.',
      },
    ],
    temuan: 'Volume prisma = isi satu lapisan × banyak lapisan = luas alas × tinggi prisma.',
    nextLabel: 'Lanjut ke Pembuktian →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    syntax: 'Discovery Learning · Sintaks 5 (Verification)',
    goal: 'Membuktikan dugaan rumus pada wadah baru dengan dua cara dan menanggapi pendapat teman.',
    guru: 'Minta murid mengerjakan kedua cara, lalu bandingkan hasilnya di depan kelas. Gambarkan segitiga sama kaki di dalam persegi panjang 10 × 12 dan tunjukkan dua potongan di kiri-kanan yang bila digabung sama dengan segitiga itu.',
    prisma: {
      id: 'beras',
      nama: '🍚 Wadah beras',
      alas: [
        [0, 0],
        [10, 0],
        [5, 12],
      ],
      t: 15,
      bungkus: { p: 10, l: 12 },
      infoAlas: 'segitiga sama kaki: alas 10 cm, kaki 13 cm, tinggi segitiga 12 cm',
    },
    cerita:
      'Seorang pelanggan membawa wadah beras berbentuk prisma segitiga. Alasnya segitiga sama kaki dengan alas 10 cm, kaki 13 cm, dan tinggi segitiga 12 cm. Tinggi wadah 15 cm. Wadah itu pas masuk ke dalam kardus balok berukuran 10 cm × 12 cm × 15 cm (garis putus-putus).',
    instruksiBalok:
      'Cara 1 — gunakan kardus pembungkus. Segitiga sama kaki itu tepat menutup setengah persegi panjang 10 cm × 12 cm.',
    langkahBalok: [
      {
        id: 'b1',
        label: 'Volume kardus balok = 10 × 12 × 15 = … cm³',
        kunci: 'vBungkus',
        hints: ['10 × 12 = 120, lalu 120 × 15.'],
      },
      {
        id: 'b2',
        label: 'Wadah beras mengisi setengah kardus, jadi volumenya = ½ × 1.800 = … cm³',
        kunci: 'vSetengah',
        hints: ['Bagi 1.800 dengan 2.'],
      },
    ],
    instruksiRumus: 'Cara 2 — gunakan dugaan rumus dari tahap sebelumnya.',
    langkahRumus: [
      {
        id: 'r1',
        label: 'Luas alas = ½ × 10 × 12 = … cm²',
        kunci: 'luasAlas',
        hints: ['Luas segitiga = ½ × alas × tinggi segitiga.'],
      },
      {
        id: 'r2',
        label: 'Volume = luas alas × tinggi prisma = 60 × 15 = … cm³',
        kunci: 'rumus',
        hints: ['60 × 15 = 60 × 10 + 60 × 5.'],
      },
    ],
    temuanSama:
      'Kedua cara menghasilkan 900 cm³. Dugaan rumus V = luas alas × tinggi prisma terbukti pada wadah baru!',
    instruksiMiskonsepsi:
      'Empat temanmu menghitung volume wadah beras itu. Tanggapi pendapat mereka.',
    soal: [
      {
        id: 'm1',
        teks: 'Raka: “Volumenya 10 × 12 × 15 = 1.800 cm³.”',
        nilaiTeman: 1800,
        miskonsepsi: 'lupa-setengah',
        options: [
          {
            id: 'a',
            label: 'Kurang tepat, itu volume kardus balok; luas alas segitiga memakai ½',
          },
          { id: 'b', label: 'Sudah tepat, volume selalu panjang × lebar × tinggi' },
          { id: 'c', label: 'Kurang tepat, seharusnya 10 × 13 × 15' },
          { id: 'd', label: 'Kurang tepat, seharusnya 10 + 12 + 15' },
        ],
        correct: 'a',
        explanation:
          'Alas wadah berbentuk segitiga, luasnya ½ × 10 × 12 = 60 cm². Volumenya 60 × 15 = 900 cm³, setengah volume kardus.',
      },
      {
        id: 'm2',
        teks: 'Sinta: “2 × 60 + 36 × 15 = 660 cm³.”',
        nilaiTeman: 660,
        miskonsepsi: 'luas-permukaan',
        options: [
          { id: 'a', label: 'Kurang tepat, itu rumus luas permukaan, bukan volume' },
          { id: 'b', label: 'Sudah tepat, volume memakai keliling alas' },
          { id: 'c', label: 'Kurang tepat, luas alas seharusnya dikali 3' },
          { id: 'd', label: 'Kurang tepat, keliling alas seharusnya 26 cm' },
        ],
        correct: 'a',
        explanation:
          '2 × luas alas + keliling alas × tinggi adalah luas pembungkus (cm²). Isi wadah dihitung dengan luas alas × tinggi = 900 cm³.',
      },
      {
        id: 'm3',
        teks: 'Dimas: “⅓ × 60 × 15 = 300 cm³.”',
        nilaiTeman: 300,
        miskonsepsi: 'sepertiga',
        options: [
          { id: 'a', label: 'Kurang tepat, prisma tidak memakai ⅓ karena lapisannya sama besar' },
          { id: 'b', label: 'Sudah tepat, semua bangun ruang memakai ⅓' },
          { id: 'c', label: 'Kurang tepat, seharusnya ½ × 60 × 15' },
          { id: 'd', label: 'Kurang tepat, seharusnya 60 + 15' },
        ],
        correct: 'a',
        explanation:
          'Prisma tersusun dari 15 lapisan yang masing-masing berisi 60 cm³, jadi volumenya 60 × 15 = 900 cm³ tanpa ⅓.',
      },
      {
        id: 'm4',
        teks: 'Nita: “Volumenya 60 × 15 = 900 cm².”',
        miskonsepsi: 'satuan',
        options: [
          { id: 'a', label: 'Angkanya tepat, tetapi satuan volume adalah cm³, bukan cm²' },
          { id: 'b', label: 'Sudah tepat, satuan volume memang cm²' },
          { id: 'c', label: 'Kurang tepat, angkanya seharusnya 1.800' },
          { id: 'd', label: 'Kurang tepat, satuannya seharusnya cm' },
        ],
        correct: 'a',
        explanation:
          'Volume menghitung banyak kubus satuan 1 cm × 1 cm × 1 cm, jadi satuannya cm³ (sentimeter kubik).',
      },
    ],
    nextLabel: 'Lanjut ke Menarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    syntax: 'Discovery Learning · Sintaks 6 (Generalization)',
    goal: 'Menyusun kesimpulan tentang rumus volume prisma dari temuan sendiri.',
    guru: 'Setelah kesimpulan tepat, minta beberapa murid membacakannya dan menuliskan rumus di buku catatan beserta gambar lapisan-lapisannya.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari pilihan. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'g1', awal: 'Volume prisma adalah', correct: 'isi' },
      {
        id: 'g2',
        awal: 'Prisma tersusun dari lapisan-lapisan setebal 1 satuan yang bentuknya sama dengan alas, sehingga isi satu lapisan sama dengan',
        correct: 'lapis',
      },
      { id: 'g3', awal: 'Banyak lapisan itu sama dengan', correct: 'tinggi' },
      { id: 'g4', awal: 'Jadi, rumus volume prisma adalah', correct: 'rumus' },
    ],
    bank: [
      { id: 'isi', teks: 'banyak kubus satuan yang mengisi prisma sampai penuh.' },
      { id: 'lapis', teks: 'luas alas prisma.' },
      { id: 'tinggi', teks: 'tinggi prisma.' },
      { id: 'rumus', teks: 'V = luas alas × tinggi prisma.' },
      { id: 'lp', teks: 'V = 2 × luas alas + keliling alas × tinggi.' },
      { id: 'sepertiga', teks: 'V = ⅓ × luas alas × tinggi prisma.' },
      { id: 'keliling', teks: 'keliling alas prisma.' },
    ],
    rangkuman: [
      'Volume prisma = banyak kubus satuan yang mengisinya sampai penuh; satuannya kubik (cm³, m³) atau liter.',
      'Prisma tersusun dari lapisan setebal 1 satuan yang kongruen dengan alas: <strong>isi satu lapisan = luas alas</strong>.',
      'Banyak lapisan = <strong>tinggi prisma</strong>.',
      '<strong>V = La × t</strong>, dengan La = luas alas dan t = tinggi prisma. Balok: V = p × l × t.',
      'Hitung luas alas sesuai bentuknya (segitiga, trapesium, …) lebih dulu. 1 liter = 1 dm³ = 1.000 cm³.',
    ],
    dugaanJudul: 'Bandingkan dengan dugaan awalmu',
    tanggapanDugaan: {
      kubus:
        'Dugaanmu tepat! Volume memang banyak kubus satuan yang muat. Sekarang kamu punya cara cepatnya: luas alas × tinggi.',
      kali3:
        'Panjang × lebar × tinggi hanya tepat untuk balok, karena luas alasnya = panjang × lebar. Untuk semua prisma: luas alas × tinggi.',
      luas: 'Jumlah luas semua sisi adalah luas permukaan (pembungkus). Isi wadah dihitung dengan luas alas × tinggi.',
      rusuk:
        'Panjang rusuk berguna untuk membuat kerangka. Isi wadah dihitung dengan luas alas × tinggi.',
    },
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Discovery Learning · Penerapan',
    goal: 'Menggunakan rumus volume prisma untuk menyelesaikan masalah sehari-hari.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang banyak salah (terutama alas segitiga/trapesium, konversi liter, dan mencari tinggi) untuk dibahas bersama.',
    instruksi:
      'Kerjakan setiap soal. Bila ragu, buka petunjuk. Setelah menjawab, baca penjelasannya sebelum lanjut.',
    soal: [
      {
        id: 't1',
        type: 'input',
        konteks: '⛺ Tenda pramuka',
        cerita:
          'Tenda pramuka berbentuk prisma segitiga. Sisi depannya segitiga dengan alas 4 m dan tinggi 3 m. Panjang tenda 6 m.',
        pertanyaan: 'Berapa m³ volume udara di dalam tenda?',
        cek: {
          alas: [
            [0, 0],
            [4, 0],
            [2, 3],
          ],
          luasAlas: 6,
          tinggi: 6,
          adaSetengah: true,
        },
        jawab: 36,
        satuan: 'm³',
        hints: [
          'Alas prismanya adalah segitiga di sisi depan: luas = ½ × 4 × 3 = 6 m².',
          'Tinggi prisma adalah panjang tenda, 6 m. V = 6 × 6.',
        ],
        explanation: 'V = luas alas × tinggi = (½ × 4 × 3) × 6 = 6 × 6 = 36 m³.',
      },
      {
        id: 't2',
        type: 'choice',
        konteks: '🥛 Kotak susu',
        cerita: 'Kotak susu berbentuk balok dengan alas 6 cm × 4 cm dan tinggi 10 cm.',
        pertanyaan: 'Berapa volume kotak susu itu?',
        cek: {
          alas: [
            [0, 0],
            [6, 0],
            [6, 4],
            [0, 4],
          ],
          luasAlas: 24,
          kelilingAlas: 20,
          tinggi: 10,
        },
        options: [
          { id: 'benar', label: '240 cm³' },
          { id: 'luas-permukaan', label: '248 cm³' },
          { id: 'sepertiga', label: '80 cm³' },
          { id: 'jumlah-ukuran', label: '34 cm³' },
        ],
        correct: 'benar',
        hints: ['Luas alas = 6 × 4 = 24 cm².', 'V = 24 × 10.'],
        explanation: 'V = 24 × 10 = 240 cm³. (248 adalah luas permukaannya dalam cm².)',
      },
      {
        id: 't3',
        type: 'input',
        konteks: '🏊 Kolam renang',
        cerita:
          'Kolam renang panjangnya 10 m dan lebarnya 4 m. Ujung dangkal sedalam 1 m, ujung dalam sedalam 3 m, dan dasarnya miring rata. Kolam ini berbentuk prisma dengan alas trapesium (sisi samping kolam).',
        pertanyaan: 'Berapa m³ air untuk mengisi kolam sampai penuh?',
        cek: {
          alas: [
            [0, 0],
            [10, 0],
            [10, 3],
            [0, 1],
          ],
          luasAlas: 20,
          tinggi: 4,
          adaSetengah: true,
        },
        jawab: 80,
        satuan: 'm³',
        hints: [
          'Alas prisma = trapesium sisi samping kolam: sisi sejajar 1 m dan 3 m, tingginya 10 m.',
          'Luas trapesium = ½ × (1 + 3) × 10 = 20 m². Tinggi prisma = lebar kolam 4 m.',
        ],
        explanation: 'V = ½ × (1 + 3) × 10 × 4 = 20 × 4 = 80 m³.',
      },
      {
        id: 't4',
        type: 'choice',
        konteks: '🍫 Cokelat batang',
        cerita:
          'Cokelat batang berbentuk prisma segitiga. Luas sisi segitiganya 15 cm² dan panjang cokelat 12 cm.',
        pertanyaan: 'Berapa volume cokelat itu?',
        cek: { luasAlas: 15, tinggi: 12, adaSetengah: true },
        options: [
          { id: 'benar', label: '180 cm³' },
          { id: 'lupa-setengah', label: '360 cm³' },
          { id: 'sepertiga', label: '60 cm³' },
          { id: 'jumlah-ukuran', label: '27 cm³' },
        ],
        correct: 'benar',
        hints: [
          'Luas alas (segitiga) sudah diketahui, jadi tidak perlu dikali ½ lagi.',
          'V = 15 × 12.',
        ],
        explanation: 'V = luas alas × tinggi = 15 × 12 = 180 cm³.',
      },
      {
        id: 't5',
        type: 'input',
        konteks: '🍯 Toples segienam',
        cerita:
          'Toples madu berbentuk prisma segienam dengan luas alas 50 cm². Volumenya 1.000 cm³.',
        pertanyaan: 'Berapa cm tinggi toples itu?',
        cek: { luasAlas: 50, volume: 1000, cari: 'tinggi' },
        jawab: 20,
        satuan: 'cm',
        hints: ['V = luas alas × tinggi, jadi 1.000 = 50 × t.', 't = 1.000 ÷ 50.'],
        explanation: '1.000 = 50 × t → t = 1.000 ÷ 50 = 20 cm.',
      },
      {
        id: 't6',
        type: 'choice',
        konteks: '💧 Tangki air',
        cerita: 'Tangki air berbentuk balok dengan alas 1 m × 1 m dan tinggi 2 m.',
        pertanyaan: 'Berapa liter air yang dapat ditampung tangki itu? (1 m³ = 1.000 liter)',
        cek: { luasAlas: 1, tinggi: 2, dari: 'm3', ke: 'l' },
        options: [
          { id: 'benar', label: '2.000 liter' },
          { id: 'kurang', label: '200 liter' },
          { id: 'lebih', label: '20.000 liter' },
          { id: 'lupa', label: '2 liter' },
        ],
        correct: 'benar',
        hints: ['V = 1 × 1 × 2 = 2 m³.', '1 m³ = 1.000 liter, jadi 2 m³ = 2 × 1.000 liter.'],
        explanation: 'V = 2 m³ = 2 × 1.000 = 2.000 liter.',
      },
      {
        id: 't7',
        type: 'input',
        konteks: '✏️ Kotak pensil',
        cerita: 'Kotak pensil berbentuk prisma dengan volume 360 cm³ dan tinggi 18 cm.',
        pertanyaan: 'Berapa cm² luas alas kotak pensil itu?',
        cek: { tinggi: 18, volume: 360, cari: 'luasAlas' },
        jawab: 20,
        satuan: 'cm²',
        hints: ['V = luas alas × tinggi, jadi 360 = La × 18.', 'La = 360 ÷ 18.'],
        explanation: '360 = La × 18 → La = 360 ÷ 18 = 20 cm².',
      },
      {
        id: 't8',
        type: 'choice',
        konteks: '🍰 Kue lapis',
        cerita:
          'Kue lapis berbentuk prisma trapesium. Sisi sejajar trapesiumnya 8 cm dan 4 cm, tinggi trapesium 5 cm, dan panjang kue 20 cm.',
        pertanyaan: 'Perhitungan mana yang tepat untuk volume kue itu?',
        cek: { luasAlas: 30, tinggi: 20, cari: 'rumus' },
        options: [
          { id: 'benar', label: '½ × (8 + 4) × 5 × 20' },
          { id: 'lupa-setengah', label: '(8 + 4) × 5 × 20' },
          { id: 'jumlah', label: '½ × (8 + 4) × 5 + 20' },
          { id: 'kali-semua', label: '8 × 4 × 5 × 20' },
        ],
        correct: 'benar',
        hints: ['Hitung dulu luas alas trapesium: ½ × (jumlah sisi sejajar) × tinggi trapesium.'],
        explanation: 'V = luas alas × tinggi = ½ × (8 + 4) × 5 × 20 = 30 × 20 = 600 cm³.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Discovery Learning · Refleksi',
    goal: 'Merefleksikan proses menemukan rumus volume prisma.',
    guru: 'Baca beberapa refleksi murid (dengan izin) untuk menutup pelajaran. Tanyakan: “Bagian mana yang paling membantumu menemukan rumus?”',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Jelaskan dengan kata-katamu sendiri (pakai kata “lapisan”) mengapa volume prisma = luas alas × tinggi.',
        placeholder: 'Karena prisma tersusun dari …',
      },
      {
        id: 'q2',
        teks: 'Apa bedanya volume dan luas permukaan prisma? Sebutkan juga satuannya.',
        placeholder: 'Volume mengukur …, sedangkan luas permukaan …',
      },
      {
        id: 'q3',
        teks: 'Di mana lagi kamu bisa memakai volume prisma dalam kehidupan sehari-hari?',
        placeholder: 'Misalnya saat …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menentukan volume prisma sekarang?',
    diriOpsi: [
      { id: 'yakin', label: '😄 Sangat yakin, aku bisa menjelaskannya ke teman' },
      { id: 'cukup', label: '🙂 Cukup yakin, kadang masih perlu melihat catatan' },
      { id: 'ragu', label: '🤔 Masih ragu, aku perlu berlatih lagi' },
      { id: 'bingung', label: '😟 Masih bingung, aku perlu bantuan guru' },
    ],
    nextLabel: 'Simpan & Selesai ✓',
  },

  /* ----------------------------------------------------------
     SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, kamu menemukan rumusnya sendiri!',
    teks: 'Sekarang Bu Sari bisa menakar isi wadah prisma apa pun, cukup dari luas alas dan tingginya.',
    capaian: [
      'Mengisi kotak balok dengan kubus satuan lapis demi lapis.',
      'Membelah balok menjadi dua prisma segitiga dan menumpuk lapisan pada prisma beralas segitiga dan trapesium.',
      'Menemukan dan membuktikan rumus V = luas alas × tinggi prisma.',
      'Menggunakan rumus volume untuk tenda, kolam, cokelat, toples, dan tangki air.',
    ],
  },
};
