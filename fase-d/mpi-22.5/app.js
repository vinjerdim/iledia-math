'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Masalah Kontekstual Volume Prisma
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox, formatRupiah,
   formatNumber, parseInputInt, createStageMachine, createExerciseStage,
   createStore, ensureExerciseArray, optionIds, komponen umum
   (ensureShuffledOrder, buildDiscoveryHead, buildTeacherNote,
   buildTpPanel, buildChoiceGroup, buildDlPanel, buildDlNextButton,
   findOptionLabel, ensureSortStates, buildSortItems, bindSortItems,
   sortItemsAllAnswered, sortItemsCorrectCount, ensureTapOrderState,
   buildTapOrder, bindTapOrder, buildGuidedQuizList, bindGuidedQuizList,
   guidedQuizAllCorrect, buildGuidedChoiceFeedback), kartu isian
   bagian 47 (ukuranAlasPrisma, lppAngka, lppBulat, ensureLpIsianState,
   buildLpIsian, bindLpIsian, lpKartuBenar), bagian 48 (banyakWadah,
   rekapAnggaran, lpkSaring, buildLpAnggaran, buildLpProposal), kartu
   surat bagian 49 (buildSuratCard), volume prisma bagian 54
   (volumePrismaAlas, konversiVolume, tinggiDariVolume, VPR_PESAN), dan
   masalah kontekstual volume prisma bagian 55 (waktuIsi, formatDurasi,
   persenIsi, volumeAir, banyakMuatKepadatan, kandidatMasalahVolume,
   diagnosaMasalahVolume, pengecohMasalahVolume, buildVpRebahSVG,
   ensureVpAirState, buildVpAirLab, bindVpAirLab).

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
    5. Stage: Orientasi Masalah       (PBL sintaks 1)
    6. Stage: Organisasi              (PBL sintaks 2)
    7. Stage: Penyelidikan Kolam      (PBL sintaks 3)
    8. Stage: Penyelidikan Pengisian  (PBL sintaks 3)
    9. Stage: Penyelidikan Tinggi Air (PBL sintaks 3)
   10. Stage: Menyajikan Karya        (PBL sintaks 4)
   11. Stage: Analisis & Evaluasi     (PBL sintaks 5)
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
  'selidikKolam',
  'selidikIsi',
  'selidikAir',
  'karya',
  'evaluasi',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Masalah',
  'Organisasi',
  'Kolam',
  'Pengisian',
  'Tinggi Air',
  'Karya',
  'Evaluasi',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-22-5-masalah-volume-prisma-v1';

var KOLAM_BY_ID = {};
DATA.kolam.forEach(function (k) {
  KOLAM_BY_ID[k.id] = k;
});

var AIR_CFG = {
  wadah: DATA.bak,
  target: konversiVolume(DATA.targetLiter, 'l', 'cm3'),
};

/* Ukuran satu kolam: luas alas penampang, volume, banyak ikan aman. */
function ukuranKolam(k) {
  var la = ukuranAlasPrisma(k.penampang).luas;
  var v = volumePrismaAlas(k.penampang, k.panjang);
  return { la: la, v: v, ikan: banyakMuatKepadatan(v, DATA.kepadatan) };
}

function gambarKolam(k, lebar) {
  return buildVpRebahSVG(k.penampang, k.panjang, {
    lebar: lebar || 240,
    satuan: 'm',
    aria: k.nama + ' (' + k.bentuk + '): ' + k.info + '. Sisi jingga adalah alas prisma.',
  });
}

/* Semua hitungan kunci masalah kolam, dari DATA + engine seksi 47–55. */
var HITUNG = (function () {
  var b = ukuranKolam(KOLAM_BY_ID.B);
  var h = { vB: b.v, ikanB: b.ikan };
  h.liter = konversiVolume(h.vB, 'm3', 'l');
  h.tandonM3 = volumePrismaAlas(DATA.tandon.alas, DATA.tandon.t);
  h.tandonL = konversiVolume(h.tandonM3, 'm3', 'l');
  h.isiUlang = banyakWadah(h.liter, h.tandonL);
  h.menit = waktuIsi(h.liter, DATA.pompa.debit);
  h.jam = Math.floor(h.menit / 60);
  h.sisaMenit = lppBulat(h.menit - 60 * h.jam);
  h.beliM3 = lppBulat(h.vB - h.tandonM3);
  h.biayaAir = kandidatMasalahVolume({
    jenis: 'biaya',
    kebutuhan: h.vB,
    tersedia: h.tandonM3,
    harga: DATA.pdam.harga,
  }).benar;
  h.biayaBibit = DATA.bibit.banyak * DATA.bibit.harga;
  h.hari1Liter = DATA.pompa.batasMenit * DATA.pompa.debit;
  h.hari2Menit = lppBulat(h.menit - DATA.pompa.batasMenit);
  h.laBak = ukuranAlasPrisma(DATA.bak.alas).luas;
  h.tinggiBak = tinggiDariVolume(AIR_CFG.target, h.laBak);
  h.persenBak = persenIsi(AIR_CFG.target, volumeAir(DATA.bak.alas, DATA.bak.t));
  return h;
})();

var ANGGARAN = [
  {
    id: 'air',
    nama: '💧 Air PDAM',
    rincian: lppAngka(HITUNG.beliM3) + ' m³ × ' + formatRupiah(DATA.pdam.harga),
    biaya: HITUNG.biayaAir,
  },
  {
    id: 'bibit',
    nama: '🐟 Bibit nila',
    rincian: DATA.bibit.banyak + ' ekor × ' + formatRupiah(DATA.bibit.harga),
    biaya: HITUNG.biayaBibit,
  },
];
var REKAP = rekapAnggaran(ANGGARAN, DATA.dana);

var PESAN_SETENGAH =
  'Luas segitiga/trapesium memakai ½. Hasilmu dua kali lipat luas alas yang sebenarnya.';

/* Tahap 3 — kartu data satu kolam. */
function buatKartuKolam(k) {
  var m = ukuranKolam(k);
  return {
    id: 'kolam-' + k.id,
    judul: k.nama + ' · ' + k.bentuk,
    visual:
      '<div class="vpr-data-visual">' +
      gambarKolam(k, 200) +
      '<p class="dl-caption">Alas: ' +
      esc(k.infoAlas) +
      ' Tinggi prisma (jarak kedua alas) ' +
      esc(lppAngka(k.panjang)) +
      ' m.</p></div>',
    hints: [
      'Luas alas = ' + k.caraLuasAlas + '.',
      'V = luas alas × tinggi prisma.',
      'Banyak ikan aman = V × 25, lalu bulatkan ke bawah bila tidak bulat.',
    ],
    fields: [
      {
        id: 'la',
        label: 'Luas alas (La)',
        jawab: m.la,
        satuan: 'm²',
        pengecoh: k.adaSetengah
          ? lpkSaring([{ nilai: 2 * m.la, pesan: PESAN_SETENGAH }], m.la)
          : [],
      },
      {
        id: 't',
        label: 'Tinggi prisma (t)',
        jawab: k.panjang,
        satuan: 'm',
        diberikan: true,
      },
      {
        id: 'v',
        label: '<strong>Volume (V)</strong>',
        jawab: m.v,
        satuan: 'm³',
        pengecoh: pengecohMasalahVolume({
          jenis: 'volume',
          luasAlas: m.la,
          tinggi: k.panjang,
          adaSetengah: k.adaSetengah,
        }),
      },
      {
        id: 'ikan',
        label: 'Ikan yang aman',
        jawab: m.ikan,
        satuan: 'ekor',
        angka: true,
        pengecoh: pengecohMasalahVolume({ jenis: 'kepadatan', volume: m.v, per: DATA.kepadatan }),
      },
    ],
  };
}

/* Tahap 4 — kartu kebutuhan air, tandon, pompa, dan biaya PDAM. */
function buatKartuIsi() {
  var H = HITUNG;
  var liter = {
    id: 'isi-liter',
    judul: '💧 Air untuk kolam B',
    hints: ['1 m³ = 1.000 dm³ = 1.000 liter.'],
    fields: [
      { id: 'v', label: 'Volume kolam B', jawab: H.vB, satuan: 'm³', diberikan: true },
      {
        id: 'l',
        label: 'Air yang dibutuhkan',
        jawab: H.liter,
        satuan: 'liter',
        angka: true,
        pengecoh: pengecohMasalahVolume({ jenis: 'konversi', nilai: H.vB, dari: 'm3', ke: 'l' }),
      },
    ],
  };
  var tandon = {
    id: 'isi-tandon',
    judul: '🛢️ Tandon air hujan (balok 1 m × 1 m × 2 m)',
    hints: [
      'Volume tandon = 1 × 1 × 2 m³, lalu ubah ke liter.',
      'Banyak kali mengisi = air dibutuhkan : isi tandon, lalu bulatkan KE ATAS.',
    ],
    fields: [
      {
        id: 'v',
        label: 'Volume tandon',
        jawab: H.tandonM3,
        satuan: 'm³',
        pengecoh: pengecohMasalahVolume({ jenis: 'volume', luasAlas: 1, tinggi: DATA.tandon.t }),
      },
      {
        id: 'l',
        label: 'Isi tandon',
        jawab: H.tandonL,
        satuan: 'liter',
        angka: true,
        pengecoh: pengecohMasalahVolume({
          jenis: 'konversi',
          nilai: H.tandonM3,
          dari: 'm3',
          ke: 'l',
        }),
      },
      {
        id: 'n',
        label: 'Banyak kali tandon diisi penuh',
        jawab: H.isiUlang,
        satuan: 'kali',
        pengecoh: pengecohMasalahVolume({
          jenis: 'isiUlang',
          volume: H.liter,
          isiWadah: H.tandonL,
        }),
      },
    ],
  };
  var pompa = {
    id: 'isi-pompa',
    judul: '⚙️ Lama pompa bekerja',
    hints: ['Waktu = volume : debit.', '1 jam = 60 menit. 440 menit = … jam … menit.'],
    fields: [
      { id: 'l', label: 'Air yang dibutuhkan', jawab: H.liter, satuan: 'liter', diberikan: true },
      {
        id: 'd',
        label: 'Debit pompa',
        jawab: DATA.pompa.debit,
        satuan: 'liter/menit',
        diberikan: true,
      },
      {
        id: 'menit',
        label: 'Waktu pompa',
        jawab: H.menit,
        satuan: 'menit',
        angka: true,
        pengecoh: pengecohMasalahVolume({
          jenis: 'waktu',
          volume: H.liter,
          debit: DATA.pompa.debit,
          volumeAsal: H.vB,
        }),
      },
      {
        id: 'jam',
        label: 'Dalam jam: … jam',
        jawab: H.jam,
        satuan: 'jam',
        pengecoh: lpkSaring(
          [
            {
              nilai: lppBulat(H.menit / 60),
              pesan: 'Tulis jam utuhnya saja; sisanya ditulis di kotak menit.',
            },
          ],
          H.jam
        ),
      },
      {
        id: 'sisa',
        label: '… dan sisa menit',
        jawab: H.sisaMenit,
        satuan: 'menit',
      },
    ],
  };
  var pdam = {
    id: 'isi-pdam',
    judul: '🚰 Biaya air PDAM',
    hints: [
      'Air hujan di tandon sudah ada 2 m³ (satu kali penuh).',
      'Biaya = (kebutuhan − air hujan) × harga per m³.',
    ],
    fields: [
      { id: 'v', label: 'Kebutuhan air', jawab: H.vB, satuan: 'm³', diberikan: true },
      {
        id: 'hujan',
        label: 'Air hujan tersedia',
        jawab: H.tandonM3,
        satuan: 'm³',
        diberikan: true,
      },
      {
        id: 'beli',
        label: 'Air yang dibeli',
        jawab: H.beliM3,
        satuan: 'm³',
        pengecoh: lpkSaring([{ nilai: H.vB, pesan: VPK_PESAN['lupa-kurang'] }], H.beliM3),
      },
      {
        id: 'biaya',
        label: 'Biaya air PDAM',
        jawab: H.biayaAir,
        awalan: 'Rp',
        angka: true,
        pengecoh: pengecohMasalahVolume({
          jenis: 'biaya',
          kebutuhan: H.vB,
          tersedia: H.tandonM3,
          harga: DATA.pdam.harga,
          faktorSatuan: 1000,
        }),
      },
    ],
  };
  return [liter, tandon, pompa, pdam];
}

/* Tahap 5 — kartu pembuktian tinggi air bak. */
function buatKartuAir() {
  var H = HITUNG;
  return {
    id: 'air-bak',
    judul: '🛁 Buktikan tinggi air bak',
    hints: [
      'Luas alas = ½ × 60 × 50.',
      '60 liter = 60 × 1.000 cm³.',
      'Tinggi air = volume : luas alas.',
    ],
    temuan:
      'Tinggi air <strong>' +
      esc(lppAngka(H.tinggiBak)) +
      ' cm</strong>, sama dengan temuan di Lab Isi Air. Bak terisi ' +
      esc(lppAngka(H.persenBak)) +
      '%.',
    fields: [
      {
        id: 'la',
        label: 'Luas alas bak',
        jawab: H.laBak,
        satuan: 'cm²',
        angka: true,
        pengecoh: lpkSaring([{ nilai: 2 * H.laBak, pesan: PESAN_SETENGAH }], H.laBak),
      },
      {
        id: 'v',
        label: 'Volume air',
        jawab: AIR_CFG.target,
        satuan: 'cm³',
        angka: true,
        pengecoh: pengecohMasalahVolume({
          jenis: 'konversi',
          nilai: DATA.targetLiter,
          dari: 'l',
          ke: 'cm3',
        }),
      },
      {
        id: 't',
        label: '<strong>Tinggi air</strong>',
        jawab: H.tinggiBak,
        satuan: 'cm',
        angka: true,
        pengecoh: pengecohMasalahVolume({
          jenis: 'tinggi',
          volume: AIR_CFG.target,
          luasAlas: H.laBak,
          adaSetengah: true,
        }),
      },
    ],
  };
}

var KARTU_KOLAM = DATA.kolam.map(buatKartuKolam);
var KARTU_ISI = buatKartuIsi();
var KARTU_AIR = [buatKartuAir()];

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

  /* Tahap 3 — kolam */
  isianKolam: null,
  kolamOrders: {},
  kolamPilih: {},

  /* Tahap 4 — pengisian */
  isianIsi: null,
  isiOrders: {},
  isiPilih: {},

  /* Tahap 5 — tinggi air */
  labAir: null,
  isianAir: null,
  airOrders: {},
  airPilih: {},

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
  ensureLpIsianState(State, 'isianKolam', KARTU_KOLAM);
  ensureGuidedOrders('kolamOrders', 'kolamPilih', DATA.selidikKolam.tanya);

  /* Tahap 4 */
  ensureLpIsianState(State, 'isianIsi', KARTU_ISI);
  ensureGuidedOrders('isiOrders', 'isiPilih', DATA.selidikIsi.tanya);

  /* Tahap 5 */
  ensureVpAirState(State, 'labAir', AIR_CFG);
  ensureLpIsianState(State, 'isianAir', KARTU_AIR);
  ensureGuidedOrders('airOrders', 'airPilih', DATA.selidikAir.tanya);

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
  kolam: tanyaAman(DATA.selidikKolam.tanya),
  isi: tanyaAman(DATA.selidikIsi.tanya),
  air: tanyaAman(DATA.selidikAir.tanya),
  karya: tanyaAman(DATA.karya.tanya),
  evaluasi: tanyaAman(DATA.evaluasi.tanya),
};

var LEGENDA =
  '<p class="vpk-legenda">' +
  '<span><span class="vpk-legenda__warna" aria-hidden="true"></span>Alas prisma</span>' +
  '<span><span class="vpk-legenda__warna vpk-legenda__warna--air" aria-hidden="true"></span>Permukaan air</span>' +
  '</p>';

function galeriKolam() {
  return (
    '<div class="vpk-galeri">' +
    DATA.kolam
      .map(function (k) {
        return (
          '<figure class="vpk-galeri__item">' +
          gambarKolam(k, 220) +
          '<figcaption>' +
          esc(k.nama) +
          '<span>' +
          esc(k.info) +
          '</span></figcaption></figure>'
        );
      })
      .join('') +
    '</div>' +
    LEGENDA
  );
}

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
      '<h2 style="margin-top:0;">🐟 ' +
        esc(D.judul) +
        '</h2>' +
        '<p class="orientasi-cerita">' +
        esc(D.pengantar) +
        '</p>' +
        galeriKolam() +
        '<h3 class="surat-head">✉️ Surat dari OSIS</h3>' +
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
  bindNext('organisasiNextBtn', 'organisasi', 'selidikKolam');
}

/* ============================================================
   7. STAGE: PENYELIDIKAN 1 — DESAIN KOLAM  (PBL — sintaks 3)
   Kenali alas prisma rebah → kartu data La, V, ikan → keputusan.
   ============================================================ */

function renderSelidikKolam(container) {
  var D = DATA.selidikKolam;
  var dataOk = semuaKartuBenar(KARTU_KOLAM, State.isianKolam);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.kolamPilih);

  function rerender() {
    renderSelidikKolam(container);
  }

  var html =
    '<section aria-label="Penyelidikan Desain Kolam">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    panelJudul(
      '🧮 Kartu data kolam',
      caption(D.instruksiData) + LEGENDA + buildLpIsian('isK', KARTU_KOLAM, State.isianKolam)
    );

  if (dataOk) {
    html += panelJudul(
      '🔎 Ambil keputusan',
      buildGuidedQuizList(TANYA.kolam, State.kolamOrders, State.kolamPilih) +
        (tanyaOk ? daftarTemuan(esc(D.temuan)) : '')
    );
  }

  html +=
    (dataOk && tanyaOk ? buildDlNextButton('kolamNextBtn', D.nextLabel, true) : '') + '</section>';

  container.innerHTML = html;

  bindLpIsian(container, 'isK', KARTU_KOLAM, State.isianKolam, saveState, rerender);
  bindGuidedQuizList(container, TANYA.kolam, State.kolamPilih, saveState, rerender);
  bindNext('kolamNextBtn', 'selidikKolam', 'selidikIsi');
}

/* ============================================================
   8. STAGE: PENYELIDIKAN 2 — MENGISI KOLAM  (PBL — sintaks 3)
   Kartu liter, tandon, pompa, PDAM → pertanyaan penuntun.
   ============================================================ */

function renderSelidikIsi(container) {
  var D = DATA.selidikIsi;
  var kartuOk = semuaKartuBenar(KARTU_ISI, State.isianIsi);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.isiPilih);

  function rerender() {
    renderSelidikIsi(container);
  }

  var html =
    '<section aria-label="Penyelidikan Mengisi Kolam">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    panelJudul('🧾 Kartu kebutuhan air', buildLpIsian('isI', KARTU_ISI, State.isianIsi));

  if (kartuOk) {
    html += panelJudul(
      '🔎 Periksa pemahamanmu',
      buildGuidedQuizList(TANYA.isi, State.isiOrders, State.isiPilih) +
        (tanyaOk ? daftarTemuan(esc(D.temuan)) : '')
    );
  }

  html +=
    (kartuOk && tanyaOk ? buildDlNextButton('isiNextBtn', D.nextLabel, true) : '') + '</section>';

  container.innerHTML = html;

  bindLpIsian(container, 'isI', KARTU_ISI, State.isianIsi, saveState, rerender);
  bindGuidedQuizList(container, TANYA.isi, State.isiPilih, saveState, rerender);
  bindNext('isiNextBtn', 'selidikIsi', 'selidikAir');
}

/* ============================================================
   9. STAGE: PENYELIDIKAN 3 — TINGGI AIR BAK  (PBL — sintaks 3)
   Lab Isi Air (eksplorasi) → kartu pembuktian → pertanyaan penuntun.
   ============================================================ */

function renderSelidikAir(container) {
  var D = DATA.selidikAir;
  var labOk = State.labAir.tercapai;
  var kartuOk = semuaKartuBenar(KARTU_AIR, State.isianAir);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.airPilih);

  function rerender() {
    renderSelidikAir(container);
  }

  var html =
    '<section aria-label="Penyelidikan Tinggi Air Bak">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    panelJudul(
      '🔬 Lab Isi Air',
      caption('Geser penggeser atau tekan tombol ± untuk mengubah tinggi air.') +
        buildVpAirLab('labAir', State.labAir, AIR_CFG)
    );

  if (labOk) {
    html += panelJudul(
      '🧮 Kartu pembuktian',
      caption(D.instruksiData) + buildLpIsian('isA', KARTU_AIR, State.isianAir)
    );
  }
  if (labOk && kartuOk) {
    html += panelJudul(
      '🔎 Apa yang kamu temukan?',
      buildGuidedQuizList(TANYA.air, State.airOrders, State.airPilih) +
        (tanyaOk ? daftarTemuan(esc(D.temuan)) : '')
    );
  }

  html +=
    (labOk && kartuOk && tanyaOk ? buildDlNextButton('airNextBtn', D.nextLabel, true) : '') +
    '</section>';

  container.innerHTML = html;

  bindVpAirLab(container, 'labAir', State.labAir, AIR_CFG, function (jenis) {
    saveState();
    if (jenis === 'tercapai') {
      showNotice('Tepat 60 liter! Sekarang buktikan dengan hitungan.');
      rerender();
      var f = container.querySelector('#labAir [data-vpk-h]');
      if (f) f.focus();
    }
  });
  bindLpIsian(container, 'isA', KARTU_AIR, State.isianAir, saveState, rerender);
  bindGuidedQuizList(container, TANYA.air, State.airPilih, saveState, rerender);
  bindNext('airNextBtn', 'selidikAir', 'karya');
}

/* ============================================================
   10. STAGE: MENYAJIKAN KARYA  (PBL — sintaks 4)
   Keputusan kolam & jadwal pompa → Papan Proposal → presentasi.
   ============================================================ */

function buildPapanProposal() {
  var D = DATA.karya;
  var H = HITUNG;
  var B = KOLAM_BY_ID.B;
  return buildLpProposal({
    judul: D.proposalJudul,
    sub: 'Disusun oleh tim perencana kelompokmu',
    keputusan: [
      {
        ikon: '🏞️',
        judul: 'Kolam',
        isi:
          B.nama +
          ' (' +
          B.bentuk +
          '): V = ' +
          lppAngka(ukuranAlasPrisma(B.penampang).luas) +
          ' m² × ' +
          lppAngka(B.panjang) +
          ' m = ' +
          lppAngka(H.vB) +
          ' m³, aman untuk ' +
          H.ikanB +
          ' ekor (dibutuhkan ' +
          DATA.kebutuhanIkan +
          ').',
      },
      {
        ikon: '💧',
        judul: 'Air',
        isi:
          lppAngka(H.liter) +
          ' liter. Tandon ' +
          lppAngka(H.tandonL) +
          ' liter harus diisi ' +
          H.isiUlang +
          ' kali; karena air hujan hanya satu tandon, ' +
          lppAngka(H.beliM3) +
          ' m³ dibeli dari PDAM.',
      },
      {
        ikon: '⚙️',
        judul: 'Jadwal pompa',
        isi:
          'Total ' +
          formatDurasi(H.menit) +
          '. Hari 1: ' +
          DATA.pompa.batasMenit +
          ' menit (' +
          lppAngka(H.hari1Liter) +
          ' liter); hari 2: ' +
          lppAngka(H.hari2Menit) +
          ' menit lagi.',
      },
      {
        ikon: '🛁',
        judul: 'Bak karantina',
        isi:
          'Isi air setinggi ' +
          lppAngka(H.tinggiBak) +
          ' cm agar tepat ' +
          DATA.targetLiter +
          ' liter (' +
          lppAngka(H.persenBak) +
          '% bak).',
      },
    ],
    anggaran: { baris: ANGGARAN, dana: DATA.dana },
    penutup: D.penutup,
  });
}

function renderKarya(container) {
  var D = DATA.karya;
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.karyaPilih);

  function rerender() {
    renderKarya(container);
  }

  var html =
    '<section aria-label="Menyajikan Karya">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    panelJudul(
      '💰 Anggaran hasil penyelidikan',
      buildLpAnggaran(ANGGARAN, DATA.dana) +
        '<div style="margin-top:var(--space-3);">' +
        buildFeedbackBox(
          REKAP.cukup ? 'success' : 'warning',
          REKAP.cukup ? '✓' : '⚠',
          REKAP.cukup
            ? 'Dana cukup, masih bersisa ' + esc(formatRupiah(REKAP.sisa)) + '.'
            : 'Dana kurang ' + esc(formatRupiah(-REKAP.sisa)) + '.'
        ) +
        '</div>'
    ) +
    panelJudul(
      '🧠 Ambil keputusan kelompok',
      buildGuidedQuizList(TANYA.karya, State.karyaOrders, State.karyaPilih)
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
   Nilai lembar kerja Kelompok Cupang → pelajaran → bandingkan dugaan
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

/* Diagnosa isian soal kontekstual (engine seksi 55). */
function diagnosaTerapkan(s, ex) {
  var parsed = parseInputInt(ex.userInput, true);
  if (parsed.error) return null;
  var d = diagnosaMasalahVolume(s.cek, parsed.value);
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
  invalidMessage: 'Masukkan sebuah bilangan bulat (contoh: 72 atau 1.500).',
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
    var jawab = s.options ? findOptionLabel(s.options, s.correct) : teksJawaban(s);
    return 'Jawabannya <strong>' + esc(jawab) + '</strong>. ' + esc(s.explanation);
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
  var kolamBenar = banyakKartuBenar(KARTU_KOLAM, State.isianKolam);
  var isiBenar = banyakKartuBenar(KARTU_ISI, State.isianIsi);
  var airBenar = banyakKartuBenar(KARTU_AIR, State.isianAir) + (State.labAir.tercapai ? 1 : 0);
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
        kartu(kolamBenar + '/' + KARTU_KOLAM.length, 'Kartu kolam tuntas') +
        kartu(isiBenar + '/' + KARTU_ISI.length, 'Kartu pengisian tuntas') +
        kartu(airBenar + '/2', 'Lab & kartu tinggi air') +
        kartu(langkahBenar + '/' + LANGKAH_ITEMS.length, 'Langkah Cupang dinilai tepat') +
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
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">🔍</span>Kenali alas & tinggi prisma (bisa rebah)</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">📐</span>V = luas alas × tinggi</div>' +
    '<div class="sajian-card sajian-card--utama"><span class="sajian-card__ikon" aria-hidden="true">🔁</span>Satuan & pembulatan sesuai konteks</div>' +
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
  selidikKolam: renderSelidikKolam,
  selidikIsi: renderSelidikIsi,
  selidikAir: renderSelidikAir,
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
