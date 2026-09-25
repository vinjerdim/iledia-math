'use strict';

/* ============================================================
   app.js — Logika media pembelajaran
   Sifat Operasi Bilangan Berpangkat (bulat positif)
   Fase E — SMK RPL, Discovery Learning

   Struktur:
     1. Konstanta
     2. State & storage (+ pengacakan semua pilihan jawaban)
     3. Navigasi
     4. Utilitas render
     5–13. Renderer tiap tahap
     14. Router render
     15. Modal reset
     16. Init

   Seluruh komponen umum (tabel pangkat, tabel eksplorasi pola, ubin
   faktor, lab uji sifat eksponen, langkah isian, pemilahan, pertanyaan
   penuntun, soal latihan) berasal dari shared/engine.js.
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'koleksi',
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
  'Data',
  'Olah Data',
  'Pembuktian',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-e-1-1-sifat-pangkat-dl-v2';

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
  tabelInputs: {},
  tabelChecked: false,
  tabelHint: 0,
  polaInputs: {},
  polaChecked: {},
  polaHint: {},
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 4 — olah data */
  olahOrders: {},
  olahPilih: {},
  olahSteps: [],

  /* Tahap 5 — pembuktian */
  lab: null,
  ubinSteps: [],
  verifSteps: [],
  verifPilahStates: {},
  verifPilahOrder: null,

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

function isObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function ensureObject(target, key) {
  if (!isObject(target[key])) target[key] = {};
}

/*
 * Menyiapkan seluruh array state per-soal DAN seluruh urutan acak
 * pilihan jawaban. Dipanggil sekali saat init (setelah loadState) dan
 * setiap kali progress direset, sehingga urutan stabil lintas reload
 * tetapi teracak ulang setiap Reset.
 */
function initExerciseArrays() {
  [
    'tabelInputs',
    'polaInputs',
    'polaChecked',
    'polaHint',
    'olahOrders',
    'olahPilih',
    'simpulanPilihan',
    'refleksiAnswers',
  ].forEach(function (k) {
    ensureObject(State, k);
  });
  DATA.koleksi.tabelPangkat.forEach(function (t) {
    ensureObject(State.tabelInputs, t.id);
  });
  DATA.koleksi.pola.forEach(function (p) {
    ensureObject(State.polaInputs, p.id);
    if (typeof State.polaHint[p.id] !== 'number') State.polaHint[p.id] = 0;
    State.polaChecked[p.id] = !!State.polaChecked[p.id];
  });

  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'stimulasiOrder', DATA.stimulasi.opsi);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  ensureSortStates(State, 'pilahStates', 'pilahOrder', DATA.koleksi.pilah, DATA.koleksi.opsiPilah);

  /* Tahap 4 */
  DATA.olah.pertanyaan.forEach(function (q) {
    ensureShuffledOrder(State.olahOrders, q.id, q.opsi);
  });
  ensureExerciseArray(State, 'olahSteps', DATA.olah.langkah, makeDlStep);

  /* Tahap 5 */
  var L = DATA.verifikasi.lab;
  if (!isObject(State.lab) || !Array.isArray(State.lab.log)) {
    State.lab = makeExponentLabState(L.sifat[0]);
  }
  if (L.sifat.indexOf(State.lab.sifat) === -1) State.lab.sifat = L.sifat[0];
  ['a', 'b'].forEach(function (k) {
    State.lab[k] = Math.max(L.batasA[0], Math.min(L.batasA[1], State.lab[k]));
  });
  ['m', 'n'].forEach(function (k) {
    State.lab[k] = Math.max(L.batasE[0], Math.min(L.batasE[1], State.lab[k]));
  });
  ensureExerciseArray(State, 'ubinSteps', DATA.verifikasi.ubin, makeDlStep);
  ensureExerciseArray(State, 'verifSteps', DATA.verifikasi.uji, makeDlStep);
  ensureSortStates(
    State,
    'verifPilahStates',
    'verifPilahOrder',
    DATA.verifikasi.pilah,
    DATA.verifikasi.opsiPilah
  );

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

/* Memasang tombol lanjut yang menyelesaikan tahap ini lalu pindah tahap. */
function bindNext(id, stageId, nextStageId) {
  var btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', function () {
    completeStage(stageId);
    navigateTo(nextStageId);
  });
}

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

/* Pertanyaan penuntun bertahap: berikutnya muncul setelah sebelumnya benar. */
function guidedVisible(list, pilih) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    out.push(list[i]);
    if (pilih[list[i].id] !== list[i].correct) break;
  }
  return out;
}

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

/* Tabel pangkat lengkap (semua sel diketahui) sebagai kamus nilai. */
function kamusPangkat(t) {
  var semua = [];
  for (var n = t.dari; n <= t.sampai; n++) semua.push(n);
  return { a: t.a, dari: t.dari, sampai: t.sampai, diketahui: semua };
}

function buildKamus() {
  return (
    '<details class="eks-kamus" open>' +
    '<summary>📖 Kamus: tabel pangkat yang sudah kamu lengkapi</summary>' +
    DATA.koleksi.tabelPangkat
      .map(function (t) {
        return buildPowerTable(
          t.id + '-kamus',
          kamusPangkat(t),
          {},
          {
            compact: true,
            caption: 'Kamus tabel pangkat basis ' + t.a,
          }
        );
      })
      .join('') +
    '</details>'
  );
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   ============================================================ */

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var terisi = !!State.stimulasiPilihan;

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🗄️ ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<p class="eks-rule"><span aria-hidden="true">🔍</span> ' +
        esc(D.aturan) +
        '</p>' +
        '<p class="eks-ladder-title">Tabel pangkat 2</p>' +
        buildPowerTable(
          'stimTabel',
          D.tabel,
          {},
          {
            highlight: D.sorot,
            caption: 'Tabel pangkat 2 dari 2¹ sampai 2¹⁰',
          }
        ),
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
   A: tabel pangkat. B: tabel pola kali → bagi → pangkat (dibuka
   berurutan). C: pilah pernyataan.
   ============================================================ */

function tabelSemuaTerisi() {
  return DATA.koleksi.tabelPangkat.every(function (t) {
    return powerTableFilled(t, State.tabelInputs[t.id]);
  });
}

function tabelSemuaBenar() {
  return DATA.koleksi.tabelPangkat.every(function (t) {
    return powerTableAllCorrect(t, State.tabelInputs[t.id]);
  });
}

function polaBenar(p) {
  return State.polaChecked[p.id] && polaSemuaBenar(p, State.polaInputs[p.id]);
}

function semuaPolaBenar() {
  return DATA.koleksi.pola.every(polaBenar);
}

/* Umpan balik diagnosa baris yang belum tepat (maks. 3 pesan). */
function buildDiagnosaPola(p) {
  var pesan = [];
  p.baris.forEach(function (b, i) {
    var d = diagnosaPolaBaris(p, i, State.polaInputs[p.id]);
    if (d) pesan.push(d.pesan);
  });
  if (!pesan.length) return '';
  return (
    '<div class="eks-diagnosa">' +
    pesan
      .slice(0, 3)
      .map(function (m) {
        return buildFeedbackBox('warning', '💭', m);
      })
      .join('') +
    '</div>'
  );
}

function buildPolaPanel(p) {
  var benar = polaBenar(p);
  var hint = State.polaHint[p.id];
  return (
    '<div class="eks-pola" id="pola-' +
    p.id +
    '">' +
    '<h4 class="eks-pola__judul">' +
    esc(p.judul) +
    '</h4>' +
    '<p class="dl-caption">' +
    esc(p.instruksi) +
    '</p>' +
    buildPolaEksponen(p.id, p, State.polaInputs[p.id], {
      checked: State.polaChecked[p.id],
      locked: benar,
    }) +
    (benar
      ? buildFeedbackBox('success', '✓', esc(p.temuan))
      : (State.polaChecked[p.id] ? buildDiagnosaPola(p) : '') +
        '<div class="dl-input-row">' +
        '<button type="button" class="btn btn--primary" data-pola-check="' +
        p.id +
        '">Periksa Tabel</button>' +
        buildHintToggle('polaHint-' + p.id, p.hints, hint) +
        '</div>' +
        buildHintStack(p.hints, hint)) +
    '</div>'
  );
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var tabelBenar = State.tabelChecked && tabelSemuaBenar();
  var polaSelesai = tabelBenar && semuaPolaBenar();
  var semuaPilah = sortItemsAllAnswered(D.pilah, State.pilahStates);

  var tabelHTML = D.tabelPangkat
    .map(function (t) {
      return (
        '<div>' +
        '<p class="eks-ladder-title">Basis ' +
        t.a +
        '</p>' +
        buildPowerTable(t.id, t, State.tabelInputs[t.id], {
          checked: State.tabelChecked,
          locked: tabelBenar,
          caption: 'Tabel pangkat basis ' + t.a,
        }) +
        '</div>'
      );
    })
    .join('');

  var polaHTML = '';
  if (tabelBenar) {
    for (var i = 0; i < D.pola.length; i++) {
      polaHTML += buildPolaPanel(D.pola[i]);
      if (!polaBenar(D.pola[i])) break;
    }
  }

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
        tabelHTML +
        (tabelBenar
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Tabelmu lengkap.</strong> Setiap naik satu eksponen, nilainya dikali basis.'
            )
          : '<div class="dl-input-row" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="tabelCheck">Periksa Tabel</button>' +
            buildHintToggle('tabelHintBtn', D.hintsTabel, State.tabelHint) +
            '</div>' +
            buildHintStack(D.hintsTabel, State.tabelHint))
    ) +
    (tabelBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            '<p>' +
            esc(D.instruksiB) +
            '</p>' +
            buildKamus() +
            polaHTML
        )
      : '') +
    (polaSelesai
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
    (polaSelesai && semuaPilah ? buildDlNextButton('koleksiNextBtn', D.nextLabel) : '') +
    '</section>';

  var rerender = function () {
    renderKoleksi(container);
  };

  D.tabelPangkat.forEach(function (t) {
    bindPowerTable(container, t.id, State.tabelInputs[t.id], saveState, function () {
      var btn = document.getElementById('tabelCheck');
      if (btn) btn.click();
    });
  });

  var check = document.getElementById('tabelCheck');
  if (check) {
    check.addEventListener('click', function () {
      if (!tabelSemuaTerisi()) {
        showNotice('Lengkapi semua sel tabel terlebih dahulu.');
        return;
      }
      State.tabelChecked = true;
      saveState();
      if (!tabelSemuaBenar()) showNotice('Masih ada yang belum tepat. Perhatikan tanda ✗.');
      rerender();
    });
  }

  var hint = document.getElementById('tabelHintBtn');
  if (hint) {
    hint.addEventListener('click', function () {
      State.tabelHint = Math.min(State.tabelHint + 1, D.hintsTabel.length);
      saveState();
      rerender();
    });
  }

  D.pola.forEach(function (p) {
    bindPolaEksponen(container, p.id, State.polaInputs[p.id], saveState, function () {
      var btn = container.querySelector('[data-pola-check="' + p.id + '"]');
      if (btn) btn.click();
    });
    var hb = document.getElementById('polaHint-' + p.id);
    if (hb) {
      hb.addEventListener('click', function () {
        State.polaHint[p.id] = Math.min(State.polaHint[p.id] + 1, p.hints.length);
        saveState();
        rerender();
      });
    }
  });

  container.querySelectorAll('[data-pola-check]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var p = DATA.koleksi.pola.filter(function (x) {
        return x.id === btn.dataset.polaCheck;
      })[0];
      if (!polaSemuaTerisi(p, State.polaInputs[p.id])) {
        showNotice('Isi nilai dan eksponen k di setiap baris terlebih dahulu.');
        return;
      }
      State.polaChecked[p.id] = true;
      saveState();
      if (!polaSemuaBenar(p, State.polaInputs[p.id])) {
        showNotice('Masih ada baris yang belum tepat. Baca umpan baliknya.');
      }
      rerender();
    });
  });

  bindSortItems(container, D.pilah, State.pilahStates, saveState, rerender);
  bindNext('koleksiNextBtn', 'koleksi', 'olah');
}

/* ============================================================
   8. STAGE: OLAH DATA  (Discovery Learning — sintaks 4)
   Kolom m, n, k → pertanyaan penuntun → uji basis baru → rumus.
   ============================================================ */

function renderOlah(container) {
  var D = DATA.olah;
  var quizBenar = guidedQuizAllCorrect(D.pertanyaan, State.olahPilih);
  var langkahSelesai = quizBenar && stepsDone(State.olahSteps);

  var tabelHTML = DATA.koleksi.pola
    .map(function (p) {
      return buildPolaEksponen(p.id + '-olah', p, State.polaInputs[p.id], {
        locked: true,
        tampilMN: true,
        caption: p.judul,
      });
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Olah Data">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.instruksi) +
        '</p>' +
        '<div class="eks-olah-grid">' +
        tabelHTML +
        '</div>'
    ) +
    buildDlPanel(
      buildGuidedQuizList(
        guidedVisible(D.pertanyaan, State.olahPilih),
        State.olahOrders,
        State.olahPilih
      )
    ) +
    (quizBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulLangkah) +
            '</h3>' +
            '<p>' +
            esc(D.instruksiLangkah) +
            '</p>' +
            buildStepSeq('ol', State.olahSteps, D.langkah)
        )
      : '') +
    (langkahSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Pola yang kamu temukan</h3>' + buildRumusGrid(D.rumus),
          'panel--hero'
        ) + buildDlNextButton('olahNextBtn', D.nextLabel)
      : '') +
    '</section>';

  var rerender = function () {
    renderOlah(container);
  };
  bindGuidedQuizList(container, D.pertanyaan, State.olahPilih, saveState, rerender);
  bindStepSeq('ol', State.olahSteps, D.langkah, rerender);
  bindNext('olahNextBtn', 'olah', 'verifikasi');
}

/* ============================================================
   9. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A: lab uji sifat. B: ubin faktor. C: dugaan awal. D: miskonsepsi.
   ============================================================ */

var LAB_ID = 'xlab';

function labOpts() {
  var L = DATA.verifikasi.lab;
  return {
    sifat: L.sifat,
    syarat: L.syarat,
    nama: L.nama,
    positif: L.positif,
    batasA: L.batasA,
    batasE: L.batasE,
  };
}

function labSelesai() {
  return labSyaratSelesai(State.lab, DATA.verifikasi.lab.syarat);
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
    '<span class="dugaan-row__title">Folder Raka: 2³ × 2⁴</span>' +
    '<span>Dugaanmu: <strong>' +
    esc(findOptionLabel(S.opsi, State.stimulasiPilihan) || '—') +
    '</strong></span>' +
    '<span>Hasil penemuan: <strong>' +
    esc(findOptionLabel(S.opsi, benarId)) +
    '</strong></span>' +
    '<span class="dugaan-row__verdict">' +
    (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh data') +
    '</span>' +
    '</div>' +
    '</div>'
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var selesaiA = labSelesai();
  var selesaiB = selesaiA && stepsDone(State.ubinSteps);
  var selesaiC = selesaiB && stepsDone(State.verifSteps);
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
              '<strong>Daftar periksa lengkap.</strong> Ketiga sifat selalu menghasilkan ruas yang sama, sedangkan ketiga dugaan teman gugur oleh contoh penyangkal.'
            )
          : '')
    ) +
    (selesaiA
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
    (selesaiB
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulC) +
            '</h3>' +
            buildStepSeq('vf', State.verifSteps, D.uji) +
            (selesaiC ? buildDugaanBanding() : '')
        )
      : '') +
    (selesaiC
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulD) +
            '</h3>' +
            '<p>' +
            esc(D.instruksiD) +
            '</p>' +
            buildSortItems(D.pilah, State.verifPilahOrder, D.opsiPilah, State.verifPilahStates, {
              mono: true,
            })
        )
      : '') +
    (selesaiC && semuaPilah ? buildDlNextButton('verifNextBtn', D.nextLabel) : '') +
    '</section>';

  renderLab(container);

  var rerender = function () {
    renderVerifikasi(container);
  };
  bindStepSeq('ub', State.ubinSteps, D.ubin, rerender);
  bindStepSeq('vf', State.verifSteps, D.uji, rerender);
  bindSortItems(container, D.pilah, State.verifPilahStates, saveState, rerender);
  bindNext('verifNextBtn', 'verifikasi', 'generalisasi');
}

/* ============================================================
   10. STAGE: MENARIK KESIMPULAN  (Discovery Learning — sintaks 6)
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali data tabelmu, lalu pilih potongan lain.</p>'
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
          '<h3 style="margin-top:0;">Rangkuman Sifat Operasi Bilangan Berpangkat</h3>' +
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
   11. STAGE: UJI TERAP
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
  inputMode: 'numeric',
  revealButtonStyle: 'separate',
  parseInput: function (str) {
    return parseInputInt(str, true);
  },
  isCorrect: function (v, s) {
    return v === s.jawab;
  },
  invalidMessage: 'Tulis jawaban berupa bilangan bulat, mis. 12 atau 1.024.',
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
   12. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var totalPilah = DATA.koleksi.pilah.length + DATA.verifikasi.pilah.length;
  var benarPilah =
    sortItemsCorrectCount(DATA.koleksi.pilah, State.pilahStates) +
    sortItemsCorrectCount(DATA.verifikasi.pilah, State.verifPilahStates);
  var langkah = State.olahSteps.concat(State.ubinSteps, State.verifSteps);
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
   13. STAGE: SELESAI
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
    buildRumusGrid(DATA.olah.rumus) +
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
    'Kemampuan murid menjelaskan pola eksponen dari data tabel dan ubin faktor dengan kata-kata sendiri tetap menjadi bahan penilaian utama.' +
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
   14. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  stimulasi: renderStimulasi,
  masalah: renderMasalah,
  koleksi: renderKoleksi,
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
   15. HELPER UI — MODAL RESET
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
   16. INIT
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
