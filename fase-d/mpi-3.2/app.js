'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Membandingkan & Mengurutkan Bilangan Desimal
   Fase D — SMP Kelas 7

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox,
   createStageMachine, createStore, ensureExerciseArray,
   komponen inkuiri/penemuan (ensureShuffledOrder, orderByIds,
   buildDiscoveryHead, buildTeacherNote, buildChoiceGroup,
   buildDlPanel, buildDlNextButton, findOptionLabel,
   ensureSortStates, buildSortItems, bindSortItems,
   sortItemsAllAnswered, sortItemsCorrectCount), pertanyaan
   penuntun (buildGuidedQuizList, bindGuidedQuizList,
   guidedQuizAllCorrect), kartu urut-ketuk (ensureTapOrderState,
   buildTapOrder, bindTapOrder), lambang perbandingan
   (COMPARE_SYMBOLS, compareSymbolText), serta bagian 20 —
   membandingkan & mengurutkan desimal (bandingkanDesimal,
   simbolBandingDesimal, tempatBedaPertama, alasanBandingDesimal,
   urutkanDesimal, diagnosaBandingDesimal, pesanDiagnosaDesimal,
   buildPlaceValueCompare, buildPlaceValueStack,
   buildCompareSentenceDesimal, buildDecimalPlacement,
   bindDecimalPlacement).

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
    8. Stage: Data Nilai Tempat      (Inkuiri sintaks 4)
    9. Stage: Data Garis Bilangan    (Inkuiri sintaks 4)
   10. Stage: Menguji Hipotesis      (Inkuiri sintaks 5)
   11. Stage: Mengurutkan            (Inkuiri sintaks 4–5)
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
  'dataTempat',
  'dataGaris',
  'uji',
  'urutkan',
  'simpulan',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Orientasi',
  'Masalah',
  'Hipotesis',
  'Data: Tempat',
  'Data: Garis',
  'Uji',
  'Urutkan',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-3-2-desimal-banding-v1';

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Tahap 1 — orientasi (dugaan, tidak dinilai) */
  pelariOrder: null,
  pelariPilihan: null,
  tekaOrder: null,
  tekaPilihan: null,
  orientasiAlasan: '',

  /* Tahap 2 — merumuskan masalah */
  masalahOrder: null,
  masalahPilihan: null,

  /* Tahap 3 — hipotesis */
  strategiOrder: null,
  strategiPilihan: null,
  dugaanOrders: {},
  dugaanPilih: {},
  hipotesisTeks: '',

  /* Tahap 4 — data nilai tempat */
  tempatOrders: {},
  tempatPilih: {},
  lambangOrders: {},
  lambangStates: {},
  temuanOrders: {},
  temuanPilih: {},

  /* Tahap 5 — data garis bilangan */
  garisOrders: {},
  garisStates: {},
  amatiOrders: {},
  amatiPilih: {},

  /* Tahap 6 — menguji hipotesis */
  pilahStates: {},
  pilahOrder: null,
  bandingOrders: {},
  bandingStates: {},

  /* Tahap 7 — mengurutkan */
  papanStates: {},
  papanBantu: {},
  tanyaOrders: {},
  tanyaPilih: {},

  /* Tahap 8 — kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 9 — uji terap */
  terapIdx: 0,
  terapStates: [],

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

/* Memastikan state[key] berupa objek (bukan null/array). */
function ensureObject(state, key) {
  if (!state[key] || typeof state[key] !== 'object' || Array.isArray(state[key])) {
    state[key] = {};
  }
}

/* State lambang yang boleh dicoba lagi: { chosen, wrong }. */
function ensureLambangState(states, id) {
  if (!states[id] || typeof states[id] !== 'object') states[id] = { chosen: null, wrong: 0 };
  return states[id];
}

/* Mengacak urutan opsi setiap pertanyaan penuntun ke orders[q.id]. */
function ensureGuidedOrders(orders, list) {
  list.forEach(function (q) {
    ensureShuffledOrder(orders, q.id, q.opsi);
  });
}

/* Kartu urut-ketuk satu papan: [{ id, label(HTML), aria }]. */
function papanItems(p) {
  return p.bilangan.map(function (b) {
    return {
      id: b.id,
      label:
        '<span class="dec-card__val">' +
        esc(b.value) +
        '</span>' +
        (b.nama ? '<span class="dec-card__nama">' + esc(b.nama) + '</span>' : ''),
      aria: b.value + ' ' + p.satuan + (b.nama ? ' (' + b.nama + ')' : ''),
    };
  });
}

/* Urutan id benar satu papan (naik/turun) dihitung dari nilai desimalnya. */
function papanAnswer(p) {
  var urut = urutkanDesimal(
    p.bilangan.map(function (b) {
      return b.value;
    }),
    p.arah === 'turun'
  );
  return urut.map(function (v) {
    for (var i = 0; i < p.bilangan.length; i++) {
      if (p.bilangan[i].value === v) return p.bilangan[i].id;
    }
    return null;
  });
}

function makeTerapState(s) {
  return {
    jawabOrder: shuffleArray(optionIds(s.opsi)),
    alasanOrder: shuffleArray(optionIds(s.alasanOpsi)),
    jawab: null,
    jawabSalah: 0,
    alasan: null,
    alasanSalah: 0,
  };
}

/*
 * Menyiapkan seluruh state per-soal DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  [
    'dugaanOrders',
    'dugaanPilih',
    'tempatOrders',
    'tempatPilih',
    'lambangOrders',
    'lambangStates',
    'temuanOrders',
    'temuanPilih',
    'garisOrders',
    'garisStates',
    'amatiOrders',
    'amatiPilih',
    'bandingOrders',
    'bandingStates',
    'papanStates',
    'papanBantu',
    'tanyaOrders',
    'tanyaPilih',
    'simpulanPilihan',
    'refleksiAnswers',
  ].forEach(function (k) {
    ensureObject(State, k);
  });

  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'pelariOrder', DATA.orientasi.pelari);
  ensureShuffledOrder(State, 'tekaOrder', DATA.orientasi.tekaOpsi);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  ensureShuffledOrder(State, 'strategiOrder', DATA.hipotesis.strategi);
  DATA.hipotesis.dugaan.forEach(function (d) {
    ensureShuffledOrder(State.dugaanOrders, d.id, COMPARE_SYMBOLS);
  });

  /* Tahap 4 */
  DATA.dataTempat.pasangan.forEach(function (p) {
    ensureShuffledOrder(State.tempatOrders, p.id, DATA.dataTempat.opsiTempat);
    ensureShuffledOrder(State.lambangOrders, p.id, COMPARE_SYMBOLS);
    ensureLambangState(State.lambangStates, p.id);
  });
  ensureGuidedOrders(State.temuanOrders, DATA.dataTempat.temuan);

  /* Tahap 5 — urutan bilangan yang ditempatkan diacak */
  DATA.dataGaris.garis.forEach(function (g) {
    ensureShuffledOrder(State.garisOrders, g.id, g.items);
    ensureNumberLinePlacementState(State.garisStates, g.id);
  });
  ensureGuidedOrders(State.amatiOrders, DATA.dataGaris.amati);

  /* Tahap 6 */
  ensureSortStates(State, 'pilahStates', 'pilahOrder', DATA.uji.pilah, DATA.uji.opsiPilah);
  DATA.uji.banding.forEach(function (p) {
    ensureShuffledOrder(State.bandingOrders, p.id, COMPARE_SYMBOLS);
    ensureLambangState(State.bandingStates, p.id);
  });

  /* Tahap 7 — kartu diacak & dijamin tidak sama dengan urutan benar */
  DATA.urutkan.papan.forEach(function (p) {
    ensureTapOrderState(State.papanStates, p.id, papanItems(p), papanAnswer(p));
  });
  ensureGuidedOrders(State.tanyaOrders, DATA.urutkan.tanya);

  /* Tahap 8 */
  ensureShuffledOrder(State, 'bankOrder', DATA.simpulan.bank);

  /* Tahap 9 */
  ensureExerciseArray(State, 'terapStates', DATA.terapkan.soal, makeTerapState);
  if (State.terapIdx >= DATA.terapkan.soal.length || State.terapIdx < 0) State.terapIdx = 0;

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

/*
 * Label opsi di data.js adalah teks biasa (boleh memuat < dan >),
 * sedangkan buildChoiceGroup menyisipkan label sebagai HTML.
 */
function escOpts(list) {
  return list.map(function (o) {
    return { id: o.id, label: esc(o.label) };
  });
}

function escGuided(list) {
  return list.map(function (q) {
    return {
      id: q.id,
      tanya: esc(q.tanya),
      opsi: escOpts(q.opsi),
      correct: q.correct,
      umpan: q.umpan,
    };
  });
}

function escPilah(list) {
  return list.map(function (it) {
    return {
      id: it.id,
      teks: esc(it.teks),
      correct: it.correct,
      explanation: esc(it.explanation),
    };
  });
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

/*
 * Soal lambang yang boleh dicoba lagi: kalimat a ☐ b, tombol <, >, =
 * (urutan acak), umpan balik diagnosa miskonsepsi bila salah dan
 * alasan berbasis nilai tempat bila benar.
 *   group  pembeda antarsoal (data-group); `st` = { chosen, wrong }
 */
function buildLambangTask(group, a, b, order, st) {
  var benarId = simbolBandingDesimal(a, b);
  var benar = st.chosen === benarId;
  var feedback = '';
  if (benar) {
    feedback = buildFeedbackBox(
      'success',
      '✓',
      '<strong>Tepat.</strong> ' + esc(alasanBandingDesimal(a, b))
    );
  } else if (st.chosen) {
    feedback = buildFeedbackBox(
      'warning',
      '💭',
      '<strong>' +
        esc(a + ' ' + compareSymbolText(st.chosen) + ' ' + b) +
        ' belum tepat.</strong> ' +
        esc(pesanDiagnosaDesimal(diagnosaBandingDesimal(a, b, st.chosen), a, b))
    );
  }
  return (
    buildCompareSentenceDesimal(a, b, benar ? benarId : null) +
    '<div class="cmp-symbols">' +
    buildChoiceGroup(COMPARE_SYMBOLS, order, {
      chosen: st.chosen,
      correctId: benar ? benarId : null,
      grade: true,
      locked: benar,
      group: group,
      attr: 'data-lambang',
    }) +
    '</div>' +
    (feedback ? '<div style="margin-top:var(--space-3);">' + feedback + '</div>' : '')
  );
}

/*
 * Memasang event buildLambangTask. `lookup(group)` mengembalikan
 * { a, b, st } untuk soal itu.
 */
function bindLambangTasks(container, lookup, rerender) {
  container.querySelectorAll('[data-lambang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var t = lookup(btn.dataset.group);
      if (!t) return;
      var benarId = simbolBandingDesimal(t.a, t.b);
      if (t.st.chosen === benarId) return;
      t.st.chosen = btn.dataset.lambang;
      if (t.st.chosen !== benarId) t.st.wrong = (t.st.wrong || 0) + 1;
      saveState();
      rerender();
    });
  });
}

function lambangBenar(a, b, st) {
  return st.chosen === simbolBandingDesimal(a, b);
}

/* Banyak soal lambang yang benar pada percobaan pertama. */
function lambangSekaliBenar(list, states) {
  return list.filter(function (p) {
    var st = states[p.id];
    return st && lambangBenar(p.a, p.b, st) && !st.wrong;
  }).length;
}

/* Id opsi tempat yang benar untuk pasangan a, b ('none' bila sama). */
function tempatBenarId(p) {
  var pos = tempatBedaPertama(p.a, p.b);
  return pos === null ? 'none' : String(pos);
}

/* ============================================================
   5. STAGE: ORIENTASI  (Inquiry Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah.
   ============================================================ */

function buildPapanHasil(pelari) {
  return (
    '<div class="scoreboard" role="table" aria-label="Papan hasil lomba lari 100 meter">' +
    '<div class="scoreboard__head" role="row">' +
    '<span role="columnheader">Pelari</span><span role="columnheader">Waktu (detik)</span>' +
    '</div>' +
    pelari
      .map(function (p) {
        return (
          '<div class="scoreboard__row" role="row">' +
          '<span role="cell">' +
          esc(p.nama) +
          '</span>' +
          '<span role="cell" class="scoreboard__time">' +
          esc(p.waktu) +
          '</span>' +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var terisi = !!State.pelariPilihan && !!State.tekaPilihan;

  container.innerHTML =
    '<section aria-label="Orientasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🏃 ' +
        esc(D.judul) +
        '</h2>' +
        '<div class="orientasi-grid">' +
        '<p class="orientasi-cerita">' +
        esc(D.cerita) +
        '</p>' +
        buildPapanHasil(D.pelari) +
        '</div>',
      'panel--hero'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(escOpts(D.pelari), State.pelariOrder, {
          chosen: State.pelariPilihan,
          group: 'pelari',
        })
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🧩 ' +
        esc(D.tekaJudul) +
        '</h3>' +
        '<p>' +
        esc(D.tekaTeks) +
        '</p>' +
        buildCompareSentenceDesimal(D.tekaPasangan[0], D.tekaPasangan[1], null) +
        '<p class="exercise-label">' +
        esc(D.tekaPertanyaan) +
        '</p>' +
        buildChoiceGroup(escOpts(D.tekaOpsi), State.tekaOrder, {
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

  container.querySelectorAll('[data-group="pelari"][data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.pelariPilihan = btn.dataset.optId;
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
    if (!State.pelariPilihan || !State.tekaPilihan) {
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
        buildChoiceGroup(escOpts(D.opsi), State.masalahOrder, {
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
   Strategi dugaan + dugaan lambang (tidak dinilai, boleh diubah).
   ============================================================ */

function dugaanLengkap() {
  return DATA.hipotesis.dugaan.every(function (d) {
    return !!State.dugaanPilih[d.id];
  });
}

function renderHipotesis(container) {
  var D = DATA.hipotesis;

  container.innerHTML =
    '<section aria-label="Merumuskan Hipotesis">' +
    buildHead(D) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiStrategi) +
        '</p>' +
        buildChoiceGroup(escOpts(D.strategi), State.strategiOrder, {
          chosen: State.strategiPilihan,
          group: 'strategi',
        })
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiDugaan) +
        '</p>' +
        '<div class="dugaan-grid">' +
        D.dugaan
          .map(function (d) {
            var chosen = State.dugaanPilih[d.id] || null;
            return (
              '<div class="dugaan-card">' +
              buildCompareSentenceDesimal(d.a, d.b, null).replace(
                'cmp-sentence__sym"',
                'cmp-sentence__sym' + (chosen ? ' is-guess' : '') + '"'
              ) +
              '<div class="cmp-symbols">' +
              buildChoiceGroup(COMPARE_SYMBOLS, State.dugaanOrders[d.id], {
                chosen: chosen,
                group: d.id,
                attr: 'data-dugaan',
              }) +
              '</div>' +
              '</div>'
            );
          })
          .join('') +
        '</div>'
    ) +
    buildDlPanel(
      '<div class="field-group" style="margin:0;">' +
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

  function ulang() {
    renderHipotesis(container);
  }

  container.querySelectorAll('[data-group="strategi"][data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.strategiPilihan = btn.dataset.optId;
      saveState();
      ulang();
    });
  });

  container.querySelectorAll('[data-dugaan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.dugaanPilih[btn.dataset.group] = btn.dataset.dugaan;
      saveState();
      ulang();
    });
  });

  var ta = document.getElementById('hipotesisTeks');
  ta.addEventListener('input', function () {
    State.hipotesisTeks = ta.value;
    saveState();
  });

  document.getElementById('hipotesisNextBtn').addEventListener('click', function () {
    if (!State.strategiPilihan || !dugaanLengkap()) {
      showNotice('Pilih strategi dan duga lambang untuk semua pasangan lebih dulu.');
      return;
    }
    if (!State.hipotesisTeks.trim()) {
      showNotice('Tuliskan hipotesismu dengan kalimatmu sendiri.');
      return;
    }
    completeStage('hipotesis');
    navigateTo('dataTempat');
  });
}

/* ============================================================
   8. STAGE: DATA NILAI TEMPAT  (Inquiry Learning — sintaks 4)
   Pasangan dibuka satu per satu: tentukan tempat pertama yang
   berbeda → tabel menyorot & menyamakan angka → pilih lambang.
   ============================================================ */

function pasanganSelesai(p) {
  return (
    State.tempatPilih[p.id] === tempatBenarId(p) &&
    lambangBenar(p.a, p.b, State.lambangStates[p.id])
  );
}

function renderDataTempat(container) {
  var D = DATA.dataTempat;
  var html = '';
  var semua = true;

  for (var i = 0; i < D.pasangan.length; i++) {
    var p = D.pasangan[i];
    var benarId = tempatBenarId(p);
    var chosen = State.tempatPilih[p.id] || null;
    var tempatOk = chosen === benarId;
    var beda = banyakAngkaDesimal(p.a) !== banyakAngkaDesimal(p.b);

    html += buildDlPanel(
      '<h3 class="pair-title"><span class="dl-step__num">' +
        (i + 1) +
        '</span>Pasangan ' +
        (i + 1) +
        ': ' +
        esc(p.a) +
        ' dan ' +
        esc(p.b) +
        '</h3>' +
        buildPlaceValueCompare(p.a, p.b, { highlight: tempatOk, padZeros: tempatOk }) +
        (tempatOk && beda ? '<p class="dl-caption pad-note">' + esc(D.petunjukPad) + '</p>' : '') +
        '<p class="exercise-label">' +
        esc(D.tanyaTempat) +
        '</p>' +
        buildChoiceGroup(escOpts(D.opsiTempat), State.tempatOrders[p.id], {
          chosen: chosen,
          correctId: tempatOk ? benarId : null,
          grade: true,
          locked: tempatOk,
          group: p.id,
          attr: 'data-tempat',
        }) +
        (chosen && !tempatOk
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              'warning',
              '💭',
              '<strong>Belum tepat.</strong> Tunjuk kolom satu per satu mulai dari kiri. Pada kolom mana angka baris atas dan baris bawah berbeda untuk pertama kali? Tempat yang kosong sama dengan angka 0.'
            ) +
            '</div>'
          : '') +
        (tempatOk
          ? '<p class="exercise-label" style="margin-top:var(--space-4);">' +
            esc(D.tanyaLambang) +
            '</p>' +
            buildLambangTask(p.id, p.a, p.b, State.lambangOrders[p.id], State.lambangStates[p.id])
          : ''),
      pasanganSelesai(p) ? 'panel--compact pair-done' : ''
    );

    if (!pasanganSelesai(p)) {
      semua = false;
      break;
    }
  }

  var temuan = escGuided(D.temuan);
  var temuanOk = guidedQuizAllCorrect(temuan, State.temuanPilih);

  container.innerHTML =
    '<section aria-label="Mengumpulkan Data dengan Nilai Tempat">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    html +
    (semua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">💡 ' +
            esc(D.temuanJudul) +
            '</h3>' +
            buildGuidedQuizList(temuan, State.temuanOrders, State.temuanPilih),
          'panel--warning'
        )
      : '') +
    (semua && temuanOk ? buildDlNextButton('tempatNextBtn', D.nextLabel, true) : '') +
    '</section>';

  function ulang() {
    renderDataTempat(container);
  }

  container.querySelectorAll('[data-tempat]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pid = btn.dataset.group;
      var p = D.pasangan.filter(function (x) {
        return x.id === pid;
      })[0];
      if (!p || State.tempatPilih[pid] === tempatBenarId(p)) return;
      State.tempatPilih[pid] = btn.dataset.tempat;
      saveState();
      ulang();
    });
  });

  bindLambangTasks(
    container,
    function (gid) {
      var p = D.pasangan.filter(function (x) {
        return x.id === gid;
      })[0];
      return p ? { a: p.a, b: p.b, st: State.lambangStates[p.id] } : null;
    },
    ulang
  );

  bindGuidedQuizList(container, temuan, State.temuanPilih, saveState, ulang);
  bindNext('tempatNextBtn', 'dataTempat', 'dataGaris');
}

/* ============================================================
   9. STAGE: DATA GARIS BILANGAN  (Inquiry Learning — sintaks 4)
   Garis dibuka satu per satu; bilangan ditempatkan dalam urutan
   acak. Setelah semua garis selesai, murid menjawab pengamatan.
   ============================================================ */

function garisItems(g) {
  return orderByIds(g.items, State.garisOrders[g.id]);
}

function garisSelesai(g) {
  return numberLinePlacementDone(g.items, State.garisStates[g.id]);
}

function renderDataGaris(container) {
  var D = DATA.dataGaris;
  var html = '';
  var semua = true;

  for (var i = 0; i < D.garis.length; i++) {
    var g = D.garis[i];
    var done = garisSelesai(g);
    html += buildDlPanel(
      '<h3 class="pair-title"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        esc(g.judul) +
        '</h3>' +
        buildDecimalPlacement('garis-' + g.id, garisItems(g), State.garisStates[g.id], {
          min: g.min,
          max: g.max,
          digits: g.digits,
          fixedLabels: g.fixedLabels,
          zoom: done ? g.zoom : null,
          doneText: g.selesai,
        })
    );
    if (!done) {
      semua = false;
      break;
    }
  }

  var amati = escGuided(D.amati);
  var amatiOk = guidedQuizAllCorrect(amati, State.amatiPilih);

  container.innerHTML =
    '<section aria-label="Mengumpulkan Data dengan Garis Bilangan">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    html +
    (semua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🔭 ' +
            esc(D.amatiJudul) +
            '</h3>' +
            buildGuidedQuizList(amati, State.amatiOrders, State.amatiPilih),
          'panel--warning'
        )
      : '') +
    (semua && amatiOk ? buildDlNextButton('garisNextBtn', D.nextLabel, true) : '') +
    '</section>';

  function ulang() {
    renderDataGaris(container);
  }

  D.garis.forEach(function (g) {
    bindDecimalPlacement(
      container,
      'garis-' + g.id,
      garisItems(g),
      State.garisStates[g.id],
      saveState,
      ulang
    );
  });

  bindGuidedQuizList(container, amati, State.amatiPilih, saveState, ulang);
  bindNext('garisNextBtn', 'dataGaris', 'uji');
}

/* ============================================================
   10. STAGE: MENGUJI HIPOTESIS  (Inquiry Learning — sintaks 5)
   A. Hipotesis & dugaan lambang dibandingkan dengan data.
   B. Memilah pernyataan benar/salah.
   C. Menguji strategi pada pasangan baru (lambang + alasan).
   ============================================================ */

function dugaanCocok() {
  return DATA.hipotesis.dugaan.filter(function (d) {
    return State.dugaanPilih[d.id] === simbolBandingDesimal(d.a, d.b);
  }).length;
}

function bandingSemuaBenar() {
  return DATA.uji.banding.every(function (p) {
    return lambangBenar(p.a, p.b, State.bandingStates[p.id]);
  });
}

function renderUji(container) {
  var D = DATA.uji;
  var H = DATA.hipotesis;
  var O = DATA.orientasi;
  var strategiOk = State.strategiPilihan === H.strategiBenar;
  var cocok = dugaanCocok();
  var pilah = escPilah(D.pilah);
  var bukaC = sortItemsAllAnswered(pilah, State.pilahStates);
  var selesai = bukaC && bandingSemuaBenar();
  var tekaOk = State.tekaPilihan === O.tekaBenar;

  var tabel =
    '<div class="table-scroll"><table class="data-table uji-table">' +
    '<thead><tr><th scope="col">Pasangan</th><th scope="col">' +
    esc(D.dugaanLabel) +
    '</th><th scope="col">' +
    esc(D.dataLabel) +
    '</th><th scope="col"><span class="sr-only">Cocok?</span></th></tr></thead><tbody>' +
    H.dugaan
      .map(function (d) {
        var dg = State.dugaanPilih[d.id];
        var dt = simbolBandingDesimal(d.a, d.b);
        var ok = dg === dt;
        return (
          '<tr><td>' +
          esc(d.a + ' ☐ ' + d.b) +
          '</td><td class="uji-table__sym">' +
          esc(dg ? d.a + ' ' + compareSymbolText(dg) + ' ' + d.b : '—') +
          '</td><td class="uji-table__sym">' +
          esc(d.a + ' ' + compareSymbolText(dt) + ' ' + d.b) +
          '</td><td class="' +
          (ok ? 'uji-ok' : 'uji-no') +
          '">' +
          (ok ? '✓ cocok' : '✗ revisi') +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table></div>';

  var partC = '';
  if (bukaC) {
    partC = buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiBanding) +
        '</p>' +
        '<div class="dugaan-grid">' +
        D.banding
          .map(function (p) {
            return (
              '<div class="dugaan-card">' +
              buildLambangTask(
                p.id,
                p.a,
                p.b,
                State.bandingOrders[p.id],
                State.bandingStates[p.id]
              ) +
              '</div>'
            );
          })
          .join('') +
        '</div>'
    );
  }

  container.innerHTML =
    '<section aria-label="Menguji Hipotesis">' +
    buildHead(D) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.hipotesisLabel) +
        '</p>' +
        '<p class="hipotesis-quote">' +
        esc(findOptionLabel(H.strategi, State.strategiPilihan) || '—') +
        '</p>' +
        buildFeedbackBox(
          strategiOk ? 'success' : 'warning',
          strategiOk ? '👏' : '🔄',
          esc(H.tanggapan[State.strategiPilihan] || '')
        ) +
        (State.hipotesisTeks
          ? '<p class="dl-caption" style="margin-top:var(--space-3);">Hipotesis tertulismu: “' +
            esc(State.hipotesisTeks) +
            '”</p>'
          : '') +
        tabel +
        buildFeedbackBox(
          cocok === H.dugaan.length ? 'success' : 'info',
          cocok === H.dugaan.length ? '👏' : '🔄',
          '<strong>' +
            cocok +
            ' dari ' +
            H.dugaan.length +
            ' dugaan lambang cocok dengan data.</strong> ' +
            (tekaOk
              ? 'Dugaanmu untuk teka-teki 0,8 dan 0,75 di Tahap 1 juga tepat!'
              : 'Teka-teki Tahap 1 terjawab: 0,8 > 0,75.')
        ),
      'panel--warning'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiPilah) +
        '</p>' +
        buildSortItems(pilah, State.pilahOrder, D.opsiPilah, State.pilahStates, { mono: true })
    ) +
    partC +
    (selesai ? buildDlNextButton('ujiNextBtn', D.nextLabel, true) : '') +
    '</section>';

  function ulang() {
    renderUji(container);
  }

  bindSortItems(container, pilah, State.pilahStates, saveState, ulang);

  bindLambangTasks(
    container,
    function (gid) {
      var p = D.banding.filter(function (x) {
        return x.id === gid;
      })[0];
      return p ? { a: p.a, b: p.b, st: State.bandingStates[p.id] } : null;
    },
    ulang
  );

  bindNext('ujiNextBtn', 'uji', 'urutkan');
}

/* ============================================================
   11. STAGE: MENGURUTKAN  (Inquiry Learning — sintaks 4–5)
   Siklus inkuiri kedua: papan urut-ketuk dibuka satu per satu,
   tabel nilai tempat tersedia sebagai bantuan, lalu murid
   menjelaskan alasan urutannya.
   ============================================================ */

function papanBenar(p) {
  return !!State.papanStates[p.id].correct;
}

function renderUrutkan(container) {
  var D = DATA.urutkan;
  var html = '';
  var semua = true;

  for (var i = 0; i < D.papan.length; i++) {
    var p = D.papan[i];
    var naik = p.arah === 'naik';
    var nilai = p.bilangan.map(function (b) {
      return b.value;
    });
    var urut = urutkanDesimal(nilai, !naik);
    html += buildDlPanel(
      '<h3 class="pair-title"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        esc(p.judul) +
        ' <span class="dl-caption">(' +
        esc(p.satuan) +
        ')</span></h3>' +
        buildTapOrder('papan-' + p.id, papanItems(p), State.papanStates[p.id], {
          answer: papanAnswer(p),
          startLabel: naik ? 'Terkecil' : 'Terbesar',
          endLabel: naik ? 'Terbesar' : 'Terkecil',
          separator: naik ? '<' : '>',
          successText: '<strong>Urutannya tepat!</strong> ' + esc(urut.join(naik ? ' < ' : ' > ')),
        }) +
        '<details class="dec-help" data-bantu="' +
        esc(p.id) +
        '"' +
        (State.papanBantu[p.id] ? ' open' : '') +
        '>' +
        '<summary>' +
        esc(D.tabelLabel) +
        '</summary>' +
        buildPlaceValueStack(nilai, { highlight: true, padZeros: true }) +
        '</details>'
    );
    if (!papanBenar(p)) {
      semua = false;
      break;
    }
  }

  var tanya = escGuided(D.tanya);
  var tanyaOk = guidedQuizAllCorrect(tanya, State.tanyaPilih);

  container.innerHTML =
    '<section aria-label="Mengurutkan Bilangan Desimal">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    html +
    (semua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🗣️ ' +
            esc(D.tanyaJudul) +
            '</h3>' +
            buildGuidedQuizList(tanya, State.tanyaOrders, State.tanyaPilih),
          'panel--warning'
        )
      : '') +
    (semua && tanyaOk ? buildDlNextButton('urutkanNextBtn', D.nextLabel, true) : '') +
    '</section>';

  function ulang() {
    renderUrutkan(container);
  }

  D.papan.forEach(function (p) {
    bindTapOrder(
      container,
      'papan-' + p.id,
      State.papanStates[p.id],
      papanAnswer(p),
      saveState,
      ulang
    );
  });

  container.querySelectorAll('details[data-bantu]').forEach(function (det) {
    det.addEventListener('toggle', function () {
      State.papanBantu[det.dataset.bantu] = det.open;
      saveState();
    });
  });

  bindGuidedQuizList(container, tanya, State.tanyaPilih, saveState, ulang);
  bindNext('urutkanNextBtn', 'urutkan', 'simpulan');
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
          '<h3 style="margin-top:0;">Rangkuman Membandingkan & Mengurutkan Desimal</h3>' +
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
   Setiap soal: pilih jawaban (boleh coba lagi) → pilih alasan
   (boleh coba lagi). Urutan opsi & alasan diacak di
   initExerciseArrays().
   ============================================================ */

function terapSelesai(i) {
  var s = DATA.terapkan.soal[i];
  var st = State.terapStates[i];
  return st.jawab === s.benar && st.alasan === s.alasanBenar;
}

function terapSempurna() {
  return DATA.terapkan.soal.filter(function (s, i) {
    var st = State.terapStates[i];
    return terapSelesai(i) && !st.jawabSalah && !st.alasanSalah;
  }).length;
}

function renderTerapkan(container) {
  var D = DATA.terapkan;
  var n = D.soal.length;
  var idx = State.terapIdx;
  var s = D.soal[idx];
  var st = State.terapStates[idx];
  var jawabOk = st.jawab === s.benar;
  var alasanOk = st.alasan === s.alasanBenar;
  var done = jawabOk && alasanOk;
  var semua = D.soal.every(function (x, i) {
    return terapSelesai(i);
  });

  var dots = D.soal
    .map(function (x, i) {
      var cls = 'terap-dot';
      if (terapSelesai(i)) cls += ' is-done';
      if (i === idx) cls += ' is-current';
      return (
        '<button type="button" class="' +
        cls +
        '" data-terap-go="' +
        i +
        '" aria-label="Soal ' +
        (i + 1) +
        (terapSelesai(i) ? ', selesai' : '') +
        '"' +
        (i === idx ? ' aria-current="step"' : '') +
        '>' +
        (i + 1) +
        '</button>'
      );
    })
    .join('');

  var body =
    '<div class="dl-prompt">' +
    '<span class="konteks-chip">' +
    esc(s.konteks) +
    '</span>' +
    '<p class="dl-prompt__cerita">' +
    esc(s.cerita) +
    '</p>' +
    '<p class="dl-prompt__tanya">' +
    esc(s.pertanyaan) +
    '</p>' +
    '</div>' +
    buildChoiceGroup(escOpts(s.opsi), st.jawabOrder, {
      chosen: st.jawab,
      correctId: jawabOk ? s.benar : null,
      grade: true,
      locked: jawabOk,
      group: 'jawab',
      attr: 'data-terap-jawab',
    });

  if (st.jawab && !jawabOk) {
    body +=
      '<div style="margin-top:var(--space-3);">' +
      buildFeedbackBox(
        'warning',
        '💭',
        '<strong>Belum tepat.</strong> Samakan dulu banyak angka di belakang koma, lalu bandingkan mulai dari nilai tempat paling kiri. Bayangkan juga letaknya pada garis bilangan.'
      ) +
      '</div>';
  }

  if (jawabOk) {
    body +=
      '<p class="exercise-label" style="margin-top:var(--space-5);">' +
      esc(D.tanyaAlasan) +
      '</p>' +
      buildChoiceGroup(escOpts(s.alasanOpsi), st.alasanOrder, {
        chosen: st.alasan,
        correctId: alasanOk ? s.alasanBenar : null,
        grade: true,
        locked: alasanOk,
        group: 'alasan',
        attr: 'data-terap-alasan',
      });
    if (st.alasan) {
      body +=
        '<div style="margin-top:var(--space-3);">' +
        (alasanOk
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Jawaban dan alasanmu tepat.</strong>' +
                (st.jawabSalah || st.alasanSalah
                  ? ' Kamu berhasil setelah mencoba lagi — bagus!'
                  : ' Tepat pada percobaan pertama!')
            )
          : buildFeedbackBox(
              'warning',
              '💭',
              '<strong>Alasan ini belum tepat.</strong> Jawabanmu sudah benar, tetapi pilih alasan yang membandingkan nilai tempat dengan benar.'
            )) +
        '</div>';
    }
  }

  var nav =
    '<div class="btn-group btn-group--spread">' +
    '<button type="button" class="btn btn--ghost" id="terapPrev"' +
    (idx === 0 ? ' disabled' : '') +
    '>← Sebelumnya</button>' +
    (idx < n - 1
      ? '<button type="button" class="btn btn--primary" id="terapNext"' +
        (done ? '' : ' disabled') +
        '>Soal Berikutnya →</button>'
      : '<button type="button" class="btn btn--primary" id="terapFinish"' +
        (semua ? '' : ' disabled') +
        '>' +
        esc(D.nextLabel) +
        '</button>') +
    '</div>';

  container.innerHTML =
    '<section aria-label="Uji Terap">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    '<nav class="terap-dots" aria-label="Nomor soal">' +
    dots +
    '</nav>' +
    buildDlPanel(
      '<p class="dl-caption" style="margin-top:0;">Soal ' +
        (idx + 1) +
        ' dari ' +
        n +
        '</p>' +
        body,
      'dl-exercise'
    ) +
    nav +
    '</section>';

  function ulang() {
    renderTerapkan(container);
  }

  container.querySelectorAll('[data-terap-jawab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (st.jawab === s.benar) return;
      st.jawab = btn.dataset.terapJawab;
      if (st.jawab !== s.benar) st.jawabSalah += 1;
      saveState();
      ulang();
    });
  });

  container.querySelectorAll('[data-terap-alasan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (st.alasan === s.alasanBenar) return;
      st.alasan = btn.dataset.terapAlasan;
      if (st.alasan !== s.alasanBenar) st.alasanSalah += 1;
      saveState();
      ulang();
    });
  });

  container.querySelectorAll('[data-terap-go]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.terapIdx = parseInt(btn.dataset.terapGo, 10);
      saveState();
      ulang();
    });
  });

  var prev = document.getElementById('terapPrev');
  if (prev) {
    prev.addEventListener('click', function () {
      State.terapIdx = Math.max(0, idx - 1);
      saveState();
      ulang();
    });
  }
  var next = document.getElementById('terapNext');
  if (next) {
    next.addEventListener('click', function () {
      State.terapIdx = Math.min(n - 1, idx + 1);
      saveState();
      ulang();
    });
  }
  var finish = document.getElementById('terapFinish');
  if (finish) {
    finish.addEventListener('click', function () {
      completeStage('terapkan');
      navigateTo('refleksi');
    });
  }
}

/* ============================================================
   14. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var H = DATA.hipotesis;
  var lambangSekali =
    lambangSekaliBenar(DATA.dataTempat.pasangan, State.lambangStates) +
    lambangSekaliBenar(DATA.uji.banding, State.bandingStates);
  var lambangTotal = DATA.dataTempat.pasangan.length + DATA.uji.banding.length;
  var pilahBenar = sortItemsCorrectCount(DATA.uji.pilah, State.pilahStates);
  var urutSekali = DATA.urutkan.papan.filter(function (p) {
    var st = State.papanStates[p.id];
    return st.correct && st.attempts === 1;
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
        kartu(dugaanCocok() + '/' + H.dugaan.length, 'Dugaan lambang awal yang terbukti') +
        kartu(lambangSekali + '/' + lambangTotal, 'Perbandingan benar pada percobaan pertama') +
        kartu(pilahBenar + '/' + DATA.uji.pilah.length, 'Pernyataan dipilah benar') +
        kartu(urutSekali + '/' + DATA.urutkan.papan.length, 'Urutan tepat sekali periksa') +
        kartu(
          terapSempurna() + '/' + DATA.terapkan.soal.length,
          'Uji terap: jawaban & alasan tepat sekali coba'
        ) +
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
        buildChoiceGroup(escOpts(D.diriOpsi), State.refleksiDiriOrder, {
          chosen: State.refleksiDiri,
        })
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
    '<div class="aturan-card"><span class="aturan-card__label">1 · Nilai tempat</span>0,<mark>8</mark> &gt; 0,<mark>7</mark>5</div>' +
    '<div class="aturan-card"><span class="aturan-card__label">2 · Samakan angka</span>0,8 = 0,80</div>' +
    '<div class="aturan-card"><span class="aturan-card__label">3 · Garis bilangan</span>lebih kanan → lebih besar</div>' +
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
    'Kemampuan murid menjelaskan dengan kata-kata sendiri mengapa 0,8 &gt; 0,75 dan bagaimana mengurutkan beberapa desimal tetap menjadi bahan penilaian utama.' +
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
  dataTempat: renderDataTempat,
  dataGaris: renderDataGaris,
  uji: renderUji,
  urutkan: renderUrutkan,
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
