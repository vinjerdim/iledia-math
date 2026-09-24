'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Jumlah n Suku Pertama Deret Aritmetika (Sₙ)
   Fase F — SMK Rekayasa Perangkat Lunak

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, formatNumber, parseInputInt, shuffleArray, showNotice,
   buildFeedbackBox, createStageMachine, createExerciseStage,
   createStore, ensureExerciseArray, optionIds, serta komponen
   Discovery Learning — ensureShuffledOrder, orderByIds,
   buildDiscoveryHead, buildTeacherNote, buildChoiceGroup,
   buildHintStack, buildHintToggle, buildSequenceTiles, buildDlPanel,
   buildDlNextButton, findOptionLabel, makeDlStep, buildDlStep,
   bindDlStep, ensureSortStates, buildSortItems, bindSortItems,
   sortItemsAllAnswered, dan sortItemsCorrectCount.

   Yang khas modul ini hanya visual "tangga piksel" (SVG blok yang
   dapat disalin & diputar 180° menjadi persegi panjang) dan grid
   pasangan maju–mundur untuk bukti aljabar.

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
    4. Utilitas Render & Visual Tangga
    5. Stage: Stimulasi            (DL sintaks 1)
    6. Stage: Identifikasi Masalah (DL sintaks 2)
    7. Stage: Pengumpulan Data     (DL sintaks 3)
    8. Stage: Bukti Visual         (DL sintaks 4)
    9. Stage: Bukti Aljabar        (DL sintaks 4)
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
  'olahVisual',
  'olahAljabar',
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
  'Bukti Visual',
  'Bukti Aljabar',
  'Uji Rumus',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-2-1-sn-aritmetika-dl-v1';

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
  koleksiN: 1,
  tabelU: [],
  tabelS: [],
  tabelChecked: false,
  tabelHint: 0,
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 4 — bukti visual */
  visualCopy: false,
  visualSteps: [],
  visualOrder1: null,
  visualPilih1: null,
  visualOrder2: null,
  visualPilih2: null,
  visualN: 5,

  /* Tahap 5 — bukti aljabar */
  aljabarKlik: [],
  aljabarOrders: {},
  aljabarPilih: {},

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

/* Array string kosong sepanjang `len` bila `arr` belum cocok. */
function ensureStringArray(key, len) {
  if (!Array.isArray(State[key]) || State[key].length !== len) {
    State[key] = [];
    for (var i = 0; i < len; i++) State[key].push('');
  }
}

/* Membatasi nilai slider n agar tetap di rentang yang sah. */
function clampN(v, min, def) {
  var maxN = DATA.tangga.maxN;
  return typeof v === 'number' && v >= min && v <= maxN ? v : def;
}

/*
 * Menyiapkan seluruh array state per-soal DAN seluruh urutan acak
 * pilihan jawaban. Dipanggil sekali saat init (setelah loadState) dan
 * setiap kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'stimulasiOrder', DATA.stimulasi.opsi);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  State.koleksiN = clampN(State.koleksiN, 1, 1);
  ensureStringArray('tabelU', DATA.koleksi.tabelN);
  ensureStringArray('tabelS', DATA.koleksi.tabelN);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', DATA.koleksi.pilah, DATA.koleksi.opsiPilah);

  /* Tahap 4 */
  ensureExerciseArray(State, 'visualSteps', DATA.olahVisual.langkah, makeDlStep);
  ensureShuffledOrder(State, 'visualOrder1', DATA.olahVisual.opsi1);
  ensureShuffledOrder(State, 'visualOrder2', DATA.olahVisual.opsi2);
  State.visualN = clampN(State.visualN, 2, DATA.olahVisual.n);

  /* Tahap 5 */
  if (
    !Array.isArray(State.aljabarKlik) ||
    State.aljabarKlik.length !== DATA.olahAljabar.kolom.length
  ) {
    State.aljabarKlik = DATA.olahAljabar.kolom.map(function (k) {
      return !!k.titik;
    });
  }
  if (!State.aljabarOrders || typeof State.aljabarOrders !== 'object') State.aljabarOrders = {};
  if (!State.aljabarPilih || typeof State.aljabarPilih !== 'object') State.aljabarPilih = {};
  DATA.olahAljabar.pertanyaan.forEach(function (q) {
    ensureShuffledOrder(State.aljabarOrders, q.id, q.opsi);
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
   4. UTILITAS RENDER & VISUAL TANGGA
   ============================================================ */

/* Kepala tahap + catatan peran guru. */
function buildHead(D) {
  return buildDiscoveryHead(D.kicker, D.goal, D.syntax) + buildTeacherNote(D.guru);
}

function fmt(n) {
  return formatNumber(n, '−');
}

/* Suku ke-k dan jumlah k suku pertama tangga piksel. */
function sukuTangga(k) {
  return DATA.tangga.a + (k - 1) * DATA.tangga.b;
}

function jumlahTangga(n) {
  return (n * (2 * DATA.tangga.a + (n - 1) * DATA.tangga.b)) / 2;
}

/* Kotak umpan balik pilihan bertingkat (benar → success, salah → warning). */
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
 * Tangga piksel dalam SVG. Kolom ke-k berisi Uₖ blok biru.
 *   opts.copy   true → tempelkan salinan tangga yang diputar 180°
 *               (kolom ke-k mendapat U₍ₙ₊₁₋ₖ₎ blok oranye di atasnya),
 *               sehingga terbentuk persegi panjang n × (a + Uₙ)
 *   opts.fresh  true → blok oranye dianimasikan masuk (baru ditekan)
 * Skala tinggi dikunci pada tinggi maksimum modul agar ukuran blok
 * tidak berubah saat slider digeser.
 */
function buildTangga(n, opts) {
  opts = opts || {};
  var bw = 30;
  var bh = 12;
  var gapX = 4;
  var padX = 6;
  var labelH = 20;
  var maxTinggi = DATA.tangga.a + sukuTangga(DATA.tangga.maxN);
  var tinggi = opts.copy ? DATA.tangga.a + sukuTangga(n) : sukuTangga(n);
  var skalaTinggi = opts.copy ? maxTinggi : sukuTangga(DATA.tangga.maxN);
  var W = padX * 2 + n * (bw + gapX) - gapX;
  var H = labelH * 2 + skalaTinggi * bh;
  var dasar = H - labelH;
  var svg = '';

  for (var k = 1; k <= n; k++) {
    var x = padX + (k - 1) * (bw + gapX);
    var biru = sukuTangga(k);
    var oranye = opts.copy ? sukuTangga(n + 1 - k) : 0;
    for (var i = 0; i < biru; i++) {
      svg +=
        '<rect class="tangga__blok tangga__blok--a" x="' +
        x +
        '" y="' +
        (dasar - (i + 1) * bh) +
        '" width="' +
        bw +
        '" height="' +
        bh +
        '" rx="2"/>';
    }
    for (var j = 0; j < oranye; j++) {
      svg +=
        '<rect class="tangga__blok tangga__blok--b' +
        (opts.fresh ? ' is-fresh' : '') +
        '" x="' +
        x +
        '" y="' +
        (dasar - (biru + j + 1) * bh) +
        '" width="' +
        bw +
        '" height="' +
        bh +
        '" rx="2"/>';
    }
    svg +=
      '<text class="tangga__label tangga__label--a" x="' +
      (x + bw / 2) +
      '" y="' +
      (dasar + 15) +
      '" text-anchor="middle">' +
      biru +
      '</text>';
    if (opts.copy) {
      svg +=
        '<text class="tangga__label tangga__label--b" x="' +
        (x + bw / 2) +
        '" y="' +
        (dasar - (biru + oranye) * bh - 6) +
        '" text-anchor="middle">' +
        oranye +
        '</text>';
    }
  }

  var aria = opts.copy
    ? 'Dua tangga ' +
      n +
      ' anak tangga membentuk persegi panjang ' +
      n +
      ' kolom kali ' +
      tinggi +
      ' blok'
    : 'Tangga ' + n + ' anak tangga dengan tinggi kolom ' + sukuDaftar(n).join(', ');

  return (
    '<figure class="tangga">' +
    '<svg class="tangga__svg" viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" width="' +
    W +
    '" role="img" aria-label="' +
    esc(aria) +
    '">' +
    svg +
    '</svg>' +
    '<figcaption class="tangga__legend">' +
    '<span class="tangga__key"><span class="tangga__swatch tangga__swatch--a" aria-hidden="true"></span>Tangga asli</span>' +
    (opts.copy
      ? '<span class="tangga__key"><span class="tangga__swatch tangga__swatch--b" aria-hidden="true"></span>Salinan diputar 180°</span>'
      : '') +
    '</figcaption>' +
    '</figure>'
  );
}

function sukuDaftar(n) {
  var out = [];
  for (var k = 1; k <= n; k++) out.push(sukuTangga(k));
  return out;
}

/*
 * Slider n (range) beserta wilayah visual yang ikut berubah. Saat
 * digeser, hanya label dan wilayah visual yang diperbarui (bukan
 * seluruh tahap) agar slider tetap bisa diseret tanpa terputus.
 */
function buildSliderN(id, label, value, min) {
  return (
    '<div class="tangga-slider">' +
    '<label for="' +
    id +
    '">' +
    esc(label) +
    ' <strong id="' +
    id +
    'Val">n = ' +
    value +
    '</strong></label>' +
    '<input type="range" id="' +
    id +
    '" min="' +
    min +
    '" max="' +
    DATA.tangga.maxN +
    '" step="1" value="' +
    value +
    '">' +
    '</div>'
  );
}

/* Memasang slider: nilai disimpan, lalu `buildVisual(n)` mengisi ulang #<id>Visual. */
function bindSliderN(id, key, buildVisual) {
  var el = document.getElementById(id);
  var val = document.getElementById(id + 'Val');
  var region = document.getElementById(id + 'Visual');
  if (!el || !region) return;
  el.addEventListener('input', function () {
    State[key] = +el.value;
    saveState();
    if (val) val.textContent = 'n = ' + State[key];
    region.innerHTML = buildVisual(State[key]);
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
      '<h2 style="margin-top:0;">🎮 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<div class="stimulasi-grid">' +
        buildTangga(D.nTampil) +
        '<div>' +
        buildSequenceTiles(sukuDaftar(D.nTampil), {
          labels: sukuDaftar(D.nTampil).map(function (v, i) {
            return 'Anak tangga ' + (i + 1);
          }),
          showDiff: true,
          more: true,
          tail: D.tail,
        }) +
        '<p class="dl-caption">Angka = banyak blok pada anak tangga tersebut.</p>' +
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
   Bagian A: slider tangga & tabel Uₙ, Sₙ.
   Bagian B: pilah pernyataan (dibuka setelah tabel benar).
   ============================================================ */

function selTabelBenar(key, i) {
  var parsed = parseInputInt(State[key][i] || '', true);
  var harus = key === 'tabelU' ? sukuTangga(i + 1) : jumlahTangga(i + 1);
  return !parsed.error && parsed.value === harus;
}

function tabelSemuaBenar() {
  for (var i = 0; i < DATA.koleksi.tabelN; i++) {
    if (!selTabelBenar('tabelU', i) || !selTabelBenar('tabelS', i)) return false;
  }
  return true;
}

function buildSelTabel(key, i, kunci) {
  var val = State[key][i] || '';
  var dinilai = State.tabelChecked && val !== '';
  var ok = selTabelBenar(key, i);
  var nama = key === 'tabelU' ? 'U' : 'S';
  return (
    '<td class="un-row__expr' +
    (dinilai ? (ok ? ' sel--ok' : ' sel--no') : '') +
    '">' +
    '<input type="text" inputmode="numeric" class="input-text un-row__input" data-tabel="' +
    key +
    '" data-idx="' +
    i +
    '" value="' +
    esc(val) +
    '" aria-label="' +
    nama +
    ' ke-' +
    (i + 1) +
    '"' +
    (kunci ? ' disabled' : '') +
    '>' +
    (dinilai
      ? ok
        ? '<span class="un-row__mark un-row__mark--ok" aria-label="benar">✓</span>'
        : '<span class="un-row__mark un-row__mark--no" aria-label="salah">✗</span>'
      : '') +
    '</td>'
  );
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var n = State.koleksiN;
  var tabelBenar = State.tabelChecked && tabelSemuaBenar();
  var semuaPilah = sortItemsAllAnswered(D.pilah, State.pilahStates);

  var rowsHTML = '';
  for (var i = 0; i < D.tabelN; i++) {
    rowsHTML +=
      '<tr>' +
      '<th scope="row">' +
      (i + 1) +
      '</th>' +
      buildSelTabel('tabelU', i, tabelBenar) +
      buildSelTabel('tabelS', i, tabelBenar) +
      '</tr>';
  }

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.instruksiA) +
        '</p>' +
        buildSliderN('koleksiSlider', 'Banyak anak tangga:', n, 1) +
        '<div id="koleksiSliderVisual">' +
        buildTangga(n) +
        '</div>' +
        '<div class="un-table-wrap">' +
        '<table class="un-table tabel-sn">' +
        '<thead><tr><th scope="col">n</th><th scope="col">Uₙ (blok anak tangga ke-n)</th><th scope="col">Sₙ (blok total)</th></tr></thead>' +
        '<tbody>' +
        rowsHTML +
        '</tbody>' +
        '</table>' +
        '</div>' +
        (tabelBenar
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Datamu lengkap.</strong> Uₙ bertambah tetap (+2), tetapi Sₙ bertambah makin besar.'
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

  bindSliderN('koleksiSlider', 'koleksiN', function (v) {
    return buildTangga(v);
  });

  container.querySelectorAll('[data-tabel]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      State[inp.dataset.tabel][+inp.dataset.idx] = inp.value;
      saveState();
    });
    inp.addEventListener('keydown', function (e) {
      var btn = document.getElementById('tabelCheck');
      if (e.key === 'Enter' && btn) btn.click();
    });
  });

  var check = document.getElementById('tabelCheck');
  if (check) {
    check.addEventListener('click', function () {
      var kosong = State.tabelU.concat(State.tabelS).some(function (v) {
        return !String(v || '').trim();
      });
      if (kosong) {
        showNotice('Lengkapi semua sel tabel terlebih dahulu.');
        return;
      }
      State.tabelChecked = true;
      saveState();
      if (!tabelSemuaBenar()) showNotice('Masih ada sel yang belum tepat. Perhatikan tanda ✗.');
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

  bindNext('koleksiNextBtn', 'koleksi', 'olahVisual');
}

/* ============================================================
   8. STAGE: BUKTI VISUAL  (Discovery Learning — sintaks 4)
   Salin & putar tangga → persegi panjang n × (a + Uₙ).
   ============================================================ */

var visualBaruDisalin = false;

/* Persegi panjang gabungan + keterangan ukurannya untuk n tertentu. */
function buildVisualPersegi(n) {
  var a = DATA.tangga.a;
  var un = sukuTangga(n);
  return (
    buildTangga(n, { copy: true }) +
    '<p class="tangga-readout">n = ' +
    n +
    ': persegi panjang ' +
    n +
    ' × (' +
    a +
    ' + ' +
    un +
    ') = ' +
    fmt(n * (a + un)) +
    ' blok → Sₙ = ' +
    fmt(jumlahTangga(n)) +
    ' blok</p>'
  );
}

function renderOlahVisual(container) {
  var D = DATA.olahVisual;
  var steps = State.visualSteps;
  var langkahSelesai = steps.every(function (s) {
    return s.done;
  });
  var benar1 = State.visualPilih1 === D.correct1;
  var benar2 = State.visualPilih2 === D.correct2;
  var n = benar2 ? State.visualN : D.n;
  var fresh = visualBaruDisalin;
  visualBaruDisalin = false;

  var stepsHTML = '';
  if (State.visualCopy) {
    for (var i = 0; i < D.langkah.length; i++) {
      stepsHTML += buildDlStep('vs' + i, steps[i], D.langkah[i], i + 1);
      if (!steps[i].done) break;
    }
  }

  var pilih1HTML = '';
  if (langkahSelesai) {
    pilih1HTML = buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan1) +
        '</p>' +
        buildChoiceGroup(D.opsi1, State.visualOrder1, {
          chosen: State.visualPilih1,
          correctId: benar1 ? D.correct1 : null,
          grade: true,
          locked: benar1,
          group: 'p1',
        }) +
        buildChoiceFeedback(State.visualPilih1, benar1, D.umpan1)
    );
  }

  var pilih2HTML = '';
  if (benar1) {
    pilih2HTML = buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan2) +
        '</p>' +
        buildChoiceGroup(D.opsi2, State.visualOrder2, {
          chosen: State.visualPilih2,
          correctId: benar2 ? D.correct2 : null,
          grade: true,
          locked: benar2,
          group: 'p2',
        }) +
        buildChoiceFeedback(State.visualPilih2, benar2, D.umpan2) +
        (benar2
          ? '<div class="formula-card" style="margin-top:var(--space-4);"><span class="formula-card__label">Temuan bukti visual</span>Sₙ = n/2 × (a + Uₙ)</div>'
          : '')
    );
  }

  container.innerHTML =
    '<section aria-label="Bukti Visual Rumus Jumlah n Suku">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.instruksi) +
        '</p>' +
        (benar2
          ? buildSliderN('visualSlider', D.sliderLabel, n, 2) +
            '<div id="visualSliderVisual">' +
            buildVisualPersegi(n) +
            '</div>'
          : buildTangga(n, { copy: State.visualCopy, fresh: fresh })) +
        (State.visualCopy
          ? ''
          : '<div class="btn-group btn-group--center">' +
            '<button type="button" class="btn btn--primary btn--large" id="visualCopyBtn">' +
            esc(D.tombol) +
            '</button></div>') +
        stepsHTML
    ) +
    pilih1HTML +
    pilih2HTML +
    (benar2 ? buildDlNextButton('visualNextBtn', D.nextLabel) : '') +
    '</section>';

  var copyBtn = document.getElementById('visualCopyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      State.visualCopy = true;
      visualBaruDisalin = true;
      saveState();
      renderOlahVisual(container);
    });
  }

  if (State.visualCopy) {
    D.langkah.forEach(function (step, k) {
      bindDlStep('vs' + k, steps[k], step, saveState, function () {
        renderOlahVisual(container);
      });
    });
  }

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.dataset.group === 'p1') {
        if (State.visualPilih1 === D.correct1) return;
        State.visualPilih1 = btn.dataset.optId;
      } else {
        if (State.visualPilih2 === D.correct2) return;
        State.visualPilih2 = btn.dataset.optId;
      }
      saveState();
      renderOlahVisual(container);
    });
  });

  bindSliderN('visualSlider', 'visualN', buildVisualPersegi);

  bindNext('visualNextBtn', 'olahVisual', 'olahAljabar');
}

/* ============================================================
   9. STAGE: BUKTI ALJABAR  (Discovery Learning — sintaks 4)
   Sₙ maju + Sₙ mundur → n pasangan bernilai a + Uₙ.
   ============================================================ */

function aljabarSemuaDiklik() {
  return State.aljabarKlik.every(function (v) {
    return v;
  });
}

function buildPairGrid() {
  var D = DATA.olahAljabar;
  var kolom = D.kolom;

  function sel(teks, cls) {
    return '<span class="pair-cell' + (cls ? ' ' + cls : '') + '">' + teks + '</span>';
  }

  function baris(label, isi, cls) {
    return (
      '<div class="pair-row' +
      (cls ? ' ' + cls : '') +
      '">' +
      '<span class="pair-row__label">' +
      label +
      '</span>' +
      isi.join('<span class="pair-plus" aria-hidden="true">+</span>') +
      '</div>'
    );
  }

  var atas = kolom.map(function (k) {
    return sel(esc(k.atas), 'pair-cell--a');
  });
  var bawah = kolom.map(function (k) {
    return sel(esc(k.bawah), 'pair-cell--b');
  });
  var jumlah = kolom.map(function (k, i) {
    if (k.titik) return sel('…', 'pair-cell--sum');
    if (State.aljabarKlik[i]) return sel(esc(D.hasilPasangan), 'pair-cell--sum is-open');
    return (
      '<button type="button" class="pair-cell pair-cell--btn" data-pair="' +
      i +
      '" aria-label="Jumlahkan ' +
      esc(k.atas + ' dan ' + k.bawah) +
      '">＋ jumlahkan</button>'
    );
  });

  return (
    '<div class="pair-grid" role="group" aria-label="Deret maju dan mundur">' +
    baris('Sₙ =', atas) +
    baris('Sₙ =', bawah) +
    baris('2Sₙ =', jumlah, 'pair-row--sum') +
    '</div>'
  );
}

function renderOlahAljabar(container) {
  var D = DATA.olahAljabar;
  var semuaKlik = aljabarSemuaDiklik();

  var tanyaHTML = '';
  var semuaBenar = false;
  if (semuaKlik) {
    for (var i = 0; i < D.pertanyaan.length; i++) {
      var q = D.pertanyaan[i];
      var dipilih = State.aljabarPilih[q.id] || null;
      var benar = dipilih === q.correct;
      tanyaHTML += buildDlPanel(
        '<p class="exercise-label">' +
          '<span class="dl-step__num">' +
          (i + 1) +
          '</span>' +
          esc(q.tanya) +
          '</p>' +
          buildChoiceGroup(q.opsi, State.aljabarOrders[q.id], {
            chosen: dipilih,
            correctId: benar ? q.correct : null,
            grade: true,
            locked: benar,
            group: q.id,
          }) +
          buildChoiceFeedback(dipilih, benar, q.umpan)
      );
      if (!benar) break;
      if (i === D.pertanyaan.length - 1) semuaBenar = true;
    }
  }

  container.innerHTML =
    '<section aria-label="Bukti Aljabar Rumus Jumlah n Suku">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.instruksi) +
        '</p>' +
        buildPairGrid() +
        (semuaKlik
          ? buildFeedbackBox(
              'info',
              '🔍',
              'Semua kolom bernilai sama: <strong>' + esc(D.hasilPasangan) + '</strong>.'
            )
          : '<p class="dl-caption">Klik tombol “＋ jumlahkan” di setiap kolom.</p>')
    ) +
    tanyaHTML +
    (semuaBenar
      ? buildDlPanel(
          '<div class="formula-duo">' +
            '<div class="formula-card"><span class="formula-card__label">Jika Uₙ diketahui</span>Sₙ = n/2 × (a + Uₙ)</div>' +
            '<div class="formula-card"><span class="formula-card__label">Jika a, b, n diketahui</span>Sₙ = n/2 × (2a + (n − 1)b)</div>' +
            '</div>',
          'panel--hero'
        ) + buildDlNextButton('aljabarNextBtn', D.nextLabel)
      : '') +
    '</section>';

  container.querySelectorAll('[data-pair]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.aljabarKlik[+btn.dataset.pair] = true;
      saveState();
      if (aljabarSemuaDiklik())
        showNotice('Semua pasangan terjumlahkan! Apa yang kamu perhatikan?');
      renderOlahAljabar(container);
    });
  });

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var qid = btn.dataset.group;
      var q = D.pertanyaan.filter(function (p) {
        return p.id === qid;
      })[0];
      if (!q || State.aljabarPilih[qid] === q.correct) return;
      State.aljabarPilih[qid] = btn.dataset.optId;
      saveState();
      renderOlahAljabar(container);
    });
  });

  bindNext('aljabarNextBtn', 'olahAljabar', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A: uji dua bentuk rumus pada data. B: buktikan dugaan awal.
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

function buildDugaanBanding() {
  var S = DATA.stimulasi;
  var benarId = DATA.verifikasi.dugaanBenar;
  var cocok = State.stimulasiPilihan === benarId;
  return (
    '<div class="dugaan-compare">' +
    '<div class="dugaan-row' +
    (cocok ? ' dugaan-row--ok' : '') +
    '">' +
    '<span class="dugaan-row__title">Total blok 30 anak tangga</span>' +
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

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        buildSequenceTiles(sukuDaftar(DATA.tangga.maxN), { showDiff: true }) +
        buildGrupSteps('A')
    ) +
    (selesaiA
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            buildSequenceTiles(sukuDaftar(4), {
              showDiff: true,
              more: true,
              tail: DATA.stimulasi.tail,
            }) +
            buildGrupSteps('B') +
            (selesaiB ? buildDugaanBanding() : '')
        )
      : '') +
    (selesaiA && selesaiB ? buildDlNextButton('verifNextBtn', D.nextLabel) : '') +
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
          '<h3 style="margin-top:0;">Rangkuman Jumlah n Suku Pertama Deret Aritmetika</h3>' +
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
  stripPunctuation: true,
  revealButtonStyle: 'separate',
  invalidMessage: 'Tulis jawaban berupa bilangan bulat, mis. 720 atau 585.000.',
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
  var langkahBukti = State.visualSteps.concat(State.verifSteps);
  var sekaliCoba = langkahBukti.filter(function (s) {
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
        kartu(sekaliCoba + '/' + langkahBukti.length, 'Langkah bukti benar sekali coba') +
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
    '<div class="formula-card"><span class="formula-card__label">Jika Uₙ diketahui</span>Sₙ = n/2 × (a + Uₙ)</div>' +
    '<div class="formula-card"><span class="formula-card__label">Jika a, b, n diketahui</span>Sₙ = n/2 × (2a + (n − 1)b)</div>' +
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
    'Kemampuan murid menjelaskan bukti visual dan aljabar dengan kata-kata sendiri tetap menjadi bahan penilaian utama.' +
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
  olahVisual: renderOlahVisual,
  olahAljabar: renderOlahAljabar,
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
