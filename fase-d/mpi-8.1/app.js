'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Hubungan Antar Sudut — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen bersama: buildDiscoveryHead, buildTeacherNote,
       buildTpPanel, buildChoiceGroup, buildSortItems,
       buildGuidedQuizList, buildDlPanel, buildDlNextButton,
       buildFeedbackBox, buildLangkahUnsur (langkah isian berdiagnosa);
     • seksi 77 (hubungan antar sudut): besarSudutLab, sudutDuaGaris,
       jenisPasanganSudut, jenisPasanganNilai, namaSudutLab,
       periksaSoalSudut, jawabSoalSudut, opsiSoalSudut, pilihSudutAcak,
       buildDuaGarisSVG (gambar dua garis + busur), serta alat
       interaktif buildLabSudut (Lab Sudut) & buildTabelLabSudut.

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan stimulasi, rumusan
   masalah, pertanyaan temuan, pemilahan pasangan sudut, pernyataan
   verifikasi, bank kesimpulan, opsi uji terap, penilaian diri) DIACAK
   dengan shuffleArray() melalui ensureShuffledOrder() /
   ensureSortStates(). Pengacakan dilakukan SEKALI saat state disiapkan
   (initExerciseArrays) lalu urutannya disimpan di State — bukan saat
   render — sehingga pilihan tidak melompat saat dirender ulang, tetapi
   teracak ulang untuk setiap murid dan setiap Reset. Posisi garis pada
   verifikasi (pilihSudutAcak) dan soal uji terap (pilihSoalTerap) juga
   dipilih acak; opsi pilihan gandanya dibangun engine (opsiSoalSudut).

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi               (DL sintaks 1)
    6. Stage: Merumuskan Masalah      (DL sintaks 2)
    7. Stage: Lab Sudut               (DL sintaks 3)
    8. Stage: Olah Data ×3            (DL sintaks 4)
    9. Stage: Verifikasi              (DL sintaks 5)
   10. Stage: Generalisasi            (DL sintaks 6)
   11. Stage: Uji Terap
   12. Stage: Refleksi
   13. Stage: Selesai
   14. Router Render
   15. Helper UI (modal reset)
   16. Init
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
var STORAGE_KEY = 'mpi-d-8-1-hubungan-sudut-v1';
var OLAH_STAGES = ['olahPelurus', 'olahTolak', 'olahPenyiku'];
var LAB = DATA.koleksi.lab;

function opsiAman(list) {
  return list.map(function (o) {
    return { id: o.id, label: esc(o.label) };
  });
}

/* Pertanyaan berpilihan dari DATA dengan tanya, label opsi, dan umpan aman. */
function siapkanGuided(q) {
  var umpan = {};
  Object.keys(q.umpan || {}).forEach(function (k) {
    umpan[k] = esc(q.umpan[k]);
  });
  return {
    id: q.id,
    tanya: esc(q.tanya),
    opsi: opsiAman(q.opsi),
    correct: q.correct,
    umpan: umpan,
    baku: q.baku,
    pembahasan: q.pembahasan,
  };
}

/* Label konteks: ikon + nama (Gunting, Jalan & Rambu, …). */
function buildKonteksTag(konteks) {
  var K = DATA.konteks[konteks];
  return (
    '<span class="sdt-konteks sdt-konteks--' +
    konteks +
    '"><span aria-hidden="true">' +
    K.ikon +
    '</span> ' +
    esc(K.nama) +
    '</span>'
  );
}

/* Teks pasangan sudut: '∠1 dan ∠2', '∠BOC dan ∠AOD', atau '35° dan 55°'. */
function teksPasangan(b, tigaHuruf) {
  if (b.sudut) return formatSudut(b.sudut[0]) + ' dan ' + formatSudut(b.sudut[1]);
  return b.pasangan
    .map(function (k) {
      return tigaHuruf ? namaSudutLab('potong', k) : '∠' + (k + 1);
    })
    .join(' dan ');
}

/* Kunci pemilahan setiap tahap olah data, dihitung engine. */
var KUNCI_PILAH = {
  olahPelurus: function (b) {
    return jenisPasanganSudut('potong', b.pasangan[0], b.pasangan[1]) === 'berpelurus'
      ? 'berpelurus'
      : 'bukanPelurus';
  },
  olahTolak: function (b) {
    return jenisPasanganSudut('potong', b.pasangan[0], b.pasangan[1]);
  },
  olahPenyiku: function (b) {
    return jenisPasanganNilai(b.sudut[0], b.sudut[1]);
  },
};

var DUGAAN = DATA.stimulasi.dugaan.map(siapkanGuided);
var MASALAH_OPSI = opsiAman(DATA.masalah.opsi);

/* Konfigurasi tiap tahap olah data: temuan, pemilahan & langkah isian. */
var OLAH = {};
OLAH_STAGES.forEach(function (id, i) {
  var D = DATA[id];
  OLAH[id] = {
    prefix: ['op', 'ot', 'os'][i],
    temuan: D.temuan.map(siapkanGuided),
    pilah: D.pilah.butir.map(function (b) {
      return {
        id: b.id,
        teks: '<strong>' + esc(teksPasangan(b, id === 'olahTolak')) + '</strong>',
        correct: KUNCI_PILAH[id](b),
        explanation: esc(b.explanation),
      };
    }),
    kategori: opsiAman(D.pilah.kategori),
    next: STAGES[STAGES.indexOf(id) + 1],
  };
});

var SEMUA_TEMUAN = OLAH_STAGES.reduce(function (acc, id) {
  return acc.concat(OLAH[id].temuan);
}, []);

var PERNYATAAN_ITEMS = DATA.verifikasi.pernyataan.map(function (p) {
  return { id: p.id, teks: esc(p.teks), correct: p.correct, explanation: esc(p.explanation) };
});

/* Soal pilihan ganda uji terap: opsi dibangun engine (opsiSoalSudut). */
var OPSI_TERAP = {};
DATA.terapkan.soal.forEach(function (s) {
  if (s.type !== 'choice') return;
  var opsi = opsiSoalSudut(s);
  OPSI_TERAP[s.id] = opsi;
  s.options = opsiAman(opsi);
  s.correct = 'baku';
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

  /* Tahap 2 — merumuskan masalah */
  masalahOrder: null,
  masalahPilihan: null,
  hipotesisTeks: '',

  /* Tahap 3 — Lab Sudut */
  labSudut: null,

  /* Tahap 4a–c — olah data */
  temuanOrders: {},
  temuanPilih: {},
  pilahOlah: {},
  langkahSteps: {},

  /* Tahap 5 — verifikasi */
  verifT: null,
  verifK: null,
  verifSteps: [],
  verifBukti: false,
  pernyataanStates: {},
  pernyataanOrder: null,

  /* Tahap 6 — generalisasi */
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

/* Memastikan State[key] berupa objek biasa (peta id → nilai / state lab). */
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

/*
 * Soal uji terap yang sedang dipakai. Array ini DIISI ULANG di tempat
 * (bukan diganti) karena createExerciseStage menyimpan referensinya.
 */
var TERAP_SOAL = [];

/* Memilih soal acak dari bank sesuai komposisi, lalu mengacak urutannya. */
function pilihSoalTerap() {
  var T = DATA.terapkan;
  var pilih = [];
  Object.keys(T.komposisi).forEach(function (k) {
    var kelompok = T.soal.filter(function (s) {
      return s.type === k;
    });
    shuffleArray(kelompok)
      .slice(0, T.komposisi[k])
      .forEach(function (s) {
        pilih.push(s.id);
      });
  });
  return shuffleArray(pilih);
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

/* Posisi baru acak untuk verifikasi: ∠1 = verifT, sudut diketahui ∠(verifK + 1). */
function verifValid() {
  var P = DATA.verifikasi.prediksi;
  return (
    typeof State.verifT === 'number' &&
    State.verifT >= P.min &&
    State.verifT <= P.max &&
    P.kecuali.indexOf(State.verifT) === -1 &&
    [0, 1, 2, 3].indexOf(State.verifK) !== -1
  );
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

  /* Tahap 3 */
  ensureLabSudut(ensureMap('labSudut'), LAB);

  /* Tahap 4a–c — urutan butir & kategori pemilahan per tahap */
  var pilah = ensureMap('pilahOlah');
  var langkah = ensureMap('langkahSteps');
  OLAH_STAGES.forEach(function (id) {
    ensureSortStates(pilah, id, id + 'Order', OLAH[id].pilah, OLAH[id].kategori);
    ensureExerciseArray(langkah, id, DATA[id].langkah, makeCekStep);
  });
  ensureListOrders('temuanOrders', SEMUA_TEMUAN);
  ensureMap('temuanPilih');

  /* Tahap 5 — posisi garis & sudut yang diketahui dipilih acak */
  if (!verifValid()) {
    var P = DATA.verifikasi.prediksi;
    State.verifT = pilihSudutAcak(P.min, P.max, P.langkah, P.kecuali);
    State.verifK = Math.floor(Math.random() * 4);
    State.verifSteps = [];
    State.verifBukti = false;
  }
  ensureExerciseArray(State, 'verifSteps', [0, 1, 2], makeCekStep);
  ensureSortStates(
    State,
    'pernyataanStates',
    'pernyataanOrder',
    PERNYATAAN_ITEMS,
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

function buildPengantar(teks) {
  return buildDlPanel('<p style="margin:0;">' + esc(teks) + '</p>', 'panel--info');
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

/* Indeks langkah pertama yang belum selesai (= panjang daftar bila semua selesai). */
function langkahAktif(steps) {
  for (var i = 0; i < steps.length; i++) if (!steps[i].done) return i;
  return steps.length;
}

function buildRingkasKartu(val, label) {
  return (
    '<div class="summary-card"><div class="summary-card__val">' +
    val +
    '</div><div class="summary-card__label">' +
    label +
    '</div></div>'
  );
}

function semuaDipilih(list, pilih) {
  return list.every(function (q) {
    return !!pilih[q.id];
  });
}

function buildDaftarBernomor(list, raw) {
  return (
    '<ol class="objectives-list">' +
    list
      .map(function (r, i) {
        return (
          '<li><span class="objectives-list__num">' +
          (i + 1) +
          '</span><span>' +
          (raw ? r : esc(r)) +
          '</span></li>'
        );
      })
      .join('') +
    '</ol>'
  );
}

/* Gambar dua garis dengan keterangan di bawahnya. */
function buildFigurSudut(G, caption) {
  return (
    '<figure class="sdt-figur">' +
    buildDuaGarisSVG(G) +
    (caption ? '<figcaption>' + caption + '</figcaption>' : '') +
    '</figure>'
  );
}

/* Isian sudut yang sudah benar ditulis ulang dengan lambang derajat. */
function tampilIsianSudut(input) {
  var p = parseSudutIsian(input);
  return p.kode === 'ok' ? formatDesimal(p.nilai, 2) + '°' : String(input || '');
}

/* Memfokuskan ulang elemen setelah render (mis. kotak isian Lab Sudut). */
function fokusUlang(container, selektor) {
  if (!selektor) return;
  var el = container.querySelector(selektor);
  if (el) el.focus();
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati gunting, perempatan & bingkai lalu MENDUGA.
   Tidak dinilai.
   ============================================================ */

function buildKartuStimulasi(k) {
  return (
    '<article class="sdt-kartu">' +
    '<h3 class="sdt-kartu__judul"><span aria-hidden="true">' +
    k.ikon +
    '</span> ' +
    esc(k.judul) +
    '</h3>' +
    '<p class="sdt-kartu__teks">' +
    esc(k.teks) +
    '</p>' +
    buildFigurSudut(k.gambar) +
    '</article>'
  );
}

function buildDugaanList(list, orders, pilih) {
  return list
    .map(function (q, i) {
      return (
        '<div class="quiz-item">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        q.tanya +
        '</p>' +
        buildChoiceGroup(q.opsi, orders[q.id], {
          chosen: pilih[q.id] || null,
          group: q.id,
          attr: 'data-dugaan',
        }) +
        '</div>'
      );
    })
    .join('');
}

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var lengkap = semuaDipilih(DUGAAN, State.dugaanPilih);

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">✂️ ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="sdt-kartu-grid">' +
        D.kartu.map(buildKartuStimulasi).join('') +
        '</div>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaanmu?</h3>' +
        buildDugaanList(DUGAAN, State.dugaanOrders, State.dugaanPilih) +
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
    (lengkap ? '' : ' aria-disabled="true"') +
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
    if (!semuaDipilih(DUGAAN, State.dugaanPilih)) {
      showNotice('Pilih dugaanmu untuk setiap pertanyaan sebelum melanjutkan.');
      return;
    }
    completeStage('stimulasi');
    navigateTo('masalah');
  });
}

/* ============================================================
   6. STAGE: MERUMUSKAN MASALAH  (Discovery Learning — sintaks 2)
   Memilih pertanyaan inti, lalu menulis hipotesis.
   ============================================================ */

function renderMasalah(container) {
  var D = DATA.masalah;
  var benar = State.masalahPilihan === D.correct;
  var umpan = {};
  Object.keys(D.umpan).forEach(function (k) {
    umpan[k] = esc(D.umpan[k]);
  });

  container.innerHTML =
    '<section aria-label="Merumuskan Masalah">' +
    buildHead(D) +
    buildPengantar(D.pengantar) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(MASALAH_OPSI, State.masalahOrder, {
          chosen: State.masalahPilihan,
          correctId: benar ? D.correct : null,
          grade: true,
          locked: benar,
        }) +
        buildGuidedChoiceFeedback(State.masalahPilihan, benar, umpan)
    ) +
    (benar
      ? buildDlPanel(
          '<div class="field-group" style="margin:0;">' +
            '<label for="hipotesisTeks">' +
            esc(D.hipotesisLabel) +
            '</label>' +
            '<textarea id="hipotesisTeks" class="input-textarea" placeholder="' +
            esc(D.hipotesisPlaceholder) +
            '">' +
            esc(State.hipotesisTeks) +
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

  var ta = document.getElementById('hipotesisTeks');
  if (ta) {
    ta.addEventListener('input', function () {
      State.hipotesisTeks = ta.value;
      saveState();
    });
  }

  var next = document.getElementById('masalahNextBtn');
  if (next) {
    next.addEventListener('click', function () {
      if (!State.hipotesisTeks.trim()) {
        showNotice('Tulis dugaan sementaramu (hipotesis) lebih dulu.');
        return;
      }
      completeStage('masalah');
      navigateTo('koleksi');
    });
  }
}

/* ============================================================
   7. STAGE: LAB SUDUT  (Discovery Learning — sintaks 3)
   A. Dua garis berpotongan: putar garis CD, pasang busur pada ∠1–∠4,
      baca besarnya, catat minimal tiga posisi.
   B. Dua garis tegak lurus + sinar OE: baca ∠1 & ∠2, catat minimal
      dua posisi.
   ============================================================ */

function renderKoleksi(container, fokus) {
  var D = DATA.koleksi;
  var lab = State.labSudut;
  var lengkap = labSudutLengkap(lab, LAB);

  container.innerHTML =
    '<section aria-label="Lab Sudut">' +
    buildHead(D) +
    buildPengantar(D.pengantar) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🔬 Lab Sudut</h3>' +
        '<details class="sdt-tips"><summary>💡 Tips memakai busur</summary>' +
        '<ul>' +
        D.tips
          .map(function (t) {
            return '<li>' + esc(t) + '</li>';
          })
          .join('') +
        '</ul></details>' +
        buildLabSudut('ls', lab, LAB)
    ) +
    (lengkap
      ? buildDlPanel(buildFeedbackBox('success', '✓', esc(D.selesaiTeks))) +
        buildDlNextButton('koleksiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindLabSudut(container, 'ls', lab, LAB, function (f) {
    saveState();
    renderKoleksi(container, f);
  });
  bindNext('koleksiNextBtn', 'koleksi', 'olahPelurus');
  fokusUlang(container, fokus);
}

/* ============================================================
   8. STAGE: OLAH DATA  (Discovery Learning — sintaks 4a–4c)
   Tabel Lab Sudut + gambar bersorot → pertanyaan temuan → pemilahan →
   langkah isian berdiagnosa (sebagian memakai data murid sendiri) →
   ringkasan temuan. Ketiga tahap memakai satu renderer.
   ============================================================ */

/*
 * Langkah DATA dengan `lab` diisi dari baris tabel murid: label
 * {p} {a} {b} {va} {vb} dan cek.sudut. Langkah tanpa `lab` dipakai
 * apa adanya.
 */
function siapkanLangkah(s) {
  var label = s.label;
  var cek = s.cek;
  if (s.lab) {
    var row = State.labSudut.baris[s.lab.mode][s.lab.baris];
    var k = s.lab.pasangan;
    var va = row.sudut[k[0]];
    var vb = k.length > 1 ? row.sudut[k[1]] : null;
    var isi = {
      p: String(s.lab.baris + 1),
      a: String(k[0] + 1),
      b: k.length > 1 ? String(k[1] + 1) : '',
      va: formatSudut(va),
      vb: vb === null ? '' : formatSudut(vb),
    };
    label = label.replace(/\{(\w+)\}/g, function (m, key) {
      return key in isi ? isi[key] : m;
    });
    cek = Object.assign({}, s.cek, { sudut: s.cek.minta === 'jumlah' ? [va, vb] : va });
  }
  return {
    id: s.id,
    label: esc(label),
    cek: cek,
    placeholder: s.placeholder,
    hints: (s.hints || []).map(esc),
    temuan: esc(s.temuan),
  };
}

function buildDataOlah(stageId) {
  var D = DATA[stageId];
  var lab = State.labSudut;
  var row = lab.baris[D.data][0];
  var label = row.sudut.map(formatSudut);
  return (
    '<div class="sdt-olah">' +
    buildFigurSudut(
      { mode: D.data, t: row.t, label: label, sorot: D.sorot },
      'Posisi 1 dari tabelmu. Sudut yang disorot: ' +
        D.sorot
          .map(function (k) {
            return '∠' + (k + 1);
          })
          .join(' dan ') +
        '.'
    ) +
    '<div class="lab-neraca__tabel-wrap">' +
    buildTabelLabSudut(lab, LAB, D.data) +
    '</div>' +
    '</div>'
  );
}

function buildLabBelumLengkap() {
  return (
    buildDlPanel(
      buildFeedbackBox(
        'warning',
        '⚠️',
        'Tabel Lab Sudut belum lengkap. Kumpulkan datanya dulu di tahap Lab Sudut.'
      )
    ) + buildDlNextButton('keLabBtn', '← Kembali ke Lab Sudut')
  );
}

function renderOlah(stageId, container) {
  var D = DATA[stageId];
  var C = OLAH[stageId];

  if (!labSudutLengkap(State.labSudut, LAB)) {
    container.innerHTML =
      '<section aria-label="' +
      esc(D.kicker) +
      '">' +
      buildHead(D) +
      buildLabBelumLengkap() +
      '</section>';
    document.getElementById('keLabBtn').addEventListener('click', function () {
      navigateTo('koleksi');
    });
    return;
  }

  var pilahSt = State.pilahOlah[stageId];
  var steps = State.langkahSteps[stageId];
  var langkah = D.langkah.map(siapkanLangkah);
  var temuanOk = guidedQuizAllCorrect(C.temuan, State.temuanPilih);
  var pilahOk = temuanOk && sortItemsAllAnswered(C.pilah, pilahSt);
  var aktif = langkahAktif(steps);
  var langkahOk = pilahOk && aktif >= langkah.length;
  var rerender = function () {
    renderOlah(stageId, container);
  };

  var langkahHTML = langkah
    .slice(0, Math.min(aktif + 1, langkah.length))
    .map(function (step, i) {
      return buildLangkahUnsur(C.prefix + i, steps[i], step, i + 1, tampilIsianSudut);
    })
    .join('');

  var gambarPilah = D.pilah.gambar
    ? buildFigurSudut(
        { mode: D.pilah.gambar.mode, t: D.pilah.gambar.t, label: [null, null, null, null] },
        'Garis AB dan CD berpotongan di O.'
      )
    : '';

  container.innerHTML =
    '<section aria-label="' +
    esc(D.kicker) +
    '">' +
    buildHead(D) +
    buildPengantar(D.pengantar) +
    buildDlPanel(
      '<h3 style="margin-top:0;">📋 ' +
        esc(D.judul) +
        '</h3>' +
        buildDataOlah(stageId) +
        '<h3>💡 Apa temuanmu?</h3>' +
        buildGuidedQuizList(C.temuan, State.temuanOrders, State.temuanPilih)
    ) +
    (temuanOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🗂️ ' +
            esc(D.pilah.judul) +
            '</h3>' +
            '<p>' +
            esc(D.pilah.pengantar) +
            '</p>' +
            gambarPilah +
            buildSortItems(C.pilah, State.pilahOlah[stageId + 'Order'], C.kategori, pilahSt)
        )
      : '') +
    (pilahOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">✏️ Coba sendiri</h3>' +
            '<div class="dl-steps">' +
            langkahHTML +
            '</div>'
        )
      : '') +
    (langkahOk
      ? buildDlPanel(
          buildFeedbackBox('success', '📝', '<strong>Temuanmu:</strong> ' + esc(D.ringkasan))
        ) + buildDlNextButton(C.prefix + 'NextBtn', D.nextLabel)
      : '') +
    '</section>';

  if (!temuanOk) {
    bindGuidedQuizList(container, C.temuan, State.temuanPilih, saveState, rerender);
  }
  if (temuanOk) bindSortItems(container, C.pilah, pilahSt, saveState, rerender);
  if (pilahOk && !langkahOk) {
    bindLangkahUnsur(
      C.prefix + aktif,
      steps[aktif],
      langkah[aktif],
      saveState,
      rerender,
      periksaSoalSudut
    );
  }
  bindNext(C.prefix + 'NextBtn', stageId, C.next);
}

function renderOlahPelurus(container) {
  renderOlah('olahPelurus', container);
}

function renderOlahTolak(container) {
  renderOlah('olahTolak', container);
}

function renderOlahPenyiku(container) {
  renderOlah('olahPenyiku', container);
}

/* ============================================================
   9. STAGE: VERIFIKASI  (Discovery Learning — sintaks 5)
   A. Posisi baru acak: prediksi tiga sudut dari satu sudut, lalu
      buktikan dengan busur
   B. Pernyataan selalu benar / kadang-kadang benar / salah
   C. Dugaan awal & hipotesis dibandingkan dengan temuan
   ============================================================ */

/* Tiga sudut yang ditanyakan (selain sudut yang diketahui). */
function ditanyaVerif() {
  return [0, 1, 2, 3].filter(function (k) {
    return k !== State.verifK;
  });
}

function langkahVerif() {
  var K = State.verifK;
  var nilai = sudutDuaGaris(State.verifT)[K];
  return ditanyaVerif().map(function (d) {
    var tolak = jenisPasanganSudut('potong', K, d) === 'bertolakBelakang';
    var pasangan = '∠' + (K + 1) + ' dan ∠' + (d + 1);
    return {
      id: 'v' + d,
      label: esc('Berapa besar ∠' + (d + 1) + '?'),
      cek: { minta: 'cari', diketahui: { k: K, nilai: nilai }, ditanya: d },
      placeholder: 'mis. 45',
      hints: [
        esc(
          tolak
            ? pasangan + ' saling berhadapan (bertolak belakang).'
            : pasangan + ' bersebelahan pada satu garis lurus (berpelurus).'
        ),
        esc(tolak ? 'Sudut bertolak belakang sama besar.' : 'Sudut berpelurus berjumlah 180°.'),
      ],
      temuan: esc(
        tolak
          ? pasangan + ' bertolak belakang, jadi sama besar.'
          : pasangan + ' berpelurus: 180° − ' + nilai + '° = ' + (180 - nilai) + '°.'
      ),
    };
  });
}

function buildPrediksi(langkah, aktif) {
  var D = DATA.verifikasi;
  var besar = sudutDuaGaris(State.verifT);
  var label = besar.map(function (v, k) {
    if (k === State.verifK || State.verifBukti) return formatSudut(v);
    var i = ditanyaVerif().indexOf(k);
    return State.verifSteps[i].done ? formatSudut(v) : '?';
  });
  var semua = aktif >= langkah.length;
  return (
    '<div class="sdt-verif">' +
    buildFigurSudut(
      {
        mode: 'potong',
        t: State.verifT,
        label: label,
        sorot: State.verifBukti ? [] : [State.verifK],
      },
      State.verifBukti
        ? '📐 Hasil pengukuran busur.'
        : 'Diketahui ∠' + (State.verifK + 1) + ' = ' + besar[State.verifK] + '°.'
    ) +
    '<div class="dl-steps">' +
    langkah
      .slice(0, Math.min(aktif + 1, langkah.length))
      .map(function (step, i) {
        return buildLangkahUnsur('vf' + i, State.verifSteps[i], step, i + 1, tampilIsianSudut);
      })
      .join('') +
    '</div>' +
    '</div>' +
    (semua && !State.verifBukti
      ? '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="verifBuktiBtn">' +
        esc(D.buktiLabel) +
        '</button></div>'
      : '') +
    (State.verifBukti ? buildFeedbackBox('success', '✓', esc(D.buktiTeks)) : '')
  );
}

function buildDugaanRow(q, pilih) {
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
    '<span>Temuan: <strong>' +
    findOptionLabel(q.opsi, q.baku) +
    '</strong> — ' +
    esc(q.pembahasan) +
    '</span>' +
    '<span class="dugaan-row__verdict">' +
    (cocok ? '✓ Dugaanmu didukung temuan!' : '↻ Dugaanmu dikoreksi oleh temuan') +
    '</span>' +
    '</div>'
  );
}

function buildDugaanBanding() {
  return (
    '<div class="dugaan-compare">' +
    DUGAAN.map(function (q) {
      return buildDugaanRow(q, State.dugaanPilih[q.id]);
    }).join('') +
    '</div>' +
    (State.hipotesisTeks
      ? '<div class="sdt-hipotesis">' +
        '<span class="sdt-hipotesis__label">Hipotesismu di tahap 2</span>' +
        '<p>' +
        esc(State.hipotesisTeks) +
        '</p>' +
        '<span class="dl-caption">Apakah hipotesismu didukung temuan, perlu diperbaiki, atau ditolak? Diskusikan dengan pasanganmu.</span>' +
        '</div>'
      : '')
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var langkah = langkahVerif();
  var aktif = langkahAktif(State.verifSteps);
  var aOk = State.verifBukti;
  var bOk = aOk && sortItemsAllAnswered(PERNYATAAN_ITEMS, State.pernyataanStates);
  var rerender = function () {
    renderVerifikasi(container);
  };

  container.innerHTML =
    '<section aria-label="Verifikasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p>' +
        esc(D.pengantarA) +
        '</p>' +
        buildPrediksi(langkah, aktif)
    ) +
    (aOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            buildSortItems(
              PERNYATAAN_ITEMS,
              State.pernyataanOrder,
              D.opsiPernyataan,
              State.pernyataanStates
            )
        )
      : '') +
    (bOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' + esc(D.judulC) + '</h3>' + buildDugaanBanding()
        ) + buildDlNextButton('verifikasiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  if (aktif < langkah.length) {
    bindLangkahUnsur(
      'vf' + aktif,
      State.verifSteps[aktif],
      langkah[aktif],
      saveState,
      rerender,
      periksaSoalSudut
    );
  }
  var bukti = document.getElementById('verifBuktiBtn');
  if (bukti) {
    bukti.addEventListener('click', function () {
      State.verifBukti = true;
      saveState();
      rerender();
    });
  }
  if (aOk) bindSortItems(container, PERNYATAAN_ITEMS, State.pernyataanStates, saveState, rerender);
  bindNext('verifikasiNextBtn', 'verifikasi', 'generalisasi');
}

/* ============================================================
   10. STAGE: GENERALISASI  (Discovery Learning — sintaks 6)
   ============================================================ */

function simpulanSemuaBenar() {
  return DATA.generalisasi.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function buildKalimatSimpulan(D, bank, benarSemua) {
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali temuanmu dari tabel Lab Sudut, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');
}

function periksaSimpulan(container) {
  var D = DATA.generalisasi;
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
  else if (!simpulanSemuaBenar()) showNotice('Masih ada yang belum tepat. Periksa tanda merahnya.');
  renderGeneralisasi(container);
}

function renderGeneralisasi(container) {
  var D = DATA.generalisasi;
  var bank = orderByIds(D.bank, State.bankOrder);
  var benarSemua = simpulanSemuaBenar();
  var contoh = sudutDuaGaris(D.contoh.t);

  container.innerHTML =
    '<section aria-label="Generalisasi">' +
    buildHead(D) +
    buildPengantar(D.instruksi) +
    buildDlPanel(
      buildKalimatSimpulan(D, bank, benarSemua) +
        (benarSemua
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah jawaban pertanyaan penyelidikan yang kamu temukan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman: hubungan antar sudut</h3>' +
            buildFigurSudut({
              mode: D.contoh.mode,
              t: D.contoh.t,
              label: contoh.map(formatSudut),
            }) +
            buildDaftarBernomor(D.rangkuman, true),
          'panel--hero'
        ) + buildDlNextButton('generalisasiNextBtn', D.nextLabel, true)
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
      periksaSimpulan(container);
    });
  }

  bindNext('generalisasiNextBtn', 'generalisasi', 'terapkan');
}

/* ============================================================
   11. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal TERAP_SOAL yang
   dipilih acak. Isian diperiksa periksaSoalSudut sehingga pesan
   salahnya berupa diagnosa miskonsepsi (tertukar penyiku/pelurus,
   mengira sama besar, salah relasi, x vs besar sudut); pilihan ganda
   memakai opsiSoalSudut yang setiap pengecohnya membawa umpan diagnosa.
   ============================================================ */

/* Gambar pendukung soal: sudut diketahui & ditanyakan, atau pasangan disorot. */
function gambarSoal(s) {
  var c = s.cek;
  if (c.minta === 'cari') {
    var k = c.diketahui.k;
    var label = [null, null, null, null];
    label[k] = formatSudut(c.diketahui.nilai);
    label[c.ditanya] = '?';
    return {
      mode: 'potong',
      t: k % 2 === 0 ? c.diketahui.nilai : 180 - c.diketahui.nilai,
      label: label,
    };
  }
  if (c.minta === 'jenis' && c.pasangan) {
    return { mode: c.mode, t: 70, sorot: c.pasangan };
  }
  return null;
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
  inputAriaLabel: 'Jawabanmu',
  inputPlaceholder: 'mis. 125',
  inputMode: 'decimal',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  /* Teks mentah diteruskan; isian yang tak terbaca ditolak tanpa dihitung. */
  parseInput: function (val) {
    var p = parseSudutIsian(val);
    if (p.kode === 'kosong') return { value: null, error: 'empty' };
    if (p.kode === 'format') return { value: null, error: 'invalid', message: PESAN_SUDUT.format };
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return periksaSoalSudut(value, s).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' + esc(ex.userInput) + '</strong> — ' + esc(periksaSoalSudut(ex.userInput, s).pesan)
    );
  },
  revealText: function (s) {
    return 'Jawaban: <strong>' + esc(jawabSoalSudut(s)) + '</strong>. ' + esc(s.explanation);
  },
  buildChoiceFeedback: function (s, ex) {
    if (ex.correct) {
      return buildFeedbackBox('success', '✓', '<strong>Benar!</strong> ' + esc(s.explanation));
    }
    var o = (OPSI_TERAP[s.id] || []).filter(function (x) {
      return x.id === ex.chosen;
    })[0];
    return buildFeedbackBox(
      'error',
      '✗',
      '<strong>Belum tepat.</strong> ' + (o ? esc(o.umpan) + ' ' : '') + esc(s.explanation)
    );
  },
  renderPrompt: function (s) {
    var G = gambarSoal(s);
    return (
      '<div class="dl-prompt">' +
      '<span class="bbk-soal-tag">' +
      buildKonteksTag(s.konteks) +
      (s.type === 'choice' ? ' · Pilihan ganda' : ' · ✏️ Isian') +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
      (G ? buildFigurSudut(G) : '') +
      '<p class="dl-prompt__tanya">' +
      esc(s.pertanyaan) +
      '</p>' +
      '</div>'
    );
  },
});

function renderTerapkan(container) {
  TerapkanStage.render(container);
}

/* ============================================================
   12. STAGE: REFLEKSI
   ============================================================ */

function hitungRekap() {
  var lab = State.labSudut;
  var langkah = State.verifSteps.slice();
  var pilahBenar = 0;
  var pilahTotal = 0;
  OLAH_STAGES.forEach(function (id) {
    langkah = langkah.concat(State.langkahSteps[id]);
    pilahBenar += sortItemsCorrectCount(OLAH[id].pilah, State.pilahOlah[id]);
    pilahTotal += OLAH[id].pilah.length;
  });
  var sekali = langkah.filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  return {
    busur: lab.percobaan - lab.salah + '/' + lab.percobaan,
    langkah: sekali + '/' + langkah.length,
    pilah:
      pilahBenar +
      sortItemsCorrectCount(PERNYATAAN_ITEMS, State.pernyataanStates) +
      '/' +
      (pilahTotal + PERNYATAAN_ITEMS.length),
    terap:
      State.terapkanExercises.filter(function (e) {
        return e.correct;
      }).length +
      '/' +
      TERAP_SOAL.length,
  };
}

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var R = hitungRekap();

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="summary-grid">' +
        buildRingkasKartu(R.busur, 'Bacaan busur yang tepat di Lab Sudut') +
        buildRingkasKartu(R.langkah, 'Isian olah data & prediksi tepat pada percobaan pertama') +
        buildRingkasKartu(R.pilah, 'Pemilahan pasangan sudut & pernyataan benar') +
        buildRingkasKartu(R.terap, 'Uji terap benar') +
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
   13. STAGE: SELESAI
   ============================================================ */

function buildContohHubungan(c) {
  return (
    '<div class="formula-card sdt-contoh">' +
    '<span class="formula-card__label">' +
    esc(DATA.namaJenis[c.jenis]) +
    '</span>' +
    buildDuaGarisSVG(c.gambar) +
    '<strong class="sdt-contoh__rumus">' +
    esc(c.rumus) +
    '</strong>' +
    '</div>'
  );
}

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
    '<div class="sdt-contoh-grid">' +
    D.contoh.map(buildContohHubungan).join('') +
    '</div>' +
    '<div class="panel panel--hero done-card__list">' +
    '<h3 style="margin-top:0;">Yang sudah kamu capai</h3>' +
    buildDaftarBernomor(D.capaian) +
    '</div>' +
    '<div class="feedback-box feedback-box--info done-card__note">' +
    '<span class="feedback-box__icon">📌</span>' +
    '<div class="feedback-box__body">' +
    '<strong>Catatan untuk Guru:</strong><br>' +
    'Rekap pada tahap Refleksi adalah indikator latihan digital, bukan nilai akhir. ' +
    'Kemampuan murid mengukur sudut dengan busur sungguhan, menunjukkan pasangan sudut pada gambar, dan menjelaskan alasan sudut bertolak belakang sama besar tetap menjadi bahan penilaian utama. Hubungan sudut pada dua garis sejajar yang dipotong garis transversal dibahas pada pertemuan berikutnya.' +
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
   14. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  stimulasi: renderStimulasi,
  masalah: renderMasalah,
  koleksi: renderKoleksi,
  olahPelurus: renderOlahPelurus,
  olahTolak: renderOlahTolak,
  olahPenyiku: renderOlahPenyiku,
  verifikasi: renderVerifikasi,
  generalisasi: renderGeneralisasi,
  terapkan: renderTerapkan,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  var fn = RENDERERS[State.currentStage] || renderStimulasi;
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
