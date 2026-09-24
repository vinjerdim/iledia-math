'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Barisan dan Deret Aritmetika
   Fase F — SMK Rekayasa Perangkat Lunak

   Utilitas & komponen bersama (esc, parseInputInt, formatNumber,
   shuffleArray, showNotice, buildFeedbackBox, createStageMachine,
   createExerciseStage, createStore, ensureExerciseArray, serta
   komponen Discovery Learning: ensureShuffledOrder, orderByIds,
   buildDiscoveryHead, buildTeacherNote, buildChoiceGroup,
   buildHintStack, buildHintToggle, buildSequenceTiles) berada di
   shared/engine.js.

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaan dan rangkaian aktivitasnya.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI saat
   state disiapkan (initExerciseArrays), lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat-lompat
   ketika tahap dirender ulang, tetapi teracak ulang setiap Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi            (DL sintaks 1)
    6. Stage: Identifikasi Masalah (DL sintaks 2)
    7. Stage: Pengumpulan Data     (DL sintaks 3)
    8. Stage: Olah Data — Uₙ       (DL sintaks 4)
    9. Stage: Olah Data — Sₙ       (DL sintaks 4)
   10. Stage: Pembuktian           (DL sintaks 5)
   11. Stage: Menarik Kesimpulan   (DL sintaks 6)
   12. Stage: Uji Terap
   13. Stage: Refleksi
   14. Stage: Selesai
   15. Router Render
   16. Helper UI (modal reset)
   17. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'koleksi',
  'olahUn',
  'olahSn',
  'verifikasi',
  'generalisasi',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Stimulasi',
  'Masalah',
  'Data',
  'Rumus Uₙ',
  'Rumus Sₙ',
  'Bukti',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-1-1-aritmetika-dl-v2';

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'stimulasi',
  completedStages: {},

  /* Tahap 1 — stimulasi (dugaan, tidak dinilai) */
  stimulasiOrderUn: null,
  stimulasiOrderSn: null,
  stimulasiUn: null,
  stimulasiSn: null,
  stimulasiAlasan: '',

  /* Tahap 2 — identifikasi masalah */
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',

  /* Tahap 3 — pengumpulan data */
  koleksiIdx: 0,
  koleksiCtx: [],
  pilahExercises: [],

  /* Tahap 4a — rumus Uₙ */
  olahUnInputs: [],
  olahUnChecked: false,
  olahUnHint: 0,
  olahUnRumusOrder: null,
  olahUnRumus: null,
  olahUnUji: null,

  /* Tahap 4b — rumus Sₙ */
  olahSnSteps: [],
  olahSnOrder1: null,
  olahSnPilih1: null,
  olahSnOrder2: null,
  olahSnPilih2: null,

  /* Tahap 5 — pembuktian */
  verifSteps: [],

  /* Tahap 6 — menarik kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 7 — uji terap */
  terapkanIdx: 0,
  terapkanExercises: [],

  /* Tahap 8 — refleksi */
  refleksiAnswers: {},
  refleksiDiri: null,
  refleksiDiriOrder: null,
};

var Store = createStore({ key: STORAGE_KEY, state: State });
var saveState = Store.save;
var loadState = Store.load;

function clearState() {
  Store.reset();
  initExerciseArrays();
}

/* State default satu isian numerik bertahap (petunjuk + status). */
function makeNumStep() {
  return { input: '', done: false, salah: false, attempts: 0, hintLevel: 0 };
}

/*
 * Menyiapkan seluruh array state per-soal DAN seluruh urutan acak
 * pilihan jawaban. Dipanggil sekali saat init (setelah loadState) dan
 * setiap kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'stimulasiOrderUn', DATA.stimulasi.opsiUn);
  ensureShuffledOrder(State, 'stimulasiOrderSn', DATA.stimulasi.opsiSn);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  ensureExerciseArray(State, 'koleksiCtx', DATA.koleksi.konteks, function () {
    return { reveal: 3, a: '', b: '', attempts: 0, hintLevel: 0, done: false, salah: false };
  });
  if (State.koleksiIdx < 0 || State.koleksiIdx >= DATA.koleksi.konteks.length) {
    State.koleksiIdx = 0;
  }
  ensureExerciseArray(State, 'pilahExercises', DATA.koleksi.pilah, function () {
    return {
      chosen: null,
      correct: false,
      optionOrder: shuffleArray(optionIds(DATA.koleksi.opsiPilah)),
    };
  });

  /* Tahap 4a */
  if (
    !Array.isArray(State.olahUnInputs) ||
    State.olahUnInputs.length !== DATA.olahUn.baris.length
  ) {
    State.olahUnInputs = DATA.olahUn.baris.map(function () {
      return '';
    });
  }
  ensureShuffledOrder(State, 'olahUnRumusOrder', DATA.olahUn.opsiRumus);
  if (!State.olahUnUji || typeof State.olahUnUji !== 'object') State.olahUnUji = makeNumStep();

  /* Tahap 4b */
  ensureExerciseArray(State, 'olahSnSteps', DATA.olahSn.langkah, makeNumStep);
  ensureShuffledOrder(State, 'olahSnOrder1', DATA.olahSn.opsi1);
  ensureShuffledOrder(State, 'olahSnOrder2', DATA.olahSn.opsi2);

  /* Tahap 5 */
  ensureExerciseArray(State, 'verifSteps', DATA.verifikasi.uji, makeNumStep);

  /* Tahap 6 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);

  /* Tahap 7 — uji terap (dirender createExerciseStage) */
  ensureExerciseArray(State, 'terapkanExercises', DATA.terapkan.soal, function (s) {
    return {
      attempts: 0,
      hintLevel: 0,
      hintShown: false,
      correct: false,
      userInput: '',
      revealed: false,
      chosen: null,
      checked: false,
      optionOrder: s.options ? shuffleArray(optionIds(s.options)) : null,
    };
  });
  if (State.terapkanIdx >= DATA.terapkan.soal.length || State.terapkanIdx < 0) {
    State.terapkanIdx = 0;
  }

  /* Tahap 8 */
  ensureShuffledOrder(State, 'refleksiDiriOrder', DATA.refleksi.diriOpsi);
}

/* ============================================================
   3. NAVIGASI
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
   4. UTILITAS RENDER
   ============================================================ */

/* Kepala tahap + catatan peran guru. */
function buildHead(D) {
  return buildDiscoveryHead(D.kicker, D.goal, D.syntax) + buildTeacherNote(D.guru);
}

function findLabel(options, id) {
  for (var i = 0; i < options.length; i++) {
    if (options[i].id === id) return options[i].label;
  }
  return '';
}

/* Format angka dengan minus tipografis. */
function fmt(n) {
  return formatNumber(n, '−');
}

/*
 * Kotak isian bilangan. `allowNegative` menghapus inputmode numerik
 * agar tombol minus tersedia pada keyboard ponsel.
 */
function numInput(id, value, opts) {
  opts = opts || {};
  return (
    '<input type="text" class="input-text dl-num-input' +
    (opts.error ? ' has-error' : '') +
    '" id="' +
    id +
    '"' +
    (opts.allowNegative ? '' : ' inputmode="numeric"') +
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

/* Membaca & memvalidasi isian bilangan bulat; null bila tidak valid. */
function readInt(val) {
  var parsed = parseInputInt(val, true);
  if (parsed.error) {
    showNotice(
      parsed.error === 'empty'
        ? 'Isi jawabanmu terlebih dahulu.'
        : 'Tulis jawaban berupa bilangan bulat, mis. 12 atau −40.'
    );
    return null;
  }
  return parsed.value;
}

/*
 * Satu langkah isian bertahap: label, isian, tombol Periksa & Petunjuk,
 * umpan balik, dan teks temuan setelah benar.
 *   id    awalan id DOM (mis. 'sn0')
 *   st    state langkah (makeNumStep)
 *   step  { label, hints, temuan|bukti }
 */
function buildNumStep(id, st, step, num) {
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
    numInput(id + 'Input', st.input, { error: st.salah, allowNegative: step.allowNegative }) +
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

/* Memasang event untuk buildNumStep. `rerender` dipanggil setelah perubahan. */
function bindNumStep(id, st, step, rerender) {
  var inp = document.getElementById(id + 'Input');
  var btn = document.getElementById(id + 'Check');
  var hint = document.getElementById(id + 'Hint');
  if (inp && btn) {
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') btn.click();
    });
    btn.addEventListener('click', function () {
      var v = readInt(inp.value);
      if (v === null) return;
      st.input = inp.value.trim();
      st.attempts += 1;
      st.done = v === step.jawab;
      st.salah = !st.done;
      saveState();
      rerender();
    });
  }
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = Math.min(st.hintLevel + 1, step.hints.length);
      saveState();
      rerender();
    });
  }
}

/* Panel dengan judul kecil. */
function panel(inner, cls) {
  return '<div class="panel' + (cls ? ' ' + cls : '') + '">' + inner + '</div>';
}

function nextButton(id, label, large) {
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

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah;
   dugaan diuji sendiri oleh murid pada tahap Pembuktian.
   ============================================================ */

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var terisi = !!(State.stimulasiUn && State.stimulasiSn);

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    panel(
      '<h2 style="margin-top:0;">🎮 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        buildSequenceTiles(D.terms, { labels: D.labels, more: true, tail: D.tail }) +
        '<p class="dl-caption">Angka di dalam kotak = XP yang dibutuhkan untuk naik dari level tersebut.</p>',
      'panel--hero'
    ) +
    panel(
      '<p class="exercise-label">' +
        esc(D.pertanyaanUn) +
        '</p>' +
        buildChoiceGroup(D.opsiUn, State.stimulasiOrderUn, {
          chosen: State.stimulasiUn,
          group: 'un',
        }) +
        '<p class="exercise-label" style="margin-top:var(--space-5);">' +
        esc(D.pertanyaanSn) +
        '</p>' +
        buildChoiceGroup(D.opsiSn, State.stimulasiOrderSn, {
          chosen: State.stimulasiSn,
          group: 'sn',
        }) +
        '<div class="field-group" style="margin-top:var(--space-5);">' +
        '<label for="stimulasiAlasan">' +
        esc(D.alasanLabel) +
        '</label>' +
        '<textarea id="stimulasiAlasan" class="input-textarea" placeholder="' +
        esc(D.alasanPlaceholder) +
        '">' +
        esc(State.stimulasiAlasan) +
        '</textarea>' +
        '</div>' +
        buildFeedbackBox('info', '🔎', esc(D.catatan))
    ) +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="stimulasiNextBtn"' +
    (terisi ? '' : ' disabled') +
    '>' +
    esc(D.nextLabel) +
    '</button>' +
    '</div>' +
    '</section>';

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.dataset.group === 'un') State.stimulasiUn = btn.dataset.optId;
      else State.stimulasiSn = btn.dataset.optId;
      saveState();
      renderStimulasi(container);
    });
  });

  var ta = document.getElementById('stimulasiAlasan');
  ta.addEventListener('input', function () {
    State.stimulasiAlasan = ta.value;
    saveState();
  });

  document.getElementById('stimulasiNextBtn').addEventListener('click', function () {
    if (!State.stimulasiUn || !State.stimulasiSn) {
      showNotice('Pilih kedua dugaanmu sebelum melanjutkan.');
      return;
    }
    completeStage('stimulasi');
    navigateTo('masalah');
  });
}

/* ============================================================
   6. STAGE: IDENTIFIKASI MASALAH  (Discovery Learning — sintaks 2)
   ============================================================ */

function renderMasalah(container) {
  var D = DATA.masalah;
  var answered = !!State.masalahPilihan;
  var benar = State.masalahPilihan === D.correct;

  container.innerHTML =
    '<section aria-label="Identifikasi Masalah">' +
    buildHead(D) +
    panel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    panel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.masalahOrder, {
          chosen: State.masalahPilihan,
          correctId: benar ? D.correct : null,
          grade: true,
          locked: benar,
        }) +
        (answered
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              benar ? 'success' : 'warning',
              benar ? '✓' : '💭',
              D.umpan[State.masalahPilihan]
            ) +
            '</div>'
          : '')
    ) +
    (benar
      ? panel(
          '<div class="field-group">' +
            '<label for="masalahHipotesis">' +
            esc(D.hipotesisLabel) +
            '</label>' +
            '<textarea id="masalahHipotesis" class="input-textarea" placeholder="' +
            esc(D.hipotesisPlaceholder) +
            '">' +
            esc(State.masalahHipotesis) +
            '</textarea>' +
            '</div>'
        ) + nextButton('masalahNextBtn', D.nextLabel)
      : '') +
    '</section>';

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.masalahPilihan === D.correct) return;
      State.masalahPilihan = btn.dataset.optId;
      saveState();
      renderMasalah(container);
    });
  });

  var ta = document.getElementById('masalahHipotesis');
  if (ta) {
    ta.addEventListener('input', function () {
      State.masalahHipotesis = ta.value;
      saveState();
    });
  }

  var nextBtn = document.getElementById('masalahNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.masalahHipotesis.trim()) {
        showNotice('Tulis hipotesismu lebih dulu, walau hanya satu kalimat.');
        return;
      }
      completeStage('masalah');
      navigateTo('koleksi');
    });
  }
}

/* ============================================================
   7. STAGE: PENGUMPULAN DATA  (Discovery Learning — sintaks 3)
   Bagian A: ungkap suku & tentukan a, b pada tiga konteks.
   Bagian B: pilah barisan aritmetika / bukan (dibuka setelah A).
   ============================================================ */

function koleksiSemuaSelesai() {
  return State.koleksiCtx.every(function (c) {
    return c.done;
  });
}

function pilahSemuaDijawab() {
  return State.pilahExercises.every(function (e) {
    return !!e.chosen;
  });
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var idx = State.koleksiIdx;
  var ctx = D.konteks[idx];
  var st = State.koleksiCtx[idx];
  var bolehIsi = st.reveal >= D.minReveal;
  var semuaA = koleksiSemuaSelesai();

  var tabsHTML =
    '<div class="ctx-tabs" role="tablist" aria-label="Pilih data">' +
    D.konteks
      .map(function (c, i) {
        var s = State.koleksiCtx[i];
        return (
          '<button type="button" role="tab" class="ctx-tab' +
          (i === idx ? ' is-active' : '') +
          (s.done ? ' is-done' : '') +
          '" data-ctx="' +
          i +
          '" aria-selected="' +
          (i === idx) +
          '">' +
          '<span aria-hidden="true">' +
          c.icon +
          '</span> ' +
          esc(c.badge) +
          (s.done ? ' ✓' : '') +
          '</button>'
        );
      })
      .join('') +
    '</div>';

  var formHTML;
  if (st.done) {
    formHTML = buildFeedbackBox(
      'success',
      '✓',
      '<strong>a = ' +
        fmt(ctx.a) +
        '</strong> dan <strong>b = ' +
        fmt(ctx.b) +
        '</strong>. Selisih setiap dua suku berurutan selalu ' +
        fmt(ctx.b) +
        ' ' +
        esc(ctx.satuan) +
        '.'
    );
  } else {
    formHTML =
      '<div class="ab-form">' +
      '<label class="ab-field">Suku pertama (a) ' +
      numInput('abA', st.a, { disabled: !bolehIsi, aria: 'Suku pertama a', allowNegative: true }) +
      '</label>' +
      '<label class="ab-field">Beda (b) ' +
      numInput('abB', st.b, { disabled: !bolehIsi, aria: 'Beda b', allowNegative: true }) +
      '</label>' +
      '<div class="dl-input-row">' +
      '<button type="button" class="btn btn--primary" id="abCheck"' +
      (bolehIsi ? '' : ' disabled') +
      '>Periksa</button>' +
      buildHintToggle('abHint', ctx.hints, st.hintLevel) +
      '</div>' +
      '</div>' +
      (!bolehIsi
        ? '<p class="dl-caption">Ungkap minimal ' +
          D.minReveal +
          ' suku dulu sebelum mengisi a dan b.</p>'
        : '') +
      (st.salah
        ? '<div style="margin-top:var(--space-3);">' +
          buildFeedbackBox(
            'error',
            '✗',
            'Belum tepat. Hitung ulang selisih dua suku yang berurutan.'
          ) +
          '</div>'
        : '') +
      buildHintStack(ctx.hints, st.hintLevel);
  }

  var pilahHTML = '';
  if (semuaA) {
    pilahHTML =
      panel(
        '<h3 style="margin-top:0;">B. Pilah barisan</h3>' +
          '<p style="font-size:0.9rem;color:var(--color-ink-muted);">' +
          esc(D.instruksiB) +
          '</p>' +
          D.pilah
            .map(function (p, i) {
              var ex = State.pilahExercises[i];
              return (
                '<div class="pilah-item">' +
                '<p class="pilah-item__seq">' +
                esc(p.barisan) +
                '</p>' +
                buildChoiceGroup(D.opsiPilah, ex.optionOrder, {
                  chosen: ex.chosen,
                  correctId: p.correct,
                  grade: true,
                  locked: true,
                  group: String(i),
                }) +
                (ex.chosen
                  ? '<div style="margin-top:var(--space-2);">' +
                    buildFeedbackBox(
                      ex.correct ? 'success' : 'error',
                      ex.correct ? '✓' : '✗',
                      (ex.correct ? '<strong>Benar.</strong> ' : '<strong>Belum tepat.</strong> ') +
                        esc(p.explanation)
                    ) +
                    '</div>'
                  : '') +
                '</div>'
              );
            })
            .join('')
      ) + (pilahSemuaDijawab() ? nextButton('koleksiNextBtn', D.nextLabel) : '');
  }

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    panel(
      '<h3 style="margin-top:0;">A. Kumpulkan data</h3>' +
        '<p style="font-size:0.9rem;color:var(--color-ink-muted);">' +
        esc(D.instruksiA) +
        '</p>' +
        tabsHTML +
        '<div class="ctx-card">' +
        '<p class="ctx-card__story">' +
        esc(ctx.cerita) +
        '</p>' +
        buildSequenceTiles(ctx.terms, {
          labels: ctx.labels,
          reveal: st.reveal,
          showDiff: st.done,
          highlightLast: true,
        }) +
        '<div class="btn-group" style="margin:0 0 var(--space-4);">' +
        '<button type="button" class="btn btn--outline-primary btn--small" id="revealBtn"' +
        (st.reveal >= ctx.terms.length ? ' disabled' : '') +
        '>👁 Ungkap suku berikutnya</button>' +
        '<span class="dl-caption" style="align-self:center;">Satuan: ' +
        esc(ctx.satuan) +
        '</span>' +
        '</div>' +
        formHTML +
        '</div>' +
        (semuaA ? buildFeedbackBox('info', '🔍', D.temuanA) : '')
    ) +
    pilahHTML +
    '</section>';

  container.querySelectorAll('[data-ctx]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.koleksiIdx = +btn.dataset.ctx;
      saveState();
      renderKoleksi(container);
    });
  });

  document.getElementById('revealBtn').addEventListener('click', function () {
    st.reveal = Math.min(st.reveal + 1, ctx.terms.length);
    saveState();
    renderKoleksi(container);
  });

  var inA = document.getElementById('abA');
  var inB = document.getElementById('abB');
  var check = document.getElementById('abCheck');
  if (inA && inB && check) {
    inA.addEventListener('input', function () {
      st.a = inA.value;
    });
    inB.addEventListener('input', function () {
      st.b = inB.value;
    });
    [inA, inB].forEach(function (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') check.click();
      });
    });
    check.addEventListener('click', function () {
      var a = readInt(inA.value);
      if (a === null) return;
      var b = readInt(inB.value);
      if (b === null) return;
      st.a = inA.value.trim();
      st.b = inB.value.trim();
      st.attempts += 1;
      st.done = a === ctx.a && b === ctx.b;
      st.salah = !st.done;
      st.reveal = st.done ? ctx.terms.length : st.reveal;
      /* Beri tahu konteks berikutnya yang belum diselesaikan. */
      if (st.done) {
        for (var k = 0; k < State.koleksiCtx.length; k++) {
          if (!State.koleksiCtx[k].done) {
            showNotice('Mantap! Lanjutkan ke data "' + D.konteks[k].badge + '".');
            break;
          }
        }
      }
      saveState();
      renderKoleksi(container);
    });
  }

  var hint = document.getElementById('abHint');
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = Math.min(st.hintLevel + 1, ctx.hints.length);
      saveState();
      renderKoleksi(container);
    });
  }

  container.querySelectorAll('.pilah-item [data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = +btn.dataset.group;
      var ex = State.pilahExercises[i];
      if (ex.chosen) return;
      ex.chosen = btn.dataset.optId;
      ex.correct = ex.chosen === D.pilah[i].correct;
      saveState();
      renderKoleksi(container);
    });
  });

  var nextBtn = document.getElementById('koleksiNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('koleksi');
      navigateTo('olahUn');
    });
  }
}

/* ============================================================
   8. STAGE: OLAH DATA — RUMUS Uₙ  (Discovery Learning — sintaks 4)
   Tabel koefisien beda → pilih rumus umum → uji U₂₀.
   ============================================================ */

function olahUnTabelBenar() {
  return DATA.olahUn.baris.every(function (n, i) {
    var p = parseInputInt(State.olahUnInputs[i] || '', true);
    return !p.error && p.value === n - 1;
  });
}

function renderOlahUn(container) {
  var D = DATA.olahUn;
  var tabelBenar = State.olahUnChecked && olahUnTabelBenar();
  var rumusBenar = State.olahUnRumus === D.correctRumus;
  var uji = State.olahUnUji;

  var rowsHTML = D.baris
    .map(function (n, i) {
      var val = State.olahUnInputs[i] || '';
      var p = parseInputInt(val, true);
      var ok = !p.error && p.value === n - 1;
      var mark = '';
      if (State.olahUnChecked && val !== '') {
        mark = ok
          ? '<span class="un-row__mark un-row__mark--ok" aria-label="benar">✓</span>'
          : '<span class="un-row__mark un-row__mark--no" aria-label="salah">✗</span>';
      }
      var un = D.a + (n - 1) * D.b;
      var tampilUn = n <= 5 || (State.olahUnChecked && ok);
      return (
        '<tr class="un-row' +
        (State.olahUnChecked && val !== '' ? (ok ? ' un-row--ok' : ' un-row--no') : '') +
        '">' +
        '<th scope="row">U<sub>' +
        n +
        '</sub></th>' +
        '<td class="un-row__val">' +
        (tampilUn ? fmt(un) : '?') +
        '</td>' +
        '<td class="un-row__expr">= ' +
        D.a +
        ' + ' +
        '<input type="text" inputmode="numeric" class="input-text un-row__input" data-un="' +
        i +
        '" value="' +
        esc(val) +
        '" aria-label="Koefisien beda untuk U' +
        n +
        '"' +
        (tabelBenar ? ' disabled' : '') +
        '>' +
        ' × ' +
        D.b +
        mark +
        '</td>' +
        '</tr>'
      );
    })
    .join('');

  var rumusHTML = '';
  if (tabelBenar) {
    rumusHTML = panel(
      buildFeedbackBox('info', '🔍', D.temuanTabel) +
        '<p class="exercise-label" style="margin-top:var(--space-4);">' +
        esc(D.pertanyaanRumus) +
        '</p>' +
        buildChoiceGroup(D.opsiRumus, State.olahUnRumusOrder, {
          chosen: State.olahUnRumus,
          correctId: rumusBenar ? D.correctRumus : null,
          grade: true,
          locked: rumusBenar,
        }) +
        (State.olahUnRumus
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              rumusBenar ? 'success' : 'warning',
              rumusBenar ? '✓' : '💭',
              D.umpanRumus[State.olahUnRumus]
            ) +
            '</div>'
          : '')
    );
  }

  var ujiHTML = '';
  if (rumusBenar) {
    ujiHTML =
      panel(
        '<div class="formula-card">Uₙ = a + (n − 1)b</div>' +
          buildNumStep('unUji', uji, {
            label: D.ujiLabel,
            hints: D.ujiHints,
            temuan: 'U₂₀ = 12 + 19 × 3 = <strong>69 kursi</strong>. Tanpa menulis 20 suku!',
          })
      ) + (uji.done ? nextButton('olahUnNextBtn', D.nextLabel) : '');
  }

  container.innerHTML =
    '<section aria-label="Olah Data Rumus Suku ke-n">' +
    buildHead(D) +
    panel(
      '<p class="dl-caption" style="margin-top:0;">' +
        esc(D.konteks) +
        '</p>' +
        buildSequenceTiles([12, 15, 18, 21, 24], { showDiff: true, more: true }) +
        '<p style="font-size:0.9rem;">' +
        esc(D.instruksi) +
        '</p>' +
        '<div class="un-table-wrap">' +
        '<table class="un-table">' +
        '<thead><tr><th scope="col">Suku</th><th scope="col">Nilai</th><th scope="col">a + (… × b)</th></tr></thead>' +
        '<tbody>' +
        rowsHTML +
        '</tbody>' +
        '</table>' +
        '</div>' +
        (tabelBenar
          ? ''
          : '<div class="dl-input-row" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="unTabelCheck">Periksa Tabel</button>' +
            buildHintToggle('unTabelHint', D.hints, State.olahUnHint) +
            '</div>' +
            buildHintStack(D.hints, State.olahUnHint))
    ) +
    rumusHTML +
    ujiHTML +
    '</section>';

  container.querySelectorAll('[data-un]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      State.olahUnInputs[+inp.dataset.un] = inp.value;
      saveState();
    });
    inp.addEventListener('keydown', function (e) {
      var btn = document.getElementById('unTabelCheck');
      if (e.key === 'Enter' && btn) btn.click();
    });
  });

  var tabelCheck = document.getElementById('unTabelCheck');
  if (tabelCheck) {
    tabelCheck.addEventListener('click', function () {
      var kosong = State.olahUnInputs.some(function (v) {
        return !String(v || '').trim();
      });
      if (kosong) {
        showNotice('Lengkapi semua baris tabel terlebih dahulu.');
        return;
      }
      State.olahUnChecked = true;
      saveState();
      if (!olahUnTabelBenar()) showNotice('Masih ada baris yang belum tepat. Perhatikan tanda ✗.');
      renderOlahUn(container);
    });
  }

  var tabelHint = document.getElementById('unTabelHint');
  if (tabelHint) {
    tabelHint.addEventListener('click', function () {
      State.olahUnHint = Math.min(State.olahUnHint + 1, D.hints.length);
      saveState();
      renderOlahUn(container);
    });
  }

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.olahUnRumus === D.correctRumus) return;
      State.olahUnRumus = btn.dataset.optId;
      saveState();
      renderOlahUn(container);
    });
  });

  if (rumusBenar) {
    bindNumStep('unUji', uji, { jawab: D.ujiJawab, hints: D.ujiHints }, function () {
      renderOlahUn(container);
    });
  }

  var nextBtn = document.getElementById('olahUnNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('olahUn');
      navigateTo('olahSn');
    });
  }
}

/* ============================================================
   9. STAGE: OLAH DATA — RUMUS Sₙ  (Discovery Learning — sintaks 4)
   Trik Gauss: deret maju + deret mundur → pasangan bernilai sama.
   ============================================================ */

function buildGaussGrid(terms, showSum) {
  var n = terms.length;
  var mundur = terms.slice().reverse();
  function row(label, arr, cls) {
    return (
      '<div class="gauss-row' +
      (cls ? ' ' + cls : '') +
      '">' +
      '<span class="gauss-row__label">' +
      label +
      '</span>' +
      arr
        .map(function (v, i) {
          return (
            (i > 0 ? '<span class="gauss-op" aria-hidden="true">+</span>' : '') +
            '<span class="gauss-cell">' +
            v +
            '</span>'
          );
        })
        .join('') +
      '</div>'
    );
  }
  var sums = [];
  for (var i = 0; i < n; i++) sums.push(showSum ? terms[i] + mundur[i] : '?');
  return (
    '<div class="gauss-grid" role="img" aria-label="Deret ditulis maju dan mundur, lalu dijumlahkan per pasangan">' +
    row('S₆ =', terms) +
    row('S₆ =', mundur, 'gauss-row--rev') +
    row('2S₆ =', sums, 'gauss-row--sum') +
    '</div>'
  );
}

function renderOlahSn(container) {
  var D = DATA.olahSn;
  var steps = State.olahSnSteps;
  var langkahSelesai = steps.every(function (s) {
    return s.done;
  });
  var benar1 = State.olahSnPilih1 === D.correct1;
  var benar2 = State.olahSnPilih2 === D.correct2;

  var stepsHTML = '';
  for (var i = 0; i < D.langkah.length; i++) {
    stepsHTML += buildNumStep('sn' + i, steps[i], D.langkah[i], i + 1);
    if (!steps[i].done) break;
  }

  var pilih1HTML = '';
  if (langkahSelesai) {
    pilih1HTML = panel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan1) +
        '</p>' +
        buildChoiceGroup(D.opsi1, State.olahSnOrder1, {
          chosen: State.olahSnPilih1,
          correctId: benar1 ? D.correct1 : null,
          grade: true,
          locked: benar1,
          group: 'p1',
        }) +
        (State.olahSnPilih1
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              benar1 ? 'success' : 'warning',
              benar1 ? '✓' : '💭',
              D.umpan1[State.olahSnPilih1]
            ) +
            '</div>'
          : '')
    );
  }

  var pilih2HTML = '';
  if (benar1) {
    pilih2HTML = panel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan2) +
        '</p>' +
        buildChoiceGroup(D.opsi2, State.olahSnOrder2, {
          chosen: State.olahSnPilih2,
          correctId: benar2 ? D.correct2 : null,
          grade: true,
          locked: benar2,
          group: 'p2',
        }) +
        (State.olahSnPilih2
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              benar2 ? 'success' : 'warning',
              benar2 ? '✓' : '💭',
              D.umpan2[State.olahSnPilih2]
            ) +
            '</div>'
          : '') +
        (benar2
          ? '<div class="formula-card">Sₙ = n/2 × (a + Uₙ) = n/2 × (2a + (n − 1)b)</div>'
          : '')
    );
  }

  container.innerHTML =
    '<section aria-label="Olah Data Rumus Jumlah n Suku">' +
    buildHead(D) +
    panel(
      '<p class="dl-caption" style="margin-top:0;">' +
        esc(D.konteks) +
        '</p>' +
        '<p style="font-size:0.9rem;">Tulis deretnya <strong>maju</strong>, lalu tulis lagi <strong>mundur</strong> tepat di bawahnya. Jumlahkan setiap pasangan atas–bawah.</p>' +
        buildGaussGrid(D.terms, steps[0].done) +
        stepsHTML
    ) +
    pilih1HTML +
    pilih2HTML +
    (benar2 ? nextButton('olahSnNextBtn', D.nextLabel) : '') +
    '</section>';

  D.langkah.forEach(function (step, k) {
    bindNumStep('sn' + k, steps[k], step, function () {
      renderOlahSn(container);
    });
  });

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.dataset.group === 'p1') {
        if (State.olahSnPilih1 === D.correct1) return;
        State.olahSnPilih1 = btn.dataset.optId;
      } else {
        if (State.olahSnPilih2 === D.correct2) return;
        State.olahSnPilih2 = btn.dataset.optId;
      }
      saveState();
      renderOlahSn(container);
    });
  });

  var nextBtn = document.getElementById('olahSnNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('olahSn');
      navigateTo('verifikasi');
    });
  }
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A: uji rumus pada data hosting. B: buktikan dugaan awal.
   ============================================================ */

function verifGrupSelesai(grup) {
  return DATA.verifikasi.uji.every(function (u, i) {
    return u.grup !== grup || State.verifSteps[i].done;
  });
}

function buildGrupSteps(grup) {
  var html = '';
  var no = 0;
  DATA.verifikasi.uji.forEach(function (u, i) {
    if (u.grup !== grup) return;
    no += 1;
    html += buildNumStep('vf' + i, State.verifSteps[i], u, no);
  });
  return html;
}

function buildDugaanBanding() {
  var S = DATA.stimulasi;
  var V = DATA.verifikasi;
  function baris(judul, opsi, chosen, benarId) {
    var cocok = chosen === benarId;
    return (
      '<div class="dugaan-row' +
      (cocok ? ' dugaan-row--ok' : '') +
      '">' +
      '<span class="dugaan-row__title">' +
      judul +
      '</span>' +
      '<span>Dugaanmu: <strong>' +
      esc(findLabel(opsi, chosen) || '—') +
      '</strong></span>' +
      '<span>Hasil rumus: <strong>' +
      esc(findLabel(opsi, benarId)) +
      '</strong></span>' +
      '<span class="dugaan-row__verdict">' +
      (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh rumus') +
      '</span>' +
      '</div>'
    );
  }
  return (
    '<div class="dugaan-compare">' +
    baris('XP Level 20', S.opsiUn, State.stimulasiUn, V.dugaanUnBenar) +
    baris('Total XP Level 1–20', S.opsiSn, State.stimulasiSn, V.dugaanSnBenar) +
    '</div>' +
    buildFeedbackBox(
      'info',
      '🧠',
      'Menduga lalu menguji adalah cara kerja ilmuwan dan programmer. Rumus membuat kita yakin tanpa harus menulis 20 suku satu per satu.'
    )
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var selesaiA = verifGrupSelesai('A');
  var selesaiB = verifGrupSelesai('B');

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    panel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        buildSequenceTiles(DATA.koleksi.konteks[1].terms, {
          labels: DATA.koleksi.konteks[1].labels,
          showDiff: true,
        }) +
        buildGrupSteps('A')
    ) +
    (selesaiA
      ? panel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            buildSequenceTiles(DATA.stimulasi.terms, {
              labels: DATA.stimulasi.labels,
              showDiff: true,
              more: true,
              tail: { label: 'Level 20', value: selesaiB ? '690' : '?' },
            }) +
            buildGrupSteps('B') +
            (selesaiB ? buildDugaanBanding() : '')
        )
      : '') +
    (selesaiA && selesaiB ? nextButton('verifNextBtn', D.nextLabel) : '') +
    '</section>';

  D.uji.forEach(function (u, i) {
    bindNumStep('vf' + i, State.verifSteps[i], u, function () {
      renderVerifikasi(container);
    });
  });

  var nextBtn = document.getElementById('verifNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('verifikasi');
      navigateTo('generalisasi');
    });
  }
}

/* ============================================================
   11. STAGE: MENARIK KESIMPULAN  (Discovery Learning — sintaks 6)
   ============================================================ */

function simpulanSemuaBenar() {
  return DATA.generalisasi.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function renderGeneralisasi(container) {
  var D = DATA.generalisasi;
  var bank = orderByIds(D.bank, State.bankOrder);
  var benarSemua = simpulanSemuaBenar();
  var diperiksa = State.simpulanChecked;

  var kalimatHTML = D.kalimat
    .map(function (g, i) {
      var dipilih = State.simpulanPilihan[g.id] || '';
      var status = '';
      if (diperiksa && dipilih) {
        status =
          dipilih === g.correct ? ' dl-simpulan-item--correct' : ' dl-simpulan-item--incorrect';
      }
      return (
        '<div class="dl-simpulan-item' +
        status +
        '">' +
        '<span class="dl-simpulan-item__num">' +
        (i + 1) +
        '</span>' +
        '<div class="dl-simpulan-item__body">' +
        '<label for="simp-' +
        g.id +
        '" class="dl-simpulan-item__awal">' +
        esc(g.awal) +
        ' …</label>' +
        '<select class="input-select" id="simp-' +
        g.id +
        '" data-simp="' +
        g.id +
        '"' +
        (benarSemua ? ' disabled' : '') +
        '>' +
        '<option value="">' +
        esc(D.selectPlaceholder) +
        '</option>' +
        bank
          .map(function (b) {
            return (
              '<option value="' +
              esc(b.id) +
              '"' +
              (dipilih === b.id ? ' selected' : '') +
              '>' +
              esc(b.teks) +
              '</option>'
            );
          })
          .join('') +
        '</select>' +
        (diperiksa && dipilih && dipilih !== g.correct
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali temuanmu, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Menarik Kesimpulan">' +
    buildHead(D) +
    panel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    panel(
      kalimatHTML +
        (benarSemua
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah konsep yang kamu temukan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? panel(
          '<h3 style="margin-top:0;">Rangkuman Barisan &amp; Deret Aritmetika</h3>' +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + r + '</li>'
                );
              })
              .join('') +
            '</ol>',
          'panel--hero'
        ) + nextButton('simpulanNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  container.querySelectorAll('[data-simp]').forEach(function (sel) {
    sel.addEventListener('change', function () {
      State.simpulanPilihan[sel.dataset.simp] = sel.value;
      saveState();
    });
  });

  var checkBtn = document.getElementById('simpulanCheckBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      var adaKosong = D.kalimat.some(function (g) {
        return !State.simpulanPilihan[g.id];
      });
      if (adaKosong) {
        showNotice('Lengkapi keempat kalimat lebih dulu.');
        return;
      }
      var terpakai = {};
      var ganda = false;
      D.kalimat.forEach(function (g) {
        var v = State.simpulanPilihan[g.id];
        if (terpakai[v]) ganda = true;
        terpakai[v] = true;
      });
      State.simpulanChecked = true;
      saveState();
      if (ganda) showNotice('Setiap potongan kalimat hanya dipakai satu kali.');
      else if (!simpulanSemuaBenar())
        showNotice('Masih ada yang belum tepat. Periksa tanda merahnya.');
      renderGeneralisasi(container);
    });
  }

  var nextBtn = document.getElementById('simpulanNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('generalisasi');
      navigateTo('terapkan');
    });
  }
}

/* ============================================================
   12. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js): campuran soal 'input'
   dan 'choice'; urutan opsi dari ex.optionOrder yang diacak di
   initExerciseArrays().
   ============================================================ */

var TerapkanStage = createExerciseStage({
  soal: DATA.terapkan.soal,
  getExercises: function () {
    return State.terapkanExercises;
  },
  getIndex: function () {
    return State.terapkanIdx;
  },
  setIndex: function (i) {
    State.terapkanIdx = i;
  },
  save: saveState,
  idPrefix: 'tr',
  sectionLabel: 'Uji Terap',
  kicker: DATA.terapkan.kicker,
  goal: DATA.terapkan.goal,
  instruction: DATA.terapkan.instruksi,
  buildHead: function () {
    return buildHead(DATA.terapkan);
  },
  nextStageId: 'refleksi',
  completeStageId: 'terapkan',
  nextButtonLabel: DATA.terapkan.nextLabel,
  defaultType: 'input',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  inputRowClass: 'dl-input-row',
  inputAriaLabel: 'Jawabanmu',
  inputPlaceholder: 'Jawabanmu',
  stripPunctuation: true,
  revealButtonStyle: 'separate',
  invalidMessage: 'Tulis jawaban berupa bilangan bulat, mis. 2.200.000 atau 16.',
  checkValue: function (s) {
    return s.jawab;
  },
  revealText: function (s) {
    return s.reveal;
  },
  renderPrompt: function (s) {
    return (
      '<div class="dl-prompt">' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
      '<p class="dl-prompt__tanya">' +
      s.pertanyaan +
      '</p>' +
      '</div>'
    );
  },
});

function renderTerapkan(container) {
  TerapkanStage.render(container);
}

/* ============================================================
   13. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var benarPilah = State.pilahExercises.filter(function (e) {
    return e.correct;
  }).length;
  var benarTerap = State.terapkanExercises.filter(function (e) {
    return e.correct;
  }).length;
  var langkahSekaliCoba = State.olahSnSteps.concat(State.verifSteps).filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  var totalLangkah = State.olahSnSteps.length + State.verifSteps.length;

  function kartu(val, label) {
    return (
      '<div class="summary-card"><div class="summary-card__val">' +
      val +
      '</div><div class="summary-card__label">' +
      label +
      '</div></div>'
    );
  }

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    buildHead(D) +
    panel(
      '<div class="summary-grid">' +
        kartu(benarPilah + '/' + DATA.koleksi.pilah.length, 'Pemilahan barisan benar') +
        kartu(langkahSekaliCoba + '/' + totalLangkah, 'Langkah olah & bukti benar sekali coba') +
        kartu(benarTerap + '/' + DATA.terapkan.soal.length, 'Uji terap benar') +
        '</div>'
    ) +
    '<div class="refleksi-list">' +
    D.pertanyaan
      .map(function (q, i) {
        return (
          '<div class="panel panel--compact">' +
          '<span class="refleksi-item__num">Pertanyaan ' +
          (i + 1) +
          ' dari ' +
          D.pertanyaan.length +
          '</span>' +
          '<label for="ref-' +
          q.id +
          '" class="dl-refleksi-q">' +
          esc(q.teks) +
          '</label>' +
          '<textarea id="ref-' +
          q.id +
          '" class="input-textarea" data-rid="' +
          q.id +
          '" placeholder="' +
          esc(q.placeholder) +
          '">' +
          esc(State.refleksiAnswers[q.id] || '') +
          '</textarea>' +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    panel(
      '<p class="exercise-label">' +
        esc(D.diriLabel) +
        '</p>' +
        buildChoiceGroup(D.diriOpsi, State.refleksiDiriOrder, { chosen: State.refleksiDiri })
    ) +
    '<div class="btn-group btn-group--spread">' +
    '<span class="dl-caption" style="align-self:center;">Jawaban tersimpan di perangkatmu saja, tidak dikirim ke mana pun.</span>' +
    '<button type="button" class="btn btn--primary" id="refleksiSaveBtn">' +
    esc(D.nextLabel) +
    '</button>' +
    '</div>' +
    '</section>';

  container.querySelectorAll('textarea[data-rid]').forEach(function (ta) {
    ta.addEventListener('input', function () {
      State.refleksiAnswers[ta.dataset.rid] = ta.value;
      saveState();
    });
  });

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.refleksiDiri = btn.dataset.optId;
      saveState();
      renderRefleksi(container);
    });
  });

  document.getElementById('refleksiSaveBtn').addEventListener('click', function () {
    if (!State.refleksiDiri) {
      showNotice('Pilih dulu seberapa yakin kamu sekarang.');
      return;
    }
    completeStage('refleksi');
    navigateTo('selesai');
  });
}

/* ============================================================
   14. STAGE: SELESAI
   ============================================================ */

function renderSelesai(container) {
  var D = DATA.selesai;

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="done-card">' +
    '<span class="done-card__icon">🏆</span>' +
    '<h2>' +
    esc(D.judul) +
    '</h2>' +
    '<p class="done-card__lead">' +
    esc(D.teks) +
    '</p>' +
    '<div class="formula-duo">' +
    '<div class="formula-card"><span class="formula-card__label">Suku ke-n</span>Uₙ = a + (n − 1)b</div>' +
    '<div class="formula-card"><span class="formula-card__label">Jumlah n suku pertama</span>Sₙ = n/2 × (2a + (n − 1)b)</div>' +
    '</div>' +
    '<div class="panel panel--hero done-card__list">' +
    '<h3 style="margin-top:0;">Yang sudah kamu capai</h3>' +
    '<ol class="objectives-list">' +
    D.capaian
      .map(function (c, i) {
        return '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + esc(c) + '</li>';
      })
      .join('') +
    '</ol>' +
    '</div>' +
    '<div class="feedback-box feedback-box--info done-card__note">' +
    '<span class="feedback-box__icon">📌</span>' +
    '<div class="feedback-box__body">' +
    '<strong>Catatan untuk Guru:</strong><br>' +
    'Rekap pada tahap Refleksi adalah indikator latihan digital, bukan nilai akhir. ' +
    'Kualitas penjelasan murid saat menurunkan rumus dan mempresentasikan kesimpulan tetap menjadi bahan penilaian utama.' +
    '</div></div>' +
    '<div class="btn-group btn-group--center">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '<button type="button" class="btn btn--outline-primary" id="reviewBtn">Tinjau Ulang</button>' +
    '</div>' +
    '</div>' +
    '</section>';

  completeStage('selesai');

  document.getElementById('reviewBtn').addEventListener('click', function () {
    navigateTo('stimulasi');
  });
}

/* ============================================================
   15. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  stimulasi: renderStimulasi,
  masalah: renderMasalah,
  koleksi: renderKoleksi,
  olahUn: renderOlahUn,
  olahSn: renderOlahSn,
  verifikasi: renderVerifikasi,
  generalisasi: renderGeneralisasi,
  terapkan: renderTerapkan,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  var fn = RENDERERS[State.currentStage] || RENDERERS.stimulasi;
  fn(container);
}

/* ============================================================
   16. HELPER UI — MODAL RESET
   ============================================================ */

function showResetModal() {
  var modal = document.getElementById('resetModal');
  if (modal) modal.style.display = 'flex';
}

function hideResetModal() {
  var modal = document.getElementById('resetModal');
  if (modal) modal.style.display = 'none';
}

/* ============================================================
   17. INIT
   ============================================================ */

function init() {
  buildStageNav();
  loadState();
  if (STAGES.indexOf(State.currentStage) === -1) State.currentStage = 'stimulasi';
  initExerciseArrays();
  saveState();
  updateStageNav();
  updateProgress();
  renderCurrentStage();

  var resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn) resetBtn.addEventListener('click', showResetModal);

  var cancelBtn = document.getElementById('resetCancelBtn');
  if (cancelBtn) cancelBtn.addEventListener('click', hideResetModal);

  var confirmBtn = document.getElementById('resetConfirmBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      hideResetModal();
      clearState();
      saveState();
      updateStageNav();
      updateProgress();
      navigateTo('stimulasi');
    });
  }

  var modal = document.getElementById('resetModal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) hideResetModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideResetModal();
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
