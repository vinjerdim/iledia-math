'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Pangkat Nol & Pangkat Negatif
   Fase E (Kelas X) — SMK Rekayasa Perangkat Lunak

   Tujuan Pembelajaran:
   Menggeneralisasi sifat pangkat nol dan pangkat negatif bilangan
   berpangkat bulat, serta menerapkannya untuk menyederhanakan bentuk
   aljabar berpangkat.

   Model pembelajaran: DISCOVERY LEARNING (Penemuan Terbimbing).
   Pemetaan sintaks ke tahap media:

     Sintaks 1 — Stimulation ................ tahap 'stimulasi'
     Sintaks 2 — Problem statement .......... tahap 'masalah'
     Sintaks 3 — Data collection ............ tahap 'koleksi'
     Sintaks 4 — Data processing ............ tahap 'olah'
     Sintaks 5 — Verification ............... tahap 'verifikasi'
     Sintaks 6 — Generalization ............. tahap 'generalisasi'
     Penerapan & penutup .................... 'terapkan', 'refleksi', 'selesai'

   Rangkaian aktivitas (± 2 × 45 menit, murid berpasangan):
     1. Stimulasi     (7')  — "Konsol JavaScript Raka": 2 ** 0 → 1 dan
                              2 ** -3 → 0.125. Tangga pangkat 2 dengan
                              anak tangga yang masih '?'. Murid MENDUGA
                              alasan 2⁰ = 1 (tidak dinilai).
     2. Masalah       (5')  — memilih pertanyaan inti & menulis hipotesis.
     3. Data          (20') — A: melengkapi tangga pangkat basis 2, 3, 10
                              dari eksponen positif turun ke negatif
                              (pola ÷ basis); B: jalur sifat pembagian —
                              hitung aᵐ : aⁿ sebagai nilai lalu sebagai
                              pangkat (m = n dan m < n); C: pilah
                              pernyataan dari data.
     4. Olah data     (15') — pertanyaan penuntun (pola ÷ a, a⁰, a⁻ⁿ,
                              syarat a ≠ 0); pola diuji pada basis baru
                              (5, −2, 1/2); kartu rumus.
     5. Pembuktian    (15') — lab uji sifat pangkat nol & negatif
                              (kedua ruas dihitung dari pangkat positif)
                              + mencari contoh penyangkal dua dugaan
                              teman; kalkulator pangkat berdiagnosa;
                              membuktikan dugaan awal; memilah miskonsepsi.
     6. Simpulan      (7')  — menyusun kesimpulan dari bank kalimat acak.
     7. Uji terap     (15') — enam "kasus uji" fungsi sederhanakan()
                              Raka: isi koefisien & eksponen hasil
                              (diagnosa miskonsepsi), lalu pilih bentuk
                              dengan eksponen positif.
     8. Refleksi      (5')  — refleksi tertulis & penilaian diri.

   Metadata `cek` pada setiap langkah isian dipakai tes untuk memeriksa
   kunci jawaban secara numerik dengan Math.pow (bebas dari sifat yang
   sedang dipelajari):
     { jenis: 'nilai', a, n }            jawab = aⁿ   (a boleh {num, den})
     { jenis: 'nilaiBagi', a, m, n }     jawab = aᵐ ÷ aⁿ (m, n ≥ 1)
     { jenis: 'eksponenBagi', m, n }     jawab = m − n
     { jenis: 'kebalikan', a, n }        jawab = 1 ÷ aⁿ
   Soal uji terap memakai pohon ekspresi monomial (shared/engine.js
   seksi 39); kuncinya dihitung hitungEkspresiMonomial() dan tes
   memverifikasinya dengan evaluasi numerik.

   Catatan: seluruh daftar pilihan jawaban di berkas ini ditulis dalam
   urutan "wajar". Pengacakan dilakukan app.js memakai
   ensureShuffledOrder()/ensureSortStates()/shuffleArray() dari
   shared/engine.js, satu kali saat state disiapkan, sehingga tiap murid
   (dan tiap Reset) mendapat urutan berbeda.
   ============================================================ */

var DL = 'Discovery Learning';

/* Opsi bentuk eksponen positif: label diturunkan dari monomialnya. */
function opsiMono(id, koef, pangkat) {
  var m = monomial(koef, pangkat);
  return { id: id, koef: koef, pangkat: pangkat, label: formatMonomial(m, { positif: true }) };
}

var DATA = {
  kasus: {
    nama: 'Raka',
  },

  /* ----------------------------------------------------------
     TAHAP 1 — STIMULASI
     Dugaan TIDAK dinilai; diuji sendiri pada tahap Pembuktian.
     ---------------------------------------------------------- */
  stimulasi: {
    kicker: 'Tahap 1 · Stimulasi',
    syntax: DL + ' · Sintaks 1',
    goal: 'Mengamati hasil 2 ** 0 dan 2 ** -3 di konsol JavaScript lalu menduga mengapa 2⁰ bernilai 1.',
    guru: 'Tayangkan konsol (atau jalankan langsung di DevTools peramban). Tanyakan: "Bukankah 2 dikali 0 kali seharusnya 0? Kenapa JavaScript menjawab 1?" Tampung semua dugaan tanpa dikoreksi — murid akan mengujinya sendiri.',
    judul: 'Konsol JavaScript Raka',
    cerita:
      'Raka sedang membuat fungsi penghitung ukuran berkas. Ia mengetik beberapa perintah pangkat di konsol peramban. Hasil 2 ** 3, 2 ** 2, dan 2 ** 1 wajar. Namun, 2 ** 0 menghasilkan 1 dan 2 ** -3 menghasilkan 0.125. Raka mengira konsolnya salah hitung.',
    konsol: [
      { kode: '2 ** 3', hasil: '8', a: 2, n: 3 },
      { kode: '2 ** 2', hasil: '4', a: 2, n: 2 },
      { kode: '2 ** 1', hasil: '2', a: 2, n: 1 },
      { kode: '2 ** 0', hasil: '1', a: 2, n: 0, sorot: true },
      { kode: '2 ** -3', hasil: '0.125', a: 2, n: -3, sorot: true },
    ],
    aturan:
      'Di JavaScript, a ** n berarti aⁿ. Konsol tidak pernah salah hitung — pasti ada polanya.',
    tangga: { a: 2, dari: 3, sampai: -3, diketahui: [3, 2, 1, 0, -3] },
    pertanyaan: 'Dugaanmu: mengapa 2 ** 0 menghasilkan 1, bukan 0?',
    opsi: [
      {
        id: 'o1',
        label: 'Karena polanya: setiap eksponen turun 1, nilainya dibagi 2, jadi 2⁰ = 2 : 2 = 1.',
      },
      { id: 'o2', label: 'Karena JavaScript punya bug pada eksponen nol.' },
      { id: 'o3', label: 'Karena 2 × 0 = 0, lalu hasilnya ditambah 1.' },
      { id: 'o4', label: 'Karena bilangan apa pun yang dipangkatkan hasilnya selalu 1.' },
    ],
    alasanLabel: 'Lalu, menurutmu mengapa 2 ** -3 menghasilkan 0.125?',
    alasanPlaceholder: 'Contoh: 0.125 itu sama dengan 1/8, mungkin karena …',
    catatan:
      'Belum ada jawaban benar atau salah di sini. Simpan dugaanmu — nanti kamu sendiri yang akan membuktikannya.',
    nextLabel: 'Simpan Dugaan & Lanjut →',
  },

  /* ----------------------------------------------------------
     TAHAP 2 — IDENTIFIKASI MASALAH
     ---------------------------------------------------------- */
  masalah: {
    kicker: 'Tahap 2 · Identifikasi Masalah',
    syntax: DL + ' · Sintaks 2',
    goal: 'Merumuskan pertanyaan inti tentang arti pangkat nol dan pangkat negatif.',
    guru: 'Arahkan murid agar pertanyaannya bersifat umum: berlaku untuk basis apa pun, bukan hanya 2. Tulis beberapa hipotesis murid di papan untuk diuji nanti.',
    pengantar:
      'Pada pertemuan lalu, pangkat berarti perkalian berulang: 2³ = 2 × 2 × 2. Tetapi "2 dikalikan sebanyak 0 kali" atau "sebanyak −3 kali" tidak masuk akal. Raka butuh arti baru yang tetap konsisten dengan sifat-sifat yang sudah ia temukan.',
    pertanyaan: 'Pertanyaan mana yang paling tepat untuk kita selidiki?',
    opsi: [
      {
        id: 'pola',
        label:
          'Berapa nilai a⁰ dan a⁻ⁿ agar pola tangga pangkat dan sifat pembagian aᵐ : aⁿ = aᵐ⁻ⁿ tetap berlaku untuk semua basis a?',
      },
      { id: 'hitung', label: 'Berapa hasil 2 ** 10 di konsol?' },
      { id: 'bug', label: 'Bagaimana cara melaporkan bug ke pembuat JavaScript?' },
      { id: 'desimal', label: 'Mengapa konsol menulis 0.125 memakai titik, bukan koma?' },
    ],
    correct: 'pola',
    umpan: {
      pola: '<strong>Tepat.</strong> Kita akan mengumpulkan data dari tangga pangkat dan sifat pembagian, mencari polanya, lalu menuliskan aturan umum untuk a⁰ dan a⁻ⁿ.',
      hitung:
        '2 ** 10 = 1024 hanya menjawab satu soal dengan eksponen positif. Pertanyaan ini tidak menjelaskan eksponen nol atau negatif. Coba pilih lagi.',
      bug: 'Konsolnya tidak salah — hasil yang sama muncul di kalkulator ilmiah. Yang perlu kita cari adalah <em>pola</em> di baliknya. Coba pilih lagi.',
      desimal:
        'Titik desimal hanyalah cara penulisan di pemrograman. Pertanyaan ini tidak membahas arti pangkat nol dan negatif. Coba pilih lagi.',
    },
    hipotesisLabel: 'Tulis hipotesismu: menurutmu berapa nilai a⁰, dan apa arti a⁻ⁿ?',
    hipotesisPlaceholder: 'Contoh: mungkin a⁰ = … karena …, dan a⁻ⁿ = …',
    nextLabel: 'Mulai Mengumpulkan Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 3 — PENGUMPULAN DATA
     ---------------------------------------------------------- */
  koleksi: {
    kicker: 'Tahap 3 · Pengumpulan Data',
    syntax: DL + ' · Sintaks 3',
    goal: 'Mengumpulkan data nilai pangkat nol dan negatif dari pola tangga pangkat dan sifat pembagian.',
    guru: 'Murid bekerja berpasangan. Pastikan murid MENGHITUNG setiap anak tangga dari anak tangga di atasnya (dibagi basis), bukan menebak. Isian boleh berupa pecahan (1/8) atau desimal (0,125).',
    judulA: 'A. Tangga Pangkat',
    instruksiA:
      'Lengkapi setiap tangga. Mulailah dari anak tangga teratas; setiap turun satu anak tangga, eksponen berkurang 1. Tulis nilai sebagai bilangan bulat atau pecahan, mis. 1/9.',
    tangga: [
      { id: 't2', a: 2, dari: 4, sampai: -3, diketahui: [4, 3] },
      { id: 't3', a: 3, dari: 4, sampai: -3, diketahui: [4] },
      { id: 't10', a: 10, dari: 3, sampai: -3, diketahui: [3] },
    ],
    hintsTangga: [
      'Bandingkan 2⁴ = 16 dan 2³ = 8. Dari 16 ke 8, nilainya dibagi berapa?',
      'Terus bagi dengan basisnya. Setelah 2¹ = 2, anak tangga berikutnya 2 : 2 = …, lalu 1 : 2 = 1/2.',
      'Untuk basis 10: 10¹ = 10, 10⁰ = 10 : 10 = 1, 10⁻¹ = 1 : 10 = 1/10 = 0,1.',
    ],
    judulB: 'B. Jalur Sifat Pembagian',
    instruksiB:
      'Pertemuan lalu kamu menemukan aᵐ : aⁿ = aᵐ⁻ⁿ untuk m > n. Sekarang coba m = n dan m < n. Hitung dulu nilainya dengan pembagian biasa, lalu tulis hasilnya sebagai pangkat memakai sifat pembagian.',
    langkah: [
      {
        label: '2³ : 2³ = 8 : 8 = …',
        jawab: 1,
        cek: { jenis: 'nilaiBagi', a: 2, m: 3, n: 3 },
        hints: ['Bilangan (selain 0) dibagi dirinya sendiri hasilnya …'],
        temuan: 'Nilainya 1.',
      },
      {
        label: 'Dengan sifat pembagian, 2³ : 2³ = 2<sup>…</sup>. Tulis eksponennya.',
        jawab: 0,
        allowNegative: true,
        cek: { jenis: 'eksponenBagi', m: 3, n: 3 },
        hints: ['Eksponennya m − n = 3 − 3.'],
        temuan:
          'Jadi 2³ : 2³ = 2⁰, padahal nilainya 1. Agar sifat pembagian tetap berlaku, 2⁰ haruslah 1.',
      },
      {
        label: '2² : 2⁵ = 4 : 32 = … (tulis sebagai pecahan paling sederhana)',
        jawab: 1 / 8,
        rational: true,
        cek: { jenis: 'nilaiBagi', a: 2, m: 2, n: 5 },
        hints: ['4/32 disederhanakan dengan membagi pembilang dan penyebut dengan 4.'],
        temuan: 'Nilainya 1/8, dan 8 = 2³.',
      },
      {
        label: 'Dengan sifat pembagian, 2² : 2⁵ = 2<sup>…</sup>. Tulis eksponennya.',
        jawab: -3,
        allowNegative: true,
        cek: { jenis: 'eksponenBagi', m: 2, n: 5 },
        hints: ['Eksponennya m − n = 2 − 5. Hasilnya bilangan negatif.'],
        temuan:
          'Jadi 2² : 2⁵ = 2⁻³, padahal nilainya 1/8 = 1/2³. Agar sifat pembagian tetap berlaku, 2⁻³ haruslah 1/2³.',
      },
      {
        label: '10¹ : 10³ = 10 : 1.000 = … (pecahan atau desimal)',
        jawab: 1 / 100,
        rational: true,
        cek: { jenis: 'nilaiBagi', a: 10, m: 1, n: 3 },
        hints: ['10/1000 disederhanakan menjadi 1/…'],
        temuan: 'Nilainya 1/100 = 0,01, dan 100 = 10².',
      },
      {
        label: 'Dengan sifat pembagian, 10¹ : 10³ = 10<sup>…</sup>. Tulis eksponennya.',
        jawab: -2,
        allowNegative: true,
        cek: { jenis: 'eksponenBagi', m: 1, n: 3 },
        hints: ['Eksponennya 1 − 3.'],
        temuan: 'Jadi 10⁻² = 1/10² = 0,01 — cocok dengan tangga pangkat 10.',
      },
    ],
    judulC: 'C. Pilah Pernyataan dari Data',
    instruksiC:
      'Berdasarkan tangga dan jalur pembagian yang sudah kamu isi, pilah setiap pernyataan.',
    opsiPilah: [
      { id: 'sesuai', label: 'Sesuai data' },
      { id: 'tidak', label: 'Tidak sesuai data' },
    ],
    pilah: [
      {
        id: 'p1',
        teks: 'Pada ketiga tangga, anak tangga berpangkat 0 selalu bernilai 1.',
        correct: 'sesuai',
        explanation: '2⁰ = 1, 3⁰ = 1, dan 10⁰ = 1.',
      },
      {
        id: 'p2',
        teks: 'Nilai 3⁻² adalah −9.',
        correct: 'tidak',
        explanation: 'Dari 3⁰ = 1, bagi 3 dua kali: 1/3 lalu 1/9. Jadi 3⁻² = 1/9, bukan −9.',
      },
      {
        id: 'p3',
        teks: '2⁻³ sama dengan kebalikan dari 2³, yaitu 1/8.',
        correct: 'sesuai',
        explanation: '2³ = 8 dan 2⁻³ = 1/8.',
      },
      {
        id: 'p4',
        teks: 'Setiap turun satu anak tangga, nilainya dikurangi 1.',
        correct: 'tidak',
        explanation: 'Nilainya dibagi basis: 16 → 8 → 4, bukan 16 → 15 → 14.',
      },
      {
        id: 'p5',
        teks: 'Pangkat negatif menghasilkan bilangan antara 0 dan 1 bila basisnya lebih dari 1.',
        correct: 'sesuai',
        explanation: '2⁻¹ = 1/2, 3⁻² = 1/9, 10⁻³ = 1/1000 — semuanya positif dan kurang dari 1.',
      },
      {
        id: 'p6',
        teks: '2³ : 2³ menghasilkan 0 karena 3 − 3 = 0.',
        correct: 'tidak',
        explanation: 'Eksponennya memang 0, tetapi nilainya 8 : 8 = 1. Jadi 2⁰ = 1, bukan 0.',
      },
    ],
    nextLabel: 'Olah Data →',
  },

  /* ----------------------------------------------------------
     TAHAP 4 — OLAH DATA
     ---------------------------------------------------------- */
  olah: {
    kicker: 'Tahap 4 · Olah Data',
    syntax: DL + ' · Sintaks 4',
    goal: 'Menemukan hubungan a⁰ dengan 1 dan a⁻ⁿ dengan 1/aⁿ, lalu mengujinya pada basis baru.',
    guru: 'Minta setiap pasangan menjelaskan jawabannya dengan menunjuk data di tangga pangkat. Pertanyaan tentang a ≠ 0 penting: ajak murid mencoba mengisi tangga pangkat 0.',
    instruksi:
      'Perhatikan kembali tangga pangkat yang sudah kamu lengkapi. Jawab pertanyaan penuntun satu per satu.',
    pertanyaan: [
      {
        id: 'q1',
        tanya: 'Setiap turun satu anak tangga (eksponen berkurang 1), nilainya …',
        opsi: [
          { id: 'bagi', label: 'dibagi basis a' },
          { id: 'kurang1', label: 'dikurangi 1' },
          { id: 'kurangA', label: 'dikurangi basis a' },
          { id: 'bagi2', label: 'selalu dibagi 2 untuk basis apa pun' },
        ],
        correct: 'bagi',
        umpan: {
          bagi: '<strong>Tepat.</strong> 3⁴ = 81 → 27 → 9 → 3: setiap langkah dibagi 3.',
          kurang1: 'Periksa tangga basis 3: 81 → 27 tidak berkurang 1.',
          kurangA:
            'Periksa tangga basis 2: 16 → 8 → 4 → 2 → 1 → 1/2. Dari 1 ke 1/2 bukan dikurangi 2.',
          bagi2: 'Pada tangga basis 10, nilainya dibagi 10, bukan 2.',
        },
      },
      {
        id: 'q2',
        tanya: 'Pada datamu, berapa nilai 2⁰, 3⁰, dan 10⁰?',
        opsi: [
          { id: 'satu', label: 'Semuanya 1' },
          { id: 'nol', label: 'Semuanya 0' },
          { id: 'basis', label: 'Sama dengan basisnya: 2, 3, dan 10' },
          { id: 'beda', label: 'Berbeda-beda, tidak ada polanya' },
        ],
        correct: 'satu',
        umpan: {
          satu: '<strong>Tepat.</strong> a¹ = a, lalu dibagi a sekali lagi menjadi a : a = 1.',
          nol: 'Membagi tidak pernah menghasilkan 0 dari bilangan positif. 2¹ : 2 = …?',
          basis: 'a adalah nilai a¹. Turun satu anak tangga lagi: a : a = …?',
          beda: 'Lihat baris berpangkat 0 di ketiga tangga. Nilainya sama.',
        },
      },
      {
        id: 'q3',
        tanya: 'Bandingkan 2⁻³ dengan 2³ = 8, dan 3⁻² dengan 3² = 9. Secara umum a⁻ⁿ sama dengan …',
        opsi: [
          { id: 'kebalikan', label: '1/aⁿ (kebalikan dari aⁿ)' },
          { id: 'negatif', label: '−aⁿ' },
          { id: 'kali', label: '−n × a' },
          { id: 'pecahanNeg', label: '−1/aⁿ' },
        ],
        correct: 'kebalikan',
        umpan: {
          kebalikan: '<strong>Tepat.</strong> 2⁻³ = 1/8 = 1/2³ dan 3⁻² = 1/9 = 1/3².',
          negatif: 'Datamu menunjukkan 2⁻³ = 1/8 yang positif, bukan −8.',
          kali: '−3 × 2 = −6, padahal 2⁻³ = 1/8.',
          pecahanNeg:
            'Bentuk pecahannya benar, tetapi tandanya tidak. Membagi bilangan positif tetap menghasilkan bilangan positif.',
        },
      },
      {
        id: 'q4',
        tanya: 'Mengapa sifat ini hanya berlaku untuk a ≠ 0?',
        opsi: [
          { id: 'bagiNol', label: 'Karena 0⁰ = 0ⁿ : 0ⁿ dan 0⁻ⁿ = 1/0ⁿ memuat pembagian dengan 0' },
          { id: 'kecil', label: 'Karena 0 terlalu kecil untuk dipangkatkan' },
          { id: 'aturan', label: 'Karena memang aturannya begitu, tanpa alasan' },
          { id: 'hasilNol', label: 'Karena 0 berpangkat berapa pun hasilnya 0' },
        ],
        correct: 'bagiNol',
        umpan: {
          bagiNol:
            '<strong>Tepat.</strong> Tangga pangkat 0 macet: 0¹ = 0, lalu 0 : 0 tidak dapat dihitung.',
          kecil: '0³ = 0 dapat dihitung. Masalahnya muncul saat kita perlu membagi dengan 0.',
          aturan: 'Ada alasannya. Coba lengkapi tangga pangkat 0: 0² = 0, 0¹ = 0, 0⁰ = 0 : 0 = …?',
          hasilNol: '0³ = 0 memang benar, tetapi 0⁰ dan 0⁻¹ memerlukan pembagian dengan 0.',
        },
      },
    ],
    judulLangkah: 'Uji pola pada basis baru',
    instruksiLangkah:
      'Pola yang baik harus berlaku untuk basis apa pun. Hitung nilai berikut memakai pola yang kamu temukan.',
    langkah: [
      {
        label: '5⁰ = …',
        jawab: 1,
        cek: { jenis: 'nilai', a: 5, n: 0 },
        hints: ['Bilangan tak nol berpangkat 0 bernilai …'],
        temuan: '5⁰ = 1, sama seperti 2⁰, 3⁰, dan 10⁰.',
      },
      {
        label: '5⁻² = … (tulis sebagai pecahan)',
        jawab: 1 / 25,
        rational: true,
        cek: { jenis: 'nilai', a: 5, n: -2 },
        hints: ['5⁻² = 1/5². Berapa 5²?'],
        temuan: '5⁻² = 1/5² = 1/25.',
      },
      {
        label: '(−2)⁻³ = … (tulis sebagai pecahan)',
        jawab: -1 / 8,
        rational: true,
        allowNegative: true,
        cek: { jenis: 'nilai', a: -2, n: -3 },
        hints: ['(−2)⁻³ = 1/(−2)³.', '(−2)³ = (−2) × (−2) × (−2) = −8, jadi hasilnya 1/(−8).'],
        temuan:
          '(−2)⁻³ = 1/(−8) = −1/8. Tanda negatif di sini berasal dari basis yang negatif, bukan dari eksponennya.',
      },
      {
        label: '(1/2)⁻³ = …',
        jawab: 8,
        rational: true,
        cek: { jenis: 'nilai', a: { num: 1, den: 2 }, n: -3 },
        hints: [
          '(1/2)⁻³ = 1/(1/2)³ = 1/(1/8).',
          'Membagi 1 dengan 1/8 sama dengan mengalikan dengan 8.',
        ],
        temuan: '(1/2)⁻³ = 2³ = 8. Pangkat negatif membalik pecahan.',
      },
      {
        label: '1 : 3⁻² = …',
        jawab: 9,
        rational: true,
        cek: { jenis: 'kebalikan', a: 3, n: -2 },
        hints: ['3⁻² = 1/9. Jadi 1 : (1/9) = …'],
        temuan:
          '1/3⁻² = 3² = 9. Faktor berpangkat negatif di penyebut pindah ke pembilang dengan eksponen positif.',
      },
    ],
    rumus: [
      { label: 'Pangkat nol', teks: 'a⁰ = 1, a ≠ 0' },
      { label: 'Pangkat negatif', teks: 'a⁻ⁿ = 1/aⁿ, a ≠ 0' },
      { label: 'Kebalikannya', teks: '1/a⁻ⁿ = aⁿ, a ≠ 0' },
    ],
    nextLabel: 'Buktikan Polanya →',
  },

  /* ----------------------------------------------------------
     TAHAP 5 — PEMBUKTIAN
     ---------------------------------------------------------- */
  verifikasi: {
    kicker: 'Tahap 5 · Pembuktian',
    syntax: DL + ' · Sintaks 5',
    goal: 'Membuktikan a⁰ = 1 dan a⁻ⁿ = 1/aⁿ dengan banyak uji, menyangkal dugaan keliru, dan memeriksa dugaan awal.',
    guru: 'Tekankan bahwa di lab, ruas kiri dihitung HANYA dengan pangkat positif lalu dibagi. Minta murid mencoba a = 0 dan a negatif, lalu membacakan contoh penyangkal yang mereka temukan.',
    judulA: 'A. Lab Uji Sifat',
    instruksiA:
      'Ruas kiri dihitung dengan pembagian pangkat positif; ruas kanan memakai pola temuanmu. Pilih sifat, atur a dan n, lalu catat. Buktikan kedua sifat (minimal 3 uji masing-masing, coba juga basis negatif) dan temukan contoh penyangkal untuk dugaan Dimas dan Sinta. Coba juga a = 0 — apa yang terjadi?',
    lab: {
      sifat: ['nol', 'negatif', 'salahNol', 'salahNegatif'],
      nama: {
        nol: 'Pangkat nol',
        negatif: 'Pangkat negatif',
        salahNol: 'Dugaan Dimas',
        salahNegatif: 'Dugaan Sinta',
      },
      batasA: [-5, 5],
      batasE: [1, 5],
      syarat: [
        { sifat: 'nol', min: 3 },
        { sifat: 'negatif', min: 3 },
        { sifat: 'salahNol', min: 1, sangkal: true },
        { sifat: 'salahNegatif', min: 1, sangkal: true },
      ],
    },
    judulB: 'B. Kalkulator Pangkat Berdiagnosa',
    instruksiB:
      'Hitung nilai setiap bilangan berpangkat. Jika belum tepat, kalkulator akan memberi tahu kemungkinan kekeliruanmu.',
    kalkulator: [
      { id: 'k1', a: 3, n: -2 },
      { id: 'k2', a: 7, n: 0 },
      { id: 'k3', a: -2, n: -3 },
      { id: 'k4', a: 10, n: -4 },
      { id: 'k5', a: -5, n: 0 },
    ],
    judulC: 'C. Periksa Dugaan Awalmu',
    dugaanBenar: 'o1',
    judulD: 'D. Pilah Miskonsepsi',
    instruksiD:
      'Teman-teman Raka menulis pernyataan berikut. Pilah mana yang benar dan mana yang keliru.',
    opsiPilah: [
      { id: 'benar', label: 'Benar' },
      { id: 'keliru', label: 'Keliru' },
    ],
    pilah: [
      {
        id: 'm1',
        teks: '5⁰ = 0',
        correct: 'keliru',
        explanation: '5⁰ = 5 : 5 = 1. Eksponen 0 tidak membuat nilainya 0.',
      },
      {
        id: 'm2',
        teks: '(−4)⁰ = 1',
        correct: 'benar',
        explanation: 'Basis negatif pun, asal tidak 0, berpangkat 0 bernilai 1.',
      },
      {
        id: 'm3',
        teks: '3⁻² = −9',
        correct: 'keliru',
        explanation: '3⁻² = 1/3² = 1/9. Pangkat negatif berarti kebalikan, bukan bilangan negatif.',
      },
      {
        id: 'm4',
        teks: '0⁰ = 1',
        correct: 'keliru',
        explanation:
          '0⁰ = 0ⁿ : 0ⁿ memuat pembagian dengan 0, jadi tak terdefinisi dalam materi ini.',
      },
      {
        id: 'm5',
        teks: '1/2⁻³ = 8',
        correct: 'benar',
        explanation: '2⁻³ = 1/8, sehingga 1 : (1/8) = 8 = 2³.',
      },
      {
        id: 'm6',
        teks: '4x⁻² = 1/(4x²)',
        correct: 'keliru',
        explanation: 'Eksponen −2 hanya milik x. Jadi 4x⁻² = 4/x², koefisien 4 tetap di pembilang.',
      },
    ],
    nextLabel: 'Tarik Kesimpulan →',
  },

  /* ----------------------------------------------------------
     TAHAP 6 — MENARIK KESIMPULAN
     ---------------------------------------------------------- */
  generalisasi: {
    kicker: 'Tahap 6 · Menarik Kesimpulan',
    syntax: DL + ' · Sintaks 6',
    goal: 'Merumuskan sifat pangkat nol dan pangkat negatif secara umum dengan kata-kata sendiri.',
    guru: 'Setelah murid menyusun kalimat, minta satu-dua pasangan membacakan kesimpulannya dan mengaitkannya dengan data (tangga pangkat, lab, jalur pembagian).',
    instruksi:
      'Lengkapi setiap kalimat dengan potongan yang tepat. Hati-hati: ada potongan pengecoh yang tidak dipakai.',
    selectPlaceholder: '— pilih lanjutan kalimat —',
    kalimat: [
      { id: 'g1', awal: 'Untuk setiap bilangan a ≠ 0, nilai a⁰', correct: 'b1' },
      { id: 'g2', awal: 'Untuk a ≠ 0 dan n bilangan bulat positif, a⁻ⁿ', correct: 'b2' },
      { id: 'g3', awal: 'Sebaliknya, bentuk 1/a⁻ⁿ', correct: 'b3' },
      { id: 'g4', awal: 'Syarat a ≠ 0 diperlukan karena', correct: 'b4' },
      { id: 'g5', awal: 'Untuk menyederhanakan bentuk aljabar berpangkat,', correct: 'b5' },
    ],
    bank: [
      { id: 'b1', teks: 'sama dengan 1, karena aⁿ : aⁿ = a⁰ dan juga bernilai 1.' },
      { id: 'b2', teks: 'sama dengan 1/aⁿ, yaitu kebalikan dari aⁿ.' },
      { id: 'b3', teks: 'sama dengan aⁿ; faktor berpangkat negatif pindah ke pembilang.' },
      { id: 'b4', teks: '0⁰ dan 0⁻ⁿ memuat pembagian dengan nol sehingga tak terdefinisi.' },
      {
        id: 'b5',
        teks: 'gunakan sifat operasi pangkat, lalu tulis hasilnya dengan eksponen positif.',
      },
      { id: 'd1', teks: 'sama dengan 0, karena tidak ada faktor yang dikalikan.' },
      { id: 'd2', teks: 'sama dengan −aⁿ, karena eksponennya negatif.' },
      { id: 'd3', teks: 'sama dengan a, karena basisnya tidak berubah.' },
      { id: 'd4', teks: 'bilangan berpangkat negatif selalu bernilai negatif.' },
    ],
    rangkuman: [
      'a⁰ = 1 untuk setiap a ≠ 0 — didukung pola tangga (a : a = 1) dan sifat pembagian (aⁿ : aⁿ).',
      'a⁻ⁿ = 1/aⁿ untuk a ≠ 0 — pangkat negatif berarti kebalikan, bukan bilangan negatif.',
      '1/a⁻ⁿ = aⁿ — faktor berpangkat negatif boleh dipindah antara pembilang dan penyebut dengan mengubah tanda eksponennya.',
      'Sifat aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ : aⁿ = aᵐ⁻ⁿ, dan (aᵐ)ⁿ = aᵐˣⁿ tetap berlaku untuk semua eksponen bulat.',
    ],
    nextLabel: 'Terapkan Temuanmu →',
  },

  /* ----------------------------------------------------------
     TAHAP 7 — UJI TERAP: MENYEDERHANAKAN BENTUK ALJABAR
     Setiap soal: (1) isi koefisien & eksponen hasil (boleh negatif),
     (2) pilih bentuk dengan eksponen positif.
     ---------------------------------------------------------- */
  terapkan: {
    kicker: 'Tahap 7 · Uji Terap',
    syntax: 'Penerapan konsep',
    goal: 'Menerapkan sifat pangkat nol dan negatif untuk menyederhanakan bentuk aljabar berpangkat.',
    guru: 'Biarkan murid mengerjakan mandiri. Perhatikan pesan diagnosa yang sering muncul (mis. koefisien ikut dibuat negatif) untuk dibahas bersama di akhir.',
    instruksi:
      'Raka menulis fungsi sederhanakan() dan butuh kunci jawaban untuk enam kasus uji. Untuk setiap kasus: (1) tulis hasilnya sebagai koefisien × variabel berpangkat (eksponen boleh 0 atau negatif), lalu (2) pilih bentuk akhirnya dengan eksponen positif.',
    labelIsian: 'Langkah 1 — Isi koefisien dan eksponen setiap variabel:',
    labelPilih: 'Langkah 2 — Bentuk akhir dengan eksponen positif adalah …',
    soal: [
      {
        id: 's1',
        ekspresi: {
          op: 'kali',
          a: { koef: 1, pangkat: { x: -3 } },
          b: { koef: 1, pangkat: { x: 5, y: -2 } },
        },
        vars: ['x', 'y'],
        hints: [
          'Pada perkalian, eksponen variabel yang sama dijumlahkan: x⁻³ × x⁵ = x⁻³⁺⁵.',
          'y hanya muncul sekali, jadi eksponennya tetap −2. Koefisiennya 1 × 1.',
        ],
        opsi: [
          opsiMono('a', 1, { x: 2, y: -2 }),
          opsiMono('b', 1, { x: 2, y: 2 }),
          opsiMono('c', 1, { x: -2, y: -2 }),
          opsiMono('d', 1, { x: 8, y: -2 }),
        ],
        correct: 'a',
        explanation: 'x⁻³ × x⁵y⁻² = x²y⁻² = x²/y².',
      },
      {
        id: 's2',
        ekspresi: {
          op: 'bagi',
          a: { koef: 6, pangkat: { x: -2, y: 3 } },
          b: { koef: 2, pangkat: { x: 3, y: -1 } },
        },
        vars: ['x', 'y'],
        hints: [
          'Koefisien: 6 : 2. Eksponen dikurangi: x⁻²⁻³ dan y³⁻⁽⁻¹⁾.',
          'Mengurangi −1 sama dengan menambah 1: 3 − (−1) = 4.',
        ],
        opsi: [
          opsiMono('a', 3, { x: -5, y: 4 }),
          opsiMono('b', 3, { x: 5, y: 4 }),
          opsiMono('c', 3, { x: -1, y: 4 }),
          opsiMono('d', { num: 1, den: 3 }, { x: -5, y: 4 }),
        ],
        correct: 'a',
        explanation: '(6x⁻²y³) : (2x³y⁻¹) = 3x⁻⁵y⁴ = 3y⁴/x⁵.',
      },
      {
        id: 's3',
        ekspresi: { op: 'pangkat', a: { koef: 2, pangkat: { a: -1, b: 1 } }, k: -2 },
        vars: ['a', 'b'],
        hints: [
          'Setiap faktor dipangkatkan −2, termasuk koefisien 2: 2⁻² × a⁽⁻¹⁾ˣ⁽⁻²⁾ × b¹ˣ⁽⁻²⁾.',
          '2⁻² = 1/4, bukan −4. Tulis koefisien sebagai 1/4.',
        ],
        opsi: [
          opsiMono('a', { num: 1, den: 4 }, { a: 2, b: -2 }),
          opsiMono('b', 4, { a: 2, b: -2 }),
          opsiMono('c', { num: 1, den: 4 }, { a: -2, b: 2 }),
          opsiMono('d', -4, { a: 2, b: -2 }),
        ],
        correct: 'a',
        explanation: '(2a⁻¹b)⁻² = 2⁻²a²b⁻² = (1/4)a²b⁻² = a²/(4b²).',
      },
      {
        id: 's4',
        ekspresi: {
          op: 'kali',
          a: { koef: 5, pangkat: { p: 0, q: -3 } },
          b: { koef: 2, pangkat: { q: 5 } },
        },
        vars: ['p', 'q'],
        hints: ['p⁰ = 1, jadi eksponen p adalah 0.', 'Koefisien 5 × 2; eksponen q: −3 + 5.'],
        opsi: [
          opsiMono('a', 10, { q: 2 }),
          opsiMono('b', 10, { p: 1, q: 2 }),
          opsiMono('c', 7, { q: 2 }),
          opsiMono('d', 10, { q: -2 }),
        ],
        correct: 'a',
        explanation: '5p⁰q⁻³ × 2q⁵ = 10 × 1 × q² = 10q².',
      },
      {
        id: 's5',
        ekspresi: {
          op: 'bagi',
          a: { op: 'pangkat', a: { koef: 3, pangkat: { m: 2, n: -1 } }, k: 2 },
          b: { koef: 9, pangkat: { m: -2, n: 1 } },
        },
        vars: ['m', 'n'],
        hints: ['Kerjakan pangkat dulu: (3m²n⁻¹)² = 9m⁴n⁻².', 'Lalu bagi: 9 : 9, m⁴⁻⁽⁻²⁾, n⁻²⁻¹.'],
        opsi: [
          opsiMono('a', 1, { m: 6, n: -3 }),
          opsiMono('b', 1, { m: 2, n: -3 }),
          opsiMono('c', 1, { m: 6, n: -1 }),
          opsiMono('d', 1, { m: -6, n: 3 }),
        ],
        correct: 'a',
        explanation: '(3m²n⁻¹)² : (9m⁻²n) = 9m⁴n⁻² : 9m⁻²n = m⁶n⁻³ = m⁶/n³.',
      },
      {
        id: 's6',
        ekspresi: {
          op: 'bagi',
          a: { op: 'pangkat', a: { koef: 1, pangkat: { x: -2, y: 1 } }, k: 3 },
          b: { koef: -1, pangkat: { x: -4 } },
        },
        vars: ['x', 'y'],
        hints: [
          '(x⁻²y)³ = x⁻⁶y³. Koefisien pembaginya −1.',
          'x⁻⁶ : x⁻⁴ = x⁻⁶⁻⁽⁻⁴⁾ = x⁻². Koefisien 1 : (−1) = −1.',
        ],
        opsi: [
          opsiMono('a', -1, { x: -2, y: 3 }),
          opsiMono('b', 1, { x: -2, y: 3 }),
          opsiMono('c', -1, { x: 2, y: 3 }),
          opsiMono('d', -1, { x: -10, y: 3 }),
        ],
        correct: 'a',
        explanation: '(x⁻²y)³ : (−x⁻⁴) = x⁻⁶y³ : (−x⁻⁴) = −x⁻²y³ = −y³/x².',
      },
    ],
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ----------------------------------------------------------
     TAHAP 8 — REFLEKSI
     ---------------------------------------------------------- */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    syntax: 'Refleksi pembelajaran',
    goal: 'Merefleksikan proses menemukan sifat pangkat nol dan pangkat negatif.',
    guru: 'Baca beberapa refleksi secara acak (dengan izin murid) untuk melihat miskonsepsi yang masih tersisa, terutama "pangkat negatif = bilangan negatif".',
    pertanyaan: [
      {
        id: 'r1',
        teks: 'Jelaskan kepada Raka dengan kata-katamu sendiri mengapa 2 ** 0 menghasilkan 1.',
        placeholder: 'Aku menjelaskannya dengan …',
      },
      {
        id: 'r2',
        teks: 'Apa perbedaan 2⁻³ dan −2³? Berikan nilainya masing-masing.',
        placeholder: '2⁻³ = … sedangkan −2³ = …, karena …',
      },
      {
        id: 'r3',
        teks: 'Langkah mana yang paling sering membuatmu keliru saat menyederhanakan bentuk aljabar berpangkat? Bagaimana kamu akan menghindarinya?',
        placeholder: 'Aku sering keliru saat …',
      },
    ],
    diriLabel: 'Seberapa yakin kamu menyederhanakan bentuk aljabar dengan pangkat nol dan negatif?',
    diriOpsi: [
      { id: 'd1', label: '🌱 Masih bingung, perlu dibantu' },
      { id: 'd2', label: '🌿 Mulai paham dengan melihat contoh' },
      { id: 'd3', label: '🌳 Paham dan bisa mengerjakan sendiri' },
      { id: 'd4', label: '🚀 Bisa menjelaskan kepada teman' },
    ],
    nextLabel: 'Simpan & Selesai →',
  },

  /* ----------------------------------------------------------
     SELESAI
     ---------------------------------------------------------- */
  selesai: {
    judul: 'Penemuanmu Tuntas!',
    teks: 'Kamu tidak sekadar menghafal a⁰ = 1 dan a⁻ⁿ = 1/aⁿ — kamu menemukannya dari pola, membuktikannya, dan memakainya untuk menyederhanakan bentuk aljabar.',
    capaian: [
      'Menemukan a⁰ = 1 (a ≠ 0) dari pola tangga pangkat dan sifat pembagian.',
      'Menemukan a⁻ⁿ = 1/aⁿ (a ≠ 0) dan membedakannya dari bilangan negatif.',
      'Menyangkal dugaan keliru a⁰ = 0 dan a⁻ⁿ = −aⁿ dengan contoh penyangkal.',
      'Menyederhanakan bentuk aljabar berpangkat dan menuliskannya dengan eksponen positif.',
    ],
  },
};
