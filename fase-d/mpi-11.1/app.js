'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Menyajikan Data Kategorik dalam Tabel Frekuensi &
   Diagram Batang — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen bersama: buildDiscoveryHead, buildTeacherNote,
       buildTpPanel, buildChoiceGroup, buildSortItems,
       buildGuidedQuizList, buildDlPanel, buildDlNextButton,
       buildFeedbackBox, buildLangkahUnsur (langkah isian berdiagnosa);
     • seksi 79 (data kategorik): hitungFrekuensi, kategoriTerbanyak,
       skalaDisarankan, diagnosaSkala, puncakSumbu, nilaiSkalaSumbu,
       nilaiSoalData, periksaSoalData, jawabSoalData, opsiSoalData,
       buildTurus, buildTabelFrekuensi, buildDiagramBatangSVG, serta alat
       interaktif buildLabTurus (Lab Turus), buildLabSkala (Lab Skala) &
       buildLabBatang (Lab Diagram Batang).

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan stimulasi, rumusan
   masalah, pertanyaan temuan, pemilahan, pilihan langkah skala &
   kelengkapan diagram di Lab Diagram Batang, pernyataan verifikasi, bank
   kesimpulan, opsi uji terap, penilaian diri) DIACAK dengan
   shuffleArray() melalui ensureShuffledOrder() / ensureSortStates() /
   ensureLabTurus() / ensureLabBatang(). Pengacakan dilakukan SEKALI saat
   state disiapkan (initExerciseArrays) lalu urutannya disimpan di State —
   bukan saat render — sehingga pilihan tidak melompat saat dirender
   ulang, tetapi teracak ulang untuk setiap murid dan setiap Reset. Urutan
   kartu survei & baris tabel di Lab Turus, data verifikasi
   (pilihDataVerif), dan soal uji terap (pilihSoalTerap) juga diacak; opsi
   pilihan gandanya dibangun engine (opsiSoalData).

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi               (DL sintaks 1)
    6. Stage: Merumuskan Masalah      (DL sintaks 2)
    7. Stage: Lab Turus               (DL sintaks 3)
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
var STORAGE_KEY = 'mpi-d-11-1-data-kategorik-v1';
var OLAH_STAGES = ['olahTabel', 'olahSkala', 'olahBatang'];
var KANTIN = DATA.kantin;
var LAB_TURUS = {
  data: DATA.koleksi.lab.data,
  kategori: KANTIN.kategori,
  percepatSetelah: DATA.koleksi.lab.percepatSetelah,
  judulKategori: DATA.koleksi.lab.judulKategori,
  caption: DATA.koleksi.lab.caption,
};
var LAB_SKALA = DATA.olahSkala.lab;

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

/* Label konteks: ikon + nama (Kantin & Jajanan, Sekolah, …). */
function buildKonteksTag(konteks) {
  var K = DATA.konteks[konteks];
  return (
    '<span class="dtk-konteks dtk-konteks--' +
    konteks +
    '"><span aria-hidden="true">' +
    K.ikon +
    '</span> ' +
    esc(K.nama) +
    '</span>'
  );
}

/* Kunci pemilahan setiap tahap olah data (skala dihitung engine). */
var KUNCI_PILAH = {
  olahTabel: function (b) {
    return b.correct;
  },
  olahSkala: function (b) {
    return nilaiSkalaSumbu(b.cek);
  },
  olahBatang: function (b) {
    return b.correct;
  },
};

var DUGAAN = DATA.stimulasi.dugaan.map(siapkanGuided);
var MASALAH_OPSI = opsiAman(DATA.masalah.opsi);

/* Konfigurasi tiap tahap olah data: temuan, pemilahan & langkah isian. */
var OLAH = {};
OLAH_STAGES.forEach(function (id, i) {
  var D = DATA[id];
  OLAH[id] = {
    prefix: ['ot', 'os', 'ob'][i],
    temuan: D.temuan.map(siapkanGuided),
    pilah: D.pilah.butir.map(function (b) {
      return {
        id: b.id,
        teks: '<strong>' + esc(b.teks) + '</strong>',
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

/* Soal pilihan ganda uji terap: opsi dibangun engine (opsiSoalData). */
var OPSI_TERAP = {};
DATA.terapkan.soal.forEach(function (s) {
  if (s.type !== 'choice') return;
  var opsi = opsiSoalData(s);
  OPSI_TERAP[s.id] = opsi;
  s.options = opsiAman(opsi);
  s.correct = 'baku';
});

/* Lab Diagram Batang data kantin: urutan batang mengikuti tabel Lab Turus. */
function cfgLabBatang() {
  return {
    kategori: orderByIds(KANTIN.kategori, State.labTurus && State.labTurus.katOrder),
    frek: KANTIN.frek,
    langkahOpsi: DATA.olahBatang.lab.langkahOpsi,
    kelengkapan: DATA.olahBatang.lab.kelengkapan,
  };
}

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

  /* Tahap 3 — Lab Turus */
  labTurus: null,

  /* Tahap 4a–c — olah data */
  labSkala: null,
  labBatang: null,
  temuanOrders: {},
  temuanPilih: {},
  pilahOlah: {},
  langkahSteps: {},

  /* Tahap 5 — verifikasi */
  verifData: null,
  verifSteps: [],
  labVerif: null,
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

/* Data baru untuk verifikasi, dipilih acak dari bank. */
function pilihDataVerif() {
  return shuffleArray(optionIds(DATA.verifikasi.bank))[0];
}

function dataVerif() {
  return DATA.verifikasi.bank.filter(function (b) {
    return b.id === State.verifData;
  })[0];
}

/* Lab Diagram Batang verifikasi: opsi langkah = kunci + pengecoh engine. */
function cfgLabVerif() {
  var ds = dataVerif();
  return {
    kategori: ds.kategori,
    frek: ds.frek,
    langkahOpsi: opsiSoalData({ cek: { minta: 'skala', max: frekuensiTerbesar(ds.frek) } }).map(
      function (o) {
        return o.nilai;
      }
    ),
    kelengkapan: [],
    judul: ds.judul,
    labelX: ds.labelX,
    labelY: ds.labelY,
  };
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

  /* Tahap 3 — urutan kartu & baris tabel diacak di engine */
  ensureLabTurus(State, 'labTurus', LAB_TURUS);

  /* Tahap 4a–c — lab, urutan butir & kategori pemilahan per tahap */
  ensureLabSkala(State, 'labSkala', LAB_SKALA);
  ensureLabBatang(State, 'labBatang', cfgLabBatang());
  var pilah = ensureMap('pilahOlah');
  var langkah = ensureMap('langkahSteps');
  OLAH_STAGES.forEach(function (id) {
    ensureSortStates(pilah, id, id + 'Order', OLAH[id].pilah, OLAH[id].kategori);
    ensureExerciseArray(langkah, id, DATA[id].langkah, makeCekStep);
  });
  ensureListOrders('temuanOrders', SEMUA_TEMUAN);
  ensureMap('temuanPilih');

  /* Tahap 5 — data baru dipilih acak */
  if (!dataVerif()) {
    State.verifData = pilihDataVerif();
    State.verifSteps = [];
    State.labVerif = null;
  }
  ensureExerciseArray(State, 'verifSteps', langkahVerif(), makeCekStep);
  ensureLabBatang(State, 'labVerif', cfgLabVerif());
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

function buildDaftarBernomor(list) {
  return (
    '<ol class="objectives-list">' +
    list
      .map(function (r, i) {
        return (
          '<li><span class="objectives-list__num">' +
          (i + 1) +
          '</span><span>' +
          esc(r) +
          '</span></li>'
        );
      })
      .join('') +
    '</ol>'
  );
}

/* Render ulang tahap lalu kembalikan fokus ke elemen yang sama (bila ada). */
function renderDanFokus(render, container, fokus) {
  saveState();
  render(container);
  if (fokus) {
    var el = container.querySelector(fokus);
    if (el) el.focus();
  }
}

/* Daftar data mentah sebagai kartu kecil (catatan survei, soal frekuensi). */
function buildDataMentah(data, kategori) {
  return (
    '<ul class="dtk-mentah" aria-label="Data mentah">' +
    data
      .map(function (d) {
        var k = kategori.filter(function (x) {
          return x.id === (d.nilai || d);
        })[0];
        return (
          '<li class="dtk-mentah__item">' +
          (d.nama ? '<span class="dtk-mentah__nama">' + esc(d.nama) + '</span>' : '') +
          (k.ikon ? '<span aria-hidden="true">' + k.ikon + '</span> ' : '') +
          esc(k.label) +
          '</li>'
        );
      })
      .join('') +
    '</ul>'
  );
}

/* Diagram batang dari data set { judul, labelX, labelY, kategori, frek }. */
function buildDiagramData(ds, opts) {
  return (
    '<div class="dtk-diagram-wrap">' +
    buildDiagramBatangSVG(
      ds.kategori,
      ds.frek,
      Object.assign({ judul: ds.judul, labelX: ds.labelX, labelY: ds.labelY }, opts || {})
    ) +
    '</div>'
  );
}

/* Isian yang sudah benar ditampilkan apa adanya (bilangan cacah). */
function tampilIsianData(input) {
  return String(input || '').trim();
}

/* Gambar pendukung langkah isian (turus, tabel, data mentah, diagram). */
function figurLangkah(cek) {
  if (cek.minta === 'turus') return '<p class="dtk-figur-turus">' + buildTurus(cek.n) + '</p>';
  if (cek.minta === 'total') {
    return buildTabelFrekuensi(cek.kategori, cek.frek, { jumlah: false });
  }
  if (cek.minta === 'frekuensi') return buildDataMentah(cek.data, cek.kategori);
  return '';
}

/* Langkah isian berdiagnosa dengan gambar di atasnya (hanya langkah aktif). */
function buildLangkahData(id, st, step, num) {
  var figur =
    !st.done && step.figur ? '<div class="dtk-langkah__figur">' + step.figur + '</div>' : '';
  return figur + buildLangkahUnsur(id, st, step, num, tampilIsianData);
}

function siapkanLangkah(s, tanpaFigur) {
  return {
    id: s.id,
    label: esc(s.label),
    cek: s.cek,
    placeholder: s.placeholder,
    hints: (s.hints || []).map(esc),
    temuan: esc(s.temuan),
    figur: tanpaFigur ? '' : figurLangkah(s.cek),
  };
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Catatan survei acak + diagram mading menyesatkan → MENDUGA.
   Tidak dinilai.
   ============================================================ */

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
  var M = D.mading;
  var lengkap = semuaDipilih(DUGAAN, State.dugaanPilih);

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🍢 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<h3>📝 ' +
        esc(D.catatanJudul) +
        '</h3>' +
        buildDataMentah(DATA.koleksi.lab.data, KANTIN.kategori) +
        '<h3>📌 Diagram di mading</h3>' +
        '<p>' +
        esc(M.teks) +
        '</p>' +
        buildDiagramData(
          { judul: M.judul, kategori: KANTIN.kategori, frek: KANTIN.frek },
          { cacat: M.cacat, mulai: M.mulai, langkah: M.langkah }
        ),
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
      renderDanFokus(
        renderStimulasi,
        container,
        '[data-group="' + btn.dataset.group + '"][data-dugaan="' + btn.dataset.dugaan + '"]'
      );
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
   7. STAGE: LAB TURUS  (Discovery Learning — sintaks 3)
   Kartu jawaban acak → ketuk baris kategori (turus) → isi frekuensi &
   jumlah (isian berdiagnosa).
   ============================================================ */

function renderKoleksi(container, fokus) {
  var D = DATA.koleksi;
  var lab = State.labTurus;
  var lengkap = labTurusLengkap(lab, LAB_TURUS);

  container.innerHTML =
    '<section aria-label="Lab Turus">' +
    buildHead(D) +
    buildPengantar(D.pengantar) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🗳️ Lab Turus</h3>' +
        '<details class="dtk-tips"><summary>💡 Cara menurus</summary>' +
        '<ul>' +
        D.tips
          .map(function (t) {
            return '<li>' + esc(t) + '</li>';
          })
          .join('') +
        '</ul></details>' +
        buildLabTurus('lt', lab, LAB_TURUS)
    ) +
    (lengkap
      ? buildDlPanel(buildFeedbackBox('success', '✓', esc(D.selesaiTeks))) +
        buildDlNextButton('koleksiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindLabTurus(
    container,
    'lt',
    lab,
    LAB_TURUS,
    function (f) {
      renderDanFokus(renderKoleksi, container, f);
    },
    saveState
  );
  bindNext('koleksiNextBtn', 'koleksi', 'olahTabel');
  if (fokus) {
    var el = container.querySelector(fokus);
    if (el) el.focus();
  }
}

/* ============================================================
   8. STAGE: OLAH DATA  (Discovery Learning — sintaks 4a–4c)
   Data/lab → pertanyaan temuan → pemilahan → langkah isian
   berdiagnosa → ringkasan temuan. Ketiga tahap memakai satu renderer.
   ============================================================ */

function tabelKantin(caption) {
  return buildTabelFrekuensi(orderByIds(KANTIN.kategori, State.labTurus.katOrder), KANTIN.frek, {
    turus: true,
    caption: caption,
    judulKategori: DATA.koleksi.lab.judulKategori,
  });
}

/* Data/lab tiap tahap olah: { html, siap, bind(container, rerender) }. */
function dataOlah(stageId) {
  if (stageId === 'olahTabel') {
    return { html: tabelKantin('Tabel frekuensimu dari Lab Turus'), siap: true };
  }
  if (stageId === 'olahSkala') {
    return {
      html: buildLabSkala('ls', State.labSkala, LAB_SKALA),
      siap: labSkalaCukup(State.labSkala, LAB_SKALA),
      bind: function (container, rerender) {
        bindLabSkala(container, 'ls', State.labSkala, LAB_SKALA, rerender);
      },
    };
  }
  var cfg = cfgLabBatang();
  return {
    html:
      '<details class="dtk-tips" open><summary>📋 Tabel frekuensi data kantin</summary>' +
      tabelKantin('Jajanan kesukaan murid kelas VII A') +
      '</details>' +
      buildLabBatang('lb', State.labBatang, cfg),
    siap: labBatangSelesai(State.labBatang, cfg),
    bind: function (container, rerender) {
      bindLabBatang(container, 'lb', State.labBatang, cfg, rerender);
    },
  };
}

function buildLabBelumLengkap() {
  return (
    buildDlPanel(
      buildFeedbackBox(
        'warning',
        '⚠️',
        'Tabel frekuensi belum lengkap. Turuskan semua kartu dulu di tahap Lab Turus.'
      )
    ) + buildDlNextButton('keLabBtn', '← Kembali ke Lab Turus')
  );
}

function renderOlah(stageId, container) {
  var D = DATA[stageId];
  var C = OLAH[stageId];

  if (!labTurusLengkap(State.labTurus, LAB_TURUS)) {
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

  var data = dataOlah(stageId);
  var pilahSt = State.pilahOlah[stageId];
  var steps = State.langkahSteps[stageId];
  var latihan = D.diagramLatihan;
  var langkah = D.langkah.map(function (s) {
    return siapkanLangkah(s, !!latihan);
  });
  var temuanOk = data.siap && guidedQuizAllCorrect(C.temuan, State.temuanPilih);
  var pilahOk = temuanOk && sortItemsAllAnswered(C.pilah, pilahSt);
  var aktif = langkahAktif(steps);
  var langkahOk = pilahOk && aktif >= langkah.length;
  var rerender = function (fokus) {
    renderDanFokus(
      function (c) {
        renderOlah(stageId, c);
      },
      container,
      fokus
    );
  };

  var langkahHTML = langkah
    .slice(0, Math.min(aktif + 1, langkah.length))
    .map(function (step, i) {
      return buildLangkahData(C.prefix + i, steps[i], step, i + 1);
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
        data.html +
        (data.siap
          ? '<h3>💡 Apa temuanmu?</h3>' +
            buildGuidedQuizList(C.temuan, State.temuanOrders, State.temuanPilih)
          : '<p class="dl-caption">' + esc(D.belumCukup) + '</p>')
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
            (latihan ? buildDiagramData(latihan, { langkah: latihan.langkah }) : '') +
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

  if (data.bind) data.bind(container, rerender);
  if (data.siap && !temuanOk) {
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
      periksaSoalData
    );
  }
  bindNext(C.prefix + 'NextBtn', stageId, C.next);
}

function renderOlahTabel(container) {
  renderOlah('olahTabel', container);
}

function renderOlahSkala(container) {
  renderOlah('olahSkala', container);
}

function renderOlahBatang(container) {
  renderOlah('olahBatang', container);
}

/* ============================================================
   9. STAGE: VERIFIKASI  (Discovery Learning — sintaks 5)
   A. Data baru acak: prediksi langkah skala, puncak sumbu & banyak
      data, lalu buktikan dengan membuat diagram batangnya
   B. Pernyataan selalu benar / kadang-kadang benar / salah
   C. Dugaan awal & hipotesis dibandingkan dengan temuan
   ============================================================ */

function langkahVerif() {
  var ds = dataVerif() || DATA.verifikasi.bank[0];
  var max = frekuensiTerbesar(ds.frek);
  var saran = skalaDisarankan(max);
  return [
    {
      id: 'vSkala',
      label: esc('Frekuensi terbesar ' + max + '. Langkah skala berapa yang tepat?'),
      cek: { minta: 'skala', max: max },
      placeholder: 'mis. 1',
      hints: [esc('Langkah rapi: 1, 2, 5, 10, 20, … dengan 5–10 garis bantu.')],
      temuan: esc(
        'Langkah tepat: ' +
          langkahSkalaTepat(max)
            .map(function (l) {
              return formatNumber(l);
            })
            .join(' atau ') +
          '.'
      ),
    },
    {
      id: 'vPuncak',
      label: esc('Dengan langkah ' + saran + ', berapa angka teratas sumbu tegak?'),
      cek: { minta: 'puncak', max: max, langkah: saran },
      placeholder: 'mis. 50',
      hints: [esc('Cari kelipatan ' + saran + ' terkecil yang tidak kurang dari ' + max + '.')],
      temuan: esc(
        'Sumbu tegak: 0 sampai ' +
          puncakSumbu(max, saran) +
          ' (' +
          banyakGarisSkala(max, saran) +
          ' garis bantu).'
      ),
    },
    {
      id: 'vTotal',
      label: esc('Berapa banyak data seluruhnya?'),
      cek: { minta: 'total', frek: ds.frek, kategori: ds.kategori },
      placeholder: 'mis. 100',
      hints: [esc('Jumlahkan semua frekuensi pada tabel.')],
      temuan: esc(
        'Banyak data = jumlah frekuensi = ' + formatNumber(totalFrekuensi(ds.frek)) + '.'
      ),
    },
  ];
}

function buildPrediksi(langkah, aktif) {
  var D = DATA.verifikasi;
  var ds = dataVerif();
  var semua = aktif >= langkah.length;
  var cfg = cfgLabVerif();
  var selesai = semua && labBatangSelesai(State.labVerif, cfg);
  return (
    '<div class="dtk-verif">' +
    '<div class="dtk-verif__data"><span class="dtk-verif__ikon" aria-hidden="true">' +
    ds.ikon +
    '</span><strong>' +
    esc(ds.judul) +
    '</strong></div>' +
    buildTabelFrekuensi(ds.kategori, ds.frek, {
      caption: 'Tabel frekuensi ' + ds.nama.toLowerCase(),
      judulKategori: ds.labelX,
      jumlah: false,
    }) +
    '<div class="dl-steps">' +
    langkah
      .slice(0, Math.min(aktif + 1, langkah.length))
      .map(function (step, i) {
        return buildLangkahData('vf' + i, State.verifSteps[i], step, i + 1);
      })
      .join('') +
    '</div>' +
    '</div>' +
    (semua
      ? '<h4>' + esc(D.buktiJudul) + '</h4>' + buildLabBatang('lv', State.labVerif, cfg)
      : '') +
    (selesai ? buildFeedbackBox('success', '✓', esc(D.buktiTeks)) : '')
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
      ? '<div class="dtk-hipotesis">' +
        '<span class="dtk-hipotesis__label">Hipotesismu di tahap 2</span>' +
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
  var cfg = cfgLabVerif();
  var aOk = aktif >= langkah.length && labBatangSelesai(State.labVerif, cfg);
  var bOk = aOk && sortItemsAllAnswered(PERNYATAAN_ITEMS, State.pernyataanStates);
  var rerender = function (fokus) {
    renderDanFokus(renderVerifikasi, container, fokus);
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
      periksaSoalData
    );
  } else {
    bindLabBatang(container, 'lv', State.labVerif, cfg, rerender);
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali temuanmu, lalu pilih potongan lain.</p>'
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
          '<h3 style="margin-top:0;">Rangkuman: menyajikan data kategorik</h3>' +
            '<div class="dtk-galeri">' +
            tabelKantin(KANTIN.judul) +
            buildDiagramData(KANTIN, { nilai: true }) +
            '</div>' +
            buildDaftarBernomor(D.rangkuman),
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
   dipilih acak. Isian diperiksa periksaSoalData sehingga pesan salahnya
   berupa diagnosa miskonsepsi (lupa garis miring turus, jumlah = banyak
   kategori, membaca kotak alih-alih angka skala, skala terlalu rapat/
   renggang/tidak rapi); pilihan ganda memakai opsiSoalData yang setiap
   pengecohnya membawa umpan diagnosa.
   ============================================================ */

/* Gambar pendukung soal uji terap. */
function figurSoal(s) {
  var c = s.cek;
  if (
    c.minta === 'baca' ||
    c.minta === 'selisih' ||
    c.minta === 'terbanyak' ||
    c.minta === 'cacat'
  ) {
    var g = s.diagram || {};
    return buildDiagramData(
      { judul: g.judul, labelX: g.labelX, labelY: g.labelY, kategori: c.kategori, frek: c.frek },
      { langkah: g.langkah, cacat: c.cacat || null }
    );
  }
  return figurLangkah(c);
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
  inputPlaceholder: 'mis. 12',
  inputMode: 'numeric',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  /* Teks mentah diteruskan; isian yang tak terbaca ditolak tanpa dihitung. */
  parseInput: function (val) {
    var p = parseInputInt(val);
    if (p.error === 'empty') return { value: null, error: 'empty' };
    if (p.error || p.value < 0) {
      return { value: null, error: 'invalid', message: DTK_PESAN.format };
    }
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return periksaSoalData(value, s).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' + esc(ex.userInput) + '</strong> — ' + esc(periksaSoalData(ex.userInput, s).pesan)
    );
  },
  revealText: function (s) {
    return 'Jawaban: <strong>' + esc(jawabSoalData(s)) + '</strong>. ' + esc(s.explanation);
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
    return (
      '<div class="dl-prompt">' +
      '<span class="dtk-soal-tag">' +
      buildKonteksTag(s.konteks) +
      (s.type === 'choice' ? ' · Pilihan ganda' : ' · ✏️ Isian') +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
      figurSoal(s) +
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
  var turus = State.labTurus;
  var batang = State.labBatang;
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
    tabel: turus.percobaan - turus.salah + '/' + turus.percobaan,
    diagram: batang.percobaan - batang.salah + '/' + batang.percobaan,
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
        buildRingkasKartu(R.tabel, 'Pemeriksaan tabel frekuensi yang langsung tepat') +
        buildRingkasKartu(R.diagram, 'Pemeriksaan diagram batang yang langsung tepat') +
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
    '<div class="dtk-galeri">' +
    tabelKantin(KANTIN.judul) +
    buildDiagramData(KANTIN, { nilai: true }) +
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
    'Kemampuan murid mengumpulkan data kelasnya sendiri, menyusun tabel frekuensi, dan menggambar diagram batang di kertas berpetak dengan skala yang tepat tetap menjadi bahan penilaian utama. Sebagai tindak lanjut, minta setiap kelompok melakukan survei kecil (mis. hobi, cita-cita, atau kegiatan akhir pekan) lalu menyajikannya di mading kelas.' +
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
  olahTabel: renderOlahTabel,
  olahSkala: renderOlahSkala,
  olahBatang: renderOlahBatang,
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
