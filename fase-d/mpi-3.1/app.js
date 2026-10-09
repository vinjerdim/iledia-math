'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Rasio & Rasio Ekuivalen dalam Situasi Sehari-hari
   — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen bersama: buildDiscoveryHead, buildTeacherNote,
       buildTpPanel, buildChoiceGroup, buildSortItems,
       buildGuidedQuizList, buildDlStep, buildDlPanel,
       buildDlNextButton, buildHintToggle, buildHintStack;
     • seksi 68: buildIsianRasio / bindIsianRasio (isian rasio dengan
       tombol sisip " : ");
     • seksi 67 (rasio & rasio ekuivalen): periksaSoalRasio,
       jawabSoalRasio, diagnosaRasioHilang, sederhanakanRasio,
       jenisAksiDicoba, serta tampilan buildGelasCampuran,
       buildIkonRasio, buildPitaRasio, buildTabelRasio,
       buildCekSetara, buildPencampurRasio.

   Alur tahap mengikuti sintaks Inquiry Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan orientasi, rumusan
   masalah, hipotesis, pertanyaan temuan, pemilahan pasangan rasio,
   pernyataan uji, bank kesimpulan, opsi uji terap, penilaian diri)
   DIACAK dengan shuffleArray() melalui ensureShuffledOrder() /
   ensureSortStates(). Pengacakan dilakukan SEKALI saat state disiapkan
   (initExerciseArrays) lalu urutannya disimpan di State — bukan saat
   render — sehingga pilihan tidak melompat saat dirender ulang, tetapi
   teracak ulang untuk setiap murid dan setiap Reset. Soal uji terap
   juga dipilih acak dari bank (pilihSoalTerap).

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi               (IL sintaks 1)
    6. Stage: Merumuskan Masalah      (IL sintaks 2)
    7. Stage: Merumuskan Hipotesis    (IL sintaks 3)
    8. Stage: Lab Amati Rasio         (IL sintaks 4a)
    9. Stage: Lab Racik               (IL sintaks 4b)
   10. Stage: Lab Cek Ekuivalen       (IL sintaks 4c)
   11. Stage: Menguji Hipotesis       (IL sintaks 5)
   12. Stage: Merumuskan Kesimpulan   (IL sintaks 6)
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

var STAGES = DATA.tahap.map(function (t) {
  return t.id;
});
var STAGE_LABELS = DATA.tahap.map(function (t) {
  return t.label;
});
var STORAGE_KEY = 'mpi-d-3-1-rasio-ekuivalen-v1';

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Tahap 1 — orientasi */
  dugaanOrders: {},
  dugaanPilih: {},
  orientasiAlasan: '',

  /* Tahap 2 — merumuskan masalah */
  masalahOrder: null,
  masalahPilihan: null,

  /* Tahap 3 — merumuskan hipotesis */
  hipotesisOrders: {},
  hipotesisPilih: {},
  hipotesisTeks: '',

  /* Tahap 4a — Lab Amati Rasio */
  rasioSteps: [],
  temuanRasioOrders: {},
  temuanRasioPilih: {},

  /* Tahap 4b — Lab Racik */
  pencampur: {},
  pitaGrup: false,
  setaraSteps: [],
  temuanSetaraOrders: {},
  temuanSetaraPilih: {},

  /* Tahap 4c — Lab Cek Ekuivalen */
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 5 — menguji hipotesis */
  ujiStates: {},
  ujiOrder: null,

  /* Tahap 6 — merumuskan kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 7 — uji terap */
  terapkanPick: null,
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

/* Memastikan State[key] berupa objek biasa (peta id → nilai). */
function ensureMap(key) {
  if (!State[key] || typeof State[key] !== 'object' || Array.isArray(State[key])) {
    State[key] = {};
  }
  return State[key];
}

/* Mengacak urutan opsi untuk setiap pertanyaan { id, opsi } dalam daftar. */
function ensureListOrders(key, list) {
  var map = ensureMap(key);
  list.forEach(function (q) {
    ensureShuffledOrder(map, q.id, q.opsi);
  });
}

/* State satu langkah isian rasio (makeDlStep + kode diagnosa terakhir). */
function makeRasioStep() {
  var st = makeDlStep();
  st.kode = null;
  return st;
}

/*
 * Soal uji terap yang sedang dipakai. Array ini DIISI ULANG di tempat
 * (bukan diganti) karena createExerciseStage menyimpan referensinya.
 */
var TERAP_SOAL = [];

/* Memilih soal acak dari bank sesuai komposisi, lalu mengacak urutannya. */
function pilihSoalTerap() {
  var T = DATA.terapkan;
  var ids = [];
  Object.keys(T.komposisi).forEach(function (k) {
    var kelompok = T.soal.filter(function (s) {
      return s.type === k;
    });
    shuffleArray(kelompok)
      .slice(0, T.komposisi[k])
      .forEach(function (s) {
        ids.push(s.id);
      });
  });
  return shuffleArray(ids);
}

function terapPickValid() {
  var pick = State.terapkanPick;
  if (!Array.isArray(pick) || pick.length !== DATA.terapkan.banyak) return false;
  var ada = optionIds(DATA.terapkan.soal);
  return pick.every(function (id, i) {
    return ada.indexOf(id) !== -1 && pick.indexOf(id) === i;
  });
}

function isiTerapSoal() {
  var byId = {};
  DATA.terapkan.soal.forEach(function (s) {
    byId[s.id] = s;
  });
  TERAP_SOAL.length = 0;
  State.terapkanPick.forEach(function (id) {
    TERAP_SOAL.push(byId[id]);
  });
}

/* Butir pemilahan Lab Cek: { id, teks, correct, explanation }. */
var PILAH_ITEMS = DATA.dataPilah.pasangan.map(function (p) {
  return {
    id: p.id,
    teks: buildKonteksTag(p.konteks) + ' ' + esc(p.teks),
    correct: p.correct,
    explanation: esc(p.explanation),
    sumber: p,
  };
});

/*
 * Menyiapkan seluruh state per-langkah DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1–3 */
  ensureListOrders('dugaanOrders', DATA.orientasi.dugaan);
  ensureMap('dugaanPilih');
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);
  ensureListOrders('hipotesisOrders', DATA.hipotesis.dugaan);
  ensureMap('hipotesisPilih');

  /* Tahap 4a */
  ensureExerciseArray(State, 'rasioSteps', DATA.dataRasio.situasi, makeRasioStep);
  ensureListOrders('temuanRasioOrders', DATA.dataRasio.temuan);
  ensureMap('temuanRasioPilih');

  /* Tahap 4b */
  var L = DATA.dataSetara.lab;
  ensurePencampurState(ensureMap('pencampur'), L.a, L.b);
  ensureExerciseArray(State, 'setaraSteps', DATA.dataSetara.langkah, makeDlStep);
  ensureListOrders('temuanSetaraOrders', DATA.dataSetara.temuan);
  ensureMap('temuanSetaraPilih');

  /* Tahap 4c */
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.dataPilah.kategori);

  /* Tahap 5 */
  ensureSortStates(State, 'ujiStates', 'ujiOrder', DATA.uji.pernyataan, DATA.uji.opsiPernyataan);

  /* Tahap 6 */
  ensureShuffledOrder(State, 'bankOrder', DATA.simpulan.bank);
  ensureMap('simpulanPilihan');

  /* Tahap 7 — soal dipilih acak dari bank; opsi tiap soal diacak */
  if (!terapPickValid()) {
    State.terapkanPick = pilihSoalTerap();
    State.terapkanExercises = [];
    State.terapkanIdx = 0;
  }
  isiTerapSoal();
  ensureExerciseArray(State, 'terapkanExercises', TERAP_SOAL, function (s) {
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
  if (State.terapkanIdx >= TERAP_SOAL.length || State.terapkanIdx < 0) {
    State.terapkanIdx = 0;
  }

  /* Tahap 8 */
  ensureMap('refleksiAnswers');
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

/* Label konteks: ikon + nama (Minuman, Kelas, …). */
function buildKonteksTag(konteks) {
  var K = DATA.konteks[konteks];
  return (
    '<span class="rasio-konteks rasio-konteks--' +
    konteks +
    '"><span aria-hidden="true">' +
    K.ikon +
    '</span> ' +
    esc(K.nama) +
    '</span>'
  );
}

/* Indeks langkah pertama yang belum selesai (= panjang daftar bila semua selesai). */
function langkahAktif(steps) {
  for (var i = 0; i < steps.length; i++) if (!steps[i].done) return i;
  return steps.length;
}

/* Panel pertanyaan temuan (pertanyaan penuntun berumpan balik). */
function buildTemuanPanel(list, orders, pilih) {
  return buildDlPanel(
    '<h3 style="margin-top:0;">💡 Apa temuanmu?</h3>' + buildGuidedQuizList(list, orders, pilih)
  );
}

/* Daftar pertanyaan pilihan yang TIDAK dinilai (dugaan). */
function buildDugaanList(list, orders, pilih, attr) {
  return list
    .map(function (q, i) {
      return (
        '<div class="quiz-item">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        esc(q.tanya) +
        '</p>' +
        buildChoiceGroup(q.opsi, orders[q.id], {
          chosen: pilih[q.id] || null,
          group: q.id,
          attr: attr,
        }) +
        '</div>'
      );
    })
    .join('');
}

function bindDugaanList(container, pilih, attr, rerender) {
  var dataKey = attr.replace(/^data-/, '').replace(/-([a-z])/g, function (m, c) {
    return c.toUpperCase();
  });
  container.querySelectorAll('[' + attr + ']').forEach(function (btn) {
    btn.addEventListener('click', function () {
      pilih[btn.dataset.group] = btn.dataset[dataKey];
      saveState();
      rerender();
    });
  });
}

function buildRingkasKartu(val, label) {
  return (
    '<div class="summary-card"><div class="summary-card__val">' +
    val +
    '</div><div class="summary-card__label">' +
    label +
    '</div></div>'
  );
}

/* Opsi gelas es sirup untuk gelas campuran (nama bahan & satuan). */
function opsiGelas(judul) {
  return {
    namaA: DATA.bahan.namaA,
    namaB: DATA.bahan.namaB,
    satuan: DATA.bahan.satuan,
    judul: judul,
  };
}

/* ============================================================
   5. STAGE: ORIENTASI  (Inquiry Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah.
   ============================================================ */

function dugaanLengkap() {
  return DATA.orientasi.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var lengkap = dugaanLengkap();
  var rerender = function () {
    renderOrientasi(container);
  };

  container.innerHTML =
    '<section aria-label="Orientasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🍹 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="gelas-grid">' +
        D.gelas
          .map(function (g) {
            return buildGelasCampuran(g.a, g.b, opsiGelas(g.nama + ' · racikan ' + g.siapa));
          })
          .join('') +
        '</div>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaanmu?</h3>' +
        buildDugaanList(D.dugaan, State.dugaanOrders, State.dugaanPilih, 'data-dugaan') +
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
        buildFeedbackBox('info', '🔎', esc(D.catatan))
    ) +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="orientasiNextBtn"' +
    (lengkap ? '' : ' disabled') +
    '>' +
    esc(D.nextLabel) +
    '</button>' +
    '</div>' +
    '</section>';

  bindDugaanList(container, State.dugaanPilih, 'data-dugaan', rerender);

  var ta = document.getElementById('orientasiAlasan');
  ta.addEventListener('input', function () {
    State.orientasiAlasan = ta.value;
    saveState();
  });

  document.getElementById('orientasiNextBtn').addEventListener('click', function () {
    if (!dugaanLengkap()) {
      showNotice('Pilih dugaanmu untuk setiap pertanyaan sebelum melanjutkan.');
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
        buildChoiceGroup(D.opsi, State.masalahOrder, {
          chosen: State.masalahPilihan,
          correctId: benar ? D.correct : null,
          grade: true,
          locked: benar,
        }) +
        buildGuidedChoiceFeedback(State.masalahPilihan, benar, D.umpan)
    ) +
    (benar ? buildDlNextButton('masalahNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.masalahPilihan === D.correct) return;
      State.masalahPilihan = btn.dataset.optId;
      saveState();
      renderMasalah(container);
    });
  });

  bindNext('masalahNextBtn', 'masalah', 'hipotesis');
}

/* ============================================================
   7. STAGE: MERUMUSKAN HIPOTESIS  (Inquiry Learning — sintaks 3)
   Pilihan dugaan TIDAK dinilai; diuji pada tahap Uji Hipotesis.
   ============================================================ */

function hipotesisLengkap() {
  return (
    DATA.hipotesis.dugaan.every(function (q) {
      return !!State.hipotesisPilih[q.id];
    }) && !!State.hipotesisTeks.trim()
  );
}

function renderHipotesis(container) {
  var D = DATA.hipotesis;
  var rerender = function () {
    renderHipotesis(container);
  };

  container.innerHTML =
    '<section aria-label="Merumuskan Hipotesis">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      buildDugaanList(D.dugaan, State.hipotesisOrders, State.hipotesisPilih, 'data-hip') +
        '<div class="field-group" style="margin-top:var(--space-5);">' +
        '<label for="hipotesisTeks">' +
        esc(D.hipotesisLabel) +
        '</label>' +
        '<textarea id="hipotesisTeks" class="input-textarea" placeholder="' +
        esc(D.hipotesisPlaceholder) +
        '">' +
        esc(State.hipotesisTeks) +
        '</textarea>' +
        '</div>'
    ) +
    buildDlNextButton('hipotesisNextBtn', D.nextLabel) +
    '</section>';

  bindDugaanList(container, State.hipotesisPilih, 'data-hip', rerender);

  var ta = document.getElementById('hipotesisTeks');
  ta.addEventListener('input', function () {
    State.hipotesisTeks = ta.value;
    saveState();
  });

  document.getElementById('hipotesisNextBtn').addEventListener('click', function () {
    if (!hipotesisLengkap()) {
      showNotice('Pilih dugaan untuk setiap pertanyaan dan tulis hipotesismu lebih dulu.');
      return;
    }
    completeStage('hipotesis');
    navigateTo('dataRasio');
  });
}

/* ============================================================
   8. STAGE: LAB AMATI RASIO  (Inquiry Learning — sintaks 4a)
   Situasi dibuka satu per satu. Isian rasio diperiksa
   periksaSoalRasio sehingga pesan salahnya berupa diagnosa.
   ============================================================ */

function buildSituasiCard(s, i, total, st) {
  var head =
    '<header class="situasi-card__head">' +
    '<span class="situasi-card__no">Situasi ' +
    (i + 1) +
    ' dari ' +
    total +
    '</span>' +
    buildKonteksTag(s.konteks) +
    '</header>' +
    '<p class="situasi-card__cerita">' +
    esc(s.cerita) +
    '</p>' +
    buildIkonRasio(s.kelompok) +
    '<p class="dl-step__label">' +
    esc(s.tanya) +
    '</p>';

  var body;
  if (st.done) {
    var p = parseIsianRasio(st.input);
    var sd = sederhanakanRasio(p.a, p.b);
    body =
      '<p class="dl-step__answer">✓ ' +
      esc(fmtRasio(p.a, p.b)) +
      '</p>' +
      buildFeedbackBox(
        'success',
        '💡',
        esc(PESAN_RASIO.benar) +
          (sd.fpb > 1 ? ' Bentuk paling sederhananya ' + esc(fmtRasio(sd.a, sd.b)) + '.' : '')
      );
  } else {
    body =
      buildIsianRasio('rs' + i, st, 'mis. 4 : 6', s.tanya) +
      '<div class="btn-group" style="margin-top:var(--space-2);">' +
      buildHintToggle('rs' + i + 'Hint', s.hints, st.hintLevel) +
      '</div>' +
      (st.salah
        ? '<div style="margin-top:var(--space-3);">' +
          buildFeedbackBox(
            'error',
            '✗',
            '<strong>' + esc(st.input) + '</strong> — ' + esc(periksaSoalRasio(st.input, s).pesan)
          ) +
          '</div>'
        : '') +
      buildHintStack(s.hints, st.hintLevel);
  }

  return (
    '<article class="situasi-card' + (st.done ? ' is-done' : '') + '">' + head + body + '</article>'
  );
}

function bindSituasiCard(s, i, st, rerender) {
  bindIsianRasio('rs' + i, function (val) {
    var d = periksaSoalRasio(val, s);
    if (d.kode === 'kosong' || d.kode === 'format' || d.kode === 'nol') {
      showNotice(d.pesan);
      return;
    }
    st.input = val.trim();
    st.attempts += 1;
    st.kode = d.kode;
    st.done = d.benar;
    st.salah = !d.benar;
    saveState();
    rerender();
  });
  var hint = document.getElementById('rs' + i + 'Hint');
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = Math.min(st.hintLevel + 1, s.hints.length);
      saveState();
      rerender();
    });
  }
}

function renderDataRasio(container) {
  var D = DATA.dataRasio;
  var steps = State.rasioSteps;
  var aktif = langkahAktif(steps);
  var semua = aktif >= D.situasi.length;
  var temuanOk = guidedQuizAllCorrect(D.temuan, State.temuanRasioPilih);
  var rerender = function () {
    renderDataRasio(container);
  };

  var kartu = D.situasi
    .slice(0, Math.min(aktif + 1, D.situasi.length))
    .map(function (s, i) {
      return buildSituasiCard(s, i, D.situasi.length, steps[i]);
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Lab Amati Rasio">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel('<div class="situasi-list">' + kartu + '</div>') +
    (semua ? buildTemuanPanel(D.temuan, State.temuanRasioOrders, State.temuanRasioPilih) : '') +
    (semua && temuanOk ? buildDlNextButton('rasioNextBtn', D.nextLabel) : '') +
    '</section>';

  if (!semua) bindSituasiCard(D.situasi[aktif], aktif, steps[aktif], rerender);
  if (semua) bindGuidedQuizList(container, D.temuan, State.temuanRasioPilih, saveState, rerender);
  bindNext('rasioNextBtn', 'dataRasio', 'dataSetara');
}

/* ============================================================
   9. STAGE: LAB RACIK  (Inquiry Learning — sintaks 4b)
   Pencampur sirup–air → misi tercapai → diagram pita & langkah
   isian suku hilang/FPB → pertanyaan temuan.
   ============================================================ */

function misiLabSelesai() {
  var dicoba = jenisAksiDicoba(State.pencampur);
  return DATA.dataSetara.lab.misi.every(function (m) {
    return dicoba.indexOf(m.id) !== -1;
  });
}

function buildMisiList() {
  var dicoba = jenisAksiDicoba(State.pencampur);
  return (
    '<ul class="misi-list">' +
    DATA.dataSetara.lab.misi
      .map(function (m) {
        var ok = dicoba.indexOf(m.id) !== -1;
        return (
          '<li class="' +
          (ok ? 'is-ok' : '') +
          '"><span aria-hidden="true">' +
          (ok ? '✅' : '⬜') +
          '</span> <span class="sr-only">' +
          (ok ? 'Sudah dicoba: ' : 'Belum dicoba: ') +
          '</span>' +
          esc(m.label) +
          '</li>'
        );
      })
      .join('') +
    '</ul>'
  );
}

/* Diagnosa tambahan untuk langkah suku hilang yang salah. */
function diagnosaLangkah(step, st) {
  if (!st.salah || step.cek.jenis !== 'hilang') return '';
  var c = step.cek;
  var d = diagnosaRasioHilang(st.input, c.a, c.b, c.x, c.posisi);
  if (d.benar || d.kode === 'salah') return '';
  return buildFeedbackBox('warning', '💭', esc(d.pesan));
}

function buildPitaPanel() {
  var P = DATA.dataSetara.pita;
  return buildDlPanel(
    '<h3 style="margin-top:0;">📏 Diagram pita</h3>' +
      '<p>Racikan besar: <strong>' +
      esc(fmtRasio(P.a, P.b)) +
      '</strong>. Apakah rasanya sama dengan Gelas A? Kelompokkan pitanya untuk melihat.</p>' +
      buildPitaRasio(P.a, P.b, {
        namaA: P.namaA,
        namaB: P.namaB,
        grup: State.pitaGrup ? P.grup : 1,
      }) +
      (State.pitaGrup
        ? buildFeedbackBox('success', '💡', esc(P.teks))
        : '<div class="btn-group" style="margin-top:var(--space-3);">' +
          '<button type="button" class="btn btn--outline-primary pita-grup-btn" id="pitaGrupBtn">Kelompokkan jadi ' +
          P.grup +
          ' bagian sama besar</button></div>')
  );
}

function renderDataSetara(container) {
  var D = DATA.dataSetara;
  var L = D.lab;
  var misiOk = misiLabSelesai();
  var steps = State.setaraSteps;
  var aktif = langkahAktif(steps);
  var langkahOk = aktif >= D.langkah.length;
  var temuanOk = guidedQuizAllCorrect(D.temuan, State.temuanSetaraPilih);
  var rerender = function () {
    renderDataSetara(container);
  };

  var langkahHTML = D.langkah
    .slice(0, Math.min(aktif + 1, D.langkah.length))
    .map(function (step, i) {
      return buildDlStep('ls' + i, steps[i], step, i + 1) + diagnosaLangkah(step, steps[i]);
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Lab Racik">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      '<h3 style="margin-top:0;">🧪 Misi percobaan</h3>' +
        buildMisiList() +
        buildPencampurRasio('racik', State.pencampur, L)
    ) +
    (misiOk
      ? buildPitaPanel() +
        buildDlPanel(
          '<h3 style="margin-top:0;">✏️ Catat dan hitung</h3>' +
            '<div class="dl-steps">' +
            langkahHTML +
            '</div>'
        )
      : buildFeedbackBox(
          'info',
          '🔎',
          'Selesaikan ketiga misi percobaan untuk membuka diagram pita dan langkah isian.'
        )) +
    (misiOk && langkahOk
      ? buildTemuanPanel(D.temuan, State.temuanSetaraOrders, State.temuanSetaraPilih)
      : '') +
    (misiOk && langkahOk && temuanOk ? buildDlNextButton('setaraNextBtn', D.nextLabel) : '') +
    '</section>';

  bindPencampurRasio(container, 'racik', State.pencampur, function () {
    saveState();
    rerender();
  });

  var pitaBtn = document.getElementById('pitaGrupBtn');
  if (pitaBtn) {
    pitaBtn.addEventListener('click', function () {
      State.pitaGrup = true;
      saveState();
      rerender();
    });
  }

  if (misiOk && !langkahOk) {
    bindDlStep('ls' + aktif, steps[aktif], D.langkah[aktif], saveState, rerender);
  }
  if (misiOk && langkahOk) {
    bindGuidedQuizList(container, D.temuan, State.temuanSetaraPilih, saveState, rerender);
  }
  bindNext('setaraNextBtn', 'dataSetara', 'dataPilah');
}

/* ============================================================
   10. STAGE: LAB CEK EKUIVALEN  (Inquiry Learning — sintaks 4c)
   Pemilahan pasangan rasio; bukti bentuk sederhana & perkalian
   silang muncul setelah murid memilih sebagai data pembanding.
   ============================================================ */

function renderDataPilah(container) {
  var D = DATA.dataPilah;
  var selesai = sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);
  var rerender = function () {
    renderDataPilah(container);
  };

  container.innerHTML =
    '<section aria-label="Lab Cek Ekuivalen">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      buildSortItems(PILAH_ITEMS, State.pilahOrder, D.kategori, State.pilahStates, {
        visual: function (it) {
          var p = it.sumber;
          return State.pilahStates[it.id].chosen
            ? buildCekSetara(p.r1.a, p.r1.b, p.r2.a, p.r2.b)
            : '';
        },
      })
    ) +
    (selesai ? buildDlNextButton('pilahNextBtn', D.nextLabel) : '') +
    '</section>';

  bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  bindNext('pilahNextBtn', 'dataPilah', 'uji');
}

/* ============================================================
   11. STAGE: MENGUJI HIPOTESIS  (Inquiry Learning — sintaks 5)
   ============================================================ */

function buildDugaanRow(tanya, pilihLabel, bakuLabel, pembahasan, cocok) {
  return (
    '<div class="dugaan-row' +
    (cocok ? ' dugaan-row--ok' : '') +
    '">' +
    '<span class="dugaan-row__title">' +
    esc(tanya) +
    '</span>' +
    '<span>Dugaanmu: <strong>' +
    esc(pilihLabel || '—') +
    '</strong></span>' +
    '<span>Data: <strong>' +
    esc(bakuLabel) +
    '</strong> — ' +
    esc(pembahasan) +
    '</span>' +
    '<span class="dugaan-row__verdict">' +
    (cocok ? '✓ Dugaanmu didukung data!' : '↻ Dugaanmu dikoreksi oleh data') +
    '</span>' +
    '</div>'
  );
}

function buildDugaanBanding() {
  var rows = DATA.orientasi.dugaan
    .map(function (q) {
      return { q: q, pilih: State.dugaanPilih[q.id] };
    })
    .concat(
      DATA.hipotesis.dugaan.map(function (q) {
        return { q: q, pilih: State.hipotesisPilih[q.id] };
      })
    )
    .map(function (r) {
      return buildDugaanRow(
        r.q.tanya,
        findOptionLabel(r.q.opsi, r.pilih),
        findOptionLabel(r.q.opsi, r.q.baku),
        r.q.pembahasan,
        r.pilih === r.q.baku
      );
    });
  return (
    '<div class="dugaan-compare">' +
    rows.join('') +
    '</div>' +
    (State.hipotesisTeks
      ? '<div class="hipotesis-box">' +
        '<span class="hipotesis-box__label">Hipotesismu di tahap 3</span>' +
        '<p>' +
        esc(State.hipotesisTeks) +
        '</p>' +
        '<span class="dl-caption">Apakah hipotesismu diterima, perlu diperbaiki, atau ditolak oleh data? Diskusikan dengan pasanganmu.</span>' +
        '</div>'
      : '')
  );
}

function renderUji(container) {
  var D = DATA.uji;
  var selesai = sortItemsAllAnswered(D.pernyataan, State.ujiStates);
  var rerender = function () {
    renderUji(container);
  };

  container.innerHTML =
    '<section aria-label="Menguji Hipotesis">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        buildSortItems(D.pernyataan, State.ujiOrder, D.opsiPernyataan, State.ujiStates)
    ) +
    (selesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' + esc(D.judulB) + '</h3>' + buildDugaanBanding()
        ) + buildDlNextButton('ujiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, D.pernyataan, State.ujiStates, saveState, rerender);
  bindNext('ujiNextBtn', 'uji', 'simpulan');
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali data dari ketiga lab, lalu pilih potongan lain.</p>'
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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah jawaban rumusan masalah yang kamu selidiki sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Rasio</h3>' +
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
   createExerciseStage (shared/engine.js) dengan soal TERAP_SOAL yang
   dipilih acak. Isian diperiksa periksaSoalRasio sehingga pesan
   salahnya berupa diagnosa miskonsepsi.
   ============================================================ */

var TerapkanStage = createExerciseStage({
  soal: TERAP_SOAL,
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
  inputPlaceholder: 'mis. 2 : 3 atau 12',
  inputMode: 'text',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  inputSuffix: function (s) {
    return s.satuan ? '<span class="bbk-satuan">' + esc(s.satuan) + '</span>' : '';
  },
  /* Teks mentah diteruskan; isian yang tak terbaca ditolak tanpa dihitung. */
  parseInput: function (val) {
    if (!val || !String(val).trim()) return { value: null, error: 'empty' };
    var s = TERAP_SOAL[State.terapkanIdx];
    var d = periksaSoalRasio(val, s);
    if (d.kode === 'format' || d.kode === 'nol') {
      return { value: null, error: 'invalid', message: d.pesan };
    }
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return periksaSoalRasio(value, s).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' + esc(ex.userInput) + '</strong> — ' + esc(periksaSoalRasio(ex.userInput, s).pesan)
    );
  },
  revealText: function (s) {
    return esc(s.reveal) + ' ' + esc(s.explanation);
  },
  renderPrompt: function (s) {
    return (
      '<div class="dl-prompt">' +
      '<span class="bbk-soal-tag">' +
      buildKonteksTag(s.konteks) +
      (s.type === 'choice' ? ' · Pilihan ganda' : ' · ✏️ Isian') +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
      '<p class="dl-prompt__tanya">' +
      esc(s.pertanyaan) +
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
  var semuaCek = State.rasioSteps.concat(State.setaraSteps);
  var sekali = semuaCek.filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  var pilahSemua = PILAH_ITEMS.length + DATA.uji.pernyataan.length;
  var pilahBenar =
    sortItemsCorrectCount(PILAH_ITEMS, State.pilahStates) +
    sortItemsCorrectCount(DATA.uji.pernyataan, State.ujiStates);
  var benarTerap = State.terapkanExercises.filter(function (e) {
    return e.correct;
  }).length;

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="summary-grid">' +
        buildRingkasKartu(
          sekali + '/' + semuaCek.length,
          'Isian lab tepat pada percobaan pertama'
        ) +
        buildRingkasKartu(pilahBenar + '/' + pilahSemua, 'Pemilahan pasangan & pernyataan benar') +
        buildRingkasKartu(benarTerap + '/' + TERAP_SOAL.length, 'Uji terap benar') +
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
    '<div class="rasio-contoh-grid">' +
    D.contoh
      .map(function (c) {
        return (
          '<div class="formula-card"><span class="formula-card__label">' +
          buildKonteksTag(c.konteks) +
          '</span><strong class="rasio-contoh-grid__num">' +
          esc(c.teks) +
          '</strong><span>' +
          esc(c.keterangan) +
          '</span></div>'
        );
      })
      .join('') +
    '</div>' +
    '<div class="panel panel--hero done-card__list">' +
    '<h3 style="margin-top:0;">Yang sudah kamu capai</h3>' +
    '<ol class="objectives-list">' +
    D.capaian
      .map(function (c, i) {
        return (
          '<li><span class="objectives-list__num">' +
          (i + 1) +
          '</span><span>' +
          esc(c) +
          '</span></li>'
        );
      })
      .join('') +
    '</ol>' +
    '</div>' +
    '<div class="feedback-box feedback-box--info done-card__note">' +
    '<span class="feedback-box__icon">📌</span>' +
    '<div class="feedback-box__body">' +
    '<strong>Catatan untuk Guru:</strong><br>' +
    'Rekap pada tahap Refleksi adalah indikator latihan digital, bukan nilai akhir. ' +
    'Kemampuan murid menjelaskan mengapa dua rasio ekuivalen (dengan contoh nyata) tetap menjadi bahan penilaian utama.' +
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
  dataRasio: renderDataRasio,
  dataSetara: renderDataSetara,
  dataPilah: renderDataPilah,
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
