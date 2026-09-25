'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Membaca, Menuliskan & Membandingkan Bilangan Desimal
   dalam Kehidupan Sehari-hari — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen Discovery Learning: buildDiscoveryHead,
       buildTeacherNote, buildChoiceGroup, buildSortItems,
       buildGuidedQuizList, buildDlPanel, buildDlNextButton;
     • seksi 14 (urut-ketuk): ensureTapOrderState, buildTapOrder,
       bindTapOrder;
     • seksi 19 (nilai tempat desimal): bacaDesimalKoma,
       bacaDesimalNilaiTempat, bagianDariDesimal, desimalDariBagian,
       buildDecimalBuilder/bindDecimalBuilder, buildDecimalBlockLegend;
     • seksi 20 (membandingkan desimal): simbolBandingDesimal,
       urutkanDesimal, buildPlaceValueCompare, buildPlaceValueStack,
       buildCompareSentenceDesimal, buildDecimalPlacement/
       bindDecimalPlacement, buildDecChip;
     • seksi 37 (desimal dalam konteks): cekCaraBacaDesimal,
       diagnosaTulisDesimal, opsiCaraBacaDesimal, opsiNotasiDesimal,
       makeDesimalStep/buildDesimalStep/bindDesimalStep,
       opsiMaknaBandingDesimal, kataBandingDesimal,
       buildPilihSimbolDesimal/bindPilihSimbolDesimal.

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan, pertanyaan masalah,
   cara baca tiap situasi, pertanyaan pengamatan, pasangan baca-tulis,
   lambang <, >, =, makna perbandingan, urutan titik garis bilangan,
   kartu urutan juara, pernyataan, bank kesimpulan, soal & opsi uji
   terap, penilaian diri) DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder() / ensureSortStates() / ensureTapOrderState().
   Pengacakan dilakukan SEKALI saat state disiapkan (initExerciseArrays)
   lalu urutannya disimpan di State — bukan saat render — sehingga
   pilihan tidak melompat saat dirender ulang, tetapi teracak ulang untuk
   setiap murid dan setiap Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi               (DL sintaks 1)
    6. Stage: Identifikasi Masalah    (DL sintaks 2)
    7. Stage: Lab Nilai Tempat        (DL sintaks 3)
    8. Stage: Baca & Tulis            (DL sintaks 4a)
    9. Stage: Membandingkan           (DL sintaks 4b)
   10. Stage: Pembuktian              (DL sintaks 5)
   11. Stage: Menarik Kesimpulan      (DL sintaks 6)
   12. Stage: Uji Terap
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
var STORAGE_KEY = 'mpi-d-1-5-desimal-konteks-v1';

/* Cara bacaan dikte: 'nilai' → cara baca nilai tempat, selain itu cara baca koma. */
function teksDikte(nilai, mode) {
  return mode === 'nilai' ? bacaDesimalNilaiTempat(nilai) : bacaDesimalKoma(nilai);
}

/* Opsi { id, label (HTML), umpan } + peta umpan untuk buildGuidedQuizList. */
function opsiGuided(opsi) {
  var umpan = {};
  opsi.forEach(function (o) {
    umpan[o.id] = o.umpan;
  });
  return {
    opsi: opsi.map(function (o) {
      return { id: o.id, label: esc(o.label) };
    }),
    umpan: umpan,
  };
}

/*
 * Pertanyaan pasangan baca-tulis (tahap 4a). Opsi dibuat engine dari
 * nilai di DATA — deterministik, sehingga cukup dibuat sekali; urutan
 * tampilnya diacak lewat State.pasangOrders.
 */
var PASANG = DATA.olahBaca.pasang.map(function (q) {
  var baca = q.arah === 'baca';
  var g = opsiGuided(baca ? opsiCaraBacaDesimal(q.nilai) : opsiNotasiDesimal(q.nilai));
  return {
    id: q.id,
    tanya: baca
      ? 'Bilangan ' + buildDecChip(q.nilai) + ' dibaca …'
      : 'Bilangan yang dibaca "<strong>' +
        esc(teksDikte(q.nilai, q.dikte)) +
        '</strong>" ditulis …',
    opsi: g.opsi,
    correct: 'baku',
    umpan: g.umpan,
  };
});

/* Kartu urutan juara (tahap 4b-C) dan jawabannya (naik = tercepat dulu). */
var URUT_ITEMS = DATA.olahBanding.urut.map(function (u) {
  return {
    id: u.id,
    label: '<strong>' + esc(u.nama) + '</strong> ' + buildDecChip(u.nilai) + ' detik',
    aria: u.nama + ' ' + u.nilai + ' detik',
  };
});
var URUT_JAWAB = (function () {
  var byNilai = {};
  DATA.olahBanding.urut.forEach(function (u) {
    byNilai[u.nilai] = u.id;
  });
  return urutkanDesimal(
    DATA.olahBanding.urut.map(function (u) {
      return u.nilai;
    })
  ).map(function (v) {
    return byNilai[v];
  });
})();

/* Titik garis bilangan (tahap 4b-B) sebagai opsi ber-id agar urutannya bisa diacak. */
var LETAK_ITEMS = DATA.olahBanding.letak.nilai.map(function (n) {
  return { id: n.value, value: n.value, teks: n.teks };
});

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'stimulasi',
  completedStages: {},

  /* Tahap 1 — stimulasi */
  dugaanOrders: {},
  dugaanPilih: {},
  stimulasiAlasan: '',

  /* Tahap 2 — identifikasi masalah */
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',

  /* Tahap 3 — lab nilai tempat */
  rakitParts: {},
  rakitHasil: {},
  bacaOrders: {},
  bacaPilih: {},
  amatiOrders: {},
  amatiPilih: {},

  /* Tahap 4a — baca & tulis */
  pasangOrders: {},
  pasangPilih: {},
  notasiSteps: [],
  bacaanSteps: [],

  /* Tahap 4b — membandingkan */
  simbolOrders: {},
  simbolStates: {},
  maknaOrders: {},
  maknaPilih: {},
  letakOrder: null,
  letakState: null,
  letakTanyaOrders: {},
  letakTanyaPilih: {},
  urutState: null,

  /* Tahap 5 — pembuktian */
  verifStates: {},
  verifOrder: null,

  /* Tahap 6 — menarik kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 7 — uji terap */
  terapkanPick: null,
  terapkanIdx: 0,
  terapkanExercises: [],

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

/* Hasil pemeriksaan rakitan per situasi. */
function makeRakitHasil() {
  return { done: false, attempts: 0, pesan: '' };
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
    var kelompok = T.soal.filter(function (s) {
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

/*
 * Menyiapkan seluruh state per-langkah DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1–2 */
  ensureListOrders('dugaanOrders', DATA.stimulasi.dugaan);
  ensureMap('dugaanPilih');
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 — rakitan mulai dari nol; cara baca dibuat engine lalu diacak */
  var parts = ensureMap('rakitParts');
  var hasil = ensureMap('rakitHasil');
  DATA.koleksi.situasi.forEach(function (sit) {
    var p = parts[sit.id];
    if (!p || typeof p !== 'object' || typeof p.s !== 'number') parts[sit.id] = makeDecimalParts();
    if (!hasil[sit.id] || typeof hasil[sit.id] !== 'object') hasil[sit.id] = makeRakitHasil();
  });
  ensureListOrders('bacaOrders', DATA.koleksi.situasi, function (s) {
    return opsiCaraBacaDesimal(s.nilai);
  });
  ensureMap('bacaPilih');
  ensureListOrders('amatiOrders', DATA.koleksi.amati);
  ensureMap('amatiPilih');

  /* Tahap 4a */
  ensureListOrders('pasangOrders', PASANG);
  ensureMap('pasangPilih');
  ensureExerciseArray(State, 'notasiSteps', DATA.olahBaca.tulisNotasi, makeDesimalStep);
  ensureExerciseArray(State, 'bacaanSteps', DATA.olahBaca.tulisBacaan, makeDesimalStep);

  /* Tahap 4b */
  var simbolOrders = ensureMap('simbolOrders');
  var simbolStates = ensureMap('simbolStates');
  var maknaOrders = ensureMap('maknaOrders');
  DATA.olahBanding.pasangan.forEach(function (p) {
    ensureShuffledOrder(simbolOrders, p.id, COMPARE_SYMBOLS);
    if (!simbolStates[p.id] || typeof simbolStates[p.id] !== 'object') {
      simbolStates[p.id] = { chosen: null, wrong: 0 };
    }
    ensureShuffledOrder(maknaOrders, p.id, opsiMaknaBandingDesimal(p.tema));
  });
  ensureMap('maknaPilih');
  ensureShuffledOrder(State, 'letakOrder', LETAK_ITEMS);
  ensureNumberLinePlacementState(State, 'letakState');
  ensureListOrders('letakTanyaOrders', [DATA.olahBanding.tanyaLetak]);
  ensureMap('letakTanyaPilih');
  ensureTapOrderState(State, 'urutState', URUT_ITEMS, URUT_JAWAB);

  /* Tahap 5 */
  ensureSortStates(
    State,
    'verifStates',
    'verifOrder',
    DATA.verifikasi.pernyataan,
    DATA.verifikasi.opsiPernyataan
  );

  /* Tahap 6 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);
  ensureMap('simpulanPilihan');

  /* Tahap 7 — soal dipilih acak dari bank; opsi tiap soal diacak */
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

function buildTemuanList(items) {
  return (
    '<ul class="temuan-list">' +
    items
      .map(function (t) {
        return '<li>' + t + '</li>';
      })
      .join('') +
    '</ul>'
  );
}

function semuaCekSelesai(steps) {
  return steps.every(function (s) {
    return s.done;
  });
}

/* Layar alat ukur: angka desimal besar + satuan. */
function buildLayar(nilai, satuan, alat) {
  return (
    '<div class="layar" role="img" aria-label="' +
    esc((alat ? alat + ' menunjukkan ' : '') + nilai + ' ' + satuan) +
    '">' +
    (alat ? '<span class="layar__alat" aria-hidden="true">' + esc(alat) + '</span>' : '') +
    '<span class="layar__angka" aria-hidden="true">' +
    esc(nilai) +
    '</span>' +
    '<span class="layar__satuan" aria-hidden="true">' +
    esc(satuan) +
    '</span>' +
    '</div>'
  );
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah.
   ============================================================ */

function dugaanLengkap() {
  return DATA.stimulasi.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var lengkap = dugaanLengkap();

  var kabarHTML = D.kabar
    .map(function (k) {
      return (
        '<article class="kabar-card">' +
        '<header class="kabar-card__head"><span class="kabar-card__ikon" aria-hidden="true">' +
        k.ikon +
        '</span><span class="kabar-card__sumber">' +
        esc(k.sumber) +
        '</span></header>' +
        buildLayar(k.nilai, k.satuan) +
        '<p class="kabar-card__teks">' +
        esc(k.teks) +
        '</p>' +
        '</article>'
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
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🏟️ ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="kabar-grid">' +
        kabarHTML +
        '</div>',
      'panel--hero'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaanmu?</h3>' +
        dugaanHTML +
        '<div class="field-group" style="margin-top:var(--space-5);">' +
        '<label for="stimulasiAlasan">' +
        esc(D.alasanLabel) +
        '</label>' +
        '<textarea id="stimulasiAlasan" class="input-textarea" placeholder="' +
        esc(D.alasanPlaceholder) +
        '">' +
        esc(State.stimulasiAlasan) +
        '</textarea>' +
        '</div>' +
        buildFeedbackBox('info', '🔎', esc(D.catatan))
    ) +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="stimulasiNextBtn"' +
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
      renderStimulasi(container);
    });
  });

  var ta = document.getElementById('stimulasiAlasan');
  ta.addEventListener('input', function () {
    State.stimulasiAlasan = ta.value;
    saveState();
  });

  document.getElementById('stimulasiNextBtn').addEventListener('click', function () {
    if (!dugaanLengkap()) {
      showNotice('Pilih dugaanmu untuk setiap pertanyaan sebelum melanjutkan.');
      return;
    }
    completeStage('stimulasi');
    navigateTo('masalah');
  });
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
          '<div class="field-group">' +
            '<label for="masalahHipotesis">' +
            esc(D.hipotesisLabel) +
            '</label>' +
            '<textarea id="masalahHipotesis" class="input-textarea" placeholder="' +
            esc(D.hipotesisPlaceholder) +
            '">' +
            esc(State.masalahHipotesis) +
            '</textarea>' +
            '</div>'
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

  var ta = document.getElementById('masalahHipotesis');
  if (ta) {
    ta.addEventListener('input', function () {
      State.masalahHipotesis = ta.value;
      saveState();
    });
  }

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
   7. STAGE: PENGUMPULAN DATA — LAB NILAI TEMPAT  (DL sintaks 3)
   Situasi dibuka satu per satu: rakit angka layar dengan blok desimal
   (cara baca disembunyikan), periksa, lalu pilih cara bacanya (opsi
   dari engine, diacak). Setelah benar, perakit terkunci dan kedua cara
   bacanya tampil.
   ============================================================ */

function bacaBenar(sit) {
  return State.bacaPilih[sit.id] === 'baku';
}

function situasiSelesai(sit) {
  return State.rakitHasil[sit.id].done && bacaBenar(sit);
}

function koleksiSemuaSelesai() {
  return DATA.koleksi.situasi.every(situasiSelesai);
}

/*
 * Umpan balik rakitan yang salah: percobaan pertama hanya mengajak
 * membandingkan tempat demi tempat; berikutnya menyebut nilai tempat
 * pertama (dari kiri) yang belum cocok.
 */
function pesanRakit(sit, attempts) {
  var rakit = desimalDariBagian(State.rakitParts[sit.id]);
  var awal =
    'Rakitanmu <strong>' +
    esc(rakit) +
    '</strong>, sedangkan layar menunjukkan <strong>' +
    esc(sit.nilai) +
    '</strong>. ';
  if (attempts < 2) {
    return (
      awal +
      'Bandingkan angka pada setiap nilai tempat, mulai dari satuan, lalu persepuluhan, perseratusan, dan perseribuan.'
    );
  }
  var target = bagianDariDesimal(sit.nilai);
  var parts = State.rakitParts[sit.id];
  for (var i = 0; i < DESIMAL_TEMPAT.length; i++) {
    var t = DESIMAL_TEMPAT[i];
    if (parts[t.key] !== target[t.key]) {
      return (
        awal +
        'Periksa blok <strong>' +
        esc(t.nama) +
        '</strong>: angka ke-' +
        (i === 0 ? '0 (di depan koma)' : i + ' di belakang koma') +
        ' pada layar adalah <strong>' +
        target[t.key] +
        '</strong>.'
      );
    }
  }
  return awal;
}

function buildTabelData() {
  return (
    '<div class="table-scroll">' +
    '<table class="data-table">' +
    '<thead><tr><th scope="col">Alat ukur</th><th scope="col">Ditulis</th>' +
    '<th scope="col">Satuan (depan koma)</th><th scope="col">Per&shy;sepuluhan</th>' +
    '<th scope="col">Per&shy;seratusan</th><th scope="col">Per&shy;seribuan</th>' +
    '<th scope="col">Dibaca (koma)</th><th scope="col">Dibaca (nilai tempat)</th></tr></thead>' +
    '<tbody>' +
    DATA.koleksi.situasi
      .map(function (s) {
        var b = bagianDariDesimal(s.nilai);
        var n = banyakAngkaDesimal(s.nilai);
        function sel(pos, key) {
          return (
            '<td class="data-table__num' +
            (pos === n ? ' is-kanan' : '') +
            '">' +
            (pos <= n ? b[key] : '—') +
            '</td>'
          );
        }
        return (
          '<tr><td><span aria-hidden="true">' +
          s.ikon +
          '</span> ' +
          esc(s.alat) +
          '</td><td class="data-table__num"><strong>' +
          esc(s.nilai) +
          '</strong> <span class="dl-caption">' +
          esc(s.satuan) +
          '</span></td><td class="data-table__num">' +
          b.s +
          '</td>' +
          sel(1, 'd1') +
          sel(2, 'd2') +
          sel(3, 'd3') +
          '<td>"' +
          esc(bacaDesimalKoma(s.nilai)) +
          '"</td><td>"' +
          esc(bacaDesimalNilaiTempat(s.nilai)) +
          '"</td></tr>'
        );
      })
      .join('') +
    '</tbody></table>' +
    '</div>' +
    '<p class="dl-caption">Kolom "—" berarti tempat itu tidak dipakai. Angka yang bergaris bawah adalah angka paling kanan.</p>'
  );
}

function buildRakitCard(sit, i) {
  var hasil = State.rakitHasil[sit.id];
  var parts = State.rakitParts[sit.id];
  var bacaChosen = State.bacaPilih[sit.id] || null;
  var benarBaca = bacaBenar(sit);
  var g = opsiGuided(opsiCaraBacaDesimal(sit.nilai));
  var salah = !hasil.done && hasil.attempts > 0;

  return (
    '<div class="rakit-card' +
    (situasiSelesai(sit) ? ' is-done' : '') +
    '">' +
    '<div class="rakit-card__head">' +
    '<p class="dl-step__label"><span class="dl-step__num">' +
    (i + 1) +
    '</span><span aria-hidden="true">' +
    sit.ikon +
    '</span> ' +
    esc(sit.tempat) +
    ' — ' +
    esc(sit.teks) +
    '</p>' +
    buildLayar(sit.nilai, sit.satuan, sit.alat) +
    '</div>' +
    buildDecimalBuilder('rk' + i, parts, {
      showReading: benarBaca,
      locked: hasil.done,
    }) +
    (hasil.done
      ? buildFeedbackBox(
          'success',
          '✓',
          'Rakitanmu sama dengan layar: <strong>' + esc(sit.nilai) + '</strong>.'
        )
      : '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary" data-rakit-check="' +
        esc(sit.id) +
        '">Periksa Rakitan</button>' +
        '</div>' +
        (salah && hasil.pesan ? buildFeedbackBox('warning', '💭', hasil.pesan) : '')) +
    (hasil.done
      ? '<div class="quiz-item quiz-item--guided">' +
        '<p class="exercise-label">' +
        esc(DATA.koleksi.tanyaBaca) +
        ' ' +
        buildDecChip(sit.nilai) +
        '</p>' +
        buildChoiceGroup(g.opsi, State.bacaOrders[sit.id], {
          chosen: bacaChosen,
          correctId: benarBaca ? 'baku' : null,
          grade: true,
          locked: benarBaca,
          group: sit.id,
          attr: 'data-baca-opt',
        }) +
        buildGuidedChoiceFeedback(bacaChosen, benarBaca, g.umpan) +
        '</div>'
      : '') +
    (situasiSelesai(sit) ? buildFeedbackBox('success', sit.ikon, esc(sit.temuan)) : '') +
    '</div>'
  );
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var semua = koleksiSemuaSelesai();
  var amatiSelesai = guidedQuizAllCorrect(D.amati, State.amatiPilih);
  var rerender = function () {
    renderKoleksi(container);
  };

  var kartu = '';
  var tampil = 0;
  for (var i = 0; i < D.situasi.length; i++) {
    kartu += buildRakitCard(D.situasi[i], i);
    tampil = i + 1;
    if (!situasiSelesai(D.situasi[i])) break;
  }

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.instruksi) +
        '</p>' +
        '<p class="dl-caption" style="margin-bottom:var(--space-2);">' +
        esc(D.legendaJudul) +
        ':</p>' +
        buildDecimalBlockLegend(),
      'panel--info'
    ) +
    '<p class="dl-caption situasi-progress">Alat ukur ' +
    tampil +
    ' dari ' +
    D.situasi.length +
    '</p>' +
    '<div class="rakit-list">' +
    kartu +
    '</div>' +
    (semua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📋 Tabel Data Lab Nilai Tempat</h3>' +
            buildTabelData() +
            '<h3>🔍 Amati tabelmu</h3>' +
            buildGuidedQuizList(D.amati, State.amatiOrders, State.amatiPilih)
        )
      : '') +
    (semua && amatiSelesai ? buildDlNextButton('koleksiNextBtn', D.nextLabel) : '') +
    '</section>';

  D.situasi.forEach(function (sit, i) {
    if (State.rakitHasil[sit.id].done) return;
    if (!document.getElementById('rk' + i)) return;
    bindDecimalBuilder(container, 'rk' + i, State.rakitParts[sit.id], {}, function () {
      saveState();
    });
  });

  container.querySelectorAll('[data-rakit-check]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sit = D.situasi.filter(function (s) {
        return s.id === btn.dataset.rakitCheck;
      })[0];
      var hasil = State.rakitHasil[sit.id];
      var rakit = desimalDariBagian(State.rakitParts[sit.id]);
      hasil.attempts += 1;
      hasil.done = bandingkanDesimal(rakit, sit.nilai) === 0;
      hasil.pesan = hasil.done ? '' : pesanRakit(sit, hasil.attempts);
      saveState();
      rerender();
    });
  });

  container.querySelectorAll('[data-baca-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.group;
      if (State.bacaPilih[id] === 'baku') return;
      State.bacaPilih[id] = btn.dataset.bacaOpt;
      saveState();
      rerender();
    });
  });

  bindGuidedQuizList(container, D.amati, State.amatiPilih, saveState, rerender);
  bindNext('koleksiNextBtn', 'koleksi', 'olahBaca');
}

/* ============================================================
   8. STAGE: BACA & TULIS  (Discovery Learning — sintaks 4a)
   A: pasangkan notasi ↔ cara baca; B: dikte → notasi (diagnosa
   penulisan); C: notasi → ketik cara baca (cekCaraBacaDesimal).
   ============================================================ */

function notasiStep(it) {
  return {
    jenis: 'tulis',
    jawab: it.jawab,
    hints: it.hints,
    label: 'Pasanganmu membacakan: "<strong>' + esc(teksDikte(it.jawab, it.dikte)) + '</strong>"',
  };
}

function bacaanStep(it) {
  return {
    jenis: 'baca',
    jawab: it.jawab,
    hints: it.hints,
    label: 'Bagaimana membaca ' + buildDecChip(it.jawab) + '?',
  };
}

function renderOlahBaca(container) {
  var D = DATA.olahBaca;
  var pasangSelesai = guidedQuizAllCorrect(PASANG, State.pasangPilih);
  var notasiSelesai = semuaCekSelesai(State.notasiSteps);
  var bacaanSelesai = semuaCekSelesai(State.bacaanSteps);
  var rerender = function () {
    renderOlahBaca(container);
  };

  var notasiHTML = D.tulisNotasi
    .map(function (it, i) {
      return buildDesimalStep('tn' + i, State.notasiSteps[i], notasiStep(it), i + 1);
    })
    .join('');
  var bacaanHTML = D.tulisBacaan
    .map(function (it, i) {
      return buildDesimalStep('tb' + i, State.bacaanSteps[i], bacaanStep(it), i + 1);
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Pengolahan Data: Baca dan Tulis">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p class="dl-caption">' +
        esc(D.instruksiA) +
        '</p>' +
        buildGuidedQuizList(PASANG, State.pasangOrders, State.pasangPilih)
    ) +
    (pasangSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(D.instruksiB) +
            '</p>' +
            notasiHTML
        )
      : '') +
    (pasangSelesai && notasiSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulC) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(D.instruksiC) +
            '</p>' +
            bacaanHTML
        )
      : '') +
    (pasangSelesai && notasiSelesai && bacaanSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">💡 Temuanmu</h3>' + buildTemuanList(D.temuan),
          'panel--hero'
        ) + buildDlNextButton('bacaNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindGuidedQuizList(container, PASANG, State.pasangPilih, saveState, rerender);
  D.tulisNotasi.forEach(function (it, i) {
    bindDesimalStep('tn' + i, State.notasiSteps[i], notasiStep(it), saveState, rerender);
  });
  D.tulisBacaan.forEach(function (it, i) {
    bindDesimalStep('tb' + i, State.bacaanSteps[i], bacaanStep(it), saveState, rerender);
  });
  bindNext('bacaNextBtn', 'olahBaca', 'olahBanding');
}

/* ============================================================
   9. STAGE: MEMBANDINGKAN  (Discovery Learning — sintaks 4b)
   A: pasangan dibuka satu per satu — tabel nilai tempat, lambang
      berdiagnosa, lalu makna dalam cerita.
   B: tempatkan hasil lompat jauh pada garis bilangan desimal, lalu
      pertanyaan penuntun tentang letak.
   C: urutkan catatan waktu lari (urut-ketuk).
   ============================================================ */

function pasanganById(id) {
  return DATA.olahBanding.pasangan.filter(function (p) {
    return p.id === id;
  })[0];
}

function simbolBenar(p) {
  return State.simbolStates[p.id].chosen === simbolBandingDesimal(p.a, p.b);
}

function maknaBenar(p) {
  return State.maknaPilih[p.id] === idMaknaBandingDesimal(p.a, p.b);
}

function pasanganSelesai(p) {
  return simbolBenar(p) && maknaBenar(p);
}

function buildPasanganCard(p, i) {
  var st = State.simbolStates[p.id];
  var okSimbol = simbolBenar(p);
  var chosenMakna = State.maknaPilih[p.id] || null;
  var okMakna = maknaBenar(p);
  var K = kataBandingDesimal(p.tema);
  var maknaHTML = '';
  if (okSimbol) {
    var kalimatKosong = esc(p.kalimat).replace('___', '<span class="blank-slot">…</span>');
    var kalimatIsi = esc(p.kalimat).replace(
      '___',
      '<strong>' + esc(maknaBandingDesimal(p.a, p.b, p.tema)) + '</strong>'
    );
    maknaHTML =
      '<div class="quiz-item quiz-item--guided">' +
      '<p class="exercise-label">Jadi, dalam cerita: ' +
      kalimatKosong +
      '</p>' +
      buildChoiceGroup(opsiMaknaBandingDesimal(p.tema), State.maknaOrders[p.id], {
        chosen: chosenMakna,
        correctId: okMakna ? idMaknaBandingDesimal(p.a, p.b) : null,
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
                  esc(p.a + ' ' + compareSymbolText(simbolBandingDesimal(p.a, p.b)) + ' ' + p.b) +
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
    esc(p.konteks) +
    ': ' +
    esc(p.namaA) +
    ' <strong>' +
    esc(p.a) +
    ' ' +
    esc(p.satuan) +
    '</strong>, ' +
    esc(p.namaB) +
    ' <strong>' +
    esc(p.b) +
    ' ' +
    esc(p.satuan) +
    '</strong></p>' +
    buildPlaceValueCompare(p.a, p.b, { highlight: okSimbol, padZeros: okSimbol }) +
    buildCompareSentenceDesimal(p.a, p.b, okSimbol ? st.chosen : null) +
    '<p class="dl-caption">Pilih lambang yang tepat:</p>' +
    buildPilihSimbolDesimal(p.a, p.b, State.simbolOrders[p.id], st, { group: p.id }) +
    maknaHTML +
    '</div>'
  );
}

function letakItems() {
  return orderByIds(LETAK_ITEMS, State.letakOrder);
}

function renderOlahBanding(container) {
  var D = DATA.olahBanding;
  var rerender = function () {
    renderOlahBanding(container);
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
  var items = letakItems();
  var letakDone = numberLinePlacementDone(items, State.letakState);
  var tanyaLetakOk = guidedQuizAllCorrect([D.tanyaLetak], State.letakTanyaPilih);
  var bSelesai = letakDone && tanyaLetakOk;
  var cSelesai = State.urutState.correct;
  var nilaiUrut = D.urut.map(function (u) {
    return u.nilai;
  });

  container.innerHTML =
    '<section aria-label="Pengolahan Data: Membandingkan">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p class="dl-caption">' +
        esc(D.instruksiA) +
        '</p>' +
        '<div class="banding-list">' +
        kartu +
        '</div>'
    ) +
    (aSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(D.instruksiB) +
            '</p>' +
            buildDecimalPlacement('nlLetak', items, State.letakState, {
              min: D.letak.min,
              max: D.letak.max,
              digits: D.letak.digits,
              labelEvery: D.letak.labelEvery,
              doneText:
                '<strong>Semua hasil lompatan sudah di tempatnya.</strong> Perhatikan urutan titiknya dari kiri ke kanan.',
            }) +
            (letakDone
              ? buildGuidedQuizList([D.tanyaLetak], State.letakTanyaOrders, State.letakTanyaPilih)
              : '')
        )
      : '') +
    (aSelesai && bSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulC) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(D.instruksiC) +
            '</p>' +
            buildPlaceValueStack(nilaiUrut, {
              highlight: cSelesai,
              caption: 'Catatan waktu finalis (detik)',
            }) +
            buildTapOrder('urutLari', URUT_ITEMS, State.urutState, {
              answer: URUT_JAWAB,
              startLabel: 'Juara 1 (tercepat)',
              endLabel: 'Juara 4',
              separator: '<',
              successText:
                '<strong>Urutannya tepat!</strong> ' +
                esc(urutkanDesimal(nilaiUrut).join(' < ')) +
                '. Waktu paling singkat = paling cepat.',
            })
        )
      : '') +
    (aSelesai && bSelesai && cSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">💡 Temuanmu</h3>' + buildTemuanList(D.temuan),
          'panel--hero'
        ) + buildDlNextButton('bandingNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindPilihSimbolDesimal(
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

  if (aSelesai) {
    bindDecimalPlacement(container, 'nlLetak', items, State.letakState, saveState, rerender);
    bindGuidedQuizList(container, [D.tanyaLetak], State.letakTanyaPilih, saveState, rerender);
  }
  if (aSelesai && bSelesai) {
    bindTapOrder(container, 'urutLari', State.urutState, URUT_JAWAB, saveState, rerender);
  }
  bindNext('bandingNextBtn', 'olahBanding', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   ============================================================ */

function buildDugaanBanding() {
  var S = DATA.stimulasi;
  return (
    '<div class="dugaan-compare">' +
    S.dugaan
      .map(function (q) {
        var pilih = State.dugaanPilih[q.id];
        var cocok = pilih === q.baku;
        return (
          '<div class="dugaan-row' +
          (cocok ? ' dugaan-row--ok' : '') +
          '">' +
          '<span class="dugaan-row__title">' +
          q.tanya +
          '</span>' +
          '<span>Dugaanmu: <strong>' +
          (findOptionLabel(q.opsi, pilih) || '—') +
          '</strong></span>' +
          '<span>Temuanmu: <strong>' +
          findOptionLabel(q.opsi, q.baku) +
          '</strong> — ' +
          esc(q.pembahasan) +
          '</span>' +
          '<span class="dugaan-row__verdict">' +
          (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh temuanmu') +
          '</span>' +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    (State.masalahHipotesis
      ? '<div class="hipotesis-box">' +
        '<span class="hipotesis-box__label">Hipotesismu di tahap 2</span>' +
        '<p>' +
        esc(State.masalahHipotesis) +
        '</p>' +
        '<span class="dl-caption">Apakah hipotesismu sesuai dengan temuanmu? Diskusikan dengan pasanganmu.</span>' +
        '</div>'
      : '')
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var selesai = sortItemsAllAnswered(D.pernyataan, State.verifStates);
  var rerender = function () {
    renderVerifikasi(container);
  };

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        buildSortItems(D.pernyataan, State.verifOrder, D.opsiPernyataan, State.verifStates)
    ) +
    (selesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' + esc(D.judulB) + '</h3>' + buildDugaanBanding()
        ) + buildDlNextButton('verifNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, D.pernyataan, State.verifStates, saveState, rerender);
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali temuanmu, lalu pilih potongan lain.</p>'
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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah konsep yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman: Bilangan Desimal di Sekitar Kita</h3>' +
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
   createExerciseStage (shared/engine.js) dengan soal TERAP_SOAL yang
   dipilih acak. Isian 'tulis' diperiksa diagnosaTulisDesimal, isian
   'baca' diperiksa cekCaraBacaDesimal; pesan salahnya berupa diagnosa.
   ============================================================ */

function periksaIsianTerap(value, s) {
  return s.mode === 'baca'
    ? cekCaraBacaDesimal(value, s.jawab)
    : diagnosaTulisDesimal(value, s.jawab);
}

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
  inputAriaLabel: 'Jawabanmu',
  inputPlaceholder: 'mis. 3,07 atau tiga koma nol tujuh',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  /* Teks mentah diteruskan; pemeriksaan & diagnosa ada di isCorrect. */
  parseInput: function (val) {
    if (!val || !String(val).trim()) return { value: null, error: 'empty' };
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return periksaIsianTerap(value, s).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' + esc(ex.userInput) + '</strong> — ' + periksaIsianTerap(ex.userInput, s).pesan
    );
  },
  revealText: function (s) {
    return s.reveal + ' ' + s.explanation;
  },
  renderPrompt: function (s) {
    var tag =
      s.type === 'choice'
        ? 'Pilihan ganda'
        : s.mode === 'baca'
        ? '🗣️ Ketik cara bacanya'
        : '✏️ Tulis bilangannya';
    return (
      '<div class="dl-prompt">' +
      '<span class="bbk-soal-tag">' +
      tag +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
      (s.tampil ? '<p class="terap-tampil">' + buildDecChip(s.tampil, true) + '</p>' : '') +
      '<p class="dl-prompt__tanya">' +
      s.pertanyaan +
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
  var rakitSekali = DATA.koleksi.situasi.filter(function (s) {
    var h = State.rakitHasil[s.id];
    return h.done && h.attempts === 1;
  }).length;
  var semuaCek = State.notasiSteps.concat(State.bacaanSteps);
  var sekali = semuaCek.filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  var simbolSekali = DATA.olahBanding.pasangan.filter(function (p) {
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
        kartu(rakitSekali + '/' + DATA.koleksi.situasi.length, 'Rakitan tepat sekali coba') +
        kartu(sekali + '/' + semuaCek.length, 'Isian baca-tulis tepat pada percobaan pertama') +
        kartu(
          simbolSekali + '/' + DATA.olahBanding.pasangan.length,
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
    '<div class="contoh-grid">' +
    D.contoh
      .map(function (c) {
        return (
          '<div class="formula-card"><span class="formula-card__label"><span aria-hidden="true">' +
          c.ikon +
          '</span> ' +
          esc(c.nama) +
          '</span><span class="contoh-grid__num">' +
          buildDecChip(c.nilai, true) +
          '</span><span>"' +
          esc(bacaDesimalKoma(c.nilai) + ' ' + c.satuan) +
          '"</span></div>'
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
    'Kemampuan murid membaca angka pada alat ukur nyata (timbangan, termometer, meteran) dengan lantang dan menjelaskan perbandingannya tetap menjadi bahan penilaian utama.' +
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
  olahBaca: renderOlahBaca,
  olahBanding: renderOlahBanding,
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
