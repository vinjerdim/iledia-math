'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Literasi Finansial — Diskon, Untung–Rugi & Anggaran
   Sederhana — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen bersama: buildDiscoveryHead, buildTeacherNote,
       buildTpPanel, buildChoiceGroup, buildSortItems, buildTapOrder,
       buildGuidedQuizList, buildDlPanel, buildDlNextButton,
       buildInfoPoster;
     • seksi 66 (literasi finansial): diskonBertingkat, hargaPromo,
       untungRugi, rincianAnggaran, periksaAnggaran, jawabFinansial,
       opsiFinansial, langkah isian berdiagnosa (makeFinStep /
       buildFinStep / bindFinStep / periksaFinStep), serta tampilan
       buildStrukBelanja, buildLabDiskon, buildTimbanganUntung,
       buildPapanAnggaran.

   Alur tahap mengikuti sintaks Problem Based Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan, rumusan masalah, peran,
   butir & kategori pemilahan, kartu rencana, pertanyaan temuan,
   keputusan, kategori detektif, bank simpulan, soal & opsi uji terap,
   penilaian diri) DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder() / ensureSortStates() / ensureTapOrderState().
   Pengacakan dilakukan SEKALI saat state disiapkan (initExerciseArrays)
   lalu urutannya disimpan di State — bukan saat render — sehingga
   pilihan tidak melompat saat dirender ulang, tetapi teracak ulang untuk
   setiap murid dan setiap Reset. Soal uji terap juga dipilih acak dari
   bank (pilihSoalTerap), dan opsi pilihan gandanya (opsiFinansial)
   diacak per soal.

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi Masalah        (PBL sintaks 1)
    6. Stage: Organisasi               (PBL sintaks 2)
    7. Stage: Lab Diskon               (PBL sintaks 3a)
    8. Stage: Untung–Rugi              (PBL sintaks 3b)
    9. Stage: Anggaran                 (PBL sintaks 3c)
   10. Stage: Karya                    (PBL sintaks 4)
   11. Stage: Evaluasi                 (PBL sintaks 5)
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
var STORAGE_KEY = 'mpi-d-2-7-literasi-finansial-v1';

function opsiAman(list) {
  return list.map(function (o) {
    return { id: o.id, label: esc(o.label) };
  });
}

/* Pertanyaan penuntun dari DATA: tanya, label opsi, dan umpan aman. */
function siapkanGuided(q) {
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
}

/* Butir pemilahan { id, teks, correct, explanation } dengan teks aman. */
function siapkanPilah(list) {
  return list.map(function (p) {
    return { id: p.id, teks: esc(p.teks), correct: p.correct, explanation: esc(p.explanation) };
  });
}

var DUGAAN_OPSI = {};
DATA.orientasi.dugaan.forEach(function (q) {
  DUGAAN_OPSI[q.id] = opsiAman(q.opsi);
});
var MASALAH_OPSI = opsiAman(DATA.orientasi.masalahOpsi);
var PERAN_OPSI = opsiAman(DATA.organisasi.peran);
var PILAH_ITEMS = siapkanPilah(DATA.organisasi.pilah);
var RENCANA_ITEMS = DATA.organisasi.rencana.map(function (r) {
  return { id: r.id, label: esc(r.label), aria: r.label };
});
var RENCANA_JAWAB = optionIds(DATA.organisasi.rencana);

var AMATI_DISKON = DATA.selidikDiskon.amati.map(siapkanGuided);
var AMATI_UNTUNG = DATA.selidikUntung.amati.map(siapkanGuided);
var AMATI_ANGGARAN = DATA.selidikAnggaran.amati.map(siapkanGuided);
var KATEGORI_ITEMS = siapkanPilah(DATA.selidikAnggaran.pilah);
var KEPUTUSAN = siapkanGuided(DATA.karya.keputusan);
var DETEKTIF_ITEMS = siapkanPilah(DATA.evaluasi.klaim);

/* Langkah isian dengan label aman (label DATA berupa teks biasa). */
function siapkanLangkah(list) {
  return list.map(function (s) {
    return Object.assign({}, s, {
      label: esc(s.label),
      hints: (s.hints || []).map(esc),
      temuan: s.temuan ? esc(s.temuan) : '',
    });
  });
}

var LANGKAH_DISKON = siapkanLangkah(DATA.selidikDiskon.langkah);
var LANGKAH_UNTUNG = siapkanLangkah(DATA.selidikUntung.langkah);
var LANGKAH_ANGGARAN = siapkanLangkah(DATA.selidikAnggaran.langkah);
var LANGKAH_KARYA = siapkanLangkah(DATA.karya.langkah);

/* Soal pilihan ganda uji terap: opsi dibangun engine (opsiFinansial). */
var OPSI_TERAP = {};
DATA.terapkan.soal.forEach(function (s) {
  if (s.type !== 'choice') return;
  var opsi = opsiFinansial(s);
  OPSI_TERAP[s.id] = opsi;
  s.options = opsi.map(function (o) {
    return { id: o.id, label: esc(o.label) };
  });
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
  masalahOrder: null,
  masalahPilihan: null,
  hipotesisTeks: '',

  /* Tahap 2 — organisasi */
  peranOrder: null,
  peranPilih: null,
  pilahStates: {},
  pilahOrder: null,
  rencana: null,

  /* Tahap 3a — Lab Diskon */
  labDiskon: null,
  misiTercapai: {},
  diskonSteps: [],
  amatiDiskonOrders: {},
  amatiDiskonPilih: {},

  /* Tahap 3b — Untung–Rugi */
  timbang: null,
  untungSteps: [],
  amatiUntungOrders: {},
  amatiUntungPilih: {},

  /* Tahap 3c — Anggaran */
  kategoriStates: {},
  kategoriOrder: null,
  papan: null,
  anggaranSteps: [],
  amatiAnggaranOrders: {},
  amatiAnggaranPilih: {},

  /* Tahap 4 — karya */
  karyaSteps: [],
  keputusanOrder: null,
  keputusanPilih: null,
  karyaPesan: '',

  /* Tahap 5 — evaluasi */
  detektifStates: {},
  detektifOrder: null,
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Uji terap */
  terapkanPick: null,
  terapkanIdx: 0,
  terapkanExercises: [],

  /* Refleksi */
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

function angkaValid(v) {
  return typeof v === 'number' && isFinite(v);
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
  /* Tahap 1 */
  ensureListOrders('dugaanOrders', DATA.orientasi.dugaan);
  ensureMap('dugaanPilih');
  ensureShuffledOrder(State, 'masalahOrder', DATA.orientasi.masalahOpsi);

  /* Tahap 2 */
  ensureShuffledOrder(State, 'peranOrder', DATA.organisasi.peran);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.organisasi.opsiPilah);
  ensureTapOrderState(State, 'rencana', RENCANA_ITEMS, RENCANA_JAWAB);

  /* Tahap 3a */
  var L = State.labDiskon;
  if (!L || !angkaValid(L.p1) || !angkaValid(L.p2)) {
    State.labDiskon = { p1: DATA.selidikDiskon.labAwal.p1, p2: DATA.selidikDiskon.labAwal.p2 };
  }
  ensureMap('misiTercapai');
  ensureExerciseArray(State, 'diskonSteps', LANGKAH_DISKON, makeFinStep);
  ensureListOrders('amatiDiskonOrders', DATA.selidikDiskon.amati);
  ensureMap('amatiDiskonPilih');

  /* Tahap 3b */
  var T = State.timbang;
  if (!T || !angkaValid(T.jual) || !angkaValid(T.terjual)) {
    var awal = DATA.selidikUntung.timbangAwal;
    State.timbang = { jual: awal.jual, terjual: awal.terjual };
  }
  ensureExerciseArray(State, 'untungSteps', LANGKAH_UNTUNG, makeFinStep);
  ensureListOrders('amatiUntungOrders', DATA.selidikUntung.amati);
  ensureMap('amatiUntungPilih');

  /* Tahap 3c */
  ensureSortStates(
    State,
    'kategoriStates',
    'kategoriOrder',
    KATEGORI_ITEMS,
    DATA.selidikAnggaran.opsiPilah
  );
  var P = State.papan;
  var posValid =
    P &&
    P.nilai &&
    DATA.anggaran.pos.every(function (p) {
      return angkaValid(P.nilai[p.id]);
    });
  if (!posValid) State.papan = { nilai: Object.assign({}, DATA.anggaran.draf) };
  ensureExerciseArray(State, 'anggaranSteps', LANGKAH_ANGGARAN, makeFinStep);
  ensureListOrders('amatiAnggaranOrders', DATA.selidikAnggaran.amati);
  ensureMap('amatiAnggaranPilih');

  /* Tahap 4 */
  ensureExerciseArray(State, 'karyaSteps', LANGKAH_KARYA, makeFinStep);
  ensureShuffledOrder(State, 'keputusanOrder', DATA.karya.keputusan.opsi);

  /* Tahap 5 */
  ensureSortStates(
    State,
    'detektifStates',
    'detektifOrder',
    DETEKTIF_ITEMS,
    DATA.evaluasi.opsiDetektif
  );
  ensureShuffledOrder(State, 'bankOrder', DATA.evaluasi.bank);
  ensureMap('simpulanPilihan');

  /* Uji terap — soal dipilih acak dari bank; opsi tiap soal diacak */
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

  /* Refleksi */
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

/*
 * Merender ulang tahap lalu mengembalikan fokus ke elemen ber-id yang
 * sama (mis. tombol stepper) agar pengguna papan ketik tidak kehilangan
 * posisi. Bila tombol itu kini nonaktif, fokus pindah ke pasangannya.
 */
function rerenderFokus(render) {
  var aktif = document.activeElement;
  var id = aktif && aktif.id;
  render();
  if (!id) return;
  var el = document.getElementById(id);
  if (el && el.disabled) {
    var m = /^(.*)(Inc|Dec)$/.exec(id);
    if (m) el = document.getElementById(m[1] + (m[2] === 'Inc' ? 'Dec' : 'Inc'));
  }
  if (el && !el.disabled) el.focus();
}

/* Label konteks: ikon + nama (Belanja, Berdagang, Anggaran). */
function buildKonteksTag(konteks) {
  var K = DATA.konteks[konteks];
  return (
    '<span class="fin-konteks fin-konteks--' +
    konteks +
    '"><span aria-hidden="true">' +
    K.ikon +
    '</span> ' +
    esc(K.nama) +
    '</span>'
  );
}

function semuaSelesai(steps) {
  return steps.every(function (s) {
    return s.done;
  });
}

/* Indeks langkah pertama yang belum selesai (= panjang daftar bila semua selesai). */
function langkahAktif(steps) {
  for (var i = 0; i < steps.length; i++) if (!steps[i].done) return i;
  return steps.length;
}

/* Daftar langkah isian berurutan: langkah berikutnya terbuka setelah benar. */
function buildLangkahList(prefix, langkah, steps) {
  var aktif = langkahAktif(steps);
  return (
    '<div class="dl-steps">' +
    langkah
      .slice(0, aktif + 1)
      .map(function (s, i) {
        return buildFinStep(prefix + i, steps[i], s, i + 1);
      })
      .join('') +
    '</div>'
  );
}

function bindLangkahList(prefix, langkah, steps, rerender) {
  var aktif = langkahAktif(steps);
  langkah.slice(0, aktif + 1).forEach(function (s, i) {
    bindFinStep(prefix + i, steps[i], s, saveState, rerender);
  });
}

/* Panel pertanyaan temuan (pertanyaan penuntun berumpan balik). */
function buildTemuanPanel(list, orders, pilih) {
  return buildDlPanel(
    '<h3 style="margin-top:0;">💡 Apa temuan kelompokmu?</h3>' +
      buildGuidedQuizList(list, orders, pilih)
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

/* Papan promo satu toko (tanpa hitungan — murid yang menghitung). */
function buildPapanPromo(t) {
  var B = DATA.barang;
  return (
    '<article class="promo-toko">' +
    '<h3 class="promo-toko__nama"><span aria-hidden="true">' +
    t.ikon +
    '</span> ' +
    esc(t.nama) +
    '</h3>' +
    '<ul class="promo-toko__list">' +
    ['bahan', 'cup']
      .map(function (k) {
        return (
          '<li><span class="promo-toko__barang"><span aria-hidden="true">' +
          B[k].ikon +
          '</span> ' +
          esc(B[k].nama) +
          ' — ' +
          esc(formatRupiah(B[k].harga)) +
          (k === 'cup' ? '/buah' : '') +
          '</span><span class="promo-toko__label">' +
          esc(t.promo[k].label) +
          '</span></li>'
        );
      })
      .join('') +
    '</ul>' +
    '</article>'
  );
}

/* ============================================================
   5. STAGE: ORIENTASI MASALAH  (PBL — sintaks 1)
   Dugaan TIDAK dinilai; rumusan masalah berumpan balik.
   ============================================================ */

function dugaanLengkap() {
  return DATA.orientasi.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function orientasiLengkap() {
  return (
    dugaanLengkap() &&
    State.masalahPilihan === DATA.orientasi.masalahCorrect &&
    !!State.hipotesisTeks.trim()
  );
}

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var masalahBenar = State.masalahPilihan === D.masalahCorrect;

  var dugaanHTML = D.dugaan
    .map(function (q, i) {
      return (
        '<div class="quiz-item">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        esc(q.tanya) +
        '</p>' +
        buildChoiceGroup(DUGAAN_OPSI[q.id], State.dugaanOrders[q.id], {
          chosen: State.dugaanPilih[q.id] || null,
          group: q.id,
          attr: 'data-dugaan',
        }) +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Orientasi pada Masalah">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🍋 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="promo-grid">' +
        DATA.toko.map(buildPapanPromo).join('') +
        '</div>' +
        '<h3>📒 Catatan kelompok</h3>' +
        '<ul class="catatan-list">' +
        D.catatanKelompok
          .map(function (c) {
            return '<li>' + esc(c) + '</li>';
          })
          .join('') +
        '</ul>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaan kelompokmu?</h3>' +
        '<p class="dl-caption">Dugaan tidak dinilai. Kalian akan mengujinya sendiri nanti.</p>' +
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
        '</div>'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🎯 Rumusan masalah</h3>' +
        '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(MASALAH_OPSI, State.masalahOrder, {
          chosen: State.masalahPilihan,
          correctId: masalahBenar ? D.masalahCorrect : null,
          grade: true,
          locked: masalahBenar,
          attr: 'data-masalah',
        }) +
        buildGuidedChoiceFeedback(State.masalahPilihan, masalahBenar, D.masalahUmpan) +
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
    buildDlNextButton('orientasiNextBtn', D.nextLabel) +
    '</section>';

  var rerender = function () {
    renderOrientasi(container);
  };

  container.querySelectorAll('[data-dugaan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.dugaanPilih[btn.dataset.group] = btn.dataset.dugaan;
      saveState();
      rerender();
    });
  });

  container.querySelectorAll('[data-masalah]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.masalahPilihan === D.masalahCorrect) return;
      State.masalahPilihan = btn.dataset.masalah;
      saveState();
      rerender();
    });
  });

  var alasan = document.getElementById('orientasiAlasan');
  alasan.addEventListener('input', function () {
    State.orientasiAlasan = alasan.value;
    saveState();
  });

  var hip = document.getElementById('hipotesisTeks');
  hip.addEventListener('input', function () {
    State.hipotesisTeks = hip.value;
    saveState();
  });

  document.getElementById('orientasiNextBtn').addEventListener('click', function () {
    if (!dugaanLengkap()) {
      showNotice('Pilih dugaan kelompokmu untuk setiap pertanyaan lebih dulu.');
      return;
    }
    if (State.masalahPilihan !== D.masalahCorrect) {
      showNotice('Temukan dulu rumusan masalah yang tepat.');
      return;
    }
    if (!State.hipotesisTeks.trim()) {
      showNotice('Tulis hipotesis kelompokmu sebelum melanjutkan.');
      return;
    }
    completeStage('orientasi');
    navigateTo('organisasi');
  });
}

/* ============================================================
   6. STAGE: ORGANISASI  (PBL — sintaks 2)
   ============================================================ */

function organisasiLengkap() {
  return (
    !!State.peranPilih &&
    sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates) &&
    State.rencana.correct
  );
}

function renderOrganisasi(container) {
  var D = DATA.organisasi;
  var pilahSelesai = sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);
  var rerender = function () {
    renderOrganisasi(container);
  };

  container.innerHTML =
    '<section aria-label="Mengorganisasi Belajar">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">👥 ' +
        esc(D.peranLabel) +
        '</h3>' +
        buildChoiceGroup(PERAN_OPSI, State.peranOrder, {
          chosen: State.peranPilih,
          attr: 'data-peran',
        })
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🗂️ ' +
        esc(D.judulPilah) +
        '</h3>' +
        buildSortItems(PILAH_ITEMS, State.pilahOrder, D.opsiPilah, State.pilahStates)
    ) +
    (pilahSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🗺️ ' +
            esc(D.judulRencana) +
            '</h3>' +
            '<p>' +
            esc(D.instruksiRencana) +
            '</p>' +
            buildTapOrder('rencanaTap', RENCANA_ITEMS, State.rencana, {
              answer: RENCANA_JAWAB,
              startLabel: 'Mulai',
              endLabel: 'Akhir',
              successText:
                '<strong>Rencana kerja tersusun!</strong> Pakai urutan ini sebagai daftar periksa selama penyelidikan.',
              wrongText:
                'Belum tepat. Pikirkan: modal baru bisa dihitung setelah tahu harga belanja, dan harga jual bergantung pada modal.',
            })
        )
      : '') +
    (organisasiLengkap() ? buildDlNextButton('organisasiNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-peran]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.peranPilih = btn.dataset.peran;
      saveState();
      rerender();
    });
  });
  bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  if (pilahSelesai) {
    bindTapOrder(container, 'rencanaTap', State.rencana, RENCANA_JAWAB, saveState, rerender);
  }
  bindNext('organisasiNextBtn', 'organisasi', 'selidikDiskon');
}

/* ============================================================
   7. STAGE: LAB DISKON  (PBL — sintaks 3a)
   ============================================================ */

function catatMisi() {
  var L = State.labDiskon;
  DATA.selidikDiskon.labMisi.forEach(function (m) {
    if (L.p1 === m.p1 && L.p2 === m.p2) State.misiTercapai[m.id] = true;
  });
}

function misiLengkap() {
  return DATA.selidikDiskon.labMisi.every(function (m) {
    return !!State.misiTercapai[m.id];
  });
}

function buildMisiList(misi) {
  return (
    '<ul class="misi-list">' +
    misi
      .map(function (m) {
        var ok = !!State.misiTercapai[m.id];
        return (
          '<li class="' +
          (ok ? 'is-ok' : '') +
          '"><span aria-hidden="true">' +
          (ok ? '✅' : '🎯') +
          '</span> <span class="sr-only">' +
          (ok ? 'Selesai: ' : 'Misi: ') +
          '</span>' +
          esc(m.teks) +
          '</li>'
        );
      })
      .join('') +
    '</ul>'
  );
}

function renderSelidikDiskon(container) {
  var D = DATA.selidikDiskon;
  catatMisi();
  var steps = State.diskonSteps;
  var selesai = semuaSelesai(steps) && misiLengkap();
  var temuanBenar = guidedQuizAllCorrect(AMATI_DISKON, State.amatiDiskonPilih);
  var rerender = function () {
    renderSelidikDiskon(container);
  };
  var labOpts = { harga: D.labHarga, nama: DATA.barang.bahan.nama };

  container.innerHTML =
    '<section aria-label="Penyelidikan A: Lab Diskon">' +
    buildHead(D) +
    '<div class="promo-grid">' +
    DATA.toko.map(buildPapanPromo).join('') +
    '</div>' +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.labJudul) +
        '</h3>' +
        '<p>' +
        esc(D.labTeks) +
        '</p>' +
        buildMisiList(D.labMisi) +
        buildLabDiskon('labDiskon', State.labDiskon, labOpts)
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">✍️ Hitung bersama kelompok</h3>' +
        '<p class="dl-caption">' +
        esc(D.instruksi) +
        '</p>' +
        buildLangkahList('ld', LANGKAH_DISKON, steps)
    ) +
    (selesai
      ? buildTemuanPanel(AMATI_DISKON, State.amatiDiskonOrders, State.amatiDiskonPilih)
      : '') +
    (!misiLengkap() && semuaSelesai(steps)
      ? buildFeedbackBox('info', '🎯', 'Selesaikan dulu kedua misi Lab Diskon di atas.')
      : '') +
    (selesai && temuanBenar ? buildDlNextButton('diskonNextBtn', D.nextLabel) : '') +
    '</section>';

  bindLabDiskon(container, 'labDiskon', State.labDiskon, labOpts, function () {
    catatMisi();
    saveState();
    rerenderFokus(rerender);
  });
  bindLangkahList('ld', LANGKAH_DISKON, steps, rerender);
  bindGuidedQuizList(container, AMATI_DISKON, State.amatiDiskonPilih, saveState, rerender);
  bindNext('diskonNextBtn', 'selidikDiskon', 'selidikUntung');
}

/* ============================================================
   8. STAGE: UNTUNG–RUGI  (PBL — sintaks 3b)
   ============================================================ */

function buildStrukModal() {
  var D = DATA.selidikUntung;
  return buildStrukBelanja({
    toko: 'Rincian modal kelompok',
    ikon: '🧾',
    baris: D.modalRincian.map(function (r) {
      return { nama: r.nama, qty: 1, harga: r.nilai };
    }),
    catatan: 'Modal untuk ' + DATA.usaha.gelas + ' gelas es teh lemon',
  });
}

function renderSelidikUntung(container) {
  var D = DATA.selidikUntung;
  var steps = State.untungSteps;
  var selesai = semuaSelesai(steps);
  var temuanBenar = guidedQuizAllCorrect(AMATI_UNTUNG, State.amatiUntungPilih);
  var rerender = function () {
    renderSelidikUntung(container);
  };

  container.innerHTML =
    '<section aria-label="Penyelidikan B: Untung dan Rugi">' +
    buildHead(D) +
    '<div class="fin-dua">' +
    buildStrukModal() +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.timbangJudul) +
        '</h3>' +
        '<p>' +
        esc(D.timbangTeks) +
        '</p>' +
        buildTimbanganUntung('timbang', State.timbang, D.timbangOpsi)
    ) +
    '</div>' +
    buildDlPanel(
      '<h3 style="margin-top:0;">✍️ Hitung bersama kelompok</h3>' +
        '<p class="dl-caption">' +
        esc(D.instruksi) +
        '</p>' +
        buildLangkahList('lu', LANGKAH_UNTUNG, steps)
    ) +
    (selesai
      ? buildTemuanPanel(AMATI_UNTUNG, State.amatiUntungOrders, State.amatiUntungPilih)
      : '') +
    (selesai && temuanBenar ? buildDlNextButton('untungNextBtn', D.nextLabel) : '') +
    '</section>';

  bindTimbanganUntung(container, 'timbang', State.timbang, D.timbangOpsi, function () {
    saveState();
    rerenderFokus(rerender);
  });
  bindLangkahList('lu', LANGKAH_UNTUNG, steps, rerender);
  bindGuidedQuizList(container, AMATI_UNTUNG, State.amatiUntungPilih, saveState, rerender);
  bindNext('untungNextBtn', 'selidikUntung', 'selidikAnggaran');
}

/* ============================================================
   9. STAGE: ANGGARAN  (PBL — sintaks 3c)
   ============================================================ */

function papanOpts() {
  var A = DATA.anggaran;
  return { pemasukan: A.dana, pos: A.pos, langkah: A.langkah, syarat: A.syarat };
}

function anggaranMemenuhi() {
  var A = DATA.anggaran;
  return periksaAnggaran(A.dana, nilaiPosAnggaran(State.papan, A.pos), A.syarat).ok;
}

function renderSelidikAnggaran(container) {
  var D = DATA.selidikAnggaran;
  var pilahSelesai = sortItemsAllAnswered(KATEGORI_ITEMS, State.kategoriStates);
  var papanOk = anggaranMemenuhi();
  var steps = State.anggaranSteps;
  var hitungSelesai = semuaSelesai(steps);
  var temuanBenar = guidedQuizAllCorrect(AMATI_ANGGARAN, State.amatiAnggaranPilih);
  var rerender = function () {
    renderSelidikAnggaran(container);
  };
  var opts = papanOpts();

  container.innerHTML =
    '<section aria-label="Penyelidikan C: Anggaran Dana Kas">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🗂️ ' +
        esc(D.judulPilah) +
        '</h3>' +
        buildSortItems(KATEGORI_ITEMS, State.kategoriOrder, D.opsiPilah, State.kategoriStates)
    ) +
    (pilahSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.papanJudul) +
            '</h3>' +
            '<p>' +
            esc(D.papanTeks) +
            '</p>' +
            buildPapanAnggaran('papan', State.papan, opts) +
            (papanOk
              ? '<div style="margin-top:var(--space-3);">' +
                buildFeedbackBox('success', '✓', esc(D.papanSelesai)) +
                '</div>'
              : '')
        )
      : '') +
    (pilahSelesai && papanOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">✍️ Hitung bersama kelompok</h3>' +
            '<p class="dl-caption">' +
            esc(D.instruksi) +
            '</p>' +
            buildLangkahList('la', LANGKAH_ANGGARAN, steps)
        )
      : '') +
    (pilahSelesai && papanOk && hitungSelesai
      ? buildTemuanPanel(AMATI_ANGGARAN, State.amatiAnggaranOrders, State.amatiAnggaranPilih)
      : '') +
    (pilahSelesai && papanOk && hitungSelesai && temuanBenar
      ? buildDlNextButton('anggaranNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, KATEGORI_ITEMS, State.kategoriStates, saveState, rerender);
  if (pilahSelesai) {
    bindPapanAnggaran(container, 'papan', State.papan, opts, function () {
      saveState();
      rerenderFokus(rerender);
    });
  }
  if (pilahSelesai && papanOk) bindLangkahList('la', LANGKAH_ANGGARAN, steps, rerender);
  bindGuidedQuizList(container, AMATI_ANGGARAN, State.amatiAnggaranPilih, saveState, rerender);
  bindNext('anggaranNextBtn', 'selidikAnggaran', 'karya');
}

/* ============================================================
   10. STAGE: KARYA  (PBL — sintaks 4)
   ============================================================ */

/* Harga promo barang `k` ('bahan' | 'cup') di toko `t`. */
function hargaDiToko(t, k) {
  var B = DATA.barang[k];
  return hargaPromo(Object.assign({ harga: B.harga }, t.promo[k]), B.qty);
}

/* Struk rekap belanja termurah kelompok: bahan di Toko Rejeki, cup di Toko Maju. */
function buildStrukRekap() {
  var B = DATA.barang;
  var bahan = DATA.toko[1].promo.bahan;
  var cup = DATA.toko[0].promo.cup;
  var hBahan = hargaDiToko(DATA.toko[1], 'bahan');
  var hCup = hargaDiToko(DATA.toko[0], 'cup');
  return buildStrukBelanja({
    toko: 'Rekap belanja kelompok',
    ikon: '🧾',
    baris: [
      {
        nama: B.bahan.nama + ' (' + DATA.toko[1].nama + ')',
        qty: B.bahan.qty,
        harga: B.bahan.harga,
      },
      { nama: B.cup.nama + ' (' + DATA.toko[0].nama + ')', qty: B.cup.qty, harga: B.cup.harga },
      { nama: B.pelengkap.nama, qty: 1, harga: B.pelengkap.biaya },
    ],
    promo: [
      { label: bahan.label + ' (bahan)', potong: hBahan.potongan },
      { label: cup.label + ' (cup)', potong: hCup.potongan },
    ],
    catatan: 'Modal = ' + formatRupiah(DATA.usaha.modal),
  });
}

function buildPosterKarya() {
  var U = DATA.usaha;
  var A = DATA.anggaran;
  var pokok = U.modal / U.gelas;
  var u = untungRugi(U.modal, U.hargaJual * U.gelas);
  var sepi = untungRugi(U.modal, U.hargaJual * U.terjualSepi);
  var pos = nilaiPosAnggaran(State.papan, A.pos);
  var r = rincianAnggaran(A.dana, pos);
  var poster = buildInfoPoster({
    ikon: '🍋',
    judul: DATA.karya.posterJudul,
    rows: [
      {
        ikon: '🛒',
        label: 'Belanja',
        nilai:
          'Bahan di ' +
          esc(DATA.toko[1].nama) +
          ', cup di ' +
          esc(DATA.toko[0].nama) +
          ' (hemat ' +
          esc(
            formatRupiah(
              hargaDiToko(DATA.toko[1], 'bahan').potongan +
                hargaDiToko(DATA.toko[0], 'cup').potongan
            )
          ) +
          ')',
      },
      {
        ikon: '🧾',
        label: 'Modal',
        nilai: esc(formatRupiah(U.modal) + ' (' + formatRupiah(pokok) + ' per gelas)'),
      },
      {
        ikon: '🏷️',
        label: 'Harga jual',
        nilai: '<strong>' + esc(formatRupiah(U.hargaJual)) + '</strong> per gelas',
      },
      {
        ikon: '📈',
        label: 'Bila 80 gelas laku',
        nilai: esc('Untung ' + formatRupiah(u.besar) + ' (' + fmtPersenFin(u.persen) + ')'),
      },
      {
        ikon: '⚠️',
        label: 'Bila hanya 60 gelas',
        nilai: esc(
          'Rugi ' +
            formatRupiah(sepi.besar) +
            ' (' +
            fmtPersenFin(sepi.persen) +
            ') — impas di ' +
            Math.ceil(U.modal / U.hargaJual) +
            ' gelas'
        ),
      },
      {
        ikon: '🐷',
        label: 'Anggaran kas',
        nilai: esc(
          'Tabungan ' +
            formatRupiah(r.perJenis.tabungan) +
            ', keinginan ' +
            formatRupiah(r.perJenis.keinginan) +
            ', sisa ' +
            formatRupiah(r.sisa)
        ),
      },
    ],
    pesan: State.karyaPesan.trim(),
    footer: DATA.karya.posterFooter,
  });
  return '<div class="fin-dua">' + poster + buildStrukRekap() + '</div>';
}

function renderKarya(container) {
  var D = DATA.karya;
  var steps = State.karyaSteps;
  var hitungSelesai = semuaSelesai(steps);
  var putusBenar = State.keputusanPilih === KEPUTUSAN.correct;
  var rerender = function () {
    renderKarya(container);
  };

  container.innerHTML =
    '<section aria-label="Mengembangkan dan Menyajikan Karya">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">📋 Papan Rencana Usaha</h3>' +
        '<p class="dl-caption">' +
        esc(D.instruksi) +
        '</p>' +
        buildLangkahList('kr', LANGKAH_KARYA, steps)
    ) +
    (hitungSelesai
      ? buildDlPanel(
          '<p class="exercise-label">' +
            esc(D.keputusan.tanya) +
            '</p>' +
            buildChoiceGroup(KEPUTUSAN.opsi, State.keputusanOrder, {
              chosen: State.keputusanPilih,
              correctId: putusBenar ? KEPUTUSAN.correct : null,
              grade: true,
              locked: putusBenar,
              attr: 'data-putus',
            }) +
            buildGuidedChoiceFeedback(State.keputusanPilih, putusBenar, KEPUTUSAN.umpan) +
            (putusBenar
              ? '<div class="field-group" style="margin-top:var(--space-5);">' +
                '<label for="karyaPesan">' +
                esc(D.pesanLabel) +
                '</label>' +
                '<textarea id="karyaPesan" class="input-textarea" maxlength="160" placeholder="' +
                esc(D.pesanPlaceholder) +
                '">' +
                esc(State.karyaPesan) +
                '</textarea>' +
                '</div>'
              : '')
        )
      : '') +
    (putusBenar
      ? '<div id="posterWrap">' +
        buildPosterKarya() +
        '</div>' +
        buildDlNextButton('karyaNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindLangkahList('kr', LANGKAH_KARYA, steps, rerender);

  container.querySelectorAll('[data-putus]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.keputusanPilih === KEPUTUSAN.correct) return;
      State.keputusanPilih = btn.dataset.putus;
      saveState();
      rerender();
    });
  });

  var pesan = document.getElementById('karyaPesan');
  if (pesan) {
    pesan.addEventListener('input', function () {
      State.karyaPesan = pesan.value;
      saveState();
      var wrap = document.getElementById('posterWrap');
      if (wrap) wrap.innerHTML = buildPosterKarya();
    });
  }

  bindNext('karyaNextBtn', 'karya', 'evaluasi');
}

/* ============================================================
   11. STAGE: EVALUASI  (PBL — sintaks 5)
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
    '<span>Hasil: <strong>' +
    esc(bakuLabel) +
    '</strong> — ' +
    esc(pembahasan) +
    '</span>' +
    '<span class="dugaan-row__verdict">' +
    (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu dikoreksi oleh perhitungan') +
    '</span>' +
    '</div>'
  );
}

function buildDugaanBanding() {
  var O = DATA.orientasi;
  return (
    '<div class="dugaan-compare">' +
    O.dugaan
      .map(function (q) {
        var pilih = State.dugaanPilih[q.id];
        return buildDugaanRow(
          q.tanya,
          findOptionLabel(q.opsi, pilih),
          findOptionLabel(q.opsi, q.baku),
          q.pembahasan,
          pilih === q.baku
        );
      })
      .join('') +
    '</div>' +
    (State.hipotesisTeks
      ? '<div class="hipotesis-box">' +
        '<span class="hipotesis-box__label">Hipotesis kelompokmu di tahap 1</span>' +
        '<p>' +
        esc(State.hipotesisTeks) +
        '</p>' +
        '<span class="dl-caption">Apakah hipotesismu diterima, perlu diperbaiki, atau ditolak? Diskusikan dengan kelompokmu.</span>' +
        '</div>'
      : '')
  );
}

function simpulanSemuaBenar() {
  return DATA.evaluasi.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function buildSimpulan() {
  var D = DATA.evaluasi;
  var bank = orderByIds(D.bank, State.bankOrder);
  var benarSemua = simpulanSemuaBenar();
  var diperiksa = State.simpulanChecked;
  return D.kalimat
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali temuan ketiga penyelidikan.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');
}

function renderEvaluasi(container) {
  var D = DATA.evaluasi;
  var detektifSelesai = sortItemsAllAnswered(DETEKTIF_ITEMS, State.detektifStates);
  var benarSemua = simpulanSemuaBenar();
  var rerender = function () {
    renderEvaluasi(container);
  };

  container.innerHTML =
    '<section aria-label="Menganalisis dan Mengevaluasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulDetektif) +
        '</h3>' +
        buildSortItems(DETEKTIF_ITEMS, State.detektifOrder, D.opsiDetektif, State.detektifStates)
    ) +
    (detektifSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' + esc(D.judulDugaan) + '</h3>' + buildDugaanBanding()
        ) +
        buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulSimpulan) +
            '</h3>' +
            '<p>' +
            esc(D.instruksiSimpulan) +
            '</p>' +
            buildSimpulan() +
            (benarSemua
              ? buildFeedbackBox(
                  'success',
                  '✓',
                  '<strong>Simpulan kelompokmu lengkap dan tepat.</strong> Inilah jawaban dari rumusan masalah kalian.'
                )
              : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
                '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Simpulan</button>' +
                '</div>')
        )
      : '') +
    (detektifSelesai && benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📌 Rangkuman</h3>' +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + esc(r) + '</li>'
                );
              })
              .join('') +
            '</ol>',
          'panel--hero'
        ) + buildDlNextButton('evaluasiNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindSortItems(container, DETEKTIF_ITEMS, State.detektifStates, saveState, rerender);

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
      rerender();
    });
  }

  bindNext('evaluasiNextBtn', 'evaluasi', 'terapkan');
}

/* ============================================================
   12. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal TERAP_SOAL yang
   dipilih acak. Isian diperiksa periksaFinStep sehingga pesan salahnya
   berupa diagnosa miskonsepsi; pilihan ganda memakai opsiFinansial
   yang setiap pengecohnya membawa umpan diagnosa.
   ============================================================ */

function periksaIsianTerap(value, s) {
  return periksaFinStep(makeFinStep(), s, value);
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
  inputPlaceholder: 'mis. 36.000 atau 12,5',
  inputMode: 'decimal',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  inputSuffix: function (s) {
    return '<span class="bbk-satuan">' + (satuanFinansial(s) === '%' ? '%' : 'rupiah') + '</span>';
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
      '<strong>' +
      esc(ex.userInput) +
      '</strong> — ' +
      esc(periksaIsianTerap(ex.userInput, s).pesan)
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
  var semuaCek = State.diskonSteps.concat(State.untungSteps, State.anggaranSteps, State.karyaSteps);
  var sekali = semuaCek.filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  var pilahSemua = PILAH_ITEMS.length + KATEGORI_ITEMS.length + DETEKTIF_ITEMS.length;
  var pilahBenar =
    sortItemsCorrectCount(PILAH_ITEMS, State.pilahStates) +
    sortItemsCorrectCount(KATEGORI_ITEMS, State.kategoriStates) +
    sortItemsCorrectCount(DETEKTIF_ITEMS, State.detektifStates);
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
          'Langkah hitung tepat pada percobaan pertama'
        ) +
        buildRingkasKartu(pilahBenar + '/' + pilahSemua, 'Pemilahan & detektif benar') +
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
    '<div class="fin-contoh-grid">' +
    D.contoh
      .map(function (c) {
        return (
          '<div class="formula-card"><span class="formula-card__label">' +
          buildKonteksTag(c.konteks) +
          '</span><strong class="fin-contoh-grid__teks">' +
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
    'Presentasi Papan Rencana Usaha dan penjelasan murid atas keputusan keuangannya tetap menjadi bahan penilaian utama.' +
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
  organisasi: renderOrganisasi,
  selidikDiskon: renderSelidikDiskon,
  selidikUntung: renderSelidikUntung,
  selidikAnggaran: renderSelidikAnggaran,
  karya: renderKarya,
  evaluasi: renderEvaluasi,
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
