'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Menentukan Model Linear Terbaik dengan Bantuan
   Teknologi Digital
   Fase F — SMK Rekayasa Perangkat Lunak, Problem Based Learning

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen umum: buildDiscoveryHead, buildTeacherNote,
       buildChoiceGroup, buildSortItems, buildGuidedQuizList,
       buildDlPanel, buildDlNextButton, buildDlStep, buildInfoPoster;
     • seksi 14 (urut-ketuk): ensureTapOrderState, buildTapOrder,
       bindTapOrder;
     • seksi 41 (model linear terbaik): regresiLinear, residuTitik,
       jumlahResidu, jumlahKuadratResidu, bandingkanModel,
       jenisPrediksi, fmtPersamaanRegresi, diagnosaResidu,
       buildLineFitPlot, buildLineFitLab/bindLineFitLab,
       buildResidualTable, buildModelCompareTable,
       buildRegressionPanel, buildRegressionLab/bindRegressionLab.

   Alur tahap mengikuti sintaks Problem Based Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan, rumusan masalah, peran,
   butir & kategori pemilahan, kartu rencana, pertanyaan penuntun setiap
   penyelidikan, keputusan karya, pendapat teman, bank kesimpulan, soal &
   opsi uji terap, penilaian diri) DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder() / ensureSortStates() / ensureTapOrderState().
   Pengacakan dilakukan SEKALI saat state disiapkan (initExerciseArrays)
   lalu urutannya disimpan di State — bukan saat render — sehingga
   pilihan tidak melompat saat dirender ulang, tetapi teracak ulang untuk
   setiap murid dan setiap Reset.

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi Masalah       (PBL sintaks 1)
    6. Stage: Organisasi              (PBL sintaks 2)
    7. Stage: Residu                  (PBL sintaks 3a)
    8. Stage: Kriteria Garis Terbaik  (PBL sintaks 3b)
    9. Stage: Teknologi Digital       (PBL sintaks 3c)
   10. Stage: Karya                   (PBL sintaks 4)
   11. Stage: Evaluasi                (PBL sintaks 5)
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
var STORAGE_KEY = 'mpi-f-11-2-model-linear-pbl-v1';

var PROYEK = DATA.proyek;
var PLOT = DATA.plot;
var OPSI_SUMBU = { x: PLOT.x, y: PLOT.y, xLabel: PLOT.xLabel, yLabel: PLOT.yLabel };

function proyekById(id) {
  return PROYEK.filter(function (p) {
    return p.id === id;
  })[0];
}

function usulanById(id) {
  return DATA.usulan.filter(function (u) {
    return u.id === id;
  })[0];
}

/* Garis usulan berlabel persamaan, untuk legenda & tabel banding. */
var GARIS_USULAN = DATA.usulan.map(function (u) {
  return { id: u.id, m: u.m, c: u.c, label: u.label + ': ' + fmtPersamaanRegresi(u.m, u.c) };
});
var MODEL_USULAN = DATA.usulan.map(function (u) {
  return { id: u.id, m: u.m, c: u.c, label: u.label };
});

/* Hasil teknologi dihitung langsung dari data (bukan disalin). */
var REG = regresiLinear(PROYEK);
var GARIS_DIMAS = usulanById(DATA.selidikKriteria.targetDari);
var TARGET_JKR = jumlahKuadratResidu(PROYEK, GARIS_DIMAS.m, GARIS_DIMAS.c);
var GARIS_HITUNG = usulanById(DATA.selidikResidu.garisHitung);
var GESER_MINIMAL = 4;

var LAB_OPTS = {
  rentangM: DATA.lab.rentangM,
  rentangC: DATA.lab.rentangC,
  x: PLOT.x,
  y: PLOT.y,
  xLabel: PLOT.xLabel,
  yLabel: PLOT.yLabel,
  caption: 'Lab Garis: diagram pencar 10 proyek dengan garis yang bisa digeser',
};

/* Pertanyaan penuntun dari DATA: tanya (HTML tepercaya) + label & umpan di-escape. */
function siapkanGuided(q) {
  var umpan = {};
  Object.keys(q.umpan).forEach(function (k) {
    umpan[k] = esc(q.umpan[k]);
  });
  return {
    id: q.id,
    tanya: q.tanya,
    opsi: opsiAman(q.opsi),
    correct: q.correct,
    umpan: umpan,
  };
}

/* Opsi teks biasa → opsi berlabel HTML aman. */
function opsiAman(list) {
  return list.map(function (o) {
    return { id: o.id, label: esc(o.label) };
  });
}

var DUGAAN_OPSI = {};
DATA.orientasi.dugaan.forEach(function (q) {
  DUGAAN_OPSI[q.id] = opsiAman(q.opsi);
});
var MASALAH_OPSI = opsiAman(DATA.orientasi.masalahOpsi);

var PILAH_ITEMS = DATA.organisasi.pilah.map(function (p) {
  return { id: p.id, teks: esc(p.teks), correct: p.correct, explanation: esc(p.explanation) };
});
var RENCANA_ITEMS = DATA.organisasi.rencana.map(function (r) {
  return { id: r.id, label: esc(r.label), aria: r.label };
});
var RENCANA_JAWAB = optionIds(DATA.organisasi.rencana);

var TANYA_RESIDU = DATA.selidikResidu.tanya.map(siapkanGuided);
var TANYA_MINI = DATA.selidikKriteria.tanyaMini.map(siapkanGuided);
var TANYA_BANDING = DATA.selidikKriteria.tanyaBanding.map(siapkanGuided);
var TANYA_KRITERIA = TANYA_MINI.concat(TANYA_BANDING);
var TANYA_TEKNO = DATA.selidikTeknologi.tanya.map(siapkanGuided);
var TANYA_MODEL = siapkanGuided(DATA.karya.tanyaModel);
var TANYA_JENIS = siapkanGuided(DATA.karya.tanyaJenis);
var TANYA_BESAR = siapkanGuided(DATA.karya.tanyaBesar);
var TANYA_KARYA = [TANYA_MODEL, TANYA_JENIS, TANYA_BESAR];

/* Kartu hitung residu (tahap 3): proyek + ŷ & e terhadap garis Sari. */
var KARTU_RESIDU = DATA.selidikResidu.hitung.map(function (h) {
  var p = proyekById(h.id);
  var t = residuTitik([p], GARIS_HITUNG.m, GARIS_HITUNG.c)[0];
  return { id: h.id, p: p, yTopi: t.yTopi, e: t.e, hints: h.hints };
});

/* Langkah Σe & JKR data mini (tahap 4); kunci dihitung engine. */
var MINI = DATA.selidikKriteria.mini;
var LANGKAH_MINI = DATA.selidikKriteria.langkah.map(function (l) {
  var g = MINI[l.garis];
  return {
    id: l.id,
    label: esc(l.label),
    jawab:
      l.ukuran === 'jkr'
        ? jumlahKuadratResidu(MINI.titik, g.m, g.c)
        : jumlahResidu(MINI.titik, g.m, g.c),
    hints: l.hints.map(esc),
    temuan: esc(l.temuan),
    allowNegative: true,
  };
});

var LANGKAH_ESTIMASI = {
  label: esc(DATA.karya.estimasi.label),
  jawab: prediksiLinear(REG.m, REG.c, DATA.klien.sp),
  hints: DATA.karya.estimasi.hints.map(esc),
  temuan: esc(DATA.karya.estimasi.temuan),
  rational: true,
};

var PENDAPAT_ITEMS = DATA.evaluasi.pendapat.map(function (p) {
  return { id: p.id, teks: esc(p.teks), correct: p.correct, explanation: esc(p.explanation) };
});

/* Bank soal uji terap dengan label opsi aman. */
var TERAP_BANK = DATA.terapkan.soal.map(function (s) {
  var c = {};
  Object.keys(s).forEach(function (k) {
    c[k] = s[k];
  });
  if (s.options) c.options = opsiAman(s.options);
  return c;
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
  masalahHipotesis: '',

  /* Tahap 2 — organisasi */
  peranOrder: null,
  peranPilih: null,
  pilahStates: {},
  pilahOrder: null,
  rencanaState: null,

  /* Tahap 3 & 4 — Lab Garis (dipakai bersama) */
  lab: null,

  /* Tahap 3 — residu */
  hitungStates: {},
  residuOrders: {},
  residuPilih: {},

  /* Tahap 4 — kriteria */
  miniSteps: {},
  kriteriaOrders: {},
  kriteriaPilih: {},

  /* Tahap 5 — teknologi */
  regresiJalan: false,
  teknoOrders: {},
  teknoPilih: {},
  regLab: null,

  /* Tahap 6 — karya */
  karyaOrders: {},
  karyaPilih: {},
  estimasiStep: null,
  karyaPesan: '',

  /* Tahap 7 — evaluasi */
  pendapatStates: {},
  pendapatOrder: null,
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 8 — uji terap */
  terapkanPick: null,
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

function stepValid(st) {
  return st && typeof st === 'object' && typeof st.done === 'boolean';
}

/* State Lab Garis yang rusak/kosong dibuat ulang dari posisi awal. */
function ensureLab() {
  var st = State.lab;
  if (!st || typeof st.m !== 'number' || typeof st.c !== 'number') {
    State.lab = makeLineFitState(DATA.lab.awal);
  }
  if (['residu', 'kuadrat', 'tidak'].indexOf(State.lab.tampil) === -1) {
    State.lab.tampil = 'residu';
  }
}

function ensureHitungStates() {
  var map = ensureMap('hitungStates');
  KARTU_RESIDU.forEach(function (k) {
    var st = map[k.id];
    if (!st || !stepValid(st.yTopi) || !st.e || typeof st.e.done !== 'boolean') {
      map[k.id] = {
        yTopi: makeDlStep(),
        e: { input: '', done: false, kode: null, attempts: 0, hintLevel: 0 },
      };
    }
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
    var kelompok = TERAP_BANK.filter(function (s) {
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
  var ada = optionIds(TERAP_BANK);
  return pick.every(function (id, i) {
    return ada.indexOf(id) !== -1 && pick.indexOf(id) === i;
  });
}

function isiTerapSoal() {
  var byId = {};
  TERAP_BANK.forEach(function (s) {
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
  var dugaanOrders = ensureMap('dugaanOrders');
  DATA.orientasi.dugaan.forEach(function (q) {
    ensureShuffledOrder(dugaanOrders, q.id, q.opsi);
  });
  ensureMap('dugaanPilih');
  ensureShuffledOrder(State, 'masalahOrder', DATA.orientasi.masalahOpsi);

  /* Tahap 2 */
  ensureShuffledOrder(State, 'peranOrder', DATA.organisasi.peran);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.organisasi.opsiPilah);
  ensureTapOrderState(State, 'rencanaState', RENCANA_ITEMS, RENCANA_JAWAB);

  /* Tahap 3 */
  ensureLab();
  ensureHitungStates();
  ensureListOrders('residuOrders', TANYA_RESIDU);
  ensureMap('residuPilih');

  /* Tahap 4 */
  var mini = ensureMap('miniSteps');
  LANGKAH_MINI.forEach(function (l) {
    if (!stepValid(mini[l.id])) mini[l.id] = makeDlStep();
  });
  ensureListOrders('kriteriaOrders', TANYA_KRITERIA);
  ensureMap('kriteriaPilih');

  /* Tahap 5 */
  ensureListOrders('teknoOrders', TANYA_TEKNO);
  ensureMap('teknoPilih');
  if (!State.regLab || typeof State.regLab.teks !== 'string') {
    State.regLab = makeRegressionLabState('');
  }

  /* Tahap 6 */
  ensureListOrders('karyaOrders', TANYA_KARYA);
  ensureMap('karyaPilih');
  if (!stepValid(State.estimasiStep)) State.estimasiStep = makeDlStep();

  /* Tahap 7 */
  ensureSortStates(
    State,
    'pendapatStates',
    'pendapatOrder',
    PENDAPAT_ITEMS,
    DATA.evaluasi.opsiPendapat
  );
  ensureShuffledOrder(State, 'bankOrder', DATA.evaluasi.bank);
  ensureMap('simpulanPilihan');

  /* Tahap 8 — soal dipilih acak dari bank; opsi tiap soal diacak */
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

  /* Tahap 9 */
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

function buildTemuanList(items) {
  return (
    '<ul class="temuan-list">' +
    items
      .map(function (t) {
        return '<li>' + esc(t) + '</li>';
      })
      .join('') +
    '</ul>'
  );
}

function buildTemuanPanel(items) {
  return buildDlPanel(
    '<h3 style="margin-top:0;">💡 Temuan kelompok</h3>' + buildTemuanList(items),
    'panel--hero'
  );
}

function panelJudul(judul, inner, cls) {
  return buildDlPanel('<h3 style="margin-top:0;">' + esc(judul) + '</h3>' + inner, cls);
}

function caption(teks) {
  return '<p class="dl-caption">' + esc(teks) + '</p>';
}

/* Memasang textarea yang menyimpan isinya ke State[key]. */
function bindTextarea(id, key) {
  var ta = document.getElementById(id);
  if (!ta) return;
  ta.addEventListener('input', function () {
    State[key] = ta.value;
    saveState();
  });
}

function buildTextarea(id, label, placeholder, value) {
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
    esc(placeholder) +
    '">' +
    esc(value || '') +
    '</textarea>' +
    '</div>'
  );
}

/*
 * Merender ulang tahap sambil menjaga fokus keyboard (mis. slider Lab
 * Garis yang sedang dipakai) agar murid tidak kehilangan posisinya.
 */
function renderJagaFokus(fn) {
  var aktif = document.activeElement;
  var id = aktif && aktif.id;
  fn();
  if (id) {
    var el = document.getElementById(id);
    if (el) el.focus();
  }
}

/* Diagram pencar 10 proyek dengan pilihan garis. */
function plotProyek(opts) {
  var o = {};
  Object.keys(OPSI_SUMBU).forEach(function (k) {
    o[k] = OPSI_SUMBU[k];
  });
  Object.keys(opts || {}).forEach(function (k) {
    o[k] = opts[k];
  });
  return buildLineFitPlot(PROYEK, o);
}

/* Tabel data proyek yang bisa dibuka-tutup. */
function buildTabelProyek(judul) {
  return (
    '<details class="lf-data">' +
    '<summary>' +
    esc(judul || '📋 Lihat tabel data 10 proyek') +
    '</summary>' +
    '<div class="aso-tabel-wrap"><table class="aso-tabel">' +
    '<thead><tr><th scope="col">Proyek</th><th scope="col">Story point (x)</th><th scope="col">Jam kerja (y)</th></tr></thead><tbody>' +
    PROYEK.map(function (p) {
      return (
        '<tr><th scope="row">' +
        esc(p.nama) +
        '</th><td class="aso-num">' +
        p.x +
        '</td><td class="aso-num">' +
        p.y +
        '</td></tr>'
      );
    }).join('') +
    '</tbody></table></div>' +
    '</details>'
  );
}

function fmtJkr(v) {
  return fmtAngkaReg(v);
}

/* ============================================================
   5. STAGE: ORIENTASI MASALAH  (PBL — sintaks 1)
   Dugaan TIDAK dinilai; pertanyaan inti dinilai dengan umpan balik.
   ============================================================ */

function dugaanLengkap() {
  return DATA.orientasi.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function buildUsulanList() {
  return (
    '<ul class="usulan-list">' +
    DATA.usulan
      .map(function (u, i) {
        return (
          '<li class="usulan-card usulan-card--' +
          i +
          '">' +
          '<strong>' +
          esc(u.label) +
          '</strong>' +
          '<span class="usulan-card__rumus">' +
          esc(fmtPersamaanRegresi(u.m, u.c)) +
          '</span>' +
          '<span class="dl-caption">' +
          esc(u.cara) +
          '</span>' +
          '</li>'
        );
      })
      .join('') +
    '</ul>'
  );
}

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var lengkap = dugaanLengkap();
  var benar = State.masalahPilihan === D.masalahCorrect;

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
    '<section aria-label="Orientasi Masalah">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">📨 ' +
        esc(D.judul) +
        '</h2>' +
        '<div class="klien-chat">' +
        '<span class="klien-chat__avatar" aria-hidden="true">☕</span>' +
        '<p class="klien-chat__bubble">' +
        esc(D.pesanKlien) +
        '</p>' +
        '</div>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        plotProyek({
          garisLain: GARIS_USULAN,
          caption:
            'Diagram pencar story point dan jam kerja 10 proyek dengan tiga garis usulan Dimas, Sari, dan Raka',
        }) +
        buildUsulanList() +
        buildTabelProyek(),
      'panel--hero'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaan kelompokmu?</h3>' +
        caption('Dugaan tidak dinilai. Kalian akan mengujinya sendiri di tahap Evaluasi.') +
        dugaanHTML +
        '<div style="margin-top:var(--space-5);">' +
        buildTextarea(
          'orientasiAlasan',
          D.alasanLabel,
          D.alasanPlaceholder,
          State.orientasiAlasan
        ) +
        '</div>'
    ) +
    (lengkap
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🎯 Rumuskan masalahnya</h3>' +
            '<p class="exercise-label">' +
            esc(D.pertanyaan) +
            '</p>' +
            buildChoiceGroup(MASALAH_OPSI, State.masalahOrder, {
              chosen: State.masalahPilihan,
              correctId: benar ? D.masalahCorrect : null,
              grade: true,
              locked: benar,
              attr: 'data-masalah',
            }) +
            buildGuidedChoiceFeedback(State.masalahPilihan, benar, D.masalahUmpan) +
            (benar
              ? '<div style="margin-top:var(--space-4);">' +
                buildTextarea(
                  'masalahHipotesis',
                  D.hipotesisLabel,
                  D.hipotesisPlaceholder,
                  State.masalahHipotesis
                ) +
                '</div>'
              : '')
        )
      : '') +
    (lengkap && benar ? buildDlNextButton('orientasiNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-dugaan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.dugaanPilih[btn.dataset.group] = btn.dataset.dugaan;
      saveState();
      renderOrientasi(container);
    });
  });

  container.querySelectorAll('[data-masalah]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.masalahPilihan === D.masalahCorrect) return;
      State.masalahPilihan = btn.dataset.masalah;
      saveState();
      renderOrientasi(container);
    });
  });

  bindTextarea('orientasiAlasan', 'orientasiAlasan');
  bindTextarea('masalahHipotesis', 'masalahHipotesis');

  var nextBtn = document.getElementById('orientasiNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.masalahHipotesis.trim()) {
        showNotice('Tulis hipotesis kelompokmu lebih dulu, walau hanya satu kalimat.');
        return;
      }
      completeStage('orientasi');
      navigateTo('organisasi');
    });
  }
}

/* ============================================================
   6. STAGE: ORGANISASI  (PBL — sintaks 2)
   Pilih peran → pilah informasi → susun rencana penyelidikan.
   ============================================================ */

function renderOrganisasi(container) {
  var D = DATA.organisasi;
  var rerender = function () {
    renderOrganisasi(container);
  };
  var peranOk = !!State.peranPilih;
  var pilahOk = sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);
  var rencanaOk = State.rencanaState.correct;

  container.innerHTML =
    '<section aria-label="Mengorganisasi Belajar">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">👥 ' +
        esc(D.peranLabel) +
        '</h3>' +
        buildChoiceGroup(opsiAman(D.peran), State.peranOrder, {
          chosen: State.peranPilih,
          attr: 'data-peran',
        }) +
        (peranOk
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              'info',
              '🙌',
              'Peranmu: ' +
                esc(findOptionLabel(D.peran, State.peranPilih)) +
                '. Tukar peran pada pertemuan berikutnya.'
            ) +
            '</div>'
          : '')
    ) +
    (peranOk
      ? panelJudul(
          '🗂️ ' + D.judulPilah,
          buildSortItems(PILAH_ITEMS, State.pilahOrder, D.opsiPilah, State.pilahStates)
        )
      : '') +
    (peranOk && pilahOk
      ? panelJudul(
          '🗺️ ' + D.judulRencana,
          caption(D.instruksiRencana) +
            buildTapOrder('rencana', RENCANA_ITEMS, State.rencanaState, {
              answer: RENCANA_JAWAB,
              startLabel: 'Langkah pertama',
              endLabel: 'Langkah terakhir',
              separator: '→',
              successText:
                '<strong>Rencana tersusun!</strong> Amati → hitung residu → bandingkan dengan JKR → hitung garis terbaik dengan teknologi → estimasi & laporan. Rencana ini kalian jalankan pada tiga penyelidikan berikutnya.',
            })
        )
      : '') +
    (peranOk && pilahOk && rencanaOk ? buildDlNextButton('organisasiNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-peran]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.peranPilih = btn.dataset.peran;
      saveState();
      rerender();
    });
  });
  if (peranOk) bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  if (peranOk && pilahOk) {
    bindTapOrder(container, 'rencana', State.rencanaState, RENCANA_JAWAB, saveState, rerender);
  }
  bindNext('organisasiNextBtn', 'organisasi', 'selidikResidu');
}

/* ============================================================
   7. STAGE: PENYELIDIKAN A — RESIDU  (PBL — sintaks 3)
   Lab Garis (bebas) → hitung ŷ & e tiga proyek terhadap garis Sari
   (kartu dibuka satu per satu) → pertanyaan penuntun makna residu.
   ============================================================ */

function labDicoba() {
  return (State.lab.geser || 0) >= GESER_MINIMAL;
}

function kartuResiduSelesai(k) {
  return State.hitungStates[k.id].e.done;
}

function semuaResiduSelesai() {
  return KARTU_RESIDU.every(kartuResiduSelesai);
}

function buildKartuResidu(k, i) {
  var st = State.hitungStates[k.id];
  var p = k.p;
  var persamaan = fmtPersamaanRegresi(GARIS_HITUNG.m, GARIS_HITUNG.c);
  var langkahY = {
    label:
      'Prediksi garis Sari (' +
      esc(persamaan) +
      '): ŷ = ' +
      esc(fmtAngkaReg(GARIS_HITUNG.m)) +
      ' × ' +
      p.x +
      ' − ' +
      esc(fmtAngkaReg(Math.abs(GARIS_HITUNG.c))) +
      ' = …',
    jawab: k.yTopi,
    hints: [esc(k.hints[0]), 'Kalikan dulu, baru kurangkan.'],
    temuan: 'ŷ = ' + esc(fmtAngkaReg(k.yTopi)) + ' jam.',
    allowNegative: true,
    rational: true,
  };
  var e = st.e;
  var eHTML = '';
  if (st.yTopi.done) {
    if (e.done) {
      eHTML =
        '<div class="dl-step dl-step--done">' +
        '<p class="dl-step__label">Residu e = y − ŷ</p>' +
        '<p class="dl-step__answer">✓ ' +
        esc(e.input) +
        '</p>' +
        buildFeedbackBox('success', '💡', esc(pesanDiagnosaResidu('benar', p.y, k.yTopi))) +
        '</div>';
    } else {
      eHTML =
        '<div class="dl-step">' +
        '<p class="dl-step__label">Residu e = y − ŷ = ' +
        p.y +
        ' − ' +
        esc(fmtAngkaReg(k.yTopi)) +
        ' = …</p>' +
        '<div class="dl-input-row">' +
        buildDlNumInput('res-' + k.id + '-eInput', e.input, {
          error: !!e.kode,
          allowNegative: true,
          aria: 'Residu proyek ' + p.nama,
        }) +
        '<button type="button" class="btn btn--primary" id="res-' +
        k.id +
        '-eCheck">Periksa</button>' +
        buildHintToggle('res-' + k.id + '-eHint', [k.hints[1]], e.hintLevel) +
        '</div>' +
        (e.kode
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              'warning',
              '💭',
              '<strong>' +
                esc(e.input) +
                '</strong> — ' +
                esc(pesanDiagnosaResidu(e.kode, p.y, k.yTopi))
            ) +
            '</div>'
          : '') +
        buildHintStack([esc(k.hints[1])], e.hintLevel) +
        '</div>';
    }
  }
  return (
    '<div class="residu-card' +
    (e.done ? ' is-done' : '') +
    '">' +
    '<p class="dl-step__label"><span class="dl-step__num">' +
    (i + 1) +
    '</span><strong>' +
    esc(p.nama) +
    '</strong> — x = ' +
    p.x +
    ' SP, y = ' +
    p.y +
    ' jam</p>' +
    buildDlStep('res-' + k.id + '-y', st.yTopi, langkahY) +
    eHTML +
    '</div>'
  );
}

function bindKartuResidu(k, rerender) {
  var st = State.hitungStates[k.id];
  var p = k.p;
  bindDlStep(
    'res-' + k.id + '-y',
    st.yTopi,
    { jawab: k.yTopi, hints: k.hints, rational: true },
    saveState,
    rerender
  );
  var inp = document.getElementById('res-' + k.id + '-eInput');
  var btn = document.getElementById('res-' + k.id + '-eCheck');
  var hint = document.getElementById('res-' + k.id + '-eHint');
  if (inp && btn) {
    inp.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') btn.click();
    });
    btn.addEventListener('click', function () {
      var parsed = parseInputAngka(inp.value);
      if (parsed.error) {
        showNotice(
          parsed.error === 'empty'
            ? 'Isi residunya terlebih dahulu.'
            : 'Tulis residu berupa bilangan, mis. 7 atau −5.'
        );
        return;
      }
      st.e.input = inp.value.trim();
      st.e.attempts += 1;
      var kode = diagnosaResidu(parsed.value, p.y, k.yTopi);
      st.e.done = kode === 'benar';
      st.e.kode = st.e.done ? null : kode;
      saveState();
      rerender();
    });
  }
  if (hint) {
    hint.addEventListener('click', function () {
      st.e.hintLevel = 1;
      saveState();
      rerender();
    });
  }
}

function renderSelidikResidu(container) {
  var D = DATA.selidikResidu;
  var rerender = function () {
    renderJagaFokus(function () {
      renderSelidikResidu(container);
    });
  };
  var labOk = labDicoba();
  var kartu = '';
  var aktif = [];
  for (var i = 0; i < KARTU_RESIDU.length; i++) {
    kartu += buildKartuResidu(KARTU_RESIDU[i], i);
    aktif.push(KARTU_RESIDU[i]);
    if (!kartuResiduSelesai(KARTU_RESIDU[i])) break;
  }
  var hitungOk = semuaResiduSelesai();
  var tanyaOk = hitungOk && guidedQuizAllCorrect(TANYA_RESIDU, State.residuPilih);

  container.innerHTML =
    '<section aria-label="Penyelidikan A: Residu">' +
    buildHead(D) +
    panelJudul(
      '🧪 ' + D.judulLab,
      caption(D.instruksiLab) +
        buildLineFitLab('labGaris', PROYEK, State.lab, LAB_OPTS) +
        '<div id="labStatus">' +
        (labOk
          ? buildFeedbackBox(
              'success',
              '✓',
              'Bagus! Kamu sudah mencoba menggeser garis. Lanjutkan ke perhitungan di bawah.'
            )
          : buildFeedbackBox(
              'info',
              '👆',
              'Geser slider atau tekan tombol − / + beberapa kali untuk membuka langkah berikutnya.'
            )) +
        '</div>'
    ) +
    (labOk
      ? panelJudul(
          '📏 ' + D.judulHitung,
          plotProyek({
            garis: {
              m: GARIS_HITUNG.m,
              c: GARIS_HITUNG.c,
              label: 'Garis Sari: ' + fmtPersamaanRegresi(GARIS_HITUNG.m, GARIS_HITUNG.c),
            },
            tampil: 'residu',
            sorot: optionIds(KARTU_RESIDU),
            caption: 'Diagram pencar dengan garis Sari dan residu tiap proyek',
          }) +
            '<div class="residu-list">' +
            kartu +
            '</div>'
        )
      : '') +
    (hitungOk
      ? panelJudul(
          '🔎 Tafsirkan residunya',
          buildGuidedQuizList(TANYA_RESIDU, State.residuOrders, State.residuPilih)
        )
      : '') +
    (tanyaOk ? buildTemuanPanel(D.temuan) + buildDlNextButton('residuNextBtn', D.nextLabel) : '') +
    '</section>';

  bindLineFitLab(container, 'labGaris', PROYEK, State.lab, LAB_OPTS, saveState, function () {
    if (!labOk && labDicoba()) rerender();
  });
  if (labOk) {
    aktif.forEach(function (k) {
      bindKartuResidu(k, rerender);
    });
  }
  if (hitungOk) {
    bindGuidedQuizList(container, TANYA_RESIDU, State.residuPilih, saveState, rerender);
  }
  bindNext('residuNextBtn', 'selidikResidu', 'selidikKriteria');
}

/* ============================================================
   8. STAGE: PENYELIDIKAN B — KRITERIA GARIS TERBAIK  (PBL — sintaks 3)
   A. data mini (Σe vs JKR) → B. banding tiga garis usulan →
   C. tantangan Lab Garis mengalahkan JKR garis Dimas.
   ============================================================ */

function miniSelesai() {
  return LANGKAH_MINI.every(function (l) {
    return State.miniSteps[l.id].done;
  });
}

function tantanganOk() {
  return !!State.lab.rekor && State.lab.rekor.jkr < TARGET_JKR;
}

function plotMini(g) {
  return buildLineFitPlot(MINI.titik, {
    garis: g,
    tampil: 'residu',
    x: MINI.plot.x,
    y: MINI.plot.y,
    xLabel: 'Banyak fitur',
    yLabel: 'Jam kerja',
    kecil: true,
    caption: 'Data mini dengan ' + g.label + ' dan residunya',
  });
}

function buildStatusTantangan() {
  var rekor = State.lab.rekor;
  return tantanganOk()
    ? buildFeedbackBox(
        'success',
        '🏆',
        '<strong>Tantangan berhasil!</strong> Rekor JKR garismu ' +
          esc(fmtJkr(rekor.jkr)) +
          ' (' +
          esc(fmtPersamaanRegresi(rekor.m, rekor.c)) +
          ') lebih kecil dari JKR garis Dimas ' +
          esc(fmtJkr(TARGET_JKR)) +
          '. Bisakah lebih kecil lagi? Teknologi akan menjawabnya di tahap berikutnya.'
      )
    : buildFeedbackBox(
        'info',
        '🎯',
        'Target: JKR < <strong>' +
          esc(fmtJkr(TARGET_JKR)) +
          '</strong> (garis Dimas). Rekor garismu saat ini: <strong>' +
          esc(rekor ? fmtJkr(rekor.jkr) : '—') +
          '</strong>.'
      );
}

function renderSelidikKriteria(container) {
  var D = DATA.selidikKriteria;
  var rerender = function () {
    renderJagaFokus(function () {
      renderSelidikKriteria(container);
    });
  };

  var langkahHTML = '';
  var aktif = [];
  for (var i = 0; i < LANGKAH_MINI.length; i++) {
    var l = LANGKAH_MINI[i];
    langkahHTML += buildDlStep('mini-' + l.id, State.miniSteps[l.id], l, i + 1);
    aktif.push(l);
    if (!State.miniSteps[l.id].done) break;
  }
  var mOk = miniSelesai();
  var aOk = mOk && guidedQuizAllCorrect(TANYA_MINI, State.kriteriaPilih);
  var bOk = aOk && guidedQuizAllCorrect(TANYA_BANDING, State.kriteriaPilih);
  var cOk = bOk && tantanganOk();

  container.innerHTML =
    '<section aria-label="Penyelidikan B: Kriteria Garis Terbaik">' +
    buildHead(D) +
    panelJudul(
      '🧮 ' + D.judulA,
      caption(D.instruksiA) +
        '<div class="mini-grid">' +
        [MINI.garisA, MINI.garisB]
          .map(function (g) {
            return (
              '<div class="mini-card">' +
              '<p class="mini-card__judul">' +
              esc(g.label) +
              '</p>' +
              plotMini(g) +
              buildResidualTable(MINI.titik, g.m, g.c, {
                kuadrat: false,
                total: false,
                judulLabel: 'Proyek',
                xLabel: 'x',
                yLabel: 'y',
              }) +
              '</div>'
            );
          })
          .join('') +
        '</div>' +
        '<div class="mini-langkah">' +
        langkahHTML +
        '</div>' +
        (mOk ? buildGuidedQuizList(TANYA_MINI, State.kriteriaOrders, State.kriteriaPilih) : '')
    ) +
    (aOk
      ? panelJudul(
          '⚖️ ' + D.judulB,
          caption(D.instruksiB) +
            plotProyek({
              garisLain: GARIS_USULAN,
              caption: 'Diagram pencar 10 proyek dengan tiga garis usulan',
            }) +
            buildModelCompareTable(PROYEK, MODEL_USULAN, {
              caption: 'Perbandingan garis usulan untuk 10 proyek',
              sorotTerbaik: bOk,
            }) +
            buildGuidedQuizList(TANYA_BANDING, State.kriteriaOrders, State.kriteriaPilih)
        )
      : '') +
    (bOk
      ? panelJudul(
          '🏁 ' + D.judulC,
          caption(D.instruksiC) +
            buildLineFitLab(
              'labGaris',
              PROYEK,
              State.lab,
              Object.assign({}, LAB_OPTS, {
                garisLain: [
                  {
                    m: GARIS_DIMAS.m,
                    c: GARIS_DIMAS.c,
                    label: 'Garis Dimas: ' + fmtPersamaanRegresi(GARIS_DIMAS.m, GARIS_DIMAS.c),
                  },
                ],
              })
            ) +
            '<div id="tantanganStatus" aria-live="polite">' +
            buildStatusTantangan() +
            '</div>'
        )
      : '') +
    (cOk ? buildTemuanPanel(D.temuan) + buildDlNextButton('kriteriaNextBtn', D.nextLabel) : '') +
    '</section>';

  aktif.forEach(function (l) {
    bindDlStep('mini-' + l.id, State.miniSteps[l.id], l, saveState, rerender);
  });
  if (mOk) bindGuidedQuizList(container, TANYA_KRITERIA, State.kriteriaPilih, saveState, rerender);
  if (bOk) {
    bindLineFitLab(
      container,
      'labGaris',
      PROYEK,
      State.lab,
      Object.assign({}, LAB_OPTS, {
        garisLain: [
          {
            m: GARIS_DIMAS.m,
            c: GARIS_DIMAS.c,
            label: 'Garis Dimas: ' + fmtPersamaanRegresi(GARIS_DIMAS.m, GARIS_DIMAS.c),
          },
        ],
      }),
      saveState,
      function () {
        if (!cOk && tantanganOk()) {
          rerender();
        } else {
          var box = document.getElementById('tantanganStatus');
          if (box) box.innerHTML = buildStatusTantangan();
        }
      }
    );
  }
  bindNext('kriteriaNextBtn', 'selidikKriteria', 'selidikTeknologi');
}

/* ============================================================
   9. STAGE: PENYELIDIKAN C — TEKNOLOGI DIGITAL  (PBL — sintaks 3)
   Spreadsheet → jalankan regresi → panel rumus & kode → tafsir →
   lab data sendiri (opsional, tidak dinilai).
   ============================================================ */

function buildSpreadsheetData() {
  return (
    '<div class="aso-tabel-wrap"><table class="aso-tabel lf-sheet lf-sheet--data">' +
    '<caption class="aso-tabel__caption">Lembar kerja: proyek TEFA</caption>' +
    '<thead><tr><th scope="col" class="lf-sheet__pojok"></th><th scope="col">A</th><th scope="col">B</th></tr></thead><tbody>' +
    '<tr><th scope="row">1</th><td><strong>SP (x)</strong></td><td><strong>Jam (y)</strong></td></tr>' +
    PROYEK.map(function (p, i) {
      return (
        '<tr><th scope="row">' +
        (i + 2) +
        '</th><td class="aso-num">' +
        p.x +
        '</td><td class="aso-num">' +
        p.y +
        '</td></tr>'
      );
    }).join('') +
    '</tbody></table></div>'
  );
}

function renderSelidikTeknologi(container) {
  var D = DATA.selidikTeknologi;
  var rerender = function () {
    renderSelidikTeknologi(container);
  };
  var jalan = State.regresiJalan;
  var tanyaOk = jalan && guidedQuizAllCorrect(TANYA_TEKNO, State.teknoPilih);
  var rekor = State.lab.rekor;

  container.innerHTML =
    '<section aria-label="Penyelidikan C: Bantuan Teknologi Digital">' +
    buildHead(D) +
    panelJudul(
      '💻 ' + D.judulData,
      caption(D.instruksiData) +
        '<div class="tekno-grid">' +
        buildSpreadsheetData() +
        '<div class="tekno-aksi">' +
        (jalan
          ? buildRegressionPanel(PROYEK, {
              rentangX: D.rentangX,
              rentangY: D.rentangY,
              namaData: D.namaData,
            })
          : '<button type="button" class="btn btn--primary btn--large" id="jalankanRegBtn">' +
            esc(D.tombol) +
            '</button>') +
        '</div>' +
        '</div>'
    ) +
    (jalan
      ? panelJudul(
          '📈 Garis regresi vs garis lain',
          plotProyek({
            garis: {
              m: REG.m,
              c: REG.c,
              label: 'Garis regresi: ' + fmtPersamaanRegresi(REG.m, REG.c),
            },
            garisLain: [GARIS_USULAN[0]],
            tampil: 'kuadrat',
            caption: 'Diagram pencar dengan garis regresi, kuadrat residunya, dan garis Dimas',
          }) +
            buildModelCompareTable(
              PROYEK,
              MODEL_USULAN.concat(
                rekor ? [{ id: 'rekor', label: 'Rekor Lab Garis-mu', m: rekor.m, c: rekor.c }] : [],
                [{ id: 'regresi', label: 'Garis regresi (teknologi)', m: REG.m, c: REG.c }]
              ),
              { caption: 'JKR semua garis yang sudah dicoba', sorotTerbaik: true }
            ) +
            buildGuidedQuizList(TANYA_TEKNO, State.teknoOrders, State.teknoPilih)
        )
      : '') +
    (tanyaOk
      ? panelJudul(
          '🧑‍💻 ' + D.judulLab,
          caption(D.instruksiLab) +
            buildRegressionLab('regLab', State.regLab, {
              xLabel: 'x',
              yLabel: 'y',
            })
        ) +
        buildTemuanPanel(D.temuan) +
        buildDlNextButton('teknoNextBtn', D.nextLabel)
      : '') +
    '</section>';

  var run = document.getElementById('jalankanRegBtn');
  if (run) {
    run.addEventListener('click', function () {
      State.regresiJalan = true;
      saveState();
      rerender();
    });
  }
  if (jalan) bindGuidedQuizList(container, TANYA_TEKNO, State.teknoPilih, saveState, rerender);
  if (tanyaOk)
    bindRegressionLab(container, 'regLab', State.regLab, { xLabel: 'x', yLabel: 'y' }, saveState);
  bindNext('teknoNextBtn', 'selidikTeknologi', 'karya');
}

/* ============================================================
   10. STAGE: KARYA — LAPORAN ESTIMASI  (PBL — sintaks 4)
   ============================================================ */

function buildLaporan() {
  var K = DATA.karya;
  var peran = State.peranPilih ? findOptionLabel(DATA.organisasi.peran, State.peranPilih) : '';
  var besar = DATA.klien.spBesar;
  return buildInfoPoster({
    judul: K.posterJudul,
    ikon: '📨',
    rows: [
      {
        ikon: '📐',
        label: 'Model',
        nilai:
          '<strong>' +
          esc(fmtPersamaanRegresi(REG.m, REG.c)) +
          '</strong> (x = story point, ŷ = jam kerja)',
      },
      {
        ikon: '⚖️',
        label: 'Mengapa model ini',
        nilai:
          'JKR ' +
          esc(fmtJkr(REG.jkr)) +
          ' — paling kecil dibanding garis Dimas (' +
          esc(fmtJkr(TARGET_JKR)) +
          '), Sari, dan Raka. r² ≈ ' +
          esc(fmtAngkaReg(REG.r2, 3)),
      },
      {
        ikon: '⏱️',
        label: 'Estimasi kasir ' + DATA.klien.sp + ' SP',
        nilai:
          '<strong>' +
          esc(fmtAngkaReg(LANGKAH_ESTIMASI.jawab)) +
          ' jam kerja</strong> (interpolasi: 2 ≤ 16 ≤ 18)',
      },
      {
        ikon: '⚠️',
        label: 'Batas model',
        nilai:
          'Proyek ' +
          besar +
          ' SP → ± ' +
          esc(fmtAngkaReg(prediksiLinear(REG.m, REG.c, besar))) +
          ' jam hanya perkiraan kasar (ekstrapolasi).',
      },
    ].concat(peran ? [{ ikon: '👥', label: 'Peranku', nilai: esc(peran) }] : []),
    pesan: State.karyaPesan.trim() || undefined,
    footer: K.posterFooter,
  });
}

function renderKarya(container) {
  var D = DATA.karya;
  var rerender = function () {
    renderJagaFokus(function () {
      renderKarya(container);
    });
  };
  var s1 = State.karyaPilih[TANYA_MODEL.id] === TANYA_MODEL.correct;
  var s2 = s1 && State.estimasiStep.done;
  var s3 = s2 && State.karyaPilih[TANYA_JENIS.id] === TANYA_JENIS.correct;
  var s4 = s3 && State.karyaPilih[TANYA_BESAR.id] === TANYA_BESAR.correct;

  container.innerHTML =
    '<section aria-label="Menyajikan Hasil Karya">' +
    buildHead(D) +
    panelJudul(
      '📐 Pilih model',
      buildModelCompareTable(
        PROYEK,
        MODEL_USULAN.concat([{ id: 'regresi', label: 'Garis regresi', m: REG.m, c: REG.c }]),
        { caption: 'Ringkasan JKR' }
      ) + buildGuidedQuizList([TANYA_MODEL], State.karyaOrders, State.karyaPilih)
    ) +
    (s1
      ? panelJudul(
          '⏱️ Hitung estimasi untuk klien',
          buildDlStep('estimasi', State.estimasiStep, LANGKAH_ESTIMASI) +
            (State.estimasiStep.done
              ? buildGuidedQuizList([TANYA_JENIS], State.karyaOrders, State.karyaPilih)
              : '')
        )
      : '') +
    (s3
      ? panelJudul(
          '⚠️ Klien lain, proyek lebih besar',
          buildGuidedQuizList([TANYA_BESAR], State.karyaOrders, State.karyaPilih)
        )
      : '') +
    (s4
      ? buildDlPanel(
          buildTextarea('karyaPesan', D.pesanLabel, D.pesanPlaceholder, State.karyaPesan) +
            '<div class="btn-group btn-group--end" style="margin-top:var(--space-3);">' +
            '<button type="button" class="btn btn--ghost" id="posterRefreshBtn">Perbarui Laporan</button>' +
            '</div>' +
            '<div id="posterWrap">' +
            buildLaporan() +
            '</div>' +
            buildFeedbackBox(
              'info',
              '🎤',
              'Presentasikan laporan ini seolah-olah di depan klien (±2 menit). Setiap anggota menjelaskan satu baris laporan beserta alasannya.'
            ),
          'panel--hero'
        ) + buildDlNextButton('karyaNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindGuidedQuizList(container, TANYA_KARYA, State.karyaPilih, saveState, rerender);
  if (s1) bindDlStep('estimasi', State.estimasiStep, LANGKAH_ESTIMASI, saveState, rerender);
  bindTextarea('karyaPesan', 'karyaPesan');
  var refresh = document.getElementById('posterRefreshBtn');
  if (refresh) {
    refresh.addEventListener('click', function () {
      document.getElementById('posterWrap').innerHTML = buildLaporan();
    });
  }
  var nextBtn = document.getElementById('karyaNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.karyaPesan.trim()) {
        showNotice('Tulis pesan kelompokmu untuk klien lebih dulu.');
        return;
      }
      completeStage('karya');
      navigateTo('evaluasi');
    });
  }
}

/* ============================================================
   11. STAGE: EVALUASI  (PBL — sintaks 5)
   A. pendapat teman → B. dugaan vs hasil → C. simpulan.
   ============================================================ */

function buildDugaanBanding() {
  var S = DATA.orientasi;
  return (
    '<div class="dugaan-compare">' +
    S.dugaan
      .map(function (q) {
        var opsi = DUGAAN_OPSI[q.id];
        var pilih = State.dugaanPilih[q.id];
        var cocok = pilih === q.baku;
        return (
          '<div class="dugaan-row' +
          (cocok ? ' dugaan-row--ok' : '') +
          '">' +
          '<span class="dugaan-row__title">' +
          esc(q.tanya) +
          '</span>' +
          '<span>Dugaanmu: <strong>' +
          (findOptionLabel(opsi, pilih) || '—') +
          '</strong></span>' +
          '<span>Hasil penyelidikan: <strong>' +
          findOptionLabel(opsi, q.baku) +
          '</strong> — ' +
          esc(q.pembahasan) +
          '</span>' +
          '<span class="dugaan-row__verdict">' +
          (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh penyelidikanmu') +
          '</span>' +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    (State.masalahHipotesis
      ? '<div class="hipotesis-box">' +
        '<span class="hipotesis-box__label">Hipotesis kelompokmu di tahap 1</span>' +
        '<p>' +
        esc(State.masalahHipotesis) +
        '</p>' +
        '<span class="dl-caption">Apakah hipotesismu sesuai dengan hasil penyelidikan? Diskusikan dalam kelompok.</span>' +
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali hasil penyelidikanmu, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');
}

function renderEvaluasi(container) {
  var D = DATA.evaluasi;
  var rerender = function () {
    renderEvaluasi(container);
  };
  var aOk = sortItemsAllAnswered(PENDAPAT_ITEMS, State.pendapatStates);
  var benarSemua = simpulanSemuaBenar();

  container.innerHTML =
    '<section aria-label="Analisis dan Evaluasi">' +
    buildHead(D) +
    panelJudul(
      '🗣️ ' + D.judulA,
      buildSortItems(PENDAPAT_ITEMS, State.pendapatOrder, D.opsiPendapat, State.pendapatStates)
    ) +
    (aOk ? panelJudul('🔁 ' + D.judulB, buildDugaanBanding()) : '') +
    (aOk
      ? panelJudul(
          '🧩 ' + D.judulC,
          caption(D.instruksiC) +
            buildSimpulan() +
            (benarSemua
              ? buildFeedbackBox(
                  'success',
                  '✓',
                  '<strong>Simpulan kelompokmu lengkap dan tepat.</strong> Inilah cara yang kalian temukan dan buktikan sendiri.'
                )
              : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
                '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Simpulan</button>' +
                '</div>')
        )
      : '') +
    (aOk && benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman: Model Linear Terbaik</h3>' +
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
        ) + buildDlNextButton('evaluasiNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindSortItems(container, PENDAPAT_ITEMS, State.pendapatStates, saveState, rerender);

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
   dipilih acak. Isian dibaca parseInputAngka (koma desimal); soal
   residu memakai diagnosaResidu untuk umpan balik tanda terbalik.
   ============================================================ */

function yTopiSoal(s) {
  return prediksiLinear(s.cek.m, s.cek.c, s.cek.x);
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
  inputMode: 'text',
  allowNegative: true,
  inputAriaLabel: 'Jawabanmu',
  inputPlaceholder: 'mis. 65 atau 32,3',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  invalidMessage: 'Tulis jawaban berupa bilangan, gunakan koma untuk desimal, mis. 32,3.',
  parseInput: function (val) {
    return parseInputAngka(val);
  },
  checkValue: function (s) {
    return s.jawab;
  },
  isCorrect: function (value, s) {
    return hampirSama(value, s.jawab);
  },
  inputSuffix: function (s) {
    return s.satuan ? '<span class="dl-caption">' + esc(s.satuan) + '</span>' : '';
  },
  inputErrorHTML: function (s, ex) {
    if (s.diagnosa === 'residu') {
      var v = parseInputAngka(ex.userInput).value;
      var yh = yTopiSoal(s);
      return (
        '<strong>' +
        esc(ex.userInput) +
        '</strong> — ' +
        esc(pesanDiagnosaResidu(diagnosaResidu(v, s.cek.y, yh), s.cek.y, yh))
      );
    }
    return (
      '<strong>' +
      esc(ex.userInput) +
      '</strong> belum tepat. Periksa lagi substitusi dan urutan operasinya.'
    );
  },
  revealText: function (s) {
    return esc(s.reveal + ' ' + s.explanation);
  },
  renderPrompt: function (s) {
    var tag = s.type === 'choice' ? 'Pilihan ganda' : '✏️ Isian';
    return (
      '<div class="dl-prompt">' +
      '<span class="bbk-soal-tag">' +
      esc(tag) +
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
  var residuSekali = KARTU_RESIDU.filter(function (k) {
    var e = State.hitungStates[k.id].e;
    return e.done && e.attempts === 1;
  }).length;
  var rekor = State.lab.rekor;
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
        kartu(residuSekali + '/' + KARTU_RESIDU.length, 'Residu tepat sekali periksa') +
        kartu(
          esc(rekor ? fmtJkr(rekor.jkr) : '—'),
          'Rekor JKR Lab Garis-mu (regresi: ' + esc(fmtJkr(REG.jkr)) + ')'
        ) +
        kartu(String(State.lab.geser || 0), 'Kali menggeser garis') +
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
    '<div class="contoh-grid">' +
    D.contoh
      .map(function (c) {
        return (
          '<div class="formula-card"><span class="formula-card__label"><span aria-hidden="true">' +
          c.ikon +
          '</span> ' +
          esc(c.nama) +
          '</span>' +
          '<span class="contoh-isi">' +
          esc(c.isi) +
          '</span>' +
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
    'Presentasi Laporan Estimasi dan penjelasan lisan murid tentang alasan memilih model tetap menjadi bahan penilaian utama.' +
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
  selidikResidu: renderSelidikResidu,
  selidikKriteria: renderSelidikKriteria,
  selidikTeknologi: renderSelidikTeknologi,
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
