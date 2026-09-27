'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membandingkan & Mengurutkan Bentuk Akar
   Fase D — SMP Kelas VIII · Topik 12 Bilangan Berpangkat dan Bentuk Akar

   Tujuan Pembelajaran:
   Membandingkan dan mengurutkan bentuk akar.

   Prasyarat: fase-d/mpi-12.4 (membaca & menuliskan bentuk akar,
   ⁿ√(aᵐ) = a^(m/n)) dan fase-d/mpi-12.3 (membandingkan bilangan
   berpangkat bulat).

   Gagasan kunci yang dibangun di seluruh modul:
     • membandingkan bentuk akar = membandingkan NILAINYA, bukan angka
       yang tampak (3√2 > 2√3 walaupun 2 < 3);
     • indeks & koefisien sama → bandingkan radikannya (√7 < √11);
     • koefisien dapat dimasukkan ke dalam akar dengan dipangkatkan
       sesuai indeks: 3√2 = √(3²·2) = √18; bilangan bulat juga:
       7 = √49;
     • indeks berbeda disamakan dengan KPK: √2 = ⁶√8, ∛3 = ⁶√9;
       radikan sama (> 1) → indeks lebih besar justru lebih KECIL;
     • patokan bilangan kuadrat/kubus terdekat: √50 di antara 7 dan 8;
     • miskonsepsi yang dilawan: hanya membandingkan radikan, hanya
       membandingkan koefisien, "indeks lebih besar → lebih besar",
       k√r dianggap √(k·r), dan √a dianggap a/2.

   Model pembelajaran: COOPERATIVE LEARNING tipe JIGSAW dalam sintaks
   Arends, dengan skor tim ala STAD. Pemetaan sintaks ke tahap media:

     Fase 1 — Menyampaikan tujuan & memotivasi ....... 'tujuan'
     Fase 2 — Menyajikan informasi .................... 'informasi'
     Fase 3 — Mengorganisasikan murid ke tim asal
              (kartu ahli dibagikan acak) ............. 'tim'
     Fase 4 — Membimbing kelompok bekerja & belajar
              a. kelompok ahli + mengajar tim asal ..... 'ahli'
              b. misi tim asal ......................... 'misiBanding',
                                                         'misiUrut',
                                                         'misiDiskusi'
     Fase 5 — Evaluasi (individu) ..................... 'kuis'
     Fase 6 — Memberikan penghargaan .................. 'penghargaan'
     Penutup .......................................... 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, tim asal heterogen 3–4 murid,
   satu perangkat per tim; kuis dikerjakan per murid):
     1. Tujuan      (6')  — "Rangka Layang-layang": tiga tim memakai
                            bambu 3√2 m, 2√3 m, dan √17 m; lalu √2 vs
                            ∛3. Murid MENDUGA (tidak dinilai).
     2. Informasi   (12') — Lab Timbangan Akar: ubah koefisien, indeks,
                            dan radikan dua bentuk akar; amati lambang,
                            batang nilai, dan strategi tercepat; temukan
                            minimal 3 strategi; enam pertanyaan penuntun
                            berdiagnosa; aturan umum; cek dugaan.
     3. Tim         (4')  — nama tim asal, anggota, kesepakatan; kartu
                            ahli (4 strategi) dibagikan acak.
     4. Ahli        (17') — Jigsaw: tiap ahli berkumpul dengan ahli
                            sejenis dari tim lain, mempelajari contoh &
                            kalimat kunci strateginya, lalu kembali dan
                            MEMANDU tim asal mengerjakan dua soal
                            stasiunnya (diagnosa miskonsepsi).
     5. Misi 1      (12') — "Bandingkan!": tujuh pasangan kontekstual.
                            Pilih strategi → ahli strategi itu memimpin
                            → pilih lambang <, >, = → pilih makna.
     6. Misi 2      (10') — "Urutkan!": tiga set bentuk akar (sisi ubin,
                            jarak rumah, rusuk kubus) disusun naik/turun
                            dengan kartu ketuk, dicek dengan batang nilai.
     7. Misi 3      (8')  — "Cek Pendapat Teman": delapan pernyataan
                            Benar/Salah berisi miskonsepsi + catatan Juru
                            Bicara.
     8. Kuis        (10') — kuis individu: tujuh soal diambil acak dari
                            bank enam belas soal.
     9. Penghargaan (3')  — poin tim (50% misi + 50% kuis) → predikat.
    10. Refleksi    (4')  — refleksi konsep & kerja sama, penilaian diri.

   Penulisan bentuk akar: nilai ditulis sebagai objek { k, n, r } =
   k · ⁿ√r lewat ak(k, n, r); bilangan bulat lewat bl(k). Di dalam teks
   tampilan, notasi √7, 3√2, ∛5, ⁶√8, √(3²·2) dirender tanda akar
   ber-vinculum oleh tulisAkarHTML(); **teks** ditebalkan. Teks tidak
   memuat HTML sehingga lambang < dan > ditulis apa adanya.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban benar sering di depan). app.js
   mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureTapOrderState / ensureSortStates / assignCoopRoles /
   shuffleArray dari shared/engine.js), sehingga tiap tim dan tiap Reset
   mendapat urutan berbeda — termasuk dugaan, penuntun, lambang <, >, =,
   strategi, makna, kartu yang diurutkan, pernyataan diskusi, soal kuis
   yang terpilih beserta opsinya, kartu ahli, dan penilaian diri.

   Konsistensi kunci jawaban diuji tests/mpi-12.5-data.test.js terhadap
   engine seksi 52 (simbolBandingAkar, urutanIdAkar, ekstremAkar,
   strategiBerlakuAkar, strategiBandingAkar, masukkanKoefisien,
   idMaknaBandingAkar, opsiMaknaBandingAkar).
   ============================================================ */

var CL = 'Cooperative Learning (Jigsaw)';

/* Bentuk akar k · ⁿ√r. */
function ak(k, n, r) {
  return { k: k, n: n, r: r };
}

/* Bilangan bulat k (ditulis { k, n: 1, r: 1 }). */
function bl(k) {
  return { k: k, n: 1, r: 1 };
}

/* Opsi lambang untuk soal kuis jenis lambang. */
var OPSI_LAMBANG = [
  { id: 'lt', label: '< (kurang dari)' },
  { id: 'gt', label: '> (lebih dari)' },
  { id: 'eq', label: '= (sama dengan)' },
];

/* Opsi strategi untuk soal kuis jenis strategi (id = STRATEGI_BANDING_AKAR). */
var OPSI_STRATEGI = [
  { id: 'indeksSama', label: 'Indeks & koefisien sama → bandingkan radikannya' },
  { id: 'masukkanKoefisien', label: 'Masukkan koefisien ke dalam akar' },
  { id: 'samakanIndeks', label: 'Samakan indeks dengan KPK' },
  { id: 'patokan', label: 'Patokan bilangan bulat (kuadrat/kubus terdekat)' },
];

var DATA = {
  meta: {
    title: 'Membandingkan & Mengurutkan Bentuk Akar',
    goal: 'Membandingkan dan mengurutkan bentuk akar.',
  },

  /* Urutan & label tahap (dipakai app.js dan dicek terhadap manifest). */
  tahap: [
    { id: 'tujuan', label: 'Tujuan' },
    { id: 'informasi', label: 'Informasi' },
    { id: 'tim', label: 'Tim Asal' },
    { id: 'ahli', label: 'Ahli' },
    { id: 'misiBanding', label: 'Misi 1' },
    { id: 'misiUrut', label: 'Misi 2' },
    { id: 'misiDiskusi', label: 'Misi 3' },
    { id: 'kuis', label: 'Kuis' },
    { id: 'penghargaan', label: 'Penghargaan' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* ---------- Fase 1: tujuan & motivasi ---------- */
  tujuan: {
    kicker: 'Tahap 1 · Tujuan & Motivasi',
    goal: 'Mengenali tujuan belajar dan menduga cara membandingkan bentuk akar.',
    syntax: CL + ' · Fase 1',
    guru: 'Tayangkan kisah rangka layang-layang. Minta murid menduga sendiri lebih dulu (1 menit), lalu bandingkan dugaan dengan teman sebangku. Banyak murid akan memilih √17 karena "17 paling besar" — jangan dikoreksi dulu; dugaan akan diuji di Lab Timbangan Akar.',
    judul: 'Rangka Layang-layang',
    pengantar:
      'Menjelang festival layang-layang, tiga tim memotong sebatang bambu untuk rangka utama. Panjang bambu mereka ditulis dalam bentuk akar:',
    tokoh: [
      { id: 'elang', nama: 'Tim Elang', ikon: '🦅', p: ak(3, 2, 2) },
      { id: 'rajawali', nama: 'Tim Rajawali', ikon: '🪁', p: ak(2, 2, 3) },
      { id: 'merpati', nama: 'Tim Merpati', ikon: '🕊️', p: ak(1, 2, 17) },
    ],
    satuan: 'meter',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Membandingkan dan mengurutkan bentuk akar.',
    kriteria: [
      'Memakai lambang <, >, = dengan tepat untuk dua bentuk akar, termasuk yang berkoefisien, berindeks berbeda, atau dibandingkan dengan bilangan bulat.',
      'Memilih strategi yang cocok: indeks sama, masukkan koefisien, samakan indeks, atau patokan bilangan bulat.',
      'Menjelaskan arti perbandingan dalam konteks (lebih panjang, lebih jauh, lebih berat, …).',
      'Mengurutkan beberapa bentuk akar dari terkecil ke terbesar dan sebaliknya.',
    ],
    dugaan: [
      {
        id: 'panjang',
        cari: 'terbesar',
        tanya: 'Menurut dugaanmu, bambu tim mana yang **paling panjang**?',
        alasan:
          'Masukkan koefisien ke dalam akar: 3√2 = √18, 2√3 = √12, dan √17. Karena 12 < 17 < 18, maka 2√3 < √17 < 3√2.',
        opsi: [
          { id: 'elang', label: 'Tim Elang (3√2 m)' },
          { id: 'rajawali', label: 'Tim Rajawali (2√3 m)' },
          { id: 'merpati', label: 'Tim Merpati (√17 m)' },
        ],
      },
      {
        id: 'pendek',
        cari: 'terkecil',
        tanya: 'Bambu tim mana yang **paling pendek**?',
        alasan:
          'Masukkan koefisien ke dalam akar: 3√2 = √18, 2√3 = √12, dan √17. Radikan terkecil 12, jadi 2√3 paling pendek.',
        opsi: [
          { id: 'elang', label: 'Tim Elang (3√2 m)' },
          { id: 'rajawali', label: 'Tim Rajawali (2√3 m)' },
          { id: 'merpati', label: 'Tim Merpati (√17 m)' },
        ],
      },
      {
        id: 'indeks',
        p: ak(1, 2, 2),
        q: ak(1, 3, 3),
        tanya: 'Satu lagi: mana yang lebih besar, **√2** atau **∛3**?',
        opsi: [
          { id: 'p', label: '√2 lebih besar' },
          { id: 'q', label: '∛3 lebih besar' },
          { id: 'sama', label: 'Sama besar' },
        ],
      },
    ],
    kunciDugaan: { panjang: 'elang', pendek: 'rajawali', indeks: 'q' },
    alasanLabel: 'Bagaimana caramu menentukan? Tulis dugaanmu dengan singkat.',
    alasanPlaceholder: 'Contoh: Menurutku … karena …',
    catatan:
      'Dugaanmu belum dinilai. Kalian akan mengujinya dengan Lab Timbangan Akar pada tahap berikutnya.',
    nextLabel: 'Uji Dugaan →',
  },

  /* ---------- Fase 2: menyajikan informasi ---------- */
  informasi: {
    kicker: 'Tahap 2 · Menyajikan Informasi',
    goal: 'Menemukan bahwa membandingkan bentuk akar berarti membandingkan nilainya, serta mengenal empat strategi membandingkan.',
    syntax: CL + ' · Fase 2',
    guru: 'Peragakan Lab Timbangan Akar di layar: mulai dari √7 dan √11, lalu ubah koefisien, indeks, dan radikan. Tanyakan: "Mengapa 3√2 bisa lebih besar daripada 2√3?" Setelah murid menemukan minimal tiga strategi dan pertanyaan penuntun terjawab, tulis aturan umum di papan dan umumkan bahwa setiap strategi akan dikuasai oleh seorang ahli di tahap Jigsaw.',
    labJudul: 'Lab Timbangan Akar',
    labPengantar:
      'Atur koefisien, indeks, dan radikan bilangan A dan B. Amati lambang di tengah, panjang batang nilainya, dan strategi tercepat yang muncul. Temukan minimal tiga strategi berbeda!',
    labTarget: 3,
    labSaran: [
      'Biarkan koefisien sama, ubah radikannya saja, misalnya √7 dan √11.',
      'Beri koefisien berbeda, misalnya 3√2 dan 2√3.',
      'Samakan radikan, tetapi bedakan indeksnya, misalnya √2 dan ∛2 — lalu coba √2 dan ∛3.',
      'Coba √10 dan ∛20: adakah bilangan bulat di antara keduanya?',
    ],
    penuntun: [
      {
        id: 'p1',
        cek: { p: ak(1, 2, 7), q: ak(1, 2, 11) },
        tanya: 'Atur lab menjadi √7 dan √11. Lambang yang tepat untuk **√7 ☐ √11** adalah …',
        opsi: [
          { id: 'lt', label: '√7 < √11' },
          { id: 'gt', label: '√7 > √11' },
          { id: 'eq', label: '√7 = √11' },
        ],
        correct: 'lt',
        umpan: {
          lt: 'Benar! Indeksnya sama (akar kuadrat) dan koefisiennya sama, jadi cukup bandingkan radikan: 7 < 11.',
          gt: 'Perhatikan batang nilainya: batang √11 lebih panjang. Radikan lebih besar menghasilkan akar yang lebih besar.',
          eq: 'Radikannya berbeda (7 dan 11), jadi nilainya tidak mungkin sama. Lihat batang nilai di lab.',
        },
      },
      {
        id: 'p2',
        tanya: 'Koefisien bisa dimasukkan ke dalam akar: **3√2 = √(3²·2) = …**',
        opsi: [
          { id: 'a', label: '√18' },
          { id: 'b', label: '√6' },
          { id: 'c', label: '√9' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! 3 = √9, jadi 3√2 = √9 · √2 = √18. Koefisien dikuadratkan dulu sebelum masuk ke akar kuadrat.',
          b: 'Hati-hati: 3√2 bukan √(3 × 2). Koefisien 3 harus dikuadratkan dulu (3² = 9) karena 3 = √9.',
          c: 'Kamu baru memakai 3² = 9, padahal radikan 2 masih harus ikut dikalikan: √(3²·2) = √(9 · 2).',
        },
      },
      {
        id: 'p3',
        cek: { p: ak(3, 2, 2), q: ak(2, 2, 3) },
        tanya: 'Sekarang bandingkan bambu Tim Elang dan Tim Rajawali: **3√2 ☐ 2√3**',
        opsi: [
          { id: 'gt', label: '3√2 > 2√3' },
          { id: 'lt', label: '3√2 < 2√3' },
          { id: 'eq', label: '3√2 = 2√3' },
        ],
        correct: 'gt',
        umpan: {
          gt: 'Benar! 3√2 = √18 dan 2√3 = √(2²·3) = √12. Karena 18 > 12, maka 3√2 > 2√3.',
          lt: 'Kamu mungkin hanya membandingkan radikannya (2 < 3). Koefisiennya juga berbeda! Masukkan koefisien ke dalam akar dulu.',
          eq: 'Kalau dikalikan langsung memang 3 × 2 = 2 × 3 = 6, tetapi itu keliru. Koefisien dikuadratkan dulu: √18 dan √12.',
        },
      },
      {
        id: 'p4',
        cek: { p: ak(1, 3, 5), q: ak(1, 2, 5) },
        tanya: 'Atur lab menjadi ∛5 dan √5 (radikan sama, indeks berbeda). **∛5 ☐ √5**',
        opsi: [
          { id: 'lt', label: '∛5 < √5' },
          { id: 'gt', label: '∛5 > √5' },
          { id: 'eq', label: '∛5 = √5' },
        ],
        correct: 'lt',
        umpan: {
          lt: 'Benar! ∛5 ≈ 1,71 dan √5 ≈ 2,24. Untuk radikan yang sama (lebih dari 1), indeks yang lebih besar justru menghasilkan nilai lebih KECIL.',
          gt: 'Indeks 3 memang lebih besar dari 2, tetapi ∛5 adalah bilangan yang dipangkatkan TIGA kali menjadi 5 — bilangan itu lebih kecil. Lihat batang nilainya.',
          eq: 'Radikannya sama, tetapi indeksnya berbeda sehingga nilainya berbeda. Lihat batang nilai di lab.',
        },
      },
      {
        id: 'p5',
        cek: { p: ak(1, 2, 2), q: ak(1, 3, 3) },
        tanya:
          'Indeks berbeda disamakan dengan KPK 6: √2 = ⁶√(2³) = ⁶√8 dan ∛3 = ⁶√(3²) = ⁶√9. Jadi **√2 ☐ ∛3**',
        opsi: [
          { id: 'lt', label: '√2 < ∛3' },
          { id: 'gt', label: '√2 > ∛3' },
          { id: 'eq', label: '√2 = ∛3' },
        ],
        correct: 'lt',
        umpan: {
          lt: 'Tepat! Setelah indeksnya sama-sama 6, bandingkan radikannya: 8 < 9. Nilainya memang sangat dekat (≈ 1,41 dan ≈ 1,44).',
          gt: 'Setelah disamakan menjadi ⁶√8 dan ⁶√9, radikan mana yang lebih besar? Periksa lagi.',
          eq: 'Keduanya sangat dekat, tetapi ⁶√8 dan ⁶√9 tidak sama karena 8 ≠ 9.',
        },
      },
      {
        id: 'p6',
        tanya: 'Patokan: **√50** terletak di antara dua bilangan bulat berurutan, yaitu …',
        opsi: [
          { id: 'a', label: '7 dan 8, karena 49 < 50 < 64' },
          { id: 'b', label: '25 dan 26, karena setengah dari 50 adalah 25' },
          { id: 'c', label: '5 dan 6, karena 50 diawali angka 5' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! 7² = 49 dan 8² = 64, jadi 7 < √50 < 8. Bilangan kuadrat terdekat menjadi patokan.',
          b: 'Akar kuadrat bukan "dibagi dua". Cari bilangan yang jika dikuadratkan mendekati 50.',
          c: '5² = 25 dan 6² = 36, keduanya masih jauh di bawah 50. Coba bilangan yang kuadratnya dekat 50.',
        },
      },
    ],
    aturanJudul: 'Aturan yang kita temukan',
    aturan: [
      'Bentuk akar adalah **satu bilangan**. Bandingkan **nilainya**, bukan angka yang tampak: 3√2 > 2√3 walaupun 2 < 3.',
      'Indeks dan koefisien sama → bandingkan radikannya: √7 < √11.',
      'Koefisien dimasukkan ke dalam akar dengan dipangkatkan sesuai indeks: 3√2 = √(3²·2) = √18; bilangan bulat juga: 7 = √49.',
      'Indeks berbeda → samakan dengan KPK indeks: √2 = ⁶√8 dan ∛3 = ⁶√9. Radikan sama (> 1) → indeks lebih besar, nilai lebih **kecil**.',
      'Patokan bilangan kuadrat/kubus terdekat mempercepat: √50 di antara 7 dan 8 karena 49 < 50 < 64.',
      'Mengurutkan **naik** = dari terkecil ke terbesar; **turun** = sebaliknya.',
    ],
    dugaanJudul: 'Cek dugaanmu di Tahap 1',
    nextLabel: 'Bentuk Tim Asal →',
  },

  /* ---------- Fase 3: mengorganisasikan kelompok ---------- */
  tim: {
    kicker: 'Tahap 3 · Bentuk Tim Asal',
    goal: 'Membentuk tim asal, menyepakati aturan kerja sama, dan menerima kartu ahli.',
    syntax: CL + ' · Fase 3',
    guru: 'Bentuk tim asal heterogen berisi 4 murid (boleh 3; seorang anggota memegang dua kartu ahli). Tegaskan prinsip Jigsaw: setiap anggota adalah SATU-SATUNYA ahli strateginya di tim, jadi tim bergantung pada penjelasannya. Skor tim juga bergantung pada kuis SETIAP anggota.',
    namaTimLabel: 'Nama tim asal',
    namaTimPlaceholder: 'Contoh: Tim Layang Akar',
    anggotaLabel: 'Nama anggota tim',
    minAnggota: 3,
    maksAnggota: 4,
    kesepakatanJudul: 'Kesepakatan tim (centang semua)',
    kesepakatan: [
      {
        id: 'ahli',
        teks: 'Setiap ahli bertanggung jawab mempelajari strateginya sampai bisa mengajarkannya.',
      },
      {
        id: 'dengar',
        teks: 'Saat seorang ahli mengajar, anggota lain mendengarkan dan boleh bertanya.',
      },
      { id: 'setuju', teks: 'Tombol jawaban baru ditekan setelah semua anggota setuju.' },
      { id: 'bantu', teks: 'Anggota yang sudah paham menjelaskan, bukan menjawabkan.' },
    ],
    acakLabel: '🎲 Bagikan Kartu Ahli',
    acakUlangLabel: '🎲 Bagikan Ulang Kartu Ahli',
    ahliJudul: 'Kartu ahli tim kalian',
    ahliCatatan:
      'Pada tahap berikutnya, setiap ahli berkumpul dengan ahli yang sama dari tim lain, lalu kembali untuk mengajari tim asal.',
    nextLabel: 'Menuju Kelompok Ahli →',
  },

  /* ---------- Fase 4a: kelompok ahli (Jigsaw) ---------- */
  ahli: {
    kicker: 'Tahap 4 · Kelompok Ahli (Jigsaw)',
    goal: 'Menguasai satu strategi membandingkan bentuk akar lalu mengajarkannya kepada tim asal.',
    syntax: CL + ' · Fase 4 (Jigsaw)',
    guru: 'Langkah 1 (8 menit): para ahli sejenis dari semua tim berkumpul di meja ahli, membaca contoh, dan berlatih mengucapkan kalimat kunci. Langkah 2 (9 menit): ahli kembali ke tim asal, membuka stasiunnya di perangkat tim, lalu MEMANDU tim mengerjakan dua soal — ahli bertanya, bukan menjawabkan. Keliling dan dengarkan apakah kalimat kunci diucapkan dengan kata-kata sendiri.',
    pengantar:
      'Langkah 1 — di kelompok ahli: pelajari contoh dan kalimat kunci strategimu. Langkah 2 — di tim asal: buka stasiunmu, ajarkan kalimat kuncinya, lalu pandu tim mengerjakan dua soal.',
    stasiun: [
      {
        id: 'indeksSama',
        contoh: {
          cerita: 'Dua ubin persegi berluas 7 dm² dan 11 dm². Panjang sisinya √7 dm dan √11 dm.',
          a: ak(1, 2, 7),
          b: ak(1, 2, 11),
          nama: ['Ubin A', 'Ubin B'],
        },
        soal: [
          {
            id: 'is1',
            cerita:
              'Dua balok es berbentuk kubus bervolume 20 cm³ dan 9 cm³, jadi rusuknya ∛20 cm dan ∛9 cm.',
            a: ak(1, 3, 20),
            b: ak(1, 3, 9),
          },
          {
            id: 'is2',
            cerita: 'Dua utas tali hias panjangnya 2√10 m dan 2√13 m.',
            a: ak(2, 2, 10),
            b: ak(2, 2, 13),
          },
        ],
      },
      {
        id: 'masukkanKoefisien',
        contoh: {
          cerita: 'Bambu Tim Elang panjangnya 3√2 m, bambu Tim Rajawali 2√3 m.',
          a: ak(3, 2, 2),
          b: ak(2, 2, 3),
          nama: ['Elang', 'Rajawali'],
        },
        soal: [
          {
            id: 'mk1',
            cerita: 'Pipa air A panjangnya 2√7 m, pipa B panjangnya 3√3 m.',
            a: ak(2, 2, 7),
            b: ak(3, 2, 3),
          },
          {
            id: 'mk2',
            cerita: 'Lintasan lari Dina 4√3 km, lintasan lari Eko 5√2 km.',
            a: ak(4, 2, 3),
            b: ak(5, 2, 2),
          },
        ],
      },
      {
        id: 'samakanIndeks',
        contoh: {
          cerita: 'Dua kawat tembaga panjangnya √2 m dan ∛3 m.',
          a: ak(1, 2, 2),
          b: ak(1, 3, 3),
          nama: ['Kawat A', 'Kawat B'],
        },
        soal: [
          {
            id: 'si1',
            cerita: 'Tinggi tanaman cabai ∛4 dm, tinggi tanaman tomat √3 dm.',
            a: ak(1, 3, 4),
            b: ak(1, 2, 3),
          },
          {
            id: 'si2',
            cerita: 'Batang cokelat A panjangnya √3 dm, batang cokelat B ∛5 dm.',
            a: ak(1, 2, 3),
            b: ak(1, 3, 5),
          },
        ],
      },
      {
        id: 'patokan',
        contoh: {
          cerita: 'Tiang bendera tingginya 7 m, sedangkan tali penyangganya √50 m.',
          a: bl(7),
          b: ak(1, 2, 50),
          nama: ['Tiang', 'Tali'],
        },
        soal: [
          {
            id: 'pt1',
            cerita: 'Papan A panjangnya √10 m, papan B ∛20 m.',
            a: ak(1, 2, 10),
            b: ak(1, 3, 20),
          },
          {
            id: 'pt2',
            cerita: 'Jarak rumah Fani ke perpustakaan √15 km, sedangkan ke pasar 4 km.',
            a: ak(1, 2, 15),
            b: bl(4),
          },
        ],
      },
    ],
    ajarLabel:
      'Ahli sudah mengajarkan kalimat kunci ini kepada tim asal dengan kata-katanya sendiri.',
    nextLabel: 'Mulai Misi 1 →',
  },

  /* ---------- Fase 4b: misi tim asal ---------- */
  misiBanding: {
    kicker: 'Tahap 5 · Misi 1: Bandingkan!',
    goal: 'Membandingkan dua bentuk akar dalam konteks dengan strategi yang tepat, lambang <, >, =, dan makna konteksnya.',
    syntax: CL + ' · Fase 4',
    guru: 'Pastikan ahli strategi yang dipilih tim benar-benar memimpin penjelasan. Bila tim salah memilih lambang, tanyakan: "Strategi siapa yang bisa dipakai? Coba minta ahlinya menjelaskan." Setiap strategi yang dapat dipakai diterima; umpan balik menyebutkan cara tercepat.',
    ronde: 0,
    langkah: [
      'Pembaca Soal membacakan situasi.',
      'Tim memilih strategi — ahli strategi itu memimpin perhitungan.',
      'Tim memilih lambang <, >, atau = lalu makna perbandingannya.',
    ],
    soal: [
      {
        id: 'b1',
        tema: 'panjang',
        cerita: 'Tali tambat perahu A panjangnya 2√6 m, tali perahu B 3√3 m.',
        a: { p: ak(2, 2, 6), teks: 'tali perahu A' },
        b: { p: ak(3, 2, 3), teks: 'tali perahu B' },
        tanyaMakna: 'Jadi, dibandingkan tali perahu B, tali perahu A …',
      },
      {
        id: 'b2',
        tema: 'jarak',
        cerita: 'Jarak rumah Ani ke sekolah √10 km, sedangkan rumah Budi 3 km.',
        a: { p: ak(1, 2, 10), teks: 'rumah Ani' },
        b: { p: bl(3), teks: 'rumah Budi' },
        tanyaMakna: 'Jadi, dibandingkan rumah Budi, rumah Ani ke sekolah …',
      },
      {
        id: 'b3',
        tema: 'panjang',
        cerita: 'Rusuk kardus kubus A panjangnya ∛40 dm, sisi alas kotak persegi B √10 dm.',
        a: { p: ak(1, 3, 40), teks: 'rusuk kardus A' },
        b: { p: ak(1, 2, 10), teks: 'sisi kotak B' },
        tanyaMakna: 'Jadi, dibandingkan sisi kotak B, rusuk kardus A …',
      },
      {
        id: 'b4',
        tema: 'panjang',
        cerita: 'Pak Dedi memotong dua pipa: pipa merah 2√5 m dan pipa biru √20 m.',
        a: { p: ak(2, 2, 5), teks: 'pipa merah' },
        b: { p: ak(1, 2, 20), teks: 'pipa biru' },
        tanyaMakna: 'Jadi, dibandingkan pipa biru, pipa merah …',
      },
      {
        id: 'b5',
        tema: 'jarak',
        cerita: 'Dalam lomba lempar bola, lemparan Sinta mencapai 2√11 m dan lemparan Rudi 3√5 m.',
        a: { p: ak(2, 2, 11), teks: 'lemparan Sinta' },
        b: { p: ak(3, 2, 5), teks: 'lemparan Rudi' },
        tanyaMakna: 'Jadi, dibandingkan lemparan Rudi, lemparan Sinta …',
      },
      {
        id: 'b6',
        tema: 'waktu',
        cerita: 'Kereta mainan A melintasi lintasan dalam ∛9 menit, kereta B dalam ∛7 menit.',
        a: { p: ak(1, 3, 9), teks: 'kereta A' },
        b: { p: ak(1, 3, 7), teks: 'kereta B' },
        tanyaMakna: 'Jadi, dibandingkan kereta B, waktu tempuh kereta A …',
      },
      {
        id: 'b7',
        tema: 'berat',
        cerita: 'Dalam percobaan IPA, massa bola logam A adalah ∛3 kg dan bola B ∜5 kg.',
        a: { p: ak(1, 3, 3), teks: 'bola A' },
        b: { p: ak(1, 4, 5), teks: 'bola B' },
        tanyaMakna: 'Jadi, dibandingkan bola B, bola A …',
      },
    ],
    catatanLabel:
      'Catatan tim: strategi mana yang paling sering kalian pakai? Mengapa strategi itu paling mudah bagi tim kalian?',
    catatanPlaceholder: 'Contoh: Kami paling sering memasukkan koefisien ke dalam akar karena …',
    nextLabel: 'Lanjut ke Misi 2 →',
  },

  misiUrut: {
    kicker: 'Tahap 6 · Misi 2: Urutkan!',
    goal: 'Mengurutkan beberapa bentuk akar — berkoefisien, berindeks berbeda, dan bilangan bulat — secara naik atau turun dalam konteks.',
    syntax: CL + ' · Fase 4',
    guru: 'Dorong tim membagi kerja: ahli patokan menaksir setiap kartu dengan bilangan bulat terdekat, ahli masukkan koefisien dan ahli samakan indeks memeriksa pasangan yang nilainya berdekatan. Setelah urutan tepat, minta tim membaca urutan dari batang nilai.',
    ronde: 1,
    langkah: [
      'Pembaca Soal membacakan situasi dan arah urutan (naik/turun).',
      'Tim menaksir setiap kartu dengan patokan bilangan bulat, lalu memeriksa pasangan yang berdekatan dengan strategi ahli.',
      'Ketuk kartu sesuai urutan, lalu periksa dengan batang nilai.',
    ],
    soal: [
      {
        id: 'u1',
        tema: 'panjang',
        arah: 'naik',
        cerita: 'Sisi empat ubin persegi (dm): ubin A √12, ubin B 2√2, ubin C 3, ubin D √10.',
        fromLabel: 'Paling pendek',
        toLabel: 'Paling panjang',
        items: [
          { id: 'ubinA', p: ak(1, 2, 12), teks: 'ubin A' },
          { id: 'ubinB', p: ak(2, 2, 2), teks: 'ubin B' },
          { id: 'ubinC', p: bl(3), teks: 'ubin C' },
          { id: 'ubinD', p: ak(1, 2, 10), teks: 'ubin D' },
        ],
      },
      {
        id: 'u2',
        tema: 'jarak',
        arah: 'turun',
        cerita:
          'Jarak rumah lima teman ke taman kota (km): Gita 2√3, Hadi 3√2, Intan √15, Joko 4, Kiki ∛50.',
        fromLabel: 'Paling jauh',
        toLabel: 'Paling dekat',
        items: [
          { id: 'gita', p: ak(2, 2, 3), teks: 'Gita' },
          { id: 'hadi', p: ak(3, 2, 2), teks: 'Hadi' },
          { id: 'intan', p: ak(1, 2, 15), teks: 'Intan' },
          { id: 'joko', p: bl(4), teks: 'Joko' },
          { id: 'kiki', p: ak(1, 3, 50), teks: 'Kiki' },
        ],
      },
      {
        id: 'u3',
        tema: 'panjang',
        arah: 'naik',
        cerita:
          'Panjang rusuk lima wadah (cm): wadah P ∛20, wadah Q ∛30, wadah R √8, wadah S 3, wadah T ∜80.',
        fromLabel: 'Paling pendek',
        toLabel: 'Paling panjang',
        items: [
          { id: 'wP', p: ak(1, 3, 20), teks: 'wadah P' },
          { id: 'wQ', p: ak(1, 3, 30), teks: 'wadah Q' },
          { id: 'wR', p: ak(1, 2, 8), teks: 'wadah R' },
          { id: 'wS', p: bl(3), teks: 'wadah S' },
          { id: 'wT', p: ak(1, 4, 80), teks: 'wadah T' },
        ],
      },
    ],
    nextLabel: 'Lanjut ke Misi 3 →',
  },

  /* ---------- Fase 4c: diskusi tim ---------- */
  misiDiskusi: {
    kicker: 'Tahap 7 · Misi 3: Cek Pendapat Teman',
    goal: 'Menilai kebenaran pernyataan perbandingan & urutan bentuk akar serta menjelaskan alasannya.',
    syntax: CL + ' · Fase 4',
    guru: 'Pernyataan berasal dari kesalahan yang sering dibuat murid. Minta tim berdiskusi sampai sepakat sebelum memilih (setiap pernyataan hanya bisa dijawab sekali). Minta ahli yang strateginya paling cocok menjelaskan setiap pernyataan. Pilih dua Juru Bicara secara acak untuk membacakan catatan timnya.',
    ronde: 2,
    pengantar:
      'Teman-teman dari kelas lain menuliskan pendapat berikut. Diskusikan dengan strategi para ahli, lalu putuskan: Benar atau Salah?',
    opsi: [
      { id: 'benar', label: '✓ Benar' },
      { id: 'salah', label: '✗ Salah' },
    ],
    pernyataan: [
      {
        id: 'd1',
        teks: '"3√2 = √6, karena 3 × 2 = 6."',
        correct: 'salah',
        cek: { jenis: 'lambang', a: ak(3, 2, 2), b: ak(1, 2, 6), sym: 'eq' },
        explanation: 'Koefisien 3 harus dikuadratkan dulu: 3√2 = √(3²·2) = √18, jadi 3√2 > √6.',
      },
      {
        id: 'd2',
        teks: '"∛7 > √7, karena indeks 3 lebih besar daripada indeks 2."',
        correct: 'salah',
        cek: { jenis: 'lambang', a: ak(1, 3, 7), b: ak(1, 2, 7), sym: 'gt' },
        explanation:
          'Samakan indeks ke 6: ∛7 = ⁶√49 dan √7 = ⁶√343. Karena 49 < 343, ∛7 < √7. Untuk radikan yang sama, indeks lebih besar justru bernilai lebih kecil.',
      },
      {
        id: 'd3',
        teks: '"√20 < 5."',
        correct: 'benar',
        cek: { jenis: 'lambang', a: ak(1, 2, 20), b: bl(5), sym: 'lt' },
        explanation: 'Patokan: 5 = √25 dan 20 < 25, jadi √20 < 5.',
      },
      {
        id: 'd4',
        teks: '"5√2 > 7, karena 5√2 = √50 dan 7 = √49."',
        correct: 'benar',
        cek: { jenis: 'lambang', a: ak(5, 2, 2), b: bl(7), sym: 'gt' },
        explanation: 'Masukkan ke dalam akar: √50 > √49. Tepat!',
      },
      {
        id: 'd5',
        teks: '"√16 = 8, karena setengah dari 16 adalah 8."',
        correct: 'salah',
        cek: { jenis: 'lambang', a: ak(1, 2, 16), b: bl(8), sym: 'eq' },
        explanation: 'Akar kuadrat bukan dibagi dua. √16 = 4 karena 4² = 16, jadi √16 < 8.',
      },
      {
        id: 'd6',
        teks: '"2√3 < √11, karena 3 < 11."',
        correct: 'salah',
        cek: { jenis: 'lambang', a: ak(2, 2, 3), b: ak(1, 2, 11), sym: 'lt' },
        explanation:
          'Radikan hanya boleh dibandingkan langsung bila koefisiennya sama. 2√3 = √12 > √11.',
      },
      {
        id: 'd7',
        teks: '"Urutan naik √3, ∛6, √5, ∛20 sudah benar."',
        correct: 'benar',
        cek: {
          jenis: 'urut',
          nilai: [ak(1, 2, 3), ak(1, 3, 6), ak(1, 2, 5), ak(1, 3, 20)],
          arah: 'naik',
        },
        explanation:
          '√3 ≈ 1,73; ∛6 ≈ 1,82; √5 ≈ 2,24; ∛20 ≈ 2,71. Dengan KPK 6: ⁶√27 < ⁶√36, dan patokan 2 memisahkan ∛6 dan √5.',
      },
      {
        id: 'd8',
        teks: '"Tali 2√7 m lebih pendek daripada tali 3√3 m, karena 2 < 3."',
        correct: 'salah',
        cek: { jenis: 'makna', a: ak(2, 2, 7), b: ak(3, 2, 3), klaim: 'kecil' },
        explanation:
          'Masukkan koefisien: 2√7 = √28 dan 3√3 = √27. Karena 28 > 27, tali 2√7 m justru lebih panjang.',
      },
    ],
    jubirLabel:
      'Catatan Juru Bicara: pernyataan mana yang paling membuat tim kalian berdebat? Strategi ahli mana yang menyelesaikannya?',
    jubirPlaceholder: 'Contoh: Kami sempat mengira ∛7 > √7, tetapi Ahli Samakan Indeks …',
    nextLabel: 'Lanjut ke Kuis Individu →',
  },

  /* ---------- Fase 5: evaluasi (kuis individu) ---------- */
  kuis: {
    kicker: 'Tahap 8 · Kuis Individu',
    goal: 'Menunjukkan kemampuan membandingkan dan mengurutkan bentuk akar secara mandiri.',
    syntax: CL + ' · Fase 5',
    guru: 'Kuis dikerjakan SENDIRI-SENDIRI tanpa bantuan tim (bila memakai satu perangkat, anggota bergiliran). Soal diambil acak dari bank sehingga tiap murid mendapat soal berbeda. Jawaban hanya bisa dipilih sekali.',
    instruksi: 'Kerjakan sendiri. Jawaban pilihan ganda hanya dapat dipilih sekali.',
    banyak: 7,
    komposisi: { lambang: 2, makna: 1, ekstrem: 1, urut: 1, strategi: 1, masukkan: 1 },
    soal: [
      {
        id: 'k1',
        jenis: 'lambang',
        type: 'choice',
        a: ak(4, 2, 3),
        b: ak(3, 2, 5),
        cerita: 'Tinggi pohon mangga 4√3 m, tinggi pohon jambu 3√5 m.',
        pertanyaan: 'Lambang yang tepat untuk **4√3 ☐ 3√5** adalah …',
        options: OPSI_LAMBANG,
        correct: 'gt',
        explanation: '4√3 = √48 dan 3√5 = √45. Karena 48 > 45, maka 4√3 > 3√5.',
      },
      {
        id: 'k2',
        jenis: 'lambang',
        type: 'choice',
        a: ak(1, 3, 2),
        b: ak(1, 4, 3),
        cerita: 'Dua potong kawat panjangnya ∛2 m dan ∜3 m.',
        pertanyaan: 'Lambang yang tepat untuk **∛2 ☐ ∜3** adalah …',
        options: OPSI_LAMBANG,
        correct: 'lt',
        explanation:
          'KPK indeks 3 dan 4 adalah 12: ∛2 = ¹²√(2⁴) = ¹²√16 dan ∜3 = ¹²√(3³) = ¹²√27. Karena 16 < 27, ∛2 < ∜3.',
      },
      {
        id: 'k3',
        jenis: 'lambang',
        type: 'choice',
        a: bl(6),
        b: ak(1, 2, 35),
        cerita: 'Lebar sungai 6 m, sedangkan panjang papan jembatan √35 m.',
        pertanyaan: 'Lambang yang tepat untuk **6 ☐ √35** adalah …',
        options: OPSI_LAMBANG,
        correct: 'gt',
        explanation: '6 = √36 dan 36 > 35, jadi 6 > √35 (papan terlalu pendek!).',
      },
      {
        id: 'k4',
        jenis: 'lambang',
        type: 'choice',
        a: ak(2, 2, 13),
        b: ak(3, 2, 6),
        cerita: 'Panjang dua lintasan sepeda 2√13 km dan 3√6 km.',
        pertanyaan: 'Lambang yang tepat untuk **2√13 ☐ 3√6** adalah …',
        options: OPSI_LAMBANG,
        correct: 'lt',
        explanation: '2√13 = √52 dan 3√6 = √54. Karena 52 < 54, maka 2√13 < 3√6.',
      },
      {
        id: 'k5',
        jenis: 'makna',
        type: 'choice',
        tema: 'panjang',
        a: ak(2, 2, 10),
        b: ak(3, 2, 5),
        cerita: 'Kawat A panjangnya 2√10 m, kawat B 3√5 m.',
        pertanyaan: 'Dibandingkan kawat B, kawat A …',
        options: [
          { id: 'kecil', label: 'lebih pendek' },
          { id: 'besar', label: 'lebih panjang' },
          { id: 'sama', label: 'sama panjangnya' },
        ],
        correct: 'kecil',
        explanation: '2√10 = √40 dan 3√5 = √45. Karena 40 < 45, kawat A lebih pendek.',
      },
      {
        id: 'k6',
        jenis: 'makna',
        type: 'choice',
        tema: 'jarak',
        a: ak(1, 2, 30),
        b: ak(2, 2, 7),
        cerita: 'Jarak rumah Lala ke pasar √30 km, rumah Mira 2√7 km.',
        pertanyaan: 'Dibandingkan rumah Mira, rumah Lala ke pasar …',
        options: [
          { id: 'kecil', label: 'lebih dekat' },
          { id: 'besar', label: 'lebih jauh' },
          { id: 'sama', label: 'sama jauhnya' },
        ],
        correct: 'besar',
        explanation: '2√7 = √28 dan 30 > 28, jadi rumah Lala lebih jauh.',
      },
      {
        id: 'k7',
        jenis: 'ekstrem',
        type: 'choice',
        cari: 'terbesar',
        cerita: 'Empat tiang lampu taman diukur tingginya.',
        pertanyaan: 'Tiang mana yang **paling tinggi**?',
        options: [
          { id: 'a', p: ak(2, 2, 6), label: 'Tiang A — 2√6 m' },
          { id: 'b', p: ak(3, 2, 3), label: 'Tiang B — 3√3 m' },
          { id: 'c', p: bl(5), label: 'Tiang C — 5 m' },
          { id: 'd', p: ak(1, 2, 26), label: 'Tiang D — √26 m' },
        ],
        correct: 'b',
        explanation:
          'Masukkan ke akar kuadrat: √24, √27, √25, √26. Terbesar √27 = 3√3 m (tiang B).',
      },
      {
        id: 'k8',
        jenis: 'ekstrem',
        type: 'choice',
        cari: 'terkecil',
        cerita: 'Empat balok mainan kubus diukur rusuknya.',
        pertanyaan: 'Balok mana yang rusuknya **paling pendek**?',
        options: [
          { id: 'a', p: ak(1, 3, 10), label: 'Balok A — ∛10 cm' },
          { id: 'b', p: ak(1, 2, 5), label: 'Balok B — √5 cm' },
          { id: 'c', p: ak(1, 4, 20), label: 'Balok C — ∜20 cm' },
          { id: 'd', p: ak(2, 2, 2), label: 'Balok D — 2√2 cm' },
        ],
        correct: 'c',
        explanation:
          'KPK indeks 2, 3, dan 4 adalah 12: ∛10 = ¹²√10.000, √5 = ¹²√15.625, ∜20 = ¹²√8.000, dan 2√2 = √8 = ¹²√262.144. Radikan terkecil 8.000, jadi terkecil ∜20 cm.',
      },
      {
        id: 'k9',
        jenis: 'urut',
        type: 'choice',
        arah: 'naik',
        cerita: 'Panjang empat bilah bambu (m): 2√5, 3√2, √19, dan 4.',
        pertanyaan: 'Urutan dari yang **paling pendek** ke **paling panjang** adalah …',
        options: [
          { id: 'o1', nilai: [bl(4), ak(3, 2, 2), ak(1, 2, 19), ak(2, 2, 5)] },
          { id: 'o2', nilai: [ak(3, 2, 2), bl(4), ak(1, 2, 19), ak(2, 2, 5)] },
          { id: 'o3', nilai: [bl(4), ak(1, 2, 19), ak(3, 2, 2), ak(2, 2, 5)] },
          { id: 'o4', nilai: [ak(2, 2, 5), ak(1, 2, 19), ak(3, 2, 2), bl(4)] },
        ],
        correct: 'o1',
        explanation: 'Masukkan ke akar kuadrat: 4 = √16, 3√2 = √18, √19, 2√5 = √20.',
      },
      {
        id: 'k10',
        jenis: 'urut',
        type: 'choice',
        arah: 'turun',
        cerita: 'Tinggi empat bibit tanaman (dm): √7, ∛20, 2√2, dan 3.',
        pertanyaan: 'Urutan dari yang **paling tinggi** ke **paling rendah** adalah …',
        options: [
          { id: 'o1', nilai: [bl(3), ak(2, 2, 2), ak(1, 3, 20), ak(1, 2, 7)] },
          { id: 'o2', nilai: [bl(3), ak(1, 3, 20), ak(2, 2, 2), ak(1, 2, 7)] },
          { id: 'o3', nilai: [ak(1, 2, 7), ak(1, 3, 20), ak(2, 2, 2), bl(3)] },
          { id: 'o4', nilai: [ak(1, 3, 20), ak(1, 2, 7), bl(3), ak(2, 2, 2)] },
        ],
        correct: 'o1',
        explanation:
          '3 = √9 > 2√2 = √8. Lalu 2√2 ≈ 2,83 > ∛20 ≈ 2,71 > √7 ≈ 2,65 (KPK 6: ⁶√400 > ⁶√343).',
      },
      {
        id: 'k11',
        jenis: 'strategi',
        type: 'choice',
        a: ak(1, 2, 13),
        b: ak(1, 2, 15),
        cerita: 'Rani ingin membandingkan √13 dan √15 dengan cepat.',
        pertanyaan: 'Strategi yang **paling cepat** dipakai adalah …',
        options: OPSI_STRATEGI,
        correct: 'indeksSama',
        explanation:
          'Indeks dan koefisiennya sama, jadi bandingkan radikan: 13 < 15, maka √13 < √15.',
      },
      {
        id: 'k12',
        jenis: 'strategi',
        type: 'choice',
        a: ak(5, 2, 3),
        b: ak(4, 2, 5),
        cerita: 'Tomi ingin membandingkan 5√3 dan 4√5 dengan cepat.',
        pertanyaan: 'Strategi yang **paling cepat** dipakai adalah …',
        options: OPSI_STRATEGI,
        correct: 'masukkanKoefisien',
        explanation: '5√3 = √75 dan 4√5 = √80. Karena 75 < 80, maka 5√3 < 4√5.',
      },
      {
        id: 'k13',
        jenis: 'strategi',
        type: 'choice',
        a: ak(1, 3, 4),
        b: ak(1, 2, 2),
        cerita: 'Uli ingin membandingkan ∛4 dan √2 dengan cepat.',
        pertanyaan: 'Strategi yang **paling cepat** dipakai adalah …',
        options: OPSI_STRATEGI,
        correct: 'samakanIndeks',
        explanation:
          'Keduanya di antara 1 dan 2, jadi patokan tidak membantu. KPK 6: ∛4 = ⁶√16 dan √2 = ⁶√8, maka ∛4 > √2.',
      },
      {
        id: 'k14',
        jenis: 'strategi',
        type: 'choice',
        a: ak(1, 2, 26),
        b: ak(1, 3, 100),
        cerita: 'Vino ingin membandingkan √26 dan ∛100 dengan cepat.',
        pertanyaan: 'Strategi yang **paling cepat** dipakai adalah …',
        options: OPSI_STRATEGI,
        correct: 'patokan',
        explanation:
          '√26 lebih dari 5 (karena 25 < 26), sedangkan ∛100 kurang dari 5 (karena 100 < 125). Jadi √26 > ∛100.',
      },
      {
        id: 'k15',
        jenis: 'masukkan',
        type: 'choice',
        p: ak(3, 2, 5),
        cerita: 'Untuk membandingkan, Wati memasukkan koefisien ke dalam akar.',
        pertanyaan: 'Bentuk **3√5** sama dengan …',
        options: [
          { id: 'o1', p: ak(1, 2, 45), label: '√45' },
          { id: 'o2', p: ak(1, 2, 15), label: '√15' },
          { id: 'o3', p: ak(1, 2, 75), label: '√75' },
          { id: 'o4', p: ak(1, 2, 8), label: '√8' },
        ],
        correct: 'o1',
        explanation: '3√5 = √(3²·5) = √(9 · 5) = √45.',
      },
      {
        id: 'k16',
        jenis: 'masukkan',
        type: 'choice',
        p: ak(2, 3, 3),
        cerita: 'Untuk membandingkan, Yoga memasukkan koefisien ke dalam akar pangkat tiga.',
        pertanyaan: 'Bentuk **2∛3** sama dengan …',
        options: [
          { id: 'o1', p: ak(1, 3, 24), label: '∛24' },
          { id: 'o2', p: ak(1, 3, 6), label: '∛6' },
          { id: 'o3', p: ak(1, 3, 12), label: '∛12' },
          { id: 'o4', p: ak(1, 3, 18), label: '∛18' },
        ],
        correct: 'o1',
        explanation:
          'Indeksnya 3, jadi koefisien dipangkatkan tiga: 2∛3 = ∛(2³·3) = ∛(8 · 3) = ∛24.',
      },
    ],
    nextLabel: 'Lihat Penghargaan Tim →',
  },

  /* ---------- Fase 6: penghargaan ---------- */
  penghargaan: {
    kicker: 'Tahap 9 · Penghargaan Tim',
    goal: 'Merayakan hasil kerja sama tim berdasarkan skor misi dan kuis individu.',
    syntax: CL + ' · Fase 6',
    guru: 'Umumkan predikat setiap tim. Beri penghargaan khusus "Ahli Terbaik" kepada ahli yang penjelasannya paling membantu (tanyakan kepada anggota tim). Tekankan bahwa kuis individu ikut menentukan poin tim.',
    bobot:
      'Poin tim = 50% skor misi & stasiun ahli (benar pada percobaan pertama) + 50% skor kuis individu.',
    pujianLabel: 'Tulis satu pujian untuk ahli di tim kalian (siapa dan apa yang ia ajarkan).',
    pujianPlaceholder:
      'Contoh: Terima kasih Sinta, penjelasanmu tentang memasukkan koefisien membuatku cepat membandingkan.',
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ---------- Penutup ---------- */
  refleksi: {
    kicker: 'Tahap 10 · Refleksi',
    goal: 'Merefleksikan pemahaman konsep dan cara bekerja sama dalam tim.',
    syntax: CL + ' · Penutup',
    guru: 'Minta 2–3 murid membacakan jawaban refleksi. Catat murid yang memilih "belum yakin" untuk pendampingan pada pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Mengapa 3√2 lebih besar daripada 2√3 padahal radikan 2 lebih kecil daripada 3? Jelaskan dengan kata-katamu.',
        placeholder: 'Tulis jawabanmu…',
      },
      {
        id: 'r2',
        teks: 'Strategi ahli mana yang paling kamu sukai? Berikan satu contoh pasangan bentuk akar yang cocok dengan strategi itu.',
        placeholder: 'Contoh: Samakan indeks, misalnya √2 dan ∛3, karena …',
      },
      {
        id: 'r3',
        teks: 'Berikan satu contoh dari kehidupanmu yang memerlukan membandingkan atau mengurutkan ukuran berbentuk akar.',
        placeholder: 'Contoh: sisi ubin dari luasnya, rusuk kotak dari volumenya…',
      },
      {
        id: 'r4',
        teks: 'Apa yang kamu pelajari dari teman ahli di timmu? Apa yang kamu sumbangkan sebagai ahli?',
        placeholder: 'Tulis jawabanmu…',
      },
    ],
    diriLabel: 'Seberapa yakin kamu membandingkan dan mengurutkan bentuk akar sekarang?',
    diriOpsi: [
      { id: 'yakin', label: '😄 Yakin — aku bisa menjelaskannya ke teman' },
      { id: 'cukup', label: '🙂 Cukup yakin — kadang masih perlu memasukkan koefisien dulu' },
      { id: 'belum', label: '🤔 Belum yakin — aku masih bingung jika indeksnya berbeda' },
    ],
    nextLabel: 'Simpan & Selesai',
  },

  selesai: {
    judul: 'Misi Jigsaw Tuntas!',
    teks: 'Kalian sudah membandingkan dan mengurutkan bentuk akar dalam berbagai konteks dengan empat strategi para ahli.',
    capaian: [
      'Membandingkan dua bentuk akar dengan lambang <, >, =, termasuk yang berkoefisien dan berindeks berbeda.',
      'Memilih strategi yang cocok: indeks sama, masukkan koefisien, samakan indeks, atau patokan bilangan bulat.',
      'Menjelaskan arti perbandingan dalam konteks: lebih panjang, lebih jauh, lebih berat, lebih lama.',
      'Mengurutkan beberapa bentuk akar secara naik dan turun.',
      'Menjadi ahli yang mengajarkan satu strategi kepada tim.',
    ],
  },
};
