'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Barisan dan Deret Geometri
   Fase F — SMK Rekayasa Perangkat Lunak

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, formatNumber, formatRatio, parseInputInt, shuffleArray,
   showNotice, buildFeedbackBox, createStageMachine,
   createExerciseStage, createStore, ensureExerciseArray, serta
   komponen Discovery Learning — ensureShuffledOrder, orderByIds,
   buildDiscoveryHead, buildTeacherNote, buildChoiceGroup,
   buildHintStack, buildHintToggle, buildSequenceTiles (mode rasio),
   buildDlPanel, buildDlNextButton, findOptionLabel, makeDlStep,
   buildDlNumInput, readDlNumber, buildDlStep, bindDlStep,
   ensureSortStates, buildSortItems, bindSortItems, dan
   buildCompareBarChart.

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
    7. Stage: Pengumpulan Data     (DL sintaks 3)
    8. Stage: Olah Data — Uₙ       (DL sintaks 4)
    9. Stage: Olah Data — Sₙ       (DL sintaks 4)
   10. Stage: Pembuktian           (DL sintaks 5)
   11. Stage: Menarik Kesimpulan   (DL sintaks 6)
   12. Stage: Bandingkan Pola      (DL sintaks 6 lanjutan)
   13. Stage: Uji Terap
   14. Stage: Refleksi
   15. Stage: Selesai
   16. Router Render
   17. Helper UI (modal reset)
   18. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'koleksi',
  'olahUn',
  'olahSn',
  'verifikasi',
  'generalisasi',
  'bandingkan',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Stimulasi',
  'Masalah',
  'Data',
  'Rumus Uₙ',
  'Rumus Sₙ',
  'Bukti',
  'Simpulan',
  'Bandingkan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-1-2-geometri-dl-v2';

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'stimulasi',
  completedStages: {},

  /* Tahap 1 — stimulasi (dugaan, tidak dinilai) */
  stimulasiOrderUn: null,
  stimulasiOrderSn: null,
  stimulasiUn: null,
  stimulasiSn: null,
  stimulasiAlasan: '',

  /* Tahap 2 — identifikasi masalah */
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',

  /* Tahap 3 — pengumpulan data */
  koleksiIdx: 0,
  koleksiCtx: [],
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 4a — rumus Uₙ */
  olahUnInputs: [],
  olahUnChecked: false,
  olahUnHint: 0,
  olahUnRumusOrder: null,
  olahUnRumus: null,
  olahUnUji: null,

  /* Tahap 4b — rumus Sₙ */
  olahSnCoret: [],
  olahSnSteps: [],
  olahSnOrder1: null,
  olahSnPilih1: null,
  olahSnOrder2: null,
  olahSnPilih2: null,

  /* Tahap 5 — pembuktian */
  verifSteps: [],

  /* Tahap 6 — menarik kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 7 — bandingkan */
  bandingN: 4,
  bandingMode: 'un',
  bandingSteps: [],
  ciriStates: {},
  ciriOrder: null,

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

/*
 * Menyiapkan seluruh array state per-soal DAN seluruh urutan acak
 * pilihan jawaban. Dipanggil sekali saat init (setelah loadState) dan
 * setiap kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'stimulasiOrderUn', DATA.stimulasi.opsiUn);
  ensureShuffledOrder(State, 'stimulasiOrderSn', DATA.stimulasi.opsiSn);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  ensureExerciseArray(State, 'koleksiCtx', DATA.koleksi.konteks, function () {
    return { reveal: 2, a: '', r: '', attempts: 0, hintLevel: 0, done: false, salah: false };
  });
  if (State.koleksiIdx < 0 || State.koleksiIdx >= DATA.koleksi.konteks.length) {
    State.koleksiIdx = 0;
  }
  ensureSortStates(State, 'pilahStates', 'pilahOrder', DATA.koleksi.pilah, DATA.koleksi.opsiPilah);

  /* Tahap 4a */
  if (
    !Array.isArray(State.olahUnInputs) ||
    State.olahUnInputs.length !== DATA.olahUn.baris.length
  ) {
    State.olahUnInputs = DATA.olahUn.baris.map(function () {
      return '';
    });
  }
  ensureShuffledOrder(State, 'olahUnRumusOrder', DATA.olahUn.opsiRumus);
  if (!State.olahUnUji || typeof State.olahUnUji !== 'object') State.olahUnUji = makeDlStep();

  /* Tahap 4b */
  var pasangan = DATA.olahSn.terms.length - 1;
  if (!Array.isArray(State.olahSnCoret) || State.olahSnCoret.length !== pasangan) {
    State.olahSnCoret = DATA.olahSn.terms.slice(1).map(function () {
      return false;
    });
  }
  ensureExerciseArray(State, 'olahSnSteps', DATA.olahSn.langkah, makeDlStep);
  ensureShuffledOrder(State, 'olahSnOrder1', DATA.olahSn.opsi1);
  ensureShuffledOrder(State, 'olahSnOrder2', DATA.olahSn.opsi2);

  /* Tahap 5 */
  ensureExerciseArray(State, 'verifSteps', DATA.verifikasi.uji, makeDlStep);

  /* Tahap 6 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);

  /* Tahap 7 */
  var maxN = DATA.bandingkan.maxBulan;
  if (typeof State.bandingN !== 'number' || State.bandingN < 1 || State.bandingN > maxN) {
    State.bandingN = 4;
  }
  if (State.bandingMode !== 'un' && State.bandingMode !== 'sn') State.bandingMode = 'un';
  ensureExerciseArray(State, 'bandingSteps', DATA.bandingkan.langkah, makeDlStep);
  ensureSortStates(
    State,
    'ciriStates',
    'ciriOrder',
    DATA.bandingkan.ciri,
    DATA.bandingkan.opsiCiri
  );

  /* Tahap 8 — uji terap (dirender createExerciseStage) */
  ensureExerciseArray(State, 'terapkanExercises', DATA.terapkan.soal, function (s) {
    return {
      attempts: 0,
      hintLevel: 0,
      hintShown: false,
      correct: false,
      userInput: '',
      revealed: false,
      chosen: null,
      checked: false,
      optionOrder: s.options ? shuffleArray(optionIds(s.options)) : null,
    };
  });
  if (State.terapkanIdx >= DATA.terapkan.soal.length || State.terapkanIdx < 0) {
    State.terapkanIdx = 0;
  }

  /* Tahap 9 */
  ensureShuffledOrder(State, 'refleksiDiriOrder', DATA.refleksi.diriOpsi);
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

/* Format angka dengan minus tipografis. */
function fmt(n) {
  return formatNumber(n, '−');
}

/* Kotak umpan balik pilihan bertingkat (benar → success, salah → warning). */
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

/* Uₙ dan Sₙ Plan A (aritmetika) & Plan B (geometri) di tahap Bandingkan. */
function planValues(n) {
  var D = DATA.bandingkan;
  var un = [];
  var sn = [];
  var totA = 0;
  var totB = 0;
  for (var i = 1; i <= n; i++) {
    var a = D.aA + (i - 1) * D.bA;
    var b = D.aB * Math.pow(D.rB, i - 1);
    totA += a;
    totB += b;
    un.push([a, b]);
    sn.push([totA, totB]);
  }
  return { un: un, sn: sn };
}

/* Tabel ringkas karakteristik aritmetika vs geometri. */
function buildTabelBanding() {
  return (
    '<div class="banding-table-wrap">' +
    '<table class="banding-table">' +
    '<thead><tr><th scope="col">Karakteristik</th><th scope="col">Aritmetika</th><th scope="col">Geometri</th></tr></thead>' +
    '<tbody>' +
    DATA.bandingkan.tabel
      .map(function (row) {
        return (
          '<tr><th scope="row">' +
          esc(row[0]) +
          '</th><td>' +
          esc(row[1]) +
          '</td><td>' +
          esc(row[2]) +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table></div>'
  );
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah;
   dugaan diuji sendiri oleh murid pada tahap Pembuktian.
   ============================================================ */

function buildPlanCard(plan, cls, gap) {
  var D = DATA.stimulasi;
  return (
    '<div class="plan-card ' +
    cls +
    '">' +
    '<h3 class="plan-card__title">' +
    esc(plan.nama) +
    '</h3>' +
    '<p class="plan-card__desc">' +
    esc(plan.ket) +
    '</p>' +
    buildSequenceTiles(plan.terms, {
      labels: D.labels,
      showDiff: true,
      gap: gap,
      more: true,
      tail: D.tail,
    }) +
    '</div>'
  );
}

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var terisi = !!(State.stimulasiUn && State.stimulasiSn);

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">📱 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<div class="plan-grid">' +
        buildPlanCard(D.planA, 'plan-card--a', 'diff') +
        buildPlanCard(D.planB, 'plan-card--b', 'ratio') +
        '</div>' +
        '<p class="dl-caption">Angka di dalam kotak = banyak pengguna baru pada bulan tersebut.</p>',
      'panel--hero'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaanUn) +
        '</p>' +
        buildChoiceGroup(D.opsiUn, State.stimulasiOrderUn, {
          chosen: State.stimulasiUn,
          group: 'un',
        }) +
        '<p class="exercise-label" style="margin-top:var(--space-5);">' +
        esc(D.pertanyaanSn) +
        '</p>' +
        buildChoiceGroup(D.opsiSn, State.stimulasiOrderSn, {
          chosen: State.stimulasiSn,
          group: 'sn',
        }) +
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
      if (btn.dataset.group === 'un') State.stimulasiUn = btn.dataset.optId;
      else State.stimulasiSn = btn.dataset.optId;
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
    if (!State.stimulasiUn || !State.stimulasiSn) {
      showNotice('Pilih kedua dugaanmu sebelum melanjutkan.');
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

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.masalahPilihan === D.correct) return;
      State.masalahPilihan = btn.dataset.optId;
      saveState();
      renderMasalah(container);
    });
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
      navigateTo('koleksi');
    });
  }
}

/* ============================================================
   7. STAGE: PENGUMPULAN DATA  (Discovery Learning — sintaks 3)
   Bagian A: ungkap suku & tentukan a, r pada tiga konteks.
   Bagian B: pilah aritmetika / geometri / bukan (dibuka setelah A).
   ============================================================ */

function koleksiSemuaSelesai() {
  return State.koleksiCtx.every(function (c) {
    return c.done;
  });
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var idx = State.koleksiIdx;
  var ctx = D.konteks[idx];
  var st = State.koleksiCtx[idx];
  var bolehIsi = st.reveal >= D.minReveal;
  var semuaA = koleksiSemuaSelesai();

  var tabsHTML =
    '<div class="dl-tabs" role="tablist" aria-label="Pilih data">' +
    D.konteks
      .map(function (c, i) {
        var s = State.koleksiCtx[i];
        return (
          '<button type="button" role="tab" class="dl-tab' +
          (i === idx ? ' is-active' : '') +
          (s.done ? ' is-done' : '') +
          '" data-ctx="' +
          i +
          '" aria-selected="' +
          (i === idx) +
          '">' +
          '<span aria-hidden="true">' +
          c.icon +
          '</span> ' +
          esc(c.badge) +
          (s.done ? ' ✓' : '') +
          '</button>'
        );
      })
      .join('') +
    '</div>';

  var formHTML;
  if (st.done) {
    formHTML = buildFeedbackBox(
      'success',
      '✓',
      '<strong>a = ' +
        fmt(ctx.a) +
        '</strong> dan <strong>r = ' +
        formatRatio(ctx.r) +
        '</strong>. Setiap suku adalah suku sebelumnya dikali ' +
        formatRatio(ctx.r) +
        '. Selisihnya tidak tetap, tetapi hasil baginya selalu sama.'
    );
  } else {
    formHTML =
      '<div class="ab-form">' +
      '<label class="ab-field">Suku pertama (a) ' +
      buildDlNumInput('arA', st.a, { disabled: !bolehIsi, aria: 'Suku pertama a' }) +
      '</label>' +
      '<label class="ab-field">Rasio (r) ' +
      buildDlNumInput('arR', st.r, {
        disabled: !bolehIsi,
        aria: 'Rasio r',
        rational: true,
        placeholder: 'mis. 2 atau 1/2',
      }) +
      '</label>' +
      '<div class="dl-input-row">' +
      '<button type="button" class="btn btn--primary" id="arCheck"' +
      (bolehIsi ? '' : ' disabled') +
      '>Periksa</button>' +
      buildHintToggle('arHint', ctx.hints, st.hintLevel) +
      '</div>' +
      '</div>' +
      (!bolehIsi
        ? '<p class="dl-caption">Ungkap minimal ' +
          D.minReveal +
          ' suku dulu sebelum mengisi a dan r.</p>'
        : '') +
      (st.salah
        ? '<div style="margin-top:var(--space-3);">' +
          buildFeedbackBox(
            'error',
            '✗',
            'Belum tepat. Bagi suku berikutnya dengan suku sebelumnya, lalu periksa apakah hasilnya selalu sama.'
          ) +
          '</div>'
        : '') +
      buildHintStack(ctx.hints, st.hintLevel);
  }

  var pilahHTML = '';
  if (semuaA) {
    pilahHTML =
      buildDlPanel(
        '<h3 style="margin-top:0;">B. Pilah barisan</h3>' +
          '<p style="font-size:0.9rem;color:var(--color-ink-muted);">' +
          esc(D.instruksiB) +
          '</p>' +
          '<div id="pilahArea">' +
          buildSortItems(D.pilah, State.pilahOrder, D.opsiPilah, State.pilahStates, {
            mono: true,
          }) +
          '</div>'
      ) +
      (sortItemsAllAnswered(D.pilah, State.pilahStates)
        ? buildDlNextButton('koleksiNextBtn', D.nextLabel)
        : '');
  }

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">A. Kumpulkan data</h3>' +
        '<p style="font-size:0.9rem;color:var(--color-ink-muted);">' +
        esc(D.instruksiA) +
        '</p>' +
        tabsHTML +
        '<div class="ctx-card">' +
        '<p class="ctx-card__story">' +
        esc(ctx.cerita) +
        '</p>' +
        buildSequenceTiles(ctx.terms, {
          labels: ctx.labels,
          reveal: st.reveal,
          showDiff: st.done,
          gap: 'ratio',
          highlightLast: true,
        }) +
        '<div class="btn-group" style="margin:0 0 var(--space-4);">' +
        '<button type="button" class="btn btn--outline-primary btn--small" id="revealBtn"' +
        (st.reveal >= ctx.terms.length ? ' disabled' : '') +
        '>👁 Ungkap suku berikutnya</button>' +
        '<span class="dl-caption" style="align-self:center;">Satuan: ' +
        esc(ctx.satuan) +
        '</span>' +
        '</div>' +
        formHTML +
        '</div>' +
        (semuaA ? buildFeedbackBox('info', '🔍', D.temuanA) : '')
    ) +
    pilahHTML +
    '</section>';

  container.querySelectorAll('[data-ctx]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.koleksiIdx = +btn.dataset.ctx;
      saveState();
      renderKoleksi(container);
    });
  });

  document.getElementById('revealBtn').addEventListener('click', function () {
    st.reveal = Math.min(st.reveal + 1, ctx.terms.length);
    saveState();
    renderKoleksi(container);
  });

  var inA = document.getElementById('arA');
  var inR = document.getElementById('arR');
  var check = document.getElementById('arCheck');
  if (inA && inR && check) {
    inA.addEventListener('input', function () {
      st.a = inA.value;
    });
    inR.addEventListener('input', function () {
      st.r = inR.value;
    });
    [inA, inR].forEach(function (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') check.click();
      });
    });
    check.addEventListener('click', function () {
      var a = readDlNumber(inA.value, false);
      if (a === null) return;
      var r = readDlNumber(inR.value, true);
      if (r === null) return;
      st.a = inA.value.trim();
      st.r = inR.value.trim();
      st.attempts += 1;
      st.done = a === ctx.a && hampirSama(r, ctx.r);
      st.salah = !st.done;
      st.reveal = st.done ? ctx.terms.length : st.reveal;
      /* Beri tahu konteks berikutnya yang belum diselesaikan. */
      if (st.done) {
        for (var k = 0; k < State.koleksiCtx.length; k++) {
          if (!State.koleksiCtx[k].done) {
            showNotice('Mantap! Lanjutkan ke data "' + D.konteks[k].badge + '".');
            break;
          }
        }
      }
      saveState();
      renderKoleksi(container);
    });
  }

  var hint = document.getElementById('arHint');
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = Math.min(st.hintLevel + 1, ctx.hints.length);
      saveState();
      renderKoleksi(container);
    });
  }

  var pilahArea = document.getElementById('pilahArea');
  if (pilahArea) {
    bindSortItems(pilahArea, D.pilah, State.pilahStates, saveState, function () {
      renderKoleksi(container);
    });
  }

  bindNext('koleksiNextBtn', 'koleksi', 'olahUn');
}

/* ============================================================
   8. STAGE: OLAH DATA — RUMUS Uₙ  (Discovery Learning — sintaks 4)
   Tabel pangkat rasio → pilih rumus umum → uji U₁₀.
   ============================================================ */

function pangkatBenar(i) {
  var p = parseInputInt(State.olahUnInputs[i] || '', true);
  return !p.error && p.value === DATA.olahUn.baris[i] - 1;
}

function olahUnTabelBenar() {
  return DATA.olahUn.baris.every(function (n, i) {
    return pangkatBenar(i);
  });
}

function renderOlahUn(container) {
  var D = DATA.olahUn;
  var tabelBenar = State.olahUnChecked && olahUnTabelBenar();
  var rumusBenar = State.olahUnRumus === D.correctRumus;
  var uji = State.olahUnUji;

  var rowsHTML = D.baris
    .map(function (n, i) {
      var val = State.olahUnInputs[i] || '';
      var ok = pangkatBenar(i);
      var dinilai = State.olahUnChecked && val !== '';
      var mark = '';
      if (dinilai) {
        mark = ok
          ? '<span class="un-row__mark un-row__mark--ok" aria-label="benar">✓</span>'
          : '<span class="un-row__mark un-row__mark--no" aria-label="salah">✗</span>';
      }
      var un = D.a * Math.pow(D.r, n - 1);
      var tampilUn = n <= 5 || (State.olahUnChecked && ok);
      return (
        '<tr class="un-row' +
        (dinilai ? (ok ? ' un-row--ok' : ' un-row--no') : '') +
        '">' +
        '<th scope="row">U<sub>' +
        n +
        '</sub></th>' +
        '<td class="un-row__val">' +
        (tampilUn ? fmt(un) : '?') +
        '</td>' +
        '<td class="un-row__expr">= ' +
        D.a +
        ' × ' +
        D.r +
        '<sup class="pangkat-slot">' +
        '<input type="text" inputmode="numeric" class="input-text un-row__input" data-un="' +
        i +
        '" value="' +
        esc(val) +
        '" aria-label="Pangkat r untuk U' +
        n +
        '"' +
        (tabelBenar ? ' disabled' : '') +
        '>' +
        '</sup>' +
        mark +
        '</td>' +
        '</tr>'
      );
    })
    .join('');

  var rumusHTML = '';
  if (tabelBenar) {
    rumusHTML = buildDlPanel(
      buildFeedbackBox('info', '🔍', D.temuanTabel) +
        '<p class="exercise-label" style="margin-top:var(--space-4);">' +
        esc(D.pertanyaanRumus) +
        '</p>' +
        buildChoiceGroup(D.opsiRumus, State.olahUnRumusOrder, {
          chosen: State.olahUnRumus,
          correctId: rumusBenar ? D.correctRumus : null,
          grade: true,
          locked: rumusBenar,
        }) +
        buildChoiceFeedback(State.olahUnRumus, rumusBenar, D.umpanRumus)
    );
  }

  var ujiHTML = '';
  if (rumusBenar) {
    ujiHTML =
      buildDlPanel(
        '<div class="formula-card">Uₙ = a · rⁿ⁻¹</div>' +
          buildDlStep('unUji', uji, {
            label: D.ujiLabel,
            hints: D.ujiHints,
            temuan: D.ujiTemuan,
          })
      ) + (uji.done ? buildDlNextButton('olahUnNextBtn', D.nextLabel) : '');
  }

  container.innerHTML =
    '<section aria-label="Olah Data Rumus Suku ke-n">' +
    buildHead(D) +
    buildDlPanel(
      '<p class="dl-caption" style="margin-top:0;">' +
        esc(D.konteks) +
        '</p>' +
        buildSequenceTiles(D.terms, { showDiff: true, gap: 'ratio', more: true }) +
        '<p style="font-size:0.9rem;">' +
        esc(D.instruksi) +
        '</p>' +
        '<div class="un-table-wrap">' +
        '<table class="un-table">' +
        '<thead><tr><th scope="col">Suku</th><th scope="col">Nilai</th><th scope="col">a × r<sup>…</sup></th></tr></thead>' +
        '<tbody>' +
        rowsHTML +
        '</tbody>' +
        '</table>' +
        '</div>' +
        (tabelBenar
          ? ''
          : '<div class="dl-input-row" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="unTabelCheck">Periksa Tabel</button>' +
            buildHintToggle('unTabelHint', D.hints, State.olahUnHint) +
            '</div>' +
            buildHintStack(D.hints, State.olahUnHint))
    ) +
    rumusHTML +
    ujiHTML +
    '</section>';

  container.querySelectorAll('[data-un]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      State.olahUnInputs[+inp.dataset.un] = inp.value;
      saveState();
    });
    inp.addEventListener('keydown', function (e) {
      var btn = document.getElementById('unTabelCheck');
      if (e.key === 'Enter' && btn) btn.click();
    });
  });

  var tabelCheck = document.getElementById('unTabelCheck');
  if (tabelCheck) {
    tabelCheck.addEventListener('click', function () {
      var kosong = State.olahUnInputs.some(function (v) {
        return !String(v || '').trim();
      });
      if (kosong) {
        showNotice('Lengkapi semua baris tabel terlebih dahulu.');
        return;
      }
      State.olahUnChecked = true;
      saveState();
      if (!olahUnTabelBenar()) showNotice('Masih ada baris yang belum tepat. Perhatikan tanda ✗.');
      renderOlahUn(container);
    });
  }

  var tabelHint = document.getElementById('unTabelHint');
  if (tabelHint) {
    tabelHint.addEventListener('click', function () {
      State.olahUnHint = Math.min(State.olahUnHint + 1, D.hints.length);
      saveState();
      renderOlahUn(container);
    });
  }

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.olahUnRumus === D.correctRumus) return;
      State.olahUnRumus = btn.dataset.optId;
      saveState();
      renderOlahUn(container);
    });
  });

  if (rumusBenar) {
    bindDlStep('unUji', uji, { jawab: D.ujiJawab, hints: D.ujiHints }, saveState, function () {
      renderOlahUn(container);
    });
  }

  bindNext('olahUnNextBtn', 'olahUn', 'olahSn');
}

/* ============================================================
   9. STAGE: OLAH DATA — RUMUS Sₙ  (Discovery Learning — sintaks 4)
   Trik "kalikan r, geser, kurangkan": Sₙ ditulis di atas r·Sₙ yang
   bergeser satu kolom; murid mencoret pasangan suku kembar sehingga
   hanya a·rⁿ dan a yang tersisa.
   ============================================================ */

function coretSemua() {
  return State.olahSnCoret.every(function (c) {
    return c;
  });
}

/*
 * Grid geser: kolom 0..n. Baris atas (Sₙ) mengisi kolom 0..n−1,
 * baris bawah (r·Sₙ) mengisi kolom 1..n. Kolom 1..n−1 berisi pasangan
 * kembar yang dapat dicoret (indeks coret = kolom − 1).
 */
function buildShiftGrid() {
  var D = DATA.olahSn;
  var n = D.terms.length;
  var semua = coretSemua();

  function cell(val, col) {
    if (val === null)
      return '<span class="shift-cell shift-cell--empty" aria-hidden="true"></span>';
    var kembar = col >= 1 && col <= n - 1;
    if (!kembar) {
      return (
        '<span class="shift-cell' + (semua ? ' shift-cell--rest' : '') + '">' + fmt(val) + '</span>'
      );
    }
    var struck = State.olahSnCoret[col - 1];
    return (
      '<button type="button" class="shift-cell shift-cell--pair' +
      (struck ? ' is-struck' : '') +
      '" data-coret="' +
      (col - 1) +
      '" aria-pressed="' +
      struck +
      '" aria-label="' +
      (struck ? 'Sudah dicoret: ' : 'Coret pasangan ') +
      fmt(val) +
      '">' +
      fmt(val) +
      '</button>'
    );
  }

  function row(label, slots, cls) {
    var html = '<div class="shift-row' + (cls ? ' ' + cls : '') + '">';
    html += '<span class="shift-row__label">' + label + '</span>';
    for (var c = 0; c <= n; c++) {
      if (c > 0) {
        var op = slots[c - 1] !== null && slots[c] !== null ? '+' : '';
        html += '<span class="shift-op" aria-hidden="true">' + op + '</span>';
      }
      html += cell(slots[c], c);
    }
    return html + '</div>';
  }

  var atas = D.terms.concat([null]);
  var bawah = [null].concat(
    D.terms.map(function (t) {
      return t * D.r;
    })
  );
  var terakhir = D.terms[n - 1] * D.r;

  return (
    '<div class="shift-grid" role="group" aria-label="Deret S₅ dan 3 × S₅ yang bergeser satu kolom">' +
    row('S₅ =', atas) +
    row(D.r + 'S₅ =', bawah, 'shift-row--times') +
    (semua
      ? '<div class="shift-result">' +
        D.r +
        'S₅ − S₅ = <strong>' +
        fmt(terakhir) +
        '</strong> − <strong>' +
        fmt(D.terms[0]) +
        '</strong></div>'
      : '') +
    '</div>'
  );
}

function renderOlahSn(container) {
  var D = DATA.olahSn;
  var steps = State.olahSnSteps;
  var semua = coretSemua();
  var langkahSelesai = steps.every(function (s) {
    return s.done;
  });
  var benar1 = State.olahSnPilih1 === D.correct1;
  var benar2 = State.olahSnPilih2 === D.correct2;
  var sisaCoret = State.olahSnCoret.filter(function (c) {
    return !c;
  }).length;

  var stepsHTML = '';
  if (semua) {
    for (var i = 0; i < D.langkah.length; i++) {
      stepsHTML += buildDlStep('sn' + i, steps[i], D.langkah[i], i + 1);
      if (!steps[i].done) break;
    }
  }

  var pilih1HTML = '';
  if (langkahSelesai) {
    pilih1HTML = buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan1) +
        '</p>' +
        buildChoiceGroup(D.opsi1, State.olahSnOrder1, {
          chosen: State.olahSnPilih1,
          correctId: benar1 ? D.correct1 : null,
          grade: true,
          locked: benar1,
          group: 'p1',
        }) +
        buildChoiceFeedback(State.olahSnPilih1, benar1, D.umpan1)
    );
  }

  var pilih2HTML = '';
  if (benar1) {
    pilih2HTML = buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan2) +
        '</p>' +
        buildChoiceGroup(D.opsi2, State.olahSnOrder2, {
          chosen: State.olahSnPilih2,
          correctId: benar2 ? D.correct2 : null,
          grade: true,
          locked: benar2,
          group: 'p2',
        }) +
        buildChoiceFeedback(State.olahSnPilih2, benar2, D.umpan2) +
        (benar2
          ? '<div class="formula-duo" style="margin-top:var(--space-4);">' +
            '<div class="formula-card"><span class="formula-card__label">Rasio lebih dari 1</span>Sₙ = a(rⁿ − 1) / (r − 1)</div>' +
            '<div class="formula-card"><span class="formula-card__label">Rasio antara 0 dan 1</span>Sₙ = a(1 − rⁿ) / (1 − r)</div>' +
            '</div>'
          : '')
    );
  }

  container.innerHTML =
    '<section aria-label="Olah Data Rumus Jumlah n Suku">' +
    buildHead(D) +
    buildDlPanel(
      '<p class="dl-caption" style="margin-top:0;">' +
        esc(D.konteks) +
        '</p>' +
        '<p style="font-size:0.9rem;">' +
        esc(D.instruksiGrid) +
        '</p>' +
        buildShiftGrid() +
        (semua
          ? ''
          : '<p class="dl-caption">Masih ada ' + sisaCoret + ' pasangan yang belum dicoret.</p>') +
        stepsHTML
    ) +
    pilih1HTML +
    pilih2HTML +
    (benar2 ? buildDlNextButton('olahSnNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-coret]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var k = +btn.dataset.coret;
      if (State.olahSnCoret[k]) return;
      State.olahSnCoret[k] = true;
      saveState();
      if (coretSemua()) showNotice('Semua suku kembar tercoret! Lihat apa yang tersisa.');
      renderOlahSn(container);
    });
  });

  if (semua) {
    D.langkah.forEach(function (step, k) {
      bindDlStep('sn' + k, steps[k], step, saveState, function () {
        renderOlahSn(container);
      });
    });
  }

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.dataset.group === 'p1') {
        if (State.olahSnPilih1 === D.correct1) return;
        State.olahSnPilih1 = btn.dataset.optId;
      } else {
        if (State.olahSnPilih2 === D.correct2) return;
        State.olahSnPilih2 = btn.dataset.optId;
      }
      saveState();
      renderOlahSn(container);
    });
  });

  bindNext('olahSnNextBtn', 'olahSn', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A: uji rumus pada data nilai laptop. B: buktikan dugaan awal.
   ============================================================ */

function verifGrupSelesai(grup) {
  return DATA.verifikasi.uji.every(function (u, i) {
    return u.grup !== grup || State.verifSteps[i].done;
  });
}

/* Langkah grup berikut ditampilkan satu per satu sampai yang belum selesai. */
function buildGrupSteps(grup) {
  var html = '';
  var no = 0;
  var uji = DATA.verifikasi.uji;
  for (var i = 0; i < uji.length; i++) {
    if (uji[i].grup !== grup) continue;
    no += 1;
    html += buildDlStep('vf' + i, State.verifSteps[i], uji[i], no);
    if (!State.verifSteps[i].done) break;
  }
  return html;
}

function buildDugaanBanding() {
  var S = DATA.stimulasi;
  var V = DATA.verifikasi;
  function baris(judul, opsi, chosen, benarId) {
    var cocok = chosen === benarId;
    return (
      '<div class="dugaan-row' +
      (cocok ? ' dugaan-row--ok' : '') +
      '">' +
      '<span class="dugaan-row__title">' +
      judul +
      '</span>' +
      '<span>Dugaanmu: <strong>' +
      esc(findOptionLabel(opsi, chosen) || '—') +
      '</strong></span>' +
      '<span>Hasil rumus: <strong>' +
      esc(findOptionLabel(opsi, benarId)) +
      '</strong></span>' +
      '<span class="dugaan-row__verdict">' +
      (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh rumus') +
      '</span>' +
      '</div>'
    );
  }
  return (
    '<div class="dugaan-compare">' +
    baris('Pengguna baru bulan ke-10', S.opsiUn, State.stimulasiUn, V.dugaanUnBenar) +
    baris('Total pengguna bulan 1–10', S.opsiSn, State.stimulasiSn, V.dugaanSnBenar) +
    '</div>' +
    buildFeedbackBox(
      'info',
      '🧠',
      'Kejutan! Plan B unggul di bulan ke-10, tetapi totalnya masih kalah karena awalnya sangat kecil. Kapan total Plan B menyalip? Kita selidiki di tahap Bandingkan.'
    )
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var selesaiA = verifGrupSelesai('A');
  var selesaiB = verifGrupSelesai('B');
  var laptop = DATA.koleksi.konteks[2];
  var S = DATA.stimulasi;

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        buildSequenceTiles(laptop.terms, {
          labels: laptop.labels,
          showDiff: true,
          gap: 'ratio',
        }) +
        buildGrupSteps('A')
    ) +
    (selesaiA
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            '<div class="plan-grid">' +
            buildPlanCard(S.planA, 'plan-card--a', 'diff') +
            buildPlanCard(S.planB, 'plan-card--b', 'ratio') +
            '</div>' +
            buildGrupSteps('B') +
            (selesaiB ? buildDugaanBanding() : '')
        )
      : '') +
    (selesaiA && selesaiB ? buildDlNextButton('verifNextBtn', D.nextLabel) : '') +
    '</section>';

  D.uji.forEach(function (u, i) {
    bindDlStep('vf' + i, State.verifSteps[i], u, saveState, function () {
      renderVerifikasi(container);
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali temuanmu, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');

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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah konsep yang kamu temukan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Barisan &amp; Deret Geometri</h3>' +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + r + '</li>'
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
        showNotice('Lengkapi kelima kalimat lebih dulu.');
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

  bindNext('simpulanNextBtn', 'generalisasi', 'bandingkan');
}

/* ============================================================
   12. STAGE: BANDINGKAN POLA  (Discovery Learning — sintaks 6)
   A: grafik batang Plan A vs Plan B (slider n, mode Uₙ/Sₙ) dan
      mencari titik salip. B: memilah karakteristik aritmetika vs
      geometri. Ditutup tabel perbandingan.
   ============================================================ */

function buildBandingChart() {
  var D = DATA.bandingkan;
  var n = State.bandingN;
  var vals = planValues(n)[State.bandingMode];
  var last = vals[n - 1];
  var judul = State.bandingMode === 'un' ? 'Pengguna baru' : 'Total pengguna';
  return (
    buildCompareBarChart(
      [
        {
          label: D.labelA,
          values: vals.map(function (v) {
            return v[0];
          }),
        },
        {
          label: D.labelB,
          values: vals.map(function (v) {
            return v[1];
          }),
        },
      ],
      {
        highlight: n - 1,
        xLabel: function (i) {
          return 'B' + (i + 1);
        },
        caption: judul + ' Plan A dan Plan B dari bulan 1 sampai bulan ' + n,
      }
    ) +
    '<p class="banding-readout" aria-live="polite">' +
    judul +
    ' bulan ke-' +
    n +
    ': <span class="banding-readout__a">Plan A = ' +
    fmt(last[0]) +
    '</span> · <span class="banding-readout__b">Plan B = ' +
    fmt(last[1]) +
    '</span></p>'
  );
}

function renderBandingkan(container) {
  var D = DATA.bandingkan;
  var steps = State.bandingSteps;
  var langkahSelesai = steps.every(function (s) {
    return s.done;
  });
  var ciriSelesai = sortItemsAllAnswered(D.ciri, State.ciriStates);

  var stepsHTML = '';
  for (var i = 0; i < D.langkah.length; i++) {
    stepsHTML += buildDlStep('bd' + i, steps[i], D.langkah[i], i + 1);
    if (!steps[i].done) break;
  }

  var modeBtn = function (mode, label) {
    var aktif = State.bandingMode === mode;
    return (
      '<button type="button" class="dl-tab' +
      (aktif ? ' is-active' : '') +
      '" data-mode="' +
      mode +
      '" aria-pressed="' +
      aktif +
      '">' +
      label +
      '</button>'
    );
  };

  container.innerHTML =
    '<section aria-label="Bandingkan Pola Aritmetika dan Geometri">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">A. Balapan Plan A vs Plan B</h3>' +
        '<p style="font-size:0.9rem;color:var(--color-ink-muted);">' +
        esc(D.instruksiA) +
        '</p>' +
        '<div class="dl-tabs" role="group" aria-label="Pilih tampilan grafik">' +
        modeBtn('un', 'Pengguna baru (Uₙ)') +
        modeBtn('sn', 'Total pengguna (Sₙ)') +
        '</div>' +
        '<div class="banding-slider">' +
        '<label for="bandingSlider">Banyak bulan: <strong id="bandingNLabel">' +
        State.bandingN +
        '</strong></label>' +
        '<input type="range" id="bandingSlider" min="1" max="' +
        D.maxBulan +
        '" step="1" value="' +
        State.bandingN +
        '">' +
        '</div>' +
        '<div id="bandingChart">' +
        buildBandingChart() +
        '</div>' +
        stepsHTML +
        (langkahSelesai ? buildFeedbackBox('info', '📈', D.temuanGrafik) : '')
    ) +
    (langkahSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">B. Ciri aritmetika atau geometri?</h3>' +
            '<p style="font-size:0.9rem;color:var(--color-ink-muted);">' +
            esc(D.instruksiB) +
            '</p>' +
            '<div id="ciriArea">' +
            buildSortItems(D.ciri, State.ciriOrder, D.opsiCiri, State.ciriStates) +
            '</div>'
        )
      : '') +
    (ciriSelesai && langkahSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Ringkasan perbandingan</h3>' + buildTabelBanding(),
          'panel--hero'
        ) + buildDlNextButton('bandingNextBtn', D.nextLabel)
      : '') +
    '</section>';

  container.querySelectorAll('[data-mode]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.bandingMode = btn.dataset.mode;
      saveState();
      renderBandingkan(container);
    });
  });

  /* Slider hanya memperbarui grafik agar fokus & posisi geser tidak hilang. */
  var slider = document.getElementById('bandingSlider');
  slider.addEventListener('input', function () {
    State.bandingN = +slider.value;
    document.getElementById('bandingNLabel').textContent = State.bandingN;
    document.getElementById('bandingChart').innerHTML = buildBandingChart();
    saveState();
  });

  D.langkah.forEach(function (step, k) {
    bindDlStep('bd' + k, steps[k], step, saveState, function () {
      renderBandingkan(container);
    });
  });

  var ciriArea = document.getElementById('ciriArea');
  if (ciriArea) {
    bindSortItems(ciriArea, D.ciri, State.ciriStates, saveState, function () {
      renderBandingkan(container);
    });
  }

  bindNext('bandingNextBtn', 'bandingkan', 'terapkan');
}

/* ============================================================
   13. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js): campuran soal 'input'
   dan 'choice'; urutan opsi dari ex.optionOrder yang diacak di
   initExerciseArrays().
   ============================================================ */

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
  defaultType: 'input',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  inputRowClass: 'dl-input-row',
  inputAriaLabel: 'Jawabanmu',
  inputPlaceholder: 'Jawabanmu',
  stripPunctuation: true,
  revealButtonStyle: 'separate',
  invalidMessage: 'Tulis jawaban berupa bilangan bulat, mis. 12.150 atau 6.',
  checkValue: function (s) {
    return s.jawab;
  },
  revealText: function (s) {
    return s.reveal;
  },
  renderPrompt: function (s) {
    return (
      '<div class="dl-prompt">' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
      '<p class="dl-prompt__tanya">' +
      s.pertanyaan +
      '</p>' +
      '</div>'
    );
  },
});

function renderTerapkan(container) {
  TerapkanStage.render(container);
}

/* ============================================================
   14. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var benarPilah = sortItemsCorrectCount(DATA.koleksi.pilah, State.pilahStates);
  var benarCiri = sortItemsCorrectCount(DATA.bandingkan.ciri, State.ciriStates);
  var benarTerap = State.terapkanExercises.filter(function (e) {
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
        kartu(benarPilah + '/' + DATA.koleksi.pilah.length, 'Pemilahan barisan benar') +
        kartu(benarCiri + '/' + DATA.bandingkan.ciri.length, 'Ciri aritmetika/geometri benar') +
        kartu(benarTerap + '/' + DATA.terapkan.soal.length, 'Uji terap benar') +
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
   15. STAGE: SELESAI
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
    '<div class="formula-duo">' +
    '<div class="formula-card"><span class="formula-card__label">Suku ke-n</span>Uₙ = a · rⁿ⁻¹</div>' +
    '<div class="formula-card"><span class="formula-card__label">Jumlah n suku pertama</span>Sₙ = a(rⁿ − 1) / (r − 1)</div>' +
    '</div>' +
    '<div class="panel done-card__list">' +
    '<h3 style="margin-top:0;">Aritmetika vs Geometri</h3>' +
    buildTabelBanding() +
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
    'Kualitas penjelasan murid saat menurunkan rumus dan membandingkan kedua pola tetap menjadi bahan penilaian utama.' +
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
   16. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  stimulasi: renderStimulasi,
  masalah: renderMasalah,
  koleksi: renderKoleksi,
  olahUn: renderOlahUn,
  olahSn: renderOlahSn,
  verifikasi: renderVerifikasi,
  generalisasi: renderGeneralisasi,
  bandingkan: renderBandingkan,
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
   17. HELPER UI — MODAL RESET
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
   18. INIT
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
