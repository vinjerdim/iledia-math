'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Jumlah n Suku Pertama Deret Geometri (Sₙ)
   Fase F — SMK Rekayasa Perangkat Lunak

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, formatNumber, formatDesimal, shuffleArray, showNotice,
   buildFeedbackBox, createStageMachine, createExerciseStage,
   createStore, ensureExerciseArray, optionIds, komponen Discovery
   Learning (ensureShuffledOrder, orderByIds, buildDiscoveryHead,
   buildTeacherNote, buildChoiceGroup, buildDlPanel, buildDlStep,
   bindDlStep, ensureSortStates, buildSortItems, bindSortItems,
   buildCompareBarChart), pertanyaan penuntun (buildGuidedQuizList),
   kerja kelompok (buildRoleCards, ensureTapOrderState, buildTapOrder,
   buildInfoPoster), serta seksi 21 "Deret aritmetika & geometri":
   jumlahAritmetika, jumlahGeometri, daftarSuku, jumlahBerjalan,
   subskrip, buildSeriesFillTable, buildShiftSubtractGrid, dan
   buildSeriesCheckTable.

   Alur tahap mengikuti sintaks Problem Based Learning; lihat komentar
   kepala pada data.js untuk pemetaan dan rangkaian aktivitasnya.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI saat
   state disiapkan (initExerciseArrays), lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat-lompat
   ketika tahap dirender ulang, tetapi teracak ulang setiap Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render & Paket
    5. Stage: Orientasi         (PBL sintaks 1)
    6. Stage: Organisasi        (PBL sintaks 2)
    7. Stage: Selidik Pola      (PBL sintaks 3)
    8. Stage: Temukan Sₙ        (PBL sintaks 3)
    9. Stage: Uji Rumus         (PBL sintaks 3)
   10. Stage: Latihan           (PBL sintaks 3)
   11. Stage: Karya             (PBL sintaks 4)
   12. Stage: Evaluasi          (PBL sintaks 5)
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
  'orientasi',
  'organisasi',
  'selidikPola',
  'selidikBukti',
  'ujiRumus',
  'latih',
  'karya',
  'evaluasi',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Orientasi',
  'Organisasi',
  'Selidik Pola',
  'Temukan Sₙ',
  'Uji Rumus',
  'Latihan',
  'Karya',
  'Evaluasi',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-f-2-2-sn-geometri-pbl-v1';

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
  orientasiPemantik: '',

  /* Tahap 2 — organisasi */
  peran: {},
  infoStates: {},
  infoOrder: null,
  rencana: null,

  /* Tahap 3 — selidik pola */
  polaOrders: {},
  polaPilih: {},
  tabelInputs: { sA: [], sB: [] },
  tabelChecked: false,
  tabelHint: 0,
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 4 — temukan & buktikan Sₙ */
  buktiCoret: [],
  buktiSteps: [],
  buktiOrders: {},
  buktiPilih: {},

  /* Tahap 5 — uji rumus */
  ujiDeret: 'B',
  ujiN: 5,
  ujiSteps: [],
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 6 — latihan */
  latihIdx: 0,
  latihExercises: [],

  /* Tahap 7 — karya */
  karyaSteps: [],
  karyaN: 6,
  karyaOrders: {},
  karyaPilih: {},
  karyaPesan: '',

  /* Tahap 8 — evaluasi */
  pendapatStates: {},
  pendapatOrder: null,
  transferStep: null,

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

/* Objek kosong bila State[key] belum berupa objek. */
function ensureObject(key) {
  if (!State[key] || typeof State[key] !== 'object' || Array.isArray(State[key])) State[key] = {};
}

/* Membatasi nilai slider agar tetap di rentang yang sah. */
function clampInt(v, min, max, def) {
  return typeof v === 'number' && v >= min && v <= max ? v : def;
}

/*
 * Menyiapkan seluruh array state per-soal DAN seluruh urutan acak
 * pilihan jawaban. Dipanggil sekali saat init (setelah loadState) dan
 * setiap kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1 */
  ensureShuffledOrder(State, 'orientasiOrder', DATA.orientasi.opsi);

  /* Tahap 2 */
  ensureObject('peran');
  ensureSortStates(
    State,
    'infoStates',
    'infoOrder',
    DATA.organisasi.info,
    DATA.organisasi.infoOpsi
  );
  ensureTapOrderState(State, 'rencana', DATA.organisasi.rencana, DATA.organisasi.rencanaUrut);

  /* Tahap 3 */
  ensureObject('polaOrders');
  ensureObject('polaPilih');
  DATA.selidikPola.pertanyaan.forEach(function (q) {
    ensureShuffledOrder(State.polaOrders, q.id, q.opsi);
  });
  ensureObject('tabelInputs');
  ['sA', 'sB'].forEach(function (k) {
    if (!Array.isArray(State.tabelInputs[k])) State.tabelInputs[k] = [];
  });
  ensureSortStates(
    State,
    'pilahStates',
    'pilahOrder',
    DATA.selidikPola.pilah,
    DATA.selidikPola.pilahOpsi
  );

  /* Tahap 4 */
  var nKembar = DATA.selidikBukti.n - 1;
  if (!Array.isArray(State.buktiCoret) || State.buktiCoret.length !== nKembar) {
    State.buktiCoret = [];
    for (var i = 0; i < nKembar; i++) State.buktiCoret.push(false);
  }
  ensureExerciseArray(State, 'buktiSteps', DATA.selidikBukti.langkah, makeDlStep);
  ensureObject('buktiOrders');
  ensureObject('buktiPilih');
  DATA.selidikBukti.pertanyaan.forEach(function (q) {
    ensureShuffledOrder(State.buktiOrders, q.id, q.opsi);
  });

  /* Tahap 5 */
  if (!findDeret(State.ujiDeret)) State.ujiDeret = DATA.ujiRumus.deret[0].id;
  State.ujiN = clampInt(State.ujiN, 1, DATA.ujiRumus.maxN, 5);
  ensureExerciseArray(State, 'ujiSteps', DATA.ujiRumus.uji, makeDlStep);
  ensureShuffledOrder(State, 'bankOrder', DATA.ujiRumus.bank);
  ensureObject('simpulanPilihan');

  /* Tahap 6 — latihan (dirender createExerciseStage) */
  ensureExerciseArray(State, 'latihExercises', DATA.latih.soal, function (s) {
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
  if (State.latihIdx >= DATA.latih.soal.length || State.latihIdx < 0) State.latihIdx = 0;

  /* Tahap 7 */
  ensureExerciseArray(State, 'karyaSteps', DATA.karya.hitung, makeDlStep);
  State.karyaN = clampInt(State.karyaN, 1, DATA.karya.maxN, 6);
  ensureObject('karyaOrders');
  ensureObject('karyaPilih');
  [DATA.karya.titikBalik, DATA.karya.rekomendasi].forEach(function (q) {
    ensureShuffledOrder(State.karyaOrders, q.id, q.opsi);
  });

  /* Tahap 8 */
  ensureSortStates(
    State,
    'pendapatStates',
    'pendapatOrder',
    DATA.evaluasi.pendapat,
    DATA.evaluasi.pendapatOpsi
  );
  if (!State.transferStep || typeof State.transferStep !== 'object') {
    State.transferStep = makeDlStep();
  }

  /* Tahap 9 */
  ensureObject('refleksiAnswers');
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
   4. UTILITAS RENDER & PAKET
   ============================================================ */

/* Kepala tahap (bertanda sintaks PBL) + catatan peran guru. */
function buildHead(D) {
  return buildDiscoveryHead(D.kicker, D.goal, D.syntax) + buildTeacherNote(D.guru);
}

/* Judul bagian + instruksi di dalam panel. */
function buildPartHead(judul, instruksi) {
  return (
    '<h3 style="margin-top:0;">' +
    esc(judul) +
    '</h3>' +
    (instruksi ? '<p class="exercise-label">' + esc(instruksi) + '</p>' : '')
  );
}

function fmt(n) {
  return formatNumber(n, '−');
}

function rupiah(n) {
  return 'Rp' + fmt(n);
}

/* Nilai jutaan ringkas untuk sumbu grafik, mis. 12.600.000 → "12,6 jt". */
function juta(v) {
  return formatDesimal(v / 1000000, 1) + ' jt';
}

/* Suku ke-n dan jumlah n suku pertama bayaran satu paket. */
function sukuPaket(p, n) {
  return p.r ? sukuGeometri(p.a, p.r, n) : sukuAritmetika(p.a, p.b, n);
}

function jumlahPaket(p, n) {
  return p.r ? jumlahGeometri(p.a, p.r, n) : jumlahAritmetika(p.a, p.b, n);
}

function daftarPaket(p, n) {
  return p.r ? daftarSuku('geometri', p.a, p.r, n) : daftarSuku('aritmetika', p.a, p.b, n);
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

/* Kartu dua skema bayaran (orientasi & karya). */
function buildPaketCards() {
  var A = DATA.paket.A;
  var B = DATA.paket.B;
  function kartu(p, cls, aturan) {
    return (
      '<div class="paket-card ' +
      cls +
      '">' +
      '<span class="paket-card__icon" aria-hidden="true">' +
      p.ikon +
      '</span>' +
      '<p class="paket-card__name">' +
      esc(p.nama) +
      '</p>' +
      '<p class="paket-card__rule">' +
      aturan +
      '</p>' +
      '</div>'
    );
  }
  return (
    '<div class="paket-grid">' +
    kartu(
      A,
      'paket-card--a',
      'Bulan 1: <strong>' +
        rupiah(A.a) +
        '</strong><br>lalu <strong>naik ' +
        rupiah(A.b) +
        '</strong> setiap bulan'
    ) +
    kartu(
      B,
      'paket-card--b',
      'Bulan 1: <strong>' +
        rupiah(B.a) +
        '</strong><br>lalu <strong>dua kali lipat</strong> setiap bulan'
    ) +
    '</div>'
  );
}

/*
 * Daftar pertanyaan penuntun yang ditampilkan bertahap: pertanyaan
 * berikutnya baru muncul setelah pertanyaan sebelumnya dijawab benar.
 */
function visibleGuided(list, pilih) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    out.push(list[i]);
    if (pilih[list[i].id] !== list[i].correct) break;
  }
  return out;
}

/* Langkah isian bertahap: tampil satu per satu sampai yang belum selesai. */
function buildStepsSeq(prefix, steps, states) {
  var html = '';
  for (var i = 0; i < steps.length; i++) {
    html += buildDlStep(prefix + i, states[i], steps[i], i + 1);
    if (!states[i].done) break;
  }
  return html;
}

function bindStepsSeq(prefix, steps, states, rerender) {
  steps.forEach(function (step, i) {
    bindDlStep(prefix + i, states[i], step, saveState, rerender);
  });
}

function stepsAllDone(states) {
  return states.every(function (s) {
    return s.done;
  });
}

/* Kartu rumus Sₙ geometri (dua bentuk). */
function buildRumusGeometri() {
  return (
    '<div class="formula-duo">' +
    '<div class="formula-card"><span class="formula-card__label">Untuk r &gt; 1</span>Sₙ = a(rⁿ − 1) / (r − 1)</div>' +
    '<div class="formula-card"><span class="formula-card__label">Untuk 0 &lt; r &lt; 1</span>Sₙ = a(1 − rⁿ) / (1 − r)</div>' +
    '</div>'
  );
}

/* ============================================================
   5. STAGE: ORIENTASI  (PBL — sintaks 1)
   Murid memahami masalah dan MENDUGA. Tidak ada penilaian.
   ============================================================ */

function buildTabelAwal(n) {
  var A = DATA.paket.A;
  var B = DATA.paket.B;
  return buildSeriesFillTable(
    'tabelAwal',
    [
      { id: 'uA', label: 'Bayaran Paket A (Rp)', values: daftarPaket(A, n) },
      { id: 'uB', label: 'Bayaran Paket B (Rp)', values: daftarPaket(B, n) },
    ],
    {},
    { caption: 'Bayaran bulan pertama sampai ke-' + n + ' kedua paket; n = bulan ke-' }
  );
}

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var terisi = !!State.orientasiPilihan;

  container.innerHTML =
    '<section aria-label="Orientasi Masalah">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">💼 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        buildPaketCards() +
        '<p class="dl-caption">Bayaran ' +
        D.tabelBulan +
        ' bulan pertama (n = bulan ke-):</p>' +
        buildTabelAwal(D.tabelBulan),
      'panel--hero'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.orientasiOrder, { chosen: State.orientasiPilihan }) +
        '<div class="field-group" style="margin-top:var(--space-5);">' +
        '<label for="orientasiAlasan">' +
        esc(D.alasanLabel) +
        '</label>' +
        '<textarea id="orientasiAlasan" class="input-textarea" placeholder="' +
        esc(D.alasanPlaceholder) +
        '">' +
        esc(State.orientasiAlasan) +
        '</textarea>' +
        '</div>' +
        '<div class="field-group">' +
        '<label for="orientasiPemantik">' +
        esc(D.pemantikLabel) +
        '</label>' +
        '<textarea id="orientasiPemantik" class="input-textarea" placeholder="' +
        esc(D.pemantikPlaceholder) +
        '">' +
        esc(State.orientasiPemantik) +
        '</textarea>' +
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

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.orientasiPilihan = btn.dataset.optId;
      saveState();
      renderOrientasi(container);
    });
  });

  [
    ['orientasiAlasan', 'orientasiAlasan'],
    ['orientasiPemantik', 'orientasiPemantik'],
  ].forEach(function (pair) {
    var ta = document.getElementById(pair[0]);
    ta.addEventListener('input', function () {
      State[pair[1]] = ta.value;
      saveState();
    });
  });

  document.getElementById('orientasiNextBtn').addEventListener('click', function () {
    if (!State.orientasiPilihan) {
      showNotice('Pilih dugaanmu sebelum melanjutkan.');
      return;
    }
    if (!State.orientasiPemantik.trim()) {
      showNotice('Tulis dulu apa yang perlu kalian ketahui atau hitung.');
      return;
    }
    completeStage('orientasi');
    navigateTo('organisasi');
  });
}

/* ============================================================
   6. STAGE: ORGANISASI  (PBL — sintaks 2)
   A: peran kelompok. B: pilah informasi. C: urutan rencana.
   ============================================================ */

function renderOrganisasi(container) {
  var D = DATA.organisasi;
  var infoSelesai = sortItemsAllAnswered(D.info, State.infoStates);
  var rencanaOk = State.rencana.correct;

  function rerender() {
    renderOrganisasi(container);
  }

  container.innerHTML =
    '<section aria-label="Organisasi Belajar">' +
    buildHead(D) +
    buildDlPanel(
      buildPartHead(D.judulPeran, D.instruksiPeran) + buildRoleCards(D.peran, State.peran)
    ) +
    buildDlPanel(
      buildPartHead(D.judulInfo, D.instruksiInfo) +
        buildSortItems(D.info, State.infoOrder, D.infoOpsi, State.infoStates)
    ) +
    (infoSelesai
      ? buildDlPanel(
          buildPartHead(D.judulRencana, D.instruksiRencana) +
            buildTapOrder('rencanaOrder', D.rencana, State.rencana, {
              answer: D.rencanaUrut,
              startLabel: 'Langkah pertama',
              endLabel: 'Langkah terakhir',
              successText: D.rencanaSukses,
            })
        )
      : '') +
    (infoSelesai && rencanaOk ? buildDlNextButton('organisasiNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-role-id]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      State.peran[inp.dataset.roleId] = inp.value;
      saveState();
    });
  });

  bindSortItems(container, D.info, State.infoStates, saveState, rerender);
  bindTapOrder(container, 'rencanaOrder', State.rencana, D.rencanaUrut, saveState, rerender);
  bindNext('organisasiNextBtn', 'organisasi', 'selidikPola');
}

/* ============================================================
   7. STAGE: SELIDIK POLA  (PBL — sintaks 3)
   A: jenis deret tiap paket. B: tabel Sₙ. C: pilah pernyataan.
   ============================================================ */

function kolomTabelPola() {
  var n = DATA.selidikPola.tabelN;
  var A = DATA.paket.A;
  var B = DATA.paket.B;
  return [
    { id: 'uA', label: 'Uₙ Paket A', values: daftarPaket(A, n) },
    { id: 'sA', label: 'Sₙ Paket A', values: jumlahBerjalan(daftarPaket(A, n)), editable: true },
    { id: 'uB', label: 'Uₙ Paket B', values: daftarPaket(B, n) },
    { id: 'sB', label: 'Sₙ Paket B', values: jumlahBerjalan(daftarPaket(B, n)), editable: true },
  ];
}

function renderSelidikPola(container) {
  var D = DATA.selidikPola;
  var polaOk = guidedQuizAllCorrect(D.pertanyaan, State.polaPilih);
  var kolom = kolomTabelPola();
  var tabelOk = State.tabelChecked && seriesFillTableAllCorrect(kolom, State.tabelInputs);
  var pilahSelesai = sortItemsAllAnswered(D.pilah, State.pilahStates);

  function rerender() {
    renderSelidikPola(container);
  }

  var tampilPola = visibleGuided(D.pertanyaan, State.polaPilih);

  container.innerHTML =
    '<section aria-label="Selidiki Pola">' +
    buildHead(D) +
    buildDlPanel(
      buildPartHead(D.judulPola) +
        buildPaketCards() +
        buildGuidedQuizList(tampilPola, State.polaOrders, State.polaPilih)
    ) +
    (polaOk
      ? buildDlPanel(
          buildPartHead(D.judulTabel, D.instruksiTabel) +
            buildSeriesFillTable('tabelPola', kolom, State.tabelInputs, {
              checked: State.tabelChecked,
              locked: tabelOk,
              caption: 'Tabel bayaran bulanan dan total bayaran kedua paket',
            }) +
            (tabelOk
              ? buildFeedbackBox(
                  'success',
                  '✓',
                  '<strong>Datamu lengkap.</strong> Total Paket A masih unggul sampai bulan ke-5, tetapi Sₙ Paket B tumbuh makin cepat.'
                )
              : '<div class="dl-input-row" style="margin-top:var(--space-4);">' +
                '<button type="button" class="btn btn--primary" id="tabelCheck">Periksa Tabel</button>' +
                buildHintToggle('tabelHintBtn', D.hintsTabel, State.tabelHint) +
                '</div>' +
                buildHintStack(D.hintsTabel, State.tabelHint))
        )
      : '') +
    (tabelOk
      ? buildDlPanel(
          buildPartHead(D.judulPilah, D.instruksiPilah) +
            buildSortItems(D.pilah, State.pilahOrder, D.pilahOpsi, State.pilahStates)
        )
      : '') +
    (tabelOk && pilahSelesai ? buildDlNextButton('polaNextBtn', D.nextLabel) : '') +
    '</section>';

  bindGuidedQuizList(container, D.pertanyaan, State.polaPilih, saveState, rerender);

  var check = document.getElementById('tabelCheck');
  bindSeriesFillTable(container, 'tabelPola', State.tabelInputs, saveState, function () {
    if (check) check.click();
  });
  if (check) {
    check.addEventListener('click', function () {
      var kosong = ['sA', 'sB'].some(function (k) {
        for (var i = 0; i < D.tabelN; i++) {
          if (!String(State.tabelInputs[k][i] || '').trim()) return true;
        }
        return false;
      });
      if (kosong) {
        showNotice('Lengkapi semua sel Sₙ terlebih dahulu.');
        return;
      }
      State.tabelChecked = true;
      saveState();
      if (!seriesFillTableAllCorrect(kolom, State.tabelInputs)) {
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

  bindSortItems(container, D.pilah, State.pilahStates, saveState, rerender);
  bindNext('polaNextBtn', 'selidikPola', 'selidikBukti');
}

/* ============================================================
   8. STAGE: TEMUKAN & BUKTIKAN Sₙ  (PBL — sintaks 3)
   A: grid "kalikan r, geser, kurangkan" pada S₅ Paket B.
   B: pertanyaan penuntun untuk deret geometri umum.
   ============================================================ */

function renderSelidikBukti(container) {
  var D = DATA.selidikBukti;
  var terms = daftarSuku('geometri', D.a, D.r, D.n);
  var semuaCoret = shiftGridAllStruck(State.buktiCoret);
  var langkahOk = stepsAllDone(State.buktiSteps);
  var umumOk = guidedQuizAllCorrect(D.pertanyaan, State.buktiPilih);

  function rerender() {
    renderSelidikBukti(container);
  }

  container.innerHTML =
    '<section aria-label="Temukan dan Buktikan Rumus Sₙ">' +
    buildHead(D) +
    buildDlPanel(
      buildPartHead(D.judulA, D.instruksiA) +
        '<p class="dl-caption">' +
        esc(D.satuan) +
        '</p>' +
        buildShiftSubtractGrid('buktiGrid', terms, D.r, State.buktiCoret, {
          label: 'S' + subskrip(D.n),
        }) +
        (semuaCoret
          ? buildStepsSeq('bk', D.langkah, State.buktiSteps)
          : '<p class="dl-caption">Ketuk kotak bergaris putus-putus untuk mencoret pasangan kembar.</p>')
    ) +
    (langkahOk
      ? buildDlPanel(
          buildPartHead(D.judulB, D.instruksiB) +
            '<div class="formula-card formula-card--plain">Sₙ = a + ar + ar² + … + arⁿ⁻¹</div>' +
            buildGuidedQuizList(
              visibleGuided(D.pertanyaan, State.buktiPilih),
              State.buktiOrders,
              State.buktiPilih
            )
        )
      : '') +
    (umumOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🎉 Rumus yang kamu temukan dan buktikan</h3>' +
            buildRumusGeometri() +
            '<p class="dl-caption" style="margin-bottom:0;">Syarat r ≠ 1. Jika r = 1, Sₙ = n × a.</p>',
          'panel--hero'
        ) + buildDlNextButton('buktiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindShiftSubtractGrid(container, 'buktiGrid', State.buktiCoret, saveState, function () {
    if (shiftGridAllStruck(State.buktiCoret)) {
      showNotice('Semua pasangan kembar tercoret! Suku apa saja yang tersisa?');
    }
    rerender();
  });
  if (semuaCoret) bindStepsSeq('bk', D.langkah, State.buktiSteps, rerender);
  bindGuidedQuizList(container, D.pertanyaan, State.buktiPilih, saveState, rerender);
  bindNext('buktiNextBtn', 'selidikBukti', 'ujiRumus');
}

/* ============================================================
   9. STAGE: UJI RUMUS  (PBL — sintaks 3)
   A: tabel jumlah manual vs rumus (slider n). B: langkah uji.
   C: kesimpulan dari bank kalimat teracak.
   ============================================================ */

function findDeret(id) {
  var list = DATA.ujiRumus.deret;
  for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
  return null;
}

/* Bilangan bulat dengan pemisah ribuan, selain itu desimal berkoma. */
function angka(v) {
  return hampirSama(v, Math.round(v)) ? fmt(v) : formatDesimal(v, 4);
}

function buildUjiTabel(n) {
  var d = findDeret(State.ujiDeret);
  var r = formatRatio(d.r);
  var manual = jumlahBerjalan(daftarSuku('geometri', d.a, d.r, n));
  var rows = manual.map(function (m, i) {
    return { n: i + 1, manual: m, rumus: jumlahGeometri(d.a, d.r, i + 1) };
  });
  var rumus =
    d.r > 1
      ? fmt(d.a) + '(' + r + '<sup>' + n + '</sup> − 1) / (' + r + ' − 1)'
      : fmt(d.a) + '(1 − (' + r + ')<sup>' + n + '</sup>) / (1 − ' + r + ')';
  return (
    '<p class="uji-readout">S' +
    subskrip(n) +
    ' = ' +
    rumus +
    ' = <strong>' +
    esc(angka(jumlahGeometri(d.a, d.r, n))) +
    '</strong></p>' +
    buildSeriesCheckTable(rows, {
      format: angka,
      caption: 'Perbandingan jumlah manual dan hasil rumus untuk n = 1 sampai ' + n,
    })
  );
}

function simpulanSemuaBenar() {
  return DATA.ujiRumus.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function buildSimpulanItems() {
  var D = DATA.ujiRumus;
  var bank = orderByIds(D.bank, State.bankOrder);
  var benarSemua = simpulanSemuaBenar();
  var diperiksa = State.simpulanChecked;
  return D.kalimat
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
}

function renderUjiRumus(container) {
  var D = DATA.ujiRumus;
  var ujiOk = stepsAllDone(State.ujiSteps);
  var benarSemua = simpulanSemuaBenar();

  function rerender() {
    renderUjiRumus(container);
  }

  var pilihDeret =
    '<div class="btn-group deret-toggle" role="group" aria-label="Pilih deret">' +
    D.deret
      .map(function (d) {
        var aktif = d.id === State.ujiDeret;
        return (
          '<button type="button" class="btn btn--small ' +
          (aktif ? 'btn--primary' : 'btn--ghost') +
          '" data-deret="' +
          esc(d.id) +
          '" aria-pressed="' +
          aktif +
          '">' +
          esc(d.label) +
          '</button>'
        );
      })
      .join('') +
    '</div>';

  container.innerHTML =
    '<section aria-label="Uji Rumus">' +
    buildHead(D) +
    buildDlPanel(
      buildPartHead(D.judulA, D.instruksiA) +
        pilihDeret +
        '<div class="range-row">' +
        '<label for="ujiSlider">Banyak suku: <strong id="ujiSliderVal">n = ' +
        State.ujiN +
        '</strong></label>' +
        '<input type="range" id="ujiSlider" min="1" max="' +
        D.maxN +
        '" step="1" value="' +
        State.ujiN +
        '">' +
        '</div>' +
        '<div id="ujiSliderVisual">' +
        buildUjiTabel(State.ujiN) +
        '</div>'
    ) +
    buildDlPanel(buildPartHead(D.judulB) + buildStepsSeq('uj', D.uji, State.ujiSteps)) +
    (ujiOk
      ? buildDlPanel(
          buildPartHead(D.judulC, D.instruksiC) +
            buildSimpulanItems() +
            (benarSemua
              ? buildFeedbackBox(
                  'success',
                  '✓',
                  '<strong>Kesimpulanmu lengkap dan tepat.</strong> Rumus ini sekarang siap dipakai untuk menjawab masalah Nadia.'
                )
              : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
                '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
                '</div>')
        )
      : '') +
    (ujiOk && benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Jumlah n Suku Pertama</h3>' +
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
        ) + buildDlNextButton('ujiNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  container.querySelectorAll('[data-deret]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.ujiDeret = btn.dataset.deret;
      saveState();
      rerender();
    });
  });

  var slider = document.getElementById('ujiSlider');
  slider.addEventListener('input', function () {
    State.ujiN = +slider.value;
    saveState();
    document.getElementById('ujiSliderVal').textContent = 'n = ' + State.ujiN;
    document.getElementById('ujiSliderVisual').innerHTML = buildUjiTabel(State.ujiN);
  });

  bindStepsSeq('uj', D.uji, State.ujiSteps, rerender);

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
      rerender();
    });
  }

  bindNext('ujiNextBtn', 'ujiRumus', 'latih');
}

/* ============================================================
   10. STAGE: LATIHAN MASALAH KONTEKSTUAL  (PBL — sintaks 3)
   createExerciseStage (shared/engine.js): campuran soal 'input'
   dan 'choice'; urutan opsi dari ex.optionOrder yang diacak di
   initExerciseArrays().
   ============================================================ */

var LatihStage = createExerciseStage({
  soal: DATA.latih.soal,
  getExercises: function () {
    return State.latihExercises;
  },
  getIndex: function () {
    return State.latihIdx;
  },
  setIndex: function (i) {
    State.latihIdx = i;
  },
  save: saveState,
  idPrefix: 'lt',
  sectionLabel: 'Latihan Masalah',
  kicker: DATA.latih.kicker,
  goal: DATA.latih.goal,
  instruction: DATA.latih.instruksi,
  buildHead: function () {
    return buildHead(DATA.latih);
  },
  nextStageId: 'karya',
  completeStageId: 'latih',
  nextButtonLabel: DATA.latih.nextLabel,
  defaultType: 'input',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  inputRowClass: 'dl-input-row',
  inputAriaLabel: 'Jawabanmu',
  inputPlaceholder: 'Jawabanmu',
  stripPunctuation: true,
  revealButtonStyle: 'separate',
  invalidMessage: 'Tulis jawaban berupa bilangan bulat, mis. 1364 atau 570.000.',
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

function renderLatih(container) {
  LatihStage.render(container);
}

/* ============================================================
   11. STAGE: KARYA  (PBL — sintaks 4)
   A: hitung S₆ & S₈ kedua paket. B: grafik & titik balik.
   C: rekomendasi + pesan → poster untuk dipresentasikan.
   ============================================================ */

function buildKaryaGrafik(n) {
  var A = DATA.paket.A;
  var B = DATA.paket.B;
  var sA = jumlahPaket(A, n);
  var sB = jumlahPaket(B, n);
  var unggul = sA > sB ? 'Paket A' : sB > sA ? 'Paket B' : 'Sama besar';
  var seriesA = [];
  var seriesB = [];
  for (var k = 1; k <= n; k++) {
    seriesA.push(jumlahPaket(A, k));
    seriesB.push(jumlahPaket(B, k));
  }
  return (
    buildCompareBarChart(
      [
        { label: 'Total Paket A (Sₙ)', values: seriesA },
        { label: 'Total Paket B (Sₙ)', values: seriesB },
      ],
      {
        format: juta,
        xLabel: function (i) {
          return String(i + 1);
        },
        highlight: n - 1,
        caption: 'Grafik total bayaran Paket A dan Paket B dari bulan 1 sampai ' + n,
      }
    ) +
    '<p class="uji-readout">Kontrak ' +
    n +
    ' bulan: S' +
    subskrip(n) +
    ' Paket A = ' +
    rupiah(sA) +
    ', Paket B = ' +
    rupiah(sB) +
    ' → <strong>' +
    unggul +
    (sA !== sB ? ' unggul' : '') +
    '</strong></p>'
  );
}

function buildPoster() {
  var K = DATA.karya;
  var A = DATA.paket.A;
  var B = DATA.paket.B;
  var titikOk = State.karyaPilih.titik === K.titikBalik.correct;
  var rekomOk = State.karyaPilih.rekom === K.rekomendasi.correct;
  return buildInfoPoster({
    judul: K.posterJudul,
    ikon: '📋',
    rows: [
      {
        ikon: '6️⃣',
        label: 'Kontrak 6 bulan',
        nilai: 'A ' + rupiah(jumlahPaket(A, 6)) + ' vs B ' + rupiah(jumlahPaket(B, 6)),
      },
      {
        ikon: '8️⃣',
        label: 'Kontrak 8 bulan',
        nilai: 'A ' + rupiah(jumlahPaket(A, 8)) + ' vs B ' + rupiah(jumlahPaket(B, 8)),
      },
      {
        ikon: '🔀',
        label: 'Titik balik',
        nilai: titikOk ? 'Paket B unggul mulai ' + K.titikBalikN + ' bulan' : '—',
      },
      {
        ikon: '✅',
        label: 'Saran',
        nilai: rekomOk ? esc(findOptionLabel(K.rekomendasi.opsi, K.rekomendasi.correct)) : '—',
      },
    ],
    pesan: State.karyaPesan.trim(),
    footer: K.posterFooter,
  });
}

function renderKarya(container) {
  var K = DATA.karya;
  var hitungOk = stepsAllDone(State.karyaSteps);
  var titikOk = State.karyaPilih.titik === K.titikBalik.correct;
  var rekomOk = State.karyaPilih.rekom === K.rekomendasi.correct;
  var tanya = [K.titikBalik, K.rekomendasi];

  function rerender() {
    renderKarya(container);
  }

  container.innerHTML =
    '<section aria-label="Sajikan Hasil Karya">' +
    buildHead(K) +
    buildDlPanel(
      buildPartHead(K.judulA) + buildPaketCards() + buildStepsSeq('ky', K.hitung, State.karyaSteps)
    ) +
    (hitungOk
      ? buildDlPanel(
          buildPartHead(K.judulB, K.instruksiB) +
            '<div class="range-row">' +
            '<label for="karyaSlider">Lama kontrak: <strong id="karyaSliderVal">' +
            State.karyaN +
            ' bulan</strong></label>' +
            '<input type="range" id="karyaSlider" min="1" max="' +
            K.maxN +
            '" step="1" value="' +
            State.karyaN +
            '">' +
            '</div>' +
            '<div id="karyaSliderVisual">' +
            buildKaryaGrafik(State.karyaN) +
            '</div>' +
            buildGuidedQuizList([K.titikBalik], State.karyaOrders, State.karyaPilih)
        )
      : '') +
    (titikOk
      ? buildDlPanel(
          buildPartHead(K.judulC) +
            buildGuidedQuizList([K.rekomendasi], State.karyaOrders, State.karyaPilih) +
            (rekomOk
              ? '<div class="field-group" style="margin-top:var(--space-5);">' +
                '<label for="karyaPesan">' +
                esc(K.pesanLabel) +
                '</label>' +
                '<textarea id="karyaPesan" class="input-textarea" maxlength="240" placeholder="' +
                esc(K.pesanPlaceholder) +
                '">' +
                esc(State.karyaPesan) +
                '</textarea>' +
                '</div>' +
                '<div id="karyaPoster">' +
                buildPoster() +
                '</div>'
              : '')
        )
      : '') +
    (rekomOk ? buildDlNextButton('karyaNextBtn', K.nextLabel, true) : '') +
    '</section>';

  bindStepsSeq('ky', K.hitung, State.karyaSteps, rerender);

  var slider = document.getElementById('karyaSlider');
  if (slider) {
    slider.addEventListener('input', function () {
      State.karyaN = +slider.value;
      saveState();
      document.getElementById('karyaSliderVal').textContent = State.karyaN + ' bulan';
      document.getElementById('karyaSliderVisual').innerHTML = buildKaryaGrafik(State.karyaN);
    });
  }

  bindGuidedQuizList(container, tanya, State.karyaPilih, saveState, rerender);

  var pesan = document.getElementById('karyaPesan');
  if (pesan) {
    pesan.addEventListener('input', function () {
      State.karyaPesan = pesan.value;
      saveState();
      document.getElementById('karyaPoster').innerHTML = buildPoster();
    });
  }

  var next = document.getElementById('karyaNextBtn');
  if (next) {
    next.addEventListener('click', function () {
      if (!State.karyaPesan.trim()) {
        showNotice('Tulis pesan kelompokmu untuk Nadia sebelum melanjutkan.');
        return;
      }
      completeStage('karya');
      navigateTo('evaluasi');
    });
  }
}

/* ============================================================
   12. STAGE: EVALUASI  (PBL — sintaks 5)
   A: nilai pendapat teman. B: dugaan vs hasil. C: masalah baru.
   ============================================================ */

function buildDugaanBanding() {
  var O = DATA.orientasi;
  var cocok = State.orientasiPilihan === O.dugaanBenar;
  var A = DATA.paket.A;
  var B = DATA.paket.B;
  return (
    '<div class="dugaan-compare">' +
    '<div class="dugaan-row' +
    (cocok ? ' dugaan-row--ok' : '') +
    '">' +
    '<span class="dugaan-row__title">Paket lebih untung untuk kontrak ' +
    O.dugaanN +
    ' bulan</span>' +
    '<span>Dugaanmu: <strong>' +
    esc(findOptionLabel(O.opsi, State.orientasiPilihan) || '—') +
    '</strong></span>' +
    '<span>Hasil rumus: <strong>' +
    esc(findOptionLabel(O.opsi, O.dugaanBenar)) +
    '</strong> (' +
    rupiah(jumlahPaket(B, O.dugaanN)) +
    ' vs ' +
    rupiah(jumlahPaket(A, O.dugaanN)) +
    ')</span>' +
    '<span class="dugaan-row__verdict">' +
    (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh perhitungan') +
    '</span>' +
    '</div>' +
    '</div>'
  );
}

function renderEvaluasi(container) {
  var V = DATA.evaluasi;
  var pendapatSelesai = sortItemsAllAnswered(V.pendapat, State.pendapatStates);
  var transferOk = State.transferStep.done;

  function rerender() {
    renderEvaluasi(container);
  }

  container.innerHTML =
    '<section aria-label="Evaluasi Proses">' +
    buildHead(V) +
    buildDlPanel(
      buildPartHead(V.judulA, V.instruksiA) +
        buildSortItems(V.pendapat, State.pendapatOrder, V.pendapatOpsi, State.pendapatStates)
    ) +
    (pendapatSelesai
      ? buildDlPanel(buildPartHead(V.judulB) + buildDugaanBanding()) +
        buildDlPanel(buildPartHead(V.judulC) + buildDlStep('tf', State.transferStep, V.transfer))
      : '') +
    (pendapatSelesai && transferOk ? buildDlNextButton('evaluasiNextBtn', V.nextLabel) : '') +
    '</section>';

  bindSortItems(container, V.pendapat, State.pendapatStates, saveState, rerender);
  if (pendapatSelesai) bindDlStep('tf', State.transferStep, V.transfer, saveState, rerender);
  bindNext('evaluasiNextBtn', 'evaluasi', 'refleksi');
}

/* ============================================================
   13. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var pilahBenar =
    sortItemsCorrectCount(DATA.selidikPola.pilah, State.pilahStates) +
    sortItemsCorrectCount(DATA.evaluasi.pendapat, State.pendapatStates);
  var pilahTotal = DATA.selidikPola.pilah.length + DATA.evaluasi.pendapat.length;
  var langkah = State.buktiSteps.concat(State.ujiSteps, State.karyaSteps, [State.transferStep]);
  var sekaliCoba = langkah.filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  var benarLatih = State.latihExercises.filter(function (e) {
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
        kartu(pilahBenar + '/' + pilahTotal, 'Pernyataan & pendapat dinilai tepat') +
        kartu(sekaliCoba + '/' + langkah.length, 'Perhitungan benar sekali coba') +
        kartu(benarLatih + '/' + DATA.latih.soal.length, 'Masalah latihan benar') +
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
    buildRumusGeometri() +
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
    'Presentasi poster kelompok dan penjelasan murid tentang bukti r·Sₙ − Sₙ tetap menjadi bahan penilaian utama.' +
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
  organisasi: renderOrganisasi,
  selidikPola: renderSelidikPola,
  selidikBukti: renderSelidikBukti,
  ujiRumus: renderUjiRumus,
  latih: renderLatih,
  karya: renderKarya,
  evaluasi: renderEvaluasi,
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
