'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Bangun Kongruen & Sifat-sifatnya
   Fase D — SMP Kelas IX · Topik 29 Kekongruenan

   Tujuan Pembelajaran:
   Menjelaskan pengertian bangun kongruen dan sifat-sifatnya (sisi
   dan sudut bersesuaian sama besar) serta membedakannya dari
   bangun sebangun melalui kegiatan menjiplak dan mengukur berbagai
   bangun datar.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'jiplak' & 'ukur'
     Sintaks 4 — Data processing ............ tahap 'olah'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas:
     1. Stimulasi   — satu ubin teras sekolah (trapesium ABCD) pecah;
                      tukang membawa empat ubin pengganti. Murid MENDUGA
                      ubin mana yang pasti pas + alasan (tidak dinilai).
     2. Masalah     — memilih rumusan masalah & menulis hipotesis.
     3. Menjiplak   — kertas jiplak virtual: menjiplak ABCD, menempel
                      jiplakan pada tiap ubin, memutar/membalik sampai
                      berimpit, lalu mencatat hasilnya (berimpit tepat /
                      bentuk sama ukuran beda / bentuk beda).
     4. Mengukur    — penggaris & busur virtual: mengukur semua sisi dan
                      sudut ABCD & KLMN, memasangkan titik sudut yang
                      bersesuaian, membaca tabel perbandingan; lalu
                      mengukur EFGH (sebangun) dan membaca perbandingan
                      sisinya.
     5. Olah data   — pertanyaan penuntun (sisi & sudut bersesuaian,
                      faktor skala, notasi ≅), lalu memilah 6 pasangan
                      bangun: kongruen / sebangun / tidak keduanya.
     6. Pembuktian  — menguji temuan pada segitiga JKL dengan jiplak
                      + tabel ukur, lalu menanggapi miskonsepsi.
     7. Simpulan    — menyusun kalimat kesimpulan dari bank kalimat.
     8. Uji terap   — 8 soal kontekstual (ubin, origami, bingkai foto,
                      puzzle, kain, kaca jendela, tangram).
     9. Refleksi    — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/ensureSortStates()/shuffleArray()
   dari shared/engine.js, satu kali saat state disiapkan.

   Konvensi bangun: { id, nama, titik: [...], pts: [[x, y], ...] } dalam
   cm, sumbu y ke bawah. Titik didaftar berurutan mengelilingi bangun.
   Semua kunci (jenis, klasifikasi, jawaban isian) diuji terhadap
   engine di tests/mpi-29.1-data.test.js.
   ============================================================ */

/* Ubin trapesium siku-siku ABCD dan empat ubin pengganti. */
var UBIN_ASAL = {
  id: 'abcd',
  nama: 'Ubin ABCD (yang pecah)',
  titik: ['A', 'B', 'C', 'D'],
  pts: [
    [0, 4],
    [6, 4],
    [3, 0],
    [0, 0],
  ],
};

var UBIN_CALON = [
  {
    id: 'klmn',
    nama: 'Ubin KLMN',
    titik: ['K', 'L', 'M', 'N'],
    /* ABCD diputar 90° */
    pts: [
      [4, 0],
      [0, 0],
      [0, 6],
      [4, 3],
    ],
    jenis: 'kongruen',
    temuan:
      'Tepat! Setelah diputar 90°, jiplakan ABCD menutupi KLMN dengan tepat. Bentuk dan ukurannya sama, hanya posisinya yang berbeda.',
  },
  {
    id: 'pqrs',
    nama: 'Ubin PQRS',
    titik: ['P', 'Q', 'R', 'S'],
    /* ABCD dibalik (dicerminkan) */
    pts: [
      [0, 0],
      [6, 0],
      [3, 4],
      [0, 4],
    ],
    jenis: 'kongruen',
    temuan:
      'Tepat! Jiplakan harus DIBALIK (lalu diputar) dulu, tetapi akhirnya berimpit tepat. Membalik tidak mengubah ukuran, jadi PQRS tetap sama persis dengan ABCD.',
  },
  {
    id: 'efgh',
    nama: 'Ubin EFGH',
    titik: ['E', 'F', 'G', 'H'],
    /* ABCD diperbesar 1,5 kali */
    pts: [
      [0, 6],
      [9, 6],
      [4.5, 0],
      [0, 0],
    ],
    jenis: 'sebangun',
    temuan:
      'Tepat! Bentuk EFGH sama seperti ABCD (sudut-sudutnya tampak sama), tetapi lebih besar, sehingga jiplakan tidak pernah bisa menutupinya.',
  },
  {
    id: 'tuvw',
    nama: 'Ubin TUVW',
    titik: ['T', 'U', 'V', 'W'],
    /* trapesium lain dengan luas sama (18 cm²) */
    pts: [
      [0, 4],
      [6, 4],
      [4.5, 0],
      [1.5, 0],
    ],
    jenis: 'tidak',
    temuan:
      'Tepat! Walaupun luasnya sama dengan ABCD, bentuk TUVW berbeda: diputar atau dibalik bagaimana pun, jiplakan tidak pernah berimpit.',
  },
];

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1',
    goal: 'Mengamati beberapa bangun datar dan menduga bangun mana yang dapat menggantikan sebuah bangun dengan tepat.',
    guru: 'Bacakan cerita, lalu tunjukkan ubin atau potongan kertas berbentuk trapesium bila ada. Tanyakan: “Bagaimana kita bisa yakin ubin pengganti pasti pas tanpa memasangnya dulu?” Tampung jawaban murid (ditumpuk, diukur, dilihat saja) tanpa membenarkan atau menyalahkan.',
    judul: 'Ubin Teras yang Pecah',
    cerita:
      'Satu ubin teras kelas IX pecah. Ubin itu berbentuk trapesium siku-siku ABCD. Pak Darto, tukang sekolah, membawa empat ubin sisa dari gudang: KLMN, PQRS, EFGH, dan TUVW. Posisi ubin-ubin itu ada yang terputar dan ada yang terbalik. Pak Darto ingin memilih ubin yang pasti pas menutupi lubang bekas ubin ABCD tanpa celah dan tanpa dipotong.',
    asal: UBIN_ASAL,
    calon: UBIN_CALON,
    pertanyaan:
      'Menurut dugaanmu, ubin mana yang pasti pas menggantikan ubin ABCD? (Belum perlu benar.)',
    opsi: [
      { id: 'klmn', label: 'Hanya ubin KLMN' },
      { id: 'klmn-pqrs', label: 'Ubin KLMN dan ubin PQRS' },
      { id: 'tiga', label: 'Ubin KLMN, PQRS, dan EFGH, karena bentuknya mirip' },
      { id: 'luas', label: 'Ubin yang luasnya sama dengan ABCD, termasuk TUVW' },
    ],
    alasanLabel: 'Mengapa kamu menduga begitu?',
    alasanPlaceholder: 'Tulis alasanmu dengan kalimatmu sendiri…',
    catatan:
      'Tidak ada jawaban benar atau salah di sini. Simpan dugaanmu. Kamu akan mengujinya sendiri dengan menjiplak dan mengukur.',
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
      'Dua bangun yang dapat saling menutupi dengan tepat disebut bangun yang kongruen. Ada ubin yang bentuknya mirip tetapi ukurannya berbeda. Ada juga yang luasnya sama tetapi bentuknya berbeda. Kita perlu cara yang pasti untuk membedakannya.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'm1',
        label:
          'Syarat apa yang harus dipenuhi dua bangun datar agar kongruen (dapat saling menutupi dengan tepat), dan apa bedanya dengan bangun yang hanya sebangun?',
      },
      { id: 'm2', label: 'Berapa harga ubin pengganti yang paling murah?' },
      { id: 'm3', label: 'Ubin mana yang warnanya paling cocok dengan lantai teras?' },
      { id: 'm4', label: 'Berapa luas masing-masing ubin?' },
    ],
    correct: 'm1',
    umpan: {
      m1: 'Tepat! Kita akan menyelidiki <strong>syarat dua bangun kongruen</strong> dan <strong>bedanya dengan bangun sebangun</strong>.',
      m2: 'Harga bukan masalah matematika tentang bentuk. Kita ingin tahu syarat ubin pasti pas. Coba lagi.',
      m3: 'Warna tidak memengaruhi apakah ubin pas atau tidak. Coba lagi.',
      m4: 'Luas memang bisa dihitung, tetapi ubin TUVW luasnya sama dengan ABCD dan belum tentu pas. Masalah kita lebih dari sekadar luas. Coba lagi.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu, apa yang harus sama agar dua bangun dapat saling menutupi dengan tepat?',
    hipotesisPlaceholder: 'Menurutku, dua bangun pasti pas jika …',
    nextLabel: 'Lanjut Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA (A): MENJIPLAK
     ---------------------------------------------------------- */
  jiplak: {
    kicker: 'Tahap 3 · Mengumpulkan Data: Menjiplak',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Menjiplak bangun ABCD lalu menguji apakah jiplakannya dapat berimpit dengan setiap ubin pengganti.',
    guru: 'Bila tersedia, bagikan kertas kalkir/plastik mika dan cetakan keempat ubin agar murid juga menjiplak secara nyata. Dorong murid mencoba semua putaran dan membalik jiplakan sebelum menyimpulkan “tidak berimpit”. Tanyakan: “Apakah memutar atau membalik mengubah ukuran jiplakan?”',
    instruksi:
      'Ketuk “Jiplak bangun ini” pada ubin ABCD. Tempelkan jiplakan pada setiap ubin, lalu putar atau balik sampai kamu yakin apakah jiplakan dapat berimpit (menutupi dengan tepat) atau tidak.',
    asal: UBIN_ASAL,
    calon: UBIN_CALON,
    langkah: 90,
    instruksiCatat:
      'Catat hasil percobaanmu. Pertanyaan untuk sebuah ubin muncul setelah kamu menempelkan jiplakan padanya.',
    opsiHasil: [
      { id: 'kongruen', label: 'Berimpit tepat: jiplakan menutupi seluruh ubin' },
      { id: 'sebangun', label: 'Tidak berimpit: bentuknya sama, tetapi ukurannya berbeda' },
      { id: 'tidak', label: 'Tidak berimpit: bentuknya berbeda' },
    ],
    umpanSalah: {
      kongruen:
        'Belum tepat. Apakah jiplakan benar-benar menutupi ubin ini tanpa sisa? Coba semua putaran dan balik jiplakannya.',
      sebangun:
        'Belum tepat. Perhatikan lagi: apakah bentuknya memang sama, hanya lebih besar/kecil? Atau bisa berimpit setelah diputar/dibalik?',
      tidak:
        'Belum tepat. Coba putar dan balik jiplakan lagi, lalu bandingkan bentuk dan ukurannya dengan saksama.',
    },
    temuan:
      'Hanya KLMN dan PQRS yang dapat berimpit dengan jiplakan ABCD. Keduanya kongruen dengan ABCD. Namun, mengapa EFGH yang bentuknya mirip tidak bisa? Mari kita ukur.',
    nextLabel: 'Lanjut Mengukur →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENGUMPULAN DATA (B): MENGUKUR
     ---------------------------------------------------------- */
  ukur: {
    kicker: 'Tahap 4 · Mengumpulkan Data: Mengukur',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Mengukur sisi dan sudut bangun yang berimpit dan bangun yang sebangun, lalu memasangkan sisi dan sudut yang bersesuaian.',
    guru: 'Tekankan cara membaca penggaris dan busur. Bila memakai cetakan, minta murid mengukur sendiri lalu membandingkan hasilnya dengan media. Perbedaan kecil karena pembulatan boleh didiskusikan.',
    instruksiUkurA:
      'Ukur SEMUA sisi dan sudut ubin ABCD dan ubin KLMN. Ketuk sisi atau sudut pada gambar, atau ketuk tombolnya.',
    instruksiPasang:
      'Saat jiplakan berimpit, setiap titik sudut ABCD jatuh tepat di atas satu titik sudut KLMN. Titik-titik itu disebut titik sudut yang BERSESUAIAN. Pasangkan titik-titiknya.',
    gambarBerimpit: 'Jiplakan ABCD (huruf ungu) yang sudah berimpit dengan KLMN',
    temuanA:
      'Perhatikan tabelmu: setiap sisi ABCD sama panjang dengan sisi KLMN yang bersesuaian, dan setiap sudut ABCD sama besar dengan sudut KLMN yang bersesuaian.',
    instruksiUkurB:
      'Sekarang ukur ubin EFGH yang bentuknya mirip ABCD tetapi lebih besar. Titik E, F, G, H bersesuaian dengan A, B, C, D.',
    temuanB:
      'Pada EFGH, sudut-sudut yang bersesuaian tetap sama besar, tetapi setiap sisinya 1,5 kali sisi ABCD. Sisi-sisinya sebanding, tidak sama panjang.',
    nextLabel: 'Lanjut Mengolah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENGOLAHAN DATA
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 5 · Mengolah Data',
    syntax: 'Discovery Learning · Sintaks 4',
    goal: 'Mengolah hasil jiplak dan ukur untuk menemukan sifat bangun kongruen dan membedakannya dari bangun sebangun.',
    guru: 'Minta murid menjawab dengan menunjuk bukti di tabel ukur, bukan hanya menebak. Saat memilah, tanyakan: “Apa yang kamu periksa lebih dulu, sudut atau sisi?”',
    pengantar:
      'Jawab pertanyaan berikut berdasarkan tabel hasil ukurmu. Kamu boleh mencoba lagi sampai benar.',
    konsep: [
      {
        id: 'k1',
        tanya: 'Pada ABCD dan KLMN yang berimpit, sisi-sisi yang bersesuaian …',
        opsi: [
          { id: 'o1', label: 'sama panjang' },
          { id: 'o2', label: 'sisi KLMN selalu lebih panjang' },
          { id: 'o3', label: 'tidak memiliki hubungan tertentu' },
        ],
        correct: 'o1',
        umpan: {
          o1: 'Tepat! AB = LM = 6 cm, BC = MN = 5 cm, CD = NK = 3 cm, DA = KL = 4 cm.',
          o2: 'Belum tepat. Lihat lagi tabelnya: bandingkan AB dengan LM.',
          o3: 'Belum tepat. Tabelmu menunjukkan pola yang jelas pada setiap pasangan sisi.',
        },
      },
      {
        id: 'k2',
        tanya: 'Pada ABCD dan KLMN, sudut-sudut yang bersesuaian …',
        opsi: [
          { id: 'o1', label: 'sama besar' },
          { id: 'o2', label: 'jumlahnya 180°' },
          { id: 'o3', label: 'berbeda karena KLMN diputar' },
        ],
        correct: 'o1',
        umpan: {
          o1: 'Tepat! ∠A = ∠L = 90°, ∠B = ∠M ≈ 53°, ∠C = ∠N ≈ 127°, ∠D = ∠K = 90°. Memutar tidak mengubah besar sudut.',
          o2: 'Belum tepat. Bandingkan ∠A dan ∠L pada tabel: keduanya 90°.',
          o3: 'Belum tepat. Memutar hanya mengubah posisi, bukan besar sudut.',
        },
      },
      {
        id: 'k3',
        tanya: 'Pada ABCD dan EFGH (bentuk sama, ukuran beda), manakah yang benar?',
        opsi: [
          { id: 'o1', label: 'Sudut bersesuaian sama besar, sisi bersesuaian sebanding (× 1,5)' },
          { id: 'o2', label: 'Sudut dan sisi bersesuaian sama besar' },
          { id: 'o3', label: 'Sudut bersesuaian berbeda, sisi bersesuaian sama panjang' },
        ],
        correct: 'o1',
        umpan: {
          o1: 'Tepat! Karena itulah ABCD dan EFGH hanya <strong>sebangun</strong> (∼), tidak kongruen.',
          o2: 'Belum tepat. Kalau sisinya juga sama panjang, jiplakan pasti berimpit. Lihat kolom keterangan: × 1,5.',
          o3: 'Belum tepat. Sudut-sudutnya justru sama besar; yang berbeda adalah panjang sisinya.',
        },
      },
      {
        id: 'k4',
        tanya:
          'ABCD kongruen dengan KLMN, dengan A↔L, B↔M, C↔N, D↔K. Penulisan yang tepat adalah …',
        opsi: [
          { id: 'o1', label: 'ABCD ≅ LMNK' },
          { id: 'o2', label: 'ABCD ≅ KLMN' },
          { id: 'o3', label: 'ABCD ∼ LMNK' },
          { id: 'o4', label: 'ABCD = KLMN' },
        ],
        correct: 'o1',
        kunciNotasi: 'klmn',
        umpan: {
          o1: 'Tepat! Lambang kongruen adalah ≅, dan urutan huruf menunjukkan titik yang bersesuaian: A↔L, B↔M, C↔N, D↔K.',
          o2: 'Belum tepat. Urutan huruf harus mengikuti pasangan titik bersesuaian. A bersesuaian dengan L, bukan K.',
          o3: 'Belum tepat. Lambang ∼ berarti sebangun. Untuk kongruen dipakai ≅.',
          o4: 'Belum tepat. Lambang = dipakai untuk bilangan. Untuk bangun kongruen dipakai ≅ dengan urutan titik bersesuaian.',
        },
      },
    ],
    instruksiPilah:
      'Pilah setiap pasangan bangun berikut. Periksa sudut-sudut yang bersesuaian lebih dulu, lalu sisi-sisinya.',
    opsiKlas: [
      { id: 'kongruen', label: 'Kongruen (≅)' },
      { id: 'sebangun', label: 'Sebangun (∼), tetapi tidak kongruen' },
      { id: 'tidak', label: 'Tidak sebangun dan tidak kongruen' },
    ],
    pasangan: [
      {
        id: 'p1',
        p: {
          nama: 'Persegi panjang ABCD',
          titik: ['A', 'B', 'C', 'D'],
          pts: [
            [0, 0],
            [4, 0],
            [4, 3],
            [0, 3],
          ],
        },
        q: {
          nama: 'Persegi panjang PQRS',
          titik: ['P', 'Q', 'R', 'S'],
          pts: [
            [0, 0],
            [3, 0],
            [3, 4],
            [0, 4],
          ],
        },
        correct: 'kongruen',
        explanation:
          'PQRS adalah ABCD yang diputar 90°. Sisi bersesuaian sama panjang (4 cm dan 3 cm) dan semua sudut 90°.',
      },
      {
        id: 'p2',
        p: {
          nama: 'Persegi KLMN',
          titik: ['K', 'L', 'M', 'N'],
          pts: [
            [0, 0],
            [3, 0],
            [3, 3],
            [0, 3],
          ],
        },
        q: {
          nama: 'Persegi WXYZ',
          titik: ['W', 'X', 'Y', 'Z'],
          pts: [
            [0, 0],
            [5, 0],
            [5, 5],
            [0, 5],
          ],
        },
        correct: 'sebangun',
        explanation:
          'Semua sudut 90° dan sisi-sisinya sebanding (5 : 3), tetapi tidak sama panjang. Jadi hanya sebangun.',
      },
      {
        id: 'p3',
        p: {
          nama: 'Persegi ABCD',
          titik: ['A', 'B', 'C', 'D'],
          pts: [
            [0, 0],
            [4, 0],
            [4, 4],
            [0, 4],
          ],
        },
        q: {
          nama: 'Belah ketupat EFGH',
          titik: ['E', 'F', 'G', 'H'],
          pts: [
            [0, 0],
            [4, 0],
            [6, 3.4641],
            [2, 3.4641],
          ],
        },
        correct: 'tidak',
        explanation:
          'Semua sisinya sama-sama 4 cm, tetapi sudut belah ketupat 60° dan 120°, bukan 90°. Sisi sama saja belum cukup; sudutnya juga harus sama.',
      },
      {
        id: 'p4',
        p: {
          nama: 'Segitiga ABC',
          titik: ['A', 'B', 'C'],
          pts: [
            [0, 3],
            [4, 3],
            [0, 0],
          ],
        },
        q: {
          nama: 'Segitiga DEF',
          titik: ['D', 'E', 'F'],
          pts: [
            [4, 3],
            [0, 3],
            [4, 0],
          ],
        },
        correct: 'kongruen',
        explanation:
          'DEF adalah bayangan cermin ABC. Sisi 3 cm, 4 cm, 5 cm dan sudut-sudutnya sama besar, sehingga tetap kongruen.',
      },
      {
        id: 'p5',
        p: {
          nama: 'Persegi panjang ABCD',
          titik: ['A', 'B', 'C', 'D'],
          pts: [
            [0, 0],
            [6, 0],
            [6, 2],
            [0, 2],
          ],
        },
        q: {
          nama: 'Persegi panjang PQRS',
          titik: ['P', 'Q', 'R', 'S'],
          pts: [
            [0, 0],
            [4, 0],
            [4, 3],
            [0, 3],
          ],
        },
        correct: 'tidak',
        explanation:
          'Luas keduanya sama (12 cm²) dan sudutnya sama-sama 90°, tetapi sisi-sisinya tidak sebanding (6 : 4 ≠ 2 : 3). Jadi tidak sebangun, apalagi kongruen.',
      },
      {
        id: 'p6',
        p: {
          nama: 'Segitiga KLM',
          titik: ['K', 'L', 'M'],
          pts: [
            [0, 3],
            [4, 3],
            [0, 0],
          ],
        },
        q: {
          nama: 'Segitiga XYZ',
          titik: ['X', 'Y', 'Z'],
          pts: [
            [0, 6],
            [8, 6],
            [0, 0],
          ],
        },
        correct: 'sebangun',
        explanation:
          'Sudut-sudut bersesuaian sama besar, dan setiap sisi XYZ 2 kali sisi KLM (6, 8, 10 cm). Sebangun, tetapi tidak kongruen.',
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
    goal: 'Menguji temuan tentang sifat bangun kongruen pada bangun lain dan menanggapi pendapat yang keliru.',
    guru: 'Minta murid memprediksi dulu sebelum menjiplak. Setelah itu, bandingkan hasil dengan dugaan dan hipotesis awal mereka. Bahas miskonsepsi yang paling banyak dipilih.',
    prediksiLabel: 'Dugaanmu di awal',
    hipotesisLabel: 'Hipotesismu',
    instruksiUji:
      'Uji temuanmu pada segitiga JKL. Tempelkan jiplakan JKL pada ketiga segitiga lain, putar atau balik, lalu tentukan hubungannya.',
    asal: {
      id: 'jkl',
      nama: 'Segitiga JKL',
      titik: ['J', 'K', 'L'],
      pts: [
        [0, 3],
        [4, 3],
        [1, 0],
      ],
    },
    calon: [
      {
        id: 'xyz',
        nama: 'Segitiga XYZ',
        titik: ['X', 'Y', 'Z'],
        pts: [
          [0, 4],
          [0, 0],
          [3, 3],
        ],
        jenis: 'kongruen',
        temuan:
          'Tepat! Setelah dibalik dan diputar, jiplakan JKL berimpit dengan XYZ, dan tabel menunjukkan semua sisi & sudut bersesuaian sama.',
      },
      {
        id: 'mno',
        nama: 'Segitiga MNO',
        titik: ['M', 'N', 'O'],
        pts: [
          [1, 3],
          [5, 3],
          [0, 0],
        ],
        jenis: 'tidak',
        temuan:
          'Tepat! Dua sisinya sama panjang dengan sisi JKL, tetapi sudut-sudutnya berbeda, sehingga sisi ketiganya pun berbeda.',
      },
      {
        id: 'rst',
        nama: 'Segitiga RST',
        titik: ['R', 'S', 'T'],
        pts: [
          [0, 6],
          [8, 6],
          [2, 0],
        ],
        jenis: 'sebangun',
        temuan:
          'Tepat! Sudut-sudutnya sama besar dengan sudut JKL, tetapi setiap sisinya 2 kali lipat. RST sebangun dengan JKL.',
      },
    ],
    umpanSalah: {
      kongruen:
        'Belum tepat. Kongruen berarti jiplakan berimpit tepat. Apakah itu terjadi? Periksa juga tabel ukurannya.',
      sebangun:
        'Belum tepat. Sebangun berarti sudut bersesuaian sama besar dan sisi sebanding. Apakah sudutnya memang sama?',
      tidak: 'Belum tepat. Coba putar dan balik jiplakan lagi, lalu bandingkan sudut-sudutnya.',
    },
    instruksiSoal: 'Tanggapi pendapat teman-teman berikut berdasarkan temuanmu.',
    soal: [
      {
        id: 's1',
        pernyataan:
          '<strong>Rina:</strong> “Dua persegi panjang yang luasnya sama pasti kongruen.”',
        options: [
          { id: 'o1', label: 'Tidak setuju: luas sama belum tentu sisi-sisinya sama panjang' },
          { id: 'o2', label: 'Setuju: luas yang sama berarti bangunnya sama' },
          { id: 'o3', label: 'Setuju, asalkan kedua bangun sama-sama persegi panjang' },
        ],
        correct: 'o1',
        explanation:
          'Persegi panjang 6 cm × 2 cm dan 4 cm × 3 cm sama-sama berluas 12 cm², tetapi sisi bersesuaiannya tidak sama panjang, jadi tidak kongruen.',
      },
      {
        id: 's2',
        pernyataan:
          '<strong>Doni:</strong> “Persegi dan belah ketupat yang sisinya sama-sama 5 cm pasti kongruen.”',
        options: [
          { id: 'o1', label: 'Tidak setuju: sudut-sudut bersesuaiannya belum tentu sama besar' },
          { id: 'o2', label: 'Setuju: semua sisinya sama panjang' },
          { id: 'o3', label: 'Setuju: keduanya sama-sama segi empat' },
        ],
        correct: 'o1',
        explanation:
          'Syarat kongruen ada dua: sisi bersesuaian sama panjang DAN sudut bersesuaian sama besar. Sudut belah ketupat umumnya bukan 90°.',
      },
      {
        id: 's3',
        pernyataan:
          '<strong>Maya:</strong> “Denah kelas yang diperbesar 2 kali kongruen dengan denah aslinya, karena bentuknya sama.”',
        options: [
          { id: 'o1', label: 'Tidak setuju: keduanya hanya sebangun karena ukurannya berbeda' },
          { id: 'o2', label: 'Setuju: bentuk yang sama sudah cukup untuk kongruen' },
          { id: 'o3', label: 'Setuju: sudut-sudutnya sama besar' },
        ],
        correct: 'o1',
        explanation:
          'Sudut sama besar dan sisi sebanding (× 2) berarti sebangun. Kongruen menuntut sisi bersesuaian sama panjang (faktor skala 1).',
      },
      {
        id: 's4',
        pernyataan:
          '<strong>Bima:</strong> “Ubin PQRS tidak kongruen dengan ABCD, karena jiplakannya harus dibalik dulu supaya berimpit.”',
        options: [
          {
            id: 'o1',
            label: 'Tidak setuju: membalik atau memutar tidak mengubah ukuran, jadi tetap kongruen',
          },
          { id: 'o2', label: 'Setuju: bangun kongruen harus langsung berimpit tanpa dibalik' },
          { id: 'o3', label: 'Setuju: posisi kedua ubin berbeda' },
        ],
        correct: 'o1',
        explanation:
          'Dua bangun kongruen boleh berbeda posisi, arah, atau terbalik. Yang penting setelah digeser, diputar, atau dibalik, keduanya berimpit tepat.',
      },
      {
        id: 's5',
        pernyataan: '<strong>Sari:</strong> “Dua bangun yang kongruen pasti juga sebangun.”',
        options: [
          {
            id: 'o1',
            label: 'Setuju: sudutnya sama besar dan sisinya sebanding dengan faktor skala 1',
          },
          { id: 'o2', label: 'Tidak setuju: kongruen dan sebangun tidak pernah terjadi bersamaan' },
          { id: 'o3', label: 'Tidak setuju: bangun sebangun harus berbeda ukuran' },
        ],
        correct: 'o1',
        explanation:
          'Kongruen adalah kasus khusus sebangun, yaitu saat perbandingan sisinya 1 : 1. Sebaliknya, bangun sebangun belum tentu kongruen.',
      },
    ],
    kesimpulanDugaan: {
      klmn: 'Dugaanmu sebagian tepat. KLMN memang pas, tetapi PQRS juga pas setelah jiplakannya dibalik.',
      'klmn-pqrs':
        'Dugaanmu tepat! Hanya KLMN dan PQRS yang kongruen dengan ABCD: sisi dan sudut bersesuaiannya sama.',
      tiga: 'Dugaanmu perlu diperbaiki. EFGH memang sebangun (bentuknya sama), tetapi lebih besar, sehingga tidak pas. Yang pas hanya KLMN dan PQRS.',
      luas: 'Dugaanmu perlu diperbaiki. TUVW luasnya sama, tetapi bentuknya berbeda. Luas sama tidak menjamin kongruen. Yang pas hanya KLMN dan PQRS.',
    },
    nextLabel: 'Lanjut Menarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    syntax: 'Discovery Learning · Sintaks 6',
    goal: 'Merumuskan pengertian bangun kongruen, sifat-sifatnya, dan bedanya dengan bangun sebangun.',
    guru: 'Setelah kesimpulan lengkap, minta murid menuliskannya di buku catatan beserta satu contoh benda kongruen dan satu contoh benda sebangun di sekitar kelas.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari daftar pilihan. Setiap potongan hanya dipakai sekali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'g1', awal: 'Dua bangun datar dikatakan kongruen jika', correct: 'b1' },
      {
        id: 'g2',
        awal: 'Pada dua bangun yang kongruen, sisi-sisi yang bersesuaian',
        correct: 'b2',
      },
      {
        id: 'g3',
        awal: 'Pada dua bangun yang kongruen, sudut-sudut yang bersesuaian',
        correct: 'b3',
      },
      {
        id: 'g4',
        awal: 'Pada dua bangun yang sebangun, sudut bersesuaian sama besar, sedangkan sisi-sisi bersesuaiannya',
        correct: 'b4',
      },
      { id: 'g5', awal: 'Dua bangun yang kongruen pasti sebangun, tetapi', correct: 'b5' },
    ],
    bank: [
      {
        id: 'b1',
        teks: 'bentuk dan ukurannya sama, sehingga dapat berimpit tepat (walau diputar atau dibalik).',
      },
      { id: 'b2', teks: 'sama panjang.' },
      { id: 'b3', teks: 'sama besar.' },
      { id: 'b4', teks: 'sebanding (dikali faktor skala yang sama).' },
      { id: 'b5', teks: 'dua bangun yang sebangun belum tentu kongruen.' },
      { id: 'b6', teks: 'luasnya sama, walaupun bentuknya berbeda.' },
      { id: 'b7', teks: 'hanya jika posisinya tidak diputar dan tidak dibalik.' },
    ],
    rangkuman: [
      'Dua bangun <strong>kongruen (≅)</strong> jika bentuk dan ukurannya sama, sehingga dapat berimpit tepat setelah digeser, diputar, atau dibalik.',
      'Sifat bangun kongruen: <strong>sisi-sisi yang bersesuaian sama panjang</strong> dan <strong>sudut-sudut yang bersesuaian sama besar</strong>.',
      'Dua bangun <strong>sebangun (∼)</strong> jika sudut bersesuaian sama besar dan sisi bersesuaian <strong>sebanding</strong>. Kongruen adalah sebangun dengan faktor skala 1.',
      'Penulisan <strong>ABCD ≅ LMNK</strong> mengikuti urutan titik sudut yang bersesuaian: A↔L, B↔M, C↔N, D↔K.',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Discovery Learning · Penerapan',
    goal: 'Menerapkan sifat bangun kongruen dan perbedaannya dengan bangun sebangun pada situasi sehari-hari.',
    guru: 'Murid mengerjakan mandiri. Amati soal yang banyak salah untuk dibahas bersama. Tanyakan alasan jawaban, bukan hanya hasilnya.',
    instruksi:
      'Kerjakan setiap soal. Bila ragu, buka petunjuk. Setelah menjawab, baca penjelasannya sebelum lanjut.',
    soal: [
      {
        type: 'input',
        konteks: '🧱 Ubin teras',
        cerita:
          'Ubin trapesium ABCD kongruen dengan ubin PQRS, ditulis ABCD ≅ PQRS. Ubin PQRS terpasang dalam posisi terputar.',
        visual: {
          p: {
            nama: 'ABCD',
            titik: ['A', 'B', 'C', 'D'],
            pts: [
              [0, 0],
              [7, 0],
              [4, 4],
              [0, 4],
            ],
          },
          q: {
            nama: 'PQRS',
            titik: ['P', 'Q', 'R', 'S'],
            pts: [
              [7, 4],
              [0, 4],
              [3, 0],
              [7, 0],
            ],
          },
          pOpts: { tampilSisi: 'semua' },
          qOpts: { tanyaSisi: 1 },
        },
        cek: { jenis: 'sisi', idx: 1 },
        pertanyaan: 'Berapa panjang sisi QR (dalam cm)?',
        jawab: 5,
        satuan: 'cm',
        hints: [
          'Urutan huruf pada ABCD ≅ PQRS menunjukkan pasangan titik: A↔P, B↔Q, C↔R, D↔S.',
          'Sisi QR bersesuaian dengan sisi BC.',
        ],
        explanation: 'QR bersesuaian dengan BC, dan sisi bersesuaian sama panjang: QR = BC = 5 cm.',
      },
      {
        type: 'input',
        konteks: '📐 Penggaris segitiga',
        cerita:
          'Dua penggaris segitiga kongruen, ΔABC ≅ ΔDEF. Penggaris DEF terbalik. Diketahui ∠A = 90° dan ∠B = 30°.',
        visual: {
          p: {
            nama: 'ΔABC',
            titik: ['A', 'B', 'C'],
            pts: [
              [0, 0],
              [6, 0],
              [0, 3.4641],
            ],
          },
          q: {
            nama: 'ΔDEF',
            titik: ['D', 'E', 'F'],
            pts: [
              [6, 0],
              [0, 0],
              [6, 3.4641],
            ],
          },
          pOpts: { tampilSudut: [0, 1] },
          qOpts: { tanyaSudut: 2 },
        },
        cek: { jenis: 'sudut', idx: 2 },
        pertanyaan: 'Berapa besar ∠F (dalam derajat)?',
        jawab: 60,
        satuan: '°',
        hints: [
          '∠F bersesuaian dengan ∠C.',
          'Jumlah sudut segitiga 180°, jadi ∠C = 180° − 90° − 30°.',
        ],
        explanation: '∠C = 180° − 90° − 30° = 60°. Karena ∠F bersesuaian dengan ∠C, maka ∠F = 60°.',
      },
      {
        type: 'choice',
        konteks: '🖼️ Bingkai foto',
        cerita:
          'Sebuah foto berukuran 4 cm × 6 cm dicetak ulang menjadi 6 cm × 9 cm. Keduanya berbentuk persegi panjang.',
        visual: {
          p: {
            nama: 'Foto kecil',
            titik: ['A', 'B', 'C', 'D'],
            pts: [
              [0, 0],
              [4, 0],
              [4, 6],
              [0, 6],
            ],
          },
          q: {
            nama: 'Foto besar',
            titik: ['P', 'Q', 'R', 'S'],
            pts: [
              [0, 0],
              [6, 0],
              [6, 9],
              [0, 9],
            ],
          },
          pOpts: { tampilSisi: [0, 1] },
          qOpts: { tampilSisi: [0, 1] },
        },
        klasifikasi: 'sebangun',
        pertanyaan: 'Hubungan kedua foto tersebut adalah …',
        options: [
          { id: 'o1', label: 'Sebangun, tetapi tidak kongruen' },
          { id: 'o2', label: 'Kongruen' },
          { id: 'o3', label: 'Tidak sebangun dan tidak kongruen' },
          { id: 'o4', label: 'Kongruen, karena sudutnya sama-sama 90°' },
        ],
        correct: 'o1',
        hints: ['Bandingkan 6 : 4 dan 9 : 6. Apakah sama?'],
        explanation:
          'Sudutnya sama (90°) dan sisi sebanding (6 : 4 = 9 : 6 = 1,5), tetapi tidak sama panjang. Jadi hanya sebangun.',
      },
      {
        type: 'choice',
        konteks: '🔺 Rangka atap',
        cerita: 'Dua rangka atap berbentuk segitiga dibuat kongruen, ditulis ΔPQR ≅ ΔXYZ.',
        pertanyaan: 'Pasangan yang PASTI sama adalah …',
        options: [
          { id: 'o1', label: 'PQ = XY dan ∠R = ∠Z' },
          { id: 'o2', label: 'PQ = YZ dan ∠R = ∠X' },
          { id: 'o3', label: 'QR = XY dan ∠P = ∠Z' },
          { id: 'o4', label: 'PR = XY dan ∠Q = ∠X' },
        ],
        correct: 'o1',
        hints: ['Pasangkan huruf menurut urutannya: P↔X, Q↔Y, R↔Z.'],
        explanation:
          'Dari urutan ΔPQR ≅ ΔXYZ: P↔X, Q↔Y, R↔Z. Maka sisi PQ bersesuaian dengan XY, dan ∠R bersesuaian dengan ∠Z.',
      },
      {
        type: 'input',
        konteks: '🧩 Keping puzzle',
        cerita:
          'Keping puzzle ABCD dan KLMN kongruen (ABCD ≅ KLMN). Rani ingin menempelkan pita di sekeliling keping KLMN.',
        visual: {
          p: {
            nama: 'ABCD',
            titik: ['A', 'B', 'C', 'D'],
            pts: [
              [0, 0],
              [9, 0],
              [6, 4],
              [0, 4],
            ],
          },
          q: {
            nama: 'KLMN',
            titik: ['K', 'L', 'M', 'N'],
            pts: [
              [4, 0],
              [4, 9],
              [0, 6],
              [0, 0],
            ],
          },
          pOpts: { tampilSisi: 'semua' },
          qOpts: {},
        },
        cek: { jenis: 'keliling' },
        pertanyaan: 'Berapa panjang pita yang diperlukan (keliling KLMN, dalam cm)?',
        jawab: 24,
        satuan: 'cm',
        hints: [
          'Sisi-sisi KLMN sama panjang dengan sisi-sisi ABCD yang bersesuaian.',
          'Keliling KLMN = keliling ABCD = 9 + 5 + 6 + 4.',
        ],
        explanation:
          'Karena kongruen, semua sisi bersesuaian sama panjang, sehingga keliling KLMN = keliling ABCD = 9 + 5 + 6 + 4 = 24 cm.',
      },
      {
        type: 'choice',
        konteks: '🧵 Potongan kain',
        cerita:
          'Ibu memotong dua kain: persegi panjang 8 cm × 2 cm dan persegi 4 cm × 4 cm. Luas keduanya sama, 16 cm².',
        visual: {
          p: {
            nama: 'Kain 1',
            titik: ['A', 'B', 'C', 'D'],
            pts: [
              [0, 0],
              [8, 0],
              [8, 2],
              [0, 2],
            ],
          },
          q: {
            nama: 'Kain 2',
            titik: ['P', 'Q', 'R', 'S'],
            pts: [
              [0, 0],
              [4, 0],
              [4, 4],
              [0, 4],
            ],
          },
          pOpts: { tampilSisi: [0, 1] },
          qOpts: { tampilSisi: [0, 1] },
        },
        klasifikasi: 'tidak',
        pertanyaan: 'Pernyataan yang benar tentang kedua kain adalah …',
        options: [
          { id: 'o1', label: 'Tidak kongruen dan tidak sebangun, walaupun luasnya sama' },
          { id: 'o2', label: 'Kongruen, karena luasnya sama' },
          { id: 'o3', label: 'Sebangun, karena sudutnya sama-sama 90°' },
          { id: 'o4', label: 'Kongruen, karena kelilingnya sama' },
        ],
        correct: 'o1',
        hints: ['Sudutnya memang sama. Bagaimana dengan perbandingan sisinya: 8 : 4 dan 2 : 4?'],
        explanation:
          'Sudutnya sama-sama 90°, tetapi 8 : 4 = 2 sedangkan 2 : 4 = 0,5. Sisi tidak sebanding, jadi tidak sebangun dan pasti tidak kongruen.',
      },
      {
        type: 'choice',
        konteks: '🪟 Kaca jendela',
        cerita:
          'Kaca jendela berukuran 40 cm × 60 cm pecah. Di toko tersedia beberapa lembar kaca persegi panjang.',
        pertanyaan: 'Kaca mana yang pasti pas tanpa dipotong?',
        options: [
          { id: 'o1', label: '60 cm × 40 cm' },
          { id: 'o2', label: '80 cm × 120 cm' },
          { id: 'o3', label: '50 cm × 50 cm' },
          { id: 'o4', label: '40 cm × 50 cm' },
        ],
        correct: 'o1',
        hints: ['Kaca yang pas harus kongruen dengan kaca yang pecah.'],
        explanation:
          '60 cm × 40 cm sama dengan 40 cm × 60 cm yang diputar, jadi kongruen. 80 × 120 hanya sebangun (terlalu besar); dua lainnya tidak sebangun.',
      },
      {
        type: 'choice',
        konteks: '🔷 Tangram',
        cerita: 'Dua keping segitiga tangram dapat berimpit tepat setelah salah satunya dibalik.',
        pertanyaan: 'Pernyataan yang benar adalah …',
        options: [
          { id: 'o1', label: 'Kedua keping kongruen, walaupun perlu dibalik agar berimpit' },
          { id: 'o2', label: 'Kedua keping tidak kongruen karena harus dibalik' },
          { id: 'o3', label: 'Kedua keping hanya sebangun' },
          { id: 'o4', label: 'Kedua keping kongruen hanya jika tidak perlu diputar' },
        ],
        correct: 'o1',
        hints: ['Apakah membalik keping mengubah panjang sisi atau besar sudutnya?'],
        explanation:
          'Membalik (mencerminkan) tidak mengubah panjang sisi maupun besar sudut. Karena dapat berimpit tepat, kedua keping kongruen.',
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
    guru: 'Gunakan jawaban refleksi untuk mengetahui murid yang masih menganggap “luas sama” atau “bentuk sama” sudah cukup untuk kongruen. Jawaban hanya tersimpan di perangkat murid.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Dengan kalimatmu sendiri, apa beda bangun kongruen dan bangun sebangun?',
        placeholder: 'Kongruen berarti … sedangkan sebangun berarti …',
      },
      {
        id: 'r2',
        teks: 'Apakah dugaan dan hipotesismu di awal terbukti? Apa yang berubah dari pemikiranmu?',
        placeholder: 'Awalnya aku mengira … ternyata …',
      },
      {
        id: 'r3',
        teks: 'Sebutkan satu pasang benda kongruen dan satu pasang benda sebangun di sekitarmu.',
        placeholder: 'Kongruen: … Sebangun: …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu membedakan bangun kongruen dan sebangun sekarang?',
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
    teks: 'Kamu telah menemukan sendiri pengertian dan sifat bangun kongruen melalui menjiplak dan mengukur.',
    capaian: [
      'Menjelaskan bahwa dua bangun kongruen dapat berimpit tepat, walau diputar atau dibalik.',
      'Menunjukkan bahwa sisi-sisi yang bersesuaian pada bangun kongruen sama panjang.',
      'Menunjukkan bahwa sudut-sudut yang bersesuaian pada bangun kongruen sama besar.',
      'Membedakan bangun kongruen dari bangun sebangun (sisi sebanding, bukan sama panjang).',
      'Menentukan sisi dan sudut yang bersesuaian untuk menyelesaikan masalah sehari-hari.',
    ],
  },
};
