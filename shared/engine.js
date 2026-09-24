'use strict';

/* ============================================================
   engine.js — Utilitas bersama untuk semua media pembelajaran MPI

   Dimuat sebagai <script> biasa (tanpa module bundler), sebelum
   data.js dan app.js pada setiap modul. Semua fungsi diekspos
   sebagai global, sehingga app.js masing-masing modul dapat
   memanggilnya langsung tanpa perubahan pada kode stage-render.

   Bagian:
    1. Utilitas Teks, Input, Format Angka & Acak
    2. Notifikasi (Toast)
    3. Utilitas Render
    4. Mesin Navigasi Tahap
    5. Tahap Latihan Soal (isian numerik & pilihan ganda)
    6. State Persistence
    7. Komponen Discovery Learning (pilihan acak, petunjuk
       berjenjang, kepala tahap, catatan guru, deret suku
       aritmetika/geometri)
    8. Komponen Discovery Learning lanjutan (langkah isian
       bertahap, pemilahan kategori, grafik perbandingan)
    9. Bilangan bulat: cara baca baku & garis bilangan interaktif
   10. Pecahan: notasi baku, cara baca & model visual
   11. Pecahan senilai (menyederhanakan & menyamakan penyebut) dan
       komponen urut-ketuk
   ============================================================ */

/* ============================================================
   1. UTILITAS TEKS, INPUT & ACAK
   ============================================================ */

/*
 * stripPunctuation: saat true, tanda titik dan koma (pemisah ribuan pada
 * beberapa soal, mis. nominal uang) turut dibuang selain spasi.
 */
function parseInputInt(str, stripPunctuation) {
  if (!str || str.trim() === '') return { value: null, error: 'empty' };
  var pattern = stripPunctuation ? /[\s.,]/g : /\s/g;
  /* Lambang minus tipografis '−' (U+2212) diterima sama seperti '-'. */
  var trimmed = str
    .trim()
    .replace(pattern, '')
    .replace(/\u2212/g, '-');
  /* Tanda '+' di depan (mis. "+8") diterima: +8 dan 8 bernilai sama. */
  if (!/^[-+]?\d+$/.test(trimmed)) return { value: null, error: 'invalid' };
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
 * FPB (faktor persekutuan terbesar) dua bilangan dengan algoritma Euclid.
 * Dipakai modul pecahan (fase-d/mpi-1.4, mpi-1.5) untuk memeriksa bentuk
 * paling sederhana, dan modul rasio (fase-d/mpi-2.1) untuk menyederhanakan
 * perbandingan. Nilai dibulatkan dan diambil nilai mutlaknya lebih dulu.
 */
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

/*
 * KPK (kelipatan persekutuan terkecil) dua bilangan asli, dan KPK
 * sekumpulan bilangan. Dipakai modul pecahan (fase-d/mpi-1.4) untuk
 * mencari penyebut bersama terkecil.
 */
function kpk(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  if (!a || !b) return 0;
  return (a / gcd(a, b)) * b;
}

function kpkBanyak(arr) {
  return arr.reduce(function (acc, n) {
    return kpk(acc, n);
  }, 1);
}

/*
 * Mengacak urutan isi sebuah array (Fisher-Yates) dan mengembalikan array
 * BARU — array asal tidak pernah disentuh, sehingga aman dipakai langsung
 * pada array milik DATA.
 *
 * Dipakai untuk memenuhi ketentuan "pilihan jawaban selalu diacak". Agar
 * pilihan tidak melompat-lompat setiap kali tahap dirender ulang, panggil
 * sekali saat menyiapkan State (mis. di initExerciseArrays()) lalu simpan
 * hasilnya di State — bukan saat render.
 */
function shuffleArray(arr) {
  var out = arr.slice();
  for (var i = out.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
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

/*
 * Menulis rasio (pengali) barisan geometri: bilangan bulat apa adanya,
 * pecahan umum dengan karakter pecahan Unicode (0,5 -> "½"), selebihnya
 * desimal berkoma. Tanda negatif memakai minus tipografis '−'.
 */
function formatRatio(r) {
  var sign = r < 0 ? '−' : '';
  var abs = Math.abs(r);
  if (hampirSama(abs, Math.round(abs))) return sign + formatNumber(abs);
  var pecahan = [
    [1 / 2, '½'],
    [1 / 3, '⅓'],
    [2 / 3, '⅔'],
    [1 / 4, '¼'],
    [3 / 4, '¾'],
    [1 / 5, '⅕'],
    [1 / 8, '⅛'],
  ];
  for (var i = 0; i < pecahan.length; i++) {
    if (hampirSama(abs, pecahan[i][0])) return sign + pecahan[i][1];
  }
  return sign + formatDesimal(abs, 3);
}

/*
 * Membaca isian bilangan rasional: bulat ("3", "−2"), desimal ("0,5",
 * ".25") atau pecahan biasa ("1/2", "−3/4"). Dipakai untuk rasio
 * barisan geometri. Bentuk kembaliannya sama seperti parseInputInt.
 */
function parseInputRational(str) {
  if (!str || String(str).trim() === '') return { value: null, error: 'empty' };
  var normalized = String(str)
    .trim()
    .replace(/\s/g, '')
    .replace(/\u2212/g, '-');
  var frac = normalized.match(/^(-?\d+)\/(\d+)$/);
  if (frac) {
    var den = parseInt(frac[2], 10);
    if (den === 0) return { value: null, error: 'invalid' };
    return { value: parseInt(frac[1], 10) / den, error: null };
  }
  return parseInputDecimal(normalized);
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
 *   afterRender(container) (opsional) dipanggil setiap selesai render, mis. untuk
 *                          centerNumberLines() pada soal bergaris bilangan
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
 *   allowNegative          (opsional) true → kotak isian tanpa inputmode numerik
 *                          agar tombol minus tersedia di keyboard ponsel
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
 * (id opsi yang benar).
 *
 * Pengacakan pilihan: bila state per-soal memuat `optionOrder` (array id opsi),
 * opsi dirender menurut urutan itu. Isi sekali saat menyiapkan state agar
 * urutan teracak namun stabil lintas render/reload, mis.
 *
 *   ensureExerciseArray(State, 'terapkanExercises', DATA.terapkan.soal, function (s) {
 *     return {
 *       attempts: 0, hintLevel: 0, correct: false, userInput: '', revealed: false,
 *       chosen: null,
 *       optionOrder: s.options ? shuffleArray(s.options.map(function (o) { return o.id; })) : null,
 *     };
 *   });
 *
 * Mengembalikan { render(container) }.
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
        '<input type="text"' +
        (cfg.allowNegative ? '' : ' inputmode="numeric"') +
        ' id="' +
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

  /*
   * Urutan tampil pilihan ganda. Bila State per-soal menyimpan `optionOrder`
   * (array id opsi, dibuat sekali dengan shuffleArray saat menyiapkan State),
   * opsi dirender menurut urutan itu sehingga teracak tetapi stabil lintas
   * render dan reload. Tanpa `optionOrder` — atau bila isinya tidak lagi
   * cocok dengan `s.options` — urutan DATA dipakai apa adanya, sehingga modul
   * lama tidak berubah perilakunya.
   */
  function orderedOptions(s, ex) {
    if (!ex || !Array.isArray(ex.optionOrder)) return s.options;
    if (ex.optionOrder.length !== s.options.length) return s.options;
    var byId = {};
    s.options.forEach(function (opt) {
      byId[opt.id] = opt;
    });
    var out = [];
    for (var i = 0; i < ex.optionOrder.length; i++) {
      var opt = byId[ex.optionOrder[i]];
      if (!opt) return s.options;
      out.push(opt);
    }
    return out;
  }

  function buildChoiceBody(s, ex) {
    var answered = ex.chosen !== null && ex.chosen !== undefined;

    var choicesHTML = orderedOptions(s, ex)
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

    if (cfg.afterRender) cfg.afterRender(container);
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

/* ============================================================
   7. KOMPONEN DISCOVERY LEARNING
   Blok bangun kecil untuk tahap-tahap penemuan terbimbing:
   pilihan yang diacak sekali lalu disimpan di State, petunjuk
   berjenjang, kepala tahap bertanda sintaks, catatan peran guru,
   dan visual deret suku dengan "busur" selisih.
   ============================================================ */

/* Daftar id dari array opsi {id, ...}. */
function optionIds(options) {
  return options.map(function (o) {
    return o.id;
  });
}

/*
 * Memastikan state[key] berisi urutan acak id opsi yang masih cocok
 * dengan `options`; bila belum ada atau sudah tidak cocok (DATA berubah),
 * urutan baru diacak dengan shuffleArray(). Panggil di initExerciseArrays()
 * — bukan saat render — agar urutan stabil lintas render/reload namun
 * teracak ulang setiap kali progress direset.
 */
function ensureShuffledOrder(state, key, options) {
  var order = state[key];
  var ids = optionIds(options);
  var cocok =
    Array.isArray(order) &&
    order.length === ids.length &&
    ids.every(function (id) {
      return order.indexOf(id) !== -1;
    });
  if (!cocok) state[key] = shuffleArray(ids);
  return state[key];
}

/*
 * Menyusun opsi menurut urutan id tersimpan. Bila urutan tidak ada atau
 * tidak cocok, urutan DATA dipakai apa adanya agar tampilan tetap aman.
 */
function orderByIds(options, order) {
  if (!Array.isArray(order) || order.length !== options.length) return options;
  var byId = {};
  options.forEach(function (o) {
    byId[o.id] = o;
  });
  var out = [];
  for (var i = 0; i < order.length; i++) {
    if (!byId[order[i]]) return options;
    out.push(byId[order[i]]);
  }
  return out;
}

/*
 * Kepala tahap bergaya shared (.stage-head). `syntax` opsional menandai
 * sintaks model pembelajaran, mis. "Discovery Learning · Sintaks 3".
 */
function buildDiscoveryHead(kicker, goal, syntax) {
  return (
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">' +
    esc(kicker) +
    '</span>' +
    (syntax ? '<span class="dl-syntax-chip">' + esc(syntax) + '</span>' : '') +
    '<p class="stage-head__goal">Tujuan: ' +
    esc(goal) +
    '</p>' +
    '</div>'
  );
}

/*
 * Catatan peran guru yang bisa dibuka-tutup (<details>), sehingga media
 * sekaligus menjadi panduan fasilitasi tanpa mengganggu murid.
 */
function buildTeacherNote(text) {
  if (!text) return '';
  return (
    '<details class="teacher-note">' +
    '<summary>👩‍🏫 Peran guru di tahap ini</summary>' +
    '<p>' +
    text +
    '</p>' +
    '</details>'
  );
}

/*
 * Tombol pilihan ganda (.choice-btn + .is-*) dalam urutan `order`.
 *   opts.chosen     id opsi yang sudah dipilih (atau null)
 *   opts.correctId  id opsi benar untuk ditandai hijau; null bila jawaban
 *                   benar belum boleh dibocorkan (masih boleh coba lagi)
 *   opts.grade      true → tandai benar/salah; false → hanya .is-selected
 *                   (untuk dugaan/penilaian diri yang tidak dinilai)
 *   opts.locked     true → matikan semua tombol setelah dijawab
 *   opts.attr       nama atribut data untuk id opsi (default 'data-opt-id')
 *   opts.group      nilai data-group opsional untuk membedakan beberapa
 *                   kelompok pilihan dalam satu tahap
 */
function buildChoiceGroup(options, order, opts) {
  opts = opts || {};
  var letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  var chosen = opts.chosen;
  var answered = chosen !== null && chosen !== undefined && chosen !== '';
  var attr = opts.attr || 'data-opt-id';
  return (
    '<div class="challenge-options"' +
    (opts.group ? ' role="group" data-group="' + esc(opts.group) + '"' : ' role="group"') +
    '>' +
    orderByIds(options, order)
      .map(function (opt, i) {
        var cls = 'choice-btn';
        if (answered) {
          if (opts.grade) {
            if (opts.correctId && opt.id === opts.correctId) cls += ' is-correct';
            else if (opt.id === chosen) cls += ' is-incorrect';
          } else if (opt.id === chosen) {
            cls += ' is-selected';
          }
        }
        return (
          '<button type="button" class="' +
          cls +
          '" ' +
          attr +
          '="' +
          esc(opt.id) +
          '"' +
          (opts.group ? ' data-group="' + esc(opts.group) + '"' : '') +
          (answered && opts.locked ? ' disabled' : '') +
          ' aria-pressed="' +
          (opt.id === chosen ? 'true' : 'false') +
          '">' +
          '<span class="choice-btn__icon">' +
          letters[i] +
          '</span>' +
          '<span>' +
          opt.label +
          '</span>' +
          '</button>'
        );
      })
      .join('') +
    '</div>'
  );
}

/* Kotak petunjuk berjenjang: menampilkan `level` petunjuk pertama. */
function buildHintStack(hints, level) {
  if (!hints || !level || level < 1) return '';
  return hints
    .slice(0, level)
    .map(function (h, i) {
      return (
        '<div class="hint-box">' +
        '<span class="hint-box__label">' +
        (hints.length > 1 ? 'Petunjuk ' + (i + 1) : 'Petunjuk') +
        '</span>' +
        h +
        '</div>'
      );
    })
    .join('');
}

/* Tombol pembuka petunjuk berikutnya; '' bila semua petunjuk terbuka. */
function buildHintToggle(id, hints, level) {
  if (!hints || level >= hints.length) return '';
  var label =
    hints.length > 1 ? '💡 Petunjuk (' + (level + 1) + '/' + hints.length + ')' : '💡 Petunjuk';
  return (
    '<button type="button" class="btn btn--ghost btn--small" id="' + id + '">' + label + '</button>'
  );
}

/*
 * Visual deret suku: kotak-kotak suku dengan "busur" selisih di antaranya.
 *   terms          array nilai suku
 *   opts.labels    label di atas tiap kotak (mis. 'Baris 1'); default 'U₁', 'U₂', ...
 *   opts.reveal    banyak suku yang terlihat (sisanya '?'); default semua
 *   opts.showDiff  true → tampilkan nilai busur (selisih/rasio); false → '?'
 *   opts.gap       'diff' (default) → busur berisi selisih (+b, barisan
 *                  aritmetika); 'ratio' → busur berisi pengali (×r, barisan
 *                  geometri), ditulis dengan formatRatio()
 *   opts.format    function(n) → teks nilai suku (default formatNumber dengan '−')
 *   opts.more      true → tambahkan kotak '…' di akhir
 *   opts.tail      {label, value} opsional: kotak suku jauh (mis. U₂₀ = ?)
 */
function buildSequenceTiles(terms, opts) {
  opts = opts || {};
  var reveal = typeof opts.reveal === 'number' ? opts.reveal : terms.length;
  var fmt =
    opts.format ||
    function (n) {
      return formatNumber(n, '−');
    };
  var subs = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  function sub(n) {
    return String(n)
      .split('')
      .map(function (d) {
        return subs[+d];
      })
      .join('');
  }
  var html = '';
  for (var i = 0; i < terms.length; i++) {
    var shown = i < reveal;
    if (i > 0) {
      var diffText = '?';
      if (opts.showDiff && shown) {
        if (opts.gap === 'ratio') {
          diffText = '×' + formatRatio(terms[i] / terms[i - 1]);
        } else {
          var diff = terms[i] - terms[i - 1];
          diffText = (diff >= 0 ? '+' : '−') + fmt(Math.abs(diff));
        }
      }
      html +=
        '<span class="seq-gap' +
        (opts.gap === 'ratio' ? ' seq-gap--ratio' : '') +
        (opts.showDiff && shown ? ' seq-gap--known' : '') +
        '" aria-hidden="true"><span class="seq-gap__val">' +
        diffText +
        '</span></span>';
    }
    var label = opts.labels ? opts.labels[i] : 'U' + sub(i + 1);
    html +=
      '<span class="seq-tile' +
      (shown ? '' : ' seq-tile--hidden') +
      (shown && i === reveal - 1 && opts.highlightLast ? ' seq-tile--new' : '') +
      '">' +
      '<span class="seq-tile__label">' +
      esc(label) +
      '</span>' +
      '<span class="seq-tile__val">' +
      (shown ? fmt(terms[i]) : '?') +
      '</span>' +
      '</span>';
  }
  if (opts.more) {
    html += '<span class="seq-gap seq-gap--dots" aria-hidden="true">…</span>';
  }
  if (opts.tail) {
    html +=
      '<span class="seq-tile seq-tile--tail">' +
      '<span class="seq-tile__label">' +
      esc(opts.tail.label) +
      '</span>' +
      '<span class="seq-tile__val">' +
      esc(opts.tail.value) +
      '</span>' +
      '</span>';
  }
  var aria = terms
    .slice(0, reveal)
    .map(function (t) {
      return fmt(t);
    })
    .join(', ');
  return (
    '<div class="seq-tiles" role="img" aria-label="Barisan: ' +
    esc(aria) +
    (reveal < terms.length || opts.more ? ', …' : '') +
    '">' +
    html +
    '</div>'
  );
}

/* ============================================================
   8. KOMPONEN DISCOVERY LEARNING — LANGKAH ISIAN, PEMILAHAN,
      & GRAFIK PERBANDINGAN
   Dipakai tahap pengolahan data/pembuktian (isian bertahap
   berpetunjuk), tahap pemilahan (setiap pernyataan dipilahkan
   ke salah satu kategori dengan opsi teracak), dan tahap
   membandingkan dua barisan secara visual.
   ============================================================ */

/* Panel shared (.panel) dengan class tambahan opsional. */
function buildDlPanel(inner, cls) {
  return '<div class="panel' + (cls ? ' ' + cls : '') + '">' + inner + '</div>';
}

/* Tombol lanjut rata kanan. */
function buildDlNextButton(id, label, large) {
  return (
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary' +
    (large ? ' btn--large' : '') +
    '" id="' +
    id +
    '">' +
    esc(label) +
    '</button>' +
    '</div>'
  );
}

/* Label opsi {id, label} berdasarkan id; '' bila tidak ada. */
function findOptionLabel(options, id) {
  for (var i = 0; i < options.length; i++) {
    if (options[i].id === id) return options[i].label;
  }
  return '';
}

/* State default satu langkah isian bertahap. */
function makeDlStep() {
  return { input: '', done: false, salah: false, attempts: 0, hintLevel: 0 };
}

/*
 * Kotak isian bilangan.
 *   opts.allowNegative  true → tanpa inputmode numerik agar tombol minus
 *                       tersedia di keyboard ponsel
 *   opts.rational       true → inputmode desimal (koma/garis miring)
 *   opts.error, opts.disabled, opts.aria, opts.placeholder
 */
function buildDlNumInput(id, value, opts) {
  opts = opts || {};
  var mode = '';
  if (opts.rational) mode = ' inputmode="text"';
  else if (!opts.allowNegative) mode = ' inputmode="numeric"';
  return (
    '<input type="text" class="input-text dl-num-input' +
    (opts.error ? ' has-error' : '') +
    '" id="' +
    id +
    '"' +
    mode +
    ' autocomplete="off" value="' +
    esc(value || '') +
    '" aria-label="' +
    esc(opts.aria || 'Jawaban') +
    '"' +
    (opts.disabled ? ' disabled' : '') +
    ' placeholder="' +
    esc(opts.placeholder || '…') +
    '">'
  );
}

/*
 * Membaca isian bilangan; menampilkan notice dan mengembalikan null bila
 * kosong/tidak valid. `rational` true menerima desimal & pecahan (1/2),
 * selain itu bilangan bulat dengan pemisah ribuan.
 */
function readDlNumber(val, rational) {
  var parsed = rational ? parseInputRational(val) : parseInputInt(val, true);
  if (parsed.error) {
    showNotice(
      parsed.error === 'empty'
        ? 'Isi jawabanmu terlebih dahulu.'
        : rational
        ? 'Tulis jawaban berupa bilangan, pecahan, atau desimal, mis. 3, 1/2, atau 0,5.'
        : 'Tulis jawaban berupa bilangan bulat, mis. 12 atau −40.'
    );
    return null;
  }
  return parsed.value;
}

/*
 * Satu langkah isian bertahap: label, isian, tombol Periksa & Petunjuk,
 * umpan balik salah, dan teks temuan setelah benar.
 *   id    awalan id DOM (mis. 'sn0' → sn0Input, sn0Check, sn0Hint)
 *   st    state langkah (makeDlStep)
 *   step  { label, jawab, hints, temuan|bukti, allowNegative, rational }
 *   num   nomor langkah opsional (bulatan kecil di depan label)
 */
function buildDlStep(id, st, step, num) {
  var temuan = step.temuan || step.bukti || '';
  var head =
    '<p class="dl-step__label">' +
    (num ? '<span class="dl-step__num">' + num + '</span>' : '') +
    step.label +
    '</p>';
  if (st.done) {
    return (
      '<div class="dl-step dl-step--done">' +
      head +
      '<p class="dl-step__answer">✓ ' +
      esc(st.input) +
      '</p>' +
      (temuan ? buildFeedbackBox('success', '💡', temuan) : '') +
      '</div>'
    );
  }
  return (
    '<div class="dl-step">' +
    head +
    '<div class="dl-input-row">' +
    buildDlNumInput(id + 'Input', st.input, {
      error: st.salah,
      allowNegative: step.allowNegative,
      rational: step.rational,
    }) +
    '<button type="button" class="btn btn--primary" id="' +
    id +
    'Check">Periksa</button>' +
    buildHintToggle(id + 'Hint', step.hints, st.hintLevel) +
    '</div>' +
    (st.salah
      ? '<div style="margin-top:var(--space-3);">' +
        buildFeedbackBox(
          'error',
          '✗',
          'Jawaban <strong>' + esc(st.input) + '</strong> belum tepat. Periksa lagi perhitunganmu.'
        ) +
        '</div>'
      : '') +
    buildHintStack(step.hints, st.hintLevel) +
    '</div>'
  );
}

/* Memasang event buildDlStep; `save` lalu `rerender` dipanggil setelah perubahan. */
function bindDlStep(id, st, step, save, rerender) {
  var inp = document.getElementById(id + 'Input');
  var btn = document.getElementById(id + 'Check');
  var hint = document.getElementById(id + 'Hint');
  if (inp && btn) {
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') btn.click();
    });
    btn.addEventListener('click', function () {
      var v = readDlNumber(inp.value, step.rational);
      if (v === null) return;
      st.input = inp.value.trim();
      st.attempts += 1;
      st.done = step.rational ? hampirSama(v, step.jawab) : v === step.jawab;
      st.salah = !st.done;
      save();
      rerender();
    });
  }
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = Math.min(st.hintLevel + 1, step.hints.length);
      save();
      rerender();
    });
  }
}

/*
 * Aktivitas memilah: setiap butir (mis. barisan atau pernyataan) dipilahkan
 * ke salah satu kategori `options`. Urutan butir dan urutan opsi pada tiap
 * butir DIACAK sekali lalu disimpan di State.
 *
 *   items   [{ id, teks, correct, explanation }]
 *   options [{ id, label }] — kategori
 *
 * ensureSortStates(state, key, orderKey, items, options) menyiapkan
 *   state[key]      { <itemId>: { chosen, correct, optionOrder } }
 *   state[orderKey] urutan acak id butir
 */
function ensureSortStates(state, key, orderKey, items, options) {
  var map = state[key] && typeof state[key] === 'object' ? state[key] : {};
  var next = {};
  items.forEach(function (it) {
    var st = map[it.id];
    if (!st || typeof st !== 'object') {
      st = { chosen: null, correct: false, optionOrder: null };
    }
    ensureShuffledOrder(st, 'optionOrder', options);
    next[it.id] = st;
  });
  state[key] = next;
  ensureShuffledOrder(state, orderKey, items);
}

function sortItemsAllAnswered(items, states) {
  return items.every(function (it) {
    return !!(states[it.id] && states[it.id].chosen);
  });
}

function sortItemsCorrectCount(items, states) {
  return items.filter(function (it) {
    return states[it.id] && states[it.id].correct;
  }).length;
}

/*
 * Merender butir pemilahan. Setiap butir dijawab sekali (terkunci) lalu
 * langsung diberi umpan balik beserta alasannya.
 *   opts.mono  true → teks butir bergaya kode/angka (untuk barisan)
 */
function buildSortItems(items, itemOrder, options, states, opts) {
  opts = opts || {};
  return (
    '<div class="sort-list">' +
    orderByIds(items, itemOrder)
      .map(function (it) {
        var st = states[it.id];
        return (
          '<div class="sort-item">' +
          '<p class="sort-item__text' +
          (opts.mono ? ' sort-item__text--mono' : '') +
          '">' +
          it.teks +
          '</p>' +
          buildChoiceGroup(options, st.optionOrder, {
            chosen: st.chosen,
            correctId: it.correct,
            grade: true,
            locked: true,
            group: it.id,
            attr: 'data-sort-opt',
          }) +
          (st.chosen
            ? '<div style="margin-top:var(--space-2);">' +
              buildFeedbackBox(
                st.correct ? 'success' : 'error',
                st.correct ? '✓' : '✗',
                (st.correct ? '<strong>Benar.</strong> ' : '<strong>Belum tepat.</strong> ') +
                  it.explanation
              ) +
              '</div>'
            : '') +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

/* Memasang event buildSortItems di dalam `root`. */
function bindSortItems(root, items, states, save, rerender) {
  var byId = {};
  items.forEach(function (it) {
    byId[it.id] = it;
  });
  root.querySelectorAll('[data-sort-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var it = byId[btn.dataset.group];
      var st = it && states[it.id];
      if (!st || st.chosen) return;
      st.chosen = btn.dataset.sortOpt;
      st.correct = st.chosen === it.correct;
      save();
      rerender();
    });
  });
}

/*
 * Grafik batang berdampingan untuk membandingkan dua (atau lebih)
 * barisan, mis. aritmetika vs geometri, bunga tunggal vs majemuk.
 *   series      [{ label, values: [..] }] — warna mengikuti urutan (0 biru, 1 oranye)
 *   opts.xLabel     function(i) → label sumbu-x kelompok ke-i (default i + 1)
 *   opts.format     function(v) → teks nilai (default formatNumber)
 *   opts.highlight  indeks kelompok yang disorot (nilai tepatnya sebaiknya
 *                   ditulis di luar grafik agar tidak menumpuk)
 *   opts.caption    teks aksesibel grafik
 */
function buildCompareBarChart(series, opts) {
  opts = opts || {};
  var fmtV =
    opts.format ||
    function (v) {
      return formatNumber(v);
    };
  var xLabel =
    opts.xLabel ||
    function (i) {
      return String(i + 1);
    };
  var W = 640;
  var H = 280;
  var padL = 64;
  var padR = 12;
  var padT = 28;
  var padB = 36;
  var plotW = W - padL - padR;
  var plotH = H - padT - padB;
  var count = series[0].values.length;
  var max = 0;
  series.forEach(function (s) {
    s.values.forEach(function (v) {
      if (v > max) max = v;
    });
  });
  /* Batas atas dibulatkan ke kelipatan 4 × langkah "rapi" (1–10 × 10ᵏ)
     agar label sumbu-y mudah dibaca. */
  if (max <= 0) max = 1;
  var kasar = max / 4;
  var pangkat = Math.pow(10, Math.floor(Math.log10(kasar)));
  var langkah = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
    .map(function (m) {
      return m * pangkat;
    })
    .filter(function (v) {
      return v >= kasar;
    })[0];
  max = langkah * 4;

  function yOf(v) {
    return padT + plotH - (v / max) * plotH;
  }

  var grid = '';
  [0, 0.25, 0.5, 0.75, 1].forEach(function (f) {
    var y = yOf(max * f);
    grid +=
      '<line class="cmp-chart__grid" x1="' +
      padL +
      '" x2="' +
      (W - padR) +
      '" y1="' +
      y +
      '" y2="' +
      y +
      '"/>' +
      '<text class="cmp-chart__ytick" x="' +
      (padL - 8) +
      '" y="' +
      (y + 4) +
      '" text-anchor="end">' +
      esc(fmtV(max * f)) +
      '</text>';
  });

  var groupW = plotW / count;
  var barW = Math.min(28, (groupW * 0.8) / series.length);
  var bars = '';
  for (var i = 0; i < count; i++) {
    var gx = padL + i * groupW + (groupW - barW * series.length) / 2;
    var hl = opts.highlight === i;
    if (hl) {
      bars +=
        '<rect class="cmp-chart__hl" x="' +
        (padL + i * groupW) +
        '" y="' +
        padT +
        '" width="' +
        groupW +
        '" height="' +
        plotH +
        '"/>';
    }
    for (var k = 0; k < series.length; k++) {
      var v = series[k].values[i];
      var x = gx + k * barW;
      var y = yOf(v);
      bars +=
        '<rect class="cmp-chart__bar cmp-chart__bar--' +
        k +
        '" x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        (barW - 2) +
        '" height="' +
        Math.max(0, padT + plotH - y) +
        '"><title>' +
        esc(series[k].label + ', ' + xLabel(i) + ': ' + fmtV(v)) +
        '</title></rect>';
    }
    bars +=
      '<text class="cmp-chart__xtick' +
      (hl ? ' is-hl' : '') +
      '" x="' +
      (padL + i * groupW + groupW / 2) +
      '" y="' +
      (H - padB + 18) +
      '" text-anchor="middle">' +
      esc(xLabel(i)) +
      '</text>';
  }

  var legend =
    '<div class="cmp-chart__legend">' +
    series
      .map(function (s, k) {
        return (
          '<span class="cmp-chart__key"><span class="cmp-chart__swatch cmp-chart__swatch--' +
          k +
          '" aria-hidden="true"></span>' +
          esc(s.label) +
          '</span>'
        );
      })
      .join('') +
    '</div>';

  return (
    '<figure class="cmp-chart">' +
    legend +
    '<svg viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" role="img" aria-label="' +
    esc(opts.caption || 'Grafik perbandingan') +
    '">' +
    grid +
    '<line class="cmp-chart__axis" x1="' +
    padL +
    '" x2="' +
    (W - padR) +
    '" y1="' +
    (padT + plotH) +
    '" y2="' +
    (padT + plotH) +
    '"/>' +
    bars +
    '</svg>' +
    '</figure>'
  );
}

/* ============================================================
   9. BILANGAN BULAT — CARA BACA BAKU & GARIS BILANGAN INTERAKTIF
   Dipakai tahap membaca/menulis bilangan bulat dan menempatkan
   bilangan pada garis bilangan mendatar (klik/ketuk atau
   keyboard). Gaya .nlp-* ada di shared/base.css.
   ============================================================ */

/*
 * Terbilang bahasa Indonesia untuk bilangan cacah 0 … 999.999
 * (12 → "dua belas", 105 → "seratus lima", 1000 → "seribu").
 * Di luar rentang itu, angka ditulis dengan formatNumber().
 */
function terbilang(n) {
  var dasar = [
    'nol',
    'satu',
    'dua',
    'tiga',
    'empat',
    'lima',
    'enam',
    'tujuh',
    'delapan',
    'sembilan',
    'sepuluh',
    'sebelas',
  ];
  function sisa(n, r) {
    return r ? ' ' + t(r) : '';
  }
  function t(n) {
    if (n < 12) return dasar[n];
    if (n < 20) return dasar[n - 10] + ' belas';
    if (n < 100) return dasar[Math.floor(n / 10)] + ' puluh' + sisa(n, n % 10);
    if (n < 200) return 'seratus' + sisa(n, n - 100);
    if (n < 1000) return dasar[Math.floor(n / 100)] + ' ratus' + sisa(n, n % 100);
    if (n < 2000) return 'seribu' + sisa(n, n - 1000);
    return t(Math.floor(n / 1000)) + ' ribu' + sisa(n, n % 1000);
  }
  n = Math.round(Math.abs(n));
  if (n >= 1000000) return formatNumber(n);
  return t(n);
}

/*
 * Cara baca baku bilangan bulat: −12 → "negatif dua belas", 0 → "nol",
 * 7 → "tujuh" (atau "positif tujuh" bila opts.positif true).
 * Kata "minus" sengaja tidak dipakai: dalam notasi baku, "minus" adalah
 * nama operasi pengurangan, sedangkan tanda di depan bilangan dibaca
 * "negatif".
 */
function bacaBilanganBulat(n, opts) {
  opts = opts || {};
  if (n < 0) return 'negatif ' + terbilang(-n);
  if (n === 0) return 'nol';
  return (opts.positif ? 'positif ' : '') + terbilang(n);
}

/* Titik terakhir yang dipilih per garis bilangan, agar fokus keyboard
   bisa dipulihkan setelah tahap dirender ulang. */
var NLP_LAST_PICK = {};
var NLP_LAST_SCROLL = {};

/*
 * Garis bilangan mendatar (SVG) yang bisa diketuk.
 *   id               id elemen <svg> (unik dalam tahap)
 *   opts.min, max    rentang bilangan bulat (default −10 … 10)
 *   opts.labelEvery  label angka setiap kelipatan ini (default 1); ujung
 *                    garis dan 0 selalu berlabel
 *   opts.marks       [{ value, label, tone }] titik yang sudah ditempatkan;
 *                    tone 'neg' | 'pos' | 'zero' | 'ok' | 'bad' | 'target'
 *                    (default mengikuti tanda bilangan)
 *   opts.selected    nilai yang sedang dipilih (cincin sorot) atau null
 *   opts.interactive false → hanya gambar (mis. soal "titik A = ?")
 *   opts.sides       true → pita warna sisi negatif (kiri) & positif (kanan)
 *   opts.aria        label aksesibel garis
 * Setiap bilangan bulat mendapat target sentuh selebar satu satuan
 * (<g role="button" tabindex="0" data-nl-value>). Pasang event dengan
 * bindNumberLinePicker(); panggil centerNumberLines() setelah render agar
 * di layar sempit garis dimulai dengan 0 di tengah.
 */
function buildNumberLinePicker(id, opts) {
  opts = opts || {};
  var min = typeof opts.min === 'number' ? opts.min : -10;
  var max = typeof opts.max === 'number' ? opts.max : 10;
  var every = opts.labelEvery || 1;
  var interactive = opts.interactive !== false;
  var marks = opts.marks || [];
  var unit = 40;
  var padX = 34;
  var H = 116;
  var axisY = 70;
  var W = padX * 2 + (max - min) * unit;
  function xOf(v) {
    return padX + (v - min) * unit;
  }
  function toneOf(v) {
    if (v < 0) return 'neg';
    if (v > 0) return 'pos';
    return 'zero';
  }

  var html = '';

  if (opts.sides && min < 0 && max > 0) {
    html +=
      '<rect class="nlp-side nlp-side--neg" x="' +
      (xOf(min) - 14) +
      '" y="' +
      (axisY - 6) +
      '" width="' +
      (xOf(0) - xOf(min) + 14) +
      '" height="12" rx="6"/>' +
      '<rect class="nlp-side nlp-side--pos" x="' +
      xOf(0) +
      '" y="' +
      (axisY - 6) +
      '" width="' +
      (xOf(max) - xOf(0) + 14) +
      '" height="12" rx="6"/>' +
      '<text class="nlp-side-cap nlp-side-cap--neg" x="' +
      xOf(min) +
      '" y="14">← negatif</text>' +
      '<text class="nlp-side-cap nlp-side-cap--pos" x="' +
      xOf(max) +
      '" y="14">positif →</text>';
  }

  /* Sumbu + panah di kedua ujung (garis bilangan tak berujung). */
  var x0 = xOf(min) - 22;
  var x1 = xOf(max) + 22;
  html +=
    '<line class="nlp-axis" x1="' +
    x0 +
    '" y1="' +
    axisY +
    '" x2="' +
    x1 +
    '" y2="' +
    axisY +
    '"/>' +
    '<polygon class="nlp-arrow" points="' +
    (x0 - 4) +
    ',' +
    axisY +
    ' ' +
    (x0 + 8) +
    ',' +
    (axisY - 6) +
    ' ' +
    (x0 + 8) +
    ',' +
    (axisY + 6) +
    '"/>' +
    '<polygon class="nlp-arrow" points="' +
    (x1 + 4) +
    ',' +
    axisY +
    ' ' +
    (x1 - 8) +
    ',' +
    (axisY - 6) +
    ' ' +
    (x1 - 8) +
    ',' +
    (axisY + 6) +
    '"/>';

  for (var v = min; v <= max; v++) {
    var x = xOf(v);
    var major = v === 0 || v % 5 === 0;
    var berlabel = v === 0 || v === min || v === max || v % every === 0;
    var h = major ? 12 : 8;
    var tick =
      '<line class="nlp-tick' +
      (major ? ' nlp-tick--major' : '') +
      '" x1="' +
      x +
      '" y1="' +
      (axisY - h) +
      '" x2="' +
      x +
      '" y2="' +
      (axisY + h) +
      '"/>' +
      (berlabel
        ? '<text class="nlp-num nlp-num--' +
          toneOf(v) +
          '" x="' +
          x +
          '" y="' +
          (axisY + 34) +
          '">' +
          formatNumber(v, '−') +
          '</text>'
        : '');
    if (interactive) {
      html +=
        '<g class="nlp-hit' +
        (opts.selected === v ? ' is-selected' : '') +
        '" role="button" tabindex="0" data-nl-value="' +
        v +
        '" aria-label="Titik ' +
        (berlabel
          ? formatNumber(v, '−')
          : 'tanpa label, ' + Math.abs(v) + ' satuan di ' + (v < 0 ? 'kiri' : 'kanan') + ' nol') +
        '">' +
        '<rect class="nlp-hit__area" x="' +
        (x - unit / 2) +
        '" y="22" width="' +
        unit +
        '" height="' +
        (H - 22) +
        '"/>' +
        '<circle class="nlp-hit__ring" cx="' +
        x +
        '" cy="' +
        axisY +
        '" r="13"/>' +
        tick +
        '</g>';
    } else {
      html += tick;
    }
  }

  marks.forEach(function (m) {
    if (m.value < min || m.value > max) return;
    var mx = xOf(m.value);
    html +=
      '<g class="nlp-mark nlp-mark--' +
      (m.tone || toneOf(m.value)) +
      '">' +
      '<circle cx="' +
      mx +
      '" cy="' +
      axisY +
      '" r="9"/>' +
      (m.label !== undefined && m.label !== ''
        ? '<text class="nlp-mark__label" x="' +
          mx +
          '" y="' +
          (axisY - 20) +
          '">' +
          esc(m.label) +
          '</text>'
        : '') +
      '</g>';
  });

  return (
    '<div class="nlp-wrap">' +
    '<svg class="nlp' +
    (interactive ? ' nlp--interactive' : '') +
    '" id="' +
    id +
    '" data-zero="' +
    (min <= 0 && max >= 0 ? (xOf(0) / W).toFixed(4) : '') +
    '" viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" style="min-width:' +
    Math.round(W * 0.62) +
    'px" ' +
    (interactive ? 'role="group"' : 'role="img"') +
    ' aria-label="' +
    esc(
      opts.aria ||
        'Garis bilangan dari ' + formatNumber(min, '−') + ' sampai ' + formatNumber(max, '−')
    ) +
    '">' +
    html +
    '</svg>' +
    '</div>'
  );
}

/*
 * Memasang event garis bilangan buildNumberLinePicker di dalam `root`.
 * onPick(value) dipanggil saat titik diklik/diketuk atau ditekan
 * Enter/Spasi; panah kiri/kanan memindah fokus antartitik.
 */
function bindNumberLinePicker(root, id, onPick) {
  var svg = root.querySelector('#' + id);
  if (!svg) return;
  var wrap = svg.parentNode;
  var hits = Array.prototype.slice.call(svg.querySelectorAll('.nlp-hit'));
  function pick(g) {
    var v = parseInt(g.getAttribute('data-nl-value'), 10);
    NLP_LAST_PICK[id] = v;
    NLP_LAST_SCROLL[id] = wrap.scrollLeft;
    onPick(v);
  }
  /* Pulihkan posisi gulir setelah render ulang akibat ketukan. */
  if (typeof NLP_LAST_SCROLL[id] === 'number') {
    wrap.scrollLeft = NLP_LAST_SCROLL[id];
    wrap.setAttribute('data-scroll-restored', '1');
    delete NLP_LAST_SCROLL[id];
  }
  hits.forEach(function (g, i) {
    g.addEventListener('click', function () {
      pick(g);
    });
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        pick(g);
      } else if (e.key === 'ArrowLeft' && i > 0) {
        e.preventDefault();
        hits[i - 1].focus();
      } else if (e.key === 'ArrowRight' && i < hits.length - 1) {
        e.preventDefault();
        hits[i + 1].focus();
      }
    });
  });
  /* Pulihkan fokus keyboard pada titik yang terakhir dipilih. */
  if (typeof NLP_LAST_PICK[id] === 'number' && document.activeElement === document.body) {
    var prev = svg.querySelector('[data-nl-value="' + NLP_LAST_PICK[id] + '"]');
    if (prev && prev.focus) prev.focus({ preventScroll: true });
    delete NLP_LAST_PICK[id];
  }
}

/*
 * Di layar sempit, garis bilangan bergulir mendatar di dalam wadahnya.
 * Panggil setelah tahap dirender agar setiap garis di `root` dimulai
 * dengan titik 0 di tengah layar (bukan terpotong di ujung kiri).
 */
function centerNumberLines(root) {
  (root || document).querySelectorAll('.nlp-wrap').forEach(function (wrap) {
    var svg = wrap.querySelector('svg[data-zero]');
    if (!svg || wrap.scrollWidth <= wrap.clientWidth) return;
    if (wrap.getAttribute('data-scroll-restored')) return;
    var ratio = parseFloat(svg.getAttribute('data-zero'));
    if (isNaN(ratio)) return;
    wrap.scrollLeft = Math.max(0, ratio * svg.clientWidth - wrap.clientWidth / 2);
  });
}

/* ============================================================
   10. PECAHAN — NOTASI BAKU, CARA BACA & MODEL VISUAL
   Dipakai modul pecahan (fase-d/mpi-1.3, mpi-1.4, mpi-1.5).
   Gaya .frac-block/.frac-inline/.frac-model/.frac-input ada di
   shared/base.css.
   ============================================================ */

function isBulat(v) {
  return typeof v === 'number' && isFinite(v) && Math.floor(v) === v;
}

/*
 * Cara baca baku pecahan: pembilang, kata "per", lalu penyebut.
 *   bacaPecahan(3, 4)     → "tiga per empat"
 *   bacaPecahan(3, 4, 2)  → "dua tiga per empat"  (pecahan campuran:
 *                            bilangan bulat dibaca lebih dulu)
 * Sebutan sehari-hari seperti "setengah" (1/2) dan "seperempat" (1/4)
 * sengaja tidak dipakai di sini karena bukan pola baku yang berlaku
 * untuk semua pecahan.
 */
function bacaPecahan(num, den, whole) {
  var biasa = terbilang(num) + ' per ' + terbilang(den);
  return whole ? terbilang(whole) + ' ' + biasa : biasa;
}

/* Label aksesibel pecahan: cara baca baku bila bilangan bulat. */
function fracAriaLabel(num, den, whole) {
  var w = whole != null && whole !== '' ? whole : null;
  if (isBulat(num) && isBulat(den) && (w === null || isBulat(w))) {
    return bacaPecahan(num, den, w);
  }
  return (w !== null ? w + ' dan ' : '') + num + ' per ' + den;
}

/*
 * Pecahan bersusun (pembilang di atas garis, penyebut di bawah) dengan
 * bilangan bulat opsional di kiri untuk pecahan campuran.
 *   size  '' | 'small' | 'large' | 'hero'
 */
function buildFracBlock(num, den, whole, size) {
  var cls = size ? ' frac-block--' + size : '';
  var wholeHTML =
    whole != null ? '<span class="frac-block__whole">' + esc(String(whole)) + '</span>' : '';
  return (
    '<span class="frac-block' +
    cls +
    '" role="img" aria-label="' +
    esc(fracAriaLabel(num, den, whole)) +
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

/* Pecahan bersusun kecil untuk di dalam kalimat. */
function buildFracInline(num, den, whole) {
  return (
    '<span class="frac-mixed" role="img" aria-label="' +
    esc(fracAriaLabel(num, den, whole)) +
    '">' +
    (whole != null ? '<span class="frac-mixed__whole">' + esc(String(whole)) + '</span>' : '') +
    '<span class="frac-inline" aria-hidden="true">' +
    '<span class="frac-num">' +
    esc(String(num)) +
    '</span>' +
    '<span class="frac-den">' +
    esc(String(den)) +
    '</span>' +
    '</span></span>'
  );
}

/*
 * Model visual pecahan: sejumlah bangun utuh yang dibagi `den` bagian
 * sama besar, dengan (whole × den + num) bagian diarsir. Pecahan
 * campuran tampil sebagai beberapa bangun penuh ditambah satu bangun
 * yang terarsir sebagian.
 *   opts.shape    'bar' (default, pita/cokelat batang) | 'circle' (pizza/martabak)
 *   opts.caption  teks kecil di bawah model (opsional)
 *   opts.aria     label aksesibel (default dibuat otomatis)
 *   opts.small    true → ukuran ringkas
 *   opts.wide     true → pita lebih lebar (untuk membandingkan beberapa
 *                 pita yang ditumpuk; semua pita sama panjang)
 *   opts.group    (pita saja) garis tebal setiap `group` bagian — mis.
 *                 buildFractionModel(6, 8, 0, { group: 2 }) menampilkan 6/8
 *                 yang potongannya digabung berdua-dua menjadi 3/4, atau
 *                 buildFractionModel(9, 12, 0, { group: 3 }) menampilkan 3/4
 *                 yang tiap bagiannya dipotong lagi menjadi 3 (9/12).
 *                 Diabaikan bila `den` tidak habis dibagi `group`.
 */
function buildFractionModel(num, den, whole, opts) {
  opts = opts || {};
  whole = whole || 0;
  den = Math.max(1, Math.round(den));
  var sisa = whole * den + Math.max(0, Math.round(num));
  var banyakBangun = Math.max(1, Math.ceil(sisa / den));
  var group = opts.group && den % opts.group === 0 ? opts.group : 0;
  var shapes = '';

  for (var b = 0; b < banyakBangun; b++) {
    var arsir = Math.min(den, sisa);
    sisa -= arsir;
    if (opts.shape === 'circle') {
      var r = 46;
      var c = 50;
      var parts = '';
      if (den === 1) {
        parts =
          '<circle class="frac-model__part' +
          (arsir ? ' is-on' : '') +
          '" cx="' +
          c +
          '" cy="' +
          c +
          '" r="' +
          r +
          '"/>';
      } else {
        for (var i = 0; i < den; i++) {
          var a0 = ((i / den) * 360 - 90) * (Math.PI / 180);
          var a1 = (((i + 1) / den) * 360 - 90) * (Math.PI / 180);
          var x0 = (c + r * Math.cos(a0)).toFixed(2);
          var y0 = (c + r * Math.sin(a0)).toFixed(2);
          var x1 = (c + r * Math.cos(a1)).toFixed(2);
          var y1 = (c + r * Math.sin(a1)).toFixed(2);
          parts +=
            '<path class="frac-model__part' +
            (i < arsir ? ' is-on' : '') +
            '" d="M' +
            c +
            ' ' +
            c +
            ' L' +
            x0 +
            ' ' +
            y0 +
            ' A' +
            r +
            ' ' +
            r +
            ' 0 ' +
            (1 / den > 0.5 ? 1 : 0) +
            ' 1 ' +
            x1 +
            ' ' +
            y1 +
            ' Z"/>';
        }
      }
      shapes +=
        '<svg class="frac-model__circle" viewBox="0 0 100 100" aria-hidden="true">' +
        parts +
        '</svg>';
    } else {
      var cells = '';
      for (var j = 0; j < den; j++) {
        cells +=
          '<span class="frac-model__cell' +
          (j < arsir ? ' is-on' : '') +
          (group > 1 && (j + 1) % group === 0 && j < den - 1 ? ' is-group-end' : '') +
          '"></span>';
      }
      shapes +=
        '<span class="frac-model__bar" style="grid-template-columns:repeat(' +
        den +
        ',1fr)" aria-hidden="true">' +
        cells +
        '</span>';
    }
  }

  var aria =
    opts.aria ||
    (whole ? whole + ' bangun utuh terarsir penuh dan ' : '') +
      'satu bangun dibagi ' +
      den +
      ' bagian sama besar dengan ' +
      Math.round(num) +
      ' bagian terarsir';

  return (
    '<figure class="frac-model frac-model--' +
    (opts.shape === 'circle' ? 'circle' : 'bar') +
    (opts.small ? ' frac-model--small' : '') +
    (opts.wide ? ' frac-model--wide' : '') +
    '" role="img" aria-label="' +
    esc(aria) +
    '">' +
    '<div class="frac-model__shapes">' +
    shapes +
    '</div>' +
    (opts.caption
      ? '<figcaption class="frac-model__caption">' + opts.caption + '</figcaption>'
      : '') +
    '</figure>'
  );
}

/*
 * Kotak isian pecahan bersusun: bilangan bulat (opsional, di kiri),
 * pembilang di atas garis, penyebut di bawah garis — meniru cara murid
 * menulis pecahan di buku.
 *   id              awalan id DOM → <id>Whole, <id>Num, <id>Den
 *   value           { whole, num, den } berupa string (isian terakhir)
 *   opts.mixed      true → tampilkan kotak bilangan bulat
 *   opts.disabled   true → kunci isian
 *   opts.status     'ok' | 'bad' | '' → warna bingkai
 *   opts.aria       awalan label aksesibel (default 'Jawaban')
 */
function buildFractionInput(id, value, opts) {
  opts = opts || {};
  value = value || {};
  var dis = opts.disabled ? ' disabled' : '';
  var aria = opts.aria || 'Jawaban';
  function box(suffix, val, label, extra) {
    return (
      '<input type="text" inputmode="numeric" autocomplete="off" maxlength="3" class="frac-input__box' +
      (extra || '') +
      '" id="' +
      id +
      suffix +
      '" value="' +
      esc(val || '') +
      '" aria-label="' +
      esc(aria + ': ' + label) +
      '"' +
      dis +
      '/>'
    );
  }
  return (
    '<div class="frac-input' +
    (opts.status ? ' frac-input--' + opts.status : '') +
    '">' +
    (opts.mixed
      ? '<div class="frac-input__whole">' +
        box(
          'Whole',
          value.whole,
          'bilangan bulat (kosongkan bila tidak ada)',
          ' frac-input__box--whole'
        ) +
        '<span class="frac-input__cap">bulat</span>' +
        '</div>'
      : '') +
    '<div class="frac-input__stack">' +
    box('Num', value.num, 'pembilang') +
    '<span class="frac-input__line" aria-hidden="true"></span>' +
    box('Den', value.den, 'penyebut') +
    '</div>' +
    '</div>'
  );
}

/*
 * Membaca kotak isian buildFractionInput di dalam `root`.
 * Mengembalikan { raw, value, error }:
 *   raw    { whole, num, den } string apa adanya (untuk disimpan di State)
 *   value  { whole, num, den } bilangan cacah (whole null bila kosong)
 *   error  null | 'empty' (pembilang/penyebut kosong) | 'invalid' | 'zero-den'
 */
function readFractionInput(root, id) {
  function get(suffix) {
    var el = root.querySelector('#' + id + suffix);
    return el ? el.value.trim() : '';
  }
  var raw = { whole: get('Whole'), num: get('Num'), den: get('Den') };
  if (raw.num === '' || raw.den === '') return { raw: raw, value: null, error: 'empty' };
  var cacah = /^\d+$/;
  if (
    !cacah.test(raw.num) ||
    !cacah.test(raw.den) ||
    (raw.whole !== '' && !cacah.test(raw.whole))
  ) {
    return { raw: raw, value: null, error: 'invalid' };
  }
  var value = {
    whole: raw.whole === '' ? null : parseInt(raw.whole, 10),
    num: parseInt(raw.num, 10),
    den: parseInt(raw.den, 10),
  };
  if (value.den === 0) return { raw: raw, value: value, error: 'zero-den' };
  return { raw: raw, value: value, error: null };
}

/* ============================================================
   11. PECAHAN SENILAI & KOMPONEN URUT-KETUK
   Dipakai modul menyederhanakan & menyamakan penyebut pecahan
   (fase-d/mpi-1.4). Gaya .order-picker ada di shared/base.css.
   ============================================================ */

/* Apakah a/b senilai dengan c/d? Pecahan berupa { num, den }. */
function pecahanSetara(a, b) {
  return a.num * b.den === b.num * a.den;
}

/*
 * Bentuk paling sederhana num/den: pembilang dan penyebut dibagi FPB-nya.
 *   sederhanakanPecahan(6, 8) → { num: 3, den: 4, fpb: 2 }
 */
function sederhanakanPecahan(num, den) {
  var f = gcd(num, den) || 1;
  return { num: num / f, den: den / f, fpb: f };
}

/*
 * Mendiagnosis jawaban "sederhanakan asal":
 *   'tepat'           senilai dengan asal DAN FPB pembilang-penyebutnya 1
 *   'belum-sederhana' senilai, tetapi masih bisa dibagi lagi
 *   'tidak-setara'    nilainya berubah
 * `v` dan `asal` berupa { num, den }.
 */
function diagnosaSederhana(v, asal) {
  if (!v.den || !pecahanSetara(v, asal)) return 'tidak-setara';
  return gcd(v.num, v.den) === 1 ? 'tepat' : 'belum-sederhana';
}

/*
 * Komponen urut-ketuk: murid mengetuk butir satu per satu untuk mengisi
 * urutan (mis. dari paling besar ke paling kecil, atau langkah-langkah
 * rencana penyelidikan). Butir di "kolam" tampil dalam urutan ACAK yang
 * disimpan di State, sehingga stabil lintas render/reload namun teracak
 * ulang setiap Reset.
 *
 *   items         [{ id, label }]   label boleh HTML
 *   correctOrder  [id, ...]         urutan benar
 *
 * ensureOrderPicker(state, key, items) menyiapkan state[key]:
 *   { order, picked, done, correct, attempts, salah }
 */
function ensureOrderPicker(state, key, items) {
  var st = state[key];
  if (!st || typeof st !== 'object' || !Array.isArray(st.picked)) {
    st = { order: null, picked: [], done: false, correct: false, attempts: 0, salah: false };
  }
  var ids = optionIds(items);
  st.picked = st.picked.filter(function (id) {
    return ids.indexOf(id) !== -1;
  });
  ensureShuffledOrder(st, 'order', items);
  state[key] = st;
  return st;
}

/*
 * Merender komponen urut-ketuk.
 *   id                awalan id/atribut DOM
 *   opts.slotLabels   label tiap posisi (mis. ['Paling laris', '', 'Paling sedikit'])
 *   opts.correctOrder urutan benar (untuk menandai posisi setelah diperiksa)
 *   opts.checkLabel   teks tombol periksa (default 'Periksa Urutan')
 */
function buildOrderPicker(id, items, st, opts) {
  opts = opts || {};
  var byId = {};
  items.forEach(function (it) {
    byId[it.id] = it;
  });
  var lengkap = st.picked.length === items.length;
  var slots = '';
  for (var i = 0; i < items.length; i++) {
    var pid = st.picked[i];
    var cls = 'order-picker__slot';
    if (pid && (st.done || st.salah) && opts.correctOrder) {
      cls += opts.correctOrder[i] === pid ? ' is-ok' : ' is-bad';
    }
    var label = opts.slotLabels && opts.slotLabels[i] ? opts.slotLabels[i] : '';
    slots +=
      '<li class="' +
      cls +
      '">' +
      '<span class="order-picker__rank">' +
      (i + 1) +
      '</span>' +
      (pid
        ? '<button type="button" class="order-picker__chip" data-' +
          id +
          '-unpick="' +
          esc(pid) +
          '"' +
          (st.done ? ' disabled' : '') +
          ' aria-label="Keluarkan dari urutan ke-' +
          (i + 1) +
          '">' +
          byId[pid].label +
          '</button>'
        : '<span class="order-picker__empty">' +
          (label ? esc(label) : 'ketuk pilihan di bawah') +
          '</span>') +
      '</li>';
  }
  var pool = orderByIds(items, st.order)
    .filter(function (it) {
      return st.picked.indexOf(it.id) === -1;
    })
    .map(function (it) {
      return (
        '<button type="button" class="order-picker__chip order-picker__chip--pool" data-' +
        id +
        '-pick="' +
        esc(it.id) +
        '">' +
        it.label +
        '</button>'
      );
    })
    .join('');
  return (
    '<div class="order-picker" id="' +
    id +
    '">' +
    '<ol class="order-picker__slots">' +
    slots +
    '</ol>' +
    (st.done
      ? ''
      : '<div class="order-picker__pool" role="group" aria-label="Pilihan yang belum diurutkan">' +
        (pool || '<span class="dl-caption">Semua sudah diurutkan.</span>') +
        '</div>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary" id="' +
        id +
        'Check"' +
        (lengkap ? '' : ' disabled') +
        '>' +
        esc(opts.checkLabel || 'Periksa Urutan') +
        '</button>' +
        (st.picked.length
          ? '<button type="button" class="btn btn--ghost" id="' + id + 'Clear">Ulangi</button>'
          : '') +
        '</div>') +
    '</div>'
  );
}

/*
 * Memasang event buildOrderPicker di dalam `root`. Urutan dianggap benar
 * bila sama persis dengan `correctOrder`; `save` lalu `rerender`
 * dipanggil setelah setiap perubahan.
 */
function bindOrderPicker(root, id, items, st, correctOrder, save, rerender) {
  root.querySelectorAll('[data-' + id + '-pick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (st.done) return;
      st.picked.push(btn.getAttribute('data-' + id + '-pick'));
      st.salah = false;
      save();
      rerender();
    });
  });
  root.querySelectorAll('[data-' + id + '-unpick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (st.done) return;
      var pid = btn.getAttribute('data-' + id + '-unpick');
      st.picked = st.picked.filter(function (x) {
        return x !== pid;
      });
      st.salah = false;
      save();
      rerender();
    });
  });
  var clear = root.querySelector('#' + id + 'Clear');
  if (clear) {
    clear.addEventListener('click', function () {
      st.picked = [];
      st.salah = false;
      save();
      rerender();
    });
  }
  var check = root.querySelector('#' + id + 'Check');
  if (check) {
    check.addEventListener('click', function () {
      if (st.picked.length !== items.length) return;
      st.attempts += 1;
      st.correct = st.picked.every(function (x, i) {
        return x === correctOrder[i];
      });
      st.done = st.correct;
      st.salah = !st.correct;
      save();
      rerender();
    });
  }
}
