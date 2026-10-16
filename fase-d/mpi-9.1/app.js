'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Unsur & Bidang Penyusun Bangun Ruang — Fase D,
   SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen bersama: buildDiscoveryHead, buildTeacherNote,
       buildTpPanel, buildChoiceGroup, buildSortItems,
       buildGuidedQuizList, buildDlPanel, buildDlNextButton,
       buildFeedbackBox, buildLangkahUnsur (langkah isian berdiagnosa);
     • seksi 78 (bangun ruang): unsurBangunRuang, bidangPenyusun,
       teksBidangPenyusun, punyaSisiLengkung, kelompokAlas,
       rumusUnsurBangun, periksaSoalRuang, jawabSoalRuang,
       opsiSoalRuang, buildRuangSVG (model prisma, tabung, limas,
       kerucut), buildBidangPenyusunSVG, serta alat interaktif
       buildLabAmati (Lab Amati Benda) & buildTabelAmati.

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan stimulasi, rumusan
   masalah, pertanyaan temuan, pemilahan, pilihan bidang penyusun di Lab
   Amati, pernyataan verifikasi, bank kesimpulan, opsi uji terap,
   penilaian diri) DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder() / ensureSortStates() / ensureLabAmati().
   Pengacakan dilakukan SEKALI saat state disiapkan (initExerciseArrays)
   lalu urutannya disimpan di State — bukan saat render — sehingga
   pilihan tidak melompat saat dirender ulang, tetapi teracak ulang untuk
   setiap murid dan setiap Reset. Benda verifikasi (pilihBendaVerif) dan
   soal uji terap (pilihSoalTerap) juga dipilih acak; opsi pilihan
   gandanya dibangun engine (opsiSoalRuang).

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi               (DL sintaks 1)
    6. Stage: Merumuskan Masalah      (DL sintaks 2)
    7. Stage: Lab Amati Benda         (DL sintaks 3)
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
var STORAGE_KEY = 'mpi-d-9-1-unsur-bangun-ruang-v1';
var OLAH_STAGES = ['olahSisi', 'olahAlas', 'olahPola'];
var LAB = DATA.koleksi.lab;
var VIEW_ATAS = { azimut: -25, elevasi: 25 };
var VIEW_BAWAH = { azimut: -25, elevasi: -35 };

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

/* Label konteks: ikon + nama (Dapur & Makanan, Sekolah, …). */
function buildKonteksTag(konteks) {
  var K = DATA.konteks[konteks];
  return (
    '<span class="bgr-konteks bgr-konteks--' +
    konteks +
    '"><span aria-hidden="true">' +
    K.ikon +
    '</span> ' +
    esc(K.nama) +
    '</span>'
  );
}

/* "a × n + b" untuk butir pola. */
function teksRumus(b) {
  var suku = b.a === 1 ? 'n' : b.a + ' × n';
  return suku + (b.b ? ' + ' + b.b : '');
}

/* Bangun pemilik rumus a × n + b (prisma atau limas), dihitung engine. */
function pemilikRumus(b) {
  return ['prisma', 'limas'].filter(function (j) {
    var r = rumusUnsurBangun(j, b.kolom);
    return r && r.a === b.a && r.b === b.b;
  })[0];
}

/* Teks & kunci pemilahan setiap tahap olah data (kunci dari engine). */
var PILAH_OLAH = {
  olahSisi: {
    teks: function (b) {
      return esc(b.teks);
    },
    kunci: function (b) {
      return punyaSisiLengkung(b.jenis) ? 'lengkung' : 'datar';
    },
  },
  olahAlas: {
    teks: function (b) {
      return esc(teksBidangPenyusun(b.jenis, b.n));
    },
    kunci: function (b) {
      return kelompokAlas(b.jenis);
    },
  },
  olahPola: {
    teks: function (b) {
      return esc('Banyak ' + BGR_NAMA_KOLOM[b.kolom] + ' = ' + teksRumus(b));
    },
    kunci: pemilikRumus,
  },
};

var DUGAAN = DATA.stimulasi.dugaan.map(siapkanGuided);
var MASALAH_OPSI = opsiAman(DATA.masalah.opsi);

/* Konfigurasi tiap tahap olah data: temuan, pemilahan & langkah isian. */
var OLAH = {};
OLAH_STAGES.forEach(function (id, i) {
  var D = DATA[id];
  var P = PILAH_OLAH[id];
  OLAH[id] = {
    prefix: ['os', 'oa', 'op'][i],
    temuan: D.temuan.map(siapkanGuided),
    pilah: D.pilah.butir.map(function (b) {
      return {
        id: b.id,
        teks: '<strong>' + P.teks(b) + '</strong>',
        correct: P.kunci(b),
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

/* Soal pilihan ganda uji terap: opsi dibangun engine (opsiSoalRuang). */
var OPSI_TERAP = {};
DATA.terapkan.soal.forEach(function (s) {
  if (s.type !== 'choice') return;
  var opsi = opsiSoalRuang(s);
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

  /* Tahap 3 — Lab Amati Benda */
  labAmati: null,

  /* Tahap 4a–c — olah data */
  temuanOrders: {},
  temuanPilih: {},
  pilahOlah: {},
  langkahSteps: {},

  /* Tahap 5 — verifikasi */
  verifBenda: null,
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

/* Benda baru untuk verifikasi, dipilih acak dari bank. */
function pilihBendaVerif() {
  return shuffleArray(optionIds(DATA.verifikasi.bank))[0];
}

function bendaVerif() {
  return DATA.verifikasi.bank.filter(function (b) {
    return b.id === State.verifBenda;
  })[0];
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

  /* Tahap 3 — urutan opsi bidang penyusun tiap benda diacak di engine */
  ensureLabAmati(State, 'labAmati', LAB);

  /* Tahap 4a–c — urutan butir & kategori pemilahan per tahap */
  var pilah = ensureMap('pilahOlah');
  var langkah = ensureMap('langkahSteps');
  OLAH_STAGES.forEach(function (id) {
    ensureSortStates(pilah, id, id + 'Order', OLAH[id].pilah, OLAH[id].kategori);
    ensureExerciseArray(langkah, id, DATA[id].langkah, makeCekStep);
  });
  ensureListOrders('temuanOrders', SEMUA_TEMUAN);
  ensureMap('temuanPilih');

  /* Tahap 5 — benda baru dipilih acak */
  if (!bendaVerif()) {
    State.verifBenda = pilihBendaVerif();
    State.verifSteps = [];
    State.verifBukti = false;
  }
  ensureExerciseArray(State, 'verifSteps', BGR_KOLOM, makeCekStep);
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

function namaKapital(jenis, n) {
  var t = namaBangunRuang(jenis, n);
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* Model bangun ruang (tanpa interaksi) dengan keterangan di bawahnya. */
function buildFigurBangun(jenis, n, caption, view) {
  return (
    '<figure class="bgr-figur">' +
    buildRuangSVG(jenis, n, view || VIEW_ATAS, { label: false, skala: 60 }) +
    (caption ? '<figcaption>' + caption + '</figcaption>' : '') +
    '</figure>'
  );
}

/* Isian yang sudah benar ditampilkan apa adanya (bilangan cacah). */
function tampilIsianBangun(input) {
  return String(input || '').trim();
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati benda-benda di sekitar lalu MENDUGA. Tidak dinilai.
   ============================================================ */

function buildKartuStimulasi(k) {
  return (
    '<article class="bgr-kartu">' +
    '<span class="bgr-kartu__ikon" aria-hidden="true">' +
    k.ikon +
    '</span>' +
    '<h3 class="bgr-kartu__judul">' +
    esc(k.judul) +
    '</h3>' +
    '<p class="bgr-kartu__teks">' +
    esc(k.teks) +
    '</p>' +
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
      '<h2 style="margin-top:0;">🏠 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="bgr-kartu-grid">' +
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
   7. STAGE: LAB AMATI BENDA  (Discovery Learning — sintaks 3)
   Pilih benda → putar model → tandai sisi, rusuk, titik sudut/puncak →
   catat banyaknya (isian berdiagnosa) → bongkar & pilih bidang
   penyusun. Minimal empat benda yang mewakili keempat bangun.
   ============================================================ */

function renderKoleksi(container, fokus) {
  var D = DATA.koleksi;
  var lab = State.labAmati;
  var lengkap = labAmatiLengkap(lab, LAB);
  var catat = bendaAmatiTercatat(lab, LAB);
  var kurang = BGR_JENIS.filter(function (j) {
    return !catat.some(function (b) {
      return b.jenis === j;
    });
  });

  container.innerHTML =
    '<section aria-label="Lab Amati Benda">' +
    buildHead(D) +
    buildPengantar(D.pengantar) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🔬 Lab Amati Benda</h3>' +
        '<details class="bgr-tips"><summary>💡 Arti sisi, rusuk, dan titik sudut</summary>' +
        '<ul>' +
        D.tips
          .map(function (t) {
            return '<li>' + esc(t) + '</li>';
          })
          .join('') +
        '</ul></details>' +
        buildLabAmati('la', lab, LAB)
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">📋 Tabel pengamatan</h3>' +
        buildTabelAmati(lab, LAB) +
        (lengkap
          ? ''
          : '<p class="dl-caption">Sudah tercatat ' +
            catat.length +
            ' dari minimal ' +
            LAB.minBenda +
            ' benda.' +
            (kurang.length
              ? ' Belum ada benda berbentuk: ' +
                esc(
                  kurang
                    .map(function (j) {
                      return DATA.namaJenis[j].toLowerCase();
                    })
                    .join(', ')
                ) +
                '.'
              : '') +
            '</p>')
    ) +
    (lengkap
      ? buildDlPanel(buildFeedbackBox('success', '✓', esc(D.selesaiTeks))) +
        buildDlNextButton('koleksiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindLabAmati(
    container,
    'la',
    lab,
    LAB,
    function (f) {
      saveState();
      renderKoleksi(container, f);
    },
    saveState
  );
  bindNext('koleksiNextBtn', 'koleksi', 'olahSisi');
  if (fokus) {
    var el = container.querySelector(fokus);
    if (el) el.focus();
  }
}

/* ============================================================
   8. STAGE: OLAH DATA  (Discovery Learning — sintaks 4a–4c)
   Tabel pengamatan → pertanyaan temuan → pemilahan → langkah isian
   berdiagnosa → ringkasan temuan. Ketiga tahap memakai satu renderer.
   ============================================================ */

function siapkanLangkah(s) {
  return {
    id: s.id,
    label: esc(s.label),
    cek: s.cek,
    placeholder: s.placeholder,
    hints: (s.hints || []).map(esc),
    temuan: esc(s.temuan),
  };
}

/* Tabel data pola prisma & limas segi-n (dihitung engine). */
function buildTabelPola() {
  var baris = [];
  ['prisma', 'limas'].forEach(function (j) {
    DATA.olahPola.polaN.forEach(function (n) {
      var u = unsurBangunRuang(j, n);
      baris.push(
        '<tr><th scope="row">' +
          esc(namaKapital(j, n)) +
          '</th><td class="bgr-tabel__angka">' +
          n +
          '</td><td class="bgr-tabel__angka">' +
          u.titikSudut +
          '</td><td class="bgr-tabel__angka">' +
          u.rusuk +
          '</td><td class="bgr-tabel__angka">' +
          u.sisi +
          '</td></tr>'
      );
    });
  });
  return (
    '<div class="psm-table-wrap bgr-tabel-wrap"><table class="psm-table bgr-tabel">' +
    '<caption>Banyak unsur prisma dan limas segi-n</caption>' +
    '<thead><tr><th scope="col">Bangun</th><th scope="col">n (sisi alas)</th>' +
    '<th scope="col">Titik sudut</th><th scope="col">Rusuk</th><th scope="col">Sisi</th></tr></thead>' +
    '<tbody>' +
    baris.join('') +
    '</tbody></table></div>'
  );
}

function buildDataOlah(stageId) {
  if (stageId === 'olahPola') {
    return (
      '<div class="bgr-galeri">' +
      buildFigurBangun('prisma', 6, 'Prisma segienam') +
      buildFigurBangun('limas', 6, 'Limas segienam') +
      '</div>' +
      buildTabelPola()
    );
  }
  var galeri =
    stageId === 'olahSisi'
      ? buildFigurBangun('tabung', null, 'Tabung: selimut lengkung') +
        buildFigurBangun('kerucut', null, 'Kerucut: selimut lengkung') +
        buildFigurBangun('prisma', 4, 'Prisma: semua sisi datar') +
        buildFigurBangun('limas', 4, 'Limas: semua sisi datar')
      : buildFigurBangun('prisma', 4, 'Prisma: dua alas') +
        buildFigurBangun('tabung', null, 'Tabung: dua alas') +
        buildFigurBangun('limas', 4, 'Limas: satu alas + puncak') +
        buildFigurBangun('kerucut', null, 'Kerucut: satu alas + puncak');
  return (
    buildTabelAmati(State.labAmati, LAB, { caption: 'Tabel pengamatanmu dari Lab Amati' }) +
    '<div class="bgr-galeri">' +
    galeri +
    '</div>'
  );
}

function buildLabBelumLengkap() {
  return (
    buildDlPanel(
      buildFeedbackBox(
        'warning',
        '⚠️',
        'Tabel pengamatan belum lengkap. Amati benda-benda dulu di tahap Lab Amati.'
      )
    ) + buildDlNextButton('keLabBtn', '← Kembali ke Lab Amati')
  );
}

function renderOlah(stageId, container) {
  var D = DATA[stageId];
  var C = OLAH[stageId];

  if (!labAmatiLengkap(State.labAmati, LAB)) {
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
      return buildLangkahUnsur(C.prefix + i, steps[i], step, i + 1, tampilIsianBangun);
    })
    .join('');

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
      periksaSoalRuang
    );
  }
  bindNext(C.prefix + 'NextBtn', stageId, C.next);
}

function renderOlahSisi(container) {
  renderOlah('olahSisi', container);
}

function renderOlahAlas(container) {
  renderOlah('olahAlas', container);
}

function renderOlahPola(container) {
  renderOlah('olahPola', container);
}

/* ============================================================
   9. STAGE: VERIFIKASI  (Discovery Learning — sintaks 5)
   A. Benda baru acak: prediksi keempat unsurnya, lalu buktikan dengan
      model (dua sudut pandang) & bidang penyusunnya
   B. Pernyataan selalu benar / kadang-kadang benar / salah
   C. Dugaan awal & hipotesis dibandingkan dengan temuan
   ============================================================ */

/* Petunjuk prediksi: pola (prisma/limas) atau arti unsur (tabung/kerucut). */
function petunjukVerif(jenis, kolom) {
  if (kolom === 'sisiLengkung') {
    return punyaSisiLengkung(jenis)
      ? 'Selimutnya melengkung dan utuh menjadi satu bidang.'
      : 'Apakah ' + jenis + ' punya permukaan yang melengkung?';
  }
  var r = rumusUnsurBangun(jenis, kolom);
  if (r) {
    return (
      'Pola ' + jenis + ' segi-n: banyak ' + BGR_NAMA_KOLOM[kolom] + ' = ' + teksRumus(r) + '.'
    );
  }
  return {
    sisiDatar: 'Hitung bidang datar berbentuk lingkaran: alas (dan tutup, bila ada).',
    rusuk: 'Rusuk adalah tempat dua sisi bertemu, boleh melengkung.',
    titikSudut: 'Titik sudut adalah tempat tiga rusuk atau lebih bertemu.',
  }[kolom];
}

function langkahVerif() {
  var b = bendaVerif();
  var u = unsurBangunRuang(b.jenis, b.n);
  return BGR_KOLOM.map(function (k) {
    return {
      id: 'v' + k.id,
      label: esc('Berapa banyak ' + k.label.toLowerCase() + ' ' + b.nama.toLowerCase() + '?'),
      cek: { minta: 'unsur', jenis: b.jenis, n: b.n, kolom: k.id },
      placeholder: 'mis. ' + (u[k.id] + 2),
      hints: [esc(petunjukVerif(b.jenis, k.id))],
      temuan: esc(
        'Tepat: ' +
          u[k.id] +
          ' ' +
          k.label.toLowerCase() +
          ' pada ' +
          namaBangunRuang(b.jenis, b.n) +
          '.'
      ),
    };
  });
}

function buildBukti(b) {
  return (
    '<div class="bgr-bukti">' +
    '<div class="bgr-galeri">' +
    buildFigurBangun(b.jenis, b.n, 'Dilihat dari atas', VIEW_ATAS) +
    buildFigurBangun(b.jenis, b.n, 'Dilihat dari bawah', VIEW_BAWAH) +
    '</div>' +
    '<div class="bgr-bidang-wrap">' +
    buildBidangPenyusunSVG(b.jenis, b.n) +
    '<p class="dl-caption" style="text-align:center;">Bidang penyusun: ' +
    esc(teksBidangPenyusun(b.jenis, b.n)) +
    '</p>' +
    '</div>' +
    '</div>'
  );
}

function buildPrediksi(langkah, aktif) {
  var D = DATA.verifikasi;
  var b = bendaVerif();
  var semua = aktif >= langkah.length;
  return (
    '<div class="bgr-verif">' +
    '<div class="bgr-verif__benda"><span class="bgr-kartu__ikon" aria-hidden="true">' +
    b.ikon +
    '</span><div><strong>' +
    esc(b.nama) +
    '</strong><br><span class="dl-caption">Bentuknya ' +
    esc(namaBangunRuang(b.jenis, b.n)) +
    '.</span></div></div>' +
    '<div class="dl-steps">' +
    langkah
      .slice(0, Math.min(aktif + 1, langkah.length))
      .map(function (step, i) {
        return buildLangkahUnsur('vf' + i, State.verifSteps[i], step, i + 1, tampilIsianBangun);
      })
      .join('') +
    '</div>' +
    '</div>' +
    (semua && !State.verifBukti
      ? '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="verifBuktiBtn">' +
        esc(D.buktiLabel) +
        '</button></div>'
      : '') +
    (State.verifBukti ? buildBukti(b) + buildFeedbackBox('success', '✓', esc(D.buktiTeks)) : '')
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
      ? '<div class="bgr-hipotesis">' +
        '<span class="bgr-hipotesis__label">Hipotesismu di tahap 2</span>' +
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
      periksaSoalRuang
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali tabel pengamatanmu, lalu pilih potongan lain.</p>'
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
          '<h3 style="margin-top:0;">Rangkuman: unsur & bidang penyusun bangun ruang</h3>' +
            '<div class="bgr-galeri">' +
            D.contoh
              .map(function (c) {
                return buildFigurBangun(c.jenis, c.n, esc(namaKapital(c.jenis, c.n)));
              })
              .join('') +
            '</div>' +
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
   dipilih acak. Isian diperiksa periksaSoalRuang sehingga pesan
   salahnya berupa diagnosa miskonsepsi (lupa tutup/alas, garis tepi
   gambar dianggap rusuk, puncak kerucut dianggap titik sudut, pola
   prisma–limas tertukar); pilihan ganda memakai opsiSoalRuang yang
   setiap pengecohnya membawa umpan diagnosa.
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
  inputAriaLabel: 'Jawabanmu',
  inputPlaceholder: 'mis. 6',
  inputMode: 'numeric',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  /* Teks mentah diteruskan; isian yang tak terbaca ditolak tanpa dihitung. */
  parseInput: function (val) {
    var p = parseInputInt(val);
    if (p.error === 'empty') return { value: null, error: 'empty' };
    if (p.error || p.value < 0) {
      return { value: null, error: 'invalid', message: BGR_PESAN.format };
    }
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return periksaSoalRuang(value, s).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' + esc(ex.userInput) + '</strong> — ' + esc(periksaSoalRuang(ex.userInput, s).pesan)
    );
  },
  revealText: function (s) {
    return 'Jawaban: <strong>' + esc(jawabSoalRuang(s)) + '</strong>. ' + esc(s.explanation);
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
    var c = s.cek;
    return (
      '<div class="dl-prompt">' +
      '<span class="bbk-soal-tag">' +
      buildKonteksTag(s.konteks) +
      (s.type === 'choice' ? ' · Pilihan ganda' : ' · ✏️ Isian') +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
      (c.minta === 'unsur' ? buildFigurBangun(c.jenis, c.n) : '') +
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
  var lab = State.labAmati;
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
    amati: lab.percobaan - lab.salah + '/' + lab.percobaan,
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
        buildRingkasKartu(R.amati, 'Pencatatan unsur yang langsung tepat di Lab Amati') +
        buildRingkasKartu(R.langkah, 'Isian olah data & prediksi tepat pada percobaan pertama') +
        buildRingkasKartu(R.pilah, 'Pemilahan & pernyataan benar') +
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

function buildContohBangun(c) {
  var u = unsurBangunRuang(c.jenis, c.n);
  return (
    '<div class="formula-card bgr-contoh">' +
    '<span class="formula-card__label">' +
    esc(c.benda) +
    ' · ' +
    esc(namaKapital(c.jenis, c.n)) +
    '</span>' +
    buildRuangSVG(c.jenis, c.n, VIEW_ATAS, { label: false, skala: 60 }) +
    '<span class="bgr-contoh__unsur">' +
    u.sisi +
    ' sisi · ' +
    u.rusuk +
    ' rusuk · ' +
    u.titikSudut +
    ' titik sudut' +
    (c.jenis === 'kerucut' ? ' · 1 titik puncak' : '') +
    '</span>' +
    '<strong class="bgr-contoh__bidang">' +
    esc(teksBidangPenyusun(c.jenis, c.n)) +
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
    '<div class="bgr-contoh-grid">' +
    D.contoh.map(buildContohBangun).join('') +
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
    'Kemampuan murid menunjukkan unsur pada benda sungguhan dan menjelaskan perbedaan titik sudut dengan titik puncak tetap menjadi bahan penilaian utama. Bidang penyusun yang ditemukan hari ini menjadi bekal untuk menyusun jaring-jaring bangun ruang pada pertemuan berikutnya.' +
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
  olahSisi: renderOlahSisi,
  olahAlas: renderOlahAlas,
  olahPola: renderOlahPola,
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
