'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Bilangan Bulat pada Garis Bilangan — Fase D SMP

   Bagian:
    1. Utilitas
    2. Konstanta
    3. State & Storage
    4. Navigasi
    5. Utilitas Render
    6. Stage: Orientasi
    7. Stage: Kenali Bilangan Bulat
    8. Stage: Garis Bilangan
    9. Stage: Membandingkan
   10. Stage: Mengurutkan
   11. Stage: Situasi Nyata
   12. Stage: Refleksi
   13. Stage: Selesai
   14. Init
   ============================================================ */

/* ============================================================
   1. UTILITAS
   ============================================================ */

function parseInputInt(str) {
  if (!str || str.trim() === '') return { value: null, error: 'empty' };
  var trimmed = str.trim().replace(/\s/g, '');
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
   2. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'kenaliBulat',
  'garisBilangan',
  'membandingkan',
  'mengurutkan',
  'situasiNyata',
  'refleksi',
  'selesai',
];

var STAGE_LABELS = [
  'Orientasi',
  'Kenali',
  'Garis Bilangan',
  'Bandingkan',
  'Urutkan',
  'Situasi Nyata',
  'Refleksi',
  'Selesai',
];

var STORAGE_KEY = 'mpi-d-1-1-bilbulat-v1';

/* ============================================================
   3. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Kenali Bilangan Bulat */
  kenaliCtxIdx: 0,
  kenaliSeen: [],

  /* Garis Bilangan */
  garisBilanganIdx: 0,
  garisBilanganExercises: [],

  /* Membandingkan */
  membandingkanIdx: 0,
  membandingkanExercises: [],

  /* Mengurutkan */
  mengurutkanIdx: 0,
  mengurutkanExercises: [],

  /* Situasi Nyata */
  situasiNyataIdx: 0,
  situasiNyataExercises: [],

  /* Refleksi */
  refleksiAnswers: {},
  refleksiSaved: false,
};

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(State));
  } catch (e) {
    /* ignore */
  }
}

function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    Object.assign(State, JSON.parse(raw));
    return true;
  } catch (e) {
    return false;
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    /* ignore */
  }
  State.currentStage = 'orientasi';
  State.completedStages = {};
  State.kenaliCtxIdx = 0;
  State.kenaliSeen = [];
  State.garisBilanganIdx = 0;
  State.garisBilanganExercises = [];
  State.membandingkanIdx = 0;
  State.membandingkanExercises = [];
  State.mengurutkanIdx = 0;
  State.mengurutkanExercises = [];
  State.situasiNyataIdx = 0;
  State.situasiNyataExercises = [];
  State.refleksiAnswers = {};
  State.refleksiSaved = false;
  initExerciseArrays();
}

function initExerciseArrays() {
  if (!State.kenaliSeen || State.kenaliSeen.length !== DATA.kenaliBulat.konteks.length) {
    State.kenaliSeen = DATA.kenaliBulat.konteks.map(function () {
      return false;
    });
  }
  if (
    !State.garisBilanganExercises ||
    State.garisBilanganExercises.length !== DATA.garisBilangan.soal.length
  ) {
    State.garisBilanganExercises = DATA.garisBilangan.soal.map(function () {
      return {
        attempts: 0,
        hintShown: false,
        correct: false,
        userInput: '',
        revealed: false,
      };
    });
  }
  if (
    !State.membandingkanExercises ||
    State.membandingkanExercises.length !== DATA.membandingkan.soal.length
  ) {
    State.membandingkanExercises = DATA.membandingkan.soal.map(function () {
      return { attempts: 0, hintShown: false, correct: false, chosen: null };
    });
  }
  if (
    !State.mengurutkanExercises ||
    State.mengurutkanExercises.length !== DATA.mengurutkan.soal.length
  ) {
    State.mengurutkanExercises = DATA.mengurutkan.soal.map(function () {
      return { correct: false, order: [], revealed: false };
    });
  }
  if (
    !State.situasiNyataExercises ||
    State.situasiNyataExercises.length !== DATA.situasiNyata.soal.length
  ) {
    State.situasiNyataExercises = DATA.situasiNyata.soal.map(function () {
      return { attempts: 0, correct: false, chosen: null, checked: false };
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
    if (sid === State.currentStage) item.setAttribute('aria-current', 'step');
    else if (State.completedStages[sid]) item.classList.add('is-complete');
    if (idx > currentIdx && !State.completedStages[STAGES[idx - 1]]) item.disabled = true;
  });
}

function buildStageNav() {
  var list = document.getElementById('stageNavList');
  if (!list) return;
  list.innerHTML = STAGES.map(function (sid, i) {
    return (
      '<li>' +
      '<button type="button" class="stage-nav__item" data-stage="' +
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
  updateStageNav();
}

function updateProgress() {
  var total = STAGES.length;
  var done = Object.keys(State.completedStages).length;
  var pct = Math.round((done / total) * 100);
  var fill = document.getElementById('progressFill');
  var label = document.getElementById('progressLabel');
  if (fill) {
    fill.style.width = pct + '%';
    fill.parentElement.setAttribute('aria-valuenow', pct);
  }
  if (label) label.textContent = done + ' dari ' + total + ' tahap selesai';
}

/* ============================================================
   5. UTILITAS RENDER
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

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  container.innerHTML = '';
  updateProgress();
  switch (State.currentStage) {
    case 'orientasi':
      renderOrientasi(container);
      break;
    case 'kenaliBulat':
      renderKenaliBulat(container);
      break;
    case 'garisBilangan':
      renderGarisBilangan(container);
      break;
    case 'membandingkan':
      renderMembandingkan(container);
      break;
    case 'mengurutkan':
      renderMengurutkan(container);
      break;
    case 'situasiNyata':
      renderSituasiNyata(container);
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
    '<span class="stage-head__kicker">TAHAP 1 — MEMAHAMI KONTEKS</span>' +
    '<p class="stage-head__goal">Tujuan: ' +
    esc(DATA.meta.goal) +
    '</p>' +
    '</div>' +
    '<div class="panel panel--hero">' +
    '<h2>' +
    esc(DATA.meta.title) +
    '</h2>' +
    '<p style="font-size:1.05rem;"><strong>Dalam kehidupan sehari-hari,</strong> kita sering menemukan situasi yang membutuhkan bilangan di bawah nol — suhu dingin, lantai basement, atau saldo rekening yang minus. Bilangan-bilangan ini disebut <strong>bilangan bulat negatif</strong>.</p>' +
    '<div class="panel panel--info" style="margin-bottom:0;">' +
    '<h3 style="margin-bottom:var(--space-2);">Dalam media ini kamu akan:</h3>' +
    '<ol class="objectives-list">' +
    '<li><span class="objectives-list__num">1</span>Mengenal bilangan bulat (positif, nol, negatif) dari konteks nyata.</li>' +
    '<li><span class="objectives-list__num">2</span>Membaca dan menulis posisi bilangan bulat pada <strong>garis bilangan</strong>.</li>' +
    '<li><span class="objectives-list__num">3</span>Membandingkan dua bilangan bulat menggunakan notasi <strong>&lt;, &gt;, =</strong>.</li>' +
    '<li><span class="objectives-list__num">4</span>Mengurutkan sekelompok bilangan bulat dari terkecil ke terbesar.</li>' +
    '<li><span class="objectives-list__num">5</span>Menggunakan bilangan bulat untuk <strong>memodelkan situasi nyata</strong> (suhu, ketinggian, skor, keuangan).</li>' +
    '</ol></div></div>' +
    '<div class="panel panel--compact">' +
    '<h3>Bilangan Bulat di Sekitar Kita</h3>' +
    '<p>Pernahkah kamu memperhatikan bilangan-bilangan seperti ini?</p>' +
    '<ul>' +
    '<li>Suhu di puncak gunung yang bisa mencapai <strong>−5°C</strong></li>' +
    '<li>Tombol lift bertuliskan <strong>B2, B1, 0, 1, 2, 3</strong> untuk basement dan lantai</li>' +
    '<li>Skor permainan yang bisa bernilai <strong>negatif</strong> karena jawaban salah</li>' +
    '<li>Kedalaman kapal selam dinyatakan dengan bilangan <strong>negatif</strong> (misal: −50 m)</li>' +
    '</ul>' +
    '<p>Semua itu merupakan contoh penggunaan <strong>bilangan bulat</strong> dalam kehidupan nyata.</p>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>Cara Menggunakan Media Ini</h3>' +
    '<div class="hero-steps">' +
    '<div class="hero-steps__item"><span class="hero-steps__num">1</span>Kerjakan tahap dari kiri ke kanan. Setiap tahap harus diselesaikan sebelum lanjut.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">2</span>Setiap aktivitas memiliki tombol <strong>Periksa</strong>, <strong>Petunjuk</strong>, dan <strong>Coba Lagi</strong>.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">3</span>Baca umpan balik dengan teliti — penjelasannya akan membantumu memahami konsepnya.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">4</span>Progress tersimpan otomatis di browser ini.</div>' +
    '</div></div>' +
    '<div class="panel panel--compact panel--warning">' +
    '<p style="margin:0;font-size:0.88rem;color:var(--color-warning-strong);">' +
    '<strong>Catatan:</strong> Media ini adalah panduan belajar mandiri. Diskusi dan asesmen bersama guru tetap menjadi bagian utama dari proses belajarmu.' +
    '</p></div>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary btn--large" id="startBtn">Mulai Eksplorasi →</button>' +
    '</div></section>';

  document.getElementById('startBtn').addEventListener('click', function () {
    completeStage('orientasi');
    navigateTo('kenaliBulat');
  });
}

/* ============================================================
   7. STAGE: KENALI BILANGAN BULAT
   ============================================================ */

function renderKenaliBulat(container) {
  var ctxList = DATA.kenaliBulat.konteks;
  var idx = State.kenaliCtxIdx;
  var ctx = ctxList[idx];

  /* Mark current context as seen BEFORE computing allSeen */
  if (!State.kenaliSeen[idx]) {
    State.kenaliSeen[idx] = true;
    saveState();
  }

  var allSeen = State.kenaliSeen.filter(Boolean).length === ctxList.length;

  /* Tab navigation HTML */
  var tabsHTML = ctxList
    .map(function (c, i) {
      var active = i === idx ? ' aria-current="step"' : '';
      var done = State.kenaliSeen[i] ? ' is-complete' : '';
      var check = State.kenaliSeen[i] ? '&#10003; ' : '';
      return (
        '<button type="button" class="stage-nav__item' +
        done +
        '"' +
        active +
        ' data-ctx-idx="' +
        i +
        '">' +
        '<span class="stage-nav__num">' +
        (State.kenaliSeen[i] ? '&#10003;' : i + 1) +
        '</span>' +
        esc(c.badge) +
        '</button>'
      );
    })
    .join('');

  /* Items HTML */
  var itemsHTML = ctx.items
    .map(function (item) {
      var colorCls = 'int-item--' + item.color;
      return (
        '<div class="int-item ' +
        colorCls +
        '">' +
        '<div class="int-item__value">' +
        (item.value >= 0 ? (item.value === 0 ? '0' : '+' + item.value) : item.value) +
        '</div>' +
        '<div class="int-item__info">' +
        '<div class="int-item__label">' +
        esc(item.label) +
        '</div>' +
        '<div class="int-item__note">' +
        esc(item.note) +
        '</div>' +
        '</div>' +
        (ctx.unit ? '<div class="int-item__unit">' + esc(ctx.unit) + '</div>' : '') +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Kenali Bilangan Bulat">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 2 — EKSPLORASI</span>' +
    '<p class="stage-head__goal">Tujuan: Memahami makna bilangan bulat positif, nol, dan negatif melalui konteks kehidupan nyata.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">' +
    esc(DATA.kenaliBulat.instruction) +
    '</p>' +
    '<div class="ctx-tabs">' +
    tabsHTML +
    '</div>' +
    '<div class="panel panel--hero" style="margin-bottom:var(--space-3);">' +
    '<div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3);">' +
    '<span style="font-size:2rem;">' +
    ctx.icon +
    '</span>' +
    '<div>' +
    '<span class="badge-chip">' +
    esc(ctx.badge) +
    '</span>' +
    '<p style="margin:var(--space-1) 0 0;font-size:0.92rem;">' +
    esc(ctx.story) +
    '</p>' +
    '</div></div>' +
    '<div class="int-item-list">' +
    itemsHTML +
    '</div>' +
    '</div>' +
    '<div class="insight-box">' +
    '<span class="insight-box__icon">💡</span>' +
    '<div>' +
    esc(ctx.insight) +
    '</div>' +
    '</div>' +
    '</div>' +
    (allSeen
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="nextKenaliBtn">Lanjut: Garis Bilangan →</button>' +
        '</div>'
      : '<p style="text-align:center;font-size:0.85rem;color:var(--color-ink-muted);margin-top:var(--space-3);">Jelajahi semua ' +
        ctxList.length +
        ' konteks untuk melanjutkan.</p>') +
    '</section>';

  /* Tab click events */
  container.querySelectorAll('[data-ctx-idx]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.kenaliCtxIdx = parseInt(btn.dataset.ctxIdx, 10);
      saveState();
      renderKenaliBulat(container);
    });
  });

  var nextBtn = document.getElementById('nextKenaliBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      completeStage('kenaliBulat');
      navigateTo('garisBilangan');
    });
}

/* ============================================================
   8. STAGE: GARIS BILANGAN
   ============================================================ */

function renderGarisBilangan(container) {
  var soal = DATA.garisBilangan.soal;
  var idx = State.garisBilanganIdx;
  var exArr = State.garisBilanganExercises;
  var s = soal[idx];
  var ex = exArr[idx];
  var allDone =
    exArr.filter(function (e) {
      return e.correct;
    }).length === soal.length;

  var statuses = exArr.map(function (e) {
    return e.correct ? 'correct' : e.attempts > 0 ? 'incorrect' : null;
  });
  var dotsHTML = buildProgressDots(soal.length, idx, statuses);

  var svgHTML = buildNumberLineSVG(s.nilai, -10, 10);

  var feedbackHTML = '';
  if (ex.correct) {
    feedbackHTML = buildFeedbackBox('success', '✓', '<strong>Tepat!</strong> ' + s.explanation);
  } else if (ex.revealed) {
    feedbackHTML = buildFeedbackBox(
      'info',
      '👁',
      '<strong>Jawaban:</strong> ' + s.nilai + '. ' + s.explanation
    );
  } else if (ex.hintShown) {
    feedbackHTML = buildFeedbackBox('warning', '💡', '<strong>Petunjuk:</strong> ' + s.hint);
  } else if (ex.attempts > 0) {
    feedbackHTML = buildFeedbackBox(
      'error',
      '✗',
      'Jawabanmu <strong>' +
        esc(ex.userInput) +
        '</strong> belum tepat. Coba lagi atau lihat petunjuk.'
    );
  }

  var actionHTML = '';
  if (!ex.correct && !ex.revealed) {
    actionHTML =
      '<div class="gb-input-row">' +
      '<input type="text" inputmode="numeric" id="gbInput" class="input-text" placeholder="..." aria-label="Nilai bilangan pada titik merah" value="' +
      esc(ex.userInput) +
      '">' +
      '<button type="button" class="btn btn--primary" id="gbCheckBtn">Periksa</button>' +
      '<button type="button" class="btn btn--ghost btn--small" id="gbHintBtn">💡 Petunjuk</button>' +
      '</div>';
  } else if (!ex.correct && ex.revealed) {
    actionHTML = '';
  }

  var navHTML = '';
  if (ex.correct || ex.revealed) {
    if (idx < soal.length - 1) {
      navHTML =
        '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="gbNextBtn">Soal Berikutnya →</button></div>';
    } else if (
      allDone ||
      exArr.filter(function (e) {
        return e.correct || e.revealed;
      }).length === soal.length
    ) {
      navHTML =
        '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary btn--large" id="gbFinishBtn">Lanjut: Membandingkan →</button></div>';
    }
  }

  container.innerHTML =
    '<section aria-label="Garis Bilangan">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 3 — GARIS BILANGAN</span>' +
    '<p class="stage-head__goal">Tujuan: Membaca posisi bilangan bulat pada garis bilangan.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">' +
    esc(DATA.garisBilangan.instruction) +
    '</p>' +
    dotsHTML +
    '<div class="gb-exercise">' +
    '<p class="gb-question">Bilangan apakah yang ditunjukkan oleh titik merah pada garis bilangan di bawah ini?</p>' +
    '<div class="numberline-wrap">' +
    svgHTML +
    '</div>' +
    actionHTML +
    (feedbackHTML ? '<div style="margin-top:var(--space-3);">' + feedbackHTML + '</div>' : '') +
    '</div>' +
    '</div>' +
    navHTML +
    '</section>';

  /* Events */
  var inp = document.getElementById('gbInput');
  var checkBtn = document.getElementById('gbCheckBtn');
  var hintBtn = document.getElementById('gbHintBtn');
  var nextBtn = document.getElementById('gbNextBtn');
  var finishBtn = document.getElementById('gbFinishBtn');

  if (inp)
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && checkBtn) checkBtn.click();
    });

  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      if (!inp) return;
      var val = inp.value;
      var parsed = parseInputInt(val);
      if (parsed.error === 'empty') {
        showNotice('Masukkan bilangan terlebih dahulu.');
        return;
      }
      if (parsed.error === 'invalid') {
        showNotice('Masukkan bilangan bulat yang valid (contoh: −3, 0, 7).');
        return;
      }
      ex.userInput = val;
      ex.attempts += 1;
      if (parsed.value === s.nilai) {
        ex.correct = true;
        saveState();
        renderGarisBilangan(container);
      } else {
        saveState();
        renderGarisBilangan(container);
      }
    });

  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      if (ex.attempts === 0 || ex.hintShown) {
        ex.hintShown = true;
        saveState();
        renderGarisBilangan(container);
      } else {
        /* Show answer after 2+ wrong attempts */
        if (ex.attempts >= 2) {
          ex.revealed = true;
          saveState();
          renderGarisBilangan(container);
        } else {
          ex.hintShown = true;
          saveState();
          renderGarisBilangan(container);
        }
      }
    });

  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      State.garisBilanganIdx = idx + 1;
      saveState();
      renderGarisBilangan(container);
    });

  if (finishBtn)
    finishBtn.addEventListener('click', function () {
      completeStage('garisBilangan');
      navigateTo('membandingkan');
    });
}

/* ============================================================
   9. STAGE: MEMBANDINGKAN
   ============================================================ */

function renderMembandingkan(container) {
  var soal = DATA.membandingkan.soal;
  var idx = State.membandingkanIdx;
  var exArr = State.membandingkanExercises;
  var s = soal[idx];
  var ex = exArr[idx];
  var allAnswered =
    exArr.filter(function (e) {
      return e.correct || e.attempts >= 2;
    }).length === soal.length;

  var statuses = exArr.map(function (e) {
    return e.correct ? 'correct' : e.attempts > 0 ? 'incorrect' : null;
  });
  var dotsHTML = buildProgressDots(soal.length, idx, statuses);

  var aIsNeg = s.a < 0;
  var bIsNeg = s.b < 0;
  var aClass = 'compare-number' + (aIsNeg ? ' compare-number--negative' : '');
  var bClass = 'compare-number' + (bIsNeg ? ' compare-number--negative' : '');

  var symbolDisplay = ex.chosen || '?';
  var symbolCls = 'compare-symbol-display';
  if (ex.correct) symbolCls += ' compare-symbol-display--correct';
  else if (ex.attempts > 0 && !ex.correct && ex.chosen)
    symbolCls += ' compare-symbol-display--incorrect';

  var btnDisabled = ex.correct ? ' disabled' : '';

  var feedbackHTML = '';
  if (ex.correct) {
    feedbackHTML = buildFeedbackBox('success', '✓', '<strong>Benar!</strong> ' + s.explanation);
  } else if (ex.hintShown && ex.attempts > 0) {
    feedbackHTML = buildFeedbackBox('warning', '💡', '<strong>Petunjuk:</strong> ' + s.hint);
  } else if (!ex.correct && ex.attempts > 0) {
    feedbackHTML = buildFeedbackBox(
      'error',
      '✗',
      'Simbol <strong>' +
        esc(ex.chosen) +
        '</strong> belum tepat. Ingat: pada garis bilangan, bilangan di sebelah kiri selalu lebih kecil.'
    );
    if (ex.attempts >= 2) {
      feedbackHTML = buildFeedbackBox(
        'info',
        '👁',
        '<strong>Jawaban:</strong> ' + s.a + ' ' + s.answer + ' ' + s.b + '. ' + s.explanation
      );
    }
  }

  var navHTML = '';
  if (ex.correct || ex.attempts >= 2) {
    if (idx < soal.length - 1) {
      navHTML =
        '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="mbNextBtn">Soal Berikutnya →</button></div>';
    } else if (allAnswered) {
      navHTML =
        '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary btn--large" id="mbFinishBtn">Lanjut: Mengurutkan →</button></div>';
    }
  }

  container.innerHTML =
    '<section aria-label="Membandingkan Bilangan Bulat">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 4 — MEMBANDINGKAN</span>' +
    '<p class="stage-head__goal">Tujuan: Membandingkan dua bilangan bulat menggunakan notasi &lt;, =, atau &gt;.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">' +
    esc(DATA.membandingkan.instruction) +
    '</p>' +
    dotsHTML +
    '<div class="compare-card">' +
    '<div class="' +
    aClass +
    '">' +
    s.a +
    '</div>' +
    '<div class="compare-symbol-area">' +
    '<div class="' +
    symbolCls +
    '" aria-label="simbol perbandingan">' +
    esc(symbolDisplay) +
    '</div>' +
    '<div class="compare-btn-group">' +
    '<button type="button" class="compare-btn" id="btnLt"' +
    btnDisabled +
    ' aria-label="kurang dari">&lt;</button>' +
    '<button type="button" class="compare-btn" id="btnEq"' +
    btnDisabled +
    ' aria-label="sama dengan">=</button>' +
    '<button type="button" class="compare-btn" id="btnGt"' +
    btnDisabled +
    ' aria-label="lebih dari">&gt;</button>' +
    '</div>' +
    '</div>' +
    '<div class="' +
    bClass +
    '">' +
    s.b +
    '</div>' +
    '</div>' +
    (feedbackHTML ? '<div style="margin-top:var(--space-3);">' + feedbackHTML + '</div>' : '') +
    (!ex.correct && ex.attempts === 1
      ? '<div style="margin-top:var(--space-3);">' +
        '<button type="button" class="btn btn--ghost btn--small" id="mbHintBtn">💡 Lihat Petunjuk</button>' +
        '</div>'
      : '') +
    '</div>' +
    navHTML +
    '</section>';

  function handleChoice(sym) {
    if (ex.correct || ex.attempts >= 2) return;
    ex.chosen = sym;
    ex.attempts += 1;
    ex.correct = sym === s.answer;
    saveState();
    renderMembandingkan(container);
  }

  var btnLt = document.getElementById('btnLt');
  var btnEq = document.getElementById('btnEq');
  var btnGt = document.getElementById('btnGt');
  var hintBtn = document.getElementById('mbHintBtn');
  var nextBtn = document.getElementById('mbNextBtn');
  var finishBtn = document.getElementById('mbFinishBtn');

  if (btnLt)
    btnLt.addEventListener('click', function () {
      handleChoice('<');
    });
  if (btnEq)
    btnEq.addEventListener('click', function () {
      handleChoice('=');
    });
  if (btnGt)
    btnGt.addEventListener('click', function () {
      handleChoice('>');
    });

  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      ex.hintShown = true;
      saveState();
      renderMembandingkan(container);
    });

  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      State.membandingkanIdx = idx + 1;
      saveState();
      renderMembandingkan(container);
    });

  if (finishBtn)
    finishBtn.addEventListener('click', function () {
      completeStage('membandingkan');
      navigateTo('mengurutkan');
    });
}

/* ============================================================
   10. STAGE: MENGURUTKAN
   ============================================================ */

function renderMengurutkan(container) {
  var soal = DATA.mengurutkan.soal;
  var idx = State.mengurutkanIdx;
  var exArr = State.mengurutkanExercises;
  var s = soal[idx];
  var ex = exArr[idx];
  var allDone =
    exArr.filter(function (e) {
      return e.correct || e.revealed;
    }).length === soal.length;

  /* Dots */
  var statuses = exArr.map(function (e) {
    return e.correct ? 'correct' : e.revealed ? 'incorrect' : null;
  });
  var dotsHTML = buildProgressDots(soal.length, idx, statuses);

  /* Current order in answer slots */
  var currentOrder = ex.order || [];
  /* Remaining chips (not yet placed) */
  var remaining = s.acak.filter(function (v) {
    return currentOrder.indexOf(v) === -1;
  });

  /* Chips pool HTML */
  var poolHTML = s.acak
    .map(function (v) {
      var placed = currentOrder.indexOf(v) !== -1;
      var isNeg = v < 0;
      var chipCls =
        'sort-chip' +
        (isNeg ? ' sort-chip--negative' : '') +
        (placed ? ' sort-chip--selected' : '');
      return (
        '<button type="button" class="' +
        chipCls +
        '" data-chip-val="' +
        v +
        '"' +
        (placed || ex.correct || ex.revealed ? ' disabled' : '') +
        '>' +
        v +
        '</button>'
      );
    })
    .join('');

  /* Slots HTML */
  var slotsHTML = '';
  for (var i = 0; i < s.angka.length; i++) {
    var filled = i < currentOrder.length;
    var val = filled ? currentOrder[i] : null;
    var isNegSlot = val !== null && val < 0;
    var slotCls = 'sort-slot';
    if (filled)
      slotCls += isNegSlot ? ' sort-slot--filled sort-slot--filled-negative' : ' sort-slot--filled';
    slotsHTML +=
      '<div class="' +
      slotCls +
      '" data-slot-idx="' +
      i +
      '">' +
      '<span class="sort-slot__num">' +
      (i + 1) +
      '</span>' +
      (filled ? String(val) : '&nbsp;') +
      '</div>';
  }

  var feedbackHTML = '';
  if (ex.correct) {
    feedbackHTML = buildFeedbackBox(
      'success',
      '✓',
      '<strong>Urutan benar!</strong> ' + s.explanation
    );
  } else if (ex.revealed) {
    feedbackHTML = buildFeedbackBox(
      'info',
      '👁',
      '<strong>Urutan yang benar:</strong> ' + s.angka.join(', ') + '. ' + s.explanation
    );
  }

  var progressText =
    currentOrder.length === 0
      ? 'Klik angka di atas untuk menempatkannya dalam urutan.'
      : 'Sudah ' + currentOrder.length + ' dari ' + s.angka.length + ' angka ditempatkan.';

  var checkBtnHTML = '';
  if (!ex.correct && !ex.revealed && currentOrder.length === s.angka.length) {
    checkBtnHTML =
      '<button type="button" class="btn btn--primary" id="sortCheckBtn">Periksa Urutan</button>';
  }
  var resetBtnHTML = '';
  if (!ex.correct && !ex.revealed && currentOrder.length > 0) {
    resetBtnHTML =
      '<button type="button" class="btn btn--ghost btn--small" id="sortResetBtn">↺ Mulai Ulang</button>';
  }
  var revealBtnHTML = '';
  if (!ex.correct && !ex.revealed && ex.revealed === false) {
    revealBtnHTML =
      '<button type="button" class="btn btn--ghost btn--small" id="sortRevealBtn">👁 Lihat Jawaban</button>';
  }

  var navHTML = '';
  if (ex.correct || ex.revealed) {
    if (idx < soal.length - 1) {
      navHTML =
        '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="sortNextBtn">Soal Berikutnya →</button></div>';
    } else if (allDone) {
      navHTML =
        '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary btn--large" id="sortFinishBtn">Lanjut: Situasi Nyata →</button></div>';
    }
  }

  container.innerHTML =
    '<section aria-label="Mengurutkan Bilangan Bulat">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 5 — MENGURUTKAN</span>' +
    '<p class="stage-head__goal">Tujuan: Mengurutkan bilangan bulat dari yang terkecil ke terbesar.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">' +
    esc(DATA.mengurutkan.instruction) +
    '</p>' +
    dotsHTML +
    '<div class="panel panel--compact panel--hero" style="margin-bottom:var(--space-3);">' +
    '<span class="badge-chip">' +
    esc(s.badge) +
    '</span>' +
    '<p style="margin:var(--space-2) 0 0;font-size:0.92rem;">' +
    esc(s.story) +
    '</p>' +
    '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-3);">' +
    s.acak
      .map(function (v) {
        return (
          '<span style="font-family:var(--font-mono);font-size:1.05rem;font-weight:700;color:var(--color-primary-strong);">' +
          v +
          (s.unit ? ' ' + s.unit : '') +
          '</span>'
        );
      })
      .join('<span style="color:var(--color-ink-muted);padding:0 4px;">·</span>') +
    '</div></div>' +
    '<p style="font-size:0.85rem;font-weight:600;margin-bottom:var(--space-2);">Kumpulan angka (klik untuk memilih):</p>' +
    '<div class="sort-chips-pool" id="sortPool">' +
    poolHTML +
    '</div>' +
    '<p style="font-size:0.85rem;font-weight:600;margin-bottom:var(--space-2);">Urutan dari terkecil ke terbesar:</p>' +
    '<div class="sort-answer-slots" id="sortSlots">' +
    slotsHTML +
    '</div>' +
    '<p class="sort-progress-text">' +
    esc(progressText) +
    '</p>' +
    (feedbackHTML ? '<div style="margin-top:var(--space-3);">' + feedbackHTML + '</div>' : '') +
    '<div class="btn-group" style="margin-top:var(--space-3);">' +
    resetBtnHTML +
    revealBtnHTML +
    checkBtnHTML +
    '</div>' +
    '</div>' +
    navHTML +
    '</section>';

  /* Chip click events */
  container.querySelectorAll('[data-chip-val]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (ex.correct || ex.revealed) return;
      var v = parseInt(chip.dataset.chipVal, 10);
      if (ex.order.indexOf(v) !== -1) return;
      ex.order = ex.order.concat([v]);
      saveState();
      renderMengurutkan(container);
    });
  });

  /* Slot click to remove */
  container.querySelectorAll('[data-slot-idx]').forEach(function (slot) {
    slot.addEventListener('click', function () {
      if (ex.correct || ex.revealed) return;
      var slotIdx = parseInt(slot.dataset.slotIdx, 10);
      if (slotIdx >= ex.order.length) return;
      ex.order = ex.order.slice(0, slotIdx);
      saveState();
      renderMengurutkan(container);
    });
  });

  var checkBtn = document.getElementById('sortCheckBtn');
  var resetBtn = document.getElementById('sortResetBtn');
  var revealBtn = document.getElementById('sortRevealBtn');
  var nextBtn = document.getElementById('sortNextBtn');
  var finishBtn = document.getElementById('sortFinishBtn');

  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      var correct = true;
      for (var i = 0; i < s.angka.length; i++) {
        if (ex.order[i] !== s.angka[i]) {
          correct = false;
          break;
        }
      }
      ex.correct = correct;
      if (!correct) ex.revealed = false;
      saveState();
      if (!correct) {
        showNotice('Urutan belum tepat. Coba cek kembali atau lihat jawaban.');
        ex.order = [];
        saveState();
      }
      renderMengurutkan(container);
    });

  if (resetBtn)
    resetBtn.addEventListener('click', function () {
      ex.order = [];
      saveState();
      renderMengurutkan(container);
    });

  if (revealBtn)
    revealBtn.addEventListener('click', function () {
      ex.revealed = true;
      ex.order = s.angka.slice();
      saveState();
      renderMengurutkan(container);
    });

  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      State.mengurutkanIdx = idx + 1;
      saveState();
      renderMengurutkan(container);
    });

  if (finishBtn)
    finishBtn.addEventListener('click', function () {
      completeStage('mengurutkan');
      navigateTo('situasiNyata');
    });
}

/* ============================================================
   11. STAGE: SITUASI NYATA
   ============================================================ */

function renderSituasiNyata(container) {
  var soal = DATA.situasiNyata.soal;
  var idx = State.situasiNyataIdx;
  var exArr = State.situasiNyataExercises;
  var s = soal[idx];
  var ex = exArr[idx];
  var allAnswered =
    exArr.filter(function (e) {
      return e.correct || e.checked;
    }).length === soal.length;

  var statuses = exArr.map(function (e) {
    return e.correct ? 'correct' : e.checked ? 'incorrect' : null;
  });
  var dotsHTML = buildProgressDots(soal.length, idx, statuses);

  var letters = ['A', 'B', 'C', 'D'];
  var choicesHTML = s.options
    .map(function (opt, i) {
      var cls = 'choice-btn';
      if (ex.checked) {
        if (opt.id === s.correct) cls += ' choice-btn--correct';
        else if (opt.id === ex.chosen) cls += ' choice-btn--incorrect';
        else cls += ' choice-btn--disabled';
      }
      return (
        '<button type="button" class="' +
        cls +
        '" data-opt-id="' +
        opt.id +
        '">' +
        '<span class="choice-letter">' +
        letters[i] +
        '</span>' +
        opt.label +
        '</button>'
      );
    })
    .join('');

  var feedbackHTML = '';
  if (ex.correct) {
    feedbackHTML = buildFeedbackBox('success', '✓', '<strong>Benar!</strong> ' + s.explanation);
  } else if (ex.checked) {
    feedbackHTML = buildFeedbackBox('error', '✗', '<strong>Belum tepat.</strong> ' + s.explanation);
  }

  var hintHTML = '';
  if (!ex.checked && ex.attempts > 0) {
    hintHTML =
      '<div style="margin-top:var(--space-3);">' +
      buildFeedbackBox('warning', '💡', '<strong>Petunjuk:</strong> ' + s.hint) +
      '</div>';
  }

  var navHTML = '';
  if (ex.correct || ex.checked) {
    if (idx < soal.length - 1) {
      navHTML =
        '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="snNextBtn">Soal Berikutnya →</button></div>';
    } else if (allAnswered) {
      navHTML =
        '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary btn--large" id="snFinishBtn">Lanjut: Refleksi →</button></div>';
    }
  }

  container.innerHTML =
    '<section aria-label="Situasi Nyata">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 6 — SITUASI NYATA</span>' +
    '<p class="stage-head__goal">Tujuan: Menggunakan bilangan bulat untuk memodelkan dan menyelesaikan masalah dari situasi nyata.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">' +
    esc(DATA.situasiNyata.instruction) +
    '</p>' +
    dotsHTML +
    '<div class="panel panel--hero" style="margin-bottom:var(--space-3);">' +
    '<div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3);">' +
    '<span style="font-size:1.8rem;">' +
    s.icon +
    '</span>' +
    '<span class="badge-chip">' +
    esc(s.badge) +
    '</span>' +
    '</div>' +
    '<p style="font-size:0.95rem;">' +
    s.story +
    '</p>' +
    '<p style="font-weight:600;font-size:1rem;margin-bottom:0;">' +
    s.question +
    '</p>' +
    '</div>' +
    '<div class="choice-list" id="snChoices">' +
    choicesHTML +
    '</div>' +
    (feedbackHTML ? '<div style="margin-top:var(--space-3);">' + feedbackHTML + '</div>' : '') +
    hintHTML +
    '</div>' +
    navHTML +
    '</section>';

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (ex.checked) return;
      var optId = btn.dataset.optId;
      ex.chosen = optId;
      ex.attempts += 1;
      ex.correct = optId === s.correct;
      ex.checked = true;
      saveState();
      renderSituasiNyata(container);
    });
  });

  var nextBtn = document.getElementById('snNextBtn');
  var finishBtn = document.getElementById('snFinishBtn');

  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      State.situasiNyataIdx = idx + 1;
      saveState();
      renderSituasiNyata(container);
    });

  if (finishBtn)
    finishBtn.addEventListener('click', function () {
      completeStage('situasiNyata');
      navigateTo('refleksi');
    });
}

/* ============================================================
   12. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var soal = DATA.refleksi.soal;

  var fieldsHTML = soal
    .map(function (s, i) {
      var saved = State.refleksiAnswers[s.id] || '';
      return (
        '<div class="field-group">' +
        '<label for="refl_' +
        s.id +
        '">' +
        (i + 1) +
        '. ' +
        s.question +
        '</label>' +
        '<textarea id="refl_' +
        s.id +
        '" class="input-textarea" placeholder="' +
        esc(s.placeholder) +
        '" rows="3">' +
        esc(saved) +
        '</textarea>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Refleksi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 7 — REFLEKSI</span>' +
    '<p class="stage-head__goal">Tujuan: Merangkum dan mengkonsolidasikan pemahaman tentang bilangan bulat.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.9rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);">' +
    DATA.refleksi.note +
    '</p>' +
    fieldsHTML +
    (State.refleksiSaved
      ? buildFeedbackBox(
          'success',
          '✓',
          'Refleksimu sudah disimpan. Klik tombol di bawah untuk melanjutkan.'
        )
      : '') +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--ghost" id="saveReflBtn">Simpan Refleksi</button>' +
    '<button type="button" class="btn btn--primary btn--large" id="finishReflBtn"' +
    (State.refleksiSaved ? '' : ' disabled') +
    '>Selesai ✓</button>' +
    '</div></div></section>';

  var saveBtn = document.getElementById('saveReflBtn');
  var finishBtn = document.getElementById('finishReflBtn');

  if (saveBtn)
    saveBtn.addEventListener('click', function () {
      soal.forEach(function (s) {
        var el = document.getElementById('refl_' + s.id);
        if (el) State.refleksiAnswers[s.id] = el.value;
      });
      State.refleksiSaved = true;
      saveState();
      renderRefleksi(container);
      showNotice('Refleksi tersimpan!');
    });

  if (finishBtn)
    finishBtn.addEventListener('click', function () {
      completeStage('refleksi');
      navigateTo('selesai');
    });
}

/* ============================================================
   13. STAGE: SELESAI
   ============================================================ */

function renderSelesai(container) {
  var gbDone = State.garisBilanganExercises.filter(function (e) {
    return e.correct;
  }).length;
  var gbTotal = DATA.garisBilangan.soal.length;
  var mbDone = State.membandingkanExercises.filter(function (e) {
    return e.correct;
  }).length;
  var mbTotal = DATA.membandingkan.soal.length;
  var urtDone = State.mengurutkanExercises.filter(function (e) {
    return e.correct;
  }).length;
  var urtTotal = DATA.mengurutkan.soal.length;
  var snDone = State.situasiNyataExercises.filter(function (e) {
    return e.correct;
  }).length;
  var snTotal = DATA.situasiNyata.soal.length;

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 8 — SELESAI 🎉</span>' +
    '</div>' +
    '<div class="panel panel--hero">' +
    '<h2>Kamu telah menyelesaikan pembelajaran Bilangan Bulat!</h2>' +
    '<p>Luar biasa! Kamu telah menjelajahi bilangan bulat dari berbagai sudut pandang — mulai dari konteks nyata, garis bilangan, perbandingan, pengurutan, hingga pemodelan situasi.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>Ringkasan Pencapaianmu</h3>' +
    '<div class="achievement-grid">' +
    '<div class="achievement-card"><div class="achievement-card__icon">📖</div><div class="achievement-card__title">Kenali Bilangan Bulat</div><div class="achievement-card__desc">3 konteks dijelajahi</div></div>' +
    '<div class="achievement-card"><div class="achievement-card__icon">📏</div><div class="achievement-card__title">Garis Bilangan</div><div class="achievement-card__desc">' +
    gbDone +
    '/' +
    gbTotal +
    ' soal benar</div></div>' +
    '<div class="achievement-card"><div class="achievement-card__icon">⚖️</div><div class="achievement-card__title">Membandingkan</div><div class="achievement-card__desc">' +
    mbDone +
    '/' +
    mbTotal +
    ' soal benar</div></div>' +
    '<div class="achievement-card"><div class="achievement-card__icon">🔢</div><div class="achievement-card__title">Mengurutkan</div><div class="achievement-card__desc">' +
    urtDone +
    '/' +
    urtTotal +
    ' soal benar</div></div>' +
    '<div class="achievement-card"><div class="achievement-card__icon">🌍</div><div class="achievement-card__title">Situasi Nyata</div><div class="achievement-card__desc">' +
    snDone +
    '/' +
    snTotal +
    ' soal benar</div></div>' +
    '</div></div>' +
    '<div class="panel panel--compact">' +
    '<h3>Yang Sudah Kamu Pelajari</h3>' +
    '<ul>' +
    '<li>Bilangan bulat terdiri dari bilangan <strong>negatif</strong> (…, −3, −2, −1), <strong>nol</strong> (0), dan bilangan <strong>positif</strong> (1, 2, 3, …).</li>' +
    '<li>Pada <strong>garis bilangan</strong>, bilangan yang lebih ke kiri selalu bernilai lebih kecil.</li>' +
    '<li>Untuk membandingkan dua bilangan, gunakan tanda <strong>&lt;</strong> (kurang dari), <strong>=</strong> (sama dengan), atau <strong>&gt;</strong> (lebih dari).</li>' +
    '<li>Bilangan negatif yang <em>angkanya lebih besar</em> justru <em>nilainya lebih kecil</em>. Contoh: −10 &lt; −2.</li>' +
    '<li>Bilangan bulat dapat digunakan untuk memodelkan situasi nyata seperti suhu, ketinggian, skor, dan saldo rekening.</li>' +
    '</ul></div>' +
    '<div class="btn-group btn-group--center">' +
    '<button type="button" class="btn btn--ghost" id="restartBtn">↺ Mulai Ulang</button>' +
    '<a href="../../index.html" class="btn btn--primary">← Kembali ke Beranda</a>' +
    '</div></section>';

  completeStage('selesai');

  var restartBtn = document.getElementById('restartBtn');
  if (restartBtn)
    restartBtn.addEventListener('click', function () {
      if (confirm('Apakah kamu yakin ingin mengulang dari awal? Semua progress akan dihapus.')) {
        clearState();
        navigateTo('orientasi');
      }
    });
}

/* ============================================================
   14. NOTICE (TOAST)
   ============================================================ */

var noticeTimer = null;

function showNotice(msg) {
  var el = document.getElementById('appNotice');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('app-notice--visible');
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(function () {
    el.classList.remove('app-notice--visible');
  }, 3000);
}

/* ============================================================
   15. INIT
   ============================================================ */

function init() {
  loadState();
  initExerciseArrays();
  buildStageNav();
  renderCurrentStage();
  updateProgress();

  var resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn)
    resetBtn.addEventListener('click', function () {
      if (confirm('Reset semua progress? Tindakan ini tidak dapat dibatalkan.')) {
        clearState();
        navigateTo('orientasi');
        showNotice('Progress telah direset.');
      }
    });
}

document.addEventListener('DOMContentLoaded', init);
