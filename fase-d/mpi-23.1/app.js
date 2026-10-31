'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Unsur & Jaring-jaring Tabung, Kerucut, dan Bola
   Fase D — SMP Kelas IX · Topik 23 Tabung, Kerucut, dan Bola

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox, createStageMachine,
   createExerciseStage, createStore, ensureExerciseArray, optionIds,
   komponen Discovery Learning (ensureShuffledOrder, orderByIds,
   buildDiscoveryHead, buildTeacherNote, buildTpPanel, buildChoiceGroup,
   buildDlPanel, buildDlNextButton, ensureSortStates, buildSortItems,
   bindSortItems, buildGuidedQuizList, bindGuidedQuizList,
   guidedQuizAllCorrect), langkah isian berdiagnosa seksi 68
   (makeCekStep, buildLangkahRasio, bindLangkahRasio), serta komponen
   tabung–kerucut–bola seksi 89 (buildBendaTKBSVG, buildJaringTKBSVG,
   Lab Unsur, Lab Bentang, Lab Kulit Jeruk, Lab Tuang, tabel unsur,
   cekJaringTKB, nilaiSoalTKB, periksaSoalTKB, opsiSoalTKB,
   siapkanLangkahTKB).

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaan dan rangkaian aktivitasnya.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI saat
   state disiapkan (initExerciseArrays), lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat-lompat
   ketika tahap dirender ulang, tetapi teracak ulang setiap Reset.
   Soal uji terap juga dipilih acak dari bank soal setiap Reset.

   Bagian:
    1. Konstanta & data siap pakai
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi              (DL sintaks 1)
    6. Stage: Identifikasi Masalah   (DL sintaks 2)
    7. Stage: Mengamati Unsur        (DL sintaks 3)
    8. Stage: Membuka Selimut        (DL sintaks 3)
    9. Stage: Kulit Bola             (DL sintaks 3)
   10. Stage: Olah Luas Permukaan    (DL sintaks 4)
   11. Stage: Olah Volume            (DL sintaks 4)
   12. Stage: Pembuktian             (DL sintaks 5)
   13. Stage: Menarik Kesimpulan     (DL sintaks 6)
   14. Stage: Uji Terap
   15. Stage: Refleksi
   16. Stage: Selesai
   17. Router Render, modal reset & init
   ============================================================ */

/* ============================================================
   1. KONSTANTA & DATA SIAP PAKAI
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'amati',
  'bentang',
  'bola',
  'olahLuas',
  'tuang',
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
  'Bentang',
  'Bola',
  'Luas',
  'Volume',
  'Bukti',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-23-1-tkb-v1';

/* Teks DATA berupa teks biasa: di-escape sekali di sini. */
function opsiAman(list) {
  return list.map(function (o) {
    return { id: o.id, label: esc(o.label) };
  });
}

function guidedAman(list) {
  return list.map(function (q) {
    var umpan = {};
    Object.keys(q.umpan).forEach(function (k) {
      umpan[k] = esc(q.umpan[k]);
    });
    return {
      id: q.id,
      tanya: esc(q.tanya),
      opsi: opsiAman(q.opsi),
      correct: q.correct,
      umpan: umpan,
    };
  });
}

/* Langkah isian berdiagnosa (seksi 68 + 89) dengan temuan otomatis. */
function langkahAman(list) {
  return list.map(function (s) {
    var step = siapkanLangkahTKB({
      id: s.id,
      label: esc(s.label),
      cek: s.cek,
      hints: s.hints.map(esc),
    });
    step.temuan = 'Tepat: <strong>' + esc(jawabSoalTKB(step) + ' ' + step.satuan) + '</strong>.';
    return step;
  });
}

var DUGAAN = DATA.stimulasi.dugaan.map(function (q) {
  return { id: q.id, tanya: esc(q.tanya), opsi: opsiAman(q.opsi) };
});
var MASALAH_OPSI = opsiAman(DATA.masalah.opsi);
var AMATI_TANYA = guidedAman(DATA.amati.tanya);
var BENTANG_TANYA = guidedAman(DATA.bentang.tanya);
var BOLA_TANYA = guidedAman(DATA.bola.tanya);
var KONSEP = guidedAman(DATA.olahLuas.konsep);
var TUANG_TANYA = guidedAman(DATA.tuang.tanya);
var OPSI_KLAS = opsiAman(DATA.olahLuas.opsiKlas);
var OPSI_PREDIKSI = opsiAman(DATA.verifikasi.opsiPrediksi);

var LANGKAH = {
  bentang: langkahAman(DATA.bentang.langkah),
  olahLuas: langkahAman(DATA.olahLuas.langkah),
  tuang: langkahAman(DATA.tuang.langkah),
  verifikasi: langkahAman(DATA.verifikasi.langkah),
};

var LAB_JERUK = DATA.bola.lab;
var LAB_BENTANG = DATA.bentang.lab;
var TABEL_ROWS = DATA.amati.tabelRows;

/* Butir pemilahan rancangan jaring-jaring, lengkap dengan gambarnya. */
var PILAH_ITEMS = DATA.olahLuas.pilah.map(function (it) {
  return {
    id: it.id,
    correct: it.correct,
    explanation: esc(cekJaringTKB(it.spec).pesan),
    teks:
      '<span class="tkb-pilah"><strong>' +
      esc(it.nama) +
      '</strong>' +
      buildJaringTKBSVG(it.spec, { aria: it.nama }) +
      '</span>',
  };
});

var VERIF_SOAL = DATA.verifikasi.soal.map(function (q) {
  return {
    id: q.id,
    teks: esc(q.teks),
    options: opsiAman(q.options),
    correct: q.correct,
    explanation: esc(q.explanation),
  };
});

/* Soal pilihan ganda uji terap berbasis `cek`: opsi dibangun engine. */
var OPSI_TERAP = {};
DATA.terapkan.soal.forEach(function (s) {
  if (s.type !== 'choice') return;
  if (s.cek) {
    var opsi = opsiSoalTKB(s);
    OPSI_TERAP[s.id] = opsi;
    s.options = opsiAman(opsi);
    s.correct = 'baku';
  } else {
    s.options = opsiAman(s.options);
  }
});

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'stimulasi',
  completedStages: {},

  /* Tahap 1 — stimulasi (dugaan, tidak dinilai) */
  dugaanOrders: {},
  dugaanPilih: {},
  stimulasiAlasan: '',

  /* Tahap 2 — identifikasi masalah */
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',

  /* Tahap 3 — Lab Unsur */
  labUnsur: null,
  tabelUnsur: null,
  amatiOrders: {},
  amatiPilih: {},

  /* Tahap 4 — Lab Bentang */
  labBentang: null,
  bentangOrders: {},
  bentangPilih: {},

  /* Tahap 5 — Lab Kulit Jeruk */
  labJeruk: null,
  bolaOrders: {},
  bolaPilih: {},

  /* Tahap 6 — luas permukaan */
  konsepOrders: {},
  konsepPilih: {},
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 7 — Lab Tuang */
  labTuang: null,
  tuangOrders: {},
  tuangPilih: {},

  /* Langkah isian berdiagnosa per tahap */
  langkahSteps: {},

  /* Tahap 8 — pembuktian */
  verifJaring: {},
  verifExercises: [],

  /* Tahap 9 — menarik kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 10 — uji terap */
  terapkanPick: null,
  terapkanIdx: 0,
  terapkanExercises: [],

  /* Tahap 11 — refleksi */
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

function ensureMap(key) {
  if (!State[key] || typeof State[key] !== 'object' || Array.isArray(State[key])) {
    State[key] = {};
  }
  return State[key];
}

/* Mengacak urutan opsi untuk setiap pertanyaan { id, opsi } dalam daftar. */
function ensureListOrders(orderKey, pilihKey, list) {
  var orders = ensureMap(orderKey);
  ensureMap(pilihKey);
  list.forEach(function (q) {
    ensureShuffledOrder(orders, q.id, q.opsi);
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
  var pilih = [];
  Object.keys(T.komposisi).forEach(function (k) {
    var kelompok = T.soal.filter(function (s) {
      return s.type === k;
    });
    shuffleArray(kelompok)
      .slice(0, T.komposisi[k])
      .forEach(function (s) {
        pilih.push(s.id);
      });
  });
  return shuffleArray(pilih);
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
  /* Tahap 1–2 */
  ensureListOrders('dugaanOrders', 'dugaanPilih', DUGAAN);
  ensureShuffledOrder(State, 'masalahOrder', MASALAH_OPSI);

  /* Tahap 3 */
  ensureLabUnsurTKB(State, 'labUnsur');
  ensureTabelUnsurTKB(State, 'tabelUnsur', TABEL_ROWS);
  ensureListOrders('amatiOrders', 'amatiPilih', AMATI_TANYA);

  /* Tahap 4 */
  ensureLabBentangTKB(State, 'labBentang');
  ensureListOrders('bentangOrders', 'bentangPilih', BENTANG_TANYA);

  /* Tahap 5 */
  ensureLabKulitJeruk(State, 'labJeruk', LAB_JERUK);
  ensureListOrders('bolaOrders', 'bolaPilih', BOLA_TANYA);

  /* Tahap 6 */
  ensureListOrders('konsepOrders', 'konsepPilih', KONSEP);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, OPSI_KLAS);

  /* Tahap 7 */
  ensureLabTuangTKB(State, 'labTuang');
  ensureListOrders('tuangOrders', 'tuangPilih', TUANG_TANYA);

  /* Langkah isian (tahap 4, 6, 7, 8) */
  var langkah = ensureMap('langkahSteps');
  Object.keys(LANGKAH).forEach(function (k) {
    ensureExerciseArray(langkah, k, LANGKAH[k], makeCekStep);
  });

  /* Tahap 8 */
  var vj = ensureMap('verifJaring');
  DATA.verifikasi.jaring.forEach(function (j) {
    var st = vj[j.id];
    if (!st || typeof st !== 'object') st = { prediksi: null, diuji: false, order: null };
    ensureShuffledOrder(st, 'order', OPSI_PREDIKSI);
    vj[j.id] = st;
  });
  ensureExerciseArray(State, 'verifExercises', VERIF_SOAL, function (q) {
    return { chosen: null, correct: false, optionOrder: shuffleArray(optionIds(q.options)) };
  });

  /* Tahap 9 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);
  ensureMap('simpulanPilihan');

  /* Tahap 10 — soal dipilih acak dari bank; opsi tiap soal diacak */
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

  /* Tahap 11 */
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

function buildHead(D) {
  return buildDiscoveryHead(D.kicker, D.goal, D.syntax) + buildTeacherNote(esc(D.guru));
}

function judulPanel(teks) {
  return '<h3 style="margin-top:0;">' + teks + '</h3>';
}

function paragrafInfo(teks) {
  return buildDlPanel('<p style="margin:0;">' + esc(teks) + '</p>', 'panel--info');
}

function daftarTemuan(teks) {
  return (
    '<div style="margin-top:var(--space-4);">' +
    buildFeedbackBox('success', '🔎', esc(teks)) +
    '</div>'
  );
}

/* Tombol lanjut yang menyelesaikan tahap ini lalu pindah tahap. */
function bindNext(id, stageId, nextStageId) {
  var btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', function () {
    completeStage(stageId);
    navigateTo(nextStageId);
  });
}

/* Langkah isian sebuah tahap: markup, status selesai, dan pemasang event. */
function langkahHTML(key) {
  return LANGKAH[key]
    .map(function (s, i) {
      return buildLangkahRasio('lk-' + key + '-' + s.id, State.langkahSteps[key][i], s, i + 1);
    })
    .join('');
}

function langkahSelesai(key) {
  return State.langkahSteps[key].every(function (st) {
    return st.done;
  });
}

function bindLangkah(key, rerender) {
  LANGKAH[key].forEach(function (s, i) {
    bindLangkahRasio('lk-' + key + '-' + s.id, State.langkahSteps[key][i], s, saveState, rerender);
  });
}

function gambarBenda(b) {
  return buildBendaTKBSVG(b.jenis, {
    rasio: b.rasio,
    label: false,
    elevasi: 24,
    aria: b.nama + ': ' + b.jenis,
  });
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah.
   ============================================================ */

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var terisi = DUGAAN.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });

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
        '<div class="tkb-galeri">' +
        D.benda
          .map(function (b) {
            return (
              '<figure class="tkb-galeri__item">' +
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
    buildTpPanel(D) +
    buildDlPanel(
      DUGAAN.map(function (q, i) {
        return (
          '<div class="quiz-item">' +
          '<p class="exercise-label"><span class="dl-step__num">' +
          (i + 1) +
          '</span>' +
          q.tanya +
          '</p>' +
          buildChoiceGroup(q.opsi, State.dugaanOrders[q.id], {
            chosen: State.dugaanPilih[q.id] || null,
            group: q.id,
            attr: 'data-dugaan',
          }) +
          '</div>'
        );
      }).join('') +
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

  container.querySelectorAll('[data-dugaan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.dugaanPilih[btn.dataset.group] = btn.dataset.dugaan;
      saveState();
      renderStimulasi(container);
    });
  });

  var ta = document.getElementById('stimulasiAlasan');
  ta.addEventListener('input', function () {
    State.stimulasiAlasan = ta.value;
    saveState();
  });

  bindNext('stimulasiNextBtn', 'stimulasi', 'masalah');
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
        buildChoiceGroup(MASALAH_OPSI, State.masalahOrder, {
          chosen: State.masalahPilihan,
          correctId: benar ? D.correct : null,
          grade: true,
          locked: benar,
          group: 'masalah',
        }) +
        (State.masalahPilihan
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              benar ? 'success' : 'warning',
              benar ? '✓' : '💭',
              esc(D.umpan[State.masalahPilihan])
            ) +
            '</div>'
          : '')
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

  container.querySelectorAll('[data-group="masalah"][data-opt-id]').forEach(function (btn) {
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
      navigateTo('amati');
    });
  }
}

/* ============================================================
   7. STAGE: MENGAMATI UNSUR  (Discovery Learning — sintaks 3)
   Lab Unsur → tabel unsur berdiagnosa → menamai unsur.
   ============================================================ */

function renderAmati(container) {
  var D = DATA.amati;
  var labOk = labUnsurTKBLengkap(State.labUnsur);
  var tabelOk = tabelUnsurTKBBenar(State.tabelUnsur, TABEL_ROWS);
  var tanyaOk = guidedQuizAllCorrect(AMATI_TANYA, State.amatiPilih);

  function rerender() {
    renderAmati(container);
  }

  var html =
    '<section aria-label="Mengumpulkan Data: Mengamati Unsur">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    buildDlPanel(judulPanel('🔍 Lab Unsur') + buildLabUnsurTKB('lu', State.labUnsur));

  if (labOk) {
    html += buildDlPanel(
      judulPanel('📋 Tabel unsur') +
        '<p>' +
        esc(D.instruksiTabel) +
        '</p>' +
        buildTabelUnsurTKB('tu', State.tabelUnsur, TABEL_ROWS, { caption: D.tabelCaption })
    );
  }

  if (labOk && tabelOk) {
    html += buildDlPanel(
      judulPanel('🏷️ Nama unsur') +
        '<p>' +
        esc(D.tanyaInstruksi) +
        '</p>' +
        buildGuidedQuizList(AMATI_TANYA, State.amatiOrders, State.amatiPilih) +
        (tanyaOk ? daftarTemuan(D.temuan) : '')
    );
  }

  html +=
    (labOk && tabelOk && tanyaOk ? buildDlNextButton('amatiNextBtn', D.nextLabel, true) : '') +
    '</section>';
  container.innerHTML = html;

  bindLabUnsurTKB(
    container,
    'lu',
    State.labUnsur,
    function () {
      saveState();
      rerender();
    },
    saveState
  );
  bindTabelUnsurTKB(container, 'tu', State.tabelUnsur, TABEL_ROWS, saveState, function () {
    saveState();
    rerender();
  });
  bindGuidedQuizList(container, AMATI_TANYA, State.amatiPilih, saveState, rerender);
  bindNext('amatiNextBtn', 'amati', 'bentang');
}

/* ============================================================
   8. STAGE: MEMBUKA SELIMUT  (Discovery Learning — sintaks 3)
   Lab Bentang → pertanyaan penuntun → ukuran jaring-jaring.
   ============================================================ */

function renderBentang(container) {
  var D = DATA.bentang;
  var labOk = bentangTKBLengkap(State.labBentang);
  var tanyaOk = guidedQuizAllCorrect(BENTANG_TANYA, State.bentangPilih);
  var langkahOk = langkahSelesai('bentang');

  function rerender() {
    renderBentang(container);
  }

  var html =
    '<section aria-label="Mengumpulkan Data: Membuka Selimut">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    buildDlPanel(
      judulPanel('✂️ Lab Bentang') + buildLabBentangTKB('lb', State.labBentang, LAB_BENTANG)
    );

  if (labOk) {
    html += buildDlPanel(
      judulPanel('🧐 Apa yang kamu temukan?') +
        buildGuidedQuizList(BENTANG_TANYA, State.bentangOrders, State.bentangPilih)
    );
  }

  if (labOk && tanyaOk) {
    html += buildDlPanel(
      judulPanel('📏 Ukur jaring-jaringnya') +
        '<p>' +
        esc(D.langkahInstruksi) +
        '</p>' +
        langkahHTML('bentang') +
        (langkahOk ? daftarTemuan(D.temuan) : '')
    );
  }

  html +=
    (labOk && tanyaOk && langkahOk ? buildDlNextButton('bentangNextBtn', D.nextLabel, true) : '') +
    '</section>';
  container.innerHTML = html;

  bindLabBentangTKB(
    container,
    'lb',
    State.labBentang,
    LAB_BENTANG,
    function () {
      saveState();
      rerender();
    },
    saveState
  );
  bindGuidedQuizList(container, BENTANG_TANYA, State.bentangPilih, saveState, rerender);
  if (labOk && tanyaOk) bindLangkah('bentang', rerender);
  bindNext('bentangNextBtn', 'bentang', 'bola');
}

/* ============================================================
   9. STAGE: KULIT BOLA  (Discovery Learning — sintaks 3)
   Lab Kulit Jeruk → pertanyaan penuntun.
   ============================================================ */

function renderBola(container) {
  var D = DATA.bola;
  var labOk = kulitJerukSelesai(State.labJeruk);
  var tanyaOk = guidedQuizAllCorrect(BOLA_TANYA, State.bolaPilih);

  function rerender() {
    renderBola(container);
  }

  var html =
    '<section aria-label="Mengumpulkan Data: Kulit Bola">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    buildDlPanel(
      judulPanel('🍊 Lab Kulit Jeruk') + buildLabKulitJeruk('kj', State.labJeruk, LAB_JERUK)
    );

  if (labOk) {
    html += buildDlPanel(
      judulPanel('🧐 Apa yang kamu temukan?') +
        buildGuidedQuizList(BOLA_TANYA, State.bolaOrders, State.bolaPilih) +
        (tanyaOk ? daftarTemuan(D.temuan) : '')
    );
  }

  html +=
    (labOk && tanyaOk ? buildDlNextButton('bolaNextBtn', D.nextLabel, true) : '') + '</section>';
  container.innerHTML = html;

  bindLabKulitJeruk(container, 'kj', State.labJeruk, LAB_JERUK, function () {
    saveState();
    rerender();
  });
  bindGuidedQuizList(container, BOLA_TANYA, State.bolaPilih, saveState, rerender);
  bindNext('bolaNextBtn', 'bola', 'olahLuas');
}

/* ============================================================
   10. STAGE: OLAH LUAS PERMUKAAN  (Discovery Learning — sintaks 4)
   Pertanyaan konsep → memilah rancangan → hitung luas.
   ============================================================ */

function buildRumusJaring() {
  var tabung = jaringTabung(1, 1.6, '3,14');
  return (
    '<div class="tkb-duo">' +
    '<figure class="tkb-galeri__item"><figcaption>Jaring-jaring tabung</figcaption>' +
    buildJaringTKBSVG(
      {
        jenis: 'tabung',
        r: 1,
        t: 1.6,
        panjang: tabung.panjang,
        lingkaran: [
          { r: 1, sisi: 'atas' },
          { r: 1, sisi: 'bawah' },
        ],
      },
      { label: true, aria: 'Jaring-jaring tabung' }
    ) +
    '</figure>' +
    '<figure class="tkb-galeri__item"><figcaption>Jaring-jaring kerucut</figcaption>' +
    buildJaringTKBSVG(
      { jenis: 'kerucut', s: 10, sudut: 216, lingkaran: [{ r: 6 }] },
      { label: true, aria: 'Jaring-jaring kerucut' }
    ) +
    '</figure>' +
    '</div>'
  );
}

function renderOlahLuas(container) {
  var D = DATA.olahLuas;
  var konsepOk = guidedQuizAllCorrect(KONSEP, State.konsepPilih);
  var pilahOk = sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);
  var langkahOk = langkahSelesai('olahLuas');

  function rerender() {
    renderOlahLuas(container);
  }

  var html =
    '<section aria-label="Mengolah Data: Luas Permukaan">' +
    buildHead(D) +
    buildDlPanel(
      judulPanel('A. Dari jaring-jaring ke luas permukaan') +
        '<p>' +
        esc(D.instruksiKonsep) +
        '</p>' +
        buildRumusJaring() +
        buildGuidedQuizList(KONSEP, State.konsepOrders, State.konsepPilih)
    );

  if (konsepOk) {
    html += buildDlPanel(
      judulPanel('B. Pilah rancangan bentangan') +
        '<p>' +
        esc(D.instruksiPilah) +
        '</p>' +
        buildSortItems(PILAH_ITEMS, State.pilahOrder, OPSI_KLAS, State.pilahStates) +
        (pilahOk
          ? '<div style="margin-top:var(--space-4);">' +
            buildFeedbackBox(
              'success',
              '🔎',
              '<strong>' +
                sortItemsCorrectCount(PILAH_ITEMS, State.pilahStates) +
                ' dari ' +
                PILAH_ITEMS.length +
                ' rancangan</strong> kamu pilah dengan tepat.'
            ) +
            '</div>'
          : '')
    );
  }

  if (konsepOk && pilahOk) {
    html += buildDlPanel(
      judulPanel('C. Hitung luas bahan') +
        '<p>' +
        esc(D.langkahInstruksi) +
        '</p>' +
        langkahHTML('olahLuas') +
        (langkahOk ? daftarTemuan(D.temuan) : '')
    );
  }

  html +=
    (konsepOk && pilahOk && langkahOk
      ? buildDlNextButton('olahLuasNextBtn', D.nextLabel, true)
      : '') + '</section>';
  container.innerHTML = html;

  bindGuidedQuizList(container, KONSEP, State.konsepPilih, saveState, rerender);
  bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  if (konsepOk && pilahOk) bindLangkah('olahLuas', rerender);
  bindNext('olahLuasNextBtn', 'olahLuas', 'tuang');
}

/* ============================================================
   11. STAGE: OLAH VOLUME  (Discovery Learning — sintaks 4)
   Lab Tuang → pertanyaan penuntun → hitung volume.
   ============================================================ */

function renderTuang(container) {
  var D = DATA.tuang;
  var labOk = labTuangLengkap(State.labTuang);
  var tanyaOk = guidedQuizAllCorrect(TUANG_TANYA, State.tuangPilih);
  var langkahOk = langkahSelesai('tuang');

  function rerender() {
    renderTuang(container);
  }

  var html =
    '<section aria-label="Mengolah Data: Volume">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    buildDlPanel(judulPanel('🫗 Lab Tuang') + buildLabTuangTKB('lt', State.labTuang));

  if (labOk) {
    html += buildDlPanel(
      judulPanel('🧐 Apa yang kamu temukan?') +
        buildGuidedQuizList(TUANG_TANYA, State.tuangOrders, State.tuangPilih)
    );
  }

  if (labOk && tanyaOk) {
    html += buildDlPanel(
      judulPanel('🧮 Hitung volumenya') +
        '<p>' +
        esc(D.langkahInstruksi) +
        '</p>' +
        langkahHTML('tuang') +
        (langkahOk ? daftarTemuan(D.temuan) : '')
    );
  }

  html +=
    (labOk && tanyaOk && langkahOk ? buildDlNextButton('tuangNextBtn', D.nextLabel, true) : '') +
    '</section>';
  container.innerHTML = html;

  bindLabTuangTKB(container, 'lt', State.labTuang, function () {
    saveState();
    rerender();
  });
  bindGuidedQuizList(container, TUANG_TANYA, State.tuangPilih, saveState, rerender);
  if (labOk && tanyaOk) bindLangkah('tuang', rerender);
  bindNext('tuangNextBtn', 'tuang', 'verifikasi');
}

/* ============================================================
   12. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A. Uji temuan pada benda baru.
   B. Prediksi lalu uji dua rancangan.
   C. Tanggapi miskonsepsi.
   ============================================================ */

function verifJaringSelesai() {
  return DATA.verifikasi.jaring.every(function (j) {
    return State.verifJaring[j.id].diuji;
  });
}

function verifSoalSemuaDijawab() {
  return State.verifExercises.every(function (e) {
    return !!e.chosen;
  });
}

function buildVerifJaring(j) {
  var st = State.verifJaring[j.id];
  var html =
    '<div class="tkb-verif-jaring">' +
    '<h4>' +
    esc(j.nama) +
    '</h4>' +
    '<div class="tkb-stage">' +
    buildJaringTKBSVG(j.spec, { aria: 'Rancangan ' + j.nama }) +
    '</div>' +
    '<p class="exercise-label">Prediksimu:</p>' +
    buildChoiceGroup(OPSI_PREDIKSI, st.order, {
      chosen: st.prediksi,
      locked: true,
      group: j.id,
      attr: 'data-prediksi',
    });
  if (st.prediksi && !st.diuji) {
    html +=
      '<div class="btn-group btn-group--end"><button type="button" class="btn btn--outline-primary btn--small" data-uji="' +
      esc(j.id) +
      '">🧪 Uji bentuk</button></div>';
  }
  if (st.diuji) {
    var r = cekJaringTKB(j.spec);
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
  return html + '</div>';
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var langkahOk = langkahSelesai('verifikasi');
  var jaringOk = langkahOk && verifJaringSelesai();

  function rerender() {
    renderVerifikasi(container);
  }

  var html =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      judulPanel('A. Uji pada benda baru') +
        '<p>' +
        esc(D.instruksiHitung) +
        '</p>' +
        langkahHTML('verifikasi')
    );

  if (langkahOk) {
    html += buildDlPanel(
      judulPanel('B. Prediksi, lalu uji') +
        '<p>' +
        esc(D.instruksiJaring) +
        '</p>' +
        '<div class="tkb-duo">' +
        D.jaring.map(buildVerifJaring).join('') +
        '</div>'
    );
  }

  if (jaringOk) {
    html += buildDlPanel(
      judulPanel('C. Tanggapi pendapat teman') +
        '<p>' +
        esc(D.instruksiMiskonsepsi) +
        '</p>' +
        VERIF_SOAL.map(function (q, i) {
          var ex = State.verifExercises[i];
          return (
            '<div class="quiz-item">' +
            '<p class="exercise-label"><span class="dl-step__num">' +
            (i + 1) +
            '</span>' +
            q.teks +
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
                    q.explanation
                ) +
                '</div>'
              : '') +
            '</div>'
          );
        }).join('')
    );
  }

  html +=
    (jaringOk && verifSoalSemuaDijawab()
      ? buildDlNextButton('verifNextBtn', D.nextLabel, true)
      : '') + '</section>';
  container.innerHTML = html;

  bindLangkah('verifikasi', rerender);

  container.querySelectorAll('[data-prediksi]').forEach(function (b) {
    b.addEventListener('click', function () {
      var st = State.verifJaring[b.dataset.group];
      if (!st || st.prediksi) return;
      st.prediksi = b.dataset.prediksi;
      saveState();
      rerender();
    });
  });
  container.querySelectorAll('[data-uji]').forEach(function (b) {
    b.addEventListener('click', function () {
      State.verifJaring[b.dataset.uji].diuji = true;
      saveState();
      rerender();
    });
  });

  container.querySelectorAll('[data-verif-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = optionIds(VERIF_SOAL).indexOf(btn.dataset.group);
      var ex = State.verifExercises[i];
      if (!ex || ex.chosen) return;
      ex.chosen = btn.dataset.verifOpt;
      ex.correct = ex.chosen === VERIF_SOAL[i].correct;
      saveState();
      rerender();
    });
  });

  bindNext('verifNextBtn', 'verifikasi', 'generalisasi');
}

/* ============================================================
   13. STAGE: MENARIK KESIMPULAN  (Discovery Learning — sintaks 6)
   ============================================================ */

function simpulanSemuaBenar() {
  return DATA.generalisasi.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function buildRangkumanVisual() {
  return (
    '<div class="tkb-galeri">' +
    ['tabung', 'kerucut', 'bola']
      .map(function (j) {
        return (
          '<figure class="tkb-galeri__item">' +
          buildBendaTKBSVG(j, { elevasi: 24, aria: 'Model ' + j }) +
          '<figcaption>' +
          esc(TKB_NAMA[j]) +
          '</figcaption></figure>'
        );
      })
      .join('') +
    '</div>'
  );
}

function tanggapanDugaanHTML() {
  var T = DATA.generalisasi.tanggapanDugaan;
  return DATA.stimulasi.dugaan
    .map(function (q) {
      var pilih = State.dugaanPilih[q.id];
      if (!pilih) return '';
      var tepat = !!T[q.id][pilih];
      return (
        '<p class="dl-caption">Dugaanmu: “' +
        esc(findOptionLabel(q.opsi, pilih)) +
        '”</p>' +
        buildFeedbackBox(
          tepat ? 'success' : 'info',
          '🔁',
          esc(tepat ? T[q.id][pilih] : T[q.id].lain)
        )
      );
    })
    .join('');
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
          judulPanel('Rangkuman Tabung, Kerucut, dan Bola') +
            buildRangkumanVisual() +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' +
                  (i + 1) +
                  '</span><span>' +
                  esc(r) +
                  '</span></li>'
                );
              })
              .join('') +
            '</ol>',
          'panel--hero'
        ) +
        buildDlPanel(judulPanel(esc(D.dugaanJudul)) + tanggapanDugaanHTML()) +
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
   14. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal campuran 'input'
   (isian berdiagnosa periksaSoalTKB) dan 'choice' (opsi diacak lewat
   ex.optionOrder di initExerciseArrays()).
   ============================================================ */

function satuanTerap(s) {
  return s.cek ? satuanSoalTKB(s.cek.minta, s.satuan) : '';
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
  inputPlaceholder: 'mis. 188,4',
  inputMode: 'decimal',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  inputSuffix: function (s) {
    var sat = satuanTerap(s);
    return sat ? '<span class="bbk-satuan">' + esc(sat) + '</span>' : '';
  },
  /* Teks mentah diteruskan; isian yang tak terbaca ditolak tanpa dihitung. */
  parseInput: function (val) {
    if (!val || !String(val).trim()) return { value: null, error: 'empty' };
    var d = periksaSoalTKB(val, TERAP_SOAL[State.terapkanIdx]);
    if (d.kode === 'format') return { value: null, error: 'invalid', message: d.pesan };
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return periksaSoalTKB(value, s).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' + esc(ex.userInput) + '</strong> — ' + esc(periksaSoalTKB(ex.userInput, s).pesan)
    );
  },
  revealText: function (s) {
    return (
      'Jawabannya <strong>' +
      esc(jawabSoalTKB(s) + ' ' + satuanTerap(s)) +
      '</strong>. ' +
      esc(s.explanation)
    );
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
    var pilihan = s.type === 'choice';
    return (
      '<div class="dl-prompt">' +
      '<span class="konteks-chip">' +
      esc(s.konteks) +
      (pilihan ? ' · Pilihan ganda' : ' · ✏️ Isian') +
      '</span>' +
      (s.cek
        ? '<div class="tkb-soal-gambar">' +
          buildBendaTKBSVG(s.cek.jenis, { elevasi: 22, aria: 'Gambar ' + s.cek.jenis }) +
          '</div>'
        : '') +
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
   15. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var sel = 0;
  var selBenar = 0;
  TABEL_ROWS.forEach(function (j) {
    TKB_KOLOM.forEach(function (k) {
      sel += 1;
      if (State.tabelUnsur.hasil[j][k.id] === 'benar') selBenar += 1;
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
        kartu(pilahBenar + '/' + PILAH_ITEMS.length, 'Rancangan dipilah tepat') +
        kartu(verifBenar + '/' + VERIF_SOAL.length, 'Pendapat teman ditanggapi tepat') +
        kartu(terapBenar + '/' + TERAP_SOAL.length, 'Uji terap benar') +
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
        buildChoiceGroup(opsiAman(D.diriOpsi), State.refleksiDiriOrder, {
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
   16. STAGE: SELESAI
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
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">🥫</span>L = 2πr² + 2πrt · V = πr²t</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">🍦</span>L = πr² + πrs · V = ⅓πr²t</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">🏐</span>L = 4πr² · V = 4/3 πr³</div>' +
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
    'Kemampuan murid menunjuk unsur pada benda nyata, menjelaskan bentuk jaring-jaring, dan menalar kaitan luas permukaan serta volume tetap menjadi bahan penilaian utama.' +
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
   17. ROUTER RENDER, MODAL RESET & INIT
   ============================================================ */

var RENDERERS = {
  stimulasi: renderStimulasi,
  masalah: renderMasalah,
  amati: renderAmati,
  bentang: renderBentang,
  bola: renderBola,
  olahLuas: renderOlahLuas,
  tuang: renderTuang,
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

function showResetModal() {
  var modal = document.getElementById('resetModal');
  if (modal) modal.style.display = 'flex';
}

function hideResetModal() {
  var modal = document.getElementById('resetModal');
  if (modal) modal.style.display = 'none';
}

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
