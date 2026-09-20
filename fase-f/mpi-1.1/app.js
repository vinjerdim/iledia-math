'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Barisan dan Deret Aritmetika — Fase F SMK RPL

   Utilitas bersama (esc, parseInputInt, showNotice, buildFeedbackBox,
   mesin navigasi tahap) berada di shared/engine.js.

   Bagian:
    1. Utilitas
    2. Konstanta
    3. State & Storage
    4. Navigasi
    5. Utilitas Render
    6. Stage: Orientasi
    7. Stage: Eksplorasi Pola
    8. Stage: Temukan Rumus Uₙ
    9. Stage: Latihan Uₙ
   10. Stage: Eksplorasi Sₙ
   11. Stage: Latihan Sₙ
   12. Stage: Tantangan
   13. Stage: Refleksi
   14. Stage: Selesai
   15. Helper UI
   16. Init
   ============================================================ */

/* ============================================================
   1. UTILITAS
   ============================================================ */

function formatNumber(n) {
  var str = String(n);
  var sign = '';
  var parts = [];
  if (str.startsWith('-')) {
    sign = '-';
    str = str.slice(1);
  }
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
  'eksplorasi',
  'rumusUn',
  'latihanUn',
  'ekspSn',
  'latihanSn',
  'tantangan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Orientasi',
  'Pola',
  'Rumus Uₙ',
  'Latihan Uₙ',
  'Eksplorasi Sₙ',
  'Latihan Sₙ',
  'Tantangan',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-1-1-aritmetika-v1';

/* ============================================================
   3. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Eksplorasi Pola */
  eksplorasiCtxIdx: 0,
  eksplorasiRevealCount: [0, 0, 0],
  eksplorasiInputs: [null, null, null],
  eksplorasiDone: [false, false, false],

  /* Rumus Uₙ */
  rumusUnStep: 0,
  rumusUnStepInputs: ['', ''],
  rumusUnStepDone: [false, false],
  rumusUnFormulaShown: false,

  /* Latihan Uₙ */
  latihanUnIdx: 0,
  latihanUnExercises: [],

  /* Eksplorasi Sₙ */
  ekspSnStep: 0,
  ekspSnVerifInput: '',
  ekspSnVerifDone: false,
  ekspSnFormulaShown: false,

  /* Latihan Sₙ */
  latihanSnIdx: 0,
  latihanSnExercises: [],

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
    /* Abaikan saat storage browser tidak tersedia. */
  }
}

function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    Object.assign(State, JSON.parse(raw));
    return true;
  } catch (e) {
    /* Jika storage rusak atau tidak tersedia, lanjutkan dengan state awal. */
    return false;
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    /* Abaikan; reset state in-memory tetap dijalankan. */
  }
  State.currentStage = 'orientasi';
  State.completedStages = {};
  State.eksplorasiCtxIdx = 0;
  State.eksplorasiRevealCount = [0, 0, 0];
  State.eksplorasiInputs = [null, null, null];
  State.eksplorasiDone = [false, false, false];
  State.rumusUnStep = 0;
  State.rumusUnStepInputs = ['', ''];
  State.rumusUnStepDone = [false, false];
  State.rumusUnFormulaShown = false;
  State.latihanUnIdx = 0;
  State.latihanUnExercises = [];
  State.ekspSnStep = 0;
  State.ekspSnVerifInput = '';
  State.ekspSnVerifDone = false;
  State.ekspSnFormulaShown = false;
  State.latihanSnIdx = 0;
  State.latihanSnExercises = [];
  State.tantanganIdx = 0;
  State.tantanganExercises = [];
  State.refleksiAnswers = {};
  State.refleksiSaved = false;
  initExerciseArrays();
}

function initExerciseArrays() {
  if (!State.latihanUnExercises || State.latihanUnExercises.length !== DATA.latihanUn.soal.length) {
    State.latihanUnExercises = DATA.latihanUn.soal.map(function () {
      return { attempts: 0, hintLevel: 0, correct: false, userInput: '', revealed: false };
    });
  }
  if (!State.latihanSnExercises || State.latihanSnExercises.length !== DATA.latihanSn.soal.length) {
    State.latihanSnExercises = DATA.latihanSn.soal.map(function () {
      return { attempts: 0, hintLevel: 0, correct: false, userInput: '', revealed: false };
    });
  }
  if (!State.tantanganExercises || State.tantanganExercises.length !== DATA.tantangan.soal.length) {
    State.tantanganExercises = DATA.tantangan.soal.map(function (s) {
      return { attempts: 0, correct: false, chosen: null, checked: false, userInput: '' };
    });
  }
  if (
    !State.eksplorasiRevealCount ||
    State.eksplorasiRevealCount.length !== DATA.eksplorasi.konteks.length
  ) {
    State.eksplorasiRevealCount = DATA.eksplorasi.konteks.map(function () {
      return 0;
    });
  }
  if (!State.eksplorasiInputs || State.eksplorasiInputs.length !== DATA.eksplorasi.konteks.length) {
    State.eksplorasiInputs = DATA.eksplorasi.konteks.map(function () {
      return null;
    });
  }
  if (!State.eksplorasiDone || State.eksplorasiDone.length !== DATA.eksplorasi.konteks.length) {
    State.eksplorasiDone = DATA.eksplorasi.konteks.map(function () {
      return false;
    });
  }
  if (!State.rumusUnStepInputs || State.rumusUnStepInputs.length !== DATA.rumusUn.steps.length) {
    State.rumusUnStepInputs = DATA.rumusUn.steps.map(function () {
      return '';
    });
  }
  if (!State.rumusUnStepDone || State.rumusUnStepDone.length !== DATA.rumusUn.steps.length) {
    State.rumusUnStepDone = DATA.rumusUn.steps.map(function () {
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
    case 'eksplorasi':
      renderEksplorasi(container);
      break;
    case 'rumusUn':
      renderRumusUn(container);
      break;
    case 'latihanUn':
      renderLatihanUn(container);
      break;
    case 'ekspSn':
      renderEkspSn(container);
      break;
    case 'latihanSn':
      renderLatihanSn(container);
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
    '<p class="stage-head__goal">Tujuan: Mengenal konteks pembelajaran dan menyiapkan diri untuk eksplorasi.</p>' +
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
    '<li><span class="objectives-list__num">1</span>Mengamati pola bilangan dari konteks nyata (kursi bioskop, hosting, commit GitHub) untuk mengidentifikasi barisan aritmetika.</li>' +
    '<li><span class="objectives-list__num">2</span>Menemukan sendiri rumus suku ke-n: <strong>Uₙ = a + (n−1)b</strong>.</li>' +
    '<li><span class="objectives-list__num">3</span>Berlatih menghitung nilai suku tertentu dari berbagai barisan.</li>' +
    '<li><span class="objectives-list__num">4</span>Memahami trik penjumlahan deret (trik Gauss) untuk menemukan <strong>Sₙ = n/2 × (2a + (n−1)b)</strong>.</li>' +
    '<li><span class="objectives-list__num">5</span>Menyelesaikan tantangan kontekstual bernuansa SMK RPL.</li>' +
    '</ol></div></div>' +
    '<div class="panel panel--compact">' +
    '<h3>Barisan Aritmetika di Dunia RPL</h3>' +
    '<p>Sebagai siswa SMK jurusan RPL, kamu sering menemukan pola bilangan yang bertambah atau berkurang secara teratur:</p>' +
    '<ul>' +
    '<li>Biaya <em>server cloud</em> yang naik tetap tiap bulan</li>' +
    '<li>Jumlah <em>commit</em> yang meningkat seiring pengalaman</li>' +
    '<li>Jumlah baris kode yang berhasil ditulis setiap hari</li>' +
    '<li>Jumlah bug yang berkurang setelah setiap <em>sprint</em></li>' +
    '</ul>' +
    '<p>Pola-pola seperti ini membentuk apa yang disebut <strong>barisan aritmetika</strong>.</p>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>Cara Menggunakan Media Ini</h3>' +
    '<div class="hero-steps">' +
    '<div class="hero-steps__item"><span class="hero-steps__num">1</span>Kerjakan tahap dari kiri ke kanan. Setiap tahap harus diselesaikan sebelum lanjut.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">2</span>Setiap aktivitas punya tombol <strong>Periksa</strong>, <strong>Petunjuk</strong>, dan <strong>Coba Lagi</strong>.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">3</span>Feedback menjelaskan alasan di balik setiap jawaban — baca dengan teliti.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">4</span>Progress tersimpan otomatis di browser ini.</div>' +
    '</div></div>' +
    '<div class="panel panel--compact panel--warning">' +
    '<p style="margin:0;font-size:0.88rem;color:var(--color-warning-strong);">' +
    '<strong>Catatan:</strong> Hasil latihan adalah panduan belajar mandiri. Diskusi, proyek, dan asesmen oleh guru tetap menjadi bagian utama penilaian.' +
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
   7. STAGE: EKSPLORASI POLA
   ============================================================ */

function buildSeqTermClass(revealed, idx, revealCount) {
  var cls = 'seq-term__val';
  if (!revealed) return cls + ' seq-term__val--hidden';
  if (idx === revealCount + 1 && revealCount > 0) return cls + ' seq-term__val--revealed';
  return cls;
}

function buildSeqTermsHTML(ctx, revealCount) {
  var html = '';
  for (var i = 0; i < ctx.terms.length; i++) {
    var revealed = i < 2 || i < revealCount + 2;
    var valCls = buildSeqTermClass(revealed, i, revealCount);
    html +=
      '<div class="seq-term">' +
      '<div class="' +
      valCls +
      '">' +
      (revealed ? esc(String(ctx.terms[i])) : '?') +
      '</div>' +
      '<div class="seq-term__label">' +
      esc(ctx.labels[i]) +
      '</div>' +
      '</div>';
    if (i < ctx.terms.length - 1) {
      var nextRevealed = i + 1 < 2 || i + 1 < revealCount + 2;
      if (revealed && nextRevealed) {
        html += '<div class="seq-beda-badge">+' + (ctx.terms[i + 1] - ctx.terms[i]) + '</div>';
      } else {
        html += '<div class="seq-arrow">→</div>';
      }
    }
  }
  return html;
}

function buildCtxTabsHTML(ctxList, idx) {
  return ctxList
    .map(function (c, i) {
      var active = i === idx ? ' aria-current="step"' : '';
      var done = State.eksplorasiDone[i] ? ' is-complete' : '';
      var num = State.eksplorasiDone[i] ? '&#10003;' : i + 1;
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

function buildBedaInputPanel(ctx, revealCount, isDone) {
  if (isDone) {
    return (
      '<div class="panel panel--compact" style="margin-top:var(--space-4);">' +
      buildFeedbackBox(
        'success',
        '&#10003;',
        '<strong>Barisan aritmetika teridentifikasi!</strong><br>' +
          'Suku pertama <strong>a = ' +
          ctx.a +
          '</strong> ' +
          esc(ctx.unit) +
          ', beda <strong>b = ' +
          ctx.b +
          '</strong> ' +
          esc(ctx.unit) +
          '.<br>' +
          '<em>Setiap suku bertambah secara konstan sebesar ' +
          ctx.b +
          ' ' +
          ctx.unit +
          '.</em>'
      ) +
      '</div>'
    );
  }
  if (revealCount >= 2) {
    return (
      '<div class="panel panel--compact" style="margin-top:var(--space-4);">' +
      '<h4>Identifikasi Barisan</h4>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-bottom:var(--space-3);">' +
      '<div class="field-group" style="margin:0;">' +
      '<label for="inputA">Suku pertama (a) =</label>' +
      '<input type="text" inputmode="numeric" id="inputA" class="input-text" placeholder="..." aria-describedby="errA">' +
      '<div class="field-error" id="errA"></div>' +
      '</div>' +
      '<div class="field-group" style="margin:0;">' +
      '<label for="inputB">Beda (b) =</label>' +
      '<input type="text" inputmode="numeric" id="inputB" class="input-text" placeholder="..." aria-describedby="errB">' +
      '<div class="field-error" id="errB"></div>' +
      '</div>' +
      '</div>' +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn--ghost btn--small" id="hintAbBtn">&#128161; Petunjuk</button>' +
      '<button type="button" class="btn btn--primary" id="checkAbBtn">Periksa</button>' +
      '</div>' +
      '<div id="abFeedback" style="margin-top:var(--space-3);"></div>' +
      '</div>'
    );
  }
  return '';
}

function renderEksplorasi(container) {
  var ctxList = DATA.eksplorasi.konteks;
  var idx = State.eksplorasiCtxIdx;
  var ctx = ctxList[idx];
  var revealCount = State.eksplorasiRevealCount[idx] || 0;
  var isDone = State.eksplorasiDone[idx] || false;
  var allDone = State.eksplorasiDone.filter(Boolean).length === ctxList.length;

  var termsHTML = buildSeqTermsHTML(ctx, revealCount);
  var tabsHTML = buildCtxTabsHTML(ctxList, idx);
  var bedaInputHTML = buildBedaInputPanel(ctx, revealCount, isDone);

  container.innerHTML =
    '<section aria-label="Eksplorasi Pola Barisan">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 2 — EKSPLORASI POLA</span>' +
    '<p class="stage-head__goal">Tujuan: Mengidentifikasi barisan aritmetika dan menentukan suku pertama (a) serta beda (b).</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">' +
    esc(DATA.eksplorasi.instruction) +
    '</p>' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-4);">' +
    tabsHTML +
    '</div>' +
    '<div class="panel panel--hero" style="margin-bottom:var(--space-3);">' +
    '<div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3);">' +
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
    '<div class="seq-display">' +
    termsHTML +
    '</div>' +
    (revealCount < ctx.terms.length - 2
      ? '<div style="text-align:center;margin-top:var(--space-3);">' +
        '<button type="button" class="seq-reveal-btn" id="revealNextBtn">▶ Tampilkan Suku Berikutnya</button>' +
        '</div>'
      : '') +
    '</div>' +
    bedaInputHTML +
    '</div>' +
    (allDone
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="nextEksplorasiBtn">Lanjut: Temukan Rumus Uₙ →</button>' +
        '</div>'
      : '') +
    '</section>';

  /* Events */
  container.querySelectorAll('[data-ctx]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.eksplorasiCtxIdx = parseInt(btn.dataset.ctx, 10);
      saveState();
      renderEksplorasi(container);
    });
  });

  var revBtn = document.getElementById('revealNextBtn');
  if (revBtn)
    revBtn.addEventListener('click', function () {
      if (State.eksplorasiRevealCount[idx] < ctx.terms.length - 2) {
        State.eksplorasiRevealCount[idx] += 1;
        saveState();
        renderEksplorasi(container);
      }
    });

  var hintBtn = document.getElementById('hintAbBtn');
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      var fb = document.getElementById('abFeedback');
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

  var checkBtn = document.getElementById('checkAbBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      checkAbAnswer(container, idx);
    });

  var nextBtn = document.getElementById('nextEksplorasiBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      completeStage('eksplorasi');
      navigateTo('rumusUn');
    });
}

function validateAbInputs() {
  var inpA = document.getElementById('inputA');
  var inpB = document.getElementById('inputB');
  var errA = document.getElementById('errA');
  var errB = document.getElementById('errB');
  errA.textContent = '';
  errB.textContent = '';
  var pA = parseInputInt(inpA ? inpA.value : '', true);
  var pB = parseInputInt(inpB ? inpB.value : '', true);
  if (pA.error === 'empty') {
    errA.textContent = 'Isi nilai a.';
    return null;
  }
  if (pA.error === 'invalid') {
    errA.textContent = 'Masukkan bilangan bulat.';
    return null;
  }
  if (pB.error === 'empty') {
    errB.textContent = 'Isi nilai b.';
    return null;
  }
  if (pB.error === 'invalid') {
    errB.textContent = 'Masukkan bilangan bulat.';
    return null;
  }
  return { pA: pA, pB: pB };
}

function findNextPendingCtxIdx() {
  for (var i = 0; i < DATA.eksplorasi.konteks.length; i++) {
    if (!State.eksplorasiDone[i]) return i;
  }
  return -1;
}

function buildAbErrorMsg(correctA, correctB) {
  if (!correctA && !correctB) return 'Kedua nilai kurang tepat.';
  if (!correctA) return 'Nilai a kurang tepat. Perhatikan suku pertama.';
  return 'Nilai b kurang tepat. Periksa selisih antar suku yang berurutan.';
}

function checkAbAnswer(container, idx) {
  var ctx = DATA.eksplorasi.konteks[idx];
  var fb = document.getElementById('abFeedback');
  var inputs = validateAbInputs();
  if (!inputs) return;

  if (inputs.pA.value === ctx.a && inputs.pB.value === ctx.b) {
    State.eksplorasiDone[idx] = true;
    var nextIdx = findNextPendingCtxIdx();
    saveState();
    State.eksplorasiCtxIdx = nextIdx !== -1 ? nextIdx : idx;
    renderEksplorasi(container);
    if (nextIdx !== -1) showNotice('Benar! Lanjut ke konteks berikutnya.');
  } else {
    fb.innerHTML = buildFeedbackBox(
      'error',
      '&#10007;',
      buildAbErrorMsg(inputs.pA.value === ctx.a, inputs.pB.value === ctx.b)
    );
  }
}

/* ============================================================
   8. STAGE: TEMUKAN RUMUS Uₙ
   ============================================================ */

function renderRumusUn(container) {
  var data = DATA.rumusUn;
  var step = State.rumusUnStep;

  /* Tabel pola */
  var tableRows = data.tableRows
    .map(function (row, i) {
      var nCell = '<td class="cell-highlight">' + esc(String(row.n)) + '</td>';
      var bentukCell = '<td>' + esc(row.bentuk) + '</td>';
      var expandedCell = '<td>' + esc(row.expanded) + '</td>';
      var unCell =
        row.Un !== null
          ? '<td class="cell-highlight">' + esc(String(row.Un)) + '</td>'
          : '<td style="font-style:italic;color:var(--color-primary);">Uₙ</td>';
      return '<tr>' + nCell + bentukCell + expandedCell + unCell + '</tr>';
    })
    .join('');

  var formulaHTML = State.rumusUnFormulaShown
    ? '<div class="formula-box formula-box--reveal">' +
      '<div class="formula-box__label">Rumus Suku ke-n — Barisan Aritmetika</div>' +
      '<div class="formula-box__expr formula-box__expr--large">Uₙ = a + (n−1)b</div>' +
      '<div class="formula-box__note">di mana: <strong>a</strong> = suku pertama, <strong>b</strong> = beda, <strong>n</strong> = nomor suku</div>' +
      '</div>'
    : '';

  /* Step content */
  var stepHTML = '';
  if (!State.rumusUnFormulaShown) {
    var s = data.steps[step];
    var ex = State.rumusUnStepDone[step];
    var stepInputValue = State.rumusUnStepInputs[step] || '';
    stepHTML =
      '<div class="panel panel--compact" id="stepPanel">' +
      '<span class="stage-head__kicker" style="margin-bottom:var(--space-2);">LANGKAH ' +
      (step + 1) +
      ' dari ' +
      data.steps.length +
      '</span>' +
      '<p style="font-size:0.95rem;margin-bottom:var(--space-3);">' +
      s.question +
      '</p>' +
      (!ex
        ? '<div class="un-answer-row">' +
          '<input type="text" inputmode="numeric" id="stepInput" class="input-text" value="' +
          esc(stepInputValue) +
          '" placeholder="..." style="max-width:120px;text-align:center;font-family:var(--font-mono);font-size:1.1rem;">' +
          '<button type="button" class="btn btn--primary" id="checkStepBtn">Periksa</button>' +
          '<button type="button" class="btn btn--ghost btn--small" id="hintStepBtn">💡 Petunjuk</button>' +
          '</div>' +
          '<div id="stepFeedback" style="margin-top:var(--space-3);"></div>'
        : buildFeedbackBox('success', '✓', '<strong>Benar!</strong> ' + s.explanation)) +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="Menemukan Rumus Un">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 3 — TEMUKAN RUMUS Uₙ</span>' +
    '<p class="stage-head__goal">Tujuan: Menemukan rumus Uₙ = a + (n−1)b melalui pengamatan pola.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>' +
    esc(data.title) +
    '</h3>' +
    '<p style="font-size:0.88rem;background:var(--color-primary-soft);border-left:3px solid var(--color-primary);padding:var(--space-2) var(--space-3);border-radius:0 var(--radius-sm) var(--radius-sm) 0;">' +
    'Barisan: <strong>' +
    esc(data.konteks) +
    '</strong> (a = ' +
    data.a +
    ', b = ' +
    data.b +
    ')' +
    '</p>' +
    '<div style="overflow-x:auto;">' +
    '<table class="pattern-table">' +
    '<thead><tr><th>n (suku ke-)</th><th>Bentuk Umum</th><th>Bentuk Diperluas</th><th>Nilai Uₙ</th></tr></thead>' +
    '<tbody>' +
    tableRows +
    '</tbody>' +
    '</table></div>' +
    '</div>' +
    stepHTML +
    formulaHTML +
    (State.rumusUnFormulaShown
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="nextRumusBtn">Latihan Uₙ →</button>' +
        '</div>'
      : '') +
    '</section>';

  /* Events */
  var checkBtn = document.getElementById('checkStepBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      checkRumusUnStep(container, step);
    });

  var hintBtn = document.getElementById('hintStepBtn');
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      var fb = document.getElementById('stepFeedback');
      if (fb) fb.innerHTML = buildFeedbackBox('warning', '💡', esc(data.steps[step].hint));
    });

  var stepInputEl = document.getElementById('stepInput');
  if (stepInputEl) {
    stepInputEl.addEventListener('input', function () {
      State.rumusUnStepInputs[step] = stepInputEl.value;
    });
    stepInputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (checkBtn) checkBtn.click();
      }
    });
    setTimeout(function () {
      stepInputEl.focus();
    }, 50);
  }

  var nextBtn = document.getElementById('nextRumusBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      completeStage('rumusUn');
      navigateTo('latihanUn');
    });
}

function checkRumusUnStep(container, step) {
  var s = DATA.rumusUn.steps[step];
  var inp = document.getElementById('stepInput');
  var fb = document.getElementById('stepFeedback');
  if (!inp || !fb) return;

  var parsed = parseInputInt(inp.value, true);
  if (parsed.error) {
    fb.innerHTML = buildFeedbackBox('error', '✗', 'Masukkan bilangan bulat.');
    return;
  }

  State.rumusUnStepInputs[step] = inp.value;
  var correct = parsed.value === parseInt(s.answer, 10);

  if (correct) {
    State.rumusUnStepDone[step] = true;
    if (step + 1 < DATA.rumusUn.steps.length) {
      State.rumusUnStep = step + 1;
    } else {
      State.rumusUnFormulaShown = true;
    }
    saveState();
    renderRumusUn(container);
  } else {
    fb.innerHTML = buildFeedbackBox(
      'error',
      '✗',
      'Belum tepat. Coba perhatikan polanya pada tabel di atas.'
    );
  }
}

/* ============================================================
   9. STAGE: LATIHAN Uₙ
   ============================================================ */

function renderLatihanUn(container) {
  var soal = DATA.latihanUn.soal;
  var idx = State.latihanUnIdx;
  var allDone = State.latihanUnExercises.every(function (e) {
    return e.correct || e.revealed;
  });

  if (allDone || idx >= soal.length) {
    renderLatihanUnSummary(container);
    return;
  }

  var s = soal[idx];
  var ex = State.latihanUnExercises[idx] || {
    attempts: 0,
    hintLevel: 0,
    correct: false,
    userInput: '',
    revealed: false,
  };
  var done = ex.correct || ex.revealed;

  var statuses = State.latihanUnExercises.map(function (e) {
    if (e.correct) return 'correct';
    if (e.revealed && !e.correct) return 'incorrect';
    return '';
  });

  var feedbackHTML = '';
  if (ex.hintLevel >= 1 && !done) {
    feedbackHTML +=
      '<div class="hint-box"><span class="hint-box__label">💡 Petunjuk ' +
      ex.hintLevel +
      ':</span>' +
      s.hints[ex.hintLevel - 1] +
      '</div>';
  }
  if (done) {
    feedbackHTML = ex.correct
      ? buildFeedbackBox('success', '✓', '<strong>Tepat!</strong> ' + s.explanation)
      : buildFeedbackBox('warning', '📘', '<strong>Pembahasan:</strong> ' + s.explanation);
  }

  container.innerHTML =
    '<section aria-label="Latihan Uₙ">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 4 — LATIHAN Uₙ</span>' +
    '<p class="stage-head__goal">Tujuan: Menerapkan rumus Uₙ = a + (n−1)b pada berbagai barisan.</p>' +
    '</div>' +
    '<div class="panel">' +
    buildProgressDots(soal.length, idx, statuses) +
    (s.konteks
      ? '<div class="challenge-story" style="margin-bottom:var(--space-3);">📌 ' +
        s.konteks +
        '</div>'
      : '') +
    '<div class="un-exercise">' +
    '<div class="un-exercise__seq">' +
    esc(s.barisan_display) +
    '</div>' +
    '<div class="un-exercise__question">' +
    s.question +
    '</div>' +
    '</div>' +
    '<div class="un-answer-row">' +
    '<label for="latihanUnInput" style="font-weight:600;font-size:0.9rem;">Jawaban = </label>' +
    '<input type="text" inputmode="numeric" id="latihanUnInput" class="input-text" ' +
    'value="' +
    esc(ex.userInput) +
    '" placeholder="..." ' +
    (done ? 'disabled' : '') +
    ' aria-label="Masukkan jawaban">' +
    '</div>' +
    '<div class="field-error" id="latihanUnErr"></div>' +
    feedbackHTML +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-5);">' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">' +
    '<button type="button" class="btn btn--ghost" id="prevUnBtn" ' +
    (idx === 0 ? 'disabled' : '') +
    '>← Sebelumnya</button>' +
    (!done
      ? '<button type="button" class="btn btn--ghost btn--small" id="hintUnBtn" ' +
        (ex.hintLevel >= s.hints.length ? 'disabled' : '') +
        '>💡 Petunjuk</button>'
      : '') +
    '</div>' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">' +
    (!done
      ? '<button type="button" class="btn btn--primary" id="checkUnBtn">Periksa Jawaban</button>'
      : idx < soal.length - 1
        ? '<button type="button" class="btn btn--primary" id="nextUnBtn">Lanjut →</button>'
        : '<button type="button" class="btn btn--primary" id="summaryUnBtn">Lihat Ringkasan →</button>') +
    '</div>' +
    '</div></div></section>';

  if (!done) {
    var inp = document.getElementById('latihanUnInput');
    if (inp)
      setTimeout(function () {
        inp.focus();
      }, 50);
  }

  /* Events */
  var input = document.getElementById('latihanUnInput');
  if (input)
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var ck = document.getElementById('checkUnBtn');
        if (ck) ck.click();
      }
    });

  attachInputExerciseEvents(
    container,
    'latihanUnInput',
    'latihanUnErr',
    'checkUnBtn',
    'hintUnBtn',
    'prevUnBtn',
    'nextUnBtn',
    'summaryUnBtn',
    State.latihanUnExercises,
    idx,
    soal,
    'latihanUn',
    container
  );
}

function attachInputExerciseEvents(
  container,
  inputId,
  errId,
  checkId,
  hintId,
  prevId,
  nextId,
  summaryId,
  exercises,
  idx,
  soal,
  stateKey,
  renderTarget
) {
  var checkBtn = document.getElementById(checkId);
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      checkInputExercise(renderTarget, idx, exercises, soal, stateKey);
    });

  var hintBtn = document.getElementById(hintId);
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      if (exercises[idx].hintLevel < soal[idx].hints.length) {
        exercises[idx].hintLevel = Math.min(exercises[idx].hintLevel + 1, soal[idx].hints.length);
        saveState();
        if (stateKey === 'latihanUn') renderLatihanUn(renderTarget);
        else renderLatihanSn(renderTarget);
      }
    });

  var prevBtn = document.getElementById(prevId);
  if (prevBtn)
    prevBtn.addEventListener('click', function () {
      if (stateKey === 'latihanUn') {
        State.latihanUnIdx = Math.max(0, idx - 1);
      } else {
        State.latihanSnIdx = Math.max(0, idx - 1);
      }
      saveState();
      if (stateKey === 'latihanUn') renderLatihanUn(renderTarget);
      else renderLatihanSn(renderTarget);
    });

  var nextBtn = document.getElementById(nextId);
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      if (stateKey === 'latihanUn') {
        State.latihanUnIdx = Math.min(soal.length - 1, idx + 1);
      } else {
        State.latihanSnIdx = Math.min(soal.length - 1, idx + 1);
      }
      saveState();
      if (stateKey === 'latihanUn') renderLatihanUn(renderTarget);
      else renderLatihanSn(renderTarget);
    });

  var summaryBtn = document.getElementById(summaryId);
  if (summaryBtn)
    summaryBtn.addEventListener('click', function () {
      if (stateKey === 'latihanUn') {
        State.latihanUnIdx = soal.length;
      } else {
        State.latihanSnIdx = soal.length;
      }
      saveState();
      if (stateKey === 'latihanUn') renderLatihanUn(renderTarget);
      else renderLatihanSn(renderTarget);
    });
}

function checkInputExercise(container, idx, exercises, soal, stateKey) {
  var s = soal[idx];
  var ex = exercises[idx];
  var input = document.getElementById(
    stateKey === 'latihanUn' ? 'latihanUnInput' : 'latihanSnInput'
  );
  var errEl = document.getElementById(stateKey === 'latihanUn' ? 'latihanUnErr' : 'latihanSnErr');
  if (!input || !errEl) return;

  errEl.textContent = '';
  if (!input.value.trim()) {
    errEl.textContent = 'Ketikkan jawabanmu terlebih dahulu.';
    input.focus();
    return;
  }
  var parsed = parseInputInt(input.value, true);
  if (parsed.error) {
    errEl.textContent = 'Masukkan bilangan bulat (tanpa titik/koma).';
    input.focus();
    return;
  }

  ex.userInput = input.value;
  ex.attempts += 1;

  if (parsed.value === s.answer) {
    ex.correct = true;
    saveState();
    if (stateKey === 'latihanUn') renderLatihanUn(container);
    else renderLatihanSn(container);
  } else {
    if (ex.attempts >= 3) {
      ex.revealed = true;
    } else if (ex.hintLevel < s.hints.length) {
      ex.hintLevel = Math.min(ex.hintLevel + 1, s.hints.length);
    }
    saveState();
    if (stateKey === 'latihanUn') renderLatihanUn(container);
    else renderLatihanSn(container);
  }
}

function renderLatihanUnSummary(container) {
  var exercises = State.latihanUnExercises;
  var correctCount = exercises.filter(function (e) {
    return e.correct;
  }).length;
  var total = DATA.latihanUn.soal.length;
  var allCorrect = correctCount === total;

  container.innerHTML =
    '<section aria-label="Ringkasan Latihan Uₙ">' +
    '<div class="stage-head"><span class="stage-head__kicker">TAHAP 4 — RINGKASAN</span></div>' +
    '<div class="panel">' +
    '<div class="summary-grid">' +
    '<div class="summary-card"><div class="summary-card__val">' +
    correctCount +
    '</div><div class="summary-card__label">Soal benar dari ' +
    total +
    '</div></div>' +
    '<div class="summary-card"><div class="summary-card__val">' +
    Math.round((correctCount / total) * 100) +
    '%</div><div class="summary-card__label">Skor</div></div>' +
    '</div>' +
    (allCorrect
      ? buildFeedbackBox(
          'success',
          '🎉',
          '<strong>Luar biasa!</strong> Kamu berhasil menguasai perhitungan Uₙ.'
        )
      : buildFeedbackBox(
          'info',
          '📘',
          'Bagus! Teruslah berlatih. Kamu bisa kembali mengerjakan soal yang belum benar.'
        )) +
    '</div>' +
    '<div class="btn-group btn-group--spread">' +
    '<button type="button" class="btn btn--ghost" id="retryUnBtn">↩ Kerjakan Ulang</button>' +
    '<button type="button" class="btn btn--primary btn--large" id="nextToEkspSnBtn">Lanjut: Eksplorasi Sₙ →</button>' +
    '</div></section>';

  document.getElementById('retryUnBtn').addEventListener('click', function () {
    State.latihanUnIdx = 0;
    saveState();
    renderLatihanUn(container);
  });
  document.getElementById('nextToEkspSnBtn').addEventListener('click', function () {
    completeStage('latihanUn');
    navigateTo('ekspSn');
  });
}

/* ============================================================
   10. STAGE: EKSPLORASI Sₙ
   ============================================================ */

function renderEkspSn(container) {
  var data = DATA.ekspSn;
  var step = State.ekspSnStep;
  var steps = data.steps;

  /* Build Gauss animation */
  var terms = data.barisan;
  var n = data.n_demo;

  var forwardHTML = '<div class="gauss-row">';
  var backHTML = '<div class="gauss-row gauss-row--reversed">';
  var sumHTML = '<div class="gauss-row">';

  for (var i = 0; i < n; i++) {
    var fwCls = i === 0 || i === n - 1 ? 'gauss-cell gauss-cell--a' : 'gauss-cell gauss-cell--b';
    var bkCls = i === 0 || i === n - 1 ? 'gauss-cell gauss-cell--a' : 'gauss-cell gauss-cell--b';
    forwardHTML +=
      (i > 0 ? '<span class="gauss-plus">+</span>' : '') +
      '<div class="' +
      fwCls +
      '">' +
      terms[i] +
      '</div>';
    backHTML +=
      (i > 0 ? '<span class="gauss-plus">+</span>' : '') +
      '<div class="' +
      bkCls +
      '">' +
      terms[n - 1 - i] +
      '</div>';
    var sumVal = terms[i] + terms[n - 1 - i];
    sumHTML +=
      (i > 0 ? '<span class="gauss-plus">+</span>' : '') +
      '<div class="gauss-cell gauss-cell--sum">' +
      sumVal +
      '</div>';
  }
  forwardHTML += '</div>';
  backHTML += '</div>';
  sumHTML +=
    '<span class="gauss-plus">=</span><div class="gauss-cell gauss-cell--sum" style="min-width:52px;">' +
    n * (terms[0] + terms[n - 1]) +
    '</div></div>';

  /* Step reveal */
  var stepsHTML = steps
    .slice(0, step + 1)
    .map(function (st, i) {
      return (
        '<div class="panel panel--compact" style="' +
        (i === step ? 'border-color:var(--color-primary);' : '') +
        '">' +
        '<strong>' +
        esc(st.title) +
        '</strong>' +
        '<p style="font-family:var(--font-mono);font-size:0.95rem;margin:var(--space-2) 0 0;">' +
        esc(st.desc) +
        '</p>' +
        '</div>'
      );
    })
    .join('');

  var verifikHTML = '';
  if (State.ekspSnFormulaShown) {
    var v = data.verifikasi;
    verifikHTML =
      '<div class="panel">' +
      '<h3>Verifikasi Rumus</h3>' +
      '<p>' +
      v.question +
      '</p>' +
      (!State.ekspSnVerifDone
        ? '<div class="un-answer-row">' +
          '<label for="verifInput" style="font-weight:600;">S₈ = </label>' +
          '<input type="text" inputmode="numeric" id="verifInput" class="input-text" value="' +
          esc(State.ekspSnVerifInput) +
          '" placeholder="..." style="max-width:120px;text-align:center;font-family:var(--font-mono);font-size:1.1rem;">' +
          '<button type="button" class="btn btn--primary" id="checkVerifBtn">Periksa</button>' +
          '<button type="button" class="btn btn--ghost btn--small" id="hintVerifBtn">💡 Petunjuk</button>' +
          '</div>' +
          '<div id="verifFeedback" style="margin-top:var(--space-3);"></div>'
        : buildFeedbackBox('success', '✓', v.explanation)) +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="Eksplorasi Sₙ">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 5 — EKSPLORASI Sₙ</span>' +
    '<p class="stage-head__goal">Tujuan: Menemukan rumus Sₙ = n/2 × (2a + (n−1)b) melalui trik penjumlahan Gauss.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>' +
    esc(data.title) +
    '</h3>' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);">' +
    esc(data.instruction) +
    '</p>' +
    '<p style="background:var(--color-primary-soft);border-left:3px solid var(--color-primary);padding:var(--space-2) var(--space-3);border-radius:0 var(--radius-sm) var(--radius-sm) 0;font-family:var(--font-mono);">' +
    'Barisan: ' +
    data.barisan.join(', ') +
    ' (a = ' +
    data.a +
    ', b = ' +
    data.b +
    ', n = ' +
    data.n_demo +
    ')' +
    '</p>' +
    '<div class="gauss-wrap">' +
    (step >= 0
      ? '<p style="font-size:0.82rem;font-family:var(--font-mono);color:var(--color-ink-muted);text-align:center;">— Deret Maju (S₈) —</p>' +
        forwardHTML
      : '') +
    (step >= 1
      ? '<p style="font-size:0.82rem;font-family:var(--font-mono);color:var(--color-ink-muted);text-align:center;margin-top:var(--space-2);">— Deret Mundur (S₈) —</p>' +
        backHTML
      : '') +
    (step >= 2
      ? '<p style="font-size:0.82rem;font-family:var(--font-mono);color:var(--color-ink-muted);text-align:center;margin-top:var(--space-2);">— 2S₈ (penjumlahan kolom) —</p>' +
        sumHTML
      : '') +
    '</div>' +
    stepsHTML +
    (step < steps.length - 1
      ? '<div class="btn-group btn-group--center">' +
        '<button type="button" class="btn btn--primary" id="nextGaussStep">Langkah Berikutnya →</button>' +
        '</div>'
      : !State.ekspSnFormulaShown
        ? '<div class="btn-group btn-group--center">' +
          '<button type="button" class="btn btn--primary" id="showFormulaBtn">Lihat Rumus Sₙ</button>' +
          '</div>'
        : '') +
    '</div>' +
    (State.ekspSnFormulaShown
      ? '<div class="formula-box formula-box--reveal">' +
        '<div class="formula-box__label">Rumus Jumlah n Suku Pertama — Deret Aritmetika</div>' +
        '<div class="formula-box__expr formula-box__expr--large">Sₙ = n/2 × (2a + (n−1)b)</div>' +
        '<div class="formula-box__note">atau ekuivalen: Sₙ = n/2 × (a + Uₙ)</div>' +
        '</div>'
      : '') +
    verifikHTML +
    (State.ekspSnVerifDone
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="nextToLatihanSn">Latihan Sₙ →</button>' +
        '</div>'
      : '') +
    '</section>';

  /* Events */
  var nextGauss = document.getElementById('nextGaussStep');
  if (nextGauss)
    nextGauss.addEventListener('click', function () {
      State.ekspSnStep = Math.min(steps.length - 1, State.ekspSnStep + 1);
      saveState();
      renderEkspSn(container);
    });

  var showFormula = document.getElementById('showFormulaBtn');
  if (showFormula)
    showFormula.addEventListener('click', function () {
      State.ekspSnFormulaShown = true;
      saveState();
      renderEkspSn(container);
    });

  var checkVerif = document.getElementById('checkVerifBtn');
  if (checkVerif)
    checkVerif.addEventListener('click', function () {
      var inp = document.getElementById('verifInput');
      var fb = document.getElementById('verifFeedback');
      if (!inp || !fb) return;
      State.ekspSnVerifInput = inp.value;
      var parsed = parseInputInt(inp.value, true);
      if (parsed.error) {
        fb.innerHTML = buildFeedbackBox('error', '✗', 'Masukkan bilangan bulat.');
        return;
      }
      if (parsed.value === data.verifikasi.answer) {
        State.ekspSnVerifDone = true;
        saveState();
        renderEkspSn(container);
      } else {
        fb.innerHTML = buildFeedbackBox('error', '✗', 'Belum tepat. Coba ikuti petunjuknya.');
      }
    });

  var hintVerif = document.getElementById('hintVerifBtn');
  if (hintVerif)
    hintVerif.addEventListener('click', function () {
      var fb = document.getElementById('verifFeedback');
      if (fb) fb.innerHTML = buildFeedbackBox('warning', '💡', data.verifikasi.hint);
    });

  var verifInp = document.getElementById('verifInput');
  if (verifInp)
    verifInp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (checkVerif) checkVerif.click();
      }
    });

  var nextSn = document.getElementById('nextToLatihanSn');
  if (nextSn)
    nextSn.addEventListener('click', function () {
      completeStage('ekspSn');
      navigateTo('latihanSn');
    });
}

/* ============================================================
   11. STAGE: LATIHAN Sₙ
   ============================================================ */

function renderLatihanSn(container) {
  var soal = DATA.latihanSn.soal;
  var idx = State.latihanSnIdx;
  var allDone = State.latihanSnExercises.every(function (e) {
    return e.correct || e.revealed;
  });

  if (allDone || idx >= soal.length) {
    renderLatihanSnSummary(container);
    return;
  }

  var s = soal[idx];
  var ex = State.latihanSnExercises[idx];
  var done = ex.correct || ex.revealed;

  var statuses = State.latihanSnExercises.map(function (e) {
    if (e.correct) return 'correct';
    if (e.revealed && !e.correct) return 'incorrect';
    return '';
  });

  var feedbackHTML = '';
  if (ex.hintLevel >= 1 && !done) {
    feedbackHTML +=
      '<div class="hint-box"><span class="hint-box__label">💡 Petunjuk ' +
      ex.hintLevel +
      ':</span>' +
      s.hints[ex.hintLevel - 1] +
      '</div>';
  }
  if (done) {
    feedbackHTML = ex.correct
      ? buildFeedbackBox('success', '✓', '<strong>Tepat!</strong> ' + s.explanation)
      : buildFeedbackBox('warning', '📘', '<strong>Pembahasan:</strong> ' + s.explanation);
  }

  container.innerHTML =
    '<section aria-label="Latihan Sₙ">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 6 — LATIHAN Sₙ</span>' +
    '<p class="stage-head__goal">Tujuan: Menerapkan rumus Sₙ = n/2 × (2a + (n−1)b) pada berbagai deret.</p>' +
    '</div>' +
    '<div class="panel">' +
    buildProgressDots(soal.length, idx, statuses) +
    '<div class="un-exercise">' +
    '<div class="un-exercise__seq">' +
    esc(s.barisan_display) +
    '</div>' +
    '<div class="un-exercise__question">' +
    s.question +
    '</div>' +
    '</div>' +
    '<div class="un-answer-row">' +
    '<label for="latihanSnInput" style="font-weight:600;font-size:0.9rem;">Jawaban = </label>' +
    '<input type="text" inputmode="numeric" id="latihanSnInput" class="input-text" ' +
    'value="' +
    esc(ex.userInput) +
    '" placeholder="..." ' +
    (done ? 'disabled' : '') +
    ' aria-label="Masukkan jawaban">' +
    '</div>' +
    '<div class="field-error" id="latihanSnErr"></div>' +
    feedbackHTML +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-5);">' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">' +
    '<button type="button" class="btn btn--ghost" id="prevSnBtn" ' +
    (idx === 0 ? 'disabled' : '') +
    '>← Sebelumnya</button>' +
    (!done
      ? '<button type="button" class="btn btn--ghost btn--small" id="hintSnBtn" ' +
        (ex.hintLevel >= s.hints.length ? 'disabled' : '') +
        '>💡 Petunjuk</button>'
      : '') +
    '</div>' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">' +
    (!done
      ? '<button type="button" class="btn btn--primary" id="checkSnBtn">Periksa Jawaban</button>'
      : idx < soal.length - 1
        ? '<button type="button" class="btn btn--primary" id="nextSnBtn">Lanjut →</button>'
        : '<button type="button" class="btn btn--primary" id="summarySnBtn">Lihat Ringkasan →</button>') +
    '</div>' +
    '</div></div></section>';

  if (!done) {
    var inp = document.getElementById('latihanSnInput');
    if (inp)
      setTimeout(function () {
        inp.focus();
      }, 50);
  }

  var input = document.getElementById('latihanSnInput');
  if (input)
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var ck = document.getElementById('checkSnBtn');
        if (ck) ck.click();
      }
    });

  attachInputExerciseEvents(
    container,
    'latihanSnInput',
    'latihanSnErr',
    'checkSnBtn',
    'hintSnBtn',
    'prevSnBtn',
    'nextSnBtn',
    'summarySnBtn',
    State.latihanSnExercises,
    idx,
    soal,
    'latihanSn',
    container
  );
}

function renderLatihanSnSummary(container) {
  var exercises = State.latihanSnExercises;
  var correctCount = exercises.filter(function (e) {
    return e.correct;
  }).length;
  var total = DATA.latihanSn.soal.length;
  var allCorrect = correctCount === total;

  container.innerHTML =
    '<section aria-label="Ringkasan Latihan Sₙ">' +
    '<div class="stage-head"><span class="stage-head__kicker">TAHAP 6 — RINGKASAN</span></div>' +
    '<div class="panel">' +
    '<div class="summary-grid">' +
    '<div class="summary-card"><div class="summary-card__val">' +
    correctCount +
    '</div><div class="summary-card__label">Soal benar dari ' +
    total +
    '</div></div>' +
    '<div class="summary-card"><div class="summary-card__val">' +
    Math.round((correctCount / total) * 100) +
    '%</div><div class="summary-card__label">Skor</div></div>' +
    '</div>' +
    (allCorrect
      ? buildFeedbackBox(
          'success',
          '🎉',
          '<strong>Luar biasa!</strong> Kamu menguasai perhitungan Sₙ!'
        )
      : buildFeedbackBox(
          'info',
          '📘',
          'Teruslah berlatih! Kamu bisa kembali mengerjakan soal yang tersisa.'
        )) +
    '</div>' +
    '<div class="btn-group btn-group--spread">' +
    '<button type="button" class="btn btn--ghost" id="retrySnBtn">↩ Kerjakan Ulang</button>' +
    '<button type="button" class="btn btn--primary btn--large" id="nextToTantanganBtn">Lanjut: Tantangan →</button>' +
    '</div></section>';

  document.getElementById('retrySnBtn').addEventListener('click', function () {
    State.latihanSnIdx = 0;
    saveState();
    renderLatihanSn(container);
  });
  document.getElementById('nextToTantanganBtn').addEventListener('click', function () {
    completeStage('latihanSn');
    navigateTo('tantangan');
  });
}

/* ============================================================
   12. STAGE: TANTANGAN
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

  var s = soal[idx];
  var ex = State.tantanganExercises[idx];
  var done = ex.checked;

  var statuses = State.tantanganExercises.map(function (e) {
    if (!e.checked) return '';
    return e.correct ? 'correct' : 'incorrect';
  });

  /* Build question content */
  var questionHTML = '';
  if (s.type === 'input') {
    questionHTML =
      '<p style="font-size:0.95rem;font-weight:600;margin-bottom:var(--space-3);">' +
      s.question +
      '</p>' +
      '<div class="un-answer-row">' +
      '<input type="text" inputmode="numeric" id="tantanganInput" class="input-text" ' +
      'value="' +
      esc(ex.userInput) +
      '" placeholder="..." ' +
      (done ? 'disabled' : '') +
      ' style="max-width:180px;font-family:var(--font-mono);font-size:1.1rem;">' +
      '<span style="font-size:0.88rem;color:var(--color-ink-muted);">' +
      esc(s.unit) +
      '</span>' +
      '</div>' +
      '<div class="field-error" id="tantanganErr"></div>';
  } else if (s.type === 'choice') {
    var optionsHTML = s.options
      .map(function (opt) {
        var cls = 'choice-btn';
        if (done) {
          if (opt.id === s.correct) cls += ' is-correct';
          else if (opt.id === ex.chosen) cls += ' is-incorrect';
        } else if (opt.id === ex.chosen) {
          cls += ' is-selected';
        }
        return (
          '<button type="button" class="' +
          cls +
          '" data-opt="' +
          opt.id +
          '" ' +
          (done ? 'disabled' : '') +
          '>' +
          '<span class="choice-btn__icon">' +
          opt.id.replace('opt_', '').toUpperCase() +
          '</span>' +
          esc(opt.label) +
          '</button>'
        );
      })
      .join('');
    questionHTML =
      '<p style="font-size:0.95rem;font-weight:600;margin-bottom:var(--space-3);">' +
      s.question +
      '</p>' +
      '<div class="challenge-options">' +
      optionsHTML +
      '</div>' +
      '<div class="field-error" id="tantanganErr"></div>';
  }

  var feedbackHTML = '';
  if (!done && ex.attempts >= 1 && s.type === 'input') {
    feedbackHTML =
      '<div class="hint-box"><span class="hint-box__label">💡 Petunjuk:</span>' + s.hint + '</div>';
  }
  if (done) {
    feedbackHTML = ex.correct
      ? buildFeedbackBox('success', '✓', '<strong>Tepat!</strong> ' + s.explanation)
      : buildFeedbackBox('warning', '📘', '<strong>Pembahasan:</strong> ' + s.explanation);
  }

  container.innerHTML =
    '<section aria-label="Tantangan Kontekstual">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 7 — TANTANGAN</span>' +
    '<p class="stage-head__goal">Tujuan: Menerapkan barisan dan deret aritmetika pada masalah kontekstual SMK RPL.</p>' +
    '</div>' +
    '<div class="panel">' +
    buildProgressDots(soal.length, idx, statuses) +
    '<div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">' +
    '<span style="font-size:1.6rem;">' +
    s.icon +
    '</span>' +
    '<span class="badge-chip">' +
    esc(s.badge) +
    '</span>' +
    '</div>' +
    '<div class="challenge-story">' +
    s.story +
    '</div>' +
    questionHTML +
    feedbackHTML +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-5);">' +
    '<button type="button" class="btn btn--ghost" id="prevTBtn" ' +
    (idx === 0 ? 'disabled' : '') +
    '>← Sebelumnya</button>' +
    '<div style="display:flex;gap:var(--space-2);">' +
    (!done
      ? '<button type="button" class="btn btn--ghost btn--small" id="hintTBtn">💡 Petunjuk</button>'
      : '') +
    (!done
      ? '<button type="button" class="btn btn--primary" id="checkTBtn">Periksa</button>'
      : idx < soal.length - 1
        ? '<button type="button" class="btn btn--primary" id="nextTBtn">Lanjut →</button>'
        : '<button type="button" class="btn btn--primary" id="summaryTBtn">Lihat Ringkasan →</button>') +
    '</div>' +
    '</div></div></section>';

  /* Events */
  container.querySelectorAll('[data-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      ex.chosen = btn.dataset.opt;
      saveState();
      renderTantangan(container);
    });
  });

  var hintBtn = document.getElementById('hintTBtn');
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      var fb = document.getElementById('tantanganErr');
      if (fb) {
        fb.textContent = '';
      }
      /* Show hint inline */
      var existing = container.querySelector('.hint-box');
      if (!existing) {
        var hintEl = document.createElement('div');
        hintEl.className = 'hint-box';
        hintEl.innerHTML = '<span class="hint-box__label">💡 Petunjuk:</span>' + s.hint;
        var errEl = document.getElementById('tantanganErr');
        if (errEl) errEl.parentNode.insertBefore(hintEl, errEl.nextSibling);
      }
    });

  var checkBtn = document.getElementById('checkTBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      checkTantangan(container, idx);
    });

  var prevBtn = document.getElementById('prevTBtn');
  if (prevBtn)
    prevBtn.addEventListener('click', function () {
      State.tantanganIdx = Math.max(0, idx - 1);
      saveState();
      renderTantangan(container);
    });

  var nextBtn = document.getElementById('nextTBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      State.tantanganIdx = Math.min(soal.length - 1, idx + 1);
      saveState();
      renderTantangan(container);
    });

  var summaryBtn = document.getElementById('summaryTBtn');
  if (summaryBtn)
    summaryBtn.addEventListener('click', function () {
      State.tantanganIdx = soal.length;
      saveState();
      renderTantangan(container);
    });

  /* Input enter key */
  var input = document.getElementById('tantanganInput');
  if (input)
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (checkBtn) checkBtn.click();
      }
    });
}

function checkTantangan(container, idx) {
  var s = DATA.tantangan.soal[idx];
  var ex = State.tantanganExercises[idx];
  var errEl = document.getElementById('tantanganErr');
  if (errEl) errEl.textContent = '';

  if (s.type === 'input') {
    var input = document.getElementById('tantanganInput');
    if (!input || !input.value.trim()) {
      if (errEl) errEl.textContent = 'Ketikkan jawabanmu terlebih dahulu.';
      return;
    }
    var parsed = parseInputInt(input.value, true);
    if (parsed.error) {
      if (errEl) errEl.textContent = 'Masukkan bilangan bulat.';
      return;
    }
    ex.userInput = input.value;
    ex.attempts += 1;
    ex.correct = parsed.value === s.answer;
    ex.checked = true;
  } else if (s.type === 'choice') {
    if (!ex.chosen) {
      if (errEl) errEl.textContent = 'Pilih salah satu jawaban terlebih dahulu.';
      return;
    }
    ex.correct = ex.chosen === s.correct;
    ex.checked = true;
  }

  saveState();
  renderTantangan(container);
}

function renderTantanganSummary(container) {
  var exercises = State.tantanganExercises;
  var correctCount = exercises.filter(function (e) {
    return e.correct;
  }).length;
  var total = DATA.tantangan.soal.length;

  container.innerHTML =
    '<section aria-label="Ringkasan Tantangan">' +
    '<div class="stage-head"><span class="stage-head__kicker">TAHAP 7 — RINGKASAN</span></div>' +
    '<div class="panel">' +
    '<div class="summary-grid">' +
    '<div class="summary-card"><div class="summary-card__val">' +
    correctCount +
    '</div><div class="summary-card__label">Soal benar dari ' +
    total +
    '</div></div>' +
    '<div class="summary-card"><div class="summary-card__val">' +
    Math.round((correctCount / total) * 100) +
    '%</div><div class="summary-card__label">Skor</div></div>' +
    '</div>' +
    buildFeedbackBox(
      'info',
      '🚀',
      '<strong>Hebat!</strong> Kamu sudah menerapkan barisan dan deret aritmetika pada masalah nyata SMK RPL. ' +
        'Konsep ini akan sering muncul di matematika keuangan, analisis data, dan pemrograman!'
    ) +
    '</div>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary btn--large" id="nextToRefleksiBtn">Lanjut: Refleksi →</button>' +
    '</div></section>';

  document.getElementById('nextToRefleksiBtn').addEventListener('click', function () {
    completeStage('tantangan');
    navigateTo('refleksi');
  });
}

/* ============================================================
   13. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var data = DATA.refleksi;

  var itemsHTML = data.soal
    .map(function (q, i) {
      var savedVal = State.refleksiAnswers[q.id] || '';
      return (
        '<div class="panel panel--compact refleksi-item">' +
        '<span class="refleksi-item__num">Pertanyaan ' +
        (i + 1) +
        '</span>' +
        '<p style="font-size:0.95rem;margin-bottom:var(--space-3);">' +
        q.question +
        '</p>' +
        '<textarea class="input-textarea" id="refleksi_' +
        q.id +
        '" placeholder="' +
        esc(q.placeholder) +
        '" rows="3">' +
        esc(savedVal) +
        '</textarea>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Refleksi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 8 — REFLEKSI</span>' +
    '<p class="stage-head__goal">Tujuan: Merangkum pemahaman dan mengidentifikasi hal yang ingin diperdalam.</p>' +
    '</div>' +
    '<div class="panel panel--info" style="margin-bottom:var(--space-4);">' +
    '<p style="margin:0;font-size:0.9rem;">' +
    data.note +
    '</p>' +
    '</div>' +
    '<div class="refleksi-list">' +
    itemsHTML +
    '</div>' +
    (State.refleksiSaved
      ? '<div style="margin:var(--space-4) 0;">' +
        buildFeedbackBox('success', '✓', 'Refleksimu telah disimpan.') +
        '</div>'
      : '') +
    '<div class="btn-group btn-group--spread">' +
    '<button type="button" class="btn btn--outline-primary" id="saveRefleksiBtn">💾 Simpan Refleksi</button>' +
    '<button type="button" class="btn btn--primary btn--large" id="nextToSelesaiBtn" ' +
    (!State.refleksiSaved ? 'disabled' : '') +
    '>Selesai →</button>' +
    '</div></section>';

  /* Auto-save on typing */
  data.soal.forEach(function (q) {
    var ta = document.getElementById('refleksi_' + q.id);
    if (ta)
      ta.addEventListener('input', function () {
        State.refleksiAnswers[q.id] = ta.value;
      });
  });

  var saveBtn = document.getElementById('saveRefleksiBtn');
  if (saveBtn)
    saveBtn.addEventListener('click', function () {
      data.soal.forEach(function (q) {
        var ta = document.getElementById('refleksi_' + q.id);
        if (ta) State.refleksiAnswers[q.id] = ta.value;
      });
      var hasAny = Object.values(State.refleksiAnswers).some(function (v) {
        return v && v.trim().length > 0;
      });
      if (!hasAny) {
        showNotice('Isi setidaknya satu pertanyaan refleksi.');
        return;
      }
      State.refleksiSaved = true;
      saveState();
      renderRefleksi(container);
      showNotice('Refleksi tersimpan!');
    });

  var nextBtn = document.getElementById('nextToSelesaiBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      completeStage('refleksi');
      navigateTo('selesai');
    });
}

/* ============================================================
   14. STAGE: SELESAI
   ============================================================ */

function renderSelesai(container) {
  var correctUn = State.latihanUnExercises.filter(function (e) {
    return e.correct;
  }).length;
  var correctSn = State.latihanSnExercises.filter(function (e) {
    return e.correct;
  }).length;
  var correctT = State.tantanganExercises.filter(function (e) {
    return e.correct;
  }).length;
  var totalScore = correctUn + correctSn + correctT;
  var maxScore =
    DATA.latihanUn.soal.length + DATA.latihanSn.soal.length + DATA.tantangan.soal.length;

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="done-card">' +
    '<span class="done-card__icon">🏆</span>' +
    '<h2>Pembelajaran Selesai!</h2>' +
    '<p style="font-size:1.05rem;color:var(--color-ink-muted);">Kamu telah menyelesaikan seluruh tahap pembelajaran<br><strong>Barisan dan Deret Aritmetika</strong>.</p>' +
    '<div class="summary-grid" style="max-width:600px;margin:var(--space-5) auto;">' +
    '<div class="summary-card"><div class="summary-card__val">' +
    correctUn +
    '/' +
    DATA.latihanUn.soal.length +
    '</div><div class="summary-card__label">Latihan Uₙ</div></div>' +
    '<div class="summary-card"><div class="summary-card__val">' +
    correctSn +
    '/' +
    DATA.latihanSn.soal.length +
    '</div><div class="summary-card__label">Latihan Sₙ</div></div>' +
    '<div class="summary-card"><div class="summary-card__val">' +
    correctT +
    '/' +
    DATA.tantangan.soal.length +
    '</div><div class="summary-card__label">Tantangan</div></div>' +
    '<div class="summary-card"><div class="summary-card__val">' +
    totalScore +
    '/' +
    maxScore +
    '</div><div class="summary-card__label">Total Soal Benar</div></div>' +
    '</div>' +
    '<div style="text-align:left;max-width:520px;margin:0 auto;">' +
    '<h3>Kamu telah mempelajari:</h3>' +
    '<ol class="objectives-list">' +
    '<li><span class="objectives-list__num">✓</span>Mengidentifikasi pola barisan aritmetika dari konteks nyata.</li>' +
    '<li><span class="objectives-list__num">✓</span>Menentukan suku pertama (a) dan beda (b).</li>' +
    '<li><span class="objectives-list__num">✓</span>Menerapkan rumus <strong>Uₙ = a + (n−1)b</strong>.</li>' +
    '<li><span class="objectives-list__num">✓</span>Menerapkan rumus <strong>Sₙ = n/2 × (2a + (n−1)b)</strong>.</li>' +
    '<li><span class="objectives-list__num">✓</span>Menyelesaikan masalah kontekstual berbasis SMK RPL.</li>' +
    '</ol></div>' +
    '<div class="btn-group btn-group--center" style="margin-top:var(--space-5);">' +
    '<button type="button" class="btn btn--ghost" id="reviewBtn">↩ Tinjau Ulang</button>' +
    '<a href="../../index.html" class="btn btn--primary">Ke Beranda</a>' +
    '</div>' +
    '</div></section>';

  completeStage('selesai');

  var reviewBtn = document.getElementById('reviewBtn');
  if (reviewBtn)
    reviewBtn.addEventListener('click', function () {
      navigateTo('orientasi');
    });
}

/* ============================================================
   16. INIT
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  buildStageNav();
  loadState();
  initExerciseArrays();
  updateStageNav();
  updateProgress();
  renderCurrentStage();

  var resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn)
    resetBtn.addEventListener('click', function () {
      if (window.confirm('Reset semua progress? Tindakan ini tidak bisa dibatalkan.')) {
        clearState();
        updateStageNav();
        updateProgress();
        renderCurrentStage();
        showNotice('Progress direset.');
      }
    });
});
