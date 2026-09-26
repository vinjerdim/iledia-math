'use strict';

/* ============================================================
   app.js — Logika media pembelajaran
   Matematika: Rumus Suku ke-n Barisan Aritmetika
   Fase F — SMK RPL (Kelas XI) · Cooperative Learning (NHT)

   Konten ada di data.js; utilitas bersama (pengacakan, mesin tahap,
   komponen NHT, tabel pola, isian rumus, diagnosa miskonsepsi) ada di
   shared/engine.js seksi 12 & 40.

   Isi berkas:
     1. Konstanta
     2. State & storage (termasuk SELURUH pengacakan opsi)
     3. Navigasi
     4. Utilitas render
     5. Tahap Tujuan
     6. Tahap Informasi
     7. Tahap Tim & Nomor Kepala
     8. Tahap Misi 1 — Rakit Rumus
     9. Tahap Misi 2 — Dua Suku Diketahui
    10. Tahap Misi 3 — Masalah Kontekstual
    11. Tahap Kuis Individu
    12. Tahap Penghargaan
    13. Tahap Refleksi
    14. Tahap Selesai
    15. Router, modal reset, init
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
var STORAGE_KEY = 'mpi-f-1-2-rumus-suku-v1';

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'tujuan',
  completedStages: {},

  /* Tahap 1 — tujuan */
  dugaanOrders: {},
  dugaanPilih: {},
  tujuanAlasan: '',

  /* Tahap 2 — informasi */
  polaTabel: null,
  penuntunOrders: {},
  penuntunPilih: {},

  /* Tahap 3 — tim & nomor kepala */
  timNama: '',
  timInput: ['', '', '', ''],
  timAnggota: [],
  timSepakat: {},

  /* Tahap 4 — misi rakit rumus */
  rumusIdx: 0,
  rumus: {},
  nhtRumus: null,

  /* Tahap 5 — misi dua suku */
  duaIdx: 0,
  dua: {},
  nhtDua: null,

  /* Tahap 6 — misi konteks */
  konteksIdx: 0,
  konteks: {},
  nhtKonteks: null,
  konteksCatatan: '',

  /* Tahap 7 — kuis */
  kuisPick: null,
  kuisIdx: 0,
  kuisExercises: [],

  /* Tahap 8 — penghargaan */
  pujian: '',

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

/* Memastikan objek[key] berupa objek biasa (peta id → nilai). */
function ensureMapIn(obj, key) {
  if (!obj[key] || typeof obj[key] !== 'object' || Array.isArray(obj[key])) obj[key] = {};
  return obj[key];
}

function ensureMap(key) {
  return ensureMapIn(State, key);
}

/* Mengacak urutan opsi untuk setiap pertanyaan { id, opsi } dalam daftar. */
function ensureListOrders(key, list) {
  var map = ensureMap(key);
  list.forEach(function (q) {
    ensureShuffledOrder(map, q.id, q.opsi);
  });
}

/* State pilihan yang boleh dicoba lagi sampai benar: { chosen, wrong }. */
function ensureTry(obj, key) {
  if (!obj[key] || typeof obj[key] !== 'object') obj[key] = { chosen: null, wrong: 0 };
  return obj[key];
}

function ensureStep(obj, key) {
  if (!obj[key] || typeof obj[key] !== 'object' || typeof obj[key].input !== 'string') {
    obj[key] = makeDlStep();
  }
  return obj[key];
}

function ensureCall(key) {
  if (!State[key] || typeof State[key] !== 'object') State[key] = makeNhtCall();
  return State[key];
}

function ensureIdx(key, list) {
  if (!(State[key] >= 0 && State[key] < list.length)) State[key] = 0;
}

/* Misi 1: pilihan a (opsi acak) → isian b → isian rumus → kode JS (opsi acak). */
function ensureMisiRumusState(s) {
  var st = ensureMapIn(ensureMap('rumus'), s.id);
  ensureTry(st, 'suku1');
  ensureShuffledOrder(st, 'suku1Order', opsiSukuPertama(s.terms));
  ensureStep(st, 'beda');
  ensureRumusSukuState(st, 'rumus');
  ensureTry(st, 'kode');
  ensureShuffledOrder(st, 'kodeOrder', opsiKodeSuku(s.terms[0], bedaBarisan(s.terms)));
  return st;
}

function ensureDuaState(s) {
  var st = ensureMapIn(ensureMap('dua'), s.id);
  ensureStep(st, 'beda');
  ensureStep(st, 'suku1');
  ensureRumusSukuState(st, 'rumus');
  ensureStep(st, 'nomor');
  return st;
}

/* Misi 3: pasangan a & b (opsi acak) → rumus → jawaban → makna (opsi acak). */
function ensureKonteksState(s) {
  var st = ensureMapIn(ensureMap('konteks'), s.id);
  ensureTry(st, 'ab');
  ensureShuffledOrder(st, 'abOrder', s.abOpsi);
  ensureRumusSukuState(st, 'rumus');
  ensureStep(st, 'jawab');
  ensureTry(st, 'makna');
  ensureShuffledOrder(st, 'maknaOrder', s.maknaOpsi);
  return st;
}

/*
 * Soal kuis yang sedang dipakai. Array ini DIISI ULANG di tempat (bukan
 * diganti) karena createExerciseStage menyimpan referensinya.
 */
var KUIS_SOAL = [];

/* Memilih soal acak dari bank sesuai komposisi, lalu mengacak urutannya. */
function pilihSoalKuis() {
  var K = DATA.kuis;
  var ids = [];
  Object.keys(K.komposisi).forEach(function (jenis) {
    var kelompok = K.soal.filter(function (s) {
      return s.jenis === jenis;
    });
    shuffleArray(kelompok)
      .slice(0, K.komposisi[jenis])
      .forEach(function (s) {
        ids.push(s.id);
      });
  });
  return shuffleArray(ids);
}

function kuisPickValid() {
  var pick = State.kuisPick;
  if (!Array.isArray(pick) || pick.length !== DATA.kuis.banyak) return false;
  var ada = optionIds(DATA.kuis.soal);
  return pick.every(function (id, i) {
    return ada.indexOf(id) !== -1 && pick.indexOf(id) === i;
  });
}

function isiKuisSoal() {
  var byId = {};
  DATA.kuis.soal.forEach(function (s) {
    byId[s.id] = s;
  });
  KUIS_SOAL.length = 0;
  State.kuisPick.forEach(function (id) {
    var s = byId[id];
    KUIS_SOAL.push({
      id: s.id,
      jenis: s.jenis,
      type: s.type,
      cerita: esc(s.cerita),
      pertanyaan: esc(s.pertanyaan),
      options: s.options.map(function (o) {
        return { id: o.id, label: esc(o.label) };
      }),
      correct: s.correct,
      explanation: esc(s.explanation),
    });
  });
}

/*
 * Menyiapkan seluruh state per-langkah DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1 */
  ensureListOrders('dugaanOrders', DATA.tujuan.dugaan);
  ensureMap('dugaanPilih');

  /* Tahap 2 */
  ensureTabelPolaState(State, 'polaTabel', DATA.informasi.barisPola);
  ensureListOrders('penuntunOrders', DATA.informasi.penuntun);
  ensureMap('penuntunPilih');

  /* Tahap 3 */
  if (!Array.isArray(State.timInput) || State.timInput.length !== DATA.tim.maksAnggota) {
    State.timInput = [];
    for (var i = 0; i < DATA.tim.maksAnggota; i++) State.timInput.push('');
  }
  if (
    !Array.isArray(State.timAnggota) ||
    !State.timAnggota.every(function (x) {
      return x && typeof x.nomor === 'number' && typeof x.nama === 'string';
    })
  ) {
    State.timAnggota = [];
  }
  ensureMap('timSepakat');

  /* Tahap 4–6 */
  DATA.misiRumus.soal.forEach(ensureMisiRumusState);
  ensureIdx('rumusIdx', DATA.misiRumus.soal);
  ensureCall('nhtRumus');

  DATA.misiDuaSuku.soal.forEach(ensureDuaState);
  ensureIdx('duaIdx', DATA.misiDuaSuku.soal);
  ensureCall('nhtDua');

  DATA.misiKonteks.soal.forEach(ensureKonteksState);
  ensureIdx('konteksIdx', DATA.misiKonteks.soal);
  ensureCall('nhtKonteks');

  /* Tahap 7 — soal dipilih acak dari bank; opsi tiap soal diacak */
  if (!kuisPickValid()) {
    State.kuisPick = pilihSoalKuis();
    State.kuisExercises = [];
    State.kuisIdx = 0;
  }
  isiKuisSoal();
  ensureExerciseArray(State, 'kuisExercises', KUIS_SOAL, function (s) {
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
  ensureIdx('kuisIdx', KUIS_SOAL);

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
  return buildDiscoveryHead(D.kicker, D.goal, D.syntax) + buildTeacherNote(D.guru);
}

/*
 * Memasang tombol lanjut yang menyelesaikan tahap ini lalu pindah tahap.
 * `guard` opsional: kembalikan false untuk membatalkan.
 */
function bindNext(id, stageId, nextStageId, guard) {
  var btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', function () {
    if (guard && guard() === false) return;
    completeStage(stageId);
    navigateTo(nextStageId);
  });
}

function buildTextarea(id, label, value, placeholder) {
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
    esc(placeholder || '') +
    '">' +
    esc(value || '') +
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

function buildLangkah(list) {
  return (
    '<ol class="misi-langkah">' +
    list
      .map(function (t) {
        return '<li>' + esc(t) + '</li>';
      })
      .join('') +
    '</ol>'
  );
}

function kartuRingkas(val, label) {
  return (
    '<div class="summary-card"><div class="summary-card__val">' +
    val +
    '</div><div class="summary-card__label">' +
    label +
    '</div></div>'
  );
}

function buildAturan() {
  return (
    '<ul class="aturan-list">' +
    DATA.informasi.aturan
      .map(function (a) {
        return '<li>' + esc(a) + '</li>';
      })
      .join('') +
    '</ul>'
  );
}

function buildKode(teks) {
  return '<pre class="kode-js"><code>' + esc(teks) + '</code></pre>';
}

/* Kotak konteks: ikon + cerita. */
function buildKonteks(ikon, cerita) {
  return (
    '<div class="misi-konteks">' +
    '<span class="misi-konteks__ikon" aria-hidden="true">' +
    ikon +
    '</span>' +
    '<p>' +
    esc(cerita) +
    '</p>' +
    '</div>'
  );
}

/* Kartu nomor kepala tim di awal setiap misi. */
function buildTimMisi() {
  if (!State.timAnggota.length) {
    return buildFeedbackBox(
      'warning',
      '👥',
      'Nomor kepala belum dibagikan. Kembali ke tahap <strong>Tim &amp; Nomor</strong> agar fitur Panggil Nomor bisa dipakai.'
    );
  }
  return (
    '<div class="panel panel--compact misi-tim">' +
    '<p class="misi-tim__judul">👥 ' +
    esc(State.timNama || 'Tim kalian') +
    ' — pikirkan bersama, siapa pun bisa dipanggil!</p>' +
    buildNhtCards(State.timAnggota) +
    '</div>'
  );
}

/* Bilah progres "Soal i dari n" untuk misi bertahap. */
function buildMisiProgress(total, idx, doneFn) {
  var statuses = [];
  for (var i = 0; i < total; i++) statuses.push(doneFn(i) ? 'correct' : '');
  return buildProgressDots(total, idx, statuses);
}

/* Tombol pindah soal (sebelumnya / berikutnya) dalam satu misi. */
function buildSoalNav(prefix, idx, total, selesai) {
  return (
    '<div class="btn-group btn-group--spread">' +
    (idx > 0
      ? '<button type="button" class="btn btn--ghost" id="' +
        prefix +
        'Prev">← Soal Sebelumnya</button>'
      : '<span></span>') +
    (selesai && idx < total - 1
      ? '<button type="button" class="btn btn--primary" id="' +
        prefix +
        'NextSoal">Soal Berikutnya →</button>'
      : '') +
    '</div>'
  );
}

function bindSoalNav(prefix, key, rerender) {
  var next = document.getElementById(prefix + 'NextSoal');
  if (next) {
    next.addEventListener('click', function () {
      State[key] += 1;
      saveState();
      rerender();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  var prev = document.getElementById(prefix + 'Prev');
  if (prev) {
    prev.addEventListener('click', function () {
      State[key] -= 1;
      saveState();
      rerender();
    });
  }
}

/* Pilihan yang boleh dicoba lagi sampai benar; terkunci setelah benar. */
function buildTryGroup(options, order, tr, correctId, group, attr) {
  var benar = tr.chosen === correctId;
  return buildChoiceGroup(options, order, {
    chosen: tr.chosen,
    correctId: benar ? correctId : null,
    grade: true,
    locked: benar,
    group: group,
    attr: attr,
  });
}

function bindTryGroup(root, attr, tr, correctId, rerender) {
  var dataKey = attr.replace(/^data-/, '').replace(/-([a-z])/g, function (m, c) {
    return c.toUpperCase();
  });
  root.querySelectorAll('[' + attr + ']').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (tr.chosen === correctId) return;
      tr.chosen = btn.dataset[dataKey];
      if (tr.chosen !== correctId) tr.wrong += 1;
      saveState();
      rerender();
    });
  });
}

function buildTryFeedback(tr, correctId, benarHTML, salahHTML) {
  if (!tr.chosen) return '';
  var benar = tr.chosen === correctId;
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(
      benar ? 'success' : 'warning',
      benar ? '✓' : '💭',
      benar ? benarHTML : salahHTML
    ) +
    '</div>'
  );
}

/* Bilangan dalam kurung bila negatif: (−7). */
function kurung(x) {
  return bulatkanSuku(x) < 0 ? '(' + fmtSuku(x) + ')' : fmtSuku(x);
}

/* Langkah isian bilangan (bulat/desimal, boleh negatif). */
function stepCfg(label, jawab, hints, temuan) {
  return {
    label: label,
    jawab: jawab,
    hints: hints,
    temuan: temuan,
    rational: true,
    allowNegative: true,
  };
}

/* Isian rumus: dicatat benar-percobaan-pertama lewat st.attempts. */
function rumusBenar(st) {
  return !!(st && st.done);
}

/* ============================================================
   5. STAGE: TUJUAN  (Cooperative Learning — fase 1)
   Denah lab & dugaan (tidak dinilai).
   ============================================================ */

function dugaanLengkap() {
  return DATA.tujuan.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function buildDenahLab() {
  var D = DATA.tujuan;
  var baris = D.barisan
    .map(function (jml, i) {
      var pc = '';
      for (var k = 0; k < jml; k++) pc += '<span>🖥️</span>';
      return (
        '<div class="lab-denah__baris">' +
        '<span class="lab-denah__label">' +
        esc(D.labelBaris) +
        ' ' +
        (i + 1) +
        '</span>' +
        '<span class="lab-denah__pc" aria-hidden="true">' +
        pc +
        '</span>' +
        '<span class="lab-denah__jumlah">' +
        jml +
        ' PC</span>' +
        '</div>'
      );
    })
    .join('');
  return (
    '<div class="lab-denah" role="img" aria-label="Denah lab: baris 1 berisi 8 PC, baris 2 berisi 12 PC, baris 3 berisi 16 PC, baris 4 berisi 20 PC, dan seterusnya sampai baris 25.">' +
    baris +
    '<div class="lab-denah__baris"><span class="lab-denah__label">⋮</span><span class="lab-denah__jauh">…</span></div>' +
    '<div class="lab-denah__baris"><span class="lab-denah__label">' +
    esc(D.labelBaris) +
    ' 25</span><span class="lab-denah__jumlah">? PC</span></div>' +
    '</div>'
  );
}

function renderTujuan(container) {
  var D = DATA.tujuan;
  var lengkap = dugaanLengkap();

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
    '<section aria-label="Tujuan dan Motivasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🏫 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        buildDenahLab(),
      'panel--hero'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🎯 ' +
        esc(D.tpJudul) +
        '</h3>' +
        '<p class="tp-teks">' +
        esc(D.tp) +
        '</p>' +
        '<ol class="objectives-list">' +
        D.kriteria
          .map(function (c, i) {
            return (
              '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + esc(c) + '</li>'
            );
          })
          .join('') +
        '</ol>',
      'panel--info'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaanmu?</h3>' +
        dugaanHTML +
        '<div style="margin-top:var(--space-5);">' +
        buildTextarea('tujuanAlasan', D.alasanLabel, State.tujuanAlasan, D.alasanPlaceholder) +
        '</div>' +
        buildFeedbackBox('info', '🔎', esc(D.catatan))
    ) +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="tujuanNextBtn"' +
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
      renderTujuan(container);
    });
  });

  bindTextarea('tujuanAlasan', 'tujuanAlasan');

  bindNext('tujuanNextBtn', 'tujuan', 'informasi', function () {
    if (!dugaanLengkap()) {
      showNotice('Pilih dugaanmu untuk setiap pertanyaan sebelum melanjutkan.');
      return false;
    }
    return true;
  });
}

/* ============================================================
   6. STAGE: INFORMASI  (Cooperative Learning — fase 2)
   Tabel pola → pertanyaan penuntun (opsi acak) → rumus, kode JS,
   dan cek dugaan tahap 1.
   ============================================================ */

function buildCekDugaan() {
  var T = DATA.tujuan;
  return T.dugaan
    .map(function (q) {
      var pilih = State.dugaanPilih[q.id];
      var kunci = T.kunciDugaan[q.id];
      var cocok = pilih === kunci;
      return buildFeedbackBox(
        cocok ? 'success' : 'info',
        cocok ? '✓' : '💡',
        '<strong>' +
          esc(q.tanya) +
          '</strong><br>Jawaban: ' +
          esc(findOptionLabel(q.opsi, kunci)) +
          '. ' +
          (cocok
            ? 'Dugaanmu tepat!'
            : 'Dugaanmu: ' +
              esc(findOptionLabel(q.opsi, pilih) || '—') +
              '. Sekarang kamu tahu alasannya.')
      );
    })
    .join('');
}

function renderInformasi(container) {
  var D = DATA.informasi;
  var tabel = State.polaTabel;
  var tabelOk = tabelPolaSelesai(tabel);
  var penuntunBenar = guidedQuizAllCorrect(D.penuntun, State.penuntunPilih);
  var rerender = function () {
    renderInformasi(container);
  };

  container.innerHTML =
    '<section aria-label="Menyajikan Informasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🧮 Tabel pola baris lab</h3>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="misi-seq">' +
        buildSequenceTiles(DATA.tujuan.barisan, { showDiff: true, more: true, format: fmtSuku }) +
        '</div>' +
        buildTabelPolaSuku('pola', D.a, D.b, tabel) +
        (!tabelOk && tabel.attempts > 0
          ? buildFeedbackBox(
              'warning',
              '💭',
              'Ada isian yang belum tepat (kotak merah). U₁ belum mendapat tambahan beda (0 kali), U₂ mendapat 1 kali, dan seterusnya. Untuk Uₙ tulis dalam n, mis. <strong>n − 1</strong>.'
            )
          : '') +
        (tabelOk
          ? buildFeedbackBox(
              'success',
              '💡',
              'Pola ditemukan: suku ke-n mendapat beda sebanyak <strong>(n − 1)</strong> kali, jadi Uₙ = 8 + (n − 1) × 4.'
            )
          : '')
    ) +
    (tabelOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🧭 Pertanyaan penuntun</h3>' +
            buildGuidedQuizList(D.penuntun, State.penuntunOrders, State.penuntunPilih)
        )
      : '') +
    (tabelOk && penuntunBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📌 ' +
            esc(D.aturanJudul) +
            '</h3>' +
            '<p class="rumus-kartu">Uₙ = a + (n − 1)b  ⇔  Uₙ = bn + (a − b)</p>' +
            buildAturan(),
          'panel--hero'
        ) +
        buildDlPanel(
          '<h3 style="margin-top:0;">💻 ' +
            esc(D.kodeJudul) +
            '</h3>' +
            '<p>Di pemrograman, rumus suku ke-n adalah sebuah fungsi: masukkan n, keluar Uₙ.</p>' +
            buildKode(D.kode)
        ) +
        buildDlPanel(
          '<h3 style="margin-top:0;">🔁 ' + esc(D.dugaanJudul) + '</h3>' + buildCekDugaan()
        ) +
        buildDlNextButton('informasiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindTabelPolaSuku(container, 'pola', tabel, saveState, rerender);
  bindGuidedQuizList(container, D.penuntun, State.penuntunPilih, saveState, rerender);
  bindNext('informasiNextBtn', 'informasi', 'tim');
}

/* ============================================================
   7. STAGE: TIM & NOMOR KEPALA  (Cooperative Learning — fase 3)
   ============================================================ */

function timNamaTerisi() {
  return State.timInput
    .map(function (v) {
      return String(v || '').trim();
    })
    .filter(function (v) {
      return v;
    });
}

/* true bila anggota yang terisi berbeda dari anggota yang sudah bernomor. */
function timBerubah() {
  var a = timNamaTerisi().slice().sort();
  var b = State.timAnggota
    .map(function (x) {
      return x.nama;
    })
    .sort();
  return a.join('|') !== b.join('|');
}

function timSepakatSemua() {
  return DATA.tim.kesepakatan.every(function (k) {
    return !!State.timSepakat[k.id];
  });
}

function renderTim(container) {
  var D = DATA.tim;
  var sudahAcak = State.timAnggota.length > 0;

  var anggotaHTML = State.timInput
    .map(function (v, i) {
      return (
        '<input type="text" class="input-text" id="timAnggota' +
        i +
        '" data-anggota="' +
        i +
        '" maxlength="24" autocomplete="off" value="' +
        esc(v) +
        '" placeholder="Anggota ' +
        (i + 1) +
        (i < D.minAnggota ? '' : ' (opsional)') +
        '" aria-label="Nama anggota ' +
        (i + 1) +
        '">'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Bentuk Tim dan Nomor Kepala">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="field-group">' +
        '<label for="timNama">' +
        esc(D.namaTimLabel) +
        '</label>' +
        '<input type="text" class="input-text" id="timNama" maxlength="30" autocomplete="off" value="' +
        esc(State.timNama) +
        '" placeholder="' +
        esc(D.namaTimPlaceholder) +
        '">' +
        '</div>' +
        '<fieldset class="field-group tim-anggota">' +
        '<legend>' +
        esc(D.anggotaLabel) +
        ' (' +
        D.minAnggota +
        '–' +
        D.maksAnggota +
        ' orang)</legend>' +
        '<div class="tim-anggota__grid">' +
        anggotaHTML +
        '</div>' +
        '</fieldset>' +
        '<fieldset class="field-group sepakat">' +
        '<legend>' +
        esc(D.kesepakatanJudul) +
        '</legend>' +
        D.kesepakatan
          .map(function (k) {
            return (
              '<label class="sepakat-item"><input type="checkbox" data-sepakat="' +
              k.id +
              '"' +
              (State.timSepakat[k.id] ? ' checked' : '') +
              '><span>' +
              esc(k.teks) +
              '</span></label>'
            );
          })
          .join('') +
        '</fieldset>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn--outline-primary" id="timAcakBtn">' +
        esc(sudahAcak ? D.acakUlangLabel : D.acakLabel) +
        '</button>' +
        '</div>'
    ) +
    (sudahAcak
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🔢 ' +
            esc(D.nomorJudul) +
            ' — ' +
            esc(State.timNama) +
            '</h3>' +
            buildNhtCards(State.timAnggota) +
            '<p class="dl-caption">🧠 ' +
            esc(D.nomorCatatan) +
            '</p>'
        ) + buildDlNextButton('timNextBtn', D.nextLabel)
      : '') +
    '</section>';

  var namaInp = document.getElementById('timNama');
  namaInp.addEventListener('input', function () {
    State.timNama = namaInp.value;
    saveState();
  });

  container.querySelectorAll('[data-anggota]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      State.timInput[+inp.dataset.anggota] = inp.value;
      saveState();
    });
    /* Nama anggota diubah setelah nomor dibagikan → bagikan ulang. */
    inp.addEventListener('change', function () {
      if (State.timAnggota.length && timBerubah()) {
        State.timAnggota = [];
        saveState();
        showNotice('Daftar anggota berubah. Tekan "Bagikan Nomor Kepala" lagi.');
        renderTim(container);
      }
    });
  });

  container.querySelectorAll('[data-sepakat]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      State.timSepakat[cb.dataset.sepakat] = cb.checked;
      saveState();
    });
  });

  document.getElementById('timAcakBtn').addEventListener('click', function () {
    if (!State.timNama.trim()) {
      showNotice('Tulis nama tim kalian dulu.');
      return;
    }
    if (timNamaTerisi().length < D.minAnggota) {
      showNotice('Tulis minimal ' + D.minAnggota + ' nama anggota.');
      return;
    }
    State.timAnggota = assignNhtNumbers(State.timInput);
    /* Nomor baru → panggilan lama tidak berlaku lagi. */
    State.nhtRumus = makeNhtCall();
    State.nhtDua = makeNhtCall();
    State.nhtKonteks = makeNhtCall();
    saveState();
    renderTim(container);
  });

  bindNext('timNextBtn', 'tim', 'misiRumus', function () {
    if (!timSepakatSemua()) {
      showNotice('Centang semua kesepakatan tim sebelum memulai misi.');
      return false;
    }
    return true;
  });
}

/* Panel Panggil Nomor di akhir misi + guard tombol lanjut. */
function buildNhtMisi(id, call, tugas) {
  return buildDlPanel(
    buildNhtCall(id, State.timAnggota, call, {
      judul: 'Panggil Nomor! Satu anggota menjelaskan jawaban tim',
      tugas: esc(tugas),
    })
  );
}

function nhtGuard(call) {
  return function () {
    if (!nhtCallSelesai(call)) {
      showNotice('Panggil satu nomor dan pastikan anggota itu sudah menjelaskan.');
      return false;
    }
    return true;
  };
}

/* ============================================================
   8. STAGE: MISI 1 — RAKIT RUMUS  (Cooperative Learning — fase 4)
   Per barisan: ① pilih a (acak) → ② isi b → ③ isi rumus
   (diagnosa) → ④ pilih isi fungsi suku(n) (acak).
   ============================================================ */

function rumusSoalSelesai(s) {
  var st = State.rumus[s.id];
  return !!st && st.kode.chosen === 'benar';
}

function rumusSemuaSelesai() {
  return DATA.misiRumus.soal.every(rumusSoalSelesai);
}

function renderMisiRumus(container) {
  var D = DATA.misiRumus;
  var idx = State.rumusIdx;
  var s = D.soal[idx];
  var st = State.rumus[s.id];
  var a = s.terms[0];
  var b = bedaBarisan(s.terms);
  var suku1Ok = st.suku1.chosen === 'u1';
  var bedaOk = st.beda.done;
  var rumusOk = rumusBenar(st.rumus);
  var selesai = rumusSoalSelesai(s);
  var semua = rumusSemuaSelesai();
  var bedaStep = stepCfg(
    '② Berapa beda b barisan ini?',
    b,
    [
      'Beda = suku sesudah − suku sebelum, mis. U₂ − U₁ = ' +
        fmtSuku(s.terms[1]) +
        ' − ' +
        kurung(a) +
        '.',
    ],
    'Beda b = ' +
      fmtSuku(b) +
      '. ' +
      (b < 0 ? 'Barisan turun, beda negatif.' : 'Barisan naik, beda positif.')
  );
  var rerender = function () {
    renderMisiRumus(container);
  };

  container.innerHTML =
    '<section aria-label="Misi 1: Rakit Rumus">' +
    buildHead(D) +
    buildTimMisi() +
    buildDlPanel(buildLangkah(D.langkah), 'panel--compact') +
    '<div class="panel">' +
    buildMisiProgress(D.soal.length, idx, function (i) {
      return rumusSoalSelesai(D.soal[i]);
    }) +
    buildKonteks(s.ikon, s.judul) +
    '<div class="misi-seq">' +
    buildSequenceTiles(s.terms, { more: true, format: fmtSuku }) +
    '</div>' +
    '<h3 class="misi-sub">① Suku pertama (a) barisan ini adalah …</h3>' +
    buildTryGroup(opsiSukuPertama(s.terms), st.suku1Order, st.suku1, 'u1', s.id, 'data-suku1') +
    buildTryFeedback(
      st.suku1,
      'u1',
      'Tepat! a = U₁ = ' + esc(fmtSuku(a)) + '.',
      'Belum. Suku pertama adalah suku yang berada di urutan ke-1 (U₁), bukan beda atau suku lain.'
    ) +
    (suku1Ok ? buildDlStep('rmBeda', st.beda, bedaStep) : '') +
    (suku1Ok && bedaOk
      ? '<h3 class="misi-sub">③ Tulis rumus suku ke-n dalam bentuk sederhana</h3>' +
        '<p class="dl-caption">' +
        esc(fmtRumusUmum(a, b)) +
        ' → jabarkan lalu gabungkan.</p>' +
        buildRumusSukuInput('rmRumus', st.rumus, { a: a, b: b })
      : '') +
    (rumusOk
      ? '<h3 class="misi-sub">④ Isi fungsi <code>suku(n)</code> yang tepat adalah …</h3>' +
        '<div class="kode-pilih">' +
        buildTryGroup(opsiKodeSuku(a, b), st.kodeOrder, st.kode, 'benar', s.id, 'data-kode') +
        '</div>' +
        buildTryFeedback(
          st.kode,
          'benar',
          'Benar! <code>' +
            esc(kodeSukuJs(rumusSuku(a, b).koef, rumusSuku(a, b).konst)) +
            '</code> sama dengan ' +
            esc(fmtRumusSuku(a, b)) +
            '. Cek: suku(1) = ' +
            esc(fmtSuku(a)) +
            ' ✓',
          'Belum cocok. Bandingkan koefisien n dan konstanta di kode dengan rumus yang sudah kalian tulis. Di JavaScript, desimal memakai titik.'
        )
      : '') +
    '</div>' +
    buildSoalNav('rm', idx, D.soal.length, selesai) +
    (semua
      ? buildNhtMisi('nhtRumus', State.nhtRumus, D.nhtTugas) +
        buildDlNextButton('misiRumusNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindTryGroup(container, 'data-suku1', st.suku1, 'u1', rerender);
  if (suku1Ok) bindDlStep('rmBeda', st.beda, bedaStep, saveState, rerender);
  bindRumusSukuInput(container, 'rmRumus', st.rumus, a, b, saveState, rerender);
  bindTryGroup(container, 'data-kode', st.kode, 'benar', rerender);
  bindSoalNav('rm', 'rumusIdx', rerender);
  bindNhtCall(container, 'nhtRumus', State.timAnggota, State.nhtRumus, saveState, rerender);
  bindNext('misiRumusNextBtn', 'misiRumus', 'misiDuaSuku', nhtGuard(State.nhtRumus));
}

/* ============================================================
   9. STAGE: MISI 2 — DUA SUKU DIKETAHUI  (Cooperative Learning — fase 4)
   Per log: ① b → ② a → ③ rumus → ④ suku keberapa bernilai x.
   ============================================================ */

function duaKunci(s) {
  var ab = suku1DanBeda(s.m, s.um, s.n, s.un);
  return { a: ab.a, b: ab.b, nomor: nomorSukuDari(ab.a, ab.b, s.target) };
}

function duaSoalSelesai(s) {
  var st = State.dua[s.id];
  return !!st && st.nomor.done;
}

function duaSemuaSelesai() {
  return DATA.misiDuaSuku.soal.every(duaSoalSelesai);
}

function renderMisiDuaSuku(container) {
  var D = DATA.misiDuaSuku;
  var idx = State.duaIdx;
  var s = D.soal[idx];
  var st = State.dua[s.id];
  var k = duaKunci(s);
  var selesai = duaSoalSelesai(s);
  var semua = duaSemuaSelesai();
  var um = 'U' + subskrip(s.m);
  var un = 'U' + subskrip(s.n);
  var bedaStep = stepCfg(
    '① Beda b = (' + un + ' − ' + um + ') : (' + s.n + ' − ' + s.m + ') = …',
    k.b,
    [
      'Dari ' + um + ' ke ' + un + ' ada ' + (s.n - s.m) + ' langkah beda.',
      'Hitung (' + fmtSuku(s.un) + ' − ' + fmtSuku(s.um) + ') : ' + (s.n - s.m) + '.',
    ],
    'b = ' + fmtSuku(s.un - s.um) + ' : ' + (s.n - s.m) + ' = ' + fmtSuku(k.b) + '.'
  );
  var suku1Step = stepCfg(
    '② Suku pertama a = ' + um + ' − (' + s.m + ' − 1) × b = …',
    k.a,
    [
      'Dari U₁ ke ' +
        um +
        ' ada ' +
        (s.m - 1) +
        ' langkah beda, jadi mundurlah ' +
        (s.m - 1) +
        ' langkah.',
      'Hitung ' + fmtSuku(s.um) + ' − ' + (s.m - 1) + ' × ' + kurung(k.b) + '.',
    ],
    'a = ' + fmtSuku(s.um) + ' − ' + (s.m - 1) + ' × ' + kurung(k.b) + ' = ' + fmtSuku(k.a) + '.'
  );
  var nomorStep = stepCfg(
    '④ ' + esc(s.tanyaTarget),
    k.nomor,
    [
      'Tulis ' + fmtSuku(s.target) + ' = ' + fmtSuku(k.a) + ' + (n − 1) × ' + kurung(k.b) + '.',
      'n − 1 = (' +
        fmtSuku(s.target) +
        ' − ' +
        kurung(k.a) +
        ') : ' +
        kurung(k.b) +
        ', lalu tambahkan 1.',
    ],
    'n = ' +
      k.nomor +
      '. Cek: U' +
      subskrip(k.nomor) +
      ' = ' +
      fmtSuku(nilaiRumus(rumusSuku(k.a, k.b).koef, rumusSuku(k.a, k.b).konst, k.nomor)) +
      ' ✓'
  );
  var rerender = function () {
    renderMisiDuaSuku(container);
  };

  container.innerHTML =
    '<section aria-label="Misi 2: Dua Suku Diketahui">' +
    buildHead(D) +
    buildTimMisi() +
    buildDlPanel(buildLangkah(D.langkah), 'panel--compact') +
    '<div class="panel">' +
    buildMisiProgress(D.soal.length, idx, function (i) {
      return duaSoalSelesai(D.soal[i]);
    }) +
    buildKonteks(s.ikon, s.cerita) +
    '<div class="suku-diketahui">' +
    '<span class="suku-diketahui__item">' +
    um +
    ' = ' +
    esc(fmtSuku(s.um)) +
    '</span>' +
    '<span class="suku-diketahui__item">' +
    un +
    ' = ' +
    esc(fmtSuku(s.un)) +
    '</span>' +
    '</div>' +
    buildDlStep('dsBeda', st.beda, bedaStep) +
    (st.beda.done ? buildDlStep('dsSuku1', st.suku1, suku1Step) : '') +
    (st.suku1.done
      ? '<h3 class="misi-sub">③ Tulis rumus suku ke-n</h3>' +
        buildRumusSukuInput('dsRumus', st.rumus, { a: k.a, b: k.b })
      : '') +
    (rumusBenar(st.rumus) ? buildDlStep('dsNomor', st.nomor, nomorStep) : '') +
    '</div>' +
    buildSoalNav('ds', idx, D.soal.length, selesai) +
    (semua
      ? buildNhtMisi('nhtDua', State.nhtDua, D.nhtTugas) +
        buildDlNextButton('misiDuaNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindDlStep('dsBeda', st.beda, bedaStep, saveState, rerender);
  if (st.beda.done) bindDlStep('dsSuku1', st.suku1, suku1Step, saveState, rerender);
  bindRumusSukuInput(container, 'dsRumus', st.rumus, k.a, k.b, saveState, rerender);
  if (rumusBenar(st.rumus)) bindDlStep('dsNomor', st.nomor, nomorStep, saveState, rerender);
  bindSoalNav('ds', 'duaIdx', rerender);
  bindNhtCall(container, 'nhtDua', State.timAnggota, State.nhtDua, saveState, rerender);
  bindNext('misiDuaNextBtn', 'misiDuaSuku', 'misiKonteks', nhtGuard(State.nhtDua));
}

/* ============================================================
   10. STAGE: MISI 3 — MASALAH KONTEKSTUAL  (Cooperative Learning — fase 4)
   Per masalah: ① pasangan a & b (acak) → ② rumus → ③ jawaban →
   ④ makna dalam konteks (acak).
   ============================================================ */

function konteksSoalSelesai(s) {
  var st = State.konteks[s.id];
  return !!st && st.makna.chosen === s.maknaBenar;
}

function konteksSemuaSelesai() {
  return DATA.misiKonteks.soal.every(konteksSoalSelesai);
}

function renderMisiKonteks(container) {
  var D = DATA.misiKonteks;
  var idx = State.konteksIdx;
  var s = D.soal[idx];
  var st = State.konteks[s.id];
  var abOk = st.ab.chosen === s.abBenar;
  var rumusOk = rumusBenar(st.rumus);
  var r = rumusSuku(s.a, s.b);
  var selesai = konteksSoalSelesai(s);
  var semua = konteksSemuaSelesai();
  var hints =
    s.jenis === 'nomor'
      ? [
          'Yang ditanyakan adalah nomor suku n, dan yang diketahui nilai sukunya: ' +
            fmtSuku(s.target) +
            '.',
          'Selesaikan ' + fmtSuku(s.target) + ' = ' + fmtBentukLinear(r.koef, r.konst) + '.',
        ]
      : [
          'Yang ditanyakan adalah suku ke-' + s.n + ', jadi ganti n dengan ' + s.n + '.',
          'U' +
            subskrip(s.n) +
            ' = ' +
            fmtSuku(s.a) +
            ' + ' +
            (s.n - 1) +
            ' × ' +
            kurung(s.b) +
            '.',
        ];
  var jawabStep = stepCfg(
    '③ ' +
      esc(s.tanya) +
      (s.satuan ? ' <span class="dl-caption">(' + esc(s.satuan) + ')</span>' : ''),
    s.jawab,
    hints,
    s.jenis === 'nomor'
      ? 'n = ' + fmtSuku(s.jawab) + '.'
      : 'U' + subskrip(s.n) + ' = ' + fmtSuku(s.jawab) + (s.satuan ? ' ' + s.satuan : '') + '.'
  );
  var rerender = function () {
    renderMisiKonteks(container);
  };

  container.innerHTML =
    '<section aria-label="Misi 3: Masalah Kontekstual">' +
    buildHead(D) +
    buildTimMisi() +
    buildDlPanel(buildLangkah(D.langkah), 'panel--compact') +
    '<div class="panel">' +
    buildMisiProgress(D.soal.length, idx, function (i) {
      return konteksSoalSelesai(D.soal[i]);
    }) +
    buildKonteks(s.ikon, s.cerita) +
    '<p class="exercise-label">❓ ' +
    esc(s.tanya) +
    '</p>' +
    '<h3 class="misi-sub">① Suku pertama dan beda dari cerita ini adalah …</h3>' +
    buildTryGroup(s.abOpsi, st.abOrder, st.ab, s.abBenar, s.id, 'data-ab') +
    buildTryFeedback(
      st.ab,
      s.abBenar,
      'Tepat! ' + esc(findOptionLabel(s.abOpsi, s.abBenar)) + '.',
      'Belum. Suku pertama adalah nilai pada urutan ke-1; beda adalah perubahan tetap setiap langkah (negatif bila berkurang).'
    ) +
    (abOk
      ? '<h3 class="misi-sub">② Tulis rumus suku ke-n</h3>' +
        buildRumusSukuInput('ktRumus', st.rumus, { a: s.a, b: s.b })
      : '') +
    (rumusOk ? buildDlStep('ktJawab', st.jawab, jawabStep) : '') +
    (st.jawab.done
      ? '<h3 class="misi-sub">④ Apa arti jawaban kalian?</h3>' +
        buildTryGroup(s.maknaOpsi, st.maknaOrder, st.makna, s.maknaBenar, s.id, 'data-makna') +
        buildTryFeedback(
          st.makna,
          s.maknaBenar,
          'Benar! Jawaban matematika selalu dikembalikan ke konteks soal.',
          'Belum tepat. Perhatikan: yang kalian hitung itu nilai suku (Uₙ) atau nomor suku (n)? Apa satuannya?'
        )
      : '') +
    '</div>' +
    buildSoalNav('kt', idx, D.soal.length, selesai) +
    (semua
      ? buildNhtMisi('nhtKonteks', State.nhtKonteks, D.nhtTugas) +
        buildDlPanel(
          buildTextarea(
            'konteksCatatan',
            D.catatanLabel,
            State.konteksCatatan,
            D.catatanPlaceholder
          )
        ) +
        buildDlNextButton('misiKonteksNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindTryGroup(container, 'data-ab', st.ab, s.abBenar, rerender);
  bindRumusSukuInput(container, 'ktRumus', st.rumus, s.a, s.b, saveState, rerender);
  if (rumusOk) bindDlStep('ktJawab', st.jawab, jawabStep, saveState, rerender);
  bindTryGroup(container, 'data-makna', st.makna, s.maknaBenar, rerender);
  bindSoalNav('kt', 'konteksIdx', rerender);
  bindNhtCall(container, 'nhtKonteks', State.timAnggota, State.nhtKonteks, saveState, rerender);
  bindTextarea('konteksCatatan', 'konteksCatatan');
  bindNext('misiKonteksNextBtn', 'misiKonteks', 'kuis', function () {
    if (!nhtGuard(State.nhtKonteks)()) return false;
    if (!State.konteksCatatan.trim()) {
      showNotice('Tuliskan catatan tim terlebih dahulu.');
      return false;
    }
    return true;
  });
}

/* ============================================================
   11. STAGE: KUIS INDIVIDU  (Cooperative Learning — fase 5)
   ============================================================ */

var KuisStage = createExerciseStage({
  soal: KUIS_SOAL,
  getExercises: function () {
    return State.kuisExercises;
  },
  getIndex: function () {
    return State.kuisIdx;
  },
  setIndex: function (i) {
    State.kuisIdx = i;
  },
  save: saveState,
  idPrefix: 'kz',
  sectionLabel: 'Kuis Individu',
  kicker: DATA.kuis.kicker,
  goal: DATA.kuis.goal,
  instruction: DATA.kuis.instruksi,
  buildHead: function () {
    return buildHead(DATA.kuis);
  },
  nextStageId: 'penghargaan',
  completeStageId: 'kuis',
  nextButtonLabel: DATA.kuis.nextLabel,
  defaultType: 'choice',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  renderPrompt: function (s) {
    var tag = {
      rumus: '🧩 Menentukan rumus',
      suku: '🔢 Menghitung suku',
      nomor: '🔎 Suku keberapa?',
      konteks: '💬 Masalah kontekstual',
    }[s.jenis];
    return (
      '<div class="dl-prompt">' +
      '<span class="kuis-tag">' +
      tag +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      s.cerita +
      '</p>' +
      '<p class="dl-prompt__tanya">' +
      s.pertanyaan +
      '</p>' +
      '</div>'
    );
  },
});

function renderKuis(container) {
  KuisStage.render(container);
}

/* ============================================================
   12. STAGE: PENGHARGAAN  (Cooperative Learning — fase 6)
   Skor misi = langkah yang benar pada percobaan pertama + penjelasan
   nomor yang dipanggil; skor kuis = benar tanpa percobaan ulang.
   ============================================================ */

function tryPertama(tr, correctId) {
  return tr.chosen === correctId && !tr.wrong ? 1 : 0;
}

function stepPertama(step) {
  return step.done && step.attempts === 1 ? 1 : 0;
}

function rumusPertama(rs) {
  return rs.done && rs.attempts === 1 ? 1 : 0;
}

function misiSkor() {
  var benar = 0;
  var maks = 0;
  DATA.misiRumus.soal.forEach(function (s) {
    var st = State.rumus[s.id];
    maks += 4;
    benar +=
      tryPertama(st.suku1, 'u1') +
      stepPertama(st.beda) +
      rumusPertama(st.rumus) +
      tryPertama(st.kode, 'benar');
  });
  DATA.misiDuaSuku.soal.forEach(function (s) {
    var st = State.dua[s.id];
    maks += 4;
    benar +=
      stepPertama(st.beda) + stepPertama(st.suku1) + rumusPertama(st.rumus) + stepPertama(st.nomor);
  });
  DATA.misiKonteks.soal.forEach(function (s) {
    var st = State.konteks[s.id];
    maks += 4;
    benar +=
      tryPertama(st.ab, s.abBenar) +
      rumusPertama(st.rumus) +
      stepPertama(st.jawab) +
      tryPertama(st.makna, s.maknaBenar);
  });
  [State.nhtRumus, State.nhtDua, State.nhtKonteks].forEach(function (c) {
    maks += 1;
    if (nhtCallSelesai(c)) benar += 1;
  });
  return { benar: benar, maks: maks };
}

function kuisSkor() {
  return {
    benar: State.kuisExercises.filter(function (e) {
      return e.correct && e.attempts === 1 && !e.revealed;
    }).length,
    maks: KUIS_SOAL.length,
  };
}

function poinTim() {
  var m = misiSkor();
  var k = kuisSkor();
  return Math.round((50 * m.benar) / m.maks + (50 * k.benar) / k.maks);
}

function renderPenghargaan(container) {
  var D = DATA.penghargaan;
  var m = misiSkor();
  var k = kuisSkor();
  var poin = poinTim();
  var award = coopAwardLevel(poin);

  var nhtHTML = [
    ['Misi 1 — Rakit Rumus', State.nhtRumus],
    ['Misi 2 — Dua Suku', State.nhtDua],
    ['Misi 3 — Konteks', State.nhtKonteks],
  ]
    .map(function (p) {
      var x = p[1] && p[1].nomor ? nhtAnggotaBernomor(State.timAnggota, p[1].nomor) : null;
      return (
        '<li><strong>' +
        esc(p[0]) +
        ':</strong> ' +
        (x ? 'nomor ' + x.nomor + ' — ' + esc(x.nama) + (nhtCallSelesai(p[1]) ? ' ✓' : '') : '—') +
        '</li>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Penghargaan Tim">' +
    buildHead(D) +
    '<div class="coop-award">' +
    '<span class="coop-award__ikon" aria-hidden="true">' +
    award.ikon +
    '</span>' +
    '<p class="coop-award__label">' +
    esc(award.label) +
    '</p>' +
    '<p class="coop-award__tim">' +
    esc(State.timNama || 'Tim kalian') +
    (State.timAnggota.length
      ? ' — ' +
        esc(
          State.timAnggota
            .map(function (x) {
              return x.nama;
            })
            .join(', ')
        )
      : '') +
    '</p>' +
    '<p style="margin:0;">' +
    esc(award.teks) +
    '</p>' +
    '</div>' +
    buildDlPanel(
      '<div class="summary-grid">' +
        kartuRingkas(m.benar + '/' + m.maks, 'Skor misi tim (percobaan pertama + penjelasan)') +
        kartuRingkas(k.benar + '/' + k.maks, 'Skor kuis individu') +
        kartuRingkas(poin, 'Poin tim (0–100)') +
        '</div>' +
        '<p class="dl-caption" style="margin-top:var(--space-3);">' +
        esc(D.bobot) +
        ' Predikat: Tim Super ≥ 85, Tim Hebat ≥ 70, Tim Baik &lt; 70.</p>'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🎲 Yang menjelaskan saat nomornya dipanggil</h3><ul class="nht-rekap">' +
        nhtHTML +
        '</ul>'
    ) +
    buildDlPanel(buildTextarea('pujianTa', D.pujianLabel, State.pujian, D.pujianPlaceholder)) +
    buildDlNextButton('penghargaanNextBtn', D.nextLabel) +
    '</section>';

  bindTextarea('pujianTa', 'pujian');
  bindNext('penghargaanNextBtn', 'penghargaan', 'refleksi');
}

/* ============================================================
   13. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    buildHead(D) +
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

  bindNext('refleksiSaveBtn', 'refleksi', 'selesai', function () {
    if (!State.refleksiDiri) {
      showNotice('Pilih dulu seberapa yakin kamu sekarang.');
      return false;
    }
    return true;
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
    '<div class="panel panel--hero done-card__list">' +
    '<h3 style="margin-top:0;">' +
    esc(DATA.informasi.aturanJudul) +
    '</h3>' +
    '<p class="rumus-kartu">Uₙ = a + (n − 1)b  ⇔  Uₙ = bn + (a − b)</p>' +
    buildAturan() +
    buildKode(DATA.informasi.kode) +
    '</div>' +
    '<div class="panel done-card__list">' +
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
    'Poin tim adalah indikator latihan digital, bukan nilai akhir. ' +
    'Penjelasan lisan anggota yang nomornya dipanggil, catatan tim, dan refleksi murid menjadi bahan asesmen formatif utama.' +
    '</div></div>' +
    '<div class="btn-group btn-group--center">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '<button type="button" class="btn btn--outline-primary" id="reviewBtn">Tinjau Ulang</button>' +
    '</div>' +
    '</div>' +
    '</section>';

  completeStage('selesai');

  document.getElementById('reviewBtn').addEventListener('click', function () {
    navigateTo('tujuan');
  });
}

/* ============================================================
   15. ROUTER, MODAL RESET, INIT
   ============================================================ */

var RENDERERS = {
  tujuan: renderTujuan,
  informasi: renderInformasi,
  tim: renderTim,
  misiRumus: renderMisiRumus,
  misiDuaSuku: renderMisiDuaSuku,
  misiKonteks: renderMisiKonteks,
  kuis: renderKuis,
  penghargaan: renderPenghargaan,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  var fn = RENDERERS[State.currentStage] || RENDERERS.tujuan;
  fn(container);
}

function showResetModal() {
  var modal = document.getElementById('resetModal');
  if (modal) modal.style.display = 'flex';
}

function hideResetModal() {
  var modal = document.getElementById('resetModal');
  if (modal) modal.style.display = 'none';
}

function init() {
  buildStageNav();
  loadState();
  if (STAGES.indexOf(State.currentStage) === -1) State.currentStage = 'tujuan';
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
      navigateTo('tujuan');
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
