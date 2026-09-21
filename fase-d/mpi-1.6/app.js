'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Merumuskan Solusi Transaksi Belanja
               dengan Teknik Estimasi dan Pembulatan

   Utilitas bersama (esc, parseInputInt, showNotice, buildFeedbackBox,
   mesin navigasi tahap) berada di shared/engine.js.

   Bagian:
    1. Utilitas Matematika
    2. Konstanta
    3. State & Storage
    4. Navigasi
    5. Utilitas Render
    6. Stage: Orientasi
    7. Stage: Pembulatan
    8. Stage: Estimasi
    9. Stage: Tantangan
   10. Stage: Asesmen
   11. Stage: Refleksi
   12. Stage: Selesai
   13. Helper UI
   14. Init
   ============================================================ */

/* ============================================================
   1. UTILITAS MATEMATIKA
   ============================================================ */

/**
 * Membulatkan nilai ke kelipatan unit terdekat.
 * Menggunakan aturan pembulatan sekolah: ≥ setengah unit → ke atas.
 * Aman untuk integer karena menghindari floating-point division.
 */
function roundTo(value, unit) {
  var half = unit / 2;
  var remainder = value % unit;
  if (remainder >= half) {
    return value - remainder + unit;
  }
  return value - remainder;
}

/** Format angka sebagai string rupiah: "Rp24.750" */
function formatRupiah(value) {
  return 'Rp' + formatNumber(value);
}

/**
 * Menghasilkan 4 opsi untuk soal MCQ pembulatan.
 * Selalu sertakan lower dan upper (paling relevan).
 * Tambahkan tetangga terdekat sebagai distractor.
 * Hindari nilai 0 atau negatif.
 */
function generateRoundingOptions(harga, level) {
  var lower = Math.floor(harga / level) * level;
  var upper = lower + level;
  var correct = roundTo(harga, level);

  var seen = {};
  var opts = [];

  function addOpt(v) {
    if (v > 0 && !seen[v]) {
      seen[v] = true;
      opts.push(v);
    }
  }

  /* Selalu sertakan lower (jika > 0) dan upper */
  if (lower > 0) addOpt(lower);
  addOpt(upper);

  /* Distractor: satu langkah di bawah lower, satu di atas upper */
  var below = lower - level;
  var above = upper + level;
  if (below > 0) addOpt(below);
  addOpt(above);

  /* Jika masih kurang dari 4 (karena lower = 0), tambah lebih jauh */
  if (opts.length < 4) addOpt(above + level);
  if (opts.length < 4) addOpt(above + 2 * level);

  return { options: shuffleArr(opts.slice(0, 4)), correct: correct };
}

/** Hitung deviasi absolut (rupiah) */
function deviationAmt(estimated, actual) {
  return Math.abs(estimated - actual);
}

/** Hitung deviasi persentase (dibulatkan ke bilangan bulat) */
function deviationPct(estimated, actual) {
  if (actual === 0) return 0;
  return Math.round((Math.abs(estimated - actual) / actual) * 100);
}

/** Arah deviasi: 'over' | 'under' | 'exact' */
function deviationDir(estimated, actual) {
  if (estimated > actual) return 'over';
  if (estimated < actual) return 'under';
  return 'exact';
}

/** Jumlahkan total belanja dari daftar item */
function calcTotalBelanja(items) {
  return items.reduce(function (s, it) {
    return s + it.harga;
  }, 0);
}

/** Fisher-Yates shuffle — kembalikan array baru */
function shuffleArr(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

/* ============================================================
   2. KONSTANTA
   ============================================================ */

var STAGES = ['orientasi', 'pembulatan', 'estimasi', 'tantangan', 'asesmen', 'refleksi', 'selesai'];
var STAGE_LABELS = [
  'Orientasi',
  'Pembulatan',
  'Estimasi Total',
  'Decision Challenge',
  'Asesmen',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-1-6-v1';

/* ============================================================
   3. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Pembulatan */
  pb: {
    idx: 0 /* soal ke-n yang sedang aktif (0-based) */,
    results: [] /* [{chosen, isCorrect}] satu per soal */,
  },

  /* Estimasi */
  es: {
    idx: 0 /* skenario ke-n aktif */,
    data: [] /* [{phase, strategy, itemRounded, decision}] satu per skenario */,
  },

  /* Tantangan */
  tn: {
    idx: 0 /* tantangan ke-n aktif */,
    data: [] /* [{selected: [], locked: bool}] satu per tantangan */,
  },

  /* Asesmen */
  as: {
    idx: 0 /* soal ke-n aktif */,
    answers: {} /* {questionId: {chosen, locked}} */,
  },

  /* Refleksi */
  rf: {
    answers: {} /* {questionId: string} */,
    saved: false,
  },
};

var Store = createStore({ key: STORAGE_KEY, state: State });
var saveState = Store.save;
var loadState = Store.load;

function clearState() {
  Store.reset();
  initStateArrays();
}

function initStateArrays() {
  /* Pembulatan */
  ensureExerciseArray(State.pb, 'results', DATA.pembulatan.soal, function () {
    return { chosen: null, isCorrect: false };
  });

  /* Estimasi */
  ensureExerciseArray(State.es, 'data', DATA.estimasi.scenarios, function () {
    return {
      phase: 'select-strategy' /* 'select-strategy' | 'rounding' | 'decide' | 'revealed' */,
      strategy: null /* level: 1000 | 5000 | 10000 */,
      itemRounded: {} /* {itemIdx: chosenValue} */,
      decision: null /* 'cukup' | 'tidak' */,
    };
  });

  /* Tantangan */
  ensureExerciseArray(State.tn, 'data', DATA.tantangan.challenges, function () {
    return { selected: [], locked: false };
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

function buildProgressDots(total, currentIdx, results) {
  var dots = '';
  for (var i = 0; i < total; i++) {
    var cls = 'exercise-progress__dot';
    var label = 'Soal ' + (i + 1);
    if (i === currentIdx) {
      cls += ' exercise-progress__dot--current';
      label += ' (aktif)';
    } else if (results[i] && results[i].chosen !== null) {
      if (results[i].isCorrect) {
        cls += ' exercise-progress__dot--correct';
        label += ' ✓';
      } else {
        cls += ' exercise-progress__dot--incorrect';
        label += ' ✗';
      }
    }
    dots += '<span class="' + cls + '" aria-label="' + esc(label) + '">' + (i + 1) + '</span>';
  }
  return (
    '<div class="exercise-progress" aria-label="Progress soal">' +
    dots +
    '<span class="exercise-label">Soal ' +
    (currentIdx + 1) +
    ' dari ' +
    total +
    '</span>' +
    '</div>'
  );
}

/**
 * Bangun visualisasi garis bilangan.
 * @param {number} harga - nilai yang dibulatkan
 * @param {number} level - unit pembulatan
 * @param {number} correct - nilai hasil pembulatan yang benar
 */
function buildNumberLine(harga, level, correct) {
  var lower = Math.floor(harga / level) * level;
  var upper = lower + level;
  var midpoint = lower + level / 2;
  var pct = ((harga - lower) / level) * 100;
  var isUp = correct === upper;

  /* Area fill: dari titik tengah (50%) ke posisi harga — menunjukkan arah pembulatan */
  var fillLeft, fillWidth;
  if (isUp) {
    /* Nilai di kanan tengah → bulatkan ke atas */
    fillLeft = 50;
    fillWidth = Math.max(0, pct - 50);
  } else {
    /* Nilai di kiri tengah → bulatkan ke bawah */
    fillLeft = pct;
    fillWidth = Math.max(0, 50 - pct);
  }

  var direction = isUp
    ? '↑ Dibulatkan ke <strong>atas</strong> → ' + formatRupiah(upper)
    : '↓ Dibulatkan ke <strong>bawah</strong> → ' + formatRupiah(lower);

  /* Jika harga tepat di midpoint */
  if (harga === midpoint) {
    direction = '→ Tepat di tengah: dibulatkan ke <strong>atas</strong> → ' + formatRupiah(upper);
  }

  return (
    '<div class="number-line">' +
    '<p class="number-line__title">Posisi ' +
    formatRupiah(harga) +
    ' pada garis bilangan</p>' +
    '<div class="number-line__track">' +
    '<div class="number-line__endcap number-line__endcap--left"></div>' +
    '<div class="number-line__endcap number-line__endcap--right"></div>' +
    '<div class="number-line__midline" aria-hidden="true"></div>' +
    '<div class="number-line__fill-under" style="left:' +
    fillLeft.toFixed(1) +
    '%;width:' +
    fillWidth.toFixed(1) +
    '%" aria-hidden="true"></div>' +
    '<div class="number-line__value-dot" style="left:' +
    pct.toFixed(1) +
    '%">' +
    '<span class="number-line__value-label">' +
    formatRupiah(harga) +
    '</span>' +
    '</div>' +
    '</div>' +
    '<div class="number-line__labels">' +
    '<span>' +
    formatRupiah(lower) +
    '</span>' +
    '<span style="color:var(--color-ink-muted);">tengah: ' +
    formatRupiah(midpoint) +
    '</span>' +
    '<span>' +
    formatRupiah(upper) +
    '</span>' +
    '</div>' +
    '<p class="number-line__conclusion">' +
    direction +
    '</p>' +
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
    case 'pembulatan':
      renderPembulatan(container);
      break;
    case 'estimasi':
      renderEstimasi(container);
      break;
    case 'tantangan':
      renderTantangan(container);
      break;
    case 'asesmen':
      renderAsesmen(container);
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
    '<section aria-label="Orientasi pembelajaran">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">Tahap 1 — Orientasi</span>' +
    '<p class="stage-head__goal">' +
    esc(DATA.meta.goal) +
    '</p>' +
    '</div>' +
    '<div class="panel panel--hero">' +
    '<h2>' +
    esc(DATA.meta.title) +
    '</h2>' +
    '<p style="font-size:1.05rem;line-height:1.7;">' +
    'Bayangkan kamu sedang berada di supermarket dengan uang <strong>Rp100.000</strong> di tangan. ' +
    'Keranjangmu sudah berisi beberapa barang dengan harga seperti Rp24.750, Rp8.950, dan Rp17.490. ' +
    'Sebelum sampai di kasir, dapatkah kamu memperkirakan dengan cepat apakah uangmu cukup?' +
    '</p>' +
    '<div class="panel panel--info" style="margin-bottom:0;">' +
    '<p style="margin:0;font-size:0.95rem;">' +
    'Di sinilah teknik <strong>estimasi</strong> dan <strong>pembulatan</strong> berguna: ' +
    'kamu tidak perlu menghitung persis, cukup memperkirakan dengan cerdas untuk mengambil keputusan yang tepat.' +
    '</p>' +
    '</div>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>Dalam media ini kamu akan:</h3>' +
    '<div class="hero-steps">' +
    '<div class="hero-steps__item"><span class="hero-steps__num">1</span>Berlatih membulatkan harga ke berbagai tingkat pembulatan.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">2</span>Mengestimasi total belanja dan menentukan apakah anggaran mencukupi.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">3</span>Membandingkan estimasimu dengan total sebenarnya dan menganalisis selisihnya.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">4</span>Menghadapi tantangan memilih barang yang sesuai anggaran menggunakan estimasi.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">5</span>Merefleksikan strategi estimasimu dan kapan estimasi paling berguna.</div>' +
    '</div>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>Cara menggunakan media ini</h3>' +
    '<ul style="margin:0;">' +
    '<li>Ikuti tahapan dari kiri ke kanan pada navigasi di atas.</li>' +
    '<li>Kerjakan setiap latihan dan buat keputusan <strong>sebelum</strong> melihat jawaban.</li>' +
    '<li>Baca feedback dengan teliti — bukan hanya "benar/salah", tapi <em>mengapa</em>.</li>' +
    '<li>Progressmu disimpan otomatis di browser ini.</li>' +
    '</ul>' +
    '</div>' +
    '<div class="panel panel--compact panel--warning">' +
    '<p style="margin:0;font-size:0.88rem;color:var(--color-warning-strong);">' +
    '<strong>Catatan:</strong> Hasil latihan di media ini adalah panduan belajar, bukan nilai akhir. ' +
    'Observasi guru, Simulasi Pasar Harian, dan diskusi kelompok tetap menjadi bagian utama penilaian.' +
    '</p>' +
    '</div>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary btn--large" id="startBtn">Mulai Belajar →</button>' +
    '</div>' +
    '</section>';

  document.getElementById('startBtn').addEventListener('click', function () {
    completeStage('orientasi');
    navigateTo('pembulatan');
  });
}

/* ============================================================
   7. STAGE: PEMBULATAN
   ============================================================ */

function renderPembulatan(container) {
  var soalList = DATA.pembulatan.soal;
  var idx = State.pb.idx;

  /* Jika semua soal sudah dijawab, tampilkan ringkasan */
  if (idx >= soalList.length) {
    renderPembulatanSummary(container);
    return;
  }

  var soal = soalList[idx];
  var result = State.pb.results[idx] || { chosen: null, isCorrect: false };
  var opts = generateRoundingOptions(soal.harga, soal.level);
  var isAnswered = result.chosen !== null;

  /* Simpan opsi agar urutan tidak berubah saat re-render */
  if (!State.pb._opts) State.pb._opts = {};
  if (!State.pb._opts[soal.id]) State.pb._opts[soal.id] = opts.options;
  var displayOpts = State.pb._opts[soal.id];

  container.innerHTML =
    '<section aria-label="Latihan pembulatan">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">Tahap 2 — Pembulatan</span>' +
    '<p class="stage-head__goal">' +
    esc(DATA.pembulatan.instruction) +
    '</p>' +
    '</div>' +
    buildProgressDots(soalList.length, idx, State.pb.results) +
    '<div class="panel">' +
    '<p style="font-size:0.85rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">Bulatkan harga berikut ke <strong>' +
    esc(soal.levelLabel) +
    '</strong>:</p>' +
    '<p style="font-family:var(--font-mono);font-size:2rem;font-weight:700;color:var(--color-orange-strong);margin:0 0 var(--space-4);" aria-label="Harga: ' +
    formatRupiah(soal.harga) +
    '">' +
    formatRupiah(soal.harga) +
    '</p>' +
    '<p id="pbQuestion" style="font-weight:600;margin-bottom:var(--space-2);">Pilih hasil pembulatannya:</p>' +
    '<div class="option-grid" role="group" aria-labelledby="pbQuestion">' +
    displayOpts
      .map(function (opt) {
        var cls = 'option-btn';
        if (isAnswered) {
          if (opt === soal.correct) cls += ' is-correct';
          else if (opt === result.chosen) cls += ' is-incorrect';
        }
        return (
          '<button type="button" class="' +
          cls +
          '"' +
          (isAnswered ? ' disabled' : '') +
          ' data-opt="' +
          opt +
          '"' +
          ' aria-label="' +
          formatRupiah(opt) +
          '">' +
          formatRupiah(opt) +
          '</button>'
        );
      })
      .join('') +
    '</div>' +
    (isAnswered
      ? buildFeedbackBox(
          result.isCorrect ? 'success' : 'error',
          result.isCorrect ? '✓' : '✗',
          (result.isCorrect
            ? '<strong>Tepat!</strong> ' + esc(soal.explanation)
            : '<strong>Belum tepat.</strong> Jawaban yang benar adalah <strong>' +
              formatRupiah(soal.correct) +
              '</strong>. ' +
              esc(soal.explanation)) + buildNumberLine(soal.harga, soal.level, soal.correct)
        )
      : '<details class="hint-reveal"><summary></summary>' +
        '<div class="hint-reveal__content">' +
        esc(soal.hint) +
        '</div></details>') +
    '<div class="btn-group btn-group--' +
    (idx > 0 ? 'spread' : 'end') +
    '" style="margin-top:var(--space-4);">' +
    (idx > 0
      ? '<button type="button" class="btn btn--ghost" id="pbPrevBtn">← Sebelumnya</button>'
      : '') +
    (isAnswered
      ? '<button type="button" class="btn btn--primary" id="pbNextBtn">' +
        (idx < soalList.length - 1 ? 'Lanjut →' : 'Lihat Ringkasan →') +
        '</button>'
      : '') +
    '</div>' +
    '</div>' +
    '</section>';

  /* Event handlers */
  if (!isAnswered) {
    container.querySelectorAll('.option-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var chosen = parseInt(btn.dataset.opt, 10);
        State.pb.results[idx] = { chosen: chosen, isCorrect: chosen === soal.correct };
        saveState();
        renderPembulatan(container);
      });
    });
  }

  var nextBtn = document.getElementById('pbNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      State.pb.idx = idx + 1;
      if (!State.pb._opts) State.pb._opts = {};
      saveState();
      if (State.pb.idx >= soalList.length) {
        renderPembulatanSummary(container);
      } else {
        renderPembulatan(container);
      }
    });
  }

  var prevBtn = document.getElementById('pbPrevBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (State.pb.idx > 0) {
        State.pb.idx = idx - 1;
        saveState();
        renderPembulatan(container);
      }
    });
  }
}

function renderPembulatanSummary(container) {
  var soalList = DATA.pembulatan.soal;
  var correct = State.pb.results.filter(function (r) {
    return r.isCorrect;
  }).length;
  var total = soalList.length;
  var pct = Math.round((correct / total) * 100);

  var feedbackType = correct === total ? 'success' : correct >= total * 0.75 ? 'info' : 'warning';
  var feedbackMsg =
    correct === total
      ? 'Luar biasa! Kamu menjawab semua soal dengan benar. Kamu siap menerapkan pembulatan dalam estimasi!'
      : correct >= total * 0.75
        ? 'Bagus! Sebagian besar jawaban benar. Perhatikan soal yang masih keliru sebelum melanjutkan.'
        : 'Ada beberapa soal yang perlu dipelajari lagi. Baca kembali penjelasannya di atas, kemudian lanjutkan.';

  var rows = soalList
    .map(function (soal, i) {
      var r = State.pb.results[i];
      var ok = r && r.isCorrect;
      return (
        '<tr>' +
        '<td style="padding:var(--space-2) var(--space-3);">' +
        formatRupiah(soal.harga) +
        '</td>' +
        '<td style="padding:var(--space-2) var(--space-3);color:var(--color-ink-muted);font-size:0.82rem;">' +
        esc(soal.levelLabel) +
        '</td>' +
        '<td style="padding:var(--space-2) var(--space-3);font-family:var(--font-mono);">' +
        formatRupiah(soal.correct) +
        '</td>' +
        '<td style="padding:var(--space-2) var(--space-3);text-align:center;">' +
        (ok
          ? '<span style="color:var(--color-success-strong);font-weight:700;">✓</span>'
          : '<span style="color:var(--color-error-strong);font-weight:700;">✗</span>') +
        '</td>' +
        '</tr>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Ringkasan pembulatan">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">Tahap 2 — Ringkasan Pembulatan</span>' +
    '</div>' +
    buildFeedbackBox(
      feedbackType,
      feedbackType === 'success' ? '🎉' : feedbackType === 'info' ? '👍' : '💡',
      '<strong>' +
        correct +
        ' dari ' +
        total +
        ' soal benar (' +
        pct +
        '%).</strong> ' +
        feedbackMsg
    ) +
    '<div class="panel" style="margin-top:var(--space-4);overflow-x:auto;">' +
    '<h3>Rekap Jawaban</h3>' +
    '<table style="width:100%;border-collapse:collapse;font-size:0.88rem;">' +
    '<thead><tr style="border-bottom:2px solid var(--color-border);">' +
    '<th style="text-align:left;padding:var(--space-2) var(--space-3);">Harga</th>' +
    '<th style="text-align:left;padding:var(--space-2) var(--space-3);">Dibulatkan ke</th>' +
    '<th style="text-align:left;padding:var(--space-2) var(--space-3);">Jawaban Benar</th>' +
    '<th style="text-align:center;padding:var(--space-2) var(--space-3);">Hasil</th>' +
    '</tr></thead>' +
    '<tbody>' +
    rows +
    '</tbody>' +
    '</table>' +
    '</div>' +
    '<div class="btn-group btn-group--spread">' +
    '<button type="button" class="btn btn--ghost" id="pbRetryBtn">Ulangi Latihan</button>' +
    '<button type="button" class="btn btn--primary" id="pbDoneBtn">Lanjut ke Estimasi Total →</button>' +
    '</div>' +
    '</section>';

  document.getElementById('pbDoneBtn').addEventListener('click', function () {
    completeStage('pembulatan');
    navigateTo('estimasi');
  });

  document.getElementById('pbRetryBtn').addEventListener('click', function () {
    State.pb.idx = 0;
    State.pb.results = DATA.pembulatan.soal.map(function () {
      return { chosen: null, isCorrect: false };
    });
    State.pb._opts = {};
    saveState();
    renderPembulatan(container);
  });
}

/* ============================================================
   8. STAGE: ESTIMASI
   ============================================================ */

function renderEstimasi(container) {
  var scenarios = DATA.estimasi.scenarios;
  var idx = State.es.idx;

  if (idx >= scenarios.length) {
    renderEstimasiSummary(container);
    return;
  }

  var scenario = scenarios[idx];
  var sd = State.es.data[idx];

  if (!sd) {
    sd = { phase: 'select-strategy', strategy: null, itemRounded: {}, decision: null };
    State.es.data[idx] = sd;
  }

  container.innerHTML = '<section aria-label="Estimasi total belanja"></section>';
  var sec = container.querySelector('section');

  sec.innerHTML =
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">Tahap 3 — Estimasi Total Belanja</span>' +
    '<p class="stage-head__goal">' +
    esc(DATA.meta.goal) +
    '</p>' +
    '</div>' +
    buildProgressDots(
      scenarios.length,
      idx,
      scenarios.map(function (_, i) {
        var d = State.es.data[i];
        return { chosen: d && d.phase === 'revealed' ? 'done' : null, isCorrect: true };
      })
    ) +
    '<div class="panel panel--hero" style="margin-bottom:var(--space-3);">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-3);flex-wrap:wrap;">' +
    '<div>' +
    '<p style="font-size:0.8rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:var(--color-primary);margin-bottom:4px;">' +
    esc(scenario.label) +
    '</p>' +
    '<p style="font-size:0.95rem;margin-bottom:var(--space-2);">' +
    esc(scenario.context) +
    '</p>' +
    '</div>' +
    '<div style="text-align:right;flex-shrink:0;">' +
    '<span style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:var(--color-ink-muted);">Anggaranmu</span>' +
    '<div style="font-family:var(--font-mono);font-size:1.8rem;font-weight:700;color:var(--color-primary-strong);">' +
    formatRupiah(scenario.budget) +
    '</div>' +
    '</div>' +
    '</div>' +
    /* Daftar barang */
    '<table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-top:var(--space-2);">' +
    '<thead><tr style="border-bottom:2px solid var(--color-border);">' +
    '<th style="text-align:left;padding:var(--space-2) var(--space-3);">Barang</th>' +
    '<th style="text-align:right;padding:var(--space-2) var(--space-3);">Harga</th>' +
    '</tr></thead><tbody>' +
    scenario.items
      .map(function (item) {
        return (
          '<tr style="border-bottom:1px solid var(--color-border);">' +
          '<td style="padding:var(--space-2) var(--space-3);">' +
          esc(item.nama) +
          '</td>' +
          '<td style="text-align:right;padding:var(--space-2) var(--space-3);font-family:var(--font-mono);font-weight:600;color:var(--color-orange-strong);">' +
          formatRupiah(item.harga) +
          '</td>' +
          '</tr>'
        );
      })
      .join('') +
    '<tr style="border-top:2px solid var(--color-border)">' +
    '<td style="padding:var(--space-2) var(--space-3);font-weight:700;color:var(--color-ink-muted);">Total sebenarnya</td>' +
    '<td id="actualTotalCell" style="text-align:right;padding:var(--space-2) var(--space-3);font-family:var(--font-mono);font-weight:700;">' +
    (sd.phase === 'revealed'
      ? formatRupiah(calcTotalBelanja(scenario.items))
      : '— (belum diungkap)') +
    '</td>' +
    '</tr>' +
    '</tbody></table>' +
    '</div>';

  /* Fase: pilih strategi */
  if (sd.phase === 'select-strategy') {
    renderEstimasiSelectStrategy(sec, scenario, idx);
  } else if (sd.phase === 'rounding') {
    /* Fase: pembulatan item */
    renderEstimasiRounding(sec, scenario, idx, sd);
  } else if (sd.phase === 'decide') {
    /* Fase: keputusan */
    renderEstimasiRounding(sec, scenario, idx, sd); /* tampilkan rounding + decide */
  } else if (sd.phase === 'revealed') {
    /* Fase: reveal */
    renderEstimasiReveal(sec, scenario, idx, sd);
  }
}

function renderEstimasiSelectStrategy(sec, scenario, idx) {
  var stratHtml =
    '<div class="panel panel--compact">' +
    '<h3>Pilih Strategi Pembulatan</h3>' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">Pilih tingkat pembulatan yang akan kamu gunakan untuk mengestimasi harga setiap barang.</p>' +
    '<div class="strategy-grid" role="group" aria-label="Pilih strategi pembulatan">' +
    DATA.estimasi.strategies
      .map(function (s) {
        return (
          '<button type="button" class="strategy-card" data-level="' +
          s.value +
          '"' +
          ' aria-label="' +
          esc(s.label) +
          ': ' +
          esc(s.desc) +
          '">' +
          '<div class="strategy-card__label">' +
          esc(s.label) +
          '</div>' +
          '<div class="strategy-card__desc">' +
          esc(s.desc) +
          '</div>' +
          '<span class="strategy-card__example">' +
          esc(s.example) +
          '</span>' +
          '</button>'
        );
      })
      .join('') +
    '</div>' +
    '</div>';

  var div = document.createElement('div');
  div.innerHTML = stratHtml;
  sec.appendChild(div.firstElementChild);

  sec.querySelectorAll('.strategy-card').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var level = parseInt(btn.dataset.level, 10);
      State.es.data[idx].strategy = level;
      State.es.data[idx].phase = 'rounding';
      State.es.data[idx].itemRounded = {};
      /* Bersihkan cache opsi agar digenerate ulang dengan strategi baru */
      if (!State.es._opts) State.es._opts = {};
      State.es._opts[idx] = null;
      saveState();
      renderEstimasi(sec.parentElement);
    });
  });
}

function renderEstimasiRounding(sec, scenario, idx, sd) {
  var strategy = DATA.estimasi.strategies.find(function (s) {
    return s.value === sd.strategy;
  });
  if (!strategy) return;

  /* Cache opsi MCQ agar urutan stabil */
  if (!State.es._opts) State.es._opts = {};
  if (!State.es._opts[idx]) {
    State.es._opts[idx] = scenario.items.map(function (item) {
      return generateRoundingOptions(item.harga, sd.strategy).options;
    });
  }
  var optsCache = State.es._opts[idx];

  /* Hitung total estimasi dari pilihan user */
  var totalEstimasi = 0;
  var allAnswered = true;
  scenario.items.forEach(function (item, i) {
    if (sd.itemRounded[i] !== undefined) {
      totalEstimasi += sd.itemRounded[i];
    } else {
      allAnswered = false;
    }
  });

  /* Bangun HTML rounding items */
  var itemsHtml =
    '<div class="panel panel--compact">' +
    '<div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3);">' +
    '<h3 style="margin:0;">Bulatkan Setiap Harga</h3>' +
    '<span style="background:var(--color-primary-soft);color:var(--color-primary-strong);padding:3px 10px;border-radius:99px;font-size:0.8rem;font-weight:600;">' +
    esc(strategy.label) +
    '</span>' +
    '<button type="button" class="btn btn--ghost btn--small" id="changeStrategyBtn">Ganti Strategi</button>' +
    '</div>' +
    '<div class="item-rounding-list">' +
    scenario.items
      .map(function (item, i) {
        var chosen = sd.itemRounded[i];
        var isItemAnswered = chosen !== undefined;
        var correctRounded = roundTo(item.harga, sd.strategy);
        var rowClass = 'item-rounding-row' + (isItemAnswered ? ' is-answered' : '');

        return (
          '<div class="' +
          rowClass +
          '">' +
          '<div class="item-rounding-row__header">' +
          '<span class="item-rounding-row__name">' +
          esc(item.nama) +
          '</span>' +
          '<span class="item-rounding-row__price">' +
          formatRupiah(item.harga) +
          '</span>' +
          '</div>' +
          '<div class="item-rounding-row__options" role="group" aria-label="Pilihan pembulatan ' +
          esc(item.nama) +
          '">' +
          optsCache[i]
            .map(function (opt) {
              var cls = 'option-btn';
              if (isItemAnswered) {
                if (opt === correctRounded) cls += ' is-correct';
                else if (opt === chosen) cls += ' is-incorrect';
              } else if (chosen === opt) {
                cls += ' is-selected';
              }
              return (
                '<button type="button" class="' +
                cls +
                '"' +
                (isItemAnswered ? ' disabled' : '') +
                ' data-item="' +
                i +
                '" data-opt="' +
                opt +
                '"' +
                ' style="font-size:0.88rem;"' +
                ' aria-label="' +
                formatRupiah(opt) +
                '">' +
                formatRupiah(opt) +
                '</button>'
              );
            })
            .join('') +
          '</div>' +
          (isItemAnswered
            ? '<div class="item-rounding-row__feedback is-visible ' +
              (chosen === correctRounded ? 'is-correct' : 'is-incorrect') +
              '">' +
              (chosen === correctRounded
                ? '✓ Tepat! ' +
                  formatRupiah(item.harga) +
                  ' dibulatkan ke ' +
                  formatRupiah(correctRounded)
                : '✗ Kurang tepat. ' +
                  formatRupiah(item.harga) +
                  ' seharusnya dibulatkan ke ' +
                  formatRupiah(correctRounded)) +
              '</div>'
            : '') +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    '</div>';

  var div = document.createElement('div');
  div.innerHTML = itemsHtml;
  sec.appendChild(div.firstElementChild);

  /* Total estimasi */
  var totalBox =
    '<div class="total-estimasi-box">' +
    '<div class="total-estimasi-box__label">Total Estimasimu</div>' +
    '<div class="total-estimasi-box__value" id="totalEstimasiVal">' +
    (allAnswered ? formatRupiah(totalEstimasi) : '—') +
    '</div>' +
    '<div class="total-estimasi-box__pending">' +
    (allAnswered ? 'Semua harga sudah dibulatkan.' : 'Bulatkan semua harga untuk melihat total.') +
    '</div>' +
    '</div>';

  var totalDiv = document.createElement('div');
  totalDiv.innerHTML = totalBox;
  sec.appendChild(totalDiv.firstElementChild);

  /* Keputusan anggaran — tampilkan jika semua item sudah dibulatkan */
  var decideHtml =
    '<div class="decision-panel" id="decisionPanel" ' +
    (allAnswered ? '' : 'style="opacity:0.4;pointer-events:none;"') +
    '>' +
    '<h4>Keputusan Anggaran</h4>' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">Berdasarkan estimasimu (' +
    (allAnswered ? formatRupiah(totalEstimasi) : '—') +
    '), apakah uang ' +
    formatRupiah(scenario.budget) +
    ' menurutmu cukup?</p>' +
    '<div class="decision-btns">' +
    '<button type="button" class="decision-btn decision-btn--cukup' +
    (sd.decision === 'cukup' ? ' is-selected' : '') +
    '" id="decisionCukupBtn" ' +
    (sd.phase === 'revealed' ? 'disabled' : '') +
    '>' +
    '✓ Cukup' +
    '</button>' +
    '<button type="button" class="decision-btn decision-btn--tidak' +
    (sd.decision === 'tidak' ? ' is-selected' : '') +
    '" id="decisionTidakBtn" ' +
    (sd.phase === 'revealed' ? 'disabled' : '') +
    '>' +
    '✗ Tidak Cukup' +
    '</button>' +
    '</div>' +
    '<div class="btn-group btn-group--end" style="margin-top:var(--space-3);">' +
    '<button type="button" class="btn btn--primary" id="lockDecisionBtn"' +
    (allAnswered && sd.decision ? '' : ' disabled') +
    '>Kunci Keputusan →</button>' +
    '</div>' +
    '</div>';

  var decideDiv = document.createElement('div');
  decideDiv.innerHTML = decideHtml;
  sec.appendChild(decideDiv.firstElementChild);

  /* Event handlers: pilih opsi per item */
  sec.querySelectorAll('.option-btn[data-item]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      var itemIdx = parseInt(btn.dataset.item, 10);
      var chosenVal = parseInt(btn.dataset.opt, 10);
      State.es.data[idx].itemRounded[itemIdx] = chosenVal;

      /* Cek apakah semua sudah dijawab */
      var allDone = true;
      scenario.items.forEach(function (_, i) {
        if (State.es.data[idx].itemRounded[i] === undefined) allDone = false;
      });
      if (allDone) State.es.data[idx].phase = 'decide';

      saveState();
      renderEstimasi(sec.parentElement);
    });
  });

  /* Keputusan */
  var cukupBtn = document.getElementById('decisionCukupBtn');
  var tidakBtn = document.getElementById('decisionTidakBtn');
  var lockBtn = document.getElementById('lockDecisionBtn');
  var changeBtn = document.getElementById('changeStrategyBtn');

  if (cukupBtn) {
    cukupBtn.addEventListener('click', function () {
      State.es.data[idx].decision = 'cukup';
      saveState();
      renderEstimasi(sec.parentElement);
    });
  }

  if (tidakBtn) {
    tidakBtn.addEventListener('click', function () {
      State.es.data[idx].decision = 'tidak';
      saveState();
      renderEstimasi(sec.parentElement);
    });
  }

  if (lockBtn) {
    lockBtn.addEventListener('click', function () {
      if (!lockBtn.disabled) {
        State.es.data[idx].phase = 'revealed';
        saveState();
        renderEstimasi(sec.parentElement);
      }
    });
  }

  if (changeBtn) {
    changeBtn.addEventListener('click', function () {
      State.es.data[idx].phase = 'select-strategy';
      State.es.data[idx].strategy = null;
      State.es.data[idx].itemRounded = {};
      State.es.data[idx].decision = null;
      if (State.es._opts) State.es._opts[idx] = null;
      saveState();
      renderEstimasi(sec.parentElement);
    });
  }
}

function renderEstimasiReveal(sec, scenario, idx, sd) {
  var actualTotal = calcTotalBelanja(scenario.items);
  var totalEstimasi = 0;
  var correctRoundedTotal = 0;
  scenario.items.forEach(function (item, i) {
    if (sd.itemRounded[i] !== undefined) totalEstimasi += sd.itemRounded[i];
    correctRoundedTotal += roundTo(item.harga, sd.strategy);
  });

  var devAmt = deviationAmt(totalEstimasi, actualTotal);
  var devPct = deviationPct(totalEstimasi, actualTotal);
  var dir = deviationDir(totalEstimasi, actualTotal);
  var actualOk = actualTotal <= scenario.budget;
  var estimOk = totalEstimasi <= scenario.budget;
  var decisionCorrect = (sd.decision === 'cukup') === actualOk;

  var dirLabel =
    dir === 'over' ? 'Overestimasi ↑' : dir === 'under' ? 'Underestimasi ↓' : 'Estimasi Tepat ✓';
  var dirBadgeClass =
    dir === 'over'
      ? 'deviation-badge--over'
      : dir === 'under'
        ? 'deviation-badge--under'
        : 'deviation-badge--exact';

  /* Feedback kontekstual */
  var feedbackMsg = buildEstimasiFeedback(
    scenario,
    sd,
    totalEstimasi,
    actualTotal,
    dir,
    devPct,
    decisionCorrect
  );

  /* Bangun HTML reveal */
  var revealHtml =
    '<div class="panel" id="revealPanel">' +
    '<h3>Hasil Perbandingan</h3>' +
    '<div class="comparison-grid">' +
    '<div class="comparison-card comparison-card--estimate">' +
    '<div class="comparison-card__label">Total Estimasimu</div>' +
    '<div class="comparison-card__value">' +
    formatRupiah(totalEstimasi) +
    '</div>' +
    '<div style="margin-top:var(--space-2);font-size:0.78rem;">' +
    (estimOk
      ? '<span style="color:var(--color-success-strong);">≤ Anggaran</span>'
      : '<span style="color:var(--color-error-strong);">Melebihi Anggaran</span>') +
    '</div>' +
    '</div>' +
    '<div class="comparison-card comparison-card--actual">' +
    '<div class="comparison-card__label">Total Sebenarnya</div>' +
    '<div class="comparison-card__value">' +
    formatRupiah(actualTotal) +
    '</div>' +
    '<div style="margin-top:var(--space-2);font-size:0.78rem;">' +
    (actualOk
      ? '<span style="color:var(--color-success-strong);">≤ Anggaran</span>'
      : '<span style="color:var(--color-error-strong);">Melebihi Anggaran</span>') +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="deviation-row">' +
    '<span class="deviation-row__label">Selisih</span>' +
    '<div class="deviation-row__bar-wrap">' +
    '<div class="deviation-row__bar deviation-row__bar--' +
    (devPct <= 5 ? 'good' : devPct <= 15 ? 'ok' : 'bad') +
    '" style="width:' +
    Math.min(100, devPct * 2) +
    '%"></div>' +
    '</div>' +
    '<span class="deviation-row__value">' +
    formatRupiah(devAmt) +
    ' (' +
    devPct +
    '%)</span>' +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3);">' +
    '<span class="deviation-badge ' +
    dirBadgeClass +
    '">' +
    dirLabel +
    '</span>' +
    '<span class="decision-result-badge ' +
    (decisionCorrect ? 'decision-result-badge--correct' : 'decision-result-badge--incorrect') +
    '">' +
    (decisionCorrect ? '✓ Keputusanmu Tepat' : '✗ Keputusanmu Kurang Tepat') +
    '</span>' +
    '</div>' +
    buildFeedbackBox('info', '💬', feedbackMsg) +
    '</div>';

  var revealDiv = document.createElement('div');
  revealDiv.innerHTML = revealHtml;
  sec.appendChild(revealDiv.firstElementChild);

  /* Tombol lanjut */
  var nextLabel =
    idx < DATA.estimasi.scenarios.length - 1
      ? 'Lanjut ke Skenario Berikutnya →'
      : 'Lihat Ringkasan Estimasi →';
  var btnRow = document.createElement('div');
  btnRow.className = 'btn-group btn-group--end';
  btnRow.innerHTML =
    '<button type="button" class="btn btn--primary" id="esNextBtn">' + nextLabel + '</button>';
  sec.appendChild(btnRow);

  document.getElementById('esNextBtn').addEventListener('click', function () {
    State.es.idx = idx + 1;
    saveState();
    if (State.es.idx >= DATA.estimasi.scenarios.length) {
      renderEstimasiSummary(sec.parentElement);
    } else {
      renderEstimasi(sec.parentElement);
    }
  });
}

function buildEstimasiFeedback(
  scenario,
  sd,
  totalEstimasi,
  actualTotal,
  dir,
  devPct,
  decisionCorrect
) {
  var budget = scenario.budget;
  var strategyName =
    sd.strategy === 1000 ? 'ribuan' : sd.strategy === 5000 ? 'lima ribuan' : 'sepuluh ribuan';
  var actualOk = actualTotal <= budget;

  var msg = '';

  /* Arah deviasi */
  if (dir === 'over') {
    msg +=
      'Estimasimu lebih <strong>tinggi</strong> dari total sebenarnya (selisih ' +
      formatRupiah(deviationAmt(totalEstimasi, actualTotal)) +
      ' atau ' +
      devPct +
      '%). ' +
      'Ini disebut <em>overestimasi</em>. ';
  } else if (dir === 'under') {
    msg +=
      'Estimasimu lebih <strong>rendah</strong> dari total sebenarnya (selisih ' +
      formatRupiah(deviationAmt(totalEstimasi, actualTotal)) +
      ' atau ' +
      devPct +
      '%). ' +
      'Ini disebut <em>underestimasi</em>. ';
  } else {
    msg += 'Estimasimu <strong>tepat sama</strong> dengan total sebenarnya. Luar biasa! ';
  }

  /* Hasil keputusan */
  if (decisionCorrect) {
    if (actualOk) {
      msg += 'Keputusanmu (uang <strong>cukup</strong>) <strong>tepat</strong>. ';
    } else {
      msg += 'Keputusanmu (uang <strong>tidak cukup</strong>) <strong>tepat</strong>. ';
    }
  } else {
    if (sd.decision === 'tidak' && actualOk) {
      msg +=
        '<strong>Keputusanmu kurang tepat:</strong> estimasimu yang terlalu tinggi membuatmu mengira uang tidak cukup, padahal total sebenarnya (' +
        formatRupiah(actualTotal) +
        ') masih di bawah anggaran (' +
        formatRupiah(budget) +
        '). ';
    } else {
      msg +=
        '<strong>Keputusanmu kurang tepat:</strong> estimasimu yang terlalu rendah membuatmu mengira uang cukup, padahal total sebenarnya (' +
        formatRupiah(actualTotal) +
        ') melebihi anggaran (' +
        formatRupiah(budget) +
        '). ';
    }
  }

  /* Analisis strategi */
  if (devPct <= 3) {
    msg +=
      'Strategi pembulatan ke <strong>' +
      strategyName +
      '</strong> menghasilkan estimasi yang sangat akurat untuk situasi ini (selisih hanya ' +
      devPct +
      '%).';
  } else if (devPct <= 10) {
    msg +=
      'Strategi pembulatan ke <strong>' +
      strategyName +
      '</strong> memberikan estimasi yang cukup baik (selisih ' +
      devPct +
      '%).';
  } else if (devPct <= 20) {
    msg +=
      'Strategi pembulatan ke <strong>' +
      strategyName +
      '</strong> memberikan estimasi yang agak kasar (selisih ' +
      devPct +
      '%). Untuk anggaran ketat, pertimbangkan pembulatan ke ribuan agar lebih akurat.';
  } else {
    msg +=
      'Strategi pembulatan ke <strong>' +
      strategyName +
      '</strong> menghasilkan estimasi yang jauh meleset (selisih ' +
      devPct +
      '%). Pembulatan ke satuan yang terlalu besar dapat menyebabkan keputusan yang salah, seperti yang terjadi pada skenario ini.';
  }

  return msg;
}

function renderEstimasiSummary(container) {
  var scenarios = DATA.estimasi.scenarios;
  var correctCount = 0;

  var rows = scenarios
    .map(function (sc, i) {
      var sd = State.es.data[i];
      if (!sd || sd.phase !== 'revealed') return '';

      var actualTotal = calcTotalBelanja(sc.items);
      var totalEst = 0;
      sc.items.forEach(function (item, j) {
        if (sd.itemRounded[j] !== undefined) totalEst += sd.itemRounded[j];
      });

      var actualOk = actualTotal <= sc.budget;
      var decisionOk = (sd.decision === 'cukup') === actualOk;
      if (decisionOk) correctCount++;

      var strategyName =
        sd.strategy === 1000 ? 'Ribuan' : sd.strategy === 5000 ? 'Lima Ribuan' : 'Sepuluh Ribuan';

      return (
        '<tr style="border-bottom:1px solid var(--color-border);">' +
        '<td style="padding:var(--space-2) var(--space-3);">' +
        esc(sc.label) +
        '</td>' +
        '<td style="padding:var(--space-2) var(--space-3);font-family:var(--font-mono);">' +
        strategyName +
        '</td>' +
        '<td style="padding:var(--space-2) var(--space-3);font-family:var(--font-mono);">' +
        formatRupiah(totalEst) +
        '</td>' +
        '<td style="padding:var(--space-2) var(--space-3);font-family:var(--font-mono);">' +
        formatRupiah(actualTotal) +
        '</td>' +
        '<td style="padding:var(--space-2) var(--space-3);text-align:center;">' +
        (decisionOk
          ? '<span style="color:var(--color-success-strong);font-weight:700;">✓</span>'
          : '<span style="color:var(--color-error-strong);font-weight:700;">✗</span>') +
        '</td>' +
        '</tr>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Ringkasan estimasi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">Tahap 3 — Ringkasan Estimasi</span>' +
    '</div>' +
    buildFeedbackBox(
      correctCount === scenarios.length ? 'success' : correctCount >= 2 ? 'info' : 'warning',
      correctCount === scenarios.length ? '🎯' : '💡',
      '<strong>' +
        correctCount +
        ' dari ' +
        scenarios.length +
        ' keputusan anggaran tepat.</strong> ' +
        (correctCount === scenarios.length
          ? 'Kamu berhasil mengestimasi dengan baik di semua skenario!'
          : 'Perhatikan skenario di mana keputusanmu kurang tepat — biasanya terjadi karena pilihan strategi pembulatan tidak sesuai dengan tingkat keketatan anggaran.')
    ) +
    '<div class="panel" style="margin-top:var(--space-4);overflow-x:auto;">' +
    '<h3>Rekap Semua Skenario</h3>' +
    '<table style="width:100%;border-collapse:collapse;font-size:0.88rem;">' +
    '<thead><tr style="border-bottom:2px solid var(--color-border);">' +
    '<th style="text-align:left;padding:var(--space-2) var(--space-3);">Skenario</th>' +
    '<th style="text-align:left;padding:var(--space-2) var(--space-3);">Strategi</th>' +
    '<th style="text-align:left;padding:var(--space-2) var(--space-3);">Estimasi</th>' +
    '<th style="text-align:left;padding:var(--space-2) var(--space-3);">Sebenarnya</th>' +
    '<th style="text-align:center;padding:var(--space-2) var(--space-3);">Keputusan</th>' +
    '</tr></thead>' +
    '<tbody>' +
    rows +
    '</tbody>' +
    '</table>' +
    '</div>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="esDoneBtn">Lanjut ke Decision Challenge →</button>' +
    '</div>' +
    '</section>';

  document.getElementById('esDoneBtn').addEventListener('click', function () {
    completeStage('estimasi');
    navigateTo('tantangan');
  });
}

/* ============================================================
   9. STAGE: TANTANGAN (Decision Challenge)
   ============================================================ */

function renderTantangan(container) {
  var challenges = DATA.tantangan.challenges;
  var idx = State.tn.idx;

  if (idx >= challenges.length) {
    renderTantanganSummary(container);
    return;
  }

  var challenge = challenges[idx];
  var td = State.tn.data[idx] || { selected: [], locked: false };
  State.tn.data[idx] = td;

  var selectedIds = td.selected || [];
  var totalSelected = selectedIds.reduce(function (s, id) {
    var item = challenge.items.find(function (it) {
      return it.id === id;
    });
    return s + (item ? item.harga : 0);
  }, 0);
  var withinBudget = totalSelected <= challenge.budget;

  container.innerHTML =
    '<section aria-label="Decision Challenge">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">Tahap 4 — Decision Challenge</span>' +
    '<p class="stage-head__goal">' +
    esc(DATA.meta.goal) +
    '</p>' +
    '</div>' +
    buildProgressDots(
      challenges.length,
      idx,
      challenges.map(function (_, i) {
        var d = State.tn.data[i];
        return { chosen: d && d.locked ? 'done' : null, isCorrect: true };
      })
    ) +
    '<div class="panel panel--hero">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-3);flex-wrap:wrap;">' +
    '<div>' +
    '<p style="font-size:0.8rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:var(--color-primary);margin-bottom:4px;">' +
    esc(challenge.label) +
    '</p>' +
    '<p style="font-size:0.95rem;margin-bottom:0;">' +
    esc(challenge.context) +
    '</p>' +
    '</div>' +
    '<div style="text-align:right;flex-shrink:0;">' +
    '<span style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:var(--color-ink-muted);">Anggaranmu</span>' +
    '<div style="font-family:var(--font-mono);font-size:1.8rem;font-weight:700;color:var(--color-primary-strong);">' +
    formatRupiah(challenge.budget) +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="panel panel--info panel--compact" style="font-size:0.88rem;">' +
    '<strong>Cara main:</strong> Gunakan estimasimu untuk memilih barang-barang yang ingin dibeli. ' +
    'Pilih minimal ' +
    challenge.minSelect +
    ' barang. Total sebenarnya akan ditampilkan setelah kamu mengunci pilihan.' +
    '</div>' +
    '<div class="budget-summary">' +
    '<div class="budget-summary__anggaran">' +
    '<span class="budget-summary__anggaran-label">Anggaran</span>' +
    '<span class="budget-summary__anggaran-value">' +
    formatRupiah(challenge.budget) +
    '</span>' +
    '</div>' +
    '<span class="budget-summary__count" id="selectedCount">' +
    selectedIds.length +
    ' barang dipilih' +
    (td.locked ? ' · Total: ' + formatRupiah(totalSelected) : '') +
    '</span>' +
    '</div>' +
    '<div class="challenge-items-grid">' +
    challenge.items
      .map(function (item) {
        var isSelected = selectedIds.indexOf(item.id) !== -1;
        var cardClass =
          'challenge-item-card' +
          (isSelected ? ' is-selected' : '') +
          (td.locked ? ' is-locked' : '');
        if (td.locked) {
          cardClass += isSelected ? (withinBudget ? ' reveal-ok' : ' reveal-over-budget') : '';
        }
        return (
          '<div class="' +
          cardClass +
          '" data-id="' +
          esc(item.id) +
          '" tabindex="0" ' +
          'role="checkbox" aria-checked="' +
          isSelected +
          '" aria-label="' +
          esc(item.nama) +
          ' ' +
          formatRupiah(item.harga) +
          '">' +
          '<span class="challenge-item-card__check" aria-hidden="true">' +
          (isSelected ? '✓' : '') +
          '</span>' +
          '<span class="challenge-item-card__name">' +
          esc(item.nama) +
          '</span>' +
          '<span class="challenge-item-card__price">' +
          formatRupiah(item.harga) +
          '</span>' +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="lockTantanganBtn"' +
    (selectedIds.length >= challenge.minSelect && !td.locked ? '' : ' disabled') +
    '>Kunci Pilihan →</button>' +
    '</div>' +
    (td.locked ? buildTantanganReveal(challenge, td, totalSelected) : '') +
    '</section>';

  /* Event handler: toggle item */
  if (!td.locked) {
    container.querySelectorAll('.challenge-item-card').forEach(function (card) {
      function toggleCard() {
        var id = card.dataset.id;
        var selIdx = selectedIds.indexOf(id);
        if (selIdx === -1) {
          State.tn.data[idx].selected.push(id);
        } else {
          State.tn.data[idx].selected.splice(selIdx, 1);
        }
        saveState();
        renderTantangan(container);
      }
      card.addEventListener('click', toggleCard);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCard();
        }
      });
    });
  }

  /* Kunci pilihan */
  var lockBtn = document.getElementById('lockTantanganBtn');
  if (lockBtn && !td.locked) {
    lockBtn.addEventListener('click', function () {
      State.tn.data[idx].locked = true;
      saveState();
      renderTantangan(container);
    });
  }

  /* Tombol lanjut (ditambahkan setelah reveal) */
  var nextTnBtn = document.getElementById('nextTantanganBtn');
  if (nextTnBtn) {
    nextTnBtn.addEventListener('click', function () {
      State.tn.idx = idx + 1;
      saveState();
      if (State.tn.idx >= challenges.length) {
        renderTantanganSummary(container);
      } else {
        renderTantangan(container);
      }
    });
  }
}

function buildTantanganReveal(challenge, td, totalSelected) {
  var withinBudget = totalSelected <= challenge.budget;
  var over = totalSelected - challenge.budget;

  /* Cari barang yang tidak dipilih yang masih bisa ditambah */
  var unselected = challenge.items.filter(function (it) {
    return td.selected.indexOf(it.id) === -1;
  });
  var cheapestMissed = unselected.sort(function (a, b) {
    return a.harga - b.harga;
  })[0];
  var couldAdd = cheapestMissed && totalSelected + cheapestMissed.harga <= challenge.budget;

  var feedbackType = withinBudget ? 'success' : 'error';
  var feedbackIcon = withinBudget ? '✓' : '✗';

  var feedbackMsg = '';
  if (withinBudget) {
    feedbackMsg =
      '<strong>Pilihanmu sesuai anggaran!</strong> Total belanja (' +
      formatRupiah(totalSelected) +
      ') tidak melebihi anggaran ' +
      formatRupiah(challenge.budget) +
      ' (sisa ' +
      formatRupiah(challenge.budget - totalSelected) +
      '). ';
    if (couldAdd) {
      feedbackMsg +=
        'Dengan sisa anggaran tersebut, kamu masih bisa menambahkan <strong>' +
        esc(cheapestMissed.nama) +
        '</strong> (' +
        formatRupiah(cheapestMissed.harga) +
        ') jika diperlukan.';
    }
  } else {
    feedbackMsg =
      '<strong>Pilihanmu melebihi anggaran!</strong> Total belanja (' +
      formatRupiah(totalSelected) +
      ') melebihi anggaran ' +
      formatRupiah(challenge.budget) +
      ' sebesar ' +
      formatRupiah(over) +
      '. ';
    feedbackMsg +=
      'Cobalah hapus barang dengan harga tertinggi dari pilihanmu, atau ganti dengan barang yang lebih murah.';
  }

  var nextLabel =
    State.tn.idx < DATA.tantangan.challenges.length - 1
      ? 'Tantangan Berikutnya →'
      : 'Lihat Ringkasan →';

  return (
    '<div id="tantanganReveal">' +
    buildFeedbackBox(feedbackType, feedbackIcon, feedbackMsg) +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="nextTantanganBtn">' +
    nextLabel +
    '</button>' +
    '</div>' +
    '</div>'
  );
}

function renderTantanganSummary(container) {
  var challenges = DATA.tantangan.challenges;
  var successCount = 0;

  var rows = challenges
    .map(function (ch, i) {
      var td = State.tn.data[i];
      if (!td || !td.locked) return '';
      var total = td.selected.reduce(function (s, id) {
        var item = ch.items.find(function (it) {
          return it.id === id;
        });
        return s + (item ? item.harga : 0);
      }, 0);
      var ok = total <= ch.budget;
      if (ok) successCount++;
      return (
        '<tr style="border-bottom:1px solid var(--color-border);">' +
        '<td style="padding:var(--space-2) var(--space-3);">' +
        esc(ch.label) +
        '</td>' +
        '<td style="padding:var(--space-2) var(--space-3);">' +
        formatRupiah(ch.budget) +
        '</td>' +
        '<td style="padding:var(--space-2) var(--space-3);">' +
        td.selected.length +
        ' barang</td>' +
        '<td style="padding:var(--space-2) var(--space-3);font-family:var(--font-mono);">' +
        formatRupiah(total) +
        '</td>' +
        '<td style="text-align:center;padding:var(--space-2) var(--space-3);">' +
        (ok
          ? '<span style="color:var(--color-success-strong);font-weight:700;">✓</span>'
          : '<span style="color:var(--color-error-strong);font-weight:700;">✗</span>') +
        '</td>' +
        '</tr>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Ringkasan Decision Challenge">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">Tahap 4 — Ringkasan Decision Challenge</span>' +
    '</div>' +
    buildFeedbackBox(
      successCount === challenges.length ? 'success' : 'info',
      successCount === challenges.length ? '🎉' : '💡',
      '<strong>' +
        successCount +
        ' dari ' +
        challenges.length +
        ' tantangan berhasil (pilihan sesuai anggaran).</strong> ' +
        'Semakin tepat estimasimu, semakin baik keputusan yang bisa kamu ambil.'
    ) +
    '<div class="panel" style="margin-top:var(--space-4);overflow-x:auto;">' +
    '<h3>Rekap Tantangan</h3>' +
    '<table style="width:100%;border-collapse:collapse;font-size:0.88rem;">' +
    '<thead><tr style="border-bottom:2px solid var(--color-border);">' +
    '<th style="text-align:left;padding:var(--space-2) var(--space-3);">Tantangan</th>' +
    '<th style="text-align:left;padding:var(--space-2) var(--space-3);">Anggaran</th>' +
    '<th style="text-align:left;padding:var(--space-2) var(--space-3);">Dipilih</th>' +
    '<th style="text-align:left;padding:var(--space-2) var(--space-3);">Total Belanja</th>' +
    '<th style="text-align:center;padding:var(--space-2) var(--space-3);">Hasil</th>' +
    '</tr></thead>' +
    '<tbody>' +
    rows +
    '</tbody>' +
    '</table>' +
    '</div>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="tnDoneBtn">Lanjut ke Asesmen →</button>' +
    '</div>' +
    '</section>';

  document.getElementById('tnDoneBtn').addEventListener('click', function () {
    completeStage('tantangan');
    navigateTo('asesmen');
  });
}

/* ============================================================
   10. STAGE: ASESMEN
   ============================================================ */

function renderAsesmen(container) {
  var soalList = DATA.asesmen.soal;
  var idx = State.as.idx;

  if (idx >= soalList.length) {
    renderAsesmenSummary(container);
    return;
  }

  var soal = soalList[idx];
  var ans = State.as.answers[soal.id] || { chosen: null, locked: false };
  State.as.answers[soal.id] = ans;

  container.innerHTML =
    '<section aria-label="Asesmen formatif">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">Tahap 5 — Asesmen Formatif</span>' +
    '<p class="stage-head__goal">' +
    esc(DATA.asesmen.instruction) +
    '</p>' +
    '</div>' +
    buildProgressDots(
      soalList.length,
      idx,
      soalList.map(function (s) {
        var a = State.as.answers[s.id];
        return { chosen: a && a.locked ? 'done' : null, isCorrect: a && a.chosen === s.correct };
      })
    ) +
    '<div class="panel">' +
    '<p style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-primary);margin-bottom:var(--space-3);">Pertanyaan ' +
    (idx + 1) +
    ' dari ' +
    soalList.length +
    '</p>' +
    '<p style="font-size:1rem;font-weight:600;line-height:1.5;margin-bottom:var(--space-3);" id="asQuestion">' +
    esc(soal.pertanyaan) +
    '</p>' +
    '<div class="asesmen-options" role="radiogroup" aria-labelledby="asQuestion">' +
    soal.pilihan
      .map(function (p) {
        var cls = 'asesmen-option';
        if (ans.locked) {
          if (p.id === soal.correct) cls += ' is-correct';
          else if (p.id === ans.chosen) cls += ' is-incorrect';
        } else if (p.id === ans.chosen) {
          cls += ' is-selected';
        }
        return (
          '<button type="button" class="' +
          cls +
          '"' +
          (ans.locked ? ' disabled aria-disabled="true"' : '') +
          ' data-opt="' +
          esc(p.id) +
          '"' +
          ' role="radio" aria-checked="' +
          (p.id === ans.chosen) +
          '">' +
          '<span class="asesmen-option__key" aria-hidden="true">' +
          p.id.toUpperCase() +
          '</span>' +
          '<span>' +
          esc(p.teks) +
          '</span>' +
          '</button>'
        );
      })
      .join('') +
    '</div>' +
    (ans.locked
      ? buildFeedbackBox(
          ans.chosen === soal.correct ? 'success' : 'error',
          ans.chosen === soal.correct ? '✓' : '✗',
          (ans.chosen === soal.correct
            ? '<strong>Tepat!</strong> '
            : '<strong>Belum tepat.</strong> Jawaban yang benar adalah pilihan <strong>' +
              soal.correct.toUpperCase() +
              '</strong>. ') + esc(soal.explanation)
        )
      : '') +
    '<div class="btn-group btn-group--' +
    (idx > 0 ? 'spread' : 'end') +
    '" style="margin-top:var(--space-4);">' +
    (idx > 0
      ? '<button type="button" class="btn btn--ghost" id="asPrevBtn">← Sebelumnya</button>'
      : '') +
    (!ans.locked
      ? '<button type="button" class="btn btn--primary" id="asLockBtn"' +
        (ans.chosen ? '' : ' disabled') +
        '>Kunci Jawaban</button>'
      : '<button type="button" class="btn btn--primary" id="asNextBtn">' +
        (idx < soalList.length - 1 ? 'Soal Berikutnya →' : 'Lihat Hasil →') +
        '</button>') +
    '</div>' +
    '</div>' +
    '</section>';

  /* Event handlers */
  container.querySelectorAll('.asesmen-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (ans.locked) return;
      State.as.answers[soal.id].chosen = btn.dataset.opt;
      saveState();
      renderAsesmen(container);
    });
  });

  var lockBtn = document.getElementById('asLockBtn');
  if (lockBtn) {
    lockBtn.addEventListener('click', function () {
      if (!lockBtn.disabled) {
        State.as.answers[soal.id].locked = true;
        saveState();
        renderAsesmen(container);
      }
    });
  }

  var nextBtn = document.getElementById('asNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      State.as.idx = idx + 1;
      saveState();
      if (State.as.idx >= soalList.length) {
        renderAsesmenSummary(container);
      } else {
        renderAsesmen(container);
      }
    });
  }

  var prevBtn = document.getElementById('asPrevBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (State.as.idx > 0) {
        State.as.idx = idx - 1;
        saveState();
        renderAsesmen(container);
      }
    });
  }
}

function renderAsesmenSummary(container) {
  var soalList = DATA.asesmen.soal;
  var correct = soalList.filter(function (s) {
    var a = State.as.answers[s.id];
    return a && a.locked && a.chosen === s.correct;
  }).length;
  var total = soalList.length;
  var pct = Math.round((correct / total) * 100);

  var feedbackType = correct === total ? 'success' : correct >= 4 ? 'info' : 'warning';
  var feedbackMsg =
    correct === total
      ? 'Semua jawaban benar! Kamu memahami konsep estimasi dan pembulatan dengan baik.'
      : correct >= 4
        ? 'Hampir sempurna! Satu soal lagi yang perlu diperhatikan.'
        : 'Beberapa konsep masih perlu diperkuat. Diskusikan dengan gurumu jika ada yang belum dipahami.';

  var rows = soalList
    .map(function (soal, i) {
      var a = State.as.answers[soal.id];
      var ok = a && a.locked && a.chosen === soal.correct;
      return (
        '<tr style="border-bottom:1px solid var(--color-border);">' +
        '<td style="padding:var(--space-2) var(--space-3);">Soal ' +
        (i + 1) +
        '</td>' +
        '<td style="padding:var(--space-2) var(--space-3);font-size:0.85rem;">' +
        esc(soal.pertanyaan.slice(0, 60)) +
        '…</td>' +
        '<td style="text-align:center;padding:var(--space-2) var(--space-3);">' +
        (ok
          ? '<span style="color:var(--color-success-strong);font-weight:700;">✓</span>'
          : '<span style="color:var(--color-error-strong);font-weight:700;">✗</span>') +
        '</td>' +
        '</tr>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Ringkasan asesmen">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">Tahap 5 — Hasil Asesmen</span>' +
    '</div>' +
    buildFeedbackBox(
      feedbackType,
      feedbackType === 'success' ? '🎉' : '📊',
      '<strong>' +
        correct +
        ' dari ' +
        total +
        ' jawaban benar (' +
        pct +
        '%).</strong> ' +
        feedbackMsg
    ) +
    '<div class="panel" style="margin-top:var(--space-4);overflow-x:auto;">' +
    '<h3>Rekap Jawaban</h3>' +
    '<table style="width:100%;border-collapse:collapse;font-size:0.88rem;">' +
    '<thead><tr style="border-bottom:2px solid var(--color-border);">' +
    '<th style="text-align:left;padding:var(--space-2) var(--space-3);">No.</th>' +
    '<th style="text-align:left;padding:var(--space-2) var(--space-3);">Pertanyaan</th>' +
    '<th style="text-align:center;padding:var(--space-2) var(--space-3);">Hasil</th>' +
    '</tr></thead>' +
    '<tbody>' +
    rows +
    '</tbody>' +
    '</table>' +
    '<p style="font-size:0.8rem;color:var(--color-ink-muted);margin-top:var(--space-3);margin-bottom:0;">' +
    'Catatan: Ini adalah panduan formatif untuk refleksi diri. Skor ini bukan nilai akhir peserta didik.' +
    '</p>' +
    '</div>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="asDoneBtn">Lanjut ke Refleksi →</button>' +
    '</div>' +
    '</section>';

  document.getElementById('asDoneBtn').addEventListener('click', function () {
    completeStage('asesmen');
    navigateTo('refleksi');
  });
}

/* ============================================================
   11. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var questions = DATA.refleksi.questions;
  var minRequired = 3;
  var answeredCount = questions.filter(function (q) {
    var ans = State.rf.answers[q.id];
    return ans && ans.trim().length > 10;
  }).length;
  var canProceed = answeredCount >= minRequired;

  container.innerHTML =
    '<section aria-label="Refleksi pembelajaran">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">Tahap 6 — Refleksi</span>' +
    '<p class="stage-head__goal">' +
    esc(DATA.refleksi.instruction) +
    '</p>' +
    '</div>' +
    '<div class="panel panel--compact panel--info">' +
    '<p style="margin:0;font-size:0.88rem;">' +
    'Jawab setidaknya <strong>' +
    minRequired +
    '</strong> dari ' +
    questions.length +
    ' pertanyaan berikut (' +
    answeredCount +
    '/' +
    questions.length +
    ' sudah diisi).' +
    '</p>' +
    '</div>' +
    questions
      .map(function (q) {
        var val = State.rf.answers[q.id] || '';
        var isDone = val.trim().length > 10;
        return (
          '<div class="refleksi-question' +
          (isDone ? ' is-answered' : '') +
          '">' +
          '<div class="refleksi-question__label">' +
          esc(q.label) +
          '</div>' +
          '<p class="refleksi-question__prompt">' +
          esc(q.prompt) +
          '</p>' +
          '<textarea class="input-textarea" data-qid="' +
          esc(q.id) +
          '" placeholder="' +
          esc(q.placeholder) +
          '" aria-label="' +
          esc(q.prompt) +
          '">' +
          esc(val) +
          '</textarea>' +
          '</div>'
        );
      })
      .join('') +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="rfSaveBtn">' +
    (canProceed ? 'Simpan & Lanjut →' : 'Simpan Refleksi') +
    '</button>' +
    (canProceed
      ? ''
      : '<span style="font-size:0.82rem;color:var(--color-ink-muted);align-self:center;">Isi ' +
        (minRequired - answeredCount) +
        ' pertanyaan lagi untuk melanjutkan.</span>') +
    '</div>' +
    '</section>';

  /* Autosave saat mengetik */
  container.querySelectorAll('.input-textarea[data-qid]').forEach(function (ta) {
    ta.addEventListener('input', function () {
      State.rf.answers[ta.dataset.qid] = ta.value;
      saveState();

      /* Update answered count tanpa full re-render */
      var count = questions.filter(function (q) {
        var a = State.rf.answers[q.id];
        return a && a.trim().length > 10;
      }).length;
      var saveBtn = document.getElementById('rfSaveBtn');
      if (saveBtn) {
        saveBtn.textContent = count >= minRequired ? 'Simpan & Lanjut →' : 'Simpan Refleksi';
        saveBtn.disabled = false;
      }
    });
  });

  document.getElementById('rfSaveBtn').addEventListener('click', function () {
    /* Ambil nilai terkini dari textarea */
    container.querySelectorAll('.input-textarea[data-qid]').forEach(function (ta) {
      State.rf.answers[ta.dataset.qid] = ta.value;
    });
    State.rf.saved = true;
    saveState();

    var count = questions.filter(function (q) {
      var a = State.rf.answers[q.id];
      return a && a.trim().length > 10;
    }).length;

    if (count >= minRequired) {
      completeStage('refleksi');
      navigateTo('selesai');
    } else {
      showNotice(
        'Isi minimal ' +
          minRequired +
          ' pertanyaan (masing-masing lebih dari 10 karakter) untuk melanjutkan.'
      );
    }
  });
}

/* ============================================================
   12. STAGE: SELESAI
   ============================================================ */

function renderSelesai(container) {
  var pbCorrect = State.pb.results.filter(function (r) {
    return r.isCorrect;
  }).length;
  var pbTotal = DATA.pembulatan.soal.length;

  var asCorrect = DATA.asesmen.soal.filter(function (s) {
    var a = State.as.answers[s.id];
    return a && a.chosen === s.correct;
  }).length;
  var asTotal = DATA.asesmen.soal.length;

  var esCorrect = DATA.estimasi.scenarios.filter(function (sc, i) {
    var sd = State.es.data[i];
    if (!sd || sd.phase !== 'revealed') return false;
    var actualOk = calcTotalBelanja(sc.items) <= sc.budget;
    return (sd.decision === 'cukup') === actualOk;
  }).length;
  var esTotal = DATA.estimasi.scenarios.length;

  var tnCorrect = DATA.tantangan.challenges.filter(function (ch, i) {
    var td = State.tn.data[i];
    if (!td || !td.locked) return false;
    var total = td.selected.reduce(function (s, id) {
      var item = ch.items.find(function (it) {
        return it.id === id;
      });
      return s + (item ? item.harga : 0);
    }, 0);
    return total <= ch.budget;
  }).length;
  var tnTotal = DATA.tantangan.challenges.length;

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">Tahap 7 — Selesai</span>' +
    '</div>' +
    '<div class="panel panel--hero" style="text-align:center;">' +
    '<p style="font-size:2rem;margin-bottom:var(--space-2);">🎉</p>' +
    '<h2>Kamu telah menyelesaikan seluruh aktivitas!</h2>' +
    '<p style="font-size:0.95rem;color:var(--color-ink-muted);">' +
    esc(DATA.meta.goal) +
    '</p>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>Ringkasan Hasil Belajar</h3>' +
    '<p style="font-size:0.82rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);">Ini adalah ringkasan formatif untuk panduan belajar — bukan nilai akhir.</p>' +
    '<div class="score-row"><span class="score-row__label">Pembulatan (soal benar)</span><span class="score-row__value">' +
    pbCorrect +
    ' / ' +
    pbTotal +
    '</span></div>' +
    '<div class="score-row"><span class="score-row__label">Estimasi (keputusan tepat)</span><span class="score-row__value">' +
    esCorrect +
    ' / ' +
    esTotal +
    '</span></div>' +
    '<div class="score-row"><span class="score-row__label">Decision Challenge (dalam anggaran)</span><span class="score-row__value">' +
    tnCorrect +
    ' / ' +
    tnTotal +
    '</span></div>' +
    '<div class="score-row"><span class="score-row__label">Asesmen (jawaban benar)</span><span class="score-row__value">' +
    asCorrect +
    ' / ' +
    asTotal +
    '</span></div>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>Apa yang kamu telah pelajari:</h3>' +
    '<ul style="margin:0;">' +
    '<li>Pembulatan ke berbagai tingkat (ribuan, lima ribuan, sepuluh ribuan) memberikan hasil yang berbeda.</li>' +
    '<li>Strategi pembulatan ke atas (overestimasi) lebih aman untuk memastikan anggaran cukup.</li>' +
    '<li>Pembulatan terlalu besar dapat membuat estimasi jauh meleset dan menghasilkan keputusan yang salah.</li>' +
    '<li>Estimasi berguna untuk pengambilan keputusan cepat; perhitungan presisi diperlukan untuk hasil yang tepat.</li>' +
    '</ul>' +
    '</div>' +
    '<div class="panel panel--compact panel--info">' +
    '<h3>Kegiatan selanjutnya bersama guru:</h3>' +
    '<ul style="margin:0;">' +
    '<li>Simulasi Pasar Harian: praktikkan estimasi secara langsung sebagai pembeli dan kasir.</li>' +
    '<li>Diskusikan strategi estimasi terbaikmu dengan kelompok.</li>' +
    '<li>Presentasikan hasil refleksimu kepada guru.</li>' +
    '</ul>' +
    '</div>' +
    '<div class="btn-group btn-group--center">' +
    '<button type="button" class="btn btn--ghost" id="finalResetBtn">Ulangi Dari Awal</button>' +
    '<a href="../../index.html" class="btn btn--outline-primary">Ke Beranda</a>' +
    '</div>' +
    '</section>';

  document.getElementById('finalResetBtn').addEventListener('click', function () {
    showResetConfirm();
  });
}

/* ============================================================
   13. HELPER UI
   ============================================================ */

function showResetConfirm() {
  /* Gunakan modal ringan */
  var existing = document.getElementById('resetModal');
  if (existing) existing.remove();

  var backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'resetModal';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'resetModalTitle');

  backdrop.innerHTML =
    '<div class="modal">' +
    '<h3 id="resetModalTitle">Ulangi Dari Awal?</h3>' +
    '<p style="font-size:0.92rem;color:var(--color-ink-muted);">Semua progress, jawaban, dan refleksimu akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--ghost" id="resetCancelBtn">Batal</button>' +
    '<button type="button" class="btn btn--danger" id="resetConfirmBtn">Ya, Ulangi</button>' +
    '</div>' +
    '</div>';

  document.body.appendChild(backdrop);

  document.getElementById('resetCancelBtn').addEventListener('click', function () {
    backdrop.remove();
  });

  document.getElementById('resetConfirmBtn').addEventListener('click', function () {
    backdrop.remove();
    clearState();
    saveState();
    renderCurrentStage();
    updateStageNav();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* Tutup jika klik backdrop */
  backdrop.addEventListener('click', function (e) {
    if (e.target === backdrop) backdrop.remove();
  });

  /* Fokus ke tombol batal */
  setTimeout(function () {
    var btn = document.getElementById('resetCancelBtn');
    if (btn) btn.focus();
  }, 50);
}

/* ============================================================
   14. INIT
   ============================================================ */

function init() {
  /* Muat state yang tersimpan atau inisialisasi baru */
  var loaded = loadState();
  if (!loaded) {
    initStateArrays();
  } else {
    /* Pastikan array state terinisialisasi meski ada perubahan data */
    initStateArrays();
  }

  buildStageNav();
  updateStageNav();
  updateProgress();
  renderCurrentStage();

  /* Tombol reset di header */
  var resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      showResetConfirm();
    });
  }

  /* Tangani error global — jangan tampilkan ke pengguna */
  window.addEventListener('error', function (e) {
    console.error('App error:', e.message, e.filename, e.lineno);
  });
}

/* Jalankan setelah DOM siap */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
