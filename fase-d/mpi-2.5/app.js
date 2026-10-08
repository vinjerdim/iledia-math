'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Operasi Hitung Desimal & Konversi Pecahan–Desimal
   dalam Masalah Kontekstual — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen Discovery Learning: buildDiscoveryHead,
       buildTeacherNote, buildTpPanel, buildChoiceGroup,
       buildSortItems, buildGuidedQuizList, buildDlPanel,
       buildDlNextButton;
     • seksi 64 (operasi & konversi desimal): hasilOperasiDesimal,
       fmtOperasiDesimal, langkahKaliDesimal, pecahanKeDesimal,
       desimalKePecahan, langkah isian berdiagnosa
       (makeDesimalStep / buildOpDesimalStep / bindOpDesimalStep /
       periksaOpDesimalStep), serta alat Lab Desimal
       (buildPetakSeratus, buildPengaturArsir, buildPetakLuas,
       buildBersusunDesimal, buildGelasTakar).

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan, rumusan masalah,
   pilihan susunan, pertanyaan pengamatan & pola, pemilahan susunan,
   pernyataan, bank kesimpulan, opsi uji terap, penilaian diri) DIACAK
   dengan shuffleArray() melalui ensureShuffledOrder() /
   ensureSortStates(). Pengacakan dilakukan SEKALI saat state
   disiapkan (initExerciseArrays) lalu urutannya disimpan di State —
   bukan saat render — sehingga pilihan tidak melompat saat dirender
   ulang, tetapi teracak ulang untuk setiap murid dan setiap Reset.
   Soal uji terap juga dipilih acak dari bank (pilihSoalTerap).

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi            (DL sintaks 1)
    6. Stage: Identifikasi Masalah (DL sintaks 2)
    7. Stage: Pengumpulan Data     (DL sintaks 3)
    8. Stage: Pola + −             (DL sintaks 4a)
    9. Stage: Pola × :             (DL sintaks 4b)
   10. Stage: Konversi             (DL sintaks 4c)
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
var STORAGE_KEY = 'mpi-d-2-5-operasi-desimal-v1';

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

  /* Tahap 3 — pengumpulan data (Lab Desimal) */
  lab: {},
  susunOrders: {},
  susunPilih: {},
  koleksiSteps: [],
  amatiOrders: {},
  amatiPilih: {},

  /* Tahap 4a — penjumlahan & pengurangan */
  tambahStates: {},
  tambahOrder: null,
  polaOrders: {},
  polaPilih: {},
  tambahSteps: [],

  /* Tahap 4b — perkalian & pembagian */
  polaKaliSteps: [],
  pasangKaliOrders: {},
  pasangKaliPilih: {},
  polaBagiSteps: [],
  pasangBagiOrders: {},
  pasangBagiPilih: {},
  kaliBagiSteps: [],

  /* Tahap 4c — konversi */
  keDesimalSteps: [],
  berulangOrders: {},
  berulangPilih: {},
  berulangSteps: [],
  kePecahanSteps: [],

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

/* Bilangan bulat dalam rentang [min, max]; selain itu `awal`. */
function bulatDalam(v, min, max, awal) {
  return typeof v === 'number' && Math.round(v) === v && v >= min && v <= max ? v : awal;
}

/* Keadaan awal alat tiap percobaan Lab Desimal (dirapikan bila rusak). */
function ensureLab() {
  var lab = ensureMap('lab');
  DATA.koleksi.percobaan.forEach(function (p) {
    var st = lab[p.id] && typeof lab[p.id] === 'object' ? lab[p.id] : {};
    if (p.alat === 'arsir') st = { arsir: bulatDalam(st.arsir, 0, 100, 0) };
    else if (p.alat === 'luas') {
      st = { baris: bulatDalam(st.baris, 0, 10, 0), kolom: bulatDalam(st.kolom, 0, 10, 0) };
    } else if (p.alat === 'tuang') st = { tuang: bulatDalam(st.tuang, 0, 99, 0) };
    else st = {};
    lab[p.id] = st;
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

/* Baris tabel pola yang harus dilengkapi murid. */
function barisIsian(list) {
  return list.filter(function (r) {
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
  ensureLab();
  var susunOrders = ensureMap('susunOrders');
  DATA.koleksi.percobaan.forEach(function (p) {
    if (p.alat === 'susun') ensureShuffledOrder(susunOrders, p.id, DATA.koleksi.opsiSusun);
  });
  ensureMap('susunPilih');
  ensureExerciseArray(State, 'koleksiSteps', DATA.koleksi.percobaan, makeDesimalStep);
  ensureListOrders('amatiOrders', DATA.koleksi.amati);
  ensureMap('amatiPilih');

  /* Tahap 4a */
  ensureSortStates(
    State,
    'tambahStates',
    'tambahOrder',
    DATA.olahTambah.pilah,
    DATA.olahTambah.opsiSusunan
  );
  ensureListOrders('polaOrders', DATA.olahTambah.pola);
  ensureMap('polaPilih');
  ensureExerciseArray(State, 'tambahSteps', DATA.olahTambah.hitung, makeDesimalStep);

  /* Tahap 4b */
  var KB = DATA.olahKaliBagi;
  ensureExerciseArray(State, 'polaKaliSteps', barisIsian(KB.polaKali), makeDesimalStep);
  ensureListOrders('pasangKaliOrders', KB.pasangKali);
  ensureMap('pasangKaliPilih');
  ensureExerciseArray(State, 'polaBagiSteps', barisIsian(KB.polaBagi), makeDesimalStep);
  ensureListOrders('pasangBagiOrders', KB.pasangBagi);
  ensureMap('pasangBagiPilih');
  ensureExerciseArray(State, 'kaliBagiSteps', KB.hitung, makeDesimalStep);

  /* Tahap 4c */
  var KV = DATA.olahKonversi;
  ensureExerciseArray(State, 'keDesimalSteps', KV.keDesimal, makeDesimalStep);
  ensureListOrders('berulangOrders', KV.berulang);
  ensureMap('berulangPilih');
  ensureExerciseArray(State, 'berulangSteps', KV.keDesimalBerulang, makeDesimalStep);
  ensureExerciseArray(State, 'kePecahanSteps', KV.kePecahan, makeDesimalStep);

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

function buildTemuanPanel(items) {
  return buildDlPanel(
    '<h3 style="margin-top:0;">💡 Temuanmu</h3>' +
      '<ul class="temuan-list">' +
      items
        .map(function (t) {
          return '<li>' + t + '</li>';
        })
        .join('') +
      '</ul>',
    'panel--hero'
  );
}

/* Label konteks: ikon + nama (Koperasi, Dapur, …). */
function buildKonteksTag(konteks) {
  var K = DATA.konteks[konteks];
  return (
    '<span class="opdes-konteks opdes-konteks--' +
    konteks +
    '"><span aria-hidden="true">' +
    K.ikon +
    '</span> ' +
    esc(K.nama) +
    '</span>'
  );
}

/* Label alat Lab Desimal. */
function buildAlatTag(alat) {
  var A = DATA.alat[alat];
  return (
    '<span class="opdes-alat"><span aria-hidden="true">' +
    A.ikon +
    '</span> ' +
    esc(A.nama) +
    '</span>'
  );
}

function semuaCekSelesai(steps) {
  return steps.every(function (s) {
    return s.done;
  });
}

/* Langkah isian 'hitung' untuk data { a, op, b, hints }. */
function hitungStep(item, extra) {
  var step = {
    jenis: 'hitung',
    a: item.a,
    op: item.op,
    b: item.b,
    label: fmtOperasiDesimal(item.a, item.op, item.b) + ' = …',
    hints: item.hints,
  };
  if (extra) Object.assign(step, extra);
  return step;
}

/* Langkah isian konversi 'keDesimal' / 'kePecahan'. */
function konversiStep(jenis) {
  return function (item) {
    return {
      jenis: jenis,
      soal: item.soal,
      label:
        jenis === 'keDesimal'
          ? 'Ubah ke desimal: ' + esc(tulisTerpadu(item.soal)) + ' = …'
          : 'Ubah ke pecahan paling sederhana: ' + esc(tulisTerpadu(item.soal)) + ' = …',
      hints: item.hints,
    };
  };
}

/* Daftar langkah isian berdiagnosa; idPrefix + indeks menjadi id DOM. */
function buildStepList(idPrefix, items, steps, stepOf) {
  return items
    .map(function (it, i) {
      return buildOpDesimalStep(idPrefix + i, steps[i], stepOf(it), i + 1);
    })
    .join('');
}

function bindStepList(idPrefix, items, steps, stepOf, rerender) {
  items.forEach(function (it, i) {
    bindOpDesimalStep(idPrefix + i, steps[i], stepOf(it), saveState, rerender);
  });
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
        '<article class="struk-card struk-card--' +
        k.konteks +
        '">' +
        '<header class="struk-card__head">' +
        buildKonteksTag(k.konteks) +
        '<span class="struk-card__sumber">' +
        esc(k.sumber) +
        '</span></header>' +
        '<p class="struk-card__sorot">' +
        esc(k.sorot) +
        '</p>' +
        '<p class="struk-card__teks">' +
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
      '<h2 style="margin-top:0;">🧾 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="struk-grid">' +
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
   7. STAGE: PENGUMPULAN DATA — LAB DESIMAL  (DL sintaks 3)
   Percobaan dibuka satu per satu. Setiap percobaan memakai satu alat;
   isian hasil baru muncul setelah alat diatur sesuai percobaan.
   ============================================================ */

/* Langkah isian percobaan: konversi (arsir) atau hitung (alat lain). */
function percobaanStep(p) {
  if (p.alat === 'arsir') {
    return {
      jenis: 'keDesimal',
      soal: p.soal,
      label: 'Catat dalam bentuk desimal: ' + esc(tulisTerpadu(p.soal)) + ' = …',
      hints: p.hints,
    };
  }
  return hitungStep(p, { label: 'Catat hasilnya: ' + fmtOperasiDesimal(p.a, p.op, p.b) + ' = …' });
}

/* Apakah alat percobaan p sudah diatur dengan benar? */
function alatSiap(p) {
  var st = State.lab[p.id];
  if (p.alat === 'arsir') return st.arsir === p.arsir;
  if (p.alat === 'susun') return State.susunPilih[p.id] === 'koma';
  if (p.alat === 'luas') return st.baris === p.baris && st.kolom === p.kolom;
  return st.tuang >= banyakGelas(p);
}

function banyakGelas(p) {
  return parseInt(hasilOperasiDesimal(p.a, ':', p.b), 10);
}

/* Teks desimal persepuluhan dari banyak baris/kolom: 3 → "0,3". */
function persepuluh(n) {
  return teksDesimalEksak({ num: n, den: 10 });
}

/* Tombol − / + untuk alat bilangan bulat kecil. */
function buildStepper(id, label, nilai, min, max, teks) {
  return (
    '<div class="opdes-stepper" role="group" aria-label="' +
    esc(label) +
    '">' +
    '<span class="opdes-stepper__label">' +
    esc(label) +
    '</span>' +
    '<button type="button" class="btn btn--ghost btn--small opdes-stepper__btn" data-step="' +
    id +
    '" data-delta="-1" aria-label="Kurangi ' +
    esc(label.toLowerCase()) +
    '"' +
    (nilai <= min ? ' disabled' : '') +
    '>−</button>' +
    '<output class="opdes-stepper__val" aria-live="polite">' +
    esc(teks) +
    '</output>' +
    '<button type="button" class="btn btn--ghost btn--small opdes-stepper__btn" data-step="' +
    id +
    '" data-delta="1" aria-label="Tambah ' +
    esc(label.toLowerCase()) +
    '"' +
    (nilai >= max ? ' disabled' : '') +
    '>+</button>' +
    '</div>'
  );
}

/* Alat percobaan (interaktif bila isian belum selesai). */
function buildAlat(p, i, selesai) {
  var st = State.lab[p.id];
  if (p.alat === 'arsir') {
    return buildPetakSeratus(st.arsir) + (selesai ? '' : buildPengaturArsir('ar' + i, st.arsir));
  }
  if (p.alat === 'susun') {
    var pilih = State.susunPilih[p.id] || null;
    var benar = pilih === 'koma';
    var opsi = DATA.koleksi.opsiSusun.map(function (o) {
      return {
        id: o.id,
        label: buildBersusunDesimal(p.a, p.op, p.b, {
          rataKanan: o.id === 'kanan',
          hasil: benar && o.id === 'koma',
          tandai: !!pilih && (benar || o.id === pilih),
        }),
      };
    });
    return (
      '<p class="exercise-label">Susunan bersusun mana yang benar?</p>' +
      '<div class="opdes-susun-pilih">' +
      buildChoiceGroup(opsi, State.susunOrders[p.id], {
        chosen: pilih,
        correctId: benar ? 'koma' : null,
        grade: true,
        locked: benar,
        group: p.id,
        attr: 'data-susun',
      }) +
      '</div>' +
      buildGuidedChoiceFeedback(pilih, benar, DATA.koleksi.umpanSusun)
    );
  }
  if (p.alat === 'luas') {
    return (
      buildPetakLuas(persepuluh(st.baris), persepuluh(st.kolom)) +
      (selesai
        ? ''
        : '<div class="opdes-stepper-row">' +
          buildStepper(
            'lb' + i,
            'Baris',
            st.baris,
            0,
            10,
            st.baris + ' = ' + persepuluh(st.baris)
          ) +
          buildStepper(
            'lk' + i,
            'Kolom',
            st.kolom,
            0,
            10,
            st.kolom + ' = ' + persepuluh(st.kolom)
          ) +
          '</div>')
    );
  }
  var penuh = banyakGelas(p);
  return (
    buildGelasTakar(p.a, p.b, { tuang: st.tuang }) +
    (selesai
      ? ''
      : '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary btn--small" data-tuang="' +
        i +
        '"' +
        (st.tuang >= penuh ? ' disabled' : '') +
        '>🥤 Tuang 1 gelas</button>' +
        '<button type="button" class="btn btn--ghost btn--small" data-ulang="' +
        i +
        '"' +
        (st.tuang ? '' : ' disabled') +
        '>↺ Ulangi</button>' +
        '</div>')
  );
}

function buildPercobaanCard(p, i) {
  var st = State.koleksiSteps[i];
  var siap = alatSiap(p);
  return (
    '<div class="opdes-card' +
    (st.done ? ' is-done' : '') +
    '">' +
    '<div class="opdes-card__head">' +
    '<span class="opdes-card__no">Percobaan ' +
    (i + 1) +
    '</span>' +
    buildKonteksTag(p.konteks) +
    buildAlatTag(p.alat) +
    '</div>' +
    '<p class="opdes-card__cerita">' +
    esc(p.cerita) +
    '</p>' +
    (p.atur && !st.done ? '<p class="dl-caption">🛠️ ' + esc(p.atur) + '</p>' : '') +
    '<div class="opdes-alat-wrap">' +
    buildAlat(p, i, st.done) +
    '</div>' +
    (p.alat !== 'susun' && !st.done
      ? '<p class="opdes-status' +
        (siap ? ' is-ok' : '') +
        '" role="status">' +
        (siap
          ? '✓ Alat sudah diatur sesuai percobaan. Catat hasilnya!'
          : '↻ Atur alatnya dulu sesuai petunjuk di atas.') +
        '</p>'
      : '') +
    (siap || st.done ? buildOpDesimalStep('kc' + i, st, percobaanStep(p)) : '') +
    (st.done ? buildFeedbackBox('success', '💡', p.temuan) : '') +
    '</div>'
  );
}

function buildTabelData() {
  return (
    '<div class="table-scroll">' +
    '<table class="data-table">' +
    '<thead><tr><th scope="col">No.</th><th scope="col">Alat</th>' +
    '<th scope="col">Kalimat matematika</th><th scope="col">Hasil</th></tr></thead>' +
    '<tbody>' +
    DATA.koleksi.percobaan
      .map(function (p, i) {
        var kalimat = p.alat === 'arsir' ? tulisTerpadu(p.soal) : fmtOperasiDesimal(p.a, p.op, p.b);
        var hasil =
          p.alat === 'arsir'
            ? pecahanKeDesimal(p.soal).persepuluhan + ' = ' + pecahanKeDesimal(p.soal).teks
            : hasilOperasiDesimal(p.a, p.op, p.b);
        return (
          '<tr><td>' +
          (i + 1) +
          '</td><td>' +
          buildAlatTag(p.alat) +
          '</td><td class="data-table__num">' +
          esc(kalimat) +
          '</td><td class="data-table__num">' +
          esc(hasil) +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table>' +
    '</div>'
  );
}

function bindAlat(container, rerender) {
  var P = DATA.koleksi.percobaan;
  P.forEach(function (p, i) {
    if (p.alat !== 'arsir') return;
    bindPengaturArsir(container, 'ar' + i, function (delta) {
      var st = State.lab[p.id];
      st.arsir = Math.max(0, Math.min(100, st.arsir + delta));
      saveState();
      rerender();
    });
  });
  container.querySelectorAll('[data-step]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.dataset.step;
      var p = P[Number(key.slice(2))];
      var st = State.lab[p.id];
      var field = key.charAt(1) === 'b' ? 'baris' : 'kolom';
      st[field] = Math.max(0, Math.min(10, st[field] + Number(btn.dataset.delta)));
      saveState();
      rerender();
    });
  });
  container.querySelectorAll('[data-tuang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var p = P[Number(btn.dataset.tuang)];
      State.lab[p.id].tuang = Math.min(banyakGelas(p), State.lab[p.id].tuang + 1);
      saveState();
      rerender();
    });
  });
  container.querySelectorAll('[data-ulang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.lab[P[Number(btn.dataset.ulang)].id].tuang = 0;
      saveState();
      rerender();
    });
  });
  container.querySelectorAll('[data-susun]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.group;
      if (State.susunPilih[id] === 'koma') return;
      State.susunPilih[id] = btn.dataset.susun;
      saveState();
      rerender();
    });
  });
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var semua = semuaCekSelesai(State.koleksiSteps);
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
    '<p class="dl-caption opdes-progress">Percobaan ' +
    tampil +
    ' dari ' +
    D.percobaan.length +
    '</p>' +
    '<div class="opdes-list">' +
    kartu +
    '</div>' +
    (semua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📋 Tabel Data Lab Desimal</h3>' +
            buildTabelData() +
            '<h3>🔍 Amati tabelmu</h3>' +
            buildGuidedQuizList(D.amati, State.amatiOrders, State.amatiPilih)
        )
      : '') +
    (semua && amatiSelesai ? buildDlNextButton('koleksiNextBtn', D.nextLabel) : '') +
    '</section>';

  bindAlat(container, rerender);
  D.percobaan.forEach(function (p, i) {
    if (alatSiap(p) || State.koleksiSteps[i].done) {
      bindOpDesimalStep('kc' + i, State.koleksiSteps[i], percobaanStep(p), saveState, rerender);
    }
  });
  bindGuidedQuizList(container, D.amati, State.amatiPilih, saveState, rerender);
  bindNext('koleksiNextBtn', 'koleksi', 'olahTambah');
}

/* ============================================================
   8. STAGE: POLA + −  (Discovery Learning — sintaks 4a)
   A: pilah susunan benar/keliru.  B: temukan pola (boleh coba lagi).
   C: hitung (berdiagnosa).
   ============================================================ */

function renderOlahTambah(container) {
  var D = DATA.olahTambah;
  var pilahSelesai = sortItemsAllAnswered(D.pilah, State.tambahStates);
  var polaSelesai = pilahSelesai && guidedQuizAllCorrect(D.pola, State.polaPilih);
  var hitungSelesai = polaSelesai && semuaCekSelesai(State.tambahSteps);
  var rerender = function () {
    renderOlahTambah(container);
  };

  container.innerHTML =
    '<section aria-label="Pengolahan Data: Penjumlahan & Pengurangan">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p class="dl-caption">' +
        esc(D.instruksiA) +
        '</p>' +
        buildSortItems(D.pilah, State.tambahOrder, D.opsiSusunan, State.tambahStates, {
          mono: true,
          visual: function (it) {
            return buildBersusunDesimal(it.a, it.op, it.b, {
              rataKanan: it.rataKanan,
              tandai: !!State.tambahStates[it.id].chosen,
            });
          },
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
            buildStepList('th', D.hitung, State.tambahSteps, hitungStep)
        )
      : '') +
    (hitungSelesai
      ? buildTemuanPanel(D.temuan) + buildDlNextButton('tambahNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, D.pilah, State.tambahStates, saveState, rerender);
  bindGuidedQuizList(container, D.pola, State.polaPilih, saveState, rerender);
  if (polaSelesai) bindStepList('th', D.hitung, State.tambahSteps, hitungStep, rerender);
  bindNext('tambahNextBtn', 'olahTambah', 'olahKaliBagi');
}

/* ============================================================
   9. STAGE: POLA × :  (Discovery Learning — sintaks 4b)
   A: tabel pola perkalian → pola letak koma.
   B: tabel pola pembagian → geser koma bersama.  C: hitung.
   ============================================================ */

/* Tabel pola; `op` '×' atau ':'; baris isian dilengkapi lewat `steps`. */
function buildTabelPola(rows, op, steps) {
  var isian = barisIsian(rows);
  var kali = op === '×';
  return (
    '<div class="table-scroll">' +
    '<table class="data-table opdes-pola-table">' +
    '<thead><tr><th scope="col">' +
    (kali ? 'Perkalian' : 'Pembagian') +
    '</th><th scope="col">' +
    (kali ? 'Angka di belakang koma' : 'Pembagi × … = bulat') +
    '</th><th scope="col">Hasil</th></tr></thead>' +
    '<tbody>' +
    rows
      .map(function (r) {
        var k = isian.indexOf(r);
        var terisi = r.tampil || steps[k].done;
        var info;
        if (kali) {
          var l = langkahKaliDesimal(r.a, r.b);
          info = l.angkaA + ' + ' + l.angkaB + ' = ' + l.angka;
        } else {
          var m = langkahBagiDesimal(r.a, r.b);
          info = m.faktor > 1 ? '× ' + m.faktor + ' → ' + m.a + ' : ' + m.b : '—';
        }
        return (
          '<tr class="' +
          (r.tampil ? '' : 'opdes-pola-table__baru') +
          '"><td class="data-table__num">' +
          esc(fmtOperasiDesimal(r.a, op, r.b)) +
          '</td><td>' +
          (terisi ? esc(info) : '?') +
          '</td><td class="data-table__num">' +
          (terisi ? esc(hasilOperasiDesimal(r.a, op, r.b)) : '?') +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table>' +
    '</div>'
  );
}

function polaStepOf(op) {
  return function (r) {
    return hitungStep({ a: r.a, op: op, b: r.b, hints: r.hints });
  };
}

function renderOlahKaliBagi(container) {
  var D = DATA.olahKaliBagi;
  var isiKali = barisIsian(D.polaKali);
  var isiBagi = barisIsian(D.polaBagi);
  var kaliSelesai = semuaCekSelesai(State.polaKaliSteps);
  var pasangKali = kaliSelesai && guidedQuizAllCorrect(D.pasangKali, State.pasangKaliPilih);
  var bagiSelesai = pasangKali && semuaCekSelesai(State.polaBagiSteps);
  var pasangBagi = bagiSelesai && guidedQuizAllCorrect(D.pasangBagi, State.pasangBagiPilih);
  var hitungSelesai = pasangBagi && semuaCekSelesai(State.kaliBagiSteps);
  var rerender = function () {
    renderOlahKaliBagi(container);
  };

  container.innerHTML =
    '<section aria-label="Pengolahan Data: Perkalian & Pembagian">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p class="dl-caption">' +
        esc(D.instruksiA) +
        '</p>' +
        '<div class="opdes-pola">' +
        buildTabelPola(D.polaKali, '×', State.polaKaliSteps) +
        '<div class="opdes-pola__isian">' +
        buildStepList('pk', isiKali, State.polaKaliSteps, polaStepOf('×')) +
        '</div>' +
        '</div>' +
        (kaliSelesai
          ? '<div class="opdes-luas-mini">' +
            buildPetakLuas('0,3', '0,4') +
            '</div>' +
            buildGuidedQuizList(D.pasangKali, State.pasangKaliOrders, State.pasangKaliPilih)
          : '')
    ) +
    (pasangKali
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(D.instruksiB) +
            '</p>' +
            '<div class="opdes-pola">' +
            buildTabelPola(D.polaBagi, ':', State.polaBagiSteps) +
            '<div class="opdes-pola__isian">' +
            buildStepList('pb', isiBagi, State.polaBagiSteps, polaStepOf(':')) +
            '</div>' +
            '</div>' +
            (bagiSelesai
              ? buildGuidedQuizList(D.pasangBagi, State.pasangBagiOrders, State.pasangBagiPilih)
              : '')
        )
      : '') +
    (pasangBagi
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulC) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(D.instruksiC) +
            '</p>' +
            buildStepList('kb', D.hitung, State.kaliBagiSteps, hitungStep)
        )
      : '') +
    (hitungSelesai
      ? buildTemuanPanel(D.temuan) + buildDlNextButton('kaliBagiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindStepList('pk', isiKali, State.polaKaliSteps, polaStepOf('×'), rerender);
  bindGuidedQuizList(container, D.pasangKali, State.pasangKaliPilih, saveState, rerender);
  if (pasangKali) bindStepList('pb', isiBagi, State.polaBagiSteps, polaStepOf(':'), rerender);
  bindGuidedQuizList(container, D.pasangBagi, State.pasangBagiPilih, saveState, rerender);
  if (pasangBagi) bindStepList('kb', D.hitung, State.kaliBagiSteps, hitungStep, rerender);
  bindNext('kaliBagiNextBtn', 'olahKaliBagi', 'olahKonversi');
}

/* ============================================================
   10. STAGE: KONVERSI  (Discovery Learning — sintaks 4c)
   A: pecahan → desimal (penyebut 10ⁿ).  B: desimal berulang.
   C: desimal → pecahan paling sederhana.
   ============================================================ */

var keDesimalStep = konversiStep('keDesimal');
var kePecahanStep = konversiStep('kePecahan');

function buildPembagianBersusun(P) {
  return (
    '<div class="opdes-bagi">' +
    '<p class="opdes-bagi__judul">' +
    esc(tulisTerpadu(P.soal)) +
    ' berarti 1 : 3</p>' +
    '<ol class="opdes-bagi__langkah">' +
    P.langkah
      .map(function (l) {
        return '<li>' + esc(l) + '</li>';
      })
      .join('') +
    '</ol>' +
    '</div>'
  );
}

function renderOlahKonversi(container) {
  var D = DATA.olahKonversi;
  var aSelesai = semuaCekSelesai(State.keDesimalSteps);
  var bQuiz = aSelesai && guidedQuizAllCorrect(D.berulang, State.berulangPilih);
  var bSelesai = bQuiz && semuaCekSelesai(State.berulangSteps);
  var cSelesai = bSelesai && semuaCekSelesai(State.kePecahanSteps);
  var rerender = function () {
    renderOlahKonversi(container);
  };

  container.innerHTML =
    '<section aria-label="Pengolahan Data: Konversi Pecahan dan Desimal">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p class="dl-caption">' +
        esc(D.instruksiA) +
        '</p>' +
        buildStepList('kd', D.keDesimal, State.keDesimalSteps, keDesimalStep)
    ) +
    (aSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            buildPembagianBersusun(D.pembagian) +
            buildGuidedQuizList(D.berulang, State.berulangOrders, State.berulangPilih) +
            (bQuiz
              ? buildStepList('kr', D.keDesimalBerulang, State.berulangSteps, keDesimalStep)
              : '')
        )
      : '') +
    (bSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulC) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(D.instruksiC) +
            '</p>' +
            buildStepList('kp', D.kePecahan, State.kePecahanSteps, kePecahanStep)
        )
      : '') +
    (cSelesai
      ? buildTemuanPanel(D.temuan) + buildDlNextButton('konversiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindStepList('kd', D.keDesimal, State.keDesimalSteps, keDesimalStep, rerender);
  bindGuidedQuizList(container, D.berulang, State.berulangPilih, saveState, rerender);
  if (bQuiz) bindStepList('kr', D.keDesimalBerulang, State.berulangSteps, keDesimalStep, rerender);
  if (bSelesai) bindStepList('kp', D.kePecahan, State.kePecahanSteps, kePecahanStep, rerender);
  bindNext('konversiNextBtn', 'olahKonversi', 'verifikasi');
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
          '<h3 style="margin-top:0;">Rangkuman: Operasi Desimal & Konversi Pecahan–Desimal</h3>' +
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
   dipilih acak. Isian diperiksa periksaOpDesimalStep (diagnosa operasi
   atau konversi sesuai jenis soal) sehingga pesan salahnya berupa
   diagnosa miskonsepsi.
   ============================================================ */

function periksaIsianTerap(value, s) {
  return periksaOpDesimalStep(makeDesimalStep(), s, value);
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
  inputPlaceholder: 'mis. 2,05 atau 3/4',
  inputMode: 'text',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  inputSuffix: function (s) {
    return s.satuan ? '<span class="bbk-satuan">' + esc(s.satuan) + '</span>' : '';
  },
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
    State.tambahSteps,
    State.polaKaliSteps,
    State.polaBagiSteps,
    State.kaliBagiSteps,
    State.keDesimalSteps,
    State.berulangSteps,
    State.kePecahanSteps
  );
  var sekali = semuaCek.filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  var pilahSemua = DATA.olahTambah.pilah.length + DATA.verifikasi.pernyataan.length;
  var pilahBenar =
    sortItemsCorrectCount(DATA.olahTambah.pilah, State.tambahStates) +
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
        kartu(sekali + '/' + semuaCek.length, 'Isian tepat pada percobaan pertama') +
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
    '<div class="opdes-contoh-grid">' +
    D.contoh
      .map(function (c) {
        return (
          '<div class="formula-card"><span class="formula-card__label">' +
          buildKonteksTag(c.konteks) +
          '</span><strong class="opdes-contoh-grid__num">' +
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
    'Kemampuan murid menjelaskan letak koma dan membuat cerita sendiri tetap menjadi bahan penilaian utama.' +
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
  olahTambah: renderOlahTambah,
  olahKaliBagi: renderOlahKaliBagi,
  olahKonversi: renderOlahKonversi,
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
