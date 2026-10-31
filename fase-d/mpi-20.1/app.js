'use strict';

/* ============================================================
   app.js — Logika media pembelajaran
   Rerata (Mean) Data Tunggal
   Fase D — SMP Kelas VIII · Topik 20 Ukuran Pemusatan dan Penyebaran
   Data, Discovery Learning

   Struktur:
     1. Konstanta
     2. State & storage (+ pengacakan semua pilihan jawaban)
     3. Navigasi
     4. Utilitas render (isian berdiagnosa, pilihan terkunci, data)
     5–14. Renderer tiap tahap
     15. Router render
     16. Modal reset
     17. Init

   Seluruh komponen umum berasal dari shared/engine.js: rerata, median,
   modus, Lab Ratakan Menara, Lab Titik Seimbang, data hilang, diagnosa
   & opsi berpengecoh miskonsepsi rerata (seksi 87); serta pilihan acak,
   pertanyaan penuntun, pemilahan, dan petunjuk berjenjang.

   Seluruh pilihan jawaban DIACAK sekali saat state disiapkan
   (initExerciseArrays) lalu urutannya disimpan di State, sehingga
   stabil saat dirender ulang tetapi teracak ulang setiap Reset.
   Data verifikasi dan soal uji terap juga diambil acak.
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'koleksi',
  'olahRumus',
  'olahMakna',
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
  'Rumus',
  'Makna',
  'Pembuktian',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-20-1-rerata-v1';
var LAB = DATA.koleksi;

/* Soal uji terap & data verifikasi terpilih (diisi dari State). */
var TERAP_SOAL = [];
var VERIF_DATA = [];

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

  /* Tahap 3 — Lab Ratakan Menara */
  menara: {},
  labIsian: {},

  /* Tahap 4a–b — pertanyaan penuntun, latihan, papan, pemilahan */
  olahOrders: {},
  olahPilih: {},
  latihanIsian: {},
  seimbang: {},
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 5 — pembuktian */
  verifPick: null,
  verifIsian: {},
  verifOrders: {},
  verifJawab: {},
  lombaIsian: {},

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

/* State isian bilangan berdiagnosa. */
function makeIsian() {
  return { input: '', tepat: false, salah: null, attempts: 0, hintLevel: 0, revealed: false };
}

function ensureIsian(target, key) {
  if (!isObject(target[key])) target[key] = makeIsian();
  return target[key];
}

function makeJawab() {
  return { chosen: null, pilihSalah: 0 };
}

function ensureJawab(target, key) {
  if (!isObject(target[key])) target[key] = makeJawab();
  return target[key];
}

/* Kunci jawaban sebuah soal uji terap (nilai isian atau id opsi). */
function kunciSoal(s) {
  if (s.tipe === 'hitung') return rerataData(s.data);
  if (s.tipe === 'hilang') return dataHilangDariRerata(s.diketahui, s.rerata);
  if (s.tipe === 'pilihRerata') return 'benar';
  return s.correct;
}

/* Opsi pilihan sebuah soal; null untuk soal isian. */
function opsiSoal(s) {
  if (s.tipe === 'pilihRerata') return opsiRerata(s.data, s.satuan);
  if (s.tipe === 'pilih') return s.opsi;
  return null;
}

function soalIsian(s) {
  return s.tipe === 'hitung' || s.tipe === 'hilang';
}

function makeSoalState() {
  var st = makeIsian();
  st.chosen = null;
  st.pilihSalah = 0;
  st.optionOrder = null;
  return st;
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

function pickValid(pick, list, banyak) {
  if (!Array.isArray(pick) || pick.length !== banyak) return false;
  var ada = optionIds(list);
  return pick.every(function (id, i) {
    return ada.indexOf(id) !== -1 && pick.indexOf(id) === i;
  });
}

function isiDariPick(target, list, pick) {
  var byId = {};
  list.forEach(function (s) {
    byId[s.id] = s;
  });
  target.length = 0;
  pick.forEach(function (id) {
    target.push(byId[id]);
  });
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
    'menara',
    'labIsian',
    'olahOrders',
    'olahPilih',
    'latihanIsian',
    'seimbang',
    'verifIsian',
    'verifOrders',
    'verifJawab',
    'lombaIsian',
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

  /* Tahap 3 — menara & isian tinggi rata */
  LAB.regu.forEach(function (r) {
    ensureMenaraState(State.menara, r.id, r.data);
    ensureIsian(State.labIsian, r.id);
  });

  /* Tahap 4a–b — pertanyaan penuntun, latihan, papan, pemilahan */
  ['olahRumus', 'olahMakna'].forEach(function (id) {
    DATA[id].pertanyaan.forEach(function (q) {
      ensureShuffledOrder(State.olahOrders, q.id, q.opsi);
    });
  });
  DATA.olahRumus.latihan.forEach(function (l) {
    ensureIsian(State.latihanIsian, l.id);
  });
  DATA.olahMakna.papan.forEach(function (p) {
    var st = ensureSeimbangState(State.seimbang, p.id, p.awal);
    if (typeof st.tercapai !== 'boolean') st.tercapai = false;
  });
  ensureSortStates(State, 'pilahStates', 'pilahOrder', DATA.olahMakna.pilah, OPSI_BENAR_SALAH);

  /* Tahap 5 — data baru dipilih acak; opsi tafsiran diacak */
  var V = DATA.verifikasi;
  if (!pickValid(State.verifPick, V.bank, V.ambil)) {
    State.verifPick = shuffleArray(optionIds(V.bank)).slice(0, V.ambil);
    State.verifIsian = {};
    State.verifOrders = {};
    State.verifJawab = {};
  }
  isiDariPick(VERIF_DATA, V.bank, State.verifPick);
  VERIF_DATA.forEach(function (b) {
    ensureIsian(State.verifIsian, b.id);
    ensureShuffledOrder(State.verifOrders, b.id, b.tafsir.opsi);
    ensureJawab(State.verifJawab, b.id);
  });
  DATA.stimulasi.kelompok.forEach(function (k) {
    ensureIsian(State.lombaIsian, k.id);
  });

  /* Tahap 6 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);

  /* Tahap 7 — soal dipilih acak dari bank; opsi tiap soal diacak */
  var T = DATA.terapkan;
  if (!pickValid(State.terapkanPick, T.soal, T.banyak)) {
    State.terapkanPick = pilihSoalTerap();
    State.terapkanSoal = [];
    State.terapkanIdx = 0;
  }
  isiDariPick(TERAP_SOAL, T.soal, State.terapkanPick);
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

function fmt(v) {
  return formatDesimal(v, 2);
}

function denganSatuan(v, satuan) {
  return fmt(v) + (satuan ? ' ' + satuan : '');
}

function buildIstilahGrid(list) {
  return (
    '<div class="formula-duo rr-istilah">' +
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

/* Daftar data bernama: "Nia 7", "Oki 0", … */
function buildDataChips(anggota, data, satuan, label) {
  return (
    '<ul class="rr-data" aria-label="' +
    esc(label || 'Data') +
    '">' +
    data
      .map(function (v, i) {
        return (
          '<li class="rr-data__item"><span class="rr-data__nama">' +
          esc(anggota[i]) +
          '</span><span class="rr-data__nilai">' +
          esc(fmt(v)) +
          '</span></li>'
        );
      })
      .join('') +
    '</ul>' +
    (satuan ? '<p class="rr-data__satuan">Satuan: ' + esc(satuan) + '</p>' : '')
  );
}

/* Pertanyaan pilihan satu kali benar: opsi, nilai & umpan balik. */
function buildPilihTerkunci(opsi, order, st, kunci, attr, group, umpan) {
  var benar = st.chosen === kunci;
  return (
    buildChoiceGroup(
      opsi.map(function (o) {
        return { id: o.id, label: esc(o.label) };
      }),
      order,
      {
        chosen: st.chosen,
        correctId: benar ? kunci : null,
        grade: true,
        locked: benar,
        group: group,
        attr: attr,
      }
    ) +
    (st.chosen
      ? '<div style="margin-top:var(--space-2);">' +
        buildFeedbackBox(benar ? 'success' : 'warning', benar ? '✓' : '💭', esc(umpan)) +
        '</div>'
      : '')
  );
}

/* Mencatat pilihan pada state satu-kali-benar. */
function catatPilih(st, pilih, kunci) {
  if (st.chosen === kunci) return false;
  st.chosen = pilih;
  if (pilih !== kunci) st.pilihSalah += 1;
  return true;
}

function isianSelesai(st) {
  return st.tepat || st.revealed;
}

function isianLangsung(st) {
  return st.tepat && st.attempts === 1;
}

/*
 * Isian bilangan berdiagnosa miskonsepsi.
 *   cfg { label, satuan, hints, kunci (nilai), pesan(kode) → teks,
 *         pesanBenar, reveal (true → tombol Lihat Jawaban setelah 2 kali) }
 * Id DOM: <id>-input, <id>-cek, <id>-lihat, <id>-hint.
 */
function buildIsian(id, st, cfg) {
  var selesai = isianSelesai(st);
  var kunci = fmt(cfg.kunci);
  var hasil = '';
  if (st.revealed) {
    hasil = buildFeedbackBox(
      'info',
      '👁',
      'Jawaban yang tepat: ' + esc(denganSatuan(cfg.kunci, cfg.satuan)) + '. ' + esc(cfg.pesanBenar)
    );
  } else if (st.tepat) {
    hasil = buildFeedbackBox('success', '✓', esc(cfg.pesanBenar));
  } else if (st.salah) {
    hasil = buildFeedbackBox(
      'error',
      '✗',
      '<strong>Belum tepat.</strong> ' + esc(cfg.pesan(st.salah))
    );
  }
  return (
    '<div class="rr-isian">' +
    '<p class="exercise-label"><label for="' +
    id +
    '-input">' +
    esc(cfg.label) +
    '</label></p>' +
    '<div class="dl-input-row">' +
    buildDlNumInput(id + '-input', selesai ? kunci : st.input, {
      aria: cfg.label,
      desimal: true,
      disabled: selesai,
      error: !!st.salah && !selesai,
    }) +
    (cfg.satuan ? '<span class="rr-satuan">' + esc(cfg.satuan) + '</span>' : '') +
    (selesai
      ? ''
      : '<button type="button" class="btn btn--primary" id="' +
        id +
        '-cek">Periksa</button>' +
        (cfg.reveal && st.attempts >= 2
          ? '<button type="button" class="btn btn--ghost btn--small" id="' +
            id +
            '-lihat">Lihat Jawaban</button>'
          : '')) +
    '</div>' +
    (hasil ? '<div style="margin-top:var(--space-3);">' + hasil + '</div>' : '') +
    (selesai || !cfg.hints
      ? ''
      : buildHintToggle(id + '-hint', cfg.hints, st.hintLevel) +
        buildHintStack(cfg.hints, st.hintLevel)) +
    '</div>'
  );
}

/* Memasang event buildIsian. diagnosa(v) → kode ('benar' bila tepat). */
function bindIsian(id, st, cfg, rerender) {
  var input = document.getElementById(id + '-input');
  if (input && !input.disabled) {
    input.addEventListener('input', function () {
      st.input = input.value;
      saveState();
    });
  }
  var cek = document.getElementById(id + '-cek');
  if (cek) {
    var periksa = function () {
      var v = readDlNumber(st.input, true);
      if (v === null) return;
      st.attempts += 1;
      var kode = cfg.diagnosa(v);
      st.tepat = kode === 'benar';
      st.salah = st.tepat ? null : kode;
      saveState();
      rerender();
    };
    cek.addEventListener('click', periksa);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') periksa();
    });
  }
  var lihat = document.getElementById(id + '-lihat');
  if (lihat) {
    lihat.addEventListener('click', function () {
      st.revealed = true;
      saveState();
      rerender();
    });
  }
  var hint = document.getElementById(id + '-hint');
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = Math.min(st.hintLevel + 1, cfg.hints.length);
      saveState();
      rerender();
    });
  }
}

/* Konfigurasi isian rerata sebuah data (diagnosa & pesan seksi 87). */
function cfgRerata(data, satuan, label, hints, reveal) {
  return {
    label: label,
    satuan: satuan,
    hints: hints,
    reveal: reveal,
    kunci: rerataData(data),
    pesanBenar: pesanRerata('benar', data, satuan),
    pesan: function (kode) {
      return pesanRerata(kode, data, satuan);
    },
    diagnosa: function (v) {
      return diagnosaRerata(data, v);
    },
  };
}

/*
 * Mengembalikan fokus keyboard ke kontrol yang setara setelah render
 * ulang, agar pengguna keyboard tidak terlempar ke awal halaman.
 */
var FOKUS_ATTR = [
  'data-dugaan-opt',
  'data-tafsir-opt',
  'data-soal-idx',
  'data-q-opt',
  'data-sort-opt',
];

function kunciFokus() {
  var el = document.activeElement;
  if (!el || el === document.body) return null;
  if (el.id) return '#' + el.id;
  if (el.dataset && el.dataset.menara) {
    return '[data-menara="' + el.dataset.menara + '"][data-menara-i="' + el.dataset.menaraI + '"]';
  }
  for (var i = 0; i < FOKUS_ATTR.length; i++) {
    var a = FOKUS_ATTR[i];
    if (el.hasAttribute(a)) {
      var sel = '[' + a + '="' + el.getAttribute(a) + '"]';
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

function rerenderDenganFokus(fn, container) {
  return function () {
    var kunci = kunciFokus();
    fn(container);
    pulihkanFokus(kunci);
  };
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   ============================================================ */

function dugaanTerisi() {
  return DATA.stimulasi.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function buildKartuKelompok(k, satuan) {
  return (
    '<div class="rr-kelompok">' +
    '<h3 class="rr-kelompok__judul"><span aria-hidden="true">' +
    k.ikon +
    '</span> ' +
    esc(k.nama) +
    '</h3>' +
    buildDataChips(k.anggota, k.data, '', k.nama) +
    '<p class="rr-kelompok__total">Total: <strong>' +
    esc(denganSatuan(jumlahData(k.data), satuan)) +
    '</strong> dari ' +
    k.data.length +
    ' anggota</p>' +
    '</div>'
  );
}

function renderStimulasi(container) {
  var D = DATA.stimulasi;

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">♻️ ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="rr-kelompok-grid">' +
        D.kelompok
          .map(function (k) {
            return buildKartuKelompok(k, D.satuan);
          })
          .join('') +
        '</div>' +
        '<p class="rr-catatan-kecil">Data dalam ' +
        esc(D.satuan) +
        '.</p>',
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
      rerenderDenganFokus(renderStimulasi, container)();
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
   7. STAGE: PENGUMPULAN DATA — LAB RATAKAN MENARA  (sintaks 3)
   Regu dibuka berurutan: ratakan menara → isi tinggi rata.
   ============================================================ */

function reguRata(r) {
  return menaraRata(State.menara[r.id].tinggi);
}

function reguSelesai(r) {
  return reguRata(r) && isianSelesai(State.labIsian[r.id]);
}

function semuaReguSelesai() {
  return LAB.regu.every(reguSelesai);
}

function cfgLab(r) {
  var cfg = cfgRerata(r.data, 'balok', r.tanya, r.hints, true);
  cfg.pesanBenar = r.temuan;
  return cfg;
}

function buildTabelLab() {
  var k = LAB.kolom;
  return (
    '<div class="rr-table-wrap"><table class="rr-table">' +
    '<caption class="sr-only">' +
    esc(LAB.tabelJudul) +
    '</caption>' +
    '<thead><tr>' +
    k
      .map(function (h) {
        return '<th scope="col">' + esc(h) + '</th>';
      })
      .join('') +
    '</tr></thead><tbody>' +
    LAB.regu
      .map(function (r) {
        var ok = reguSelesai(r);
        return (
          '<tr><th scope="row">' +
          esc(r.nama) +
          '</th><td>' +
          esc(r.data.join(', ')) +
          '</td><td>' +
          (ok ? jumlahData(r.data) : '—') +
          '</td><td>' +
          (ok ? r.data.length : '—') +
          '</td><td>' +
          (ok ? '<strong>' + esc(fmt(rerataData(r.data))) + '</strong>' : '—') +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table></div>'
  );
}

function buildRegu(r, nomor) {
  var st = State.menara[r.id];
  var rata = reguRata(r);
  var isi = State.labIsian[r.id];
  var sisa = sisaRatakan(r.data);
  var info = '';
  if (rata) {
    info = buildFeedbackBox(
      'success',
      '🧱',
      '<strong>Menara sudah rata!</strong> Kamu memindahkan ' +
        st.pindah +
        ' balok (paling sedikit ' +
        langkahMinRatakan(r.data) +
        ' balok). Jumlah balok tetap ' +
        jumlahData(st.tinggi) +
        '.' +
        (sisa.sisa
          ? ' Ada ' +
            sisa.sisa +
            ' menara yang lebih tinggi 1 balok — balok sisa itu belum bisa dibagi utuh.'
          : '')
    );
  }
  return (
    '<div class="panel">' +
    '<h3 style="margin-top:0;"><span class="dl-step__num">' +
    nomor +
    '</span>' +
    esc(r.nama) +
    '</h3>' +
    buildMenaraRata(
      'menara-' + r.id,
      st,
      { nama: r.anggota, awal: r.data, satuan: LAB.satuan },
      { terkunci: rata, garisRata: isianSelesai(isi) }
    ) +
    (rata ? '<div style="margin-top:var(--space-3);">' + info + '</div>' : '') +
    (rata ? buildIsian('lab-' + r.id, isi, cfgLab(r)) : '') +
    '</div>'
  );
}

function renderKoleksi(container) {
  var html = '';
  for (var i = 0; i < LAB.regu.length; i++) {
    html += buildRegu(LAB.regu[i], i + 1);
    if (!reguSelesai(LAB.regu[i])) break;
  }
  var semua = semuaReguSelesai();

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(LAB) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(LAB.pengantar) +
        '</p>' +
        '<ol class="rr-cara">' +
        LAB.caraMain
          .map(function (c) {
            return '<li>' + esc(c) + '</li>';
          })
          .join('') +
        '</ol>',
      'panel--info'
    ) +
    html +
    (semua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(LAB.tabelJudul) +
            '</h3>' +
            buildTabelLab() +
            buildFeedbackBox('info', '💡', esc(LAB.selesai))
        ) + buildDlNextButton('koleksiNextBtn', LAB.nextLabel)
      : '') +
    '</section>';

  var rerender = rerenderDenganFokus(renderKoleksi, container);
  LAB.regu.forEach(function (r) {
    bindMenaraRata(container, 'menara-' + r.id, State.menara[r.id], r.data, function () {
      saveState();
      rerender();
    });
    bindIsian('lab-' + r.id, State.labIsian[r.id], cfgLab(r), rerender);
  });
  bindNext('koleksiNextBtn', 'koleksi', 'olahRumus');
}

/* ============================================================
   8. STAGE: OLAH DATA — MENEMUKAN RUMUS  (sintaks 4a)
   Tabel lab → pertanyaan penuntun → temuan → latihan berdiagnosa.
   ============================================================ */

function cfgLatihan(l) {
  return cfgRerata(l.data, l.satuan, 'Rerata buku yang dibaca ' + l.nama + ' = …', l.hints, true);
}

function latihanSelesai() {
  return DATA.olahRumus.latihan.every(function (l) {
    return isianSelesai(State.latihanIsian[l.id]);
  });
}

function renderOlahRumus(container) {
  var D = DATA.olahRumus;
  var quizBenar = guidedQuizAllCorrect(D.pertanyaan, State.olahPilih);

  var latihan = '';
  for (var i = 0; i < D.latihan.length; i++) {
    var l = D.latihan[i];
    latihan +=
      '<div class="quiz-item">' +
      '<p class="exercise-label"><span class="dl-step__num">' +
      (i + 1) +
      '</span>' +
      esc(l.nama) +
      ' (banyak buku dibaca)</p>' +
      buildDataChips(l.anggota, l.data, l.satuan, l.nama) +
      buildIsian('lat-' + l.id, State.latihanIsian[l.id], cfgLatihan(l)) +
      '</div>';
    if (!isianSelesai(State.latihanIsian[l.id])) break;
  }

  container.innerHTML =
    '<section aria-label="Olah Data Rumus Rerata">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel('<h3 style="margin-top:0;">' + esc(LAB.tabelJudul) + '</h3>' + buildTabelLab()) +
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
            esc(D.latihanJudul) +
            '</h3><p>' +
            esc(D.latihanInstruksi) +
            '</p>' +
            latihan
        )
      : '') +
    (quizBenar && latihanSelesai() ? buildDlNextButton('olahRumusNextBtn', D.nextLabel) : '') +
    '</section>';

  var rerender = rerenderDenganFokus(renderOlahRumus, container);
  bindGuidedQuizList(container, D.pertanyaan, State.olahPilih, saveState, rerender);
  D.latihan.forEach(function (l) {
    bindIsian('lat-' + l.id, State.latihanIsian[l.id], cfgLatihan(l), rerender);
  });
  bindNext('olahRumusNextBtn', 'olahRumus', 'olahMakna');
}

/* ============================================================
   9. STAGE: OLAH DATA — MAKNA RERATA  (sintaks 4b)
   Lab Titik Seimbang (A lalu B + pencilan) → pertanyaan penuntun →
   temuan → pemilahan tafsiran.
   ============================================================ */

function papanSelesai(p) {
  return State.seimbang[p.id].tercapai;
}

function semuaPapanSelesai() {
  return DATA.olahMakna.papan.every(papanSelesai);
}

function opsiPapan(p) {
  return {
    min: p.min,
    max: p.max,
    langkah: DATA.olahMakna.langkah,
    statis: papanSelesai(p),
    label: p.judul,
  };
}

function renderOlahMakna(container) {
  var D = DATA.olahMakna;
  var papanHTML = '';
  for (var i = 0; i < D.papan.length; i++) {
    var p = D.papan[i];
    var st = State.seimbang[p.id];
    papanHTML +=
      '<div class="panel">' +
      '<h3 style="margin-top:0;">' +
      esc(p.judul) +
      '</h3>' +
      buildDataChips(p.anggota, p.data, 'buku', p.judul) +
      buildTitikSeimbang('papan-' + p.id, p.data, st, opsiPapan(p)) +
      (papanSelesai(p)
        ? '<div style="margin-top:var(--space-3);">' +
          buildFeedbackBox('success', '⚖️', esc(p.temuan)) +
          '</div>'
        : '') +
      '</div>';
    if (!papanSelesai(p)) break;
  }
  var papanOk = semuaPapanSelesai();
  var quizBenar = papanOk && guidedQuizAllCorrect(D.pertanyaan, State.olahPilih);
  var semuaPilah = quizBenar && sortItemsAllAnswered(D.pilah, State.pilahStates);

  container.innerHTML =
    '<section aria-label="Olah Data Makna Rerata">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    papanHTML +
    (papanOk
      ? buildDlPanel(
          buildGuidedQuizList(
            guidedVisible(D.pertanyaan, State.olahPilih),
            State.olahOrders,
            State.olahPilih
          )
        )
      : '') +
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
            buildSortItems(D.pilah, State.pilahOrder, OPSI_BENAR_SALAH, State.pilahStates)
        )
      : '') +
    (semuaPilah ? buildDlNextButton('olahMaknaNextBtn', D.nextLabel) : '') +
    '</section>';

  var rerender = rerenderDenganFokus(renderOlahMakna, container);
  D.papan.forEach(function (p) {
    var st = State.seimbang[p.id];
    bindTitikSeimbang('papan-' + p.id, st, opsiPapan(p), function () {
      if (momenSeimbang(p.data, st.posisi).arah === 'seimbang') st.tercapai = true;
      saveState();
      var kunci = kunciFokus();
      renderOlahMakna(container);
      /* Tombol geser hilang saat seimbang: fokus ke papan berikutnya. */
      if (st.tercapai) {
        var berikut = container.querySelector('[id^="papan-"][id$="-kanan"]');
        if (berikut) berikut.focus();
      } else {
        pulihkanFokus(kunci);
      }
    });
  });
  bindGuidedQuizList(container, D.pertanyaan, State.olahPilih, saveState, rerender);
  bindSortItems(container, D.pilah, State.pilahStates, saveState, rerender);
  bindNext('olahMaknaNextBtn', 'olahMakna', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A: data baru acak (hitung → papan seimbang → tafsir).
   B: lomba bank sampah. C: dugaan awal.
   ============================================================ */

function cfgVerif(b) {
  return cfgRerata(b.data, b.satuan, 'Rerata ' + b.nama.toLowerCase() + ' = …', null, true);
}

function verifSelesai(b) {
  return isianSelesai(State.verifIsian[b.id]) && State.verifJawab[b.id].chosen === b.tafsir.correct;
}

function cfgLomba(k) {
  return cfgRerata(
    k.data,
    DATA.stimulasi.satuan,
    'Bagian rata ' + k.nama + ' = … per anggota',
    ['Jumlah sampah ' + k.nama + ' dibagi banyak anggotanya.'],
    true
  );
}

function lombaSelesai() {
  return DATA.stimulasi.kelompok.every(function (k) {
    return isianSelesai(State.lombaIsian[k.id]);
  });
}

function buildDataVerif(b, nomor) {
  var isi = State.verifIsian[b.id];
  var kt = DATA.konteks[b.konteks];
  var jawab = State.verifJawab[b.id];
  var r = rerataData(b.data);
  return (
    '<div class="rr-verif">' +
    '<p class="rr-verif__nama"><span class="dl-step__num">' +
    nomor +
    '</span><span aria-hidden="true">' +
    kt.ikon +
    '</span> ' +
    esc(b.nama) +
    '</p>' +
    '<p class="rr-cerita">' +
    esc(b.cerita) +
    '</p>' +
    buildDataChips(b.anggota, b.data, b.satuan, b.nama) +
    buildIsian('vr-' + b.id, isi, cfgVerif(b)) +
    (isianSelesai(isi)
      ? '<p class="rr-verif__bukti">Bukti dengan papan seimbang — penyangga di ' +
        esc(fmt(r)) +
        ':</p>' +
        buildTitikSeimbang(
          'vp-' + b.id,
          b.data,
          { posisi: r },
          { min: 0, max: b.max, statis: true, label: b.nama }
        ) +
        '<div class="quiz-item"><p class="exercise-label">' +
        esc(b.tafsir.tanya) +
        '</p>' +
        buildPilihTerkunci(
          b.tafsir.opsi,
          State.verifOrders[b.id],
          jawab,
          b.tafsir.correct,
          'data-tafsir-opt',
          b.id,
          jawab.chosen ? b.tafsir.umpan[jawab.chosen] : ''
        ) +
        '</div>'
      : '') +
    '</div>'
  );
}

function buildLomba() {
  var S = DATA.stimulasi;
  var html = '';
  for (var i = 0; i < S.kelompok.length; i++) {
    var k = S.kelompok[i];
    html +=
      '<div class="quiz-item">' +
      buildKartuKelompok(k, S.satuan) +
      buildIsian('lb-' + k.id, State.lombaIsian[k.id], cfgLomba(k)) +
      '</div>';
    if (!isianSelesai(State.lombaIsian[k.id])) break;
  }
  if (lombaSelesai()) {
    var rm = rerataData(S.kelompok[0].data);
    var rk = rerataData(S.kelompok[1].data);
    var menang = rm > rk ? S.kelompok[0] : S.kelompok[1];
    html += buildFeedbackBox(
      'success',
      '🏆',
      '<strong>' +
        esc(menang.nama) +
        ' juara Kelompok Paling Rajin!</strong> Rerata ' +
        esc(denganSatuan(rm, S.satuan)) +
        ' vs ' +
        esc(denganSatuan(rk, S.satuan)) +
        ' per anggota. Total yang lebih besar belum tentu lebih rajin bila banyak anggotanya berbeda.'
    );
  }
  return html;
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
  var dataHTML = '';
  for (var i = 0; i < VERIF_DATA.length; i++) {
    dataHTML += buildDataVerif(VERIF_DATA[i], i + 1);
    if (!verifSelesai(VERIF_DATA[i])) break;
  }
  var selesaiA = VERIF_DATA.every(verifSelesai);
  var selesaiB = selesaiA && lombaSelesai();

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
        dataHTML +
        (selesaiA ? buildFeedbackBox('success', '💡', esc(D.kesimpulan)) : '')
    ) +
    (selesaiA
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3><p>' +
            esc(D.instruksiB) +
            '</p>' +
            buildLomba()
        )
      : '') +
    (selesaiB
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' + esc(D.judulC) + '</h3>' + buildDugaanBanding()
        ) + buildDlNextButton('verifNextBtn', D.nextLabel)
      : '') +
    '</section>';

  var rerender = rerenderDenganFokus(renderVerifikasi, container);
  VERIF_DATA.forEach(function (b) {
    bindIsian('vr-' + b.id, State.verifIsian[b.id], cfgVerif(b), rerender);
  });
  DATA.stimulasi.kelompok.forEach(function (k) {
    bindIsian('lb-' + k.id, State.lombaIsian[k.id], cfgLomba(k), rerender);
  });
  container.querySelectorAll('[data-tafsir-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var b = VERIF_DATA.filter(function (x) {
        return x.id === btn.dataset.group;
      })[0];
      if (!b || !catatPilih(State.verifJawab[b.id], btn.dataset.tafsirOpt, b.tafsir.correct)) {
        return;
      }
      saveState();
      rerender();
    });
  });
  bindNext('verifNextBtn', 'verifikasi', 'generalisasi');
}

/* ============================================================
   11. STAGE: MENARIK KESIMPULAN  (Discovery Learning — sintaks 6)
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali Lab Ratakan Menara, papan seimbang, dan pembuktianmu, lalu pilih potongan lain.</p>'
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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah pengertian, cara, dan makna rerata yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman</h3>' +
            '<p class="rr-rumus" aria-label="x bar sama dengan jumlah seluruh nilai data dibagi banyak data">' +
            'x̄ = <span class="rr-rumus__pecahan"><span>x₁ + x₂ + … + xₙ</span><span>n</span></span>' +
            '</p>' +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + esc(r) + '</li>'
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
   12. STAGE: UJI TERAP
   'hitung'      : isian; kunci rerataData, diagnosa diagnosaRerata.
   'hilang'      : isian; kunci dataHilangDariRerata, diagnosa
                   diagnosaDataHilang.
   'pilihRerata' : opsi opsiRerata; umpan pesanRerata.
   'pilih'       : opsi, correct & umpan dari data.
   Setelah selesai, pembahasan ditampilkan.
   ============================================================ */

function soalSelesai(s, ex) {
  if (soalIsian(s)) return isianSelesai(ex);
  return ex.chosen === kunciSoal(s);
}

function soalBenarLangsung(s, ex) {
  if (soalIsian(s)) return isianLangsung(ex);
  return soalSelesai(s, ex) && ex.pilihSalah === 0;
}

function semuaSoalSelesai() {
  return TERAP_SOAL.every(function (s, i) {
    return soalSelesai(s, State.terapkanSoal[i]);
  });
}

function buildPembahasan(s) {
  return (
    '<div class="rr-bahas">' +
    '<p class="rr-bahas__judul">Pembahasan</p>' +
    '<p>' +
    esc(s.pembahasan) +
    '</p>' +
    '</div>'
  );
}

function cfgSoalIsian(s) {
  if (s.tipe === 'hitung') {
    var cfg = cfgRerata(s.data, s.satuan, s.tanya, s.hints, true);
    cfg.pesanBenar = 'Tepat!';
    return cfg;
  }
  return {
    label: s.tanya,
    satuan: s.satuan,
    hints: s.hints,
    reveal: true,
    kunci: kunciSoal(s),
    pesanBenar: 'Tepat!',
    pesan: function (kode) {
      return pesanDataHilang(kode, s.diketahui, s.rerata, s.satuan);
    },
    diagnosa: function (v) {
      return diagnosaDataHilang(s.diketahui, s.rerata, v);
    },
  };
}

function umpanPilihan(s, ex) {
  if (s.tipe === 'pilih') return esc(s.umpan[ex.chosen]);
  var kode = ex.chosen.indexOf('dekat') === 0 ? 'lain' : ex.chosen;
  return esc(pesanRerata(kode, s.data, s.satuan));
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
    (benar
      ? ''
      : buildHintToggle('soal-hint', s.hints, ex.hintLevel) + buildHintStack(s.hints, ex.hintLevel))
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
    var cls = 'rr-dot';
    if (soalSelesai(x, st)) cls += ' rr-dot--done';
    if (i === idx) cls += ' rr-dot--aktif';
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

  var isi = '';
  if (soalIsian(s)) {
    isi =
      (s.tipe === 'hilang'
        ? '<p class="rr-data__satuan">Data diketahui: ' +
          esc(s.diketahui.map(fmt).join('; ')) +
          ' · rerata ' +
          esc(fmt(s.rerata)) +
          ' · banyak data ' +
          (s.diketahui.length + 1) +
          '</p>'
        : '') +
      buildIsian('soal', ex, cfgSoalIsian(s)) +
      (selesaiIni ? buildPembahasan(s) : '');
  } else {
    isi = buildSoalPilih(s, ex);
  }

  container.innerHTML =
    '<section aria-label="Uji Terap">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    '<nav class="rr-dots" aria-label="Pilih soal">' +
    titik +
    '</nav>' +
    buildDlPanel(
      '<p class="rr-kasus">Soal ' +
        (idx + 1) +
        ' dari ' +
        TERAP_SOAL.length +
        ' · <span aria-hidden="true">' +
        kt.ikon +
        '</span> ' +
        esc(kt.nama) +
        '</p>' +
        '<p class="rr-cerita">' +
        esc(s.cerita) +
        '</p>' +
        isi
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

  var rerender = rerenderDenganFokus(renderTerapkan, container);

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
  if (hint && !soalIsian(s)) {
    hint.addEventListener('click', function () {
      ex.hintLevel = Math.min(ex.hintLevel + 1, s.hints.length);
      saveState();
      rerender();
    });
  }
  if (soalIsian(s)) bindIsian('soal', ex, cfgSoalIsian(s), rerender);

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
   13. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var isian = LAB.regu
    .map(function (r) {
      return State.labIsian[r.id];
    })
    .concat(
      DATA.olahRumus.latihan.map(function (l) {
        return State.latihanIsian[l.id];
      })
    );
  var isianBenar = isian.filter(isianLangsung).length;
  var pilah = DATA.olahMakna.pilah;
  var pilahBenar = sortItemsCorrectCount(pilah, State.pilahStates);
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
        kartu(isianBenar + '/' + isian.length, 'Isian lab & latihan benar pada percobaan pertama') +
        kartu(pilahBenar + '/' + pilah.length, 'Tafsiran rerata dipilah benar') +
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
    buildIstilahGrid(DATA.olahRumus.temuan.concat(DATA.olahMakna.temuan)) +
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
    'Kemampuan murid menghitung rerata data nyata di kelas dan menjelaskan maknanya (bagian rata, titik seimbang, pengaruh pencilan) tetap menjadi bahan penilaian utama dan jembatan menuju median, modus, serta jangkauan data.' +
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
   15. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  stimulasi: renderStimulasi,
  masalah: renderMasalah,
  koleksi: renderKoleksi,
  olahRumus: renderOlahRumus,
  olahMakna: renderOlahMakna,
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
