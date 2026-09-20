'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Bunga Tunggal dan Bunga Majemuk — Fase F SMK RPL

   Utilitas bersama (esc, parseInputInt, showNotice, buildFeedbackBox,
   mesin navigasi tahap) berada di shared/engine.js.

   Bagian:
    1. Utilitas
    2. Konstanta
    3. State & Storage
    4. Navigasi
    5. Utilitas Render
    6. Stage: Orientasi
    7. Stage: Eksplorasi Bunga Tunggal
    8. Stage: Rumus Bunga Tunggal
    9. Stage: Eksplorasi Bunga Majemuk
   10. Stage: Rumus Bunga Majemuk
   11. Stage: Perbandingan Interaktif
   12. Stage: Latihan Campuran
   13. Stage: Refleksi
   14. Stage: Selesai
   15. Init
   ============================================================ */

/* ============================================================
   1. UTILITAS
   ============================================================ */

function formatRp(n) {
  var str = String(Math.round(n));
  var sign = '';
  if (str.startsWith('-')) {
    sign = '-';
    str = str.slice(1);
  }
  var parts = [];
  while (str.length > 3) {
    parts.unshift(str.slice(str.length - 3));
    str = str.slice(0, str.length - 3);
  }
  if (str) parts.unshift(str);
  return sign + parts.join('.');
}

/* ============================================================
   2. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'eksplorasiBT',
  'rumusBT',
  'eksplorasiBM',
  'rumusBM',
  'perbandingan',
  'latihan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Orientasi',
  'Pola BT',
  'Rumus BT',
  'Pola BM',
  'Rumus BM',
  'Perbandingan',
  'Latihan',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-1-3-bunga-v1';

/* ============================================================
   3. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Eksplorasi Bunga Tunggal */
  btCtxIdx: 0,
  btRevealCount: [0, 0],
  btInputA: [null, null],
  btInputB: [null, null],
  btDone: [false, false],

  /* Rumus Bunga Tunggal */
  rumusBTStep: 0,
  rumusBTStepInputs: ['', ''],
  rumusBTStepDone: [false, false],
  rumusBTFormulaShown: false,

  /* Eksplorasi Bunga Majemuk */
  bmCtxIdx: 0,
  bmRevealCount: [0, 0],
  bmInputA: [null, null],
  bmInputR: [null, null],
  bmDone: [false, false],

  /* Rumus Bunga Majemuk */
  rumusBMStep: 0,
  rumusBMStepInputs: ['', ''],
  rumusBMStepDone: [false, false],
  rumusBMFormulaShown: false,

  /* Perbandingan */
  calcM0: '',
  calcI: '',
  calcN: '',
  calcDone: false,

  /* Latihan */
  latihanIdx: 0,
  latihanExercises: [],

  /* Refleksi */
  refleksiAnswers: {},
  refleksiSaved: false,
};

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(State));
  } catch (e) {
    /* abaikan */
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
    /* abaikan */
  }
  State.currentStage = 'orientasi';
  State.completedStages = {};
  State.btCtxIdx = 0;
  State.btRevealCount = [0, 0];
  State.btInputA = [null, null];
  State.btInputB = [null, null];
  State.btDone = [false, false];
  State.rumusBTStep = 0;
  State.rumusBTStepInputs = ['', ''];
  State.rumusBTStepDone = [false, false];
  State.rumusBTFormulaShown = false;
  State.bmCtxIdx = 0;
  State.bmRevealCount = [0, 0];
  State.bmInputA = [null, null];
  State.bmInputR = [null, null];
  State.bmDone = [false, false];
  State.rumusBMStep = 0;
  State.rumusBMStepInputs = ['', ''];
  State.rumusBMStepDone = [false, false];
  State.rumusBMFormulaShown = false;
  State.calcM0 = '';
  State.calcI = '';
  State.calcN = '';
  State.calcDone = false;
  State.latihanIdx = 0;
  State.latihanExercises = [];
  State.refleksiAnswers = {};
  State.refleksiSaved = false;
  initExerciseArrays();
}

function initExerciseArrays() {
  var n = DATA.latihan.soal.length;
  if (!State.latihanExercises || State.latihanExercises.length !== n) {
    State.latihanExercises = DATA.latihan.soal.map(function (s) {
      return {
        attempts: 0,
        hintLevel: 0,
        correct: false,
        userInput: '',
        chosen: null,
        checked: false,
        revealed: false,
      };
    });
  }
  if (!State.btRevealCount || State.btRevealCount.length !== DATA.eksplorasiBT.konteks.length) {
    State.btRevealCount = DATA.eksplorasiBT.konteks.map(function () {
      return 0;
    });
  }
  if (!State.btDone || State.btDone.length !== DATA.eksplorasiBT.konteks.length) {
    State.btDone = DATA.eksplorasiBT.konteks.map(function () {
      return false;
    });
  }
  if (!State.bmRevealCount || State.bmRevealCount.length !== DATA.eksplorasiBM.konteks.length) {
    State.bmRevealCount = DATA.eksplorasiBM.konteks.map(function () {
      return 0;
    });
  }
  if (!State.bmDone || State.bmDone.length !== DATA.eksplorasiBM.konteks.length) {
    State.bmDone = DATA.eksplorasiBM.konteks.map(function () {
      return false;
    });
  }
  if (!State.rumusBTStepInputs || State.rumusBTStepInputs.length !== DATA.rumusBT.steps.length) {
    State.rumusBTStepInputs = DATA.rumusBT.steps.map(function () {
      return '';
    });
  }
  if (!State.rumusBTStepDone || State.rumusBTStepDone.length !== DATA.rumusBT.steps.length) {
    State.rumusBTStepDone = DATA.rumusBT.steps.map(function () {
      return false;
    });
  }
  if (!State.rumusBMStepInputs || State.rumusBMStepInputs.length !== DATA.rumusBM.steps.length) {
    State.rumusBMStepInputs = DATA.rumusBM.steps.map(function () {
      return '';
    });
  }
  if (!State.rumusBMStepDone || State.rumusBMStepDone.length !== DATA.rumusBM.steps.length) {
    State.rumusBMStepDone = DATA.rumusBM.steps.map(function () {
      return false;
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

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  container.innerHTML = '';
  updateProgress();
  switch (State.currentStage) {
    case 'orientasi':
      renderOrientasi(container);
      break;
    case 'eksplorasiBT':
      renderEksplorasiBT(container);
      break;
    case 'rumusBT':
      renderRumusBT(container);
      break;
    case 'eksplorasiBM':
      renderEksplorasiBM(container);
      break;
    case 'rumusBM':
      renderRumusBM(container);
      break;
    case 'perbandingan':
      renderPerbandingan(container);
      break;
    case 'latihan':
      renderLatihan(container);
      break;
    case 'refleksi':
      renderRefleksi(container);
      break;
    case 'selesai':
      renderSelesai(container);
      break;
    default:
      container.innerHTML = '<p style="padding:var(--space-5);">Tahap tidak ditemukan.</p>';
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
    '<p class="stage-head__goal">Tujuan: Mempersiapkan diri untuk menjelajahi konsep bunga tunggal dan bunga majemuk.</p>' +
    '</div>' +
    '<div class="panel panel--hero">' +
    '<h2>' +
    esc(DATA.meta.title) +
    '</h2>' +
    '<p style="font-size:1.05rem;"><strong>Tujuan Pembelajaran:</strong><br>' +
    DATA.meta.goal +
    '</p>' +
    '<div class="panel panel--info" style="margin-bottom:0;">' +
    '<h3 style="margin-bottom:var(--space-2);">Dalam media ini kamu akan:</h3>' +
    '<ol class="objectives-list">' +
    '<li><span class="objectives-list__num">1</span>Mengamati pola pertumbuhan uang dengan bunga tunggal dan menemukan hubungannya dengan <strong>barisan aritmetika</strong>.</li>' +
    '<li><span class="objectives-list__num">2</span>Menemukan sendiri rumus bunga tunggal: <strong>Mₙ = M₀(1 + n·i)</strong>.</li>' +
    '<li><span class="objectives-list__num">3</span>Mengamati pola pertumbuhan uang dengan bunga majemuk dan menemukan hubungannya dengan <strong>barisan geometri</strong>.</li>' +
    '<li><span class="objectives-list__num">4</span>Menemukan sendiri rumus bunga majemuk: <strong>Mₙ = M₀ × (1+i)ⁿ</strong>.</li>' +
    '<li><span class="objectives-list__num">5</span>Membandingkan dan membedakan karakteristik kedua jenis bunga secara interaktif.</li>' +
    '</ol>' +
    '</div></div>' +
    '<div class="panel panel--compact">' +
    '<h3>Bunga dalam Dunia Fintech & RPL</h3>' +
    '<p>Sebagai calon developer RPL, kamu akan sering membangun aplikasi yang melibatkan perhitungan bunga:</p>' +
    '<ul>' +
    '<li><strong>Dompet digital</strong> — menghitung imbal hasil tabungan pengguna</li>' +
    '<li><strong>Aplikasi pinjaman online</strong> — menentukan cicilan dan total hutang</li>' +
    '<li><strong>Platform investasi</strong> — memprediksi pertumbuhan portofolio</li>' +
    '<li><strong>Kalkulator KPR/KUR</strong> — membantu UMKM merencanakan pinjaman</li>' +
    '</ul>' +
    '<p>Memahami perbedaan bunga tunggal dan majemuk adalah dasar penting untuk membangun fitur-fitur tersebut!</p>' +
    '</div>' +
    '<div class="compare-grid">' +
    '<div class="compare-card compare-card--bt">' +
    '<span class="compare-card__badge">Bunga Tunggal</span>' +
    '<div class="compare-card__title">📐 Linear — Barisan Aritmetika</div>' +
    '<div class="compare-card__formula">Mₙ = M₀(1 + n·i)</div>' +
    '<p class="compare-card__desc">Bunga dihitung dari <em>modal awal</em> setiap periode. Kenaikan selalu sama → beda konstan.</p>' +
    '</div>' +
    '<div class="compare-card compare-card--bm">' +
    '<span class="compare-card__badge">Bunga Majemuk</span>' +
    '<div class="compare-card__title">📈 Eksponensial — Barisan Geometri</div>' +
    '<div class="compare-card__formula">Mₙ = M₀ × (1+i)ⁿ</div>' +
    '<p class="compare-card__desc">Bunga dihitung dari <em>saldo terkini</em> setiap periode. Kenaikan semakin besar → rasio konstan.</p>' +
    '</div>' +
    '</div>' +
    '<div class="panel panel--compact panel--warning">' +
    '<p style="margin:0;font-size:0.88rem;color:var(--color-warning-strong);">' +
    '<strong>Catatan:</strong> Media ini adalah panduan belajar mandiri. Diskusi dan asesmen oleh guru tetap menjadi bagian utama penilaian.' +
    '</p></div>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary btn--large" id="startBtn">Mulai Eksplorasi →</button>' +
    '</div></section>';

  document.getElementById('startBtn').addEventListener('click', function () {
    completeStage('orientasi');
    navigateTo('eksplorasiBT');
  });
}

/* ============================================================
   7. STAGE: EKSPLORASI BUNGA TUNGGAL
   ============================================================ */

function buildBTSeqHTML(ctx, revealCount) {
  var html = '';
  for (var i = 0; i < ctx.terms.length; i++) {
    var revealed = i === 0 || i < revealCount + 1;
    var valCls = 'seq-term__val';
    if (!revealed) valCls += ' seq-term__val--hidden';
    else if (i === revealCount && i > 0) valCls += ' seq-term__val--revealed';
    html +=
      '<div class="seq-term">' +
      '<div class="' +
      valCls +
      '">' +
      (revealed ? formatRp(ctx.terms[i]) : '?') +
      '</div>' +
      '<div class="seq-term__label">' +
      esc(ctx.labels[i]) +
      '</div>' +
      '</div>';
    if (i < ctx.terms.length - 1) {
      var nextRevealed = i + 1 === 0 || i + 1 < revealCount + 1;
      if (revealed && nextRevealed) {
        var diff = ctx.terms[i + 1] - ctx.terms[i];
        html += '<div class="seq-beda-badge">+' + formatRp(diff) + '</div>';
      } else {
        html += '<div class="seq-arrow">→</div>';
      }
    }
  }
  return html;
}

function buildBTCtxTabs(ctxList, idx) {
  return ctxList
    .map(function (c, i) {
      var active = i === idx ? ' aria-current="step"' : '';
      var done = State.btDone[i] ? ' is-complete' : '';
      var num = State.btDone[i] ? '&#10003;' : i + 1;
      return (
        '<button type="button" class="stage-nav__item' +
        done +
        '"' +
        active +
        ' data-ctx="' +
        i +
        '">' +
        '<span class="stage-nav__num">' +
        num +
        '</span>' +
        esc(c.badge) +
        '</button>'
      );
    })
    .join('');
}

function buildBTIdentifyPanel(ctx, revealCount, isDone, idx) {
  if (isDone) {
    return (
      '<div class="panel panel--compact" style="margin-top:var(--space-4);">' +
      buildFeedbackBox(
        'success',
        '✓',
        '<strong>Barisan aritmetika teridentifikasi!</strong><br>' +
          'Modal awal <strong>a = ' +
          formatRp(ctx.a) +
          '</strong> rupiah, ' +
          'kenaikan tetap <strong>b = ' +
          formatRp(ctx.b) +
          '</strong> rupiah/tahun.<br>' +
          '<em>Ini adalah pola BUNGA TUNGGAL: bunga selalu dihitung dari modal awal → beda konstan.</em>'
      ) +
      '</div>'
    );
  }
  if (revealCount >= 2) {
    return (
      '<div class="panel panel--compact identify-input-panel" style="margin-top:var(--space-4);">' +
      '<h4>Identifikasi Pola Bunga Tunggal</h4>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-bottom:var(--space-3);">' +
      '<div class="field-group" style="margin:0;">' +
      '<label for="btInputA">Modal awal / suku pertama (a) =</label>' +
      '<input type="text" inputmode="numeric" id="btInputA" class="input-text" placeholder="..." aria-describedby="btErrA">' +
      '<div class="field-error" id="btErrA"></div>' +
      '</div>' +
      '<div class="field-group" style="margin:0;">' +
      '<label for="btInputB">Kenaikan tetap / beda (b) =</label>' +
      '<input type="text" inputmode="numeric" id="btInputB" class="input-text" placeholder="..." aria-describedby="btErrB">' +
      '<div class="field-error" id="btErrB"></div>' +
      '</div>' +
      '</div>' +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn--ghost btn--small" id="btHintBtn">💡 Petunjuk</button>' +
      '<button type="button" class="btn btn--primary" id="btCheckBtn">Periksa</button>' +
      '</div>' +
      '<div id="btFeedback" style="margin-top:var(--space-3);"></div>' +
      '</div>'
    );
  }
  return '';
}

function renderEksplorasiBT(container) {
  var ctxList = DATA.eksplorasiBT.konteks;
  var idx = State.btCtxIdx;
  var ctx = ctxList[idx];
  var revealCount = State.btRevealCount[idx] || 0;
  var isDone = State.btDone[idx] || false;
  var allDone = State.btDone.filter(Boolean).length === ctxList.length;
  var maxReveal = ctx.terms.length - 1;

  container.innerHTML =
    '<section aria-label="Eksplorasi Bunga Tunggal">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 2 — EKSPLORASI POLA BUNGA TUNGGAL</span>' +
    '<p class="stage-head__goal">Tujuan: Mengamati pola kenaikan nilai uang dengan bunga tunggal dan mengidentifikasinya sebagai barisan aritmetika.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">' +
    esc(DATA.eksplorasiBT.instruction) +
    '</p>' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-4);">' +
    buildBTCtxTabs(ctxList, idx) +
    '</div>' +
    '<div class="panel panel--hero" style="margin-bottom:var(--space-3);">' +
    '<div style="display:flex;align-items:flex-start;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3);">' +
    '<span style="font-size:1.8rem;">' +
    ctx.icon +
    '</span>' +
    '<div>' +
    '<span class="badge-chip">' +
    esc(ctx.badge) +
    '</span>' +
    '<p style="margin:var(--space-1) 0 0;font-size:0.92rem;">' +
    ctx.story +
    '</p>' +
    '</div></div>' +
    '<div class="seq-display" id="btSeqDisplay">' +
    buildBTSeqHTML(ctx, revealCount) +
    '</div>' +
    (revealCount < maxReveal
      ? '<div style="text-align:center;margin-top:var(--space-3);">' +
        '<button type="button" class="seq-reveal-btn" id="btRevealBtn">▶ Tampilkan Tahun Berikutnya</button>' +
        '</div>'
      : '') +
    '</div>' +
    buildBTIdentifyPanel(ctx, revealCount, isDone, idx) +
    '</div>' +
    (allDone
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="nextBTBtn">Lanjut: Rumus Bunga Tunggal →</button>' +
        '</div>'
      : '') +
    '</section>';

  container.querySelectorAll('[data-ctx]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.btCtxIdx = parseInt(btn.dataset.ctx, 10);
      saveState();
      renderEksplorasiBT(container);
    });
  });

  var revBtn = document.getElementById('btRevealBtn');
  if (revBtn)
    revBtn.addEventListener('click', function () {
      if (State.btRevealCount[idx] < maxReveal) {
        State.btRevealCount[idx] += 1;
        saveState();
        renderEksplorasiBT(container);
      }
    });

  var hintBtn = document.getElementById('btHintBtn');
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      var fb = document.getElementById('btFeedback');
      if (fb)
        fb.innerHTML = buildFeedbackBox(
          'warning',
          '💡',
          '<strong>Petunjuk a:</strong> ' +
            ctx.hint_a +
            '<br>' +
            '<strong>Petunjuk b:</strong> ' +
            ctx.hint_b
        );
    });

  var checkBtn = document.getElementById('btCheckBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      checkBTAnswer(container, idx);
    });

  var nextBtn = document.getElementById('nextBTBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      completeStage('eksplorasiBT');
      navigateTo('rumusBT');
    });
}

function checkBTAnswer(container, idx) {
  var ctx = DATA.eksplorasiBT.konteks[idx];
  var fb = document.getElementById('btFeedback');
  var inpA = document.getElementById('btInputA');
  var inpB = document.getElementById('btInputB');
  var errA = document.getElementById('btErrA');
  var errB = document.getElementById('btErrB');
  errA.textContent = '';
  errB.textContent = '';
  var pA = parseInputInt(inpA ? inpA.value : '', true);
  var pB = parseInputInt(inpB ? inpB.value : '', true);
  if (pA.error === 'empty') {
    errA.textContent = 'Isi nilai a.';
    return;
  }
  if (pA.error === 'invalid') {
    errA.textContent = 'Masukkan bilangan bulat.';
    return;
  }
  if (pB.error === 'empty') {
    errB.textContent = 'Isi nilai b.';
    return;
  }
  if (pB.error === 'invalid') {
    errB.textContent = 'Masukkan bilangan bulat.';
    return;
  }

  if (pA.value === ctx.a && pB.value === ctx.b) {
    State.btDone[idx] = true;
    var nextPending = -1;
    for (var i = 0; i < State.btDone.length; i++) {
      if (!State.btDone[i]) {
        nextPending = i;
        break;
      }
    }
    State.btCtxIdx = nextPending !== -1 ? nextPending : idx;
    saveState();
    renderEksplorasiBT(container);
    if (nextPending !== -1) showNotice('Benar! Lanjut ke konteks berikutnya.');
  } else {
    var msg =
      !(pA.value === ctx.a) && !(pB.value === ctx.b)
        ? 'Kedua nilai kurang tepat.'
        : pA.value !== ctx.a
          ? 'Nilai a kurang tepat. Perhatikan nilai awal (suku pertama).'
          : 'Nilai b kurang tepat. Periksa selisih antar suku berurutan.';
    if (fb) fb.innerHTML = buildFeedbackBox('error', '✗', msg);
  }
}

/* ============================================================
   8. STAGE: RUMUS BUNGA TUNGGAL
   ============================================================ */

function renderRumusBT(container) {
  var data = DATA.rumusBT;
  var step = State.rumusBTStep;

  var tableRows = data.tableRows
    .map(function (row) {
      var nCell = '<td class="cell-highlight">' + esc(String(row.n)) + '</td>';
      var bentukCell = '<td>' + esc(row.bentuk) + '</td>';
      var expandedCell = '<td>' + esc(row.expanded) + '</td>';
      var mnCell =
        row.Mn !== null
          ? '<td class="cell-highlight">' + formatRp(row.Mn) + '</td>'
          : '<td style="font-style:italic;color:var(--color-primary);">Mₙ</td>';
      return '<tr>' + nCell + bentukCell + expandedCell + mnCell + '</tr>';
    })
    .join('');

  var koneksi = data.koneksiArtimatika;
  var koneksiHTML = State.rumusBTFormulaShown
    ? '<div class="panel panel--compact" style="margin-top:var(--space-4);border-left:4px solid var(--color-blue);">' +
      '<h4 style="color:var(--color-blue-strong);">🔗 Koneksi dengan Barisan Aritmetika</h4>' +
      '<p>' +
      koneksi.penjelasan +
      '</p>' +
      '<ul>' +
      koneksi.poin
        .map(function (p) {
          return '<li>' + p + '</li>';
        })
        .join('') +
      '</ul>' +
      '</div>'
    : '';

  var formulaHTML = State.rumusBTFormulaShown
    ? '<div class="formula-box formula-box--bt formula-box--reveal">' +
      '<div class="formula-box__label">Rumus Bunga Tunggal</div>' +
      '<div class="formula-box__expr formula-box__expr--large">Mₙ = M₀(1 + n·i)</div>' +
      '<div class="formula-box__note">M₀ = modal awal &nbsp;·&nbsp; n = jumlah periode &nbsp;·&nbsp; i = suku bunga per periode<br>' +
      'Setara: <strong>a = M₀</strong>, <strong>b = M₀·i</strong> dalam barisan aritmetika Uₙ = a + n·b</div>' +
      '</div>'
    : '';

  var stepHTML = '';
  if (!State.rumusBTFormulaShown) {
    var s = data.steps[step];
    var ex = State.rumusBTStepDone[step];
    var inputVal = State.rumusBTStepInputs[step] || '';
    stepHTML =
      '<div class="panel panel--compact" id="btStepPanel">' +
      '<span class="stage-head__kicker" style="margin-bottom:var(--space-2);">LANGKAH ' +
      (step + 1) +
      ' dari ' +
      data.steps.length +
      '</span>' +
      '<p style="font-size:0.95rem;margin-bottom:var(--space-3);">' +
      s.question +
      '</p>' +
      (!ex
        ? '<div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;">' +
          '<input type="text" inputmode="numeric" id="btStepInput" class="input-text" value="' +
          esc(inputVal) +
          '" placeholder="..." style="max-width:160px;text-align:center;font-family:var(--font-mono);font-size:1.05rem;">' +
          '<button type="button" class="btn btn--primary" id="btCheckStepBtn">Periksa</button>' +
          '<button type="button" class="btn btn--ghost btn--small" id="btHintStepBtn">💡 Petunjuk</button>' +
          '</div>' +
          '<div id="btStepFeedback" style="margin-top:var(--space-3);"></div>'
        : buildFeedbackBox('success', '✓', '<strong>Benar!</strong> ' + s.explanation)) +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="Rumus Bunga Tunggal">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 3 — RUMUS BUNGA TUNGGAL</span>' +
    '<p class="stage-head__goal">Tujuan: Menemukan rumus Mₙ = M₀(1 + n·i) dan menghubungkannya dengan barisan aritmetika.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>' +
    esc(data.title) +
    '</h3>' +
    '<p style="font-size:0.88rem;background:var(--color-blue-soft);border-left:3px solid var(--color-blue);padding:var(--space-2) var(--space-3);border-radius:0 var(--radius-sm) var(--radius-sm) 0;color:var(--color-blue-strong);">' +
    esc(data.konteks) +
    '</p>' +
    '<div style="overflow-x:auto;">' +
    '<table class="pattern-table">' +
    '<thead><tr><th>n (periode ke-)</th><th>Bentuk Perhitungan</th><th>Bentuk Diperluas</th><th>Nilai Mₙ (Rp)</th></tr></thead>' +
    '<tbody>' +
    tableRows +
    '</tbody>' +
    '</table></div>' +
    '<p style="font-size:0.82rem;color:var(--color-ink-muted);margin-top:var(--space-2);">Perhatikan: bunga setiap periode = M₀ × i = konstan → ini adalah <strong>beda (b)</strong> dalam barisan aritmetika!</p>' +
    '</div>' +
    stepHTML +
    formulaHTML +
    koneksiHTML +
    (State.rumusBTFormulaShown
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="nextRumusBTBtn">Lanjut: Eksplorasi Bunga Majemuk →</button>' +
        '</div>'
      : '') +
    '</section>';

  var checkBtn = document.getElementById('btCheckStepBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      checkRumusBTStep(container, step);
    });

  var hintBtn = document.getElementById('btHintStepBtn');
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      var fb = document.getElementById('btStepFeedback');
      if (fb) fb.innerHTML = buildFeedbackBox('warning', '💡', data.steps[step].hint);
    });

  var inp = document.getElementById('btStepInput');
  if (inp) {
    inp.addEventListener('input', function () {
      State.rumusBTStepInputs[step] = inp.value;
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (checkBtn) checkBtn.click();
      }
    });
    setTimeout(function () {
      inp.focus();
    }, 50);
  }

  var nextBtn = document.getElementById('nextRumusBTBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      completeStage('rumusBT');
      navigateTo('eksplorasiBM');
    });
}

function checkRumusBTStep(container, step) {
  var s = DATA.rumusBT.steps[step];
  var inp = document.getElementById('btStepInput');
  var fb = document.getElementById('btStepFeedback');
  if (!inp || !fb) return;
  var parsed = parseInputInt(inp.value, true);
  if (parsed.error) {
    fb.innerHTML = buildFeedbackBox(
      'error',
      '✗',
      'Masukkan bilangan bulat (tanpa titik/koma pemisah tidak masalah).'
    );
    return;
  }
  State.rumusBTStepInputs[step] = inp.value;
  if (parsed.value === parseInt(s.answer, 10)) {
    State.rumusBTStepDone[step] = true;
    if (step + 1 < DATA.rumusBT.steps.length) {
      State.rumusBTStep = step + 1;
    } else {
      State.rumusBTFormulaShown = true;
    }
    saveState();
    renderRumusBT(container);
  } else {
    fb.innerHTML = buildFeedbackBox(
      'error',
      '✗',
      'Jawaban kurang tepat. Coba lagi atau lihat petunjuk.'
    );
  }
}

/* ============================================================
   9. STAGE: EKSPLORASI BUNGA MAJEMUK
   ============================================================ */

function buildBMSeqHTML(ctx, revealCount) {
  var html = '';
  for (var i = 0; i < ctx.terms.length; i++) {
    var revealed = i === 0 || i < revealCount + 1;
    var valCls = 'seq-term__val';
    if (!revealed) valCls += ' seq-term__val--hidden';
    else if (i === revealCount && i > 0) valCls += ' seq-term__val--revealed';
    html +=
      '<div class="seq-term">' +
      '<div class="' +
      valCls +
      '" style="' +
      (revealed ? 'border-color:var(--color-orange);color:var(--color-orange-strong);' : '') +
      '">' +
      (revealed ? formatRp(ctx.terms[i]) : '?') +
      '</div>' +
      '<div class="seq-term__label">' +
      esc(ctx.labels[i]) +
      '</div>' +
      '</div>';
    if (i < ctx.terms.length - 1) {
      var nextRevealed = i + 1 < revealCount + 1;
      if (revealed && nextRevealed) {
        var ratio = ctx.terms[i + 1] / ctx.terms[i];
        var ratioStr = Number.isInteger(ratio) ? '×' + ratio : '×' + ratio.toFixed(1);
        html += '<div class="seq-rasio-badge">' + ratioStr + '</div>';
      } else {
        html += '<div class="seq-arrow">→</div>';
      }
    }
  }
  return html;
}

function buildBMCtxTabs(ctxList, idx) {
  return ctxList
    .map(function (c, i) {
      var active = i === idx ? ' aria-current="step"' : '';
      var done = State.bmDone[i] ? ' is-complete' : '';
      var num = State.bmDone[i] ? '&#10003;' : i + 1;
      return (
        '<button type="button" class="stage-nav__item' +
        done +
        '"' +
        active +
        ' data-ctx="' +
        i +
        '">' +
        '<span class="stage-nav__num">' +
        num +
        '</span>' +
        esc(c.badge) +
        '</button>'
      );
    })
    .join('');
}

function buildBMIdentifyPanel(ctx, revealCount, isDone) {
  if (isDone) {
    return (
      '<div class="panel panel--compact" style="margin-top:var(--space-4);">' +
      buildFeedbackBox(
        'success',
        '✓',
        '<strong>Barisan geometri teridentifikasi!</strong><br>' +
          'Suku pertama <strong>a = ' +
          formatRp(ctx.a) +
          '</strong> ' +
          esc(ctx.unit) +
          ', ' +
          'rasio <strong>r = ' +
          ctx.r +
          '</strong>.<br>' +
          '<em>Ini adalah pola BUNGA MAJEMUK: bunga dihitung dari saldo terkini → rasio konstan → pertumbuhan eksponensial.</em>'
      ) +
      '</div>'
    );
  }
  if (revealCount >= 2) {
    return (
      '<div class="panel panel--compact identify-input-panel" style="margin-top:var(--space-4);">' +
      '<h4>Identifikasi Pola Bunga Majemuk</h4>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-bottom:var(--space-3);">' +
      '<div class="field-group" style="margin:0;">' +
      '<label for="bmInputA">Suku pertama (a) =</label>' +
      '<input type="text" inputmode="numeric" id="bmInputA" class="input-text" placeholder="..." aria-describedby="bmErrA">' +
      '<div class="field-error" id="bmErrA"></div>' +
      '</div>' +
      '<div class="field-group" style="margin:0;">' +
      '<label for="bmInputR">Rasio (r) =</label>' +
      '<input type="text" inputmode="numeric" id="bmInputR" class="input-text" placeholder="..." aria-describedby="bmErrR">' +
      '<div class="field-error" id="bmErrR"></div>' +
      '</div>' +
      '</div>' +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn--ghost btn--small" id="bmHintBtn">💡 Petunjuk</button>' +
      '<button type="button" class="btn btn--primary" id="bmCheckBtn">Periksa</button>' +
      '</div>' +
      '<div id="bmFeedback" style="margin-top:var(--space-3);"></div>' +
      '</div>'
    );
  }
  return '';
}

function renderEksplorasiBM(container) {
  var ctxList = DATA.eksplorasiBM.konteks;
  var idx = State.bmCtxIdx;
  var ctx = ctxList[idx];
  var revealCount = State.bmRevealCount[idx] || 0;
  var isDone = State.bmDone[idx] || false;
  var allDone = State.bmDone.filter(Boolean).length === ctxList.length;
  var maxReveal = ctx.terms.length - 1;

  container.innerHTML =
    '<section aria-label="Eksplorasi Bunga Majemuk">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 4 — EKSPLORASI POLA BUNGA MAJEMUK</span>' +
    '<p class="stage-head__goal">Tujuan: Mengamati pola pertumbuhan dengan rasio tetap dan mengidentifikasinya sebagai barisan geometri.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">' +
    esc(DATA.eksplorasiBM.instruction) +
    '</p>' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-4);">' +
    buildBMCtxTabs(ctxList, idx) +
    '</div>' +
    '<div class="panel panel--hero" style="margin-bottom:var(--space-3);">' +
    '<div style="display:flex;align-items:flex-start;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3);">' +
    '<span style="font-size:1.8rem;">' +
    ctx.icon +
    '</span>' +
    '<div>' +
    '<span class="badge-chip" style="background:var(--color-orange-soft);color:var(--color-orange-strong);border-color:var(--color-orange);">' +
    esc(ctx.badge) +
    '</span>' +
    '<p style="margin:var(--space-1) 0 0;font-size:0.92rem;">' +
    ctx.story +
    '</p>' +
    '</div></div>' +
    '<div class="seq-display" id="bmSeqDisplay">' +
    buildBMSeqHTML(ctx, revealCount) +
    '</div>' +
    (revealCount < maxReveal
      ? '<div style="text-align:center;margin-top:var(--space-3);">' +
        '<button type="button" class="seq-reveal-btn" style="background:var(--color-orange);color:#fff;" id="bmRevealBtn">▶ Tampilkan Periode Berikutnya</button>' +
        '</div>'
      : '') +
    '</div>' +
    buildBMIdentifyPanel(ctx, revealCount, isDone) +
    '</div>' +
    (allDone
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="nextBMBtn">Lanjut: Rumus Bunga Majemuk →</button>' +
        '</div>'
      : '') +
    '</section>';

  container.querySelectorAll('[data-ctx]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.bmCtxIdx = parseInt(btn.dataset.ctx, 10);
      saveState();
      renderEksplorasiBM(container);
    });
  });

  var revBtn = document.getElementById('bmRevealBtn');
  if (revBtn)
    revBtn.addEventListener('click', function () {
      if (State.bmRevealCount[idx] < maxReveal) {
        State.bmRevealCount[idx] += 1;
        saveState();
        renderEksplorasiBM(container);
      }
    });

  var hintBtn = document.getElementById('bmHintBtn');
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      var fb = document.getElementById('bmFeedback');
      if (fb)
        fb.innerHTML = buildFeedbackBox(
          'warning',
          '💡',
          '<strong>Petunjuk a:</strong> ' +
            ctx.hint_a +
            '<br>' +
            '<strong>Petunjuk r:</strong> ' +
            ctx.hint_r
        );
    });

  var checkBtn = document.getElementById('bmCheckBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      checkBMAnswer(container, idx);
    });

  var nextBtn = document.getElementById('nextBMBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      completeStage('eksplorasiBM');
      navigateTo('rumusBM');
    });
}

function checkBMAnswer(container, idx) {
  var ctx = DATA.eksplorasiBM.konteks[idx];
  var fb = document.getElementById('bmFeedback');
  var inpA = document.getElementById('bmInputA');
  var inpR = document.getElementById('bmInputR');
  var errA = document.getElementById('bmErrA');
  var errR = document.getElementById('bmErrR');
  errA.textContent = '';
  errR.textContent = '';
  var pA = parseInputInt(inpA ? inpA.value : '', true);
  var pR = parseInputInt(inpR ? inpR.value : '', true);
  if (pA.error === 'empty') {
    errA.textContent = 'Isi nilai a.';
    return;
  }
  if (pA.error === 'invalid') {
    errA.textContent = 'Masukkan bilangan bulat.';
    return;
  }
  if (pR.error === 'empty') {
    errR.textContent = 'Isi nilai r.';
    return;
  }
  if (pR.error === 'invalid') {
    errR.textContent = 'Masukkan bilangan bulat.';
    return;
  }

  if (pA.value === ctx.a && pR.value === ctx.r) {
    State.bmDone[idx] = true;
    var nextPending = -1;
    for (var i = 0; i < State.bmDone.length; i++) {
      if (!State.bmDone[i]) {
        nextPending = i;
        break;
      }
    }
    State.bmCtxIdx = nextPending !== -1 ? nextPending : idx;
    saveState();
    renderEksplorasiBM(container);
    if (nextPending !== -1) showNotice('Benar! Lanjut ke konteks berikutnya.');
  } else {
    var msg =
      pA.value !== ctx.a && pR.value !== ctx.r
        ? 'Kedua nilai kurang tepat.'
        : pA.value !== ctx.a
          ? 'Nilai a kurang tepat. Perhatikan suku pertama.'
          : 'Nilai r kurang tepat. Hitung perbandingan dua suku berurutan.';
    if (fb) fb.innerHTML = buildFeedbackBox('error', '✗', msg);
  }
}

/* ============================================================
   10. STAGE: RUMUS BUNGA MAJEMUK
   ============================================================ */

function renderRumusBM(container) {
  var data = DATA.rumusBM;
  var step = State.rumusBMStep;

  var tableRows = data.tableRows
    .map(function (row) {
      var nCell = '<td class="cell-highlight">' + esc(String(row.n)) + '</td>';
      var bentukCell = '<td>' + esc(row.bentuk) + '</td>';
      var expandedCell = '<td>' + esc(row.expanded) + '</td>';
      var mnCell =
        row.Mn !== null
          ? '<td class="cell-highlight">' + formatRp(row.Mn) + '</td>'
          : '<td style="font-style:italic;color:var(--color-orange-strong);">Mₙ</td>';
      return '<tr>' + nCell + bentukCell + expandedCell + mnCell + '</tr>';
    })
    .join('');

  var koneksi = data.koneksiGeometri;
  var koneksiHTML = State.rumusBMFormulaShown
    ? '<div class="panel panel--compact" style="margin-top:var(--space-4);border-left:4px solid var(--color-orange);">' +
      '<h4 style="color:var(--color-orange-strong);">🔗 Koneksi dengan Barisan Geometri</h4>' +
      '<p>' +
      koneksi.penjelasan +
      '</p>' +
      '<ul>' +
      koneksi.poin
        .map(function (p) {
          return '<li>' + p + '</li>';
        })
        .join('') +
      '</ul>' +
      '</div>'
    : '';

  var formulaHTML = State.rumusBMFormulaShown
    ? '<div class="formula-box formula-box--bm formula-box--reveal">' +
      '<div class="formula-box__label">Rumus Bunga Majemuk</div>' +
      '<div class="formula-box__expr formula-box__expr--large">Mₙ = M₀ × (1+i)ⁿ</div>' +
      '<div class="formula-box__note">M₀ = modal awal &nbsp;·&nbsp; n = jumlah periode &nbsp;·&nbsp; i = suku bunga per periode<br>' +
      'Setara: <strong>a = M₀</strong>, <strong>r = (1+i)</strong> dalam barisan geometri Uₙ = a × rⁿ</div>' +
      '</div>'
    : '';

  var stepHTML = '';
  if (!State.rumusBMFormulaShown) {
    var s = data.steps[step];
    var ex = State.rumusBMStepDone[step];
    var inputVal = State.rumusBMStepInputs[step] || '';
    stepHTML =
      '<div class="panel panel--compact" id="bmStepPanel">' +
      '<span class="stage-head__kicker" style="margin-bottom:var(--space-2);color:var(--color-orange);">LANGKAH ' +
      (step + 1) +
      ' dari ' +
      data.steps.length +
      '</span>' +
      '<p style="font-size:0.95rem;margin-bottom:var(--space-3);">' +
      s.question +
      '</p>' +
      (!ex
        ? '<div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;">' +
          '<input type="text" inputmode="numeric" id="bmStepInput" class="input-text" value="' +
          esc(inputVal) +
          '" placeholder="..." style="max-width:160px;text-align:center;font-family:var(--font-mono);font-size:1.05rem;">' +
          '<button type="button" class="btn btn--primary" style="background:var(--color-orange);" id="bmCheckStepBtn">Periksa</button>' +
          '<button type="button" class="btn btn--ghost btn--small" id="bmHintStepBtn">💡 Petunjuk</button>' +
          '</div>' +
          '<div id="bmStepFeedback" style="margin-top:var(--space-3);"></div>'
        : buildFeedbackBox('success', '✓', '<strong>Benar!</strong> ' + s.explanation)) +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="Rumus Bunga Majemuk">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 5 — RUMUS BUNGA MAJEMUK</span>' +
    '<p class="stage-head__goal">Tujuan: Menemukan rumus Mₙ = M₀ × (1+i)ⁿ dan menghubungkannya dengan barisan geometri.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>' +
    esc(data.title) +
    '</h3>' +
    '<p style="font-size:0.88rem;background:var(--color-orange-soft);border-left:3px solid var(--color-orange);padding:var(--space-2) var(--space-3);border-radius:0 var(--radius-sm) var(--radius-sm) 0;color:var(--color-orange-strong);">' +
    esc(data.konteks) +
    '</p>' +
    '<div style="overflow-x:auto;">' +
    '<table class="pattern-table">' +
    '<thead><tr><th>n (periode ke-)</th><th>Bentuk Perhitungan</th><th>Bentuk Diperluas</th><th>Nilai Mₙ</th></tr></thead>' +
    '<tbody>' +
    tableRows +
    '</tbody>' +
    '</table></div>' +
    '<p style="font-size:0.82rem;color:var(--color-ink-muted);margin-top:var(--space-2);">Perhatikan: setiap periode dikalikan dengan rasio r = ' +
    data.rasio +
    ' (konstan) → ini adalah <strong>rasio</strong> dalam barisan geometri!</p>' +
    '</div>' +
    stepHTML +
    formulaHTML +
    koneksiHTML +
    (State.rumusBMFormulaShown
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="nextRumusBMBtn">Lanjut: Perbandingan Interaktif →</button>' +
        '</div>'
      : '') +
    '</section>';

  var checkBtn = document.getElementById('bmCheckStepBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      checkRumusBMStep(container, step);
    });

  var hintBtn = document.getElementById('bmHintStepBtn');
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      var fb = document.getElementById('bmStepFeedback');
      if (fb) fb.innerHTML = buildFeedbackBox('warning', '💡', data.steps[step].hint);
    });

  var inp = document.getElementById('bmStepInput');
  if (inp) {
    inp.addEventListener('input', function () {
      State.rumusBMStepInputs[step] = inp.value;
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (checkBtn) checkBtn.click();
      }
    });
    setTimeout(function () {
      inp.focus();
    }, 50);
  }

  var nextBtn = document.getElementById('nextRumusBMBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      completeStage('rumusBM');
      navigateTo('perbandingan');
    });
}

function checkRumusBMStep(container, step) {
  var s = DATA.rumusBM.steps[step];
  var inp = document.getElementById('bmStepInput');
  var fb = document.getElementById('bmStepFeedback');
  if (!inp || !fb) return;
  var parsed = parseInputInt(inp.value, true);
  if (parsed.error) {
    fb.innerHTML = buildFeedbackBox('error', '✗', 'Masukkan bilangan bulat.');
    return;
  }
  State.rumusBMStepInputs[step] = inp.value;
  if (parsed.value === parseInt(s.answer, 10)) {
    State.rumusBMStepDone[step] = true;
    if (step + 1 < DATA.rumusBM.steps.length) {
      State.rumusBMStep = step + 1;
    } else {
      State.rumusBMFormulaShown = true;
    }
    saveState();
    renderRumusBM(container);
  } else {
    fb.innerHTML = buildFeedbackBox(
      'error',
      '✗',
      'Jawaban kurang tepat. Coba lagi atau lihat petunjuk.'
    );
  }
}

/* ============================================================
   11. STAGE: PERBANDINGAN INTERAKTIF
   ============================================================ */

function renderPerbandingan(container) {
  var data = DATA.perbandingan;

  var tableRowsHTML = data.tableData
    .map(function (row) {
      var diff = row.bm - row.bt;
      var maxBM = data.tableData[data.tableData.length - 1].bm;
      var barBTW = Math.max(2, Math.round((row.bt / maxBM) * 120));
      var barBMW = Math.max(2, Math.round((row.bm / maxBM) * 120));
      return (
        '<tr>' +
        '<td class="td-n">' +
        row.n +
        '</td>' +
        '<td class="td-bt">' +
        '<div class="growth-bar-wrap"><div class="growth-bar growth-bar--bt" style="width:' +
        barBTW +
        'px;"></div>' +
        '<span>Rp ' +
        formatRp(row.bt) +
        '</span></div>' +
        '</td>' +
        '<td class="td-bm">' +
        '<div class="growth-bar-wrap"><div class="growth-bar growth-bar--bm" style="width:' +
        barBMW +
        'px;"></div>' +
        '<span>Rp ' +
        formatRp(row.bm) +
        '</span></div>' +
        '</td>' +
        '<td class="td-diff">+Rp ' +
        formatRp(diff) +
        '</td>' +
        '</tr>'
      );
    })
    .join('');

  var calcResultHTML = '';
  if (State.calcDone) {
    var m0 = parseFloat(State.calcM0);
    var i = parseFloat(State.calcI) / 100;
    var n = parseInt(State.calcN, 10);
    if (!isNaN(m0) && !isNaN(i) && !isNaN(n) && m0 > 0 && i > 0 && n > 0) {
      var resBT = m0 * (1 + n * i);
      var resBM = m0 * Math.pow(1 + i, n);
      var winner =
        resBM > resBT
          ? 'Bunga Majemuk lebih menguntungkan sebesar Rp ' + formatRp(resBM - resBT) + '!'
          : resBM === resBT
            ? 'Hasilnya sama (periode pertama).'
            : 'Bunga Tunggal lebih besar (tidak mungkin untuk n > 1 dengan i > 0).';
      calcResultHTML =
        '<div class="interest-calc__result">' +
        '<div class="interest-calc__result-card interest-calc__result-card--bt">' +
        '<div class="interest-calc__result-card__label">Bunga Tunggal</div>' +
        '<div class="interest-calc__result-card__value">Rp ' +
        formatRp(resBT) +
        '</div>' +
        '<div class="interest-calc__result-card__formula">M₀×(1 + ' +
        n +
        '×' +
        i * 100 +
        '%)</div>' +
        '</div>' +
        '<div class="interest-calc__result-card interest-calc__result-card--bm">' +
        '<div class="interest-calc__result-card__label">Bunga Majemuk</div>' +
        '<div class="interest-calc__result-card__value">Rp ' +
        formatRp(resBM) +
        '</div>' +
        '<div class="interest-calc__result-card__formula">M₀×(1+' +
        i * 100 +
        '%)^' +
        n +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="interest-calc__winner">🏆 ' +
        winner +
        '</div>';
    }
  }

  container.innerHTML =
    '<section aria-label="Perbandingan Interaktif">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 6 — PERBANDINGAN INTERAKTIF</span>' +
    '<p class="stage-head__goal">Tujuan: Membedakan karakteristik bunga tunggal (aritmetika) dan bunga majemuk (geometri) secara visual dan interaktif.</p>' +
    '</div>' +
    '<div class="compare-grid">' +
    '<div class="compare-card compare-card--bt">' +
    '<span class="compare-card__badge">Bunga Tunggal</span>' +
    '<div class="compare-card__title">📐 Barisan Aritmetika</div>' +
    '<div class="compare-card__formula">Mₙ = M₀(1 + n·i)</div>' +
    '<p class="compare-card__desc"><strong>Beda b = M₀×i</strong> (konstan). Pertumbuhan linear — seperti tangga lurus.</p>' +
    '</div>' +
    '<div class="compare-card compare-card--bm">' +
    '<span class="compare-card__badge">Bunga Majemuk</span>' +
    '<div class="compare-card__title">📈 Barisan Geometri</div>' +
    '<div class="compare-card__formula">Mₙ = M₀ × (1+i)ⁿ</div>' +
    '<p class="compare-card__desc"><strong>Rasio r = (1+i)</strong> (konstan). Pertumbuhan eksponensial — seperti bola salju!</p>' +
    '</div>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>Contoh: M₀ = Rp 1.000.000, i = 10% per tahun</h3>' +
    '<p style="font-size:0.85rem;color:var(--color-ink-muted);">Bilah biru = BT, bilah oranye = BM. Amati perbedaan panjangnya seiring tahun bertambah.</p>' +
    '<div style="overflow-x:auto;">' +
    '<table class="comparison-table">' +
    '<thead><tr>' +
    '<th class="th-n">Tahun (n)</th>' +
    '<th class="th-bt">📐 Bunga Tunggal (BT)</th>' +
    '<th class="th-bm">📈 Bunga Majemuk (BM)</th>' +
    '<th class="th-diff">Selisih (BM−BT)</th>' +
    '</tr></thead>' +
    '<tbody>' +
    tableRowsHTML +
    '</tbody>' +
    '</table></div>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>💡 Perbedaan Kunci</h3>' +
    '<ul>' +
    data.kunciPerbedaan
      .map(function (p) {
        return '<li>' + p + '</li>';
      })
      .join('') +
    '</ul>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>🧮 Kalkulator Perbandingan</h3>' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);">Masukkan nilai sendiri untuk membandingkan kedua jenis bunga.</p>' +
    '<div class="interest-calc">' +
    '<div class="interest-calc__inputs">' +
    '<div class="field-group" style="margin:0;">' +
    '<label for="calcM0">Modal Awal (M₀) dalam Rp</label>' +
    '<input type="number" id="calcM0" class="input-text" placeholder="mis. 1000000" value="' +
    esc(State.calcM0) +
    '" min="1">' +
    '<div class="field-error" id="calcErrM0"></div>' +
    '</div>' +
    '<div class="field-group" style="margin:0;">' +
    '<label for="calcI">Suku Bunga per Tahun (%)</label>' +
    '<input type="number" id="calcI" class="input-text" placeholder="mis. 10" value="' +
    esc(State.calcI) +
    '" min="0.1" max="100" step="0.1">' +
    '<div class="field-error" id="calcErrI"></div>' +
    '</div>' +
    '<div class="field-group" style="margin:0;">' +
    '<label for="calcN">Jumlah Tahun (n)</label>' +
    '<input type="number" id="calcN" class="input-text" placeholder="mis. 5" value="' +
    esc(State.calcN) +
    '" min="1" max="30" step="1">' +
    '<div class="field-error" id="calcErrN"></div>' +
    '</div>' +
    '</div>' +
    '<div class="btn-group">' +
    '<button type="button" class="btn btn--primary" id="calcBtn">Hitung & Bandingkan</button>' +
    '</div>' +
    '<div id="calcResult">' +
    calcResultHTML +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary btn--large" id="nextPerbandinganBtn">Lanjut: Latihan →</button>' +
    '</div>' +
    '</section>';

  var calcBtn = document.getElementById('calcBtn');
  if (calcBtn)
    calcBtn.addEventListener('click', function () {
      runCalc(container);
    });

  var nextBtn = document.getElementById('nextPerbandinganBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      completeStage('perbandingan');
      navigateTo('latihan');
    });
}

function runCalc(container) {
  var m0El = document.getElementById('calcM0');
  var iEl = document.getElementById('calcI');
  var nEl = document.getElementById('calcN');
  var errM0 = document.getElementById('calcErrM0');
  var errI = document.getElementById('calcErrI');
  var errN = document.getElementById('calcErrN');
  errM0.textContent = '';
  errI.textContent = '';
  errN.textContent = '';

  var m0 = parseFloat(m0El ? m0El.value : '');
  var iVal = parseFloat(iEl ? iEl.value : '');
  var nVal = parseInt(nEl ? nEl.value : '', 10);
  var valid = true;
  if (!m0 || m0 <= 0) {
    errM0.textContent = 'Masukkan modal awal yang valid (> 0).';
    valid = false;
  }
  if (!iVal || iVal <= 0 || iVal > 100) {
    errI.textContent = 'Masukkan suku bunga antara 0,1 – 100.';
    valid = false;
  }
  if (!nVal || nVal < 1 || nVal > 30) {
    errN.textContent = 'Masukkan jumlah tahun antara 1 – 30.';
    valid = false;
  }
  if (!valid) return;

  State.calcM0 = String(m0);
  State.calcI = String(iVal);
  State.calcN = String(nVal);
  State.calcDone = true;
  saveState();
  renderPerbandingan(container);
  var resultEl = document.getElementById('calcResult');
  if (resultEl) resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ============================================================
   12. STAGE: LATIHAN CAMPURAN
   ============================================================ */

function renderLatihan(container) {
  var soalList = DATA.latihan.soal;
  var idx = State.latihanIdx;
  var soal = soalList[idx];
  var ex = State.latihanExercises[idx];
  var allDone = State.latihanExercises.every(function (e) {
    return e.correct || e.revealed;
  });

  var statuses = State.latihanExercises.map(function (e) {
    return e.correct ? 'correct' : e.checked ? 'incorrect' : null;
  });

  var tipeBadge =
    '<span class="type-badge type-badge--' +
    esc(soal.tipe) +
    '">' +
    esc(soal.tipeBadge) +
    '</span>';

  var konteksHTML = soal.konteks
    ? '<div class="panel panel--compact panel--info" style="margin-bottom:var(--space-3);">' +
      '<span style="font-size:0.8rem;font-family:var(--font-mono);color:var(--color-primary);font-weight:700;letter-spacing:0.05em;">KONTEKS</span>' +
      '<p style="margin:var(--space-1) 0 0;">' +
      soal.konteks +
      '</p>' +
      '</div>'
    : '';

  var bodyHTML = '';
  if (soal.type === 'input') {
    if (ex.correct) {
      bodyHTML = buildFeedbackBox('success', '✓', '<strong>Benar!</strong> ' + soal.explanation);
    } else if (ex.revealed) {
      bodyHTML = buildFeedbackBox('warning', '💡', '<strong>Jawaban:</strong> ' + soal.explanation);
    } else {
      bodyHTML =
        '<div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3);">' +
        '<input type="text" inputmode="numeric" id="latihanInput" class="input-text" value="' +
        esc(ex.userInput) +
        '" placeholder="Jawaban..." style="max-width:180px;font-family:var(--font-mono);font-size:1.1rem;text-align:center;">' +
        (soal.unit
          ? '<span style="font-size:0.88rem;color:var(--color-ink-muted);">' +
            esc(soal.unit) +
            '</span>'
          : '') +
        '</div>' +
        '<div class="btn-group">' +
        (ex.hintLevel < (soal.hints || []).length
          ? '<button type="button" class="btn btn--ghost btn--small" id="latihanHintBtn">💡 Petunjuk (' +
            (ex.hintLevel + 1) +
            '/' +
            (soal.hints || []).length +
            ')</button>'
          : '') +
        '<button type="button" class="btn btn--ghost btn--small" id="latihanRevealBtn">Lihat Jawaban</button>' +
        '<button type="button" class="btn btn--primary" id="latihanCheckBtn">Periksa</button>' +
        '</div>' +
        '<div id="latihanFeedback" style="margin-top:var(--space-3);"></div>';
    }
  } else if (soal.type === 'choice') {
    if (ex.checked) {
      bodyHTML = buildFeedbackBox(
        ex.correct ? 'success' : 'warning',
        ex.correct ? '✓' : '💡',
        (ex.correct ? '<strong>Benar!</strong> ' : '<strong>Jawaban tepat:</strong> ') +
          soal.explanation
      );
    } else {
      var choicesHTML =
        '<ul class="choice-list">' +
        soal.options
          .map(function (opt) {
            var sel = ex.chosen === opt.id ? ' is-selected' : '';
            return (
              '<li><button type="button" class="choice-btn' +
              sel +
              '" data-opt="' +
              esc(opt.id) +
              '">' +
              '<span class="choice-btn__key">' +
              opt.id.replace('opt_', '').toUpperCase() +
              '</span>' +
              esc(opt.label) +
              '</button></li>'
            );
          })
          .join('') +
        '</ul>';
      bodyHTML =
        choicesHTML +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn--ghost btn--small" id="latihanHintBtn">💡 Petunjuk</button>' +
        '<button type="button" class="btn btn--primary" id="latihanCheckChoiceBtn" ' +
        (!ex.chosen ? 'disabled' : '') +
        '>Periksa</button>' +
        '</div>' +
        '<div id="latihanFeedback" style="margin-top:var(--space-3);"></div>';
    }
  }

  var navHTML = '';
  if (ex.correct || ex.revealed || ex.checked) {
    if (idx < soalList.length - 1) {
      navHTML =
        '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary" id="latihanNextBtn">Soal Berikutnya →</button>' +
        '</div>';
    }
  }

  container.innerHTML =
    '<section aria-label="Latihan Campuran">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 7 — LATIHAN CAMPURAN</span>' +
    '<p class="stage-head__goal">Tujuan: Menerapkan rumus bunga tunggal dan majemuk pada berbagai soal kontekstual.</p>' +
    '</div>' +
    '<div class="panel">' +
    buildProgressDots(soalList.length, idx, statuses) +
    '<p style="font-size:0.82rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);">' +
    esc(DATA.latihan.instruction) +
    '</p>' +
    tipeBadge +
    '<div style="margin-top:var(--space-2);">' +
    konteksHTML +
    '<p style="font-size:0.95rem;font-weight:500;margin-bottom:var(--space-3);">' +
    soal.question +
    '</p>' +
    bodyHTML +
    '</div></div>' +
    navHTML +
    (allDone
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="nextLatihanBtn">Lanjut: Refleksi →</button>' +
        '</div>'
      : '') +
    '</section>';

  /* Input events */
  var latihanInput = document.getElementById('latihanInput');
  if (latihanInput) {
    latihanInput.addEventListener('input', function () {
      State.latihanExercises[idx].userInput = latihanInput.value;
    });
    latihanInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var cb = document.getElementById('latihanCheckBtn');
        if (cb) cb.click();
      }
    });
    setTimeout(function () {
      latihanInput.focus();
    }, 50);
  }

  var checkBtn = document.getElementById('latihanCheckBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      checkLatihanInput(container, idx);
    });

  var checkChoiceBtn = document.getElementById('latihanCheckChoiceBtn');
  if (checkChoiceBtn)
    checkChoiceBtn.addEventListener('click', function () {
      checkLatihanChoice(container, idx);
    });

  var hintBtn = document.getElementById('latihanHintBtn');
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      var fb = document.getElementById('latihanFeedback');
      if (!fb) return;
      if (soal.type === 'input') {
        var hl = ex.hintLevel;
        if (hl < (soal.hints || []).length) {
          fb.innerHTML = buildFeedbackBox('warning', '💡', soal.hints[hl]);
          State.latihanExercises[idx].hintLevel++;
          saveState();
          renderLatihan(container);
        }
      } else {
        fb.innerHTML = buildFeedbackBox('warning', '💡', soal.hint);
      }
    });

  var revealBtn = document.getElementById('latihanRevealBtn');
  if (revealBtn)
    revealBtn.addEventListener('click', function () {
      State.latihanExercises[idx].revealed = true;
      saveState();
      renderLatihan(container);
    });

  container.querySelectorAll('[data-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.latihanExercises[idx].chosen = btn.dataset.opt;
      saveState();
      renderLatihan(container);
    });
  });

  var nextBtn = document.getElementById('latihanNextBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      State.latihanIdx = idx + 1;
      saveState();
      renderLatihan(container);
    });

  var finishBtn = document.getElementById('nextLatihanBtn');
  if (finishBtn)
    finishBtn.addEventListener('click', function () {
      completeStage('latihan');
      navigateTo('refleksi');
    });
}

function checkLatihanInput(container, idx) {
  var soal = DATA.latihan.soal[idx];
  var ex = State.latihanExercises[idx];
  var inp = document.getElementById('latihanInput');
  var fb = document.getElementById('latihanFeedback');
  if (!inp || !fb) return;
  var parsed = parseInputInt(inp.value, true);
  if (parsed.error) {
    fb.innerHTML = buildFeedbackBox('error', '✗', 'Masukkan bilangan bulat.');
    return;
  }
  ex.userInput = inp.value;
  ex.attempts++;
  if (parsed.value === soal.answer) {
    ex.correct = true;
    saveState();
    renderLatihan(container);
  } else {
    fb.innerHTML = buildFeedbackBox(
      'error',
      '✗',
      'Jawaban kurang tepat. Coba lagi atau gunakan petunjuk.'
    );
    saveState();
  }
}

function checkLatihanChoice(container, idx) {
  var soal = DATA.latihan.soal[idx];
  var ex = State.latihanExercises[idx];
  if (!ex.chosen) return;
  ex.checked = true;
  ex.correct = ex.chosen === soal.correct;
  saveState();
  renderLatihan(container);
}

/* ============================================================
   13. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var data = DATA.refleksi;
  var saved = State.refleksiSaved;

  var fieldsHTML = data.soal
    .map(function (q, i) {
      var val = State.refleksiAnswers[q.id] || '';
      return (
        '<div class="field-group">' +
        '<label for="refl_' +
        esc(q.id) +
        '" style="font-weight:500;">' +
        (i + 1) +
        '. ' +
        q.question +
        '</label>' +
        '<textarea id="refl_' +
        esc(q.id) +
        '" class="input-text" rows="3" placeholder="' +
        esc(q.placeholder) +
        '"' +
        (saved ? ' readonly' : '') +
        '>' +
        esc(val) +
        '</textarea>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Refleksi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 8 — REFLEKSI</span>' +
    '<p class="stage-head__goal">Tujuan: Merangkum dan mengkonsolidasikan pemahaman tentang bunga tunggal dan majemuk.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>' +
    esc(data.title) +
    '</h3>' +
    '<div class="panel panel--compact panel--warning" style="margin-bottom:var(--space-4);">' +
    '<p style="margin:0;font-size:0.88rem;">' +
    data.note +
    '</p>' +
    '</div>' +
    fieldsHTML +
    (!saved
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary" id="saveReflBtn">Simpan Refleksi</button>' +
        '</div>'
      : '') +
    '</div>' +
    (saved
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="nextReflBtn">Selesai →</button>' +
        '</div>'
      : '') +
    '</section>';

  data.soal.forEach(function (q) {
    var el = document.getElementById('refl_' + q.id);
    if (el && !saved) {
      el.addEventListener('input', function () {
        State.refleksiAnswers[q.id] = el.value;
        saveState();
      });
    }
  });

  var saveBtn = document.getElementById('saveReflBtn');
  if (saveBtn)
    saveBtn.addEventListener('click', function () {
      State.refleksiSaved = true;
      completeStage('refleksi');
      saveState();
      renderRefleksi(container);
      showNotice('Refleksi tersimpan!');
    });

  var nextBtn = document.getElementById('nextReflBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      navigateTo('selesai');
    });
}

/* ============================================================
   14. STAGE: SELESAI
   ============================================================ */

function renderSelesai(container) {
  var correct = State.latihanExercises.filter(function (e) {
    return e.correct;
  }).length;
  var total = DATA.latihan.soal.length;

  container.innerHTML =
    '<section aria-label="Selesai" style="text-align:center;">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">SELESAI 🎉</span>' +
    '</div>' +
    '<div class="panel panel--hero" style="max-width:640px;margin:0 auto var(--space-6);">' +
    '<div style="font-size:3rem;margin-bottom:var(--space-3);">🏆</div>' +
    '<h2>Kamu Telah Menyelesaikan</h2>' +
    '<h2 style="color:var(--color-primary);">Bunga Tunggal & Bunga Majemuk!</h2>' +
    '<p style="font-size:1.05rem;margin-top:var(--space-3);">Skor latihan kamu: <strong>' +
    correct +
    ' dari ' +
    total +
    ' soal benar</strong></p>' +
    '</div>' +
    '<div class="compare-grid" style="max-width:800px;margin:0 auto var(--space-5);">' +
    '<div class="compare-card compare-card--bt">' +
    '<span class="compare-card__badge">Bunga Tunggal</span>' +
    '<div class="compare-card__title">📐 Barisan Aritmetika</div>' +
    '<div class="compare-card__formula">Mₙ = M₀(1 + n·i)</div>' +
    '<p class="compare-card__desc">Beda b = M₀·i (konstan). Pertumbuhan linear. Cocok untuk cicilan tetap.</p>' +
    '</div>' +
    '<div class="compare-card compare-card--bm">' +
    '<span class="compare-card__badge">Bunga Majemuk</span>' +
    '<div class="compare-card__title">📈 Barisan Geometri</div>' +
    '<div class="compare-card__formula">Mₙ = M₀ × (1+i)ⁿ</div>' +
    '<p class="compare-card__desc">Rasio r = (1+i) (konstan). Pertumbuhan eksponensial. Cocok untuk investasi jangka panjang.</p>' +
    '</div>' +
    '</div>' +
    '<div class="panel panel--compact" style="max-width:640px;margin:0 auto var(--space-5);text-align:left;">' +
    '<h3>Poin Kunci yang Telah Kamu Pelajari</h3>' +
    '<ul>' +
    '<li>Bunga tunggal = beda tetap → barisan <strong>aritmetika</strong> (pertumbuhan linear)</li>' +
    '<li>Bunga majemuk = rasio tetap → barisan <strong>geometri</strong> (pertumbuhan eksponensial)</li>' +
    '<li>Rumus BT: <strong>Mₙ = M₀(1 + n·i)</strong> → mirip Uₙ = a + n·b</li>' +
    '<li>Rumus BM: <strong>Mₙ = M₀·(1+i)ⁿ</strong> → mirip Uₙ = a·rⁿ</li>' +
    '<li>Untuk jangka panjang, bunga majemuk selalu menghasilkan nilai lebih besar</li>' +
    '</ul>' +
    '</div>' +
    '<div class="btn-group" style="justify-content:center;gap:var(--space-3);flex-wrap:wrap;">' +
    '<button type="button" class="btn btn--ghost" id="ulangBtn">↩ Ulangi dari Awal</button>' +
    '<a href="../../index.html" class="btn btn--primary">Kembali ke Beranda</a>' +
    '</div>' +
    '</section>';

  completeStage('selesai');

  var ulangBtn = document.getElementById('ulangBtn');
  if (ulangBtn)
    ulangBtn.addEventListener('click', function () {
      if (confirm('Reset semua progress dan mulai dari awal?')) {
        clearState();
        saveState();
        updateStageNav();
        updateProgress();
        navigateTo('orientasi');
      }
    });
}

/* ============================================================
   16. INIT
   ============================================================ */

function init() {
  buildStageNav();
  loadState();
  initExerciseArrays();
  updateStageNav();
  updateProgress();
  renderCurrentStage();

  var resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn)
    resetBtn.addEventListener('click', function () {
      if (confirm('Reset semua progress pembelajaran?')) {
        clearState();
        saveState();
        updateStageNav();
        updateProgress();
        navigateTo('orientasi');
      }
    });
}

document.addEventListener('DOMContentLoaded', init);
