'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Bilangan Bulat & Pecahan dalam Kehidupan Sehari-hari
   Fase D — SMP Kelas 7

   Tujuan Pembelajaran:
   Menerapkan pembacaan, penulisan, dan perbandingan bilangan bulat
   serta pecahan dalam menyelesaikan masalah kontekstual sehari-hari.

   Model pembelajaran: PROBLEM-BASED LEARNING (PBL).
   Masalah pemantik: "Persami di Dieng — Papan Info Kemah".
   Kak Dimas, pembina pramuka, menitipkan catatan tulisan tangan
   (berupa KATA-KATA) tentang suhu malam dan sisa bekal tiga regu:
     • Suhu  : 19.00 → 6 °C, 22.00 → 1 °C, 01.00 → −2 °C,
               04.00 → −4 °C, 06.00 → −1 °C
     • Air   : Elang 3/4, Rajawali 5/8, Merpati 2/3 jeriken
               (KPK 24 → 18/24, 15/24, 16/24)
     • Beras : Elang 1 1/2 kg, Rajawali 7/4 kg, Merpati 5/4 kg
               (= 6/4, 7/4, 5/4)
   Konflik kognitif: "−4 lebih besar dari −2 karena 4 > 2" dan
   "5/8 paling banyak karena angkanya paling besar". Murid harus
   menulis data dengan notasi baku, membaca dengan cara baku, lalu
   membandingkan NILAINYA untuk menyusun Papan Info Kemah.

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ...... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar  'organisasi'
     Sintaks 3 — Membimbing penyelidikan ........... 'selidikBulat', 'latihBulat',
                                                     'selidikPecahan', 'latihPecahan'
     Sintaks 4 — Mengembangkan & menyajikan hasil .. 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi proses  'evaluasi'
     Penutup ....................................... 'refleksi', 'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — murid menuliskan dugaan awal, memilah
       informasi, menyusun rencana sendiri, lalu membandingkan dugaan
       dengan hasil penyelidikan dan merefleksikan strateginya.
     • Bermakna (meaningful) — seluruh bilangan lahir dari satu situasi
       nyata (perkemahan): suhu di bawah nol menentukan perlu tidaknya
       jaket tebal, pecahan sisa bekal menentukan regu yang dibantu.
     • Menggembirakan (joyful) — termometer & pita jeriken yang hidup,
       umpan balik yang menunjuk letak kesalahan, Papan Info Kemah
       sebagai karya yang dipresentasikan, dan bintang capaian.

   Rangkaian aktivitas (± 2 × 40 menit; kelompok 3–4 murid, satu
   perangkat per kelompok atau per murid):
     1. Orientasi        (8')  — cerita persami, catatan pembina,
                                 termometer & pita jeriken, dugaan awal,
                                 pertanyaan pemantik.
     2. Organisasi       (7')  — membagi peran, memilah informasi
                                 (diketahui/ditanya/tidak diperlukan),
                                 menyusun urutan rencana penyelidikan.
     3. Selidik bulat    (12') — kata → notasi, cara baca baku, garis
                                 bilangan, lambang <, >, dan simpulan.
     4. Latih bulat      (7')  — 6 soal kontekstual (lift, penyelam,
                                 freezer, koperasi, kota, skor kuis).
     5. Selidik pecahan  (12') — kata → notasi pecahan, cara baca,
                                 biasa ↔ campuran, pita jeriken & KPK.
     6. Latih pecahan    (7')  — 6 soal kontekstual (resep, pita,
                                 tepung, lari, pizza, pupuk).
     7. Karya            (12') — menyusun Papan Info Kemah & keputusan
                                 bantuan bekal; presentasi kelompok.
     8. Evaluasi         (8')  — menilai pendapat teman (tepat/keliru),
                                 dua masalah baru, dugaan vs hasil.
     9. Refleksi         (7')  — rekap capaian, refleksi tertulis,
                                 keyakinan diri.

   Ketentuan: SEMUA pilihan jawaban (pilihan ganda, kategori pemilahan,
   lambang perbandingan, kartu urutan, urutan penempatan di garis
   bilangan) diacak di app-core.js > initExerciseArrays().
   ============================================================ */

/* Teks DATA → HTML aman; token "{3/4}" / "{1 1/2}" menjadi pecahan bersusun
   (engine.js dimuat lebih dulu). */
function T(str) {
  return renderFracText(esc(str));
}

var DATA = {
  meta: {
    title: 'Bilangan Bulat & Pecahan dalam Kehidupan Sehari-hari',
    subject: 'Matematika — Fase D (SMP)',
  },

  /* Data masalah persami — dipakai di beberapa tahap. */
  suhu: [
    { id: 't19', jam: '19.00', value: 6, kata: 'enam derajat Celsius' },
    { id: 't22', jam: '22.00', value: 1, kata: 'satu derajat Celsius' },
    { id: 't01', jam: '01.00', value: -2, kata: 'negatif dua derajat Celsius' },
    { id: 't04', jam: '04.00', value: -4, kata: 'negatif empat derajat Celsius' },
    { id: 't06', jam: '06.00', value: -1, kata: 'negatif satu derajat Celsius' },
  ],
  regu: [
    {
      id: 'elang',
      nama: 'Elang',
      ikon: '🦅',
      air: { num: 3, den: 4 },
      airKata: 'tiga per empat',
      beras: { whole: 1, num: 1, den: 2 },
      berasKata: 'satu satu per dua',
    },
    {
      id: 'rajawali',
      nama: 'Rajawali',
      ikon: '🪶',
      air: { num: 5, den: 8 },
      airKata: 'lima per delapan',
      beras: { whole: null, num: 7, den: 4 },
      berasKata: 'tujuh per empat',
    },
    {
      id: 'merpati',
      nama: 'Merpati',
      ikon: '🕊️',
      air: { num: 2, den: 3 },
      airKata: 'dua per tiga',
      beras: { whole: null, num: 5, den: 4 },
      berasKata: 'lima per empat',
    },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — Orientasi masalah (PBL Sintaks 1)
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi Masalah',
    syntax: 'PBL · Sintaks 1',
    goal: 'Memahami masalah perkemahan dan menyadari bahwa angka yang besar belum tentu bernilai besar.',
    guru: 'Bacakan cerita dan catatan Kak Dimas dengan suara lantang, persis seperti tertulis (dalam kata-kata). Minta murid menuliskan dugaan tanpa menghitung. Jangan membenarkan atau menyalahkan dugaan — catat dugaan terbanyak di papan tulis untuk diuji pada tahap Evaluasi.',
    ikon: '⛺',
    judul: 'Persami di Dieng: Papan Info Kemah',
    cerita:
      'Kelas 7 mengikuti Perkemahan Sabtu–Minggu (Persami) di Dataran Tinggi Dieng. Malam di sana sangat dingin, bahkan bisa muncul embun beku. Kak Dimas, pembina pramuka, mencatat suhu setiap beberapa jam dan memeriksa sisa bekal tiga regu. Sayangnya, catatannya ditulis dengan kata-kata dan tercampur. Kak Dimas meminta tim kalian menyusun Papan Info Kemah yang benar dan mudah dibaca.',
    catatanJudul: '📝 Catatan Kak Dimas',
    tugas: [
      'Menuliskan setiap suhu dan sisa bekal dengan notasi baku.',
      'Menentukan kapan suhu paling dingin dan kapan suhu di bawah 0 °C (wajib jaket tebal).',
      'Menentukan regu yang air dan berasnya paling sedikit sehingga dibantu lebih dulu.',
    ],
    tujuan: [
      'Membaca dan menuliskan bilangan bulat (positif, nol, negatif) dari situasi sehari-hari.',
      'Membaca dan menuliskan pecahan biasa dan pecahan campuran serta mengubah bentuknya.',
      'Membandingkan dan mengurutkan bilangan bulat serta pecahan untuk mengambil keputusan.',
    ],
    dugaan: [
      {
        id: 'dSuhu',
        tanya: 'Dugaan 1: pukul berapa suhu PALING DINGIN?',
        opsi: [
          { id: 't19', label: 'Pukul 19.00' },
          { id: 't01', label: 'Pukul 01.00' },
          { id: 't04', label: 'Pukul 04.00' },
          { id: 't06', label: 'Pukul 06.00' },
        ],
      },
      {
        id: 'dAir',
        tanya: 'Dugaan 2: regu mana yang sisa airnya PALING SEDIKIT?',
        opsi: [
          { id: 'elang', label: '🦅 Regu Elang' },
          { id: 'rajawali', label: '🪶 Regu Rajawali' },
          { id: 'merpati', label: '🕊️ Regu Merpati' },
        ],
      },
    ],
    dugaanUmpan:
      'Dugaanmu sudah dicatat. Dugaan belum tentu benar atau salah — kita akan mengujinya lewat penyelidikan!',
    pemantik: {
      tanya:
        'Rudi berkata, "Pukul 04.00 itu tidak paling dingin, karena 4 lebih kecil dari 6 tapi lebih besar dari 2. Lalu Rajawali pasti airnya paling banyak, karena angka 5 dan 8 paling besar." Apa yang keliru dari cara berpikir Rudi?',
      opsi: [
        {
          id: 'nilai',
          label:
            'Rudi hanya melihat angkanya. Tanda negatif dan hubungan pembilang–penyebut juga menentukan nilai bilangan.',
        },
        {
          id: 'benar',
          label:
            'Tidak ada yang keliru. Bilangan dengan angka lebih besar selalu bernilai lebih besar.',
        },
        {
          id: 'akhir',
          label: 'Rudi seharusnya hanya melihat suhu yang dicatat paling akhir.',
        },
        {
          id: 'tidakbisa',
          label: 'Rudi keliru karena pecahan dan suhu negatif tidak bisa dibandingkan.',
        },
      ],
      correct: 'nilai',
      umpan: {
        nilai: T(
          'Tepat! −4 °C berarti 4 derajat DI BAWAH nol — lebih dingin daripada −2 °C. Pecahan {5/8} juga tidak otomatis besar hanya karena angkanya besar. Mari kita selidiki!'
        ),
        benar:
          'Coba bayangkan termometer: −4 berada lebih rendah daripada −2. Apakah angka yang besar selalu berarti nilai yang besar?',
        akhir:
          'Waktu pencatatan tidak menentukan suhu mana yang paling dingin. Yang menentukan adalah nilai suhunya.',
        tidakbisa:
          'Bilangan negatif bisa dibandingkan (dengan garis bilangan), begitu pula pecahan (dengan menyamakan penyebut). Coba pilih lagi.',
      },
    },
    nextLabel: 'Ayo Rencanakan Penyelidikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — Mengorganisasi belajar (PBL Sintaks 2)
     ---------------------------------------------------------- */
  organisasi: {
    kicker: 'Tahap 2 · Mengorganisasi Belajar',
    syntax: 'PBL · Sintaks 2',
    goal: 'Membagi peran, memilah informasi yang diperlukan, dan menyusun rencana penyelidikan.',
    guru: 'Pastikan setiap kelompok membagi peran sebelum memilah informasi. Saat murid keliru memilah, tanyakan: "Apakah informasi ini membantu menjawab pertanyaan Kak Dimas?" Rencana yang disusun akan menjadi urutan kerja pada tahap-tahap berikutnya.',
    peran: [
      {
        ikon: '📢',
        nama: 'Pembaca Data',
        tugas: 'Membacakan setiap bilangan dengan cara baca baku.',
      },
      {
        ikon: '✍️',
        nama: 'Penulis Notasi',
        tugas: 'Menuliskan bilangan dengan notasi yang benar.',
      },
      {
        ikon: '🔍',
        nama: 'Pemeriksa',
        tugas: 'Memeriksa perbandingan dengan garis bilangan atau pita.',
      },
      { ikon: '🎤', nama: 'Juru Bicara', tugas: 'Mempresentasikan Papan Info Kemah.' },
    ],
    pilahInstruksi:
      'Pilah setiap informasi: apakah termasuk yang DIKETAHUI, yang DITANYA, atau TIDAK DIPERLUKAN untuk menyusun Papan Info Kemah?',
    pilahOpsi: [
      { id: 'diketahui', label: 'Diketahui' },
      { id: 'ditanya', label: 'Ditanya' },
      { id: 'tidak', label: 'Tidak diperlukan' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: 'Suhu pukul 04.00 adalah negatif empat derajat Celsius.',
        correct: 'diketahui',
        explanation: 'Ini data suhu dari catatan Kak Dimas — bahan untuk dibandingkan.',
      },
      {
        id: 'p2',
        teks: 'Pukul berapa suhu paling dingin?',
        correct: 'ditanya',
        explanation: 'Inilah salah satu hal yang harus dijawab di Papan Info Kemah.',
      },
      {
        id: 'p3',
        teks: 'Bus berangkat dari sekolah pukul 13.00.',
        correct: 'tidak',
        explanation: 'Jam keberangkatan bus tidak dipakai untuk membandingkan suhu atau bekal.',
      },
      {
        id: 'p4',
        teks: 'Sisa air Regu Rajawali lima per delapan jeriken.',
        correct: 'diketahui',
        explanation: 'Ini data bekal yang akan ditulis sebagai pecahan lalu dibandingkan.',
      },
      {
        id: 'p5',
        teks: 'Regu mana yang berasnya harus ditambah lebih dulu?',
        correct: 'ditanya',
        explanation: 'Keputusan ini harus diambil setelah membandingkan sisa beras ketiga regu.',
      },
      {
        id: 'p6',
        teks: 'Setiap regu beranggotakan 8 murid.',
        correct: 'tidak',
        explanation:
          'Banyak anggota tiap regu sama, sehingga tidak mengubah perbandingan sisa bekal.',
      },
    ],
    rencanaInstruksi:
      'Susun rencana penyelidikan kelompokmu. Ketuk langkah-langkah di bawah sesuai urutan kerja yang paling masuk akal.',
    rencana: [
      { id: 'r1', label: 'Menulis setiap data dari catatan dengan notasi baku' },
      { id: 'r2', label: 'Menempatkan bilangan pada garis bilangan atau menyamakan penyebut' },
      { id: 'r3', label: 'Membandingkan dan mengurutkan nilai-nilainya' },
      { id: 'r4', label: 'Menyusun Papan Info Kemah beserta alasannya' },
    ],
    rencanaBenar: ['r1', 'r2', 'r3', 'r4'],
    rencanaSalah:
      'Urutannya belum tepat. Pikirkan: bisakah kita membandingkan bilangan sebelum bilangan itu ditulis dengan benar? Bisakah kita membuat papan info sebelum tahu urutannya?',
    rencanaBenarTeks:
      'Rencana yang bagus! Tulis dulu dengan benar → siapkan agar mudah dibandingkan → bandingkan → sajikan. Kita mulai dari data suhu (bilangan bulat).',
    nextLabel: 'Mulai Penyelidikan Suhu →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — Penyelidikan bilangan bulat (PBL Sintaks 3)
     ---------------------------------------------------------- */
  selidikBulat: {
    kicker: 'Tahap 3 · Penyelidikan 1: Suhu Malam',
    syntax: 'PBL · Sintaks 3',
    goal: 'Menulis, membaca, menempatkan, dan membandingkan bilangan bulat dari data suhu.',
    guru: 'Berkelilinglah dan minta Pembaca Data membacakan bilangan negatif dengan kata "negatif", bukan "minus" atau "min". Saat membandingkan, arahkan murid untuk menunjuk letak kedua bilangan pada garis bilangan sebelum memilih lambang.',
    tulisJudul: 'A. Dari kata-kata ke notasi',
    tulisInstruksi:
      'Tuliskan suhu dari catatan Kak Dimas dengan notasi baku. Gunakan tanda "-" di depan angka untuk suhu di bawah nol.',
    tulis: [
      {
        label: 'Pukul 01.00: "negatif dua derajat Celsius" ditulis … °C',
        jawab: -2,
        allowNegative: true,
        hints: ['"Negatif" berarti di bawah nol, ditulis dengan tanda − di depan angka.'],
        temuan: 'Negatif dua derajat Celsius ditulis <strong>−2 °C</strong>.',
      },
      {
        label: 'Pukul 04.00: "negatif empat derajat Celsius" ditulis … °C',
        jawab: -4,
        allowNegative: true,
        hints: ['Sama seperti sebelumnya: tanda − lalu angkanya.'],
        temuan: 'Negatif empat derajat Celsius ditulis <strong>−4 °C</strong>.',
      },
      {
        label: 'Pukul 22.00: "satu derajat Celsius" ditulis … °C',
        jawab: 1,
        allowNegative: true,
        hints: ['Suhu ini di atas nol, jadi tidak perlu tanda −.'],
        temuan:
          'Satu derajat Celsius ditulis <strong>1 °C</strong> (boleh juga +1, tetapi tanda + biasanya tidak ditulis).',
      },
    ],
    bacaJudul: 'B. Cara membaca yang baku',
    baca: [
      {
        id: 'b1',
        tanya: 'Papan termometer menunjukkan −4 °C. Cara membacanya yang baku adalah …',
        opsi: [
          { id: 'neg', label: 'negatif empat derajat Celsius' },
          { id: 'min', label: 'minus empat derajat Celsius' },
          { id: 'pos', label: 'empat derajat Celsius' },
          { id: 'kurang', label: 'kurang dari empat derajat Celsius' },
        ],
        correct: 'neg',
        umpan: {
          neg: 'Benar! Tanda di depan bilangan dibaca <strong>negatif</strong>.',
          min: 'Dalam matematika, "minus" adalah nama operasi pengurangan. Tanda di depan bilangan dibaca "negatif".',
          pos: 'Tanpa kata "negatif", pendengar mengira suhunya 4 °C di atas nol — padahal jauh berbeda!',
          kurang:
            '"Kurang dari empat" berarti bilangan apa saja yang lebih kecil dari 4, bukan tepat −4.',
        },
      },
      {
        id: 'b2',
        tanya: 'Suhu 0 °C berarti …',
        opsi: [
          { id: 'batas', label: 'titik batas: tidak positif dan tidak negatif' },
          { id: 'tidakada', label: 'tidak ada suhu sama sekali' },
          { id: 'neg', label: 'suhu negatif yang paling kecil' },
          { id: 'pos', label: 'suhu positif yang paling kecil' },
        ],
        correct: 'batas',
        umpan: {
          batas:
            'Tepat! 0 adalah titik acuan: di atasnya positif, di bawahnya negatif. Nol sendiri bukan positif dan bukan negatif.',
          tidakada:
            'Suhu 0 °C tetap suhu (air mulai membeku). Nol adalah titik acuan pada termometer.',
          neg: 'Masih ada −1, −2, −3, … yang lebih kecil dari 0. Nol juga bukan bilangan negatif.',
          pos: 'Nol bukan bilangan positif. Bilangan positif terkecil adalah 1.',
        },
      },
    ],
    garisJudul: 'C. Tempatkan suhu pada garis bilangan',
    garisInstruksi:
      'Garis bilangan seperti termometer yang direbahkan: makin ke kanan makin hangat, makin ke kiri makin dingin. Ketuk letak setiap suhu.',
    garis: { min: -6, max: 8, labelEvery: 1 },
    bandingJudul: 'D. Bandingkan dua suhu',
    bandingInstruksi: 'Pilih lambang yang tepat untuk mengisi kotak.',
    banding: [
      { id: 'c1', a: -4, b: -2, konteks: 'Suhu pukul 04.00 dan pukul 01.00' },
      { id: 'c2', a: -1, b: 1, konteks: 'Suhu pukul 06.00 dan pukul 22.00' },
      { id: 'c3', a: 6, b: -4, konteks: 'Suhu pukul 19.00 dan pukul 04.00' },
    ],
    simpulan: {
      tanya:
        'Kesimpulan kelompokmu: pada garis bilangan, bilangan yang letaknya lebih ke KIRI nilainya …',
      opsi: [
        { id: 'kecil', label: T('lebih kecil (misalnya −4 < −2)') },
        { id: 'besar', label: T('lebih besar (misalnya −4 > −2)') },
        { id: 'sama', label: 'sama saja, yang penting angkanya' },
        { id: 'angka', label: 'tergantung angka tanpa tandanya' },
      ],
      correct: 'kecil',
      umpan: {
        kecil: T(
          'Tepat! Makin ke kiri makin kecil. Jadi −4 < −2 < −1 < 0 < 1 < 6. Suhu −4 °C adalah yang paling dingin.'
        ),
        besar:
          'Lihat lagi garis bilanganmu: −4 berada di kiri −2. Suhu −4 °C lebih hangat atau lebih dingin?',
        sama: 'Letak pada garis bilangan justru menunjukkan nilainya. Angka tanpa tanda bisa menipu!',
        angka:
          'Jika hanya melihat angka tanpa tanda, kita akan salah mengira −4 lebih besar dari −2. Tanda negatif penting!',
      },
    },
    nextLabel: 'Lanjut Berlatih →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — Latihan bilangan bulat (PBL Sintaks 3)
     ---------------------------------------------------------- */
  latihBulat: {
    kicker: 'Tahap 4 · Latihan: Bilangan Bulat di Sekitar Kita',
    syntax: 'PBL · Sintaks 3',
    goal: 'Menerapkan penulisan, pembacaan, dan perbandingan bilangan bulat pada situasi baru.',
    guru: 'Biarkan murid mengerjakan secara mandiri, lalu bandingkan jawaban dalam kelompok. Untuk murid yang masih keliru, minta mereka menggambar garis bilangan kecil di buku.',
    maksCoba: 2,
    soal: [
      {
        type: 'int',
        ikon: '🛗',
        teks: 'Lift di pusat perbelanjaan berhenti di lantai "basement 2", yaitu 2 lantai di bawah lantai dasar. Jika lantai dasar ditulis 0, tuliskan lantai itu sebagai bilangan bulat.',
        jawab: -2,
        hints: ['Di bawah lantai dasar (0) berarti negatif.'],
        penjelasan: 'Dua lantai di bawah 0 ditulis <strong>−2</strong>.',
      },
      {
        type: 'choice',
        ikon: '🤿',
        teks: 'Seorang penyelam berada pada kedalaman 15 meter di bawah permukaan laut, ditulis −15 m. Cara membacanya yang baku adalah …',
        opsi: [
          { id: 'a', label: 'negatif lima belas meter' },
          { id: 'b', label: 'minus lima belas meter' },
          { id: 'c', label: 'lima belas meter' },
          { id: 'd', label: 'negatif lima puluh meter' },
        ],
        correct: 'a',
        penjelasan:
          '−15 dibaca "negatif lima belas". Kata "minus" dipakai untuk operasi pengurangan.',
      },
      {
        type: 'choice',
        ikon: '🧊',
        teks: 'Suhu freezer A adalah −18 °C dan suhu freezer B adalah −12 °C. Pernyataan yang benar adalah …',
        opsi: [
          { id: 'a', label: T('−18 < −12, jadi freezer A lebih dingin') },
          { id: 'b', label: T('−18 > −12, jadi freezer A lebih hangat') },
          { id: 'c', label: T('−18 > −12, karena 18 lebih besar dari 12') },
          { id: 'd', label: '−18 = −12, keduanya sama dingin' },
        ],
        correct: 'a',
        penjelasan: T(
          'Pada garis bilangan, −18 berada di sebelah kiri −12, sehingga −18 < −12. Freezer A lebih dingin.'
        ),
      },
      {
        type: 'int',
        ikon: '🏪',
        teks: 'Dina berutang Rp5.000 di koperasi sekolah. Jika utang dicatat sebagai bilangan negatif dalam ribuan rupiah, tuliskan catatan utang Dina.',
        jawab: -5,
        hints: [
          'Utang berarti kekurangan, dicatat dengan tanda negatif.',
          'Rp5.000 = 5 ribu rupiah.',
        ],
        penjelasan: 'Utang 5 ribu rupiah dicatat <strong>−5</strong> (ribu rupiah).',
      },
      {
        type: 'choice',
        ikon: '🌍',
        teks: 'Suhu empat kota pada suatu pagi: Moskow −7 °C, Tokyo 3 °C, Oslo −2 °C, Jakarta 26 °C. Urutan dari yang PALING DINGIN adalah …',
        opsi: [
          { id: 'a', label: 'Moskow, Oslo, Tokyo, Jakarta' },
          { id: 'b', label: 'Oslo, Moskow, Tokyo, Jakarta' },
          { id: 'c', label: 'Jakarta, Tokyo, Oslo, Moskow' },
          { id: 'd', label: 'Tokyo, Oslo, Moskow, Jakarta' },
        ],
        correct: 'a',
        penjelasan: T('−7 < −2 < 3 < 26, jadi urutannya Moskow, Oslo, Tokyo, Jakarta.'),
      },
      {
        type: 'int',
        ikon: '🏆',
        teks: 'Skor lima tim dalam kuis cerdas cermat (jawaban salah dikurangi nilai): Tim A −3, Tim B 2, Tim C −8, Tim D 0, Tim E −5. Tuliskan skor yang PALING RENDAH.',
        jawab: -8,
        hints: [
          'Skor paling rendah adalah bilangan yang letaknya paling kiri pada garis bilangan.',
          'Bandingkan −3, −8, dan −5: mana yang paling jauh di kiri 0?',
        ],
        penjelasan: T('−8 < −5 < −3 < 0 < 2. Skor paling rendah adalah −8 (Tim C).'),
      },
    ],
    nextLabel: 'Lanjut ke Penyelidikan Bekal →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — Penyelidikan pecahan (PBL Sintaks 3)
     ---------------------------------------------------------- */
  selidikPecahan: {
    kicker: 'Tahap 5 · Penyelidikan 2: Sisa Bekal',
    syntax: 'PBL · Sintaks 3',
    goal: 'Menulis, membaca, mengubah bentuk, dan membandingkan pecahan dari data sisa bekal.',
    guru: 'Tekankan cara baca baku: pembilang, "per", penyebut; untuk pecahan campuran, bilangan bulat dibaca lebih dulu. Saat membandingkan sisa air, ajak murid melihat pita jeriken sebelum dan sesudah penyebut disamakan.',
    tulisJudul: 'A. Dari kata-kata ke notasi pecahan',
    tulisInstruksi:
      'Tuliskan sisa bekal dari catatan Kak Dimas. Isi kotak "bulat" hanya untuk pecahan campuran; kosongkan bila tidak ada.',
    tulis: [
      {
        label: '🦅 Air Regu Elang: "tiga per empat jeriken"',
        jawab: { num: 3, den: 4 },
        bentuk: 'tepat',
        hints: ['Bilangan sebelum kata "per" adalah pembilang (di atas garis).'],
      },
      {
        label: '🪶 Air Regu Rajawali: "lima per delapan jeriken"',
        jawab: { num: 5, den: 8 },
        bentuk: 'tepat',
        hints: ['Bilangan sesudah kata "per" adalah penyebut (di bawah garis).'],
      },
      {
        label: '🦅 Beras Regu Elang: "satu satu per dua kilogram"',
        jawab: { whole: 1, num: 1, den: 2 },
        bentuk: 'tepat',
        hints: [
          'Ini pecahan campuran: bilangan bulat dibaca lebih dulu.',
          'Kotak "bulat" diisi 1, lalu pecahannya satu per dua.',
        ],
      },
    ],
    bacaJudul: 'B. Cara membaca yang baku',
    baca: [
      {
        id: 'b1',
        tanya: T('Sisa beras Regu Rajawali {7/4} kg. Cara membacanya yang baku adalah …'),
        opsi: [
          { id: 'baku', label: 'tujuh per empat kilogram' },
          { id: 'balik', label: 'empat per tujuh kilogram' },
          { id: 'gabung', label: 'tujuh empat kilogram' },
          { id: 'campur', label: 'satu tiga per empat kilogram' },
        ],
        correct: 'baku',
        umpan: {
          baku: 'Benar! Pembilang dibaca dulu, lalu "per", lalu penyebut.',
          balik: 'Terbalik. Pembilang (di atas, 7) dibaca lebih dulu.',
          gabung: 'Tanpa kata "per", pendengar bisa mengira bilangannya tujuh puluh empat.',
          campur: T(
            'Nilainya memang sama ({7/4} = {1 3/4}), tetapi itu cara baca pecahan campuran {1 3/4}, bukan {7/4}.'
          ),
        },
      },
      {
        id: 'b2',
        tanya: T('Pecahan campuran {1 1/2} dibaca …'),
        opsi: [
          { id: 'baku', label: 'satu satu per dua' },
          { id: 'hilang', label: 'satu per dua' },
          { id: 'sebelas', label: 'sebelas per dua' },
          { id: 'acak', label: 'satu per satu dua' },
        ],
        correct: 'baku',
        umpan: {
          baku: 'Tepat! Bilangan bulatnya (satu) dibaca dulu, lalu pecahannya (satu per dua).',
          hilang:
            'Bilangan bulatnya terlewat. "Satu per dua" hanya setengah, padahal berasnya lebih dari 1 kg.',
          sebelas: T('Angka 1 dan 1 bukan satu bilangan "11". {11/2} jauh lebih besar!'),
          acak: 'Urutannya tertukar. Bilangan bulat dulu, baru pembilang "per" penyebut.',
        },
      },
    ],
    ubahJudul: 'C. Pecahan biasa ↔ pecahan campuran',
    ubahInstruksi:
      'Beras ditulis dalam dua bentuk berbeda. Samakan bentuknya agar mudah dibandingkan. Perhatikan model pitanya (1 pita = 1 kg).',
    ubah: [
      {
        label: T('🪶 Beras Rajawali {7/4} kg ditulis sebagai pecahan campuran'),
        asal: { num: 7, den: 4 },
        jawab: { whole: 1, num: 3, den: 4 },
        bentuk: 'campuran',
        mixed: true,
        hints: ['7 ÷ 4 = 1 sisa 3. Hasil bagi menjadi bilangan bulat, sisanya menjadi pembilang.'],
      },
      {
        label: T('🦅 Beras Elang {1 1/2} kg ditulis sebagai pecahan biasa berpenyebut 2'),
        asal: { whole: 1, num: 1, den: 2 },
        jawab: { num: 3, den: 2 },
        bentuk: 'biasa',
        hints: ['1 utuh = 2 per dua. Tambahkan pembilangnya: 2 + 1 = …'],
      },
      {
        label: T('🕊️ Beras Merpati {5/4} kg ditulis sebagai pecahan campuran'),
        asal: { num: 5, den: 4 },
        jawab: { whole: 1, num: 1, den: 4 },
        bentuk: 'campuran',
        mixed: true,
        hints: ['5 ÷ 4 = 1 sisa 1.'],
      },
    ],
    bandingJudul: 'D. Bandingkan sisa air dengan menyamakan penyebut',
    bandingInstruksi:
      'Pita di bawah adalah jeriken yang sama besar. Sulit dipastikan hanya dengan melihat, bukan? Samakan penyebutnya dengan KPK dari 4, 8, dan 3, yaitu 24.',
    kpk: 24,
    samakan: [
      {
        regu: 'elang',
        label: T('🦅 Elang: {3/4} = … / 24 (tuliskan pembilangnya)'),
        jawab: 18,
        hints: ['24 ÷ 4 = 6, jadi pembilang 3 juga dikali 6.'],
        temuan: T('{3/4} = {18/24}'),
      },
      {
        regu: 'rajawali',
        label: T('🪶 Rajawali: {5/8} = … / 24 (tuliskan pembilangnya)'),
        jawab: 15,
        hints: ['24 ÷ 8 = 3, jadi pembilang 5 juga dikali 3.'],
        temuan: T('{5/8} = {15/24}'),
      },
      {
        regu: 'merpati',
        label: T('🕊️ Merpati: {2/3} = … / 24 (tuliskan pembilangnya)'),
        jawab: 16,
        hints: ['24 ÷ 3 = 8, jadi pembilang 2 juga dikali 8.'],
        temuan: T('{2/3} = {16/24}'),
      },
    ],
    simpulan: {
      tanya:
        'Kesimpulan kelompokmu: cara yang tepat untuk membandingkan pecahan berpenyebut berbeda adalah …',
      opsi: [
        { id: 'samakan', label: 'menyamakan penyebut, lalu membandingkan pembilangnya' },
        { id: 'penyebut', label: 'membandingkan penyebutnya saja' },
        { id: 'pembilang', label: 'membandingkan pembilangnya saja' },
        { id: 'jumlah', label: 'menjumlahkan pembilang dan penyebut masing-masing' },
      ],
      correct: 'samakan',
      umpan: {
        samakan: T(
          'Tepat! Setelah berpenyebut 24: {15/24} < {16/24} < {18/24}. Jadi sisa air Rajawali ({5/8}) paling sedikit, Elang ({3/4}) paling banyak.'
        ),
        penyebut: T(
          'Penyebut hanya memberi tahu ukuran tiap bagian. {5/8} berpenyebut paling besar, tetapi apakah nilainya paling besar?'
        ),
        pembilang: T(
          'Pembilang 5 pada {5/8} paling besar, tetapi bagian-bagiannya kecil (seperdelapan). Bagiannya harus sama besar dulu.'
        ),
        jumlah: 'Menjumlahkan pembilang dan penyebut mengubah nilai pecahan. Coba cara lain.',
      },
    },
    nextLabel: 'Lanjut Berlatih →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — Latihan pecahan (PBL Sintaks 3)
     ---------------------------------------------------------- */
  latihPecahan: {
    kicker: 'Tahap 6 · Latihan: Pecahan di Sekitar Kita',
    syntax: 'PBL · Sintaks 3',
    goal: 'Menerapkan penulisan, pembacaan, dan perbandingan pecahan pada situasi baru.',
    guru: 'Bila murid kesulitan membandingkan, minta mereka menggambar dua pita sama panjang atau mencari KPK penyebut terlebih dahulu.',
    maksCoba: 2,
    soal: [
      {
        type: 'frac',
        ikon: '🧁',
        teks: 'Resep kue bolu membutuhkan "dua per tiga gelas" gula. Tuliskan takaran gula itu dengan notasi pecahan.',
        jawab: { num: 2, den: 3 },
        bentuk: 'tepat',
        hints: ['Pembilang = bilangan sebelum "per", penyebut = bilangan sesudah "per".'],
        penjelasan: T('Dua per tiga ditulis {2/3}.'),
      },
      {
        type: 'choice',
        ikon: '🎀',
        teks: T('Panjang pita hiasan kelas {2 3/5} meter. Cara membacanya yang baku adalah …'),
        opsi: [
          { id: 'a', label: 'dua tiga per lima meter' },
          { id: 'b', label: 'tiga per lima dua meter' },
          { id: 'c', label: 'dua per tiga lima meter' },
          { id: 'd', label: 'dua ratus tiga puluh lima meter' },
        ],
        correct: 'a',
        penjelasan: T('Bilangan bulat dibaca dulu (dua), lalu pecahannya (tiga per lima).'),
      },
      {
        type: 'frac',
        ikon: '🛒',
        teks: T(
          'Ibu membeli {9/4} kg tepung terigu. Tuliskan berat tepung itu sebagai pecahan campuran.'
        ),
        jawab: { whole: 2, num: 1, den: 4 },
        bentuk: 'campuran',
        mixed: true,
        hints: ['9 ÷ 4 = 2 sisa 1.'],
        penjelasan: T('9 ÷ 4 = 2 sisa 1, jadi {9/4} = {2 1/4} kg.'),
      },
      {
        type: 'choice',
        ikon: '🏃',
        teks: T(
          'Pada latihan lari pagi, Andi berlari {3/4} km, Budi {5/6} km, dan Citra {2/3} km. Siapa yang berlari PALING JAUH?'
        ),
        opsi: [
          { id: 'a', label: 'Budi' },
          { id: 'b', label: 'Andi' },
          { id: 'c', label: 'Citra' },
          { id: 'd', label: 'Ketiganya sama jauh' },
        ],
        correct: 'a',
        penjelasan: T(
          'KPK dari 4, 6, dan 3 adalah 12: {3/4} = {9/12}, {5/6} = {10/12}, {2/3} = {8/12}. Budi paling jauh.'
        ),
      },
      {
        type: 'choice',
        ikon: '🍕',
        teks: T(
          'Dua pizza sama besar. Pizza A sudah dimakan {3/8} bagian, pizza B sudah dimakan {1/3} bagian. Pernyataan yang benar adalah …'
        ),
        opsi: [
          { id: 'a', label: T('{3/8} > {1/3}, pizza A dimakan lebih banyak') },
          { id: 'b', label: T('{3/8} < {1/3}, karena penyebut 8 lebih besar') },
          { id: 'c', label: T('{3/8} = {1/3}, keduanya dimakan sama banyak') },
          { id: 'd', label: T('{1/3} > {3/8}, karena {1/3} lebih sederhana') },
        ],
        correct: 'a',
        penjelasan: T(
          'KPK 8 dan 3 adalah 24: {3/8} = {9/24} dan {1/3} = {8/24}. Jadi {3/8} > {1/3}.'
        ),
      },
      {
        type: 'frac',
        ikon: '🌾',
        teks: T(
          'Pak Tani memakai {1 2/3} karung pupuk. Tuliskan banyak pupuk itu sebagai pecahan biasa.'
        ),
        jawab: { num: 5, den: 3 },
        bentuk: 'biasa',
        hints: ['1 utuh = 3 per tiga. Lalu tambahkan 2 per tiga.'],
        penjelasan: T('{1 2/3} = {3/3} + {2/3} = {5/3} karung.'),
      },
    ],
    nextLabel: 'Susun Papan Info Kemah →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — Karya: Papan Info Kemah (PBL Sintaks 4)
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 7 · Karya: Papan Info Kemah',
    syntax: 'PBL · Sintaks 4',
    goal: 'Menyelesaikan masalah persami dan menyajikan Papan Info Kemah beserta alasannya.',
    guru: 'Setelah papan info selesai, minta Juru Bicara tiap kelompok mempresentasikan (± 1 menit): cara membaca suhu terdingin, alasan urutan suhu, dan alasan pemilihan regu yang dibantu. Kelompok lain memberi tanggapan.',
    suhuJudul: '1. Urutkan suhu dari yang paling dingin',
    suhuDiBawahNol: {
      tanya: 'Pukul berapa saja suhu di bawah 0 °C sehingga murid wajib memakai jaket tebal?',
      opsi: [
        { id: 'benar', label: 'Pukul 01.00, 04.00, dan 06.00' },
        { id: 'satu', label: 'Hanya pukul 04.00' },
        { id: 'geser', label: 'Pukul 22.00, 01.00, dan 04.00' },
        { id: 'awal', label: 'Pukul 19.00 dan 22.00' },
      ],
      correct: 'benar',
      umpan: {
        benar: 'Tepat! −2, −4, dan −1 semuanya lebih kecil dari 0.',
        satu: '−4 memang paling dingin, tetapi −2 dan −1 juga di bawah 0.',
        geser: 'Suhu pukul 22.00 adalah 1 °C, di atas 0. Bagaimana dengan pukul 06.00 (−1 °C)?',
        awal: '6 °C dan 1 °C berada di atas 0. Cari suhu yang bertanda negatif.',
      },
    },
    airJudul: '2. Urutkan sisa air dari yang paling sedikit',
    berasJudul: '3. Urutkan sisa beras dari yang paling sedikit',
    berasPetunjuk: T(
      'Ingat hasil penyelidikanmu: {1 1/2} = {6/4}. Sekarang ketiganya berpenyebut 4.'
    ),
    keputusan: {
      tanya:
        'Kak Dimas punya SATU jeriken air dan SATU kantong beras tambahan. Keputusan yang paling adil adalah …',
      opsi: [
        { id: 'benar', label: 'Air untuk Rajawali, beras untuk Merpati' },
        { id: 'semua', label: 'Air dan beras untuk Rajawali' },
        { id: 'elang', label: 'Air untuk Elang, beras untuk Rajawali' },
        { id: 'balik', label: 'Air untuk Merpati, beras untuk Elang' },
      ],
      correct: 'benar',
      umpan: {
        benar: T(
          'Tepat! Air Rajawali paling sedikit ({5/8} = {15/24}), beras Merpati paling sedikit ({5/4} kg).'
        ),
        semua: T(
          'Air Rajawali memang paling sedikit, tetapi beras Rajawali ({7/4} kg) justru paling banyak. Lihat lagi urutan beras.'
        ),
        elang: T(
          'Air Elang ({3/4} = {18/24}) paling banyak, dan beras Rajawali paling banyak. Coba lagi.'
        ),
        balik:
          'Lihat lagi kedua urutan yang sudah kamu susun: siapa yang berada di posisi paling sedikit?',
      },
    },
    pesanLabel:
      'Tulis pesan singkat kelompokmu untuk peserta persami (mis. tentang jaket dan hemat air):',
    pesanPlaceholder:
      'Contoh: Suhu pukul 04.00 mencapai negatif empat derajat Celsius. Pakai jaket tebal!',
    posterJudul: 'Papan Info Kemah — Persami Dieng',
    posterFooter: 'Disusun oleh tim peneliti Kelas 7 berdasarkan catatan Kak Dimas.',
    nextLabel: 'Presentasikan & Lanjut Evaluasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — Evaluasi (PBL Sintaks 5)
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 8 · Analisis & Evaluasi',
    syntax: 'PBL · Sintaks 5',
    goal: 'Menilai ketepatan pendapat, menguji dugaan awal, dan menerapkan strategi pada masalah baru.',
    guru: 'Bahas bersama pendapat yang paling banyak keliru dinilai. Tanyakan kepada murid yang dugaannya berubah: "Apa yang membuatmu berubah pikiran?"',
    pilahInstruksi: 'Nilailah setiap pendapat teman berikut: TEPAT atau KELIRU?',
    pilahOpsi: [
      { id: 'tepat', label: 'Tepat' },
      { id: 'keliru', label: 'Keliru' },
    ],
    pernyataan: [
      {
        id: 'e1',
        teks: '"−5 lebih besar daripada −2, karena 5 lebih besar daripada 2."',
        correct: 'keliru',
        explanation: T('−5 berada di sebelah kiri −2 pada garis bilangan, jadi −5 < −2.'),
      },
      {
        id: 'e2',
        teks: '"0 lebih besar daripada semua bilangan bulat negatif."',
        correct: 'tepat',
        explanation: 'Semua bilangan negatif berada di sebelah kiri 0.',
      },
      {
        id: 'e3',
        teks: '"−3 °C dibaca minus tiga derajat Celsius."',
        correct: 'keliru',
        explanation: 'Cara baca bakunya "negatif tiga derajat Celsius".',
      },
      {
        id: 'e4',
        teks: T('"{3/8} lebih kecil daripada {2/3}."'),
        correct: 'tepat',
        explanation: T('{3/8} = {9/24} dan {2/3} = {16/24}, jadi {3/8} < {2/3}.'),
      },
      {
        id: 'e5',
        teks: T('"{2 1/4} dibaca dua satu per empat dan nilainya sama dengan {9/4}."'),
        correct: 'tepat',
        explanation: T('Cara bacanya baku, dan 2 × 4 + 1 = 9, jadi {2 1/4} = {9/4}.'),
      },
      {
        id: 'e6',
        teks: T('"{5/8} lebih besar daripada {5/6}, karena penyebut 8 lebih besar."'),
        correct: 'keliru',
        explanation: T(
          'Pembilangnya sama, jadi yang bagiannya lebih besar (penyebut lebih kecil) yang lebih besar: {5/6} > {5/8}.'
        ),
      },
    ],
    transferJudul: 'Masalah baru',
    transfer: [
      {
        id: 'x1',
        tanya:
          'Tiga kapal selam berada pada kedudukan A = −120 m, B = −85 m, dan C = −200 m. Kapal selam yang PALING DEKAT dengan permukaan laut (0 m) adalah …',
        opsi: [
          { id: 'b', label: 'Kapal selam B' },
          { id: 'a', label: 'Kapal selam A' },
          { id: 'c', label: 'Kapal selam C' },
          { id: 's', label: 'Ketiganya sama dekat' },
        ],
        correct: 'b',
        penjelasan: T(
          '−200 < −120 < −85 < 0. Bilangan −85 paling dekat dengan 0, jadi kapal selam B.'
        ),
      },
      {
        id: 'x2',
        tanya: T(
          'Tiga botol sirup sama besar berisi {4/5}, {7/10}, dan {3/4} botol. Urutan isinya dari yang PALING SEDIKIT adalah …'
        ),
        opsi: [
          { id: 'a', label: T('{7/10}, {3/4}, {4/5}') },
          { id: 'b', label: T('{3/4}, {4/5}, {7/10}') },
          { id: 'c', label: T('{4/5}, {3/4}, {7/10}') },
          { id: 'd', label: T('{7/10}, {4/5}, {3/4}') },
        ],
        correct: 'a',
        penjelasan: T(
          'KPK 5, 10, dan 4 adalah 20: {4/5} = {16/20}, {7/10} = {14/20}, {3/4} = {15/20}. Urutannya {7/10}, {3/4}, {4/5}.'
        ),
      },
    ],
    dugaanJudul: 'Uji dugaan awalmu',
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — Refleksi
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan strategi dan pemahaman yang diperoleh.',
    guru: 'Beri waktu hening 3–4 menit untuk menulis. Undang 2–3 murid membagikan jawaban pertanyaan kedua.',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Mengapa angka yang lebih besar belum tentu bernilai lebih besar? Beri satu contoh dari bilangan bulat dan satu dari pecahan.',
        placeholder: 'Contoh: −4 < −2 walaupun 4 > 2, karena …',
      },
      {
        id: 'q2',
        teks: 'Di mana lagi kamu menjumpai bilangan negatif atau pecahan dalam kehidupanmu sehari-hari?',
        placeholder: 'Contoh: saldo, suhu kulkas, takaran resep …',
      },
      {
        id: 'q3',
        teks: 'Bagian mana yang masih membingungkan, dan apa rencanamu untuk memahaminya?',
        placeholder: 'Tulis dengan jujur …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu membaca, menulis, dan membandingkan bilangan bulat dan pecahan sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🤩 Sangat yakin, bisa menjelaskan ke teman' },
      { id: 'yakin', label: '🙂 Yakin, sesekali masih perlu melihat catatan' },
      { id: 'ragu', label: '🤔 Masih ragu di beberapa bagian' },
      { id: 'bantu', label: '🙋 Perlu bantuan lagi' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — Selesai
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Papan Info Kemah Siap Dipasang!',
    teks: 'Kalian berhasil menerapkan bilangan bulat dan pecahan untuk mengambil keputusan nyata di perkemahan.',
    capaian: [
      'Menulis bilangan bulat dari kata-kata dan membacanya dengan kata "negatif".',
      'Membandingkan dan mengurutkan bilangan bulat menggunakan garis bilangan.',
      'Menulis dan membaca pecahan biasa serta pecahan campuran, dan mengubah bentuknya.',
      'Membandingkan pecahan dengan menyamakan penyebut untuk mengambil keputusan.',
    ],
  },
};
