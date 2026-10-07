'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Penjumlahan & Pengurangan Pecahan dalam Masalah
   Kontekstual — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen umum: buildDiscoveryHead, buildTeacherNote, buildTpPanel,
       buildChoiceGroup, buildSortItems, buildGuidedQuizList,
       buildDlPanel, buildDlNextButton, buildInfoPoster, buildTapOrder;
     • seksi 36/38: pecahanDari, buildBilanganChip;
     • seksi 15: buildFracNumberLine;
     • seksi 62 (operasi pecahan): operasiPecahan, teksRasional,
       fmtOperasiPecahan, opsiOperasiPecahan, diagnosaOperasiPecahan,
       ensurePitaState, pitaPas, buildPitaOperasi, bindPitaOperasi,
       makeIsianOperasi, buildIsianOperasi, bindIsianOperasi.

   Alur tahap mengikuti sintaks Problem Based Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan, rumusan masalah, peran,
   butir & kategori pemilahan, kartu rencana, potongan Lab Pita,
   pertanyaan pengamatan, keputusan, kategori detektif, estimasi, bank
   simpulan, soal & opsi uji terap, penilaian diri) DIACAK dengan
   shuffleArray() melalui ensureShuffledOrder() / ensureSortStates() /
   ensureTapOrderState() / ensurePitaState(). Pengacakan dilakukan SEKALI
   saat state disiapkan (initExerciseArrays) lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat saat
   dirender ulang, tetapi teracak ulang untuk setiap murid dan Reset.

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi Masalah        (PBL sintaks 1)
    6. Stage: Organisasi               (PBL sintaks 2)
    7. Stage: Penyebut Sama            (PBL sintaks 3a)
    8. Stage: Lab Pita                 (PBL sintaks 3b)
    9. Stage: Campuran & Negatif       (PBL sintaks 3c)
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
var STORAGE_KEY = 'mpi-d-2-3-operasi-pecahan-konteks-v1';

/* Teks biasa dari DATA → HTML aman; token "{3/4}" menjadi pecahan bersusun. */
function teksHTML(str) {
  return renderFracText(esc(str));
}

/* Label opsi: bilangan pecahan murni → chip pecahan, selain itu teks. */
function labelOpsi(str) {
  return /^[−-]?\d+( \d+\/\d+|\/\d+)?$/.test(String(str).trim())
    ? buildBilanganChip(String(str).trim())
    : teksHTML(str);
}

function opsiAman(list) {
  return list.map(function (o) {
    return { id: o.id, label: labelOpsi(o.label) };
  });
}

/* Pertanyaan penuntun dari DATA: tanya, label opsi, dan umpan aman. */
function siapkanGuided(q) {
  var umpan = {};
  Object.keys(q.umpan).forEach(function (k) {
    umpan[k] = teksHTML(q.umpan[k]);
  });
  return {
    id: q.id,
    tanya: teksHTML(q.tanya),
    opsi: opsiAman(q.opsi),
    correct: q.correct,
    umpan: umpan,
  };
}

/* Kalimat operasi dengan chip pecahan: a + b (= hasil). */
function kalimatChip(a, op, b, jawab) {
  var kedua = buildBilanganChip(b);
  if (String(b).trim().charAt(0) === '-' || String(b).trim().charAt(0) === '−') {
    kedua = '(' + kedua + ')';
  }
  return (
    '<span class="kalimat-op">' +
    buildBilanganChip(a) +
    '<span class="kalimat-op__sym">' +
    (op === '+' ? '+' : '−') +
    '</span>' +
    kedua +
    (jawab !== undefined
      ? '<span class="kalimat-op__sym">=</span>' + buildBilanganChip(jawab)
      : '') +
    '</span>'
  );
}

function hasilTeks(s) {
  return teksRasional(operasiPecahan(s.a, s.op, s.b));
}

var DUGAAN_OPSI = {};
DATA.orientasi.dugaan.forEach(function (q) {
  DUGAAN_OPSI[q.id] = opsiAman(q.opsi);
});
var MASALAH_OPSI = DATA.orientasi.masalahOpsi.map(function (o) {
  return { id: o.id, label: esc(o.label) };
});

var PILAH_ITEMS = DATA.organisasi.pilah.map(function (p) {
  return { id: p.id, teks: esc(p.teks), correct: p.correct, explanation: teksHTML(p.explanation) };
});
var RENCANA_ITEMS = DATA.organisasi.rencana.map(function (r) {
  return { id: r.id, label: esc(r.label), aria: r.label };
});
var RENCANA_JAWAB = optionIds(DATA.organisasi.rencana);

var AMATI_SAMA = DATA.selidikSama.amati.map(siapkanGuided);
var AMATI_BEDA = DATA.selidikBeda.amati.map(siapkanGuided);
var CARA = DATA.selidikCampuran.cara.map(siapkanGuided);
var TANYA_NEG = DATA.selidikCampuran.tanyaNeg.map(siapkanGuided);
var KEPUTUSAN = DATA.karya.keputusan.map(siapkanGuided);
var ESTIMASI = DATA.evaluasi.estimasi.map(siapkanGuided);

/* Lab Pita: label langkah isian dibuat dari kalimat operasinya. */
var PERCOBAAN = DATA.selidikBeda.percobaan.map(function (p) {
  var c = {};
  Object.keys(p).forEach(function (k) {
    c[k] = p[k];
  });
  c.label = 'Tulis hasilnya: ' + renderFracText(esc(fmtOperasiPecahanToken(p))) + ' = …';
  return c;
});

/* "1 1/2 − 3/4" → token pecahan bersusun "{1 1/2} − {3/4}". */
function fmtOperasiPecahanToken(s) {
  return fmtOperasiPecahan(s.a, s.op, s.b).replace(/(\d+ )?\d+\/\d+/g, function (m) {
    return '{' + m + '}';
  });
}

var CEK_ITEMS = DATA.evaluasi.cek.map(function (c) {
  return {
    id: c.id,
    teks: '<strong>' + esc(c.kelompok) + ':</strong> ' + kalimatChip(c.a, c.op, c.b, c.jawab),
    correct: c.correct,
    explanation: esc(c.explanation),
  };
});

/* Bank soal uji terap: opsi dibuat engine (hitung) atau dari DATA (kalimat). */
var TERAP_BANK = DATA.terapkan.soal.map(function (s) {
  var c = {};
  Object.keys(s).forEach(function (k) {
    c[k] = s[k];
  });
  if (s.type === 'choice' && !s.options) {
    var opsi = opsiOperasiPecahan(s.a, s.op, s.b);
    c.options = opsi.map(function (o) {
      return { id: o.id, label: buildBilanganChip(o.label) + satuanHTML(s.satuan) };
    });
    c.correct = 'benar';
    c.umpan = {};
    opsi.forEach(function (o) {
      c.umpan[o.id] = esc(o.umpan);
    });
  } else if (s.options) {
    c.options = s.options.map(function (o) {
      return { id: o.id, label: esc(o.label) };
    });
  }
  return c;
});

function satuanHTML(satuan) {
  return satuan ? ' <span class="bbk-satuan">' + esc(satuan) + '</span>' : '';
}

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

  /* Tahap 3 — penyebut sama */
  samaSteps: {},
  samaAmatiOrders: {},
  samaAmatiPilih: {},

  /* Tahap 4 — Lab Pita */
  pitaStates: {},
  bedaSteps: {},
  bedaAmatiOrders: {},
  bedaAmatiPilih: {},

  /* Tahap 5 — campuran & negatif */
  campurSteps: {},
  caraOrders: {},
  caraPilih: {},
  negSteps: {},
  negOrders: {},
  negPilih: {},

  /* Tahap 6 — karya */
  karyaSteps: {},
  keputusanOrders: {},
  keputusanPilih: {},
  karyaPesan: '',

  /* Tahap 7 — evaluasi */
  cekStates: {},
  cekOrder: null,
  estimasiOrders: {},
  estimasiPilih: {},
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

/* Mengacak urutan opsi setiap pertanyaan { id, opsi } dalam daftar. */
function ensureListOrders(key, list) {
  var map = ensureMap(key);
  list.forEach(function (q) {
    ensureShuffledOrder(map, q.id, q.opsi);
  });
}

/* State langkah isian operasi untuk setiap soal { id } dalam daftar. */
function ensureSteps(key, list) {
  var map = ensureMap(key);
  list.forEach(function (s) {
    var st = map[s.id];
    if (!st || typeof st !== 'object' || typeof st.attempts !== 'number') {
      map[s.id] = makeIsianOperasi();
    }
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
  var ids = [];
  Object.keys(T.komposisi).forEach(function (k) {
    var kelompok = TERAP_BANK.filter(function (s) {
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
  ensureSteps('samaSteps', DATA.selidikSama.hitung);
  ensureListOrders('samaAmatiOrders', AMATI_SAMA);
  ensureMap('samaAmatiPilih');

  /* Tahap 4 — potongan Lab Pita diacak per percobaan */
  var pita = ensureMap('pitaStates');
  PERCOBAAN.forEach(function (p) {
    ensurePitaState(pita, p.id, p.a, p.b);
  });
  ensureSteps('bedaSteps', PERCOBAAN);
  ensureListOrders('bedaAmatiOrders', AMATI_BEDA);
  ensureMap('bedaAmatiPilih');

  /* Tahap 5 */
  ensureSteps('campurSteps', DATA.selidikCampuran.campuran);
  ensureListOrders('caraOrders', CARA);
  ensureMap('caraPilih');
  ensureSteps('negSteps', DATA.selidikCampuran.negatif);
  ensureListOrders('negOrders', TANYA_NEG);
  ensureMap('negPilih');

  /* Tahap 6 */
  ensureSteps('karyaSteps', DATA.karya.langkah);
  ensureListOrders('keputusanOrders', KEPUTUSAN);
  ensureMap('keputusanPilih');

  /* Tahap 7 */
  ensureSortStates(State, 'cekStates', 'cekOrder', CEK_ITEMS, DATA.evaluasi.opsiCek);
  ensureListOrders('estimasiOrders', ESTIMASI);
  ensureMap('estimasiPilih');
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
  return buildDiscoveryHead(D.kicker, D.goal, D.syntax) + buildTeacherNote(esc(D.guru));
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
        return '<li>' + teksHTML(t) + '</li>';
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
  return '<p class="dl-caption">' + teksHTML(teks) + '</p>';
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

/* Langkah isian dengan label HTML siap pakai. */
function soalLangkah(s) {
  var c = {};
  Object.keys(s).forEach(function (k) {
    c[k] = s[k];
  });
  c.label = s.label.indexOf('<') === -1 ? teksHTML(s.label) : s.label;
  c.hints = (s.hints || []).map(teksHTML);
  c.temuan = s.temuan ? teksHTML(s.temuan) : '';
  return c;
}

function langkahSelesai(list, states) {
  return list.every(function (s) {
    return states[s.id] && states[s.id].done;
  });
}

/*
 * Daftar langkah isian yang dibuka satu per satu: langkah berikutnya
 * muncul setelah langkah sebelumnya benar. `visual(s)` opsional → HTML
 * di atas langkah.
 */
function buildLangkahList(prefix, list, states, visual) {
  var html = '';
  for (var i = 0; i < list.length; i++) {
    var s = list[i];
    html +=
      '<div class="langkah-op">' +
      (visual ? visual(s) : '') +
      buildIsianOperasi(prefix + s.id, states[s.id], soalLangkah(s), i + 1) +
      '</div>';
    if (!states[s.id].done) break;
  }
  return '<div class="langkah-op-list">' + html + '</div>';
}

function bindLangkahList(prefix, list, states, rerender) {
  for (var i = 0; i < list.length; i++) {
    var s = list[i];
    bindIsianOperasi(prefix + s.id, states[s.id], soalLangkah(s), saveState, rerender);
    if (!states[s.id].done) break;
  }
}

/* Baris data catatan: ikon, nama, chip bilangan, satuan. */
function buildDataRow(d) {
  return (
    '<li class="data-row">' +
    '<span class="data-row__ikon" aria-hidden="true">' +
    d.ikon +
    '</span>' +
    '<span class="data-row__nama">' +
    esc(d.nama) +
    '</span>' +
    '<span class="data-row__nilai">' +
    (d.nilai === '?'
      ? '<span class="num-chip num-chip--tanya">?</span>'
      : buildBilanganChip(d.nilai)) +
    satuanHTML(d.satuan) +
    '</span>' +
    '</li>'
  );
}

function buildCatatanCard(c) {
  return (
    '<article class="catatan-card">' +
    '<header class="catatan-card__head"><span class="catatan-card__ikon" aria-hidden="true">' +
    c.ikon +
    '</span><h3 class="catatan-card__judul">' +
    esc(c.judul) +
    '</h3></header>' +
    '<p class="catatan-card__teks">' +
    teksHTML(c.teks) +
    '</p>' +
    '<ul class="data-list">' +
    c.data.map(buildDataRow).join('') +
    '</ul>' +
    '</article>'
  );
}

/* ============================================================
   5. STAGE: ORIENTASI MASALAH  (PBL — sintaks 1)
   Dugaan TIDAK dinilai; rumusan masalah dinilai dengan umpan balik.
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
  var umpan = {};
  Object.keys(D.masalahUmpan).forEach(function (k) {
    umpan[k] = esc(D.masalahUmpan[k]);
  });

  var dugaanHTML = D.dugaan
    .map(function (q, i) {
      return (
        '<div class="quiz-item">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        teksHTML(q.tanya) +
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
      '<h2 style="margin-top:0;">🧁 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="catatan-grid">' +
        D.catatan.map(buildCatatanCard).join('') +
        '</div>',
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
            buildGuidedChoiceFeedback(State.masalahPilihan, benar, umpan) +
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
   Pilih peran → pilah sub-masalah → susun rencana penyelidikan.
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
                '<strong>Rencana tersusun!</strong> Tulis kalimat → samakan penyebut → hitung pembilang → sederhanakan → cek kewajaran. Rencana ini kalian uji pada tiga penyelidikan berikutnya.',
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
  bindNext('organisasiNextBtn', 'organisasi', 'selidikSama');
}

/* ============================================================
   7. STAGE: PENYELIDIKAN A — PENYEBUT SAMA  (PBL — sintaks 3)
   Pita (tampilan saja) di atas setiap langkah isian berdiagnosa.
   ============================================================ */

function pitaTetap(s) {
  return buildPitaOperasi(
    'pitaSama-' + s.id,
    s.a,
    s.op,
    s.b,
    { pilih: rasionalDari(s.a).den },
    { tetap: true }
  );
}

function renderSelidikSama(container) {
  var D = DATA.selidikSama;
  var rerender = function () {
    renderSelidikSama(container);
  };
  var hitungOk = langkahSelesai(D.hitung, State.samaSteps);
  var amatiOk = hitungOk && guidedQuizAllCorrect(AMATI_SAMA, State.samaAmatiPilih);

  container.innerHTML =
    '<section aria-label="Penyelidikan A: Penyebut Sama">' +
    buildHead(D) +
    panelJudul(
      '🎀 ' + D.judul,
      caption(D.instruksi) + buildLangkahList('sama-', D.hitung, State.samaSteps, pitaTetap)
    ) +
    (hitungOk
      ? panelJudul(
          '🔎 Amati hasil penyelidikanmu',
          buildGuidedQuizList(AMATI_SAMA, State.samaAmatiOrders, State.samaAmatiPilih)
        )
      : '') +
    (amatiOk ? buildTemuanPanel(D.temuan) + buildDlNextButton('samaNextBtn', D.nextLabel) : '') +
    '</section>';

  bindLangkahList('sama-', D.hitung, State.samaSteps, rerender);
  if (hitungOk) {
    bindGuidedQuizList(container, AMATI_SAMA, State.samaAmatiPilih, saveState, rerender);
  }
  bindNext('samaNextBtn', 'selidikSama', 'selidikBeda');
}

/* ============================================================
   8. STAGE: PENYELIDIKAN B — LAB PITA  (PBL — sintaks 3)
   Pilih potongan per utuh sampai pas → tulis hasil → percobaan
   berikutnya terbuka.
   ============================================================ */

function percobaanSelesai(p) {
  return pitaPas(p.a, p.b, State.pitaStates[p.id]) && State.bedaSteps[p.id].done;
}

function buildPercobaanCard(p, i) {
  var st = State.pitaStates[p.id];
  var pas = pitaPas(p.a, p.b, st);
  return (
    '<article class="lab-card' +
    (percobaanSelesai(p) ? ' is-done' : '') +
    '">' +
    '<p class="lab-card__judul"><span class="dl-step__num">' +
    (i + 1) +
    '</span>' +
    teksHTML(p.cerita) +
    '</p>' +
    buildPitaOperasi('pita-' + p.id, p.a, p.op, p.b, st, {}) +
    (pas ? buildIsianOperasi('beda-' + p.id, State.bedaSteps[p.id], soalLangkah(p)) : '') +
    '</article>'
  );
}

function renderSelidikBeda(container) {
  var D = DATA.selidikBeda;
  var rerender = function () {
    renderSelidikBeda(container);
  };
  var cards = '';
  for (var i = 0; i < PERCOBAAN.length; i++) {
    cards += buildPercobaanCard(PERCOBAAN[i], i);
    if (!percobaanSelesai(PERCOBAAN[i])) break;
  }
  var labOk = PERCOBAAN.every(percobaanSelesai);
  var amatiOk = labOk && guidedQuizAllCorrect(AMATI_BEDA, State.bedaAmatiPilih);

  container.innerHTML =
    '<section aria-label="Penyelidikan B: Lab Pita">' +
    buildHead(D) +
    panelJudul(
      '✂️ ' + D.judul,
      caption(D.instruksi) + '<div class="lab-list">' + cards + '</div>'
    ) +
    (labOk
      ? panelJudul(
          '🔎 Amati hasil Lab Pita',
          buildGuidedQuizList(AMATI_BEDA, State.bedaAmatiOrders, State.bedaAmatiPilih)
        )
      : '') +
    (amatiOk ? buildTemuanPanel(D.temuan) + buildDlNextButton('bedaNextBtn', D.nextLabel) : '') +
    '</section>';

  for (var j = 0; j < PERCOBAAN.length; j++) {
    var p = PERCOBAAN[j];
    var st = State.pitaStates[p.id];
    bindPitaOperasi(container, 'pita-' + p.id, p.a, p.b, st, saveState, rerender);
    if (pitaPas(p.a, p.b, st)) {
      bindIsianOperasi('beda-' + p.id, State.bedaSteps[p.id], soalLangkah(p), saveState, rerender);
    }
    if (!percobaanSelesai(p)) break;
  }
  if (labOk) bindGuidedQuizList(container, AMATI_BEDA, State.bedaAmatiPilih, saveState, rerender);
  bindNext('bedaNextBtn', 'selidikBeda', 'selidikCampuran');
}

/* ============================================================
   9. STAGE: PENYELIDIKAN C — CAMPURAN & NEGATIF  (PBL — sintaks 3)
   ============================================================ */

/* Titik garis bilangan: posisi awal, lalu hasil tiap langkah yang selesai. */
function garisNegatif() {
  var S = DATA.selidikCampuran;
  var titik = [{ teks: S.negatif[0].a }];
  S.negatif.forEach(function (s) {
    if (State.negSteps[s.id].done) titik.push({ teks: hasilTeks(s) });
  });
  var fracs = titik.map(function (t) {
    var p = pecahanDari(t.teks.replace('−', '-'));
    return { num: p.num, den: p.den, whole: p.whole, neg: p.neg };
  });
  return buildFracNumberLine(fracs, {
    min: S.garis.min,
    max: S.garis.max,
    ticks: S.garis.ticks,
    aria:
      'Garis bilangan tinggi air kolam: ' +
      titik
        .map(function (t) {
          return t.teks;
        })
        .join(', ') +
      ' meter',
  });
}

function renderSelidikCampuran(container) {
  var D = DATA.selidikCampuran;
  var rerender = function () {
    renderSelidikCampuran(container);
  };
  var campurOk = langkahSelesai(D.campuran, State.campurSteps);
  var caraOk = campurOk && guidedQuizAllCorrect(CARA, State.caraPilih);
  var negOk = caraOk && langkahSelesai(D.negatif, State.negSteps);
  var tanyaOk = negOk && guidedQuizAllCorrect(TANYA_NEG, State.negPilih);

  container.innerHTML =
    '<section aria-label="Penyelidikan C: Pecahan Campuran dan Negatif">' +
    buildHead(D) +
    panelJudul(
      '🧮 ' + D.judulA,
      caption(D.instruksiA) + buildLangkahList('campur-', D.campuran, State.campurSteps)
    ) +
    (campurOk
      ? panelJudul(
          '⚖️ Bandingkan dua cara',
          buildGuidedQuizList(CARA, State.caraOrders, State.caraPilih)
        )
      : '') +
    (caraOk
      ? panelJudul(
          '🎣 ' + D.judulB,
          caption(D.instruksiB) +
            garisNegatif() +
            buildLangkahList('neg-', D.negatif, State.negSteps) +
            (negOk ? buildGuidedQuizList(TANYA_NEG, State.negOrders, State.negPilih) : '')
        )
      : '') +
    (tanyaOk ? buildTemuanPanel(D.temuan) + buildDlNextButton('campurNextBtn', D.nextLabel) : '') +
    '</section>';

  bindLangkahList('campur-', D.campuran, State.campurSteps, rerender);
  if (campurOk) bindGuidedQuizList(container, CARA, State.caraPilih, saveState, rerender);
  if (caraOk) bindLangkahList('neg-', D.negatif, State.negSteps, rerender);
  if (negOk) bindGuidedQuizList(container, TANYA_NEG, State.negPilih, saveState, rerender);
  bindNext('campurNextBtn', 'selidikCampuran', 'karya');
}

/* ============================================================
   10. STAGE: KARYA  (PBL — sintaks 4)
   Tiga bagian (tepung, pita, meja) dibuka berurutan → keputusan →
   pesan → Papan Solusi Stand.
   ============================================================ */

var BAGIAN_KARYA = [
  { id: 'tepung', ikon: '🌾', judul: 'Tepung' },
  { id: 'pita', ikon: '🎀', judul: 'Pita hias' },
  { id: 'meja', ikon: '🪑', judul: 'Meja stand' },
];

function langkahBagian(id) {
  return DATA.karya.langkah.filter(function (s) {
    return s.bagian === id;
  });
}

function karyaLangkahById(id) {
  return DATA.karya.langkah.filter(function (s) {
    return s.id === id;
  })[0];
}

function buildPapanSolusi() {
  var rows = DATA.karya.langkah.map(function (s) {
    var b = BAGIAN_KARYA.filter(function (x) {
      return x.id === s.bagian;
    })[0];
    return {
      ikon: b.ikon,
      label: s.label.replace(/\{|\}/g, '').replace(/ = …$/, '').split(':')[0],
      nilai: kalimatChip(s.a, s.op, s.b, hasilTeks(s)) + satuanHTML(s.satuan),
    };
  });
  return buildInfoPoster({
    judul: DATA.karya.judul,
    ikon: '🧁',
    rows: rows,
    pesan: State.karyaPesan.trim() || '',
    footer: 'Kelompok 7C · Bazar Sekolah',
  });
}

function renderKarya(container) {
  var D = DATA.karya;
  var rerender = function () {
    renderKarya(container);
  };
  var panels = '';
  var semuaOk = true;
  BAGIAN_KARYA.forEach(function (b) {
    if (!semuaOk) return;
    var list = langkahBagian(b.id);
    panels += panelJudul(
      b.ikon + ' ' + b.judul,
      buildLangkahList('karya-', list, State.karyaSteps)
    );
    if (!langkahSelesai(list, State.karyaSteps)) semuaOk = false;
  });
  var putusOk = semuaOk && guidedQuizAllCorrect(KEPUTUSAN, State.keputusanPilih);

  container.innerHTML =
    '<section aria-label="Menyajikan Hasil Karya">' +
    buildHead(D) +
    buildDlPanel('<h2 style="margin-top:0;">📋 ' + esc(D.judul) + '</h2>' + caption(D.instruksi)) +
    panels +
    (semuaOk
      ? panelJudul(
          '🧠 Ambil keputusan & cek kewajaran',
          buildGuidedQuizList(KEPUTUSAN, State.keputusanOrders, State.keputusanPilih)
        )
      : '') +
    (putusOk
      ? buildDlPanel(
          buildTextarea('karyaPesan', D.pesanLabel, D.pesanPlaceholder, State.karyaPesan) +
            '<div class="btn-group btn-group--end" style="margin-top:var(--space-3);">' +
            '<button type="button" class="btn btn--ghost" id="posterRefreshBtn">Perbarui Papan</button>' +
            '</div>' +
            '<div id="posterWrap">' +
            buildPapanSolusi() +
            '</div>' +
            buildFeedbackBox(
              'info',
              '🎤',
              'Presentasikan Papan Solusi di depan kelas (±2 menit). Penyaji menjelaskan satu langkah, pemeriksa menjelaskan cara mengecek kewajarannya.'
            ),
          'panel--hero'
        ) + buildDlNextButton('karyaNextBtn', D.nextLabel)
      : '') +
    '</section>';

  BAGIAN_KARYA.forEach(function (b) {
    bindLangkahList('karya-', langkahBagian(b.id), State.karyaSteps, rerender);
  });
  if (semuaOk) bindGuidedQuizList(container, KEPUTUSAN, State.keputusanPilih, saveState, rerender);
  bindTextarea('karyaPesan', 'karyaPesan');
  var refresh = document.getElementById('posterRefreshBtn');
  if (refresh) {
    refresh.addEventListener('click', function () {
      document.getElementById('posterWrap').innerHTML = buildPapanSolusi();
    });
  }
  var nextBtn = document.getElementById('karyaNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.karyaPesan.trim()) {
        showNotice('Tulis pesan kelompokmu untuk Bu Ratna lebih dulu.');
        return;
      }
      completeStage('karya');
      navigateTo('evaluasi');
    });
  }
}

/* ============================================================
   11. STAGE: EVALUASI  (PBL — sintaks 5)
   A. detektif solusi → B. estimasi → C. dugaan vs hasil → D. simpulan.
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
          teksHTML(q.tanya) +
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
  var aOk = sortItemsAllAnswered(CEK_ITEMS, State.cekStates);
  var bOk = aOk && guidedQuizAllCorrect(ESTIMASI, State.estimasiPilih);
  var benarSemua = simpulanSemuaBenar();

  container.innerHTML =
    '<section aria-label="Analisis dan Evaluasi">' +
    buildHead(D) +
    panelJudul(
      '🕵️ ' + D.judulA,
      buildSortItems(CEK_ITEMS, State.cekOrder, D.opsiCek, State.cekStates)
    ) +
    (aOk
      ? panelJudul(
          '📏 ' + D.judulB,
          buildGuidedQuizList(ESTIMASI, State.estimasiOrders, State.estimasiPilih)
        )
      : '') +
    (bOk ? panelJudul('🔁 ' + D.judulC, buildDugaanBanding()) : '') +
    (bOk
      ? panelJudul(
          '🧩 ' + D.judulD,
          caption(D.instruksiD) +
            buildSimpulan() +
            (benarSemua
              ? buildFeedbackBox(
                  'success',
                  '✓',
                  '<strong>Simpulan kelompokmu lengkap dan tepat.</strong> Inilah langkah yang kalian temukan dan buktikan sendiri.'
                )
              : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
                '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Simpulan</button>' +
                '</div>')
        )
      : '') +
    (bOk && benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman: Menjumlahkan & Mengurangkan Pecahan</h3>' +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' +
                  (i + 1) +
                  '</span><span>' +
                  esc(r) +
                  '</span></li>'
                );
              })
              .join('') +
            '</ol>',
          'panel--hero'
        ) + buildDlNextButton('evaluasiNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindSortItems(container, CEK_ITEMS, State.cekStates, saveState, rerender);
  if (aOk) bindGuidedQuizList(container, ESTIMASI, State.estimasiPilih, saveState, rerender);

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
   dipilih acak. Isian diperiksa diagnosaOperasiPecahan.
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
    return buildHead(DATA.terapkan) + caption(DATA.terapkan.instruksi);
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
  inputPlaceholder: 'mis. 1 3/4 atau −1/2',
  inputSuffix: function (s) {
    return satuanHTML(s.satuan);
  },
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  /* Teks mentah diteruskan; pemeriksaan & diagnosa ada di isCorrect. */
  parseInput: function (val) {
    if (!val || !String(val).trim()) return { value: null, error: 'empty' };
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return diagnosaOperasiPecahan(value, s.a, s.op, s.b).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' +
      esc(ex.userInput) +
      '</strong> — ' +
      diagnosaOperasiPecahan(ex.userInput, s.a, s.op, s.b).pesan
    );
  },
  revealText: function (s) {
    return (
      esc(fmtOperasiPecahan(s.a, s.op, s.b) + ' = ' + hasilTeks(s) + ' ' + s.satuan + '. ') +
      teksHTML(s.explanation)
    );
  },
  buildChoiceFeedback: function (s, ex) {
    var umpan = s.umpan && !ex.correct ? s.umpan[ex.chosen] + ' ' : '';
    return ex.correct
      ? buildFeedbackBox('success', '✓', '<strong>Benar!</strong> ' + teksHTML(s.explanation))
      : buildFeedbackBox(
          'error',
          '✗',
          '<strong>Belum tepat.</strong> ' + umpan + teksHTML(s.explanation)
        );
  },
  renderPrompt: function (s) {
    var tag = s.type === 'choice' ? 'Pilihan ganda' : '✏️ Tulis jawabanmu';
    return (
      '<div class="dl-prompt">' +
      '<span class="bbk-soal-tag">' +
      esc(tag) +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      teksHTML(s.cerita) +
      '</p>' +
      '<p class="dl-prompt__tanya">' +
      teksHTML(s.pertanyaan) +
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

/* Banyak langkah isian yang benar pada percobaan pertama. */
function sekaliBenar(list, states) {
  return list.filter(function (s) {
    return states[s.id] && states[s.id].done && states[s.id].attempts === 1;
  }).length;
}

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var langkahSemua = DATA.selidikSama.hitung.concat(
    DATA.selidikCampuran.campuran,
    DATA.selidikCampuran.negatif
  );
  var stSemua = {};
  [State.samaSteps, State.campurSteps, State.negSteps].forEach(function (m) {
    Object.keys(m).forEach(function (k) {
      stSemua[k] = m[k];
    });
  });
  var pitaSekali = PERCOBAAN.filter(function (p) {
    var st = State.pitaStates[p.id];
    return pitaPas(p.a, p.b, st) && st.coba === 1;
  }).length;
  var karyaSekali = sekaliBenar(DATA.karya.langkah, State.karyaSteps);
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
        kartu(
          sekaliBenar(langkahSemua, stSemua) + '/' + langkahSemua.length,
          'Isian penyelidikan tepat sekali coba'
        ) +
        kartu(pitaSekali + '/' + PERCOBAAN.length, 'Lab Pita pas sekali pilih') +
        kartu(
          karyaSekali + '/' + DATA.karya.langkah.length,
          'Langkah Papan Solusi tepat sekali coba'
        ) +
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
          kalimatChip(c.a, c.op, c.b, hasilTeks(c)) +
          satuanHTML(c.satuan) +
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
    'Presentasi Papan Solusi Stand dan penjelasan lisan murid tentang langkah menyamakan penyebut tetap menjadi bahan penilaian utama.' +
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
  selidikSama: renderSelidikSama,
  selidikBeda: renderSelidikBeda,
  selidikCampuran: renderSelidikCampuran,
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
