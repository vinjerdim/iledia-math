'use strict';

/* ============================================================
   app.js — Logika media pembelajaran
   Perkalian & Pembagian Bilangan Berpangkat pada Bentuk Aljabar
   Fase D — SMP Kelas VIII · Topik 13 Operasi Bilangan Berpangkat dan
   Bentuk Akar, Discovery Learning

   Struktur:
     1. Konstanta
     2. State & storage (+ pengacakan semua pilihan jawaban)
     3. Navigasi
     4. Utilitas render
     5–13. Renderer tiap tahap
     14. Router render
     15. Modal reset
     16. Init

   Seluruh komponen umum berasal dari shared/engine.js: tabel pangkat,
   tabel eksplorasi pola, ubin faktor & lab uji sifat eksponen (seksi
   27), isian & diagnosa monomial (seksi 39), ubin faktor bentuk
   aljabar, langkah pembahasan, diagnosa & opsi berpengecoh kali/bagi
   (seksi 81), serta langkah isian, pemilahan, dan pertanyaan penuntun.

   Seluruh pilihan jawaban DIACAK sekali saat state disiapkan
   (initExerciseArrays) lalu urutannya disimpan di State, sehingga
   stabil saat dirender ulang tetapi teracak ulang setiap Reset.
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'kumpul',
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
var STORAGE_KEY = 'mpi-13-1-kali-bagi-pangkat-v1';

/* Soal uji terap satu operasi (dua suku) memakai diagnosa & opsi seksi 81. */
function soalSatuOperasi(s) {
  return !s.ekspresi.a.op && !s.ekspresi.b.op;
}

/* Opsi pilihan ganda uji terap, dibuat sekali dari engine (urutan diacak di state). */
var OPSI_TERAP = {};
DATA.terapkan.soal.forEach(function (s) {
  if (s.tipe === 'pilih') {
    OPSI_TERAP[s.id] = opsiKaliBagiMonomial(s.ekspresi.op, s.ekspresi.a, s.ekspresi.b);
  }
});

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
  ubinSteps: [],
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
  verifSteps: [],
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

/*
 * Menyiapkan seluruh array state per-soal DAN seluruh urutan acak
 * pilihan jawaban. Dipanggil sekali saat init (setelah loadState) dan
 * setiap kali progress direset, sehingga urutan stabil lintas reload
 * tetapi teracak ulang setiap Reset.
 */
function initExerciseArrays() {
  [
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
  DATA.kumpul.pola.forEach(function (p) {
    ensureObject(State.polaInputs, p.id);
    if (typeof State.polaHint[p.id] !== 'number') State.polaHint[p.id] = 0;
    State.polaChecked[p.id] = !!State.polaChecked[p.id];
  });

  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'stimulasiOrder', DATA.stimulasi.opsi);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  ensureExerciseArray(State, 'ubinSteps', DATA.kumpul.ubin, makeDlStep);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', DATA.kumpul.pilah, DATA.kumpul.opsiPilah);

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

  /* Tahap 7 — urutan opsi pilihan ganda diacak per soal */
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
      optionOrder: OPSI_TERAP[s.id] ? shuffleArray(optionIds(OPSI_TERAP[s.id].opsi)) : null,
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
 * Langkah dengan `visual` diawali ubin faktor bilangan/variabel tunggal
 * (buildFactorTiles); `visualMono` diawali ubin bentuk aljabar
 * (buildMonoFactorTiles).
 */
function buildStepSeq(prefix, steps, langkah) {
  var html = '';
  for (var i = 0; i < langkah.length; i++) {
    var visual = '';
    if (langkah[i].visual) visual = buildFactorTiles(langkah[i].visual);
    else if (langkah[i].visualMono) visual = buildMonoFactorTiles(langkah[i].visualMono);
    html +=
      '<div class="kbp-step">' +
      visual +
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
    '<div class="formula-duo kbp-formula-grid">' +
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

/* Kamus pangkat: tabel pangkat lengkap (semua sel diketahui). */
function buildKamus() {
  return (
    '<details class="kbp-kamus" open>' +
    '<summary>📖 Kamus pangkat</summary>' +
    '<div class="kbp-kamus__grid">' +
    DATA.kumpul.kamus
      .map(function (t) {
        var semua = [];
        for (var n = t.dari; n <= t.sampai; n++) semua.push(n);
        return buildPowerTable(
          t.id,
          { a: t.a, dari: t.dari, sampai: t.sampai, diketahui: semua },
          {},
          { compact: true, caption: 'Kamus pangkat basis ' + t.a }
        );
      })
      .join('') +
    '</div>' +
    '</details>'
  );
}

function buildDaftarLangkah(list) {
  return (
    '<ol class="kbp-langkah">' +
    list
      .map(function (l) {
        return '<li>' + esc(l) + '</li>';
      })
      .join('') +
    '</ol>'
  );
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   ============================================================ */

function buildPetak(soal) {
  var p = formatMonomial(monomial(soal.a.koef, soal.a.pangkat));
  var l = formatMonomial(monomial(soal.b.koef, soal.b.pangkat));
  return (
    '<figure class="kbp-petak" role="img" aria-label="Petak persegi panjang dengan panjang ' +
    esc(p) +
    ' cm dan lebar ' +
    esc(l) +
    ' cm">' +
    '<span class="kbp-petak__panjang" aria-hidden="true">panjang ' +
    esc(p) +
    ' cm</span>' +
    '<div class="kbp-petak__isi" aria-hidden="true">' +
    '<span class="kbp-petak__luas">Luas = ' +
    esc(p) +
    ' × ' +
    esc(l) +
    '</span>' +
    '<span class="kbp-petak__lebar">lebar ' +
    esc(l) +
    ' cm</span>' +
    '</div>' +
    '</figure>'
  );
}

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var terisi = !!State.stimulasiPilihan;

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">📌 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<p class="kbp-rule"><span aria-hidden="true">🔍</span> ' +
        esc(D.aturan) +
        '</p>' +
        buildPetak(D.soal),
      'panel--hero'
    ) +
    buildTpPanel(D) +
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
      navigateTo('kumpul');
    });
  }
}

/* ============================================================
   7. STAGE: PENGUMPULAN DATA  (Discovery Learning — sintaks 3)
   A: ubin faktor. B: tabel pola kali → bagi (dibuka berurutan)
   dengan kamus pangkat. C: pilah pernyataan.
   ============================================================ */

function polaBenar(p) {
  return State.polaChecked[p.id] && polaSemuaBenar(p, State.polaInputs[p.id]);
}

function semuaPolaBenar() {
  return DATA.kumpul.pola.every(polaBenar);
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
    '<div class="kbp-diagnosa">' +
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
    '<div class="kbp-pola" id="pola-' +
    p.id +
    '">' +
    '<h4 class="kbp-pola__judul">' +
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

function renderKumpul(container) {
  var D = DATA.kumpul;
  var ubinSelesai = stepsDone(State.ubinSteps);
  var polaSelesai = ubinSelesai && semuaPolaBenar();
  var semuaPilah = sortItemsAllAnswered(D.pilah, State.pilahStates);

  var polaHTML = '';
  if (ubinSelesai) {
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
        buildStepSeq('ub', State.ubinSteps, D.ubin)
    ) +
    (ubinSelesai
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
    (polaSelesai && semuaPilah ? buildDlNextButton('kumpulNextBtn', D.nextLabel) : '') +
    '</section>';

  var rerender = function () {
    renderKumpul(container);
  };

  bindStepSeq('ub', State.ubinSteps, D.ubin, rerender);

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
      var p = D.pola.filter(function (x) {
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
  bindNext('kumpulNextBtn', 'kumpul', 'olah');
}

/* ============================================================
   8. STAGE: OLAH DATA  (Discovery Learning — sintaks 4)
   Kolom m, n, k → pertanyaan penuntun → ubin bentuk aljabar → rumus.
   ============================================================ */

function renderOlah(container) {
  var D = DATA.olah;
  var quizBenar = guidedQuizAllCorrect(D.pertanyaan, State.olahPilih);
  var langkahSelesai = quizBenar && stepsDone(State.olahSteps);

  var tabelHTML = DATA.kumpul.pola
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
        '<div class="kbp-olah-grid">' +
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
   A: lab uji sifat. B: dugaan awal. C: miskonsepsi.
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
    '<span class="dugaan-row__title">Petak Nadia: 3x² × 2x³</span>' +
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
  var selesaiB = selesaiA && stepsDone(State.verifSteps);
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
              '<strong>Daftar periksa lengkap.</strong> Kedua sifat selalu menghasilkan ruas yang sama, sedangkan kedua dugaan teman gugur oleh contoh penyangkal.'
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
            buildStepSeq('vf', State.verifSteps, D.uji) +
            (selesaiB ? buildDugaanBanding() : '')
        )
      : '') +
    (selesaiB
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulC) +
            '</h3>' +
            '<p>' +
            esc(D.instruksiC) +
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali ubin faktor dan tabel polamu, lalu pilih potongan lain.</p>'
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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah sifat yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Perkalian &amp; Pembagian Bentuk Berpangkat</h3>' +
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
   'isian': koefisien & eksponen (diagnosa seksi 81/39).
   'pilih' : opsi berpengecoh seksi 81, urutan dari ex.optionOrder.
   Setelah selesai, langkah pembahasan ditampilkan.
   ============================================================ */

function kunciSoal(s) {
  return hitungEkspresiMonomial(s.ekspresi);
}

function soalSelesai(s, ex) {
  return s.tipe === 'pilih' ? ex.chosen === OPSI_TERAP[s.id].correct : ex.done;
}

function semuaSoalSelesai() {
  return DATA.terapkan.soal.every(function (s, i) {
    return soalSelesai(s, State.terapkanSoal[i]);
  });
}

function diagnosaSoal(s, jawab) {
  if (soalSatuOperasi(s)) {
    return diagnosaKaliBagiMonomial(s.ekspresi.op, s.ekspresi.a, s.ekspresi.b, jawab);
  }
  return diagnosaMonomial(kunciSoal(s), jawab);
}

function pembahasanSoal(s) {
  return s.pembahasan || langkahKaliBagiMonomial(s.ekspresi.op, s.ekspresi.a, s.ekspresi.b);
}

function buildPembahasan(s) {
  return (
    '<div class="kbp-bahas">' +
    '<p class="kbp-bahas__judul">Langkah penyelesaian</p>' +
    buildDaftarLangkah(pembahasanSoal(s)) +
    '</div>'
  );
}

function buildLangkahIsian(s, ex) {
  var D = DATA.terapkan;
  var kunci = kunciSoal(s);
  if (ex.done) {
    return (
      buildFeedbackBox(
        ex.revealed ? 'info' : 'success',
        ex.revealed ? '👁' : '✓',
        (ex.revealed ? 'Jawabannya: ' : '<strong>Tepat!</strong> Hasilnya ') +
          '<strong class="kbp-mono">' +
          esc(formatMonomial(kunci)) +
          '</strong>'
      ) + buildPembahasan(s)
    );
  }
  return (
    '<p class="exercise-label">' +
    esc(D.labelIsian) +
    '</p>' +
    buildMonomialInput('mono-' + s.id, s.vars, ex.inputs, { error: !!ex.kode }) +
    '<p class="dl-caption">Tulis eksponen 1 untuk variabel tanpa eksponen, dan 0 bila variabelnya hilang.</p>' +
    '<div class="dl-input-row">' +
    '<button type="button" class="btn btn--primary" id="monoCheck">Periksa</button>' +
    buildHintToggle('monoHint', s.hints, ex.hintLevel) +
    (ex.attempts >= 2
      ? '<button type="button" class="btn btn--ghost btn--small" id="monoReveal">Lihat Jawaban</button>'
      : '') +
    '</div>' +
    (ex.kode
      ? '<div style="margin-top:var(--space-3);">' +
        buildFeedbackBox('warning', '💭', pesanDiagnosaKaliBagi(ex.kode)) +
        '</div>'
      : '') +
    buildHintStack(s.hints, ex.hintLevel)
  );
}

function buildLangkahPilih(s, ex) {
  var O = OPSI_TERAP[s.id];
  var benar = ex.chosen === O.correct;
  var opsi = O.opsi.map(function (o) {
    return { id: o.id, label: buildMonomialPositif(o.monomial) };
  });
  var umpan = '';
  if (ex.chosen && benar) {
    umpan = buildFeedbackBox('success', '✓', '<strong>Tepat!</strong>') + buildPembahasan(s);
  } else if (ex.chosen) {
    var dipilih = O.opsi.filter(function (o) {
      return o.id === ex.chosen;
    })[0];
    umpan = buildFeedbackBox(
      'error',
      '✗',
      'Belum tepat. ' + pesanDiagnosaKaliBagi(diagnosaSoal(s, dipilih.monomial))
    );
  }
  return (
    '<p class="exercise-label">' +
    esc(DATA.terapkan.labelPilih) +
    '</p>' +
    buildChoiceGroup(opsi, ex.optionOrder, {
      chosen: ex.chosen,
      correctId: benar ? O.correct : null,
      grade: true,
      locked: benar,
    }) +
    (ex.chosen ? '<div style="margin-top:var(--space-3);">' + umpan + '</div>' : '') +
    (benar
      ? ''
      : buildHintToggle('monoHint', s.hints, ex.hintLevel) + buildHintStack(s.hints, ex.hintLevel))
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
      var cls = 'kbp-dot';
      if (soalSelesai(x, st)) cls += ' kbp-dot--done';
      if (i === idx) cls += ' kbp-dot--aktif';
      return (
        '<button type="button" class="' +
        cls +
        '" data-soal-idx="' +
        i +
        '" aria-label="Soal ' +
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
    '<nav class="kbp-dots" aria-label="Pilih soal">' +
    titik +
    '</nav>' +
    buildDlPanel(
      '<p class="kbp-kasus">Soal ' +
        (idx + 1) +
        ' dari ' +
        D.soal.length +
        ' — sederhanakan:</p>' +
        (s.cerita ? '<p class="kbp-cerita">' + esc(s.cerita) + '</p>' : '') +
        '<div class="kbp-soal">' +
        buildEkspresiMonomial(s.ekspresi) +
        '</div>' +
        (s.tipe === 'pilih' ? buildLangkahPilih(s, ex) : buildLangkahIsian(s, ex))
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
        '>Soal berikutnya →</button>') +
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
            : 'Koefisien berupa bilangan tak nol, eksponen berupa bilangan bulat.'
        );
        return;
      }
      ex.attempts += 1;
      var kode = diagnosaSoal(s, r.value);
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

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (soalSelesai(s, ex)) return;
      ex.chosen = btn.dataset.optId;
      if (!soalSelesai(s, ex)) ex.pilihSalah += 1;
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
  var totalPilah = DATA.kumpul.pilah.length + DATA.verifikasi.pilah.length;
  var benarPilah =
    sortItemsCorrectCount(DATA.kumpul.pilah, State.pilahStates) +
    sortItemsCorrectCount(DATA.verifikasi.pilah, State.verifPilahStates);
  var langkah = State.ubinSteps.concat(State.olahSteps, State.verifSteps);
  var sekaliCoba = langkah.filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  var benarTerap = DATA.terapkan.soal.filter(function (s, i) {
    var ex = State.terapkanSoal[i];
    return s.tipe === 'pilih' ? soalSelesai(s, ex) && ex.pilihSalah === 0 : ex.done && !ex.revealed;
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
        kartu(benarTerap + '/' + DATA.terapkan.soal.length, 'Uji terap benar tanpa lihat jawaban') +
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
    'Kemampuan murid menjelaskan mengapa eksponen dijumlahkan atau dikurangkan — dengan ubin faktor dan data tabel — tetap menjadi bahan penilaian utama.' +
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
  kumpul: renderKumpul,
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
