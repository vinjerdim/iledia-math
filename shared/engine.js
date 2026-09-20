'use strict';

/* ============================================================
   engine.js — Utilitas bersama untuk semua media pembelajaran MPI

   Dimuat sebagai <script> biasa (tanpa module bundler), sebelum
   data.js dan app.js pada setiap modul. Semua fungsi diekspos
   sebagai global, sehingga app.js masing-masing modul dapat
   memanggilnya langsung tanpa perubahan pada kode stage-render.

   Bagian:
    1. Utilitas Teks & Input
    2. Notifikasi (Toast)
    3. Utilitas Render
    4. Mesin Navigasi Tahap
   ============================================================ */

/* ============================================================
   1. UTILITAS TEKS & INPUT
   ============================================================ */

/*
 * stripPunctuation: saat true, tanda titik dan koma (pemisah ribuan pada
 * beberapa soal, mis. nominal uang) turut dibuang selain spasi.
 */
function parseInputInt(str, stripPunctuation) {
  if (!str || str.trim() === '') return { value: null, error: 'empty' };
  var pattern = stripPunctuation ? /[\s.,]/g : /\s/g;
  var trimmed = str.trim().replace(pattern, '');
  if (!/^-?\d+$/.test(trimmed)) return { value: null, error: 'invalid' };
  var v = parseInt(trimmed, 10);
  if (isNaN(v)) return { value: null, error: 'invalid' };
  return { value: v, error: null };
}

function esc(str) {
  var m = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(str).replace(/[&<>"']/g, function (ch) {
    return m[ch];
  });
}

/* ============================================================
   2. NOTIFIKASI (TOAST)
   ============================================================ */

var noticeTimer = null;

function showNotice(msg, elementId) {
  var el = document.getElementById(elementId || 'appNotice');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-visible');
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(function () {
    el.classList.remove('is-visible');
  }, 3000);
}

/* ============================================================
   3. UTILITAS RENDER
   ============================================================ */

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

function buildProgressDots(total, current, statuses) {
  var dots = '';
  for (var i = 0; i < total; i++) {
    var cls = 'exercise-progress__dot';
    if (i === current) cls += ' exercise-progress__dot--current';
    else if (statuses && statuses[i] === 'correct') cls += ' exercise-progress__dot--done';
    else if (statuses && statuses[i] === 'incorrect') cls += ' exercise-progress__dot--incorrect';
    dots += '<span class="' + cls + '" title="Soal ' + (i + 1) + '">' + (i + 1) + '</span>';
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

/* Build an SVG number line from min to max, with a point at value */
function buildNumberLineSVG(value, min, max) {
  var W = 600;
  var H = 80;
  var padX = 40;
  var axisY = 40;
  var tickH = 10;
  var majorH = 16;

  function xOf(v) {
    return padX + ((v - min) / (max - min)) * (W - 2 * padX);
  }

  var ticks = '';
  var labels = '';
  for (var v = min; v <= max; v++) {
    var x = xOf(v);
    var isMajor = v % 5 === 0;
    var h = isMajor ? majorH : tickH;
    ticks +=
      '<line class="nl-tick' +
      (isMajor ? ' nl-tick--major' : '') +
      '" x1="' +
      x +
      '" y1="' +
      (axisY - h / 2) +
      '" x2="' +
      x +
      '" y2="' +
      (axisY + h / 2) +
      '"/>';
    if (isMajor || v === 0) {
      var lCls = v === 0 ? 'nl-label nl-label--zero' : 'nl-label';
      labels +=
        '<text class="' + lCls + '" x="' + x + '" y="' + (axisY + h / 2 + 4) + '">' + v + '</text>';
    }
  }

  var px = xOf(value);
  var point = '<circle class="nl-point" cx="' + px + '" cy="' + axisY + '" r="8"/>';
  var isNeg = value < 0;
  var ptLabel =
    '<text class="nl-point-label" x="' +
    px +
    '" y="' +
    (axisY - 14) +
    '">' +
    (isNeg ? value : '+' + value === '+0' ? '0' : value) +
    '</text>';

  var arrowL = padX - 10;
  var arrowR = W - padX + 10;
  var arrowHead =
    '<polygon class="nl-arrow" points="' +
    arrowR +
    ',' +
    axisY +
    ' ' +
    (arrowR - 8) +
    ',' +
    (axisY - 4) +
    ' ' +
    (arrowR - 8) +
    ',' +
    (axisY + 4) +
    '"/>' +
    '<polygon class="nl-arrow" points="' +
    arrowL +
    ',' +
    axisY +
    ' ' +
    (arrowL + 8) +
    ',' +
    (axisY - 4) +
    ' ' +
    (arrowL + 8) +
    ',' +
    (axisY + 4) +
    '"/>';

  return (
    '<svg class="numberline-svg" viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" xmlns="http://www.w3.org/2000/svg" aria-label="Garis bilangan dari ' +
    min +
    ' hingga ' +
    max +
    '">' +
    '<line class="nl-axis" x1="' +
    (padX - 10) +
    '" y1="' +
    axisY +
    '" x2="' +
    (W - padX + 10) +
    '" y2="' +
    axisY +
    '"/>' +
    ticks +
    labels +
    point +
    ptLabel +
    arrowHead +
    '</svg>'
  );
}

/* ============================================================
   4. MESIN NAVIGASI TAHAP
   ============================================================ */

/*
 * Membuat mesin navigasi tahap yang dipakai bersama oleh setiap modul MPI.
 * opts:
 *   stages          array id tahap, urut (wajib)
 *   stageLabels     array label tahap, sejajar dengan `stages` (wajib)
 *   state           objek State milik modul (wajib, dimutasi langsung)
 *   save            function() — menyimpan State (wajib, mis. saveState)
 *   render          function() — merender tahap aktif (wajib, mis. renderCurrentStage)
 *   notice          function(msg) — menampilkan notifikasi (opsional, default showNotice)
 *   listId          id elemen <ol> daftar navigasi (opsional, default 'stageNavList')
 *   progressFillId  id elemen fill progress bar (opsional, default 'progressFill')
 *   progressLabelId id elemen label progress bar (opsional, default 'progressLabel')
 *
 * Mengembalikan { navigateTo, completeStage, updateStageNav, buildStageNav, updateProgress }.
 */
function createStageMachine(opts) {
  var stages = opts.stages;
  var stageLabels = opts.stageLabels;
  var state = opts.state;
  var save = opts.save;
  var render = opts.render;
  var notice = opts.notice || showNotice;
  var listId = opts.listId || 'stageNavList';
  var progressFillId = opts.progressFillId || 'progressFill';
  var progressLabelId = opts.progressLabelId || 'progressLabel';

  function navigateTo(stageId) {
    var targetIdx = stages.indexOf(stageId);
    var currentIdx = stages.indexOf(state.currentStage);
    if (targetIdx === -1) return;

    if (targetIdx > currentIdx) {
      for (var i = currentIdx; i < targetIdx; i++) {
        if (!state.completedStages[stages[i]]) {
          notice('Selesaikan tahap "' + stageLabels[i] + '" terlebih dahulu.');
          return;
        }
      }
    }

    state.currentStage = stageId;
    save();
    updateStageNav();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function completeStage(stageId) {
    state.completedStages[stageId] = true;
    save();
    updateStageNav();
    updateProgress();
  }

  function updateStageNav() {
    var items = document.querySelectorAll('.stage-nav__item[data-stage]');
    var currentIdx = stages.indexOf(state.currentStage);
    items.forEach(function (item) {
      var sid = item.dataset.stage;
      var idx = stages.indexOf(sid);
      item.removeAttribute('aria-current');
      item.classList.remove('is-complete');
      item.disabled = false;
      if (sid === state.currentStage) item.setAttribute('aria-current', 'step');
      else if (state.completedStages[sid]) item.classList.add('is-complete');
      if (idx > currentIdx && !state.completedStages[stages[idx - 1]]) item.disabled = true;
    });
  }

  function buildStageNav() {
    var list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = stages
      .map(function (sid, i) {
        return (
          '<li>' +
          '<button type="button" class="stage-nav__item" data-stage="' +
          sid +
          '">' +
          '<span class="stage-nav__num">' +
          (i + 1) +
          '</span>' +
          esc(stageLabels[i]) +
          '</button></li>'
        );
      })
      .join('');
    list.querySelectorAll('.stage-nav__item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        navigateTo(btn.dataset.stage);
      });
    });
    updateStageNav();
  }

  function updateProgress() {
    var total = stages.length;
    var done = Object.keys(state.completedStages).length;
    var pct = Math.round((done / total) * 100);
    var fill = document.getElementById(progressFillId);
    var label = document.getElementById(progressLabelId);
    if (fill) {
      fill.style.width = pct + '%';
      fill.parentElement.setAttribute('aria-valuenow', pct);
    }
    if (label) label.textContent = done + ' dari ' + total + ' tahap selesai';
  }

  return {
    navigateTo: navigateTo,
    completeStage: completeStage,
    updateStageNav: updateStageNav,
    buildStageNav: buildStageNav,
    updateProgress: updateProgress,
  };
}
