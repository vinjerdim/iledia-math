'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Membandingkan Bilangan Bulat, Pecahan & Desimal
   secara Terpadu dalam Kehidupan Sehari-hari — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen umum: buildDiscoveryHead, buildTeacherNote,
       buildChoiceGroup, buildSortItems, buildGuidedQuizList,
       buildDlPanel, buildDlNextButton, buildInfoPoster;
     • seksi 14 (urut-ketuk): ensureTapOrderState, buildTapOrder,
       bindTapOrder;
     • seksi 38 (bilangan terpadu): tulisTerpadu, bandingTerpadu,
       simbolBandingTerpadu, urutanIdTerpadu, opsiBentukSetara,
       penyebutPersepuluhan, buildBilanganChip,
       buildKalimatBandingTerpadu, buildPilihSimbolTerpadu/
       bindPilihSimbolTerpadu, opsiMaknaBandingTerpadu,
       buildPenempatanTerpadu/bindPenempatanTerpadu,
       buildTabelBentukTerpadu, periksaIsianTerpadu.

   Alur tahap mengikuti sintaks Problem Based Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan, pertanyaan inti, peran,
   butir & kategori pemilahan, kartu rencana, bentuk setara tiap kartu,
   pertanyaan pengamatan, urutan kartu garis bilangan, lambang <, >, =,
   makna perbandingan, strategi, kartu urutan keputusan, pendapat teman,
   bank kesimpulan, soal & opsi uji terap, penilaian diri) DIACAK dengan
   shuffleArray() melalui ensureShuffledOrder() / ensureSortStates() /
   ensureTapOrderState(). Pengacakan dilakukan SEKALI saat state
   disiapkan (initExerciseArrays) lalu urutannya disimpan di State —
   bukan saat render — sehingga pilihan tidak melompat saat dirender
   ulang, tetapi teracak ulang untuk setiap murid dan setiap Reset.

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi Masalah       (PBL sintaks 1)
    6. Stage: Organisasi              (PBL sintaks 2)
    7. Stage: Samakan Bentuk          (PBL sintaks 3a)
    8. Stage: Garis Bilangan Terpadu  (PBL sintaks 3b)
    9. Stage: Bandingkan              (PBL sintaks 3c)
   10. Stage: Karya                   (PBL sintaks 4)
   11. Stage: Evaluasi                (PBL sintaks 5)
   12. Stage: Uji Terap
   13. Stage: Refleksi
   14. Stage: Selesai
   15. Router Render
   16. Helper UI (modal reset)
   17. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA & DATA TURUNAN
   ============================================================ */

var STAGES = DATA.tahap.map(function (t) {
  return t.id;
});
var STAGE_LABELS = DATA.tahap.map(function (t) {
  return t.label;
});
var STORAGE_KEY = 'mpi-d-1-6-banding-terpadu-v1';

/* Teks biasa dari DATA → HTML aman; token "{3/4}" menjadi pecahan bersusun. */
function teksHTML(str) {
  return renderFracText(esc(str));
}

/* Pertanyaan penuntun dari DATA: tanya (HTML) + label opsi di-escape. */
function siapkanGuided(q) {
  var umpan = {};
  Object.keys(q.umpan).forEach(function (k) {
    umpan[k] = esc(q.umpan[k]);
  });
  return {
    id: q.id,
    tanya: renderFracText(q.tanya),
    opsi: q.opsi.map(function (o) {
      return { id: o.id, label: esc(o.label) };
    }),
    correct: q.correct,
    umpan: umpan,
  };
}

/* Opsi teks biasa → opsi berlabel HTML aman. */
function opsiAman(list) {
  return list.map(function (o) {
    return { id: o.id, label: esc(o.label) };
  });
}

var DUGAAN_OPSI = {};
DATA.orientasi.dugaan.forEach(function (q) {
  DUGAAN_OPSI[q.id] = opsiAman(q.opsi);
});
var MASALAH_OPSI = opsiAman(DATA.orientasi.masalahOpsi);

var PILAH_ITEMS = DATA.organisasi.pilah.map(function (p) {
  return { id: p.id, teks: esc(p.teks), correct: p.correct, explanation: esc(p.explanation) };
});
var RENCANA_ITEMS = DATA.organisasi.rencana.map(function (r) {
  return { id: r.id, label: esc(r.label), aria: r.label };
});
var RENCANA_JAWAB = optionIds(DATA.organisasi.rencana);

/*
 * Kartu Lab Samakan Bentuk (tahap 3). Opsi dibuat engine dari DATA —
 * deterministik, sehingga cukup dibuat sekali; urutan tampilnya diacak
 * lewat State.ubahOrders.
 */
function buatKartuUbah(nilai, arah) {
  var opsi = opsiBentukSetara(nilai);
  var umpan = {};
  opsi.forEach(function (o) {
    umpan[o.id] = esc(o.umpan);
  });
  return {
    id: nilai,
    nilai: nilai,
    arah: arah,
    opsi: opsi.map(function (o) {
      return { id: o.id, label: buildBilanganChip(o.label) };
    }),
    jawab: opsi[0].label,
    umpan: umpan,
  };
}
var KARTU_UBAH = {
  A: DATA.selidikUbah.keDesimal.map(function (n) {
    return buatKartuUbah(n, 'desimal');
  }),
  B: DATA.selidikUbah.kePecahan.map(function (n) {
    return buatKartuUbah(n, 'pecahan');
  }),
  C: DATA.selidikUbah.keBulat.map(function (n) {
    return buatKartuUbah(n, 'bulat');
  }),
};
var SEMUA_KARTU_UBAH = KARTU_UBAH.A.concat(KARTU_UBAH.B, KARTU_UBAH.C);
var AMATI = DATA.selidikUbah.amati.map(siapkanGuided);

/* Kartu garis bilangan (tahap 4) ber-id agar urutan tampilnya bisa diacak. */
var GARIS_ITEMS = DATA.selidikGaris.garis.nilai.map(function (n) {
  return { id: n.nilai, nilai: n.nilai, teks: n.teks };
});
var GARIS_TANYA = DATA.selidikGaris.tanya.map(siapkanGuided);

var STRATEGI = DATA.selidikBanding.strategi.map(siapkanGuided);

/* Tahap 6 — kartu urutan keputusan & jawabannya (naik = terkecil dulu). */
function kartuUrut(list, satuan) {
  return list.map(function (x) {
    return {
      id: x.id,
      label:
        '<span aria-hidden="true">' +
        x.ikon +
        '</span> <strong>' +
        esc(x.nama) +
        '</strong> ' +
        buildBilanganChip(x.nilai) +
        (satuan ? ' ' + esc(satuan) : ''),
      aria: x.nama + ' ' + tulisTerpadu(x.nilai) + (satuan ? ' ' + satuan : ''),
    };
  });
}
var SUHU_ITEMS = kartuUrut(DATA.suhu, '°C');
var SUHU_JAWAB = urutanIdTerpadu(DATA.suhu);
var KAS_ITEMS = kartuUrut(DATA.kas, '');
var KAS_JAWAB = urutanIdTerpadu(DATA.kas);
var TANYA_BOTOL = siapkanGuided(DATA.karya.tanyaBotol);
var TANYA_ALASAN = siapkanGuided(DATA.karya.tanyaAlasan);

var PENDAPAT_ITEMS = DATA.evaluasi.pendapat.map(function (p) {
  return { id: p.id, teks: esc(p.teks), correct: p.correct, explanation: esc(p.explanation) };
});

/* Bank soal uji terap dengan label opsi aman. */
var TERAP_BANK = DATA.terapkan.soal.map(function (s) {
  var c = {};
  Object.keys(s).forEach(function (k) {
    c[k] = s[k];
  });
  if (s.options) c.options = opsiAman(s.options);
  return c;
});

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

  /* Tahap 3 — samakan bentuk */
  ubahOrders: {},
  ubahPilih: {},
  ubahSalah: {},
  amatiOrders: {},
  amatiPilih: {},

  /* Tahap 4 — garis bilangan */
  garisOrder: null,
  garisState: null,
  garisTanyaOrders: {},
  garisTanyaPilih: {},

  /* Tahap 5 — bandingkan */
  simbolOrders: {},
  simbolStates: {},
  maknaOrders: {},
  maknaPilih: {},
  strategiOrders: {},
  strategiPilih: {},

  /* Tahap 6 — karya */
  suhuState: null,
  kasState: null,
  karyaOrders: {},
  karyaPilih: {},
  karyaPesan: '',

  /* Tahap 7 — evaluasi */
  pendapatStates: {},
  pendapatOrder: null,
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 8 — uji terap */
  terapkanPick: null,
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

/* Memastikan State[key] berupa objek biasa (peta id → nilai). */
function ensureMap(key) {
  if (!State[key] || typeof State[key] !== 'object' || Array.isArray(State[key])) {
    State[key] = {};
  }
  return State[key];
}

/* Mengacak urutan opsi untuk setiap pertanyaan { id, opsi } dalam daftar. */
function ensureListOrders(key, list, opsiOf) {
  var map = ensureMap(key);
  list.forEach(function (q) {
    ensureShuffledOrder(map, q.id, opsiOf ? opsiOf(q) : q.opsi);
  });
}

/*
 * Soal uji terap yang sedang dipakai. Array ini DIISI ULANG di tempat
 * (bukan diganti) karena createExerciseStage menyimpan referensinya.
 */
var TERAP_SOAL = [];

function jenisSoal(s) {
  return s.type === 'choice' ? 'choice' : s.mode;
}

/* Memilih soal acak dari bank sesuai komposisi, lalu mengacak urutannya. */
function pilihSoalTerap() {
  var T = DATA.terapkan;
  var ids = [];
  Object.keys(T.komposisi).forEach(function (k) {
    var kelompok = TERAP_BANK.filter(function (s) {
      return jenisSoal(s) === k;
    });
    shuffleArray(kelompok)
      .slice(0, T.komposisi[k])
      .forEach(function (s) {
        ids.push(s.id);
      });
  });
  return shuffleArray(ids);
}

function terapPickValid() {
  var pick = State.terapkanPick;
  if (!Array.isArray(pick) || pick.length !== DATA.terapkan.banyak) return false;
  var ada = optionIds(TERAP_BANK);
  return pick.every(function (id, i) {
    return ada.indexOf(id) !== -1 && pick.indexOf(id) === i;
  });
}

function isiTerapSoal() {
  var byId = {};
  TERAP_BANK.forEach(function (s) {
    byId[s.id] = s;
  });
  TERAP_SOAL.length = 0;
  State.terapkanPick.forEach(function (id) {
    TERAP_SOAL.push(byId[id]);
  });
}

/*
 * Menyiapkan seluruh state per-langkah DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1 */
  var dugaanOrders = ensureMap('dugaanOrders');
  DATA.orientasi.dugaan.forEach(function (q) {
    ensureShuffledOrder(dugaanOrders, q.id, q.opsi);
  });
  ensureMap('dugaanPilih');
  ensureShuffledOrder(State, 'masalahOrder', DATA.orientasi.masalahOpsi);

  /* Tahap 2 */
  ensureShuffledOrder(State, 'peranOrder', DATA.organisasi.peran);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.organisasi.opsiPilah);
  ensureTapOrderState(State, 'rencanaState', RENCANA_ITEMS, RENCANA_JAWAB);

  /* Tahap 3 — opsi bentuk setara dibuat engine lalu diacak */
  ensureListOrders('ubahOrders', SEMUA_KARTU_UBAH);
  ensureMap('ubahPilih');
  ensureMap('ubahSalah');
  ensureListOrders('amatiOrders', AMATI);
  ensureMap('amatiPilih');

  /* Tahap 4 */
  ensureShuffledOrder(State, 'garisOrder', GARIS_ITEMS);
  ensureNumberLinePlacementState(State, 'garisState');
  ensureListOrders('garisTanyaOrders', GARIS_TANYA);
  ensureMap('garisTanyaPilih');

  /* Tahap 5 */
  var simbolOrders = ensureMap('simbolOrders');
  var simbolStates = ensureMap('simbolStates');
  var maknaOrders = ensureMap('maknaOrders');
  DATA.selidikBanding.pasangan.forEach(function (p) {
    ensureShuffledOrder(simbolOrders, p.id, COMPARE_SYMBOLS);
    if (!simbolStates[p.id] || typeof simbolStates[p.id] !== 'object') {
      simbolStates[p.id] = { chosen: null, wrong: 0 };
    }
    ensureShuffledOrder(maknaOrders, p.id, opsiMaknaBandingTerpadu(p.tema));
  });
  ensureMap('maknaPilih');
  ensureListOrders('strategiOrders', STRATEGI);
  ensureMap('strategiPilih');

  /* Tahap 6 */
  ensureTapOrderState(State, 'suhuState', SUHU_ITEMS, SUHU_JAWAB);
  ensureTapOrderState(State, 'kasState', KAS_ITEMS, KAS_JAWAB);
  ensureListOrders('karyaOrders', [TANYA_BOTOL, TANYA_ALASAN]);
  ensureMap('karyaPilih');

  /* Tahap 7 */
  ensureSortStates(
    State,
    'pendapatStates',
    'pendapatOrder',
    PENDAPAT_ITEMS,
    DATA.evaluasi.opsiPendapat
  );
  ensureShuffledOrder(State, 'bankOrder', DATA.evaluasi.bank);
  ensureMap('simpulanPilihan');

  /* Tahap 8 — soal dipilih acak dari bank; opsi tiap soal diacak */
  if (!terapPickValid()) {
    State.terapkanPick = pilihSoalTerap();
    State.terapkanExercises = [];
    State.terapkanIdx = 0;
  }
  isiTerapSoal();
  ensureExerciseArray(State, 'terapkanExercises', TERAP_SOAL, function (s) {
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
  if (State.terapkanIdx >= TERAP_SOAL.length || State.terapkanIdx < 0) {
    State.terapkanIdx = 0;
  }

  /* Tahap 9 */
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

function buildTemuanList(items) {
  return (
    '<ul class="temuan-list">' +
    items
      .map(function (t) {
        return '<li>' + esc(t) + '</li>';
      })
      .join('') +
    '</ul>'
  );
}

function panelJudul(judul, inner, cls) {
  return buildDlPanel('<h3 style="margin-top:0;">' + esc(judul) + '</h3>' + inner, cls);
}

function caption(teks) {
  return '<p class="dl-caption">' + esc(teks) + '</p>';
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

/* Baris data catatan panitia: ikon, nama, chip bilangan, satuan. */
function buildDataRow(ikon, nama, nilai, satuan) {
  return (
    '<li class="data-row">' +
    (ikon ? '<span class="data-row__ikon" aria-hidden="true">' + ikon + '</span>' : '') +
    '<span class="data-row__nama">' +
    esc(nama) +
    '</span>' +
    '<span class="data-row__nilai">' +
    buildBilanganChip(nilai) +
    (satuan ? ' <span class="data-row__satuan">' + esc(satuan) + '</span>' : '') +
    '</span>' +
    '</li>'
  );
}

function buildCatatanCard(c) {
  var rows = '';
  if (c.sumber === 'suhu') {
    rows = DATA.suhu
      .map(function (s) {
        return buildDataRow(s.ikon, s.nama, s.nilai, c.satuan);
      })
      .join('');
  } else if (c.sumber === 'sirup') {
    rows =
      buildDataRow('📋', 'Kebutuhan resep', DATA.sirup.butuh, c.satuan) +
      DATA.sirup.botol
        .map(function (b) {
          return buildDataRow('🧴', 'Botol ' + b.nama, b.nilai, c.satuan);
        })
        .join('');
  } else {
    rows = DATA.kas
      .map(function (k) {
        return buildDataRow(k.ikon, k.nama, k.nilai, c.satuan);
      })
      .join('');
  }
  return (
    '<article class="catatan-card">' +
    '<header class="catatan-card__head"><span class="catatan-card__ikon" aria-hidden="true">' +
    c.ikon +
    '</span><h3 class="catatan-card__judul">' +
    esc(c.judul) +
    '</h3></header>' +
    '<p class="catatan-card__teks">' +
    teksHTML(c.teks) +
    '</p>' +
    '<ul class="data-list">' +
    rows +
    '</ul>' +
    '</article>'
  );
}

/* ============================================================
   5. STAGE: ORIENTASI MASALAH  (PBL — sintaks 1)
   Dugaan TIDAK dinilai; pertanyaan inti dinilai dengan umpan balik.
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

  var dugaanHTML = D.dugaan
    .map(function (q, i) {
      return (
        '<div class="quiz-item">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        renderFracText(q.tanya) +
        '</p>' +
        buildChoiceGroup(DUGAAN_OPSI[q.id], State.dugaanOrders[q.id], {
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
      '<h2 style="margin-top:0;">🍧 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="catatan-grid">' +
        D.catatan.map(buildCatatanCard).join('') +
        '</div>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaan kelompokmu?</h3>' +
        caption('Dugaan tidak dinilai. Kalian akan mengujinya sendiri di tahap Evaluasi.') +
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
            buildChoiceGroup(MASALAH_OPSI, State.masalahOrder, {
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
    });
  });

  container.querySelectorAll('[data-masalah]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.masalahPilihan === D.masalahCorrect) return;
      State.masalahPilihan = btn.dataset.masalah;
      saveState();
      renderOrientasi(container);
    });
  });

  bindTextarea('orientasiAlasan', 'orientasiAlasan');
  bindTextarea('masalahHipotesis', 'masalahHipotesis');

  var nextBtn = document.getElementById('orientasiNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.masalahHipotesis.trim()) {
        showNotice('Tulis hipotesis kelompokmu lebih dulu, walau hanya satu kalimat.');
        return;
      }
      completeStage('orientasi');
      navigateTo('organisasi');
    });
  }
}

/* ============================================================
   6. STAGE: ORGANISASI  (PBL — sintaks 2)
   Pilih peran → pilah informasi → susun rencana penyelidikan.
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
          buildSortItems(PILAH_ITEMS, State.pilahOrder, D.opsiPilah, State.pilahStates)
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
              successText:
                '<strong>Rencana tersusun!</strong> Kenali bentuk → samakan bentuk → bandingkan di garis bilangan → ambil keputusan. Rencana ini akan kalian jalankan pada tiga penyelidikan berikutnya.',
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
    });
  });
  if (peranOk) bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  if (peranOk && pilahOk) {
    bindTapOrder(container, 'rencana', State.rencanaState, RENCANA_JAWAB, saveState, rerender);
  }
  bindNext('organisasiNextBtn', 'organisasi', 'selidikUbah');
}

/* ============================================================
   7. STAGE: PENYELIDIKAN A — SAMAKAN BENTUK  (PBL — sintaks 3)
   Kartu dibuka satu per satu per bagian (A pecahan → desimal,
   B desimal → pecahan, C bulat → desimal). Opsi bentuk setara dari
   engine (opsiBentukSetara), urutannya diacak di State.ubahOrders.
   ============================================================ */

function kartuBenar(k) {
  return State.ubahPilih[k.id] === 'baku';
}

function bagianSelesai(list) {
  return list.every(kartuBenar);
}

function ubahSemuaSelesai() {
  return SEMUA_KARTU_UBAH.every(kartuBenar);
}

function tanyaKartu(k) {
  var chip = buildBilanganChip(k.nilai, true);
  if (k.arah === 'desimal') return 'Bentuk desimal dari ' + chip + ' adalah …';
  if (k.arah === 'pecahan') return 'Bentuk pecahan paling sederhana dari ' + chip + ' adalah …';
  return 'Bilangan bulat ' + chip + ' ditulis sebagai desimal …';
}

function buildKartuUbah(k, i) {
  var chosen = State.ubahPilih[k.id] || null;
  var benar = kartuBenar(k);
  var langkah = k.arah === 'desimal' ? penyebutPersepuluhan(k.nilai) : null;
  return (
    '<div class="ubah-card' +
    (benar ? ' is-done' : '') +
    '">' +
    '<p class="exercise-label"><span class="dl-step__num">' +
    (i + 1) +
    '</span>' +
    tanyaKartu(k) +
    '</p>' +
    (langkah && !benar && (State.ubahSalah[k.id] || 0) >= 1
      ? '<p class="dl-caption">Petunjuk: ' +
        buildBilanganChip(k.nilai) +
        ' = ' +
        buildBilanganChip(langkah) +
        '</p>'
      : '') +
    buildChoiceGroup(k.opsi, State.ubahOrders[k.id], {
      chosen: chosen,
      correctId: benar ? 'baku' : null,
      grade: true,
      locked: benar,
      group: k.id,
      attr: 'data-ubah',
    }) +
    buildGuidedChoiceFeedback(chosen, benar, k.umpan) +
    '</div>'
  );
}

/* Kartu bagian ini sampai kartu pertama yang belum benar. */
function buildBagianUbah(list) {
  var html = '';
  for (var i = 0; i < list.length; i++) {
    html += buildKartuUbah(list[i], i);
    if (!kartuBenar(list[i])) break;
  }
  return '<div class="ubah-list">' + html + '</div>';
}

function renderSelidikUbah(container) {
  var D = DATA.selidikUbah;
  var rerender = function () {
    renderSelidikUbah(container);
  };
  var aOk = bagianSelesai(KARTU_UBAH.A);
  var bOk = aOk && bagianSelesai(KARTU_UBAH.B);
  var cOk = bOk && bagianSelesai(KARTU_UBAH.C);
  var amatiOk = cOk && guidedQuizAllCorrect(AMATI, State.amatiPilih);

  container.innerHTML =
    '<section aria-label="Penyelidikan A: Samakan Bentuk">' +
    buildHead(D) +
    panelJudul('🔁 ' + D.judulA, caption(D.instruksiA) + buildBagianUbah(KARTU_UBAH.A)) +
    (aOk
      ? panelJudul('🔁 ' + D.judulB, caption(D.instruksiB) + buildBagianUbah(KARTU_UBAH.B))
      : '') +
    (bOk
      ? panelJudul('🔁 ' + D.judulC, caption(D.instruksiC) + buildBagianUbah(KARTU_UBAH.C))
      : '') +
    (cOk
      ? panelJudul(
          '🔎 Amati hasil lab kalian',
          buildTabelBentukTerpadu(
            SEMUA_KARTU_UBAH.map(function (k, i) {
              return { label: 'Kartu ' + (i + 1), nilai: k.nilai };
            }),
            { caption: 'Bentuk setara hasil Lab Samakan Bentuk' }
          ) + buildGuidedQuizList(AMATI, State.amatiOrders, State.amatiPilih)
        )
      : '') +
    (amatiOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">💡 Temuan kelompok</h3>' + buildTemuanList(D.temuan),
          'panel--hero'
        ) + buildDlNextButton('ubahNextBtn', D.nextLabel)
      : '') +
    '</section>';

  container.querySelectorAll('[data-ubah]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.group;
      if (State.ubahPilih[id] === 'baku') return;
      State.ubahPilih[id] = btn.dataset.ubah;
      if (btn.dataset.ubah !== 'baku') State.ubahSalah[id] = (State.ubahSalah[id] || 0) + 1;
      saveState();
      rerender();
    });
  });
  if (cOk) bindGuidedQuizList(container, AMATI, State.amatiPilih, saveState, rerender);
  bindNext('ubahNextBtn', 'selidikUbah', 'selidikGaris');
}

/* ============================================================
   8. STAGE: PENYELIDIKAN B — GARIS BILANGAN TERPADU  (PBL — sintaks 3)
   ============================================================ */

function garisItems() {
  return orderByIds(GARIS_ITEMS, State.garisOrder);
}

function renderSelidikGaris(container) {
  var D = DATA.selidikGaris;
  var g = D.garis;
  var rerender = function () {
    renderSelidikGaris(container);
  };
  var items = garisItems();
  var done = numberLinePlacementDone(items, State.garisState);
  var tanyaOk = done && guidedQuizAllCorrect(GARIS_TANYA, State.garisTanyaPilih);
  var urut = urutkanTerpadu(
    g.nilai.map(function (n) {
      return n.nilai;
    })
  ).map(tulisTerpadu);

  container.innerHTML =
    '<section aria-label="Penyelidikan B: Garis Bilangan Terpadu">' +
    buildHead(D) +
    panelJudul(
      '📏 ' + D.judul,
      caption(D.instruksi) +
        buildPenempatanTerpadu('garisTerpadu', items, State.garisState, {
          min: g.min,
          max: g.max,
          langkah: g.langkah,
          doneText:
            '<strong>Semua kartu sudah di tempatnya.</strong> Urutan dari kiri ke kanan: ' +
            esc(urut.join(' < ')) +
            '.',
        })
    ) +
    (done
      ? panelJudul(
          '🔎 Amati garis bilanganmu',
          buildGuidedQuizList(GARIS_TANYA, State.garisTanyaOrders, State.garisTanyaPilih)
        )
      : '') +
    (tanyaOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">💡 Temuan kelompok</h3>' + buildTemuanList(D.temuan),
          'panel--hero'
        ) + buildDlNextButton('garisNextBtn', D.nextLabel)
      : '') +
    '</section>';

  if (!done) {
    bindPenempatanTerpadu(
      container,
      'garisTerpadu',
      items,
      State.garisState,
      g.langkah,
      saveState,
      rerender
    );
  } else {
    bindGuidedQuizList(container, GARIS_TANYA, State.garisTanyaPilih, saveState, rerender);
  }
  if (typeof centerNumberLines === 'function') centerNumberLines(container);
  bindNext('garisNextBtn', 'selidikGaris', 'selidikBanding');
}

/* ============================================================
   9. STAGE: PENYELIDIKAN C — BANDINGKAN LINTAS BENTUK  (PBL — sintaks 3)
   ============================================================ */

function pasanganById(id) {
  return DATA.selidikBanding.pasangan.filter(function (p) {
    return p.id === id;
  })[0];
}

function simbolBenar(p) {
  return State.simbolStates[p.id].chosen === simbolBandingTerpadu(p.a, p.b);
}

function maknaBenar(p) {
  return State.maknaPilih[p.id] === idMaknaBandingTerpadu(p.a, p.b);
}

function pasanganSelesai(p) {
  return simbolBenar(p) && maknaBenar(p);
}

function teksBilanganSatuan(nilai, satuan) {
  return buildBilanganChip(nilai) + (satuan ? ' ' + esc(satuan) : '');
}

function buildPasanganCard(p, i) {
  var st = State.simbolStates[p.id];
  var okSimbol = simbolBenar(p);
  var chosenMakna = State.maknaPilih[p.id] || null;
  var okMakna = maknaBenar(p);
  var K = kataBandingTerpadu(p.tema);
  var maknaHTML = '';
  if (okSimbol) {
    var kalimatKosong = esc(p.kalimat).replace('___', '<span class="blank-slot">…</span>');
    var kalimatIsi = esc(p.kalimat).replace(
      '___',
      '<strong>' + esc(maknaBandingTerpadu(p.a, p.b, p.tema)) + '</strong>'
    );
    maknaHTML =
      '<div class="quiz-item quiz-item--guided">' +
      '<p class="exercise-label">Jadi, dalam cerita: ' +
      kalimatKosong +
      '</p>' +
      buildChoiceGroup(opsiMaknaBandingTerpadu(p.tema), State.maknaOrders[p.id], {
        chosen: chosenMakna,
        correctId: okMakna ? idMaknaBandingTerpadu(p.a, p.b) : null,
        grade: true,
        locked: okMakna,
        group: p.id,
        attr: 'data-makna',
      }) +
      (chosenMakna
        ? '<div style="margin-top:var(--space-3);">' +
          (okMakna
            ? buildFeedbackBox('success', '✓', kalimatIsi)
            : buildFeedbackBox(
                'warning',
                '💭',
                'Ingat: ' +
                  esc(
                    tulisTerpadu(p.a) +
                      ' ' +
                      compareSymbolText(simbolBandingTerpadu(p.a, p.b)) +
                      ' ' +
                      tulisTerpadu(p.b)
                  ) +
                  '. Dalam cerita ini, bilangan yang lebih kecil berarti "<strong>' +
                  esc(K.kecil) +
                  '</strong>" dan yang lebih besar berarti "<strong>' +
                  esc(K.besar) +
                  '</strong>".'
              )) +
          '</div>'
        : '') +
      '</div>';
  }
  return (
    '<div class="banding-card' +
    (pasanganSelesai(p) ? ' is-done' : '') +
    '">' +
    '<p class="dl-step__label"><span class="dl-step__num">' +
    (i + 1) +
    '</span><span aria-hidden="true">' +
    p.ikon +
    '</span> ' +
    esc(p.namaA) +
    ' ' +
    teksBilanganSatuan(p.a, p.satuan) +
    ' dan ' +
    esc(p.namaB) +
    ' ' +
    teksBilanganSatuan(p.b, p.satuan) +
    '</p>' +
    buildKalimatBandingTerpadu(p.a, p.b, okSimbol ? st.chosen : null) +
    '<p class="dl-caption">Pilih lambang yang tepat:</p>' +
    buildPilihSimbolTerpadu(p.a, p.b, State.simbolOrders[p.id], st, { group: p.id }) +
    maknaHTML +
    '</div>'
  );
}

function renderSelidikBanding(container) {
  var D = DATA.selidikBanding;
  var rerender = function () {
    renderSelidikBanding(container);
  };

  var kartu = '';
  var aSelesai = true;
  for (var i = 0; i < D.pasangan.length; i++) {
    kartu += buildPasanganCard(D.pasangan[i], i);
    if (!pasanganSelesai(D.pasangan[i])) {
      aSelesai = false;
      break;
    }
  }
  var bSelesai = aSelesai && guidedQuizAllCorrect(STRATEGI, State.strategiPilih);

  container.innerHTML =
    '<section aria-label="Penyelidikan C: Bandingkan Lintas Bentuk">' +
    buildHead(D) +
    panelJudul(
      '⚖️ ' + D.judulA,
      caption(D.instruksiA) + '<div class="banding-list">' + kartu + '</div>'
    ) +
    (aSelesai
      ? panelJudul(
          '🧠 ' + D.judulB,
          buildGuidedQuizList(STRATEGI, State.strategiOrders, State.strategiPilih)
        )
      : '') +
    (bSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">💡 Temuan kelompok</h3>' + buildTemuanList(D.temuan),
          'panel--hero'
        ) + buildDlNextButton('bandingNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindPilihSimbolTerpadu(
    container,
    function (group) {
      var p = pasanganById(group);
      return p ? [p.a, p.b] : null;
    },
    function (group) {
      return State.simbolStates[group];
    },
    saveState,
    rerender
  );

  container.querySelectorAll('[data-makna]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var p = pasanganById(btn.dataset.group);
      if (!p || maknaBenar(p)) return;
      State.maknaPilih[p.id] = btn.dataset.makna;
      saveState();
      rerender();
    });
  });

  if (aSelesai) bindGuidedQuizList(container, STRATEGI, State.strategiPilih, saveState, rerender);
  bindNext('bandingNextBtn', 'selidikBanding', 'karya');
}

/* ============================================================
   10. STAGE: KARYA — PAPAN KEPUTUSAN STAND  (PBL — sintaks 4)
   ============================================================ */

function chipUrutan(list, jawab, sep) {
  var byId = {};
  list.forEach(function (x) {
    byId[x.id] = x;
  });
  return jawab
    .map(function (id) {
      return esc(byId[id].nama) + ' ' + buildBilanganChip(byId[id].nilai);
    })
    .join(' <span class="poster-sep">' + esc(sep) + '</span> ');
}

function buildPapanKeputusan() {
  var K = DATA.karya;
  var botol = DATA.sirup.botol.filter(function (b) {
    return b.id === TANYA_BOTOL.correct;
  })[0];
  var alasan = findOptionLabel(TANYA_ALASAN.opsi, TANYA_ALASAN.correct);
  var peran = State.peranPilih ? findOptionLabel(DATA.organisasi.peran, State.peranPilih) : '';
  return buildInfoPoster({
    judul: K.posterJudul,
    ikon: '🍧',
    rows: [
      {
        ikon: '🧊',
        label: 'Simpan es batu di',
        nilai:
          '<strong>' +
          esc(DATA.suhu[0].nama) +
          '</strong> — paling dingin.<br><span class="dl-caption">Urutan suhu: </span>' +
          chipUrutan(DATA.suhu, SUHU_JAWAB, '<'),
      },
      {
        ikon: '🥤',
        label: 'Beli sirup di',
        nilai:
          '<strong>' +
          esc(botol.nama) +
          '</strong> ' +
          buildBilanganChip(botol.nilai) +
          ' L = ' +
          buildBilanganChip(DATA.sirup.butuh) +
          ' L (pas, tanpa sisa)',
      },
      {
        ikon: '🤝',
        label: 'Kelompok yang dibantu',
        nilai:
          '<strong>' +
          esc(
            DATA.kas.filter(function (k) {
              return k.id === KAS_JAWAB[0];
            })[0].nama
          ) +
          '</strong><br><span class="dl-caption">Peringkat kas: </span>' +
          chipUrutan(DATA.kas, KAS_JAWAB, '<'),
      },
      { ikon: '🧠', label: 'Alasan kami', nilai: alasan },
    ].concat(peran ? [{ ikon: '👥', label: 'Peranku', nilai: peran }] : []),
    pesan: State.karyaPesan.trim() || undefined,
    footer: K.posterFooter,
  });
}

function renderKarya(container) {
  var D = DATA.karya;
  var rerender = function () {
    renderKarya(container);
  };
  var s1 = State.suhuState.correct;
  var s2 = s1 && State.karyaPilih[TANYA_BOTOL.id] === TANYA_BOTOL.correct;
  var s3 = s2 && State.kasState.correct;
  var s4 = s3 && State.karyaPilih[TANYA_ALASAN.id] === TANYA_ALASAN.correct;

  container.innerHTML =
    '<section aria-label="Menyajikan Hasil Karya">' +
    buildHead(D) +
    panelJudul(
      '🧊 ' + D.judul1,
      buildTapOrder('urutSuhu', SUHU_ITEMS, State.suhuState, {
        answer: SUHU_JAWAB,
        startLabel: 'Paling dingin',
        endLabel: 'Paling hangat',
        separator: '<',
        successText:
          '<strong>Tepat!</strong> ' +
          esc(
            SUHU_JAWAB.map(function (id) {
              return tulisTerpadu(
                DATA.suhu.filter(function (s) {
                  return s.id === id;
                })[0].nilai
              );
            }).join(' < ')
          ) +
          '. Suhu terkecil paling dingin.',
      })
    ) +
    (s1
      ? panelJudul(
          '🥤 ' + D.judul2,
          buildTabelBentukTerpadu(
            [{ label: 'Kebutuhan resep', nilai: DATA.sirup.butuh }].concat(
              DATA.sirup.botol.map(function (b) {
                return { label: 'Botol ' + b.nama, nilai: b.nilai };
              })
            ),
            { caption: 'Isi dalam liter' }
          ) + buildGuidedQuizList([TANYA_BOTOL], State.karyaOrders, State.karyaPilih)
        )
      : '') +
    (s2
      ? panelJudul(
          '💰 ' + D.judul3,
          buildTapOrder('urutKas', KAS_ITEMS, State.kasState, {
            answer: KAS_JAWAB,
            startLabel: 'Paling jauh di bawah target',
            endLabel: 'Hasil terbaik',
            separator: '<',
            successText:
              '<strong>Tepat!</strong> Kelompok dengan bilangan terkecil paling jauh di bawah target, jadi dialah yang dibantu.',
          })
        )
      : '') +
    (s3
      ? panelJudul(
          '🧠 ' + D.judul4,
          buildGuidedQuizList([TANYA_ALASAN], State.karyaOrders, State.karyaPilih)
        )
      : '') +
    (s4
      ? buildDlPanel(
          buildTextarea('karyaPesan', D.pesanLabel, D.pesanPlaceholder, State.karyaPesan) +
            '<div class="btn-group btn-group--end" style="margin-top:var(--space-3);">' +
            '<button type="button" class="btn btn--ghost" id="posterRefreshBtn">Perbarui Papan</button>' +
            '</div>' +
            '<div id="posterWrap">' +
            buildPapanKeputusan() +
            '</div>' +
            buildFeedbackBox(
              'info',
              '🎤',
              'Presentasikan papan ini di depan kelas (±2 menit). Setiap anggota menjelaskan satu keputusan beserta alasannya.'
            ),
          'panel--hero'
        ) + buildDlNextButton('karyaNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindTapOrder(container, 'urutSuhu', State.suhuState, SUHU_JAWAB, saveState, rerender);
  if (s1) bindGuidedQuizList(container, [TANYA_BOTOL], State.karyaPilih, saveState, rerender);
  if (s2) bindTapOrder(container, 'urutKas', State.kasState, KAS_JAWAB, saveState, rerender);
  if (s3) bindGuidedQuizList(container, [TANYA_ALASAN], State.karyaPilih, saveState, rerender);
  bindTextarea('karyaPesan', 'karyaPesan');
  var refresh = document.getElementById('posterRefreshBtn');
  if (refresh) {
    refresh.addEventListener('click', function () {
      document.getElementById('posterWrap').innerHTML = buildPapanKeputusan();
    });
  }
  var nextBtn = document.getElementById('karyaNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.karyaPesan.trim()) {
        showNotice('Tulis pesan kelompokmu untuk panitia lebih dulu.');
        return;
      }
      completeStage('karya');
      navigateTo('evaluasi');
    });
  }
}

/* ============================================================
   11. STAGE: EVALUASI  (PBL — sintaks 5)
   A. pendapat teman → B. dugaan vs hasil → C. simpulan.
   ============================================================ */

function buildDugaanBanding() {
  var S = DATA.orientasi;
  return (
    '<div class="dugaan-compare">' +
    S.dugaan
      .map(function (q) {
        var opsi = DUGAAN_OPSI[q.id];
        var pilih = State.dugaanPilih[q.id];
        var cocok = pilih === q.baku;
        return (
          '<div class="dugaan-row' +
          (cocok ? ' dugaan-row--ok' : '') +
          '">' +
          '<span class="dugaan-row__title">' +
          renderFracText(q.tanya) +
          '</span>' +
          '<span>Dugaanmu: <strong>' +
          (findOptionLabel(opsi, pilih) || '—') +
          '</strong></span>' +
          '<span>Hasil penyelidikan: <strong>' +
          findOptionLabel(opsi, q.baku) +
          '</strong> — ' +
          esc(q.pembahasan) +
          '</span>' +
          '<span class="dugaan-row__verdict">' +
          (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh penyelidikanmu') +
          '</span>' +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    (State.masalahHipotesis
      ? '<div class="hipotesis-box">' +
        '<span class="hipotesis-box__label">Hipotesis kelompokmu di tahap 1</span>' +
        '<p>' +
        esc(State.masalahHipotesis) +
        '</p>' +
        '<span class="dl-caption">Apakah hipotesismu sesuai dengan hasil penyelidikan? Diskusikan dalam kelompok.</span>' +
        '</div>'
      : '')
  );
}

function simpulanSemuaBenar() {
  return DATA.evaluasi.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function buildSimpulan() {
  var D = DATA.evaluasi;
  var bank = orderByIds(D.bank, State.bankOrder);
  var benarSemua = simpulanSemuaBenar();
  var diperiksa = State.simpulanChecked;
  return D.kalimat
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali hasil penyelidikanmu, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');
}

function renderEvaluasi(container) {
  var D = DATA.evaluasi;
  var rerender = function () {
    renderEvaluasi(container);
  };
  var aOk = sortItemsAllAnswered(PENDAPAT_ITEMS, State.pendapatStates);
  var benarSemua = simpulanSemuaBenar();

  container.innerHTML =
    '<section aria-label="Analisis dan Evaluasi">' +
    buildHead(D) +
    panelJudul(
      '🗣️ ' + D.judulA,
      buildSortItems(PENDAPAT_ITEMS, State.pendapatOrder, D.opsiPendapat, State.pendapatStates)
    ) +
    (aOk ? panelJudul('🔁 ' + D.judulB, buildDugaanBanding()) : '') +
    (aOk
      ? panelJudul(
          '🧩 ' + D.judulC,
          caption(D.instruksiC) +
            buildSimpulan() +
            (benarSemua
              ? buildFeedbackBox(
                  'success',
                  '✓',
                  '<strong>Simpulan kelompokmu lengkap dan tepat.</strong> Inilah cara yang kalian temukan dan buktikan sendiri.'
                )
              : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
                '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Simpulan</button>' +
                '</div>')
        )
      : '') +
    (aOk && benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman: Membandingkan Bilangan secara Terpadu</h3>' +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + r + '</li>'
                );
              })
              .join('') +
            '</ol>',
          'panel--hero'
        ) + buildDlNextButton('evaluasiNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindSortItems(container, PENDAPAT_ITEMS, State.pendapatStates, saveState, rerender);

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
      rerender();
    });
  }

  bindNext('evaluasiNextBtn', 'evaluasi', 'terapkan');
}

/* ============================================================
   12. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal TERAP_SOAL yang
   dipilih acak. Isian diperiksa periksaIsianTerpadu (nilai & bentuk).
   ============================================================ */

var TerapkanStage = createExerciseStage({
  soal: TERAP_SOAL,
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
  defaultType: 'input',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  inputRowClass: 'dl-input-row',
  inputMode: 'text',
  allowNegative: true,
  inputAriaLabel: 'Jawabanmu',
  inputPlaceholder: 'mis. 0,75 atau −2,5',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  /* Teks mentah diteruskan; pemeriksaan & diagnosa ada di isCorrect. */
  parseInput: function (val) {
    if (!val || !String(val).trim()) return { value: null, error: 'empty' };
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return periksaIsianTerpadu(value, s.jawab, s.bentuk).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' +
      esc(ex.userInput) +
      '</strong> — ' +
      periksaIsianTerpadu(ex.userInput, s.jawab, s.bentuk).pesan
    );
  },
  revealText: function (s) {
    return esc(s.reveal + ' ' + s.explanation);
  },
  renderPrompt: function (s) {
    var tag = s.type === 'choice' ? 'Pilihan ganda' : '✏️ Tulis dalam bentuk ' + s.bentuk;
    return (
      '<div class="dl-prompt">' +
      '<span class="bbk-soal-tag">' +
      esc(tag) +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      teksHTML(s.cerita) +
      '</p>' +
      '<p class="dl-prompt__tanya">' +
      teksHTML(s.pertanyaan) +
      '</p>' +
      '</div>'
    );
  },
});

function renderTerapkan(container) {
  TerapkanStage.render(container);
}

/* ============================================================
   13. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var ubahSekali = SEMUA_KARTU_UBAH.filter(function (k) {
    return kartuBenar(k) && !State.ubahSalah[k.id];
  }).length;
  var garisSekali = numberLinePlacementFirstTry(GARIS_ITEMS, State.garisState);
  var simbolSekali = DATA.selidikBanding.pasangan.filter(function (p) {
    return simbolBenar(p) && !State.simbolStates[p.id].wrong;
  }).length;
  var benarTerap = State.terapkanExercises.filter(function (e) {
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
        kartu(ubahSekali + '/' + SEMUA_KARTU_UBAH.length, 'Ubah bentuk tepat sekali pilih') +
        kartu(garisSekali + '/' + GARIS_ITEMS.length, 'Titik garis bilangan tepat sekali ketuk') +
        kartu(
          simbolSekali + '/' + DATA.selidikBanding.pasangan.length,
          'Lambang perbandingan tepat sekali pilih'
        ) +
        kartu(benarTerap + '/' + TERAP_SOAL.length, 'Uji terap benar') +
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
        buildChoiceGroup(opsiAman(D.diriOpsi), State.refleksiDiriOrder, {
          chosen: State.refleksiDiri,
        })
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
    '<div class="contoh-grid">' +
    D.contoh
      .map(function (c) {
        return (
          '<div class="formula-card"><span class="formula-card__label"><span aria-hidden="true">' +
          c.ikon +
          '</span> ' +
          esc(c.nama) +
          '</span>' +
          buildKalimatBandingTerpadu(c.a, c.b, simbolBandingTerpadu(c.a, c.b)) +
          '</div>'
        );
      })
      .join('') +
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
    'Presentasi Papan Keputusan Stand dan penjelasan lisan murid tentang strategi membandingkan tetap menjadi bahan penilaian utama.' +
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
   15. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  organisasi: renderOrganisasi,
  selidikUbah: renderSelidikUbah,
  selidikGaris: renderSelidikGaris,
  selidikBanding: renderSelidikBanding,
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
