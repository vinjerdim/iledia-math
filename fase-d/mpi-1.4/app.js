'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Membandingkan & Mengurutkan Pecahan dalam Kehidupan
   Sehari-hari — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen umum: buildDiscoveryHead, buildTeacherNote,
       buildChoiceGroup, buildGuidedQuizList, buildSortItems,
       buildDlPanel, buildDlNextButton, buildFeedbackBox;
     • seksi 10 & 35 (tampilan pecahan): buildFractionModel,
       buildPecahanTampil, bacaPecahanKonteks;
     • seksi 12 (Cooperative Learning): assignCoopRoles,
       coopRoleAssignment, buildCoopRoleBar, buildCoopTeamCard,
       coopAwardLevel;
     • seksi 15 (pecahan): buildFracStripCompare, buildFracNumberLine,
       renderFracText, ensureOrderState, buildOrderBoard, bindOrderBoard;
     • seksi 36 (banding pecahan dalam konteks): STRATEGI_BANDING_PECAHAN,
       strategiBerlaku, penjelasanStrategi, diagnosaBandingPecahan,
       pesanBandingPecahan, opsiMaknaBandingPecahan, urutanIdPecahan,
       garisPecahanRentang, buildKalimatBandingPecahan,
       buildPilihSimbolPecahan.

   Alur tahap mengikuti sintaks Cooperative Learning (Arends) tipe
   Jigsaw: setiap anggota tim asal memegang kartu AHLI satu strategi
   membandingkan pecahan (dibagikan acak), belajar di kelompok ahli,
   lalu memandu tim asal. Lihat komentar kepala pada data.js.

   PENGACAKAN: seluruh pilihan jawaban (dugaan, pertanyaan penuntun,
   lambang <, >, =, strategi, makna perbandingan, pernyataan diskusi,
   soal & opsi kuis, penilaian diri), kartu yang diurutkan, dan kartu
   ahli DIACAK dengan shuffleArray() melalui ensureShuffledOrder() /
   ensureOrderState() / ensureSortStates() / assignCoopRoles().
   Pengacakan dilakukan SEKALI saat state disiapkan
   (initExerciseArrays) lalu disimpan di State — bukan saat render —
   sehingga pilihan tidak melompat saat dirender ulang, tetapi teracak
   ulang untuk setiap tim dan setiap Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Tujuan          (CL fase 1)
    6. Stage: Informasi       (CL fase 2)
    7. Stage: Tim Asal        (CL fase 3)
    8. Stage: Kelompok Ahli   (CL fase 4 — Jigsaw)
    9. Stage: Misi Bandingkan (CL fase 4)
   10. Stage: Misi Urutkan    (CL fase 4)
   11. Stage: Misi Diskusi    (CL fase 4)
   12. Stage: Kuis Individu   (CL fase 5)
   13. Stage: Penghargaan     (CL fase 6)
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
var STORAGE_KEY = 'mpi-d-1-4-banding-pecahan-v1';

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
  penuntunOrders: {},
  penuntunPilih: {},

  /* Tahap 3 — tim asal & kartu ahli */
  timNama: '',
  timInput: ['', '', '', ''],
  timAnggota: [],
  timSepakat: {},

  /* Tahap 4 — kelompok ahli */
  ahliTab: null,
  ahli: {},

  /* Tahap 5 — misi bandingkan */
  bandingIdx: 0,
  banding: {},
  bandingCatatan: '',

  /* Tahap 6 — misi urutkan */
  urutIdx: 0,
  urut: {},

  /* Tahap 7 — misi diskusi */
  diskusiStates: {},
  diskusiOrder: null,
  diskusiJubir: '',

  /* Tahap 8 — kuis */
  kuisPick: null,
  kuisIdx: 0,
  kuisExercises: [],

  /* Tahap 9 — penghargaan */
  pujian: '',

  /* Tahap 10 — refleksi */
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

function ensureAhliState(stasiun) {
  var map = ensureMap('ahli');
  var st = ensureMapIn(map, stasiun.id);
  st.ajar = !!st.ajar;
  var soal = ensureMapIn(st, 'soal');
  stasiun.soal.forEach(function (s) {
    var ss = ensureMapIn(soal, s.id);
    ensureTry(ss, 'sym');
    ensureShuffledOrder(ss, 'symOrder', COMPARE_SYMBOLS);
  });
  return st;
}

function ensureBandingState(s) {
  var map = ensureMap('banding');
  var st = ensureMapIn(map, s.id);
  ensureTry(st, 'strat');
  ensureShuffledOrder(st, 'stratOrder', opsiStrategiBanding());
  ensureTry(st, 'sym');
  ensureShuffledOrder(st, 'symOrder', COMPARE_SYMBOLS);
  ensureTry(st, 'makna');
  ensureShuffledOrder(st, 'maknaOrder', opsiMaknaBandingPecahan(s.tema, s.a.p, s.b.p));
  return st;
}

function ensureUrutState(s) {
  var map = ensureMap('urut');
  return ensureOrderState(map, s.id, s.items);
}

/*
 * Soal kuis yang sedang dipakai (salinan dengan token pecahan sudah
 * dirender). Array ini DIISI ULANG di tempat (bukan diganti) karena
 * createExerciseStage menyimpan referensinya.
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
      cerita: fxt(s.cerita),
      pertanyaan: fx(s.pertanyaan),
      options: fxOpsi(s.options),
      correct: s.correct,
      explanation: fx(s.explanation),
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
  ensureListOrders('penuntunOrders', DATA.informasi.penuntun);
  ensureMap('penuntunPilih');

  /* Tahap 3 */
  if (!Array.isArray(State.timInput) || State.timInput.length !== DATA.tim.maksAnggota) {
    State.timInput = [];
    for (var i = 0; i < DATA.tim.maksAnggota; i++) State.timInput.push('');
  }
  if (!Array.isArray(State.timAnggota)) State.timAnggota = [];
  ensureMap('timSepakat');

  /* Tahap 4 */
  DATA.ahli.stasiun.forEach(ensureAhliState);
  if (optionIds(DATA.ahli.stasiun).indexOf(State.ahliTab) === -1) {
    State.ahliTab = DATA.ahli.stasiun[0].id;
  }

  /* Tahap 5–6 */
  DATA.misiBanding.soal.forEach(ensureBandingState);
  if (!(State.bandingIdx >= 0 && State.bandingIdx < DATA.misiBanding.soal.length)) {
    State.bandingIdx = 0;
  }
  DATA.misiUrut.soal.forEach(ensureUrutState);
  if (!(State.urutIdx >= 0 && State.urutIdx < DATA.misiUrut.soal.length)) State.urutIdx = 0;

  /* Tahap 7 */
  ensureSortStates(
    State,
    'diskusiStates',
    'diskusiOrder',
    DATA.misiDiskusi.pernyataan,
    DATA.misiDiskusi.opsi
  );

  /* Tahap 8 — soal dipilih acak dari bank; opsi tiap soal diacak */
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
  if (!(State.kuisIdx >= 0 && State.kuisIdx < KUIS_SOAL.length)) State.kuisIdx = 0;

  /* Tahap 10 */
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

/* HTML tepercaya dari DATA: token {a/b} → pecahan bersusun. */
function fx(html) {
  return renderFracText(html);
}

/* Teks biasa dari DATA: di-escape lalu token pecahannya dirender. */
function fxt(text) {
  return renderFracText(esc(text));
}

/* Salinan daftar opsi dengan label ber-token pecahan sudah dirender. */
function fxOpsi(list) {
  return list.map(function (o) {
    return { id: o.id, label: fx(o.label) };
  });
}

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
        return '<li>' + fx(a) + '</li>';
      })
      .join('') +
    '</ul>'
  );
}

/* Bilah peran tim untuk misi ke-`ronde` (peran dirotasi). */
function buildPeranMisi(ronde) {
  return buildCoopRoleBar(State.timAnggota, ronde, {
    title: 'Peran pada misi ini — ' + (State.timNama || 'tim kalian'),
  });
}

/* Nama anggota yang memegang kartu ahli strategi `id` (atau ''). */
function namaAhli(id) {
  if (!State.timAnggota.length) return '';
  var p = coopRoleAssignment(State.timAnggota, 0, STRATEGI_BANDING_PECAHAN).filter(function (x) {
    return x.role.id === id;
  })[0];
  return p ? p.nama : '';
}

/* Kartu strategi: ikon, nama, ahli yang memegang, kalimat kunci. */
function buildStrategiCard(s, opts) {
  opts = opts || {};
  var ahli = namaAhli(s.id);
  return (
    '<div class="strategi-card">' +
    '<span class="strategi-card__ikon" aria-hidden="true">' +
    s.ikon +
    '</span>' +
    '<div><p class="strategi-card__nama">' +
    esc(s.nama) +
    (ahli ? ' <span class="strategi-card__ahli">· ' + esc(ahli) + '</span>' : '') +
    '</p>' +
    '<p class="strategi-card__kunci">' +
    (opts.kunciLabel ? '<strong>' + esc(opts.kunciLabel) + '</strong> ' : '') +
    fxt(s.kunci) +
    '</p></div>' +
    '</div>'
  );
}

/* Kotak konteks: ikon (tema atau `ikon` eksplisit) + cerita. */
function buildKonteks(tema, cerita, ikon) {
  var K = KATA_BANDING_PECAHAN[tema];
  return (
    '<div class="misi-konteks">' +
    '<span class="misi-konteks__ikon" aria-hidden="true">' +
    (ikon || (K ? K.ikon : '📍')) +
    '</span>' +
    '<p>' +
    fxt(cerita) +
    '</p>' +
    '</div>'
  );
}

/* Bilah progres "Soal i dari n" untuk misi bertahap. */
function buildMisiProgress(total, idx, doneFn) {
  var statuses = [];
  for (var i = 0; i < total; i++) statuses.push(doneFn(i) ? 'correct' : '');
  return buildProgressDots(total, idx, statuses);
}

/* Pecahan positif kurang dari 1 (bisa digambar sebagai pita). */
function bisaPita(p) {
  var v = pecahanBiasaBertanda(p);
  return v.num >= 0 && v.num <= v.den;
}

/*
 * Visual pembanding sekumpulan pecahan: pita sama panjang bila semuanya
 * pecahan biasa di antara 0 dan 1; selain itu garis bilangan.
 *   list  [{ p, nama }]
 *   opts.strategi  'samakanPenyebut' → pita dibagi KPK; 'patokan' → garis ½
 *   opts.half      true → garis ½ pada pita
 *   opts.garisSaja true → selalu garis bilangan (untuk memeriksa urutan)
 */
function buildVisualPecahan(list, opts) {
  opts = opts || {};
  var fracs = list.map(function (it) {
    var p = pecahanDari(it.p);
    return {
      num: p.num,
      den: p.den,
      whole: p.whole,
      neg: p.neg,
      nama: it.nama || '',
    };
  });
  var dens = fracs.map(function (f) {
    return f.den;
  });
  var k = kpkBanyak(dens);
  if (
    !opts.garisSaja &&
    list.every(function (it) {
      return bisaPita(it.p);
    })
  ) {
    return buildFracStripCompare(fracs, {
      common: opts.strategi === 'samakanPenyebut' && k <= 24 ? k : 0,
      half: opts.strategi === 'patokan' || opts.half,
    });
  }
  var r = garisPecahanRentang(
    list.map(function (it) {
      return it.p;
    })
  );
  return buildFracNumberLine(fracs, {
    min: r.min,
    max: r.max,
    ticks: k * (r.max - r.min) <= 24 ? k : 0,
  });
}

/* Umpan balik lambang pecahan berdiagnosa. */
function buildSymFeedback(a, b, st) {
  if (!st.chosen) return '';
  var diag = diagnosaBandingPecahan(a, b, st.chosen);
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(
      diag === 'benar' ? 'success' : 'warning',
      diag === 'benar' ? '✓' : '💭',
      fx(pesanBandingPecahan(diag, a, b))
    ) +
    '</div>'
  );
}

/* ============================================================
   5. STAGE: TUJUAN  (Cooperative Learning — fase 1)
   Murid mengamati martabak dan MENDUGA. Tidak dinilai.
   ============================================================ */

function dugaanLengkap() {
  return DATA.tujuan.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function renderTujuan(container) {
  var D = DATA.tujuan;
  var lengkap = dugaanLengkap();

  var tokohHTML = D.tokoh
    .map(function (t) {
      var p = pecahanDari(t.p);
      return (
        '<div class="tokoh-card">' +
        buildFractionModel(p.num, p.den, 0, { shape: 'circle', small: true }) +
        '<p class="tokoh-card__nama">' +
        esc(t.nama) +
        '</p>' +
        '<p class="tokoh-card__pecahan">' +
        buildPecahanTampil(p) +
        '</p>' +
        '<p class="dl-caption">' +
        esc(t.teks) +
        '</p>' +
        '</div>'
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
        q.tanya +
        '</p>' +
        buildChoiceGroup(fxOpsi(q.opsi), State.dugaanOrders[q.id], {
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
      '<h2 style="margin-top:0;">🥞 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="tokoh-row">' +
        tokohHTML +
        '</div>',
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
   Pita pecahan & garis bilangan → pertanyaan penuntun (opsi acak)
   → aturan umum & cek dugaan tahap 1.
   ============================================================ */

/* Pertanyaan penuntun dengan token pecahan sudah dirender. */
function penuntunTampil() {
  return DATA.informasi.penuntun.map(function (q) {
    var umpan = {};
    Object.keys(q.umpan).forEach(function (k) {
      umpan[k] = fx(q.umpan[k]);
    });
    return { id: q.id, tanya: fx(q.tanya), opsi: fxOpsi(q.opsi), correct: q.correct, umpan: umpan };
  });
}

function buildCekDugaan() {
  var T = DATA.tujuan;
  var byId = {};
  T.tokoh.forEach(function (t) {
    byId[t.id] = t;
  });
  return T.dugaan
    .map(function (q) {
      var pilih = State.dugaanPilih[q.id];
      var kunci = T.kunciDugaan[q.id];
      var cocok = pilih === kunci;
      var kk = byId[kunci];
      return buildFeedbackBox(
        cocok ? 'success' : 'info',
        cocok ? '✓' : '💡',
        '<strong>' +
          (q.id === 'banyak' ? 'Paling banyak' : 'Paling sedikit') +
          ':</strong> ' +
          esc(kk.nama) +
          ' (' +
          fx('{' + kk.p + '}') +
          ' martabak). ' +
          (cocok
            ? 'Dugaanmu tepat!'
            : 'Dugaanmu: ' +
              esc(pilih ? byId[pilih].nama : '—') +
              '. Sekarang kamu tahu alasannya.')
      );
    })
    .join('');
}

function renderInformasi(container) {
  var D = DATA.informasi;
  var T = DATA.tujuan;
  var list = penuntunTampil();
  var penuntunBenar = guidedQuizAllCorrect(list, State.penuntunPilih);
  var rerender = function () {
    renderInformasi(container);
  };
  var tokoh = T.tokoh.map(function (t) {
    return { p: t.p, nama: t.nama };
  });

  container.innerHTML =
    '<section aria-label="Menyajikan Informasi">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.pengantar) +
        '</p>' +
        buildVisualPecahan(tokoh, { half: true }) +
        '<p class="dl-caption">Garis putus-putus menandai setengah (½). Pada garis bilangan 0–1:</p>' +
        buildVisualPecahan(tokoh, { garisSaja: true })
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">➖ ' +
        esc(D.perluasan.judul) +
        '</h3>' +
        '<p>' +
        fxt(D.perluasan.teks) +
        '</p>' +
        buildFracNumberLine(D.perluasan.pecahan.map(pecahanDari), {
          min: D.perluasan.garis.min,
          max: D.perluasan.garis.max,
          ticks: 4,
        })
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🧭 Pertanyaan penuntun</h3>' +
        buildGuidedQuizList(list, State.penuntunOrders, State.penuntunPilih)
    ) +
    (penuntunBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📌 ' + esc(D.aturanJudul) + '</h3>' + buildAturan(),
          'panel--hero'
        ) +
        buildDlPanel(
          '<h3 style="margin-top:0;">🔁 ' + esc(D.dugaanJudul) + '</h3>' + buildCekDugaan()
        ) +
        buildDlNextButton('informasiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindGuidedQuizList(container, list, State.penuntunPilih, saveState, rerender);
  bindNext('informasiNextBtn', 'informasi', 'tim');
}

/* ============================================================
   7. STAGE: TIM ASAL  (Cooperative Learning — fase 3)
   Kartu ahli (4 strategi) dibagikan acak kepada anggota.
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

/* true bila anggota yang terisi berbeda dari anggota yang sudah diberi kartu. */
function timBerubah() {
  var a = timNamaTerisi().slice().sort();
  var b = State.timAnggota.slice().sort();
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
    '<section aria-label="Bentuk Tim Asal">' +
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
          '<h3 style="margin-top:0;">🃏 ' +
            esc(D.ahliJudul) +
            '</h3>' +
            buildCoopTeamCard(State.timNama, State.timAnggota, 0, STRATEGI_BANDING_PECAHAN) +
            '<p class="dl-caption" style="margin-top:var(--space-3);">🧩 ' +
            esc(D.ahliCatatan) +
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
    /* Nama anggota diubah setelah kartu dibagikan → bagikan ulang. */
    inp.addEventListener('change', function () {
      if (State.timAnggota.length && timBerubah()) {
        State.timAnggota = [];
        saveState();
        showNotice('Daftar anggota berubah. Tekan "Bagikan Kartu Ahli" lagi.');
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
    State.timAnggota = assignCoopRoles(State.timInput);
    saveState();
    renderTim(container);
  });

  bindNext('timNextBtn', 'tim', 'ahli', function () {
    if (!timSepakatSemua()) {
      showNotice('Centang semua kesepakatan tim sebelum menuju kelompok ahli.');
      return false;
    }
    return true;
  });
}

/* ============================================================
   8. STAGE: KELOMPOK AHLI  (Cooperative Learning — fase 4, Jigsaw)
   Empat stasiun strategi. Tiap stasiun: contoh + kalimat kunci
   (dipelajari di kelompok ahli) → ahli mengajar tim asal (centang)
   → dua soal lambang berdiagnosa (urutan lambang acak).
   ============================================================ */

function stasiunById(id) {
  return DATA.ahli.stasiun.filter(function (s) {
    return s.id === id;
  })[0];
}

function soalAhliBenar(stasiun, s) {
  var st = State.ahli[stasiun.id].soal[s.id].sym;
  return st.chosen === simbolBandingPecahan(s.a, s.b);
}

function stasiunSelesai(stasiun) {
  return (
    State.ahli[stasiun.id].ajar &&
    stasiun.soal.every(function (s) {
      return soalAhliBenar(stasiun, s);
    })
  );
}

function ahliSemuaSelesai() {
  return DATA.ahli.stasiun.every(stasiunSelesai);
}

/* Soal ahli ber-id unik → { stasiun, soal }. */
function cariSoalAhli(id) {
  var hasil = null;
  DATA.ahli.stasiun.forEach(function (st) {
    st.soal.forEach(function (s) {
      if (s.id === id) hasil = { stasiun: st, soal: s };
    });
  });
  return hasil;
}

function renderAhli(container) {
  var D = DATA.ahli;
  var stasiun = stasiunById(State.ahliTab);
  var info = strategiBandingInfo(stasiun.id);
  var st = State.ahli[stasiun.id];
  var ahli = namaAhli(stasiun.id);
  var idx = D.stasiun.indexOf(stasiun);
  var rerender = function () {
    renderAhli(container);
  };
  var C = stasiun.contoh;

  var tabs = D.stasiun
    .map(function (s) {
      var inf = strategiBandingInfo(s.id);
      var aktif = s.id === stasiun.id;
      var nama = namaAhli(s.id);
      return (
        '<button type="button" class="ahli-tab' +
        (aktif ? ' is-active' : '') +
        (stasiunSelesai(s) ? ' is-done' : '') +
        '" data-ahli-tab="' +
        s.id +
        '" aria-pressed="' +
        (aktif ? 'true' : 'false') +
        '">' +
        '<span class="ahli-tab__ikon" aria-hidden="true">' +
        inf.ikon +
        '</span>' +
        '<span class="ahli-tab__nama">' +
        esc(inf.nama) +
        (nama ? '<span class="ahli-tab__ahli">' + esc(nama) + '</span>' : '') +
        '</span>' +
        (stasiunSelesai(s) ? '<span class="ahli-tab__cek" aria-label="selesai">✓</span>' : '') +
        '</button>'
      );
    })
    .join('');

  var soalHTML = stasiun.soal
    .map(function (s, i) {
      var ss = st.soal[s.id];
      var benar = soalAhliBenar(stasiun, s);
      return (
        '<div class="quiz-item">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        fxt(s.cerita) +
        '</p>' +
        buildKalimatBandingPecahan(s.a, s.b, benar ? ss.sym.chosen : null) +
        buildPilihSimbolPecahan(s.a, s.b, ss.symOrder, ss.sym, { group: s.id }) +
        buildSymFeedback(s.a, s.b, ss.sym) +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Kelompok Ahli">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    '<div class="ahli-tabs" role="group" aria-label="Stasiun ahli">' +
    tabs +
    '</div>' +
    '<div class="panel">' +
    '<p class="dl-caption" style="margin-top:0;">Stasiun ' +
    (idx + 1) +
    ' dari ' +
    D.stasiun.length +
    (ahli ? ' · Ahli: <strong>' + esc(ahli) + '</strong>' : '') +
    '</p>' +
    buildStrategiCard(info, { kunciLabel: 'Kalimat kunci:' }) +
    '<h3 class="misi-sub">① Contoh (pelajari di kelompok ahli)</h3>' +
    buildKonteks(null, C.cerita, info.ikon) +
    buildVisualPecahan(
      [
        { p: C.a, nama: C.nama[0] },
        { p: C.b, nama: C.nama[1] },
      ],
      { strategi: stasiun.id }
    ) +
    buildFeedbackBox('info', info.ikon, fx(penjelasanStrategi(stasiun.id, C.a, C.b))) +
    '<label class="sepakat-item ahli-ajar"><input type="checkbox" id="ahliAjar"' +
    (st.ajar ? ' checked' : '') +
    '><span>' +
    esc(D.ajarLabel) +
    '</span></label>' +
    '<h3 class="misi-sub">② Soal tim asal (dipandu ahli)</h3>' +
    soalHTML +
    '</div>' +
    '<div class="btn-group btn-group--spread">' +
    (idx > 0
      ? '<button type="button" class="btn btn--ghost" id="ahliPrev">← Stasiun Sebelumnya</button>'
      : '<span></span>') +
    (idx < D.stasiun.length - 1
      ? '<button type="button" class="btn btn--outline-primary" id="ahliNextTab">Stasiun Berikutnya →</button>'
      : '') +
    '</div>' +
    (ahliSemuaSelesai()
      ? buildDlPanel(
          buildFeedbackBox(
            'success',
            '🧩',
            '<strong>Semua ahli sudah mengajar!</strong> Tim kalian kini menguasai empat strategi. Di misi berikutnya, ahli strategi yang dipilih memimpin perhitungan.'
          )
        ) + buildDlNextButton('ahliNextBtn', D.nextLabel)
      : '') +
    '</section>';

  container.querySelectorAll('[data-ahli-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.ahliTab = btn.dataset.ahliTab;
      saveState();
      rerender();
    });
  });

  var ajar = document.getElementById('ahliAjar');
  ajar.addEventListener('change', function () {
    st.ajar = ajar.checked;
    saveState();
    rerender();
  });

  bindPilihSimbolPecahan(
    container,
    function (group) {
      var f = cariSoalAhli(group);
      return f ? [f.soal.a, f.soal.b] : null;
    },
    function (group) {
      var f = cariSoalAhli(group);
      return f ? State.ahli[f.stasiun.id].soal[group].sym : null;
    },
    saveState,
    rerender
  );

  function pindah(delta) {
    State.ahliTab = D.stasiun[idx + delta].id;
    saveState();
    rerender();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  var prev = document.getElementById('ahliPrev');
  if (prev) {
    prev.addEventListener('click', function () {
      pindah(-1);
    });
  }
  var next = document.getElementById('ahliNextTab');
  if (next) {
    next.addEventListener('click', function () {
      pindah(1);
    });
  }
  bindNext('ahliNextBtn', 'ahli', 'misiBanding');
}

/* ============================================================
   9. STAGE: MISI 1 — BANDINGKAN  (Cooperative Learning — fase 4)
   Per soal: pilih strategi (acak; semua strategi yang BERLAKU
   diterima) → ahli strategi itu memimpin → pilih lambang (diagnosa
   miskonsepsi) → pilih makna konteks (opsi dari engine, diacak).
   ============================================================ */

function stratSah(s, id) {
  return strategiBerlaku(s.a.p, s.b.p).indexOf(id) !== -1;
}

function bandingSelesai(s) {
  var st = State.banding[s.id];
  return !!st && st.makna.chosen === idMaknaBandingPecahan(s.a.p, s.b.p);
}

function bandingSemuaSelesai() {
  return DATA.misiBanding.soal.every(bandingSelesai);
}

/* Alasan strategi `id` tidak bisa dipakai untuk pasangan s. */
function alasanTidakBerlaku(id) {
  return (
    {
      penyebutSama: 'penyebut kedua pecahan tidak sama.',
      pembilangSama: 'pembilang kedua pecahan tidak sama.',
      patokan: 'tidak ada patokan ½ atau 1 yang memisahkan kedua pecahan.',
    }[id] || 'strategi itu tidak cocok untuk pasangan ini.'
  );
}

function buildStratFeedback(s, st) {
  var ch = st.strat.chosen;
  if (!ch) return '';
  var info = strategiBandingInfo(ch);
  if (!stratSah(s, ch)) {
    return (
      '<div style="margin-top:var(--space-3);">' +
      buildFeedbackBox(
        'warning',
        '💭',
        '<strong>' +
          esc(info.nama) +
          '</strong> belum bisa dipakai di sini karena ' +
          esc(alasanTidakBerlaku(ch)) +
          ' Diskusikan lagi: strategi ahli mana yang cocok?'
      ) +
      '</div>'
    );
  }
  var tercepat = strategiBandingPecahan(s.a.p, s.b.p);
  var ahli = namaAhli(ch);
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(
      'success',
      info.ikon,
      '<strong>Bisa!</strong> ' +
        (ahli ? '<strong>' + esc(ahli) + '</strong> (' + esc(info.nama) + ')' : esc(info.nama)) +
        ' memimpin perhitungan: ' +
        fxt(info.kunci) +
        (ch !== tercepat
          ? ' <em>Jalan pintas: ' +
            esc(strategiBandingInfo(tercepat).nama) +
            ' juga bisa dipakai dan lebih cepat.</em>'
          : '')
    ) +
    '</div>'
  );
}

function buildMaknaFeedback(s, st) {
  var ch = st.makna.chosen;
  if (!ch) return '';
  var benarId = idMaknaBandingPecahan(s.a.p, s.b.p);
  var benar = ch === benarId;
  var kalimat = fx(kalimatBandingPecahan(s.a.p, s.b.p));
  var html = benar
    ? '<strong>Tepat!</strong> ' +
      kalimat +
      ', jadi ' +
      esc(s.a.teks) +
      ' <strong>' +
      esc(maknaBandingPecahan(s.a.p, s.b.p, s.tema)) +
      '</strong> dibandingkan ' +
      esc(s.b.teks) +
      '.'
    : 'Belum tepat. Ingat lambang yang sudah kalian pilih: ' +
      kalimat +
      '. Pecahan yang lebih kecil berarti "' +
      esc(kataBandingPecahanUntuk(s.tema, s.a.p, s.b.p).kecil) +
      '".';
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(benar ? 'success' : 'warning', benar ? '✓' : '💭', html) +
    '</div>'
  );
}

function renderMisiBanding(container) {
  var D = DATA.misiBanding;
  var idx = State.bandingIdx;
  var s = D.soal[idx];
  var st = State.banding[s.id];
  var stratOk = !!st.strat.chosen && stratSah(s, st.strat.chosen);
  var symBenar = st.sym.chosen === simbolBandingPecahan(s.a.p, s.b.p);
  var selesai = bandingSelesai(s);
  var semua = bandingSemuaSelesai();
  var rerender = function () {
    renderMisiBanding(container);
  };

  container.innerHTML =
    '<section aria-label="Misi 1: Bandingkan">' +
    buildHead(D) +
    buildPeranMisi(D.ronde) +
    buildDlPanel(buildLangkah(D.langkah), 'panel--compact') +
    '<div class="panel">' +
    buildMisiProgress(D.soal.length, idx, function (i) {
      return bandingSelesai(D.soal[i]);
    }) +
    buildKonteks(s.tema, s.cerita) +
    '<div class="pasangan">' +
    [s.a, s.b]
      .map(function (x) {
        return (
          '<div class="pasangan__item"><span class="pasangan__teks">' +
          esc(x.teks) +
          '</span>' +
          buildPecahanTampil(pecahanDari(x.p), 'large') +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    '<h3 class="misi-sub">① Strategi ahli mana yang bisa dipakai?</h3>' +
    buildChoiceGroup(opsiStrategiBanding(), st.stratOrder, {
      chosen: st.strat.chosen,
      correctId: stratOk ? st.strat.chosen : null,
      grade: true,
      locked: stratOk,
      group: s.id,
      attr: 'data-strat',
    }) +
    buildStratFeedback(s, st) +
    (stratOk
      ? '<h3 class="misi-sub">② Pilih lambang yang tepat</h3>' +
        buildKalimatBandingPecahan(s.a.p, s.b.p, symBenar ? st.sym.chosen : null) +
        '<p class="dl-caption misi-label-ab">' +
        esc(s.a.teks) +
        ' ☐ ' +
        esc(s.b.teks) +
        '</p>' +
        buildPilihSimbolPecahan(s.a.p, s.b.p, st.symOrder, st.sym, { group: s.id }) +
        buildSymFeedback(s.a.p, s.b.p, st.sym) +
        (symBenar
          ? buildVisualPecahan(
              [
                { p: s.a.p, nama: s.a.teks },
                { p: s.b.p, nama: s.b.teks },
              ],
              { strategi: st.strat.chosen }
            )
          : '')
      : '') +
    (symBenar
      ? '<h3 class="misi-sub">③ ' +
        esc(s.tanyaMakna) +
        '</h3>' +
        buildChoiceGroup(opsiMaknaBandingPecahan(s.tema, s.a.p, s.b.p), st.maknaOrder, {
          chosen: st.makna.chosen,
          correctId: selesai ? st.makna.chosen : null,
          grade: true,
          locked: selesai,
          group: s.id,
          attr: 'data-makna',
        }) +
        buildMaknaFeedback(s, st)
      : '') +
    '</div>' +
    '<div class="btn-group btn-group--spread">' +
    (idx > 0
      ? '<button type="button" class="btn btn--ghost" id="bandingPrevSoal">← Situasi Sebelumnya</button>'
      : '<span></span>') +
    (selesai && idx < D.soal.length - 1
      ? '<button type="button" class="btn btn--primary" id="bandingNextSoal">Situasi Berikutnya →</button>'
      : '') +
    '</div>' +
    (semua
      ? buildDlPanel(
          buildTextarea(
            'bandingCatatan',
            D.catatanLabel,
            State.bandingCatatan,
            D.catatanPlaceholder
          )
        ) + buildDlNextButton('bandingNextBtn', D.nextLabel)
      : '') +
    '</section>';

  container.querySelectorAll('[data-strat]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (stratOk) return;
      st.strat.chosen = btn.dataset.strat;
      if (!stratSah(s, st.strat.chosen)) st.strat.wrong += 1;
      saveState();
      rerender();
    });
  });
  bindPilihSimbolPecahan(
    container,
    function () {
      return [s.a.p, s.b.p];
    },
    function () {
      return st.sym;
    },
    saveState,
    rerender
  );
  container.querySelectorAll('[data-makna]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (bandingSelesai(s)) return;
      st.makna.chosen = btn.dataset.makna;
      if (!bandingSelesai(s)) st.makna.wrong += 1;
      saveState();
      rerender();
    });
  });

  var nextSoal = document.getElementById('bandingNextSoal');
  if (nextSoal) {
    nextSoal.addEventListener('click', function () {
      State.bandingIdx = idx + 1;
      saveState();
      rerender();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  var prevSoal = document.getElementById('bandingPrevSoal');
  if (prevSoal) {
    prevSoal.addEventListener('click', function () {
      State.bandingIdx = idx - 1;
      saveState();
      rerender();
    });
  }
  bindTextarea('bandingCatatan', 'bandingCatatan');
  bindNext('bandingNextBtn', 'misiBanding', 'misiUrut');
}

/* ============================================================
   10. STAGE: MISI 2 — URUTKAN  (Cooperative Learning — fase 4)
   Per set: ketuk kartu (kolam acak) sesuai arah naik/turun → cek
   pada garis bilangan.
   ============================================================ */

function urutSelesai(s) {
  var st = State.urut[s.id];
  return !!st && st.checked && st.correct;
}

function urutSemuaSelesai() {
  return DATA.misiUrut.soal.every(urutSelesai);
}

function urutKartu(s) {
  return s.items.map(function (it) {
    var p = pecahanDari(it.p);
    return {
      id: it.id,
      html: buildPecahanTampil(p) + '<span class="order-card__teks">' + esc(it.teks) + '</span>',
      aria: it.teks + ', ' + bacaPecahanKonteks(p),
    };
  });
}

function renderMisiUrut(container) {
  var D = DATA.misiUrut;
  var idx = State.urutIdx;
  var s = D.soal[idx];
  var st = State.urut[s.id];
  var answer = urutanIdPecahan(s.items, s.arah);
  var selesai = urutSelesai(s);
  var rerender = function () {
    renderMisiUrut(container);
  };
  var byId = {};
  s.items.forEach(function (it) {
    byId[it.id] = it;
  });

  container.innerHTML =
    '<section aria-label="Misi 2: Urutkan">' +
    buildHead(D) +
    buildPeranMisi(D.ronde) +
    buildDlPanel(buildLangkah(D.langkah), 'panel--compact') +
    '<div class="panel">' +
    buildMisiProgress(D.soal.length, idx, function (i) {
      return urutSelesai(D.soal[i]);
    }) +
    '<p class="dl-caption">Urutkan <strong>' +
    (s.arah === 'naik' ? 'naik (terkecil → terbesar)' : 'turun (terbesar → terkecil)') +
    '</strong></p>' +
    buildKonteks(s.tema, s.cerita) +
    buildOrderBoard('urutPapan', urutKartu(s), st, {
      correct: answer,
      fromLabel: s.fromLabel,
      toLabel: s.toLabel,
    }) +
    (st.checked && !st.correct
      ? buildFeedbackBox(
          'warning',
          '💭',
          'Belum tepat — posisi merah perlu diperbaiki. Kelompokkan dulu: pecahan negatif, di bawah ½, di atas ½, lalu lebih dari 1. Minta ahli yang cocok membandingkan kartu yang berdekatan.'
        )
      : '') +
    (selesai
      ? buildFeedbackBox(
          'success',
          '✓',
          '<strong>Urutannya tepat!</strong> ' +
            answer
              .map(function (id) {
                return esc(byId[id].teks) + ' (' + esc(tulisPecahan(pecahanDari(byId[id].p))) + ')';
              })
              .join(' → ')
        ) +
        '<p class="dl-caption">Periksa pada garis bilangan: urutan ' +
        (s.arah === 'naik'
          ? 'naik dibaca dari kiri ke kanan.'
          : 'turun dibaca dari kanan ke kiri.') +
        '</p>' +
        buildVisualPecahan(
          s.items.map(function (it) {
            return { p: it.p, nama: it.teks };
          }),
          { garisSaja: true }
        )
      : '') +
    '</div>' +
    '<div class="btn-group btn-group--spread">' +
    (idx > 0
      ? '<button type="button" class="btn btn--ghost" id="urutPrevSoal">← Set Sebelumnya</button>'
      : '<span></span>') +
    (selesai && idx < D.soal.length - 1
      ? '<button type="button" class="btn btn--primary" id="urutNextSoal">Set Berikutnya →</button>'
      : '') +
    '</div>' +
    (urutSemuaSelesai() ? buildDlNextButton('urutNextBtn', D.nextLabel) : '') +
    '</section>';

  bindOrderBoard(container, 'urutPapan', st, {
    correct: answer,
    save: saveState,
    rerender: rerender,
  });

  var nextSoal = document.getElementById('urutNextSoal');
  if (nextSoal) {
    nextSoal.addEventListener('click', function () {
      State.urutIdx = idx + 1;
      saveState();
      rerender();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  var prevSoal = document.getElementById('urutPrevSoal');
  if (prevSoal) {
    prevSoal.addEventListener('click', function () {
      State.urutIdx = idx - 1;
      saveState();
      rerender();
    });
  }
  bindNext('urutNextBtn', 'misiUrut', 'misiDiskusi');
}

/* ============================================================
   11. STAGE: MISI 3 — CEK PENDAPAT TEMAN  (CL fase 4)
   Pernyataan Benar/Salah (urutan pernyataan & opsi diacak), dijawab
   sekali setelah tim sepakat; Juru Bicara menulis penjelasan.
   ============================================================ */

function pernyataanTampil() {
  return DATA.misiDiskusi.pernyataan.map(function (p) {
    return { id: p.id, teks: fx(p.teks), correct: p.correct, explanation: fx(p.explanation) };
  });
}

function renderMisiDiskusi(container) {
  var D = DATA.misiDiskusi;
  var list = pernyataanTampil();
  var selesai = sortItemsAllAnswered(list, State.diskusiStates);
  var rerender = function () {
    renderMisiDiskusi(container);
  };

  container.innerHTML =
    '<section aria-label="Misi 3: Cek Pendapat Teman">' +
    buildHead(D) +
    buildPeranMisi(D.ronde) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    '<details class="panel panel--compact strategi-ringkas">' +
    '<summary>🧩 Kartu strategi para ahli</summary>' +
    '<div class="strategi-grid">' +
    STRATEGI_BANDING_PECAHAN.map(function (s) {
      return buildStrategiCard(s);
    }).join('') +
    '</div>' +
    '</details>' +
    buildDlPanel(buildSortItems(list, State.diskusiOrder, D.opsi, State.diskusiStates)) +
    (selesai
      ? buildDlPanel(
          buildTextarea('diskusiJubir', D.jubirLabel, State.diskusiJubir, D.jubirPlaceholder)
        ) + buildDlNextButton('diskusiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, list, State.diskusiStates, saveState, rerender);
  bindTextarea('diskusiJubir', 'diskusiJubir');
  bindNext('diskusiNextBtn', 'misiDiskusi', 'kuis', function () {
    if (!State.diskusiJubir.trim()) {
      showNotice('Juru Bicara menuliskan penjelasan tim lebih dulu.');
      return false;
    }
    return true;
  });
}

/* ============================================================
   12. STAGE: KUIS INDIVIDU  (Cooperative Learning — fase 5)
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
      makna: '💬 Makna dalam konteks',
      ekstrem: '🔎 Terkecil / terbesar',
      urut: '📶 Urutan',
      strategi: '🧩 Strategi ahli',
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
   13. STAGE: PENGHARGAAN  (Cooperative Learning — fase 6)
   Skor misi & stasiun = benar pada percobaan pertama; skor kuis =
   benar tanpa percobaan ulang/ungkap jawaban.
   ============================================================ */

/* Skor stasiun ahli: { benar, maks } per stasiun. */
function skorStasiun(stasiun) {
  var benar = 0;
  stasiun.soal.forEach(function (s) {
    var sym = State.ahli[stasiun.id].soal[s.id].sym;
    if (soalAhliBenar(stasiun, s) && !sym.wrong) benar += 1;
  });
  return { benar: benar, maks: stasiun.soal.length };
}

function misiSkor() {
  var benar = 0;
  var maks = 0;
  DATA.ahli.stasiun.forEach(function (stasiun) {
    var sk = skorStasiun(stasiun);
    benar += sk.benar;
    maks += sk.maks;
  });
  DATA.misiBanding.soal.forEach(function (s) {
    var st = State.banding[s.id];
    maks += 3;
    if (st && bandingSelesai(s)) {
      if (!st.strat.wrong) benar += 1;
      if (!st.sym.wrong) benar += 1;
      if (!st.makna.wrong) benar += 1;
    }
  });
  DATA.misiUrut.soal.forEach(function (s) {
    var st = State.urut[s.id];
    maks += 1;
    if (urutSelesai(s) && st.attempts === 1) benar += 1;
  });
  maks += DATA.misiDiskusi.pernyataan.length;
  benar += sortItemsCorrectCount(DATA.misiDiskusi.pernyataan, State.diskusiStates);
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

  var ahliHTML = DATA.ahli.stasiun
    .map(function (stasiun) {
      var info = strategiBandingInfo(stasiun.id);
      var sk = skorStasiun(stasiun);
      var nama = namaAhli(stasiun.id);
      return (
        '<li><span aria-hidden="true">' +
        info.ikon +
        '</span> <strong>' +
        esc(nama || '—') +
        '</strong> — ' +
        esc(info.nama) +
        ' <span class="dl-caption">(soal stasiun benar percobaan pertama: ' +
        sk.benar +
        '/' +
        sk.maks +
        ')</span></li>'
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
    (State.timAnggota.length ? ' — ' + esc(State.timAnggota.join(', ')) : '') +
    '</p>' +
    '<p style="margin:0;">' +
    esc(award.teks) +
    '</p>' +
    '</div>' +
    buildDlPanel(
      '<div class="summary-grid">' +
        kartuRingkas(m.benar + '/' + m.maks, 'Skor stasiun & misi tim (percobaan pertama)') +
        kartuRingkas(k.benar + '/' + k.maks, 'Skor kuis individu') +
        kartuRingkas(poin, 'Poin tim (0–100)') +
        '</div>' +
        '<p class="dl-caption" style="margin-top:var(--space-3);">' +
        esc(D.bobot) +
        ' Predikat: Tim Super ≥ 85, Tim Hebat ≥ 70, Tim Baik &lt; 70.</p>'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🧩 Para ahli tim kalian</h3><ul class="ahli-rekap">' +
        ahliHTML +
        '</ul>'
    ) +
    buildDlPanel(buildTextarea('pujianTa', D.pujianLabel, State.pujian, D.pujianPlaceholder)) +
    buildDlNextButton('penghargaanNextBtn', D.nextLabel) +
    '</section>';

  bindTextarea('pujianTa', 'pujian');
  bindNext('penghargaanNextBtn', 'penghargaan', 'refleksi');
}

/* ============================================================
   14. STAGE: REFLEKSI
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
    '<div class="panel panel--hero done-card__list">' +
    '<h3 style="margin-top:0;">🧩 Empat strategi para ahli</h3>' +
    '<div class="strategi-grid">' +
    STRATEGI_BANDING_PECAHAN.map(function (s) {
      return buildStrategiCard(s);
    }).join('') +
    '</div>' +
    '</div>' +
    '<div class="panel done-card__list">' +
    '<h3 style="margin-top:0;">' +
    esc(DATA.informasi.aturanJudul) +
    '</h3>' +
    buildAturan() +
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
    'Penjelasan lisan para ahli, catatan Juru Bicara, dan refleksi murid menjadi bahan asesmen formatif utama.' +
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
   16. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  tujuan: renderTujuan,
  informasi: renderInformasi,
  tim: renderTim,
  ahli: renderAhli,
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
