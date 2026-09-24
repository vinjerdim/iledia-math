'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Matematika: Membandingkan & Mengurutkan Pecahan Berpenyebut Berbeda
   Fase D — SMP Kelas 7

   Tujuan Pembelajaran:
   Membandingkan dan mengurutkan pecahan dengan penyebut berbeda.

   Penulisan pecahan di dalam teks memakai token {a/b}, mis. "{3/4}";
   app.js mengubahnya menjadi pecahan bersusun dengan renderFracText()
   dari shared/engine.js.

   Model pembelajaran: COOPERATIVE LEARNING (tipe STAD dengan
   pembagian peran; enam fase menurut Arends). Pemetaan fase ke
   tahap media:

     Fase 1 — Menyampaikan tujuan & memotivasi ..... tahap 'orientasi'
     Fase 2 — Menyajikan informasi ................. tahap 'sajian'
     Fase 3 — Mengorganisasikan murid ke dalam
              kelompok belajar ..................... tahap 'kelompok'
     Fase 4 — Membimbing kelompok bekerja &
              belajar ............................... tahap 'bandingkan' & 'urutkan'
     Fase 5 — Evaluasi (kuis individu) ............. tahap 'kuis'
     Fase 6 — Memberikan penghargaan ............... tahap 'penghargaan'
     Penutup ...................................... 'refleksi', 'selesai'

   Prinsip pembelajaran mendalam:
     • Berkesadaran (mindful) — tujuan & aturan kerja kelompok
       dinyatakan di awal; setiap langkah LKPD menyebut peran yang
       bertugas; murid merefleksikan strategi dan kerja samanya.
     • Bermakna (meaningful) — pecahan dijumpai dalam konteks lomba
       menghias kue, pita, lari pagi, resep, dan botol minum; pita
       pecahan & garis bilangan selalu menyertai perhitungan.
     • Menggembirakan (joyful) — kerja tim dengan peran, papan urutan
       yang bisa diketuk, poin kelompok, dan predikat tim.

   Rangkaian aktivitas (± 2 × 40 menit, kelompok heterogen 4 murid,
   satu perangkat per kelompok; kuis dikerjakan tiap murid):
     1. Orientasi   (7')  — masalah "Lomba Menghias Kue": {2/3}, {3/4},
                            atau {5/8} kue, mana paling luas? Dugaan
                            awal, tujuan, dan aturan kerja kelompok.
     2. Sajian      (15') — guru menyajikan 3 strategi: pita pecahan,
                            menyamakan penyebut (KPK) + kali silang,
                            dan patokan ½; cek cepat tiap strategi;
                            dugaan awal dibuktikan.
     3. Kelompok    (5')  — nama tim, pembagian peran (Pembaca,
                            Penghitung, Pemeriksa, Pelapor), kesepakatan.
     4. Bandingkan  (15') — LKPD kelompok: 5 pasang pecahan; KPK →
                            pecahan senilai → tanda <, >, =.
     5. Urutkan     (13') — LKPD kelompok: 3 kumpulan pecahan diurutkan
                            dengan papan ketuk; pembahasan garis bilangan.
     6. Kuis        (10') — 6 soal individu, tanpa bantuan teman.
     7. Penghargaan (5')  — skor tim (LKPD) + skor individu (kuis) →
                            predikat tim; apresiasi antaranggota.
     8. Refleksi    (5')  — cek pernyataan, refleksi strategi & kerja
                            sama, keyakinan diri.
     9. Selesai           — ringkasan capaian & catatan guru.

   Seluruh pilihan jawaban (dugaan, cek cepat, tanda perbandingan,
   kartu urutan, kuis, pemilahan, refleksi) DIACAK di app.js.
   ============================================================ */

var DATA = {
  /* Peran kerja kelompok (dipakai tahap 3–7). */
  peran: [
    {
      id: 'pembaca',
      ikon: '📖',
      nama: 'Pembaca Soal',
      tugas: 'Membacakan soal dengan lantang dan memastikan semua anggota paham yang ditanyakan.',
    },
    {
      id: 'penghitung',
      ikon: '🧮',
      nama: 'Penghitung',
      tugas: 'Memimpin menghitung KPK dan pecahan senilai; anggota lain ikut menghitung di buku.',
    },
    {
      id: 'pemeriksa',
      ikon: '🔍',
      nama: 'Pemeriksa',
      tugas: 'Mengecek jawaban dengan cara lain (pita pecahan atau patokan ½) sebelum dipilih.',
    },
    {
      id: 'pelapor',
      ikon: '📣',
      nama: 'Pelapor',
      tugas: 'Mencatat jawaban tim dan menjelaskan strategi tim kepada kelas.',
    },
  ],

  /* ---------- Tahap 1: Orientasi (CL Fase 1) ---------- */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    syntax: 'Cooperative Learning · Fase 1',
    goal: 'Mengenali masalah membandingkan pecahan berpenyebut berbeda dan tujuan belajar hari ini.',
    guru: 'Bacakan cerita lomba kue dengan antusias. Minta setiap murid menuliskan dugaan di buku lebih dulu sebelum menekan pilihan. Tekankan: dugaan tidak dinilai — nanti dibuktikan bersama. Sampaikan tujuan dan aturan kerja kelompok.',
    ikon: '🎂',
    judul: 'Lomba Menghias Kue Kelas 7',
    cerita:
      'Tiga kelompok mendapat kue bolu yang sama besar untuk dihias krim. Sampai waktu habis, Tim Melati menghias {2/3} permukaan kue, Tim Mawar {3/4} bagian, dan Tim Anggrek {5/8} bagian. Juri ingin tahu tim mana yang menghias paling luas.',
    kue: [
      { nama: 'Tim Melati', num: 2, den: 3 },
      { nama: 'Tim Mawar', num: 3, den: 4 },
      { nama: 'Tim Anggrek', num: 5, den: 8 },
    ],
    dugaan: {
      tanya: 'Dugaan awalmu: tim mana yang menghias kue paling luas?',
      opsi: [
        { id: 'melati', label: 'Tim Melati ({2/3} kue)' },
        { id: 'mawar', label: 'Tim Mawar ({3/4} kue)' },
        { id: 'anggrek', label: 'Tim Anggrek ({5/8} kue) — penyebutnya paling besar' },
        { id: 'tidak', label: 'Tidak bisa dibandingkan karena penyebutnya berbeda' },
      ],
      correct: 'mawar',
      umpan:
        'Dugaanmu sudah tercatat. Kita akan membuktikannya bersama di tahap Sajian — simpan alasanmu!',
    },
    tujuan: [
      'Membandingkan dua pecahan berpenyebut berbeda dan menuliskan tanda <, >, atau = dengan tepat.',
      'Mengurutkan beberapa pecahan berpenyebut berbeda dari yang terkecil atau dari yang terbesar.',
      'Menjelaskan strategi membandingkan pecahan kepada teman sekelompok.',
    ],
    aturan: [
      {
        ikon: '🤝',
        teks: 'Tim berhasil bila <strong>semua anggota</strong> paham, bukan hanya satu orang.',
      },
      { ikon: '💬', teks: 'Saling menjelaskan dan bertanya — <strong>bukan menyalin</strong>.' },
      {
        ikon: '🎭',
        teks: 'Setiap anggota memegang <strong>peran</strong> dan bertanggung jawab atas tugasnya.',
      },
      {
        ikon: '🏅',
        teks: 'Skor tim = kerja LKPD + kuis <strong>individu</strong> setiap anggota.',
      },
    ],
    nextLabel: 'Siap! Lanjut ke Sajian Materi →',
  },

  /* ---------- Tahap 2: Sajian (CL Fase 2) ---------- */
  sajian: {
    kicker: 'Tahap 2 · Sajian Materi',
    syntax: 'Cooperative Learning · Fase 2',
    goal: 'Memahami tiga strategi membandingkan pecahan berpenyebut berbeda.',
    guru: 'Sajikan satu strategi pada satu waktu secara klasikal (proyektor). Setelah setiap strategi, beri waktu 30 detik agar murid menjawab cek cepat secara individu di buku, lalu satu murid menekan jawaban. Bahas mengapa pilihan pengecoh keliru.',
    strategi: [
      {
        id: 'pita',
        ikon: '📏',
        judul: 'Strategi 1 — Pita pecahan',
        inti: 'Gambarkan setiap pecahan pada pita yang <strong>sama panjang</strong> (sama-sama 1 utuh). Pecahan yang arsirannya <strong>lebih panjang</strong> adalah pecahan yang <strong>lebih besar</strong>.',
        contoh: [
          { num: 2, den: 3 },
          { num: 3, den: 4 },
        ],
        kesimpulan: 'Arsiran {3/4} lebih panjang daripada {2/3}, jadi {2/3} &lt; {3/4}.',
        catatan:
          'Ingat: pita harus sama panjang. Membandingkan {1/2} kue kecil dengan {1/3} kue besar tidak adil!',
        cek: {
          tanya: 'Perhatikan pita {3/5} dan {1/2} di bawah. Pernyataan yang benar adalah …',
          pita: [
            { num: 3, den: 5 },
            { num: 1, den: 2 },
          ],
          opsi: [
            { id: 'a', label: '{3/5} &gt; {1/2}' },
            { id: 'b', label: '{3/5} &lt; {1/2}' },
            { id: 'c', label: '{3/5} = {1/2}' },
          ],
          correct: 'a',
          umpan: {
            a: 'Tepat! Arsiran {3/5} melewati garis tengah pita, sedangkan {1/2} tepat di tengah.',
            b: 'Coba lihat lagi: arsiran mana yang lebih panjang? Pita {3/5} melewati garis tengah.',
            c: 'Kedua arsiran tidak sama panjang. Bandingkan ujung arsirannya.',
          },
        },
      },
      {
        id: 'kpk',
        ikon: '🧮',
        judul: 'Strategi 2 — Samakan penyebut dengan KPK',
        inti: 'Ubah kedua pecahan menjadi pecahan <strong>senilai</strong> yang penyebutnya sama, yaitu <strong>KPK</strong> kedua penyebut. Setelah penyebut sama, cukup bandingkan <strong>pembilangnya</strong>.',
        contoh: [
          { num: 2, den: 3 },
          { num: 3, den: 4 },
        ],
        langkah: [
          'KPK dari 3 dan 4 adalah <strong>12</strong>.',
          '{2/3} = {8/12} (pembilang dan penyebut dikali 4).',
          '{3/4} = {9/12} (pembilang dan penyebut dikali 3).',
          'Karena 8 &lt; 9, maka {8/12} &lt; {9/12}, jadi <strong>{2/3} &lt; {3/4}</strong>.',
        ],
        catatan:
          '<strong>Cara cepat (kali silang):</strong> untuk {a/b} dan {c/d}, bandingkan a × d dengan c × b. Pada {2/3} dan {3/4}: 2 × 4 = 8 dan 3 × 3 = 9, karena 8 &lt; 9 maka {2/3} &lt; {3/4}.',
        cek: {
          tanya:
            'Untuk membandingkan {5/6} dan {7/9}, penyebut bersama <strong>terkecil</strong> (KPK) yang dipakai adalah …',
          opsi: [
            { id: 'a', label: '18' },
            { id: 'b', label: '54' },
            { id: 'c', label: '15' },
            { id: 'd', label: '36' },
          ],
          correct: 'a',
          umpan: {
            a: 'Tepat! 18 adalah kelipatan 6 dan 9 yang terkecil: {5/6} = {15/18} dan {7/9} = {14/18}, jadi {5/6} &gt; {7/9}.',
            b: '54 memang kelipatan bersama (6 × 9), tetapi bukan yang terkecil. Coba daftar kelipatan 9: 9, 18, …',
            c: '15 adalah hasil 6 + 9, bukan kelipatan. KPK harus habis dibagi 6 dan 9.',
            d: '36 kelipatan bersama, tetapi masih ada yang lebih kecil. Cek kelipatan 9: 9, 18, …',
          },
        },
      },
      {
        id: 'patokan',
        ikon: '🎯',
        judul: 'Strategi 3 — Patokan ½',
        inti: 'Bandingkan setiap pecahan dengan <strong>½</strong>. Pecahan lebih dari ½ bila pembilangnya <strong>lebih dari setengah</strong> penyebutnya. Jika satu pecahan kurang dari ½ dan yang lain lebih dari ½, jawabannya langsung terlihat.',
        contoh: [
          { num: 3, den: 7 },
          { num: 5, den: 8 },
        ],
        langkah: [
          '{3/7}: setengah dari 7 adalah 3½, dan 3 &lt; 3½, jadi {3/7} <strong>kurang dari ½</strong>.',
          '{5/8}: setengah dari 8 adalah 4, dan 5 &gt; 4, jadi {5/8} <strong>lebih dari ½</strong>.',
          'Maka <strong>{3/7} &lt; {5/8}</strong> — tanpa menghitung KPK!',
        ],
        catatan:
          'Patokan ½ paling cepat bila kedua pecahan berada di sisi yang berbeda dari ½. Jika keduanya di sisi yang sama, gunakan Strategi 2.',
        cek: {
          tanya: 'Dari pecahan {4/9} dan {6/11}, manakah yang <strong>lebih dari ½</strong>?',
          opsi: [
            { id: 'a', label: 'Hanya {6/11}' },
            { id: 'b', label: 'Hanya {4/9}' },
            { id: 'c', label: 'Keduanya' },
            { id: 'd', label: 'Tidak keduanya' },
          ],
          correct: 'a',
          umpan: {
            a: 'Tepat! Setengah dari 11 adalah 5½ dan 6 &gt; 5½; setengah dari 9 adalah 4½ dan 4 &lt; 4½. Jadi {4/9} &lt; {6/11}.',
            b: 'Setengah dari 9 adalah 4½. Apakah 4 lebih dari 4½?',
            c: 'Periksa {4/9}: setengah dari 9 adalah 4½, sedangkan pembilangnya 4.',
            d: 'Periksa {6/11}: setengah dari 11 adalah 5½, sedangkan pembilangnya 6.',
          },
        },
      },
    ],
    bukti: {
      judul: 'Membuktikan dugaan: Lomba Menghias Kue',
      teks: 'KPK dari 3, 4, dan 8 adalah 24. {2/3} = {16/24}, {3/4} = {18/24}, {5/8} = {15/24}. Jadi <strong>Tim Mawar</strong> menghias paling luas, dan urutan dari yang terkecil: {5/8} &lt; {2/3} &lt; {3/4}.',
      kpk: 24,
    },
    nextLabel: 'Bentuk Kelompok →',
  },

  /* ---------- Tahap 3: Kelompok (CL Fase 3) ---------- */
  kelompok: {
    kicker: 'Tahap 3 · Bentuk Kelompok',
    syntax: 'Cooperative Learning · Fase 3',
    goal: 'Membentuk tim, membagi peran, dan menyepakati cara kerja.',
    guru: 'Bentuk kelompok heterogen berisi 4 murid (campur kemampuan dan jenis kelamin). Bila kelompok bertiga, satu murid merangkap dua peran. Peran boleh digilir di tengah LKPD. Pastikan setiap murid membaca tugas perannya.',
    namaLabel: 'Nama tim',
    namaPlaceholder: 'mis. Tim Pecahan Juara',
    kesepakatanJudul: 'Kesepakatan tim (centang semua):',
    kesepakatan: [
      'Kami menunggu sampai semua anggota paham sebelum memilih jawaban.',
      'Kami menjelaskan alasan, bukan hanya menyebut jawaban.',
      'Kami menghargai pendapat setiap anggota.',
    ],
    nextLabel: 'Mulai LKPD: Bandingkan →',
  },

  /* ---------- Tahap 4: Bandingkan (CL Fase 4) ---------- */
  bandingkan: {
    kicker: 'Tahap 4 · LKPD Tim — Bandingkan',
    syntax: 'Cooperative Learning · Fase 4',
    goal: 'Membandingkan dua pecahan berpenyebut berbeda dengan menyamakan penyebut.',
    guru: 'Berkeliling dari tim ke tim. Ajukan pertanyaan pancingan, bukan jawaban: "Kelipatan 8 berapa saja?", "Pembilangnya dikali berapa?". Pastikan Pemeriksa benar-benar mengecek dengan patokan ½ atau pita sebelum tanda dipilih.',
    tandaOpsi: [
      { id: '<', label: '&lt; (kurang dari)' },
      { id: '>', label: '&gt; (lebih dari)' },
      { id: '=', label: '= (sama dengan)' },
    ],
    soal: [
      {
        id: 'b1',
        konteks: 'Pita Rani panjangnya {3/4} m, pita Dodi {5/6} m.',
        a: { num: 3, den: 4, nama: 'Pita Rani' },
        b: { num: 5, den: 6, nama: 'Pita Dodi' },
      },
      {
        id: 'b2',
        konteks: 'Kebun Pak Tani ditanami jagung {5/8} bagian dan kebun Bu Tani {7/12} bagian.',
        a: { num: 5, den: 8, nama: 'Kebun Pak Tani' },
        b: { num: 7, den: 12, nama: 'Kebun Bu Tani' },
      },
      {
        id: 'b3',
        konteks: 'Adi memakan {4/6} pizza, Beni memakan {6/9} pizza yang sama besar.',
        a: { num: 4, den: 6, nama: 'Adi' },
        b: { num: 6, den: 9, nama: 'Beni' },
      },
      {
        id: 'b4',
        konteks: 'Tangki A terisi {2/5} bagian, tangki B terisi {3/7} bagian.',
        a: { num: 2, den: 5, nama: 'Tangki A' },
        b: { num: 3, den: 7, nama: 'Tangki B' },
      },
      {
        id: 'b5',
        konteks: 'Siti sudah membaca {5/6} buku, Lala {7/10} buku yang sama tebalnya.',
        a: { num: 5, den: 6, nama: 'Siti' },
        b: { num: 7, den: 10, nama: 'Lala' },
      },
    ],
    nextLabel: 'Lanjut LKPD: Urutkan →',
  },

  /* ---------- Tahap 5: Urutkan (CL Fase 4) ---------- */
  urutkan: {
    kicker: 'Tahap 5 · LKPD Tim — Urutkan',
    syntax: 'Cooperative Learning · Fase 4',
    goal: 'Mengurutkan beberapa pecahan berpenyebut berbeda.',
    guru: 'Minta Penghitung menuliskan semua pecahan senilai di kertas sebelum kartu diketuk. Setelah urutan benar, minta Pelapor menjelaskan urutan dengan menunjuk garis bilangan. Tim yang selesai lebih dulu membantu tim lain (tanpa memberi jawaban).',
    soal: [
      {
        id: 'u1',
        judul: 'Lari Pagi',
        ikon: '🏃',
        konteks:
          'Empat sahabat lari pagi. Urutkan jarak lari mereka dari yang <strong>terdekat</strong> ke yang <strong>terjauh</strong>.',
        arah: 'naik',
        items: [
          { id: 'ani', nama: 'Ani', num: 3, den: 4, satuan: 'km' },
          { id: 'budi', nama: 'Budi', num: 2, den: 3, satuan: 'km' },
          { id: 'citra', nama: 'Citra', num: 5, den: 6, satuan: 'km' },
          { id: 'dewi', nama: 'Dewi', num: 7, den: 12, satuan: 'km' },
        ],
        hints: [
          'Penyebutnya 4, 3, 6, dan 12. Cari KPK-nya — coba cek apakah 12 habis dibagi semuanya.',
          'Dengan penyebut 12: {3/4} = {9/12}, {2/3} = {8/12}, {5/6} = {10/12}. Urutkan pembilangnya.',
        ],
      },
      {
        id: 'u2',
        judul: 'Resep Kue',
        ikon: '🧁',
        konteks:
          'Bahan kue diukur dalam cangkir. Urutkan takaran bahan dari yang <strong>terbanyak</strong> ke yang <strong>paling sedikit</strong>.',
        arah: 'turun',
        items: [
          { id: 'gula', nama: 'Gula', num: 1, den: 2, satuan: 'cangkir' },
          { id: 'tepung', nama: 'Tepung', num: 3, den: 5, satuan: 'cangkir' },
          { id: 'susu', nama: 'Susu', num: 3, den: 10, satuan: 'cangkir' },
          { id: 'mentega', nama: 'Mentega', num: 2, den: 5, satuan: 'cangkir' },
        ],
        hints: [
          'Perhatikan arahnya: dari yang TERBANYAK. KPK dari 2, 5, dan 10 adalah 10.',
          '{1/2} = {5/10}, {3/5} = {6/10}, {2/5} = {4/10}. Urutkan pembilang dari yang terbesar.',
        ],
      },
      {
        id: 'u3',
        judul: 'Botol Minum',
        ikon: '🧴',
        konteks:
          'Empat botol minum sama besar terisi air. Urutkan isi botol dari yang <strong>paling sedikit</strong> ke yang <strong>paling banyak</strong>.',
        arah: 'naik',
        items: [
          { id: 'merah', nama: 'Botol merah', num: 5, den: 8, satuan: 'botol' },
          { id: 'biru', nama: 'Botol biru', num: 3, den: 4, satuan: 'botol' },
          { id: 'hijau', nama: 'Botol hijau', num: 7, den: 12, satuan: 'botol' },
          { id: 'kuning', nama: 'Botol kuning', num: 2, den: 3, satuan: 'botol' },
        ],
        hints: [
          'Penyebutnya 8, 4, 12, dan 3. Kelipatan 12: 12, 24, … Mana yang juga habis dibagi 8?',
          'KPK-nya 24: {5/8} = {15/24}, {3/4} = {18/24}, {7/12} = {14/24}, {2/3} = {16/24}.',
        ],
      },
    ],
    nextLabel: 'Lanjut ke Kuis Individu →',
  },

  /* ---------- Tahap 6: Kuis individu (CL Fase 5) ---------- */
  kuis: {
    kicker: 'Tahap 6 · Kuis Individu',
    syntax: 'Cooperative Learning · Fase 5',
    goal: 'Menunjukkan pemahaman membandingkan dan mengurutkan pecahan secara mandiri.',
    instruction:
      'Kerjakan sendiri tanpa bantuan teman. Setiap soal hanya bisa dijawab sekali. Skormu menyumbang poin untuk timmu!',
    guru: 'Kuis dikerjakan individu. Bila perangkat terbatas, gilir perangkat antaranggota atau bacakan soal lalu murid menjawab di kertas. Hasil ini menjadi skor individu yang disumbangkan ke tim (model STAD).',
    soal: [
      {
        id: 'k1',
        type: 'choice',
        tanya: 'Tanda yang tepat untuk mengisi titik-titik: {4/7} … {3/5}',
        options: [
          { id: 'lt', label: '&lt;' },
          { id: 'gt', label: '&gt;' },
          { id: 'eq', label: '=' },
        ],
        correct: 'lt',
        explanation:
          'KPK 7 dan 5 adalah 35: {4/7} = {20/35} dan {3/5} = {21/35}. Karena 20 &lt; 21, maka {4/7} &lt; {3/5}.',
      },
      {
        id: 'k2',
        type: 'choice',
        tanya:
          'Pecahan <strong>terbesar</strong> di antara {2/3}, {5/9}, {7/12}, dan {3/4} adalah …',
        options: [
          { id: 'a', label: '{3/4}' },
          { id: 'b', label: '{2/3}' },
          { id: 'c', label: '{7/12}' },
          { id: 'd', label: '{5/9}' },
        ],
        correct: 'a',
        explanation:
          'Dengan KPK 36: {2/3} = {24/36}, {5/9} = {20/36}, {7/12} = {21/36}, {3/4} = {27/36}. Pembilang terbesar 27, jadi {3/4} terbesar.',
      },
      {
        id: 'k3',
        type: 'choice',
        tanya:
          'Pecahan <strong>terkecil</strong> di antara {3/8}, {2/5}, {1/3}, dan {5/12} adalah …',
        options: [
          { id: 'a', label: '{1/3}' },
          { id: 'b', label: '{3/8}' },
          { id: 'c', label: '{2/5}' },
          { id: 'd', label: '{5/12}' },
        ],
        correct: 'a',
        explanation:
          'Dengan KPK 120: {3/8} = {45/120}, {2/5} = {48/120}, {1/3} = {40/120}, {5/12} = {50/120}. Jadi {1/3} terkecil.',
      },
      {
        id: 'k4',
        type: 'choice',
        tanya:
          'Urutan pecahan {5/6}, {1/2}, dan {2/3} dari yang <strong>terkecil</strong> adalah …',
        options: [
          { id: 'a', label: '{1/2}, {2/3}, {5/6}' },
          { id: 'b', label: '{5/6}, {2/3}, {1/2}' },
          { id: 'c', label: '{1/2}, {5/6}, {2/3}' },
          { id: 'd', label: '{2/3}, {1/2}, {5/6}' },
        ],
        correct: 'a',
        explanation:
          'Dengan penyebut 6: {1/2} = {3/6}, {2/3} = {4/6}, {5/6} = {5/6}. Urutan pembilang 3, 4, 5.',
      },
      {
        id: 'k5',
        type: 'choice',
        tanya:
          'Tono berkata, "{5/12} lebih besar daripada {3/4} karena 12 lebih besar daripada 4." Pendapat yang tepat tentang pernyataan Tono adalah …',
        options: [
          {
            id: 'a',
            label: 'Tono keliru; {3/4} = {9/12}, jadi {5/12} &lt; {3/4}.',
          },
          { id: 'b', label: 'Tono benar; penyebut lebih besar berarti pecahan lebih besar.' },
          { id: 'c', label: 'Tono benar; pembilang 5 lebih besar daripada 3.' },
          { id: 'd', label: 'Tidak dapat ditentukan karena penyebutnya berbeda.' },
        ],
        correct: 'a',
        explanation:
          'Penyebut yang lebih besar berarti potongannya lebih kecil. Setelah disamakan, {3/4} = {9/12} dan 5 &lt; 9, jadi {5/12} &lt; {3/4}.',
      },
      {
        id: 'k6',
        type: 'choice',
        tanya:
          'Sari sudah membaca {3/5} novel, sedangkan Lina {5/8} novel yang sama. Siapa yang sudah membaca lebih banyak?',
        options: [
          { id: 'lina', label: 'Lina' },
          { id: 'sari', label: 'Sari' },
          { id: 'sama', label: 'Sama banyak' },
          { id: 'tidak', label: 'Tidak dapat ditentukan' },
        ],
        correct: 'lina',
        explanation:
          'Kali silang: 3 × 8 = 24 dan 5 × 5 = 25. Karena 24 &lt; 25, maka {3/5} &lt; {5/8}, jadi Lina membaca lebih banyak.',
      },
    ],
    nextLabel: 'Lihat Penghargaan Tim →',
  },

  /* ---------- Tahap 7: Penghargaan (CL Fase 6) ---------- */
  penghargaan: {
    kicker: 'Tahap 7 · Penghargaan Tim',
    syntax: 'Cooperative Learning · Fase 6',
    goal: 'Merayakan hasil kerja tim dan menghargai kontribusi setiap anggota.',
    guru: 'Umumkan predikat setiap tim di depan kelas. Minta Pelapor setiap tim menyebutkan satu strategi yang paling membantu timnya. Penghargaan bersifat kelompok, sehingga keberhasilan anggota adalah keberhasilan tim.',
    predikat: [
      {
        min: 85,
        ikon: '🏆',
        nama: 'Tim Super',
        teks: 'Luar biasa! Tim kalian sangat kompak dan teliti.',
      },
      { min: 70, ikon: '🥇', nama: 'Tim Hebat', teks: 'Hebat! Sedikit lagi menjadi Tim Super.' },
      { min: 0, ikon: '🌟', nama: 'Tim Baik', teks: 'Kerja bagus! Terus berlatih bersama, ya.' },
    ],
    apresiasiLabel: 'Siapa anggota yang paling banyak membantu timmu hari ini?',
    apresiasiUmpan: 'Terima kasih! Sampaikan apresiasimu secara langsung kepadanya, ya. 👏',
    nextLabel: 'Lanjut ke Refleksi →',
  },

  /* ---------- Tahap 8: Refleksi ---------- */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    syntax: 'Penutup',
    goal: 'Memeriksa kembali pemahaman dan merefleksikan kerja sama tim.',
    guru: 'Beri waktu hening 3 menit untuk refleksi pribadi. Undang 2–3 murid membagikan jawabannya. Luruskan miskonsepsi "penyebut besar berarti pecahan besar" bila masih muncul.',
    opsi: [
      { id: 'benar', label: 'Benar' },
      { id: 'keliru', label: 'Keliru' },
    ],
    pernyataan: [
      {
        id: 'p1',
        teks: 'Pecahan dengan penyebut lebih besar selalu bernilai lebih besar.',
        correct: 'keliru',
        explanation: 'Contohnya {1/8} &lt; {1/2}. Penyebut besar berarti potongannya lebih kecil.',
      },
      {
        id: 'p2',
        teks: 'Setelah penyebutnya disamakan, pecahan dengan pembilang lebih besar bernilai lebih besar.',
        correct: 'benar',
        explanation: 'Misalnya {9/12} &gt; {8/12} karena 9 &gt; 8 dan penyebutnya sama.',
      },
      {
        id: 'p3',
        teks: '{4/6} dan {6/9} bernilai sama.',
        correct: 'benar',
        explanation: 'Keduanya senilai dengan {2/3}: {4/6} = {12/18} = {6/9}.',
      },
      {
        id: 'p4',
        teks: 'Bila {a/b} kurang dari ½ dan {c/d} lebih dari ½, maka {a/b} &lt; {c/d}.',
        correct: 'benar',
        explanation:
          'Itulah strategi patokan ½: pecahan di bawah ½ pasti lebih kecil dari pecahan di atas ½.',
      },
      {
        id: 'p5',
        teks: 'Mengurutkan dari yang terbesar berarti menulis pecahan terkecil lebih dulu.',
        correct: 'keliru',
        explanation:
          'Dari yang terbesar berarti pecahan TERBESAR ditulis paling depan (urutan turun).',
      },
    ],
    pertanyaan: [
      {
        id: 'strategi',
        teks: 'Strategi mana yang paling kamu sukai untuk membandingkan pecahan? Mengapa?',
        placeholder: 'Contoh: Saya suka menyamakan penyebut karena …',
      },
      {
        id: 'tim',
        teks: 'Apa yang dilakukan timmu agar semua anggota paham? Apa yang bisa ditingkatkan?',
        placeholder: 'Contoh: Kami saling menjelaskan cara mencari KPK …',
      },
    ],
    diriLabel:
      'Seberapa yakin kamu sekarang membandingkan dan mengurutkan pecahan berpenyebut berbeda?',
    diriOpsi: [
      { id: 'sangat', label: '😄 Sangat yakin — aku bisa menjelaskan ke teman' },
      { id: 'yakin', label: '🙂 Yakin — aku bisa mengerjakan sendiri' },
      { id: 'ragu', label: '🤔 Masih ragu — perlu latihan lagi' },
      { id: 'bingung', label: '😟 Masih bingung — perlu dibimbing' },
    ],
    nextLabel: 'Selesai →',
  },

  /* ---------- Tahap 9: Selesai ---------- */
  selesai: {
    judul: 'Kerja tim yang hebat!',
    teks: 'Kalian telah belajar membandingkan dan mengurutkan pecahan berpenyebut berbeda bersama-sama.',
    capaian: [
      'Membandingkan pecahan dengan pita pecahan yang sama panjang.',
      'Menyamakan penyebut dengan KPK, lalu membandingkan pembilang.',
      'Memakai patokan ½ dan kali silang sebagai cara cepat.',
      'Mengurutkan pecahan dari yang terkecil maupun dari yang terbesar.',
    ],
  },
};
