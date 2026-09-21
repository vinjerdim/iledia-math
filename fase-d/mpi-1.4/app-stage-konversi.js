'use strict';

/* ============================================================
   app-stage-konversi.js — Stage: Konversi
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

/* ============================================================
   8. STAGE: KONVERSI
   ============================================================ */

function renderKonversi(container) {
  var soal = DATA.konversi.soal;
  var idx = State.konversiIdx;
  var allDone = State.konversiExercises.every(function (e) {
    return e.correct || e.revealed;
  });

  if (allDone || idx >= soal.length) {
    renderKonversiSummary(container);
    return;
  }

  /* Clamp idx */
  if (idx >= soal.length) idx = soal.length - 1;

  var s = soal[idx];
  var ex = State.konversiExercises[idx] || {
    attempts: 0,
    hintLevel: 0,
    correct: false,
    userInput: '',
    revealed: false,
  };
  var done = ex.correct || ex.revealed;

  /* Status setiap soal */
  var statuses = State.konversiExercises.map(function (e) {
    if (e.correct) return 'correct';
    if (e.revealed && !e.correct) return 'incorrect';
    return '';
  });

  /* Area model (tampil kecil di samping soal) */
  var areaModel = buildAreaModel(s.num, s.den, 'small');

  /* Feedback HTML */
  var feedbackHTML = '';
  if (ex.hintLevel >= 1 && !done) {
    feedbackHTML +=
      '<div class="hint-box"><span class="hint-box__label">💡 Petunjuk ' +
      ex.hintLevel +
      ':</span>' +
      esc(s.hints[ex.hintLevel - 1]) +
      '</div>';
  }
  if (done) {
    if (ex.correct) {
      feedbackHTML = buildFeedbackBox(
        'success',
        '✓',
        '<strong>Tepat!</strong> ' +
          s.num +
          '/' +
          s.den +
          ' = ' +
          esc(s.display) +
          '<br>' +
          s.explanation
      );
    } else {
      feedbackHTML = buildFeedbackBox(
        'warning',
        '📘',
        '<strong>Jawaban:</strong> ' +
          s.num +
          '/' +
          s.den +
          ' = <strong>' +
          esc(s.display) +
          '</strong><br>' +
          s.explanation +
          (s.terminating === false
            ? '<br><em>Catatan: 1/3 menghasilkan desimal berulang (0,333...). Ini bukan kesalahan — memang sifat pecahannya.</em>'
            : '')
      );
    }
  }

  var isRepeat = !s.terminating;
  var placeholderText = isRepeat ? '0,333...' : '0,...';

  container.innerHTML =
    '<section aria-label="Konversi Pecahan ke Desimal">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 3 — KONVERSI</span>' +
    '<p class="stage-head__goal">Tujuan: Mengubah pecahan menjadi desimal menggunakan strategi yang tepat.</p>' +
    '</div>' +
    '<div class="panel">' +
    buildProgressDots(soal.length, idx, statuses) +
    '<h3 style="margin-bottom:var(--space-1);">Ubah pecahan berikut ke bentuk desimal</h3>' +
    '<p style="font-size:0.85rem;color:var(--color-ink-muted);">Gunakan koma (,) sebagai tanda desimal. Contoh: 0,5</p>' +
    '<div class="konversi-display">' +
    '<div class="konversi-frac-hero">' +
    buildFracBlock(s.num, s.den, null, 'hero') +
    '</div>' +
    '<div class="konversi-visual">' +
    '<div class="area-model-wrap">' +
    areaModel +
    '</div>' +
    '<div class="area-model-wrap" style="margin-top:var(--space-2);">' +
    buildDecimalBar(s.num / s.den) +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="konversi-answer-row">' +
    '<label for="konversiInput" style="font-weight:600;font-size:0.9rem;">= </label>' +
    '<input type="text" inputmode="decimal" id="konversiInput" class="input-text" ' +
    'placeholder="' +
    esc(placeholderText) +
    '" ' +
    'value="' +
    esc(ex.userInput) +
    '" ' +
    (done ? 'disabled' : '') +
    ' aria-describedby="konversiErr" aria-label="Masukkan nilai desimal untuk ' +
    s.num +
    '/' +
    s.den +
    '">' +
    '</div>' +
    '<div class="field-error" id="konversiErr"></div>' +
    feedbackHTML +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-5);">' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">' +
    '<button type="button" class="btn btn--ghost" id="prevKonversiBtn" ' +
    (idx === 0 ? 'disabled' : '') +
    '>← Sebelumnya</button>' +
    (!done
      ? '<button type="button" class="btn btn--ghost btn--small" id="hintKonversiBtn" ' +
        (ex.hintLevel >= s.hints.length ? 'disabled' : '') +
        '>💡 Petunjuk</button>'
      : '') +
    '</div>' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">' +
    (!done
      ? '<button type="button" class="btn btn--primary" id="checkKonversiBtn">Periksa Jawaban</button>'
      : idx < soal.length - 1
      ? '<button type="button" class="btn btn--primary" id="nextKonversiBtn">Lanjut →</button>'
      : '<button type="button" class="btn btn--primary" id="summaryKonversiBtn">Lihat Ringkasan →</button>') +
    '</div>' +
    '</div>' +
    '</div>' +
    '</section>';

  /* Focus input jika belum selesai */
  if (!done) {
    var inp = document.getElementById('konversiInput');
    if (inp)
      setTimeout(function () {
        inp.focus();
      }, 50);
  }

  /* Events */
  var input = document.getElementById('konversiInput');
  if (input)
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var ckBtn = document.getElementById('checkKonversiBtn');
        if (ckBtn && !ckBtn.disabled) ckBtn.click();
      }
    });

  var checkBtn = document.getElementById('checkKonversiBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      checkKonversiAnswer(container, idx);
    });

  var hintBtn = document.getElementById('hintKonversiBtn');
  if (hintBtn)
    hintBtn.addEventListener('click', function () {
      var ex2 = State.konversiExercises[idx];
      if (ex2.hintLevel < s.hints.length) {
        ex2.hintLevel += 1;
        saveState();
        renderKonversi(container);
      }
    });

  var prevBtn = document.getElementById('prevKonversiBtn');
  if (prevBtn)
    prevBtn.addEventListener('click', function () {
      State.konversiIdx = Math.max(0, idx - 1);
      saveState();
      renderKonversi(container);
    });

  var nextBtn2 = document.getElementById('nextKonversiBtn');
  if (nextBtn2)
    nextBtn2.addEventListener('click', function () {
      State.konversiIdx = Math.min(soal.length - 1, idx + 1);
      saveState();
      renderKonversi(container);
    });

  var summaryBtn = document.getElementById('summaryKonversiBtn');
  if (summaryBtn)
    summaryBtn.addEventListener('click', function () {
      State.konversiIdx = soal.length;
      saveState();
      renderKonversi(container);
    });
}

function checkKonversiAnswer(container, idx) {
  var s = DATA.konversi.soal[idx];
  var ex = State.konversiExercises[idx];
  var input = document.getElementById('konversiInput');
  var errEl = document.getElementById('konversiErr');
  if (!input || !errEl) return;

  errEl.textContent = '';
  input.classList.remove('has-error');

  /* Validasi input */
  if (!input.value.trim()) {
    errEl.textContent = 'Ketikkan jawabanmu terlebih dahulu.';
    input.classList.add('has-error');
    input.focus();
    return;
  }

  var parsed = parseInputDecimal(input.value);
  if (parsed.error) {
    errEl.textContent = 'Format tidak valid. Gunakan angka dan koma. Contoh: 0,75';
    input.classList.add('has-error');
    input.focus();
    return;
  }

  ex.userInput = input.value;
  ex.attempts += 1;

  var tol = s.tolerance || (s.terminating ? 0.001 : 0.005);
  var correct = checkDecimalAnswer(parsed.value, s.correct, tol);

  if (correct) {
    ex.correct = true;
    /* Auto-advance ke soal berikutnya setelah sebentar, atau tampilkan di sini */
    saveState();
    renderKonversi(container);
  } else {
    /* Jika sudah 3x salah, ungkap jawaban */
    if (ex.attempts >= 3) {
      ex.revealed = true;
      saveState();
      renderKonversi(container);
    } else {
      /* Naikan hint level secara otomatis jika belum maks */
      if (ex.hintLevel < s.hints.length) {
        ex.hintLevel = Math.min(ex.hintLevel + 1, s.hints.length);
      }
      saveState();
      renderKonversi(container);
    }
  }
}

function renderKonversiSummary(container) {
  var soal = DATA.konversi.soal;
  var exercises = State.konversiExercises;
  var correctCount = exercises.filter(function (e) {
    return e.correct;
  }).length;
  var total = soal.length;
  var pct = Math.round((correctCount / total) * 100);
  var allCorrect = correctCount === total;

  var rows = soal
    .map(function (s, i) {
      var ex = exercises[i];
      var status = ex.correct ? '✓' : '✗';
      var statusCls = ex.correct
        ? 'color:var(--color-success-strong)'
        : 'color:var(--color-error-strong)';
      return (
        '<tr>' +
        '<td>' +
        s.num +
        '/' +
        s.den +
        '</td>' +
        '<td>' +
        esc(s.display) +
        '</td>' +
        '<td style="' +
        statusCls +
        ';font-weight:600;">' +
        status +
        '</td>' +
        '</tr>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Ringkasan Konversi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 3 — RINGKASAN KONVERSI</span>' +
    '</div>' +
    '<div class="panel">' +
    buildFeedbackBox(
      allCorrect ? 'success' : correctCount >= Math.ceil(total * 0.7) ? 'info' : 'warning',
      allCorrect ? '🎉' : '📊',
      '<strong>' +
        correctCount +
        ' dari ' +
        total +
        ' soal dijawab benar (' +
        pct +
        '%)</strong>' +
        (allCorrect
          ? '<br>Semua konversi tepat! Kamu menguasai strategi konversi pecahan ke desimal.'
          : '<br>Periksa kembali soal yang belum tepat di bawah. Strategi: ingat bahwa pecahan = pembilang ÷ penyebut.')
    ) +
    '<div style="overflow-x:auto;margin-top:var(--space-4);">' +
    '<table style="width:100%;border-collapse:collapse;font-size:0.9rem;">' +
    '<thead><tr style="background:var(--color-bg-grid);">' +
    '<th style="padding:var(--space-2) var(--space-3);text-align:left;border:1px solid var(--color-border);">Pecahan</th>' +
    '<th style="padding:var(--space-2) var(--space-3);text-align:left;border:1px solid var(--color-border);">Desimal</th>' +
    '<th style="padding:var(--space-2) var(--space-3);text-align:center;border:1px solid var(--color-border);">Status</th>' +
    '</tr></thead>' +
    '<tbody>' +
    rows +
    '</tbody>' +
    '</table></div>' +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-5);">' +
    '<button type="button" class="btn btn--ghost" id="retryKonversiBtn">↩ Coba Lagi dari Awal</button>' +
    '<button type="button" class="btn btn--primary" id="nextFromKonversiBtn">Lanjut ke Bandingkan →</button>' +
    '</div></div></section>';

  document.getElementById('retryKonversiBtn').addEventListener('click', function () {
    State.konversiIdx = 0;
    State.konversiExercises = DATA.konversi.soal.map(function () {
      return { attempts: 0, hintLevel: 0, correct: false, userInput: '', revealed: false };
    });
    saveState();
    renderKonversi(container);
  });

  document.getElementById('nextFromKonversiBtn').addEventListener('click', function () {
    completeStage('konversi');
    navigateTo('bandingkan');
  });
}
