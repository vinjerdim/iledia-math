'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Konsep Barisan Aritmetika & Beda
   Fase F — SMK Rekayasa Perangkat Lunak, Inquiry Learning

   Utilitas & komponen bersama berada di shared/engine.js:
     • mesin tahap, store, latihan soal (createStageMachine,
       createStore, createExerciseStage, ensureExerciseArray);
     • komponen penemuan/inkuiri (ensureShuffledOrder, orderByIds,
       buildDiscoveryHead, buildTeacherNote, buildChoiceGroup,
       buildSequenceTiles, buildDlStep, ensureSortStates,
       buildSortItems, buildGuidedQuizList);
     • seksi 32 — barisan aritmetika: fmtSuku, bedaBarisan,
       pelacak selisih (buildSelisihTracker) dan lab barisan
       (buildLabBarisan).

   Alur tahap mengikuti sintaks Inquiry Learning; lihat komentar
   kepala data.js untuk pemetaan dan rangkaian aktivitasnya.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI saat
   state disiapkan (initExerciseArrays), lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat-lompat
   ketika tahap dirender ulang, tetapi teracak ulang setiap Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi             (IL sintaks 1)
    6. Stage: Merumuskan Masalah    (IL sintaks 2)
    7. Stage: Merumuskan Hipotesis  (IL sintaks 3)
    8. Stage: Data Selisih          (IL sintaks 4)
    9. Stage: Lab Barisan           (IL sintaks 4)
   10. Stage: Menguji Hipotesis     (IL sintaks 5)
   11. Stage: Merumuskan Kesimpulan (IL sintaks 6)
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

var STAGES = DATA.tahap.map(function (t) {
  return t.id;
});
var STAGE_LABELS = DATA.tahap.map(function (t) {
  return t.label;
});
var STORAGE_KEY = 'mpi-f-1-1-barisan-aritmetika-il-v3';

/* Teks barisan untuk butir pemilahan: "7, 11, 15, …" atau "1,5; 2; 2,5; …". */
function teksBarisan(terms) {
  var adaDesimal = terms.some(function (t) {
    return !Number.isInteger(t);
  });
  return (
    terms
      .map(function (t) {
        return fmtSuku(t);
      })
      .join(adaDesimal ? '; ' : ', ') + (adaDesimal ? '; …' : ', …')
  );
}

/* Butir pemilahan dalam bentuk { id, teks, correct, explanation }. */
var PILAH_ITEMS = DATA.uji.pilah.map(function (p) {
  return { id: p.id, teks: teksBarisan(p.terms), correct: p.correct, explanation: p.explanation };
});

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

  /* Tahap 2 — merumuskan masalah */
  masalahOrders: {},
  masalahPilih: {},
  masalahTulis: '',

  /* Tahap 3 — merumuskan hipotesis (tidak dinilai) */
  strategiOrder: null,
  strategiPilihan: null,
  dugaanOrders: {},
  dugaanPilih: {},
  hipotesisTeks: '',

  /* Tahap 4 — data selisih */
  selisihIdx: 0,
  selisihStates: {},
  temuanSelisihOrders: {},
  temuanSelisihPilih: {},

  /* Tahap 5 — lab barisan */
  lab: null,
  temuanLabOrders: {},
  temuanLabPilih: {},

  /* Tahap 6 — menguji hipotesis */
  keputusanOrder: null,
  keputusan: null,
  pilahStates: {},
  pilahOrder: null,
  bedaSteps: [],
  pernyataanStates: {},
  pernyataanOrder: null,

  /* Tahap 7 — merumuskan kesimpulan */
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

/* Mengacak opsi setiap pertanyaan { id, opsi } ke map urutan per id. */
function siapkanUrutan(map, list) {
  list.forEach(function (q) {
    ensureShuffledOrder(map, q.id, q.opsi);
  });
}

function pastikanObjek(key) {
  if (!State[key] || typeof State[key] !== 'object' || Array.isArray(State[key])) {
    State[key] = {};
  }
}

/*
 * Menyiapkan seluruh state per-aktivitas DAN seluruh urutan acak
 * pilihan jawaban. Dipanggil sekali saat init (setelah loadState) dan
 * setiap kali progress direset.
 */
function initExerciseArrays() {
  [
    'masalahOrders',
    'masalahPilih',
    'dugaanOrders',
    'dugaanPilih',
    'selisihStates',
    'temuanSelisihOrders',
    'temuanSelisihPilih',
    'temuanLabOrders',
    'temuanLabPilih',
    'simpulanPilihan',
    'refleksiAnswers',
  ].forEach(pastikanObjek);

  /* Tahap 1–3 */
  ensureShuffledOrder(State, 'orientasiOrder', DATA.orientasi.opsi);
  siapkanUrutan(State.masalahOrders, [DATA.masalah.pertanyaan]);
  ensureShuffledOrder(State, 'strategiOrder', DATA.hipotesis.strategi);
  siapkanUrutan(State.dugaanOrders, DATA.hipotesis.dugaan);

  /* Tahap 4 */
  DATA.dataSelisih.barisan.forEach(function (b) {
    ensureSelisihState(State.selisihStates, b.id, b.terms);
  });
  if (State.selisihIdx < 0 || State.selisihIdx >= DATA.dataSelisih.barisan.length) {
    State.selisihIdx = 0;
  }
  siapkanUrutan(State.temuanSelisihOrders, DATA.dataSelisih.temuan);

  /* Tahap 5 */
  if (!State.lab || typeof State.lab.a !== 'number' || typeof State.lab.b !== 'number') {
    State.lab = makeLabBarisan(DATA.dataLab.awal.a, DATA.dataLab.awal.b);
    catatLabBarisan(State.lab);
  }
  siapkanUrutan(State.temuanLabOrders, DATA.dataLab.temuan);

  /* Tahap 6 */
  ensureShuffledOrder(State, 'keputusanOrder', DATA.uji.keputusanOpsi);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', DATA.uji.pilah, DATA.uji.opsiPilah);
  ensureExerciseArray(State, 'bedaSteps', DATA.uji.beda, makeDlStep);
  ensureSortStates(
    State,
    'pernyataanStates',
    'pernyataanOrder',
    DATA.uji.pernyataan,
    DATA.uji.opsiPernyataan
  );

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

function lanjut(dari, ke) {
  completeStage(dari);
  navigateTo(ke);
}

/* ============================================================
   4. UTILITAS RENDER
   ============================================================ */

/* Kepala tahap + catatan peran guru. */
function buildHead(D) {
  return buildDiscoveryHead(D.kicker, D.goal, D.syntax) + buildTeacherNote(D.guru);
}

var panel = buildDlPanel;
var nextButton = buildDlNextButton;

/* Kartu satu barisan: judul + kartu suku. */
function kartuBarisan(b) {
  return (
    '<div class="bar-kartu">' +
    '<p class="bar-kartu__judul">' +
    esc(b.judul) +
    (b.satuan ? ' <span class="bar-kartu__satuan">(' + esc(b.satuan) + ')</span>' : '') +
    '</p>' +
    buildSequenceTiles(b.terms, { format: fmtSuku, more: true }) +
    '</div>'
  );
}

function textarea(id, value, placeholder, attr) {
  return (
    '<textarea id="' +
    id +
    '" class="input-textarea" ' +
    (attr || '') +
    ' placeholder="' +
    esc(placeholder) +
    '">' +
    esc(value || '') +
    '</textarea>'
  );
}

function bindTextarea(root, id, onInput) {
  var ta = root.querySelector('#' + id);
  if (ta) {
    ta.addEventListener('input', function () {
      onInput(ta.value);
      saveState();
    });
  }
}

/* ============================================================
   5. STAGE: ORIENTASI  (Inquiry Learning — sintaks 1)
   ============================================================ */

function renderOrientasi(container) {
  var D = DATA.orientasi;

  container.innerHTML =
    '<section aria-label="Orientasi">' +
    buildHead(D) +
    panel(
      '<h2 class="bar-judul">' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<div class="bar-papan">' +
        D.barisan.map(kartuBarisan).join('') +
        '</div>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    panel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.orientasiOrder, { chosen: State.orientasiPilihan }) +
        '<label for="orientasiAlasan" class="dl-refleksi-q bar-label-atas">' +
        esc(D.alasanLabel) +
        '</label>' +
        textarea('orientasiAlasan', State.orientasiAlasan, D.alasanPlaceholder) +
        '<p class="dl-caption">' +
        esc(D.catatan) +
        '</p>'
    ) +
    nextButton('orientasiNextBtn', D.nextLabel, true) +
    '</section>';

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.orientasiPilihan = btn.dataset.optId;
      saveState();
      renderOrientasi(container);
    });
  });
  bindTextarea(container, 'orientasiAlasan', function (v) {
    State.orientasiAlasan = v;
  });
  document.getElementById('orientasiNextBtn').addEventListener('click', function () {
    if (!State.orientasiPilihan) {
      showNotice('Pilih dulu dugaanmu.');
      return;
    }
    if (State.orientasiAlasan.trim().length < 5) {
      showNotice('Tulis alasan dugaanmu terlebih dahulu.');
      return;
    }
    lanjut('orientasi', 'masalah');
  });
}

/* ============================================================
   6. STAGE: MERUMUSKAN MASALAH  (Inquiry Learning — sintaks 2)
   ============================================================ */

function renderMasalah(container) {
  var D = DATA.masalah;
  var list = [D.pertanyaan];
  var benar = guidedQuizAllCorrect(list, State.masalahPilih);

  container.innerHTML =
    '<section aria-label="Merumuskan Masalah">' +
    buildHead(D) +
    panel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    panel(buildGuidedQuizList(list, State.masalahOrders, State.masalahPilih)) +
    (benar
      ? panel(
          '<label for="masalahTulis" class="dl-refleksi-q">' +
            esc(D.tulisLabel) +
            '</label>' +
            textarea('masalahTulis', State.masalahTulis, D.tulisPlaceholder)
        ) + nextButton('masalahNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindGuidedQuizList(container, list, State.masalahPilih, saveState, function () {
    renderMasalah(container);
  });
  bindTextarea(container, 'masalahTulis', function (v) {
    State.masalahTulis = v;
  });
  var nextBtn = document.getElementById('masalahNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      lanjut('masalah', 'hipotesis');
    });
  }
}

/* ============================================================
   7. STAGE: MERUMUSKAN HIPOTESIS  (Inquiry Learning — sintaks 3)
   Semua pilihan di sini adalah DUGAAN: tidak dinilai, hanya
   ditandai terpilih, lalu diuji pada tahap Uji Hipotesis.
   ============================================================ */

function hipotesisLengkap() {
  var D = DATA.hipotesis;
  return (
    !!State.strategiPilihan &&
    D.dugaan.every(function (q) {
      return !!State.dugaanPilih[q.id];
    }) &&
    State.hipotesisTeks.trim().length >= D.minPanjang
  );
}

function barisanOrientasi(id) {
  for (var i = 0; i < DATA.orientasi.barisan.length; i++) {
    if (DATA.orientasi.barisan[i].id === id) return DATA.orientasi.barisan[i];
  }
  return null;
}

function renderHipotesis(container) {
  var D = DATA.hipotesis;

  container.innerHTML =
    '<section aria-label="Merumuskan Hipotesis">' +
    buildHead(D) +
    panel(
      '<p class="exercise-label"><span class="dl-step__num">1</span>' +
        esc(D.strategiTanya) +
        '</p>' +
        buildChoiceGroup(D.strategi, State.strategiOrder, {
          chosen: State.strategiPilihan,
          group: 'strategi',
          attr: 'data-strategi',
        })
    ) +
    D.dugaan
      .map(function (q, i) {
        return panel(
          '<p class="exercise-label"><span class="dl-step__num">' +
            (i + 2) +
            '</span>' +
            esc(q.tanya) +
            '</p>' +
            kartuBarisan(barisanOrientasi(q.barisan)) +
            buildChoiceGroup(q.opsi, State.dugaanOrders[q.id], {
              chosen: State.dugaanPilih[q.id] || null,
              group: q.id,
              attr: 'data-dugaan',
            })
        );
      })
      .join('') +
    panel(
      '<label for="hipotesisTeks" class="dl-refleksi-q">' +
        esc(D.tulisLabel) +
        '</label>' +
        textarea('hipotesisTeks', State.hipotesisTeks, D.tulisPlaceholder) +
        '<p class="dl-caption">Hipotesis boleh salah — kamu akan mengujinya dengan data.</p>'
    ) +
    nextButton('hipotesisNextBtn', D.nextLabel, true) +
    '</section>';

  container.querySelectorAll('[data-strategi]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.strategiPilihan = btn.dataset.strategi;
      saveState();
      renderHipotesis(container);
    });
  });
  container.querySelectorAll('[data-dugaan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.dugaanPilih[btn.dataset.group] = btn.dataset.dugaan;
      saveState();
      renderHipotesis(container);
    });
  });
  bindTextarea(container, 'hipotesisTeks', function (v) {
    State.hipotesisTeks = v;
  });
  document.getElementById('hipotesisNextBtn').addEventListener('click', function () {
    if (!hipotesisLengkap()) {
      showNotice('Jawab semua dugaan dan tulis hipotesismu (minimal satu kalimat).');
      return;
    }
    lanjut('hipotesis', 'dataSelisih');
  });
}

/* ============================================================
   8. STAGE: DATA SELISIH  (Inquiry Learning — sintaks 4)
   ============================================================ */

function selisihSemuaSelesai() {
  return DATA.dataSelisih.barisan.every(function (b) {
    return selisihTrackerSelesai(State.selisihStates[b.id]);
  });
}

/* Indeks barisan berikutnya yang belum selesai; −1 bila semua selesai. */
function barisanSelisihBerikutnya(idx) {
  var list = DATA.dataSelisih.barisan;
  for (var k = 1; k <= list.length; k++) {
    var j = (idx + k) % list.length;
    if (!selisihTrackerSelesai(State.selisihStates[list[j].id])) return j;
  }
  return -1;
}

/* Rekap data: satu baris per barisan berisi daftar selisihnya. */
function buildTabelSelisih() {
  return (
    '<div class="bar-tabel-wrap"><table class="bar-tabel">' +
    '<thead><tr><th scope="col">Barisan</th><th scope="col">Selisih berurutan</th></tr></thead><tbody>' +
    DATA.dataSelisih.barisan
      .map(function (b) {
        return (
          '<tr><th scope="row">' +
          esc(b.judul) +
          '</th><td class="bar-tabel__mono">' +
          selisihBerurutan(b.terms)
            .map(function (d) {
              return (d > 0 ? '+' : '') + fmtSuku(d);
            })
            .join(', ') +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table></div>'
  );
}

function renderDataSelisih(container) {
  var D = DATA.dataSelisih;
  var idx = State.selisihIdx;
  var b = D.barisan[idx];
  var st = State.selisihStates[b.id];
  var semua = selisihSemuaSelesai();
  var temuanBenar = semua && guidedQuizAllCorrect(D.temuan, State.temuanSelisihPilih);
  var nextCtx = barisanSelisihBerikutnya(idx);

  var tabs = D.barisan
    .map(function (x, i) {
      var done = selisihTrackerSelesai(State.selisihStates[x.id]);
      return (
        '<button type="button" class="ctx-tab' +
        (i === idx ? ' is-active' : '') +
        (done ? ' is-done' : '') +
        '" data-ctx="' +
        i +
        '"' +
        (i === idx ? ' aria-current="true"' : '') +
        '>' +
        (done ? '✓ ' : '') +
        'Barisan ' +
        (i + 1) +
        '</button>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Mengumpulkan Data Selisih">' +
    buildHead(D) +
    panel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    '<div class="ctx-tabs" role="group" aria-label="Pilih barisan">' +
    tabs +
    '</div>' +
    panel(
      '<p class="bar-kartu__judul">' +
        esc(b.judul) +
        (b.satuan ? ' <span class="bar-kartu__satuan">(' + esc(b.satuan) + ')</span>' : '') +
        '</p>' +
        buildSelisihTracker('sel', b.terms, st, { satuan: b.satuan }) +
        (selisihTrackerSelesai(st) && nextCtx !== -1
          ? '<div class="btn-group btn-group--end"><button type="button" class="btn btn--outline-primary" id="selNextCtx">Lanjut ke Barisan ' +
            (nextCtx + 1) +
            ' →</button></div>'
          : '')
    ) +
    (semua
      ? panel(
          '<h3 style="margin-top:0;">Tabel data selisih</h3>' +
            buildTabelSelisih() +
            '<h3>Apa yang kamu temukan?</h3>' +
            buildGuidedQuizList(D.temuan, State.temuanSelisihOrders, State.temuanSelisihPilih)
        )
      : '') +
    (temuanBenar ? nextButton('dataSelisihNextBtn', D.nextLabel, true) : '') +
    '</section>';

  function ulang() {
    renderDataSelisih(container);
  }

  container.querySelectorAll('[data-ctx]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.selisihIdx = +btn.dataset.ctx;
      saveState();
      ulang();
    });
  });
  bindSelisihTracker(container, 'sel', b.terms, st, saveState, ulang);
  var nc = document.getElementById('selNextCtx');
  if (nc) {
    nc.addEventListener('click', function () {
      State.selisihIdx = nextCtx;
      saveState();
      ulang();
    });
  }
  if (semua) {
    bindGuidedQuizList(container, D.temuan, State.temuanSelisihPilih, saveState, ulang);
  }
  var nextBtn = document.getElementById('dataSelisihNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      lanjut('dataSelisih', 'dataLab');
    });
  }
}

/* ============================================================
   9. STAGE: LAB BARISAN  (Inquiry Learning — sintaks 4)
   ============================================================ */

function renderDataLab(container) {
  var D = DATA.dataLab;
  var labOpts = { n: D.n, rangeA: D.rangeA, rangeB: D.rangeB };
  var lengkap = labBarisanLengkap(State.lab);
  var temuanBenar = lengkap && guidedQuizAllCorrect(D.temuan, State.temuanLabPilih);

  container.innerHTML =
    '<section aria-label="Lab Barisan">' +
    buildHead(D) +
    panel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    panel(buildLabBarisan('lab', State.lab, labOpts)) +
    (lengkap
      ? panel(
          '<h3 style="margin-top:0;">Apa yang kamu temukan?</h3>' +
            buildGuidedQuizList(D.temuan, State.temuanLabOrders, State.temuanLabPilih)
        )
      : panel('<p style="margin:0;">🔒 ' + esc(D.belumLengkap) + '</p>', 'panel--compact')) +
    (temuanBenar ? nextButton('dataLabNextBtn', D.nextLabel, true) : '') +
    '</section>';

  function ulang() {
    renderDataLab(container);
  }

  bindLabBarisan(
    container,
    'lab',
    State.lab,
    saveState,
    function () {
      /* Lab merender dirinya sendiri; tahap dirender ulang hanya saat temuan baru terbuka. */
      if (!lengkap && labBarisanLengkap(State.lab)) ulang();
    },
    labOpts
  );
  if (lengkap) {
    bindGuidedQuizList(container, D.temuan, State.temuanLabPilih, saveState, ulang);
  }
  var nextBtn = document.getElementById('dataLabNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      lanjut('dataLab', 'uji');
    });
  }
}

/* ============================================================
   10. STAGE: MENGUJI HIPOTESIS  (Inquiry Learning — sintaks 5)
   A. Bandingkan dugaan & hipotesis dengan data, putuskan.
   B. Pilah barisan aritmetika / bukan.
   C. Tentukan beda.
   D. Nilai pernyataan (miskonsepsi).
   ============================================================ */

function ujiBedaSelesai() {
  return State.bedaSteps.every(function (s) {
    return s.done;
  });
}

function buildBandingHipotesis() {
  var H = DATA.hipotesis;
  var O = DATA.orientasi;
  var baris = [
    {
      label: 'Dugaan di Orientasi',
      dugaan: findOptionLabel(O.opsi, State.orientasiPilihan) || '—',
      cocok: State.orientasiPilihan === 'kuota',
      data: 'Hanya kuota (selisih −8, tetap) yang berubah seperti port (selisih +5, tetap). Selisih pengguna aktif berubah-ubah.',
    },
    {
      label: 'Ciri yang kamu duga',
      dugaan: findOptionLabel(H.strategi, State.strategiPilihan) || '—',
      cocok: State.strategiPilihan === 'selisih',
      data: H.evaluasi[State.strategiPilihan] || '',
    },
  ];
  H.dugaan.forEach(function (q) {
    var b = barisanOrientasi(q.barisan);
    var beda = bedaBarisan(b.terms);
    baris.push({
      label: 'Perubahan ' + b.judul.charAt(0).toLowerCase() + b.judul.slice(1),
      dugaan: findOptionLabel(q.opsi, State.dugaanPilih[q.id]) || '—',
      cocok: State.dugaanPilih[q.id] === q.benar,
      data: 'Selisihnya selalu ' + (beda > 0 ? '+' : '') + fmtSuku(beda) + '.',
    });
  });

  return (
    '<div class="bar-banding">' +
    baris
      .map(function (r) {
        return (
          '<div class="bar-banding__row bar-banding__row--' +
          (r.cocok ? 'cocok' : 'beda') +
          '">' +
          '<p class="bar-banding__label">' +
          esc(r.label) +
          '</p>' +
          '<p class="bar-banding__dugaan"><span>Dugaanmu:</span> ' +
          esc(r.dugaan) +
          '</p>' +
          '<p class="bar-banding__data"><span>' +
          (r.cocok ? '✓ Sesuai data' : '✗ Belum sesuai data') +
          ':</span> ' +
          r.data +
          '</p>' +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    (State.hipotesisTeks
      ? '<p class="bar-kutip"><strong>Hipotesismu:</strong> “' + esc(State.hipotesisTeks) + '”</p>'
      : '')
  );
}

function renderUji(container) {
  var D = DATA.uji;
  var pilahSelesai = sortItemsAllAnswered(D.pilah, State.pilahStates);
  var bedaSelesai = pilahSelesai && ujiBedaSelesai();
  var pernyataanSelesai = bedaSelesai && sortItemsAllAnswered(D.pernyataan, State.pernyataanStates);

  var bedaHTML = D.beda
    .map(function (step, i) {
      return buildDlStep('beda' + i, State.bedaSteps[i], step, i + 1);
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Menguji Hipotesis">' +
    buildHead(D) +
    panel(
      '<h3 style="margin-top:0;">A. Bandingkan hipotesis dengan data</h3>' +
        buildBandingHipotesis() +
        '<p class="exercise-label" style="margin-top:var(--space-4);">' +
        esc(D.keputusanTanya) +
        '</p>' +
        buildChoiceGroup(D.keputusanOpsi, State.keputusanOrder, {
          chosen: State.keputusan,
          group: 'keputusan',
          attr: 'data-keputusan',
        })
    ) +
    panel(
      '<h3 style="margin-top:0;">B. ' +
        esc(D.pilahInstruksi) +
        '</h3>' +
        buildSortItems(PILAH_ITEMS, State.pilahOrder, D.opsiPilah, State.pilahStates, {
          mono: true,
        })
    ) +
    (pilahSelesai
      ? panel('<h3 style="margin-top:0;">C. ' + esc(D.bedaInstruksi) + '</h3>' + bedaHTML)
      : '') +
    (bedaSelesai
      ? panel(
          '<h3 style="margin-top:0;">D. ' +
            esc(D.pernyataanInstruksi) +
            '</h3>' +
            buildSortItems(
              D.pernyataan,
              State.pernyataanOrder,
              D.opsiPernyataan,
              State.pernyataanStates
            )
        )
      : '') +
    (pernyataanSelesai
      ? '<div class="btn-group btn-group--spread">' +
        '<span class="dl-caption" style="align-self:center;">Pemilahan benar: ' +
        sortItemsCorrectCount(D.pilah, State.pilahStates) +
        '/' +
        D.pilah.length +
        ' · pernyataan benar: ' +
        sortItemsCorrectCount(D.pernyataan, State.pernyataanStates) +
        '/' +
        D.pernyataan.length +
        '</span>' +
        '<button type="button" class="btn btn--primary btn--large" id="ujiNextBtn">' +
        esc(D.nextLabel) +
        '</button></div>'
      : '') +
    '</section>';

  function ulang() {
    renderUji(container);
  }

  container.querySelectorAll('[data-keputusan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.keputusan = btn.dataset.keputusan;
      saveState();
      ulang();
    });
  });
  bindSortItems(container, D.pilah, State.pilahStates, saveState, ulang);
  if (pilahSelesai) {
    D.beda.forEach(function (step, i) {
      bindDlStep('beda' + i, State.bedaSteps[i], step, saveState, ulang);
    });
  }
  if (bedaSelesai) {
    bindSortItems(container, D.pernyataan, State.pernyataanStates, saveState, ulang);
  }
  var nextBtn = document.getElementById('ujiNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.keputusan) {
        showNotice('Pilih dulu keputusanmu tentang hipotesis awal (bagian A).');
        return;
      }
      lanjut('uji', 'simpulan');
    });
  }
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali data yang kamu kumpulkan, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Merumuskan Kesimpulan">' +
    buildHead(D) +
    panel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    panel(
      kalimatHTML +
        (benarSemua
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah konsep yang kamu temukan lewat penyelidikan.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? panel(
          '<h3 style="margin-top:0;">Rangkuman Barisan Aritmetika</h3>' +
            '<div class="formula-card"><span class="formula-card__label">Beda</span>b = Uₙ − Uₙ₋₁</div>' +
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
        ) + nextButton('simpulanNextBtn', D.nextLabel, true)
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
        showNotice('Lengkapi keempat kalimat lebih dulu.');
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
      else if (!simpulanSemuaBenar()) {
        showNotice('Masih ada yang belum tepat. Periksa tanda merahnya.');
      }
      renderSimpulan(container);
    });
  }

  var nextBtn = document.getElementById('simpulanNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      lanjut('simpulan', 'terapkan');
    });
  }
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
  revealButtonStyle: 'separate',
  invalidMessage: 'Tulis jawaban berupa bilangan bulat, mis. 7 atau −2.',
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
  var benarPilah = sortItemsCorrectCount(DATA.uji.pilah, State.pilahStates);
  var benarTerap = State.terapkanExercises.filter(function (e) {
    return e.correct;
  }).length;
  var barisanSekali = DATA.dataSelisih.barisan.filter(function (b) {
    var st = State.selisihStates[b.id];
    return st.attempts === 1 && selisihTrackerSelesai(st);
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
    panel(
      '<div class="summary-grid">' +
        kartu(
          barisanSekali + '/' + DATA.dataSelisih.barisan.length,
          'Barisan yang selisihnya benar sekali periksa'
        ) +
        kartu(benarPilah + '/' + DATA.uji.pilah.length, 'Pemilahan barisan benar') +
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
          textarea(
            'ref-' + q.id,
            State.refleksiAnswers[q.id],
            q.placeholder,
            'data-rid="' + q.id + '"'
          ) +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    panel(
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
    lanjut('refleksi', 'selesai');
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
    '<div class="formula-card"><span class="formula-card__label">Ciri barisan aritmetika</span>Selisih berurutan selalu tetap</div>' +
    '<div class="formula-card"><span class="formula-card__label">Beda</span>b = Uₙ − Uₙ₋₁</div>' +
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
    buildFeedbackBox('info', '🔭', '<strong>Rasa ingin tahu:</strong> ' + esc(D.berikutnya)) +
    '<div class="feedback-box feedback-box--info done-card__note">' +
    '<span class="feedback-box__icon">📌</span>' +
    '<div class="feedback-box__body">' +
    '<strong>Catatan untuk Guru:</strong><br>' +
    'Rekap pada tahap Refleksi adalah indikator latihan digital, bukan nilai akhir. ' +
    'Kualitas hipotesis, cara murid mengujinya dengan data, dan penjelasan kesimpulannya tetap menjadi bahan penilaian utama.' +
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
  dataSelisih: renderDataSelisih,
  dataLab: renderDataLab,
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
