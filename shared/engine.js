'use strict';

/* ============================================================
   engine.js — Utilitas bersama untuk semua media pembelajaran MPI

   Dimuat sebagai <script> biasa (tanpa module bundler), sebelum
   data.js dan app.js pada setiap modul. Semua fungsi diekspos
   sebagai global, sehingga app.js masing-masing modul dapat
   memanggilnya langsung tanpa perubahan pada kode stage-render.

   Bagian:
    1. Utilitas Teks, Input & Format Angka
    2. Notifikasi (Toast)
    3. Utilitas Render
    4. Mesin Navigasi Tahap
    5. Tahap Latihan Soal (isian numerik & pilihan ganda)
    6. State Persistence
   ============================================================ */

/* ============================================================
   1. UTILITAS TEKS & INPUT
   ============================================================ */

/*
 * stripPunctuation: saat true, tanda titik dan koma (pemisah ribuan pada
 * beberapa soal, mis. nominal uang) turut dibuang selain spasi.
 */
function parseInputInt(str, stripPunctuation) {
  if (!str || str.trim() === '') return { value: null, error: 'empty' };
  var pattern = stripPunctuation ? /[\s.,]/g : /\s/g;
  var trimmed = str.trim().replace(pattern, '');
  if (!/^-?\d+$/.test(trimmed)) return { value: null, error: 'invalid' };
  var v = parseInt(trimmed, 10);
  if (isNaN(v)) return { value: null, error: 'invalid' };
  return { value: v, error: null };
}

/*
 * Melengkapi parseInputInt untuk kolom yang boleh berisi pecahan desimal
 * (mis. suku bunga 1,5%). Koma maupun titik diterima sebagai pemisah
 * desimal, bentuk ".5" tanpa angka depan juga diterima, dan bentuk
 * kembaliannya sama seperti parseInputInt: { value, error }.
 */
function parseInputDecimal(str) {
  if (!str || String(str).trim() === '') return { value: null, error: 'empty' };
  var normalized = String(str).trim().replace(/\s/g, '');
  /* Tolak bila ada lebih dari satu pemisah, mis. "1.2.3" atau "1,2,3". */
  var separators = (normalized.match(/[.,]/g) || []).length;
  if (separators > 1) return { value: null, error: 'invalid' };
  normalized = normalized.replace(',', '.');
  if (!/^-?\d*\.?\d+$/.test(normalized)) return { value: null, error: 'invalid' };
  var v = parseFloat(normalized);
  if (isNaN(v)) return { value: null, error: 'invalid' };
  return { value: v, error: null };
}

/* Membandingkan dua bilangan pecahan dengan toleransi, untuk memeriksa
   jawaban desimal tanpa terjebak galat pembulatan biner. */
function hampirSama(a, b) {
  return Math.abs(a - b) < 0.0001;
}

/*
 * Menulis bilangan bulat dengan pemisah ribuan bergaya Indonesia
 * (1234567 -> "1.234.567"). Satu-satunya pemformat untuk semua modul.
 *
 * minusSign opsional, default '-'. Modul bilangan bulat (fase-d/mpi-1.3)
 * memakai lambang minus tipografis '−' (U+2212).
 *
 * Nilai pecahan dibulatkan lebih dulu: seluruh pemanggil di repo ini
 * mengirim bilangan bulat, dan tanpa pembulatan loop pengelompokan di
 * bawah akan merusak pecahan ("1234.5" menjadi "123.4.5").
 */
function formatNumber(n, minusSign) {
  var str = String(Math.round(n));
  var sign = '';
  if (str.charAt(0) === '-') {
    sign = minusSign || '-';
    str = str.slice(1);
  }
  var parts = [];
  while (str.length > 3) {
    parts.unshift(str.slice(str.length - 3));
    str = str.slice(0, str.length - 3);
  }
  if (str) parts.unshift(str);
  return sign + parts.join('.');
}

/* Menulis bilangan desimal dengan koma, gaya Indonesia (1.5 -> "1,5"). */
function formatDesimal(n, maksDesimal) {
  var digits = typeof maksDesimal === 'number' ? maksDesimal : 2;
  var faktor = Math.pow(10, digits);
  return String(Math.round(n * faktor) / faktor).replace('.', ',');
}

function esc(str) {
  var m = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(str).replace(/[&<>"']/g, function (ch) {
    return m[ch];
  });
}

/* ============================================================
   2. NOTIFIKASI (TOAST)
   ============================================================ */

var noticeTimer = null;

function showNotice(msg, elementId) {
  var el = document.getElementById(elementId || 'appNotice');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-visible');
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(function () {
    el.classList.remove('is-visible');
  }, 3000);
}

/* ============================================================
   3. UTILITAS RENDER
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

/* Build an SVG number line from min to max, with a point at value */
function buildNumberLineSVG(value, min, max) {
  var W = 600;
  var H = 80;
  var padX = 40;
  var axisY = 40;
  var tickH = 10;
  var majorH = 16;

  function xOf(v) {
    return padX + ((v - min) / (max - min)) * (W - 2 * padX);
  }

  var ticks = '';
  var labels = '';
  for (var v = min; v <= max; v++) {
    var x = xOf(v);
    var isMajor = v % 5 === 0;
    var h = isMajor ? majorH : tickH;
    ticks +=
      '<line class="nl-tick' +
      (isMajor ? ' nl-tick--major' : '') +
      '" x1="' +
      x +
      '" y1="' +
      (axisY - h / 2) +
      '" x2="' +
      x +
      '" y2="' +
      (axisY + h / 2) +
      '"/>';
    if (isMajor || v === 0) {
      var lCls = v === 0 ? 'nl-label nl-label--zero' : 'nl-label';
      labels +=
        '<text class="' + lCls + '" x="' + x + '" y="' + (axisY + h / 2 + 4) + '">' + v + '</text>';
    }
  }

  var px = xOf(value);
  var point = '<circle class="nl-point" cx="' + px + '" cy="' + axisY + '" r="8"/>';
  var isNeg = value < 0;
  var ptLabel =
    '<text class="nl-point-label" x="' +
    px +
    '" y="' +
    (axisY - 14) +
    '">' +
    (isNeg ? value : '+' + value === '+0' ? '0' : value) +
    '</text>';

  var arrowL = padX - 10;
  var arrowR = W - padX + 10;
  var arrowHead =
    '<polygon class="nl-arrow" points="' +
    arrowR +
    ',' +
    axisY +
    ' ' +
    (arrowR - 8) +
    ',' +
    (axisY - 4) +
    ' ' +
    (arrowR - 8) +
    ',' +
    (axisY + 4) +
    '"/>' +
    '<polygon class="nl-arrow" points="' +
    arrowL +
    ',' +
    axisY +
    ' ' +
    (arrowL + 8) +
    ',' +
    (axisY - 4) +
    ' ' +
    (arrowL + 8) +
    ',' +
    (axisY + 4) +
    '"/>';

  return (
    '<svg class="numberline-svg" viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" xmlns="http://www.w3.org/2000/svg" aria-label="Garis bilangan dari ' +
    min +
    ' hingga ' +
    max +
    '">' +
    '<line class="nl-axis" x1="' +
    (padX - 10) +
    '" y1="' +
    axisY +
    '" x2="' +
    (W - padX + 10) +
    '" y2="' +
    axisY +
    '"/>' +
    ticks +
    labels +
    point +
    ptLabel +
    arrowHead +
    '</svg>'
  );
}

/* ============================================================
   4. MESIN NAVIGASI TAHAP
   ============================================================ */

/*
 * Membuat mesin navigasi tahap yang dipakai bersama oleh setiap modul MPI.
 * opts:
 *   stages          array id tahap, urut (wajib)
 *   stageLabels     array label tahap, sejajar dengan `stages` (wajib)
 *   state           objek State milik modul (wajib, dimutasi langsung)
 *   save            function() — menyimpan State (wajib, mis. saveState)
 *   render          function() — merender tahap aktif (wajib, mis. renderCurrentStage)
 *   notice          function(msg) — menampilkan notifikasi (opsional, default showNotice)
 *   listId          id elemen <ol> daftar navigasi (opsional, default 'stageNavList')
 *   progressFillId  id elemen fill progress bar (opsional, default 'progressFill')
 *   progressLabelId id elemen label progress bar (opsional, default 'progressLabel')
 *
 * Mengembalikan { navigateTo, completeStage, updateStageNav, buildStageNav, updateProgress }.
 */
function createStageMachine(opts) {
  var stages = opts.stages;
  var stageLabels = opts.stageLabels;
  var state = opts.state;
  var save = opts.save;
  var render = opts.render;
  var notice = opts.notice || showNotice;
  var listId = opts.listId || 'stageNavList';
  var progressFillId = opts.progressFillId || 'progressFill';
  var progressLabelId = opts.progressLabelId || 'progressLabel';

  function navigateTo(stageId) {
    var targetIdx = stages.indexOf(stageId);
    var currentIdx = stages.indexOf(state.currentStage);
    if (targetIdx === -1) return;

    if (targetIdx > currentIdx) {
      for (var i = currentIdx; i < targetIdx; i++) {
        if (!state.completedStages[stages[i]]) {
          notice('Selesaikan tahap "' + stageLabels[i] + '" terlebih dahulu.');
          return;
        }
      }
    }

    state.currentStage = stageId;
    save();
    updateStageNav();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function completeStage(stageId) {
    state.completedStages[stageId] = true;
    save();
    updateStageNav();
    updateProgress();
  }

  function updateStageNav() {
    var items = document.querySelectorAll('.stage-nav__item[data-stage]');
    var currentIdx = stages.indexOf(state.currentStage);
    items.forEach(function (item) {
      var sid = item.dataset.stage;
      var idx = stages.indexOf(sid);
      item.removeAttribute('aria-current');
      item.classList.remove('is-complete');
      item.disabled = false;
      if (sid === state.currentStage) item.setAttribute('aria-current', 'step');
      else if (state.completedStages[sid]) item.classList.add('is-complete');
      if (idx > currentIdx && !state.completedStages[stages[idx - 1]]) item.disabled = true;
    });
  }

  function buildStageNav() {
    var list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = stages
      .map(function (sid, i) {
        return (
          '<li>' +
          '<button type="button" class="stage-nav__item" data-stage="' +
          sid +
          '">' +
          '<span class="stage-nav__num">' +
          (i + 1) +
          '</span>' +
          esc(stageLabels[i]) +
          '</button></li>'
        );
      })
      .join('');
    list.querySelectorAll('.stage-nav__item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        navigateTo(btn.dataset.stage);
      });
    });
    updateStageNav();
  }

  function updateProgress() {
    var total = stages.length;
    var done = Object.keys(state.completedStages).length;
    var pct = Math.round((done / total) * 100);
    var fill = document.getElementById(progressFillId);
    var label = document.getElementById(progressLabelId);
    if (fill) {
      fill.style.width = pct + '%';
      fill.parentElement.setAttribute('aria-valuenow', pct);
    }
    if (label) label.textContent = done + ' dari ' + total + ' tahap selesai';
  }

  return {
    navigateTo: navigateTo,
    completeStage: completeStage,
    updateStageNav: updateStageNav,
    buildStageNav: buildStageNav,
    updateProgress: updateProgress,
  };
}

/* ============================================================
   5. TAHAP LATIHAN SOAL
   ============================================================ */

/*
 * Membuat satu tahap latihan soal — pola yang berulang di hampir semua
 * modul MPI. Menangani state per-soal, progress dots, kotak umpan balik,
 * alur petunjuk → jawaban, serta tombol Soal Berikutnya / Lanjut. Bagian
 * yang unik per soal (visualisasi/cerita/pertanyaan) datang dari
 * `renderPrompt`.
 *
 * Dua tipe soal didukung dan BOLEH BERCAMPUR dalam satu tahap, karena
 * tipenya dibaca per soal dari `s.type`:
 *   'input'  — ketik sebuah bilangan, lalu periksa (boleh berkali-kali)
 *   'choice' — pilihan ganda sekali-pilih
 *
 * cfg (umum):
 *   soal                   array soal dari DATA (tidak pernah diganti, aman direferensikan)
 *   getExercises()         array state per-soal saat ini (State) — HARUS berupa
 *                          function, karena initExerciseArrays()/loadState()
 *                          mengganti (bukan memutasi) array ini
 *   getIndex, setIndex     accessor indeks soal aktif (mis. field di State)
 *   save                   function() — simpan State
 *   renderPrompt(s)        HTML unik untuk soal (visual/cerita/pertanyaan)
 *   idPrefix               awalan id elemen DOM (mis. 'gb' → gbInput, gbCheckBtn, ...)
 *   sectionLabel, kicker, goal, instruction   teks kepala tahap
 *   nextStageId, completeStageId, nextButtonLabel   tujuan setelah semua soal selesai
 *   defaultType            (opsional) tipe untuk soal tanpa `s.type`, default 'input'
 *   buildHead()            (opsional) mengganti markup kepala tahap seluruhnya —
 *                          dipakai modul yang memakai penanda sendiri (mis. pbl-badge)
 *
 * cfg (khusus soal 'input'):
 *   checkValue(s)          nilai jawaban benar untuk soal s
 *   revealText(s)          HTML isi kotak "jawaban diungkap"
 *   wrapClass, inputRowClass   (opsional) default 'ex-exercise'/'ex-input-row'
 *   inputAriaLabel, inputPlaceholder   (opsional)
 *   inputSuffix(s)         (opsional) HTML tepat di samping kotak isian,
 *                          mis. satuan jawaban
 *   stripPunctuation       (opsional) diteruskan ke parseInputInt
 *   revealAfterAttempts    (opsional, default 2)
 *   revealButtonStyle      (opsional) 'combined' (default) — satu tombol Petunjuk
 *                          yang berubah menjadi pengungkap jawaban setelah
 *                          `revealAfterAttempts` percobaan; atau 'separate' —
 *                          tombol Petunjuk terpisah dari tombol "Lihat Jawaban"
 *                          yang baru muncul setelah `revealAfterAttempts` percobaan
 *   countAttemptOnInvalid  (opsional, default false) saat true, input kosong/tidak
 *                          valid tetap dihitung sebagai percobaan (dan disimpan)
 *   emptyMessage, invalidMessage   (opsional) pesan notice untuk input kosong/tidak valid
 *   showAttemptErrorWithHint  (opsional, default false) saat true, kotak "jawabanmu
 *                          belum tepat" tetap tampil berdampingan dengan petunjuk
 *
 * Petunjuk berjenjang: soal boleh memakai `s.hints` (array) alih-alih `s.hint`
 * (string tunggal). Tombol Petunjuk lalu membuka satu tingkat per klik dan
 * menampilkan jumlahnya, mis. "💡 Petunjuk (2/3)".
 *
 * cfg (khusus soal 'choice'):
 *   listClass              (opsional) class pembungkus daftar pilihan, default 'choice-list'
 *   letters                (opsional) label huruf pilihan, default ['A','B','C','D','E']
 *   choiceClassStyle       (opsional) 'modifier' (default) memancarkan
 *                          `choice-btn--correct` (kelas per-modul), atau 'state'
 *                          memancarkan `.is-correct` sesuai shared/base.css
 *   buildChoiceFeedback(s, ex)   (opsional) mengganti isi kotak umpan balik pilihan ganda
 *
 * Soal 'choice' wajib punya `.options` (array {id, label}) dan `.correct`
 * (id opsi yang benar). Mengembalikan { render(container) }.
 */
function createExerciseStage(cfg) {
  var soal = cfg.soal;
  var prefix = cfg.idPrefix;
  var wrapClass = cfg.wrapClass || 'ex-exercise';
  var inputRowClass = cfg.inputRowClass || 'ex-input-row';
  var listClass = cfg.listClass || 'choice-list';
  var letters = cfg.letters || ['A', 'B', 'C', 'D', 'E'];
  var revealAfter = cfg.revealAfterAttempts || 2;
  var revealStyle = cfg.revealButtonStyle || 'combined';
  var stateStyle = cfg.choiceClassStyle === 'state';
  var countAttemptOnInvalid = !!cfg.countAttemptOnInvalid;
  var emptyMessage = cfg.emptyMessage || 'Masukkan bilangan terlebih dahulu.';
  var invalidMessage =
    cfg.invalidMessage || 'Masukkan bilangan bulat yang valid (contoh: −3, 0, 7).';

  function typeOf(s) {
    return s.type || cfg.defaultType || 'input';
  }

  /* `s.hints` (berjenjang) maupun `s.hint` (tunggal) sama-sama diterima. */
  function hintsOf(s) {
    if (Array.isArray(s.hints)) return s.hints;
    return s.hint ? [s.hint] : [];
  }

  /* State lama menyimpan hintShown (boolean); yang baru hintLevel (angka). */
  function hintLevelOf(ex) {
    if (typeof ex.hintLevel === 'number') return ex.hintLevel;
    return ex.hintShown ? 1 : 0;
  }

  function setHintLevel(ex, level) {
    ex.hintLevel = level;
    ex.hintShown = level > 0;
  }

  function isAnswered(s, ex) {
    if (typeOf(s) === 'choice') return ex.chosen !== null && ex.chosen !== undefined;
    return !!(ex.correct || ex.revealed);
  }

  function statusOf(s, ex) {
    if (ex.correct) return 'correct';
    if (typeOf(s) === 'choice') {
      return ex.chosen !== null && ex.chosen !== undefined ? 'incorrect' : null;
    }
    return ex.attempts > 0 ? 'incorrect' : null;
  }

  function buildHead() {
    if (cfg.buildHead) return cfg.buildHead();
    return (
      '<div class="stage-head">' +
      '<span class="stage-head__kicker">' +
      esc(cfg.kicker) +
      '</span>' +
      '<p class="stage-head__goal">Tujuan: ' +
      esc(cfg.goal) +
      '</p>' +
      '</div>'
    );
  }

  function buildInputBody(s, ex) {
    var hints = hintsOf(s);
    var level = hintLevelOf(ex);

    var feedbackHTML = '';
    if (ex.correct) {
      feedbackHTML = buildFeedbackBox('success', '✓', '<strong>Tepat!</strong> ' + s.explanation);
    } else if (ex.revealed) {
      feedbackHTML = buildFeedbackBox('info', '👁', cfg.revealText(s));
    } else {
      var errorHTML =
        ex.attempts > 0
          ? buildFeedbackBox(
              'error',
              '✗',
              'Jawabanmu <strong>' +
                esc(ex.userInput) +
                '</strong> belum tepat. Coba lagi atau lihat petunjuk.'
            )
          : '';
      var hintHTML = hints
        .slice(0, level)
        .map(function (h, i) {
          var label = hints.length > 1 ? 'Petunjuk ' + (i + 1) : 'Petunjuk';
          return buildFeedbackBox('warning', '💡', '<strong>' + label + ':</strong> ' + h);
        })
        .join('');
      /* Default lama: petunjuk menggantikan kotak galat. */
      if (hintHTML && !cfg.showAttemptErrorWithHint) errorHTML = '';
      feedbackHTML = errorHTML + hintHTML;
    }

    var actionHTML = '';
    if (!ex.correct && !ex.revealed) {
      var revealBtnHTML = '';
      if (revealStyle === 'separate' && ex.attempts >= revealAfter) {
        revealBtnHTML =
          '<button type="button" class="btn btn--ghost btn--small" id="' +
          prefix +
          'RevealBtn">Lihat Jawaban</button>';
      }
      var hintLabel =
        hints.length > 1
          ? '💡 Petunjuk (' + Math.min(level + 1, hints.length) + '/' + hints.length + ')'
          : '💡 Petunjuk';
      var hintBtnHTML =
        hints.length > 1 && level >= hints.length
          ? ''
          : '<button type="button" class="btn btn--ghost btn--small" id="' +
            prefix +
            'HintBtn">' +
            hintLabel +
            '</button>';
      actionHTML =
        '<div class="' +
        inputRowClass +
        '">' +
        '<input type="text" inputmode="numeric" id="' +
        prefix +
        'Input" class="input-text" placeholder="' +
        esc(cfg.inputPlaceholder || '...') +
        '" aria-label="' +
        esc(cfg.inputAriaLabel || 'Jawaban') +
        '" value="' +
        esc(ex.userInput) +
        '">' +
        (cfg.inputSuffix ? cfg.inputSuffix(s) : '') +
        '<button type="button" class="btn btn--primary" id="' +
        prefix +
        'CheckBtn">Periksa</button>' +
        hintBtnHTML +
        revealBtnHTML +
        '</div>';
    }

    return (
      '<div class="' +
      wrapClass +
      '">' +
      cfg.renderPrompt(s) +
      actionHTML +
      (feedbackHTML ? '<div style="margin-top:var(--space-3);">' + feedbackHTML + '</div>' : '') +
      '</div>'
    );
  }

  function buildChoiceBody(s, ex) {
    var answered = ex.chosen !== null && ex.chosen !== undefined;

    var choicesHTML = s.options
      .map(function (opt, i) {
        var cls = 'choice-btn';
        if (answered) {
          if (opt.id === s.correct) cls += stateStyle ? ' is-correct' : ' choice-btn--correct';
          else if (opt.id === ex.chosen)
            cls += stateStyle ? ' is-incorrect' : ' choice-btn--incorrect';
          else if (!stateStyle) cls += ' choice-btn--disabled';
        }
        return (
          '<button type="button" class="' +
          cls +
          '" data-opt-id="' +
          esc(opt.id) +
          '"' +
          (answered && stateStyle ? ' disabled' : '') +
          '>' +
          '<span class="' +
          (stateStyle ? 'choice-btn__icon' : 'choice-letter') +
          '">' +
          letters[i] +
          '</span>' +
          opt.label +
          '</button>'
        );
      })
      .join('');

    var feedbackHTML = '';
    if (answered) {
      feedbackHTML = cfg.buildChoiceFeedback
        ? cfg.buildChoiceFeedback(s, ex)
        : ex.correct
          ? buildFeedbackBox('success', '✓', '<strong>Benar!</strong> ' + s.explanation)
          : buildFeedbackBox('error', '✗', '<strong>Belum tepat.</strong> ' + s.explanation);
    }

    return (
      cfg.renderPrompt(s) +
      '<div class="' +
      listClass +
      '" id="' +
      prefix +
      'Choices">' +
      choicesHTML +
      '</div>' +
      (feedbackHTML ? '<div style="margin-top:var(--space-3);">' + feedbackHTML + '</div>' : '')
    );
  }

  function render(container) {
    /* Dibaca ulang setiap render: initExerciseArrays()/loadState() mengganti
       (bukan memutasi) array ini, jadi tidak boleh disimpan di closure. */
    var exArr = cfg.getExercises();
    var idx = cfg.getIndex();
    var s = soal[idx];
    var ex = exArr[idx];
    var isChoice = typeOf(s) === 'choice';

    var allDone =
      exArr.filter(function (e, i) {
        return isAnswered(soal[i], e);
      }).length === soal.length;

    var statuses = exArr.map(function (e, i) {
      return statusOf(soal[i], e);
    });

    var navHTML = '';
    if (isAnswered(s, ex)) {
      if (idx < soal.length - 1) {
        navHTML =
          '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="' +
          prefix +
          'NextBtn">Soal Berikutnya →</button></div>';
      } else if (allDone) {
        navHTML =
          '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary btn--large" id="' +
          prefix +
          'FinishBtn">' +
          esc(cfg.nextButtonLabel) +
          '</button></div>';
      }
    }

    container.innerHTML =
      '<section aria-label="' +
      esc(cfg.sectionLabel) +
      '">' +
      buildHead() +
      '<div class="panel">' +
      '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">' +
      esc(cfg.instruction) +
      '</p>' +
      buildProgressDots(soal.length, idx, statuses) +
      (isChoice ? buildChoiceBody(s, ex) : buildInputBody(s, ex)) +
      '</div>' +
      navHTML +
      '</section>';

    var inp = document.getElementById(prefix + 'Input');
    var checkBtn = document.getElementById(prefix + 'CheckBtn');
    var hintBtn = document.getElementById(prefix + 'HintBtn');
    var revealBtn = document.getElementById(prefix + 'RevealBtn');
    var nextBtn = document.getElementById(prefix + 'NextBtn');
    var finishBtn = document.getElementById(prefix + 'FinishBtn');

    if (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && checkBtn) checkBtn.click();
      });
    }

    if (checkBtn) {
      checkBtn.addEventListener('click', function () {
        if (!inp) return;
        var val = inp.value;
        var parsed = parseInputInt(val, cfg.stripPunctuation);
        if (parsed.error) {
          if (countAttemptOnInvalid) {
            ex.userInput = val;
            ex.attempts += 1;
            cfg.save();
          }
          showNotice(parsed.error === 'empty' ? emptyMessage : invalidMessage);
          return;
        }
        ex.userInput = val;
        ex.attempts += 1;
        ex.correct = parsed.value === cfg.checkValue(s);
        if (ex.correct) ex.checked = true;
        cfg.save();
        render(container);
      });
    }

    if (hintBtn) {
      hintBtn.addEventListener('click', function () {
        var hints = hintsOf(s);
        var level = hintLevelOf(ex);
        if (hints.length > 1) {
          setHintLevel(ex, Math.min(level + 1, hints.length));
        } else if (revealStyle === 'separate' || level === 0 || ex.attempts < revealAfter) {
          setHintLevel(ex, 1);
        } else {
          ex.revealed = true;
        }
        cfg.save();
        render(container);
      });
    }

    if (revealBtn) {
      revealBtn.addEventListener('click', function () {
        ex.revealed = true;
        cfg.save();
        render(container);
      });
    }

    container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (ex.chosen !== null && ex.chosen !== undefined) return;
        var optId = btn.dataset.optId;
        ex.chosen = optId;
        ex.attempts += 1;
        ex.correct = optId === s.correct;
        ex.checked = true;
        cfg.save();
        render(container);
      });
    });

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        cfg.setIndex(idx + 1);
        cfg.save();
        render(container);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (finishBtn) {
      finishBtn.addEventListener('click', function () {
        completeStage(cfg.completeStageId);
        navigateTo(cfg.nextStageId);
      });
    }
  }

  return { render: render };
}

/*
 * Pembungkus tipis createExerciseStage untuk tahap yang seluruh soalnya
 * berupa isian numerik. Dipertahankan agar pemanggil lama tidak berubah.
 */
function createNumericInputExercise(cfg) {
  return createExerciseStage(Object.assign({}, cfg, { defaultType: 'input' }));
}

/*
 * Pembungkus tipis createExerciseStage untuk tahap yang seluruh soalnya
 * berupa pilihan ganda. Dipertahankan agar pemanggil lama tidak berubah.
 */
function createMultipleChoiceExercise(cfg) {
  return createExerciseStage(Object.assign({}, cfg, { defaultType: 'choice' }));
}

/* ============================================================
   6. STATE PERSISTENCE
   ============================================================ */

/*
 * Membuat penyimpanan localStorage untuk objek State satu modul — pola
 * saveState/loadState/clearState yang identik di setiap modul (simpan
 * JSON, muat balik dengan Object.assign, atau kembalikan ke bentuk awal).
 *
 * "Bentuk awal" diambil dari `state` itu sendiri pada saat createStore()
 * dipanggil (segera setelah `var State = {...}` dideklarasikan, sebelum
 * ada mutasi) — jadi field default State tidak perlu ditulis ulang di
 * tempat lain untuk reset.
 *
 * opts:
 *   key      kunci localStorage (mis. STORAGE_KEY)
 *   state    objek State milik modul (wajib, dimutasi langsung — never
 *            diganti, supaya referensi lain ke `state` tetap valid)
 *
 * Mengembalikan { save(), load(), reset() }. `reset()` hanya mengembalikan
 * field ke nilai awal dan menghapus data localStorage; pemanggil tetap
 * bertanggung jawab memanggil initExerciseArrays() (atau sejenisnya)
 * setelahnya bila diperlukan, sama seperti clearState() sebelumnya.
 */
function createStore(opts) {
  var key = opts.key;
  var state = opts.state;
  var defaults = JSON.parse(JSON.stringify(state));

  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return false;
      Object.assign(state, JSON.parse(raw));
      return true;
    } catch (e) {
      return false;
    }
  }

  function reset() {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      /* ignore */
    }
    Object.keys(state).forEach(function (k) {
      delete state[k];
    });
    Object.assign(state, JSON.parse(JSON.stringify(defaults)));
  }

  return { save: save, load: load, reset: reset };
}

/*
 * Memastikan array state per-soal (mis. State.garisBilanganExercises)
 * ada dan panjangnya sesuai jumlah soal — jika belum, (re)buat dari
 * `makeDefault(s)` untuk tiap soal `s` (berguna saat bentuk default
 * bergantung pada field soal itu, mis. `s.type`). Pola berulang di
 * setiap initExerciseArrays() modul.
 *
 *   ensureExerciseArray(State, 'garisBilanganExercises', DATA.garisBilangan.soal, function () {
 *     return { attempts: 0, hintShown: false, correct: false, userInput: '', revealed: false };
 *   });
 */
function ensureExerciseArray(state, key, soal, makeDefault) {
  if (!state[key] || state[key].length !== soal.length) {
    state[key] = soal.map(function (s) {
      return makeDefault(s);
    });
  }
}
