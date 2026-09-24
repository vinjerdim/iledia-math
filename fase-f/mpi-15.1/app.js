'use strict';

/* ============================================================
   app.js — Logika media pembelajaran
   Peluang Kejadian Majemuk
   Fase F (Kelas XII) — SMK RPL, Inquiry Learning

   Struktur:
     1. Konstanta
     2. State & storage (+ pengacakan semua pilihan jawaban)
     3. Navigasi
     4. Utilitas render
     5–14. Renderer tiap tahap
     15. Router render
     16. Modal reset
     17. Init

   Seluruh komponen umum berasal dari shared/engine.js: mesin tahap,
   penyimpanan, pilihan acak, langkah isian, pemilahan, pertanyaan
   penuntun, tahap latihan soal, serta seksi 28 — peluang kejadian
   majemuk (ruang sampel, sifatKejadian, diagnosaPeluang, simulator
   percobaan, grid ruang sampel bertanda, diagram Venn).

   Alur tahap mengikuti sintaks Inquiry Learning; lihat komentar kepala
   data.js untuk pemetaan dan rangkaian aktivitasnya.
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'masalah',
  'hipotesis',
  'dataDadu',
  'dataKoinKartu',
  'uji',
  'simpulan',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Orientasi',
  'Masalah',
  'Hipotesis',
  'Data Dadu',
  'Data Koin & Kartu',
  'Uji Hipotesis',
  'Kesimpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-f-15-1-peluang-majemuk-il-v1';

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Tahap 1 — orientasi (dugaan, tidak dinilai) */
  orientasiOrder: null,
  orientasiPilihan: null,
  orientasiAlasan: '',
  simOrientasi: null,

  /* Tahap 2 — merumuskan masalah */
  masalahOrder: null,
  masalahPilihan: null,

  /* Tahap 3 — merumuskan hipotesis */
  hipotesisOrders: {},
  hipotesisPilih: {},
  hipotesisTeks: '',

  /* Tahap 4 — data dadu */
  simDadu: null,
  amatiOrders: {},
  amatiPilih: {},
  gridDadu: {},
  stepsDadu: {},

  /* Tahap 5 — data koin & kartu */
  simKoinDadu: null,
  gridKoinDadu: null,
  stepsKoinDadu: [],
  gridKartu: null,
  stepsKartu: [],
  simKembali: null,
  simTanpa: null,
  stepsDuaKartu: [],
  kartuOrders: {},
  kartuPilih: {},

  /* Tahap 6 — menguji hipotesis */
  ujiOrders: {},
  ujiPilih: {},
  pilahStates: {},
  pilahOrder: null,
  ujiSteps: [],
  ujiRevisi: '',

  /* Tahap 7 — kesimpulan */
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

function ensureObject(obj, key) {
  if (!obj[key] || typeof obj[key] !== 'object' || Array.isArray(obj[key])) obj[key] = {};
}

function ensureSim(obj, key) {
  var st = obj[key];
  if (!st || typeof st !== 'object' || typeof st.n !== 'number' || !st.frek) {
    obj[key] = makeProbSimState();
  }
}

function ensureGrid(obj, key) {
  var st = obj[key];
  if (!st || typeof st !== 'object' || !st.A || !st.B || !st.cek) obj[key] = makeGridMarkState();
}

/*
 * Menyiapkan seluruh state per-langkah DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset, sehingga urutan stabil lintas reload tetapi
 * teracak ulang setiap Reset.
 */
function initExerciseArrays() {
  [
    'hipotesisOrders',
    'hipotesisPilih',
    'amatiOrders',
    'amatiPilih',
    'gridDadu',
    'stepsDadu',
    'kartuOrders',
    'kartuPilih',
    'ujiOrders',
    'ujiPilih',
    'simpulanPilihan',
    'refleksiAnswers',
  ].forEach(function (k) {
    ensureObject(State, k);
  });

  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'orientasiOrder', DATA.orientasi.opsi);
  ensureSim(State, 'simOrientasi');
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  DATA.hipotesis.dugaan.forEach(function (h) {
    ensureShuffledOrder(State.hipotesisOrders, h.id, DATA.hipotesis.opsiDugaan);
  });

  /* Tahap 4 */
  ensureSim(State, 'simDadu');
  DATA.dataDadu.amati.forEach(function (q) {
    ensureShuffledOrder(State.amatiOrders, q.id, q.opsi);
  });
  DATA.dataDadu.pasangan.forEach(function (p) {
    ensureGrid(State.gridDadu, p.id);
    ensureExerciseArray(State.stepsDadu, p.id, p.langkah, makeDlStep);
  });

  /* Tahap 5 */
  var K = DATA.dataKoinKartu;
  ensureSim(State, 'simKoinDadu');
  ensureGrid(State, 'gridKoinDadu');
  ensureExerciseArray(State, 'stepsKoinDadu', K.bagianA.langkah, makeDlStep);
  ensureGrid(State, 'gridKartu');
  ensureExerciseArray(State, 'stepsKartu', K.bagianB.langkah, makeDlStep);
  ensureSim(State, 'simKembali');
  ensureSim(State, 'simTanpa');
  ensureExerciseArray(State, 'stepsDuaKartu', K.bagianC.langkah, makeDlStep);
  ensureShuffledOrder(State.kartuOrders, K.bagianC.tanya.id, K.bagianC.tanya.opsi);

  /* Tahap 6 */
  DATA.uji.tanya.forEach(function (q) {
    ensureShuffledOrder(State.ujiOrders, q.id, q.opsi);
  });
  ensureSortStates(State, 'pilahStates', 'pilahOrder', DATA.uji.pilah, DATA.uji.opsiPilah);
  ensureExerciseArray(State, 'ujiSteps', DATA.uji.langkah, makeDlStep);

  /* Tahap 7 */
  ensureShuffledOrder(State, 'bankOrder', DATA.simpulan.bank);

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

function stepsDone(steps) {
  return steps.every(function (s) {
    return s.done;
  });
}

/* Umpan balik diagnosa miskonsepsi untuk isian peluang yang salah. */
function buildDiagnosaStep(st, step) {
  if (!st.salah || !step.cek || !step.cek.ruang) return '';
  if (['pA', 'pB', 'pGabungan', 'pIrisan'].indexOf(step.cek.tanya) === -1) return '';
  var parsed = parseInputPecahan(st.input);
  if (parsed.error) return '';
  var kode = diagnosaPeluang(
    parsed.value,
    sifatKejadian(step.cek.ruang, step.cek.A, step.cek.B),
    step.cek.tanya
  );
  if (kode === 'benar' || kode === 'lain') return '';
  return (
    '<div class="pk-diagnosa">' +
    buildFeedbackBox('warning', '💭', pesanDiagnosaPeluang(kode)) +
    '</div>'
  );
}

/* Langkah isian ditampilkan satu per satu sampai yang belum selesai. */
function buildStepSeq(prefix, steps, langkah) {
  var html = '';
  for (var i = 0; i < langkah.length; i++) {
    html +=
      '<div class="pk-step">' +
      buildDlStep(prefix + i, steps[i], langkah[i], i + 1) +
      buildDiagnosaStep(steps[i], langkah[i]) +
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

/* Pertanyaan penuntun berikutnya muncul setelah yang sebelumnya benar. */
function guidedVisible(list, pilih) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    out.push(list[i]);
    if (pilih[list[i].id] !== list[i].correct) break;
  }
  return out;
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

/* Kartu-kartu rumus. */
function buildRumusGrid(list) {
  return (
    '<div class="formula-duo pk-formula-grid">' +
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

/* Pemeriksaan tanda grid: kedua lapis A dan B sudah benar. */
function gridBenar(st) {
  return !!(st.cek.A && st.cek.A.benar && st.cek.B && st.cek.B.benar);
}

function gridLocked(st) {
  return {
    A: !!(st.cek.A && st.cek.A.benar),
    B: !!(st.cek.B && st.cek.B.benar),
  };
}

/* Ringkasan hasil pemeriksaan satu lapis. */
function pesanCekLapis(label, cek) {
  if (!cek) return '';
  if (cek.benar) return '<li>✓ ' + esc(label) + ': semua anggota sudah tepat.</li>';
  var bagian = [];
  if (cek.lebih.length) bagian.push(cek.lebih.length + ' sel bukan anggota (bingkai merah)');
  if (cek.kurang.length) bagian.push(cek.kurang.length + ' anggota terlewat (garis putus merah)');
  return '<li>✗ ' + esc(label) + ': ' + bagian.join(', ') + '.</li>';
}

/*
 * Blok lengkap "tandai ruang sampel → periksa → Venn → langkah isian".
 *   cfg: { id, ruang, A, B, labelA, labelB, grid (state), steps, langkah, caption }
 */
function buildGridBlock(cfg) {
  var st = cfg.grid;
  var benar = gridBenar(st);
  var cekHTML =
    st.cek.A || st.cek.B
      ? '<ul class="pk-cek">' +
        pesanCekLapis(cfg.labelA, st.cek.A) +
        pesanCekLapis(cfg.labelB, st.cek.B) +
        '</ul>'
      : '';
  var html =
    buildOutcomeGrid(cfg.id + 'Grid', cfg.ruang, st, {
      layers: [
        { id: 'A', label: cfg.labelA },
        { id: 'B', label: cfg.labelB },
      ],
      locked: gridLocked(st),
      caption: cfg.caption,
    }) +
    cekHTML +
    (benar
      ? ''
      : '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary" id="' +
        cfg.id +
        'Check">Periksa Tanda</button>' +
        '</div>');
  if (benar) {
    var s = sifatKejadian(cfg.ruang, cfg.A, cfg.B);
    html +=
      buildFeedbackBox(
        'success',
        '✓',
        '<strong>Tanda sudah tepat.</strong> Diagram Venn di bawah merangkum banyak anggotanya.'
      ) +
      '<div class="pk-venn-row">' +
      buildVennCount(s, {
        caption: esc(cfg.labelA) + ' (biru) dan ' + esc(cfg.labelB) + ' (oranye)',
      }) +
      '</div>' +
      buildStepSeq(cfg.id + 'S', cfg.steps, cfg.langkah);
  }
  return html;
}

function bindGridBlock(container, cfg, rerender) {
  var st = cfg.grid;
  bindOutcomeGrid(container, cfg.id + 'Grid', st, { locked: gridLocked(st) }, function (key) {
    saveState();
    rerender();
    fokusSelGrid(container, cfg.id + 'Grid', key);
  });
  var check = document.getElementById(cfg.id + 'Check');
  if (check) {
    check.addEventListener('click', function () {
      if (!gridMarkCount(st, 'A') || !gridMarkCount(st, 'B')) {
        showNotice('Tandai anggota A dan anggota B lebih dulu (pilih lapisnya di atas grid).');
        return;
      }
      st.cek.A = periksaGridMark(st, cfg.ruang, cfg.A, 'A');
      st.cek.B = periksaGridMark(st, cfg.ruang, cfg.B, 'B');
      if (st.cek.A.benar && !st.cek.B.benar) st.layer = 'B';
      if (!st.cek.A.benar) st.layer = 'A';
      saveState();
      rerender();
    });
  }
  if (gridBenar(st)) bindStepSeq(cfg.id + 'S', cfg.steps, cfg.langkah, rerender);
}

/* Blok simulator dengan tombol & tabel frekuensi. */
function simOpts(sim) {
  return {
    ruang: sim.ruang,
    kejadian: sim.kejadian,
    tombol: sim.tombol,
    batas: sim.batas,
    judul: sim.judul,
  };
}

/* ============================================================
   5. STAGE: ORIENTASI  (Inquiry Learning — sintaks 1)
   Murid mengamati aturan game, mencoba simulator, lalu MENDUGA.
   ============================================================ */

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var terisi = !!State.orientasiPilihan;
  var rerender = function () {
    renderOrientasi(container);
  };

  container.innerHTML =
    '<section aria-label="Orientasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🎮 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<div class="pk-aturan-grid">' +
        D.aturan
          .map(function (a) {
            return (
              '<div class="pk-aturan">' +
              '<span class="pk-aturan__icon" aria-hidden="true">' +
              a.ikon +
              '</span>' +
              '<div><strong>' +
              esc(a.nama) +
              '</strong><p>' +
              esc(a.teks) +
              '</p></div>' +
              '</div>'
            );
          })
          .join('') +
        '</div>' +
        '<p class="pk-klaim"><span aria-hidden="true">💬</span> ' +
        esc(D.klaim) +
        '</p>',
      'panel--hero'
    ) +
    buildDlPanel(buildProbSimulator('simOrientasi', State.simOrientasi, simOpts(D.simulator))) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.orientasiOrder, { chosen: State.orientasiPilihan }) +
        '<div style="margin-top:var(--space-5);">' +
        buildTextarea(
          'orientasiAlasan',
          D.alasanLabel,
          D.alasanPlaceholder,
          State.orientasiAlasan
        ) +
        '</div>' +
        buildFeedbackBox('info', '🔎', esc(D.catatan))
    ) +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="orientasiNextBtn"' +
    (terisi ? '' : ' disabled') +
    '>' +
    esc(D.nextLabel) +
    '</button>' +
    '</div>' +
    '</section>';

  bindProbSimulator(
    container,
    'simOrientasi',
    State.simOrientasi,
    simOpts(D.simulator),
    saveState,
    rerender
  );

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.orientasiPilihan = btn.dataset.optId;
      saveState();
      rerender();
    });
  });

  bindTextarea('orientasiAlasan', 'orientasiAlasan');

  document.getElementById('orientasiNextBtn').addEventListener('click', function () {
    if (!State.orientasiPilihan) {
      showNotice('Pilih dugaanmu sebelum melanjutkan.');
      return;
    }
    completeStage('orientasi');
    navigateTo('masalah');
  });
}

/* ============================================================
   6. STAGE: MERUMUSKAN MASALAH  (Inquiry Learning — sintaks 2)
   ============================================================ */

function renderMasalah(container) {
  var D = DATA.masalah;
  var benar = State.masalahPilihan === D.correct;

  container.innerHTML =
    '<section aria-label="Merumuskan Masalah">' +
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
    (benar ? buildDlNextButton('masalahNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.masalahPilihan === D.correct) return;
      State.masalahPilihan = btn.dataset.optId;
      saveState();
      renderMasalah(container);
    });
  });

  bindNext('masalahNextBtn', 'masalah', 'hipotesis');
}

/* ============================================================
   7. STAGE: MERUMUSKAN HIPOTESIS  (Inquiry Learning — sintaks 3)
   Dugaan tiap kasus tidak dinilai; dibandingkan di tahap Uji.
   ============================================================ */

function hipotesisLengkap() {
  return DATA.hipotesis.dugaan.every(function (h) {
    return !!State.hipotesisPilih[h.id];
  });
}

function renderHipotesis(container) {
  var D = DATA.hipotesis;

  container.innerHTML =
    '<section aria-label="Merumuskan Hipotesis">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel(
      D.dugaan
        .map(function (h, i) {
          return (
            '<div class="quiz-item">' +
            '<p class="exercise-label"><span class="dl-step__num">' +
            (i + 1) +
            '</span>' +
            h.teks +
            '</p>' +
            buildChoiceGroup(D.opsiDugaan, State.hipotesisOrders[h.id], {
              chosen: State.hipotesisPilih[h.id] || null,
              group: h.id,
              attr: 'data-hip-opt',
            }) +
            '</div>'
          );
        })
        .join('')
    ) +
    buildDlPanel(
      buildTextarea('hipotesisTeks', D.hipotesisLabel, D.hipotesisPlaceholder, State.hipotesisTeks)
    ) +
    buildDlNextButton('hipotesisNextBtn', D.nextLabel) +
    '</section>';

  container.querySelectorAll('[data-hip-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.hipotesisPilih[btn.dataset.group] = btn.dataset.hipOpt;
      saveState();
      renderHipotesis(container);
    });
  });

  bindTextarea('hipotesisTeks', 'hipotesisTeks');

  document.getElementById('hipotesisNextBtn').addEventListener('click', function () {
    if (!hipotesisLengkap()) {
      showNotice('Pilih dugaanmu untuk keempat kasus lebih dulu.');
      return;
    }
    if (!State.hipotesisTeks.trim()) {
      showNotice('Tulis hipotesismu lebih dulu, walau hanya satu kalimat.');
      return;
    }
    completeStage('hipotesis');
    navigateTo('dataDadu');
  });
}

/* ============================================================
   8. STAGE: DATA DADU  (Inquiry Learning — sintaks 4)
   A: simulator + pertanyaan pengamatan (setelah ≥ minimal
   lemparan). B: grid ruang sampel untuk dua pasangan kejadian
   (pasangan 2 dibuka setelah pasangan 1 selesai).
   ============================================================ */

function pasanganSelesai(p) {
  return gridBenar(State.gridDadu[p.id]) && stepsDone(State.stepsDadu[p.id]);
}

function renderDataDadu(container) {
  var D = DATA.dataDadu;
  var rerender = function () {
    renderDataDadu(container);
  };
  var cukup = State.simDadu.n >= D.minimal;
  var amatiBeres = cukup && guidedQuizAllCorrect(D.amati, State.amatiPilih);

  var pasanganHTML = '';
  var semuaPasangan = amatiBeres;
  if (amatiBeres) {
    for (var i = 0; i < D.pasangan.length; i++) {
      var p = D.pasangan[i];
      pasanganHTML += buildDlPanel(
        '<h3 style="margin-top:0;">' +
          esc(p.judul) +
          ': ' +
          esc(p.labelA) +
          ' · ' +
          esc(p.labelB) +
          '</h3>' +
          buildGridBlock({
            id: 'gd' + p.id,
            ruang: p.ruang,
            A: p.A,
            B: p.B,
            labelA: p.labelA,
            labelB: p.labelB,
            grid: State.gridDadu[p.id],
            steps: State.stepsDadu[p.id],
            langkah: p.langkah,
            caption: 'Ruang sampel dua dadu, ' + p.labelA + ' dan ' + p.labelB,
          })
      );
      if (!pasanganSelesai(p)) {
        semuaPasangan = false;
        break;
      }
    }
  }

  container.innerHTML =
    '<section aria-label="Mengumpulkan Data Dadu">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p>' +
        esc(D.instruksiA) +
        '</p>' +
        buildProbSimulator('simDadu', State.simDadu, simOpts(D.simulator)) +
        (cukup
          ? '<div class="pk-amati">' +
            buildGuidedQuizList(
              guidedVisible(D.amati, State.amatiPilih),
              State.amatiOrders,
              State.amatiPilih
            ) +
            '</div>'
          : '<p class="dl-caption">Pertanyaan pengamatan muncul setelah ' +
            D.minimal +
            ' lemparan (sekarang ' +
            State.simDadu.n +
            ').</p>')
    ) +
    (amatiBeres
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3><p style="margin:0;">' +
            esc(D.instruksiB) +
            '</p>',
          'panel--info'
        ) + pasanganHTML
      : '') +
    (semuaPasangan ? buildDlNextButton('dataDaduNextBtn', D.nextLabel, true) : '') +
    '</section>';

  bindProbSimulator(container, 'simDadu', State.simDadu, simOpts(D.simulator), saveState, rerender);
  bindGuidedQuizList(container, D.amati, State.amatiPilih, saveState, rerender);

  if (amatiBeres) {
    for (var k = 0; k < D.pasangan.length; k++) {
      var pk = D.pasangan[k];
      bindGridBlock(
        container,
        {
          id: 'gd' + pk.id,
          ruang: pk.ruang,
          A: pk.A,
          B: pk.B,
          grid: State.gridDadu[pk.id],
          steps: State.stepsDadu[pk.id],
          langkah: pk.langkah,
        },
        rerender
      );
      if (!pasanganSelesai(pk)) break;
    }
  }

  bindNext('dataDaduNextBtn', 'dataDadu', 'dataKoinKartu');
}

/* ============================================================
   9. STAGE: DATA KOIN & KARTU  (Inquiry Learning — sintaks 4)
   A: koin + dadu (grid & simulator). B: kartu As & Hati (grid).
   C: dua kartu dengan vs tanpa pengembalian (dua simulator).
   Bagian berikutnya terbuka setelah bagian sebelumnya selesai.
   ============================================================ */

function bagianGridCfg(prefix, b, grid, steps) {
  return {
    id: prefix,
    ruang: b.ruang,
    A: b.A,
    B: b.B,
    labelA: b.labelA,
    labelB: b.labelB,
    grid: grid,
    steps: steps,
    langkah: b.langkah,
    caption: 'Ruang sampel ' + b.judul,
  };
}

function renderDataKoinKartu(container) {
  var D = DATA.dataKoinKartu;
  var rerender = function () {
    renderDataKoinKartu(container);
  };
  var cfgA = bagianGridCfg('bgA', D.bagianA, State.gridKoinDadu, State.stepsKoinDadu);
  var cfgB = bagianGridCfg('bgB', D.bagianB, State.gridKartu, State.stepsKartu);
  var selesaiA = gridBenar(State.gridKoinDadu) && stepsDone(State.stepsKoinDadu);
  var selesaiB = selesaiA && gridBenar(State.gridKartu) && stepsDone(State.stepsKartu);
  var C = D.bagianC;
  var cukupC = State.simKembali.n >= C.minimal && State.simTanpa.n >= C.minimal;
  var langkahC = selesaiB && cukupC;
  var tanyaC = langkahC && stepsDone(State.stepsDuaKartu);
  var selesaiC = tanyaC && guidedQuizAllCorrect([C.tanya], State.kartuPilih);

  var html =
    '<section aria-label="Mengumpulkan Data Koin dan Kartu">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.bagianA.judul) +
        '</h3>' +
        '<p>' +
        esc(D.bagianA.instruksi) +
        '</p>' +
        '<div class="pk-duo">' +
        '<div>' +
        buildGridBlock(cfgA) +
        '</div>' +
        '<div>' +
        buildProbSimulator('simKoinDadu', State.simKoinDadu, simOpts(D.bagianA.simulator)) +
        '</div>' +
        '</div>'
    );

  if (selesaiA) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.bagianB.judul) +
        '</h3>' +
        '<p>' +
        esc(D.bagianB.instruksi) +
        '</p>' +
        buildGridBlock(cfgB)
    );
  }

  if (selesaiB) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(C.judul) +
        '</h3>' +
        '<p>' +
        esc(C.instruksi) +
        '</p>' +
        '<div class="pk-duo">' +
        buildProbSimulator('simKembali', State.simKembali, simOpts(C.simulatorKembali)) +
        buildProbSimulator('simTanpa', State.simTanpa, simOpts(C.simulatorTanpa)) +
        '</div>' +
        (langkahC
          ? buildStepSeq('dk', State.stepsDuaKartu, C.langkah)
          : '<p class="dl-caption">Langkah perhitungan muncul setelah masing-masing simulator menjalankan paling sedikit ' +
            formatNumber(C.minimal) +
            ' percobaan.</p>') +
        (tanyaC
          ? '<div class="pk-amati">' +
            buildGuidedQuizList([C.tanya], State.kartuOrders, State.kartuPilih) +
            '</div>'
          : '')
    );
  }

  html += (selesaiC ? buildDlNextButton('dataKoinNextBtn', D.nextLabel, true) : '') + '</section>';
  container.innerHTML = html;

  bindGridBlock(container, cfgA, rerender);
  bindProbSimulator(
    container,
    'simKoinDadu',
    State.simKoinDadu,
    simOpts(D.bagianA.simulator),
    saveState,
    rerender
  );
  if (selesaiA) bindGridBlock(container, cfgB, rerender);
  if (selesaiB) {
    bindProbSimulator(
      container,
      'simKembali',
      State.simKembali,
      simOpts(C.simulatorKembali),
      saveState,
      rerender
    );
    bindProbSimulator(
      container,
      'simTanpa',
      State.simTanpa,
      simOpts(C.simulatorTanpa),
      saveState,
      rerender
    );
  }
  if (langkahC) bindStepSeq('dk', State.stepsDuaKartu, C.langkah, rerender);
  if (tanyaC) bindGuidedQuizList(container, [C.tanya], State.kartuPilih, saveState, rerender);

  bindNext('dataKoinNextBtn', 'dataKoinKartu', 'uji');
}

/* ============================================================
   10. STAGE: MENGUJI HIPOTESIS  (Inquiry Learning — sintaks 5)
   Hipotesis vs data → pertanyaan penuntun → pilah rumus →
   uji rumus. Bagian berikutnya terbuka setelah sebelumnya selesai.
   ============================================================ */

function buildBandingHipotesis() {
  var D = DATA.hipotesis;
  return (
    '<div class="pk-banding">' +
    D.dugaan
      .map(function (h) {
        var pilih = State.hipotesisPilih[h.id];
        var sesuai = pilih === h.fakta;
        var status = sesuai
          ? '<span class="pk-tag pk-tag--ok">✓ Hipotesis diterima</span>'
          : pilih === 'ragu'
          ? '<span class="pk-tag pk-tag--info">Kini terjawab oleh data</span>'
          : '<span class="pk-tag pk-tag--no">✗ Perlu diperbaiki</span>';
        return (
          '<div class="pk-banding__item">' +
          '<p class="pk-banding__kasus">' +
          h.teks +
          '</p>' +
          '<p class="pk-banding__row"><span>Dugaanmu: <strong>' +
          esc(findOptionLabel(D.opsiDugaan, pilih) || '–') +
          '</strong></span><span>Data: <strong>' +
          esc(findOptionLabel(D.opsiDugaan, h.fakta)) +
          '</strong></span>' +
          status +
          '</p>' +
          '<p class="pk-banding__bukti">' +
          esc(h.bukti) +
          '</p>' +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

function renderUji(container) {
  var D = DATA.uji;
  var rerender = function () {
    renderUji(container);
  };
  var tanyaBeres = guidedQuizAllCorrect(D.tanya, State.ujiPilih);
  var pilahBeres = tanyaBeres && sortItemsAllAnswered(D.pilah, State.pilahStates);
  var semua = pilahBeres && stepsDone(State.ujiSteps);

  container.innerHTML =
    '<section aria-label="Menguji Hipotesis">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulBanding) +
        '</h3>' +
        (State.hipotesisTeks
          ? '<p class="pk-hipotesis-awal"><span>Hipotesis awalmu:</span> ' +
            esc(State.hipotesisTeks) +
            '</p>'
          : '') +
        buildBandingHipotesis() +
        '<div class="pk-amati">' +
        buildGuidedQuizList(
          guidedVisible(D.tanya, State.ujiPilih),
          State.ujiOrders,
          State.ujiPilih
        ) +
        '</div>'
    ) +
    (tanyaBeres
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulPilah) +
            '</h3>' +
            '<p>' +
            esc(D.instruksiPilah) +
            '</p>' +
            buildSortItems(D.pilah, State.pilahOrder, D.opsiPilah, State.pilahStates)
        )
      : '') +
    (pilahBeres
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulRumus) +
            '</h3>' +
            buildStepSeq('uj', State.ujiSteps, D.langkah) +
            (stepsDone(State.ujiSteps)
              ? '<div style="margin-top:var(--space-4);">' +
                buildTextarea(
                  'ujiRevisi',
                  'Perbaiki hipotesismu berdasarkan data (boleh dilewati jika hipotesismu sudah tepat):',
                  'Hipotesis setelah diuji: …',
                  State.ujiRevisi
                ) +
                '</div>'
              : '')
        )
      : '') +
    (semua ? buildDlNextButton('ujiNextBtn', D.nextLabel, true) : '') +
    '</section>';

  bindGuidedQuizList(container, D.tanya, State.ujiPilih, saveState, rerender);
  if (tanyaBeres) bindSortItems(container, D.pilah, State.pilahStates, saveState, rerender);
  if (pilahBeres) bindStepSeq('uj', State.ujiSteps, D.langkah, rerender);
  bindTextarea('ujiRevisi', 'ujiRevisi');
  bindNext('ujiNextBtn', 'uji', 'simpulan');
}

/* ============================================================
   11. STAGE: MERUMUSKAN KESIMPULAN  (Inquiry Learning — sintaks 6)
   ============================================================ */

function simpulanSemuaBenar() {
  return DATA.simpulan.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function renderSimpulan(container) {
  var D = DATA.simpulan;
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali data percobaanmu, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Merumuskan Kesimpulan">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel(
      kalimatHTML +
        (benarSemua
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah rumus yang kamu temukan dari data sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Peluang Kejadian Majemuk</h3>' +
            buildRumusGrid(D.rumus) +
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
      renderSimpulan(container);
    });
  }

  bindNext('simpulanNextBtn', 'simpulan', 'terapkan');
}

/* ============================================================
   12. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js): campuran soal 'input'
   dan 'choice'; urutan opsi dari ex.optionOrder yang diacak di
   initExerciseArrays(). Isian dibaca eksak oleh parseInputPecahan()
   sehingga '5/18', '10/36', dan '0,72' diterima.
   ============================================================ */

function parseJawabanPeluang(str) {
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
  inputPlaceholder: 'mis. 5/18',
  inputMode: 'text',
  revealButtonStyle: 'separate',
  parseInput: parseJawabanPeluang,
  isCorrect: function (v, s) {
    return hampirSama(v, s.jawab);
  },
  invalidMessage: 'Tulis jawaban berupa pecahan atau desimal, mis. 5/18 atau 0,72.',
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
      s.cerita +
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

function semuaLangkah() {
  var out = [];
  DATA.dataDadu.pasangan.forEach(function (p) {
    out = out.concat(State.stepsDadu[p.id]);
  });
  return out.concat(State.stepsKoinDadu, State.stepsKartu, State.stepsDuaKartu, State.ujiSteps);
}

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var benarPilah = sortItemsCorrectCount(DATA.uji.pilah, State.pilahStates);
  var langkah = semuaLangkah();
  var sekaliCoba = langkah.filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  var percobaan = [
    State.simOrientasi,
    State.simDadu,
    State.simKoinDadu,
    State.simKembali,
    State.simTanpa,
  ].reduce(function (acc, st) {
    return acc + st.n;
  }, 0);
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
        kartu(formatNumber(percobaan), 'Percobaan acak dijalankan') +
        kartu(sekaliCoba + '/' + langkah.length, 'Langkah hitung benar sekali coba') +
        kartu(benarPilah + '/' + DATA.uji.pilah.length, 'Rumus dipilih tepat') +
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
    buildRumusGrid(DATA.simpulan.rumus) +
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
    'Kemampuan murid menjelaskan perbedaan kejadian saling lepas dan saling bebas dengan kata-kata sendiri tetap menjadi bahan penilaian utama.' +
    '</div></div>' +
    '<div class="btn-group btn-group--center">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '<button type="button" class="btn btn--outline-primary" id="reviewBtn">Tinjau Ulang</button>' +
    '</div>' +
    '</div>' +
    '</section>';

  completeStage('selesai');

  document.getElementById('reviewBtn').addEventListener('click', function () {
    navigateTo('orientasi');
  });
}

/* ============================================================
   15. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  masalah: renderMasalah,
  hipotesis: renderHipotesis,
  dataDadu: renderDataDadu,
  dataKoinKartu: renderDataKoinKartu,
  uji: renderUji,
  simpulan: renderSimpulan,
  terapkan: renderTerapkan,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  var fn = RENDERERS[State.currentStage] || RENDERERS.orientasi;
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
  if (STAGES.indexOf(State.currentStage) === -1) State.currentStage = 'orientasi';
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
      navigateTo('orientasi');
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
