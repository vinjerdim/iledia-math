'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Hubungan Luas Persegi pada Sisi Segitiga Siku-siku
   — Fase D, SMP Kelas VIII (Topik 19: Teorema Pythagoras)

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen bersama: buildDiscoveryHead, buildTeacherNote,
       buildTpPanel, buildChoiceGroup, buildSortItems,
       buildGuidedQuizList, buildDlPanel, buildDlNextButton,
       buildFeedbackBox, buildHintStack, buildHintToggle;
     • seksi 86 (luas persegi pada sisi segitiga): segitigaSikuKisi,
       buildPersegiSisiSVG, opsiSoalPythagoras, nilaiSoalPythagoras,
       serta alat interaktif ukur luas tiga persegi (ensureUkurLuas,
       buildUkurLuas, bindUkurLuas, ukurLuasBenar), Lab Kotak Persegi
       (ensureLabPersegi, buildLabPersegi, bindLabPersegi,
       labPersegiSelesai), dan tabel luas isian (ensureTabelLuas,
       buildTabelLuas, bindTabelLuas, tabelLuasBenar).

   Alur tahap mengikuti sintaks Inquiry Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan orientasi, rumusan
   masalah, hipotesis, pertanyaan temuan, relasi luas pembanding,
   pernyataan uji, bank kesimpulan, opsi uji terap, penilaian diri)
   DIACAK dengan shuffleArray() melalui ensureShuffledOrder() /
   ensureSortStates(). Pengacakan dilakukan SEKALI saat state disiapkan
   (initExerciseArrays) lalu urutannya disimpan di State — bukan saat
   render — sehingga pilihan tidak melompat saat dirender ulang, tetapi
   teracak ulang untuk setiap murid dan setiap Reset. Soal uji terap juga
   dipilih acak dari bank (pilihSoalTerap) dan opsinya dibangun engine
   (opsiSoalPythagoras).

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi               (IL sintaks 1)
    6. Stage: Merumuskan Masalah      (IL sintaks 2)
    7. Stage: Merumuskan Hipotesis    (IL sintaks 3)
    8. Stage: Lab Kotak Persegi       (IL sintaks 4a)
    9. Stage: Tabel Data              (IL sintaks 4b)
   10. Stage: Pembanding              (IL sintaks 4c)
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
var STORAGE_KEY = 'mpi-d-19-1-luas-persegi-pythagoras-v1';
var LAB_CFG = DATA.dataHitung.lab;

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

var DUGAAN = DATA.orientasi.dugaan.map(siapkanGuided);
var HIPOTESIS = DATA.hipotesis.dugaan.map(siapkanGuided);
var MASALAH_OPSI = opsiAman(DATA.masalah.opsi);
var TEMUAN_TABEL = DATA.dataTabel.temuan.map(siapkanGuided);
var TEMUAN_BANDING = DATA.dataBanding.temuan.map(siapkanGuided);

/* Pertanyaan relasi luas untuk setiap segitiga pembanding. */
var RELASI = DATA.dataBanding.segitiga.map(function (g) {
  return siapkanGuided({
    id: g.id,
    tanya:
      'Bandingkan luas ketiga persegi pada ' +
      g.nama +
      '. Jumlah dua luas yang kecil dibandingkan luas yang terbesar …',
    opsi: DATA.dataBanding.opsiRelasi,
    correct: g.correct,
    umpan: g.umpan,
  });
});

var UJI_ITEMS = DATA.uji.pernyataan.map(function (v) {
  return { id: v.id, teks: esc(v.teks), correct: v.correct, explanation: esc(v.explanation) };
});

/* Soal uji terap: opsi dibangun engine (opsiSoalPythagoras). */
var OPSI_TERAP = {};
DATA.terapkan.soal.forEach(function (s) {
  var opsi = opsiSoalPythagoras(s);
  OPSI_TERAP[s.id] = opsi;
  s.type = 'choice';
  s.options = opsiAman(opsi);
  s.correct = nilaiSoalPythagoras(s);
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

  /* Tahap 4a — Lab Kotak Persegi */
  labPersegi: null,
  petunjukLevel: 0,

  /* Tahap 4b — Tabel Data */
  tabelLuas: null,
  temuanTabelOrders: {},
  temuanTabelPilih: {},

  /* Tahap 4c — Pembanding */
  bandingUkur: {},
  relasiOrders: {},
  relasiPilih: {},
  temuanBandingOrders: {},
  temuanBandingPilih: {},

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

/* Baris Tabel Data: hasil Lab (isian La + Lb) lalu baris tambahan DATA. */
function barisTabel() {
  var lab = State.labPersegi.catat.map(function (c) {
    return {
      id: 'lab-' + c.a + 'x' + c.b,
      a: c.a,
      b: c.b,
      La: c.La,
      Lb: c.Lb,
      Lc: c.Lc,
      isi: ['jumlah'],
    };
  });
  var tambahan = DATA.dataTabel.tambahan.map(function (r) {
    return {
      id: r.id,
      a: r.a,
      b: r.b,
      La: r.a * r.a,
      Lb: r.b * r.b,
      Lc: r.Lc,
      isi: ['La', 'Lb', 'jumlah'],
      catatan: r.catatan,
    };
  });
  return lab.concat(tambahan);
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
  ensureListOrders('dugaanOrders', DUGAAN);
  ensureMap('dugaanPilih');
  ensureShuffledOrder(State, 'masalahOrder', MASALAH_OPSI);
  ensureListOrders('hipotesisOrders', HIPOTESIS);
  ensureMap('hipotesisPilih');

  /* Tahap 4a */
  State.labPersegi = ensureLabPersegi(State.labPersegi, LAB_CFG);
  if (typeof State.petunjukLevel !== 'number') State.petunjukLevel = 0;

  /* Tahap 4b */
  State.tabelLuas = ensureTabelLuas(State.tabelLuas, barisTabel());
  ensureListOrders('temuanTabelOrders', TEMUAN_TABEL);
  ensureMap('temuanTabelPilih');

  /* Tahap 4c */
  var ukur = ensureMap('bandingUkur');
  DATA.dataBanding.segitiga.forEach(function (g) {
    ukur[g.id] = ensureUkurLuas(ukur[g.id]);
  });
  ensureListOrders('relasiOrders', RELASI);
  ensureMap('relasiPilih');
  ensureListOrders('temuanBandingOrders', TEMUAN_BANDING);
  ensureMap('temuanBandingPilih');

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
      rerender(
        '[' + attr + '="' + btn.dataset[dataKey] + '"][data-group="' + btn.dataset.group + '"]'
      );
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

/* Tombol kembali ke tahap sebelumnya bila prasyarat belum terpenuhi. */
function buildKembaliPanel(pesan, btnId, label) {
  return (
    buildFeedbackBox('info', '🔎', esc(pesan)) +
    '<div class="btn-group btn-group--end" style="margin-top:var(--space-3);">' +
    '<button type="button" class="btn btn--ghost" id="' +
    btnId +
    '">' +
    esc(label) +
    '</button></div>'
  );
}

/* ============================================================
   5. STAGE: ORIENTASI  (Inquiry Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah.
   ============================================================ */

function renderOrientasi(container, fokus) {
  var D = DATA.orientasi;
  var lengkap = semuaDipilih(DUGAAN, State.dugaanPilih);
  var rerender = function (sel) {
    renderOrientasi(container, sel);
  };
  var taman = segitigaSikuKisi(D.kaki[0], D.kaki[1]);

  container.innerHTML =
    '<section aria-label="Orientasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🌿 ' +
        esc(D.judul) +
        '</h2>' +
        '<div class="ptg-orientasi">' +
        '<p class="ptg-orientasi__teks">' +
        esc(D.pengantar) +
        '</p>' +
        '<figure class="ptg-orientasi__gambar">' +
        buildPersegiSisiSVG(taman, {
          skala: 18,
          label: ['?', '?', '?'],
          judul:
            'Petak taman segitiga siku-siku dengan sisi tegak 4 petak dan sisi mendatar 3 petak; pada setiap sisi ada kolam persegi berubin',
        }) +
        '<figcaption class="dl-caption">Petak taman (putih) dan tiga kolam persegi berubin 1 × 1.</figcaption>' +
        '</figure>' +
        '</div>',
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
  fokusKembali(fokus);
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
      fokusKembali('[data-opt-id="' + btn.dataset.optId + '"]');
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

function renderHipotesis(container, fokus) {
  var D = DATA.hipotesis;
  var rerender = function (sel) {
    renderHipotesis(container, sel);
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
    navigateTo('dataHitung');
  });
  fokusKembali(fokus);
}

/* ============================================================
   8. STAGE: LAB KOTAK PERSEGI  (Inquiry Learning — sintaks 4a)
   Atur kaki → hitung luas tiga persegi (petak & bingkai) → catat.
   ============================================================ */

function renderDataHitung(container, fokus) {
  var D = DATA.dataHitung;
  var lab = State.labPersegi;
  var labOk = labPersegiSelesai(lab, LAB_CFG);
  var hints = D.petunjuk.map(esc);
  var rerender = function (sel) {
    renderDataHitung(container, sel);
  };

  container.innerHTML =
    '<section aria-label="Lab Kotak Persegi">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      '<h3 style="margin-top:0;">🧩 Lab Kotak Persegi</h3>' +
        buildLabPersegi('persegiLab', lab, LAB_CFG) +
        '<div class="ptg-petunjuk">' +
        buildHintStack(hints, State.petunjukLevel) +
        buildHintToggle('labHintBtn', hints, State.petunjukLevel) +
        '</div>'
    ) +
    (labOk
      ? buildFeedbackBox(
          'success',
          '✓',
          '<strong>Data cukup!</strong> Kamu sudah mencatat ' +
            lab.catat.length +
            ' segitiga siku-siku. Boleh menambah percobaan lagi, atau lanjut menata datanya.'
        ) + buildDlNextButton('hitungNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindLabPersegi(container, 'persegiLab', lab, LAB_CFG, function (sel) {
    saveState();
    rerender(sel);
  });

  var hintBtn = document.getElementById('labHintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      State.petunjukLevel += 1;
      saveState();
      rerender('#labHintBtn');
    });
  }

  bindNext('hitungNextBtn', 'dataHitung', 'dataTabel');
  fokusKembali(fokus);
}

/* ============================================================
   9. STAGE: TABEL DATA  (Inquiry Learning — sintaks 4b)
   Lengkapi tabel (hasil lab + dua baris tambahan) → temuan pola.
   ============================================================ */

function renderDataTabel(container, fokus) {
  var D = DATA.dataTabel;
  var rerender = function (sel) {
    renderDataTabel(container, sel);
  };

  if (!labPersegiSelesai(State.labPersegi, LAB_CFG)) {
    container.innerHTML =
      '<section aria-label="Tabel Data">' +
      buildHead(D) +
      buildDlPanel(
        buildKembaliPanel(
          'Catat minimal ' +
            LAB_CFG.minCatat +
            ' segitiga siku-siku di Lab Kotak Persegi lebih dulu.',
          'tabelBackBtn',
          '← Kembali ke Lab Kotak Persegi'
        )
      ) +
      '</section>';
    document.getElementById('tabelBackBtn').addEventListener('click', function () {
      navigateTo('dataHitung');
    });
    return;
  }

  var rows = barisTabel();
  State.tabelLuas = ensureTabelLuas(State.tabelLuas, rows);
  var tabelOk = tabelLuasBenar(rows, State.tabelLuas);
  var temuanOk = guidedQuizAllCorrect(TEMUAN_TABEL, State.temuanTabelPilih);

  container.innerHTML =
    '<section aria-label="Tabel Data">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      '<h3 style="margin-top:0;">📋 Tabel luas persegi pada sisi segitiga siku-siku</h3>' +
        buildTabelLuas('luasTabel', rows, State.tabelLuas, D.judulKolom) +
        (tabelOk
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Tabel lengkap dan tepat.</strong> Sekarang amati polanya.'
            )
          : State.tabelLuas.diperiksa
          ? buildFeedbackBox(
              'warning',
              '💭',
              'Ada isian yang belum tepat (kotak merah). La = a × a, Lb = b × b, lalu jumlahkan keduanya.'
            )
          : '')
    ) +
    (tabelOk
      ? buildTemuanPanel(
          '💡 Apa temuanmu?',
          TEMUAN_TABEL,
          State.temuanTabelOrders,
          State.temuanTabelPilih
        )
      : '') +
    (tabelOk && temuanOk ? buildDlNextButton('tabelNextBtn', D.nextLabel) : '') +
    '</section>';

  bindTabelLuas(container, 'luasTabel', rows, State.tabelLuas, function (pesan) {
    saveState();
    if (pesan === 'kosong') showNotice('Masih ada kotak tabel yang kosong.');
    rerender(tabelLuasBenar(rows, State.tabelLuas) ? null : '#luasTabel-cek');
  });
  if (tabelOk) {
    bindGuidedQuizList(container, TEMUAN_TABEL, State.temuanTabelPilih, saveState, rerender);
  }
  bindNext('tabelNextBtn', 'dataTabel', 'dataBanding');
  fokusKembali(fokus);
}

/* ============================================================
   10. STAGE: PEMBANDING  (Inquiry Learning — sintaks 4c)
   Ukur luas tiga persegi pada segitiga lancip, tumpul, & siku-siku
   miring → pilih relasi → temuan "hanya segitiga siku-siku".
   ============================================================ */

function bandingUkurBenar(g) {
  return ukurLuasBenar(g, State.bandingUkur[g.id]);
}

function relasiSemuaBenar() {
  return guidedQuizAllCorrect(RELASI, State.relasiPilih);
}

function buildKartuBanding(g, i) {
  var st = State.bandingUkur[g.id];
  var ukurOk = bandingUkurBenar(g);
  var q = RELASI[i];
  var relasiOk = State.relasiPilih[g.id] === g.correct;
  return (
    '<article class="ptg-banding" aria-label="' +
    esc(g.nama) +
    '">' +
    '<h3 class="ptg-banding__judul">' +
    esc(g.nama) +
    (relasiOk ? ' <span class="ptg-banding__jenis">— ' + esc(g.jenisLabel) + '</span>' : '') +
    '</h3>' +
    buildUkurLuas('banding-' + g.id, g, st, {
      judul: g.nama + ' pada kertas berpetak dengan persegi di setiap sisinya',
    }) +
    (ukurOk
      ? '<div class="ptg-banding__relasi">' +
        buildGuidedQuizList([q], State.relasiOrders, State.relasiPilih) +
        '</div>'
      : '') +
    '</article>'
  );
}

function renderDataBanding(container, fokus) {
  var D = DATA.dataBanding;
  var relasiOk = relasiSemuaBenar();
  var temuanOk = guidedQuizAllCorrect(TEMUAN_BANDING, State.temuanBandingPilih);
  var rerender = function (sel) {
    renderDataBanding(container, sel);
  };

  container.innerHTML =
    '<section aria-label="Pembanding">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    D.segitiga
      .map(function (g, i) {
        return buildDlPanel(buildKartuBanding(g, i));
      })
      .join('') +
    (relasiOk
      ? buildTemuanPanel(
          '💡 Apa temuanmu?',
          TEMUAN_BANDING,
          State.temuanBandingOrders,
          State.temuanBandingPilih
        )
      : '') +
    (relasiOk && temuanOk ? buildDlNextButton('bandingNextBtn', D.nextLabel) : '') +
    '</section>';

  D.segitiga.forEach(function (g) {
    bindUkurLuas(container, 'banding-' + g.id, g, State.bandingUkur[g.id], function (sel) {
      saveState();
      rerender(sel);
    });
  });
  bindGuidedQuizList(container, RELASI, State.relasiPilih, saveState, rerender);
  if (relasiOk) {
    bindGuidedQuizList(container, TEMUAN_BANDING, State.temuanBandingPilih, saveState, rerender);
  }
  bindNext('bandingNextBtn', 'dataBanding', 'uji');
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali Tabel Data dan taman pembanding, lalu pilih potongan lain.</p>'
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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah dugaan yang kamu temukan sendiri — dikenal sebagai teorema Pythagoras.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Penyelidikan</h3>' +
            '<p class="ptg-rumus" aria-label="a kuadrat ditambah b kuadrat sama dengan c kuadrat">a² + b² = c²</p>' +
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
   opsiSoalPythagoras membawa umpan balik sesuai miskonsepsinya.
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
      '<p class="dl-prompt__cerita"><span class="ptg-soal-ikon" aria-hidden="true">' +
      s.ikon +
      '</span> ' +
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
  var relasiBenar = RELASI.filter(function (q) {
    return State.relasiPilih[q.id] === q.correct;
  }).length;
  var benarUji = sortItemsCorrectCount(UJI_ITEMS, State.ujiStates);
  var benarTerap = State.terapkanExercises.filter(function (e) {
    return e.correct;
  }).length;

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="summary-grid">' +
        buildRingkasKartu(State.labPersegi.catat.length + '', 'Segitiga siku-siku dicatat di Lab') +
        buildRingkasKartu(relasiBenar + '/' + RELASI.length, 'Taman pembanding dianalisis') +
        buildRingkasKartu(benarUji + '/' + UJI_ITEMS.length, 'Pernyataan uji hipotesis benar') +
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
      fokusKembali('[data-opt-id="' + btn.dataset.optId + '"]');
    });
  });

  document.getElementById('refleksiSaveBtn').addEventListener('click', function () {
    var kosong = D.pertanyaan.some(function (q) {
      return !(State.refleksiAnswers[q.id] || '').trim();
    });
    if (kosong) {
      showNotice('Jawab dulu semua pertanyaan refleksi.');
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
    '<div class="ptg-contoh-grid">' +
    D.contoh
      .map(function (c) {
        return (
          '<div class="formula-card"><strong class="ptg-contoh-grid__num">' +
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
    'Dugaan a² + b² = c² yang dirumuskan murid menjadi bahan pembuktian teorema Pythagoras (mis. dengan menata ulang empat segitiga di dalam bingkai) pada pertemuan berikutnya.' +
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
  dataHitung: renderDataHitung,
  dataTabel: renderDataTabel,
  dataBanding: renderDataBanding,
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
