'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Keliling & Luas Bangun Datar — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen bersama: buildDiscoveryHead, buildTeacherNote,
       buildTpPanel, buildChoiceGroup, buildSortItems,
       buildGuidedQuizList, buildDlPanel, buildDlNextButton,
       buildFeedbackBox;
     • seksi 68: buildLangkahRasio / bindLangkahRasio (langkah isian
       berdiagnosa, dengan pemeriksa dari step.periksa);
     • seksi 72 (asesmen diagnostik): ensureDiagnostikStates,
       buildAsesmenDiagnostik, ringkasDiagnostik,
       buildRingkasDiagnostik;
     • seksi 73 (bangun datar): BANGUN_DATAR, RUMUS_LUAS,
       kelilingBangun, luasBangun, periksaSoalBangun, opsiSoalBangun,
       siapkanLangkahBangun, buildBangunSVG, serta Lab Bangun
       (buildLabBangun: mode petak & potong-susun).

   Alur tahap: asesmen diagnostik lalu sintaks Discovery Learning;
   lihat komentar kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (butir diagnostik, dugaan
   stimulasi, rumusan masalah, pertanyaan temuan, pemilahan rumus,
   pernyataan verifikasi, bank kesimpulan, opsi uji terap, penilaian
   diri) DIACAK dengan shuffleArray() melalui ensureShuffledOrder() /
   ensureSortStates() / ensureDiagnostikStates(). Pengacakan dilakukan
   SEKALI saat state disiapkan (initExerciseArrays) lalu urutannya
   disimpan di State — bukan saat render — sehingga pilihan tidak
   melompat saat dirender ulang, tetapi teracak ulang untuk setiap murid
   dan setiap Reset. Soal uji terap juga dipilih acak dari bank
   (pilihSoalTerap) dan opsi pilihan gandanya dibangun engine
   (opsiSoalBangun).

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Asesmen Diagnostik
    6. Stage: Stimulasi               (DL sintaks 1)
    7. Stage: Merumuskan Masalah      (DL sintaks 2)
    8. Stage: Lab Petak               (DL sintaks 3)
    9. Stage: Olah Data ×4            (DL sintaks 4)
   10. Stage: Verifikasi              (DL sintaks 5)
   11. Stage: Generalisasi            (DL sintaks 6)
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
var STORAGE_KEY = 'mpi-d-23-1-keliling-luas-v1';
var OLAH_STAGES = ['olahPersegi', 'olahJajar', 'olahTrapesium', 'olahDiagonal'];

/* Gambar bersimbol untuk kartu rumus (verifikasi, rumus olah, selesai). */
var GAMBAR_RUMUS = {
  persegi: { ukuran: { s: 3 }, label: { sisi: [0] } },
  persegiPanjang: { ukuran: { p: 5, l: 3 }, label: { sisi: [0, 1] } },
  segitiga: { ukuran: { a: 6, t: 3, g: 2 }, label: { sisi: [0], tinggi: true } },
  jajargenjang: { ukuran: { a: 5, t: 3, g: 2 }, label: { sisi: [0, 1], tinggi: true } },
  trapesium: { ukuran: { a: 6, b: 3, t: 3, g: 1 }, label: { sisi: [0, 2], tinggi: true } },
  belahKetupat: { ukuran: { d1: 4, d2: 6 }, label: { sisi: [0], diagonal: true } },
  layangLayang: { ukuran: { d1: 4, d2: 6, y: 2 }, label: { sisi: [0, 1], diagonal: true } },
};

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

/* Skala piksel/satuan agar sisi terpanjang bangun ± maksPx. */
function skalaBangun(jenis, ukuran, maksPx) {
  var t = titikBangun(jenis, ukuran);
  var b = kotakBatasBangun([t]);
  var dim = Math.max(b.x1 - b.x0, b.y1 - b.y0, 1);
  return Math.max(3, Math.min(28, Math.floor(maksPx / dim)));
}

/* Gambar bangun berskala otomatis; kisi latar hanya bila petaknya cukup besar. */
function gambarBangun(jenis, ukuran, opts, maksPx) {
  var skala = skalaBangun(jenis, ukuran, maksPx || 180);
  return buildBangunSVG(
    jenis,
    ukuran,
    Object.assign({ skala: skala, grid: skala >= 10 }, opts || {})
  );
}

function gambarRumus(jenis, maksPx) {
  var G = GAMBAR_RUMUS[jenis];
  return gambarBangun(
    jenis,
    G.ukuran,
    {
      simbol: true,
      label: G.label,
      aria: BANGUN_DATAR[jenis].nama + ' dengan label ukurannya',
    },
    maksPx || 140
  );
}

/* Label konteks: ikon + nama (Taman, Rumah, …). */
function buildKonteksTag(konteks) {
  var K = DATA.konteks[konteks];
  return (
    '<span class="bd-konteks bd-konteks--' +
    konteks +
    '"><span aria-hidden="true">' +
    K.ikon +
    '</span> ' +
    esc(K.nama) +
    '</span>'
  );
}

var DIAG = DATA.diagnostik;
var DIAG_ITEMS = DIAG.butir.map(function (b) {
  return {
    id: b.id,
    indikator: b.indikator,
    tanya: esc(b.tanya),
    opsi: opsiAman(b.opsi),
    correct: b.correct,
    pembahasan: esc(b.pembahasan),
    gambar: b.gambar,
  };
});

var DUGAAN = DATA.stimulasi.dugaan.map(siapkanGuided);
var MASALAH_OPSI = opsiAman(DATA.masalah.opsi);

/* Konfigurasi tiap tahap olah data: pertanyaan temuan & langkah isian. */
var OLAH = {};
OLAH_STAGES.forEach(function (id, i) {
  var D = DATA[id];
  OLAH[id] = {
    prefix: ['op', 'oj', 'ot', 'od'][i],
    temuan: D.temuan.map(siapkanGuided),
    langkah: D.langkah.map(function (s) {
      return siapkanLangkahBangun(
        Object.assign({}, s, {
          label: esc(s.label),
          hints: (s.hints || []).map(esc),
          temuan: esc(s.temuan),
          placeholder: 'mis. 24',
        })
      );
    }),
    next: STAGES[STAGES.indexOf(id) + 1],
  };
});

var SEMUA_TEMUAN = OLAH_STAGES.reduce(function (acc, id) {
  return acc.concat(OLAH[id].temuan);
}, []);

/* Kategori pemilahan = rumus luas, berlabel dari engine. */
var KATEGORI_RUMUS = DATA.verifikasi.kategori.map(function (id) {
  return { id: id, label: esc(RUMUS_LUAS[id].label) };
});

/* Butir pemilahan rumus { id, teks, correct, explanation, sumber }. */
var RUMUS_ITEMS = DATA.verifikasi.bangun.map(function (b) {
  return {
    id: b.id,
    teks: esc(b.teks),
    correct: BANGUN_DATAR[b.jenis].rumusLuas,
    explanation: esc(b.explanation),
    sumber: b,
  };
});

var PERNYATAAN_ITEMS = DATA.verifikasi.pernyataan.map(function (p) {
  return { id: p.id, teks: esc(p.teks), correct: p.correct, explanation: esc(p.explanation) };
});

/* Soal pilihan ganda uji terap: opsi dibangun engine (opsiSoalBangun). */
var OPSI_TERAP = {};
DATA.terapkan.soal.forEach(function (s) {
  if (s.type !== 'choice') return;
  var opsi = opsiSoalBangun(s);
  OPSI_TERAP[s.id] = opsi;
  s.options = opsiAman(opsi);
  s.correct = 'baku';
});

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'diagnostik',
  completedStages: {},

  /* Tahap 0 — asesmen diagnostik */
  diagnostikStates: {},

  /* Tahap 1 — stimulasi */
  dugaanOrders: {},
  dugaanPilih: {},
  stimulasiAlasan: '',

  /* Tahap 2 — merumuskan masalah */
  masalahOrder: null,
  masalahPilihan: null,
  hipotesisTeks: '',

  /* Tahap 3 — Lab Petak */
  labPetak: null,

  /* Tahap 4a–d — olah data */
  labPotong: {},
  temuanOrders: {},
  temuanPilih: {},
  langkahSteps: {},

  /* Tahap 5 — verifikasi */
  rumusStates: {},
  rumusOrder: null,
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

/*
 * Menyiapkan seluruh state per-langkah DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 0 */
  ensureDiagnostikStates(State, 'diagnostikStates', DIAG_ITEMS);

  /* Tahap 1–2 */
  ensureListOrders('dugaanOrders', DATA.stimulasi.dugaan);
  ensureMap('dugaanPilih');
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  ensureLabBangun(ensureMap('labPetak'), DATA.koleksi.lab);

  /* Tahap 4a–d */
  var potong = ensureMap('labPotong');
  var langkah = ensureMap('langkahSteps');
  OLAH_STAGES.forEach(function (id) {
    if (DATA[id].lab) {
      if (!potong[id] || typeof potong[id] !== 'object') potong[id] = {};
      ensureLabBangun(potong[id], DATA[id].lab);
    }
    ensureExerciseArray(langkah, id, OLAH[id].langkah, makeCekStep);
  });
  ensureListOrders('temuanOrders', SEMUA_TEMUAN);
  ensureMap('temuanPilih');

  /* Tahap 5 */
  ensureSortStates(State, 'rumusStates', 'rumusOrder', RUMUS_ITEMS, KATEGORI_RUMUS);
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

/* Kartu rumus keliling & luas satu bangun, dengan gambar bersimbol. */
function buildKartuRumus(jenis) {
  var B = BANGUN_DATAR[jenis];
  return (
    '<div class="formula-card bd-rumus">' +
    '<span class="formula-card__label"><span aria-hidden="true">' +
    B.ikon +
    '</span> ' +
    esc(B.nama) +
    '</span>' +
    gambarRumus(jenis) +
    '<span class="bd-rumus__baris">' +
    esc(B.rumusKeliling) +
    '</span>' +
    '<strong class="bd-rumus__baris">' +
    esc(RUMUS_LUAS[B.rumusLuas].label) +
    '</strong>' +
    '</div>'
  );
}

function buildGridRumus(list) {
  return '<div class="bd-rumus-grid">' + list.map(buildKartuRumus).join('') + '</div>';
}

/* ============================================================
   5. STAGE: ASESMEN DIAGNOSTIK
   Butir prasyarat sekali-jawab berpembahasan, lalu profil kesiapan.
   Tidak dinilai; menjadi bahan diferensiasi guru.
   ============================================================ */

function visualDiagnostik(it) {
  var g = it.gambar;
  if (!g) return '';
  return gambarBangun(
    g.jenis,
    g.ukuran,
    { label: g.label, petak: g.petak, satuan: g.satuan, aria: g.aria },
    150
  );
}

function renderDiagnostik(container) {
  var D = DIAG;
  var states = State.diagnostikStates;
  var selesai = diagnostikSelesai(DIAG_ITEMS, states);

  container.innerHTML =
    '<section aria-label="Asesmen Diagnostik">' +
    buildHead(D) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🧭 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        buildAsesmenDiagnostik(DIAG_ITEMS, states, { visual: visualDiagnostik })
    ) +
    (selesai
      ? buildDlPanel(
          buildRingkasDiagnostik(ringkasDiagnostik(DIAG_ITEMS, states, D.indikator), {
            pesan: D.pesan,
          })
        ) + buildDlNextButton('diagnostikNextBtn', D.nextLabel)
      : '<p class="dl-caption" style="text-align:right;">Jawab semua butir untuk melihat profil kesiapanmu.</p>') +
    '</section>';

  bindAsesmenDiagnostik(container, DIAG_ITEMS, states, saveState, function () {
    renderDiagnostik(container);
  });
  bindNext('diagnostikNextBtn', 'diagnostik', 'stimulasi');
}

/* ============================================================
   6. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati denah taman dan MENDUGA pagar & rumput. Tidak dinilai.
   ============================================================ */

function buildPetakKartu(p) {
  var B = BANGUN_DATAR[p.jenis];
  return (
    '<figure class="bd-petak">' +
    gambarBangun(p.jenis, p.ukuran, { label: p.label, satuan: 'm' }, 150) +
    '<figcaption><strong>' +
    esc(p.nama) +
    '</strong><span>' +
    B.ikon +
    ' ' +
    esc(B.nama) +
    '</span></figcaption>' +
    '</figure>'
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
      '<h2 style="margin-top:0;">🌳 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="bd-denah" role="list" aria-label="Denah petak taman">' +
        D.petak
          .map(function (p) {
            return '<div role="listitem">' + buildPetakKartu(p) + '</div>';
          })
          .join('') +
        '</div>',
      'panel--hero'
    ) +
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
      showNotice('Pilih dugaanmu untuk semua pertanyaan sebelum melanjutkan.');
      return;
    }
    completeStage('stimulasi');
    navigateTo('masalah');
  });
}

/* ============================================================
   7. STAGE: MERUMUSKAN MASALAH  (Discovery Learning — sintaks 2)
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
   8. STAGE: LAB PETAK  (Discovery Learning — sintaks 3)
   Murid mengatur ukuran persegi panjang & persegi, menghitung petak
   dan ruas satuan, lalu mencatat keliling & luas.
   ============================================================ */

function buildTips(tips) {
  return (
    '<details class="bd-tips"><summary>💡 Tips menghitung</summary>' +
    '<ul>' +
    tips
      .map(function (t) {
        return '<li>' + esc(t) + '</li>';
      })
      .join('') +
    '</ul></details>'
  );
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var lab = State.labPetak;
  var lengkap = labBangunLengkap(lab, D.lab);

  container.innerHTML =
    '<section aria-label="Lab Petak">' +
    buildHead(D) +
    buildPengantar(D.pengantar) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🔬 Lab Petak</h3>' +
        buildTips(D.tips) +
        buildLabBangun('lp', lab, D.lab)
    ) +
    (lengkap
      ? buildDlPanel(buildFeedbackBox('success', '✓', esc(D.selesaiTeks))) +
        buildDlNextButton('koleksiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindLabBangun(container, 'lp', lab, D.lab, function () {
    saveState();
    renderKoleksi(container);
  });
  bindNext('koleksiNextBtn', 'koleksi', 'olahPersegi');
}

/* ============================================================
   9. STAGE: OLAH DATA  (Discovery Learning — sintaks 4a–4d)
   (Lab Potong-Susun | catatan Lab Petak) → pertanyaan temuan →
   langkah isian berdiagnosa → kartu rumus. Keempat tahap memakai
   satu renderer.
   ============================================================ */

/* Tabel catatan Lab Petak (persegi panjang & persegi) milik murid. */
function buildCatatanPetak() {
  var L = DATA.koleksi.lab;
  var baris = [];
  L.jenisList.forEach(function (j) {
    State.labPetak.catat[j].forEach(function (c) {
      var p = j === 'persegi' ? c.ukuran.s : c.ukuran.p;
      var l = j === 'persegi' ? c.ukuran.s : c.ukuran.l;
      baris.push(
        '<tr><th scope="row">' +
          esc(BANGUN_DATAR[j].nama) +
          '</th><td>' +
          p +
          '</td><td>' +
          l +
          '</td><td>' +
          fmtBangun(c.nilai.keliling) +
          '</td><td>' +
          fmtBangun(c.nilai.luas) +
          '</td></tr>'
      );
    });
  });
  return (
    '<div class="lab-bangun__catat">' +
    '<table class="data-table lab-bangun__tabel">' +
    '<caption>Catatanmu dari Lab Petak</caption>' +
    '<thead><tr><th scope="col">Bangun</th><th scope="col">Panjang (p)</th>' +
    '<th scope="col">Lebar (l)</th><th scope="col">Keliling (satuan)</th>' +
    '<th scope="col">Luas (petak)</th></tr></thead><tbody>' +
    baris.join('') +
    '</tbody></table></div>'
  );
}

function renderOlah(stageId, container) {
  var D = DATA[stageId];
  var C = OLAH[stageId];
  var lab = State.labPotong[stageId];
  var steps = State.langkahSteps[stageId];
  var labOk = D.lab ? labBangunLengkap(lab, D.lab) : true;
  var temuanOk = labOk && guidedQuizAllCorrect(C.temuan, State.temuanPilih);
  var aktif = langkahAktif(steps);
  var langkahOk = temuanOk && aktif >= C.langkah.length;
  var rerender = function () {
    renderOlah(stageId, container);
  };

  var langkahHTML = C.langkah
    .slice(0, Math.min(aktif + 1, C.langkah.length))
    .map(function (step, i) {
      return buildLangkahRasio(C.prefix + i, steps[i], step, i + 1);
    })
    .join('');

  container.innerHTML =
    '<section aria-label="' +
    esc(D.kicker) +
    '">' +
    buildHead(D) +
    buildPengantar(D.pengantar) +
    buildDlPanel(
      D.lab
        ? '<h3 style="margin-top:0;">✂️ Lab Potong-Susun</h3>' +
            buildLabBangun(C.prefix + 'Lab', lab, D.lab)
        : '<h3 style="margin-top:0;">📋 Data dari Lab Petak</h3>' + buildCatatanPetak()
    ) +
    (labOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">💡 Apa temuanmu?</h3>' +
            buildGuidedQuizList(C.temuan, State.temuanOrders, State.temuanPilih)
        )
      : '') +
    (temuanOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🌳 Terapkan di taman sekolah</h3>' +
            '<div class="dl-steps">' +
            langkahHTML +
            '</div>'
        )
      : '') +
    (langkahOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📝 Rumus yang kamu temukan</h3>' + buildGridRumus(D.rumus),
          'panel--hero'
        ) + buildDlNextButton(C.prefix + 'NextBtn', D.nextLabel)
      : '') +
    '</section>';

  if (D.lab) {
    bindLabBangun(container, C.prefix + 'Lab', lab, D.lab, function () {
      saveState();
      rerender();
    });
  }
  if (labOk && !temuanOk) {
    bindGuidedQuizList(container, C.temuan, State.temuanPilih, saveState, rerender);
  }
  if (temuanOk && !langkahOk) {
    bindLangkahRasio(C.prefix + aktif, steps[aktif], C.langkah[aktif], saveState, rerender);
  }
  bindNext(C.prefix + 'NextBtn', stageId, C.next);
}

function renderOlahPersegi(container) {
  renderOlah('olahPersegi', container);
}

function renderOlahJajar(container) {
  renderOlah('olahJajar', container);
}

function renderOlahTrapesium(container) {
  renderOlah('olahTrapesium', container);
}

function renderOlahDiagonal(container) {
  renderOlah('olahDiagonal', container);
}

/* ============================================================
   10. STAGE: VERIFIKASI  (Discovery Learning — sintaks 5)
   A. Pilah rumus luas tujuh bangun baru
   B. Pernyataan benar / salah / kadang-kadang benar
   C. Dugaan awal & hipotesis dibandingkan dengan data
   ============================================================ */

function visualRumus(it) {
  var b = it.sumber;
  return gambarBangun(
    b.jenis,
    b.ukuran,
    {
      simbol: true,
      label: GAMBAR_RUMUS[b.jenis].label,
      aria: 'Gambar ' + it.teks.toLowerCase(),
    },
    130
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
    '<span>Data: <strong>' +
    findOptionLabel(q.opsi, q.baku) +
    '</strong> — ' +
    esc(q.pembahasan) +
    '</span>' +
    '<span class="dugaan-row__verdict">' +
    (cocok ? '✓ Dugaanmu didukung data!' : '↻ Dugaanmu dikoreksi oleh data') +
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
      ? '<div class="bd-hipotesis">' +
        '<span class="bd-hipotesis__label">Hipotesismu di tahap 2</span>' +
        '<p>' +
        esc(State.hipotesisTeks) +
        '</p>' +
        '<span class="dl-caption">Apakah hipotesismu didukung data, perlu diperbaiki, atau ditolak? Diskusikan dengan pasanganmu.</span>' +
        '</div>'
      : '')
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var aOk = sortItemsAllAnswered(RUMUS_ITEMS, State.rumusStates);
  var bOk = sortItemsAllAnswered(PERNYATAAN_ITEMS, State.pernyataanStates);
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
        buildSortItems(RUMUS_ITEMS, State.rumusOrder, KATEGORI_RUMUS, State.rumusStates, {
          visual: visualRumus,
        })
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
    (aOk && bOk
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' + esc(D.judulC) + '</h3>' + buildDugaanBanding()
        ) + buildDlNextButton('verifikasiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, RUMUS_ITEMS, State.rumusStates, saveState, rerender);
  if (aOk) bindSortItems(container, PERNYATAAN_ITEMS, State.pernyataanStates, saveState, rerender);
  bindNext('verifikasiNextBtn', 'verifikasi', 'generalisasi');
}

/* ============================================================
   11. STAGE: GENERALISASI  (Discovery Learning — sintaks 6)
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali hasil Lab Petak dan Lab Potong-Susun, lalu pilih potongan lain.</p>'
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
          '<h3 style="margin-top:0;">Rangkuman Keliling & Luas Bangun Datar</h3>' +
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
   12. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal TERAP_SOAL yang
   dipilih acak. Isian diperiksa periksaSoalBangun sehingga pesan
   salahnya berupa diagnosa miskonsepsi; pilihan ganda memakai
   opsiSoalBangun yang setiap pengecohnya membawa umpan diagnosa.
   ============================================================ */

/* Gambar soal: bangun berlabel ukuran, atau bersimbol untuk soal rumus. */
function gambarSoal(s) {
  var aria = 'Gambar ' + BANGUN_DATAR[s.cek.jenis].nama.toLowerCase() + ' pada soal';
  if (s.cek.minta === 'rumus') {
    return gambarBangun(
      s.cek.jenis,
      s.gambar.ukuran,
      { simbol: true, label: s.gambar.label, aria: aria },
      150
    );
  }
  return gambarBangun(
    s.cek.jenis,
    s.cek.ukuran,
    { label: s.label, satuan: s.satuan, aria: aria },
    150
  );
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
  inputPlaceholder: 'mis. 24',
  inputMode: 'decimal',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  inputSuffix: function (s) {
    var sat = satuanJawabBangun(s.cek.minta, s.satuan);
    return sat ? '<span class="bbk-satuan">' + esc(sat) + '</span>' : '';
  },
  /* Teks mentah diteruskan; isian yang tak terbaca ditolak tanpa dihitung. */
  parseInput: function (val) {
    if (!val || !String(val).trim()) return { value: null, error: 'empty' };
    var d = periksaSoalBangun(val, TERAP_SOAL[State.terapkanIdx]);
    if (d.kode === 'format') {
      return { value: null, error: 'invalid', message: d.pesan };
    }
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return periksaSoalBangun(value, s).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' +
      esc(ex.userInput) +
      '</strong> — ' +
      esc(periksaSoalBangun(ex.userInput, s).pesan)
    );
  },
  revealText: function (s) {
    return esc(s.reveal) + ' ' + esc(s.explanation);
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
      '<span class="bbk-soal-tag">' +
      buildKonteksTag(s.konteks) +
      (s.type === 'choice' ? ' · Pilihan ganda' : ' · ✏️ Isian') +
      '</span>' +
      '<div class="bd-soal-gambar">' +
      gambarSoal(s) +
      '</div>' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
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
   13. STAGE: REFLEKSI
   ============================================================ */

function hitungRekap() {
  var langkah = [];
  OLAH_STAGES.forEach(function (id) {
    langkah = langkah.concat(State.langkahSteps[id]);
  });
  var diag = ringkasDiagnostik(DIAG_ITEMS, State.diagnostikStates, DIAG.indikator);
  return {
    diagnostik: diag.benar + '/' + diag.total,
    langkah:
      langkah.filter(function (s) {
        return s.done && s.attempts === 1;
      }).length +
      '/' +
      langkah.length,
    pilah:
      sortItemsCorrectCount(RUMUS_ITEMS, State.rumusStates) +
      sortItemsCorrectCount(PERNYATAAN_ITEMS, State.pernyataanStates) +
      '/' +
      (RUMUS_ITEMS.length + PERNYATAAN_ITEMS.length),
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
        buildRingkasKartu(R.diagnostik, 'Butir asesmen diagnostik tepat (bekal awal)') +
        buildRingkasKartu(R.langkah, 'Perhitungan taman tepat pada percobaan pertama') +
        buildRingkasKartu(R.pilah, 'Pemilahan rumus & pernyataan benar') +
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
    buildGridRumus(D.contoh) +
    '<div class="panel panel--hero done-card__list">' +
    '<h3 style="margin-top:0;">Yang sudah kamu capai</h3>' +
    buildDaftarBernomor(D.capaian) +
    '</div>' +
    '<div class="feedback-box feedback-box--info done-card__note">' +
    '<span class="feedback-box__icon">📌</span>' +
    '<div class="feedback-box__body">' +
    '<strong>Catatan untuk Guru:</strong><br>' +
    'Rekap pada tahap Refleksi adalah indikator latihan digital, bukan nilai akhir. ' +
    'Bandingkan profil asesmen diagnostik dengan hasil uji terap untuk melihat perkembangan murid; kemampuan menjelaskan asal rumus lewat potong-susun tetap menjadi bahan penilaian utama.' +
    '</div></div>' +
    '<div class="btn-group btn-group--center">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '<button type="button" class="btn btn--outline-primary" id="reviewBtn">Tinjau Ulang</button>' +
    '</div>' +
    '</div>' +
    '</section>';

  completeStage('selesai');

  document.getElementById('reviewBtn').addEventListener('click', function () {
    navigateTo('diagnostik');
  });
}

/* ============================================================
   15. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  diagnostik: renderDiagnostik,
  stimulasi: renderStimulasi,
  masalah: renderMasalah,
  koleksi: renderKoleksi,
  olahPersegi: renderOlahPersegi,
  olahJajar: renderOlahJajar,
  olahTrapesium: renderOlahTrapesium,
  olahDiagonal: renderOlahDiagonal,
  verifikasi: renderVerifikasi,
  generalisasi: renderGeneralisasi,
  terapkan: renderTerapkan,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  var fn = RENDERERS[State.currentStage] || renderDiagnostik;
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
  if (STAGES.indexOf(State.currentStage) === -1) State.currentStage = 'diagnostik';
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
      navigateTo('diagnostik');
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
