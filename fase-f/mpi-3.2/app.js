'use strict';

/* ============================================================
   app.js — Logika media pembelajaran
   Bunga Majemuk dengan Barisan & Deret Geometri
   Fase F — SMK RPL, Inquiry Learning

   Struktur:
     1. Konstanta
     2. State & storage (+ pengacakan semua pilihan jawaban)
     3. Navigasi
     4. Utilitas render
     5–15. Renderer tiap tahap
     16. Router render
     17. Modal reset
     18. Init

   Seluruh komponen umum (buku tabungan, simulator bunga majemuk,
   tabel isian deret, deret suku, langkah isian, pemilahan,
   pertanyaan penuntun, grafik perbandingan, soal latihan, rumus
   bunga) berasal dari shared/engine.js.
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'masalah',
  'hipotesis',
  'dataSaldo',
  'dataPola',
  'uji',
  'periode',
  'simpulan',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Orientasi',
  'Masalah',
  'Hipotesis',
  'Data Saldo',
  'Olah Pola',
  'Uji',
  'Periode',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-f-3-2-bunga-majemuk-il-v1';

var KASUS = DATA.kasus;
var I_TAHUN = persenKeDesimal(KASUS.persenTahun);

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Tahap 1 — orientasi (dugaan, tidak dinilai) */
  orientasiOrder: null,
  orientasiPilihan: null,
  untungOrder: null,
  untungPilihan: null,
  orientasiAlasan: '',

  /* Tahap 2 — merumuskan masalah */
  masalahOrder: null,
  masalahPilihan: null,

  /* Tahap 3 — hipotesis (tidak dinilai) */
  hipotesisOrder: null,
  hipotesisPilihan: null,
  hipotesisTeks: '',

  /* Tahap 4 — data saldo */
  tabelInputs: {},
  tabelChecked: false,
  tabelHint: 0,
  sim: null,
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 5 — olah pola */
  polaSteps: [],
  polaOrders: {},
  polaPilih: {},

  /* Tahap 6 — uji hipotesis */
  ujiSteps: [],
  ujiPilahStates: {},
  ujiPilahOrder: null,

  /* Tahap 7 — periode pemajemukan */
  periodeSteps: [],
  periodeOrders: {},
  periodePilih: {},

  /* Tahap 8 — kesimpulan */
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
  ['tabelInputs', 'polaOrders', 'polaPilih', 'periodeOrders', 'periodePilih'].forEach(ensureObject);
  ['simpulanPilihan', 'refleksiAnswers'].forEach(ensureObject);

  /* Tahap 1–3 */
  ensureShuffledOrder(State, 'orientasiOrder', DATA.orientasi.opsi);
  ensureShuffledOrder(State, 'untungOrder', DATA.orientasi.opsiUntung);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);
  ensureShuffledOrder(State, 'hipotesisOrder', DATA.hipotesis.opsi);

  /* Tahap 4 */
  if (!State.sim || typeof State.sim !== 'object') State.sim = makeCompoundSimState();
  ensureSortStates(
    State,
    'pilahStates',
    'pilahOrder',
    DATA.dataSaldo.pilah,
    DATA.dataSaldo.opsiPilah
  );

  /* Tahap 5 */
  ensureExerciseArray(State, 'polaSteps', DATA.dataPola.langkah, makeDlStep);
  DATA.dataPola.pertanyaan.forEach(function (q) {
    ensureShuffledOrder(State.polaOrders, q.id, q.opsi);
  });

  /* Tahap 6 */
  ensureExerciseArray(State, 'ujiSteps', DATA.uji.langkah, makeDlStep);
  ensureSortStates(State, 'ujiPilahStates', 'ujiPilahOrder', DATA.uji.pilah, DATA.uji.opsiPilah);

  /* Tahap 7 */
  ensureExerciseArray(State, 'periodeSteps', DATA.periode.langkah, makeDlStep);
  DATA.periode.pertanyaan.forEach(function (q) {
    ensureShuffledOrder(State.periodeOrders, q.id, q.opsi);
  });

  /* Tahap 8 */
  ensureShuffledOrder(State, 'bankOrder', DATA.simpulan.bank);

  /* Tahap 9 — uji terap (dirender createExerciseStage) */
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

  /* Tahap 10 */
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

function fmt(n) {
  return formatNumber(n, '−');
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

/* Langkah isian ditampilkan satu per satu sampai yang belum selesai. */
function buildStepSeq(prefix, steps, langkah) {
  var html = '';
  for (var i = 0; i < langkah.length; i++) {
    html += buildDlStep(prefix + i, steps[i], langkah[i], i + 1);
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

/* Barisan saldo Nadia di Bank B: M₀, M₁, …, Mₙ. */
function saldoNadia(n) {
  return saldoBungaMajemuk(KASUS.M0, I_TAHUN, n);
}

/* Label Mₖ untuk ubin barisan saldo. */
function labelSaldo(k) {
  return 'M' + subskrip(k);
}

function textarea(id, label, placeholder, value) {
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

/* Kartu rumus temuan. */
function buildFormulaMajemuk() {
  return '<div class="formula-card"><span class="formula-card__label">Nilai akhir modal bunga majemuk</span>Mₙ = M₀(1 + i)ⁿ</div>';
}

function buildFormulaBunga() {
  return '<div class="formula-card"><span class="formula-card__label">Total bunga n periode</span>Bₙ = Mₙ − M₀</div>';
}

/* ============================================================
   5. STAGE: ORIENTASI  (Inquiry Learning — sintaks 1)
   Murid mengamati dua tawaran dan MENDUGA. Tidak dinilai.
   ============================================================ */

function buildBukuTawaran(tawaran) {
  var D = DATA.orientasi;
  var majemuk = tawaran.id === 'B';
  var rows = [];
  for (var k = 0; k <= D.tampilTahun; k++) {
    var saldo = majemuk
      ? nilaiAkhirBungaMajemuk(KASUS.M0, I_TAHUN, k)
      : nilaiAkhirBungaTunggal(KASUS.M0, I_TAHUN, k);
    var bunga = null;
    if (k > 0) {
      bunga = majemuk
        ? bungaPeriodeMajemuk(KASUS.M0, I_TAHUN, k)[k - 1]
        : bungaTunggal(KASUS.M0, I_TAHUN, 1);
    }
    rows.push({ label: 'Tahun ' + k, bunga: bunga, saldo: saldo, sorot: k === D.tampilTahun });
  }
  rows.push({ jeda: true });
  rows.push({ label: 'Tahun ' + D.tahunDitanya, bunga: '?', saldo: '?' });
  return (
    '<div class="tawaran">' +
    '<p class="bunga-rule"><span aria-hidden="true">🏦</span> <span><strong>' +
    esc(tawaran.nama) +
    ':</strong> ' +
    esc(tawaran.aturan) +
    '</span></p>' +
    buildBukuTabungan(rows, {
      judul: 'Buku Tabungan ' + tawaran.nama,
      caption: 'Buku tabungan ' + tawaran.nama + ' tahun 0 sampai ' + D.tampilTahun,
    }) +
    '</div>'
  );
}

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var terisi = !!State.orientasiPilihan && !!State.untungPilihan;

  container.innerHTML =
    '<section aria-label="Orientasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">💻 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<div class="tawaran-grid">' +
        D.tawaran.map(buildBukuTawaran).join('') +
        '</div>',
      'panel--hero'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.orientasiOrder, {
          chosen: State.orientasiPilihan,
          attr: 'data-dugaan',
          group: 'dugaan',
        }) +
        '<p class="exercise-label" style="margin-top:var(--space-5);">' +
        esc(D.pertanyaanUntung) +
        '</p>' +
        buildChoiceGroup(D.opsiUntung, State.untungOrder, {
          chosen: State.untungPilihan,
          attr: 'data-untung',
          group: 'untung',
        }) +
        '<div style="margin-top:var(--space-5);">' +
        textarea('orientasiAlasan', D.alasanLabel, D.alasanPlaceholder, State.orientasiAlasan) +
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

  container.querySelectorAll('[data-dugaan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.orientasiPilihan = btn.dataset.dugaan;
      saveState();
      renderOrientasi(container);
    });
  });
  container.querySelectorAll('[data-untung]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.untungPilihan = btn.dataset.untung;
      saveState();
      renderOrientasi(container);
    });
  });

  bindTextarea('orientasiAlasan', 'orientasiAlasan');

  document.getElementById('orientasiNextBtn').addEventListener('click', function () {
    if (!State.orientasiPilihan || !State.untungPilihan) {
      showNotice('Pilih kedua dugaanmu sebelum melanjutkan.');
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
   Tidak dinilai; diuji pada tahap Uji.
   ============================================================ */

function renderHipotesis(container) {
  var D = DATA.hipotesis;
  var dipilih = !!State.hipotesisPilihan;

  container.innerHTML =
    '<section aria-label="Merumuskan Hipotesis">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.hipotesisOrder, { chosen: State.hipotesisPilihan }) +
        '<div style="margin-top:var(--space-5);">' +
        textarea('hipotesisTeks', D.hipotesisLabel, D.hipotesisPlaceholder, State.hipotesisTeks) +
        '</div>' +
        buildFeedbackBox('info', '🧪', esc(D.catatan))
    ) +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="hipotesisNextBtn"' +
    (dipilih ? '' : ' disabled') +
    '>' +
    esc(D.nextLabel) +
    '</button>' +
    '</div>' +
    '</section>';

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.hipotesisPilihan = btn.dataset.optId;
      saveState();
      renderHipotesis(container);
    });
  });

  bindTextarea('hipotesisTeks', 'hipotesisTeks');

  document.getElementById('hipotesisNextBtn').addEventListener('click', function () {
    if (!State.hipotesisPilihan) {
      showNotice('Pilih dugaan polamu lebih dulu.');
      return;
    }
    if (!State.hipotesisTeks.trim()) {
      showNotice('Tulis hipotesismu lebih dulu, walau hanya satu kalimat.');
      return;
    }
    completeStage('hipotesis');
    navigateTo('dataSaldo');
  });
}

/* ============================================================
   8. STAGE: MENGUMPULKAN DATA SALDO  (Inquiry Learning — sintaks 4)
   A: buku tabungan tahun 1–4 (tabel isian deret).
   B: simulator bunga majemuk (dibuka setelah tabel benar).
   C: pilah pernyataan (dibuka setelah cukup bereksplorasi).
   ============================================================ */

function kolomTabel() {
  var D = DATA.dataSaldo;
  var bunga = bungaPeriodeMajemuk(KASUS.M0, I_TAHUN, D.tabelN);
  var saldo = saldoNadia(D.tabelN).slice(1);
  return [
    { id: 'bunga', label: D.kolom.bunga, values: bunga, editable: true, parse: parseInputAngka },
    { id: 'saldo', label: D.kolom.saldo, values: saldo, editable: true, parse: parseInputAngka },
  ];
}

function tabelTerisi(columns) {
  return columns.every(function (c) {
    var isi = State.tabelInputs[c.id] || [];
    return c.values.every(function (v, i) {
      return String(isi[i] || '').trim() !== '';
    });
  });
}

function renderDataSaldo(container) {
  var D = DATA.dataSaldo;
  var columns = kolomTabel();
  var tabelBenar = State.tabelChecked && seriesFillTableAllCorrect(columns, State.tabelInputs);
  var cukupEksplor = tabelBenar && State.sim.ubah >= D.minUbah;
  var semuaPilah = sortItemsAllAnswered(D.pilah, State.pilahStates);

  container.innerHTML =
    '<section aria-label="Mengumpulkan Data Saldo">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">A. Buku tabungan Bank B</h3>' +
        '<p>' +
        esc(D.instruksiA) +
        '</p>' +
        '<p class="bunga-rule"><span aria-hidden="true">🏦</span> ' +
        esc(DATA.orientasi.tawaran[1].aturan) +
        ' Setoran awal M₀ = ' +
        esc(formatRupiah(KASUS.M0)) +
        '.</p>' +
        buildSeriesFillTable('tabelMajemuk', columns, State.tabelInputs, {
          checked: State.tabelChecked,
          locked: tabelBenar,
          caption: 'Buku tabungan Nadia di Bank B tahun 1 sampai ' + D.tabelN,
        }) +
        (tabelBenar
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Datamu lengkap.</strong> Bunga tiap tahun makin besar karena dihitung dari saldo yang terus bertambah.'
            )
          : '<div class="dl-input-row" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="tabelCheck">Periksa Tabel</button>' +
            buildHintToggle('tabelHintBtn', D.hintsTabel, State.tabelHint) +
            '</div>' +
            buildHintStack(D.hintsTabel, State.tabelHint))
    ) +
    (tabelBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">B. ' +
            esc(D.judulSim) +
            '</h3>' +
            '<p>' +
            esc(D.instruksiSim) +
            '</p>' +
            buildCompoundSimulator('simMajemuk', State.sim, D.sim) +
            (cukupEksplor
              ? ''
              : '<p class="dl-caption">Pengaturan yang sudah kamu coba: ' +
                Math.min(State.sim.ubah, D.minUbah) +
                ' dari ' +
                D.minUbah +
                '.</p>')
        )
      : '') +
    (cukupEksplor
      ? buildDlPanel(
          '<h3 style="margin-top:0;">C. Pilah pernyataan</h3>' +
            '<p>' +
            esc(D.instruksiB) +
            '</p>' +
            buildSortItems(D.pilah, State.pilahOrder, D.opsiPilah, State.pilahStates)
        )
      : '') +
    (cukupEksplor && semuaPilah ? buildDlNextButton('dataSaldoNextBtn', D.nextLabel) : '') +
    '</section>';

  var rerender = function () {
    renderDataSaldo(container);
  };

  bindSeriesFillTable(container, 'tabelMajemuk', State.tabelInputs, saveState, function () {
    var btn = document.getElementById('tabelCheck');
    if (btn) btn.click();
  });

  var check = document.getElementById('tabelCheck');
  if (check) {
    check.addEventListener('click', function () {
      if (!tabelTerisi(columns)) {
        showNotice('Lengkapi semua sel tabel terlebih dahulu.');
        return;
      }
      State.tabelChecked = true;
      saveState();
      if (!seriesFillTableAllCorrect(columns, State.tabelInputs)) {
        showNotice('Masih ada sel yang belum tepat. Perhatikan tanda ✗.');
      }
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

  bindCompoundSimulator(container, 'simMajemuk', State.sim, D.sim, saveState, rerender);
  bindSortItems(container, D.pilah, State.pilahStates, saveState, rerender);
  bindNext('dataSaldoNextBtn', 'dataSaldo', 'dataPola');
}

/* ============================================================
   9. STAGE: MENGOLAH DATA POLA  (Inquiry Learning — sintaks 4)
   Saldo = barisan geometri a = M₀, r = 1 + i → Mₙ = M₀(1 + i)ⁿ.
   ============================================================ */

function renderDataPola(container) {
  var D = DATA.dataPola;
  var langkahSelesai = stepsDone(State.polaSteps);
  var semuaBenar = langkahSelesai && guidedQuizAllCorrect(D.pertanyaan, State.polaPilih);
  var saldo = saldoNadia(D.tampilN - 1);

  container.innerHTML =
    '<section aria-label="Mengolah Data Pola">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.instruksi) +
        '</p>' +
        buildSequenceTiles(saldo, {
          labels: saldo.map(function (v, k) {
            return labelSaldo(k) + ' = U' + subskrip(k + 1);
          }),
          showDiff: true,
          gap: 'ratio',
          more: true,
          format: fmt,
        }) +
        '<p class="dl-caption">Mₖ = saldo akhir tahun ke-k (M₀ = setoran awal).</p>' +
        buildStepSeq('ps', State.polaSteps, D.langkah)
    ) +
    (langkahSelesai
      ? buildDlPanel(
          buildGuidedQuizList(
            guidedVisible(D.pertanyaan, State.polaPilih),
            State.polaOrders,
            State.polaPilih
          )
        )
      : '') +
    (semuaBenar
      ? buildDlPanel(
          '<div class="formula-duo">' + buildFormulaMajemuk() + buildFormulaBunga() + '</div>',
          'panel--hero'
        ) + buildDlNextButton('polaNextBtn', D.nextLabel)
      : '') +
    '</section>';

  var rerender = function () {
    renderDataPola(container);
  };
  bindStepSeq('ps', State.polaSteps, D.langkah, rerender);
  bindGuidedQuizList(container, D.pertanyaan, State.polaPilih, saveState, rerender);
  bindNext('polaNextBtn', 'dataPola', 'uji');
}

/* ============================================================
   10. STAGE: MENGUJI HIPOTESIS  (Inquiry Learning — sintaks 5)
   A: uji rumus pada tabel & dugaan tahun ke-5.
   B: bandingkan dengan bunga tunggal.  C: periksa hipotesis.
   ============================================================ */

function ujiGrupSelesai(grup) {
  return DATA.uji.langkah.every(function (u, i) {
    return u.grup !== grup || State.ujiSteps[i].done;
  });
}

/* Langkah grup ditampilkan satu per satu sampai yang belum selesai. */
function buildGrupSteps(grup) {
  var html = '';
  var no = 0;
  var langkah = DATA.uji.langkah;
  for (var i = 0; i < langkah.length; i++) {
    if (langkah[i].grup !== grup) continue;
    no += 1;
    html += buildDlStep('uj' + i, State.ujiSteps[i], langkah[i], no);
    if (!State.ujiSteps[i].done) break;
  }
  return html;
}

function buildTabelUji() {
  var n = DATA.dataSaldo.tabelN;
  var saldo = saldoNadia(n);
  var rows = [];
  for (var k = 1; k <= n; k++) {
    rows.push({ n: k, manual: saldo[k], rumus: KASUS.M0 * Math.pow(1 + I_TAHUN, k) });
  }
  return buildSeriesCheckTable(rows, {
    format: fmt,
    manualLabel: 'Saldo di buku tabungan',
    rumusLabel: 'M₀(1 + i)ⁿ',
    caption: 'Uji rumus nilai akhir modal bunga majemuk tahun 1 sampai ' + n,
  });
}

function buildDugaanRow(judul, dugaan, hasil, cocok) {
  return (
    '<div class="dugaan-row' +
    (cocok ? ' dugaan-row--ok' : '') +
    '">' +
    '<span class="dugaan-row__title">' +
    esc(judul) +
    '</span>' +
    '<span>Dugaanmu: <strong>' +
    esc(dugaan || '—') +
    '</strong></span>' +
    '<span>Hasil penyelidikan: <strong>' +
    esc(hasil) +
    '</strong></span>' +
    '<span class="dugaan-row__verdict">' +
    (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh data') +
    '</span>' +
    '</div>'
  );
}

function buildDugaanBanding() {
  var O = DATA.orientasi;
  var U = DATA.uji;
  var H = DATA.hipotesis;
  return (
    '<div class="dugaan-compare">' +
    buildDugaanRow(
      'Saldo Bank B akhir tahun ke-' + O.tahunDitanya,
      findOptionLabel(O.opsi, State.orientasiPilihan),
      findOptionLabel(O.opsi, U.dugaanBenar),
      State.orientasiPilihan === U.dugaanBenar
    ) +
    buildDugaanRow(
      'Tawaran yang lebih untung',
      findOptionLabel(O.opsiUntung, State.untungPilihan),
      findOptionLabel(O.opsiUntung, U.untungBenar),
      State.untungPilihan === U.untungBenar
    ) +
    buildDugaanRow(
      'Pola saldo bunga majemuk',
      findOptionLabel(H.opsi, State.hipotesisPilihan),
      findOptionLabel(H.opsi, U.hipotesisBenar),
      State.hipotesisPilihan === U.hipotesisBenar
    ) +
    '</div>' +
    (State.hipotesisTeks.trim()
      ? '<p class="dl-caption">Hipotesis tertulismu: “' + esc(State.hipotesisTeks.trim()) + '”</p>'
      : '')
  );
}

function buildGrafikBanding() {
  var n = DATA.uji.bandingN;
  var tunggal = [];
  var majemuk = [];
  for (var k = 1; k <= n; k++) {
    tunggal.push(nilaiAkhirBungaTunggal(KASUS.M0, I_TAHUN, k));
    majemuk.push(nilaiAkhirBungaMajemuk(KASUS.M0, I_TAHUN, k));
  }
  return (
    buildCompareBarChart(
      [
        { label: 'Koperasi A (bunga tunggal)', values: tunggal },
        { label: 'Bank B (bunga majemuk)', values: majemuk },
      ],
      {
        xLabel: function (i) {
          return 'Th ' + (i + 1);
        },
        format: function (v) {
          return formatDesimal(v / 1000000, 1) + ' jt';
        },
        highlight: n - 1,
        caption:
          'Grafik saldo bunga tunggal dan bunga majemuk 10% per tahun selama ' + n + ' tahun',
      }
    ) +
    '<p class="dl-caption">Tahun ke-' +
    n +
    ': bunga tunggal ' +
    esc(formatRupiah(tunggal[n - 1])) +
    ', bunga majemuk ≈ ' +
    esc(formatRupiah(bulatkanRupiah(majemuk[n - 1]))) +
    '.</p>'
  );
}

function renderUji(container) {
  var D = DATA.uji;
  var selesaiA = ujiGrupSelesai('A');
  var selesaiB = ujiGrupSelesai('B');
  var semuaPilah = sortItemsAllAnswered(D.pilah, State.ujiPilahStates);

  container.innerHTML =
    '<section aria-label="Menguji Hipotesis">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        buildTabelUji() +
        buildGrupSteps('A') +
        (selesaiA ? buildDugaanBanding() : '')
    ) +
    (selesaiA
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            buildGrafikBanding() +
            buildGrupSteps('B')
        )
      : '') +
    (selesaiA && selesaiB
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulC) +
            '</h3>' +
            '<p>' +
            esc(D.instruksiC) +
            '</p>' +
            buildSortItems(D.pilah, State.ujiPilahOrder, D.opsiPilah, State.ujiPilahStates)
        )
      : '') +
    (selesaiA && selesaiB && semuaPilah ? buildDlNextButton('ujiNextBtn', D.nextLabel) : '') +
    '</section>';

  var rerender = function () {
    renderUji(container);
  };
  D.langkah.forEach(function (u, i) {
    bindDlStep('uj' + i, State.ujiSteps[i], u, saveState, rerender);
  });
  bindSortItems(container, D.pilah, State.ujiPilahStates, saveState, rerender);
  bindNext('ujiNextBtn', 'uji', 'periode');
}

/* ============================================================
   11. STAGE: PERIODE PEMAJEMUKAN  (siklus inkuiri kedua)
   ============================================================ */

function renderPeriode(container) {
  var D = DATA.periode;
  var langkahSelesai = stepsDone(State.periodeSteps);
  var semuaBenar = langkahSelesai && guidedQuizAllCorrect(D.pertanyaan, State.periodePilih);

  container.innerHTML =
    '<section aria-label="Periode Pemajemukan">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🏦 ' +
        esc(D.judul) +
        '</h3>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        buildStepSeq('pr', State.periodeSteps, D.langkah)
    ) +
    (langkahSelesai
      ? buildDlPanel(
          buildGuidedQuizList(
            guidedVisible(D.pertanyaan, State.periodePilih),
            State.periodeOrders,
            State.periodePilih
          )
        )
      : '') +
    (semuaBenar
      ? buildDlPanel(
          '<div class="formula-card"><span class="formula-card__label">Dimajemukkan m kali setahun selama t tahun</span>i = p% : m &nbsp;·&nbsp; n = t × m</div>',
          'panel--hero'
        ) + buildDlNextButton('periodeNextBtn', D.nextLabel)
      : '') +
    '</section>';

  var rerender = function () {
    renderPeriode(container);
  };
  bindStepSeq('pr', State.periodeSteps, D.langkah, rerender);
  bindGuidedQuizList(container, D.pertanyaan, State.periodePilih, saveState, rerender);
  bindNext('periodeNextBtn', 'periode', 'simpulan');
}

/* ============================================================
   12. STAGE: MERUMUSKAN KESIMPULAN  (Inquiry Learning — sintaks 6)
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali hasil penyelidikanmu, lalu pilih potongan lain.</p>'
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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah jawaban atas rumusan masalah yang kamu selidiki.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Bunga Majemuk</h3>' +
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
   13. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js): campuran soal 'input'
   dan 'choice'; urutan opsi dari ex.optionOrder yang diacak di
   initExerciseArrays(). Isian dibaca parseInputAngka() sehingga
   'Rp5.832.000', '5832000', dan '8%' sama-sama diterima; jawaban
   rupiah boleh selisih ≤ Rp1 karena pembulatan.
   ============================================================ */

function jawabanTerapBenar(v, s) {
  if (hampirSama(v, s.jawab)) return true;
  return s.jawab >= 1000 && Math.abs(v - s.jawab) <= 1;
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
  inputMode: 'decimal',
  revealButtonStyle: 'separate',
  parseInput: parseInputAngka,
  isCorrect: jawabanTerapBenar,
  invalidMessage: 'Tulis jawaban berupa bilangan, mis. 5.832.000 atau 4.',
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
   14. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var benarPilah =
    sortItemsCorrectCount(DATA.dataSaldo.pilah, State.pilahStates) +
    sortItemsCorrectCount(DATA.uji.pilah, State.ujiPilahStates);
  var totalPilah = DATA.dataSaldo.pilah.length + DATA.uji.pilah.length;
  var langkah = State.polaSteps.concat(State.ujiSteps, State.periodeSteps);
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
    esc(D.teks) +
    '</p>' +
    '<div class="formula-duo">' +
    buildFormulaMajemuk() +
    buildFormulaBunga() +
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
    'Kemampuan murid menjelaskan proses penyelidikan dan kaitan bunga majemuk dengan barisan & deret geometri dengan kata-kata sendiri tetap menjadi bahan penilaian utama.' +
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
   16. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  masalah: renderMasalah,
  hipotesis: renderHipotesis,
  dataSaldo: renderDataSaldo,
  dataPola: renderDataPola,
  uji: renderUji,
  periode: renderPeriode,
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
