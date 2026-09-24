'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membaca & Menulis Bilangan Desimal
   Fase D — SMP Kelas 7

   Tujuan Pembelajaran:
   Membaca dan menulis bilangan desimal dengan benar menggunakan
   konsep nilai tempat (persepuluhan, perseratusan, perseribuan)
   melalui pengamatan konteks nyata dan model visual.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'koleksi'
     Sintaks 4 — Data processing ............ tahap 'olahNilai' & 'olahBaca'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas:
     1. Stimulasi   — timbangan digital di pasar; catatan belanja
                      "satu dan lima perseratus kilogram". Murid MENDUGA
                      angka pada layar timbangan (tidak dinilai).
     2. Masalah     — memilih rumusan masalah & menulis hipotesis.
     3. Data        — (A) merakit empat bilangan dari konteks nyata
                      dengan perakit desimal (model blok + tabel nilai
                      tempat + cara baca yang berubah langsung);
                      (B) mengamati tabel data yang terkumpul.
     4. Olah nilai  — memilah nilai tempat angka yang disorot, menemukan
                      hubungan 1 = 10 persepuluhan = 100 perseratusan …,
                      lalu memilih pola nilai tempat.
     5. Olah baca   — menemukan aturan dua cara baca, menulis bilangan
                      dari kata (angka 0 pengisi tempat), dan membaca
                      bilangan desimal.
     6. Bukti       — menguji dugaan tahap 1 & menanggapi miskonsepsi.
     7. Simpulan    — menyusun kalimat kesimpulan dari bank kalimat.
     8. Uji terap   — soal kontekstual (atletik, suhu tubuh, emas,
                      pasar, tinggi badan, obat, curah hujan, ojek).
     9. Refleksi    — rekap, refleksi tertulis, penilaian diri.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar" (jawaban benar sering di depan). Pengacakan dilakukan
   app.js memakai ensureShuffledOrder()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan.

   Konvensi: bilangan desimal ditulis sebagai STRING berkoma ("3,07")
   agar angka 0 pengisi tempat tetap terjaga. Kolom `jawab` pada isian
   berupa Number (3.07) karena dibandingkan dengan hampirSama().
   ============================================================ */

var DATA = {
  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: 'Discovery Learning · Sintaks 1',
    goal: 'Mengamati bilangan desimal di pasar dan menduga cara menuliskannya.',
    guru: 'Bacakan cerita dengan antusias. Bila memungkinkan, tunjukkan foto layar timbangan digital, label kemasan, atau termometer. Jangan membenarkan atau menyalahkan dugaan murid — mintalah beberapa murid membacakan alasannya, lalu biarkan perbedaan pendapat menjadi rasa ingin tahu.',
    judul: 'Catatan Belanja Nadia',
    cerita:
      'Nadia menemani ibunya berbelanja di pasar. Di lapak daging, penjual meletakkan daging di atas timbangan digital. Ibu lalu mencatat di buku belanjanya: “Daging sapi — satu dan lima perseratus kilogram.” Nadia penasaran: angka berapa yang sebenarnya muncul di layar timbangan?',
    layarLabel: 'Layar timbangan',
    satuan: 'kg',
    nilai: '1,05',
    catatanIbu: 'satu dan lima perseratus kilogram',
    pertanyaan: 'Menurut dugaanmu, angka berapa yang tampil di layar timbangan?',
    opsi: [
      { id: 'a105', label: '1,05 kg' },
      { id: 'a15', label: '1,5 kg' },
      { id: 'a1005', label: '1,005 kg' },
      { id: 'a150', label: '1,50 kg' },
    ],
    benar: 'a105',
    alasanLabel: 'Bagaimana kamu memperoleh dugaan itu?',
    alasanPlaceholder: 'Tulis caramu berpikir dengan kalimatmu sendiri…',
    catatan:
      'Belum ada jawaban benar atau salah di tahap ini. Simpan dugaanmu — kamu akan mengujinya sendiri nanti.',
    teaserJudul: 'Bilangan seperti ini ada di mana-mana',
    teaserTanya: 'Bagaimana cara membaca angka-angka ini dengan benar?',
    teaser: [
      { ikon: '🌡️', angka: '37,5 °C', teks: 'Suhu tubuh pada termometer digital' },
      { ikon: '⏱️', angka: '12,48 detik', teks: 'Catatan waktu lari 100 m di stopwatch' },
      { ikon: '💊', angka: '2,5 mL', teks: 'Takaran sirop obat pada gelas takar' },
      { ikon: '🛵', angka: '3,125 km', teks: 'Jarak perjalanan di aplikasi ojek daring' },
    ],
    nextLabel: 'Lanjut ke Identifikasi Masalah →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: 'Discovery Learning · Sintaks 2',
    goal: 'Merumuskan pertanyaan yang akan diselidiki dan menuliskan hipotesis.',
    guru: 'Ajak murid membandingkan pilihan rumusan masalah: mana yang bisa dijawab dengan menyelidiki bilangannya sendiri? Terima semua hipotesis; hipotesis yang keliru justru bahan berharga untuk tahap Pembuktian.',
    pengantar:
      'Dugaan teman-temanmu di tahap sebelumnya berbeda-beda. Ada yang memilih 1,5; ada yang memilih 1,05; ada pula yang memilih 1,005. Artinya, ada hal penting tentang angka di belakang koma yang perlu kita selidiki.',
    pertanyaan: 'Pertanyaan manakah yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'r1',
        label:
          'Bagaimana tempat (nilai tempat) setiap angka di belakang koma menentukan cara membaca dan menulis bilangan desimal?',
      },
      { id: 'r2', label: 'Berapa harga 1 kg daging sapi di pasar?' },
      { id: 'r3', label: 'Mengapa timbangan digital lebih teliti daripada timbangan jarum?' },
      {
        id: 'r4',
        label: 'Bagaimana cara menghapus koma agar bilangan desimal lebih mudah dibaca?',
      },
    ],
    correct: 'r1',
    umpan: {
      r1: '<strong>Tepat!</strong> Pertanyaan ini bisa dijawab dengan menyelidiki bilangannya sendiri: di mana angka berada, dan apa artinya.',
      r2: 'Harga daging memang menarik, tetapi tidak menjawab kebingungan Nadia tentang cara menulis beratnya. Coba pilih lagi.',
      r3: 'Pertanyaan ini tentang alat timbang, bukan tentang cara membaca dan menulis bilangannya. Coba pilih lagi.',
      r4: 'Menghapus koma justru mengubah nilai bilangannya (1,05 kg menjadi 105 kg!). Coba pilih lagi.',
    },
    hipotesisLabel:
      'Tulis hipotesismu: menurutmu, apa arti angka 0 dan angka 5 pada tulisan desimal berat daging itu?',
    hipotesisPlaceholder: 'Menurutku, …',
    nextLabel: 'Lanjut ke Pengumpulan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: 'Discovery Learning · Sintaks 3',
    goal: 'Merakit bilangan desimal dari konteks nyata dengan model blok dan mencatat datanya.',
    guru: 'Beri kesempatan murid bereksperimen bebas dengan perakit terlebih dahulu. Tanyakan: “Berapa batang oranye yang sama dengan satu persegi biru?” Bila tersedia, gunakan kertas berpetak 10 × 10 sebagai model konkret pendamping.',
    instruksiBebas:
      'Coba dulu perakit di bawah ini. Tekan + dan − pada setiap tempat, lalu amati bagaimana tulisan desimal, tabel nilai tempat, model blok, dan cara bacanya berubah.',
    instruksiA:
      'Sekarang rakitlah setiap bilangan pada kartu tugas. Baca deskripsinya, atur banyak blok pada tiap tempat, lalu tekan “Periksa Rakitan”.',
    percobaan: [
      {
        id: 'k1',
        ikon: '🎀',
        konteks: 'Pita kado',
        teks: 'Panjang pita: 1 satuan, 2 persepuluhan, dan 5 perseratusan meter.',
        nilai: '1,25',
        satuan: 'm',
        hints: [
          'Satuan = persegi biru. Persepuluhan = batang oranye. Perseratusan = kotak ungu kecil.',
          'Atur: satuan 1, persepuluhan 2, perseratusan 5, perseribuan 0.',
        ],
      },
      {
        id: 'k2',
        ikon: '🥜',
        konteks: 'Kacang tanah',
        teks: 'Berat kacang: 0 satuan, 3 persepuluhan, 7 perseratusan, dan 5 perseribuan kilogram.',
        nilai: '0,375',
        satuan: 'kg',
        hints: [
          'Tidak ada persegi biru sama sekali (0 satuan). Perseribuan = irisan hijau yang sangat tipis.',
          'Atur: satuan 0, persepuluhan 3, perseratusan 7, perseribuan 5.',
        ],
      },
      {
        id: 'k3',
        ikon: '💧',
        konteks: 'Botol air',
        teks: 'Isi botol air: 2 satuan dan 5 perseratusan liter — tanpa persepuluhan.',
        nilai: '2,05',
        satuan: 'L',
        hints: [
          '“Tanpa persepuluhan” berarti banyak batang oranye adalah 0.',
          'Atur: satuan 2, persepuluhan 0, perseratusan 5, perseribuan 0.',
        ],
      },
      {
        id: 'k4',
        ikon: '💊',
        konteks: 'Obat tetes',
        teks: 'Takaran obat tetes: 0 satuan, 0 persepuluhan, 0 perseratusan, dan 8 perseribuan liter.',
        nilai: '0,008',
        satuan: 'L',
        hints: [
          'Hanya ada irisan hijau (perseribuan). Tempat lainnya 0.',
          'Atur: satuan 0, persepuluhan 0, perseratusan 0, perseribuan 8.',
        ],
      },
    ],
    selesaiA: 'Keempat bilangan berhasil dirakit. Datamu tercatat di tabel berikut.',
    instruksiB: 'Amati tabel data hasil rakitanmu, lalu jawab pertanyaan pengamatan di bawahnya.',
    amatiLabel: 'Pada 2,05 dan 0,008 muncul angka 0 di belakang koma. Apa gunanya angka 0 itu?',
    amatiOpsi: [
      {
        id: 'o1',
        label: 'Menjaga tempat yang kosong, agar angka 5 dan 8 tetap berada di tempat yang benar.',
      },
      { id: 'o2', label: 'Tidak ada gunanya; angka 0 boleh dihapus tanpa mengubah bilangan.' },
      { id: 'o3', label: 'Membuat bilangannya menjadi lebih besar.' },
      { id: 'o4', label: 'Menunjukkan bahwa bilangan itu negatif.' },
    ],
    amatiCorrect: 'o1',
    amatiUmpan: {
      o1: '<strong>Pengamatan yang tajam!</strong> Tanpa angka 0, 2,05 akan terbaca 2,5 — angka 5 berpindah dari tempat perseratusan ke persepuluhan.',
      o2: 'Coba hapus angka 0 pada 2,05: hasilnya 2,5. Di perakit, apakah 2,5 sama dengan 2 satuan dan 5 perseratusan? Pilih lagi.',
      o3: 'Angka 0 tidak menambah nilai apa pun (0 blok). Perhatikan apa yang terjadi pada posisi angka 5 bila 0 dihapus. Pilih lagi.',
      o4: 'Tanda negatif ditulis dengan “−” di depan bilangan, bukan dengan angka 0. Pilih lagi.',
    },
    nextLabel: 'Lanjut ke Pengolahan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — OLAH DATA: NILAI TEMPAT
     ---------------------------------------------------------- */
  olahNilai: {
    kicker: 'Tahap 4 · Pengolahan Data (Nilai Tempat)',
    syntax: 'Discovery Learning · Sintaks 4',
    goal: 'Menentukan nilai tempat angka-angka di belakang koma dan menemukan polanya.',
    guru: 'Arahkan murid menghitung tempat dari koma ke kanan: “pertama, kedua, ketiga”. Minta mereka membuktikan hubungan 1 = 10 persepuluhan dengan model blok, bukan menghafal.',
    instruksiA:
      'Bagian A — Angka yang disorot kuning menempati nilai tempat apa? Gunakan tabel datamu sebagai bantuan.',
    opsiTempat: [
      { id: 'satuan', label: 'Satuan' },
      { id: 'persepuluhan', label: 'Persepuluhan' },
      { id: 'perseratusan', label: 'Perseratusan' },
      { id: 'perseribuan', label: 'Perseribuan' },
    ],
    /* `angka` + `pos`: posisi angka yang disorot (0 = satuan, 1–3 di belakang koma). */
    item: [
      {
        id: 'n1',
        angka: '4,72',
        pos: 1,
        correct: 'persepuluhan',
        explanation:
          'Angka 7 adalah angka <em>pertama</em> di belakang koma → persepuluhan (nilainya 0,7).',
      },
      {
        id: 'n2',
        angka: '0,381',
        pos: 2,
        correct: 'perseratusan',
        explanation:
          'Angka 8 adalah angka <em>kedua</em> di belakang koma → perseratusan (nilainya 0,08).',
      },
      {
        id: 'n3',
        angka: '5,069',
        pos: 3,
        correct: 'perseribuan',
        explanation:
          'Angka 9 adalah angka <em>ketiga</em> di belakang koma → perseribuan (nilainya 0,009).',
      },
      {
        id: 'n4',
        angka: '6,25',
        pos: 0,
        correct: 'satuan',
        explanation: 'Angka 6 berada tepat di depan koma → satuan (nilainya 6).',
      },
      {
        id: 'n5',
        angka: '0,05',
        pos: 2,
        correct: 'perseratusan',
        explanation:
          'Angka 5 adalah angka kedua di belakang koma (angka 0 menempati persepuluhan) → perseratusan.',
      },
      {
        id: 'n6',
        angka: '8,604',
        pos: 1,
        correct: 'persepuluhan',
        explanation: 'Angka 6 adalah angka pertama di belakang koma → persepuluhan (nilainya 0,6).',
      },
    ],
    instruksiB:
      'Bagian B — Gunakan model blok untuk menemukan hubungan antartempat. Isi setiap titik-titik.',
    langkah: [
      {
        label: '1 persegi biru (1 satuan) terbentuk dari … batang oranye (persepuluhan).',
        jawab: 10,
        hints: ['Hitung berapa batang yang bisa berjajar mengisi satu persegi 10 × 10.'],
        temuan: '1 satuan = 10 persepuluhan, jadi 1 persepuluhan = 1/10 = 0,1.',
      },
      {
        label: '1 batang oranye (1 persepuluhan) terbentuk dari … kotak ungu (perseratusan).',
        jawab: 10,
        hints: [
          'Satu batang terdiri atas satu kolom kotak kecil. Ada berapa kotak kecil dalam satu kolom?',
        ],
        temuan: '1 persepuluhan = 10 perseratusan, jadi 1 perseratusan = 1/100 = 0,01.',
      },
      {
        label: '1 kotak ungu (1 perseratusan) terbentuk dari … irisan hijau (perseribuan).',
        jawab: 10,
        hints: ['Polanya sama seperti sebelumnya: setiap tempat dipecah menjadi berapa bagian?'],
        temuan: '1 perseratusan = 10 perseribuan, jadi 1 perseribuan = 1/1000 = 0,001.',
      },
      {
        label: 'Nilai angka 7 pada 4,72 adalah …',
        jawab: 0.7,
        desimal: true,
        hints: [
          'Angka 7 menempati persepuluhan, artinya ada 7 persepuluhan.',
          '7 persepuluhan = 7 × 0,1. Tulis dengan koma.',
        ],
        temuan: 'Angka 7 pada 4,72 bernilai 0,7 (tujuh persepuluh).',
      },
      {
        label: 'Nilai angka 8 pada 0,381 adalah …',
        jawab: 0.08,
        desimal: true,
        hints: [
          'Angka 8 menempati perseratusan, artinya ada 8 perseratusan.',
          '8 perseratusan = 8 × 0,01. Jangan lupa angka 0 di tempat persepuluhan.',
        ],
        temuan: 'Angka 8 pada 0,381 bernilai 0,08 (delapan perseratus).',
      },
    ],
    polaLabel: 'Pola apakah yang kamu temukan?',
    polaOpsi: [
      {
        id: 'q1',
        label:
          'Setiap bergeser satu tempat ke kanan, nilai tempatnya menjadi 1/10 dari tempat sebelumnya: persepuluhan, perseratusan, perseribuan.',
      },
      {
        id: 'q2',
        label:
          'Nilai tempat di belakang koma berurutan puluhan, ratusan, ribuan — sama seperti di depan koma.',
      },
      { id: 'q3', label: 'Semua angka di belakang koma bernilai persepuluhan.' },
      {
        id: 'q4',
        label: 'Semakin ke kanan dari koma, nilai tempatnya semakin besar.',
      },
    ],
    polaCorrect: 'q1',
    polaUmpan: {
      q1: '<strong>Pola ditemukan!</strong> 1 → 1/10 → 1/100 → 1/1000. Nama tempatnya selalu berawalan “per-”.',
      q2: 'Periksa lagi tabelmu: tempat pertama di belakang koma bernama persepuluhan, bukan puluhan. Nilainya lebih kecil dari 1. Pilih lagi.',
      q3: 'Pada 0,381, angka 8 bernilai 0,08 — bukan 0,8. Jadi tidak semuanya persepuluhan. Pilih lagi.',
      q4: 'Perhatikan model blok: batang oranye lebih kecil dari persegi, kotak ungu lebih kecil lagi. Pilih lagi.',
    },
    nextLabel: 'Lanjut ke Membaca & Menulis →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — OLAH DATA: MEMBACA & MENULIS
     ---------------------------------------------------------- */
  olahBaca: {
    kicker: 'Tahap 5 · Pengolahan Data (Membaca & Menulis)',
    syntax: 'Discovery Learning · Sintaks 4',
    goal: 'Menemukan aturan membaca bilangan desimal dan menuliskannya dari kata-kata.',
    guru: 'Tegaskan bahwa kedua cara baca benar. Cara baca “koma” (angka di belakang koma dibaca satu per satu) paling sering dipakai; cara baca “nilai tempat” menunjukkan artinya. Minta murid mengucapkan keduanya dengan lantang.',
    instruksiA:
      'Bagian A — Amati bagaimana data dari perakitmu dibaca dengan dua cara. Lalu jawab pertanyaan di bawah tabel.',
    contoh: ['1,25', '0,375', '2,05', '0,008'],
    aturanLabel:
      'Pada cara baca “nilai tempat”, apa yang menentukan kata penutupnya (persepuluh, perseratus, atau perseribu)?',
    aturanOpsi: [
      { id: 'a1', label: 'Nilai tempat angka paling kanan (terakhir) di belakang koma.' },
      { id: 'a2', label: 'Banyaknya angka di depan koma.' },
      { id: 'a3', label: 'Angka terbesar di belakang koma.' },
      { id: 'a4', label: 'Selalu “perseratus” untuk semua bilangan desimal.' },
    ],
    aturanCorrect: 'a1',
    aturanUmpan: {
      a1: '<strong>Benar!</strong> 1,25 berakhir di perseratusan → “… perseratus”; 0,375 berakhir di perseribuan → “… perseribu”.',
      a2: 'Bandingkan 2,05 dan 0,008: bagian depan komanya sama-sama satu angka, tetapi kata penutupnya berbeda. Pilih lagi.',
      a3: 'Pada 0,375 angka terbesarnya 7 (perseratusan), tetapi dibaca “… perseribu”. Pilih lagi.',
      a4: '0,375 dibaca “… perseribu”, bukan “perseratus”. Pilih lagi.',
    },
    instruksiB:
      'Bagian B — Tulis bilangan desimal dari kata-kata berikut. Gunakan tanda koma, dan isi tempat yang kosong dengan angka 0.',
    tulis: [
      {
        kata: 'tiga dan tujuh perseratus',
        jawab: 3.07,
        nilai: '3,07',
        hints: [
          '“perseratus” → angka terakhir berada di tempat perseratusan, yaitu tempat KEDUA di belakang koma.',
          'Tempat persepuluhan kosong, jadi isi dengan 0: 3,_7.',
        ],
      },
      {
        kata: 'empat puluh lima perseribu',
        jawab: 0.045,
        nilai: '0,045',
        hints: [
          '“perseribu” → angka terakhir di tempat KETIGA di belakang koma. Tidak ada bagian bulat, jadi tulis 0 di depan koma.',
          '45 hanya mengisi dua tempat terakhir. Tempat persepuluhan diisi 0: 0,_45.',
        ],
      },
      {
        kata: 'enam dan dua ratus delapan perseribu',
        jawab: 6.208,
        nilai: '6,208',
        hints: [
          '“perseribu” → tiga angka di belakang koma.',
          '208 tepat mengisi tiga tempat: 2 persepuluhan, 0 perseratusan, 8 perseribuan.',
        ],
      },
      {
        kata: 'dua belas dan empat persepuluh',
        jawab: 12.4,
        nilai: '12,4',
        hints: [
          '“persepuluh” → hanya satu angka di belakang koma.',
          'Bagian bulatnya dua belas: 12,_.',
        ],
      },
    ],
    instruksiC:
      'Bagian C — Pilih cara membaca yang tepat untuk setiap bilangan. Perhatikan cara baca yang diminta.',
    baca: [
      {
        id: 'c1',
        angka: '0,375',
        cara: 'cara baca koma',
        options: [
          { id: 'b1', label: 'nol koma tiga tujuh lima' },
          { id: 'b2', label: 'tiga ratus tujuh puluh lima' },
          { id: 'b3', label: 'nol koma tiga ratus tujuh puluh lima perseratus' },
          { id: 'b4', label: 'tiga koma tujuh lima' },
        ],
        correct: 'b1',
        explanation: 'Angka di belakang koma dibaca satu per satu: tiga, tujuh, lima.',
      },
      {
        id: 'c2',
        angka: '5,08',
        cara: 'cara baca nilai tempat',
        options: [
          { id: 'b1', label: 'lima dan delapan perseratus' },
          { id: 'b2', label: 'lima dan delapan persepuluh' },
          { id: 'b3', label: 'lima dan delapan perseribu' },
          { id: 'b4', label: 'lima puluh delapan perseratus' },
        ],
        correct: 'b1',
        explanation:
          'Angka 8 berada di tempat kedua (perseratusan), jadi “lima dan delapan perseratus”.',
      },
      {
        id: 'c3',
        angka: '0,6',
        cara: 'cara baca nilai tempat',
        options: [
          { id: 'b1', label: 'enam persepuluh' },
          { id: 'b2', label: 'enam perseratus' },
          { id: 'b3', label: 'nol dan enam puluh' },
          { id: 'b4', label: 'enam' },
        ],
        correct: 'b1',
        explanation: 'Satu angka di belakang koma → persepuluhan. 0,6 = enam persepuluh.',
      },
      {
        id: 'c4',
        angka: '2,014',
        cara: 'cara baca koma',
        options: [
          { id: 'b1', label: 'dua koma nol satu empat' },
          { id: 'b2', label: 'dua koma empat belas' },
          { id: 'b3', label: 'dua koma satu empat' },
          { id: 'b4', label: 'dua puluh koma empat belas' },
        ],
        correct: 'b1',
        explanation: 'Angka 0 di belakang koma ikut dibaca: dua koma nol satu empat.',
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
    goal: 'Menguji dugaan awal dan menanggapi kekeliruan umum tentang bilangan desimal.',
    guru: 'Bandingkan dugaan murid di tahap 1 dengan hasil pembuktian. Beri apresiasi pada murid yang mengubah pendapatnya berdasarkan bukti — itulah inti penemuan. Diskusikan miskonsepsi secara klasikal.',
    prediksiLabel: 'Dugaanmu di tahap Stimulasi',
    uji: {
      label: 'Tulis “satu dan lima perseratus” dalam bentuk desimal:',
      jawab: 1.05,
      hints: [
        '“perseratus” → angka terakhir di tempat kedua di belakang koma.',
        'Tempat persepuluhan kosong → isi 0.',
      ],
      temuan:
        'Terbukti: layar timbangan menunjukkan 1,05 kg — 1 satuan, 0 persepuluhan, 5 perseratusan.',
    },
    kesimpulanBenar:
      'Dugaanmu terbukti benar! Kamu sudah menangkap peran angka 0 sebagai penjaga tempat.',
    kesimpulanKeliru:
      'Dugaanmu belum tepat — dan itu wajar. Kini kamu punya bukti dari model blok dan tabel nilai tempat. Bandingkan dugaanmu dengan bukti di atas.',
    instruksiSoal: 'Tanggapi pendapat teman-teman berikut. Pilih tanggapan yang paling tepat.',
    soal: [
      {
        id: 'm1',
        pernyataan:
          'Raka menulis <strong>“tiga dan tujuh perseratus”</strong> sebagai <strong>3,7</strong>.',
        options: [
          {
            id: 'x1',
            label: 'Keliru. Seharusnya 3,07, karena angka 7 harus berada di tempat perseratusan.',
          },
          { id: 'x2', label: 'Benar, karena bilangannya memang tiga dan tujuh.' },
          { id: 'x3', label: 'Keliru. Seharusnya 3,700.' },
          { id: 'x4', label: 'Keliru. Seharusnya 37,100.' },
        ],
        correct: 'x1',
        explanation:
          '3,7 dibaca “tiga dan tujuh persepuluh”. Agar angka 7 menempati perseratusan, tempat persepuluhan diisi 0: 3,07.',
      },
      {
        id: 'm2',
        pernyataan:
          'Sinta berpendapat <strong>0,50</strong> dan <strong>0,5</strong> adalah dua bilangan yang berbeda nilainya.',
        options: [
          {
            id: 'x1',
            label: 'Keliru. 0,50 = lima puluh perseratus = lima persepuluh = 0,5; nilainya sama.',
          },
          { id: 'x2', label: 'Benar. 0,50 sepuluh kali lebih besar daripada 0,5.' },
          { id: 'x3', label: 'Benar. 0,50 lebih kecil karena ada angka 0 di akhir.' },
          { id: 'x4', label: 'Benar. Bilangan yang lebih panjang selalu lebih besar.' },
        ],
        correct: 'x1',
        explanation:
          'Pada model blok, 5 batang persepuluhan sama luasnya dengan 50 kotak perseratusan. Angka 0 di akhir tidak mengubah nilai.',
      },
      {
        id: 'm3',
        pernyataan:
          'Dimas mengira <strong>1,005</strong> sama dengan <strong>1,05</strong> karena “angka nolnya tidak berarti”.',
        options: [
          {
            id: 'x1',
            label:
              'Keliru. 1,005 = satu dan lima perseribu, sedangkan 1,05 = satu dan lima perseratus.',
          },
          { id: 'x2', label: 'Benar. Angka 0 di tengah boleh dihapus.' },
          { id: 'x3', label: 'Benar. Keduanya sama-sama memuat angka 1 dan 5.' },
          { id: 'x4', label: 'Keliru. 1,005 lebih besar daripada 1,05.' },
        ],
        correct: 'x1',
        explanation:
          'Angka 0 di antara koma dan angka 5 adalah penjaga tempat. Menghapusnya memindahkan 5 dari perseribuan ke perseratusan.',
      },
      {
        id: 'm4',
        pernyataan:
          'Nadia membaca angka stopwatch <strong>12,48</strong> sebagai “dua belas koma empat puluh delapan”. Cara baca manakah yang sesuai nilai tempat?',
        options: [
          {
            id: 'x1',
            label:
              '“dua belas koma empat delapan” atau “dua belas dan empat puluh delapan perseratus”',
          },
          { id: 'x2', label: '“dua belas dan empat puluh delapan persepuluh”' },
          { id: 'x3', label: '“seribu dua ratus empat puluh delapan”' },
          { id: 'x4', label: '“dua belas dan empat puluh delapan perseribu”' },
        ],
        correct: 'x1',
        explanation:
          'Cara baca koma membaca angka satu per satu (empat, delapan). Cara baca nilai tempat berakhir di perseratusan karena angka 8 ada di tempat kedua.',
      },
    ],
    nextLabel: 'Lanjut ke Menarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 7 · Menarik Kesimpulan',
    syntax: 'Discovery Learning · Sintaks 6',
    goal: 'Menyusun sendiri aturan membaca dan menulis bilangan desimal.',
    guru: 'Minta beberapa murid membacakan kesimpulannya dengan contoh buatan sendiri, misalnya dari label kemasan di kelas. Kesimpulan yang disusun murid lebih bermakna daripada rumus yang dihafal.',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat dari bank kalimat. Setiap potongan hanya dipakai satu kali.',
    selectPlaceholder: '— pilih potongan kalimat —',
    kalimat: [
      { id: 'g1', awal: 'Angka pertama di belakang koma menempati', correct: 'b1' },
      { id: 'g2', awal: 'Angka kedua di belakang koma menempati', correct: 'b2' },
      { id: 'g3', awal: 'Angka ketiga di belakang koma menempati', correct: 'b3' },
      {
        id: 'g4',
        awal: 'Saat membaca dengan cara nilai tempat, kata penutupnya ditentukan oleh',
        correct: 'b4',
      },
      {
        id: 'g5',
        awal: 'Saat menulis, tempat yang kosong di antara koma dan angka harus',
        correct: 'b5',
      },
    ],
    bank: [
      { id: 'b1', teks: 'tempat persepuluhan, bernilai 1/10 = 0,1.' },
      { id: 'b2', teks: 'tempat perseratusan, bernilai 1/100 = 0,01.' },
      { id: 'b3', teks: 'tempat perseribuan, bernilai 1/1000 = 0,001.' },
      { id: 'b4', teks: 'nilai tempat angka paling kanan di belakang koma.' },
      { id: 'b5', teks: 'diisi angka 0 agar setiap angka berada di tempatnya.' },
      { id: 'b6', teks: 'tempat puluhan, bernilai 10.' },
      { id: 'b7', teks: 'dihapus agar bilangan lebih pendek.' },
    ],
    rangkuman: [
      'Nilai tempat di belakang koma: <strong>persepuluhan (0,1)</strong>, <strong>perseratusan (0,01)</strong>, <strong>perseribuan (0,001)</strong>. Setiap tempat bernilai 1/10 dari tempat di kirinya.',
      'Cara baca koma: angka di belakang koma dibaca satu per satu — 3,07 dibaca “tiga koma nol tujuh”.',
      'Cara baca nilai tempat: 3,07 dibaca “tiga dan tujuh perseratus”; kata penutup mengikuti tempat angka paling kanan.',
      'Menulis dari kata: tentukan banyak angka di belakang koma dari kata penutupnya (persepuluh = 1, perseratus = 2, perseribu = 3), lalu isi tempat kosong dengan 0.',
      'Angka 0 di akhir tidak mengubah nilai (0,50 = 0,5), tetapi angka 0 penjaga tempat tidak boleh dihapus (1,05 ≠ 1,5).',
    ],
    nextLabel: 'Lanjut ke Uji Terap →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — UJI TERAP
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 8 · Uji Terap',
    syntax: 'Penerapan',
    goal: 'Menerapkan cara membaca dan menulis bilangan desimal pada masalah sehari-hari.',
    guru: 'Biarkan murid bekerja mandiri. Amati murid yang masih menulis tanpa angka 0 penjaga tempat, lalu arahkan kembali ke tabel nilai tempat.',
    instruksi:
      'Kerjakan setiap soal. Untuk soal isian, tulis bilangan desimal dengan tanda koma (mis. 3,07).',
    soal: [
      {
        type: 'input',
        konteks: '🏃 Atletik',
        cerita:
          'Rekor dunia lari 100 m putra adalah sembilan dan lima puluh delapan perseratus detik.',
        pertanyaan: 'Tuliskan catatan waktu itu dalam bentuk desimal.',
        jawab: 9.58,
        suffix: 'detik',
        hints: [
          '“perseratus” → dua angka di belakang koma.',
          'Lima puluh delapan mengisi dua tempat: 5 persepuluhan, 8 perseratusan.',
        ],
        explanation: 'Sembilan dan lima puluh delapan perseratus = <strong>9,58</strong> detik.',
        reveal: 'Jawaban: <strong>9,58</strong> detik (9 satuan, 5 persepuluhan, 8 perseratusan).',
      },
      {
        type: 'choice',
        konteks: '🌡️ Suhu tubuh',
        cerita: 'Termometer digital menunjukkan suhu tubuh Ayu 37,8 °C.',
        pertanyaan: 'Cara membaca suhu itu yang tepat adalah …',
        options: [
          { id: 'o1', label: 'tiga puluh tujuh koma delapan derajat Celsius' },
          { id: 'o2', label: 'tiga ratus tujuh puluh delapan derajat Celsius' },
          { id: 'o3', label: 'tiga puluh tujuh dan delapan perseratus derajat Celsius' },
          { id: 'o4', label: 'tiga koma tujuh delapan derajat Celsius' },
        ],
        correct: 'o1',
        explanation:
          '37,8 dibaca “tiga puluh tujuh koma delapan”, atau “tiga puluh tujuh dan delapan persepuluh”.',
      },
      {
        type: 'choice',
        konteks: '💍 Toko emas',
        cerita: 'Sebuah cincin emas memiliki berat 2,375 gram.',
        pertanyaan: 'Angka 7 pada 2,375 menempati nilai tempat …',
        options: [
          { id: 'o1', label: 'perseratusan' },
          { id: 'o2', label: 'persepuluhan' },
          { id: 'o3', label: 'perseribuan' },
          { id: 'o4', label: 'puluhan' },
        ],
        correct: 'o1',
        explanation: 'Angka 7 adalah angka kedua di belakang koma → perseratusan (nilainya 0,07).',
      },
      {
        type: 'input',
        konteks: '🧺 Pasar',
        cerita: 'Pedagang jamu menimbang kunyit seberat delapan perseratus kilogram.',
        pertanyaan: 'Tuliskan berat kunyit itu dalam bentuk desimal.',
        jawab: 0.08,
        suffix: 'kg',
        hints: [
          'Tidak ada bagian bulat → tulis 0 di depan koma.',
          '“perseratus” → angka 8 di tempat kedua; tempat persepuluhan diisi 0.',
        ],
        explanation: 'Delapan perseratus = <strong>0,08</strong> kg.',
        reveal: 'Jawaban: <strong>0,08</strong> kg (0 satuan, 0 persepuluhan, 8 perseratusan).',
      },
      {
        type: 'choice',
        konteks: '📏 Tinggi badan',
        cerita: 'Hasil pengukuran tinggi badan Bima adalah 1,52 m.',
        pertanyaan: 'Cara membaca 1,52 m berdasarkan nilai tempat adalah …',
        options: [
          { id: 'o1', label: 'satu dan lima puluh dua perseratus meter' },
          { id: 'o2', label: 'satu dan lima puluh dua persepuluh meter' },
          { id: 'o3', label: 'satu dan lima puluh dua perseribu meter' },
          { id: 'o4', label: 'seratus lima puluh dua meter' },
        ],
        correct: 'o1',
        explanation:
          'Angka terakhir (2) berada di perseratusan → “satu dan lima puluh dua perseratus”.',
      },
      {
        type: 'input',
        konteks: '💊 Resep dokter',
        cerita: 'Dokter menuliskan takaran sirop dua dan lima persepuluh mililiter.',
        pertanyaan: 'Tuliskan takaran itu dalam bentuk desimal.',
        jawab: 2.5,
        suffix: 'mL',
        hints: ['“persepuluh” → satu angka di belakang koma.'],
        explanation: 'Dua dan lima persepuluh = <strong>2,5</strong> mL.',
        reveal: 'Jawaban: <strong>2,5</strong> mL.',
      },
      {
        type: 'choice',
        konteks: '🌧️ Curah hujan',
        cerita: 'Alat penakar hujan sekolah mencatat curah hujan 0,046 m dalam sehari.',
        pertanyaan: 'Nilai angka 4 pada 0,046 adalah …',
        options: [
          { id: 'o1', label: '0,04' },
          { id: 'o2', label: '0,4' },
          { id: 'o3', label: '0,004' },
          { id: 'o4', label: '4' },
        ],
        correct: 'o1',
        explanation: 'Angka 4 berada di tempat perseratusan, jadi nilainya 4 × 0,01 = 0,04.',
      },
      {
        type: 'input',
        konteks: '🛵 Ojek daring',
        cerita:
          'Aplikasi ojek daring mengumumkan jarak perjalanan: tiga dan seratus dua puluh lima perseribu kilometer.',
        pertanyaan: 'Tuliskan jarak itu dalam bentuk desimal.',
        jawab: 3.125,
        suffix: 'km',
        hints: [
          '“perseribu” → tiga angka di belakang koma.',
          'Seratus dua puluh lima tepat mengisi tiga tempat: 1, 2, 5.',
        ],
        explanation: 'Tiga dan seratus dua puluh lima perseribu = <strong>3,125</strong> km.',
        reveal: 'Jawaban: <strong>3,125</strong> km.',
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
    goal: 'Merefleksikan proses penemuan dan tingkat pemahaman.',
    guru: 'Bacalah beberapa refleksi murid (dengan izin) untuk menutup pembelajaran. Catat murid yang memilih “belum yakin” untuk pendampingan berikutnya.',
    pertanyaan: [
      {
        id: 'q1',
        teks: 'Jelaskan dengan kata-katamu sendiri mengapa 1,05 dan 1,5 berbeda.',
        placeholder: 'Keduanya berbeda karena …',
      },
      {
        id: 'q2',
        teks: 'Bagian mana dari model blok atau tabel nilai tempat yang paling membantumu? Mengapa?',
        placeholder: 'Yang paling membantu adalah …',
      },
      {
        id: 'q3',
        teks: 'Tuliskan satu bilangan desimal yang kamu temui di rumah (label kemasan, struk, dsb.) beserta cara membacanya.',
        placeholder: 'Contoh: di kemasan minyak goreng tertulis …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu membaca dan menulis bilangan desimal sekarang?',
    diriOpsi: [
      { id: 'd1', label: '😀 Sangat yakin — aku bisa menjelaskannya kepada teman.' },
      { id: 'd2', label: '🙂 Cukup yakin — kadang masih perlu melihat tabel nilai tempat.' },
      { id: 'd3', label: '🤔 Belum yakin — aku masih bingung dengan angka 0.' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     TAHAP 10 — SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Hebat, kamu sudah menemukannya sendiri!',
    teks: 'Kini kamu bisa membaca dan menulis bilangan desimal berdasarkan nilai tempatnya — seperti pada timbangan, termometer, dan stopwatch di sekitarmu.',
    capaian: [
      'Menentukan nilai tempat persepuluhan, perseratusan, dan perseribuan dengan model blok.',
      'Membaca bilangan desimal dengan cara koma dan cara nilai tempat.',
      'Menulis bilangan desimal dari kata-kata, termasuk angka 0 penjaga tempat.',
      'Menanggapi kekeliruan umum: 3,7 ≠ 3,07 dan 0,5 = 0,50.',
    ],
  },
};
