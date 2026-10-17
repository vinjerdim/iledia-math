'use strict';

/* ============================================================
   app.js — Logika media pembelajaran
   Relasi antara Dua Himpunan dalam Kehidupan Sehari-hari
   Fase D — SMP Kelas VIII · Topik 14 Relasi dan Fungsi,
   Discovery Learning

   Struktur:
     1. Konstanta
     2. State & storage (+ pengacakan semua pilihan jawaban)
     3. Navigasi
     4. Utilitas render (+ tugas relasi: panah / tabel / chip)
     5–13. Renderer tiap tahap
     14. Router render
     15. Modal reset
     16. Init

   Seluruh komponen umum berasal dari shared/engine.js: diagram panah,
   tabel silang, tabel daftar, chip pasangan berurutan, diagnosa &
   pesan diagnosa relasi (seksi 25), serta pilihan acak, pertanyaan
   penuntun, pemilahan, dan petunjuk berjenjang.

   Seluruh pilihan jawaban DIACAK sekali saat state disiapkan
   (initExerciseArrays) lalu urutannya disimpan di State, sehingga
   stabil saat dirender ulang tetapi teracak ulang setiap Reset.
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'kumpul',
  'olah',
  'verifikasi',
  'generalisasi',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Stimulasi',
  'Masalah',
  'Data',
  'Olah Data',
  'Pembuktian',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-14-1-relasi-v1';

/* Relasi lab = himpunan lab + aturan ke-i. */
function relasiLab(r) {
  var L = DATA.verifikasi.lab;
  return {
    labelA: L.labelA,
    labelB: L.labelB,
    A: L.A,
    B: L.B,
    namaRelasi: r.namaRelasi,
    pasangan: r.pasangan,
    hints: r.hints,
    temuan: r.temuan,
  };
}

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'stimulasi',
  completedStages: {},

  /* Tahap 1 — stimulasi (dugaan, tidak dinilai) */
  stimulasiOrder: null,
  stimulasiPilihan: null,
  stimulasiAlasan: '',

  /* Tahap 2 — identifikasi masalah */
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',

  /* Tahap 3 — pengumpulan data (tugas relasi) */
  relEkskul: null,
  relKota: null,
  relBilangan: null,

  /* Tahap 4 — olah data */
  olahOrders: {},
  olahPilih: {},

  /* Tahap 5 — pembuktian */
  lab: {},
  verifPilahStates: {},
  verifPilahOrder: null,

  /* Tahap 6 — menarik kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 7 — uji terap */
  terapkanIdx: 0,
  terapkanSoal: [],

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

function isObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function ensureObject(target, key) {
  if (!isObject(target[key])) target[key] = {};
}

/*
 * State satu tugas relasi. pairs & selected dipakai diagram panah dan
 * tabel silang (lihat ketukDiagramPanah), terpilih & chipOrder dipakai
 * chip pasangan berurutan.
 */
function makeRelTask() {
  return {
    pairs: [],
    selected: null,
    terpilih: [],
    chipOrder: null,
    checked: false,
    tepat: false,
    revealed: false,
    attempts: 0,
    hintLevel: 0,
  };
}

/* Memulihkan state tugas dari storage; pasangan di luar A/B dibuang. */
function ensureRelTask(holder, key, R) {
  if (!isObject(holder[key])) holder[key] = makeRelTask();
  var st = holder[key];
  var awal = makeRelTask();
  Object.keys(awal).forEach(function (k) {
    if (st[k] === undefined) st[k] = awal[k];
  });
  if (!Array.isArray(st.pairs)) st.pairs = [];
  st.pairs = st.pairs.filter(function (p) {
    return Array.isArray(p) && R.A.indexOf(p[0]) !== -1 && R.B.indexOf(p[1]) !== -1;
  });
  if (!(st.selected >= 0 && st.selected < R.A.length)) st.selected = null;
  if (!Array.isArray(st.terpilih)) st.terpilih = [];
  if (R.chips) {
    var chipIds = optionIds(R.chips);
    st.terpilih = st.terpilih.filter(function (id) {
      return chipIds.indexOf(id) !== -1;
    });
    ensureShuffledOrder(st, 'chipOrder', R.chips);
  }
  return st;
}

/*
 * Menyiapkan seluruh state per-soal DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset, sehingga urutan stabil lintas reload tetapi
 * teracak ulang setiap Reset.
 */
function initExerciseArrays() {
  ['olahOrders', 'olahPilih', 'lab', 'simpulanPilihan', 'refleksiAnswers'].forEach(function (k) {
    ensureObject(State, k);
  });

  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'stimulasiOrder', DATA.stimulasi.opsi);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  ensureRelTask(State, 'relEkskul', DATA.kumpul.ekskul);
  ensureRelTask(State, 'relKota', DATA.kumpul.kota);
  ensureRelTask(State, 'relBilangan', DATA.kumpul.bilangan);

  /* Tahap 4 */
  DATA.olah.pertanyaan.forEach(function (q) {
    ensureShuffledOrder(State.olahOrders, q.id, q.opsi);
  });

  /* Tahap 5 */
  DATA.verifikasi.lab.aturan.forEach(function (r) {
    ensureRelTask(State.lab, r.id, relasiLab(r));
  });
  ensureSortStates(
    State,
    'verifPilahStates',
    'verifPilahOrder',
    DATA.verifikasi.pilah,
    DATA.verifikasi.opsiPilah
  );

  /* Tahap 6 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);

  /* Tahap 7 — urutan opsi pilihan ganda & chip diacak per soal */
  ensureExerciseArray(State, 'terapkanSoal', DATA.terapkan.soal, function (s) {
    var st = makeRelTask();
    st.chosen = null;
    st.pilihSalah = 0;
    st.optionOrder = s.opsi ? shuffleArray(optionIds(s.opsi)) : null;
    return st;
  });
  DATA.terapkan.soal.forEach(function (s, i) {
    var st = ensureRelTask(State.terapkanSoal, i, s);
    if (s.opsi) ensureShuffledOrder(st, 'optionOrder', s.opsi);
  });
  if (State.terapkanIdx >= DATA.terapkan.soal.length || State.terapkanIdx < 0) {
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

/* Pertanyaan penuntun bertahap: berikutnya muncul setelah sebelumnya benar. */
function guidedVisible(list, pilih) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    out.push(list[i]);
    if (pilih[list[i].id] !== list[i].correct) break;
  }
  return out;
}

function buildIstilahGrid(list) {
  return (
    '<div class="formula-duo rls-istilah">' +
    list
      .map(function (r) {
        return (
          '<div class="formula-card"><span class="formula-card__label">' +
          esc(r.label) +
          '</span>' +
          esc(r.teks) +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
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
    esc(value) +
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

/* Dua himpunan sebagai notasi, mis. Murid = {Nadia, …}. */
function buildHimpunan(R) {
  return (
    '<div class="rls-himpunan">' +
    '<p class="rls-himpunan__a"><strong>' +
    esc(R.labelA) +
    '</strong> = ' +
    esc(formatHimpunan(R.A)) +
    '</p>' +
    '<p class="rls-himpunan__b"><strong>' +
    esc(R.labelB) +
    '</strong> = ' +
    esc(formatHimpunan(R.B)) +
    '</p>' +
    '</div>'
  );
}

/* Kartu cerita [{ a, teks }] sebagai sumber data. */
function buildKartuCerita(cerita) {
  return (
    '<ul class="rls-cerita">' +
    cerita
      .map(function (c) {
        return '<li class="rls-cerita__item">' + esc(c.teks) + '</li>';
      })
      .join('') +
    '</ul>'
  );
}

function buildPasanganBox(R) {
  return (
    '<p class="rls-pasangan">' +
    esc(formatRelasiPasangan(normalisasiRelasi(R.pasangan, R.A, R.B))) +
    '</p>'
  );
}

function optsRelasi(R) {
  return { labelA: R.labelA, labelB: R.labelB, namaRelasi: R.namaRelasi };
}

/* ------------------------------------------------------------
   Tugas relasi: kind 'panah' | 'tabel' | 'chips'.
   R = { labelA, labelB, namaRelasi, A, B, pasangan, chips?, hints }.
   ------------------------------------------------------------ */

function jawabanTask(kind, R, st) {
  if (kind !== 'chips') return st.pairs;
  return R.chips
    .filter(function (c) {
      return st.terpilih.indexOf(c.id) !== -1;
    })
    .map(function (c) {
      return [c.a, c.b];
    });
}

function chipBenarIds(R) {
  return R.chips
    .filter(function (c) {
      return adaPasangan(R.pasangan, c.a, c.b);
    })
    .map(function (c) {
      return c.id;
    });
}

function taskSelesai(st) {
  return st.tepat || st.revealed;
}

function buildStatusPanah(R, st) {
  var teks =
    st.selected === null
      ? 'Ketuk satu anggota ' + R.labelA + ' untuk mulai menarik panah.'
      : 'Terpilih: ' +
        R.A[st.selected] +
        '. Ketuk anggota ' +
        R.labelB +
        ' untuk menarik atau menghapus panah, atau ketuk ' +
        R.A[st.selected] +
        ' lagi untuk selesai.';
  return '<p class="rel-status" aria-live="polite">' + esc(teks) + '</p>';
}

/*
 * opts.reveal    true → tombol "Lihat Jawaban" setelah 2 kali periksa
 * opts.selesai   HTML umpan balik saat tugas selesai (tepat/dilihat)
 */
function buildTask(id, kind, R, st, opts) {
  opts = opts || {};
  var selesai = taskSelesai(st);
  var jawab = selesai ? R.pasangan : jawabanTask(kind, R, st);
  var d = st.checked && !selesai ? diagnosaRelasi(R.pasangan, jawab) : null;
  var salah = d ? d.lebih.concat(d.terbalik) : [];
  var board = '';

  if (kind === 'panah') {
    board =
      buildArrowDiagram(
        id,
        R.A,
        R.B,
        jawab,
        Object.assign(optsRelasi(R), {
          interactive: !selesai,
          selected: selesai ? null : st.selected,
          salah: salah,
        })
      ) + (selesai ? '' : buildStatusPanah(R, st));
  } else if (kind === 'tabel') {
    board = buildRelationTable(id, R.A, R.B, jawab, {
      labelA: R.labelA,
      labelB: R.labelB,
      interactive: !selesai,
      salah: salah,
      caption: 'Relasi “' + R.namaRelasi + '”',
    });
  } else {
    var benar = chipBenarIds(R);
    board = buildPairChips(id, R.chips, st.chipOrder, selesai ? benar : st.terpilih, {
      periksa: st.checked || selesai,
      benar: benar,
      terlewat: selesai,
      locked: selesai,
    });
  }

  if (selesai) return board + (opts.selesai || '');

  return (
    board +
    '<div class="dl-input-row">' +
    '<button type="button" class="btn btn--primary" id="' +
    id +
    '-cek">Periksa</button>' +
    buildHintToggle(id + '-hint', R.hints, st.hintLevel) +
    (opts.reveal && st.attempts >= 2
      ? '<button type="button" class="btn btn--ghost btn--small" id="' +
        id +
        '-lihat">Lihat Jawaban</button>'
      : '') +
    '</div>' +
    (d
      ? '<div class="rls-diagnosa">' +
        pesanDiagnosaRelasi(d, { namaRelasi: R.namaRelasi })
          .map(function (m) {
            return buildFeedbackBox('warning', '💭', esc(m));
          })
          .join('') +
        '</div>'
      : '') +
    buildHintStack(R.hints, st.hintLevel)
  );
}

function bindTask(root, id, kind, R, st, rerender) {
  if (taskSelesai(st)) return;
  function ubah(hasil) {
    if (hasil === 'perluPilih') {
      showNotice('Ketuk anggota ' + R.labelA + ' lebih dulu, baru anggota ' + R.labelB + '.');
    }
    if (hasil === 'tambah' || hasil === 'hapus' || kind !== 'panah') st.checked = false;
    saveState();
    rerender();
  }
  if (kind === 'panah') bindArrowDiagram(root, id, R.A, R.B, st, ubah);
  else if (kind === 'tabel') bindRelationTable(root, id, R.A, R.B, st, ubah);
  else bindPairChips(root, id, st, ubah);

  var cek = document.getElementById(id + '-cek');
  if (cek) {
    cek.addEventListener('click', function () {
      if (!jawabanTask(kind, R, st).length) {
        showNotice(
          kind === 'chips'
            ? 'Pilih sedikitnya satu pasangan berurutan.'
            : kind === 'tabel'
            ? 'Centang sedikitnya satu sel tabel.'
            : 'Tarik sedikitnya satu panah.'
        );
        return;
      }
      st.attempts += 1;
      st.checked = true;
      st.tepat = diagnosaRelasi(R.pasangan, jawabanTask(kind, R, st)).tepat;
      if (st.tepat) st.selected = null;
      else showNotice('Belum tepat. Baca umpan baliknya.');
      saveState();
      rerender();
    });
  }
  var hint = document.getElementById(id + '-hint');
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = Math.min(st.hintLevel + 1, R.hints.length);
      saveState();
      rerender();
    });
  }
  var lihat = document.getElementById(id + '-lihat');
  if (lihat) {
    lihat.addEventListener('click', function () {
      st.revealed = true;
      st.selected = null;
      saveState();
      rerender();
    });
  }
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   ============================================================ */

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var R = DATA.kumpul.ekskul;
  var terisi = !!State.stimulasiPilihan;

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">📌 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        buildKartuCerita(R.cerita) +
        buildHimpunan(R),
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.stimulasiOrder, { chosen: State.stimulasiPilihan }) +
        '<div style="margin-top:var(--space-5);">' +
        buildTextarea(
          'stimulasiAlasan',
          D.alasanLabel,
          D.alasanPlaceholder,
          State.stimulasiAlasan
        ) +
        '</div>' +
        buildFeedbackBox('info', '🔎', esc(D.catatan))
    ) +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="stimulasiNextBtn"' +
    (terisi ? '' : ' disabled') +
    '>' +
    esc(D.nextLabel) +
    '</button>' +
    '</div>' +
    '</section>';

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.stimulasiPilihan = btn.dataset.optId;
      saveState();
      renderStimulasi(container);
    });
  });

  bindTextarea('stimulasiAlasan', 'stimulasiAlasan');

  document.getElementById('stimulasiNextBtn').addEventListener('click', function () {
    if (!State.stimulasiPilihan) {
      showNotice('Pilih dugaanmu sebelum melanjutkan.');
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
          buildTextarea(
            'masalahHipotesis',
            D.hipotesisLabel,
            D.hipotesisPlaceholder,
            State.masalahHipotesis
          )
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

  bindTextarea('masalahHipotesis', 'masalahHipotesis');

  var nextBtn = document.getElementById('masalahNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.masalahHipotesis.trim()) {
        showNotice('Tulis hipotesismu lebih dulu, walau hanya satu kalimat.');
        return;
      }
      completeStage('masalah');
      navigateTo('kumpul');
    });
  }
}

/* ============================================================
   7. STAGE: PENGUMPULAN DATA  (Discovery Learning — sintaks 3)
   A: diagram panah. B: tabel silang. C: chip pasangan berurutan.
   Bagian berikutnya terbuka setelah bagian sebelumnya tepat.
   ============================================================ */

var TUGAS_KUMPUL = [
  { key: 'relEkskul', data: 'ekskul', kind: 'panah', judul: 'judulA', instruksi: 'instruksiA' },
  { key: 'relKota', data: 'kota', kind: 'tabel', judul: 'judulB', instruksi: 'instruksiB' },
  {
    key: 'relBilangan',
    data: 'bilangan',
    kind: 'chips',
    judul: 'judulC',
    instruksi: 'instruksiC',
  },
];

function renderKumpul(container) {
  var D = DATA.kumpul;
  var html = '';
  var semua = true;

  for (var i = 0; i < TUGAS_KUMPUL.length; i++) {
    var t = TUGAS_KUMPUL[i];
    var R = D[t.data];
    var st = State[t.key];
    html += buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D[t.judul]) +
        '</h3>' +
        '<p>' +
        esc(D[t.instruksi]) +
        '</p>' +
        (R.cerita ? buildKartuCerita(R.cerita) : buildHimpunan(R)) +
        buildTask('k-' + t.data, t.kind, R, st, {
          selesai: buildFeedbackBox('success', '✓', esc(R.temuan)),
        })
    );
    if (!taskSelesai(st)) {
      semua = false;
      break;
    }
  }

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    html +
    (semua ? buildDlNextButton('kumpulNextBtn', D.nextLabel) : '') +
    '</section>';

  var rerender = function () {
    renderKumpul(container);
  };
  TUGAS_KUMPUL.forEach(function (t) {
    bindTask(container, 'k-' + t.data, t.kind, D[t.data], State[t.key], rerender);
  });
  bindNext('kumpulNextBtn', 'kumpul', 'olah');
}

/* ============================================================
   8. STAGE: OLAH DATA  (Discovery Learning — sintaks 4)
   Tiga penyajian relasi ekskul → pertanyaan penuntun → istilah.
   ============================================================ */

function renderOlah(container) {
  var D = DATA.olah;
  var R = DATA.kumpul.ekskul;
  var quizBenar = guidedQuizAllCorrect(D.pertanyaan, State.olahPilih);

  container.innerHTML =
    '<section aria-label="Olah Data">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.instruksi) +
        '</p>' +
        '<div class="rls-trio">' +
        '<div class="rls-trio__item"><h4>1. ' +
        esc(D.judulPenyajian[0]) +
        '</h4>' +
        buildArrowDiagram('o-panah', R.A, R.B, R.pasangan, optsRelasi(R)) +
        '</div>' +
        '<div class="rls-trio__item"><h4>2. ' +
        esc(D.judulPenyajian[1]) +
        '</h4>' +
        buildRelationListTable(R.A, R.pasangan, { labelA: R.labelA, labelB: R.labelB }) +
        '</div>' +
        '<div class="rls-trio__item"><h4>3. ' +
        esc(D.judulPenyajian[2]) +
        '</h4>' +
        buildPasanganBox(R) +
        '</div>' +
        '</div>'
    ) +
    buildDlPanel(
      buildGuidedQuizList(
        guidedVisible(D.pertanyaan, State.olahPilih),
        State.olahOrders,
        State.olahPilih
      )
    ) +
    (quizBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Istilah yang kamu temukan</h3>' + buildIstilahGrid(D.istilah),
          'panel--hero'
        ) + buildDlNextButton('olahNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindGuidedQuizList(container, D.pertanyaan, State.olahPilih, saveState, function () {
    renderOlah(container);
  });
  bindNext('olahNextBtn', 'olah', 'verifikasi');
}

/* ============================================================
   9. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A: lab tiga aturan. B: dugaan awal. C: miskonsepsi.
   ============================================================ */

function labSelesai() {
  return DATA.verifikasi.lab.aturan.every(function (r) {
    return taskSelesai(State.lab[r.id]);
  });
}

function buildDugaanBanding() {
  var S = DATA.stimulasi;
  var benarId = DATA.verifikasi.dugaanBenar;
  var cocok = State.stimulasiPilihan === benarId;
  return (
    '<div class="dugaan-compare">' +
    '<div class="dugaan-row' +
    (cocok ? ' dugaan-row--ok' : '') +
    '">' +
    '<span class="dugaan-row__title">Relasi “mengikuti ekskul”</span>' +
    '<span>Dugaanmu: <strong>' +
    esc(findOptionLabel(S.opsi, State.stimulasiPilihan) || '—') +
    '</strong></span>' +
    '<span>Hasil penemuan: <strong>' +
    esc(findOptionLabel(S.opsi, benarId)) +
    '</strong></span>' +
    '<span class="dugaan-row__verdict">' +
    (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh data') +
    '</span>' +
    '</div>' +
    '</div>'
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var L = D.lab;
  var selesaiA = labSelesai();
  var semuaPilah = sortItemsAllAnswered(D.pilah, State.verifPilahStates);

  var labHTML = '';
  for (var i = 0; i < L.aturan.length; i++) {
    var r = L.aturan[i];
    var st = State.lab[r.id];
    labHTML +=
      '<div class="rls-lab">' +
      '<h4 class="rls-lab__judul">Aturan ' +
      (i + 1) +
      ': a <em>' +
      esc(r.namaRelasi) +
      '</em> b</h4>' +
      buildTask('v-' + r.id, 'panah', relasiLab(r), st, {
        reveal: true,
        selesai: buildFeedbackBox(
          st.revealed ? 'info' : 'success',
          st.revealed ? '👁' : '✓',
          esc(r.temuan)
        ),
      }) +
      '</div>';
    if (!taskSelesai(st)) break;
  }

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p>' +
        esc(D.instruksiA) +
        '</p>' +
        labHTML +
        (selesaiA ? buildFeedbackBox('success', '💡', L.kesimpulan) : '')
    ) +
    (selesaiA
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' + esc(D.judulB) + '</h3>' + buildDugaanBanding()
        ) +
        buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulC) +
            '</h3>' +
            '<p>' +
            esc(D.instruksiC) +
            '</p>' +
            buildSortItems(D.pilah, State.verifPilahOrder, D.opsiPilah, State.verifPilahStates)
        )
      : '') +
    (selesaiA && semuaPilah ? buildDlNextButton('verifNextBtn', D.nextLabel) : '') +
    '</section>';

  var rerender = function () {
    renderVerifikasi(container);
  };
  L.aturan.forEach(function (r) {
    bindTask(container, 'v-' + r.id, 'panah', relasiLab(r), State.lab[r.id], rerender);
  });
  bindSortItems(container, D.pilah, State.verifPilahStates, saveState, rerender);
  bindNext('verifNextBtn', 'verifikasi', 'generalisasi');
}

/* ============================================================
   10. STAGE: MENARIK KESIMPULAN  (Discovery Learning — sintaks 6)
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali diagram panah, tabel, dan Lab Aturanmu, lalu pilih potongan lain.</p>'
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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah konsep relasi yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Relasi</h3>' +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + esc(r) + '</li>'
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
   11. STAGE: UJI TERAP
   'pilih' : pilihan ganda (urutan dari ex.optionOrder) atas relasi
             yang disajikan menurut s.tampil.
   'panah' | 'tabel' | 'chips' : tugas relasi (lihat seksi 4).
   Setelah selesai, pembahasan ditampilkan.
   ============================================================ */

function soalSelesai(s, ex) {
  return s.tipe === 'pilih' ? ex.chosen === s.correct : taskSelesai(ex);
}

function semuaSoalSelesai() {
  return DATA.terapkan.soal.every(function (s, i) {
    return soalSelesai(s, State.terapkanSoal[i]);
  });
}

function buildPembahasan(s) {
  return (
    '<div class="rls-bahas">' +
    '<p class="rls-bahas__judul">Pembahasan</p>' +
    '<p>' +
    esc(s.pembahasan) +
    '</p>' +
    '</div>'
  );
}

/* Penyajian relasi pada soal pilihan ganda. */
function buildTampilan(s) {
  if (s.tampil === 'panah')
    return buildArrowDiagram('t-' + s.id, s.A, s.B, s.pasangan, optsRelasi(s));
  if (s.tampil === 'daftar') {
    return buildRelationListTable(s.A, s.pasangan, { labelA: s.labelA, labelB: s.labelB });
  }
  if (s.tampil === 'tabel') {
    return buildRelationTable('t-' + s.id, s.A, s.B, s.pasangan, {
      labelA: s.labelA,
      labelB: s.labelB,
      caption: 'Relasi “' + s.namaRelasi + '”',
    });
  }
  return buildHimpunan(s);
}

function buildSoalPilih(s, ex) {
  var benar = ex.chosen === s.correct;
  var umpan = '';
  if (ex.chosen && benar) {
    umpan = buildFeedbackBox('success', '✓', s.umpan[s.correct]) + buildPembahasan(s);
  } else if (ex.chosen) {
    umpan = buildFeedbackBox('error', '✗', '<strong>Belum tepat.</strong> ' + s.umpan[ex.chosen]);
  }
  return (
    buildTampilan(s) +
    '<p class="exercise-label">' +
    esc(s.tanya) +
    '</p>' +
    buildChoiceGroup(s.opsi, ex.optionOrder, {
      chosen: ex.chosen,
      correctId: benar ? s.correct : null,
      grade: true,
      locked: benar,
    }) +
    (ex.chosen ? '<div style="margin-top:var(--space-3);">' + umpan + '</div>' : '') +
    (benar
      ? ''
      : buildHintToggle('soal-hint', s.hints, ex.hintLevel) + buildHintStack(s.hints, ex.hintLevel))
  );
}

function buildSoalTugas(s, ex) {
  return (
    (s.tipe === 'chips' ? '' : buildHimpunan(s)) +
    buildTask('t-' + s.id, s.tipe, s, ex, {
      reveal: true,
      selesai:
        buildFeedbackBox(
          ex.revealed ? 'info' : 'success',
          ex.revealed ? '👁' : '✓',
          ex.revealed ? 'Ini jawaban yang tepat.' : '<strong>Tepat!</strong>'
        ) + buildPembahasan(s),
    })
  );
}

function renderTerapkan(container) {
  var D = DATA.terapkan;
  var idx = State.terapkanIdx;
  var s = D.soal[idx];
  var ex = State.terapkanSoal[idx];
  var selesaiIni = soalSelesai(s, ex);
  var semua = semuaSoalSelesai();

  var titik = D.soal
    .map(function (x, i) {
      var st = State.terapkanSoal[i];
      var cls = 'rls-dot';
      if (soalSelesai(x, st)) cls += ' rls-dot--done';
      if (i === idx) cls += ' rls-dot--aktif';
      return (
        '<button type="button" class="' +
        cls +
        '" data-soal-idx="' +
        i +
        '" aria-label="Soal ' +
        (i + 1) +
        (soalSelesai(x, st) ? ', selesai' : '') +
        '"' +
        (i === idx ? ' aria-current="step"' : '') +
        '>' +
        (i + 1) +
        '</button>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Uji Terap">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    '<nav class="rls-dots" aria-label="Pilih soal">' +
    titik +
    '</nav>' +
    buildDlPanel(
      '<p class="rls-kasus">Soal ' +
        (idx + 1) +
        ' dari ' +
        D.soal.length +
        ' · relasi “' +
        esc(s.namaRelasi) +
        '”</p>' +
        '<p class="rls-soal-cerita">' +
        esc(s.cerita) +
        '</p>' +
        (s.tipe === 'pilih' ? buildSoalPilih(s, ex) : buildSoalTugas(s, ex))
    ) +
    '<div class="btn-group btn-group--spread">' +
    '<button type="button" class="btn btn--ghost" id="soalPrev"' +
    (idx === 0 ? ' disabled' : '') +
    '>← Sebelumnya</button>' +
    (semua
      ? '<button type="button" class="btn btn--primary" id="terapkanNextBtn">' +
        esc(D.nextLabel) +
        '</button>'
      : '<button type="button" class="btn btn--primary" id="soalNext"' +
        (idx === D.soal.length - 1 || !selesaiIni ? ' disabled' : '') +
        '>Soal berikutnya →</button>') +
    '</div>' +
    '</section>';

  var rerender = function () {
    renderTerapkan(container);
  };

  if (s.tipe === 'pilih') {
    container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (soalSelesai(s, ex)) return;
        ex.chosen = btn.dataset.optId;
        if (!soalSelesai(s, ex)) ex.pilihSalah += 1;
        saveState();
        rerender();
      });
    });
    var hint = document.getElementById('soal-hint');
    if (hint) {
      hint.addEventListener('click', function () {
        ex.hintLevel = Math.min(ex.hintLevel + 1, s.hints.length);
        saveState();
        rerender();
      });
    }
  } else {
    bindTask(container, 't-' + s.id, s.tipe, s, ex, rerender);
  }

  container.querySelectorAll('[data-soal-idx]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.terapkanIdx = parseInt(btn.dataset.soalIdx, 10);
      saveState();
      rerender();
    });
  });

  var prev = document.getElementById('soalPrev');
  if (prev) {
    prev.addEventListener('click', function () {
      State.terapkanIdx = Math.max(0, idx - 1);
      saveState();
      rerender();
    });
  }
  var next = document.getElementById('soalNext');
  if (next) {
    next.addEventListener('click', function () {
      State.terapkanIdx = Math.min(D.soal.length - 1, idx + 1);
      saveState();
      rerender();
    });
  }
  bindNext('terapkanNextBtn', 'terapkan', 'refleksi');
}

/* ============================================================
   12. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var tugas = [State.relEkskul, State.relKota, State.relBilangan].concat(
    DATA.verifikasi.lab.aturan.map(function (r) {
      return State.lab[r.id];
    })
  );
  var sekaliCoba = tugas.filter(function (st) {
    return st.tepat && st.attempts === 1;
  }).length;
  var benarPilah = sortItemsCorrectCount(DATA.verifikasi.pilah, State.verifPilahStates);
  var benarTerap = DATA.terapkan.soal.filter(function (s, i) {
    var ex = State.terapkanSoal[i];
    return s.tipe === 'pilih'
      ? soalSelesai(s, ex) && ex.pilihSalah === 0
      : ex.tepat && !ex.revealed;
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
        kartu(sekaliCoba + '/' + tugas.length, 'Relasi tepat sekali periksa') +
        kartu(benarPilah + '/' + DATA.verifikasi.pilah.length, 'Pernyataan dipilah benar') +
        kartu(benarTerap + '/' + DATA.terapkan.soal.length, 'Uji terap benar tanpa lihat jawaban') +
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
    buildIstilahGrid(DATA.olah.istilah) +
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
    'Kemampuan murid menjelaskan relasi dengan contoh sehari-harinya sendiri — termasuk mengapa anggota boleh tidak berpasangan atau berpasangan lebih dari satu — tetap menjadi bahan penilaian utama dan jembatan menuju konsep fungsi.' +
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
  kumpul: renderKumpul,
  olah: renderOlah,
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
}

document.addEventListener('DOMContentLoaded', init);
