'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Deret Aritmetika & Rumus Jumlah n Suku Pertama
   Fase F — SMK Rekayasa Perangkat Lunak, Problem Based Learning

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen umum: buildDiscoveryHead, buildTeacherNote,
       buildChoiceGroup, buildSortItems, buildGuidedQuizList,
       buildDlPanel, buildDlNextButton, buildDlStep, buildInfoPoster;
     • seksi 14 (urut-ketuk): ensureTapOrderState, buildTapOrder,
       bindTapOrder;
     • seksi 21 (deret): sukuAritmetika, jumlahAritmetika, daftarSuku,
       jumlahBerjalan, subskrip, buildSeriesFillTable,
       buildSeriesCheckTable;
     • seksi 42 (jumlah n suku pertama): fmtAngkaDeret, tulisDeret,
       pasanganGauss, nMinimalJumlahMencapai, diagnosaJumlahDeret,
       opsiJumlahDeret, nilaiPolaJumlahDeret, buildGaussPairTable,
       buildStaircaseSeriesSVG, buildPartialSumLab,
       buildJumlahDeretStep.

   Alur tahap mengikuti sintaks Problem Based Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan, rumusan masalah, peran,
   butir & kategori pemilahan, kartu rencana, pertanyaan penuntun setiap
   penyelidikan, pemilahan barisan/deret, keputusan karya, pendapat
   teman, bank kesimpulan, soal & opsi uji terap, penilaian diri) DIACAK
   dengan shuffleArray() melalui ensureShuffledOrder() /
   ensureSortStates() / ensureTapOrderState(). Pengacakan dilakukan SEKALI
   saat state disiapkan (initExerciseArrays) lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat saat
   dirender ulang, tetapi teracak ulang untuk setiap murid dan setiap
   Reset.

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi Masalah       (PBL sintaks 1)
    6. Stage: Organisasi              (PBL sintaks 2)
    7. Stage: Barisan & Deret         (PBL sintaks 3a)
    8. Stage: Pasangan Suku (Gauss)   (PBL sintaks 3b)
    9. Stage: Merumuskan & Menguji    (PBL sintaks 3c)
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
var STORAGE_KEY = 'mpi-f-1-3-jumlah-deret-pbl-v1';

var M = DATA.masalah;
var SAT = M.satuan;

/* Kunci masalah pemantik dihitung engine (bukan disalin). */
var U_HARI = sukuAritmetika(M.a, M.b, M.hari);
var S_HARI = jumlahAritmetika(M.a, M.b, M.hari);
var N_TARGET = nMinimalJumlahMencapai(M.a, M.b, M.target);
var S_SETAHUN = jumlahAritmetika(M.a, M.b, M.hariSetahun);

function fmt(v) {
  return fmtAngkaDeret(v);
}

function lblU(n) {
  return 'U' + subskrip(n);
}

function lblS(n) {
  return 'S' + subskrip(n);
}

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

/* Butir pemilahan dengan teks & penjelasan aman. */
function butirPilah(p) {
  return { id: p.id, teks: esc(p.teks), correct: p.correct, explanation: esc(p.explanation) };
}

var DUGAAN_OPSI = {};
DATA.orientasi.dugaan.forEach(function (q) {
  DUGAAN_OPSI[q.id] = opsiAman(q.opsi);
});
var MASALAH_OPSI = opsiAman(DATA.orientasi.masalahOpsi);

var PILAH_ITEMS = DATA.organisasi.pilah.map(butirPilah);
var RENCANA_ITEMS = DATA.organisasi.rencana.map(function (r) {
  return { id: r.id, label: esc(r.label), aria: r.label };
});
var RENCANA_JAWAB = optionIds(DATA.organisasi.rencana);

/* Tahap 3 — konsep deret */
var KONSEP_SUKU = daftarSuku('aritmetika', M.a, M.b, DATA.selidikKonsep.hariTabel);
var KONSEP_JUMLAH = jumlahBerjalan(KONSEP_SUKU);
var KONSEP_KOLOM = [
  { id: 'u', label: 'Uₙ (XP hari ke-n)', values: KONSEP_SUKU },
  { id: 's', label: 'Sₙ (total XP)', values: KONSEP_JUMLAH, editable: true },
];
var TANYA_KONSEP = DATA.selidikKonsep.tanya.map(siapkanGuided);
var DERET_ITEMS = DATA.selidikKonsep.pilah.map(butirPilah);

/* Tahap 4 — pasangan suku */
var PAS = DATA.selidikPasangan;
var PAS_SUKU = daftarSuku('aritmetika', M.a, M.b, PAS.hari);
var PAS_NILAI = pasanganGauss(PAS_SUKU)[0].jumlah;
var LANGKAH_PASANGAN = PAS.langkah.map(function (l) {
  return {
    id: l.id,
    label: esc(l.label),
    jawab: l.ukuran === 'duaS' ? PAS.hari * PAS_NILAI : jumlahAritmetika(M.a, M.b, PAS.hari),
    hints: l.hints.map(esc),
    temuan: esc(l.temuan),
  };
});
var TANYA_PASANGAN = PAS.tanya.map(siapkanGuided);

/* Tahap 5 — rumus */
var RUM = DATA.selidikRumus;
var TANYA_RAKIT = RUM.tanyaRakit.map(siapkanGuided);
var TANYA_UJI = siapkanGuided(RUM.tanyaUji);
var TANYA_KODE = (function () {
  var q = siapkanGuided(RUM.tanyaKode);
  q.opsi = RUM.tanyaKode.opsi.map(function (o) {
    return { id: o.id, label: '<code class="kode-opsi">' + esc(o.label) + '</code>' };
  });
  return q;
})();
var TANYA_RUMUS = TANYA_RAKIT.concat([TANYA_UJI, TANYA_KODE]);

/* Baris tabel uji: total manual vs hasil satu cara untuk n = 1..ujiN. */
function barisUji(pola) {
  var manual = jumlahBerjalan(daftarSuku('aritmetika', M.a, M.b, RUM.ujiN));
  return manual.map(function (s, i) {
    return { n: i + 1, manual: s, rumus: nilaiPolaJumlahDeret(pola, M.a, M.b, i + 1) };
  });
}

/* Tahap 6 — karya */
var KAR = DATA.karya;
var LANGKAH_SUKU = {
  label: esc(KAR.langkahSuku.label),
  jawab: U_HARI,
  hints: KAR.langkahSuku.hints.map(esc),
  temuan: esc(KAR.langkahSuku.temuan),
};
var LANGKAH_JUMLAH = {
  label: esc(KAR.labelJumlah),
  a: M.a,
  b: M.b,
  n: M.hari,
  hints: KAR.hintsJumlah,
  temuan:
    lblS(M.hari) + ' = ' + fmt(S_HARI) + ' ' + SAT + ' — inilah syarat lencana "Coder Konsisten".',
  satuan: SAT,
};
var LAB_CFG = {
  a: M.a,
  b: M.b,
  target: M.target,
  maks: KAR.labMaks,
  satuan: SAT,
  label: 'Hari ke-n (banyak suku)',
};
var LANGKAH_TARGET = {
  label: esc(KAR.langkahTarget.label),
  jawab: N_TARGET,
  hints: KAR.langkahTarget.hints.map(esc),
  temuan: esc(KAR.langkahTarget.temuan),
};
var TANYA_SETAHUN = siapkanGuided(KAR.tanyaSetahun);
var TANYA_KARYA = [TANYA_SETAHUN];

/* Tahap 7 — evaluasi */
var PENDAPAT_ITEMS = DATA.evaluasi.pendapat.map(butirPilah);

/*
 * Bank soal uji terap dengan label opsi aman. Soal bertanda `gen`
 * dibangkitkan opsinya dari engine: kunci + tiga pengecoh miskonsepsi.
 */
var TERAP_BANK = DATA.terapkan.soal.map(function (s) {
  var c = {};
  Object.keys(s).forEach(function (k) {
    c[k] = s[k];
  });
  if (s.gen) {
    c.options = opsiJumlahDeret(s.gen.a, s.gen.b, s.gen.n, {
      satuan: s.gen.satuan,
      maks: 4,
    }).map(function (o) {
      return { id: o.id, label: esc(o.label) };
    });
    c.correct = 'benar';
  } else if (s.options) {
    c.options = opsiAman(s.options);
  }
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

  /* Tahap 3 — barisan & deret */
  konsepInputs: {},
  konsepChecked: false,
  konsepOk: false,
  konsepHint: 0,
  konsepOrders: {},
  konsepPilih: {},
  deretStates: {},
  deretOrder: null,

  /* Tahap 4 — pasangan suku */
  tanggaBalik: false,
  tanggaPernahBalik: false,
  gaussTapped: [],
  pasanganSteps: {},
  pasanganOrders: {},
  pasanganPilih: {},

  /* Tahap 5 — rumus */
  rumusOrders: {},
  rumusPilih: {},
  ujiDicoba: {},
  ujiAktif: null,

  /* Tahap 6 — karya */
  sukuStep: null,
  jumlahStep: null,
  lab: null,
  targetStep: null,
  karyaOrders: {},
  karyaPilih: {},
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

function ensureGaussTapped() {
  var t = State.gaussTapped;
  if (!Array.isArray(t) || t.length !== PAS.hari) {
    State.gaussTapped = PAS_SUKU.map(function () {
      return false;
    });
  }
}

function ensureLab() {
  var st = State.lab;
  if (!st || typeof st.n !== 'number') State.lab = makePartialSumLabState(1);
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
  var inputs = ensureMap('konsepInputs');
  if (!Array.isArray(inputs.s)) inputs.s = [];
  ensureListOrders('konsepOrders', TANYA_KONSEP);
  ensureMap('konsepPilih');
  ensureSortStates(State, 'deretStates', 'deretOrder', DERET_ITEMS, DATA.selidikKonsep.opsiPilah);

  /* Tahap 4 */
  ensureGaussTapped();
  var pSteps = ensureMap('pasanganSteps');
  LANGKAH_PASANGAN.forEach(function (l) {
    if (!stepValid(pSteps[l.id])) pSteps[l.id] = makeDlStep();
  });
  ensureListOrders('pasanganOrders', TANYA_PASANGAN);
  ensureMap('pasanganPilih');

  /* Tahap 5 */
  ensureListOrders('rumusOrders', TANYA_RUMUS);
  ensureMap('rumusPilih');
  ensureMap('ujiDicoba');

  /* Tahap 6 */
  if (!stepValid(State.sukuStep)) State.sukuStep = makeDlStep();
  if (!stepValid(State.jumlahStep)) State.jumlahStep = makeJumlahDeretStep();
  ensureLab();
  if (!stepValid(State.targetStep)) State.targetStep = makeDlStep();
  ensureListOrders('karyaOrders', TANYA_KARYA);
  ensureMap('karyaPilih');

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

/*
 * Merender ulang tahap sambil menjaga fokus keyboard (mis. tombol yang
 * baru diketuk) agar murid tidak kehilangan posisinya.
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

/* Tabel XP harian beberapa hari pertama (orientasi). */
function buildTabelXP(n) {
  var suku = daftarSuku('aritmetika', M.a, M.b, n);
  return (
    '<div class="xp-tabel-wrap"><table class="xp-tabel">' +
    '<caption class="xp-tabel__caption">XP login harian ' +
    esc(M.aplikasi) +
    '</caption>' +
    '<tbody><tr><th scope="row">Hari ke-</th>' +
    suku
      .map(function (v, i) {
        return '<td>' + (i + 1) + '</td>';
      })
      .join('') +
    '<td>…</td><td>' +
    M.hari +
    '</td></tr>' +
    '<tr><th scope="row">XP hari itu</th>' +
    suku
      .map(function (v) {
        return '<td><strong>' + esc(fmt(v)) + '</strong></td>';
      })
      .join('') +
    '<td>…</td><td><strong>?</strong></td></tr>' +
    '</tbody></table></div>'
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

function buildUsulanList() {
  return (
    '<ul class="usulan-list">' +
    DATA.usulan
      .map(function (u, i) {
        var nilai = nilaiPolaJumlahDeret(u.pola, M.a, M.b, M.hari);
        return (
          '<li class="usulan-card usulan-card--' +
          i +
          '">' +
          '<strong>' +
          esc(u.label) +
          '</strong>' +
          '<span class="usulan-card__rumus">' +
          esc(u.rumus) +
          '</span>' +
          '<span class="usulan-card__hasil">= ' +
          esc(fmt(nilai)) +
          ' ' +
          esc(SAT) +
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
        '<span class="klien-chat__avatar" aria-hidden="true">🏅</span>' +
        '<p class="klien-chat__bubble">' +
        esc(D.pesanKlien) +
        '</p>' +
        '</div>' +
        buildTabelXP(M.hariTabel) +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        buildUsulanList(),
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
                '<strong>Rencana tersusun!</strong> XP harian vs total → pasangan suku → rumus & uji → hitung pesanan klien → laporan. Rencana ini kalian jalankan pada tiga penyelidikan berikutnya.',
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
  bindNext('organisasiNextBtn', 'organisasi', 'selidikKonsep');
}

/* ============================================================
   7. STAGE: PENYELIDIKAN A — BARISAN & DERET  (PBL — sintaks 3)
   Tabel jumlah berjalan → pertanyaan penuntun → pilah barisan/deret.
   ============================================================ */

function renderSelidikKonsep(container) {
  var D = DATA.selidikKonsep;
  var rerender = function () {
    renderJagaFokus(function () {
      renderSelidikKonsep(container);
    });
  };
  var tabelOk = State.konsepOk;
  var tanyaOk = tabelOk && guidedQuizAllCorrect(TANYA_KONSEP, State.konsepPilih);
  var pilahOk = tanyaOk && sortItemsAllAnswered(DERET_ITEMS, State.deretStates);

  container.innerHTML =
    '<section aria-label="Penyelidikan A: Barisan dan Deret">' +
    buildHead(D) +
    panelJudul(
      '📋 ' + D.judulTabel,
      caption(D.instruksiTabel) +
        buildSeriesFillTable('tabelXP', KONSEP_KOLOM, State.konsepInputs, {
          checked: State.konsepChecked,
          locked: tabelOk,
          caption: 'Tabel XP harian dan total XP enam hari pertama',
        }) +
        (tabelOk
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              'success',
              '✓',
              'Tabel lengkap! Barisan XP harian: ' +
                esc(KONSEP_SUKU.map(fmt).join(', ')) +
                '. Deret (total 6 hari): ' +
                esc(tulisDeret(M.a, M.b, D.hariTabel)) +
                ' = <strong>' +
                esc(fmt(KONSEP_JUMLAH[KONSEP_JUMLAH.length - 1])) +
                '</strong>.'
            ) +
            '</div>'
          : '<div class="btn-group" style="margin-top:var(--space-3);">' +
            '<button type="button" class="btn btn--primary" id="tabelCheckBtn">Periksa Tabel</button>' +
            buildHintToggle('tabelHintBtn', D.hintsTabel, State.konsepHint) +
            '</div>' +
            buildHintStack(D.hintsTabel.map(esc), State.konsepHint))
    ) +
    (tabelOk
      ? panelJudul(
          '🔎 Apa bedanya Uₙ dan Sₙ?',
          buildGuidedQuizList(TANYA_KONSEP, State.konsepOrders, State.konsepPilih)
        )
      : '') +
    (tanyaOk
      ? panelJudul(
          '🗂️ ' + D.judulPilah,
          caption(D.instruksiPilah) +
            buildSortItems(DERET_ITEMS, State.deretOrder, D.opsiPilah, State.deretStates, {
              mono: true,
            })
        )
      : '') +
    (pilahOk ? buildTemuanPanel(D.temuan) + buildDlNextButton('konsepNextBtn', D.nextLabel) : '') +
    '</section>';

  if (!tabelOk) {
    bindSeriesFillTable(container, 'tabelXP', State.konsepInputs, saveState, function () {
      var btn = document.getElementById('tabelCheckBtn');
      if (btn) btn.click();
    });
    var check = document.getElementById('tabelCheckBtn');
    if (check) {
      check.addEventListener('click', function () {
        var isi = State.konsepInputs.s || [];
        var kosong = KONSEP_JUMLAH.some(function (v, i) {
          return !isi[i] || String(isi[i]).trim() === '';
        });
        if (kosong) {
          showNotice('Lengkapi semua sel kolom Sₙ lebih dulu.');
          return;
        }
        State.konsepChecked = true;
        State.konsepOk = seriesFillTableAllCorrect(KONSEP_KOLOM, State.konsepInputs);
        saveState();
        if (!State.konsepOk) showNotice('Masih ada sel yang belum tepat (✗). Periksa lagi.');
        rerender();
      });
    }
    var hint = document.getElementById('tabelHintBtn');
    if (hint) {
      hint.addEventListener('click', function () {
        State.konsepHint = Math.min(State.konsepHint + 1, D.hintsTabel.length);
        saveState();
        rerender();
      });
    }
  }
  if (tabelOk) {
    bindGuidedQuizList(container, TANYA_KONSEP, State.konsepPilih, saveState, rerender);
  }
  if (tanyaOk) bindSortItems(container, DERET_ITEMS, State.deretStates, saveState, rerender);
  bindNext('konsepNextBtn', 'selidikKonsep', 'selidikPasangan');
}

/* ============================================================
   8. STAGE: PENYELIDIKAN B — PASANGAN SUKU (TRIK GAUSS)  (sintaks 3)
   Tangga XP dibalik & ditumpuk → tabel pasangan maju–mundur →
   hitung 2S₆ & S₆ → pertanyaan penuntun.
   ============================================================ */

function pasanganLangkahSelesai() {
  return LANGKAH_PASANGAN.every(function (l) {
    return State.pasanganSteps[l.id].done;
  });
}

function renderSelidikPasangan(container) {
  var D = PAS;
  var rerender = function () {
    renderJagaFokus(function () {
      renderSelidikPasangan(container);
    });
  };
  var label = lblS(D.hari);
  var tanggaOk = State.tanggaPernahBalik;
  var gaussOk = tanggaOk && gaussPairAllTapped(State.gaussTapped, D.hari);

  var langkahHTML = '';
  var aktif = [];
  if (gaussOk) {
    for (var i = 0; i < LANGKAH_PASANGAN.length; i++) {
      var l = LANGKAH_PASANGAN[i];
      langkahHTML += buildDlStep('pas-' + l.id, State.pasanganSteps[l.id], l, i + 1);
      aktif.push(l);
      if (!State.pasanganSteps[l.id].done) break;
    }
  }
  var langkahOk = gaussOk && pasanganLangkahSelesai();
  var tanyaOk = langkahOk && guidedQuizAllCorrect(TANYA_PASANGAN, State.pasanganPilih);

  container.innerHTML =
    '<section aria-label="Penyelidikan B: Pasangan Suku">' +
    buildHead(D) +
    panelJudul(
      '🪜 ' + D.judulTangga,
      caption(D.instruksiTangga) +
        '<p class="deret-tulis">' +
        esc(label) +
        ' = ' +
        esc(tulisDeret(M.a, M.b, D.hari)) +
        '</p>' +
        buildStaircaseSeriesSVG(PAS_SUKU, {
          flipped: State.tanggaBalik,
          caption: State.tanggaBalik
            ? 'Tangga XP 6 hari dan salinannya yang dibalik membentuk persegi panjang 6 × ' +
              fmt(PAS_NILAI)
            : 'Tangga XP 6 hari: batang setinggi XP tiap hari',
        }) +
        '<div class="btn-group">' +
        '<button type="button" class="btn ' +
        (State.tanggaBalik ? 'btn--ghost' : 'btn--primary') +
        '" id="tanggaBtn" aria-pressed="' +
        State.tanggaBalik +
        '">' +
        esc(State.tanggaBalik ? D.tombolUlang : D.tombolBalik) +
        '</button>' +
        '</div>' +
        (State.tanggaBalik
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              'info',
              '👀',
              'Setiap kolom kini setinggi ' +
                esc(fmt(PAS_NILAI)) +
                ' — sama semua! Persegi panjang ini berisi DUA tangga XP. Buktikan dengan tabel pasangan di bawah.'
            ) +
            '</div>'
          : '')
    ) +
    (tanggaOk
      ? panelJudul(
          '🔗 ' + D.judulPasangan,
          caption(D.instruksiPasangan) +
            buildGaussPairTable('gauss', PAS_SUKU, State.gaussTapped, { label: label }) +
            (gaussOk ? '<div class="pasangan-langkah">' + langkahHTML + '</div>' : '')
        )
      : '') +
    (langkahOk
      ? panelJudul(
          '🧠 Mengapa cara ini berhasil?',
          buildGuidedQuizList(TANYA_PASANGAN, State.pasanganOrders, State.pasanganPilih)
        )
      : '') +
    (tanyaOk
      ? buildTemuanPanel(D.temuan) + buildDlNextButton('pasanganNextBtn', D.nextLabel)
      : '') +
    '</section>';

  document.getElementById('tanggaBtn').addEventListener('click', function () {
    State.tanggaBalik = !State.tanggaBalik;
    if (State.tanggaBalik) State.tanggaPernahBalik = true;
    saveState();
    rerender();
  });
  if (tanggaOk) bindGaussPairTable(container, 'gauss', State.gaussTapped, saveState, rerender);
  aktif.forEach(function (l) {
    bindDlStep('pas-' + l.id, State.pasanganSteps[l.id], l, saveState, rerender);
  });
  if (langkahOk) {
    bindGuidedQuizList(container, TANYA_PASANGAN, State.pasanganPilih, saveState, rerender);
  }
  bindNext('pasanganNextBtn', 'selidikPasangan', 'selidikRumus');
}

/* ============================================================
   9. STAGE: PENYELIDIKAN C — MERUMUSKAN & MENGUJI  (sintaks 3)
   A. rakit rumus → B. uji rumus, cara Dimas & Raka → C. fungsi JS.
   ============================================================ */

function ujiSemuaDicoba() {
  return RUM.uji.every(function (u) {
    return !!State.ujiDicoba[u.id];
  });
}

function buildUjiPanel() {
  var tombol = RUM.uji
    .map(function (u) {
      var aktif = State.ujiAktif === u.id;
      return (
        '<button type="button" class="btn ' +
        (aktif ? 'btn--primary' : 'btn--ghost') +
        ' uji-btn" data-uji="' +
        esc(u.id) +
        '" aria-pressed="' +
        aktif +
        '">' +
        (State.ujiDicoba[u.id] ? '✓ ' : '') +
        esc(u.label) +
        '</button>'
      );
    })
    .join('');
  var aktif = RUM.uji.filter(function (u) {
    return u.id === State.ujiAktif;
  })[0];
  return (
    '<div class="uji-pilih" role="group" aria-label="Pilih cara yang diuji">' +
    tombol +
    '</div>' +
    (aktif
      ? buildSeriesCheckTable(barisUji(aktif.pola), {
          manualLabel: 'Total XP (dijumlah satu per satu)',
          rumusLabel: aktif.label,
          caption: 'Uji ' + aktif.label + ' untuk n = 1 sampai ' + RUM.ujiN,
        })
      : caption('Belum ada cara yang dipilih.'))
  );
}

function buildKodePanel(tampilHasil) {
  var kode =
    'function jumlahDeret(a, b, n) {\n' +
    '  // a = suku pertama, b = beda, n = banyak suku\n' +
    '  ' +
    (tampilHasil ? RUM.tanyaKode.opsi[0].label : '/* ??? */') +
    '\n}';
  var hasil = tampilHasil
    ? '\n\n' +
      RUM.kodeUji
        .map(function (k) {
          return (
            '> jumlahDeret(' +
            M.a +
            ', ' +
            M.b +
            ', ' +
            k.n +
            ')\n' +
            jumlahAritmetika(M.a, M.b, k.n) +
            '   // ' +
            k.catatan
          );
        })
        .join('\n')
    : '';
  return '<pre class="lf-kode"><code>' + esc(kode + hasil) + '</code></pre>';
}

function renderSelidikRumus(container) {
  var D = RUM;
  var rerender = function () {
    renderJagaFokus(function () {
      renderSelidikRumus(container);
    });
  };
  var aOk = guidedQuizAllCorrect(TANYA_RAKIT, State.rumusPilih);
  var ujiOk = aOk && ujiSemuaDicoba();
  var bOk = ujiOk && State.rumusPilih[TANYA_UJI.id] === TANYA_UJI.correct;
  var cOk = bOk && State.rumusPilih[TANYA_KODE.id] === TANYA_KODE.correct;

  container.innerHTML =
    '<section aria-label="Penyelidikan C: Merumuskan dan Menguji">' +
    buildHead(D) +
    panelJudul(
      '🧩 ' + D.judulRakit,
      caption(D.instruksiRakit) +
        '<p class="deret-tulis">2Sₙ = n(a + Uₙ)</p>' +
        buildGuidedQuizList(TANYA_RAKIT, State.rumusOrders, State.rumusPilih)
    ) +
    (aOk
      ? panelJudul(
          '🧪 ' + D.judulUji,
          caption(D.instruksiUji) +
            '<p class="deret-tulis">a = ' +
            M.a +
            ', b = ' +
            M.b +
            ' → ' +
            esc(tulisDeret(M.a, M.b, D.ujiN, D.ujiN)) +
            '</p>' +
            '<div id="ujiPanel">' +
            buildUjiPanel() +
            '</div>' +
            (ujiOk
              ? buildGuidedQuizList([TANYA_UJI], State.rumusOrders, State.rumusPilih)
              : caption('Uji ketiga cara untuk membuka pertanyaan kesimpulan.'))
        )
      : '') +
    (bOk
      ? panelJudul(
          '💻 ' + D.judulKode,
          caption(D.instruksiKode) +
            buildKodePanel(cOk) +
            buildGuidedQuizList([TANYA_KODE], State.rumusOrders, State.rumusPilih)
        )
      : '') +
    (cOk ? buildTemuanPanel(D.temuan) + buildDlNextButton('rumusNextBtn', D.nextLabel) : '') +
    '</section>';

  bindGuidedQuizList(container, TANYA_RUMUS, State.rumusPilih, saveState, rerender);
  container.querySelectorAll('[data-uji]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sudahSemua = ujiSemuaDicoba();
      State.ujiAktif = btn.dataset.uji;
      State.ujiDicoba[btn.dataset.uji] = true;
      saveState();
      rerender();
      if (!sudahSemua && ujiSemuaDicoba()) {
        showNotice('Ketiga cara sudah diuji. Jawab pertanyaan kesimpulannya.');
      }
    });
  });
  bindNext('rumusNextBtn', 'selidikRumus', 'karya');
}

/* ============================================================
   10. STAGE: KARYA — LAPORAN LENCANA  (PBL — sintaks 4)
   U₃₀ → S₃₀ berdiagnosa → lab 1.000 XP → hari minimal → lencana
   setahun → pesan klien & Laporan Lencana.
   ============================================================ */

function buildLaporan() {
  var K = KAR;
  var peran = State.peranPilih ? findOptionLabel(DATA.organisasi.peran, State.peranPilih) : '';
  return buildInfoPoster({
    judul: K.posterJudul,
    ikon: '🏅',
    rows: [
      {
        ikon: '➕',
        label: 'Deret XP 30 hari',
        nilai:
          esc(tulisDeret(M.a, M.b, M.hari)) +
          ' (a = ' +
          M.a +
          ', b = ' +
          M.b +
          ', n = ' +
          M.hari +
          ')',
      },
      {
        ikon: '🧮',
        label: 'Rumus',
        nilai: '<strong>Sₙ = n/2 (a + Uₙ) = n/2 (2a + (n − 1)b)</strong>',
      },
      {
        ikon: '🏅',
        label: 'Syarat lencana Coder Konsisten',
        nilai:
          lblS(M.hari) +
          ' = ' +
          M.hari +
          '/2 × (' +
          M.a +
          ' + ' +
          U_HARI +
          ') = <strong>' +
          esc(fmt(S_HARI)) +
          ' ' +
          esc(SAT) +
          '</strong>',
      },
      {
        ikon: '🥉',
        label: 'Level Perunggu (' + fmt(M.target) + ' ' + SAT + ')',
        nilai:
          'Tercapai pada <strong>hari ke-' +
          N_TARGET +
          '</strong> (' +
          lblS(N_TARGET - 1) +
          ' = ' +
          esc(fmt(jumlahAritmetika(M.a, M.b, N_TARGET - 1))) +
          ', ' +
          lblS(N_TARGET) +
          ' = ' +
          esc(fmt(jumlahAritmetika(M.a, M.b, N_TARGET))) +
          ')',
      },
      {
        ikon: '📅',
        label: 'Bonus: lencana Coder Setahun',
        nilai: 'S₃₆₅ = <strong>' + esc(fmt(S_SETAHUN)) + ' ' + esc(SAT) + '</strong>',
      },
    ].concat(peran ? [{ ikon: '👥', label: 'Peranku', nilai: esc(peran) }] : []),
    pesan: State.karyaPesan.trim() || undefined,
    footer: K.posterFooter,
  });
}

function renderKarya(container) {
  var D = KAR;
  var rerender = function () {
    renderJagaFokus(function () {
      renderKarya(container);
    });
  };
  var s1 = State.sukuStep.done;
  var s2 = s1 && State.jumlahStep.done;
  var s3 = s2 && State.targetStep.done;
  var s4 = s3 && State.karyaPilih[TANYA_SETAHUN.id] === TANYA_SETAHUN.correct;

  container.innerHTML =
    '<section aria-label="Menyajikan Hasil Karya">' +
    buildHead(D) +
    panelJudul(
      '🏅 ' + D.judulHitung,
      '<p class="deret-tulis">' +
        esc(lblS(M.hari)) +
        ' = ' +
        esc(tulisDeret(M.a, M.b, M.hari)) +
        '</p>' +
        '<div class="karya-langkah">' +
        buildDlStep('suku', State.sukuStep, LANGKAH_SUKU, 1) +
        (s1 ? buildJumlahDeretStep('jumlah', State.jumlahStep, LANGKAH_JUMLAH) : '') +
        '</div>'
    ) +
    (s2
      ? panelJudul(
          '🥉 ' + D.judulLab,
          caption(D.instruksiLab) +
            buildPartialSumLab('labXP', State.lab, LAB_CFG) +
            buildDlStep('target', State.targetStep, LANGKAH_TARGET) +
            (s3 ? buildGuidedQuizList(TANYA_KARYA, State.karyaOrders, State.karyaPilih) : '')
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
              'Presentasikan laporan ini seolah-olah di depan Kak Rani (±2 menit). Setiap anggota menjelaskan satu baris laporan beserta cara menghitungnya.'
            ),
          'panel--hero'
        ) + buildDlNextButton('karyaNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindDlStep('suku', State.sukuStep, LANGKAH_SUKU, saveState, rerender);
  if (s1) bindJumlahDeretStep('jumlah', State.jumlahStep, LANGKAH_JUMLAH, saveState, rerender);
  if (s2) {
    bindPartialSumLab(container, 'labXP', State.lab, LAB_CFG, saveState);
    bindDlStep('target', State.targetStep, LANGKAH_TARGET, saveState, rerender);
  }
  if (s3) bindGuidedQuizList(container, TANYA_KARYA, State.karyaPilih, saveState, rerender);
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
                  '<strong>Simpulan kelompokmu lengkap dan tepat.</strong> Inilah konsep dan rumus yang kalian temukan dan buktikan sendiri.'
                )
              : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
                '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Simpulan</button>' +
                '</div>')
        )
      : '') +
    (aOk && benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman: Deret Aritmetika</h3>' +
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
   dipilih acak. Isian dibaca parseInputAngka (titik ribuan); soal
   jumlah deret memakai diagnosaJumlahDeret untuk umpan balik
   miskonsepsi (lupa ÷ 2, n × Uₙ, nb, …).
   ============================================================ */

/* a, b, n soal isian untuk diagnosa; null bila soal bukan soal Sₙ. */
function deretSoal(s) {
  var c = s.cek;
  if (!c) return null;
  if (c.tipe === 'jumlah') return { a: c.a, b: c.b, n: c.n };
  if (c.tipe === 'ujung') return { a: c.a, b: (c.un - c.a) / (c.n - 1), n: c.n };
  return null;
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
  inputPlaceholder: 'mis. 258 atau 1.070',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  invalidMessage: 'Tulis jawaban berupa bilangan, mis. 258 atau 1.070.',
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
    var d = deretSoal(s);
    if (d) {
      var v = parseInputAngka(ex.userInput).value;
      var kode = diagnosaJumlahDeret(d.a, d.b, d.n, v);
      return (
        '<strong>' +
        esc(ex.userInput) +
        '</strong> — ' +
        esc(pesanDiagnosaJumlahDeret(kode, d.a, d.b, d.n))
      );
    }
    return (
      '<strong>' +
      esc(ex.userInput) +
      '</strong> belum tepat. Periksa lagi apa yang ditanyakan: suku (Uₙ) atau jumlah (Sₙ)?'
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
  var js = State.jumlahStep;
  var benarTerap = State.terapkanExercises.filter(function (e) {
    return e.correct;
  }).length;
  var gaussTap = State.gaussTapped.filter(function (t) {
    return t;
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
        kartu(gaussTap + '/' + PAS.hari, 'Pasangan Gauss dijumlahkan') +
        kartu(
          js.done ? (js.attempts === 1 ? '✓ 1×' : '✓ ' + js.attempts + '×') : '—',
          'Percobaan menghitung ' + lblS(M.hari)
        ) +
        kartu(String(State.lab.geser || 0), 'Kali menggeser lab 1.000 XP') +
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
    '<span class="done-card__icon">🏅</span>' +
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
    'Presentasi Laporan Lencana dan penjelasan lisan murid tentang asal-usul rumus Sₙ (pasangan suku) tetap menjadi bahan penilaian utama.' +
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
  selidikKonsep: renderSelidikKonsep,
  selidikPasangan: renderSelidikPasangan,
  selidikRumus: renderSelidikRumus,
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
