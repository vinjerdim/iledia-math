'use strict';

/* ============================================================
   app.js — Logika media pembelajaran
   Pangkat Nol & Pangkat Negatif serta Penyederhanaan Bentuk
   Aljabar Berpangkat — Fase E (SMK RPL), Discovery Learning

   Struktur:
     1. Konstanta
     2. State & storage (+ pengacakan semua pilihan jawaban)
     3. Navigasi
     4. Utilitas render
     5–13. Renderer tiap tahap
     14. Router render
     15. Modal reset
     16. Init

   Seluruh komponen umum (tangga pangkat, lab uji sifat eksponen,
   diagnosa nilai pangkat, monomial berpangkat, langkah isian,
   pemilahan, pertanyaan penuntun) berasal dari shared/engine.js.
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
var STORAGE_KEY = 'mpi-e-1-2-pangkat-nol-negatif-dl-v1';

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
  koleksiSteps: [],
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 4 — olah data */
  olahOrders: {},
  olahPilih: {},
  olahSteps: [],

  /* Tahap 5 — pembuktian */
  lab: null,
  kalkulator: {},
  verifPilahStates: {},
  verifPilahOrder: null,

  /* Tahap 6 — menarik kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 7 — uji terap */
  terapkanIdx: 0,
  terapkanSoal: [],

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

function makeKalkState() {
  return { input: '', done: false, revealed: false, attempts: 0, kode: null };
}

/*
 * Menyiapkan seluruh array state per-soal DAN seluruh urutan acak
 * pilihan jawaban. Dipanggil sekali saat init (setelah loadState) dan
 * setiap kali progress direset, sehingga urutan stabil lintas reload
 * tetapi teracak ulang setiap Reset.
 */
function initExerciseArrays() {
  [
    'tanggaInputs',
    'olahOrders',
    'olahPilih',
    'kalkulator',
    'simpulanPilihan',
    'refleksiAnswers',
  ].forEach(function (k) {
    ensureObject(State, k);
  });
  DATA.koleksi.tangga.forEach(function (t) {
    ensureObject(State.tanggaInputs, t.id);
  });

  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'stimulasiOrder', DATA.stimulasi.opsi);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  ensureExerciseArray(State, 'koleksiSteps', DATA.koleksi.langkah, makeDlStep);
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
  DATA.verifikasi.kalkulator.forEach(function (k) {
    if (!isObject(State.kalkulator[k.id])) State.kalkulator[k.id] = makeKalkState();
  });
  ensureSortStates(
    State,
    'verifPilahStates',
    'verifPilahOrder',
    DATA.verifikasi.pilah,
    DATA.verifikasi.opsiPilah
  );

  /* Tahap 6 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);

  /* Tahap 7 — urutan opsi bentuk positif diacak per soal */
  ensureExerciseArray(State, 'terapkanSoal', DATA.terapkan.soal, function (s) {
    return {
      inputs: {},
      attempts: 0,
      hintLevel: 0,
      kode: null,
      done: false,
      revealed: false,
      chosen: null,
      pilihSalah: 0,
      optionOrder: shuffleArray(optionIds(s.opsi)),
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

/* Langkah isian ditampilkan satu per satu sampai yang belum selesai. */
function buildStepSeq(prefix, steps, langkah) {
  var html = '';
  for (var i = 0; i < langkah.length; i++) {
    html +=
      '<div class="pnn-step">' + buildDlStep(prefix + i, steps[i], langkah[i], i + 1) + '</div>';
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
    '<div class="formula-duo pnn-formula-grid">' +
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

function buildH3(teks) {
  return '<h3 style="margin-top:0;">' + esc(teks) + '</h3>';
}

/* Konsol JavaScript tiruan untuk stimulasi. */
function buildKonsol(lines) {
  return (
    '<div class="pnn-konsol" role="img" aria-label="Konsol JavaScript: ' +
    esc(
      lines
        .map(function (l) {
          return l.kode + ' menghasilkan ' + l.hasil;
        })
        .join(', ')
    ) +
    '">' +
    '<div class="pnn-konsol__bar" aria-hidden="true"><span></span><span></span><span></span> Console</div>' +
    lines
      .map(function (l) {
        return (
          '<div class="pnn-konsol__baris' +
          (l.sorot ? ' pnn-konsol__baris--sorot' : '') +
          '" aria-hidden="true">' +
          '<span class="pnn-konsol__in">&gt; ' +
          esc(l.kode) +
          '</span>' +
          '<span class="pnn-konsol__out">&lt; ' +
          esc(l.hasil) +
          '</span>' +
          '</div>'
        );
      })
      .join('') +
    '</div>'
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
      '<h2 style="margin-top:0;">💻 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<div class="pnn-stim-grid">' +
        buildKonsol(D.konsol) +
        '<div>' +
        '<p class="pnn-subjudul">Tangga pangkat 2</p>' +
        buildPowerLadder(
          'stimTangga',
          D.tangga,
          {},
          {
            tanya: true,
            caption: 'Tangga pangkat 2 dari 2³ turun sampai 2⁻³',
          }
        ) +
        '</div>' +
        '</div>' +
        '<p class="pnn-rule"><span aria-hidden="true">🔍</span> ' +
        esc(D.aturan) +
        '</p>',
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
   A: tangga pangkat. B: jalur sifat pembagian. C: pilah pernyataan.
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

function tanggaSelesai() {
  return State.tanggaChecked && tanggaSemuaBenar();
}

/* Tiga tangga pangkat berdampingan; locked → tampilan ringkasan (tahap olah). */
function buildTanggaGrid(prefix, locked) {
  return (
    '<div class="pnn-tangga-grid">' +
    DATA.koleksi.tangga
      .map(function (t) {
        return (
          '<div class="pnn-tangga">' +
          '<p class="pnn-subjudul">Basis ' +
          t.a +
          '</p>' +
          buildPowerLadder(prefix + t.id, t, State.tanggaInputs[t.id], {
            checked: State.tanggaChecked,
            locked: locked,
            caption: 'Tangga pangkat basis ' + t.a,
          }) +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var selesaiA = tanggaSelesai();
  var selesaiB = selesaiA && stepsDone(State.koleksiSteps);
  var semuaPilah = sortItemsAllAnswered(D.pilah, State.pilahStates);

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    buildDlPanel(
      buildH3(D.judulA) +
        '<p>' +
        esc(D.instruksiA) +
        '</p>' +
        buildTanggaGrid('', selesaiA) +
        (selesaiA
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Ketiga tangga lengkap.</strong> Perhatikan baris berpangkat 0 dan baris berpangkat negatif — datamu akan dipakai di tahap berikutnya.'
            )
          : '<div class="dl-input-row" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="tanggaCheck">Periksa Tangga</button>' +
            buildHintToggle('tanggaHintBtn', D.hintsTangga, State.tanggaHint) +
            '</div>' +
            buildHintStack(D.hintsTangga, State.tanggaHint))
    ) +
    (selesaiA
      ? buildDlPanel(
          buildH3(D.judulB) +
            '<p>' +
            esc(D.instruksiB) +
            '</p>' +
            buildStepSeq('kl', State.koleksiSteps, D.langkah)
        )
      : '') +
    (selesaiB
      ? buildDlPanel(
          buildH3(D.judulC) +
            '<p>' +
            esc(D.instruksiC) +
            '</p>' +
            buildSortItems(D.pilah, State.pilahOrder, D.opsiPilah, State.pilahStates)
        )
      : '') +
    (selesaiB && semuaPilah ? buildDlNextButton('koleksiNextBtn', D.nextLabel) : '') +
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

  bindStepSeq('kl', State.koleksiSteps, D.langkah, rerender);
  bindSortItems(container, D.pilah, State.pilahStates, saveState, rerender);
  bindNext('koleksiNextBtn', 'koleksi', 'olah');
}

/* ============================================================
   8. STAGE: OLAH DATA  (Discovery Learning — sintaks 4)
   Tangga (ringkasan) → pertanyaan penuntun → uji basis baru → rumus.
   ============================================================ */

function renderOlah(container) {
  var D = DATA.olah;
  var quizBenar = guidedQuizAllCorrect(D.pertanyaan, State.olahPilih);
  var langkahSelesai = quizBenar && stepsDone(State.olahSteps);

  container.innerHTML =
    '<section aria-label="Olah Data">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.instruksi) +
        '</p>' +
        '<details class="pnn-kamus" open>' +
        '<summary>📖 Data tangga pangkat yang sudah kamu lengkapi</summary>' +
        buildTanggaGrid('ol-', true) +
        '</details>'
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
          buildH3(D.judulLangkah) +
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
   A: lab uji sifat. B: kalkulator berdiagnosa. C: dugaan awal.
   D: pilah miskonsepsi.
   ============================================================ */

var LAB_ID = 'xlab';

function labOpts() {
  var L = DATA.verifikasi.lab;
  return {
    sifat: L.sifat,
    syarat: L.syarat,
    nama: L.nama,
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

function kalkulatorSelesai() {
  return DATA.verifikasi.kalkulator.every(function (k) {
    return State.kalkulator[k.id].done;
  });
}

/* Soal kalkulator ditampilkan satu per satu sampai yang belum selesai. */
function buildKalkulator() {
  var html = '';
  var list = DATA.verifikasi.kalkulator;
  for (var i = 0; i < list.length; i++) {
    var k = list[i];
    var st = State.kalkulator[k.id];
    var soal = esc(formatPangkat(k.a, k.n));
    var benar = formatPecahan(pangkatBulat(k.a, k.n));
    if (st.done) {
      html +=
        '<div class="dl-step dl-step--done pnn-kalk">' +
        '<p class="dl-step__label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        soal +
        ' = ' +
        esc(benar) +
        (st.revealed ? ' <span class="dl-caption">(jawaban ditampilkan)</span>' : ' ✓') +
        '</p>' +
        '</div>';
      continue;
    }
    html +=
      '<div class="dl-step pnn-kalk">' +
      '<p class="dl-step__label"><span class="dl-step__num">' +
      (i + 1) +
      '</span><label for="kalk-' +
      k.id +
      '">' +
      soal +
      ' = …</label></p>' +
      '<div class="dl-input-row">' +
      buildDlNumInput('kalk-' + k.id, st.input, {
        error: !!st.kode,
        rational: true,
        aria: 'Nilai ' + formatPangkat(k.a, k.n),
      }) +
      '<button type="button" class="btn btn--primary" data-kalk-check="' +
      k.id +
      '">Periksa</button>' +
      (st.attempts >= 2
        ? '<button type="button" class="btn btn--ghost btn--small" data-kalk-reveal="' +
          k.id +
          '">Lihat Jawaban</button>'
        : '') +
      '</div>' +
      (st.kode
        ? '<div style="margin-top:var(--space-3);">' +
          buildFeedbackBox(
            'warning',
            '💭',
            '<strong>' +
              soal +
              ' ≠ ' +
              esc(st.input) +
              '.</strong> ' +
              pesanDiagnosaPangkat(st.kode, formatBasis(k.a), k.n)
          ) +
          '</div>'
        : '') +
      '</div>';
    break;
  }
  return html;
}

function bindKalkulator(container, rerender) {
  container.querySelectorAll('[data-kalk-check]').forEach(function (btn) {
    var k = DATA.verifikasi.kalkulator.filter(function (x) {
      return x.id === btn.dataset.kalkCheck;
    })[0];
    var st = State.kalkulator[k.id];
    var inp = document.getElementById('kalk-' + k.id);
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') btn.click();
    });
    btn.addEventListener('click', function () {
      var parsed = parseInputPecahan(inp.value);
      if (parsed.error) {
        showNotice(
          parsed.error === 'empty'
            ? 'Isi jawabanmu terlebih dahulu.'
            : 'Tulis jawaban berupa bilangan bulat atau pecahan, mis. 16 atau −1/8.'
        );
        return;
      }
      st.input = inp.value.trim();
      st.attempts += 1;
      var kode = diagnosaPangkat(k.a, k.n, parsed.value);
      st.done = kode === 'benar';
      st.kode = st.done ? null : kode;
      saveState();
      rerender();
    });
  });
  container.querySelectorAll('[data-kalk-reveal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var st = State.kalkulator[btn.dataset.kalkReveal];
      st.done = true;
      st.revealed = true;
      st.kode = null;
      saveState();
      rerender();
    });
  });
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
    '<span class="dugaan-row__title">Konsol Raka: 2 ** 0 → 1</span>' +
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
    (State.stimulasiAlasan.trim()
      ? '<div class="dugaan-row">' +
        '<span class="dugaan-row__title">Konsol Raka: 2 ** -3 → 0.125</span>' +
        '<span>Alasanmu dulu: <em>' +
        esc(State.stimulasiAlasan.trim()) +
        '</em></span>' +
        '<span>Hasil penemuan: <strong>2⁻³ = 1/2³ = 1/8 = 0,125</strong></span>' +
        '</div>'
      : '') +
    '</div>'
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var selesaiA = labSelesai();
  var selesaiB = selesaiA && kalkulatorSelesai();
  var semuaPilah = sortItemsAllAnswered(D.pilah, State.verifPilahStates);

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      buildH3(D.judulA) +
        '<p>' +
        esc(D.instruksiA) +
        '</p>' +
        '<div id="labWrap"></div>' +
        (selesaiA
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Daftar periksa lengkap.</strong> Kedua sifat selalu menghasilkan ruas yang sama untuk a ≠ 0, sedangkan dugaan Dimas dan Sinta gugur oleh contoh penyangkal.'
            )
          : '')
    ) +
    (selesaiA
      ? buildDlPanel(buildH3(D.judulB) + '<p>' + esc(D.instruksiB) + '</p>' + buildKalkulator())
      : '') +
    (selesaiB
      ? buildDlPanel(buildH3(D.judulC) + buildDugaanBanding()) +
        buildDlPanel(
          buildH3(D.judulD) +
            '<p>' +
            esc(D.instruksiD) +
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
  bindKalkulator(container, rerender);
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali data tangga dan lab, lalu pilih potongan lain.</p>'
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
          '<h3 style="margin-top:0;">Rangkuman Pangkat Nol &amp; Pangkat Negatif</h3>' +
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
   11. STAGE: UJI TERAP — MENYEDERHANAKAN BENTUK ALJABAR
   Langkah 1: isian koefisien & eksponen (diagnosa monomial).
   Langkah 2: pilih bentuk eksponen positif (opsi diacak di
   initExerciseArrays()).
   ============================================================ */

function kunciSoal(s) {
  return hitungEkspresiMonomial(s.ekspresi);
}

function soalSelesai(s, ex) {
  return ex.done && ex.chosen === s.correct;
}

function semuaSoalSelesai() {
  return DATA.terapkan.soal.every(function (s, i) {
    return soalSelesai(s, State.terapkanSoal[i]);
  });
}

/* Opsi bentuk positif dirender sebagai pecahan bersusun. */
function opsiPositifHTML(s) {
  return s.opsi.map(function (o) {
    return { id: o.id, label: buildMonomialPositif(monomial(o.koef, o.pangkat)) };
  });
}

function buildLangkahIsian(s, ex) {
  var D = DATA.terapkan;
  var kunci = kunciSoal(s);
  if (ex.done) {
    return (
      '<p class="exercise-label">' +
      esc(D.labelIsian) +
      '</p>' +
      buildFeedbackBox(
        ex.revealed ? 'info' : 'success',
        ex.revealed ? '👁' : '✓',
        (ex.revealed ? 'Jawabannya: ' : '<strong>Tepat!</strong> Hasilnya ') +
          '<strong class="pnn-mono">' +
          esc(formatMonomial(kunci)) +
          '</strong>'
      )
    );
  }
  return (
    '<p class="exercise-label">' +
    esc(D.labelIsian) +
    '</p>' +
    buildMonomialInput('mono-' + s.id, s.vars, ex.inputs, { error: !!ex.kode }) +
    '<p class="dl-caption">Koefisien boleh pecahan (mis. 1/4). Tulis eksponen 0 bila variabelnya hilang, dan eksponen negatif dengan tanda minus (mis. −5).</p>' +
    '<div class="dl-input-row">' +
    '<button type="button" class="btn btn--primary" id="monoCheck">Periksa</button>' +
    buildHintToggle('monoHint', s.hints, ex.hintLevel) +
    (ex.attempts >= 2
      ? '<button type="button" class="btn btn--ghost btn--small" id="monoReveal">Lihat Jawaban</button>'
      : '') +
    '</div>' +
    (ex.kode
      ? '<div style="margin-top:var(--space-3);">' +
        buildFeedbackBox('warning', '💭', pesanDiagnosaMonomial(ex.kode)) +
        '</div>'
      : '') +
    buildHintStack(s.hints, ex.hintLevel)
  );
}

function buildLangkahPilih(s, ex) {
  var benar = ex.chosen === s.correct;
  return (
    '<div class="pnn-pilih">' +
    '<p class="exercise-label">' +
    esc(DATA.terapkan.labelPilih) +
    '</p>' +
    buildChoiceGroup(opsiPositifHTML(s), ex.optionOrder, {
      chosen: ex.chosen,
      correctId: benar ? s.correct : null,
      grade: true,
      locked: benar,
    }) +
    (ex.chosen
      ? benar
        ? buildFeedbackBox('success', '✓', '<strong>Tepat!</strong> ' + esc(s.explanation))
        : buildFeedbackBox(
            'error',
            '✗',
            'Belum tepat. Pindahkan hanya faktor yang eksponennya negatif ke penyebut, lalu ubah eksponennya menjadi positif. Koefisien tidak ikut pindah kecuali berupa pecahan.'
          )
      : '') +
    '</div>'
  );
}

function renderTerapkan(container) {
  var D = DATA.terapkan;
  var idx = State.terapkanIdx;
  var s = D.soal[idx];
  var ex = State.terapkanSoal[idx];
  var selesaiIni = soalSelesai(s, ex);
  var semua = semuaSoalSelesai();

  var titik = D.soal
    .map(function (x, i) {
      var st = State.terapkanSoal[i];
      var cls = 'pnn-dot';
      if (soalSelesai(x, st)) cls += ' pnn-dot--done';
      if (i === idx) cls += ' pnn-dot--aktif';
      return (
        '<button type="button" class="' +
        cls +
        '" data-soal-idx="' +
        i +
        '" aria-label="Kasus uji ' +
        (i + 1) +
        (soalSelesai(x, st) ? ', selesai' : '') +
        '"' +
        (i === idx ? ' aria-current="step"' : '') +
        '>' +
        (i + 1) +
        '</button>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Uji Terap">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    '<nav class="pnn-dots" aria-label="Pilih kasus uji">' +
    titik +
    '</nav>' +
    buildDlPanel(
      '<p class="pnn-kasus">Kasus uji ' +
        (idx + 1) +
        ' dari ' +
        D.soal.length +
        ' — sederhanakan:</p>' +
        '<div class="pnn-soal">' +
        buildEkspresiMonomial(s.ekspresi) +
        '</div>' +
        buildLangkahIsian(s, ex) +
        (ex.done ? buildLangkahPilih(s, ex) : '')
    ) +
    '<div class="btn-group btn-group--spread">' +
    '<button type="button" class="btn btn--ghost" id="soalPrev"' +
    (idx === 0 ? ' disabled' : '') +
    '>← Sebelumnya</button>' +
    (semua
      ? '<button type="button" class="btn btn--primary" id="terapkanNextBtn">' +
        esc(D.nextLabel) +
        '</button>'
      : '<button type="button" class="btn btn--primary" id="soalNext"' +
        (idx === D.soal.length - 1 || !selesaiIni ? ' disabled' : '') +
        '>Kasus berikutnya →</button>') +
    '</div>' +
    '</section>';

  var rerender = function () {
    renderTerapkan(container);
  };

  bindMonomialInput(container, 'mono-' + s.id, ex.inputs, saveState, function () {
    var btn = document.getElementById('monoCheck');
    if (btn) btn.click();
  });

  var check = document.getElementById('monoCheck');
  if (check) {
    check.addEventListener('click', function () {
      var r = bacaMonomialInput(s.vars, ex.inputs);
      if (r.error) {
        showNotice(
          r.error === 'empty'
            ? 'Isi koefisien dan eksponen setiap variabel (tulis 0 bila variabelnya hilang).'
            : 'Koefisien berupa bilangan tak nol (boleh pecahan), eksponen berupa bilangan bulat.'
        );
        return;
      }
      ex.attempts += 1;
      var kode = diagnosaMonomial(kunciSoal(s), r.value);
      ex.done = kode === 'benar';
      ex.kode = ex.done ? null : kode;
      saveState();
      rerender();
    });
  }

  var hint = document.getElementById('monoHint');
  if (hint) {
    hint.addEventListener('click', function () {
      ex.hintLevel = Math.min(ex.hintLevel + 1, s.hints.length);
      saveState();
      rerender();
    });
  }

  var reveal = document.getElementById('monoReveal');
  if (reveal) {
    reveal.addEventListener('click', function () {
      ex.done = true;
      ex.revealed = true;
      ex.kode = null;
      saveState();
      rerender();
    });
  }

  container.querySelectorAll('.pnn-pilih [data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (ex.chosen === s.correct) return;
      ex.chosen = btn.dataset.optId;
      if (ex.chosen !== s.correct) ex.pilihSalah += 1;
      saveState();
      rerender();
    });
  });

  container.querySelectorAll('[data-soal-idx]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.terapkanIdx = parseInt(btn.dataset.soalIdx, 10);
      saveState();
      rerender();
    });
  });

  var prev = document.getElementById('soalPrev');
  if (prev) {
    prev.addEventListener('click', function () {
      State.terapkanIdx = Math.max(0, idx - 1);
      saveState();
      rerender();
    });
  }
  var next = document.getElementById('soalNext');
  if (next) {
    next.addEventListener('click', function () {
      State.terapkanIdx = Math.min(D.soal.length - 1, idx + 1);
      saveState();
      rerender();
    });
  }
  bindNext('terapkanNextBtn', 'terapkan', 'refleksi');
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
  var kalk = DATA.verifikasi.kalkulator.filter(function (k) {
    var st = State.kalkulator[k.id];
    return st.done && !st.revealed && st.attempts === 1;
  }).length;
  var terapSekali = State.terapkanSoal.filter(function (e) {
    return e.done && !e.revealed && e.attempts === 1 && e.pilihSalah === 0;
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
        kartu(State.lab.log.length, 'Uji tercatat di lab') +
        kartu(kalk + '/' + DATA.verifikasi.kalkulator.length, 'Nilai pangkat benar sekali coba') +
        kartu(terapSekali + '/' + DATA.terapkan.soal.length, 'Kasus uji tuntas tanpa salah') +
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
    'Kemampuan murid menjelaskan mengapa a⁰ = 1 dan a⁻ⁿ = 1/aⁿ dari pola data dengan kata-kata sendiri tetap menjadi bahan penilaian utama.' +
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
