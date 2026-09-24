'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Membandingkan Bunga Tunggal & Bunga Majemuk
   Fase F — SMK Rekayasa Perangkat Lunak

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, formatNumber, shuffleArray, showNotice, buildFeedbackBox,
   createStageMachine, createExerciseStage, createStore,
   ensureExerciseArray, optionIds, komponen Discovery Learning
   (ensureShuffledOrder, buildDiscoveryHead, buildTeacherNote,
   buildChoiceGroup, buildDlPanel, buildDlStep, bindDlStep,
   ensureSortStates, buildSortItems, bindSortItems), pertanyaan
   penuntun (buildGuidedQuizList), kerja kelompok (buildRoleCards,
   ensureTapOrderState, buildTapOrder, buildInfoPoster), tabel isian
   (buildSeriesFillTable), seksi 22–23 bunga tunggal & majemuk
   (saldoBungaTunggal, saldoBungaMajemuk, bungaPeriodeMajemuk,
   buildBukuTabungan, formatRupiah), serta seksi 24 "Perbandingan
   bunga tunggal & majemuk": bandingTawaran, buildInterestDuel,
   bindInterestDuel.

   Alur tahap mengikuti sintaks Problem Based Learning; lihat komentar
   kepala pada data.js untuk pemetaan dan rangkaian aktivitasnya.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI saat
   state disiapkan (initExerciseArrays), lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat-lompat
   ketika tahap dirender ulang, tetapi teracak ulang setiap Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render & Tawaran
    5. Stage: Orientasi         (PBL sintaks 1)
    6. Stage: Organisasi        (PBL sintaks 2)
    7. Stage: Selidik Cara      (PBL sintaks 3)
    8. Stage: Kapan Menyalip    (PBL sintaks 3)
    9. Stage: Latihan           (PBL sintaks 3)
   10. Stage: Karya             (PBL sintaks 4)
   11. Stage: Evaluasi          (PBL sintaks 5)
   12. Stage: Refleksi
   13. Stage: Selesai
   14. Router Render
   15. Helper UI (modal reset)
   16. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'organisasi',
  'selidikCara',
  'selidikSalip',
  'latih',
  'karya',
  'evaluasi',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Orientasi',
  'Organisasi',
  'Selidik Cara',
  'Kapan Menyalip',
  'Latihan',
  'Karya',
  'Evaluasi',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-f-3-3-banding-bunga-pbl-v1';
var KOLOM_ISIAN = ['mA', 'bB', 'mB'];

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Tahap 1 — orientasi (dugaan, tidak dinilai) */
  orientasiOrder: null,
  orientasiPilihan: null,
  orientasiAlasan: '',
  orientasiPemantik: '',

  /* Tahap 2 — organisasi */
  peran: {},
  infoStates: {},
  infoOrder: null,
  rencana: null,

  /* Tahap 3 — selidik cara kerja */
  tabelInputs: { mA: [], bB: [], mB: [] },
  tabelChecked: false,
  tabelHint: 0,
  caraOrders: {},
  caraPilih: {},
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 4 — kapan menyalip */
  duel: null,
  salipOrders: {},
  salipPilih: {},
  salipSteps: [],

  /* Tahap 5 — latihan */
  latihIdx: 0,
  latihExercises: [],

  /* Tahap 6 — karya */
  karyaSteps: [],
  karyaOrders: {},
  karyaPilih: {},
  karyaPesan: '',

  /* Tahap 7 — evaluasi */
  pendapatStates: {},
  pendapatOrder: null,
  transferStep: null,

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

/* Objek kosong bila State[key] belum berupa objek. */
function ensureObject(key) {
  if (!State[key] || typeof State[key] !== 'object' || Array.isArray(State[key])) State[key] = {};
}

/* Semua pertanyaan penuntun tahap Karya (untuk pengacakan & pemasangan event). */
function karyaPertanyaan() {
  var K = DATA.karya;
  return [K.rekomPendek, K.rekomPanjang, K.rekomendasi];
}

/*
 * Menyiapkan seluruh array state per-soal DAN seluruh urutan acak
 * pilihan jawaban. Dipanggil sekali saat init (setelah loadState) dan
 * setiap kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1 */
  ensureShuffledOrder(State, 'orientasiOrder', DATA.orientasi.opsi);

  /* Tahap 2 */
  ensureObject('peran');
  ensureSortStates(
    State,
    'infoStates',
    'infoOrder',
    DATA.organisasi.info,
    DATA.organisasi.infoOpsi
  );
  ensureTapOrderState(State, 'rencana', DATA.organisasi.rencana, DATA.organisasi.rencanaUrut);

  /* Tahap 3 */
  ensureObject('tabelInputs');
  KOLOM_ISIAN.forEach(function (k) {
    if (!Array.isArray(State.tabelInputs[k])) State.tabelInputs[k] = [];
  });
  ensureObject('caraOrders');
  ensureObject('caraPilih');
  DATA.selidikCara.pertanyaan.forEach(function (q) {
    ensureShuffledOrder(State.caraOrders, q.id, q.opsi);
  });
  ensureSortStates(
    State,
    'pilahStates',
    'pilahOrder',
    DATA.selidikCara.pilah,
    DATA.selidikCara.pilahOpsi
  );

  /* Tahap 4 */
  var d = State.duel;
  if (!d || typeof d !== 'object' || typeof d.n !== 'number') {
    State.duel = makeInterestDuelState();
  } else {
    d.n = Math.min(Math.max(1, d.n), DATA.selidikSalip.maxN);
    d.maks = Math.max(d.n, d.maks || 1);
  }
  ensureObject('salipOrders');
  ensureObject('salipPilih');
  DATA.selidikSalip.pertanyaan.forEach(function (q) {
    ensureShuffledOrder(State.salipOrders, q.id, q.opsi);
  });
  ensureExerciseArray(State, 'salipSteps', DATA.selidikSalip.langkah, makeDlStep);

  /* Tahap 5 — latihan (dirender createExerciseStage) */
  ensureExerciseArray(State, 'latihExercises', DATA.latih.soal, function (s) {
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
  if (State.latihIdx >= DATA.latih.soal.length || State.latihIdx < 0) State.latihIdx = 0;

  /* Tahap 6 */
  ensureExerciseArray(State, 'karyaSteps', DATA.karya.hitung, makeDlStep);
  ensureObject('karyaOrders');
  ensureObject('karyaPilih');
  karyaPertanyaan().forEach(function (q) {
    ensureShuffledOrder(State.karyaOrders, q.id, q.opsi);
  });

  /* Tahap 7 */
  ensureSortStates(
    State,
    'pendapatStates',
    'pendapatOrder',
    DATA.evaluasi.pendapat,
    DATA.evaluasi.pendapatOpsi
  );
  if (!State.transferStep || typeof State.transferStep !== 'object') {
    State.transferStep = makeDlStep();
  }

  /* Tahap 8 */
  ensureObject('refleksiAnswers');
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
   4. UTILITAS RENDER & TAWARAN
   ============================================================ */

/* Kepala tahap (bertanda sintaks PBL) + catatan peran guru. */
function buildHead(D) {
  return buildDiscoveryHead(D.kicker, D.goal, D.syntax) + buildTeacherNote(D.guru);
}

/* Judul bagian + instruksi di dalam panel. */
function buildPartHead(judul, instruksi) {
  return (
    '<h3 style="margin-top:0;">' +
    esc(judul) +
    '</h3>' +
    (instruksi ? '<p class="exercise-label">' + esc(instruksi) + '</p>' : '')
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
 * Daftar pertanyaan penuntun yang ditampilkan bertahap: pertanyaan
 * berikutnya baru muncul setelah pertanyaan sebelumnya dijawab benar.
 */
function visibleGuided(list, pilih) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    out.push(list[i]);
    if (pilih[list[i].id] !== list[i].correct) break;
  }
  return out;
}

/* Langkah isian bertahap: tampil satu per satu sampai yang belum selesai. */
function buildStepsSeq(prefix, steps, states) {
  var html = '';
  for (var i = 0; i < steps.length; i++) {
    html += buildDlStep(prefix + i, states[i], steps[i], i + 1);
    if (!states[i].done) break;
  }
  return html;
}

function bindStepsSeq(prefix, steps, states, rerender) {
  steps.forEach(function (step, i) {
    bindDlStep(prefix + i, states[i], step, saveState, rerender);
  });
}

function stepsAllDone(states) {
  return states.every(function (s) {
    return s.done;
  });
}

/* Saldo kedua tawaran Kodekita setelah n tahun. */
function bandingKasus(n) {
  var K = DATA.kasus;
  return bandingTawaran(K.M0, K.tunggal.i, K.majemuk.i, n);
}

/* Opsi duel tawaran untuk buildInterestDuel. */
function duelOpts() {
  var K = DATA.kasus;
  return {
    M0: K.M0,
    tunggal: { nama: K.tunggal.nama, i: K.tunggal.i },
    majemuk: { nama: K.majemuk.nama, i: K.majemuk.i },
    maxN: DATA.selidikSalip.maxN,
    periode: 'Tahun',
    grafik: true,
  };
}

/* Kartu dua tawaran + buku tabungan tahun 0 sampai tahun `sampai`. */
function buildTawaranCards(sampai) {
  var K = DATA.kasus;
  var O = DATA.orientasi;

  function kartu(t, jenis, aturan) {
    var saldo =
      jenis === 'tunggal'
        ? saldoBungaTunggal(K.M0, t.i, sampai)
        : saldoBungaMajemuk(K.M0, t.i, sampai);
    var rows = saldo.map(function (m, k) {
      return {
        label: 'Tahun ' + k,
        bunga: k === 0 ? null : m - saldo[k - 1],
        saldo: m,
      };
    });
    return (
      '<div class="tawaran tawaran--' +
      jenis +
      '">' +
      '<div class="tawaran__head"><span class="tawaran__icon" aria-hidden="true">' +
      t.ikon +
      '</span><div><strong>' +
      esc(t.nama) +
      '</strong><p class="bunga-rule">' +
      esc(aturan) +
      '</p></div></div>' +
      buildBukuTabungan(rows, {
        caption: 'Buku tabungan ' + t.nama + ' tahun 0 sampai ' + sampai,
        periodeLabel: 'Tahun',
      }) +
      '</div>'
    );
  }

  return (
    '<div class="tawaran-grid">' +
    kartu(K.tunggal, 'tunggal', O.aturan.tunggal) +
    kartu(K.majemuk, 'majemuk', O.aturan.majemuk) +
    '</div>'
  );
}

/* Kartu dua rumus nilai akhir modal. */
function buildRumusBanding() {
  return (
    '<div class="formula-duo">' +
    '<div class="formula-card"><span class="formula-card__label">Bunga tunggal</span>Mₙ = M₀(1 + n × i)</div>' +
    '<div class="formula-card"><span class="formula-card__label">Bunga majemuk</span>Mₙ = M₀(1 + i)ⁿ</div>' +
    '</div>'
  );
}

/* ============================================================
   5. STAGE: ORIENTASI  (PBL — sintaks 1)
   Murid memahami masalah dan MENDUGA. Tidak ada penilaian.
   ============================================================ */

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var terisi = !!State.orientasiPilihan;

  container.innerHTML =
    '<section aria-label="Orientasi Masalah">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🚀 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        buildTawaranCards(1),
      'panel--hero'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.orientasiOrder, { chosen: State.orientasiPilihan }) +
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
        '<div class="field-group">' +
        '<label for="orientasiPemantik">' +
        esc(D.pemantikLabel) +
        '</label>' +
        '<textarea id="orientasiPemantik" class="input-textarea" placeholder="' +
        esc(D.pemantikPlaceholder) +
        '">' +
        esc(State.orientasiPemantik) +
        '</textarea>' +
        '</div>' +
        buildFeedbackBox('info', '🔎', esc(D.catatan))
    ) +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="orientasiNextBtn"' +
    (terisi ? '' : ' disabled') +
    '>' +
    esc(D.nextLabel) +
    '</button>' +
    '</div>' +
    '</section>';

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.orientasiPilihan = btn.dataset.optId;
      saveState();
      renderOrientasi(container);
    });
  });

  [
    ['orientasiAlasan', 'orientasiAlasan'],
    ['orientasiPemantik', 'orientasiPemantik'],
  ].forEach(function (pair) {
    var ta = document.getElementById(pair[0]);
    ta.addEventListener('input', function () {
      State[pair[1]] = ta.value;
      saveState();
    });
  });

  document.getElementById('orientasiNextBtn').addEventListener('click', function () {
    if (!State.orientasiPilihan) {
      showNotice('Pilih dugaanmu sebelum melanjutkan.');
      return;
    }
    if (!State.orientasiPemantik.trim()) {
      showNotice('Tulis dulu apa yang perlu kalian ketahui atau hitung.');
      return;
    }
    completeStage('orientasi');
    navigateTo('organisasi');
  });
}

/* ============================================================
   6. STAGE: ORGANISASI  (PBL — sintaks 2)
   A: peran kelompok. B: pilah informasi. C: urutan rencana.
   ============================================================ */

function renderOrganisasi(container) {
  var D = DATA.organisasi;
  var infoSelesai = sortItemsAllAnswered(D.info, State.infoStates);
  var rencanaOk = State.rencana.correct;

  function rerender() {
    renderOrganisasi(container);
  }

  container.innerHTML =
    '<section aria-label="Organisasi Belajar">' +
    buildHead(D) +
    buildDlPanel(
      buildPartHead(D.judulPeran, D.instruksiPeran) + buildRoleCards(D.peran, State.peran)
    ) +
    buildDlPanel(
      buildPartHead(D.judulInfo, D.instruksiInfo) +
        buildSortItems(D.info, State.infoOrder, D.infoOpsi, State.infoStates)
    ) +
    (infoSelesai
      ? buildDlPanel(
          buildPartHead(D.judulRencana, D.instruksiRencana) +
            buildTapOrder('rencanaOrder', D.rencana, State.rencana, {
              answer: D.rencanaUrut,
              startLabel: 'Langkah pertama',
              endLabel: 'Langkah terakhir',
              successText: D.rencanaSukses,
            })
        )
      : '') +
    (infoSelesai && rencanaOk ? buildDlNextButton('organisasiNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-role-id]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      State.peran[inp.dataset.roleId] = inp.value;
      saveState();
    });
  });

  bindSortItems(container, D.info, State.infoStates, saveState, rerender);
  bindTapOrder(container, 'rencanaOrder', State.rencana, D.rencanaUrut, saveState, rerender);
  bindNext('organisasiNextBtn', 'organisasi', 'selidikCara');
}

/* ============================================================
   7. STAGE: SELIDIK CARA KERJA  (PBL — sintaks 3)
   A: buku tabungan kedua tawaran. B: pertanyaan penuntun.
   C: pilah ciri tunggal / majemuk / keduanya.
   ============================================================ */

function kolomTabelCara() {
  var K = DATA.kasus;
  var n = DATA.selidikCara.tabelN;
  return [
    {
      id: 'bA',
      label: 'Bunga A (Rp)',
      values: saldoBungaTunggal(K.M0, K.tunggal.i, n)
        .slice(1)
        .map(function () {
          return bungaTunggal(K.M0, K.tunggal.i, 1);
        }),
    },
    {
      id: 'mA',
      label: 'Saldo A (Rp)',
      values: saldoBungaTunggal(K.M0, K.tunggal.i, n).slice(1),
      editable: true,
    },
    {
      id: 'bB',
      label: 'Bunga B (Rp)',
      values: bungaPeriodeMajemuk(K.M0, K.majemuk.i, n),
      editable: true,
    },
    {
      id: 'mB',
      label: 'Saldo B (Rp)',
      values: saldoBungaMajemuk(K.M0, K.majemuk.i, n).slice(1),
      editable: true,
    },
  ];
}

function renderSelidikCara(container) {
  var D = DATA.selidikCara;
  var kolom = kolomTabelCara();
  var tabelOk = State.tabelChecked && seriesFillTableAllCorrect(kolom, State.tabelInputs);
  var caraOk = guidedQuizAllCorrect(D.pertanyaan, State.caraPilih);
  var pilahSelesai = sortItemsAllAnswered(D.pilah, State.pilahStates);

  function rerender() {
    renderSelidikCara(container);
  }

  container.innerHTML =
    '<section aria-label="Selidiki Cara Kerja Bunga">' +
    buildHead(D) +
    buildDlPanel(
      buildPartHead(D.judulTabel, D.instruksiTabel) +
        '<p class="dl-caption">Tahun 0: saldo kedua tawaran ' +
        esc(formatRupiah(DATA.kasus.M0)) +
        ' (modal awal). n = tahun ke-.</p>' +
        buildSeriesFillTable('tabelCara', kolom, State.tabelInputs, {
          checked: State.tabelChecked,
          locked: tabelOk,
          caption: 'Buku tabungan Koperasi A dan Bank B tahun ke-1 sampai ke-' + D.tabelN,
        }) +
        (tabelOk
          ? buildFeedbackBox('success', '✓', D.tabelSukses)
          : '<div class="dl-input-row" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="tabelCheck">Periksa Tabel</button>' +
            buildHintToggle('tabelHintBtn', D.hintsTabel, State.tabelHint) +
            '</div>' +
            buildHintStack(D.hintsTabel, State.tabelHint))
    ) +
    (tabelOk
      ? buildDlPanel(
          buildPartHead(D.judulPola, D.instruksiPola) +
            buildGuidedQuizList(
              visibleGuided(D.pertanyaan, State.caraPilih),
              State.caraOrders,
              State.caraPilih
            ) +
            (caraOk ? buildRumusBanding() : '')
        )
      : '') +
    (tabelOk && caraOk
      ? buildDlPanel(
          buildPartHead(D.judulPilah, D.instruksiPilah) +
            buildSortItems(D.pilah, State.pilahOrder, D.pilahOpsi, State.pilahStates)
        )
      : '') +
    (tabelOk && caraOk && pilahSelesai ? buildDlNextButton('caraNextBtn', D.nextLabel) : '') +
    '</section>';

  var check = document.getElementById('tabelCheck');
  bindSeriesFillTable(container, 'tabelCara', State.tabelInputs, saveState, function () {
    if (check) check.click();
  });
  if (check) {
    check.addEventListener('click', function () {
      var kosong = KOLOM_ISIAN.some(function (k) {
        for (var i = 0; i < D.tabelN; i++) {
          if (!String(State.tabelInputs[k][i] || '').trim()) return true;
        }
        return false;
      });
      if (kosong) {
        showNotice('Lengkapi semua sel tabel terlebih dahulu.');
        return;
      }
      State.tabelChecked = true;
      saveState();
      if (!seriesFillTableAllCorrect(kolom, State.tabelInputs)) {
        showNotice('Masih ada sel yang belum tepat. Perhatikan tanda ✗.');
      }
      rerender();
    });
  }

  var hint = document.getElementById('tabelHintBtn');
  if (hint) {
    hint.addEventListener('click', function () {
      State.tabelHint = Math.min(State.tabelHint + 1, D.hintsTabel.length);
      saveState();
      rerender();
    });
  }

  bindGuidedQuizList(container, D.pertanyaan, State.caraPilih, saveState, rerender);
  bindSortItems(container, D.pilah, State.pilahStates, saveState, rerender);
  bindNext('caraNextBtn', 'selidikCara', 'selidikSalip');
}

/* ============================================================
   8. STAGE: KAPAN MENYALIP?  (PBL — sintaks 3)
   A: duel tawaran + pertanyaan penuntun. B: bukti dengan rumus.
   ============================================================ */

function renderSelidikSalip(container) {
  var D = DATA.selidikSalip;
  var opts = duelOpts();
  var jelajahOk = State.duel.maks >= D.syaratMaks;
  var tanyaOk = guidedQuizAllCorrect(D.pertanyaan, State.salipPilih);
  var langkahOk = stepsAllDone(State.salipSteps);

  function rerender() {
    renderSelidikSalip(container);
  }

  container.innerHTML =
    '<section aria-label="Kapan Bunga Majemuk Menyalip">' +
    buildHead(D) +
    buildDlPanel(
      buildPartHead(D.judulA, D.instruksiA) +
        buildInterestDuel('duelTawaran', State.duel, opts) +
        (jelajahOk
          ? buildGuidedQuizList(
              visibleGuided(D.pertanyaan, State.salipPilih),
              State.salipOrders,
              State.salipPilih
            )
          : '<p class="dl-caption">' + esc(D.pesanJelajah) + '</p>')
    ) +
    (tanyaOk
      ? buildDlPanel(
          buildPartHead(D.judulB, D.instruksiB) +
            buildRumusBanding() +
            buildStepsSeq('sl', D.langkah, State.salipSteps)
        )
      : '') +
    (tanyaOk && langkahOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🎉 Temuan kelompokmu</h3>' +
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
        ) + buildDlNextButton('salipNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindInterestDuel(container, 'duelTawaran', State.duel, opts, saveState, rerender);
  bindGuidedQuizList(container, D.pertanyaan, State.salipPilih, saveState, rerender);
  if (tanyaOk) bindStepsSeq('sl', D.langkah, State.salipSteps, rerender);
  bindNext('salipNextBtn', 'selidikSalip', 'latih');
}

/* ============================================================
   9. STAGE: LATIHAN MASALAH KEUANGAN  (PBL — sintaks 3)
   createExerciseStage (shared/engine.js): campuran soal 'input'
   dan 'choice'; urutan opsi dari ex.optionOrder yang diacak di
   initExerciseArrays().
   ============================================================ */

var LatihStage = createExerciseStage({
  soal: DATA.latih.soal,
  getExercises: function () {
    return State.latihExercises;
  },
  getIndex: function () {
    return State.latihIdx;
  },
  setIndex: function (i) {
    State.latihIdx = i;
  },
  save: saveState,
  idPrefix: 'lt',
  sectionLabel: 'Latihan Masalah Keuangan',
  kicker: DATA.latih.kicker,
  goal: DATA.latih.goal,
  instruction: DATA.latih.instruksi,
  buildHead: function () {
    return buildHead(DATA.latih);
  },
  nextStageId: 'karya',
  completeStageId: 'latih',
  nextButtonLabel: DATA.latih.nextLabel,
  defaultType: 'input',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  inputRowClass: 'dl-input-row',
  inputAriaLabel: 'Jawabanmu',
  inputPlaceholder: 'Jawabanmu',
  stripPunctuation: true,
  revealButtonStyle: 'separate',
  invalidMessage: 'Tulis jawaban berupa bilangan bulat tanpa "Rp", mis. 1.200.000 atau 5.',
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
      '</div>'
    );
  },
});

function renderLatih(container) {
  LatihStage.render(container);
}

/* ============================================================
   10. STAGE: KARYA  (PBL — sintaks 4)
   A: hitung M₃ & M₆ kedua tawaran. B: keputusan per rencana.
   C: rekomendasi + pesan → poster untuk dipresentasikan.
   ============================================================ */

function buildPoster() {
  var K = DATA.karya;
  var J = DATA.kasus.jangka;
  var pendek = bandingKasus(J.pendek);
  var panjang = bandingKasus(J.panjang);
  var rekomOk = State.karyaPilih.rekom === K.rekomendasi.correct;

  function baris(b) {
    return 'A ' + esc(formatRupiah(b.tunggal)) + ' vs B ' + esc(formatRupiah(b.majemuk));
  }

  return buildInfoPoster({
    judul: K.posterJudul,
    ikon: '📋',
    rows: [
      { ikon: '3️⃣', label: 'Disimpan ' + J.pendek + ' tahun', nilai: baris(pendek) },
      { ikon: '6️⃣', label: 'Disimpan ' + J.panjang + ' tahun', nilai: baris(panjang) },
      {
        ikon: '🔀',
        label: 'Titik salip',
        nilai: 'Bank B unggul mulai tahun ke-' + DATA.kasus.salipN,
      },
      {
        ikon: '✅',
        label: 'Saran',
        nilai: rekomOk ? esc(findOptionLabel(K.rekomendasi.opsi, K.rekomendasi.correct)) : '—',
      },
    ],
    pesan: State.karyaPesan.trim(),
    footer: K.posterFooter,
  });
}

function renderKarya(container) {
  var K = DATA.karya;
  var hitungOk = stepsAllDone(State.karyaSteps);
  var keputusan = [K.rekomPendek, K.rekomPanjang];
  var keputusanOk = guidedQuizAllCorrect(keputusan, State.karyaPilih);
  var rekomOk = State.karyaPilih.rekom === K.rekomendasi.correct;

  function rerender() {
    renderKarya(container);
  }

  container.innerHTML =
    '<section aria-label="Sajikan Hasil Karya">' +
    buildHead(K) +
    buildDlPanel(
      buildPartHead(K.judulA) +
        buildRumusBanding() +
        buildStepsSeq('ky', K.hitung, State.karyaSteps)
    ) +
    (hitungOk
      ? buildDlPanel(
          buildPartHead(K.judulB) +
            buildGuidedQuizList(
              visibleGuided(keputusan, State.karyaPilih),
              State.karyaOrders,
              State.karyaPilih
            )
        )
      : '') +
    (keputusanOk
      ? buildDlPanel(
          buildPartHead(K.judulC) +
            buildGuidedQuizList([K.rekomendasi], State.karyaOrders, State.karyaPilih) +
            (rekomOk
              ? '<div class="field-group" style="margin-top:var(--space-5);">' +
                '<label for="karyaPesan">' +
                esc(K.pesanLabel) +
                '</label>' +
                '<textarea id="karyaPesan" class="input-textarea" maxlength="240" placeholder="' +
                esc(K.pesanPlaceholder) +
                '">' +
                esc(State.karyaPesan) +
                '</textarea>' +
                '</div>' +
                '<div id="karyaPoster">' +
                buildPoster() +
                '</div>'
              : '')
        )
      : '') +
    (rekomOk ? buildDlNextButton('karyaNextBtn', K.nextLabel, true) : '') +
    '</section>';

  bindStepsSeq('ky', K.hitung, State.karyaSteps, rerender);
  bindGuidedQuizList(container, karyaPertanyaan(), State.karyaPilih, saveState, rerender);

  var pesan = document.getElementById('karyaPesan');
  if (pesan) {
    pesan.addEventListener('input', function () {
      State.karyaPesan = pesan.value;
      saveState();
      document.getElementById('karyaPoster').innerHTML = buildPoster();
    });
  }

  var next = document.getElementById('karyaNextBtn');
  if (next) {
    next.addEventListener('click', function () {
      if (!State.karyaPesan.trim()) {
        showNotice('Tulis pesan kelompokmu untuk tim Kodekita sebelum melanjutkan.');
        return;
      }
      completeStage('karya');
      navigateTo('evaluasi');
    });
  }
}

/* ============================================================
   11. STAGE: EVALUASI  (PBL — sintaks 5)
   A: nilai pendapat teman. B: dugaan vs hasil. C: masalah baru.
   ============================================================ */

function buildDugaanBanding() {
  var O = DATA.orientasi;
  var cocok = State.orientasiPilihan === O.dugaanBenar;
  var b = bandingKasus(O.dugaanN);
  return (
    '<div class="dugaan-compare">' +
    '<div class="dugaan-row' +
    (cocok ? ' dugaan-row--ok' : '') +
    '">' +
    '<span class="dugaan-row__title">Saldo lebih besar jika disimpan ' +
    O.dugaanN +
    ' tahun</span>' +
    '<span>Dugaanmu: <strong>' +
    esc(findOptionLabel(O.opsi, State.orientasiPilihan) || '—') +
    '</strong></span>' +
    '<span>Hasil perhitungan: <strong>' +
    esc(findOptionLabel(O.opsi, O.dugaanBenar)) +
    '</strong> (' +
    esc(formatRupiah(b.majemuk)) +
    ' vs ' +
    esc(formatRupiah(b.tunggal)) +
    ')</span>' +
    '<span class="dugaan-row__verdict">' +
    (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh perhitungan') +
    '</span>' +
    '</div>' +
    '</div>'
  );
}

function renderEvaluasi(container) {
  var V = DATA.evaluasi;
  var pendapatSelesai = sortItemsAllAnswered(V.pendapat, State.pendapatStates);
  var transferOk = State.transferStep.done;

  function rerender() {
    renderEvaluasi(container);
  }

  container.innerHTML =
    '<section aria-label="Evaluasi Proses">' +
    buildHead(V) +
    buildDlPanel(
      buildPartHead(V.judulA, V.instruksiA) +
        buildSortItems(V.pendapat, State.pendapatOrder, V.pendapatOpsi, State.pendapatStates)
    ) +
    (pendapatSelesai
      ? buildDlPanel(buildPartHead(V.judulB) + buildDugaanBanding()) +
        buildDlPanel(buildPartHead(V.judulC) + buildDlStep('tf', State.transferStep, V.transfer))
      : '') +
    (pendapatSelesai && transferOk ? buildDlNextButton('evaluasiNextBtn', V.nextLabel) : '') +
    '</section>';

  bindSortItems(container, V.pendapat, State.pendapatStates, saveState, rerender);
  if (pendapatSelesai) bindDlStep('tf', State.transferStep, V.transfer, saveState, rerender);
  bindNext('evaluasiNextBtn', 'evaluasi', 'refleksi');
}

/* ============================================================
   12. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var pilahBenar =
    sortItemsCorrectCount(DATA.selidikCara.pilah, State.pilahStates) +
    sortItemsCorrectCount(DATA.evaluasi.pendapat, State.pendapatStates);
  var pilahTotal = DATA.selidikCara.pilah.length + DATA.evaluasi.pendapat.length;
  var langkah = State.salipSteps.concat(State.karyaSteps, [State.transferStep]);
  var sekaliCoba = langkah.filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  var benarLatih = State.latihExercises.filter(function (e) {
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
        kartu(pilahBenar + '/' + pilahTotal, 'Ciri & pendapat dinilai tepat') +
        kartu(sekaliCoba + '/' + langkah.length, 'Perhitungan benar sekali coba') +
        kartu(benarLatih + '/' + DATA.latih.soal.length, 'Masalah latihan benar') +
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
   13. STAGE: SELESAI
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
    buildRumusBanding() +
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
    'Presentasi poster kelompok dan penjelasan murid tentang mengapa bunga majemuk bisa menyalip tetap menjadi bahan penilaian utama.' +
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
   14. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  organisasi: renderOrganisasi,
  selidikCara: renderSelidikCara,
  selidikSalip: renderSelidikSalip,
  latih: renderLatih,
  karya: renderKarya,
  evaluasi: renderEvaluasi,
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
