'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Penjumlahan dan Pengurangan Bilangan Bulat
   Fase D — SMP Kelas 7

   Utilitas bersama (esc, parseInputInt, showNotice, builder render,
   mesin navigasi tahap) berada di shared/engine.js.

   Bagian:
    1. Utilitas
    2. Konstanta
    3. State & Storage
    4. Navigasi
    5. Utilitas Render
    6. Stage: Orientasi
    7. Stage: Eksplorasi Visual
    8. Stage: Pola Operasi
    9. Stage: Latihan Operasi
   10. Stage: Masalah Kontekstual
   11. Stage: Tantangan
   12. Stage: Refleksi
   13. Stage: Selesai
   14. Init
   ============================================================ */

/* ============================================================
   1. UTILITAS
   ============================================================ */

function fmtNum(v) {
  if (v === 0) return '0';
  if (v > 0) return '+' + v;
  return String(v);
}

/* ============================================================
   2. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'eksplorasi',
  'polaOperasi',
  'latihanOperasi',
  'masalahKontekstual',
  'tantangan',
  'refleksi',
  'selesai',
];

var STAGE_LABELS = [
  'Orientasi',
  'Eksplorasi',
  'Pola',
  'Latihan',
  'Masalah',
  'Tantangan',
  'Refleksi',
  'Selesai',
];

var STORAGE_KEY = 'mpi-d-1-2-penjumlahan-v1';

/* ============================================================
   3. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Eksplorasi */
  eksplorasiCtxIdx: 0,
  eksplorasiRevealed: [],

  /* Pola Operasi */
  polaRevealed: [],

  /* Latihan Operasi */
  latihanIdx: 0,
  latihanExercises: [],

  /* Masalah Kontekstual */
  masalahIdx: 0,
  masalahExercises: [],

  /* Tantangan */
  tantanganIdx: 0,
  tantanganExercises: [],

  /* Refleksi */
  refleksiAnswers: {},
  refleksiSaved: false,
};

var Store = createStore({ key: STORAGE_KEY, state: State });
var saveState = Store.save;
var loadState = Store.load;

function clearState() {
  Store.reset();
  initStateArrays();
}

function initStateArrays() {
  ensureExerciseArray(State, 'eksplorasiRevealed', DATA.eksplorasi.konteks, function () {
    return false;
  });
  ensureExerciseArray(State, 'polaRevealed', DATA.polaOperasi.pola, function () {
    return false;
  });
  ensureExerciseArray(State, 'latihanExercises', DATA.latihanOperasi.soal, function () {
    return { attempts: 0, hintShown: false, correct: false, userInput: '', revealed: false };
  });
  ensureExerciseArray(State, 'masalahExercises', DATA.masalahKontekstual.soal, function (s) {
    return s.type === 'choice'
      ? { attempts: 0, correct: false, chosen: null }
      : { attempts: 0, hintShown: false, correct: false, userInput: '', revealed: false };
  });
  ensureExerciseArray(State, 'tantanganExercises', DATA.tantangan.soal, function (s) {
    return s.type === 'choice'
      ? { attempts: 0, correct: false, chosen: null }
      : { attempts: 0, hintShown: false, correct: false, userInput: '', revealed: false };
  });
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
    '<span style="font-size:0.82rem;color:var(--color-ink-muted);margin-left:var(--space-2);">Soal ' +
    (current + 1) +
    ' dari ' +
    total +
    '</span>' +
    '</div>'
  );
}

/* Build SVG operation number line.
   Shows number line from min to max with:
   - Orange start point
   - (optional) blue arc + green end point when endVal is provided */
function buildOpNL(min, max, startVal, endVal) {
  var W = 580;
  var H = 120;
  var padX = 48;
  var axisY = 78;

  function xOf(v) {
    return padX + ((v - min) / (max - min)) * (W - 2 * padX);
  }

  var html =
    '<svg class="numberline-svg" viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';

  /* Axis line */
  html +=
    '<line class="nl-axis" x1="' +
    (padX - 10) +
    '" y1="' +
    axisY +
    '" x2="' +
    (W - padX + 10) +
    '" y2="' +
    axisY +
    '"/>';

  /* Arrow heads */
  html +=
    '<polygon class="nl-arrow" points="' +
    (W - padX + 10) +
    ',' +
    axisY +
    ' ' +
    (W - padX + 2) +
    ',' +
    (axisY - 4) +
    ' ' +
    (W - padX + 2) +
    ',' +
    (axisY + 4) +
    '"/>';
  html +=
    '<polygon class="nl-arrow" points="' +
    (padX - 10) +
    ',' +
    axisY +
    ' ' +
    (padX - 2) +
    ',' +
    (axisY - 4) +
    ' ' +
    (padX - 2) +
    ',' +
    (axisY + 4) +
    '"/>';

  /* Ticks and labels */
  var range = max - min;
  var step = range <= 20 ? 1 : range <= 40 ? 2 : 5;
  var labelEvery = range <= 20 ? 5 : range <= 40 ? 5 : 10;
  for (var v = min; v <= max; v += step) {
    var x = xOf(v);
    var isMajor = v % labelEvery === 0;
    var tickH = isMajor ? 9 : 5;
    html +=
      '<line class="nl-tick' +
      (isMajor ? ' nl-tick--major' : '') +
      '" x1="' +
      x +
      '" y1="' +
      (axisY - tickH) +
      '" x2="' +
      x +
      '" y2="' +
      (axisY + tickH) +
      '"/>';
    if (isMajor) {
      var lCls = v === 0 ? 'nl-label nl-label--zero' : 'nl-label';
      html +=
        '<text class="' + lCls + '" x="' + x + '" y="' + (axisY + tickH + 5) + '">' + v + '</text>';
    }
  }

  /* Start point */
  var sx = xOf(startVal);
  html += '<circle class="nl-point--start" cx="' + sx + '" cy="' + axisY + '" r="10"/>';
  html +=
    '<text class="nl-point-label--start" x="' +
    sx +
    '" y="' +
    (axisY - 16) +
    '">' +
    fmtNum(startVal) +
    '</text>';

  /* End point + arc (if revealed) */
  if (endVal !== null && endVal !== undefined) {
    var ex = xOf(endVal);
    var midX = (sx + ex) / 2;
    var arcY = axisY - 42;
    var startArcY = axisY - 10;

    /* Curved dashed arc */
    html +=
      '<path class="nl-move-arc" d="M ' +
      sx +
      ',' +
      startArcY +
      ' Q ' +
      midX +
      ',' +
      arcY +
      ' ' +
      ex +
      ',' +
      startArcY +
      '"/>';

    /* Arrowhead at end of arc */
    if (ex > sx) {
      /* Moving right: arrowhead points right-down */
      html +=
        '<polygon class="nl-move-arc-head" points="' +
        ex +
        ',' +
        startArcY +
        ' ' +
        (ex - 9) +
        ',' +
        (startArcY - 6) +
        ' ' +
        (ex - 5) +
        ',' +
        (startArcY + 6) +
        '"/>';
    } else {
      /* Moving left: arrowhead points left-down */
      html +=
        '<polygon class="nl-move-arc-head" points="' +
        ex +
        ',' +
        startArcY +
        ' ' +
        (ex + 9) +
        ',' +
        (startArcY - 6) +
        ' ' +
        (ex + 5) +
        ',' +
        (startArcY + 6) +
        '"/>';
    }

    /* End point */
    html += '<circle class="nl-point--end" cx="' + ex + '" cy="' + axisY + '" r="10"/>';
    html +=
      '<text class="nl-point-label--end" x="' +
      ex +
      '" y="' +
      (axisY - 16) +
      '">' +
      fmtNum(endVal) +
      '</text>';
  }

  html += '</svg>';
  return html;
}

function buildStepsHTML(langkah) {
  if (!langkah || !langkah.length) return '';
  var items = langkah
    .map(function (l, i) {
      return (
        '<div class="step-item">' +
        '<span class="step-item__num">' +
        (i + 1) +
        '</span>' +
        '<span class="step-item__expr">' +
        esc(l) +
        '</span>' +
        '</div>'
      );
    })
    .join('');
  return '<div class="steps-list" aria-label="Langkah penyelesaian">' + items + '</div>';
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
    case 'polaOperasi':
      renderPolaOperasi(container);
      break;
    case 'latihanOperasi':
      renderLatihanOperasi(container);
      break;
    case 'masalahKontekstual':
      renderMasalah(container);
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
      container.innerHTML = '<p>Tahap tidak ditemukan.</p>';
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
    '<p style="font-size:1.05rem;">Dalam kehidupan sehari-hari, banyak situasi yang menggambarkan <strong>perubahan nilai</strong> — suhu naik turun, saldo rekening bertambah berkurang, ketinggian berubah, atau skor kuis yang fluktuatif. Semua situasi ini dapat dimodelkan dengan <strong>operasi penjumlahan dan pengurangan bilangan bulat</strong>.</p>' +
    '<div class="panel panel--info" style="margin-bottom:0;">' +
    '<h3 style="margin-bottom:var(--space-2);">Dalam media ini kamu akan:</h3>' +
    '<ol class="objectives-list">' +
    '<li><span class="objectives-list__num">1</span>Mengamati perubahan nilai di garis bilangan secara visual dan interaktif.</li>' +
    '<li><span class="objectives-list__num">2</span>Menemukan pola aturan operasi bilangan bulat (4 pola utama).</li>' +
    '<li><span class="objectives-list__num">3</span>Berlatih menghitung operasi penjumlahan dan pengurangan bilangan bulat.</li>' +
    '<li><span class="objectives-list__num">4</span>Menyelesaikan masalah kontekstual dengan operasi multi-langkah.</li>' +
    '</ol></div></div>' +
    '<div class="panel panel--compact">' +
    '<h3>Contoh Perubahan Nilai di Sekitar Kita</h3>' +
    '<ul>' +
    '<li>Suhu Dieng pagi hari <strong>3°C</strong>, malam turun menjadi <strong>−4°C</strong>. Perubahan: <strong>3 − 7 = −4</strong></li>' +
    '<li>Saldo rekening <strong>−Rp 15.000</strong> (hutang), terima transfer <strong>Rp 25.000</strong>. Saldo baru: <strong>−15 + 25 = +10</strong> (ribu rupiah)</li>' +
    '<li>Penyelam di kedalaman <strong>−5 m</strong>, turun 4 m lagi. Posisi baru: <strong>−5 − 4 = −9 m</strong></li>' +
    '</ul>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>Cara Menggunakan Media Ini</h3>' +
    '<div class="hero-steps">' +
    '<div class="hero-steps__item"><span class="hero-steps__num">1</span>Kerjakan tahap dari kiri ke kanan. Setiap tahap harus diselesaikan sebelum lanjut.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">2</span>Pada setiap latihan, tersedia tombol <strong>Periksa</strong>, <strong>Petunjuk</strong>, dan penjelasan jawaban.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">3</span>Baca umpan balik dengan teliti — penjelasannya membantu memahami konsep.</div>' +
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
    navigateTo('eksplorasi');
  });
}

/* ============================================================
   7. STAGE: EKSPLORASI VISUAL
   ============================================================ */

function renderEksplorasi(container) {
  var ctxList = DATA.eksplorasi.konteks;
  var idx = State.eksplorasiCtxIdx;
  var ctx = ctxList[idx];
  var revealed = State.eksplorasiRevealed[idx];
  var allRevealed = State.eksplorasiRevealed.filter(Boolean).length === ctxList.length;

  /* Tab navigation */
  var tabsHTML = ctxList
    .map(function (c, i) {
      var isDone = State.eksplorasiRevealed[i];
      return (
        '<button type="button" class="stage-nav__item' +
        (isDone ? ' is-complete' : '') +
        '"' +
        (i === idx ? ' aria-current="step"' : '') +
        ' data-ctx-idx="' +
        i +
        '">' +
        '<span class="stage-nav__num">' +
        (isDone ? '✓' : i + 1) +
        '</span>' +
        esc(c.badge) +
        '</button>'
      );
    })
    .join('');

  /* Determine operation label */
  var opLabel, opClass;
  if (ctx.op === '+') {
    if (ctx.nilai < 0) {
      opLabel = 'Tambah ' + ctx.nilai;
      opClass = 'op-chip--sub';
    } else {
      opLabel = 'Tambah +' + ctx.nilai;
      opClass = 'op-chip--add';
    }
  } else {
    opLabel = 'Kurang −' + ctx.nilai;
    opClass = 'op-chip--sub';
  }

  /* Build operation expression for display */
  var opSymbol = ctx.op === '+' ? '+' : '−';
  var opValStr = ctx.op === '+' ? fmtNum(ctx.nilai) : ctx.nilai;

  /* Number line SVG */
  var nlHTML = buildOpNL(ctx.nlMin, ctx.nlMax, ctx.awal, revealed ? ctx.akhir : null);

  /* Value row */
  var valueRowHTML =
    '<div class="op-value-row">' +
    '<div class="op-val-box">' +
    '<span class="op-val-box__label">Nilai awal</span>' +
    '<span class="op-val-box__num op-val-box__num--start">' +
    fmtNum(ctx.awal) +
    '</span>' +
    '<span style="font-size:0.75rem;color:var(--color-ink-muted);">' +
    esc(ctx.unit) +
    '</span>' +
    '</div>' +
    '<span class="op-arrow-icon">' +
    opSymbol +
    '</span>' +
    '<div class="op-val-box">' +
    '<span class="op-val-box__label">Perubahan</span>' +
    '<span class="op-val-box__num op-val-box__num--op">' +
    (ctx.op === '+' ? fmtNum(ctx.nilai) : '−' + ctx.nilai) +
    '</span>' +
    '<span style="font-size:0.75rem;color:var(--color-ink-muted);">' +
    esc(ctx.unit) +
    '</span>' +
    '</div>' +
    '<span class="op-arrow-icon">=</span>' +
    '<div class="op-val-box">' +
    '<span class="op-val-box__label">' +
    esc(ctx.kalimat) +
    '</span>' +
    (revealed
      ? '<span class="op-val-box__num op-val-box__num--end">' + fmtNum(ctx.akhir) + '</span>'
      : '<span class="op-val-box__num op-val-box__num--hidden">?</span>') +
    '<span style="font-size:0.75rem;color:var(--color-ink-muted);">' +
    esc(ctx.unit) +
    '</span>' +
    '</div>' +
    '</div>';

  /* Feedback / explanation */
  var feedbackHTML = '';
  if (revealed) {
    feedbackHTML =
      buildFeedbackBox(
        'success',
        '✓',
        '<strong>' + esc(ctx.ekspresi) + '</strong><br>' + ctx.penjelasan
      ) +
      '<div class="insight-box" style="margin-top:var(--space-3);">' +
      '<span class="insight-box__icon">💡</span>' +
      '<div><strong>Ingat:</strong> Penjumlahan = bergerak ke kanan, pengurangan = bergerak ke kiri pada garis bilangan.</div>' +
      '</div>';
  }

  /* Action buttons */
  var actionHTML = '';
  if (!revealed) {
    actionHTML =
      '<div class="btn-group btn-group--center">' +
      '<button type="button" class="btn btn--primary" id="revealBtn">Lihat Perubahan →</button>' +
      '</div>';
  } else if (idx < ctxList.length - 1) {
    actionHTML =
      '<div class="btn-group btn-group--end">' +
      '<button type="button" class="btn btn--primary" id="nextCtxBtn">Konteks Berikutnya →</button>' +
      '</div>';
  }

  /* Proceed button when all contexts done */
  var proceedHTML = '';
  if (allRevealed) {
    proceedHTML =
      '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
      '<button type="button" class="btn btn--primary btn--large" id="ekspFinishBtn">Lanjut: Pola Operasi →</button>' +
      '</div>';
  } else if (!allRevealed && revealed && idx === ctxList.length - 1) {
    /* On the last card but haven't visited all */
    proceedHTML =
      '<p style="text-align:center;font-size:0.85rem;color:var(--color-ink-muted);margin-top:var(--space-3);">Jelajahi semua ' +
      ctxList.length +
      ' konteks untuk melanjutkan.</p>';
  }

  container.innerHTML =
    '<section aria-label="Eksplorasi Visual">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 2 — EKSPLORASI VISUAL</span>' +
    '<p class="stage-head__goal">Tujuan: Memahami penjumlahan dan pengurangan bilangan bulat sebagai pergerakan pada garis bilangan.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">' +
    DATA.eksplorasi.instruction +
    '</p>' +
    '<div class="ctx-tabs">' +
    tabsHTML +
    '</div>' +
    '<div class="panel panel--hero" style="margin-bottom:var(--space-3);">' +
    '<div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3);">' +
    '<span style="font-size:2rem;" aria-hidden="true">' +
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
    '<p style="font-size:0.9rem;font-weight:600;color:var(--color-ink-muted);margin:var(--space-2) 0;">' +
    '❓ ' +
    ctx.pertanyaan +
    '</p>' +
    valueRowHTML +
    '</div>' +
    '<div class="numberline-wrap">' +
    nlHTML +
    '</div>' +
    (feedbackHTML ? '<div style="margin-top:var(--space-3);">' + feedbackHTML + '</div>' : '') +
    actionHTML +
    '</div>' +
    proceedHTML +
    '</section>';

  /* Events */
  container.querySelectorAll('[data-ctx-idx]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.eksplorasiCtxIdx = parseInt(btn.dataset.ctxIdx, 10);
      saveState();
      renderEksplorasi(container);
    });
  });

  var revBtn = document.getElementById('revealBtn');
  if (revBtn) {
    revBtn.addEventListener('click', function () {
      State.eksplorasiRevealed[idx] = true;
      saveState();
      renderEksplorasi(container);
    });
  }

  var nextCtxBtn = document.getElementById('nextCtxBtn');
  if (nextCtxBtn) {
    nextCtxBtn.addEventListener('click', function () {
      State.eksplorasiCtxIdx = idx + 1;
      saveState();
      renderEksplorasi(container);
    });
  }

  var finBtn = document.getElementById('ekspFinishBtn');
  if (finBtn) {
    finBtn.addEventListener('click', function () {
      completeStage('eksplorasi');
      navigateTo('polaOperasi');
    });
  }
}

/* ============================================================
   8. STAGE: POLA OPERASI
   ============================================================ */

function renderPolaOperasi(container) {
  var pola = DATA.polaOperasi.pola;
  var allRevealed = State.polaRevealed.filter(Boolean).length === pola.length;

  var cardsHTML = pola
    .map(function (p, i) {
      var revealed = State.polaRevealed[i];
      var hClass = 'op-card__header--' + p.warna;
      return (
        '<div class="op-card' +
        (revealed ? ' is-revealed' : '') +
        '" data-pola-idx="' +
        i +
        '">' +
        '<div class="op-card__header ' +
        hClass +
        '">' +
        '<span aria-hidden="true">' +
        p.icon +
        '</span> ' +
        esc(p.judul) +
        '</div>' +
        '<div class="op-card__body">' +
        '<div class="op-card__examples">' +
        p.contoh
          .map(function (c) {
            return '<span>' + esc(c) + '</span>';
          })
          .join('') +
        '</div>' +
        '<div class="op-card__formula">' +
        esc(p.formula) +
        '</div>' +
        (revealed
          ? '<div class="op-card__rule">' +
            p.aturan +
            '</div>' +
            '<div class="op-card__arah">' +
            esc(p.arah) +
            '</div>' +
            '<div class="op-card__ingatan">' +
            esc(p.ingatan) +
            '</div>'
          : '<div class="btn-group btn-group--center" style="margin-top:var(--space-3);">' +
            '<button type="button" class="btn btn--outline-primary btn--small" data-reveal-pola="' +
            i +
            '">Lihat Aturan →</button>' +
            '</div>') +
        '</div></div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Pola Operasi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 3 — POLA OPERASI</span>' +
    '<p class="stage-head__goal">Tujuan: Menemukan dan memahami aturan operasi bilangan bulat.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);">' +
    DATA.polaOperasi.instruction +
    '</p>' +
    '<div class="op-cards-grid">' +
    cardsHTML +
    '</div>' +
    (allRevealed
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="polaFinishBtn">Lanjut: Latihan →</button>' +
        '</div>'
      : '<p style="text-align:center;font-size:0.85rem;color:var(--color-ink-muted);margin-top:var(--space-3);">Buka semua ' +
        pola.length +
        ' kartu untuk melanjutkan.</p>') +
    '</div></section>';

  container.querySelectorAll('[data-reveal-pola]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = parseInt(btn.dataset.revealPola, 10);
      State.polaRevealed[i] = true;
      saveState();
      renderPolaOperasi(container);
    });
  });

  var finBtn = document.getElementById('polaFinishBtn');
  if (finBtn) {
    finBtn.addEventListener('click', function () {
      completeStage('polaOperasi');
      navigateTo('latihanOperasi');
    });
  }
}

/* ============================================================
   9. STAGE: LATIHAN OPERASI
   ============================================================ */

var latihanOperasiExercise = createNumericInputExercise({
  soal: DATA.latihanOperasi.soal,
  getExercises: function () {
    return State.latihanExercises;
  },
  getIndex: function () {
    return State.latihanIdx;
  },
  setIndex: function (i) {
    State.latihanIdx = i;
  },
  save: saveState,
  checkValue: function (s) {
    return s.answer;
  },
  renderPrompt: function (s) {
    return '<div class="ex-expr">' + esc(s.ekspresi) + ' = ?</div>';
  },
  revealText: function (s) {
    return '<strong>Jawaban:</strong> ' + s.answer + '. ' + s.explanation;
  },
  idPrefix: 'latihan',
  wrapClass: 'ex-row',
  inputPlaceholder: 'Jawabanmu…',
  inputAriaLabel: 'Hasil operasi',
  stripPunctuation: true,
  revealButtonStyle: 'separate',
  countAttemptOnInvalid: true,
  emptyMessage: 'Masukkan bilangan bulat yang valid.',
  invalidMessage: 'Masukkan bilangan bulat yang valid.',
  sectionLabel: 'Latihan Operasi',
  kicker: 'TAHAP 4 — LATIHAN OPERASI',
  goal: 'Menghitung operasi penjumlahan dan pengurangan bilangan bulat dengan tepat.',
  instruction: DATA.latihanOperasi.instruction,
  nextStageId: 'masalahKontekstual',
  completeStageId: 'latihanOperasi',
  nextButtonLabel: 'Lanjut: Masalah Kontekstual →',
});

function renderLatihanOperasi(container) {
  latihanOperasiExercise.render(container);
  var inp = document.getElementById('latihanInput');
  if (inp) inp.focus();
}

/* ============================================================
   10. STAGE: MASALAH KONTEKSTUAL
   ============================================================ */

function renderMasalah(container) {
  var soal = DATA.masalahKontekstual.soal;
  var idx = State.masalahIdx;
  var exArr = State.masalahExercises;
  var s = soal[idx];
  var ex = exArr[idx];

  var allDoneOrRevealed =
    exArr.filter(function (e) {
      return e.correct || e.revealed || e.chosen;
    }).length === soal.length;

  var statuses = exArr.map(function (e) {
    if (e.correct) return 'correct';
    if (e.attempts > 0 || e.chosen) return 'incorrect';
    return null;
  });
  var dotsHTML = buildProgressDots(soal.length, idx, statuses);

  /* Problem card */
  var problemHTML =
    '<div class="panel panel--hero" style="margin-bottom:var(--space-3);">' +
    '<span class="badge-chip">' +
    esc(s.badge) +
    '</span>' +
    '<div style="display:flex;gap:var(--space-3);align-items:flex-start;flex-wrap:wrap;margin-bottom:var(--space-3);">' +
    '<span style="font-size:1.6rem;" aria-hidden="true">' +
    s.icon +
    '</span>' +
    '<div style="flex:1;min-width:0;">' +
    '<p style="font-size:0.95rem;margin:0;">' +
    s.story +
    '</p>' +
    '</div></div>' +
    '<p style="font-weight:700;font-size:0.95rem;margin:0;">' +
    s.question +
    '</p>' +
    '</div>';

  /* Answer area */
  var answerHTML = '';
  var feedbackHTML = '';

  if (s.type === 'input') {
    if (!ex.correct && !ex.revealed) {
      answerHTML =
        '<div class="ex-input-row">' +
        '<input type="text" inputmode="numeric" id="masalahInput" class="input-text" placeholder="Jawabanmu…" ' +
        'aria-label="Jawaban" value="' +
        esc(ex.userInput) +
        '">' +
        (s.unit
          ? '<span style="font-size:0.88rem;color:var(--color-ink-muted);">' +
            esc(s.unit) +
            '</span>'
          : '') +
        '<button type="button" class="btn btn--primary" id="masalahCheckBtn">Periksa</button>' +
        '<button type="button" class="btn btn--ghost btn--small" id="masalahHintBtn">💡 Petunjuk</button>' +
        (ex.attempts >= 2
          ? '<button type="button" class="btn btn--ghost btn--small" id="masalahRevealBtn">Lihat Jawaban</button>'
          : '') +
        '</div>';
    }
    if (ex.correct) {
      feedbackHTML =
        buildFeedbackBox('success', '✓', '<strong>Tepat!</strong> ' + s.explanation) +
        (s.langkah
          ? "<p style='font-weight:600;margin:var(--space-3) 0 var(--space-2);font-size:0.88rem;'>Langkah penyelesaian:</p>" +
            buildStepsHTML(s.langkah)
          : '');
    } else if (ex.revealed) {
      feedbackHTML =
        buildFeedbackBox(
          'info',
          '👁',
          '<strong>Jawaban:</strong> ' + s.answer + ' ' + (s.unit || '') + '. ' + s.explanation
        ) +
        (s.langkah
          ? "<p style='font-weight:600;margin:var(--space-3) 0 var(--space-2);font-size:0.88rem;'>Langkah penyelesaian:</p>" +
            buildStepsHTML(s.langkah)
          : '');
    } else if (ex.hintShown) {
      feedbackHTML = buildFeedbackBox('warning', '💡', '<strong>Petunjuk:</strong> ' + s.hint);
    } else if (ex.attempts > 0) {
      feedbackHTML = buildFeedbackBox(
        'error',
        '✗',
        'Jawabanmu <strong>' + esc(ex.userInput) + '</strong> belum tepat. Coba lagi.'
      );
    }
  } else {
    /* Multiple choice */
    var done = ex.chosen !== null;
    var optLetters = ['A', 'B', 'C', 'D', 'E'];
    var choicesHTML = s.options
      .map(function (opt, oi) {
        var cls = 'choice-btn';
        if (done) {
          if (opt.id === s.correct) cls += ' choice-btn--correct';
          else if (opt.id === ex.chosen) cls += ' choice-btn--incorrect';
          else cls += ' choice-btn--disabled';
        }
        return (
          '<button type="button" class="' +
          cls +
          '" data-opt="' +
          opt.id +
          '">' +
          '<span class="choice-letter">' +
          optLetters[oi] +
          '</span>' +
          esc(opt.label) +
          '</button>'
        );
      })
      .join('');
    answerHTML = '<div class="choice-list">' + choicesHTML + '</div>';

    if (done) {
      if (ex.correct) {
        feedbackHTML = buildFeedbackBox('success', '✓', '<strong>Tepat!</strong> ' + s.explanation);
      } else {
        feedbackHTML = buildFeedbackBox(
          'error',
          '✗',
          '<strong>Belum tepat.</strong> ' + s.explanation
        );
      }
    }
  }

  /* Navigation */
  var navHTML = '';
  var isDone = s.type === 'input' ? ex.correct || ex.revealed : ex.chosen !== null;
  if (isDone && idx < soal.length - 1) {
    navHTML =
      '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="masalahNextBtn">Soal Berikutnya →</button></div>';
  } else if (allDoneOrRevealed) {
    navHTML =
      '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
      '<button type="button" class="btn btn--primary btn--large" id="masalahFinishBtn">Lanjut: Tantangan →</button>' +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="Masalah Kontekstual">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 5 — MASALAH KONTEKSTUAL</span>' +
    '<p class="stage-head__goal">Tujuan: Menerapkan operasi bilangan bulat dalam masalah nyata perubahan nilai.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">' +
    DATA.masalahKontekstual.instruction +
    '</p>' +
    dotsHTML +
    problemHTML +
    answerHTML +
    (feedbackHTML ? '<div style="margin-top:var(--space-3);">' + feedbackHTML + '</div>' : '') +
    '</div>' +
    navHTML +
    '</section>';

  /* Events */
  var inp = document.getElementById('masalahInput');
  var checkBtn = document.getElementById('masalahCheckBtn');
  if (inp && checkBtn) {
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') checkBtn.click();
    });
    checkBtn.addEventListener('click', function () {
      var parsed = parseInputInt(inp.value, true);
      ex.userInput = inp.value;
      ex.attempts++;
      if (parsed.error) {
        showNotice('Masukkan bilangan bulat yang valid.');
        saveState();
        return;
      }
      if (parsed.value === s.answer) ex.correct = true;
      saveState();
      renderMasalah(container);
    });
  }

  var hintBtn = document.getElementById('masalahHintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      ex.hintShown = true;
      saveState();
      renderMasalah(container);
    });
  }

  var revealBtn = document.getElementById('masalahRevealBtn');
  if (revealBtn) {
    revealBtn.addEventListener('click', function () {
      ex.revealed = true;
      saveState();
      renderMasalah(container);
    });
  }

  container.querySelectorAll('[data-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (ex.chosen !== null) return;
      var chosen = btn.dataset.opt;
      ex.chosen = chosen;
      ex.correct = chosen === s.correct;
      ex.attempts++;
      saveState();
      renderMasalah(container);
    });
  });

  var nextBtn = document.getElementById('masalahNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      State.masalahIdx++;
      saveState();
      renderMasalah(container);
    });
  }

  var finBtn = document.getElementById('masalahFinishBtn');
  if (finBtn) {
    finBtn.addEventListener('click', function () {
      completeStage('masalahKontekstual');
      navigateTo('tantangan');
    });
  }

  if (inp) inp.focus();
}

/* ============================================================
   11. STAGE: TANTANGAN
   ============================================================ */

function renderTantangan(container) {
  var soal = DATA.tantangan.soal;
  var idx = State.tantanganIdx;
  var exArr = State.tantanganExercises;
  var s = soal[idx];
  var ex = exArr[idx];

  var allDoneOrRevealed =
    exArr.filter(function (e) {
      return e.correct || e.revealed || e.chosen;
    }).length === soal.length;

  var statuses = exArr.map(function (e) {
    if (e.correct) return 'correct';
    if (e.attempts > 0 || e.chosen) return 'incorrect';
    return null;
  });
  var dotsHTML = buildProgressDots(soal.length, idx, statuses);

  /* Problem card with steps display */
  var stepsPreviewHTML = '';
  if (s.langkah) {
    stepsPreviewHTML =
      '<div style="margin-top:var(--space-3);font-size:0.82rem;color:var(--color-ink-muted);">' +
      '<strong>Petunjuk perjalanan:</strong> ' +
      s.langkah
        .map(function (l) {
          return esc(l);
        })
        .join(' → ') +
      '</div>';
  }

  var problemHTML =
    '<div class="panel panel--hero" style="margin-bottom:var(--space-3);">' +
    '<span class="badge-chip">' +
    esc(s.badge) +
    '</span>' +
    '<div style="display:flex;gap:var(--space-3);align-items:flex-start;flex-wrap:wrap;margin-bottom:var(--space-3);">' +
    '<span style="font-size:1.8rem;" aria-hidden="true">' +
    s.icon +
    '</span>' +
    '<div style="flex:1;min-width:0;">' +
    '<p style="font-size:0.95rem;margin:0;">' +
    s.story +
    '</p>' +
    '</div></div>' +
    '<p style="font-weight:700;font-size:0.95rem;margin:0;">' +
    s.question +
    '</p>' +
    '</div>';

  /* Answer area */
  var answerHTML = '';
  var feedbackHTML = '';

  if (s.type === 'input') {
    if (!ex.correct && !ex.revealed) {
      answerHTML =
        '<div class="ex-input-row">' +
        '<input type="text" inputmode="numeric" id="tantanganInput" class="input-text" placeholder="Jawabanmu…" ' +
        'aria-label="Jawaban tantangan" value="' +
        esc(ex.userInput) +
        '">' +
        (s.unit
          ? '<span style="font-size:0.82rem;color:var(--color-ink-muted);">' +
            esc(s.unit) +
            '</span>'
          : '') +
        '<button type="button" class="btn btn--primary" id="tantanganCheckBtn">Periksa</button>' +
        '<button type="button" class="btn btn--ghost btn--small" id="tantanganHintBtn">💡 Petunjuk</button>' +
        (ex.attempts >= 2
          ? '<button type="button" class="btn btn--ghost btn--small" id="tantanganRevealBtn">Lihat Jawaban</button>'
          : '') +
        '</div>';
    }
    if (ex.correct) {
      feedbackHTML =
        buildFeedbackBox('success', '✓', '<strong>Luar biasa!</strong> ' + s.explanation) +
        "<p style='font-weight:600;margin:var(--space-3) 0 var(--space-2);font-size:0.88rem;'>Langkah penyelesaian:</p>" +
        buildStepsHTML(s.langkah);
    } else if (ex.revealed) {
      feedbackHTML =
        buildFeedbackBox(
          'info',
          '👁',
          '<strong>Jawaban:</strong> ' + s.answer + '. ' + s.explanation
        ) +
        "<p style='font-weight:600;margin:var(--space-3) 0 var(--space-2);font-size:0.88rem;'>Langkah penyelesaian:</p>" +
        buildStepsHTML(s.langkah);
    } else if (ex.hintShown) {
      feedbackHTML = buildFeedbackBox('warning', '💡', '<strong>Petunjuk:</strong> ' + s.hint);
    } else if (ex.attempts > 0) {
      feedbackHTML = buildFeedbackBox(
        'error',
        '✗',
        'Jawabanmu <strong>' + esc(ex.userInput) + '</strong> belum tepat. Coba lagi.'
      );
    }
  } else {
    var done = ex.chosen !== null;
    var optLetters = ['A', 'B', 'C', 'D'];
    var choicesHTML = s.options
      .map(function (opt, oi) {
        var cls = 'choice-btn';
        if (done) {
          if (opt.id === s.correct) cls += ' choice-btn--correct';
          else if (opt.id === ex.chosen) cls += ' choice-btn--incorrect';
          else cls += ' choice-btn--disabled';
        }
        return (
          '<button type="button" class="' +
          cls +
          '" data-opt="' +
          opt.id +
          '">' +
          '<span class="choice-letter">' +
          optLetters[oi] +
          '</span>' +
          esc(opt.label) +
          '</button>'
        );
      })
      .join('');
    answerHTML = '<div class="choice-list">' + choicesHTML + '</div>';

    if (done) {
      feedbackHTML = ex.correct
        ? buildFeedbackBox('success', '✓', '<strong>Luar biasa!</strong> ' + s.explanation) +
          "<p style='font-weight:600;margin:var(--space-3) 0 var(--space-2);font-size:0.88rem;'>Langkah penyelesaian:</p>" +
          buildStepsHTML(s.langkah)
        : buildFeedbackBox('error', '✗', '<strong>Belum tepat.</strong> ' + s.explanation) +
          "<p style='font-weight:600;margin:var(--space-3) 0 var(--space-2);font-size:0.88rem;'>Langkah penyelesaian:</p>" +
          buildStepsHTML(s.langkah);
    }
  }

  /* Navigation */
  var navHTML = '';
  var isDone = s.type === 'input' ? ex.correct || ex.revealed : ex.chosen !== null;
  if (isDone && idx < soal.length - 1) {
    navHTML =
      '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="tantanganNextBtn">Soal Berikutnya →</button></div>';
  } else if (allDoneOrRevealed) {
    navHTML =
      '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
      '<button type="button" class="btn btn--primary btn--large" id="tantanganFinishBtn">Lanjut: Refleksi →</button>' +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="Tantangan">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 6 — TANTANGAN</span>' +
    '<p class="stage-head__goal">Tujuan: Menerapkan operasi bilangan bulat dalam masalah perubahan nilai berantai.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">' +
    DATA.tantangan.instruction +
    '</p>' +
    dotsHTML +
    problemHTML +
    answerHTML +
    (feedbackHTML ? '<div style="margin-top:var(--space-3);">' + feedbackHTML + '</div>' : '') +
    '</div>' +
    navHTML +
    '</section>';

  /* Events */
  var inp = document.getElementById('tantanganInput');
  var checkBtn = document.getElementById('tantanganCheckBtn');
  if (inp && checkBtn) {
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') checkBtn.click();
    });
    checkBtn.addEventListener('click', function () {
      var parsed = parseInputInt(inp.value, true);
      ex.userInput = inp.value;
      ex.attempts++;
      if (parsed.error) {
        showNotice('Masukkan bilangan bulat yang valid.');
        saveState();
        return;
      }
      if (parsed.value === s.answer) ex.correct = true;
      saveState();
      renderTantangan(container);
    });
  }

  var hintBtn = document.getElementById('tantanganHintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      ex.hintShown = true;
      saveState();
      renderTantangan(container);
    });
  }

  var revealBtn = document.getElementById('tantanganRevealBtn');
  if (revealBtn) {
    revealBtn.addEventListener('click', function () {
      ex.revealed = true;
      saveState();
      renderTantangan(container);
    });
  }

  container.querySelectorAll('[data-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (ex.chosen !== null) return;
      var chosen = btn.dataset.opt;
      ex.chosen = chosen;
      ex.correct = chosen === s.correct;
      ex.attempts++;
      saveState();
      renderTantangan(container);
    });
  });

  var nextBtn = document.getElementById('tantanganNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      State.tantanganIdx++;
      saveState();
      renderTantangan(container);
    });
  }

  var finBtn = document.getElementById('tantanganFinishBtn');
  if (finBtn) {
    finBtn.addEventListener('click', function () {
      completeStage('tantangan');
      navigateTo('refleksi');
    });
  }

  if (inp) inp.focus();
}

/* ============================================================
   12. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var refleksiSoal = DATA.refleksi.soal;

  var questionsHTML = refleksiSoal
    .map(function (r) {
      var saved = State.refleksiAnswers[r.id] || '';
      return (
        '<div class="panel panel--compact" style="margin-bottom:var(--space-3);">' +
        '<p style="font-weight:600;font-size:0.92rem;margin-bottom:var(--space-2);">' +
        r.question +
        '</p>' +
        '<textarea class="input-textarea" id="refleksi_' +
        r.id +
        '" placeholder="' +
        esc(r.placeholder) +
        '" rows="3">' +
        esc(saved) +
        '</textarea>' +
        '</div>'
      );
    })
    .join('');

  var savedNotice = State.refleksiSaved
    ? '<div class="feedback-box feedback-box--success" style="margin-bottom:var(--space-3);">' +
      '<span class="feedback-box__icon">✓</span>' +
      '<div class="feedback-box__body">Refleksimu telah disimpan. Kamu bisa melanjutkan ke tahap berikutnya.</div>' +
      '</div>'
    : '';

  container.innerHTML =
    '<section aria-label="Refleksi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 7 — REFLEKSI</span>' +
    '<p class="stage-head__goal">Tujuan: Merangkum dan merefleksikan pemahaman tentang operasi bilangan bulat.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);">' +
    DATA.refleksi.note +
    '</p>' +
    savedNotice +
    questionsHTML +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="refleksiSaveBtn">Simpan Refleksi</button>' +
    (State.refleksiSaved
      ? '<button type="button" class="btn btn--primary btn--large" id="refleksiFinishBtn">Lanjut: Selesai →</button>'
      : '') +
    '</div>' +
    '</div></section>';

  document.getElementById('refleksiSaveBtn').addEventListener('click', function () {
    refleksiSoal.forEach(function (r) {
      var el = document.getElementById('refleksi_' + r.id);
      if (el) State.refleksiAnswers[r.id] = el.value;
    });
    State.refleksiSaved = true;
    saveState();
    renderRefleksi(container);
    showNotice('Refleksi tersimpan!');
  });

  var finBtn = document.getElementById('refleksiFinishBtn');
  if (finBtn) {
    finBtn.addEventListener('click', function () {
      completeStage('refleksi');
      navigateTo('selesai');
    });
  }
}

/* ============================================================
   13. STAGE: SELESAI
   ============================================================ */

function renderSelesai(container) {
  var latihanDone = State.latihanExercises.filter(function (e) {
    return e.correct;
  }).length;
  var masalahDone = State.masalahExercises.filter(function (e) {
    return e.correct;
  }).length;
  var tantanganDone = State.tantanganExercises.filter(function (e) {
    return e.correct;
  }).length;
  var eksplorasiDone = State.eksplorasiRevealed.filter(Boolean).length;

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 8 — SELESAI</span>' +
    '<p class="stage-head__goal">Kamu telah menyelesaikan media pembelajaran ini!</p>' +
    '</div>' +
    '<div class="panel panel--hero">' +
    '<h2 style="font-size:1.6rem;">🎉 Selamat!</h2>' +
    '<p>Kamu telah menyelesaikan seluruh tahap media pembelajaran <strong>Penjumlahan dan Pengurangan Bilangan Bulat</strong>. Berikut ringkasan pencapaianmu:</p>' +
    '<div class="achievement-grid">' +
    '<div class="achievement-card">' +
    '<div class="achievement-card__icon">🔍</div>' +
    '<div class="achievement-card__title">Eksplorasi</div>' +
    '<div class="achievement-card__desc">' +
    eksplorasiDone +
    ' dari ' +
    DATA.eksplorasi.konteks.length +
    ' konteks dijelajahi</div>' +
    '</div>' +
    '<div class="achievement-card">' +
    '<div class="achievement-card__icon">🧮</div>' +
    '<div class="achievement-card__title">Latihan Operasi</div>' +
    '<div class="achievement-card__desc">' +
    latihanDone +
    ' dari ' +
    DATA.latihanOperasi.soal.length +
    ' soal dijawab benar</div>' +
    '</div>' +
    '<div class="achievement-card">' +
    '<div class="achievement-card__icon">📚</div>' +
    '<div class="achievement-card__title">Masalah Kontekstual</div>' +
    '<div class="achievement-card__desc">' +
    masalahDone +
    ' dari ' +
    DATA.masalahKontekstual.soal.length +
    ' masalah diselesaikan</div>' +
    '</div>' +
    '<div class="achievement-card">' +
    '<div class="achievement-card__icon">🏆</div>' +
    '<div class="achievement-card__title">Tantangan</div>' +
    '<div class="achievement-card__desc">' +
    tantanganDone +
    ' dari ' +
    DATA.tantangan.soal.length +
    ' tantangan diselesaikan</div>' +
    '</div>' +
    '</div></div>' +
    '<div class="panel panel--compact panel--info">' +
    '<h3>Apa yang sudah kamu pelajari?</h3>' +
    '<ul>' +
    '<li>Penjumlahan bilangan bulat = <strong>gerakan ke kanan</strong> pada garis bilangan (jika nilai positif) atau <strong>ke kiri</strong> (jika nilai negatif)</li>' +
    '<li>Pengurangan bilangan bulat = <strong>gerakan ke kiri</strong> pada garis bilangan (jika pengurang positif) atau <strong>ke kanan</strong> (jika pengurang negatif)</li>' +
    '<li>Aturan penting: <strong>a − (−b) = a + b</strong></li>' +
    '<li>Operasi ini dapat diterapkan dalam berbagai konteks: suhu, saldo, ketinggian, skor, dan perubahan nilai lainnya</li>' +
    '</ul>' +
    '</div>' +
    '<div class="panel panel--compact panel--warning">' +
    '<p style="margin:0;font-size:0.88rem;color:var(--color-warning-strong);">' +
    '<strong>Langkah Berikutnya:</strong> Diskusikan dengan gurumu tentang konsep yang masih kurang jelas, dan lanjutkan latihan soal untuk memperkuat pemahamanmu.' +
    '</p></div>' +
    '<div class="btn-group btn-group--end">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '</div></section>';

  completeStage('selesai');
}

/* ============================================================
   14. INIT
   ============================================================ */

(function init() {
  loadState();
  initStateArrays();

  buildStageNav();
  updateProgress();
  renderCurrentStage();

  /* Reset button */
  var resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (!window.confirm('Reset semua progress? Semua jawaban dan refleksi akan terhapus.'))
        return;
      clearState();
      buildStageNav();
      updateProgress();
      renderCurrentStage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
