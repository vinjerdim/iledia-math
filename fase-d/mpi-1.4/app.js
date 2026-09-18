'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Membandingkan dan Mengubah Representasi Bilangan Rasional

   Bagian:
    1. Utilitas Matematika
    2. Konstanta
    3. State & Storage
    4. Navigasi
    5. Utilitas Render (HTML builders)
    6. Stage: Orientasi
    7. Stage: Eksplorasi
    8. Stage: Konversi
    9. Stage: Bandingkan
   10. Stage: Urutkan
   11. Stage: Tantangan
   12. Stage: Refleksi
   13. Stage: Selesai
   14. Helper UI
   15. Init
   ============================================================ */

/* ============================================================
   1. UTILITAS MATEMATIKA
   ============================================================ */

function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b > 0) {
    var t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/** Apakah pecahan p/q menghasilkan desimal berhenti? */
function isTerminating(num, den) {
  var g = gcd(Math.abs(num), Math.abs(den));
  var d = Math.abs(den) / g;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

/** Parse input angka dari user: menerima koma atau titik sebagai pemisah desimal */
function parseInputDecimal(str) {
  if (!str || str.trim() === '') return { value: null, error: 'empty' };
  var normalized = str.trim().replace(/\s/g, '');
  /* Tolak jika ada lebih dari satu koma atau titik */
  var commaCount = (normalized.match(/,/g) || []).length;
  var dotCount = (normalized.match(/\./g) || []).length;
  if (commaCount + dotCount > 1) return { value: null, error: 'invalid' };
  normalized = normalized.replace(',', '.');
  if (!/^-?\d*\.?\d+$/.test(normalized)) return { value: null, error: 'invalid' };
  var val = parseFloat(normalized);
  if (isNaN(val)) return { value: null, error: 'invalid' };
  return { value: val, error: null };
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
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  State.currentStage = 'orientasi';
  State.completedStages = {};
  State.explorationSelected = null;
  State.explorationData = {};
  State.konversiIdx = 0;
  State.konversiExercises = [];
  State.bandingkanIdx = 0;
  State.bandingkanExercises = [];
  State.urutkanOrder = [];
  State.urutkanAttempts = 0;
  State.urutkanFeedback = null;
  State.urutkanDone = false;
  State.tantanganIdx = 0;
  State.tantanganExercises = [];
  State.refleksiAnswers = {};
  State.refleksiSaved = false;
  initExerciseArrays();
}

function initExerciseArrays() {
  /* Inisialisasi hanya jika belum ada data */
  if (!State.konversiExercises || State.konversiExercises.length !== DATA.konversi.soal.length) {
    State.konversiExercises = DATA.konversi.soal.map(function () {
      return { attempts: 0, hintLevel: 0, correct: false, userInput: '', revealed: false };
    });
  }
  if (
    !State.bandingkanExercises ||
    State.bandingkanExercises.length !== DATA.bandingkan.soal.length
  ) {
    State.bandingkanExercises = DATA.bandingkan.soal.map(function () {
      return { attempts: 0, correct: false, chosen: null, checked: false };
    });
  }
  if (!State.urutkanOrder || State.urutkanOrder.length === 0) {
    State.urutkanOrder = DATA.urutkan.initialOrder.slice();
  }
  if (!State.tantanganExercises || State.tantanganExercises.length !== DATA.tantangan.soal.length) {
    State.tantanganExercises = DATA.tantangan.soal.map(function (soal) {
      return {
        attempts: 0,
        correct: false,
        chosen: null,
        order: soal.type === 'ordering' ? soal.initialOrder.slice() : null,
        checked: false,
      };
    });
  }
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

function navigateTo(stageId) {
  var targetIdx = STAGES.indexOf(stageId);
  var currentIdx = STAGES.indexOf(State.currentStage);
  if (targetIdx === -1) return;

  /* Navigasi mundur bebas; maju: cek apakah tahap sebelumnya selesai */
  if (targetIdx > currentIdx) {
    for (var i = currentIdx; i < targetIdx; i++) {
      if (!State.completedStages[STAGES[i]]) {
        showNotice('Selesaikan tahap "' + STAGE_LABELS[i] + '" terlebih dahulu.');
        return;
      }
    }
  }

  State.currentStage = stageId;
  saveState();
  updateStageNav();
  renderCurrentStage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function completeStage(stageId) {
  State.completedStages[stageId] = true;
  saveState();
  updateStageNav();
  updateProgress();
}

function updateStageNav() {
  var items = document.querySelectorAll('.stage-nav__item');
  var currentIdx = STAGES.indexOf(State.currentStage);

  items.forEach(function (item) {
    var sid = item.dataset.stage;
    var idx = STAGES.indexOf(sid);
    item.removeAttribute('aria-current');
    item.classList.remove('is-complete');
    item.disabled = false;

    if (sid === State.currentStage) {
      item.setAttribute('aria-current', 'step');
    } else if (State.completedStages[sid]) {
      item.classList.add('is-complete');
    }

    if (idx > currentIdx && !State.completedStages[STAGES[idx - 1]]) {
      item.disabled = true;
    }
  });
}

function updateProgress() {
  var total = STAGES.length;
  var done = Object.keys(State.completedStages).length;
  var pct = Math.round((done / total) * 100);
  var fill = document.getElementById('progressFill');
  var label = document.getElementById('progressLabel');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = done + ' dari ' + total + ' tahap selesai';
}

/* ============================================================
   5. UTILITAS RENDER
   ============================================================ */

/** Escape HTML aman */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Render frac-block HTML */
function buildFracBlock(num, den, whole, size) {
  size = size || '';
  var cls = size ? ' frac-block--' + size : '';
  var ariaLabel =
    whole != null
      ? esc(whole) + ' dan ' + esc(num) + ' per ' + esc(den)
      : esc(num) + ' per ' + esc(den);
  var wholeHTML =
    whole != null ? '<span class="frac-block__whole">' + esc(String(whole)) + '</span>' : '';
  return (
    '<span class="frac-block' +
    cls +
    '" role="img" aria-label="' +
    ariaLabel +
    '">' +
    wholeHTML +
    '<span class="frac-block__frac">' +
    '<span class="frac-block__num">' +
    esc(String(num)) +
    '</span>' +
    '<span class="frac-block__den">' +
    esc(String(den)) +
    '</span>' +
    '</span></span>'
  );
}

/** Render inline fraction */
function buildFracInline(num, den, whole) {
  var ariaLabel =
    whole != null
      ? esc(whole) + ' dan ' + esc(num) + ' per ' + esc(den)
      : esc(num) + ' per ' + esc(den);
  var wholeStr = whole != null ? esc(String(whole)) : '';
  return (
    '<span class="frac-inline" role="img" aria-label="' +
    ariaLabel +
    '">' +
    wholeStr +
    '<span class="frac-num">' +
    esc(String(num)) +
    '</span>' +
    '<span class="frac-den">' +
    esc(String(den)) +
    '</span>' +
    '</span>'
  );
}

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

/* ============================================================
   6. STAGE: ORIENTASI
   ============================================================ */

function renderOrientasi(container) {
  container.innerHTML =
    '<section aria-label="Orientasi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 1 — MEMAHAMI</span>' +
    '<p class="stage-head__goal">Tujuan: Mengenal media pembelajaran dan memahami konteks pembelajaran hari ini.</p>' +
    '</div>' +
    '<div class="panel panel--hero">' +
    '<h2>' +
    esc(DATA.meta.title) +
    '</h2>' +
    '<p style="font-size:1.05rem;"><strong>Tujuan Pembelajaran:</strong><br>' +
    esc(DATA.meta.goal) +
    '</p>' +
    '<div class="panel panel--info" style="margin-bottom:0;">' +
    '<h3 style="margin-bottom:var(--space-2);">Dalam media ini kamu akan:</h3>' +
    '<ol class="objectives-list">' +
    '<li><span class="objectives-list__num">1</span>Menjelajahi hubungan visual antara pecahan dan desimal menggunakan model area.</li>' +
    '<li><span class="objectives-list__num">2</span>Berlatih mengubah pecahan menjadi desimal dengan panduan langkah demi langkah.</li>' +
    '<li><span class="objectives-list__num">3</span>Membandingkan bilangan rasional dalam representasi campuran (pecahan dan desimal).</li>' +
    '<li><span class="objectives-list__num">4</span>Mengurutkan produk makanan kemasan berdasarkan kandungan gula.</li>' +
    '<li><span class="objectives-list__num">5</span>Menyelesaikan tantangan kontekstual dengan resep, nutrisi, dan promo belanja.</li>' +
    '<li><span class="objectives-list__num">6</span>Merefleksikan strategi dan pemahamanmu.</li>' +
    '</ol></div></div>' +
    '<div class="panel panel--compact">' +
    '<h3>Konteks: Pecahan dan Desimal dalam Kehidupan Sehari-hari</h3>' +
    '<p>Kamu sering menjumpai representasi seperti <strong>"diskon ½ harga"</strong> dan <strong>"diskon 0,5"</strong> — keduanya menyatakan hal yang sama. ' +
    'Di dapur, resep sering menggunakan pecahan: <em>"¾ cangkir tepung"</em>. Di label kemasan, nutrisi ditulis dalam desimal: <em>"0,45 gram gula"</em>.</p>' +
    '<p>Memahami hubungan antara kedua representasi ini penting agar kamu bisa membandingkan dan membuat keputusan yang tepat.</p>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>Cara menggunakan media ini</h3>' +
    '<div class="hero-steps">' +
    '<div class="hero-steps__item"><span class="hero-steps__num">1</span>Kerjakan setiap tahap dari kiri ke kanan mengikuti navigasi di atas.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">2</span>Setiap aktivitas punya tombol <strong>Periksa</strong>, <strong>Petunjuk</strong>, dan <strong>Coba Lagi</strong>.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">3</span>Feedback menjelaskan alasan — bukan hanya "benar/salah". Baca dengan teliti.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">4</span>Progress tersimpan otomatis. Kamu bisa melanjutkan di lain waktu.</div>' +
    '</div></div>' +
    '<div class="panel panel--compact panel--warning">' +
    '<p style="margin:0;font-size:0.88rem;color:var(--color-warning-strong);">' +
    '<strong>Catatan:</strong> Hasil latihan dalam media ini adalah panduan belajar, bukan nilai akhir. ' +
    'Diskusi kelompok, presentasi, dan penilaian oleh guru tetap menjadi bagian utama asesmen.' +
    '</p></div>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary btn--large" id="startBtn">Mulai Eksplorasi →</button>' +
    '</div></section>';

  document.getElementById('startBtn').addEventListener('click', function () {
    completeStage('orientasi');
    navigateTo('eksplorasi');
  });
}

/* ============================================================
   7. STAGE: EKSPLORASI
   ============================================================ */

function countExplored() {
  return Object.values(State.explorationData).filter(function (d) {
    return d.shown;
  }).length;
}

function renderEksplorasi(container) {
  var fracs = DATA.eksplorasi.fractions;
  var explored = countExplored();
  var minReq = DATA.eksplorasi.minRequired;
  var canProceed = explored >= minReq;
  var selected = State.explorationSelected;

  /* Build fraction cards */
  var cards = fracs
    .map(function (f) {
      var isSelected = selected === f.id;
      var isExplored = State.explorationData[f.id] && State.explorationData[f.id].shown;
      var cls =
        'frac-card' + (isSelected ? ' is-selected' : '') + (isExplored ? ' is-explored' : '');
      return (
        '<button type="button" class="' +
        cls +
        '" data-frac="' +
        f.id +
        '" aria-pressed="' +
        isSelected +
        '">' +
        buildFracBlock(f.num, f.den, null, 'large') +
        '<span class="frac-card__label">' +
        f.num +
        '/' +
        f.den +
        '</span>' +
        '</button>'
      );
    })
    .join('');

  /* Build detail panel */
  var detailHTML = '';
  if (selected) {
    var frac = fracs.find(function (f) {
      return f.id === selected;
    });
    var data = State.explorationData[selected] || { attempts: 0, shown: false };
    var fracVal = frac.num / frac.den;
    var isRepeat = !isTerminating(frac.num, frac.den);
    var decDisplay = isRepeat ? formatDecShort(fracVal) + '...' : formatDecShort(fracVal);

    var visualHTML =
      '<div class="explore-visual">' +
      '<div class="explore-visual__title">Model Area — ' +
      frac.num +
      '/' +
      frac.den +
      '</div>' +
      '<div class="explore-fraction-hero">' +
      buildFracBlock(frac.num, frac.den, null, 'hero') +
      '</div>' +
      '<div class="area-model-wrap">' +
      buildAreaModel(frac.num, frac.den) +
      '</div>' +
      '<p class="area-model__caption">' +
      frac.num +
      ' dari ' +
      frac.den +
      ' bagian diarsir</p>' +
      '</div>';

    var predictHTML = '';
    if (!data.shown) {
      var hint1HTML =
        data.attempts >= 1
          ? '<div class="hint-box"><span class="hint-box__label">💡 Petunjuk:</span>' +
            esc(frac.hint) +
            '</div>'
          : '';
      predictHTML =
        '<div class="predict-form">' +
        '<h4>Prediksi Nilai Desimalnya</h4>' +
        '<p style="font-size:0.88rem;color:var(--color-ink-muted);">Sebelum melihat hasilnya, ketikkan prediksimu. Gunakan koma (,) sebagai tanda desimal.</p>' +
        '<div class="field-group">' +
        '<label for="predictInput">Nilai desimal dari ' +
        frac.num +
        '/' +
        frac.den +
        ' =</label>' +
        '<div class="decimal-input-wrap">' +
        '<input type="text" inputmode="decimal" id="predictInput" class="input-text" placeholder="0,..." aria-describedby="predictErr">' +
        '<button type="button" class="btn btn--primary" id="checkPredictBtn">Periksa</button>' +
        '</div>' +
        '<div class="field-error" id="predictErr"></div>' +
        '</div>' +
        hint1HTML +
        (data.attempts >= 2
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              'info',
              'ℹ️',
              '<strong>Bantuan:</strong> ' +
                frac.num +
                ' ÷ ' +
                frac.den +
                ' = <strong>' +
                esc(decDisplay) +
                '</strong>. Coba ketikkan nilai ini.'
            ) +
            '</div>'
          : '') +
        '<div id="predictFeedback" style="margin-top:var(--space-3);"></div>' +
        '</div>';
    } else {
      /* Sudah diungkap — tampilkan hasilnya */
      predictHTML =
        '<div class="predict-form">' +
        '<div class="explore-revealed">' +
        '<div class="explore-revealed__answer">' +
        buildFracBlock(frac.num, frac.den, null, 'large') +
        '<span style="font-size:1.5rem;color:var(--color-ink-muted);">=</span>' +
        '<span class="decimal-display--hero" style="color:var(--color-primary-strong);">' +
        esc(decDisplay) +
        '</span>' +
        '</div>' +
        '<div class="area-model-wrap">' +
        buildDecimalBar(fracVal) +
        '</div>' +
        buildFeedbackBox(
          'info',
          '📘',
          '<strong>' +
            frac.num +
            ' ÷ ' +
            frac.den +
            ' = ' +
            esc(decDisplay) +
            '</strong><br>' +
            esc(frac.explanation) +
            (isRepeat
              ? '<br><em>Catatan: Ini adalah desimal berulang yang tidak pernah berhenti.</em>'
              : '')
        ) +
        '</div></div>';
    }

    detailHTML =
      '<div class="panel" id="exploreDetail">' +
      '<div class="explore-panel">' +
      visualHTML +
      predictHTML +
      '</div></div>';
  }

  container.innerHTML =
    '<section aria-label="Eksplorasi Pecahan dan Desimal">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 2 — EKSPLORASI</span>' +
    '<p class="stage-head__goal">Tujuan: Menjelajahi hubungan antara pecahan, model visual, dan nilai desimal.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>' +
    esc(DATA.eksplorasi.title) +
    '</h3>' +
    '<p style="font-size:0.9rem;color:var(--color-ink-muted);">' +
    esc(DATA.eksplorasi.instruction) +
    '</p>' +
    '<div class="explore-progress" style="margin-bottom:var(--space-3);">' +
    '<span>Dieksplorasi:</span>' +
    '<span class="explore-progress__count" id="exploredCount">' +
    explored +
    ' dari ' +
    fracs.length +
    '</span>' +
    '<span>pecahan</span>' +
    (canProceed
      ? ' <span style="color:var(--color-success-strong);font-weight:600;">✓ Siap lanjut!</span>'
      : ' <span style="font-size:0.8rem;">(minimal ' + minReq + ')</span>') +
    '</div>' +
    '<div class="frac-grid" id="fracGrid">' +
    cards +
    '</div>' +
    '</div>' +
    detailHTML +
    '<div class="btn-group btn-group--spread">' +
    '<button type="button" class="btn btn--ghost" id="resetExploreBtn">↩ Reset Eksplorasi</button>' +
    '<button type="button" class="btn btn--primary" id="nextExploreBtn" ' +
    (canProceed ? '' : 'disabled') +
    '>' +
    'Lanjut ke Konversi →</button>' +
    '</div>' +
    '</section>';

  /* Events: pilih kartu pecahan */
  container.querySelectorAll('.frac-card').forEach(function (card) {
    card.addEventListener('click', function () {
      State.explorationSelected = card.dataset.frac;
      saveState();
      renderEksplorasi(container);
      /* Scroll ke detail */
      var detail = document.getElementById('exploreDetail');
      if (detail) detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* Event: periksa prediksi */
  var checkBtn = document.getElementById('checkPredictBtn');
  if (checkBtn) {
    var input = document.getElementById('predictInput');
    var errEl = document.getElementById('predictErr');
    var feedbackEl = document.getElementById('predictFeedback');
    var frac = fracs.find(function (f) {
      return f.id === selected;
    });

    if (input)
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (checkBtn) checkBtn.click();
        }
      });

    checkBtn.addEventListener('click', function () {
      if (!frac) return;
      errEl.textContent = '';
      var parsed = parseInputDecimal(input.value);
      if (parsed.error === 'empty') {
        errEl.textContent = 'Ketikkan nilai desimalmu terlebih dahulu.';
        input.classList.add('has-error');
        input.focus();
        return;
      }
      if (parsed.error === 'invalid') {
        errEl.textContent = 'Format tidak valid. Gunakan angka dan koma. Contoh: 0,5';
        input.classList.add('has-error');
        input.focus();
        return;
      }
      input.classList.remove('has-error');

      var fracVal = frac.num / frac.den;
      var tol = isTerminating(frac.num, frac.den) ? 0.001 : 0.005;
      var correct = checkDecimalAnswer(parsed.value, fracVal, tol);

      var dataEntry = State.explorationData[selected] || { attempts: 0, shown: false };
      dataEntry.attempts += 1;
      State.explorationData[selected] = dataEntry;

      if (correct) {
        dataEntry.shown = true;
        saveState();
        renderEksplorasi(container);
      } else {
        if (dataEntry.attempts >= 2) {
          dataEntry.shown = true;
          saveState();
          feedbackEl.innerHTML = buildFeedbackBox(
            'warning',
            '⚠️',
            'Jawaban kurang tepat. Nilai yang benar adalah <strong>' +
              esc(formatDecShort(fracVal)) +
              (isTerminating(frac.num, frac.den) ? '' : '...') +
              '</strong>. Perhatikan penjelasan di bawah ini.'
          );
          /* Tunda render untuk tampilkan feedback sebentar */
          setTimeout(function () {
            renderEksplorasi(container);
          }, 1200);
        } else {
          saveState();
          feedbackEl.innerHTML = buildFeedbackBox(
            'error',
            '✗',
            'Belum tepat. Periksa kembali — perhatikan petunjuk yang muncul di bawah ini.'
          );
          /* Re-render untuk tampilkan petunjuk */
          setTimeout(function () {
            renderEksplorasi(container);
          }, 800);
        }
      }
    });
  }

  /* Events: reset & lanjut */
  var resetBtn = document.getElementById('resetExploreBtn');
  if (resetBtn)
    resetBtn.addEventListener('click', function () {
      State.explorationData = {};
      State.explorationSelected = null;
      DATA.eksplorasi.fractions.forEach(function (f) {
        State.explorationData[f.id] = { attempts: 0, shown: false };
      });
      saveState();
      renderEksplorasi(container);
    });

  var nextBtn = document.getElementById('nextExploreBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      completeStage('eksplorasi');
      navigateTo('konversi');
    });
}

/* ============================================================
   8. STAGE: KONVERSI
   ============================================================ */

function renderKonversi(container) {
  var soal = DATA.konversi.soal;
  var idx = State.konversiIdx;
  var allDone = State.konversiExercises.every(function (e) {
    return e.correct || e.revealed;
  });

  if (allDone || idx >= soal.length) {
    renderKonversiSummary(container);
    return;
  }

  /* Clamp idx */
  if (idx >= soal.length) idx = soal.length - 1;

  var s = soal[idx];
  var ex = State.konversiExercises[idx] || {
    attempts: 0,
    hintLevel: 0,
    correct: false,
    userInput: '',
    revealed: false,
  };
  var done = ex.correct || ex.revealed;

  /* Status setiap soal */
  var statuses = State.konversiExercises.map(function (e) {
    if (e.correct) return 'correct';
    if (e.revealed && !e.correct) return 'incorrect';
    return '';
  });

  /* Area model (tampil kecil di samping soal) */
  var areaModel = buildAreaModel(s.num, s.den, 'small');

  /* Feedback HTML */
  var feedbackHTML = '';
  if (ex.hintLevel >= 1 && !done) {
    feedbackHTML +=
      '<div class="hint-box"><span class="hint-box__label">💡 Petunjuk ' +
      ex.hintLevel +
      ':</span>' +
      esc(s.hints[ex.hintLevel - 1]) +
      '</div>';
  }
  if (done) {
    if (ex.correct) {
      feedbackHTML = buildFeedbackBox(
        'success',
        '✓',
        '<strong>Tepat!</strong> ' +
          s.num +
          '/' +
          s.den +
          ' = ' +
          esc(s.display) +
          '<br>' +
          s.explanation
      );
    } else {
      feedbackHTML = buildFeedbackBox(
        'warning',
        '📘',
        '<strong>Jawaban:</strong> ' +
          s.num +
          '/' +
          s.den +
          ' = <strong>' +
          esc(s.display) +
          '</strong><br>' +
          s.explanation +
          (s.terminating === false
            ? '<br><em>Catatan: 1/3 menghasilkan desimal berulang (0,333...). Ini bukan kesalahan — memang sifat pecahannya.</em>'
            : '')
      );
    }
  }

  var isRepeat = !s.terminating;
  var placeholderText = isRepeat ? '0,333...' : '0,...';

  container.innerHTML =
    '<section aria-label="Konversi Pecahan ke Desimal">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 3 — KONVERSI</span>' +
    '<p class="stage-head__goal">Tujuan: Mengubah pecahan menjadi desimal menggunakan strategi yang tepat.</p>' +
    '</div>' +
    '<div class="panel">' +
    buildProgressDots(soal.length, idx, statuses) +
    '<h3 style="margin-bottom:var(--space-1);">Ubah pecahan berikut ke bentuk desimal</h3>' +
    '<p style="font-size:0.85rem;color:var(--color-ink-muted);">Gunakan koma (,) sebagai tanda desimal. Contoh: 0,5</p>' +
    '<div class="konversi-display">' +
    '<div class="konversi-frac-hero">' +
    buildFracBlock(s.num, s.den, null, 'hero') +
    '</div>' +
    '<div class="konversi-visual">' +
    '<div class="area-model-wrap">' +
    areaModel +
    '</div>' +
    '<div class="area-model-wrap" style="margin-top:var(--space-2);">' +
    buildDecimalBar(s.num / s.den) +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="konversi-answer-row">' +
    '<label for="konversiInput" style="font-weight:600;font-size:0.9rem;">= </label>' +
    '<input type="text" inputmode="decimal" id="konversiInput" class="input-text" ' +
    'placeholder="' +
    esc(placeholderText) +
    '" ' +
    'value="' +
    esc(ex.userInput) +
    '" ' +
    (done ? 'disabled' : '') +
    ' aria-describedby="konversiErr" aria-label="Masukkan nilai desimal untuk ' +
    s.num +
    '/' +
    s.den +
    '">' +
    '</div>' +
    '<div class="field-error" id="konversiErr"></div>' +
    feedbackHTML +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-5);">' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">' +
    '<button type="button" class="btn btn--ghost" id="prevKonversiBtn" ' +
    (idx === 0 ? 'disabled' : '') +
    '>← Sebelumnya</button>' +
    (!done
      ? '<button type="button" class="btn btn--ghost btn--small" id="hintKonversiBtn" ' +
        (ex.hintLevel >= s.hints.length ? 'disabled' : '') +
        '>💡 Petunjuk</button>'
      : '') +
    '</div>' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">' +
    (!done
      ? '<button type="button" class="btn btn--primary" id="checkKonversiBtn">Periksa Jawaban</button>'
      : idx < soal.length - 1
        ? '<button type="button" class="btn btn--primary" id="nextKonversiBtn">Lanjut →</button>'
        : '<button type="button" class="btn btn--primary" id="summaryKonversiBtn">Lihat Ringkasan →</button>') +
    '</div>' +
    '</div>' +
    '</div>' +
    '</section>';

  /* Focus input jika belum selesai */
  if (!done) {
    var inp = document.getElementById('konversiInput');
    if (inp)
      setTimeout(function () {
        inp.focus();
      }, 50);
  }

  /* Events */
  var input = document.getElementById('konversiInput');
  if (input)
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var ckBtn = document.getElementById('checkKonversiBtn');
        if (ckBtn && !ckBtn.disabled) ckBtn.click();
      }
    });

  var checkBtn = document.getElementById('checkKonversiBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      checkKonversiAnswer(container, idx);
    });

  var hintBtn = document.getElementById('hintKonversiBtn');
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      var ex2 = State.konversiExercises[idx];
      if (ex2.hintLevel < s.hints.length) {
        ex2.hintLevel += 1;
        saveState();
        renderKonversi(container);
      }
    });

  var prevBtn = document.getElementById('prevKonversiBtn');
  if (prevBtn)
    prevBtn.addEventListener('click', function () {
      State.konversiIdx = Math.max(0, idx - 1);
      saveState();
      renderKonversi(container);
    });

  var nextBtn2 = document.getElementById('nextKonversiBtn');
  if (nextBtn2)
    nextBtn2.addEventListener('click', function () {
      State.konversiIdx = Math.min(soal.length - 1, idx + 1);
      saveState();
      renderKonversi(container);
    });

  var summaryBtn = document.getElementById('summaryKonversiBtn');
  if (summaryBtn)
    summaryBtn.addEventListener('click', function () {
      State.konversiIdx = soal.length;
      saveState();
      renderKonversi(container);
    });
}

function checkKonversiAnswer(container, idx) {
  var s = DATA.konversi.soal[idx];
  var ex = State.konversiExercises[idx];
  var input = document.getElementById('konversiInput');
  var errEl = document.getElementById('konversiErr');
  if (!input || !errEl) return;

  errEl.textContent = '';
  input.classList.remove('has-error');

  /* Validasi input */
  if (!input.value.trim()) {
    errEl.textContent = 'Ketikkan jawabanmu terlebih dahulu.';
    input.classList.add('has-error');
    input.focus();
    return;
  }

  var parsed = parseInputDecimal(input.value);
  if (parsed.error) {
    errEl.textContent = 'Format tidak valid. Gunakan angka dan koma. Contoh: 0,75';
    input.classList.add('has-error');
    input.focus();
    return;
  }

  ex.userInput = input.value;
  ex.attempts += 1;

  var tol = s.tolerance || (s.terminating ? 0.001 : 0.005);
  var correct = checkDecimalAnswer(parsed.value, s.correct, tol);

  if (correct) {
    ex.correct = true;
    /* Auto-advance ke soal berikutnya setelah sebentar, atau tampilkan di sini */
    saveState();
    renderKonversi(container);
  } else {
    /* Jika sudah 3x salah, ungkap jawaban */
    if (ex.attempts >= 3) {
      ex.revealed = true;
      saveState();
      renderKonversi(container);
    } else {
      /* Naikan hint level secara otomatis jika belum maks */
      if (ex.hintLevel < s.hints.length) {
        ex.hintLevel = Math.min(ex.hintLevel + 1, s.hints.length);
      }
      saveState();
      renderKonversi(container);
    }
  }
}

function renderKonversiSummary(container) {
  var soal = DATA.konversi.soal;
  var exercises = State.konversiExercises;
  var correctCount = exercises.filter(function (e) {
    return e.correct;
  }).length;
  var total = soal.length;
  var pct = Math.round((correctCount / total) * 100);
  var allCorrect = correctCount === total;

  var rows = soal
    .map(function (s, i) {
      var ex = exercises[i];
      var status = ex.correct ? '✓' : '✗';
      var statusCls = ex.correct
        ? 'color:var(--color-success-strong)'
        : 'color:var(--color-error-strong)';
      return (
        '<tr>' +
        '<td>' +
        s.num +
        '/' +
        s.den +
        '</td>' +
        '<td>' +
        esc(s.display) +
        '</td>' +
        '<td style="' +
        statusCls +
        ';font-weight:600;">' +
        status +
        '</td>' +
        '</tr>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Ringkasan Konversi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 3 — RINGKASAN KONVERSI</span>' +
    '</div>' +
    '<div class="panel">' +
    buildFeedbackBox(
      allCorrect ? 'success' : correctCount >= Math.ceil(total * 0.7) ? 'info' : 'warning',
      allCorrect ? '🎉' : '📊',
      '<strong>' +
        correctCount +
        ' dari ' +
        total +
        ' soal dijawab benar (' +
        pct +
        '%)</strong>' +
        (allCorrect
          ? '<br>Semua konversi tepat! Kamu menguasai strategi konversi pecahan ke desimal.'
          : '<br>Periksa kembali soal yang belum tepat di bawah. Strategi: ingat bahwa pecahan = pembilang ÷ penyebut.')
    ) +
    '<div style="overflow-x:auto;margin-top:var(--space-4);">' +
    '<table style="width:100%;border-collapse:collapse;font-size:0.9rem;">' +
    '<thead><tr style="background:var(--color-bg-grid);">' +
    '<th style="padding:var(--space-2) var(--space-3);text-align:left;border:1px solid var(--color-border);">Pecahan</th>' +
    '<th style="padding:var(--space-2) var(--space-3);text-align:left;border:1px solid var(--color-border);">Desimal</th>' +
    '<th style="padding:var(--space-2) var(--space-3);text-align:center;border:1px solid var(--color-border);">Status</th>' +
    '</tr></thead>' +
    '<tbody>' +
    rows +
    '</tbody>' +
    '</table></div>' +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-5);">' +
    '<button type="button" class="btn btn--ghost" id="retryKonversiBtn">↩ Coba Lagi dari Awal</button>' +
    '<button type="button" class="btn btn--primary" id="nextFromKonversiBtn">Lanjut ke Bandingkan →</button>' +
    '</div></div></section>';

  document.getElementById('retryKonversiBtn').addEventListener('click', function () {
    State.konversiIdx = 0;
    State.konversiExercises = DATA.konversi.soal.map(function () {
      return { attempts: 0, hintLevel: 0, correct: false, userInput: '', revealed: false };
    });
    saveState();
    renderKonversi(container);
  });

  document.getElementById('nextFromKonversiBtn').addEventListener('click', function () {
    completeStage('konversi');
    navigateTo('bandingkan');
  });
}

/* ============================================================
   9. STAGE: BANDINGKAN
   ============================================================ */

function renderBandingkan(container) {
  var soal = DATA.bandingkan.soal;
  var idx = State.bandingkanIdx;
  var allDone = State.bandingkanExercises.every(function (e) {
    return e.checked;
  });

  if (allDone || idx >= soal.length) {
    renderBandingkanSummary(container);
    return;
  }

  /* Clamp */
  if (idx >= soal.length) idx = soal.length - 1;

  var s = soal[idx];
  var ex = State.bandingkanExercises[idx] || {
    attempts: 0,
    correct: false,
    chosen: null,
    checked: false,
  };
  var isChecked = ex.checked;

  var statuses = State.bandingkanExercises.map(function (e) {
    if (e.checked && e.correct) return 'correct';
    if (e.checked && !e.correct) return 'incorrect';
    return '';
  });

  /* Operator buttons */
  var ops = ['<', '=', '>'];
  var opLabels = { '<': '&lt;', '=': '=', '>': '&gt;' };
  var ariaLabels = { '<': 'kurang dari', '=': 'sama dengan', '>': 'lebih dari' };

  var opButtons = ops
    .map(function (op) {
      var cls = 'operator-btn';
      if (isChecked) {
        if (op === s.answer) cls += ' is-correct';
        else if (op === ex.chosen && op !== s.answer) cls += ' is-incorrect';
      } else if (op === ex.chosen) {
        cls += ' is-selected';
      }
      return (
        '<button type="button" class="' +
        cls +
        '" data-op="' +
        op +
        '" ' +
        'aria-label="' +
        ariaLabels[op] +
        '" ' +
        (isChecked ? 'disabled' : '') +
        '>' +
        opLabels[op] +
        '</button>'
      );
    })
    .join('');

  /* Feedback */
  var feedbackHTML = '';
  if (isChecked) {
    var valA = getDecVal(s.a);
    var valB = getDecVal(s.b);
    if (ex.correct) {
      feedbackHTML = buildFeedbackBox(
        'success',
        '✓',
        '<strong>Tepat!</strong><br>' +
          s.explanation +
          '<br><em style="font-size:0.85rem;">Strategi: ' +
          s.strategy +
          '</em>'
      );
    } else {
      feedbackHTML = buildFeedbackBox(
        'error',
        '✗',
        '<strong>Kurang tepat.</strong> Jawaban yang benar: ' +
          '<strong>' +
          fmtNumberDisplay(s.a) +
          ' ' +
          esc(s.answer) +
          ' ' +
          fmtNumberDisplay(s.b) +
          '</strong><br>' +
          s.explanation +
          '<br><em style="font-size:0.85rem;">Strategi: ' +
          s.strategy +
          '</em>'
      );
    }
    /* Tampilkan perbandingan desimal */
    feedbackHTML +=
      '<div class="comparison-result" style="margin-top:var(--space-3);">' +
      '<span style="font-family:var(--font-mono);">' +
      formatDecShort(valA) +
      '</span>' +
      '<span style="color:var(--color-primary-strong);">' +
      esc(s.answer) +
      '</span>' +
      '<span style="font-family:var(--font-mono);">' +
      formatDecShort(valB) +
      '</span>' +
      '</div>';
  } else if (ex.attempts >= 1 && !isChecked) {
    feedbackHTML =
      '<div class="hint-box"><span class="hint-box__label">💡 Petunjuk:</span>' +
      esc(s.hint) +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="Membandingkan Bilangan Rasional">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 4 — MEMBANDINGKAN</span>' +
    '<p class="stage-head__goal">Tujuan: Membandingkan dua bilangan rasional dalam representasi berbeda.</p>' +
    '</div>' +
    '<div class="panel">' +
    buildProgressDots(soal.length, idx, statuses) +
    '<h3>Pilih tanda yang tepat</h3>' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);">Bandingkan kedua bilangan berikut. Pilih &lt;, =, atau &gt;.</p>' +
    '<div class="bandingkan-display">' +
    '<div class="bandingkan-item">' +
    '<span class="bandingkan-item__label">Bilangan 1</span>' +
    '<div class="bandingkan-item__num">' +
    buildNumberDisplay(s.a, 'large') +
    '</div>' +
    '</div>' +
    '<span class="bandingkan-sep">?</span>' +
    '<div class="bandingkan-item">' +
    '<span class="bandingkan-item__label">Bilangan 2</span>' +
    '<div class="bandingkan-item__num">' +
    buildNumberDisplay(s.b, 'large') +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div role="group" aria-label="Pilih operator perbandingan">' +
    '<div class="operator-choice">' +
    opButtons +
    '</div>' +
    '</div>' +
    feedbackHTML +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-5);">' +
    '<button type="button" class="btn btn--ghost" id="prevBandingkanBtn" ' +
    (idx === 0 ? 'disabled' : '') +
    '>← Sebelumnya</button>' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">' +
    (!isChecked
      ? '<button type="button" class="btn btn--primary" id="checkBandingkanBtn" ' +
        (!ex.chosen ? 'disabled' : '') +
        '>Periksa Jawaban</button>'
      : idx < soal.length - 1
        ? '<button type="button" class="btn btn--outline-primary" id="retryBandingkanBtn">↩ Soal Ini</button>' +
          '<button type="button" class="btn btn--primary" id="nextBandingkanBtn">Lanjut →</button>'
        : '<button type="button" class="btn btn--primary" id="summaryBandingkanBtn">Lihat Ringkasan →</button>') +
    '</div></div></div></section>';

  /* Events: pilih operator */
  container.querySelectorAll('.operator-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      State.bandingkanExercises[idx].chosen = btn.dataset.op;
      saveState();
      renderBandingkan(container);
    });
  });

  var checkBtn = document.getElementById('checkBandingkanBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      var ex2 = State.bandingkanExercises[idx];
      if (!ex2.chosen) return;
      ex2.attempts += 1;
      ex2.correct = ex2.chosen === s.answer;
      ex2.checked = true;
      saveState();
      renderBandingkan(container);
    });

  var prevBtn = document.getElementById('prevBandingkanBtn');
  if (prevBtn)
    prevBtn.addEventListener('click', function () {
      State.bandingkanIdx = Math.max(0, idx - 1);
      saveState();
      renderBandingkan(container);
    });

  var nextBtn = document.getElementById('nextBandingkanBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      State.bandingkanIdx = Math.min(soal.length - 1, idx + 1);
      saveState();
      renderBandingkan(container);
    });

  var retryBtn = document.getElementById('retryBandingkanBtn');
  if (retryBtn)
    retryBtn.addEventListener('click', function () {
      State.bandingkanExercises[idx] = {
        attempts: 0,
        correct: false,
        chosen: null,
        checked: false,
      };
      saveState();
      renderBandingkan(container);
    });

  var summaryBtn2 = document.getElementById('summaryBandingkanBtn');
  if (summaryBtn2)
    summaryBtn2.addEventListener('click', function () {
      State.bandingkanIdx = soal.length;
      saveState();
      renderBandingkanSummary(container);
    });
}

function renderBandingkanSummary(container) {
  var soal = DATA.bandingkan.soal;
  var exercises = State.bandingkanExercises;
  var correctCount = exercises.filter(function (e) {
    return e.correct;
  }).length;
  var total = soal.length;
  var pct = Math.round((correctCount / total) * 100);

  container.innerHTML =
    '<section aria-label="Ringkasan Bandingkan">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 4 — RINGKASAN BANDINGKAN</span>' +
    '</div>' +
    '<div class="panel">' +
    buildFeedbackBox(
      correctCount === total
        ? 'success'
        : correctCount >= Math.ceil(total * 0.6)
          ? 'info'
          : 'warning',
      correctCount === total ? '🎉' : '📊',
      '<strong>' +
        correctCount +
        ' dari ' +
        total +
        ' perbandingan tepat (' +
        pct +
        '%)</strong>' +
        (correctCount < total
          ? '<br>Ingat: untuk membandingkan, ubah ke desimal dulu, lalu bandingkan digit per digit.'
          : '<br>Kamu berhasil membandingkan bilangan rasional dalam berbagai representasi!')
    ) +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-5);">' +
    '<button type="button" class="btn btn--ghost" id="retryAllBandingkanBtn">↩ Ulangi Semua</button>' +
    '<button type="button" class="btn btn--primary" id="nextFromBandingkanBtn">Lanjut ke Urutkan →</button>' +
    '</div></div></section>';

  document.getElementById('retryAllBandingkanBtn').addEventListener('click', function () {
    State.bandingkanIdx = 0;
    State.bandingkanExercises = DATA.bandingkan.soal.map(function () {
      return { attempts: 0, correct: false, chosen: null, checked: false };
    });
    saveState();
    renderBandingkan(container);
  });

  document.getElementById('nextFromBandingkanBtn').addEventListener('click', function () {
    completeStage('bandingkan');
    navigateTo('urutkan');
  });
}

/* ============================================================
   10. STAGE: URUTKAN
   ============================================================ */

var dragSrcId = null;

function getProductById(id) {
  return DATA.urutkan.products.find(function (p) {
    return p.id === id;
  });
}

function buildSortCardHTML(pid, rank, feedbackSet, checkedDone) {
  var p = getProductById(pid);
  if (!p) return '';

  var statusIcon = '';
  var cardCls = 'sort-card';
  if (checkedDone && feedbackSet) {
    if (feedbackSet.has(pid)) {
      cardCls += ' sort-card--correct';
      statusIcon = '<span style="color:var(--color-success-strong);font-size:1rem;">✓</span>';
    } else {
      cardCls += ' sort-card--incorrect';
      statusIcon = '<span style="color:var(--color-error-strong);font-size:1rem;">✗</span>';
    }
  }

  var sugarDisplay = '';
  if (p.sugar.type === 'fraction') {
    sugarDisplay = buildFracBlock(p.sugar.num, p.sugar.den, null, 'small');
  } else {
    sugarDisplay =
      '<span style="font-weight:700;color:var(--color-primary-strong);">' +
      formatDecShort(p.sugar.value) +
      '</span>';
  }

  return (
    '<div class="' +
    cardCls +
    '" draggable="' +
    (!checkedDone ? 'true' : 'false') +
    '" ' +
    'data-id="' +
    pid +
    '" id="sc-' +
    pid +
    '" ' +
    'aria-label="' +
    esc(p.name) +
    ', urutan ' +
    rank +
    '">' +
    '<span class="sort-card__handle" aria-hidden="true">⠿</span>' +
    '<span class="sort-card__rank">' +
    rank +
    '.</span>' +
    '<div class="sort-card__content">' +
    '<div class="sort-card__name">' +
    esc(p.name) +
    '</div>' +
    '<div class="sort-card__sugar">Gula: <strong>' +
    sugarDisplay +
    '</strong> sdm/sajian</div>' +
    '</div>' +
    '<div class="sort-card__move-btns" role="group" aria-label="Pindahkan ' +
    esc(p.name) +
    '">' +
    '<button type="button" class="sort-card__btn" data-move="up" data-id="' +
    pid +
    '" ' +
    'aria-label="Pindah ke atas" ' +
    (rank === 1 || checkedDone ? 'disabled' : '') +
    '>▲</button>' +
    '<button type="button" class="sort-card__btn" data-move="down" data-id="' +
    pid +
    '" ' +
    'aria-label="Pindah ke bawah" ' +
    (rank === State.urutkanOrder.length || checkedDone ? 'disabled' : '') +
    '>▼</button>' +
    '</div>' +
    statusIcon +
    '</div>'
  );
}

function renderUrutkan(container) {
  var correctOrder = DATA.urutkan.correctOrder;
  var checkedDone = State.urutkanDone;
  var feedbackSet =
    State.urutkanFeedback && State.urutkanFeedback.correctSet
      ? State.urutkanFeedback.correctSet
      : null;

  var correctCount = 0;
  if (checkedDone && feedbackSet) {
    correctCount = feedbackSet.size;
  }

  var sortCardsHTML = State.urutkanOrder
    .map(function (pid, i) {
      return buildSortCardHTML(pid, i + 1, feedbackSet, checkedDone);
    })
    .join('');

  var feedbackHTML = '';
  if (checkedDone && feedbackSet) {
    if (correctCount === correctOrder.length) {
      feedbackHTML = buildFeedbackBox(
        'success',
        '🎉',
        '<strong>Urutan benar!</strong> Kamu berhasil mengurutkan ' +
          correctOrder.length +
          ' produk dari kandungan gula terkecil ke terbesar.' +
          '<br>Kunci: konversikan semua ke desimal, lalu urutkan: <strong>0,25 &lt; 0,3 &lt; 0,35 &lt; 0,375 &lt; 0,45 &lt; 0,6</strong>'
      );
    } else {
      feedbackHTML = buildFeedbackBox(
        'warning',
        '⚠️',
        '<strong>' +
          correctCount +
          ' dari ' +
          correctOrder.length +
          ' posisi sudah tepat.</strong><br>' +
          'Kartu yang disorot merah perlu dipindahkan. ' +
          esc(DATA.urutkan.checkHint) +
          '<br><details style="margin-top:var(--space-2);"><summary style="cursor:pointer;font-size:0.85rem;color:var(--color-warning-strong);font-weight:600;">💡 Lihat nilai desimal semua produk</summary>' +
          '<div style="margin-top:var(--space-2);font-size:0.85rem;">' +
          DATA.urutkan.products
            .map(function (p) {
              var disp =
                p.sugar.type === 'fraction'
                  ? p.sugar.num + '/' + p.sugar.den
                  : formatDecShort(p.sugar.value);
              return (
                '<div>' +
                esc(p.name) +
                ': ' +
                esc(disp) +
                ' = <strong>' +
                formatDecShort(p.decimal) +
                '</strong></div>'
              );
            })
            .join('') +
          '</div></details>'
      );
    }
  }

  container.innerHTML =
    '<section aria-label="Mengurutkan Produk">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 5 — MENGURUTKAN</span>' +
    '<p class="stage-head__goal">Tujuan: Mengurutkan bilangan rasional dalam representasi campuran dari terkecil ke terbesar.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>' +
    esc(DATA.urutkan.title) +
    '</h3>' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);">' +
    esc(DATA.urutkan.context) +
    '</p>' +
    '<div class="feedback-box feedback-box--info" style="margin-bottom:var(--space-4);">' +
    '<span class="feedback-box__icon">ℹ️</span>' +
    '<div class="feedback-box__body"><strong>' +
    esc(DATA.urutkan.instruction) +
    '</strong><br>' +
    '<span style="font-size:0.82rem;">Gunakan tombol ▲▼ untuk menggeser kartu, atau seret (drag) pada perangkat desktop.</span>' +
    '</div></div>' +
    (State.urutkanAttempts > 0 && !checkedDone
      ? '<p style="font-size:0.85rem;color:var(--color-ink-muted);">Percobaan ke-' +
        State.urutkanAttempts +
        '</p>'
      : '') +
    '<div class="sort-list" id="sortList">' +
    sortCardsHTML +
    '</div>' +
    feedbackHTML +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-4);">' +
    '<button type="button" class="btn btn--ghost" id="resetUrutkanBtn">↩ Reset Urutan</button>' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">' +
    (!checkedDone
      ? '<button type="button" class="btn btn--primary" id="checkUrutkanBtn">Periksa Urutan</button>'
      : correctCount === correctOrder.length
        ? '<button type="button" class="btn btn--primary" id="nextFromUrutkanBtn">Lanjut ke Tantangan →</button>'
        : '<button type="button" class="btn btn--outline-primary" id="retryUrutkanBtn">↩ Coba Lagi</button>' +
          '<button type="button" class="btn btn--primary" id="nextFromUrutkanBtn">Lanjut ke Tantangan →</button>') +
    '</div></div></div></section>';

  /* Init drag-and-drop */
  if (!checkedDone) {
    initSortDragDrop(container);
  }

  /* Move buttons */
  container.querySelectorAll('.sort-card__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      var pid = btn.dataset.id;
      var direction = btn.dataset.move;
      var order = State.urutkanOrder;
      var fromIdx = order.indexOf(pid);
      var toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
      if (toIdx < 0 || toIdx >= order.length) return;
      var tmp = order[fromIdx];
      order[fromIdx] = order[toIdx];
      order[toIdx] = tmp;
      State.urutkanFeedback = null;
      State.urutkanDone = false;
      saveState();
      renderUrutkan(container);
    });
  });

  var checkBtn = document.getElementById('checkUrutkanBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      checkUrutkanOrder(container);
    });

  var resetBtn = document.getElementById('resetUrutkanBtn');
  if (resetBtn)
    resetBtn.addEventListener('click', function () {
      State.urutkanOrder = DATA.urutkan.initialOrder.slice();
      State.urutkanAttempts = 0;
      State.urutkanFeedback = null;
      State.urutkanDone = false;
      saveState();
      renderUrutkan(container);
    });

  var retryBtn2 = document.getElementById('retryUrutkanBtn');
  if (retryBtn2)
    retryBtn2.addEventListener('click', function () {
      State.urutkanFeedback = null;
      State.urutkanDone = false;
      saveState();
      renderUrutkan(container);
    });

  var nextBtn3 = document.getElementById('nextFromUrutkanBtn');
  if (nextBtn3)
    nextBtn3.addEventListener('click', function () {
      completeStage('urutkan');
      navigateTo('tantangan');
    });
}

function checkUrutkanOrder(container) {
  var order = State.urutkanOrder;
  var correct = DATA.urutkan.correctOrder;
  State.urutkanAttempts += 1;

  var correctSet = new Set();
  for (var i = 0; i < correct.length; i++) {
    if (order[i] === correct[i]) correctSet.add(order[i]);
  }

  State.urutkanFeedback = { correctSet: correctSet };
  State.urutkanDone = true;

  if (correctSet.size === correct.length) {
    completeStage('urutkan');
  }

  saveState();
  renderUrutkan(container);
}

function initSortDragDrop(container) {
  var listEl = document.getElementById('sortList');
  if (!listEl) return;

  listEl.querySelectorAll('[draggable="true"]').forEach(function (card) {
    card.addEventListener('dragstart', function (e) {
      dragSrcId = card.dataset.id;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dragSrcId);
      card.classList.add('is-dragging');
    });

    card.addEventListener('dragend', function () {
      card.classList.remove('is-dragging');
      dragSrcId = null;
      listEl.querySelectorAll('.sort-card').forEach(function (c) {
        c.classList.remove('is-drag-over');
      });
    });

    card.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (dragSrcId && dragSrcId !== card.dataset.id) {
        card.classList.add('is-drag-over');
      }
    });

    card.addEventListener('dragleave', function () {
      card.classList.remove('is-drag-over');
    });

    card.addEventListener('drop', function (e) {
      e.preventDefault();
      card.classList.remove('is-drag-over');
      var targetId = card.dataset.id;
      if (!dragSrcId || dragSrcId === targetId) return;

      var order = State.urutkanOrder;
      var fromIdx = order.indexOf(dragSrcId);
      var toIdx = order.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return;

      order.splice(fromIdx, 1);
      order.splice(toIdx, 0, dragSrcId);

      State.urutkanFeedback = null;
      State.urutkanDone = false;
      saveState();
      renderUrutkan(container);
    });
  });

  /* Drop on list itself (between cards) */
  listEl.addEventListener('dragover', function (e) {
    e.preventDefault();
  });
  listEl.addEventListener('drop', function (e) {
    e.preventDefault();
  });
}

/* ============================================================
   11. STAGE: TANTANGAN
   ============================================================ */

function renderTantangan(container) {
  var soal = DATA.tantangan.soal;
  var idx = State.tantanganIdx;
  var allDone = State.tantanganExercises.every(function (e) {
    return e.checked;
  });

  if (allDone || idx >= soal.length) {
    renderTantanganSummary(container);
    return;
  }

  if (idx >= soal.length) idx = soal.length - 1;

  var s = soal[idx];
  var ex = State.tantanganExercises[idx];

  var statuses = State.tantanganExercises.map(function (e) {
    if (e.checked && e.correct) return 'correct';
    if (e.checked && !e.correct) return 'incorrect';
    return '';
  });

  var questionHTML = '';
  if (s.type === 'choice') {
    questionHTML = buildTantanganChoice(s, ex);
  } else if (s.type === 'ordering') {
    questionHTML = buildTantanganOrdering(s, ex);
  }

  /* Feedback */
  var feedbackHTML = '';
  if (ex.checked) {
    if (ex.correct) {
      feedbackHTML = buildFeedbackBox(
        'success',
        '✓',
        '<strong>Tepat!</strong><br>' + s.explanation
      );
    } else {
      feedbackHTML = buildFeedbackBox(
        'error',
        '✗',
        '<strong>Belum tepat.</strong><br>' + s.explanation
      );
    }
  } else if (ex.attempts >= 1 && !ex.checked) {
    feedbackHTML =
      '<div class="hint-box"><span class="hint-box__label">💡 Petunjuk:</span>' +
      esc(s.hint) +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="Tantangan Kontekstual">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 6 — TANTANGAN</span>' +
    '<p class="stage-head__goal">Tujuan: Menerapkan konversi dan perbandingan bilangan rasional dalam konteks nyata.</p>' +
    '</div>' +
    '<div class="panel">' +
    buildProgressDots(soal.length, idx, statuses) +
    '<div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3);">' +
    '<span class="badge-chip">' +
    esc(s.badge) +
    '</span>' +
    '</div>' +
    '<div class="challenge-story">' +
    s.story +
    '</div>' +
    '<p style="font-weight:600;margin-bottom:var(--space-2);">' +
    s.question +
    '</p>' +
    questionHTML +
    feedbackHTML +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-5);">' +
    '<button type="button" class="btn btn--ghost" id="prevTantanganBtn" ' +
    (idx === 0 ? 'disabled' : '') +
    '>← Sebelumnya</button>' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">' +
    (!ex.checked
      ? '<button type="button" class="btn btn--primary" id="checkTantanganBtn" ' +
        ((s.type === 'choice' && !ex.chosen) || (s.type === 'ordering' && !ex.order)
          ? 'disabled'
          : '') +
        '>Periksa Jawaban</button>'
      : idx < soal.length - 1
        ? '<button type="button" class="btn btn--outline-primary" id="retryTantanganBtn">↩ Soal Ini</button>' +
          '<button type="button" class="btn btn--primary" id="nextTantanganBtn">Lanjut →</button>'
        : '<button type="button" class="btn btn--primary" id="summaryTantanganBtn">Lihat Ringkasan →</button>') +
    '</div></div></div></section>';

  /* Events: pilih pilihan jawaban */
  container.querySelectorAll('.choice-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      State.tantanganExercises[idx].chosen = btn.dataset.id;
      saveState();
      renderTantangan(container);
    });
  });

  /* Events: move up/down untuk soal ordering */
  container.querySelectorAll('[data-tantangan-move]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      var itemId = btn.dataset.id;
      var dir = btn.dataset.tantanganMove;
      var order = ex.order;
      var fromIdx2 = order.indexOf(itemId);
      var toIdx2 = dir === 'up' ? fromIdx2 - 1 : fromIdx2 + 1;
      if (toIdx2 < 0 || toIdx2 >= order.length) return;
      var tmp = order[fromIdx2];
      order[fromIdx2] = order[toIdx2];
      order[toIdx2] = tmp;
      saveState();
      renderTantangan(container);
    });
  });

  var checkBtn = document.getElementById('checkTantanganBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      checkTantanganAnswer(container, idx);
    });

  var prevBtn = document.getElementById('prevTantanganBtn');
  if (prevBtn)
    prevBtn.addEventListener('click', function () {
      State.tantanganIdx = Math.max(0, idx - 1);
      saveState();
      renderTantangan(container);
    });

  var nextBtn4 = document.getElementById('nextTantanganBtn');
  if (nextBtn4)
    nextBtn4.addEventListener('click', function () {
      State.tantanganIdx = Math.min(soal.length - 1, idx + 1);
      saveState();
      renderTantangan(container);
    });

  var retryBtn3 = document.getElementById('retryTantanganBtn');
  if (retryBtn3)
    retryBtn3.addEventListener('click', function () {
      var s2 = soal[idx];
      var currentOrder = State.tantanganExercises[idx].order;
      State.tantanganExercises[idx] = {
        attempts: 0,
        correct: false,
        chosen: null,
        /* preserve current order so student can fine-tune instead of starting over */
        order:
          s2.type === 'ordering'
            ? currentOrder
              ? currentOrder.slice()
              : s2.initialOrder.slice()
            : null,
        checked: false,
      };
      saveState();
      renderTantangan(container);
    });

  var summaryBtn3 = document.getElementById('summaryTantanganBtn');
  if (summaryBtn3)
    summaryBtn3.addEventListener('click', function () {
      State.tantanganIdx = soal.length;
      saveState();
      renderTantanganSummary(container);
    });
}

function buildTantanganChoice(s, ex) {
  var isChecked = ex.checked;
  var optHTML = s.options
    .map(function (opt) {
      var cls = 'choice-btn';
      if (isChecked) {
        if (opt.id === s.correct) cls += ' is-correct';
        else if (opt.id === ex.chosen && opt.id !== s.correct) cls += ' is-incorrect';
      } else if (opt.id === ex.chosen) {
        cls += ' is-selected';
      }
      var letter = String.fromCharCode(65 + s.options.indexOf(opt));
      var iconContent =
        isChecked && opt.id === s.correct
          ? '✓'
          : isChecked && opt.id === ex.chosen && opt.id !== s.correct
            ? '✗'
            : letter;
      return (
        '<button type="button" class="' +
        cls +
        '" data-id="' +
        opt.id +
        '" ' +
        (isChecked ? 'disabled' : '') +
        '>' +
        '<span class="choice-btn__icon">' +
        iconContent +
        '</span>' +
        esc(opt.label) +
        '</button>'
      );
    })
    .join('');
  return (
    '<div class="challenge-options" role="group" aria-label="Pilihan jawaban">' + optHTML + '</div>'
  );
}

function buildTantanganOrdering(s, ex) {
  var isChecked = ex.checked;
  var order =
    ex.order ||
    s.items.map(function (it) {
      return it.id;
    });

  /* Tentukan posisi benar jika sudah dicek */
  var correctSet2 = new Set();
  if (isChecked) {
    for (var i = 0; i < s.correctOrder.length; i++) {
      if (order[i] === s.correctOrder[i]) correctSet2.add(order[i]);
    }
  }

  var rows = order
    .map(function (itemId, i) {
      var item = s.items.find(function (it) {
        return it.id === itemId;
      });
      if (!item) return '';
      var statusIcon = '';
      var rowCls = 'sort-card';
      if (isChecked) {
        if (correctSet2.has(itemId)) {
          rowCls += ' sort-card--correct';
          statusIcon = '✓';
        } else {
          rowCls += ' sort-card--incorrect';
          statusIcon = '✗';
        }
      }
      return (
        '<div class="' +
        rowCls +
        '" style="cursor:default;">' +
        '<span class="sort-card__rank">' +
        (i + 1) +
        '.</span>' +
        '<div class="sort-card__content">' +
        '<div class="sort-card__name">' +
        esc(item.label) +
        '</div>' +
        '</div>' +
        '<div class="sort-card__move-btns">' +
        '<button type="button" class="sort-card__btn" data-tantangan-move="up" data-id="' +
        itemId +
        '" ' +
        (i === 0 || isChecked ? 'disabled' : '') +
        '>▲</button>' +
        '<button type="button" class="sort-card__btn" data-tantangan-move="down" data-id="' +
        itemId +
        '" ' +
        (i === order.length - 1 || isChecked ? 'disabled' : '') +
        '>▼</button>' +
        '</div>' +
        (statusIcon
          ? '<span style="font-weight:700;' +
            (statusIcon === '✓'
              ? 'color:var(--color-success-strong)'
              : 'color:var(--color-error-strong)') +
            ';">' +
            statusIcon +
            '</span>'
          : '') +
        '</div>'
      );
    })
    .join('');

  return '<div class="sort-list" style="max-width:480px;">' + rows + '</div>';
}

function checkTantanganAnswer(container, idx) {
  var s = DATA.tantangan.soal[idx];
  var ex = State.tantanganExercises[idx];

  ex.attempts += 1;

  if (s.type === 'choice') {
    if (!ex.chosen) return;
    ex.correct = ex.chosen === s.correct;
    ex.checked = true;
  } else if (s.type === 'ordering') {
    if (!ex.order) return;
    var correct = true;
    for (var i = 0; i < s.correctOrder.length; i++) {
      if (ex.order[i] !== s.correctOrder[i]) {
        correct = false;
        break;
      }
    }
    ex.correct = correct;
    ex.checked = true;

    /* Selalu tampilkan feedback posisi setelah memeriksa */
    ex.checked = true;
  }

  saveState();
  renderTantangan(container);
}

function renderTantanganSummary(container) {
  var soal = DATA.tantangan.soal;
  var exercises = State.tantanganExercises;
  var correctCount = exercises.filter(function (e) {
    return e.correct;
  }).length;
  var total = soal.length;

  container.innerHTML =
    '<section aria-label="Ringkasan Tantangan">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 6 — RINGKASAN TANTANGAN</span>' +
    '</div>' +
    '<div class="panel">' +
    buildFeedbackBox(
      correctCount === total ? 'success' : 'info',
      correctCount === total ? '🎉' : '📋',
      '<strong>' +
        correctCount +
        ' dari ' +
        total +
        ' tantangan diselesaikan dengan benar.</strong>' +
        '<br>Kamu telah berlatih menerapkan konversi dan perbandingan bilangan rasional dalam konteks kehidupan nyata.'
    ) +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-5);">' +
    '<button type="button" class="btn btn--ghost" id="retryAllTantanganBtn">↩ Ulangi Semua</button>' +
    '<button type="button" class="btn btn--primary" id="nextFromTantanganBtn">Lanjut ke Refleksi →</button>' +
    '</div></div></section>';

  document.getElementById('retryAllTantanganBtn').addEventListener('click', function () {
    State.tantanganIdx = 0;
    State.tantanganExercises = DATA.tantangan.soal.map(function (s2) {
      return {
        attempts: 0,
        correct: false,
        chosen: null,
        order: s2.type === 'ordering' ? s2.initialOrder.slice() : null,
        checked: false,
      };
    });
    saveState();
    renderTantangan(container);
  });

  document.getElementById('nextFromTantanganBtn').addEventListener('click', function () {
    completeStage('tantangan');
    navigateTo('refleksi');
  });
}

/* ============================================================
   12. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var soal = DATA.refleksi.soal;

  /* Summary stats */
  var konversiCorrect = State.konversiExercises.filter(function (e) {
    return e.correct;
  }).length;
  var bandingkanCorrect = State.bandingkanExercises.filter(function (e) {
    return e.correct;
  }).length;
  var tantanganCorrect = State.tantanganExercises.filter(function (e) {
    return e.correct;
  }).length;
  var urutkanDone = State.urutkanDone;

  var questionHTML = soal
    .map(function (q, i) {
      var saved = State.refleksiAnswers[q.id] || '';
      return (
        '<div class="panel panel--compact refleksi-item">' +
        '<span class="refleksi-item__num">Pertanyaan ' +
        (i + 1) +
        ' dari ' +
        soal.length +
        '</span>' +
        '<label for="r-' +
        q.id +
        '" style="font-size:0.95rem;font-weight:600;display:block;margin-bottom:var(--space-3);">' +
        q.question +
        '</label>' +
        '<textarea id="r-' +
        q.id +
        '" class="input-textarea" placeholder="' +
        esc(q.placeholder) +
        '" ' +
        'data-rid="' +
        q.id +
        '">' +
        esc(saved) +
        '</textarea>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 7 — REFLEKSI</span>' +
    '<p class="stage-head__goal">Tujuan: Merangkum pemahamanmu dan mengevaluasi strategi belajar yang efektif.</p>' +
    '</div>' +
    '<div class="panel panel--info" style="margin-bottom:var(--space-4);">' +
    '<h3>Ringkasan Latihanmu</h3>' +
    '<div class="summary-grid">' +
    '<div class="summary-card">' +
    '<div class="summary-card__val">' +
    konversiCorrect +
    '/' +
    DATA.konversi.soal.length +
    '</div>' +
    '<div class="summary-card__label">Konversi benar</div>' +
    '</div>' +
    '<div class="summary-card">' +
    '<div class="summary-card__val">' +
    bandingkanCorrect +
    '/' +
    DATA.bandingkan.soal.length +
    '</div>' +
    '<div class="summary-card__label">Perbandingan benar</div>' +
    '</div>' +
    '<div class="summary-card">' +
    '<div class="summary-card__val">' +
    tantanganCorrect +
    '/' +
    DATA.tantangan.soal.length +
    '</div>' +
    '<div class="summary-card__label">Tantangan benar</div>' +
    '</div>' +
    '<div class="summary-card">' +
    '<div class="summary-card__val" style="font-size:1.5rem;">' +
    (urutkanDone ? '✓' : '–') +
    '</div>' +
    '<div class="summary-card__label">Pengurutan selesai</div>' +
    '</div>' +
    '</div>' +
    '<p style="font-size:0.82rem;color:var(--color-primary-strong);margin:var(--space-2) 0 0;">' +
    esc(DATA.refleksi.note) +
    '</p>' +
    '</div>' +
    '<div class="refleksi-list">' +
    questionHTML +
    '</div>' +
    '<div class="btn-group btn-group--spread">' +
    '<span style="font-size:0.82rem;color:var(--color-ink-muted);align-self:center;">Jawaban tidak dikirim ke server.</span>' +
    '<button type="button" class="btn btn--primary" id="saveRefleksiBtn">Simpan & Selesai →</button>' +
    '</div>' +
    '</section>';

  /* Auto-save refleksi saat mengetik */
  container.querySelectorAll('textarea[data-rid]').forEach(function (ta) {
    ta.addEventListener('input', function () {
      State.refleksiAnswers[ta.dataset.rid] = ta.value;
      saveState();
    });
  });

  document.getElementById('saveRefleksiBtn').addEventListener('click', function () {
    /* Kumpulkan semua jawaban */
    container.querySelectorAll('textarea[data-rid]').forEach(function (ta) {
      State.refleksiAnswers[ta.dataset.rid] = ta.value;
    });
    State.refleksiSaved = true;
    saveState();
    completeStage('refleksi');
    navigateTo('selesai');
  });
}

/* ============================================================
   13. STAGE: SELESAI
   ============================================================ */

function renderSelesai(container) {
  var konversiCorrect = State.konversiExercises.filter(function (e) {
    return e.correct;
  }).length;
  var bandingkanCorrect = State.bandingkanExercises.filter(function (e) {
    return e.correct;
  }).length;
  var tantanganCorrect = State.tantanganExercises.filter(function (e) {
    return e.correct;
  }).length;
  var explored = countExplored();

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="done-card">' +
    '<span class="done-card__icon">🎓</span>' +
    '<h2>Latihan Selesai!</h2>' +
    '<p style="font-size:1.05rem;color:var(--color-ink-muted);max-width:480px;margin:0 auto var(--space-5);">' +
    'Kamu telah menyelesaikan seluruh tahap eksplorasi bilangan rasional.' +
    '</p>' +
    '<div class="summary-grid" style="max-width:640px;margin:0 auto var(--space-5);">' +
    '<div class="summary-card"><div class="summary-card__val">' +
    explored +
    '/8</div><div class="summary-card__label">Pecahan dieksplorasi</div></div>' +
    '<div class="summary-card"><div class="summary-card__val">' +
    konversiCorrect +
    '/8</div><div class="summary-card__label">Konversi benar</div></div>' +
    '<div class="summary-card"><div class="summary-card__val">' +
    bandingkanCorrect +
    '/6</div><div class="summary-card__label">Perbandingan benar</div></div>' +
    '<div class="summary-card"><div class="summary-card__val">' +
    tantanganCorrect +
    '/4</div><div class="summary-card__label">Tantangan benar</div></div>' +
    '</div>' +
    '<div class="feedback-box feedback-box--info" style="text-align:left;max-width:560px;margin:0 auto var(--space-5);">' +
    '<span class="feedback-box__icon">📌</span>' +
    '<div class="feedback-box__body">' +
    '<strong>Catatan untuk Guru:</strong><br>' +
    'Angka di atas adalah indikator latihan digital, bukan nilai akhir. ' +
    'Observasi diskusi kelompok, kemampuan menjelaskan strategi, dan kualitas penyelesaian LKPD tetap menjadi tanggung jawab guru.' +
    '</div></div>' +
    '<div class="btn-group btn-group--center">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '<button type="button" class="btn btn--outline-primary" id="reviewFromDoneBtn">Tinjau Ulang</button>' +
    '</div></div>' +
    '</section>';

  completeStage('selesai');

  document.getElementById('reviewFromDoneBtn').addEventListener('click', function () {
    navigateTo('eksplorasi');
  });
}

/* ============================================================
   14. HELPER UI
   ============================================================ */

var noticeTimer = null;

function showNotice(msg) {
  var el = document.getElementById('appNotice');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-visible');
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(function () {
    el.classList.remove('is-visible');
  }, 3000);
}

/* ============================================================
   15. INIT
   ============================================================ */

function buildStageNav() {
  var list = document.getElementById('stageNavList');
  if (!list) return;
  list.innerHTML = STAGES.map(function (sid, i) {
    return (
      '<li><button type="button" class="stage-nav__item" data-stage="' +
      sid +
      '">' +
      '<span class="stage-nav__num">' +
      (i + 1) +
      '</span>' +
      esc(STAGE_LABELS[i]) +
      '</button></li>'
    );
  }).join('');

  list.querySelectorAll('.stage-nav__item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      navigateTo(btn.dataset.stage);
    });
  });
}

function init() {
  var loaded = loadState();
  if (!loaded) {
    initExerciseArrays();
  } else {
    initExerciseArrays(); /* pastikan array valid meski state sudah dimuat */
  }

  buildStageNav();
  updateStageNav();
  updateProgress();
  renderCurrentStage();

  /* Reset button */
  var resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (confirm('Reset seluruh progress? Semua data latihan akan dihapus.')) {
        clearState();
        buildStageNav();
        updateStageNav();
        updateProgress();
        renderCurrentStage();
        window.scrollTo({ top: 0 });
        showNotice('Progress direset. Mulai dari awal.');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
