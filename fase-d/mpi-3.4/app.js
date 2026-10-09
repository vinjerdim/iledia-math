'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Perbandingan Senilai & Berbalik Nilai
   — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen bersama: buildDiscoveryHead, buildTeacherNote,
       buildTpPanel, buildChoiceGroup, buildSortItems,
       buildGuidedQuizList, buildDlPanel, buildDlNextButton,
       buildFeedbackBox;
     • seksi 68: buildLangkahRasio / bindLangkahRasio (langkah isian
       berdiagnosa, dengan pemeriksa dari step.periksa);
     • seksi 70 (perbandingan senilai & berbalik nilai):
       periksaSoalProporsi, jawabSoalProporsi, opsiSoalProporsi,
       siapkanLangkahProporsi, jenisPerbandinganTabel, serta alat
       interaktif buildLabProporsi (Lab Senilai & Lab Berbalik Nilai)
       dan buildTabelProporsi (bukti hasil bagi & hasil kali).

   Alur tahap mengikuti sintaks Inquiry Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan orientasi, rumusan
   masalah, hipotesis, pertanyaan temuan, pemilahan tabel, pernyataan
   uji, bank kesimpulan, opsi uji terap, penilaian diri) DIACAK dengan
   shuffleArray() melalui ensureShuffledOrder() / ensureSortStates().
   Pengacakan dilakukan SEKALI saat state disiapkan (initExerciseArrays)
   lalu urutannya disimpan di State — bukan saat render — sehingga
   pilihan tidak melompat saat dirender ulang, tetapi teracak ulang untuk
   setiap murid dan setiap Reset. Soal uji terap juga dipilih acak dari
   bank (pilihSoalTerap) dan opsi pilihan gandanya dibangun engine
   (opsiSoalProporsi).

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi               (IL sintaks 1)
    6. Stage: Merumuskan Masalah      (IL sintaks 2)
    7. Stage: Merumuskan Hipotesis    (IL sintaks 3)
    8. Stage: Lab Senilai & Lab Berbalik Nilai (IL sintaks 4a & 4b)
    9. Stage: Lab Pilah               (IL sintaks 4c)
   10. Stage: Menguji Hipotesis       (IL sintaks 5)
   11. Stage: Merumuskan Kesimpulan   (IL sintaks 6)
   12. Stage: Uji Terap
   13. Stage: Refleksi
   14. Stage: Selesai
   15. Router Render
   16. Helper UI (modal reset)
   17. Init
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
var STORAGE_KEY = 'mpi-d-3-4-senilai-berbalik-v1';

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

/* Label konteks: ikon + nama (Dapur Umum, Belanja, …). */
function buildKonteksTag(konteks) {
  var K = DATA.konteks[konteks];
  return (
    '<span class="proporsi-konteks proporsi-konteks--' +
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
var TEMUAN_SENILAI = DATA.dataSenilai.temuan.map(siapkanGuided);
var TEMUAN_BERBALIK = DATA.dataBerbalik.temuan.map(siapkanGuided);

/* Butir Lab Pilah { id, teks, correct, explanation }; tabelnya di slot visual. */
var PILAH_ITEMS = DATA.dataPilah.tabel.map(function (t) {
  return {
    id: t.id,
    teks: buildKonteksTag(t.konteks) + ' ' + esc(t.teks),
    correct: t.correct,
    explanation: esc(t.explanation),
    sumber: t,
  };
});

var UJI_ITEMS = DATA.uji.pernyataan.map(function (v) {
  return { id: v.id, teks: esc(v.teks), correct: v.correct, explanation: esc(v.explanation) };
});

/*
 * Langkah isian dengan label aman (label DATA berupa teks biasa), siap
 * untuk buildLangkahRasio dengan pemeriksa proporsi (siapkanLangkahProporsi).
 */
function siapkanLangkah(list) {
  return list.map(function (s) {
    return siapkanLangkahProporsi(
      Object.assign({}, s, {
        label: esc(s.label),
        hints: (s.hints || []).map(esc),
        temuan: s.temuan ? esc(s.temuan) : '',
        placeholder: s.placeholder || 'mis. 12 atau 7,5',
      })
    );
  });
}

var LANGKAH_SENILAI = siapkanLangkah(DATA.dataSenilai.langkah);
var LANGKAH_BERBALIK = siapkanLangkah(DATA.dataBerbalik.langkah);

/* Soal pilihan ganda uji terap: opsi dibangun engine (opsiSoalProporsi). */
var OPSI_TERAP = {};
DATA.terapkan.soal.forEach(function (s) {
  if (s.type !== 'choice') return;
  var opsi = opsiSoalProporsi(s);
  OPSI_TERAP[s.id] = opsi;
  s.options = opsiAman(opsi);
  s.correct = 'baku';
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

  /* Tahap 4a — Lab Senilai */
  labSenilai: null,
  senilaiSteps: [],
  temuanSenilaiOrders: {},
  temuanSenilaiPilih: {},

  /* Tahap 4b — Lab Berbalik Nilai */
  labBerbalik: null,
  berbalikSteps: [],
  temuanBerbalikOrders: {},
  temuanBerbalikPilih: {},

  /* Tahap 4c — Lab Pilah */
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
  ensureLabProporsi(ensureMap('labSenilai'), DATA.dataSenilai.lab);
  ensureExerciseArray(State, 'senilaiSteps', LANGKAH_SENILAI, makeCekStep);
  ensureListOrders('temuanSenilaiOrders', DATA.dataSenilai.temuan);
  ensureMap('temuanSenilaiPilih');

  /* Tahap 4b */
  ensureLabProporsi(ensureMap('labBerbalik'), DATA.dataBerbalik.lab);
  ensureExerciseArray(State, 'berbalikSteps', LANGKAH_BERBALIK, makeCekStep);
  ensureListOrders('temuanBerbalikOrders', DATA.dataBerbalik.temuan);
  ensureMap('temuanBerbalikPilih');

  /* Tahap 4c */
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.dataPilah.kategori);

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

function buildKejadianGrid(list) {
  return (
    '<div class="kejadian-grid">' +
    list
      .map(function (k) {
        return (
          '<div class="kejadian-card">' +
          '<span class="kejadian-card__ikon" aria-hidden="true">' +
          k.ikon +
          '</span>' +
          '<span class="kejadian-card__judul">' +
          esc(k.judul) +
          '</span>' +
          '<strong class="kejadian-card__teks">' +
          esc(k.teks) +
          '</strong>' +
          '</div>'
        );
      })
      .join('') +
    '</div>'
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
      '<h2 style="margin-top:0;">🍚 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        buildKejadianGrid(D.kejadian),
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
    navigateTo('dataSenilai');
  });
}

/* ============================================================
   8. STAGE: LAB SENILAI & LAB BERBALIK NILAI
      (Inquiry Learning — sintaks 4a & 4b)
   Lab interaktif → (minimal empat percobaan) langkah isian
   berdiagnosa → pertanyaan temuan. Kedua lab memakai satu renderer.
   ============================================================ */

var LAB_CFG = {
  dataSenilai: {
    label: 'Lab Senilai',
    ikon: '🍚',
    labKey: 'labSenilai',
    steps: 'senilaiSteps',
    langkah: LANGKAH_SENILAI,
    temuan: TEMUAN_SENILAI,
    orders: 'temuanSenilaiOrders',
    pilih: 'temuanSenilaiPilih',
    prefix: 'sn',
    next: 'dataBerbalik',
  },
  dataBerbalik: {
    label: 'Lab Berbalik Nilai',
    ikon: '🧑‍🍳',
    labKey: 'labBerbalik',
    steps: 'berbalikSteps',
    langkah: LANGKAH_BERBALIK,
    temuan: TEMUAN_BERBALIK,
    orders: 'temuanBerbalikOrders',
    pilih: 'temuanBerbalikPilih',
    prefix: 'bb',
    next: 'dataPilah',
  },
};

function renderLab(stageId, container) {
  var C = LAB_CFG[stageId];
  var D = DATA[stageId];
  var lab = State[C.labKey];
  var steps = State[C.steps];
  var cukup = labProporsiCukup(lab, D.lab);
  var aktif = langkahAktif(steps);
  var langkahOk = aktif >= C.langkah.length;
  var temuanOk = guidedQuizAllCorrect(C.temuan, State[C.pilih]);
  var rerender = function () {
    renderLab(stageId, container);
  };

  var langkahHTML = C.langkah
    .slice(0, Math.min(aktif + 1, C.langkah.length))
    .map(function (step, i) {
      return buildLangkahRasio(C.prefix + i, steps[i], step, i + 1);
    })
    .join('');

  container.innerHTML =
    '<section aria-label="' +
    C.label +
    '">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        C.ikon +
        ' ' +
        C.label +
        '</h3>' +
        buildLabProporsi(C.prefix + 'Lab', lab, D.lab)
    ) +
    (cukup
      ? buildDlPanel(
          '<h3 style="margin-top:0;">✏️ Catat dan hitung</h3>' +
            '<div class="dl-steps">' +
            langkahHTML +
            '</div>'
        )
      : buildFeedbackBox(
          'info',
          '🔎',
          'Coba minimal ' +
            D.lab.minCoba +
            ' nilai berbeda dengan tombol − dan + untuk membuka langkah isian.'
        )) +
    (cukup && langkahOk ? buildTemuanPanel(C.temuan, State[C.orders], State[C.pilih]) : '') +
    (cukup && langkahOk && temuanOk ? buildDlNextButton(C.prefix + 'NextBtn', D.nextLabel) : '') +
    '</section>';

  bindLabProporsi(container, C.prefix + 'Lab', lab, D.lab, function () {
    saveState();
    rerender();
  });

  if (cukup && !langkahOk) {
    bindLangkahRasio(C.prefix + aktif, steps[aktif], C.langkah[aktif], saveState, rerender);
  }
  if (cukup && langkahOk) {
    bindGuidedQuizList(container, C.temuan, State[C.pilih], saveState, rerender);
  }
  bindNext(C.prefix + 'NextBtn', stageId, C.next);
}

function renderDataSenilai(container) {
  renderLab('dataSenilai', container);
}

function renderDataBerbalik(container) {
  renderLab('dataBerbalik', container);
}

/* ============================================================
   9. STAGE: LAB PILAH  (Inquiry Learning — sintaks 4c)
   Pemilahan tabel; bukti hasil bagi & hasil kali muncul setelah
   murid memilih sebagai data pembanding.
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
        /* Tabel data; kolom bukti hasil bagi & hasil kali muncul setelah memilih. */
        visual: function (it) {
          var t = it.sumber;
          var dipilih = !!State.pilahStates[it.id].chosen;
          return buildTabelProporsi(t.baris, {
            namaX: t.namaX,
            namaY: t.namaY,
            bukti: dipilih,
            caption: dipilih ? 'Bukti: hasil bagi & hasil kali' : '',
          });
        },
      })
    ) +
    (selesai ? buildDlNextButton('pilahNextBtn', D.nextLabel) : '') +
    '</section>';

  bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  bindNext('pilahNextBtn', 'dataPilah', 'uji');
}

/* ============================================================
   10. STAGE: MENGUJI HIPOTESIS  (Inquiry Learning — sintaks 5)
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali tabel dari ketiga lab, lalu pilih potongan lain.</p>'
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
          '<h3 style="margin-top:0;">Rangkuman Perbandingan</h3>' +
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
   12. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal TERAP_SOAL yang
   dipilih acak. Isian diperiksa periksaSoalProporsi sehingga pesan
   salahnya berupa diagnosa miskonsepsi; pilihan ganda memakai
   opsiSoalProporsi yang setiap pengecohnya membawa umpan diagnosa.
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
  inputPlaceholder: 'mis. 12 atau 7,5',
  inputMode: 'decimal',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  inputSuffix: function (s) {
    return s.satuan ? '<span class="bbk-satuan">' + esc(s.satuan) + '</span>' : '';
  },
  /* Teks mentah diteruskan; isian yang tak terbaca ditolak tanpa dihitung. */
  parseInput: function (val) {
    if (!val || !String(val).trim()) return { value: null, error: 'empty' };
    var d = periksaSoalProporsi(val, TERAP_SOAL[State.terapkanIdx]);
    if (d.kode === 'format') {
      return { value: null, error: 'invalid', message: d.pesan };
    }
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return periksaSoalProporsi(value, s).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' +
      esc(ex.userInput) +
      '</strong> — ' +
      esc(periksaSoalProporsi(ex.userInput, s).pesan)
    );
  },
  revealText: function (s) {
    return esc(s.reveal) + ' ' + esc(s.explanation);
  },
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
   13. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var semuaCek = State.senilaiSteps.concat(State.berbalikSteps);
  var sekali = semuaCek.filter(function (s) {
    return s.done && s.attempts === 1;
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
        buildRingkasKartu(
          sekali + '/' + semuaCek.length,
          'Langkah lab tepat pada percobaan pertama'
        ) +
        buildRingkasKartu(pilahBenar + '/' + pilahSemua, 'Pemilahan tabel & pernyataan benar') +
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
    '<div class="proporsi-contoh-grid">' +
    D.contoh
      .map(function (c) {
        return (
          '<div class="formula-card"><span class="formula-card__label">' +
          buildKonteksTag(c.konteks) +
          '</span><strong class="proporsi-contoh-grid__num">' +
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
    'Kemampuan murid menjelaskan mengapa suatu situasi senilai atau berbalik nilai (dengan bukti hasil bagi atau hasil kali) tetap menjadi bahan penilaian utama.' +
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
  dataSenilai: renderDataSenilai,
  dataBerbalik: renderDataBerbalik,
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
