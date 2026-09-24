'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Membaca & Menulis Pecahan Biasa dan Pecahan Campuran
   Fase D — SMP Kelas 7

   Utilitas bersama (esc, shuffleArray, showNotice, buildFeedbackBox,
   buildProgressDots, createStageMachine, createStore, komponen
   pilihan/pemilahan, serta komponen pecahan: buildFracBlock,
   buildFracInline, bacaPecahan, buildFractionModel,
   buildFractionInput/readFractionInput) berada di shared/engine.js.

   Alur tahap mengikuti fase Direct Instruction; lihat komentar
   kepala pada data.js untuk pemetaannya.

   Seluruh pilihan jawaban DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder()/ensureSortStates(). Pengacakan dilakukan
   SEKALI saat state disiapkan (initExerciseArrays), lalu urutannya
   disimpan di State — bukan saat render. Dengan begitu pilihan tidak
   melompat-lompat setiap kali tahap dirender ulang, tetapi teracak
   ulang untuk setiap murid dan setiap kali Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render (papan demonstrasi, laboratorium pecahan,
       diagnosis isian pecahan)
    5. Stage: Orientasi             (DI fase 1)
    6. Stage: Demo Pecahan Biasa    (DI fase 2)
    7. Stage: Demo Pecahan Campuran (DI fase 2)
    8. Stage: Bimbing Baca          (DI fase 3)
    9. Stage: Bimbing Tulis         (DI fase 3)
   10. Stage: Cek Pemahaman         (DI fase 4)
   11. Stage: Latihan Mandiri       (DI fase 5)
   12. Stage: Refleksi
   13. Stage: Selesai
   14. Router Render
   15. Helper UI (modal reset)
   16. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'demoBiasa',
  'demoCampuran',
  'bimbingBaca',
  'bimbingTulis',
  'cekPaham',
  'mandiri',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Orientasi',
  'Demo Biasa',
  'Demo Campuran',
  'Bimbing Baca',
  'Bimbing Tulis',
  'Cek Paham',
  'Mandiri',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-d-1-3-pecahan-di-v1';

/* Butir pemilahan "baku atau keliru" pada demo pecahan campuran. */
var KELIRU_ITEMS = DATA.demoCampuran.keliru.map(function (k) {
  return {
    id: k.id,
    teks: '<span class="keliru-notasi">' + k.tulis + '</span>',
    correct: k.baku ? 'baku' : 'keliru',
    explanation: k.alasan,
  };
});

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Tahap 1 — orientasi */
  orientasiOrder: null,
  orientasiPilih: null,

  /* Tahap 2 — demo pecahan biasa */
  biasaStep: 0,
  biasaLab: null,
  biasaCoba: [],

  /* Tahap 3 — demo pecahan campuran */
  campuranStep: 0,
  campuranLab: null,
  campuranCoba: [],
  keliruStates: {},
  keliruOrder: null,

  /* Tahap 4 — bimbing baca */
  bacaOrders: {},
  bacaPilih: {},
  bacaPertama: {},

  /* Tahap 5 — bimbing tulis */
  tulisStates: [],

  /* Tahap 6 — cek pemahaman */
  cekStates: {},
  cekOrder: null,

  /* Tahap 7 — latihan mandiri */
  mandiriIdx: 0,
  mandiriStates: [],

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

function ensureObject(key) {
  if (!State[key] || typeof State[key] !== 'object' || Array.isArray(State[key])) State[key] = {};
}

function ensureArray(key) {
  if (!Array.isArray(State[key])) State[key] = [];
}

function makeTulisState() {
  return { raw: {}, attempts: 0, hintLevel: 0, correct: false, revealed: false, pesan: '' };
}

/*
 * Menyiapkan seluruh array state per-soal DAN seluruh urutan acak
 * pilihan jawaban. Dipanggil sekali saat init (setelah loadState) dan
 * setiap kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1 */
  ensureShuffledOrder(State, 'orientasiOrder', DATA.orientasi.apersepsi.opsi);

  /* Tahap 2–3 — laboratorium pecahan */
  var LB = DATA.demoBiasa.lab;
  if (!State.biasaLab || typeof State.biasaLab.den !== 'number') {
    State.biasaLab = { num: LB.start.num, den: LB.start.den };
  }
  var LC = DATA.demoCampuran.lab;
  if (!State.campuranLab || typeof State.campuranLab.den !== 'number') {
    State.campuranLab = { whole: LC.start.whole, num: LC.start.num, den: LC.start.den };
  }
  ensureArray('biasaCoba');
  ensureArray('campuranCoba');
  ensureSortStates(
    State,
    'keliruStates',
    'keliruOrder',
    KELIRU_ITEMS,
    DATA.demoCampuran.keliruOpsi
  );

  /* Tahap 4 */
  ensureObject('bacaOrders');
  ensureObject('bacaPilih');
  ensureObject('bacaPertama');
  DATA.bimbingBaca.soal.forEach(function (q) {
    ensureShuffledOrder(State.bacaOrders, q.id, q.opsi);
  });

  /* Tahap 5 */
  ensureExerciseArray(State, 'tulisStates', DATA.bimbingTulis.soal, makeTulisState);

  /* Tahap 6 */
  ensureSortStates(State, 'cekStates', 'cekOrder', DATA.cekPaham.pernyataan, DATA.cekPaham.opsi);

  /* Tahap 7 */
  ensureExerciseArray(State, 'mandiriStates', DATA.mandiri.soal, function (s) {
    return {
      raw: {},
      attempts: 0,
      chosen: null,
      correct: false,
      done: false,
      pesan: '',
      optionOrder: s.opsi ? shuffleArray(optionIds(s.opsi)) : null,
    };
  });
  if (
    typeof State.mandiriIdx !== 'number' ||
    State.mandiriIdx < 0 ||
    State.mandiriIdx >= DATA.mandiri.soal.length
  ) {
    State.mandiriIdx = 0;
  }

  /* Tahap 8 */
  ensureObject('refleksiAnswers');
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

/* Kotak umpan balik pilihan (benar → success, salah → warning). */
function buildUmpan(chosen, benar, umpan) {
  if (!chosen) return '';
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(benar ? 'success' : 'warning', benar ? '✓' : '💭', umpan[chosen]) +
    '</div>'
  );
}

function kunciPecahan(f) {
  return (f.whole || 0) + ':' + f.num + '/' + f.den;
}

/* Mencatat pecahan yang sudah dicoba di laboratorium (tanpa duplikat). */
function catatCoba(key, f) {
  var k = kunciPecahan(f);
  if (State[key].indexOf(k) === -1) State[key].push(k);
}

/*
 * Papan demonstrasi: pecahan beranotasi (bilangan bulat / pembilang /
 * garis pecahan / penyebut) yang muncul bertahap sesuai langkah yang
 * sudah dibuka guru.
 *   f      { whole?, num, den }
 *   tampil daftar bagian yang terlihat: 'whole', 'num', 'den', 'line', 'baca'
 */
function buildPapan(f, tampil) {
  function on(part) {
    return tampil.indexOf(part) !== -1;
  }
  function slot(part, val, cls) {
    return (
      '<span class="papan__' +
      cls +
      (on(part) ? '' : ' is-empty') +
      '">' +
      (on(part) ? esc(String(val)) : '?') +
      '</span>'
    );
  }
  var campuran = f.whole != null;
  return (
    '<div class="papan" aria-live="polite">' +
    '<div class="papan__notasi">' +
    (campuran
      ? '<div class="papan__whole-col">' +
        slot('whole', f.whole, 'whole') +
        '<span class="papan__tag papan__tag--whole' +
        (on('whole') ? '' : ' is-hidden') +
        '">bilangan bulat</span>' +
        '</div>'
      : '') +
    '<div class="papan__stack">' +
    '<div class="papan__row">' +
    slot('num', f.num, 'num') +
    '<span class="papan__tag papan__tag--num' +
    (on('num') ? '' : ' is-hidden') +
    '">← pembilang</span>' +
    '</div>' +
    '<div class="papan__row">' +
    '<span class="papan__line' +
    (on('line') ? '' : ' is-dashed') +
    '"></span>' +
    '<span class="papan__tag' +
    (on('line') ? '' : ' is-hidden') +
    '">← garis pecahan</span>' +
    '</div>' +
    '<div class="papan__row">' +
    slot('den', f.den, 'den') +
    '<span class="papan__tag papan__tag--den' +
    (on('den') ? '' : ' is-hidden') +
    '">← penyebut</span>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<p class="papan__baca' +
    (on('baca') ? '' : ' is-hidden') +
    '">Dibaca: <strong>"' +
    esc(bacaPecahan(f.num, f.den, f.whole)) +
    '"</strong></p>' +
    '</div>'
  );
}

/* Bagian papan yang terlihat setelah `step` langkah dibuka. */
function bagianTerlihat(langkah, step) {
  var map = {
    whole: ['whole'],
    den: ['den'],
    num: ['num'],
    frac: ['num', 'den'],
    full: ['line'],
    baca: ['baca'],
  };
  var out = [];
  for (var i = 0; i < step && i < langkah.length; i++) {
    out = out.concat(map[langkah[i].tampil] || []);
  }
  return out;
}

/*
 * Daftar langkah demonstrasi: langkah yang sudah dibuka tampil penuh,
 * langkah berikutnya dibuka dengan satu tombol.
 */
var LANGKAH_TERAKHIR = {};

function buildLangkah(langkah, step, btnId) {
  /* Animasi hanya untuk langkah yang baru dibuka, bukan setiap render ulang. */
  var baru = LANGKAH_TERAKHIR[btnId] !== undefined && LANGKAH_TERAKHIR[btnId] < step;
  LANGKAH_TERAKHIR[btnId] = step;
  var list = langkah
    .slice(0, step)
    .map(function (l, i) {
      return (
        '<li class="langkah__item' +
        (baru && i === step - 1 ? ' is-new' : '') +
        '">' +
        '<span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        '<div><strong class="langkah__judul">' +
        esc(l.judul) +
        '</strong><p class="langkah__teks">' +
        l.teks +
        '</p></div>' +
        '</li>'
      );
    })
    .join('');
  return (
    (list ? '<ol class="langkah">' + list + '</ol>' : '') +
    (step < langkah.length
      ? '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary" id="' +
        btnId +
        '">' +
        (step === 0 ? '▶ Mulai Demonstrasi' : '▶ Langkah ' + (step + 1)) +
        '</button>' +
        '<span class="dl-caption" style="align-self:center;">Langkah ' +
        step +
        ' dari ' +
        langkah.length +
        ' dibuka</span>' +
        '</div>'
      : '')
  );
}

/* Satu pengatur angka (− nilai +) di laboratorium pecahan. */
function buildStepper(field, label, value, min, max) {
  return (
    '<div class="stepper">' +
    '<span class="stepper__label" id="lbl-' +
    field +
    '">' +
    esc(label) +
    '</span>' +
    '<div class="stepper__ctrl" role="group" aria-labelledby="lbl-' +
    field +
    '">' +
    '<button type="button" class="stepper__btn" data-lab="' +
    field +
    '" data-delta="-1" aria-label="Kurangi ' +
    esc(label) +
    '"' +
    (value <= min ? ' disabled' : '') +
    '>−</button>' +
    '<output class="stepper__val" aria-live="polite">' +
    value +
    '</output>' +
    '<button type="button" class="stepper__btn" data-lab="' +
    field +
    '" data-delta="1" aria-label="Tambah ' +
    esc(label) +
    '"' +
    (value >= max ? ' disabled' : '') +
    '>+</button>' +
    '</div>' +
    '</div>'
  );
}

/* Hasil laboratorium: model visual, notasi baku, dan cara bacanya. */
function buildLabHasil(f, shape) {
  return (
    '<div class="lab__hasil">' +
    buildFractionModel(f.num, f.den, f.whole, { shape: shape, small: true }) +
    '<div class="lab__notasi">' +
    buildFracBlock(f.num, f.den, f.whole, 'hero') +
    '<p class="lab__baca">"' +
    esc(bacaPecahan(f.num, f.den, f.whole)) +
    '"</p>' +
    '</div>' +
    '</div>'
  );
}

function buildLabProgress(n, min) {
  var cukup = n >= min;
  return (
    '<p class="lab__coba' +
    (cukup ? ' is-cukup' : '') +
    '">' +
    (cukup ? '✓ ' : '') +
    'Pecahan yang sudah dicoba: <strong>' +
    Math.min(n, min) +
    '/' +
    min +
    '</strong></p>'
  );
}

/* Target isian pecahan dari data (whole null → pecahan biasa). */
function samaPersis(v, t) {
  return v.whole === t.whole && v.num === t.num && v.den === t.den;
}

/*
 * Mendiagnosis isian pecahan terhadap target dan memberi umpan balik
 * yang menunjuk letak kesalahannya (bukan sekadar "salah").
 */
function diagnosaTulis(v, t) {
  if (samaPersis(v, t)) return { ok: true, pesan: '' };
  if (v.whole === 0) {
    return {
      ok: false,
      pesan: 'Angka 0 tidak perlu ditulis. Kosongkan kotak bulat bila tidak ada bilangan bulat.',
    };
  }
  if (t.whole === null && v.whole !== null) {
    return {
      ok: false,
      pesan: 'Ini pecahan biasa — tidak ada bilangan bulat. Kosongkan kotak bulat.',
    };
  }
  if (t.whole !== null && v.whole === null) {
    return {
      ok: false,
      pesan:
        'Ini pecahan campuran. Jangan lupa menulis bilangan bulatnya di kotak bulat (kata pertama yang dibaca / bangun yang utuh).',
    };
  }
  if (v.num === t.den && v.den === t.num) {
    return {
      ok: false,
      pesan: 'Pembilang dan penyebut tertukar. Pembilang ditulis di atas garis, penyebut di bawah.',
    };
  }
  if (v.whole !== null && v.num >= v.den) {
    return {
      ok: false,
      pesan: 'Pada pecahan campuran baku, pembilang harus lebih kecil dari penyebut.',
    };
  }
  if (v.whole !== t.whole) {
    return { ok: false, pesan: 'Periksa lagi bilangan bulatnya.' };
  }
  if (v.den !== t.den) {
    return {
      ok: false,
      pesan: 'Periksa lagi penyebutnya (banyak seluruh bagian yang sama besar).',
    };
  }
  return { ok: false, pesan: 'Periksa lagi pembilangnya (banyak bagian yang diambil/diarsir).' };
}

function pesanInputPecahan(error) {
  if (error === 'empty') return 'Isi pembilang dan penyebut lebih dulu.';
  if (error === 'zero-den') return 'Penyebut tidak boleh 0.';
  return 'Isi kotak hanya dengan angka (bilangan cacah).';
}

/* Pecahan target sebagai notasi bersusun. */
function fracTarget(t, size) {
  return buildFracBlock(t.num, t.den, t.whole, size);
}

/* ============================================================
   5. STAGE: ORIENTASI (DI fase 1)
   ============================================================ */

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var A = D.apersepsi;
  var chosen = State.orientasiPilih;
  var benar = chosen === A.correct;

  container.innerHTML =
    '<section aria-label="Orientasi">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="orientasi-hero">' +
        '<span class="orientasi-hero__icon" aria-hidden="true">' +
        D.ikon +
        '</span>' +
        '<div>' +
        '<h2 class="orientasi-hero__title">' +
        esc(D.judul) +
        '</h2>' +
        '<p style="margin:0;">' +
        esc(D.cerita) +
        '</p>' +
        '</div>' +
        '</div>' +
        buildFractionModel(D.model.num, D.model.den, 0, {
          shape: D.model.shape,
          caption: esc(D.model.caption),
          aria: 'Martabak dibagi 8 potong sama besar, 3 potong berwarna',
        }),
      'panel--hero'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🎯 Setelah belajar hari ini, kamu dapat:</h3>' +
        '<ol class="objectives-list">' +
        D.tujuan
          .map(function (t, i) {
            return '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + t + '</li>';
          })
          .join('') +
        '</ol>'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(A.tanya) +
        '</p>' +
        buildChoiceGroup(A.opsi, State.orientasiOrder, {
          chosen: chosen,
          correctId: benar ? A.correct : null,
          grade: true,
          locked: benar,
        }) +
        buildUmpan(chosen, benar, A.umpan)
    ) +
    (benar
      ? buildDlPanel(
          '<p style="margin-top:0;"><strong>' +
            esc(D.manfaatJudul) +
            '</strong></p>' +
            '<div class="manfaat-grid">' +
            D.manfaat
              .map(function (m) {
                return (
                  '<div class="manfaat-card"><span class="manfaat-card__icon" aria-hidden="true">' +
                  m.ikon +
                  '</span><span>' +
                  m.teks +
                  '</span></div>'
                );
              })
              .join('') +
            '</div>',
          'panel--info'
        ) + buildDlNextButton('orientasiNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.orientasiPilih === A.correct) return;
      State.orientasiPilih = btn.dataset.optId;
      saveState();
      renderOrientasi(container);
    });
  });

  bindNext('orientasiNextBtn', 'orientasi', 'demoBiasa');
}

/* ============================================================
   6. STAGE: DEMO PECAHAN BIASA (DI fase 2)
   ============================================================ */

function renderDemoBiasa(container) {
  var D = DATA.demoBiasa;
  var L = D.lab;
  var step = State.biasaStep;
  var lab = State.biasaLab;
  var demoSelesai = step >= D.langkah.length;
  var labSelesai = State.biasaCoba.length >= L.minCoba;

  container.innerHTML =
    '<section aria-label="Demonstrasi Pecahan Biasa">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">👀 Perhatikan: menulis & membaca ' +
        buildFracInline(D.contoh.num, D.contoh.den) +
        '</h3>' +
        '<div class="demo-grid">' +
        '<div>' +
        buildFractionModel(D.contoh.num, D.contoh.den, 0, {
          shape: 'circle',
          caption: 'Martabak Pak Udin: 3 dari 8 potong',
        }) +
        buildPapan(D.contoh, bagianTerlihat(D.langkah, step)) +
        '</div>' +
        '<div>' +
        buildLangkah(D.langkah, step, 'biasaStepBtn') +
        '</div>' +
        '</div>',
      'panel--hero'
    ) +
    (demoSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🧪 ' +
            esc(L.judul) +
            '</h3>' +
            '<p>' +
            esc(L.instruksi) +
            '</p>' +
            '<div class="lab">' +
            '<div class="lab__ctrl">' +
            buildStepper('num', 'Pembilang', lab.num, 1, lab.den * 2) +
            buildStepper('den', 'Penyebut', lab.den, L.denMin, L.denMax) +
            '</div>' +
            buildLabHasil(lab, 'circle') +
            '</div>' +
            buildLabProgress(State.biasaCoba.length, L.minCoba)
        ) +
        buildDlPanel(
          '<h3 style="margin-top:0;">📌 Catatan notasi baku</h3>' +
            '<ul class="catatan-list">' +
            D.catatan
              .map(function (c) {
                return '<li>' + c + '</li>';
              })
              .join('') +
            '</ul>',
          'panel--info'
        ) +
        (labSelesai ? buildDlNextButton('biasaNextBtn', D.nextLabel, true) : '')
      : '') +
    '</section>';

  var stepBtn = document.getElementById('biasaStepBtn');
  if (stepBtn) {
    stepBtn.addEventListener('click', function () {
      State.biasaStep = Math.min(D.langkah.length, State.biasaStep + 1);
      saveState();
      renderDemoBiasa(container);
      var again = document.getElementById('biasaStepBtn');
      if (again) again.focus();
    });
  }

  container.querySelectorAll('[data-lab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var field = btn.dataset.lab;
      var delta = parseInt(btn.dataset.delta, 10);
      var f = State.biasaLab;
      if (field === 'den') {
        f.den = Math.max(L.denMin, Math.min(L.denMax, f.den + delta));
        f.num = Math.min(f.num, f.den * 2);
      } else {
        f.num = Math.max(1, Math.min(f.den * 2, f.num + delta));
      }
      catatCoba('biasaCoba', f);
      saveState();
      renderDemoBiasa(container);
      var same = container.querySelector('[data-lab="' + field + '"][data-delta="' + delta + '"]');
      if (same && !same.disabled) same.focus();
    });
  });

  bindNext('biasaNextBtn', 'demoBiasa', 'demoCampuran');
}

/* ============================================================
   7. STAGE: DEMO PECAHAN CAMPURAN (DI fase 2)
   ============================================================ */

function renderDemoCampuran(container) {
  var D = DATA.demoCampuran;
  var L = D.lab;
  var step = State.campuranStep;
  var lab = State.campuranLab;
  var demoSelesai = step >= D.langkah.length;
  var labSelesai = State.campuranCoba.length >= L.minCoba;
  var keliruSelesai = sortItemsAllAnswered(KELIRU_ITEMS, State.keliruStates);

  container.innerHTML =
    '<section aria-label="Demonstrasi Pecahan Campuran">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">👀 Perhatikan: menulis & membaca ' +
        buildFracInline(D.contoh.num, D.contoh.den, D.contoh.whole) +
        '</h3>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<div class="demo-grid">' +
        '<div>' +
        buildFractionModel(D.contoh.num, D.contoh.den, D.contoh.whole, {
          shape: 'circle',
          small: true,
          caption: '2 loyang utuh dan 3 dari 4 potong',
        }) +
        buildPapan(D.contoh, bagianTerlihat(D.langkah, step)) +
        '</div>' +
        '<div>' +
        buildLangkah(D.langkah, step, 'campuranStepBtn') +
        '</div>' +
        '</div>',
      'panel--hero'
    ) +
    (demoSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🧪 ' +
            esc(L.judul) +
            '</h3>' +
            '<p>' +
            esc(L.instruksi) +
            '</p>' +
            '<div class="lab">' +
            '<div class="lab__ctrl">' +
            buildStepper('whole', 'Bilangan bulat', lab.whole, 1, L.wholeMax) +
            buildStepper('num', 'Pembilang', lab.num, 1, lab.den - 1) +
            buildStepper('den', 'Penyebut', lab.den, L.denMin, L.denMax) +
            '</div>' +
            buildLabHasil(lab, 'bar') +
            '</div>' +
            buildLabProgress(State.campuranCoba.length, L.minCoba)
        ) +
        (labSelesai
          ? buildDlPanel(
              '<h3 style="margin-top:0;">🔍 ' +
                esc(D.keliruJudul) +
                '</h3>' +
                '<p>' +
                esc(D.keliruInstruksi) +
                '</p>' +
                buildSortItems(KELIRU_ITEMS, State.keliruOrder, D.keliruOpsi, State.keliruStates)
            ) + (keliruSelesai ? buildDlNextButton('campuranNextBtn', D.nextLabel, true) : '')
          : '')
      : '') +
    '</section>';

  var stepBtn = document.getElementById('campuranStepBtn');
  if (stepBtn) {
    stepBtn.addEventListener('click', function () {
      State.campuranStep = Math.min(D.langkah.length, State.campuranStep + 1);
      saveState();
      renderDemoCampuran(container);
      var again = document.getElementById('campuranStepBtn');
      if (again) again.focus();
    });
  }

  container.querySelectorAll('[data-lab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var field = btn.dataset.lab;
      var delta = parseInt(btn.dataset.delta, 10);
      var f = State.campuranLab;
      if (field === 'whole') {
        f.whole = Math.max(1, Math.min(L.wholeMax, f.whole + delta));
      } else if (field === 'den') {
        f.den = Math.max(L.denMin, Math.min(L.denMax, f.den + delta));
        f.num = Math.min(f.num, f.den - 1);
      } else {
        f.num = Math.max(1, Math.min(f.den - 1, f.num + delta));
      }
      catatCoba('campuranCoba', f);
      saveState();
      renderDemoCampuran(container);
      var same = container.querySelector('[data-lab="' + field + '"][data-delta="' + delta + '"]');
      if (same && !same.disabled) same.focus();
    });
  });

  bindSortItems(container, KELIRU_ITEMS, State.keliruStates, saveState, function () {
    renderDemoCampuran(container);
  });

  bindNext('campuranNextBtn', 'demoCampuran', 'bimbingBaca');
}

/* ============================================================
   8. STAGE: BIMBING BACA (DI fase 3)
   Boleh dicoba lagi sampai benar; pilihan pertama dicatat untuk
   rekap di tahap Refleksi.
   ============================================================ */

function renderBimbingBaca(container) {
  var D = DATA.bimbingBaca;
  var semuaBenar = D.soal.every(function (q) {
    return State.bacaPilih[q.id] === q.correct;
  });

  var soalHTML = D.soal
    .map(function (q, i) {
      var chosen = State.bacaPilih[q.id] || null;
      var benar = chosen === q.correct;
      var f = q.frac;
      return (
        '<div class="quiz-item' +
        (benar ? ' is-done' : '') +
        '">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>Bagaimana cara baku membaca pecahan ini?</p>' +
        '<div class="quiz-item__show">' +
        '<span class="quiz-item__frac">' +
        buildFracBlock(f.num, f.den, f.whole != null ? f.whole : null, 'hero') +
        '</span>' +
        (q.model
          ? buildFractionModel(f.num, f.den, f.whole || 0, { shape: q.model, small: true })
          : '') +
        '</div>' +
        buildChoiceGroup(q.opsi, State.bacaOrders[q.id], {
          chosen: chosen,
          correctId: benar ? q.correct : null,
          grade: true,
          locked: benar,
          group: q.id,
          attr: 'data-q-opt',
        }) +
        buildUmpan(chosen, benar, q.umpan) +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Latihan Terbimbing Membaca">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">🗣️ ' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel(soalHTML) +
    (semuaBenar
      ? buildFeedbackBox(
          'success',
          '✓',
          '<strong>Semua pecahan sudah dibaca dengan baku.</strong> Ingat polanya: (bilangan bulat) – pembilang – "per" – penyebut.'
        ) + buildDlNextButton('bacaNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  var byId = {};
  D.soal.forEach(function (q) {
    byId[q.id] = q;
  });
  container.querySelectorAll('[data-q-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var q = byId[btn.dataset.group];
      if (!q || State.bacaPilih[q.id] === q.correct) return;
      State.bacaPilih[q.id] = btn.dataset.qOpt;
      if (!State.bacaPertama[q.id]) State.bacaPertama[q.id] = btn.dataset.qOpt;
      saveState();
      renderBimbingBaca(container);
    });
  });

  bindNext('bacaNextBtn', 'bimbingBaca', 'bimbingTulis');
}

/* ============================================================
   9. STAGE: BIMBING TULIS (DI fase 3)
   Kotak isian bersusun + petunjuk berjenjang; jawaban boleh dibuka
   setelah beberapa percobaan.
   ============================================================ */

function renderBimbingTulis(container) {
  var D = DATA.bimbingTulis;
  var states = State.tulisStates;
  var semuaSelesai = states.every(function (st) {
    return st.correct || st.revealed;
  });

  var soalHTML = D.soal
    .map(function (s, i) {
      var st = states[i];
      var selesai = st.correct || st.revealed;
      var id = 'tl' + i;
      var status = st.correct ? 'ok' : st.pesan && !st.revealed ? 'bad' : '';
      var nilai = st.revealed
        ? {
            whole: s.jawab.whole != null ? String(s.jawab.whole) : '',
            num: String(s.jawab.num),
            den: String(s.jawab.den),
          }
        : st.raw;
      var feedback = '';
      if (st.correct) {
        feedback = buildFeedbackBox(
          'success',
          '✓',
          '<strong>Tepat!</strong> ' +
            fracTarget(s.jawab, 'small') +
            ' dibaca "' +
            esc(bacaPecahan(s.jawab.num, s.jawab.den, s.jawab.whole)) +
            '".'
        );
      } else if (st.revealed) {
        feedback = buildFeedbackBox(
          'info',
          '👀',
          '<strong>Jawaban:</strong> ' +
            fracTarget(s.jawab, 'small') +
            ', dibaca "' +
            esc(bacaPecahan(s.jawab.num, s.jawab.den, s.jawab.whole)) +
            '". Perhatikan letak setiap angkanya.'
        );
      } else if (st.pesan) {
        feedback = buildFeedbackBox('error', '✗', '<strong>Belum tepat.</strong> ' + esc(st.pesan));
      }

      return (
        '<div class="tulis-item' +
        (selesai ? ' is-done' : '') +
        '" data-tulis="' +
        i +
        '">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        (s.model
          ? esc(s.teks)
          : 'Tuliskan: <strong class="tulis-item__baca">' + esc(s.teks) + '</strong>') +
        '</p>' +
        (s.model
          ? buildFractionModel(s.model.num, s.model.den, s.model.whole || 0, {
              shape: s.model.shape,
              small: true,
            })
          : '') +
        '<div class="tulis-item__row">' +
        buildFractionInput(id, nilai, {
          mixed: true,
          disabled: selesai,
          status: st.revealed ? '' : status,
          aria: 'Soal ' + (i + 1),
        }) +
        (selesai
          ? ''
          : '<div class="btn-group">' +
            '<button type="button" class="btn btn--primary btn--small" data-cek="' +
            i +
            '">Periksa</button>' +
            buildHintToggle(id + 'Hint', s.hints, st.hintLevel).replace(
              '<button ',
              '<button data-hint="' + i + '" '
            ) +
            (st.attempts >= D.revealSetelah
              ? '<button type="button" class="btn btn--ghost btn--small" data-reveal="' +
                i +
                '">Lihat jawaban</button>'
              : '') +
            '</div>') +
        '</div>' +
        (selesai ? '' : buildHintStack(s.hints, st.hintLevel)) +
        (feedback ? '<div style="margin-top:var(--space-3);">' + feedback + '</div>' : '') +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Latihan Terbimbing Menulis">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="tulis-intro">' +
        '<p style="margin:0;">✍️ ' +
        esc(D.instruksi) +
        '</p>' +
        buildFractionInput(
          'contohIsian',
          { whole: '2', num: '3', den: '4' },
          {
            mixed: true,
            disabled: true,
            aria: 'Contoh isian dua tiga per empat',
          }
        ) +
        '</div>',
      'panel--info'
    ) +
    buildDlPanel(soalHTML) +
    (semuaSelesai
      ? buildFeedbackBox(
          'success',
          '✓',
          '<strong>Latihan terbimbing selesai.</strong> Kamu sudah menulis pecahan biasa dan pecahan campuran sesuai notasi baku.'
        ) + buildDlNextButton('tulisNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  function periksa(i) {
    var s = D.soal[i];
    var st = states[i];
    var hasil = readFractionInput(container, 'tl' + i);
    st.raw = hasil.raw;
    if (hasil.error) {
      saveState();
      showNotice(pesanInputPecahan(hasil.error));
      return;
    }
    var d = diagnosaTulis(hasil.value, s.jawab);
    st.attempts++;
    st.correct = d.ok;
    st.pesan = d.pesan;
    saveState();
    renderBimbingTulis(container);
    var next = container.querySelector('[data-cek]');
    if (d.ok && next) next.focus();
  }

  container.querySelectorAll('[data-cek]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      periksa(parseInt(btn.dataset.cek, 10));
    });
  });
  container.querySelectorAll('.tulis-item .frac-input__box').forEach(function (inp) {
    inp.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var item = inp.closest('[data-tulis]');
      if (item) periksa(parseInt(item.dataset.tulis, 10));
    });
  });
  container.querySelectorAll('[data-hint]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = parseInt(btn.dataset.hint, 10);
      states[i].raw = readFractionInput(container, 'tl' + i).raw;
      states[i].hintLevel++;
      saveState();
      renderBimbingTulis(container);
    });
  });
  container.querySelectorAll('[data-reveal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      states[parseInt(btn.dataset.reveal, 10)].revealed = true;
      saveState();
      renderBimbingTulis(container);
    });
  });

  bindNext('tulisNextBtn', 'bimbingTulis', 'cekPaham');
}

/* ============================================================
   10. STAGE: CEK PEMAHAMAN (DI fase 4)
   ============================================================ */

function renderCekPaham(container) {
  var D = DATA.cekPaham;
  var items = D.pernyataan;
  var selesai = sortItemsAllAnswered(items, State.cekStates);
  var skor = sortItemsCorrectCount(items, State.cekStates);
  var lulus = skor >= D.ambang;

  container.innerHTML =
    '<section aria-label="Cek Pemahaman">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel(buildSortItems(items, State.cekOrder, D.opsi, State.cekStates)) +
    (selesai
      ? buildDlPanel(
          '<div class="summary-grid">' +
            '<div class="summary-card"><div class="summary-card__val">' +
            skor +
            '/' +
            items.length +
            '</div><div class="summary-card__label">Pernyataan dijawab tepat</div></div>' +
            '</div>' +
            '<div style="margin-top:var(--space-3);">' +
            (lulus
              ? buildFeedbackBox(
                  'success',
                  '🌟',
                  '<strong>Pemahamanmu sudah kuat!</strong> Baca ringkasan di bawah sekali lagi, lalu lanjutkan ke latihan mandiri.'
                )
              : buildFeedbackBox('warning', '🔁', esc(D.remedial))) +
            '</div>'
        ) +
        buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.rangkumanJudul) +
            '</h3>' +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + r + '</li>'
                );
              })
              .join('') +
            '</ol>' +
            '<div class="formula-duo">' +
            '<div class="formula-card"><span class="formula-card__label">Pecahan biasa</span>' +
            buildFracBlock(5, 6, null, 'large') +
            ' → "lima per enam"</div>' +
            '<div class="formula-card"><span class="formula-card__label">Pecahan campuran</span>' +
            buildFracBlock(5, 6, 2, 'large') +
            ' → "dua lima per enam"</div>' +
            '</div>',
          'panel--hero'
        ) +
        buildDlNextButton('cekNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindSortItems(container, items, State.cekStates, saveState, function () {
    renderCekPaham(container);
  });

  bindNext('cekNextBtn', 'cekPaham', 'mandiri');
}

/* ============================================================
   11. STAGE: LATIHAN MANDIRI (DI fase 5)
   Satu soal per layar. Pilihan ganda dijawab sekali; soal isian
   boleh dicoba `maksCoba` kali sebelum jawaban ditampilkan.
   ============================================================ */

function renderMandiri(container) {
  var D = DATA.mandiri;
  var idx = State.mandiriIdx;
  var s = D.soal[idx];
  var st = State.mandiriStates[idx];
  var total = D.soal.length;
  var semuaSelesai = State.mandiriStates.every(function (x) {
    return x.done;
  });
  var statuses = State.mandiriStates.map(function (x) {
    if (!x.done) return '';
    return x.correct ? 'correct' : 'incorrect';
  });

  var body = '';
  if (s.type === 'choice') {
    body =
      buildChoiceGroup(s.opsi, st.optionOrder, {
        chosen: st.chosen,
        correctId: s.correct,
        grade: true,
        locked: true,
        attr: 'data-m-opt',
      }) +
      (st.done
        ? '<div style="margin-top:var(--space-3);">' +
          buildFeedbackBox(
            st.correct ? 'success' : 'error',
            st.correct ? '✓' : '✗',
            (st.correct ? '<strong>Benar!</strong> ' : '<strong>Belum tepat.</strong> ') +
              s.explanation
          ) +
          '</div>'
        : '');
  } else {
    var nilai = st.raw;
    var fb = '';
    if (st.done && st.correct) {
      fb = buildFeedbackBox(
        'success',
        '✓',
        '<strong>Benar!</strong> ' +
          fracTarget(s.jawab, 'small') +
          ' dibaca "' +
          esc(bacaPecahan(s.jawab.num, s.jawab.den, s.jawab.whole)) +
          '".'
      );
    } else if (st.done) {
      fb = buildFeedbackBox(
        'error',
        '✗',
        '<strong>Belum tepat.</strong> ' +
          esc(st.pesan) +
          '<br>Jawaban yang baku: ' +
          fracTarget(s.jawab, 'small') +
          ', dibaca "' +
          esc(bacaPecahan(s.jawab.num, s.jawab.den, s.jawab.whole)) +
          '".'
      );
    } else if (st.pesan) {
      fb = buildFeedbackBox(
        'warning',
        '💭',
        '<strong>Belum tepat.</strong> ' +
          esc(st.pesan) +
          ' Kesempatan tersisa: ' +
          (D.maksCoba - st.attempts) +
          '.'
      );
    }
    body =
      (s.model
        ? buildFractionModel(s.model.num, s.model.den, s.model.whole || 0, {
            shape: s.model.shape,
            small: true,
          })
        : '') +
      '<div class="tulis-item__row">' +
      buildFractionInput('mdIsian', nilai, {
        mixed: true,
        disabled: st.done,
        status: st.done ? (st.correct ? 'ok' : 'bad') : st.pesan ? 'bad' : '',
        aria: 'Jawaban soal ' + (idx + 1),
      }) +
      (st.done
        ? ''
        : '<button type="button" class="btn btn--primary" id="mdCekBtn">Periksa</button>') +
      '</div>' +
      (fb ? '<div style="margin-top:var(--space-3);">' + fb + '</div>' : '');
  }

  var nav = '<div class="btn-group btn-group--spread" style="margin-top:var(--space-4);">';
  nav +=
    idx > 0
      ? '<button type="button" class="btn btn--ghost" id="mdPrevBtn">← Sebelumnya</button>'
      : '<span></span>';
  if (st.done && idx < total - 1) {
    nav +=
      '<button type="button" class="btn btn--primary" id="mdNextBtn">Soal Berikutnya →</button>';
  } else if (semuaSelesai && idx === total - 1) {
    nav +=
      '<button type="button" class="btn btn--primary btn--large" id="mandiriNextBtn">' +
      esc(D.nextLabel) +
      '</button>';
  } else if (st.done && !semuaSelesai) {
    nav +=
      '<button type="button" class="btn btn--primary" id="mdFirstOpenBtn">Ke soal yang belum dikerjakan →</button>';
  }
  nav += '</div>';

  container.innerHTML =
    '<section aria-label="Latihan Mandiri">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">🧑‍💻 ' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel(
      buildProgressDots(total, idx, statuses) +
        '<div class="dl-prompt">' +
        '<p class="dl-prompt__cerita">' +
        s.cerita +
        '</p>' +
        '<p class="dl-prompt__tanya">' +
        esc(s.tanya) +
        '</p>' +
        '</div>' +
        body +
        nav
    ) +
    '</section>';

  container.querySelectorAll('[data-m-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (st.done) return;
      st.chosen = btn.dataset.mOpt;
      st.correct = st.chosen === s.correct;
      st.done = true;
      saveState();
      renderMandiri(container);
    });
  });

  function periksa() {
    var hasil = readFractionInput(container, 'mdIsian');
    st.raw = hasil.raw;
    if (hasil.error) {
      saveState();
      showNotice(pesanInputPecahan(hasil.error));
      return;
    }
    var d = diagnosaTulis(hasil.value, s.jawab);
    st.attempts++;
    st.correct = d.ok;
    st.pesan = d.pesan;
    if (d.ok || st.attempts >= D.maksCoba) st.done = true;
    saveState();
    renderMandiri(container);
  }

  var cekBtn = document.getElementById('mdCekBtn');
  if (cekBtn) cekBtn.addEventListener('click', periksa);
  container.querySelectorAll('.frac-input__box').forEach(function (inp) {
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !st.done) periksa();
    });
  });

  function pindah(i) {
    State.mandiriIdx = i;
    saveState();
    renderMandiri(container);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  var prevBtn = document.getElementById('mdPrevBtn');
  if (prevBtn)
    prevBtn.addEventListener('click', function () {
      pindah(idx - 1);
    });
  var nextBtn = document.getElementById('mdNextBtn');
  if (nextBtn)
    nextBtn.addEventListener('click', function () {
      pindah(idx + 1);
    });
  var openBtn = document.getElementById('mdFirstOpenBtn');
  if (openBtn) {
    openBtn.addEventListener('click', function () {
      for (var i = 0; i < total; i++) {
        if (!State.mandiriStates[i].done) {
          pindah(i);
          return;
        }
      }
    });
  }

  bindNext('mandiriNextBtn', 'mandiri', 'refleksi');
}

/* ============================================================
   12. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var bacaSoal = DATA.bimbingBaca.soal;
  var bacaPertama = bacaSoal.filter(function (q) {
    return State.bacaPertama[q.id] === q.correct;
  }).length;
  var tulisMandiri = State.tulisStates.filter(function (st) {
    return st.correct && !st.revealed;
  }).length;
  var cekBenar = sortItemsCorrectCount(DATA.cekPaham.pernyataan, State.cekStates);
  var mandiriBenar = State.mandiriStates.filter(function (st) {
    return st.correct;
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
        kartu(bacaPertama + '/' + bacaSoal.length, 'Membaca tepat pada pilihan pertama') +
        kartu(
          tulisMandiri + '/' + DATA.bimbingTulis.soal.length,
          'Menulis tepat tanpa melihat jawaban'
        ) +
        kartu(cekBenar + '/' + DATA.cekPaham.pernyataan.length, 'Cek pemahaman tepat') +
        kartu(mandiriBenar + '/' + DATA.mandiri.soal.length, 'Latihan mandiri benar') +
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
  var benar = State.mandiriStates.filter(function (st) {
    return st.correct;
  }).length;
  var total = DATA.mandiri.soal.length;
  var bintang = benar === total ? 3 : benar >= total * 0.75 ? 2 : 1;

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
    '<p class="bintang" aria-label="' +
    bintang +
    ' dari 3 bintang">' +
    '<span aria-hidden="true">' +
    '⭐'.repeat(bintang) +
    '<span class="bintang__off">' +
    '⭐'.repeat(3 - bintang) +
    '</span></span></p>' +
    '<div class="formula-duo">' +
    '<div class="formula-card"><span class="formula-card__label">Pecahan biasa</span>' +
    buildFracBlock(3, 8, null, 'large') +
    ' → "tiga per delapan"</div>' +
    '<div class="formula-card"><span class="formula-card__label">Pecahan campuran</span>' +
    buildFracBlock(3, 4, 2, 'large') +
    ' → "dua tiga per empat"</div>' +
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
    'Minta murid membaca lantang beberapa pecahan dan menuliskannya di buku untuk memastikan notasi bersusun sudah dikuasai.' +
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
   14. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  demoBiasa: renderDemoBiasa,
  demoCampuran: renderDemoCampuran,
  bimbingBaca: renderBimbingBaca,
  bimbingTulis: renderBimbingTulis,
  cekPaham: renderCekPaham,
  mandiri: renderMandiri,
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
