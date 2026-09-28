'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Volume Limas
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox,
   createStageMachine, createExerciseStage, createStore,
   ensureExerciseArray, optionIds, komponen Discovery Learning
   (ensureShuffledOrder, orderByIds, buildDiscoveryHead,
   buildTeacherNote, buildTpPanel, buildChoiceGroup, buildDlPanel,
   buildDlNextButton, makeDlStep, buildDlStep, bindDlStep,
   ensureSortStates, buildSortItems, bindSortItems,
   sortItemsAllAnswered, sortItemsCorrectCount, buildGuidedQuizList,
   bindGuidedQuizList, guidedQuizAllCorrect), kartu isian berdiagnosa
   seksi 47 (ukuranAlasPrisma, lppAngka, ensureLpIsianState,
   buildLpIsian, bindLpIsian, lpKartuBenar), volume prisma seksi 54
   (volumePrisma), gambar limas seksi 56 (modelLimas, garisTinggiLimas,
   buildPrismSVG), tinggi limas seksi 57 (apotemaAlas,
   alasLimasBeraturan, tinggiLimasDariSisiTegak), serta komponen volume
   limas seksi 59 (volumeLimas, kandidatVolumeLimas,
   diagnosaVolumeLimas, pengecohVolumeLimas, belahKubusLimas,
   buildVlmLimasSVG, vlTuangGambar, ensureVlTuangState,
   buildVlTuangLab, bindVlTuangLab, vlTuangSelesai,
   ensureVlBelahState, buildVlBelahKubus, bindVlBelahKubus).

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaan dan rangkaian aktivitasnya.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI saat
   state disiapkan (initExerciseArrays), lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat-lompat
   ketika tahap dirender ulang, tetapi teracak ulang setiap Reset.

   Bagian:
    1. Konstanta & kartu isian
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi            (DL sintaks 1)
    6. Stage: Identifikasi Masalah (DL sintaks 2)
    7. Stage: Lab Tuang            (DL sintaks 3)
    8. Stage: Belah Kubus          (DL sintaks 3)
    9. Stage: Mengolah Data        (DL sintaks 4)
   10. Stage: Pembuktian           (DL sintaks 5)
   11. Stage: Menarik Kesimpulan   (DL sintaks 6)
   12. Stage: Uji Terap
   13. Stage: Refleksi
   14. Stage: Selesai
   15. Router Render
   16. Helper UI (modal reset)
   17. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA & KARTU ISIAN
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'tuang',
  'belah',
  'olah',
  'verifikasi',
  'generalisasi',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Stimulasi',
  'Masalah',
  'Tuang',
  'Belah',
  'Olah',
  'Bukti',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-22-9-volume-limas-v1';

var LIMAS_BY_ID = {};
DATA.limas.forEach(function (b) {
  LIMAS_BY_ID[b.id] = b;
});

function daftarLimas(ids) {
  return ids.map(function (id) {
    return LIMAS_BY_ID[id];
  });
}

var LAB_LIMAS = daftarLimas(DATA.tuang.lab);
var LAB_OPTS = {
  pasangan: LAB_LIMAS.map(function (b) {
    return { id: b.id, nama: b.nama, alas: b.alas, t: b.t, info: b.infoAlas };
  }),
};
var LIMAS_OLAH = daftarLimas(DATA.olah.limasIds);
var KUBUS = DATA.belah.kubus;
var BELAH = belahKubusLimas(KUBUS.s);

/* Ringkasan ukuran satu limas: luas alas, keliling, V prisma & V limas. */
function ukuranLimas(b) {
  var u = ukuranAlasPrisma(b.alas);
  return {
    la: u.luas,
    keliling: u.keliling,
    vp: volumePrisma(u.luas, b.t),
    vl: volumeLimas(u.luas, b.t),
    o: { luasAlas: u.luas, tinggi: b.t, adaSetengah: !!b.adaSetengah },
  };
}

/* Pengecoh unik yang tidak sama dengan jawaban benar. */
function saringPengecoh(list, jawab) {
  var dipakai = [];
  return list.filter(function (p) {
    if (hampirSama(p.nilai, jawab)) return false;
    var ada = dipakai.some(function (v) {
      return hampirSama(v, p.nilai);
    });
    if (ada) return false;
    dipakai.push(p.nilai);
    return true;
  });
}

function cara(teks) {
  return ' <span class="lpp-cara">(' + esc(teks) + ')</span>';
}

/* Isian luas alas (pengecoh lupa ½ untuk alas segitiga, keliling). */
function fieldLuasAlas(b, m) {
  return {
    id: 'la',
    label: 'Luas alas (La)' + cara(b.caraLuasAlas),
    jawab: m.la,
    satuan: 'cm²',
    pengecoh: saringPengecoh(
      [
        b.adaSetengah
          ? {
              nilai: 2 * m.la,
              pesan: 'Hasilmu dua kali lipat. Luas segitiga = ½ × alas × tinggi.',
            }
          : null,
        {
          nilai: m.keliling,
          pesan: 'Itu keliling alas. Luas menghitung daerah di dalamnya.',
        },
      ].filter(Boolean),
      m.la
    ),
  };
}

/* Isian V limas dengan pengecoh miskonsepsi seksi 59. */
function fieldVolumeLimas(id, label, m) {
  return {
    id: id,
    label: label,
    jawab: m.vl,
    satuan: 'cm³',
    pengecoh: pengecohVolumeLimas(m.o),
  };
}

/* Tahap 3 — kartu satu pasangan Lab Tuang. */
function buatKartuTuang(b) {
  var m = ukuranLimas(b);
  return {
    id: 'tuang-' + b.id,
    judul: b.nama + ' · ' + b.bentuk,
    hints: [
      'Luas alas = ' + b.caraLuasAlas + '.',
      'Volume prisma = luas alas × tinggi = ' + lppAngka(m.la) + ' × ' + b.t + '.',
      'Hitung berapa kali kamu menuang sampai prisma penuh, lalu bagi volume prisma dengan bilangan itu.',
    ],
    fields: [
      fieldLuasAlas(b, m),
      {
        id: 't',
        label: 'Tinggi limas = tinggi prisma (t)',
        jawab: b.t,
        satuan: 'cm',
        diberikan: true,
      },
      {
        id: 'vp',
        label: 'Volume prisma' + cara('La × t'),
        jawab: m.vp,
        satuan: 'cm³',
        pengecoh: saringPengecoh(
          [
            { nilai: m.la + b.t, pesan: 'Luas alas dan tinggi dikalikan, bukan dijumlahkan.' },
            {
              nilai: m.vl,
              pesan: 'Itu sudah volume limasnya. Di kotak ini, tulis dulu volume PRISMA = La × t.',
            },
          ],
          m.vp
        ),
      },
      {
        id: 'n',
        label: 'Banyak tuangan sampai prisma penuh',
        jawab: VLM_TUANG,
        satuan: 'kali',
        pengecoh: [
          {
            nilai: 2,
            pesan: 'Setelah 2 kali tuang, prisma baru terisi ⅔ bagian. Lihat lagi Lab Tuang.',
          },
          { nilai: 1, pesan: 'Satu tuangan baru mengisi ⅓ prisma. Lihat lagi Lab Tuang.' },
          { nilai: 6, pesan: 'Hitung lagi tuanganmu di Lab Tuang untuk pasangan ini.' },
        ],
      },
      fieldVolumeLimas('vl', 'Volume limas' + cara('volume prisma ÷ banyak tuangan'), m),
    ],
  };
}

/* Tahap 4 — kartu kubus yang dibelah. */
function buatKartuBelah() {
  var s = KUBUS.s;
  var k = BELAH;
  return {
    id: 'belah',
    judul: DATA.belah.kartuJudul,
    hints: DATA.belah.hints,
    temuan: esc(DATA.belah.temuan),
    fields: [
      {
        id: 'vk',
        label: 'Volume kubus' + cara(s + ' × ' + s + ' × ' + s),
        jawab: k.volumeKubus,
        satuan: 'cm³',
        pengecoh: [
          { nilai: s * s, pesan: 'Itu luas satu sisi kubus. Volume kubus = s × s × s.' },
          { nilai: 3 * s, pesan: 'Rusuk dijumlahkan. Volume kubus = s × s × s.' },
        ],
      },
      {
        id: 'n',
        label: 'Banyak limas hasil belahan',
        jawab: k.banyak,
        satuan: 'limas',
        pengecoh: [
          { nilai: 8, pesan: 'Delapan adalah banyak titik sudut kubus. Hitung potongan limasnya.' },
          { nilai: 3, pesan: 'Hitung lagi: setiap sisi kubus menjadi alas satu limas.' },
        ],
      },
      {
        id: 'vl',
        label: 'Volume satu limas' + cara('volume kubus ÷ banyak limas'),
        jawab: k.volumeLimas,
        satuan: 'cm³',
        pengecoh: [
          {
            nilai: k.volumeKubus / 3,
            pesan: 'Bagi dengan banyak limas hasil belahan (6), bukan 3.',
          },
          { nilai: k.volumeKubus, pesan: 'Itu volume seluruh kubus. Bagi dengan banyak limasnya.' },
        ],
      },
      {
        id: 'la',
        label: 'Luas alas satu limas' + cara(s + ' × ' + s),
        jawab: k.luasAlas,
        satuan: 'cm²',
        pengecoh: [{ nilai: 4 * s, pesan: 'Itu keliling alas. Luas persegi = sisi × sisi.' }],
      },
      {
        id: 't',
        label: 'Tinggi satu limas' + cara('pusat kubus ke sisi kubus'),
        jawab: k.tinggi,
        satuan: 'cm',
        pengecoh: [
          {
            nilai: s,
            pesan: 'Puncak limas ada di pusat kubus, jadi tingginya hanya setengah rusuk kubus.',
          },
          { nilai: s / 3, pesan: 'Pusat kubus ada di tengah-tengah, jadi tingginya ½ × rusuk.' },
        ],
      },
      {
        id: 'lat',
        label: 'Luas alas × tinggi' + cara(k.luasAlas + ' × ' + k.tinggi),
        jawab: k.luasAlasKaliTinggi,
        satuan: 'cm³',
        pengecoh: [
          {
            nilai: k.luasAlas * s,
            pesan: 'Kamu memakai rusuk kubus. Pakai tinggi limas: ½ × rusuk.',
          },
        ],
      },
      {
        id: 'rasio',
        label: '(La × t) ÷ volume satu limas',
        jawab: 3,
        satuan: '',
        pengecoh: [
          {
            nilai: 6,
            pesan:
              'Itu volume kubus ÷ volume limas. Bagilah hasil La × t dengan volume satu limas.',
          },
        ],
      },
    ],
  };
}

/* Tahap 5 — kartu data satu limas. */
function buatKartuData(b) {
  var m = ukuranLimas(b);
  return {
    id: 'data-' + b.id,
    judul: b.nama + ' · ' + b.bentuk,
    visual:
      '<div class="vpr-data-visual">' +
      buildVlmLimasSVG(b.alas, b.t, {
        lebar: 200,
        garisTinggi: true,
        aria: b.nama + ': ' + b.infoAlas,
      }) +
      '<p class="dl-caption">Alas: ' +
      esc(b.infoAlas) +
      '</p></div>',
    hints: [
      'Luas alas = ' + b.caraLuasAlas + '.',
      'Prisma pasangannya penuh setelah 3 kali tuang, jadi V limas = (La × t) ÷ 3.',
    ],
    fields: [
      fieldLuasAlas(b, m),
      { id: 't', label: 'Tinggi limas (t)', jawab: b.t, satuan: 'cm', diberikan: true },
      {
        id: 'lat',
        label: 'La × t' + cara('volume prisma pasangan'),
        jawab: m.vp,
        satuan: 'cm³',
        pengecoh: saringPengecoh(
          [{ nilai: m.la + b.t, pesan: 'Luas alas dan tinggi dikalikan, bukan dijumlahkan.' }],
          m.vp
        ),
      },
      {
        id: 'n',
        label: 'Banyak tuangan sampai penuh',
        jawab: VLM_TUANG,
        satuan: 'kali',
        diberikan: true,
      },
      fieldVolumeLimas('vl', 'Volume limas' + cara('hasil percobaan'), m),
      {
        id: 'rasio',
        label: '(La × t) ÷ V limas',
        jawab: 3,
        satuan: '',
        pengecoh: [{ nilai: 1 / 3, pesan: 'Terbalik. Bagilah La × t dengan V limas.' }],
      },
    ],
  };
}

var KARTU_TUANG = {};
LAB_LIMAS.forEach(function (b) {
  KARTU_TUANG[b.id] = buatKartuTuang(b);
});
var KARTU_TUANG_LIST = LAB_LIMAS.map(function (b) {
  return KARTU_TUANG[b.id];
});
var KARTU_BELAH = [buatKartuBelah()];
var KARTU_DATA = LIMAS_OLAH.map(buatKartuData);

/* Butir pemilahan (teks dari DATA). */
var PILAH_ITEMS = DATA.olah.pilah.map(function (it) {
  return {
    id: it.id,
    correct: it.correct,
    explanation: esc(it.explanation),
    teks: esc(it.teks),
  };
});

/* Langkah pembuktian: kunci dihitung ulang dari ukuran cetakan tugu. */
var VERIF = (function () {
  var b = DATA.verifikasi.limas;
  var a = apotemaAlas(b.n, b.s);
  var t = tinggiLimasDariSisiTegak(b.ts, a);
  var u = ukuranAlasPrisma(alasLimasBeraturan(b.n, b.s));
  var kunci = {
    apotema: lppBulat(a),
    tinggi: t,
    luasAlas: u.luas,
    volumePrisma: volumePrisma(u.luas, t),
    volume: volumeLimas(u.luas, t),
  };
  function langkah(list) {
    return list.map(function (s) {
      return { id: s.id, label: esc(s.label), hints: s.hints, jawab: kunci[s.kunci] };
    });
  }
  return {
    limas: b,
    t: t,
    tinggi: langkah(DATA.verifikasi.langkahTinggi),
    prisma: langkah(DATA.verifikasi.langkahPrisma),
    rumus: langkah(DATA.verifikasi.langkahRumus),
  };
})();

/* Gambar 3D limas beraturan berukuran sebanding dengan garis tinggi TO & TP. */
function gambarLimasTinggi(b, t, skala) {
  var r = b.s / (2 * Math.sin(Math.PI / b.n));
  var model = modelLimas(b.n, { r: 1, tinggi: t / r });
  return buildPrismSVG(
    model,
    { azimut: -25, elevasi: 20 },
    {
      skala: skala || 80,
      garis: garisTinggiLimas(model),
      aria: b.nama + ' dengan garis tinggi limas TO dan tinggi sisi tegak TP',
    }
  );
}

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'stimulasi',
  completedStages: {},

  /* Tahap 1 — stimulasi (dugaan, tidak dinilai) */
  stimulasiOrder: null,
  stimulasiPilihan: null,
  stimulasiAlasan: '',

  /* Tahap 2 — identifikasi masalah */
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',

  /* Tahap 3 — Lab Tuang */
  lab: null,
  isianTuang: null,
  tuangOrders: {},
  tuangPilih: {},

  /* Tahap 4 — belah kubus */
  belah: null,
  isianBelah: null,
  belahOrders: {},
  belahPilih: {},

  /* Tahap 5 — mengolah data */
  isianData: null,
  konsepOrders: {},
  konsepPilih: {},
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 6 — pembuktian */
  verifSteps: {},
  verifExercises: [],

  /* Tahap 7 — menarik kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

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

/* Urutan acak opsi untuk setiap pertanyaan penuntun dalam `list`. */
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
  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'stimulasiOrder', DATA.stimulasi.opsi);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  ensureVlTuangState(State, 'lab', LAB_OPTS);
  ensureLpIsianState(State, 'isianTuang', KARTU_TUANG_LIST);
  ensureGuidedOrders('tuangOrders', 'tuangPilih', DATA.tuang.tanya);

  /* Tahap 4 */
  ensureVlBelahState(State, 'belah');
  ensureLpIsianState(State, 'isianBelah', KARTU_BELAH);
  ensureGuidedOrders('belahOrders', 'belahPilih', DATA.belah.tanya);

  /* Tahap 5 */
  ensureLpIsianState(State, 'isianData', KARTU_DATA);
  ensureGuidedOrders('konsepOrders', 'konsepPilih', DATA.olah.konsep);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.olah.opsiKlas);

  /* Tahap 6 */
  ensureObject('verifSteps');
  VERIF.tinggi.concat(VERIF.prisma, VERIF.rumus).forEach(function (s) {
    if (!isPlainObject(State.verifSteps[s.id])) State.verifSteps[s.id] = makeDlStep();
  });
  ensureExerciseArray(State, 'verifExercises', DATA.verifikasi.soal, function (q) {
    return { chosen: null, correct: false, optionOrder: shuffleArray(optionIds(q.options)) };
  });

  /* Tahap 7 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);
  ensureObject('simpulanPilihan');

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

/* Kotak umpan balik pilihan (benar → success, salah → warning). */
function buildChoiceFeedback(chosen, benar, umpan) {
  if (!chosen) return '';
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(benar ? 'success' : 'warning', benar ? '✓' : '💭', umpan[chosen]) +
    '</div>'
  );
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

/*
 * Memasang pilihan "coba lagi sampai benar": klik mengganti pilihan
 * selama jawaban benar belum dipilih.
 */
function bindRetryChoice(container, group, key, correctId, rerender) {
  container.querySelectorAll('[data-group="' + group + '"][data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State[key] === correctId) return;
      State[key] = btn.dataset.optId;
      saveState();
      rerender();
    });
  });
}

function daftarTemuan(teks) {
  return (
    '<div style="margin-top:var(--space-4);">' + buildFeedbackBox('success', '🔎', teks) + '</div>'
  );
}

function paragrafInfo(teks) {
  return buildDlPanel('<p style="margin:0;">' + esc(teks) + '</p>', 'panel--info');
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

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah.
   ============================================================ */

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var terisi = !!State.stimulasiPilihan;

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🍫 ' +
        esc(D.judul) +
        '</h2>' +
        '<p class="stimulasi-cerita">' +
        esc(D.cerita) +
        '</p>' +
        '<div class="psm-stage vpr-stage vlm-stimulasi">' +
        vlTuangGambar(LAB_OPTS.pasangan[0], false, 0, { lebar: 320 }) +
        '</div>' +
        '<p class="dl-caption" style="text-align:center;">Cetakan limas dan kotak prisma: alas sama (' +
        esc(LAB_LIMAS[0].infoAlas) +
        ').</p>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.stimulasiOrder, { chosen: State.stimulasiPilihan }) +
        '<div class="field-group" style="margin-top:var(--space-5);">' +
        '<label for="stimulasiAlasan">' +
        esc(D.alasanLabel) +
        '</label>' +
        '<textarea id="stimulasiAlasan" class="input-textarea" placeholder="' +
        esc(D.alasanPlaceholder) +
        '">' +
        esc(State.stimulasiAlasan) +
        '</textarea>' +
        '</div>' +
        buildFeedbackBox('info', '🔎', esc(D.catatan))
    ) +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="stimulasiNextBtn"' +
    (terisi ? '' : ' disabled') +
    '>' +
    esc(D.nextLabel) +
    '</button>' +
    '</div>' +
    '</section>';

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.stimulasiPilihan = btn.dataset.optId;
      saveState();
      renderStimulasi(container);
      var f = container.querySelector('[data-opt-id="' + btn.dataset.optId + '"]');
      if (f) f.focus();
    });
  });

  var ta = document.getElementById('stimulasiAlasan');
  ta.addEventListener('input', function () {
    State.stimulasiAlasan = ta.value;
    saveState();
  });

  document.getElementById('stimulasiNextBtn').addEventListener('click', function () {
    if (!State.stimulasiPilihan) {
      showNotice('Pilih dugaanmu sebelum melanjutkan.');
      return;
    }
    completeStage('stimulasi');
    navigateTo('masalah');
  });
}

/* ============================================================
   6. STAGE: IDENTIFIKASI MASALAH  (Discovery Learning — sintaks 2)
   ============================================================ */

function renderMasalah(container) {
  var D = DATA.masalah;
  var benar = State.masalahPilihan === D.correct;

  container.innerHTML =
    '<section aria-label="Identifikasi Masalah">' +
    buildHead(D) +
    paragrafInfo(D.pengantar) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.masalahOrder, {
          chosen: State.masalahPilihan,
          correctId: benar ? D.correct : null,
          grade: true,
          locked: benar,
          group: 'masalah',
        }) +
        buildChoiceFeedback(State.masalahPilihan, benar, D.umpan)
    ) +
    (benar
      ? buildDlPanel(
          '<div class="field-group">' +
            '<label for="masalahHipotesis">' +
            esc(D.hipotesisLabel) +
            '</label>' +
            '<textarea id="masalahHipotesis" class="input-textarea" placeholder="' +
            esc(D.hipotesisPlaceholder) +
            '">' +
            esc(State.masalahHipotesis) +
            '</textarea>' +
            '</div>'
        ) + buildDlNextButton('masalahNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindRetryChoice(container, 'masalah', 'masalahPilihan', D.correct, function () {
    renderMasalah(container);
  });

  var ta = document.getElementById('masalahHipotesis');
  if (ta) {
    ta.addEventListener('input', function () {
      State.masalahHipotesis = ta.value;
      saveState();
    });
  }

  var nextBtn = document.getElementById('masalahNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.masalahHipotesis.trim()) {
        showNotice('Tulis hipotesismu lebih dulu, walau hanya satu kalimat.');
        return;
      }
      completeStage('masalah');
      navigateTo('tuang');
    });
  }
}

/* ============================================================
   7. STAGE: LAB TUANG  (Discovery Learning — sintaks 3)
   Lab Tuang (isi limas → tuang ke prisma) → kartu setiap pasangan →
   pertanyaan penuntun.
   ============================================================ */

function renderTuang(container) {
  var D = DATA.tuang;
  var labOk = vlTuangSelesai(State.lab, LAB_OPTS);
  var kartuPenuh = KARTU_TUANG_LIST.filter(function (k, i) {
    return !!State.lab.penuh[LAB_LIMAS[i].id];
  });
  var kartuOk = labOk && semuaKartuBenar(KARTU_TUANG_LIST, State.isianTuang);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.tuangPilih);

  function rerender() {
    renderTuang(container);
  }

  var html =
    '<section aria-label="Mengumpulkan Data: Lab Tuang">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🔬 Lab Tuang</h3>' +
        buildVlTuangLab('labT', State.lab, LAB_OPTS) +
        (labOk ? '' : '<p class="dl-caption" style="margin-bottom:0;">' + esc(D.syaratLab) + '</p>')
    );

  if (kartuPenuh.length) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">🧮 Catat hasil percobaan</h3>' +
        '<p>' +
        esc(D.instruksiKartu) +
        '</p>' +
        buildLpIsian('isT', kartuPenuh, State.isianTuang)
    );
  }

  if (kartuOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">🔎 Apa yang kamu temukan?</h3>' +
        buildGuidedQuizList(D.tanya, State.tuangOrders, State.tuangPilih) +
        (tanyaOk ? daftarTemuan(esc(D.temuan)) : '')
    );
  }

  html +=
    (kartuOk && tanyaOk ? buildDlNextButton('tuangNextBtn', D.nextLabel, true) : '') + '</section>';

  container.innerHTML = html;

  bindVlTuangLab(container, 'labT', State.lab, LAB_OPTS, function (jenis) {
    saveState();
    if (jenis === 'penuh') {
      rerender();
      var f = container.querySelector('#labT [data-vlm-aksi="kosong"]');
      if (f) f.focus();
      showNotice('Prisma penuh! Catat hasilnya di kartu di bawah.');
    }
  });
  bindLpIsian(container, 'isT', kartuPenuh, State.isianTuang, saveState, rerender);
  bindGuidedQuizList(container, D.tanya, State.tuangPilih, saveState, rerender);
  bindNext('tuangNextBtn', 'tuang', 'belah');
}

/* ============================================================
   8. STAGE: BELAH KUBUS  (Discovery Learning — sintaks 3)
   Kubus → 6 limas kongruen → kartu ukuran → pertanyaan penuntun.
   ============================================================ */

function renderBelah(container) {
  var D = DATA.belah;
  var labOk = State.belah.pernah;
  var kartuOk = labOk && semuaKartuBenar(KARTU_BELAH, State.isianBelah);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.belahPilih);

  function rerender() {
    renderBelah(container);
  }

  var html =
    '<section aria-label="Mengumpulkan Data: Belah Kubus">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(KUBUS.nama) +
        ' <span class="lpp-sub">· rusuk ' +
        lppAngka(KUBUS.s) +
        ' cm</span></h3>' +
        buildVlBelahKubus('bk', KUBUS, State.belah) +
        (labOk ? '' : '<p class="dl-caption" style="margin-bottom:0;">' + esc(D.syaratLab) + '</p>')
    );

  if (labOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">🧮 Ukur potongan limas</h3>' +
        buildLpIsian('isK', KARTU_BELAH, State.isianBelah)
    );
  }

  if (kartuOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">🔎 Apa yang kamu temukan?</h3>' +
        buildGuidedQuizList(D.tanya, State.belahOrders, State.belahPilih)
    );
  }

  html +=
    (kartuOk && tanyaOk ? buildDlNextButton('belahNextBtn', D.nextLabel, true) : '') + '</section>';

  container.innerHTML = html;

  bindVlBelahKubus(container, 'bk', KUBUS, State.belah, function (jenis) {
    saveState();
    if (jenis === 'pernah') {
      rerender();
      var btn = container.querySelector('#bk [data-vlm-belah]');
      if (btn) btn.focus();
    }
  });
  bindLpIsian(container, 'isK', KARTU_BELAH, State.isianBelah, saveState, rerender);
  bindGuidedQuizList(container, D.tanya, State.belahPilih, saveState, rerender);
  bindNext('belahNextBtn', 'belah', 'olah');
}

/* ============================================================
   9. STAGE: MENGOLAH DATA  (Discovery Learning — sintaks 4)
   A. Kartu data tiga limas. B. Pertanyaan pola. C. Pilah kartu.
   ============================================================ */

function renderOlah(container) {
  var D = DATA.olah;
  var dataOk = semuaKartuBenar(KARTU_DATA, State.isianData);
  var konsepOk = guidedQuizAllCorrect(D.konsep, State.konsepPilih);
  var pilahOk = sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);

  function rerender() {
    renderOlah(container);
  }

  var html =
    '<section aria-label="Mengolah Data">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">A. Kartu data tiga cetakan</h3>' +
        '<p>' +
        esc(D.instruksiData) +
        '</p>' +
        buildLpIsian('isD', KARTU_DATA, State.isianData)
    );

  if (dataOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">B. Temukan polanya</h3>' +
        '<p>' +
        esc(D.instruksiPola) +
        '</p>' +
        buildGuidedQuizList(D.konsep, State.konsepOrders, State.konsepPilih)
    );
  }

  if (dataOk && konsepOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">C. Pilah cara menghitung</h3>' +
        '<p>' +
        esc(D.instruksiPilah) +
        '</p>' +
        buildSortItems(PILAH_ITEMS, State.pilahOrder, D.opsiKlas, State.pilahStates) +
        (pilahOk
          ? daftarTemuan(
              '<strong>' +
                sortItemsCorrectCount(PILAH_ITEMS, State.pilahStates) +
                ' dari ' +
                PILAH_ITEMS.length +
                ' kartu</strong> kamu pilah dengan tepat. ' +
                esc(D.temuan)
            )
          : '')
    );
  }

  html +=
    (dataOk && konsepOk && pilahOk ? buildDlNextButton('olahNextBtn', D.nextLabel, true) : '') +
    '</section>';

  container.innerHTML = html;

  bindLpIsian(container, 'isD', KARTU_DATA, State.isianData, saveState, rerender);
  bindGuidedQuizList(container, D.konsep, State.konsepPilih, saveState, rerender);
  bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  bindNext('olahNextBtn', 'olah', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   Langkah awal: t dengan Pythagoras. A. Cara 1: ⅓ volume prisma
   (percobaan). B. Cara 2: dugaan rumus. C. Tanggapi miskonsepsi.
   ============================================================ */

function langkahSelesai(list) {
  return list.every(function (s) {
    return State.verifSteps[s.id].done;
  });
}

function verifSoalSemuaDijawab() {
  return State.verifExercises.every(function (e) {
    return !!e.chosen;
  });
}

function panelLangkah(judul, prefix, list, tambahan) {
  return buildDlPanel(
    '<h3 style="margin-top:0;">' +
      judul +
      '</h3>' +
      list
        .map(function (s, i) {
          return buildDlStep(prefix + s.id, State.verifSteps[s.id], s, i + 1);
        })
        .join('') +
      (tambahan || '')
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var tinggiOk = langkahSelesai(VERIF.tinggi);
  var prismaOk = tinggiOk && langkahSelesai(VERIF.prisma);
  var rumusOk = prismaOk && langkahSelesai(VERIF.rumus);

  function rerender() {
    renderVerifikasi(container);
  }

  var html =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(VERIF.limas.nama) +
        '</h3>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<div class="psm-stage lpp-stage vlm-verif-gambar">' +
        gambarLimasTinggi(VERIF.limas, VERIF.t, 110) +
        '</div>' +
        '<p class="dl-caption">Garis merah TO = tinggi limas (t). Garis hijau TP = tinggi segitiga sisi tegak (tₛ = ' +
        lppAngka(VERIF.limas.ts) +
        ' cm). O pusat alas, P tengah rusuk alas.</p>'
    ) +
    panelLangkah(esc(D.instruksiTinggi), 'vt', VERIF.tinggi);

  if (tinggiOk) html += panelLangkah('A. ' + esc(D.instruksiPrisma), 'vp', VERIF.prisma);

  if (prismaOk) {
    html += panelLangkah(
      'B. ' + esc(D.instruksiRumus),
      'vr',
      VERIF.rumus,
      rumusOk ? daftarTemuan('<strong>' + esc(D.temuanSama) + '</strong>') : ''
    );
  }

  if (rumusOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">C. Tanggapi pendapat teman</h3>' +
        '<p>' +
        esc(D.instruksiMiskonsepsi) +
        '</p>' +
        D.soal
          .map(function (q, i) {
            var ex = State.verifExercises[i];
            return (
              '<div class="quiz-item">' +
              '<p class="exercise-label"><span class="dl-step__num">' +
              (i + 1) +
              '</span>' +
              esc(q.teks) +
              '</p>' +
              buildChoiceGroup(q.options, ex.optionOrder, {
                chosen: ex.chosen,
                correctId: q.correct,
                grade: true,
                locked: true,
                group: q.id,
                attr: 'data-verif-opt',
              }) +
              (ex.chosen
                ? '<div style="margin-top:var(--space-2);">' +
                  buildFeedbackBox(
                    ex.correct ? 'success' : 'error',
                    ex.correct ? '✓' : '✗',
                    (ex.correct ? '<strong>Tepat.</strong> ' : '<strong>Belum tepat.</strong> ') +
                      esc(q.explanation)
                  ) +
                  '</div>'
                : '') +
              '</div>'
            );
          })
          .join('')
    );
  }

  html +=
    (rumusOk && verifSoalSemuaDijawab()
      ? buildDlNextButton('verifNextBtn', D.nextLabel, true)
      : '') + '</section>';

  container.innerHTML = html;

  [
    ['vt', VERIF.tinggi],
    ['vp', VERIF.prisma],
    ['vr', VERIF.rumus],
  ].forEach(function (g) {
    g[1].forEach(function (s) {
      bindDlStep(g[0] + s.id, State.verifSteps[s.id], s, saveState, rerender);
    });
  });

  container.querySelectorAll('[data-verif-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = -1;
      D.soal.forEach(function (q, k) {
        if (q.id === btn.dataset.group) i = k;
      });
      var ex = State.verifExercises[i];
      if (!ex || ex.chosen) return;
      ex.chosen = btn.dataset.verifOpt;
      ex.correct = ex.chosen === D.soal[i].correct;
      saveState();
      rerender();
    });
  });

  bindNext('verifNextBtn', 'verifikasi', 'generalisasi');
}

/* ============================================================
   11. STAGE: MENARIK KESIMPULAN  (Discovery Learning — sintaks 6)
   ============================================================ */

function simpulanSemuaBenar() {
  return DATA.generalisasi.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function buildRangkumanVisual() {
  var b = LAB_LIMAS[0];
  var m = ukuranLimas(b);
  return (
    '<div class="vpr-rangkum">' +
    '<figure><figcaption>3 limas penuh = 1 prisma</figcaption>' +
    '<div class="psm-stage vpr-stage">' +
    vlTuangGambar(LAB_OPTS.pasangan[0], false, VLM_TUANG, { lebar: 260 }) +
    '</div></figure>' +
    '<div class="vpr-rumus vlm-rumus" aria-label="Rumus volume limas">' +
    '<p class="vpr-rumus__baris">⅓ × <span class="vpr-rumus__alas">La</span> × <span class="vpr-rumus__tinggi">t</span></p>' +
    '<p class="dl-caption">Contoh ' +
    esc(b.nama.replace(/^\S+\s/, '').toLowerCase()) +
    ': ⅓ × ' +
    lppAngka(m.la) +
    ' × ' +
    lppAngka(b.t) +
    ' = ' +
    lppAngka(m.vl) +
    ' cm³</p>' +
    '</div>' +
    '</div>'
  );
}

function renderGeneralisasi(container) {
  var D = DATA.generalisasi;
  var bank = orderByIds(D.bank, State.bankOrder);
  var benarSemua = simpulanSemuaBenar();
  var diperiksa = State.simpulanChecked;

  var kalimatHTML = D.kalimat
    .map(function (g, i) {
      var dipilih = State.simpulanPilihan[g.id] || '';
      var status = '';
      if (diperiksa && dipilih) {
        status =
          dipilih === g.correct ? ' dl-simpulan-item--correct' : ' dl-simpulan-item--incorrect';
      }
      return (
        '<div class="dl-simpulan-item' +
        status +
        '">' +
        '<span class="dl-simpulan-item__num">' +
        (i + 1) +
        '</span>' +
        '<div class="dl-simpulan-item__body">' +
        '<label for="simp-' +
        g.id +
        '" class="dl-simpulan-item__awal">' +
        esc(g.awal) +
        ' …</label>' +
        '<select class="input-select" id="simp-' +
        g.id +
        '" data-simp="' +
        g.id +
        '"' +
        (benarSemua ? ' disabled' : '') +
        '>' +
        '<option value="">' +
        esc(D.selectPlaceholder) +
        '</option>' +
        bank
          .map(function (b) {
            return (
              '<option value="' +
              esc(b.id) +
              '"' +
              (dipilih === b.id ? ' selected' : '') +
              '>' +
              esc(b.teks) +
              '</option>'
            );
          })
          .join('') +
        '</select>' +
        (diperiksa && dipilih && dipilih !== g.correct
          ? '<p class="dl-simpulan-item__note">Belum tepat. Ingat kembali temuanmu, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  var dugaan = State.stimulasiPilihan;

  container.innerHTML =
    '<section aria-label="Menarik Kesimpulan">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    buildDlPanel(
      kalimatHTML +
        (benarSemua
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah rumus yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Volume Limas</h3>' +
            buildRangkumanVisual() +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' +
                  (i + 1) +
                  '</span><span>' +
                  r +
                  '</span></li>'
                );
              })
              .join('') +
            '</ol>',
          'panel--hero'
        ) +
        (dugaan && D.tanggapanDugaan[dugaan]
          ? buildDlPanel(
              '<h3 style="margin-top:0;">' +
                esc(D.dugaanJudul) +
                '</h3>' +
                '<p class="dl-caption">Dugaanmu di tahap Stimulasi: “' +
                esc(findOptionLabel(DATA.stimulasi.opsi, dugaan)) +
                '”</p>' +
                buildFeedbackBox(
                  dugaan === DATA.stimulasi.dugaanTepat ? 'success' : 'info',
                  '🔁',
                  esc(D.tanggapanDugaan[dugaan])
                )
            )
          : '') +
        buildDlNextButton('simpulanNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  container.querySelectorAll('[data-simp]').forEach(function (sel) {
    sel.addEventListener('change', function () {
      State.simpulanPilihan[sel.dataset.simp] = sel.value;
      saveState();
    });
  });

  var checkBtn = document.getElementById('simpulanCheckBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      var adaKosong = D.kalimat.some(function (g) {
        return !State.simpulanPilihan[g.id];
      });
      if (adaKosong) {
        showNotice('Lengkapi semua kalimat lebih dulu.');
        return;
      }
      var terpakai = {};
      var ganda = false;
      D.kalimat.forEach(function (g) {
        var v = State.simpulanPilihan[g.id];
        if (terpakai[v]) ganda = true;
        terpakai[v] = true;
      });
      State.simpulanChecked = true;
      saveState();
      if (ganda) showNotice('Setiap potongan kalimat hanya dipakai satu kali.');
      else if (!simpulanSemuaBenar())
        showNotice('Masih ada yang belum tepat. Periksa tanda merahnya.');
      renderGeneralisasi(container);
    });
  }

  bindNext('simpulanNextBtn', 'generalisasi', 'terapkan');
}

/* ============================================================
   12. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal campuran
   'input' (isian bilangan bulat, boleh berpemisah ribuan) dan
   'choice' (opsi diacak lewat ex.optionOrder di initExerciseArrays()).
   ============================================================ */

/* Diagnosa isian volume (hanya soal yang menanyakan V dari La & t). */
function diagnosaTerapkan(s, ex) {
  var c = s.cek;
  var parsed = parseInputInt(ex.userInput, true);
  if (parsed.error || c.cari || c.keLiter) return null;
  var d = diagnosaVolumeLimas(c, parsed.value);
  return d.kode === 'benar' ? null : d.pesan;
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
  invalidMessage: 'Masukkan sebuah bilangan bulat (contoh: 32 atau 1.200).',
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
    return (
      'Jawabannya <strong>' +
      esc(formatNumber(s.jawab)) +
      ' ' +
      esc(s.satuan) +
      '</strong>. ' +
      esc(s.explanation)
    );
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
  var tuangBenar = banyakKartuBenar(KARTU_TUANG_LIST, State.isianTuang);
  var belahBenar = banyakKartuBenar(KARTU_BELAH, State.isianBelah);
  var dataBenar = banyakKartuBenar(KARTU_DATA, State.isianData);
  var pilahBenar = sortItemsCorrectCount(PILAH_ITEMS, State.pilahStates);
  var verifBenar = State.verifExercises.filter(function (e) {
    return e.correct;
  }).length;
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
        kartu(tuangBenar + '/' + KARTU_TUANG_LIST.length, 'Percobaan tuang dicatat') +
        kartu(belahBenar + '/' + KARTU_BELAH.length, 'Kubus dibelah & diukur') +
        kartu(dataBenar + '/' + KARTU_DATA.length, 'Kartu data lengkap') +
        kartu(pilahBenar + '/' + PILAH_ITEMS.length, 'Kartu dipilah tepat') +
        kartu(verifBenar + '/' + DATA.verifikasi.soal.length, 'Miskonsepsi ditanggapi tepat') +
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
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">▢</span>luas alas (La)</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">↕</span>tinggi limas (t)</div>' +
    '<div class="sajian-card sajian-card--utama"><span class="sajian-card__ikon" aria-hidden="true">🍫</span>V = ⅓ × La × t</div>' +
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
    'Kemampuan murid menjelaskan asal faktor ⅓ (percobaan tuang dan belahan kubus), membedakan tinggi limas dengan tₛ, serta menghitung volume benda nyata tetap menjadi bahan penilaian utama.' +
    '</div></div>' +
    '<div class="btn-group btn-group--center">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '<button type="button" class="btn btn--outline-primary" id="reviewBtn">Tinjau Ulang</button>' +
    '</div>' +
    '</div>' +
    '</section>';

  completeStage('selesai');

  document.getElementById('reviewBtn').addEventListener('click', function () {
    navigateTo('stimulasi');
  });
}

/* ============================================================
   15. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  stimulasi: renderStimulasi,
  masalah: renderMasalah,
  tuang: renderTuang,
  belah: renderBelah,
  olah: renderOlah,
  verifikasi: renderVerifikasi,
  generalisasi: renderGeneralisasi,
  terapkan: renderTerapkan,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  var fn = RENDERERS[State.currentStage] || RENDERERS.stimulasi;
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
  if (STAGES.indexOf(State.currentStage) === -1) State.currentStage = 'stimulasi';
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
      navigateTo('stimulasi');
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
