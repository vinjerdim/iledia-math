'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Konsep Barisan Aritmetika & Beda
   Fase F — SMK Rekayasa Perangkat Lunak (Kelas XI)

   Tujuan Pembelajaran:
   Mengidentifikasi dan menjelaskan konsep barisan aritmetika serta
   menentukan beda dari suatu barisan bilangan.

   Model pembelajaran: INQUIRY LEARNING (Inkuiri Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Orientasi .................. tahap 'orientasi'
     Sintaks 2 — Merumuskan masalah ......... tahap 'masalah'
     Sintaks 3 — Merumuskan hipotesis ....... tahap 'hipotesis'
     Sintaks 4 — Mengumpulkan data .......... tahap 'dataSelisih' & 'dataLab'
     Sintaks 5 — Menguji hipotesis .......... tahap 'uji'
     Sintaks 6 — Merumuskan kesimpulan ...... tahap 'simpulan'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 45 menit, murid berpasangan):
     1. Orientasi  (10') — papan log tim developer: port server,
                           sisa kuota penyimpanan, pengguna aktif.
                           Murid MENDUGA barisan mana yang berubah
                           "seperti" barisan port + alasan (tidak dinilai).
     2. Masalah    (5')  — memilih rumusan masalah penyelidikan
                           (pertanyaan penuntun berumpan balik).
     3. Hipotesis  (10') — memilih dugaan ciri barisan aritmetika,
                           menduga beda dua barisan, menulis hipotesis.
     4. Data 1     (15') — pelacak selisih: mengisi selisih setiap dua
                           suku berurutan pada empat barisan (naik,
                           turun, desimal, bukan aritmetika); umpan
                           balik mendiagnosis pengurangan terbalik.
                           Lalu pertanyaan temuan.
     5. Data 2     (10') — lab barisan: mengatur a dan b, mengamati
                           barisan naik/turun/konstan pada garis
                           bilangan lompatan. Lalu pertanyaan temuan.
     6. Uji        (15') — membandingkan hipotesis & dugaan dengan data,
                           memilah 8 barisan, menentukan beda 3 barisan,
                           menilai 4 pernyataan (miskonsepsi).
     7. Simpulan   (10') — menyusun definisi & cara menentukan beda
                           dari bank kalimat (ada pengecoh).
     8. Uji terap  (10') — enam soal kontekstual RPL.
     9. Refleksi   (5')  — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan, sehingga tiap
   murid (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var IL = 'Inquiry Learning';

var DATA = {
  meta: {
    title: 'Konsep Barisan Aritmetika & Beda',
    goal: 'Mengidentifikasi dan menjelaskan konsep barisan aritmetika serta menentukan beda dari suatu barisan bilangan.',
  },

  /* Urutan & label tahap (dipakai app.js dan dicek terhadap manifest). */
  tahap: [
    { id: 'orientasi', label: 'Orientasi' },
    { id: 'masalah', label: 'Masalah' },
    { id: 'hipotesis', label: 'Hipotesis' },
    { id: 'dataSelisih', label: 'Data Selisih' },
    { id: 'dataLab', label: 'Lab Barisan' },
    { id: 'uji', label: 'Uji Hipotesis' },
    { id: 'simpulan', label: 'Simpulan' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI
     Tiga barisan dari "papan log" tim developer. Dugaan TIDAK
     dinilai; akan dibandingkan dengan data di tahap Uji.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    syntax: IL + ' · Sintaks 1',
    goal: 'Mengamati tiga barisan bilangan dari dunia RPL dan menduga mana yang berubah secara teratur.',
    tp: 'Mengidentifikasi dan menjelaskan konsep barisan aritmetika serta menentukan beda dari suatu barisan bilangan.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Merumuskan pertanyaan penyelidikan dan hipotesis tentang pola barisan bilangan.',
      'Mengumpulkan data selisih suku berurutan untuk menguji hipotesis.',
      'Membedakan barisan aritmetika dan bukan barisan aritmetika.',
      'Menentukan beda barisan naik, turun, konstan, dan berdesimal.',
    ],
    guru: 'Tampilkan papan log di layar. Ajak murid membaca ketiga barisan dengan suara keras, lalu minta mereka menduga <em>tanpa menghitung rinci</em>. Jangan membenarkan atau menyalahkan dugaan — dugaan ini akan diuji sendiri oleh murid pada tahap Uji Hipotesis.',
    judul: 'Papan Log Tim Dev "Kode Nusantara"',
    cerita:
      'Raka, siswa RPL yang magang di sebuah startup, diminta merapikan catatan di papan log timnya. Ia menemukan tiga catatan angka yang berubah dari waktu ke waktu.',
    barisan: [
      {
        id: 'port',
        judul: 'Nomor port server staging',
        satuan: '',
        terms: [8080, 8085, 8090, 8095, 8100],
      },
      {
        id: 'kuota',
        judul: 'Sisa kuota penyimpanan setelah backup harian',
        satuan: 'GB',
        terms: [120, 112, 104, 96, 88],
      },
      {
        id: 'pengguna',
        judul: 'Pengguna aktif aplikasi per minggu',
        satuan: 'orang',
        terms: [50, 100, 200, 400, 800],
      },
    ],
    pertanyaan:
      'Dugaanmu: barisan mana yang berubah dengan cara yang SAMA seperti nomor port server?',
    opsi: [
      { id: 'kuota', label: 'Sisa kuota penyimpanan saja' },
      { id: 'pengguna', label: 'Pengguna aktif saja' },
      { id: 'keduanya', label: 'Kuota penyimpanan dan pengguna aktif' },
      { id: 'tidakAda', label: 'Tidak ada yang sama' },
    ],
    alasanLabel: 'Apa alasanmu?',
    alasanPlaceholder: 'Contoh: aku melihat nomor port selalu …',
    catatan: 'Dugaanmu tidak dinilai. Simpan baik-baik — kamu akan mengujinya sendiri dengan data.',
    nextLabel: 'Lanjut: Rumuskan Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MERUMUSKAN MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: IL + ' · Sintaks 2',
    goal: 'Memilih pertanyaan penyelidikan yang tepat untuk dijawab dengan data.',
    guru: 'Diskusikan mengapa pertanyaan yang dipilih harus bisa dijawab dengan mengamati data dan berlaku umum, bukan hanya untuk satu barisan. Arahkan murid pada dua kata kunci: <em>ciri</em> dan <em>cara menentukan besar perubahan</em>.',
    pengantar:
      'Raka ingin tahu mengapa barisan port terasa "rapi". Pertanyaan apa yang paling tepat untuk diselidiki?',
    pertanyaan: {
      id: 'rumusan',
      tanya: 'Pilih rumusan masalah penyelidikan yang paling tepat.',
      opsi: [
        {
          id: 'ciri',
          label:
            'Ciri apa yang membuat sebuah barisan termasuk barisan aritmetika, dan bagaimana cara menentukan besar perubahannya (beda)?',
        },
        { id: 'port100', label: 'Berapa nomor port server yang ke-100?' },
        { id: 'mengapa', label: 'Mengapa pengguna aktif aplikasi bertambah banyak?' },
        { id: 'terbesar', label: 'Barisan mana yang bilangannya paling besar?' },
      ],
      correct: 'ciri',
      umpan: {
        ciri: 'Tepat. Pertanyaan ini berlaku untuk <em>semua</em> barisan dan bisa dijawab dengan mengamati data — itulah yang akan kamu selidiki.',
        port100:
          'Pertanyaan ini hanya tentang satu barisan dan satu suku. Kita perlu memahami <em>ciri umumnya</em> dulu.',
        mengapa:
          'Ini pertanyaan bisnis, bukan pertanyaan tentang pola bilangan. Coba pilih yang menyelidiki polanya.',
        terbesar:
          'Membandingkan besar bilangan tidak menjelaskan pola perubahannya. Pilih yang menanyakan ciri pola.',
      },
    },
    tulisLabel: 'Tulis ulang rumusan masalah itu dengan kata-katamu sendiri (boleh singkat).',
    tulisPlaceholder: 'Aku ingin menyelidiki …',
    nextLabel: 'Lanjut: Buat Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MERUMUSKAN HIPOTESIS (tidak dinilai)
     ---------------------------------------------------------- */
  hipotesis: {
    kicker: 'Tahap 3 · Merumuskan Hipotesis',
    syntax: IL + ' · Sintaks 3',
    goal: 'Menyusun dugaan sementara tentang ciri barisan aritmetika dan besar bedanya.',
    guru: 'Tekankan bahwa hipotesis adalah jawaban sementara yang boleh salah. Minta setiap pasangan menulis hipotesis dengan kalimat sendiri sebelum melanjutkan.',
    strategiTanya:
      'Menurut dugaanmu, apa yang perlu diperiksa untuk mengenali barisan yang "rapi" seperti nomor port?',
    strategi: [
      { id: 'selisih', label: 'Selisih setiap dua suku berurutan selalu sama' },
      { id: 'rasio', label: 'Hasil bagi setiap dua suku berurutan selalu sama' },
      { id: 'naik', label: 'Bilangannya selalu bertambah besar' },
      { id: 'kelipatan', label: 'Semua sukunya kelipatan bilangan yang sama' },
    ],
    /* Evaluasi setiap hipotesis — ditampilkan di tahap Uji. */
    evaluasi: {
      selisih:
        'Didukung data: port (+5), kuota (−8), dan waktu muat (−0,3) punya selisih yang selalu sama, sedangkan pengguna aktif tidak.',
      rasio:
        'Tidak didukung: hasil bagi port 8085 : 8080 dan 8090 : 8085 tidak sama. Justru barisan pengguna aktif (×2) yang hasil baginya tetap — dan barisan itu tidak "rapi" seperti port.',
      naik: 'Tidak didukung: kuota penyimpanan terus turun tetapi tetap rapi (−8), sedangkan pengguna aktif selalu naik tetapi selisihnya berubah-ubah.',
      kelipatan:
        'Tidak didukung: 8080, 8085, 8090 memang kelipatan 5, tetapi 120, 112, 104 bukan kelipatan 5 dan tetap rapi. Yang penting adalah selisihnya.',
    },
    dugaan: [
      {
        id: 'bedaPort',
        tanya: 'Dugaanmu: berapa besar perubahan setiap langkah pada nomor port?',
        barisan: 'port',
        opsi: [
          { id: 'p5', label: '5' },
          { id: 'p8080', label: '8.080' },
          { id: 'p10', label: '10' },
          { id: 'p1', label: '1' },
        ],
        benar: 'p5',
      },
      {
        id: 'bedaKuota',
        tanya: 'Dugaanmu: berapa besar perubahan setiap langkah pada sisa kuota?',
        barisan: 'kuota',
        opsi: [
          { id: 'k8', label: '8' },
          { id: 'kmin8', label: '−8' },
          { id: 'k88', label: '88' },
          { id: 'k16', label: '16' },
        ],
        benar: 'kmin8',
      },
    ],
    tulisLabel: 'Tulis hipotesismu: "Barisan yang rapi seperti port adalah barisan yang …"',
    tulisPlaceholder: 'Barisan yang rapi adalah barisan yang …',
    minPanjang: 15,
    nextLabel: 'Lanjut: Kumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — MENGUMPULKAN DATA: PELACAK SELISIH
     ---------------------------------------------------------- */
  dataSelisih: {
    kicker: 'Tahap 4 · Mengumpulkan Data (1)',
    syntax: IL + ' · Sintaks 4',
    goal: 'Mengumpulkan data selisih setiap dua suku berurutan pada beberapa barisan.',
    guru: 'Minta murid menghitung selisih sebagai <em>suku sesudah dikurangi suku sebelum</em>. Bila ada yang menulis 8 untuk barisan kuota, tanyakan: "Kuotanya bertambah atau berkurang?" Biarkan umpan balik media bekerja sebelum membantu.',
    instruksi:
      'Isi setiap jembatan dengan selisih dua suku yang diapitnya: suku sesudah − suku sebelum. Gunakan tanda − bila berkurang. Desimal ditulis dengan koma.',
    barisan: [
      {
        id: 'port',
        judul: 'Nomor port server staging',
        satuan: '',
        terms: [8080, 8085, 8090, 8095, 8100],
      },
      {
        id: 'kuota',
        judul: 'Sisa kuota penyimpanan',
        satuan: 'GB',
        terms: [120, 112, 104, 96, 88],
      },
      {
        id: 'muat',
        judul: 'Waktu muat halaman setelah tiap optimasi',
        satuan: 'detik',
        terms: [3.2, 2.9, 2.6, 2.3, 2],
      },
      {
        id: 'pengguna',
        judul: 'Pengguna aktif aplikasi per minggu',
        satuan: 'orang',
        terms: [50, 100, 200, 400, 800],
      },
    ],
    temuan: [
      {
        id: 'tetap',
        tanya: 'Pada barisan mana selisih dua suku berurutan SELALU SAMA?',
        opsi: [
          { id: 'tiga', label: 'Port, kuota, dan waktu muat' },
          { id: 'port', label: 'Hanya port' },
          { id: 'semua', label: 'Keempat barisan' },
          { id: 'pengguna', label: 'Hanya pengguna aktif' },
        ],
        correct: 'tiga',
        umpan: {
          tiga: 'Benar. Ketiganya berubah dengan besar yang sama setiap langkah (+5, −8, −0,3). Pengguna aktif selisihnya +50, +100, +200, +400 — berubah-ubah.',
          port: 'Lihat lagi kuota (−8, −8, −8, −8) dan waktu muat (−0,3 setiap langkah). Selisihnya juga selalu sama, hanya bertanda negatif.',
          semua: 'Periksa pengguna aktif: selisihnya +50, +100, +200, +400. Apakah selalu sama?',
          pengguna:
            'Selisih pengguna aktif justru berubah-ubah (+50, +100, +200, …). Cari barisan yang selisihnya tetap.',
        },
      },
      {
        id: 'tanda',
        tanya: 'Selisih pada barisan kuota adalah −8. Apa arti tanda negatif itu?',
        opsi: [
          { id: 'turun', label: 'Setiap langkah, sukunya berkurang 8' },
          { id: 'salahHitung', label: 'Hitungannya pasti salah, selisih tidak boleh negatif' },
          { id: 'bukan', label: 'Barisan itu bukan barisan yang rapi' },
          { id: 'kecil', label: 'Sukunya lebih kecil dari 8' },
        ],
        correct: 'turun',
        umpan: {
          turun: 'Tepat. Selisih negatif berarti barisannya turun dengan besar yang tetap.',
          salahHitung:
            'Selisih boleh negatif. 112 − 120 = −8 menunjukkan kuota berkurang 8 GB setiap hari.',
          bukan:
            'Selisihnya selalu −8, jadi barisan itu tetap rapi. Tandanya hanya menunjukkan arah (turun).',
          kecil:
            'Semua suku kuota jauh lebih besar dari 8. Tanda negatif menjelaskan arah perubahan, bukan besar suku.',
        },
      },
      {
        id: 'cara',
        tanya: 'Bagaimana cara menghitung selisih dua suku berurutan?',
        opsi: [
          { id: 'sesudah', label: 'Suku sesudah dikurangi suku sebelum, misalnya U₂ − U₁' },
          { id: 'sebelum', label: 'Suku sebelum dikurangi suku sesudah, misalnya U₁ − U₂' },
          { id: 'besar', label: 'Suku terbesar dikurangi suku terkecil' },
          { id: 'jumlah', label: 'Suku sesudah ditambah suku sebelum' },
        ],
        correct: 'sesudah',
        umpan: {
          sesudah: 'Benar. Urutan ini menjaga tanda: naik → positif, turun → negatif.',
          sebelum:
            'Dengan urutan ini, barisan kuota menghasilkan 120 − 112 = +8, padahal kuotanya berkurang. Tandanya jadi terbalik.',
          besar:
            'Cara ini selalu menghasilkan bilangan positif, sehingga kita tidak tahu barisannya naik atau turun.',
          jumlah:
            'Menjumlahkan tidak menunjukkan perubahan. Selisih diperoleh dengan mengurangkan.',
        },
      },
    ],
    nextLabel: 'Lanjut: Lab Barisan →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — MENGUMPULKAN DATA: LAB BARISAN
     ---------------------------------------------------------- */
  dataLab: {
    kicker: 'Tahap 5 · Mengumpulkan Data (2)',
    syntax: IL + ' · Sintaks 4',
    goal: 'Membangun barisan sendiri dari suku pertama a dan beda b, lalu mengamati pengaruh b.',
    guru: 'Biarkan murid bereksperimen bebas. Minta tiap pasangan mencoba minimal satu nilai b positif, satu negatif, dan b = 0, lalu mencatat apa yang terjadi pada garis bilangan.',
    instruksi:
      'Atur suku pertama (a) dan beda (b). Amati kartu suku dan lompatan pada garis bilangan. Coba b positif, b negatif, dan b = 0.',
    awal: { a: 3, b: 4 },
    rangeA: { min: -10, max: 20 },
    rangeB: { min: -6, max: 6 },
    n: 6,
    belumLengkap:
      'Coba ketiga jenis beda (positif, negatif, dan nol) untuk membuka pertanyaan temuan.',
    temuan: [
      {
        id: 'positif',
        tanya: 'Jika b bernilai positif, barisannya …',
        opsi: [
          { id: 'naik', label: 'naik — setiap suku lebih besar dari suku sebelumnya' },
          { id: 'turun', label: 'turun — setiap suku lebih kecil dari suku sebelumnya' },
          { id: 'tetap', label: 'tetap — semua suku sama' },
          { id: 'acak', label: 'kadang naik, kadang turun' },
        ],
        correct: 'naik',
        umpan: {
          naik: 'Benar. Setiap langkah ditambah bilangan positif, jadi barisannya naik.',
          turun:
            'Coba atur b = 3 di lab. Lompatan pada garis bilangan mengarah ke kanan atau ke kiri?',
          tetap: 'Suku-suku sama hanya terjadi bila b = 0. Coba lagi dengan b positif.',
          acak: 'Karena bedanya tetap, arahnya juga selalu sama. Amati lagi lompatannya.',
        },
      },
      {
        id: 'negatif',
        tanya: 'Jika b bernilai negatif, barisannya …',
        opsi: [
          { id: 'turun', label: 'turun dengan besar penurunan yang sama' },
          { id: 'naik', label: 'naik dengan besar kenaikan yang sama' },
          { id: 'bukan', label: 'bukan lagi barisan aritmetika' },
          { id: 'nol', label: 'selalu berakhir di nol' },
        ],
        correct: 'turun',
        umpan: {
          turun: 'Benar. Setiap langkah dikurangi bilangan yang sama, seperti barisan kuota (−8).',
          naik: 'Atur b = −2 di lab. Lompatannya ke kiri — sukunya makin kecil.',
          bukan: 'Selisihnya tetap sama (misalnya −2 terus), jadi tetap barisan aritmetika.',
          nol: 'Barisan turun terus melewati nol menjadi negatif. Tidak berhenti di nol.',
        },
      },
      {
        id: 'nol',
        tanya: 'Jika b = 0, apa yang terjadi?',
        opsi: [
          {
            id: 'konstan',
            label: 'Semua suku sama; tetap barisan aritmetika dengan beda 0 (barisan konstan)',
          },
          { id: 'bukan', label: 'Semua suku sama, jadi bukan barisan aritmetika' },
          { id: 'hilang', label: 'Semua suku menjadi 0' },
          { id: 'naik', label: 'Barisannya naik perlahan' },
        ],
        correct: 'konstan',
        umpan: {
          konstan:
            'Tepat. Selisihnya selalu 0 — tetap sama — sehingga memenuhi ciri barisan aritmetika.',
          bukan:
            'Periksa cirinya: selisih setiap dua suku berurutan selalu sama (yaitu 0). Jadi …?',
          hilang: 'Suku-sukunya sama dengan suku pertama a, bukan 0. Coba a = 5 dan b = 0.',
          naik: 'Dengan b = 0 tidak ada lompatan sama sekali. Amati lagi.',
        },
      },
      {
        id: 'pengaruhA',
        tanya: 'Jika hanya a yang diubah (b tetap), apa yang berubah?',
        opsi: [
          { id: 'awal', label: 'Titik awal barisan bergeser, tetapi selisih antarsuku tetap sama' },
          { id: 'beda', label: 'Beda barisan ikut berubah' },
          { id: 'arah', label: 'Arah barisan (naik/turun) ikut berubah' },
          { id: 'jenis', label: 'Barisan berubah menjadi bukan aritmetika' },
        ],
        correct: 'awal',
        umpan: {
          awal: 'Benar. Suku pertama menentukan titik mulai, beda menentukan besar dan arah lompatan.',
          beda: 'Ubah a sambil memperhatikan label lompatan (+b). Apakah labelnya berubah?',
          arah: 'Arah ditentukan oleh tanda b. Mengubah a hanya menggeser titik awal.',
          jenis: 'Selisihnya tetap b, jadi tetap barisan aritmetika.',
        },
      },
    ],
    nextLabel: 'Lanjut: Uji Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGUJI HIPOTESIS
     ---------------------------------------------------------- */
  uji: {
    kicker: 'Tahap 6 · Menguji Hipotesis',
    syntax: IL + ' · Sintaks 5',
    goal: 'Menguji hipotesis dengan data, memilah barisan, dan menentukan bedanya.',
    guru: 'Minta beberapa pasangan membacakan hipotesis awalnya dan menyatakan apakah hipotesis itu diterima, diperbaiki, atau ditolak berdasarkan data. Hargai hipotesis yang ditolak — itu bagian penting dari penyelidikan.',
    keputusanTanya: 'Setelah melihat data, apa keputusanmu tentang hipotesis awalmu?',
    keputusanOpsi: [
      { id: 'terima', label: 'Hipotesisku diterima — sesuai dengan data' },
      { id: 'perbaiki', label: 'Hipotesisku perlu diperbaiki' },
      { id: 'tolak', label: 'Hipotesisku ditolak — data menunjukkan hal lain' },
    ],
    /* Pemilahan barisan: aritmetika atau bukan. */
    pilahInstruksi: 'Pilahkan setiap barisan: barisan aritmetika atau bukan?',
    opsiPilah: [
      { id: 'aritmetika', label: 'Barisan aritmetika' },
      { id: 'bukan', label: 'Bukan barisan aritmetika' },
    ],
    pilah: [
      {
        id: 's1',
        terms: [7, 11, 15, 19, 23],
        correct: 'aritmetika',
        explanation: 'Selisihnya selalu +4.',
      },
      {
        id: 's2',
        terms: [2, 4, 8, 16, 32],
        correct: 'bukan',
        explanation: 'Selisihnya +2, +4, +8, +16 — berubah-ubah (setiap suku dikali 2).',
      },
      {
        id: 's3',
        terms: [45, 38, 31, 24, 17],
        correct: 'aritmetika',
        explanation: 'Selisihnya selalu −7 (barisan turun).',
      },
      {
        id: 's4',
        terms: [1, 4, 9, 16, 25],
        correct: 'bukan',
        explanation: 'Selisihnya +3, +5, +7, +9 — tidak tetap.',
      },
      {
        id: 's5',
        terms: [9, 9, 9, 9, 9],
        correct: 'aritmetika',
        explanation: 'Selisihnya selalu 0 — barisan aritmetika konstan dengan beda 0.',
      },
      {
        id: 's6',
        terms: [1.5, 2, 2.5, 3, 3.5],
        correct: 'aritmetika',
        explanation: 'Selisihnya selalu +0,5. Beda boleh berupa desimal.',
      },
      {
        id: 's7',
        terms: [10, 12, 15, 19, 24],
        correct: 'bukan',
        explanation: 'Barisannya naik, tetapi selisihnya +2, +3, +4, +5 — tidak tetap.',
      },
      {
        id: 's8',
        terms: [-6, -2, 2, 6, 10],
        correct: 'aritmetika',
        explanation: 'Selisihnya selalu +4, walaupun sukunya berawal dari bilangan negatif.',
      },
    ],
    /* Menentukan beda (isian). */
    bedaInstruksi: 'Tentukan beda setiap barisan aritmetika berikut.',
    beda: [
      {
        id: 'b1',
        terms: [45, 38, 31, 24, 17],
        label: 'Beda barisan 45, 38, 31, 24, 17, … adalah b =',
        jawab: -7,
        allowNegative: true,
        hints: [
          'Hitung U₂ − U₁ = 38 − 45.',
          'Barisannya turun, jadi bedanya negatif: 38 − 45 = −7.',
        ],
        temuan: 'b = 38 − 45 = −7. Periksa: 31 − 38 = −7 juga.',
      },
      {
        id: 'b2',
        terms: [1.5, 2, 2.5, 3, 3.5],
        label: 'Beda barisan 1,5; 2; 2,5; 3; 3,5; … adalah b =',
        jawab: 0.5,
        desimal: true,
        hints: ['Hitung U₂ − U₁ = 2 − 1,5.', 'Tulis dengan koma: 0,5.'],
        temuan: 'b = 2 − 1,5 = 0,5.',
      },
      {
        id: 'b3',
        terms: [-6, -2, 2, 6, 10],
        label: 'Beda barisan −6, −2, 2, 6, 10, … adalah b =',
        jawab: 4,
        allowNegative: true,
        hints: [
          'Hitung U₂ − U₁ = −2 − (−6).',
          'Mengurangi bilangan negatif sama dengan menambah: −2 + 6 = 4.',
        ],
        temuan: 'b = −2 − (−6) = 4. Periksa: 2 − (−2) = 4.',
      },
    ],
    /* Menilai pernyataan (miskonsepsi). */
    pernyataanInstruksi: 'Nilai setiap pernyataan berikut: benar atau salah?',
    opsiPernyataan: [
      { id: 'benar', label: 'Benar' },
      { id: 'salah', label: 'Salah' },
    ],
    pernyataan: [
      {
        id: 'p1',
        teks: 'Beda barisan 20, 17, 14, 11, … adalah 3.',
        correct: 'salah',
        explanation: 'b = U₂ − U₁ = 17 − 20 = −3. Barisannya turun, jadi bedanya negatif.',
      },
      {
        id: 'p2',
        teks: 'Setiap barisan yang sukunya terus bertambah pasti barisan aritmetika.',
        correct: 'salah',
        explanation: 'Contoh 10, 12, 15, 19, 24 terus naik, tetapi selisihnya tidak tetap.',
      },
      {
        id: 'p3',
        teks: 'Barisan 5, 5, 5, 5, … termasuk barisan aritmetika dengan beda 0.',
        correct: 'benar',
        explanation: 'Selisihnya selalu 0 (tetap), jadi termasuk barisan aritmetika.',
      },
      {
        id: 'p4',
        teks: 'Beda dapat dihitung dari pasangan suku berurutan mana saja, misalnya U₄ − U₃.',
        correct: 'benar',
        explanation:
          'Pada barisan aritmetika semua selisih berurutan sama, jadi pasangan mana pun memberi b yang sama.',
      },
    ],
    nextLabel: 'Lanjut: Rumuskan Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MERUMUSKAN KESIMPULAN
     ---------------------------------------------------------- */
  simpulan: {
    kicker: 'Tahap 7 · Merumuskan Kesimpulan',
    syntax: IL + ' · Sintaks 6',
    goal: 'Menyusun definisi barisan aritmetika dan cara menentukan bedanya berdasarkan temuan.',
    guru: 'Setelah murid menyusun kesimpulan, minta satu pasangan menjelaskannya dengan contoh barisan buatan sendiri (naik, turun, dan konstan).',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai sekali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      {
        id: 'k1',
        awal: 'Barisan aritmetika adalah barisan bilangan yang',
        correct: 'selisihTetap',
      },
      { id: 'k2', awal: 'Selisih yang tetap itu disebut beda dan dilambangkan', correct: 'hurufB' },
      { id: 'k3', awal: 'Beda ditentukan dengan', correct: 'rumusB' },
      {
        id: 'k4',
        awal: 'Jika b > 0 barisannya naik, jika b < 0 barisannya turun, dan jika',
        correct: 'bNol',
      },
    ],
    bank: [
      { id: 'selisihTetap', teks: 'selisih setiap dua suku berurutannya selalu tetap.' },
      { id: 'hurufB', teks: 'dengan huruf b.' },
      { id: 'rumusB', teks: 'b = U₂ − U₁ = U₃ − U₂ = … = Uₙ − Uₙ₋₁.' },
      { id: 'bNol', teks: 'b = 0 semua sukunya sama (barisan konstan).' },
      { id: 'rasioTetap', teks: 'hasil bagi setiap dua suku berurutannya selalu tetap.' },
      { id: 'hurufR', teks: 'dengan huruf r.' },
      { id: 'rumusTerbalik', teks: 'b = U₁ − U₂ (suku sebelum dikurangi suku sesudah).' },
      { id: 'selaluNaik', teks: 'sukunya selalu bertambah besar.' },
    ],
    rangkuman: [
      'Barisan aritmetika: selisih setiap dua suku berurutan selalu tetap.',
      'Beda: <strong>b = Uₙ − Uₙ₋₁</strong> (suku sesudah dikurangi suku sebelum).',
      'b &gt; 0 → barisan naik; b &lt; 0 → barisan turun; b = 0 → barisan konstan.',
      'Untuk mengidentifikasi, periksa <em>semua</em> selisih berurutan — satu atau dua selisih belum cukup.',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     `cek` dipakai tes untuk menghitung ulang kunci jawaban.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Mengidentifikasi barisan aritmetika dan menentukan bedanya dalam masalah kontekstual RPL.',
    guru: 'Murid mengerjakan mandiri. Amati murid yang masih menulis beda positif untuk barisan turun, lalu ajak mereka memeriksa arah perubahan.',
    instruksi:
      'Kerjakan setiap soal. Jawaban isian berupa bilangan bulat; gunakan tanda − bila perlu.',
    soal: [
      {
        type: 'choice',
        cerita: 'Tim QA mencatat banyak bug yang tersisa setiap hari: 42, 37, 32, 27, …',
        pertanyaan: 'Pernyataan yang tepat tentang barisan ini adalah …',
        options: [
          { id: 'am5', label: 'Barisan aritmetika dengan beda −5' },
          { id: 'ap5', label: 'Barisan aritmetika dengan beda 5' },
          { id: 'bukan', label: 'Bukan barisan aritmetika karena sukunya berkurang' },
          { id: 'am42', label: 'Barisan aritmetika dengan beda 42' },
        ],
        correct: 'am5',
        cek: { terms: [42, 37, 32, 27], beda: -5 },
        explanation: 'Selisihnya selalu 37 − 42 = −5, jadi barisan aritmetika dengan b = −5.',
      },
      {
        type: 'input',
        cerita: 'Nomor build aplikasi yang dirilis setiap sprint: 1004, 1011, 1018, 1025, …',
        pertanyaan: 'Tentukan beda barisan nomor build tersebut.',
        jawab: 7,
        cek: { terms: [1004, 1011, 1018, 1025] },
        hints: ['Hitung U₂ − U₁ = 1011 − 1004.', 'Periksa pasangan lain: 1018 − 1011 = ?'],
        explanation: 'b = 1011 − 1004 = 7 (dan 1018 − 1011 = 7).',
        reveal: '<strong>b = 7</strong>, karena 1011 − 1004 = 1018 − 1011 = 1025 − 1018 = 7.',
      },
      {
        type: 'choice',
        cerita: 'Empat catatan berikut diambil dari log berbeda.',
        pertanyaan: 'Manakah yang <strong>bukan</strong> barisan aritmetika?',
        options: [
          { id: 'g', label: '3, 6, 12, 24, …' },
          { id: 'a1', label: '4, 9, 14, 19, …' },
          { id: 'a2', label: '30, 24, 18, 12, …' },
          { id: 'a3', label: '2, 2, 2, 2, …' },
        ],
        correct: 'g',
        cek: {
          pilihan: {
            g: [3, 6, 12, 24],
            a1: [4, 9, 14, 19],
            a2: [30, 24, 18, 12],
            a3: [2, 2, 2, 2],
          },
        },
        explanation:
          'Selisih 3, 6, 12, 24 adalah +3, +6, +12 — tidak tetap. Yang lain punya beda +5, −6, dan 0.',
      },
      {
        type: 'input',
        cerita:
          'Suhu ruang server (°C) tercatat setiap jam setelah pendingin dinyalakan: 31, 29, 27, 25, …',
        pertanyaan: 'Tentukan beda barisan suhu tersebut.',
        jawab: -2,
        cek: { terms: [31, 29, 27, 25] },
        hints: ['Suhunya naik atau turun?', 'b = 29 − 31.'],
        explanation: 'b = 29 − 31 = −2. Suhu turun 2 °C setiap jam.',
        reveal: '<strong>b = −2</strong>, karena 29 − 31 = −2 (suhu turun).',
      },
      {
        type: 'input',
        cerita:
          'Sebuah barisan aritmetika mencatat antrean tiket support. Suku ke-2 adalah 14 dan suku ke-5 adalah 26.',
        pertanyaan: 'Tentukan beda barisan tersebut.',
        jawab: 4,
        cek: { m: 2, um: 14, n: 5, un: 26 },
        hints: [
          'Dari U₂ ke U₅ ada 3 langkah, dan setiap langkah bertambah b.',
          'Jadi 3b = 26 − 14 = 12.',
        ],
        explanation: 'Dari U₂ ke U₅ ada 3 lompatan: 3b = 26 − 14 = 12, sehingga b = 4.',
        reveal: '<strong>b = 4</strong>, karena (26 − 14) : (5 − 2) = 12 : 3 = 4.',
      },
      {
        type: 'choice',
        cerita: 'Raka membuat barisan aritmetika dengan suku pertama 6 dan beda −4.',
        pertanyaan: 'Empat suku pertama barisan itu adalah …',
        options: [
          { id: 'benar', label: '6, 2, −2, −6' },
          { id: 'tambah', label: '6, 10, 14, 18' },
          { id: 'kali', label: '6, −24, 96, −384' },
          { id: 'mulaiB', label: '−4, 2, 8, 14' },
        ],
        correct: 'benar',
        cek: { a: 6, b: -4, n: 4, terms: [6, 2, -2, -6] },
        explanation: 'Mulai dari 6, lalu setiap langkah dikurangi 4: 6, 2, −2, −6.',
      },
    ],
    nextLabel: 'Lanjut: Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses penyelidikan dan pemahaman tentang barisan aritmetika.',
    guru: 'Baca beberapa refleksi secara anonim di depan kelas. Gunakan jawaban penilaian diri untuk menentukan murid yang perlu pendampingan pada pertemuan berikutnya.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan dengan kata-katamu sendiri: apa itu barisan aritmetika?',
        placeholder: 'Barisan aritmetika adalah …',
      },
      {
        id: 'r2',
        teks: 'Bagaimana hipotesis awalmu berubah setelah mengumpulkan data?',
        placeholder: 'Awalnya aku menduga … ternyata …',
      },
      {
        id: 'r3',
        teks: 'Buat satu contoh barisan aritmetika dari dunia RPL, lalu tentukan bedanya.',
        placeholder: 'Contoh: …, bedanya …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu dapat menentukan beda suatu barisan sekarang?',
    diriOpsi: [
      { id: 'sangat', label: 'Sangat yakin — bisa menjelaskan ke teman' },
      { id: 'yakin', label: 'Yakin, tetapi masih perlu berlatih' },
      { id: 'ragu', label: 'Masih ragu, terutama pada barisan turun' },
      { id: 'bingung', label: 'Belum paham, perlu dibantu' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Penyelidikan Selesai!',
    teks: 'Kamu sudah menyelidiki sendiri ciri barisan aritmetika dan cara menentukan bedanya.',
    capaian: [
      'Merumuskan masalah dan hipotesis tentang pola barisan bilangan.',
      'Mengumpulkan data selisih dan menguji hipotesis dengan data.',
      'Mengidentifikasi barisan aritmetika dan bukan barisan aritmetika.',
      'Menentukan beda barisan naik, turun, konstan, dan berdesimal.',
    ],
    berikutnya:
      'Pertanyaan untuk materi berikutnya: jika kamu tahu suku pertama dan bedanya, bagaimana menentukan suku ke-100 tanpa menulis semua suku?',
  },
};
