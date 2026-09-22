'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Konsep Rasio & Menyederhanakan Perbandingan
   Fase D — SMP Kelas 7

   Utilitas bersama (esc, parseInputInt, parseInputDecimal,
   formatNumber, gcd, shuffleArray, showNotice, buildFeedbackBox,
   buildProgressDots, createStageMachine, createExerciseStage,
   createStore, ensureExerciseArray) berada di shared/engine.js.

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   Seluruh pilihan jawaban DIACAK dengan shuffleArray(). Pengacakan
   dilakukan SEKALI saat state disiapkan (initExerciseArrays), lalu
   urutannya disimpan di State — bukan saat render. Dengan begitu
   pilihan tidak melompat-lompat setiap kali tahap dirender ulang,
   tetapi teracak ulang untuk setiap murid dan setiap kali Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi            (DL sintaks 1)
    6. Stage: Identifikasi Masalah (DL sintaks 2)
    7. Stage: Pengumpulan Data     (DL sintaks 3)
    8. Stage: Pengolahan Data      (DL sintaks 4a — satuan sama)
    9. Stage: Samakan Satuan       (DL sintaks 4b — satuan berbeda)
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
  'olahData',
  'satuan',
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
  'Sederhana',
  'Satuan',
  'Bukti',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-2-1-rasio-v1';

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
  stimulasiSaved: false,

  /* Tahap 2 — identifikasi masalah */
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',
  masalahSaved: false,

  /* Tahap 3 — pengumpulan data */
  koleksiInputs: [],
  koleksiDone: [],
  koleksiChecked: false,
  cocokExercises: [],

  /* Tahap 4 — pengolahan data (satuan sama) */
  olahExercises: [],

  /* Tahap 5 — samakan satuan */
  satuanExercises: [],

  /* Tahap 6 — pembuktian */
  verifInputs: [],
  verifDone: [],
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
  refleksiSaved: false,
};

var Store = createStore({ key: STORAGE_KEY, state: State });
var saveState = Store.save;
var loadState = Store.load;

function clearState() {
  Store.reset();
  initExerciseArrays();
}

/* Mengambil daftar id opsi dalam urutan acak yang sudah tersimpan. */
function idsOf(options) {
  return options.map(function (o) {
    return o.id;
  });
}

/*
 * Menyiapkan seluruh array state per-soal DAN seluruh urutan acak
 * pilihan jawaban. Dipanggil sekali saat init (setelah loadState) dan
 * setiap kali progress direset — sehingga murid berikutnya mendapat
 * urutan pilihan yang berbeda.
 */
function initExerciseArrays() {
  /* Tahap 1 & 2 — urutan pilihan tunggal */
  if (
    !Array.isArray(State.stimulasiOrder) ||
    State.stimulasiOrder.length !== DATA.stimulasi.opsi.length
  ) {
    State.stimulasiOrder = shuffleArray(idsOf(DATA.stimulasi.opsi));
  }
  if (
    !Array.isArray(State.masalahOrder) ||
    State.masalahOrder.length !== DATA.masalah.opsi.length
  ) {
    State.masalahOrder = shuffleArray(idsOf(DATA.masalah.opsi));
  }

  /* Tahap 3 — tabel data + pencocokan */
  ensureExerciseArray(State, 'koleksiInputs', DATA.koleksi.situasi, function () {
    return { a: '', b: '' };
  });
  if (
    !Array.isArray(State.koleksiDone) ||
    State.koleksiDone.length !== DATA.koleksi.situasi.length
  ) {
    State.koleksiDone = DATA.koleksi.situasi.map(function () {
      return null;
    });
  }
  ensureExerciseArray(State, 'cocokExercises', DATA.koleksi.cocok, function (s) {
    return { chosen: null, correct: false, optionOrder: shuffleArray(idsOf(s.options)) };
  });

  /* Tahap 4 — penyederhanaan bersatuan sama */
  ensureExerciseArray(State, 'olahExercises', DATA.olahData.kasus, function () {
    return { fpb: '', a: '', b: '', attempts: 0, hintLevel: 0, done: false, salah: false };
  });

  /* Tahap 5 — penyamaan satuan (3 langkah per kasus) */
  ensureExerciseArray(State, 'satuanExercises', DATA.satuan.kasus, function (s) {
    return {
      optionOrder: shuffleArray(idsOf(s.opsiSatuan)),
      satuan: null,
      satuanBenar: false,
      konversi: '',
      konversiBenar: false,
      sederhanaA: '',
      sederhanaB: '',
      done: false,
      attempts: 0,
      hintLevel: 0,
      salah: false,
    };
  });

  /* Tahap 6 — pembuktian */
  ensureExerciseArray(State, 'verifInputs', DATA.verifikasi.uji, function () {
    return { a: '', b: '' };
  });
  if (!Array.isArray(State.verifDone) || State.verifDone.length !== DATA.verifikasi.uji.length) {
    State.verifDone = DATA.verifikasi.uji.map(function () {
      return false;
    });
  }
  ensureExerciseArray(State, 'verifExercises', DATA.verifikasi.soal, function (s) {
    return { chosen: null, correct: false, optionOrder: shuffleArray(idsOf(s.options)) };
  });

  /* Tahap 7 — bank potongan kalimat */
  if (!Array.isArray(State.bankOrder) || State.bankOrder.length !== DATA.generalisasi.bank.length) {
    State.bankOrder = shuffleArray(idsOf(DATA.generalisasi.bank));
  }

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
      optionOrder: s.options ? shuffleArray(idsOf(s.options)) : null,
    };
  });
  if (State.terapkanIdx >= DATA.terapkan.soal.length || State.terapkanIdx < 0) {
    State.terapkanIdx = 0;
  }

  /* Tahap 9 — pilihan penilaian diri */
  if (
    !Array.isArray(State.refleksiDiriOrder) ||
    State.refleksiDiriOrder.length !== DATA.refleksi.diriOpsi.length
  ) {
    State.refleksiDiriOrder = shuffleArray(idsOf(DATA.refleksi.diriOpsi));
  }
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

/* Mencari opsi berdasarkan id di dalam sebuah array opsi DATA. */
function findById(list, id) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

/*
 * Menyusun daftar opsi menurut urutan acak yang tersimpan di State.
 * Bila urutan belum ada atau tidak lagi cocok dengan DATA, urutan asli
 * dipakai agar tampilan tetap aman.
 */
function orderOptions(options, order) {
  if (!Array.isArray(order) || order.length !== options.length) return options;
  var out = [];
  for (var i = 0; i < order.length; i++) {
    var opt = findById(options, order[i]);
    if (!opt) return options;
    out.push(opt);
  }
  return out;
}

/* Kepala tahap standar. */
function buildHead(kicker, goal) {
  return (
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">' +
    esc(kicker) +
    '</span>' +
    '<p class="stage-head__goal">Tujuan: ' +
    esc(goal) +
    '</p>' +
    '</div>'
  );
}

/*
 * Tombol pilihan ganda bergaya shared (.choice-btn + .is-*).
 *   revealState  true  → tandai benar/salah setelah dijawab
 *                false → hanya tandai pilihan (.is-selected), tanpa menilai
 *   correctId    id opsi benar, atau null bila jawaban benar belum boleh
 *                dibocorkan (tahap yang masih mengizinkan coba lagi) —
 *                pilihan keliru tetap ditandai merah
 *   locked       true  → matikan tombol setelah dijawab (sekali pilih)
 */
function buildChoiceButtons(options, order, chosen, correctId, revealState, locked) {
  var letters = ['A', 'B', 'C', 'D', 'E'];
  var answered = chosen !== null && chosen !== undefined;
  return (
    '<div class="challenge-options">' +
    orderOptions(options, order)
      .map(function (opt, i) {
        var cls = 'choice-btn';
        if (answered) {
          if (revealState) {
            if (opt.id === correctId) cls += ' is-correct';
            else if (opt.id === chosen) cls += ' is-incorrect';
          } else if (opt.id === chosen) {
            cls += ' is-selected';
          }
        }
        return (
          '<button type="button" class="' +
          cls +
          '" data-opt-id="' +
          esc(opt.id) +
          '"' +
          (answered && locked ? ' disabled' : '') +
          '>' +
          '<span class="choice-btn__icon">' +
          letters[i] +
          '</span>' +
          '<span>' +
          opt.label +
          '</span>' +
          '</button>'
        );
      })
      .join('') +
    '</div>'
  );
}

/*
 * Deretan bulatan takaran. Bila perGroup diberikan, bulatan dibungkus
 * per kelompok sebesar itu (memvisualkan pembagian dengan FPB); tanpa
 * perGroup bulatan tampil polos tanpa bingkai kelompok.
 */
function buildDots(count, modifier, perGroup) {
  var dot = '<span class="takaran-dot takaran-dot--' + modifier + '"></span>';
  var html = '';
  var i;
  if (!perGroup) {
    for (i = 0; i < count; i++) html += dot;
    return '<span class="takaran-dots">' + html + '</span>';
  }
  var group = '';
  for (i = 0; i < count; i++) {
    group += dot;
    if ((i + 1) % perGroup === 0) {
      html += '<span class="takaran-group">' + group + '</span>';
      group = '';
    }
  }
  if (group) html += '<span class="takaran-group">' + group + '</span>';
  return '<span class="takaran-dots">' + html + '</span>';
}

/* Kartu takaran satu gelas: bulatan gula & air + label. */
function buildGelasCard(g, perGroupGula, perGroupAir) {
  return (
    '<div class="gelas-card">' +
    '<h4 class="gelas-card__title">' +
    esc(g.nama) +
    '</h4>' +
    '<div class="takaran-row">' +
    '<span class="takaran-row__label">Gula</span>' +
    buildDots(g.gula, 'gula', perGroupGula) +
    '<span class="takaran-row__count">' +
    g.gula +
    '</span>' +
    '</div>' +
    '<div class="takaran-row">' +
    '<span class="takaran-row__label">Air</span>' +
    buildDots(g.air, 'air', perGroupAir) +
    '<span class="takaran-row__count">' +
    g.air +
    '</span>' +
    '</div>' +
    '<p class="gelas-card__ratio">' +
    g.gula +
    ' : ' +
    g.air +
    '</p>' +
    '</div>'
  );
}

/* Lencana rasio besar, mis. "1 : 3". */
function buildRasioBadge(a, b, modifier) {
  return (
    '<span class="rasio-badge' +
    (modifier ? ' rasio-badge--' + modifier : '') +
    '">' +
    formatNumber(a) +
    ' <span class="rasio-badge__sep">:</span> ' +
    formatNumber(b) +
    '</span>'
  );
}

/* Kotak petunjuk berjenjang. */
function buildHintBox(hints, level) {
  if (!level || level < 1) return '';
  return hints
    .slice(0, level)
    .map(function (h, i) {
      return (
        '<div class="hint-box">' +
        '<span class="hint-box__label">' +
        (hints.length > 1 ? 'Petunjuk ' + (i + 1) : 'Petunjuk') +
        '</span>' +
        h +
        '</div>'
      );
    })
    .join('');
}

/* Tombol petunjuk berjenjang; null bila seluruh petunjuk sudah terbuka. */
function buildHintButton(id, hints, level) {
  if (level >= hints.length) return '';
  var label =
    hints.length > 1 ? '💡 Petunjuk (' + (level + 1) + '/' + hints.length + ')' : '💡 Petunjuk';
  return (
    '<button type="button" class="btn btn--ghost btn--small" id="' + id + '">' + label + '</button>'
  );
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Media sengaja tidak memberi
   penilaian benar/salah di sini; dugaan disimpan untuk diuji
   sendiri oleh murid pada tahap Pembuktian.
   ============================================================ */

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var terisi = State.stimulasiPilihan !== null && State.stimulasiPilihan !== undefined;

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D.kicker, D.goal) +
    '<div class="panel panel--hero">' +
    '<h2 style="margin-top:0;">' +
    esc(D.judul) +
    '</h2>' +
    '<p>' +
    esc(D.cerita) +
    '</p>' +
    '<div class="gelas-grid">' +
    D.gelas
      .map(function (g) {
        return buildGelasCard(g);
      })
      .join('') +
    '</div>' +
    '<p class="takaran-legend">' +
    '<span class="takaran-dot takaran-dot--gula"></span> ' +
    esc(D.satuanGula) +
    ' &nbsp;·&nbsp; ' +
    '<span class="takaran-dot takaran-dot--air"></span> ' +
    esc(D.satuanAir) +
    '</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p class="exercise-label">' +
    esc(D.pertanyaan) +
    '</p>' +
    buildChoiceButtons(D.opsi, State.stimulasiOrder, State.stimulasiPilihan, null, false) +
    '<div class="field-group" style="margin-top:var(--space-4);">' +
    '<label for="stimulasiAlasan">' +
    esc(D.alasanLabel) +
    '</label>' +
    '<textarea id="stimulasiAlasan" class="input-textarea" placeholder="' +
    esc(D.alasanPlaceholder) +
    '">' +
    esc(State.stimulasiAlasan) +
    '</textarea>' +
    '</div>' +
    buildFeedbackBox('info', '🔎', esc(D.catatan)) +
    '</div>' +
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
  if (ta) {
    ta.addEventListener('input', function () {
      State.stimulasiAlasan = ta.value;
      saveState();
    });
  }

  document.getElementById('stimulasiNextBtn').addEventListener('click', function () {
    if (State.stimulasiPilihan === null) {
      showNotice('Pilih dulu dugaanmu sebelum melanjutkan.');
      return;
    }
    State.stimulasiSaved = true;
    saveState();
    completeStage('stimulasi');
    navigateTo('masalah');
  });
}

/* ============================================================
   6. STAGE: IDENTIFIKASI MASALAH  (Discovery Learning — sintaks 2)
   ============================================================ */

function renderMasalah(container) {
  var D = DATA.masalah;
  var answered = State.masalahPilihan !== null && State.masalahPilihan !== undefined;
  var benar = State.masalahPilihan === D.correct;

  var feedbackHTML = '';
  if (answered) {
    feedbackHTML = buildFeedbackBox(
      benar ? 'success' : 'warning',
      benar ? '✓' : '💭',
      D.umpan[State.masalahPilihan]
    );
  }

  container.innerHTML =
    '<section aria-label="Identifikasi Masalah">' +
    buildHead(D.kicker, D.goal) +
    '<div class="panel panel--info">' +
    '<p style="margin:0;">' +
    esc(D.pengantar) +
    '</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p class="exercise-label">' +
    esc(D.pertanyaan) +
    '</p>' +
    buildChoiceButtons(
      D.opsi,
      State.masalahOrder,
      State.masalahPilihan,
      benar ? D.correct : null,
      true,
      benar
    ) +
    (feedbackHTML ? '<div style="margin-top:var(--space-3);">' + feedbackHTML + '</div>' : '') +
    '</div>' +
    (benar
      ? '<div class="panel">' +
        '<div class="field-group">' +
        '<label for="masalahHipotesis">' +
        esc(D.hipotesisLabel) +
        '</label>' +
        '<textarea id="masalahHipotesis" class="input-textarea" placeholder="' +
        esc(D.hipotesisPlaceholder) +
        '">' +
        esc(State.masalahHipotesis) +
        '</textarea>' +
        '</div>' +
        '</div>'
      : '') +
    (benar
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary" id="masalahNextBtn">' +
        esc(D.nextLabel) +
        '</button>' +
        '</div>'
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
        showNotice('Tulis dugaan sementaramu lebih dulu, walau hanya satu kalimat.');
        return;
      }
      State.masalahSaved = true;
      saveState();
      completeStage('masalah');
      navigateTo('koleksi');
    });
  }
}

/* ============================================================
   7. STAGE: PENGUMPULAN DATA  (Discovery Learning — sintaks 3)
   Bagian A: mencatat pasangan bilangan.
   Bagian B: tiga bentuk penulisan rasio (dibuka setelah A benar).
   Bagian C: mencocokkan pernyataan dengan bentuk rasionya.
   ============================================================ */

function koleksiSemuaBenar() {
  return State.koleksiDone.every(function (d) {
    return d === true;
  });
}

function cocokSemuaDijawab() {
  return State.cocokExercises.every(function (e) {
    return e.chosen !== null && e.chosen !== undefined;
  });
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var bukaB = koleksiSemuaBenar();

  var tabelHTML = D.situasi
    .map(function (s, i) {
      var inp = State.koleksiInputs[i];
      var status = State.koleksiDone[i];
      var cls =
        'data-row' +
        (status === true ? ' data-row--correct' : status === false ? ' data-row--incorrect' : '');
      return (
        '<div class="' +
        cls +
        '">' +
        '<div class="data-row__info">' +
        '<h4 class="data-row__title">' +
        esc(s.judul) +
        '</h4>' +
        '<p class="data-row__text">' +
        esc(s.teks) +
        '</p>' +
        '</div>' +
        '<div class="data-row__fields">' +
        '<span class="data-row__minta">' +
        esc(s.minta) +
        '</span>' +
        '<label class="sr-only" for="kol-a-' +
        i +
        '">Banyak ' +
        esc(s.labelA) +
        '</label>' +
        '<input type="text" inputmode="numeric" class="input-text data-row__input" id="kol-a-' +
        i +
        '" data-kol="a" data-idx="' +
        i +
        '" value="' +
        esc(inp.a) +
        '" placeholder="?" />' +
        '<span class="data-row__sep">:</span>' +
        '<label class="sr-only" for="kol-b-' +
        i +
        '">Banyak ' +
        esc(s.labelB) +
        '</label>' +
        '<input type="text" inputmode="numeric" class="input-text data-row__input" id="kol-b-' +
        i +
        '" data-kol="b" data-idx="' +
        i +
        '" value="' +
        esc(inp.b) +
        '" placeholder="?" />' +
        (status === true ? '<span class="data-row__mark data-row__mark--ok">✓</span>' : '') +
        (status === false ? '<span class="data-row__mark data-row__mark--no">✗</span>' : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  var bentukHTML = '';
  if (bukaB) {
    bentukHTML =
      '<div class="panel panel--info">' +
      '<h3 style="margin-top:0;">' +
      esc(D.bentuk.judul) +
      '</h3>' +
      '<p>' +
      esc(D.bentuk.teks) +
      '</p>' +
      '<div class="bentuk-grid">' +
      D.bentuk.contoh
        .map(function (c) {
          return (
            '<div class="bentuk-card">' +
            '<span class="bentuk-card__form">' +
            esc(c.bentuk) +
            '</span>' +
            '<span class="bentuk-card__name">' +
            esc(c.nama) +
            '</span>' +
            '<span class="bentuk-card__note">' +
            esc(c.baca) +
            '</span>' +
            '</div>'
          );
        })
        .join('') +
      '</div>' +
      '</div>';
  }

  var cocokHTML = '';
  if (bukaB) {
    cocokHTML =
      '<div class="panel">' +
      '<p class="exercise-label">' +
      esc(D.instruksiC) +
      '</p>' +
      D.cocok
        .map(function (s, i) {
          var ex = State.cocokExercises[i];
          var answered = ex.chosen !== null && ex.chosen !== undefined;
          return (
            '<div class="cocok-item" data-cocok="' +
            i +
            '">' +
            '<p class="cocok-item__q">' +
            s.pernyataan +
            '</p>' +
            buildChoiceButtons(s.options, ex.optionOrder, ex.chosen, s.correct, true, true) +
            (answered
              ? buildFeedbackBox(
                  ex.correct ? 'success' : 'error',
                  ex.correct ? '✓' : '✗',
                  (ex.correct ? '<strong>Tepat.</strong> ' : '<strong>Belum tepat.</strong> ') +
                    s.explanation
                )
              : '') +
            '</div>'
          );
        })
        .join('') +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D.kicker, D.goal) +
    '<div class="panel">' +
    '<p class="exercise-label">' +
    esc(D.instruksiA) +
    '</p>' +
    tabelHTML +
    '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
    '<button type="button" class="btn btn--primary" id="koleksiCheckBtn">Periksa Data</button>' +
    '</div>' +
    '</div>' +
    bentukHTML +
    cocokHTML +
    (bukaB && cocokSemuaDijawab()
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="koleksiNextBtn">' +
        esc(D.nextLabel) +
        '</button>' +
        '</div>'
      : '') +
    '</section>';

  container.querySelectorAll('.data-row__input').forEach(function (inp) {
    inp.addEventListener('input', function () {
      State.koleksiInputs[inp.dataset.idx][inp.dataset.kol] = inp.value;
      saveState();
    });
  });

  document.getElementById('koleksiCheckBtn').addEventListener('click', function () {
    var adaKosong = false;
    D.situasi.forEach(function (s, i) {
      var inp = State.koleksiInputs[i];
      var pa = parseInputInt(inp.a);
      var pb = parseInputInt(inp.b);
      if (pa.error || pb.error) {
        adaKosong = true;
        State.koleksiDone[i] = null;
        return;
      }
      State.koleksiDone[i] = pa.value === s.a && pb.value === s.b;
    });
    State.koleksiChecked = true;
    saveState();
    if (adaKosong) showNotice('Masih ada kolom yang kosong atau bukan bilangan.');
    else if (!koleksiSemuaBenar())
      showNotice('Ada yang belum tepat. Perhatikan urutan besaran yang diminta.');
    renderKoleksi(container);
  });

  container.querySelectorAll('.cocok-item').forEach(function (wrap) {
    var i = parseInt(wrap.dataset.cocok, 10);
    wrap.querySelectorAll('[data-opt-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var ex = State.cocokExercises[i];
        if (ex.chosen !== null && ex.chosen !== undefined) return;
        ex.chosen = btn.dataset.optId;
        ex.correct = ex.chosen === D.cocok[i].correct;
        saveState();
        renderKoleksi(container);
      });
    });
  });

  var nextBtn = document.getElementById('koleksiNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('koleksi');
      navigateTo('olahData');
    });
  }
}

/* ============================================================
   8. STAGE: PENGOLAHAN DATA  (Discovery Learning — sintaks 4a)
   Besaran sejenis, satuan sama → bagi kedua bilangan dengan FPB.
   ============================================================ */

function olahSemuaSelesai() {
  return State.olahExercises.every(function (e) {
    return e.done;
  });
}

function renderOlahData(container) {
  var D = DATA.olahData;

  var kasusHTML = D.kasus
    .map(function (k, i) {
      var ex = State.olahExercises[i];
      var fpb = gcd(k.a, k.b);
      var sa = k.a / fpb;
      var sb = k.b / fpb;

      var hasilHTML = ex.done
        ? '<div class="olah-hasil">' +
          '<div class="olah-hasil__row">' +
          buildRasioBadge(k.a, k.b, 'muted') +
          '<span class="olah-hasil__arrow">÷ ' +
          fpb +
          ' →</span>' +
          buildRasioBadge(sa, sb, 'hero') +
          '</div>' +
          '<div class="olah-hasil__dots">' +
          buildDots(k.a, 'gula', fpb) +
          '<span class="olah-hasil__dotlabel">dikelompokkan ' +
          fpb +
          '-an → ' +
          sa +
          ' kelompok</span>' +
          '</div>' +
          '<div class="olah-hasil__dots">' +
          buildDots(k.b, 'air', fpb) +
          '<span class="olah-hasil__dotlabel">dikelompokkan ' +
          fpb +
          '-an → ' +
          sb +
          ' kelompok</span>' +
          '</div>' +
          '<p class="olah-hasil__makna">' +
          esc(k.makna) +
          '</p>' +
          '</div>'
        : '';

      var formHTML = ex.done
        ? ''
        : '<div class="olah-form">' +
          '<div class="olah-field">' +
          '<label for="olah-fpb-' +
          i +
          '">FPB dari ' +
          k.a +
          ' dan ' +
          k.b +
          '</label>' +
          '<input type="text" inputmode="numeric" class="input-text" id="olah-fpb-' +
          i +
          '" data-olah="fpb" data-idx="' +
          i +
          '" value="' +
          esc(ex.fpb) +
          '" placeholder="?" />' +
          '</div>' +
          '<div class="olah-field olah-field--pair">' +
          '<label for="olah-a-' +
          i +
          '">Bentuk paling sederhana</label>' +
          '<div class="olah-pair">' +
          '<input type="text" inputmode="numeric" class="input-text" id="olah-a-' +
          i +
          '" data-olah="a" data-idx="' +
          i +
          '" value="' +
          esc(ex.a) +
          '" placeholder="?" />' +
          '<span class="olah-pair__sep">:</span>' +
          '<label class="sr-only" for="olah-b-' +
          i +
          '">Bilangan kedua</label>' +
          '<input type="text" inputmode="numeric" class="input-text" id="olah-b-' +
          i +
          '" data-olah="b" data-idx="' +
          i +
          '" value="' +
          esc(ex.b) +
          '" placeholder="?" />' +
          '</div>' +
          '</div>' +
          '</div>' +
          (ex.salah
            ? buildFeedbackBox(
                'error',
                '✗',
                '<strong>Belum tepat.</strong> Periksa kembali pembagimu — pastikan kedua bilangan dibagi dengan bilangan yang sama.'
              )
            : '') +
          buildHintBox(k.hints, ex.hintLevel) +
          '<div class="btn-group btn-group--spread" style="margin-top:var(--space-3);">' +
          buildHintButton('olah-hint-' + i, k.hints, ex.hintLevel) +
          '<button type="button" class="btn btn--primary" data-olah-check="' +
          i +
          '">Periksa</button>' +
          '</div>';

      return (
        '<div class="panel olah-kasus' +
        (ex.done ? ' olah-kasus--done' : '') +
        '">' +
        '<div class="olah-kasus__head">' +
        '<h4 class="olah-kasus__title">' +
        esc(k.judul) +
        '</h4>' +
        '<span class="olah-kasus__konteks">' +
        esc(k.konteks) +
        '</span>' +
        '</div>' +
        formHTML +
        hasilHTML +
        '</div>'
      );
    })
    .join('');

  var selesai = olahSemuaSelesai();

  container.innerHTML =
    '<section aria-label="Pengolahan Data">' +
    buildHead(D.kicker, D.goal) +
    '<div class="panel panel--info">' +
    '<p style="margin:0;">' +
    esc(D.instruksi) +
    '</p>' +
    '</div>' +
    buildProgressDots(
      D.kasus.length,
      Math.min(
        State.olahExercises.filter(function (e) {
          return e.done;
        }).length,
        D.kasus.length - 1
      ),
      State.olahExercises.map(function (e) {
        return e.done ? 'correct' : e.salah ? 'incorrect' : null;
      })
    ) +
    kasusHTML +
    (selesai
      ? '<div class="panel panel--warning">' +
        '<p style="margin:0;">' +
        D.temuan +
        '</p>' +
        '</div>' +
        '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="olahNextBtn">' +
        esc(D.nextLabel) +
        '</button>' +
        '</div>'
      : '') +
    '</section>';

  container.querySelectorAll('[data-olah]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      State.olahExercises[inp.dataset.idx][inp.dataset.olah] = inp.value;
      saveState();
    });
  });

  D.kasus.forEach(function (k, i) {
    var hintBtn = document.getElementById('olah-hint-' + i);
    if (hintBtn) {
      hintBtn.addEventListener('click', function () {
        var ex = State.olahExercises[i];
        ex.hintLevel = Math.min(ex.hintLevel + 1, k.hints.length);
        saveState();
        renderOlahData(container);
      });
    }
  });

  container.querySelectorAll('[data-olah-check]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = parseInt(btn.dataset.olahCheck, 10);
      var k = D.kasus[i];
      var ex = State.olahExercises[i];
      var pf = parseInputInt(ex.fpb);
      var pa = parseInputInt(ex.a);
      var pb = parseInputInt(ex.b);
      if (pf.error || pa.error || pb.error) {
        showNotice('Isi ketiga kolom dengan bilangan bulat lebih dulu.');
        return;
      }
      var fpb = gcd(k.a, k.b);
      ex.attempts += 1;
      ex.done = pf.value === fpb && pa.value === k.a / fpb && pb.value === k.b / fpb;
      ex.salah = !ex.done;
      saveState();
      renderOlahData(container);
    });
  });

  var nextBtn = document.getElementById('olahNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('olahData');
      navigateTo('satuan');
    });
  }
}

/* ============================================================
   9. STAGE: SAMAKAN SATUAN  (Discovery Learning — sintaks 4b)
   Besaran sejenis, satuan BERBEDA → samakan satuan, baru
   disederhanakan. Dikerjakan tiga langkah per kasus.
   ============================================================ */

function satuanSemuaSelesai() {
  return State.satuanExercises.every(function (e) {
    return e.done;
  });
}

function renderSatuan(container) {
  var D = DATA.satuan;

  var kasusHTML = D.kasus
    .map(function (k, i) {
      var ex = State.satuanExercises[i];
      var langkah1 = ex.satuanBenar;
      var langkah2 = ex.konversiBenar;

      /* Langkah 1 — memilih satuan acuan */
      var umpan1 = '';
      if (ex.satuan) {
        umpan1 = buildFeedbackBox(
          ex.satuanBenar ? 'success' : 'warning',
          ex.satuanBenar ? '✓' : '💭',
          k.umpanSatuan[ex.satuan]
        );
      }
      var blok1 =
        '<div class="langkah' +
        (langkah1 ? ' langkah--done' : '') +
        '">' +
        '<span class="langkah__num">1</span>' +
        '<div class="langkah__body">' +
        '<p class="langkah__label">' +
        esc(D.langkahLabel[0]) +
        '</p>' +
        buildChoiceButtons(
          k.opsiSatuan,
          ex.optionOrder,
          ex.satuan,
          langkah1 ? k.correctSatuan : null,
          true,
          langkah1
        ) +
        (umpan1 ? '<div style="margin-top:var(--space-3);">' + umpan1 + '</div>' : '') +
        '</div>' +
        '</div>';

      /* Langkah 2 — konversi besaran yang belum sesuai */
      var blok2 = '';
      if (langkah1) {
        blok2 =
          '<div class="langkah' +
          (langkah2 ? ' langkah--done' : '') +
          '">' +
          '<span class="langkah__num">2</span>' +
          '<div class="langkah__body">' +
          '<p class="langkah__label">' +
          esc(D.langkahLabel[1]) +
          '</p>' +
          '<p class="langkah__hint">' +
          esc(k.konversi.faktorTeks) +
          '</p>' +
          (langkah2
            ? '<p class="langkah__done-text">' +
              esc(k.besaranA.tampil) +
              ' = <strong>' +
              formatNumber(k.konversi.nilaiA) +
              ' ' +
              esc(k.konversi.satuan) +
              '</strong>, sehingga perbandingannya menjadi ' +
              formatNumber(k.konversi.nilaiA) +
              ' : ' +
              formatNumber(k.konversi.nilaiB) +
              '</p>'
            : '<div class="konversi-row">' +
              '<span>' +
              esc(k.besaranA.tampil) +
              ' = </span>' +
              '<label class="sr-only" for="sat-kv-' +
              i +
              '">Hasil konversi dalam ' +
              esc(k.konversi.satuan) +
              '</label>' +
              '<input type="text" inputmode="numeric" class="input-text" id="sat-kv-' +
              i +
              '" data-sat="konversi" data-idx="' +
              i +
              '" value="' +
              esc(ex.konversi) +
              '" placeholder="?" />' +
              '<span>' +
              esc(k.konversi.satuan) +
              '</span>' +
              '<button type="button" class="btn btn--primary btn--small" data-sat-kv="' +
              i +
              '">Periksa</button>' +
              '</div>') +
          '</div>' +
          '</div>';
      }

      /* Langkah 3 — penyederhanaan */
      var blok3 = '';
      if (langkah2) {
        blok3 =
          '<div class="langkah' +
          (ex.done ? ' langkah--done' : '') +
          '">' +
          '<span class="langkah__num">3</span>' +
          '<div class="langkah__body">' +
          '<p class="langkah__label">' +
          esc(D.langkahLabel[2]) +
          '</p>' +
          (ex.done
            ? '<div class="olah-hasil__row">' +
              buildRasioBadge(k.konversi.nilaiA, k.konversi.nilaiB, 'muted') +
              '<span class="olah-hasil__arrow">÷ ' +
              formatNumber(gcd(k.konversi.nilaiA, k.konversi.nilaiB)) +
              ' →</span>' +
              buildRasioBadge(k.sederhana.a, k.sederhana.b, 'hero') +
              '</div>' +
              '<p class="olah-hasil__makna">' +
              esc(k.makna) +
              '</p>'
            : '<div class="olah-pair">' +
              '<label class="sr-only" for="sat-a-' +
              i +
              '">Bilangan pertama</label>' +
              '<input type="text" inputmode="numeric" class="input-text" id="sat-a-' +
              i +
              '" data-sat="sederhanaA" data-idx="' +
              i +
              '" value="' +
              esc(ex.sederhanaA) +
              '" placeholder="?" />' +
              '<span class="olah-pair__sep">:</span>' +
              '<label class="sr-only" for="sat-b-' +
              i +
              '">Bilangan kedua</label>' +
              '<input type="text" inputmode="numeric" class="input-text" id="sat-b-' +
              i +
              '" data-sat="sederhanaB" data-idx="' +
              i +
              '" value="' +
              esc(ex.sederhanaB) +
              '" placeholder="?" />' +
              '</div>' +
              (ex.salah
                ? buildFeedbackBox(
                    'error',
                    '✗',
                    '<strong>Belum tepat.</strong> Bagi kedua bilangan dengan FPB-nya.'
                  )
                : '') +
              buildHintBox(k.hints, ex.hintLevel) +
              '<div class="btn-group btn-group--spread" style="margin-top:var(--space-3);">' +
              buildHintButton('sat-hint-' + i, k.hints, ex.hintLevel) +
              '<button type="button" class="btn btn--primary" data-sat-check="' +
              i +
              '">Periksa</button>' +
              '</div>') +
          '</div>' +
          '</div>';
      }

      return (
        '<div class="panel olah-kasus' +
        (ex.done ? ' olah-kasus--done' : '') +
        '">' +
        '<div class="olah-kasus__head">' +
        '<h4 class="olah-kasus__title">' +
        esc(k.judul) +
        '</h4>' +
        '<span class="olah-kasus__konteks">' +
        esc(k.minta) +
        '</span>' +
        '</div>' +
        '<p class="olah-kasus__teks">' +
        k.teks +
        '</p>' +
        blok1 +
        blok2 +
        blok3 +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Samakan Satuan">' +
    buildHead(D.kicker, D.goal) +
    '<div class="panel panel--info">' +
    '<p style="margin:0;">' +
    esc(D.instruksi) +
    '</p>' +
    '</div>' +
    buildProgressDots(
      D.kasus.length,
      Math.min(
        State.satuanExercises.filter(function (e) {
          return e.done;
        }).length,
        D.kasus.length - 1
      ),
      State.satuanExercises.map(function (e) {
        return e.done ? 'correct' : e.salah ? 'incorrect' : null;
      })
    ) +
    kasusHTML +
    (satuanSemuaSelesai()
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="satuanNextBtn">' +
        esc(D.nextLabel) +
        '</button>' +
        '</div>'
      : '') +
    '</section>';

  container.querySelectorAll('[data-sat]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      State.satuanExercises[inp.dataset.idx][inp.dataset.sat] = inp.value;
      saveState();
    });
  });

  D.kasus.forEach(function (k, i) {
    var ex = State.satuanExercises[i];

    /* Langkah 1 — pilihan satuan acuan */
    var wrap = container.querySelectorAll('.olah-kasus')[i];
    if (wrap && !ex.satuanBenar) {
      wrap.querySelectorAll('[data-opt-id]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          ex.satuan = btn.dataset.optId;
          ex.satuanBenar = ex.satuan === k.correctSatuan;
          saveState();
          renderSatuan(container);
        });
      });
    }

    /* Langkah 3 — petunjuk berjenjang */
    var hintBtn = document.getElementById('sat-hint-' + i);
    if (hintBtn) {
      hintBtn.addEventListener('click', function () {
        ex.hintLevel = Math.min(ex.hintLevel + 1, k.hints.length);
        saveState();
        renderSatuan(container);
      });
    }
  });

  /* Langkah 2 — periksa hasil konversi */
  container.querySelectorAll('[data-sat-kv]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = parseInt(btn.dataset.satKv, 10);
      var k = D.kasus[i];
      var ex = State.satuanExercises[i];
      var parsed = parseInputInt(ex.konversi, true);
      if (parsed.error) {
        showNotice('Tulis hasil konversinya sebagai bilangan bulat lebih dulu.');
        return;
      }
      if (parsed.value !== k.konversi.nilaiA) {
        showNotice('Belum tepat. Ingat, ' + k.konversi.faktorTeks + '.');
        return;
      }
      ex.konversiBenar = true;
      saveState();
      renderSatuan(container);
    });
  });

  /* Langkah 3 — periksa bentuk sederhana */
  container.querySelectorAll('[data-sat-check]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = parseInt(btn.dataset.satCheck, 10);
      var k = D.kasus[i];
      var ex = State.satuanExercises[i];
      var pa = parseInputInt(ex.sederhanaA);
      var pb = parseInputInt(ex.sederhanaB);
      if (pa.error || pb.error) {
        showNotice('Isi kedua kolom dengan bilangan bulat lebih dulu.');
        return;
      }
      ex.attempts += 1;
      ex.done = pa.value === k.sederhana.a && pb.value === k.sederhana.b;
      ex.salah = !ex.done;
      saveState();
      renderSatuan(container);
    });
  });

  var nextBtn = document.getElementById('satuanNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('satuan');
      navigateTo('verifikasi');
    });
  }
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   Murid menguji prediksinya sendiri, lalu menelaah non-contoh.
   ============================================================ */

function verifSemuaTerbukti() {
  return State.verifDone.every(function (d) {
    return d === true;
  });
}

function verifSoalSemuaDijawab() {
  return State.verifExercises.every(function (e) {
    return e.chosen !== null && e.chosen !== undefined;
  });
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var terbukti = verifSemuaTerbukti();
  var prediksi = State.stimulasiPilihan;

  var ujiHTML = D.uji
    .map(function (u, i) {
      var inp = State.verifInputs[i];
      var done = State.verifDone[i];
      return (
        '<div class="uji-card' +
        (done ? ' uji-card--done' : '') +
        '">' +
        '<h4 class="uji-card__title">' +
        esc(u.nama) +
        '</h4>' +
        '<p class="uji-card__awal">' +
        u.a +
        ' : ' +
        u.b +
        '</p>' +
        (done
          ? '<p class="uji-card__hasil">' +
            buildRasioBadge(u.sederhanaA, u.sederhanaB, 'hero') +
            '</p>'
          : '<div class="olah-pair">' +
            '<label class="sr-only" for="ver-a-' +
            i +
            '">Bilangan pertama</label>' +
            '<input type="text" inputmode="numeric" class="input-text" id="ver-a-' +
            i +
            '" data-ver="a" data-idx="' +
            i +
            '" value="' +
            esc(inp.a) +
            '" placeholder="?" />' +
            '<span class="olah-pair__sep">:</span>' +
            '<label class="sr-only" for="ver-b-' +
            i +
            '">Bilangan kedua</label>' +
            '<input type="text" inputmode="numeric" class="input-text" id="ver-b-' +
            i +
            '" data-ver="b" data-idx="' +
            i +
            '" value="' +
            esc(inp.b) +
            '" placeholder="?" />' +
            '</div>') +
        '</div>'
      );
    })
    .join('');

  var kesimpulanHTML = '';
  if (terbukti) {
    var cocok = prediksi === 'sama';
    kesimpulanHTML =
      buildFeedbackBox('success', '🎯', D.kesimpulan) +
      '<div style="margin-top:var(--space-3);">' +
      buildFeedbackBox(
        cocok ? 'success' : 'info',
        cocok ? '👏' : '🔄',
        esc(cocok ? D.kesimpulanBenar : D.kesimpulanKeliru)
      ) +
      '</div>';
  }

  var soalHTML = '';
  if (terbukti) {
    soalHTML =
      '<div class="panel">' +
      '<p class="exercise-label">' +
      esc(D.instruksiSoal) +
      '</p>' +
      D.soal
        .map(function (s, i) {
          var ex = State.verifExercises[i];
          var answered = ex.chosen !== null && ex.chosen !== undefined;
          return (
            '<div class="cocok-item" data-verif="' +
            i +
            '">' +
            '<p class="cocok-item__q">' +
            s.pernyataan +
            '</p>' +
            buildChoiceButtons(s.options, ex.optionOrder, ex.chosen, s.correct, true, true) +
            (answered
              ? buildFeedbackBox(
                  ex.correct ? 'success' : 'error',
                  ex.correct ? '✓' : '✗',
                  (ex.correct ? '<strong>Tepat.</strong> ' : '<strong>Belum tepat.</strong> ') +
                    s.explanation
                )
              : '') +
            '</div>'
          );
        })
        .join('') +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D.kicker, D.goal) +
    '<div class="panel panel--warning">' +
    '<p style="margin:0;font-size:0.88rem;">' +
    esc(D.prediksiLabel) +
    ': <strong>' +
    esc(prediksi ? D.prediksiTeks[prediksi] : 'belum diisi') +
    '</strong>' +
    (State.stimulasiAlasan ? '<br><em>"' + esc(State.stimulasiAlasan) + '"</em>' : '') +
    '</p>' +
    '</div>' +
    '<div class="panel">' +
    '<p class="exercise-label">' +
    esc(D.instruksi) +
    '</p>' +
    '<div class="uji-grid">' +
    ujiHTML +
    '</div>' +
    (terbukti
      ? ''
      : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
        '<button type="button" class="btn btn--primary" id="verifCheckBtn">Buktikan</button>' +
        '</div>') +
    (kesimpulanHTML ? '<div style="margin-top:var(--space-4);">' + kesimpulanHTML + '</div>' : '') +
    '</div>' +
    soalHTML +
    (terbukti && verifSoalSemuaDijawab()
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="verifNextBtn">' +
        esc(D.nextLabel) +
        '</button>' +
        '</div>'
      : '') +
    '</section>';

  container.querySelectorAll('[data-ver]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      State.verifInputs[inp.dataset.idx][inp.dataset.ver] = inp.value;
      saveState();
    });
  });

  var checkBtn = document.getElementById('verifCheckBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      var adaKosong = false;
      D.uji.forEach(function (u, i) {
        var inp = State.verifInputs[i];
        var pa = parseInputInt(inp.a);
        var pb = parseInputInt(inp.b);
        if (pa.error || pb.error) {
          adaKosong = true;
          return;
        }
        State.verifDone[i] = pa.value === u.sederhanaA && pb.value === u.sederhanaB;
      });
      saveState();
      if (adaKosong) showNotice('Isi kedua kolom pada setiap gelas lebih dulu.');
      else if (!verifSemuaTerbukti())
        showNotice(
          'Belum tepat. Bagi kedua bilangan dengan FPB-nya, seperti pada tahap sebelumnya.'
        );
      renderVerifikasi(container);
    });
  }

  container.querySelectorAll('[data-verif]').forEach(function (wrap) {
    var i = parseInt(wrap.dataset.verif, 10);
    wrap.querySelectorAll('[data-opt-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var ex = State.verifExercises[i];
        if (ex.chosen !== null && ex.chosen !== undefined) return;
        ex.chosen = btn.dataset.optId;
        ex.correct = ex.chosen === D.soal[i].correct;
        saveState();
        renderVerifikasi(container);
      });
    });
  });

  var nextBtn = document.getElementById('verifNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('verifikasi');
      navigateTo('generalisasi');
    });
  }
}

/* ============================================================
   11. STAGE: MENARIK KESIMPULAN  (Discovery Learning — sintaks 6)
   Murid menyusun kalimat kesimpulan dari bank potongan kalimat
   yang urutannya diacak dan memuat pengecoh.
   ============================================================ */

function simpulanSemuaBenar() {
  return DATA.generalisasi.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function renderGeneralisasi(container) {
  var D = DATA.generalisasi;
  var bank = orderOptions(
    D.bank.map(function (b) {
      return { id: b.id, label: b.teks };
    }),
    State.bankOrder
  );
  var benarSemua = simpulanSemuaBenar();
  var sudahDiperiksa = State.simpulanChecked;

  var kalimatHTML = D.kalimat
    .map(function (g, i) {
      var dipilih = State.simpulanPilihan[g.id] || '';
      var status = '';
      if (sudahDiperiksa && dipilih) {
        status = dipilih === g.correct ? ' simpulan-item--correct' : ' simpulan-item--incorrect';
      }
      return (
        '<div class="simpulan-item' +
        status +
        '">' +
        '<span class="simpulan-item__num">' +
        (i + 1) +
        '</span>' +
        '<div class="simpulan-item__body">' +
        '<label for="simp-' +
        g.id +
        '" class="simpulan-item__awal">' +
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
              esc(b.label) +
              '</option>'
            );
          })
          .join('') +
        '</select>' +
        (sudahDiperiksa && dipilih && dipilih !== g.correct
          ? '<p class="simpulan-item__note">Belum tepat — baca ulang kalimatnya, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  var rangkumanHTML = '';
  if (benarSemua) {
    rangkumanHTML =
      '<div class="panel panel--hero">' +
      '<h3 style="margin-top:0;">Rangkuman Konsep Rasio</h3>' +
      '<ol class="objectives-list">' +
      D.rangkuman
        .map(function (r, i) {
          return '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + r + '</li>';
        })
        .join('') +
      '</ol>' +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="Menarik Kesimpulan">' +
    buildHead(D.kicker, D.goal) +
    '<div class="panel panel--info">' +
    '<p style="margin:0;">' +
    esc(D.instruksi) +
    '</p>' +
    '</div>' +
    '<div class="panel">' +
    kalimatHTML +
    (benarSemua
      ? buildFeedbackBox(
          'success',
          '✓',
          '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah konsep yang baru saja kamu temukan sendiri.'
        )
      : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
        '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
        '</div>') +
    '</div>' +
    rangkumanHTML +
    (benarSemua
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" id="simpulanNextBtn">' +
        esc(D.nextLabel) +
        '</button>' +
        '</div>'
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
        showNotice('Lengkapi ketiga kalimat lebih dulu.');
        return;
      }
      var terpakai = {};
      var adaGanda = false;
      D.kalimat.forEach(function (g) {
        var v = State.simpulanPilihan[g.id];
        if (terpakai[v]) adaGanda = true;
        terpakai[v] = true;
      });
      State.simpulanChecked = true;
      saveState();
      if (adaGanda) showNotice('Setiap potongan kalimat hanya dipakai satu kali.');
      else if (!simpulanSemuaBenar())
        showNotice('Masih ada yang belum tepat. Periksa tanda merahnya.');
      renderGeneralisasi(container);
    });
  }

  var nextBtn = document.getElementById('simpulanNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('generalisasi');
      navigateTo('terapkan');
    });
  }
}

/* ============================================================
   12. STAGE: UJI TERAP
   Memakai createExerciseStage dari shared/engine.js: campuran soal
   'input' dan 'choice'. Urutan opsi diambil dari ex.optionOrder
   yang sudah diacak di initExerciseArrays().
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
  nextStageId: 'refleksi',
  completeStageId: 'terapkan',
  nextButtonLabel: DATA.terapkan.nextLabel,
  defaultType: 'input',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'ex-exercise',
  inputRowClass: 'ex-input-row',
  inputAriaLabel: 'Jawabanmu',
  inputPlaceholder: 'Tulis jawabanmu',
  revealButtonStyle: 'separate',
  checkValue: function (s) {
    return s.jawab;
  },
  revealText: function (s) {
    return s.reveal;
  },
  renderPrompt: function (s) {
    return (
      '<div class="terap-prompt">' +
      '<p class="terap-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
      '<p class="terap-prompt__tanya">' +
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

  var benarTerap = State.terapkanExercises.filter(function (e) {
    return e.correct;
  }).length;
  var benarVerif = State.verifExercises.filter(function (e) {
    return e.correct;
  }).length;
  var benarCocok = State.cocokExercises.filter(function (e) {
    return e.correct;
  }).length;

  var pertanyaanHTML = D.pertanyaan
    .map(function (q, i) {
      var saved = State.refleksiAnswers[q.id] || '';
      return (
        '<div class="panel panel--compact refleksi-item">' +
        '<span class="refleksi-item__num">Pertanyaan ' +
        (i + 1) +
        ' dari ' +
        D.pertanyaan.length +
        '</span>' +
        '<label for="ref-' +
        q.id +
        '" style="font-size:0.95rem;font-weight:600;display:block;margin-bottom:var(--space-3);">' +
        esc(q.teks) +
        '</label>' +
        '<textarea id="ref-' +
        q.id +
        '" class="input-textarea" placeholder="' +
        esc(q.placeholder) +
        '" data-rid="' +
        q.id +
        '">' +
        esc(saved) +
        '</textarea>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    buildHead(D.kicker, D.goal) +
    '<div class="panel">' +
    '<div class="summary-grid">' +
    '<div class="summary-card"><div class="summary-card__val">' +
    benarCocok +
    '/' +
    DATA.koleksi.cocok.length +
    '</div><div class="summary-card__label">Penulisan rasio benar</div></div>' +
    '<div class="summary-card"><div class="summary-card__val">' +
    benarVerif +
    '/' +
    DATA.verifikasi.soal.length +
    '</div><div class="summary-card__label">Uji konsep benar</div></div>' +
    '<div class="summary-card"><div class="summary-card__val">' +
    benarTerap +
    '/' +
    DATA.terapkan.soal.length +
    '</div><div class="summary-card__label">Uji terap benar</div></div>' +
    '</div>' +
    '</div>' +
    '<div class="refleksi-list">' +
    pertanyaanHTML +
    '</div>' +
    '<div class="panel">' +
    '<p class="exercise-label">' +
    esc(D.diriLabel) +
    '</p>' +
    buildChoiceButtons(
      D.diriOpsi,
      State.refleksiDiriOrder,
      State.refleksiDiri,
      null,
      false,
      false
    ) +
    '</div>' +
    '<div class="btn-group btn-group--spread">' +
    '<span style="font-size:0.82rem;color:var(--color-ink-muted);align-self:center;">' +
    'Jawaban tersimpan di perangkatmu saja, tidak dikirim ke mana pun.' +
    '</span>' +
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
    State.refleksiSaved = true;
    saveState();
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
    '<span class="done-card__icon">🔍</span>' +
    '<h2>' +
    esc(D.judul) +
    '</h2>' +
    '<p style="font-size:1.05rem;color:var(--color-ink-muted);max-width:520px;margin:0 auto var(--space-5);">' +
    esc(D.teks) +
    '</p>' +
    '<div class="panel panel--hero" style="text-align:left;max-width:640px;margin:0 auto var(--space-5);">' +
    '<h3 style="margin-top:0;">Yang sudah kamu capai</h3>' +
    '<ol class="objectives-list">' +
    D.capaian
      .map(function (c, i) {
        return '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + esc(c) + '</li>';
      })
      .join('') +
    '</ol>' +
    '</div>' +
    '<div class="feedback-box feedback-box--info" style="text-align:left;max-width:560px;margin:0 auto var(--space-5);">' +
    '<span class="feedback-box__icon">📌</span>' +
    '<div class="feedback-box__body">' +
    '<strong>Catatan untuk Guru:</strong><br>' +
    'Rekap pada tahap Refleksi adalah indikator latihan digital, bukan nilai akhir. ' +
    'Kualitas penjelasan lisan murid saat menyampaikan kesimpulan temuannya tetap menjadi bahan penilaian utama.' +
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
  olahData: renderOlahData,
  satuan: renderSatuan,
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
  initExerciseArrays();
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
  }
}

document.addEventListener('DOMContentLoaded', init);
