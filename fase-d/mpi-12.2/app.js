'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Sifat-sifat Operasi Bilangan Berpangkat Bulat
   Fase D — SMP Kelas VIII · Topik 12

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen umum: buildDiscoveryHead, buildTeacherNote,
       buildChoiceGroup, buildGuidedQuizList, buildSortItems,
       buildDlPanel, buildDlNextButton, buildFeedbackBox,
       buildProgressDots;
     • seksi 12 (Cooperative Learning): buildCoopRoleBar,
       coopAwardLevel;
     • seksi 30 (sifat eksponen): buildFactorTiles, buildPolaEksponen,
       polaSemuaBenar, diagnosaPolaBaris, formatPangkat,
       tulisPerkalianBerulang;
     • seksi 44 (penerapan sifat & Jigsaw): SIFAT_PANGKAT_AHLI,
       buildSifatStep, langkahRantai, teksRantai, jigsawKartuAhli,
       buildJigsawTabs, buildJigsawTeamCard, buildCoopTeamSetup,
       buildSifatAhliCard.

   Alur tahap mengikuti sintaks Cooperative Learning (Arends) tipe
   Jigsaw: setiap anggota tim asal memegang kartu AHLI satu sifat
   (dibagikan acak), menemukan sifat itu di kelompok ahli, lalu
   mengajarkannya dan memimpin langkah bersifat sama di misi tim.
   Lihat komentar kepala pada data.js.

   PENGACAKAN: seluruh pilihan jawaban (dugaan, pertanyaan penuntun,
   hubungan eksponen di stasiun ahli, pilihan sifat di setiap langkah
   misi, pernyataan diskusi, soal & opsi kuis, penilaian diri) dan
   kartu ahli DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder() / ensureSortStates() / assignCoopRoles().
   Pengacakan dilakukan SEKALI saat state disiapkan
   (initExerciseArrays) lalu disimpan di State — bukan saat render —
   sehingga pilihan tidak melompat saat dirender ulang, tetapi teracak
   ulang untuk setiap tim dan setiap Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Tujuan            (CL fase 1)
    6. Stage: Informasi         (CL fase 2)
    7. Stage: Tim Asal          (CL fase 3)
    8. Stage: Kelompok Ahli     (CL fase 4 — Jigsaw)
    9. Stage: Misi Sederhanakan (CL fase 4)
   10. Stage: Misi Rantai Sifat (CL fase 4)
   11. Stage: Misi Diskusi      (CL fase 4)
   12. Stage: Kuis Individu     (CL fase 5)
   13. Stage: Penghargaan       (CL fase 6)
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
var STORAGE_KEY = 'mpi-d-12-2-sifat-pangkat-v1';
var KARTU_AHLI = SIFAT_PANGKAT_AHLI;
var TANPA_PILIH = { pilihSifat: false };

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

  /* Tahap 3 — tim asal & kartu ahli: { nama, input, anggota, sepakat } */
  tim: null,

  /* Tahap 4 — kelompok ahli */
  ahliTab: null,
  ahli: {},

  /* Tahap 5 — misi sederhanakan */
  sederhanaIdx: 0,
  sederhana: {},

  /* Tahap 6 — misi rantai */
  rantaiIdx: 0,
  rantai: {},

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

/* State satu langkah sifat + urutan acak pilihan sifatnya. */
function ensureStepIn(obj, key) {
  var st = obj[key];
  if (!st || typeof st !== 'object' || Array.isArray(st)) {
    st = makeSifatStepState();
    obj[key] = st;
  }
  var dasar = makeSifatStepState();
  Object.keys(dasar).forEach(function (k) {
    if (st[k] === undefined) st[k] = dasar[k];
  });
  ensureShuffledOrder(st, 'sifatOrder', opsiSifatPangkat());
  return st;
}

function ensureAhliState(stasiun) {
  var st = ensureMapIn(State.ahli, stasiun.id);
  ensureMapIn(st, 'pola');
  st.polaCek = !!st.polaCek;
  ensureMapIn(st, 'tanyaOrders');
  ensureShuffledOrder(st.tanyaOrders, stasiun.tanya.id, stasiun.tanya.opsi);
  ensureMapIn(st, 'tanyaPilih');
  st.ajar = !!st.ajar;
  var soal = ensureMapIn(st, 'soal');
  stasiun.soal.forEach(function (s) {
    ensureStepIn(soal, s.id);
  });
  return st;
}

/* Langkah-langkah rantai (dihitung dari DATA, tidak disimpan). */
var RANTAI_LANGKAH = {};
DATA.misiRantai.soal.forEach(function (r) {
  RANTAI_LANGKAH[r.id] = langkahRantai(r);
});

function ensureRantaiState(r) {
  var map = ensureMap('rantai');
  var L = RANTAI_LANGKAH[r.id];
  if (!Array.isArray(map[r.id]) || map[r.id].length !== L.length) map[r.id] = [];
  L.forEach(function (s, i) {
    ensureStepIn(map[r.id], i);
  });
  return map[r.id];
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
    KUIS_SOAL.push(byId[id]);
  });
}

/*
 * Menyiapkan seluruh state per-langkah DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1–2 */
  ensureListOrders('dugaanOrders', DATA.tujuan.dugaan);
  ensureMap('dugaanPilih');
  ensureListOrders('penuntunOrders', DATA.informasi.penuntun);
  ensureMap('penuntunPilih');

  /* Tahap 3 */
  State.tim = ensureCoopTeamSetupState(State.tim, DATA.tim);

  /* Tahap 4 */
  ensureMap('ahli');
  DATA.ahli.stasiun.forEach(ensureAhliState);
  if (optionIds(DATA.ahli.stasiun).indexOf(State.ahliTab) === -1) {
    State.ahliTab = DATA.ahli.stasiun[0].id;
  }

  /* Tahap 5–6 */
  var sederhana = ensureMap('sederhana');
  DATA.misiSederhana.soal.forEach(function (s) {
    ensureStepIn(sederhana, s.id);
  });
  if (!(State.sederhanaIdx >= 0 && State.sederhanaIdx < DATA.misiSederhana.soal.length)) {
    State.sederhanaIdx = 0;
  }
  DATA.misiRantai.soal.forEach(ensureRantaiState);
  if (!(State.rantaiIdx >= 0 && State.rantaiIdx < DATA.misiRantai.soal.length)) {
    State.rantaiIdx = 0;
  }

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

function kartuRingkas(val, label) {
  return (
    '<div class="summary-card"><div class="summary-card__val">' +
    val +
    '</div><div class="summary-card__label">' +
    label +
    '</div></div>'
  );
}

/* Anggota tim yang sudah menerima kartu (urutan acak). */
function anggota() {
  return State.tim.anggota;
}

/* Nama pemegang kartu ahli `op` ('' bila kartu belum dibagikan). */
function namaAhli(op) {
  return namaPemegangKartu(anggota(), KARTU_AHLI, op);
}

/* Bilah peran tim untuk misi ke-`ronde` (peran dirotasi). */
function buildPeranMisi(ronde) {
  return buildCoopRoleBar(anggota(), ronde, {
    title: 'Peran pada misi ini — ' + (State.tim.nama || 'tim kalian'),
    roles: DATA.peranMisi,
  });
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

/* Bilah progres "Soal i dari n" untuk misi bertahap. */
function buildMisiProgress(total, idx, doneFn) {
  var statuses = [];
  for (var i = 0; i < total; i++) statuses.push(doneFn(i) ? 'correct' : '');
  return buildProgressDots(total, idx, statuses);
}

/* Tombol soal sebelumnya/berikutnya untuk misi bertahap. */
function buildNavSoal(prefix, idx, total, bolehLanjut) {
  return (
    '<div class="btn-group btn-group--spread">' +
    (idx > 0
      ? '<button type="button" class="btn btn--ghost" id="' +
        prefix +
        'Prev">← Soal Sebelumnya</button>'
      : '<span></span>') +
    (bolehLanjut && idx < total - 1
      ? '<button type="button" class="btn btn--primary" id="' +
        prefix +
        'NextSoal">Soal Berikutnya →</button>'
      : '') +
    '</div>'
  );
}

function bindNavSoal(prefix, key, rerender) {
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

/* Ringkasan tiga kartu sifat (dipakai di misi & selesai). */
function buildRingkasSifat(judul, terbuka) {
  return (
    '<details class="panel panel--compact sifat-ringkas"' +
    (terbuka ? ' open' : '') +
    '>' +
    '<summary>' +
    esc(judul) +
    '</summary>' +
    '<div class="sifat-grid">' +
    KARTU_AHLI.map(function (k) {
      return buildSifatAhliCard(k, { pemegang: namaAhli(k.id) });
    }).join('') +
    '</div>' +
    '</details>'
  );
}

/* ============================================================
   5. STAGE: TUJUAN  (Cooperative Learning — fase 1)
   ============================================================ */

function dugaanLengkap() {
  return DATA.tujuan.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
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
        '</span><span aria-hidden="true">' +
        q.ikon +
        '</span> ' +
        q.tanya +
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
      '<h2 style="margin-top:0;">📸 ' +
        esc(D.judul) +
        '</h2>' +
        '<p style="margin-bottom:0;">' +
        esc(D.pengantar) +
        '</p>',
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
      '<h3 style="margin-top:0;">🤔 Apa dugaan tim kalian?</h3>' +
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
      showNotice('Pilih dugaan untuk setiap pertanyaan sebelum melanjutkan.');
      return false;
    }
    return true;
  });
}

/* ============================================================
   6. STAGE: INFORMASI  (Cooperative Learning — fase 2)
   Arti aⁿ, a⁰, a⁻ⁿ → pertanyaan penuntun (opsi acak) → syarat
   basis sama. Sifat TIDAK diajarkan di sini (ditemukan para ahli).
   ============================================================ */

function renderInformasi(container) {
  var D = DATA.informasi;
  var list = D.penuntun;
  var penuntunBenar = guidedQuizAllCorrect(list, State.penuntunPilih);
  var rerender = function () {
    renderInformasi(container);
  };

  var contohHTML = D.contoh
    .map(function (c) {
      return (
        '<li><span class="info-contoh__pow">' +
        esc(formatPangkat(c.a, c.n)) +
        ' = ' +
        esc(tulisPerkalianBerulang(c.a, c.n)) +
        ' = ' +
        esc(formatPecahan(pangkatBulat(c.a, c.n))) +
        '</span><span class="dl-caption">' +
        esc(c.teks) +
        '</span></li>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Menyajikan Informasi">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.pengantar) +
        '</p>' +
        '<h3>📚 ' +
        esc(D.ingatJudul) +
        '</h3>' +
        '<ul class="aturan-list">' +
        D.ingat
          .map(function (t) {
            return '<li>' + t + '</li>';
          })
          .join('') +
        '</ul>' +
        '<ul class="info-contoh">' +
        contohHTML +
        '</ul>'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🧭 Pertanyaan penuntun</h3>' +
        buildGuidedQuizList(list, State.penuntunOrders, State.penuntunPilih)
    ) +
    (penuntunBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">⚠️ ' +
            esc(D.syaratJudul) +
            '</h3>' +
            '<p style="margin-bottom:0;">' +
            esc(D.syarat) +
            '</p>',
          'panel--hero'
        ) + buildDlNextButton('informasiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindGuidedQuizList(container, list, State.penuntunPilih, saveState, rerender);
  bindNext('informasiNextBtn', 'informasi', 'tim');
}

/* ============================================================
   7. STAGE: TIM ASAL  (Cooperative Learning — fase 3)
   Kartu ahli (3 sifat) dibagikan acak; anggota ke-4 menjadi
   pendamping ahli.
   ============================================================ */

function renderTim(container) {
  var D = DATA.tim;
  var st = State.tim;
  var rerender = function () {
    renderTim(container);
  };

  container.innerHTML =
    '<section aria-label="Bentuk Tim Asal">' +
    buildHead(D) +
    buildDlPanel(buildCoopTeamSetup('tim', st, D)) +
    (st.anggota.length
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🃏 ' +
            esc(D.ahliJudul) +
            '</h3>' +
            buildJigsawTeamCard(st.nama, st.anggota, KARTU_AHLI) +
            '<p class="dl-caption" style="margin-top:var(--space-3);">🧩 ' +
            esc(D.ahliCatatan) +
            '</p>'
        ) + buildDlNextButton('timNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindCoopTeamSetup(container, 'tim', st, D, saveState, rerender);

  bindNext('timNextBtn', 'tim', 'ahli', function () {
    if (!coopTeamSetupSiap(st, D)) {
      showNotice('Centang semua kesepakatan tim sebelum menuju kelompok ahli.');
      return false;
    }
    return true;
  });
}

/* ============================================================
   8. STAGE: KELOMPOK AHLI  (Cooperative Learning — fase 4, Jigsaw)
   Tiga stasiun sifat. Tiap stasiun: ① ubin faktor → ② tabel pola
   (nilai dari definisi) → hubungan eksponen (opsi acak) → kartu
   sifat terbuka → ahli mengajar tim asal (centang) → ③ dua soal
   stasiun (eksponen berdiagnosa, termasuk nol & negatif).
   ============================================================ */

function stasiunById(id) {
  return DATA.ahli.stasiun.filter(function (s) {
    return s.id === id;
  })[0];
}

function polaBenar(stasiun) {
  var st = State.ahli[stasiun.id];
  return st.polaCek && polaSemuaBenar(stasiun.pola, st.pola);
}

function tanyaBenar(stasiun) {
  return State.ahli[stasiun.id].tanyaPilih[stasiun.tanya.id] === stasiun.tanya.correct;
}

function soalStasiunSelesai(stasiun) {
  var st = State.ahli[stasiun.id];
  return stasiun.soal.every(function (s) {
    return sifatStepSelesai(s, st.soal[s.id], TANPA_PILIH);
  });
}

function stasiunSelesai(stasiun) {
  return (
    polaBenar(stasiun) &&
    tanyaBenar(stasiun) &&
    State.ahli[stasiun.id].ajar &&
    soalStasiunSelesai(stasiun)
  );
}

function ahliSemuaSelesai() {
  return DATA.ahli.stasiun.every(stasiunSelesai);
}

function buildCekDugaan() {
  return DATA.tujuan.dugaan
    .map(function (q) {
      var pilih = State.dugaanPilih[q.id];
      var cocok = pilih === q.kunci;
      return buildFeedbackBox(
        cocok ? 'success' : 'info',
        cocok ? '✓' : '💡',
        '<span aria-hidden="true">' +
          q.ikon +
          '</span> ' +
          esc(q.penjelasan) +
          ' ' +
          (cocok
            ? '<strong>Dugaan tim tepat!</strong>'
            : 'Dugaan tim: ' +
              esc(pilih ? findOptionLabel(q.opsi, pilih) : '—') +
              '. Sekarang kalian tahu alasannya.')
      );
    })
    .join('');
}

function renderAhli(container) {
  var D = DATA.ahli;
  var stasiun = stasiunById(State.ahliTab);
  var info = sifatPangkatInfo(stasiun.id);
  var st = State.ahli[stasiun.id];
  var ahli = namaAhli(stasiun.id);
  var idx = D.stasiun.indexOf(stasiun);
  var pola = polaBenar(stasiun);
  var tanya = tanyaBenar(stasiun);
  var rerender = function () {
    renderAhli(container);
  };

  var diagnosaHTML = '';
  if (st.polaCek && !polaSemuaBenar(stasiun.pola, st.pola)) {
    diagnosaHTML = stasiun.pola.baris
      .map(function (b, i) {
        var d = diagnosaPolaBaris(stasiun.pola, i, st.pola);
        return d ? buildFeedbackBox('warning', '💭', esc(d.pesan)) : '';
      })
      .join('');
    if (!diagnosaHTML) {
      diagnosaHTML = buildFeedbackBox('info', '✏️', 'Lengkapi semua isian tabel lebih dulu.');
    }
  }

  var soalHTML = stasiun.soal
    .map(function (s, i) {
      return buildSifatStep('ah-' + s.id, s, st.soal[s.id], {
        pilihSifat: false,
        nomor: i + 1,
        label: 'Sederhanakan' + (s.nilai ? ', lalu tentukan nilainya.' : '.'),
      });
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Kelompok Ahli">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildJigsawTabs('ahliTabs', KARTU_AHLI, stasiun.id, {
      selesai: function (id) {
        return stasiunSelesai(stasiunById(id));
      },
      pemegang: namaAhli,
    }) +
    '<div class="panel">' +
    '<p class="dl-caption" style="margin-top:0;">Stasiun ' +
    (idx + 1) +
    ' dari ' +
    D.stasiun.length +
    (ahli ? ' · Ahli: <strong>' + esc(ahli) + '</strong>' : '') +
    '</p>' +
    buildSifatAhliCard(info, {
      pemegang: ahli,
      tanpaRumus: !tanya,
      kunciLabel: tanya ? 'Kalimat kunci:' : 'Tugas:',
    }) +
    '<h3 class="misi-sub">① Amati ubin faktor (kelompok ahli)</h3>' +
    '<p>' +
    esc(stasiun.ubinTeks) +
    '</p>' +
    buildFactorTiles(stasiun.ubin) +
    '<h3 class="misi-sub">② Lengkapi tabel pola (kelompok ahli)</h3>' +
    '<p>' +
    esc(stasiun.polaInstruksi) +
    '</p>' +
    buildPolaEksponen('pola-' + stasiun.id, stasiun.pola, st.pola, {
      checked: st.polaCek,
      locked: pola,
      tampilMN: pola,
    }) +
    (pola
      ? ''
      : '<div class="btn-group"><button type="button" class="btn btn--primary" id="polaCekBtn">Periksa Tabel</button></div>' +
        diagnosaHTML) +
    (pola
      ? buildGuidedQuizList([stasiun.tanya], st.tanyaOrders, st.tanyaPilih) +
        (tanya
          ? buildFeedbackBox(
              'success',
              info.ikon,
              '<strong>Sifat ditemukan:</strong> <span class="sifat-kartu__rumus">' +
                esc(info.rumus) +
                '</span>'
            ) +
            '<label class="coop-setup__cek ahli-ajar"><input type="checkbox" id="ahliAjar"' +
            (st.ajar ? ' checked' : '') +
            '><span>' +
            esc(D.ajarLabel) +
            '</span></label>'
          : '')
      : '') +
    (tanya && st.ajar
      ? '<h3 class="misi-sub">③ Soal tim asal (dipandu ' + esc(ahli || 'ahli') + ')</h3>' + soalHTML
      : '') +
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
            '<strong>Semua ahli sudah mengajar!</strong> Tim kalian kini menguasai tiga sifat. Di misi berikutnya, ahli sifat yang dipakai memimpin perhitungan.'
          ) +
            '<h3>🔁 ' +
            esc(D.dugaanJudul) +
            '</h3>' +
            buildCekDugaan()
        ) + buildDlNextButton('ahliNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindJigsawTabs(container, 'ahliTabs', function (id) {
    State.ahliTab = id;
    saveState();
    rerender();
  });

  bindPolaEksponen(container, 'pola-' + stasiun.id, st.pola, saveState, function () {
    var b = document.getElementById('polaCekBtn');
    if (b) b.click();
  });
  var cekBtn = document.getElementById('polaCekBtn');
  if (cekBtn) {
    cekBtn.addEventListener('click', function () {
      st.polaCek = true;
      saveState();
      rerender();
    });
  }

  bindGuidedQuizList(container, [stasiun.tanya], st.tanyaPilih, saveState, rerender);

  var ajar = document.getElementById('ahliAjar');
  if (ajar) {
    ajar.addEventListener('change', function () {
      st.ajar = ajar.checked;
      saveState();
      rerender();
    });
  }

  stasiun.soal.forEach(function (s) {
    bindSifatStep(container, 'ah-' + s.id, s, st.soal[s.id], saveState, rerender, TANPA_PILIH);
  });

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
  bindNext('ahliNextBtn', 'ahli', 'misiSederhana');
}

/* ============================================================
   9. STAGE: MISI 1 — SEDERHANAKAN  (Cooperative Learning — fase 4)
   Per soal: pilih sifat (4 opsi acak, termasuk basis berbeda) →
   ahli sifat itu memimpin → isi eksponen (diagnosa) → nilai.
   ============================================================ */

function sederhanaSelesai(s) {
  return sifatStepSelesai(s, State.sederhana[s.id]);
}

function renderMisiSederhana(container) {
  var D = DATA.misiSederhana;
  var idx = State.sederhanaIdx;
  var s = D.soal[idx];
  var selesai = sederhanaSelesai(s);
  var semua = D.soal.every(sederhanaSelesai);
  var rerender = function () {
    renderMisiSederhana(container);
  };

  container.innerHTML =
    '<section aria-label="Misi 1: Sederhanakan">' +
    buildHead(D) +
    buildPeranMisi(D.ronde) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildRingkasSifat('🧩 Kartu sifat para ahli') +
    '<div class="panel">' +
    buildMisiProgress(D.soal.length, idx, function (i) {
      return sederhanaSelesai(D.soal[i]);
    }) +
    buildSifatStep('ms-' + s.id, s, State.sederhana[s.id], {
      nomor: idx + 1,
      label:
        'Sederhanakan menjadi satu bilangan berpangkat' +
        (s.nilai ? ', lalu tentukan nilainya.' : '.') +
        (typeof s.a === 'string' ? ' (' + s.a + ' ≠ 0)' : ''),
      pemimpin: namaAhli,
    }) +
    '</div>' +
    buildNavSoal('ms', idx, D.soal.length, selesai) +
    (semua ? buildDlNextButton('sederhanaNextBtn', D.nextLabel) : '') +
    '</section>';

  bindSifatStep(container, 'ms-' + s.id, s, State.sederhana[s.id], saveState, rerender);
  bindNavSoal('ms', 'sederhanaIdx', rerender);
  bindNext('sederhanaNextBtn', 'misiSederhana', 'misiRantai');
}

/* ============================================================
   10. STAGE: MISI 2 — RANTAI SIFAT  (Cooperative Learning — fase 4)
   Soal gabungan & kontekstual dipecah menjadi langkah sifat yang
   dikerjakan berurutan; langkah berikutnya muncul setelah langkah
   sebelumnya tuntas.
   ============================================================ */

function rantaiSelesaiId(r) {
  return rantaiSelesai(RANTAI_LANGKAH[r.id], State.rantai[r.id]);
}

function renderMisiRantai(container) {
  var D = DATA.misiRantai;
  var idx = State.rantaiIdx;
  var r = D.soal[idx];
  var L = RANTAI_LANGKAH[r.id];
  var states = State.rantai[r.id];
  var aktif = langkahRantaiAktif(L, states);
  var selesai = aktif === L.length;
  var semua = D.soal.every(rantaiSelesaiId);
  var hasil = hasilRantai(r);
  var rerender = function () {
    renderMisiRantai(container);
  };

  var langkahHTML = L.slice(0, Math.min(aktif + 1, L.length))
    .map(function (s, i) {
      return buildSifatStep('mr-' + r.id + '-' + i, s, states[i], {
        nomor: i + 1,
        label: 'Langkah ' + (i + 1) + (i === 0 ? ': mulai dari bagian pertama.' : ': lanjutkan.'),
        pemimpin: namaAhli,
      });
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Misi 2: Rantai Sifat">' +
    buildHead(D) +
    buildPeranMisi(D.ronde) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildRingkasSifat('🧩 Kartu sifat para ahli') +
    '<div class="panel">' +
    buildMisiProgress(D.soal.length, idx, function (i) {
      return rantaiSelesaiId(D.soal[i]);
    }) +
    (r.cerita ? buildKonteks(r.ikon, r.cerita) : '') +
    '<p class="exercise-label">' +
    esc(r.tanya || 'Sederhanakan menjadi satu bilangan berpangkat.') +
    '</p>' +
    '<p class="rantai-soal">' +
    esc(teksRantai(r)) +
    '</p>' +
    langkahHTML +
    (selesai
      ? buildFeedbackBox(
          'success',
          '🔗',
          '<strong>Rantai tuntas:</strong> ' +
            esc(teksRantai(r)) +
            ' = ' +
            esc(hasil.teks) +
            (r.nilai
              ? ' = ' + esc(formatPecahan(hasil.nilai)) + (r.satuan ? ' ' + esc(r.satuan) : '')
              : '')
        )
      : '') +
    '</div>' +
    buildNavSoal('mr', idx, D.soal.length, selesai) +
    (semua ? buildDlNextButton('rantaiNextBtn', D.nextLabel) : '') +
    '</section>';

  L.forEach(function (s, i) {
    bindSifatStep(container, 'mr-' + r.id + '-' + i, s, states[i], saveState, rerender);
  });
  bindNavSoal('mr', 'rantaiIdx', rerender);
  bindNext('rantaiNextBtn', 'misiRantai', 'misiDiskusi');
}

/* ============================================================
   11. STAGE: MISI 3 — CEK PENDAPAT TEMAN  (CL fase 4)
   Pernyataan Benar/Salah (urutan pernyataan & opsi diacak), dijawab
   sekali setelah tim sepakat; Juru Bicara menulis catatan.
   ============================================================ */

function pernyataanTampil() {
  return DATA.misiDiskusi.pernyataan.map(function (p) {
    return {
      id: p.id,
      teks: esc(p.teks),
      correct: p.correct,
      explanation: esc(p.explanation),
    };
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
    buildRingkasSifat('🧩 Kartu sifat para ahli') +
    buildDlPanel(
      buildSortItems(list, State.diskusiOrder, D.opsi, State.diskusiStates, { mono: true })
    ) +
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
      showNotice('Juru Bicara menuliskan catatan tim lebih dulu.');
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
      kali: '✖️ Perkalian',
      bagi: '➗ Pembagian',
      pangkat: '🔁 Pangkat dari pangkat',
      gabung: '🔗 Gabungan sifat',
      konteks: '🌏 Kontekstual',
    }[s.jenis];
    return (
      '<div class="dl-prompt">' +
      '<span class="kuis-tag">' +
      tag +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
      '<p class="dl-prompt__tanya kuis-tanya">' +
      esc(s.pertanyaan) +
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
   Skor stasiun & misi = benar pada percobaan pertama; skor kuis =
   benar tanpa percobaan ulang/ungkap jawaban.
   ============================================================ */

function tambahSkor(total, sk) {
  total.benar += sk.benar;
  total.maks += sk.maks;
}

/* Skor stasiun ahli: soal stasiun (eksponen & nilai, percobaan pertama). */
function skorStasiun(stasiun) {
  var total = { benar: 0, maks: 0 };
  var st = State.ahli[stasiun.id];
  stasiun.soal.forEach(function (s) {
    tambahSkor(total, sifatStepSkor(s, st.soal[s.id], TANPA_PILIH));
  });
  return total;
}

function misiSkor() {
  var total = { benar: 0, maks: 0 };
  DATA.ahli.stasiun.forEach(function (stasiun) {
    tambahSkor(total, skorStasiun(stasiun));
  });
  DATA.misiSederhana.soal.forEach(function (s) {
    tambahSkor(total, sifatStepSkor(s, State.sederhana[s.id]));
  });
  DATA.misiRantai.soal.forEach(function (r) {
    RANTAI_LANGKAH[r.id].forEach(function (s, i) {
      tambahSkor(total, sifatStepSkor(s, State.rantai[r.id][i]));
    });
  });
  tambahSkor(total, {
    benar: sortItemsCorrectCount(DATA.misiDiskusi.pernyataan, State.diskusiStates),
    maks: DATA.misiDiskusi.pernyataan.length,
  });
  return total;
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
      var info = sifatPangkatInfo(stasiun.id);
      var sk = skorStasiun(stasiun);
      return (
        '<li><span aria-hidden="true">' +
        info.ikon +
        '</span> <strong>' +
        esc(namaAhli(stasiun.id) || '—') +
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
    esc(State.tim.nama || 'Tim kalian') +
    (anggota().length ? ' — ' + esc(anggota().join(', ')) : '') +
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
    '<h3 style="margin-top:0;">🧩 Tiga sifat para ahli</h3>' +
    '<div class="sifat-grid">' +
    KARTU_AHLI.map(function (k) {
      return buildSifatAhliCard(k, { pemegang: namaAhli(k.id) });
    }).join('') +
    buildSifatAhliCard(sifatPangkatInfo('basisBeda')) +
    '</div>' +
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
  misiSederhana: renderMisiSederhana,
  misiRantai: renderMisiRantai,
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
