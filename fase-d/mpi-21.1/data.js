'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Hubungan Mean, Median & Modus Data Tunggal —
   Fase D, SMP Kelas VIII · Topik 21

   Tujuan Pembelajaran:
   Menganalisis hubungan antara mean, median, dan modus pada suatu
   data tunggal melalui penyelesaian soal kontekstual.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ........... 'stimulasi'
     Sintaks 2 — Problem statement ..... 'masalah'
     Sintaks 3 — Data collection ....... 'koleksi'
     Sintaks 4 — Data processing ....... 'olahPola' & 'olahMakna'
     Sintaks 5 — Verification .......... 'verifikasi'
     Sintaks 6 — Generalization ........ 'generalisasi'
     Penerapan & penutup ............... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 40 menit, murid berpasangan):
     1. Stimulasi    (7')  — "Tiga Juru Bicara, Satu Data": tabungan
                             mingguan 9 murid (satu murid Rp42 ribu).
                             Rani, Sigit, dan Tasya sama-sama mengaku
                             "umumnya" tabungan kelas Rp10, Rp6, dan Rp5
                             ribu. Murid MENDUGA siapa yang benar, angka
                             mana paling mewakili, dan ukuran mana yang
                             paling berubah bila Rp42 ribu dikeluarkan
                             (tidak dinilai).
     2. Masalah      (5')  — memilih pertanyaan inti, menulis hipotesis.
     3. Lab          (18') — Lab Geser Data: diagram titik skor lempar
                             bola 7 murid dengan penanda mean ▲, median ◆,
                             modus ■ yang bergerak langsung. Empat misi:
                             membuat ketiganya sama, mean > median,
                             mean < median, dan mengubah hanya nilai
                             terbesar. Tabel temuan terisi otomatis.
     4a. Pola        (12') — pertanyaan penuntun dari tabel (simetris,
                             ekor kanan, ekor kiri, pengaruh pencilan),
                             lalu isian median/modus/mean berdiagnosa
                             miskonsepsi dan menentukan hubungannya.
     4b. Makna       (10') — memilih ukuran yang paling mewakili pada
                             konteks (ukuran sepatu, penghasilan dengan
                             pencilan, nilai ulangan) & pemilahan.
     5. Verifikasi   (12') — dua data BARU diambil acak dari bank enam
                             konteks: menduga hubungan dari diagram,
                             menghitung ketiga ukuran, mengecek dugaan,
                             dan menafsirkan; lalu kembali ke data
                             tabungan tanpa Rp42 ribu.
     6. Generalisasi (5')  — menyusun kesimpulan hubungan ketiga ukuran.
     7. Uji terap    (10') — delapan soal diambil acak dari bank delapan
                             belas soal (hitung, pilih nilai ukuran,
                             hubungan, konteks).
     8. Refleksi     (1')  — rekap, refleksi tertulis, penilaian diri.

   Kunci mean/median/modus, hubungan, opsi berpengecoh, dan diagnosa
   miskonsepsi TIDAK ditulis tangan: semuanya dihitung app.js dengan
   kunciUkuran(), hubunganRerataMedian(), opsiUkuran(), diagnosaUkuran()
   dari shared/engine.js seksi 87–88.

   Catatan pengacakan: seluruh daftar pilihan di berkas ini ditulis
   dalam urutan "wajar" (jawaban baku sering di urutan pertama).
   app.js mengacaknya SEKALI saat state disiapkan (ensureShuffledOrder /
   ensureSortStates / shuffleArray dari shared/engine.js), sehingga tiap
   murid dan tiap Reset mendapat urutan berbeda. Data verifikasi dan soal
   uji terap juga diambil acak.

   Konsistensi kunci jawaban diuji tests/mpi-21.1-data.test.js terhadap
   engine seksi 87–88.
   ============================================================ */

var DL = 'Discovery Learning';

/* Pilihan Benar/Salah untuk pemilahan pernyataan. */
var OPSI_BENAR_SALAH = [
  { id: 'benar', label: 'Benar' },
  { id: 'salah', label: 'Salah' },
];

/* Pilihan hubungan mean terhadap median; id = hubunganRerataMedian(). */
var OPSI_HUBUNGAN = [
  { id: 'lebih', label: 'Mean > Median' },
  { id: 'sama', label: 'Mean = Median' },
  { id: 'kurang', label: 'Mean < Median' },
  { id: 'tidakTentu', label: 'Tidak dapat ditentukan dari data' },
];

var DATA = {
  konteks: {
    sekolah: { ikon: '🏫', nama: 'Sekolah' },
    rumah: { ikon: '🏠', nama: 'Rumah' },
    olahraga: { ikon: '⚽', nama: 'Olahraga' },
    usaha: { ikon: '🛒', nama: 'Jual Beli' },
    konsep: { ikon: '📊', nama: 'Konsep Ukuran Pemusatan' },
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; dibandingkan dengan temuan pada tahap
     Verifikasi. `baku` & `juru[].nilai` diuji ulang di tes.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati tiga pernyataan berbeda tentang data yang sama, lalu menduga mengapa semuanya bisa muncul.',
    tp: 'Menganalisis hubungan antara mean, median, dan modus pada suatu data tunggal melalui penyelesaian soal kontekstual.',
    tpJudul: 'Tujuan belajar hari ini',
    kriteria: [
      'Menentukan mean, median, dan modus suatu data tunggal dengan tepat (termasuk median data genap).',
      'Menemukan bahwa pada data simetris mean, median, dan modus bernilai sama.',
      'Menjelaskan bahwa nilai ekstrem menarik mean ke arah nilai itu, sehingga mean > median (ekor kanan) atau mean < median (ekor kiri).',
      'Membandingkan pengaruh nilai ekstrem terhadap mean, median, dan modus.',
      'Memilih ukuran pemusatan yang paling mewakili data pada masalah kontekstual beserta alasannya.',
    ],
    guru: 'Tuliskan ketiga klaim di papan tanpa menyebut istilah mean, median, atau modus. Biarkan pasangan berdebat siapa yang "jujur". Perbedaan dugaan menjadi bahan penyelidikan — murid sudah mengenal rerata (Topik 20), jadi pancing: "Apakah ada cara lain menyebut nilai yang mewakili data?"',
    judul: 'Tiga Juru Bicara, Satu Data',
    pengantar:
      'Kelas VIII-B mencatat tabungan mingguan 9 murid (dalam ribu rupiah). Saat ditanya wali kelas, tiga pengurus kelas memberi jawaban berbeda — padahal mereka memakai data yang sama!',
    anggota: ['Ani', 'Bayu', 'Cici', 'Dewi', 'Dimas', 'Eka', 'Fani', 'Gita', 'Hadi'],
    data: [5, 8, 4, 5, 42, 6, 8, 5, 7],
    satuan: 'ribu rupiah',
    pencilan: 42,
    juru: [
      {
        id: 'rani',
        nama: 'Rani',
        ikon: '👩🏽',
        jenis: 'rerata',
        nilai: 10,
        klaim: '“Umumnya tabungan kita Rp10 ribu per minggu.”',
      },
      {
        id: 'sigit',
        nama: 'Sigit',
        ikon: '👦🏻',
        jenis: 'median',
        nilai: 6,
        klaim: '“Umumnya tabungan kita Rp6 ribu per minggu.”',
      },
      {
        id: 'tasya',
        nama: 'Tasya',
        ikon: '👧🏾',
        jenis: 'modus',
        nilai: 5,
        klaim: '“Umumnya tabungan kita Rp5 ribu per minggu.”',
      },
    ],
    dugaan: [
      {
        id: 'dSiapa',
        tanya: 'Siapa yang menghitung dengan benar?',
        opsi: [
          { id: 'semua', label: 'Ketiganya benar, hanya memakai cara yang berbeda' },
          { id: 'rani', label: 'Hanya Rani' },
          { id: 'sigit', label: 'Hanya Sigit' },
          { id: 'tasya', label: 'Hanya Tasya' },
        ],
        baku: 'semua',
        temuan:
          'Ketiganya benar! Rani memakai mean (90 ÷ 9 = 10), Sigit memakai median (nilai tengah data terurut = 6), dan Tasya memakai modus (5 muncul paling sering).',
      },
      {
        id: 'dWakil',
        tanya: 'Angka mana yang paling menggambarkan tabungan KEBANYAKAN murid?',
        opsi: [
          { id: 'median', label: 'Rp6 ribu' },
          { id: 'rerata', label: 'Rp10 ribu' },
          { id: 'modus', label: 'Rp5 ribu' },
          { id: 'maks', label: 'Rp42 ribu' },
        ],
        baku: 'median',
        temuan:
          'Delapan dari sembilan murid menabung kurang dari Rp10 ribu, jadi mean 10 kurang mewakili. Median 6 membagi data tepat di tengah dan tidak terpengaruh tabungan Dimas yang sangat besar.',
      },
      {
        id: 'dPencilan',
        tanya:
          'Jika tabungan Dimas (Rp42 ribu) tidak dihitung, ukuran mana yang berubah PALING BANYAK?',
        opsi: [
          { id: 'rerata', label: 'Jawaban Rani (Rp10 ribu)' },
          { id: 'median', label: 'Jawaban Sigit (Rp6 ribu)' },
          { id: 'modus', label: 'Jawaban Tasya (Rp5 ribu)' },
          { id: 'sama', label: 'Ketiganya berubah sama banyak' },
        ],
        baku: 'rerata',
        temuan:
          'Tanpa Rp42 ribu, mean turun dari 10 menjadi 6, median hanya bergeser dari 6 menjadi 5,5, dan modus tetap 5. Mean paling peka terhadap nilai ekstrem.',
      },
    ],
    catatan:
      'Belum perlu yakin! Simpan dugaanmu. Di tahap Pembuktian kamu akan mengecek apakah dugaan ini benar.',
    nextLabel: 'Lanjut ke Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan inti yang akan diselidiki dan menulis hipotesis.',
    guru: 'Arahkan murid menyadari bahwa satu data bisa diwakili tiga ukuran berbeda, dan nilainya bisa berjauhan. Terima hipotesis apa pun selama dapat diuji, mis. "mean jadi besar karena ada satu tabungan yang sangat besar".',
    pengantar:
      'Mean, median, dan modus sama-sama disebut ukuran pemusatan — ukuran yang mewakili "pusat" data. Pada data tabungan, nilainya berbeda jauh. Kita perlu tahu mengapa, dan kapan masing-masing paling tepat dipakai.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk diselidiki?',
    opsi: [
      {
        id: 'hubungan',
        label:
          'Bagaimana hubungan mean, median, dan modus pada suatu data, dan kapan masing-masing paling tepat mewakili data?',
      },
      { id: 'terbesar', label: 'Siapa murid yang tabungannya paling banyak?' },
      { id: 'total', label: 'Berapa total tabungan seluruh murid?' },
      { id: 'selalu', label: 'Ukuran mana yang nilainya selalu paling besar?' },
    ],
    correct: 'hubungan',
    umpan: {
      hubungan:
        'Tepat! Kita akan menyelidiki bagaimana posisi mean, median, dan modus berubah saat bentuk data berubah.',
      terbesar:
        'Itu hanya mencari satu nilai terbesar. Kita ingin tahu angka mana yang mewakili seluruh kelas.',
      total:
        'Total tabungan berguna, tetapi belum menjelaskan mengapa ketiga jawaban "umumnya" berbeda.',
      selalu:
        'Pertanyaan ini sudah menganggap ada ukuran yang selalu terbesar — padahal itu justru perlu diselidiki dulu.',
    },
    hipotesisLabel: 'Hipotesisku: ketiga jawaban berbeda karena …',
    hipotesisPlaceholder: 'Contoh: tabungan Dimas sangat besar sehingga …',
    nextLabel: 'Lanjut ke Lab →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA: LAB GESER DATA
     Setiap misi dicek cekMisiUkuran(). `contoh` adalah satu jawaban
     yang memenuhi misi (diuji: dapat dicapai dari `awal`).
     `gerak` membatasi titik yang boleh digeser.
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Menggeser titik data dan mengamati gerak penanda mean, median, dan modus.',
    guru: 'Minta pasangan bergantian memegang perangkat: satu menggeser, satu mencatat gerak penanda. Sebelum menggeser, minta mereka menebak penanda mana yang akan bergerak. Bila ada waktu, peragakan dengan kartu angka di papan.',
    pengantar:
      'Tujuh murid melempar bola ke keranjang dan mencatat skornya (0–12). Setiap titik pada diagram adalah skor satu murid. Di bawah garis bilangan ada tiga penanda: mean ▲, median ◆, dan modus ■.',
    caraMain: [
      'Ketuk nama seorang murid untuk memilih titiknya (titik berubah oranye).',
      'Tekan ◀ atau ▶ untuk mengurangi atau menambah skornya 1 poin.',
      'Amati penanda yang bergerak. Misi selesai otomatis saat syaratnya terpenuhi.',
    ],
    anggota: ['Ari', 'Bela', 'Caca', 'Dion', 'Elsa', 'Feri', 'Gani'],
    min: 0,
    max: 12,
    satuan: 'poin',
    misi: [
      {
        id: 'm1',
        judul: 'Misi 1 — Satukan ketiga penanda',
        tugas: 'Geser titik sampai mean, median, dan modus berada di nilai yang SAMA.',
        jenis: 'sama',
        awal: [5, 3, 6, 5, 9, 4, 5],
        contoh: [5, 3, 6, 5, 7, 4, 5],
        hints: [
          'Mean masih di kanan median. Titik mana yang paling jauh di kanan?',
          'Coba kurangi skor Elsa (9) sedikit demi sedikit sambil mengamati penanda ▲.',
        ],
        temuan:
          'Saat data menyebar seimbang di kiri dan kanan nilai tengah (simetris), mean = median = modus.',
      },
      {
        id: 'm2',
        judul: 'Misi 2 — Buat mean lebih besar dari median',
        tugas: 'Mulai dari data simetris. Geser titik sampai mean > median.',
        jenis: 'rerataLebih',
        awal: [5, 3, 6, 5, 7, 4, 5],
        contoh: [5, 3, 6, 5, 12, 4, 5],
        hints: [
          'Mean memakai SEMUA nilai. Nilai mana yang bisa kamu perbesar tanpa mengubah nilai tengah?',
          'Pilih titik paling kanan, lalu tambah skornya beberapa kali.',
        ],
        temuan:
          'Titik yang menjauh ke KANAN (ekor kanan) menarik mean ke kanan, sedangkan median dan modus tetap: modus ≤ median < mean.',
      },
      {
        id: 'm3',
        judul: 'Misi 3 — Buat mean lebih kecil dari median',
        tugas: 'Mulai lagi dari data simetris. Geser titik sampai mean < median.',
        jenis: 'rerataKurang',
        awal: [5, 3, 6, 5, 7, 4, 5],
        contoh: [5, 3, 6, 5, 7, 0, 5],
        hints: [
          'Kebalikan Misi 2: kini mean harus tertarik ke kiri.',
          'Pilih titik paling kiri, lalu kurangi skornya.',
        ],
        temuan:
          'Titik yang menjauh ke KIRI (ekor kiri) menarik mean ke kiri, sedangkan median dan modus tetap: mean < median ≤ modus.',
      },
      {
        id: 'm4',
        judul: 'Misi 4 — Hanya skor tertinggi yang berubah',
        tugas:
          'Hanya skor Elsa (tertinggi) yang boleh digeser. Ubah skornya dan amati: buat agar HANYA satu penanda yang berpindah.',
        jenis: 'hanyaRerata',
        gerak: [4],
        awal: [5, 3, 6, 5, 7, 4, 5],
        contoh: [5, 3, 6, 5, 11, 4, 5],
        hints: [
          'Tambah skor Elsa sekali, lalu amati ketiga penanda.',
          'Penanda yang memakai semua nilai data pasti ikut berubah.',
        ],
        temuan:
          'Mengubah nilai ekstrem hanya menggeser mean. Median (letak tengah) dan modus (nilai tersering) tidak terpengaruh — keduanya "tahan" terhadap pencilan.',
      },
    ],
    kolom: ['Misi', 'Data terurut', 'Mean', 'Median', 'Modus', 'Hubungan'],
    tabelJudul: 'Tabel hasil Lab Geser Data',
    selesai:
      'Semua misi selesai! Perhatikan tabelmu: kapan ketiga ukuran sama, dan ke mana mean bergerak saat ada nilai yang menjauh?',
    nextLabel: 'Lanjut Olah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4a — OLAH DATA: MENEMUKAN POLA HUBUNGAN
     `latihan.urutan` berisi jenis ukuran yang diisi; kunci &
     diagnosa dari engine. `latihan.hubungan` memakai OPSI_HUBUNGAN.
     ---------------------------------------------------------- */
  olahPola: {
    kicker: 'Tahap 4 · Pengolahan Data (Pola)',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan pola posisi mean, median, dan modus dari tabel hasil lab.',
    guru: 'Minta pasangan menyampaikan pola dengan bahasa sendiri sebelum membuka pertanyaan berikutnya. Kenalkan istilah "simetris", "ekor kanan", dan "ekor kiri" setelah pola ditemukan. Pada latihan, tekankan langkah mengurutkan data sebelum mencari median.',
    instruksi:
      'Amati tabel hasil labmu, lalu jawab pertanyaan penuntun satu per satu. Pertanyaan berikutnya terbuka setelah jawabanmu tepat.',
    pertanyaan: [
      {
        id: 'qSimetris',
        tanya:
          'Pada Misi 1, saat data menyebar seimbang (simetris), bagaimana posisi ketiga penanda?',
        opsi: [
          { id: 'sama', label: 'Ketiganya berimpit di satu nilai' },
          { id: 'meanBesar', label: 'Mean paling besar' },
          { id: 'modusBesar', label: 'Modus paling besar' },
          { id: 'acak', label: 'Posisinya acak, tidak ada pola' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Benar! Data 3, 4, 5, 5, 5, 6, 7 simetris di sekitar 5: mean = median = modus = 5.',
          meanBesar: 'Lihat baris Misi 1 di tabel: mean, median, dan modus bernilai sama.',
          modusBesar: 'Lihat baris Misi 1 di tabel: ketiganya bernilai 5.',
          acak: 'Ada pola! Lihat baris Misi 1: ketiga ukuran bernilai sama.',
        },
      },
      {
        id: 'qPeka',
        tanya: 'Saat satu titik ditarik jauh ke kanan (Misi 2), penanda mana yang ikut bergerak?',
        opsi: [
          { id: 'mean', label: 'Hanya mean ▲' },
          { id: 'median', label: 'Hanya median ◆' },
          { id: 'modus', label: 'Hanya modus ■' },
          { id: 'semua', label: 'Ketiganya bergerak sama jauh' },
        ],
        correct: 'mean',
        umpan: {
          mean: 'Tepat! Mean memakai SEMUA nilai, jadi satu nilai yang menjauh langsung menarik mean.',
          median:
            'Median hanya bergantung pada nilai di letak tengah. Titik paling kanan tetap di kanan, jadi nilai tengahnya tidak berubah.',
          modus:
            'Modus adalah nilai yang paling sering muncul. Menggeser satu titik di ujung tidak mengubah nilai tersering.',
          semua: 'Coba ulangi Misi 2 dan amati: median ◆ dan modus ■ diam di tempat.',
        },
      },
      {
        id: 'qKanan',
        tanya:
          'Jadi, pada data dengan EKOR KANAN (ada nilai sangat besar), urutan yang biasa terjadi:',
        opsi: [
          { id: 'kanan', label: 'modus ≤ median < mean' },
          { id: 'kiri', label: 'mean < median ≤ modus' },
          { id: 'sama', label: 'mean = median = modus' },
          { id: 'acak', label: 'median < modus < mean' },
        ],
        correct: 'kanan',
        umpan: {
          kanan:
            'Benar! Nilai besar menarik mean ke kanan, melewati median. Pada data tabungan: modus 5 < median 6 < mean 10.',
          kiri: 'Itu urutan untuk ekor KIRI. Pada ekor kanan, mean tertarik ke arah nilai besar.',
          sama: 'Itu terjadi pada data simetris, bukan data berekor.',
          acak: 'Lihat Misi 2: modus dan median tetap di 5, sedangkan mean naik.',
        },
      },
      {
        id: 'qKiri',
        tanya: 'Pada data dengan EKOR KIRI (ada nilai sangat kecil), seperti Misi 3:',
        opsi: [
          { id: 'kiri', label: 'mean < median ≤ modus' },
          { id: 'kanan', label: 'modus ≤ median < mean' },
          { id: 'sama', label: 'mean = median = modus' },
          { id: 'medianKecil', label: 'median < mean < modus' },
        ],
        correct: 'kiri',
        umpan: {
          kiri: 'Tepat! Nilai yang sangat kecil menarik mean ke kiri, sehingga mean berada di bawah median.',
          kanan: 'Itu urutan untuk ekor KANAN. Lihat baris Misi 3 di tabel.',
          sama: 'Lihat Misi 3: mean sudah tidak sama dengan median.',
          medianKecil: 'Lihat Misi 3: median tetap 5, sedangkan mean turun di bawahnya.',
        },
      },
      {
        id: 'qPencilan',
        tanya:
          'Misi 4: mengubah nilai terbesar hanya menggeser satu penanda. Ukuran mana yang paling PEKA terhadap nilai ekstrem (pencilan)?',
        opsi: [
          { id: 'mean', label: 'Mean' },
          { id: 'median', label: 'Median' },
          { id: 'modus', label: 'Modus' },
          { id: 'tidakAda', label: 'Tidak ada yang terpengaruh' },
        ],
        correct: 'mean',
        umpan: {
          mean: 'Benar! Mean peka terhadap pencilan; median dan modus lebih "tahan".',
          median: 'Median tetap 5 selama skor Elsa berada di atas nilai tengah.',
          modus: 'Modus tetap 5 karena nilai 5 masih paling sering muncul.',
          tidakAda: 'Lihat lagi Misi 4: penanda ▲ bergerak setiap kali skor Elsa berubah.',
        },
      },
    ],
    temuan: [
      { label: 'Mean ▲', teks: 'jumlah ÷ banyak data; memakai semua nilai, peka pencilan' },
      { label: 'Median ◆', teks: 'nilai tengah data terurut; tahan pencilan' },
      { label: 'Modus ■', teks: 'nilai yang paling sering muncul; tahan pencilan' },
      { label: 'Simetris', teks: 'mean = median = modus' },
      { label: 'Ekor kanan', teks: 'modus ≤ median < mean' },
      { label: 'Ekor kiri', teks: 'mean < median ≤ modus' },
    ],
    latihanJudul: 'Coba tanpa lab',
    latihanInstruksi:
      'Hitung ketiga ukuran berikut, lalu tentukan hubungannya. Tulis desimal dengan koma, mis. 12,5.',
    latihan: {
      id: 'lat',
      nama: 'Lama perjalanan ke sekolah',
      cerita: 'Lama perjalanan 8 murid dari rumah ke sekolah (dalam menit).',
      anggota: ['Nia', 'Oki', 'Putri', 'Qori', 'Rafi', 'Sari', 'Tono', 'Umi'],
      data: [10, 15, 12, 10, 45, 13, 10, 13],
      satuan: 'menit',
      min: 0,
      max: 46,
      urutan: ['median', 'modus', 'rerata'],
      hints: {
        median: [
          'Urutkan dulu: 10, 10, 10, 12, 13, 13, 15, 45.',
          'Ada 8 data (genap), jadi ada dua nilai tengah: data ke-4 dan ke-5. Median = rata-rata keduanya.',
        ],
        modus: [
          'Hitung berapa kali setiap nilai muncul.',
          'Modus adalah NILAI yang paling sering muncul, bukan banyak kemunculannya.',
        ],
        rerata: ['Jumlahkan kedelapan data.', 'Jumlahnya 128, banyak datanya 8.'],
      },
      hubungan: {
        tanya: 'Dari ketiga hasil tadi, bagaimana hubungan mean dan median data ini?',
        umpan: {
          lebih:
            'Tepat! Mean 16 > median 12,5 > modus 10. Rafi yang menempuh 45 menit membuat ekor kanan dan menarik mean ke atas.',
          sama: 'Bandingkan lagi hasil hitunganmu: mean dan median ternyata berbeda.',
          kurang: 'Bandingkan lagi: mean ternyata lebih BESAR dari median.',
          tidakTentu: 'Mean dan median sudah kamu hitung, jadi hubungannya dapat ditentukan.',
        },
      },
    },
    nextLabel: 'Lanjut: Memilih Ukuran →',
  },

  /* ----------------------------------------------------------
     TAHAP 4b — OLAH DATA: MEMILIH UKURAN YANG MEWAKILI
     `pertanyaan[].data` diuji: correct sesuai ciri datanya.
     ---------------------------------------------------------- */
  olahMakna: {
    kicker: 'Tahap 5 · Pengolahan Data (Makna)',
    syntax: DL + ' · Sintaks 4',
    goal: 'Memilih ukuran pemusatan yang paling mewakili data sesuai konteks dan bentuk datanya.',
    guru: 'Tekankan bahwa tidak ada ukuran yang "selalu paling benar"; yang dinilai adalah alasan pemilihannya. Hubungkan dengan berita sehari-hari (gaji, harga rumah) yang sering memakai median.',
    instruksi:
      'Untuk setiap masalah, pilih ukuran yang paling tepat. Perhatikan pertanyaannya dan bentuk datanya.',
    pertanyaan: [
      {
        id: 'qSepatu',
        tanya:
          'Toko sepatu mencatat ukuran sepatu yang terjual hari ini: 37, 38, 38, 39, 38, 40, 41, 38, 39. Pemilik toko ingin menambah stok SATU ukuran yang paling laku. Ukuran mana yang dipakai?',
        data: [37, 38, 38, 39, 38, 40, 41, 38, 39],
        opsi: [
          { id: 'modus', label: 'Modus' },
          { id: 'mean', label: 'Mean' },
          { id: 'median', label: 'Median' },
          { id: 'maks', label: 'Ukuran terbesar' },
        ],
        correct: 'modus',
        umpan: {
          modus:
            'Tepat! Ukuran 38 paling sering terjual (4 kali). Modus cocok untuk mencari pilihan terbanyak.',
          mean: 'Mean 38,67 bukan ukuran sepatu yang ada di toko. Yang dicari adalah ukuran yang paling sering dibeli.',
          median:
            'Median memang 38, tetapi alasannya kebetulan. Pertanyaannya "paling laku", yaitu paling sering muncul.',
          maks: 'Ukuran 41 hanya terjual sekali.',
        },
      },
      {
        id: 'qKantin',
        tanya:
          'Penghasilan harian 7 pedagang kantin (ribu rupiah): 80, 90, 85, 95, 90, 100, 400. Koperasi ingin melaporkan penghasilan pedagang yang "umum". Ukuran mana yang paling mewakili?',
        data: [80, 90, 85, 95, 90, 100, 400],
        opsi: [
          { id: 'median', label: 'Median' },
          { id: 'mean', label: 'Mean' },
          { id: 'modus', label: 'Modus' },
          { id: 'maks', label: 'Penghasilan terbesar' },
        ],
        correct: 'median',
        umpan: {
          median:
            'Benar! Median 90 ribu. Satu pedagang yang berpenghasilan 400 ribu menarik mean menjadi 134,29 ribu — di atas penghasilan enam pedagang lainnya.',
          mean: 'Mean 134,29 ribu lebih besar dari penghasilan 6 dari 7 pedagang. Pencilan 400 menarik mean ke atas.',
          modus:
            'Modus 90 kebetulan sama dengan median, tetapi hanya dua pedagang yang mendapat 90. Median lebih tepat karena membagi data di tengah.',
          maks: 'Satu nilai terbesar tidak mewakili pedagang lain.',
        },
      },
      {
        id: 'qUlangan',
        tanya:
          'Nilai ulangan 6 murid: 72, 75, 78, 80, 82, 85 (tidak ada nilai ekstrem). Guru ingin SATU angka yang memperhitungkan nilai semua murid. Ukuran mana yang dipakai?',
        data: [72, 75, 78, 80, 82, 85],
        opsi: [
          { id: 'mean', label: 'Mean' },
          { id: 'median', label: 'Median' },
          { id: 'modus', label: 'Modus' },
          { id: 'min', label: 'Nilai terkecil' },
        ],
        correct: 'mean',
        umpan: {
          mean: 'Tepat! Tanpa pencilan, mean 78,67 mewakili data dengan baik dan memakai SEMUA nilai.',
          median:
            'Median 79 juga wajar, tetapi hanya memakai dua nilai tengah. Guru ingin semua nilai diperhitungkan.',
          modus: 'Setiap nilai hanya muncul sekali, jadi data ini tidak punya modus.',
          min: 'Nilai terkecil hanya mewakili satu murid.',
        },
      },
    ],
    temuan: [
      {
        label: 'Pakai modus',
        teks: 'untuk pilihan/nilai yang paling banyak muncul (mis. ukuran, warna, rasa)',
      },
      {
        label: 'Pakai median',
        teks: 'saat ada pencilan atau data berekor (mis. penghasilan, harga rumah)',
      },
      {
        label: 'Pakai mean',
        teks: 'saat data tanpa pencilan dan semua nilai perlu diperhitungkan',
      },
    ],
    pilahJudul: 'Benar atau salah?',
    pilahInstruksi: 'Pilah setiap pernyataan tentang hubungan mean, median, dan modus berikut.',
    pilah: [
      {
        id: 'pSimetris',
        teks: 'Pada data yang simetris, mean, median, dan modus bernilai sama.',
        correct: 'benar',
        explanation: 'Seperti Misi 1: data 3, 4, 5, 5, 5, 6, 7 memiliki mean = median = modus = 5.',
      },
      {
        id: 'pSelalu',
        teks: 'Mean selalu lebih besar daripada median.',
        correct: 'salah',
        explanation: 'Pada ekor kiri mean < median, dan pada data simetris keduanya sama.',
      },
      {
        id: 'pPeka',
        teks: 'Satu nilai yang sangat besar lebih memengaruhi mean daripada median.',
        correct: 'benar',
        explanation: 'Mean memakai semua nilai; median hanya bergantung pada letak tengah.',
      },
      {
        id: 'pEkorKanan',
        teks: 'Jika mean jauh lebih besar dari median, kemungkinan ada nilai yang sangat besar.',
        correct: 'benar',
        explanation: 'Nilai yang sangat besar membentuk ekor kanan dan menarik mean ke atas.',
      },
      {
        id: 'pModusTengah',
        teks: 'Modus selalu berada tepat di tengah data yang sudah diurutkan.',
        correct: 'salah',
        explanation:
          'Itu median. Modus adalah nilai yang paling sering muncul, letaknya bisa di mana saja.',
      },
      {
        id: 'pRumah',
        teks: 'Jika di satu kompleks ada satu rumah yang sangat mahal, median harga rumah lebih mewakili daripada mean.',
        correct: 'benar',
        explanation:
          'Rumah yang sangat mahal menarik mean ke atas, sedangkan median tetap di tengah.',
      },
      {
        id: 'pTanpaEkstrem',
        teks: 'Jika mean lebih kecil dari median, berarti datanya tidak memiliki nilai ekstrem.',
        correct: 'salah',
        explanation:
          'Justru kemungkinan ada nilai yang sangat KECIL (ekor kiri) yang menarik mean ke bawah.',
      },
    ],
    nextLabel: 'Lanjut ke Pembuktian →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN
     Bank data baru; `ambil` data diambil acak. Kunci ketiga ukuran &
     hubungannya dihitung dari `data`. `tafsir` berpilihan dengan umpan.
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 6 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Membuktikan pola pada data baru: menduga hubungan dari diagram, menghitung ketiga ukuran, lalu menafsirkannya.',
    guru: 'Setiap pasangan mendapat data acak yang berbeda — minta mereka saling menukar hasil dengan pasangan lain dan mencari data mana yang simetris, berekor kanan, atau berekor kiri.',
    ambil: 2,
    judulA: 'A. Data baru dari sekitar kita',
    instruksiA:
      'Amati diagram titiknya dan duga dulu hubungan mean dan median. Setelah itu hitung ketiga ukurannya untuk membuktikan dugaanmu.',
    dugaLabel: 'Dugaanku dari bentuk diagram:',
    bank: [
      {
        id: 'vKuis',
        konteks: 'sekolah',
        nama: 'Skor kuis IPA',
        cerita: 'Skor kuis IPA 7 murid (skala 0–10).',
        anggota: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'],
        data: [7, 8, 6, 7, 9, 7, 5],
        satuan: '',
        max: 10,
        tafsir: {
          tanya: 'Ukuran mana yang tepat untuk mewakili skor kelas ini?',
          opsi: [
            { id: 'semua', label: 'Ketiganya sama-sama tepat, karena nilainya sama (7)' },
            { id: 'mean', label: 'Hanya mean, karena memakai semua nilai' },
            { id: 'median', label: 'Hanya median, karena ada pencilan' },
            { id: 'tidakAda', label: 'Tidak ada yang tepat' },
          ],
          correct: 'semua',
          umpan: {
            semua: 'Tepat! Data simetris: mean = median = modus = 7.',
            mean: 'Mean memang tepat, tetapi median dan modusnya juga 7. Data simetris membuat ketiganya sama.',
            median: 'Tidak ada pencilan pada data ini. Ketiga ukuran bernilai 7.',
            tidakAda: 'Ketiga ukuran bernilai 7 dan mewakili data dengan baik.',
          },
        },
      },
      {
        id: 'vAntre',
        konteks: 'usaha',
        nama: 'Lama antre di koperasi',
        cerita: 'Lama 6 murid mengantre di kasir koperasi sekolah (dalam menit).',
        anggota: ['A', 'B', 'C', 'D', 'E', 'F'],
        data: [3, 2, 3, 12, 4, 3],
        satuan: 'menit',
        max: 13,
        tafsir: {
          tanya:
            'Koperasi ingin melaporkan lama antre yang BIASA dialami murid. Sebaiknya memakai …',
          opsi: [
            { id: 'median', label: 'median 3 menit' },
            { id: 'mean', label: 'mean 4,5 menit' },
            { id: 'maks', label: 'antrean terlama 12 menit' },
            { id: 'jumlah', label: 'jumlah lama antre 27 menit' },
          ],
          correct: 'median',
          umpan: {
            median:
              'Benar! Satu antrean 12 menit menarik mean ke 4,5 menit, padahal 5 dari 6 murid mengantre paling lama 4 menit.',
            mean: 'Mean 4,5 menit lebih lama dari antrean 5 murid. Ada pencilan 12 menit yang menariknya.',
            maks: 'Antrean 12 menit hanya dialami satu murid.',
            jumlah: 'Jumlah tidak menggambarkan lama antre satu murid.',
          },
        },
      },
      {
        id: 'vLari',
        konteks: 'olahraga',
        nama: 'Putaran lari pagi',
        cerita:
          'Banyak putaran lari pagi 8 murid di lapangan. Satu murid hanya berlari 2 putaran karena kakinya cedera.',
        anggota: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'],
        data: [8, 9, 9, 2, 9, 8, 7, 10],
        satuan: 'putaran',
        max: 11,
        tafsir: {
          tanya: 'Mengapa mean data ini lebih kecil daripada median?',
          opsi: [
            { id: 'tarik', label: 'Nilai 2 yang sangat kecil menarik mean ke bawah' },
            { id: 'banyak', label: 'Banyak murid berlari 9 putaran' },
            { id: 'salah', label: 'Perhitungan mean pasti salah' },
            { id: 'selalu', label: 'Mean memang selalu lebih kecil dari median' },
          ],
          correct: 'tarik',
          umpan: {
            tarik:
              'Tepat! Data berekor kiri: mean 7,75 < median 8,5 < modus 9. Satu nilai ekstrem kecil menarik mean.',
            banyak:
              'Nilai 9 yang sering muncul adalah modus. Yang membuat mean turun adalah nilai yang sangat kecil.',
            salah: 'Perhitungannya benar: 62 ÷ 8 = 7,75.',
            selalu: 'Tidak selalu — pada ekor kanan justru mean > median.',
          },
        },
      },
      {
        id: 'vKeluarga',
        konteks: 'rumah',
        nama: 'Anggota keluarga',
        cerita: 'Banyak anggota keluarga di 7 rumah dalam satu RT.',
        anggota: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7'],
        data: [4, 5, 4, 3, 4, 6, 2],
        satuan: 'orang',
        max: 7,
        tafsir: {
          tanya: 'Pak RT berkata, "Umumnya satu rumah di RT kita dihuni 4 orang." Pernyataan itu …',
          opsi: [
            { id: 'tepat', label: 'tepat, menurut mean, median, maupun modus' },
            { id: 'meanSaja', label: 'hanya tepat menurut mean' },
            { id: 'modusSaja', label: 'hanya tepat menurut modus' },
            { id: 'keliru', label: 'keliru, karena ada rumah yang dihuni 6 orang' },
          ],
          correct: 'tepat',
          umpan: {
            tepat: 'Benar! Data simetris di sekitar 4: mean = median = modus = 4.',
            meanSaja: 'Hitung lagi median dan modusnya — keduanya juga 4.',
            modusSaja: 'Hitung lagi mean dan mediannya — keduanya juga 4.',
            keliru: 'Satu rumah berisi 6 orang tidak membuat pernyataan "umumnya 4 orang" keliru.',
          },
        },
      },
      {
        id: 'vJajan',
        konteks: 'usaha',
        nama: 'Uang jajan sehari',
        cerita: 'Uang jajan 6 murid dalam sehari (dalam ribu rupiah).',
        anggota: ['J1', 'J2', 'J3', 'J4', 'J5', 'J6'],
        data: [6, 5, 7, 5, 20, 5],
        satuan: 'ribu rupiah',
        max: 21,
        tafsir: {
          tanya: 'Pernyataan mana yang bisa MENYESATKAN?',
          opsi: [
            { id: 'mean', label: '"Rata-rata (mean) uang jajan murid Rp8 ribu."' },
            { id: 'median', label: '"Separuh murid jajan paling banyak Rp5,5 ribu."' },
            { id: 'modus', label: '"Paling banyak murid jajan Rp5 ribu."' },
            { id: 'maks', label: '"Ada murid yang jajan Rp20 ribu."' },
          ],
          correct: 'mean',
          umpan: {
            mean: 'Tepat! Mean Rp8 ribu lebih besar dari uang jajan 5 dari 6 murid, karena tertarik nilai Rp20 ribu.',
            median: 'Pernyataan ini benar: median 5,5 berarti separuh data ≤ 5,5.',
            modus: 'Pernyataan ini benar: 5 muncul tiga kali.',
            maks: 'Pernyataan ini benar sesuai data.',
          },
        },
      },
      {
        id: 'vMasak',
        konteks: 'sekolah',
        nama: 'Nilai praktik memasak',
        cerita: 'Nilai praktik memasak 8 murid (skala 10). Dua murid kuenya gosong.',
        anggota: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8'],
        data: [9, 8, 9, 3, 9, 8, 9, 1],
        satuan: '',
        max: 10,
        tafsir: {
          tanya:
            'Guru berkata, "Mean kelas 7, jadi kebanyakan murid mendapat nilai sekitar 7." Pernyataan itu …',
          opsi: [
            { id: 'keliru', label: 'keliru, kebanyakan murid mendapat 8 atau 9' },
            { id: 'tepat', label: 'tepat, karena mean selalu mewakili kebanyakan data' },
            { id: 'modus', label: 'tepat, karena 7 adalah modus' },
            { id: 'median', label: 'tepat, karena 7 adalah median' },
          ],
          correct: 'keliru',
          umpan: {
            keliru:
              'Benar! Data berekor kiri: mean 7 < median 8,5 < modus 9. Dua nilai rendah menarik mean ke bawah.',
            tepat: 'Mean tidak selalu mewakili kebanyakan data, terutama bila ada nilai ekstrem.',
            modus: 'Modus data ini 9, bukan 7.',
            median: 'Median data ini 8,5, bukan 7.',
          },
        },
      },
    ],
    judulB: 'B. Kembali ke tabungan kelas VIII-B',
    instruksiB:
      'Keluarkan tabungan Dimas (Rp42 ribu), lalu hitung ulang ketiga ukuran dari 8 data sisanya.',
    tanpaLabel: 'Data tanpa Dimas',
    pilihJuru: {
      tanya: 'Jadi, juru bicara mana yang paling tepat menggambarkan tabungan KEBANYAKAN murid?',
      opsi: [
        { id: 'sigit', label: 'Sigit (median Rp6 ribu)' },
        { id: 'rani', label: 'Rani (mean Rp10 ribu)' },
        { id: 'tasya', label: 'Tasya (modus Rp5 ribu)' },
        { id: 'total', label: 'Sebut saja total tabungan kelas Rp90 ribu' },
      ],
      correct: 'sigit',
      umpan: {
        sigit:
          'Tepat! Median hampir tidak terpengaruh tabungan Dimas (6 → 5,5), sehingga paling jujur menggambarkan kebanyakan murid. Mean Rani turun jauh (10 → 6) begitu satu data dikeluarkan.',
        rani: 'Mean Rp10 ribu lebih besar dari tabungan 8 dari 9 murid — tertarik oleh tabungan Dimas.',
        tasya:
          'Modus Rp5 ribu tidak salah, tetapi hanya menggambarkan 3 murid. Median membagi kelas tepat di tengah sehingga lebih mewakili.',
        total: 'Total tidak menggambarkan tabungan seorang murid.',
      },
    },
    judulC: 'C. Bagaimana dengan dugaan awalmu?',
    kesimpulan:
      'Terbukti pada data baru: data simetris membuat ketiga ukuran sama, nilai ekstrem besar membuat mean > median, dan nilai ekstrem kecil membuat mean < median.',
    nextLabel: 'Lanjut ke Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Menyusun sendiri kesimpulan tentang hubungan mean, median, dan modus.',
    guru: 'Minta beberapa pasangan membacakan kesimpulan lengkap, lalu gambarkan tiga sketsa diagram (simetris, ekor kanan, ekor kiri) di papan beserta letak ketiga ukuran.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Setiap potongan hanya dipakai satu kali, dan ada potongan yang tidak terpakai.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'g1', awal: 'Pada data yang simetris (menyebar seimbang),', correct: 'b1' },
      { id: 'g2', awal: 'Jika ada nilai ekstrem yang sangat besar (ekor kanan),', correct: 'b2' },
      { id: 'g3', awal: 'Jika ada nilai ekstrem yang sangat kecil (ekor kiri),', correct: 'b3' },
      { id: 'g4', awal: 'Ukuran yang paling peka terhadap nilai ekstrem adalah', correct: 'b4' },
      {
        id: 'g5',
        awal: 'Untuk data yang memiliki pencilan, ukuran yang lebih mewakili biasanya',
        correct: 'b5',
      },
      {
        id: 'g6',
        awal: 'Untuk mencari pilihan yang paling banyak (mis. ukuran sepatu), dipakai',
        correct: 'b6',
      },
    ],
    bank: [
      { id: 'b1', teks: 'mean, median, dan modus bernilai sama.' },
      { id: 'b2', teks: 'mean tertarik ke atas, biasanya modus ≤ median < mean.' },
      { id: 'b3', teks: 'mean tertarik ke bawah, biasanya mean < median ≤ modus.' },
      { id: 'b4', teks: 'mean, karena memakai semua nilai data.' },
      { id: 'b5', teks: 'median, karena hanya bergantung pada letak tengah data terurut.' },
      { id: 'b6', teks: 'modus, yaitu nilai yang paling sering muncul.' },
      { id: 'x1', teks: 'median, karena memakai semua nilai data.' },
      { id: 'x2', teks: 'mean selalu sama dengan modus.' },
      { id: 'x3', teks: 'modus, karena selalu berada di tengah data.' },
    ],
    rangkuman: [
      'Simetris: mean = median = modus.',
      'Ekor kanan (ada nilai sangat besar): modus ≤ median < mean.',
      'Ekor kiri (ada nilai sangat kecil): mean < median ≤ modus.',
      'Mean peka terhadap pencilan; median dan modus lebih tahan.',
      'Pilih ukuran sesuai pertanyaan: modus untuk yang terbanyak, median bila ada pencilan, mean bila data tanpa pencilan.',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP
     tipe 'hitung'      isian; jenis 'rerata'|'median'|'modus', kunci
                        kunciUkuran, diagnosa diagnosaUkuran.
     tipe 'pilihUkuran' pilihan ganda; opsi dari opsiUkuran.
     tipe 'hubungan'    pilihan OPSI_HUBUNGAN; kunci
                        hubunganRerataMedian(data).
     tipe 'pilih'       pilihan ganda konteks; opsi, correct & umpan.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan hubungan mean, median, dan modus untuk menyelesaikan masalah kontekstual.',
    guru: 'Soal diambil acak sehingga tiap murid mendapat paket berbeda. Amati diagnosa yang sering muncul (lupa mengurutkan, median data genap, frekuensi sebagai modus) sebagai bahan umpan balik klasikal.',
    instruksi:
      'Kerjakan 8 soal berikut. Soal berikutnya terbuka setelah soal ini selesai. Gunakan petunjuk bila perlu.',
    banyak: 8,
    komposisi: { hitung: 3, pilihUkuran: 2, hubungan: 1, pilih: 2 },
    soal: [
      {
        id: 'h1',
        tipe: 'hitung',
        jenis: 'median',
        konteks: 'sekolah',
        cerita: 'Lama 5 murid membaca buku cerita kemarin (menit): 12, 7, 9, 15, 8.',
        data: [12, 7, 9, 15, 8],
        satuan: 'menit',
        tanya: 'Median lama membaca = …',
        hints: ['Urutkan data dari yang terkecil.', 'Ada 5 data, jadi median adalah data ke-3.'],
        pembahasan: 'Data terurut: 7, 8, 9, 12, 15. Data ke-3 adalah 9, jadi median = 9 menit.',
      },
      {
        id: 'h2',
        tipe: 'hitung',
        jenis: 'median',
        konteks: 'olahraga',
        cerita: 'Waktu lari 60 meter 6 murid (detik): 24, 30, 26, 35, 28, 40.',
        data: [24, 30, 26, 35, 28, 40],
        satuan: 'detik',
        tanya: 'Median waktu lari = …',
        hints: [
          'Urutkan: 24, 26, 28, 30, 35, 40.',
          'Data genap: median = (data ke-3 + data ke-4) ÷ 2.',
        ],
        pembahasan: 'Data terurut: 24, 26, 28, 30, 35, 40. Median = (28 + 30) ÷ 2 = 29 detik.',
      },
      {
        id: 'h3',
        tipe: 'hitung',
        jenis: 'modus',
        konteks: 'usaha',
        cerita: 'Ukuran sepatu yang terjual di toko: 38, 39, 37, 38, 40, 38, 39.',
        data: [38, 39, 37, 38, 40, 38, 39],
        satuan: '',
        tanya: 'Modus ukuran sepatu = …',
        hints: [
          'Hitung berapa kali setiap ukuran muncul.',
          'Tulis UKURANNYA, bukan banyak kemunculannya.',
        ],
        pembahasan: 'Ukuran 38 muncul 3 kali, paling sering. Modus = 38.',
      },
      {
        id: 'h4',
        tipe: 'hitung',
        jenis: 'modus',
        konteks: 'rumah',
        cerita:
          'Banyak telur yang dihasilkan 8 ekor ayam Bu Ratna dalam seminggu: 3, 5, 2, 5, 4, 1, 5, 3.',
        data: [3, 5, 2, 5, 4, 1, 5, 3],
        satuan: 'butir',
        tanya: 'Modus banyak telur = …',
        hints: ['Hitung kemunculan setiap nilai.', 'Nilai 5 muncul 3 kali, nilai 3 muncul 2 kali.'],
        pembahasan: 'Nilai 5 muncul paling sering (3 kali). Modus = 5 butir.',
      },
      {
        id: 'h5',
        tipe: 'hitung',
        jenis: 'rerata',
        konteks: 'sekolah',
        cerita: 'Skor tugas 5 murid: 6, 8, 7, 9, 10.',
        data: [6, 8, 7, 9, 10],
        satuan: '',
        tanya: 'Mean skor tugas = …',
        hints: ['Jumlahkan kelima skor.', 'Jumlahnya 40, banyak datanya 5.'],
        pembahasan: 'Mean = (6 + 8 + 7 + 9 + 10) ÷ 5 = 40 ÷ 5 = 8.',
      },
      {
        id: 'h6',
        tipe: 'hitung',
        jenis: 'rerata',
        konteks: 'olahraga',
        cerita: 'Banyak gol tim futsal dalam 6 pertandingan: 5, 0, 4, 3, 1, 2.',
        data: [5, 0, 4, 3, 1, 2],
        satuan: 'gol',
        tanya: 'Mean banyak gol = …',
        hints: ['Pertandingan tanpa gol (0) tetap dihitung.', 'Jumlahnya 15, banyak datanya 6.'],
        pembahasan: 'Mean = 15 ÷ 6 = 2,5 gol per pertandingan.',
      },
      {
        id: 'p1',
        tipe: 'pilihUkuran',
        jenis: 'median',
        konteks: 'usaha',
        cerita: 'Harga 7 jenis kue di kantin (ribu rupiah): 15, 11, 14, 20, 12, 13, 40.',
        data: [15, 11, 14, 20, 12, 13, 40],
        satuan: 'ribu rupiah',
        tanya: 'Median harga kue adalah …',
        hints: ['Urutkan dulu harganya.', 'Ada 7 data, median adalah data ke-4.'],
        pembahasan:
          'Data terurut: 11, 12, 13, 14, 15, 20, 40. Median = data ke-4 = 14 ribu rupiah.',
      },
      {
        id: 'p2',
        tipe: 'pilihUkuran',
        jenis: 'modus',
        konteks: 'rumah',
        cerita: 'Banyak saudara kandung 8 murid: 2, 4, 4, 1, 3, 4, 2, 0.',
        data: [2, 4, 4, 1, 3, 4, 2, 0],
        satuan: 'orang',
        tanya: 'Modus banyak saudara kandung adalah …',
        hints: ['Nilai mana yang paling sering muncul?', 'Hitung kemunculan 2 dan 4.'],
        pembahasan: 'Nilai 4 muncul 3 kali, lebih sering dari 2 (2 kali). Modus = 4 orang.',
      },
      {
        id: 'p3',
        tipe: 'pilihUkuran',
        jenis: 'rerata',
        konteks: 'sekolah',
        cerita: 'Nilai ulangan 5 murid: 70, 85, 80, 90, 75.',
        data: [70, 85, 80, 90, 75],
        satuan: '',
        tanya: 'Mean nilai ulangan adalah …',
        hints: ['Jumlahkan kelima nilai.', 'Jumlahnya 400.'],
        pembahasan: 'Mean = 400 ÷ 5 = 80.',
      },
      {
        id: 'p4',
        tipe: 'pilihUkuran',
        jenis: 'median',
        konteks: 'olahraga',
        cerita: 'Banyak push-up 6 murid: 5, 9, 3, 7, 6, 8.',
        data: [5, 9, 3, 7, 6, 8],
        satuan: 'kali',
        tanya: 'Median banyak push-up adalah …',
        hints: ['Urutkan: 3, 5, 6, 7, 8, 9.', 'Data genap: rata-rata dua nilai tengah.'],
        pembahasan: 'Data terurut: 3, 5, 6, 7, 8, 9. Median = (6 + 7) ÷ 2 = 6,5 kali.',
      },
      {
        id: 'r1',
        tipe: 'hubungan',
        konteks: 'usaha',
        cerita: 'Lama 6 pembeli menunggu pesanan bakso (menit): 2, 3, 3, 3, 4, 15.',
        data: [2, 3, 3, 3, 4, 15],
        satuan: 'menit',
        tanya: 'Bagaimana hubungan mean dan median data ini?',
        hints: [
          'Adakah nilai yang sangat jauh dari yang lain? Di sisi mana?',
          'Hitung: mean = 30 ÷ 6, median = (3 + 3) ÷ 2.',
        ],
        pembahasan:
          'Mean = 30 ÷ 6 = 5, median = 3. Nilai 15 membentuk ekor kanan sehingga mean > median.',
      },
      {
        id: 'r2',
        tipe: 'hubungan',
        konteks: 'rumah',
        cerita: 'Lama tidur 5 anggota keluarga (jam): 9, 10, 10, 10, 11.',
        data: [9, 10, 10, 10, 11],
        satuan: 'jam',
        tanya: 'Bagaimana hubungan mean dan median data ini?',
        hints: ['Apakah data menyebar seimbang di sekitar 10?', 'Hitung mean: 50 ÷ 5.'],
        pembahasan:
          'Data simetris di sekitar 10: mean = 50 ÷ 5 = 10 dan median = 10. Mean = median.',
      },
      {
        id: 'r3',
        tipe: 'hubungan',
        konteks: 'sekolah',
        cerita:
          'Skor kuis 6 murid: 1, 8, 9, 9, 10, 11. Satu murid terlambat dan hanya sempat menjawab 1 soal.',
        data: [1, 8, 9, 9, 10, 11],
        satuan: '',
        tanya: 'Bagaimana hubungan mean dan median data ini?',
        hints: [
          'Nilai 1 sangat kecil dibanding yang lain.',
          'Hitung: mean = 48 ÷ 6, median = (9 + 9) ÷ 2.',
        ],
        pembahasan:
          'Mean = 48 ÷ 6 = 8, median = 9. Nilai 1 membentuk ekor kiri sehingga mean < median.',
      },
      {
        id: 'c1',
        tipe: 'pilih',
        konteks: 'usaha',
        cerita:
          'Pak Budi pemilik kios jus mencatat rasa yang dipesan pembeli hari ini: alpukat, mangga, jeruk, mangga, alpukat, mangga, jambu.',
        tanya: 'Untuk menentukan rasa yang paling laku, Pak Budi memakai …',
        opsi: [
          { id: 'modus', label: 'modus, karena datanya berupa pilihan rasa' },
          { id: 'mean', label: 'mean, karena memakai semua data' },
          { id: 'median', label: 'median, karena di tengah' },
          { id: 'tidakBisa', label: 'tidak ada ukuran yang bisa dipakai' },
        ],
        correct: 'modus',
        umpan: {
          modus:
            'Tepat! Mangga muncul 3 kali. Untuk data kategori, hanya modus yang dapat ditentukan.',
          mean: 'Rasa jus bukan bilangan, jadi tidak bisa dijumlah dan dibagi.',
          median:
            'Rasa jus tidak bisa diurutkan dari kecil ke besar, jadi tidak ada nilai tengahnya.',
          tidakBisa: 'Modus tetap dapat ditentukan pada data kategori.',
        },
        hints: [
          'Data rasa jus bukan bilangan.',
          'Ukuran mana yang hanya perlu menghitung kemunculan?',
        ],
        pembahasan:
          'Data kategori (rasa) tidak bisa dijumlah atau diurutkan, sehingga dipakai modus: mangga (3 kali).',
      },
      {
        id: 'c2',
        tipe: 'pilih',
        konteks: 'rumah',
        cerita:
          'Harga 5 rumah di satu perumahan (juta rupiah): 300, 320, 350, 340, 2.500. Agen ingin menyebut harga rumah yang umum.',
        tanya: 'Ukuran mana yang paling mewakili?',
        opsi: [
          { id: 'median', label: 'Median, yaitu 340 juta' },
          { id: 'mean', label: 'Mean, yaitu 762 juta' },
          { id: 'maks', label: 'Harga tertinggi, yaitu 2.500 juta' },
          { id: 'min', label: 'Harga terendah, yaitu 300 juta' },
        ],
        correct: 'median',
        umpan: {
          median:
            'Benar! Satu rumah 2.500 juta menarik mean jauh ke atas. Median 340 juta lebih mewakili.',
          mean: 'Mean 762 juta lebih mahal dari empat rumah lainnya — tertarik oleh satu rumah mewah.',
          maks: 'Harga tertinggi hanya mewakili satu rumah.',
          min: 'Harga terendah hanya mewakili satu rumah.',
        },
        hints: [
          'Adakah harga yang sangat jauh dari yang lain?',
          'Ukuran mana yang tahan pencilan?',
        ],
        pembahasan:
          'Ada pencilan 2.500 juta. Mean = 3.810 ÷ 5 = 762 juta tidak mewakili; median data terurut 300, 320, 340, 350, 2.500 adalah 340 juta.',
      },
      {
        id: 'c3',
        tipe: 'pilih',
        konteks: 'konsep',
        cerita: 'Pada ulangan Matematika, mean nilai kelas 70 sedangkan mediannya 78.',
        tanya: 'Apa yang kemungkinan terjadi pada data nilai itu?',
        opsi: [
          { id: 'rendah', label: 'Ada beberapa nilai yang sangat rendah' },
          { id: 'tinggi', label: 'Ada beberapa nilai yang sangat tinggi' },
          { id: 'simetris', label: 'Datanya simetris' },
          { id: 'salah', label: 'Perhitungannya pasti salah' },
        ],
        correct: 'rendah',
        umpan: {
          rendah:
            'Tepat! Mean < median menandakan ekor kiri: ada nilai sangat rendah yang menarik mean ke bawah.',
          tinggi: 'Nilai sangat tinggi justru membuat mean > median.',
          simetris: 'Pada data simetris, mean = median.',
          salah: 'Mean dan median memang boleh berbeda.',
        },
        hints: ['Mean lebih kecil dari median.', 'Nilai ekstrem menarik mean ke arahnya.'],
        pembahasan:
          'Mean (70) < median (78) berarti mean tertarik ke bawah oleh nilai-nilai yang sangat rendah (ekor kiri).',
      },
      {
        id: 'c4',
        tipe: 'pilih',
        konteks: 'konsep',
        cerita: 'Data skor 7 murid: 4, 5, 6, 6, 6, 7, 8. Lalu skor tertinggi 8 diganti menjadi 30.',
        tanya: 'Ukuran mana yang berubah?',
        opsi: [
          { id: 'mean', label: 'Hanya mean' },
          { id: 'median', label: 'Hanya median' },
          { id: 'modus', label: 'Hanya modus' },
          { id: 'semua', label: 'Mean, median, dan modus' },
        ],
        correct: 'mean',
        umpan: {
          mean: 'Benar! Mean naik dari 6 menjadi 64 ÷ 7 ≈ 9,14, sedangkan median dan modus tetap 6.',
          median: 'Nilai tengah (data ke-4) tetap 6 karena skor 30 tetap berada di ujung kanan.',
          modus: 'Nilai 6 tetap paling sering muncul.',
          semua: 'Ingat Misi 4: median dan modus tahan terhadap perubahan nilai ekstrem.',
        },
        hints: ['Ingat Misi 4 di lab.', 'Apakah letak tengah dan nilai tersering ikut berubah?'],
        pembahasan:
          'Hanya mean yang berubah (6 → ≈ 9,14). Median tetap 6 (data ke-4) dan modus tetap 6.',
      },
      {
        id: 'c5',
        tipe: 'pilih',
        konteks: 'konsep',
        cerita: 'Data banyak buku yang dibaca 5 murid: 4, 6, 6, 6, 8.',
        tanya: 'Pernyataan yang benar adalah …',
        opsi: [
          { id: 'sama', label: 'Mean, median, dan modus semuanya 6' },
          { id: 'meanBesar', label: 'Mean lebih besar dari median' },
          { id: 'modusBesar', label: 'Modus lebih besar dari mean' },
          { id: 'tanpaModus', label: 'Data ini tidak memiliki modus' },
        ],
        correct: 'sama',
        umpan: {
          sama: 'Tepat! Data simetris di sekitar 6: mean = 30 ÷ 5 = 6, median 6, modus 6.',
          meanBesar: 'Mean = 30 ÷ 5 = 6, sama dengan median.',
          modusBesar: 'Modus 6 sama dengan mean 6.',
          tanpaModus: 'Nilai 6 muncul 3 kali, jadi modusnya 6.',
        },
        hints: ['Apakah data seimbang di kiri dan kanan 6?', 'Hitung mean: 30 ÷ 5.'],
        pembahasan: 'Data simetris: mean = 30 ÷ 5 = 6, median = 6, modus = 6.',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 9 · Refleksi',
    syntax: 'Penutup',
    goal: 'Merenungkan apa yang ditemukan dan seberapa yakin kamu sekarang.',
    guru: 'Bacakan beberapa jawaban refleksi (tanpa nama) dan luruskan bila masih ada yang menganggap mean selalu ukuran terbaik.',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Dengan kata-katamu sendiri, mengapa mean bisa jauh lebih besar dari median?',
        placeholder: 'Mean bisa lebih besar karena …',
      },
      {
        id: 'r2',
        teks: 'Ceritakan satu situasi di sekitarmu yang lebih tepat diwakili median atau modus daripada mean.',
        placeholder: 'Misalnya …',
      },
      {
        id: 'r3',
        teks: 'Bagian mana yang masih membingungkan, dan apa yang akan kamu lakukan?',
        placeholder: 'Aku masih bingung tentang … , jadi aku akan …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menganalisis hubungan mean, median, dan modus sekarang?',
    diriOpsi: [
      { id: 'sangat', label: '😄 Sangat yakin, bisa menjelaskan ke teman' },
      { id: 'yakin', label: '🙂 Yakin' },
      { id: 'ragu', label: '😐 Masih ragu di beberapa bagian' },
      { id: 'belum', label: '😟 Belum yakin, perlu belajar lagi' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, penyelidikanmu tuntas!',
    teks: 'Kamu sudah menemukan sendiri bagaimana mean, median, dan modus saling berhubungan — dan kapan masing-masing paling jujur mewakili data.',
    capaian: [
      'Menentukan mean, median (termasuk data genap), dan modus data tunggal.',
      'Menemukan bahwa data simetris memiliki mean = median = modus.',
      'Menjelaskan bahwa nilai ekstrem menarik mean: ekor kanan → mean > median, ekor kiri → mean < median.',
      'Membandingkan kepekaan mean, median, dan modus terhadap pencilan.',
      'Memilih ukuran pemusatan yang paling mewakili pada masalah kontekstual beserta alasannya.',
    ],
  },
};
