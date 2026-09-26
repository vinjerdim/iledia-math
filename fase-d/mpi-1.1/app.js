'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Membaca & Menulis Bilangan Bulat dalam Kehidupan
   Sehari-hari — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen Discovery Learning: buildDiscoveryHead,
       buildTeacherNote, buildChoiceGroup, buildSortItems,
       buildGuidedQuizList, buildDlPanel, buildDlNextButton;
     • seksi 29 (bilangan bulat dalam konteks): buildSkalaKonteks,
       opsiCaraBaca, tulisBulat, bacaBulat, diagnosaTulisBulat,
       cekCaraBaca, makeCekStep/buildCekStep/bindCekStep.

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan, pertanyaan masalah,
   cara baca tiap situasi, pertanyaan pengamatan, pemilahan, pasangan
   baca-tulis, pernyataan, bank kesimpulan, opsi uji terap, penilaian
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
    5. Stage: Stimulasi            (DL sintaks 1)
    6. Stage: Identifikasi Masalah (DL sintaks 2)
    7. Stage: Pengumpulan Data     (DL sintaks 3)
    8. Stage: Kata Kunci           (DL sintaks 4a)
    9. Stage: Baca & Tulis         (DL sintaks 4b)
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

var STAGES = DATA.tahap.map(function (t) {
  return t.id;
});
var STAGE_LABELS = DATA.tahap.map(function (t) {
  return t.label;
});
var STORAGE_KEY = 'mpi-d-1-1-bilbulat-konteks-v3';

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'stimulasi',
  completedStages: {},

  /* Tahap 1 — stimulasi */
  dugaanOrders: {},
  dugaanPilih: {},
  stimulasiAlasan: '',

  /* Tahap 2 — identifikasi masalah */
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',

  /* Tahap 3 — pengumpulan data */
  koleksiSteps: [],
  bacaOrders: {},
  bacaPilih: {},
  amatiOrders: {},
  amatiPilih: {},

  /* Tahap 4a — kata kunci */
  pilahStates: {},
  pilahOrder: null,
  polaOrders: {},
  polaPilih: {},

  /* Tahap 4b — baca & tulis */
  pasangOrders: {},
  pasangPilih: {},
  notasiSteps: [],
  bacaanSteps: [],

  /* Tahap 5 — pembuktian */
  verifStates: {},
  verifOrder: null,

  /* Tahap 6 — menarik kesimpulan */
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
function ensureListOrders(key, list, opsiOf) {
  var map = ensureMap(key);
  list.forEach(function (q) {
    ensureShuffledOrder(map, q.id, opsiOf ? opsiOf(q) : q.opsi);
  });
}

/*
 * Soal uji terap yang sedang dipakai. Array ini DIISI ULANG di tempat
 * (bukan diganti) karena createExerciseStage menyimpan referensinya.
 */
var TERAP_SOAL = [];

function jenisSoal(s) {
  return s.type === 'choice' ? 'choice' : s.mode;
}

/* Memilih soal acak dari bank sesuai komposisi, lalu mengacak urutannya. */
function pilihSoalTerap() {
  var T = DATA.terapkan;
  var ids = [];
  Object.keys(T.komposisi).forEach(function (k) {
    var kelompok = T.soal.filter(function (s) {
      return jenisSoal(s) === k;
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
  /* Tahap 1–2 */
  ensureListOrders('dugaanOrders', DATA.stimulasi.dugaan);
  ensureMap('dugaanPilih');
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 — cara baca tiap situasi dibuat engine lalu diacak */
  ensureExerciseArray(State, 'koleksiSteps', DATA.koleksi.situasi, makeCekStep);
  ensureListOrders('bacaOrders', DATA.koleksi.situasi, function (s) {
    return opsiCaraBaca(s.jawab);
  });
  ensureMap('bacaPilih');
  ensureListOrders('amatiOrders', DATA.koleksi.amati);
  ensureMap('amatiPilih');

  /* Tahap 4a */
  ensureSortStates(
    State,
    'pilahStates',
    'pilahOrder',
    DATA.olahPilah.pilah,
    DATA.olahPilah.opsiPilah
  );
  ensureListOrders('polaOrders', DATA.olahPilah.pola);
  ensureMap('polaPilih');

  /* Tahap 4b */
  ensureListOrders('pasangOrders', DATA.olahBaca.pasang);
  ensureMap('pasangPilih');
  ensureExerciseArray(State, 'notasiSteps', DATA.olahBaca.tulisNotasi, makeCekStep);
  ensureExerciseArray(State, 'bacaanSteps', DATA.olahBaca.tulisBacaan, makeCekStep);

  /* Tahap 5 */
  ensureSortStates(
    State,
    'verifStates',
    'verifOrder',
    DATA.verifikasi.pernyataan,
    DATA.verifikasi.opsiPernyataan
  );

  /* Tahap 6 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);
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

/* Satuan untuk ditampilkan di samping bilangan ('' untuk rupiah/lantai). */
function satuanTampil(satuan) {
  return satuan && satuan !== 'rupiah' ? satuan : '';
}

/* Notasi + satuan, mis. "−150 m" atau "−20.000 (rupiah)". */
function tulisDenganSatuan(n, satuan) {
  if (satuan === 'rupiah') return tulisBulat(n) + ' (rupiah)';
  return tulisBulat(n) + (satuan ? ' ' + satuan : '');
}

function buildTemuanList(items) {
  return (
    '<ul class="temuan-list">' +
    items
      .map(function (t) {
        return '<li>' + t + '</li>';
      })
      .join('') +
    '</ul>'
  );
}

/* Langkah isian notasi/cara baca untuk data berbentuk { id, label, jawab, hints }. */
function cekStepDari(item, jenis, extra) {
  var step = {
    jenis: jenis,
    jawab: item.jawab,
    label: item.label,
    hints: item.hints,
  };
  if (extra) Object.assign(step, extra);
  return step;
}

function semuaCekSelesai(steps) {
  return steps.every(function (s) {
    return s.done;
  });
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah.
   ============================================================ */

function dugaanLengkap() {
  return DATA.stimulasi.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var lengkap = dugaanLengkap();

  var kabarHTML = D.kabar
    .map(function (k) {
      return (
        '<article class="kabar-card">' +
        '<header class="kabar-card__head"><span class="kabar-card__ikon" aria-hidden="true">' +
        k.ikon +
        '</span><span class="kabar-card__sumber">' +
        esc(k.sumber) +
        '</span></header>' +
        '<p class="kabar-card__sorot">' +
        esc(k.sorot) +
        '</p>' +
        '<p class="kabar-card__teks">' +
        esc(k.teks) +
        '</p>' +
        '</article>'
      );
    })
    .join('');

  var dugaanHTML = D.dugaan
    .map(function (q, i) {
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
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">📰 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="kabar-grid">' +
        kabarHTML +
        '</div>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaanmu?</h3>' +
        dugaanHTML +
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
      renderStimulasi(container);
    });
  });

  var ta = document.getElementById('stimulasiAlasan');
  ta.addEventListener('input', function () {
    State.stimulasiAlasan = ta.value;
    saveState();
  });

  document.getElementById('stimulasiNextBtn').addEventListener('click', function () {
    if (!dugaanLengkap()) {
      showNotice('Pilih dugaanmu untuk setiap pertanyaan sebelum melanjutkan.');
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
        buildGuidedChoiceFeedback(State.masalahPilihan, benar, D.umpan)
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
   7. STAGE: PENGUMPULAN DATA — JELAJAH KOTA  (DL sintaks 3)
   Situasi dibuka satu per satu: tulis bilangannya (diagnosa
   miskonsepsi), lalu pilih cara bacanya (opsi dari engine, diacak).
   ============================================================ */

function situasiStep(sit) {
  return {
    jenis: 'tulis',
    jawab: sit.jawab,
    label: sit.label,
    hints: sit.hints,
    satuan: sit.satuan === 'rupiah' ? 'rupiah' : sit.satuan,
  };
}

function bacaBenar(sit) {
  return State.bacaPilih[sit.id] === 'baku';
}

function situasiSelesai(sit, i) {
  return State.koleksiSteps[i].done && bacaBenar(sit);
}

function koleksiSemuaSelesai() {
  return DATA.koleksi.situasi.every(function (sit, i) {
    return situasiSelesai(sit, i);
  });
}

function buildTabelData() {
  return (
    '<div class="table-scroll">' +
    '<table class="data-table">' +
    '<thead><tr><th scope="col">Tempat & keadaan</th><th scope="col">Titik acuan (0)</th>' +
    '<th scope="col">Tulisan</th><th scope="col">Dibaca</th></tr></thead>' +
    '<tbody>' +
    DATA.koleksi.situasi
      .map(function (s) {
        var K = KONTEKS_BULAT[s.tema];
        var cls = s.jawab < 0 ? 'is-neg' : s.jawab > 0 ? 'is-pos' : 'is-nol';
        return (
          '<tr class="' +
          cls +
          '"><td><span aria-hidden="true">' +
          K.ikon +
          '</span> ' +
          esc(s.frasa) +
          '</td><td>' +
          esc(K.acuan) +
          '</td><td class="data-table__num">' +
          esc(tulisDenganSatuan(s.jawab, s.satuan)) +
          '</td><td>"' +
          esc(bacaBulat(s.jawab)) +
          '"</td></tr>'
        );
      })
      .join('') +
    '</tbody></table>' +
    '</div>'
  );
}

function buildSituasiCard(sit, i) {
  var st = State.koleksiSteps[i];
  var K = KONTEKS_BULAT[sit.tema];
  var bacaChosen = State.bacaPilih[sit.id] || null;
  var opsi = opsiCaraBaca(sit.jawab);
  var benarBaca = bacaBenar(sit);
  var umpan = {};
  opsi.forEach(function (o) {
    umpan[o.id] = o.umpan;
  });

  return (
    '<div class="situasi-card' +
    (situasiSelesai(sit, i) ? ' is-done' : '') +
    '">' +
    '<div class="situasi-card__visual">' +
    '<p class="situasi-card__tempat"><span aria-hidden="true">📍</span> ' +
    esc(sit.tempat) +
    '</p>' +
    buildSkalaKonteks({
      tema: sit.tema,
      nilai: sit.jawab,
      min: sit.skala.min,
      max: sit.skala.max,
      langkah: sit.skala.langkah,
      satuan: sit.satuan,
      tampilNilai: st.done,
    }) +
    '</div>' +
    '<div class="situasi-card__body">' +
    buildCekStep('ks' + i, st, situasiStep(sit), i + 1) +
    (st.done
      ? '<div class="quiz-item quiz-item--guided">' +
        '<p class="exercise-label">' +
        esc(DATA.koleksi.tanyaBaca) +
        ' <span class="num-chip">' +
        esc(tulisBulat(sit.jawab)) +
        '</span></p>' +
        buildChoiceGroup(opsi, State.bacaOrders[sit.id], {
          chosen: bacaChosen,
          correctId: benarBaca ? 'baku' : null,
          grade: true,
          locked: benarBaca,
          group: sit.id,
          attr: 'data-baca-opt',
        }) +
        buildGuidedChoiceFeedback(bacaChosen, benarBaca, umpan) +
        '</div>'
      : '') +
    (situasiSelesai(sit, i) ? buildFeedbackBox('success', K.ikon, esc(sit.temuan)) : '') +
    '</div>' +
    '</div>'
  );
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var semua = koleksiSemuaSelesai();
  var amatiSelesai = guidedQuizAllCorrect(D.amati, State.amatiPilih);
  var rerender = function () {
    renderKoleksi(container);
  };

  var kartu = '';
  var tampil = 0;
  for (var i = 0; i < D.situasi.length; i++) {
    kartu += buildSituasiCard(D.situasi[i], i);
    tampil = i + 1;
    if (!situasiSelesai(D.situasi[i], i)) break;
  }

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    '<p class="dl-caption situasi-progress">Situasi ' +
    tampil +
    ' dari ' +
    D.situasi.length +
    '</p>' +
    '<div class="situasi-list">' +
    kartu +
    '</div>' +
    (semua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📋 Tabel Data Jelajah Kota</h3>' +
            buildTabelData() +
            '<h3>🔍 Amati tabelmu</h3>' +
            buildGuidedQuizList(D.amati, State.amatiOrders, State.amatiPilih)
        )
      : '') +
    (semua && amatiSelesai ? buildDlNextButton('koleksiNextBtn', D.nextLabel) : '') +
    '</section>';

  D.situasi.forEach(function (sit, i) {
    bindCekStep('ks' + i, State.koleksiSteps[i], situasiStep(sit), saveState, rerender);
  });

  container.querySelectorAll('[data-baca-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.group;
      if (State.bacaPilih[id] === 'baku') return;
      State.bacaPilih[id] = btn.dataset.bacaOpt;
      saveState();
      rerender();
    });
  });

  bindGuidedQuizList(container, D.amati, State.amatiPilih, saveState, rerender);
  bindNext('koleksiNextBtn', 'koleksi', 'olahPilah');
}

/* ============================================================
   8. STAGE: KATA KUNCI  (Discovery Learning — sintaks 4a)
   Bagian A: pilah frasa (sekali jawab, langsung dibahas).
   Bagian B: temukan pola kata kunci (boleh coba lagi).
   ============================================================ */

function renderOlahPilah(container) {
  var D = DATA.olahPilah;
  var pilahSelesai = sortItemsAllAnswered(D.pilah, State.pilahStates);
  var polaSelesai = guidedQuizAllCorrect(D.pola, State.polaPilih);
  var rerender = function () {
    renderOlahPilah(container);
  };

  container.innerHTML =
    '<section aria-label="Pengolahan Data: Kata Kunci">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p class="dl-caption">' +
        esc(D.instruksiA) +
        '</p>' +
        buildSortItems(D.pilah, State.pilahOrder, D.opsiPilah, State.pilahStates)
    ) +
    (pilahSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            buildGuidedQuizList(D.pola, State.polaOrders, State.polaPilih)
        )
      : '') +
    (pilahSelesai && polaSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">💡 Temuanmu</h3>' + buildTemuanList(D.temuan),
          'panel--hero'
        ) + buildDlNextButton('pilahNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, D.pilah, State.pilahStates, saveState, rerender);
  bindGuidedQuizList(container, D.pola, State.polaPilih, saveState, rerender);
  bindNext('pilahNextBtn', 'olahPilah', 'olahBaca');
}

/* ============================================================
   9. STAGE: BACA & TULIS  (Discovery Learning — sintaks 4b)
   A: pasangkan notasi ↔ cara baca; B: dikte → notasi (diagnosa
   penulisan); C: notasi → ketik cara baca (cekCaraBaca).
   ============================================================ */

function renderOlahBaca(container) {
  var D = DATA.olahBaca;
  var pasangSelesai = guidedQuizAllCorrect(D.pasang, State.pasangPilih);
  var notasiSelesai = semuaCekSelesai(State.notasiSteps);
  var bacaanSelesai = semuaCekSelesai(State.bacaanSteps);
  var rerender = function () {
    renderOlahBaca(container);
  };

  var notasiHTML = D.tulisNotasi
    .map(function (it, i) {
      return buildCekStep('tn' + i, State.notasiSteps[i], cekStepDari(it, 'tulis'), i + 1);
    })
    .join('');
  var bacaanHTML = D.tulisBacaan
    .map(function (it, i) {
      return buildCekStep('tb' + i, State.bacaanSteps[i], cekStepDari(it, 'baca'), i + 1);
    })
    .join('');

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
        buildGuidedQuizList(D.pasang, State.pasangOrders, State.pasangPilih)
    ) +
    (pasangSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(D.instruksiB) +
            '</p>' +
            notasiHTML
        )
      : '') +
    (pasangSelesai && notasiSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulC) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(D.instruksiC) +
            '</p>' +
            bacaanHTML
        )
      : '') +
    (pasangSelesai && notasiSelesai && bacaanSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">💡 Temuanmu</h3>' + buildTemuanList(D.temuan),
          'panel--hero'
        ) + buildDlNextButton('bacaNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindGuidedQuizList(container, D.pasang, State.pasangPilih, saveState, rerender);
  D.tulisNotasi.forEach(function (it, i) {
    bindCekStep('tn' + i, State.notasiSteps[i], cekStepDari(it, 'tulis'), saveState, rerender);
  });
  D.tulisBacaan.forEach(function (it, i) {
    bindCekStep('tb' + i, State.bacaanSteps[i], cekStepDari(it, 'baca'), saveState, rerender);
  });
  bindNext('bacaNextBtn', 'olahBaca', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   ============================================================ */

function buildDugaanBanding() {
  var S = DATA.stimulasi;
  return (
    '<div class="dugaan-compare">' +
    S.dugaan
      .map(function (q) {
        var pilih = State.dugaanPilih[q.id];
        var cocok = pilih === q.baku;
        return (
          '<div class="dugaan-row' +
          (cocok ? ' dugaan-row--ok' : '') +
          '">' +
          '<span class="dugaan-row__title">' +
          q.tanya +
          '</span>' +
          '<span>Dugaanmu: <strong>' +
          (findOptionLabel(q.opsi, pilih) || '—') +
          '</strong></span>' +
          '<span>Temuanmu: <strong>' +
          findOptionLabel(q.opsi, q.baku) +
          '</strong> — ' +
          esc(q.pembahasan) +
          '</span>' +
          '<span class="dugaan-row__verdict">' +
          (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh temuanmu') +
          '</span>' +
          '</div>'
        );
      })
      .join('') +
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
  var selesai = sortItemsAllAnswered(D.pernyataan, State.verifStates);
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
    (selesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' + esc(D.judulB) + '</h3>' + buildDugaanBanding()
        ) + buildDlNextButton('verifNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, D.pernyataan, State.verifStates, saveState, rerender);
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
          '<h3 style="margin-top:0;">Rangkuman: Bilangan Bulat di Sekitar Kita</h3>' +
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
   createExerciseStage (shared/engine.js) dengan soal TERAP_SOAL yang
   dipilih acak. Isian 'tulis' diperiksa diagnosaTulisBulat, isian
   'baca' diperiksa cekCaraBaca; pesan salahnya berupa diagnosa.
   ============================================================ */

function periksaIsianTerap(value, s) {
  return s.mode === 'baca' ? cekCaraBaca(value, s.jawab) : diagnosaTulisBulat(value, s.jawab);
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
  inputPlaceholder: 'Ketik jawabanmu',
  allowNegative: true,
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
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
    return s.reveal + ' ' + s.explanation;
  },
  renderPrompt: function (s) {
    var tag =
      s.type === 'choice'
        ? 'Pilihan ganda'
        : s.mode === 'baca'
        ? '🗣️ Ketik cara bacanya'
        : '✏️ Tulis bilangannya';
    return (
      '<div class="dl-prompt">' +
      '<span class="bbk-soal-tag">' +
      tag +
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
  var semuaCek = State.koleksiSteps.concat(State.notasiSteps, State.bacaanSteps);
  var sekali = semuaCek.filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  var pilahSemua = DATA.olahPilah.pilah.length + DATA.verifikasi.pernyataan.length;
  var pilahBenar =
    sortItemsCorrectCount(DATA.olahPilah.pilah, State.pilahStates) +
    sortItemsCorrectCount(DATA.verifikasi.pernyataan, State.verifStates);
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
        kartu(sekali + '/' + semuaCek.length, 'Isian tepat pada percobaan pertama') +
        kartu(pilahBenar + '/' + pilahSemua, 'Pemilahan & pernyataan benar') +
        kartu(benarTerap + '/' + TERAP_SOAL.length, 'Uji terap benar') +
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
    '<div class="contoh-grid">' +
    D.contoh
      .map(function (c) {
        var K = KONTEKS_BULAT[c.tema];
        return (
          '<div class="formula-card"><span class="formula-card__label"><span aria-hidden="true">' +
          K.ikon +
          '</span> ' +
          esc(K.nama) +
          '</span><strong class="contoh-grid__num">' +
          esc(c.teks) +
          '</strong><span>"' +
          esc(c.baca) +
          '"</span></div>'
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
    'Kemampuan murid membaca bilangan dengan lantang dan memberi contoh dari kehidupannya sendiri tetap menjadi bahan penilaian utama.' +
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
  olahPilah: renderOlahPilah,
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
