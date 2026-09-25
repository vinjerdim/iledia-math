'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Unsur-unsur & Jaring-jaring Prisma
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox,
   createStageMachine, createExerciseStage, createStore,
   ensureExerciseArray, optionIds, komponen Discovery Learning
   (ensureShuffledOrder, orderByIds, buildDiscoveryHead,
   buildTeacherNote, buildChoiceGroup, buildDlPanel,
   buildDlNextButton, makeDlStep, buildDlStep, bindDlStep,
   ensureSortStates, buildSortItems, bindSortItems,
   sortItemsAllAnswered, sortItemsCorrectCount, buildGuidedQuizList,
   bindGuidedQuizList, guidedQuizAllCorrect), serta komponen prisma
   bagian 31 (unsurPrisma, namaPrisma, notasiPrisma, modelPrisma,
   buildPrismSVG, ensureJelajahState, buildPrismExplorer,
   bindPrismExplorer, ensureUnsurTableState, buildUnsurTable,
   bindUnsurTable, tabelUnsurBenar, jaringPrisma, cekJaring,
   buildNetSVG, ensureLipatState, buildNetFolder, bindNetFolder,
   ensureRakitState, buildNetBuilder, bindNetBuilder).

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
    7. Stage: Mengamati Unsur      (DL sintaks 3)
    8. Stage: Membongkar Kotak     (DL sintaks 3)
    9. Stage: Mengolah Data        (DL sintaks 4)
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
  'amati',
  'bongkar',
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
  'Amati',
  'Bongkar',
  'Olah',
  'Bukti',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-22-1-prisma-v1';

var JELAJAH_AMATI = { pilihanN: [3, 4, 5, 6] };
var JELAJAH_VERIF = { pilihanN: [DATA.verifikasi.n] };
var LIPAT_OPTS = {
  specs: DATA.bongkar.lipat,
  judul: function (n) {
    return DATA.bongkar.namaKemasan[n];
  },
};
var RAKIT_OPTS = DATA.bongkar.rakit;

/* Opsi jaring-jaring pada uji terap digambar sebagai SVG. */
DATA.terapkan.soal.forEach(function (s) {
  (s.options || []).forEach(function (o) {
    if (o.jaring && !o.label) {
      o.label =
        '<span class="psm-opt-net">' +
        buildNetSVG(jaringPrisma(o.jaring), { skala: 24, aria: o.teks }) +
        '</span>';
    }
  });
});

/* Butir pemilahan jaring-jaring, lengkap dengan gambarnya. */
var PILAH_ITEMS = DATA.olah.pilah.map(function (it) {
  return {
    id: it.id,
    correct: it.correct,
    explanation: it.explanation,
    teks:
      '<span class="psm-pilah">' +
      '<strong>' +
      esc(it.nama) +
      '</strong>' +
      buildNetSVG(jaringPrisma(it.spec), { skala: 30, aria: it.nama }) +
      '</span>',
  };
});

/* Langkah isian menghitung unsur prisma segidelapan. */
var VERIF_UNSUR = unsurPrisma(DATA.verifikasi.n);
var VERIF_RUMUS = {
  titik: '2n = 2 × ' + DATA.verifikasi.n,
  rusuk: '3n = 3 × ' + DATA.verifikasi.n,
  sisi: 'n + 2 = ' + DATA.verifikasi.n + ' + 2',
};
var VERIF_LANGKAH = DATA.verifikasi.langkah.map(function (s) {
  return {
    id: s.id,
    label: s.label,
    hints: s.hints,
    jawab: VERIF_UNSUR[s.id],
    temuan:
      'Hasil hitung langsung sama dengan pola: ' +
      VERIF_RUMUS[s.id] +
      ' = ' +
      VERIF_UNSUR[s.id] +
      '. Pola terbukti!',
  };
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

  /* Tahap 3 — mengamati unsur */
  jelajahAmati: null,
  tabelAmati: null,
  amatiOrders: {},
  amatiPilih: {},

  /* Tahap 4 — membongkar kotak */
  lipatKemasan: null,
  lipatOrders: {},
  lipatPilih: {},
  rakit: null,
  rakitOrders: {},
  rakitPilih: {},

  /* Tahap 5 — mengolah data */
  konsepOrders: {},
  konsepPilih: {},
  tabelPrediksi: null,
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 6 — pembuktian */
  jelajahVerif: null,
  verifSteps: {},
  verifJaring: {},
  verifLipat: {},
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

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function ensureObject(key) {
  if (!isPlainObject(State[key])) State[key] = {};
}

/* Urutan acak opsi untuk setiap pertanyaan penuntun dalam `list`. */
function ensureGuidedOrders(orderKey, pilihKey, list) {
  ensureObject(orderKey);
  ensureObject(pilihKey);
  list.forEach(function (q) {
    ensureShuffledOrder(State[orderKey], q.id, q.opsi);
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
  ensureJelajahState(State, 'jelajahAmati', JELAJAH_AMATI);
  ensureUnsurTableState(State, 'tabelAmati', DATA.amati.tabelRows);
  ensureGuidedOrders('amatiOrders', 'amatiPilih', DATA.amati.tanya);

  /* Tahap 4 */
  ensureLipatState(State, 'lipatKemasan', LIPAT_OPTS);
  ensureGuidedOrders('lipatOrders', 'lipatPilih', DATA.bongkar.tanyaLipat);
  ensureRakitState(State, 'rakit', RAKIT_OPTS.n);
  ensureGuidedOrders('rakitOrders', 'rakitPilih', DATA.bongkar.tanyaRakit);

  /* Tahap 5 */
  ensureGuidedOrders('konsepOrders', 'konsepPilih', DATA.olah.konsep);
  ensureUnsurTableState(State, 'tabelPrediksi', DATA.olah.prediksiRows);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.olah.opsiKlas);

  /* Tahap 6 */
  ensureJelajahState(State, 'jelajahVerif', JELAJAH_VERIF);
  ensureObject('verifSteps');
  VERIF_LANGKAH.forEach(function (s) {
    if (!isPlainObject(State.verifSteps[s.id])) State.verifSteps[s.id] = makeDlStep();
  });
  ensureObject('verifJaring');
  ensureObject('verifLipat');
  DATA.verifikasi.jaring.forEach(function (j) {
    var st = State.verifJaring[j.id];
    if (!isPlainObject(st)) st = { prediksi: null, order: null };
    ensureShuffledOrder(st, 'order', DATA.verifikasi.opsiPrediksi);
    State.verifJaring[j.id] = st;
    var specs = {};
    specs[j.spec.n] = j.spec;
    ensureLipatState(State.verifLipat, j.id, { specs: specs });
  });
  ensureExerciseArray(State, 'verifExercises', DATA.verifikasi.soal, function (q) {
    return { chosen: null, correct: false, optionOrder: shuffleArray(optionIds(q.options)) };
  });

  /* Tahap 7 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);
  ensureObject('simpulanPilihan');

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
  ensureObject('refleksiAnswers');
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

/*
 * Memasang pilihan "coba lagi sampai benar": klik mengganti pilihan
 * selama jawaban benar belum dipilih.
 */
function bindRetryChoice(container, group, key, correctId, rerender) {
  container.querySelectorAll('[data-group="' + group + '"][data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State[key] === correctId) return;
      State[key] = btn.dataset.optId;
      saveState();
      rerender();
    });
  });
}

function daftarTemuan(teks) {
  return (
    '<div style="margin-top:var(--space-4);">' + buildFeedbackBox('success', '🔎', teks) + '</div>'
  );
}

function paragrafInfo(teks) {
  return buildDlPanel('<p style="margin:0;">' + esc(teks) + '</p>', 'panel--info');
}

/* Gambar prisma kecil tanpa label untuk galeri & rangkuman. */
function gambarBenda(b, skala) {
  return buildPrismSVG(
    modelPrisma(b.n, { sumbu: b.sumbu, tinggi: b.tinggi, r: 1 }),
    { azimut: -32, elevasi: 22 },
    { label: false, skala: skala || 34, aria: b.nama + ': ' + namaPrisma(b.n) }
  );
}

function semuaDilipat(st, specs) {
  return Object.keys(specs).every(function (n) {
    return !!st.dilipat[n];
  });
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
      '<h2 style="margin-top:0;">🛍️ ' +
        esc(D.judul) +
        '</h2>' +
        '<p class="stimulasi-cerita">' +
        esc(D.cerita) +
        '</p>' +
        '<div class="psm-galeri">' +
        D.benda
          .map(function (b) {
            return (
              '<figure class="psm-galeri__item">' +
              gambarBenda(b) +
              '<figcaption>' +
              esc(b.nama) +
              '</figcaption></figure>'
            );
          })
          .join('') +
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
    paragrafInfo(D.pengantar) +
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

  bindRetryChoice(container, 'masalah', 'masalahPilihan', D.correct, function () {
    renderMasalah(container);
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
      navigateTo('amati');
    });
  }
}

/* ============================================================
   7. STAGE: MENGAMATI UNSUR  (Discovery Learning — sintaks 3)
   Penjelajah prisma → tabel unsur berdiagnosa → menamai unsur.
   ============================================================ */

function renderAmati(container) {
  var D = DATA.amati;
  var tabelOk = tabelUnsurBenar(State.tabelAmati, D.tabelRows);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.amatiPilih);

  function rerender() {
    renderAmati(container);
  }

  container.innerHTML =
    '<section aria-label="Mengumpulkan Data: Mengamati Unsur">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    buildDlPanel(buildPrismExplorer('jlA', State.jelajahAmati, JELAJAH_AMATI)) +
    buildDlPanel(
      '<h3 style="margin-top:0;">📋 Tabel pengamatan</h3>' +
        '<p>' +
        esc(D.instruksiTabel) +
        '</p>' +
        buildUnsurTable('tbA', D.tabelRows, State.tabelAmati, { caption: D.tabelCaption })
    ) +
    (tabelOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🏷️ Nama unsur prisma</h3>' +
            '<p>' +
            esc(D.tanyaInstruksi) +
            '</p>' +
            buildGuidedQuizList(D.tanya, State.amatiOrders, State.amatiPilih) +
            (tanyaOk ? daftarTemuan(esc(D.temuan)) : '')
        )
      : '') +
    (tabelOk && tanyaOk ? buildDlNextButton('amatiNextBtn', D.nextLabel, true) : '') +
    '</section>';

  bindPrismExplorer(container, 'jlA', State.jelajahAmati, JELAJAH_AMATI, saveState);
  bindUnsurTable(container, 'tbA', D.tabelRows, State.tabelAmati, saveState, rerender);
  bindGuidedQuizList(container, D.tanya, State.amatiPilih, saveState, rerender);
  bindNext('amatiNextBtn', 'amati', 'bongkar');
}

/* ============================================================
   8. STAGE: MEMBONGKAR KOTAK  (Discovery Learning — sintaks 3)
   A. Pelipat jaring tiga kemasan → pertanyaan penuntun.
   B. Perakit jaring prisma segitiga → syarat letak segitiga.
   ============================================================ */

function renderBongkar(container) {
  var D = DATA.bongkar;
  var lipatOk = semuaDilipat(State.lipatKemasan, D.lipat);
  var tanyaLipatOk = guidedQuizAllCorrect(D.tanyaLipat, State.lipatPilih);
  var rakitOk = State.rakit.ditemukan.length >= D.targetRakit;
  var tanyaRakitOk = guidedQuizAllCorrect(D.tanyaRakit, State.rakitPilih);

  function rerender() {
    renderBongkar(container);
  }

  var dilipat = Object.keys(D.lipat).filter(function (n) {
    return State.lipatKemasan.dilipat[n];
  }).length;

  var html =
    '<section aria-label="Mengumpulkan Data: Membongkar Kotak">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">A. Lipat dan buka kemasan</h3>' +
        '<p>' +
        esc(D.instruksiLipat) +
        ' <strong>(' +
        dilipat +
        '/' +
        Object.keys(D.lipat).length +
        ' kemasan dilipat penuh)</strong></p>' +
        buildNetFolder('lpK', State.lipatKemasan, LIPAT_OPTS) +
        (lipatOk ? buildGuidedQuizList(D.tanyaLipat, State.lipatOrders, State.lipatPilih) : '')
    );

  if (lipatOk && tanyaLipatOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">B. Rakit jaring-jaring kotak cokelat</h3>' +
        '<p>' +
        esc(D.instruksiRakit) +
        '</p>' +
        buildNetBuilder('rkt', State.rakit, RAKIT_OPTS) +
        (rakitOk
          ? buildGuidedQuizList(D.tanyaRakit, State.rakitOrders, State.rakitPilih) +
            (tanyaRakitOk ? daftarTemuan(esc(D.temuan)) : '')
          : '')
    );
  }

  html +=
    (lipatOk && tanyaLipatOk && rakitOk && tanyaRakitOk
      ? buildDlNextButton('bongkarNextBtn', D.nextLabel, true)
      : '') + '</section>';

  container.innerHTML = html;

  bindNetFolder(container, 'lpK', State.lipatKemasan, LIPAT_OPTS, function () {
    saveState();
    if (!lipatOk && semuaDilipat(State.lipatKemasan, D.lipat)) rerender();
  });
  bindGuidedQuizList(container, D.tanyaLipat, State.lipatPilih, saveState, rerender);
  bindNetBuilder(container, 'rkt', State.rakit, RAKIT_OPTS, function () {
    saveState();
    if (!rakitOk && State.rakit.ditemukan.length >= D.targetRakit) rerender();
  });
  bindGuidedQuizList(container, D.tanyaRakit, State.rakitPilih, saveState, rerender);
  bindNext('bongkarNextBtn', 'bongkar', 'olah');
}

/* ============================================================
   9. STAGE: MENGOLAH DATA  (Discovery Learning — sintaks 4)
   Pola 2n, 3n, n + 2 → prediksi tabel → memilah jaring-jaring.
   ============================================================ */

function renderOlah(container) {
  var D = DATA.olah;
  var konsepOk = guidedQuizAllCorrect(D.konsep, State.konsepPilih);
  var prediksiOk = tabelUnsurBenar(State.tabelPrediksi, D.prediksiRows);
  var pilahOk = sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);

  function rerender() {
    renderOlah(container);
  }

  var html =
    '<section aria-label="Mengolah Data">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">A. Temukan polanya</h3>' +
        '<p>' +
        esc(D.instruksiPola) +
        '</p>' +
        buildUnsurTable('tbRekap', DATA.amati.tabelRows, State.tabelAmati, {
          caption: 'Hasil pengamatanmu di tahap 3',
        }) +
        buildGuidedQuizList(D.konsep, State.konsepOrders, State.konsepPilih)
    );

  if (konsepOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">B. Prediksi tanpa menggambar</h3>' +
        '<p>' +
        esc(D.instruksiPrediksi) +
        '</p>' +
        buildUnsurTable('tbP', D.prediksiRows, State.tabelPrediksi, { caption: D.prediksiCaption })
    );
  }

  if (konsepOk && prediksiOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">C. Pilah rancangan bentangan karton</h3>' +
        '<p>' +
        esc(D.instruksiPilah) +
        '</p>' +
        buildSortItems(PILAH_ITEMS, State.pilahOrder, D.opsiKlas, State.pilahStates) +
        (pilahOk
          ? daftarTemuan(
              '<strong>' +
                sortItemsCorrectCount(PILAH_ITEMS, State.pilahStates) +
                ' dari ' +
                PILAH_ITEMS.length +
                ' rancangan</strong> kamu pilah dengan tepat. ' +
                esc(D.temuan)
            )
          : '')
    );
  }

  html +=
    (konsepOk && prediksiOk && pilahOk ? buildDlNextButton('olahNextBtn', D.nextLabel, true) : '') +
    '</section>';

  container.innerHTML = html;

  bindGuidedQuizList(container, D.konsep, State.konsepPilih, saveState, rerender);
  bindUnsurTable(container, 'tbP', D.prediksiRows, State.tabelPrediksi, saveState, rerender);
  bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  bindNext('olahNextBtn', 'olah', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A. Hitung langsung unsur prisma segidelapan.
   B. Prediksi lalu lipat dua jaring baru.
   C. Tanggapi miskonsepsi.
   ============================================================ */

function verifLangkahSelesai() {
  return VERIF_LANGKAH.every(function (s) {
    return State.verifSteps[s.id].done;
  });
}

function verifJaringSelesai() {
  return DATA.verifikasi.jaring.every(function (j) {
    var st = State.verifLipat[j.id];
    return State.verifJaring[j.id].prediksi && st.dilipat[j.spec.n];
  });
}

function verifSoalSemuaDijawab() {
  return State.verifExercises.every(function (e) {
    return !!e.chosen;
  });
}

function folderOptsVerif(j) {
  var specs = {};
  specs[j.spec.n] = j.spec;
  return {
    specs: specs,
    judul: function () {
      return j.nama;
    },
  };
}

function buildVerifJaring(j) {
  var st = State.verifJaring[j.id];
  var lipat = State.verifLipat[j.id];
  var html =
    '<div class="psm-verif-jaring">' +
    '<h4>' +
    esc(j.nama) +
    '</h4>' +
    '<div class="psm-stage psm-stage--net">' +
    buildNetSVG(jaringPrisma(j.spec), { skala: 34, aria: 'Rancangan ' + j.nama }) +
    '</div>' +
    '<p class="exercise-label">Prediksimu:</p>' +
    buildChoiceGroup(DATA.verifikasi.opsiPrediksi, st.order, {
      chosen: st.prediksi,
      locked: true,
      group: j.id,
      attr: 'data-prediksi',
    });
  if (st.prediksi) {
    html +=
      '<p class="dl-caption">Sekarang lipat untuk membuktikan prediksimu.</p>' +
      buildNetFolder('vf-' + j.id, lipat, folderOptsVerif(j));
    if (lipat.dilipat[j.spec.n]) {
      var r = cekJaring(j.spec);
      var tepat = (st.prediksi === 'bisa') === r.valid;
      html += buildFeedbackBox(
        tepat ? 'success' : 'warning',
        tepat ? '✓' : '💭',
        '<strong>' +
          (tepat ? 'Prediksimu terbukti.' : 'Prediksimu belum tepat.') +
          '</strong> ' +
          esc(r.pesan)
      );
    }
  }
  return html + '</div>';
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var langkahOk = verifLangkahSelesai();
  var jaringOk = langkahOk && verifJaringSelesai();

  function rerender() {
    renderVerifikasi(container);
  }

  var html =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">A. Buktikan pola pada ' +
        esc(namaPrisma(D.n)) +
        '</h3>' +
        '<p>' +
        esc(D.instruksiHitung) +
        '</p>' +
        buildPrismExplorer('jlV', State.jelajahVerif, JELAJAH_VERIF) +
        VERIF_LANGKAH.map(function (s, i) {
          return buildDlStep('vs' + s.id, State.verifSteps[s.id], s, i + 1);
        }).join('')
    );

  if (langkahOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">B. Prediksi, lalu lipat</h3>' +
        '<p>' +
        esc(D.instruksiJaring) +
        '</p>' +
        '<div class="psm-duo">' +
        D.jaring.map(buildVerifJaring).join('') +
        '</div>'
    );
  }

  if (jaringOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">C. Tanggapi pendapat teman</h3>' +
        '<p>' +
        esc(D.instruksiMiskonsepsi) +
        '</p>' +
        D.soal
          .map(function (q, i) {
            var ex = State.verifExercises[i];
            return (
              '<div class="quiz-item">' +
              '<p class="exercise-label"><span class="dl-step__num">' +
              (i + 1) +
              '</span>' +
              esc(q.teks) +
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
                      esc(q.explanation)
                  ) +
                  '</div>'
                : '') +
              '</div>'
            );
          })
          .join('')
    );
  }

  html +=
    (jaringOk && verifSoalSemuaDijawab()
      ? buildDlNextButton('verifNextBtn', D.nextLabel, true)
      : '') + '</section>';

  container.innerHTML = html;

  bindPrismExplorer(container, 'jlV', State.jelajahVerif, JELAJAH_VERIF, saveState);
  VERIF_LANGKAH.forEach(function (s) {
    bindDlStep('vs' + s.id, State.verifSteps[s.id], s, saveState, rerender);
  });

  D.jaring.forEach(function (j) {
    var st = State.verifJaring[j.id];
    container.querySelectorAll('[data-prediksi][data-group="' + j.id + '"]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (st.prediksi) return;
        st.prediksi = b.dataset.prediksi;
        saveState();
        rerender();
      });
    });
    if (st.prediksi) {
      var lipat = State.verifLipat[j.id];
      var sudah = !!lipat.dilipat[j.spec.n];
      bindNetFolder(container, 'vf-' + j.id, lipat, folderOptsVerif(j), function () {
        saveState();
        if (!sudah && lipat.dilipat[j.spec.n]) rerender();
      });
    }
  });

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
      rerender();
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

function buildRangkumanVisual() {
  var n = 6;
  var model = modelPrisma(n, { tinggi: 1.6 });
  return (
    '<div class="psm-rangkum">' +
    '<figure><figcaption>' +
    esc(namaPrisma(n).replace('prisma ', 'Prisma ')) +
    ' ' +
    esc(notasiPrisma(n)) +
    '</figcaption>' +
    '<div class="psm-stage">' +
    buildPrismSVG(model, { azimut: -25, elevasi: 25 }, { skala: 60 }) +
    '</div></figure>' +
    '<figure><figcaption>Jaring-jaringnya</figcaption>' +
    '<div class="psm-stage psm-stage--net">' +
    buildNetSVG(jaringPrisma({ n: n, atas: [2], alas: [2], s: 0.7, h: 1.6 }), { skala: 34 }) +
    '</div></figure>' +
    '</div>'
  );
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
          ? '<p class="dl-simpulan-item__note">Belum tepat. Ingat kembali temuanmu, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  var dugaan = State.stimulasiPilihan;

  container.innerHTML =
    '<section aria-label="Menarik Kesimpulan">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
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
          '<h3 style="margin-top:0;">Rangkuman Unsur & Jaring-jaring Prisma</h3>' +
            buildRangkumanVisual() +
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
        ) +
        (dugaan && D.tanggapanDugaan[dugaan]
          ? buildDlPanel(
              '<h3 style="margin-top:0;">' +
                esc(D.dugaanJudul) +
                '</h3>' +
                '<p class="dl-caption">Dugaanmu di tahap Stimulasi: “' +
                esc(findOptionLabel(DATA.stimulasi.opsi, dugaan)) +
                '”</p>' +
                buildFeedbackBox(
                  dugaan === 'kongruen' ? 'success' : 'info',
                  '🔁',
                  esc(D.tanggapanDugaan[dugaan])
                )
            )
          : '') +
        buildDlNextButton('simpulanNextBtn', D.nextLabel, true)
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
   createExerciseStage (shared/engine.js) dengan soal campuran
   'input' (isian banyak unsur) dan 'choice' (opsi diacak lewat
   ex.optionOrder di initExerciseArrays()).
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
  defaultType: 'choice',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  checkValue: function (s) {
    return s.jawab;
  },
  inputAriaLabel: 'Jawaban',
  inputPlaceholder: 'Jawaban',
  inputSuffix: function (s) {
    return '<span class="psm-suffix">' + esc(s.satuan) + '</span>';
  },
  invalidMessage: 'Masukkan sebuah bilangan bulat (contoh: 12).',
  revealText: function (s) {
    return (
      'Jawabannya <strong>' +
      esc(s.jawab) +
      ' ' +
      esc(s.satuan) +
      '</strong>. ' +
      esc(s.explanation)
    );
  },
  renderPrompt: function (s) {
    var pilihan = (s.type || 'choice') === 'choice';
    return (
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
      (pilihan && s.hints && s.hints.length
        ? '<details class="soal-hint"><summary>💡 Petunjuk</summary><ul>' +
          s.hints
            .map(function (h) {
              return '<li>' + esc(h) + '</li>';
            })
            .join('') +
          '</ul></details>'
        : '') +
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
  var sel = 0;
  var selBenar = 0;
  DATA.amati.tabelRows.forEach(function (n) {
    ['titik', 'rusuk', 'sisi'].forEach(function (k) {
      sel += 1;
      if (State.tabelAmati.hasil[n][k] === 'benar') selBenar += 1;
    });
  });
  var pilahBenar = sortItemsCorrectCount(PILAH_ITEMS, State.pilahStates);
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
        kartu(selBenar + '/' + sel, 'Isian tabel unsur tepat') +
        kartu(State.rakit.ditemukan.length, 'Jaring-jaring berhasil dirakit') +
        kartu(pilahBenar + '/' + PILAH_ITEMS.length, 'Rancangan dipilah tepat') +
        kartu(verifBenar + '/' + DATA.verifikasi.soal.length, 'Miskonsepsi ditanggapi tepat') +
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
    '<div class="sajian-trio">' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">●</span>2n titik sudut</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">╱</span>3n rusuk</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">▰</span>n + 2 sisi</div>' +
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
    'Kemampuan murid menunjuk unsur-unsur prisma pada benda nyata dan menjelaskan mengapa sebuah bentangan karton dapat atau tidak dapat dilipat menjadi prisma tetap menjadi bahan penilaian utama.' +
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
  amati: renderAmati,
  bongkar: renderBongkar,
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
