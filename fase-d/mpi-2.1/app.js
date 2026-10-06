'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Penjumlahan & Pengurangan Bilangan Bulat dalam
   Masalah Kontekstual — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen Discovery Learning: buildDiscoveryHead,
       buildTeacherNote, buildTpPanel, buildChoiceGroup,
       buildSortItems, buildGuidedQuizList, buildDlPanel,
       buildDlNextButton;
     • seksi 17 (operasi bilangan bulat): buildIntegerOpSimulator,
       buildNumberLineJumps, integerJumps, fmtOperasiBulat, fmtBulat,
       diagnosaOperasiBulat;
     • seksi 29: makeCekStep / buildCekStep / bindCekStep — langkah
       isian berpemeriksa; jenis 'hitung' memakai diagnosaOperasiBulat.

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan, rumusan masalah,
   pertanyaan pengamatan, pemilahan arah, pola, bentuk setara, model
   cerita, pernyataan, bank kesimpulan, opsi uji terap, penilaian diri)
   DIACAK dengan shuffleArray() melalui ensureShuffledOrder() /
   ensureSortStates(). Pengacakan dilakukan SEKALI saat state disiapkan
   (initExerciseArrays) lalu urutannya disimpan di State — bukan saat
   render — sehingga pilihan tidak melompat saat dirender ulang, tetapi
   teracak ulang untuk setiap murid dan setiap Reset. Soal uji terap
   juga dipilih acak dari bank (pilihSoalTerap).

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi            (DL sintaks 1)
    6. Stage: Identifikasi Masalah (DL sintaks 2)
    7. Stage: Pengumpulan Data     (DL sintaks 3)
    8. Stage: Pola Penjumlahan     (DL sintaks 4a)
    9. Stage: Pola Pengurangan     (DL sintaks 4b)
   10. Stage: Model Kontekstual    (DL sintaks 4c)
   11. Stage: Pembuktian           (DL sintaks 5)
   12. Stage: Menarik Kesimpulan   (DL sintaks 6)
   13. Stage: Uji Terap
   14. Stage: Refleksi
   15. Stage: Selesai
   16. Router Render
   17. Helper UI (modal reset)
   18. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = DATA.tahap.map(function (t) {
  return t.id;
});
var STAGE_LABELS = DATA.tahap.map(function (t) {
  return t.label;
});
var STORAGE_KEY = 'mpi-d-2-1-operasi-bulat-konteks-v1';

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

  /* Tahap 2 — identifikasi masalah */
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',

  /* Tahap 3 — pengumpulan data */
  sim: null,
  koleksiSteps: [],
  amatiOrders: {},
  amatiPilih: {},

  /* Tahap 4a — pola penjumlahan */
  jumlahStates: {},
  jumlahOrder: null,
  polaOrders: {},
  polaPilih: {},
  jumlahSteps: [],

  /* Tahap 4b — pola pengurangan */
  polaKurangSteps: [],
  pasangOrders: {},
  pasangPilih: {},
  kurangSteps: [],

  /* Tahap 4c — model kontekstual */
  modelOrders: {},
  modelPilih: {},
  modelSteps: [],

  /* Tahap 5 — pembuktian */
  verifStates: {},
  verifOrder: null,

  /* Tahap 6 — menarik kesimpulan */
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

/* Simulator selalu berisi { a, op, b } yang sah dan berada dalam rentang. */
function ensureSim() {
  var r = DATA.koleksi.rentang;
  var s = State.sim;
  var sah = function (v) {
    return typeof v === 'number' && v >= r.min && v <= r.max;
  };
  if (!s || typeof s !== 'object' || !sah(s.a) || !sah(s.b) || ['+', '-'].indexOf(s.op) === -1) {
    State.sim = Object.assign({}, DATA.koleksi.simAwal);
  }
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

/* Baris tabel pola pengurangan yang harus dilengkapi murid. */
function polaKurangIsian() {
  return DATA.olahKurang.polaBaris.filter(function (r) {
    return !r.tampil;
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
  ensureSim();
  ensureExerciseArray(State, 'koleksiSteps', DATA.koleksi.percobaan, makeCekStep);
  ensureListOrders('amatiOrders', DATA.koleksi.amati);
  ensureMap('amatiPilih');

  /* Tahap 4a */
  ensureSortStates(
    State,
    'jumlahStates',
    'jumlahOrder',
    DATA.olahJumlah.pilah,
    DATA.olahJumlah.opsiArah
  );
  ensureListOrders('polaOrders', DATA.olahJumlah.pola);
  ensureMap('polaPilih');
  ensureExerciseArray(State, 'jumlahSteps', DATA.olahJumlah.hitung, makeCekStep);

  /* Tahap 4b */
  ensureExerciseArray(State, 'polaKurangSteps', polaKurangIsian(), makeCekStep);
  ensureListOrders('pasangOrders', DATA.olahKurang.pasang);
  ensureMap('pasangPilih');
  ensureExerciseArray(State, 'kurangSteps', DATA.olahKurang.hitung, makeCekStep);

  /* Tahap 4c */
  ensureListOrders('modelOrders', DATA.olahModel.soal);
  ensureMap('modelPilih');
  ensureExerciseArray(State, 'modelSteps', DATA.olahModel.soal, makeCekStep);

  /* Tahap 5 */
  ensureSortStates(
    State,
    'verifStates',
    'verifOrder',
    DATA.verifikasi.pernyataan,
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
        return '<li>' + t + '</li>';
      })
      .join('') +
    '</ul>'
  );
}

function buildTemuanPanel(items) {
  return buildDlPanel(
    '<h3 style="margin-top:0;">💡 Temuanmu</h3>' + buildTemuanList(items),
    'panel--hero'
  );
}

/* Label konteks: ikon + nama (Suhu, Ketinggian, Saldo). */
function buildKonteksTag(konteks) {
  var K = DATA.konteks[konteks];
  return (
    '<span class="ops-konteks ops-konteks--' +
    konteks +
    '"><span aria-hidden="true">' +
    K.ikon +
    '</span> ' +
    esc(K.nama) +
    '</span>'
  );
}

/* Langkah isian hasil operasi untuk data { a, op, b, jawab, label, hints }. */
function hitungStep(item, extra) {
  var step = {
    jenis: 'hitung',
    a: item.a,
    op: item.op,
    b: item.b,
    jawab: item.jawab,
    label: item.label,
    hints: item.hints,
    placeholder: 'mis. −5',
  };
  if (extra) Object.assign(step, extra);
  return step;
}

function semuaCekSelesai(steps) {
  return steps.every(function (s) {
    return s.done;
  });
}

/* Daftar langkah isian berpemeriksa; idPrefix + indeks menjadi id DOM. */
function buildHitungList(idPrefix, items, steps, stepOf) {
  return items
    .map(function (it, i) {
      return buildCekStep(idPrefix + i, steps[i], stepOf(it), i + 1);
    })
    .join('');
}

function bindHitungList(idPrefix, items, steps, stepOf, rerender) {
  items.forEach(function (it, i) {
    bindCekStep(idPrefix + i, steps[i], stepOf(it), saveState, rerender);
  });
}

/* Pasang ulang event setelah render dan pusatkan garis bilangan di layar sempit. */
function afterRender(container) {
  centerNumberLines(container);
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah.
   ============================================================ */

function dugaanLengkap() {
  return DATA.stimulasi.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var lengkap = dugaanLengkap();

  var kabarHTML = D.kabar
    .map(function (k) {
      return (
        '<article class="kabar-card kabar-card--' +
        k.konteks +
        '">' +
        '<header class="kabar-card__head"><span class="kabar-card__ikon" aria-hidden="true">' +
        k.ikon +
        '</span><span class="kabar-card__sumber">' +
        esc(k.sumber) +
        '</span></header>' +
        '<p class="kabar-card__sorot">' +
        esc(k.sorot) +
        '</p>' +
        '<p class="kabar-card__teks">' +
        esc(k.teks) +
        '</p>' +
        '</article>'
      );
    })
    .join('');

  var dugaanHTML = D.dugaan
    .map(function (q, i) {
      return (
        '<div class="quiz-item">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        esc(q.tanya) +
        '</p>' +
        buildChoiceGroup(q.opsi, State.dugaanOrders[q.id], {
          chosen: State.dugaanPilih[q.id] || null,
          group: q.id,
          attr: 'data-dugaan',
        }) +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">📰 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="kabar-grid">' +
        kabarHTML +
        '</div>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaanmu?</h3>' +
        dugaanHTML +
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
    (lengkap ? '' : ' disabled') +
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
    if (!dugaanLengkap()) {
      showNotice('Pilih dugaanmu untuk setiap pertanyaan sebelum melanjutkan.');
      return;
    }
    completeStage('stimulasi');
    navigateTo('masalah');
  });
}

/* ============================================================
   6. STAGE: IDENTIFIKASI MASALAH  (Discovery Learning — sintaks 2)
   ============================================================ */

function renderMasalah(container) {
  var D = DATA.masalah;
  var benar = State.masalahPilihan === D.correct;

  container.innerHTML =
    '<section aria-label="Identifikasi Masalah">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.masalahOrder, {
          chosen: State.masalahPilihan,
          correctId: benar ? D.correct : null,
          grade: true,
          locked: benar,
        }) +
        buildGuidedChoiceFeedback(State.masalahPilihan, benar, D.umpan)
    ) +
    (benar
      ? buildDlPanel(
          '<div class="field-group">' +
            '<label for="masalahHipotesis">' +
            esc(D.hipotesisLabel) +
            '</label>' +
            '<textarea id="masalahHipotesis" class="input-textarea" placeholder="' +
            esc(D.hipotesisPlaceholder) +
            '">' +
            esc(State.masalahHipotesis) +
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

  var ta = document.getElementById('masalahHipotesis');
  if (ta) {
    ta.addEventListener('input', function () {
      State.masalahHipotesis = ta.value;
      saveState();
    });
  }

  var nextBtn = document.getElementById('masalahNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.masalahHipotesis.trim()) {
        showNotice('Tulis hipotesismu lebih dulu, walau hanya satu kalimat.');
        return;
      }
      completeStage('masalah');
      navigateTo('koleksi');
    });
  }
}

/* ============================================================
   7. STAGE: PENGUMPULAN DATA — LAB LOMPATAN  (DL sintaks 3)
   Satu simulator bersama; percobaan dibuka satu per satu. Murid
   mengatur simulator sesuai percobaan lalu mencatat hasilnya
   (isian 'hitung' berdiagnosa). Tabel data terisi otomatis.
   ============================================================ */

function simOpts() {
  var K = DATA.koleksi;
  return { min: K.garis.min, max: K.garis.max, rangeA: K.rentang, rangeB: K.rentang };
}

function simCocok(p) {
  var s = State.sim;
  return s.a === p.a && s.op === p.op && s.b === p.b;
}

function percobaanStep(p, i) {
  return hitungStep(p, { label: 'Catat hasilnya: ' + fmtOperasiBulat(p.a, p.op, p.b) + ' = …' });
}

function buildSimStatus(p) {
  return simCocok(p)
    ? '✓ Simulator sudah diatur sesuai percobaan ini.'
    : '↻ Simulator belum sesuai. Atur titik awal, operasi, dan bilangan kedua seperti di atas.';
}

function buildPercobaanCard(p, i) {
  var st = State.koleksiSteps[i];
  return (
    '<div class="ops-card' +
    (st.done ? ' is-done' : '') +
    '">' +
    '<div class="ops-card__head">' +
    '<span class="ops-card__no">Percobaan ' +
    (i + 1) +
    '</span>' +
    buildKonteksTag(p.konteks) +
    '</div>' +
    '<p class="ops-card__cerita">' +
    esc(p.cerita) +
    '</p>' +
    (st.done
      ? ''
      : '<ul class="ops-atur" aria-label="Atur simulator">' +
        '<li><span>Titik awal</span><strong>' +
        esc(fmtBulat(p.a)) +
        '</strong></li>' +
        '<li><span>Operasi</span><strong>' +
        (p.op === '-' ? '−' : '+') +
        '</strong></li>' +
        '<li><span>Bilangan kedua</span><strong>' +
        esc(fmtBulat(p.b)) +
        '</strong></li>' +
        '</ul>' +
        '<p class="ops-status' +
        (simCocok(p) ? ' is-ok' : '') +
        '" data-sim-status="' +
        i +
        '" role="status">' +
        buildSimStatus(p) +
        '</p>') +
    buildCekStep('kc' + i, st, percobaanStep(p, i)) +
    (st.done ? buildFeedbackBox('success', '💡', p.temuan) : '') +
    '</div>'
  );
}

function koleksiSemuaSelesai() {
  return semuaCekSelesai(State.koleksiSteps);
}

function buildTabelData() {
  return (
    '<div class="table-scroll">' +
    '<table class="data-table">' +
    '<thead><tr><th scope="col">No.</th><th scope="col">Konteks</th><th scope="col">Kalimat</th>' +
    '<th scope="col">Lompatan</th><th scope="col">Hasil</th></tr></thead>' +
    '<tbody>' +
    DATA.koleksi.percobaan
      .map(function (p, i) {
        var r = integerJumps(p.a, p.op, p.b);
        var arah = arahLompatan(r.by);
        var lompat = arah === 'diam' ? 'tidak berpindah' : Math.abs(r.by) + ' langkah ke ' + arah;
        return (
          '<tr class="' +
          (p.jawab < 0 ? 'is-neg' : p.jawab > 0 ? 'is-pos' : 'is-nol') +
          '"><td>' +
          (i + 1) +
          '</td><td>' +
          buildKonteksTag(p.konteks) +
          '</td><td class="data-table__num">' +
          esc(fmtOperasiBulat(p.a, p.op, p.b)) +
          '</td><td>' +
          (arah === 'kanan' ? '➡️ ' : arah === 'kiri' ? '⬅️ ' : '') +
          esc(lompat) +
          '</td><td class="data-table__num">' +
          esc(fmtBulat(p.jawab)) +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table>' +
    '</div>'
  );
}

/* Memperbarui status kecocokan simulator tanpa merender ulang tahap. */
function updateSimStatus(container) {
  container.querySelectorAll('[data-sim-status]').forEach(function (el) {
    var p = DATA.koleksi.percobaan[Number(el.getAttribute('data-sim-status'))];
    el.innerHTML = buildSimStatus(p);
    el.classList.toggle('is-ok', simCocok(p));
  });
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var semua = koleksiSemuaSelesai();
  var amatiSelesai = guidedQuizAllCorrect(D.amati, State.amatiPilih);
  var rerender = function () {
    renderKoleksi(container);
  };

  var kartu = '';
  var tampil = 0;
  for (var i = 0; i < D.percobaan.length; i++) {
    kartu += buildPercobaanCard(D.percobaan[i], i);
    tampil = i + 1;
    if (!State.koleksiSteps[i].done) break;
  }

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulSim) +
        '</h3>' +
        buildIntegerOpSimulator('opsSim', State.sim, simOpts()),
      'ops-sim-panel'
    ) +
    '<p class="dl-caption ops-progress">Percobaan ' +
    tampil +
    ' dari ' +
    D.percobaan.length +
    '</p>' +
    '<div class="ops-list">' +
    kartu +
    '</div>' +
    (semua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📋 Tabel Data Lab Lompatan</h3>' +
            buildTabelData() +
            '<h3>🔍 Amati tabelmu</h3>' +
            buildGuidedQuizList(D.amati, State.amatiOrders, State.amatiPilih)
        )
      : '') +
    (semua && amatiSelesai ? buildDlNextButton('koleksiNextBtn', D.nextLabel) : '') +
    '</section>';

  bindIntegerOpSimulator(container, 'opsSim', State.sim, simOpts(), function () {
    saveState();
    updateSimStatus(container);
  });
  D.percobaan.forEach(function (p, i) {
    bindCekStep('kc' + i, State.koleksiSteps[i], percobaanStep(p, i), saveState, rerender);
  });
  bindGuidedQuizList(container, D.amati, State.amatiPilih, saveState, rerender);
  bindNext('koleksiNextBtn', 'koleksi', 'olahJumlah');
  afterRender(container);
}

/* ============================================================
   8. STAGE: POLA PENJUMLAHAN  (Discovery Learning — sintaks 4a)
   A: pilah arah lompatan (sekali jawab, langsung dibahas).
   B: temukan pola (boleh coba lagi).  C: hitung (berdiagnosa).
   ============================================================ */

function renderOlahJumlah(container) {
  var D = DATA.olahJumlah;
  var pilahSelesai = sortItemsAllAnswered(D.pilah, State.jumlahStates);
  var polaSelesai = pilahSelesai && guidedQuizAllCorrect(D.pola, State.polaPilih);
  var hitungSelesai = polaSelesai && semuaCekSelesai(State.jumlahSteps);
  var rerender = function () {
    renderOlahJumlah(container);
  };

  container.innerHTML =
    '<section aria-label="Pengolahan Data: Pola Penjumlahan">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p class="dl-caption">' +
        esc(D.instruksiA) +
        '</p>' +
        buildSortItems(D.pilah, State.jumlahOrder, D.opsiArah, State.jumlahStates, {
          mono: true,
        })
    ) +
    (pilahSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            buildGuidedQuizList(D.pola, State.polaOrders, State.polaPilih)
        )
      : '') +
    (polaSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulC) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(D.instruksiC) +
            '</p>' +
            buildHitungList('jh', D.hitung, State.jumlahSteps, hitungStep)
        )
      : '') +
    (hitungSelesai
      ? buildTemuanPanel(D.temuan) + buildDlNextButton('jumlahNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, D.pilah, State.jumlahStates, saveState, rerender);
  bindGuidedQuizList(container, D.pola, State.polaPilih, saveState, rerender);
  if (polaSelesai) bindHitungList('jh', D.hitung, State.jumlahSteps, hitungStep, rerender);
  bindNext('jumlahNextBtn', 'olahJumlah', 'olahKurang');
}

/* ============================================================
   9. STAGE: POLA PENGURANGAN  (Discovery Learning — sintaks 4b)
   A: lengkapi tabel 5 − b; B: pasangkan bentuk setara;
   C: hitung pengurangan (berdiagnosa).
   ============================================================ */

function polaKurangStep(r) {
  return hitungStep(r);
}

function buildTabelPolaKurang() {
  var isian = polaKurangIsian();
  return (
    '<div class="table-scroll">' +
    '<table class="data-table ops-pola-table">' +
    '<thead><tr><th scope="col">Pengurangan</th><th scope="col">Hasil</th></tr></thead>' +
    '<tbody>' +
    DATA.olahKurang.polaBaris
      .map(function (r) {
        var k = isian.indexOf(r);
        var terisi = r.tampil || State.polaKurangSteps[k].done;
        return (
          '<tr class="' +
          (r.tampil ? '' : 'ops-pola-table__baru') +
          '"><td class="data-table__num">' +
          esc(fmtOperasiBulat(r.a, '-', r.b)) +
          '</td><td class="data-table__num">' +
          (terisi ? esc(fmtBulat(r.jawab)) : '?') +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table>' +
    '</div>'
  );
}

function renderOlahKurang(container) {
  var D = DATA.olahKurang;
  var isian = polaKurangIsian();
  var polaSelesai = semuaCekSelesai(State.polaKurangSteps);
  var pasangSelesai = polaSelesai && guidedQuizAllCorrect(D.pasang, State.pasangPilih);
  var hitungSelesai = pasangSelesai && semuaCekSelesai(State.kurangSteps);
  var contoh = isian[isian.length - 1];
  var rerender = function () {
    renderOlahKurang(container);
  };

  container.innerHTML =
    '<section aria-label="Pengolahan Data: Pola Pengurangan">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p class="dl-caption">' +
        esc(D.instruksiA) +
        '</p>' +
        '<div class="ops-pola">' +
        buildTabelPolaKurang() +
        '<div class="ops-pola__isian">' +
        buildHitungList('pk', isian, State.polaKurangSteps, polaKurangStep) +
        '</div>' +
        '</div>' +
        (polaSelesai
          ? '<p class="dl-caption" style="margin-top:var(--space-4);">Pada garis bilangan, ' +
            esc(fmtOperasiBulat(contoh.a, '-', contoh.b)) +
            ' ternyata melompat ke kanan, sama seperti ' +
            esc(integerJumps(contoh.a, '-', contoh.b).setara) +
            ':</p>' +
            buildNumberLineJumps('pkLine', {
              min: -10,
              max: 10,
              start: contoh.a,
              jumps: [{ by: -contoh.b }],
              unitHops: true,
            })
          : '')
    ) +
    (polaSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            buildGuidedQuizList(D.pasang, State.pasangOrders, State.pasangPilih)
        )
      : '') +
    (pasangSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulC) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(D.instruksiC) +
            '</p>' +
            buildHitungList('kh', D.hitung, State.kurangSteps, hitungStep)
        )
      : '') +
    (hitungSelesai
      ? buildTemuanPanel(D.temuan) + buildDlNextButton('kurangNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindHitungList('pk', isian, State.polaKurangSteps, polaKurangStep, rerender);
  bindGuidedQuizList(container, D.pasang, State.pasangPilih, saveState, rerender);
  if (pasangSelesai) bindHitungList('kh', D.hitung, State.kurangSteps, hitungStep, rerender);
  bindNext('kurangNextBtn', 'olahKurang', 'olahModel');
  afterRender(container);
}

/* ============================================================
   10. STAGE: MODEL KONTEKSTUAL  (Discovery Learning — sintaks 4c)
   Setiap cerita: pilih kalimat matematika (opsi acak, umpan per
   opsi) → hitung hasilnya (berdiagnosa) → tafsiran konteks.
   ============================================================ */

function modelStep(s) {
  return hitungStep(s, {
    label: 'Hitung: ' + fmtOperasiBulat(s.a, s.op, s.b) + ' = …',
    satuan: s.satuan,
    placeholder: s.satuan === 'rupiah' ? 'mis. −15.000' : 'mis. −5',
  });
}

function modelBenar(s) {
  return State.modelPilih[s.id] === s.correct;
}

function modelSelesai(s, i) {
  return modelBenar(s) && State.modelSteps[i].done;
}

function buildModelCard(s, i) {
  var chosen = State.modelPilih[s.id] || null;
  var benar = modelBenar(s);
  var st = State.modelSteps[i];
  return (
    '<div class="ops-card' +
    (modelSelesai(s, i) ? ' is-done' : '') +
    '">' +
    '<div class="ops-card__head">' +
    '<span class="ops-card__no">Cerita ' +
    (i + 1) +
    '</span>' +
    buildKonteksTag(s.konteks) +
    '<span class="ops-jenis">' +
    (s.jenis === 'selisih' ? '↕ Selisih' : '↗↘ Perubahan') +
    '</span>' +
    '</div>' +
    '<p class="ops-card__cerita">' +
    esc(s.cerita) +
    '</p>' +
    '<div class="quiz-item quiz-item--guided">' +
    '<p class="exercise-label">' +
    esc(s.tanya) +
    '</p>' +
    buildChoiceGroup(s.opsi, State.modelOrders[s.id], {
      chosen: chosen,
      correctId: benar ? s.correct : null,
      grade: true,
      locked: benar,
      group: s.id,
      attr: 'data-model-opt',
    }) +
    buildGuidedChoiceFeedback(chosen, benar, s.umpan) +
    '</div>' +
    (benar ? buildCekStep('md' + i, st, modelStep(s)) : '') +
    (modelSelesai(s, i)
      ? buildFeedbackBox('success', DATA.konteks[s.konteks].ikon, esc(s.temuan))
      : '') +
    '</div>'
  );
}

function renderOlahModel(container) {
  var D = DATA.olahModel;
  var semua = D.soal.every(modelSelesai);
  var rerender = function () {
    renderOlahModel(container);
  };

  var kartu = '';
  var tampil = 0;
  for (var i = 0; i < D.soal.length; i++) {
    kartu += buildModelCard(D.soal[i], i);
    tampil = i + 1;
    if (!modelSelesai(D.soal[i], i)) break;
  }

  container.innerHTML =
    '<section aria-label="Pengolahan Data: Model Kontekstual">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    '<p class="dl-caption ops-progress">Cerita ' +
    tampil +
    ' dari ' +
    D.soal.length +
    '</p>' +
    '<div class="ops-list">' +
    kartu +
    '</div>' +
    (semua ? buildTemuanPanel(D.temuan) + buildDlNextButton('modelNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-model-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.group;
      var s = D.soal.filter(function (x) {
        return x.id === id;
      })[0];
      if (!s || modelBenar(s)) return;
      State.modelPilih[id] = btn.dataset.modelOpt;
      saveState();
      rerender();
    });
  });
  D.soal.forEach(function (s, i) {
    if (modelBenar(s))
      bindCekStep('md' + i, State.modelSteps[i], modelStep(s), saveState, rerender);
  });
  bindNext('modelNextBtn', 'olahModel', 'verifikasi');
}

/* ============================================================
   11. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   ============================================================ */

function buildDugaanBanding() {
  var S = DATA.stimulasi;
  return (
    '<div class="dugaan-compare">' +
    S.dugaan
      .map(function (q) {
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
          esc(findOptionLabel(q.opsi, pilih) || '—') +
          '</strong></span>' +
          '<span>Temuanmu: <strong>' +
          esc(findOptionLabel(q.opsi, q.baku)) +
          '</strong> — ' +
          esc(q.pembahasan) +
          '</span>' +
          '<span class="dugaan-row__verdict">' +
          (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh temuanmu') +
          '</span>' +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    (State.masalahHipotesis
      ? '<div class="hipotesis-box">' +
        '<span class="hipotesis-box__label">Hipotesismu di tahap 2</span>' +
        '<p>' +
        esc(State.masalahHipotesis) +
        '</p>' +
        '<span class="dl-caption">Apakah hipotesismu sesuai dengan temuanmu? Diskusikan dengan pasanganmu.</span>' +
        '</div>'
      : '')
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var selesai = sortItemsAllAnswered(D.pernyataan, State.verifStates);
  var rerender = function () {
    renderVerifikasi(container);
  };

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        buildSortItems(D.pernyataan, State.verifOrder, D.opsiPernyataan, State.verifStates)
    ) +
    (selesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' + esc(D.judulB) + '</h3>' + buildDugaanBanding()
        ) + buildDlNextButton('verifNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, D.pernyataan, State.verifStates, saveState, rerender);
  bindNext('verifNextBtn', 'verifikasi', 'generalisasi');
}

/* ============================================================
   12. STAGE: MENARIK KESIMPULAN  (Discovery Learning — sintaks 6)
   ============================================================ */

function simpulanSemuaBenar() {
  return DATA.generalisasi.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function renderGeneralisasi(container) {
  var D = DATA.generalisasi;
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali temuanmu, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Menarik Kesimpulan">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel(
      kalimatHTML +
        (benarSemua
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah aturan yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman: Menjumlah & Mengurang Bilangan Bulat</h3>' +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + r + '</li>'
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
      renderGeneralisasi(container);
    });
  }

  bindNext('simpulanNextBtn', 'generalisasi', 'terapkan');
}

/* ============================================================
   13. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal TERAP_SOAL yang
   dipilih acak. Isian diperiksa diagnosaOperasiBulat sehingga pesan
   salahnya berupa diagnosa miskonsepsi.
   ============================================================ */

function periksaIsianTerap(value, s) {
  return diagnosaOperasiBulat(value, s.a, s.op, s.b);
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
  inputPlaceholder: 'mis. −5',
  allowNegative: true,
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
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
      '<strong>' + esc(ex.userInput) + '</strong> — ' + periksaIsianTerap(ex.userInput, s).pesan
    );
  },
  revealText: function (s) {
    return s.reveal + ' ' + s.explanation;
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
   14. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var semuaCek = State.koleksiSteps.concat(
    State.jumlahSteps,
    State.polaKurangSteps,
    State.kurangSteps,
    State.modelSteps
  );
  var sekali = semuaCek.filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  var pilahSemua = DATA.olahJumlah.pilah.length + DATA.verifikasi.pernyataan.length;
  var pilahBenar =
    sortItemsCorrectCount(DATA.olahJumlah.pilah, State.jumlahStates) +
    sortItemsCorrectCount(DATA.verifikasi.pernyataan, State.verifStates);
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
        kartu(sekali + '/' + semuaCek.length, 'Hitungan tepat pada percobaan pertama') +
        kartu(pilahBenar + '/' + pilahSemua, 'Pemilahan & pernyataan benar') +
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
    '<div class="contoh-grid">' +
    D.contoh
      .map(function (c) {
        return (
          '<div class="formula-card"><span class="formula-card__label">' +
          buildKonteksTag(c.konteks) +
          '</span><strong class="contoh-grid__num">' +
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
    'Kemampuan murid menjelaskan langkah dengan garis bilangan dan membuat cerita sendiri tetap menjadi bahan penilaian utama.' +
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
   16. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  stimulasi: renderStimulasi,
  masalah: renderMasalah,
  koleksi: renderKoleksi,
  olahJumlah: renderOlahJumlah,
  olahKurang: renderOlahKurang,
  olahModel: renderOlahModel,
  verifikasi: renderVerifikasi,
  generalisasi: renderGeneralisasi,
  terapkan: renderTerapkan,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  var fn = RENDERERS[State.currentStage] || RENDERERS.stimulasi;
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
