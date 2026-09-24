'use strict';

/* ============================================================
   app.js — Logika media pembelajaran
   Sifat-sifat Eksponen Bulat
   Fase E — SMK RPL, Discovery Learning

   Struktur:
     1. Konstanta
     2. State & storage (+ pengacakan semua pilihan jawaban)
     3. Navigasi
     4. Utilitas render
     5–14. Renderer tiap tahap
     15. Router render
     16. Modal reset
     17. Init

   Seluruh komponen umum (tangga pangkat, ubin faktor, lab uji sifat
   eksponen, langkah isian, pemilahan, pertanyaan penuntun, soal
   latihan, pecahan eksak) berasal dari shared/engine.js.
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'koleksi',
  'olahSifat',
  'olahNolNegatif',
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
  'Olah Sifat',
  'Nol & Negatif',
  'Pembuktian',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-e-1-1-eksponen-dl-v1';

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

  /* Tahap 3 — pengumpulan data */
  tanggaInputs: {},
  tanggaChecked: false,
  tanggaHint: 0,
  ubinSteps: [],
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 4 — olah sifat operasi */
  sifatSteps: [],
  sifatOrders: {},
  sifatPilih: {},

  /* Tahap 5 — olah pangkat nol & negatif */
  nolStepsA: [],
  nolStepsB: [],
  nolOrders: {},
  nolPilih: {},

  /* Tahap 6 — pembuktian */
  lab: null,
  verifSteps: [],
  verifPilahStates: {},
  verifPilahOrder: null,

  /* Tahap 7 — menarik kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 8 — uji terap */
  terapkanIdx: 0,
  terapkanExercises: [],

  /* Tahap 9 — refleksi */
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

function ensureObject(key) {
  if (!State[key] || typeof State[key] !== 'object' || Array.isArray(State[key])) State[key] = {};
}

/*
 * Menyiapkan seluruh array state per-soal DAN seluruh urutan acak
 * pilihan jawaban. Dipanggil sekali saat init (setelah loadState) dan
 * setiap kali progress direset, sehingga urutan stabil lintas reload
 * tetapi teracak ulang setiap Reset.
 */
function initExerciseArrays() {
  ['tanggaInputs', 'sifatOrders', 'sifatPilih', 'nolOrders', 'nolPilih'].forEach(ensureObject);
  ['simpulanPilihan', 'refleksiAnswers'].forEach(ensureObject);
  DATA.koleksi.tangga.forEach(function (t) {
    var isi = State.tanggaInputs[t.id];
    if (!isi || typeof isi !== 'object' || Array.isArray(isi)) State.tanggaInputs[t.id] = {};
  });

  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'stimulasiOrder', DATA.stimulasi.opsi);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  ensureExerciseArray(State, 'ubinSteps', DATA.koleksi.ubin, makeDlStep);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', DATA.koleksi.pilah, DATA.koleksi.opsiPilah);

  /* Tahap 4 */
  ensureExerciseArray(State, 'sifatSteps', DATA.olahSifat.langkah, makeDlStep);
  DATA.olahSifat.pertanyaan.forEach(function (q) {
    ensureShuffledOrder(State.sifatOrders, q.id, q.opsi);
  });

  /* Tahap 5 */
  ensureExerciseArray(State, 'nolStepsA', DATA.olahNolNegatif.langkahA, makeDlStep);
  ensureExerciseArray(State, 'nolStepsB', DATA.olahNolNegatif.langkahB, makeDlStep);
  DATA.olahNolNegatif.pertanyaan.forEach(function (q) {
    ensureShuffledOrder(State.nolOrders, q.id, q.opsi);
  });

  /* Tahap 6 */
  if (!State.lab || typeof State.lab !== 'object' || !Array.isArray(State.lab.log)) {
    State.lab = makeExponentLabState(DATA.verifikasi.lab.sifat[0]);
  }
  if (!SIFAT_EKSPONEN[State.lab.sifat]) State.lab.sifat = DATA.verifikasi.lab.sifat[0];
  ensureExerciseArray(State, 'verifSteps', DATA.verifikasi.uji, makeDlStep);
  ensureSortStates(
    State,
    'verifPilahStates',
    'verifPilahOrder',
    DATA.verifikasi.pilah,
    DATA.verifikasi.opsiPilah
  );

  /* Tahap 7 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);

  /* Tahap 8 — uji terap (dirender createExerciseStage) */
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

  /* Tahap 9 */
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

/* Memasang tombol lanjut yang menyelesaikan tahap ini lalu pindah tahap. */
function bindNext(id, stageId, nextStageId) {
  var btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', function () {
    completeStage(stageId);
    navigateTo(nextStageId);
  });
}

/* Semua langkah isian dalam `steps` sudah benar. */
function stepsDone(steps) {
  return steps.every(function (s) {
    return s.done;
  });
}

/*
 * Langkah isian ditampilkan satu per satu sampai yang belum selesai.
 * Langkah dengan `visual` diawali ubin faktor (buildFactorTiles).
 */
function buildStepSeq(prefix, steps, langkah) {
  var html = '';
  for (var i = 0; i < langkah.length; i++) {
    html +=
      '<div class="eks-step">' +
      (langkah[i].visual ? buildFactorTiles(langkah[i].visual) : '') +
      buildDlStep(prefix + i, steps[i], langkah[i], i + 1) +
      '</div>';
    if (!steps[i].done) break;
  }
  return html;
}

function bindStepSeq(prefix, steps, langkah, rerender) {
  langkah.forEach(function (step, k) {
    bindDlStep(prefix + k, steps[k], step, saveState, rerender);
  });
}

/*
 * Pertanyaan penuntun ditampilkan bertahap: pertanyaan berikutnya
 * baru muncul setelah pertanyaan sebelumnya dijawab benar.
 */
function guidedVisible(list, pilih) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    out.push(list[i]);
    if (pilih[list[i].id] !== list[i].correct) break;
  }
  return out;
}

/* Kartu-kartu rumus temuan. */
function buildRumusGrid(list) {
  return (
    '<div class="formula-duo eks-formula-grid">' +
    list
      .map(function (r) {
        return (
          '<div class="formula-card"><span class="formula-card__label">' +
          esc(r.label) +
          '</span>' +
          esc(r.teks) +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

/* Textarea terikat ke State[key]. */
function buildTextarea(id, label, placeholder, value) {
  return (
    '<div class="field-group">' +
    '<label for="' +
    id +
    '">' +
    esc(label) +
    '</label>' +
    '<textarea id="' +
    id +
    '" class="input-textarea" placeholder="' +
    esc(placeholder) +
    '">' +
    esc(value) +
    '</textarea>' +
    '</div>'
  );
}

function bindTextarea(id, key) {
  var ta = document.getElementById(id);
  if (!ta) return;
  ta.addEventListener('input', function () {
    State[key] = ta.value;
    saveState();
  });
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati tangga faktor skala zoom dan MENDUGA.
   ============================================================ */

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var terisi = !!State.stimulasiPilihan;

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🖼️ ' +
        esc(D.judul) +
        '</h2>' +
        '<div class="eks-grid">' +
        '<div>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<p class="eks-rule"><span aria-hidden="true">🔍</span> ' +
        esc(D.aturan) +
        '</p>' +
        '</div>' +
        '<div>' +
        '<p class="eks-ladder-title">Faktor skala zoom</p>' +
        buildPowerLadder(
          'stimTangga',
          D.tangga,
          {},
          {
            tanya: true,
            faktor: true,
            caption: 'Faktor skala zoom PixelKu dari 2⁴ sampai 2⁻²',
          }
        ) +
        '</div>' +
        '</div>',
      'panel--hero'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.stimulasiOrder, { chosen: State.stimulasiPilihan }) +
        '<div style="margin-top:var(--space-5);">' +
        buildTextarea(
          'stimulasiAlasan',
          D.alasanLabel,
          D.alasanPlaceholder,
          State.stimulasiAlasan
        ) +
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
      State.stimulasiPilihan = btn.dataset.optId;
      saveState();
      renderStimulasi(container);
    });
  });

  bindTextarea('stimulasiAlasan', 'stimulasiAlasan');

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
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.masalahOrder, {
          chosen: State.masalahPilihan,
          correctId: benar ? D.correct : null,
          grade: true,
          locked: benar,
        }) +
        buildGuidedChoiceFeedback(State.masalahPilihan, benar, D.umpan)
    ) +
    (benar
      ? buildDlPanel(
          buildTextarea(
            'masalahHipotesis',
            D.hipotesisLabel,
            D.hipotesisPlaceholder,
            State.masalahHipotesis
          )
        ) + buildDlNextButton('masalahNextBtn', D.nextLabel)
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

  bindTextarea('masalahHipotesis', 'masalahHipotesis');

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
   A: tangga pangkat basis 2 & 3. B: ubin faktor (dibuka setelah
   tangga benar). C: pilah pernyataan (dibuka setelah ubin selesai).
   ============================================================ */

function tanggaSemuaTerisi() {
  return DATA.koleksi.tangga.every(function (t) {
    return powerLadderFilled(t, State.tanggaInputs[t.id]);
  });
}

function tanggaSemuaBenar() {
  return DATA.koleksi.tangga.every(function (t) {
    return powerLadderAllCorrect(t, State.tanggaInputs[t.id]);
  });
}

/* Umpan balik diagnosa miskonsepsi untuk sel tangga yang salah (maks. 3 pesan berbeda). */
function buildDiagnosaTangga() {
  var pesan = [];
  var kodeTerpakai = {};
  DATA.koleksi.tangga.forEach(function (t) {
    powerLadderEditable(t).forEach(function (n) {
      var isi = State.tanggaInputs[t.id][n];
      var parsed = parseInputPecahan(String(isi || ''));
      if (parsed.error) return;
      var kode = diagnosaPangkat(t.a, n, parsed.value);
      if (kode === 'benar' || kodeTerpakai[kode]) return;
      kodeTerpakai[kode] = true;
      pesan.push(
        '<strong>' + esc(formatPangkat(t.a, n)) + ':</strong> ' + pesanDiagnosaPangkat(kode, t.a, n)
      );
    });
  });
  if (!pesan.length) return '';
  return (
    '<div class="eks-diagnosa">' +
    pesan
      .slice(0, 3)
      .map(function (p) {
        return buildFeedbackBox('warning', '💭', p);
      })
      .join('') +
    '</div>'
  );
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var tanggaBenar = State.tanggaChecked && tanggaSemuaBenar();
  var ubinSelesai = tanggaBenar && stepsDone(State.ubinSteps);
  var semuaPilah = sortItemsAllAnswered(D.pilah, State.pilahStates);

  var tanggaHTML = D.tangga
    .map(function (t) {
      return (
        '<div>' +
        '<p class="eks-ladder-title">Basis ' +
        t.a +
        '</p>' +
        buildPowerLadder(t.id, t, State.tanggaInputs[t.id], {
          checked: State.tanggaChecked,
          locked: tanggaBenar,
          caption: 'Tangga pangkat basis ' + t.a,
        }) +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p>' +
        esc(D.instruksiA) +
        '</p>' +
        '<div class="pw-ladder-duo">' +
        tanggaHTML +
        '</div>' +
        (tanggaBenar
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Datamu lengkap.</strong> Setiap turun satu anak tangga, nilainya dibagi basis — bahkan setelah melewati eksponen 0.'
            )
          : (State.tanggaChecked ? buildDiagnosaTangga() : '') +
            '<div class="dl-input-row" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="tanggaCheck">Periksa Tangga</button>' +
            buildHintToggle('tanggaHintBtn', D.hintsTangga, State.tanggaHint) +
            '</div>' +
            buildHintStack(D.hintsTangga, State.tanggaHint))
    ) +
    (tanggaBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            '<p>' +
            esc(D.instruksiB) +
            '</p>' +
            buildStepSeq('ub', State.ubinSteps, D.ubin)
        )
      : '') +
    (ubinSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulC) +
            '</h3>' +
            '<p>' +
            esc(D.instruksiC) +
            '</p>' +
            buildSortItems(D.pilah, State.pilahOrder, D.opsiPilah, State.pilahStates)
        )
      : '') +
    (ubinSelesai && semuaPilah ? buildDlNextButton('koleksiNextBtn', D.nextLabel) : '') +
    '</section>';

  var rerender = function () {
    renderKoleksi(container);
  };

  D.tangga.forEach(function (t) {
    bindPowerLadder(container, t.id, State.tanggaInputs[t.id], saveState, function () {
      var btn = document.getElementById('tanggaCheck');
      if (btn) btn.click();
    });
  });

  var check = document.getElementById('tanggaCheck');
  if (check) {
    check.addEventListener('click', function () {
      if (!tanggaSemuaTerisi()) {
        showNotice('Lengkapi semua anak tangga terlebih dahulu.');
        return;
      }
      State.tanggaChecked = true;
      saveState();
      if (!tanggaSemuaBenar()) showNotice('Masih ada yang belum tepat. Perhatikan tanda ✗.');
      rerender();
    });
  }

  var hint = document.getElementById('tanggaHintBtn');
  if (hint) {
    hint.addEventListener('click', function () {
      State.tanggaHint = Math.min(State.tanggaHint + 1, D.hintsTangga.length);
      saveState();
      rerender();
    });
  }

  bindStepSeq('ub', State.ubinSteps, D.ubin, rerender);
  bindSortItems(container, D.pilah, State.pilahStates, saveState, rerender);
  bindNext('koleksiNextBtn', 'koleksi', 'olahSifat');
}

/* ============================================================
   8. STAGE: OLAH SIFAT OPERASI  (Discovery Learning — sintaks 4)
   Ubin faktor → aᵐ·aⁿ = aᵐ⁺ⁿ, aᵐ:aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐˣⁿ,
   (ab)ⁿ = aⁿbⁿ, (a:b)ⁿ = aⁿ:bⁿ.
   ============================================================ */

function renderOlahSifat(container) {
  var D = DATA.olahSifat;
  var langkahSelesai = stepsDone(State.sifatSteps);
  var semuaBenar = langkahSelesai && guidedQuizAllCorrect(D.pertanyaan, State.sifatPilih);

  container.innerHTML =
    '<section aria-label="Olah Data Sifat Operasi">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.instruksi) +
        '</p>' +
        buildStepSeq('sf', State.sifatSteps, D.langkah)
    ) +
    (langkahSelesai
      ? buildDlPanel(
          buildGuidedQuizList(
            guidedVisible(D.pertanyaan, State.sifatPilih),
            State.sifatOrders,
            State.sifatPilih
          )
        )
      : '') +
    (semuaBenar
      ? buildDlPanel(buildRumusGrid(D.rumus), 'panel--hero') +
        buildDlNextButton('sifatNextBtn', D.nextLabel)
      : '') +
    '</section>';

  var rerender = function () {
    renderOlahSifat(container);
  };
  bindStepSeq('sf', State.sifatSteps, D.langkah, rerender);
  bindGuidedQuizList(container, D.pertanyaan, State.sifatPilih, saveState, rerender);
  bindNext('sifatNextBtn', 'olahSifat', 'olahNolNegatif');
}

/* ============================================================
   9. STAGE: OLAH PANGKAT NOL & NEGATIF  (Discovery Learning — sintaks 4)
   Jalan 1: pola tangga pangkat 10. Jalan 2: sifat pembagian.
   ============================================================ */

/* Tangga 10: nilai yang sudah ditemukan murid ikut ditampilkan. */
function tanggaNolTerbuka() {
  var D = DATA.olahNolNegatif;
  var diketahui = D.tangga.diketahui.slice();
  D.langkahA.forEach(function (s, i) {
    if (State.nolStepsA[i].done) diketahui.push(s.n);
  });
  return {
    a: D.tangga.a,
    dari: D.tangga.dari,
    sampai: D.tangga.sampai,
    diketahui: diketahui,
  };
}

function renderOlahNolNegatif(container) {
  var D = DATA.olahNolNegatif;
  var selesaiA = stepsDone(State.nolStepsA);
  var selesaiB = selesaiA && stepsDone(State.nolStepsB);
  var semuaBenar = selesaiB && guidedQuizAllCorrect(D.pertanyaan, State.nolPilih);

  container.innerHTML =
    '<section aria-label="Olah Data Pangkat Nol dan Negatif">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p>' +
        esc(D.instruksiA) +
        '</p>' +
        '<div class="eks-grid">' +
        buildPowerLadder(
          'nolTangga',
          tanggaNolTerbuka(),
          {},
          {
            tanya: true,
            caption: 'Tangga pangkat basis 10',
          }
        ) +
        '<div>' +
        buildStepSeq('na', State.nolStepsA, D.langkahA) +
        '</div>' +
        '</div>'
    ) +
    (selesaiA
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            '<p>' +
            esc(D.instruksiB) +
            '</p>' +
            buildStepSeq('nb', State.nolStepsB, D.langkahB)
        )
      : '') +
    (selesaiB
      ? buildDlPanel(
          buildGuidedQuizList(
            guidedVisible(D.pertanyaan, State.nolPilih),
            State.nolOrders,
            State.nolPilih
          )
        )
      : '') +
    (semuaBenar
      ? buildDlPanel(buildRumusGrid(D.rumus), 'panel--hero') +
        buildDlNextButton('nolNextBtn', D.nextLabel)
      : '') +
    '</section>';

  var rerender = function () {
    renderOlahNolNegatif(container);
  };
  bindStepSeq('na', State.nolStepsA, D.langkahA, rerender);
  bindStepSeq('nb', State.nolStepsB, D.langkahB, rerender);
  bindGuidedQuizList(container, D.pertanyaan, State.nolPilih, saveState, rerender);
  bindNext('nolNextBtn', 'olahNolNegatif', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A: lab uji sifat. B: buktikan dugaan awal. C: pilah miskonsepsi.
   ============================================================ */

var LAB_ID = 'xlab';

function labSelesai() {
  return labSyaratSelesai(State.lab, DATA.verifikasi.lab.syarat);
}

function labOpts() {
  var L = DATA.verifikasi.lab;
  return { sifat: L.sifat, syarat: L.syarat, batasA: L.batasA, batasE: L.batasE };
}

/*
 * Lab dirender ulang di tempat (tanpa merender seluruh tahap) agar
 * posisi gulir dan fokus keyboard tetap terjaga saat stepper ditekan.
 */
function renderLab(container) {
  var wrap = document.getElementById('labWrap');
  if (!wrap) return;
  var aktif = document.activeElement;
  var fokus = null;
  if (aktif && wrap.contains(aktif)) {
    if (aktif.id) fokus = '#' + aktif.id;
    else if (aktif.dataset.xlabSifat) fokus = '[data-xlab-sifat="' + aktif.dataset.xlabSifat + '"]';
  }
  var sebelum = labSelesai();
  wrap.innerHTML = buildExponentLab(LAB_ID, State.lab, labOpts());
  bindExponentLab(wrap, LAB_ID, State.lab, labOpts(), function (pesan) {
    if (pesan) showNotice(pesan);
    saveState();
    if (!sebelum && labSelesai()) renderVerifikasi(container);
    else renderLab(container);
  });
  if (fokus) {
    var el = wrap.querySelector(fokus);
    if (el && !el.disabled) el.focus();
  }
}

function buildDugaanBanding() {
  var S = DATA.stimulasi;
  var benarId = DATA.verifikasi.dugaanBenar;
  var cocok = State.stimulasiPilihan === benarId;
  return (
    '<div class="dugaan-compare">' +
    '<div class="dugaan-row' +
    (cocok ? ' dugaan-row--ok' : '') +
    '">' +
    '<span class="dugaan-row__title">Zoom PixelKu: 2⁰ dan 2⁻²</span>' +
    '<span>Dugaanmu: <strong>' +
    esc(findOptionLabel(S.opsi, State.stimulasiPilihan) || '—') +
    '</strong></span>' +
    '<span>Hasil penalaran: <strong>' +
    esc(findOptionLabel(S.opsi, benarId)) +
    '</strong></span>' +
    '<span class="dugaan-row__verdict">' +
    (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh penalaran') +
    '</span>' +
    '</div>' +
    '</div>'
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var selesaiA = labSelesai();
  var selesaiB = selesaiA && stepsDone(State.verifSteps);
  var semuaPilah = sortItemsAllAnswered(D.pilah, State.verifPilahStates);

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p>' +
        esc(D.instruksiA) +
        '</p>' +
        '<div id="labWrap"></div>' +
        (selesaiA
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Daftar periksa lengkap.</strong> Sifat-sifat eksponen tetap berlaku untuk eksponen nol dan negatif, sedangkan kedua dugaan keliru gugur oleh contoh penyangkal.'
            )
          : '')
    ) +
    (selesaiA
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            buildStepSeq('vf', State.verifSteps, D.uji) +
            (selesaiB ? buildDugaanBanding() : '')
        )
      : '') +
    (selesaiB
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulC) +
            '</h3>' +
            '<p>' +
            esc(D.instruksiC) +
            '</p>' +
            buildSortItems(D.pilah, State.verifPilahOrder, D.opsiPilah, State.verifPilahStates, {
              mono: true,
            })
        )
      : '') +
    (selesaiB && semuaPilah ? buildDlNextButton('verifNextBtn', D.nextLabel) : '') +
    '</section>';

  renderLab(container);

  var rerender = function () {
    renderVerifikasi(container);
  };
  bindStepSeq('vf', State.verifSteps, D.uji, rerender);
  bindSortItems(container, D.pilah, State.verifPilahStates, saveState, rerender);
  bindNext('verifNextBtn', 'verifikasi', 'generalisasi');
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
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel(
      kalimatHTML +
        (benarSemua
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah sifat-sifat yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Sifat-sifat Eksponen Bulat</h3>' +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + esc(r) + '</li>'
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
   12. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js): campuran soal 'input'
   dan 'choice'; urutan opsi dari ex.optionOrder yang diacak di
   initExerciseArrays(). Isian dibaca eksak oleh parseInputPecahan()
   sehingga '5/4', '1,25', dan '1/32' diterima.
   ============================================================ */

function parseJawabanPecahan(str) {
  var p = parseInputPecahan(str);
  if (p.error) return { value: null, error: p.error };
  return { value: nilaiPecahan(p.value), error: null };
}

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
  inputMode: 'text',
  revealButtonStyle: 'separate',
  parseInput: parseJawabanPecahan,
  isCorrect: function (v, s) {
    return hampirSama(v, s.jawab);
  },
  invalidMessage: 'Tulis jawaban berupa bilangan, pecahan, atau desimal, mis. 8, 1/32, atau 1,25.',
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
  var totalPilah = DATA.koleksi.pilah.length + DATA.verifikasi.pilah.length;
  var benarPilah =
    sortItemsCorrectCount(DATA.koleksi.pilah, State.pilahStates) +
    sortItemsCorrectCount(DATA.verifikasi.pilah, State.verifPilahStates);
  var langkah = State.ubinSteps.concat(
    State.sifatSteps,
    State.nolStepsA,
    State.nolStepsB,
    State.verifSteps
  );
  var sekaliCoba = langkah.filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  var benarTerap = State.terapkanExercises.filter(function (e) {
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
        kartu(benarPilah + '/' + totalPilah, 'Pernyataan dipilah benar') +
        kartu(sekaliCoba + '/' + langkah.length, 'Langkah hitung benar sekali coba') +
        kartu(State.lab.log.length, 'Uji tercatat di lab') +
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
    buildRumusGrid(DATA.olahSifat.rumus.concat(DATA.olahNolNegatif.rumus)) +
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
    'Kemampuan murid menjelaskan mengapa a⁰ = 1 dan a⁻ⁿ = 1/aⁿ dengan kata-kata sendiri tetap menjadi bahan penilaian utama.' +
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
  olahSifat: renderOlahSifat,
  olahNolNegatif: renderOlahNolNegatif,
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
}

document.addEventListener('DOMContentLoaded', init);
