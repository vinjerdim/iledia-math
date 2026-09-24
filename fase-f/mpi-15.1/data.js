'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Peluang Kejadian Majemuk
   Fase F (Kelas XII) — SMK Rekayasa Perangkat Lunak
   Topik 15: Peluang dan Frekuensi Harapan

   Tujuan Pembelajaran:
   Menjelaskan konsep peluang kejadian majemuk (saling lepas, tidak
   saling lepas, dan saling bebas) melalui percobaan dan pengamatan
   pada kasus dadu, koin, dan kartu. Menentukan peluang kejadian
   majemuk dengan rumus yang sesuai pada permasalahan kontekstual.

   Model pembelajaran: INQUIRY LEARNING (Inkuiri Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Orientasi .................. tahap 'orientasi'
     Sintaks 2 — Merumuskan masalah ......... tahap 'masalah'
     Sintaks 3 — Merumuskan hipotesis ....... tahap 'hipotesis'
     Sintaks 4 — Mengumpulkan data .......... tahap 'dataDadu' & 'dataKoinKartu'
     Sintaks 5 — Menguji hipotesis .......... tahap 'uji'
     Sintaks 6 — Merumuskan kesimpulan ...... tahap 'simpulan'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 45 menit, murid berpasangan):
     1. Orientasi  (8')  — Raka & tim membuat game papan digital
                           "PapanKode" dengan tiga aturan: bonus dadu
                           (jumlah 7 ATAU kembar), power-up kartu (As
                           ATAU Hati), giliran ganda (koin Angka DAN
                           dadu genap). Murid mencoba simulator dadu,
                           lalu MENDUGA apakah cara hitung Nadia
                           ("tinggal dijumlah") benar (tidak dinilai).
     2. Masalah    (5')  — memilih rumusan masalah penyelidikan.
     3. Hipotesis  (7')  — menduga untuk empat kasus: bolehkah
                           peluang langsung dijumlah / dikali? lalu
                           menulis hipotesis dengan kalimat sendiri.
     4. Data dadu  (20') — A: simulator 2 dadu (frekuensi relatif
                           A, B, A ∪ B, A ∩ B) + pertanyaan pengamatan;
                           B: menandai ruang sampel 6 × 6 untuk dua
                           pasangan kejadian (saling lepas vs tidak
                           saling lepas) lalu menghitung peluangnya
                           (isian pecahan berdiagnosis).
     5. Data koin  (20') — A: koin + dadu (grid 2 × 6 & simulator):
        & kartu            P(A ∩ B) = P(A) × P(B) → saling bebas.
                           B: kartu remi (grid 4 × 13): As & Hati —
                           tidak saling lepas tetapi saling bebas.
                           C: dua kartu dengan vs tanpa pengembalian
                           (dua simulator) → bebas vs tidak bebas.
     6. Uji        (12') — membandingkan hipotesis dengan data,
                           pertanyaan penuntun, memilah delapan kasus
                           ke rumus yang tepat, menguji rumus.
     7. Simpulan   (5')  — menyusun kesimpulan dari bank kalimat acak.
     8. Uji terap  (15') — delapan soal kontekstual RPL (server,
                           laporan bug, game) — isian & pilihan ganda.
     9. Refleksi   (3')  — rekap, refleksi tertulis, penilaian diri.

   Metadata `cek` pada setiap langkah isian/soal dipakai tes untuk
   menghitung ulang kunci jawaban dari ruang sampel (shared/engine.js):
     { ruang, A, B, tanya }       jawab = nilaiSifat(sifatKejadian(ruang, A, B), tanya)
     { rumus: 'kali', pA, pB }    jawab = pA × pB
     { rumus: 'gabungan', pA, pB, pIrisan }  jawab = pA + pB − pIrisan

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan, sehingga tiap murid
   (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var IL = 'Inquiry Learning';

var DATA = {
  kasus: {
    nama: 'Raka',
    game: 'PapanKode',
  },

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Uji.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    syntax: IL + ' · Sintaks 1',
    goal: 'Mengamati aturan game yang melibatkan dua kejadian sekaligus, lalu menduga cara menghitung peluangnya.',
    guru: 'Tayangkan aturan game PapanKode dan biarkan murid mencoba simulator dadu beberapa kali. Tanyakan: "Apakah peluang bonus cukup dihitung dengan menjumlahkan dua peluang?" Tampung semua dugaan beserta alasannya tanpa dibenarkan atau disalahkan — perbedaan dugaan menjadi bahan penyelidikan.',
    judul: 'Game Papan Digital "PapanKode"',
    cerita:
      'Raka dan timnya di kelas XII RPL sedang membuat game papan digital PapanKode. Agar game adil, mereka harus tahu peluang setiap aturan khusus terjadi. Ada tiga aturan yang melibatkan DUA kejadian sekaligus:',
    aturan: [
      {
        ikon: '🎲',
        nama: 'Bonus langkah',
        teks: 'Pemain melempar dua dadu. Bonus didapat jika jumlah mata dadu 7 ATAU mata dadu kembar.',
      },
      {
        ikon: '🃏',
        nama: 'Power-up',
        teks: 'Pemain mengambil satu kartu dari dek remi 52 kartu. Power-up didapat jika kartunya As ATAU Hati.',
      },
      {
        ikon: '🪙',
        nama: 'Giliran ganda',
        teks: 'Pemain melempar satu koin dan satu dadu. Giliran ganda didapat jika koin Angka DAN dadu genap.',
      },
    ],
    klaim:
      'Nadia, anggota tim, berkata: "Gampang! Bonus = P(jumlah 7) + P(kembar) = 6/36 + 6/36. Power-up = P(As) + P(Hati) = 4/52 + 13/52. Tinggal dijumlah saja."',
    simulator: {
      judul: 'Coba lempar dua dadu PapanKode',
      ruang: 'duaDadu',
      kejadian: [{ id: 'jumlah:7|kembar', label: 'Dapat bonus (jumlah 7 atau kembar)' }],
      tombol: [1, 10],
      batas: 200,
    },
    pertanyaan: 'Menurut dugaanmu, apakah cara Nadia ("tinggal dijumlah") tepat?',
    opsi: [
      { id: 'bonus', label: 'Tepat untuk aturan bonus, tetapi tidak untuk power-up' },
      { id: 'keduanya', label: 'Tepat untuk kedua aturan' },
      { id: 'powerup', label: 'Tepat untuk power-up, tetapi tidak untuk aturan bonus' },
      { id: 'tidak', label: 'Tidak tepat untuk keduanya' },
    ],
    alasanLabel: 'Apa alasan dugaanmu?',
    alasanPlaceholder: 'Contoh: menurutku bisa/tidak bisa dijumlah karena …',
    catatan:
      'Belum ada jawaban benar atau salah di sini. Simpan dugaanmu — kamu akan mengujinya sendiri dengan data percobaan.',
    nextLabel: 'Simpan Dugaan & Lanjut →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MERUMUSKAN MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    syntax: IL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan penyelidikan tentang peluang dua kejadian.',
    guru: 'Arahkan murid pada dua kata kunci: "atau" (gabungan, A ∪ B) dan "dan" (irisan, A ∩ B). Tuliskan rumusan masalah terpilih di papan sebagai pertanyaan kelas hari ini.',
    pengantar:
      'Tim PapanKode tidak bisa menebak-nebak: jika peluang aturan khusus salah hitung, game menjadi terlalu mudah atau terlalu sulit. Mereka perlu tahu kapan peluang dua kejadian boleh langsung dijumlah atau dikali.',
    pertanyaan: 'Rumusan masalah mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'rumus',
        label:
          'Kapan peluang "A atau B" boleh dihitung P(A) + P(B), kapan peluang "A dan B" boleh dihitung P(A) × P(B), dan rumus apa yang tepat jika tidak boleh?',
      },
      { id: 'animasi', label: 'Bagaimana membuat animasi dadu berputar di PapanKode?' },
      { id: 'menang', label: 'Siapa pemain yang paling sering menang di PapanKode?' },
      { id: 'banyak', label: 'Berapa banyak kartu dalam satu dek remi?' },
    ],
    correct: 'rumus',
    umpan: {
      rumus:
        '<strong>Tepat.</strong> Pertanyaan ini bisa diselidiki dengan percobaan dan ruang sampel, dan jawabannya menentukan rumus peluang yang dipakai tim.',
      animasi:
        'Itu pertanyaan pemrograman grafis, bukan pertanyaan tentang peluang. Coba pilih lagi.',
      menang:
        'Itu bergantung pada banyak hal (strategi, keberuntungan). Kita perlu pertanyaan tentang cara menghitung peluang dua kejadian. Coba pilih lagi.',
      banyak: 'Faktanya 52 kartu — sudah diketahui, tidak perlu diselidiki. Coba pilih lagi.',
    },
    nextLabel: 'Susun Hipotesis →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — MERUMUSKAN HIPOTESIS
     `fakta` = jawaban yang nanti terbukti dari data (diuji tes
     dengan sifatKejadian). Dugaan murid tidak dinilai di sini.
     ---------------------------------------------------------- */
  hipotesis: {
    kicker: 'Tahap 3 · Merumuskan Hipotesis',
    syntax: IL + ' · Sintaks 3',
    goal: 'Menyusun dugaan sementara kapan peluang dua kejadian boleh langsung dijumlah atau dikali.',
    guru: 'Minta setiap pasangan memutuskan dugaan untuk keempat kasus dan menuliskan alasannya. Jangan membocorkan jawaban; murid akan membandingkan dugaannya dengan data pada tahap Uji.',
    instruksi:
      'Untuk setiap kasus, pilih dugaanmu. Tidak ada nilai di tahap ini — dugaan yang keliru justru menarik untuk diuji.',
    opsiDugaan: [
      { id: 'ya', label: 'Ya, boleh' },
      { id: 'tidak', label: 'Tidak boleh' },
      { id: 'ragu', label: 'Belum yakin' },
    ],
    dugaan: [
      {
        id: 'h1',
        teks: '🎲 Dua dadu: P(jumlah 7 <strong>atau</strong> kembar) = P(jumlah 7) + P(kembar)?',
        fakta: 'ya',
        cek: { ruang: 'duaDadu', A: 'jumlah:7', B: 'kembar', rumus: 'jumlah' },
        bukti:
          'Tidak ada hasil yang jumlahnya 7 sekaligus kembar (A ∩ B = ∅), jadi P(A ∪ B) = 6/36 + 6/36 = 12/36.',
      },
      {
        id: 'h2',
        teks: '🎲 Dua dadu: P(jumlah 8 <strong>atau</strong> kembar) = P(jumlah 8) + P(kembar)?',
        fakta: 'tidak',
        cek: { ruang: 'duaDadu', A: 'jumlah:8', B: 'kembar', rumus: 'jumlah' },
        bukti:
          'Hasil (4, 4) termasuk keduanya dan terhitung dua kali: 5/36 + 6/36 = 11/36, padahal P(A ∪ B) = 10/36.',
      },
      {
        id: 'h3',
        teks: '🪙 Koin & dadu: P(Angka <strong>dan</strong> genap) = P(Angka) × P(genap)?',
        fakta: 'ya',
        cek: { ruang: 'koinDadu', A: 'koin:A', B: 'dadu:genap', rumus: 'kali' },
        bukti: 'Hasil koin tidak memengaruhi dadu: P(A ∩ B) = 3/12 = 1/4 = 1/2 × 1/2.',
      },
      {
        id: 'h4',
        teks: '🃏 Ambil dua kartu <em>tanpa pengembalian</em>: P(As <strong>dan</strong> As) = P(As) × P(As) = 1/13 × 1/13?',
        fakta: 'tidak',
        cek: { ruang: 'duaKartuTanpa', A: 'k1:nilai:A', B: 'k2:nilai:A', rumus: 'kali' },
        bukti:
          'Setelah As pertama diambil, tersisa 3 As dari 51 kartu: P = 4/52 × 3/51 = 1/221, bukan 1/169.',
      },
    ],
    hipotesisLabel:
      'Tulis hipotesismu: kapan peluang dua kejadian boleh langsung dijumlah atau dikali?',
    hipotesisPlaceholder:
      'Contoh: peluang "A atau B" boleh dijumlah jika …; peluang "A dan B" boleh dikali jika …',
    nextLabel: 'Mulai Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — MENGUMPULKAN DATA: DUA DADU
     ---------------------------------------------------------- */
  dataDadu: {
    kicker: 'Tahap 4 · Mengumpulkan Data (Dadu)',
    syntax: IL + ' · Sintaks 4',
    goal: 'Mengumpulkan data frekuensi dan ruang sampel dua dadu untuk kejadian saling lepas dan tidak saling lepas.',
    guru: 'Bagi kelas: separuh pasangan menjalankan 100 lemparan, separuh lagi 1.000 lemparan, lalu bandingkan frekuensi relatifnya. Saat menandai grid, tanyakan: "Adakah sel yang ditandai A dan B sekaligus?" Jika murid menjawab P(A ∪ B) = 11/36 untuk jumlah 8 atau kembar, minta mereka menghitung sel bertanda secara langsung.',
    judulA: 'A. Percobaan: lempar dua dadu berkali-kali',
    instruksiA:
      'Lakukan paling sedikit 100 lemparan. Amati frekuensi setiap kejadian, terutama baris "atau" dan "dan".',
    minimal: 100,
    simulator: {
      ruang: 'duaDadu',
      tombol: [10, 100, 1000],
      batas: 10000,
      kejadian: [
        { id: 'jumlah:7', label: 'Jumlah 7' },
        { id: 'kembar', label: 'Kembar' },
        { id: 'jumlah:7|kembar', label: 'Jumlah 7 <strong>atau</strong> kembar' },
        { id: 'jumlah:7&kembar', label: 'Jumlah 7 <strong>dan</strong> kembar' },
        { id: 'jumlah:8', label: 'Jumlah 8' },
        { id: 'jumlah:8|kembar', label: 'Jumlah 8 <strong>atau</strong> kembar' },
        { id: 'jumlah:8&kembar', label: 'Jumlah 8 <strong>dan</strong> kembar' },
      ],
    },
    amati: [
      {
        id: 'd1',
        tanya: 'Perhatikan baris "jumlah 7 <strong>dan</strong> kembar". Apa yang kamu amati?',
        opsi: [
          {
            id: 'nol',
            label:
              'Frekuensinya selalu 0 — tidak pernah ada lemparan berjumlah 7 yang sekaligus kembar.',
          },
          { id: 'sama', label: 'Frekuensinya sama dengan baris "kembar".' },
          { id: 'setengah', label: 'Frekuensinya kira-kira setengah dari baris "jumlah 7".' },
          { id: 'acak', label: 'Kadang 0, kadang besar; tidak ada polanya.' },
        ],
        correct: 'nol',
        umpan: {
          nol: '<strong>Tepat.</strong> Jumlah 7 selalu dari dua mata berbeda (1+6, 2+5, 3+4, …), jadi tidak mungkin kembar. Kedua kejadian ini <em>tidak pernah terjadi bersamaan</em>.',
          sama: 'Coba lihat lagi angkanya. Bisakah dua dadu kembar berjumlah 7? Pasangan kembar: (1,1), (2,2), …, (6,6).',
          setengah:
            'Lihat lagi angkanya. Coba cari satu hasil dadu kembar yang jumlahnya 7 — adakah?',
          acak: 'Lakukan lebih banyak lemparan. Apakah baris itu pernah lebih dari 0?',
        },
      },
      {
        id: 'd2',
        tanya:
          'Bandingkan frekuensi "jumlah 7 <strong>atau</strong> kembar" dengan frekuensi "jumlah 7" + frekuensi "kembar".',
        opsi: [
          { id: 'sama', label: 'Keduanya selalu sama persis.' },
          { id: 'lebih', label: 'Frekuensi "atau" selalu lebih besar daripada jumlahnya.' },
          { id: 'kurang', label: 'Frekuensi "atau" selalu lebih kecil daripada jumlahnya.' },
          { id: 'tentu', label: 'Tidak bisa dibandingkan karena hasilnya acak.' },
        ],
        correct: 'sama',
        umpan: {
          sama: '<strong>Tepat.</strong> Karena tidak ada lemparan yang terhitung di kedua baris, frekuensi gabungan = jumlah kedua frekuensi.',
          lebih: 'Coba jumlahkan dua angka itu dengan teliti, lalu bandingkan dengan baris "atau".',
          kurang:
            'Untuk pasangan jumlah 7 dan kembar, coba jumlahkan lagi dengan teliti. Pola "lebih kecil" nanti kamu temukan pada pasangan lain.',
          tentu:
            'Walau hasilnya acak, hubungan antarbaris selalu tetap. Coba jumlahkan dua angka itu.',
        },
      },
      {
        id: 'd3',
        tanya:
          'Sekarang bandingkan frekuensi "jumlah 8 <strong>atau</strong> kembar" dengan frekuensi "jumlah 8" + frekuensi "kembar".',
        opsi: [
          {
            id: 'kurang',
            label:
              'Frekuensi "atau" lebih kecil; selisihnya sama dengan frekuensi "jumlah 8 dan kembar".',
          },
          { id: 'sama', label: 'Keduanya selalu sama persis, seperti pasangan jumlah 7.' },
          { id: 'lebih', label: 'Frekuensi "atau" lebih besar daripada jumlahnya.' },
          { id: 'dua', label: 'Frekuensi "atau" selalu dua kali frekuensi "jumlah 8".' },
        ],
        correct: 'kurang',
        umpan: {
          kurang:
            '<strong>Tepat.</strong> Lemparan (4, 4) berjumlah 8 <em>dan</em> kembar, sehingga terhitung di dua baris. Kalau langsung dijumlah, lemparan itu terhitung dua kali.',
          sama: 'Coba jumlahkan dengan teliti. Adakah lemparan yang jumlahnya 8 sekaligus kembar? Lihat baris "dan".',
          lebih: 'Gabungan tidak mungkin lebih banyak dari jumlah kedua baris. Hitung lagi.',
          dua: 'Tidak ada hubungan seperti itu. Bandingkan dengan jumlah frekuensi "jumlah 8" dan "kembar".',
        },
      },
    ],
    judulB: 'B. Ruang sampel dua dadu (36 hasil)',
    instruksiB:
      'Ketuk sel untuk menandai anggota kejadian. Pilih lapis A atau B di atas grid, tandai semua anggotanya, lalu tekan Periksa. Setelah tanda benar, hitung peluangnya.',
    pasangan: [
      {
        id: 'p1',
        judul: 'Pasangan 1',
        ruang: 'duaDadu',
        A: 'jumlah:7',
        B: 'kembar',
        labelA: 'A: jumlah 7',
        labelB: 'B: kembar',
        langkah: [
          {
            label: 'Banyak anggota A, n(A) = …',
            jawab: 6,
            cek: { ruang: 'duaDadu', A: 'jumlah:7', B: 'kembar', tanya: 'nA' },
            hints: ['Hitung sel bertanda biru.'],
            temuan: 'n(A) = 6: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1).',
          },
          {
            label: 'Banyak hasil yang termasuk A <strong>dan</strong> B, n(A ∩ B) = …',
            jawab: 0,
            cek: { ruang: 'duaDadu', A: 'jumlah:7', B: 'kembar', tanya: 'nIrisan' },
            hints: ['Cari sel bergaris ungu (ditandai A dan B sekaligus).'],
            temuan:
              'n(A ∩ B) = 0. A dan B tidak mempunyai anggota bersama — A dan B <strong>saling lepas</strong>.',
          },
          {
            label: 'P(A) + P(B) = 6/36 + 6/36 = … (tulis pecahan)',
            jawab: 1 / 3,
            rational: true,
            cek: { ruang: 'duaDadu', A: 'jumlah:7', B: 'kembar', tanya: 'pA+pB' },
            hints: ['Jumlahkan pembilangnya: 6 + 6 = 12, penyebutnya tetap 36.'],
            temuan: 'P(A) + P(B) = 12/36 = 1/3.',
          },
          {
            label: 'Hitung sel yang bertanda A atau B, lalu P(A ∪ B) = n(A ∪ B)/36 = …',
            jawab: 1 / 3,
            rational: true,
            cek: { ruang: 'duaDadu', A: 'jumlah:7', B: 'kembar', tanya: 'pGabungan' },
            hints: ['Sel bertanda (biru atau oranye) ada 6 + 6 = 12.'],
            temuan:
              'P(A ∪ B) = 12/36 = 1/3 — <strong>sama</strong> dengan P(A) + P(B). Untuk kejadian saling lepas, peluang "atau" boleh langsung dijumlah.',
          },
        ],
      },
      {
        id: 'p2',
        judul: 'Pasangan 2',
        ruang: 'duaDadu',
        A: 'jumlah:8',
        B: 'kembar',
        labelA: 'A: jumlah 8',
        labelB: 'B: kembar',
        langkah: [
          {
            label: 'Banyak anggota A, n(A) = …',
            jawab: 5,
            cek: { ruang: 'duaDadu', A: 'jumlah:8', B: 'kembar', tanya: 'nA' },
            hints: ['Hitung sel bertanda biru: (2,6), (3,5), …'],
            temuan: 'n(A) = 5: (2,6), (3,5), (4,4), (5,3), (6,2).',
          },
          {
            label: 'n(A ∩ B) = …',
            jawab: 1,
            cek: { ruang: 'duaDadu', A: 'jumlah:8', B: 'kembar', tanya: 'nIrisan' },
            hints: ['Cari sel bergaris ungu.'],
            temuan:
              'n(A ∩ B) = 1, yaitu (4, 4). A dan B mempunyai anggota bersama — A dan B <strong>tidak saling lepas</strong>.',
          },
          {
            label: 'P(A) + P(B) = 5/36 + 6/36 = … (tulis pecahan)',
            jawab: 11 / 36,
            rational: true,
            cek: { ruang: 'duaDadu', A: 'jumlah:8', B: 'kembar', tanya: 'pA+pB' },
            hints: ['5 + 6 = 11, penyebutnya tetap 36.'],
            temuan: 'P(A) + P(B) = 11/36.',
          },
          {
            label: 'Hitung sel yang bertanda A atau B, lalu P(A ∪ B) = n(A ∪ B)/36 = …',
            jawab: 5 / 18,
            rational: true,
            cek: { ruang: 'duaDadu', A: 'jumlah:8', B: 'kembar', tanya: 'pGabungan' },
            hints: [
              'Sel (4, 4) cukup dihitung sekali: 5 + 6 − 1.',
              'n(A ∪ B) = 10, jadi P(A ∪ B) = 10/36.',
            ],
            temuan:
              'P(A ∪ B) = 10/36 = 5/18 — <strong>lebih kecil 1/36</strong> daripada P(A) + P(B). Selisihnya tepat P(A ∩ B), karena (4, 4) terhitung dua kali.',
          },
        ],
      },
    ],
    nextLabel: 'Lanjut: Koin & Kartu →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — MENGUMPULKAN DATA: KOIN & KARTU
     ---------------------------------------------------------- */
  dataKoinKartu: {
    kicker: 'Tahap 5 · Mengumpulkan Data (Koin & Kartu)',
    syntax: IL + ' · Sintaks 4',
    goal: 'Mengumpulkan data kejadian "A dan B" pada koin, dadu, dan kartu untuk menyelidiki kejadian saling bebas.',
    guru: 'Tekankan perbedaan dua pertanyaan: "Apakah A dan B bisa terjadi bersamaan?" (saling lepas) dan "Apakah terjadinya A mengubah peluang B?" (saling bebas). Pada bagian C, minta murid menjalankan 1.000 percobaan beberapa kali agar frekuensi "As dan As" terlihat berbeda.',
    bagianA: {
      judul: 'A. Koin dan dadu dilempar bersamaan (12 hasil)',
      instruksi:
        'Tandai A = koin Angka dan B = dadu genap pada ruang sampel, lalu hitung peluangnya. Simulator membantu mengamati frekuensinya.',
      ruang: 'koinDadu',
      A: 'koin:A',
      B: 'dadu:genap',
      labelA: 'A: koin Angka',
      labelB: 'B: dadu genap',
      simulator: {
        ruang: 'koinDadu',
        tombol: [10, 100, 1000],
        batas: 10000,
        kejadian: [
          { id: 'koin:A', label: 'Koin Angka' },
          { id: 'dadu:genap', label: 'Dadu genap' },
          { id: 'koin:A&dadu:genap', label: 'Angka <strong>dan</strong> genap' },
        ],
      },
      langkah: [
        {
          label: 'P(A) = n(A)/12 = … (tulis pecahan)',
          jawab: 1 / 2,
          rational: true,
          cek: { ruang: 'koinDadu', A: 'koin:A', B: 'dadu:genap', tanya: 'pA' },
          hints: ['Satu baris penuh (6 sel) bertanda A.'],
          temuan: 'P(A) = 6/12 = 1/2.',
        },
        {
          label: 'P(B) = n(B)/12 = …',
          jawab: 1 / 2,
          rational: true,
          cek: { ruang: 'koinDadu', A: 'koin:A', B: 'dadu:genap', tanya: 'pB' },
          hints: ['Kolom 2, 4, 6 di kedua baris.'],
          temuan: 'P(B) = 6/12 = 1/2.',
        },
        {
          label: 'Dari grid: P(A ∩ B) = n(A ∩ B)/12 = …',
          jawab: 1 / 4,
          rational: true,
          cek: { ruang: 'koinDadu', A: 'koin:A', B: 'dadu:genap', tanya: 'pIrisan' },
          hints: ['Hitung sel bergaris ungu: (A, 2), (A, 4), (A, 6).'],
          temuan: 'P(A ∩ B) = 3/12 = 1/4.',
        },
        {
          label: 'P(A) × P(B) = 1/2 × 1/2 = …',
          jawab: 1 / 4,
          rational: true,
          cek: { ruang: 'koinDadu', A: 'koin:A', B: 'dadu:genap', tanya: 'pA*pB' },
          hints: ['Kalikan pembilang dengan pembilang, penyebut dengan penyebut.'],
          temuan:
            'P(A) × P(B) = 1/4 = P(A ∩ B). Hasil koin tidak memengaruhi dadu — A dan B <strong>saling bebas</strong>, sehingga peluang "dan" boleh langsung dikali.',
        },
      ],
    },
    bagianB: {
      judul: 'B. Satu kartu dari dek remi (52 hasil)',
      instruksi:
        'Aturan power-up: kartu As atau Hati. Tandai A = As dan B = Hati, lalu hitung peluangnya.',
      ruang: 'kartu',
      A: 'nilai:A',
      B: 'jenis:hati',
      labelA: 'A: As',
      labelB: 'B: Hati',
      langkah: [
        {
          label: 'n(A ∩ B) = …',
          jawab: 1,
          cek: { ruang: 'kartu', A: 'nilai:A', B: 'jenis:hati', tanya: 'nIrisan' },
          hints: ['Kartu mana yang As sekaligus Hati?'],
          temuan: 'n(A ∩ B) = 1, yaitu A♥. As dan Hati <strong>tidak saling lepas</strong>.',
        },
        {
          label: 'P(A ∪ B) = n(A ∪ B)/52 = … (tulis pecahan)',
          jawab: 4 / 13,
          rational: true,
          cek: { ruang: 'kartu', A: 'nilai:A', B: 'jenis:hati', tanya: 'pGabungan' },
          hints: [
            '4 As + 13 Hati, tetapi A♥ cukup dihitung sekali.',
            'n(A ∪ B) = 4 + 13 − 1 = 16.',
          ],
          temuan:
            'P(A ∪ B) = 16/52 = 4/13 = 4/52 + 13/52 − 1/52. Cara Nadia (17/52) kelebihan satu kartu.',
        },
        {
          label: 'P(A ∩ B) = n(A ∩ B)/52 = …',
          jawab: 1 / 52,
          rational: true,
          cek: { ruang: 'kartu', A: 'nilai:A', B: 'jenis:hati', tanya: 'pIrisan' },
          hints: ['Hanya satu kartu dari 52.'],
          temuan: 'P(A ∩ B) = 1/52.',
        },
        {
          label: 'P(A) × P(B) = 4/52 × 13/52 = …',
          jawab: 1 / 52,
          rational: true,
          cek: { ruang: 'kartu', A: 'nilai:A', B: 'jenis:hati', tanya: 'pA*pB' },
          hints: ['4/52 = 1/13 dan 13/52 = 1/4.'],
          temuan:
            'P(A) × P(B) = 1/13 × 1/4 = 1/52 = P(A ∩ B). Mengetahui kartunya Hati tidak mengubah peluang As (tetap 1 dari 13). As dan Hati <strong>tidak saling lepas, tetapi saling bebas</strong> — dua sifat yang berbeda!',
        },
      ],
    },
    bagianC: {
      judul: 'C. Mengambil dua kartu berturut-turut',
      instruksi:
        'Bandingkan dua cara: kartu pertama dikembalikan dulu, atau tidak dikembalikan. Jalankan 1.000 percobaan beberapa kali pada kedua simulator.',
      simulatorKembali: {
        judul: 'Dengan pengembalian',
        ruang: 'duaKartuKembali',
        tombol: [100, 1000],
        batas: 50000,
        kejadian: [
          { id: 'k1:nilai:A', label: 'Kartu 1 As' },
          { id: 'k2:nilai:A', label: 'Kartu 2 As' },
          { id: 'k1:nilai:A&k2:nilai:A', label: 'As <strong>dan</strong> As' },
        ],
      },
      simulatorTanpa: {
        judul: 'Tanpa pengembalian',
        ruang: 'duaKartuTanpa',
        tombol: [100, 1000],
        batas: 50000,
        kejadian: [
          { id: 'k1:nilai:A', label: 'Kartu 1 As' },
          { id: 'k2:nilai:A', label: 'Kartu 2 As' },
          { id: 'k1:nilai:A&k2:nilai:A', label: 'As <strong>dan</strong> As' },
        ],
      },
      minimal: 1000,
      langkah: [
        {
          label: 'Dengan pengembalian: P(As dan As) = 4/52 × 4/52 = … (tulis pecahan)',
          jawab: 1 / 169,
          rational: true,
          cek: { ruang: 'duaKartuKembali', A: 'k1:nilai:A', B: 'k2:nilai:A', tanya: 'pIrisan' },
          hints: ['4/52 = 1/13.', '1/13 × 1/13 = 1/169.'],
          temuan:
            'P = 1/169 ≈ 0,006. Kartu dikembalikan, jadi pengambilan kedua sama seperti awal — kejadiannya <strong>saling bebas</strong>.',
        },
        {
          label:
            'Tanpa pengembalian: setelah As pertama diambil, tersisa 3 As dari 51 kartu. P(As dan As) = 4/52 × 3/51 = …',
          jawab: 1 / 221,
          rational: true,
          cek: { ruang: 'duaKartuTanpa', A: 'k1:nilai:A', B: 'k2:nilai:A', tanya: 'pIrisan' },
          hints: ['4 × 3 = 12 dan 52 × 51 = 2.652.', '12/2.652 disederhanakan dengan membagi 12.'],
          temuan:
            'P = 12/2.652 = 1/221 ≈ 0,0045 — lebih kecil daripada 1/169. Kejadian pertama mengubah peluang kejadian kedua, jadi <strong>tidak saling bebas</strong>.',
        },
      ],
      tanya: {
        id: 'c1',
        tanya: 'Mengapa P(As dan As) tanpa pengembalian tidak sama dengan 1/13 × 1/13?',
        opsi: [
          {
            id: 'berubah',
            label:
              'Kartu pertama tidak dikembalikan, sehingga isi dek (dan peluang kartu kedua) berubah.',
          },
          { id: 'lepas', label: 'Karena As pertama dan As kedua saling lepas.' },
          { id: 'acak', label: 'Karena simulatornya acak, jadi hasilnya kebetulan saja.' },
          { id: 'jumlah', label: 'Karena seharusnya dijumlah: 1/13 + 1/13.' },
        ],
        correct: 'berubah',
        umpan: {
          berubah:
            '<strong>Tepat.</strong> Bila As pertama terambil, peluang As kedua menjadi 3/51, bukan 4/52. Kejadian pertama memengaruhi kejadian kedua.',
          lepas:
            'Keduanya bisa terjadi bersamaan (ada 12 pasangan As–As), jadi tidak saling lepas. Pikirkan apa yang berubah setelah kartu pertama diambil.',
          acak: 'Selisihnya juga terlihat pada perhitungan eksak (1/169 vs 1/221), bukan kebetulan.',
          jumlah:
            'Kata "dan" menanyakan irisan; menjumlah justru membuat peluangnya lebih besar. Coba lagi.',
        },
      },
    },
    nextLabel: 'Uji Hipotesisku →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENGUJI HIPOTESIS
     ---------------------------------------------------------- */
  uji: {
    kicker: 'Tahap 6 · Menguji Hipotesis',
    syntax: IL + ' · Sintaks 5',
    goal: 'Membandingkan hipotesis dengan data, lalu memilih rumus yang tepat untuk berbagai pasangan kejadian.',
    guru: 'Minta beberapa pasangan membacakan hipotesis awal dan menyatakan apakah hipotesisnya diterima atau perlu diperbaiki berdasarkan data. Soroti kasus As & Hati: tidak saling lepas tetapi saling bebas.',
    judulBanding: 'Hipotesismu vs data',
    tanya: [
      {
        id: 'u1',
        tanya: 'Kapan P(A ∪ B) boleh dihitung langsung P(A) + P(B)?',
        opsi: [
          { id: 'lepas', label: 'Jika A dan B saling lepas (tidak mempunyai anggota bersama).' },
          { id: 'selalu', label: 'Selalu boleh, untuk semua pasangan kejadian.' },
          { id: 'bebas', label: 'Jika A dan B saling bebas.' },
          { id: 'besar', label: 'Jika P(A) dan P(B) kurang dari 1/2.' },
        ],
        correct: 'lepas',
        umpan: {
          lepas:
            '<strong>Tepat.</strong> Jika A ∩ B = ∅, tidak ada hasil yang terhitung dua kali, sehingga P(A ∪ B) = P(A) + P(B).',
          selalu:
            'Ingat pasangan jumlah 8 dan kembar: 5/36 + 6/36 = 11/36, padahal P(A ∪ B) = 10/36.',
          bebas:
            'As dan Hati saling bebas, tetapi 4/52 + 13/52 = 17/52 ≠ 16/52. Syaratnya bukan saling bebas.',
          besar:
            'Besar kecilnya peluang tidak menentukan. Yang menentukan adalah ada tidaknya anggota bersama.',
        },
      },
      {
        id: 'u2',
        tanya: 'Jika A dan B tidak saling lepas, mengapa P(A ∩ B) harus dikurangkan?',
        opsi: [
          {
            id: 'dua',
            label:
              'Karena hasil di A ∩ B sudah terhitung di P(A) dan juga di P(B), jadi terhitung dua kali.',
          },
          { id: 'kecil', label: 'Agar hasilnya lebih kecil dan lebih aman untuk game.' },
          { id: 'lepas', label: 'Karena A ∩ B tidak termasuk kejadian "A atau B".' },
          { id: 'kali', label: 'Karena P(A ∩ B) selalu sama dengan P(A) × P(B).' },
        ],
        correct: 'dua',
        umpan: {
          dua: '<strong>Tepat.</strong> Jadi P(A ∪ B) = P(A) + P(B) − P(A ∩ B).',
          kecil: 'Rumus peluang tidak dibuat berdasarkan selera; lihat lagi sel (4, 4) pada grid.',
          lepas: 'Justru A ∩ B termasuk "A atau B". Masalahnya, hasil itu terhitung dua kali.',
          kali: 'P(A ∩ B) = P(A) × P(B) hanya berlaku untuk kejadian saling bebas.',
        },
      },
      {
        id: 'u3',
        tanya: 'Kapan P(A ∩ B) boleh dihitung langsung P(A) × P(B)?',
        opsi: [
          {
            id: 'bebas',
            label: 'Jika terjadinya A tidak memengaruhi peluang terjadinya B (saling bebas).',
          },
          { id: 'lepas', label: 'Jika A dan B saling lepas.' },
          { id: 'selalu', label: 'Selalu boleh untuk kata "dan".' },
          { id: 'sama', label: 'Hanya jika P(A) = P(B).' },
        ],
        correct: 'bebas',
        umpan: {
          bebas:
            '<strong>Tepat.</strong> Koin & dadu, atau dua kartu dengan pengembalian, adalah contoh kejadian saling bebas.',
          lepas:
            'Jika A dan B saling lepas, P(A ∩ B) = 0, padahal P(A) × P(B) biasanya bukan 0. Coba lagi.',
          selalu:
            'Dua kartu tanpa pengembalian: 1/13 × 1/13 = 1/169, padahal P(As dan As) = 1/221.',
          sama: 'Pada As & Hati, P(A) = 1/13 dan P(B) = 1/4, tetapi tetap berlaku P(A ∩ B) = P(A) × P(B).',
        },
      },
      {
        id: 'u4',
        tanya: 'Kesimpulan yang benar tentang kartu As (A) dan kartu Hati (B) adalah …',
        opsi: [
          { id: 'tlBebas', label: 'Tidak saling lepas, tetapi saling bebas.' },
          { id: 'lepasBebas', label: 'Saling lepas dan saling bebas.' },
          { id: 'lepasTak', label: 'Saling lepas, tetapi tidak saling bebas.' },
          { id: 'tlTak', label: 'Tidak saling lepas dan tidak saling bebas.' },
        ],
        correct: 'tlBebas',
        umpan: {
          tlBebas:
            '<strong>Tepat.</strong> A♥ adalah anggota bersama (tidak saling lepas), dan P(A ∩ B) = 1/52 = 1/13 × 1/4 (saling bebas).',
          lepasBebas: 'Kartu A♥ termasuk As dan Hati sekaligus, jadi keduanya tidak saling lepas.',
          lepasTak: 'Kartu A♥ termasuk As dan Hati sekaligus, jadi keduanya tidak saling lepas.',
          tlTak: 'Periksa lagi: P(A) × P(B) = 1/13 × 1/4 = 1/52. Samakah dengan P(A ∩ B)?',
        },
      },
    ],
    judulPilah: 'Pilih rumus yang tepat',
    instruksiPilah:
      'Untuk setiap kasus, pilih rumus yang tepat untuk menghitung peluang yang ditanyakan.',
    opsiPilah: [
      { id: 'jumlah', label: 'P(A) + P(B) — saling lepas' },
      { id: 'jumlahKurang', label: 'P(A) + P(B) − P(A ∩ B) — tidak saling lepas' },
      { id: 'kali', label: 'P(A) × P(B) — saling bebas' },
    ],
    pilah: [
      {
        id: 's1',
        teks: 'Satu dadu: peluang muncul mata 1 <strong>atau</strong> mata 6.',
        correct: 'jumlah',
        cek: { ruang: 'satuDadu', A: 'dadu:1', B: 'dadu:6', tanya: 'pGabungan' },
        explanation: 'Mata 1 dan mata 6 tidak mungkin muncul bersamaan: 1/6 + 1/6 = 1/3.',
      },
      {
        id: 's2',
        teks: 'Satu kartu: peluang terambil King <strong>atau</strong> Queen.',
        correct: 'jumlah',
        cek: { ruang: 'kartu', A: 'nilai:K', B: 'nilai:Q', tanya: 'pGabungan' },
        explanation: 'Tidak ada kartu yang King sekaligus Queen: 4/52 + 4/52 = 2/13.',
      },
      {
        id: 's3',
        teks: 'Satu kartu: peluang terambil kartu merah <strong>atau</strong> King.',
        correct: 'jumlahKurang',
        cek: { ruang: 'kartu', A: 'warna:merah', B: 'nilai:K', tanya: 'pGabungan' },
        explanation: 'K♥ dan K♦ termasuk keduanya: 26/52 + 4/52 − 2/52 = 7/13.',
      },
      {
        id: 's4',
        teks: 'Satu dadu: peluang muncul mata genap <strong>atau</strong> mata prima.',
        correct: 'jumlahKurang',
        cek: { ruang: 'satuDadu', A: 'dadu:genap', B: 'dadu:prima', tanya: 'pGabungan' },
        explanation: 'Mata 2 genap sekaligus prima: 3/6 + 3/6 − 1/6 = 5/6.',
      },
      {
        id: 's5',
        teks: 'Dua dadu: peluang dadu pertama 6 <strong>atau</strong> jumlah mata 10.',
        correct: 'jumlahKurang',
        cek: { ruang: 'duaDadu', A: 'dadu1:6', B: 'jumlah:10', tanya: 'pGabungan' },
        explanation: '(6, 4) termasuk keduanya: 6/36 + 3/36 − 1/36 = 2/9.',
      },
      {
        id: 's6',
        teks: 'Koin dan dadu: peluang koin Gambar <strong>dan</strong> mata dadu 5.',
        correct: 'kali',
        cek: { ruang: 'koinDadu', A: 'koin:G', B: 'dadu:5', tanya: 'pIrisan' },
        explanation: 'Koin tidak memengaruhi dadu: 1/2 × 1/6 = 1/12.',
      },
      {
        id: 's7',
        teks: 'Dua kartu dengan pengembalian: peluang kartu pertama As <strong>dan</strong> kartu kedua King.',
        correct: 'kali',
        cek: { ruang: 'duaKartuKembali', A: 'k1:nilai:A', B: 'k2:nilai:K', tanya: 'pIrisan' },
        explanation: 'Kartu pertama dikembalikan, jadi saling bebas: 1/13 × 1/13 = 1/169.',
      },
      {
        id: 's8',
        teks: 'Dua koin: peluang koin pertama Angka <strong>dan</strong> koin kedua Angka.',
        correct: 'kali',
        cek: { ruang: 'duaKoin', A: 'koin1:A', B: 'koin2:A', tanya: 'pIrisan' },
        explanation: 'Dua koin tidak saling memengaruhi: 1/2 × 1/2 = 1/4.',
      },
    ],
    judulRumus: 'Uji rumusmu',
    langkah: [
      {
        label:
          'Kasus kartu merah atau King: P(merah ∪ King) = 26/52 + 4/52 − 2/52 = … (tulis pecahan)',
        jawab: 7 / 13,
        rational: true,
        cek: { ruang: 'kartu', A: 'warna:merah', B: 'nilai:K', tanya: 'pGabungan' },
        hints: ['26 + 4 − 2 = 28.', '28/52 disederhanakan dengan membagi 4.'],
        temuan: 'P(merah ∪ King) = 28/52 = 7/13.',
      },
      {
        label: 'Kasus dua koin: P(Angka dan Angka) = 1/2 × 1/2 = …',
        jawab: 1 / 4,
        rational: true,
        cek: { ruang: 'duaKoin', A: 'koin1:A', B: 'koin2:A', tanya: 'pIrisan' },
        hints: ['Ruang sampel dua koin: AA, AG, GA, GG.'],
        temuan: 'P = 1/4 — cocok dengan ruang sampel {AA, AG, GA, GG}: hanya AA yang memenuhi.',
      },
    ],
    nextLabel: 'Rumuskan Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MERUMUSKAN KESIMPULAN
     ---------------------------------------------------------- */
  simpulan: {
    kicker: 'Tahap 7 · Merumuskan Kesimpulan',
    syntax: IL + ' · Sintaks 6',
    goal: 'Merumuskan kesimpulan tentang kejadian saling lepas, tidak saling lepas, dan saling bebas beserta rumus peluangnya.',
    guru: 'Setelah kalimat lengkap, minta murid menjelaskan dengan kata-kata sendiri perbedaan "saling lepas" dan "saling bebas" menggunakan contoh As & Hati.',
    instruksi:
      'Lengkapi setiap awal kalimat dengan potongan yang tepat. Setiap potongan dipakai paling banyak satu kali, dan ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'Kejadian A dan B disebut saling lepas jika', correct: 'b1' },
      { id: 'k2', awal: 'Untuk kejadian saling lepas, P(A ∪ B) =', correct: 'b2' },
      { id: 'k3', awal: 'Untuk kejadian tidak saling lepas, P(A ∪ B) =', correct: 'b3' },
      { id: 'k4', awal: 'Kejadian A dan B disebut saling bebas jika', correct: 'b4' },
      { id: 'k5', awal: 'Untuk kejadian saling bebas, P(A ∩ B) =', correct: 'b5' },
    ],
    bank: [
      { id: 'b1', teks: 'keduanya tidak mempunyai anggota bersama (A ∩ B = ∅).' },
      { id: 'b2', teks: 'P(A) + P(B).' },
      { id: 'b3', teks: 'P(A) + P(B) − P(A ∩ B), karena anggota bersama terhitung dua kali.' },
      { id: 'b4', teks: 'terjadinya A tidak memengaruhi peluang terjadinya B.' },
      { id: 'b5', teks: 'P(A) × P(B).' },
      { id: 'x1', teks: 'P(A) × P(B), karena kata "atau" berarti dikali.' },
      { id: 'x2', teks: 'keduanya bisa terjadi bersamaan.' },
      { id: 'x3', teks: 'P(A) + P(B) walaupun ada anggota bersama.' },
    ],
    rumus: [
      { label: 'Saling lepas', teks: 'P(A ∪ B) = P(A) + P(B)' },
      { label: 'Tidak saling lepas', teks: 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B)' },
      { label: 'Saling bebas', teks: 'P(A ∩ B) = P(A) × P(B)' },
    ],
    rangkuman: [
      'Saling lepas: A ∩ B = ∅, sehingga P(A ∪ B) = P(A) + P(B). Contoh: jumlah 7 dan kembar.',
      'Tidak saling lepas: A ∩ B ≠ ∅, sehingga P(A ∪ B) = P(A) + P(B) − P(A ∩ B). Contoh: jumlah 8 dan kembar.',
      'Saling bebas: terjadinya A tidak mengubah peluang B, sehingga P(A ∩ B) = P(A) × P(B). Contoh: koin dan dadu; dua kartu dengan pengembalian.',
      'Tanpa pengembalian, kejadian pertama mengubah peluang kejadian kedua, sehingga tidak saling bebas.',
      '"Saling lepas" dan "saling bebas" adalah dua sifat berbeda: As dan Hati tidak saling lepas, tetapi saling bebas.',
    ],
    nextLabel: 'Terapkan Rumusnya →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP (konteks RPL)
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menentukan peluang kejadian majemuk dengan rumus yang sesuai pada masalah kontekstual.',
    guru: 'Minta murid menuliskan jenis kejadian (saling lepas, tidak saling lepas, atau saling bebas) sebelum menghitung. Bahas soal server dan laporan bug sebagai contoh penerapan di dunia kerja RPL.',
    instruksi:
      'Tentukan jenis kejadiannya, pilih rumus, lalu hitung. Jawaban boleh ditulis sebagai pecahan (5/18) atau desimal berkoma (0,72).',
    soal: [
      {
        type: 'input',
        cerita:
          'Tim PapanKode mengubah aturan bonus: dua dadu dilempar, bonus didapat jika jumlah mata dadu 9 atau mata dadu kembar.',
        pertanyaan: 'Berapa peluang pemain mendapat bonus?',
        jawab: 5 / 18,
        cek: { ruang: 'duaDadu', A: 'jumlah:9', B: 'kembar', tanya: 'pGabungan' },
        hints: [
          'Jumlah 9: (3,6), (4,5), (5,4), (6,3). Adakah yang kembar?',
          'Saling lepas: 4/36 + 6/36.',
        ],
        reveal:
          'Jumlah 9 tidak pernah kembar (saling lepas): P = 4/36 + 6/36 = 10/36 = <strong>5/18</strong>.',
      },
      {
        type: 'choice',
        cerita:
          'Power-up versi baru: satu kartu diambil dari dek remi. Power-up didapat jika kartunya kartu wajah (J, Q, K) atau Hati.',
        pertanyaan: 'Peluang mendapat power-up adalah …',
        options: [
          { id: 'a', label: '11/26', nilai: 11 / 26 },
          { id: 'b', label: '25/52', nilai: 25 / 52 },
          { id: 'c', label: '3/52', nilai: 3 / 52 },
          { id: 'd', label: '1/2', nilai: 1 / 2 },
        ],
        correct: 'a',
        cek: { ruang: 'kartu', A: 'wajah', B: 'jenis:hati', tanya: 'pGabungan' },
        hints: ['J♥, Q♥, K♥ termasuk keduanya.'],
        explanation:
          'Tidak saling lepas: 12/52 + 13/52 − 3/52 = 22/52 = 11/26. (25/52 lupa mengurangkan irisan; 3/52 hanya irisannya.)',
      },
      {
        type: 'input',
        cerita:
          'Aplikasi sekolah memakai dua server yang bekerja independen. Peluang server A aktif 0,9 dan peluang server B aktif 0,8.',
        pertanyaan: 'Berapa peluang <strong>kedua</strong> server aktif bersamaan?',
        jawab: 0.72,
        cek: { rumus: 'kali', pA: 0.9, pB: 0.8 },
        hints: ['Independen berarti saling bebas.', 'P(A ∩ B) = 0,9 × 0,8.'],
        reveal: 'Saling bebas: P(A ∩ B) = 0,9 × 0,8 = <strong>0,72</strong>.',
      },
      {
        type: 'choice',
        cerita:
          'Masih dua server yang sama (P(A) = 0,9, P(B) = 0,8, independen). Aplikasi tetap bisa diakses jika minimal satu server aktif.',
        pertanyaan: 'Peluang aplikasi bisa diakses adalah …',
        options: [
          { id: 'a', label: '0,98', nilai: 0.98 },
          { id: 'b', label: '1,7', nilai: 1.7 },
          { id: 'c', label: '0,72', nilai: 0.72 },
          { id: 'd', label: '0,85', nilai: 0.85 },
        ],
        correct: 'a',
        cek: { rumus: 'gabungan', pA: 0.9, pB: 0.8, pIrisan: 0.72 },
        hints: ['"Minimal satu" berarti A atau B; kedua server bisa aktif bersamaan.'],
        explanation:
          'Tidak saling lepas: P(A ∪ B) = 0,9 + 0,8 − 0,72 = 0,98. (1,7 lebih dari 1, jadi mustahil sebagai peluang.)',
      },
      {
        type: 'input',
        cerita:
          'Fitur "giliran kilat": pemain melempar satu koin dan satu dadu. Giliran kilat didapat jika koin Gambar dan mata dadu lebih dari 4.',
        pertanyaan: 'Berapa peluang mendapat giliran kilat?',
        jawab: 1 / 6,
        cek: { ruang: 'koinDadu', A: 'koin:G', B: 'dadu:min:5', tanya: 'pIrisan' },
        hints: ['Mata lebih dari 4: 5 atau 6.', 'Saling bebas: 1/2 × 2/6.'],
        reveal: 'Saling bebas: P = 1/2 × 2/6 = 2/12 = <strong>1/6</strong>.',
      },
      {
        type: 'choice',
        cerita:
          'Dalam mode turnamen, dua kartu diambil berturut-turut <em>tanpa pengembalian</em>. Pemain menang jika keduanya As.',
        pertanyaan: 'Pernyataan dan perhitungan yang tepat adalah …',
        options: [
          {
            id: 'a',
            label: 'Tidak saling bebas; P = 4/52 × 3/51 = 1/221',
            nilai: 1 / 221,
          },
          { id: 'b', label: 'Saling bebas; P = 4/52 × 4/52 = 1/169', nilai: 1 / 169 },
          { id: 'c', label: 'Saling lepas; P = 4/52 + 4/52 = 2/13', nilai: 2 / 13 },
          { id: 'd', label: 'Saling bebas; P = 4/52 × 3/52 = 3/676', nilai: 3 / 676 },
        ],
        correct: 'a',
        cek: { ruang: 'duaKartuTanpa', A: 'k1:nilai:A', B: 'k2:nilai:A', tanya: 'pIrisan' },
        hints: ['Setelah satu As diambil, berapa As dan berapa kartu yang tersisa?'],
        explanation:
          'Kartu pertama tidak dikembalikan, jadi peluang kartu kedua berubah menjadi 3/51: P = 4/52 × 3/51 = 1/221.',
      },
      {
        type: 'input',
        cerita:
          'Tim QA mencatat 40 laporan bug: 15 bug tampilan (UI), 10 bug database, dan 4 di antaranya bug UI sekaligus database. Satu laporan dipilih acak untuk diperbaiki lebih dulu.',
        pertanyaan: 'Berapa peluang laporan itu bug UI <strong>atau</strong> bug database?',
        jawab: 21 / 40,
        cek: { rumus: 'gabungan', pA: 15 / 40, pB: 10 / 40, pIrisan: 4 / 40 },
        hints: ['Ada 4 laporan yang termasuk keduanya.', '15/40 + 10/40 − 4/40.'],
        reveal: 'Tidak saling lepas: P = 15/40 + 10/40 − 4/40 = <strong>21/40</strong> (= 0,525).',
      },
      {
        type: 'choice',
        cerita: 'Dua dadu PapanKode dilempar sekali.',
        pertanyaan:
          'Peluang dadu pertama bermata 6 <strong>dan</strong> dadu kedua bermata 6 adalah …',
        options: [
          { id: 'a', label: '1/36', nilai: 1 / 36 },
          { id: 'b', label: '1/3', nilai: 1 / 3 },
          { id: 'c', label: '11/36', nilai: 11 / 36 },
          { id: 'd', label: '1/6', nilai: 1 / 6 },
        ],
        correct: 'a',
        cek: { ruang: 'duaDadu', A: 'dadu1:6', B: 'dadu2:6', tanya: 'pIrisan' },
        hints: ['Dua dadu tidak saling memengaruhi.'],
        explanation:
          'Saling bebas: 1/6 × 1/6 = 1/36. (1/3 berasal dari menjumlah; 11/36 adalah peluang "atau".)',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merefleksikan proses menyelidiki peluang kejadian majemuk.',
    guru: 'Baca jawaban refleksi secara acak. Murid yang masih mencampuradukkan "saling lepas" dan "saling bebas" perlu pendampingan tambahan dengan contoh As & Hati.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Bagaimana hipotesis awalmu dibandingkan dengan data percobaan? Bagian mana yang berubah?',
        placeholder: 'Awalnya aku menduga …, ternyata data menunjukkan …',
      },
      {
        id: 'r2',
        teks: 'Jelaskan dengan kata-katamu sendiri perbedaan kejadian saling lepas dan saling bebas.',
        placeholder: 'Saling lepas berarti …, sedangkan saling bebas berarti …',
      },
      {
        id: 'r3',
        teks: 'Sebutkan satu contoh di dunia RPL (aplikasi, server, game, pengujian) yang memakai peluang kejadian majemuk.',
        placeholder: 'Contoh: …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menentukan rumus peluang yang tepat sekarang?',
    diriOpsi: [
      { id: 'sangat', label: 'Sangat yakin — aku bisa menjelaskannya ke teman.' },
      { id: 'yakin', label: 'Yakin, walau kadang masih perlu melihat catatan.' },
      { id: 'ragu', label: 'Masih ragu membedakan saling lepas dan saling bebas.' },
      { id: 'belum', label: 'Belum yakin — aku perlu latihan lagi.' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Penyelidikan Selesai!',
    teks: 'Kamu telah menyelidiki peluang kejadian majemuk dari percobaan dadu, koin, dan kartu, lalu merumuskan sendiri kapan peluang dijumlah, dikurangi irisannya, atau dikali.',
    capaian: [
      'Membedakan kejadian saling lepas, tidak saling lepas, dan saling bebas dari ruang sampel.',
      'Menjelaskan mengapa P(A ∩ B) dikurangkan pada kejadian tidak saling lepas.',
      'Menjelaskan mengapa pengambilan tanpa pengembalian tidak saling bebas.',
      'Menentukan peluang kejadian majemuk dengan rumus yang tepat pada masalah kontekstual RPL.',
    ],
  },
};
