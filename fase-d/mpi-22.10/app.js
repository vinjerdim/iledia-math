'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Masalah Kontekstual Gabungan Prisma & Limas
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox, formatRupiah,
   createStageMachine, createExerciseStage, createStore,
   ensureExerciseArray, optionIds, komponen umum (ensureShuffledOrder,
   buildDiscoveryHead, buildTeacherNote, buildTpPanel, buildChoiceGroup,
   buildDlPanel, buildDlNextButton, findOptionLabel, ensureSortStates,
   buildSortItems, bindSortItems, sortItemsAllAnswered,
   sortItemsCorrectCount, ensureTapOrderState, buildTapOrder,
   bindTapOrder, buildGuidedQuizList, bindGuidedQuizList,
   guidedQuizAllCorrect, buildGuidedChoiceFeedback), kartu isian bagian
   47 (ensureLpIsianState, buildLpIsian, bindLpIsian, lpKartuBenar,
   lppAngka, lppBulat), komponen masalah kontekstual bagian 48
   (banyakWadah, konversiLuas, rekapAnggaran, lpkSaring, lpkPesan,
   kandidatMasalahLp, pengecohBanyakWadah, ensureLpSisiState,
   buildLpAnggaran, buildLpProposal), kartu surat bagian 49
   (buildSuratCard), volume bagian 54–55 (konversiVolume, waktuIsi,
   formatDurasi, pengecohMasalahVolume), tₛ bagian 57–58
   (tinggiSisiTegakLimas, pengecohTinggiSisi), serta komponen masalah
   kontekstual gabungan bagian 60 (alasGabungan, volumeGabungan,
   tinggiLimasGabungan, luasSisiGabungan, gbgAngka,
   kandidatMasalahGabungan, diagnosaMasalahGabungan,
   pengecohMasalahGabungan, ensureGbgLabState, gbgLabSelesai,
   buildGbgLab, bindGbgLab, buildGbgSVG, buildGbgSisiPicker,
   bindGbgSisiPicker).

   Alur tahap mengikuti sintaks Problem Based Learning; lihat komentar
   kepala pada data.js untuk pemetaan dan rangkaian aktivitasnya.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI saat
   state disiapkan (initExerciseArrays), lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat-lompat
   ketika tahap dirender ulang, tetapi teracak ulang setiap Reset.

   Bagian:
    1. Konstanta, hitungan kunci & kartu isian
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi Masalah     (PBL sintaks 1)
    6. Stage: Organisasi            (PBL sintaks 2)
    7. Stage: Penyelidikan Isi Air  (PBL sintaks 3)
    8. Stage: Penyelidikan Pelat    (PBL sintaks 3)
    9. Stage: Penyelidikan Anggaran (PBL sintaks 3)
   10. Stage: Menyajikan Karya      (PBL sintaks 4)
   11. Stage: Analisis & Evaluasi   (PBL sintaks 5)
   12. Stage: Uji Terap
   13. Stage: Refleksi
   14. Stage: Selesai
   15. Router Render
   16. Helper UI (modal reset)
   17. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA, HITUNGAN KUNCI & KARTU ISIAN
   ============================================================ */

var STAGES = [
  'orientasi',
  'organisasi',
  'selidikIsi',
  'selidikPelat',
  'selidikBiaya',
  'karya',
  'evaluasi',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Masalah',
  'Organisasi',
  'Isi Air',
  'Pelat',
  'Anggaran',
  'Karya',
  'Evaluasi',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-22-10-masalah-gabungan-v1';

var DESAIN_BY_ID = {};
DATA.desain.forEach(function (d) {
  DESAIN_BY_ID[d.id] = d;
});
var BENDA_BY_ID = {};
DATA.benda.forEach(function (b) {
  BENDA_BY_ID[b.id] = b;
});

/* Konfigurasi Lab Gabungan (engine seksi 60). */
var LAB = {
  satuan: 'cm',
  target: DATA.target,
  desain: DATA.desain.map(function (d) {
    return { id: d.id, nama: d.nama, bangun: d.bangun, info: d.info };
  }),
};

var LUAS_LEMBAR = DATA.pelat.panjang * DATA.pelat.lebar;

/* Pengecoh { nilai, pesan } dikali faktor (mis. harga), tetap berdiagnosa. */
function kaliPengecoh(list, faktor) {
  return list.map(function (p) {
    return { nilai: lppBulat(p.nilai * faktor), pesan: p.pesan };
  });
}

/* Pengecoh volume prisma saja (engine seksi 55: LP, keliling, ⅓, …). */
function pengecohVolumeBalok(b) {
  var a = alasGabungan(b);
  return pengecohMasalahVolume({
    jenis: 'volume',
    luasAlas: a.luas,
    tinggi: b.prisma.t,
    kelilingAlas: a.keliling,
  });
}

/* Pengecoh luas permukaan balok tertutup (engine seksi 48). */
function pengecohLpBalok(b) {
  var a = alasGabungan(b);
  var k = kandidatMasalahLp({
    jenis: 'lp',
    luasAlas: a.luas,
    kelilingAlas: a.keliling,
    tinggi: b.prisma.t,
  });
  return lpkSaring(
    Object.keys(k)
      .filter(function (kode) {
        return kode !== 'benar';
      })
      .map(function (kode) {
        return { nilai: k[kode], pesan: lpkPesan(kode) };
      }),
    k.benar
  );
}

/* Semua hitungan kunci masalah tandon, dari DATA + engine seksi 48, 55, 60. */
var HITUNG = (function () {
  var h = { desain: {}, benda: {} };
  DATA.desain.forEach(function (d) {
    var v = volumeGabungan(d.bangun);
    var liter = konversiVolume(v.total, 'cm3', 'l');
    h.desain[d.id] = {
      luasAlas: alasGabungan(d.bangun).luas,
      v: v,
      liter: liter,
      bagiHari: lppBulat(liter / DATA.target.perHari),
      hari: banyakMuat(liter, DATA.target.perHari),
    };
    h.desain[d.id].cukup = h.desain[d.id].hari >= DATA.target.hari;
  });
  DATA.benda.forEach(function (b) {
    var luas = luasSisiGabungan(b.bangun, b.dipakai);
    var m2 = konversiLuas(luas, 'cm²', 'm²');
    var lembar = banyakWadah(luas, LUAS_LEMBAR);
    var kaleng = banyakWadah(m2, DATA.cat.luas);
    h.benda[b.id] = {
      luas: luas,
      m2: m2,
      bagiLembar: lppBulat(luas / LUAS_LEMBAR),
      lembar: lembar,
      biayaPelat: lembar * DATA.pelat.harga,
      kaleng: kaleng,
      biayaCat: kaleng * DATA.cat.harga,
    };
  });
  var B = DESAIN_BY_ID[DATA.desainDipilih].bangun;
  h.tsCorong = tinggiSisiTegakLimas(tinggiLimasGabungan(B), B.alas.s / 2);
  h.pilih = h.desain[DATA.desainDipilih];
  h.pelat = h.benda[DATA.desainDipilih];
  h.menit = waktuIsi(h.pilih.liter, DATA.debitTalang);
  h.isiHujan = lppBulat(DATA.lamaHujan * DATA.debitTalang);
  return h;
})();

function barisAnggaran(id) {
  var p = HITUNG.benda[id];
  return [
    {
      id: 'pelat',
      nama: '🧱 Pelat galvanis tandon ' + id,
      rincian: p.lembar + ' lembar × ' + formatRupiah(DATA.pelat.harga),
      biaya: p.biayaPelat,
    },
    {
      id: 'cat',
      nama: '🎨 Cat antikarat',
      rincian: p.kaleng + ' kaleng × ' + formatRupiah(DATA.cat.harga),
      biaya: p.biayaCat,
    },
    {
      id: 'keran',
      nama: '🚰 Keran penguras',
      rincian: '1 buah',
      biaya: DATA.keran.harga,
    },
  ];
}

var ANGGARAN_PILIH = barisAnggaran(DATA.desainDipilih);
var ANGGARAN_USULAN = barisAnggaran(DATA.karya.usulan);
var REKAP_PILIH = rekapAnggaran(ANGGARAN_PILIH, DATA.dana);

function gambarTandon(b, lebar, opts) {
  opts = opts || {};
  return buildGbgSVG(b, {
    lebar: lebar || 220,
    label: !!opts.label,
    garis: !!opts.garis,
    pisah: !!opts.pisah,
    aria: opts.aria,
  });
}

function legendaWarna() {
  return (
    '<ul class="gbg-legenda" aria-label="Keterangan warna">' +
    '<li><span class="gbg-legenda__warna" aria-hidden="true"></span>Bagian prisma (balok)</li>' +
    '<li><span class="gbg-legenda__warna gbg-legenda__warna--limas" aria-hidden="true"></span>Bagian limas (corong)</li>' +
    '<li><span class="gbg-legenda__warna gbg-legenda__warna--sambung" aria-hidden="true"></span>Bidang sambung</li>' +
    '</ul>'
  );
}

/* Tahap 3 — kartu data volume satu desain. */
function buatKartuIsi(d, i) {
  var b = d.bangun;
  var H = HITUNG.desain[d.id];
  var gabung = !!(b.prisma && b.limas);
  var s = b.alas.s;
  var fields = [];
  fields.push(
    i === 0
      ? {
          id: 'la',
          label: 'Luas alas (La)',
          jawab: H.luasAlas,
          satuan: 'cm²',
          angka: true,
          pengecoh: [
            {
              nilai: 4 * s,
              pesan: 'Itu keliling alas. Luas alas persegi = sisi × sisi.',
            },
            { nilai: 2 * s, pesan: 'Luas persegi = sisi × sisi, bukan sisi × 2.' },
          ],
        }
      : { id: 'la', label: 'Luas alas (La)', jawab: H.luasAlas, satuan: 'cm²', diberikan: true }
  );
  if (gabung) {
    fields.push(
      {
        id: 'vp',
        label: 'V balok = La × ' + gbgAngka(b.prisma.t),
        jawab: H.v.prisma,
        satuan: 'cm³',
        angka: true,
        pengecoh: pengecohVolumeBalok(b),
      },
      {
        id: 'vl',
        label: 'V corong = ⅓ × La × ' + gbgAngka(tinggiLimasGabungan(b)),
        jawab: H.v.limas,
        satuan: 'cm³',
        angka: true,
        pengecoh: pengecohMasalahGabungan({
          jenis: 'volume',
          bangun: { satuan: 'cm', alas: b.alas, limas: b.limas },
        }),
      }
    );
  }
  fields.push(
    {
      id: 'v',
      label: '<strong>Volume tandon</strong>',
      jawab: H.v.total,
      satuan: 'cm³',
      angka: true,
      pengecoh: gabung
        ? pengecohMasalahGabungan({ jenis: 'volume', bangun: b })
        : pengecohVolumeBalok(b),
    },
    {
      id: 'l',
      label: 'Isi dalam liter',
      jawab: H.liter,
      satuan: 'liter',
      angka: true,
      pengecoh: pengecohMasalahGabungan({
        jenis: 'konversiVolume',
        nilai: H.v.total,
        dari: 'cm3',
        ke: 'l',
      }),
    },
    {
      id: 'hari',
      label: 'Cukup untuk (hari)',
      jawab: H.hari,
      satuan: 'hari',
      angka: true,
      pengecoh: pengecohMasalahGabungan({
        jenis: 'muat',
        volume: H.liter,
        isiSatu: DATA.target.perHari,
      }),
    }
  );
  var hints = ['La = ' + s + ' × ' + s + '.'];
  if (gabung) {
    hints.push(
      'V balok = La × tinggi balok. V corong = ⅓ × La × tinggi corong. Volume tandon = jumlah keduanya.'
    );
  } else {
    hints.push('Tandon ini hanya balok: V = La × tinggi.');
  }
  hints.push(
    '1 liter = 1.000 cm³. Banyak hari = liter : ' +
      DATA.target.perHari +
      ', lalu bulatkan ke BAWAH (hari yang benar-benar terpenuhi).'
  );
  return {
    id: 'isi-' + d.id,
    judul: d.nama + ' · ' + d.info,
    visual:
      '<div class="gbg-data-visual">' +
      gambarTandon(b, 200, { label: true }) +
      '<p class="dl-caption">' +
      esc(d.nama + ': ' + d.gaya) +
      '</p></div>',
    hints: hints,
    temuan:
      '<strong>' +
      esc(d.nama) +
      ':</strong> ' +
      esc(gbgAngka(H.v.total)) +
      ' cm³ = ' +
      esc(gbgAngka(H.liter)) +
      ' liter → cukup ' +
      H.hari +
      ' hari. ' +
      (H.cukup ? '✓ Memenuhi' : '✗ Belum memenuhi') +
      ' kebutuhan ' +
      DATA.target.hari +
      ' hari.',
    fields: fields,
  };
}

/* Tahap 4 — kartu luas pelat satu tandon (muncul setelah sisinya tepat). */
function buatKartuPelat(b) {
  var P = HITUNG.benda[b.id];
  var fields = [];
  var gabung = !!(b.bangun.prisma && b.bangun.limas);
  if (gabung) {
    var tl = tinggiLimasGabungan(b.bangun);
    var a = b.bangun.alas.s / 2;
    fields.push({
      id: 'ts',
      label: 'tₛ corong = √(' + gbgAngka(tl) + '² + ' + gbgAngka(a) + '²)',
      jawab: HITUNG.tsCorong,
      satuan: 'cm',
      angka: true,
      pengecoh: pengecohTinggiSisi(tl, a),
    });
  }
  fields.push(
    {
      id: 'luas',
      label: '<strong>Luas pelat</strong>',
      jawab: P.luas,
      satuan: 'cm²',
      angka: true,
      pengecoh: gabung
        ? pengecohMasalahGabungan({ jenis: 'luas', bangun: b.bangun, pakai: b.dipakai })
        : pengecohLpBalok(b.bangun),
    },
    {
      id: 'm2',
      label: 'Luas pelat dalam m²',
      jawab: P.m2,
      satuan: 'm²',
      angka: true,
      pengecoh: pengecohMasalahGabungan({
        jenis: 'konversiLuas',
        nilai: P.luas,
        dari: 'cm²',
        ke: 'm²',
      }),
    }
  );
  return {
    id: 'pelat-' + b.id,
    judul: 'Luas pelat tandon ' + b.id,
    visual: gabung
      ? '<div class="gbg-data-visual">' +
        gambarTandon(b.bangun, 200, { garis: true }) +
        '<p class="dl-caption">Garis merah: tinggi corong t. Garis hijau: tinggi sisi tegak tₛ.</p></div>'
      : '',
    hints: [b.infoLuas, '1 m² = 10.000 cm².'],
    temuan:
      '<strong>' +
      esc(gbgAngka(P.luas) + ' cm² = ' + gbgAngka(P.m2) + ' m²') +
      '</strong> pelat untuk tandon ' +
      esc(b.id) +
      '.',
    fields: fields,
  };
}

/* Tahap 5 — kartu lembar pelat, kaleng cat, dan waktu isi. */
function buatKartuBiaya() {
  var P = HITUNG.pelat;
  var id = DATA.desainDipilih;
  var pelat = {
    id: 'biaya-pelat',
    judul: '🧱 Pelat galvanis tandon ' + id,
    hints: [
      'Luas satu lembar = ' +
        DATA.pelat.panjang +
        ' × ' +
        DATA.pelat.lebar +
        ' = ' +
        gbgAngka(LUAS_LEMBAR) +
        ' cm².',
      'Banyak lembar = luas pelat : luas satu lembar, lalu bulatkan KE ATAS.',
      'Biaya = banyak lembar × harga satu lembar.',
    ],
    fields: [
      { id: 'luas', label: 'Luas pelat', jawab: P.luas, satuan: 'cm²', diberikan: true },
      {
        id: 'satu',
        label: 'Satu lembar (' + DATA.pelat.panjang + ' × ' + DATA.pelat.lebar + ')',
        jawab: LUAS_LEMBAR,
        satuan: 'cm²',
        diberikan: true,
      },
      {
        id: 'lembar',
        label: 'Banyak lembar yang dibeli',
        jawab: P.lembar,
        satuan: 'lembar',
        angka: true,
        pengecoh: pengecohBanyakWadah(P.luas, LUAS_LEMBAR),
      },
      {
        id: 'biaya',
        label: 'Biaya pelat',
        jawab: P.biayaPelat,
        awalan: 'Rp',
        angka: true,
        pengecoh: kaliPengecoh(pengecohBanyakWadah(P.luas, LUAS_LEMBAR), DATA.pelat.harga),
      },
    ],
  };
  var cat = {
    id: 'biaya-cat',
    judul: '🎨 Cat antikarat',
    hints: [
      'Banyak kaleng = luas yang dicat : ' + DATA.cat.luas + ' m², lalu bulatkan KE ATAS.',
      'Biaya = banyak kaleng × harga satu kaleng.',
    ],
    fields: [
      { id: 'luas', label: 'Luas yang dicat', jawab: P.m2, satuan: 'm²', diberikan: true },
      {
        id: 'daya',
        label: 'Satu kaleng cukup untuk',
        jawab: DATA.cat.luas,
        satuan: 'm²',
        diberikan: true,
      },
      {
        id: 'kaleng',
        label: 'Banyak kaleng yang dibeli',
        jawab: P.kaleng,
        satuan: 'kaleng',
        angka: true,
        pengecoh: pengecohBanyakWadah(P.m2, DATA.cat.luas),
      },
      {
        id: 'biaya',
        label: 'Biaya cat',
        jawab: P.biayaCat,
        awalan: 'Rp',
        angka: true,
        pengecoh: kaliPengecoh(pengecohBanyakWadah(P.m2, DATA.cat.luas), DATA.cat.harga),
      },
    ],
  };
  var waktu = {
    id: 'waktu',
    judul: '🌧️ Waktu mengisi tandon ' + id + ' dari talang',
    hints: [
      'Waktu = isi tandon : debit talang = ' +
        gbgAngka(HITUNG.pilih.liter) +
        ' : ' +
        DATA.debitTalang +
        '.',
      '60 menit = 1 jam.',
    ],
    temuan:
      'Tandon ' +
      esc(id) +
      ' penuh dalam <strong>' +
      HITUNG.menit +
      ' menit = ' +
      esc(formatDurasi(HITUNG.menit)) +
      '</strong>.',
    fields: [
      {
        id: 'isi',
        label: 'Isi tandon',
        jawab: HITUNG.pilih.liter,
        satuan: 'liter',
        diberikan: true,
      },
      {
        id: 'debit',
        label: 'Debit talang',
        jawab: DATA.debitTalang,
        satuan: 'liter/menit',
        diberikan: true,
      },
      {
        id: 'menit',
        label: 'Waktu sampai penuh',
        jawab: HITUNG.menit,
        satuan: 'menit',
        angka: true,
        pengecoh: pengecohMasalahGabungan({
          jenis: 'waktu',
          volume: HITUNG.pilih.liter,
          debit: DATA.debitTalang,
          volumeAsal: HITUNG.pilih.v.total,
        }),
      },
    ],
  };
  return [pelat, cat, waktu];
}

var KARTU_ISI = DATA.desain.map(buatKartuIsi);
var KARTU_PELAT = {};
DATA.benda.forEach(function (b) {
  KARTU_PELAT[b.id] = buatKartuPelat(b);
});
var KARTU_PELAT_LIST = DATA.benda.map(function (b) {
  return KARTU_PELAT[b.id];
});
var KARTU_BIAYA = buatKartuBiaya();

function itemPilah(list) {
  return list.map(function (it) {
    return {
      id: it.id,
      correct: it.correct,
      explanation: esc(it.explanation),
      teks: esc(it.teks),
    };
  });
}

var PILAH_ITEMS = itemPilah(DATA.organisasi.pilah);
var LANGKAH_ITEMS = itemPilah(DATA.evaluasi.langkah);
var RENCANA_ITEMS = DATA.organisasi.rencana.map(function (r) {
  return { id: r.id, label: esc(r.label) };
});
var RENCANA_JAWAB = optionIds(DATA.organisasi.rencana);

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Tahap 1 — orientasi */
  dugaanOrders: {},
  dugaanPilih: {},
  orientasiAlasan: '',
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',

  /* Tahap 2 — organisasi */
  peranOrder: null,
  peranPilih: null,
  pilahStates: {},
  pilahOrder: null,
  rencanaState: null,

  /* Tahap 3 — isi air */
  labGabung: null,
  isianIsi: null,
  isiOrders: {},
  isiPilih: {},

  /* Tahap 4 — pelat */
  sisi: null,
  isianPelat: null,
  pelatOrders: {},
  pelatPilih: {},

  /* Tahap 5 — anggaran */
  isianBiaya: null,
  biayaOrders: {},
  biayaPilih: {},

  /* Tahap 6 — karya */
  karyaOrders: {},
  karyaPilih: {},
  presentasi: '',

  /* Tahap 7 — evaluasi */
  langkahStates: {},
  langkahOrder: null,
  evalOrders: {},
  evalPilih: {},
  evalRefleksi: '',

  /* Tahap 8 — uji terap */
  terapkanIdx: 0,
  terapkanExercises: [],

  /* Tahap 9 — refleksi */
  refleksiAnswers: {},
  refleksiDiri: null,
  refleksiDiriOrder: null,
};

var Store = createStore({ key: STORAGE_KEY, state: State });
var saveState = Store.save;
var loadState = Store.load;

function clearState() {
  Store.reset();
  initExerciseArrays();
}

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function ensureObject(key) {
  if (!isPlainObject(State[key])) State[key] = {};
}

/* Urutan acak opsi untuk setiap pertanyaan dalam `list`. */
function ensureGuidedOrders(orderKey, pilihKey, list) {
  ensureObject(orderKey);
  ensureObject(pilihKey);
  list.forEach(function (q) {
    ensureShuffledOrder(State[orderKey], q.id, q.opsi);
  });
}

/*
 * Menyiapkan seluruh state per-soal DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1 */
  ensureGuidedOrders('dugaanOrders', 'dugaanPilih', DATA.orientasi.dugaan);
  ensureShuffledOrder(State, 'masalahOrder', DATA.orientasi.masalahOpsi);

  /* Tahap 2 */
  ensureShuffledOrder(State, 'peranOrder', DATA.organisasi.peran);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.organisasi.opsiPilah);
  ensureTapOrderState(State, 'rencanaState', RENCANA_ITEMS, RENCANA_JAWAB);

  /* Tahap 3 */
  ensureGbgLabState(State, 'labGabung', LAB);
  ensureLpIsianState(State, 'isianIsi', KARTU_ISI);
  ensureGuidedOrders('isiOrders', 'isiPilih', DATA.selidikIsi.tanya);

  /* Tahap 4 */
  ensureLpSisiState(State, 'sisi', DATA.benda);
  ensureLpIsianState(State, 'isianPelat', KARTU_PELAT_LIST);
  ensureGuidedOrders('pelatOrders', 'pelatPilih', DATA.selidikPelat.tanya);

  /* Tahap 5 */
  ensureLpIsianState(State, 'isianBiaya', KARTU_BIAYA);
  ensureGuidedOrders('biayaOrders', 'biayaPilih', DATA.selidikBiaya.tanya);

  /* Tahap 6 */
  ensureGuidedOrders('karyaOrders', 'karyaPilih', DATA.karya.tanya);

  /* Tahap 7 */
  ensureSortStates(State, 'langkahStates', 'langkahOrder', LANGKAH_ITEMS, DATA.evaluasi.opsiNilai);
  ensureGuidedOrders('evalOrders', 'evalPilih', DATA.evaluasi.tanya);

  /* Tahap 8 — uji terap (dirender createExerciseStage) */
  ensureExerciseArray(State, 'terapkanExercises', DATA.terapkan.soal, function (q) {
    return {
      attempts: 0,
      hintLevel: 0,
      hintShown: false,
      correct: false,
      userInput: '',
      revealed: false,
      chosen: null,
      checked: false,
      optionOrder: q.options ? shuffleArray(optionIds(q.options)) : null,
    };
  });
  if (State.terapkanIdx >= DATA.terapkan.soal.length || State.terapkanIdx < 0) {
    State.terapkanIdx = 0;
  }

  /* Tahap 9 */
  ensureShuffledOrder(State, 'refleksiDiriOrder', DATA.refleksi.diriOpsi);
  ensureObject('refleksiAnswers');
}

/* ============================================================
   3. NAVIGASI
   ============================================================ */

var StageMachine = createStageMachine({
  stages: STAGES,
  stageLabels: STAGE_LABELS,
  state: State,
  save: saveState,
  render: renderCurrentStage,
});

var navigateTo = StageMachine.navigateTo;
var completeStage = StageMachine.completeStage;
var updateStageNav = StageMachine.updateStageNav;
var buildStageNav = StageMachine.buildStageNav;
var updateProgress = StageMachine.updateProgress;

/* ============================================================
   4. UTILITAS RENDER
   ============================================================ */

/* Kepala tahap + catatan peran guru. */
function buildHead(D) {
  return buildDiscoveryHead(D.kicker, D.goal, D.syntax) + buildTeacherNote(D.guru);
}

/* Memasang tombol lanjut yang menyelesaikan tahap ini lalu pindah tahap. */
function bindNext(id, stageId, nextStageId) {
  var btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', function () {
    completeStage(stageId);
    navigateTo(nextStageId);
  });
}

function panelJudul(judul, inner, cls) {
  return buildDlPanel('<h3 style="margin-top:0;">' + esc(judul) + '</h3>' + inner, cls);
}

function caption(teks) {
  return '<p class="dl-caption">' + esc(teks) + '</p>';
}

function paragrafInfo(teks) {
  return buildDlPanel('<p style="margin:0;">' + esc(teks) + '</p>', 'panel--info');
}

function daftarTemuan(teks) {
  return (
    '<div style="margin-top:var(--space-4);">' + buildFeedbackBox('success', '🔎', teks) + '</div>'
  );
}

function buildTextarea(id, label, placeholder, value) {
  return (
    '<div class="field-group">' +
    '<label for="' +
    id +
    '">' +
    esc(label) +
    '</label>' +
    '<textarea id="' +
    id +
    '" class="input-textarea" placeholder="' +
    esc(placeholder) +
    '">' +
    esc(value || '') +
    '</textarea>' +
    '</div>'
  );
}

/* Memasang textarea yang menyimpan isinya ke State[key]. */
function bindTextarea(id, key) {
  var ta = document.getElementById(id);
  if (!ta) return;
  ta.addEventListener('input', function () {
    State[key] = ta.value;
    saveState();
  });
}

function semuaKartuBenar(list, stMap) {
  return list.every(function (k) {
    return lpKartuBenar(k, stMap[k.id]);
  });
}

function banyakKartuBenar(list, stMap) {
  return list.filter(function (k) {
    return lpKartuBenar(k, stMap[k.id]);
  }).length;
}

/* Umpan pertanyaan penuntun di-escape sekali (teks polos di DATA). */
function tanyaAman(list) {
  return list.map(function (q) {
    var umpan = {};
    Object.keys(q.umpan).forEach(function (k) {
      umpan[k] = esc(q.umpan[k]);
    });
    return {
      id: q.id,
      tanya: esc(q.tanya),
      opsi: q.opsi.map(function (o) {
        return { id: o.id, label: esc(o.label) };
      }),
      correct: q.correct,
      umpan: umpan,
    };
  });
}

var TANYA = {
  isi: tanyaAman(DATA.selidikIsi.tanya),
  pelat: tanyaAman(DATA.selidikPelat.tanya),
  biaya: tanyaAman(DATA.selidikBiaya.tanya),
  karya: tanyaAman(DATA.karya.tanya),
  evaluasi: tanyaAman(DATA.evaluasi.tanya),
};

/* ============================================================
   5. STAGE: ORIENTASI MASALAH  (PBL — sintaks 1)
   Dugaan TIDAK dinilai; rumusan masalah dinilai dengan umpan balik.
   ============================================================ */

function dugaanLengkap() {
  return DATA.orientasi.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var lengkap = dugaanLengkap();
  var benar = State.masalahPilihan === D.masalahCorrect;
  var umpan = {};
  Object.keys(D.masalahUmpan).forEach(function (k) {
    umpan[k] = esc(D.masalahUmpan[k]);
  });
  var masalahOpsi = D.masalahOpsi.map(function (o) {
    return { id: o.id, label: esc(o.label) };
  });

  var dugaanHTML = D.dugaan
    .map(function (q, i) {
      return (
        '<div class="quiz-item">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        esc(q.tanya) +
        '</p>' +
        buildChoiceGroup(q.opsi, State.dugaanOrders[q.id], {
          chosen: State.dugaanPilih[q.id] || null,
          group: q.id,
          attr: 'data-dugaan',
        }) +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Orientasi Masalah">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🌧️ ' +
        esc(D.judul) +
        '</h2>' +
        '<p class="orientasi-cerita">' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="lpp-galeri">' +
        DATA.desain
          .map(function (d) {
            return (
              '<figure class="lpp-galeri__item">' +
              gambarTandon(d.bangun, 150, { aria: d.nama + ', ' + d.info }) +
              '<figcaption>' +
              esc(d.nama) +
              '<span>' +
              esc(d.info) +
              '</span></figcaption></figure>'
            );
          })
          .join('') +
        '</div>' +
        legendaWarna() +
        '<h3 class="surat-head">✉️ Surat dari Tim Adiwiyata</h3>' +
        '<div class="surat-grid">' +
        D.surat.map(buildSuratCard).join('') +
        '</div>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaan kelompokmu?</h3>' +
        caption(D.catatanDugaan) +
        dugaanHTML +
        '<div style="margin-top:var(--space-5);">' +
        buildTextarea(
          'orientasiAlasan',
          D.alasanLabel,
          D.alasanPlaceholder,
          State.orientasiAlasan
        ) +
        '</div>'
    ) +
    (lengkap
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🎯 Rumuskan masalahnya</h3>' +
            '<p class="exercise-label">' +
            esc(D.pertanyaan) +
            '</p>' +
            buildChoiceGroup(masalahOpsi, State.masalahOrder, {
              chosen: State.masalahPilihan,
              correctId: benar ? D.masalahCorrect : null,
              grade: true,
              locked: benar,
              attr: 'data-masalah',
            }) +
            buildGuidedChoiceFeedback(State.masalahPilihan, benar, umpan) +
            (benar
              ? '<div style="margin-top:var(--space-4);">' +
                buildTextarea(
                  'masalahHipotesis',
                  D.hipotesisLabel,
                  D.hipotesisPlaceholder,
                  State.masalahHipotesis
                ) +
                '</div>'
              : '')
        )
      : '') +
    (lengkap && benar ? buildDlNextButton('orientasiNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-dugaan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.dugaanPilih[btn.dataset.group] = btn.dataset.dugaan;
      saveState();
      renderOrientasi(container);
      var f = container.querySelector(
        '[data-group="' + btn.dataset.group + '"][data-dugaan="' + btn.dataset.dugaan + '"]'
      );
      if (f) f.focus();
    });
  });

  container.querySelectorAll('[data-masalah]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.masalahPilihan === D.masalahCorrect) return;
      State.masalahPilihan = btn.dataset.masalah;
      saveState();
      renderOrientasi(container);
      var f = container.querySelector('[data-masalah="' + btn.dataset.masalah + '"]');
      if (f) f.focus();
    });
  });

  bindTextarea('orientasiAlasan', 'orientasiAlasan');
  bindTextarea('masalahHipotesis', 'masalahHipotesis');

  var nextBtn = document.getElementById('orientasiNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.masalahHipotesis.trim()) {
        showNotice('Tulis hipotesis kelompokmu lebih dulu, walau hanya satu kalimat.');
        return;
      }
      completeStage('orientasi');
      navigateTo('organisasi');
    });
  }
}

/* ============================================================
   6. STAGE: ORGANISASI  (PBL — sintaks 2)
   Pilih peran → pilah informasi → susun rencana penyelesaian.
   ============================================================ */

function renderOrganisasi(container) {
  var D = DATA.organisasi;
  var rerender = function () {
    renderOrganisasi(container);
  };
  var peranOk = !!State.peranPilih;
  var pilahOk = sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);
  var rencanaOk = State.rencanaState.correct;

  container.innerHTML =
    '<section aria-label="Mengorganisasi Belajar">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">👥 ' +
        esc(D.peranLabel) +
        '</h3>' +
        buildChoiceGroup(D.peran, State.peranOrder, {
          chosen: State.peranPilih,
          attr: 'data-peran',
        }) +
        (peranOk
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              'info',
              '🙌',
              'Peranmu: ' +
                findOptionLabel(D.peran, State.peranPilih) +
                ' Tukar peran pada pertemuan berikutnya.'
            ) +
            '</div>'
          : '')
    ) +
    (peranOk
      ? panelJudul(
          '🗂️ ' + D.judulPilah,
          buildSortItems(PILAH_ITEMS, State.pilahOrder, D.opsiPilah, State.pilahStates) +
            (pilahOk
              ? daftarTemuan(
                  '<strong>' +
                    sortItemsCorrectCount(PILAH_ITEMS, State.pilahStates) +
                    ' dari ' +
                    PILAH_ITEMS.length +
                    '</strong> informasi kamu pilah dengan tepat.'
                )
              : '')
        )
      : '') +
    (peranOk && pilahOk
      ? panelJudul(
          '🗺️ ' + D.judulRencana,
          caption(D.instruksiRencana) +
            buildTapOrder('rencana', RENCANA_ITEMS, State.rencanaState, {
              answer: RENCANA_JAWAB,
              startLabel: 'Langkah pertama',
              endLabel: 'Langkah terakhir',
              separator: '→',
              successText: D.rencanaSukses,
            })
        )
      : '') +
    (peranOk && pilahOk && rencanaOk ? buildDlNextButton('organisasiNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-peran]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.peranPilih = btn.dataset.peran;
      saveState();
      rerender();
      var f = container.querySelector('[data-peran="' + btn.dataset.peran + '"]');
      if (f) f.focus();
    });
  });
  if (peranOk) bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  if (peranOk && pilahOk) {
    bindTapOrder(container, 'rencana', State.rencanaState, RENCANA_JAWAB, saveState, rerender);
  }
  bindNext('organisasiNextBtn', 'organisasi', 'selidikIsi');
}

/* ============================================================
   7. STAGE: PENYELIDIKAN 1 — ISI AIR  (PBL — sintaks 3)
   Lab Gabungan (pilih desain, pisah/gabung) → kartu data volume tiga
   desain → keputusan. Pertanyaan keputusan terbuka setelah kartu data
   tuntas dan Lab Gabungan dijelajahi (tiga desain + memisah tandon B).
   ============================================================ */

function renderSelidikIsi(container) {
  var D = DATA.selidikIsi;
  var dataOk = semuaKartuBenar(KARTU_ISI, State.isianIsi);
  var labOk = gbgLabSelesai(State.labGabung, LAB);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.isiPilih);

  function rerender() {
    renderSelidikIsi(container);
  }

  var html =
    '<section aria-label="Penyelidikan Isi Air">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🔬 Lab Gabungan</h3>' +
        caption(D.instruksiLab) +
        buildGbgLab('labGabung', State.labGabung, LAB) +
        legendaWarna()
    ) +
    panelJudul(
      '🧮 Kartu data isi tandon',
      caption(D.instruksiData) + buildLpIsian('isIsi', KARTU_ISI, State.isianIsi)
    );

  if (dataOk && !labOk) {
    html += buildDlPanel(
      buildFeedbackBox(
        'info',
        '🔬',
        'Kartu data tuntas! Coba ketiga desain di Lab Gabungan dan pisahkan bagian tandon B untuk membuka pertanyaan keputusan.'
      )
    );
  }

  if (dataOk && labOk) {
    html += panelJudul(
      '🔎 Ambil keputusan',
      buildGuidedQuizList(TANYA.isi, State.isiOrders, State.isiPilih) +
        (tanyaOk ? daftarTemuan(esc(D.temuan)) : '')
    );
  }

  html +=
    (dataOk && labOk && tanyaOk ? buildDlNextButton('isiNextBtn', D.nextLabel, true) : '') +
    '</section>';

  container.innerHTML = html;

  bindGbgLab(container, 'labGabung', State.labGabung, LAB, function () {
    var sebelum = labOk;
    saveState();
    if (!sebelum && gbgLabSelesai(State.labGabung, LAB) && dataOk) rerender();
  });
  bindLpIsian(container, 'isIsi', KARTU_ISI, State.isianIsi, saveState, rerender);
  bindGuidedQuizList(container, TANYA.isi, State.isiPilih, saveState, rerender);
  bindNext('isiNextBtn', 'selidikIsi', 'selidikPelat');
}

/* ============================================================
   8. STAGE: PENYELIDIKAN 2 — PELAT  (PBL — sintaks 3)
   Tiap tandon: cerita → pemilih sisi gabungan → kartu luas pelat.
   Tandon berikutnya dibuka setelah kartu tandon sebelumnya tepat.
   ============================================================ */

function bendaSelesai(b) {
  return (
    State.sisi[b.id].benar &&
    lpKartuBenar(KARTU_PELAT[b.id], State.isianPelat[KARTU_PELAT[b.id].id])
  );
}

function renderSelidikPelat(container) {
  var D = DATA.selidikPelat;
  var semua = DATA.benda.every(bendaSelesai);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.pelatPilih);

  function rerender() {
    renderSelidikPelat(container);
  }

  var html =
    '<section aria-label="Penyelidikan Pelat Tandon">' + buildHead(D) + paragrafInfo(D.instruksi);
  var terbuka = [];
  for (var i = 0; i < DATA.benda.length; i++) {
    var b = DATA.benda[i];
    terbuka.push(b);
    var st = State.sisi[b.id];
    html += buildDlPanel(
      '<div class="benda-head">' +
        '<div class="benda-head__gambar" aria-hidden="true">' +
        gambarTandon(b.bangun, 130) +
        '</div>' +
        '<div><h3 style="margin:0;">' +
        esc(b.nama) +
        '</h3><p class="benda-head__cerita">' +
        esc(b.cerita) +
        '</p></div>' +
        '</div>' +
        '<p class="exercise-label">Sisi mana saja yang memakai ' +
        esc(b.bahan) +
        '?</p>' +
        buildGbgSisiPicker('ps-' + b.id, b, st) +
        (st.benar
          ? '<div style="margin-top:var(--space-4);">' +
            buildLpIsian('isP-' + b.id, [KARTU_PELAT[b.id]], State.isianPelat) +
            '</div>'
          : '')
    );
    if (!bendaSelesai(b)) break;
  }

  if (semua) {
    html += panelJudul(
      '🔎 Apa yang kamu temukan?',
      buildGuidedQuizList(TANYA.pelat, State.pelatOrders, State.pelatPilih) +
        (tanyaOk ? daftarTemuan(esc(D.temuan)) : '')
    );
  }

  html +=
    (semua && tanyaOk ? buildDlNextButton('pelatNextBtn', D.nextLabel, true) : '') + '</section>';

  container.innerHTML = html;

  terbuka.forEach(function (b) {
    bindGbgSisiPicker(container, 'ps-' + b.id, b, State.sisi[b.id], saveState, rerender);
    bindLpIsian(
      container,
      'isP-' + b.id,
      [KARTU_PELAT[b.id]],
      State.isianPelat,
      saveState,
      rerender
    );
  });
  bindGuidedQuizList(container, TANYA.pelat, State.pelatPilih, saveState, rerender);
  bindNext('pelatNextBtn', 'selidikPelat', 'selidikBiaya');
}

/* ============================================================
   9. STAGE: PENYELIDIKAN 3 — BAHAN & ANGGARAN  (PBL — sintaks 3)
   Kartu pelat, cat, & waktu isi → tabel anggaran → pertanyaan penuntun.
   ============================================================ */

function renderSelidikBiaya(container) {
  var D = DATA.selidikBiaya;
  var kartuOk = semuaKartuBenar(KARTU_BIAYA, State.isianBiaya);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.biayaPilih);

  function rerender() {
    renderSelidikBiaya(container);
  }

  var html =
    '<section aria-label="Penyelidikan Bahan dan Anggaran">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    panelJudul('🧾 Kartu bahan, biaya & waktu', buildLpIsian('isA', KARTU_BIAYA, State.isianBiaya));

  if (kartuOk) {
    html += panelJudul(
      '💰 Anggaran tandon ' + DATA.desainDipilih,
      buildLpAnggaran(ANGGARAN_PILIH, DATA.dana) +
        '<div style="margin-top:var(--space-3);">' +
        buildFeedbackBox(
          REKAP_PILIH.cukup ? 'success' : 'warning',
          REKAP_PILIH.cukup ? '✓' : '⚠',
          REKAP_PILIH.cukup
            ? '<strong>Dana cukup, sisa ' +
                esc(formatRupiah(REKAP_PILIH.sisa)) +
                '.</strong> Sisa ini bisa menjadi dana cadangan perawatan tandon.'
            : '<strong>Dana kurang ' + esc(formatRupiah(-REKAP_PILIH.sisa)) + '.</strong>'
        ) +
        '</div>'
    );
    html += panelJudul(
      '🔎 Periksa pemahamanmu',
      buildGuidedQuizList(TANYA.biaya, State.biayaOrders, State.biayaPilih) +
        (tanyaOk ? daftarTemuan(esc(D.temuan)) : '')
    );
  }

  html +=
    (kartuOk && tanyaOk ? buildDlNextButton('biayaNextBtn', D.nextLabel, true) : '') + '</section>';

  container.innerHTML = html;

  bindLpIsian(container, 'isA', KARTU_BIAYA, State.isianBiaya, saveState, rerender);
  bindGuidedQuizList(container, TANYA.biaya, State.biayaPilih, saveState, rerender);
  bindNext('biayaNextBtn', 'selidikBiaya', 'karya');
}

/* ============================================================
   10. STAGE: MENYAJIKAN KARYA  (PBL — sintaks 4)
   Usulan tandon C → keputusan → Papan Proposal → presentasi.
   ============================================================ */

function buildPapanProposal() {
  var D = DATA.karya;
  var d = DESAIN_BY_ID[DATA.desainDipilih];
  var H = HITUNG.pilih;
  var P = HITUNG.pelat;
  return buildLpProposal({
    judul: D.proposalJudul,
    sub: 'Disusun oleh tim perencana kelompokmu',
    keputusan: [
      {
        ikon: '🛢️',
        judul: 'Desain terpilih',
        isi:
          d.nama +
          ' (' +
          d.info +
          '): isi ' +
          gbgAngka(H.v.prisma) +
          ' + ' +
          gbgAngka(H.v.limas) +
          ' = ' +
          gbgAngka(H.v.total) +
          ' cm³ = ' +
          gbgAngka(H.liter) +
          ' liter, cukup ' +
          H.hari +
          ' hari.',
      },
      {
        ikon: '🧱',
        judul: 'Pelat',
        isi:
          'Sisi luar saja (tanpa bidang sambung), tₛ corong ' +
          gbgAngka(HITUNG.tsCorong) +
          ' cm: ' +
          gbgAngka(P.luas) +
          ' cm² = ' +
          gbgAngka(P.m2) +
          ' m² → ' +
          P.lembar +
          ' lembar pelat.',
      },
      {
        ikon: '🎨',
        judul: 'Cat & keran',
        isi:
          gbgAngka(P.m2) +
          ' m² : ' +
          DATA.cat.luas +
          ' m² → ' +
          P.kaleng +
          ' kaleng cat antikarat, ditambah satu keran penguras.',
      },
      {
        ikon: '🌧️',
        judul: 'Mengisi tandon',
        isi:
          'Talang ' +
          DATA.debitTalang +
          ' liter/menit memenuhi tandon dalam ' +
          formatDurasi(HITUNG.menit) +
          '. Total biaya ' +
          formatRupiah(REKAP_PILIH.total) +
          ', sisa ' +
          formatRupiah(REKAP_PILIH.sisa) +
          ' sebagai dana cadangan.',
      },
    ],
    anggaran: { baris: ANGGARAN_PILIH, dana: DATA.dana },
    penutup: D.penutup,
  });
}

function renderKarya(container) {
  var D = DATA.karya;
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.karyaPilih);
  var p1Ok = State.karyaPilih.p1 === 'kurang';

  function rerender() {
    renderKarya(container);
  }

  var html =
    '<section aria-label="Menyajikan Karya">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    panelJudul(
      '💰 Anggaran hasil penyelidikan (tandon ' + DATA.desainDipilih + ')',
      buildLpAnggaran(ANGGARAN_PILIH, DATA.dana)
    ) +
    panelJudul(
      '🧠 Ambil keputusan kelompok',
      buildGuidedQuizList(TANYA.karya, State.karyaOrders, State.karyaPilih) +
        (p1Ok
          ? '<h4 style="margin:var(--space-4) 0 var(--space-2);">Anggaran bila tandon ' +
            esc(D.usulan) +
            ' yang dibuat</h4>' +
            buildLpAnggaran(ANGGARAN_USULAN, DATA.dana)
          : '')
    );

  if (tanyaOk) {
    html +=
      panelJudul('🪧 Papan Proposal', buildPapanProposal(), 'panel--hero') +
      buildDlPanel(
        buildTextarea(
          'presentasiTeks',
          D.presentasiLabel,
          D.presentasiPlaceholder,
          State.presentasi
        ) + caption('Presentasikan Papan Proposal ini di depan kelas atau dalam galeri berjalan.')
      ) +
      buildDlNextButton('karyaNextBtn', D.nextLabel, true);
  }

  html += '</section>';
  container.innerHTML = html;

  bindGuidedQuizList(container, TANYA.karya, State.karyaPilih, saveState, rerender);
  bindTextarea('presentasiTeks', 'presentasi');

  var nextBtn = document.getElementById('karyaNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.presentasi.trim()) {
        showNotice('Tulis kalimat presentasi kelompokmu lebih dulu.');
        return;
      }
      completeStage('karya');
      navigateTo('evaluasi');
    });
  }
}

/* ============================================================
   11. STAGE: ANALISIS & EVALUASI  (PBL — sintaks 5)
   Nilai lembar kerja Kelompok Kenari → pelajaran → bandingkan dugaan
   awal → evaluasi proses kelompok.
   ============================================================ */

function buildTanggapanDugaan() {
  var D = DATA.evaluasi;
  return DATA.orientasi.dugaan
    .map(function (q) {
      var pilih = State.dugaanPilih[q.id];
      if (!pilih || !D.tanggapanDugaan[q.id][pilih]) return '';
      return (
        '<div class="quiz-item">' +
        '<p class="dl-caption">' +
        esc(q.tanya) +
        ' Dugaanmu: “' +
        esc(findOptionLabel(q.opsi, pilih)) +
        '”</p>' +
        buildFeedbackBox('info', '🔁', esc(D.tanggapanDugaan[q.id][pilih])) +
        '</div>'
      );
    })
    .join('');
}

function renderEvaluasi(container) {
  var D = DATA.evaluasi;
  var lembarOk = sortItemsAllAnswered(LANGKAH_ITEMS, State.langkahStates);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.evalPilih);

  function rerender() {
    renderEvaluasi(container);
  }

  var html =
    '<section aria-label="Analisis dan Evaluasi">' +
    buildHead(D) +
    panelJudul(
      D.lembarJudul,
      caption(D.instruksiLembar) +
        buildSortItems(LANGKAH_ITEMS, State.langkahOrder, D.opsiNilai, State.langkahStates, {
          mono: true,
        }) +
        (lembarOk
          ? daftarTemuan(
              '<strong>' +
                sortItemsCorrectCount(LANGKAH_ITEMS, State.langkahStates) +
                ' dari ' +
                LANGKAH_ITEMS.length +
                '</strong> langkah kamu nilai dengan tepat.'
            )
          : '')
    );

  if (lembarOk) {
    html += panelJudul(
      '💡 Tarik pelajaran',
      buildGuidedQuizList(TANYA.evaluasi, State.evalOrders, State.evalPilih)
    );
  }

  if (lembarOk && tanyaOk) {
    html +=
      panelJudul('🔁 ' + D.dugaanJudul, buildTanggapanDugaan()) +
      buildDlPanel(
        buildTextarea('evalRefleksi', D.refleksiLabel, D.refleksiPlaceholder, State.evalRefleksi)
      ) +
      buildDlNextButton('evaluasiNextBtn', D.nextLabel, true);
  }

  html += '</section>';
  container.innerHTML = html;

  bindSortItems(container, LANGKAH_ITEMS, State.langkahStates, saveState, rerender);
  bindGuidedQuizList(container, TANYA.evaluasi, State.evalPilih, saveState, rerender);
  bindTextarea('evalRefleksi', 'evalRefleksi');

  var nextBtn = document.getElementById('evaluasiNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.evalRefleksi.trim()) {
        showNotice('Tulis evaluasi proses kelompokmu lebih dulu.');
        return;
      }
      completeStage('evaluasi');
      navigateTo('terapkan');
    });
  }
}

/* ============================================================
   12. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal campuran
   'input' (isian bilangan bulat, boleh berpemisah ribuan) dan
   'choice' (opsi diacak lewat ex.optionOrder di initExerciseArrays()).
   ============================================================ */

/* Diagnosa isian soal kontekstual gabungan (engine seksi 60). */
function diagnosaTerapkan(s, ex) {
  var parsed = parseInputInt(ex.userInput, true);
  if (parsed.error) return null;
  var d = diagnosaMasalahGabungan(s.cek, parsed.value);
  return d.kode === 'benar' ? null : d.pesan;
}

function teksJawaban(s) {
  if (s.satuan === 'rupiah') return formatRupiah(s.jawab);
  return formatNumber(s.jawab) + ' ' + s.satuan;
}

var TerapkanStage = createExerciseStage({
  soal: DATA.terapkan.soal,
  getExercises: function () {
    return State.terapkanExercises;
  },
  getIndex: function () {
    return State.terapkanIdx;
  },
  setIndex: function (i) {
    State.terapkanIdx = i;
  },
  save: saveState,
  idPrefix: 'tr',
  sectionLabel: 'Uji Terap',
  kicker: DATA.terapkan.kicker,
  goal: DATA.terapkan.goal,
  instruction: DATA.terapkan.instruksi,
  buildHead: function () {
    return buildHead(DATA.terapkan);
  },
  nextStageId: 'refleksi',
  completeStageId: 'terapkan',
  nextButtonLabel: DATA.terapkan.nextLabel,
  defaultType: 'choice',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  stripPunctuation: true,
  checkValue: function (s) {
    return s.jawab;
  },
  inputAriaLabel: 'Jawaban',
  inputPlaceholder: 'Jawaban',
  inputSuffix: function (s) {
    return '<span class="lpp-satuan">' + esc(s.satuan) + '</span>';
  },
  invalidMessage: 'Masukkan sebuah bilangan bulat (contoh: 96 atau 18.000).',
  inputErrorHTML: function (s, ex) {
    var pesan = diagnosaTerapkan(s, ex);
    return buildFeedbackBox(
      'error',
      '✗',
      'Jawaban <strong>' +
        esc(ex.userInput) +
        '</strong> belum tepat. ' +
        esc(pesan || 'Periksa lagi perhitunganmu atau buka petunjuk.')
    );
  },
  revealText: function (s) {
    return 'Jawabannya <strong>' + esc(teksJawaban(s)) + '</strong>. ' + esc(s.explanation);
  },
  renderPrompt: function (s) {
    var pilihan = (s.type || 'choice') === 'choice';
    return (
      '<div class="dl-prompt">' +
      '<span class="konteks-chip">' +
      esc(s.konteks) +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
      '<p class="dl-prompt__tanya">' +
      esc(s.pertanyaan) +
      '</p>' +
      (pilihan && s.hints && s.hints.length
        ? '<details class="lpp-hint"><summary>💡 Petunjuk</summary><ul>' +
          s.hints
            .map(function (h) {
              return '<li>' + esc(h) + '</li>';
            })
            .join('') +
          '</ul></details>'
        : '') +
      '</div>'
    );
  },
});

function renderTerapkan(container) {
  TerapkanStage.render(container);
}

/* ============================================================
   13. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var isiBenar = banyakKartuBenar(KARTU_ISI, State.isianIsi);
  var sisiSekali = DATA.benda.filter(function (b) {
    return State.sisi[b.id].benar && State.sisi[b.id].coba === 1;
  }).length;
  var biayaBenar = banyakKartuBenar(KARTU_BIAYA, State.isianBiaya);
  var langkahBenar = sortItemsCorrectCount(LANGKAH_ITEMS, State.langkahStates);
  var terapBenar = State.terapkanExercises.filter(function (e) {
    return e.correct;
  }).length;

  function kartu(val, label) {
    return (
      '<div class="summary-card"><div class="summary-card__val">' +
      val +
      '</div><div class="summary-card__label">' +
      label +
      '</div></div>'
    );
  }

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="summary-grid">' +
        kartu(isiBenar + '/' + KARTU_ISI.length, 'Kartu isi tandon tuntas') +
        kartu(sisiSekali + '/' + DATA.benda.length, 'Sisi pelat tepat sekali coba') +
        kartu(biayaBenar + '/' + KARTU_BIAYA.length, 'Kartu anggaran tuntas') +
        kartu(langkahBenar + '/' + LANGKAH_ITEMS.length, 'Langkah Kenari dinilai tepat') +
        kartu(terapBenar + '/' + DATA.terapkan.soal.length, 'Uji terap benar') +
        '</div>'
    ) +
    '<div class="refleksi-list">' +
    D.pertanyaan
      .map(function (q, i) {
        return (
          '<div class="panel panel--compact">' +
          '<span class="refleksi-item__num">Pertanyaan ' +
          (i + 1) +
          ' dari ' +
          D.pertanyaan.length +
          '</span>' +
          '<label for="ref-' +
          q.id +
          '" class="dl-refleksi-q">' +
          esc(q.teks) +
          '</label>' +
          '<textarea id="ref-' +
          q.id +
          '" class="input-textarea" data-rid="' +
          q.id +
          '" placeholder="' +
          esc(q.placeholder) +
          '">' +
          esc(State.refleksiAnswers[q.id] || '') +
          '</textarea>' +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.diriLabel) +
        '</p>' +
        buildChoiceGroup(D.diriOpsi, State.refleksiDiriOrder, { chosen: State.refleksiDiri })
    ) +
    '<div class="btn-group btn-group--spread">' +
    '<span class="dl-caption" style="align-self:center;">Jawaban tersimpan di perangkatmu saja, tidak dikirim ke mana pun.</span>' +
    '<button type="button" class="btn btn--primary" id="refleksiSaveBtn">' +
    esc(D.nextLabel) +
    '</button>' +
    '</div>' +
    '</section>';

  container.querySelectorAll('textarea[data-rid]').forEach(function (ta) {
    ta.addEventListener('input', function () {
      State.refleksiAnswers[ta.dataset.rid] = ta.value;
      saveState();
    });
  });

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.refleksiDiri = btn.dataset.optId;
      saveState();
      renderRefleksi(container);
      var f = container.querySelector('[data-opt-id="' + btn.dataset.optId + '"]');
      if (f) f.focus();
    });
  });

  document.getElementById('refleksiSaveBtn').addEventListener('click', function () {
    if (!State.refleksiDiri) {
      showNotice('Pilih dulu seberapa yakin kamu sekarang.');
      return;
    }
    completeStage('refleksi');
    navigateTo('selesai');
  });
}

/* ============================================================
   14. STAGE: SELESAI
   ============================================================ */

function renderSelesai(container) {
  var D = DATA.selesai;

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="done-card">' +
    '<span class="done-card__icon">🏆</span>' +
    '<h2>' +
    esc(D.judul) +
    '</h2>' +
    '<p class="done-card__lead">' +
    esc(D.teks) +
    '</p>' +
    '<div class="sajian-trio">' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">🧊</span>V gabungan = V prisma + ⅓ × La × t limas</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">🔗</span>Luas permukaan: bidang sambung tidak dihitung</div>' +
    '<div class="sajian-card sajian-card--utama"><span class="sajian-card__ikon" aria-hidden="true">↕️</span>Bahan dibeli bulat ke atas, hari terpenuhi bulat ke bawah</div>' +
    '</div>' +
    '<div class="panel panel--hero done-card__list">' +
    '<h3 style="margin-top:0;">Yang sudah kamu capai</h3>' +
    '<ol class="objectives-list">' +
    D.capaian
      .map(function (c, i) {
        return '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + esc(c) + '</li>';
      })
      .join('') +
    '</ol>' +
    '</div>' +
    '<div class="feedback-box feedback-box--info done-card__note">' +
    '<span class="feedback-box__icon">📌</span>' +
    '<div class="feedback-box__body">' +
    '<strong>Catatan untuk Guru:</strong><br>' +
    'Rekap pada tahap Refleksi adalah indikator latihan digital, bukan nilai akhir. ' +
    'Papan Proposal, kalimat presentasi, dan evaluasi proses kelompok menjadi bahan asesmen kinerja penyelesaian masalah.' +
    '</div></div>' +
    '<div class="btn-group btn-group--center">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '<button type="button" class="btn btn--outline-primary" id="reviewBtn">Tinjau Ulang</button>' +
    '</div>' +
    '</div>' +
    '</section>';

  completeStage('selesai');

  document.getElementById('reviewBtn').addEventListener('click', function () {
    navigateTo('orientasi');
  });
}

/* ============================================================
   15. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  organisasi: renderOrganisasi,
  selidikIsi: renderSelidikIsi,
  selidikPelat: renderSelidikPelat,
  selidikBiaya: renderSelidikBiaya,
  karya: renderKarya,
  evaluasi: renderEvaluasi,
  terapkan: renderTerapkan,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  var fn = RENDERERS[State.currentStage] || RENDERERS.orientasi;
  fn(container);
}

/* ============================================================
   16. HELPER UI — MODAL RESET
   ============================================================ */

function showResetModal() {
  var modal = document.getElementById('resetModal');
  if (modal) modal.style.display = 'flex';
}

function hideResetModal() {
  var modal = document.getElementById('resetModal');
  if (modal) modal.style.display = 'none';
}

/* ============================================================
   17. INIT
   ============================================================ */

function init() {
  buildStageNav();
  loadState();
  if (STAGES.indexOf(State.currentStage) === -1) State.currentStage = 'orientasi';
  initExerciseArrays();
  saveState();
  updateStageNav();
  updateProgress();
  renderCurrentStage();

  var resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn) resetBtn.addEventListener('click', showResetModal);

  var cancelBtn = document.getElementById('resetCancelBtn');
  if (cancelBtn) cancelBtn.addEventListener('click', hideResetModal);

  var confirmBtn = document.getElementById('resetConfirmBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      hideResetModal();
      clearState();
      saveState();
      updateStageNav();
      updateProgress();
      navigateTo('orientasi');
    });
  }

  var modal = document.getElementById('resetModal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) hideResetModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideResetModal();
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
