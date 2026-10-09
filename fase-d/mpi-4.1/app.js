'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Pola pada Susunan Benda — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen bersama: buildDiscoveryHead, buildTeacherNote,
       buildTpPanel, buildChoiceGroup, buildSortItems,
       buildGuidedQuizList, buildSequenceTiles, buildDlPanel,
       buildDlNextButton, buildFeedbackBox;
     • seksi 32: buildSelisihTracker / bindSelisihTracker (jembatan
       selisih antar tahap);
     • seksi 68: buildLangkahRasio / bindLangkahRasio (langkah isian
       berdiagnosa, dengan pemeriksa dari step.periksa);
     • seksi 71 (pola susunan benda): POLA_BENDA, barisanPola,
       jenisKeteraturan, deskripsiPola, periksaSoalPola, opsiSoalPola,
       siapkanLangkahPola, serta alat interaktif buildSusunanPola,
       buildDeretSusunan, dan buildLabSusun (Lab Susun).

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan stimulasi, rumusan
   masalah, pertanyaan temuan, pemilahan susunan, pernyataan
   verifikasi, bank kesimpulan, opsi uji terap, penilaian diri) DIACAK
   dengan shuffleArray() melalui ensureShuffledOrder() /
   ensureSortStates(). Pengacakan dilakukan SEKALI saat state disiapkan
   (initExerciseArrays) lalu urutannya disimpan di State — bukan saat
   render — sehingga pilihan tidak melompat saat dirender ulang, tetapi
   teracak ulang untuk setiap murid dan setiap Reset. Soal uji terap
   juga dipilih acak dari bank (pilihSoalTerap) dan opsi pilihan
   gandanya dibangun engine (opsiSoalPola).

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi               (DL sintaks 1)
    6. Stage: Merumuskan Masalah      (DL sintaks 2)
    7. Stage: Lab Susun               (DL sintaks 3)
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
var STORAGE_KEY = 'mpi-d-4-1-pola-benda-v1';
var OLAH_STAGES = ['olahKorek', 'olahUbin', 'olahKursi'];

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

/* Label konteks: ikon + nama (Korek Api, Ubin, …). */
function buildKonteksTag(konteks) {
  var K = DATA.konteks[konteks];
  return (
    '<span class="pola-konteks pola-konteks--' +
    konteks +
    '"><span aria-hidden="true">' +
    K.ikon +
    '</span> ' +
    esc(K.nama) +
    '</span>'
  );
}

/* Label tahap untuk kartu barisan: 'Tahap 1', 'Tahap 2', … */
function labelTahap(k, awalan) {
  var out = [];
  for (var i = 1; i <= k; i++) out.push((awalan || 'Tahap') + ' ' + i);
  return out;
}

var DUGAAN = DATA.stimulasi.dugaan.map(siapkanGuided);
var MASALAH_OPSI = opsiAman(DATA.masalah.opsi);

/* Konfigurasi tiap tahap olah data: pertanyaan temuan & langkah isian. */
var OLAH = {};
OLAH_STAGES.forEach(function (id, i) {
  var D = DATA[id];
  OLAH[id] = {
    prefix: ['ok', 'ou', 'or'][i],
    temuan: D.temuan.map(siapkanGuided),
    langkah: D.langkah.map(function (s) {
      return siapkanLangkahPola(
        Object.assign({}, s, {
          label: esc(s.label),
          hints: (s.hints || []).map(esc),
          temuan: esc(s.temuan),
          placeholder: 'mis. 12',
        })
      );
    }),
    next: STAGES[STAGES.indexOf(id) + 1],
  };
});

var SEMUA_TEMUAN = OLAH_STAGES.reduce(function (acc, id) {
  return acc.concat(OLAH[id].temuan);
}, []);

/* Butir pemilahan susunan baru { id, teks, correct, explanation, sumber }. */
var SUSUNAN_ITEMS = DATA.verifikasi.susunan.map(function (s) {
  return {
    id: s.id,
    teks: esc(s.teks),
    correct: s.correct,
    explanation: esc(s.explanation),
    sumber: s,
  };
});

var PERNYATAAN_ITEMS = DATA.verifikasi.pernyataan.map(function (p) {
  return { id: p.id, teks: esc(p.teks), correct: p.correct, explanation: esc(p.explanation) };
});

/* Soal pilihan ganda uji terap: opsi dibangun engine (opsiSoalPola). */
var OPSI_TERAP = {};
DATA.terapkan.soal.forEach(function (s) {
  if (s.type !== 'choice') return;
  var opsi = opsiSoalPola(s);
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

  /* Tahap 3 — Lab Susun */
  labSusun: null,

  /* Tahap 4a–c — olah data */
  selisih: {},
  temuanOrders: {},
  temuanPilih: {},
  langkahSteps: {},

  /* Tahap 5 — verifikasi */
  susunanStates: {},
  susunanOrder: null,
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

/* Data tahap 1..tahapCatat susunan yang diolah pada tahap olah `id`. */
function dataOlah(id) {
  return barisanPola(DATA[id].jenis, DATA.koleksi.lab.tahapCatat);
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
  ensureLabSusun(ensureMap('labSusun'), DATA.koleksi.lab);

  /* Tahap 4a–c */
  var selisih = ensureMap('selisih');
  var langkah = ensureMap('langkahSteps');
  OLAH_STAGES.forEach(function (id) {
    ensureSelisihState(selisih, id, dataOlah(id));
    ensureExerciseArray(langkah, id, OLAH[id].langkah, makeCekStep);
  });
  ensureListOrders('temuanOrders', SEMUA_TEMUAN);
  ensureMap('temuanPilih');

  /* Tahap 5 */
  ensureSortStates(State, 'susunanStates', 'susunanOrder', SUSUNAN_ITEMS, DATA.verifikasi.kategori);
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

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati tahap 1–3 dan MENDUGA tahap 4. Tidak dinilai.
   ============================================================ */

function buildSusunanKartu(s) {
  var P = POLA_BENDA[s.jenis];
  return (
    '<article class="pola-kartu">' +
    '<h3 class="pola-kartu__judul"><span aria-hidden="true">' +
    IKON_BENDA_POLA[P.benda] +
    '</span> ' +
    esc(s.judul) +
    '</h3>' +
    '<p class="pola-kartu__teks">' +
    esc(s.teks) +
    '</p>' +
    buildDeretSusunan(s.jenis, 3, { tanya: true }) +
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
      '<h2 style="margin-top:0;">🎭 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="pola-kartu-grid">' +
        D.susunan.map(buildSusunanKartu).join('') +
        '</div>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaanmu untuk tahap 4?</h3>' +
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
      showNotice('Pilih dugaanmu untuk ketiga susunan sebelum melanjutkan.');
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
   7. STAGE: LAB SUSUN  (Discovery Learning — sintaks 3)
   Murid mengamati, menghitung, dan mencatat tahap 1–4 dari ketiga
   susunan. Tabel ringkasan muncul setelah semua catatan benar.
   ============================================================ */

function buildRingkasanData() {
  var L = DATA.koleksi.lab;
  return (
    '<table class="data-table pola-ringkas">' +
    '<caption>Data pengamatan</caption>' +
    '<thead><tr><th scope="col">Susunan</th>' +
    labelTahap(L.tahapCatat)
      .map(function (t) {
        return '<th scope="col">' + t + '</th>';
      })
      .join('') +
    '</tr></thead><tbody>' +
    L.jenisList
      .map(function (j) {
        var P = POLA_BENDA[j];
        return (
          '<tr><th scope="row">' +
          esc(P.nama) +
          '</th>' +
          barisanPola(j, L.tahapCatat)
            .map(function (v) {
              return '<td>' + formatNumber(v) + ' ' + P.satuan + '</td>';
            })
            .join('') +
          '</tr>'
        );
      })
      .join('') +
    '</tbody></table>'
  );
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var lab = State.labSusun;
  var lengkap = labSusunLengkap(lab, D.lab);

  container.innerHTML =
    '<section aria-label="Lab Susun">' +
    buildHead(D) +
    buildPengantar(D.pengantar) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🔬 Lab Susun</h3>' +
        '<details class="pola-tips"><summary>💡 Tips menghitung</summary>' +
        '<ul>' +
        D.tips
          .map(function (t) {
            return '<li>' + esc(t) + '</li>';
          })
          .join('') +
        '</ul></details>' +
        buildLabSusun('ls', lab, D.lab)
    ) +
    (lengkap
      ? buildDlPanel(
          buildFeedbackBox('success', '✓', esc(D.selesaiTeks)) +
            '<div class="pola-ringkas-wrap">' +
            buildRingkasanData() +
            '</div>'
        ) + buildDlNextButton('koleksiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindLabSusun(container, 'ls', lab, D.lab, function () {
    saveState();
    renderKoleksi(container);
  });
  bindNext('koleksiNextBtn', 'koleksi', 'olahKorek');
}

/* ============================================================
   8. STAGE: OLAH DATA  (Discovery Learning — sintaks 4a–4c)
   Jembatan selisih → pertanyaan temuan → prediksi tahap berikutnya
   (langkah isian berdiagnosa) → bukti gambar tahap 5 & deskripsi
   pola. Ketiga tahap memakai satu renderer.
   ============================================================ */

function renderOlah(stageId, container) {
  var D = DATA[stageId];
  var C = OLAH[stageId];
  var P = POLA_BENDA[D.jenis];
  var data = dataOlah(stageId);
  var sel = State.selisih[stageId];
  var steps = State.langkahSteps[stageId];
  var selisihOk = selisihTrackerSelesai(sel);
  var temuanOk = selisihOk && guidedQuizAllCorrect(C.temuan, State.temuanPilih);
  var aktif = langkahAktif(steps);
  var langkahOk = temuanOk && aktif >= C.langkah.length;
  var rerender = function () {
    renderOlah(stageId, container);
  };

  var langkahHTML = C.langkah
    .slice(0, Math.min(aktif + 1, C.langkah.length))
    .map(function (step, i) {
      return buildLangkahRasio(C.prefix + i, steps[i], step, i + 1);
    })
    .join('');

  container.innerHTML =
    '<section aria-label="' +
    esc(D.kicker) +
    '">' +
    buildHead(D) +
    buildPengantar(D.pengantar) +
    buildDlPanel(
      '<h3 style="margin-top:0;"><span aria-hidden="true">' +
        IKON_BENDA_POLA[P.benda] +
        '</span> ' +
        esc(D.judul) +
        '</h3>' +
        buildDeretSusunan(D.jenis, data.length, { sorotBaru: selisihOk }) +
        '<p class="dl-caption">Bandingkan setiap dua tahap yang berurutan: berapa ' +
        P.satuan +
        ' yang ditambahkan?</p>' +
        buildSelisihTracker(C.prefix + 'Sel', data, sel, {
          labels: labelTahap(data.length),
          satuan: P.satuan,
        })
    ) +
    (selisihOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">💡 Apa temuanmu?</h3>' +
            buildGuidedQuizList(C.temuan, State.temuanOrders, State.temuanPilih)
        )
      : '') +
    (temuanOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🔮 Lanjutkan polanya</h3>' +
            '<div class="dl-steps">' +
            langkahHTML +
            '</div>'
        )
      : '') +
    (langkahOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🖼️ ' +
            esc(D.buktiLabel) +
            '</h3>' +
            '<figure class="pola-bukti">' +
            buildSusunanPola(D.jenis, 5, { sorotBaru: true }) +
            '<figcaption>Tahap 5 — oranye: ' +
            P.satuan +
            ' baru, pudar: ' +
            P.satuan +
            ' dari tahap 4</figcaption>' +
            '</figure>' +
            buildFeedbackBox(
              'success',
              '📝',
              '<strong>Deskripsi pola:</strong> ' +
                esc(deskripsiPola(barisanPola(D.jenis, 5), P.satuan))
            )
        ) + buildDlNextButton(C.prefix + 'NextBtn', D.nextLabel)
      : '') +
    '</section>';

  if (!selisihOk) {
    bindSelisihTracker(container, C.prefix + 'Sel', data, sel, saveState, rerender);
  }
  if (selisihOk && !temuanOk) {
    bindGuidedQuizList(container, C.temuan, State.temuanPilih, saveState, rerender);
  }
  if (temuanOk && !langkahOk) {
    bindLangkahRasio(C.prefix + aktif, steps[aktif], C.langkah[aktif], saveState, rerender);
  }
  bindNext(C.prefix + 'NextBtn', stageId, C.next);
}

function renderOlahKorek(container) {
  renderOlah('olahKorek', container);
}

function renderOlahUbin(container) {
  renderOlah('olahUbin', container);
}

function renderOlahKursi(container) {
  renderOlah('olahKursi', container);
}

/* ============================================================
   9. STAGE: VERIFIKASI  (Discovery Learning — sintaks 5)
   A. Pilah susunan baru (bukti selisih muncul setelah memilih)
   B. Pernyataan benar / salah / kadang-kadang benar
   C. Dugaan awal & hipotesis dibandingkan dengan data
   ============================================================ */

/* Visual butir pemilahan: gambar tahap 1–3 atau kartu barisan. */
function visualSusunan(it) {
  var s = it.sumber;
  var dipilih = !!State.susunanStates[it.id].chosen;
  var suku = s.suku || barisanPola(s.jenis, 4);
  return (
    (s.jenis ? buildDeretSusunan(s.jenis, 3, { tanya: !dipilih }) : '') +
    (s.suku || dipilih
      ? buildSequenceTiles(suku, {
          labels: labelTahap(suku.length, s.labelTahap),
          showDiff: dipilih,
        })
      : '') +
    (dipilih
      ? '<p class="dl-caption">Bukti: ' +
        esc(deskripsiPola(suku, s.jenis ? POLA_BENDA[s.jenis].satuan : '')) +
        '</p>'
      : '')
  );
}

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
    '<span>Data: <strong>' +
    findOptionLabel(q.opsi, q.baku) +
    '</strong> — ' +
    esc(q.pembahasan) +
    '</span>' +
    '<span class="dugaan-row__verdict">' +
    (cocok ? '✓ Dugaanmu didukung data!' : '↻ Dugaanmu dikoreksi oleh data') +
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
      ? '<div class="pola-hipotesis">' +
        '<span class="pola-hipotesis__label">Hipotesismu di tahap 2</span>' +
        '<p>' +
        esc(State.hipotesisTeks) +
        '</p>' +
        '<span class="dl-caption">Apakah hipotesismu didukung data, perlu diperbaiki, atau ditolak? Diskusikan dengan pasanganmu.</span>' +
        '</div>'
      : '')
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var aOk = sortItemsAllAnswered(SUSUNAN_ITEMS, State.susunanStates);
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
        buildSortItems(SUSUNAN_ITEMS, State.susunanOrder, D.kategori, State.susunanStates, {
          visual: visualSusunan,
        })
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

  bindSortItems(container, SUSUNAN_ITEMS, State.susunanStates, saveState, rerender);
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali jembatan selisih dari ketiga susunan, lalu pilih potongan lain.</p>'
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
          '<h3 style="margin-top:0;">Rangkuman Pola Susunan Benda</h3>' +
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
   dipilih acak. Isian diperiksa periksaSoalPola sehingga pesan
   salahnya berupa diagnosa miskonsepsi; pilihan ganda memakai
   opsiSoalPola yang setiap pengecohnya membawa umpan diagnosa.
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
  inputPlaceholder: 'mis. 25',
  inputMode: 'numeric',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  inputSuffix: function (s) {
    return s.satuan ? '<span class="bbk-satuan">' + esc(s.satuan) + '</span>' : '';
  },
  /* Teks mentah diteruskan; isian yang tak terbaca ditolak tanpa dihitung. */
  parseInput: function (val) {
    if (!val || !String(val).trim()) return { value: null, error: 'empty' };
    var d = periksaSoalPola(val, TERAP_SOAL[State.terapkanIdx]);
    if (d.kode === 'format') {
      return { value: null, error: 'invalid', message: d.pesan };
    }
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return periksaSoalPola(value, s).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' + esc(ex.userInput) + '</strong> — ' + esc(periksaSoalPola(ex.userInput, s).pesan)
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
      (s.jenis && s.cek.minta !== 'tambahan'
        ? buildDeretSusunan(s.jenis, 3, { tanya: true })
        : '') +
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
  var catat = [];
  DATA.koleksi.lab.jenisList.forEach(function (j) {
    catat = catat.concat(State.labSusun.catat[j]);
  });
  var langkah = [];
  OLAH_STAGES.forEach(function (id) {
    langkah = langkah.concat(State.langkahSteps[id]);
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
      sortItemsCorrectCount(SUSUNAN_ITEMS, State.susunanStates) +
      sortItemsCorrectCount(PERNYATAAN_ITEMS, State.pernyataanStates) +
      '/' +
      (SUSUNAN_ITEMS.length + PERNYATAAN_ITEMS.length),
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
        buildRingkasKartu(R.catat, 'Catatan Lab Susun tepat pada percobaan pertama') +
        buildRingkasKartu(R.langkah, 'Prediksi tahap berikutnya tepat pada percobaan pertama') +
        buildRingkasKartu(R.pilah, 'Pemilahan susunan & pernyataan benar') +
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

function buildContohPola(c) {
  var P = POLA_BENDA[c.jenis];
  return (
    '<div class="formula-card pola-contoh">' +
    '<span class="formula-card__label">' +
    esc(P.nama) +
    '</span>' +
    buildSusunanPola(c.jenis, 3) +
    '<strong class="pola-contoh__barisan">' +
    barisanPola(c.jenis, 4).map(formatNumber).join(', ') +
    ', …</strong>' +
    '<span>' +
    esc(c.keterangan) +
    '</span>' +
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
    '<div class="pola-contoh-grid">' +
    D.contoh.map(buildContohPola).join('') +
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
    'Kemampuan murid mendeskripsikan keteraturan pola dengan kata-kata (banyak benda tahap 1 dan aturan tambahannya) serta menjelaskan mengapa tambahannya demikian tetap menjadi bahan penilaian utama.' +
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
  olahKorek: renderOlahKorek,
  olahUbin: renderOlahUbin,
  olahKursi: renderOlahKursi,
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
