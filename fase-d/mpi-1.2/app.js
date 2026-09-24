'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Membandingkan & Mengurutkan Bilangan Bulat
   Fase D — SMP Kelas 7

   Utilitas bersama (esc, formatNumber, shuffleArray, showNotice,
   buildFeedbackBox, createStageMachine, createExerciseStage,
   createStore, garis bilangan buildNumberLinePicker, penempatan titik
   buildNumberLinePlacement, lambang perbandingan
   buildCompareSymbolChoice, susun kartu buildTapOrder, pertanyaan
   penuntun buildGuidedQuizList, serta komponen Cooperative Learning
   assignCoopRoles/buildCoopRoleBar/buildCoopTeamCard/coopAwardLevel)
   berada di shared/engine.js.

   Alur tahap mengikuti sintaks Cooperative Learning (STAD); lihat
   komentar kepala pada data.js untuk pemetaannya.

   Seluruh pilihan jawaban DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder()/ensureSortStates()/ensureTapOrderState().
   Pengacakan dilakukan SEKALI saat state disiapkan
   (initExerciseArrays), lalu urutannya disimpan di State — bukan saat
   render. Dengan begitu pilihan tidak melompat-lompat setiap kali
   tahap dirender ulang, tetapi teracak ulang untuk setiap kelompok dan
   setiap kali Reset. Pasangan bilangan Misi 1, urutan bilangan yang
   ditempatkan, kartu Misi 2, dan urutan soal kuis juga diacak dengan
   cara yang sama.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi        (CL fase 1)
    6. Stage: Temukan Aturan   (CL fase 2)
    7. Stage: Bentuk Tim       (CL fase 3)
    8. Stage: Misi Tim         (CL fase 4)
    9. Stage: Kuis Individu    (CL fase 5)
   10. Stage: Penghargaan      (CL fase 6)
   11. Stage: Refleksi
   12. Stage: Selesai
   13. Router Render
   14. Helper UI (modal reset)
   15. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'informasi',
  'tim',
  'misi',
  'evaluasi',
  'penghargaan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Orientasi',
  'Temukan Aturan',
  'Bentuk Tim',
  'Misi Tim',
  'Kuis Individu',
  'Penghargaan',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-d-1-2-banding-urut-coop-v1';

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Tahap 1 — orientasi */
  orientasiOrder: null,
  orientasiPilihan: null,
  orientasiAlasan: '',

  /* Tahap 2 — temukan aturan */
  jelajahPicks: [],
  jelajahCount: 0,
  infoOrders: {},
  infoPilih: {},

  /* Tahap 3 — bentuk tim */
  timNama: '',
  timInput: [],
  timAnggota: [],
  timSepakat: {},

  /* Tahap 4 — misi tim */
  misiTab: 0,
  m1Pairs: null,
  m1Idx: 0,
  m1: {},
  m2: {},
  m3States: {},
  m3Order: null,
  m3Jubir: '',

  /* Tahap 5 — kuis individu */
  evalOrder: null,
  evalIdx: 0,
  evalExercises: [],

  /* Tahap 6 — penghargaan */
  pujian: '',

  /* Tahap 7 — refleksi */
  refleksiAnswers: {},
  kerjaOrders: {},
  kerjaPilih: {},
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

function ensureObject(obj, key) {
  if (!obj[key] || typeof obj[key] !== 'object' || Array.isArray(obj[key])) obj[key] = {};
  return obj[key];
}

/* Pasangan Misi 1 yang terpilih (id dari bank) masih valid? */
function m1PairsValid() {
  var M = DATA.misi.m1;
  var ids = optionIds(M.bank);
  return (
    Array.isArray(State.m1Pairs) &&
    State.m1Pairs.length === M.banyak &&
    State.m1Pairs.every(function (id) {
      return ids.indexOf(id) !== -1;
    })
  );
}

/* Kartu Misi 2 dan urutan benarnya. */
function m2Cards(set) {
  return set.data.map(function (d) {
    return {
      id: d.id,
      label:
        '<span class="kartu-nilai"><span class="kartu-nilai__nama">' +
        esc(d.nama) +
        '</span><strong>' +
        fmt(d.nilai) +
        '</strong></span>',
      aria: d.nama + ' ' + fmt(d.nilai) + ' ' + set.satuan,
    };
  });
}

function m2Answer(set) {
  return set.data
    .slice()
    .sort(function (x, y) {
      return set.arah === 'naik' ? x.nilai - y.nilai : y.nilai - x.nilai;
    })
    .map(function (d) {
      return d.id;
    });
}

/* Soal kuis dalam urutan acak tersimpan. */
function evalSoal() {
  return orderByIds(DATA.evaluasi.soal, State.evalOrder);
}

function evalExercisesValid(soal) {
  return (
    Array.isArray(State.evalExercises) &&
    State.evalExercises.length === soal.length &&
    State.evalExercises.every(function (ex, i) {
      return ex && ex.soalId === soal[i].id;
    })
  );
}

/*
 * Menyiapkan seluruh state per-soal DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1 */
  ensureShuffledOrder(State, 'orientasiOrder', DATA.orientasi.opsi);

  /* Tahap 2 */
  if (!Array.isArray(State.jelajahPicks)) State.jelajahPicks = [];
  if (typeof State.jelajahCount !== 'number') State.jelajahCount = 0;
  ensureObject(State, 'infoOrders');
  ensureObject(State, 'infoPilih');
  DATA.informasi.tanya.forEach(function (q) {
    ensureShuffledOrder(State.infoOrders, q.id, q.opsi);
  });

  /* Tahap 3 */
  var maks = DATA.tim.maksAnggota;
  if (!Array.isArray(State.timInput) || State.timInput.length !== maks) {
    State.timInput = [];
    for (var i = 0; i < maks; i++) State.timInput.push('');
  }
  if (!Array.isArray(State.timAnggota)) State.timAnggota = [];
  ensureObject(State, 'timSepakat');

  /* Tahap 4 — Misi 1: pasangan diambil acak dari bank */
  var M1 = DATA.misi.m1;
  if (!m1PairsValid()) {
    State.m1Pairs = shuffleArray(optionIds(M1.bank)).slice(0, M1.banyak);
    State.m1 = {};
    State.m1Idx = 0;
  }
  ensureObject(State, 'm1');
  State.m1Pairs.forEach(function (id) {
    var st = ensureObject(State.m1, id);
    ensureNumberLinePlacementState(st, 'place');
    ensureShuffledOrder(st, 'placeOrder', [{ id: 'a' }, { id: 'b' }]);
    ensureShuffledOrder(st, 'symOrder', COMPARE_SYMBOLS);
    if (!st.sym || typeof st.sym !== 'object') st.sym = { chosen: null, wrong: 0 };
  });
  if (State.m1Idx < 0 || State.m1Idx >= M1.banyak) State.m1Idx = 0;

  /* Misi 2 */
  ensureObject(State, 'm2');
  DATA.misi.m2.set.forEach(function (set) {
    var st = ensureObject(State.m2, set.id);
    ensureNumberLinePlacementState(st, 'place');
    ensureShuffledOrder(st, 'placeOrder', set.data);
    ensureTapOrderState(st, 'order', m2Cards(set), m2Answer(set));
  });

  /* Misi 3 */
  ensureSortStates(State, 'm3States', 'm3Order', DATA.misi.m3.pernyataan, DATA.misi.m3.opsi);
  if (State.misiTab < 0 || State.misiTab > 2) State.misiTab = 0;

  /* Tahap 5 — urutan soal & urutan opsi tiap soal */
  ensureShuffledOrder(State, 'evalOrder', DATA.evaluasi.soal);
  var soal = evalSoal();
  if (!evalExercisesValid(soal)) {
    State.evalExercises = soal.map(function (s) {
      return {
        soalId: s.id,
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
    State.evalIdx = 0;
  }
  if (State.evalIdx < 0 || State.evalIdx >= soal.length) State.evalIdx = 0;

  /* Tahap 7 */
  ensureObject(State, 'refleksiAnswers');
  ensureObject(State, 'kerjaOrders');
  ensureObject(State, 'kerjaPilih');
  DATA.refleksi.kerja.forEach(function (k) {
    ensureShuffledOrder(State.kerjaOrders, k.id, DATA.refleksi.kerjaOpsi);
  });
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

/* Kepala tahap (kicker + chip sintaks) + catatan peran guru. */
function buildHead(D) {
  return buildDiscoveryHead(D.kicker, D.goal, D.syntax) + buildTeacherNote(D.guru);
}

/* Notasi baku dengan lambang minus tipografis (−). */
function fmt(n) {
  return formatNumber(n, '−');
}

/* Memasang tombol lanjut yang menyelesaikan tahap ini lalu pindah tahap. */
function bindNext(id, stageId, nextStageId, guard) {
  var btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', function () {
    if (guard && !guard()) return;
    completeStage(stageId);
    navigateTo(nextStageId);
  });
}

/* Textarea yang langsung tersimpan ke obj[key]. */
function bindTextarea(id, obj, key) {
  var ta = document.getElementById(id);
  if (!ta) return;
  ta.addEventListener('input', function () {
    obj[key] = ta.value;
    saveState();
  });
}

function buildTextarea(id, label, value, placeholder) {
  return (
    '<div class="field-group">' +
    '<label for="' +
    id +
    '">' +
    esc(label) +
    '</label>' +
    '<textarea id="' +
    id +
    '" class="input-textarea" placeholder="' +
    esc(placeholder || '') +
    '">' +
    esc(value || '') +
    '</textarea>' +
    '</div>'
  );
}

function kartuRingkas(val, label) {
  return (
    '<div class="summary-card"><div class="summary-card__val">' +
    val +
    '</div><div class="summary-card__label">' +
    esc(label) +
    '</div></div>'
  );
}

/* Kalimat arah: "−2 berada di sebelah kanan −7". */
function kalimatLetak(a, b) {
  if (a === b) return fmt(a) + ' dan ' + fmt(b) + ' menempati titik yang sama';
  return fmt(a) + ' berada di sebelah ' + (a > b ? 'kanan' : 'kiri') + ' ' + fmt(b);
}

/* ============================================================
   5. STAGE: ORIENTASI  (Cooperative Learning — fase 1)
   Menyampaikan tujuan & memotivasi. Dugaan tidak dinilai.
   ============================================================ */

function renderOrientasi(container) {
  var D = DATA.orientasi;

  container.innerHTML =
    '<section aria-label="Orientasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🎯 Tujuan Kita</h2>' +
        '<p>' +
        esc(D.tujuan) +
        '</p>' +
        '<h3>Aku berhasil jika …</h3>' +
        '<ol class="objectives-list">' +
        D.kriteria
          .map(function (k, i) {
            return (
              '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + esc(k) + '</li>'
            );
          })
          .join('') +
        '</ol>',
      'panel--info'
    ) +
    buildDlPanel(
      '<h2 style="margin-top:0;">📻 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<div class="cuaca-grid">' +
        D.tempat
          .map(function (t) {
            return (
              '<div class="cuaca-card">' +
              '<span class="cuaca-card__ikon" aria-hidden="true">' +
              t.ikon +
              '</span>' +
              '<span class="cuaca-card__nama">' +
              esc(t.nama) +
              '</span>' +
              '<span class="cuaca-card__suhu">' +
              fmt(t.suhu) +
              ' °C</span>' +
              '</div>'
            );
          })
          .join('') +
        '</div>',
      'panel--hero'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.orientasiOrder, { chosen: State.orientasiPilihan }) +
        '<div style="margin-top:var(--space-5);">' +
        buildTextarea(
          'orientasiAlasan',
          D.alasanLabel,
          State.orientasiAlasan,
          D.alasanPlaceholder
        ) +
        '</div>' +
        buildFeedbackBox('info', '🔎', esc(D.catatan))
    ) +
    buildDlNextButton('orientasiNextBtn', D.nextLabel) +
    '</section>';

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.orientasiPilihan = btn.dataset.optId;
      saveState();
      renderOrientasi(container);
    });
  });

  bindTextarea('orientasiAlasan', State, 'orientasiAlasan');

  bindNext('orientasiNextBtn', 'orientasi', 'informasi', function () {
    if (!State.orientasiPilihan) {
      showNotice('Pilih dugaanmu sebelum melanjutkan.');
      return false;
    }
    return true;
  });
}

/* ============================================================
   6. STAGE: TEMUKAN ATURAN  (Cooperative Learning — fase 2)
   Jelajah garis bilangan → pertanyaan penuntun → kartu aturan
   → cek dugaan tahap 1.
   ============================================================ */

function buildJelajahHasil() {
  var p = State.jelajahPicks;
  if (p.length === 0) {
    return buildFeedbackBox('info', '👆', 'Ketuk titik pertama pada garis bilangan.');
  }
  if (p.length === 1) {
    return buildFeedbackBox(
      'info',
      '👆',
      'Titik pertama: <strong>' + fmt(p[0]) + '</strong>. Sekarang ketuk titik kedua.'
    );
  }
  var a = p[0];
  var b = p[1];
  var sym = compareSymbolId(a, b);
  var arti =
    sym === 'eq'
      ? 'Keduanya sama.'
      : '<strong>' +
        fmt(Math.max(a, b)) +
        '</strong> lebih besar karena letaknya lebih kanan; <strong>' +
        fmt(Math.min(a, b)) +
        '</strong> lebih kecil.';
  return (
    buildCompareSentence(a, b, sym) +
    buildFeedbackBox('success', '💡', esc(kalimatLetak(a, b)) + '. ' + arti)
  );
}

function buildDugaanCek() {
  var D = DATA.orientasi;
  var cocok = State.orientasiPilihan === D.dugaanBenar;
  var marks = D.tempat.map(function (t) {
    return { value: t.suhu, label: fmt(t.suhu), tone: t.id === D.dugaanBenar ? 'target' : null };
  });
  return (
    buildNumberLinePicker('dugaanLine', {
      min: -10,
      max: 5,
      interactive: false,
      sides: true,
      marks: marks,
      aria: 'Garis bilangan suhu: −8, −3, −1, dan 4. Titik −8 paling kiri.',
    }) +
    '<div class="dugaan-compare">' +
    '<div class="dugaan-row' +
    (cocok ? ' dugaan-row--ok' : '') +
    '">' +
    '<span class="dugaan-row__title">Tempat paling dingin</span>' +
    '<span>Dugaanmu: <strong>' +
    (findOptionLabel(D.opsi, State.orientasiPilihan) || '—') +
    '</strong></span>' +
    '<span>Menurut garis bilangan: <strong>' +
    findOptionLabel(D.opsi, D.dugaanBenar) +
    '</strong> — titiknya paling kiri, jadi suhunya paling kecil.</span>' +
    '<span class="dugaan-row__verdict">' +
    (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh garis bilangan') +
    '</span>' +
    '</div>' +
    '</div>'
  );
}

function renderInformasi(container) {
  var D = DATA.informasi;
  var cukupJelajah = State.jelajahCount >= D.jelajahMin;
  var tanyaSelesai = guidedQuizAllCorrect(D.tanya, State.infoPilih);
  var rerender = function () {
    renderInformasi(container);
    centerNumberLines(container);
  };
  var picks = State.jelajahPicks;
  var marks =
    picks.length === 2
      ? picks.map(function (v) {
          return { value: v, label: fmt(v) };
        })
      : [];

  container.innerHTML =
    '<section aria-label="Temukan Aturan">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🔭 ' +
        esc(D.jelajahJudul) +
        '</h3>' +
        '<p class="dl-caption">' +
        esc(D.jelajahInstruksi) +
        '</p>' +
        buildNumberLinePicker('jelajahLine', {
          min: D.min,
          max: D.max,
          marks: marks,
          selected: picks.length === 1 ? picks[0] : null,
          sides: true,
        }) +
        buildJelajahHasil() +
        '<p class="dl-caption" style="margin-top:var(--space-3);">Perbandingan yang sudah dicoba: <strong>' +
        State.jelajahCount +
        '</strong>' +
        (cukupJelajah ? ' ✓' : ' (minimal ' + D.jelajahMin + ')') +
        '</p>'
    ) +
    (cukupJelajah
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🧭 ' +
            esc(D.tanyaJudul) +
            '</h3>' +
            buildGuidedQuizList(D.tanya, State.infoOrders, State.infoPilih)
        )
      : '') +
    (cukupJelajah && tanyaSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📋 ' +
            esc(D.aturanJudul) +
            '</h3>' +
            '<ol class="objectives-list">' +
            D.aturan
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
        ) +
        buildDlPanel(
          '<h3 style="margin-top:0;">' + esc(D.dugaanJudul) + '</h3>' + buildDugaanCek()
        ) +
        buildDlNextButton('informasiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindNumberLinePicker(container, 'jelajahLine', function (v) {
    if (State.jelajahPicks.length >= 2) State.jelajahPicks = [];
    State.jelajahPicks.push(v);
    if (State.jelajahPicks.length === 2) State.jelajahCount += 1;
    saveState();
    rerender();
  });
  bindGuidedQuizList(container, D.tanya, State.infoPilih, saveState, rerender);
  bindNext('informasiNextBtn', 'informasi', 'tim');
}

/* ============================================================
   7. STAGE: BENTUK TIM  (Cooperative Learning — fase 3)
   ============================================================ */

function timNamaTerisi() {
  return State.timInput
    .map(function (m) {
      return String(m || '').trim();
    })
    .filter(function (m) {
      return m;
    });
}

/* Daftar anggota berubah setelah peran diacak? */
function timBerubah() {
  var a = timNamaTerisi().slice().sort().join('|');
  var b = State.timAnggota.slice().sort().join('|');
  return a !== b;
}

function timSepakatSemua() {
  return DATA.tim.kesepakatan.every(function (k) {
    return !!State.timSepakat[k.id];
  });
}

function renderTim(container) {
  var D = DATA.tim;
  var sudahAcak = State.timAnggota.length > 0;

  var anggotaHTML = State.timInput
    .map(function (v, i) {
      return (
        '<input type="text" class="input-text" id="timAnggota' +
        i +
        '" data-anggota="' +
        i +
        '" maxlength="24" autocomplete="off" value="' +
        esc(v) +
        '" placeholder="Anggota ' +
        (i + 1) +
        (i < D.minAnggota ? '' : ' (opsional)') +
        '" aria-label="Nama anggota ' +
        (i + 1) +
        '">'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Bentuk Tim">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="field-group">' +
        '<label for="timNama">' +
        esc(D.namaTimLabel) +
        '</label>' +
        '<input type="text" class="input-text" id="timNama" maxlength="30" autocomplete="off" value="' +
        esc(State.timNama) +
        '" placeholder="' +
        esc(D.namaTimPlaceholder) +
        '">' +
        '</div>' +
        '<fieldset class="field-group tim-anggota">' +
        '<legend>' +
        esc(D.anggotaLabel) +
        '</legend>' +
        '<div class="tim-anggota__grid">' +
        anggotaHTML +
        '</div>' +
        '</fieldset>' +
        '<fieldset class="field-group sepakat">' +
        '<legend>' +
        esc(D.kesepakatanJudul) +
        '</legend>' +
        D.kesepakatan
          .map(function (k) {
            return (
              '<label class="sepakat-item"><input type="checkbox" data-sepakat="' +
              k.id +
              '"' +
              (State.timSepakat[k.id] ? ' checked' : '') +
              '><span>' +
              esc(k.teks) +
              '</span></label>'
            );
          })
          .join('') +
        '</fieldset>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn--outline-primary" id="timAcakBtn">' +
        esc(sudahAcak ? D.acakUlangLabel : D.acakLabel) +
        '</button>' +
        '</div>'
    ) +
    (sudahAcak
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.peranJudul) +
            ' (Misi 1)</h3>' +
            buildCoopTeamCard(State.timNama, State.timAnggota, 0) +
            '<p class="dl-caption" style="margin-top:var(--space-3);">🔄 ' +
            esc(D.peranCatatan) +
            '</p>'
        ) + buildDlNextButton('timNextBtn', D.nextLabel)
      : '') +
    '</section>';

  var namaInp = document.getElementById('timNama');
  namaInp.addEventListener('input', function () {
    State.timNama = namaInp.value;
    saveState();
  });

  container.querySelectorAll('[data-anggota]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      State.timInput[+inp.dataset.anggota] = inp.value;
      saveState();
    });
    /* Nama anggota diubah setelah peran diacak → peran perlu diacak ulang. */
    inp.addEventListener('change', function () {
      if (State.timAnggota.length && timBerubah()) {
        State.timAnggota = [];
        saveState();
        showNotice('Daftar anggota berubah. Tekan "Acak Peran" lagi.');
        renderTim(container);
      }
    });
  });

  container.querySelectorAll('[data-sepakat]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      State.timSepakat[cb.dataset.sepakat] = cb.checked;
      saveState();
    });
  });

  document.getElementById('timAcakBtn').addEventListener('click', function () {
    if (!State.timNama.trim()) {
      showNotice('Tulis nama tim kalian dulu.');
      return;
    }
    if (timNamaTerisi().length < D.minAnggota) {
      showNotice('Tulis minimal ' + D.minAnggota + ' nama anggota.');
      return;
    }
    State.timAnggota = assignCoopRoles(State.timInput);
    saveState();
    renderTim(container);
  });

  bindNext('timNextBtn', 'tim', 'misi', function () {
    if (!timSepakatSemua()) {
      showNotice('Centang semua kesepakatan tim sebelum memulai misi.');
      return false;
    }
    return true;
  });
}

/* ============================================================
   8. STAGE: MISI TIM  (Cooperative Learning — fase 4)
   Tiga misi dalam tab; peran bergeser setiap misi.
   ============================================================ */

function m1Pair(id) {
  return DATA.misi.m1.bank.filter(function (p) {
    return p.id === id;
  })[0];
}

function m1PairBenar(id) {
  var p = m1Pair(id);
  return State.m1[id].sym.chosen === compareSymbolId(p.a, p.b);
}

function m1Selesai() {
  return State.m1Pairs.every(m1PairBenar);
}

/* Pasangan yang lambangnya benar pada percobaan pertama. */
function m1SkorSekali() {
  return State.m1Pairs.filter(function (id) {
    return m1PairBenar(id) && !State.m1[id].sym.wrong;
  }).length;
}

function m2Selesai() {
  return DATA.misi.m2.set.every(function (set) {
    return State.m2[set.id].order.correct;
  });
}

function m2SkorSekali() {
  return DATA.misi.m2.set.filter(function (set) {
    var o = State.m2[set.id].order;
    return o.correct && o.attempts === 1;
  }).length;
}

function m3Selesai() {
  return sortItemsAllAnswered(DATA.misi.m3.pernyataan, State.m3States);
}

function misiSkor() {
  return {
    benar:
      m1SkorSekali() +
      m2SkorSekali() +
      sortItemsCorrectCount(DATA.misi.m3.pernyataan, State.m3States),
    maks: DATA.misi.m1.banyak + DATA.misi.m2.set.length + DATA.misi.m3.pernyataan.length,
  };
}

function m1Items(pair, st) {
  return orderByIds(
    [
      { id: 'a', value: pair.a, teks: pair.ta },
      { id: 'b', value: pair.b, teks: pair.tb },
    ],
    st.placeOrder
  );
}

function buildMisi1(rerender) {
  var M = DATA.misi.m1;
  var D = DATA.misi;
  var idx = State.m1Idx;
  var pair = m1Pair(State.m1Pairs[idx]);
  var st = State.m1[pair.id];
  var items = m1Items(pair, st);
  var placed = numberLinePlacementDone(items, st.place);
  var benarId = compareSymbolId(pair.a, pair.b);
  var benar = st.sym.chosen === benarId;

  var statuses = State.m1Pairs.map(function (id) {
    if (!m1PairBenar(id)) return null;
    return State.m1[id].sym.wrong ? 'incorrect' : 'correct';
  });

  var symFeedback = '';
  if (st.sym.chosen && benar) {
    symFeedback = buildFeedbackBox(
      'success',
      '✓',
      '<strong>' +
        fmt(pair.a) +
        ' ' +
        esc(compareSymbolText(benarId)) +
        ' ' +
        fmt(pair.b) +
        '</strong> — ' +
        esc(kalimatLetak(pair.a, pair.b)) +
        '. ' +
        esc(pair.simpulan)
    );
  } else if (st.sym.chosen) {
    symFeedback = buildFeedbackBox(
      'warning',
      '💭',
      'Belum tepat. Lihat garis bilangan: titik mana yang lebih kanan? ' +
        (st.sym.wrong >= 2
          ? esc(kalimatLetak(pair.a, pair.b)) + '.'
          : 'Diskusikan lagi bersama tim.')
    );
  }

  var nav = '';
  if (benar) {
    nav =
      idx < M.banyak - 1
        ? '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="m1NextPair">Pasangan berikutnya →</button></div>'
        : buildFeedbackBox(
            'success',
            '🎉',
            '<strong>Misi 1 tuntas!</strong> Lanjutkan ke Misi 2 lewat tab di atas.'
          );
  }

  var html =
    '<p class="dl-caption">' +
    esc(M.instruksi) +
    '</p>' +
    buildProgressDots(M.banyak, idx, statuses) +
    '<div class="misi-konteks"><span class="misi-konteks__ikon" aria-hidden="true">' +
    pair.ikon +
    '</span><p>' +
    esc(pair.konteks) +
    '</p></div>' +
    '<h4 class="misi-langkah"><span class="dl-step__num">1</span>Tempatkan kedua bilangan</h4>' +
    buildNumberLinePlacement('m1Line', items, st.place, {
      min: D.min,
      max: D.max,
      doneText: '<strong>Kedua bilangan sudah di tempatnya.</strong> Sekarang bandingkan letaknya.',
    }) +
    (placed
      ? '<h4 class="misi-langkah"><span class="dl-step__num">2</span>Pilih lambang yang tepat</h4>' +
        buildCompareSentence(pair.a, pair.b, benar ? benarId : null) +
        buildCompareSymbolChoice(pair.a, pair.b, st.symOrder, st.sym, { group: pair.id }) +
        symFeedback +
        nav
      : '');

  return {
    html: html,
    bind: function (container) {
      bindNumberLinePlacement(container, 'm1Line', items, st.place, saveState, rerender);
      bindCompareSymbolChoice(
        container,
        function (g) {
          var p = m1Pair(g);
          return p ? [p.a, p.b] : null;
        },
        function (g) {
          return State.m1[g] && State.m1[g].sym;
        },
        saveState,
        rerender
      );
      var next = document.getElementById('m1NextPair');
      if (next) {
        next.addEventListener('click', function () {
          State.m1Idx += 1;
          saveState();
          rerender();
        });
      }
    },
  };
}

function m2Items(set, st) {
  return orderByIds(set.data, st.placeOrder).map(function (d) {
    return { value: d.nilai, teks: d.nama, mark: d.nama };
  });
}

function buildMisi2(rerender) {
  var M = DATA.misi.m2;
  var D = DATA.misi;
  var binds = [];
  var html = '<p class="dl-caption">' + esc(M.instruksi) + '</p>';

  for (var i = 0; i < M.set.length; i++) {
    var set = M.set[i];
    var st = State.m2[set.id];
    var items = m2Items(set, st);
    var placed = numberLinePlacementDone(items, st.place);
    var answer = m2Answer(set);
    var byId = {};
    set.data.forEach(function (d) {
      byId[d.id] = d;
    });
    var tulis = answer
      .map(function (id) {
        return fmt(byId[id].nilai);
      })
      .join(' ' + set.separator + ' ');

    html +=
      '<div class="misi-set">' +
      '<h4 style="margin-top:0;">' +
      set.ikon +
      ' ' +
      esc(set.judul) +
      '</h4>' +
      '<p>' +
      set.cerita +
      '</p>' +
      '<h4 class="misi-langkah"><span class="dl-step__num">1</span>Tempatkan pada garis bilangan</h4>' +
      buildNumberLinePlacement('m2Line' + i, items, st.place, {
        min: D.min,
        max: D.max,
        doneText:
          '<strong>Semua titik sudah di tempatnya.</strong> Perhatikan urutan titik dari kiri ke kanan.',
      }) +
      (placed
        ? '<h4 class="misi-langkah"><span class="dl-step__num">2</span>Susun kartu</h4>' +
          buildTapOrder('m2Order' + i, m2Cards(set), st.order, {
            answer: answer,
            startLabel: set.startLabel,
            endLabel: set.endLabel,
            separator: set.separator,
            successText:
              '<strong>Urutannya tepat!</strong> Ditulis: <strong>' +
              tulis +
              '</strong>. ' +
              set.temuan,
          })
        : '') +
      '</div>';

    binds.push(
      (function (idx, st, items, answer) {
        return function (container) {
          bindNumberLinePlacement(container, 'm2Line' + idx, items, st.place, saveState, rerender);
          bindTapOrder(container, 'm2Order' + idx, st.order, answer, saveState, rerender);
        };
      })(i, st, items, answer)
    );

    /* Set berikutnya dibuka setelah set ini tersusun benar. */
    if (!st.order.correct) break;
  }

  if (m2Selesai()) {
    html += buildFeedbackBox(
      'success',
      '🎉',
      '<strong>Misi 2 tuntas!</strong> Lanjutkan ke Misi 3 lewat tab di atas.'
    );
  }

  return {
    html: html,
    bind: function (container) {
      binds.forEach(function (b) {
        b(container);
      });
    },
  };
}

function buildMisi3(rerender) {
  var M = DATA.misi.m3;
  var html =
    '<p class="dl-caption">' +
    esc(M.instruksi) +
    '</p>' +
    buildSortItems(M.pernyataan, State.m3Order, M.opsi, State.m3States) +
    (m3Selesai()
      ? '<div style="margin-top:var(--space-4);">' +
        buildTextarea('m3Jubir', M.jubirLabel, State.m3Jubir, M.jubirPlaceholder) +
        '</div>'
      : '');
  return {
    html: html,
    bind: function (container) {
      bindSortItems(container, M.pernyataan, State.m3States, saveState, rerender);
      bindTextarea('m3Jubir', State, 'm3Jubir');
    },
  };
}

function renderMisi(container) {
  var D = DATA.misi;
  var rerender = function () {
    renderMisi(container);
    centerNumberLines(container);
  };
  var tabs = [
    { judul: D.m1.judul, tab: D.m1.tab, done: m1Selesai(), build: buildMisi1 },
    { judul: D.m2.judul, tab: D.m2.tab, done: m2Selesai(), build: buildMisi2 },
    { judul: D.m3.judul, tab: D.m3.tab, done: m3Selesai(), build: buildMisi3 },
  ];
  var aktif = State.misiTab;
  var isi = tabs[aktif].build(rerender);
  var semua = tabs.every(function (t) {
    return t.done;
  });

  container.innerHTML =
    '<section aria-label="Misi Tim">' +
    buildHead(D) +
    '<div class="dl-tabs" role="tablist" aria-label="Pilih misi">' +
    tabs
      .map(function (t, i) {
        return (
          '<button type="button" class="dl-tab' +
          (i === aktif ? ' is-active' : '') +
          (t.done ? ' is-done' : '') +
          '" role="tab" aria-selected="' +
          (i === aktif ? 'true' : 'false') +
          '" data-misi-tab="' +
          i +
          '">' +
          (t.done ? '✓ ' : '') +
          esc(t.tab) +
          '</button>'
        );
      })
      .join('') +
    '</div>' +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(tabs[aktif].judul) +
        '</h3>' +
        buildCoopRoleBar(State.timAnggota, aktif, {
          title: 'Peran pada ' + tabs[aktif].judul.split(' · ')[0],
        }) +
        isi.html
    ) +
    (semua
      ? buildDlPanel(
          '<p style="margin:0;">🙌 <strong>Semua misi tuntas!</strong> Skor misi tim (benar pada percobaan pertama): <strong>' +
            misiSkor().benar +
            '/' +
            misiSkor().maks +
            '</strong>. Sekarang setiap anggota mengerjakan kuis secara mandiri.</p>',
          'panel--hero'
        ) + buildDlNextButton('misiNextBtn', D.nextLabel)
      : '<p class="dl-caption" style="text-align:right;">Selesaikan ketiga misi untuk lanjut ke kuis individu.</p>') +
    '</section>';

  container.querySelectorAll('[data-misi-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.misiTab = +btn.dataset.misiTab;
      saveState();
      rerender();
    });
  });
  isi.bind(container);
  bindNext('misiNextBtn', 'misi', 'evaluasi');
}

/* ============================================================
   9. STAGE: KUIS INDIVIDU  (Cooperative Learning — fase 5)
   createExerciseStage (shared/engine.js): campuran soal 'input'
   dan 'choice'. Urutan soal (State.evalOrder) dan urutan opsi
   (ex.optionOrder) diacak di initExerciseArrays().
   ============================================================ */

function renderEvaluasi(container) {
  var D = DATA.evaluasi;
  createExerciseStage({
    soal: evalSoal(),
    getExercises: function () {
      return State.evalExercises;
    },
    getIndex: function () {
      return State.evalIdx;
    },
    setIndex: function (i) {
      State.evalIdx = i;
    },
    save: saveState,
    idPrefix: 'ev',
    sectionLabel: 'Kuis Individu',
    kicker: D.kicker,
    goal: D.goal,
    instruction: D.instruksi,
    buildHead: function () {
      return buildHead(D);
    },
    nextStageId: 'penghargaan',
    completeStageId: 'evaluasi',
    nextButtonLabel: D.nextLabel,
    defaultType: 'input',
    listClass: 'challenge-options',
    choiceClassStyle: 'state',
    wrapClass: 'dl-exercise',
    inputRowClass: 'dl-input-row',
    inputAriaLabel: 'Jawabanmu',
    inputPlaceholder: 'Jawabanmu',
    allowNegative: true,
    revealButtonStyle: 'separate',
    invalidMessage: 'Tulis jawaban berupa bilangan bulat, mis. −4 atau 6.',
    afterRender: centerNumberLines,
    checkValue: function (s) {
      return s.jawab;
    },
    revealText: function (s) {
      return s.reveal;
    },
    renderPrompt: function (s) {
      return (
        '<div class="dl-prompt">' +
        '<p class="dl-prompt__cerita">' +
        esc(s.cerita) +
        '</p>' +
        '<p class="dl-prompt__tanya">' +
        s.pertanyaan +
        '</p>' +
        (s.garis
          ? buildNumberLinePicker('evGaris', {
              min: s.garis.min,
              max: s.garis.max,
              interactive: false,
              sides: true,
            })
          : '') +
        '</div>'
      );
    },
  }).render(container);
}

/* ============================================================
   10. STAGE: PENGHARGAAN  (Cooperative Learning — fase 6)
   ============================================================ */

function kuisSkor() {
  return {
    benar: State.evalExercises.filter(function (e) {
      return e.correct;
    }).length,
    maks: DATA.evaluasi.soal.length,
  };
}

function poinTim() {
  var m = misiSkor();
  var k = kuisSkor();
  return Math.round((50 * m.benar) / m.maks + (50 * k.benar) / k.maks);
}

function renderPenghargaan(container) {
  var D = DATA.penghargaan;
  var m = misiSkor();
  var k = kuisSkor();
  var poin = poinTim();
  var award = coopAwardLevel(poin);

  container.innerHTML =
    '<section aria-label="Penghargaan Tim">' +
    buildHead(D) +
    '<div class="coop-award">' +
    '<span class="coop-award__ikon" aria-hidden="true">' +
    award.ikon +
    '</span>' +
    '<p class="coop-award__label">' +
    esc(award.label) +
    '</p>' +
    '<p class="coop-award__tim">' +
    esc(State.timNama || 'Tim kalian') +
    (State.timAnggota.length ? ' — ' + esc(State.timAnggota.join(', ')) : '') +
    '</p>' +
    '<p style="margin:0;">' +
    esc(award.teks) +
    '</p>' +
    '</div>' +
    buildDlPanel(
      '<div class="summary-grid">' +
        kartuRingkas(m.benar + '/' + m.maks, 'Skor misi tim (percobaan pertama)') +
        kartuRingkas(k.benar + '/' + k.maks, 'Skor kuis individu') +
        kartuRingkas(poin, 'Poin tim (0–100)') +
        '</div>' +
        '<p class="dl-caption" style="margin-top:var(--space-3);">' +
        esc(D.bobot) +
        ' Predikat: Tim Super ≥ 85, Tim Hebat ≥ 70, Tim Baik &lt; 70.</p>'
    ) +
    buildDlPanel(buildTextarea('pujianTa', D.pujianLabel, State.pujian, D.pujianPlaceholder)) +
    buildDlNextButton('penghargaanNextBtn', D.nextLabel) +
    '</section>';

  bindTextarea('pujianTa', State, 'pujian');
  bindNext('penghargaanNextBtn', 'penghargaan', 'refleksi');
}

/* ============================================================
   11. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;

  container.innerHTML =
    '<section aria-label="Refleksi">' +
    buildHead(D) +
    '<div class="refleksi-list">' +
    D.pertanyaan
      .map(function (q, i) {
        return (
          '<div class="panel panel--compact">' +
          '<span class="refleksi-item__num">Refleksi pribadi ' +
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
      '<h3 style="margin-top:0;">👥 ' +
        esc(D.kerjaJudul) +
        '</h3>' +
        D.kerja
          .map(function (k) {
            return (
              '<div class="kerja-item">' +
              '<p class="exercise-label">' +
              esc(k.teks) +
              '</p>' +
              buildChoiceGroup(D.kerjaOpsi, State.kerjaOrders[k.id], {
                chosen: State.kerjaPilih[k.id] || null,
                group: k.id,
                attr: 'data-kerja',
              }) +
              '</div>'
            );
          })
          .join('')
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.diriLabel) +
        '</p>' +
        buildChoiceGroup(D.diriOpsi, State.refleksiDiriOrder, { chosen: State.refleksiDiri })
    ) +
    '<div class="btn-group btn-group--spread">' +
    '<span class="dl-caption" style="align-self:center;">Jawaban tersimpan di perangkatmu saja, tidak dikirim ke mana pun.</span>' +
    '<button type="button" class="btn btn--primary" id="refleksiNextBtn">' +
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

  container.querySelectorAll('[data-kerja]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.kerjaPilih[btn.dataset.group] = btn.dataset.kerja;
      saveState();
      renderRefleksi(container);
    });
  });

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.refleksiDiri = btn.dataset.optId;
      saveState();
      renderRefleksi(container);
    });
  });

  bindNext('refleksiNextBtn', 'refleksi', 'selesai', function () {
    var kerjaLengkap = D.kerja.every(function (k) {
      return !!State.kerjaPilih[k.id];
    });
    if (!kerjaLengkap) {
      showNotice('Isi dulu penilaian kerja sama tim.');
      return false;
    }
    if (!State.refleksiDiri) {
      showNotice('Pilih dulu seberapa yakin kamu sekarang.');
      return false;
    }
    return true;
  });
}

/* ============================================================
   12. STAGE: SELESAI
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
    '<div class="formula-duo">' +
    '<div class="formula-card"><span class="formula-card__label">Lebih kanan = lebih besar</span>−2 &gt; −7</div>' +
    '<div class="formula-card"><span class="formula-card__label">Urutan naik (kiri → kanan)</span>−7 &lt; −2 &lt; 0 &lt; 3</div>' +
    '</div>' +
    buildNumberLinePicker('selesaiGaris', {
      min: -8,
      max: 4,
      interactive: false,
      sides: true,
      marks: [
        { value: -7, label: '−7' },
        { value: -2, label: '−2' },
        { value: 0, label: '0' },
        { value: 3, label: '3' },
      ],
      aria: 'Garis bilangan: −7, −2, 0, dan 3 berurutan dari kiri ke kanan',
    }) +
    (State.timAnggota.length ? buildCoopTeamCard(State.timNama, State.timAnggota, 0) : '') +
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
    'Poin tim adalah indikator latihan digital, bukan nilai akhir. ' +
    'Penjelasan Juru Bicara di depan kelas dan pengamatan kerja sama selama misi tetap menjadi bahan penilaian utama.' +
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
   13. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  informasi: renderInformasi,
  tim: renderTim,
  misi: renderMisi,
  evaluasi: renderEvaluasi,
  penghargaan: renderPenghargaan,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  var fn = RENDERERS[State.currentStage] || RENDERERS.orientasi;
  fn(container);
  centerNumberLines(container);
}

/* ============================================================
   14. HELPER UI — MODAL RESET
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
   15. INIT
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
