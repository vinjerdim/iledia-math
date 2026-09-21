'use strict';

/* ============================================================
   app-stage-tantangan.js — Stage: Tantangan
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

/* ============================================================
   11. STAGE: TANTANGAN
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

  if (idx >= soal.length) idx = soal.length - 1;

  var s = soal[idx];
  var ex = State.tantanganExercises[idx];

  var statuses = State.tantanganExercises.map(function (e) {
    if (e.checked && e.correct) return 'correct';
    if (e.checked && !e.correct) return 'incorrect';
    return '';
  });

  var questionHTML = '';
  if (s.type === 'choice') {
    questionHTML = buildTantanganChoice(s, ex);
  } else if (s.type === 'ordering') {
    questionHTML = buildTantanganOrdering(s, ex);
  }

  /* Feedback */
  var feedbackHTML = '';
  if (ex.checked) {
    if (ex.correct) {
      feedbackHTML = buildFeedbackBox(
        'success',
        '✓',
        '<strong>Tepat!</strong><br>' + s.explanation
      );
    } else {
      feedbackHTML = buildFeedbackBox(
        'error',
        '✗',
        '<strong>Belum tepat.</strong><br>' + s.explanation
      );
    }
  } else if (ex.attempts >= 1 && !ex.checked) {
    feedbackHTML =
      '<div class="hint-box"><span class="hint-box__label">💡 Petunjuk:</span>' +
      esc(s.hint) +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="Tantangan Kontekstual">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 6 — TANTANGAN</span>' +
    '<p class="stage-head__goal">Tujuan: Menerapkan konversi dan perbandingan bilangan rasional dalam konteks nyata.</p>' +
    '</div>' +
    '<div class="panel">' +
    buildProgressDots(soal.length, idx, statuses) +
    '<div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3);">' +
    '<span class="badge-chip">' +
    esc(s.badge) +
    '</span>' +
    '</div>' +
    '<div class="challenge-story">' +
    s.story +
    '</div>' +
    '<p style="font-weight:600;margin-bottom:var(--space-2);">' +
    s.question +
    '</p>' +
    questionHTML +
    feedbackHTML +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-5);">' +
    '<button type="button" class="btn btn--ghost" id="prevTantanganBtn" ' +
    (idx === 0 ? 'disabled' : '') +
    '>← Sebelumnya</button>' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">' +
    (!ex.checked
      ? '<button type="button" class="btn btn--primary" id="checkTantanganBtn" ' +
        ((s.type === 'choice' && !ex.chosen) || (s.type === 'ordering' && !ex.order)
          ? 'disabled'
          : '') +
        '>Periksa Jawaban</button>'
      : idx < soal.length - 1
      ? '<button type="button" class="btn btn--outline-primary" id="retryTantanganBtn">↩ Soal Ini</button>' +
        '<button type="button" class="btn btn--primary" id="nextTantanganBtn">Lanjut →</button>'
      : '<button type="button" class="btn btn--primary" id="summaryTantanganBtn">Lihat Ringkasan →</button>') +
    '</div></div></div></section>';

  /* Events: pilih pilihan jawaban */
  container.querySelectorAll('.choice-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      State.tantanganExercises[idx].chosen = btn.dataset.id;
      saveState();
      renderTantangan(container);
    });
  });

  /* Events: move up/down untuk soal ordering */
  container.querySelectorAll('[data-tantangan-move]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      var itemId = btn.dataset.id;
      var dir = btn.dataset.tantanganMove;
      var order = ex.order;
      var fromIdx2 = order.indexOf(itemId);
      var toIdx2 = dir === 'up' ? fromIdx2 - 1 : fromIdx2 + 1;
      if (toIdx2 < 0 || toIdx2 >= order.length) return;
      var tmp = order[fromIdx2];
      order[fromIdx2] = order[toIdx2];
      order[toIdx2] = tmp;
      saveState();
      renderTantangan(container);
    });
  });

  var checkBtn = document.getElementById('checkTantanganBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      checkTantanganAnswer(container, idx);
    });

  var prevBtn = document.getElementById('prevTantanganBtn');
  if (prevBtn)
    prevBtn.addEventListener('click', function () {
      State.tantanganIdx = Math.max(0, idx - 1);
      saveState();
      renderTantangan(container);
    });

  var nextBtn4 = document.getElementById('nextTantanganBtn');
  if (nextBtn4)
    nextBtn4.addEventListener('click', function () {
      State.tantanganIdx = Math.min(soal.length - 1, idx + 1);
      saveState();
      renderTantangan(container);
    });

  var retryBtn3 = document.getElementById('retryTantanganBtn');
  if (retryBtn3)
    retryBtn3.addEventListener('click', function () {
      var s2 = soal[idx];
      var currentOrder = State.tantanganExercises[idx].order;
      State.tantanganExercises[idx] = {
        attempts: 0,
        correct: false,
        chosen: null,
        /* preserve current order so student can fine-tune instead of starting over */
        order:
          s2.type === 'ordering'
            ? currentOrder
              ? currentOrder.slice()
              : s2.initialOrder.slice()
            : null,
        checked: false,
      };
      saveState();
      renderTantangan(container);
    });

  var summaryBtn3 = document.getElementById('summaryTantanganBtn');
  if (summaryBtn3)
    summaryBtn3.addEventListener('click', function () {
      State.tantanganIdx = soal.length;
      saveState();
      renderTantanganSummary(container);
    });
}

function buildTantanganChoice(s, ex) {
  var isChecked = ex.checked;
  var optHTML = s.options
    .map(function (opt) {
      var cls = 'choice-btn';
      if (isChecked) {
        if (opt.id === s.correct) cls += ' is-correct';
        else if (opt.id === ex.chosen && opt.id !== s.correct) cls += ' is-incorrect';
      } else if (opt.id === ex.chosen) {
        cls += ' is-selected';
      }
      var letter = String.fromCharCode(65 + s.options.indexOf(opt));
      var iconContent =
        isChecked && opt.id === s.correct
          ? '✓'
          : isChecked && opt.id === ex.chosen && opt.id !== s.correct
          ? '✗'
          : letter;
      return (
        '<button type="button" class="' +
        cls +
        '" data-id="' +
        opt.id +
        '" ' +
        (isChecked ? 'disabled' : '') +
        '>' +
        '<span class="choice-btn__icon">' +
        iconContent +
        '</span>' +
        esc(opt.label) +
        '</button>'
      );
    })
    .join('');
  return (
    '<div class="challenge-options" role="group" aria-label="Pilihan jawaban">' + optHTML + '</div>'
  );
}

function buildTantanganOrdering(s, ex) {
  var isChecked = ex.checked;
  var order =
    ex.order ||
    s.items.map(function (it) {
      return it.id;
    });

  /* Tentukan posisi benar jika sudah dicek */
  var correctSet2 = new Set();
  if (isChecked) {
    for (var i = 0; i < s.correctOrder.length; i++) {
      if (order[i] === s.correctOrder[i]) correctSet2.add(order[i]);
    }
  }

  var rows = order
    .map(function (itemId, i) {
      var item = s.items.find(function (it) {
        return it.id === itemId;
      });
      if (!item) return '';
      var statusIcon = '';
      var rowCls = 'sort-card';
      if (isChecked) {
        if (correctSet2.has(itemId)) {
          rowCls += ' sort-card--correct';
          statusIcon = '✓';
        } else {
          rowCls += ' sort-card--incorrect';
          statusIcon = '✗';
        }
      }
      return (
        '<div class="' +
        rowCls +
        '" style="cursor:default;">' +
        '<span class="sort-card__rank">' +
        (i + 1) +
        '.</span>' +
        '<div class="sort-card__content">' +
        '<div class="sort-card__name">' +
        esc(item.label) +
        '</div>' +
        '</div>' +
        '<div class="sort-card__move-btns">' +
        '<button type="button" class="sort-card__btn" data-tantangan-move="up" data-id="' +
        itemId +
        '" ' +
        (i === 0 || isChecked ? 'disabled' : '') +
        '>▲</button>' +
        '<button type="button" class="sort-card__btn" data-tantangan-move="down" data-id="' +
        itemId +
        '" ' +
        (i === order.length - 1 || isChecked ? 'disabled' : '') +
        '>▼</button>' +
        '</div>' +
        (statusIcon
          ? '<span style="font-weight:700;' +
            (statusIcon === '✓'
              ? 'color:var(--color-success-strong)'
              : 'color:var(--color-error-strong)') +
            ';">' +
            statusIcon +
            '</span>'
          : '') +
        '</div>'
      );
    })
    .join('');

  return '<div class="sort-list" style="max-width:480px;">' + rows + '</div>';
}

function checkTantanganAnswer(container, idx) {
  var s = DATA.tantangan.soal[idx];
  var ex = State.tantanganExercises[idx];

  ex.attempts += 1;

  if (s.type === 'choice') {
    if (!ex.chosen) return;
    ex.correct = ex.chosen === s.correct;
    ex.checked = true;
  } else if (s.type === 'ordering') {
    if (!ex.order) return;
    var correct = true;
    for (var i = 0; i < s.correctOrder.length; i++) {
      if (ex.order[i] !== s.correctOrder[i]) {
        correct = false;
        break;
      }
    }
    ex.correct = correct;
    ex.checked = true;

    /* Selalu tampilkan feedback posisi setelah memeriksa */
    ex.checked = true;
  }

  saveState();
  renderTantangan(container);
}

function renderTantanganSummary(container) {
  var soal = DATA.tantangan.soal;
  var exercises = State.tantanganExercises;
  var correctCount = exercises.filter(function (e) {
    return e.correct;
  }).length;
  var total = soal.length;

  container.innerHTML =
    '<section aria-label="Ringkasan Tantangan">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 6 — RINGKASAN TANTANGAN</span>' +
    '</div>' +
    '<div class="panel">' +
    buildFeedbackBox(
      correctCount === total ? 'success' : 'info',
      correctCount === total ? '🎉' : '📋',
      '<strong>' +
        correctCount +
        ' dari ' +
        total +
        ' tantangan diselesaikan dengan benar.</strong>' +
        '<br>Kamu telah berlatih menerapkan konversi dan perbandingan bilangan rasional dalam konteks kehidupan nyata.'
    ) +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-5);">' +
    '<button type="button" class="btn btn--ghost" id="retryAllTantanganBtn">↩ Ulangi Semua</button>' +
    '<button type="button" class="btn btn--primary" id="nextFromTantanganBtn">Lanjut ke Refleksi →</button>' +
    '</div></div></section>';

  document.getElementById('retryAllTantanganBtn').addEventListener('click', function () {
    State.tantanganIdx = 0;
    State.tantanganExercises = DATA.tantangan.soal.map(function (s2) {
      return {
        attempts: 0,
        correct: false,
        chosen: null,
        order: s2.type === 'ordering' ? s2.initialOrder.slice() : null,
        checked: false,
      };
    });
    saveState();
    renderTantangan(container);
  });

  document.getElementById('nextFromTantanganBtn').addEventListener('click', function () {
    completeStage('tantangan');
    navigateTo('refleksi');
  });
}
