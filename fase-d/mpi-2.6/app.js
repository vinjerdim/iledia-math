'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Pembulatan & Penaksiran untuk Menilai Kewajaran
   Jawaban — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen bersama: buildDiscoveryHead, buildTeacherNote,
       buildTpPanel, buildChoiceGroup, buildSortItems,
       buildGuidedQuizList, buildDlPanel, buildDlNextButton;
     • seksi 64: langkah isian berdiagnosa (makeDesimalStep /
       buildOpDesimalStep / bindOpDesimalStep / periksaOpDesimalStep)
       yang menerima jenis 'bulat' dan 'taksir';
     • seksi 65 (pembulatan & penaksiran): bulatkanKeTempat,
       taksirOperasi, arahTaksiran, nilaiKewajaran, fmtBilanganBesar,
       serta tampilan buildGarisPembulatan, buildMeterKewajaran,
       buildTabelTaksiran.

   Alur tahap mengikuti sintaks Inquiry Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan orientasi, rumusan
   masalah, hipotesis, pertanyaan temuan, strategi banding, pemilahan
   kewajaran, pernyataan uji, bank kesimpulan, opsi uji terap, penilaian
   diri) DIACAK dengan shuffleArray() melalui ensureShuffledOrder() /
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
    8. Stage: Lab Pembulatan          (IL sintaks 4a)
    9. Stage: Lab Taksiran            (IL sintaks 4b)
   10. Stage: Lab Kewajaran           (IL sintaks 4c)
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
var STORAGE_KEY = 'mpi-d-2-6-pembulatan-taksiran-v1';

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

  /* Tahap 4a — Lab Pembulatan */
  bulatSteps: [],
  jelajahTempat: null,
  temuanBulatOrders: {},
  temuanBulatPilih: {},

  /* Tahap 4b — Lab Taksiran */
  bandingOrder: null,
  bandingPilih: null,
  taksirSteps: [],
  temuanTaksirOrders: {},
  temuanTaksirPilih: {},

  /* Tahap 4c — Lab Kewajaran */
  wajarStates: {},
  wajarOrder: null,

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

/* Butir pemilahan Lab Kewajaran: { id, teks, correct, explanation }. */
var WAJAR_ITEMS = DATA.dataWajar.jawaban.map(function (j) {
  return {
    id: j.id,
    teks:
      '<strong>' +
      esc(j.siapa) +
      '</strong>: ' +
      esc(fmtOperasiTampil(j.a, j.op, j.b)) +
      ' = <strong class="wajar-klaim">' +
      esc(fmtBilanganBesar(j.klaim)) +
      '</strong>',
    correct: j.correct,
    explanation: esc(j.explanation),
    sumber: j,
  };
});

/*
 * Menyiapkan seluruh state per-langkah DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1–3 */
  var dugaanOrders = ensureMap('dugaanOrders');
  DATA.orientasi.dugaan.forEach(function (q) {
    ensureShuffledOrder(dugaanOrders, q.id, DATA.orientasi.opsiVonis);
  });
  ensureMap('dugaanPilih');
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);
  ensureListOrders('hipotesisOrders', DATA.hipotesis.dugaan);
  ensureMap('hipotesisPilih');

  /* Tahap 4a */
  ensureExerciseArray(State, 'bulatSteps', DATA.dataBulat.percobaan, makeDesimalStep);
  ensureListOrders('temuanBulatOrders', DATA.dataBulat.temuan);
  ensureMap('temuanBulatPilih');

  /* Tahap 4b */
  ensureShuffledOrder(State, 'bandingOrder', DATA.dataTaksir.banding.opsi);
  ensureExerciseArray(State, 'taksirSteps', DATA.dataTaksir.percobaan, makeDesimalStep);
  ensureListOrders('temuanTaksirOrders', DATA.dataTaksir.temuan);
  ensureMap('temuanTaksirPilih');

  /* Tahap 4c */
  ensureSortStates(State, 'wajarStates', 'wajarOrder', WAJAR_ITEMS, DATA.dataWajar.kategori);

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

/* Kalimat operasi tampilan: "48.500 × 6", "−18,6 + 7,3". */
function fmtOperasiTampil(a, op, b) {
  var tb = fmtBilanganBesar(b);
  return (
    fmtBilanganBesar(a) + ' ' + opDesimal(op) + ' ' + (tb.charAt(0) === '−' ? '(' + tb + ')' : tb)
  );
}

/* Label konteks: ikon + nama (Belanja, Perjalanan, …). */
function buildKonteksTag(konteks) {
  var K = DATA.konteks[konteks];
  return (
    '<span class="taksir-konteks taksir-konteks--' +
    konteks +
    '"><span aria-hidden="true">' +
    K.ikon +
    '</span> ' +
    esc(K.nama) +
    '</span>'
  );
}

function semuaCekSelesai(steps) {
  return steps.every(function (s) {
    return s.done;
  });
}

/* Indeks percobaan pertama yang belum selesai (= panjang daftar bila semua selesai). */
function percobaanAktif(steps) {
  for (var i = 0; i < steps.length; i++) if (!steps[i].done) return i;
  return steps.length;
}

/* Panel pertanyaan temuan (pertanyaan penuntun berumpan balik). */
function buildTemuanPanel(list, orders, pilih) {
  return buildDlPanel(
    '<h3 style="margin-top:0;">💡 Apa temuanmu?</h3>' + buildGuidedQuizList(list, orders, pilih)
  );
}

/* Kartu percobaan bernomor dengan label konteks & cerita. */
function buildPercobaanCard(p, i, total, inner, done) {
  return (
    '<article class="taksir-card' +
    (done ? ' is-done' : '') +
    '">' +
    '<header class="taksir-card__head">' +
    '<span class="taksir-card__no">Percobaan ' +
    (i + 1) +
    ' dari ' +
    total +
    '</span>' +
    buildKonteksTag(p.konteks) +
    '</header>' +
    '<p class="taksir-card__cerita">' +
    esc(p.cerita) +
    '</p>' +
    inner +
    '</article>'
  );
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

/* ============================================================
   5. STAGE: ORIENTASI  (Inquiry Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah.
   ============================================================ */

function dugaanLengkap() {
  return DATA.orientasi.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function buildKartuKalkulator(k) {
  return (
    '<article class="kalku-card kalku-card--' +
    k.konteks +
    '">' +
    '<header class="kalku-card__head">' +
    buildKonteksTag(k.konteks) +
    '<span class="kalku-card__siapa">' +
    esc(k.siapa) +
    '</span></header>' +
    '<p class="kalku-card__teks">' +
    esc(k.teks) +
    '</p>' +
    '<div class="kalku-card__layar" aria-label="' +
    esc(
      'Layar kalkulator: ' + fmtOperasiTampil(k.a, k.op, k.b) + ' = ' + fmtBilanganBesar(k.klaim)
    ) +
    '">' +
    '<span class="kalku-card__soal">' +
    esc(fmtOperasiTampil(k.a, k.op, k.b)) +
    ' =</span>' +
    '<span class="kalku-card__hasil">' +
    esc(fmtBilanganBesar(k.klaim)) +
    '</span>' +
    '</div>' +
    '<p class="kalku-card__satuan">satuan: ' +
    esc(k.satuan) +
    '</p>' +
    '</article>'
  );
}

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var lengkap = dugaanLengkap();

  var dugaanHTML = D.dugaan
    .map(function (q, i) {
      return (
        '<div class="quiz-item">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        esc(q.tanya) +
        '</p>' +
        buildChoiceGroup(D.opsiVonis, State.dugaanOrders[q.id], {
          chosen: State.dugaanPilih[q.id] || null,
          group: q.id,
          attr: 'data-dugaan',
        }) +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Orientasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🏕️ ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="kalku-grid">' +
        D.kartu.map(buildKartuKalkulator).join('') +
        '</div>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaanmu?</h3>' +
        dugaanHTML +
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

  container.querySelectorAll('[data-dugaan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.dugaanPilih[btn.dataset.group] = btn.dataset.dugaan;
      saveState();
      renderOrientasi(container);
    });
  });

  var ta = document.getElementById('orientasiAlasan');
  ta.addEventListener('input', function () {
    State.orientasiAlasan = ta.value;
    saveState();
  });

  document.getElementById('orientasiNextBtn').addEventListener('click', function () {
    if (!dugaanLengkap()) {
      showNotice('Pilih dugaanmu untuk setiap jawaban sebelum melanjutkan.');
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

  var dugaanHTML = D.dugaan
    .map(function (q, i) {
      return (
        '<div class="quiz-item">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        esc(q.tanya) +
        '</p>' +
        buildChoiceGroup(q.opsi, State.hipotesisOrders[q.id], {
          chosen: State.hipotesisPilih[q.id] || null,
          group: q.id,
          attr: 'data-hip',
        }) +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Merumuskan Hipotesis">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      dugaanHTML +
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

  container.querySelectorAll('[data-hip]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.hipotesisPilih[btn.dataset.group] = btn.dataset.hip;
      saveState();
      renderHipotesis(container);
    });
  });

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
    navigateTo('dataBulat');
  });
}

/* ============================================================
   8. STAGE: LAB PEMBULATAN  (Inquiry Learning — sintaks 4a)
   Percobaan dibuka satu per satu. Garis bilangan menyorot hasil
   pembulatan setelah isian murid benar.
   ============================================================ */

function bulatStep(p) {
  return {
    jenis: 'bulat',
    soal: p.soal,
    tempat: p.tempat,
    satuan: p.satuan,
    label:
      'Bulatkan <strong>' +
      esc(fmtBilanganBesar(p.soal)) +
      ' ' +
      esc(p.satuan) +
      '</strong> ke ' +
      esc(namaTempatBulat(kTempat(p.tempat))) +
      ' terdekat = …',
    placeholder: kTempat(p.tempat) < 0 ? 'mis. 13.000' : 'mis. 2,5',
    hints: p.hints,
  };
}

function buildTabelBulat(percobaan, steps) {
  var baris = percobaan
    .filter(function (p, i) {
      return steps[i].done;
    })
    .map(function (p) {
      return (
        '<tr><td class="data-table__num">' +
        esc(fmtBilanganBesar(p.soal)) +
        '</td><td>' +
        esc(namaTempatBulat(kTempat(p.tempat))) +
        '</td><td class="data-table__num">' +
        esc(fmtBilanganBesar(bulatkanKeTempat(p.soal, p.tempat))) +
        '</td></tr>'
      );
    })
    .join('');
  if (!baris) return '';
  return buildDlPanel(
    '<h3 style="margin-top:0;">📋 Data pembulatanmu</h3>' +
      '<div class="table-scroll"><table class="data-table">' +
      '<thead><tr><th scope="col">Bilangan</th><th scope="col">Dibulatkan ke</th><th scope="col">Hasil</th></tr></thead>' +
      '<tbody>' +
      baris +
      '</tbody></table></div>'
  );
}

function buildJelajah(J) {
  var dipilih = State.jelajahTempat;
  return buildDlPanel(
    '<h3 style="margin-top:0;">' +
      esc(J.judul) +
      '</h3>' +
      '<p>' +
      esc(J.teks) +
      '</p>' +
      '<div class="taksir-pilih" role="group" aria-label="Pilih tempat pembulatan">' +
      J.tempat
        .map(function (t) {
          return (
            '<button type="button" class="btn btn--small ' +
            (dipilih === t.id ? 'btn--primary' : 'btn--ghost') +
            '" data-jelajah="' +
            esc(t.id) +
            '" aria-pressed="' +
            (dipilih === t.id ? 'true' : 'false') +
            '">' +
            esc(t.label) +
            '</button>'
          );
        })
        .join('') +
      '</div>' +
      (dipilih
        ? buildGarisPembulatan(J.soal, dipilih, { tampilHasil: true })
        : '<p class="dl-caption">Ketuk salah satu tempat untuk melihat garis bilangannya.</p>')
  );
}

function renderDataBulat(container) {
  var D = DATA.dataBulat;
  var steps = State.bulatSteps;
  var aktif = percobaanAktif(steps);
  var semua = aktif >= D.percobaan.length;
  var temuanBenar = guidedQuizAllCorrect(D.temuan, State.temuanBulatPilih);
  var rerender = function () {
    renderDataBulat(container);
  };

  var kartuHTML = D.percobaan
    .slice(0, aktif + 1)
    .map(function (p, i) {
      var done = steps[i].done;
      return buildPercobaanCard(
        p,
        i,
        D.percobaan.length,
        buildGarisPembulatan(p.soal, p.tempat, { tampilHasil: done }) +
          buildOpDesimalStep('bulat' + i, steps[i], bulatStep(p)),
        done
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Lab Pembulatan">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    '<div class="taksir-list">' +
    kartuHTML +
    '</div>' +
    buildTabelBulat(D.percobaan, steps) +
    (semua
      ? buildJelajah(D.jelajah) +
        buildTemuanPanel(D.temuan, State.temuanBulatOrders, State.temuanBulatPilih)
      : '') +
    (semua && temuanBenar ? buildDlNextButton('bulatNextBtn', D.nextLabel) : '') +
    '</section>';

  D.percobaan.slice(0, aktif + 1).forEach(function (p, i) {
    bindOpDesimalStep('bulat' + i, steps[i], bulatStep(p), saveState, rerender);
  });

  container.querySelectorAll('[data-jelajah]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.jelajahTempat = btn.dataset.jelajah;
      saveState();
      rerender();
    });
  });

  bindGuidedQuizList(container, D.temuan, State.temuanBulatPilih, saveState, rerender);
  bindNext('bulatNextBtn', 'dataBulat', 'dataTaksir');
}

/* ============================================================
   9. STAGE: LAB TAKSIRAN  (Inquiry Learning — sintaks 4b)
   ============================================================ */

function taksirStep(p) {
  return {
    jenis: 'taksir',
    a: p.a,
    op: p.op,
    b: p.b,
    strategi: p.strategi,
    satuan: p.satuan,
    label:
      'Taksir <strong>' +
      esc(fmtOperasiTampil(p.a, p.op, p.b)) +
      '</strong> ≈ … <span class="dl-caption">(' +
      esc(DATA.strategi[p.strategi]) +
      ')</span>',
    placeholder: 'mis. 150',
    hints: p.hints,
  };
}

function buildBanding(B) {
  var pilih = State.bandingPilih;
  var hasil = '';
  if (pilih) {
    var t = taksirOperasi(B.a, B.op, B.b, pilih);
    hasil =
      '<div class="taksir-banding">' +
      '<p class="taksir-banding__baris"><span>Taksiran</span><strong>' +
      esc(t.teks) +
      '</strong></p>' +
      '<p class="taksir-banding__baris"><span>Hasil sebenarnya</span><strong>' +
      esc(
        fmtOperasiTampil(B.a, B.op, B.b) +
          ' = ' +
          fmtBilanganBesar(hasilOperasiDesimal(B.a, B.op, B.b))
      ) +
      '</strong></p>' +
      '<p class="taksir-banding__baris"><span>Selisih</span><strong>' +
      esc(String(persenGalat(t.hasil, hasilOperasiDesimal(B.a, B.op, B.b))).replace('.', ',')) +
      '%</strong></p>' +
      '</div>' +
      buildFeedbackBox('info', '⚖️', esc(B.catatan));
  }
  return buildDlPanel(
    '<h3 style="margin-top:0;">' +
      esc(B.judul) +
      '</h3>' +
      '<p>' +
      esc(B.teks) +
      '</p>' +
      buildChoiceGroup(B.opsi, State.bandingOrder, {
        chosen: pilih,
        attr: 'data-banding',
      }) +
      hasil
  );
}

function renderDataTaksir(container) {
  var D = DATA.dataTaksir;
  var steps = State.taksirSteps;
  var aktif = percobaanAktif(steps);
  var semua = aktif >= D.percobaan.length;
  var temuanBenar = guidedQuizAllCorrect(D.temuan, State.temuanTaksirPilih);
  var rerender = function () {
    renderDataTaksir(container);
  };

  var kartuHTML = D.percobaan
    .slice(0, aktif + 1)
    .map(function (p, i) {
      return buildPercobaanCard(
        p,
        i,
        D.percobaan.length,
        buildOpDesimalStep('taksir' + i, steps[i], taksirStep(p)),
        steps[i].done
      );
    })
    .join('');

  var dataRows = D.percobaan.filter(function (p, i) {
    return steps[i].done;
  });

  container.innerHTML =
    '<section aria-label="Lab Taksiran">' +
    buildHead(D) +
    buildBanding(D.banding) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    '<div class="taksir-list">' +
    kartuHTML +
    '</div>' +
    (dataRows.length
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📋 Tabel data taksiran</h3>' + buildTabelTaksiran(dataRows)
        )
      : '') +
    (semua ? buildTemuanPanel(D.temuan, State.temuanTaksirOrders, State.temuanTaksirPilih) : '') +
    (semua && temuanBenar ? buildDlNextButton('taksirNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-banding]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.bandingPilih = btn.dataset.banding;
      saveState();
      rerender();
    });
  });

  D.percobaan.slice(0, aktif + 1).forEach(function (p, i) {
    bindOpDesimalStep('taksir' + i, steps[i], taksirStep(p), saveState, rerender);
  });

  bindGuidedQuizList(container, D.temuan, State.temuanTaksirPilih, saveState, rerender);
  bindNext('taksirNextBtn', 'dataTaksir', 'dataWajar');
}

/* ============================================================
   10. STAGE: LAB KEWAJARAN  (Inquiry Learning — sintaks 4c)
   Pemilahan jawaban kalkulator; meter kewajaran muncul setelah
   murid memilih sebagai data pembanding.
   ============================================================ */

function meterUntuk(it) {
  var j = it.sumber;
  var r = nilaiKewajaran(j.klaim, j.a, j.op, j.b);
  return buildMeterKewajaran(r.taksiran, j.klaim, {
    wajar: r.wajar,
    keterangan: 'Taksiran: ' + r.taksiranTeks + '.',
  });
}

function renderDataWajar(container) {
  var D = DATA.dataWajar;
  var selesai = sortItemsAllAnswered(WAJAR_ITEMS, State.wajarStates);
  var rerender = function () {
    renderDataWajar(container);
  };

  container.innerHTML =
    '<section aria-label="Lab Kewajaran">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      buildSortItems(WAJAR_ITEMS, State.wajarOrder, D.kategori, State.wajarStates, {
        visual: function (it) {
          return State.wajarStates[it.id].chosen ? meterUntuk(it) : '';
        },
      })
    ) +
    (selesai ? buildDlNextButton('wajarNextBtn', D.nextLabel) : '') +
    '</section>';

  bindSortItems(container, WAJAR_ITEMS, State.wajarStates, saveState, rerender);
  bindNext('wajarNextBtn', 'dataWajar', 'uji');
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
  var O = DATA.orientasi;
  var H = DATA.hipotesis;
  var rows = O.dugaan
    .map(function (q) {
      var pilih = State.dugaanPilih[q.id];
      return buildDugaanRow(
        q.tanya,
        findOptionLabel(O.opsiVonis, pilih),
        findOptionLabel(O.opsiVonis, q.baku),
        q.pembahasan,
        pilih === q.baku
      );
    })
    .concat(
      H.dugaan.map(function (q) {
        var pilih = State.hipotesisPilih[q.id];
        return buildDugaanRow(
          q.tanya,
          findOptionLabel(q.opsi, pilih),
          findOptionLabel(q.opsi, q.baku),
          q.pembahasan,
          pilih === q.baku
        );
      })
    );
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
          '<h3 style="margin-top:0;">Daftar Periksa Kewajaran</h3>' +
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
      renderSimpulan(container);
    });
  }

  bindNext('simpulanNextBtn', 'simpulan', 'terapkan');
}

/* ============================================================
   13. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal TERAP_SOAL yang
   dipilih acak. Isian diperiksa periksaOpDesimalStep (jenis 'bulat' →
   diagnosaPembulatan, 'taksir' → diagnosaTaksiran) sehingga pesan
   salahnya berupa diagnosa miskonsepsi.
   ============================================================ */

function periksaIsianTerap(value, s) {
  return periksaOpDesimalStep(makeDesimalStep(), s, value);
}

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
  inputPlaceholder: 'mis. 2,5 atau 13.000',
  inputMode: 'text',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  inputSuffix: function (s) {
    return s.satuan ? '<span class="bbk-satuan">' + esc(s.satuan) + '</span>' : '';
  },
  /* Teks mentah diteruskan; pemeriksaan & diagnosa ada di isCorrect. */
  parseInput: function (val) {
    if (!val || !String(val).trim()) return { value: null, error: 'empty' };
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return periksaIsianTerap(value, s).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' + esc(ex.userInput) + '</strong> — ' + periksaIsianTerap(ex.userInput, s).pesan
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
  var semuaCek = State.bulatSteps.concat(State.taksirSteps);
  var sekali = semuaCek.filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  var pilahSemua = WAJAR_ITEMS.length + DATA.uji.pernyataan.length;
  var pilahBenar =
    sortItemsCorrectCount(WAJAR_ITEMS, State.wajarStates) +
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
        buildRingkasKartu(pilahBenar + '/' + pilahSemua, 'Pemilahan kewajaran & pernyataan benar') +
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
    '<div class="taksir-contoh-grid">' +
    D.contoh
      .map(function (c) {
        return (
          '<div class="formula-card"><span class="formula-card__label">' +
          buildKonteksTag(c.konteks) +
          '</span><strong class="taksir-contoh-grid__num">' +
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
    'Kemampuan murid menjelaskan alasan sebuah jawaban wajar atau tidak tetap menjadi bahan penilaian utama.' +
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
  dataBulat: renderDataBulat,
  dataTaksir: renderDataTaksir,
  dataWajar: renderDataWajar,
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
