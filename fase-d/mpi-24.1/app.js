'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Pengaruh Perubahan Proporsional terhadap Sudut & Sisi
   Bangun Datar
   Fase D — SMP Kelas IX · Topik 24 Perubahan Proporsional Bangun
   Datar dan Ruang

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox, createStageMachine,
   createExerciseStage, createStore, ensureExerciseArray, optionIds,
   komponen Discovery Learning (ensureShuffledOrder, orderByIds,
   buildDiscoveryHead, buildTeacherNote, buildTpPanel, buildChoiceGroup,
   buildDlPanel, buildDlNextButton, ensureSortStates, buildSortItems,
   bindSortItems, buildGuidedQuizList, bindGuidedQuizList,
   guidedQuizAllCorrect), langkah isian berdiagnosa seksi 68
   (makeCekStep, buildLangkahRasio, bindLangkahRasio), papan ukur &
   gambar bangun seksi 26 (buildShapeSVG, buildShapePair,
   buildMeasureBoard, bindMeasureBoard, ensureUkurState, ukurSelesai),
   serta komponen perubahan proporsional seksi 90 (ubahBangunPP,
   bandingUbahPP, pesanBandingPP, buildBandingTabelPP, Lab Ubah
   Ukuran, nilaiSoalPP, periksaSoalPP, opsiSoalPP, siapkanLangkahPP).

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
    7. Stage: Lab Ukur               (DL sintaks 3)
    8. Stage: Lab Ubah Ukuran        (DL sintaks 3)
    9. Stage: Olah Sisi              (DL sintaks 4)
   10. Stage: Olah Sudut             (DL sintaks 4)
   11. Stage: Pembuktian             (DL sintaks 5)
   12. Stage: Menarik Kesimpulan     (DL sintaks 6)
   13. Stage: Uji Terap
   14. Stage: Refleksi
   15. Stage: Selesai
   16. Router Render, modal reset & init
   ============================================================ */

/* ============================================================
   1. KONSTANTA & DATA SIAP PAKAI
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'ukur',
  'ubah',
  'olahSisi',
  'olahSudut',
  'verifikasi',
  'generalisasi',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Stimulasi',
  'Masalah',
  'Ukur',
  'Ubah',
  'Sisi',
  'Sudut',
  'Bukti',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-24-1-ppb-v1';

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

/* Langkah isian berdiagnosa (seksi 68 + 90) dengan temuan otomatis. */
function langkahAman(list) {
  return list.map(function (s) {
    var step = siapkanLangkahPP({
      id: s.id,
      label: esc(s.label),
      cek: s.cek,
      hints: s.hints.map(esc),
    });
    step.temuan =
      'Tepat: <strong>' +
      esc(jawabSoalPP(step) + (step.satuan === '°' ? '°' : step.satuan ? ' ' + step.satuan : '')) +
      '</strong>.';
    return step;
  });
}

function bangunPP(id) {
  return BANGUN_PPB.filter(function (b) {
    return b.id === id;
  })[0];
}

var DUGAAN = DATA.stimulasi.dugaan.map(function (q) {
  return { id: q.id, tanya: esc(q.tanya), opsi: opsiAman(q.opsi) };
});
var MASALAH_OPSI = opsiAman(DATA.masalah.opsi);
var UKUR_TANYA = guidedAman(DATA.ukur.tanya);
var UBAH_TANYA = guidedAman(DATA.ubah.tanya);
var SISI_KONSEP = guidedAman(DATA.olahSisi.konsep);
var SUDUT_KONSEP = guidedAman(DATA.olahSudut.konsep);
var OPSI_KLAS = opsiAman(DATA.olahSudut.opsiKlas);
var OPSI_PREDIKSI = opsiAman(DATA.verifikasi.opsiPrediksi);

var LANGKAH = {
  olahSisi: langkahAman(DATA.olahSisi.langkah),
  olahSudut: langkahAman(DATA.olahSudut.langkah),
  verifikasi: langkahAman(DATA.verifikasi.langkah),
};

/* Bangun yang diukur pada Lab Ukur dan Pembuktian. */
var UKUR_ASLI = bangunPP(DATA.ukur.asli);
var UKUR_CETAK = ubahBangunPP(UKUR_ASLI, { jenis: 'kali', nilai: DATA.ukur.k });
var VERIF_ASLI = bangunPP(DATA.verifikasi.bangun);
var VERIF_BARU = ubahBangunPP(VERIF_ASLI, { jenis: 'kali', nilai: DATA.verifikasi.k });

/* Konfigurasi Lab Ubah Ukuran (seksi 90). */
var LAB_UBAH = {
  bangun: DATA.ubah.lab.bangun.map(bangunPP),
  nilai: DATA.ubah.lab.nilai,
  minCoba: DATA.ubah.lab.minCoba,
};

/* Gambar sebelum (biru) – sesudah (oranye) dengan skala yang sama. */
function gambarPerubahan(b, aksi, skala) {
  var q = ubahBangunPP(b, aksi);
  return buildShapePair(
    Object.assign({}, b, { nama: 'Sebelum' }),
    Object.assign({}, q, { nama: 'Sesudah' }),
    {
      skala: skala || 12,
      p: { judul: b.nama + ' sebelum diubah' },
      q: { judul: b.nama + ' sesudah: ' + labelAksiPP(aksi) },
    }
  );
}

/* Butir pemilahan perubahan, lengkap dengan gambarnya. */
var PILAH_ITEMS = DATA.olahSudut.pilah.map(function (it) {
  var b = bangunPP(it.bangun);
  var r = bandingUbahPP(b, ubahBangunPP(b, it.aksi));
  return {
    id: it.id,
    correct: it.correct,
    explanation: esc(pesanBandingPP(r)),
    teks:
      '<span class="ppb-pilah"><strong>' +
      esc(b.nama + ': ' + labelAksiPP(it.aksi)) +
      '</strong>' +
      gambarPerubahan(b, it.aksi, 10) +
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
    var opsi = opsiSoalPP(s);
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

  /* Tahap 3 — Lab Ukur */
  ukurAsli: null,
  ukurCetak: null,
  ukurOrders: {},
  ukurPilih: {},

  /* Tahap 4 — Lab Ubah Ukuran */
  labUbah: null,
  ubahOrders: {},
  ubahPilih: {},

  /* Tahap 5 — olah sisi */
  sisiOrders: {},
  sisiPilih: {},

  /* Tahap 6 — olah sudut */
  pilahStates: {},
  pilahOrder: null,
  sudutOrders: {},
  sudutPilih: {},

  /* Langkah isian berdiagnosa per tahap */
  langkahSteps: {},

  /* Tahap 7 — pembuktian */
  verifPrediksiOrder: null,
  verifPrediksi: null,
  ukurVerifAsli: null,
  ukurVerifBaru: null,
  verifExercises: [],

  /* Tahap 8 — menarik kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 9 — uji terap */
  terapkanPick: null,
  terapkanIdx: 0,
  terapkanExercises: [],

  /* Tahap 10 — refleksi */
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
  ensureUkurState(State, 'ukurAsli');
  ensureUkurState(State, 'ukurCetak');
  ensureListOrders('ukurOrders', 'ukurPilih', UKUR_TANYA);

  /* Tahap 4 */
  ensureLabUbahPP(State, 'labUbah', LAB_UBAH);
  ensureListOrders('ubahOrders', 'ubahPilih', UBAH_TANYA);

  /* Tahap 5–6 */
  ensureListOrders('sisiOrders', 'sisiPilih', SISI_KONSEP);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, OPSI_KLAS);
  ensureListOrders('sudutOrders', 'sudutPilih', SUDUT_KONSEP);

  /* Langkah isian (tahap 5, 6, 7) */
  var langkah = ensureMap('langkahSteps');
  Object.keys(LANGKAH).forEach(function (k) {
    ensureExerciseArray(langkah, k, LANGKAH[k], makeCekStep);
  });

  /* Tahap 7 */
  ensureShuffledOrder(State, 'verifPrediksiOrder', OPSI_PREDIKSI);
  if (optionIds(OPSI_PREDIKSI).indexOf(State.verifPrediksi) === -1) State.verifPrediksi = null;
  ensureUkurState(State, 'ukurVerifAsli');
  ensureUkurState(State, 'ukurVerifBaru');
  ensureExerciseArray(State, 'verifExercises', VERIF_SOAL, function (q) {
    return { chosen: null, correct: false, optionOrder: shuffleArray(optionIds(q.options)) };
  });

  /* Tahap 8 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);
  ensureMap('simpulanPilihan');

  /* Tahap 9 — soal dipilih acak dari bank; opsi tiap soal diacak */
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

  /* Tahap 10 */
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

/* Dua papan ukur berdampingan (bangun lama & baru). */
function papanUkurDuo(idA, a, stA, judulA, idB, b, stB, judulB) {
  var sk = Math.max(14, Math.min(26, 110 / kgrRadius([a, b])));
  return (
    '<div class="ppb-duo">' +
    buildMeasureBoard(idA, a, stA, { judul: judulA, warna: 'a', skala: sk }) +
    buildMeasureBoard(idB, b, stB, { judul: judulB, warna: 'b', skala: sk }) +
    '</div>'
  );
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
      '<h2 style="margin-top:0;">🖼️ ' +
        esc(D.judul) +
        '</h2>' +
        '<p class="stimulasi-cerita">' +
        esc(D.cerita) +
        '</p>' +
        '<div class="ppb-galeri">' +
        D.galeri
          .map(function (g) {
            return (
              '<figure class="ppb-galeri__item">' +
              gambarPerubahan(bangunPP(g.bangun), g.aksi, 11) +
              '<figcaption>' +
              esc(g.keterangan) +
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
      navigateTo('ukur');
    });
  }
}

/* ============================================================
   7. STAGE: LAB UKUR  (Discovery Learning — sintaks 3)
   Mengukur bendera asli & cetakan ×k → rekap → pertanyaan penuntun.
   ============================================================ */

function renderUkur(container) {
  var D = DATA.ukur;
  var ukurOk = ukurSelesai(UKUR_ASLI, State.ukurAsli) && ukurSelesai(UKUR_CETAK, State.ukurCetak);
  var tanyaOk = guidedQuizAllCorrect(UKUR_TANYA, State.ukurPilih);

  function rerender() {
    renderUkur(container);
  }

  var html =
    '<section aria-label="Mengumpulkan Data: Lab Ukur">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    buildDlPanel(
      judulPanel('📏 Lab Ukur') +
        papanUkurDuo(
          'ua',
          UKUR_ASLI,
          State.ukurAsli,
          D.judulAsli,
          'uc',
          UKUR_CETAK,
          State.ukurCetak,
          D.judulCetak
        )
    );

  if (ukurOk) {
    html += buildDlPanel(
      judulPanel('📋 Rekap pengukuran') +
        buildBandingTabelPP(UKUR_ASLI, UKUR_CETAK, { caption: 'Bendera ABC dan A′B′C′' }) +
        '<p>' +
        esc(D.tanyaInstruksi) +
        '</p>' +
        buildGuidedQuizList(UKUR_TANYA, State.ukurOrders, State.ukurPilih) +
        (tanyaOk ? daftarTemuan(D.temuan) : '')
    );
  }

  html +=
    (ukurOk && tanyaOk ? buildDlNextButton('ukurNextBtn', D.nextLabel, true) : '') + '</section>';
  container.innerHTML = html;

  function ubah() {
    saveState();
    rerender();
  }
  bindMeasureBoard(container, 'ua', State.ukurAsli, ubah);
  bindMeasureBoard(container, 'uc', State.ukurCetak, ubah);
  bindGuidedQuizList(container, UKUR_TANYA, State.ukurPilih, saveState, rerender);
  bindNext('ukurNextBtn', 'ukur', 'ubah');
}

/* ============================================================
   8. STAGE: LAB UBAH UKURAN  (Discovery Learning — sintaks 3)
   Lab Ubah → catatan percobaan → pertanyaan penuntun.
   ============================================================ */

function renderUbah(container) {
  var D = DATA.ubah;
  var lab = State.labUbah;
  var labOk = labUbahPPLengkap(lab, LAB_UBAH);
  var tanyaOk = guidedQuizAllCorrect(UBAH_TANYA, State.ubahPilih);
  var sisa = Math.max(0, LAB_UBAH.minCoba - lab.log.length);

  function rerender() {
    renderUbah(container);
  }

  var html =
    '<section aria-label="Mengumpulkan Data: Lab Ubah Ukuran">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    buildDlPanel(judulPanel('🖨️ Lab Ubah Ukuran') + buildLabUbahPP('lab', lab, LAB_UBAH)) +
    buildDlPanel(
      judulPanel(esc(D.logJudul)) +
        buildLogUbahPP(lab, LAB_UBAH) +
        (labOk
          ? ''
          : '<p class="dl-caption">' +
            (sisa ? 'Lakukan ' + sisa + ' percobaan lagi. ' : 'Percobaanmu sudah cukup banyak. ') +
            'Pastikan ketiga cara perubahan (kali, tambah, regang) sudah dicoba.</p>')
    );

  if (labOk) {
    html += buildDlPanel(
      judulPanel('🧐 Apa yang kamu temukan?') +
        '<p>' +
        esc(D.tanyaInstruksi) +
        '</p>' +
        buildGuidedQuizList(UBAH_TANYA, State.ubahOrders, State.ubahPilih) +
        (tanyaOk ? daftarTemuan(D.temuan) : '')
    );
  }

  html +=
    (labOk && tanyaOk ? buildDlNextButton('ubahNextBtn', D.nextLabel, true) : '') + '</section>';
  container.innerHTML = html;

  bindLabUbahPP(container, 'lab', lab, LAB_UBAH, function () {
    saveState();
    rerender();
  });
  bindGuidedQuizList(container, UBAH_TANYA, State.ubahPilih, saveState, rerender);
  bindNext('ubahNextBtn', 'ubah', 'olahSisi');
}

/* ============================================================
   9. STAGE: OLAH SISI  (Discovery Learning — sintaks 4)
   Pertanyaan konsep → langkah isian berdiagnosa.
   ============================================================ */

function renderOlahSisi(container) {
  var D = DATA.olahSisi;
  var konsepOk = guidedQuizAllCorrect(SISI_KONSEP, State.sisiPilih);
  var langkahOk = langkahSelesai('olahSisi');

  function rerender() {
    renderOlahSisi(container);
  }

  var html =
    '<section aria-label="Mengolah Data: Panjang Sisi">' +
    buildHead(D) +
    buildDlPanel(
      judulPanel('A. Hubungan sisi baru dan sisi lama') +
        '<p>' +
        esc(D.instruksiKonsep) +
        '</p>' +
        '<div class="ppb-rumus" aria-label="sisi baru sama dengan k kali sisi lama">' +
        '<span>sisi baru</span><span>=</span><span class="ppb-rumus__k">k</span><span>×</span><span>sisi lama</span>' +
        '</div>' +
        buildGuidedQuizList(SISI_KONSEP, State.sisiOrders, State.sisiPilih)
    );

  if (konsepOk) {
    html += buildDlPanel(
      judulPanel('B. Hitung dengan faktor k') +
        '<p>' +
        esc(D.langkahInstruksi) +
        '</p>' +
        langkahHTML('olahSisi') +
        (langkahOk ? daftarTemuan(D.temuan) : '')
    );
  }

  html +=
    (konsepOk && langkahOk ? buildDlNextButton('olahSisiNextBtn', D.nextLabel, true) : '') +
    '</section>';
  container.innerHTML = html;

  bindGuidedQuizList(container, SISI_KONSEP, State.sisiPilih, saveState, rerender);
  if (konsepOk) bindLangkah('olahSisi', rerender);
  bindNext('olahSisiNextBtn', 'olahSisi', 'olahSudut');
}

/* ============================================================
   10. STAGE: OLAH SUDUT  (Discovery Learning — sintaks 4)
   Langkah sudut → memilah perubahan → pertanyaan konsep.
   ============================================================ */

function renderOlahSudut(container) {
  var D = DATA.olahSudut;
  var langkahOk = langkahSelesai('olahSudut');
  var pilahOk = sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);
  var konsepOk = guidedQuizAllCorrect(SUDUT_KONSEP, State.sudutPilih);

  function rerender() {
    renderOlahSudut(container);
  }

  var html =
    '<section aria-label="Mengolah Data: Besar Sudut">' +
    buildHead(D) +
    buildDlPanel(
      judulPanel('A. Sudut setelah perubahan proporsional') +
        '<p>' +
        esc(D.langkahInstruksi) +
        '</p>' +
        langkahHTML('olahSudut')
    );

  if (langkahOk) {
    html += buildDlPanel(
      judulPanel('B. Pilah perubahan ukuran') +
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
                ' perubahan</strong> kamu pilah dengan tepat.'
            ) +
            '</div>'
          : '')
    );
  }

  if (langkahOk && pilahOk) {
    html += buildDlPanel(
      judulPanel('C. Simpulkan') +
        '<p>' +
        esc(D.konsepInstruksi) +
        '</p>' +
        buildGuidedQuizList(SUDUT_KONSEP, State.sudutOrders, State.sudutPilih) +
        (konsepOk ? daftarTemuan(D.temuan) : '')
    );
  }

  html +=
    (langkahOk && pilahOk && konsepOk
      ? buildDlNextButton('olahSudutNextBtn', D.nextLabel, true)
      : '') + '</section>';
  container.innerHTML = html;

  bindLangkah('olahSudut', rerender);
  bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  bindGuidedQuizList(container, SUDUT_KONSEP, State.sudutPilih, saveState, rerender);
  bindNext('olahSudutNextBtn', 'olahSudut', 'verifikasi');
}

/* ============================================================
   11. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A. Prediksi pada bangun baru.
   B. Ukur hasilnya.
   C. Cocokkan.
   D. Tanggapi miskonsepsi.
   ============================================================ */

function verifSoalSemuaDijawab() {
  return State.verifExercises.every(function (e) {
    return !!e.chosen;
  });
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var prediksi = State.verifPrediksi;
  var ukurOk =
    !!prediksi &&
    ukurSelesai(VERIF_ASLI, State.ukurVerifAsli) &&
    ukurSelesai(VERIF_BARU, State.ukurVerifBaru);
  var langkahOk = ukurOk && langkahSelesai('verifikasi');

  function rerender() {
    renderVerifikasi(container);
  }

  var html =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      judulPanel('A. Prediksi dulu') +
        '<p>' +
        esc(D.instruksiPrediksi) +
        '</p>' +
        '<div class="ppb-stage">' +
        buildShapeSVG(VERIF_ASLI, { skala: 22, warna: 'c', judul: D.judulAsli }) +
        '</div>' +
        buildChoiceGroup(OPSI_PREDIKSI, State.verifPrediksiOrder, {
          chosen: prediksi,
          locked: true,
          group: 'prediksi',
          attr: 'data-prediksi',
        })
    );

  if (prediksi) {
    html += buildDlPanel(
      judulPanel('B. Ukur, lalu bandingkan') +
        '<p>' +
        esc(D.instruksiUkur) +
        '</p>' +
        papanUkurDuo(
          'va',
          VERIF_ASLI,
          State.ukurVerifAsli,
          D.judulAsli,
          'vb',
          VERIF_BARU,
          State.ukurVerifBaru,
          D.judulBaru
        )
    );
  }

  if (ukurOk) {
    var tepat = prediksi === D.prediksiBenar;
    html += buildDlPanel(
      judulPanel('C. Cocokkan dengan prediksimu') +
        buildBandingTabelPP(VERIF_ASLI, VERIF_BARU, { caption: 'Papan TUVW dan T′U′V′W′' }) +
        buildFeedbackBox(
          tepat ? 'success' : 'warning',
          tepat ? '✓' : '💭',
          '<strong>' +
            (tepat ? 'Prediksimu terbukti.' : 'Prediksimu belum tepat.') +
            '</strong> ' +
            esc(pesanBandingPP(bandingUbahPP(VERIF_ASLI, VERIF_BARU)))
        ) +
        '<p style="margin-top:var(--space-4);">' +
        esc(D.instruksiHitung) +
        '</p>' +
        langkahHTML('verifikasi')
    );
  }

  if (langkahOk) {
    html += buildDlPanel(
      judulPanel('D. Tanggapi pendapat teman') +
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
    (langkahOk && verifSoalSemuaDijawab()
      ? buildDlNextButton('verifNextBtn', D.nextLabel, true)
      : '') + '</section>';
  container.innerHTML = html;

  container.querySelectorAll('[data-prediksi]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (State.verifPrediksi) return;
      State.verifPrediksi = b.dataset.prediksi;
      saveState();
      rerender();
    });
  });

  function ubah() {
    saveState();
    rerender();
  }
  if (prediksi) {
    bindMeasureBoard(container, 'va', State.ukurVerifAsli, ubah);
    bindMeasureBoard(container, 'vb', State.ukurVerifBaru, ubah);
  }
  if (ukurOk) bindLangkah('verifikasi', rerender);

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
   12. STAGE: MENARIK KESIMPULAN  (Discovery Learning — sintaks 6)
   ============================================================ */

function simpulanSemuaBenar() {
  return DATA.generalisasi.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function buildRangkumanVisual() {
  var b = bangunPP('bendera');
  return (
    '<div class="ppb-galeri">' +
    [
      { jenis: 'kali', nilai: 0.5 },
      { jenis: 'kali', nilai: 2 },
    ]
      .map(function (aksi) {
        return (
          '<figure class="ppb-galeri__item">' +
          gambarPerubahan(b, aksi, 12) +
          '<figcaption>' +
          esc(labelAksiPP(aksi)) +
          ': sudut tetap</figcaption></figure>'
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
          judulPanel('Rangkuman Perubahan Proporsional') +
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
   13. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal campuran 'input'
   (isian berdiagnosa periksaSoalPP) dan 'choice' (opsi diacak lewat
   ex.optionOrder di initExerciseArrays()).
   ============================================================ */

function satuanTerap(s) {
  return s.cek ? satuanSoalPP(s.cek.minta, s.satuan) : '';
}

function jawabTerapTeks(s) {
  var sat = satuanTerap(s);
  return jawabSoalPP(s) + (sat === '°' ? '°' : sat ? ' ' + sat : '');
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
  inputPlaceholder: 'mis. 7,5',
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
    var d = periksaSoalPP(val, TERAP_SOAL[State.terapkanIdx]);
    if (d.kode === 'format') return { value: null, error: 'invalid', message: d.pesan };
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return periksaSoalPP(value, s).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' + esc(ex.userInput) + '</strong> — ' + esc(periksaSoalPP(ex.userInput, s).pesan)
    );
  },
  revealText: function (s) {
    return 'Jawabannya <strong>' + esc(jawabTerapTeks(s)) + '</strong>. ' + esc(s.explanation);
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
      (s.gambar
        ? '<div class="ppb-soal-gambar">' +
          gambarPerubahan(bangunPP(s.gambar.bangun), s.gambar.aksi, 9) +
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
   14. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var percobaan = State.labUbah.log.length;
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
        kartu(percobaan, 'Percobaan Lab Ubah') +
        kartu(pilahBenar + '/' + PILAH_ITEMS.length, 'Perubahan dipilah tepat') +
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
    '<div class="sajian-trio">' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">🔎</span>k = sisi baru ÷ sisi lama</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">📏</span>sisi baru = k × sisi lama</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">📐</span>sudut baru = sudut lama</div>' +
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
    'Kemampuan murid mengukur dengan penggaris dan busur sungguhan serta menjelaskan mengapa sudut tetap dan sisi dikali k tetap menjadi bahan penilaian utama.' +
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
   16. ROUTER RENDER, MODAL RESET & INIT
   ============================================================ */

var RENDERERS = {
  stimulasi: renderStimulasi,
  masalah: renderMasalah,
  ukur: renderUkur,
  ubah: renderUbah,
  olahSisi: renderOlahSisi,
  olahSudut: renderOlahSudut,
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
