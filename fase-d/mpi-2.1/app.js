'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Penjumlahan & Pengurangan Bilangan Bulat
   Fase D — SMP Kelas 7

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, parseInputInt, shuffleArray, showNotice, buildFeedbackBox,
   createStageMachine, createExerciseStage, createStore,
   ensureExerciseArray, optionIds, komponen Discovery Learning
   (ensureShuffledOrder, orderByIds, buildDiscoveryHead,
   buildTeacherNote, buildChoiceGroup, buildDlPanel,
   buildDlNextButton, makeDlStep, buildDlStep, bindDlStep,
   ensureSortStates, bindSortItems, sortItemsAllAnswered,
   sortItemsCorrectCount), garis bilangan (buildNumberLinePlacement,
   bindNumberLinePlacement, numberLinePlacementDone,
   numberLinePlacementFirstTry, centerNumberLines), termometer
   (buildThermometer), serta komponen operasi bilangan bulat
   (fmtBulat, fmtOperasiBulat, integerJumps, arahLompatan,
   buildNumberLineJumps, buildIntegerOpSimulator,
   bindIntegerOpSimulator).

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
    8. Stage: Olah Penjumlahan     (DL sintaks 4)
    9. Stage: Olah Pengurangan     (DL sintaks 4)
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
  'olahJumlah',
  'olahKurang',
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
  'Olah (+)',
  'Olah (−)',
  'Bukti',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-2-1-bulat-operasi-v1';

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
  tempatOrder: null,
  tempatState: null,
  sim: { a: -3, op: '+', b: 5 },
  percobaanInputs: [],
  percobaanChecked: false,

  /* Tahap 4 — olah penjumlahan */
  arahStates: {},
  arahOrder: null,
  jumlahSteps: [],
  polaOrder: null,
  polaPilihan: null,

  /* Tahap 5 — olah pengurangan */
  kurangSteps: [],
  setaraOrder: null,
  setaraPilihan: null,
  cocokOrders: {},
  cocokPilih: {},
  hitungSteps: [],

  /* Tahap 6 — pembuktian */
  verifSteps: [],
  verifExercises: [],

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

/* Baris pola pengurangan yang harus diisi murid (bukan contoh). */
function polaIsian() {
  return DATA.olahKurang.pola.filter(function (p) {
    return !p.tampil;
  });
}

/*
 * Menyiapkan seluruh state per-soal DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'stimulasiOrder', DATA.stimulasi.opsi);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  ensureShuffledOrder(State, 'tempatOrder', DATA.koleksi.tempatkan);
  ensureNumberLinePlacementState(State, 'tempatState');
  var s = State.sim;
  if (!s || typeof s.a !== 'number' || typeof s.b !== 'number' || (s.op !== '+' && s.op !== '-')) {
    State.sim = JSON.parse(JSON.stringify(DATA.koleksi.simAwal));
  }
  if (
    !Array.isArray(State.percobaanInputs) ||
    State.percobaanInputs.length !== DATA.koleksi.percobaan.length
  ) {
    State.percobaanInputs = DATA.koleksi.percobaan.map(function () {
      return '';
    });
  }

  /* Tahap 4 */
  ensureSortStates(
    State,
    'arahStates',
    'arahOrder',
    DATA.olahJumlah.kasus,
    DATA.olahJumlah.opsiArah
  );
  ensureExerciseArray(State, 'jumlahSteps', DATA.olahJumlah.kasus, makeDlStep);
  ensureShuffledOrder(State, 'polaOrder', DATA.olahJumlah.polaOpsi);

  /* Tahap 5 */
  ensureExerciseArray(State, 'kurangSteps', polaIsian(), makeDlStep);
  ensureShuffledOrder(State, 'setaraOrder', DATA.olahKurang.setaraOpsi);
  if (!State.cocokOrders || typeof State.cocokOrders !== 'object') State.cocokOrders = {};
  if (!State.cocokPilih || typeof State.cocokPilih !== 'object') State.cocokPilih = {};
  DATA.olahKurang.cocok.forEach(function (c) {
    ensureShuffledOrder(State.cocokOrders, c.id, c.options);
  });
  ensureExerciseArray(State, 'hitungSteps', DATA.olahKurang.hitung, makeDlStep);

  /* Tahap 6 */
  ensureExerciseArray(State, 'verifSteps', [DATA.verifikasi.uji], makeDlStep);
  ensureExerciseArray(State, 'verifExercises', DATA.verifikasi.soal, function (q) {
    return { chosen: null, correct: false, optionOrder: shuffleArray(optionIds(q.options)) };
  });

  /* Tahap 7 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);
  if (!State.simpulanPilihan || typeof State.simpulanPilihan !== 'object') {
    State.simpulanPilihan = {};
  }

  /* Tahap 8 — uji terap (dirender createExerciseStage) */
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

  /* Tahap 9 */
  ensureShuffledOrder(State, 'refleksiDiriOrder', DATA.refleksi.diriOpsi);
  if (!State.refleksiAnswers || typeof State.refleksiAnswers !== 'object') {
    State.refleksiAnswers = {};
  }
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

/* Kotak umpan balik pilihan (benar → success, salah → warning). */
function buildChoiceFeedback(chosen, benar, umpan) {
  if (!chosen) return '';
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(benar ? 'success' : 'warning', benar ? '✓' : '💭', umpan[chosen]) +
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

/* Garis lompatan untuk operasi a op b. */
function buildOpLine(id, a, op, b, showEnd) {
  var r = integerJumps(a, op, b);
  return buildNumberLineJumps(id, {
    min: DATA.garis.min,
    max: DATA.garis.max,
    start: a,
    jumps: [{ by: r.by }],
    showEnd: showEnd,
  });
}

/* Ekspresi operasi besar (monospace). */
function buildExpr(teks) {
  return '<p class="op-expr">' + esc(teks) + '</p>';
}

/* Merender ulang tahap aktif (dipakai callback komponen). */
function rerender() {
  renderCurrentStage();
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
      '<h2 style="margin-top:0;">🏔️ ' +
        esc(D.judul) +
        '</h2>' +
        '<div class="stimulasi-grid">' +
        '<p class="stimulasi-cerita">' +
        esc(D.cerita) +
        '</p>' +
        '<div class="stimulasi-thermo">' +
        buildThermometer(D.suhuAwal, { min: -10, max: 10, step: 2, caption: D.captionAwal }) +
        '<div class="suhu-tanya" aria-label="Suhu pukul 11.00 belum diketahui">' +
        '<span class="suhu-tanya__naik">naik 5 °C ↑</span>' +
        '<span class="suhu-tanya__val">? °C</span>' +
        '<span class="suhu-tanya__cap">Pukul 11.00</span>' +
        '</div>' +
        '</div>' +
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
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.teaserJudul) +
        '</h3>' +
        '<div class="teaser-grid">' +
        D.teaser
          .map(function (t) {
            return (
              '<div class="teaser-card">' +
              '<span class="teaser-card__icon" aria-hidden="true">' +
              t.ikon +
              '</span>' +
              '<p>' +
              esc(t.teks) +
              '</p>' +
              '</div>'
            );
          })
          .join('') +
        '</div>'
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
   Bagian A: menempatkan bilangan dari konteks pada garis bilangan.
   Bagian B: simulator lompatan + tabel percobaan (dibuka setelah A).
   ============================================================ */

function tempatItems() {
  return orderByIds(DATA.koleksi.tempatkan, State.tempatOrder);
}

/* true/false/null (belum diisi) untuk percobaan ke-i. */
function percobaanStatus(i) {
  var p = DATA.koleksi.percobaan[i];
  var parsed = parseInputInt(State.percobaanInputs[i] || '', true);
  if (parsed.error) return null;
  return parsed.value === integerJumps(p.a, p.op, p.b).hasil;
}

function percobaanSemuaBenar() {
  return DATA.koleksi.percobaan.every(function (p, i) {
    return percobaanStatus(i) === true;
  });
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var items = tempatItems();
  var bukaB = numberLinePlacementDone(items, State.tempatState);
  var tabelBenar = State.percobaanChecked && percobaanSemuaBenar();

  var tabelHTML = '';
  if (bukaB) {
    tabelHTML =
      '<p class="exercise-label" style="margin-top:var(--space-5);">' +
      esc(D.instruksiTabel) +
      '</p>' +
      '<div class="table-scroll">' +
      '<table class="data-table percobaan-table">' +
      '<thead><tr><th scope="col">Percobaan</th><th scope="col">Operasi</th><th scope="col">Hasil</th></tr></thead>' +
      '<tbody>' +
      D.percobaan
        .map(function (p, i) {
          var st = State.percobaanChecked ? percobaanStatus(i) : null;
          return (
            '<tr>' +
            '<td>' +
            esc(p.konteks) +
            '</td>' +
            '<td class="percobaan-table__op">' +
            esc(fmtOperasiBulat(p.a, p.op, p.b)) +
            '</td>' +
            '<td class="percobaan-table__cell' +
            (st === true ? ' sel--ok' : st === false ? ' sel--no' : '') +
            '">' +
            '<input type="text" class="input-text percobaan-table__input" data-perc="' +
            i +
            '" autocomplete="off" value="' +
            esc(State.percobaanInputs[i]) +
            '" aria-label="Hasil ' +
            esc(fmtOperasiBulat(p.a, p.op, p.b)) +
            '" placeholder="?"' +
            (tabelBenar ? ' disabled' : '') +
            '>' +
            (st === true
              ? '<span class="percobaan-table__mark percobaan-table__mark--ok" aria-label="benar">✓</span>'
              : '') +
            (st === false
              ? '<span class="percobaan-table__mark percobaan-table__mark--no" aria-label="salah">✗</span>'
              : '') +
            '</td>' +
            '</tr>'
          );
        })
        .join('') +
      '</tbody></table></div>' +
      (tabelBenar
        ? buildFeedbackBox(
            'success',
            '✓',
            '<strong>Datamu lengkap dan tepat.</strong> Simpan hasil percobaan ini — kamu akan mengolahnya untuk menemukan aturannya.'
          )
        : '<div class="btn-group btn-group--end" style="margin-top:var(--space-3);">' +
          '<button type="button" class="btn btn--primary" id="percobaanCheckBtn">Periksa Data</button>' +
          '</div>');
  }

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiA) +
        '</p>' +
        buildNumberLinePlacement('tempatLine', items, State.tempatState, {
          min: DATA.garis.min,
          max: DATA.garis.max,
          doneText: D.selesaiA,
        })
    ) +
    (bukaB
      ? buildDlPanel(
          '<p class="exercise-label">' +
            esc(D.instruksiB) +
            '</p>' +
            buildIntegerOpSimulator('sim', State.sim, {
              min: DATA.garis.min,
              max: DATA.garis.max,
            }) +
            tabelHTML
        )
      : '') +
    (tabelBenar ? buildDlNextButton('koleksiNextBtn', D.nextLabel, true) : '') +
    '</section>';

  bindNumberLinePlacement(
    container,
    'tempatLine',
    items,
    State.tempatState,
    saveState,
    function () {
      renderKoleksi(container);
    }
  );

  if (bukaB) {
    bindIntegerOpSimulator(
      container,
      'sim',
      State.sim,
      { min: DATA.garis.min, max: DATA.garis.max },
      function () {
        saveState();
      }
    );
  }

  container.querySelectorAll('[data-perc]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      State.percobaanInputs[+inp.dataset.perc] = inp.value;
      saveState();
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var b = document.getElementById('percobaanCheckBtn');
        if (b) b.click();
      }
    });
  });

  var checkBtn = document.getElementById('percobaanCheckBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      var kosong = D.percobaan.some(function (p, i) {
        return percobaanStatus(i) === null;
      });
      State.percobaanChecked = true;
      saveState();
      if (kosong) showNotice('Masih ada hasil yang kosong atau bukan bilangan bulat.');
      else if (!percobaanSemuaBenar())
        showNotice(
          'Ada yang belum tepat. Atur simulator sesuai operasinya, lalu amati titik akhirnya.'
        );
      renderKoleksi(container);
    });
  }

  bindNext('koleksiNextBtn', 'koleksi', 'olahJumlah');
  centerNumberLines(container);
}

/* ============================================================
   8. STAGE: OLAH PENJUMLAHAN  (Discovery Learning — sintaks 4)
   Setiap kasus: pilih arah lompatan (opsi acak) → hitung hasil.
   Setelah semua kasus selesai → pilih pola yang ditemukan.
   ============================================================ */

function jumlahSemuaSelesai() {
  return State.jumlahSteps.every(function (s) {
    return s.done;
  });
}

function renderOlahJumlah(container) {
  var D = DATA.olahJumlah;
  var kasus = orderByIds(D.kasus, State.arahOrder);
  var semua = jumlahSemuaSelesai();
  var polaBenar = State.polaPilihan === D.polaCorrect;

  var kasusHTML = kasus
    .map(function (k) {
      var i = D.kasus.indexOf(k);
      var st = State.arahStates[k.id];
      var step = State.jumlahSteps[i];
      var teks = fmtOperasiBulat(k.a, '+', k.b);
      var r = integerJumps(k.a, '+', k.b);
      return (
        '<div class="panel olah-kasus' +
        (step.done ? ' olah-kasus--done' : '') +
        '">' +
        buildExpr(teks + ' = ' + (step.done ? fmtBulat(r.hasil) : '?')) +
        buildOpLine('jl-' + k.id, k.a, '+', k.b, step.done) +
        '<p class="dl-step__label">' +
        esc(D.arahLabel) +
        '</p>' +
        buildChoiceGroup(D.opsiArah, st.optionOrder, {
          chosen: st.chosen,
          correctId: k.correct,
          grade: true,
          locked: true,
          group: k.id,
          attr: 'data-sort-opt',
        }) +
        (st.chosen
          ? '<div style="margin-top:var(--space-2);">' +
            buildFeedbackBox(
              st.correct ? 'success' : 'error',
              st.correct ? '✓' : '✗',
              (st.correct ? '<strong>Benar.</strong> ' : '<strong>Belum tepat.</strong> ') +
                k.explanation
            ) +
            '</div>' +
            buildDlStep(
              'js' + i,
              step,
              {
                label: 'Hasil ' + esc(teks) + ' = …',
                jawab: r.hasil,
                hints: k.hints,
                allowNegative: true,
              },
              null
            )
          : '') +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Pengolahan Data Penjumlahan">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    kasusHTML +
    (semua
      ? buildDlPanel(
          '<p class="exercise-label">' +
            esc(D.polaLabel) +
            '</p>' +
            buildChoiceGroup(D.polaOpsi, State.polaOrder, {
              chosen: State.polaPilihan,
              correctId: polaBenar ? D.polaCorrect : null,
              grade: true,
              locked: polaBenar,
              group: 'pola',
            }) +
            buildChoiceFeedback(State.polaPilihan, polaBenar, D.polaUmpan),
          'panel--warning'
        )
      : '') +
    (semua && polaBenar ? buildDlNextButton('jumlahNextBtn', D.nextLabel, true) : '') +
    '</section>';

  bindSortItems(container, D.kasus, State.arahStates, saveState, function () {
    renderOlahJumlah(container);
  });

  D.kasus.forEach(function (k, i) {
    var r = integerJumps(k.a, '+', k.b);
    bindDlStep(
      'js' + i,
      State.jumlahSteps[i],
      { jawab: r.hasil, hints: k.hints },
      saveState,
      function () {
        renderOlahJumlah(container);
      }
    );
  });

  container.querySelectorAll('[data-group="pola"][data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.polaPilihan === D.polaCorrect) return;
      State.polaPilihan = btn.dataset.optId;
      saveState();
      renderOlahJumlah(container);
    });
  });

  bindNext('jumlahNextBtn', 'olahJumlah', 'olahKurang');
  centerNumberLines(container);
}

/* ============================================================
   9. STAGE: OLAH PENGURANGAN  (Discovery Learning — sintaks 4)
   A. Lanjutkan pola 5 − 3, 5 − 2, … → 5 − (−2).
   B. Pilih penjumlahan setara 5 − (−2) (opsi acak) + banding lompatan.
   C. Cocokkan pengurangan dengan penjumlahan setara (opsi acak).
   D. Hitung dua pengurangan.
   ============================================================ */

function kurangPolaSelesai() {
  return State.kurangSteps.every(function (s) {
    return s.done;
  });
}

function cocokSemuaDijawab() {
  return DATA.olahKurang.cocok.every(function (c) {
    return !!State.cocokPilih[c.id];
  });
}

function hitungSemuaSelesai() {
  return State.hitungSteps.every(function (s) {
    return s.done;
  });
}

function renderOlahKurang(container) {
  var D = DATA.olahKurang;
  var polaSelesai = kurangPolaSelesai();
  var setaraBenar = State.setaraPilihan === D.setaraCorrect;
  var bukaC = polaSelesai && setaraBenar;
  var bukaD = bukaC && cocokSemuaDijawab();
  var selesai = bukaD && hitungSemuaSelesai();

  /* A — tabel pola */
  var isianIdx = 0;
  var polaRows = D.pola
    .map(function (p) {
      var teks = fmtOperasiBulat(D.polaA, '-', p.b);
      if (p.tampil) {
        return (
          '<tr><td class="pola-table__op">' +
          esc(teks) +
          '</td><td class="pola-table__hasil">' +
          fmtBulat(p.hasil) +
          '</td></tr>'
        );
      }
      var idx = isianIdx++;
      var st = State.kurangSteps[idx];
      var bisa = idx === 0 || State.kurangSteps[idx - 1].done;
      return (
        '<tr class="' +
        (st.done ? 'pola-table__row--done' : '') +
        '"><td class="pola-table__op">' +
        esc(teks) +
        '</td><td class="pola-table__hasil">' +
        (st.done
          ? fmtBulat(p.hasil) + ' <span class="pola-table__ok" aria-label="benar">✓</span>'
          : bisa
            ? buildDlStep('kp' + idx, st, {
                label: '',
                jawab: p.hasil,
                hints: p.hints,
                allowNegative: true,
              })
            : '<span class="dl-caption">…</span>') +
        '</td></tr>'
      );
    })
    .join('');

  var partA = buildDlPanel(
    '<p class="exercise-label">' +
      esc(D.instruksiPola) +
      '</p>' +
      '<div class="table-scroll"><table class="data-table pola-table">' +
      '<thead><tr><th scope="col">Pengurangan</th><th scope="col">Hasil</th></tr></thead>' +
      '<tbody>' +
      polaRows +
      '</tbody></table></div>'
  );

  /* B — bentuk setara + banding lompatan */
  var partB = '';
  if (polaSelesai) {
    partB = buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.setaraLabel) +
        '</p>' +
        buildChoiceGroup(D.setaraOpsi, State.setaraOrder, {
          chosen: State.setaraPilihan,
          correctId: setaraBenar ? D.setaraCorrect : null,
          grade: true,
          locked: setaraBenar,
          group: 'setara',
        }) +
        buildChoiceFeedback(State.setaraPilihan, setaraBenar, D.setaraUmpan) +
        (setaraBenar
          ? '<h3 style="margin:var(--space-5) 0 var(--space-2);">' +
            esc(D.bandingJudul) +
            '</h3>' +
            '<div class="banding-grid">' +
            '<div>' +
            buildExpr(fmtOperasiBulat(D.banding.a, '-', D.banding.b) + ' = 2') +
            buildOpLine('bd1', D.banding.a, '-', D.banding.b, true) +
            '</div>' +
            '<div>' +
            buildExpr(fmtOperasiBulat(D.banding.a, '+', -D.banding.b) + ' = 2') +
            buildOpLine('bd2', D.banding.a, '+', -D.banding.b, true) +
            '</div>' +
            '</div>' +
            buildFeedbackBox('info', '💡', D.bandingTeks)
          : ''),
      'panel--warning'
    );
  }

  /* C — cocokkan bentuk setara */
  var partC = '';
  if (bukaC) {
    partC = buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiCocok) +
        '</p>' +
        D.cocok
          .map(function (c) {
            var chosen = State.cocokPilih[c.id] || null;
            var benar = chosen === c.correct;
            return (
              '<div class="sort-item">' +
              '<p class="sort-item__text sort-item__text--mono">' +
              esc(fmtOperasiBulat(c.a, '-', c.b)) +
              ' = …</p>' +
              buildChoiceGroup(c.options, State.cocokOrders[c.id], {
                chosen: chosen,
                correctId: c.correct,
                grade: true,
                locked: true,
                group: c.id,
                attr: 'data-cocok-opt',
              }) +
              (chosen
                ? '<div style="margin-top:var(--space-2);">' +
                  buildFeedbackBox(
                    benar ? 'success' : 'error',
                    benar ? '✓' : '✗',
                    (benar ? '<strong>Benar.</strong> ' : '<strong>Belum tepat.</strong> ') +
                      c.explanation
                  ) +
                  '</div>'
                : '') +
              '</div>'
            );
          })
          .join('')
    );
  }

  /* D — hitung */
  var partD = '';
  if (bukaD) {
    partD = buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiHitung) +
        '</p>' +
        D.hitung
          .map(function (h, i) {
            var st = State.hitungSteps[i];
            var r = integerJumps(h.a, '-', h.b);
            return (
              '<div class="hitung-item">' +
              buildDlStep(
                'kh' + i,
                st,
                {
                  label: esc(fmtOperasiBulat(h.a, '-', h.b)) + ' = ' + esc(r.setara) + ' = …',
                  jawab: r.hasil,
                  hints: h.hints,
                  allowNegative: true,
                },
                i + 1
              ) +
              (st.done ? buildOpLine('kl' + i, h.a, '-', h.b, true) : '') +
              '</div>'
            );
          })
          .join('')
    );
  }

  container.innerHTML =
    '<section aria-label="Pengolahan Data Pengurangan">' +
    buildHead(D) +
    partA +
    partB +
    partC +
    partD +
    (selesai ? buildDlNextButton('kurangNextBtn', D.nextLabel, true) : '') +
    '</section>';

  function ulang() {
    renderOlahKurang(container);
  }

  polaIsian().forEach(function (p, i) {
    bindDlStep(
      'kp' + i,
      State.kurangSteps[i],
      { jawab: p.hasil, hints: p.hints },
      saveState,
      ulang
    );
  });

  container.querySelectorAll('[data-group="setara"][data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.setaraPilihan === D.setaraCorrect) return;
      State.setaraPilihan = btn.dataset.optId;
      saveState();
      ulang();
    });
  });

  container.querySelectorAll('[data-cocok-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.group;
      if (State.cocokPilih[id]) return;
      State.cocokPilih[id] = btn.dataset.cocokOpt;
      saveState();
      ulang();
    });
  });

  D.hitung.forEach(function (h, i) {
    bindDlStep(
      'kh' + i,
      State.hitungSteps[i],
      { jawab: integerJumps(h.a, '-', h.b).hasil, hints: h.hints },
      saveState,
      ulang
    );
  });

  bindNext('kurangNextBtn', 'olahKurang', 'verifikasi');
  centerNumberLines(container);
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A. Menguji dugaan tahap 1 pada garis bilangan.
   B. Menanggapi tiga miskonsepsi (opsi acak, sekali jawab).
   ============================================================ */

function verifSoalSemuaDijawab() {
  return State.verifExercises.every(function (e) {
    return !!e.chosen;
  });
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var S = DATA.stimulasi;
  var step = State.verifSteps[0];
  var terbukti = step.done;
  var prediksiLabel = State.stimulasiPilihan
    ? findOptionLabel(S.opsi, State.stimulasiPilihan)
    : 'belum diisi';

  var kesimpulanHTML = '';
  if (terbukti) {
    var cocok = State.stimulasiPilihan === S.benar;
    kesimpulanHTML =
      '<div style="margin-top:var(--space-3);">' +
      buildFeedbackBox(
        cocok ? 'success' : 'info',
        cocok ? '👏' : '🔄',
        esc(cocok ? D.kesimpulanBenar : D.kesimpulanKeliru)
      ) +
      '</div>';
  }

  var soalHTML = '';
  if (terbukti) {
    soalHTML = buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiSoal) +
        '</p>' +
        D.soal
          .map(function (q, i) {
            var ex = State.verifExercises[i];
            return (
              '<div class="sort-item">' +
              '<p class="sort-item__text">' +
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
              (ex.chosen
                ? '<div style="margin-top:var(--space-2);">' +
                  buildFeedbackBox(
                    ex.correct ? 'success' : 'error',
                    ex.correct ? '✓' : '✗',
                    (ex.correct ? '<strong>Tepat.</strong> ' : '<strong>Belum tepat.</strong> ') +
                      q.explanation
                  ) +
                  '</div>'
                : '') +
              '</div>'
            );
          })
          .join('')
    );
  }

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin:0;">' +
        esc(D.prediksiLabel) +
        ': <strong>' +
        prediksiLabel +
        '</strong>' +
        (State.stimulasiAlasan ? '<br><em>"' + esc(State.stimulasiAlasan) + '"</em>' : '') +
        '</p>',
      'panel--warning'
    ) +
    buildDlPanel(
      '<div class="verif-grid">' +
        buildThermometer(terbukti ? S.suhuAwal + S.naik : S.suhuAwal, {
          min: -10,
          max: 10,
          step: 2,
          caption: terbukti ? 'Pukul 11.00' : S.captionAwal,
        }) +
        '<div class="verif-grid__main">' +
        buildOpLine('vfLine', S.suhuAwal, '+', S.naik, terbukti) +
        buildDlStep(
          'vf0',
          step,
          {
            label: esc(D.uji.label),
            jawab: S.suhuAwal + S.naik,
            hints: D.uji.hints,
            temuan: D.uji.temuan,
            allowNegative: true,
          },
          null
        ) +
        kesimpulanHTML +
        '</div>' +
        '</div>'
    ) +
    soalHTML +
    (terbukti && verifSoalSemuaDijawab()
      ? buildDlNextButton('verifNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindDlStep(
    'vf0',
    step,
    { jawab: S.suhuAwal + S.naik, hints: D.uji.hints },
    saveState,
    function () {
      renderVerifikasi(container);
    }
  );

  container.querySelectorAll('[data-verif-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = -1;
      D.soal.forEach(function (q, k) {
        if (q.id === btn.dataset.group) i = k;
      });
      var ex = State.verifExercises[i];
      if (!ex || ex.chosen) return;
      ex.chosen = btn.dataset.verifOpt;
      ex.correct = ex.chosen === D.soal[i].correct;
      saveState();
      renderVerifikasi(container);
    });
  });

  bindNext('verifNextBtn', 'verifikasi', 'generalisasi');
  centerNumberLines(container);
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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah aturan yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Operasi Bilangan Bulat</h3>' +
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
    return (
      buildHead(DATA.terapkan) +
      buildDlPanel('<p style="margin:0;">' + esc(DATA.terapkan.instruksi) + '</p>', 'panel--info')
    );
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
  allowNegative: true,
  stripPunctuation: true,
  revealButtonStyle: 'separate',
  invalidMessage: 'Tulis jawaban berupa bilangan bulat, mis. 16 atau −15.',
  inputSuffix: function (s) {
    return s.suffix ? '<span class="dl-caption">' + esc(s.suffix) + '</span>' : '';
  },
  checkValue: function (s) {
    return s.jawab;
  },
  revealText: function (s) {
    return s.reveal;
  },
  renderPrompt: function (s) {
    return (
      '<div class="dl-prompt">' +
      '<span class="konteks-chip">' +
      esc(s.konteks) +
      '</span>' +
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
  var items = tempatItems();
  var tempatSekali = numberLinePlacementFirstTry(items, State.tempatState);
  var arahBenar = sortItemsCorrectCount(DATA.olahJumlah.kasus, State.arahStates);
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
        kartu(tempatSekali + '/' + items.length, 'Bilangan tepat ditempatkan sekali ketuk') +
        kartu(arahBenar + '/' + DATA.olahJumlah.kasus.length, 'Arah lompatan benar') +
        kartu(verifBenar + '/' + DATA.verifikasi.soal.length, 'Miskonsepsi ditanggapi benar') +
        kartu(terapBenar + '/' + DATA.terapkan.soal.length, 'Uji terap benar') +
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
    '<div class="aturan-duo">' +
    '<div class="aturan-card aturan-card--pos"><span class="aturan-card__label">Tambah positif</span>lompat ke kanan →</div>' +
    '<div class="aturan-card aturan-card--neg"><span class="aturan-card__label">Tambah negatif</span>← lompat ke kiri</div>' +
    '<div class="aturan-card"><span class="aturan-card__label">Pengurangan</span>a − b = a + (−b)</div>' +
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
    'Kemampuan murid menjelaskan lompatan pada garis bilangan dan aturan a − b = a + (−b) dengan kata-kata sendiri tetap menjadi bahan penilaian utama.' +
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
  olahJumlah: renderOlahJumlah,
  olahKurang: renderOlahKurang,
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
