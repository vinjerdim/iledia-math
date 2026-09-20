'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Menyelesaikan Masalah Operasi Aritmatika Campuran
   Bilangan Rasional dan Desimal

   Utilitas bersama (esc, parseInputInt, showNotice, builder render,
   mesin navigasi tahap) berada di shared/engine.js.

   Bagian:
    1. Utilitas Matematika
    2. Konstanta & Konfigurasi
    3. State & Storage
    4. Navigasi Tahap
    5. Utilitas Render HTML
    6. Stage: Orientasi
    7. Stage: Contoh Terbimbing
    8. Stage: Latihan (router + per-fase)
    9. Stage: Hasil
   10. Stage: Refleksi
   11. Helper UI (notice, modal)
   12. Init
   ============================================================ */

/* ============================================================
   1. UTILITAS MATEMATIKA
   ============================================================ */

/** GCD untuk validasi pecahan */
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

/**
 * Parse input angka dari user.
 * Menerima koma atau titik sebagai pemisah desimal.
 * Mengembalikan { value: number|null, error: 'empty'|'invalid'|null }
 */
function parseUserInput(str) {
  if (!str || str.trim() === '') return { value: null, error: 'empty' };
  var s = str.trim().replace(/\s/g, '');
  /* Tolak jika ada lebih dari satu pemisah desimal */
  var commas = (s.match(/,/g) || []).length;
  var dots = (s.match(/\./g) || []).length;
  if (commas + dots > 1) return { value: null, error: 'invalid' };
  s = s.replace(',', '.');
  /* Hanya izinkan angka negatif/positif dengan satu titik desimal */
  if (!/^-?\d*\.?\d+$/.test(s)) return { value: null, error: 'invalid' };
  var v = parseFloat(s);
  if (isNaN(v)) return { value: null, error: 'invalid' };
  return { value: v, error: null };
}

/** Periksa kesetaraan numerik dengan toleransi */
function approxEqual(a, b, tol) {
  if (tol === undefined) tol = 1e-9;
  return Math.abs(a - b) <= tol;
}

/** Format angka ke tampilan Indonesia (koma desimal, maks 4 digit) */
function formatNum(val, maxDig) {
  if (maxDig === undefined) maxDig = 4;
  var s = parseFloat(val.toFixed(maxDig)).toString().replace('.', ',');
  return s;
}

/* ============================================================
   2. KONSTANTA & KONFIGURASI
   ============================================================ */

var STAGES = ['orientasi', 'contoh', 'latihan', 'hasil', 'refleksi'];
var STAGE_LABELS = ['Orientasi', 'Contoh', 'Latihan', 'Hasil', 'Refleksi'];
var STORAGE_KEY = 'mpi-1-5-v1';

var PHASES = ['identify', 'model', 'order', 'calc', 'answer', 'verify'];
var PHASE_LABELS = {
  identify: 'Identifikasi',
  model: 'Model Operasi',
  order: 'Urutan Operasi',
  calc: 'Hitung Bertahap',
  answer: 'Jawaban Akhir',
  verify: 'Periksa Kewajaran',
};

/* Max percobaan sebelum hint otomatis naik level */
var MAX_ATTEMPTS_BEFORE_HINT = 2;

/* ============================================================
   3. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Contoh terbimbing */
  contohStepIdx: 0,
  contohStepResults: {} /* { stepId: { correct: bool, attempts: int } } */,
  contohDone: false,

  /* Latihan */
  currentProblemIdx: 0,
  problemStates: [] /* diinisialisasi di initProblemStates() */,

  /* Refleksi */
  refleksiAnswers: {},
  refleksiSaved: false,
};

function initProblemStates() {
  var ps = [];
  DATA.problems.forEach(function (p) {
    var calcSubsteps = p.calc.steps.map(function () {
      return { attempts: 0, hintLevel: 0, input: '', correct: false, revealed: false };
    });

    /* tentukan fase aktif awal, lewati 'order' jika soal tidak memiliki order */
    var startPhase = 'identify';

    ps.push({
      problemId: p.id,
      status: 'not-started' /* not-started | in-progress | complete */,
      currentPhase: startPhase,
      reviewShown: false,
      phases: {
        identify: {
          completed: false,
          attempts: 0,
          selected: [],
          correct: false,
        },
        model: {
          completed: false,
          attempts: 0,
          hintLevel: 0,
          selected: null,
          lastCheckedId: null,
          correct: false,
        },
        order: {
          completed: false,
          attempts: 0,
          hintLevel: 0,
          selected: null,
          lastCheckedId: null,
          correct: false,
          skipped: p.order === null,
        },
        calc: {
          completed: false,
          substeps: calcSubsteps,
        },
        answer: {
          completed: false,
          attempts: 0,
          hintLevel: 0,
          input: '',
          correct: false,
          revealed: false,
        },
        verify: {
          completed: false,
          attempts: 0,
          selected: null,
          lastCheckedId: null,
          correct: false,
        },
      },
      totalHints: 0,
      totalAttempts: 0,
      correctFirstTry: 0,
    });
  });
  State.problemStates = ps;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(State));
  } catch (e) {
    /* simpan gagal, lanjutkan tanpa crash */
  }
}

function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    var saved = JSON.parse(raw);
    /* Validasi dasar sebelum menerapkan */
    if (!saved || typeof saved !== 'object') return false;
    if (!Array.isArray(saved.problemStates) || saved.problemStates.length !== DATA.problems.length)
      return false;
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
  State.contohStepIdx = 0;
  State.contohStepResults = {};
  State.contohDone = false;
  State.currentProblemIdx = 0;
  State.refleksiAnswers = {};
  State.refleksiSaved = false;
  initProblemStates();
}

/* ============================================================
   4. NAVIGASI TAHAP
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
   5. UTILITAS RENDER HTML
   ============================================================ */

/** Buat frac-block HTML (inline fraction display) */
function buildFracBlock(num, den, whole, size) {
  size = size || '';
  var cls = 'frac-block' + (size ? ' frac-block--' + size : '');
  var ariaLabel = (whole != null ? esc(whole) + ' dan ' : '') + esc(num) + ' per ' + esc(den);
  var wholeHTML =
    whole != null ? '<span class="frac-block__whole">' + esc(String(whole)) + '</span>' : '';
  return (
    '<span class="' +
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

/** Buat hint items HTML */
function buildHints(hints, level) {
  if (!hints || level <= 0) return '';
  var items = '';
  for (var i = 0; i < level && i < hints.length; i++) {
    items +=
      '<div class="hint-item"><span class="hint-item__num">Petunjuk ' +
      (i + 1) +
      '</span><span>' +
      esc(hints[i]) +
      '</span></div>';
  }
  return '<div class="hint-container" aria-live="polite">' + items + '</div>';
}

/** Buat problem-dot navigation */
function buildProblemDots(currentIdx, problemStates) {
  var html = '';
  problemStates.forEach(function (ps, i) {
    var cls = 'problem-dot';
    if (i === currentIdx) cls += ' problem-dot--current';
    else if (ps.status === 'complete') cls += ' problem-dot--done';
    html +=
      '<span class="' +
      cls +
      '" aria-label="Soal ' +
      (i + 1) +
      (ps.status === 'complete' ? ' (selesai)' : '') +
      '">' +
      (i + 1) +
      '</span>';
  });
  return html;
}

/** Buat phase indicator */
function buildPhaseIndicator(problem, currentPhase) {
  var phases = ['identify', 'model'];
  if (problem.order !== null) phases.push('order');
  phases.push('calc', 'answer', 'verify');

  var html = '<div class="phase-indicator" aria-label="Langkah penyelesaian">';
  phases.forEach(function (ph, i) {
    var pstate = problem.order === null && ph === 'order' ? null : null;
    var isDone = isPhaseComplete(State.problemStates[State.currentProblemIdx], ph);
    var isCurrent = ph === currentPhase;
    var cls = 'phase-step' + (isCurrent ? ' is-active' : isDone ? ' is-done' : '');
    html += '<span class="' + cls + '">';
    html += '<span class="phase-step__num">' + (isDone && !isCurrent ? '✓' : i + 1) + '</span>';
    html += esc(PHASE_LABELS[ph]);
    html += '</span>';
    if (i < phases.length - 1) html += '<span class="phase-sep" aria-hidden="true">›</span>';
  });
  html += '</div>';
  return html;
}

function isPhaseComplete(pstate, phase) {
  if (!pstate) return false;
  if (phase === 'order' && pstate.phases.order.skipped) return true;
  return pstate.phases[phase] && pstate.phases[phase].completed;
}

/** Render halaman saat ini */
function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  container.innerHTML = '';
  updateProgress();

  switch (State.currentStage) {
    case 'orientasi':
      renderOrientasi(container);
      break;
    case 'contoh':
      renderContoh(container);
      break;
    case 'latihan':
      renderLatihan(container);
      break;
    case 'hasil':
      renderHasil(container);
      break;
    case 'refleksi':
      renderRefleksi(container);
      break;
    default:
      container.innerHTML =
        '<p style="text-align:center;padding:var(--space-7);color:var(--color-ink-muted);">Tahap tidak ditemukan.</p>';
  }
}

/* ============================================================
   6. STAGE: ORIENTASI
   ============================================================ */

function renderOrientasi(container) {
  container.innerHTML =
    '<section aria-label="Orientasi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 1 — ORIENTASI</span>' +
    '<p class="stage-head__goal">Tujuan: Memahami konteks pembelajaran dan cara menggunakan media ini.</p>' +
    '</div>' +
    '<div class="panel panel--hero">' +
    '<h2>' +
    esc(DATA.meta.title) +
    '</h2>' +
    '<p style="font-size:1.05rem;"><strong>Tujuan Pembelajaran:</strong></p>' +
    '<p style="font-size:1rem;margin-bottom:0;">' +
    esc(DATA.meta.goal) +
    '</p>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>Apa yang akan kamu latih?</h3>' +
    '<div class="hero-steps">' +
    '<div class="hero-steps__item"><span class="hero-steps__num">1</span>Membaca masalah dan mengidentifikasi informasi penting.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">2</span>Menentukan operasi matematika yang sesuai (+, −, ×, ÷).</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">3</span>Menentukan urutan operasi yang benar.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">4</span>Melakukan perhitungan secara bertahap.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">5</span>Memeriksa apakah hasil masuk akal dalam konteks.</div>' +
    '</div></div>' +
    '<div class="panel panel--compact">' +
    '<h3>Cara menggunakan media ini</h3>' +
    '<ul>' +
    '<li>Kerjakan setiap tahap dari kiri ke kanan sesuai navigasi di atas.</li>' +
    '<li>Setiap soal memiliki beberapa langkah — kerjakan satu per satu.</li>' +
    '<li>Tersedia tombol <strong>Petunjuk</strong> jika kamu belum menemukan jawaban setelah beberapa percobaan.</li>' +
    '<li>Feedback menjelaskan <em>mengapa</em> jawaban benar atau salah — baca dengan cermat.</li>' +
    '<li>Progress tersimpan otomatis. Kamu bisa melanjutkan kapan saja.</li>' +
    '</ul></div>' +
    '<div class="panel panel--compact panel--warning">' +
    '<p style="margin:0;font-size:0.88rem;color:var(--color-warning-strong);">' +
    '<strong>Catatan:</strong> Hasil latihan dalam media ini adalah panduan belajar mandiri, ' +
    'bukan nilai akhir sekolah. Diskusi dengan guru dan teman tetap menjadi bagian penting dari pembelajaran.' +
    '</p></div>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary btn--large" id="startBtn">Mulai — Lihat Contoh →</button>' +
    '</div>' +
    '</section>';

  document.getElementById('startBtn').addEventListener('click', function () {
    completeStage('orientasi');
    navigateTo('contoh');
  });
}

/* ============================================================
   7. STAGE: CONTOH TERBIMBING
   ============================================================ */

function renderContoh(container) {
  var ex = DATA.guidedExample;
  var stepIdx = State.contohStepIdx;
  var steps = ex.steps;
  var totalSteps = steps.length;

  /* Progress bar dalam contoh */
  var pct = Math.round((stepIdx / (totalSteps - 1)) * 100);

  var html =
    '<section aria-label="Contoh Terbimbing">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 2 — CONTOH TERBIMBING</span>' +
    '<p class="stage-head__goal">Saksikan bagaimana masalah diselesaikan langkah demi langkah, lalu coba sendiri beberapa bagiannya.</p>' +
    '</div>' +
    '<div class="problem-card">' +
    '<div class="problem-card__kicker"><span>' +
    esc(ex.title) +
    '</span></div>' +
    '<p class="problem-card__context">' +
    ex.context +
    '</p>' +
    '<p class="problem-card__question">' +
    esc(ex.question) +
    '</p>' +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4);">' +
    '<span style="font-size:0.82rem;color:var(--color-ink-muted);white-space:nowrap;">Langkah ' +
    (stepIdx + 1) +
    ' dari ' +
    totalSteps +
    '</span>' +
    '<div style="flex:1;height:6px;background:var(--color-bg-grid);border-radius:3px;overflow:hidden;">' +
    '<div style="width:' +
    pct +
    '%;height:100%;background:var(--color-primary);border-radius:3px;transition:width 0.3s;"></div>' +
    '</div></div>' +
    '<div id="contohStepContent">';

  html += buildContohStep(steps[stepIdx]);
  html += '</div></section>';
  container.innerHTML = html;

  attachContohStepHandlers(steps[stepIdx]);
}

function buildContohStep(step) {
  var html = '<div class="panel">';
  html += '<div class="contoh-step-header">';
  html += '<span class="contoh-step-badge">' + esc(step.title) + '</span>';
  html += '</div>';

  if (step.type === 'read') {
    html += step.body;
    html += '<div class="btn-group btn-group--end">';
    html +=
      '<button type="button" class="btn btn--primary" id="contohNextBtn">' +
      esc(step.cta) +
      ' →</button>';
    html += '</div>';
  }

  if (step.type === 'mc') {
    var stepResult = State.contohStepResults[step.id] || null;
    var isLocked = stepResult && stepResult.correct;

    html += '<p>' + step.prompt + '</p>';
    html += '<div class="options-grid options-grid--2col">';
    step.options.forEach(function (opt) {
      var cls = 'option-card';
      if (isLocked) {
        cls += ' is-locked';
        if (opt.correct) cls += ' is-correct';
      } else if (stepResult && stepResult.selectedId === opt.id) {
        cls += opt.correct ? ' is-correct' : ' is-wrong';
      }
      html +=
        '<button type="button" class="' +
        cls +
        '" data-optid="' +
        esc(opt.id) +
        '"' +
        (isLocked ? ' disabled' : '') +
        '>' +
        '<span class="option-card__marker">' +
        esc(opt.id.toUpperCase()) +
        '</span>' +
        '<span class="option-card__body"><span class="option-card__expr">' +
        esc(opt.label) +
        '</span></span>' +
        '</button>';
    });
    html += '</div>';

    if (stepResult) {
      var selOpt = step.options.find(function (o) {
        return o.id === stepResult.selectedId;
      });
      if (selOpt) {
        html += buildFeedbackBox(
          selOpt.correct ? 'success' : 'error',
          selOpt.correct ? '✓' : '✗',
          esc(selOpt.feedback)
        );
      }
    }

    if (!stepResult) {
      var hintText = step.hint || '';
      html += '<div id="contohHintArea"></div>';
      html += '<div class="btn-group" style="margin-top:var(--space-3);">';
      if (hintText)
        html +=
          '<button type="button" class="btn btn--ghost btn--small" id="contohHintBtn">Petunjuk</button>';
      html += '</div>';
    } else if (stepResult.correct) {
      html +=
        '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="contohNextBtn">Lanjut →</button></div>';
    }
  }

  if (step.type === 'input') {
    var stepResult2 = State.contohStepResults[step.id] || null;
    var isDone = stepResult2 && stepResult2.correct;

    html += '<p>' + esc(step.instruction) + '</p>';
    html += '<div class="calc-step-wrap' + (isDone ? ' is-done' : '') + '">';
    html += '<div class="calc-step__prompt">' + esc(step.prompt) + '</div>';

    if (isDone) {
      html += '<div class="calc-step__result-display">✓ ' + esc(step.correctDisplay) + '</div>';
      html += buildFeedbackBox('success', '✓', esc(step.feedbackCorrect));
    } else {
      var errorMsg =
        stepResult2 && !stepResult2.correct && stepResult2.errorMsg ? stepResult2.errorMsg : '';
      html += '<div class="calc-input-row">';
      html += '<label for="contohInput">' + esc(step.inputLabel) + '</label>';
      html +=
        '<input type="text" id="contohInput" class="input-text' +
        (errorMsg ? ' has-error' : '') +
        '"' +
        ' placeholder="' +
        esc(step.inputPlaceholder) +
        '"' +
        ' autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">';
      html += '</div>';
      if (errorMsg) html += '<div class="field-error">' + esc(errorMsg) + '</div>';

      /* Petunjuk bertingkat */
      var hintLevel = stepResult2 && stepResult2.hintLevel ? stepResult2.hintLevel : 0;
      html += buildHints(step.hints, hintLevel);

      if (stepResult2 && !stepResult2.correct) {
        html += buildFeedbackBox('error', '✗', esc(step.feedbackWrong));
      }

      html += '<div class="btn-group">';
      if (hintLevel < step.hints.length) {
        html +=
          '<button type="button" class="btn btn--ghost btn--small" id="contohHintBtn">Petunjuk</button>';
      }
      html += '<button type="button" class="btn btn--primary" id="contohCheckBtn">Periksa</button>';
      html += '</div>';
    }
    html += '</div>';

    if (isDone) {
      html +=
        '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="contohNextBtn">Lanjut →</button></div>';
    }
  }

  if (step.type === 'summary') {
    html +=
      '<p style="color:var(--color-ink-muted);font-size:0.9rem;margin-bottom:var(--space-4);">Berikut adalah rangkuman penyelesaian lengkap dari contoh di atas.</p>';
    html += '<ol class="solution-steps">';
    step.steps.forEach(function (s) {
      html +=
        '<li class="solution-step"><span class="solution-step__icon">→</span><span class="solution-step__text">' +
        esc(s) +
        '</span></li>';
    });
    html += '</ol>';
    if (step.note) {
      html +=
        '<div class="contoh-explanation"><strong>Catatan:</strong> ' + esc(step.note) + '</div>';
    }
    html += '<div class="btn-group btn-group--end">';
    html +=
      '<button type="button" class="btn btn--primary btn--large" id="contohDoneBtn">Mulai Latihan →</button>';
    html += '</div>';
  }

  html += '</div>';
  return html;
}

function attachContohStepHandlers(step) {
  /* Tombol lanjut */
  var nextBtn = document.getElementById('contohNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      State.contohStepIdx++;
      saveState();
      renderContoh(document.getElementById('stageContainer'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* Tombol mulai latihan (dari summary) */
  var doneBtn = document.getElementById('contohDoneBtn');
  if (doneBtn) {
    doneBtn.addEventListener('click', function () {
      State.contohDone = true;
      completeStage('contoh');
      navigateTo('latihan');
    });
  }

  /* MC options */
  if (step.type === 'mc') {
    document.querySelectorAll('.option-card[data-optid]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var optId = this.dataset.optid;
        var opt = step.options.find(function (o) {
          return o.id === optId;
        });
        if (!opt) return;
        State.contohStepResults[step.id] = {
          selectedId: optId,
          correct: opt.correct,
          attempts: ((State.contohStepResults[step.id] || {}).attempts || 0) + 1,
        };
        saveState();
        renderContoh(document.getElementById('stageContainer'));
        window.scrollTo({
          top: document.getElementById('contohStepContent').offsetTop - 120,
          behavior: 'smooth',
        });
      });
    });

    var hintBtn = document.getElementById('contohHintBtn');
    if (hintBtn) {
      hintBtn.addEventListener('click', function () {
        var hintArea = document.getElementById('contohHintArea');
        if (hintArea)
          hintArea.innerHTML =
            '<div class="hint-item"><span class="hint-item__num">Petunjuk</span><span>' +
            esc(step.hint) +
            '</span></div>';
        hintBtn.disabled = true;
      });
    }
  }

  /* Input step */
  if (step.type === 'input') {
    var inp = document.getElementById('contohInput');
    var checkBtn = document.getElementById('contohCheckBtn');
    var hintBtn2 = document.getElementById('contohHintBtn');

    if (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && checkBtn) checkBtn.click();
      });
    }

    if (checkBtn) {
      checkBtn.addEventListener('click', function () {
        var raw = inp ? inp.value : '';
        var result = checkContohInput(step, raw);
        var existing = State.contohStepResults[step.id] || { attempts: 0, hintLevel: 0 };
        existing.attempts = (existing.attempts || 0) + 1;
        existing.correct = result.correct;
        existing.errorMsg = result.errorMsg;
        if (
          !result.correct &&
          existing.attempts >= MAX_ATTEMPTS_BEFORE_HINT &&
          existing.hintLevel < step.hints.length
        ) {
          existing.hintLevel = Math.min(step.hints.length, (existing.hintLevel || 0) + 1);
        }
        State.contohStepResults[step.id] = existing;
        saveState();
        renderContoh(document.getElementById('stageContainer'));
        window.scrollTo({
          top: document.getElementById('contohStepContent').offsetTop - 120,
          behavior: 'smooth',
        });
      });
    }

    if (hintBtn2) {
      hintBtn2.addEventListener('click', function () {
        var existing2 = State.contohStepResults[step.id] || { hintLevel: 0 };
        existing2.hintLevel = Math.min(step.hints.length, (existing2.hintLevel || 0) + 1);
        State.contohStepResults[step.id] = existing2;
        saveState();
        renderContoh(document.getElementById('stageContainer'));
      });
    }
  }
}

function checkContohInput(step, raw) {
  var parsed = parseUserInput(raw);
  if (parsed.error === 'empty')
    return { correct: false, errorMsg: 'Masukkan jawaban terlebih dahulu.' };
  if (parsed.error === 'invalid')
    return {
      correct: false,
      errorMsg: 'Format tidak valid. Gunakan angka (koma atau titik untuk desimal). Contoh: 0,75',
    };

  if (step.answerType === 'numerator') {
    var intVal = Math.round(parsed.value);
    if (Math.abs(parsed.value - intVal) > 0.001)
      return { correct: false, errorMsg: 'Masukkan bilangan bulat untuk pembilang.' };
    return { correct: intVal === step.answer };
  }
  /* decimal type */
  return { correct: approxEqual(parsed.value, step.answer, step.tolerance || 0.01) };
}

/* ============================================================
   8. STAGE: LATIHAN
   ============================================================ */

function renderLatihan(container) {
  var pIdx = State.currentProblemIdx;
  /* Lindungi dari index tidak valid */
  if (pIdx < 0 || pIdx >= DATA.problems.length) {
    pIdx = 0;
    State.currentProblemIdx = 0;
  }

  var problem = DATA.problems[pIdx];
  var pstate = State.problemStates[pIdx];

  if (!pstate) {
    container.innerHTML =
      '<p style="color:var(--color-error-strong);padding:var(--space-5);">Terjadi kesalahan. <button type="button" class="btn btn--ghost btn--small" onclick="clearState();location.reload();">Reset</button></p>';
    return;
  }

  /* Tandai sebagai in-progress */
  if (pstate.status === 'not-started') pstate.status = 'in-progress';

  /* Tentukan fase aktif */
  var currentPhase = pstate.currentPhase;

  /* Jika soal sudah selesai dan review diminta */
  if (pstate.status === 'complete' && pstate.reviewShown) {
    renderProblemReview(problem, pstate, container);
    return;
  }
  if (pstate.status === 'complete' && !pstate.reviewShown) {
    pstate.reviewShown = true;
    saveState();
    renderProblemReview(problem, pstate, container);
    return;
  }

  /* Render header dan problem card */
  var html =
    '<section aria-label="Latihan Soal">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 3 — LATIHAN</span>' +
    '<p class="stage-head__goal">Selesaikan setiap soal secara bertahap. Kerjakan satu langkah sebelum melanjutkan ke langkah berikutnya.</p>' +
    '</div>';

  /* Problem dots navigator */
  html +=
    '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-3);margin-bottom:var(--space-4);">';
  html += '<div style="display:flex;align-items:center;gap:var(--space-2);">';
  html += buildProblemDots(pIdx, State.problemStates);
  html +=
    '<span style="font-size:0.82rem;color:var(--color-ink-muted);margin-left:var(--space-2);">Soal ' +
    (pIdx + 1) +
    ' dari ' +
    DATA.problems.length +
    '</span>';
  html += '</div>';
  /* Difficulty */
  var diff = problem.difficulty || 1;
  var diffLabel = diff === 1 ? 'Mudah' : diff === 2 ? 'Sedang' : 'Sulit';
  html +=
    '<span style="font-size:0.82rem;color:var(--color-ink-muted);">Tingkat: <strong>' +
    esc(diffLabel) +
    '</strong></span>';
  html += '</div>';

  /* Problem card */
  html += '<div class="problem-card">';
  html += '<div class="problem-card__kicker">';
  html += '<span>Soal ' + (pIdx + 1) + ': ' + esc(problem.title) + '</span>';
  html += '</div>';
  html += '<p class="problem-card__context">' + problem.context + '</p>';
  html += '<p class="problem-card__question">' + esc(problem.question) + '</p>';
  html += '</div>';

  /* Phase indicator — hanya ditampilkan di atas phaseContent */
  html += buildPhaseIndicator(problem, currentPhase);

  html += '<div id="phaseContent">';
  html += buildPhaseContent(problem, pstate, currentPhase);
  html += '</div>';

  html += '</section>';
  container.innerHTML = html;

  attachPhaseHandlers(problem, pstate, currentPhase);
}

/** Dispatch ke render fungsi fase yang sesuai */
function buildPhaseContent(problem, pstate, phase) {
  switch (phase) {
    case 'identify':
      return buildPhaseIdentify(problem, pstate);
    case 'model':
      return buildPhaseModel(problem, pstate);
    case 'order':
      return buildPhaseOrder(problem, pstate);
    case 'calc':
      return buildPhaseCalc(problem, pstate);
    case 'answer':
      return buildPhaseAnswer(problem, pstate);
    case 'verify':
      return buildPhaseVerify(problem, pstate);
    default:
      return '<p style="color:var(--color-error-strong);">Fase tidak dikenali.</p>';
  }
}

/* ---- Fase 1: Identifikasi ---- */
function buildPhaseIdentify(problem, pstate) {
  var ph = pstate.phases.identify;
  var identify = problem.identify;
  var isLocked = ph.completed;

  var html = '<div class="panel">';
  html += '<h3>Langkah: Identifikasi Informasi</h3>';
  html += '<p>' + esc(identify.instruction) + '</p>';
  html += '<ul class="identify-list" id="identifyList">';

  identify.items.forEach(function (item) {
    var isChecked = ph.selected.indexOf(item.id) !== -1;
    var extraCls = '';
    if (isLocked && isChecked && item.relevant) extraCls = ' is-correct-revealed';
    else if (isLocked && isChecked && !item.relevant) extraCls = ' is-wrong-revealed';
    else if (isLocked && !isChecked && item.relevant)
      extraCls = ' is-wrong-revealed'; /* yang seharusnya dipilih tapi tidak */
    else if (isChecked) extraCls = ' is-checked';

    var cls = 'identify-item' + extraCls + (isLocked ? ' is-locked' : '');
    html +=
      '<li><button type="button" class="' +
      cls +
      '" data-itemid="' +
      esc(item.id) +
      '" role="checkbox" aria-checked="' +
      isChecked +
      '">';
    html += '<span class="identify-checkbox"></span>';
    html += '<span class="identify-item__text">' + esc(item.text) + '</span>';
    html += '</button></li>';
  });
  html += '</ul>';

  if (ph.completed) {
    html += buildFeedbackBox('success', '✓', esc(identify.feedbackCorrect));
    html +=
      '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="phaseNextBtn">Lanjut: Tentukan Operasi →</button></div>';
  } else {
    if (ph.attempts > 0 && !ph.correct) {
      html += buildFeedbackBox('error', '✗', esc(identify.feedbackWrong));
    }
    var hintLevel =
      ph.attempts >= MAX_ATTEMPTS_BEFORE_HINT
        ? Math.min(identify.hints.length, ph.attempts - MAX_ATTEMPTS_BEFORE_HINT + 1)
        : 0;
    html += buildHints(identify.hints, hintLevel);
    html += '<div class="btn-group">';
    if (hintLevel < identify.hints.length && ph.attempts >= 1) {
      html +=
        '<button type="button" class="btn btn--ghost btn--small" id="hintBtn">Petunjuk</button>';
    }
    html +=
      '<button type="button" class="btn btn--primary" id="phaseCheckBtn"' +
      (ph.selected.length === 0 ? ' disabled' : '') +
      '>Periksa Pilihan</button>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

/* ---- Fase 2: Model Operasi ---- */
function buildPhaseModel(problem, pstate) {
  var ph = pstate.phases.model;
  var model = problem.model;
  var isLocked = ph.completed;

  var html = '<div class="panel">';
  html += '<h3>Langkah: Tentukan Operasi</h3>';
  html += '<p>' + esc(model.instruction) + '</p>';
  html += '<div class="options-grid options-grid--2col">';

  model.options.forEach(function (opt) {
    var cls = 'option-card';
    if (isLocked) {
      cls += ' is-locked';
      if (opt.correct) cls += ' is-correct';
      else if (ph.lastCheckedId === opt.id) cls += ' is-wrong';
    } else if (ph.lastCheckedId && !ph.correct && ph.lastCheckedId === opt.id) {
      cls += ' is-wrong';
    } else if (ph.selected === opt.id) {
      cls += ' is-selected';
    }
    html += '<button type="button" class="' + cls + '" data-optid="' + esc(opt.id) + '">';
    html += '<span class="option-card__marker">' + esc(opt.id.toUpperCase()) + '</span>';
    html +=
      '<span class="option-card__body"><span class="option-card__expr">' +
      opt.expr +
      '</span></span>';
    html += '</button>';
  });
  html += '</div>';

  /* Feedback setelah submit */
  if (ph.attempts > 0 && ph.lastCheckedId) {
    var selOpt = model.options.find(function (o) {
      return o.id === ph.lastCheckedId;
    });
    if (selOpt) {
      html += buildFeedbackBox(
        selOpt.correct ? 'success' : 'error',
        selOpt.correct ? '✓' : '✗',
        esc(selOpt.feedback)
      );
    }
  }

  html += buildHints(model.hints, ph.hintLevel);

  if (ph.completed) {
    html +=
      '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="phaseNextBtn">Lanjut →</button></div>';
  } else {
    html += '<div class="btn-group">';
    if (ph.hintLevel < model.hints.length && ph.attempts >= 1) {
      html +=
        '<button type="button" class="btn btn--ghost btn--small" id="hintBtn">Petunjuk</button>';
    }
    html +=
      '<button type="button" class="btn btn--primary" id="phaseCheckBtn" ' +
      (!ph.selected ? 'disabled' : '') +
      '>Periksa</button>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

/* ---- Fase 3: Urutan Operasi ---- */
function buildPhaseOrder(problem, pstate) {
  var ph = pstate.phases.order;
  var order = problem.order;
  if (!order) return ''; /* tidak seharusnya terpanggil */

  var isLocked = ph.completed;

  var html = '<div class="panel">';
  html += '<h3>Langkah: Urutan Operasi</h3>';
  html += '<p>' + esc(order.instruction) + '</p>';
  html += '<div class="options-grid options-grid--list">';

  order.options.forEach(function (opt) {
    var cls = 'option-card';
    if (isLocked) {
      cls += ' is-locked';
      if (opt.correct) cls += ' is-correct';
      else if (ph.lastCheckedId === opt.id) cls += ' is-wrong';
    } else if (ph.lastCheckedId && !ph.correct && ph.lastCheckedId === opt.id) {
      cls += ' is-wrong';
    } else if (ph.selected === opt.id) {
      cls += ' is-selected';
    }
    html += '<button type="button" class="' + cls + '" data-optid="' + esc(opt.id) + '">';
    html += '<span class="option-card__marker">' + esc(opt.id.toUpperCase()) + '</span>';
    html +=
      '<span class="option-card__body"><span style="font-size:0.95rem;">' +
      esc(opt.label) +
      '</span></span>';
    html += '</button>';
  });
  html += '</div>';

  if (ph.attempts > 0 && ph.lastCheckedId) {
    var selOpt = order.options.find(function (o) {
      return o.id === ph.lastCheckedId;
    });
    if (selOpt) {
      html += buildFeedbackBox(
        selOpt.correct ? 'success' : 'error',
        selOpt.correct ? '✓' : '✗',
        esc(selOpt.feedback)
      );
    }
  }

  html += buildHints(order.hints, ph.hintLevel);

  if (ph.completed) {
    html +=
      '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="phaseNextBtn">Lanjut: Hitung Bertahap →</button></div>';
  } else {
    html += '<div class="btn-group">';
    if (ph.hintLevel < order.hints.length && ph.attempts >= 1) {
      html +=
        '<button type="button" class="btn btn--ghost btn--small" id="hintBtn">Petunjuk</button>';
    }
    html +=
      '<button type="button" class="btn btn--primary" id="phaseCheckBtn" ' +
      (ph.selected ? '' : 'disabled') +
      '>Periksa</button>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

/* ---- Fase 4: Hitung Bertahap ---- */
function buildPhaseCalc(problem, pstate) {
  var ph = pstate.phases.calc;
  var calc = problem.calc;

  var html = '<div class="panel">';
  html += '<h3>Langkah: Hitung Bertahap</h3>';
  html +=
    '<p style="color:var(--color-ink-muted);font-size:0.9rem;">' + esc(calc.instruction) + '</p>';

  calc.steps.forEach(function (step, i) {
    var ss = ph.substeps[i];
    var isDone = ss.correct;
    var isActive = !isDone && !isAnySubstepActive(ph, i);

    /* Kunci sub-langkah yang belum saatnya */
    var prevDone = i === 0 || ph.substeps[i - 1].correct;

    html += '<div class="calc-step-wrap' + (isDone ? ' is-done' : '') + '" id="calcStep' + i + '">';
    html += '<div class="calc-step__instruction">' + esc(step.instruction) + '</div>';
    html += '<div class="calc-step__prompt">' + esc(step.prompt) + '</div>';

    if (isDone) {
      html += '<div class="calc-step__result-display">✓ ' + esc(step.correctDisplay) + '</div>';
    } else if (prevDone) {
      /* Sub-langkah aktif */
      var errorMsg = ss.errorMsg || '';
      html += '<div class="calc-input-row">';
      html += '<label for="calcInput' + i + '">' + esc(step.inputLabel) + '</label>';
      html +=
        '<input type="text" id="calcInput' +
        i +
        '"' +
        ' class="input-text' +
        (errorMsg ? ' has-error' : '') +
        '"' +
        ' placeholder="' +
        esc(step.inputPlaceholder) +
        '"' +
        ' value="' +
        esc(ss.input || '') +
        '"' +
        ' autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"' +
        ' data-substep="' +
        i +
        '">';
      html += '</div>';

      if (errorMsg) html += '<div class="field-error">' + esc(errorMsg) + '</div>';
      if (ss.attempts > 0 && !ss.correct) {
        html += buildFeedbackBox('error', '✗', esc(step.feedbackWrong));
      }
      html += buildHints(step.hints, ss.hintLevel);
      html += '<div class="btn-group">';
      if (ss.hintLevel < step.hints.length && ss.attempts >= 1) {
        html +=
          '<button type="button" class="btn btn--ghost btn--small" id="calcHintBtn' +
          i +
          '" data-substep="' +
          i +
          '">Petunjuk</button>';
      }
      html +=
        '<button type="button" class="btn btn--primary" id="calcCheckBtn' +
        i +
        '" data-substep="' +
        i +
        '">Periksa</button>';
      html += '</div>';
    } else {
      /* Sub-langkah belum bisa diakses */
      html +=
        '<p style="color:var(--color-ink-muted);font-size:0.88rem;font-style:italic;">Selesaikan langkah sebelumnya terlebih dahulu.</p>';
    }

    html += '</div>';
  });

  if (ph.completed) {
    html +=
      '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="phaseNextBtn">Lanjut: Jawaban Akhir →</button></div>';
  }
  html += '</div>';
  return html;
}

function isAnySubstepActive(ph, idx) {
  /* Apakah sub-langkah sebelum idx belum selesai? */
  for (var i = 0; i < idx; i++) {
    if (!ph.substeps[i].correct) return true;
  }
  return false;
}

/* ---- Fase 5: Jawaban Akhir ---- */
function buildPhaseAnswer(problem, pstate) {
  var ph = pstate.phases.answer;
  var answer = problem.answer;
  var isDone = ph.completed;

  var html = '<div class="panel">';
  html += '<h3>Langkah: Jawaban Akhir</h3>';
  html += '<p style="font-size:1rem;font-weight:600;">' + esc(answer.prompt) + '</p>';

  if (isDone) {
    html +=
      '<div class="calc-step__result-display" style="font-size:1.1rem;padding:var(--space-3) var(--space-4);">✓ ' +
      esc(answer.correctDisplay) +
      (answer.unit ? ' ' + answer.unit : '') +
      '</div>';
    html += buildFeedbackBox('success', '✓', esc(answer.feedbackCorrect));
    html +=
      '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="phaseNextBtn">Lanjut: Periksa Kewajaran →</button></div>';
  } else {
    var errorMsg = ph.errorMsg || '';
    html += '<div class="field-group">';
    html +=
      '<label for="answerInput">' +
      esc(answer.inputLabel) +
      (answer.unit ? ' (' + answer.unit + ')' : '') +
      '</label>';
    html += '<div class="calc-input-row" style="margin-top:var(--space-2);">';
    html +=
      '<input type="text" id="answerInput" class="input-text' +
      (errorMsg ? ' has-error' : '') +
      '"' +
      ' placeholder="' +
      esc(answer.inputPlaceholder) +
      '"' +
      ' value="' +
      esc(ph.input || '') +
      '"' +
      ' autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"' +
      ' style="max-width:220px;">';
    if (answer.unit)
      html +=
        '<span style="font-size:0.95rem;color:var(--color-ink-muted);">' +
        esc(answer.unit) +
        '</span>';
    html += '</div>';
    html += '</div>';

    if (errorMsg) html += '<div class="field-error">' + esc(errorMsg) + '</div>';
    if (ph.attempts > 0 && !ph.correct) {
      html += buildFeedbackBox('error', '✗', esc(answer.feedbackWrong));
    }
    html += buildHints(answer.hints, ph.hintLevel);
    html += '<div class="btn-group">';
    if (ph.hintLevel < answer.hints.length && ph.attempts >= 1) {
      html +=
        '<button type="button" class="btn btn--ghost btn--small" id="hintBtn">Petunjuk</button>';
    }
    html +=
      '<button type="button" class="btn btn--primary" id="phaseCheckBtn">Periksa Jawaban</button>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

/* ---- Fase 6: Periksa Kewajaran ---- */
function buildPhaseVerify(problem, pstate) {
  var ph = pstate.phases.verify;
  var verify = problem.verify;
  var isLocked = ph.completed;

  var html = '<div class="panel">';
  html += '<h3>Langkah: Periksa Kewajaran</h3>';
  html += '<p>' + esc(verify.question) + '</p>';
  html += '<div class="options-grid options-grid--list">';

  verify.options.forEach(function (opt) {
    var cls = 'option-card';
    if (isLocked) {
      cls += ' is-locked';
      if (opt.correct) cls += ' is-correct';
      else if (ph.lastCheckedId === opt.id) cls += ' is-wrong';
    } else if (ph.lastCheckedId && !ph.correct && ph.lastCheckedId === opt.id) {
      cls += ' is-wrong';
    } else if (ph.selected === opt.id) {
      cls += ' is-selected';
    }
    html += '<button type="button" class="' + cls + '" data-optid="' + esc(opt.id) + '">';
    html += '<span class="option-card__marker">' + esc(opt.id.slice(1).toUpperCase()) + '</span>';
    html +=
      '<span class="option-card__body"><span style="font-size:0.9rem;">' +
      esc(opt.text) +
      '</span></span>';
    html += '</button>';
  });
  html += '</div>';

  if (ph.attempts > 0 && ph.lastCheckedId) {
    var selOpt = verify.options.find(function (o) {
      return o.id === ph.lastCheckedId;
    });
    if (selOpt) {
      html += buildFeedbackBox(
        selOpt.correct ? 'success' : 'error',
        selOpt.correct ? '✓' : '✗',
        esc(selOpt.correct ? verify.feedbackCorrect : verify.feedbackWrong)
      );
    }
  }

  if (ph.completed) {
    html +=
      '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary btn--large" id="phaseNextBtn">Selesai — Lihat Rangkuman →</button></div>';
  } else {
    html += '<div class="btn-group btn-group--end">';
    html +=
      '<button type="button" class="btn btn--primary" id="phaseCheckBtn" ' +
      (ph.selected ? '' : 'disabled') +
      '>Periksa</button>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

/* ---- Review setelah soal selesai ---- */
function renderProblemReview(problem, pstate, container) {
  var pIdx = State.currentProblemIdx;
  var isLastProblem = pIdx >= DATA.problems.length - 1;
  var allDone = State.problemStates.every(function (ps) {
    return ps.status === 'complete';
  });

  var html =
    '<section aria-label="Rangkuman Soal">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 3 — LATIHAN</span>' +
    '<p class="stage-head__goal">Rangkuman penyelesaian soal ' +
    (pIdx + 1) +
    '.</p>' +
    '</div>';

  /* Problem dots */
  html +=
    '<div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-4);">';
  html += buildProblemDots(pIdx, State.problemStates);
  html += '</div>';

  /* Problem card */
  html += '<div class="problem-card">';
  html +=
    '<div class="problem-card__kicker"><span>Soal ' +
    (pIdx + 1) +
    ': ' +
    esc(problem.title) +
    ' — Selesai</span></div>';
  html += '<p class="problem-card__context">' + problem.context + '</p>';
  html += '<p class="problem-card__question">' + esc(problem.question) + '</p>';
  html += '</div>';

  /* Performance summary */
  var totalHints = pstate.totalHints;
  var totalAttempts = pstate.totalAttempts;
  html += '<div class="panel panel--success panel--compact" style="margin-bottom:var(--space-4);">';
  html += '<div style="display:flex;gap:var(--space-5);flex-wrap:wrap;">';
  html +=
    '<div><span style="font-size:1.5rem;font-weight:700;color:var(--color-success-strong);">✓</span> <span style="font-size:0.9rem;color:var(--color-success-strong);">Soal selesai</span></div>';
  html +=
    '<div><span style="font-size:0.9rem;color:var(--color-ink-muted);">Total percobaan: </span><strong>' +
    totalAttempts +
    '</strong></div>';
  html +=
    '<div><span style="font-size:0.9rem;color:var(--color-ink-muted);">Petunjuk digunakan: </span><strong>' +
    totalHints +
    '</strong></div>';
  html += '</div></div>';

  /* Penyelesaian lengkap */
  html += '<div class="panel panel--compact">';
  html += '<h3>Penyelesaian Lengkap</h3>';
  html += '<ol class="solution-steps">';
  problem.solution.steps.forEach(function (step) {
    html +=
      '<li class="solution-step"><span class="solution-step__icon">→</span><span class="solution-step__text">' +
      esc(step) +
      '</span></li>';
  });
  html += '</ol></div>';

  /* Navigasi antar soal */
  html += '<div class="problem-nav">';
  html += '<div class="btn-group">';
  if (pIdx > 0) {
    html +=
      '<button type="button" class="btn btn--ghost" id="prevProblemBtn">← Soal Sebelumnya</button>';
  }
  html +=
    '<button type="button" class="btn btn--outline-primary" id="retryProblemBtn">Ulangi Soal Ini</button>';
  html += '</div>';
  html += '<div class="btn-group btn-group--end">';
  if (!isLastProblem) {
    html +=
      '<button type="button" class="btn btn--primary btn--large" id="nextProblemBtn">Soal Berikutnya →</button>';
  } else {
    html +=
      '<button type="button" class="btn btn--primary btn--large" id="allDoneBtn">Lihat Hasil Akhir →</button>';
  }
  html += '</div></div>';

  html += '</section>';
  container.innerHTML = html;

  /* Event listeners */
  var prevBtn = document.getElementById('prevProblemBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      State.currentProblemIdx--;
      saveState();
      renderLatihan(document.getElementById('stageContainer'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var retryBtn = document.getElementById('retryProblemBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      resetProblemState(pIdx);
      saveState();
      renderLatihan(document.getElementById('stageContainer'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var nextBtn2 = document.getElementById('nextProblemBtn');
  if (nextBtn2) {
    nextBtn2.addEventListener('click', function () {
      State.currentProblemIdx++;
      saveState();
      renderLatihan(document.getElementById('stageContainer'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var allDoneBtn = document.getElementById('allDoneBtn');
  if (allDoneBtn) {
    allDoneBtn.addEventListener('click', function () {
      completeStage('latihan');
      navigateTo('hasil');
    });
  }
}

function resetProblemState(pIdx) {
  var problem = DATA.problems[pIdx];
  var calcSubsteps = problem.calc.steps.map(function () {
    return { attempts: 0, hintLevel: 0, input: '', correct: false, revealed: false };
  });
  State.problemStates[pIdx] = {
    problemId: problem.id,
    status: 'not-started',
    currentPhase: 'identify',
    reviewShown: false,
    phases: {
      identify: { completed: false, attempts: 0, selected: [], correct: false },
      model: {
        completed: false,
        attempts: 0,
        hintLevel: 0,
        selected: null,
        lastCheckedId: null,
        correct: false,
      },
      order: {
        completed: false,
        attempts: 0,
        hintLevel: 0,
        selected: null,
        lastCheckedId: null,
        correct: false,
        skipped: problem.order === null,
      },
      calc: { completed: false, substeps: calcSubsteps },
      answer: {
        completed: false,
        attempts: 0,
        hintLevel: 0,
        input: '',
        correct: false,
        revealed: false,
      },
      verify: {
        completed: false,
        attempts: 0,
        selected: null,
        lastCheckedId: null,
        correct: false,
      },
    },
    totalHints: 0,
    totalAttempts: 0,
    correctFirstTry: 0,
  };
}

/** Pindah ke fase berikutnya */
function advanceToNextPhase(problem, pstate) {
  var currentPhase = pstate.currentPhase;
  var order = ['identify', 'model'];
  if (problem.order !== null) order.push('order');
  order.push('calc', 'answer', 'verify');

  var idx = order.indexOf(currentPhase);
  if (idx === -1 || idx >= order.length - 1) {
    /* Selesai semua fase */
    pstate.status = 'complete';
    pstate.reviewShown = false;
  } else {
    pstate.currentPhase = order[idx + 1];
  }
  saveState();
}

/* ---- Attach event handlers untuk fase aktif ---- */
function attachPhaseHandlers(problem, pstate, phase) {
  /* Tombol lanjut (setelah fase selesai) */
  var nextBtn = document.getElementById('phaseNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      advanceToNextPhase(problem, pstate);
      renderLatihan(document.getElementById('stageContainer'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (phase === 'identify') attachIdentifyHandlers(problem, pstate);
  else if (phase === 'model') attachMCHandlers(problem, pstate, phase);
  else if (phase === 'order') attachMCHandlers(problem, pstate, phase);
  else if (phase === 'calc') attachCalcHandlers(problem, pstate);
  else if (phase === 'answer') attachAnswerHandlers(problem, pstate);
  else if (phase === 'verify') attachMCHandlers(problem, pstate, phase);
}

/* ---- Identify handlers ---- */
function attachIdentifyHandlers(problem, pstate) {
  var ph = pstate.phases.identify;

  /* Checkbox toggle */
  document.querySelectorAll('.identify-item[data-itemid]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (ph.completed) return;
      var itemId = this.dataset.itemid;
      var idx = ph.selected.indexOf(itemId);
      if (idx === -1) ph.selected.push(itemId);
      else ph.selected.splice(idx, 1);
      /* Update aria-checked */
      this.setAttribute('aria-checked', ph.selected.indexOf(itemId) !== -1 ? 'true' : 'false');
      this.classList.toggle('is-checked', ph.selected.indexOf(itemId) !== -1);
      var checkbox = this.querySelector('.identify-checkbox');
      /* Enable check button jika ada pilihan */
      var checkBtn = document.getElementById('phaseCheckBtn');
      if (checkBtn) checkBtn.disabled = ph.selected.length === 0;
      saveState();
    });
  });

  var checkBtn = document.getElementById('phaseCheckBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      checkIdentify(problem, pstate);
    });
  }

  var hintBtn = document.getElementById('hintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      addHint(pstate, 'identify');
      saveState();
      renderLatihan(document.getElementById('stageContainer'));
    });
  }
}

function checkIdentify(problem, pstate) {
  var ph = pstate.phases.identify;
  var identify = problem.identify;
  ph.attempts++;
  pstate.totalAttempts++;

  /* Cek: semua item relevan dipilih, dan tidak ada yang tidak relevan dipilih */
  var relevant = identify.items
    .filter(function (i) {
      return i.relevant;
    })
    .map(function (i) {
      return i.id;
    });
  var notRelevant = identify.items
    .filter(function (i) {
      return !i.relevant;
    })
    .map(function (i) {
      return i.id;
    });

  var allRelevantSelected = relevant.every(function (id) {
    return ph.selected.indexOf(id) !== -1;
  });
  var noIrrelevantSelected = notRelevant.every(function (id) {
    return ph.selected.indexOf(id) === -1;
  });

  ph.correct = allRelevantSelected && noIrrelevantSelected;

  if (ph.correct) {
    ph.completed = true;
    if (ph.attempts === 1) pstate.correctFirstTry++;
  } else {
    if (ph.attempts >= MAX_ATTEMPTS_BEFORE_HINT) {
      addHint(pstate, 'identify');
    }
  }
  saveState();
  renderLatihan(document.getElementById('stageContainer'));
  scrollToPhaseContent();
}

/* ---- Multiple choice handlers (model, order, verify) ---- */
function attachMCHandlers(problem, pstate, phase) {
  document.querySelectorAll('.option-card[data-optid]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var ph = pstate.phases[phase];
      if (ph.completed) return;
      ph.selected = this.dataset.optid;
      /* Enable check button */
      var checkBtn = document.getElementById('phaseCheckBtn');
      if (checkBtn) checkBtn.disabled = false;
      /* Visual update: riset semua state lalu tandai yang baru dipilih */
      document.querySelectorAll('.option-card[data-optid]').forEach(function (b) {
        b.classList.remove('is-selected', 'is-wrong');
        b.setAttribute('aria-pressed', 'false');
      });
      this.classList.add('is-selected');
      this.setAttribute('aria-pressed', 'true');
      saveState();
    });
  });

  var checkBtn = document.getElementById('phaseCheckBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      checkMCPhase(problem, pstate, phase);
    });
  }

  var hintBtn = document.getElementById('hintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      addHint(pstate, phase);
      saveState();
      renderLatihan(document.getElementById('stageContainer'));
    });
  }
}

function checkMCPhase(problem, pstate, phase) {
  var ph = pstate.phases[phase];
  if (!ph.selected) return; /* tidak ada pilihan */
  ph.attempts++;
  pstate.totalAttempts++;
  ph.lastCheckedId = ph.selected; /* simpan untuk feedback display */

  var source =
    phase === 'model'
      ? problem.model.options
      : phase === 'order'
        ? problem.order.options
        : problem.verify.options;

  var selOpt = source.find(function (o) {
    return o.id === ph.selected;
  });
  ph.correct = !!(selOpt && selOpt.correct);

  if (ph.correct) {
    ph.completed = true;
    if (ph.attempts === 1) pstate.correctFirstTry++;
  } else {
    /* Beri kesempatan retry; reset pilihan agar user harus pilih lagi */
    ph.selected = null;
    if (ph.attempts >= MAX_ATTEMPTS_BEFORE_HINT) {
      addHint(pstate, phase);
    }
  }
  saveState();
  renderLatihan(document.getElementById('stageContainer'));
  scrollToPhaseContent();
}

/* ---- Calc handlers ---- */
function attachCalcHandlers(problem, pstate) {
  var ph = pstate.phases.calc;

  document.querySelectorAll('[id^="calcCheckBtn"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var substepIdx = parseInt(this.dataset.substep);
      checkCalcSubstep(problem, pstate, substepIdx);
    });
  });

  document.querySelectorAll('[id^="calcHintBtn"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var substepIdx = parseInt(this.dataset.substep);
      var ss = ph.substeps[substepIdx];
      ss.hintLevel = Math.min(problem.calc.steps[substepIdx].hints.length, (ss.hintLevel || 0) + 1);
      pstate.totalHints++;
      saveState();
      renderLatihan(document.getElementById('stageContainer'));
    });
  });

  /* Enter key support */
  document.querySelectorAll('[id^="calcInput"]').forEach(function (inp) {
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var substepIdx = parseInt(inp.dataset.substep);
        var checkBtn = document.getElementById('calcCheckBtn' + substepIdx);
        if (checkBtn) checkBtn.click();
      }
    });
  });
}

function checkCalcSubstep(problem, pstate, substepIdx) {
  var ph = pstate.phases.calc;
  var ss = ph.substeps[substepIdx];
  var step = problem.calc.steps[substepIdx];
  var inp = document.getElementById('calcInput' + substepIdx);
  var raw = inp ? inp.value : '';
  ss.input = raw;

  var parsed = parseUserInput(raw);
  ss.attempts++;
  pstate.totalAttempts++;

  if (parsed.error === 'empty') {
    ss.errorMsg = 'Masukkan jawaban terlebih dahulu.';
    ss.correct = false;
  } else if (parsed.error === 'invalid') {
    ss.errorMsg = 'Format tidak valid. Gunakan angka (koma atau titik untuk desimal). Contoh: 0,75';
    ss.correct = false;
  } else {
    ss.errorMsg = '';
    if (step.answerType === 'numerator') {
      var intVal = Math.round(parsed.value);
      ss.correct = Math.abs(parsed.value - intVal) <= 0.001 && intVal === step.answer;
    } else {
      ss.correct = approxEqual(parsed.value, step.answer, step.tolerance || 0.01);
    }
  }

  if (ss.correct) {
    if (ss.attempts === 1) pstate.correctFirstTry++;
    /* Periksa apakah semua sub-langkah selesai */
    var allDone = ph.substeps.every(function (s) {
      return s.correct;
    });
    if (allDone) {
      ph.completed = true;
    }
  } else {
    if (ss.attempts >= MAX_ATTEMPTS_BEFORE_HINT && ss.hintLevel < step.hints.length) {
      ss.hintLevel = Math.min(step.hints.length, (ss.hintLevel || 0) + 1);
      pstate.totalHints++;
    }
  }

  saveState();
  renderLatihan(document.getElementById('stageContainer'));
  /* Scroll ke sub-langkah yang aktif */
  var el = document.getElementById('calcStep' + substepIdx);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ---- Answer handlers ---- */
function attachAnswerHandlers(problem, pstate) {
  var ph = pstate.phases.answer;

  var inp = document.getElementById('answerInput');
  var checkBtn = document.getElementById('phaseCheckBtn');
  var hintBtn = document.getElementById('hintBtn');

  if (inp) {
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && checkBtn) checkBtn.click();
    });
  }

  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      var raw = inp ? inp.value : '';
      var parsed = parseUserInput(raw);
      ph.input = raw;
      ph.attempts++;
      pstate.totalAttempts++;

      if (parsed.error === 'empty') {
        ph.errorMsg = 'Masukkan jawaban terlebih dahulu.';
        ph.correct = false;
      } else if (parsed.error === 'invalid') {
        ph.errorMsg = 'Format tidak valid. Gunakan angka (koma atau titik). Contoh: 1,25';
        ph.correct = false;
      } else {
        ph.errorMsg = '';
        ph.correct = approxEqual(
          parsed.value,
          problem.answer.answer,
          problem.answer.tolerance || 0.01
        );
      }

      if (ph.correct) {
        ph.completed = true;
        if (ph.attempts === 1) pstate.correctFirstTry++;
      } else {
        if (ph.attempts >= MAX_ATTEMPTS_BEFORE_HINT && ph.hintLevel < problem.answer.hints.length) {
          addHint(pstate, 'answer');
        }
      }
      saveState();
      renderLatihan(document.getElementById('stageContainer'));
      scrollToPhaseContent();
    });
  }

  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      addHint(pstate, 'answer');
      saveState();
      renderLatihan(document.getElementById('stageContainer'));
    });
  }
}

/* ---- Utility: tambah hint ke phase ---- */
function addHint(pstate, phase) {
  var ph = pstate.phases[phase];
  if (!ph) return;
  if (ph.hintLevel === undefined) ph.hintLevel = 0;
  var sourceHints;
  var pIdx = State.currentProblemIdx;
  var problem = DATA.problems[pIdx];
  switch (phase) {
    case 'identify':
      sourceHints = problem.identify.hints;
      break;
    case 'model':
      sourceHints = problem.model.hints;
      break;
    case 'order':
      sourceHints = problem.order ? problem.order.hints : [];
      break;
    case 'answer':
      sourceHints = problem.answer.hints;
      break;
    default:
      return;
  }
  if (ph.hintLevel < sourceHints.length) {
    ph.hintLevel++;
    pstate.totalHints++;
  }
}

function scrollToPhaseContent() {
  var el = document.getElementById('phaseContent');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ============================================================
   9. STAGE: HASIL
   ============================================================ */

function renderHasil(container) {
  var totalProblems = DATA.problems.length;
  var completed = State.problemStates.filter(function (ps) {
    return ps.status === 'complete';
  }).length;
  var totalHints = State.problemStates.reduce(function (acc, ps) {
    return acc + ps.totalHints;
  }, 0);
  var totalAttempts = State.problemStates.reduce(function (acc, ps) {
    return acc + ps.totalAttempts;
  }, 0);
  var correctFirstTry = State.problemStates.reduce(function (acc, ps) {
    return acc + ps.correctFirstTry;
  }, 0);

  /* Total fase yang diselesaikan benar di percobaan pertama */
  var totalPhases = State.problemStates.reduce(function (acc, ps) {
    var count = 0;
    if (ps.phases.identify.completed) count++;
    if (ps.phases.model.completed) count++;
    if (!ps.phases.order.skipped && ps.phases.order.completed) count++;
    if (ps.phases.calc.completed) count++;
    if (ps.phases.answer.completed) count++;
    if (ps.phases.verify.completed) count++;
    return acc + count;
  }, 0);

  var html =
    '<section aria-label="Hasil Latihan">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 4 — HASIL</span>' +
    '<p class="stage-head__goal">Ringkasan performa latihan kamu.</p>' +
    '</div>' +
    '<div class="panel panel--hero">' +
    '<h2>Latihan Selesai!</h2>' +
    '<p>' +
    esc(completed + ' dari ' + totalProblems + ' soal berhasil diselesaikan.') +
    '</p>' +
    '</div>' +
    '<div class="stats-grid">' +
    buildStatCard(completed + '/' + totalProblems, 'Soal diselesaikan') +
    buildStatCard(totalAttempts, 'Total percobaan') +
    buildStatCard(totalHints, 'Petunjuk digunakan') +
    buildStatCard(correctFirstTry, 'Langkah benar pertama kali') +
    '</div>';

  /* Ringkasan per soal */
  html += '<div class="panel panel--compact"><h3>Ringkasan Per Soal</h3>';
  html += '<ol style="padding-left:1.2em;">';
  State.problemStates.forEach(function (ps, i) {
    var p = DATA.problems[i];
    var status = ps.status === 'complete' ? '✓ Selesai' : '– Belum selesai';
    var diffLabel = p.difficulty === 1 ? 'Mudah' : p.difficulty === 2 ? 'Sedang' : 'Sulit';
    html += '<li style="margin-bottom:var(--space-2);font-size:0.92rem;">';
    html += '<strong>Soal ' + (i + 1) + ': ' + esc(p.title) + '</strong> ';
    html += '<span style="color:var(--color-ink-muted);">(' + esc(diffLabel) + ')</span> — ';
    html +=
      '<span style="color:' +
      (ps.status === 'complete' ? 'var(--color-success-strong)' : 'var(--color-ink-muted)') +
      ';">' +
      status +
      '</span>';
    html +=
      ' <span style="color:var(--color-ink-muted);font-size:0.85rem;">| Percobaan: ' +
      ps.totalAttempts +
      ', Petunjuk: ' +
      ps.totalHints +
      '</span>';
    html += '</li>';
  });
  html += '</ol></div>';

  html += '<div class="panel panel--compact panel--warning">';
  html += '<p style="margin:0;font-size:0.88rem;color:var(--color-warning-strong);">';
  html +=
    '<strong>Catatan:</strong> Hasil di atas adalah ringkasan latihan mandiri dalam media ini. ';
  html +=
    'Ini bukan nilai akhir sekolah. Guru kamu tetap akan menilai kemampuanmu melalui berbagai bentuk asesmen lainnya.';
  html += '</p></div>';

  html += '<div class="btn-group btn-group--spread">';
  html +=
    '<button type="button" class="btn btn--ghost" id="backToLatihanBtn">← Kembali ke Latihan</button>';
  html +=
    '<button type="button" class="btn btn--primary btn--large" id="goRefleksiBtn">Lanjut ke Refleksi →</button>';
  html += '</div>';

  html += '</section>';
  container.innerHTML = html;

  document.getElementById('backToLatihanBtn').addEventListener('click', function () {
    navigateTo('latihan');
  });

  document.getElementById('goRefleksiBtn').addEventListener('click', function () {
    completeStage('hasil');
    navigateTo('refleksi');
  });
}

function buildStatCard(value, label) {
  return (
    '<div class="stat-card"><div class="stat-card__num">' +
    esc(String(value)) +
    '</div><div class="stat-card__label">' +
    esc(label) +
    '</div></div>'
  );
}

/* ============================================================
   10. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var refleksi = DATA.refleksi;
  var saved = State.refleksiAnswers || {};
  var isSaved = State.refleksiSaved || false;

  var html =
    '<section aria-label="Refleksi Pembelajaran">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 5 — REFLEKSI</span>' +
    '<p class="stage-head__goal">Luangkan waktu sejenak untuk merefleksikan proses belajarmu hari ini.</p>' +
    '</div>' +
    '<div class="panel panel--compact panel--info" style="margin-bottom:var(--space-4);">' +
    '<p style="margin:0;font-size:0.92rem;">Tidak ada jawaban yang benar atau salah di sini. Refleksi ini untukmu sendiri dan gurumu.</p>' +
    '</div>';

  refleksi.questions.forEach(function (q) {
    html += '<div class="panel panel--compact">';
    html += '<p style="font-weight:600;margin-bottom:var(--space-3);">' + esc(q.prompt) + '</p>';

    if (q.type === 'mc') {
      q.options.forEach(function (opt, i) {
        var isChecked = saved[q.id] === opt;
        html +=
          '<label style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-2);cursor:pointer;font-size:0.92rem;">';
        html +=
          '<input type="radio" name="refleksi_' +
          esc(q.id) +
          '" value="' +
          i +
          '"' +
          (isChecked ? ' checked' : '') +
          (isSaved ? ' disabled' : '') +
          '>';
        html += esc(opt);
        html += '</label>';
      });
    }

    if (q.type === 'text') {
      html +=
        '<textarea class="input-textarea" name="refleksi_' +
        esc(q.id) +
        '" placeholder="' +
        esc(q.placeholder) +
        '"' +
        (isSaved ? ' disabled' : '') +
        '>' +
        esc(saved[q.id] || '') +
        '</textarea>';
    }

    html += '</div>';
  });

  if (!isSaved) {
    html += '<div class="btn-group btn-group--end">';
    html +=
      '<button type="button" class="btn btn--primary btn--large" id="saveRefleksiBtn">Simpan Refleksi & Selesai</button>';
    html += '</div>';
  } else {
    html += '<div class="panel panel--success panel--compact">';
    html +=
      '<p style="margin:0;">Refleksi tersimpan. Terima kasih telah menyelesaikan sesi latihan ini!</p>';
    html += '</div>';
    html += '<div class="btn-group btn-group--center">';
    html +=
      '<button type="button" class="btn btn--outline-primary" id="backHasilBtn">← Kembali ke Hasil</button>';
    html += '</div>';
  }

  html += '</section>';
  container.innerHTML = html;

  var saveBtn = document.getElementById('saveRefleksiBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      /* Kumpulkan jawaban */
      refleksi.questions.forEach(function (q) {
        if (q.type === 'mc') {
          var checked = document.querySelector('input[name="refleksi_' + q.id + '"]:checked');
          if (checked) State.refleksiAnswers[q.id] = q.options[parseInt(checked.value)];
        }
        if (q.type === 'text') {
          var ta = document.querySelector('textarea[name="refleksi_' + q.id + '"]');
          if (ta) State.refleksiAnswers[q.id] = ta.value;
        }
      });
      State.refleksiSaved = true;
      completeStage('refleksi');
      saveState();
      renderRefleksi(document.getElementById('stageContainer'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var backBtn = document.getElementById('backHasilBtn');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      navigateTo('hasil');
    });
  }
}

/* ============================================================
   11. HELPER UI
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
   12. INIT
   ============================================================ */

function init() {
  /* Inisialisasi state */
  initProblemStates();

  /* Coba muat state tersimpan */
  var loaded = loadState();
  if (!loaded) {
    /* State awal sudah diset di deklarasi State */
  }

  /* Pastikan problemStates selalu valid setelah load */
  if (!Array.isArray(State.problemStates) || State.problemStates.length !== DATA.problems.length) {
    initProblemStates();
  }

  /* Bangun stage nav */
  buildStageNav();
  updateStageNav();
  updateProgress();

  /* Render tahap saat ini */
  renderCurrentStage();

  /* Reset button */
  var resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      showResetModal();
    });
  }

  /* Modal buttons */
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
      renderCurrentStage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showNotice('Progress berhasil di-reset.');
    });
  }

  /* Tutup modal jika klik backdrop */
  var modal = document.getElementById('resetModal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) hideResetModal();
    });
  }

  /* Escape key tutup modal */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hideResetModal();
  });
}

/* Jalankan saat DOM siap */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
