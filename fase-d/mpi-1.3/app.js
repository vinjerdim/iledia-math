'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Perkalian dan Pembagian Bilangan Bulat — Fase D SMP

   Utilitas bersama (esc, parseInputInt, showNotice, builder render,
   mesin navigasi tahap) berada di shared/engine.js.

   Bagian:
    1. Utilitas
    2. Konstanta
    3. State & Storage
    4. Navigasi
    5. Utilitas Render
    6. Stage: Orientasi
    7. Stage: Eksplorasi Perkalian
    8. Stage: Aturan Tanda
    9. Stage: Latihan Perkalian
   10. Stage: Eksplorasi Pembagian
   11. Stage: Latihan Pembagian
   12. Stage: Estimasi
   13. Stage: Tantangan
   14. Stage: Refleksi
   15. Stage: Selesai
   16. Init
   ============================================================ */

/* ============================================================
   1. UTILITAS
   ============================================================ */

function formatNumber(n) {
  var s = String(Math.abs(n));
  var parts = [];
  while (s.length > 3) {
    parts.unshift(s.slice(s.length - 3));
    s = s.slice(0, s.length - 3);
  }
  if (s) parts.unshift(s);
  return (n < 0 ? '−' : '') + parts.join('.');
}

/* ============================================================
   2. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'eksplorasiKali',
  'aturanTanda',
  'latihanKali',
  'eksplorasiBagi',
  'latihanBagi',
  'estimasi',
  'tantangan',
  'refleksi',
  'selesai',
];

var STAGE_LABELS = [
  'Orientasi',
  'Eksplorasi ×',
  'Aturan Tanda',
  'Latihan ×',
  'Eksplorasi ÷',
  'Latihan ÷',
  'Estimasi',
  'Tantangan',
  'Refleksi',
  'Selesai',
];

var STORAGE_KEY = 'mpi-d-1-3-kali-bagi-v1';

/* ============================================================
   3. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Eksplorasi Perkalian */
  eksplorasiKaliIdx: 0,
  eksplorasiKaliRevealed: [false, false, false],

  /* Aturan Tanda */
  aturanTandaRevealed: [false, false, false, false],
  aturanTandaSummaryShown: false,

  /* Latihan Perkalian */
  latihanKaliIdx: 0,
  latihanKaliExercises: [],

  /* Eksplorasi Pembagian */
  eksplorasiBagiRevealed: [false, false, false, false],
  eksplorasiBagiRingkasanShown: false,

  /* Latihan Pembagian */
  latihanBagiIdx: 0,
  latihanBagiExercises: [],

  /* Estimasi */
  estimasiIdx: 0,
  estimasiExercises: [],

  /* Tantangan */
  tantanganIdx: 0,
  tantanganExercises: [],

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
  State.eksplorasiKaliIdx = 0;
  State.eksplorasiKaliRevealed = [false, false, false];
  State.aturanTandaRevealed = [false, false, false, false];
  State.aturanTandaSummaryShown = false;
  State.latihanKaliIdx = 0;
  State.latihanKaliExercises = [];
  State.eksplorasiBagiRevealed = [false, false, false, false];
  State.eksplorasiBagiRingkasanShown = false;
  State.latihanBagiIdx = 0;
  State.latihanBagiExercises = [];
  State.estimasiIdx = 0;
  State.estimasiExercises = [];
  State.tantanganIdx = 0;
  State.tantanganExercises = [];
  State.refleksiAnswers = {};
  State.refleksiSaved = false;
  initExerciseArrays();
}

function initExerciseArrays() {
  var emptyExercise = function () {
    return { attempts: 0, hintIdx: 0, correct: false, userInput: '', chosen: null };
  };

  if (
    !State.latihanKaliExercises ||
    State.latihanKaliExercises.length !== DATA.latihanKali.soal.length
  ) {
    State.latihanKaliExercises = DATA.latihanKali.soal.map(emptyExercise);
  }
  if (
    !State.latihanBagiExercises ||
    State.latihanBagiExercises.length !== DATA.latihanBagi.soal.length
  ) {
    State.latihanBagiExercises = DATA.latihanBagi.soal.map(emptyExercise);
  }
  if (!State.estimasiExercises || State.estimasiExercises.length !== DATA.estimasi.soal.length) {
    State.estimasiExercises = DATA.estimasi.soal.map(emptyExercise);
  }
  if (!State.tantanganExercises || State.tantanganExercises.length !== DATA.tantangan.soal.length) {
    State.tantanganExercises = DATA.tantangan.soal.map(emptyExercise);
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

function buildExprNum(val) {
  var isNeg = val < 0;
  var display = isNeg ? '(' + formatNumber(val) + ')' : esc(String(val));
  return '<span class="expr-num' + (isNeg ? ' expr-num--neg' : '') + '">' + display + '</span>';
}

/* Build an animated array grid for perkalian visualization */
function buildArrayGrid(rows, cols, mode) {
  var html = '<div class="array-grid">';
  for (var r = 0; r < rows; r++) {
    html += '<div class="array-grid__row">';
    for (var c = 0; c < cols; c++) {
      var cls = 'array-grid__cell';
      if (mode === 'pos') cls += ' array-grid__cell--pos';
      else if (mode === 'neg') cls += ' array-grid__cell--neg';
      else if (mode === 'remove') cls += ' array-grid__cell--remove';
      html += '<div class="' + cls + '" data-delay="' + (r * cols + c) + '"></div>';
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function animateGrid(wrap) {
  var cells = wrap.querySelectorAll('.array-grid__cell');
  cells.forEach(function (cell) {
    var delay = parseInt(cell.dataset.delay, 10) * 60;
    setTimeout(function () {
      cell.classList.add('array-grid__cell--visible');
    }, delay);
  });
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
    case 'eksplorasiKali':
      renderEksplorasiKali(container);
      break;
    case 'aturanTanda':
      renderAturanTanda(container);
      break;
    case 'latihanKali':
      renderLatihanKali(container);
      break;
    case 'eksplorasiBagi':
      renderEksplorasiBagi(container);
      break;
    case 'latihanBagi':
      renderLatihanBagi(container);
      break;
    case 'estimasi':
      renderEstimasi(container);
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
    '<span class="stage-head__kicker">TAHAP 1 — MEMAHAMI KONTEKS</span>' +
    '<p class="stage-head__goal">Tujuan: ' +
    esc(DATA.meta.goal) +
    '</p>' +
    '</div>' +
    '<div class="panel panel--hero">' +
    '<h2>' +
    esc(DATA.meta.title) +
    '</h2>' +
    '<p style="font-size:1.05rem;"><strong>Bilangan bulat ada di mana-mana!</strong> Suhu yang turun, saldo yang berkurang, lantai basement — semua bisa dinyatakan dengan bilangan negatif. Sekarang kita akan belajar <em>mengalikan</em> dan <em>membagi</em> bilangan-bilangan tersebut, serta menggunakannya untuk <strong>memperkirakan (estimasi)</strong>.</p>' +
    '<div class="panel panel--info" style="margin-bottom:0;">' +
    '<h3 style="margin-bottom:var(--space-2);">Dalam media ini kamu akan:</h3>' +
    '<ol class="objectives-list">' +
    '<li><span class="objectives-list__num">1</span>Memahami arti perkalian bilangan bulat melalui situasi nyata.</li>' +
    '<li><span class="objectives-list__num">2</span>Menemukan <strong>aturan tanda</strong> pada perkalian dan pembagian.</li>' +
    '<li><span class="objectives-list__num">3</span>Menghitung hasil perkalian dan pembagian bilangan bulat.</li>' +
    '<li><span class="objectives-list__num">4</span>Menyelesaikan <strong>masalah estimasi sederhana</strong> menggunakan perkalian/pembagian.</li>' +
    '</ol></div></div>' +
    '<div class="panel panel--compact">' +
    '<h3>Perkalian Bilangan Bulat di Sekitar Kita</h3>' +
    '<div class="hero-steps">' +
    '<div class="hero-steps__item"><span class="hero-steps__num">🌡️</span>Suhu turun 3°C setiap jam selama 5 jam → <strong>5 × (−3) = −15°C</strong></div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">💳</span>Rugi Rp 10.000 per hari selama 8 hari → <strong>8 × (−10.000) = −Rp 80.000</strong></div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">🏊</span>Penyelam turun 4 meter per menit selama 6 menit → <strong>6 × (−4) = −24 meter</strong></div>' +
    '</div></div>' +
    '<div class="panel panel--compact">' +
    '<h3>Cara Menggunakan Media Ini</h3>' +
    '<div class="hero-steps">' +
    '<div class="hero-steps__item"><span class="hero-steps__num">1</span>Kerjakan tahap dari kiri ke kanan. Setiap tahap harus diselesaikan sebelum lanjut.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">2</span>Tekan <strong>Periksa</strong> untuk memeriksa jawabanmu, <strong>Petunjuk</strong> untuk bantuan.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">3</span>Baca umpan balik dengan teliti. Progress tersimpan otomatis di browser ini.</div>' +
    '</div></div>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary btn--large" id="startBtn">Mulai Eksplorasi →</button>' +
    '</div></section>';

  document.getElementById('startBtn').addEventListener('click', function () {
    completeStage('orientasi');
    navigateTo('eksplorasiKali');
  });
}

/* ============================================================
   7. STAGE: EKSPLORASI PERKALIAN
   ============================================================ */

function renderEksplorasiKali(container) {
  var d = DATA.eksplorasiKali;
  var idx = State.eksplorasiKaliIdx;
  var ctx = d.konteks[idx];
  var total = d.konteks.length;
  var allDone = State.eksplorasiKaliRevealed.every(function (v) {
    return v;
  });

  /* Progress dots */
  var statuses = State.eksplorasiKaliRevealed.map(function (v) {
    return v ? 'correct' : null;
  });
  var dotsHtml = buildProgressDots(total, idx, statuses);

  /* Array grid */
  var gridHtml = buildArrayGrid(ctx.rows, ctx.cols, ctx.mode);

  /* Caption */
  var captionCls = 'array-grid-caption' + (ctx.hasilNegatif ? ' array-grid-caption--neg' : '');

  var isRevealed = State.eksplorasiKaliRevealed[idx];

  container.innerHTML =
    '<section aria-label="Eksplorasi Perkalian">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 2 — EKSPLORASI PERKALIAN</span>' +
    '<h2>' +
    esc(d.title) +
    '</h2>' +
    '<p class="stage-head__instruction">' +
    d.instruction +
    '</p>' +
    '</div>' +
    dotsHtml +
    '<div class="eksplorasi-card">' +
    '<div class="eksplorasi-card__head">' +
    '<span class="eksplorasi-card__icon">' +
    ctx.icon +
    '</span>' +
    '<div class="eksplorasi-card__meta">' +
    '<span class="eksplorasi-card__badge">' +
    esc(ctx.badge) +
    '</span>' +
    '<p class="eksplorasi-card__title">' +
    ctx.ekspresi +
    ' = ?</p>' +
    '</div></div>' +
    '<div class="eksplorasi-card__body">' +
    '<p class="eksplorasi-card__story">' +
    ctx.story +
    '</p>' +
    '<div class="array-grid-wrap" id="arrayGridWrap">' +
    '<div style="text-align:center;">' +
    gridHtml +
    '</div>' +
    (isRevealed
      ? '<p class="' +
        captionCls +
        '">' +
        ctx.ekspresi +
        ' = ' +
        formatNumber(ctx.hasil) +
        ' ' +
        esc(ctx.unit) +
        '</p>'
      : '<p style="text-align:center;color:var(--color-ink-muted);font-size:0.9rem;margin:var(--space-3) 0 0;">Tekan tombol di bawah untuk mengungkap jawaban.</p>') +
    '</div>' +
    (isRevealed
      ? buildFeedbackBox(
          'success',
          '✅',
          '<strong>' +
            ctx.pertanyaan +
            '</strong><br>' +
            ctx.penjelasan +
            '<br><br><em>' +
            ctx.ruleSummary +
            '</em>'
        ) +
        '<div class="btn-group btn-group--end">' +
        (idx < total - 1
          ? '<button type="button" class="btn btn--primary" id="nextCtxBtn">Konteks Berikutnya →</button>'
          : '<button type="button" class="btn btn--primary" id="lanjutBtn">Lanjut ke Aturan Tanda →</button>') +
        '</div>'
      : '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="revealBtn">Ungkap Visualisasi</button></div>') +
    '</div></div>' +
    '</section>';

  if (!isRevealed) {
    document.getElementById('revealBtn').addEventListener('click', function () {
      State.eksplorasiKaliRevealed[idx] = true;
      saveState();
      renderEksplorasiKali(container);
      setTimeout(function () {
        var wrap = document.getElementById('arrayGridWrap');
        if (wrap) animateGrid(wrap);
      }, 50);
    });
  } else {
    /* Animate immediately if already revealed */
    setTimeout(function () {
      var wrap = document.getElementById('arrayGridWrap');
      if (wrap) animateGrid(wrap);
    }, 50);

    var nextBtn = document.getElementById('nextCtxBtn');
    var lanjutBtn = document.getElementById('lanjutBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        State.eksplorasiKaliIdx = idx + 1;
        saveState();
        renderEksplorasiKali(container);
      });
    }
    if (lanjutBtn) {
      lanjutBtn.addEventListener('click', function () {
        completeStage('eksplorasiKali');
        navigateTo('aturanTanda');
      });
    }
  }
}

/* ============================================================
   8. STAGE: ATURAN TANDA
   ============================================================ */

function renderAturanTanda(container) {
  var d = DATA.aturanTanda;
  var revealed = State.aturanTandaRevealed;
  var allRevealed = revealed.every(function (v) {
    return v;
  });

  var rowsHtml = d.baris
    .map(function (b, i) {
      var isRev = revealed[i];
      var signHtml;
      if (isRev) {
        var cls = 'sign-badge sign-badge--' + (b.mode === 'pos' ? 'pos' : 'neg');
        signHtml =
          '<span class="' + cls + '">' + b.tanda + esc(String(Math.abs(b.hasil))) + '</span>';
      } else {
        signHtml =
          '<span class="sign-badge sign-badge--hidden" role="button" tabindex="0" data-idx="' +
          i +
          '" title="Klik untuk ungkap">?</span>';
      }
      return (
        '<tr>' +
        '<td class="sign-table__example">' +
        esc(b.faktor1) +
        '</td>' +
        '<td class="sign-table__example">' +
        esc(b.faktor2) +
        '</td>' +
        '<td class="sign-table__example">' +
        esc(b.contoh) +
        '</td>' +
        '<td><span class="sign-table__result">' +
        signHtml +
        '</span></td>' +
        '</tr>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Aturan Tanda">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 3 — ATURAN TANDA</span>' +
    '<h2>' +
    esc(d.title) +
    '</h2>' +
    '<p class="stage-head__instruction">' +
    d.instruction +
    '</p>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<div class="sign-table-wrap">' +
    '<table class="sign-table" aria-label="Tabel aturan tanda perkalian">' +
    '<thead><tr>' +
    '<th>Faktor 1</th><th>Faktor 2</th><th>Contoh</th><th>Hasil (tanda)</th>' +
    '</tr></thead>' +
    '<tbody id="signTableBody">' +
    rowsHtml +
    '</tbody>' +
    '</table>' +
    '</div>' +
    '<div class="sign-rule-caption' +
    (allRevealed ? ' is-visible' : '') +
    '" id="ruleSummary">' +
    '💡 <strong>Pola yang kamu temukan:</strong> ' +
    d.ringkasan +
    '</div>' +
    (allRevealed
      ? '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="lanjutBtn">Lanjut ke Latihan Perkalian →</button></div>'
      : '<p style="font-size:0.9rem;color:var(--color-ink-muted);margin-top:var(--space-3);">Klik tiap sel abu-abu untuk mengungkap tanda hasilnya. (' +
        revealed.filter(function (v) {
          return v;
        }).length +
        '/4 terungkap)</p>') +
    '</div></section>';

  /* Click handlers on hidden badges */
  var badges = container.querySelectorAll('.sign-badge--hidden');
  badges.forEach(function (badge) {
    var activate = function () {
      var i = parseInt(badge.dataset.idx, 10);
      State.aturanTandaRevealed[i] = true;
      var allDone = State.aturanTandaRevealed.every(function (v) {
        return v;
      });
      if (allDone) State.aturanTandaSummaryShown = true;
      saveState();
      renderAturanTanda(container);
    };
    badge.addEventListener('click', activate);
    badge.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  var lanjutBtn = document.getElementById('lanjutBtn');
  if (lanjutBtn) {
    lanjutBtn.addEventListener('click', function () {
      completeStage('aturanTanda');
      navigateTo('latihanKali');
    });
  }
}

/* ============================================================
   9. STAGE: LATIHAN PERKALIAN
   ============================================================ */

function renderLatihanKali(container) {
  renderExerciseStage(container, {
    stageName: 'latihanKali',
    kicker: 'TAHAP 4 — LATIHAN PERKALIAN',
    data: DATA.latihanKali,
    stateIdx: 'latihanKaliIdx',
    stateExercises: 'latihanKaliExercises',
    nextStage: 'eksplorasiBagi',
    nextLabel: 'Lanjut ke Eksplorasi Pembagian →',
  });
}

/* ============================================================
   10. STAGE: EKSPLORASI PEMBAGIAN
   ============================================================ */

function renderEksplorasiBagi(container) {
  var d = DATA.eksplorasiBagi;
  var revealed = State.eksplorasiBagiRevealed;
  var allRevealed = revealed.every(function (v) {
    return v;
  });

  var pairsHtml = d.pasangan
    .map(function (p, i) {
      var isRev = revealed[i];
      return (
        '<div class="invers-pair">' +
        '<span class="invers-pair__kali">' +
        esc(p.kali) +
        '</span>' +
        '<span class="invers-pair__arrow">↕</span>' +
        (isRev
          ? '<span class="invers-pair__bagi" style="' +
            (p.tanda === '−'
              ? 'background:var(--color-error-soft);color:var(--color-error-strong);'
              : '') +
            '">' +
            esc(p.bagi.replace('?', String(p.hasil_bagi))) +
            '</span>' +
            '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox('info', 'ℹ️', p.penjelasan) +
            '</div>'
          : '<button type="button" class="btn btn--primary btn--small" data-idx="' +
            i +
            '" id="revealPair' +
            i +
            '">Ungkap ' +
            esc(p.bagi) +
            '</button>') +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Eksplorasi Pembagian">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 5 — EKSPLORASI PEMBAGIAN</span>' +
    '<h2>' +
    esc(d.title) +
    '</h2>' +
    '<p class="stage-head__instruction">' +
    d.instruction +
    '</p>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<div class="invers-display" id="inversPairs">' +
    pairsHtml +
    '</div>' +
    (allRevealed
      ? '<div class="sign-rule-caption is-visible">' +
        '💡 <strong>Kesimpulan:</strong> ' +
        d.ringkasan +
        '</div>' +
        '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="lanjutBtn">Lanjut ke Latihan Pembagian →</button></div>'
      : '<p style="font-size:0.9rem;color:var(--color-ink-muted);margin-top:var(--space-3);">Ungkap semua pasangan untuk melanjutkan. (' +
        revealed.filter(function (v) {
          return v;
        }).length +
        '/4 terungkap)</p>') +
    '</div></section>';

  d.pasangan.forEach(function (p, i) {
    var btn = document.getElementById('revealPair' + i);
    if (btn) {
      btn.addEventListener('click', function () {
        State.eksplorasiBagiRevealed[i] = true;
        if (
          State.eksplorasiBagiRevealed.every(function (v) {
            return v;
          })
        ) {
          State.eksplorasiBagiRingkasanShown = true;
        }
        saveState();
        renderEksplorasiBagi(container);
      });
    }
  });

  var lanjutBtn = document.getElementById('lanjutBtn');
  if (lanjutBtn) {
    lanjutBtn.addEventListener('click', function () {
      completeStage('eksplorasiBagi');
      navigateTo('latihanBagi');
    });
  }
}

/* ============================================================
   11. STAGE: LATIHAN PEMBAGIAN
   ============================================================ */

function renderLatihanBagi(container) {
  renderExerciseStage(container, {
    stageName: 'latihanBagi',
    kicker: 'TAHAP 6 — LATIHAN PEMBAGIAN',
    data: DATA.latihanBagi,
    stateIdx: 'latihanBagiIdx',
    stateExercises: 'latihanBagiExercises',
    nextStage: 'estimasi',
    nextLabel: 'Lanjut ke Estimasi →',
  });
}

/* ============================================================
   HELPER: Generic exercise stage (perkalian & pembagian)
   ============================================================ */

function renderExerciseStage(container, cfg) {
  var d = cfg.data;
  var idx = State[cfg.stateIdx];
  var exercises = State[cfg.stateExercises];
  var soal = d.soal[idx];
  var ex = exercises[idx];
  var total = d.soal.length;

  var statuses = exercises.map(function (e) {
    return e.correct ? 'correct' : e.attempts > 0 ? 'incorrect' : null;
  });
  var dotsHtml = buildProgressDots(total, idx, statuses);

  var aIsNeg = soal.a < 0;
  var bIsNeg = soal.b < 0;
  var exprHtml =
    '<div class="expr-display">' +
    buildExprNum(soal.a) +
    '<span class="expr-op">' +
    esc(soal.op) +
    '</span>' +
    buildExprNum(soal.b) +
    '<span class="expr-eq">=</span>' +
    '<input type="number" id="answerInput" class="input-text" style="max-width:120px;font-family:var(--font-mono);font-size:1.2rem;text-align:center;" placeholder="?" aria-label="Jawaban" value="' +
    esc(ex.userInput) +
    '">' +
    '</div>';

  var feedbackHtml = '';
  if (ex.correct) {
    feedbackHtml = buildFeedbackBox('success', '✅', '<strong>Benar!</strong> ' + soal.explanation);
  } else if (ex.attempts > 0) {
    feedbackHtml = buildFeedbackBox(
      'error',
      '❌',
      'Belum tepat. Coba periksa tanda hasilnya. (Percobaan ke-' + ex.attempts + ')'
    );
  }

  var hintHtml = '';
  if (ex.hintIdx > 0) {
    var shownHints = soal.hints.slice(0, ex.hintIdx);
    hintHtml = buildFeedbackBox(
      'warning',
      '💡',
      shownHints
        .map(function (h) {
          return '<p style="margin:0 0 var(--space-1)">' + h + '</p>';
        })
        .join('')
    );
  }

  var allDone = exercises.every(function (e) {
    return e.correct;
  });

  container.innerHTML =
    '<section aria-label="' +
    esc(cfg.kicker) +
    '">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">' +
    esc(cfg.kicker) +
    '</span>' +
    '<h2>' +
    esc(d.title) +
    '</h2>' +
    '<p class="stage-head__instruction">' +
    d.instruction +
    '</p>' +
    '</div>' +
    dotsHtml +
    '<div class="panel panel--compact">' +
    '<p style="font-size:0.95rem;margin-bottom:var(--space-3);"><strong>Soal ' +
    (idx + 1) +
    ':</strong> Hitung ' +
    esc(soal.ekspresi) +
    '</p>' +
    exprHtml +
    hintHtml +
    feedbackHtml +
    '<div class="btn-group">' +
    (!ex.correct
      ? '<button type="button" class="btn btn--primary" id="checkBtn">Periksa</button>'
      : '') +
    (ex.hintIdx < soal.hints.length && !ex.correct
      ? '<button type="button" class="btn btn--ghost" id="hintBtn">Petunjuk ' +
        (ex.hintIdx + 1) +
        '/' +
        soal.hints.length +
        '</button>'
      : '') +
    (ex.correct && idx < total - 1
      ? '<button type="button" class="btn btn--primary" id="nextBtn">Soal Berikutnya →</button>'
      : '') +
    (ex.correct && idx === total - 1
      ? '<button type="button" class="btn btn--primary" id="lanjutBtn">' +
        esc(cfg.nextLabel) +
        '</button>'
      : '') +
    '</div></div>' +
    (allDone && idx === total - 1 ? '' : '') +
    '</section>';

  var input = document.getElementById('answerInput');
  var checkBtn = document.getElementById('checkBtn');
  var hintBtn = document.getElementById('hintBtn');
  var nextBtn = document.getElementById('nextBtn');
  var lanjutBtn = document.getElementById('lanjutBtn');

  if (input) input.focus();

  if (checkBtn) {
    var doCheck = function () {
      var parsed = parseInputInt(input ? input.value : '', true);
      if (parsed.error === 'empty') {
        showNotice('Masukkan jawabanmu terlebih dahulu.');
        return;
      }
      if (parsed.error === 'invalid') {
        showNotice('Masukkan bilangan bulat yang valid.');
        return;
      }
      ex.userInput = input ? input.value : '';
      ex.attempts++;
      if (parsed.value === soal.answer) {
        ex.correct = true;
        showNotice('✅ Jawaban benar!');
      }
      saveState();
      renderExerciseStage(container, cfg);
    };
    checkBtn.addEventListener('click', doCheck);
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doCheck();
      });
    }
  }

  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      ex.hintIdx = Math.min(ex.hintIdx + 1, soal.hints.length);
      saveState();
      renderExerciseStage(container, cfg);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      State[cfg.stateIdx] = idx + 1;
      saveState();
      renderExerciseStage(container, cfg);
    });
  }

  if (lanjutBtn) {
    lanjutBtn.addEventListener('click', function () {
      completeStage(cfg.stageName);
      navigateTo(cfg.nextStage);
    });
  }
}

/* ============================================================
   12. STAGE: ESTIMASI
   ============================================================ */

function renderEstimasi(container) {
  var d = DATA.estimasi;
  var idx = State.estimasiIdx;
  var exercises = State.estimasiExercises;
  var soal = d.soal[idx];
  var ex = exercises[idx];
  var total = d.soal.length;

  var statuses = exercises.map(function (e) {
    return e.correct ? 'correct' : e.attempts > 0 ? 'incorrect' : null;
  });
  var dotsHtml = buildProgressDots(total, idx, statuses);

  var langkahHtml = '';
  if (ex.correct || ex.hintIdx > 0) {
    langkahHtml =
      '<div class="estimation-steps">' +
      '<div class="estimation-steps__title">Langkah Estimasi</div>' +
      soal.langkah
        .map(function (l, i) {
          return (
            '<div class="estimation-steps__step"><span class="estimation-steps__num">' +
            (i + 1) +
            '</span><span>' +
            l +
            '</span></div>'
          );
        })
        .join('') +
      '</div>';
  }

  /* Tolerance for estimation */
  var tolAbs = soal.toleransi > 0 ? Math.ceil(Math.abs(soal.answer) * soal.toleransi) : 0;
  var rangeText =
    tolAbs > 0
      ? 'Jawaban antara ' +
        formatNumber(soal.answer - tolAbs) +
        ' – ' +
        formatNumber(soal.answer + tolAbs) +
        ' diterima.'
      : 'Jawaban harus tepat.';

  var feedbackHtml = '';
  if (ex.correct) {
    feedbackHtml = buildFeedbackBox(
      'success',
      '✅',
      '<strong>Estimasimu tepat!</strong> ' + soal.explanation
    );
  } else if (ex.attempts > 0) {
    feedbackHtml = buildFeedbackBox(
      'error',
      '❌',
      'Belum tepat. Coba tinjau langkah estimasimu. Petunjuk: ' + soal.hint
    );
  }

  var allDone = exercises.every(function (e) {
    return e.correct;
  });

  container.innerHTML =
    '<section aria-label="Estimasi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 7 — ESTIMASI</span>' +
    '<h2>' +
    esc(d.title) +
    '</h2>' +
    '<p class="stage-head__instruction">' +
    d.instruction +
    '</p>' +
    '</div>' +
    dotsHtml +
    '<div class="eksplorasi-card">' +
    '<div class="eksplorasi-card__head">' +
    '<span class="eksplorasi-card__icon">' +
    soal.icon +
    '</span>' +
    '<div class="eksplorasi-card__meta">' +
    '<span class="eksplorasi-card__badge">' +
    esc(soal.badge) +
    '</span>' +
    '<p class="eksplorasi-card__title">' +
    esc(soal.pertanyaan) +
    '</p>' +
    '</div></div>' +
    '<div class="eksplorasi-card__body">' +
    '<p class="eksplorasi-card__story">' +
    soal.story +
    '</p>' +
    langkahHtml +
    '<div class="estimation-box">' +
    '<div class="estimation-box__label">Jawabanmu</div>' +
    '<div class="expr-display">' +
    '<input type="number" id="estInput" class="input-text" style="max-width:150px;font-family:var(--font-mono);font-size:1.2rem;text-align:center;" placeholder="?" aria-label="Estimasi jawaban" value="' +
    esc(ex.userInput) +
    '">' +
    '<span style="font-size:0.9rem;color:var(--color-ink-muted);">' +
    esc(soal.unit) +
    '</span>' +
    '</div>' +
    '<div class="estimation-box__range">' +
    rangeText +
    '</div>' +
    '</div>' +
    feedbackHtml +
    '<div class="btn-group">' +
    (!ex.correct
      ? '<button type="button" class="btn btn--primary" id="checkBtn">Periksa</button>'
      : '') +
    (!ex.correct && ex.hintIdx === 0
      ? '<button type="button" class="btn btn--ghost" id="hintBtn">Lihat Langkah Estimasi</button>'
      : '') +
    (ex.correct && idx < total - 1
      ? '<button type="button" class="btn btn--primary" id="nextBtn">Soal Berikutnya →</button>'
      : '') +
    (ex.correct && idx === total - 1
      ? '<button type="button" class="btn btn--primary" id="lanjutBtn">Lanjut ke Tantangan →</button>'
      : '') +
    '</div></div></div>' +
    '</section>';

  var input = document.getElementById('estInput');
  if (input) input.focus();

  var checkBtn = document.getElementById('checkBtn');
  if (checkBtn) {
    var doCheck = function () {
      var parsed = parseInputInt(input ? input.value : '', true);
      if (parsed.error === 'empty') {
        showNotice('Masukkan perkiraanmu terlebih dahulu.');
        return;
      }
      if (parsed.error === 'invalid') {
        showNotice('Masukkan bilangan bulat yang valid.');
        return;
      }
      ex.userInput = input ? input.value : '';
      ex.attempts++;
      var diff = Math.abs(parsed.value - soal.answer);
      if (diff <= tolAbs) {
        ex.correct = true;
        showNotice('✅ Estimasimu tepat!');
      }
      saveState();
      renderEstimasi(container);
    };
    checkBtn.addEventListener('click', doCheck);
    if (input)
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doCheck();
      });
  }

  var hintBtn = document.getElementById('hintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      ex.hintIdx = 1;
      saveState();
      renderEstimasi(container);
    });
  }

  var nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      State.estimasiIdx = idx + 1;
      saveState();
      renderEstimasi(container);
    });
  }

  var lanjutBtn = document.getElementById('lanjutBtn');
  if (lanjutBtn) {
    lanjutBtn.addEventListener('click', function () {
      completeStage('estimasi');
      navigateTo('tantangan');
    });
  }
}

/* ============================================================
   13. STAGE: TANTANGAN
   ============================================================ */

function renderTantangan(container) {
  var d = DATA.tantangan;
  var idx = State.tantanganIdx;
  var exercises = State.tantanganExercises;
  var soal = d.soal[idx];
  var ex = exercises[idx];
  var total = d.soal.length;

  var statuses = exercises.map(function (e) {
    return e.correct ? 'correct' : e.attempts > 0 ? 'incorrect' : null;
  });
  var dotsHtml = buildProgressDots(total, idx, statuses);

  var inputHtml = '';
  var feedbackHtml = '';

  if (soal.type === 'input') {
    inputHtml =
      '<div class="estimation-box">' +
      '<div class="estimation-box__label">Jawabanmu</div>' +
      '<div class="expr-display">' +
      '<input type="number" id="tantInput" class="input-text" style="max-width:160px;font-family:var(--font-mono);font-size:1.2rem;text-align:center;" placeholder="?" aria-label="Jawaban tantangan" value="' +
      esc(ex.userInput) +
      '">' +
      (soal.unit
        ? '<span style="font-size:0.9rem;color:var(--color-ink-muted);">' +
          esc(soal.unit) +
          '</span>'
        : '') +
      '</div></div>';
  } else if (soal.type === 'choice') {
    inputHtml =
      '<div class="challenge-options" id="choiceList">' +
      soal.options
        .map(function (opt) {
          var cls = 'choice-btn';
          var icon = '';
          if (ex.correct && ex.chosen === opt.id) {
            cls += ' is-correct';
            icon = '<span class="choice-btn__icon">✓</span>';
          } else if (!ex.correct && ex.chosen === opt.id) {
            cls += ' is-incorrect';
            icon = '<span class="choice-btn__icon">✗</span>';
          } else {
            icon = '<span class="choice-btn__icon"></span>';
          }
          return (
            '<button type="button" class="' +
            cls +
            '" data-id="' +
            esc(opt.id) +
            '">' +
            icon +
            esc(opt.label) +
            '</button>'
          );
        })
        .join('') +
      '</div>';
  }

  if (ex.correct) {
    feedbackHtml = buildFeedbackBox('success', '✅', '<strong>Benar!</strong> ' + soal.explanation);
  } else if (ex.attempts > 0 && ex.chosen) {
    feedbackHtml = buildFeedbackBox('error', '❌', 'Belum tepat. Petunjuk: ' + soal.hint);
  } else if (ex.attempts > 0) {
    feedbackHtml = buildFeedbackBox('error', '❌', 'Belum tepat. Petunjuk: ' + soal.hint);
  }

  var hintShown = ex.hintIdx > 0;

  container.innerHTML =
    '<section aria-label="Tantangan">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 8 — TANTANGAN KONTEKSTUAL</span>' +
    '<h2>' +
    esc(d.title) +
    '</h2>' +
    '</div>' +
    dotsHtml +
    '<div class="eksplorasi-card">' +
    '<div class="eksplorasi-card__head">' +
    '<span class="eksplorasi-card__icon">' +
    soal.icon +
    '</span>' +
    '<div class="eksplorasi-card__meta">' +
    '<span class="eksplorasi-card__badge">' +
    esc(soal.badge) +
    '</span>' +
    '</div></div>' +
    '<div class="eksplorasi-card__body">' +
    '<p class="eksplorasi-card__story">' +
    soal.story +
    '</p>' +
    '<p><strong>' +
    soal.pertanyaan +
    '</strong></p>' +
    inputHtml +
    feedbackHtml +
    '<div class="btn-group">' +
    (!ex.correct && soal.type === 'input'
      ? '<button type="button" class="btn btn--primary" id="checkBtn">Periksa</button>'
      : '') +
    (!ex.correct && !hintShown
      ? '<button type="button" class="btn btn--ghost" id="hintBtn">Petunjuk</button>'
      : '') +
    (ex.correct && idx < total - 1
      ? '<button type="button" class="btn btn--primary" id="nextBtn">Tantangan Berikutnya →</button>'
      : '') +
    (ex.correct && idx === total - 1
      ? '<button type="button" class="btn btn--primary" id="lanjutBtn">Lanjut ke Refleksi →</button>'
      : '') +
    '</div></div></div>' +
    '</section>';

  /* Input type handlers */
  if (soal.type === 'input') {
    var input = document.getElementById('tantInput');
    if (input) input.focus();
    var checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
      var doCheck = function () {
        var parsed = parseInputInt(input ? input.value : '', true);
        if (parsed.error === 'empty') {
          showNotice('Masukkan jawabanmu.');
          return;
        }
        if (parsed.error === 'invalid') {
          showNotice('Masukkan bilangan bulat yang valid.');
          return;
        }
        ex.userInput = input ? input.value : '';
        ex.attempts++;
        if (parsed.value === soal.answer) {
          ex.correct = true;
          showNotice('✅ Benar!');
        }
        saveState();
        renderTantangan(container);
      };
      checkBtn.addEventListener('click', doCheck);
      if (input)
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') doCheck();
        });
    }
  } else if (soal.type === 'choice') {
    var choiceBtns = container.querySelectorAll('.choice-btn');
    choiceBtns.forEach(function (btn) {
      if (ex.correct) return;
      btn.addEventListener('click', function () {
        var optId = btn.dataset.id;
        ex.chosen = optId;
        ex.attempts++;
        if (optId === soal.correct) {
          ex.correct = true;
          showNotice('✅ Benar!');
        }
        saveState();
        renderTantangan(container);
      });
    });
  }

  var hintBtn = document.getElementById('hintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      ex.hintIdx = 1;
      saveState();
      showNotice('💡 ' + soal.hint);
      renderTantangan(container);
    });
  }

  var nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      State.tantanganIdx = idx + 1;
      saveState();
      renderTantangan(container);
    });
  }

  var lanjutBtn = document.getElementById('lanjutBtn');
  if (lanjutBtn) {
    lanjutBtn.addEventListener('click', function () {
      completeStage('tantangan');
      navigateTo('refleksi');
    });
  }
}

/* ============================================================
   14. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var d = DATA.refleksi;

  var soalHtml = d.soal
    .map(function (s, i) {
      return (
        '<div class="refleksi-item" style="margin-bottom:var(--space-5);">' +
        '<label style="display:block;font-weight:600;font-size:0.92rem;margin-bottom:var(--space-2);" for="refl' +
        i +
        '"><strong>' +
        (i + 1) +
        '.</strong> ' +
        s.question +
        '</label>' +
        '<textarea id="refl' +
        i +
        '" class="input-textarea" rows="3" placeholder="' +
        esc(s.placeholder) +
        '" data-id="' +
        esc(s.id) +
        '">' +
        esc(State.refleksiAnswers[s.id] || '') +
        '</textarea>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Refleksi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 9 — REFLEKSI</span>' +
    '<h2>' +
    esc(d.title) +
    '</h2>' +
    '<p>' +
    d.note +
    '</p>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    soalHtml +
    (State.refleksiSaved
      ? buildFeedbackBox('success', '✅', 'Refleksimu telah tersimpan di browser ini.') +
        '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="lanjutBtn">Lihat Ringkasan →</button></div>'
      : '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="saveReflBtn">Simpan Refleksi</button></div>') +
    '</div></section>';

  var saveBtn = document.getElementById('saveReflBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      var textareas = container.querySelectorAll('textarea');
      var hasAny = false;
      textareas.forEach(function (ta) {
        var id = ta.dataset.id;
        State.refleksiAnswers[id] = ta.value;
        if (ta.value.trim()) hasAny = true;
      });
      if (!hasAny) {
        showNotice('Isi setidaknya satu pertanyaan refleksi.');
        return;
      }
      State.refleksiSaved = true;
      saveState();
      renderRefleksi(container);
    });
  }

  var lanjutBtn = document.getElementById('lanjutBtn');
  if (lanjutBtn) {
    lanjutBtn.addEventListener('click', function () {
      completeStage('refleksi');
      navigateTo('selesai');
    });
  }
}

/* ============================================================
   15. STAGE: SELESAI
   ============================================================ */

function renderSelesai(container) {
  var doneCount = Object.keys(State.completedStages).length;
  var totalSoalKali = State.latihanKaliExercises.filter(function (e) {
    return e.correct;
  }).length;
  var totalSoalBagi = State.latihanBagiExercises.filter(function (e) {
    return e.correct;
  }).length;
  var totalSoalEst = State.estimasiExercises.filter(function (e) {
    return e.correct;
  }).length;
  var totalSoalTant = State.tantanganExercises.filter(function (e) {
    return e.correct;
  }).length;

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 10 — SELESAI</span>' +
    '</div>' +
    '<div class="panel panel--hero" style="text-align:center;">' +
    '<div style="font-size:3rem;margin-bottom:var(--space-3);">🎉</div>' +
    '<h2>Selamat! Kamu telah menyelesaikan media ini.</h2>' +
    '<p style="font-size:1.05rem;">Kamu berhasil menyelesaikan <strong>' +
    doneCount +
    ' dari ' +
    STAGES.length +
    ' tahap</strong> pembelajaran.</p>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>Ringkasan Pencapaian</h3>' +
    '<div class="hero-steps">' +
    '<div class="hero-steps__item"><span class="hero-steps__num">×</span>Latihan Perkalian: <strong>' +
    totalSoalKali +
    '/' +
    DATA.latihanKali.soal.length +
    ' soal</strong></div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">÷</span>Latihan Pembagian: <strong>' +
    totalSoalBagi +
    '/' +
    DATA.latihanBagi.soal.length +
    ' soal</strong></div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">≈</span>Estimasi: <strong>' +
    totalSoalEst +
    '/' +
    DATA.estimasi.soal.length +
    ' soal</strong></div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">🏆</span>Tantangan: <strong>' +
    totalSoalTant +
    '/' +
    DATA.tantangan.soal.length +
    ' soal</strong></div>' +
    '</div></div>' +
    '<div class="panel panel--compact">' +
    '<h3>Kesimpulan Penting</h3>' +
    '<div class="hero-steps">' +
    '<div class="hero-steps__item"><span class="hero-steps__num">1</span>Tanda <strong>sama</strong> (+ × + atau − × −) → hasil <strong>positif</strong>.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">2</span>Tanda <strong>berbeda</strong> (+ × − atau − × +) → hasil <strong>negatif</strong>.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">3</span>Aturan tanda berlaku sama untuk <strong>pembagian</strong>.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">4</span><strong>Estimasi</strong>: bulatkan angka lalu kalikan/bagi untuk perkiraan cepat.</div>' +
    '</div></div>' +
    '<div class="btn-group btn-group--end">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '</div></section>';

  completeStage('selesai');
}

/* ============================================================
   16. INIT
   ============================================================ */

function init() {
  var loaded = loadState();
  initExerciseArrays();
  buildStageNav();
  updateProgress();
  renderCurrentStage();

  var resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (confirm('Reset semua progress? Semua jawaban akan dihapus.')) {
        clearState();
        buildStageNav();
        updateProgress();
        renderCurrentStage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
