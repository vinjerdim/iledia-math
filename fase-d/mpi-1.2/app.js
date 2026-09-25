'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Membandingkan & Mengurutkan Bilangan Bulat dalam
   Kehidupan Sehari-hari — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen umum: buildDiscoveryHead, buildTeacherNote,
       buildChoiceGroup, buildGuidedQuizList, buildSortItems,
       buildDlPanel, buildDlNextButton, buildThermometerRow;
     • seksi 11 (penempatan, lambang, susun kartu):
       buildNumberLinePlacement, buildCompareSentence,
       buildCompareSymbolChoice, buildTapOrder;
     • seksi 12 (Cooperative Learning): assignCoopRoles,
       buildCoopRoleBar, buildCoopTeamCard, coopAwardLevel;
     • seksi 34 (banding dalam konteks): opsiMaknaBanding,
       diagnosaBanding, pesanBanding, urutanIdBulat, rentangGaris.

   Alur tahap mengikuti sintaks Cooperative Learning (Arends) dengan
   skor tim ala STAD; lihat komentar kepala pada data.js.

   PENGACAKAN: seluruh pilihan jawaban (dugaan, pertanyaan penuntun,
   lambang <, >, =, makna perbandingan, pernyataan diskusi, soal &
   opsi kuis, penilaian diri), urutan menempatkan bilangan, dan kartu
   yang diurutkan DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder() / ensureSortStates() / ensureTapOrderState().
   Pengacakan dilakukan SEKALI saat state disiapkan
   (initExerciseArrays) lalu disimpan di State — bukan saat render —
   sehingga pilihan tidak melompat saat dirender ulang, tetapi teracak
   ulang untuk setiap murid dan setiap Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Tujuan          (CL fase 1)
    6. Stage: Informasi       (CL fase 2)
    7. Stage: Bentuk Tim      (CL fase 3)
    8. Stage: Misi Bandingkan (CL fase 4)
    9. Stage: Misi Urutkan    (CL fase 4)
   10. Stage: Misi Diskusi    (CL fase 4)
   11. Stage: Kuis Individu   (CL fase 5)
   12. Stage: Penghargaan     (CL fase 6)
   13. Stage: Refleksi
   14. Stage: Selesai
   15. Router Render
   16. Helper UI (modal reset)
   17. Init
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
var STORAGE_KEY = 'mpi-d-1-2-banding-urut-v1';

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
  infoOrder: null,
  infoPlace: null,
  penuntunOrders: {},
  penuntunPilih: {},

  /* Tahap 3 — tim */
  timNama: '',
  timInput: ['', '', '', ''],
  timAnggota: [],
  timSepakat: {},

  /* Tahap 4 — misi bandingkan */
  bandingIdx: 0,
  banding: {},
  bandingCatatan: '',

  /* Tahap 5 — misi urutkan */
  urutIdx: 0,
  urut: {},

  /* Tahap 6 — misi diskusi */
  diskusiStates: {},
  diskusiOrder: null,
  diskusiJubir: '',

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

/* Memastikan State[key] berupa objek biasa (peta id → nilai). */
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

/* Bilangan tahap informasi sebagai item ber-id (untuk diacak urutannya). */
function infoItems() {
  return DATA.informasi.bilangan.map(function (b, i) {
    return { id: 'n' + i, value: b.value, teks: b.teks };
  });
}

/* Item penempatan misi bandingkan: a dan b. */
function bandingItems(s) {
  return [
    { id: 'a', value: s.a.value, teks: s.a.teks },
    { id: 'b', value: s.b.value, teks: s.b.teks },
  ];
}

/* Item dalam urutan tersimpan (untuk penempatan teracak). */
function itemsByOrder(items, order) {
  return orderByIds(items, order);
}

function ensureBandingState(s) {
  var map = ensureMap('banding');
  var st = map[s.id];
  if (!st || typeof st !== 'object') st = map[s.id] = {};
  ensureShuffledOrder(st, 'placeOrder', bandingItems(s));
  ensureNumberLinePlacementState(st, 'place');
  if (!st.sym || typeof st.sym !== 'object') st.sym = { chosen: null, wrong: 0 };
  ensureShuffledOrder(st, 'symOrder', COMPARE_SYMBOLS);
  if (!st.makna || typeof st.makna !== 'object') st.makna = { chosen: null, wrong: 0 };
  ensureShuffledOrder(st, 'maknaOrder', opsiMaknaBanding(s.tema, s.a.value, s.b.value));
  return st;
}

function ensureUrutState(s) {
  var map = ensureMap('urut');
  var st = map[s.id];
  if (!st || typeof st !== 'object') st = map[s.id] = {};
  ensureShuffledOrder(st, 'placeOrder', s.items);
  ensureNumberLinePlacementState(st, 'place');
  ensureTapOrderState(st, 'tap', s.items, urutanIdBulat(s.items, s.arah));
  return st;
}

/*
 * Soal kuis yang sedang dipakai. Array ini DIISI ULANG di tempat
 * (bukan diganti) karena createExerciseStage menyimpan referensinya.
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
  /* Tahap 1 */
  ensureListOrders('dugaanOrders', DATA.tujuan.dugaan);
  ensureMap('dugaanPilih');

  /* Tahap 2 — urutan menempatkan bilangan & opsi penuntun diacak */
  ensureShuffledOrder(State, 'infoOrder', infoItems());
  ensureNumberLinePlacementState(State, 'infoPlace');
  ensureListOrders('penuntunOrders', DATA.informasi.penuntun);
  ensureMap('penuntunPilih');

  /* Tahap 3 */
  if (!Array.isArray(State.timInput) || State.timInput.length !== DATA.tim.maksAnggota) {
    State.timInput = [];
    for (var i = 0; i < DATA.tim.maksAnggota; i++) State.timInput.push('');
  }
  if (!Array.isArray(State.timAnggota)) State.timAnggota = [];
  ensureMap('timSepakat');

  /* Tahap 4–5 */
  DATA.misiBanding.soal.forEach(ensureBandingState);
  if (State.bandingIdx < 0 || State.bandingIdx >= DATA.misiBanding.soal.length)
    State.bandingIdx = 0;
  DATA.misiUrut.soal.forEach(ensureUrutState);
  if (State.urutIdx < 0 || State.urutIdx >= DATA.misiUrut.soal.length) State.urutIdx = 0;

  /* Tahap 6 */
  ensureSortStates(
    State,
    'diskusiStates',
    'diskusiOrder',
    DATA.misiDiskusi.pernyataan,
    DATA.misiDiskusi.opsi
  );

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
      optionOrder: s.options ? shuffleArray(optionIds(s.options)) : null,
    };
  });
  if (State.kuisIdx >= KUIS_SOAL.length || State.kuisIdx < 0) State.kuisIdx = 0;

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

/* Bilah peran tim untuk misi ke-`ronde` (peran dirotasi). */
function buildPeranMisi(ronde) {
  return buildCoopRoleBar(State.timAnggota, ronde, {
    title: 'Peran pada misi ini — ' + (State.timNama || 'tim kalian'),
  });
}

/* Kotak konteks: ikon tema + cerita. */
function buildKonteks(tema, cerita) {
  var K = KONTEKS_BULAT[tema];
  return (
    '<div class="misi-konteks">' +
    '<span class="misi-konteks__ikon" aria-hidden="true">' +
    (K ? K.ikon : '📍') +
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

/* ============================================================
   5. STAGE: TUJUAN  (Cooperative Learning — fase 1)
   Murid mengamati termometer dan MENDUGA. Tidak dinilai.
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
        '</span>' +
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
      '<h2 style="margin-top:0;">🌤️ ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        buildThermometerRow(
          D.kota.map(function (k) {
            return { value: k.value, caption: k.nama };
          }),
          D.termometer
        ),
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
   Penempatan bilangan konteks (urutan acak) → pertanyaan penuntun
   → aturan banding & cek dugaan tahap 1.
   ============================================================ */

function buildCekDugaan() {
  var T = DATA.tujuan;
  var byId = {};
  T.kota.forEach(function (k) {
    byId[k.id] = k;
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
          (q.id === 'dingin' ? 'Paling dingin' : 'Paling hangat') +
          ':</strong> ' +
          esc(kk.nama) +
          ' (' +
          formatNumber(kk.value, '−') +
          ' °C). ' +
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
  var items = itemsByOrder(infoItems(), State.infoOrder);
  var st = State.infoPlace;
  var ditempatkan = numberLinePlacementDone(items, st);
  var penuntunBenar = guidedQuizAllCorrect(D.penuntun, State.penuntunPilih);
  var rerender = function () {
    renderInformasi(container);
  };

  container.innerHTML =
    '<section aria-label="Menyajikan Informasi">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.pengantar) +
        '</p>' +
        buildNumberLinePlacement('infoGaris', items, st, {
          min: D.garis.min,
          max: D.garis.max,
          doneText:
            '<strong>Semua bilangan sudah di tempatnya.</strong> Perhatikan: bilangan negatif di kiri 0, bilangan positif di kanan 0.',
        })
    ) +
    (ditempatkan
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🧭 Pertanyaan penuntun</h3>' +
            buildGuidedQuizList(D.penuntun, State.penuntunOrders, State.penuntunPilih)
        )
      : '') +
    (ditempatkan && penuntunBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📌 ' +
            esc(D.aturanJudul) +
            '</h3>' +
            '<ul class="aturan-list">' +
            D.aturan
              .map(function (a) {
                return '<li>' + a + '</li>';
              })
              .join('') +
            '</ul>',
          'panel--hero'
        ) +
        buildDlPanel(
          '<h3 style="margin-top:0;">🔁 ' + esc(D.dugaanJudul) + '</h3>' + buildCekDugaan()
        ) +
        buildDlNextButton('informasiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindNumberLinePlacement(container, 'infoGaris', items, st, saveState, rerender);
  bindGuidedQuizList(container, D.penuntun, State.penuntunPilih, saveState, rerender);
  centerNumberLines(container);
  bindNext('informasiNextBtn', 'informasi', 'tim');
}

/* ============================================================
   7. STAGE: BENTUK TIM  (Cooperative Learning — fase 3)
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

/* true bila anggota yang terisi berbeda dari anggota yang sudah diberi peran. */
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
    '<section aria-label="Bentuk Tim">' +
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
          '<h3 style="margin-top:0;">' +
            esc(D.peranJudul) +
            ' (Misi 1)</h3>' +
            buildCoopTeamCard(State.timNama, State.timAnggota, 0) +
            '<p class="dl-caption" style="margin-top:var(--space-3);">🔄 ' +
            esc(D.peranCatatan) +
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
    /* Nama anggota diubah setelah peran diacak → peran perlu diacak ulang. */
    inp.addEventListener('change', function () {
      if (State.timAnggota.length && timBerubah()) {
        State.timAnggota = [];
        saveState();
        showNotice('Daftar anggota berubah. Tekan "Acak Peran" lagi.');
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

  bindNext('timNextBtn', 'tim', 'misiBanding', function () {
    if (!timSepakatSemua()) {
      showNotice('Centang semua kesepakatan tim sebelum memulai misi.');
      return false;
    }
    return true;
  });
}

/* ============================================================
   8. STAGE: MISI 1 — BANDINGKAN  (Cooperative Learning — fase 4)
   Per soal: tempatkan a & b (urutan acak) → pilih lambang (diagnosa
   miskonsepsi) → pilih makna konteks (opsi dari engine, diacak).
   ============================================================ */

function bandingSelesai(s) {
  var st = State.banding[s.id];
  return !!st && st.makna.chosen === idMaknaBanding(s.a.value, s.b.value);
}

function bandingSemuaSelesai() {
  return DATA.misiBanding.soal.every(bandingSelesai);
}

function buildSymFeedback(s, st) {
  if (!st.sym.chosen) return '';
  var diag = diagnosaBanding(s.a.value, s.b.value, st.sym.chosen);
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(
      diag === 'benar' ? 'success' : 'warning',
      diag === 'benar' ? '✓' : '💭',
      pesanBanding(diag, s.a.value, s.b.value)
    ) +
    '</div>'
  );
}

function buildMaknaFeedback(s, st) {
  var ch = st.makna.chosen;
  if (!ch) return '';
  var benarId = idMaknaBanding(s.a.value, s.b.value);
  var benar = ch === benarId;
  var sym = compareSymbolText(compareSymbolId(s.a.value, s.b.value));
  var html = benar
    ? '<strong>Tepat!</strong> ' +
      esc(formatNumber(s.a.value, '−') + ' ' + sym + ' ' + formatNumber(s.b.value, '−')) +
      ', jadi ' +
      esc(s.a.teks) +
      ' <strong>' +
      esc(maknaBanding(s.a.value, s.b.value, s.tema)) +
      '</strong> dibandingkan ' +
      esc(s.b.teks) +
      '.'
    : 'Belum tepat. Ingat lambang yang sudah kalian pilih: ' +
      esc(formatNumber(s.a.value, '−') + ' ' + sym + ' ' + formatNumber(s.b.value, '−')) +
      '. Bilangan yang lebih kecil berarti "' +
      esc(kataBandingUntuk(s.tema, s.a.value, s.b.value).kecil) +
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
  var items = itemsByOrder(bandingItems(s), st.placeOrder);
  var r = rentangGaris([s.a.value, s.b.value]);
  var ditempatkan = numberLinePlacementDone(items, st.place);
  var symBenar = st.sym.chosen === compareSymbolId(s.a.value, s.b.value);
  var selesai = bandingSelesai(s);
  var semua = bandingSemuaSelesai();
  var rerender = function () {
    renderMisiBanding(container);
  };

  var maknaBenar = selesai;
  var navHTML = '';
  if (selesai && idx < D.soal.length - 1) {
    navHTML = buildDlNextButton('bandingNextSoal', 'Situasi Berikutnya →');
  }

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
    buildNumberLinePlacement('bandingGaris', items, st.place, {
      min: r.min,
      max: r.max,
      doneText: '<strong>Kedua bilangan sudah di tempatnya.</strong> Mana yang lebih kiri?',
    }) +
    (ditempatkan
      ? '<h3 class="misi-sub">Pilih lambang yang tepat</h3>' +
        buildCompareSentence(s.a.value, s.b.value, symBenar ? st.sym.chosen : null) +
        '<p class="dl-caption misi-label-ab">' +
        esc(s.a.teks) +
        ' ☐ ' +
        esc(s.b.teks) +
        '</p>' +
        buildCompareSymbolChoice(s.a.value, s.b.value, st.symOrder, st.sym, { group: s.id }) +
        buildSymFeedback(s, st)
      : '') +
    (symBenar
      ? '<h3 class="misi-sub">' +
        esc(s.tanyaMakna) +
        '</h3>' +
        buildChoiceGroup(opsiMaknaBanding(s.tema, s.a.value, s.b.value), st.maknaOrder, {
          chosen: st.makna.chosen,
          correctId: maknaBenar ? idMaknaBanding(s.a.value, s.b.value) : null,
          grade: true,
          locked: maknaBenar,
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
    navHTML +
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

  bindNumberLinePlacement(container, 'bandingGaris', items, st.place, saveState, rerender);
  bindCompareSymbolChoice(
    container,
    function () {
      return [s.a.value, s.b.value];
    },
    function () {
      return st.sym;
    },
    saveState,
    rerender
  );
  container.querySelectorAll('[data-makna]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var benarId = idMaknaBanding(s.a.value, s.b.value);
      if (st.makna.chosen === benarId) return;
      st.makna.chosen = btn.dataset.makna;
      if (st.makna.chosen !== benarId) st.makna.wrong += 1;
      saveState();
      rerender();
    });
  });
  centerNumberLines(container);

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
   9. STAGE: MISI 2 — URUTKAN  (Cooperative Learning — fase 4)
   Per soal: tempatkan lima bilangan (urutan acak) → susun kartu
   (pool acak, tidak pernah sama dengan jawaban) naik/turun.
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
      label: buildNumChip(it.value) + '<span class="tap-order__teks">' + esc(it.teks) + '</span>',
      aria: formatNumber(it.value, '−') + ', ' + it.teks,
    };
  });
}

function renderMisiUrut(container) {
  var D = DATA.misiUrut;
  var idx = State.urutIdx;
  var s = D.soal[idx];
  var st = State.urut[s.id];
  var items = itemsByOrder(s.items, st.placeOrder);
  var r = rentangGaris(
    s.items.map(function (it) {
      return it.value;
    })
  );
  var ditempatkan = numberLinePlacementDone(items, st.place);
  var answer = urutanIdBulat(s.items, s.arah);
  var selesai = urutSelesai(s);
  var rerender = function () {
    renderMisiUrut(container);
  };

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
    buildNumberLinePlacement('urutGaris', items, st.place, {
      min: r.min,
      max: r.max,
      doneText:
        '<strong>Kelima bilangan sudah di tempatnya.</strong> Sekarang baca garisnya ' +
        (s.arah === 'naik' ? 'dari kiri ke kanan.' : 'dari kanan ke kiri.'),
    }) +
    (ditempatkan
      ? '<h3 class="misi-sub">Susun kartunya</h3>' +
        buildTapOrder('urutKartu', urutKartu(s), st.tap, {
          answer: answer,
          startLabel: s.startLabel,
          endLabel: s.endLabel,
          separator: s.separator,
          successText:
            '<strong>Urutannya tepat!</strong> ' +
            esc(
              urutkanBulat(
                s.items.map(function (it) {
                  return it.value;
                }),
                s.arah
              )
                .map(function (v) {
                  return formatNumber(v, '−');
                })
                .join(' ' + s.separator + ' ')
            ),
        })
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

  bindNumberLinePlacement(container, 'urutGaris', items, st.place, saveState, rerender);
  bindTapOrder(container, 'urutKartu', st.tap, answer, saveState, rerender);
  centerNumberLines(container);

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
   10. STAGE: MISI 3 — CEK PENDAPAT TEMAN  (CL fase 4)
   Pernyataan Benar/Salah (urutan pernyataan & opsi diacak), dijawab
   sekali setelah tim sepakat; Juru Bicara menulis penjelasan.
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
    buildPeranMisi(D.ronde) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    buildDlPanel(
      '<p class="dl-caption" style="margin-top:0;">Garis bilangan bantu untuk berdiskusi:</p>' +
        buildNumberLinePicker('diskusiGaris', {
          min: D.garis.min,
          max: D.garis.max,
          interactive: false,
          sides: true,
        }) +
        buildSortItems(D.pernyataan, State.diskusiOrder, D.opsi, State.diskusiStates)
    ) +
    (selesai
      ? buildDlPanel(
          buildTextarea('diskusiJubir', D.jubirLabel, State.diskusiJubir, D.jubirPlaceholder)
        ) + buildDlNextButton('diskusiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, D.pernyataan, State.diskusiStates, saveState, rerender);
  centerNumberLines(container);
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
  inputRowClass: 'dl-input-row',
  inputAriaLabel: 'Jawabanmu',
  inputPlaceholder: 'Contoh: −4',
  allowNegative: true,
  revealButtonStyle: 'separate',
  emptyMessage: 'Ketik jawabanmu terlebih dahulu.',
  invalidMessage: 'Tulis jawaban berupa bilangan bulat, mis. −4 atau 6.',
  checkValue: function (s) {
    return s.jawab;
  },
  revealText: function (s) {
    return s.reveal + ' ' + s.explanation;
  },
  renderPrompt: function (s) {
    var tag = {
      lambang: '⚖️ Lambang perbandingan',
      makna: '💬 Makna dalam konteks',
      ekstrem: '🔎 Terkecil / terbesar',
      urut: '📶 Urutan',
    }[s.jenis];
    return (
      '<div class="dl-prompt">' +
      '<span class="kuis-tag">' +
      tag +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
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
   Skor misi = benar pada percobaan pertama; skor kuis = benar tanpa
   percobaan ulang/ungkap jawaban.
   ============================================================ */

function misiSkor() {
  var benar = 0;
  var maks = 0;
  DATA.misiBanding.soal.forEach(function (s) {
    var st = State.banding[s.id];
    maks += 2;
    if (st && bandingSelesai(s)) {
      if (!st.sym.wrong) benar += 1;
      if (!st.makna.wrong) benar += 1;
    }
  });
  DATA.misiUrut.soal.forEach(function (s) {
    var st = State.urut[s.id];
    maks += 2;
    if (st && st.tap.correct) {
      if (numberLinePlacementFirstTry(s.items, st.place) === s.items.length) benar += 1;
      if (st.tap.attempts === 1) benar += 1;
    }
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
        kartuRingkas(m.benar + '/' + m.maks, 'Skor misi tim (percobaan pertama)') +
        kartuRingkas(k.benar + '/' + k.maks, 'Skor kuis individu') +
        kartuRingkas(poin, 'Poin tim (0–100)') +
        '</div>' +
        '<p class="dl-caption" style="margin-top:var(--space-3);">' +
        esc(D.bobot) +
        ' Predikat: Tim Super ≥ 85, Tim Hebat ≥ 70, Tim Baik &lt; 70.</p>'
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
    '<ul class="aturan-list">' +
    DATA.informasi.aturan
      .map(function (a) {
        return '<li>' + a + '</li>';
      })
      .join('') +
    '</ul>' +
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
    'Penjelasan lisan Juru Bicara dan catatan refleksi murid menjadi bahan asesmen formatif utama.' +
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
   15. ROUTER RENDER
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
