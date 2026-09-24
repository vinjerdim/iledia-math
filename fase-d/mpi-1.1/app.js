'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Membaca, Menulis & Menempatkan Bilangan Bulat
   Fase D — SMP Kelas 7

   Utilitas bersama (esc, formatNumber, shuffleArray, showNotice,
   buildFeedbackBox, createStageMachine, createExerciseStage,
   createStore, komponen Discovery Learning, bacaBilanganBulat,
   buildNumberLinePicker/bindNumberLinePicker) berada di
   shared/engine.js.

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   Seluruh pilihan jawaban DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder()/ensureSortStates(). Pengacakan dilakukan
   SEKALI saat state disiapkan (initExerciseArrays), lalu urutannya
   disimpan di State — bukan saat render. Dengan begitu pilihan tidak
   melompat-lompat setiap kali tahap dirender ulang, tetapi teracak
   ulang untuk setiap murid dan setiap kali Reset. Urutan bilangan
   yang ditempatkan pada garis bilangan juga diacak dengan cara yang
   sama.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render (pertanyaan bertingkat, skala tegak,
       penempatan pada garis bilangan)
    5. Stage: Stimulasi            (DL sintaks 1)
    6. Stage: Identifikasi Masalah (DL sintaks 2)
    7. Stage: Pengumpulan Data     (DL sintaks 3)
    8. Stage: Baca & Tulis         (DL sintaks 4a)
    9. Stage: Garis Bilangan       (DL sintaks 4b)
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
  'olahBaca',
  'olahGaris',
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
  'Baca & Tulis',
  'Garis Bilangan',
  'Bukti',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-d-1-1-bilbulat-dl-v2';

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'stimulasi',
  completedStages: {},

  /* Tahap 1 — stimulasi */
  stimulasiOrder: null,
  stimulasiPilihan: null,
  stimulasiAlasan: '',

  /* Tahap 2 — identifikasi masalah */
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',

  /* Tahap 3 — pengumpulan data */
  koleksiSteps: [],
  amatiOrder: null,
  amatiPilihan: null,

  /* Tahap 4a — baca & tulis */
  pilahStates: {},
  pilahOrder: null,
  bacaOrders: {},
  bacaPilih: {},

  /* Tahap 4b — garis bilangan */
  garisOrder: null,
  garisPlace: null,
  tanyaOrders: {},
  tanyaPilih: {},

  /* Tahap 5 — pembuktian */
  verifStates: {},
  verifOrder: null,
  ujiValues: null,
  ujiPlace: null,

  /* Tahap 6 — menarik kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 7 — uji terap */
  terapkanIdx: 0,
  terapkanExercises: [],

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

/* State penempatan bilangan pada garis bilangan. */
function ensurePlaceState(key) {
  var st = State[key];
  if (!st || typeof st !== 'object' || typeof st.idx !== 'number') {
    State[key] = { idx: 0, salah: null, wrong: {} };
  }
  if (!State[key].wrong || typeof State[key].wrong !== 'object') State[key].wrong = {};
}

/* Mengambil `n` bilangan acak dari kumpulan, minimal satu negatif & satu positif. */
function pilihUjiAcak(kumpulan, n) {
  var hasil = [];
  for (var coba = 0; coba < 50; coba++) {
    hasil = shuffleArray(kumpulan).slice(0, n);
    var adaNeg = hasil.some(function (v) {
      return v < 0;
    });
    var adaPos = hasil.some(function (v) {
      return v > 0;
    });
    if (adaNeg && adaPos) break;
  }
  return hasil;
}

function ujiValuesValid() {
  var V = DATA.verifikasi;
  return (
    Array.isArray(State.ujiValues) &&
    State.ujiValues.length === V.banyakUji &&
    State.ujiValues.every(function (v) {
      return V.kumpulan.indexOf(v) !== -1;
    })
  );
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
  ensureExerciseArray(State, 'koleksiSteps', DATA.koleksi.situasi, makeDlStep);
  ensureShuffledOrder(State, 'amatiOrder', DATA.koleksi.amati.opsi);

  /* Tahap 4a */
  ensureSortStates(
    State,
    'pilahStates',
    'pilahOrder',
    DATA.olahBaca.pilah,
    DATA.olahBaca.opsiPilah
  );
  if (!State.bacaOrders || typeof State.bacaOrders !== 'object') State.bacaOrders = {};
  if (!State.bacaPilih || typeof State.bacaPilih !== 'object') State.bacaPilih = {};
  DATA.olahBaca.baca.forEach(function (q) {
    ensureShuffledOrder(State.bacaOrders, q.id, q.opsi);
  });

  /* Tahap 4b — urutan bilangan dari tabel data diacak */
  ensureShuffledOrder(State, 'garisOrder', DATA.koleksi.situasi);
  ensurePlaceState('garisPlace');
  if (!State.tanyaOrders || typeof State.tanyaOrders !== 'object') State.tanyaOrders = {};
  if (!State.tanyaPilih || typeof State.tanyaPilih !== 'object') State.tanyaPilih = {};
  DATA.olahGaris.tanya.forEach(function (q) {
    ensureShuffledOrder(State.tanyaOrders, q.id, q.opsi);
  });

  /* Tahap 5 */
  ensureSortStates(
    State,
    'verifStates',
    'verifOrder',
    DATA.verifikasi.pernyataan,
    DATA.verifikasi.opsiPernyataan
  );
  if (!ujiValuesValid()) {
    State.ujiValues = pilihUjiAcak(DATA.verifikasi.kumpulan, DATA.verifikasi.banyakUji);
    State.ujiPlace = null;
  }
  ensurePlaceState('ujiPlace');

  /* Tahap 6 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);
  if (!State.simpulanPilihan || typeof State.simpulanPilihan !== 'object') {
    State.simpulanPilihan = {};
  }

  /* Tahap 7 — uji terap (dirender createExerciseStage) */
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

/* Notasi baku dengan lambang minus tipografis (−). */
function fmt(n) {
  return formatNumber(n, '−');
}

function numChip(n, big) {
  return '<span class="num-chip' + (big ? ' num-chip--lg' : '') + '">' + fmt(n) + '</span>';
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
 * Kumpulan pertanyaan pilihan bertingkat: boleh dicoba lagi sampai
 * benar, lalu terkunci. Urutan opsi tiap pertanyaan diambil dari
 * `orders[q.id]` (diacak di initExerciseArrays).
 *   q = { id, teks|tanya, opsi, correct, umpan }
 */
function buildQuizList(list, orders, pilih) {
  return list
    .map(function (q, i) {
      var chosen = pilih[q.id] || null;
      var benar = chosen === q.correct;
      return (
        '<div class="quiz-item">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        (q.tanya || q.teks) +
        '</p>' +
        buildChoiceGroup(q.opsi, orders[q.id], {
          chosen: chosen,
          correctId: benar ? q.correct : null,
          grade: true,
          locked: benar,
          group: q.id,
          attr: 'data-q-opt',
        }) +
        buildChoiceFeedback(chosen, benar, q.umpan) +
        '</div>'
      );
    })
    .join('');
}

function bindQuizList(root, list, pilih, rerender) {
  var byId = {};
  list.forEach(function (q) {
    byId[q.id] = q;
  });
  root.querySelectorAll('[data-q-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var q = byId[btn.dataset.group];
      if (!q || pilih[q.id] === q.correct) return;
      pilih[q.id] = btn.dataset.qOpt;
      saveState();
      rerender();
    });
  });
}

function quizSemuaBenar(list, pilih) {
  return list.every(function (q) {
    return pilih[q.id] === q.correct;
  });
}

/*
 * Skala tegak (termometer/lift/permukaan laut): hanya 0 yang berlabel,
 * sehingga murid menghitung sendiri jarak titik dari nol. Setelah
 * dijawab benar, bilangannya ikut ditampilkan di samping titik.
 */
function buildSkalaTegak(sit, done) {
  var max = DATA.koleksi.skalaMax;
  var rows = '';
  for (var v = max; v >= -max; v--) {
    var cls = 'skala__row';
    if (v === 0) cls += ' skala__row--nol';
    else if (v > 0) cls += ' skala__row--atas';
    else cls += ' skala__row--bawah';
    var titik = v === sit.jawab;
    rows +=
      '<div class="' +
      cls +
      (titik ? ' is-titik' : '') +
      '">' +
      '<span class="skala__num">' +
      (v === 0 ? '0' : '') +
      '</span>' +
      '<span class="skala__tick"></span>' +
      (titik
        ? '<span class="skala__marker"><span aria-hidden="true">' +
          sit.ikon +
          '</span>' +
          (done ? '<strong>' + fmt(v) + '</strong>' : '') +
          '</span>'
        : '') +
      '</div>';
  }
  return (
    '<div class="skala" role="img" aria-label="' +
    esc(
      'Skala tegak ' +
        sit.konteks +
        ': titik berada ' +
        (sit.jawab === 0 ? 'tepat di nol' : Math.abs(sit.jawab) + ' langkah ' + sit.posisi)
    ) +
    '">' +
    '<span class="skala__cap">' +
    esc(sit.konteks) +
    '</span>' +
    rows +
    '</div>'
  );
}

/*
 * Aktivitas menempatkan bilangan satu per satu pada garis bilangan.
 *   items  [{ value, teks }] dalam urutan tampil (sudah diacak)
 *   st     { idx, salah, wrong: { <idx>: banyak salah } }
 *   cfg    { min, max, labelEvery }
 */
function placementDone(items, st) {
  return st.idx >= items.length;
}

function arahDari0(v) {
  if (v === 0) return '0 adalah titik acuan di tengah garis bilangan.';
  return (
    fmt(v) +
    ' berada ' +
    Math.abs(v) +
    ' langkah di sebelah ' +
    (v < 0 ? 'kiri' : 'kanan') +
    ' 0. Hitung langkahnya mulai dari 0.'
  );
}

function buildPlacement(pid, items, st, cfg) {
  var done = placementDone(items, st);
  var marks = items.slice(0, Math.min(st.idx, items.length)).map(function (it) {
    return { value: it.value, label: fmt(it.value) };
  });
  if (!done && st.salah !== null && st.salah !== undefined) {
    marks.push({ value: st.salah, label: fmt(st.salah) + '?', tone: 'bad' });
  }

  var head = '';
  var feedback = '';
  if (done) {
    feedback = buildFeedbackBox(
      'success',
      '✓',
      '<strong>Semua bilangan sudah menempati titik yang tepat.</strong>'
    );
  } else {
    var target = items[st.idx];
    head =
      '<div class="place-target">' +
      '<span class="place-target__count">Bilangan ' +
      (st.idx + 1) +
      ' dari ' +
      items.length +
      '</span>' +
      '<span>Ketuk letak ' +
      numChip(target.value, true) +
      (target.teks ? ' <span class="dl-caption">(' + esc(target.teks) + ')</span>' : '') +
      '</span>' +
      '</div>';
    if (st.salah !== null && st.salah !== undefined) {
      var nSalah = st.wrong[st.idx] || 0;
      feedback = buildFeedbackBox(
        'warning',
        '💭',
        'Titik yang kamu ketuk adalah <strong>' +
          fmt(st.salah) +
          '</strong>, bukan ' +
          fmt(target.value) +
          '. ' +
          (nSalah >= 2
            ? arahDari0(target.value)
            : 'Periksa lagi: ' +
              fmt(target.value) +
              (target.value === 0
                ? ' adalah titik acuan.'
                : ' berada di sebelah kiri atau kanan 0? Berapa langkah dari 0?'))
      );
    }
  }

  return (
    head +
    buildNumberLinePicker(pid, {
      min: cfg.min,
      max: cfg.max,
      labelEvery: cfg.labelEvery,
      marks: marks,
      interactive: !done,
      sides: true,
    }) +
    feedback
  );
}

function bindPlacement(root, pid, items, st, rerender) {
  bindNumberLinePicker(root, pid, function (v) {
    if (placementDone(items, st)) return;
    var target = items[st.idx].value;
    if (v === target) {
      st.idx += 1;
      st.salah = null;
    } else {
      st.salah = v;
      st.wrong[st.idx] = (st.wrong[st.idx] || 0) + 1;
    }
    saveState();
    rerender();
  });
}

/* Banyak bilangan yang tepat ditempatkan pada ketukan pertama. */
function placementSekaliCoba(items, st) {
  var n = 0;
  for (var i = 0; i < Math.min(st.idx, items.length); i++) {
    if (!st.wrong[i]) n += 1;
  }
  return n;
}

/* Bilangan dari tabel data (tahap 3) dalam urutan acak tersimpan. */
function garisItems() {
  return orderByIds(DATA.koleksi.situasi, State.garisOrder).map(function (s) {
    return { value: s.jawab, teks: s.konteks };
  });
}

function ujiItems() {
  return State.ujiValues.map(function (v) {
    return { value: v, teks: '' };
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
      '<h2 style="margin-top:0;">📰 ' +
        esc(D.judul) +
        '</h2>' +
        '<div class="stimulasi-hero">' +
        '<div class="stimulasi-hero__icon" aria-hidden="true">🥶</div>' +
        '<p style="margin:0;">' +
        esc(D.cerita) +
        '</p>' +
        '</div>' +
        '<div class="catatan-grid">' +
        D.tulisan
          .map(function (t) {
            return (
              '<div class="catatan-card">' +
              '<span class="catatan-card__nama">Catatan ' +
              esc(t.nama) +
              '</span>' +
              '<span class="catatan-card__teks">' +
              esc(t.teks) +
              '</span>' +
              '</div>'
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
   Situasi dibuka satu per satu; setelah semua tercatat, tabel data
   dan pertanyaan pengamatan ditampilkan.
   ============================================================ */

function koleksiSemuaSelesai() {
  return State.koleksiSteps.every(function (s) {
    return s.done;
  });
}

function buildTabelData() {
  return (
    '<div class="table-scroll">' +
    '<table class="data-table">' +
    '<thead><tr><th scope="col">Situasi</th><th scope="col">Posisi terhadap 0</th>' +
    '<th scope="col">Tulisan</th><th scope="col">Dibaca</th></tr></thead>' +
    '<tbody>' +
    DATA.koleksi.situasi
      .map(function (s) {
        var cls = s.jawab < 0 ? 'is-neg' : s.jawab > 0 ? 'is-pos' : 'is-nol';
        return (
          '<tr class="' +
          cls +
          '"><td><span aria-hidden="true">' +
          s.ikon +
          '</span> ' +
          esc(s.konteks) +
          '</td><td>' +
          (s.jawab === 0 ? 'tepat di 0' : Math.abs(s.jawab) + ' ' + esc(s.posisi)) +
          '</td><td class="data-table__num">' +
          fmt(s.jawab) +
          '</td><td>"' +
          esc(bacaBilanganBulat(s.jawab)) +
          '"</td></tr>'
        );
      })
      .join('') +
    '</tbody></table>' +
    '</div>'
  );
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var A = D.amati;
  var semua = koleksiSemuaSelesai();
  var amatiBenar = State.amatiPilihan === A.correct;

  var kartu = '';
  for (var i = 0; i < D.situasi.length; i++) {
    var sit = D.situasi[i];
    var st = State.koleksiSteps[i];
    kartu +=
      '<div class="situasi-card' +
      (st.done ? ' is-done' : '') +
      '">' +
      buildSkalaTegak(sit, st.done) +
      '<div class="situasi-card__body">' +
      buildDlStep('ks' + i, st, sit, i + 1) +
      '</div>' +
      '</div>';
    if (!st.done) break;
  }

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    '<div class="situasi-list">' +
    kartu +
    '</div>' +
    (semua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📋 Tabel Data Kelompokmu</h3>' +
            buildTabelData() +
            '<div class="quiz-item" style="margin-top:var(--space-5);">' +
            '<p class="exercise-label">' +
            esc(A.pertanyaan) +
            '</p>' +
            buildChoiceGroup(A.opsi, State.amatiOrder, {
              chosen: State.amatiPilihan,
              correctId: amatiBenar ? A.correct : null,
              grade: true,
              locked: amatiBenar,
            }) +
            buildChoiceFeedback(State.amatiPilihan, amatiBenar, A.umpan) +
            '</div>'
        )
      : '') +
    (semua && amatiBenar ? buildDlNextButton('koleksiNextBtn', D.nextLabel) : '') +
    '</section>';

  D.situasi.forEach(function (sit, i) {
    bindDlStep('ks' + i, State.koleksiSteps[i], sit, saveState, function () {
      renderKoleksi(container);
    });
  });

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.amatiPilihan === A.correct) return;
      State.amatiPilihan = btn.dataset.optId;
      saveState();
      renderKoleksi(container);
    });
  });

  bindNext('koleksiNextBtn', 'koleksi', 'olahBaca');
}

/* ============================================================
   8. STAGE: BACA & TULIS  (Discovery Learning — sintaks 4a)
   Bagian A: pilah jenis bilangan (sekali jawab, langsung dibahas).
   Bagian B: pasangkan notasi ↔ cara baca (boleh coba lagi).
   ============================================================ */

function renderOlahBaca(container) {
  var D = DATA.olahBaca;
  var pilahSelesai = sortItemsAllAnswered(D.pilah, State.pilahStates);
  var bacaSelesai = quizSemuaBenar(D.baca, State.bacaPilih);
  var rerender = function () {
    renderOlahBaca(container);
  };

  container.innerHTML =
    '<section aria-label="Pengolahan Data: Baca dan Tulis">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p class="dl-caption">' +
        esc(D.instruksiA) +
        '</p>' +
        buildSortItems(D.pilah, State.pilahOrder, D.opsiPilah, State.pilahStates, { mono: true })
    ) +
    (pilahSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(D.instruksiB) +
            '</p>' +
            buildQuizList(D.baca, State.bacaOrders, State.bacaPilih)
        )
      : '') +
    (pilahSelesai && bacaSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">💡 Temuanmu</h3>' +
            '<ul class="temuan-list">' +
            D.temuan
              .map(function (t) {
                return '<li>' + t + '</li>';
              })
              .join('') +
            '</ul>',
          'panel--hero'
        ) + buildDlNextButton('bacaNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, D.pilah, State.pilahStates, saveState, rerender);
  bindQuizList(container, D.baca, State.bacaPilih, rerender);
  bindNext('bacaNextBtn', 'olahBaca', 'olahGaris');
}

/* ============================================================
   9. STAGE: GARIS BILANGAN  (Discovery Learning — sintaks 4b)
   ============================================================ */

function renderOlahGaris(container) {
  var D = DATA.olahGaris;
  var items = garisItems();
  var st = State.garisPlace;
  var tempatSelesai = placementDone(items, st);
  var tanyaSelesai = quizSemuaBenar(D.tanya, State.tanyaPilih);
  var rerender = function () {
    renderOlahGaris(container);
  };

  container.innerHTML =
    '<section aria-label="Pengolahan Data: Garis Bilangan">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel(
      buildPlacement('garisPicker', items, st, {
        min: D.min,
        max: D.max,
        labelEvery: D.labelEvery,
      })
    ) +
    (tempatSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🔍 Amati garis bilanganmu</h3>' +
            buildQuizList(D.tanya, State.tanyaOrders, State.tanyaPilih)
        )
      : '') +
    (tempatSelesai && tanyaSelesai
      ? buildDlPanel('<p style="margin:0;">💡 ' + D.temuan + '</p>', 'panel--hero') +
        buildDlNextButton('garisNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindPlacement(container, 'garisPicker', items, st, rerender);
  bindQuizList(container, D.tanya, State.tanyaPilih, rerender);
  bindNext('garisNextBtn', 'olahGaris', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   ============================================================ */

function buildDugaanBanding() {
  var S = DATA.stimulasi;
  var benarId = DATA.verifikasi.dugaanBenar;
  var cocok = State.stimulasiPilihan === benarId;
  return (
    '<div class="dugaan-compare">' +
    '<div class="dugaan-row' +
    (cocok ? ' dugaan-row--ok' : '') +
    '">' +
    '<span class="dugaan-row__title">Tulisan "3 derajat di bawah nol"</span>' +
    '<span>Dugaanmu: <strong>' +
    (findOptionLabel(S.opsi, State.stimulasiPilihan) || '—') +
    '</strong></span>' +
    '<span>Notasi baku: <strong>' +
    findOptionLabel(S.opsi, benarId) +
    '</strong>, dibaca "negatif tiga derajat Celsius"</span>' +
    '<span class="dugaan-row__verdict">' +
    (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh temuanmu') +
    '</span>' +
    '</div>' +
    '</div>' +
    (State.masalahHipotesis
      ? '<div class="hipotesis-box">' +
        '<span class="hipotesis-box__label">Hipotesismu di tahap 2</span>' +
        '<p>' +
        esc(State.masalahHipotesis) +
        '</p>' +
        '<span class="dl-caption">Apakah hipotesismu sesuai dengan temuanmu? Diskusikan dengan pasanganmu.</span>' +
        '</div>'
      : '')
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var items = ujiItems();
  var st = State.ujiPlace;
  var pernyataanSelesai = sortItemsAllAnswered(D.pernyataan, State.verifStates);
  var ujiSelesai = placementDone(items, st);
  var rerender = function () {
    renderVerifikasi(container);
  };

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        buildSortItems(D.pernyataan, State.verifOrder, D.opsiPernyataan, State.verifStates)
    ) +
    (pernyataanSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(D.instruksiB) +
            '</p>' +
            buildPlacement('ujiPicker', items, st, {
              min: D.min,
              max: D.max,
              labelEvery: D.labelEvery,
            })
        )
      : '') +
    (pernyataanSelesai && ujiSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' + esc(D.judulC) + '</h3>' + buildDugaanBanding()
        ) + buildDlNextButton('verifNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, D.pernyataan, State.verifStates, saveState, rerender);
  bindPlacement(container, 'ujiPicker', items, st, rerender);
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
          '<h3 style="margin-top:0;">Rangkuman Notasi Baku Bilangan Bulat</h3>' +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + r + '</li>'
                );
              })
              .join('') +
            '</ol>' +
            buildNumberLinePicker('rangkumanGaris', {
              min: -5,
              max: 5,
              interactive: false,
              sides: true,
              aria: 'Garis bilangan dari negatif lima sampai lima: bilangan negatif di kiri nol, positif di kanan nol',
            }),
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
  allowNegative: true,
  revealButtonStyle: 'separate',
  invalidMessage: 'Tulis jawaban berupa bilangan bulat, mis. −18 atau 4.',
  afterRender: centerNumberLines,
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
      (s.garis
        ? buildNumberLinePicker('trGaris', {
            min: s.garis.min,
            max: s.garis.max,
            labelEvery: s.garis.labelEvery,
            interactive: false,
            marks: [{ value: s.garis.titik, label: s.garis.label, tone: 'target' }],
            aria:
              'Garis bilangan dengan titik ' +
              s.garis.label +
              '. Label angka hanya pada kelipatan ' +
              s.garis.labelEvery,
          })
        : '') +
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
  var pilahSemua = DATA.olahBaca.pilah.length + DATA.verifikasi.pernyataan.length;
  var pilahBenar =
    sortItemsCorrectCount(DATA.olahBaca.pilah, State.pilahStates) +
    sortItemsCorrectCount(DATA.verifikasi.pernyataan, State.verifStates);
  var gItems = garisItems();
  var uItems = ujiItems();
  var tempatSemua = gItems.length + uItems.length;
  var tempatSekali =
    placementSekaliCoba(gItems, State.garisPlace) + placementSekaliCoba(uItems, State.ujiPlace);
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
        kartu(pilahBenar + '/' + pilahSemua, 'Pemilahan & pernyataan benar') +
        kartu(tempatSekali + '/' + tempatSemua, 'Titik tepat pada ketukan pertama') +
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
    '<div class="formula-card"><span class="formula-card__label">Bilangan negatif</span>−5 → "negatif lima"</div>' +
    '<div class="formula-card"><span class="formula-card__label">Bilangan positif</span>5 atau +5 → "lima" / "positif lima"</div>' +
    '</div>' +
    buildNumberLinePicker('selesaiGaris', {
      min: -6,
      max: 6,
      interactive: false,
      sides: true,
      marks: [
        { value: -5, label: '−5' },
        { value: 5, label: '5' },
      ],
      aria: 'Garis bilangan: −5 berada 5 langkah di kiri nol, 5 berada 5 langkah di kanan nol',
    }) +
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
    'Kemampuan murid membaca bilangan dengan lantang dan menjelaskan letaknya pada garis bilangan tetap menjadi bahan penilaian utama.' +
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
  olahBaca: renderOlahBaca,
  olahGaris: renderOlahGaris,
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
  centerNumberLines(container);
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
