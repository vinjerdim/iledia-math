'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Bangun Kongruen & Sifat-sifatnya
   Fase D — SMP Kelas IX · Topik 29 Kekongruenan

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox,
   createStageMachine, createExerciseStage, createStore,
   ensureExerciseArray, optionIds, komponen Discovery Learning
   (ensureShuffledOrder, orderByIds, buildDiscoveryHead,
   buildTeacherNote, buildChoiceGroup, buildDlPanel,
   buildDlNextButton, ensureSortStates, buildSortItems,
   bindSortItems, sortItemsAllAnswered, sortItemsCorrectCount,
   findOptionLabel, buildGuidedQuizList, bindGuidedQuizList,
   guidedQuizAllCorrect), serta komponen kekongruenan bagian 26
   (buildShapeSVG, buildShapePair, buildTracingBoard,
   bindTracingBoard, ensureJiplakState, buildMeasureBoard,
   bindMeasureBoard, ensureUkurState, ukurSelesai, banyakTerukur,
   cariKorespondensi, cariPosisiBerimpit, posisiJiplak,
   buildCompareTable, kgrRadius, pusatPoligon).

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaan dan rangkaian aktivitasnya.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI saat
   state disiapkan (initExerciseArrays), lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat-lompat
   ketika tahap dirender ulang, tetapi teracak ulang setiap Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi            (DL sintaks 1)
    6. Stage: Identifikasi Masalah (DL sintaks 2)
    7. Stage: Menjiplak            (DL sintaks 3)
    8. Stage: Mengukur             (DL sintaks 3)
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
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'jiplak',
  'ukur',
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
  'Jiplak',
  'Ukur',
  'Olah',
  'Bukti',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-29-1-kongruen-v1';

var ASAL = DATA.jiplak.asal;
var CALON = DATA.jiplak.calon;
var LANGKAH = DATA.jiplak.langkah;

function cariCalon(list, id) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

var KLMN = cariCalon(CALON, 'klmn');
var EFGH = cariCalon(CALON, 'efgh');
var MAP_KLMN = cariKorespondensi(ASAL.pts, KLMN.pts, { kongruen: true }).map;
var MAP_EFGH = cariKorespondensi(ASAL.pts, EFGH.pts).map;
var POSISI_KLMN = cariPosisiBerimpit(ASAL.pts, KLMN.pts, LANGKAH);

/*
 * Pertanyaan pencatatan hasil jiplak: satu per bangun calon, dengan
 * umpan balik temuan (benar) atau arahan mencoba lagi (salah).
 */
function tanyaJiplak(calon, asal, opsi, umpanSalah) {
  return calon.map(function (c) {
    var umpan = {};
    opsi.forEach(function (o) {
      umpan[o.id] = o.id === c.jenis ? c.temuan : umpanSalah[o.id];
    });
    return {
      id: c.id,
      tanya:
        '<strong>' +
        esc(c.nama) +
        '</strong>: apa hasil menempelkan jiplakan ' +
        esc(asal.titik.join('')) +
        ' pada bangun ini?',
      opsi: opsi,
      correct: c.jenis,
      umpan: umpan,
    };
  });
}

var JIPLAK_TANYA = tanyaJiplak(CALON, ASAL, DATA.jiplak.opsiHasil, DATA.jiplak.umpanSalah);
var VERIF_TANYA = tanyaJiplak(
  DATA.verifikasi.calon,
  DATA.verifikasi.asal,
  DATA.olah.opsiKlas,
  DATA.verifikasi.umpanSalah
);

/* Memasangkan setiap titik sudut ABCD dengan titik KLMN yang bersesuaian. */
var PASANG_TANYA = ASAL.titik.map(function (t, i) {
  var benar = KLMN.titik[MAP_KLMN[i]];
  var umpan = {};
  KLMN.titik.forEach(function (k) {
    umpan[k] =
      k === benar
        ? 'Tepat! Titik ' +
          t +
          ' jatuh di atas titik ' +
          k +
          ', dan besar ∠' +
          t +
          ' sama dengan ∠' +
          k +
          '.'
        : 'Belum tepat. Lihat gambar jiplakan yang berimpit: huruf ungu <strong>' +
          t +
          '</strong> berada di titik mana? Kamu juga bisa membandingkan besar sudutnya.';
  });
  return {
    id: 'v' + i,
    tanya: 'Titik <strong>' + t + '</strong> pada ABCD bersesuaian dengan titik … pada KLMN',
    opsi: KLMN.titik.map(function (k) {
      return { id: k, label: 'Titik ' + k };
    }),
    correct: benar,
    umpan: umpan,
  };
});

/* Butir pemilahan pasangan bangun, lengkap dengan gambar & ukurannya. */
var PILAH_ITEMS = DATA.olah.pasangan.map(function (it) {
  var o = { tampilSisi: 'semua', tampilSudut: 'semua' };
  return {
    id: it.id,
    correct: it.correct,
    explanation: it.explanation,
    teks: buildShapePair(it.p, it.q, { skala: 22, p: o, q: o }),
  };
});

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

  /* Tahap 3 — menjiplak */
  jiplakBoard: null,
  jiplakDicoba: {},
  jiplakOrders: {},
  jiplakPilih: {},

  /* Tahap 4 — mengukur */
  ukurA: null,
  ukurK: null,
  ukurE: null,
  pasangOrders: {},
  pasangPilih: {},

  /* Tahap 5 — mengolah data */
  konsepOrders: {},
  konsepPilih: {},
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 6 — pembuktian */
  verifBoard: null,
  verifDicoba: {},
  verifOrders: {},
  verifPilih: {},
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
  ensureJiplakState(State, 'jiplakBoard', optionIds(CALON));
  ensureObject('jiplakDicoba');
  ensureGuidedOrders('jiplakOrders', 'jiplakPilih', JIPLAK_TANYA);

  /* Tahap 4 */
  ensureUkurState(State, 'ukurA');
  ensureUkurState(State, 'ukurK');
  ensureUkurState(State, 'ukurE');
  ensureGuidedOrders('pasangOrders', 'pasangPilih', PASANG_TANYA);

  /* Tahap 5 */
  ensureGuidedOrders('konsepOrders', 'konsepPilih', DATA.olah.konsep);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.olah.opsiKlas);

  /* Tahap 6 */
  ensureJiplakState(State, 'verifBoard', optionIds(DATA.verifikasi.calon));
  ensureObject('verifDicoba');
  ensureGuidedOrders('verifOrders', 'verifPilih', VERIF_TANYA);
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

/* Umpan balik jawaban sekali-pilih (benar/salah + penjelasan). */
function buildOnceFeedback(benar, explanation) {
  return (
    '<div style="margin-top:var(--space-2);">' +
    buildFeedbackBox(
      benar ? 'success' : 'error',
      benar ? '✓' : '✗',
      (benar ? '<strong>Tepat.</strong> ' : '<strong>Belum tepat.</strong> ') + explanation
    ) +
    '</div>'
  );
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

/* Galeri bangun berskala sama (tanpa jiplakan), untuk tahap stimulasi. */
function buildGaleri(asal, calon) {
  var r = kgrRadius([asal].concat(calon)) + 1.3;
  function kartu(b, warna, cls) {
    var c = pusatPoligon(b.pts);
    return (
      '<figure class="kgr-cell' +
      (cls ? ' ' + cls : '') +
      '"><figcaption class="kgr-cell__nama">' +
      esc(b.nama) +
      '</figcaption>' +
      buildShapeSVG(b, {
        kotak: { cx: c[0], cy: c[1], r: r },
        warna: warna,
        besarHuruf: kgrBesarHurufKotak(r),
      }) +
      '</figure>'
    );
  }
  return (
    '<div class="kgr-board__grid">' +
    kartu(asal, 'a', 'ubin-pecah') +
    calon
      .map(function (b, i) {
        return kartu(b, ['b', 'c', 'd', 'b'][i % 4]);
      })
      .join('') +
    '</div>'
  );
}

/* Pertanyaan pencatatan hanya untuk bangun yang sudah pernah ditempeli jiplakan. */
function tanyaDicoba(list, dicoba) {
  return list.filter(function (q) {
    return !!dicoba[q.id];
  });
}

/* Menandai bangun sasaran jiplakan saat ini sebagai sudah dicoba. */
function catatDicoba(st, dicoba) {
  if (st.dijiplak && st.target && st.target !== 'asal') dicoba[st.target] = true;
}

function daftarTemuan(teks) {
  return (
    '<div style="margin-top:var(--space-4);">' + buildFeedbackBox('success', '🔎', teks) + '</div>'
  );
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
      '<h2 style="margin-top:0;">🧱 ' +
        esc(D.judul) +
        '</h2>' +
        '<p class="stimulasi-cerita">' +
        esc(D.cerita) +
        '</p>' +
        buildGaleri(D.asal, D.calon),
      'panel--hero'
    ) +
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
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
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
      navigateTo('jiplak');
    });
  }
}

/* ============================================================
   7. STAGE: MENJIPLAK  (Discovery Learning — sintaks 3)
   Kertas jiplak virtual: jiplak ABCD, tempel pada setiap ubin,
   putar/balik, lalu catat hasilnya (pertanyaan penuntun per ubin).
   ============================================================ */

function renderJiplak(container) {
  var D = DATA.jiplak;
  var st = State.jiplakBoard;
  var tanya = tanyaDicoba(JIPLAK_TANYA, State.jiplakDicoba);
  var selesai = guidedQuizAllCorrect(JIPLAK_TANYA, State.jiplakPilih);

  function rerender() {
    renderJiplak(container);
  }

  container.innerHTML =
    '<section aria-label="Mengumpulkan Data: Menjiplak">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel(buildTracingBoard('jb', D.asal, D.calon, st, { langkah: D.langkah })) +
    buildDlPanel(
      '<h3 style="margin-top:0;">📋 Catatan hasil menjiplak</h3>' +
        '<p>' +
        esc(D.instruksiCatat) +
        ' <strong>(' +
        tanya.length +
        '/' +
        JIPLAK_TANYA.length +
        ' ubin sudah dicoba)</strong></p>' +
        (tanya.length
          ? buildGuidedQuizList(tanya, State.jiplakOrders, State.jiplakPilih)
          : '<p class="dl-caption">Belum ada ubin yang ditempeli jiplakan.</p>') +
        (selesai ? daftarTemuan(esc(D.temuan)) : '')
    ) +
    (selesai ? buildDlNextButton('jiplakNextBtn', D.nextLabel, true) : '') +
    '</section>';

  bindTracingBoard(container, 'jb', D.asal, D.calon, st, { langkah: D.langkah }, function () {
    catatDicoba(st, State.jiplakDicoba);
    saveState();
    rerender();
  });
  bindGuidedQuizList(container, tanya, State.jiplakPilih, saveState, rerender);
  bindNext('jiplakNextBtn', 'jiplak', 'ukur');
}

/* ============================================================
   8. STAGE: MENGUKUR  (Discovery Learning — sintaks 3)
   A. Mengukur semua sisi & sudut ABCD dan KLMN.
   B. Memasangkan titik sudut bersesuaian → tabel perbandingan.
   C. Mengukur EFGH (sebangun) → tabel dengan perbandingan sisi.
   ============================================================ */

function buildBerimpitKLMN() {
  var c = pusatPoligon(KLMN.pts);
  var r = kgrRadius([ASAL, KLMN]) + 1.3;
  return (
    '<figure class="kgr-cell kgr-cell--ref">' +
    '<figcaption class="kgr-cell__nama">' +
    esc(DATA.ukur.gambarBerimpit) +
    '</figcaption>' +
    buildShapeSVG(KLMN, {
      kotak: { cx: c[0], cy: c[1], r: r },
      besarHuruf: kgrBesarHurufKotak(r),
      warna: 'b',
      jiplak: {
        pts: posisiJiplak(ASAL.pts, KLMN.pts, POSISI_KLMN.rotasi, POSISI_KLMN.cermin),
        titik: ASAL.titik,
        berimpit: true,
      },
    }) +
    '</figure>'
  );
}

function renderUkur(container) {
  var D = DATA.ukur;
  var A = State.ukurA;
  var K = State.ukurK;
  var Ev = State.ukurE;
  var selesaiA = ukurSelesai(ASAL, A) && ukurSelesai(KLMN, K);
  var pasangBenar = guidedQuizAllCorrect(PASANG_TANYA, State.pasangPilih);
  var selesaiE = ukurSelesai(EFGH, Ev);

  function rerender() {
    renderUkur(container);
  }

  var html =
    '<section aria-label="Mengumpulkan Data: Mengukur">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">A. Ukur ABCD dan KLMN</h3>' +
        '<p>' +
        esc(D.instruksiUkurA) +
        '</p>' +
        '<div class="kgr-duo">' +
        buildMeasureBoard('uA', ASAL, A, { judul: 'Ubin ABCD', warna: 'a' }) +
        buildMeasureBoard('uK', KLMN, K, { judul: 'Ubin KLMN', warna: 'b' }) +
        '</div>'
    );

  if (selesaiA) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">B. Pasangkan titik sudut yang bersesuaian</h3>' +
        '<p>' +
        esc(D.instruksiPasang) +
        '</p>' +
        '<div class="kgr-ref-wrap">' +
        buildBerimpitKLMN() +
        '</div>' +
        buildGuidedQuizList(PASANG_TANYA, State.pasangOrders, State.pasangPilih) +
        (pasangBenar
          ? '<h4>Tabel perbandingan ABCD dan KLMN</h4>' +
            buildCompareTable(ASAL, KLMN, MAP_KLMN) +
            daftarTemuan(esc(D.temuanA))
          : '')
    );
  }

  if (selesaiA && pasangBenar) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">C. Ukur EFGH yang bentuknya mirip</h3>' +
        '<p>' +
        esc(D.instruksiUkurB) +
        '</p>' +
        '<div class="kgr-duo kgr-duo--single">' +
        buildMeasureBoard('uE', EFGH, Ev, { judul: 'Ubin EFGH', warna: 'd', skala: 20 }) +
        '</div>' +
        (selesaiE
          ? '<h4>Tabel perbandingan ABCD dan EFGH</h4>' +
            buildCompareTable(ASAL, EFGH, MAP_EFGH, { rasio: true }) +
            daftarTemuan(esc(D.temuanB))
          : '')
    );
  }

  if (selesaiA && pasangBenar && selesaiE) {
    html += buildDlNextButton('ukurNextBtn', D.nextLabel, true);
  }
  container.innerHTML = html + '</section>';

  bindMeasureBoard(container, 'uA', A, function () {
    saveState();
    rerender();
  });
  bindMeasureBoard(container, 'uK', K, function () {
    saveState();
    rerender();
  });
  bindMeasureBoard(container, 'uE', Ev, function () {
    saveState();
    rerender();
  });
  bindGuidedQuizList(container, PASANG_TANYA, State.pasangPilih, saveState, rerender);
  bindNext('ukurNextBtn', 'ukur', 'olah');
}

/* ============================================================
   9. STAGE: MENGOLAH DATA  (Discovery Learning — sintaks 4)
   A. Pertanyaan penuntun berdasarkan tabel ukur.
   B. Memilah pasangan bangun: kongruen / sebangun / tidak.
   ============================================================ */

function renderOlah(container) {
  var D = DATA.olah;
  var konsepBenar = guidedQuizAllCorrect(D.konsep, State.konsepPilih);
  var pilahSelesai = sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);

  function rerender() {
    renderOlah(container);
  }

  container.innerHTML =
    '<section aria-label="Mengolah Data">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.pengantar) +
        '</p>' +
        '<details class="kgr-details" open><summary>📊 Tabel hasil ukurmu</summary>' +
        '<h4>ABCD dan KLMN</h4>' +
        buildCompareTable(ASAL, KLMN, MAP_KLMN) +
        '<h4>ABCD dan EFGH</h4>' +
        buildCompareTable(ASAL, EFGH, MAP_EFGH, { rasio: true }) +
        '</details>',
      'panel--info'
    ) +
    buildDlPanel(buildGuidedQuizList(D.konsep, State.konsepOrders, State.konsepPilih)) +
    (konsepBenar
      ? buildDlPanel(
          '<p class="exercise-label">' +
            esc(D.instruksiPilah) +
            '</p>' +
            buildSortItems(PILAH_ITEMS, State.pilahOrder, D.opsiKlas, State.pilahStates)
        )
      : '') +
    (konsepBenar && pilahSelesai ? buildDlNextButton('olahNextBtn', D.nextLabel, true) : '') +
    '</section>';

  bindGuidedQuizList(container, D.konsep, State.konsepPilih, saveState, rerender);
  bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  bindNext('olahNextBtn', 'olah', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A. Menguji temuan pada segitiga JKL dengan jiplak + ukuran.
   B. Menanggapi miskonsepsi (opsi acak, sekali jawab).
   ============================================================ */

function verifSoalSemuaDijawab() {
  return State.verifExercises.every(function (e) {
    return !!e.chosen;
  });
}

/* Pertanyaan uji per segitiga; setelah benar tampil gambar berukuran lengkap. */
function buildVerifTanya(tanya) {
  var V = DATA.verifikasi;
  var o = { tampilSisi: 'semua', tampilSudut: 'semua' };
  return tanya
    .map(function (q) {
      var html = buildGuidedQuizList([q], State.verifOrders, State.verifPilih);
      if (State.verifPilih[q.id] === q.correct) {
        html +=
          '<div class="kgr-bukti">' +
          buildShapePair(V.asal, cariCalon(V.calon, q.id), { skala: 24, p: o, q: o }) +
          '</div>';
      }
      return html;
    })
    .join('');
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var S = DATA.stimulasi;
  var st = State.verifBoard;
  var tanya = tanyaDicoba(VERIF_TANYA, State.verifDicoba);
  var ujiSelesai = guidedQuizAllCorrect(VERIF_TANYA, State.verifPilih);

  function rerender() {
    renderVerifikasi(container);
  }

  var soalHTML = '';
  if (ujiSelesai) {
    soalHTML = buildDlPanel(
      buildFeedbackBox(
        State.stimulasiPilihan === 'klmn-pqrs' ? 'success' : 'info',
        State.stimulasiPilihan === 'klmn-pqrs' ? '👏' : '🔄',
        esc(D.kesimpulanDugaan[State.stimulasiPilihan] || D.kesimpulanDugaan['klmn-pqrs'])
      ) +
        '<p class="exercise-label" style="margin-top:var(--space-4);">' +
        esc(D.instruksiSoal) +
        '</p>' +
        D.soal
          .map(function (q, i) {
            var ex = State.verifExercises[i];
            return (
              '<div class="sort-item">' +
              '<p class="sort-item__text">' +
              q.pernyataan +
              '</p>' +
              buildChoiceGroup(q.options, ex.optionOrder, {
                chosen: ex.chosen,
                correctId: q.correct,
                grade: true,
                locked: true,
                group: q.id,
                attr: 'data-verif-opt',
              }) +
              (ex.chosen ? buildOnceFeedback(ex.correct, q.explanation) : '') +
              '</div>'
            );
          })
          .join('')
    );
  }

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin:0;">' +
        esc(D.prediksiLabel) +
        ': <strong>' +
        esc(
          State.stimulasiPilihan ? findOptionLabel(S.opsi, State.stimulasiPilihan) : 'belum diisi'
        ) +
        '</strong>' +
        (State.stimulasiAlasan ? '<br><em>“' + esc(State.stimulasiAlasan) + '”</em>' : '') +
        '</p>' +
        (State.masalahHipotesis
          ? '<p style="margin:var(--space-2) 0 0;">' +
            esc(D.hipotesisLabel) +
            ': <em>“' +
            esc(State.masalahHipotesis) +
            '”</em></p>'
          : ''),
      'panel--warning'
    ) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.instruksiUji) +
        '</p>' +
        buildTracingBoard('vb', D.asal, D.calon, st, { langkah: LANGKAH })
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">📋 Hubungan dengan segitiga JKL <strong>(' +
        tanya.length +
        '/' +
        VERIF_TANYA.length +
        ' dicoba)</strong></h3>' +
        (tanya.length
          ? buildVerifTanya(tanya)
          : '<p class="dl-caption">Tempelkan jiplakan JKL pada sebuah segitiga untuk mulai.</p>')
    ) +
    soalHTML +
    (ujiSelesai && verifSoalSemuaDijawab()
      ? buildDlNextButton('verifNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindTracingBoard(container, 'vb', D.asal, D.calon, st, { langkah: LANGKAH }, function () {
    catatDicoba(st, State.verifDicoba);
    saveState();
    rerender();
  });
  bindGuidedQuizList(container, tanya, State.verifPilih, saveState, rerender);

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

  var pqrs = cariCalon(CALON, 'pqrs');
  var o = { tampilSisi: 'semua', tampilSudut: 'semua' };

  container.innerHTML =
    '<section aria-label="Menarik Kesimpulan">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel(
      kalimatHTML +
        (benarSemua
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah konsep yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Kekongruenan</h3>' +
            '<div class="kgr-rangkum">' +
            '<div><h4>Kongruen: ABCD ≅ PQRS</h4>' +
            buildShapePair(ASAL, pqrs, { skala: 22, p: o, q: o }) +
            '</div>' +
            '<div><h4>Sebangun: ABCD ∼ EFGH</h4>' +
            buildShapePair(ASAL, EFGH, { skala: 22, p: o, q: o }) +
            '</div>' +
            '</div>' +
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
        ) + buildDlNextButton('simpulanNextBtn', D.nextLabel, true)
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
   'input' (isian panjang/sudut/keliling) dan 'choice' (opsi diacak
   lewat ex.optionOrder di initExerciseArrays()).
   ============================================================ */

function buildVisualSoal(s) {
  var V = s.visual;
  if (!V) return '';
  return (
    '<div class="kgr-soal-visual">' +
    buildShapePair(V.p, V.q, { skala: 20, p: V.pOpts, q: V.qOpts }) +
    '</div>'
  );
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
  checkValue: function (s) {
    return s.jawab;
  },
  parseInput: parseInputDecimal,
  isCorrect: function (v, s) {
    return Math.abs(v - s.jawab) < 0.05;
  },
  inputMode: 'decimal',
  inputAriaLabel: 'Jawaban',
  inputPlaceholder: 'Jawaban',
  inputSuffix: function (s) {
    return '<span class="kgr-suffix">' + esc(s.satuan) + '</span>';
  },
  invalidMessage: 'Masukkan sebuah bilangan (contoh: 5 atau 4,5).',
  revealText: function (s) {
    return (
      'Jawabannya <strong>' +
      esc(formatDesimal(s.jawab, 1)) +
      ' ' +
      esc(s.satuan) +
      '</strong>. ' +
      s.explanation
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
      buildVisualSoal(s) +
      '<p class="dl-prompt__tanya">' +
      esc(s.pertanyaan) +
      '</p>' +
      (pilihan && s.hints && s.hints.length
        ? '<details class="soal-hint"><summary>💡 Petunjuk</summary><ul>' +
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
  var terukur =
    banyakTerukur(ASAL, State.ukurA) +
    banyakTerukur(KLMN, State.ukurK) +
    banyakTerukur(EFGH, State.ukurE);
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
        kartu(terukur + '/24', 'Sisi & sudut terukur') +
        kartu(pilahBenar + '/' + PILAH_ITEMS.length, 'Pasangan bangun dipilah benar') +
        kartu(verifBenar + '/' + DATA.verifikasi.soal.length, 'Miskonsepsi ditanggapi benar') +
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
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">≅</span>Berimpit tepat</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">📏</span>Sisi bersesuaian sama panjang</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">📐</span>Sudut bersesuaian sama besar</div>' +
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
    'Kemampuan murid menjelaskan mengapa dua bangun kongruen atau hanya sebangun, dengan menunjuk sisi dan sudut yang bersesuaian, tetap menjadi bahan penilaian utama.' +
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
  jiplak: renderJiplak,
  ukur: renderUkur,
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
