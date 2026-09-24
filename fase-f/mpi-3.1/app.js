'use strict';

/* ============================================================
   app.js — Logika media pembelajaran
   Bunga Tunggal dengan Barisan & Deret Aritmetika
   Fase F — SMK RPL, Discovery Learning

   Struktur:
     1. Konstanta
     2. State & storage (+ pengacakan semua pilihan jawaban)
     3. Navigasi
     4. Utilitas render
     5–14. Renderer tiap tahap
     15. Router render
     16. Modal reset
     17. Init

   Seluruh komponen umum (buku tabungan, tabel isian deret, deret
   suku, langkah isian, pemilahan, pertanyaan penuntun, soal latihan,
   rumus bunga) berasal dari shared/engine.js.
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'koleksi',
  'olahBunga',
  'olahModal',
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
  'Olah Bunga',
  'Olah Modal',
  'Uji Rumus',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-f-3-1-bunga-tunggal-dl-v1';

var KASUS = DATA.kasus;
var I_TAHUN = persenKeDesimal(KASUS.persenTahun);

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
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 4 — olah bunga */
  bungaSteps: [],
  bungaOrders: {},
  bungaPilih: {},

  /* Tahap 5 — olah nilai akhir modal */
  modalSteps: [],
  modalOrders: {},
  modalPilih: {},

  /* Tahap 6 — pembuktian */
  verifSteps: [],

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
  ['tabelInputs', 'bungaOrders', 'bungaPilih', 'modalOrders', 'modalPilih'].forEach(ensureObject);
  ['simpulanPilihan', 'refleksiAnswers'].forEach(ensureObject);

  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'stimulasiOrder', DATA.stimulasi.opsi);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  ensureSortStates(State, 'pilahStates', 'pilahOrder', DATA.koleksi.pilah, DATA.koleksi.opsiPilah);

  /* Tahap 4–5 */
  ensureExerciseArray(State, 'bungaSteps', DATA.olahBunga.langkah, makeDlStep);
  DATA.olahBunga.pertanyaan.forEach(function (q) {
    ensureShuffledOrder(State.bungaOrders, q.id, q.opsi);
  });
  ensureExerciseArray(State, 'modalSteps', DATA.olahModal.langkah, makeDlStep);
  DATA.olahModal.pertanyaan.forEach(function (q) {
    ensureShuffledOrder(State.modalOrders, q.id, q.opsi);
  });

  /* Tahap 6 */
  ensureExerciseArray(State, 'verifSteps', DATA.verifikasi.uji, makeDlStep);

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

function fmt(n) {
  return formatNumber(n, '−');
}

/* Kotak umpan balik pilihan bertingkat (benar → success, salah → warning). */
function buildChoiceFeedback(chosen, benar, umpan) {
  return buildGuidedChoiceFeedback(chosen, benar, umpan);
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

/* Barisan saldo Raka M₀, M₁, …, Mₙ. */
function saldoRaka(n) {
  return saldoBungaTunggal(KASUS.M0, I_TAHUN, n);
}

/* Label Mₖ untuk ubin barisan saldo. */
function labelSaldo(k) {
  return 'M' + subskrip(k);
}

/* Kartu rumus temuan tahap 4–5. */
function buildFormulaBunga() {
  return '<div class="formula-card"><span class="formula-card__label">Total bunga n periode</span>Bₙ = M₀ × i × n</div>';
}

function buildFormulaModal() {
  return '<div class="formula-card"><span class="formula-card__label">Nilai akhir modal</span>Mₙ = M₀(1 + n × i)</div>';
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati buku tabungan dan MENDUGA. Tidak dinilai.
   ============================================================ */

function buildBukuRaka() {
  var D = DATA.stimulasi;
  var saldo = saldoRaka(D.tampilTahun);
  var bungaSetahun = bungaTunggal(KASUS.M0, I_TAHUN, 1);
  var rows = saldo.map(function (m, k) {
    return { label: 'Tahun ' + k, bunga: k === 0 ? null : bungaSetahun, saldo: m };
  });
  rows.push({ jeda: true });
  rows.push({ label: 'Tahun ' + D.tahunDitanya, bunga: '?', saldo: '?' });
  return buildBukuTabungan(rows, {
    judul: 'Buku Tabungan ' + KASUS.nama,
    caption: 'Buku tabungan ' + KASUS.nama + ' tahun 0 sampai ' + D.tampilTahun,
  });
}

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
        '<div class="bunga-grid">' +
        '<div>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<p class="bunga-rule"><span aria-hidden="true">🏦</span> ' +
        esc(D.aturan) +
        '</p>' +
        '</div>' +
        buildBukuRaka() +
        '</div>',
      'panel--hero'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.stimulasiOrder, { chosen: State.stimulasiPilihan }) +
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
      State.stimulasiPilihan = btn.dataset.optId;
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
        buildChoiceFeedback(State.masalahPilihan, benar, D.umpan)
    ) +
    (benar
      ? buildDlPanel(
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
   Bagian A: buku tabungan tahun 1–4 (tabel isian deret).
   Bagian B: pilah pernyataan (dibuka setelah tabel benar).
   ============================================================ */

function kolomTabel() {
  var D = DATA.koleksi;
  var bunga = [];
  var total = [];
  var saldo = [];
  for (var n = 1; n <= D.tabelN; n++) {
    bunga.push(bungaTunggal(KASUS.M0, I_TAHUN, 1));
    total.push(bungaTunggal(KASUS.M0, I_TAHUN, n));
    saldo.push(nilaiAkhirBungaTunggal(KASUS.M0, I_TAHUN, n));
  }
  return [
    { id: 'bunga', label: D.kolom.bunga, values: bunga, editable: true, parse: parseInputAngka },
    { id: 'total', label: D.kolom.total, values: total, editable: true, parse: parseInputAngka },
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

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var columns = kolomTabel();
  var tabelBenar = State.tabelChecked && seriesFillTableAllCorrect(columns, State.tabelInputs);
  var semuaPilah = sortItemsAllAnswered(D.pilah, State.pilahStates);

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.instruksiA) +
        '</p>' +
        '<p class="bunga-rule"><span aria-hidden="true">🏦</span> ' +
        esc(DATA.stimulasi.aturan) +
        ' Setoran awal M₀ = ' +
        esc(formatRupiah(KASUS.M0)) +
        '.</p>' +
        buildSeriesFillTable('tabelBunga', columns, State.tabelInputs, {
          checked: State.tabelChecked,
          locked: tabelBenar,
          caption: 'Buku tabungan Raka tahun 1 sampai ' + D.tabelN,
        }) +
        (tabelBenar
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Datamu lengkap.</strong> Bunga tiap tahun tetap, sedangkan total bunga dan saldo bertambah tetap setiap tahun.'
            )
          : '<div class="dl-input-row" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="tabelCheck">Periksa Tabel</button>' +
            buildHintToggle('tabelHintBtn', D.hintsTabel, State.tabelHint) +
            '</div>' +
            buildHintStack(D.hintsTabel, State.tabelHint))
    ) +
    (tabelBenar
      ? buildDlPanel(
          '<p style="margin-top:0;">' +
            esc(D.instruksiB) +
            '</p>' +
            buildSortItems(D.pilah, State.pilahOrder, D.opsiPilah, State.pilahStates)
        )
      : '') +
    (tabelBenar && semuaPilah ? buildDlNextButton('koleksiNextBtn', D.nextLabel) : '') +
    '</section>';

  bindSeriesFillTable(container, 'tabelBunga', State.tabelInputs, saveState, function () {
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
      renderKoleksi(container);
    });
  }

  var hint = document.getElementById('tabelHintBtn');
  if (hint) {
    hint.addEventListener('click', function () {
      State.tabelHint = Math.min(State.tabelHint + 1, D.hintsTabel.length);
      saveState();
      renderKoleksi(container);
    });
  }

  bindSortItems(container, D.pilah, State.pilahStates, saveState, function () {
    renderKoleksi(container);
  });

  bindNext('koleksiNextBtn', 'koleksi', 'olahBunga');
}

/* ============================================================
   8. STAGE: OLAH BUNGA  (Discovery Learning — sintaks 4)
   Total bunga = deret aritmetika dengan b = 0 → Bₙ = M₀ × i × n.
   ============================================================ */

function renderOlahBunga(container) {
  var D = DATA.olahBunga;
  var langkahSelesai = stepsDone(State.bungaSteps);
  var semuaBenar = langkahSelesai && guidedQuizAllCorrect(D.pertanyaan, State.bungaPilih);
  var bungaTahunan = [];
  for (var k = 0; k < 4; k++) bungaTahunan.push(bungaTunggal(KASUS.M0, I_TAHUN, 1));

  container.innerHTML =
    '<section aria-label="Olah Data Bunga">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.instruksi) +
        '</p>' +
        buildSequenceTiles(bungaTahunan, {
          labels: bungaTahunan.map(function (v, i) {
            return 'Bunga th ' + (i + 1);
          }),
          showDiff: true,
          more: true,
          format: fmt,
        }) +
        '<p class="dl-caption">Busur menunjukkan selisih bunga dari tahun ke tahun.</p>' +
        buildStepSeq('bs', State.bungaSteps, D.langkah)
    ) +
    (langkahSelesai
      ? buildDlPanel(
          buildGuidedQuizList(
            guidedVisible(D.pertanyaan, State.bungaPilih),
            State.bungaOrders,
            State.bungaPilih
          )
        )
      : '') +
    (semuaBenar
      ? buildDlPanel(buildFormulaBunga(), 'panel--hero') +
        buildDlNextButton('bungaNextBtn', D.nextLabel)
      : '') +
    '</section>';

  var rerender = function () {
    renderOlahBunga(container);
  };
  bindStepSeq('bs', State.bungaSteps, D.langkah, rerender);
  bindGuidedQuizList(container, D.pertanyaan, State.bungaPilih, saveState, rerender);
  bindNext('bungaNextBtn', 'olahBunga', 'olahModal');
}

/* ============================================================
   9. STAGE: OLAH NILAI AKHIR MODAL  (Discovery Learning — sintaks 4)
   Saldo = barisan aritmetika a = M₀, b = M₀ × i → Mₙ = M₀(1 + n·i).
   ============================================================ */

function renderOlahModal(container) {
  var D = DATA.olahModal;
  var langkahSelesai = stepsDone(State.modalSteps);
  var semuaBenar = langkahSelesai && guidedQuizAllCorrect(D.pertanyaan, State.modalPilih);
  var saldo = saldoRaka(D.tampilN - 1);

  container.innerHTML =
    '<section aria-label="Olah Data Nilai Akhir Modal">' +
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
          more: true,
          format: fmt,
        }) +
        '<p class="dl-caption">Mₖ = saldo akhir tahun ke-k (M₀ = setoran awal).</p>' +
        buildStepSeq('ms', State.modalSteps, D.langkah)
    ) +
    (langkahSelesai
      ? buildDlPanel(
          buildGuidedQuizList(
            guidedVisible(D.pertanyaan, State.modalPilih),
            State.modalOrders,
            State.modalPilih
          )
        )
      : '') +
    (semuaBenar
      ? buildDlPanel(
          '<div class="formula-duo">' + buildFormulaBunga() + buildFormulaModal() + '</div>',
          'panel--hero'
        ) + buildDlNextButton('modalNextBtn', D.nextLabel)
      : '') +
    '</section>';

  var rerender = function () {
    renderOlahModal(container);
  };
  bindStepSeq('ms', State.modalSteps, D.langkah, rerender);
  bindGuidedQuizList(container, D.pertanyaan, State.modalPilih, saveState, rerender);
  bindNext('modalNextBtn', 'olahModal', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A: uji pada tabel. B: buktikan dugaan awal. C: periode bulanan.
   ============================================================ */

function verifGrupSelesai(grup) {
  return DATA.verifikasi.uji.every(function (u, i) {
    return u.grup !== grup || State.verifSteps[i].done;
  });
}

/* Langkah grup berikut ditampilkan satu per satu sampai yang belum selesai. */
function buildGrupSteps(grup) {
  var html = '';
  var no = 0;
  var uji = DATA.verifikasi.uji;
  for (var i = 0; i < uji.length; i++) {
    if (uji[i].grup !== grup) continue;
    no += 1;
    html += buildDlStep('vf' + i, State.verifSteps[i], uji[i], no);
    if (!State.verifSteps[i].done) break;
  }
  return html;
}

function buildTabelUji() {
  var rows = [];
  var saldo = saldoRaka(DATA.koleksi.tabelN);
  for (var n = 1; n <= DATA.koleksi.tabelN; n++) {
    rows.push({ n: n, manual: saldo[n], rumus: KASUS.M0 * (1 + n * I_TAHUN) });
  }
  return buildSeriesCheckTable(rows, {
    format: fmt,
    manualLabel: 'Saldo di buku tabungan',
    rumusLabel: 'M₀(1 + n × i)',
    caption: 'Uji rumus nilai akhir modal pada tahun 1 sampai ' + DATA.koleksi.tabelN,
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
    '<span class="dugaan-row__title">Saldo akhir tahun ke-' +
    S.tahunDitanya +
    '</span>' +
    '<span>Dugaanmu: <strong>' +
    esc(findOptionLabel(S.opsi, State.stimulasiPilihan) || '—') +
    '</strong></span>' +
    '<span>Hasil rumus: <strong>' +
    esc(findOptionLabel(S.opsi, benarId)) +
    '</strong></span>' +
    '<span class="dugaan-row__verdict">' +
    (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh rumus') +
    '</span>' +
    '</div>' +
    '</div>'
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var selesaiA = verifGrupSelesai('A');
  var selesaiB = verifGrupSelesai('B');
  var selesaiC = verifGrupSelesai('C');

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' + esc(D.judulA) + '</h3>' + buildTabelUji() + buildGrupSteps('A')
    ) +
    (selesaiA
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            buildGrupSteps('B') +
            (selesaiB ? buildDugaanBanding() : '')
        )
      : '') +
    (selesaiA && selesaiB
      ? buildDlPanel('<h3 style="margin-top:0;">' + esc(D.judulC) + '</h3>' + buildGrupSteps('C'))
      : '') +
    (selesaiA && selesaiB && selesaiC ? buildDlNextButton('verifNextBtn', D.nextLabel) : '') +
    '</section>';

  D.uji.forEach(function (u, i) {
    bindDlStep('vf' + i, State.verifSteps[i], u, saveState, function () {
      renderVerifikasi(container);
    });
  });

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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah konsep yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Bunga Tunggal</h3>' +
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
   initExerciseArrays(). Isian dibaca parseInputAngka() sehingga
   'Rp300.000', '300000', dan '7%' sama-sama diterima.
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
  inputMode: 'decimal',
  revealButtonStyle: 'separate',
  parseInput: parseInputAngka,
  isCorrect: function (v, s) {
    return hampirSama(v, s.jawab);
  },
  invalidMessage: 'Tulis jawaban berupa bilangan, mis. 300.000, 12, atau 0,5.',
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
  var benarPilah = sortItemsCorrectCount(DATA.koleksi.pilah, State.pilahStates);
  var langkah = State.bungaSteps.concat(State.modalSteps, State.verifSteps);
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
        kartu(benarPilah + '/' + DATA.koleksi.pilah.length, 'Pernyataan dipilah benar') +
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
    buildFormulaBunga() +
    buildFormulaModal() +
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
    'Kemampuan murid menjelaskan kaitan bunga tunggal dengan barisan & deret aritmetika dengan kata-kata sendiri tetap menjadi bahan penilaian utama.' +
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
  olahBunga: renderOlahBunga,
  olahModal: renderOlahModal,
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
