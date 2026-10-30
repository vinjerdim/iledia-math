'use strict';

/* ============================================================
   app.js — Logika media pembelajaran
   Unsur-unsur Lingkaran pada Benda & Gambar di Sekitar
   Fase D — SMP Kelas VIII · Topik 17 Lingkaran, Discovery Learning

   Struktur:
     1. Konstanta
     2. State & storage (+ pengacakan semua pilihan jawaban)
     3. Navigasi
     4. Utilitas render
     5–13. Renderer tiap tahap
     14. Router render
     15. Modal reset
     16. Init

   Seluruh komponen umum berasal dari shared/engine.js: Lab Lingkaran,
   gambar lingkaran bernomor, tabel pengamatan, jenis unsur dari
   geometri, opsi & diagnosa penamaan, soal jari-jari ↔ diameter
   (seksi 84), serta pilihan acak, pertanyaan penuntun, pemilahan,
   dan petunjuk berjenjang.

   Seluruh pilihan jawaban DIACAK sekali saat state disiapkan
   (initExerciseArrays) lalu urutannya disimpan di State, sehingga
   stabil saat dirender ulang tetapi teracak ulang setiap Reset.
   Benda verifikasi dan soal uji terap juga diambil acak.
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'koleksi',
  'olahRuas',
  'olahDaerah',
  'verifikasi',
  'generalisasi',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Stimulasi',
  'Masalah',
  'Lab',
  'Ruas Garis',
  'Daerah',
  'Pembuktian',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-17-1-unsur-lingkaran-v1';
var OLAH_STAGES = ['olahRuas', 'olahDaerah'];
var LAB = DATA.koleksi.lab;

/* Soal uji terap terpilih (diisi dari State.terapkanPick). */
var TERAP_SOAL = [];

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'stimulasi',
  completedStages: {},

  /* Tahap 1 — stimulasi (dugaan, tidak dinilai) */
  dugaanOrders: {},
  dugaanPilih: {},

  /* Tahap 2 — identifikasi masalah */
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',

  /* Tahap 3 — Lab Lingkaran */
  lab: null,

  /* Tahap 4a–b — pertanyaan penuntun & pemilahan */
  olahOrders: {},
  olahPilih: {},
  pilah: {},

  /* Tahap 5 — pembuktian */
  verifBenda: null,
  verifJawab: {},
  verifOrders: {},
  pernyataanStates: {},
  pernyataanOrder: null,

  /* Tahap 6 — menarik kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 7 — uji terap */
  terapkanPick: null,
  terapkanIdx: 0,
  terapkanSoal: [],

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

function isObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function ensureObject(target, key) {
  if (!isObject(target[key])) target[key] = {};
}

/* Memulihkan state Lab Lingkaran dari storage. */
function ensureLabState() {
  var awal = makeLabLingkaranState();
  if (!isObject(State.lab)) State.lab = awal;
  var st = State.lab;
  Object.keys(awal).forEach(function (k) {
    if (typeof st[k] !== typeof awal[k] || Array.isArray(st[k]) !== Array.isArray(awal[k])) {
      st[k] = awal[k];
    }
  });
  ensureObject(st, 'catatan');
}

/* Kunci jawaban (id unsur) sebuah soal uji terap. */
function kunciSoal(s) {
  if (s.tipe === 'gambar') {
    return jenisUnsurLingkaran(
      s.elemen.filter(function (e) {
        return e.sorot;
      })[0]
    );
  }
  if (s.tipe === 'nama') return s.kunci;
  return s.correct;
}

/* Opsi pilihan sebuah soal; null untuk soal isian. */
function opsiSoal(s) {
  if (s.tipe === 'gambar' || s.tipe === 'nama') return opsiUnsurLingkaran(kunciSoal(s));
  return s.opsi || null;
}

function makeSoalState() {
  return {
    chosen: null,
    pilihSalah: 0,
    optionOrder: null,
    hintLevel: 0,
    input: '',
    tepat: false,
    revealed: false,
    attempts: 0,
    salah: null,
  };
}

/* Soal uji terap diambil acak per tipe sesuai komposisi, lalu diacak. */
function pilihSoalTerap() {
  var T = DATA.terapkan;
  var pilih = [];
  Object.keys(T.komposisi).forEach(function (tipe) {
    shuffleArray(
      T.soal.filter(function (s) {
        return s.tipe === tipe;
      })
    )
      .slice(0, T.komposisi[tipe])
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

function bendaVerif() {
  return DATA.verifikasi.bank.filter(function (b) {
    return b.id === State.verifBenda;
  })[0];
}

/*
 * Menyiapkan seluruh state per-soal DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset, sehingga urutan stabil lintas reload tetapi
 * teracak ulang setiap Reset.
 */
function initExerciseArrays() {
  [
    'dugaanOrders',
    'dugaanPilih',
    'olahOrders',
    'olahPilih',
    'pilah',
    'verifJawab',
    'verifOrders',
    'simpulanPilihan',
    'refleksiAnswers',
  ].forEach(function (k) {
    ensureObject(State, k);
  });

  /* Tahap 1–2 */
  DATA.stimulasi.dugaan.forEach(function (q) {
    ensureShuffledOrder(State.dugaanOrders, q.id, q.opsi);
  });
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  ensureLabState();

  /* Tahap 4a–b */
  OLAH_STAGES.forEach(function (id) {
    var O = DATA[id];
    O.pertanyaan.forEach(function (q) {
      ensureShuffledOrder(State.olahOrders, q.id, q.opsi);
    });
    ensureSortStates(State.pilah, id, id + 'Order', O.pilah, O.kategori);
  });

  /* Tahap 5 — benda baru dipilih acak; opsi tiap bagian diacak */
  if (!bendaVerif()) {
    State.verifBenda = shuffleArray(optionIds(DATA.verifikasi.bank))[0];
    State.verifJawab = {};
    State.verifOrders = {};
  }
  bendaVerif().bagian.forEach(function (g) {
    ensureShuffledOrder(State.verifOrders, g.id, opsiUnsurLingkaran(jenisUnsurLingkaran(g.el)));
    if (!isObject(State.verifJawab[g.id])) {
      State.verifJawab[g.id] = { chosen: null, pilihSalah: 0 };
    }
  });
  ensureSortStates(
    State,
    'pernyataanStates',
    'pernyataanOrder',
    DATA.verifikasi.pernyataan,
    DATA.verifikasi.opsiPernyataan
  );

  /* Tahap 6 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);

  /* Tahap 7 — soal dipilih acak dari bank; opsi tiap soal diacak */
  if (!terapPickValid()) {
    State.terapkanPick = pilihSoalTerap();
    State.terapkanSoal = [];
    State.terapkanIdx = 0;
  }
  isiTerapSoal();
  ensureExerciseArray(State, 'terapkanSoal', TERAP_SOAL, makeSoalState);
  TERAP_SOAL.forEach(function (s, i) {
    var st = State.terapkanSoal[i];
    var awal = makeSoalState();
    Object.keys(awal).forEach(function (k) {
      if (st[k] === undefined) st[k] = awal[k];
    });
    var opsi = opsiSoal(s);
    if (opsi) ensureShuffledOrder(st, 'optionOrder', opsi);
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

/* Pertanyaan penuntun bertahap: berikutnya muncul setelah sebelumnya benar. */
function guidedVisible(list, pilih) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    out.push(list[i]);
    if (pilih[list[i].id] !== list[i].correct) break;
  }
  return out;
}

function buildIstilahGrid(list) {
  return (
    '<div class="formula-duo ul-istilah">' +
    list
      .map(function (r) {
        return (
          '<div class="formula-card"><span class="formula-card__label">' +
          esc(r.label) +
          '</span>' +
          esc(r.teks) +
          '</div>'
        );
      })
      .join('') +
    '</div>'
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
    esc(value) +
    '</textarea>' +
    '</div>'
  );
}

function bindTextarea(id, key) {
  var ta = document.getElementById(id);
  if (!ta) return;
  ta.addEventListener('input', function () {
    State[key] = ta.value;
    saveState();
  });
}

/* Gambar kecil satu unsur yang disorot (kartu pemilahan). */
function gambarSorot(el, caption) {
  var e = Object.assign({ sorot: true }, el);
  return buildGambarLingkaran([e], { kecil: true, caption: caption });
}

/*
 * Mengembalikan fokus keyboard ke kontrol yang setara setelah render
 * ulang (tombol lab, pilihan bagian, nomor soal), agar pengguna
 * keyboard tidak terlempar ke awal halaman.
 */
var FOKUS_ATTR = [
  'data-lkr-mode',
  'data-lkr-ujung',
  'data-lkr-batas',
  'data-lkr-ubah',
  'data-vb-opt',
  'data-soal-idx',
];

function kunciFokus() {
  var el = document.activeElement;
  if (!el || el === document.body) return null;
  if (el.id) return '#' + el.id;
  for (var i = 0; i < FOKUS_ATTR.length; i++) {
    var a = FOKUS_ATTR[i];
    if (el.hasAttribute(a)) {
      var sel = '[' + a + '="' + el.getAttribute(a) + '"]';
      if (el.dataset.step) sel += '[data-step="' + el.dataset.step + '"]';
      if (el.dataset.group) sel += '[data-group="' + el.dataset.group + '"]';
      return sel;
    }
  }
  return null;
}

function pulihkanFokus(kunci) {
  if (!kunci) return;
  var el = document.querySelector(kunci);
  if (el && !el.disabled) el.focus();
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   ============================================================ */

function dugaanTerisi() {
  return DATA.stimulasi.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function renderStimulasi(container) {
  var D = DATA.stimulasi;

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">📌 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="ul-kartu-grid">' +
        D.kartu
          .map(function (k) {
            return (
              '<div class="ul-kartu"><span class="ul-kartu__ikon" aria-hidden="true">' +
              k.ikon +
              '</span><h3 class="ul-kartu__judul">' +
              esc(k.judul) +
              '</h3><p class="ul-kartu__teks">' +
              esc(k.teks) +
              '</p></div>'
            );
          })
          .join('') +
        '</div>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">Dugaanku</h3>' +
        D.dugaan
          .map(function (q, i) {
            return (
              '<div class="quiz-item">' +
              '<p class="exercise-label"><span class="dl-step__num">' +
              (i + 1) +
              '</span>' +
              esc(q.tanya) +
              '</p>' +
              buildChoiceGroup(
                q.opsi.map(function (o) {
                  return { id: o.id, label: esc(o.label) };
                }),
                State.dugaanOrders[q.id],
                { chosen: State.dugaanPilih[q.id] || null, group: q.id, attr: 'data-dugaan-opt' }
              ) +
              '</div>'
            );
          })
          .join('') +
        buildFeedbackBox('info', '🔎', esc(D.catatan))
    ) +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="stimulasiNextBtn"' +
    (dugaanTerisi() ? '' : ' disabled') +
    '>' +
    esc(D.nextLabel) +
    '</button>' +
    '</div>' +
    '</section>';

  container.querySelectorAll('[data-dugaan-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.dugaanPilih[btn.dataset.group] = btn.dataset.dugaanOpt;
      saveState();
      var kunci = kunciFokus();
      renderStimulasi(container);
      pulihkanFokus(kunci);
    });
  });

  bindNext('stimulasiNextBtn', 'stimulasi', 'masalah');
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
          buildTextarea(
            'masalahHipotesis',
            D.hipotesisLabel,
            D.hipotesisPlaceholder,
            State.masalahHipotesis
          )
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

  bindTextarea('masalahHipotesis', 'masalahHipotesis');

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
   7. STAGE: PENGUMPULAN DATA — LAB LINGKARAN  (sintaks 3)
   ============================================================ */

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var selesai = labLingkaranSelesai(State.lab, LAB);

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judul) +
        '</h3><p style="margin:0;">' +
        esc(D.instruksi) +
        '</p>',
      'panel--info'
    ) +
    buildDlPanel(buildLabLingkaran('labLkr', State.lab, LAB)) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.tabelJudul) +
        '</h3>' +
        buildTabelPengamatanLkr(State.lab, LAB) +
        (selesai
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox('success', '💡', esc(D.temuan)) +
            '</div>'
          : '')
    ) +
    (selesai ? buildDlNextButton('koleksiNextBtn', D.nextLabel) : '') +
    '</section>';

  bindLabLingkaran(container, 'labLkr', State.lab, LAB, function () {
    var kunci = kunciFokus();
    saveState();
    renderKoleksi(container);
    pulihkanFokus(kunci);
  });
  bindNext('koleksiNextBtn', 'koleksi', 'olahRuas');
}

/* ============================================================
   8. STAGE: OLAH DATA — RUAS GARIS & DAERAH  (sintaks 4)
   Tabel pengamatan → pertanyaan penuntun → temuan → pemilahan.
   ============================================================ */

function renderOlah(container, stageId, nextStageId) {
  var D = DATA[stageId];
  var quizBenar = guidedQuizAllCorrect(D.pertanyaan, State.olahPilih);
  var semuaPilah = quizBenar && sortItemsAllAnswered(D.pilah, State.pilah[stageId]);
  var rerender = function () {
    renderOlah(container, stageId, nextStageId);
  };

  container.innerHTML =
    '<section aria-label="Olah Data">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.instruksi) +
        '</p>' +
        buildTabelPengamatanLkr(State.lab, LAB)
    ) +
    buildDlPanel(
      buildGuidedQuizList(
        guidedVisible(D.pertanyaan, State.olahPilih),
        State.olahOrders,
        State.olahPilih
      )
    ) +
    (quizBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Yang kamu temukan</h3>' + buildIstilahGrid(D.temuan),
          'panel--hero'
        ) +
        buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.pilahJudul) +
            '</h3><p>' +
            esc(D.pilahInstruksi) +
            '</p>' +
            buildSortItems(
              D.pilah,
              State.pilah[stageId + 'Order'],
              D.kategori,
              State.pilah[stageId],
              {
                visual: function (it) {
                  return gambarSorot(it.el, it.teks);
                },
              }
            )
        )
      : '') +
    (semuaPilah ? buildDlNextButton(stageId + 'NextBtn', D.nextLabel) : '') +
    '</section>';

  bindGuidedQuizList(container, D.pertanyaan, State.olahPilih, saveState, rerender);
  bindSortItems(container, D.pilah, State.pilah[stageId], saveState, rerender);
  bindNext(stageId + 'NextBtn', stageId, nextStageId);
}

function renderOlahRuas(container) {
  renderOlah(container, 'olahRuas', 'olahDaerah');
}

function renderOlahDaerah(container) {
  renderOlah(container, 'olahDaerah', 'verifikasi');
}

/* ============================================================
   9. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A: benda baru acak. B: dugaan awal. C: pernyataan benar/salah.
   ============================================================ */

function bagianBenar(g) {
  return State.verifJawab[g.id].chosen === jenisUnsurLingkaran(g.el);
}

function bendaSelesai(b) {
  return b.bagian.every(bagianBenar);
}

function buildBagian(g) {
  var kunci = jenisUnsurLingkaran(g.el);
  var st = State.verifJawab[g.id];
  var benar = st.chosen === kunci;
  var umpan = st.chosen
    ? buildFeedbackBox(
        benar ? 'success' : 'warning',
        benar ? '✓' : '💭',
        esc(pesanUnsurLingkaran(diagnosaUnsurLingkaran(kunci, st.chosen), kunci, st.chosen))
      )
    : '';
  return (
    '<div class="quiz-item">' +
    '<p class="exercise-label"><span class="dl-step__num">' +
    esc(g.tag) +
    '</span>' +
    esc(g.teks) +
    '</p>' +
    buildChoiceGroup(opsiUnsurLingkaran(kunci), State.verifOrders[g.id], {
      chosen: st.chosen,
      correctId: benar ? kunci : null,
      grade: true,
      locked: benar,
      group: g.id,
      attr: 'data-vb-opt',
    }) +
    (umpan ? '<div style="margin-top:var(--space-2);">' + umpan + '</div>' : '') +
    '</div>'
  );
}

function buildDugaanBanding() {
  return (
    '<div class="dugaan-compare">' +
    DATA.stimulasi.dugaan
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
          '<span>Hasil penemuan: <strong>' +
          esc(findOptionLabel(q.opsi, q.baku)) +
          '</strong></span>' +
          '<span>' +
          esc(q.temuan) +
          '</span>' +
          '<span class="dugaan-row__verdict">' +
          (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh data') +
          '</span>' +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var b = bendaVerif();
  var selesaiA = bendaSelesai(b);
  var semuaPilah = sortItemsAllAnswered(D.pernyataan, State.pernyataanStates);

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p>' +
        esc(D.instruksiA) +
        '</p>' +
        '<div class="ul-benda">' +
        '<div class="ul-benda__gambar">' +
        '<p class="ul-benda__nama"><span aria-hidden="true">' +
        b.ikon +
        '</span> ' +
        esc(b.nama) +
        '</p>' +
        '<p class="ul-cerita">' +
        esc(b.cerita) +
        '</p>' +
        buildGambarLingkaran(
          b.bagian.map(function (g) {
            return Object.assign({ tag: g.tag }, g.el);
          }),
          { dekor: b.dekor, caption: b.caption, pusat: 'titik' }
        ) +
        '</div>' +
        '<div class="ul-benda__soal">' +
        b.bagian.map(buildBagian).join('') +
        '</div>' +
        '</div>' +
        (selesaiA ? buildFeedbackBox('success', '💡', esc(D.kesimpulan)) : '')
    ) +
    (selesaiA
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' + esc(D.judulB) + '</h3>' + buildDugaanBanding()
        ) +
        buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulC) +
            '</h3>' +
            '<p>' +
            esc(D.instruksiC) +
            '</p>' +
            buildSortItems(
              D.pernyataan,
              State.pernyataanOrder,
              D.opsiPernyataan,
              State.pernyataanStates
            )
        )
      : '') +
    (selesaiA && semuaPilah ? buildDlNextButton('verifNextBtn', D.nextLabel) : '') +
    '</section>';

  var rerender = function () {
    var kunci = kunciFokus();
    renderVerifikasi(container);
    pulihkanFokus(kunci);
  };

  container.querySelectorAll('[data-vb-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var g = b.bagian.filter(function (x) {
        return x.id === btn.dataset.group;
      })[0];
      if (!g || bagianBenar(g)) return;
      var st = State.verifJawab[g.id];
      st.chosen = btn.dataset.vbOpt;
      if (!bagianBenar(g)) st.pilihSalah += 1;
      saveState();
      rerender();
    });
  });
  bindSortItems(container, D.pernyataan, State.pernyataanStates, saveState, rerender);
  bindNext('verifNextBtn', 'verifikasi', 'generalisasi');
}

/* ============================================================
   10. STAGE: MENARIK KESIMPULAN  (Discovery Learning — sintaks 6)
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali tabel pengamatan dan hasil pemilahanmu, lalu pilih potongan lain.</p>'
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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah pengertian ketujuh unsur lingkaran yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman unsur lingkaran</h3>' +
            buildGambarLingkaran(
              [
                { tipe: 'daerah', batas: 'jariJari', a0: 20, a1: 80, tag: '6' },
                { tipe: 'daerah', batas: 'taliBusur', a0: 200, a1: 290, tag: '7' },
                { tipe: 'ruas', u: { jarak: 0 }, v: { sudut: 20 }, tag: '2' },
                { tipe: 'ruas', u: { sudut: 120 }, v: { sudut: 300 }, tag: '3' },
                { tipe: 'ruas', u: { sudut: 200 }, v: { sudut: 290 }, tag: '4' },
                { tipe: 'busur', a0: 150, a1: 190, tag: '5' },
                { tipe: 'titik', jarak: 0, tag: '1' },
              ],
              {
                caption:
                  'Lingkaran berpusat O: 1 titik pusat, 2 jari-jari, 3 diameter, 4 tali busur, 5 busur, 6 juring, 7 tembereng',
              }
            ) +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + esc(r) + '</li>'
                );
              })
              .join('') +
            '</ol>' +
            '<p class="dl-caption">Nomor pada gambar: 1 titik pusat, 2 jari-jari, 3 diameter, 4 tali busur, 5 busur, 6 juring, 7 tembereng.</p>',
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
   11. STAGE: UJI TERAP
   'gambar' & 'nama' : opsi & umpan dari engine (seksi 84).
   'pilih'           : opsi, correct & umpan dari data.
   'isi'             : isian bilangan; kunci & umpan dari engine.
   Setelah selesai, pembahasan ditampilkan.
   ============================================================ */

function soalSelesai(s, ex) {
  if (s.tipe === 'isi') return ex.tepat || ex.revealed;
  return ex.chosen === kunciSoal(s);
}

function soalBenarLangsung(s, ex) {
  if (s.tipe === 'isi') return ex.tepat && ex.attempts === 1;
  return soalSelesai(s, ex) && ex.pilihSalah === 0;
}

function semuaSoalSelesai() {
  return TERAP_SOAL.every(function (s, i) {
    return soalSelesai(s, State.terapkanSoal[i]);
  });
}

function buildPembahasan(s) {
  return (
    '<div class="ul-bahas">' +
    '<p class="ul-bahas__judul">Pembahasan</p>' +
    '<p>' +
    esc(s.pembahasan) +
    '</p>' +
    '</div>'
  );
}

function buildHintSoal(s, ex) {
  return (
    buildHintToggle('soal-hint', s.hints, ex.hintLevel) + buildHintStack(s.hints, ex.hintLevel)
  );
}

function umpanPilihan(s, ex) {
  if (s.tipe === 'pilih') return esc(s.umpan[ex.chosen]);
  var kunci = kunciSoal(s);
  return esc(pesanUnsurLingkaran(diagnosaUnsurLingkaran(kunci, ex.chosen), kunci, ex.chosen));
}

function buildSoalPilih(s, ex) {
  var benar = soalSelesai(s, ex);
  var umpan = '';
  if (ex.chosen && benar) {
    umpan = buildFeedbackBox('success', '✓', umpanPilihan(s, ex)) + buildPembahasan(s);
  } else if (ex.chosen) {
    umpan = buildFeedbackBox('error', '✗', '<strong>Belum tepat.</strong> ' + umpanPilihan(s, ex));
  }
  var opsi = opsiSoal(s).map(function (o) {
    return { id: o.id, label: esc(o.label) };
  });
  return (
    (s.tipe === 'gambar'
      ? '<div class="ul-soal-gambar">' +
        buildGambarLingkaran(s.elemen, { dekor: s.dekor, caption: s.caption, pusat: 'titik' }) +
        '</div>'
      : '') +
    '<p class="exercise-label">' +
    esc(s.tanya) +
    '</p>' +
    buildChoiceGroup(opsi, ex.optionOrder, {
      chosen: ex.chosen,
      correctId: benar ? kunciSoal(s) : null,
      grade: true,
      locked: benar,
    }) +
    (ex.chosen ? '<div style="margin-top:var(--space-3);">' + umpan + '</div>' : '') +
    (benar ? '' : buildHintSoal(s, ex))
  );
}

function buildSoalIsi(s, ex) {
  var selesai = soalSelesai(s, ex);
  var kunci = nilaiSoalLingkaran(s.cek);
  var hasil = '';
  if (selesai) {
    hasil =
      buildFeedbackBox(
        ex.revealed ? 'info' : 'success',
        ex.revealed ? '👁' : '✓',
        ex.revealed
          ? 'Jawaban yang tepat: ' + fmtSuku(kunci) + ' ' + esc(s.satuan) + '.'
          : '<strong>Tepat!</strong>'
      ) + buildPembahasan(s);
  } else if (ex.salah) {
    hasil = buildFeedbackBox(
      'error',
      '✗',
      '<strong>Belum tepat.</strong> ' + esc(pesanSoalLingkaran(s.cek, ex.salah))
    );
  }
  return (
    '<p class="exercise-label"><label for="soalIsiInput">' +
    esc(s.tanya) +
    '</label></p>' +
    '<div class="dl-input-row">' +
    buildDlNumInput('soalIsiInput', selesai ? fmtSuku(kunci) : ex.input, {
      aria: s.tanya,
      desimal: true,
      disabled: selesai,
      error: !!ex.salah && !selesai,
    }) +
    '<span class="ul-satuan">' +
    esc(s.satuan) +
    '</span>' +
    (selesai
      ? ''
      : '<button type="button" class="btn btn--primary" id="soalIsiCek">Periksa</button>' +
        (ex.attempts >= 2
          ? '<button type="button" class="btn btn--ghost btn--small" id="soalIsiLihat">Lihat Jawaban</button>'
          : '')) +
    '</div>' +
    (hasil ? '<div style="margin-top:var(--space-3);">' + hasil + '</div>' : '') +
    (selesai ? '' : buildHintSoal(s, ex))
  );
}

function renderTerapkan(container) {
  var D = DATA.terapkan;
  var idx = State.terapkanIdx;
  var s = TERAP_SOAL[idx];
  var ex = State.terapkanSoal[idx];
  var selesaiIni = soalSelesai(s, ex);
  var semua = semuaSoalSelesai();
  var kt = DATA.konteks[s.konteks];

  var titik = TERAP_SOAL.map(function (x, i) {
    var st = State.terapkanSoal[i];
    var cls = 'ul-dot';
    if (soalSelesai(x, st)) cls += ' ul-dot--done';
    if (i === idx) cls += ' ul-dot--aktif';
    return (
      '<button type="button" class="' +
      cls +
      '" data-soal-idx="' +
      i +
      '" aria-label="Soal ' +
      (i + 1) +
      (soalSelesai(x, st) ? ', selesai' : '') +
      '"' +
      (i === idx ? ' aria-current="step"' : '') +
      '>' +
      (i + 1) +
      '</button>'
    );
  }).join('');

  container.innerHTML =
    '<section aria-label="Uji Terap">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    '<nav class="ul-dots" aria-label="Pilih soal">' +
    titik +
    '</nav>' +
    buildDlPanel(
      '<p class="ul-kasus">Soal ' +
        (idx + 1) +
        ' dari ' +
        TERAP_SOAL.length +
        ' · <span aria-hidden="true">' +
        kt.ikon +
        '</span> ' +
        esc(kt.nama) +
        '</p>' +
        '<p class="ul-cerita">' +
        esc(s.cerita) +
        '</p>' +
        (s.tipe === 'isi' ? buildSoalIsi(s, ex) : buildSoalPilih(s, ex))
    ) +
    '<div class="btn-group btn-group--spread">' +
    '<button type="button" class="btn btn--ghost" id="soalPrev"' +
    (idx === 0 ? ' disabled' : '') +
    '>← Sebelumnya</button>' +
    (semua
      ? '<button type="button" class="btn btn--primary" id="terapkanNextBtn">' +
        esc(D.nextLabel) +
        '</button>'
      : '<button type="button" class="btn btn--primary" id="soalNext"' +
        (idx === TERAP_SOAL.length - 1 || !selesaiIni ? ' disabled' : '') +
        '>Soal berikutnya →</button>') +
    '</div>' +
    '</section>';

  var rerender = function () {
    var kunci = kunciFokus();
    renderTerapkan(container);
    pulihkanFokus(kunci);
  };

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (soalSelesai(s, ex)) return;
      ex.chosen = btn.dataset.optId;
      if (!soalSelesai(s, ex)) ex.pilihSalah += 1;
      saveState();
      rerender();
    });
  });

  var hint = document.getElementById('soal-hint');
  if (hint) {
    hint.addEventListener('click', function () {
      ex.hintLevel = Math.min(ex.hintLevel + 1, s.hints.length);
      saveState();
      rerender();
    });
  }

  var input = document.getElementById('soalIsiInput');
  if (input && !input.disabled) {
    input.addEventListener('input', function () {
      ex.input = input.value;
      saveState();
    });
  }
  var cekIsi = document.getElementById('soalIsiCek');
  if (cekIsi) {
    var periksaIsi = function () {
      var v = readDlNumber(ex.input, true);
      if (v === null) return;
      ex.attempts += 1;
      var kode = diagnosaSoalLingkaran(s.cek, v);
      ex.tepat = kode === 'benar';
      ex.salah = ex.tepat ? null : kode;
      saveState();
      rerender();
    };
    cekIsi.addEventListener('click', periksaIsi);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') periksaIsi();
    });
  }
  var lihatIsi = document.getElementById('soalIsiLihat');
  if (lihatIsi) {
    lihatIsi.addEventListener('click', function () {
      ex.revealed = true;
      saveState();
      rerender();
    });
  }

  container.querySelectorAll('[data-soal-idx]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.terapkanIdx = parseInt(btn.dataset.soalIdx, 10);
      saveState();
      rerender();
    });
  });

  var prev = document.getElementById('soalPrev');
  if (prev) {
    prev.addEventListener('click', function () {
      State.terapkanIdx = Math.max(0, idx - 1);
      saveState();
      rerender();
    });
  }
  var next = document.getElementById('soalNext');
  if (next) {
    next.addEventListener('click', function () {
      State.terapkanIdx = Math.min(TERAP_SOAL.length - 1, idx + 1);
      saveState();
      rerender();
    });
  }
  bindNext('terapkanNextBtn', 'terapkan', 'refleksi');
}

/* ============================================================
   12. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var b = bendaVerif();
  var bagianLangsung = b.bagian.filter(function (g) {
    return bagianBenar(g) && State.verifJawab[g.id].pilihSalah === 0;
  }).length;
  var pilahTotal = 0;
  var pilahBenar = 0;
  OLAH_STAGES.forEach(function (id) {
    pilahTotal += DATA[id].pilah.length;
    pilahBenar += sortItemsCorrectCount(DATA[id].pilah, State.pilah[id]);
  });
  var benarTerap = TERAP_SOAL.filter(function (s, i) {
    return soalBenarLangsung(s, State.terapkanSoal[i]);
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
        kartu(pilahBenar + '/' + pilahTotal, 'Gambar dipilah benar') +
        kartu(
          bagianLangsung + '/' + b.bagian.length,
          'Bagian ' + esc(b.nama.toLowerCase()) + ' benar sekali pilih'
        ) +
        kartu(benarTerap + '/' + TERAP_SOAL.length, 'Uji terap benar pada percobaan pertama') +
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
    buildIstilahGrid(DATA.olahRuas.temuan.concat(DATA.olahDaerah.temuan)) +
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
    'Kemampuan murid menunjukkan dan menjelaskan unsur-unsur lingkaran pada benda nyata di kelas dengan menyebut cirinya tetap menjadi bahan penilaian utama dan jembatan menuju keliling dan luas lingkaran.' +
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
  olahRuas: renderOlahRuas,
  olahDaerah: renderOlahDaerah,
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
}

document.addEventListener('DOMContentLoaded', init);
