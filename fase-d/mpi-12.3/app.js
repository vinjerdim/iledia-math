'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Bentuk Akar & Pangkat Pecahan
   Fase D — SMP Kelas VIII · Topik 12 Bilangan Berpangkat dan Bentuk Akar

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox,
   createStageMachine, createExerciseStage, createStore,
   ensureExerciseArray, optionIds, komponen Discovery Learning
   (ensureShuffledOrder, orderByIds, buildDiscoveryHead,
   buildTeacherNote, buildChoiceGroup, buildDlPanel,
   buildDlNextButton, makeDlStep, buildDlStep, bindDlStep,
   ensureSortStates, buildSortItems, bindSortItems,
   sortItemsAllAnswered, sortItemsCorrectCount, findOptionLabel,
   buildGuidedQuizList, bindGuidedQuizList, guidedQuizAllCorrect),
   serta komponen bentuk akar seksi 45 (tulisAkarHTML, formatAkar,
   formatDesimal, lab persegi & kubus, ubin faktor kembar, langkah
   isian akar, konverter akar–pangkat, buildTabelAkarPangkat).

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaan dan rangkaian aktivitasnya.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI saat
   state disiapkan (initExerciseArrays), lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat-lompat
   ketika tahap dirender ulang, tetapi teracak ulang setiap Reset.

   Bagian:
    1. Konstanta & konten ber-HTML
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi              (DL sintaks 1)
    6. Stage: Identifikasi Masalah   (DL sintaks 2)
    7. Stage: Akar & Pangkat 1/n     (DL sintaks 3)
    8. Stage: Tangga Pangkat Pecahan (DL sintaks 3)
    9. Stage: Ubin Faktor Kembar     (DL sintaks 3)
   10. Stage: Mengolah Data          (DL sintaks 4)
   11. Stage: Pembuktian             (DL sintaks 5)
   12. Stage: Menarik Kesimpulan     (DL sintaks 6)
   13. Stage: Uji Terap
   14. Stage: Refleksi
   15. Stage: Selesai
   16. Router Render
   17. Helper UI (modal reset)
   18. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA & KONTEN BER-HTML
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'akar',
  'pola',
  'sederhana',
  'olah',
  'verifikasi',
  'generalisasi',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Stimulasi',
  'Masalah',
  'Akar',
  'Pola',
  'Sederhana',
  'Olah',
  'Bukti',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-12-3-akar-v1';

/* Teks bernotasi (√, ∛, a^(p/q)) → HTML aman. */
var T = tulisAkarHTML;

/* Daftar pertanyaan penuntun dengan teks, label opsi, dan umpan ber-HTML. */
function htmlGuided(list) {
  return list.map(function (q) {
    var umpan = {};
    Object.keys(q.umpan).forEach(function (k) {
      umpan[k] = T(q.umpan[k]);
    });
    return {
      id: q.id,
      tanya: T(q.tanya),
      correct: q.correct,
      umpan: umpan,
      opsi: q.opsi.map(function (o) {
        return { id: o.id, label: T(o.label) };
      }),
    };
  });
}

/* Opsi { id, label } dengan label ber-HTML. */
function htmlOptions(options) {
  return options.map(function (o) {
    return { id: o.id, label: T(o.label) };
  });
}

/* Langkah isian angka (buildDlStep) dengan label, petunjuk, temuan ber-HTML. */
function htmlSteps(steps) {
  return steps.map(function (s) {
    return {
      id: s.id,
      jawab: s.jawab,
      label: T(s.label),
      temuan: s.temuan ? T(s.temuan) : '',
      hints: (s.hints || []).map(T),
    };
  });
}

var AKAR_LANGKAH = htmlSteps(DATA.akar.langkah);
var DETEKTIF = htmlGuided(DATA.akar.detektif);
var POLA_LANGKAH = htmlSteps(DATA.pola.langkah);
var POLA_TANYA = htmlGuided(DATA.pola.tanya);
var SEDERHANA_TANYA = htmlGuided(DATA.sederhana.tanya);
var KONSEP = htmlGuided(DATA.olah.konsep);

var PILAH_ITEMS = DATA.olah.pilah.map(function (it) {
  return {
    id: it.id,
    correct: it.correct,
    explanation: T(it.explanation),
    teks: '<span class="akar-pilah">' + T(it.teks) + '</span>',
  };
});

var VERIF_SOAL = DATA.verifikasi.soal.map(function (q) {
  return {
    id: q.id,
    pernyataan: T(q.pernyataan),
    options: htmlOptions(q.options),
    correct: q.correct,
    explanation: T(q.explanation),
  };
});

var TERAP_SOAL = DATA.terapkan.soal.map(function (s) {
  var out = Object.assign({}, s);
  if (s.options) out.options = htmlOptions(s.options);
  if (s.hints) out.hints = s.hints.map(T);
  return out;
});

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'stimulasi',
  completedStages: {},

  /* Tahap 1 — stimulasi (dugaan, tidak dinilai) */
  stimulasiOrder: null,
  stimulasiPilihan: null,
  stimulasiAlasan: '',

  /* Tahap 2 — identifikasi masalah */
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',

  /* Tahap 3 — lab persegi & kubus, isian akar, detektif eksponen */
  akarLab: null,
  akarLangkah: {},
  detektifOrders: {},
  detektifPilih: {},

  /* Tahap 4 — tangga pangkat pecahan */
  polaLangkah: {},
  polaOrders: {},
  polaPilih: {},

  /* Tahap 5 — ubin faktor kembar */
  ubinStates: {},
  ubinLangkah: {},
  sederhanaOrders: {},
  sederhanaPilih: {},

  /* Tahap 6 — mengolah data */
  konsepOrders: {},
  konsepPilih: {},
  konverter: null,
  misiSelesai: {},
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 7 — pembuktian */
  verifExercises: [],

  /* Tahap 8 — menarik kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 9 — uji terap */
  terapkanIdx: 0,
  terapkanExercises: [],

  /* Tahap 10 — refleksi */
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

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function ensureObject(key) {
  if (!isPlainObject(State[key])) State[key] = {};
}

/* Urutan acak opsi untuk setiap pertanyaan penuntun dalam `list`. */
function ensureGuidedOrders(orderKey, pilihKey, list) {
  ensureObject(orderKey);
  ensureObject(pilihKey);
  list.forEach(function (q) {
    ensureShuffledOrder(State[orderKey], q.id, q.opsi);
  });
}

/* State langkah isian angka per id langkah. */
function ensureDlSteps(key, steps) {
  ensureObject(key);
  steps.forEach(function (s) {
    var st = State[key][s.id];
    if (!isPlainObject(st) || typeof st.done !== 'boolean') State[key][s.id] = makeDlStep();
  });
}

/*
 * Menyiapkan seluruh state per-soal DAN seluruh urutan acak pilihan
 * jawaban (termasuk urutan ubin faktor). Dipanggil sekali saat init
 * (setelah loadState) dan setiap kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'stimulasiOrder', DATA.stimulasi.opsi);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  State.akarLab = ensureRootShapeLabState(State.akarLab);
  ensureDlSteps('akarLangkah', DATA.akar.langkah);
  ensureGuidedOrders('detektifOrders', 'detektifPilih', DATA.akar.detektif);

  /* Tahap 4 */
  ensureDlSteps('polaLangkah', DATA.pola.langkah);
  ensureGuidedOrders('polaOrders', 'polaPilih', DATA.pola.tanya);

  /* Tahap 5 */
  ensureObject('ubinStates');
  ensureObject('ubinLangkah');
  DATA.sederhana.ubin.forEach(function (u) {
    State.ubinStates[u.id] = ensureTwinTileState(State.ubinStates[u.id], u.r, u.n);
    var st = State.ubinLangkah[u.id];
    if (!isPlainObject(st) || typeof st.done !== 'boolean')
      State.ubinLangkah[u.id] = makeAkarStep();
  });
  ensureGuidedOrders('sederhanaOrders', 'sederhanaPilih', DATA.sederhana.tanya);

  /* Tahap 6 */
  ensureGuidedOrders('konsepOrders', 'konsepPilih', DATA.olah.konsep);
  if (!isPlainObject(State.konverter) || typeof State.konverter.a !== 'number') {
    State.konverter = makeRootConverterState(DATA.olah.konverterAwal);
  }
  ensureObject('misiSelesai');
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.olah.opsiPilah);

  /* Tahap 7 */
  ensureExerciseArray(State, 'verifExercises', DATA.verifikasi.soal, function (q) {
    return { chosen: null, correct: false, optionOrder: shuffleArray(optionIds(q.options)) };
  });

  /* Tahap 8 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);
  ensureObject('simpulanPilihan');

  /* Tahap 9 — uji terap (dirender createExerciseStage) */
  ensureExerciseArray(State, 'terapkanExercises', DATA.terapkan.soal, function (q) {
    return {
      attempts: 0,
      hintLevel: 0,
      hintShown: false,
      correct: false,
      userInput: '',
      revealed: false,
      chosen: null,
      checked: false,
      optionOrder: q.options ? shuffleArray(optionIds(q.options)) : null,
    };
  });
  if (State.terapkanIdx >= DATA.terapkan.soal.length || State.terapkanIdx < 0) {
    State.terapkanIdx = 0;
  }

  /* Tahap 10 */
  ensureShuffledOrder(State, 'refleksiDiriOrder', DATA.refleksi.diriOpsi);
  ensureObject('refleksiAnswers');
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

/* Paragraf instruksi dalam panel info. */
function buildInfo(teks) {
  return buildDlPanel('<p style="margin:0;">' + T(teks) + '</p>', 'panel--info');
}

/* Umpan balik jawaban sekali-pilih (benar/salah + penjelasan). */
function buildOnceFeedback(benar, explanation) {
  return (
    '<div style="margin-top:var(--space-2);">' +
    buildFeedbackBox(
      benar ? 'success' : 'error',
      benar ? '✓' : '✗',
      (benar ? '<strong>Tepat.</strong> ' : '<strong>Belum tepat.</strong> ') + explanation
    ) +
    '</div>'
  );
}

/* Kotak umpan balik pilihan (benar → success, salah → warning). */
function buildChoiceFeedback(chosen, benar, umpan) {
  if (!chosen) return '';
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(benar ? 'success' : 'warning', benar ? '✓' : '💭', T(umpan[chosen])) +
    '</div>'
  );
}

/* Memasang tombol lanjut yang menyelesaikan tahap ini lalu pindah tahap. */
function bindNext(id, stageId, nextStageId) {
  var btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', function () {
    completeStage(stageId);
    navigateTo(nextStageId);
  });
}

/* Mengembalikan fokus ke elemen `selector` setelah render ulang. */
function kembalikanFokus(container, selector) {
  var el = selector && container.querySelector(selector);
  if (el && !el.disabled) el.focus();
}

function langkahSelesai(steps, states) {
  return steps.every(function (s) {
    return states[s.id] && states[s.id].done;
  });
}

function hitungSelesai(steps, states) {
  return steps.filter(function (s) {
    return states[s.id] && states[s.id].done;
  }).length;
}

/*
 * Langkah isian angka bertahap: langkah berikutnya baru muncul setelah
 * langkah sebelumnya selesai. `prefix` membedakan id DOM tiap kelompok.
 */
function buildLangkahBertahap(prefix, steps, states) {
  var html = '';
  for (var i = 0; i < steps.length; i++) {
    var s = steps[i];
    html += buildDlStep(prefix + s.id, states[s.id], s, i + 1);
    if (!states[s.id].done) break;
  }
  return html;
}

function bindLangkahBertahap(prefix, steps, states, rerender) {
  for (var i = 0; i < steps.length; i++) {
    var s = steps[i];
    bindDlStep(prefix + s.id, states[s.id], s, saveState, rerender);
    if (!states[s.id].done) break;
  }
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah.
   ============================================================ */

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var terisi = !!State.stimulasiPilihan;

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🌱 ' +
        esc(D.judul) +
        '</h2>' +
        '<p class="stimulasi-cerita">' +
        esc(D.cerita) +
        '</p>' +
        '<div class="kebun-banding">' +
        '<figure class="kebun-kalkulator">' +
        '<figcaption>🧮 ' +
        esc(D.kalkulatorLabel) +
        '</figcaption>' +
        '<p class="kebun-kalkulator__layar">' +
        esc(D.kalkulator) +
        '</p>' +
        '</figure>' +
        '<figure class="kebun-papan">' +
        '<figcaption>📋 ' +
        esc(D.papanLabel) +
        '</figcaption>' +
        '<p class="kebun-papan__isi">' +
        T(D.papan) +
        '</p>' +
        '</figure>' +
        '</div>',
      'panel--hero'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        T(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(htmlOptions(D.opsi), State.stimulasiOrder, {
          chosen: State.stimulasiPilihan,
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
        buildFeedbackBox('info', '🔎', T(D.catatan))
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
      State.stimulasiPilihan = btn.dataset.optId;
      saveState();
      renderStimulasi(container);
      kembalikanFokus(container, '[data-opt-id="' + btn.dataset.optId + '"]');
    });
  });

  var ta = document.getElementById('stimulasiAlasan');
  ta.addEventListener('input', function () {
    State.stimulasiAlasan = ta.value;
    saveState();
  });

  document.getElementById('stimulasiNextBtn').addEventListener('click', function () {
    if (!State.stimulasiPilihan) {
      showNotice('Pilih dugaanmu sebelum melanjutkan.');
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
  var benar = State.masalahPilihan === D.correct;

  container.innerHTML =
    '<section aria-label="Identifikasi Masalah">' +
    buildHead(D) +
    buildInfo(D.pengantar) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(htmlOptions(D.opsi), State.masalahOrder, {
          chosen: State.masalahPilihan,
          correctId: benar ? D.correct : null,
          grade: true,
          locked: benar,
          group: 'masalah',
        }) +
        buildChoiceFeedback(State.masalahPilihan, benar, D.umpan)
    ) +
    (benar
      ? buildDlPanel(
          '<div class="field-group">' +
            '<label for="masalahHipotesis">' +
            T(D.hipotesisLabel) +
            '</label>' +
            '<textarea id="masalahHipotesis" class="input-textarea" placeholder="' +
            esc(D.hipotesisPlaceholder) +
            '">' +
            esc(State.masalahHipotesis) +
            '</textarea>' +
            '</div>'
        ) + buildDlNextButton('masalahNextBtn', D.nextLabel)
      : '') +
    '</section>';

  container.querySelectorAll('[data-group="masalah"][data-opt-id]').forEach(function (btn) {
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
      navigateTo('akar');
    });
  }
}

/* ============================================================
   7. STAGE: AKAR & PANGKAT 1/n  (Discovery Learning — sintaks 3)
   A. Lab persegi & kubus (luas → sisi, volume → rusuk).
   B. Isian akar bulat.
   C. Detektif eksponen: (aˣ)ⁿ = a¹ → x = 1/n.
   ============================================================ */

function labCukup() {
  var min = DATA.akar.jejakMin;
  return (
    rootShapeLabJejak(State.akarLab, 'persegi') >= min.persegi &&
    rootShapeLabJejak(State.akarLab, 'kubus') >= min.kubus
  );
}

function buildJejakLab() {
  var min = DATA.akar.jejakMin;
  function chip(mode, label) {
    var n = Math.min(rootShapeLabJejak(State.akarLab, mode), min[mode]);
    var ok = n >= min[mode];
    return (
      '<span class="akar-jejak' +
      (ok ? ' is-ok' : '') +
      '">' +
      (ok ? '✓ ' : '') +
      label +
      ': ' +
      n +
      '/' +
      min[mode] +
      ' nilai</span>'
    );
  }
  return (
    '<p class="akar-jejak-wrap">' + chip('persegi', 'Persegi') + chip('kubus', 'Kubus') + '</p>'
  );
}

function renderAkar(container) {
  var D = DATA.akar;
  var cukup = labCukup();
  var langkahBenar = langkahSelesai(AKAR_LANGKAH, State.akarLangkah);
  var detektifBenar = guidedQuizAllCorrect(DETEKTIF, State.detektifPilih);

  function rerender() {
    renderAkar(container);
  }

  container.innerHTML =
    '<section aria-label="Mengumpulkan Data: Akar dan Pangkat Satu per n">' +
    buildHead(D) +
    buildInfo(D.instruksi) +
    buildDlPanel(buildRootShapeLab('akarLab', State.akarLab) + buildJejakLab()) +
    (cukup
      ? buildDlPanel(
          '<p class="exercise-label">' +
            T(D.instruksiLangkah) +
            '</p>' +
            buildLangkahBertahap('al-', AKAR_LANGKAH, State.akarLangkah)
        )
      : '') +
    (cukup && langkahBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🕵️ Detektif Eksponen</h3>' +
            '<p class="exercise-label">' +
            T(D.instruksiDetektif) +
            '</p>' +
            buildGuidedQuizList(DETEKTIF, State.detektifOrders, State.detektifPilih)
        )
      : '') +
    (cukup && langkahBenar && detektifBenar
      ? buildDlPanel(
          buildFeedbackBox('success', '🔎', '<strong>' + T(D.temuan) + '</strong>'),
          'panel--hero'
        ) + buildDlNextButton('akarNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindRootShapeLab(container, 'akarLab', State.akarLab, function (jenis, arah) {
    var sebelum = cukup;
    saveState();
    rerender();
    if (jenis === 'mode') {
      kembalikanFokus(container, '[data-lab-mode="' + State.akarLab.mode + '"]');
    } else if (jenis === 'range') {
      kembalikanFokus(container, '#akarLabRange');
    } else {
      kembalikanFokus(container, '[data-lab-id="akarLab"][data-lab-step="' + arah + '"]');
    }
    if (!sebelum && labCukup())
      showNotice('Data cukup! Gulir ke bawah untuk mencatat hasil pengamatanmu.');
  });

  if (cukup) bindLangkahBertahap('al-', AKAR_LANGKAH, State.akarLangkah, rerender);
  bindGuidedQuizList(container, DETEKTIF, State.detektifPilih, saveState, rerender);
  bindNext('akarNextBtn', 'akar', 'pola');
}

/* ============================================================
   8. STAGE: TANGGA PANGKAT PECAHAN  (Discovery Learning — sintaks 3)
   ============================================================ */

function renderPola(container) {
  var D = DATA.pola;
  var langkahBenar = langkahSelesai(POLA_LANGKAH, State.polaLangkah);
  var tanyaBenar = guidedQuizAllCorrect(POLA_TANYA, State.polaPilih);

  function rerender() {
    renderPola(container);
  }

  container.innerHTML =
    '<section aria-label="Mengumpulkan Data: Tangga Pangkat Pecahan">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">🧱 ' + T(D.cerita) + '</p>', 'panel--hero') +
    buildDlPanel(
      '<p class="exercise-label">' +
        T(D.instruksi) +
        '</p>' +
        buildLangkahBertahap('pl-', POLA_LANGKAH, State.polaLangkah)
    ) +
    (langkahBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📊 ' +
            esc(D.tabelJudul) +
            '</h3>' +
            buildTabelAkarPangkat(D.tabel) +
            buildGuidedQuizList(POLA_TANYA, State.polaOrders, State.polaPilih)
        )
      : '') +
    (langkahBenar && tanyaBenar ? buildDlNextButton('polaNextBtn', D.nextLabel, true) : '') +
    '</section>';

  bindLangkahBertahap('pl-', POLA_LANGKAH, State.polaLangkah, rerender);
  bindGuidedQuizList(container, POLA_TANYA, State.polaPilih, saveState, rerender);
  bindNext('polaNextBtn', 'pola', 'sederhana');
}

/* ============================================================
   9. STAGE: UBIN FAKTOR KEMBAR  (Discovery Learning — sintaks 3)
   Setiap soal: kelompokkan ubin kembar → tulis bentuk sederhananya.
   Soal berikutnya muncul setelah soal sebelumnya selesai.
   ============================================================ */

function ubinItemSelesai(u) {
  return !!State.ubinLangkah[u.id].done;
}

function buildUbinItem(u, i) {
  var st = State.ubinStates[u.id];
  var tilesDone = twinTileSelesai(st, u.r, u.n);
  var faktor = faktorPrima(u.r).join(' × ');
  return (
    '<div class="akar-ubin-item">' +
    '<h3 class="akar-ubin-item__judul"><span class="dl-step__num">' +
    (i + 1) +
    '</span>' +
    T(u.label) +
    '</h3>' +
    '<p class="akar-ubin-item__faktor">' +
    esc(formatNumber(u.r) + ' = ' + faktor) +
    '</p>' +
    buildTwinFactorTiles('ub-' + u.id, u.r, u.n, st, { selesai: tilesDone }) +
    (tilesDone
      ? buildFeedbackBox(
          'info',
          '🧩',
          'Tidak ada lagi ' +
            (u.n === 2 ? 'pasangan' : 'kelompok tiga') +
            ' ubin kembar di dalam akar. Sekarang tulis hasilnya.'
        ) +
        buildAkarStep('as-' + u.id, u, State.ubinLangkah[u.id], {
          label: 'Tulis ' + formatAkar(1, u.n, u.r) + ' dalam bentuk paling sederhana:',
        })
      : '') +
    '</div>'
  );
}

function renderSederhana(container) {
  var D = DATA.sederhana;
  var semuaUbin = D.ubin.every(ubinItemSelesai);
  var tanyaBenar = guidedQuizAllCorrect(SEDERHANA_TANYA, State.sederhanaPilih);

  function rerender() {
    renderSederhana(container);
  }

  var itemsHTML = '';
  var tampil = [];
  for (var i = 0; i < D.ubin.length; i++) {
    tampil.push(D.ubin[i]);
    itemsHTML += buildUbinItem(D.ubin[i], i);
    if (!ubinItemSelesai(D.ubin[i])) break;
  }

  container.innerHTML =
    '<section aria-label="Mengumpulkan Data: Ubin Faktor Kembar">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin:0 0 var(--space-3);">🌱 ' +
        T(D.cerita) +
        '</p>' +
        buildFeedbackBox('info', '📏', T(D.aturan)),
      'panel--hero'
    ) +
    buildDlPanel(itemsHTML) +
    (semuaUbin
      ? buildDlPanel(
          buildGuidedQuizList(SEDERHANA_TANYA, State.sederhanaOrders, State.sederhanaPilih)
        )
      : '') +
    (semuaUbin && tanyaBenar ? buildDlNextButton('sederhanaNextBtn', D.nextLabel, true) : '') +
    '</section>';

  tampil.forEach(function (u) {
    var st = State.ubinStates[u.id];
    bindTwinFactorTiles(container, 'ub-' + u.id, u.r, u.n, st, function (kode) {
      saveState();
      if (kode === 'beda') showNotice(D.umpanUbin.beda);
      else if (kode === 'kelompok') showNotice(D.umpanUbin.kelompok);
      rerender();
      kembalikanFokus(container, '[data-tile-id="ub-' + u.id + '"]');
    });
    if (twinTileSelesai(st, u.r, u.n)) {
      bindAkarStep('as-' + u.id, u, State.ubinLangkah[u.id], saveState, rerender);
    }
  });
  bindGuidedQuizList(container, SEDERHANA_TANYA, State.sederhanaPilih, saveState, rerender);
  bindNext('sederhanaNextBtn', 'sederhana', 'olah');
}

/* ============================================================
   10. STAGE: MENGOLAH DATA  (Discovery Learning — sintaks 4)
   A. Pertanyaan penuntun.
   B. Misi konverter akar ⇄ pangkat.
   C. Memilah pernyataan: tepat / keliru.
   ============================================================ */

function misiAktif() {
  var list = DATA.olah.misi;
  for (var i = 0; i < list.length; i++) {
    if (!State.misiSelesai[list[i].id]) return list[i];
  }
  return null;
}

function buildMisiList() {
  var aktif = misiAktif();
  return (
    '<ol class="akar-misi">' +
    DATA.olah.misi
      .map(function (m) {
        var done = !!State.misiSelesai[m.id];
        var isAktif = aktif && aktif.id === m.id;
        return (
          '<li class="akar-misi__item' +
          (done ? ' is-done' : '') +
          (isAktif ? ' is-aktif' : '') +
          '">' +
          '<span class="akar-misi__status" aria-hidden="true">' +
          (done ? '✓' : isAktif ? '▶' : '•') +
          '</span>' +
          '<span>' +
          T(m.teks) +
          (done ? '<br><strong>' + T(m.temuan) + '</strong>' : '') +
          '</span>' +
          '</li>'
        );
      })
      .join('') +
    '</ol>'
  );
}

function renderOlah(container) {
  var D = DATA.olah;
  var konsepBenar = guidedQuizAllCorrect(KONSEP, State.konsepPilih);
  var misiBeres = !misiAktif();
  var pilahSelesai = sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);

  function rerender() {
    renderOlah(container);
  }

  container.innerHTML =
    '<section aria-label="Mengolah Data">' +
    buildHead(D) +
    buildInfo(D.pengantar) +
    buildDlPanel(buildGuidedQuizList(KONSEP, State.konsepOrders, State.konsepPilih)) +
    (konsepBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🔄 Konverter Akar ⇄ Pangkat</h3>' +
            '<p class="exercise-label">' +
            T(D.instruksiMisi) +
            '</p>' +
            buildRootConverter('kv', State.konverter) +
            buildMisiList()
        )
      : '') +
    (konsepBenar && misiBeres
      ? buildDlPanel(
          '<p class="exercise-label">' +
            esc(D.instruksiPilah) +
            '</p>' +
            buildSortItems(PILAH_ITEMS, State.pilahOrder, D.opsiPilah, State.pilahStates)
        )
      : '') +
    (konsepBenar && misiBeres && pilahSelesai
      ? buildDlNextButton('olahNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindGuidedQuizList(container, KONSEP, State.konsepPilih, saveState, rerender);
  bindRootConverter(container, 'kv', State.konverter, function (key, step) {
    var aktif = misiAktif();
    var tercapai = aktif && konverterCocok(State.konverter, aktif.target);
    if (tercapai) State.misiSelesai[aktif.id] = true;
    saveState();
    rerender();
    kembalikanFokus(
      container,
      'button[data-kv-id="kv"][data-kv-key="' + key + '"][data-kv-step="' + step + '"]'
    );
    if (tercapai) showNotice('Misi berhasil! Lihat temuanmu pada daftar misi.');
  });
  bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  bindNext('olahNextBtn', 'olah', 'verifikasi');
}

/* ============================================================
   11. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A. Membandingkan dugaan awal dengan temuan.
   B. Uji konversi & penyederhanaan (opsi acak, sekali jawab).
   ============================================================ */

function verifSoalSemuaDijawab() {
  return State.verifExercises.every(function (e) {
    return !!e.chosen;
  });
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var S = DATA.stimulasi;
  var dugaanTepat = State.stimulasiPilihan === S.dugaanTepat;

  function rerender() {
    renderVerifikasi(container);
  }

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin:0;">' +
        esc(D.prediksiLabel) +
        ': <strong>' +
        (State.stimulasiPilihan
          ? T(findOptionLabel(S.opsi, State.stimulasiPilihan))
          : 'belum diisi') +
        '</strong>' +
        (State.stimulasiAlasan ? '<br><em>“' + esc(State.stimulasiAlasan) + '”</em>' : '') +
        '</p>' +
        (State.masalahHipotesis
          ? '<p style="margin:var(--space-2) 0 var(--space-3);">' +
            esc(D.hipotesisLabel) +
            ': <em>“' +
            esc(State.masalahHipotesis) +
            '”</em></p>'
          : '') +
        buildFeedbackBox(
          dugaanTepat ? 'success' : 'info',
          dugaanTepat ? '👏' : '🔄',
          T(D.kesimpulanDugaan[State.stimulasiPilihan] || D.kesimpulanDugaan[S.dugaanTepat])
        ),
      'panel--warning'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiSoal) +
        '</p>' +
        VERIF_SOAL.map(function (q, i) {
          var ex = State.verifExercises[i];
          return (
            '<div class="sort-item">' +
            '<p class="sort-item__text"><span class="dl-step__num">' +
            (i + 1) +
            '</span>' +
            q.pernyataan +
            '</p>' +
            buildChoiceGroup(q.options, ex.optionOrder, {
              chosen: ex.chosen,
              correctId: q.correct,
              grade: true,
              locked: true,
              group: q.id,
              attr: 'data-verif-opt',
            }) +
            (ex.chosen ? buildOnceFeedback(ex.correct, q.explanation) : '') +
            '</div>'
          );
        }).join('')
    ) +
    (verifSoalSemuaDijawab() ? buildDlNextButton('verifNextBtn', D.nextLabel, true) : '') +
    '</section>';

  container.querySelectorAll('[data-verif-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = -1;
      VERIF_SOAL.forEach(function (q, k) {
        if (q.id === btn.dataset.group) i = k;
      });
      var ex = State.verifExercises[i];
      if (!ex || ex.chosen) return;
      ex.chosen = btn.dataset.verifOpt;
      ex.correct = ex.chosen === VERIF_SOAL[i].correct;
      saveState();
      rerender();
    });
  });

  bindNext('verifNextBtn', 'verifikasi', 'generalisasi');
}

/* ============================================================
   12. STAGE: MENARIK KESIMPULAN  (Discovery Learning — sintaks 6)
   Pilihan <select> hanya menampung teks biasa, jadi notasinya
   ditampilkan sebagai pratinjau ber-HTML di bawah setiap pilihan.
   ============================================================ */

function simpulanSemuaBenar() {
  return DATA.generalisasi.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function teksBank(id) {
  var bank = DATA.generalisasi.bank;
  for (var i = 0; i < bank.length; i++) {
    if (bank[i].id === id) return bank[i].teks;
  }
  return '';
}

function buildPratinjau(gid) {
  var dipilih = State.simpulanPilihan[gid];
  return (
    '<p class="akar-pratinjau" id="prev-' +
    gid +
    '">' +
    (dipilih ? '👀 ' + T(teksBank(dipilih)) : '') +
    '</p>'
  );
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
        T(g.awal) +
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
        buildPratinjau(g.id) +
        (diperiksa && dipilih && dipilih !== g.correct
          ? '<p class="dl-simpulan-item__note">Belum tepat. Ingat kembali temuanmu, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Menarik Kesimpulan">' +
    buildHead(D) +
    buildInfo(D.instruksi) +
    buildDlPanel(
      kalimatHTML +
        (benarSemua
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah aturan yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Bentuk Akar &amp; Pangkat Pecahan</h3>' +
            '<div class="akar-rumus" aria-label="Rumus utama">' +
            T('ⁿ√(aᵐ) = a^(m/n)') +
            '</div>' +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' +
                  (i + 1) +
                  '</span><span>' +
                  T(r) +
                  '</span></li>'
                );
              })
              .join('') +
            '</ol>',
          'panel--hero'
        ) + buildDlNextButton('simpulanNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  container.querySelectorAll('[data-simp]').forEach(function (sel) {
    sel.addEventListener('change', function () {
      State.simpulanPilihan[sel.dataset.simp] = sel.value;
      saveState();
      var prev = document.getElementById('prev-' + sel.dataset.simp);
      if (prev) prev.innerHTML = sel.value ? '👀 ' + T(teksBank(sel.value)) : '';
    });
  });

  var checkBtn = document.getElementById('simpulanCheckBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      var adaKosong = D.kalimat.some(function (g) {
        return !State.simpulanPilihan[g.id];
      });
      if (adaKosong) {
        showNotice('Lengkapi semua kalimat lebih dulu.');
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

  bindNext('simpulanNextBtn', 'generalisasi', 'terapkan');
}

/* ============================================================
   13. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal campuran
   'input' (bilangan bulat/desimal berkoma, toleransi per soal) dan
   'choice' (opsi diacak lewat ex.optionOrder di initExerciseArrays()).
   ============================================================ */

var TerapkanStage = createExerciseStage({
  soal: TERAP_SOAL,
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
  defaultType: 'choice',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  checkValue: function (s) {
    return s.jawab;
  },
  parseInput: parseInputRational,
  isCorrect: function (value, s) {
    return Math.abs(value - s.jawab) <= (s.toleransi || 0.0001);
  },
  inputMode: 'decimal',
  inputAriaLabel: 'Jawaban',
  inputPlaceholder: 'mis. 12 atau 8,48',
  invalidMessage: 'Masukkan sebuah bilangan (contoh: 12 atau 8,48).',
  revealText: function (s) {
    return (
      'Jawabannya <strong>' + esc(formatDesimal(s.jawab, 3)) + '</strong>. ' + T(s.explanation)
    );
  },
  buildChoiceFeedback: function (s, ex) {
    var benar = ex.chosen === s.correct;
    return buildFeedbackBox(
      benar ? 'success' : 'error',
      benar ? '✓' : '✗',
      (benar ? '<strong>Tepat.</strong> ' : '<strong>Belum tepat.</strong> ') + T(s.explanation)
    );
  },
  renderPrompt: function (s) {
    var pilihan = (s.type || 'choice') === 'choice';
    return (
      '<div class="dl-prompt">' +
      '<span class="konteks-chip">' +
      esc(s.konteks) +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      T(s.cerita) +
      '</p>' +
      '<p class="dl-prompt__tanya">' +
      T(s.pertanyaan) +
      '</p>' +
      (pilihan && s.hints && s.hints.length
        ? '<details class="soal-hint"><summary>💡 Petunjuk</summary><ul>' +
          s.hints
            .map(function (h) {
              return '<li>' + h + '</li>';
            })
            .join('') +
          '</ul></details>'
        : '') +
      '</div>'
    );
  },
});

function renderTerapkan(container) {
  TerapkanStage.render(container);
}

/* ============================================================
   14. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var ubinBenar = DATA.sederhana.ubin.filter(ubinItemSelesai).length;
  var misiBenar = DATA.olah.misi.filter(function (m) {
    return State.misiSelesai[m.id];
  }).length;
  var pilahBenar = sortItemsCorrectCount(PILAH_ITEMS, State.pilahStates);
  var verifBenar = State.verifExercises.filter(function (e) {
    return e.correct;
  }).length;
  var terapBenar = State.terapkanExercises.filter(function (e) {
    return e.correct;
  }).length;

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
    buildDlPanel(
      '<div class="summary-grid">' +
        kartu(
          hitungSelesai(POLA_LANGKAH, State.polaLangkah) + '/' + POLA_LANGKAH.length,
          'Nilai pangkat pecahan dihitung'
        ) +
        kartu(ubinBenar + '/' + DATA.sederhana.ubin.length, 'Bentuk akar disederhanakan') +
        kartu(misiBenar + '/' + DATA.olah.misi.length, 'Misi konverter') +
        kartu(pilahBenar + '/' + PILAH_ITEMS.length, 'Pernyataan dipilah benar') +
        kartu(verifBenar + '/' + VERIF_SOAL.length, 'Soal pembuktian benar') +
        kartu(terapBenar + '/' + TERAP_SOAL.length, 'Uji terap benar') +
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
          T(q.teks) +
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
    buildDlPanel(
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
      kembalikanFokus(container, '[data-opt-id="' + btn.dataset.optId + '"]');
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
   15. STAGE: SELESAI
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
    T(D.teks) +
    '</p>' +
    '<div class="sajian-trio">' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">' +
    T('√72') +
    '</span>Bentuk akar</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">' +
    T('72^(1/2)') +
    '</span>Pangkat pecahan</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">' +
    T('6√2') +
    '</span>Paling sederhana</div>' +
    '</div>' +
    '<div class="panel panel--hero done-card__list">' +
    '<h3 style="margin-top:0;">Yang sudah kamu capai</h3>' +
    '<ol class="objectives-list">' +
    D.capaian
      .map(function (c, i) {
        return '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + T(c) + '</li>';
      })
      .join('') +
    '</ol>' +
    '</div>' +
    '<div class="feedback-box feedback-box--info done-card__note">' +
    '<span class="feedback-box__icon">📌</span>' +
    '<div class="feedback-box__body">' +
    '<strong>Catatan untuk Guru:</strong><br>' +
    'Rekap pada tahap Refleksi adalah indikator latihan digital, bukan nilai akhir. ' +
    'Kemampuan murid menjelaskan alasan ⁿ√(aᵐ) = a^(m/n) dan menyederhanakan bentuk akar secara tertulis (dengan pohon faktor) tetap menjadi bahan penilaian utama.' +
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
   16. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  stimulasi: renderStimulasi,
  masalah: renderMasalah,
  akar: renderAkar,
  pola: renderPola,
  sederhana: renderSederhana,
  olah: renderOlah,
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
   17. HELPER UI — MODAL RESET
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
   18. INIT
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
