'use strict';

/* ============================================================
   app-stage-bandingkan.js — Stage: Bandingkan
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

/* ============================================================
   9. STAGE: BANDINGKAN
   ============================================================ */

function renderBandingkan(container) {
  var soal = DATA.bandingkan.soal;
  var idx = State.bandingkanIdx;
  var allDone = State.bandingkanExercises.every(function (e) {
    return e.checked;
  });

  if (allDone || idx >= soal.length) {
    renderBandingkanSummary(container);
    return;
  }

  /* Clamp */
  if (idx >= soal.length) idx = soal.length - 1;

  var s = soal[idx];
  var ex = State.bandingkanExercises[idx] || {
    attempts: 0,
    correct: false,
    chosen: null,
    checked: false,
  };
  var isChecked = ex.checked;

  var statuses = State.bandingkanExercises.map(function (e) {
    if (e.checked && e.correct) return 'correct';
    if (e.checked && !e.correct) return 'incorrect';
    return '';
  });

  /* Operator buttons */
  var ops = ['<', '=', '>'];
  var opLabels = { '<': '&lt;', '=': '=', '>': '&gt;' };
  var ariaLabels = { '<': 'kurang dari', '=': 'sama dengan', '>': 'lebih dari' };

  var opButtons = ops
    .map(function (op) {
      var cls = 'operator-btn';
      if (isChecked) {
        if (op === s.answer) cls += ' is-correct';
        else if (op === ex.chosen && op !== s.answer) cls += ' is-incorrect';
      } else if (op === ex.chosen) {
        cls += ' is-selected';
      }
      return (
        '<button type="button" class="' +
        cls +
        '" data-op="' +
        op +
        '" ' +
        'aria-label="' +
        ariaLabels[op] +
        '" ' +
        (isChecked ? 'disabled' : '') +
        '>' +
        opLabels[op] +
        '</button>'
      );
    })
    .join('');

  /* Feedback */
  var feedbackHTML = '';
  if (isChecked) {
    var valA = getDecVal(s.a);
    var valB = getDecVal(s.b);
    if (ex.correct) {
      feedbackHTML = buildFeedbackBox(
        'success',
        '✓',
        '<strong>Tepat!</strong><br>' +
          s.explanation +
          '<br><em style="font-size:0.85rem;">Strategi: ' +
          s.strategy +
          '</em>'
      );
    } else {
      feedbackHTML = buildFeedbackBox(
        'error',
        '✗',
        '<strong>Kurang tepat.</strong> Jawaban yang benar: ' +
          '<strong>' +
          fmtNumberDisplay(s.a) +
          ' ' +
          esc(s.answer) +
          ' ' +
          fmtNumberDisplay(s.b) +
          '</strong><br>' +
          s.explanation +
          '<br><em style="font-size:0.85rem;">Strategi: ' +
          s.strategy +
          '</em>'
      );
    }
    /* Tampilkan perbandingan desimal */
    feedbackHTML +=
      '<div class="comparison-result" style="margin-top:var(--space-3);">' +
      '<span style="font-family:var(--font-mono);">' +
      formatDecShort(valA) +
      '</span>' +
      '<span style="color:var(--color-primary-strong);">' +
      esc(s.answer) +
      '</span>' +
      '<span style="font-family:var(--font-mono);">' +
      formatDecShort(valB) +
      '</span>' +
      '</div>';
  } else if (ex.attempts >= 1 && !isChecked) {
    feedbackHTML =
      '<div class="hint-box"><span class="hint-box__label">💡 Petunjuk:</span>' +
      esc(s.hint) +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="Membandingkan Bilangan Rasional">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 4 — MEMBANDINGKAN</span>' +
    '<p class="stage-head__goal">Tujuan: Membandingkan dua bilangan rasional dalam representasi berbeda.</p>' +
    '</div>' +
    '<div class="panel">' +
    buildProgressDots(soal.length, idx, statuses) +
    '<h3>Pilih tanda yang tepat</h3>' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);">Bandingkan kedua bilangan berikut. Pilih &lt;, =, atau &gt;.</p>' +
    '<div class="bandingkan-display">' +
    '<div class="bandingkan-item">' +
    '<span class="bandingkan-item__label">Bilangan 1</span>' +
    '<div class="bandingkan-item__num">' +
    buildNumberDisplay(s.a, 'large') +
    '</div>' +
    '</div>' +
    '<span class="bandingkan-sep">?</span>' +
    '<div class="bandingkan-item">' +
    '<span class="bandingkan-item__label">Bilangan 2</span>' +
    '<div class="bandingkan-item__num">' +
    buildNumberDisplay(s.b, 'large') +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div role="group" aria-label="Pilih operator perbandingan">' +
    '<div class="operator-choice">' +
    opButtons +
    '</div>' +
    '</div>' +
    feedbackHTML +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-5);">' +
    '<button type="button" class="btn btn--ghost" id="prevBandingkanBtn" ' +
    (idx === 0 ? 'disabled' : '') +
    '>← Sebelumnya</button>' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">' +
    (!isChecked
      ? '<button type="button" class="btn btn--primary" id="checkBandingkanBtn" ' +
        (!ex.chosen ? 'disabled' : '') +
        '>Periksa Jawaban</button>'
      : idx < soal.length - 1
      ? '<button type="button" class="btn btn--outline-primary" id="retryBandingkanBtn">↩ Soal Ini</button>' +
        '<button type="button" class="btn btn--primary" id="nextBandingkanBtn">Lanjut →</button>'
      : '<button type="button" class="btn btn--primary" id="summaryBandingkanBtn">Lihat Ringkasan →</button>') +
    '</div></div></div></section>';

  /* Events: pilih operator */
  container.querySelectorAll('.operator-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      State.bandingkanExercises[idx].chosen = btn.dataset.op;
      saveState();
      renderBandingkan(container);
    });
  });

  var checkBtn = document.getElementById('checkBandingkanBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      var ex2 = State.bandingkanExercises[idx];
      if (!ex2.chosen) return;
      ex2.attempts += 1;
      ex2.correct = ex2.chosen === s.answer;
      ex2.checked = true;
      saveState();
      renderBandingkan(container);
    });

  var prevBtn = document.getElementById('prevBandingkanBtn');
  if (prevBtn)
    prevBtn.addEventListener('click', function () {
      State.bandingkanIdx = Math.max(0, idx - 1);
      saveState();
      renderBandingkan(container);
    });

  var nextBtn = document.getElementById('nextBandingkanBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      State.bandingkanIdx = Math.min(soal.length - 1, idx + 1);
      saveState();
      renderBandingkan(container);
    });

  var retryBtn = document.getElementById('retryBandingkanBtn');
  if (retryBtn)
    retryBtn.addEventListener('click', function () {
      State.bandingkanExercises[idx] = {
        attempts: 0,
        correct: false,
        chosen: null,
        checked: false,
      };
      saveState();
      renderBandingkan(container);
    });

  var summaryBtn2 = document.getElementById('summaryBandingkanBtn');
  if (summaryBtn2)
    summaryBtn2.addEventListener('click', function () {
      State.bandingkanIdx = soal.length;
      saveState();
      renderBandingkanSummary(container);
    });
}

function renderBandingkanSummary(container) {
  var soal = DATA.bandingkan.soal;
  var exercises = State.bandingkanExercises;
  var correctCount = exercises.filter(function (e) {
    return e.correct;
  }).length;
  var total = soal.length;
  var pct = Math.round((correctCount / total) * 100);

  container.innerHTML =
    '<section aria-label="Ringkasan Bandingkan">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 4 — RINGKASAN BANDINGKAN</span>' +
    '</div>' +
    '<div class="panel">' +
    buildFeedbackBox(
      correctCount === total
        ? 'success'
        : correctCount >= Math.ceil(total * 0.6)
        ? 'info'
        : 'warning',
      correctCount === total ? '🎉' : '📊',
      '<strong>' +
        correctCount +
        ' dari ' +
        total +
        ' perbandingan tepat (' +
        pct +
        '%)</strong>' +
        (correctCount < total
          ? '<br>Ingat: untuk membandingkan, ubah ke desimal dulu, lalu bandingkan digit per digit.'
          : '<br>Kamu berhasil membandingkan bilangan rasional dalam berbagai representasi!')
    ) +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-5);">' +
    '<button type="button" class="btn btn--ghost" id="retryAllBandingkanBtn">↩ Ulangi Semua</button>' +
    '<button type="button" class="btn btn--primary" id="nextFromBandingkanBtn">Lanjut ke Urutkan →</button>' +
    '</div></div></section>';

  document.getElementById('retryAllBandingkanBtn').addEventListener('click', function () {
    State.bandingkanIdx = 0;
    State.bandingkanExercises = DATA.bandingkan.soal.map(function () {
      return { attempts: 0, correct: false, chosen: null, checked: false };
    });
    saveState();
    renderBandingkan(container);
  });

  document.getElementById('nextFromBandingkanBtn').addEventListener('click', function () {
    completeStage('bandingkan');
    navigateTo('urutkan');
  });
}
