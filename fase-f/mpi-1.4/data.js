'use strict';

/* ============================================================
   data.js — Konten pembelajaran
   Matematika: Penerapan Barisan & Deret Aritmetika pada
   Bunga Tunggal Transaksi Simpan Pinjam
   Fase F — SMK Rekayasa Perangkat Lunak

   Dirangkai dengan sintaks Problem-Based Learning (PBL):
     Fase 1 Orientasi pada masalah      -> tahap 'orientasi'
     Fase 2 Mengorganisasi penyelidikan -> tahap 'organisasi'
     Fase 3 Membimbing penyelidikan     -> tahap 'selidikSimpan',
                                           'selidikFlat', 'selidikMenurun'
     Fase 4 Mengembangkan & menyajikan  -> tahap 'simulator'
     Fase 5 Menganalisis & mengevaluasi -> tahap 'evaluasi', 'refleksi'
   ============================================================ */

var DATA = {
  meta: {
    title: 'Bunga Tunggal pada Transaksi Simpan Pinjam',
    subject: 'Matematika — Fase F (SMK RPL)',
    goal: 'Saya dapat menerapkan rumus barisan dan deret aritmetika untuk memecahkan masalah kontekstual bunga tunggal pada transaksi simpan pinjam secara tepat.',
  },

  /* ----------------------------------------------------------
     TAHAP 1 — PBL FASE 1: ORIENTASI PADA MASALAH
     ---------------------------------------------------------- */
  masalah: {
    title: 'Masalah: Skema Pinjaman Mana yang Dipilih Bu Mira?',
    skenario:
      'Tim Rekayasa Perangkat Lunak di sekolahmu dipercaya membangun aplikasi <strong>KopSis Digital</strong> untuk koperasi sekolah. Fitur yang paling ditunggu pengurus adalah <strong>simulator simpan pinjam</strong>: anggota bisa melihat sendiri berapa yang harus dibayar sebelum menandatangani perjanjian.',
    klien:
      '<strong>Bu Mira</strong>, pedagang kantin sekaligus anggota koperasi, ingin meminjam <strong>Rp 6.000.000</strong> untuk membeli etalase baru dan akan melunasinya dalam <strong>12 bulan</strong>. Pengurus koperasi menyodorkan brosur berisi dua skema bunga tunggal. Bu Mira bingung — dan pengurus pun belum bisa menjelaskan perhitungannya.',
    pokok: 6000000,
    tenor: 12,
    skema: [
      {
        id: 'flat',
        kode: 'A',
        nama: 'Skema A — Bunga Flat',
        rate: 1.5,
        dasar: 'pokok awal pinjaman',
        poin: [
          'Bunga <strong>1,5% per bulan</strong> dihitung dari <strong>pokok awal</strong> (Rp 6.000.000) — nilainya sama terus setiap bulan.',
          'Angsuran per bulan <strong>tetap</strong>, mudah diingat anggota.',
        ],
      },
      {
        id: 'menurun',
        kode: 'B',
        nama: 'Skema B — Bunga Menurun',
        rate: 2,
        dasar: 'sisa pokok setiap bulan',
        poin: [
          'Bunga <strong>2% per bulan</strong> dihitung dari <strong>sisa pokok</strong> yang belum dilunasi.',
          'Pokok dicicil tetap Rp 500.000 per bulan, sehingga bunganya <strong>menyusut</strong> tiap bulan.',
        ],
      },
    ],
    pertanyaanPemantik: [
      'Skema mana yang membuat Bu Mira membayar <strong>paling sedikit</strong> secara total?',
      'Bagaimana pola pembayaran kedua skema itu dirumuskan agar bisa <strong>dikodekan</strong> menjadi fitur aplikasi?',
    ],
    prediksi: {
      pertanyaan:
        'Sebelum menghitung apa pun, <strong>apa dugaanmu?</strong> Skema mana yang total pembayarannya lebih kecil?',
      catatan:
        'Dugaan ini akan dibuka kembali di tahap Refleksi. Salah pun tidak apa-apa — yang penting kamu sadar bagaimana pemikiranmu berubah.',
      opsi: [
        { id: 'pred_a', label: 'Skema A — bunganya lebih kecil (1,5% &lt; 2%), pasti lebih murah' },
        { id: 'pred_b', label: 'Skema B — walau bunganya 2%, dasar perhitungannya menyusut' },
        { id: 'pred_c', label: 'Kurang lebih sama saja, selisihnya tidak berarti' },
      ],
      alasanPlaceholder: 'Tuliskan alasan dugaanmu dalam satu atau dua kalimat...',
    },
    panduanGuru: {
      judul: 'Panduan Guru — Rangkaian Aktivitas PBL',
      ringkas:
        'Media ini dirangkai mengikuti lima sintaks Problem-Based Learning. Tabel berikut memetakan tahap media, aktivitas peserta didik, dan peran guru. Estimasi total 2 × 45 menit.',
      baris: [
        {
          fase: 'Fase 1 — Orientasi pada masalah',
          tahap: 'Tahap 1 · Masalah',
          menit: 10,
          siswa:
            'Membaca skenario KopSis Digital dan brosur dua skema, lalu menuliskan prediksi awal beserta alasannya.',
          guru: 'Membacakan skenario, memancing dengan pertanyaan pemantik, tidak membenarkan atau menyalahkan prediksi.',
        },
        {
          fase: 'Fase 2 — Mengorganisasi peserta didik',
          tahap: 'Tahap 2 · Rencana',
          menit: 10,
          siswa:
            'Membedah masalah menjadi diketahui–ditanya–rencana, mengekstrak data dari brosur, dan memilih peran dalam tim RPL.',
          guru: 'Membentuk kelompok 3–4 orang, memastikan setiap anggota memegang peran, mengecek data hasil ekstraksi.',
        },
        {
          fase: 'Fase 3 — Membimbing penyelidikan',
          tahap: 'Tahap 3–5 · Simpan, Skema A, Skema B',
          menit: 35,
          siswa:
            'Mengungkap tabel bulan demi bulan, menemukan beda (b), merumuskan Uₙ, lalu menghitung total dengan Sₙ.',
          guru: 'Berkeliling antar kelompok, mengajukan pertanyaan pelacak ("apa yang tetap? apa yang berubah?"), membiarkan media memberi petunjuk berjenjang.',
        },
        {
          fase: 'Fase 4 — Mengembangkan & menyajikan karya',
          tahap: 'Tahap 6 · Simulator',
          menit: 20,
          siswa:
            'Menguji Simulator Kredit KopSis dengan berbagai nilai, lalu menulis rekomendasi tertulis untuk Bu Mira.',
          guru: 'Meminta 2–3 kelompok mempresentasikan rekomendasi beserta bukti hitungnya di depan kelas.',
        },
        {
          fase: 'Fase 5 — Menganalisis & mengevaluasi',
          tahap: 'Tahap 7–9 · Uji Terap, Refleksi, Selesai',
          menit: 25,
          siswa:
            'Menyelesaikan enam soal penerapan, membandingkan prediksi awal dengan temuan, dan menyimpulkan.',
          guru: 'Memimpin diskusi konfirmasi, menegaskan bahwa besar persen bunga tidak bermakna tanpa dasar perhitungannya.',
        },
      ],
      catatan:
        'Media ini adalah alat bantu penyelidikan, bukan pengganti diskusi kelompok. Asesmen formatif tetap dilakukan guru melalui pengamatan proses dan presentasi hasil karya.',
    },
  },

  /* ----------------------------------------------------------
     TAHAP 2 — PBL FASE 2: MENGORGANISASI PENYELIDIKAN
     ---------------------------------------------------------- */
  organisasi: {
    title: 'Menyusun Rencana Penyelidikan',
    instruction:
      'Sebelum menghitung, tim yang baik membedah dulu masalahnya. Lengkapi kartu analisis, ekstrak data dari brosur, lalu pilih peranmu di dalam tim.',
    kartu: [
      {
        id: 'diketahui',
        ikon: '📋',
        judul: 'Yang Diketahui',
        isi: [
          'Pokok pinjaman M₀ = Rp 6.000.000',
          'Lama pinjaman n = 12 bulan',
          'Skema A: bunga 1,5%/bulan dari pokok awal',
          'Skema B: bunga 2%/bulan dari sisa pokok',
        ],
      },
      {
        id: 'ditanya',
        ikon: '❓',
        judul: 'Yang Ditanyakan',
        isi: [
          'Total pembayaran masing-masing skema',
          'Skema mana yang lebih ringan bagi Bu Mira',
          'Rumus umum agar bisa dikodekan ke aplikasi',
        ],
      },
      {
        id: 'rencana',
        ikon: '🧭',
        judul: 'Rencana Penyelidikan',
        isi: [
          'Susun nilai tiap bulan menjadi sebuah barisan',
          'Cari beda (b) — apakah tetap?',
          'Rumuskan Uₙ, lalu jumlahkan dengan Sₙ',
          'Bandingkan hasil kedua skema',
        ],
      },
    ],
    ekstraksi: {
      judul: 'Ekstraksi Data dari Brosur',
      instruction:
        'Isi keempat kotak berikut berdasarkan brosur di tahap sebelumnya. Inilah variabel yang nanti menjadi parameter fungsi di aplikasimu.',
      soal: [
        {
          id: 'x_m0',
          label: 'Pokok pinjaman M₀ (rupiah)',
          placeholder: 'mis. 1000000',
          answer: 6000000,
          hint: 'Tertulis pada kalimat pertama skenario Bu Mira.',
        },
        {
          id: 'x_n',
          label: 'Lama pinjaman n (bulan)',
          placeholder: 'mis. 10',
          answer: 12,
          hint: 'Bu Mira akan melunasi dalam berapa bulan?',
        },
        {
          id: 'x_ia',
          label: 'Bunga Skema A per bulan (%, tanpa tanda %)',
          placeholder: 'mis. 3',
          answer: 1.5,
          decimal: true,
          hint: 'Skema A memakai 1,5% per bulan. Tulis dengan titik: 1.5',
        },
        {
          id: 'x_ib',
          label: 'Bunga Skema B per bulan (%, tanpa tanda %)',
          placeholder: 'mis. 3',
          answer: 2,
          decimal: true,
          hint: 'Skema B memakai 2% per bulan dari sisa pokok.',
        },
      ],
    },
    peran: {
      judul: 'Pilih Peranmu dalam Tim RPL',
      instruction: 'Pilih minimal satu peran. Dalam kerja kelompok, peran ini dibagi habis.',
      opsi: [
        {
          id: 'analis',
          ikon: '🔍',
          nama: 'Analis Data',
          desc: 'Menyusun tabel bulanan dan memastikan polanya benar.',
        },
        {
          id: 'perumus',
          ikon: '✏️',
          nama: 'Perumus',
          desc: 'Menerjemahkan pola menjadi rumus Uₙ dan Sₙ.',
        },
        {
          id: 'penguji',
          ikon: '🧪',
          nama: 'Penguji',
          desc: 'Mengecek ulang hitungan dengan nilai yang berbeda.',
        },
        {
          id: 'penyaji',
          ikon: '🗣️',
          nama: 'Penyaji',
          desc: 'Menyusun rekomendasi dan mempresentasikannya.',
        },
      ],
    },
  },

  /* ----------------------------------------------------------
     TAHAP 3–5 — PBL FASE 3: MEMBIMBING PENYELIDIKAN

     Ketiga tahap memakai satu perender yang sama
     (renderPenyelidikan di app.js). Setiap tahap punya satu
     atau lebih `kasus`; tiap kasus punya tabel yang diungkap
     baris demi baris, langkah berpandu, dan kotak rumus.
     ---------------------------------------------------------- */
  penyelidikan: {
    /* ---------- TAHAP 3: sisi SIMPAN ---------- */
    simpan: {
      kicker: 'TAHAP 3 · PBL FASE 3 — PENYELIDIKAN SISI SIMPAN',
      title: 'Penyelidikan 1 — Sisi Simpanan',
      goal: 'Menerapkan rumus barisan dan deret aritmetika pada pertumbuhan simpanan berbunga tunggal.',
      instruction:
        'Sebelum menggarap sisi pinjaman, selidiki dulu sisi simpanan — polanya lebih sederhana dan menjadi bekal untuk tahap berikutnya.',
      kasus: [
        {
          id: 'simpanan_berjangka',
          tab: 'Simpanan Berjangka',
          badge: 'Barisan Aritmetika',
          ikon: '🏦',
          story:
            'Bu Mira juga punya <strong>simpanan berjangka Rp 2.000.000</strong> di koperasi. Koperasi memberi <strong>bunga tunggal 0,75% per bulan</strong> yang selalu dihitung dari setoran awal, lalu dicatat menambah saldo.',
          table: {
            head: ['Bulan ke-n', 'Perhitungan', 'Saldo (Rp)'],
            rows: [
              ['0', 'M₀', '2.000.000'],
              ['1', 'M₀ + 1 × 15.000', '2.015.000'],
              ['2', 'M₀ + 2 × 15.000', '2.030.000'],
              ['3', 'M₀ + 3 × 15.000', '2.045.000'],
              ['4', 'M₀ + 4 × 15.000', '2.060.000'],
              ['5', 'M₀ + 5 × 15.000', '2.075.000'],
            ],
            highlight: 2,
            revealLabel: 'Ungkap Bulan Berikutnya',
            note: 'Perhatikan kolom saldo: berapa pertambahannya setiap bulan?',
          },
          steps: [
            {
              id: 'sb_1',
              question:
                'Berapa rupiah bunga yang ditambahkan <strong>setiap bulan</strong>? Inilah beda (b) dari barisan saldo.',
              answer: 15000,
              unit: 'rupiah',
              hint: 'b = M₀ × i = 2.000.000 × 0,75% = 2.000.000 × 0,0075',
              explanation:
                'b = 2.000.000 × 0,0075 = <strong>Rp 15.000</strong>. Karena bunga tunggal selalu dihitung dari setoran awal, pertambahannya <em>tetap</em> — inilah ciri barisan aritmetika.',
            },
            {
              id: 'sb_2',
              question: 'Berapa saldo simpanan Bu Mira setelah <strong>12 bulan</strong> (M₁₂)?',
              answer: 2180000,
              unit: 'rupiah',
              hint: 'M₁₂ = M₀ + 12 × b = 2.000.000 + 12 × 15.000',
              explanation:
                'M₁₂ = 2.000.000 + 12 × 15.000 = 2.000.000 + 180.000 = <strong>Rp 2.180.000</strong>. Sama saja dengan M₀(1 + n·i) = 2.000.000 × (1 + 12 × 0,0075) = 2.000.000 × 1,09.',
            },
          ],
          formula: {
            variant: 'simpan',
            label: 'Rumus Saldo Bunga Tunggal',
            expr: 'Mₙ = M₀ + n · b = M₀ (1 + n · i)',
            note: 'Bentuk Uₙ = a + n·b dengan a = M₀ dan b = M₀ · i',
          },
          koneksi: {
            penjelasan:
              'Barisan saldo M₀, M₁, M₂, … adalah <strong>barisan aritmetika</strong> karena:',
            poin: [
              'Suku pertama <strong>a = M₀</strong> (setoran awal)',
              'Beda <strong>b = M₀ × i</strong> — tetap, sebab dasar perhitungannya tidak pernah berubah',
              'Sehingga <strong>Mₙ = M₀ + n·b</strong>, persis rumus suku ke-n barisan aritmetika',
            ],
          },
        },
        {
          id: 'setoran_rutin',
          tab: 'Tabungan Setoran Rutin',
          badge: 'Deret Aritmetika',
          ikon: '🐷',
          story:
            'Rina, anak Bu Mira, ikut program tabungan pelajar: menyetor <strong>Rp 100.000 tiap awal bulan selama 6 bulan</strong>. Koperasi memberi <strong>bunga tunggal 1% per bulan</strong>, dihitung untuk setiap setoran <em>sejak bulan setoran itu masuk</em>. Setoran yang lebih awal mengendap lebih lama, jadi bunganya lebih besar.',
          table: {
            head: ['Setoran bulan ke-k', 'Lama mengendap', 'Bunga setoran (Rp)'],
            rows: [
              ['1', '6 bulan', '6.000'],
              ['2', '5 bulan', '5.000'],
              ['3', '4 bulan', '4.000'],
              ['4', '3 bulan', '3.000'],
              ['5', '2 bulan', '2.000'],
              ['6', '1 bulan', '1.000'],
            ],
            highlight: 2,
            revealLabel: 'Ungkap Setoran Berikutnya',
            note: 'Bunga tiap setoran membentuk barisan yang menurun tetap. Yang ditanyakan adalah JUMLAH seluruhnya — maka kita butuh deret.',
          },
          steps: [
            {
              id: 'sr_1',
              question:
                'Berapa bunga yang diperoleh dari <strong>setoran bulan ke-1</strong> (U₁)?',
              answer: 6000,
              unit: 'rupiah',
              hint: 'Setoran Rp 100.000 mengendap 6 bulan dengan bunga 1% per bulan: 100.000 × 1% × 6.',
              explanation:
                'U₁ = 100.000 × 0,01 × 6 = <strong>Rp 6.000</strong>. Setoran berikutnya mengendap satu bulan lebih singkat, sehingga bunganya turun Rp 1.000 — beda b = −1.000.',
            },
            {
              id: 'sr_2',
              question:
                'Berapa <strong>total bunga</strong> dari keenam setoran (S₆)? Gunakan rumus deret aritmetika.',
              answer: 21000,
              unit: 'rupiah',
              hint: 'S₆ = (6/2) × (U₁ + U₆) = 3 × (6.000 + 1.000)',
              explanation:
                'S₆ = (6/2) × (6.000 + 1.000) = 3 × 7.000 = <strong>Rp 21.000</strong>. Di sinilah deret aritmetika terpakai: menjumlahkan bunga yang besarnya berbeda tiap setoran.',
            },
            {
              id: 'sr_3',
              question: 'Berapa <strong>saldo akhir</strong> tabungan Rina setelah 6 bulan?',
              answer: 621000,
              unit: 'rupiah',
              hint: 'Saldo = total setoran + total bunga = (6 × 100.000) + 21.000',
              explanation:
                'Saldo = 600.000 + 21.000 = <strong>Rp 621.000</strong>. Total setoran dihitung biasa, total bunganya lewat deret aritmetika.',
            },
          ],
          formula: {
            variant: 'simpan',
            label: 'Rumus Jumlah n Suku Pertama',
            expr: 'Sₙ = (n / 2) · (U₁ + Uₙ)',
            note: 'Dipakai saat yang ditanya adalah TOTAL dari nilai-nilai yang berubah tetap',
          },
          koneksi: {
            penjelasan: 'Kapan memakai Uₙ dan kapan memakai Sₙ?',
            poin: [
              '<strong>Uₙ</strong> — saat ditanya nilai pada <em>satu</em> periode tertentu (saldo bulan ke-n, bunga bulan ke-n)',
              '<strong>Sₙ</strong> — saat ditanya <em>akumulasi</em> sepanjang n periode (total bunga, total pembayaran)',
              'Syaratnya sama: selisih antar suku harus tetap',
            ],
          },
        },
      ],
    },

    /* ---------- TAHAP 4: Skema A (bunga flat) ---------- */
    flat: {
      kicker: 'TAHAP 4 · PBL FASE 3 — PENYELIDIKAN SKEMA A',
      title: 'Penyelidikan 2 — Skema A: Bunga Flat',
      goal: 'Menerapkan rumus barisan aritmetika untuk menghitung total utang dan angsuran pada bunga flat.',
      instruction:
        'Selidiki skema yang ditawarkan pertama: bunga 1,5% per bulan yang selalu dihitung dari pokok awal Rp 6.000.000.',
      kasus: [
        {
          id: 'skema_flat',
          tab: 'Skema A',
          badge: 'Bunga Flat 1,5%/bulan',
          ikon: '📐',
          story:
            'Pada <strong>Skema A</strong>, bunga dihitung <strong>1,5% dari pokok awal Rp 6.000.000</strong> setiap bulan — tidak peduli sudah berapa banyak yang Bu Mira lunasi. Total utang bertambah dengan nilai yang selalu sama.',
          table: {
            head: ['Bulan ke-n', 'Perhitungan total utang', 'Total Utang (Rp)'],
            rows: [
              ['0', 'M₀', '6.000.000'],
              ['1', 'M₀ + 1 × 90.000', '6.090.000'],
              ['2', 'M₀ + 2 × 90.000', '6.180.000'],
              ['3', 'M₀ + 3 × 90.000', '6.270.000'],
              ['4', 'M₀ + 4 × 90.000', '6.360.000'],
              ['5', 'M₀ + 5 × 90.000', '6.450.000'],
            ],
            highlight: 2,
            revealLabel: 'Ungkap Bulan Berikutnya',
            note: 'Pola berlanjut dengan cara yang sama sampai bulan ke-12.',
          },
          steps: [
            {
              id: 'fl_1',
              question:
                'Berapa besar <strong>bunga per bulan</strong> pada Skema A? Nilai ini menjadi beda (b).',
              answer: 90000,
              unit: 'rupiah',
              hint: 'b = M₀ × i = 6.000.000 × 1,5% = 6.000.000 × 0,015',
              explanation:
                'b = 6.000.000 × 0,015 = <strong>Rp 90.000 per bulan</strong>, tetap selama 12 bulan karena dasarnya selalu pokok awal.',
            },
            {
              id: 'fl_2',
              question: 'Berapa <strong>total utang</strong> Bu Mira setelah 12 bulan (M₁₂)?',
              answer: 7080000,
              unit: 'rupiah',
              hint: 'M₁₂ = M₀ + 12 × b = 6.000.000 + 12 × 90.000. Atau M₀(1 + n·i) = 6.000.000 × (1 + 12 × 0,015).',
              explanation:
                'M₁₂ = 6.000.000 + 12 × 90.000 = 6.000.000 + 1.080.000 = <strong>Rp 7.080.000</strong>. Total bunganya Rp 1.080.000.',
            },
            {
              id: 'fl_3',
              question:
                'Berapa <strong>angsuran tetap per bulan</strong> yang harus dibayar Bu Mira?',
              answer: 590000,
              unit: 'rupiah',
              hint: 'Angsuran = total utang ÷ lama pinjaman = 7.080.000 ÷ 12',
              explanation:
                'Angsuran = 7.080.000 ÷ 12 = <strong>Rp 590.000 per bulan</strong>, sama besar setiap bulan. Inilah yang membuat Skema A terasa "mudah dicicil".',
            },
          ],
          formula: {
            variant: 'flat',
            label: 'Skema A — Bunga Flat',
            expr: 'Mₙ = M₀ (1 + n · i)  dan  angsuran = Mₙ / n',
            note: 'Barisan aritmetika: a = M₀, b = M₀ · i (tetap)',
          },
          koneksi: {
            penjelasan: 'Catatan penting sebelum lanjut:',
            poin: [
              'Total bunga = n × (M₀ · i) = 12 × 90.000 = <strong>Rp 1.080.000</strong>',
              'Karena bunga tiap bulan sama, deretnya sederhana — cukup perkalian',
              'Persentase 1,5% terlihat kecil, tetapi <em>dasarnya tidak pernah menyusut</em>. Ingat ini saat membandingkan dengan Skema B.',
            ],
          },
        },
      ],
    },

    /* ---------- TAHAP 5: Skema B (bunga menurun) ---------- */
    menurun: {
      kicker: 'TAHAP 5 · PBL FASE 3 — PENYELIDIKAN SKEMA B',
      title: 'Penyelidikan 3 — Skema B: Bunga Menurun',
      goal: 'Menerapkan rumus barisan dan deret aritmetika untuk menghitung total bunga pada bunga menurun.',
      instruction:
        'Sekarang skema kedua. Pokoknya dicicil tetap Rp 500.000 per bulan, dan bunga 2% dihitung dari sisa pokok yang belum lunas.',
      kasus: [
        {
          id: 'skema_menurun',
          tab: 'Skema B',
          badge: 'Bunga Menurun 2%/bulan',
          ikon: '📉',
          story:
            'Pada <strong>Skema B</strong>, Bu Mira mencicil pokok <strong>Rp 500.000 per bulan</strong> (6.000.000 ÷ 12). Bunga <strong>2%</strong> dihitung dari <strong>sisa pokok</strong> di awal bulan tersebut. Karena sisa pokok menyusut Rp 500.000 tiap bulan, bunganya ikut menyusut.',
          table: {
            head: ['Bulan ke-k', 'Sisa Pokok (Rp)', 'Bunga 2% (Rp)', 'Angsuran (Rp)'],
            rows: [
              ['1', '6.000.000', '120.000', '620.000'],
              ['2', '5.500.000', '110.000', '610.000'],
              ['3', '5.000.000', '100.000', '600.000'],
              ['4', '4.500.000', '90.000', '590.000'],
              ['5', '4.000.000', '80.000', '580.000'],
              ['6', '3.500.000', '70.000', '570.000'],
            ],
            highlight: 2,
            revealLabel: 'Ungkap Bulan Berikutnya',
            note: 'Pola ini berlanjut sampai bulan ke-12, ketika sisa pokok tinggal Rp 500.000.',
          },
          steps: [
            {
              id: 'mn_1',
              question:
                'Lanjutkan pola kolom bunga. Berapa bunga pada <strong>bulan ke-7</strong> (U₇)?',
              answer: 60000,
              unit: 'rupiah',
              hint: 'U₇ = U₁ + (7 − 1) × b, dengan U₁ = 120.000 dan b = −10.000.',
              explanation:
                'U₇ = 120.000 + 6 × (−10.000) = 120.000 − 60.000 = <strong>Rp 60.000</strong>. Bunga turun tetap Rp 10.000 tiap bulan, yaitu 2% × Rp 500.000 (besar cicilan pokok).',
            },
            {
              id: 'mn_2',
              question: 'Berapa bunga pada bulan terakhir, <strong>bulan ke-12</strong> (U₁₂)?',
              answer: 10000,
              unit: 'rupiah',
              hint: 'U₁₂ = 120.000 + 11 × (−10.000). Cek juga langsung: 2% × sisa pokok terakhir Rp 500.000.',
              explanation:
                'U₁₂ = 120.000 − 110.000 = <strong>Rp 10.000</strong>, sama dengan 2% × Rp 500.000 — sisa pokok di bulan terakhir.',
            },
            {
              id: 'mn_3',
              question: 'Berapa <strong>total bunga</strong> yang dibayar selama 12 bulan (S₁₂)?',
              answer: 780000,
              unit: 'rupiah',
              hint: 'S₁₂ = (12/2) × (U₁ + U₁₂) = 6 × (120.000 + 10.000)',
              explanation:
                'S₁₂ = 6 × 130.000 = <strong>Rp 780.000</strong>. Inilah inti penerapan deret aritmetika pada masalah pinjaman: bunga tiap bulan berbeda, tetapi berubah tetap, sehingga bisa dijumlahkan dengan Sₙ.',
            },
            {
              id: 'mn_4',
              question: 'Berapa <strong>total yang harus dibayar</strong> Bu Mira pada Skema B?',
              answer: 6780000,
              unit: 'rupiah',
              hint: 'Total bayar = pokok + total bunga = 6.000.000 + 780.000',
              explanation:
                'Total = 6.000.000 + 780.000 = <strong>Rp 6.780.000</strong>. Bandingkan dengan Skema A: Rp 7.080.000. Skema B lebih murah <strong>Rp 300.000</strong> — padahal persen bunganya lebih besar!',
            },
          ],
          formula: {
            variant: 'menurun',
            label: 'Skema B — Bunga Menurun',
            expr: 'Uₖ = U₁ + (k − 1) · b  dan  Sₙ = (n / 2) · (U₁ + Uₙ)',
            note: 'U₁ = M₀ · i, b = −(M₀/n) · i, total bayar = M₀ + Sₙ',
          },
          koneksi: {
            penjelasan: 'Temuan yang menjawab masalah Bu Mira:',
            poin: [
              'Skema A total <strong>Rp 7.080.000</strong>, Skema B total <strong>Rp 6.780.000</strong> — selisih <strong>Rp 300.000</strong>',
              'Persen bunga yang lebih besar <em>tidak otomatis</em> lebih mahal. Yang menentukan adalah <strong>dasar perhitungannya</strong>: pokok awal (tetap) atau sisa pokok (menyusut).',
              'Versi ringkas total bunga Skema B: Sₙ = M₀ · i · (n + 1) / 2 — rumus inilah yang nanti dikodekan ke aplikasi',
            ],
          },
        },
      ],
    },
  },

  /* ----------------------------------------------------------
     TAHAP 6 — PBL FASE 4: MENGEMBANGKAN & MENYAJIKAN KARYA
     ---------------------------------------------------------- */
  simulator: {
    kicker: 'TAHAP 6 · PBL FASE 4 — MENGEMBANGKAN & MENYAJIKAN HASIL KARYA',
    title: 'Simulator Kredit KopSis',
    goal: 'Menyajikan solusi masalah dalam bentuk purwarupa fitur aplikasi dan rekomendasi tertulis.',
    instruction:
      'Inilah purwarupa fitur yang akan kamu kodekan. Ubah nilainya, amati bagaimana kedua skema bereaksi, lalu tulis rekomendasi untuk Bu Mira.',
    defaults: { m0: '6000000', n: '12', iA: '1.5', iB: '2' },
    batas: {
      m0: {
        min: 100000,
        max: 500000000,
        pesan: 'Masukkan pokok antara Rp 100.000 dan Rp 500.000.000.',
      },
      n: { min: 2, max: 60, pesan: 'Masukkan lama pinjaman antara 2 dan 60 bulan.' },
      i: { min: 0.1, max: 10, pesan: 'Masukkan bunga antara 0,1% dan 10% per bulan.' },
    },
    spesifikasi: {
      judul: 'Spesifikasi Fungsi untuk Aplikasi',
      baris: [
        {
          nama: 'hitungFlat(m0, n, i)',
          rumus:
            'totalBunga = n × m0 × i;  totalBayar = m0 × (1 + n × i);  angsuran = totalBayar / n',
        },
        {
          nama: 'hitungMenurun(m0, n, i)',
          rumus:
            'U1 = m0 × i;  Un = (m0 / n) × i;  totalBunga = (n / 2) × (U1 + Un);  totalBayar = m0 + totalBunga',
        },
      ],
      catatan:
        'Keduanya memakai rumus barisan dan deret aritmetika — tidak perlu perulangan bulan demi bulan untuk mendapatkan totalnya.',
    },
    karya: {
      judul: 'Rekomendasi Tim untuk Bu Mira',
      instruction:
        'Tulis rekomendasi yang akan dipresentasikan di depan kelas. Sebutkan skema pilihanmu, angka totalnya, dan alasan matematisnya (Uₙ / Sₙ).',
      placeholder:
        'Contoh kerangka: "Kami merekomendasikan Skema ... karena total pembayarannya Rp ... dibanding Rp ... Perhitungannya: ..."',
      minKarakter: 60,
      pesanKurang: 'Tulis rekomendasi minimal 60 karakter agar cukup untuk dipresentasikan.',
    },
  },

  /* ----------------------------------------------------------
     TAHAP 7 — PBL FASE 5: MENGANALISIS & MENGEVALUASI
     ---------------------------------------------------------- */
  evaluasi: {
    kicker: 'TAHAP 7 · PBL FASE 5 — MENGANALISIS & MENGEVALUASI',
    title: 'Uji Terap',
    goal: 'Menguji ketepatan penerapan rumus barisan dan deret aritmetika pada konteks simpan pinjam yang baru.',
    instruction:
      'Enam masalah baru dari meja layanan koperasi. Tentukan dulu: yang ditanya nilai satu periode (Uₙ) atau akumulasi (Sₙ)?',
    soal: [
      {
        id: 'e1',
        tipe: 'simpan',
        tipeBadge: 'Simpan · Uₙ',
        konteks:
          'Pak Anwar menyimpan Rp 4.500.000 di koperasi dengan bunga tunggal 0,5% per bulan dari setoran awal.',
        question: 'Berapa saldo simpanannya setelah <strong>10 bulan</strong>?',
        type: 'input',
        answer: 4725000,
        unit: 'rupiah',
        hints: [
          'Ini pertanyaan tentang satu periode tertentu, jadi pakai Mₙ = M₀ + n·b.',
          'b = 4.500.000 × 0,005 = 22.500. Lalu M₁₀ = 4.500.000 + 10 × 22.500 = ?',
        ],
        explanation:
          'b = 4.500.000 × 0,005 = Rp 22.500. M₁₀ = 4.500.000 + 10 × 22.500 = <strong>Rp 4.725.000</strong>.',
      },
      {
        id: 'e2',
        tipe: 'pinjam',
        tipeBadge: 'Pinjam · Sₙ',
        konteks:
          'Koperasi menyalurkan pinjaman Rp 9.000.000 selama 10 bulan dengan skema bunga menurun 1,8% per bulan dari sisa pokok. Pokok dicicil tetap.',
        question: 'Berapa <strong>total bunga</strong> yang dibayar peminjam?',
        type: 'input',
        answer: 891000,
        unit: 'rupiah',
        hints: [
          'Yang ditanya akumulasi, jadi pakai Sₙ = (n/2)(U₁ + Uₙ).',
          'Cicilan pokok = 9.000.000 ÷ 10 = 900.000. U₁ = 1,8% × 9.000.000 = 162.000; U₁₀ = 1,8% × 900.000 = 16.200.',
          'S₁₀ = (10/2) × (162.000 + 16.200) = 5 × 178.200 = ?',
        ],
        explanation:
          'S₁₀ = 5 × (162.000 + 16.200) = 5 × 178.200 = <strong>Rp 891.000</strong>. Bisa juga lewat bentuk ringkas M₀·i·(n+1)/2 = 9.000.000 × 0,018 × 5,5.',
      },
      {
        id: 'e3',
        tipe: 'pinjam',
        tipeBadge: 'Pinjam · Uₙ',
        konteks:
          'Bu Sri meminjam Rp 4.800.000 selama 12 bulan. Pokok dicicil tetap dan bunga 1,25% per bulan dihitung dari sisa pokok.',
        question: 'Berapa besar <strong>angsuran pada bulan ke-5</strong> (pokok + bunga)?',
        type: 'input',
        answer: 440000,
        unit: 'rupiah',
        hints: [
          'Cicilan pokok = 4.800.000 ÷ 12 = 400.000 per bulan.',
          'Sisa pokok di awal bulan ke-5 = 4.800.000 − 4 × 400.000 = 3.200.000. Bunganya = 1,25% × 3.200.000 = ?',
          'Angsuran bulan ke-5 = 400.000 + bunga bulan ke-5.',
        ],
        explanation:
          'Sisa pokok = Rp 3.200.000, bunga = 1,25% × 3.200.000 = Rp 40.000, sehingga angsuran = 400.000 + 40.000 = <strong>Rp 440.000</strong>. Lewat barisan: U₁ = 460.000, b = −5.000, U₅ = 460.000 − 4 × 5.000 = 440.000.',
      },
      {
        id: 'e4',
        tipe: 'banding',
        tipeBadge: 'Bandingkan',
        konteks:
          'Seorang anggota meminjam Rp 3.000.000 selama 6 bulan. Pilihan I: bunga flat 1% per bulan dari pokok awal. Pilihan II: bunga menurun 1,5% per bulan dari sisa pokok.',
        question: 'Pilihan mana yang <strong>total bunganya lebih kecil</strong>?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: 'Pilihan I — bunga flat, total bunga Rp 180.000' },
          { id: 'opt_b', label: 'Pilihan II — bunga menurun, total bunga Rp 157.500' },
          { id: 'opt_c', label: 'Sama saja, keduanya Rp 180.000' },
        ],
        correct: 'opt_b',
        explanation:
          'Flat: 6 × (1% × 3.000.000) = 6 × 30.000 = Rp 180.000. Menurun: U₁ = 45.000, U₆ = 1,5% × 500.000 = 7.500, S₆ = 3 × 52.500 = <strong>Rp 157.500</strong>. Pilihan II lebih murah Rp 22.500.',
      },
      {
        id: 'e5',
        tipe: 'simpan',
        tipeBadge: 'Simpan · Sₙ',
        konteks:
          'Rina menabung Rp 250.000 tiap awal bulan selama 8 bulan. Koperasi memberi bunga tunggal 1% per bulan untuk setiap setoran, dihitung sejak setoran itu masuk.',
        question: 'Berapa <strong>total bunga</strong> yang diterima Rina?',
        type: 'input',
        answer: 90000,
        unit: 'rupiah',
        hints: [
          'Setoran bulan ke-1 mengendap 8 bulan, setoran bulan ke-8 hanya 1 bulan. Bunganya membentuk barisan aritmetika.',
          'U₁ = 250.000 × 0,01 × 8 = 20.000 dan U₈ = 250.000 × 0,01 × 1 = 2.500.',
          'S₈ = (8/2) × (20.000 + 2.500) = 4 × 22.500 = ?',
        ],
        explanation:
          'S₈ = 4 × 22.500 = <strong>Rp 90.000</strong>. Saldo akhirnya 8 × 250.000 + 90.000 = Rp 2.090.000.',
      },
      {
        id: 'e6',
        tipe: 'banding',
        tipeBadge: 'Penalaran',
        konteks: null,
        question:
          'Seorang teman berkata: "Pokoknya cari yang persen bunganya paling kecil, pasti paling murah." Bagaimana tanggapanmu berdasarkan penyelidikan tadi?',
        type: 'choice',
        options: [
          { id: 'opt_a', label: 'Benar, persen bunga terkecil selalu menghasilkan total terkecil' },
          {
            id: 'opt_b',
            label:
              'Belum tentu — yang menentukan adalah dasar perhitungannya: pokok awal yang tetap, atau sisa pokok yang menyusut',
          },
          { id: 'opt_c', label: 'Tidak bisa dinilai tanpa mengetahui nama koperasinya' },
        ],
        correct: 'opt_b',
        explanation:
          'Masalah Bu Mira membuktikannya: 2% menurun (Rp 6.780.000) justru lebih murah daripada 1,5% flat (Rp 7.080.000). Persen bunga hanya bermakna bila disebutkan pula <strong>dasar perhitungannya</strong> — inilah informasi yang wajib ditampilkan aplikasi KopSis kepada anggota.',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 8 — PBL FASE 5: REFLEKSI & KONSOLIDASI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'TAHAP 8 · PBL FASE 5 — REFLEKSI & KONSOLIDASI',
    title: 'Refleksi Pemecahan Masalah',
    goal: 'Menyadari perubahan cara berpikir dan menilai ketepatan proses pemecahan masalah yang telah dilalui.',
    note: 'Refleksi ini membantu kamu menyadari bagaimana pemikiranmu berubah. Jawaban <strong>tidak dikirim ke mana pun</strong> — hanya tersimpan di perangkatmu.',
    soal: [
      {
        id: 'r1',
        question:
          'Bandingkan dugaan awalmu di Tahap 1 dengan hasil penyelidikan. <strong>Apa yang berubah</strong> dari cara berpikirmu, dan apa yang menyebabkannya berubah?',
        placeholder: 'Awalnya saya menduga... ternyata...',
      },
      {
        id: 'r2',
        question:
          'Pada masalah ini, kapan kamu memakai rumus <strong>Uₙ</strong> dan kapan <strong>Sₙ</strong>? Beri satu contoh untuk masing-masing.',
        placeholder: 'Saya memakai Uₙ ketika... dan Sₙ ketika...',
      },
      {
        id: 'r3',
        question:
          'Bagian mana dari proses penyelidikan yang <strong>paling sulit</strong> bagimu, dan strategi apa yang akhirnya menolong?',
        placeholder: 'Bagian tersulit adalah... saya mengatasinya dengan...',
      },
      {
        id: 'r4',
        question:
          'Sebagai calon pengembang aplikasi, <strong>informasi apa</strong> yang wajib ditampilkan aplikasi pinjaman agar penggunanya tidak salah paham seperti Bu Mira? Sebutkan minimal dua.',
        placeholder: 'Aplikasi harus menampilkan...',
      },
    ],
  },

  /* ----------------------------------------------------------
     TAHAP 9 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    rumus: [
      {
        variant: 'simpan',
        judul: 'Saldo / Utang Bunga Tunggal',
        expr: 'Mₙ = M₀ (1 + n · i)',
        desc: 'Barisan aritmetika dengan a = M₀ dan b = M₀ · i.',
      },
      {
        variant: 'flat',
        judul: 'Total Bunga — Skema Flat',
        expr: 'Total = n · M₀ · i',
        desc: 'Bunga tiap bulan sama, sehingga totalnya cukup dikalikan.',
      },
      {
        variant: 'menurun',
        judul: 'Total Bunga — Skema Menurun',
        expr: 'Sₙ = (n / 2)(U₁ + Uₙ) = M₀ · i · (n + 1) / 2',
        desc: 'Deret aritmetika dengan U₁ = M₀ · i dan b = −(M₀/n) · i.',
      },
    ],
    poinKunci: [
      'Bunga tunggal selalu menghasilkan <strong>barisan aritmetika</strong> — yang membedakan hanyalah apa yang menjadi dasar perhitungan bunganya.',
      'Pertanyaan "berapa pada bulan ke-n" dijawab dengan <strong>Uₙ</strong>; pertanyaan "berapa totalnya" dijawab dengan <strong>Sₙ</strong>.',
      'Skema bunga menurun 2% lebih murah daripada flat 1,5% karena dasar bunganya menyusut tiap bulan.',
      'Titik impas kedua skema: i<sub>B</sub> = 2 · n · i<sub>A</sub> / (n + 1) — di atas nilai itu, skema menurun tidak lagi lebih murah.',
      'Rumus barisan dan deret membuat aplikasi dapat menghitung total <strong>tanpa</strong> menelusuri bulan demi bulan.',
    ],
  },
};
