'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Perkalian & Pembagian Bilangan Bulat
   Fase D — SMP Kelas 7

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox,
   createStageMachine, createExerciseStage, createStore,
   ensureExerciseArray, optionIds, komponen inkuiri/penemuan
   (ensureShuffledOrder, orderByIds, buildDiscoveryHead,
   buildTeacherNote, buildChoiceGroup, buildDlPanel,
   buildDlNextButton, makeDlStep, buildDlStep, bindDlStep,
   findOptionLabel, ensureSortStates, buildSortItems,
   bindSortItems, sortItemsAllAnswered, sortItemsCorrectCount),
   garis bilangan (buildNumberLineJumps, centerNumberLines),
   serta komponen perkalian & pembagian bilangan bulat
   (fmtBulat, fmtOperasiBulat, hasilOperasiBulat,
   fmtPenjumlahanBerulang, buildRepeatedAddJumps,
   buildSignRuleGrid, bindSignRuleGrid, signGridAllChosen,
   signGridMatchCount, buildExprSteps, bindExprSteps,
   exprStepsDone).

   Alur tahap mengikuti sintaks Inquiry Learning; lihat komentar
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
    5. Stage: Orientasi              (Inkuiri sintaks 1)
    6. Stage: Merumuskan Masalah     (Inkuiri sintaks 2)
    7. Stage: Merumuskan Hipotesis   (Inkuiri sintaks 3)
    8. Stage: Data Perkalian         (Inkuiri sintaks 4)
    9. Stage: Data Pembagian         (Inkuiri sintaks 4)
   10. Stage: Menguji Hipotesis      (Inkuiri sintaks 5)
   11. Stage: Sifat & Urutan         (Inkuiri sintaks 4–5)
   12. Stage: Merumuskan Kesimpulan  (Inkuiri sintaks 6)
   13. Stage: Uji Terap
   14. Stage: Refleksi
   15. Stage: Selesai
   16. Router Render
   17. Helper UI (modal reset)
   18. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'masalah',
  'hipotesis',
  'dataKali',
  'dataBagi',
  'uji',
  'sifat',
  'simpulan',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Orientasi',
  'Masalah',
  'Hipotesis',
  'Data (×)',
  'Data (:)',
  'Uji',
  'Sifat & Urutan',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-2-2-bulat-kali-bagi-v1';

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Tahap 1 — orientasi (dugaan, tidak dinilai) */
  orientasiOrder: null,
  orientasiPilihan: null,
  tekaOrder: null,
  tekaPilihan: null,
  orientasiAlasan: '',

  /* Tahap 2 — merumuskan masalah */
  masalahOrder: null,
  masalahPilihan: null,

  /* Tahap 3 — hipotesis (tabel dugaan tanda) */
  dugaanStates: {},
  dugaanOrder: null,
  hipotesisTeks: '',

  /* Tahap 4 — data perkalian */
  ulangSteps: [],
  polaSteps: [],
  polaOrder: null,
  polaPilihan: null,

  /* Tahap 5 — data pembagian */
  bagiSteps: [],
  cocokOrders: {},
  cocokPilih: {},

  /* Tahap 6 — menguji hipotesis */
  pilahStates: {},
  pilahOrder: null,
  verifExercises: [],

  /* Tahap 7 — sifat & urutan pengerjaan */
  sifatKiri: [],
  sifatKanan: [],
  sifatOrders: {},
  sifatPilih: {},
  urutanOrder: null,
  urutanPilihan: null,
  exprStates: {},
  cepatOrder: null,
  cepatPilihan: null,
  cepatSteps: [],

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

/* Baris pola perkalian yang harus diisi murid (bukan contoh). */
function polaIsian() {
  return DATA.dataKali.pola.filter(function (p) {
    return !p.tampil;
  });
}

/* Memastikan state[key] berupa objek (bukan null/array). */
function ensureObject(state, key) {
  if (!state[key] || typeof state[key] !== 'object' || Array.isArray(state[key])) {
    state[key] = {};
  }
}

/*
 * Menyiapkan seluruh state per-soal DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'orientasiOrder', DATA.orientasi.opsi);
  ensureShuffledOrder(State, 'tekaOrder', DATA.orientasi.tekaOpsi);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 — urutan opsi tanda pada setiap sel diacak */
  ensureSortStates(State, 'dugaanStates', 'dugaanOrder', DATA.hipotesis.sel, DATA.opsiTanda);

  /* Tahap 4 */
  ensureExerciseArray(State, 'ulangSteps', DATA.dataKali.ulang, makeDlStep);
  ensureExerciseArray(State, 'polaSteps', polaIsian(), makeDlStep);
  ensureShuffledOrder(State, 'polaOrder', DATA.dataKali.polaOpsi);

  /* Tahap 5 */
  ensureExerciseArray(State, 'bagiSteps', DATA.dataBagi.kasus, makeDlStep);
  ensureObject(State, 'cocokOrders');
  ensureObject(State, 'cocokPilih');
  DATA.dataBagi.cocok.forEach(function (c) {
    ensureShuffledOrder(State.cocokOrders, c.id, c.options);
  });

  /* Tahap 6 */
  ensureSortStates(State, 'pilahStates', 'pilahOrder', DATA.uji.pilah, DATA.uji.opsiPilah);
  ensureExerciseArray(State, 'verifExercises', DATA.uji.soal, function (q) {
    return { chosen: null, correct: false, optionOrder: shuffleArray(optionIds(q.options)) };
  });

  /* Tahap 7 */
  var S = DATA.sifat;
  ensureExerciseArray(State, 'sifatKiri', S.sifatList, makeDlStep);
  ensureExerciseArray(State, 'sifatKanan', S.sifatList, makeDlStep);
  ensureObject(State, 'sifatOrders');
  ensureObject(State, 'sifatPilih');
  S.sifatList.forEach(function (s) {
    ensureShuffledOrder(State.sifatOrders, s.id, S.opsiSama);
  });
  ensureShuffledOrder(State, 'urutanOrder', S.urutanOpsi);
  ensureObject(State, 'exprStates');
  S.ekspresi.forEach(function (e) {
    ensureExerciseArray(State.exprStates, e.id, e.langkah, makeDlStep);
  });
  ensureShuffledOrder(State, 'cepatOrder', S.cepatOpsi);
  ensureExerciseArray(State, 'cepatSteps', [S.cepatHitung], makeDlStep);

  /* Tahap 8 */
  ensureShuffledOrder(State, 'bankOrder', DATA.simpulan.bank);
  ensureObject(State, 'simpulanPilihan');

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
  ensureObject(State, 'refleksiAnswers');
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

/* Umpan balik jawaban sekali-pilih (benar → success, salah → error). */
function buildLockedFeedback(benar, explanation) {
  return (
    '<div style="margin-top:var(--space-2);">' +
    buildFeedbackBox(
      benar ? 'success' : 'error',
      benar ? '✓' : '✗',
      (benar ? '<strong>Benar.</strong> ' : '<strong>Belum tepat.</strong> ') + explanation
    ) +
    '</div>'
  );
}

/*
 * Memasang klik pilihan yang boleh diulang sampai benar (pilihan terkunci
 * setelah benar). `get`/`set` membaca dan menulis pilihan di State.
 */
function bindRetryChoice(container, group, correct, get, set, rerender) {
  container.querySelectorAll('[data-group="' + group + '"][data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (get() === correct) return;
      set(btn.dataset.optId);
      saveState();
      rerender();
    });
  });
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

/* Ekspresi operasi besar (monospace). */
function buildExpr(teks) {
  return '<p class="op-expr">' + esc(teks) + '</p>';
}

function semuaSelesai(steps) {
  return steps.every(function (s) {
    return s.done;
  });
}

/* ============================================================
   5. STAGE: ORIENTASI  (Inquiry Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah.
   ============================================================ */

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var terisi = !!State.orientasiPilihan && !!State.tekaPilihan;

  container.innerHTML =
    '<section aria-label="Orientasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🤿 ' +
        esc(D.judul) +
        '</h2>' +
        '<p class="orientasi-cerita">' +
        esc(D.cerita) +
        '</p>' +
        buildExpr(
          fmtOperasiBulat(D.menit, '×', D.perubahan) +
            ' = ' +
            fmtPenjumlahanBerulang(D.menit, D.perubahan) +
            ' = ?'
        ) +
        buildRepeatedAddJumps('orLine', D.menit, D.perubahan, {
          min: DATA.garis.min,
          max: DATA.garis.max,
          showEnd: false,
        }),
      'panel--hero'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.orientasiOrder, {
          chosen: State.orientasiPilihan,
          group: 'posisi',
        })
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🧩 ' +
        esc(D.tekaJudul) +
        '</h3>' +
        '<p>' +
        esc(D.tekaTeks) +
        '</p>' +
        '<p class="exercise-label">' +
        esc(D.tekaPertanyaan) +
        '</p>' +
        buildChoiceGroup(D.tekaOpsi, State.tekaOrder, {
          chosen: State.tekaPilihan,
          group: 'teka',
        }) +
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
        buildFeedbackBox('info', '🔎', esc(D.catatan)),
      'panel--warning'
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
    '<button type="button" class="btn btn--primary" id="orientasiNextBtn"' +
    (terisi ? '' : ' disabled') +
    '>' +
    esc(D.nextLabel) +
    '</button>' +
    '</div>' +
    '</section>';

  function ulang() {
    renderOrientasi(container);
  }

  container.querySelectorAll('[data-group="posisi"][data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.orientasiPilihan = btn.dataset.optId;
      saveState();
      ulang();
    });
  });

  container.querySelectorAll('[data-group="teka"][data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.tekaPilihan = btn.dataset.optId;
      saveState();
      ulang();
    });
  });

  var ta = document.getElementById('orientasiAlasan');
  ta.addEventListener('input', function () {
    State.orientasiAlasan = ta.value;
    saveState();
  });

  document.getElementById('orientasiNextBtn').addEventListener('click', function () {
    if (!State.orientasiPilihan || !State.tekaPilihan) {
      showNotice('Pilih kedua dugaanmu sebelum melanjutkan.');
      return;
    }
    completeStage('orientasi');
    navigateTo('masalah');
  });

  centerNumberLines(container);
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
          group: 'masalah',
        }) +
        buildChoiceFeedback(State.masalahPilihan, benar, D.umpan)
    ) +
    (benar ? buildDlNextButton('masalahNextBtn', D.nextLabel) : '') +
    '</section>';

  bindRetryChoice(
    container,
    'masalah',
    D.correct,
    function () {
      return State.masalahPilihan;
    },
    function (v) {
      State.masalahPilihan = v;
    },
    function () {
      renderMasalah(container);
    }
  );

  bindNext('masalahNextBtn', 'masalah', 'hipotesis');
}

/* ============================================================
   7. STAGE: MERUMUSKAN HIPOTESIS  (Inquiry Learning — sintaks 3)
   Tabel dugaan tanda (tidak dinilai, boleh diubah) + hipotesis.
   ============================================================ */

function renderHipotesis(container) {
  var D = DATA.hipotesis;

  container.innerHTML =
    '<section aria-label="Merumuskan Hipotesis">' +
    buildHead(D) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksi) +
        '</p>' +
        buildSignRuleGrid('dugaanGrid', D.sel, State.dugaanStates, {
          mode: 'pilih',
          options: DATA.opsiTanda,
        })
    ) +
    buildDlPanel(
      '<div class="field-group">' +
        '<label for="hipotesisTeks">' +
        esc(D.hipotesisLabel) +
        '</label>' +
        '<textarea id="hipotesisTeks" class="input-textarea" placeholder="' +
        esc(D.hipotesisPlaceholder) +
        '">' +
        esc(State.hipotesisTeks) +
        '</textarea>' +
        '</div>',
      'panel--warning'
    ) +
    buildDlNextButton('hipotesisNextBtn', D.nextLabel) +
    '</section>';

  bindSignRuleGrid(container, 'dugaanGrid', D.sel, State.dugaanStates, saveState, function () {
    renderHipotesis(container);
  });

  var ta = document.getElementById('hipotesisTeks');
  ta.addEventListener('input', function () {
    State.hipotesisTeks = ta.value;
    saveState();
  });

  document.getElementById('hipotesisNextBtn').addEventListener('click', function () {
    if (!signGridAllChosen(D.sel, State.dugaanStates)) {
      showNotice('Isi dugaan tanda untuk semua pola terlebih dahulu.');
      return;
    }
    if (!State.hipotesisTeks.trim()) {
      showNotice('Tulis hipotesismu lebih dulu, walau hanya satu kalimat.');
      return;
    }
    completeStage('hipotesis');
    navigateTo('dataKali');
  });
}

/* ============================================================
   8. STAGE: DATA PERKALIAN  (Inquiry Learning — sintaks 4)
   A. Penjumlahan berulang pada garis bilangan.
   B. Lanjutkan pola (−3) × 3, (−3) × 2, … (−3) × (−3).
   C. Pilih pola yang ditemukan (opsi acak).
   ============================================================ */

function renderDataKali(container) {
  var D = DATA.dataKali;
  var selesaiA = semuaSelesai(State.ulangSteps);
  var selesaiB = selesaiA && semuaSelesai(State.polaSteps);
  var polaBenar = State.polaPilihan === D.polaCorrect;

  /* A — penjumlahan berulang */
  var partA = buildDlPanel(
    '<p class="exercise-label">' +
      esc(D.instruksiA) +
      '</p>' +
      D.ulang
        .map(function (u, i) {
          var st = State.ulangSteps[i];
          var teks = fmtOperasiBulat(u.n, '×', u.b);
          var bisa = i === 0 || State.ulangSteps[i - 1].done;
          if (!bisa) return '';
          return (
            '<div class="panel panel--compact kasus-card' +
            (st.done ? ' kasus-card--done' : '') +
            '">' +
            buildExpr(
              teks +
                ' = ' +
                fmtPenjumlahanBerulang(u.n, u.b) +
                ' = ' +
                (st.done ? fmtBulat(u.n * u.b) : '?')
            ) +
            buildRepeatedAddJumps('ul' + i, u.n, u.b, {
              min: DATA.garis.min,
              max: DATA.garis.max,
              showEnd: st.done,
            }) +
            buildDlStep(
              'ua' + i,
              st,
              {
                label: 'Hasil ' + esc(teks) + ' = …',
                jawab: u.n * u.b,
                hints: u.hints,
                allowNegative: true,
              },
              null
            ) +
            '</div>'
          );
        })
        .join('') +
      (selesaiA ? buildFeedbackBox('success', '💡', D.selesaiA) : '')
  );

  /* B — tabel pola */
  var partB = '';
  if (selesaiA) {
    var isianIdx = 0;
    var rows = D.pola
      .map(function (p) {
        var teks = fmtOperasiBulat(D.polaA, '×', p.b);
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
        var st = State.polaSteps[idx];
        var bisa = idx === 0 || State.polaSteps[idx - 1].done;
        return (
          '<tr class="' +
          (st.done ? 'pola-table__row--done' : '') +
          (p.b < 0 ? ' pola-table__row--neg' : '') +
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
    partB = buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiB) +
        '</p>' +
        '<div class="table-scroll"><table class="data-table pola-table">' +
        '<thead><tr><th scope="col">Perkalian</th><th scope="col">Hasil</th></tr></thead>' +
        '<tbody>' +
        rows +
        '</tbody></table></div>' +
        '<p class="dl-caption pola-caption">↓ pengali turun 1 &nbsp;·&nbsp; hasil naik 3 ↑</p>'
    );
  }

  /* C — pola yang ditemukan */
  var partC = '';
  if (selesaiB) {
    partC = buildDlPanel(
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
    );
  }

  container.innerHTML =
    '<section aria-label="Mengumpulkan Data Perkalian">' +
    buildHead(D) +
    partA +
    partB +
    partC +
    (selesaiB && polaBenar ? buildDlNextButton('kaliNextBtn', D.nextLabel, true) : '') +
    '</section>';

  function ulang() {
    renderDataKali(container);
  }

  D.ulang.forEach(function (u, i) {
    bindDlStep(
      'ua' + i,
      State.ulangSteps[i],
      { jawab: u.n * u.b, hints: u.hints },
      saveState,
      ulang
    );
  });

  polaIsian().forEach(function (p, i) {
    bindDlStep('kp' + i, State.polaSteps[i], { jawab: p.hasil, hints: p.hints }, saveState, ulang);
  });

  bindRetryChoice(
    container,
    'pola',
    D.polaCorrect,
    function () {
      return State.polaPilihan;
    },
    function (v) {
      State.polaPilihan = v;
    },
    ulang
  );

  bindNext('kaliNextBtn', 'dataKali', 'dataBagi');
  centerNumberLines(container);
}

/* ============================================================
   9. STAGE: DATA PEMBAGIAN  (Inquiry Learning — sintaks 4)
   A. Pembagian sebagai kebalikan perkalian (isian bertahap).
   B. Pasangkan pembagian dengan perkalian pemeriksa (opsi acak).
   ============================================================ */

function cocokSemuaDijawab() {
  return DATA.dataBagi.cocok.every(function (c) {
    return !!State.cocokPilih[c.id];
  });
}

function renderDataBagi(container) {
  var D = DATA.dataBagi;
  var selesaiA = semuaSelesai(State.bagiSteps);
  var selesaiB = selesaiA && cocokSemuaDijawab();

  var partA = buildDlPanel(
    '<p class="exercise-label">' +
      esc(D.instruksi) +
      '</p>' +
      D.kasus
        .map(function (k, i) {
          var st = State.bagiSteps[i];
          var q = hasilOperasiBulat(k.a, ':', k.b);
          var bisa = i === 0 || State.bagiSteps[i - 1].done;
          if (!bisa) return '';
          return buildDlStep(
            'bg' + i,
            st,
            {
              label: esc(fmtOperasiBulat(k.a, ':', k.b)) + ' = …',
              jawab: q,
              hints: k.hints,
              allowNegative: true,
              temuan:
                'Periksa: ' + esc(fmtOperasiBulat(q, '×', k.b)) + ' = ' + esc(fmtBulat(k.a)) + ' ✓',
            },
            i + 1
          );
        })
        .join('')
  );

  var partB = '';
  if (selesaiA) {
    partB = buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiCocok) +
        '</p>' +
        D.cocok
          .map(function (c) {
            var chosen = State.cocokPilih[c.id] || null;
            return (
              '<div class="sort-item">' +
              '<p class="sort-item__text sort-item__text--mono">' +
              esc(c.teks) +
              '</p>' +
              buildChoiceGroup(c.options, State.cocokOrders[c.id], {
                chosen: chosen,
                correctId: c.correct,
                grade: true,
                locked: true,
                group: c.id,
                attr: 'data-cocok-opt',
              }) +
              (chosen ? buildLockedFeedback(chosen === c.correct, c.explanation) : '') +
              '</div>'
            );
          })
          .join('') +
        (selesaiB ? buildFeedbackBox('info', '💡', D.temuan) : ''),
      'panel--warning'
    );
  }

  container.innerHTML =
    '<section aria-label="Mengumpulkan Data Pembagian">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    partA +
    partB +
    (selesaiB ? buildDlNextButton('bagiNextBtn', D.nextLabel, true) : '') +
    '</section>';

  function ulang() {
    renderDataBagi(container);
  }

  D.kasus.forEach(function (k, i) {
    bindDlStep(
      'bg' + i,
      State.bagiSteps[i],
      { jawab: hasilOperasiBulat(k.a, ':', k.b), hints: k.hints },
      saveState,
      ulang
    );
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

  bindNext('bagiNextBtn', 'dataBagi', 'uji');
}

/* ============================================================
   10. STAGE: MENGUJI HIPOTESIS  (Inquiry Learning — sintaks 5)
   A. Tabel dugaan vs data.
   B. Memilah tanda hasil operasi baru (butir & opsi acak).
   C. Menanggapi tiga miskonsepsi (opsi acak, sekali jawab).
   ============================================================ */

function verifSemuaDijawab() {
  return State.verifExercises.every(function (e) {
    return !!e.chosen;
  });
}

function renderUji(container) {
  var D = DATA.uji;
  var H = DATA.hipotesis;
  var O = DATA.orientasi;
  var cocok = signGridMatchCount(H.sel, State.dugaanStates);
  var bukaC = sortItemsAllAnswered(D.pilah, State.pilahStates);
  var selesai = bukaC && verifSemuaDijawab();
  var tekaDugaan = State.tekaPilihan ? findOptionLabel(O.tekaOpsi, State.tekaPilihan) : '—';

  var partC = '';
  if (bukaC) {
    partC = buildDlPanel(
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
              (ex.chosen ? buildLockedFeedback(ex.correct, q.explanation) : '') +
              '</div>'
            );
          })
          .join('')
    );
  }

  container.innerHTML =
    '<section aria-label="Menguji Hipotesis">' +
    buildHead(D) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiBanding) +
        '</p>' +
        buildSignRuleGrid('ujiGrid', H.sel, State.dugaanStates, {
          mode: 'banding',
          options: DATA.opsiTanda,
          dugaanLabel: D.dugaanLabel,
          dataLabel: D.dataLabel,
        }) +
        '<div style="margin-top:var(--space-4);">' +
        buildFeedbackBox(
          cocok === H.sel.length ? 'success' : 'info',
          cocok === H.sel.length ? '👏' : '🔄',
          '<strong>' +
            cocok +
            ' dari ' +
            H.sel.length +
            ' dugaan cocok.</strong> ' +
            esc(cocok === H.sel.length ? D.semuaCocok : D.sebagianCocok)
        ) +
        '</div>' +
        '<p class="teka-banding">' +
        esc(D.tekaLabel) +
        ': <strong>' +
        esc(tekaDugaan) +
        '</strong>. ' +
        D.tekaHasil +
        (State.tekaPilihan === O.tekaBenar ? ' Dugaanmu tepat!' : '') +
        '</p>',
      'panel--warning'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiPilah) +
        '</p>' +
        buildSortItems(D.pilah, State.pilahOrder, D.opsiPilah, State.pilahStates, { mono: true })
    ) +
    partC +
    (selesai ? buildDlNextButton('ujiNextBtn', D.nextLabel, true) : '') +
    '</section>';

  function ulang() {
    renderUji(container);
  }

  bindSortItems(container, D.pilah, State.pilahStates, saveState, ulang);

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
      ulang();
    });
  });

  bindNext('ujiNextBtn', 'uji', 'sifat');
}

/* ============================================================
   11. STAGE: SIFAT & URUTAN  (Inquiry Learning — sintaks 4–5)
   A. Selidiki sifat: hitung ruas kiri & kanan → putuskan sama/beda.
   B. Urutan pengerjaan: pilih cara yang benar → kerjakan ekspresi
      campuran langkah demi langkah.
   C. Hitung cepat dengan sifat distributif.
   ============================================================ */

function sifatItemSelesai(i) {
  var s = DATA.sifat.sifatList[i];
  return State.sifatKiri[i].done && State.sifatKanan[i].done && !!State.sifatPilih[s.id];
}

function sifatSemuaSelesai() {
  return DATA.sifat.sifatList.every(function (s, i) {
    return sifatItemSelesai(i);
  });
}

function ekspresiSemuaSelesai() {
  return DATA.sifat.ekspresi.every(function (e) {
    return exprStepsDone(State.exprStates[e.id]);
  });
}

function renderSifat(container) {
  var D = DATA.sifat;
  var bukaB = sifatSemuaSelesai();
  var urutanBenar = State.urutanPilihan === D.urutanCorrect;
  var bukaC = bukaB && urutanBenar && ekspresiSemuaSelesai();
  var cepatBenar = State.cepatPilihan === D.cepatCorrect;
  var selesai = bukaC && cepatBenar && State.cepatSteps[0].done;

  /* A — sifat operasi */
  var partA = buildDlPanel(
    '<p class="exercise-label">' +
      esc(D.instruksiA) +
      '</p>' +
      D.sifatList
        .map(function (s, i) {
          if (i > 0 && !sifatItemSelesai(i - 1)) return '';
          var kiri = State.sifatKiri[i];
          var kanan = State.sifatKanan[i];
          var chosen = State.sifatPilih[s.id] || null;
          var benar = chosen === s.correct;
          var penjelasan =
            'Ruas kiri ' +
            esc(fmtBulat(s.jawabKiri)) +
            ', ruas kanan ' +
            esc(fmtBulat(s.jawabKanan)) +
            '. <span class="sifat-rumus">' +
            esc(s.rumus) +
            '</span>';
          return (
            '<div class="panel panel--compact sifat-card' +
            (chosen ? ' sifat-card--done' : '') +
            '">' +
            '<h3 class="sifat-card__title">' +
            esc(s.nama) +
            '</h3>' +
            buildDlStep(
              'sk' + i,
              kiri,
              {
                label: 'Ruas kiri: ' + esc(s.kiri) + ' = …',
                jawab: s.jawabKiri,
                hints: s.hintsKiri,
                allowNegative: true,
              },
              1
            ) +
            (kiri.done
              ? buildDlStep(
                  'sn' + i,
                  kanan,
                  {
                    label: 'Ruas kanan: ' + esc(s.kanan) + ' = …',
                    jawab: s.jawabKanan,
                    hints: s.hintsKanan,
                    allowNegative: true,
                  },
                  2
                )
              : '') +
            (kiri.done && kanan.done
              ? buildChoiceGroup(D.opsiSama, State.sifatOrders[s.id], {
                  chosen: chosen,
                  correctId: s.correct,
                  grade: true,
                  locked: true,
                  group: s.id,
                  attr: 'data-sifat-opt',
                }) + (chosen ? buildLockedFeedback(benar, penjelasan) : '')
              : '') +
            '</div>'
          );
        })
        .join('') +
      (bukaB ? buildFeedbackBox('success', '💡', D.temuanA) : '')
  );

  /* B — urutan pengerjaan */
  var partB = '';
  if (bukaB) {
    var exprHTML = '';
    if (urutanBenar) {
      exprHTML =
        '<ol class="objectives-list urutan-list">' +
        D.aturanUrutan
          .map(function (r, i) {
            return (
              '<li><span class="objectives-list__num">' +
              (i + 1) +
              '</span><span>' +
              r +
              '</span></li>'
            );
          })
          .join('') +
        '</ol>' +
        '<p class="exercise-label">' +
        esc(D.instruksiLangkah) +
        '</p>' +
        D.ekspresi
          .map(function (e, i) {
            if (i > 0 && !exprStepsDone(State.exprStates[D.ekspresi[i - 1].id])) return '';
            return (
              '<div class="panel panel--compact expr-card">' +
              buildExprSteps('ex-' + e.id, e, State.exprStates[e.id]) +
              '</div>'
            );
          })
          .join('');
    }
    partB = buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiB) +
        '</p>' +
        '<div class="cara-grid">' +
        D.caraTeman
          .map(function (c) {
            return (
              '<div class="cara-card">' +
              '<span class="cara-card__nama">Cara ' +
              esc(c.nama) +
              '</span>' +
              '<span class="cara-card__kerja">' +
              esc(c.kerja) +
              '</span>' +
              '</div>'
            );
          })
          .join('') +
        '</div>' +
        '<p class="exercise-label">' +
        esc(D.urutanLabel) +
        '</p>' +
        buildChoiceGroup(D.urutanOpsi, State.urutanOrder, {
          chosen: State.urutanPilihan,
          correctId: urutanBenar ? D.urutanCorrect : null,
          grade: true,
          locked: urutanBenar,
          group: 'urutan',
        }) +
        buildChoiceFeedback(State.urutanPilihan, urutanBenar, D.urutanUmpan) +
        exprHTML,
      'panel--warning'
    );
  }

  /* C — hitung cepat */
  var partC = '';
  if (bukaC) {
    partC = buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiC) +
        '</p>' +
        '<p class="exercise-label">' +
        esc(D.cepatLabel) +
        '</p>' +
        buildChoiceGroup(D.cepatOpsi, State.cepatOrder, {
          chosen: State.cepatPilihan,
          correctId: cepatBenar ? D.cepatCorrect : null,
          grade: true,
          locked: cepatBenar,
          group: 'cepat',
        }) +
        buildChoiceFeedback(State.cepatPilihan, cepatBenar, D.cepatUmpan) +
        (cepatBenar
          ? buildDlStep(
              'cp0',
              State.cepatSteps[0],
              {
                label: esc(D.cepatHitung.label),
                jawab: D.cepatHitung.jawab,
                hints: D.cepatHitung.hints,
                allowNegative: true,
              },
              null
            )
          : '')
    );
  }

  container.innerHTML =
    '<section aria-label="Sifat Operasi dan Urutan Pengerjaan">' +
    buildHead(D) +
    partA +
    partB +
    partC +
    (selesai ? buildDlNextButton('sifatNextBtn', D.nextLabel, true) : '') +
    '</section>';

  function ulang() {
    renderSifat(container);
  }

  D.sifatList.forEach(function (s, i) {
    bindDlStep(
      'sk' + i,
      State.sifatKiri[i],
      { jawab: s.jawabKiri, hints: s.hintsKiri },
      saveState,
      ulang
    );
    bindDlStep(
      'sn' + i,
      State.sifatKanan[i],
      { jawab: s.jawabKanan, hints: s.hintsKanan },
      saveState,
      ulang
    );
  });

  container.querySelectorAll('[data-sifat-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.group;
      if (State.sifatPilih[id]) return;
      State.sifatPilih[id] = btn.dataset.sifatOpt;
      saveState();
      ulang();
    });
  });

  bindRetryChoice(
    container,
    'urutan',
    D.urutanCorrect,
    function () {
      return State.urutanPilihan;
    },
    function (v) {
      State.urutanPilihan = v;
    },
    ulang
  );

  D.ekspresi.forEach(function (e) {
    bindExprSteps('ex-' + e.id, e, State.exprStates[e.id], saveState, ulang);
  });

  bindRetryChoice(
    container,
    'cepat',
    D.cepatCorrect,
    function () {
      return State.cepatPilihan;
    },
    function (v) {
      State.cepatPilihan = v;
    },
    ulang
  );

  bindDlStep(
    'cp0',
    State.cepatSteps[0],
    { jawab: D.cepatHitung.jawab, hints: D.cepatHitung.hints },
    saveState,
    ulang
  );

  bindNext('sifatNextBtn', 'sifat', 'simpulan');
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
          ? '<p class="dl-simpulan-item__note">Belum tepat. Ingat kembali data dan hasil ujimu, lalu pilih potongan lain.</p>'
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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah jawaban atas rumusan masalah yang kamu selidiki sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Perkalian & Pembagian Bilangan Bulat</h3>' +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' +
                  (i + 1) +
                  '</span><span>' +
                  r +
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
  invalidMessage: 'Tulis jawaban berupa bilangan bulat, mis. 48 atau −5.',
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
   14. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var H = DATA.hipotesis;
  var hipotesisCocok = signGridMatchCount(H.sel, State.dugaanStates);
  var pilahBenar = sortItemsCorrectCount(DATA.uji.pilah, State.pilahStates);
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
        kartu(hipotesisCocok + '/' + H.sel.length, 'Dugaan awal yang terbukti') +
        kartu(pilahBenar + '/' + DATA.uji.pilah.length, 'Tanda hasil dipilah benar') +
        kartu(verifBenar + '/' + DATA.uji.soal.length, 'Miskonsepsi ditanggapi benar') +
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
    '<div class="aturan-duo">' +
    '<div class="aturan-card aturan-card--pos"><span class="aturan-card__label">Tanda sama → positif</span>(+) × (+) = (+)<br>(−) × (−) = (+)</div>' +
    '<div class="aturan-card aturan-card--neg"><span class="aturan-card__label">Tanda berbeda → negatif</span>(+) × (−) = (−)<br>(−) × (+) = (−)</div>' +
    '<div class="aturan-card"><span class="aturan-card__label">Urutan pengerjaan</span>( ) → × : → + −</div>' +
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
    'Kemampuan murid menjelaskan mengapa negatif × negatif = positif dan alasan urutan pengerjaan dengan kata-kata sendiri tetap menjadi bahan penilaian utama.' +
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
  dataKali: renderDataKali,
  dataBagi: renderDataBagi,
  uji: renderUji,
  sifat: renderSifat,
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
