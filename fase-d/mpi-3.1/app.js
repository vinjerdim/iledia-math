'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Membaca & Menulis Bilangan Desimal
   Fase D — SMP Kelas 7

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox, hampirSama,
   createStageMachine, createExerciseStage, createStore,
   ensureExerciseArray, optionIds, komponen Discovery Learning
   (ensureShuffledOrder, orderByIds, buildDiscoveryHead,
   buildTeacherNote, buildChoiceGroup, buildDlPanel,
   buildDlNextButton, makeDlStep, buildDlStep, bindDlStep,
   ensureSortStates, buildSortItems, bindSortItems,
   sortItemsAllAnswered, sortItemsCorrectCount, findOptionLabel),
   serta komponen bilangan desimal bagian 19 (DESIMAL_TEMPAT,
   desimalDigits, namaTempatHtml, bacaDesimalKoma, bacaDesimalNilaiTempat,
   bentukPanjangDesimal, makeDecimalParts, desimalDariBagian,
   bagianDariDesimal, parseInputDesimalKoma, buildPlaceValueTable,
   buildDecimalBlockModel, buildDecimalBlockLegend,
   buildDecimalBuilder, bindDecimalBuilder).

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
    7. Stage: Pengumpulan Data     (DL sintaks 3)
    8. Stage: Olah Nilai Tempat    (DL sintaks 4)
    9. Stage: Olah Membaca/Menulis (DL sintaks 4)
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
  'olahNilai',
  'olahBaca',
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
  'Nilai Tempat',
  'Baca & Tulis',
  'Bukti',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-3-1-desimal-v1';

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
  rakitParts: null,
  rakitIdx: 0,
  rakitStates: [],
  amatiOrder: null,
  amatiPilihan: null,

  /* Tahap 4 — olah nilai tempat */
  nilaiStates: {},
  nilaiOrder: null,
  langkahSteps: [],
  polaOrder: null,
  polaPilihan: null,

  /* Tahap 5 — olah membaca & menulis */
  aturanOrder: null,
  aturanPilihan: null,
  tulisSteps: [],
  bacaOrders: {},
  bacaPilih: {},

  /* Tahap 6 — pembuktian */
  verifSteps: [],
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

/* State perakit valid: empat tempat, masing-masing bilangan 0–9. */
function partsValid(p) {
  return (
    isPlainObject(p) &&
    DESIMAL_TEMPAT.every(function (t) {
      return typeof p[t.key] === 'number' && p[t.key] >= 0 && p[t.key] <= 9;
    })
  );
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
  if (!partsValid(State.rakitParts)) State.rakitParts = makeDecimalParts();
  ensureExerciseArray(State, 'rakitStates', DATA.koleksi.percobaan, function () {
    return { done: false, attempts: 0, salah: null, hintLevel: 0 };
  });
  if (State.rakitIdx < 0 || State.rakitIdx > DATA.koleksi.percobaan.length) State.rakitIdx = 0;
  ensureShuffledOrder(State, 'amatiOrder', DATA.koleksi.amatiOpsi);

  /* Tahap 4 */
  ensureSortStates(
    State,
    'nilaiStates',
    'nilaiOrder',
    DATA.olahNilai.item,
    DATA.olahNilai.opsiTempat
  );
  ensureExerciseArray(State, 'langkahSteps', DATA.olahNilai.langkah, makeDlStep);
  ensureShuffledOrder(State, 'polaOrder', DATA.olahNilai.polaOpsi);

  /* Tahap 5 */
  ensureShuffledOrder(State, 'aturanOrder', DATA.olahBaca.aturanOpsi);
  ensureExerciseArray(State, 'tulisSteps', DATA.olahBaca.tulis, makeDlStep);
  if (!isPlainObject(State.bacaOrders)) State.bacaOrders = {};
  if (!isPlainObject(State.bacaPilih)) State.bacaPilih = {};
  DATA.olahBaca.baca.forEach(function (b) {
    ensureShuffledOrder(State.bacaOrders, b.id, b.options);
  });

  /* Tahap 6 */
  ensureExerciseArray(State, 'verifSteps', [DATA.verifikasi.uji], makeDlStep);
  ensureExerciseArray(State, 'verifExercises', DATA.verifikasi.soal, function (q) {
    return { chosen: null, correct: false, optionOrder: shuffleArray(optionIds(q.options)) };
  });

  /* Tahap 7 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);
  if (!isPlainObject(State.simpulanPilihan)) State.simpulanPilihan = {};

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
  if (!isPlainObject(State.refleksiAnswers)) State.refleksiAnswers = {};
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

/* Kotak umpan balik pilihan (benar → success, salah → warning). */
function buildChoiceFeedback(chosen, benar, umpan) {
  if (!chosen) return '';
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(benar ? 'success' : 'warning', benar ? '✓' : '💭', umpan[chosen]) +
    '</div>'
  );
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

/*
 * Bilangan desimal dengan satu angka disorot (.dec-mark).
 *   pos  0 = satuan, 1–3 = tempat ke-n di belakang koma
 */
function markDigit(angka, pos) {
  var p = desimalDigits(angka);
  var bulat = esc(p.bulat);
  var pecahan = p.pecahan;
  if (pos === 0) {
    bulat =
      esc(p.bulat.slice(0, -1)) + '<mark class="dec-mark">' + esc(p.bulat.slice(-1)) + '</mark>';
  } else {
    pecahan =
      esc(pecahan.slice(0, pos - 1)) +
      '<mark class="dec-mark">' +
      esc(pecahan.charAt(pos - 1)) +
      '</mark>' +
      esc(pecahan.slice(pos));
  }
  return '<span class="dec-angka">' + bulat + ',' + pecahan + '</span>';
}

/* Layar timbangan digital (stimulasi & pembuktian). */
function buildScale(tampil) {
  var S = DATA.stimulasi;
  return (
    '<div class="scale" role="img" aria-label="' +
    esc(S.layarLabel + ': ' + (tampil ? S.nilai + ' ' + S.satuan : 'belum diketahui')) +
    '">' +
    '<div class="scale__screen">' +
    '<span class="scale__val">' +
    (tampil ? esc(S.nilai) : '?') +
    '</span>' +
    '<span class="scale__unit">' +
    esc(S.satuan) +
    '</span>' +
    '</div>' +
    '<div class="scale__plate" aria-hidden="true">🥩</div>' +
    '<span class="scale__caption">' +
    esc(S.layarLabel) +
    '</span>' +
    '</div>'
  );
}

function allDone(steps) {
  return steps.every(function (s) {
    return s.done;
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
      '<h2 style="margin-top:0;">🛒 ' +
        esc(D.judul) +
        '</h2>' +
        '<div class="stimulasi-grid">' +
        '<p class="stimulasi-cerita">' +
        esc(D.cerita) +
        '</p>' +
        '<div class="stimulasi-visual">' +
        buildScale(false) +
        '<div class="note-card">' +
        '<span class="note-card__title">📒 Catatan Ibu</span>' +
        '<p>Daging sapi — <em>' +
        esc(D.catatanIbu) +
        '</em></p>' +
        '</div>' +
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
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.teaserJudul) +
        '</h3>' +
        '<div class="teaser-grid">' +
        D.teaser
          .map(function (t) {
            return (
              '<div class="teaser-card">' +
              '<span class="teaser-card__icon" aria-hidden="true">' +
              t.ikon +
              '</span>' +
              '<span class="teaser-card__num">' +
              esc(t.angka) +
              '</span>' +
              '<p>' +
              esc(t.teks) +
              '</p>' +
              '</div>'
            );
          })
          .join('') +
        '</div>' +
        '<p class="dl-caption" style="margin-bottom:0;">' +
        esc(D.teaserTanya) +
        '</p>'
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
      navigateTo('koleksi');
    });
  }
}

/* ============================================================
   7. STAGE: PENGUMPULAN DATA  (Discovery Learning — sintaks 3)
   Bagian A: merakit empat bilangan dari kartu tugas dengan perakit
   desimal; setiap rakitan benar tercatat di tabel data.
   Bagian B: pertanyaan pengamatan tentang angka 0 (opsi acak).
   ============================================================ */

function rakitSelesai() {
  return allDone(State.rakitStates);
}

/* Daftar nama tempat yang belum sesuai dengan target. */
function rakitSelisih(parts, target) {
  var t = bagianDariDesimal(target);
  return DESIMAL_TEMPAT.filter(function (tp) {
    return parts[tp.key] !== t[tp.key];
  }).map(function (tp) {
    return tp.nama;
  });
}

function buildDataTable() {
  var rows = DATA.koleksi.percobaan
    .map(function (p, i) {
      var st = State.rakitStates[i];
      var b = bagianDariDesimal(p.nilai);
      var cell = function (v, cls) {
        return '<td class="data-cell ' + cls + '">' + (st.done ? v : '…') + '</td>';
      };
      return (
        '<tr' +
        (st.done ? '' : ' class="data-row--todo"') +
        '>' +
        '<th scope="row">' +
        p.ikon +
        ' ' +
        esc(p.konteks) +
        '</th>' +
        cell(b.s, 'data-cell--p0') +
        cell(b.d1, 'data-cell--p1') +
        cell(b.d2, 'data-cell--p2') +
        cell(b.d3, 'data-cell--p3') +
        '<td class="data-cell data-cell--num">' +
        (st.done ? esc(p.nilai) + ' ' + esc(p.satuan) : '…') +
        '</td>' +
        '</tr>'
      );
    })
    .join('');
  return (
    '<div class="table-scroll">' +
    '<table class="data-table rakit-table">' +
    '<thead><tr><th scope="col">Konteks</th>' +
    DESIMAL_TEMPAT.map(function (t, i) {
      return '<th scope="col" class="data-cell--p' + i + '">' + namaTempatHtml(t.nama) + '</th>';
    }).join('') +
    '<th scope="col">Tulisan desimal</th></tr></thead>' +
    '<tbody>' +
    rows +
    '</tbody></table></div>'
  );
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var selesai = rakitSelesai();
  var idx = Math.min(State.rakitIdx, D.percobaan.length - 1);
  var tugas = D.percobaan[idx];
  var st = State.rakitStates[idx];
  var amatiBenar = State.amatiPilihan === D.amatiCorrect;

  var kartuHTML = '';
  if (!selesai) {
    kartuHTML =
      '<div class="task-card">' +
      '<span class="task-card__step">Kartu tugas ' +
      (idx + 1) +
      ' dari ' +
      D.percobaan.length +
      '</span>' +
      '<p class="task-card__title"><span aria-hidden="true">' +
      tugas.ikon +
      '</span> ' +
      esc(tugas.konteks) +
      '</p>' +
      '<p class="task-card__text">' +
      esc(tugas.teks) +
      '</p>' +
      '</div>';
  }

  var aksiHTML = '';
  if (!selesai) {
    aksiHTML =
      '<div class="btn-group" style="margin-top:var(--space-3);">' +
      '<button type="button" class="btn btn--primary" id="rakitCheckBtn">Periksa Rakitan</button>' +
      buildHintToggle('rakitHintBtn', tugas.hints, st.hintLevel) +
      '</div>' +
      (st.salah && st.salah.length
        ? '<div style="margin-top:var(--space-3);">' +
          buildFeedbackBox(
            'error',
            '✗',
            'Rakitanmu belum sesuai. Periksa lagi banyak blok pada tempat: <strong>' +
              esc(st.salah.join(', ')) +
              '</strong>.'
          ) +
          '</div>'
        : '') +
      buildHintStack(tugas.hints, st.hintLevel);
  }

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(selesai ? D.instruksiBebas : D.instruksiA) +
        '</p>' +
        (selesai ? '' : '<p class="dl-caption">' + esc(D.instruksiBebas) + '</p>') +
        buildDecimalBlockLegend() +
        kartuHTML +
        buildDecimalBuilder('rakit', State.rakitParts) +
        aksiHTML
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">📋 Tabel Data</h3>' +
        buildDataTable() +
        (selesai ? buildFeedbackBox('success', '✓', esc(D.selesaiA)) : '')
    ) +
    (selesai
      ? buildDlPanel(
          '<p class="exercise-label">' +
            esc(D.instruksiB) +
            '</p>' +
            '<p class="dl-step__label">' +
            esc(D.amatiLabel) +
            '</p>' +
            buildChoiceGroup(D.amatiOpsi, State.amatiOrder, {
              chosen: State.amatiPilihan,
              correctId: amatiBenar ? D.amatiCorrect : null,
              grade: true,
              locked: amatiBenar,
              group: 'amati',
            }) +
            buildChoiceFeedback(State.amatiPilihan, amatiBenar, D.amatiUmpan),
          'panel--warning'
        )
      : '') +
    (selesai && amatiBenar ? buildDlNextButton('koleksiNextBtn', D.nextLabel, true) : '') +
    '</section>';

  bindDecimalBuilder(container, 'rakit', State.rakitParts, {}, function () {
    saveState();
  });

  var checkBtn = document.getElementById('rakitCheckBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      var selisih = rakitSelisih(State.rakitParts, tugas.nilai);
      st.attempts += 1;
      if (selisih.length === 0) {
        st.done = true;
        st.salah = null;
        State.rakitIdx = idx + 1;
        State.rakitParts = makeDecimalParts();
        showNotice('Tepat! ' + tugas.nilai + ' ' + tugas.satuan + ' tercatat di tabel data.');
      } else {
        st.salah = selisih;
      }
      saveState();
      renderKoleksi(container);
    });
  }

  var hintBtn = document.getElementById('rakitHintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      st.hintLevel = Math.min(st.hintLevel + 1, tugas.hints.length);
      saveState();
      renderKoleksi(container);
    });
  }

  bindRetryChoice(container, 'amati', 'amatiPilihan', D.amatiCorrect, function () {
    renderKoleksi(container);
  });

  bindNext('koleksiNextBtn', 'koleksi', 'olahNilai');
}

/* ============================================================
   8. STAGE: OLAH NILAI TEMPAT  (Discovery Learning — sintaks 4)
   A. Memilah nilai tempat angka yang disorot (butir & opsi acak).
   B. Langkah isian: hubungan antartempat & nilai angka.
   C. Memilih pola yang ditemukan (opsi acak).
   ============================================================ */

/* Ilustrasi "diperbesar": 1 satuan = 10 persepuluhan, dst. */
function buildZoomRows() {
  function row(big, small, n, cls, teks) {
    var pieces = '';
    for (var i = 0; i < n; i++)
      pieces += '<span class="zoom__piece zoom__piece--' + cls + '"></span>';
    return (
      '<div class="zoom__row">' +
      '<span class="zoom__big zoom__big--' +
      big +
      '"></span>' +
      '<span class="zoom__eq" aria-hidden="true">=</span>' +
      '<span class="zoom__split zoom__split--' +
      cls +
      '">' +
      pieces +
      '</span>' +
      '<span class="zoom__text">' +
      teks +
      '</span>' +
      '</div>'
    );
  }
  return (
    '<div class="zoom" role="img" aria-label="Satu satuan terbagi menjadi 10 persepuluhan; satu persepuluhan terbagi menjadi 10 perseratusan; satu perseratusan (diperbesar) terbagi menjadi 10 perseribuan.">' +
    row('p0', 'p1', 10, 'p1', '1 satuan = 10 persepuluhan') +
    row('p1', 'p2', 10, 'p2', '1 persepuluhan = 10 perseratusan') +
    row('p2', 'p3', 10, 'p3', '1 perseratusan <em>(diperbesar)</em> = 10 perseribuan') +
    '</div>'
  );
}

function renderOlahNilai(container) {
  var D = DATA.olahNilai;
  var items = D.item.map(function (it) {
    return {
      id: it.id,
      teks: markDigit(it.angka, it.pos),
      correct: it.correct,
      explanation: it.explanation,
    };
  });
  var bukaB = sortItemsAllAnswered(items, State.nilaiStates);
  var langkahSelesai = allDone(State.langkahSteps);
  var polaBenar = State.polaPilihan === D.polaCorrect;

  var langkahHTML = '';
  if (bukaB) {
    for (var i = 0; i < D.langkah.length; i++) {
      var stp = State.langkahSteps[i];
      langkahHTML += buildDlStep(
        'nl' + i,
        stp,
        {
          label: esc(D.langkah[i].label),
          jawab: D.langkah[i].jawab,
          hints: D.langkah[i].hints,
          temuan: esc(D.langkah[i].temuan),
          desimal: D.langkah[i].desimal,
        },
        i + 1
      );
      if (!stp.done) break;
    }
  }

  container.innerHTML =
    '<section aria-label="Pengolahan Data Nilai Tempat">' +
    buildHead(D) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiA) +
        '</p>' +
        buildSortItems(items, State.nilaiOrder, D.opsiTempat, State.nilaiStates, { mono: true })
    ) +
    (bukaB
      ? buildDlPanel(
          '<p class="exercise-label">' + esc(D.instruksiB) + '</p>' + buildZoomRows() + langkahHTML
        )
      : '') +
    (langkahSelesai && bukaB
      ? buildDlPanel(
          '<p class="exercise-label">' +
            esc(D.polaLabel) +
            '</p>' +
            buildChoiceGroup(D.polaOpsi, State.polaOrder, {
              chosen: State.polaPilihan,
              correctId: polaBenar ? D.polaCorrect : null,
              grade: true,
              locked: polaBenar,
              group: 'pola',
            }) +
            buildChoiceFeedback(State.polaPilihan, polaBenar, D.polaUmpan) +
            (polaBenar ? buildPlaceValueTable('0,375', { showNilai: true }) : ''),
          'panel--warning'
        )
      : '') +
    (langkahSelesai && bukaB && polaBenar
      ? buildDlNextButton('nilaiNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  function ulang() {
    renderOlahNilai(container);
  }

  bindSortItems(container, D.item, State.nilaiStates, saveState, ulang);

  D.langkah.forEach(function (l, i) {
    bindDlStep(
      'nl' + i,
      State.langkahSteps[i],
      { jawab: l.jawab, hints: l.hints, desimal: l.desimal },
      saveState,
      ulang
    );
  });

  bindRetryChoice(container, 'pola', 'polaPilihan', D.polaCorrect, ulang);
  bindNext('nilaiNextBtn', 'olahNilai', 'olahBaca');
}

/* ============================================================
   9. STAGE: OLAH MEMBACA & MENULIS  (Discovery Learning — sintaks 4)
   A. Mengamati dua cara baca data, lalu menemukan aturannya.
   B. Menulis bilangan dari kata-kata (isian berkoma, bertahap).
   C. Memilih cara baca yang tepat (opsi acak, sekali jawab).
   ============================================================ */

function bacaSemuaDijawab() {
  return DATA.olahBaca.baca.every(function (b) {
    return !!State.bacaPilih[b.id];
  });
}

function renderOlahBaca(container) {
  var D = DATA.olahBaca;
  var aturanBenar = State.aturanPilihan === D.aturanCorrect;
  var tulisSelesai = aturanBenar && allDone(State.tulisSteps);
  var selesai = tulisSelesai && bacaSemuaDijawab();

  var contohHTML =
    '<div class="table-scroll"><table class="data-table baca-table">' +
    '<thead><tr><th scope="col">Bilangan</th><th scope="col">Cara baca koma</th><th scope="col">Cara baca nilai tempat</th></tr></thead><tbody>' +
    D.contoh
      .map(function (c) {
        return (
          '<tr><td class="baca-table__num">' +
          esc(c) +
          '</td><td>' +
          esc(bacaDesimalKoma(c)) +
          '</td><td>' +
          esc(bacaDesimalNilaiTempat(c)) +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table></div>';

  var tulisHTML = '';
  if (aturanBenar) {
    for (var i = 0; i < D.tulis.length; i++) {
      var t = D.tulis[i];
      var stp = State.tulisSteps[i];
      tulisHTML +=
        '<div class="hitung-item">' +
        buildDlStep(
          'tl' + i,
          stp,
          {
            label: '“' + esc(t.kata) + '” ditulis …',
            jawab: t.jawab,
            hints: t.hints,
            desimal: true,
          },
          i + 1
        ) +
        (stp.done ? buildPlaceValueTable(t.nilai) : '') +
        '</div>';
      if (!stp.done) break;
    }
  }

  var bacaHTML = '';
  if (tulisSelesai) {
    bacaHTML = D.baca
      .map(function (b) {
        var chosen = State.bacaPilih[b.id] || null;
        var benar = chosen === b.correct;
        return (
          '<div class="sort-item">' +
          '<p class="sort-item__text"><span class="dec-angka">' +
          esc(b.angka) +
          '</span> <span class="cara-chip">' +
          esc(b.cara) +
          '</span></p>' +
          buildChoiceGroup(b.options, State.bacaOrders[b.id], {
            chosen: chosen,
            correctId: b.correct,
            grade: true,
            locked: true,
            group: b.id,
            attr: 'data-baca-opt',
          }) +
          (chosen ? buildOnceFeedback(benar, b.explanation) : '') +
          '</div>'
        );
      })
      .join('');
  }

  container.innerHTML =
    '<section aria-label="Pengolahan Data Membaca dan Menulis">' +
    buildHead(D) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiA) +
        '</p>' +
        contohHTML +
        '<p class="dl-step__label" style="margin-top:var(--space-4);">' +
        esc(D.aturanLabel) +
        '</p>' +
        buildChoiceGroup(D.aturanOpsi, State.aturanOrder, {
          chosen: State.aturanPilihan,
          correctId: aturanBenar ? D.aturanCorrect : null,
          grade: true,
          locked: aturanBenar,
          group: 'aturan',
        }) +
        buildChoiceFeedback(State.aturanPilihan, aturanBenar, D.aturanUmpan)
    ) +
    (aturanBenar
      ? buildDlPanel('<p class="exercise-label">' + esc(D.instruksiB) + '</p>' + tulisHTML)
      : '') +
    (tulisSelesai
      ? buildDlPanel('<p class="exercise-label">' + esc(D.instruksiC) + '</p>' + bacaHTML)
      : '') +
    (selesai ? buildDlNextButton('bacaNextBtn', D.nextLabel, true) : '') +
    '</section>';

  function ulang() {
    renderOlahBaca(container);
  }

  bindRetryChoice(container, 'aturan', 'aturanPilihan', D.aturanCorrect, ulang);

  D.tulis.forEach(function (t, i) {
    bindDlStep(
      'tl' + i,
      State.tulisSteps[i],
      { jawab: t.jawab, hints: t.hints, desimal: true },
      saveState,
      ulang
    );
  });

  container.querySelectorAll('[data-baca-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.group;
      if (State.bacaPilih[id]) return;
      State.bacaPilih[id] = btn.dataset.bacaOpt;
      saveState();
      ulang();
    });
  });

  bindNext('bacaNextBtn', 'olahBaca', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A. Menguji dugaan tahap 1 (isian berkoma + model blok).
   B. Menanggapi empat miskonsepsi (opsi acak, sekali jawab).
   ============================================================ */

function verifSoalSemuaDijawab() {
  return State.verifExercises.every(function (e) {
    return !!e.chosen;
  });
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var S = DATA.stimulasi;
  var step = State.verifSteps[0];
  var terbukti = step.done;
  var prediksiLabel = State.stimulasiPilihan
    ? findOptionLabel(S.opsi, State.stimulasiPilihan)
    : 'belum diisi';

  var buktiHTML = '';
  if (terbukti) {
    var cocok = State.stimulasiPilihan === S.benar;
    buktiHTML =
      buildDecimalBlockModel(bagianDariDesimal(S.nilai), { compact: true }) +
      buildPlaceValueTable(S.nilai, { highlight: 2 }) +
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
              q.pernyataan +
              '</p>' +
              buildChoiceGroup(q.options, ex.optionOrder, {
                chosen: ex.chosen,
                correctId: q.correct,
                grade: true,
                locked: true,
                group: q.id,
                attr: 'data-verif-opt',
              }) +
              (ex.chosen ? buildOnceFeedback(ex.correct, q.explanation) : '') +
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
        esc(prediksiLabel) +
        '</strong>' +
        (State.stimulasiAlasan ? '<br><em>"' + esc(State.stimulasiAlasan) + '"</em>' : '') +
        '</p>',
      'panel--warning'
    ) +
    buildDlPanel(
      '<div class="verif-grid">' +
        buildScale(terbukti) +
        '<div class="verif-grid__main">' +
        buildDlStep(
          'vf0',
          step,
          {
            label: esc(D.uji.label),
            jawab: D.uji.jawab,
            hints: D.uji.hints,
            temuan: esc(D.uji.temuan),
            desimal: true,
          },
          null
        ) +
        '</div>' +
        '</div>' +
        buktiHTML
    ) +
    soalHTML +
    (terbukti && verifSoalSemuaDijawab()
      ? buildDlNextButton('verifNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindDlStep(
    'vf0',
    step,
    { jawab: D.uji.jawab, hints: D.uji.hints, desimal: true },
    saveState,
    function () {
      renderVerifikasi(container);
    }
  );

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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah aturan yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Membaca & Menulis Bilangan Desimal</h3>' +
            buildPlaceValueTable('3,075', { showNilai: true }) +
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
   (desimal berkoma, parseInputDesimalKoma + hampirSama) dan
   'choice'; urutan opsi dari ex.optionOrder yang diacak di
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
    return (
      buildHead(DATA.terapkan) +
      buildDlPanel('<p style="margin:0;">' + esc(DATA.terapkan.instruksi) + '</p>', 'panel--info')
    );
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
  inputPlaceholder: 'mis. 3,07',
  inputMode: 'decimal',
  revealButtonStyle: 'separate',
  parseInput: parseInputDesimalKoma,
  isCorrect: function (v, s) {
    return hampirSama(v, s.jawab);
  },
  inputSuffix: function (s) {
    return s.suffix ? '<span class="dl-caption">' + esc(s.suffix) + '</span>' : '';
  },
  checkValue: function (s) {
    return s.jawab;
  },
  revealText: function (s) {
    return s.reveal;
  },
  renderPrompt: function (s) {
    return (
      '<div class="dl-prompt">' +
      '<span class="konteks-chip">' +
      esc(s.konteks) +
      '</span>' +
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
  var rakitSekali = State.rakitStates.filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  var nilaiBenar = sortItemsCorrectCount(DATA.olahNilai.item, State.nilaiStates);
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
        kartu(rakitSekali + '/' + DATA.koleksi.percobaan.length, 'Rakitan tepat sekali periksa') +
        kartu(nilaiBenar + '/' + DATA.olahNilai.item.length, 'Nilai tempat dipilah benar') +
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
    '<div class="aturan-trio">' +
    DESIMAL_TEMPAT.slice(1)
      .map(function (t, i) {
        return (
          '<div class="aturan-card aturan-card--p' +
          (i + 1) +
          '"><span class="aturan-card__label">' +
          esc(t.nama) +
          '</span>' +
          esc(t.pecahan) +
          ' = ' +
          esc(t.nilai) +
          '</div>'
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
    'Kemampuan murid menjelaskan arti setiap angka berdasarkan nilai tempatnya dan peran angka 0 dengan kata-kata sendiri tetap menjadi bahan penilaian utama.' +
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
  olahNilai: renderOlahNilai,
  olahBaca: renderOlahBaca,
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
