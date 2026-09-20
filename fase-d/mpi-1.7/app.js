'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Literasi Finansial — Untung, Rugi & Diskon
   Fase D (SMP)

   Utilitas bersama (esc, parseInputInt, showNotice, buildFeedbackBox,
   mesin navigasi tahap) berada di shared/engine.js.

   Bagian:
    1. Utilitas
    2. Konstanta
    3. State & Storage
    4. Navigasi
    5. Utilitas Render
    6. Stage: Orientasi
    7. Stage: Eksplorasi Transaksi
    8. Stage: Untung & Rugi
    9. Stage: Diskon
   10. Stage: Latihan Gabungan
   11. Stage: Tantangan
   12. Stage: Refleksi
   13. Stage: Selesai
   14. Init
   ============================================================ */

/* ============================================================
   1. UTILITAS
   ============================================================ */

function formatNumber(n) {
  var abs = String(Math.abs(Math.round(n)));
  var parts = [];
  while (abs.length > 3) {
    parts.unshift(abs.slice(abs.length - 3));
    abs = abs.slice(0, abs.length - 3);
  }
  if (abs) parts.unshift(abs);
  return (n < 0 ? '-' : '') + parts.join('.');
}

function rp(n) {
  return 'Rp' + formatNumber(n);
}

/* ============================================================
   2. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'eksplorasiTransaksi',
  'untungRugi',
  'diskon',
  'latihanGabungan',
  'tantangan',
  'refleksi',
  'selesai',
];

var STAGE_LABELS = [
  'Orientasi',
  'Transaksi',
  'Untung & Rugi',
  'Diskon',
  'Latihan',
  'Tantangan',
  'Refleksi',
  'Selesai',
];

var STORAGE_KEY = 'mpi-d-1-7-finansial-v1';

/* ============================================================
   3. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Eksplorasi Transaksi */
  eksplorasiCtxIdx: 0,
  eksplorasiRowDone: [],
  eksplorasiResultDone: [],
  eksplorasiDone: [],

  /* Untung & Rugi */
  untungRugiIdx: 0,
  untungRugiExercises: [],

  /* Diskon */
  diskonIdx: 0,
  diskonExercises: [],

  /* Latihan Gabungan */
  latihanIdx: 0,
  latihanExercises: [],

  /* Tantangan */
  tantanganIdx: 0,
  tantangan1Q1Chosen: null,
  tantangan1Q1Done: false,
  tantangan1Q2Input: '',
  tantangan1Q2HintShown: false,
  tantangan1Q2Done: false,
  tantangan2Input: '',
  tantangan2HintShown: false,
  tantangan2Done: false,
  tantangan3Q1Chosen: null,
  tantangan3Q1Done: false,
  tantangan3Q2Chosen: null,
  tantangan3Q2Done: false,

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
  var nCtx = DATA.eksplorasiTransaksi.konteks.length;
  State.currentStage = 'orientasi';
  State.completedStages = {};
  State.eksplorasiCtxIdx = 0;
  State.eksplorasiRowDone = new Array(nCtx).fill(false);
  State.eksplorasiResultDone = new Array(nCtx).fill(false);
  State.eksplorasiDone = new Array(nCtx).fill(false);
  State.untungRugiIdx = 0;
  State.untungRugiExercises = [];
  State.diskonIdx = 0;
  State.diskonExercises = [];
  State.latihanIdx = 0;
  State.latihanExercises = [];
  State.tantanganIdx = 0;
  State.tantangan1Q1Chosen = null;
  State.tantangan1Q1Done = false;
  State.tantangan1Q2Input = '';
  State.tantangan1Q2HintShown = false;
  State.tantangan1Q2Done = false;
  State.tantangan2Input = '';
  State.tantangan2HintShown = false;
  State.tantangan2Done = false;
  State.tantangan3Q1Chosen = null;
  State.tantangan3Q1Done = false;
  State.tantangan3Q2Chosen = null;
  State.tantangan3Q2Done = false;
  State.refleksiAnswers = {};
  State.refleksiSaved = false;
  initExerciseArrays();
}

function initExerciseArrays() {
  var nCtx = DATA.eksplorasiTransaksi.konteks.length;
  if (!State.eksplorasiRowDone || State.eksplorasiRowDone.length !== nCtx) {
    State.eksplorasiRowDone = new Array(nCtx).fill(false);
  }
  if (!State.eksplorasiResultDone || State.eksplorasiResultDone.length !== nCtx) {
    State.eksplorasiResultDone = new Array(nCtx).fill(false);
  }
  if (!State.eksplorasiDone || State.eksplorasiDone.length !== nCtx) {
    State.eksplorasiDone = new Array(nCtx).fill(false);
  }

  var ur = DATA.untungRugi.soal;
  if (!State.untungRugiExercises || State.untungRugiExercises.length !== ur.length) {
    State.untungRugiExercises = ur.map(function () {
      return { attempts: 0, hintShown: false, correct: false, userInput: '', revealed: false };
    });
  }

  var ds = DATA.diskon.soal;
  if (!State.diskonExercises || State.diskonExercises.length !== ds.length) {
    State.diskonExercises = ds.map(function () {
      return {
        attempts1: 0,
        correct1: false,
        input1: '',
        revealed1: false,
        attempts2: 0,
        correct2: false,
        input2: '',
        revealed2: false,
        hintShown: false,
      };
    });
  }

  var lt = DATA.latihanGabungan.soal;
  if (!State.latihanExercises || State.latihanExercises.length !== lt.length) {
    State.latihanExercises = lt.map(function () {
      return {
        attempts: 0,
        hintShown: false,
        correct: false,
        userInput: '',
        chosen: null,
        checked: false,
        revealed: false,
      };
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
    '</span></div>'
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
    case 'eksplorasiTransaksi':
      renderEksplorasiTransaksi(container);
      break;
    case 'untungRugi':
      renderUntungRugi(container);
      break;
    case 'diskon':
      renderDiskon(container);
      break;
    case 'latihanGabungan':
      renderLatihanGabungan(container);
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
    '<span class="stage-head__kicker">TAHAP 1 — ORIENTASI MASALAH</span>' +
    '<p class="stage-head__goal">Tujuan: Memahami konteks pembelajaran dan mengenali masalah literasi finansial dalam kehidupan nyata.</p>' +
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
    '<li><span class="objectives-list__num">1</span>Mengeksplorasi transaksi jual-beli dari berbagai konteks nyata untuk memahami konsep <strong>pendapatan</strong> dan <strong>modal</strong>.</li>' +
    '<li><span class="objectives-list__num">2</span>Menghitung <strong>keuntungan</strong> (Pendapatan − Modal) dan <strong>kerugian</strong> (Modal − Pendapatan).</li>' +
    '<li><span class="objectives-list__num">3</span>Memahami konsep <strong>diskon</strong> dan menghitung harga setelah diskon.</li>' +
    '<li><span class="objectives-list__num">4</span>Menyelesaikan tantangan berupa analisis laporan keuangan dan diskon bertingkat.</li>' +
    '</ol>' +
    '</div>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>🏪 Masalah: Apakah Usaha Bu Sari Untung atau Rugi?</h3>' +
    '<p>Bu Sari menjalankan warung kelontong di depan rumahnya. Setiap hari ia membeli stok barang dari grosir, lalu menjualnya kepada warga sekitar.</p>' +
    '<p>Hari ini Bu Sari mencatat: ia membeli stok barang seharga <strong>Rp79.000</strong> dan mendapat uang dari hasil penjualan sebesar <strong>Rp125.000</strong>.</p>' +
    '<div class="panel panel--warning" style="margin:var(--space-3) 0 0;">' +
    '<p style="margin:0;"><strong>Pertanyaan Pemantik:</strong> Apakah Bu Sari <em>untung</em> atau <em>rugi</em>? Berapa nilainya? Bagaimana cara menghitungnya?</p>' +
    '</div>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>Cara Menggunakan Media Ini</h3>' +
    '<div class="hero-steps">' +
    '<div class="hero-steps__item"><span class="hero-steps__num">1</span>Kerjakan tahap dari kiri ke kanan — setiap tahap harus diselesaikan dulu sebelum lanjut.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">2</span>Setiap aktivitas punya tombol <strong>Periksa</strong>, <strong>Petunjuk</strong>, dan <strong>Coba Lagi</strong>.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">3</span>Feedback menjelaskan alasan di balik jawaban — baca dengan teliti untuk belajar dari kesalahan.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">4</span>Progress tersimpan otomatis di browser ini.</div>' +
    '</div>' +
    '</div>' +
    '<div class="panel panel--compact panel--warning">' +
    '<p style="margin:0;font-size:0.88rem;color:var(--color-warning-strong);">' +
    '<strong>Catatan:</strong> Hasil latihan adalah panduan belajar mandiri. Diskusi dan asesmen oleh guru tetap menjadi bagian utama penilaian.' +
    '</p>' +
    '</div>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary btn--large" id="startBtn">Mulai Eksplorasi →</button>' +
    '</div>' +
    '</section>';

  document.getElementById('startBtn').addEventListener('click', function () {
    completeStage('orientasi');
    navigateTo('eksplorasiTransaksi');
  });
}

/* ============================================================
   7. STAGE: EKSPLORASI TRANSAKSI
   ============================================================ */

function buildCtxTabsHTML(ctxList, activeIdx, doneArr) {
  return ctxList
    .map(function (c, i) {
      var active = i === activeIdx ? ' aria-current="step"' : '';
      var doneCls = doneArr[i] ? ' is-complete' : '';
      var num = doneArr[i] ? '&#10003;' : i + 1;
      return (
        '<button type="button" class="stage-nav__item' +
        doneCls +
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

function buildWarungTableHTML(ctx, rowsDone) {
  var html =
    '<div style="overflow-x:auto;">' +
    '<table class="warung-table"><thead><tr>' +
    '<th>Produk</th><th>Harga Beli</th><th>Harga Jual</th><th>Qty</th>' +
    '<th>Pendapatan (Jual × Qty)</th>' +
    '</tr></thead><tbody>';

  ctx.produk.forEach(function (p, i) {
    var pendapatan = p.harga_jual * p.qty;
    html +=
      '<tr><td>' +
      p.icon +
      ' ' +
      esc(p.nama) +
      '</td>' +
      '<td>' +
      rp(p.harga_beli) +
      '</td>' +
      '<td>' +
      rp(p.harga_jual) +
      '</td>' +
      '<td>' +
      p.qty +
      '</td>';
    if (rowsDone) {
      html += '<td class="cell-correct">' + rp(pendapatan) + '</td>';
    } else {
      html +=
        '<td class="cell-input">' +
        '<input type="text" inputmode="numeric" id="pend_' +
        i +
        '" class="input-text" placeholder="Rp..." aria-label="Pendapatan ' +
        esc(p.nama) +
        '">' +
        '</td>';
    }
    html += '</tr>';
  });

  html += '</tbody>';
  if (rowsDone) {
    html +=
      '<tfoot>' +
      '<tr><td colspan="4" class="total-label">Total Pendapatan</td>' +
      '<td class="cell-correct">' +
      rp(ctx.total_pendapatan) +
      '</td></tr>' +
      '<tr><td colspan="4" class="total-label">Total Modal (Harga Beli × Qty)</td>' +
      '<td>' +
      rp(ctx.total_modal) +
      '</td></tr>' +
      '</tfoot>';
  }
  html += '</table></div>';
  return html;
}

function renderEksplorasiTransaksi(container) {
  var ctxList = DATA.eksplorasiTransaksi.konteks;
  var idx = State.eksplorasiCtxIdx;
  var ctx = ctxList[idx];
  var rowsDone = !!State.eksplorasiRowDone[idx];
  var resultDone = !!State.eksplorasiResultDone[idx];
  var ctxDone = !!State.eksplorasiDone[idx];
  var allDone = State.eksplorasiDone.every(Boolean);

  var tabsHTML = buildCtxTabsHTML(ctxList, idx, State.eksplorasiDone);
  var tableHTML = buildWarungTableHTML(ctx, rowsDone);

  /* Row check panel */
  var rowPanelHTML = '';
  if (!rowsDone) {
    rowPanelHTML =
      '<div class="btn-group" style="margin-top:var(--space-3);">' +
      '<button type="button" class="btn btn--ghost btn--small" id="hintRowBtn">💡 Petunjuk</button>' +
      '<button type="button" class="btn btn--primary" id="checkRowBtn">Periksa Pendapatan</button>' +
      '</div>' +
      '<div id="rowFeedback" style="margin-top:var(--space-3);"></div>';
  }

  /* Result panel */
  var resultHTML = '';
  if (rowsDone && !ctxDone) {
    var pendMore = ctx.total_pendapatan > ctx.total_modal;
    resultHTML =
      '<div class="panel panel--compact" style="margin-top:var(--space-3);">' +
      '<h4>Apa kesimpulanmu?</h4>' +
      '<p>Pendapatan: <strong>' +
      rp(ctx.total_pendapatan) +
      '</strong> — ' +
      'Modal: <strong>' +
      rp(ctx.total_modal) +
      '</strong></p>' +
      '<p>Apakah <strong>' +
      esc(ctx.badge) +
      '</strong> <em>untung</em> atau <em>rugi</em>?</p>' +
      '<div style="display:flex;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3);">' +
      '<button type="button" class="btn btn--primary" id="btnUntung">✓ Untung</button>' +
      '<button type="button" class="btn btn--ghost" id="btnRugi">✗ Rugi</button>' +
      '</div>' +
      '<div id="resultFeedback"></div>' +
      '</div>';
  } else if (ctxDone) {
    var rType = ctx.result_type;
    var fbType = rType === 'untung' ? 'success' : 'error';
    var fbIcon = rType === 'untung' ? '✓' : '✗';
    var rumusLabel =
      rType === 'untung'
        ? 'Untung = Pendapatan − Modal = ' +
          rp(ctx.total_pendapatan) +
          ' − ' +
          rp(ctx.total_modal) +
          ' = <strong>' +
          rp(ctx.result) +
          '</strong>'
        : 'Rugi = Modal − Pendapatan = ' +
          rp(ctx.total_modal) +
          ' − ' +
          rp(ctx.total_pendapatan) +
          ' = <strong>' +
          rp(ctx.result) +
          '</strong>';
    resultHTML =
      '<div class="panel panel--compact" style="margin-top:var(--space-3);">' +
      buildFeedbackBox(
        fbType,
        fbIcon,
        '<strong>Usaha ini ' +
          (rType === 'untung' ? 'UNTUNG' : 'RUGI') +
          '!</strong><br>' +
          rumusLabel
      ) +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="Eksplorasi Transaksi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 2 — EKSPLORASI TRANSAKSI</span>' +
    '<p class="stage-head__goal">Tujuan: Mengidentifikasi pendapatan dari setiap transaksi dan menentukan apakah suatu usaha untung atau rugi.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">' +
    esc(DATA.eksplorasiTransaksi.instruction) +
    '</p>' +
    '<div class="ctx-tabs">' +
    tabsHTML +
    '</div>' +
    '<div class="panel panel--hero" style="margin-bottom:0;">' +
    '<div style="display:flex;align-items:flex-start;gap:var(--space-3);margin-bottom:var(--space-3);">' +
    '<span style="font-size:2rem;flex-shrink:0;">' +
    ctx.icon +
    '</span>' +
    '<div><span class="badge-chip">' +
    esc(ctx.badge) +
    '</span>' +
    '<p style="margin:var(--space-1) 0 0;font-size:0.92rem;">' +
    ctx.story +
    '</p>' +
    '</div></div>' +
    tableHTML +
    rowPanelHTML +
    '</div>' +
    resultHTML +
    '</div>' +
    (allDone
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="nextTransBtn">Lanjut: Untung &amp; Rugi →</button>' +
        '</div>'
      : '') +
    '</section>';

  /* Events: tab switching */
  container.querySelectorAll('[data-ctx]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.eksplorasiCtxIdx = parseInt(btn.dataset.ctx, 10);
      saveState();
      renderEksplorasiTransaksi(container);
    });
  });

  /* Event: hint */
  var hintBtn = document.getElementById('hintRowBtn');
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      var fb = document.getElementById('rowFeedback');
      if (fb) fb.innerHTML = buildFeedbackBox('warning', '💡', ctx.hint_pendapatan);
    });

  /* Event: check rows */
  var checkBtn = document.getElementById('checkRowBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      var allCorrect = true;
      var errors = [];
      ctx.produk.forEach(function (p, i) {
        var inp = document.getElementById('pend_' + i);
        var parsed = parseInputInt(inp ? inp.value : '', true);
        if (parsed.value !== p.harga_jual * p.qty) {
          allCorrect = false;
          errors.push(esc(p.nama) + ': ' + rp(p.harga_jual) + ' × ' + p.qty + ' = ?');
        }
      });
      var fb = document.getElementById('rowFeedback');
      if (allCorrect) {
        State.eksplorasiRowDone[idx] = true;
        saveState();
        renderEksplorasiTransaksi(container);
      } else if (fb) {
        fb.innerHTML = buildFeedbackBox(
          'error',
          '✗',
          'Beberapa nilai belum tepat:<br>• ' + errors.join('<br>• ')
        );
      }
    });

  /* Event: untung/rugi buttons */
  var btnU = document.getElementById('btnUntung');
  var btnR = document.getElementById('btnRugi');
  if (btnU)
    btnU.addEventListener('click', function () {
      checkEksplorasiResult(container, idx, 'untung');
    });
  if (btnR)
    btnR.addEventListener('click', function () {
      checkEksplorasiResult(container, idx, 'rugi');
    });

  /* Event: next stage */
  var nextBtn = document.getElementById('nextTransBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      completeStage('eksplorasiTransaksi');
      navigateTo('untungRugi');
    });
}

function checkEksplorasiResult(container, idx, chosen) {
  var ctx = DATA.eksplorasiTransaksi.konteks[idx];
  if (chosen === ctx.result_type) {
    State.eksplorasiResultDone[idx] = true;
    State.eksplorasiDone[idx] = true;
    saveState();
    renderEksplorasiTransaksi(container);
  } else {
    var fb = document.getElementById('resultFeedback');
    if (fb)
      fb.innerHTML = buildFeedbackBox(
        'error',
        '✗',
        'Belum tepat. Bandingkan: Pendapatan = ' +
          rp(ctx.total_pendapatan) +
          ', Modal = ' +
          rp(ctx.total_modal) +
          '. Manakah yang lebih besar?'
      );
  }
}

/* ============================================================
   8. STAGE: UNTUNG & RUGI
   ============================================================ */

function renderUntungRugi(container) {
  var soal = DATA.untungRugi.soal;
  var idx = State.untungRugiIdx;
  var ex = State.untungRugiExercises[idx];
  var s = soal[idx];

  var statuses = soal.map(function (_, i) {
    var e = State.untungRugiExercises[i];
    return e.correct ? 'correct' : e.attempts > 0 ? 'incorrect' : null;
  });
  var allDone = State.untungRugiExercises.every(function (e) {
    return e.correct || e.revealed;
  });

  var feedbackHTML = '';
  if (ex.correct) {
    feedbackHTML = buildFeedbackBox('success', '✓', '<strong>Tepat!</strong> ' + s.explanation);
  } else if (ex.revealed) {
    feedbackHTML = buildFeedbackBox(
      'warning',
      '💡',
      'Jawaban: ' + rp(s.answer) + '<br>' + s.explanation
    );
  } else if (ex.attempts > 0) {
    feedbackHTML = buildFeedbackBox(
      'error',
      '✗',
      'Belum tepat.' + (ex.hintShown ? ' ' + s.hint : ' Gunakan petunjuk untuk bantuan.')
    );
  }

  var resultTypeLabel = s.result_type === 'untung' ? 'keuntungan' : 'kerugian';
  var isDone = ex.correct || ex.revealed;

  container.innerHTML =
    '<section aria-label="Untung dan Rugi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 3 — UNTUNG &amp; RUGI</span>' +
    '<p class="stage-head__goal">Tujuan: Menerapkan rumus keuntungan dan kerugian untuk menganalisis berbagai situasi jual-beli.</p>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<div class="formula-box">' +
    '<div class="formula-box__label">Rumus Untung &amp; Rugi</div>' +
    '<div class="formula-box__expr">Untung = Pendapatan − Modal</div>' +
    '<div class="formula-box__expr" style="font-size:1.2rem;color:var(--color-error-strong);">Rugi = Modal − Pendapatan</div>' +
    '<div class="formula-box__note">Untung jika Pendapatan &gt; Modal &nbsp;|&nbsp; Rugi jika Modal &gt; Pendapatan</div>' +
    '</div>' +
    '</div>' +
    buildProgressDots(soal.length, idx, statuses) +
    '<div class="panel">' +
    '<div style="display:flex;align-items:flex-start;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3);">' +
    '<span style="font-size:1.8rem;">' +
    s.icon +
    '</span>' +
    '<div><span class="badge-chip">' +
    esc(s.badge) +
    '</span>' +
    '<p style="margin:var(--space-1) 0 0;">' +
    s.story +
    '</p>' +
    '</div></div>' +
    '<div class="fin-summary">' +
    '<div class="fin-card fin-card--modal"><div class="fin-card__label">Modal</div>' +
    '<div class="fin-card__value">' +
    rp(s.modal) +
    '</div></div>' +
    '<div class="fin-card fin-card--pendapatan"><div class="fin-card__label">Pendapatan</div>' +
    '<div class="fin-card__value">' +
    rp(s.pendapatan) +
    '</div></div>' +
    '</div>' +
    '<div class="field-group">' +
    '<label for="urInput">Berapa ' +
    resultTypeLabel +
    'nya? (Rp)</label>' +
    '<input type="text" inputmode="numeric" id="urInput" class="input-text"' +
    ' placeholder="Masukkan jawaban..." value="' +
    esc(ex.userInput) +
    '"' +
    (isDone ? ' disabled' : '') +
    '>' +
    '<div class="field-error" id="urErr"></div>' +
    '</div>' +
    (!isDone
      ? '<div class="btn-group">' +
        (!ex.hintShown
          ? '<button type="button" class="btn btn--ghost btn--small" id="urHintBtn">💡 Petunjuk</button>'
          : '') +
        '<button type="button" class="btn btn--primary" id="urCheckBtn">Periksa</button>' +
        (ex.attempts >= 2
          ? '<button type="button" class="btn btn--ghost btn--small" id="urRevealBtn">Lihat Jawaban</button>'
          : '') +
        '</div>'
      : '') +
    (feedbackHTML ? '<div style="margin-top:var(--space-3);">' + feedbackHTML + '</div>' : '') +
    '<div class="btn-group" style="margin-top:var(--space-4);">' +
    (idx > 0
      ? '<button type="button" class="btn btn--ghost" id="urPrevBtn">← Sebelumnya</button>'
      : '') +
    (isDone && idx < soal.length - 1
      ? '<button type="button" class="btn btn--primary" id="urNextBtn">Soal Berikutnya →</button>'
      : '') +
    '</div>' +
    '</div>' +
    (allDone
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="nextUrBtn">Lanjut: Diskon →</button>' +
        '</div>'
      : '') +
    '</section>';

  var inp = document.getElementById('urInput');

  var hintBtn = document.getElementById('urHintBtn');
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      ex.hintShown = true;
      saveState();
      renderUntungRugi(container);
    });

  var checkBtn = document.getElementById('urCheckBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      var err = document.getElementById('urErr');
      if (err) err.textContent = '';
      var p = parseInputInt(inp ? inp.value : '', true);
      if (p.error === 'empty') {
        if (err) err.textContent = 'Isi jawaban terlebih dahulu.';
        return;
      }
      if (p.error === 'invalid') {
        if (err) err.textContent = 'Masukkan bilangan bulat (contoh: 55000).';
        return;
      }
      ex.attempts++;
      ex.userInput = inp ? inp.value : '';
      if (p.value === s.answer) ex.correct = true;
      saveState();
      renderUntungRugi(container);
    });

  var revealBtn = document.getElementById('urRevealBtn');
  if (revealBtn)
    revealBtn.addEventListener('click', function () {
      ex.revealed = true;
      saveState();
      renderUntungRugi(container);
    });

  var prevBtn = document.getElementById('urPrevBtn');
  if (prevBtn)
    prevBtn.addEventListener('click', function () {
      State.untungRugiIdx = idx - 1;
      saveState();
      renderUntungRugi(container);
    });

  var nextBtn = document.getElementById('urNextBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      State.untungRugiIdx = idx + 1;
      saveState();
      renderUntungRugi(container);
    });

  var nextStageBtn = document.getElementById('nextUrBtn');
  if (nextStageBtn)
    nextStageBtn.addEventListener('click', function () {
      completeStage('untungRugi');
      navigateTo('diskon');
    });
}

/* ============================================================
   9. STAGE: DISKON
   ============================================================ */

function buildPriceTagHTML(icon, nama, hargaAwal, persen) {
  var bayarPct = 100 - persen;
  return (
    '<div class="price-tag-wrap">' +
    '<div class="price-tag">' +
    '<div class="price-tag__icon">' +
    icon +
    '</div>' +
    '<div class="price-tag__nama">' +
    esc(nama) +
    '</div>' +
    '<div class="price-tag__harga-awal">' +
    rp(hargaAwal) +
    '</div>' +
    '<div class="price-tag__badge-diskon">DISKON ' +
    persen +
    '%</div>' +
    '</div>' +
    '<div class="discount-bar-wrap">' +
    '<div class="discount-bar-label">' +
    '<span>Diskon (' +
    persen +
    '%)</span>' +
    '<span>Harga Bayar (' +
    bayarPct +
    '%)</span>' +
    '</div>' +
    '<div class="discount-bar">' +
    '<div class="discount-bar__portion discount-bar__portion--diskon" style="width:' +
    persen +
    '%;">' +
    (persen >= 15 ? persen + '%' : '') +
    '</div>' +
    '<div class="discount-bar__portion discount-bar__portion--bayar" style="width:' +
    bayarPct +
    '%;">' +
    (bayarPct >= 15 ? bayarPct + '%' : '') +
    '</div>' +
    '</div>' +
    '<p style="font-size:0.82rem;color:var(--color-ink-muted);margin-top:var(--space-2);">' +
    'Diskon ' +
    persen +
    '% artinya kamu membayar hanya <strong>' +
    bayarPct +
    '%</strong> dari harga asli.' +
    '</p>' +
    '</div>' +
    '</div>'
  );
}

function renderDiskon(container) {
  var soal = DATA.diskon.soal;
  var idx = State.diskonIdx;
  var ex = State.diskonExercises[idx];
  var s = soal[idx];

  var statuses = soal.map(function (_, i) {
    var e = State.diskonExercises[i];
    return (e.correct1 && e.correct2) || e.revealed2
      ? 'correct'
      : e.attempts1 > 0 || e.attempts2 > 0
        ? 'incorrect'
        : null;
  });
  var allDone = State.diskonExercises.every(function (e) {
    return (e.correct1 && e.correct2) || e.revealed2;
  });
  var step1Done = ex.correct1 || ex.revealed1;
  var fullyDone = (ex.correct1 && ex.correct2) || ex.revealed2;

  /* Feedback step 1 */
  var fb1 = '';
  if (ex.correct1)
    fb1 = buildFeedbackBox(
      'success',
      '✓',
      'Nominal diskon benar: <strong>' + rp(s.diskon) + '</strong>!'
    );
  else if (ex.revealed1)
    fb1 = buildFeedbackBox(
      'warning',
      '💡',
      s.hints[0] + ' = <strong>' + rp(s.diskon) + '</strong>.'
    );
  else if (ex.attempts1 > 0)
    fb1 = buildFeedbackBox('error', '✗', 'Belum tepat. Ingat: Diskon = persen/100 × Harga Awal.');

  /* Feedback step 2 */
  var fb2 = '';
  if (ex.correct2)
    fb2 = buildFeedbackBox('success', '✓', '<strong>Harga akhir benar!</strong> ' + s.explanation);
  else if (ex.revealed2) fb2 = buildFeedbackBox('warning', '💡', s.explanation);
  else if (ex.attempts2 > 0)
    fb2 = buildFeedbackBox('error', '✗', 'Belum tepat. Harga akhir = Harga Awal − Diskon.');

  container.innerHTML =
    '<section aria-label="Diskon">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 4 — DISKON</span>' +
    '<p class="stage-head__goal">Tujuan: Menghitung nominal diskon dan harga akhir setelah diskon dengan benar.</p>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<div class="formula-box">' +
    '<div class="formula-box__label">Rumus Diskon</div>' +
    '<div class="formula-box__expr" style="font-size:1.25rem;">Diskon = Persen ÷ 100 × Harga Awal</div>' +
    '<div class="formula-box__expr" style="font-size:1.25rem;">Harga Akhir = Harga Awal − Diskon</div>' +
    '</div>' +
    '</div>' +
    buildProgressDots(soal.length, idx, statuses) +
    '<div class="panel">' +
    '<div style="margin-bottom:var(--space-3);">' +
    '<span class="badge-chip">' +
    esc(s.badge) +
    '</span>' +
    '</div>' +
    buildPriceTagHTML(s.icon, s.produk, s.harga_awal, s.persen_diskon) +
    '<div class="diskon-input-pair">' +
    /* Input 1: Nominal Diskon */
    '<div class="field-group" style="margin:0;">' +
    '<label for="diskonNominal"><strong>Langkah 1:</strong> Nominal Diskon (Rp)</label>' +
    '<input type="text" inputmode="numeric" id="diskonNominal" class="input-text"' +
    ' placeholder="Rp..." value="' +
    esc(ex.input1) +
    '"' +
    (step1Done ? ' disabled' : '') +
    '>' +
    '<div class="field-error" id="errD1"></div>' +
    (fb1 ? '<div style="margin-top:var(--space-2);">' + fb1 + '</div>' : '') +
    (!step1Done
      ? '<div class="btn-group" style="margin-top:var(--space-2);">' +
        (!ex.hintShown
          ? '<button type="button" class="btn btn--ghost btn--small" id="dkHintBtn">💡 Petunjuk</button>'
          : '') +
        '<button type="button" class="btn btn--primary btn--small" id="checkD1Btn">Periksa</button>' +
        (ex.attempts1 >= 2
          ? '<button type="button" class="btn btn--ghost btn--small" id="reveal1Btn">Lihat</button>'
          : '') +
        '</div>'
      : '') +
    (ex.hintShown && !step1Done
      ? '<div style="margin-top:var(--space-2);">' +
        buildFeedbackBox('warning', '💡', s.hints[0]) +
        '</div>'
      : '') +
    '</div>' +
    /* Input 2: Harga Akhir */
    '<div class="field-group" style="margin:0;">' +
    '<label for="hargaAkhir"><strong>Langkah 2:</strong> Harga Akhir (Rp)</label>' +
    '<input type="text" inputmode="numeric" id="hargaAkhir" class="input-text"' +
    ' placeholder="Rp..." value="' +
    esc(ex.input2) +
    '"' +
    (!step1Done || ex.correct2 || ex.revealed2 ? ' disabled' : '') +
    '>' +
    '<div class="field-error" id="errD2"></div>' +
    (fb2 ? '<div style="margin-top:var(--space-2);">' + fb2 + '</div>' : '') +
    (step1Done && !(ex.correct2 || ex.revealed2)
      ? '<div class="btn-group" style="margin-top:var(--space-2);">' +
        '<button type="button" class="btn btn--primary btn--small" id="checkD2Btn">Periksa</button>' +
        (ex.attempts2 >= 2
          ? '<button type="button" class="btn btn--ghost btn--small" id="reveal2Btn">Lihat</button>'
          : '') +
        '</div>'
      : '') +
    '</div>' +
    '</div>' /* end diskon-input-pair */ +
    '<div class="btn-group" style="margin-top:var(--space-4);">' +
    (idx > 0
      ? '<button type="button" class="btn btn--ghost" id="dkPrevBtn">← Sebelumnya</button>'
      : '') +
    (fullyDone && idx < soal.length - 1
      ? '<button type="button" class="btn btn--primary" id="dkNextBtn">Soal Berikutnya →</button>'
      : '') +
    '</div>' +
    '</div>' +
    (allDone
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="nextDkBtn">Lanjut: Latihan →</button>' +
        '</div>'
      : '') +
    '</section>';

  /* Events */
  var hintBtn = document.getElementById('dkHintBtn');
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      ex.hintShown = true;
      saveState();
      renderDiskon(container);
    });

  var chk1 = document.getElementById('checkD1Btn');
  if (chk1)
    chk1.addEventListener('click', function () {
      var err = document.getElementById('errD1');
      if (err) err.textContent = '';
      var inp = document.getElementById('diskonNominal');
      var p = parseInputInt(inp ? inp.value : '', true);
      if (p.error === 'empty') {
        if (err) err.textContent = 'Isi nominal diskon.';
        return;
      }
      if (p.error === 'invalid') {
        if (err) err.textContent = 'Masukkan bilangan bulat.';
        return;
      }
      ex.attempts1++;
      ex.input1 = inp ? inp.value : '';
      if (p.value === s.diskon) ex.correct1 = true;
      saveState();
      renderDiskon(container);
    });

  var rv1 = document.getElementById('reveal1Btn');
  if (rv1)
    rv1.addEventListener('click', function () {
      ex.revealed1 = true;
      ex.correct1 = true;
      saveState();
      renderDiskon(container);
    });

  var chk2 = document.getElementById('checkD2Btn');
  if (chk2)
    chk2.addEventListener('click', function () {
      var err = document.getElementById('errD2');
      if (err) err.textContent = '';
      var inp = document.getElementById('hargaAkhir');
      var p = parseInputInt(inp ? inp.value : '', true);
      if (p.error === 'empty') {
        if (err) err.textContent = 'Isi harga akhir.';
        return;
      }
      if (p.error === 'invalid') {
        if (err) err.textContent = 'Masukkan bilangan bulat.';
        return;
      }
      ex.attempts2++;
      ex.input2 = inp ? inp.value : '';
      if (p.value === s.harga_akhir) ex.correct2 = true;
      saveState();
      renderDiskon(container);
    });

  var rv2 = document.getElementById('reveal2Btn');
  if (rv2)
    rv2.addEventListener('click', function () {
      ex.revealed2 = true;
      saveState();
      renderDiskon(container);
    });

  var prevBtn = document.getElementById('dkPrevBtn');
  if (prevBtn)
    prevBtn.addEventListener('click', function () {
      State.diskonIdx = idx - 1;
      saveState();
      renderDiskon(container);
    });

  var nextBtn = document.getElementById('dkNextBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      State.diskonIdx = idx + 1;
      saveState();
      renderDiskon(container);
    });

  var nextStageBtn = document.getElementById('nextDkBtn');
  if (nextStageBtn)
    nextStageBtn.addEventListener('click', function () {
      completeStage('diskon');
      navigateTo('latihanGabungan');
    });
}

/* ============================================================
   10. STAGE: LATIHAN GABUNGAN
   ============================================================ */

function renderLatihanGabungan(container) {
  var soal = DATA.latihanGabungan.soal;
  var idx = State.latihanIdx;
  var ex = State.latihanExercises[idx];
  var s = soal[idx];

  var statuses = soal.map(function (_, i) {
    var e = State.latihanExercises[i];
    if (e.correct || (e.checked && soal[i].type === 'choice' && e.chosen === soal[i].correct))
      return 'correct';
    if (e.attempts > 0 || e.checked || e.revealed) return 'incorrect';
    return null;
  });

  var allDone = State.latihanExercises.every(function (e, i) {
    var s2 = soal[i];
    if (s2.type === 'choice') return e.checked;
    return e.correct || e.revealed;
  });

  var bodyHTML = buildLatihanBody(s, ex);
  var feedbackHTML = buildLatihanFeedback(s, ex);
  var isDone = s.type === 'choice' ? ex.checked : ex.correct || ex.revealed;

  container.innerHTML =
    '<section aria-label="Latihan Gabungan">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 5 — LATIHAN GABUNGAN</span>' +
    '<p class="stage-head__goal">Tujuan: Mengaplikasikan konsep untung/rugi dan diskon dalam berbagai konteks masalah.</p>' +
    '</div>' +
    buildProgressDots(soal.length, idx, statuses) +
    '<div class="panel">' +
    '<div style="display:flex;align-items:flex-start;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3);">' +
    '<span style="font-size:1.8rem;">' +
    s.icon +
    '</span>' +
    '<div><span class="badge-chip">' +
    esc(s.badge) +
    '</span>' +
    '<p style="margin:var(--space-1) 0 0;">' +
    s.story +
    '</p>' +
    '</div></div>' +
    bodyHTML +
    (feedbackHTML ? '<div style="margin-top:var(--space-3);">' + feedbackHTML + '</div>' : '') +
    '<div class="btn-group" style="margin-top:var(--space-4);">' +
    (idx > 0
      ? '<button type="button" class="btn btn--ghost" id="ltPrevBtn">← Sebelumnya</button>'
      : '') +
    (isDone && idx < soal.length - 1
      ? '<button type="button" class="btn btn--primary" id="ltNextBtn">Soal Berikutnya →</button>'
      : '') +
    '</div>' +
    '</div>' +
    (allDone
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="nextLtBtn">Lanjut: Tantangan →</button>' +
        '</div>'
      : '') +
    '</section>';

  wireLatihanEvents(container, s, ex, idx);

  var prevBtn = document.getElementById('ltPrevBtn');
  if (prevBtn)
    prevBtn.addEventListener('click', function () {
      State.latihanIdx = idx - 1;
      saveState();
      renderLatihanGabungan(container);
    });

  var nextBtn = document.getElementById('ltNextBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      State.latihanIdx = idx + 1;
      saveState();
      renderLatihanGabungan(container);
    });

  var nextStage = document.getElementById('nextLtBtn');
  if (nextStage)
    nextStage.addEventListener('click', function () {
      completeStage('latihanGabungan');
      navigateTo('tantangan');
    });
}

function buildLatihanBody(s, ex) {
  if (s.type === 'choice') {
    var optsHTML = s.options
      .map(function (opt) {
        var sel = ex.chosen === opt.id;
        var cls = 'choice-option';
        if (ex.checked && sel && opt.id === s.correct) cls += ' choice-option--correct';
        else if (ex.checked && sel) cls += ' choice-option--wrong';
        else if (ex.checked && opt.id === s.correct) cls += ' choice-option--correct';
        else if (sel) cls += ' choice-option--selected';
        return (
          '<div class="' +
          cls +
          '">' +
          '<input type="radio" name="lt_choice" id="lt_' +
          esc(opt.id) +
          '" value="' +
          esc(opt.id) +
          '"' +
          (sel ? ' checked' : '') +
          (ex.checked ? ' disabled' : '') +
          '>' +
          '<label for="lt_' +
          esc(opt.id) +
          '">' +
          esc(opt.label) +
          '</label>' +
          '</div>'
        );
      })
      .join('');
    return (
      '<div class="choices-list">' +
      optsHTML +
      '</div>' +
      (!ex.checked
        ? '<div class="btn-group">' +
          (!ex.hintShown
            ? '<button type="button" class="btn btn--ghost btn--small" id="ltHintBtn">💡 Petunjuk</button>'
            : '') +
          '<button type="button" class="btn btn--primary" id="ltCheckChoiceBtn">Periksa</button>' +
          '</div>'
        : '') +
      (ex.hintShown && !ex.checked
        ? '<div style="margin-top:var(--space-2);">' +
          buildFeedbackBox('warning', '💡', s.hint) +
          '</div>'
        : '')
    );
  }

  /* Input types: input_ur, input_diskon, input_diskon_nominal */
  var finCards = '';
  var questionLabel = 'Jawaban (Rp)';
  if (s.type === 'input_ur') {
    finCards =
      '<div class="fin-summary">' +
      '<div class="fin-card fin-card--modal"><div class="fin-card__label">Modal</div>' +
      '<div class="fin-card__value">' +
      rp(s.modal) +
      '</div></div>' +
      '<div class="fin-card fin-card--pendapatan"><div class="fin-card__label">Pendapatan</div>' +
      '<div class="fin-card__value">' +
      rp(s.pendapatan) +
      '</div></div>' +
      '</div>';
    questionLabel =
      'Berapa ' + (s.result_type === 'untung' ? 'keuntungan' : 'kerugian') + 'nya? (Rp)';
  } else if (s.type === 'input_diskon') {
    questionLabel = 'Harga akhir setelah diskon ' + s.persen_diskon + '% (Rp)';
  } else if (s.type === 'input_diskon_nominal') {
    questionLabel = 'Nominal diskon ' + s.persen_diskon + '% dari ' + rp(s.harga_awal) + ' (Rp)';
  }
  var isDone = ex.correct || ex.revealed;
  return (
    finCards +
    '<div class="field-group">' +
    '<label for="ltInput">' +
    questionLabel +
    '</label>' +
    '<input type="text" inputmode="numeric" id="ltInput" class="input-text"' +
    ' placeholder="Rp..." value="' +
    esc(ex.userInput) +
    '"' +
    (isDone ? ' disabled' : '') +
    '>' +
    '<div class="field-error" id="ltErr"></div>' +
    '</div>' +
    (!isDone
      ? '<div class="btn-group">' +
        (!ex.hintShown
          ? '<button type="button" class="btn btn--ghost btn--small" id="ltHintBtn">💡 Petunjuk</button>'
          : '') +
        '<button type="button" class="btn btn--primary" id="ltCheckBtn">Periksa</button>' +
        (ex.attempts >= 2
          ? '<button type="button" class="btn btn--ghost btn--small" id="ltRevealBtn">Lihat Jawaban</button>'
          : '') +
        '</div>'
      : '') +
    (ex.hintShown && !isDone
      ? '<div style="margin-top:var(--space-2);">' +
        buildFeedbackBox('warning', '💡', s.hint) +
        '</div>'
      : '')
  );
}

function buildLatihanFeedback(s, ex) {
  if (s.type === 'choice') {
    if (!ex.checked) return '';
    if (ex.chosen === s.correct)
      return buildFeedbackBox('success', '✓', '<strong>Tepat!</strong> ' + s.explanation);
    return buildFeedbackBox('error', '✗', s.explanation);
  }
  if (ex.correct)
    return buildFeedbackBox('success', '✓', '<strong>Tepat!</strong> ' + s.explanation);
  if (ex.revealed)
    return buildFeedbackBox('warning', '💡', 'Jawaban: ' + rp(s.answer) + '<br>' + s.explanation);
  return '';
}

function wireLatihanEvents(container, s, ex, idx) {
  var hintBtn = document.getElementById('ltHintBtn');
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      ex.hintShown = true;
      saveState();
      renderLatihanGabungan(container);
    });

  var checkBtn = document.getElementById('ltCheckBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      var err = document.getElementById('ltErr');
      if (err) err.textContent = '';
      var inp = document.getElementById('ltInput');
      var p = parseInputInt(inp ? inp.value : '', true);
      if (p.error === 'empty') {
        if (err) err.textContent = 'Isi jawaban terlebih dahulu.';
        return;
      }
      if (p.error === 'invalid') {
        if (err) err.textContent = 'Masukkan bilangan bulat.';
        return;
      }
      ex.attempts++;
      ex.userInput = inp ? inp.value : '';
      if (p.value === s.answer) ex.correct = true;
      saveState();
      renderLatihanGabungan(container);
    });

  var checkChoiceBtn = document.getElementById('ltCheckChoiceBtn');
  if (checkChoiceBtn)
    checkChoiceBtn.addEventListener('click', function () {
      if (!ex.chosen) {
        showNotice('Pilih salah satu jawaban terlebih dahulu.');
        return;
      }
      ex.checked = true;
      ex.correct = ex.chosen === s.correct;
      saveState();
      renderLatihanGabungan(container);
    });

  var revealBtn = document.getElementById('ltRevealBtn');
  if (revealBtn)
    revealBtn.addEventListener('click', function () {
      ex.revealed = true;
      saveState();
      renderLatihanGabungan(container);
    });

  container.querySelectorAll('input[name="lt_choice"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      ex.chosen = radio.value;
      saveState();
    });
  });
}

/* ============================================================
   11. STAGE: TANTANGAN
   ============================================================ */

function renderTantangan(container) {
  var soal = DATA.tantangan.soal;
  var idx = State.tantanganIdx;
  var s = soal[idx];

  var isDoneArr = [
    State.tantangan1Q1Done && State.tantangan1Q2Done,
    State.tantangan2Done,
    State.tantangan3Q1Done && State.tantangan3Q2Done,
  ];
  var allTantanganDone = isDoneArr.every(Boolean);

  var bodyHTML = '';
  if (s.id === 't1') bodyHTML = buildT1HTML();
  else if (s.id === 't2') bodyHTML = buildT2HTML();
  else if (s.id === 't3') bodyHTML = buildT3HTML();

  container.innerHTML =
    '<section aria-label="Tantangan">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 6 — TANTANGAN LITERASI FINANSIAL</span>' +
    '<p class="stage-head__goal">Tujuan: Menganalisis masalah finansial kompleks dan mengambil keputusan berdasarkan data.</p>' +
    '</div>' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-4);">' +
    soal
      .map(function (t, i) {
        var active = i === idx ? ' aria-current="step"' : '';
        var doneCls = isDoneArr[i] ? ' is-complete' : '';
        return (
          '<button type="button" class="stage-nav__item' +
          doneCls +
          '"' +
          active +
          ' data-tant="' +
          i +
          '">' +
          '<span class="stage-nav__num">' +
          (isDoneArr[i] ? '&#10003;' : i + 1) +
          '</span>' +
          esc(t.badge) +
          '</button>'
        );
      })
      .join('') +
    '</div>' +
    '<div class="panel">' +
    '<div style="display:flex;align-items:flex-start;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3);">' +
    '<span style="font-size:2rem;flex-shrink:0;">' +
    s.icon +
    '</span>' +
    '<div><span class="badge-chip">' +
    esc(s.badge) +
    '</span>' +
    '<p style="margin:var(--space-1) 0 0;">' +
    s.story +
    '</p>' +
    '</div></div>' +
    bodyHTML +
    '</div>' +
    (allTantanganDone
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="nextTantBtn">Lanjut: Refleksi →</button>' +
        '</div>'
      : '') +
    '</section>';

  container.querySelectorAll('[data-tant]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.tantanganIdx = parseInt(btn.dataset.tant, 10);
      saveState();
      renderTantangan(container);
    });
  });

  if (s.id === 't1') wireT1Events(container);
  else if (s.id === 't2') wireT2Events(container);
  else if (s.id === 't3') wireT3Events(container);

  var nextBtn = document.getElementById('nextTantBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      completeStage('tantangan');
      navigateTo('refleksi');
    });
}

/* --- Tantangan 1: Laporan Keuangan --- */

function buildT1HTML() {
  var t = DATA.tantangan.soal[0];
  var rows = t.table;

  var tableHTML =
    '<table class="laporan-table"><thead><tr>' +
    '<th>Hari</th><th>Modal</th><th>Pendapatan</th><th>Untung / Rugi</th>' +
    '</tr></thead><tbody>';
  rows.forEach(function (row) {
    var diff = row.pendapatan - row.modal;
    var rowCls = diff >= 0 ? 'row-untung' : 'row-rugi';
    var label = diff >= 0 ? 'Untung ' + rp(diff) : 'Rugi ' + rp(-diff);
    tableHTML +=
      '<tr class="' +
      rowCls +
      '"><td>' +
      esc(row.hari) +
      '</td>' +
      '<td>' +
      rp(row.modal) +
      '</td><td>' +
      rp(row.pendapatan) +
      '</td><td>' +
      label +
      '</td></tr>';
  });
  tableHTML += '</tbody></table>';

  var q1 = t.questions[0];
  var q1Opts = q1.options
    .map(function (opt) {
      var sel = State.tantangan1Q1Chosen === opt.id;
      var cls = 'choice-option';
      if (State.tantangan1Q1Done && sel && opt.id === q1.correct) cls += ' choice-option--correct';
      else if (State.tantangan1Q1Done && sel) cls += ' choice-option--wrong';
      else if (State.tantangan1Q1Done && opt.id === q1.correct) cls += ' choice-option--correct';
      else if (sel) cls += ' choice-option--selected';
      return (
        '<div class="' +
        cls +
        '">' +
        '<input type="radio" name="t1q1" id="t1q1_' +
        esc(opt.id) +
        '" value="' +
        esc(opt.id) +
        '"' +
        (sel ? ' checked' : '') +
        (State.tantangan1Q1Done ? ' disabled' : '') +
        '>' +
        '<label for="t1q1_' +
        esc(opt.id) +
        '">' +
        esc(opt.label) +
        '</label></div>'
      );
    })
    .join('');

  var q2 = t.questions[1];
  var q2HTML = '';
  if (State.tantangan1Q1Done) {
    q2HTML =
      '<div style="margin-top:var(--space-5);border-top:1px solid var(--color-border);padding-top:var(--space-4);">' +
      '<h4>' +
      q2.question +
      '</h4>' +
      '<div class="field-group">' +
      '<label for="t1q2">Total keuntungan bersih (Rp)</label>' +
      '<input type="text" inputmode="numeric" id="t1q2" class="input-text"' +
      ' placeholder="Rp..." value="' +
      esc(State.tantangan1Q2Input) +
      '"' +
      (State.tantangan1Q2Done ? ' disabled' : '') +
      '>' +
      '<div class="field-error" id="t1q2Err"></div>' +
      '</div>' +
      (!State.tantangan1Q2Done
        ? '<div class="btn-group">' +
          (!State.tantangan1Q2HintShown
            ? '<button type="button" class="btn btn--ghost btn--small" id="t1q2HintBtn">💡 Petunjuk</button>'
            : '') +
          '<button type="button" class="btn btn--primary btn--small" id="t1q2CheckBtn">Periksa</button>' +
          '</div>'
        : '') +
      (State.tantangan1Q2HintShown && !State.tantangan1Q2Done
        ? '<div style="margin-top:var(--space-2);">' +
          buildFeedbackBox('warning', '💡', q2.hint) +
          '</div>'
        : '') +
      (State.tantangan1Q2Done ? buildFeedbackBox('success', '✓', q2.explanation) : '') +
      '</div>';
  }

  return (
    tableHTML +
    '<h4 style="margin-top:var(--space-4);">' +
    q1.question +
    '</h4>' +
    '<div class="choices-list">' +
    q1Opts +
    '</div>' +
    (!State.tantangan1Q1Done
      ? '<div class="btn-group"><button type="button" class="btn btn--primary btn--small" id="t1q1CheckBtn">Periksa</button></div>'
      : buildFeedbackBox(
          State.tantangan1Q1Chosen === q1.correct ? 'success' : 'error',
          State.tantangan1Q1Chosen === q1.correct ? '✓' : '✗',
          q1.explanation
        )) +
    q2HTML
  );
}

function wireT1Events(container) {
  var t = DATA.tantangan.soal[0];
  container.querySelectorAll('input[name="t1q1"]').forEach(function (r) {
    r.addEventListener('change', function () {
      State.tantangan1Q1Chosen = r.value;
      saveState();
    });
  });

  var chkQ1 = document.getElementById('t1q1CheckBtn');
  if (chkQ1)
    chkQ1.addEventListener('click', function () {
      if (!State.tantangan1Q1Chosen) {
        showNotice('Pilih jawaban terlebih dahulu.');
        return;
      }
      State.tantangan1Q1Done = true;
      saveState();
      renderTantangan(container);
    });

  var hintQ2 = document.getElementById('t1q2HintBtn');
  if (hintQ2)
    hintQ2.addEventListener('click', function () {
      State.tantangan1Q2HintShown = true;
      saveState();
      renderTantangan(container);
    });

  var chkQ2 = document.getElementById('t1q2CheckBtn');
  if (chkQ2)
    chkQ2.addEventListener('click', function () {
      var err = document.getElementById('t1q2Err');
      if (err) err.textContent = '';
      var inp = document.getElementById('t1q2');
      var p = parseInputInt(inp ? inp.value : '', true);
      if (p.error === 'empty') {
        if (err) err.textContent = 'Isi jawaban terlebih dahulu.';
        return;
      }
      if (p.error === 'invalid') {
        if (err) err.textContent = 'Masukkan bilangan bulat.';
        return;
      }
      State.tantangan1Q2Input = inp ? inp.value : '';
      if (p.value === t.questions[1].answer) {
        State.tantangan1Q2Done = true;
      } else {
        if (err)
          err.textContent = 'Belum tepat. Coba hitung ulang total pendapatan dan total modal.';
      }
      saveState();
      renderTantangan(container);
    });
}

/* --- Tantangan 2: Harga Jual Target --- */

function buildT2HTML() {
  var t = DATA.tantangan.soal[1];
  return (
    '<h4>' +
    t.question +
    '</h4>' +
    '<div class="field-group">' +
    '<label for="t2Input">Harga jual per kaleng (Rp)</label>' +
    '<input type="text" inputmode="numeric" id="t2Input" class="input-text"' +
    ' placeholder="Rp..." value="' +
    esc(State.tantangan2Input) +
    '"' +
    (State.tantangan2Done ? ' disabled' : '') +
    '>' +
    '<div class="field-error" id="t2Err"></div>' +
    '</div>' +
    (!State.tantangan2Done
      ? '<div class="btn-group">' +
        (!State.tantangan2HintShown
          ? '<button type="button" class="btn btn--ghost btn--small" id="t2HintBtn">💡 Petunjuk</button>'
          : '') +
        '<button type="button" class="btn btn--primary" id="t2CheckBtn">Periksa</button>' +
        '</div>'
      : '') +
    (State.tantangan2HintShown && !State.tantangan2Done
      ? '<div style="margin-top:var(--space-2);">' +
        buildFeedbackBox('warning', '💡', t.hint) +
        '</div>'
      : '') +
    (State.tantangan2Done ? buildFeedbackBox('success', '✓', t.explanation) : '')
  );
}

function wireT2Events(container) {
  var t = DATA.tantangan.soal[1];

  var hintBtn = document.getElementById('t2HintBtn');
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      State.tantangan2HintShown = true;
      saveState();
      renderTantangan(container);
    });

  var chkBtn = document.getElementById('t2CheckBtn');
  if (chkBtn)
    chkBtn.addEventListener('click', function () {
      var err = document.getElementById('t2Err');
      if (err) err.textContent = '';
      var inp = document.getElementById('t2Input');
      var p = parseInputInt(inp ? inp.value : '', true);
      if (p.error === 'empty') {
        if (err) err.textContent = 'Isi jawaban terlebih dahulu.';
        return;
      }
      if (p.error === 'invalid') {
        if (err) err.textContent = 'Masukkan bilangan bulat.';
        return;
      }
      State.tantangan2Input = inp ? inp.value : '';
      if (p.value === t.answer) {
        State.tantangan2Done = true;
      } else {
        if (err) err.textContent = 'Belum tepat. Gunakan petunjuk untuk panduan langkah-langkah.';
      }
      saveState();
      renderTantangan(container);
    });
}

/* --- Tantangan 3: Diskon Bertingkat --- */

function buildT3HTML() {
  var t = DATA.tantangan.soal[2];

  var q1Opts = t.q1.options
    .map(function (opt) {
      var sel = State.tantangan3Q1Chosen === opt.id;
      var cls = 'choice-option';
      if (State.tantangan3Q1Done && sel && opt.id === t.q1.correct)
        cls += ' choice-option--correct';
      else if (State.tantangan3Q1Done && sel) cls += ' choice-option--wrong';
      else if (State.tantangan3Q1Done && opt.id === t.q1.correct) cls += ' choice-option--correct';
      else if (sel) cls += ' choice-option--selected';
      return (
        '<div class="' +
        cls +
        '">' +
        '<input type="radio" name="t3q1" id="t3q1_' +
        esc(opt.id) +
        '" value="' +
        esc(opt.id) +
        '"' +
        (sel ? ' checked' : '') +
        (State.tantangan3Q1Done ? ' disabled' : '') +
        '>' +
        '<label for="t3q1_' +
        esc(opt.id) +
        '">' +
        esc(opt.label) +
        '</label></div>'
      );
    })
    .join('');

  var q2HTML = '';
  if (State.tantangan3Q1Done) {
    var q2Opts = t.q2.options
      .map(function (opt) {
        var sel = State.tantangan3Q2Chosen === opt.id;
        var cls = 'choice-option';
        if (State.tantangan3Q2Done && sel && opt.id === t.q2.correct)
          cls += ' choice-option--correct';
        else if (State.tantangan3Q2Done && sel) cls += ' choice-option--wrong';
        else if (State.tantangan3Q2Done && opt.id === t.q2.correct)
          cls += ' choice-option--correct';
        else if (sel) cls += ' choice-option--selected';
        return (
          '<div class="' +
          cls +
          '">' +
          '<input type="radio" name="t3q2" id="t3q2_' +
          esc(opt.id) +
          '" value="' +
          esc(opt.id) +
          '"' +
          (sel ? ' checked' : '') +
          (State.tantangan3Q2Done ? ' disabled' : '') +
          '>' +
          '<label for="t3q2_' +
          esc(opt.id) +
          '">' +
          esc(opt.label) +
          '</label></div>'
        );
      })
      .join('');

    q2HTML =
      '<div style="margin-top:var(--space-5);border-top:1px solid var(--color-border);padding-top:var(--space-4);">' +
      '<h4>' +
      t.q2.question +
      '</h4>' +
      '<div class="choices-list">' +
      q2Opts +
      '</div>' +
      (!State.tantangan3Q2Done
        ? '<div class="btn-group"><button type="button" class="btn btn--primary btn--small" id="t3q2CheckBtn">Periksa</button></div>'
        : buildFeedbackBox(
            State.tantangan3Q2Chosen === t.q2.correct ? 'success' : 'error',
            State.tantangan3Q2Chosen === t.q2.correct ? '✓' : '✗',
            t.q2.explanation
          )) +
      '</div>';
  }

  return (
    '<h4>' +
    t.q1.question +
    '</h4>' +
    '<div class="choices-list">' +
    q1Opts +
    '</div>' +
    (!State.tantangan3Q1Done
      ? '<div class="btn-group"><button type="button" class="btn btn--primary btn--small" id="t3q1CheckBtn">Periksa</button></div>'
      : buildFeedbackBox(
          State.tantangan3Q1Chosen === t.q1.correct ? 'success' : 'error',
          State.tantangan3Q1Chosen === t.q1.correct ? '✓' : '✗',
          t.q1.explanation
        )) +
    q2HTML
  );
}

function wireT3Events(container) {
  var t = DATA.tantangan.soal[2];

  container.querySelectorAll('input[name="t3q1"]').forEach(function (r) {
    r.addEventListener('change', function () {
      State.tantangan3Q1Chosen = r.value;
      saveState();
    });
  });
  container.querySelectorAll('input[name="t3q2"]').forEach(function (r) {
    r.addEventListener('change', function () {
      State.tantangan3Q2Chosen = r.value;
      saveState();
    });
  });

  var chkQ1 = document.getElementById('t3q1CheckBtn');
  if (chkQ1)
    chkQ1.addEventListener('click', function () {
      if (!State.tantangan3Q1Chosen) {
        showNotice('Pilih jawaban terlebih dahulu.');
        return;
      }
      State.tantangan3Q1Done = true;
      saveState();
      renderTantangan(container);
    });

  var chkQ2 = document.getElementById('t3q2CheckBtn');
  if (chkQ2)
    chkQ2.addEventListener('click', function () {
      if (!State.tantangan3Q2Chosen) {
        showNotice('Pilih jawaban terlebih dahulu.');
        return;
      }
      State.tantangan3Q2Done = true;
      saveState();
      renderTantangan(container);
    });
}

/* ============================================================
   12. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var soal = DATA.refleksi.soal;
  var saved = State.refleksiSaved;

  var fieldsHTML = soal
    .map(function (q) {
      var val = State.refleksiAnswers[q.id] || '';
      return (
        '<div class="field-group">' +
        '<label for="r_' +
        esc(q.id) +
        '" style="font-weight:600;">' +
        q.question +
        '</label>' +
        '<textarea id="r_' +
        esc(q.id) +
        '" class="input-text" rows="3"' +
        ' placeholder="' +
        esc(q.placeholder) +
        '"' +
        (saved ? ' disabled' : '') +
        ' style="width:100%;resize:vertical;">' +
        esc(val) +
        '</textarea>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Refleksi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 7 — REFLEKSI PEMBELAJARAN</span>' +
    '<p class="stage-head__goal">Tujuan: Merangkum dan mengkonsolidasi pemahaman melalui refleksi mandiri.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.9rem;color:var(--color-ink-muted);">' +
    DATA.refleksi.note +
    '</p>' +
    fieldsHTML +
    (!saved
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="saveReflBtn">Simpan &amp; Selesai ✓</button>' +
        '</div>'
      : '<div style="margin-top:var(--space-4);">' +
        buildFeedbackBox(
          'success',
          '✓',
          'Refleksi tersimpan! Kamu dapat melanjutkan ke halaman selesai.'
        ) +
        '</div>' +
        '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="gotoSelesaiBtn">Lihat Ringkasan →</button>' +
        '</div>') +
    '</div>' +
    '</section>';

  var saveBtn = document.getElementById('saveReflBtn');
  if (saveBtn)
    saveBtn.addEventListener('click', function () {
      soal.forEach(function (q) {
        var el = document.getElementById('r_' + q.id);
        State.refleksiAnswers[q.id] = el ? el.value : '';
      });
      State.refleksiSaved = true;
      completeStage('refleksi');
      saveState();
      renderRefleksi(container);
    });

  var gotoBtn = document.getElementById('gotoSelesaiBtn');
  if (gotoBtn)
    gotoBtn.addEventListener('click', function () {
      navigateTo('selesai');
    });
}

/* ============================================================
   13. STAGE: SELESAI
   ============================================================ */

function renderSelesai(container) {
  var totalSoal =
    DATA.untungRugi.soal.length +
    DATA.diskon.soal.length +
    DATA.latihanGabungan.soal.length +
    5; /* tantangan sub-questions */
  var correct = 0;
  DATA.untungRugi.soal.forEach(function (_, i) {
    if (State.untungRugiExercises[i] && State.untungRugiExercises[i].correct) correct++;
  });
  DATA.diskon.soal.forEach(function (_, i) {
    var e = State.diskonExercises[i];
    if (e && e.correct1 && e.correct2) correct++;
  });
  DATA.latihanGabungan.soal.forEach(function (s, i) {
    var e = State.latihanExercises[i];
    if (!e) return;
    if (s.type === 'choice' && e.chosen === s.correct) correct++;
    else if (e.correct) correct++;
  });
  if (State.tantangan1Q1Chosen === DATA.tantangan.soal[0].questions[0].correct) correct++;
  if (State.tantangan1Q2Done) correct++;
  if (State.tantangan2Done) correct++;
  if (State.tantangan3Q1Chosen === DATA.tantangan.soal[2].q1.correct) correct++;
  if (State.tantangan3Q2Chosen === DATA.tantangan.soal[2].q2.correct) correct++;

  var pct = Math.round((correct / totalSoal) * 100);

  completeStage('selesai');

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 8 — SELESAI 🎉</span>' +
    '</div>' +
    '<div class="panel panel--hero" style="text-align:center;">' +
    '<p style="font-size:3rem;margin-bottom:var(--space-3);">🏆</p>' +
    '<h2>Selamat! Kamu telah menyelesaikan<br>Literasi Finansial: Untung, Rugi &amp; Diskon</h2>' +
    '<p style="font-size:1.05rem;margin-bottom:var(--space-4);">' +
    'Kamu menjawab dengan benar <strong>' +
    correct +
    ' dari ' +
    totalSoal +
    ' soal</strong> (' +
    pct +
    '%).</p>' +
    '<div class="progress-bar" role="progressbar" aria-valuenow="' +
    pct +
    '" aria-valuemin="0" aria-valuemax="100"' +
    ' style="max-width:360px;margin:0 auto var(--space-5);">' +
    '<div class="progress-bar__fill" style="width:' +
    pct +
    '%;background:var(--color-success);"></div>' +
    '</div>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>Ringkasan yang Sudah Kamu Pelajari</h3>' +
    '<ul>' +
    '<li>✅ <strong>Pendapatan</strong> = Harga Jual × Jumlah Terjual</li>' +
    '<li>✅ <strong>Untung</strong> = Pendapatan − Modal (jika Pendapatan &gt; Modal)</li>' +
    '<li>✅ <strong>Rugi</strong> = Modal − Pendapatan (jika Modal &gt; Pendapatan)</li>' +
    '<li>✅ <strong>Diskon</strong> = Persen ÷ 100 × Harga Awal</li>' +
    '<li>✅ <strong>Harga Akhir</strong> = Harga Awal − Diskon</li>' +
    '<li>✅ <strong>Diskon bertingkat</strong> ≠ jumlah persen diskon secara langsung</li>' +
    '</ul>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>Refleksimu</h3>' +
    (DATA.refleksi.soal
      .map(function (q) {
        var ans = State.refleksiAnswers[q.id];
        if (!ans || ans.trim() === '') return '';
        return (
          '<div style="margin-bottom:var(--space-3);">' +
          '<p style="font-size:0.82rem;color:var(--color-ink-muted);margin-bottom:var(--space-1);">' +
          q.question +
          '</p>' +
          '<p style="background:var(--color-bg-grid);padding:var(--space-3);border-radius:var(--radius-sm);font-size:0.92rem;">' +
          esc(ans) +
          '</p></div>'
        );
      })
      .join('') || '<p style="color:var(--color-ink-muted);">Tidak ada refleksi tersimpan.</p>') +
    '</div>' +
    '<div class="btn-group btn-group--end" style="margin-top:var(--space-5);">' +
    '<button type="button" class="btn btn--ghost" id="resetFinalBtn">Mulai Ulang</button>' +
    '<a href="../../index.html" class="btn btn--primary">Kembali ke Beranda</a>' +
    '</div>' +
    '</section>';

  var resetBtn = document.getElementById('resetFinalBtn');
  if (resetBtn)
    resetBtn.addEventListener('click', function () {
      clearState();
      navigateTo('orientasi');
    });
}

/* ============================================================
   15. INIT
   ============================================================ */

(function init() {
  /* Load or init state */
  loadState();
  initExerciseArrays();

  buildStageNav();

  /* Reset button */
  var resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn)
    resetBtn.addEventListener('click', function () {
      if (window.confirm('Reset semua progress? Data tidak dapat dikembalikan.')) {
        clearState();
        navigateTo('orientasi');
      }
    });

  updateStageNav();
  renderCurrentStage();
})();
