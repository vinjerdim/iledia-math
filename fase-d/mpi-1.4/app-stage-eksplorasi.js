'use strict';

/* ============================================================
   app-stage-eksplorasi.js — Stage: Eksplorasi
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

/* ============================================================
   7. STAGE: EKSPLORASI
   ============================================================ */

function countExplored() {
  return Object.values(State.explorationData).filter(function (d) {
    return d.shown;
  }).length;
}

function renderEksplorasi(container) {
  var fracs = DATA.eksplorasi.fractions;
  var explored = countExplored();
  var minReq = DATA.eksplorasi.minRequired;
  var canProceed = explored >= minReq;
  var selected = State.explorationSelected;

  /* Build fraction cards */
  var cards = fracs
    .map(function (f) {
      var isSelected = selected === f.id;
      var isExplored = State.explorationData[f.id] && State.explorationData[f.id].shown;
      var cls =
        'frac-card' + (isSelected ? ' is-selected' : '') + (isExplored ? ' is-explored' : '');
      return (
        '<button type="button" class="' +
        cls +
        '" data-frac="' +
        f.id +
        '" aria-pressed="' +
        isSelected +
        '">' +
        buildFracBlock(f.num, f.den, null, 'large') +
        '<span class="frac-card__label">' +
        f.num +
        '/' +
        f.den +
        '</span>' +
        '</button>'
      );
    })
    .join('');

  /* Build detail panel */
  var detailHTML = '';
  if (selected) {
    var frac = fracs.find(function (f) {
      return f.id === selected;
    });
    var data = State.explorationData[selected] || { attempts: 0, shown: false };
    var fracVal = frac.num / frac.den;
    var isRepeat = !isTerminating(frac.num, frac.den);
    var decDisplay = isRepeat ? formatDecShort(fracVal) + '...' : formatDecShort(fracVal);

    var visualHTML =
      '<div class="explore-visual">' +
      '<div class="explore-visual__title">Model Area — ' +
      frac.num +
      '/' +
      frac.den +
      '</div>' +
      '<div class="explore-fraction-hero">' +
      buildFracBlock(frac.num, frac.den, null, 'hero') +
      '</div>' +
      '<div class="area-model-wrap">' +
      buildAreaModel(frac.num, frac.den) +
      '</div>' +
      '<p class="area-model__caption">' +
      frac.num +
      ' dari ' +
      frac.den +
      ' bagian diarsir</p>' +
      '</div>';

    var predictHTML = '';
    if (!data.shown) {
      var hint1HTML =
        data.attempts >= 1
          ? '<div class="hint-box"><span class="hint-box__label">💡 Petunjuk:</span>' +
            esc(frac.hint) +
            '</div>'
          : '';
      predictHTML =
        '<div class="predict-form">' +
        '<h4>Prediksi Nilai Desimalnya</h4>' +
        '<p style="font-size:0.88rem;color:var(--color-ink-muted);">Sebelum melihat hasilnya, ketikkan prediksimu. Gunakan koma (,) sebagai tanda desimal.</p>' +
        '<div class="field-group">' +
        '<label for="predictInput">Nilai desimal dari ' +
        frac.num +
        '/' +
        frac.den +
        ' =</label>' +
        '<div class="decimal-input-wrap">' +
        '<input type="text" inputmode="decimal" id="predictInput" class="input-text" placeholder="0,..." aria-describedby="predictErr">' +
        '<button type="button" class="btn btn--primary" id="checkPredictBtn">Periksa</button>' +
        '</div>' +
        '<div class="field-error" id="predictErr"></div>' +
        '</div>' +
        hint1HTML +
        (data.attempts >= 2
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              'info',
              'ℹ️',
              '<strong>Bantuan:</strong> ' +
                frac.num +
                ' ÷ ' +
                frac.den +
                ' = <strong>' +
                esc(decDisplay) +
                '</strong>. Coba ketikkan nilai ini.'
            ) +
            '</div>'
          : '') +
        '<div id="predictFeedback" style="margin-top:var(--space-3);"></div>' +
        '</div>';
    } else {
      /* Sudah diungkap — tampilkan hasilnya */
      predictHTML =
        '<div class="predict-form">' +
        '<div class="explore-revealed">' +
        '<div class="explore-revealed__answer">' +
        buildFracBlock(frac.num, frac.den, null, 'large') +
        '<span style="font-size:1.5rem;color:var(--color-ink-muted);">=</span>' +
        '<span class="decimal-display--hero" style="color:var(--color-primary-strong);">' +
        esc(decDisplay) +
        '</span>' +
        '</div>' +
        '<div class="area-model-wrap">' +
        buildDecimalBar(fracVal) +
        '</div>' +
        buildFeedbackBox(
          'info',
          '📘',
          '<strong>' +
            frac.num +
            ' ÷ ' +
            frac.den +
            ' = ' +
            esc(decDisplay) +
            '</strong><br>' +
            esc(frac.explanation) +
            (isRepeat
              ? '<br><em>Catatan: Ini adalah desimal berulang yang tidak pernah berhenti.</em>'
              : '')
        ) +
        '</div></div>';
    }

    detailHTML =
      '<div class="panel" id="exploreDetail">' +
      '<div class="explore-panel">' +
      visualHTML +
      predictHTML +
      '</div></div>';
  }

  container.innerHTML =
    '<section aria-label="Eksplorasi Pecahan dan Desimal">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 2 — EKSPLORASI</span>' +
    '<p class="stage-head__goal">Tujuan: Menjelajahi hubungan antara pecahan, model visual, dan nilai desimal.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>' +
    esc(DATA.eksplorasi.title) +
    '</h3>' +
    '<p style="font-size:0.9rem;color:var(--color-ink-muted);">' +
    esc(DATA.eksplorasi.instruction) +
    '</p>' +
    '<div class="explore-progress" style="margin-bottom:var(--space-3);">' +
    '<span>Dieksplorasi:</span>' +
    '<span class="explore-progress__count" id="exploredCount">' +
    explored +
    ' dari ' +
    fracs.length +
    '</span>' +
    '<span>pecahan</span>' +
    (canProceed
      ? ' <span style="color:var(--color-success-strong);font-weight:600;">✓ Siap lanjut!</span>'
      : ' <span style="font-size:0.8rem;">(minimal ' + minReq + ')</span>') +
    '</div>' +
    '<div class="frac-grid" id="fracGrid">' +
    cards +
    '</div>' +
    '</div>' +
    detailHTML +
    '<div class="btn-group btn-group--spread">' +
    '<button type="button" class="btn btn--ghost" id="resetExploreBtn">↩ Reset Eksplorasi</button>' +
    '<button type="button" class="btn btn--primary" id="nextExploreBtn" ' +
    (canProceed ? '' : 'disabled') +
    '>' +
    'Lanjut ke Konversi →</button>' +
    '</div>' +
    '</section>';

  /* Events: pilih kartu pecahan */
  container.querySelectorAll('.frac-card').forEach(function (card) {
    card.addEventListener('click', function () {
      State.explorationSelected = card.dataset.frac;
      saveState();
      renderEksplorasi(container);
      /* Scroll ke detail */
      var detail = document.getElementById('exploreDetail');
      if (detail) detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* Event: periksa prediksi */
  var checkBtn = document.getElementById('checkPredictBtn');
  if (checkBtn) {
    var input = document.getElementById('predictInput');
    var errEl = document.getElementById('predictErr');
    var feedbackEl = document.getElementById('predictFeedback');
    var frac = fracs.find(function (f) {
      return f.id === selected;
    });

    if (input)
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (checkBtn) checkBtn.click();
        }
      });

    checkBtn.addEventListener('click', function () {
      if (!frac) return;
      errEl.textContent = '';
      var parsed = parseInputDecimal(input.value);
      if (parsed.error === 'empty') {
        errEl.textContent = 'Ketikkan nilai desimalmu terlebih dahulu.';
        input.classList.add('has-error');
        input.focus();
        return;
      }
      if (parsed.error === 'invalid') {
        errEl.textContent = 'Format tidak valid. Gunakan angka dan koma. Contoh: 0,5';
        input.classList.add('has-error');
        input.focus();
        return;
      }
      input.classList.remove('has-error');

      var fracVal = frac.num / frac.den;
      var tol = isTerminating(frac.num, frac.den) ? 0.001 : 0.005;
      var correct = checkDecimalAnswer(parsed.value, fracVal, tol);

      var dataEntry = State.explorationData[selected] || { attempts: 0, shown: false };
      dataEntry.attempts += 1;
      State.explorationData[selected] = dataEntry;

      if (correct) {
        dataEntry.shown = true;
        saveState();
        renderEksplorasi(container);
      } else {
        if (dataEntry.attempts >= 2) {
          dataEntry.shown = true;
          saveState();
          feedbackEl.innerHTML = buildFeedbackBox(
            'warning',
            '⚠️',
            'Jawaban kurang tepat. Nilai yang benar adalah <strong>' +
              esc(formatDecShort(fracVal)) +
              (isTerminating(frac.num, frac.den) ? '' : '...') +
              '</strong>. Perhatikan penjelasan di bawah ini.'
          );
          /* Tunda render untuk tampilkan feedback sebentar */
          setTimeout(function () {
            renderEksplorasi(container);
          }, 1200);
        } else {
          saveState();
          feedbackEl.innerHTML = buildFeedbackBox(
            'error',
            '✗',
            'Belum tepat. Periksa kembali — perhatikan petunjuk yang muncul di bawah ini.'
          );
          /* Re-render untuk tampilkan petunjuk */
          setTimeout(function () {
            renderEksplorasi(container);
          }, 800);
        }
      }
    });
  }

  /* Events: reset & lanjut */
  var resetBtn = document.getElementById('resetExploreBtn');
  if (resetBtn)
    resetBtn.addEventListener('click', function () {
      State.explorationData = {};
      State.explorationSelected = null;
      DATA.eksplorasi.fractions.forEach(function (f) {
        State.explorationData[f.id] = { attempts: 0, shown: false };
      });
      saveState();
      renderEksplorasi(container);
    });

  var nextBtn = document.getElementById('nextExploreBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      completeStage('eksplorasi');
      navigateTo('konversi');
    });
}
