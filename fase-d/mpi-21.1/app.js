'use strict';

/* ============================================================
   app.js — Logika media pembelajaran
   Hubungan Mean, Median & Modus Data Tunggal
   Fase D — SMP Kelas VIII · Topik 21 Ukuran Pemusatan Data,
   Discovery Learning

   Struktur:
     1. Konstanta
     2. State & storage (+ pengacakan semua pilihan jawaban)
     3. Navigasi
     4. Utilitas render (isian berdiagnosa, pilihan terkunci, data)
     5–14. Renderer tiap tahap
     15. Router render
     16. Modal reset
     17. Init

   Seluruh komponen umum berasal dari shared/engine.js: mean, median,
   modus, hubungan & bentuk sebaran, Lab Geser Data, diagnosa & opsi
   berpengecoh miskonsepsi (seksi 87–88); serta pilihan acak,
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
  'olahPola',
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
  'Pola',
  'Makna',
  'Pembuktian',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-21-1-hubungan-ukuran-v1';
var LAB = DATA.koleksi;
var JENIS = ['rerata', 'median', 'modus'];
var LABEL_UKURAN = { rerata: 'Mean', median: 'Median', modus: 'Modus' };
var TEKS_HUBUNGAN = {
  lebih: 'Mean > Median',
  sama: 'Mean = Median',
  kurang: 'Mean < Median',
};

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

  /* Tahap 3 — Lab Geser Data */
  geser: {},
  misiTercapai: {},
  misiHasil: {},
  misiHint: {},

  /* Tahap 4a–b — pertanyaan penuntun, latihan, pemilahan */
  olahOrders: {},
  olahPilih: {},
  latihanIsian: {},
  latihanHubOrder: null,
  latihanHub: null,
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 5 — pembuktian */
  verifPick: null,
  verifDugaOrders: {},
  verifDuga: {},
  verifIsian: {},
  verifOrders: {},
  verifJawab: {},
  tanpaIsian: {},
  juruOrder: null,
  juruJawab: null,

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

/* Data tabungan stimulasi tanpa pencilan. */
function dataTanpaPencilan() {
  var S = DATA.stimulasi;
  return S.data.filter(function (v) {
    return v !== S.pencilan;
  });
}

/* Kunci jawaban sebuah soal uji terap (nilai isian atau id opsi). */
function kunciSoal(s) {
  if (s.tipe === 'hitung') return kunciUkuran(s.data, s.jenis);
  if (s.tipe === 'pilihUkuran') return 'benar';
  if (s.tipe === 'hubungan') return hubunganRerataMedian(s.data);
  return s.correct;
}

/* Opsi pilihan sebuah soal; null untuk soal isian. */
function opsiSoal(s) {
  if (s.tipe === 'pilihUkuran') return opsiUkuran(s.data, s.jenis, s.satuan);
  if (s.tipe === 'hubungan') return OPSI_HUBUNGAN;
  if (s.tipe === 'pilih') return s.opsi;
  return null;
}

function soalIsian(s) {
  return s.tipe === 'hitung';
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
    'geser',
    'misiTercapai',
    'misiHasil',
    'misiHint',
    'olahOrders',
    'olahPilih',
    'latihanIsian',
    'verifDugaOrders',
    'verifDuga',
    'verifIsian',
    'verifOrders',
    'verifJawab',
    'tanpaIsian',
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

  /* Tahap 3 — state lab per misi */
  LAB.misi.forEach(function (m) {
    ensureGeserDataState(State.geser, m.id, m.awal);
    if (typeof State.misiTercapai[m.id] !== 'boolean') State.misiTercapai[m.id] = false;
    if (typeof State.misiHint[m.id] !== 'number') State.misiHint[m.id] = 0;
    if (State.misiTercapai[m.id] && !Array.isArray(State.misiHasil[m.id])) {
      State.misiHasil[m.id] = State.geser[m.id].data.slice();
    }
  });

  /* Tahap 4a–b — pertanyaan penuntun, latihan, pemilahan */
  ['olahPola', 'olahMakna'].forEach(function (id) {
    DATA[id].pertanyaan.forEach(function (q) {
      ensureShuffledOrder(State.olahOrders, q.id, q.opsi);
    });
  });
  DATA.olahPola.latihan.urutan.forEach(function (j) {
    ensureIsian(State.latihanIsian, j);
  });
  ensureShuffledOrder(State, 'latihanHubOrder', OPSI_HUBUNGAN);
  if (!isObject(State.latihanHub)) State.latihanHub = makeJawab();
  ensureSortStates(State, 'pilahStates', 'pilahOrder', DATA.olahMakna.pilah, OPSI_BENAR_SALAH);

  /* Tahap 5 — data baru dipilih acak; opsi dugaan & tafsiran diacak */
  var V = DATA.verifikasi;
  if (!pickValid(State.verifPick, V.bank, V.ambil)) {
    State.verifPick = shuffleArray(optionIds(V.bank)).slice(0, V.ambil);
    State.verifDugaOrders = {};
    State.verifDuga = {};
    State.verifIsian = {};
    State.verifOrders = {};
    State.verifJawab = {};
  }
  isiDariPick(VERIF_DATA, V.bank, State.verifPick);
  VERIF_DATA.forEach(function (b) {
    ensureShuffledOrder(State.verifDugaOrders, b.id, OPSI_HUBUNGAN);
    ensureObject(State.verifIsian, b.id);
    JENIS.forEach(function (j) {
      ensureIsian(State.verifIsian[b.id], j);
    });
    ensureShuffledOrder(State.verifOrders, b.id, b.tafsir.opsi);
    ensureJawab(State.verifJawab, b.id);
  });
  ['rerata', 'median'].forEach(function (j) {
    ensureIsian(State.tanpaIsian, j);
  });
  ensureShuffledOrder(State, 'juruOrder', V.pilihJuru.opsi);
  if (!isObject(State.juruJawab)) State.juruJawab = makeJawab();

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

function urutTeks(data) {
  return data
    .slice()
    .sort(function (a, b) {
      return a - b;
    })
    .map(fmt)
    .join(', ');
}

function buildIstilahGrid(list) {
  return (
    '<div class="formula-duo hm-istilah">' +
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

/* Daftar data bernama: "Ani 5", "Bayu 8", … */
function buildDataChips(anggota, data, satuan, label) {
  return (
    '<ul class="hm-data" aria-label="' +
    esc(label || 'Data') +
    '">' +
    data
      .map(function (v, i) {
        return (
          '<li class="hm-data__item"><span class="hm-data__nama">' +
          esc(anggota[i]) +
          '</span><span class="hm-data__nilai">' +
          esc(fmt(v)) +
          '</span></li>'
        );
      })
      .join('') +
    '</ul>' +
    (satuan ? '<p class="hm-data__satuan">Satuan: ' + esc(satuan) + '</p>' : '')
  );
}

/* Diagram titik statis (tanpa tombol) dari Lab Geser Data. */
function buildDiagram(id, data, opts) {
  return buildGeserData(
    id,
    { data: data, pilih: null, geser: 0 },
    {
      min: typeof opts.min === 'number' ? opts.min : 0,
      max: opts.max,
      statis: true,
      penanda: opts.penanda,
      label: opts.label,
    }
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
    '<div class="hm-isian">' +
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
    (cfg.satuan ? '<span class="hm-satuan">' + esc(cfg.satuan) + '</span>' : '') +
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

/* Konfigurasi isian satu ukuran (diagnosa & pesan seksi 87–88). */
function cfgUkuran(data, jenis, satuan, label, hints) {
  return {
    label: label,
    satuan: satuan,
    hints: hints,
    reveal: true,
    kunci: kunciUkuran(data, jenis),
    pesanBenar: pesanUkuran('benar', data, jenis, satuan),
    pesan: function (kode) {
      return pesanUkuran(kode, data, jenis, satuan);
    },
    diagnosa: function (v) {
      return diagnosaUkuran(data, jenis, v);
    },
  };
}

/* Isian berurutan untuk beberapa ukuran; berikutnya muncul setelah selesai. */
function buildIsianBeruntun(prefix, states, urutan, cfgFn) {
  var html = '';
  for (var i = 0; i < urutan.length; i++) {
    html += buildIsian(prefix + urutan[i], states[urutan[i]], cfgFn(urutan[i]));
    if (!isianSelesai(states[urutan[i]])) break;
  }
  return html;
}

function bindIsianBeruntun(prefix, states, urutan, cfgFn, rerender) {
  urutan.forEach(function (j) {
    bindIsian(prefix + j, states[j], cfgFn(j), rerender);
  });
}

function semuaIsianSelesai(states, urutan) {
  return urutan.every(function (j) {
    return isianSelesai(states[j]);
  });
}

/*
 * Mengembalikan fokus keyboard ke kontrol yang setara setelah render
 * ulang, agar pengguna keyboard tidak terlempar ke awal halaman.
 */
var FOKUS_ATTR = [
  'data-dugaan-opt',
  'data-duga-opt',
  'data-tafsir-opt',
  'data-hub-opt',
  'data-juru-opt',
  'data-soal-idx',
  'data-q-opt',
  'data-sort-opt',
];

function kunciFokus() {
  var el = document.activeElement;
  if (!el || el === document.body) return null;
  if (el.id) return '#' + el.id;
  if (el.dataset && el.dataset.geser) {
    return '[data-geser="' + el.dataset.geser + '"][data-geser-i="' + el.dataset.geserI + '"]';
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

/* Memasang tombol pilihan satu-kali-benar berdasarkan atribut data. */
function bindPilihAttr(container, attr, cari, rerender) {
  var key = attr.replace(/^data-/, '').replace(/-([a-z])/g, function (_, c) {
    return c.toUpperCase();
  });
  container.querySelectorAll('[' + attr + ']').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var t = cari(btn.dataset.group);
      if (!t || !catatPilih(t.st, btn.dataset[key], t.kunci)) return;
      saveState();
      rerender();
    });
  });
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   ============================================================ */

function dugaanTerisi() {
  return DATA.stimulasi.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function buildJuruBicara() {
  return (
    '<div class="hm-juru">' +
    DATA.stimulasi.juru
      .map(function (j) {
        return (
          '<figure class="hm-juru__kartu">' +
          '<span class="hm-juru__ikon" aria-hidden="true">' +
          j.ikon +
          '</span>' +
          '<figcaption><strong>' +
          esc(j.nama) +
          '</strong><span class="hm-juru__klaim">' +
          esc(j.klaim) +
          '</span></figcaption>' +
          '</figure>'
        );
      })
      .join('') +
    '</div>'
  );
}

function renderStimulasi(container) {
  var D = DATA.stimulasi;

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🐷 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        buildDataChips(D.anggota, D.data, D.satuan, 'Tabungan mingguan') +
        buildJuruBicara(),
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
   7. STAGE: PENGUMPULAN DATA — LAB GESER DATA  (sintaks 3)
   Misi dibuka berurutan; misi tercapai otomatis (cekMisiUkuran).
   ============================================================ */

function misiCfg(m) {
  return { jenis: m.jenis, awal: m.awal };
}

function misiSelesai(m) {
  return State.misiTercapai[m.id] === true;
}

function semuaMisiSelesai() {
  return LAB.misi.every(misiSelesai);
}

function opsiLab(m) {
  return {
    min: LAB.min,
    max: LAB.max,
    nama: LAB.anggota,
    satuan: LAB.satuan,
    gerak: m.gerak || null,
    awal: m.awal,
    statis: misiSelesai(m),
    label: m.judul,
  };
}

function buildTabelLab() {
  var k = LAB.kolom;
  return (
    '<div class="hm-table-wrap"><table class="hm-table">' +
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
    LAB.misi
      .map(function (m, i) {
        var d = State.misiHasil[m.id];
        var ok = misiSelesai(m) && Array.isArray(d);
        return (
          '<tr><th scope="row">Misi ' +
          (i + 1) +
          '</th><td>' +
          (ok ? esc(urutTeks(d)) : '—') +
          '</td><td>' +
          (ok ? esc(fmt(rerataData(d))) : '—') +
          '</td><td>' +
          (ok ? esc(fmt(medianData(d))) : '—') +
          '</td><td>' +
          (ok ? esc(teksModus(d)) : '—') +
          '</td><td>' +
          (ok ? '<strong>' + esc(TEKS_HUBUNGAN[hubunganRerataMedian(d)]) + '</strong>' : '—') +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table></div>'
  );
}

function buildMisi(m, nomor) {
  var st = State.geser[m.id];
  var ok = misiSelesai(m);
  var lvl = State.misiHint[m.id];
  return (
    '<div class="panel">' +
    '<h3 style="margin-top:0;"><span class="dl-step__num">' +
    nomor +
    '</span>' +
    esc(m.judul) +
    '</h3>' +
    '<p class="hm-tugas">' +
    esc(m.tugas) +
    '</p>' +
    buildGeserData('lab-' + m.id, st, opsiLab(m)) +
    (ok
      ? '<div style="margin-top:var(--space-3);">' +
        buildFeedbackBox(
          'success',
          '🎯',
          '<strong>Misi tercapai!</strong> ' +
            esc(TEKS_HUBUNGAN[hubunganRerataMedian(st.data)]) +
            '. ' +
            esc(m.temuan)
        ) +
        '</div>'
      : buildHintToggle('hint-' + m.id, m.hints, lvl) + buildHintStack(m.hints, lvl)) +
    '</div>'
  );
}

function renderKoleksi(container) {
  var html = '';
  for (var i = 0; i < LAB.misi.length; i++) {
    html += buildMisi(LAB.misi[i], i + 1);
    if (!misiSelesai(LAB.misi[i])) break;
  }
  var semua = semuaMisiSelesai();

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(LAB) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(LAB.pengantar) +
        '</p>' +
        '<ol class="hm-cara">' +
        LAB.caraMain
          .map(function (c) {
            return '<li>' + esc(c) + '</li>';
          })
          .join('') +
        '</ol>',
      'panel--info'
    ) +
    html +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(LAB.tabelJudul) +
        '</h3>' +
        buildTabelLab() +
        (semua ? buildFeedbackBox('info', '💡', esc(LAB.selesai)) : '')
    ) +
    (semua ? buildDlNextButton('koleksiNextBtn', LAB.nextLabel) : '') +
    '</section>';

  LAB.misi.forEach(function (m) {
    var st = State.geser[m.id];
    bindGeserData(container, 'lab-' + m.id, st, opsiLab(m), function () {
      var kunci = kunciFokus();
      if (!misiSelesai(m) && cekMisiUkuran(st.data, misiCfg(m))) {
        State.misiTercapai[m.id] = true;
        State.misiHasil[m.id] = st.data.slice();
        st.pilih = null;
      }
      saveState();
      renderKoleksi(container);
      if (misiSelesai(m)) {
        var berikut = container.querySelector('[data-geser]:not(:disabled)');
        if (berikut) berikut.focus();
      } else {
        pulihkanFokus(kunci);
      }
    });
    var hint = document.getElementById('hint-' + m.id);
    if (hint) {
      hint.addEventListener('click', function () {
        State.misiHint[m.id] = Math.min(State.misiHint[m.id] + 1, m.hints.length);
        saveState();
        rerenderDenganFokus(renderKoleksi, container)();
      });
    }
  });
  bindNext('koleksiNextBtn', 'koleksi', 'olahPola');
}

/* ============================================================
   8. STAGE: OLAH DATA — MENEMUKAN POLA  (sintaks 4a)
   Tabel lab → pertanyaan penuntun → temuan → latihan berdiagnosa →
   menentukan hubungan.
   ============================================================ */

function cfgLatihan(j) {
  var L = DATA.olahPola.latihan;
  return cfgUkuran(L.data, j, L.satuan, LABEL_UKURAN[j] + ' lama perjalanan = …', L.hints[j]);
}

function latihanSelesai() {
  var L = DATA.olahPola.latihan;
  return (
    semuaIsianSelesai(State.latihanIsian, L.urutan) &&
    State.latihanHub.chosen === hubunganRerataMedian(L.data)
  );
}

function buildLatihan() {
  var L = DATA.olahPola.latihan;
  var isian = buildIsianBeruntun('lat-', State.latihanIsian, L.urutan, cfgLatihan);
  var hub = '';
  if (semuaIsianSelesai(State.latihanIsian, L.urutan)) {
    var kunci = hubunganRerataMedian(L.data);
    var st = State.latihanHub;
    hub =
      buildDiagram('lat-diagram', L.data, { min: L.min, max: L.max, label: L.nama }) +
      '<div class="quiz-item"><p class="exercise-label">' +
      esc(L.hubungan.tanya) +
      '</p>' +
      buildPilihTerkunci(
        OPSI_HUBUNGAN,
        State.latihanHubOrder,
        st,
        kunci,
        'data-hub-opt',
        'latihan',
        st.chosen ? L.hubungan.umpan[st.chosen] : ''
      ) +
      '</div>';
  }
  return (
    '<p class="hm-cerita">' +
    esc(L.cerita) +
    '</p>' +
    buildDataChips(L.anggota, L.data, L.satuan, L.nama) +
    isian +
    hub
  );
}

function renderOlahPola(container) {
  var D = DATA.olahPola;
  var L = D.latihan;
  var quizBenar = guidedQuizAllCorrect(D.pertanyaan, State.olahPilih);

  container.innerHTML =
    '<section aria-label="Olah Data Pola Hubungan">' +
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
            buildLatihan()
        )
      : '') +
    (quizBenar && latihanSelesai() ? buildDlNextButton('olahPolaNextBtn', D.nextLabel) : '') +
    '</section>';

  var rerender = rerenderDenganFokus(renderOlahPola, container);
  bindGuidedQuizList(container, D.pertanyaan, State.olahPilih, saveState, rerender);
  bindIsianBeruntun('lat-', State.latihanIsian, L.urutan, cfgLatihan, rerender);
  bindPilihAttr(
    container,
    'data-hub-opt',
    function () {
      return { st: State.latihanHub, kunci: hubunganRerataMedian(L.data) };
    },
    rerender
  );
  bindNext('olahPolaNextBtn', 'olahPola', 'olahMakna');
}

/* ============================================================
   9. STAGE: OLAH DATA — MEMILIH UKURAN  (sintaks 4b)
   Pertanyaan penuntun konteks → temuan → pemilahan.
   ============================================================ */

function renderOlahMakna(container) {
  var D = DATA.olahMakna;
  var quizBenar = guidedQuizAllCorrect(D.pertanyaan, State.olahPilih);
  var semuaPilah = quizBenar && sortItemsAllAnswered(D.pilah, State.pilahStates);

  container.innerHTML =
    '<section aria-label="Olah Data Memilih Ukuran">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
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
            buildSortItems(D.pilah, State.pilahOrder, OPSI_BENAR_SALAH, State.pilahStates)
        )
      : '') +
    (semuaPilah ? buildDlNextButton('olahMaknaNextBtn', D.nextLabel) : '') +
    '</section>';

  var rerender = rerenderDenganFokus(renderOlahMakna, container);
  bindGuidedQuizList(container, D.pertanyaan, State.olahPilih, saveState, rerender);
  bindSortItems(container, D.pilah, State.pilahStates, saveState, rerender);
  bindNext('olahMaknaNextBtn', 'olahMakna', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A: data baru acak (duga → hitung → cek dugaan → tafsir).
   B: tabungan tanpa pencilan + juru bicara. C: dugaan awal.
   ============================================================ */

function cfgVerif(b) {
  return function (j) {
    return cfgUkuran(b.data, j, b.satuan, LABEL_UKURAN[j] + ' ' + b.nama.toLowerCase() + ' = …');
  };
}

function verifSelesai(b) {
  return (
    !!State.verifDuga[b.id] &&
    semuaIsianSelesai(State.verifIsian[b.id], JENIS) &&
    State.verifJawab[b.id].chosen === b.tafsir.correct
  );
}

function cfgTanpa(j) {
  var S = DATA.stimulasi;
  return cfgUkuran(
    dataTanpaPencilan(),
    j,
    S.satuan,
    LABEL_UKURAN[j] + ' tabungan tanpa Dimas = …',
    j === 'median'
      ? ['Ada 8 data (genap). Urutkan, lalu rata-ratakan data ke-4 dan ke-5.']
      : ['Jumlah tabungan tanpa Dimas = 90 − 42.']
  );
}

function tanpaSelesai() {
  return semuaIsianSelesai(State.tanpaIsian, ['rerata', 'median']);
}

function bagianBSelesai() {
  return tanpaSelesai() && State.juruJawab.chosen === DATA.verifikasi.pilihJuru.correct;
}

function buildCekDuga(b) {
  var duga = State.verifDuga[b.id];
  var nyata = hubunganRerataMedian(b.data);
  var cocok = duga === nyata;
  return buildFeedbackBox(
    cocok ? 'success' : 'info',
    cocok ? '✓' : '↻',
    '<strong>' +
      (cocok ? 'Dugaanmu terbukti!' : 'Dugaanmu terkoreksi oleh perhitungan.') +
      '</strong> Mean ' +
      esc(fmt(rerataData(b.data))) +
      ', median ' +
      esc(fmt(medianData(b.data))) +
      ', modus ' +
      esc(teksModus(b.data)) +
      ' → ' +
      esc(TEKS_HUBUNGAN[nyata]) +
      ' (' +
      { simetris: 'data simetris', ekorKanan: 'ekor kanan', ekorKiri: 'ekor kiri' }[
        bentukSebaran(b.data)
      ] +
      ').'
  );
}

function buildDataVerif(b, nomor) {
  var kt = DATA.konteks[b.konteks];
  var duga = State.verifDuga[b.id];
  var isi = State.verifIsian[b.id];
  var hitungOk = semuaIsianSelesai(isi, JENIS);
  var jawab = State.verifJawab[b.id];
  var html =
    '<div class="hm-verif">' +
    '<p class="hm-verif__nama"><span class="dl-step__num">' +
    nomor +
    '</span><span aria-hidden="true">' +
    kt.ikon +
    '</span> ' +
    esc(b.nama) +
    '</p>' +
    '<p class="hm-cerita">' +
    esc(b.cerita) +
    '</p>' +
    buildDataChips(b.anggota, b.data, b.satuan, b.nama) +
    buildDiagram('vd-' + b.id, b.data, {
      max: b.max,
      penanda: hitungOk,
      label: b.nama,
    }) +
    '<div class="quiz-item"><p class="exercise-label">' +
    esc(DATA.verifikasi.dugaLabel) +
    '</p>' +
    buildChoiceGroup(
      OPSI_HUBUNGAN.map(function (o) {
        return { id: o.id, label: esc(o.label) };
      }),
      State.verifDugaOrders[b.id],
      { chosen: duga || null, group: b.id, attr: 'data-duga-opt', locked: hitungOk }
    ) +
    '</div>';
  if (duga) html += buildIsianBeruntun('vr-' + b.id + '-', isi, JENIS, cfgVerif(b));
  if (hitungOk) {
    html +=
      '<div style="margin-top:var(--space-3);">' +
      buildCekDuga(b) +
      '</div>' +
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
      '</div>';
  }
  return html + '</div>';
}

function buildTabelBanding() {
  var S = DATA.stimulasi;
  var tanpa = dataTanpaPencilan();
  return (
    '<div class="hm-table-wrap"><table class="hm-table">' +
    '<caption class="sr-only">Perbandingan ukuran sebelum dan sesudah tabungan Dimas dikeluarkan</caption>' +
    '<thead><tr><th scope="col">Ukuran</th><th scope="col">Dengan Dimas (9 data)</th>' +
    '<th scope="col">Tanpa Dimas (8 data)</th><th scope="col">Berubah</th></tr></thead><tbody>' +
    JENIS.map(function (j) {
      var a = j === 'modus' ? teksModus(S.data) : fmt(kunciUkuran(S.data, j));
      var b = j === 'modus' ? teksModus(tanpa) : fmt(kunciUkuran(tanpa, j));
      var selisih = Math.abs(kunciUkuran(S.data, j) - kunciUkuran(tanpa, j));
      return (
        '<tr><th scope="row">' +
        esc(LABEL_UKURAN[j]) +
        '</th><td>' +
        esc(a) +
        '</td><td>' +
        esc(b) +
        '</td><td>' +
        (selisih ? esc(fmt(selisih)) : 'tetap') +
        '</td></tr>'
      );
    }).join('') +
    '</tbody></table></div>'
  );
}

function buildBagianB() {
  var V = DATA.verifikasi;
  var S = DATA.stimulasi;
  var tanpa = dataTanpaPencilan();
  var nama = S.anggota.filter(function (n, i) {
    return S.data[i] !== S.pencilan;
  });
  var html =
    '<p class="exercise-label">' +
    esc(V.tanpaLabel) +
    '</p>' +
    buildDataChips(nama, tanpa, S.satuan, V.tanpaLabel) +
    buildIsianBeruntun('tp-', State.tanpaIsian, ['rerata', 'median'], cfgTanpa);
  if (tanpaSelesai()) {
    var st = State.juruJawab;
    html +=
      buildTabelBanding() +
      '<div class="quiz-item"><p class="exercise-label">' +
      esc(V.pilihJuru.tanya) +
      '</p>' +
      buildPilihTerkunci(
        V.pilihJuru.opsi,
        State.juruOrder,
        st,
        V.pilihJuru.correct,
        'data-juru-opt',
        'juru',
        st.chosen ? V.pilihJuru.umpan[st.chosen] : ''
      ) +
      '</div>';
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

function cariVerif(id) {
  return VERIF_DATA.filter(function (x) {
    return x.id === id;
  })[0];
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var dataHTML = '';
  for (var i = 0; i < VERIF_DATA.length; i++) {
    dataHTML += buildDataVerif(VERIF_DATA[i], i + 1);
    if (!verifSelesai(VERIF_DATA[i])) break;
  }
  var selesaiA = VERIF_DATA.every(verifSelesai);
  var selesaiB = selesaiA && bagianBSelesai();

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
            buildBagianB()
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
    bindIsianBeruntun('vr-' + b.id + '-', State.verifIsian[b.id], JENIS, cfgVerif(b), rerender);
  });
  bindIsianBeruntun('tp-', State.tanpaIsian, ['rerata', 'median'], cfgTanpa, rerender);

  container.querySelectorAll('[data-duga-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var b = cariVerif(btn.dataset.group);
      if (!b || semuaIsianSelesai(State.verifIsian[b.id], JENIS)) return;
      State.verifDuga[b.id] = btn.dataset.dugaOpt;
      saveState();
      rerender();
    });
  });
  bindPilihAttr(
    container,
    'data-tafsir-opt',
    function (id) {
      var b = cariVerif(id);
      return b ? { st: State.verifJawab[b.id], kunci: b.tafsir.correct } : null;
    },
    rerender
  );
  bindPilihAttr(
    container,
    'data-juru-opt',
    function () {
      return { st: State.juruJawab, kunci: D.pilihJuru.correct };
    },
    rerender
  );
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

/* Tiga sketsa bentuk data dari contoh misi lab. */
function buildSketsaBentuk() {
  var judul = {
    sama: 'Simetris',
    rerataLebih: 'Ekor kanan',
    rerataKurang: 'Ekor kiri',
  };
  return (
    '<div class="hm-sketsa">' +
    LAB.misi
      .filter(function (m) {
        return judul[m.jenis];
      })
      .map(function (m) {
        return (
          '<figure class="hm-sketsa__item"><figcaption>' +
          esc(judul[m.jenis]) +
          ' · ' +
          esc(TEKS_HUBUNGAN[hubunganRerataMedian(m.contoh)]) +
          '</figcaption>' +
          buildDiagram('sk-' + m.id, m.contoh, {
            min: LAB.min,
            max: LAB.max,
            label: judul[m.jenis],
          }) +
          '</figure>'
        );
      })
      .join('') +
    '</div>'
  );
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali misi di Lab Geser Data dan pembuktianmu, lalu pilih potongan lain.</p>'
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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah hubungan mean, median, dan modus yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman</h3>' +
            buildSketsaBentuk() +
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
   'hitung'      : isian; kunci kunciUkuran, diagnosa diagnosaUkuran.
   'pilihUkuran' : opsi opsiUkuran; umpan pesanUkuran.
   'hubungan'    : opsi OPSI_HUBUNGAN; kunci hubunganRerataMedian.
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
    '<div class="hm-bahas">' +
    '<p class="hm-bahas__judul">Pembahasan</p>' +
    '<p>' +
    esc(s.pembahasan) +
    '</p>' +
    '</div>'
  );
}

function cfgSoalIsian(s) {
  var cfg = cfgUkuran(s.data, s.jenis, s.satuan, s.tanya, s.hints);
  cfg.pesanBenar = 'Tepat!';
  return cfg;
}

function umpanHubungan(s, pilih) {
  var kunci = hubunganRerataMedian(s.data);
  if (pilih === kunci) {
    return (
      'Tepat! Mean ' +
      fmt(rerataData(s.data)) +
      ' dan median ' +
      fmt(medianData(s.data)) +
      ', jadi ' +
      TEKS_HUBUNGAN[kunci] +
      '.'
    );
  }
  if (pilih === 'tidakTentu') {
    return 'Hubungannya dapat ditentukan: hitung mean dan median, lalu bandingkan.';
  }
  return 'Perhatikan di sisi mana ada nilai yang menjauh, atau hitung mean dan median lalu bandingkan.';
}

function umpanPilihan(s, ex) {
  if (s.tipe === 'pilih') return esc(s.umpan[ex.chosen]);
  if (s.tipe === 'hubungan') return esc(umpanHubungan(s, ex.chosen));
  var kode = ex.chosen.indexOf('dekat') === 0 ? 'lain' : ex.chosen;
  return esc(pesanUkuran(kode, s.data, s.jenis, s.satuan));
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
    (s.tipe === 'hubungan'
      ? buildDiagram('soal-diagram', s.data, {
          max: Math.max.apply(null, s.data) + 1,
          penanda: benar,
          label: 'Diagram titik data soal',
        })
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
    var cls = 'hm-dot';
    if (soalSelesai(x, st)) cls += ' hm-dot--done';
    if (i === idx) cls += ' hm-dot--aktif';
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

  var isi = soalIsian(s)
    ? buildIsian('soal', ex, cfgSoalIsian(s)) + (selesaiIni ? buildPembahasan(s) : '')
    : buildSoalPilih(s, ex);

  container.innerHTML =
    '<section aria-label="Uji Terap">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    '<nav class="hm-dots" aria-label="Pilih soal">' +
    titik +
    '</nav>' +
    buildDlPanel(
      '<p class="hm-kasus">Soal ' +
        (idx + 1) +
        ' dari ' +
        TERAP_SOAL.length +
        ' · <span aria-hidden="true">' +
        kt.ikon +
        '</span> ' +
        esc(kt.nama) +
        '</p>' +
        '<p class="hm-cerita">' +
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
  var isian = DATA.olahPola.latihan.urutan.map(function (j) {
    return State.latihanIsian[j];
  });
  VERIF_DATA.forEach(function (b) {
    JENIS.forEach(function (j) {
      isian.push(State.verifIsian[b.id][j]);
    });
  });
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
        kartu(
          isianBenar + '/' + isian.length,
          'Isian mean, median & modus benar pada percobaan pertama'
        ) +
        kartu(pilahBenar + '/' + pilah.length, 'Pernyataan hubungan dipilah benar') +
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
    buildIstilahGrid(DATA.olahPola.temuan.concat(DATA.olahMakna.temuan)) +
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
    'Kemampuan murid menjelaskan ALASAN memilih mean, median, atau modus pada data nyata di kelas tetap menjadi bahan penilaian utama dan jembatan menuju ukuran penyebaran data.' +
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
  olahPola: renderOlahPola,
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
