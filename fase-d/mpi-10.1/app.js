'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Merumuskan Pertanyaan Statistik
   — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen bersama: buildDiscoveryHead, buildTeacherNote,
       buildTpPanel, buildChoiceGroup, buildSortItems,
       buildGuidedQuizList, buildDlPanel, buildDlNextButton,
       buildFeedbackBox;
     • seksi 80 (merumuskan pertanyaan statistik):
       klasifikasiPertanyaan, buildCiriPertanyaan, nilaiSoalStatistik,
       opsiSoalStatistik, serta alat interaktif Lab Tanya Kelas
       (ensureLabTanya, buildLabTanya, bindLabTanya, labTanyaSelesai)
       dan Lab Rakit Pertanyaan (ensureLabRakit, buildLabRakit,
       bindLabRakit, labRakitSelesai).

   Alur tahap mengikuti sintaks Inquiry Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan orientasi, rumusan
   masalah, hipotesis, catatan Lab Tanya, pertanyaan temuan, pemilahan,
   keping Lab Rakit, jenis data & cara mengumpulkan, perbaikan
   pertanyaan, pernyataan uji, bank kesimpulan, opsi uji terap, ceklis &
   penilaian diri) DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder() / ensureSortStates() / ensureLabTanya() /
   ensureLabRakit(). Pengacakan dilakukan SEKALI saat state disiapkan
   (initExerciseArrays) lalu urutannya disimpan di State — bukan saat
   render — sehingga pilihan tidak melompat saat dirender ulang, tetapi
   teracak ulang untuk setiap murid dan setiap Reset. Soal uji terap juga
   dipilih acak dari bank (pilihSoalTerap) dan opsinya dibangun engine
   (opsiSoalStatistik).

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi               (IL sintaks 1)
    6. Stage: Merumuskan Masalah      (IL sintaks 2)
    7. Stage: Merumuskan Hipotesis    (IL sintaks 3)
    8. Stage: Lab Tanya Kelas         (IL sintaks 4a)
    9. Stage: Lab Pilah               (IL sintaks 4b)
   10. Stage: Lab Rakit Pertanyaan    (IL sintaks 4c)
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
   1. KONSTANTA & DATA TURUNAN
   ============================================================ */

var STAGES = DATA.tahap.map(function (t) {
  return t.id;
});
var STAGE_LABELS = DATA.tahap.map(function (t) {
  return t.label;
});
var STORAGE_KEY = 'mpi-d-10-1-pertanyaan-statistik-v1';

function opsiAman(list) {
  return list.map(function (o) {
    return { id: o.id, label: esc(o.label) };
  });
}

/* Pertanyaan berpilihan dari DATA dengan tanya, label opsi, dan umpan aman. */
function siapkanGuided(q) {
  var umpan = {};
  Object.keys(q.umpan || {}).forEach(function (k) {
    umpan[k] = esc(q.umpan[k]);
  });
  return {
    id: q.id,
    tanya: esc(q.tanya),
    opsi: opsiAman(q.opsi),
    correct: q.correct,
    umpan: umpan,
    baku: q.baku,
    pembahasan: q.pembahasan,
  };
}

/* Label konteks: ikon + nama (Diri Sendiri, Kelas, Sekolah). */
function buildKonteksTag(konteks) {
  var K = DATA.konteks[konteks];
  return (
    '<span class="pst-konteks pst-konteks--' +
    konteks +
    '"><span aria-hidden="true">' +
    K.ikon +
    '</span> ' +
    esc(K.nama) +
    '</span>'
  );
}

var DUGAAN = DATA.orientasi.dugaan.map(siapkanGuided);
var HIPOTESIS = DATA.hipotesis.dugaan.map(siapkanGuided);
var MASALAH_OPSI = opsiAman(DATA.masalah.opsi);
var TEMUAN_TANYA = DATA.dataTanya.temuan.map(siapkanGuided);
var PERBAIKI = DATA.dataRakit.perbaiki.map(siapkanGuided);

/* Butir Lab Pilah { id, teks, correct, explanation }; ciri muncul setelah memilih. */
var PILAH_ITEMS = DATA.dataPilah.pertanyaan.map(function (p) {
  return {
    id: p.id,
    teks: buildKonteksTag(p.konteks) + ' ' + esc(p.teks),
    correct: p.correct,
    explanation: esc(p.explanation),
    sumber: p,
  };
});

var UJI_ITEMS = DATA.uji.pernyataan.map(function (v) {
  return { id: v.id, teks: esc(v.teks), correct: v.correct, explanation: esc(v.explanation) };
});

/* Soal uji terap: opsi dibangun engine (opsiSoalStatistik). */
var OPSI_TERAP = {};
DATA.terapkan.soal.forEach(function (s) {
  var opsi = opsiSoalStatistik(s);
  OPSI_TERAP[s.id] = opsi;
  s.type = 'choice';
  s.options = opsiAman(opsi);
  s.correct = nilaiSoalStatistik(s);
});

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

  /* Tahap 4a — Lab Tanya Kelas */
  labTanya: null,
  temuanTanyaOrders: {},
  temuanTanyaPilih: {},

  /* Tahap 4b — Lab Pilah */
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 4c — Lab Rakit */
  labRakit: null,
  perbaikiOrders: {},
  perbaikiPilih: {},

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
  refleksiMilikku: '',
  refleksiCek: {},
  refleksiCekOrder: null,
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

/* Memastikan State[key] berupa objek biasa (peta id → nilai / state lab). */
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

/* Memilih soal acak dari bank sesuai komposisi (per `minta`), lalu mengacak urutannya. */
function pilihSoalTerap() {
  var T = DATA.terapkan;
  var ids = [];
  Object.keys(T.komposisi).forEach(function (k) {
    var kelompok = T.soal.filter(function (s) {
      return s.minta === k;
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

  /* Tahap 4a — urutan catatan diacak di dalam ensureLabTanya */
  ensureLabTanya(State, 'labTanya', DATA.dataTanya.lab);
  ensureListOrders('temuanTanyaOrders', DATA.dataTanya.temuan);
  ensureMap('temuanTanyaPilih');

  /* Tahap 4b */
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.dataPilah.kategori);

  /* Tahap 4c — urutan keping, jenis data & cara diacak di dalam ensureLabRakit */
  ensureLabRakit(State, 'labRakit', DATA.dataRakit.lab);
  ensureListOrders('perbaikiOrders', DATA.dataRakit.perbaiki);
  ensureMap('perbaikiPilih');

  /* Tahap 5 */
  ensureSortStates(State, 'ujiStates', 'ujiOrder', UJI_ITEMS, DATA.uji.opsiPernyataan);

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
      optionOrder: shuffleArray(optionIds(s.options)),
    };
  });
  if (State.terapkanIdx >= TERAP_SOAL.length || State.terapkanIdx < 0) {
    State.terapkanIdx = 0;
  }

  /* Tahap 8 */
  ensureMap('refleksiAnswers');
  ensureMap('refleksiCek');
  ensureShuffledOrder(State, 'refleksiCekOrder', DATA.refleksi.cek);
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

/* Mengembalikan fokus ke elemen yang sama setelah render ulang. */
function fokusKembali(selector) {
  if (!selector) return;
  var el = document.querySelector(selector);
  if (el && !el.disabled) el.focus();
}

/* Panel pertanyaan penuntun berumpan balik. */
function buildTemuanPanel(judul, list, orders, pilih) {
  return buildDlPanel(
    '<h3 style="margin-top:0;">' + judul + '</h3>' + buildGuidedQuizList(list, orders, pilih)
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
        q.tanya +
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

function semuaDipilih(list, pilih) {
  return list.every(function (q) {
    return !!pilih[q.id];
  });
}

/* ============================================================
   5. STAGE: ORIENTASI  (Inquiry Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah.
   ============================================================ */

function buildUsulGrid(list) {
  return (
    '<ul class="usul-grid" aria-label="Isi kotak usul">' +
    list
      .map(function (u) {
        return (
          '<li class="usul-card">' +
          '<span class="usul-card__ikon" aria-hidden="true">' +
          u.ikon +
          '</span>' +
          '<span class="usul-card__teks">' +
          esc(u.teks) +
          '</span>' +
          '</li>'
        );
      })
      .join('') +
    '</ul>'
  );
}

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var lengkap = semuaDipilih(DUGAAN, State.dugaanPilih);
  var rerender = function () {
    renderOrientasi(container);
  };

  container.innerHTML =
    '<section aria-label="Orientasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">📮 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        buildUsulGrid(D.usul),
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaanmu?</h3>' +
        buildDugaanList(DUGAAN, State.dugaanOrders, State.dugaanPilih, 'data-dugaan') +
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
    if (!semuaDipilih(DUGAAN, State.dugaanPilih)) {
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
  var umpan = {};
  Object.keys(D.umpan).forEach(function (k) {
    umpan[k] = esc(D.umpan[k]);
  });

  container.innerHTML =
    '<section aria-label="Merumuskan Masalah">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(MASALAH_OPSI, State.masalahOrder, {
          chosen: State.masalahPilihan,
          correctId: benar ? D.correct : null,
          grade: true,
          locked: benar,
        }) +
        buildGuidedChoiceFeedback(State.masalahPilihan, benar, umpan)
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
  return semuaDipilih(HIPOTESIS, State.hipotesisPilih) && !!State.hipotesisTeks.trim();
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
      buildDugaanList(HIPOTESIS, State.hipotesisOrders, State.hipotesisPilih, 'data-hip') +
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
    navigateTo('dataTanya');
  });
}

/* ============================================================
   8. STAGE: LAB TANYA KELAS  (Inquiry Learning — sintaks 4a)
   Semua kartu ditanyakan & dicatat → pertanyaan temuan.
   ============================================================ */

function renderDataTanya(container, fokus) {
  var D = DATA.dataTanya;
  var lab = State.labTanya;
  var labOk = labTanyaSelesai(lab, D.lab);
  var temuanOk = guidedQuizAllCorrect(TEMUAN_TANYA, State.temuanTanyaPilih);
  var rerender = function (sel) {
    renderDataTanya(container, sel);
  };

  container.innerHTML =
    '<section aria-label="Lab Tanya Kelas">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      '<h3 style="margin-top:0;">🗳️ Lab Tanya Kelas</h3>' + buildLabTanya('tanyaLab', lab, D.lab)
    ) +
    (labOk
      ? buildTemuanPanel(
          '💡 Apa temuanmu?',
          TEMUAN_TANYA,
          State.temuanTanyaOrders,
          State.temuanTanyaPilih
        )
      : buildFeedbackBox(
          'info',
          '🔎',
          'Tanyakan dan catat semua kartu untuk membuka pertanyaan temuan.'
        )) +
    (labOk && temuanOk ? buildDlNextButton('tanyaNextBtn', D.nextLabel) : '') +
    '</section>';

  bindLabTanya(container, 'tanyaLab', lab, D.lab, function (sel) {
    saveState();
    rerender(sel);
  });
  if (labOk) {
    bindGuidedQuizList(container, TEMUAN_TANYA, State.temuanTanyaPilih, saveState, rerender);
  }
  bindNext('tanyaNextBtn', 'dataTanya', 'dataPilah');
  fokusKembali(fokus);
}

/* ============================================================
   9. STAGE: LAB PILAH  (Inquiry Learning — sintaks 4b)
   Pemilahan pertanyaan; tiga ciri muncul setelah murid memilih
   sebagai bukti pembanding.
   ============================================================ */

function renderDataPilah(container) {
  var D = DATA.dataPilah;
  var selesai = sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);
  var rerender = function () {
    renderDataPilah(container);
  };

  container.innerHTML =
    '<section aria-label="Lab Pilah">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      buildSortItems(PILAH_ITEMS, State.pilahOrder, D.kategori, State.pilahStates, {
        visual: function (it) {
          return State.pilahStates[it.id].chosen ? buildCiriPertanyaan(it.sumber.ciri) : '';
        },
      })
    ) +
    (selesai ? buildDlNextButton('pilahNextBtn', D.nextLabel) : '') +
    '</section>';

  bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  bindNext('pilahNextBtn', 'dataPilah', 'dataRakit');
}

/* ============================================================
   10. STAGE: LAB RAKIT PERTANYAAN  (Inquiry Learning — sintaks 4c)
   Rakit & simpan pertanyaan → perbaiki pertanyaan kabur.
   ============================================================ */

function renderDataRakit(container, fokus) {
  var D = DATA.dataRakit;
  var lab = State.labRakit;
  var labOk = labRakitSelesai(lab, D.lab);
  var perbaikiOk = guidedQuizAllCorrect(PERBAIKI, State.perbaikiPilih);
  var rerender = function (sel) {
    renderDataRakit(container, sel);
  };

  container.innerHTML =
    '<section aria-label="Lab Rakit Pertanyaan">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      '<h3 style="margin-top:0;">🧩 Lab Rakit Pertanyaan</h3>' +
        buildLabRakit('rakitLab', lab, D.lab)
    ) +
    (labOk
      ? buildTemuanPanel(esc(D.perbaikiJudul), PERBAIKI, State.perbaikiOrders, State.perbaikiPilih)
      : '') +
    (labOk && perbaikiOk ? buildDlNextButton('rakitNextBtn', D.nextLabel) : '') +
    '</section>';

  bindLabRakit(container, 'rakitLab', lab, D.lab, function (sel) {
    saveState();
    rerender(sel);
  });
  if (labOk) {
    bindGuidedQuizList(container, PERBAIKI, State.perbaikiPilih, saveState, rerender);
  }
  bindNext('rakitNextBtn', 'dataRakit', 'uji');
  fokusKembali(fokus);
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
    tanya +
    '</span>' +
    '<span>Dugaanmu: <strong>' +
    (pilihLabel || '—') +
    '</strong></span>' +
    '<span>Data: <strong>' +
    bakuLabel +
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
  var rows = DUGAAN.map(function (q) {
    return { q: q, pilih: State.dugaanPilih[q.id] };
  })
    .concat(
      HIPOTESIS.map(function (q) {
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
  var selesai = sortItemsAllAnswered(UJI_ITEMS, State.ujiStates);
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
        buildSortItems(UJI_ITEMS, State.ujiOrder, D.opsiPernyataan, State.ujiStates)
    ) +
    (selesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' + esc(D.judulB) + '</h3>' + buildDugaanBanding()
        ) + buildDlNextButton('ujiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, UJI_ITEMS, State.ujiStates, saveState, rerender);
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali temuan dari ketiga lab, lalu pilih potongan lain.</p>'
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
          '<h3 style="margin-top:0;">Rangkuman Pertanyaan Statistik</h3>' +
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
   dipilih acak. Semua soal pilihan ganda; setiap pengecoh dari
   opsiSoalStatistik membawa umpan balik sesuai miskonsepsinya.
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
  defaultType: 'choice',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  buildChoiceFeedback: function (s, ex) {
    if (ex.correct) {
      return buildFeedbackBox('success', '✓', '<strong>Benar!</strong> ' + esc(s.explanation));
    }
    var o = (OPSI_TERAP[s.id] || []).filter(function (x) {
      return x.id === ex.chosen;
    })[0];
    return buildFeedbackBox(
      'error',
      '✗',
      '<strong>Belum tepat.</strong> ' + (o ? esc(o.umpan) + ' ' : '') + esc(s.explanation)
    );
  },
  renderPrompt: function (s) {
    return (
      '<div class="dl-prompt">' +
      '<span class="pst-soal-tag">' +
      buildKonteksTag(s.konteks) +
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
   Murid merumuskan satu pertanyaan statistik sendiri lalu
   memeriksanya dengan ceklis ciri (urutan ceklis diacak).
   ============================================================ */

function buildCeklisMilikku(D) {
  return (
    '<fieldset class="pst-ceklis">' +
    '<legend class="exercise-label">' +
    esc(D.cekLabel) +
    '</legend>' +
    orderByIds(D.cek, State.refleksiCekOrder)
      .map(function (c) {
        return (
          '<label class="pst-ceklis__item">' +
          '<input type="checkbox" data-cek="' +
          esc(c.id) +
          '"' +
          (State.refleksiCek[c.id] ? ' checked' : '') +
          ' />' +
          '<span>' +
          esc(c.label) +
          '</span>' +
          '</label>'
        );
      })
      .join('') +
    '</fieldset>'
  );
}

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var lab = State.labTanya;
  var catatSemua = DATA.dataTanya.lab.pertanyaan.length;
  var catatOk = DATA.dataTanya.lab.pertanyaan.filter(function (q) {
    return lab.catat[q.id] === kunciCatatTanya(q);
  }).length;
  var pilahSemua = PILAH_ITEMS.length + UJI_ITEMS.length;
  var pilahBenar =
    sortItemsCorrectCount(PILAH_ITEMS, State.pilahStates) +
    sortItemsCorrectCount(UJI_ITEMS, State.ujiStates);
  var benarTerap = State.terapkanExercises.filter(function (e) {
    return e.correct;
  }).length;

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="summary-grid">' +
        buildRingkasKartu(catatOk + '/' + catatSemua, 'Kartu Lab Tanya tercatat') +
        buildRingkasKartu(
          State.labRakit.simpan.length + '',
          'Pertanyaan statistik dirakit di Lab Rakit'
        ) +
        buildRingkasKartu(pilahBenar + '/' + pilahSemua, 'Pemilahan & pernyataan benar') +
        buildRingkasKartu(benarTerap + '/' + TERAP_SOAL.length, 'Uji terap benar') +
        '</div>'
    ) +
    buildDlPanel(
      '<div class="field-group">' +
        '<label for="refMilikku" class="dl-refleksi-q">✍️ ' +
        esc(D.milikkuLabel) +
        '</label>' +
        '<textarea id="refMilikku" class="input-textarea" placeholder="' +
        esc(D.milikkuPlaceholder) +
        '">' +
        esc(State.refleksiMilikku) +
        '</textarea>' +
        '</div>' +
        buildCeklisMilikku(D)
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

  var milikku = document.getElementById('refMilikku');
  milikku.addEventListener('input', function () {
    State.refleksiMilikku = milikku.value;
    saveState();
  });

  container.querySelectorAll('input[data-cek]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      State.refleksiCek[cb.dataset.cek] = cb.checked;
      saveState();
    });
  });

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
      fokusKembali('[data-opt-id="' + btn.dataset.optId + '"]');
    });
  });

  document.getElementById('refleksiSaveBtn').addEventListener('click', function () {
    if (!State.refleksiMilikku.trim()) {
      showNotice('Tulis dulu satu pertanyaan statistik buatanmu sendiri.');
      return;
    }
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
  var milikku = State.refleksiMilikku.trim();

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
    '<div class="pst-contoh-grid">' +
    D.contoh
      .map(function (c) {
        return (
          '<div class="formula-card"><span class="formula-card__label">' +
          buildKonteksTag(c.konteks) +
          '</span><strong class="pst-contoh-grid__num">' +
          esc(c.teks) +
          '</strong><span>' +
          esc(c.keterangan) +
          '</span></div>'
        );
      })
      .join('') +
    '</div>' +
    (milikku
      ? '<div class="hipotesis-box"><span class="hipotesis-box__label">Pertanyaan statistik buatanmu</span><p>' +
        esc(milikku) +
        '</p></div>'
      : '') +
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
    'Pertanyaan statistik buatan murid dapat dipakai untuk mengumpulkan data nyata di kelas pada Topik 11 (penyajian data).' +
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
  dataTanya: renderDataTanya,
  dataPilah: renderDataPilah,
  dataRakit: renderDataRakit,
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
