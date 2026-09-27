'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Bilangan Berpangkat Bulat Negatif & Nol
   Fase D — SMP Kelas VIII · Topik 12 Bilangan Berpangkat dan Bentuk Akar

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox,
   createStageMachine, createExerciseStage, createStore,
   ensureExerciseArray, optionIds, komponen Discovery Learning
   (ensureShuffledOrder, orderByIds, buildDiscoveryHead,
   buildTeacherNote, buildChoiceGroup, buildDlPanel,
   buildDlNextButton, ensureSortStates, buildSortItems,
   bindSortItems, sortItemsAllAnswered, sortItemsCorrectCount,
   findOptionLabel, buildGuidedQuizList, bindGuidedQuizList,
   guidedQuizAllCorrect), tangga pangkat seksi 27
   (buildPowerLadder, bindPowerLadder, powerLadderAllCorrect,
   powerLadderFilled), serta komponen bilangan berpangkat seksi 30
   (bacaPangkat, ekspresiPangkat, formatPangkat, formatBasis, fmtBulat,
   cekBacaPangkat, cekTulisPangkat, parseInputRational,
   buildPowerAnatomy, bindPowerAnatomy, makePangkatStep,
   buildPangkatStep, bindPangkatStep). Seluruh fungsi ini sudah
   generik untuk pangkat bulat berapa pun (positif, nol, negatif).

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
    7. Stage: Tangga Pangkat       (DL sintaks 3)
    8. Stage: Makna Pangkat Nol/Negatif (DL sintaks 3)
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
  'tangga',
  'makna',
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
  'Tangga',
  'Makna',
  'Olah',
  'Bukti',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-12-2-pangkat-negatif-v1';

/* Butir pemilahan cara baca: notasi + bacaan yang diajukan. */
var PILAH_ITEMS = DATA.olah.pilah.map(function (it) {
  return {
    id: it.id,
    correct: it.correct,
    explanation: it.explanation,
    teks:
      '<span class="pwr-pilah__notasi">' +
      esc(ekspresiPangkat(it.a, it.n, { negLuar: it.negLuar })) +
      '</span> dibaca “' +
      esc(it.bacaan) +
      '”',
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

  /* Tahap 3 — tangga pangkat */
  tanggaInputs: {},
  tanggaChecked: {},

  /* Tahap 4 — makna pangkat nol/negatif */
  maknaLangkah: {},
  maknaBaca: {},
  maknaAnatomiPilih: {},

  /* Tahap 5 — mengolah data */
  konsepOrders: {},
  konsepPilih: {},
  anatomiPilih: {},
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 6 — pembuktian */
  verifTulis: {},
  verifBaca: {},
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

/* State langkah tulis/baca per id langkah. */
function ensureStepStates(key, steps) {
  ensureObject(key);
  steps.forEach(function (s) {
    var st = State[key][s.id];
    if (!isPlainObject(st) || !isPlainObject(st.isian)) State[key][s.id] = makePangkatStep();
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
  ensureObject('tanggaInputs');
  ensureObject('tanggaChecked');
  DATA.tangga.tangga.forEach(function (t) {
    if (!isPlainObject(State.tanggaInputs[t.id])) State.tanggaInputs[t.id] = {};
  });

  /* Tahap 4 */
  ensureStepStates('maknaLangkah', DATA.makna.langkah);
  ensureStepStates('maknaBaca', DATA.makna.baca);
  ensureObject('maknaAnatomiPilih');

  /* Tahap 5 */
  ensureGuidedOrders('konsepOrders', 'konsepPilih', DATA.olah.konsep);
  ensureObject('anatomiPilih');
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.olah.opsiPilah);

  /* Tahap 6 */
  ensureStepStates('verifTulis', DATA.verifikasi.tulis);
  ensureStepStates('verifBaca', DATA.verifikasi.baca);
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

/* Umpan balik jawaban sekali-pilih (benar/salah + penjelasan). */
function buildOnceFeedback(benar, explanation) {
  return (
    '<div style="margin-top:var(--space-2);">' +
    buildFeedbackBox(
      benar ? 'success' : 'error',
      benar ? '✓' : '✗',
      (benar ? '<strong>Tepat.</strong> ' : '<strong>Belum tepat.</strong> ') + explanation
    ) +
    '</div>'
  );
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

function langkahSelesai(steps, states) {
  return steps.every(function (s) {
    return states[s.id] && states[s.id].done;
  });
}

function hitungSelesai(steps, states) {
  return steps.filter(function (s) {
    return states[s.id] && states[s.id].done;
  }).length;
}

/*
 * Langkah tulis/baca bertahap: langkah berikutnya baru muncul setelah
 * langkah sebelumnya selesai. `prefix` membedakan id DOM tiap kelompok.
 */
function buildLangkahBertahap(prefix, steps, states) {
  var html = '';
  for (var i = 0; i < steps.length; i++) {
    var s = steps[i];
    html += buildPangkatStep(prefix + s.id, states[s.id], s, i + 1);
    if (!states[s.id].done) break;
  }
  return html;
}

function bindLangkahBertahap(prefix, steps, states, rerender) {
  for (var i = 0; i < steps.length; i++) {
    var s = steps[i];
    bindPangkatStep(prefix + s.id, states[s.id], s, saveState, rerender);
    if (!states[s.id].done) break;
  }
}

/* Ketuk basis/pangkat (anatomi): dipakai di tahap Makna dan Olah. */
function buildAnatomiSection(idPrefix, items, umpanAnatomi, pilih) {
  return (
    '<div class="pwr-anatomi-grid">' +
    items
      .map(function (it) {
        var chosen = pilih[it.id] || null;
        var benar = chosen === it.target;
        var umpan = '';
        if (chosen) {
          umpan = benar
            ? buildFeedbackBox(
                'success',
                '✓',
                'Tepat! Basis <strong>' +
                  esc(formatBasis(it.a).replace(/^\((.*)\)$/, '$1')) +
                  '</strong>, pangkat <strong>' +
                  esc(fmtBulat(it.n)) +
                  '</strong>. Dibaca “' +
                  esc(bacaPangkat(it.a, it.n, { negLuar: it.negLuar })) +
                  '”.'
              )
            : buildFeedbackBox('warning', '💭', umpanAnatomi[chosen]);
        }
        return (
          '<div class="pwr-anatomi-item">' +
          '<p class="pwr-anatomi-item__tanya">Ketuk <strong>' +
          (it.target === 'basis' ? 'BASIS' : 'PANGKAT') +
          '</strong>-nya</p>' +
          buildPowerAnatomy(idPrefix + it.id, it.a, it.n, {
            negLuar: it.negLuar,
            pick: { chosen: chosen, correct: chosen ? it.target : null },
          }) +
          umpan +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

function bindAnatomiSection(container, idPrefix, items, pilih, rerender) {
  items.forEach(function (it) {
    bindPowerAnatomy(container, idPrefix + it.id, function (part) {
      if (pilih[it.id] === it.target) return;
      pilih[it.id] = part;
      saveState();
      rerender();
    });
  });
}

function anatomiAllCorrect(items, pilih) {
  return items.every(function (it) {
    return pilih[it.id] === it.target;
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
      '<h2 style="margin-top:0;">🪜 ' +
        esc(D.judul) +
        '</h2>' +
        '<p class="stimulasi-cerita">' +
        esc(D.cerita) +
        '</p>' +
        '<figure class="tangga-catatan">' +
        '<figcaption>📓 Catatan Kak Sari</figcaption>' +
        '<p class="tangga-catatan__isi">' +
        esc(D.catatanBima) +
        '</p>' +
        '<p class="tangga-catatan__keluh">' +
        esc(D.keluhan) +
        '</p>' +
        '</figure>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
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
      navigateTo('tangga');
    });
  }
}

/* ============================================================
   7. STAGE: TANGGA PANGKAT  (Discovery Learning — sintaks 3)
   Tangga pangkat interaktif 3 basis, diteruskan sampai pangkat
   negatif, untuk menemukan pola "setiap turun, dibagi basis".
   ============================================================ */

function tanggaItemSelesai(t) {
  return !!State.tanggaChecked[t.id] && powerLadderAllCorrect(t, State.tanggaInputs[t.id]);
}

function tanggaSemuaBenar() {
  return DATA.tangga.tangga.every(tanggaItemSelesai);
}

function renderTangga(container) {
  var D = DATA.tangga;
  var semuaBenar = tanggaSemuaBenar();

  function rerender() {
    renderTangga(container);
  }

  var tanggaHTML = D.tangga
    .map(function (t) {
      var benar = tanggaItemSelesai(t);
      return (
        '<div class="pwr-tangga">' +
        '<h3 class="pwr-tangga__judul">' +
        esc(t.judul) +
        '</h3>' +
        buildPowerLadder(t.id, t, State.tanggaInputs[t.id], {
          checked: !!State.tanggaChecked[t.id],
          locked: benar,
          faktor: true,
        }) +
        (benar
          ? ''
          : '<div class="btn-group btn-group--center">' +
            '<button type="button" class="btn btn--primary btn--small" data-cek-tangga="' +
            t.id +
            '">Periksa tangga</button>' +
            '</div>') +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Mengumpulkan Data: Tangga Pangkat">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">🪜 ' + esc(D.cerita) + '</p>', 'panel--hero') +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksi) +
        '</p>' +
        '<div class="pwr-tangga-grid">' +
        tanggaHTML +
        '</div>' +
        (semuaBenar ? buildFeedbackBox('success', '🔎', D.temuanTangga) : '')
    ) +
    (semuaBenar ? buildDlNextButton('tanggaNextBtn', D.nextLabel, true) : '') +
    '</section>';

  D.tangga.forEach(function (t) {
    bindPowerLadder(container, t.id, State.tanggaInputs[t.id], saveState, function () {
      var btn = container.querySelector('[data-cek-tangga="' + t.id + '"]');
      if (btn) btn.click();
    });
  });

  container.querySelectorAll('[data-cek-tangga]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var t = D.tangga.filter(function (x) {
        return x.id === btn.dataset.cekTangga;
      })[0];
      if (!powerLadderFilled(t, State.tanggaInputs[t.id])) {
        showNotice('Isi semua anak tangga yang kosong terlebih dahulu.');
        return;
      }
      State.tanggaChecked[t.id] = true;
      saveState();
      rerender();
      if (!powerLadderAllCorrect(t, State.tanggaInputs[t.id])) {
        showNotice(
          'Ada yang belum tepat (✗). Ingat: setiap turun satu anak tangga, bagi dengan ' + t.a + '.'
        );
      }
    });
  });

  bindNext('tanggaNextBtn', 'tangga', 'makna');
}

/* ============================================================
   8. STAGE: MAKNA PANGKAT NOL & NEGATIF  (DL — sintaks 3)
   A. Konteks pengenceran larutan & mundur-waktu bakteri.
   B. Menulis & membaca notasi pangkat nol/negatif.
   C. Ketuk basis/pangkat/tanda (anatomi).
   ============================================================ */

function buildKonteksTabel(rows) {
  return (
    '<ul class="pwr-konteks-tabel">' +
    rows
      .map(function (r) {
        return (
          '<li><span class="pwr-konteks-tabel__label">' +
          esc(r.label) +
          '</span><span class="pwr-konteks-tabel__notasi">' +
          esc(formatPangkat(r.a, r.n)) +
          '</span></li>'
        );
      })
      .join('') +
    '</ul>'
  );
}

function renderMakna(container) {
  var D = DATA.makna;
  var tulisSelesai = langkahSelesai(D.langkah, State.maknaLangkah);
  var bacaSelesai = langkahSelesai(D.baca, State.maknaBaca);
  var anatomiBenar = anatomiAllCorrect(D.anatomi, State.maknaAnatomiPilih);

  function rerender() {
    renderMakna(container);
  }

  container.innerHTML =
    '<section aria-label="Mengumpulkan Data: Makna Pangkat Nol dan Negatif">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🧪 Pengenceran larutan pembersih</h3>' +
        '<p style="margin:0 0 var(--space-3);">' +
        esc(D.ceritaLarutan) +
        '</p>' +
        buildKonteksTabel(D.tabelLarutan) +
        buildFeedbackBox('info', '💡', D.maknaLarutan),
      'panel--hero'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🦠 Populasi bakteri mundur waktu</h3>' +
        '<p style="margin:0 0 var(--space-3);">' +
        esc(D.ceritaBakteri) +
        '</p>' +
        buildKonteksTabel(D.tabelBakteri) +
        buildFeedbackBox('info', '💡', D.maknaBakteri)
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiTulis) +
        '</p>' +
        buildLangkahBertahap('mkt-', D.langkah, State.maknaLangkah)
    ) +
    (tulisSelesai
      ? buildDlPanel(
          '<p class="exercise-label">' +
            esc(D.instruksiBaca) +
            '</p>' +
            buildLangkahBertahap('mkb-', D.baca, State.maknaBaca)
        )
      : '') +
    (tulisSelesai && bacaSelesai
      ? buildDlPanel(
          '<p class="exercise-label">' +
            esc(D.instruksiAnatomi) +
            '</p>' +
            buildAnatomiSection('mka-', D.anatomi, D.umpanAnatomi, State.maknaAnatomiPilih)
        )
      : '') +
    (tulisSelesai && bacaSelesai && anatomiBenar
      ? buildDlNextButton('maknaNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindLangkahBertahap('mkt-', D.langkah, State.maknaLangkah, rerender);
  if (tulisSelesai) bindLangkahBertahap('mkb-', D.baca, State.maknaBaca, rerender);
  if (tulisSelesai && bacaSelesai) {
    bindAnatomiSection(container, 'mka-', D.anatomi, State.maknaAnatomiPilih, rerender);
  }
  bindNext('maknaNextBtn', 'makna', 'olah');
}

/* ============================================================
   9. STAGE: MENGOLAH DATA  (Discovery Learning — sintaks 4)
   A. Pertanyaan penuntun.
   B. Ketuk basis/pangkat (anatomi).
   C. Memilah cara baca: tepat / keliru.
   ============================================================ */

function renderOlah(container) {
  var D = DATA.olah;
  var konsepBenar = guidedQuizAllCorrect(D.konsep, State.konsepPilih);
  var anatomiBenar = anatomiAllCorrect(D.anatomi, State.anatomiPilih);
  var pilahSelesai = sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);

  function rerender() {
    renderOlah(container);
  }

  container.innerHTML =
    '<section aria-label="Mengolah Data">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(buildGuidedQuizList(D.konsep, State.konsepOrders, State.konsepPilih)) +
    (konsepBenar
      ? buildDlPanel(
          '<p class="exercise-label">' +
            esc(D.instruksiAnatomi) +
            '</p>' +
            buildAnatomiSection('an-', D.anatomi, D.umpanAnatomi, State.anatomiPilih)
        )
      : '') +
    (konsepBenar && anatomiBenar
      ? buildDlPanel(
          '<p class="exercise-label">' +
            esc(D.instruksiPilah) +
            '</p>' +
            buildSortItems(PILAH_ITEMS, State.pilahOrder, D.opsiPilah, State.pilahStates)
        )
      : '') +
    (konsepBenar && anatomiBenar && pilahSelesai
      ? buildDlNextButton('olahNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindGuidedQuizList(container, D.konsep, State.konsepPilih, saveState, rerender);
  if (konsepBenar) bindAnatomiSection(container, 'an-', D.anatomi, State.anatomiPilih, rerender);
  bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  bindNext('olahNextBtn', 'olah', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A. Membandingkan dugaan awal dengan temuan.
   B. Uji tulis & uji baca.
   C. Menanggapi miskonsepsi (opsi acak, sekali jawab).
   ============================================================ */

function verifSoalSemuaDijawab() {
  return State.verifExercises.every(function (e) {
    return !!e.chosen;
  });
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var S = DATA.stimulasi;
  var tulisSelesai = langkahSelesai(D.tulis, State.verifTulis);
  var bacaSelesai = langkahSelesai(D.baca, State.verifBaca);
  var dugaanTepat = State.stimulasiPilihan === 'pola';

  function rerender() {
    renderVerifikasi(container);
  }

  var soalHTML = '';
  if (tulisSelesai && bacaSelesai) {
    soalHTML = buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiSoal) +
        '</p>' +
        D.soal
          .map(function (q, i) {
            var ex = State.verifExercises[i];
            return (
              '<div class="sort-item">' +
              '<p class="sort-item__text">' +
              esc(q.pernyataan) +
              '</p>' +
              buildChoiceGroup(q.options, ex.optionOrder, {
                chosen: ex.chosen,
                correctId: q.correct,
                grade: true,
                locked: true,
                group: q.id,
                attr: 'data-verif-opt',
              }) +
              (ex.chosen ? buildOnceFeedback(ex.correct, esc(q.explanation)) : '') +
              '</div>'
            );
          })
          .join('')
    );
  }

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin:0;">' +
        esc(D.prediksiLabel) +
        ': <strong>' +
        esc(
          State.stimulasiPilihan ? findOptionLabel(S.opsi, State.stimulasiPilihan) : 'belum diisi'
        ) +
        '</strong>' +
        (State.stimulasiAlasan ? '<br><em>“' + esc(State.stimulasiAlasan) + '”</em>' : '') +
        '</p>' +
        (State.masalahHipotesis
          ? '<p style="margin:var(--space-2) 0 var(--space-3);">' +
            esc(D.hipotesisLabel) +
            ': <em>“' +
            esc(State.masalahHipotesis) +
            '”</em></p>'
          : '') +
        buildFeedbackBox(
          dugaanTepat ? 'success' : 'info',
          dugaanTepat ? '👏' : '🔄',
          esc(D.kesimpulanDugaan[State.stimulasiPilihan] || D.kesimpulanDugaan.pola)
        ),
      'panel--warning'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiTulis) +
        '</p>' +
        buildLangkahBertahap('vt-', D.tulis, State.verifTulis)
    ) +
    (tulisSelesai
      ? buildDlPanel(
          '<p class="exercise-label">' +
            esc(D.instruksiBaca) +
            '</p>' +
            buildLangkahBertahap('vb-', D.baca, State.verifBaca)
        )
      : '') +
    soalHTML +
    (tulisSelesai && bacaSelesai && verifSoalSemuaDijawab()
      ? buildDlNextButton('verifNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindLangkahBertahap('vt-', D.tulis, State.verifTulis, rerender);
  if (tulisSelesai) bindLangkahBertahap('vb-', D.baca, State.verifBaca, rerender);

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
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel(
      kalimatHTML +
        (benarSemua
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah aturan yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Bilangan Berpangkat Nol & Negatif</h3>' +
            '<div class="pwr-rangkum">' +
            [
              { a: 5, n: 0 },
              { a: 2, n: -3 },
              { a: -4, n: -2 },
              { a: 10, n: -2 },
            ]
              .map(function (c) {
                return (
                  '<figure class="pwr-rangkum__item">' +
                  buildPowerAnatomy('rk' + c.a + '_' + c.n, c.a, c.n, { label: true }) +
                  '<figcaption>“' +
                  esc(bacaPangkat(c.a, c.n)) +
                  '”</figcaption>' +
                  '</figure>'
                );
              })
              .join('') +
            '</div>' +
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
      renderGeneralisasi(container);
    });
  }

  bindNext('simpulanNextBtn', 'generalisasi', 'terapkan');
}

/* ============================================================
   12. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal campuran
   'input' (nilai pecahan/desimal atau pangkat bulat, diuraikan
   dengan parseInputRational) dan 'choice' (opsi diacak lewat
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
  parseInput: function (val) {
    return parseInputRational(val);
  },
  allowNegative: true,
  inputAriaLabel: 'Jawaban',
  inputPlaceholder: 'mis. −6 atau 1/16',
  invalidMessage: 'Masukkan sebuah bilangan bulat atau pecahan (contoh: −6, 0, 1/16).',
  revealText: function (s) {
    return (
      'Jawabannya <strong>' +
      esc(
        typeof s.jawab === 'number' && s.jawab % 1 !== 0
          ? formatPecahan(pecahanDariNilai(s.jawab))
          : fmtBulat(s.jawab)
      ) +
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

/* Pecahan sederhana dari nilai desimal 1/2ᵏ hasil parseInputRational, khusus tampilan reveal. */
function pecahanDariNilai(v) {
  var den = 1;
  while (den < 100000 && Math.abs(v * den - Math.round(v * den)) > 1e-9) den *= 2;
  return { num: Math.round(v * den), den: den };
}

function renderTerapkan(container) {
  TerapkanStage.render(container);
}

/* ============================================================
   13. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var tulisSemua = DATA.makna.langkah.concat(DATA.verifikasi.tulis);
  var bacaSemua = DATA.makna.baca.concat(DATA.verifikasi.baca);
  var stTulis = Object.assign({}, State.maknaLangkah, State.verifTulis);
  var stBaca = Object.assign({}, State.maknaBaca, State.verifBaca);
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
        kartu(
          hitungSelesai(tulisSemua, stTulis) + '/' + tulisSemua.length,
          'Bilangan berpangkat ditulis'
        ) +
        kartu(
          hitungSelesai(bacaSemua, stBaca) + '/' + bacaSemua.length,
          'Cara baca diketik benar'
        ) +
        kartu(pilahBenar + '/' + PILAH_ITEMS.length, 'Cara baca dipilah benar') +
        kartu(verifBenar + '/' + DATA.verifikasi.soal.length, 'Miskonsepsi ditanggapi benar') +
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
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">a⁰</span>Pangkat nol</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">a⁻ⁿ</span>Pangkat negatif</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">1/aⁿ</span>Kebalikan</div>' +
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
    'Kemampuan murid menjelaskan makna a⁰ dan a⁻ⁿ dengan kata-katanya sendiri, termasuk mengapa basisnya tidak boleh nol, tetap menjadi bahan penilaian utama.' +
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
  tangga: renderTangga,
  makna: renderMakna,
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
