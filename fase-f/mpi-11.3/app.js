'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Koefisien Korelasi & Kesesuaian Model Linear
   Fase F — SMK Rekayasa Perangkat Lunak, Problem Based Learning

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen umum: buildDiscoveryHead, buildTeacherNote, buildTpPanel,
       buildChoiceGroup, buildSortItems, buildGuidedQuizList,
       buildDlPanel, buildDlNextButton, buildDlStep, buildInfoPoster;
     • seksi 14 (urut-ketuk): ensureTapOrderState, buildTapOrder,
       bindTapOrder;
     • seksi 33 & 41: buildScatterPlot, buildLineFitPlot, regresiLinear,
       fmtAngkaReg, fmtPersamaanRegresi;
     • seksi 50 (koefisien korelasi & kesesuaian model linear):
       tafsirKorelasi, rincianKorelasi, diagnosaKorelasi,
       pesanDiagnosaKorelasi, keputusanModelLinear, dataDenganKorelasi,
       buildRMeter, buildCorrelationStepTable, buildResidualPlot,
       buildCorrelationExplorer/bindCorrelationExplorer,
       buildOutlierLab/bindOutlierLab, buildCorrelationPanel.

   Alur tahap mengikuti sintaks Problem Based Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan, rumusan masalah, peran,
   butir & kategori pemilahan, kartu rencana, nilai r tantangan tebak r,
   pertanyaan penuntun setiap penyelidikan, kelompok arah–kekuatan, pola
   residu, keputusan karya, pendapat teman, bank kesimpulan, soal & opsi
   uji terap, penilaian diri) DIACAK dengan shuffleArray() melalui
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
    7. Stage: Arah & Kekuatan         (PBL sintaks 3a)
    8. Stage: Menghitung r            (PBL sintaks 3b)
    9. Stage: Kesesuaian Model        (PBL sintaks 3c)
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
var STORAGE_KEY = 'mpi-f-11-3-korelasi-pbl-v1';

var PASANGAN = DATA.pasangan;

function pasanganById(id) {
  return PASANGAN.filter(function (p) {
    return p.id === id;
  })[0];
}

/* Hasil analisis tiap pasangan dihitung langsung dari data (bukan disalin). */
var ANALISIS = {};
PASANGAN.forEach(function (p) {
  ANALISIS[p.id] = keputusanModelLinear(p.titik);
});

/* Id kelompok arah–kekuatan: 'kuatPositif', 'sedangNegatif', 'sangatLemah', … */
function kelompokPasangan(h) {
  if (h.kekuatan === 'sangatLemah') return 'sangatLemah';
  return h.kekuatan + h.arah.charAt(0).toUpperCase() + h.arah.slice(1);
}

function fmtR(v) {
  return fmtAngkaReg(v, 2);
}

/* Titik pasangan A + akun uji QA untuk Lab Pencilan. */
var PASANGAN_A = pasanganById('A');
var TITIK_PENCILAN = PASANGAN_A.titik
  .map(function (t, i) {
    return { id: t.id, x: t.x, y: t.y, nama: 'Pengguna ' + (i + 1) };
  })
  .concat([DATA.pencilan]);
var LAB_PENCILAN_OPTS = {
  x: PASANGAN_A.plot.x,
  y: PASANGAN_A.plot.y,
  xLabel: PASANGAN_A.xNama,
  yLabel: PASANGAN_A.yNama,
  caption: 'Lab Pencilan: diagram pencar pasangan A dengan akun uji QA',
};

var JELAJAH_OPTS = { xLabel: 'Variabel x', yLabel: 'Variabel y' };

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

/* Tahap 3 — tantangan tebak r: opsi = semua nilai r tebakan. */
var TEBAK = DATA.selidikArah.tebak.map(function (t, i) {
  return {
    id: t.id,
    r: t.r,
    nomor: i + 1,
    titik: dataDenganKorelasi(t.r, 20),
  };
});
var OPSI_TEBAK = TEBAK.map(function (t) {
  return { id: t.id, label: esc('r = ' + fmtR(t.r)) };
});
var TANYA_ARAH = DATA.selidikArah.tanya.map(siapkanGuided);

/* Tahap 4 — langkah hitung r data mini; kunci dihitung engine. */
var MINI = DATA.selidikHitung.mini;
var RINCI_MINI = rincianKorelasi(MINI.titik);
var LANGKAH_MINI = DATA.selidikHitung.langkah.map(function (l) {
  return {
    id: l.id,
    label: esc(l.label),
    jawab: RINCI_MINI[l.kunci],
    hints: l.hints.map(esc),
    temuan: esc(l.temuan),
    allowNegative: true,
    rational: true,
  };
});

var KELOMPOK_ITEMS = PASANGAN.map(function (p) {
  var h = ANALISIS[p.id];
  return {
    id: p.id,
    teks: esc(p.ikon + ' ' + p.id + '. ' + p.judul + ' — r = ' + fmtR(h.r)),
    correct: kelompokPasangan(h),
    explanation: esc(
      (h.r > 0 ? 'r positif' : 'r negatif') +
        ' dan |r| = ' +
        fmtR(Math.abs(h.r)) +
        ' → ' +
        tafsirKorelasi(h.r).label +
        '.'
    ),
  };
});
var TANYA_PENCILAN = DATA.selidikHitung.tanyaPencilan.map(siapkanGuided);

/* Tahap 5 */
var TANYA_R2 = siapkanGuided(DATA.selidikKesesuaian.tanyaR2);
var TANYA_SESUAI = DATA.selidikKesesuaian.tanyaSesuai.map(siapkanGuided);
var OPSI_POLA = opsiAman(DATA.selidikKesesuaian.opsiPola);

/* Tahap 6 */
var OPSI_KEPUTUSAN = opsiAman(DATA.karya.opsiKeputusan);

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

  /* Tahap 3 — arah & kekuatan */
  jelajah: null,
  tebakOrders: {},
  tebakPilih: {},
  arahOrders: {},
  arahPilih: {},

  /* Tahap 4 — hitung r */
  miniSteps: {},
  rStep: null,
  korelasiJalan: false,
  kelompokStates: {},
  kelompokOrder: null,
  labPencilan: null,
  pencilanOrders: {},
  pencilanPilih: {},

  /* Tahap 5 — kesesuaian */
  r2Orders: {},
  r2Pilih: {},
  polaOrders: {},
  polaPilih: {},
  sesuaiOrders: {},
  sesuaiPilih: {},

  /* Tahap 6 — karya */
  keputusanOrders: {},
  keputusanPilih: {},
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

function ensureLabs() {
  var j = State.jelajah;
  if (!j || typeof j.r !== 'number') State.jelajah = makeCorrelationExplorerState(0.5);
  var lp = State.labPencilan;
  if (!lp || !Array.isArray(lp.mati)) State.labPencilan = makeOutlierLabState();
  var rs = State.rStep;
  if (!rs || typeof rs.done !== 'boolean') {
    State.rStep = { input: '', done: false, kode: null, attempts: 0, hintLevel: 0 };
  }
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
  ensureLabs();
  var tebakOrders = ensureMap('tebakOrders');
  TEBAK.forEach(function (t) {
    ensureShuffledOrder(tebakOrders, t.id, OPSI_TEBAK);
  });
  ensureMap('tebakPilih');
  ensureListOrders('arahOrders', TANYA_ARAH);
  ensureMap('arahPilih');

  /* Tahap 4 */
  var mini = ensureMap('miniSteps');
  LANGKAH_MINI.forEach(function (l) {
    if (!stepValid(mini[l.id])) mini[l.id] = makeDlStep();
  });
  ensureSortStates(
    State,
    'kelompokStates',
    'kelompokOrder',
    KELOMPOK_ITEMS,
    DATA.selidikHitung.opsiKelompok
  );
  ensureListOrders('pencilanOrders', TANYA_PENCILAN);
  ensureMap('pencilanPilih');

  /* Tahap 5 */
  ensureListOrders('r2Orders', [TANYA_R2]);
  ensureMap('r2Pilih');
  var polaOrders = ensureMap('polaOrders');
  DATA.selidikKesesuaian.residuPasangan.forEach(function (id) {
    ensureShuffledOrder(polaOrders, id, DATA.selidikKesesuaian.opsiPola);
  });
  ensureMap('polaPilih');
  ensureListOrders('sesuaiOrders', TANYA_SESUAI);
  ensureMap('sesuaiPilih');

  /* Tahap 6 */
  var keputusanOrders = ensureMap('keputusanOrders');
  PASANGAN.forEach(function (p) {
    ensureShuffledOrder(keputusanOrders, p.id, DATA.karya.opsiKeputusan);
  });
  ensureMap('keputusanPilih');

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

function buildTemuanPanel(items) {
  return buildDlPanel(
    '<h3 style="margin-top:0;">💡 Temuan kelompok</h3>' +
      '<ul class="temuan-list">' +
      items
        .map(function (t) {
          return '<li>' + esc(t) + '</li>';
        })
        .join('') +
      '</ul>',
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

/* Merender ulang tahap sambil menjaga fokus keyboard (slider, tombol titik). */
function renderJagaFokus(fn) {
  var aktif = document.activeElement;
  var id = aktif && aktif.id;
  fn();
  if (id) {
    var el = document.getElementById(id);
    if (el) el.focus();
  }
}

/* Diagram pencar satu pasangan metrik (opsi garis regresi & residu). */
function plotPasangan(p, opts) {
  opts = opts || {};
  var h = ANALISIS[p.id];
  return buildLineFitPlot(p.titik, {
    garis: opts.garis
      ? { m: h.m, c: h.c, label: 'Garis regresi: ' + fmtPersamaanRegresi(h.m, h.c) }
      : null,
    tampil: opts.tampil || 'tidak',
    x: p.plot.x,
    y: p.plot.y,
    xLabel: p.xNama,
    yLabel: p.yNama,
    kecil: opts.kecil,
    caption: 'Diagram pencar pasangan ' + p.id + ': ' + p.xNama + ' dan ' + p.yNama,
  });
}

/* Tabel data pasangan yang bisa dibuka-tutup. */
function buildTabelPasangan(p) {
  return (
    '<details class="kor-data">' +
    '<summary>📋 Lihat tabel data ' +
    esc(p.id) +
    '</summary>' +
    '<div class="aso-tabel-wrap"><table class="aso-tabel">' +
    '<thead><tr><th scope="col">No.</th><th scope="col">' +
    esc(p.xNama) +
    ' (x)</th><th scope="col">' +
    esc(p.yNama) +
    ' (y)</th></tr></thead><tbody>' +
    p.titik
      .map(function (t, i) {
        return (
          '<tr><th scope="row">' +
          (i + 1) +
          '</th><td class="aso-num">' +
          esc(fmtAngkaReg(t.x)) +
          '</td><td class="aso-num">' +
          esc(fmtAngkaReg(t.y)) +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table></div>' +
    '</details>'
  );
}

/* Kartu ringkas satu pasangan: judul + diagram pencar kecil. */
function buildKartuPasangan(p, isi) {
  return (
    '<article class="pasangan-card">' +
    '<h4 class="pasangan-card__judul"><span aria-hidden="true">' +
    p.ikon +
    '</span> ' +
    esc(p.id + '. ' + p.judul) +
    '</h4>' +
    isi +
    '</article>'
  );
}

function buildPasanganGrid(fn) {
  return (
    '<div class="pasangan-grid">' +
    PASANGAN.map(function (p) {
      return buildKartuPasangan(p, fn(p));
    }).join('') +
    '</div>'
  );
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
        '<span class="klien-chat__avatar" aria-hidden="true">👩‍💼</span>' +
        '<p class="klien-chat__bubble">' +
        esc(D.pesanKlien) +
        '</p>' +
        '</div>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        buildPasanganGrid(function (p) {
          return plotPasangan(p, { kecil: true }) + buildTabelPasangan(p);
        }),
      'panel--hero'
    ) +
    buildTpPanel(D) +
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
                '<strong>Rencana tersusun!</strong> Amati → kenali arah & kekuatan → hitung r → periksa kesesuaian model → rekomendasi. Rencana ini kalian jalankan pada tiga penyelidikan berikutnya.',
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
  bindNext('organisasiNextBtn', 'organisasi', 'selidikArah');
}

/* ============================================================
   7. STAGE: PENYELIDIKAN A — ARAH & KEKUATAN  (PBL — sintaks 3)
   Penjelajah r → tantangan tebak r → pertanyaan penuntun.
   ============================================================ */

function jelajahDicoba() {
  return (State.jelajah.geser || 0) >= DATA.selidikArah.geserMinimal;
}

function tebakSemuaBenar() {
  return TEBAK.every(function (t) {
    return State.tebakPilih[t.id] === t.id;
  });
}

/* Umpan balik tebakan keliru: arah dulu, baru kerapatan. */
function umpanTebak(t, pilihId) {
  var pilih = TEBAK.filter(function (x) {
    return x.id === pilihId;
  })[0];
  var a = tafsirKorelasi(t.r).arah;
  var b = tafsirKorelasi(pilih.r).arah;
  if (a !== b) {
    return 'Perhatikan ARAH titik-titiknya dulu: naik (r positif), turun (r negatif), atau tanpa arah (r ≈ 0)?';
  }
  return 'Arahnya sudah cocok. Sekarang perhatikan KERAPATAN: makin rapat titik di sekitar garis, makin dekat |r| ke 1.';
}

function buildStatusJelajah() {
  return jelajahDicoba()
    ? buildFeedbackBox(
        'success',
        '✓',
        'Bagus! Kamu sudah menjelajahi berbagai nilai r. Lanjutkan ke tantangan di bawah.'
      )
    : buildFeedbackBox(
        'info',
        '👆',
        'Geser slider atau tekan − / + beberapa kali (coba r = −1, 0, dan 1) untuk membuka tantangan berikutnya.'
      );
}

function buildTebakHTML() {
  return (
    '<div class="tebak-grid">' +
    TEBAK.map(function (t) {
      var pilih = State.tebakPilih[t.id] || null;
      var benar = pilih === t.id;
      return (
        '<article class="tebak-card' +
        (benar ? ' is-done' : '') +
        '">' +
        '<h4 class="pasangan-card__judul">Diagram ' +
        t.nomor +
        '</h4>' +
        buildScatterPlot(t.titik, {
          x: { min: 0, max: 100, step: 20 },
          y: { min: 0, max: 100, step: 20 },
          kecil: true,
          caption: 'Diagram pencar tantangan nomor ' + t.nomor,
        }) +
        buildChoiceGroup(OPSI_TEBAK, State.tebakOrders[t.id], {
          chosen: pilih,
          correctId: benar ? t.id : null,
          grade: true,
          locked: benar,
          group: t.id,
          attr: 'data-tebak',
        }) +
        (pilih
          ? '<div style="margin-top:var(--space-3);">' +
            (benar
              ? buildFeedbackBox(
                  'success',
                  '✓',
                  'Tepat! ' + esc('r = ' + fmtR(t.r) + ' → ' + tafsirKorelasi(t.r).label + '.')
                )
              : buildFeedbackBox('warning', '💭', esc(umpanTebak(t, pilih)))) +
            '</div>'
          : '') +
        '</article>'
      );
    }).join('') +
    '</div>'
  );
}

function renderSelidikArah(container) {
  var D = DATA.selidikArah;
  var rerender = function () {
    renderJagaFokus(function () {
      renderSelidikArah(container);
    });
  };
  var jOk = jelajahDicoba();
  var tebakOk = jOk && tebakSemuaBenar();
  var tanyaOk = tebakOk && guidedQuizAllCorrect(TANYA_ARAH, State.arahPilih);

  container.innerHTML =
    '<section aria-label="Penyelidikan A: Arah dan Kekuatan">' +
    buildHead(D) +
    panelJudul(
      '🧪 ' + D.judulJelajah,
      caption(D.instruksiJelajah) +
        buildCorrelationExplorer('jelajahR', State.jelajah, JELAJAH_OPTS) +
        '<div id="jelajahStatus" class="kor-status">' +
        buildStatusJelajah() +
        '</div>'
    ) +
    (jOk ? panelJudul('🎯 ' + D.judulTebak, caption(D.instruksiTebak) + buildTebakHTML()) : '') +
    (tebakOk
      ? panelJudul(
          '🔎 Arah & kekuatan',
          buildGuidedQuizList(TANYA_ARAH, State.arahOrders, State.arahPilih)
        )
      : '') +
    (tanyaOk ? buildTemuanPanel(D.temuan) + buildDlNextButton('arahNextBtn', D.nextLabel) : '') +
    '</section>';

  bindCorrelationExplorer(
    container,
    'jelajahR',
    State.jelajah,
    JELAJAH_OPTS,
    saveState,
    function () {
      if (!jOk && jelajahDicoba()) rerender();
    }
  );
  container.querySelectorAll('[data-tebak]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var gid = btn.dataset.group;
      if (State.tebakPilih[gid] === gid) return;
      State.tebakPilih[gid] = btn.dataset.tebak;
      saveState();
      rerender();
    });
  });
  if (tebakOk) bindGuidedQuizList(container, TANYA_ARAH, State.arahPilih, saveState, rerender);
  bindNext('arahNextBtn', 'selidikArah', 'selidikHitung');
}

/* ============================================================
   8. STAGE: PENYELIDIKAN B — MENGHITUNG r  (PBL — sintaks 3)
   A. langkah Sxy, Sxx, Syy, r data mini → B. =CORREL empat pasangan &
   pengelompokan → C. Lab Pencilan + pertanyaan penuntun.
   ============================================================ */

function miniSelesai() {
  return (
    LANGKAH_MINI.every(function (l) {
      return State.miniSteps[l.id].done;
    }) && State.rStep.done
  );
}

function buildLangkahR() {
  var D = DATA.selidikHitung.langkahR;
  var st = State.rStep;
  if (st.done) {
    return (
      '<div class="dl-step dl-step--done">' +
      '<p class="dl-step__label">' +
      esc(D.label) +
      '</p>' +
      '<p class="dl-step__answer">✓ ' +
      esc(st.input) +
      '</p>' +
      buildFeedbackBox('success', '💡', esc(pesanDiagnosaKorelasi('benar', RINCI_MINI))) +
      buildRMeter(RINCI_MINI.r, { label: 'Data uji beta' }) +
      '</div>'
    );
  }
  return (
    '<div class="dl-step">' +
    '<p class="dl-step__label"><span class="dl-step__num">' +
    (LANGKAH_MINI.length + 1) +
    '</span>' +
    esc(D.label) +
    '</p>' +
    '<div class="dl-input-row">' +
    buildDlNumInput('rMiniInput', st.input, {
      error: !!st.kode,
      allowNegative: true,
      aria: 'Koefisien korelasi r',
    }) +
    '<button type="button" class="btn btn--primary" id="rMiniCheck">Periksa</button>' +
    buildHintToggle('rMiniHint', [D.hint], st.hintLevel) +
    '</div>' +
    (st.kode
      ? '<div style="margin-top:var(--space-3);">' +
        buildFeedbackBox(
          'warning',
          '💭',
          '<strong>' +
            esc(st.input) +
            '</strong> — ' +
            esc(pesanDiagnosaKorelasi(st.kode, RINCI_MINI))
        ) +
        '</div>'
      : '') +
    buildHintStack([esc(D.hint)], st.hintLevel) +
    '</div>'
  );
}

function bindLangkahR(rerender) {
  var st = State.rStep;
  var inp = document.getElementById('rMiniInput');
  var btn = document.getElementById('rMiniCheck');
  var hint = document.getElementById('rMiniHint');
  if (inp && btn) {
    inp.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') btn.click();
    });
    btn.addEventListener('click', function () {
      var parsed = parseInputAngka(inp.value);
      if (parsed.error) {
        showNotice(
          parsed.error === 'empty'
            ? 'Isi nilai r terlebih dahulu.'
            : 'Tulis r berupa bilangan desimal dengan koma, mis. 0,5 atau −0,5.'
        );
        return;
      }
      st.input = inp.value.trim();
      st.attempts += 1;
      var kode = diagnosaKorelasi(parsed.value, RINCI_MINI);
      st.done = kode === 'benar';
      st.kode = st.done ? null : kode;
      saveState();
      rerender();
    });
  }
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = 1;
      saveState();
      rerender();
    });
  }
}

function buildHasilKorelasi() {
  var D = DATA.selidikHitung;
  var A = pasanganById('A');
  return (
    '<details class="kor-data" open>' +
    '<summary>💻 Contoh keluaran lengkap untuk pasangan A</summary>' +
    buildCorrelationPanel(A.titik, { rentangX: D.rentangX, rentangY: D.rentangY }) +
    '</details>' +
    '<div class="meter-grid">' +
    PASANGAN.map(function (p) {
      return (
        '<div class="meter-card">' +
        '<p class="meter-card__rumus"><code>' +
        esc('=CORREL(' + D.rentangX + ';' + D.rentangY + ')') +
        '</code> → <strong>' +
        esc(fmtAngkaReg(ANALISIS[p.id].r, 3)) +
        '</strong></p>' +
        buildRMeter(ANALISIS[p.id].r, { label: p.ikon + ' ' + p.id + '. ' + p.judul }) +
        '</div>'
      );
    }).join('') +
    '</div>'
  );
}

function pencilanDicoba() {
  return (State.labPencilan.ubah || 0) >= 1;
}

function renderSelidikHitung(container) {
  var D = DATA.selidikHitung;
  var rerender = function () {
    renderJagaFokus(function () {
      renderSelidikHitung(container);
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
  var tigaOk = LANGKAH_MINI.every(function (x) {
    return State.miniSteps[x.id].done;
  });
  var aOk = miniSelesai();
  var jalan = aOk && State.korelasiJalan;
  var bOk = jalan && sortItemsAllAnswered(KELOMPOK_ITEMS, State.kelompokStates);
  var labOk = bOk && pencilanDicoba();
  var cOk = labOk && guidedQuizAllCorrect(TANYA_PENCILAN, State.pencilanPilih);

  container.innerHTML =
    '<section aria-label="Penyelidikan B: Menghitung r">' +
    buildHead(D) +
    panelJudul(
      '🧮 ' + D.judulMini,
      caption(D.instruksiMini) +
        '<div class="mini-grid">' +
        '<div class="mini-card">' +
        buildScatterPlot(MINI.titik, {
          x: MINI.plot.x,
          y: MINI.plot.y,
          xLabel: 'Jam latihan (x)',
          yLabel: 'Skor kuis (y)',
          kecil: true,
          caption: 'Diagram pencar data uji beta lima penguji',
        }) +
        '</div>' +
        '<div class="mini-card">' +
        buildCorrelationStepTable(MINI.titik, {
          caption: 'Tabel langkah hitung r',
          total: tigaOk,
        }) +
        '</div>' +
        '</div>' +
        '<div class="mini-langkah">' +
        langkahHTML +
        (tigaOk ? buildLangkahR() : '') +
        '</div>'
    ) +
    (aOk
      ? panelJudul(
          '💻 ' + D.judulTekno,
          caption(D.instruksiTekno) +
            (jalan
              ? buildHasilKorelasi() +
                '<h4>' +
                esc(D.judulKelompok) +
                '</h4>' +
                buildSortItems(
                  KELOMPOK_ITEMS,
                  State.kelompokOrder,
                  D.opsiKelompok,
                  State.kelompokStates
                )
              : '<button type="button" class="btn btn--primary btn--large" id="jalankanKorBtn">' +
                esc(D.tombolTekno) +
                '</button>')
        )
      : '') +
    (bOk
      ? panelJudul(
          '🎯 ' + D.judulPencilan,
          caption(D.instruksiPencilan) +
            buildFeedbackBox('info', '🧾', esc(DATA.pencilan.nama + ': ' + DATA.pencilan.alasan)) +
            buildOutlierLab('labPencilan', TITIK_PENCILAN, State.labPencilan, LAB_PENCILAN_OPTS) +
            (labOk
              ? buildGuidedQuizList(TANYA_PENCILAN, State.pencilanOrders, State.pencilanPilih)
              : '<div class="kor-status">' +
                buildFeedbackBox(
                  'info',
                  '👆',
                  'Ketuk titik oranye "Akun uji QA" untuk mengeluarkannya dari perhitungan.'
                ) +
                '</div>')
        )
      : '') +
    (cOk ? buildTemuanPanel(D.temuan) + buildDlNextButton('hitungNextBtn', D.nextLabel) : '') +
    '</section>';

  aktif.forEach(function (x) {
    bindDlStep('mini-' + x.id, State.miniSteps[x.id], x, saveState, rerender);
  });
  if (tigaOk) bindLangkahR(rerender);
  var run = document.getElementById('jalankanKorBtn');
  if (run) {
    run.addEventListener('click', function () {
      State.korelasiJalan = true;
      saveState();
      rerender();
    });
  }
  if (jalan) bindSortItems(container, KELOMPOK_ITEMS, State.kelompokStates, saveState, rerender);
  if (bOk) {
    bindOutlierLab(
      container,
      'labPencilan',
      TITIK_PENCILAN,
      State.labPencilan,
      LAB_PENCILAN_OPTS,
      saveState,
      function () {
        if (!labOk) rerender();
      }
    );
  }
  if (labOk) {
    bindGuidedQuizList(container, TANYA_PENCILAN, State.pencilanPilih, saveState, rerender);
  }
  bindNext('hitungNextBtn', 'selidikHitung', 'selidikKesesuaian');
}

/* ============================================================
   9. STAGE: PENYELIDIKAN C — KESESUAIAN MODEL  (PBL — sintaks 3)
   A. arti r² → B. plot residu A vs C → C. pertanyaan penuntun.
   ============================================================ */

function polaSemuaBenar() {
  return DATA.selidikKesesuaian.residuPasangan.every(function (id) {
    return State.polaPilih[id] === pasanganById(id).kunci.pola;
  });
}

function buildBuktiPasangan(p) {
  var h = ANALISIS[p.id];
  return (
    '<ul class="bukti-list">' +
    '<li><span>r</span><strong>' +
    esc(fmtAngkaReg(h.r, 3)) +
    '</strong></li>' +
    '<li><span>r²</span><strong>' +
    esc(fmtAngkaReg(h.r2, 3)) +
    '</strong></li>' +
    '<li><span>Model</span><strong>' +
    esc(fmtPersamaanRegresi(h.m, h.c)) +
    '</strong></li>' +
    '</ul>'
  );
}

function buildResiduCard(id) {
  var D = DATA.selidikKesesuaian;
  var p = pasanganById(id);
  var h = ANALISIS[id];
  var pilih = State.polaPilih[id] || null;
  var kunci = p.kunci.pola;
  var benar = pilih === kunci;
  return buildKartuPasangan(
    p,
    buildBuktiPasangan(p) +
      plotPasangan(p, { garis: true, tampil: 'residu', kecil: true }) +
      buildResidualPlot(p.titik, h.m, h.c, {
        x: p.plot.x,
        xLabel: p.xNama,
        hubung: true,
        kecil: true,
        caption: 'Plot residu pasangan ' + p.id,
      }) +
      '<p class="exercise-label">Pola residu pasangan ' +
      esc(p.id) +
      ':</p>' +
      buildChoiceGroup(OPSI_POLA, State.polaOrders[id], {
        chosen: pilih,
        correctId: benar ? kunci : null,
        grade: true,
        locked: benar,
        group: id,
        attr: 'data-pola',
      }) +
      (pilih
        ? '<div style="margin-top:var(--space-3);">' +
          buildFeedbackBox(
            benar ? 'success' : 'warning',
            benar ? '✓' : '💭',
            benar
              ? esc(D.umpanPola[pilih])
              : 'Belum tepat. Baca tanda residu dari kiri ke kanan: titik hijau (+) atau merah (−)? Apakah tandanya berganti-ganti acak atau berkelompok?'
          ) +
          '</div>'
        : '')
  );
}

function renderSelidikKesesuaian(container) {
  var D = DATA.selidikKesesuaian;
  var rerender = function () {
    renderSelidikKesesuaian(container);
  };
  var aOk = State.r2Pilih[TANYA_R2.id] === TANYA_R2.correct;
  var bOk = aOk && polaSemuaBenar();
  var cOk = bOk && guidedQuizAllCorrect(TANYA_SESUAI, State.sesuaiPilih);

  container.innerHTML =
    '<section aria-label="Penyelidikan C: Kesesuaian Model Linear">' +
    buildHead(D) +
    panelJudul(
      '📊 ' + D.judulR2,
      caption(D.instruksiR2) +
        buildBuktiPasangan(PASANGAN_A) +
        buildGuidedQuizList([TANYA_R2], State.r2Orders, State.r2Pilih)
    ) +
    (aOk
      ? panelJudul(
          '📉 ' + D.judulResidu,
          caption(D.instruksiResidu) +
            '<div class="pasangan-grid pasangan-grid--dua">' +
            D.residuPasangan.map(buildResiduCard).join('') +
            '</div>'
        )
      : '') +
    (bOk
      ? panelJudul(
          '⚖️ Jadi, apakah garis lurus sesuai?',
          buildGuidedQuizList(TANYA_SESUAI, State.sesuaiOrders, State.sesuaiPilih)
        )
      : '') +
    (cOk ? buildTemuanPanel(D.temuan) + buildDlNextButton('sesuaiNextBtn', D.nextLabel) : '') +
    '</section>';

  bindGuidedQuizList(container, [TANYA_R2], State.r2Pilih, saveState, rerender);
  container.querySelectorAll('[data-pola]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.group;
      if (State.polaPilih[id] === pasanganById(id).kunci.pola) return;
      State.polaPilih[id] = btn.dataset.pola;
      saveState();
      rerender();
    });
  });
  if (bOk) bindGuidedQuizList(container, TANYA_SESUAI, State.sesuaiPilih, saveState, rerender);
  bindNext('sesuaiNextBtn', 'selidikKesesuaian', 'karya');
}

/* ============================================================
   10. STAGE: KARYA — KARTU REKOMENDASI DASBOR  (PBL — sintaks 4)
   ============================================================ */

function keputusanSemuaBenar() {
  return PASANGAN.every(function (p) {
    return State.keputusanPilih[p.id] === p.kunci.keputusan;
  });
}

function buildKartuKeputusan(p) {
  var D = DATA.karya;
  var h = ANALISIS[p.id];
  var pilih = State.keputusanPilih[p.id] || null;
  var benar = pilih === p.kunci.keputusan;
  return buildKartuPasangan(
    p,
    plotPasangan(p, { garis: true, kecil: true }) +
      '<ul class="bukti-list">' +
      '<li><span>r</span><strong>' +
      esc(fmtAngkaReg(h.r, 3)) +
      '</strong></li>' +
      '<li><span>Arah & kekuatan</span><strong>' +
      esc(h.label) +
      '</strong></li>' +
      '<li><span>r²</span><strong>' +
      esc(fmtAngkaReg(h.r2, 3)) +
      '</strong></li>' +
      '<li><span>Plot residu</span><strong>' +
      (h.pola === 'lengkung' ? 'berpola lengkung' : 'acak') +
      '</strong></li>' +
      '</ul>' +
      '<p class="exercise-label">' +
      esc(D.tanyaKeputusan) +
      '</p>' +
      buildChoiceGroup(OPSI_KEPUTUSAN, State.keputusanOrders[p.id], {
        chosen: pilih,
        correctId: benar ? p.kunci.keputusan : null,
        grade: true,
        locked: benar,
        group: p.id,
        attr: 'data-keputusan',
      }) +
      (pilih
        ? '<div style="margin-top:var(--space-3);">' +
          buildFeedbackBox(
            benar ? 'success' : 'warning',
            benar ? '✓' : '💭',
            benar
              ? esc(D.umpanKeputusan[pilih])
              : 'Belum tepat. Pakai dua bukti bersama: seberapa kuat |r|, dan apakah plot residunya acak atau berpola.'
          ) +
          '</div>'
        : '')
  );
}

function buildKartuRekomendasi() {
  var K = DATA.karya;
  var peran = State.peranPilih ? findOptionLabel(DATA.organisasi.peran, State.peranPilih) : '';
  var ikonKeputusan = { layak: '✅', bukanLinear: '〰️', lemah: '⚠️', tidakAda: '⛔' };
  return buildInfoPoster({
    judul: K.posterJudul,
    ikon: '📨',
    rows: PASANGAN.map(function (p) {
      var h = ANALISIS[p.id];
      return {
        ikon: ikonKeputusan[h.keputusan],
        label: p.id + '. ' + p.judul,
        nilai:
          'r = ' +
          esc(fmtAngkaReg(h.r, 2)) +
          ' (' +
          esc(h.label) +
          '), r² = ' +
          esc(fmtAngkaReg(h.r2, 2)) +
          ' — <strong>' +
          esc(LABEL_KEPUTUSAN_LINEAR[h.keputusan]) +
          '</strong>',
      };
    }).concat(peran ? [{ ikon: '👥', label: 'Peranku', nilai: esc(peran) }] : []),
    pesan: State.karyaPesan.trim() || undefined,
    footer: K.posterFooter,
  });
}

function renderKarya(container) {
  var D = DATA.karya;
  var rerender = function () {
    renderKarya(container);
  };
  var semua = keputusanSemuaBenar();

  container.innerHTML =
    '<section aria-label="Menyajikan Hasil Karya">' +
    buildHead(D) +
    panelJudul(
      '🧭 Putuskan untuk setiap pasangan',
      caption(D.instruksi) +
        '<div class="pasangan-grid">' +
        PASANGAN.map(buildKartuKeputusan).join('') +
        '</div>'
    ) +
    (semua
      ? buildDlPanel(
          buildTextarea('karyaPesan', D.pesanLabel, D.pesanPlaceholder, State.karyaPesan) +
            '<div class="btn-group btn-group--end" style="margin-top:var(--space-3);">' +
            '<button type="button" class="btn btn--ghost" id="posterRefreshBtn">Perbarui Kartu</button>' +
            '</div>' +
            '<div id="posterWrap">' +
            buildKartuRekomendasi() +
            '</div>' +
            buildFeedbackBox(
              'info',
              '🎤',
              'Presentasikan kartu ini seolah-olah di depan klien (± 2 menit). Setiap anggota menjelaskan satu pasangan beserta buktinya.'
            ),
          'panel--hero'
        ) + buildDlNextButton('karyaNextBtn', D.nextLabel)
      : '') +
    '</section>';

  container.querySelectorAll('[data-keputusan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.group;
      if (State.keputusanPilih[id] === pasanganById(id).kunci.keputusan) return;
      State.keputusanPilih[id] = btn.dataset.keputusan;
      saveState();
      rerender();
    });
  });
  bindTextarea('karyaPesan', 'karyaPesan');
  var refresh = document.getElementById('posterRefreshBtn');
  if (refresh) {
    refresh.addEventListener('click', function () {
      document.getElementById('posterWrap').innerHTML = buildKartuRekomendasi();
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
          '<h3 style="margin-top:0;">Rangkuman: Koefisien Korelasi & Kesesuaian Model Linear</h3>' +
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
   hitung r memakai diagnosaKorelasi untuk umpan balik miskonsepsi.
   ============================================================ */

function rinciSoal(s) {
  var c = s.cek;
  return { r: s.jawab, sxy: c.sxy, sxx: c.sxx, syy: c.syy };
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
  inputPlaceholder: 'mis. 0,75 atau −0,6',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  invalidMessage: 'Tulis jawaban berupa bilangan, gunakan koma untuk desimal, mis. 0,75.',
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
    if (s.diagnosa === 'korelasi') {
      var v = parseInputAngka(ex.userInput).value;
      var rinci = rinciSoal(s);
      return (
        '<strong>' +
        esc(ex.userInput) +
        '</strong> — ' +
        esc(pesanDiagnosaKorelasi(diagnosaKorelasi(v, rinci), rinci))
      );
    }
    return (
      '<strong>' +
      esc(ex.userInput) +
      '</strong> belum tepat. Periksa lagi perhitungan kuadrat dan tandanya.'
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
        kartu(String(State.jelajah.geser || 0), 'Kali menggeser Penjelajah r') +
        kartu(String(State.rStep.attempts || 0), 'Percobaan menghitung r data uji beta') +
        kartu(String(State.labPencilan.ubah || 0), 'Kali mencoba Lab Pencilan') +
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
    'Presentasi Kartu Rekomendasi dan penjelasan lisan murid tentang bukti r, r², dan plot residu tetap menjadi bahan penilaian utama.' +
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
  selidikArah: renderSelidikArah,
  selidikHitung: renderSelidikHitung,
  selidikKesesuaian: renderSelidikKesesuaian,
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
