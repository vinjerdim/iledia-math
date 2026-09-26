'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Masalah Kontekstual Bilangan Berpangkat Bulat
   Fase E (Kelas X) — SMK Rekayasa Perangkat Lunak

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox, formatNumber,
   formatRupiah, parseInputInt, createStageMachine, createExerciseStage,
   createStore, ensureExerciseArray, optionIds, komponen umum
   (ensureShuffledOrder, buildDiscoveryHead, buildTeacherNote,
   buildTpPanel, buildChoiceGroup, buildDlPanel, buildDlNextButton,
   findOptionLabel, ensureSortStates, buildSortItems, bindSortItems,
   sortItemsAllAnswered, sortItemsCorrectCount, ensureTapOrderState,
   buildTapOrder, bindTapOrder, buildGuidedQuizList, bindGuidedQuizList,
   guidedQuizAllCorrect, buildGuidedChoiceFeedback), bilangan berpangkat
   bagian 27 (formatPangkat, formatPecahan), langkah & rantai sifat
   bagian 44 (opsiSifatPangkat, makeSifatStepState, buildSifatStep,
   bindSifatStep, sifatStepSkor, teksRantai, langkahRantai, hasilRantai,
   langkahRantaiAktif, rantaiSelesai), papan proposal bagian 48
   (buildLpProposal), serta masalah kontekstual berpangkat bagian 49
   (formatUkuranBiner, diagnosaNilaiPangkat, bandingPaketPangkat,
   paketTerhemat, buildBandingPaketPangkat, buildSuratCard).

   Alur tahap mengikuti sintaks Problem Based Learning; lihat komentar
   kepala pada data.js untuk pemetaan dan rangkaian aktivitasnya.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI saat
   state disiapkan (initExerciseArrays), lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat-lompat
   ketika tahap dirender ulang, tetapi teracak ulang setiap Reset.

   Bagian:
    1. Konstanta & hitungan kunci
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi Masalah       (PBL sintaks 1)
    6. Stage: Organisasi              (PBL sintaks 2)
    7. Kartu penyelidikan (rantai sifat)
    8. Stage: Penyelidikan Ukuran     (PBL sintaks 3)
    9. Stage: Penyelidikan Kapasitas  (PBL sintaks 3)
   10. Stage: Penyelidikan Waktu      (PBL sintaks 3)
   11. Stage: Menyajikan Karya        (PBL sintaks 4)
   12. Stage: Analisis & Evaluasi     (PBL sintaks 5)
   13. Stage: Uji Terap
   14. Stage: Refleksi
   15. Stage: Selesai
   16. Router Render
   17. Helper UI (modal reset)
   18. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA & HITUNGAN KUNCI
   ============================================================ */

var STAGES = [
  'orientasi',
  'organisasi',
  'selidikUkuran',
  'selidikKapasitas',
  'selidikWaktu',
  'karya',
  'evaluasi',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Masalah',
  'Organisasi',
  'Ukuran',
  'Kapasitas',
  'Waktu',
  'Karya',
  'Evaluasi',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];

var STORAGE_KEY = 'mpi-e-1-3-masalah-pangkat-v1';

var F = DATA.fakta;

/* Tiga tahap penyelidikan memakai kartu rantai sifat. */
var SELIDIK = ['selidikUkuran', 'selidikKapasitas', 'selidikWaktu'];

/* Semua kartu penyelidikan (id unik lintas tahap) → langkah sifatnya. */
var KARTU_LANGKAH = {};
SELIDIK.forEach(function (key) {
  DATA[key].kartu.forEach(function (c) {
    KARTU_LANGKAH[c.id] = langkahRantai(c.rantai);
  });
});

var OPSI_PAKET = {
  a: 2,
  kPerPeriode: F.kPerTahun,
  minimal: F.minimalTahun,
  satuanPeriode: 'tahun',
};
var PAKET_ROWS = bandingPaketPangkat(DATA.paket, OPSI_PAKET);
var PAKET_PILIH = paketTerhemat(PAKET_ROWS);

function pangkat2(k) {
  return formatPangkat(2, k);
}

function itemPilah(list) {
  return list.map(function (it) {
    return {
      id: it.id,
      correct: it.correct,
      explanation: esc(it.explanation),
      teks: esc(it.teks),
    };
  });
}

var PILAH_ITEMS = itemPilah(DATA.organisasi.pilah);
var LANGKAH_ITEMS = itemPilah(DATA.evaluasi.langkah);
var RENCANA_ITEMS = DATA.organisasi.rencana.map(function (r) {
  return { id: r.id, label: r.label };
});
var RENCANA_JAWAB = optionIds(DATA.organisasi.rencana);

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

  /* Tahap 3–5 — kartu rantai sifat: { idKartu: [state langkah] } */
  rantai: {},
  ukuranOrders: {},
  ukuranPilih: {},
  kapasitasOrders: {},
  kapasitasPilih: {},
  waktuOrders: {},
  waktuPilih: {},

  /* Tahap 6 — karya */
  karyaOrders: {},
  karyaPilih: {},
  presentasi: '',

  /* Tahap 7 — evaluasi */
  langkahStates: {},
  langkahOrder: null,
  evalOrders: {},
  evalPilih: {},
  evalRefleksi: '',

  /* Tahap 8 — uji terap */
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

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function ensureObject(key) {
  if (!isPlainObject(State[key])) State[key] = {};
}

/* Urutan acak opsi untuk setiap pertanyaan dalam `list`. */
function ensureGuidedOrders(orderKey, pilihKey, list) {
  ensureObject(orderKey);
  ensureObject(pilihKey);
  list.forEach(function (q) {
    ensureShuffledOrder(State[orderKey], q.id, q.opsi);
  });
}

/* State satu langkah sifat + urutan acak pilihan sifatnya. */
function ensureStepIn(arr, i) {
  var st = arr[i];
  if (!isPlainObject(st)) {
    st = makeSifatStepState();
    arr[i] = st;
  }
  var dasar = makeSifatStepState();
  Object.keys(dasar).forEach(function (k) {
    if (st[k] === undefined) st[k] = dasar[k];
  });
  ensureShuffledOrder(st, 'sifatOrder', opsiSifatPangkat());
}

function ensureRantaiStates() {
  ensureObject('rantai');
  Object.keys(KARTU_LANGKAH).forEach(function (id) {
    var L = KARTU_LANGKAH[id];
    if (!Array.isArray(State.rantai[id]) || State.rantai[id].length !== L.length) {
      State.rantai[id] = [];
    }
    L.forEach(function (s, i) {
      ensureStepIn(State.rantai[id], i);
    });
  });
}

/*
 * Menyiapkan seluruh state per-soal DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1 */
  ensureGuidedOrders('dugaanOrders', 'dugaanPilih', DATA.orientasi.dugaan);
  ensureShuffledOrder(State, 'masalahOrder', DATA.orientasi.masalahOpsi);

  /* Tahap 2 */
  ensureShuffledOrder(State, 'peranOrder', DATA.organisasi.peran);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.organisasi.opsiPilah);
  ensureTapOrderState(State, 'rencanaState', RENCANA_ITEMS, RENCANA_JAWAB);

  /* Tahap 3–5 */
  ensureRantaiStates();
  ensureGuidedOrders('ukuranOrders', 'ukuranPilih', DATA.selidikUkuran.tanya);
  ensureGuidedOrders('kapasitasOrders', 'kapasitasPilih', DATA.selidikKapasitas.tanya);
  ensureGuidedOrders('waktuOrders', 'waktuPilih', DATA.selidikWaktu.tanya);

  /* Tahap 6 */
  ensureGuidedOrders('karyaOrders', 'karyaPilih', DATA.karya.tanya);

  /* Tahap 7 */
  ensureSortStates(State, 'langkahStates', 'langkahOrder', LANGKAH_ITEMS, DATA.evaluasi.opsiNilai);
  ensureGuidedOrders('evalOrders', 'evalPilih', DATA.evaluasi.tanya);

  /* Tahap 8 — uji terap (dirender createExerciseStage) */
  ensureExerciseArray(State, 'terapkanExercises', DATA.terapkan.soal, function (q) {
    return {
      attempts: 0,
      hintLevel: 0,
      hintShown: false,
      correct: false,
      userInput: '',
      revealed: false,
      chosen: null,
      checked: false,
      optionOrder: q.options ? shuffleArray(optionIds(q.options)) : null,
    };
  });
  if (State.terapkanIdx >= DATA.terapkan.soal.length || State.terapkanIdx < 0) {
    State.terapkanIdx = 0;
  }

  /* Tahap 9 */
  ensureShuffledOrder(State, 'refleksiDiriOrder', DATA.refleksi.diriOpsi);
  ensureObject('refleksiAnswers');
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

function panelJudul(judul, inner, cls) {
  return buildDlPanel('<h3 style="margin-top:0;">' + esc(judul) + '</h3>' + inner, cls);
}

function caption(teks) {
  return '<p class="dl-caption">' + esc(teks) + '</p>';
}

function paragrafInfo(teks) {
  return buildDlPanel('<p style="margin:0;">' + esc(teks) + '</p>', 'panel--info');
}

function daftarTemuan(teks) {
  return (
    '<div style="margin-top:var(--space-4);">' + buildFeedbackBox('success', '🔎', teks) + '</div>'
  );
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

/* Memasang textarea yang menyimpan isinya ke State[key]. */
function bindTextarea(id, key) {
  var ta = document.getElementById(id);
  if (!ta) return;
  ta.addEventListener('input', function () {
    State[key] = ta.value;
    saveState();
  });
}

/* Umpan pertanyaan penuntun di-escape sekali (teks polos di DATA). */
function tanyaAman(list) {
  return list.map(function (q) {
    var umpan = {};
    Object.keys(q.umpan).forEach(function (k) {
      umpan[k] = esc(q.umpan[k]);
    });
    return {
      id: q.id,
      tanya: esc(q.tanya),
      opsi: q.opsi.map(function (o) {
        return { id: o.id, label: esc(o.label) };
      }),
      correct: q.correct,
      umpan: umpan,
    };
  });
}

var TANYA = {
  selidikUkuran: tanyaAman(DATA.selidikUkuran.tanya),
  selidikKapasitas: tanyaAman(DATA.selidikKapasitas.tanya),
  selidikWaktu: tanyaAman(DATA.selidikWaktu.tanya),
  karya: tanyaAman(DATA.karya.tanya),
  evaluasi: tanyaAman(DATA.evaluasi.tanya),
};

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
  var masalahOpsi = D.masalahOpsi.map(function (o) {
    return { id: o.id, label: esc(o.label) };
  });

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
    '<section aria-label="Orientasi Masalah">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🖼️ ' +
        esc(D.judul) +
        '</h2>' +
        '<p class="orientasi-cerita">' +
        esc(D.pengantar) +
        '</p>' +
        '<h3 class="surat-head">' +
        esc(D.tiketJudul) +
        '</h3>' +
        '<div class="surat-grid">' +
        D.surat.map(buildSuratCard).join('') +
        '</div>' +
        '<p class="satuan-biner"><strong>' +
        esc(D.satuanJudul) +
        ':</strong> ' +
        esc(D.satuan) +
        '</p>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaan tim kalian?</h3>' +
        caption(D.catatanDugaan) +
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
            buildChoiceGroup(masalahOpsi, State.masalahOrder, {
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
      var f = container.querySelector(
        '[data-group="' + btn.dataset.group + '"][data-dugaan="' + btn.dataset.dugaan + '"]'
      );
      if (f) f.focus();
    });
  });

  container.querySelectorAll('[data-masalah]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.masalahPilihan === D.masalahCorrect) return;
      State.masalahPilihan = btn.dataset.masalah;
      saveState();
      renderOrientasi(container);
      var f = container.querySelector('[data-masalah="' + btn.dataset.masalah + '"]');
      if (f) f.focus();
    });
  });

  bindTextarea('orientasiAlasan', 'orientasiAlasan');
  bindTextarea('masalahHipotesis', 'masalahHipotesis');

  var nextBtn = document.getElementById('orientasiNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.masalahHipotesis.trim()) {
        showNotice('Tulis hipotesis tim kalian lebih dulu, walau hanya satu kalimat.');
        return;
      }
      completeStage('orientasi');
      navigateTo('organisasi');
    });
  }
}

/* ============================================================
   6. STAGE: ORGANISASI  (PBL — sintaks 2)
   Pilih peran → pilah informasi → susun rencana penyelesaian.
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
        buildChoiceGroup(D.peran, State.peranOrder, {
          chosen: State.peranPilih,
          attr: 'data-peran',
        }) +
        (peranOk
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              'info',
              '🙌',
              'Peranmu: ' +
                findOptionLabel(D.peran, State.peranPilih) +
                ' Tukar peran pada pertemuan berikutnya.'
            ) +
            '</div>'
          : '')
    ) +
    (peranOk
      ? panelJudul(
          '🗂️ ' + D.judulPilah,
          buildSortItems(PILAH_ITEMS, State.pilahOrder, D.opsiPilah, State.pilahStates) +
            (pilahOk
              ? daftarTemuan(
                  '<strong>' +
                    sortItemsCorrectCount(PILAH_ITEMS, State.pilahStates) +
                    ' dari ' +
                    PILAH_ITEMS.length +
                    '</strong> informasi kamu pilah dengan tepat.'
                )
              : '')
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
              successText: D.rencanaSukses,
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
      var f = container.querySelector('[data-peran="' + btn.dataset.peran + '"]');
      if (f) f.focus();
    });
  });
  if (peranOk) bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  if (peranOk && pilahOk) {
    bindTapOrder(container, 'rencana', State.rencanaState, RENCANA_JAWAB, saveState, rerender);
  }
  bindNext('organisasiNextBtn', 'organisasi', 'selidikUkuran');
}

/* ============================================================
   7. KARTU PENYELIDIKAN (RANTAI SIFAT)
   Setiap kartu = cerita + rantai sifat (engine seksi 44). Langkah
   berikutnya terbuka setelah langkah sebelumnya tuntas; kartu
   berikutnya terbuka setelah kartu sebelumnya tuntas.
   ============================================================ */

function kartuSelesai(c) {
  return rantaiSelesai(KARTU_LANGKAH[c.id], State.rantai[c.id]);
}

function semuaKartuSelesai(list) {
  return list.every(kartuSelesai);
}

function stepId(c, i) {
  return 'rk-' + c.id + '-' + i;
}

function buildKartuRantai(c) {
  var L = KARTU_LANGKAH[c.id];
  var states = State.rantai[c.id];
  var aktif = langkahRantaiAktif(L, states);
  var selesai = aktif === L.length;
  var hasil = hasilRantai(c.rantai);

  var langkahHTML = L.slice(0, Math.min(aktif + 1, L.length))
    .map(function (s, i) {
      return buildSifatStep(stepId(c, i), s, states[i], {
        nomor: L.length > 1 ? i + 1 : null,
        label: L.length > 1 ? 'Langkah ' + (i + 1) : '',
      });
    })
    .join('');

  return buildDlPanel(
    '<div class="kartu-selidik__head">' +
      '<span class="kartu-selidik__ikon" aria-hidden="true">' +
      c.ikon +
      '</span>' +
      '<h3 class="kartu-selidik__judul">' +
      esc(c.judul) +
      '</h3>' +
      '</div>' +
      '<p class="kartu-selidik__cerita">' +
      esc(c.cerita) +
      '</p>' +
      '<p class="exercise-label">' +
      esc(c.tanya) +
      '</p>' +
      '<p class="rantai-soal">' +
      esc(teksRantai(c.rantai)) +
      '</p>' +
      langkahHTML +
      (selesai
        ? buildFeedbackBox(
            'success',
            '✓',
            '<strong>' +
              esc(c.judul) +
              ':</strong> ' +
              esc(teksRantai(c.rantai)) +
              ' = ' +
              esc(hasil.teks) +
              (c.rantai.nilai
                ? ' = ' +
                  esc(formatPecahan(hasil.nilai)) +
                  (c.rantai.satuan ? ' ' + esc(c.rantai.satuan) : '')
                : ' byte')
          )
        : ''),
    'kartu-selidik' + (selesai ? ' kartu-selidik--done' : '')
  );
}

/* Kartu tampil berurutan: kartu ke-i terbuka setelah kartu i−1 tuntas. */
function kartuTerbuka(list) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    out.push(list[i]);
    if (!kartuSelesai(list[i])) break;
  }
  return out;
}

function bindKartuRantai(container, list, rerender) {
  list.forEach(function (c) {
    KARTU_LANGKAH[c.id].forEach(function (s, i) {
      bindSifatStep(container, stepId(c, i), s, State.rantai[c.id][i], saveState, rerender);
    });
  });
}

/*
 * Tahap penyelidikan generik: instruksi → kartu berurutan → (ekstra
 * setelah semua kartu tuntas) → pertanyaan penuntun → tombol lanjut.
 *   cfg = { key, next, pilihKey, orderKey, label, ekstra?() }
 */
function renderSelidik(container, cfg) {
  var D = DATA[cfg.key];
  var terbuka = kartuTerbuka(D.kartu);
  var kartuOk = semuaKartuSelesai(D.kartu);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State[cfg.pilihKey]);

  function rerender() {
    renderSelidik(container, cfg);
  }

  var html =
    '<section aria-label="' +
    esc(cfg.label) +
    '">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    terbuka.map(buildKartuRantai).join('');

  if (kartuOk) {
    if (cfg.ekstra) html += cfg.ekstra();
    html += panelJudul(
      '🔎 Apa yang kamu temukan?',
      buildGuidedQuizList(TANYA[cfg.key], State[cfg.orderKey], State[cfg.pilihKey]) +
        (tanyaOk ? daftarTemuan(esc(D.temuan)) : '')
    );
  }

  html +=
    (kartuOk && tanyaOk ? buildDlNextButton(cfg.key + 'NextBtn', D.nextLabel, true) : '') +
    '</section>';

  container.innerHTML = html;

  bindKartuRantai(container, terbuka, rerender);
  bindGuidedQuizList(container, TANYA[cfg.key], State[cfg.pilihKey], saveState, rerender);
  bindNext(cfg.key + 'NextBtn', cfg.key, cfg.next);
}

/* ============================================================
   8. STAGE: PENYELIDIKAN 1 — UKURAN FOTO  (PBL — sintaks 3)
   ============================================================ */

function renderSelidikUkuran(container) {
  renderSelidik(container, {
    key: 'selidikUkuran',
    next: 'selidikKapasitas',
    orderKey: 'ukuranOrders',
    pilihKey: 'ukuranPilih',
    label: 'Penyelidikan Ukuran Foto',
  });
}

/* ============================================================
   9. STAGE: PENYELIDIKAN 2 — KAPASITAS PAKET  (PBL — sintaks 3)
   Tabel banding paket muncul setelah semua kartu tuntas.
   ============================================================ */

function buildTabelPaket(pilih) {
  return buildBandingPaketPangkat(PAKET_ROWS, {
    a: OPSI_PAKET.a,
    kPerPeriode: OPSI_PAKET.kPerPeriode,
    minimal: OPSI_PAKET.minimal,
    satuanPeriode: OPSI_PAKET.satuanPeriode,
    pilih: pilih || null,
  });
}

function renderSelidikKapasitas(container) {
  renderSelidik(container, {
    key: 'selidikKapasitas',
    next: 'selidikWaktu',
    orderKey: 'kapasitasOrders',
    pilihKey: 'kapasitasPilih',
    label: 'Penyelidikan Kapasitas Paket',
    ekstra: function () {
      return panelJudul(DATA.selidikKapasitas.tabelJudul, buildTabelPaket());
    },
  });
}

/* ============================================================
   10. STAGE: PENYELIDIKAN 3 — WAKTU UNGGAH  (PBL — sintaks 3)
   ============================================================ */

function renderSelidikWaktu(container) {
  renderSelidik(container, {
    key: 'selidikWaktu',
    next: 'karya',
    orderKey: 'waktuOrders',
    pilihKey: 'waktuPilih',
    label: 'Penyelidikan Waktu Unggah',
  });
}

/* ============================================================
   11. STAGE: MENYAJIKAN KARYA  (PBL — sintaks 4)
   Keputusan paket → skenario tanpa kompresi → Laporan Rekomendasi.
   ============================================================ */

function buildLaporan() {
  var D = DATA.karya;
  var kMentahTahun = F.kFotoMentah + F.kFotoPerTahun;
  var nimbus = PAKET_ROWS.reduce(function (a, b) {
    return b.harga > a.harga ? b : a;
  });
  var pilihPaket = DATA.paket.filter(function (p) {
    return p.id === PAKET_PILIH.id;
  })[0];
  var detikTahun = Math.pow(2, F.kFotoPerTahun + F.kFoto - F.kUnggah);
  return buildLpProposal({
    judul: D.laporanJudul,
    sub: D.laporanSub,
    keputusan: [
      {
        ikon: '📷',
        judul: 'Ukuran foto',
        isi:
          'Mentah ' +
          pangkat2(F.kLebar) +
          ' × ' +
          pangkat2(F.kTinggi) +
          ' × ' +
          pangkat2(F.kBytePiksel) +
          ' = ' +
          pangkat2(F.kFotoMentah) +
          ' byte (' +
          formatUkuranBiner(F.kFotoMentah) +
          '). Setelah kompresi ' +
          pangkat2(F.kFotoMentah) +
          ' × ' +
          pangkat2(F.kKompresi) +
          ' = ' +
          pangkat2(F.kFoto) +
          ' byte (' +
          formatUkuranBiner(F.kFoto) +
          ').',
      },
      {
        ikon: '🗂️',
        judul: 'Kebutuhan per tahun',
        isi:
          pangkat2(F.kMurid) +
          ' × ' +
          pangkat2(F.kFotoPerMurid) +
          ' = ' +
          pangkat2(F.kFotoPerTahun) +
          ' foto → ' +
          pangkat2(F.kFoto) +
          ' × ' +
          pangkat2(F.kFotoPerTahun) +
          ' = ' +
          pangkat2(F.kPerTahun) +
          ' byte (' +
          formatUkuranBiner(F.kPerTahun) +
          ') per tahun.',
      },
      {
        ikon: pilihPaket.ikon,
        judul: 'Rekomendasi: ' + PAKET_PILIH.nama,
        isi:
          pilihPaket.teks +
          ' = ' +
          pangkat2(PAKET_PILIH.k) +
          ' byte. ' +
          pangkat2(PAKET_PILIH.k) +
          ' : ' +
          pangkat2(F.kPerTahun) +
          ' = ' +
          pangkat2(PAKET_PILIH.kLama) +
          ' = ' +
          formatNumber(PAKET_PILIH.lama) +
          ' tahun (≥ ' +
          F.minimalTahun +
          ' tahun), ' +
          formatRupiah(PAKET_PILIH.harga) +
          ' per bulan — hemat ' +
          formatRupiah(nimbus.harga - PAKET_PILIH.harga) +
          ' per bulan dibanding ' +
          nimbus.nama +
          '.',
      },
      {
        ikon: '📶',
        judul: 'Waktu unggah',
        isi:
          'Satu foto ' +
          pangkat2(F.kFoto) +
          ' : ' +
          pangkat2(F.kUnggah) +
          ' = ' +
          pangkat2(F.kFoto - F.kUnggah) +
          ' = ' +
          formatPecahan(pangkatBulat(2, F.kFoto - F.kUnggah)) +
          ' detik. Satu tahun ' +
          formatNumber(detikTahun) +
          ' detik (± ' +
          Math.round(detikTahun / 60) +
          ' menit), bisa dijadwalkan sepulang sekolah.',
      },
      {
        ikon: '⚠️',
        judul: 'Syarat',
        isi:
          'Kompresi wajib aktif. Tanpa kompresi kebutuhan ' +
          pangkat2(kMentahTahun) +
          ' byte per tahun, sehingga ' +
          PAKET_PILIH.nama +
          ' hanya cukup ' +
          pangkat2(PAKET_PILIH.k) +
          ' : ' +
          pangkat2(kMentahTahun) +
          ' = ' +
          pangkat2(PAKET_PILIH.k - kMentahTahun) +
          ' = ' +
          formatNumber(Math.pow(2, PAKET_PILIH.k - kMentahTahun)) +
          ' tahun.',
      },
    ],
    penutup: D.penutup,
  });
}

function renderKarya(container) {
  var D = DATA.karya;
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.karyaPilih);
  var p1Ok = State.karyaPilih.p1 === 'stratus';

  function rerender() {
    renderKarya(container);
  }

  var html =
    '<section aria-label="Menyajikan Karya">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    panelJudul(DATA.selidikKapasitas.tabelJudul, buildTabelPaket(p1Ok ? PAKET_PILIH.id : null)) +
    panelJudul(
      '🧠 Ambil keputusan tim',
      buildGuidedQuizList(TANYA.karya, State.karyaOrders, State.karyaPilih)
    );

  if (tanyaOk) {
    html +=
      panelJudul('📋 Laporan Rekomendasi', buildLaporan(), 'panel--hero') +
      buildDlPanel(
        buildTextarea(
          'presentasiTeks',
          D.presentasiLabel,
          D.presentasiPlaceholder,
          State.presentasi
        ) + caption('Presentasikan laporan ini kepada klien (guru) atau dalam galeri berjalan.')
      ) +
      buildDlNextButton('karyaNextBtn', D.nextLabel, true);
  }

  html += '</section>';
  container.innerHTML = html;

  bindGuidedQuizList(container, TANYA.karya, State.karyaPilih, saveState, rerender);
  bindTextarea('presentasiTeks', 'presentasi');

  var nextBtn = document.getElementById('karyaNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.presentasi.trim()) {
        showNotice('Tulis kalimat presentasi tim kalian lebih dulu.');
        return;
      }
      completeStage('karya');
      navigateTo('evaluasi');
    });
  }
}

/* ============================================================
   12. STAGE: ANALISIS & EVALUASI  (PBL — sintaks 5)
   Nilai lembar kerja Tim Debug → pelajaran → bandingkan dugaan awal →
   evaluasi proses tim.
   ============================================================ */

function buildTanggapanDugaan() {
  var D = DATA.evaluasi;
  return DATA.orientasi.dugaan
    .map(function (q) {
      var pilih = State.dugaanPilih[q.id];
      if (!pilih || !D.tanggapanDugaan[q.id][pilih]) return '';
      return (
        '<div class="quiz-item">' +
        '<p class="dl-caption">' +
        esc(q.tanya) +
        ' Dugaanmu: “' +
        esc(findOptionLabel(q.opsi, pilih)) +
        '”</p>' +
        buildFeedbackBox('info', '🔁', esc(D.tanggapanDugaan[q.id][pilih])) +
        '</div>'
      );
    })
    .join('');
}

function renderEvaluasi(container) {
  var D = DATA.evaluasi;
  var lembarOk = sortItemsAllAnswered(LANGKAH_ITEMS, State.langkahStates);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.evalPilih);

  function rerender() {
    renderEvaluasi(container);
  }

  var html =
    '<section aria-label="Analisis dan Evaluasi">' +
    buildHead(D) +
    panelJudul(
      D.lembarJudul,
      caption(D.instruksiLembar) +
        buildSortItems(LANGKAH_ITEMS, State.langkahOrder, D.opsiNilai, State.langkahStates, {
          mono: true,
        }) +
        (lembarOk
          ? daftarTemuan(
              '<strong>' +
                sortItemsCorrectCount(LANGKAH_ITEMS, State.langkahStates) +
                ' dari ' +
                LANGKAH_ITEMS.length +
                '</strong> langkah kamu nilai dengan tepat.'
            )
          : '')
    );

  if (lembarOk) {
    html += panelJudul(
      '💡 Tarik pelajaran',
      buildGuidedQuizList(TANYA.evaluasi, State.evalOrders, State.evalPilih)
    );
  }

  if (lembarOk && tanyaOk) {
    html +=
      panelJudul('🔁 ' + D.dugaanJudul, buildTanggapanDugaan()) +
      buildDlPanel(
        buildTextarea('evalRefleksi', D.refleksiLabel, D.refleksiPlaceholder, State.evalRefleksi)
      ) +
      buildDlNextButton('evaluasiNextBtn', D.nextLabel, true);
  }

  html += '</section>';
  container.innerHTML = html;

  bindSortItems(container, LANGKAH_ITEMS, State.langkahStates, saveState, rerender);
  bindGuidedQuizList(container, TANYA.evaluasi, State.evalPilih, saveState, rerender);
  bindTextarea('evalRefleksi', 'evalRefleksi');

  var nextBtn = document.getElementById('evaluasiNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.evalRefleksi.trim()) {
        showNotice('Tulis evaluasi proses tim kalian lebih dulu.');
        return;
      }
      completeStage('evaluasi');
      navigateTo('terapkan');
    });
  }
}

/* ============================================================
   13. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal campuran
   'input' (nilai bulat, boleh berpemisah ribuan; diagnosa miskonsepsi
   dari diagnosaNilaiPangkat) dan 'choice' (opsi diacak lewat
   ex.optionOrder di initExerciseArrays()).
   ============================================================ */

function diagnosaTerapkan(s, ex) {
  var parsed = parseInputInt(ex.userInput, true);
  if (parsed.error) return null;
  var d = diagnosaNilaiPangkat(s.cek, parsed.value);
  return d.kode === 'benar' ? null : d.pesan;
}

function teksJawaban(s) {
  if ((s.type || 'choice') === 'choice') return findOptionLabel(s.options, s.correct);
  return formatNumber(s.jawab) + ' ' + s.satuan;
}

var TerapkanStage = createExerciseStage({
  soal: DATA.terapkan.soal,
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
  stripPunctuation: true,
  checkValue: function (s) {
    return s.jawab;
  },
  inputAriaLabel: 'Jawaban',
  inputPlaceholder: 'Jawaban',
  inputSuffix: function (s) {
    return '<span class="lpp-satuan">' + esc(s.satuan) + '</span>';
  },
  invalidMessage: 'Masukkan sebuah bilangan bulat (contoh: 64 atau 16.384).',
  inputErrorHTML: function (s, ex) {
    var pesan = diagnosaTerapkan(s, ex);
    return buildFeedbackBox(
      'error',
      '✗',
      'Jawaban <strong>' +
        esc(ex.userInput) +
        '</strong> belum tepat. ' +
        esc(pesan || 'Periksa lagi perhitunganmu atau buka petunjuk.')
    );
  },
  revealText: function (s) {
    return 'Jawabannya <strong>' + esc(teksJawaban(s)) + '</strong>. ' + esc(s.explanation);
  },
  renderPrompt: function (s) {
    var pilihan = (s.type || 'choice') === 'choice';
    return (
      '<div class="dl-prompt">' +
      '<span class="konteks-chip">' +
      esc(s.konteks) +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
      '<p class="dl-prompt__tanya">' +
      esc(s.pertanyaan) +
      '</p>' +
      (pilihan && s.hints && s.hints.length
        ? '<details class="lpp-hint"><summary>💡 Petunjuk</summary><ul>' +
          s.hints
            .map(function (h) {
              return '<li>' + esc(h) + '</li>';
            })
            .join('') +
          '</ul></details>'
        : '') +
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

/* Skor percobaan pertama semua langkah sifat pada kartu penyelidikan. */
function skorLangkahSifat() {
  var benar = 0;
  var maks = 0;
  Object.keys(KARTU_LANGKAH).forEach(function (id) {
    KARTU_LANGKAH[id].forEach(function (s, i) {
      var sk = sifatStepSkor(s, State.rantai[id][i]);
      benar += sk.benar;
      maks += sk.maks;
    });
  });
  return { benar: benar, maks: maks };
}

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var semuaKartu = [];
  SELIDIK.forEach(function (key) {
    semuaKartu = semuaKartu.concat(DATA[key].kartu);
  });
  var kartuTuntas = semuaKartu.filter(kartuSelesai).length;
  var skor = skorLangkahSifat();
  var langkahBenar = sortItemsCorrectCount(LANGKAH_ITEMS, State.langkahStates);
  var terapBenar = State.terapkanExercises.filter(function (e) {
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
        kartu(kartuTuntas + '/' + semuaKartu.length, 'Kartu penyelidikan tuntas') +
        kartu(skor.benar + '/' + skor.maks, 'Isian sifat tepat sekali coba') +
        kartu(langkahBenar + '/' + LANGKAH_ITEMS.length, 'Langkah Tim Debug dinilai tepat') +
        kartu(terapBenar + '/' + DATA.terapkan.soal.length, 'Uji terap benar') +
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
      var f = container.querySelector('[data-opt-id="' + btn.dataset.optId + '"]');
      if (f) f.focus();
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
    '<span class="done-card__icon">🚀</span>' +
    '<h2>' +
    esc(D.judul) +
    '</h2>' +
    '<p class="done-card__lead">' +
    esc(D.teks) +
    '</p>' +
    '<div class="sajian-trio">' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">✖️</span>aᵐ × aⁿ = aᵐ⁺ⁿ</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">➗</span>aᵐ : aⁿ = aᵐ⁻ⁿ</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">🔁</span>(aᵐ)ⁿ = aᵐˣⁿ</div>' +
    '<div class="sajian-card sajian-card--utama"><span class="sajian-card__ikon" aria-hidden="true">🔑</span>a⁻ⁿ = 1/aⁿ · a⁰ = 1</div>' +
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
    'Laporan Rekomendasi, kalimat presentasi, dan evaluasi proses tim menjadi bahan asesmen kinerja penyelesaian masalah.' +
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
  organisasi: renderOrganisasi,
  selidikUkuran: renderSelidikUkuran,
  selidikKapasitas: renderSelidikKapasitas,
  selidikWaktu: renderSelidikWaktu,
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
