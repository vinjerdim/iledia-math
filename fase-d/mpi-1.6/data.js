'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membandingkan Bilangan Bulat, Pecahan & Desimal
   secara Terpadu dalam Kehidupan Sehari-hari — Fase D, SMP Kelas VII

   Tujuan Pembelajaran:
   Membandingkan bilangan bulat, rasional, dan desimal secara terpadu
   untuk menyelesaikan masalah kontekstual kehidupan sehari-hari.

   Notasi di berkas ini (lihat engine seksi 38):
     • setiap bilangan ditulis sebagai STRING dalam bentuk aslinya —
       bulat '-18', pecahan '3/4' atau '-3 1/2', desimal berkoma '-2,5';
     • di dalam teks, token "{3/4}" / "{3 1/2}" dirender menjadi pecahan
       bersusun (renderFracText) dan tanda minus ditulis "−".

   Model pembelajaran: PROBLEM BASED LEARNING (PBL).
   Masalah pemantik: "Stand Es Buah 7B di Festival Pangan Sekolah".
   Panitia menitipkan catatan yang bentuk bilangannya campur aduk:
     • Suhu penyimpanan es: freezer −18 °C, termos es −4 °C,
       cool box −3 1/2 °C, kulkas −2,5 °C;
     • Sirup: resep butuh 3/4 L per wadah; botol Toko A 0,7 L,
       Toko B 4/5 L, Toko C 0,75 L;
     • Kas: selisih hasil jualan kelompok terhadap target (ratus ribu
       rupiah): Jeruk −2, Melon −1,3, Mangga −1 1/4, Nanas 0,25,
       Semangka 1/2.
   Konflik kognitif: "−3 1/2 lebih hangat karena 3 1/2 > 2,5",
   "0,25 > 1/2 karena 25 > 1", dan "0,75 L ≠ 3/4 L karena bentuknya
   lain". Kelompok harus menyamakan bentuk, menempatkan bilangan pada
   garis bilangan, membandingkan NILAINYA, lalu mengambil keputusan.

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ....... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar . 'organisasi'
     Sintaks 3 — Membimbing penyelidikan ............ 'selidikUbah',
                                                      'selidikGaris',
                                                      'selidikBanding'
     Sintaks 4 — Mengembangkan & menyajikan karya ... 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi ........ 'evaluasi'
     Penerapan & penutup ............................ 'terapkan', 'refleksi',
                                                      'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — murid menulis dugaan & hipotesis,
       memilah informasi, menyusun rencana sendiri, lalu menguji
       dugaannya dan merefleksikan strateginya.
     • Bermakna (meaningful) — semua bilangan berasal dari satu
       masalah nyata; hasil perbandingan langsung menjadi keputusan
       (tempat menyimpan es, botol yang dibeli, kelompok yang dibantu).
     • Menggembirakan (joyful) — lab ubah bentuk, garis bilangan yang
       bisa diketuk, umpan balik yang menunjuk letak kekeliruan, dan
       Papan Keputusan Stand yang dipresentasikan.

   Rangkaian aktivitas (± 2 × 40 menit; kelompok 3–4 murid):
     1. Orientasi     (8')  — cerita, kartu catatan panitia, dugaan
                              awal (tidak dinilai), pertanyaan inti, dan
                              hipotesis kelompok.
     2. Organisasi    (6')  — memilih peran, memilah informasi
                              (diketahui/ditanya/tidak diperlukan), dan
                              mengurutkan rencana penyelidikan.
     3. Selidik A     (10') — Lab Samakan Bentuk: pecahan → desimal
                              (penyebut 10/100/1000), desimal → pecahan,
                              bulat → desimal; pengamatan.
     4. Selidik B     (8')  — menempatkan bilangan campuran bentuk pada
                              garis bilangan berlangkah 1/4; pengamatan.
     5. Selidik C     (12') — pasangan lintas bentuk: lambang <, >, =
                              berdiagnosa + makna dalam konteks; memilih
                              strategi yang cocok.
     6. Karya         (12') — mengurutkan suhu & kas, memilih botol,
                              memilih alasan, menulis pesan kelompok →
                              Papan Keputusan Stand dipresentasikan.
     7. Evaluasi      (10') — menilai pendapat teman, dugaan vs hasil,
                              menyusun simpulan dari bank kalimat.
     8. Uji terap     (10') — 8 soal acak dari bank 12 soal.
     9. Refleksi      (4')  — rekap capaian, refleksi tertulis, keyakinan.

   Catatan pengacakan: SEMUA daftar pilihan di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di urutan pertama). app.js
   mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / ensureTapOrderState / shuffleArray dari
   shared/engine.js) dan menyimpannya di State, sehingga tiap murid dan
   tiap Reset mendapat urutan berbeda. Pilihan buatan engine
   (opsiBentukSetara, opsiMaknaBandingTerpadu, COMPARE_SYMBOLS) diacak
   dengan cara yang sama.

   Konsistensi kunci jawaban diuji tests/mpi-1.6-data.test.js terhadap
   engine seksi 38.
   ============================================================ */

var PBL = 'Problem Based Learning';

var DATA = {
  meta: {
    judul: 'Membandingkan Bilangan Bulat, Pecahan & Desimal dalam Kehidupan Sehari-hari',
  },

  tahap: [
    { id: 'orientasi', label: 'Masalah' },
    { id: 'organisasi', label: 'Organisasi' },
    { id: 'selidikUbah', label: 'Ubah Bentuk' },
    { id: 'selidikGaris', label: 'Garis Bilangan' },
    { id: 'selidikBanding', label: 'Bandingkan' },
    { id: 'karya', label: 'Karya' },
    { id: 'evaluasi', label: 'Evaluasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Data masalah pemantik — dipakai di beberapa tahap. */
  suhu: [
    { id: 'freezer', nama: 'Freezer kantin', ikon: '🧊', nilai: '-18' },
    { id: 'termos', nama: 'Termos es', ikon: '🫙', nilai: '-4' },
    { id: 'coolbox', nama: 'Cool box', ikon: '🧰', nilai: '-3 1/2' },
    { id: 'kulkas', nama: 'Kulkas kelas', ikon: '🗄️', nilai: '-2,5' },
  ],
  sirup: {
    butuh: '3/4',
    botol: [
      { id: 'tokoA', nama: 'Toko A', nilai: '0,7' },
      { id: 'tokoB', nama: 'Toko B', nilai: '4/5' },
      { id: 'tokoC', nama: 'Toko C', nilai: '0,75' },
    ],
  },
  kas: [
    { id: 'jeruk', nama: 'Kelompok Jeruk', ikon: '🍊', nilai: '-2' },
    { id: 'melon', nama: 'Kelompok Melon', ikon: '🍈', nilai: '-1,3' },
    { id: 'mangga', nama: 'Kelompok Mangga', ikon: '🥭', nilai: '-1 1/4' },
    { id: 'nanas', nama: 'Kelompok Nanas', ikon: '🍍', nilai: '0,25' },
    { id: 'semangka', nama: 'Kelompok Semangka', ikon: '🍉', nilai: '1/2' },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI PADA MASALAH (PBL sintaks 1)
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Evaluasi.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi pada Masalah',
    syntax: PBL + ' · Sintaks 1',
    goal: 'Memahami masalah nyata yang memuat bilangan bulat, pecahan, dan desimal sekaligus, lalu menyampaikan dugaan awal.',
    guru: 'Bacakan cerita dengan antusias, lalu tanyakan: "Apa yang membuat catatan panitia ini sulit dibandingkan?" Biarkan kelompok berdebat tentang −3½ dan −2,5 atau 0,75 L dan ¾ L. Jangan membenarkan dugaan dulu — dugaan ini akan diuji murid sendiri di tahap Evaluasi.',
    judul: 'Stand Es Buah 7B di Festival Pangan Sekolah',
    pengantar:
      'Sabtu ini kelas 7B membuka stand es buah di Festival Pangan Sekolah. Panitia menitipkan tiga catatan. Masalahnya, bilangan di catatan itu ditulis dengan bentuk yang berbeda-beda: ada bilangan bulat, pecahan, dan desimal — ada yang positif, ada yang negatif.',
    catatan: [
      {
        id: 'cSuhu',
        ikon: '🌡️',
        judul: 'Catatan 1 — Suhu tempat menyimpan es batu',
        teks: 'Es batu harus disimpan di tempat yang paling dingin. Suhu tiap tempat (°C):',
        sumber: 'suhu',
        satuan: '°C',
      },
      {
        id: 'cSirup',
        ikon: '🥤',
        judul: 'Catatan 2 — Botol sirup',
        teks: 'Satu wadah es buah membutuhkan {3/4} liter sirup. Tiga toko menjual botol berisi:',
        sumber: 'sirup',
        satuan: 'L',
      },
      {
        id: 'cKas',
        ikon: '💰',
        judul: 'Catatan 3 — Kas kelompok kemarin',
        teks: 'Selisih hasil jualan tiap kelompok terhadap target (dalam ratus ribu rupiah; negatif = di bawah target). Kelompok yang paling jauh di bawah target akan dibantu.',
        sumber: 'kas',
        satuan: '',
      },
    ],
    dugaan: [
      {
        id: 'd1',
        tanya:
          'Mana yang lebih dingin: <strong>cool box (−{3 1/2} °C)</strong> atau <strong>kulkas (−2,5 °C)</strong>?',
        a: '-3 1/2',
        b: '-2,5',
        opsi: [
          { id: 'a', label: 'Cool box, −3½ °C' },
          { id: 'b', label: 'Kulkas, −2,5 °C' },
          { id: 'sama', label: 'Sama dinginnya' },
          { id: 'tidak', label: 'Tidak bisa dibandingkan karena bentuknya berbeda' },
        ],
        baku: 'a',
        pembahasan:
          '−3½ = −3,5 dan −3,5 < −2,5 (lebih jauh di kiri 0), jadi cool box lebih dingin.',
      },
      {
        id: 'd2',
        tanya: 'Botol mana yang isinya <strong>tepat sama</strong> dengan kebutuhan resep {3/4} L?',
        opsi: [
          { id: 'tokoC', label: 'Toko C, 0,75 L' },
          { id: 'tokoA', label: 'Toko A, 0,7 L' },
          { id: 'tokoB', label: 'Toko B, ⅘ L' },
          { id: 'tidak', label: 'Tidak ada yang sama' },
        ],
        baku: 'tokoC',
        pembahasan: '¾ = 75/100 = 0,75, jadi botol Toko C tepat sama dengan kebutuhan resep.',
      },
      {
        id: 'd3',
        tanya: 'Kelompok mana yang <strong>paling jauh di bawah target</strong>?',
        opsi: [
          { id: 'jeruk', label: 'Jeruk, −2' },
          { id: 'melon', label: 'Melon, −1,3' },
          { id: 'mangga', label: 'Mangga, −1¼' },
          { id: 'semangka', label: 'Semangka, ½' },
        ],
        baku: 'jeruk',
        pembahasan:
          '−2 adalah bilangan terkecil (paling kiri pada garis bilangan) di antara data kas.',
      },
      {
        id: 'd4',
        tanya:
          'Mana yang lebih besar: <strong>−{1 1/4}</strong> (Mangga) atau <strong>−1,3</strong> (Melon)?',
        a: '-1 1/4',
        b: '-1,3',
        opsi: [
          { id: 'a', label: '−1¼' },
          { id: 'b', label: '−1,3' },
          { id: 'sama', label: 'Sama besar' },
          { id: 'tidak', label: 'Tidak bisa dibandingkan' },
        ],
        baku: 'a',
        pembahasan: '−1¼ = −1,25. Karena −1,25 lebih dekat ke 0 daripada −1,3, maka −1¼ > −1,3.',
      },
    ],
    alasanLabel:
      'Apa yang membuat catatan-catatan ini sulit dibandingkan? Tulis dugaan kelompokmu.',
    alasanPlaceholder: 'Contoh: bentuknya berbeda-beda, ada yang negatif …',
    pertanyaan: 'Apa pertanyaan inti yang harus diselesaikan kelompokmu?',
    masalahOpsi: [
      {
        id: 'inti',
        label:
          'Bagaimana membandingkan dan mengurutkan bilangan bulat, pecahan, dan desimal yang bentuknya berbeda agar keputusan stand tepat?',
      },
      { id: 'total', label: 'Berapa jumlah seluruh uang kas semua kelompok?' },
      { id: 'baca', label: 'Bagaimana cara membaca pecahan campuran dengan benar?' },
      { id: 'harga', label: 'Toko mana yang menjual sirup paling murah?' },
    ],
    masalahCorrect: 'inti',
    masalahUmpan: {
      inti: 'Tepat! Ketiga keputusan (tempat es, botol, kelompok yang dibantu) bergantung pada kemampuan membandingkan bilangan yang bentuknya berbeda.',
      total:
        'Menjumlahkan kas tidak menjawab keputusan panitia. Panitia perlu tahu mana yang lebih kecil/lebih besar, bukan totalnya.',
      baca: 'Membaca pecahan penting, tetapi masalah stand menuntut kita MEMBANDINGKAN, bukan hanya membaca.',
      harga:
        'Catatan panitia tidak memuat harga. Fokuslah pada informasi yang ada: suhu, isi botol, dan kas.',
    },
    hipotesisLabel:
      'Tulis hipotesis kelompokmu: bagaimana cara membandingkan bilangan yang bentuknya berbeda?',
    hipotesisPlaceholder: 'Contoh: diubah dulu menjadi desimal semua, lalu …',
    nextLabel: 'Lanjut: Atur Kelompok →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENGORGANISASI MURID (PBL sintaks 2)
     ---------------------------------------------------------- */
  organisasi: {
    kicker: 'Tahap 2 · Mengorganisasi Belajar',
    syntax: PBL + ' · Sintaks 2',
    goal: 'Membagi peran, memilah informasi yang diperlukan, dan menyusun rencana penyelidikan.',
    guru: 'Pastikan setiap anggota memegang satu peran dan peran dipertukarkan pada pertemuan berikutnya. Saat pemilahan, minta kelompok menjelaskan mengapa "jam buka stand" tidak diperlukan. Rencana yang tepat menjadi peta langkah pada tahap penyelidikan.',
    peranLabel: 'Pilih peranmu di kelompok:',
    peran: [
      {
        id: 'ketua',
        label:
          '🧭 <strong>Ketua Diskusi</strong> — menjaga agar semua anggota berpendapat dan rencana diikuti.',
      },
      {
        id: 'pengubah',
        label:
          '🔁 <strong>Juru Ubah Bentuk</strong> — mengubah pecahan ↔ desimal dan memeriksa ulang.',
      },
      {
        id: 'garis',
        label:
          '📏 <strong>Penjaga Garis Bilangan</strong> — menempatkan bilangan dan memeriksa letaknya.',
      },
      {
        id: 'pencatat',
        label:
          '📝 <strong>Pencatat Papan</strong> — menulis keputusan dan alasan untuk dipresentasikan.',
      },
    ],
    judulPilah: 'Pilah informasi dari catatan panitia',
    opsiPilah: [
      { id: 'diketahui', label: 'Diketahui' },
      { id: 'ditanya', label: 'Ditanya' },
      { id: 'tidakPerlu', label: 'Tidak diperlukan' },
    ],
    pilah: [
      {
        id: 'i1',
        teks: 'Suhu cool box −3½ °C dan suhu kulkas −2,5 °C.',
        correct: 'diketahui',
        explanation: 'Ini data suhu yang akan dibandingkan.',
      },
      {
        id: 'i2',
        teks: 'Satu wadah es buah membutuhkan ¾ L sirup.',
        correct: 'diketahui',
        explanation: 'Kebutuhan resep menjadi patokan memilih botol.',
      },
      {
        id: 'i3',
        teks: 'Selisih kas Kelompok Melon −1,3 ratus ribu rupiah.',
        correct: 'diketahui',
        explanation: 'Data kas dipakai untuk menentukan peringkat kelompok.',
      },
      {
        id: 'i4',
        teks: 'Tempat mana yang paling dingin untuk menyimpan es batu?',
        correct: 'ditanya',
        explanation: 'Ini salah satu keputusan yang harus dijawab.',
      },
      {
        id: 'i5',
        teks: 'Botol mana yang isinya sama dengan kebutuhan resep?',
        correct: 'ditanya',
        explanation: 'Ini keputusan kedua yang harus dijawab.',
      },
      {
        id: 'i6',
        teks: 'Urutan kelompok dari yang paling jauh di bawah target.',
        correct: 'ditanya',
        explanation: 'Ini keputusan ketiga yang harus dijawab.',
      },
      {
        id: 'i7',
        teks: 'Stand dibuka pukul 08.00 dan tendanya berwarna hijau.',
        correct: 'tidakPerlu',
        explanation: 'Jam buka dan warna tenda tidak memengaruhi perbandingan bilangan.',
      },
      {
        id: 'i8',
        teks: 'Ada 32 murid di kelas 7B.',
        correct: 'tidakPerlu',
        explanation: 'Banyak murid tidak dipakai untuk mengambil ketiga keputusan.',
      },
    ],
    judulRencana: 'Susun rencana penyelidikan kelompok',
    instruksiRencana: 'Ketuk langkah-langkah berikut sesuai urutan yang paling masuk akal.',
    rencana: [
      {
        id: 'r1',
        label:
          '🔍 Kenali bentuk dan tanda setiap bilangan (bulat, pecahan, desimal; positif/negatif).',
      },
      { id: 'r2', label: '🔁 Ubah ke bentuk yang sama (desimal atau pecahan berpenyebut sama).' },
      {
        id: 'r3',
        label: '📏 Tempatkan pada garis bilangan dan bandingkan: makin kanan makin besar.',
      },
      { id: 'r4', label: '✅ Ambil keputusan sesuai makna dalam cerita (dingin, banyak, rugi).' },
    ],
    nextLabel: 'Mulai Penyelidikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENYELIDIKAN A: LAB SAMAKAN BENTUK (PBL sintaks 3)
     Opsi setiap kartu dibuat engine (opsiBentukSetara) lalu diacak.
     ---------------------------------------------------------- */
  selidikUbah: {
    kicker: 'Tahap 3 · Penyelidikan A — Samakan Bentuk',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Mengubah pecahan menjadi desimal, desimal menjadi pecahan, dan bilangan bulat menjadi desimal tanpa mengubah nilainya.',
    guru: 'Juru Ubah Bentuk memimpin, anggota lain memeriksa. Bila murid memilih 3,4 untuk ¾, tanyakan: "Apakah 3,4 lebih dari 1? Apakah ¾ lebih dari 1?" Tekankan bahwa penyebut dijadikan 10, 100, atau 1000 lebih dulu, dan tanda negatif selalu ikut.',
    judulA: 'A. Pecahan → desimal',
    instruksiA: 'Jadikan penyebutnya 10, 100, atau 1000, lalu pilih bentuk desimalnya.',
    keDesimal: ['3/4', '-3 1/2', '4/5', '-1 1/4', '1/2'],
    judulB: 'B. Desimal → pecahan',
    instruksiB:
      'Angka di belakang koma menunjukkan penyebutnya (persepuluhan, perseratusan). Pilih pecahan paling sederhana.',
    kePecahan: ['0,7', '-2,5', '0,25', '-1,3'],
    judulC: 'C. Bilangan bulat',
    instruksiC: 'Bilangan bulat juga dapat ditulis dalam bentuk desimal.',
    keBulat: ['-18', '-4'],
    amati: [
      {
        id: 'a1',
        tanya: 'Agar {3/4} mudah diubah ke desimal, penyebutnya dijadikan …',
        opsi: [
          { id: 'seratus', label: '100, sehingga ¾ = 75/100 = 0,75' },
          { id: 'tigaempat', label: '34, sehingga ¾ = 0,34' },
          { id: 'tujuh', label: '7, karena 3 + 4 = 7' },
          { id: 'duabelas', label: '12, karena 3 × 4 = 12' },
        ],
        correct: 'seratus',
        umpan: {
          seratus: 'Tepat! Kalikan pembilang dan penyebut dengan 25: ¾ = 75/100 = 0,75.',
          tigaempat:
            'Pembilang dan penyebut tidak boleh ditulis berjajar. 0,34 < ½, padahal ¾ > ½.',
          tujuh:
            'Menjumlahkan pembilang dan penyebut mengubah nilainya. Cari pecahan senilai berpenyebut 10, 100, atau 1000.',
          duabelas:
            'Penyebut 12 tidak membantu menulis desimal. Penyebut yang dicari adalah 10, 100, atau 1000.',
        },
      },
      {
        id: 'a2',
        tanya: 'Apa yang terjadi pada tanda negatif saat mengubah −{3 1/2} menjadi desimal?',
        opsi: [
          { id: 'ikut', label: 'Tanda − tetap ikut: −3½ = −3,5' },
          { id: 'hilang', label: 'Tanda − hilang: −3½ = 3,5' },
          { id: 'pindah', label: 'Tanda − pindah ke belakang koma: 3,−5' },
          { id: 'positif', label: 'Desimal tidak pernah negatif' },
        ],
        correct: 'ikut',
        umpan: {
          ikut: 'Tepat! Mengubah bentuk tidak mengubah nilai, termasuk tandanya.',
          hilang:
            'Kalau tandanya hilang, nilainya berubah dari di kiri 0 menjadi di kanan 0. Tanda harus ikut.',
          pindah: 'Tanda − selalu ditulis di depan bilangan, bukan di tengah.',
          positif: 'Desimal juga bisa negatif, misalnya suhu kulkas −2,5 °C.',
        },
      },
    ],
    temuan: [
      'Pecahan dapat diubah ke desimal dengan menjadikan penyebutnya 10, 100, atau 1000: ¾ = 75/100 = 0,75.',
      'Desimal dapat diubah ke pecahan: banyak angka di belakang koma menentukan penyebutnya (0,25 = 25/100 = ¼).',
      'Bilangan bulat dapat ditulis −4 = −4,0 = −4/1. Tanda negatif selalu ikut saat bentuk diubah.',
      'Bentuk boleh berbeda, nilainya tetap sama — itulah kunci membandingkan secara terpadu.',
    ],
    nextLabel: 'Lanjut: Garis Bilangan →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENYELIDIKAN B: GARIS BILANGAN TERPADU (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikGaris: {
    kicker: 'Tahap 4 · Penyelidikan B — Garis Bilangan Terpadu',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menempatkan bilangan bulat, pecahan, dan desimal pada satu garis bilangan untuk melihat urutannya.',
    guru: 'Penjaga Garis Bilangan mengetuk, anggota lain menjelaskan alasannya. Ajak murid menyebut bentuk lain tiap bilangan (−¾ = −0,75) sebelum mengetuk. Setelah selesai, tanyakan: "Mengapa −1,5 di kiri −¾ padahal 1,5 > ¾?"',
    judul: 'Tempatkan kartu pada garis bilangan',
    instruksi: 'Setiap langkah kecil bernilai ¼ = 0,25. Ketuk letak setiap bilangan satu per satu.',
    garis: {
      min: -2,
      max: 2,
      langkah: 4,
      nilai: [
        { nilai: '-1,5', teks: 'desimal' },
        { nilai: '-3/4', teks: 'pecahan' },
        { nilai: '0,25', teks: 'desimal' },
        { nilai: '1/2', teks: 'pecahan' },
        { nilai: '1 1/4', teks: 'pecahan campuran' },
        { nilai: '-2', teks: 'bilangan bulat' },
      ],
    },
    tanya: [
      {
        id: 'g1',
        tanya: 'Dari garis bilangan tadi, bilangan yang <strong>paling kecil</strong> adalah …',
        opsi: [
          { id: 'min2', label: '−2' },
          { id: 'min15', label: '−1,5' },
          { id: 'min34', label: '−¾' },
          { id: 'nol25', label: '0,25' },
        ],
        correct: 'min2',
        umpan: {
          min2: 'Tepat! −2 terletak paling kiri, jadi paling kecil.',
          min15: '−1,5 masih di kanan −2. Lihat titik yang paling kiri.',
          min34: '−¾ = −0,75 lebih dekat ke 0 daripada −2 dan −1,5.',
          nol25: '0,25 positif, letaknya di kanan 0 — tidak mungkin paling kecil.',
        },
      },
      {
        id: 'g2',
        tanya: 'Mengapa −1,5 &lt; −{3/4}?',
        opsi: [
          { id: 'kiri', label: 'Karena −1,5 terletak lebih jauh di kiri 0 daripada −¾' },
          { id: 'angka', label: 'Karena 1,5 > ¾, jadi −1,5 lebih besar' },
          { id: 'desimal', label: 'Karena desimal selalu lebih kecil daripada pecahan' },
          { id: 'lima', label: 'Karena angka 5 lebih besar daripada 3' },
        ],
        correct: 'kiri',
        umpan: {
          kiri: 'Tepat! Pada garis bilangan, yang lebih kiri selalu lebih kecil.',
          angka:
            'Justru karena angkanya lebih besar, −1,5 lebih jauh dari 0 ke arah kiri — sehingga lebih KECIL.',
          desimal: 'Bentuk tidak menentukan besar kecilnya. 0,25 < ½ tetapi 1,25 > ½.',
          lima: 'Angka yang tampak tidak bisa dibandingkan langsung. Lihat letaknya pada garis bilangan.',
        },
      },
    ],
    temuan: [
      'Bilangan bulat, pecahan, dan desimal dapat ditempatkan pada SATU garis bilangan yang sama.',
      'Makin ke kanan, bilangan makin besar; makin ke kiri, makin kecil — apa pun bentuknya.',
      'Di antara dua bilangan negatif, yang lebih dekat ke 0 adalah yang lebih besar: −¾ > −1,5.',
    ],
    nextLabel: 'Lanjut: Bandingkan →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENYELIDIKAN C: MEMBANDINGKAN LINTAS BENTUK
     ---------------------------------------------------------- */
  selidikBanding: {
    kicker: 'Tahap 5 · Penyelidikan C — Bandingkan Lintas Bentuk',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Membandingkan pasangan bilangan yang bentuknya berbeda dengan lambang <, >, = dan menjelaskan maknanya dalam cerita.',
    guru: 'Minta setiap kelompok menyebut strategi yang dipakai sebelum memilih lambang. Bila muncul umpan balik miskonsepsi, hentikan sejenak dan bahas bersama kelas. Tanyakan strategi mana yang paling cepat untuk pasangan yang tandanya berbeda.',
    judulA: 'A. Pilih lambang, lalu maknai',
    instruksiA:
      'Setelah lambang tepat, pilih kata yang tepat untuk melengkapi kalimat dalam cerita.',
    pasangan: [
      {
        id: 'p1',
        ikon: '🌡️',
        tema: 'suhu',
        namaA: 'Cool box',
        a: '-3 1/2',
        namaB: 'kulkas',
        b: '-2,5',
        satuan: '°C',
        kalimat: 'Cool box ___ daripada kulkas.',
      },
      {
        id: 'p2',
        ikon: '🥤',
        tema: 'volume',
        namaA: 'Botol Toko B',
        a: '4/5',
        namaB: 'kebutuhan resep',
        b: '3/4',
        satuan: 'L',
        kalimat: 'Isi botol Toko B ___ daripada kebutuhan resep.',
      },
      {
        id: 'p3',
        ikon: '🥤',
        tema: 'volume',
        namaA: 'Botol Toko C',
        a: '0,75',
        namaB: 'kebutuhan resep',
        b: '3/4',
        satuan: 'L',
        kalimat: 'Isi botol Toko C ___ dengan kebutuhan resep.',
      },
      {
        id: 'p4',
        ikon: '💰',
        tema: 'kas',
        namaA: 'Kelompok Mangga',
        a: '-1 1/4',
        namaB: 'Kelompok Melon',
        b: '-1,3',
        satuan: '',
        kalimat: 'Kelompok Mangga ___ daripada Kelompok Melon.',
      },
      {
        id: 'p5',
        ikon: '💰',
        tema: 'kas',
        namaA: 'Kelompok Nanas',
        a: '0,25',
        namaB: 'Kelompok Semangka',
        b: '1/2',
        satuan: '',
        kalimat: 'Kelompok Nanas ___ daripada Kelompok Semangka.',
      },
      {
        id: 'p6',
        ikon: '🌡️',
        tema: 'suhu',
        namaA: 'Termos es',
        a: '-4',
        namaB: 'cool box',
        b: '-3 1/2',
        satuan: '°C',
        kalimat: 'Termos es ___ daripada cool box.',
      },
    ],
    judulB: 'B. Strategi mana yang paling cocok?',
    strategi: [
      {
        id: 's1',
        tanya: 'Untuk membandingkan −{3 1/2} dan {1/4}, cara tercepat adalah …',
        opsi: [
          {
            id: 'tanda',
            label: 'Lihat tandanya: bilangan negatif selalu lebih kecil daripada bilangan positif',
          },
          { id: 'desimal', label: 'Wajib mengubah keduanya ke desimal lebih dulu' },
          { id: 'angka', label: 'Bandingkan angka 3 dan 1' },
          { id: 'penyebut', label: 'Bandingkan penyebutnya: 2 dan 4' },
        ],
        correct: 'tanda',
        umpan: {
          tanda: 'Tepat! Bila tandanya berbeda, tanda saja sudah cukup: −3½ < ¼.',
          desimal:
            'Mengubah ke desimal juga benar, tetapi tidak perlu. Tandanya berbeda, jadi langsung terlihat mana yang lebih kecil.',
          angka: 'Angka yang tampak tidak menentukan. Tandanya yang paling penting di sini.',
          penyebut: 'Penyebut tidak menentukan bila tandanya berbeda. Perhatikan tanda − dan +.',
        },
      },
      {
        id: 's2',
        tanya: 'Untuk membandingkan {2/3} dan 0,6, cara yang tepat adalah …',
        opsi: [
          { id: 'pecahan', label: 'Ubah 0,6 menjadi ⅗, lalu samakan penyebut: 10/15 dan 9/15' },
          { id: 'desimalHabis', label: 'Ubah ⅔ menjadi desimal berhenti yang tepat' },
          { id: 'angka', label: 'Bandingkan 2 dengan 6' },
          { id: 'tidak', label: 'Tidak bisa dibandingkan karena ⅔ tidak bisa ditulis desimal' },
        ],
        correct: 'pecahan',
        umpan: {
          pecahan:
            'Tepat! ⅔ = 0,666… (berulang), jadi lebih mudah memakai pecahan berpenyebut sama: 10/15 > 9/15, jadi ⅔ > 0,6.',
          desimalHabis:
            '⅔ = 0,666… tidak pernah berhenti, jadi tidak ada desimal berhenti yang tepat. Pakai pecahan berpenyebut sama.',
          angka: 'Angka yang tampak tidak bisa dibandingkan langsung. Samakan bentuknya dulu.',
          tidak: 'Tetap bisa! Ubah 0,6 menjadi pecahan ⅗, lalu samakan penyebutnya.',
        },
      },
    ],
    temuan: [
      'Tanda berbeda? Bilangan negatif selalu lebih kecil daripada nol dan bilangan positif.',
      'Tanda sama? Ubah ke bentuk yang sama — desimal (penyebut 10, 100, 1000) atau pecahan berpenyebut sama.',
      'Bentuk berbeda bisa bernilai sama: 0,75 = ¾.',
      'Hasil perbandingan diberi makna sesuai cerita: lebih dingin, lebih banyak, lebih baik hasilnya.',
    ],
    nextLabel: 'Lanjut: Susun Karya →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGEMBANGKAN & MENYAJIKAN KARYA (PBL sintaks 4)
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 6 · Menyajikan Hasil Karya',
    syntax: PBL + ' · Sintaks 4',
    goal: 'Menyelesaikan ketiga keputusan stand dan menyajikannya dalam Papan Keputusan Stand beserta alasannya.',
    guru: 'Pencatat Papan menuliskan hasil; anggota lain berlatih menjelaskan satu keputusan masing-masing. Undang 2–3 kelompok mempresentasikan papannya (±2 menit). Kelompok lain menanggapi: "Setuju atau tidak? Mengapa?"',
    judul1: 'Keputusan 1 — Urutkan tempat penyimpanan dari yang paling dingin',
    judul2: 'Keputusan 2 — Pilih botol sirup',
    tanyaBotol: {
      id: 'k2',
      tanya:
        'Botol mana yang dibeli agar isinya <strong>tepat</strong> untuk satu wadah ({3/4} L) tanpa sisa?',
      opsi: [
        { id: 'tokoC', label: 'Toko C (0,75 L) — sama dengan ¾ L' },
        { id: 'tokoB', label: 'Toko B (⅘ L) — lebih banyak, ada sisa' },
        { id: 'tokoA', label: 'Toko A (0,7 L) — kurang dari ¾ L' },
        { id: 'semua', label: 'Semua botol sama saja' },
      ],
      correct: 'tokoC',
      umpan: {
        tokoC: 'Tepat! 0,75 = 75/100 = ¾, jadi isinya pas tanpa sisa.',
        tokoB: '⅘ = 0,8 > 0,75. Botol ini cukup, tetapi bersisa. Yang diminta tepat tanpa sisa.',
        tokoA: '0,7 < 0,75, jadi botol Toko A tidak cukup untuk satu wadah.',
        semua: 'Isinya berbeda: 0,7 < 0,75 < 0,8. Ubah dulu ke bentuk yang sama.',
      },
    },
    judul3: 'Keputusan 3 — Urutkan kas dari yang paling jauh di bawah target',
    judul4: 'Alasan kelompok',
    tanyaAlasan: {
      id: 'k4',
      tanya: 'Kalimat alasan mana yang paling tepat ditulis di Papan Keputusan?',
      opsi: [
        {
          id: 'tepat',
          label:
            'Semua bilangan kami ubah ke bentuk yang sama, lalu kami bandingkan letaknya pada garis bilangan: makin kiri makin kecil.',
        },
        {
          id: 'angka',
          label: 'Kami membandingkan angka yang tertulis tanpa melihat tanda dan bentuknya.',
        },
        { id: 'panjang', label: 'Bilangan yang angkanya lebih banyak kami anggap lebih besar.' },
        { id: 'tebak', label: 'Kami memilih berdasarkan perkiraan saja.' },
      ],
      correct: 'tepat',
      umpan: {
        tepat: 'Tepat! Alasan ini menjelaskan strategi dan dapat diperiksa kelompok lain.',
        angka:
          'Cara ini keliru untuk bilangan negatif dan bentuk berbeda: −3½ justru lebih kecil daripada −2,5.',
        panjang: 'Banyaknya angka tidak menentukan besar kecilnya: 0,25 < ½.',
        tebak: 'Keputusan perlu alasan matematis yang bisa diperiksa, bukan perkiraan.',
      },
    },
    pesanLabel: 'Tulis pesan kelompokmu untuk panitia (satu atau dua kalimat).',
    pesanPlaceholder:
      'Contoh: Simpan es di freezer, beli sirup di Toko C, dan bantu Kelompok Jeruk.',
    posterJudul: 'Papan Keputusan Stand Es Buah 7B',
    posterFooter: 'Disusun dari hasil penyelidikan kelompok — siap dipresentasikan.',
    nextLabel: 'Lanjut: Evaluasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENGANALISIS & MENGEVALUASI (PBL sintaks 5)
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 7 · Analisis & Evaluasi',
    syntax: PBL + ' · Sintaks 5',
    goal: 'Menilai pendapat teman, membandingkan dugaan awal dengan hasil penyelidikan, dan menyusun simpulan.',
    guru: 'Gunakan pendapat yang keliru sebagai bahan diskusi kelas: minta murid menunjukkan letak kekeliruannya pada garis bilangan. Sebelum menyusun simpulan, tanyakan strategi mana yang paling membantu kelompok.',
    judulA: 'A. Tepat atau keliru?',
    opsiPendapat: [
      { id: 'tepat', label: 'Tepat' },
      { id: 'keliru', label: 'Keliru' },
    ],
    pendapat: [
      {
        id: 'e1',
        teks: 'Rina: "−4 °C lebih dingin daripada −3½ °C."',
        a: '-4',
        b: '-3 1/2',
        klaim: 'lt',
        correct: 'tepat',
        explanation: '−4 terletak di kiri −3½ = −3,5, jadi −4 < −3½ (lebih dingin).',
      },
      {
        id: 'e2',
        teks: 'Budi: "½ < 0,25 karena 2 < 25."',
        a: '1/2',
        b: '0,25',
        klaim: 'lt',
        correct: 'keliru',
        explanation: '½ = 0,5 dan 0,5 > 0,25. Angka yang tampak tidak boleh dibandingkan langsung.',
      },
      {
        id: 'e3',
        teks: 'Sari: "0,75 L sama banyak dengan ¾ L."',
        a: '0,75',
        b: '3/4',
        klaim: 'eq',
        correct: 'tepat',
        explanation: '¾ = 75/100 = 0,75. Bentuknya berbeda, nilainya sama.',
      },
      {
        id: 'e4',
        teks: 'Doni: "−1,3 > −1¼ karena 1,3 > 1,25."',
        a: '-1,3',
        b: '-1 1/4',
        klaim: 'gt',
        correct: 'keliru',
        explanation:
          'Untuk bilangan negatif, yang lebih dekat ke 0 lebih besar: −1,25 > −1,3, jadi −1,3 < −1¼.',
      },
      {
        id: 'e5',
        teks: 'Tia: "−2,5 < ⅛ karena bilangan negatif selalu lebih kecil daripada bilangan positif."',
        a: '-2,5',
        b: '1/8',
        klaim: 'lt',
        correct: 'tepat',
        explanation:
          'Bilangan negatif berada di kiri 0, bilangan positif di kanan 0. Jadi −2,5 < ⅛.',
      },
      {
        id: 'e6',
        teks: 'Fajar: "⅘ L lebih sedikit daripada 0,75 L karena 4 < 75."',
        a: '4/5',
        b: '0,75',
        klaim: 'lt',
        correct: 'keliru',
        explanation: '⅘ = 0,8 dan 0,8 > 0,75. Ubah ke bentuk yang sama sebelum membandingkan.',
      },
      {
        id: 'e7',
        teks: 'Wulan: "−18 sama dengan −18,0."',
        a: '-18',
        b: '-18,0',
        klaim: 'eq',
        correct: 'tepat',
        explanation: 'Menambah ,0 di belakang bilangan bulat tidak mengubah nilainya.',
      },
      {
        id: 'e8',
        teks: 'Eko: "⅓ > ½ karena penyebut 3 lebih besar daripada 2."',
        a: '1/3',
        b: '1/2',
        klaim: 'gt',
        correct: 'keliru',
        explanation: 'Penyebut lebih besar berarti potongan lebih kecil: ⅓ < ½.',
      },
    ],
    judulB: 'B. Dugaan awal vs hasil penyelidikan',
    judulC: 'C. Susun simpulan kelompok',
    instruksiC:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai sekali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'Untuk membandingkan bilangan yang bentuknya berbeda,', correct: 'b1' },
      { id: 'k2', awal: 'Pada garis bilangan,', correct: 'b2' },
      { id: 'k3', awal: 'Di antara dua bilangan negatif,', correct: 'b3' },
      { id: 'k4', awal: 'Bilangan negatif, apa pun bentuknya,', correct: 'b4' },
    ],
    bank: [
      {
        id: 'b1',
        teks: 'ubah dulu ke bentuk yang sama, misalnya semuanya desimal atau pecahan berpenyebut sama.',
      },
      { id: 'b2', teks: 'bilangan yang letaknya lebih kanan selalu lebih besar.' },
      { id: 'b3', teks: 'yang lebih dekat ke nol adalah yang lebih besar.' },
      { id: 'b4', teks: 'selalu lebih kecil daripada nol dan bilangan positif.' },
      { id: 'x1', teks: 'yang angkanya lebih banyak adalah yang lebih besar.' },
      { id: 'x2', teks: 'yang angkanya (tanpa tanda) lebih besar adalah yang lebih besar.' },
      { id: 'x3', teks: 'bandingkan pembilang dengan angka di belakang koma secara langsung.' },
    ],
    rangkuman: [
      'Bilangan bulat, pecahan, dan desimal dapat dibandingkan setelah <strong>bentuknya disamakan</strong>: ¾ = 0,75, −3½ = −3,5, −4 = −4,0.',
      'Pecahan → desimal: jadikan penyebutnya 10, 100, atau 1000. Desimal → pecahan: banyak angka di belakang koma menentukan penyebutnya.',
      'Pada garis bilangan, <strong>makin kanan makin besar</strong>. Bilangan negatif selalu lebih kecil daripada nol dan bilangan positif.',
      'Untuk dua bilangan negatif, yang <strong>lebih dekat ke nol</strong> lebih besar: −1¼ > −1,3.',
      'Hasil perbandingan diberi makna sesuai konteks: lebih dingin, lebih banyak, lebih baik hasilnya.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP (masalah baru)
     Delapan soal diambil acak dari bank dua belas soal.
     Teks memakai token {a/b} untuk pecahan bersusun.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: PBL + ' · Masalah baru',
    goal: 'Menerapkan cara membandingkan bilangan bulat, pecahan, dan desimal pada masalah baru.',
    guru: 'Murid mengerjakan secara mandiri. Amati soal mana yang sering meminta petunjuk; bahas satu soal dengan diagnosa terbanyak di akhir tahap.',
    instruksi:
      'Kerjakan secara mandiri. Soal pilihan ganda hanya bisa dijawab sekali; soal isian boleh dicoba lagi dan ada petunjuk.',
    banyak: 8,
    komposisi: { choice: 6, isian: 2 },
    soal: [
      {
        id: 't1',
        type: 'choice',
        cerita: 'Suhu pagi ini: Dieng −{1 1/2} °C, Lembang 2,5 °C, Bromo −2 °C.',
        pertanyaan: 'Kota mana yang paling dingin?',
        nilai: ['-1 1/2', '2,5', '-2'],
        options: [
          { id: 'bromo', label: 'Bromo (−2 °C)' },
          { id: 'dieng', label: 'Dieng (−1½ °C)' },
          { id: 'lembang', label: 'Lembang (2,5 °C)' },
          { id: 'sama', label: 'Dieng dan Bromo sama dinginnya' },
        ],
        correct: 'bromo',
        explanation: '−2 < −1,5 < 2,5. Suhu terkecil paling dingin, jadi Bromo.',
      },
      {
        id: 't2',
        type: 'choice',
        cerita: 'Tiga penyelam berada di kedalaman: Ayu −12 m, Bima −12,5 m, Candra −{12 1/4} m.',
        pertanyaan: 'Siapa yang berada paling dalam?',
        nilai: ['-12', '-12,5', '-12 1/4'],
        options: [
          { id: 'bima', label: 'Bima (−12,5 m)' },
          { id: 'candra', label: 'Candra (−12¼ m)' },
          { id: 'ayu', label: 'Ayu (−12 m)' },
          { id: 'sama', label: 'Ketiganya sama dalam' },
        ],
        correct: 'bima',
        explanation: '−12¼ = −12,25. Urutannya −12,5 < −12,25 < −12, jadi Bima paling dalam.',
      },
      {
        id: 't3',
        type: 'choice',
        cerita: 'Panjang pita tiga peserta: Ani {1 3/4} m, Budi 1,8 m, Cici 1,7 m.',
        pertanyaan: 'Pita siapa yang paling panjang?',
        nilai: ['1 3/4', '1,8', '1,7'],
        options: [
          { id: 'budi', label: 'Budi (1,8 m)' },
          { id: 'ani', label: 'Ani (1¾ m)' },
          { id: 'cici', label: 'Cici (1,7 m)' },
          { id: 'sama', label: 'Ani dan Budi sama panjang' },
        ],
        correct: 'budi',
        explanation: '1¾ = 1,75. Jadi 1,7 < 1,75 < 1,8 — pita Budi paling panjang.',
      },
      {
        id: 't4',
        type: 'choice',
        cerita: 'Pada kalimat {2/5} ☐ 0,4, kotak diisi lambang …',
        pertanyaan: 'Lambang yang tepat adalah …',
        nilai: ['2/5', '0,4'],
        options: [
          { id: 'eq', label: '=' },
          { id: 'lt', label: '<' },
          { id: 'gt', label: '>' },
          { id: 'tidak', label: 'Tidak bisa dibandingkan' },
        ],
        correct: 'eq',
        explanation: '⅖ = 4/10 = 0,4, jadi ⅖ = 0,4.',
      },
      {
        id: 't5',
        type: 'choice',
        cerita:
          'Selisih keuangan dua kelompok terhadap target: Kelompok P −0,75 juta, Kelompok Q −{2/3} juta.',
        pertanyaan: 'Pernyataan yang benar adalah …',
        nilai: ['-0,75', '-2/3'],
        options: [
          { id: 'q', label: '−⅔ > −0,75, jadi Kelompok Q lebih dekat ke target' },
          { id: 'p', label: '−0,75 > −⅔, jadi Kelompok P lebih dekat ke target' },
          { id: 'sama', label: '−0,75 = −⅔' },
          {
            id: 'tidak',
            label: 'Tidak bisa dibandingkan karena ⅔ tidak bisa ditulis desimal berhenti',
          },
        ],
        correct: 'q',
        explanation:
          'Samakan penyebut: −⅔ = −8/12 dan −0,75 = −¾ = −9/12. −8/12 > −9/12, jadi −⅔ > −0,75.',
      },
      {
        id: 't6',
        type: 'choice',
        cerita: 'Empat bilangan: −0,5; −{3/4}; 0,2; {1/4}.',
        pertanyaan: 'Urutan dari yang terkecil adalah …',
        nilai: ['-0,5', '-3/4', '0,2', '1/4'],
        urutNaik: true,
        options: [
          { id: 'benar', label: '−¾; −0,5; 0,2; ¼' },
          { id: 'abaikan', label: '−0,5; −¾; 0,2; ¼' },
          { id: 'balik', label: '¼; 0,2; −0,5; −¾' },
          { id: 'angka', label: '0,2; ¼; −0,5; −¾' },
        ],
        correct: 'benar',
        explanation: '−¾ = −0,75 dan ¼ = 0,25. Jadi −0,75 < −0,5 < 0,2 < 0,25.',
      },
      {
        id: 't7',
        type: 'choice',
        cerita: 'Empat bilangan: 1,2; {1 1/3}; −1,5; −{1 1/4}.',
        pertanyaan: 'Urutan dari yang terbesar adalah …',
        nilai: ['1,2', '1 1/3', '-1,5', '-1 1/4'],
        urutTurun: true,
        options: [
          { id: 'benar', label: '1⅓; 1,2; −1¼; −1,5' },
          { id: 'abaikan', label: '1⅓; 1,2; −1,5; −1¼' },
          { id: 'desimal', label: '1,2; 1⅓; −1¼; −1,5' },
          { id: 'balik', label: '−1,5; −1¼; 1,2; 1⅓' },
        ],
        correct: 'benar',
        explanation: '1⅓ = 1,333… > 1,2 dan −1¼ = −1,25 > −1,5.',
      },
      {
        id: 't8',
        type: 'choice',
        cerita: 'Pada garis bilangan, Rafi menandai beberapa titik.',
        pertanyaan: 'Bilangan mana yang terletak di antara −1 dan 0?',
        nilai: ['-0,3', '-1,3', '3/10', '-4/3'],
        options: [
          { id: 'benar', label: '−0,3' },
          { id: 'min13', label: '−1,3' },
          { id: 'positif', label: '3/10' },
          { id: 'min43', label: '−4/3' },
        ],
        correct: 'benar',
        explanation:
          '−1 < −0,3 < 0. Sementara −1,3 dan −4/3 lebih kecil dari −1, dan 3/10 lebih besar dari 0.',
      },
      {
        id: 't9',
        type: 'choice',
        cerita: 'Bu Ina membeli gula {5/8} kg, Pak Anto 0,6 kg, dan Bu Rini {3/5} kg.',
        pertanyaan: 'Pernyataan yang benar adalah …',
        nilai: ['5/8', '0,6', '3/5'],
        options: [
          {
            id: 'benar',
            label: 'Gula Pak Anto sama berat dengan gula Bu Rini, dan gula Bu Ina paling berat',
          },
          { id: 'ina', label: 'Gula Bu Ina paling ringan karena 5 < 6' },
          { id: 'rini', label: 'Gula Bu Rini paling berat karena penyebutnya paling kecil' },
          { id: 'beda', label: 'Ketiganya berbeda berat' },
        ],
        correct: 'benar',
        explanation: '⅝ = 0,625 dan ⅗ = 0,6. Jadi 0,6 = ⅗ < 0,625 = ⅝.',
      },
      {
        id: 't10',
        type: 'input',
        mode: 'isian',
        bentuk: 'desimal',
        cerita:
          'Resep kue membutuhkan {7/8} kg tepung. Timbangan digital hanya menampilkan desimal.',
        pertanyaan: 'Tuliskan {7/8} dalam bentuk desimal.',
        jawab: '0,875',
        hints: ['Jadikan penyebutnya 1000: 7/8 = …/1000.', '8 × 125 = 1000, jadi 7/8 = 875/1000.'],
        reveal: '7/8 = 875/1000 = 0,875.',
        explanation: 'Timbangan akan menunjukkan 0,875 kg.',
      },
      {
        id: 't11',
        type: 'input',
        mode: 'isian',
        bentuk: 'desimal',
        cerita:
          'Suhu ruang pendingin tercatat −{2 1/4} °C. Termometer digital menampilkan desimal.',
        pertanyaan: 'Tuliskan −{2 1/4} dalam bentuk desimal.',
        jawab: '-2,25',
        hints: ['¼ = 25/100 = 0,25.', 'Jangan lupa tanda negatifnya ikut.'],
        reveal: '−2¼ = −2,25.',
        explanation: 'Termometer menunjukkan −2,25 °C.',
      },
      {
        id: 't12',
        type: 'input',
        mode: 'isian',
        bentuk: 'desimal',
        cerita: 'Pada survei, {3/20} murid memilih jus jambu.',
        pertanyaan: 'Tuliskan {3/20} dalam bentuk desimal.',
        jawab: '0,15',
        hints: ['Jadikan penyebutnya 100: 20 × 5 = 100.', '3/20 = 15/100.'],
        reveal: '3/20 = 15/100 = 0,15.',
        explanation: 'Bagian itu sama dengan 0,15.',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan strategi dan perasaan setelah menyelesaikan masalah stand.',
    guru: 'Beri waktu hening 3 menit untuk menulis. Minta 2–3 murid membagikan strategi favoritnya dan di mana mereka akan memakainya di luar sekolah.',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Strategi apa yang paling membantumu membandingkan bilangan yang bentuknya berbeda? Mengapa?',
        placeholder: 'Contoh: mengubah ke desimal, karena …',
      },
      {
        id: 'q2',
        teks: 'Kekeliruan apa yang tadi kamu atau temanmu alami, dan bagaimana kamu memperbaikinya?',
        placeholder: 'Contoh: mengira −3½ lebih besar dari −2,5 …',
      },
      {
        id: 'q3',
        teks: 'Di mana lagi kamu akan membandingkan bilangan bulat, pecahan, dan desimal dalam kehidupan sehari-hari?',
        placeholder: 'Contoh: membandingkan takaran resep, suhu, diskon …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu membandingkan bilangan bulat, pecahan, dan desimal sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '😊 Yakin — aku bisa mengerjakan sendiri' },
      { id: 'cukup', label: '🙂 Cukup — kadang masih perlu petunjuk' },
      { id: 'belum', label: '🤔 Belum yakin — aku perlu berlatih lagi' },
    ],
    nextLabel: 'Simpan Refleksi & Selesai →',
  },

  selesai: {
    judul: 'Keputusan Stand Beres!',
    teks: 'Kamu berhasil menyelesaikan masalah stand es buah dengan membandingkan bilangan bulat, pecahan, dan desimal secara terpadu.',
    contoh: [
      { ikon: '🧊', nama: 'Tempat paling dingin', a: '-18', b: '-2,5' },
      { ikon: '🥤', nama: 'Botol yang pas', a: '0,75', b: '3/4' },
      { ikon: '💰', nama: 'Kas lebih baik', a: '-1 1/4', b: '-1,3' },
    ],
    capaian: [
      'Mengubah pecahan ke desimal dan desimal ke pecahan tanpa mengubah nilainya.',
      'Menempatkan bilangan bulat, pecahan, dan desimal pada satu garis bilangan.',
      'Membandingkan dan mengurutkan bilangan yang bentuknya berbeda dengan lambang <, >, =.',
      'Mengambil keputusan dalam masalah sehari-hari berdasarkan hasil perbandingan.',
    ],
  },
};
