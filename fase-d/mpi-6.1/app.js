'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Kalimat Terbuka, Persamaan & PLSV — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen bersama: buildDiscoveryHead, buildTeacherNote,
       buildTpPanel, buildChoiceGroup, buildSortItems,
       buildGuidedQuizList, buildDlPanel, buildDlNextButton,
       buildFeedbackBox, buildLangkahUnsur (langkah isian berdiagnosa);
     • seksi 75 (kalimat terbuka, persamaan & PLSV): jenisKalimatMtk,
       kebenaranKalimatMtk, penyelesaianPlsv, periksaSoalKalimat,
       opsiSoalKalimat, buildKalimatWarna, buildNeraca, serta alat
       interaktif buildLabNeraca (Lab Neraca).

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan stimulasi, rumusan
   masalah, pertanyaan temuan, pemilahan kalimat di tahap olah data,
   pemilahan jenis & pernyataan verifikasi, bank kesimpulan, opsi uji
   terap, penilaian diri) DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder() / ensureSortStates(). Pengacakan dilakukan
   SEKALI saat state disiapkan (initExerciseArrays) lalu urutannya
   disimpan di State — bukan saat render — sehingga pilihan tidak
   melompat saat dirender ulang, tetapi teracak ulang untuk setiap
   murid dan setiap Reset. Soal uji terap juga dipilih acak dari bank
   (pilihSoalTerap) dan opsi pilihan gandanya dibangun engine
   (opsiSoalKalimat).

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi               (DL sintaks 1)
    6. Stage: Merumuskan Masalah      (DL sintaks 2)
    7. Stage: Lab Neraca              (DL sintaks 3)
    8. Stage: Olah Data ×3            (DL sintaks 4)
    9. Stage: Verifikasi              (DL sintaks 5)
   10. Stage: Generalisasi            (DL sintaks 6)
   11. Stage: Uji Terap
   12. Stage: Refleksi
   13. Stage: Selesai
   14. Router Render
   15. Helper UI (modal reset)
   16. Init
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
var STORAGE_KEY = 'mpi-d-6-1-plsv-v1';
var OLAH_STAGES = ['olahKalimat', 'olahPersamaan', 'olahPlsv'];
var LAB = DATA.koleksi.lab;

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

/* Label konteks: ikon + nama (Neraca, Warung, …). */
function buildKonteksTag(konteks) {
  var K = DATA.konteks[konteks];
  return (
    '<span class="plsv-konteks plsv-konteks--' +
    konteks +
    '"><span aria-hidden="true">' +
    K.ikon +
    '</span> ' +
    esc(K.nama) +
    '</span>'
  );
}

/* Butir pemilahan { id, teks, correct, explanation } dari kalimat matematika. */
function butirKalimat(b) {
  return {
    id: b.id,
    teks:
      buildKalimatWarna(b.kalimat) +
      (b.konteks ? '<span class="plsv-konteks-teks">' + esc(b.konteks) + '</span>' : ''),
    correct: b.correct,
    explanation: esc(b.explanation),
  };
}

var DUGAAN = DATA.stimulasi.dugaan.map(siapkanGuided);
var MASALAH_OPSI = opsiAman(DATA.masalah.opsi);

/* Konfigurasi tiap tahap olah data: temuan, pemilahan & langkah isian. */
var OLAH = {};
OLAH_STAGES.forEach(function (id, i) {
  var D = DATA[id];
  OLAH[id] = {
    prefix: ['ok', 'op', 'ov'][i],
    temuan: D.temuan.map(siapkanGuided),
    pilah: D.pilah.butir.map(butirKalimat),
    kategori: opsiAman(D.pilah.kategori),
    langkah: D.langkah.map(function (s) {
      return Object.assign({}, s, {
        label: esc(s.label),
        hints: (s.hints || []).map(esc),
        temuan: esc(s.temuan),
      });
    }),
    next: STAGES[STAGES.indexOf(id) + 1],
  };
});

var SEMUA_TEMUAN = OLAH_STAGES.reduce(function (acc, id) {
  return acc.concat(OLAH[id].temuan);
}, []);

var BAGIAN_ITEMS = DATA.verifikasi.bagian.map(butirKalimat);

var PERNYATAAN_ITEMS = DATA.verifikasi.pernyataan.map(function (p) {
  return { id: p.id, teks: esc(p.teks), correct: p.correct, explanation: esc(p.explanation) };
});

/* Soal pilihan ganda uji terap: opsi dibangun engine (opsiSoalKalimat). */
var OPSI_TERAP = {};
DATA.terapkan.soal.forEach(function (s) {
  if (s.type !== 'choice') return;
  var opsi = opsiSoalKalimat(s);
  OPSI_TERAP[s.id] = opsi;
  s.options = opsiAman(opsi);
  s.correct = 'baku';
});

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

  /* Tahap 2 — merumuskan masalah */
  masalahOrder: null,
  masalahPilihan: null,
  hipotesisTeks: '',

  /* Tahap 3 — Lab Neraca */
  labNeraca: null,

  /* Tahap 4a–c — olah data */
  temuanOrders: {},
  temuanPilih: {},
  pilahOlah: {},
  langkahSteps: {},

  /* Tahap 5 — verifikasi */
  bagianStates: {},
  bagianOrder: null,
  pernyataanStates: {},
  pernyataanOrder: null,

  /* Tahap 6 — generalisasi */
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
  ensureListOrders('dugaanOrders', DATA.stimulasi.dugaan);
  ensureMap('dugaanPilih');
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  ensureLabNeraca(ensureMap('labNeraca'), LAB);

  /* Tahap 4a–c — urutan butir & kategori pemilahan per tahap */
  var pilah = ensureMap('pilahOlah');
  var langkah = ensureMap('langkahSteps');
  OLAH_STAGES.forEach(function (id) {
    ensureSortStates(pilah, id, id + 'Order', OLAH[id].pilah, OLAH[id].kategori);
    ensureExerciseArray(langkah, id, OLAH[id].langkah, makeCekStep);
  });
  ensureListOrders('temuanOrders', SEMUA_TEMUAN);
  ensureMap('temuanPilih');

  /* Tahap 5 */
  ensureSortStates(State, 'bagianStates', 'bagianOrder', BAGIAN_ITEMS, DATA.verifikasi.kategori);
  ensureSortStates(
    State,
    'pernyataanStates',
    'pernyataanOrder',
    PERNYATAAN_ITEMS,
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

function buildPengantar(teks) {
  return buildDlPanel('<p style="margin:0;">' + esc(teks) + '</p>', 'panel--info');
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

function buildDaftarBernomor(list, raw) {
  return (
    '<ol class="objectives-list">' +
    list
      .map(function (r, i) {
        return (
          '<li><span class="objectives-list__num">' +
          (i + 1) +
          '</span><span>' +
          (raw ? r : esc(r)) +
          '</span></li>'
        );
      })
      .join('') +
    '</ol>'
  );
}

/* Neraca dengan keterangan di bawahnya. x null → digambar seimbang. */
function buildFigurNeraca(N, x, caption) {
  return (
    '<figure class="neraca-figur">' +
    buildNeraca(N.kiri, N.kanan, typeof x === 'number' ? x : null, { huruf: LAB.huruf }) +
    (caption ? '<figcaption>' + caption + '</figcaption>' : '') +
    '</figure>'
  );
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati neraca & kalimat lalu MENDUGA. Tidak dinilai.
   ============================================================ */

function buildKartuStimulasi(k) {
  return (
    '<article class="plsv-kartu">' +
    '<h3 class="plsv-kartu__judul"><span aria-hidden="true">' +
    k.ikon +
    '</span> ' +
    esc(k.judul) +
    '</h3>' +
    '<p class="plsv-kartu__teks">' +
    esc(k.teks) +
    '</p>' +
    (k.neraca ? buildFigurNeraca(k.neraca, null, 'Kotak oranye = x kg · beban ungu = 1 kg') : '') +
    (k.kalimat
      ? '<ol class="plsv-papan">' +
        k.kalimat
          .map(function (t) {
            return '<li>' + esc(t) + '</li>';
          })
          .join('') +
        '</ol>'
      : '') +
    '</article>'
  );
}

function buildDugaanList(list, orders, pilih) {
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
          attr: 'data-dugaan',
        }) +
        '</div>'
      );
    })
    .join('');
}

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var lengkap = semuaDipilih(DUGAAN, State.dugaanPilih);

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">⚖️ ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="plsv-kartu-grid">' +
        D.kartu.map(buildKartuStimulasi).join('') +
        '</div>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaanmu?</h3>' +
        buildDugaanList(DUGAAN, State.dugaanOrders, State.dugaanPilih) +
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
    (lengkap ? '' : ' aria-disabled="true"') +
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
    if (!semuaDipilih(DUGAAN, State.dugaanPilih)) {
      showNotice('Pilih dugaanmu untuk setiap pertanyaan sebelum melanjutkan.');
      return;
    }
    completeStage('stimulasi');
    navigateTo('masalah');
  });
}

/* ============================================================
   6. STAGE: MERUMUSKAN MASALAH  (Discovery Learning — sintaks 2)
   Memilih pertanyaan inti, lalu menulis hipotesis.
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
    buildPengantar(D.pengantar) +
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
    (benar
      ? buildDlPanel(
          '<div class="field-group" style="margin:0;">' +
            '<label for="hipotesisTeks">' +
            esc(D.hipotesisLabel) +
            '</label>' +
            '<textarea id="hipotesisTeks" class="input-textarea" placeholder="' +
            esc(D.hipotesisPlaceholder) +
            '">' +
            esc(State.hipotesisTeks) +
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

  var ta = document.getElementById('hipotesisTeks');
  if (ta) {
    ta.addEventListener('input', function () {
      State.hipotesisTeks = ta.value;
      saveState();
    });
  }

  var next = document.getElementById('masalahNextBtn');
  if (next) {
    next.addEventListener('click', function () {
      if (!State.hipotesisTeks.trim()) {
        showNotice('Tulis dugaan sementaramu (hipotesis) lebih dulu.');
        return;
      }
      completeStage('masalah');
      navigateTo('koleksi');
    });
  }
}

/* ============================================================
   7. STAGE: LAB NERACA  (Discovery Learning — sintaks 3)
   Murid menulis kalimat "=" untuk empat neraca seimbang, lalu menguji
   beberapa nilai x dan mencatat benar/salahnya di tabel pengamatan.
   ============================================================ */

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var lab = State.labNeraca;
  var lengkap = labNeracaLengkap(lab, LAB);

  container.innerHTML =
    '<section aria-label="Lab Neraca">' +
    buildHead(D) +
    buildPengantar(D.pengantar) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🔬 Lab Neraca</h3>' +
        '<details class="plsv-tips"><summary>💡 Tips</summary>' +
        '<ul>' +
        D.tips
          .map(function (t) {
            return '<li>' + esc(t) + '</li>';
          })
          .join('') +
        '</ul></details>' +
        buildLabNeraca('ln', lab, LAB)
    ) +
    (lengkap
      ? buildDlPanel(buildFeedbackBox('success', '✓', esc(D.selesaiTeks))) +
        buildDlNextButton('koleksiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindLabNeraca(container, 'ln', lab, LAB, function () {
    saveState();
    renderKoleksi(container);
  });
  bindNext('koleksiNextBtn', 'koleksi', 'olahKalimat');
}

/* ============================================================
   8. STAGE: OLAH DATA  (Discovery Learning — sintaks 4a–4c)
   Data (tabel Lab Neraca / kartu pembanding) → pertanyaan temuan →
   pemilahan kalimat → langkah isian berdiagnosa → ringkasan temuan.
   Ketiga tahap memakai satu renderer.
   ============================================================ */

function buildKartuPersamaan(k) {
  return (
    '<div class="plsv-banding__item">' +
    (k.neraca
      ? buildFigurNeraca(k.neraca, k.x)
      : '<div class="plsv-banding__kosong" aria-hidden="true">?</div>') +
    '<p class="plsv-banding__kalimat">' +
    buildKalimatWarna(k.kalimat) +
    '</p>' +
    '<p class="plsv-banding__ket">' +
    esc(k.keterangan) +
    '</p>' +
    '</div>'
  );
}

function buildDataOlah(stageId) {
  if (stageId === 'olahPersamaan') {
    return (
      '<div class="plsv-banding">' +
      DATA.olahPersamaan.kartu.map(buildKartuPersamaan).join('') +
      '</div>'
    );
  }
  return (
    '<div class="lab-neraca__tabel-wrap">' + buildTabelLabNeraca(State.labNeraca, LAB) + '</div>'
  );
}

function renderOlah(stageId, container) {
  var D = DATA[stageId];
  var C = OLAH[stageId];
  var pilahSt = State.pilahOlah[stageId];
  var steps = State.langkahSteps[stageId];
  var temuanOk = guidedQuizAllCorrect(C.temuan, State.temuanPilih);
  var pilahOk = temuanOk && sortItemsAllAnswered(C.pilah, pilahSt);
  var aktif = langkahAktif(steps);
  var langkahOk = pilahOk && aktif >= C.langkah.length;
  var rerender = function () {
    renderOlah(stageId, container);
  };

  var langkahHTML = C.langkah
    .slice(0, Math.min(aktif + 1, C.langkah.length))
    .map(function (step, i) {
      return buildLangkahUnsur(C.prefix + i, steps[i], step, i + 1, tampilIsianKalimat);
    })
    .join('');

  container.innerHTML =
    '<section aria-label="' +
    esc(D.kicker) +
    '">' +
    buildHead(D) +
    buildPengantar(D.pengantar) +
    buildDlPanel(
      '<h3 style="margin-top:0;">📋 ' +
        esc(D.judul) +
        '</h3>' +
        buildDataOlah(stageId) +
        '<h3>💡 Apa temuanmu?</h3>' +
        buildGuidedQuizList(C.temuan, State.temuanOrders, State.temuanPilih)
    ) +
    (temuanOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🗂️ ' +
            esc(D.pilah.judul) +
            '</h3>' +
            '<p>' +
            esc(D.pilah.pengantar) +
            '</p>' +
            buildSortItems(C.pilah, State.pilahOlah[stageId + 'Order'], C.kategori, pilahSt)
        )
      : '') +
    (pilahOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">✏️ Coba sendiri</h3>' +
            '<div class="dl-steps">' +
            langkahHTML +
            '</div>'
        )
      : '') +
    (langkahOk
      ? buildDlPanel(
          buildFeedbackBox('success', '📝', '<strong>Temuanmu:</strong> ' + esc(D.ringkasan))
        ) + buildDlNextButton(C.prefix + 'NextBtn', D.nextLabel)
      : '') +
    '</section>';

  if (!temuanOk) {
    bindGuidedQuizList(container, C.temuan, State.temuanPilih, saveState, rerender);
  }
  if (temuanOk) bindSortItems(container, C.pilah, pilahSt, saveState, rerender);
  if (pilahOk && !langkahOk) {
    bindLangkahUnsur(
      C.prefix + aktif,
      steps[aktif],
      C.langkah[aktif],
      saveState,
      rerender,
      periksaSoalKalimat
    );
  }
  bindNext(C.prefix + 'NextBtn', stageId, C.next);
}

function renderOlahKalimat(container) {
  renderOlah('olahKalimat', container);
}

function renderOlahPersamaan(container) {
  renderOlah('olahPersamaan', container);
}

function renderOlahPlsv(container) {
  renderOlah('olahPlsv', container);
}

/* ============================================================
   9. STAGE: VERIFIKASI  (Discovery Learning — sintaks 5)
   A. Pilah jenis kalimat baru
   B. Pernyataan selalu benar / kadang-kadang benar / salah
   C. Dugaan awal & hipotesis dibandingkan dengan temuan
   ============================================================ */

function buildDugaanRow(q, pilih) {
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
    '<span>Temuan: <strong>' +
    findOptionLabel(q.opsi, q.baku) +
    '</strong> — ' +
    esc(q.pembahasan) +
    '</span>' +
    '<span class="dugaan-row__verdict">' +
    (cocok ? '✓ Dugaanmu didukung temuan!' : '↻ Dugaanmu dikoreksi oleh temuan') +
    '</span>' +
    '</div>'
  );
}

function buildDugaanBanding() {
  return (
    '<div class="dugaan-compare">' +
    DUGAAN.map(function (q) {
      return buildDugaanRow(q, State.dugaanPilih[q.id]);
    }).join('') +
    '</div>' +
    (State.hipotesisTeks
      ? '<div class="plsv-hipotesis">' +
        '<span class="plsv-hipotesis__label">Hipotesismu di tahap 2</span>' +
        '<p>' +
        esc(State.hipotesisTeks) +
        '</p>' +
        '<span class="dl-caption">Apakah hipotesismu didukung temuan, perlu diperbaiki, atau ditolak? Diskusikan dengan pasanganmu.</span>' +
        '</div>'
      : '')
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var aOk = sortItemsAllAnswered(BAGIAN_ITEMS, State.bagianStates);
  var bOk = sortItemsAllAnswered(PERNYATAAN_ITEMS, State.pernyataanStates);
  var rerender = function () {
    renderVerifikasi(container);
  };

  container.innerHTML =
    '<section aria-label="Verifikasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p>' +
        esc(D.pengantarA) +
        '</p>' +
        buildSortItems(BAGIAN_ITEMS, State.bagianOrder, D.kategori, State.bagianStates)
    ) +
    (aOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            buildSortItems(
              PERNYATAAN_ITEMS,
              State.pernyataanOrder,
              D.opsiPernyataan,
              State.pernyataanStates
            )
        )
      : '') +
    (aOk && bOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' + esc(D.judulC) + '</h3>' + buildDugaanBanding()
        ) + buildDlNextButton('verifikasiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, BAGIAN_ITEMS, State.bagianStates, saveState, rerender);
  if (aOk) bindSortItems(container, PERNYATAAN_ITEMS, State.pernyataanStates, saveState, rerender);
  bindNext('verifikasiNextBtn', 'verifikasi', 'generalisasi');
}

/* ============================================================
   10. STAGE: GENERALISASI  (Discovery Learning — sintaks 6)
   ============================================================ */

function simpulanSemuaBenar() {
  return DATA.generalisasi.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function buildKalimatSimpulan(D, bank, benarSemua) {
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali temuanmu dari Lab Neraca, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');
}

function periksaSimpulan(container) {
  var D = DATA.generalisasi;
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
  else if (!simpulanSemuaBenar()) showNotice('Masih ada yang belum tepat. Periksa tanda merahnya.');
  renderGeneralisasi(container);
}

function renderGeneralisasi(container) {
  var D = DATA.generalisasi;
  var bank = orderByIds(D.bank, State.bankOrder);
  var benarSemua = simpulanSemuaBenar();

  container.innerHTML =
    '<section aria-label="Generalisasi">' +
    buildHead(D) +
    buildPengantar(D.instruksi) +
    buildDlPanel(
      buildKalimatSimpulan(D, bank, benarSemua) +
        (benarSemua
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah jawaban pertanyaan penyelidikan yang kamu temukan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman: Dari Kalimat Terbuka ke PLSV</h3>' +
            '<p class="plsv-contoh-besar">' +
            buildKalimatWarna(D.contoh) +
            '</p>' +
            buildDaftarBernomor(D.rangkuman, true),
          'panel--hero'
        ) + buildDlNextButton('generalisasiNextBtn', D.nextLabel, true)
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
      periksaSimpulan(container);
    });
  }

  bindNext('generalisasiNextBtn', 'generalisasi', 'terapkan');
}

/* ============================================================
   11. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal TERAP_SOAL yang
   dipilih acak. Isian diperiksa periksaSoalKalimat sehingga pesan
   salahnya berupa diagnosa miskonsepsi beserta cek substitusi; pilihan
   ganda memakai opsiSoalKalimat yang setiap pengecohnya membawa umpan
   diagnosa.
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
  inputPlaceholder: 'mis. 4, x = 4, atau 2x + 1 = 9',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  /* Teks mentah diteruskan; isian yang tak terbaca ditolak tanpa dihitung. */
  parseInput: function (val) {
    if (!val || !String(val).trim()) return { value: null, error: 'empty' };
    var d = periksaSoalKalimat(val, TERAP_SOAL[State.terapkanIdx]);
    if (d.kode === 'format') {
      return { value: null, error: 'invalid', message: d.pesan };
    }
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return periksaSoalKalimat(value, s).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' +
      esc(ex.userInput) +
      '</strong> — ' +
      esc(periksaSoalKalimat(ex.userInput, s).pesan)
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
      (s.neraca ? buildFigurNeraca(s.neraca, null) : '') +
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
   12. STAGE: REFLEKSI
   ============================================================ */

function hitungRekap() {
  var catat = LAB.situasi.map(function (s) {
    return State.labNeraca.catat[s.id];
  });
  var langkah = [];
  var pilahBenar = 0;
  var pilahTotal = 0;
  OLAH_STAGES.forEach(function (id) {
    langkah = langkah.concat(State.langkahSteps[id]);
    pilahBenar += sortItemsCorrectCount(OLAH[id].pilah, State.pilahOlah[id]);
    pilahTotal += OLAH[id].pilah.length;
  });
  var sekali = function (list) {
    return list.filter(function (s) {
      return s.done && s.attempts === 1;
    }).length;
  };
  return {
    catat: sekali(catat) + '/' + catat.length,
    langkah: sekali(langkah) + '/' + langkah.length,
    pilah:
      pilahBenar +
      sortItemsCorrectCount(BAGIAN_ITEMS, State.bagianStates) +
      sortItemsCorrectCount(PERNYATAAN_ITEMS, State.pernyataanStates) +
      '/' +
      (pilahTotal + BAGIAN_ITEMS.length + PERNYATAAN_ITEMS.length),
    terap:
      State.terapkanExercises.filter(function (e) {
        return e.correct;
      }).length +
      '/' +
      TERAP_SOAL.length,
  };
}

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var R = hitungRekap();

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="summary-grid">' +
        buildRingkasKartu(R.catat, 'Kalimat Lab Neraca tepat pada percobaan pertama') +
        buildRingkasKartu(R.langkah, 'Isian olah data tepat pada percobaan pertama') +
        buildRingkasKartu(R.pilah, 'Pemilahan kalimat & pernyataan benar') +
        buildRingkasKartu(R.terap, 'Uji terap benar') +
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
   13. STAGE: SELESAI
   ============================================================ */

/* Kartu contoh: kalimat, jenisnya, dan nilai kebenaran / penyelesaian. */
function buildContohKalimat(c) {
  var jenis = jenisKalimatMtk(c.kalimat);
  var kebenaran = kebenaranKalimatMtk(c.kalimat);
  var sol = penyelesaianPlsv(c.kalimat);
  var huruf = ciriKalimatMtk(c.kalimat).variabel[0];
  var baris = function (label, isi) {
    return '<dt>' + label + '</dt><dd>' + esc(isi) + '</dd>';
  };
  var nilai;
  if (sol !== null) nilai = baris('Penyelesaian', huruf + ' = ' + formatAngkaAljabar(sol));
  else if (kebenaran === 'terbuka')
    nilai = baris('Nilai kebenaran', 'bergantung pada nilai variabel');
  else nilai = baris('Nilai kebenaran', kebenaran);
  return (
    '<div class="formula-card plsv-contoh">' +
    '<span class="formula-card__label">' +
    esc(c.keterangan) +
    '</span>' +
    '<strong class="plsv-contoh__kalimat">' +
    buildKalimatWarna(c.kalimat) +
    '</strong>' +
    '<dl class="plsv-contoh__ciri">' +
    baris('Jenis', DATA.namaJenis[jenis]) +
    nilai +
    '</dl>' +
    '</div>'
  );
}

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
    '<div class="plsv-contoh-grid">' +
    D.contoh.map(buildContohKalimat).join('') +
    '</div>' +
    '<div class="panel panel--hero done-card__list">' +
    '<h3 style="margin-top:0;">Yang sudah kamu capai</h3>' +
    buildDaftarBernomor(D.capaian) +
    '</div>' +
    '<div class="feedback-box feedback-box--info done-card__note">' +
    '<span class="feedback-box__icon">📌</span>' +
    '<div class="feedback-box__body">' +
    '<strong>Catatan untuk Guru:</strong><br>' +
    'Rekap pada tahap Refleksi adalah indikator latihan digital, bukan nilai akhir. ' +
    'Kemampuan murid menjelaskan arti tanda "=" dengan neraca dan memeriksa penyelesaian dengan substitusi tetap menjadi bahan penilaian utama. Teknik menyelesaikan PLSV dibahas pada pertemuan berikutnya.' +
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
   14. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  stimulasi: renderStimulasi,
  masalah: renderMasalah,
  koleksi: renderKoleksi,
  olahKalimat: renderOlahKalimat,
  olahPersamaan: renderOlahPersamaan,
  olahPlsv: renderOlahPlsv,
  verifikasi: renderVerifikasi,
  generalisasi: renderGeneralisasi,
  terapkan: renderTerapkan,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  var fn = RENDERERS[State.currentStage] || renderStimulasi;
  fn(container);
}

/* ============================================================
   15. HELPER UI — MODAL RESET
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
   16. INIT
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
