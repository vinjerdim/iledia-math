'use strict';

/* ============================================================
   app.js — Logika media pembelajaran
   Matematika: Membandingkan & Mengurutkan Bilangan Berpangkat Bulat
   Fase D — SMP Kelas VIII · Cooperative Learning (NHT)

   Konten ada di data.js; utilitas bersama (pengacakan, mesin tahap,
   komponen NHT, kartu ketuk, pemilahan, perbandingan & diagnosa
   bilangan berpangkat, lab timbang pangkat) ada di shared/engine.js
   seksi 11, 12, 13 & 51.

   Isi berkas:
     1. Konstanta
     2. State & storage (termasuk SELURUH pengacakan opsi)
     3. Navigasi
     4. Utilitas render
     5. Tahap Tujuan
     6. Tahap Informasi
     7. Tahap Tim & Nomor Kepala
     8. Tahap Misi 1 — Bandingkan!
     9. Tahap Misi 2 — Urutkan!
    10. Tahap Misi 3 — Cek Pendapat Teman
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
var STORAGE_KEY = 'mpi-12-3-banding-pangkat-v1';

/* Lambang → id makna konteks (p lebih besar, q lebih besar, sama). */
var MAKNA_DARI_SIMBOL = { gt: 'p', lt: 'q', eq: 'sama' };

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
  lab: null,
  penuntunOrders: {},
  penuntunPilih: {},

  /* Tahap 3 — tim & nomor kepala */
  timNama: '',
  timInput: ['', '', '', ''],
  timAnggota: [],
  timSepakat: {},

  /* Tahap 4 — misi bandingkan */
  bandingIdx: 0,
  banding: {},
  nhtBanding: null,

  /* Tahap 5 — misi urutkan */
  urutIdx: 0,
  urut: {},
  nhtUrut: null,

  /* Tahap 6 — misi diskusi */
  diskusiStates: {},
  diskusiOrder: null,
  diskusiCatatan: '',
  nhtDiskusi: null,

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

function ensureCall(key) {
  if (!State[key] || typeof State[key] !== 'object') State[key] = makeNhtCall();
  return State[key];
}

function ensureIdx(key, list) {
  if (!(State[key] >= 0 && State[key] < list.length)) State[key] = 0;
}

function pangkatValid(x) {
  return (
    !!x &&
    typeof x === 'object' &&
    Number.isInteger(x.a) &&
    Number.isInteger(x.n) &&
    x.a !== 0 &&
    x.a >= LAB_BANDING_PANGKAT_BATAS.aMin &&
    x.a <= LAB_BANDING_PANGKAT_BATAS.aMaks &&
    x.n >= LAB_BANDING_PANGKAT_BATAS.nMin &&
    x.n <= LAB_BANDING_PANGKAT_BATAS.nMaks
  );
}

/* Lab timbang: pasangan awal langsung tercatat sebagai strategi pertama. */
function ensureLabState() {
  var st = State.lab;
  if (!st || !pangkatValid(st.p) || !pangkatValid(st.q) || !Array.isArray(st.strategi)) {
    State.lab = makeLabBandingPangkatState();
  }
  catatLabBandingPangkat(State.lab);
}

/* Opsi strategi untuk tombol pilihan (label HTML ber-ikon). */
function opsiStrategi() {
  return opsiStrategiBandingPangkat().map(function (s) {
    return { id: s.id, label: s.ikon + ' ' + esc(s.label) };
  });
}

/* Misi 1: strategi (acak) → lambang (acak, berdiagnosa) → makna (acak). */
function ensureBandingState(s) {
  var st = ensureMapIn(ensureMap('banding'), s.id);
  ensureTry(st, 'strategi');
  ensureShuffledOrder(st, 'strategiOrder', opsiStrategi());
  if (!st.sym || typeof st.sym !== 'object') st.sym = { chosen: null, wrong: 0, diag: null };
  ensureShuffledOrder(st, 'symOrder', COMPARE_SYMBOLS);
  ensureTry(st, 'makna');
  ensureShuffledOrder(st, 'maknaOrder', s.makna);
  return st;
}

/* Misi 2: kartu diacak (dijamin bukan urutan benar). */
function ensureUrutState(s) {
  var st = ensureMapIn(ensureMap('urut'), s.id);
  ensureTapOrderState(st, 'tap', s.items, urutanIdPangkat(s.items, s.arah));
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
      type: 'choice',
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
  ensureLabState();
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
  DATA.misiBanding.soal.forEach(ensureBandingState);
  ensureIdx('bandingIdx', DATA.misiBanding.soal);
  ensureCall('nhtBanding');

  DATA.misiUrut.soal.forEach(ensureUrutState);
  ensureIdx('urutIdx', DATA.misiUrut.soal);
  ensureCall('nhtUrut');

  ensureSortStates(
    State,
    'diskusiStates',
    'diskusiOrder',
    DATA.misiDiskusi.pernyataan,
    DATA.misiDiskusi.opsi
  );
  if (typeof State.diskusiCatatan !== 'string') State.diskusiCatatan = '';
  ensureCall('nhtDiskusi');

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
function buildSoalNav(prefix, idx, total, selesai, kata) {
  kata = kata || 'Soal';
  return (
    '<div class="btn-group btn-group--spread">' +
    (idx > 0
      ? '<button type="button" class="btn btn--ghost" id="' +
        prefix +
        'Prev">← ' +
        kata +
        ' Sebelumnya</button>'
      : '<span></span>') +
    (selesai && idx < total - 1
      ? '<button type="button" class="btn btn--primary" id="' +
        prefix +
        'NextSoal">' +
        kata +
        ' Berikutnya →</button>'
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

/* Kartu strategi (kartu ringkasan tahap Informasi & Selesai). */
function buildKartuStrategi() {
  var contoh = DATA.informasi.strategiContoh;
  return (
    '<div class="pkt-strategi">' +
    opsiStrategiBandingPangkat()
      .map(function (s) {
        return (
          '<div class="pkt-strategi__kartu">' +
          '<p class="pkt-strategi__judul"><span aria-hidden="true">' +
          s.ikon +
          '</span> ' +
          esc(s.label) +
          '</p>' +
          '<p class="pkt-strategi__aturan">' +
          esc(s.aturan) +
          '</p>' +
          '<p class="pkt-strategi__contoh">' +
          esc(contoh[s.id]) +
          '</p>' +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
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
   5. STAGE: TUJUAN  (Cooperative Learning — fase 1)
   Kartu "Adu Pangkat" & dugaan (tidak dinilai).
   ============================================================ */

function dugaanLengkap() {
  return DATA.tujuan.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function buildKartuTujuan() {
  return (
    '<div class="pkt-kartu-grid">' +
    DATA.tujuan.kartu
      .map(function (k) {
        return (
          '<div class="pkt-kartu">' +
          '<span class="pkt-kartu__ikon" aria-hidden="true">' +
          k.ikon +
          '</span>' +
          '<span class="pkt-kartu__label">' +
          esc(k.label) +
          '</span>' +
          '<span class="pkt-chip" aria-label="' +
          esc(teksPangkat(k.p)) +
          '">' +
          pangkatHTML(k.p) +
          '</span>' +
          '<span class="pkt-kartu__satuan">' +
          esc(k.satuan) +
          '</span>' +
          '</div>'
        );
      })
      .join('') +
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
      '<h2 style="margin-top:0;">⚖️ ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        buildKartuTujuan(),
      'panel--hero'
    ) +
    buildTpPanel(D) +
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
   Lab timbang (≥ target strategi) → pertanyaan penuntun (opsi acak)
   → kartu strategi, mengurutkan, dan cek dugaan tahap 1.
   ============================================================ */

function buildCekDugaan() {
  var T = DATA.tujuan;
  return T.dugaan
    .map(function (q) {
      var pilih = State.dugaanPilih[q.id];
      var kunci = T.kunciDugaan[q.id];
      var cocok = pilih === kunci;
      var alasan = q.p ? ' ' + esc(alasanBandingPangkat(q.p, q.q)) : '';
      return buildFeedbackBox(
        cocok ? 'success' : 'info',
        cocok ? '✓' : '💡',
        '<strong>' +
          esc(q.tanya) +
          '</strong><br>Jawaban: ' +
          esc(findOptionLabel(q.opsi, kunci)) +
          '.' +
          alasan +
          ' ' +
          (cocok
            ? 'Dugaanmu tepat!'
            : 'Dugaanmu: ' +
              esc(findOptionLabel(q.opsi, pilih) || '—') +
              '. Sekarang kamu tahu alasannya.')
      );
    })
    .join('');
}

function labSelesai() {
  return State.lab.strategi.length >= DATA.informasi.labTarget;
}

function renderInformasi(container) {
  var D = DATA.informasi;
  var labOk = labSelesai();
  var penuntunBenar = guidedQuizAllCorrect(D.penuntun, State.penuntunPilih);
  var rerender = function () {
    renderInformasi(container);
  };

  container.innerHTML =
    '<section aria-label="Menyajikan Informasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">⚖️ ' +
        esc(D.labJudul) +
        '</h3>' +
        '<p>' +
        esc(D.labPengantar) +
        '</p>' +
        buildLabBandingPangkat('labPangkat', State.lab, { target: D.labTarget }) +
        '<details class="pkt-saran"><summary>💡 Butuh ide pasangan bilangan?</summary>' +
        buildLangkah(D.labSaran) +
        '</details>' +
        (labOk
          ? buildFeedbackBox(
              'success',
              '🎉',
              'Hebat! Kalian sudah menemukan ' +
                State.lab.strategi.length +
                ' strategi berbeda. Boleh terus bereksperimen, lalu jawab pertanyaan penuntun di bawah.'
            )
          : '')
    ) +
    (labOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🧭 Pertanyaan penuntun</h3>' +
            buildGuidedQuizList(D.penuntun, State.penuntunOrders, State.penuntunPilih)
        )
      : '') +
    (labOk && penuntunBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📌 ' +
            esc(D.strategiJudul) +
            '</h3>' +
            buildKartuStrategi() +
            '<h4 class="misi-sub">📶 ' +
            esc(D.urutJudul) +
            '</h4>' +
            '<p style="margin:0;">' +
            esc(D.urutTeks) +
            '</p>',
          'panel--hero'
        ) +
        buildDlPanel(
          '<h3 style="margin-top:0;">🔁 ' + esc(D.dugaanJudul) + '</h3>' + buildCekDugaan()
        ) +
        buildDlNextButton('informasiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindLabBandingPangkat(container, 'labPangkat', State.lab, saveState, rerender);
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
    State.nhtBanding = makeNhtCall();
    State.nhtUrut = makeNhtCall();
    State.nhtDiskusi = makeNhtCall();
    saveState();
    renderTim(container);
  });

  bindNext('timNextBtn', 'tim', 'misiBanding', function () {
    if (!timSepakatSemua()) {
      showNotice('Centang semua kesepakatan tim sebelum memulai misi.');
      return false;
    }
    return true;
  });
}

/* ============================================================
   8. STAGE: MISI 1 — BANDINGKAN!  (Cooperative Learning — fase 4)
   Per pasangan: ① pilih strategi (acak) → ② pilih lambang (acak,
   diagnosa miskonsepsi) → ③ pilih makna konteks (acak).
   ============================================================ */

function maknaBenar(s) {
  return MAKNA_DARI_SIMBOL[simbolBandingPangkat(s.p, s.q)];
}

function bandingSelesai(s) {
  var st = State.banding[s.id];
  return !!st && st.makna.chosen === maknaBenar(s);
}

function bandingSemuaSelesai() {
  return DATA.misiBanding.soal.every(bandingSelesai);
}

/* Petunjuk saat strategi yang dipilih kurang cocok untuk p ☐ q. */
function petunjukStrategi(pilih, p, q) {
  var negatif = p.a < 0 || q.a < 0;
  if (pilih === 'hitungNilai') {
    return 'Menghitung nilai memang selalu bisa, tetapi di sini ada cara yang lebih cepat. Perhatikan basis dan pangkatnya.';
  }
  if (negatif) {
    return 'Ada basis negatif! Aturan cepat tidak berlaku begitu saja — tentukan dulu tanda nilainya (pangkat ganjil → negatif, genap → positif).';
  }
  if (p.n === 0 || q.n === 0) {
    return 'Ada pangkat 0. Ingat patokan: a⁰ = 1. Bandingkan dengan patokan 1.';
  }
  if (pilih === 'basisSama') {
    return 'Basisnya tidak sama (' + p.a + ' dan ' + q.a + '). Cari strategi lain.';
  }
  if (pilih === 'pangkatSama') {
    return (
      'Pangkatnya tidak sama (' +
      formatNumber(p.n, '−') +
      ' dan ' +
      formatNumber(q.n, '−') +
      '). Cari strategi lain.'
    );
  }
  if (p.a === q.a) return 'Basisnya sudah sama — tidak perlu disamakan lagi.';
  if (p.n === q.n) return 'Pangkatnya sudah sama — ada cara yang lebih cepat.';
  return (
    'Basis ' +
    p.a +
    ' dan ' +
    q.a +
    ' tidak bisa ditulis sebagai pangkat dari basis yang sama. Cari strategi lain.'
  );
}

function renderMisiBanding(container) {
  var D = DATA.misiBanding;
  var idx = State.bandingIdx;
  var s = D.soal[idx];
  var st = State.banding[s.id];
  var stratBenar = strategiBandingPangkat(s.p, s.q);
  var symBenar = simbolBandingPangkat(s.p, s.q);
  var stratOk = st.strategi.chosen === stratBenar;
  var symOk = st.sym.chosen === symBenar;
  var mBenar = maknaBenar(s);
  var selesai = bandingSelesai(s);
  var semua = bandingSemuaSelesai();
  var rerender = function () {
    renderMisiBanding(container);
  };

  container.innerHTML =
    '<section aria-label="Misi 1: Bandingkan">' +
    buildHead(D) +
    buildTimMisi() +
    buildDlPanel(buildLangkah(D.langkah), 'panel--compact') +
    '<div class="panel">' +
    buildMisiProgress(D.soal.length, idx, function (i) {
      return bandingSelesai(D.soal[i]);
    }) +
    buildKonteks(s.ikon, s.cerita) +
    buildKalimatBandingPangkat(s.p, s.q, symOk ? symBenar : null) +
    '<h3 class="misi-sub">① Strategi yang paling cocok adalah …</h3>' +
    buildTryGroup(opsiStrategi(), st.strategiOrder, st.strategi, stratBenar, s.id, 'data-strat') +
    buildTryFeedback(
      st.strategi,
      stratBenar,
      'Tepat! ' +
        esc(
          opsiStrategiBandingPangkat().filter(function (o) {
            return o.id === stratBenar;
          })[0].aturan
        ),
      esc(petunjukStrategi(st.strategi.chosen, s.p, s.q))
    ) +
    (stratOk
      ? '<h3 class="misi-sub">② Lambang yang tepat adalah …</h3>' +
        buildPilihSimbolPangkat(s.p, s.q, st.symOrder, st.sym, { group: s.id })
      : '') +
    (symOk
      ? '<h3 class="misi-sub">③ ' +
        esc(s.maknaTanya) +
        '</h3>' +
        buildTryGroup(s.makna, st.maknaOrder, st.makna, mBenar, s.id, 'data-makna') +
        buildTryFeedback(
          st.makna,
          mBenar,
          'Benar! Karena ' + esc(kalimatBandingPangkat(s.p, s.q)) + '.',
          'Belum cocok. Lihat lagi lambangnya: ' +
            esc(kalimatBandingPangkat(s.p, s.q)) +
            '. Bilangan pertama adalah milik yang disebut pertama dalam cerita.'
        )
      : '') +
    '</div>' +
    buildSoalNav('bd', idx, D.soal.length, selesai) +
    (semua
      ? buildNhtMisi('nhtBanding', State.nhtBanding, D.nhtTugas) +
        buildDlNextButton('misiBandingNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindTryGroup(container, 'data-strat', st.strategi, stratBenar, rerender);
  bindPilihSimbolPangkat(
    container,
    function () {
      return [s.p, s.q];
    },
    function () {
      return st.sym;
    },
    saveState,
    rerender
  );
  bindTryGroup(container, 'data-makna', st.makna, mBenar, rerender);
  bindSoalNav('bd', 'bandingIdx', rerender);
  bindNhtCall(container, 'nhtBanding', State.timAnggota, State.nhtBanding, saveState, rerender);
  bindNext('misiBandingNextBtn', 'misiBanding', 'misiUrut', nhtGuard(State.nhtBanding));
}

/* ============================================================
   9. STAGE: MISI 2 — URUTKAN!  (Cooperative Learning — fase 4)
   Kartu diacak; tim menyusun naik/turun dengan ketukan.
   ============================================================ */

function urutSelesai(s) {
  var st = State.urut[s.id];
  return !!st && st.tap.correct;
}

function urutSemuaSelesai() {
  return DATA.misiUrut.soal.every(urutSelesai);
}

function urutKartu(s) {
  return s.items.map(function (it) {
    return {
      id: it.id,
      label:
        '<span class="pkt-chip">' +
        pangkatHTML(it) +
        '</span><span class="tap-order__teks">' +
        esc(it.teks) +
        '</span>',
      aria: teksPangkat(it) + ', ' + it.teks,
    };
  });
}

function buildBantuanNilai(s) {
  return (
    '<details class="pkt-saran"><summary>🧮 Butuh bantuan? Lihat nilai setiap kartu</summary>' +
    '<ul class="pkt-nilai-list">' +
    s.items
      .map(function (it) {
        return '<li>' + esc(teksNilaiPangkat(it)) + ' <span>(' + esc(it.teks) + ')</span></li>';
      })
      .join('') +
    '</ul></details>'
  );
}

function renderMisiUrut(container) {
  var D = DATA.misiUrut;
  var idx = State.urutIdx;
  var s = D.soal[idx];
  var st = State.urut[s.id];
  var answer = urutanIdPangkat(s.items, s.arah);
  var semua = urutSemuaSelesai();
  var rerender = function () {
    renderMisiUrut(container);
  };

  container.innerHTML =
    '<section aria-label="Misi 2: Urutkan">' +
    buildHead(D) +
    buildTimMisi() +
    buildDlPanel(buildLangkah(D.langkah), 'panel--compact') +
    '<div class="panel">' +
    buildMisiProgress(D.soal.length, idx, function (i) {
      return urutSelesai(D.soal[i]);
    }) +
    '<h3 class="misi-sub" style="margin-top:0;">' +
    esc(s.judul) +
    '</h3>' +
    buildKonteks(s.ikon, s.cerita) +
    '<p class="dl-caption">Urutkan <strong>' +
    (s.arah === 'naik' ? 'naik (terkecil → terbesar)' : 'turun (terbesar → terkecil)') +
    '</strong></p>' +
    buildTapOrder('urutKartu', urutKartu(s), st.tap, {
      answer: answer,
      startLabel: s.startLabel,
      endLabel: s.endLabel,
      separator: s.separator,
      wrongText: esc(D.salahTeks),
      successText:
        '<strong>Urutannya tepat!</strong> ' +
        esc(
          urutkanPangkat(s.items, s.arah)
            .map(teksPangkat)
            .join(' ' + s.separator + ' ')
        ),
    }) +
    (st.tap.correct ? '' : buildBantuanNilai(s)) +
    '</div>' +
    buildSoalNav('ur', idx, D.soal.length, urutSelesai(s), 'Set') +
    (semua
      ? buildNhtMisi('nhtUrut', State.nhtUrut, D.nhtTugas) +
        buildDlNextButton('misiUrutNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindTapOrder(container, 'urutKartu', st.tap, answer, saveState, rerender);
  bindSoalNav('ur', 'urutIdx', rerender);
  bindNhtCall(container, 'nhtUrut', State.timAnggota, State.nhtUrut, saveState, rerender);
  bindNext('misiUrutNextBtn', 'misiUrut', 'misiDiskusi', nhtGuard(State.nhtUrut));
}

/* ============================================================
   10. STAGE: MISI 3 — CEK PENDAPAT TEMAN  (CL fase 4)
   Pernyataan Benar/Salah (urutan pernyataan & opsi diacak), dijawab
   sekali setelah tim sepakat; catatan tim + panggil nomor.
   ============================================================ */

function renderMisiDiskusi(container) {
  var D = DATA.misiDiskusi;
  var selesai = sortItemsAllAnswered(D.pernyataan, State.diskusiStates);
  var rerender = function () {
    renderMisiDiskusi(container);
  };

  container.innerHTML =
    '<section aria-label="Misi 3: Cek Pendapat Teman">' +
    buildHead(D) +
    buildTimMisi() +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(buildSortItems(D.pernyataan, State.diskusiOrder, D.opsi, State.diskusiStates)) +
    (selesai
      ? buildDlPanel(
          buildTextarea(
            'diskusiCatatan',
            D.catatanLabel,
            State.diskusiCatatan,
            D.catatanPlaceholder
          )
        ) +
        buildNhtMisi('nhtDiskusi', State.nhtDiskusi, D.nhtTugas) +
        buildDlNextButton('diskusiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, D.pernyataan, State.diskusiStates, saveState, rerender);
  bindTextarea('diskusiCatatan', 'diskusiCatatan');
  bindNhtCall(container, 'nhtDiskusi', State.timAnggota, State.nhtDiskusi, saveState, rerender);
  bindNext('diskusiNextBtn', 'misiDiskusi', 'kuis', function () {
    if (!State.diskusiCatatan.trim()) {
      showNotice('Tuliskan catatan tim lebih dulu.');
      return false;
    }
    return nhtGuard(State.nhtDiskusi)();
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
      lambang: '⚖️ Lambang perbandingan',
      ekstrem: '🔎 Terbesar / terkecil',
      urut: '📶 Urutan',
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
  return tr && tr.chosen === correctId && !tr.wrong ? 1 : 0;
}

function misiSkor() {
  var benar = 0;
  var maks = 0;
  DATA.misiBanding.soal.forEach(function (s) {
    var st = State.banding[s.id];
    maks += 3;
    benar +=
      tryPertama(st.strategi, strategiBandingPangkat(s.p, s.q)) +
      tryPertama(st.sym, simbolBandingPangkat(s.p, s.q)) +
      tryPertama(st.makna, maknaBenar(s));
  });
  DATA.misiUrut.soal.forEach(function (s) {
    var st = State.urut[s.id];
    maks += 1;
    if (st.tap.correct && st.tap.attempts === 1) benar += 1;
  });
  maks += DATA.misiDiskusi.pernyataan.length;
  benar += sortItemsCorrectCount(DATA.misiDiskusi.pernyataan, State.diskusiStates);
  [State.nhtBanding, State.nhtUrut, State.nhtDiskusi].forEach(function (c) {
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
    ['Misi 1 — Bandingkan!', State.nhtBanding],
    ['Misi 2 — Urutkan!', State.nhtUrut],
    ['Misi 3 — Cek Pendapat', State.nhtDiskusi],
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
    esc(DATA.informasi.strategiJudul) +
    '</h3>' +
    buildKartuStrategi() +
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
  misiBanding: renderMisiBanding,
  misiUrut: renderMisiUrut,
  misiDiskusi: renderMisiDiskusi,
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
