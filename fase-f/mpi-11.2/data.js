'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Menentukan Model Linear Terbaik dengan Bantuan
   Teknologi Digital
   Fase F — SMK Rekayasa Perangkat Lunak (Kelas XII)
   Topik 11 · Penyelidikan Statistika

   Tujuan Pembelajaran:
   Menentukan model linear terbaik untuk menggambarkan hubungan
   antara dua variabel numerikal menggunakan bantuan teknologi
   digital.

   Model pembelajaran: PROBLEM BASED LEARNING (PBL).
   Masalah pemantik: "Estimasi Proyek Teaching Factory RPL".
   Bu Wulan (pemilik Kopi Senja) meminta tim TEFA membuat aplikasi
   kasir berukuran 16 story point (SP) dan bertanya: "Kira-kira berapa
   jam pengerjaannya?" Tim punya data 10 proyek lalu (SP ↔ jam kerja).
   Tiga anggota mengusulkan garis yang berbeda:
     • Dimas — garis melalui proyek pertama & terakhir: ŷ = 2,25x + 7,5
     • Sari  — garis yang melewati EMPAT titik data:   ŷ = 3x − 1
     • Raka  — garis datar di rata-rata jam kerja:      ŷ = 27,5
   Konflik kognitif: "garis yang melewati paling banyak titik pasti
   terbaik" dan "jumlah residu nol berarti garis sempurna". Keduanya
   runtuh ketika kelompok mengukur kecocokan dengan jumlah kuadrat
   residu (JKR). Garis kuadrat terkecil yang dihitung teknologi
   (spreadsheet =SLOPE/=INTERCEPT/=RSQ atau fungsi JS regresiLinear)
   adalah ŷ = 2,5x + 4 dengan JKR 51 — lebih kecil daripada semua
   usulan — sehingga estimasi 16 SP = 44 jam (interpolasi).

   Pemetaan sintaks PBL ke tahap media:

     Sintaks 1 — Orientasi murid pada masalah ....... 'orientasi'
     Sintaks 2 — Mengorganisasi murid untuk belajar . 'organisasi'
     Sintaks 3 — Membimbing penyelidikan ............ 'selidikResidu',
                                                      'selidikKriteria',
                                                      'selidikTeknologi'
     Sintaks 4 — Mengembangkan & menyajikan karya ... 'karya'
     Sintaks 5 — Menganalisis & mengevaluasi ........ 'evaluasi'
     Penerapan & penutup ............................ 'terapkan', 'refleksi',
                                                      'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — kelompok menulis dugaan & hipotesis,
       memilah informasi, menyusun rencana, lalu menguji dugaannya
       sendiri dan merefleksikan strategi.
     • Bermakna (meaningful) — data adalah proyek nyata jurusan RPL;
       model dipakai untuk menjawab klien sungguhan (estimasi jam &
       batas kepercayaan prediksi).
     • Menggembirakan (joyful) — Lab Garis yang bisa digeser dengan
       residu/persegi kuadrat yang langsung berubah, tantangan
       "kalahkan JKR", panel spreadsheet & kode, dan Laporan Estimasi
       yang dipresentasikan.

   Rangkaian aktivitas (± 2 × 45 menit; kelompok 3–4 murid):
     1. Orientasi     (8')  — pesan klien, diagram pencar 10 proyek dengan
                              tiga garis usulan, dugaan awal (tidak
                              dinilai), rumusan masalah, hipotesis.
     2. Organisasi    (6')  — memilih peran, memilah informasi
                              (diketahui/ditanya/tidak diperlukan),
                              mengurutkan rencana penyelidikan.
     3. Selidik A     (12') — Lab Garis: menggeser m & c, melihat residu;
                              menghitung ŷ dan residu tiga proyek terhadap
                              garis Sari (diagnosa tanda y − ŷ); makna
                              residu positif/negatif/nol.
     4. Selidik B     (15') — mengapa jumlah residu menipu (data mini: Σe = 0
                              tetapi JKR besar); menghitung Σe & JKR;
                              tabel banding JKR tiga garis usulan;
                              tantangan Lab Garis mengalahkan JKR terbaik.
     5. Selidik C     (12') — teknologi digital: spreadsheet (=SLOPE,
                              =INTERCEPT, =RSQ) & kode regresiLinear();
                              tafsir m, c, r²; mengapa rekor JKR tidak bisa
                              di bawah JKR regresi; lab data sendiri
                              (opsional, tidak dinilai).
     6. Karya         (12') — memilih model, menghitung estimasi 16 SP,
                              interpolasi vs ekstrapolasi (klien 60 SP),
                              pesan untuk klien → Laporan Estimasi.
     7. Evaluasi      (10') — menilai pendapat teman, dugaan vs hasil,
                              menyusun simpulan dari bank kalimat acak.
     8. Uji terap     (10') — 8 soal acak dari bank 13 soal.
     9. Refleksi      (5')  — rekap capaian, refleksi tertulis, keyakinan.

   Catatan pengacakan: SEMUA daftar pilihan di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di urutan pertama). app.js
   mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / ensureTapOrderState / shuffleArray dari
   shared/engine.js) dan menyimpannya di State, sehingga tiap murid dan
   tiap Reset mendapat urutan berbeda.

   Metadata `cek` pada data & soal dipakai tests/mpi-f-11.2-data.test.js
   untuk memeriksa kunci jawaban dengan fungsi engine seksi 41 (bukan
   disalin manual).
   ============================================================ */

var PBL = 'Problem Based Learning';

var DATA = {
  meta: {
    judul: 'Menentukan Model Linear Terbaik dengan Bantuan Teknologi Digital',
  },

  tahap: [
    { id: 'orientasi', label: 'Masalah' },
    { id: 'organisasi', label: 'Organisasi' },
    { id: 'selidikResidu', label: 'Residu' },
    { id: 'selidikKriteria', label: 'Kriteria' },
    { id: 'selidikTeknologi', label: 'Teknologi' },
    { id: 'karya', label: 'Karya' },
    { id: 'evaluasi', label: 'Evaluasi' },
    { id: 'terapkan', label: 'Uji Terap' },
    { id: 'refleksi', label: 'Refleksi' },
    { id: 'selesai', label: 'Selesai' },
  ],

  /* Data masalah pemantik — dipakai di beberapa tahap. */
  proyek: [
    { id: 'p1', nama: 'Landing page kantin', x: 2, y: 12 },
    { id: 'p2', nama: 'Form pendaftaran ekskul', x: 4, y: 11 },
    { id: 'p3', nama: 'Kuis online kelas', x: 5, y: 14 },
    { id: 'p4', nama: 'Katalog produk UMKM', x: 7, y: 20 },
    { id: 'p5', nama: 'Presensi QR', x: 8, y: 27 },
    { id: 'p6', nama: 'Web profil desa', x: 10, y: 29 },
    { id: 'p7', nama: 'Aplikasi perpustakaan', x: 12, y: 34 },
    { id: 'p8', nama: 'Kasir koperasi', x: 13, y: 40 },
    { id: 'p9', nama: 'Booking lapangan futsal', x: 15, y: 40 },
    { id: 'p10', nama: 'E-rapor sederhana', x: 18, y: 48 },
  ],
  plot: {
    x: { min: 0, max: 20, step: 2 },
    y: { min: 0, max: 60, step: 10 },
    xLabel: 'Ukuran proyek (story point)',
    yLabel: 'Jam kerja',
    satuanX: 'SP',
    satuanY: 'jam',
  },
  /* Garis usulan anggota tim (urutan wajar; tidak ditampilkan sebagai pilihan). */
  usulan: [
    {
      id: 'dimas',
      label: 'Garis Dimas',
      m: 2.25,
      c: 7.5,
      cara: 'melalui proyek pertama (2 SP) dan terakhir (18 SP)',
    },
    { id: 'sari', label: 'Garis Sari', m: 3, c: -1, cara: 'melewati empat titik data' },
    { id: 'raka', label: 'Garis Raka', m: 0, c: 27.5, cara: 'datar di rata-rata jam kerja' },
  ],
  /* Hasil teknologi (diverifikasi tes terhadap regresiLinear). */
  regresi: { m: 2.5, c: 4, jkr: 51, r2: 0.967 },
  klien: { nama: 'Bu Wulan', usaha: 'Kopi Senja', sp: 16, estimasi: 44, spBesar: 60 },
  lab: {
    awal: { m: 1, c: 10 },
    rentangM: { min: 0, max: 5, step: 0.05 },
    rentangC: { min: -20, max: 30, step: 0.5 },
  },

  /* ----------------------------------------------------------
     TAHAP 1 — ORIENTASI PADA MASALAH (PBL sintaks 1)
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Evaluasi.
     ---------------------------------------------------------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi pada Masalah',
    syntax: PBL + ' · Sintaks 1',
    goal: 'Memahami masalah estimasi proyek dari data dua variabel numerik, lalu menyampaikan dugaan awal tentang garis yang paling cocok.',
    guru: 'Bacakan pesan klien, lalu tanyakan: "Tiga garis, tiga jawaban berbeda — siapa yang benar?" Biarkan kelompok berdebat. Catat di papan argumen seperti "Sari paling benar karena garisnya kena banyak titik". Jangan memberi jawaban; argumen ini akan diuji di tahap Kriteria.',
    judul: 'Estimasi Proyek Teaching Factory RPL',
    pesanKlien:
      'Halo tim TEFA RPL! Saya ingin dibuatkan aplikasi kasir untuk Kopi Senja. Menurut analisis kalian ukurannya 16 story point. Kira-kira butuh berapa jam kerja? Saya perlu angkanya untuk menyusun anggaran. — Bu Wulan',
    pengantar:
      'Tim kalian menyimpan catatan 10 proyek sebelumnya: ukuran proyek (story point) dan jam kerja sebenarnya. Dimas, Sari, dan Raka masing-masing menggambar garis lurus untuk memperkirakan jam kerja — dan hasil estimasi mereka berbeda.',
    dugaan: [
      {
        id: 'd1',
        tanya: 'Menurutmu, garis mana yang paling baik menggambarkan data proyek?',
        opsi: [
          { id: 'lain', label: 'Mungkin ada garis lain yang lebih baik dari ketiganya' },
          { id: 'dimas', label: 'Garis Dimas — melalui proyek pertama dan terakhir' },
          { id: 'sari', label: 'Garis Sari — melewati paling banyak titik' },
          { id: 'raka', label: 'Garis Raka — datar tepat di rata-rata' },
        ],
        baku: 'lain',
        pembahasan:
          'Garis regresi kuadrat terkecil ŷ = 2,5x + 4 punya JKR 51, lebih kecil daripada garis Dimas (79), Sari (111), dan Raka (1.528,5).',
      },
      {
        id: 'd2',
        tanya: 'Estimasi jam kerja 16 SP yang paling kamu percaya adalah …',
        opsi: [
          { id: 'belum', label: 'Belum bisa dipastikan sebelum tahu garis mana yang terbaik' },
          { id: 'dimas', label: '43,5 jam (dari garis Dimas)' },
          { id: 'sari', label: '47 jam (dari garis Sari)' },
          { id: 'raka', label: '27,5 jam (dari garis Raka)' },
        ],
        baku: 'belum',
        pembahasan:
          'Setelah garis terbaik ditemukan, estimasinya ŷ = 2,5 × 16 + 4 = 44 jam — berbeda dari ketiga usulan.',
      },
    ],
    alasanLabel: 'Tuliskan alasan dugaan kelompokmu',
    alasanPlaceholder: 'Contoh: garis Sari paling baik karena …',
    pertanyaan: 'Masalah apa yang sebenarnya harus diselesaikan tim?',
    masalahOpsi: [
      {
        id: 'inti',
        label:
          'Garis lurus mana yang paling baik menggambarkan hubungan story point dan jam kerja, lalu berapa estimasi jam kerja untuk 16 SP?',
      },
      { id: 'rata', label: 'Berapa rata-rata jam kerja dari 10 proyek lalu?' },
      { id: 'terbanyak', label: 'Proyek mana yang story point-nya paling besar?' },
      { id: 'garis', label: 'Siapa anggota tim yang menggambar garis paling rapi?' },
    ],
    masalahCorrect: 'inti',
    masalahUmpan: {
      inti: 'Tepat! Ada dua hal yang dicari: <strong>model linear terbaik</strong> dan <strong>estimasi 16 SP</strong> dari model itu.',
      rata: 'Rata-rata jam kerja (27,5 jam) mengabaikan ukuran proyek. Klien bertanya tentang proyek berukuran 16 SP, jadi hubungan kedua variabel harus dipakai.',
      terbanyak:
        'Itu cukup dilihat dari tabel. Pertanyaan klien adalah perkiraan jam kerja untuk ukuran tertentu.',
      garis:
        'Kerapian gambar tidak menentukan ketepatan. Kita perlu ukuran kecocokan yang bisa dihitung.',
    },
    hipotesisLabel: 'Hipotesis kelompok',
    hipotesisPlaceholder:
      'Contoh: Kami menduga garis terbaik adalah garis yang … sehingga estimasinya sekitar … jam.',
    nextLabel: 'Lanjut: Atur Kelompok →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — MENGORGANISASI BELAJAR (PBL sintaks 2)
     ---------------------------------------------------------- */
  organisasi: {
    kicker: 'Tahap 2 · Mengorganisasi Belajar',
    syntax: PBL + ' · Sintaks 2',
    goal: 'Membagi peran, memilah informasi yang diperlukan, dan menyusun rencana penyelidikan.',
    guru: 'Pastikan setiap anggota memegang satu peran; Operator Teknologi memegang perangkat, anggota lain memberi instruksi. Saat pemilahan, tanyakan mengapa "warna tema aplikasi" tidak diperlukan. Rencana yang benar dipakai sebagai peta tiga penyelidikan berikutnya.',
    peranLabel: 'Pilih peranmu di kelompok',
    peran: [
      { id: 'analis', label: '📊 Analis Data — membaca grafik, tabel, dan residu' },
      { id: 'operator', label: '💻 Operator Teknologi — menjalankan Lab Garis & spreadsheet' },
      { id: 'pencatat', label: '📝 Pencatat — mencatat JKR dan keputusan kelompok' },
      { id: 'presenter', label: '🎤 Presenter — menyajikan Laporan Estimasi ke klien' },
    ],
    judulPilah: 'Pilah informasinya',
    opsiPilah: [
      { id: 'diketahui', label: 'Diketahui' },
      { id: 'ditanya', label: 'Ditanya' },
      { id: 'tidakPerlu', label: 'Tidak diperlukan' },
    ],
    pilah: [
      {
        id: 'i1',
        teks: 'Story point dan jam kerja 10 proyek lalu',
        correct: 'diketahui',
        explanation: 'Inilah data dua variabel numerik yang akan dimodelkan.',
      },
      {
        id: 'i2',
        teks: 'Tiga garis usulan Dimas, Sari, dan Raka',
        correct: 'diketahui',
        explanation: 'Ketiganya calon model yang akan dibandingkan.',
      },
      {
        id: 'i3',
        teks: 'Ukuran aplikasi kasir Kopi Senja: 16 story point',
        correct: 'diketahui',
        explanation: 'Nilai x yang akan dimasukkan ke model untuk estimasi.',
      },
      {
        id: 'i4',
        teks: 'Garis lurus mana yang paling baik menggambarkan data',
        correct: 'ditanya',
        explanation: 'Model linear terbaik adalah pertanyaan utama.',
      },
      {
        id: 'i5',
        teks: 'Estimasi jam kerja untuk proyek 16 story point',
        correct: 'ditanya',
        explanation: 'Jawaban akhir yang diminta klien.',
      },
      {
        id: 'i6',
        teks: 'Warna tema aplikasi kasir yang diinginkan klien',
        correct: 'tidakPerlu',
        explanation: 'Warna tema tidak memengaruhi hubungan story point dan jam kerja.',
      },
      {
        id: 'i7',
        teks: 'Nama anggota tim yang mengerjakan tiap proyek lalu',
        correct: 'tidakPerlu',
        explanation: 'Model hanya memakai pasangan (story point, jam kerja).',
      },
    ],
    judulRencana: 'Susun rencana penyelidikan',
    instruksiRencana: 'Ketuk langkah-langkah berikut sesuai urutan kerja yang masuk akal.',
    rencana: [
      { id: 'r1', label: '👀 Amati diagram pencar dan tiga garis usulan' },
      { id: 'r2', label: '📏 Hitung residu setiap proyek terhadap sebuah garis' },
      { id: 'r3', label: '⚖️ Pilih ukuran kecocokan (JKR) lalu bandingkan garis' },
      { id: 'r4', label: '💻 Hitung garis terbaik dengan spreadsheet atau kode' },
      { id: 'r5', label: '📨 Buat estimasi 16 SP dan sajikan laporan ke klien' },
    ],
    nextLabel: 'Mulai Penyelidikan →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENYELIDIKAN A: RESIDU (PBL sintaks 3)
     Residu dihitung terhadap garis Sari ŷ = 3x − 1.
     ---------------------------------------------------------- */
  selidikResidu: {
    kicker: 'Tahap 3 · Penyelidikan A — Residu',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menghitung prediksi ŷ dan residu e = y − ŷ, lalu menafsirkan residu positif, negatif, dan nol.',
    guru: 'Operator Teknologi menggeser Lab Garis, anggota lain menebak apa yang terjadi pada segmen residu sebelum slider dilepas. Saat menghitung residu, tekankan urutan "data dikurangi prediksi". Bila muncul diagnosa tanda terbalik, minta murid menunjuk titik di grafik: di atas atau di bawah garis?',
    judulLab: 'Lab Garis: geser garismu',
    instruksiLab:
      'Geser kemiringan m dan titik potong c. Garis putus-putus hijau/merah adalah residu: jarak tegak dari titik data ke garis. Amati apa yang terjadi saat garis makin dekat ke titik-titik.',
    judulHitung: 'Hitung residu terhadap garis Sari',
    garisHitung: 'sari',
    hitung: [
      { id: 'p1', hints: ['ŷ = 3 × 2 − 1.', 'e = y − ŷ = 12 − 5.'] },
      { id: 'p10', hints: ['ŷ = 3 × 18 − 1.', 'e = y − ŷ = 48 − 53.'] },
      { id: 'p6', hints: ['ŷ = 3 × 10 − 1.', 'Bandingkan ŷ dengan y = 29.'] },
    ],
    tanya: [
      {
        id: 'a1',
        tanya: 'Residu proyek <em>Landing page kantin</em> adalah +7. Artinya …',
        opsi: [
          {
            id: 'atas',
            label: 'Titik di atas garis: jam kerja sebenarnya 7 jam lebih lama dari prediksi',
          },
          {
            id: 'bawah',
            label: 'Titik di bawah garis: proyek selesai 7 jam lebih cepat dari prediksi',
          },
          { id: 'sp', label: 'Story point proyek itu salah hitung sebanyak 7' },
          { id: 'garis', label: 'Garis harus digeser 7 satuan ke kanan' },
        ],
        correct: 'atas',
        umpan: {
          atas: 'Tepat! e > 0 berarti y > ŷ: data berada di atas garis, model meremehkan jam kerja.',
          bawah:
            'Kebalikannya. e = y − ŷ positif berarti y lebih besar daripada ŷ, jadi titik di atas garis.',
          sp: 'Residu diukur pada sumbu y (jam kerja), bukan pada story point.',
          garis: 'Residu adalah jarak tegak (vertikal) titik ke garis, bukan pergeseran mendatar.',
        },
      },
      {
        id: 'a2',
        tanya: 'Residu proyek <em>Web profil desa</em> adalah 0. Artinya …',
        opsi: [
          { id: 'tepat', label: 'Titik tepat berada pada garis; prediksi sama dengan data' },
          { id: 'buruk', label: 'Garis tidak bisa dipakai untuk proyek itu' },
          { id: 'kosong', label: 'Proyek itu tidak punya jam kerja' },
          { id: 'terbaik', label: 'Garis itu pasti garis terbaik untuk semua data' },
        ],
        correct: 'tepat',
        umpan: {
          tepat: 'Benar. y = ŷ = 29, jadi selisihnya nol.',
          buruk: 'Justru sebaliknya: untuk proyek itu prediksinya tepat.',
          kosong: 'Jam kerjanya 29 jam. Nol adalah selisih data dan prediksi.',
          terbaik:
            'Satu titik yang tepat belum menjamin garis cocok untuk titik-titik lain. Ini akan kita selidiki di tahap berikutnya.',
        },
      },
      {
        id: 'a3',
        tanya: 'Di Lab Garis, bagaimana tanda garis makin cocok dengan data?',
        opsi: [
          { id: 'pendek', label: 'Segmen residu secara keseluruhan makin pendek' },
          { id: 'curam', label: 'Garis makin curam' },
          { id: 'titik', label: 'Garis melewati setidaknya satu titik' },
          { id: 'nol', label: 'Titik potong c menjadi 0' },
        ],
        correct: 'pendek',
        umpan: {
          pendek:
            'Tepat! Garis yang cocok membuat semua titik dekat dengannya. Pertanyaannya: bagaimana mengukur "secara keseluruhan" itu dengan satu angka?',
          curam: 'Kecuraman yang tepat bergantung pada data, bukan makin curam makin baik.',
          titik: 'Melewati satu titik belum tentu dekat dengan titik lainnya.',
          nol: 'Nilai c yang cocok bergantung pada data; tidak harus 0.',
        },
      },
    ],
    temuan: [
      'Prediksi model: ŷ = mx + c. Residu: e = y − ŷ (data dikurangi prediksi).',
      'e > 0 → titik di atas garis; e < 0 → di bawah garis; e = 0 → tepat pada garis.',
      'Garis yang cocok membuat residu semua titik kecil secara keseluruhan.',
    ],
    nextLabel: 'Lanjut: Cari Kriteria →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — PENYELIDIKAN B: KRITERIA GARIS TERBAIK (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikKriteria: {
    kicker: 'Tahap 4 · Penyelidikan B — Kriteria Garis Terbaik',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Menemukan bahwa jumlah residu bisa menipu dan memakai jumlah kuadrat residu (JKR) untuk membandingkan garis.',
    guru: 'Beri waktu kelompok menghitung sendiri sebelum membuka tabel banding. Setelah Σe garis datar = 0, tanyakan: "Jadi garis datar itu sempurna?" Minta murid menunjuk persegi kuadrat residu di Lab Garis: mengapa mengkuadratkan membuat residu negatif tidak lagi "menghapus" residu positif? Pada tantangan, kelompok bersaing sehat mencari JKR terkecil.',
    judulA: 'A. Data mini: apakah jumlah residu cukup?',
    instruksiA:
      'Tim magang mencatat 4 proyek kecil (x = banyak fitur, y = jam kerja). Dua garis dicoba: Garis A datar ŷ = 6 (rata-rata y) dan Garis B ŷ = 2x. Hitung jumlah residu Σe dan jumlah kuadrat residu JKR = Σe² untuk keduanya.',
    mini: {
      titik: [
        { x: 1, y: 3, nama: 'M1' },
        { x: 2, y: 7, nama: 'M2' },
        { x: 3, y: 5, nama: 'M3' },
        { x: 4, y: 9, nama: 'M4' },
      ],
      garisA: { m: 0, c: 6, label: 'Garis A: ŷ = 6' },
      garisB: { m: 2, c: 0, label: 'Garis B: ŷ = 2x' },
      plot: { x: { min: 0, max: 5, step: 1 }, y: { min: 0, max: 10, step: 2 } },
    },
    langkah: [
      {
        id: 'sA',
        garis: 'garisA',
        ukuran: 'jumlah',
        label: 'Jumlah residu Garis A: Σe = (−3) + 1 + (−1) + 3 = …',
        hints: ['Jumlahkan keempat residu pada kolom e.', '−3 + 1 − 1 + 3.'],
        temuan: 'Σe Garis A = 0. Residu positif dan negatif saling menghapus!',
      },
      {
        id: 'jA',
        garis: 'garisA',
        ukuran: 'jkr',
        label: 'JKR Garis A: (−3)² + 1² + (−1)² + 3² = …',
        hints: ['Kuadrat bilangan negatif selalu positif: (−3)² = 9.', '9 + 1 + 1 + 9.'],
        temuan: 'JKR Garis A = 20.',
      },
      {
        id: 'sB',
        garis: 'garisB',
        ukuran: 'jumlah',
        label: 'Jumlah residu Garis B: Σe = 1 + 3 + (−1) + 1 = …',
        hints: ['Jumlahkan keempat residu pada kolom e.', '1 + 3 − 1 + 1.'],
        temuan: 'Σe Garis B = 4 — tidak nol, padahal …',
      },
      {
        id: 'jB',
        garis: 'garisB',
        ukuran: 'jkr',
        label: 'JKR Garis B: 1² + 3² + (−1)² + 1² = …',
        hints: ['Kuadratkan setiap residu dulu, baru jumlahkan.', '1 + 9 + 1 + 1.'],
        temuan: 'JKR Garis B = 12, lebih kecil daripada Garis A.',
      },
    ],
    tanyaMini: [
      {
        id: 'b1',
        tanya: 'Dari grafik dan perhitungan, garis mana yang lebih dekat ke titik-titik data mini?',
        opsi: [
          { id: 'B', label: 'Garis B, karena JKR-nya lebih kecil (12 < 20)' },
          { id: 'A', label: 'Garis A, karena jumlah residunya 0' },
          { id: 'sama', label: 'Sama baiknya, karena keduanya garis lurus' },
          { id: 'tidak', label: 'Tidak bisa dibandingkan tanpa data tambahan' },
        ],
        correct: 'B',
        umpan: {
          B: 'Tepat! Garis B jelas mengikuti arah naik data, dan JKR menangkapnya.',
          A: 'Σe = 0 terjadi karena residu +3 dan −3 saling menghapus, padahal titik-titiknya jauh dari garis. Lihat JKR-nya.',
          sama: 'Coba lihat panjang segmen residu keduanya di grafik — jelas berbeda.',
          tidak: 'Keempat titik sudah cukup untuk membandingkan dua garis dengan JKR.',
        },
      },
      {
        id: 'b2',
        tanya: 'Mengapa residu dikuadratkan sebelum dijumlahkan?',
        opsi: [
          {
            id: 'positif',
            label: 'Agar semua residu bernilai positif sehingga tidak saling menghapus',
          },
          { id: 'besar', label: 'Agar hasil perhitungannya menjadi angka yang besar' },
          { id: 'tanda', label: 'Agar residu negatif berubah menjadi residu positif yang sama' },
          { id: 'aturan', label: 'Karena rumus garis lurus memuat kuadrat' },
        ],
        correct: 'positif',
        umpan: {
          positif:
            'Benar! Kuadrat membuat setiap residu menyumbang nilai positif, dan residu besar mendapat "hukuman" lebih besar.',
          besar:
            'Besar kecilnya angka bukan tujuannya; yang penting residu tidak saling menghapus.',
          tanda:
            'Hampir — kuadrat memang membuat positif, tetapi nilainya berubah (3 menjadi 9), sehingga residu besar lebih diperhatikan.',
          aturan:
            'Rumus garis ŷ = mx + c tidak memuat kuadrat. Kuadrat dipakai pada ukuran kecocokannya.',
        },
      },
    ],
    judulB: 'B. Bandingkan tiga garis usulan',
    instruksiB:
      'Operator Teknologi menampilkan tabel banding untuk data 10 proyek. Perhatikan kolom Σe dan JKR.',
    tanyaBanding: [
      {
        id: 'b3',
        tanya: 'Menurut JKR, garis usulan mana yang paling cocok dengan data proyek?',
        opsi: [
          { id: 'dimas', label: 'Garis Dimas (JKR 79)' },
          { id: 'sari', label: 'Garis Sari (JKR 111)' },
          { id: 'raka', label: 'Garis Raka (Σe = 0)' },
          { id: 'semua', label: 'Ketiganya sama baik' },
        ],
        correct: 'dimas',
        umpan: {
          dimas: 'Tepat! JKR Garis Dimas paling kecil di antara ketiga usulan.',
          sari: 'Garis Sari melewati empat titik, tetapi JKR-nya 111 — lebih besar daripada garis Dimas.',
          raka: 'Σe = 0 bukan ukuran kecocokan. JKR garis Raka justru paling besar (1.528,5).',
          semua: 'Bandingkan kolom JKR: nilainya sangat berbeda.',
        },
      },
      {
        id: 'b4',
        tanya:
          'Garis Sari melewati empat titik, tetapi JKR-nya lebih besar dari garis Dimas. Kesimpulannya …',
        opsi: [
          {
            id: 'banyak',
            label: 'Melewati banyak titik tidak menjamin garis dekat ke semua titik',
          },
          { id: 'salah', label: 'Perhitungan JKR pasti keliru' },
          { id: 'sari', label: 'Garis Sari tetap terbaik karena paling banyak titik' },
          { id: 'hapus', label: 'Titik yang tidak dilewati garis sebaiknya dihapus' },
        ],
        correct: 'banyak',
        umpan: {
          banyak:
            'Tepat! Garis Sari jauh dari proyek lain (mis. e = −5 pada E-rapor). Model terbaik memperhatikan SEMUA titik.',
          salah: 'Coba hitung ulang beberapa residu garis Sari: hasilnya konsisten dengan tabel.',
          sari: 'Banyak titik yang dilewati bukan ukuran kecocokan; JKR yang mengukur jarak ke semua titik.',
          hapus:
            'Menghapus data agar cocok dengan garis tidak jujur. Model yang harus menyesuaikan data.',
        },
      },
    ],
    judulC: 'C. Tantangan: kalahkan garis Dimas!',
    instruksiC:
      'Kembali ke Lab Garis. Pilih tampilan "Kuadrat residu" lalu geser m dan c sampai JKR garismu lebih kecil dari JKR garis Dimas.',
    targetDari: 'dimas',
    temuan: [
      'Jumlah residu Σe bisa 0 walaupun garis jauh dari titik-titik, karena residu positif dan negatif saling menghapus.',
      'Jumlah kuadrat residu JKR = Σ(y − ŷ)² mengukur kecocokan garis terhadap SEMUA titik.',
      'Garis dengan JKR lebih kecil lebih cocok — bukan garis yang melewati paling banyak titik.',
    ],
    nextLabel: 'Lanjut: Pakai Teknologi →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PENYELIDIKAN C: TEKNOLOGI DIGITAL (PBL sintaks 3)
     ---------------------------------------------------------- */
  selidikTeknologi: {
    kicker: 'Tahap 5 · Penyelidikan C — Bantuan Teknologi Digital',
    syntax: PBL + ' · Sintaks 3',
    goal: 'Memakai spreadsheet atau kode untuk menghitung garis kuadrat terkecil, lalu menafsirkan kemiringan, titik potong, dan r².',
    guru: 'Bila tersedia komputer, minta kelompok mengetik data ke spreadsheet dan memakai =SLOPE, =INTERCEPT, =RSQ sendiri; hasilnya harus sama dengan panel. Siswa RPL dapat membandingkan dengan kode JavaScript. Tekankan: teknologi menghitung, manusia menafsirkan dan memutuskan.',
    judulData: 'Data proyek di spreadsheet',
    instruksiData:
      'Kolom A berisi story point (x), kolom B berisi jam kerja (y). Tekan tombol untuk menjalankan regresi linear kuadrat terkecil.',
    tombol: '▶ Jalankan regresi',
    rentangX: 'A2:A11',
    rentangY: 'B2:B11',
    namaData: 'proyekTefa',
    tanya: [
      {
        id: 'c1',
        tanya: 'Kemiringan garis regresi m = 2,5. Dalam konteks proyek, artinya …',
        opsi: [
          {
            id: 'tambah',
            label: 'Setiap tambahan 1 story point menambah perkiraan jam kerja sekitar 2,5 jam',
          },
          { id: 'total', label: 'Setiap proyek selalu membutuhkan 2,5 jam' },
          { id: 'sp', label: 'Setiap tambahan 2,5 jam menambah 1 story point' },
          { id: 'rata', label: 'Rata-rata story point proyek adalah 2,5' },
        ],
        correct: 'tambah',
        umpan: {
          tambah: 'Tepat! Kemiringan adalah perubahan ŷ untuk setiap kenaikan 1 satuan x.',
          total: 'Jam kerja bergantung pada ukuran proyek; 2,5 adalah laju perubahannya.',
          sp: 'Arahnya terbalik: x (story point) yang memengaruhi ŷ (jam kerja).',
          rata: 'Rata-rata story point adalah 9,4. Nilai 2,5 adalah kemiringan garis.',
        },
      },
      {
        id: 'c2',
        tanya: 'Titik potong c = 4. Tafsiran yang paling masuk akal adalah …',
        opsi: [
          {
            id: 'tetap',
            label: 'Bagian waktu tetap sekitar 4 jam (mis. rapat awal dan deploy) menurut model',
          },
          { id: 'minimal', label: 'Setiap proyek pasti berukuran minimal 4 story point' },
          { id: 'selisih', label: 'Selisih jam kerja antarproyek selalu 4 jam' },
          { id: 'sp4', label: 'Proyek 4 SP butuh tepat 4 jam' },
        ],
        correct: 'tetap',
        umpan: {
          tetap:
            'Benar. c adalah ŷ saat x = 0 — bagian waktu yang tidak bergantung pada ukuran proyek. Tafsirkan dengan hati-hati karena x = 0 di luar data.',
          minimal: 'c berada pada sumbu y (jam kerja), bukan batas story point.',
          selisih: 'Selisih jam per story point ditunjukkan oleh kemiringan, bukan c.',
          sp4: 'Untuk 4 SP, ŷ = 2,5 × 4 + 4 = 14 jam.',
        },
      },
      {
        id: 'c3',
        tanya: 'Spreadsheet menampilkan r² ≈ 0,967. Artinya …',
        opsi: [
          {
            id: 'variasi',
            label:
              'Sekitar 97% variasi jam kerja dapat dijelaskan oleh hubungan linear dengan story point',
          },
          { id: 'benar', label: '96,7% prediksi model pasti benar persis' },
          { id: 'titik', label: 'Garis melewati 96,7% titik data' },
          { id: 'miring', label: 'Kemiringan garis adalah 0,967' },
        ],
        correct: 'variasi',
        umpan: {
          variasi: 'Tepat! r² dekat 1 menunjukkan model linear sangat cocok dengan data.',
          benar:
            'Prediksi tetap punya residu. r² mengukur seberapa besar variasi y yang dijelaskan model.',
          titik: 'Garis regresi bahkan tidak harus melewati satu titik pun.',
          miring: 'Kemiringannya 2,5. r² adalah ukuran kecocokan, bukan kemiringan.',
        },
      },
      {
        id: 'c4',
        tanya: 'Rekor JKR kelompokmu di Lab Garis tidak pernah bisa di bawah 51. Mengapa?',
        opsi: [
          {
            id: 'minimum',
            label:
              'Garis regresi kuadrat terkecil memiliki JKR paling kecil di antara semua garis lurus',
          },
          { id: 'slider', label: 'Slider Lab Garis kurang teliti' },
          { id: 'kebetulan', label: 'Hanya kebetulan pada data ini' },
          { id: 'nol', label: 'Karena JKR garis terbaik selalu 51' },
        ],
        correct: 'minimum',
        umpan: {
          minimum:
            'Benar! Itulah arti "kuadrat terkecil": m dan c dipilih agar JKR minimum. Teknologi menemukannya secara tepat.',
          slider:
            'Walaupun slider sangat teliti, tidak ada garis lurus dengan JKR di bawah JKR regresi.',
          kebetulan:
            'Ini berlaku untuk data apa pun: garis kuadrat terkecil selalu memberi JKR minimum.',
          nol: 'Nilai 51 khusus untuk data ini. Data lain punya JKR minimum yang lain.',
        },
      },
    ],
    judulLab: 'Lab data sendiri (opsional)',
    instruksiLab:
      'Tempelkan dua kolom dari spreadsheet (atau ketik "x y" per baris), misalnya data kelasmu sendiri, lalu tekan Hitung Regresi. Tidak dinilai.',
    temuan: [
      'Teknologi (=SLOPE, =INTERCEPT, =RSQ atau fungsi kode) menghitung garis kuadrat terkecil ŷ = mx + c dengan tepat dan cepat.',
      'Garis kuadrat terkecil memiliki JKR paling kecil — itulah model linear terbaik.',
      'm = perubahan ŷ tiap kenaikan 1 satuan x; c = ŷ saat x = 0; r² mendekati 1 berarti model linear cocok.',
    ],
    nextLabel: 'Lanjut: Susun Laporan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — KARYA: LAPORAN ESTIMASI (PBL sintaks 4)
     ---------------------------------------------------------- */
  karya: {
    kicker: 'Tahap 6 · Mengembangkan & Menyajikan Karya',
    syntax: PBL + ' · Sintaks 4',
    goal: 'Memilih model terbaik, menghitung estimasi untuk klien, menilai batas prediksi, dan menyajikannya dalam Laporan Estimasi.',
    guru: 'Pencatat mengisi laporan, Presenter berlatih menjelaskan. Undang 2–3 kelompok presentasi (±2 menit) seolah-olah di depan klien. Kelompok lain menanggapi: "Mengapa kalian yakin dengan angka 44 jam, tetapi ragu dengan 154 jam?"',
    tanyaModel: {
      id: 'k1',
      tanya: 'Model mana yang kalian rekomendasikan untuk estimasi?',
      opsi: [
        { id: 'regresi', label: 'Garis regresi ŷ = 2,5x + 4 (JKR 51)' },
        { id: 'dimas', label: 'Garis Dimas ŷ = 2,25x + 7,5 (JKR 79)' },
        { id: 'sari', label: 'Garis Sari ŷ = 3x − 1 (melewati 4 titik)' },
        { id: 'raka', label: 'Garis Raka ŷ = 27,5 (Σe = 0)' },
      ],
      correct: 'regresi',
      umpan: {
        regresi: 'Tepat! JKR-nya paling kecil di antara semua garis lurus.',
        dimas:
          'Garis Dimas lebih baik dari Sari dan Raka, tetapi JKR garis regresi lebih kecil lagi.',
        sari: 'Banyaknya titik yang dilewati bukan ukuran kecocokan. JKR garis Sari 111.',
        raka: 'Garis datar mengabaikan ukuran proyek; JKR-nya paling besar.',
      },
    },
    estimasi: {
      label: 'Estimasi jam kerja aplikasi kasir 16 SP: ŷ = 2,5 × 16 + 4 = …',
      hints: ['Kalikan dulu: 2,5 × 16 = 40.', 'Lalu tambahkan titik potongnya: 40 + 4.'],
      temuan: 'Estimasi: 44 jam kerja.',
    },
    tanyaJenis: {
      id: 'k2',
      tanya: 'Data proyek lalu berukuran 2–18 SP. Estimasi untuk 16 SP termasuk …',
      opsi: [
        {
          id: 'interpolasi',
          label: 'Interpolasi — 16 berada di dalam rentang data, jadi cukup dapat dipercaya',
        },
        { id: 'ekstrapolasi', label: 'Ekstrapolasi — 16 berada di luar rentang data' },
        { id: 'tebakan', label: 'Tebakan — model tidak bisa dipakai untuk proyek baru' },
        { id: 'pasti', label: 'Kepastian — proyek pasti selesai tepat 44 jam' },
      ],
      correct: 'interpolasi',
      umpan: {
        interpolasi: 'Tepat! 2 ≤ 16 ≤ 18, jadi prediksi berada di wilayah yang didukung data.',
        ekstrapolasi: 'Periksa lagi rentangnya: 16 berada di antara 2 dan 18.',
        tebakan: 'Model justru dibuat untuk memprediksi proyek baru di dalam rentang data.',
        pasti: 'Prediksi tetap punya residu; 44 jam adalah perkiraan, bukan kepastian.',
      },
    },
    tanyaBesar: {
      id: 'k3',
      tanya:
        'Klien lain bertanya tentang aplikasi marketplace berukuran 60 SP. Model memberi ŷ = 2,5 × 60 + 4 = 154 jam. Sikap tim yang tepat adalah …',
      opsi: [
        {
          id: 'hati',
          label:
            'Menyampaikan 154 jam sebagai perkiraan kasar karena 60 SP jauh di luar data (ekstrapolasi); perlu data proyek besar',
        },
        { id: 'yakin', label: 'Menjamin 154 jam karena r² sudah tinggi' },
        { id: 'tolak', label: 'Menolak klien karena model linear tidak berlaku sama sekali' },
        { id: 'rata', label: 'Memakai rata-rata 27,5 jam karena lebih aman' },
      ],
      correct: 'hati',
      umpan: {
        hati: 'Tepat! Di luar rentang data, pola bisa berubah (mis. proyek besar butuh koordinasi lebih). Sampaikan ketidakpastiannya.',
        yakin: 'r² tinggi hanya berlaku untuk rentang data 2–18 SP. Di luar itu belum ada bukti.',
        tolak: 'Model masih bisa memberi gambaran awal, asal ketidakpastiannya dijelaskan.',
        rata: 'Rata-rata mengabaikan ukuran proyek dan jelas terlalu kecil untuk 60 SP.',
      },
    },
    pesanLabel: 'Tulis pesan singkat kelompokmu untuk Bu Wulan',
    pesanPlaceholder: 'Contoh: Berdasarkan 10 proyek lalu, estimasi kami 44 jam kerja karena …',
    posterJudul: 'Laporan Estimasi Proyek — Kasir Kopi Senja',
    posterFooter: 'Tim TEFA RPL · Model dihitung dengan regresi kuadrat terkecil',
    nextLabel: 'Lanjut: Evaluasi →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — ANALISIS & EVALUASI (PBL sintaks 5)
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'Tahap 7 · Analisis & Evaluasi',
    syntax: PBL + ' · Sintaks 5',
    goal: 'Menilai pendapat teman, membandingkan dugaan awal dengan hasil penyelidikan, dan menyusun simpulan.',
    guru: 'Gunakan pendapat yang keliru sebagai bahan diskusi: minta murid membuktikannya dengan Lab Garis atau tabel banding. Sebelum menyusun simpulan, tanyakan: "Apa peran teknologi, dan apa yang tetap harus dilakukan manusia?"',
    judulA: 'A. Tepat atau keliru?',
    opsiPendapat: [
      { id: 'tepat', label: 'Tepat' },
      { id: 'keliru', label: 'Keliru' },
    ],
    pendapat: [
      {
        id: 'e1',
        teks: 'Sari: "Garisku terbaik karena melewati empat titik data."',
        correct: 'keliru',
        explanation:
          'JKR garis Sari 111, lebih besar daripada garis regresi (51). Yang dinilai adalah jarak ke SEMUA titik.',
      },
      {
        id: 'e2',
        teks: 'Raka: "Garis datarku sempurna karena jumlah residunya 0."',
        correct: 'keliru',
        explanation:
          'Residu positif dan negatif saling menghapus. JKR garis Raka 1.528,5 — paling buruk.',
      },
      {
        id: 'e3',
        teks: 'Dimas: "Garis regresi punya JKR paling kecil di antara semua garis lurus."',
        correct: 'tepat',
        explanation: 'Itulah arti kuadrat terkecil: m dan c dipilih agar Σ(y − ŷ)² minimum.',
      },
      {
        id: 'e4',
        teks: 'Nadia: "Residu negatif berarti jam kerja sebenarnya lebih kecil daripada prediksi."',
        correct: 'tepat',
        explanation: 'e = y − ŷ < 0 berarti y < ŷ; titiknya di bawah garis.',
      },
      {
        id: 'e5',
        teks: 'Bagas: "Estimasi 60 SP sama dapat dipercayanya dengan estimasi 16 SP."',
        correct: 'keliru',
        explanation:
          '16 SP adalah interpolasi (di dalam 2–18 SP), sedangkan 60 SP ekstrapolasi jauh di luar data.',
      },
      {
        id: 'e6',
        teks: 'Putri: "Kemiringan 2,5 berarti tiap tambahan 1 story point menambah perkiraan jam kerja sekitar 2,5 jam."',
        correct: 'tepat',
        explanation: 'Kemiringan adalah perubahan ŷ untuk setiap kenaikan 1 satuan x.',
      },
      {
        id: 'e7',
        teks: 'Yoga: "Karena ada titik di atas dan di bawah garis regresi, model ini salah."',
        correct: 'keliru',
        explanation:
          'Data nyata selalu bervariasi. Model terbaik justru menyeimbangkan titik di atas dan di bawahnya (Σe = 0) dengan JKR minimum.',
      },
      {
        id: 'e8',
        teks: 'Lina: "Spreadsheet menghitung m, c, dan r², tetapi tim tetap harus menafsirkan dan memeriksa apakah model masuk akal."',
        correct: 'tepat',
        explanation:
          'Teknologi membantu menghitung; keputusan dan tafsiran tetap tanggung jawab manusia.',
      },
    ],
    judulB: 'B. Dugaan awal vs hasil penyelidikan',
    judulC: 'C. Susun simpulan kelompok',
    instruksiC:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai sekali; ada potongan pengecoh.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'k1', awal: 'Residu suatu titik data adalah', correct: 'b1' },
      { id: 'k2', awal: 'Model linear terbaik adalah garis yang', correct: 'b2' },
      { id: 'k3', awal: 'Jumlah residu nol belum cukup karena', correct: 'b3' },
      { id: 'k4', awal: 'Teknologi digital seperti spreadsheet atau kode membantu', correct: 'b4' },
    ],
    bank: [
      { id: 'b1', teks: 'selisih data sebenarnya dengan prediksi, e = y − ŷ.' },
      { id: 'b2', teks: 'memiliki jumlah kuadrat residu (JKR) paling kecil.' },
      { id: 'b3', teks: 'residu positif dan negatif dapat saling menghapus.' },
      { id: 'b4', teks: 'menghitung m, c, dan r² garis kuadrat terkecil dengan cepat dan tepat.' },
      { id: 'x1', teks: 'melewati titik data sebanyak mungkin.' },
      { id: 'x2', teks: 'selisih prediksi dengan data sebenarnya, e = ŷ − y.' },
      { id: 'x3', teks: 'selalu melalui titik data pertama dan terakhir.' },
    ],
    rangkuman: [
      'Model linear <strong>ŷ = mx + c</strong> memprediksi y dari x. Residu <strong>e = y − ŷ</strong> adalah selisih data dan prediksi.',
      'Kecocokan garis diukur dengan <strong>jumlah kuadrat residu JKR = Σ(y − ŷ)²</strong>; jumlah residu saja bisa menipu.',
      'Garis <strong>kuadrat terkecil</strong> (regresi linear) memiliki JKR paling kecil — itulah model linear terbaik.',
      'Teknologi digital menghitung m, c, dan r² (<code>=SLOPE</code>, <code>=INTERCEPT</code>, <code>=RSQ</code>); r² mendekati 1 berarti model linear cocok.',
      'Prediksi di dalam rentang data (<strong>interpolasi</strong>) lebih dapat dipercaya daripada di luar rentang (<strong>ekstrapolasi</strong>).',
    ],
    nextLabel: 'Lanjut: Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP (masalah baru)
     Delapan soal diambil acak dari bank tiga belas soal.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: PBL + ' · Masalah baru',
    goal: 'Menerapkan cara menentukan dan memakai model linear terbaik pada masalah baru.',
    guru: 'Murid mengerjakan secara mandiri. Amati soal mana yang sering meminta petunjuk; bahas satu soal dengan diagnosa terbanyak di akhir tahap.',
    instruksi:
      'Kerjakan secara mandiri. Soal pilihan ganda hanya bisa dijawab sekali; soal isian boleh dicoba lagi dan ada petunjuk. Gunakan koma untuk desimal, mis. 32,3.',
    banyak: 8,
    komposisi: { choice: 6, isian: 2 },
    soal: [
      {
        id: 't1',
        type: 'choice',
        cerita:
          'Empat garis dicoba pada 4 data yang sama. Residu tiap garis: A (2, −2, 1, −1); B (1, 1, 1, 1); C (3, −3, 0, 0); D (0, 0, 0, 4).',
        pertanyaan: 'Garis mana yang paling cocok dengan data?',
        options: [
          { id: 'B', label: 'Garis B (JKR = 4)' },
          { id: 'A', label: 'Garis A (Σe = 0)' },
          { id: 'C', label: 'Garis C (Σe = 0 dan dua residu 0)' },
          { id: 'D', label: 'Garis D (melewati tiga titik)' },
        ],
        correct: 'B',
        cek: {
          tipe: 'jkrResidu',
          residu: { A: [2, -2, 1, -1], B: [1, 1, 1, 1], C: [3, -3, 0, 0], D: [0, 0, 0, 4] },
        },
        explanation: 'JKR: A = 10, B = 4, C = 18, D = 16. JKR terkecil milik garis B.',
      },
      {
        id: 't2',
        type: 'choice',
        cerita:
          'Tim server memodelkan waktu muat halaman t (milidetik) dari banyak pengguna aktif n (ratusan): t = 0,8n + 120.',
        pertanyaan: 'Arti bilangan 0,8 adalah …',
        options: [
          {
            id: 'laju',
            label: 'Tiap tambahan 100 pengguna aktif menambah waktu muat sekitar 0,8 ms',
          },
          { id: 'awal', label: 'Waktu muat saat tidak ada pengguna adalah 0,8 ms' },
          { id: 'balik', label: 'Tiap tambahan 1 ms menambah 80 pengguna' },
          { id: 'persen', label: '80% halaman dimuat dengan cepat' },
        ],
        correct: 'laju',
        explanation:
          'Kemiringan = perubahan t untuk setiap kenaikan 1 satuan n (1 satuan = 100 pengguna).',
      },
      {
        id: 't3',
        type: 'choice',
        cerita:
          'Biaya hosting bulanan B (ribu rupiah) dimodelkan dari kapasitas penyimpanan s (GB): B = 12s + 150.',
        pertanyaan: 'Arti bilangan 150 adalah …',
        options: [
          {
            id: 'tetap',
            label: 'Biaya tetap sekitar Rp150.000 per bulan menurut model, di luar biaya per GB',
          },
          { id: 'pergb', label: 'Biaya tiap GB adalah Rp150.000' },
          { id: 'maks', label: 'Kapasitas maksimal 150 GB' },
          { id: 'total', label: 'Total biaya selalu Rp150.000' },
        ],
        correct: 'tetap',
        explanation:
          'Titik potong adalah nilai B saat s = 0 — bagian biaya yang tidak bergantung pada kapasitas.',
      },
      {
        id: 't4',
        type: 'choice',
        cerita:
          'Model konsumsi kuota diperoleh dari data pengguna yang memakai aplikasi 5 sampai 40 menit per hari. Model dipakai untuk memprediksi pengguna yang memakai aplikasi 70 menit per hari.',
        pertanyaan: 'Prediksi itu termasuk …',
        options: [
          {
            id: 'ekstrapolasi',
            label: 'Ekstrapolasi — perlu hati-hati karena di luar rentang data',
          },
          { id: 'interpolasi', label: 'Interpolasi — di dalam rentang data' },
          { id: 'residu', label: 'Residu — selisih data dan prediksi' },
          { id: 'pasti', label: 'Hasil pasti karena memakai rumus' },
        ],
        correct: 'ekstrapolasi',
        cek: { tipe: 'jenis', x: 70, xs: [5, 10, 15, 20, 25, 30, 35, 40] },
        explanation: '70 berada di luar rentang 5–40, jadi ekstrapolasi.',
      },
      {
        id: 't5',
        type: 'choice',
        cerita:
          'Dua model linear dibuat untuk memprediksi nilai ujian: Model P dari lama belajar (r² = 0,58) dan Model Q dari banyak latihan soal (r² = 0,93).',
        pertanyaan: 'Model mana yang lebih cocok dengan datanya?',
        options: [
          { id: 'Q', label: 'Model Q, karena r² lebih mendekati 1' },
          { id: 'P', label: 'Model P, karena r² lebih kecil' },
          { id: 'sama', label: 'Sama saja, keduanya model linear' },
          { id: 'tidak', label: 'Tidak bisa dibandingkan dengan r²' },
        ],
        correct: 'Q',
        cek: { tipe: 'r2', r2: { P: 0.58, Q: 0.93 } },
        explanation:
          'r² = 0,93 berarti sekitar 93% variasi nilai dijelaskan model — lebih cocok daripada 58%.',
      },
      {
        id: 't6',
        type: 'choice',
        cerita: 'Sebuah titik data memiliki y = 30, sedangkan prediksi garisnya ŷ = 34.',
        pertanyaan: 'Residu titik itu dan letaknya adalah …',
        options: [
          { id: 'bawah', label: 'e = −4, titik di bawah garis' },
          { id: 'atas', label: 'e = 4, titik di atas garis' },
          { id: 'atasNeg', label: 'e = −4, titik di atas garis' },
          { id: 'pada', label: 'e = 64, titik pada garis' },
        ],
        correct: 'bawah',
        cek: { tipe: 'residu', y: 30, yTopi: 34 },
        explanation: 'e = y − ŷ = 30 − 34 = −4. Residu negatif berarti titik di bawah garis.',
      },
      {
        id: 't7',
        type: 'choice',
        cerita: 'Data x ada di sel A2:A9 dan data y di sel B2:B9 pada spreadsheet.',
        pertanyaan: 'Rumus sel untuk kemiringan garis regresi adalah …',
        options: [
          { id: 'slope', label: '=SLOPE(B2:B9;A2:A9)' },
          { id: 'intercept', label: '=INTERCEPT(B2:B9;A2:A9)' },
          { id: 'rsq', label: '=RSQ(B2:B9;A2:A9)' },
          { id: 'average', label: '=AVERAGE(B2:B9)' },
        ],
        correct: 'slope',
        explanation:
          '=SLOPE memberi kemiringan m; =INTERCEPT memberi titik potong c; =RSQ memberi r².',
      },
      {
        id: 't8',
        type: 'choice',
        cerita: 'Spreadsheet menampilkan kemiringan 1,2 dan titik potong −3,5 untuk data (x, y).',
        pertanyaan: 'Persamaan model linear terbaiknya adalah …',
        options: [
          { id: 'benar', label: 'ŷ = 1,2x − 3,5' },
          { id: 'tukar', label: 'ŷ = −3,5x + 1,2' },
          { id: 'tanda', label: 'ŷ = 1,2x + 3,5' },
          { id: 'balik', label: 'x = 1,2ŷ − 3,5' },
        ],
        correct: 'benar',
        cek: { tipe: 'persamaan', m: 1.2, c: -3.5 },
        explanation: 'ŷ = mx + c dengan m = 1,2 dan c = −3,5.',
      },
      {
        id: 't9',
        type: 'choice',
        cerita:
          'Tiga garis dicoba untuk data yang sama. Garis K melewati 5 titik (JKR = 96), Garis L tidak melewati satu titik pun (JKR = 40), dan Garis M punya Σe = 0 (JKR = 210).',
        pertanyaan: 'Garis terbaik adalah …',
        options: [
          { id: 'L', label: 'Garis L' },
          { id: 'K', label: 'Garis K' },
          { id: 'M', label: 'Garis M' },
          { id: 'KM', label: 'Garis K dan M sama baiknya' },
        ],
        correct: 'L',
        cek: { tipe: 'jkr', jkr: { K: 96, L: 40, M: 210 } },
        explanation:
          'Yang menentukan adalah JKR terkecil: Garis L (40), walaupun tidak melewati titik mana pun.',
      },
      {
        id: 't10',
        type: 'input',
        mode: 'isian',
        cerita:
          'Model waktu pengujian aplikasi: ŷ = 1,5x + 20, dengan x = banyak test case dan ŷ = menit.',
        pertanyaan: 'Berapa menit perkiraan pengujian untuk 30 test case?',
        jawab: 65,
        satuan: 'menit',
        cek: { tipe: 'prediksi', m: 1.5, c: 20, x: 30 },
        hints: ['Substitusikan x = 30 ke persamaan.', '1,5 × 30 = 45, lalu tambahkan 20.'],
        reveal: 'ŷ = 1,5 × 30 + 20 = 45 + 20 = 65.',
        explanation: 'Perkiraan waktu pengujian 65 menit.',
      },
      {
        id: 't11',
        type: 'input',
        mode: 'isian',
        cerita:
          'Model ukuran file build: ŷ = 4x + 10 (MB), x = banyak modul. Sebuah build dengan 10 modul ternyata berukuran 52 MB.',
        pertanyaan: 'Berapa residu build itu?',
        jawab: 2,
        satuan: 'MB',
        diagnosa: 'residu',
        cek: { tipe: 'residu', m: 4, c: 10, x: 10, y: 52 },
        hints: ['Hitung dulu ŷ = 4 × 10 + 10.', 'e = y − ŷ = 52 − 50.'],
        reveal: 'ŷ = 50, jadi e = 52 − 50 = 2.',
        explanation: 'Residu positif: ukuran sebenarnya 2 MB lebih besar dari prediksi.',
      },
      {
        id: 't12',
        type: 'input',
        mode: 'isian',
        cerita: 'Residu sebuah garis terhadap empat data adalah 2, −1, −3, dan 2.',
        pertanyaan: 'Berapa jumlah kuadrat residu (JKR) garis itu?',
        jawab: 18,
        cek: { tipe: 'jkr', residu: [2, -1, -3, 2] },
        hints: ['Kuadratkan setiap residu: 2² = 4, (−1)² = 1, …', '4 + 1 + 9 + 4.'],
        reveal: 'JKR = 4 + 1 + 9 + 4 = 18.',
        explanation: 'Residu negatif dikuadratkan menjadi positif.',
      },
      {
        id: 't13',
        type: 'input',
        mode: 'isian',
        cerita:
          'Regresi data penjualan aplikasi memberi ŷ = 2,4x + 3,5, dengan x = minggu ke- dan ŷ = unduhan (ratusan).',
        pertanyaan: 'Berapa prediksi ŷ pada minggu ke-12?',
        jawab: 32.3,
        satuan: 'ratus unduhan',
        cek: { tipe: 'prediksi', m: 2.4, c: 3.5, x: 12 },
        hints: ['2,4 × 12 = 28,8.', 'Tambahkan 3,5 — gunakan koma untuk desimal.'],
        reveal: 'ŷ = 2,4 × 12 + 3,5 = 28,8 + 3,5 = 32,3.',
        explanation: 'Perkiraan 32,3 ratus (± 3.230) unduhan.',
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
    goal: 'Merefleksikan strategi, peran teknologi, dan perasaan setelah menyelesaikan masalah estimasi.',
    guru: 'Beri waktu hening 3 menit untuk menulis. Minta 2–3 murid membagikan di mana mereka akan memakai model linear dalam proyek RPL.',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Mengapa JKR lebih tepat daripada "melewati banyak titik" atau "jumlah residu nol" untuk memilih garis terbaik?',
        placeholder: 'Contoh: karena JKR memperhitungkan …',
      },
      {
        id: 'q2',
        teks: 'Apa yang dikerjakan teknologi, dan apa yang tetap harus kamu putuskan sendiri?',
        placeholder: 'Contoh: spreadsheet menghitung m dan c, tetapi aku yang …',
      },
      {
        id: 'q3',
        teks: 'Di proyek RPL mana lagi model linear bisa membantu memprediksi sesuatu?',
        placeholder: 'Contoh: memprediksi waktu build dari banyak modul …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu menentukan model linear terbaik dengan bantuan teknologi sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '🌟 Sangat yakin — aku bisa menjelaskannya ke teman' },
      { id: 'yakin', label: '😊 Yakin — aku bisa mengerjakan sendiri' },
      { id: 'cukup', label: '🙂 Cukup — kadang masih perlu petunjuk' },
      { id: 'belum', label: '🤔 Belum yakin — aku perlu berlatih lagi' },
    ],
    nextLabel: 'Simpan Refleksi & Selesai →',
  },

  selesai: {
    judul: 'Estimasi Terkirim ke Klien!',
    teks: 'Kamu berhasil menentukan model linear terbaik dengan bantuan teknologi digital dan memakainya untuk menjawab klien.',
    contoh: [
      { ikon: '📏', nama: 'Residu', isi: 'e = y − ŷ' },
      { ikon: '⚖️', nama: 'Ukuran kecocokan', isi: 'JKR = Σ(y − ŷ)²' },
      { ikon: '💻', nama: 'Model terbaik', isi: 'ŷ = 2,5x + 4' },
      { ikon: '📨', nama: 'Estimasi 16 SP', isi: '44 jam' },
    ],
    capaian: [
      'Menghitung prediksi dan residu, serta menafsirkan residu positif, negatif, dan nol.',
      'Membandingkan garis dengan jumlah kuadrat residu (JKR), bukan dengan banyaknya titik yang dilewati.',
      'Menentukan garis kuadrat terkecil dengan spreadsheet atau kode, lalu menafsirkan m, c, dan r².',
      'Memakai model untuk estimasi dan membedakan interpolasi dengan ekstrapolasi.',
    ],
  },
};
