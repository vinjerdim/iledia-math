'use strict';

/* ============================================================
   app-core.js — Utilitas matematika, konstanta, state & storage, navigasi, render helper
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

/* ============================================================
   1. UTILITAS MATEMATIKA
   ============================================================ */

/** Apakah pecahan p/q menghasilkan desimal berhenti? */
function isTerminating(num, den) {
  var g = gcd(Math.abs(num), Math.abs(den));
  var d = Math.abs(den) / g;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

/** Format nilai desimal untuk tampilan Indonesia (koma sebagai pemisah) */
function formatDec(val, maxDigits) {
  if (typeof maxDigits === 'undefined') maxDigits = 6;
  /* Deteksi desimal berulang: cek jika pembulatan berulang */
  var rounded = parseFloat(val.toFixed(maxDigits));
  var str = rounded.toString().replace('.', ',');
  return str;
}

/** Format desimal untuk tampilan singkat (maks 4 digit setelah koma) */
function formatDecShort(val) {
  return formatDec(val, 4);
}

/** Ambil nilai desimal dari objek number { type, num, den, whole, value } */
function getDecVal(obj) {
  if (obj.type === 'fraction') return obj.num / obj.den;
  if (obj.type === 'mixed') return obj.whole + obj.num / obj.den;
  if (obj.type === 'decimal') return obj.value;
  return 0;
}

/** Format objek number sebagai string tampilan */
function fmtNumberDisplay(obj) {
  if (obj.type === 'fraction') return obj.num + '/' + obj.den;
  if (obj.type === 'mixed') return obj.whole + '½ (contoh)';
  if (obj.type === 'decimal') return formatDecShort(obj.value);
  return '';
}

/** Bandingkan dua nilai dengan toleransi floating-point */
function approxEqual(a, b, tol) {
  if (typeof tol === 'undefined') tol = 1e-9;
  return Math.abs(a - b) <= tol;
}

/** Periksa apakah jawaban input cocok dengan nilai yang diharapkan */
function checkDecimalAnswer(inputVal, correctVal, tolerance) {
  if (typeof tolerance === 'undefined') tolerance = 0.001;
  return Math.abs(inputVal - correctVal) <= tolerance;
}

/* ============================================================
   2. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'eksplorasi',
  'konversi',
  'bandingkan',
  'urutkan',
  'tantangan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Orientasi',
  'Eksplorasi',
  'Konversi',
  'Bandingkan',
  'Urutkan',
  'Tantangan',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-1-4-v1';

/* ============================================================
   3. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Eksplorasi */
  explorationSelected: null,
  explorationData: {} /* { fracId: { attempts:0, shown:false } } */,

  /* Konversi */
  konversiIdx: 0,
  konversiExercises: [] /* [{ attempts, hintLevel, correct, userInput, revealed }] */,

  /* Bandingkan */
  bandingkanIdx: 0,
  bandingkanExercises: [] /* [{ attempts, correct, chosen, checked }] */,

  /* Urutkan */
  urutkanOrder: [],
  urutkanAttempts: 0,
  urutkanFeedback: null /* null | { correctSet: Set } */,
  urutkanDone: false,

  /* Tantangan */
  tantanganIdx: 0,
  tantanganExercises: [] /* [{ attempts, correct, chosen, order, checked }] */,

  /* Refleksi */
  refleksiAnswers: {},
  refleksiSaved: false,
};

var Store = createStore({ key: STORAGE_KEY, state: State });

function saveState() {
  try {
    /* Set tidak bisa di-JSON, simpan sebagai array */
    var s = JSON.parse(JSON.stringify(State));
    if (s.urutkanFeedback && s.urutkanFeedback.correctSet) {
      s.urutkanFeedback.correctSetArr = Array.from(State.urutkanFeedback.correctSet);
      delete s.urutkanFeedback.correctSet;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    /* simpan gagal, lanjutkan */
  }
}

function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    var saved = JSON.parse(raw);
    /* Pulihkan Set */
    if (saved.urutkanFeedback && saved.urutkanFeedback.correctSetArr) {
      saved.urutkanFeedback.correctSet = new Set(saved.urutkanFeedback.correctSetArr);
      delete saved.urutkanFeedback.correctSetArr;
    }
    Object.assign(State, saved);
    return true;
  } catch (e) {
    return false;
  }
}

function clearState() {
  Store.reset();
  initExerciseArrays();
}

function initExerciseArrays() {
  ensureExerciseArray(State, 'konversiExercises', DATA.konversi.soal, function () {
    return { attempts: 0, hintLevel: 0, correct: false, userInput: '', revealed: false };
  });
  ensureExerciseArray(State, 'bandingkanExercises', DATA.bandingkan.soal, function () {
    return { attempts: 0, correct: false, chosen: null, checked: false };
  });
  if (!State.urutkanOrder || State.urutkanOrder.length === 0) {
    State.urutkanOrder = DATA.urutkan.initialOrder.slice();
  }
  ensureExerciseArray(State, 'tantanganExercises', DATA.tantangan.soal, function (soal) {
    return {
      attempts: 0,
      correct: false,
      chosen: null,
      order: soal.type === 'ordering' ? soal.initialOrder.slice() : null,
      checked: false,
    };
  });
  if (!State.explorationData || Object.keys(State.explorationData).length === 0) {
    State.explorationData = {};
    DATA.eksplorasi.fractions.forEach(function (f) {
      State.explorationData[f.id] = { attempts: 0, shown: false };
    });
  }
}

/* ============================================================
   4. NAVIGASI
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
   5. UTILITAS RENDER
   ============================================================ */

/* buildFracBlock/buildFracInline berada di shared/engine.js. */

/** Render number object sebagai display HTML */
function buildNumberDisplay(obj, size) {
  size = size || '';
  if (obj.type === 'fraction') {
    return buildFracBlock(obj.num, obj.den, null, size);
  }
  if (obj.type === 'mixed') {
    return buildFracBlock(obj.num, obj.den, obj.whole, size);
  }
  if (obj.type === 'decimal') {
    var cls = size ? ' decimal-display--' + size : '';
    return (
      '<span class="decimal-display' +
      cls +
      '" aria-label="' +
      formatDecShort(obj.value).replace(',', ' koma ') +
      '">' +
      esc(formatDecShort(obj.value)) +
      '</span>'
    );
  }
  return '';
}

/** Render area model grid */
function buildAreaModel(num, den, size) {
  size = size || '';
  var cols;
  if (den <= 10) cols = den;
  else if (den <= 20) cols = 5;
  else cols = 5; /* 25: 5×5 */

  var cells = '';
  for (var i = 0; i < den; i++) {
    var shaded = i < num ? ' area-model__cell--shaded' : '';
    cells += '<div class="area-model__cell' + shaded + '"></div>';
  }
  var cls = size ? ' area-model--' + size : '';
  return (
    '<div class="area-model' +
    cls +
    '" style="grid-template-columns: repeat(' +
    cols +
    ', 1fr);" role="img" aria-label="' +
    num +
    ' dari ' +
    den +
    ' bagian diarsir">' +
    cells +
    '</div>'
  );
}

/** Render decimal bar */
function buildDecimalBar(val) {
  var pct = Math.min(100, Math.max(0, val * 100));
  var pctStr = pct.toFixed(1);
  return (
    '<div class="decimal-bar" role="progressbar" aria-valuenow="' +
    pctStr +
    '" aria-valuemin="0" aria-valuemax="100" aria-label="' +
    pctStr +
    '%">' +
    '<div class="decimal-bar__fill" style="width:' +
    pctStr +
    '%"></div>' +
    '<span class="decimal-bar__label">' +
    pctStr +
    '%</span>' +
    '</div>'
  );
}

/** Feedback box */
function buildFeedbackBox(type, icon, html) {
  return (
    '<div class="feedback-box feedback-box--' +
    esc(type) +
    '" role="alert">' +
    '<span class="feedback-box__icon" aria-hidden="true">' +
    icon +
    '</span>' +
    '<div class="feedback-box__body">' +
    html +
    '</div>' +
    '</div>'
  );
}

/** Exercise progress dots */
function buildProgressDots(total, current, statuses) {
  var dots = '';
  for (var i = 0; i < total; i++) {
    var cls = 'exercise-progress__dot';
    if (i === current) cls += ' exercise-progress__dot--current';
    else if (statuses && statuses[i] === 'correct') cls += ' exercise-progress__dot--done';
    else if (statuses && statuses[i] === 'incorrect') cls += ' exercise-progress__dot--incorrect';
    dots += '<span class="' + cls + '" aria-label="Soal ' + (i + 1) + '">' + (i + 1) + '</span>';
  }
  return (
    '<div class="exercise-progress" aria-label="Progress soal">' +
    dots +
    '<span class="exercise-label">Soal ' +
    (current + 1) +
    ' dari ' +
    total +
    '</span>' +
    '</div>'
  );
}

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  container.innerHTML = '';
  updateProgress();

  switch (State.currentStage) {
    case 'orientasi':
      renderOrientasi(container);
      break;
    case 'eksplorasi':
      renderEksplorasi(container);
      break;
    case 'konversi':
      renderKonversi(container);
      break;
    case 'bandingkan':
      renderBandingkan(container);
      break;
    case 'urutkan':
      renderUrutkan(container);
      break;
    case 'tantangan':
      renderTantangan(container);
      break;
    case 'refleksi':
      renderRefleksi(container);
      break;
    case 'selesai':
      renderSelesai(container);
      break;
    default:
      container.innerHTML =
        '<p style="padding:var(--space-5);color:var(--color-ink-muted);">Tahap tidak ditemukan.</p>';
  }
}
