'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Koordinat Kartesius, Sifat Bangun Datar & Ide Awal
   Transformasi — Fase D, SMP Kelas IX (Topik 25: Transformasi Tunggal)

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen bersama: buildDiscoveryHead, buildTeacherNote,
       buildTpPanel, buildChoiceGroup, buildSortItems,
       buildGuidedQuizList, buildDlPanel, buildDlNextButton,
       buildFeedbackBox, buildHintStack, buildHintToggle;
     • seksi 91 (bidang Kartesius & ide awal transformasi):
       buildBidangKartesius, transformasiBangun, opsiSoalKts, KTS_GERAK,
       Lab Titik (ensureLabTitikKts, buildLabTitikKts, bindLabTitikKts,
       labTitikSelesai), titik keempat (ensureTitikKeempatKts,
       buildTitikKeempatKts, bindTitikKeempatKts), dan Lab Gerak
       (ensureLabGerakKts, buildLabGerakKts, bindLabGerakKts,
       labGerakLengkap, buildLogGerakKts).

   Alur tahap mengikuti sintaks Inquiry Learning; lihat komentar
   kepala pada data.js untuk pemetaan dan rangkaian aktivitasnya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan orientasi, rumusan
   masalah, hipotesis, baca koordinat, pertanyaan bangun & temuan,
   pemilahan contoh gerak, pernyataan uji, bank kesimpulan, opsi uji
   terap, penilaian diri) DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder() / ensureSortStates(). Pengacakan dilakukan
   SEKALI saat state disiapkan (initExerciseArrays) lalu urutannya
   disimpan di State — bukan saat render — sehingga pilihan tidak
   melompat saat dirender ulang, tetapi teracak ulang untuk setiap murid
   dan setiap Reset. Soal uji terap juga dipilih acak dari bank
   (pilihSoalTerap) dan opsinya dibangun engine (opsiSoalKts).

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi               (IL sintaks 1)
    6. Stage: Merumuskan Masalah      (IL sintaks 2)
    7. Stage: Merumuskan Hipotesis    (IL sintaks 3)
    8. Stage: Lab Titik               (IL sintaks 4a)
    9. Stage: Lab Bangun              (IL sintaks 4b)
   10. Stage: Lab Gerak               (IL sintaks 4c)
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
var STORAGE_KEY = 'mpi-25-1-kts-v1';
var TUGAS_TITIK = DATA.dataTitik.tugas;
var BANGUN = DATA.dataBangun.bangun;
var LAB_GERAK = DATA.dataGerak.lab;

/* Teks DATA berupa teks biasa: di-escape sekali di sini. */
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

/* Pertanyaan berpilihan yang opsinya dibangun engine (opsiSoalKts). */
function guidedDariSoal(id, tanya, soal) {
  var opsi = opsiSoalKts(soal);
  var umpan = {};
  opsi.forEach(function (o) {
    umpan[o.id] = o.umpan;
  });
  return siapkanGuided({ id: id, tanya: tanya, opsi: opsi, correct: 'benar', umpan: umpan });
}

var DUGAAN = DATA.orientasi.dugaan.map(siapkanGuided);
var HIPOTESIS = DATA.hipotesis.dugaan.map(siapkanGuided);
var MASALAH_OPSI = opsiAman(DATA.masalah.opsi);
var TEMUAN_TITIK = DATA.dataTitik.temuan.map(siapkanGuided);
var TEMUAN_BANGUN = DATA.dataBangun.temuan.map(siapkanGuided);
var TEMUAN_GERAK = DATA.dataGerak.temuan.map(siapkanGuided);

/* Baca koordinat properti pada denah (opsi berpengecoh dari engine). */
var BACA_TITIK = DATA.dataTitik.baca.map(function (b) {
  return guidedDariSoal(
    b.id,
    'Apa koordinat ' + b.nama.toLowerCase() + ' (titik ' + b.label + ')?',
    { minta: 'koordinat', p: b.p }
  );
});

/* Dua pertanyaan untuk setiap bangun: panjang sisi & jenis bangun. */
var TANYA_BANGUN = {};
BANGUN.forEach(function (b) {
  var u = b.ukur;
  TANYA_BANGUN[b.id] = [
    guidedDariSoal(b.id + '-panjang', 'Berapa panjang ' + u.nama + '?', {
      minta: 'panjang',
      p: b.pts[u.dari],
      q: b.pts[u.ke],
      satuan: u.satuan,
    }),
    guidedDariSoal(
      b.id + '-jenis',
      'Dari tabel sifatnya, ' + b.nama.toLowerCase() + ' berbentuk …',
      {
        minta: 'jenisBangun',
        pts: b.pts,
      }
    ),
  ];
});

var SEMUA_TANYA_BANGUN = BANGUN.reduce(function (acc, b) {
  return acc.concat(TANYA_BANGUN[b.id]);
}, []);

/* Pemilahan contoh sehari-hari ke empat jenis gerak (KTS_GERAK). */
var GERAK_OPSI = KTS_GERAK.map(function (g) {
  return { id: g.id, label: esc(g.ikon + ' ' + g.nama + ' (' + g.istilah + ')') };
});
var CONTOH_ITEMS = DATA.dataGerak.contoh.map(function (c) {
  return { id: c.id, teks: esc(c.teks), correct: c.gerak, explanation: esc(c.explanation) };
});

var UJI_ITEMS = DATA.uji.pernyataan.map(function (v) {
  return { id: v.id, teks: esc(v.teks), correct: v.correct, explanation: esc(v.explanation) };
});

/* Soal uji terap: opsi dibangun engine (opsiSoalKts). */
var OPSI_TERAP = {};
DATA.terapkan.soal.forEach(function (s) {
  var opsi = opsiSoalKts(s);
  OPSI_TERAP[s.id] = opsi;
  s.type = 'choice';
  s.options = opsiAman(opsi);
  s.correct = 'benar';
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

  /* Tahap 4a — Lab Titik */
  labTitik: null,
  petunjukLevel: 0,
  bacaOrders: {},
  bacaPilih: {},
  temuanTitikOrders: {},
  temuanTitikPilih: {},

  /* Tahap 4b — Lab Bangun */
  bangunState: {},
  bangunTanyaOrders: {},
  bangunTanyaPilih: {},
  temuanBangunOrders: {},
  temuanBangunPilih: {},

  /* Tahap 4c — Lab Gerak */
  contohStates: {},
  contohOrder: null,
  labGerak: null,
  temuanGerakOrders: {},
  temuanGerakPilih: {},

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

/*
 * Soal uji terap yang sedang dipakai. Array ini DIISI ULANG di tempat
 * (bukan diganti) karena createExerciseStage menyimpan referensinya.
 */
var TERAP_SOAL = [];

/* Memilih soal acak dari bank sesuai komposisi (per `minta`), lalu mengacak urutannya. */
function pilihSoalTerap() {
  var T = DATA.terapkan;
  var pick = [];
  Object.keys(T.komposisi).forEach(function (k) {
    var kelompok = T.soal.filter(function (s) {
      return s.minta === k;
    });
    shuffleArray(kelompok)
      .slice(0, T.komposisi[k])
      .forEach(function (s) {
        pick.push(s.id);
      });
  });
  return shuffleArray(pick);
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
  State.labTitik = ensureLabTitikKts(State.labTitik, TUGAS_TITIK);
  if (typeof State.petunjukLevel !== 'number') State.petunjukLevel = 0;
  ensureListOrders('bacaOrders', BACA_TITIK);
  ensureMap('bacaPilih');
  ensureListOrders('temuanTitikOrders', TEMUAN_TITIK);
  ensureMap('temuanTitikPilih');

  /* Tahap 4b */
  var bs = ensureMap('bangunState');
  BANGUN.forEach(function (b) {
    bs[b.id] = ensureTitikKeempatKts(bs[b.id]);
  });
  ensureListOrders('bangunTanyaOrders', SEMUA_TANYA_BANGUN);
  ensureMap('bangunTanyaPilih');
  ensureListOrders('temuanBangunOrders', TEMUAN_BANGUN);
  ensureMap('temuanBangunPilih');

  /* Tahap 4c */
  ensureSortStates(State, 'contohStates', 'contohOrder', CONTOH_ITEMS, GERAK_OPSI);
  State.labGerak = ensureLabGerakKts(State.labGerak, LAB_GERAK);
  ensureListOrders('temuanGerakOrders', TEMUAN_GERAK);
  ensureMap('temuanGerakPilih');

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

/* Bagian tahap yang terkunci sampai tahap sebelumnya beres. */
function renderTerkunci(container, D, label, pesan, backId, backLabel, backStage) {
  container.innerHTML =
    '<section aria-label="' +
    esc(label) +
    '">' +
    buildHead(D) +
    buildDlPanel(buildKembaliPanel(pesan, backId, backLabel)) +
    '</section>';
  document.getElementById(backId).addEventListener('click', function () {
    navigateTo(backStage);
  });
}

/* ============================================================
   5. STAGE: ORIENTASI  (Inquiry Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah.
   ============================================================ */

function buildDenahOrientasi(G) {
  var bayangan = transformasiBangun(G.bendera, G.geser);
  return buildBidangKartesius('denahOrientasi', {
    bangun: [
      { pts: G.bendera, cls: 'asal', label: ['A', 'B', 'C'] },
      { pts: bayangan, cls: 'bayangan', label: ['A′', 'B′', 'C′'] },
    ],
    titik: [{ p: G.lampu, label: '?', cls: 'soal' }],
    judul:
      'Denah panggung berpetak dengan titik asal O di tengah. Bendera segitiga biru dengan titik A, B, C digeser menjadi bendera oranye A′, B′, C′. Lampu sorot ditandai tanda tanya di kiri atas O.',
    caption:
      'Denah panggung: bendera hias (biru) digeser ke posisi oranye; lampu sorot di titik ?.',
  });
}

function renderOrientasi(container, fokus) {
  var D = DATA.orientasi;
  var lengkap = semuaDipilih(DUGAAN, State.dugaanPilih);
  var rerender = function (sel) {
    renderOrientasi(container, sel);
  };

  container.innerHTML =
    '<section aria-label="Orientasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🎭 ' +
        esc(D.judul) +
        '</h2>' +
        '<div class="kts-orientasi">' +
        '<p class="kts-orientasi__teks">' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="kts-orientasi__gambar">' +
        buildDenahOrientasi(D.gambar) +
        '</div>' +
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
    navigateTo('dataTitik');
  });
  fokusKembali(fokus);
}

/* ============================================================
   8. STAGE: LAB TITIK  (Inquiry Learning — sintaks 4a)
   Pasang lima properti → baca koordinat → temuan.
   ============================================================ */

function buildDenahBaca() {
  return buildBidangKartesius('denahBaca', {
    titik: DATA.dataTitik.baca.map(function (b) {
      return { p: b.p, label: b.label, cls: 'soal' };
    }),
    judul:
      'Denah dengan tiga properti berlabel: ' +
      DATA.dataTitik.baca
        .map(function (b) {
          return b.nama + ' (' + b.label + ')';
        })
        .join(', '),
  });
}

function renderDataTitik(container, fokus) {
  var D = DATA.dataTitik;
  var lab = State.labTitik;
  var labOk = labTitikSelesai(lab, TUGAS_TITIK);
  var bacaOk = guidedQuizAllCorrect(BACA_TITIK, State.bacaPilih);
  var temuanOk = guidedQuizAllCorrect(TEMUAN_TITIK, State.temuanTitikPilih);
  var hints = D.petunjuk.map(esc);
  var rerender = function (sel) {
    renderDataTitik(container, sel);
  };

  container.innerHTML =
    '<section aria-label="Lab Titik">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      '<h3 style="margin-top:0;">📍 Lab Titik: pasang properti</h3>' +
        buildLabTitikKts('labTitik', TUGAS_TITIK, lab) +
        '<div class="kts-petunjuk">' +
        buildHintStack(hints, State.petunjukLevel) +
        buildHintToggle('labHintBtn', hints, State.petunjukLevel) +
        '</div>'
    ) +
    (labOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🔎 ' +
            esc(D.bacaJudul) +
            '</h3>' +
            '<div class="kts-baca">' +
            '<div class="kts-baca__gambar">' +
            buildDenahBaca() +
            '</div>' +
            '<div class="kts-baca__soal">' +
            buildGuidedQuizList(BACA_TITIK, State.bacaOrders, State.bacaPilih) +
            '</div>' +
            '</div>'
        )
      : '') +
    (labOk && bacaOk
      ? buildTemuanPanel(
          '💡 Apa temuanmu?',
          TEMUAN_TITIK,
          State.temuanTitikOrders,
          State.temuanTitikPilih
        )
      : '') +
    (labOk && bacaOk && temuanOk ? buildDlNextButton('titikNextBtn', D.nextLabel) : '') +
    '</section>';

  bindLabTitikKts(container, 'labTitik', TUGAS_TITIK, lab, saveState, rerender);

  var hintBtn = document.getElementById('labHintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      State.petunjukLevel += 1;
      saveState();
      rerender('#labHintBtn');
    });
  }
  if (labOk) bindGuidedQuizList(container, BACA_TITIK, State.bacaPilih, saveState, rerender);
  if (labOk && bacaOk) {
    bindGuidedQuizList(container, TEMUAN_TITIK, State.temuanTitikPilih, saveState, rerender);
  }
  bindNext('titikNextBtn', 'dataTitik', 'dataBangun');
  fokusKembali(fokus);
}

/* ============================================================
   9. STAGE: LAB BANGUN  (Inquiry Learning — sintaks 4b)
   Lengkapi titik keempat → tabel sifat → panjang sisi & jenis bangun.
   ============================================================ */

function bangunBeres(b) {
  return (
    State.bangunState[b.id].done && guidedQuizAllCorrect(TANYA_BANGUN[b.id], State.bangunTanyaPilih)
  );
}

function renderDataBangun(container, fokus) {
  var D = DATA.dataBangun;
  if (!labTitikSelesai(State.labTitik, TUGAS_TITIK)) {
    renderTerkunci(
      container,
      D,
      'Lab Bangun',
      'Pasang kelima properti di Lab Titik lebih dulu.',
      'bangunBackBtn',
      '← Kembali ke Lab Titik',
      'dataTitik'
    );
    return;
  }
  var semuaBeres = BANGUN.every(bangunBeres);
  var temuanOk = guidedQuizAllCorrect(TEMUAN_BANGUN, State.temuanBangunPilih);
  var rerender = function (sel) {
    renderDataBangun(container, sel);
  };

  container.innerHTML =
    '<section aria-label="Lab Bangun">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    BANGUN.map(function (b, i) {
      var st = State.bangunState[b.id];
      return buildDlPanel(
        '<h3 style="margin-top:0;">' +
          esc(b.ikon) +
          ' ' +
          (i + 1) +
          '. ' +
          esc(b.nama) +
          (bangunBeres(b) ? ' <span class="kts-beres">✓</span>' : '') +
          '</h3>' +
          buildTitikKeempatKts('bangun-' + b.id, b, st) +
          (st.done
            ? '<div class="kts-bangun-tanya">' +
              buildGuidedQuizList(
                TANYA_BANGUN[b.id],
                State.bangunTanyaOrders,
                State.bangunTanyaPilih
              ) +
              '</div>'
            : '')
      );
    }).join('') +
    (semuaBeres
      ? buildTemuanPanel(
          '💡 Apa temuanmu?',
          TEMUAN_BANGUN,
          State.temuanBangunOrders,
          State.temuanBangunPilih
        )
      : '') +
    (semuaBeres && temuanOk ? buildDlNextButton('bangunNextBtn', D.nextLabel) : '') +
    '</section>';

  BANGUN.forEach(function (b) {
    bindTitikKeempatKts(
      container,
      'bangun-' + b.id,
      b,
      State.bangunState[b.id],
      saveState,
      rerender
    );
  });
  bindGuidedQuizList(container, SEMUA_TANYA_BANGUN, State.bangunTanyaPilih, saveState, rerender);
  if (semuaBeres) {
    bindGuidedQuizList(container, TEMUAN_BANGUN, State.temuanBangunPilih, saveState, rerender);
  }
  bindNext('bangunNextBtn', 'dataBangun', 'dataGerak');
  fokusKembali(fokus);
}

/* ============================================================
   10. STAGE: LAB GERAK  (Inquiry Learning — sintaks 4c)
   A. Pilah contoh sehari-hari → B. coba keempat gerakan → temuan.
   ============================================================ */

function renderDataGerak(container, fokus) {
  var D = DATA.dataGerak;
  if (!BANGUN.every(bangunBeres)) {
    renderTerkunci(
      container,
      D,
      'Lab Gerak',
      'Selesaikan ketiga bangun di Lab Bangun lebih dulu.',
      'gerakBackBtn',
      '← Kembali ke Lab Bangun',
      'dataBangun'
    );
    return;
  }
  var contohOk = sortItemsAllAnswered(CONTOH_ITEMS, State.contohStates);
  var labOk = labGerakLengkap(State.labGerak, LAB_GERAK);
  var temuanOk = guidedQuizAllCorrect(TEMUAN_GERAK, State.temuanGerakPilih);
  var rerender = function (sel) {
    renderDataGerak(container, sel);
  };

  container.innerHTML =
    '<section aria-label="Lab Gerak">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.contohJudul) +
        '</h3>' +
        buildSortItems(CONTOH_ITEMS, State.contohOrder, GERAK_OPSI, State.contohStates)
    ) +
    (contohOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🧪 ' +
            esc(D.labJudul) +
            '</h3>' +
            buildLabGerakKts('labGerak', State.labGerak, LAB_GERAK) +
            '<div class="kts-log-wrap">' +
            buildLogGerakKts(State.labGerak, LAB_GERAK) +
            '</div>' +
            (labOk
              ? buildFeedbackBox(
                  'success',
                  '✓',
                  '<strong>Data cukup!</strong> Kamu sudah mencoba keempat jenis gerakan. Boleh mencoba lagi, atau jawab pertanyaan temuan.'
                )
              : buildFeedbackBox('info', '🔎', esc(D.labSyarat)))
        )
      : '') +
    (contohOk && labOk
      ? buildTemuanPanel(
          '💡 Apa temuanmu?',
          TEMUAN_GERAK,
          State.temuanGerakOrders,
          State.temuanGerakPilih
        )
      : '') +
    (contohOk && labOk && temuanOk ? buildDlNextButton('gerakNextBtn', D.nextLabel) : '') +
    '</section>';

  bindSortItems(container, CONTOH_ITEMS, State.contohStates, saveState, rerender);
  if (contohOk) {
    bindLabGerakKts(container, 'labGerak', State.labGerak, LAB_GERAK, saveState, rerender);
  }
  if (contohOk && labOk) {
    bindGuidedQuizList(container, TEMUAN_GERAK, State.temuanGerakPilih, saveState, rerender);
  }
  bindNext('gerakNextBtn', 'dataGerak', 'uji');
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

function buildSimpulanSelect(g, bank, dipilih, kunci, placeholder) {
  return (
    '<select class="input-select" id="simp-' +
    g.id +
    '" data-simp="' +
    g.id +
    '"' +
    (kunci ? ' disabled' : '') +
    '>' +
    '<option value="">' +
    esc(placeholder) +
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
    '</select>'
  );
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
        buildSimpulanSelect(g, bank, dipilih, benarSemua, D.selectPlaceholder) +
        (diperiksa && dipilih && dipilih !== g.correct
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali data Lab Titik, tabel sifat bangun, dan catatan Lab Gerak, lalu pilih potongan lain.</p>'
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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Keempat gerakan yang kamu selidiki disebut <strong>transformasi geometri</strong>.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Penyelidikan</h3>' +
            '<div class="kts-ringkas-gerak">' +
            KTS_GERAK.map(function (g) {
              return (
                '<div class="formula-card"><strong>' +
                esc(g.ikon + ' ' + g.nama) +
                '</strong><span>' +
                esc(g.istilah) +
                ' — ' +
                esc(g.ciri) +
                '</span></div>'
              );
            }).join('') +
            '</div>' +
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
   opsiSoalKts membawa umpan balik sesuai miskonsepsinya.
   ============================================================ */

function buildGambarSoal(s) {
  if (s.gambar === 'titik') {
    return buildBidangKartesius('soal-' + s.id, {
      skala: 22,
      titik: [{ p: s.p, label: s.label, cls: 'soal' }],
      judul: 'Bidang koordinat dengan titik ' + s.label,
    });
  }
  if (s.gambar === 'bangun') {
    return buildBidangKartesius('soal-' + s.id, {
      skala: 22,
      bangun: [{ pts: s.pts, cls: 'asal', label: s.titik }],
      judul: 'Bidang koordinat dengan bangun ' + s.titik.join(''),
    });
  }
  return '';
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
    var gambar = buildGambarSoal(s);
    return (
      '<div class="dl-prompt">' +
      '<p class="dl-prompt__cerita"><span class="kts-soal-ikon" aria-hidden="true">' +
      s.ikon +
      '</span> ' +
      esc(s.cerita) +
      '</p>' +
      (gambar ? '<div class="kts-soal-gambar">' + gambar + '</div>' : '') +
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
  var titikPertama = TUGAS_TITIK.filter(function (t) {
    return State.labTitik.hasil[t.id] && State.labTitik.hasil[t.id].firstTry;
  }).length;
  var bangunTepat = BANGUN.filter(function (b) {
    return State.bangunState[b.id].done && State.bangunState[b.id].attempts === 1;
  }).length;
  var contohBenar = sortItemsCorrectCount(CONTOH_ITEMS, State.contohStates);
  var benarUji = sortItemsCorrectCount(UJI_ITEMS, State.ujiStates);
  var benarTerap = State.terapkanExercises.filter(function (e) {
    return e.correct;
  }).length;

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="summary-grid">' +
        buildRingkasKartu(
          titikPertama + '/' + TUGAS_TITIK.length,
          'Titik terpasang tepat pada percobaan pertama'
        ) +
        buildRingkasKartu(
          bangunTepat + '/' + BANGUN.length,
          'Titik keempat tepat pada percobaan pertama'
        ) +
        buildRingkasKartu(
          contohBenar + '/' + CONTOH_ITEMS.length,
          'Contoh gerak sehari-hari dipilah benar'
        ) +
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
    '<div class="kts-contoh-grid">' +
    D.contoh
      .map(function (c) {
        return (
          '<div class="formula-card"><strong class="kts-contoh-grid__num">' +
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
    'Rekap pada tahap Refleksi adalah indikator kesiapan prasyarat, bukan nilai akhir. ' +
    'Ide geser, cermin, putar, dan perbesar yang ditemukan murid menjadi pintu masuk materi translasi, refleksi, rotasi, dan dilatasi beserta aturan koordinatnya pada pertemuan berikutnya.' +
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
  dataTitik: renderDataTitik,
  dataBangun: renderDataBangun,
  dataGerak: renderDataGerak,
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
