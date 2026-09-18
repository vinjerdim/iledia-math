'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Rancangan Anggaran Belanja — Fase D SMP

   Bagian:
    1. Utilitas
    2. Konstanta
    3. State & Storage
    4. Navigasi
    5. Utilitas Render
    6. Stage: Orientasi
    7. Stage: Eksplorasi Operasi
    8. Stage: Menyusun Rincian
    9. Stage: Analisis Anggaran
   10. Stage: Finalisasi Rancangan
   11. Stage: Presentasi Rancangan
   12. Stage: Refleksi
   13. Stage: Selesai
   14. Helper UI
   15. Init
   ============================================================ */

/* ============================================================
   1. UTILITAS
   ============================================================ */

function parseInputInt(str) {
  if (!str || str.trim() === '') return { value: null, error: 'empty' };
  var trimmed = str.trim();
  var chars = [];
  for (var i = 0; i < trimmed.length; i++) {
    var ch = trimmed.charAt(i);
    if (ch !== '.' && ch !== ',' && ch !== ' ') chars.push(ch);
  }
  var s = chars.join('');
  if (!/^-?\d+$/.test(s)) return { value: null, error: 'invalid' };
  var v = parseInt(s, 10);
  if (isNaN(v)) return { value: null, error: 'invalid' };
  return { value: v, error: null };
}

function esc(str) {
  var m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str).replace(/[&<>"']/g, function (c) {
    return m[c];
  });
}

function formatNumber(n) {
  var s = String(Math.round(n));
  var sign = '';
  if (s.charAt(0) === '-') {
    sign = '-';
    s = s.slice(1);
  }
  var parts = [];
  while (s.length > 3) {
    parts.unshift(s.slice(s.length - 3));
    s = s.slice(0, s.length - 3);
  }
  if (s) parts.unshift(s);
  return sign + parts.join('.');
}

function formatRupiah(n) {
  return 'Rp\u00a0' + formatNumber(n);
}

/* ============================================================
   2. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'eksplorasiOperasi',
  'menyusunRincian',
  'analisisAnggaran',
  'finalisasiRancangan',
  'presentasiRancangan',
  'refleksi',
  'selesai',
];

var STAGE_LABELS = [
  'Orientasi',
  'Eksplorasi',
  'Menyusun',
  'Analisis',
  'Finalisasi',
  'Presentasi',
  'Refleksi',
  'Selesai',
];

var STORAGE_KEY = 'mpi-d-1-8-anggaran-v1';

/* ============================================================
   3. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Eksplorasi Operasi */
  eksplorasiCtxIdx: 0,
  eksplorasiCtxStep: [0, 0, 0],
  eksplorasiCtxDone: [false, false, false],

  /* Menyusun Rincian */
  menyusunIdx: 0,
  menyusunExercises: [],

  /* Analisis Anggaran */
  analisisIdx: 0,
  analisisExercises: [],

  /* Finalisasi Rancangan */
  finalisasiItems: null,
  finalisasiDone: false,

  /* Presentasi Rancangan */
  presentasiNarasi: '',
  presentasiAnswers: [
    { input: '', done: false },
    { input: '', done: false },
  ],
  presentasiRefleksi: '',
  presentasiDone: false,

  /* Refleksi */
  refleksiAnswers: {},
  refleksiSaved: false,
};

function initExerciseArrays() {
  if (
    !State.menyusunExercises ||
    State.menyusunExercises.length !== DATA.menyusunRincian.soal.length
  ) {
    State.menyusunExercises = DATA.menyusunRincian.soal.map(function () {
      return { attempts: 0, hintLevel: 0, correct: false, userInput: '', revealed: false };
    });
  }
  if (
    !State.analisisExercises ||
    State.analisisExercises.length !== DATA.analisisAnggaran.soal.length
  ) {
    State.analisisExercises = DATA.analisisAnggaran.soal.map(function () {
      return {
        attempts: 0,
        hintLevel: 0,
        correct: false,
        userInput: '',
        revealed: false,
        chosen: null,
        checked: false,
      };
    });
  }
  if (
    !State.finalisasiItems ||
    State.finalisasiItems.length !== DATA.finalisasiRancangan.kategori.length
  ) {
    State.finalisasiItems = DATA.finalisasiRancangan.kategori.map(function () {
      return { qty: '', harga: '', total: 0 };
    });
  }
  if (!State.presentasiAnswers || State.presentasiAnswers.length !== 2) {
    State.presentasiAnswers = [
      { input: '', done: false },
      { input: '', done: false },
    ];
  }
  if (!State.eksplorasiCtxStep || State.eksplorasiCtxStep.length !== 3) {
    State.eksplorasiCtxStep = [0, 0, 0];
  }
  if (!State.eksplorasiCtxDone || State.eksplorasiCtxDone.length !== 3) {
    State.eksplorasiCtxDone = [false, false, false];
  }
}

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
  State.eksplorasiCtxIdx = 0;
  State.eksplorasiCtxStep = [0, 0, 0];
  State.eksplorasiCtxDone = [false, false, false];
  State.menyusunIdx = 0;
  State.menyusunExercises = [];
  State.analisisIdx = 0;
  State.analisisExercises = [];
  State.finalisasiItems = null;
  State.finalisasiDone = false;
  State.presentasiNarasi = '';
  State.presentasiAnswers = [
    { input: '', done: false },
    { input: '', done: false },
  ];
  State.presentasiRefleksi = '';
  State.presentasiDone = false;
  State.refleksiAnswers = {};
  State.refleksiSaved = false;
  initExerciseArrays();
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

function updateStageNav() {
  var currentIdx = STAGES.indexOf(State.currentStage);
  document.querySelectorAll('.stage-nav__item').forEach(function (btn) {
    var sid = btn.dataset.stage;
    var idx = STAGES.indexOf(sid);
    btn.removeAttribute('aria-current');
    btn.classList.remove('is-complete');
    btn.disabled = false;
    if (sid === State.currentStage) {
      btn.setAttribute('aria-current', 'step');
    } else if (State.completedStages[sid]) {
      btn.classList.add('is-complete');
    }
    if (idx > currentIdx && !State.completedStages[STAGES[idx - 1]]) {
      btn.disabled = true;
    }
  });
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

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  container.innerHTML = '';
  updateProgress();
  switch (State.currentStage) {
    case 'orientasi':
      renderOrientasi(container);
      break;
    case 'eksplorasiOperasi':
      renderEksplorasiOperasi(container);
      break;
    case 'menyusunRincian':
      renderMenyusunRincian(container);
      break;
    case 'analisisAnggaran':
      renderAnalisisAnggaran(container);
      break;
    case 'finalisasiRancangan':
      renderFinalisasiRancangan(container);
      break;
    case 'presentasiRancangan':
      renderPresentasiRancangan(container);
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
    '<p class="stage-head__goal">Tujuan: Memahami konteks masalah dan menyiapkan diri untuk menyusun anggaran.</p>' +
    '</div>' +
    '<div class="panel panel--hero">' +
    '<div style="display:flex;align-items:flex-start;gap:var(--space-3);flex-wrap:wrap;">' +
    '<span style="font-size:2rem;">📢</span>' +
    '<div>' +
    '<h2 style="margin-bottom:var(--space-2);">Tantangan Pentas Seni Kelas 8B</h2>' +
    '<p>Kelas 8B mendapat kepercayaan untuk menyelenggarakan <strong>Pentas Seni Sekolah</strong>. ' +
    'Wali kelas memberikan dana sebesar <strong>Rp 600.000</strong> sebagai anggaran kegiatan.</p>' +
    '<p>Sebagai panitia, tugasmu adalah menyusun <strong>rancangan anggaran belanja yang rasional</strong> — ' +
    'yaitu anggaran yang mencakup semua kebutuhan, tidak melebihi batas dana, ' +
    'dan dapat dipertanggungjawabkan secara matematis.</p>' +
    '</div></div></div>' +
    '<div class="panel panel--info">' +
    '<h3 style="margin-bottom:var(--space-2);">Dalam media ini kamu akan:</h3>' +
    '<ol class="objectives-list">' +
    '<li><span class="objectives-list__num">1</span>Menggunakan <strong>penjumlahan dan pengurangan</strong> bilangan bulat untuk menghitung total belanja dan sisa anggaran.</li>' +
    '<li><span class="objectives-list__num">2</span>Menggunakan <strong>perkalian dan pembagian</strong> untuk menghitung biaya per item dan biaya bersama.</li>' +
    '<li><span class="objectives-list__num">3</span>Menggunakan <strong>pecahan dan desimal</strong> untuk menghitung diskon, persentase, dan alokasi anggaran.</li>' +
    '<li><span class="objectives-list__num">4</span>Menyusun <strong>rancangan anggaran</strong> sendiri menggunakan simulator interaktif.</li>' +
    '<li><span class="objectives-list__num">5</span>Mempresentasikan dan mempertanggungjawabkan anggaran yang kamu susun.</li>' +
    '</ol></div>' +
    '<div class="panel panel--compact">' +
    '<h3>Masalah yang Akan Dipecahkan</h3>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:var(--space-3);">' +
    buildMasalahCard('🎨', 'Dekorasi', 'Berapa biaya total dekorasi setelah diskon?') +
    buildMasalahCard('🍱', 'Konsumsi', 'Berapa porsi yang dibutuhkan dan total biayanya?') +
    buildMasalahCard('🎭', 'Penampilan', 'Sewa kostum berapa? Diskon berapa persen?') +
    buildMasalahCard('🔊', 'Teknis', 'Biaya dibagi berapa kelompok? Per kelompok berapa?') +
    '</div></div>' +
    '<div class="panel panel--compact">' +
    '<h3>Cara Menggunakan Media Ini</h3>' +
    '<div class="hero-steps">' +
    '<div class="hero-steps__item"><span class="hero-steps__num">1</span>Kerjakan tahap dari kiri ke kanan. Setiap tahap harus diselesaikan sebelum lanjut.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">2</span>Setiap aktivitas punya tombol <strong>Periksa</strong>, <strong>Petunjuk</strong>, dan <strong>Coba Lagi</strong>.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">3</span>Pada tahap Finalisasi, kamu menyusun anggaran sendiri menggunakan kalkulator interaktif.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">4</span>Progress tersimpan otomatis di browser ini.</div>' +
    '</div></div>' +
    '<div class="panel panel--compact panel--warning">' +
    '<p style="margin:0;font-size:0.88rem;color:var(--color-warning-strong);">' +
    '<strong>Catatan:</strong> Media ini adalah panduan belajar mandiri. ' +
    'Diskusi kelompok, proyek nyata, dan asesmen oleh guru tetap menjadi bagian penting pembelajaran.' +
    '</p></div>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary btn--large" id="startBtn">Mulai Eksplorasi →</button>' +
    '</div></section>';

  document.getElementById('startBtn').addEventListener('click', function () {
    completeStage('orientasi');
    navigateTo('eksplorasiOperasi');
  });
}

function buildMasalahCard(icon, label, desc) {
  return (
    '<div style="background:var(--color-bg-grid);border-radius:var(--radius-sm);padding:var(--space-3);text-align:center;">' +
    '<div style="font-size:1.5rem;margin-bottom:4px;">' +
    icon +
    '</div>' +
    '<div style="font-weight:700;font-size:0.85rem;margin-bottom:4px;">' +
    esc(label) +
    '</div>' +
    '<div style="font-size:0.78rem;color:var(--color-ink-muted);">' +
    esc(desc) +
    '</div>' +
    '</div>'
  );
}

/* ============================================================
   7. STAGE: EKSPLORASI OPERASI
   ============================================================ */

function renderEksplorasiOperasi(container) {
  var ctxList = DATA.eksplorasiOperasi.konteks;
  var idx = State.eksplorasiCtxIdx;
  var ctx = ctxList[idx];
  var currentStep = State.eksplorasiCtxStep[idx] || 0;
  var isDone = State.eksplorasiCtxDone[idx] || false;
  var allDone = State.eksplorasiCtxDone.filter(Boolean).length === ctxList.length;

  /* tabs */
  var tabsHTML = ctxList
    .map(function (c, i) {
      var active = i === idx ? ' aria-current="step"' : '';
      var done = State.eksplorasiCtxDone[i] ? ' is-complete' : '';
      var num = State.eksplorasiCtxDone[i] ? '&#10003;' : i + 1;
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

  /* receipt items */
  var itemsHTML = ctx.items
    .map(function (item) {
      var valHTML;
      if (item.harga_label) {
        valHTML =
          '<span class="receipt-item__val receipt-item__val--label">' +
          esc(item.harga_label) +
          '</span>';
      } else {
        valHTML = '<span class="receipt-item__val">' + formatRupiah(item.harga) + '</span>';
      }
      return (
        '<div class="receipt-item">' +
        '<span class="receipt-item__name">' +
        esc(item.nama) +
        '</span>' +
        valHTML +
        '</div>'
      );
    })
    .join('');

  /* steps */
  var stepsHTML = '';
  for (var i = 0; i < ctx.steps.length; i++) {
    var s = ctx.steps[i];
    if (i < currentStep || (isDone && i < ctx.steps.length)) {
      stepsHTML +=
        '<div class="ops-step ops-step--done">' +
        '<div class="ops-step__num">&#10003;</div>' +
        '<div class="ops-step__content">' +
        '<p style="margin-bottom:var(--space-2);">' +
        s.question +
        '</p>' +
        buildFeedbackBox('success', '&#10003;', s.explanation) +
        '</div></div>';
    } else if (i === currentStep && !isDone) {
      stepsHTML +=
        '<div class="ops-step ops-step--active" id="activeStep">' +
        '<div class="ops-step__num">' +
        (i + 1) +
        '</div>' +
        '<div class="ops-step__content">' +
        '<p style="margin-bottom:var(--space-3);">' +
        s.question +
        '</p>' +
        '<div class="input-row">' +
        '<input type="text" inputmode="numeric" id="stepInput" class="input-text" ' +
        'placeholder="Ketik jawaban (Rp)…" aria-label="Jawaban" />' +
        '<button type="button" class="btn btn--primary" id="stepCheckBtn">Periksa</button>' +
        '</div>' +
        '<div id="stepFeedback" style="margin-top:var(--space-3);"></div>' +
        '<div class="btn-group" style="margin-top:var(--space-2);">' +
        '<button type="button" class="btn btn--ghost btn--small" id="stepHintBtn">&#128161; Petunjuk</button>' +
        '</div>' +
        '</div></div>';
    } else {
      stepsHTML +=
        '<div class="ops-step ops-step--locked">' +
        '<div class="ops-step__num">' +
        (i + 1) +
        '</div>' +
        '<div class="ops-step__content" style="color:var(--color-ink-muted);font-size:0.9rem;">' +
        s.question +
        '</div></div>';
    }
  }

  /* done banner */
  var doneBannerHTML = '';
  if (isDone) {
    doneBannerHTML = buildFeedbackBox(
      'success',
      '&#127881;',
      '<strong>' + esc(ctx.badge) + ' selesai!</strong> Semua langkah berhasil diselesaikan.'
    );
  }

  /* all done banner */
  var allDoneBannerHTML = '';
  if (allDone) {
    allDoneBannerHTML =
      '<div class="panel" style="margin-top:var(--space-4);">' +
      buildFeedbackBox(
        'success',
        '&#127775;',
        '<strong>Semua eksplorasi selesai!</strong> Kamu telah menguasai penjumlahan, pengurangan, perkalian, pembagian, desimal, dan pecahan dalam konteks anggaran.' +
          '<div class="btn-group" style="margin-top:var(--space-3);">' +
          '<button type="button" class="btn btn--primary" id="lanjutMenyusunBtn">Lanjut ke Menyusun Rincian →</button>' +
          '</div>'
      ) +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="Eksplorasi Operasi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 2 — EKSPLORASI OPERASI</span>' +
    '<p class="stage-head__goal">Tujuan: Melatih operasi aritmatika (penjumlahan, pengurangan, perkalian, pembagian, pecahan, desimal) dalam konteks anggaran.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);">' +
    esc(DATA.eksplorasiOperasi.instruction) +
    '</p>' +
    '<div class="ctx-tabs" id="ctxTabs">' +
    tabsHTML +
    '</div>' +
    '<div class="panel panel--hero" style="margin-bottom:var(--space-4);">' +
    '<div style="display:flex;align-items:flex-start;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3);">' +
    '<span style="font-size:1.8rem;">' +
    ctx.icon +
    '</span>' +
    '<div>' +
    '<span class="badge-chip">' +
    esc(ctx.badge) +
    '</span>' +
    '<span class="badge-chip" style="background:var(--color-primary);color:#fff;border-color:var(--color-primary);margin-left:4px;">' +
    esc(ctx.operasi_label) +
    '</span>' +
    '<p style="margin:var(--space-2) 0 0;font-size:0.92rem;">' +
    ctx.story +
    '</p>' +
    '</div></div>' +
    '<div class="receipt-card">' +
    '<div class="receipt-card__header">' +
    ctx.icon +
    ' ' +
    esc(ctx.badge) +
    ' — Data Anggaran' +
    '</div>' +
    itemsHTML +
    '</div></div>' +
    '<h4 style="margin-bottom:var(--space-3);">Langkah Penyelesaian</h4>' +
    stepsHTML +
    doneBannerHTML +
    '</div>' +
    allDoneBannerHTML +
    '</section>';

  /* event listeners */
  container.querySelectorAll('[data-ctx]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.eksplorasiCtxIdx = parseInt(btn.dataset.ctx, 10);
      saveState();
      renderEksplorasiOperasi(container);
    });
  });

  var checkBtn = document.getElementById('stepCheckBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      handleEksplorasiCheck(container, idx, currentStep);
    });
    var input = document.getElementById('stepInput');
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleEksplorasiCheck(container, idx, currentStep);
      });
      input.focus();
    }
  }

  var hintBtn = document.getElementById('stepHintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      var fb = document.getElementById('stepFeedback');
      if (fb && !fb.innerHTML) {
        fb.innerHTML = buildFeedbackBox('info', '&#128161;', esc(ctx.steps[currentStep].hint));
      }
    });
  }

  var lanjutBtn = document.getElementById('lanjutMenyusunBtn');
  if (lanjutBtn) {
    lanjutBtn.addEventListener('click', function () {
      completeStage('eksplorasiOperasi');
      navigateTo('menyusunRincian');
    });
  }
}

function handleEksplorasiCheck(container, ctxIdx, stepIdx) {
  var input = document.getElementById('stepInput');
  var fb = document.getElementById('stepFeedback');
  if (!input || !fb) return;
  var parsed = parseInputInt(input.value);
  var ctx = DATA.eksplorasiOperasi.konteks[ctxIdx];
  var step = ctx.steps[stepIdx];

  if (parsed.error === 'empty') {
    fb.innerHTML = buildFeedbackBox('error', '&#9888;', 'Masukkan jawaban terlebih dahulu.');
    return;
  }
  if (parsed.error === 'invalid') {
    fb.innerHTML = buildFeedbackBox(
      'error',
      '&#9888;',
      'Ketik angka saja (contoh: <strong>295000</strong> atau <strong>295.000</strong>).'
    );
    return;
  }

  if (parsed.value === step.answer) {
    /* correct: advance step */
    State.eksplorasiCtxStep[ctxIdx] = stepIdx + 1;
    if (stepIdx + 1 >= ctx.steps.length) {
      State.eksplorasiCtxDone[ctxIdx] = true;
    }
    saveState();
    renderEksplorasiOperasi(container);
  } else {
    fb.innerHTML = buildFeedbackBox(
      'error',
      '&#10007;',
      'Jawaban belum tepat. Coba hitung ulang. ' +
        '<button type="button" class="btn btn--ghost btn--small" id="hintAfterWrongBtn" style="margin-top:var(--space-2);">&#128161; Tampilkan Petunjuk</button>'
    );
    document.getElementById('hintAfterWrongBtn').addEventListener('click', function () {
      fb.innerHTML = buildFeedbackBox('info', '&#128161;', esc(step.hint));
    });
    input.focus();
    input.select();
  }
}

/* ============================================================
   8. STAGE: MENYUSUN RINCIAN
   ============================================================ */

function renderMenyusunRincian(container) {
  var soalList = DATA.menyusunRincian.soal;
  var idx = State.menyusunIdx;
  var soal = soalList[idx];
  var ex = State.menyusunExercises[idx];

  var statuses = State.menyusunExercises.map(function (e) {
    return e.correct ? 'correct' : e.attempts > 0 ? 'incorrect' : 'pending';
  });
  var dotsHTML = buildProgressDots(soalList.length, idx, statuses);

  var allDone = State.menyusunExercises.every(function (e) {
    return e.correct || e.revealed;
  });

  /* main exercise card */
  var feedbackHTML = '';
  if (ex.correct) {
    feedbackHTML = buildFeedbackBox('success', '&#10003;', soal.explanation);
  } else if (ex.revealed) {
    feedbackHTML = buildFeedbackBox(
      'info',
      '&#128218;',
      'Jawaban: <strong>' + formatRupiah(soal.answer) + '</strong>. ' + soal.explanation
    );
  }

  var operasiHTML =
    '<span style="font-family:var(--font-mono);font-size:0.75rem;font-weight:700;' +
    'background:var(--color-orange-soft);color:var(--color-orange-strong);' +
    'border:1px solid var(--color-orange);border-radius:10px;padding:2px 8px;">' +
    'Operasi: ' +
    esc(soal.operasi) +
    '</span>';

  var inputDisabled = ex.correct || ex.revealed;

  container.innerHTML =
    '<section aria-label="Menyusun Rincian">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 3 — MENYUSUN RINCIAN</span>' +
    '<p class="stage-head__goal">Tujuan: Menghitung biaya setiap pos anggaran menggunakan operasi aritmatika yang tepat.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);">' +
    esc(DATA.menyusunRincian.instruction) +
    '</p>' +
    dotsHTML +
    '<div class="panel panel--hero" style="margin-bottom:var(--space-4);">' +
    '<div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3);flex-wrap:wrap;">' +
    '<span style="font-size:1.6rem;">' +
    soal.icon +
    '</span>' +
    '<div>' +
    '<span class="badge-chip">' +
    esc(soal.kategori) +
    '</span> ' +
    operasiHTML +
    '</div></div>' +
    '<p style="background:var(--color-bg-grid);padding:var(--space-3);border-radius:var(--radius-sm);font-size:0.92rem;margin-bottom:var(--space-3);">' +
    soal.konteks +
    '</p>' +
    '<p style="font-weight:600;">' +
    soal.question +
    '</p>' +
    '<div class="input-row" style="margin-bottom:var(--space-3);">' +
    '<input type="text" inputmode="numeric" id="menyusunInput" class="input-text" ' +
    'value="' +
    esc(ex.userInput) +
    '" ' +
    (inputDisabled ? 'disabled ' : '') +
    'placeholder="Masukkan jawaban (Rp)…" aria-label="Jawaban" />' +
    '<button type="button" class="btn btn--primary" id="menyusunCheckBtn" ' +
    (inputDisabled ? 'disabled' : '') +
    '>Periksa</button>' +
    '</div>' +
    (feedbackHTML ? feedbackHTML : '<div id="menyusunFeedback"></div>') +
    '<div class="btn-group" style="margin-top:var(--space-3);">' +
    (!ex.correct && !ex.revealed && ex.hintLevel < soal.hints.length
      ? '<button type="button" class="btn btn--ghost btn--small" id="menyusunHintBtn">&#128161; Petunjuk (' +
        (ex.hintLevel + 1) +
        '/' +
        soal.hints.length +
        ')</button>'
      : '') +
    (!ex.correct && !ex.revealed && ex.attempts >= 2
      ? '<button type="button" class="btn btn--ghost btn--small" id="menyusunRevealBtn">&#128218; Lihat Jawaban</button>'
      : '') +
    '</div></div>' +
    buildNavRow(idx, soalList.length, allDone, 'analisisAnggaran') +
    '</div></section>';

  /* listeners */
  var checkBtn = document.getElementById('menyusunCheckBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      handleMenyusunCheck(container, idx);
    });
    var inp = document.getElementById('menyusunInput');
    if (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleMenyusunCheck(container, idx);
      });
      if (!inputDisabled) inp.focus();
    }
  }

  var hintBtn = document.getElementById('menyusunHintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      var fb = document.getElementById('menyusunFeedback');
      if (!fb) return;
      var level = ex.hintLevel;
      if (level < soal.hints.length) {
        fb.innerHTML = buildFeedbackBox('info', '&#128161;', esc(soal.hints[level]));
        State.menyusunExercises[idx].hintLevel = level + 1;
        saveState();
        renderMenyusunRincian(container);
      }
    });
  }

  var revealBtn = document.getElementById('menyusunRevealBtn');
  if (revealBtn) {
    revealBtn.addEventListener('click', function () {
      State.menyusunExercises[idx].revealed = true;
      saveState();
      renderMenyusunRincian(container);
    });
  }

  attachNavRowListeners(
    container,
    idx,
    soalList.length,
    'menyusunIdx',
    renderMenyusunRincian,
    'menyusunRincian',
    'analisisAnggaran'
  );
}

function handleMenyusunCheck(container, idx) {
  var inp = document.getElementById('menyusunInput');
  var fb = document.getElementById('menyusunFeedback');
  var soal = DATA.menyusunRincian.soal[idx];
  var ex = State.menyusunExercises[idx];
  if (!inp) return;
  var val = inp.value;
  ex.userInput = val;
  var parsed = parseInputInt(val);

  if (parsed.error === 'empty') {
    if (fb)
      fb.innerHTML = buildFeedbackBox('error', '&#9888;', 'Masukkan jawaban terlebih dahulu.');
    return;
  }
  if (parsed.error === 'invalid') {
    if (fb)
      fb.innerHTML = buildFeedbackBox(
        'error',
        '&#9888;',
        'Ketik angka saja. Contoh: <strong>140000</strong> atau <strong>140.000</strong>.'
      );
    return;
  }

  ex.attempts++;
  if (parsed.value === soal.answer) {
    ex.correct = true;
  }
  saveState();
  renderMenyusunRincian(container);
}

/* ============================================================
   9. STAGE: ANALISIS ANGGARAN
   ============================================================ */

function renderAnalisisAnggaran(container) {
  var soalList = DATA.analisisAnggaran.soal;
  var idx = State.analisisIdx;
  var soal = soalList[idx];
  var ex = State.analisisExercises[idx];

  var statuses = State.analisisExercises.map(function (e) {
    return e.correct ? 'correct' : e.attempts > 0 || e.checked ? 'incorrect' : 'pending';
  });
  var dotsHTML = buildProgressDots(soalList.length, idx, statuses);
  var allDone = State.analisisExercises.every(function (e) {
    return e.correct || e.revealed || e.checked;
  });

  /* body of exercise */
  var exerciseBody = '';
  if (soal.type === 'choice') {
    exerciseBody = buildAnalisisChoice(soal, ex);
  } else {
    exerciseBody = buildAnalisisInput(soal, ex);
  }

  container.innerHTML =
    '<section aria-label="Analisis Anggaran">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 4 — ANALISIS ANGGARAN</span>' +
    '<p class="stage-head__goal">Tujuan: Menggunakan pecahan dan desimal dalam analisis anggaran.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);">' +
    esc(DATA.analisisAnggaran.instruction) +
    '</p>' +
    dotsHTML +
    '<div class="panel panel--compact" style="margin-bottom:var(--space-4);">' +
    '<p style="font-weight:600;font-size:0.95rem;margin-bottom:var(--space-4);">' +
    soal.question +
    '</p>' +
    exerciseBody +
    '</div>' +
    buildNavRow(idx, soalList.length, allDone, 'finalisasiRancangan') +
    '</div></section>';

  attachAnalisisListeners(container, idx, soal);
  attachNavRowListeners(
    container,
    idx,
    soalList.length,
    'analisisIdx',
    renderAnalisisAnggaran,
    'analisisAnggaran',
    'finalisasiRancangan'
  );
}

function buildAnalisisInput(soal, ex) {
  var feedbackHTML = '';
  if (ex.correct) {
    feedbackHTML = buildFeedbackBox('success', '&#10003;', soal.explanation);
  } else if (ex.revealed) {
    feedbackHTML = buildFeedbackBox(
      'info',
      '&#128218;',
      'Jawaban: <strong>' + formatRupiah(soal.answer) + '</strong>. ' + soal.explanation
    );
  }
  var inputDisabled = ex.correct || ex.revealed;
  var hints = soal.hints;
  var hintHTML = '';
  if (!ex.correct && !ex.revealed) {
    if (ex.hintLevel < hints.length) {
      hintHTML +=
        '<button type="button" class="btn btn--ghost btn--small" id="analisisHintBtn">&#128161; Petunjuk (' +
        (ex.hintLevel + 1) +
        '/' +
        hints.length +
        ')</button>';
    }
    if (ex.attempts >= 2) {
      hintHTML +=
        '<button type="button" class="btn btn--ghost btn--small" id="analisisRevealBtn">&#128218; Lihat Jawaban</button>';
    }
  }
  return (
    '<div class="input-row" style="margin-bottom:var(--space-3);">' +
    '<input type="text" inputmode="numeric" id="analisisInput" class="input-text" ' +
    'value="' +
    esc(ex.userInput || '') +
    '" ' +
    (inputDisabled ? 'disabled ' : '') +
    'placeholder="Masukkan jawaban…" aria-label="Jawaban" />' +
    '<button type="button" class="btn btn--primary" id="analisisCheckBtn" ' +
    (inputDisabled ? 'disabled' : '') +
    '>Periksa</button>' +
    '</div>' +
    (feedbackHTML ? feedbackHTML : '<div id="analisisFeedback"></div>') +
    (hintHTML
      ? '<div class="btn-group" style="margin-top:var(--space-3);">' + hintHTML + '</div>'
      : '')
  );
}

function buildAnalisisChoice(soal, ex) {
  var feedbackHTML = '';
  if (ex.checked) {
    if (ex.correct) {
      feedbackHTML = buildFeedbackBox('success', '&#10003;', soal.explanation);
    } else {
      feedbackHTML = buildFeedbackBox(
        'error',
        '&#10007;',
        'Belum tepat. ' +
          soal.hint +
          '<br><button type="button" class="btn btn--ghost btn--small" id="analisisTryAgainBtn" style="margin-top:var(--space-2);">Coba Lagi</button>'
      );
    }
  }
  var optionsHTML = soal.options
    .map(function (opt) {
      var selected = ex.chosen === opt.id;
      var cls = 'choice-btn' + (selected ? ' is-selected' : '');
      var disabled = ex.checked && ex.correct ? 'disabled' : '';
      return (
        '<button type="button" class="' +
        cls +
        '" data-opt="' +
        opt.id +
        '" ' +
        disabled +
        '>' +
        esc(opt.label) +
        '</button>'
      );
    })
    .join('');
  return (
    '<div class="choice-group" style="margin-bottom:var(--space-3);">' +
    optionsHTML +
    '</div>' +
    (ex.chosen && !ex.correct
      ? '<button type="button" class="btn btn--primary" id="analisisCheckChoiceBtn">Periksa</button>'
      : '') +
    (feedbackHTML ? '<div style="margin-top:var(--space-3);">' + feedbackHTML + '</div>' : '')
  );
}

function attachAnalisisListeners(container, idx, soal) {
  var ex = State.analisisExercises[idx];

  /* input type */
  var checkBtn = document.getElementById('analisisCheckBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      handleAnalisisCheck(container, idx);
    });
    var inp = document.getElementById('analisisInput');
    if (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleAnalisisCheck(container, idx);
      });
      if (!checkBtn.disabled) inp.focus();
    }
  }
  var hintBtn = document.getElementById('analisisHintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      var fb = document.getElementById('analisisFeedback');
      var level = ex.hintLevel;
      if (level < soal.hints.length) {
        if (fb) fb.innerHTML = buildFeedbackBox('info', '&#128161;', esc(soal.hints[level]));
        State.analisisExercises[idx].hintLevel = level + 1;
        saveState();
        renderAnalisisAnggaran(container);
      }
    });
  }
  var revealBtn = document.getElementById('analisisRevealBtn');
  if (revealBtn) {
    revealBtn.addEventListener('click', function () {
      State.analisisExercises[idx].revealed = true;
      saveState();
      renderAnalisisAnggaran(container);
    });
  }

  /* choice type */
  container.querySelectorAll('[data-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (ex.correct) return;
      State.analisisExercises[idx].chosen = btn.dataset.opt;
      State.analisisExercises[idx].checked = false;
      saveState();
      renderAnalisisAnggaran(container);
    });
  });
  var checkChoiceBtn = document.getElementById('analisisCheckChoiceBtn');
  if (checkChoiceBtn) {
    checkChoiceBtn.addEventListener('click', function () {
      var e = State.analisisExercises[idx];
      e.checked = true;
      e.attempts++;
      e.correct = e.chosen === soal.correct;
      saveState();
      renderAnalisisAnggaran(container);
    });
  }
  var tryAgainBtn = document.getElementById('analisisTryAgainBtn');
  if (tryAgainBtn) {
    tryAgainBtn.addEventListener('click', function () {
      State.analisisExercises[idx].checked = false;
      saveState();
      renderAnalisisAnggaran(container);
    });
  }
}

function handleAnalisisCheck(container, idx) {
  var inp = document.getElementById('analisisInput');
  var fb = document.getElementById('analisisFeedback');
  var soal = DATA.analisisAnggaran.soal[idx];
  var ex = State.analisisExercises[idx];
  if (!inp) return;
  var val = inp.value;
  ex.userInput = val;
  var parsed = parseInputInt(val);
  if (parsed.error === 'empty') {
    if (fb)
      fb.innerHTML = buildFeedbackBox('error', '&#9888;', 'Masukkan jawaban terlebih dahulu.');
    return;
  }
  if (parsed.error === 'invalid') {
    if (fb)
      fb.innerHTML = buildFeedbackBox(
        'error',
        '&#9888;',
        'Ketik angka saja. Contoh: <strong>20000</strong>.'
      );
    return;
  }
  ex.attempts++;
  if (parsed.value === soal.answer) {
    ex.correct = true;
  }
  saveState();
  renderAnalisisAnggaran(container);
}

/* ============================================================
   10. STAGE: FINALISASI RANCANGAN
   ============================================================ */

function calcFinalisasiTotals() {
  var grand = 0;
  State.finalisasiItems.forEach(function (item) {
    var q = parseInputInt(item.qty);
    var h = parseInputInt(item.harga);
    var t =
      q.error === null && h.error === null && q.value > 0 && h.value > 0 ? q.value * h.value : 0;
    item.total = t;
    grand += t;
  });
  return grand;
}

function renderFinalisasiRancangan(container) {
  var kata = DATA.finalisasiRancangan;
  var grand = calcFinalisasiTotals();
  var batas = kata.batas;
  var pct = Math.min(Math.round((grand / batas) * 100), 100);
  var sisa = batas - grand;
  var overBudget = grand > batas;

  var barClass = overBudget ? 'budget-bar__fill--over' : pct > 85 ? 'budget-bar__fill--warn' : '';
  var sisaClass = overBudget
    ? 'budget-bar-labels__remaining--over'
    : 'budget-bar-labels__remaining';
  var sisaText = overBudget
    ? '&#9888; Melebihi anggaran ' + formatRupiah(grand - batas)
    : 'Sisa ' + formatRupiah(sisa);

  var rowsHTML = kata.kategori
    .map(function (kat, i) {
      var item = State.finalisasiItems[i];
      var totalText = item.total > 0 ? formatRupiah(item.total) : '—';
      var totalCls = item.total > 0 ? 'total-cell total-cell--active' : 'total-cell';
      return (
        '<tr data-row="' +
        i +
        '">' +
        '<td class="cat-cell">' +
        kat.icon +
        ' ' +
        esc(kat.nama) +
        '<span class="cat-cell__hint">' +
        esc(kat.hint_contoh) +
        '</span></td>' +
        '<td class="input-cell">' +
        '<input type="text" inputmode="numeric" class="budget-input qty-input" ' +
        'data-row="' +
        i +
        '" value="' +
        esc(item.qty) +
        '" ' +
        (State.finalisasiDone ? 'disabled ' : '') +
        'placeholder="Jml" aria-label="Jumlah ' +
        esc(kat.nama) +
        '" />' +
        '</td>' +
        '<td class="input-cell">' +
        '<input type="text" inputmode="numeric" class="budget-input harga-input" ' +
        'data-row="' +
        i +
        '" value="' +
        esc(item.harga) +
        '" ' +
        (State.finalisasiDone ? 'disabled ' : '') +
        'placeholder="Harga" aria-label="Harga satuan ' +
        esc(kat.nama) +
        '" />' +
        '</td>' +
        '<td class="' +
        totalCls +
        '">' +
        totalText +
        '</td>' +
        '</tr>'
      );
    })
    .join('');

  var confirmHTML = '';
  if (!State.finalisasiDone) {
    var allFilled = State.finalisasiItems.every(function (item) {
      var q = parseInputInt(item.qty);
      var h = parseInputInt(item.harga);
      return q.error === null && h.error === null && q.value > 0 && h.value > 0;
    });
    confirmHTML =
      '<div class="btn-group" style="margin-top:var(--space-4);">' +
      '<button type="button" class="btn btn--primary" id="konfirmasiBtn" ' +
      (allFilled && !overBudget ? '' : 'disabled') +
      '>&#10003; Konfirmasi Rancangan Anggaran</button>' +
      '</div>';
    if (overBudget) {
      confirmHTML +=
        '<p style="font-size:0.85rem;color:var(--color-error-strong);margin-top:var(--space-2);">Kurangi anggaran agar tidak melebihi Rp 600.000.</p>';
    } else if (!allFilled) {
      confirmHTML +=
        '<p style="font-size:0.85rem;color:var(--color-ink-muted);margin-top:var(--space-2);">Isi semua kolom terlebih dahulu.</p>';
    }
  } else {
    confirmHTML = buildFeedbackBox(
      'success',
      '&#127775;',
      '<strong>Rancangan anggaran telah dikonfirmasi!</strong> Total anggaran: <strong>' +
        formatRupiah(grand) +
        '</strong> dari batas Rp 600.000.' +
        '<div class="btn-group" style="margin-top:var(--space-3);">' +
        '<button type="button" class="btn btn--primary" id="lanjutPresentasiBtn">Lanjut ke Presentasi →</button>' +
        '</div>'
    );
  }

  container.innerHTML =
    '<section aria-label="Finalisasi Rancangan">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 5 — FINALISASI RANCANGAN</span>' +
    '<p class="stage-head__goal">Tujuan: Menyusun rancangan anggaran sendiri menggunakan seluruh operasi aritmatika.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);">' +
    esc(kata.instruction) +
    '</p>' +
    '<div class="panel panel--info" style="margin-bottom:var(--space-4);">' +
    '<div style="display:flex;gap:var(--space-3);align-items:center;flex-wrap:wrap;">' +
    '<span style="font-size:1.5rem;">&#128176;</span>' +
    '<div>' +
    '<strong>Batas anggaran: ' +
    formatRupiah(batas) +
    '</strong><br>' +
    '<span style="font-size:0.85rem;color:var(--color-ink-muted);">Isi jumlah item dan harga satuan. Total dihitung otomatis = jumlah × harga.</span>' +
    '</div></div></div>' +
    '<div class="budget-table-wrap">' +
    '<table class="budget-table" aria-label="Tabel rancangan anggaran">' +
    '<thead><tr>' +
    '<th>Kategori</th><th>Jumlah</th><th>Harga Satuan (Rp)</th><th>Total (Rp)</th>' +
    '</tr></thead>' +
    '<tbody>' +
    rowsHTML +
    '</tbody>' +
    '<tfoot><tr>' +
    '<td class="grand-total-label" colspan="3">&#931; Total Anggaran</td>' +
    '<td class="grand-total-val" id="grandTotalCell">' +
    (grand > 0 ? formatRupiah(grand) : '—') +
    '</td>' +
    '</tr></tfoot>' +
    '</table></div>' +
    '<div class="budget-bar-wrap">' +
    '<div class="budget-bar-labels">' +
    '<span class="budget-bar-labels__used">Terpakai: ' +
    formatRupiah(grand) +
    ' (' +
    pct +
    '%)</span>' +
    '<span class="' +
    sisaClass +
    '">' +
    sisaText +
    '</span>' +
    '</div>' +
    '<div class="budget-bar" aria-label="Penggunaan anggaran" role="progressbar" ' +
    'aria-valuenow="' +
    pct +
    '" aria-valuemin="0" aria-valuemax="100">' +
    '<div class="budget-bar__fill ' +
    barClass +
    '" id="budgetBarFill" style="width:' +
    pct +
    '%"></div>' +
    '</div></div>' +
    confirmHTML +
    '</div></section>';

  /* live calculation listeners */
  if (!State.finalisasiDone) {
    container.querySelectorAll('.qty-input, .harga-input').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var rowIdx = parseInt(inp.dataset.row, 10);
        if (inp.classList.contains('qty-input')) {
          State.finalisasiItems[rowIdx].qty = inp.value;
        } else {
          State.finalisasiItems[rowIdx].harga = inp.value;
        }
        saveState();
        updateFinalisasiLive(container);
      });
    });
  }

  var konfBtn = document.getElementById('konfirmasiBtn');
  if (konfBtn) {
    konfBtn.addEventListener('click', function () {
      calcFinalisasiTotals();
      State.finalisasiDone = true;
      completeStage('finalisasiRancangan');
      saveState();
      renderFinalisasiRancangan(container);
    });
  }

  var lanjutBtn = document.getElementById('lanjutPresentasiBtn');
  if (lanjutBtn) {
    lanjutBtn.addEventListener('click', function () {
      navigateTo('presentasiRancangan');
    });
  }
}

function updateFinalisasiLive(container) {
  var grand = calcFinalisasiTotals();
  var batas = DATA.finalisasiRancangan.batas;
  var pct = Math.min(Math.round((grand / batas) * 100), 100);
  var sisa = batas - grand;
  var overBudget = grand > batas;

  /* update row totals */
  State.finalisasiItems.forEach(function (item, i) {
    var row = container.querySelector('[data-row="' + i + '"]');
    if (!row) return;
    var cell = row.querySelector('.total-cell');
    if (cell) {
      cell.textContent = item.total > 0 ? formatRupiah(item.total) : '—';
      cell.className = item.total > 0 ? 'total-cell total-cell--active' : 'total-cell';
    }
  });

  /* update grand total */
  var grandCell = document.getElementById('grandTotalCell');
  if (grandCell) grandCell.textContent = grand > 0 ? formatRupiah(grand) : '—';

  /* update bar */
  var fill = document.getElementById('budgetBarFill');
  if (fill) {
    fill.style.width = pct + '%';
    fill.className =
      'budget-bar__fill' +
      (overBudget ? ' budget-bar__fill--over' : pct > 85 ? ' budget-bar__fill--warn' : '');
  }

  /* update labels */
  var labelsWrap = container.querySelector('.budget-bar-labels');
  if (labelsWrap) {
    var usedEl = labelsWrap.querySelector('.budget-bar-labels__used');
    var remainEl = labelsWrap.querySelector(
      '.budget-bar-labels__remaining, .budget-bar-labels__remaining--over'
    );
    if (usedEl) usedEl.textContent = 'Terpakai: ' + formatRupiah(grand) + ' (' + pct + '%)';
    if (remainEl) {
      remainEl.className = overBudget
        ? 'budget-bar-labels__remaining--over'
        : 'budget-bar-labels__remaining';
      remainEl.innerHTML = overBudget
        ? '&#9888; Melebihi anggaran ' + formatRupiah(grand - batas)
        : 'Sisa ' + formatRupiah(sisa);
    }
  }

  /* update confirm button */
  var konfBtn = document.getElementById('konfirmasiBtn');
  if (konfBtn) {
    var allFilled = State.finalisasiItems.every(function (item) {
      var q = parseInputInt(item.qty);
      var h = parseInputInt(item.harga);
      return q.error === null && h.error === null && q.value > 0 && h.value > 0;
    });
    konfBtn.disabled = !allFilled || overBudget;
  }
}

/* ============================================================
   11. STAGE: PRESENTASI RANCANGAN
   ============================================================ */

function renderPresentasiRancangan(container) {
  var kata = DATA.presentasiRancangan;

  /* compute from state */
  var grand = calcFinalisasiTotals();
  var konsumsiTotal =
    State.finalisasiItems && State.finalisasiItems[1] ? State.finalisasiItems[1].total || 0 : 0;

  var pctExpected = Math.round((grand / DATA.finalisasiRancangan.batas) * 100);
  var iuranExpected = Math.round(konsumsiTotal / 35);

  /* budget summary */
  var summaryRowsHTML = DATA.finalisasiRancangan.kategori
    .map(function (kat, i) {
      var item = State.finalisasiItems
        ? State.finalisasiItems[i]
        : { qty: '—', harga: '—', total: 0 };
      return (
        '<div class="budget-summary__row">' +
        '<span class="budget-summary__cat">' +
        kat.icon +
        ' ' +
        esc(kat.nama) +
        '</span>' +
        '<span class="budget-summary__detail">' +
        esc(item.qty) +
        ' × ' +
        formatRupiah(item.harga || 0) +
        '</span>' +
        '<span class="budget-summary__subtotal">' +
        formatRupiah(item.total || 0) +
        '</span>' +
        '</div>'
      );
    })
    .join('');

  /* narasi char count */
  var narasiLen = State.presentasiNarasi.length;
  var narasiOk = narasiLen >= 30;

  /* soal 1 — persen */
  var ans1 = State.presentasiAnswers[0];
  var soal1FB = '';
  if (ans1.done) {
    soal1FB = buildFeedbackBox(
      'success',
      '&#10003;',
      'Benar! ' + formatRupiah(grand) + ' ÷ 600.000 × 100 = <strong>' + pctExpected + '%</strong>'
    );
  } else if (ans1.input) {
    var p = parseInputInt(ans1.input);
    if (p.error === null && Math.abs(p.value - pctExpected) <= 1) {
      soal1FB = '';
    }
  }

  /* soal 2 — iuran */
  var ans2 = State.presentasiAnswers[1];
  var soal2FB = '';
  if (ans2.done) {
    soal2FB = buildFeedbackBox(
      'success',
      '&#10003;',
      'Benar! ' +
        formatRupiah(konsumsiTotal) +
        ' ÷ 35 ≈ <strong>' +
        formatRupiah(iuranExpected) +
        '</strong> per siswa'
    );
  }

  /* refleksi char count */
  var refleksiLen = State.presentasiRefleksi.length;
  var refleksiOk = refleksiLen >= 30;

  var canComplete = narasiOk && ans1.done && ans2.done && refleksiOk;

  container.innerHTML =
    '<section aria-label="Presentasi Rancangan">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 6 — PRESENTASI RANCANGAN</span>' +
    '<p class="stage-head__goal">Tujuan: Mempresentasikan dan mempertanggungjawabkan rancangan anggaran secara matematis.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);">' +
    esc(kata.instruction) +
    '</p>' +
    /* summary */
    '<div class="budget-summary">' +
    '<div class="budget-summary__header">' +
    '<h4 class="budget-summary__title">&#128203; Ringkasan Anggaranmu</h4>' +
    '<span class="budget-summary__total">' +
    formatRupiah(grand) +
    '</span>' +
    '</div>' +
    summaryRowsHTML +
    '</div>' +
    /* narasi */
    '<div class="field-group" style="margin-top:var(--space-5);">' +
    '<label for="narasiInput" style="font-size:1rem;"><strong>Tuliskan justifikasi rancangan anggaranmu:</strong></label>' +
    '<p style="font-size:0.85rem;color:var(--color-ink-muted);margin-bottom:var(--space-2);">' +
    esc(kata.instruction) +
    '</p>' +
    '<textarea id="narasiInput" class="narasi-field" ' +
    'placeholder="' +
    esc(kata.narasi_placeholder) +
    '" ' +
    'aria-label="Narasi justifikasi anggaran">' +
    esc(State.presentasiNarasi) +
    '</textarea>' +
    '<div class="char-count' +
    (narasiOk ? ' char-count--ok' : '') +
    '" id="narasiCount">' +
    narasiLen +
    ' karakter' +
    (narasiOk ? ' &#10003;' : ' (minimal 30 karakter)') +
    '</div>' +
    '</div>' +
    /* soal 1 */
    '<div class="panel panel--compact" style="margin-top:var(--space-4);">' +
    '<h4>' +
    kata.soal[0].label +
    '</h4>' +
    '<p>' +
    kata.soal[0].question +
    '</p>' +
    '<p style="font-size:0.82rem;color:var(--color-ink-muted);">Batas anggaran: Rp 600.000 | Anggaranmu: ' +
    formatRupiah(grand) +
    '</p>' +
    '<div class="input-row" style="margin:var(--space-3) 0;">' +
    '<input type="text" inputmode="numeric" id="persen1Input" class="input-text" ' +
    'value="' +
    esc(ans1.input) +
    '" ' +
    (ans1.done ? 'disabled ' : '') +
    'placeholder="Masukkan % (contoh: 90)" aria-label="Jawaban persentase" />' +
    '<button type="button" class="btn btn--primary" id="persen1CheckBtn" ' +
    (ans1.done ? 'disabled' : '') +
    '>Periksa</button>' +
    '</div>' +
    (soal1FB || '<div id="persen1Feedback"></div>') +
    '<p style="font-size:0.82rem;color:var(--color-ink-muted);margin-top:var(--space-2);">&#128161; ' +
    esc(kata.soal[0].hint) +
    '</p>' +
    '</div>' +
    /* soal 2 */
    '<div class="panel panel--compact" style="margin-top:var(--space-3);">' +
    '<h4>' +
    kata.soal[1].label +
    '</h4>' +
    '<p>' +
    kata.soal[1].question +
    '</p>' +
    '<p style="font-size:0.82rem;color:var(--color-ink-muted);">Anggaran konsumsimu: ' +
    formatRupiah(konsumsiTotal) +
    '</p>' +
    '<div class="input-row" style="margin:var(--space-3) 0;">' +
    '<input type="text" inputmode="numeric" id="iuran2Input" class="input-text" ' +
    'value="' +
    esc(ans2.input) +
    '" ' +
    (ans2.done ? 'disabled ' : '') +
    'placeholder="Iuran per siswa (Rp)" aria-label="Jawaban iuran per siswa" />' +
    '<button type="button" class="btn btn--primary" id="iuran2CheckBtn" ' +
    (ans2.done ? 'disabled' : '') +
    '>Periksa</button>' +
    '</div>' +
    (soal2FB || '<div id="iuran2Feedback"></div>') +
    '<p style="font-size:0.82rem;color:var(--color-ink-muted);margin-top:var(--space-2);">&#128161; ' +
    esc(kata.soal[1].hint) +
    '</p>' +
    '</div>' +
    /* refleksi rasional */
    '<div class="field-group" style="margin-top:var(--space-4);">' +
    '<label for="refleksiRasionalInput" style="font-weight:700;">Apakah anggaranmu rasional? Tuliskan minimal 2 alasan!</label>' +
    '<textarea id="refleksiRasionalInput" class="narasi-field" style="min-height:100px;" ' +
    'placeholder="' +
    esc(kata.refleksi_placeholder) +
    '" ' +
    'aria-label="Refleksi rasionalitas anggaran">' +
    esc(State.presentasiRefleksi) +
    '</textarea>' +
    '<div class="char-count' +
    (refleksiOk ? ' char-count--ok' : '') +
    '" id="refleksiCount">' +
    refleksiLen +
    ' karakter' +
    (refleksiOk ? ' &#10003;' : ' (minimal 30 karakter)') +
    '</div>' +
    '</div>' +
    '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
    '<button type="button" class="btn btn--primary btn--large" id="presentasiLanjutBtn" ' +
    (canComplete ? '' : 'disabled') +
    '>Selesai Presentasi →</button>' +
    '</div>' +
    '</div></section>';

  /* narasi listener */
  var narasiInp = document.getElementById('narasiInput');
  if (narasiInp) {
    narasiInp.addEventListener('input', function () {
      State.presentasiNarasi = narasiInp.value;
      saveState();
      var cnt = document.getElementById('narasiCount');
      var len = narasiInp.value.length;
      var ok = len >= 30;
      if (cnt) {
        cnt.className = 'char-count' + (ok ? ' char-count--ok' : '');
        cnt.innerHTML = len + ' karakter' + (ok ? ' &#10003;' : ' (minimal 30 karakter)');
      }
      var lanjutBtn2 = document.getElementById('presentasiLanjutBtn');
      if (lanjutBtn2) {
        lanjutBtn2.disabled = !(
          ok &&
          State.presentasiAnswers[0].done &&
          State.presentasiAnswers[1].done &&
          State.presentasiRefleksi.length >= 30
        );
      }
    });
  }

  /* refleksi rasional listener */
  var reflInp = document.getElementById('refleksiRasionalInput');
  if (reflInp) {
    reflInp.addEventListener('input', function () {
      State.presentasiRefleksi = reflInp.value;
      saveState();
      var cnt = document.getElementById('refleksiCount');
      var len = reflInp.value.length;
      var ok = len >= 30;
      if (cnt) {
        cnt.className = 'char-count' + (ok ? ' char-count--ok' : '');
        cnt.innerHTML = len + ' karakter' + (ok ? ' &#10003;' : ' (minimal 30 karakter)');
      }
      var lanjutBtn2 = document.getElementById('presentasiLanjutBtn');
      if (lanjutBtn2) {
        lanjutBtn2.disabled = !(
          State.presentasiNarasi.length >= 30 &&
          State.presentasiAnswers[0].done &&
          State.presentasiAnswers[1].done &&
          ok
        );
      }
    });
  }

  /* soal 1 check */
  var p1Btn = document.getElementById('persen1CheckBtn');
  if (p1Btn) {
    p1Btn.addEventListener('click', function () {
      var inp2 = document.getElementById('persen1Input');
      var fb = document.getElementById('persen1Feedback');
      if (!inp2) return;
      State.presentasiAnswers[0].input = inp2.value;
      var parsed = parseInputInt(inp2.value);
      if (parsed.error === 'empty') {
        if (fb)
          fb.innerHTML = buildFeedbackBox('error', '&#9888;', 'Masukkan jawaban terlebih dahulu.');
        return;
      }
      if (parsed.error === 'invalid' || Math.abs(parsed.value - pctExpected) > 1) {
        if (fb)
          fb.innerHTML = buildFeedbackBox(
            'error',
            '&#10007;',
            'Belum tepat. Rumus: (' + formatRupiah(grand) + ' ÷ 600.000) × 100 = ?'
          );
        return;
      }
      State.presentasiAnswers[0].done = true;
      saveState();
      renderPresentasiRancangan(container);
    });
    var p1Inp = document.getElementById('persen1Input');
    if (p1Inp)
      p1Inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') p1Btn.click();
      });
  }

  /* soal 2 check */
  var p2Btn = document.getElementById('iuran2CheckBtn');
  if (p2Btn) {
    p2Btn.addEventListener('click', function () {
      var inp3 = document.getElementById('iuran2Input');
      var fb2 = document.getElementById('iuran2Feedback');
      if (!inp3) return;
      State.presentasiAnswers[1].input = inp3.value;
      var parsed2 = parseInputInt(inp3.value);
      if (parsed2.error === 'empty') {
        if (fb2)
          fb2.innerHTML = buildFeedbackBox('error', '&#9888;', 'Masukkan jawaban terlebih dahulu.');
        return;
      }
      if (parsed2.error === 'invalid' || Math.abs(parsed2.value - iuranExpected) > 500) {
        if (fb2)
          fb2.innerHTML = buildFeedbackBox(
            'error',
            '&#10007;',
            'Belum tepat. ' + formatRupiah(konsumsiTotal) + ' ÷ 35 ≈ ' + formatRupiah(iuranExpected)
          );
        return;
      }
      State.presentasiAnswers[1].done = true;
      saveState();
      renderPresentasiRancangan(container);
    });
    var p2Inp = document.getElementById('iuran2Input');
    if (p2Inp)
      p2Inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') p2Btn.click();
      });
  }

  /* lanjut button */
  var lanjutBtn = document.getElementById('presentasiLanjutBtn');
  if (lanjutBtn) {
    lanjutBtn.addEventListener('click', function () {
      State.presentasiDone = true;
      completeStage('presentasiRancangan');
      saveState();
      navigateTo('refleksi');
    });
  }
}

/* ============================================================
   12. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var reflData = DATA.refleksi;
  var answers = State.refleksiAnswers;

  var soalHTML = reflData.soal
    .map(function (s, i) {
      var val = answers[s.id] || '';
      return (
        '<div class="panel panel--compact" style="margin-bottom:var(--space-3);">' +
        '<label for="refl_' +
        s.id +
        '" style="display:block;font-weight:600;margin-bottom:var(--space-2);">' +
        (i + 1) +
        '. ' +
        s.question +
        '</label>' +
        '<textarea id="refl_' +
        s.id +
        '" class="narasi-field" style="min-height:90px;" ' +
        'placeholder="' +
        esc(s.placeholder) +
        '" ' +
        'data-ref-id="' +
        s.id +
        '" ' +
        'aria-label="Jawaban pertanyaan refleksi ' +
        (i + 1) +
        '">' +
        esc(val) +
        '</textarea>' +
        '</div>'
      );
    })
    .join('');

  var allFilled = reflData.soal.every(function (s) {
    return (answers[s.id] || '').length >= 10;
  });

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 7 — REFLEKSI</span>' +
    '<p class="stage-head__goal">Tujuan: Merangkum dan mengevaluasi pemahaman tentang penggunaan aritmatika dalam menyusun anggaran.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);" ' +
    'id="reflNote">' +
    reflData.note +
    '</p>' +
    soalHTML +
    (State.refleksiSaved
      ? buildFeedbackBox(
          'success',
          '&#128218;',
          'Refleksi tersimpan! Klik "Selesai" untuk menyelesaikan pembelajaran.'
        )
      : '<div id="refleksiFeedback"></div>') +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-4);">' +
    '<button type="button" class="btn btn--ghost" id="refleksiSimpanBtn" ' +
    (allFilled ? '' : 'disabled') +
    '>&#128190; Simpan Refleksi</button>' +
    '<button type="button" class="btn btn--primary" id="refleksiSelesaiBtn" ' +
    (State.refleksiSaved ? '' : 'disabled') +
    '>Selesai →</button>' +
    '</div></div></section>';

  /* textarea listeners */
  container.querySelectorAll('textarea[data-ref-id]').forEach(function (ta) {
    ta.addEventListener('input', function () {
      State.refleksiAnswers[ta.dataset.refId] = ta.value;
      saveState();
      var simpanBtn = document.getElementById('refleksiSimpanBtn');
      if (simpanBtn) {
        var a = State.refleksiAnswers;
        simpanBtn.disabled = !reflData.soal.every(function (s) {
          return (a[s.id] || '').length >= 10;
        });
      }
    });
  });

  var simpanBtn = document.getElementById('refleksiSimpanBtn');
  if (simpanBtn) {
    simpanBtn.addEventListener('click', function () {
      State.refleksiSaved = true;
      saveState();
      renderRefleksi(container);
    });
  }

  var selesaiBtn = document.getElementById('refleksiSelesaiBtn');
  if (selesaiBtn) {
    selesaiBtn.addEventListener('click', function () {
      completeStage('refleksi');
      navigateTo('selesai');
    });
  }
}

/* ============================================================
   13. STAGE: SELESAI
   ============================================================ */

function renderSelesai(container) {
  var grand = calcFinalisasiTotals();
  var sisa = DATA.finalisasiRancangan.batas - grand;

  var summaryRowsHTML = DATA.finalisasiRancangan.kategori
    .map(function (kat, i) {
      var item = State.finalisasiItems ? State.finalisasiItems[i] : { total: 0 };
      var pctCat = grand > 0 ? Math.round((item.total / grand) * 100) : 0;
      return (
        '<div class="budget-summary__row">' +
        '<span class="budget-summary__cat">' +
        kat.icon +
        ' ' +
        esc(kat.nama) +
        '</span>' +
        '<span class="budget-summary__detail">' +
        pctCat +
        '% dari total</span>' +
        '<span class="budget-summary__subtotal">' +
        formatRupiah(item.total || 0) +
        '</span>' +
        '</div>'
      );
    })
    .join('');

  var operasiList = [
    { icon: '&#10133;', label: 'Penjumlahan', contoh: 'Total belanja semua pos' },
    { icon: '&#10134;', label: 'Pengurangan', contoh: 'Sisa anggaran setelah belanja' },
    { icon: '&#10005;', label: 'Perkalian', contoh: 'Jumlah item × harga satuan' },
    { icon: '&#247;', label: 'Pembagian', contoh: 'Biaya per orang, per kelompok' },
    { icon: '&#189;', label: 'Pecahan', contoh: '1/4 anggaran untuk konsumsi' },
    { icon: '&#128200;', label: 'Desimal', contoh: 'Diskon 12,5%, harga Rp 28.500' },
  ];

  var opsHTML = operasiList
    .map(function (op) {
      return (
        '<div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) 0;' +
        'border-bottom:1px dashed var(--color-border);">' +
        '<span style="font-size:1.2rem;min-width:24px;text-align:center;">' +
        op.icon +
        '</span>' +
        '<div><strong style="font-size:0.9rem;">' +
        esc(op.label) +
        '</strong>' +
        '<div style="font-size:0.8rem;color:var(--color-ink-muted);">' +
        esc(op.contoh) +
        '</div></div>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="celebration-banner">' +
    '<span class="celebration-banner__emoji">&#127881;</span>' +
    '<h2 class="celebration-banner__title">Rancangan Anggaranmu Selesai!</h2>' +
    '<p class="celebration-banner__sub">' +
    'Kamu telah berhasil menyusun dan mempresentasikan rancangan anggaran belanja yang rasional ' +
    'menggunakan seluruh operasi aritmatika.' +
    '</p></div>' +
    '<div class="panel">' +
    '<h3>&#128203; Ringkasan Rancangan Anggaranmu</h3>' +
    '<div class="budget-summary">' +
    '<div class="budget-summary__header">' +
    '<h4 class="budget-summary__title">Pentas Seni Kelas 8B</h4>' +
    '<span class="budget-summary__total">' +
    formatRupiah(grand) +
    '</span>' +
    '</div>' +
    summaryRowsHTML +
    '<div class="budget-summary__row" style="background:var(--color-success-soft);">' +
    '<span class="budget-summary__cat" style="color:var(--color-success-strong);">&#10003; Sisa Anggaran</span>' +
    '<span></span>' +
    '<span class="budget-summary__subtotal" style="color:var(--color-success-strong);">' +
    formatRupiah(sisa) +
    '</span>' +
    '</div></div>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>&#9997; Operasi Aritmatika yang Kamu Gunakan</h3>' +
    opsHTML +
    '</div>' +
    '<div class="panel panel--info">' +
    '<h3>&#127919; Tujuan Pembelajaran Tercapai</h3>' +
    '<p>' +
    esc(DATA.meta.goal) +
    '</p>' +
    '</div>' +
    '<div class="btn-group btn-group--center" style="margin-top:var(--space-5);">' +
    '<button type="button" class="btn btn--ghost" id="ulangBtn">&#128260; Mulai Ulang</button>' +
    '<a href="../../index.html" class="btn btn--primary">&#127968; Kembali ke Beranda</a>' +
    '</div></section>';

  completeStage('selesai');

  document.getElementById('ulangBtn').addEventListener('click', function () {
    if (confirm('Mulai ulang dari awal? Progress akan dihapus.')) {
      clearState();
      navigateTo('orientasi');
    }
  });
}

/* ============================================================
   14. HELPER UI
   ============================================================ */

function buildNavRow(currentIdx, total, allDone, nextStage) {
  var prevDisabled = currentIdx === 0 ? 'disabled' : '';
  var nextDisabled = currentIdx === total - 1 ? 'disabled' : '';
  var lanjutHTML = '';
  if (allDone) {
    lanjutHTML =
      '<button type="button" class="btn btn--primary" id="lanjutNextStageBtn">Lanjut ke tahap berikutnya →</button>';
  }
  return (
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-4);">' +
    '<button type="button" class="btn btn--ghost" id="navPrevBtn" ' +
    prevDisabled +
    '>← Soal Sebelumnya</button>' +
    '<button type="button" class="btn btn--ghost" id="navNextBtn" ' +
    nextDisabled +
    '>Soal Berikutnya →</button>' +
    '</div>' +
    (lanjutHTML
      ? '<div class="btn-group btn-group--end" style="margin-top:var(--space-3);">' +
        lanjutHTML +
        '</div>'
      : '')
  );
}

function attachNavRowListeners(
  container,
  currentIdx,
  total,
  stateIdxKey,
  renderFn,
  stageId,
  nextStage
) {
  var prevBtn = document.getElementById('navPrevBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentIdx > 0) {
        State[stateIdxKey] = currentIdx - 1;
        saveState();
        renderFn(container);
      }
    });
  }
  var nextBtn = document.getElementById('navNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (currentIdx < total - 1) {
        State[stateIdxKey] = currentIdx + 1;
        saveState();
        renderFn(container);
      }
    });
  }
  var lanjutBtn = document.getElementById('lanjutNextStageBtn');
  if (lanjutBtn) {
    lanjutBtn.addEventListener('click', function () {
      completeStage(stageId);
      navigateTo(nextStage);
    });
  }
}

var noticeTimer = null;

function showNotice(msg) {
  var el = document.getElementById('appNotice');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-visible');
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(function () {
    el.classList.remove('is-visible');
  }, 3500);
}

/* ============================================================
   15. INIT
   ============================================================ */

function init() {
  loadState();
  initExerciseArrays();
  buildStageNav();
  renderCurrentStage();

  document.getElementById('resetAppBtn').addEventListener('click', function () {
    if (confirm('Reset semua progress? Rancangan anggaran yang sudah dibuat akan terhapus.')) {
      clearState();
      navigateTo('orientasi');
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
