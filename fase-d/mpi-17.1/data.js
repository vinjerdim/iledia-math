'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Unsur-unsur Lingkaran pada Benda & Gambar di Sekitar —
   Fase D, SMP Kelas VIII · Topik 17

   Tujuan Pembelajaran:
   Mengidentifikasi unsur-unsur lingkaran (pusat, jari-jari, diameter,
   tali busur, busur, juring, tembereng) pada benda dan gambar di
   lingkungan sekitar.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahRuas' & 'olahDaerah'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi    (7')  — "Benda Bundar di Sekitar Kita": jam dinding,
                             roda sepeda, pizza, semangka, kipas lipat,
                             bianglala. Murid mengamati (bila ada, memegang
                             benda sungguhan) lalu MENDUGA nama bagian dan
                             ruas terpanjang (tidak dinilai).
     2. Masalah      (5')  — memilih pertanyaan inti penyelidikan, lalu
                             menulis hipotesis.
     3. Lab          (18') — Lab Lingkaran pada tutup panci berjari-jari
                             10 cm: memutar titik A dan B untuk membuat
                             ruas, garis lengkung, dan daerah; mengamati
                             bentuk, ujung/batas, panjang, dan apakah
                             melewati pusat; mencatat keenam unsur ke tabel
                             pengamatan.
     4a. Ruas Garis  (10') — dari tabel: jari-jari vs diameter vs tali
                             busur (d = 2r, diameter = tali busur
                             terpanjang), lalu memilah ruas pada benda.
     4b. Daerah      (10') — busur (lengkung) vs tali busur (lurus),
                             juring (2 jari-jari + busur) vs tembereng
                             (tali busur + busur), lalu memilah gambar.
     5. Verifikasi   (12') — benda BARU acak: menamai setiap bagian
                             bernomor, membandingkan dugaan awal, memilah
                             pernyataan benar/salah.
     6. Generalisasi (5')  — menyusun definisi ketujuh unsur.
     7. Uji terap    (10') — delapan soal diambil acak dari bank enam
                             belas soal (gambar, nama, pilihan, isian).
     8. Refleksi     (3')  — rekap, refleksi tertulis, penilaian diri.

   Kunci jawaban gambar TIDAK ditulis tangan: setiap bagian/butir
   menyimpan geometrinya (`el`, notasi engine seksi 84) dan app.js
   menghitung jenis unsurnya dengan jenisUnsurLingkaran(). Opsi soal
   gambar & nama dibangun engine (opsiUnsurLingkaran).

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Benda verifikasi dan
   soal uji terap juga diambil acak.

   Konsistensi kunci jawaban diuji tests/mpi-17.1-data.test.js terhadap
   engine seksi 84.
   ============================================================ */

var DL = 'Discovery Learning';
var PUSAT = { jarak: 0 };

var DATA = {
  meta: {
    judul: 'Unsur-unsur Lingkaran pada Benda & Gambar di Sekitar',
  },

  /* Label konteks soal (ikon + nama). */
  konteks: {
    dapur: { ikon: '🍳', nama: 'Dapur & Makanan' },
    rumah: { ikon: '🏠', nama: 'Rumah & Sekolah' },
    jalan: { ikon: '🚲', nama: 'Kendaraan' },
    taman: { ikon: '🎡', nama: 'Taman & Permainan' },
    konsep: { ikon: '⭕', nama: 'Konsep Lingkaran' },
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; dibandingkan dengan temuan pada tahap
     Verifikasi.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati benda-benda berbentuk lingkaran di sekitar kita, lalu menduga nama bagian-bagiannya.',
    tp: 'Mengidentifikasi unsur-unsur lingkaran (pusat, jari-jari, diameter, tali busur, busur, juring, tembereng) pada benda dan gambar di lingkungan sekitar.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menunjukkan titik pusat, jari-jari, diameter, dan tali busur pada benda atau gambar lingkaran.',
      'Membedakan busur (garis lengkung) dengan tali busur (ruas garis lurus).',
      'Membedakan juring dengan tembereng berdasarkan garis yang membatasinya.',
      'Menjelaskan hubungan panjang jari-jari dan diameter (d = 2 × r).',
      'Menamai unsur-unsur lingkaran pada benda nyata di sekitar.',
    ],
    guru: 'Bawa benda bundar sungguhan: jam dinding, tutup panci, piring, atau roda mainan. Potong selembar kertas bundar seperti pizza bila memungkinkan. Biarkan murid menebak nama bagian dengan bahasa mereka sendiri — jangan membenarkan dugaan dulu; dugaan yang berbeda-beda menjadi bahan penyelidikan.',
    judul: 'Benda Bundar di Sekitar Kita',
    pengantar:
      'Banyak benda di sekitar kita berbentuk lingkaran. Perhatikan bagian-bagiannya: ada yang berupa titik, garis lurus, garis lengkung, dan daerah. Apa nama bagian-bagian itu?',
    kartu: [
      {
        id: 'kJam',
        ikon: '🕰️',
        judul: 'Jam dinding',
        teks: 'Jarum jam berputar pada satu titik tengah dan ujungnya menyapu tepi jam.',
      },
      {
        id: 'kRoda',
        ikon: '🚲',
        judul: 'Roda sepeda',
        teks: 'Jeruji-jeruji menghubungkan as roda di tengah dengan pelek di tepi.',
      },
      {
        id: 'kPizza',
        ikon: '🍕',
        judul: 'Pizza',
        teks: 'Pizza dipotong dari tengah sehingga tiap potong lancip di ujungnya.',
      },
      {
        id: 'kSemangka',
        ikon: '🍉',
        judul: 'Irisan semangka',
        teks: 'Semangka bulat diiris lurus di dekat tepinya, tidak melewati tengah.',
      },
      {
        id: 'kKipas',
        ikon: '🪭',
        judul: 'Kipas lipat',
        teks: 'Saat dibuka, kipas membentang dari satu titik poros ke tepi yang melengkung.',
      },
      {
        id: 'kBianglala',
        ikon: '🎡',
        judul: 'Bianglala',
        teks: 'Kabin-kabin tergantung di tepi roda, rangkanya bertemu di poros tengah.',
      },
    ],
    dugaan: [
      {
        id: 'dJeruji',
        tanya:
          'Jeruji roda sepeda menghubungkan as (titik tengah roda) dengan pelek (tepi roda). Menurutmu, jeruji mewakili bagian lingkaran yang mana?',
        opsi: [
          { id: 'jariJari', label: 'Jari-jari' },
          { id: 'diameter', label: 'Diameter' },
          { id: 'taliBusur', label: 'Tali busur' },
          { id: 'busur', label: 'Busur' },
        ],
        baku: 'jariJari',
        temuan:
          'Jeruji berawal di titik pusat (as) dan berakhir pada lingkaran (pelek), jadi jeruji adalah jari-jari.',
      },
      {
        id: 'dPizza',
        tanya: 'Sepotong pizza yang dipotong dari tengah berbentuk daerah apa? Boleh menebak.',
        opsi: [
          { id: 'juring', label: 'Juring' },
          { id: 'tembereng', label: 'Tembereng' },
          { id: 'busur', label: 'Busur' },
          { id: 'taliBusur', label: 'Tali busur' },
        ],
        baku: 'juring',
        temuan:
          'Sepotong pizza dibatasi dua jari-jari (garis potong dari tengah) dan sebuah busur (pinggiran), jadi bentuknya juring.',
      },
      {
        id: 'dTerpanjang',
        tanya:
          'Di antara semua ruas garis yang menghubungkan dua titik pada tepi tutup panci, ruas mana yang paling panjang?',
        opsi: [
          { id: 'lewatPusat', label: 'Ruas yang melewati titik tengah tutup' },
          { id: 'dekatTepi', label: 'Ruas yang paling dekat dengan tepi' },
          { id: 'samaSemua', label: 'Semua ruas sama panjang' },
          { id: 'tidakAda', label: 'Tidak ada yang terpanjang, bergantung letak titiknya' },
        ],
        baku: 'lewatPusat',
        temuan:
          'Tali busur terpanjang adalah yang melewati titik pusat, yaitu diameter (20 cm di Lab, dua kali jari-jari).',
      },
    ],
    catatan:
      'Dugaanmu belum dinilai. Kamu akan menyelidikinya di Lab Lingkaran, lalu membandingkannya dengan temuanmu pada tahap Verifikasi.',
    nextLabel: 'Lanjut ke Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan yang akan diselidiki tentang bagian-bagian lingkaran.',
    guru: 'Ajak murid membandingkan dugaan mereka di tahap Stimulasi: apakah semua pasangan memberi nama yang sama? Arahkan agar pertanyaan inti berfokus pada CIRI setiap bagian, bukan sekadar hafalan nama.',
    pengantar:
      'Teman-temanmu memberi nama berbeda untuk bagian yang sama: ada yang menyebut jeruji "diameter", ada yang menyebut potongan pizza "tembereng". Supaya tidak keliru, kita perlu tahu ciri setiap bagian lingkaran.',
    pertanyaan: 'Pertanyaan apa yang paling tepat untuk diselidiki hari ini?',
    opsi: [
      {
        id: 'ciri',
        label:
          'Apa saja unsur lingkaran, apa ciri setiap unsur, dan di mana kita menemukannya pada benda di sekitar?',
      },
      { id: 'luas', label: 'Berapa luas sebuah pizza berdiameter 30 cm?' },
      { id: 'jangka', label: 'Bagaimana cara menggambar lingkaran dengan jangka?' },
      { id: 'mahal', label: 'Benda bundar manakah yang paling mahal harganya?' },
    ],
    correct: 'ciri',
    umpan: {
      ciri: 'Tepat! Pertanyaan ini membantu kita mengenali setiap unsur dari cirinya, bukan hanya dari namanya.',
      luas: 'Luas lingkaran akan dipelajari nanti. Untuk menghitungnya pun kita perlu mengenal jari-jari dan diameter lebih dulu.',
      jangka:
        'Menggambar dengan jangka itu keterampilan yang berguna, tetapi belum menjawab perbedaan nama bagian-bagian lingkaran.',
      mahal: 'Harga bukan persoalan matematika lingkaran. Fokuslah pada bagian-bagian bentuknya.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu, apa yang membedakan jari-jari, diameter, dan tali busur?',
    hipotesisPlaceholder: 'Contoh: Menurutku jari-jari berawal dari tengah, sedangkan diameter …',
    nextLabel: 'Mulai Menyelidiki →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA (Lab Lingkaran)
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Membuat berbagai ruas, garis lengkung, dan daerah pada lingkaran, lalu mencatat cirinya.',
    guru: 'Minta setiap pasangan bergantian: satu memutar titik, satu mencatat. Ajukan pertanyaan pancingan: "Apa yang terjadi pada panjang ruas saat titik B diputar mendekati seberang titik A?" Jangan menjelaskan definisi dulu — biarkan tabel pengamatan berbicara.',
    judul: 'Lab Lingkaran: Tutup Panci',
    instruksi:
      'Tutup panci ini berjari-jari 10 cm dengan titik pusat O. Pilih yang ingin kamu buat, putar titik A dan B, amati namanya beserta cirinya, lalu tekan "Catat ke tabel". Selesaikan keenam misi.',
    lab: {
      r: 10,
      satuan: 'cm',
      langkah: 15,
      dekor: 'tutup',
      wajib: ['jariJari', 'diameter', 'taliBusur', 'busur', 'juring', 'tembereng'],
      misi: [
        { id: 'jariJari', teks: 'Buat ruas dari titik pusat ke sebuah titik pada lingkaran.' },
        { id: 'diameter', teks: 'Buat ruas antara dua titik pada lingkaran yang melewati pusat.' },
        {
          id: 'taliBusur',
          teks: 'Buat ruas antara dua titik pada lingkaran yang TIDAK melewati pusat.',
        },
        { id: 'busur', teks: 'Buat garis lengkung di antara dua titik pada lingkaran.' },
        { id: 'juring', teks: 'Buat daerah yang dibatasi dua jari-jari dan sebuah busur.' },
        { id: 'tembereng', teks: 'Buat daerah yang dibatasi sebuah tali busur dan busur.' },
      ],
    },
    tabelJudul: 'Tabel pengamatan',
    temuan:
      'Semua misi selesai! Perhatikan tabelmu: setiap unsur punya ciri yang berbeda — bentuknya (lurus, lengkung, daerah), ujung atau batasnya, dan panjangnya.',
    nextLabel: 'Olah Data Ruas Garis →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — OLAH DATA: RUAS GARIS
     ---------------------------------------------------------- */
  olahRuas: {
    kicker: 'Tahap 4a · Pengolahan Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan ciri pembeda jari-jari, diameter, dan tali busur dari tabel pengamatan.',
    guru: 'Tampilkan tabel salah satu pasangan di layar. Tanyakan: "Jika jari-jari tutup panci 10 cm, berapa diameternya? Mengapa?" Tekankan bahwa diameter adalah tali busur istimewa — semua diameter adalah tali busur, tetapi tidak semua tali busur adalah diameter.',
    instruksi: 'Gunakan tabel pengamatanmu untuk menjawab pertanyaan berikut.',
    pertanyaan: [
      {
        id: 'rUjung',
        tanya:
          'Ruas manakah yang salah satu ujungnya tepat di titik pusat dan ujung lainnya pada lingkaran?',
        opsi: [
          { id: 'jariJari', label: 'Jari-jari' },
          { id: 'diameter', label: 'Diameter' },
          { id: 'taliBusur', label: 'Tali busur' },
          { id: 'bukan', label: 'Ruas dari titik di dalam lingkaran' },
        ],
        correct: 'jariJari',
        umpan: {
          jariJari: 'Tepat! Jari-jari berawal di titik pusat dan berakhir pada lingkaran.',
          diameter:
            'Diameter melewati pusat, tetapi kedua ujungnya pada lingkaran — pusat ada di tengahnya, bukan di ujungnya.',
          taliBusur: 'Kedua ujung tali busur terletak pada lingkaran, bukan di pusat.',
          bukan:
            'Ruas itu berawal dari titik di dalam lingkaran yang BUKAN pusat. Cari ruas yang berawal tepat di pusat.',
        },
      },
      {
        id: 'rDuaKali',
        tanya: 'Bandingkan panjang jari-jari dan diameter pada tabelmu. Apa hubungannya?',
        opsi: [
          { id: 'duaKali', label: 'Diameter = 2 × jari-jari' },
          { id: 'tambahDua', label: 'Diameter = jari-jari + 2' },
          { id: 'setengah', label: 'Diameter = jari-jari : 2' },
          { id: 'sama', label: 'Diameter sama panjang dengan jari-jari' },
        ],
        correct: 'duaKali',
        umpan: {
          duaKali:
            'Tepat! Diameter tersusun dari dua jari-jari yang segaris: 10 cm + 10 cm = 20 cm. Jadi d = 2 × r.',
          tambahDua: 'Coba periksa tabel: jari-jari 10 cm, diameter 20 cm. Selisihnya 10, bukan 2.',
          setengah: 'Terbalik. Diameter lebih panjang daripada jari-jari, bukan lebih pendek.',
          sama: 'Lihat lagi kolom panjang: jari-jari 10 cm, diameter 20 cm.',
        },
      },
      {
        id: 'rTerpanjang',
        tanya:
          'Di Lab, putar titik B pada ruas "lingkaran ke lingkaran". Kapan ruasnya paling panjang?',
        opsi: [
          { id: 'lewatPusat', label: 'Saat ruas melewati titik pusat (menjadi diameter)' },
          { id: 'dekat', label: 'Saat titik A dan B berdekatan' },
          { id: 'selalu', label: 'Panjangnya selalu sama di mana pun titik B' },
          { id: 'tegak', label: 'Saat ruasnya mendatar' },
        ],
        correct: 'lewatPusat',
        umpan: {
          lewatPusat:
            'Tepat! Tali busur terpanjang adalah diameter, panjangnya 20 cm. Tali busur lain lebih pendek.',
          dekat:
            'Saat A dan B berdekatan, ruasnya justru sangat pendek. Coba putar B ke seberang A.',
          selalu: 'Coba putar titik B dan amati angka panjangnya. Panjangnya berubah-ubah.',
          tegak:
            'Arah ruas tidak penting. Yang menentukan adalah apakah ruas melewati titik pusat.',
        },
      },
      {
        id: 'rDiameterTali',
        tanya: 'Kedua ujung diameter juga terletak pada lingkaran. Jadi, diameter termasuk …',
        opsi: [
          { id: 'taliKhusus', label: 'tali busur istimewa, yaitu yang melewati pusat' },
          { id: 'jari', label: 'jari-jari yang panjang' },
          { id: 'busur', label: 'busur terbesar' },
          { id: 'bukan', label: 'bukan unsur lingkaran' },
        ],
        correct: 'taliKhusus',
        umpan: {
          taliKhusus:
            'Tepat! Setiap diameter adalah tali busur, tetapi tidak setiap tali busur adalah diameter.',
          jari: 'Jari-jari berawal di pusat. Diameter berawal dan berakhir pada lingkaran.',
          busur: 'Busur berupa garis lengkung, sedangkan diameter berupa ruas garis lurus.',
          bukan:
            'Diameter jelas unsur lingkaran. Perhatikan kedua ujungnya: apa nama ruas yang menghubungkan dua titik pada lingkaran?',
        },
      },
    ],
    temuan: [
      {
        label: 'Titik pusat',
        teks: 'Titik tengah yang jaraknya sama ke setiap titik pada lingkaran.',
      },
      { label: 'Jari-jari (r)', teks: 'Ruas dari titik pusat ke sebuah titik pada lingkaran.' },
      {
        label: 'Tali busur',
        teks: 'Ruas garis lurus yang menghubungkan dua titik pada lingkaran.',
      },
      {
        label: 'Diameter (d)',
        teks: 'Tali busur yang melewati titik pusat; tali busur terpanjang, d = 2 × r.',
      },
    ],
    pilahJudul: 'Pilah ruas pada benda',
    pilahInstruksi: 'Setiap gambar menyorot sebuah ruas berwarna oranye. Apa namanya?',
    kategori: [
      { id: 'jariJari', label: 'Jari-jari' },
      { id: 'diameter', label: 'Diameter' },
      { id: 'taliBusur', label: 'Tali busur' },
      { id: 'bukan', label: 'Bukan unsur lingkaran' },
    ],
    pilah: [
      {
        id: 'prJeruji',
        teks: 'Sebuah jeruji roda sepeda, dari as roda ke pelek.',
        el: { tipe: 'ruas', u: PUSAT, v: { sudut: 60 } },
        correct: 'jariJari',
        explanation:
          'Jeruji berawal di titik pusat (as roda) dan berakhir pada lingkaran (pelek), jadi jari-jari.',
      },
      {
        id: 'prBolu',
        teks: 'Garis potong kue bolu bulat dari tepi ke tepi, tepat melewati tengahnya.',
        el: { tipe: 'ruas', u: { sudut: 150 }, v: { sudut: 330 } },
        correct: 'diameter',
        explanation: 'Kedua ujungnya pada lingkaran dan melewati titik pusat, jadi diameter.',
      },
      {
        id: 'prKabin',
        teks: 'Tongkat penguat yang menghubungkan dua kabin bianglala yang berdekatan.',
        el: { tipe: 'ruas', u: { sudut: 30 }, v: { sudut: 105 } },
        correct: 'taliBusur',
        explanation: 'Kedua ujungnya pada lingkaran tetapi tidak melewati pusat, jadi tali busur.',
      },
      {
        id: 'prJarum',
        teks: 'Jarum panjang jam dinding yang menunjuk angka 12.',
        el: { tipe: 'ruas', u: PUSAT, v: { sudut: 90 } },
        correct: 'jariJari',
        explanation:
          'Jarum berputar pada titik pusat dan ujungnya mencapai tepi jam, jadi jari-jari.',
      },
      {
        id: 'prDalam',
        teks: 'Ruas dari titik A (di dalam lingkaran, tetapi bukan pusat) ke tepi lingkaran.',
        el: { tipe: 'ruas', u: { sudut: 200, jarak: 0.5 }, v: { sudut: 60 } },
        correct: 'bukan',
        explanation:
          'Satu ujungnya bukan pusat dan bukan pada lingkaran. Ruas seperti ini tidak punya nama khusus sebagai unsur lingkaran.',
      },
      {
        id: 'prSemangka',
        teks: 'Garis irisan lurus pada semangka yang memotong tepinya di dua titik, tidak lewat tengah.',
        el: { tipe: 'ruas', u: { sudut: 200 }, v: { sudut: 320 } },
        correct: 'taliBusur',
        explanation:
          'Ruas lurus yang menghubungkan dua titik pada lingkaran tanpa melewati pusat adalah tali busur.',
      },
      {
        id: 'prPiring',
        teks: 'Sumpit yang diletakkan melintang tepat di tengah piring, ujung-ujungnya di tepi piring.',
        el: { tipe: 'ruas', u: { sudut: 75 }, v: { sudut: 255 } },
        correct: 'diameter',
        explanation:
          'Sumpit menghubungkan dua titik pada tepi piring dan melewati pusatnya, jadi diameter.',
      },
    ],
    nextLabel: 'Olah Data Daerah →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — OLAH DATA: BUSUR & DAERAH
     ---------------------------------------------------------- */
  olahDaerah: {
    kicker: 'Tahap 4b · Pengolahan Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan ciri pembeda busur, tali busur, juring, dan tembereng.',
    guru: 'Peragakan dengan kertas bundar: potong dua kali dari tengah (juring), lalu potong lurus di dekat tepi (tembereng). Minta murid menelusuri batas tiap potongan dengan jari. Ingatkan bahwa juring tidak harus kecil — sisa pizza setelah satu potong diambil juga juring.',
    instruksi: 'Lihat lagi baris busur, juring, dan tembereng pada tabel pengamatanmu.',
    pertanyaan: [
      {
        id: 'dLengkung',
        tanya: 'Apa beda busur dengan tali busur?',
        opsi: [
          { id: 'lengkung', label: 'Busur melengkung (bagian dari lingkaran), tali busur lurus' },
          { id: 'terbalik', label: 'Busur lurus, tali busur melengkung' },
          { id: 'panjang', label: 'Busur selalu lebih pendek daripada tali busurnya' },
          { id: 'sama', label: 'Tidak ada bedanya, hanya namanya' },
        ],
        correct: 'lengkung',
        umpan: {
          lengkung:
            'Tepat! Busur adalah bagian dari lingkaran itu sendiri; tali busur adalah ruas lurus yang menghubungkan kedua ujung busur.',
          terbalik: 'Terbalik. Lihat kolom "Bentuk": busur tercatat sebagai garis lengkung.',
          panjang:
            'Justru sebaliknya: garis lengkung di antara dua titik selalu lebih panjang daripada ruas lurusnya.',
          sama: 'Bentuknya berbeda: satu lengkung, satu lurus. Lihat kolom "Bentuk".',
        },
      },
      {
        id: 'dJuring',
        tanya: 'Juring adalah daerah yang dibatasi oleh …',
        opsi: [
          { id: 'duaJari', label: 'dua jari-jari dan sebuah busur' },
          { id: 'taliBusur', label: 'sebuah tali busur dan busurnya' },
          { id: 'duaTali', label: 'dua tali busur' },
          { id: 'duaDiameter', label: 'dua diameter' },
        ],
        correct: 'duaJari',
        umpan: {
          duaJari:
            'Tepat! Karena dibatasi dua jari-jari, juring selalu "lancip" di titik pusat — seperti potongan pizza.',
          taliBusur:
            'Itu batas tembereng. Lihat baris juring di tabel: dibatasi dua jari-jari dan satu busur.',
          duaTali: 'Daerah juring menyentuh titik pusat. Ruas apa yang berawal di pusat?',
          duaDiameter:
            'Dua diameter membagi lingkaran menjadi empat bagian; batas tiap bagian adalah jari-jari, bukan diameter utuh.',
        },
      },
      {
        id: 'dTembereng',
        tanya: 'Tembereng adalah daerah yang dibatasi oleh …',
        opsi: [
          { id: 'taliBusur', label: 'sebuah tali busur dan busurnya' },
          { id: 'duaJari', label: 'dua jari-jari dan sebuah busur' },
          { id: 'jariTali', label: 'sebuah jari-jari dan sebuah tali busur' },
          { id: 'busurSaja', label: 'busur saja' },
        ],
        correct: 'taliBusur',
        umpan: {
          taliBusur:
            'Tepat! Tembereng seperti irisan tepi semangka: satu sisi lurus (tali busur), satu sisi lengkung (busur).',
          duaJari: 'Itu batas juring. Tembereng tidak menyentuh titik pusat.',
          jariTali:
            'Coba lihat lagi di Lab: daerah "satu tali busur" hanya punya dua batas, satu lurus dan satu lengkung.',
          busurSaja:
            'Busur saja tidak menutup sebuah daerah. Perlu ruas lurus yang menghubungkan kedua ujungnya.',
        },
      },
      {
        id: 'dLancip',
        tanya: 'Daerah mana yang selalu mempunyai titik sudut di titik pusat lingkaran?',
        opsi: [
          { id: 'juring', label: 'Juring' },
          { id: 'tembereng', label: 'Tembereng' },
          { id: 'busur', label: 'Busur' },
          { id: 'tidakAda', label: 'Tidak ada' },
        ],
        correct: 'juring',
        umpan: {
          juring: 'Tepat! Kedua jari-jari pembatas juring bertemu di titik pusat.',
          tembereng:
            'Batas tembereng adalah tali busur dan busur; keduanya tidak melalui titik pusat.',
          busur: 'Busur adalah garis lengkung, bukan daerah.',
          tidakAda:
            'Ada satu daerah yang dibatasi dua jari-jari. Di mana kedua jari-jari itu bertemu?',
        },
      },
    ],
    temuan: [
      { label: 'Busur', teks: 'Garis lengkung yang merupakan bagian dari lingkaran.' },
      { label: 'Juring', teks: 'Daerah yang dibatasi dua jari-jari dan sebuah busur.' },
      { label: 'Tembereng', teks: 'Daerah yang dibatasi sebuah tali busur dan busurnya.' },
    ],
    pilahJudul: 'Pilah bagian pada benda',
    pilahInstruksi:
      'Setiap gambar menyorot sebuah garis lengkung atau daerah berwarna oranye. Apa namanya?',
    kategori: [
      { id: 'busur', label: 'Busur' },
      { id: 'juring', label: 'Juring' },
      { id: 'tembereng', label: 'Tembereng' },
    ],
    pilah: [
      {
        id: 'pdKulit',
        teks: 'Pinggiran (kulit roti) sepotong pizza.',
        el: { tipe: 'busur', a0: 60, a1: 120 },
        correct: 'busur',
        explanation:
          'Pinggiran pizza berupa garis lengkung yang merupakan bagian dari lingkaran, jadi busur.',
      },
      {
        id: 'pdPizza',
        teks: 'Sepotong pizza yang dipotong dari tengah.',
        el: { tipe: 'daerah', batas: 'jariJari', a0: 60, a1: 120 },
        correct: 'juring',
        explanation:
          'Dibatasi dua garis potong dari pusat (jari-jari) dan pinggiran (busur), jadi juring.',
      },
      {
        id: 'pdSemangka',
        teks: 'Irisan tepi semangka yang dipotong lurus, tidak lewat tengah.',
        el: { tipe: 'daerah', batas: 'taliBusur', a0: 200, a1: 300 },
        correct: 'tembereng',
        explanation:
          'Dibatasi garis potong lurus (tali busur) dan kulit semangka (busur), jadi tembereng.',
      },
      {
        id: 'pdKipas',
        teks: 'Bagian kipas lipat yang terbuka.',
        el: { tipe: 'daerah', batas: 'jariJari', a0: 30, a1: 150 },
        correct: 'juring',
        explanation:
          'Kipas membentang dari poros (pusat) dengan dua tulang tepi (jari-jari) dan tepi lengkung (busur), jadi juring.',
      },
      {
        id: 'pdJarum',
        teks: 'Lintasan ujung jarum jam dari angka 12 sampai angka 3.',
        el: { tipe: 'busur', a0: 0, a1: 90 },
        correct: 'busur',
        explanation: 'Ujung jarum menyapu tepi jam menurut garis lengkung — itu busur.',
      },
      {
        id: 'pdRoti',
        teks: 'Potongan kecil roti tawar bundar setelah dipotong lurus di dekat tepinya.',
        el: { tipe: 'daerah', batas: 'taliBusur', a0: 240, a1: 320 },
        correct: 'tembereng',
        explanation:
          'Batasnya satu potongan lurus (tali busur) dan tepi roti (busur), jadi tembereng.',
      },
      {
        id: 'pdSisa',
        teks: 'Sisa pizza setelah satu potong diambil.',
        el: { tipe: 'daerah', batas: 'jariJari', a0: 120, a1: 60 },
        correct: 'juring',
        explanation:
          'Sisa pizza tetap dibatasi dua jari-jari dan sebuah busur (busur besar). Juring tidak harus kecil!',
      },
    ],
    nextLabel: 'Lanjut ke Verifikasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — VERIFIKASI
     Benda baru diambil acak dari bank; kunci tiap bagian dihitung
     dari geometrinya.
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Menguji temuan pada benda baru dan membandingkannya dengan dugaan awal.',
    guru: 'Setiap murid mendapat benda acak yang berbeda. Minta pasangan saling menjelaskan alasan pilihannya dengan menyebut ciri (ujung di pusat? lurus atau lengkung? dibatasi apa?), bukan sekadar menyebut nama.',
    judulA: 'A. Benda baru: namai setiap bagian bernomor',
    instruksiA:
      'Bagian bernomor pada gambar berikut adalah unsur-unsur lingkaran. Pilih nama yang tepat untuk setiap nomor.',
    bank: [
      {
        id: 'bJam',
        ikon: '🕰️',
        nama: 'Jam dinding',
        cerita: 'Jam dinding kelas berbentuk lingkaran. Jarum-jarumnya berputar pada poros tengah.',
        dekor: 'jam',
        caption: 'Jam dinding dengan empat bagian bernomor',
        bagian: [
          { id: 'jamPoros', tag: '1', teks: 'Poros jarum jam', el: { tipe: 'titik', jarak: 0 } },
          {
            id: 'jamJarum',
            tag: '2',
            teks: 'Jarum panjang',
            el: { tipe: 'ruas', u: PUSAT, v: { sudut: 60 } },
          },
          {
            id: 'jamHias',
            tag: '3',
            teks: 'Garis hiasan dari angka 9 ke angka 3',
            el: { tipe: 'ruas', u: { sudut: 180 }, v: { sudut: 0 } },
          },
          {
            id: 'jamLintas',
            tag: '4',
            teks: 'Lintasan ujung jarum dari angka 6 ke angka 4',
            el: { tipe: 'busur', a0: 270, a1: 330 },
          },
        ],
      },
      {
        id: 'bRoda',
        ikon: '🚲',
        nama: 'Roda sepeda',
        cerita:
          'Roda sepeda berputar pada as di tengahnya. Ada jeruji dan kawat penguat di dalamnya.',
        dekor: 'roda',
        caption: 'Roda sepeda dengan empat bagian bernomor',
        bagian: [
          {
            id: 'rodaJeruji',
            tag: '1',
            teks: 'Jeruji',
            el: { tipe: 'ruas', u: PUSAT, v: { sudut: 210 } },
          },
          {
            id: 'rodaPelek',
            tag: '2',
            teks: 'Sebagian pelek',
            el: { tipe: 'busur', a0: 290, a1: 340 },
          },
          {
            id: 'rodaKawat',
            tag: '3',
            teks: 'Kawat penguat',
            el: { tipe: 'ruas', u: { sudut: 100 }, v: { sudut: 160 } },
          },
          {
            id: 'rodaCelah',
            tag: '4',
            teks: 'Celah di antara dua jeruji',
            el: { tipe: 'daerah', batas: 'jariJari', a0: 20, a1: 70 },
          },
        ],
      },
      {
        id: 'bPizza',
        ikon: '🍕',
        nama: 'Pizza',
        cerita: 'Sebuah pizza bundar dipotong-potong untuk dibagikan.',
        dekor: 'pizza',
        caption: 'Pizza dengan empat bagian bernomor',
        bagian: [
          {
            id: 'pizzaPotong',
            tag: '1',
            teks: 'Sepotong pizza',
            el: { tipe: 'daerah', batas: 'jariJari', a0: 60, a1: 120 },
          },
          {
            id: 'pizzaKulit',
            tag: '2',
            teks: 'Pinggiran pizza',
            el: { tipe: 'busur', a0: 200, a1: 250 },
          },
          {
            id: 'pizzaGaris',
            tag: '3',
            teks: 'Garis potong dari tepi ke tepi melewati tengah',
            el: { tipe: 'ruas', u: { sudut: 160 }, v: { sudut: 340 } },
          },
          {
            id: 'pizzaPisau',
            tag: '4',
            teks: 'Garis potong dari tengah ke tepi',
            el: { tipe: 'ruas', u: PUSAT, v: { sudut: 280 } },
          },
        ],
      },
      {
        id: 'bSemangka',
        ikon: '🍉',
        nama: 'Semangka',
        cerita: 'Penampang semangka berbentuk lingkaran. Satu sisinya diiris lurus.',
        dekor: 'semangka',
        caption: 'Penampang semangka dengan empat bagian bernomor',
        bagian: [
          {
            id: 'smIris',
            tag: '1',
            teks: 'Irisan tepi',
            el: { tipe: 'daerah', batas: 'taliBusur', a0: 210, a1: 310 },
          },
          {
            id: 'smGaris',
            tag: '2',
            teks: 'Garis irisan lain',
            el: { tipe: 'ruas', u: { sudut: 40 }, v: { sudut: 130 } },
          },
          { id: 'smTengah', tag: '3', teks: 'Titik tengah', el: { tipe: 'titik', jarak: 0 } },
          {
            id: 'smKulit',
            tag: '4',
            teks: 'Sebagian kulit',
            el: { tipe: 'busur', a0: 330, a1: 20 },
          },
        ],
      },
      {
        id: 'bBianglala',
        ikon: '🎡',
        nama: 'Bianglala',
        cerita: 'Rangka bianglala bertemu di poros tengah, kabin-kabin tergantung di tepinya.',
        dekor: 'bianglala',
        caption: 'Bianglala dengan empat bagian bernomor',
        bagian: [
          {
            id: 'bgRangka',
            tag: '1',
            teks: 'Rangka dari kabin ke kabin melewati poros',
            el: { tipe: 'ruas', u: { sudut: 22.5 }, v: { sudut: 202.5 } },
          },
          {
            id: 'bgPenguat',
            tag: '2',
            teks: 'Tongkat penguat antara dua kabin',
            el: { tipe: 'ruas', u: { sudut: 112.5 }, v: { sudut: 157.5 } },
          },
          {
            id: 'bgLengan',
            tag: '3',
            teks: 'Lengan dari poros ke kabin',
            el: { tipe: 'ruas', u: PUSAT, v: { sudut: 292.5 } },
          },
          {
            id: 'bgPanel',
            tag: '4',
            teks: 'Panel hiasan di bawah tongkat penguat',
            el: { tipe: 'daerah', batas: 'taliBusur', a0: 112.5, a1: 157.5 },
          },
        ],
      },
      {
        id: 'bKipas',
        ikon: '🪭',
        nama: 'Kipas lipat',
        cerita: 'Kipas lipat terbuka membentang dari poros kecil di bawahnya.',
        dekor: 'kipas',
        caption: 'Kipas lipat dengan tiga bagian bernomor',
        bagian: [
          {
            id: 'kpKain',
            tag: '1',
            teks: 'Kain kipas yang terbuka',
            el: { tipe: 'daerah', batas: 'jariJari', a0: 20, a1: 160 },
          },
          {
            id: 'kpTulang',
            tag: '2',
            teks: 'Tulang tepi kipas',
            el: { tipe: 'ruas', u: PUSAT, v: { sudut: 20 } },
          },
          {
            id: 'kpTepi',
            tag: '3',
            teks: 'Tepi atas kipas',
            el: { tipe: 'busur', a0: 20, a1: 160 },
          },
        ],
      },
    ],
    judulB: 'B. Bandingkan dengan dugaan awalmu',
    judulC: 'C. Benar atau salah?',
    instruksiC: 'Putuskan apakah setiap pernyataan berikut benar atau salah.',
    opsiPernyataan: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'nDiameterTali',
        teks: 'Setiap diameter adalah tali busur.',
        correct: 'benar',
        explanation:
          'Kedua ujung diameter pada lingkaran, jadi diameter adalah tali busur yang melewati pusat.',
      },
      {
        id: 'nTaliDiameter',
        teks: 'Setiap tali busur adalah diameter.',
        correct: 'salah',
        explanation: 'Hanya tali busur yang melewati pusat yang disebut diameter.',
      },
      {
        id: 'nDuaKali',
        teks: 'Panjang diameter dua kali panjang jari-jari.',
        correct: 'benar',
        explanation: 'Diameter tersusun dari dua jari-jari yang segaris: d = 2 × r.',
      },
      {
        id: 'nBusurLurus',
        teks: 'Busur adalah ruas garis lurus yang menghubungkan dua titik pada lingkaran.',
        correct: 'salah',
        explanation: 'Itu ciri tali busur. Busur berupa garis lengkung, bagian dari lingkaran.',
      },
      {
        id: 'nJuringTali',
        teks: 'Juring dibatasi oleh sebuah tali busur dan busur.',
        correct: 'salah',
        explanation:
          'Juring dibatasi dua jari-jari dan sebuah busur. Yang dibatasi tali busur dan busur adalah tembereng.',
      },
      {
        id: 'nTemberengPusat',
        teks: 'Tembereng tidak dibatasi oleh jari-jari.',
        correct: 'benar',
        explanation: 'Batas tembereng hanya tali busur dan busur, tidak ada jari-jari.',
      },
      {
        id: 'nBanyakJari',
        teks: 'Sebuah lingkaran hanya mempunyai dua jari-jari.',
        correct: 'salah',
        explanation:
          'Dari titik pusat kita dapat menarik ruas ke titik mana pun pada lingkaran, jadi banyaknya jari-jari tak terhingga.',
      },
      {
        id: 'nPusatJarak',
        teks: 'Jarak titik pusat ke setiap titik pada lingkaran selalu sama.',
        correct: 'benar',
        explanation:
          'Jarak itu adalah panjang jari-jari, dan semua jari-jari sebuah lingkaran sama panjang.',
      },
    ],
    kesimpulan:
      'Temuanmu terbukti pada benda baru: unsur-unsur lingkaran dapat dikenali dari cirinya — ujungnya, bentuknya (lurus atau lengkung), dan garis yang membatasinya.',
    nextLabel: 'Susun Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — GENERALISASI
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Merumuskan pengertian ketujuh unsur lingkaran dengan kata-kata sendiri.',
    guru: 'Setelah kalimat tersusun, minta beberapa murid membacakan definisi lalu menunjukkan contohnya pada benda di kelas (jam, piring, tutup tempat sampah).',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai satu kali; ada dua potongan pengecoh.',
    selectPlaceholder: '— pilih —',
    kalimat: [
      { id: 'sPusat', awal: 'Titik pusat adalah', correct: 'gPusat' },
      { id: 'sJari', awal: 'Jari-jari adalah', correct: 'gJari' },
      { id: 'sDiameter', awal: 'Diameter adalah', correct: 'gDiameter' },
      { id: 'sTali', awal: 'Tali busur adalah', correct: 'gTali' },
      { id: 'sBusur', awal: 'Busur adalah', correct: 'gBusur' },
      { id: 'sJuring', awal: 'Juring adalah', correct: 'gJuring' },
      { id: 'sTembereng', awal: 'Tembereng adalah', correct: 'gTembereng' },
    ],
    bank: [
      {
        id: 'gPusat',
        teks: 'titik tengah yang jaraknya sama ke setiap titik pada lingkaran.',
      },
      { id: 'gJari', teks: 'ruas garis dari titik pusat ke sebuah titik pada lingkaran.' },
      {
        id: 'gDiameter',
        teks: 'tali busur yang melewati titik pusat; panjangnya dua kali jari-jari.',
      },
      { id: 'gTali', teks: 'ruas garis lurus yang menghubungkan dua titik pada lingkaran.' },
      { id: 'gBusur', teks: 'garis lengkung yang merupakan bagian dari lingkaran.' },
      { id: 'gJuring', teks: 'daerah yang dibatasi dua jari-jari dan sebuah busur.' },
      { id: 'gTembereng', teks: 'daerah yang dibatasi sebuah tali busur dan busurnya.' },
      { id: 'gxDalam', teks: 'ruas garis yang menghubungkan dua titik di dalam lingkaran.' },
      { id: 'gxDuaTali', teks: 'daerah yang dibatasi dua tali busur yang sejajar.' },
    ],
    rangkuman: [
      'Unsur berupa TITIK: titik pusat.',
      'Unsur berupa RUAS GARIS LURUS: jari-jari, diameter, dan tali busur. Diameter = tali busur terpanjang = 2 × jari-jari.',
      'Unsur berupa GARIS LENGKUNG: busur (busur kecil atau busur besar).',
      'Unsur berupa DAERAH: juring (dibatasi dua jari-jari + busur) dan tembereng (dibatasi tali busur + busur).',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     `banyak` soal diambil acak dari bank sesuai `komposisi`.
     'gambar' : kunci = jenis unsur yang disorot (dihitung engine)
     'nama'   : kunci = `kunci`; opsi & umpan dari engine
     'pilih'  : opsi, correct & umpan ditulis di sini
     'isi'    : isian bilangan; kunci & umpan dari engine
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan temuan untuk mengidentifikasi unsur lingkaran pada benda dan gambar yang baru.',
    guru: 'Soal diambil acak, sehingga soal teman sebangku bisa berbeda. Saat murid keliru, minta ia membaca umpan balik lalu menjelaskan ciri yang terlewat.',
    instruksi:
      'Kerjakan delapan soal berikut. Pada soal gambar, perhatikan bagian yang berwarna oranye.',
    banyak: 8,
    komposisi: { gambar: 3, nama: 1, pilih: 2, isi: 2 },
    soal: [
      {
        id: 'tgJam',
        tipe: 'gambar',
        konteks: 'rumah',
        cerita: 'Jarum pendek jam dinding berputar pada porosnya.',
        tanya: 'Bagian oranye (jarum pendek) mewakili unsur lingkaran apa?',
        dekor: 'jam',
        caption: 'Jam dinding dengan jarum pendek disorot',
        elemen: [{ tipe: 'ruas', u: PUSAT, v: { sudut: 150 }, sorot: true }],
        hints: ['Di mana ujung-ujung jarum itu berada: di pusat atau pada lingkaran?'],
        pembahasan:
          'Jarum berawal di poros (titik pusat) dan ujungnya ke arah tepi jam, jadi mewakili jari-jari.',
      },
      {
        id: 'tgRoda',
        tipe: 'gambar',
        konteks: 'jalan',
        cerita:
          'Sebuah batang penguat dipasang pada roda gerobak dari tepi ke tepi melewati as roda.',
        tanya: 'Batang oranye itu mewakili unsur lingkaran apa?',
        dekor: 'roda',
        caption: 'Roda dengan batang yang melewati as disorot',
        elemen: [{ tipe: 'ruas', u: { sudut: 20 }, v: { sudut: 200 }, sorot: true }],
        hints: ['Apakah batang itu melewati titik pusat?', 'Di mana kedua ujungnya?'],
        pembahasan: 'Kedua ujungnya pada lingkaran dan melewati titik pusat, jadi diameter.',
      },
      {
        id: 'tgSemangka',
        tipe: 'gambar',
        konteks: 'dapur',
        cerita: 'Ibu memotong lurus bagian tepi semangka bundar.',
        tanya: 'Daerah oranye (potongan tepi) disebut apa?',
        dekor: 'semangka',
        caption: 'Semangka dengan potongan tepi disorot',
        elemen: [{ tipe: 'daerah', batas: 'taliBusur', a0: 230, a1: 330, sorot: true }],
        hints: ['Garis apa saja yang membatasi daerah itu? Lurus atau dari pusat?'],
        pembahasan:
          'Daerahnya dibatasi garis potong lurus (tali busur) dan kulit (busur), jadi tembereng.',
      },
      {
        id: 'tgSisaPizza',
        tipe: 'gambar',
        konteks: 'dapur',
        cerita: 'Satu potong pizza sudah diambil. Sisanya masih di loyang.',
        tanya: 'Daerah oranye (sisa pizza) disebut apa?',
        dekor: 'pizza',
        caption: 'Pizza dengan sisa pizza disorot',
        elemen: [{ tipe: 'daerah', batas: 'jariJari', a0: 100, a1: 40, sorot: true }],
        hints: [
          'Lihat garis lurus yang membatasinya: berawal di mana?',
          'Juring tidak harus kecil.',
        ],
        pembahasan: 'Sisa pizza dibatasi dua jari-jari dan busur besar, jadi tetap juring.',
      },
      {
        id: 'tgBianglala',
        tipe: 'gambar',
        konteks: 'taman',
        cerita: 'Sebuah tongkat penguat menghubungkan dua kabin bianglala.',
        tanya: 'Tongkat oranye itu mewakili unsur lingkaran apa?',
        dekor: 'bianglala',
        caption: 'Bianglala dengan tongkat penguat disorot',
        elemen: [{ tipe: 'ruas', u: { sudut: 67.5 }, v: { sudut: 157.5 }, sorot: true }],
        hints: ['Kedua ujungnya pada lingkaran. Apakah tongkat itu melewati pusat?'],
        pembahasan: 'Kedua ujungnya pada lingkaran dan tidak melewati pusat, jadi tali busur.',
      },
      {
        id: 'tgPelek',
        tipe: 'gambar',
        konteks: 'jalan',
        cerita: 'Sebagian pelek roda sepeda dicat oranye.',
        tanya: 'Bagian pelek yang dicat oranye mewakili unsur lingkaran apa?',
        dekor: 'roda',
        caption: 'Roda dengan sebagian pelek disorot',
        elemen: [{ tipe: 'busur', a0: 30, a1: 110, sorot: true }],
        hints: ['Bagian itu lurus atau lengkung? Merupakan bagian dari lingkarannya atau bukan?'],
        pembahasan:
          'Bagian pelek berupa garis lengkung yang merupakan bagian dari lingkaran, jadi busur.',
      },
      {
        id: 'tnDiameter',
        tipe: 'nama',
        konteks: 'konsep',
        cerita: 'Titik A dan B terletak pada lingkaran berpusat O, dan ruas AB melewati O.',
        tanya: 'Ruas AB disebut …',
        kunci: 'diameter',
        hints: ['Ruas AB menghubungkan dua titik pada lingkaran DAN melewati pusat.'],
        pembahasan: 'Tali busur yang melewati titik pusat disebut diameter.',
      },
      {
        id: 'tnTembereng',
        tipe: 'nama',
        konteks: 'konsep',
        cerita: 'Sebuah daerah pada lingkaran dibatasi oleh tali busur PQ dan busur PQ.',
        tanya: 'Daerah itu disebut …',
        kunci: 'tembereng',
        hints: ['Daerah ini tidak dibatasi jari-jari.'],
        pembahasan: 'Daerah yang dibatasi tali busur dan busurnya disebut tembereng.',
      },
      {
        id: 'tnJari',
        tipe: 'nama',
        konteks: 'konsep',
        cerita: 'Pada lingkaran berpusat O, titik K terletak pada lingkaran.',
        tanya: 'Ruas OK disebut …',
        kunci: 'jariJari',
        hints: ['Satu ujungnya di pusat, satu ujungnya pada lingkaran.'],
        pembahasan: 'Ruas dari titik pusat ke titik pada lingkaran disebut jari-jari.',
      },
      {
        id: 'tpPernyataan',
        tipe: 'pilih',
        konteks: 'konsep',
        cerita: 'Rina menulis beberapa pernyataan tentang unsur lingkaran.',
        tanya: 'Pernyataan manakah yang BENAR?',
        opsi: [
          { id: 'a', label: 'Setiap diameter adalah tali busur.' },
          { id: 'b', label: 'Setiap tali busur adalah diameter.' },
          { id: 'c', label: 'Busur adalah ruas garis lurus.' },
          { id: 'd', label: 'Juring dibatasi oleh tali busur dan busur.' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Diameter adalah tali busur yang melewati pusat.',
          b: 'Hanya tali busur yang melewati pusat yang disebut diameter.',
          c: 'Busur berupa garis lengkung, bukan lurus.',
          d: 'Itu batas tembereng. Juring dibatasi dua jari-jari dan busur.',
        },
        hints: ['Ingat hubungan diameter dan tali busur: mana yang lebih umum?'],
        pembahasan:
          'Diameter memenuhi ciri tali busur (kedua ujung pada lingkaran), ditambah melewati pusat.',
      },
      {
        id: 'tpBanyakJari',
        tipe: 'pilih',
        konteks: 'konsep',
        cerita: 'Dimas ingin menggambar semua jari-jari sebuah lingkaran.',
        tanya: 'Berapa banyak jari-jari yang dapat dibuat pada sebuah lingkaran?',
        opsi: [
          { id: 'takHingga', label: 'Tak terhingga banyaknya' },
          { id: 'satu', label: '1' },
          { id: 'dua', label: '2' },
          { id: 'empat', label: '4' },
        ],
        correct: 'takHingga',
        umpan: {
          takHingga: 'Tepat! Setiap titik pada lingkaran dapat dihubungkan dengan pusat.',
          satu: 'Coba putar titik B di Lab: setiap posisi B memberi jari-jari baru.',
          dua: 'Dua jari-jari yang segaris membentuk diameter, tetapi masih banyak jari-jari lain.',
          empat:
            'Empat hanyalah contoh, misalnya jarum yang menunjuk 12, 3, 6, 9. Masih ada yang lain.',
        },
        hints: ['Ada berapa banyak titik pada lingkaran?'],
        pembahasan:
          'Lingkaran memuat tak terhingga banyaknya titik, dan setiap titik membentuk satu jari-jari dengan pusat.',
      },
      {
        id: 'tpCelah',
        tipe: 'pilih',
        konteks: 'jalan',
        cerita:
          'Pada roda sepeda, terdapat daerah di antara dua jeruji yang bersebelahan dan pelek.',
        tanya: 'Daerah itu berbentuk …',
        opsi: [
          { id: 'juring', label: 'juring, karena dibatasi dua jari-jari dan busur' },
          { id: 'tembereng', label: 'tembereng, karena dibatasi dua jeruji' },
          { id: 'busur', label: 'busur, karena bagian dari pelek' },
          { id: 'segitiga', label: 'segitiga, karena ada tiga sisi lurus' },
        ],
        correct: 'juring',
        umpan: {
          juring: 'Tepat! Jeruji adalah jari-jari dan pelek adalah busur.',
          tembereng: 'Tembereng dibatasi tali busur, bukan jeruji (jari-jari).',
          busur: 'Busur berupa garis lengkung, sedangkan yang ditanyakan adalah daerah.',
          segitiga: 'Sisi pelek melengkung, jadi bukan segitiga.',
        },
        hints: ['Jeruji termasuk unsur apa? Pelek termasuk unsur apa?'],
        pembahasan: 'Dua jeruji (jari-jari) dan pelek (busur) membatasi sebuah juring.',
      },
      {
        id: 'tiToples',
        tipe: 'isi',
        konteks: 'dapur',
        cerita: 'Tutup toples kue berjari-jari 7 cm.',
        tanya: 'Berapa sentimeter diameter tutup toples itu?',
        satuan: 'cm',
        cek: { minta: 'diameter', r: 7 },
        hints: ['Diameter tersusun dari dua jari-jari yang segaris.'],
        pembahasan: 'd = 2 × r = 2 × 7 cm = 14 cm.',
      },
      {
        id: 'tiJeruji',
        tipe: 'isi',
        konteks: 'jalan',
        cerita: 'Diameter roda sepeda Andi 60 cm. Jeruji terpasang dari as roda ke pelek.',
        tanya: 'Berapa sentimeter panjang jeruji itu?',
        satuan: 'cm',
        cek: { minta: 'jariJari', d: 60 },
        hints: ['Jeruji adalah jari-jari.', 'Jari-jari = diameter : 2.'],
        pembahasan: 'Jeruji = jari-jari = 60 cm : 2 = 30 cm.',
      },
      {
        id: 'tiBianglala',
        tipe: 'isi',
        konteks: 'taman',
        cerita: 'Bianglala di taman kota berdiameter 35 m.',
        tanya: 'Berapa meter jarak sebuah kabin (pada tepi roda) ke poros tengahnya?',
        satuan: 'm',
        cek: { minta: 'jarakPusat', d: 35 },
        hints: [
          'Jarak dari poros ke tepi adalah jari-jari.',
          'Boleh menjawab dengan desimal, mis. 12,5.',
        ],
        pembahasan: 'Jarak kabin ke poros = jari-jari = 35 m : 2 = 17,5 m.',
      },
      {
        id: 'tiTutupPanci',
        tipe: 'isi',
        konteks: 'dapur',
        cerita:
          'Tutup panci berjari-jari 12 cm. Rudi meletakkan sendok kayu lurus di atasnya dari tepi ke tepi.',
        tanya: 'Berapa sentimeter panjang tali busur terpanjang yang dapat dibentuk sendok itu?',
        satuan: 'cm',
        cek: { minta: 'taliTerpanjang', r: 12 },
        hints: ['Tali busur terpanjang melewati pusat. Apa namanya?'],
        pembahasan: 'Tali busur terpanjang adalah diameter: 2 × 12 cm = 24 cm.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Refleksi',
    syntax: 'Penutup',
    goal: 'Merenungkan proses penemuan dan menilai pemahaman diri.',
    guru: 'Bacakan beberapa jawaban refleksi (tanpa nama). Jadikan jawaban pertanyaan ketiga sebagai tugas pengamatan di rumah: memotret tiga benda bundar dan menandai unsurnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Unsur mana yang paling mudah tertukar menurutmu? Ciri apa yang sekarang kamu pakai untuk membedakannya?',
        placeholder:
          'Contoh: juring dan tembereng — aku melihat apakah batasnya jari-jari atau tali busur …',
      },
      {
        id: 'r2',
        teks: 'Apakah dugaan awalmu terbukti? Bagian mana dari Lab Lingkaran yang mengubah pendapatmu?',
        placeholder: 'Tulis dengan kalimatmu sendiri …',
      },
      {
        id: 'r3',
        teks: 'Sebutkan satu benda di rumahmu dan unsur lingkaran yang dapat kamu temukan padanya.',
        placeholder: 'Contoh: kipas angin — baling-balingnya seperti jari-jari …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu dapat menunjukkan ketujuh unsur lingkaran pada benda di sekitar?',
    diriOpsi: [
      { id: 'sangat', label: '😄 Sangat yakin — bisa menjelaskan ke teman' },
      { id: 'yakin', label: '🙂 Yakin, sesekali masih perlu melihat catatan' },
      { id: 'ragu', label: '😐 Masih ragu pada beberapa unsur' },
      { id: 'belum', label: '😟 Belum yakin, perlu dibimbing lagi' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, penyelidikanmu tuntas!',
    teks: 'Kamu telah menemukan sendiri ketujuh unsur lingkaran dan mengenalinya pada benda-benda di sekitar.',
    capaian: [
      'Menemukan ciri titik pusat, jari-jari, diameter, dan tali busur melalui Lab Lingkaran.',
      'Menemukan bahwa diameter = 2 × jari-jari dan diameter adalah tali busur terpanjang.',
      'Membedakan busur (lengkung) dengan tali busur (lurus).',
      'Membedakan juring dan tembereng dari garis yang membatasinya.',
      'Menamai unsur-unsur lingkaran pada jam, roda, pizza, semangka, bianglala, dan kipas.',
    ],
  },
};
