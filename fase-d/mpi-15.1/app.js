'use strict';

/* ============================================================
   app.js — Logika media pembelajaran
   Fungsi Linear & Non-linear dari Pola Perubahan Nilai
   Fase D — SMP Kelas VIII · Topik 15 Fungsi Linear dan Non-linear,
   Discovery Learning

   Struktur:
     1. Konstanta
     2. State & storage (+ pengacakan semua pilihan jawaban)
     3. Navigasi
     4. Utilitas render (+ tugas tabel perubahan)
     5–13. Renderer tiap tahap
     14. Router render
     15. Modal reset
     16. Init

   Seluruh komponen umum berasal dari shared/engine.js: tabel perubahan,
   grafik pola, Lab Pola Perubahan, diagnosa jenis fungsi (seksi 82),
   diagnosa selisih (seksi 32), serta pilihan acak, pertanyaan penuntun,
   pemilahan, dan petunjuk berjenjang.

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
var STORAGE_KEY = 'mpi-15-1-fungsi-linear-v1';

/* Nilai y sebuah tabel: dari aturan (seksi 82) atau ys apa adanya. */
function ysTabel(t) {
  return t.aturan ? tabelAturanFungsi(t.aturan, t.xs) : t.ys;
}

function cfgTabel(t) {
  return { xs: t.xs, ys: ysTabel(t), kosong: t.kosong, labelX: t.labelX, labelY: t.labelY };
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

  /* Tahap 3 — pengumpulan data (tabel perubahan per situasi) */
  tabel: {},

  /* Tahap 4 — olah data */
  olahOrders: {},
  olahPilih: {},

  /* Tahap 5 — pembuktian */
  lab: null,
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

/* Memulihkan state Lab Pola Perubahan dari storage. */
function ensureLabState() {
  var awal = makeLabPolaState();
  if (!isObject(State.lab)) State.lab = awal;
  var st = State.lab;
  Object.keys(awal).forEach(function (k) {
    if (typeof st[k] !== typeof awal[k] || Array.isArray(st[k]) !== Array.isArray(awal[k])) {
      st[k] = awal[k];
    }
  });
  if (LAB_POLA_JENIS.indexOf(st.jenis) === -1) st.jenis = 'linear';
}

function makeSoalState() {
  return {
    chosen: null,
    pilihSalah: 0,
    optionOrder: null,
    hintLevel: 0,
    input: '',
    tepat: false,
    revealed: false,
    attempts: 0,
    salah: null,
  };
}

/* Opsi pilihan sebuah soal uji terap (soal 'jenis' memakai opsiJenis). */
function opsiSoal(s) {
  if (s.tipe === 'jenis') return DATA.terapkan.opsiJenis;
  return s.opsi || null;
}

/*
 * Menyiapkan seluruh state per-soal DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset, sehingga urutan stabil lintas reload tetapi
 * teracak ulang setiap Reset.
 */
function initExerciseArrays() {
  ['tabel', 'olahOrders', 'olahPilih', 'simpulanPilihan', 'refleksiAnswers'].forEach(function (k) {
    ensureObject(State, k);
  });

  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'stimulasiOrder', DATA.stimulasi.opsi);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  DATA.kumpul.situasi.forEach(function (s) {
    ensureTabelPerubahanState(State.tabel, s.id);
  });

  /* Tahap 4 */
  DATA.olah.pertanyaan.forEach(function (q) {
    ensureShuffledOrder(State.olahOrders, q.id, q.opsi);
  });

  /* Tahap 5 */
  ensureLabState();
  ensureSortStates(
    State,
    'verifPilahStates',
    'verifPilahOrder',
    DATA.verifikasi.pilah,
    DATA.verifikasi.opsiPilah
  );

  /* Tahap 6 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);

  /* Tahap 7 — urutan opsi diacak per soal */
  ensureExerciseArray(State, 'terapkanSoal', DATA.terapkan.soal, function (s) {
    var st = makeSoalState();
    var opsi = opsiSoal(s);
    st.optionOrder = opsi ? shuffleArray(optionIds(opsi)) : null;
    return st;
  });
  DATA.terapkan.soal.forEach(function (s, i) {
    var st = State.terapkanSoal[i];
    var awal = makeSoalState();
    Object.keys(awal).forEach(function (k) {
      if (st[k] === undefined) st[k] = awal[k];
    });
    var opsi = opsiSoal(s);
    if (opsi) ensureShuffledOrder(st, 'optionOrder', opsi);
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
    '<div class="formula-duo fnl-istilah">' +
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

/* Tabel lengkap tanpa isian; `laju` true → tampilkan kolom Δy/Δx. */
function buildTabelStatis(id, t, laju, caption) {
  return buildTabelPerubahan(id, cfgTabel(t), null, {
    statis: true,
    laju: !!laju,
    caption: caption,
  });
}

function buildGrafikTabel(t, kecil) {
  return buildGrafikPola(t.xs, ysTabel(t), {
    xLabel: t.labelX,
    yLabel: t.labelY,
    caption: 'Grafik ' + t.labelY + ' terhadap ' + t.labelX,
    kecil: kecil,
  });
}

/*
 * Mengembalikan fokus keyboard ke kontrol yang setara setelah render
 * ulang (tombol lab, tombol nomor soal), agar pengguna keyboard tidak
 * terlempar ke awal halaman.
 */
var FOKUS_ATTR = ['data-lab-jenis', 'data-lab-ubah', 'data-lab-lompat', 'data-soal-idx'];

function kunciFokus() {
  var el = document.activeElement;
  if (!el || el === document.body) return null;
  if (el.id) return '#' + el.id;
  for (var i = 0; i < FOKUS_ATTR.length; i++) {
    var a = FOKUS_ATTR[i];
    if (el.hasAttribute(a)) {
      var sel = '[' + a + '="' + el.getAttribute(a) + '"]';
      if (el.dataset.step) sel += '[data-step="' + el.dataset.step + '"]';
      return sel;
    }
  }
  return null;
}

function pulihkanFokus(kunci) {
  if (!kunci) return;
  var el = document.querySelector(kunci);
  if (el && !el.disabled) el.focus();
}

/* ------------------------------------------------------------
   Tugas tabel perubahan (tahap Data): isi y kosong & Δy.
   ------------------------------------------------------------ */

function tabelSelesai(st) {
  return st.tepat || st.revealed;
}

function buildTugasTabel(id, S, st) {
  var cfg = cfgTabel(S);
  var tabel = buildTabelPerubahan(id, cfg, st, { laju: false });
  if (tabelSelesai(st)) {
    return (
      tabel +
      buildFeedbackBox(
        st.revealed ? 'info' : 'success',
        st.revealed ? '👁' : '✓',
        (st.revealed ? 'Ini jawaban yang tepat. ' : '<strong>Tepat!</strong> ') + esc(S.temuan)
      ) +
      buildGrafikTabel(S, true)
    );
  }
  var hasil = st.checked ? periksaTabelPerubahan(cfg, st) : null;
  return (
    tabel +
    '<div class="dl-input-row">' +
    '<button type="button" class="btn btn--primary" id="' +
    id +
    '-cek">Periksa</button>' +
    buildHintToggle(id + '-hint', S.hints, st.hintLevel) +
    (st.attempts >= 3
      ? '<button type="button" class="btn btn--ghost btn--small" id="' +
        id +
        '-lihat">Lihat Jawaban</button>'
      : '') +
    '</div>' +
    (hasil
      ? '<div class="fnl-diagnosa">' +
        pesanTabelPerubahan(cfg, hasil)
          .map(function (m) {
            return buildFeedbackBox('warning', '💭', m);
          })
          .join('') +
        '</div>'
      : '') +
    buildHintStack(S.hints, st.hintLevel)
  );
}

function bindTugasTabel(root, id, S, st, rerender) {
  if (tabelSelesai(st)) return;
  bindTabelPerubahan(root, id, st, saveState);

  var cek = document.getElementById(id + '-cek');
  if (cek) {
    cek.addEventListener('click', function () {
      var hasil = periksaTabelPerubahan(cfgTabel(S), st);
      if (!hasil.lengkap) {
        showNotice('Isi semua sel kosong dengan bilangan bulat, mis. 6000 atau −8000.');
        return;
      }
      st.attempts += 1;
      st.checked = true;
      st.tepat = hasil.tepat;
      if (!hasil.tepat) showNotice('Belum tepat. Baca umpan baliknya.');
      saveState();
      rerender();
    });
  }
  var hint = document.getElementById(id + '-hint');
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = Math.min(st.hintLevel + 1, S.hints.length);
      saveState();
      rerender();
    });
  }
  var lihat = document.getElementById(id + '-lihat');
  if (lihat) {
    lihat.addEventListener('click', function () {
      st.revealed = true;
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
        '<div class="fnl-kartu-grid">' +
        D.kartu
          .map(function (k) {
            return (
              '<div class="fnl-kartu"><span class="fnl-kartu__ikon" aria-hidden="true">' +
              k.ikon +
              '</span><h3 class="fnl-kartu__judul">' +
              esc(k.judul) +
              '</h3><p class="fnl-kartu__teks">' +
              esc(k.teks) +
              '</p></div>'
            );
          })
          .join('') +
        '</div>',
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
   Empat tabel perubahan; tabel berikutnya terbuka setelah
   tabel sebelumnya tepat (atau jawabannya dilihat).
   ============================================================ */

function renderKumpul(container) {
  var D = DATA.kumpul;
  var html = '';
  var semua = true;

  for (var i = 0; i < D.situasi.length; i++) {
    var S = D.situasi[i];
    var st = State.tabel[S.id];
    html += buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(S.judul) +
        '</h3>' +
        '<p class="fnl-cerita">' +
        esc(S.cerita) +
        '</p>' +
        buildTugasTabel('k-' + S.id, S, st)
    );
    if (!tabelSelesai(st)) {
      semua = false;
      break;
    }
  }

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    html +
    (semua ? buildDlNextButton('kumpulNextBtn', D.nextLabel) : '') +
    '</section>';

  var rerender = function () {
    renderKumpul(container);
  };
  D.situasi.forEach(function (S) {
    bindTugasTabel(container, 'k-' + S.id, S, State.tabel[S.id], rerender);
  });
  bindNext('kumpulNextBtn', 'kumpul', 'olah');
}

/* ============================================================
   8. STAGE: OLAH DATA  (Discovery Learning — sintaks 4)
   Empat tabel + Δy/Δx + grafik → data ojek → pertanyaan → istilah.
   ============================================================ */

function renderOlah(container) {
  var D = DATA.olah;
  var quizBenar = guidedQuizAllCorrect(D.pertanyaan, State.olahPilih);
  var lompatBenar = State.olahPilih.lompat === 'benar';

  container.innerHTML =
    '<section aria-label="Olah Data">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.instruksi) +
        '</p>' +
        '<div class="fnl-banding">' +
        DATA.kumpul.situasi
          .map(function (S) {
            return (
              '<div class="fnl-banding__item"><h4>' +
              esc(S.judul) +
              '</h4>' +
              buildTabelStatis('o-' + S.id, S, true) +
              buildGrafikTabel(S, true) +
              '</div>'
            );
          })
          .join('') +
        '</div>'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.ojek.judul) +
        '</h3>' +
        '<p class="fnl-cerita">' +
        esc(D.ojek.cerita) +
        '</p>' +
        buildTabelStatis('o-ojek', D.ojek, lompatBenar)
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
   A: Lab Pola Perubahan. B: dugaan awal. C: pilah tabel.
   ============================================================ */

function misiSelesai(id) {
  var st = State.lab;
  if (id === 'm') return st.mDicoba.length >= 2;
  if (id === 'lompat') return st.lompatDicoba;
  return ['kuadrat', 'eksponen', 'kebalikan'].every(function (j) {
    return !!st.dicoba[j];
  });
}

function buildMisiList() {
  return (
    '<ul class="fnl-misi">' +
    DATA.verifikasi.misi
      .map(function (m) {
        var ok = misiSelesai(m.id);
        return (
          '<li class="fnl-misi__item' +
          (ok ? ' fnl-misi__item--ok' : '') +
          '"><span class="fnl-misi__tanda" aria-hidden="true">' +
          (ok ? '✓' : '○') +
          '</span>' +
          esc(m.teks) +
          '<span class="sr-only">' +
          (ok ? ' (selesai)' : ' (belum)') +
          '</span></li>'
        );
      })
      .join('') +
    '</ul>'
  );
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
    '<span class="dugaan-row__title">Tarif parkir vs luas spanduk</span>' +
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
  var selesaiA = labPolaSelesai(State.lab);
  var semuaPilah = sortItemsAllAnswered(D.pilah, State.verifPilahStates);

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
        buildLabPolaPerubahan('v-lab', State.lab, { checklist: buildMisiList() }) +
        (selesaiA
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox('success', '💡', D.kesimpulan) +
            '</div>'
          : '')
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
            buildSortItems(D.pilah, State.verifPilahOrder, D.opsiPilah, State.verifPilahStates, {
              visual: function (it) {
                return buildTabelStatis('p-' + it.id, it, false);
              },
            })
        )
      : '') +
    (selesaiA && semuaPilah ? buildDlNextButton('verifNextBtn', D.nextLabel) : '') +
    '</section>';

  var rerender = function () {
    var kunci = kunciFokus();
    saveState();
    renderVerifikasi(container);
    pulihkanFokus(kunci);
  };
  bindLabPolaPerubahan(container, 'v-lab', State.lab, rerender);
  bindSortItems(container, D.pilah, State.verifPilahStates, saveState, function () {
    renderVerifikasi(container);
  });
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali tabel Δy/Δx, grafik, dan Lab Pola Perubahanmu, lalu pilih potongan lain.</p>'
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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah ciri fungsi linear dan non-linear yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Fungsi Linear & Non-linear</h3>' +
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
   'jenis' : klasifikasi tabel; umpan salah dari diagnosaJenisFungsi.
   'pilih' : pilihan ganda (urutan dari ex.optionOrder).
   'isi'   : isian nilai y pada s.xTanya (ada pesan jebakan).
   Setelah selesai, pembahasan ditampilkan.
   ============================================================ */

function kunciIsi(s) {
  return nilaiAturanFungsi(s.aturan, s.xTanya);
}

function soalSelesai(s, ex) {
  if (s.tipe === 'jenis') return ex.chosen === jenisPolaFungsi(s.xs, ysTabel(s));
  if (s.tipe === 'pilih') return ex.chosen === s.correct;
  return ex.tepat || ex.revealed;
}

function soalBenarLangsung(s, ex) {
  if (s.tipe === 'isi') return ex.tepat && ex.attempts === 1;
  return soalSelesai(s, ex) && ex.pilihSalah === 0;
}

function semuaSoalSelesai() {
  return DATA.terapkan.soal.every(function (s, i) {
    return soalSelesai(s, State.terapkanSoal[i]);
  });
}

function buildPembahasan(s) {
  return (
    '<div class="fnl-bahas">' +
    '<p class="fnl-bahas__judul">Pembahasan</p>' +
    '<p>' +
    esc(s.pembahasan) +
    '</p>' +
    '</div>'
  );
}

function buildHintSoal(s, ex) {
  return (
    buildHintToggle('soal-hint', s.hints, ex.hintLevel) + buildHintStack(s.hints, ex.hintLevel)
  );
}

/* Umpan balik pilihan: dari diagnosa engine (jenis) atau dari data (pilih). */
function umpanPilihan(s, ex) {
  if (s.tipe === 'jenis')
    return pesanDiagnosaJenisFungsi(diagnosaJenisFungsi(s.xs, ysTabel(s), ex.chosen));
  return s.umpan[ex.chosen];
}

function buildSoalPilih(s, ex) {
  var benar = soalSelesai(s, ex);
  var correctId = s.tipe === 'jenis' ? jenisPolaFungsi(s.xs, ysTabel(s)) : s.correct;
  var umpan = '';
  if (ex.chosen && benar) {
    umpan = buildFeedbackBox('success', '✓', umpanPilihan(s, ex)) + buildPembahasan(s);
  } else if (ex.chosen) {
    umpan = buildFeedbackBox('error', '✗', '<strong>Belum tepat.</strong> ' + umpanPilihan(s, ex));
  }
  return (
    (s.tipe === 'jenis' ? buildTabelStatis('t-' + s.id, s, false) : '') +
    '<p class="exercise-label">' +
    esc(s.tanya) +
    '</p>' +
    buildChoiceGroup(opsiSoal(s), ex.optionOrder, {
      chosen: ex.chosen,
      correctId: benar ? correctId : null,
      grade: true,
      locked: benar,
    }) +
    (ex.chosen ? '<div style="margin-top:var(--space-3);">' + umpan + '</div>' : '') +
    (benar ? '' : buildHintSoal(s, ex))
  );
}

function buildSoalIsi(s, ex) {
  var selesai = soalSelesai(s, ex);
  var hasil = '';
  if (selesai) {
    hasil =
      buildFeedbackBox(
        ex.revealed ? 'info' : 'success',
        ex.revealed ? '👁' : '✓',
        ex.revealed
          ? 'Jawaban yang tepat: Rp' + formatNumber(kunciIsi(s)) + '.'
          : '<strong>Tepat!</strong>'
      ) + buildPembahasan(s);
  } else if (ex.salah) {
    hasil = buildFeedbackBox('error', '✗', '<strong>Belum tepat.</strong> ' + esc(ex.salah));
  }
  return (
    buildTabelStatis('t-' + s.id, s, false) +
    '<p class="exercise-label"><label for="soalIsiInput">' +
    esc(s.tanya) +
    '</label></p>' +
    '<div class="dl-input-row">' +
    '<span class="fnl-rp" aria-hidden="true">Rp</span>' +
    buildDlNumInput('soalIsiInput', selesai ? formatNumber(kunciIsi(s)) : ex.input, {
      aria: s.tanya,
      disabled: selesai,
      error: !!ex.salah && !selesai,
    }) +
    (selesai
      ? ''
      : '<button type="button" class="btn btn--primary" id="soalIsiCek">Periksa</button>' +
        (ex.attempts >= 2
          ? '<button type="button" class="btn btn--ghost btn--small" id="soalIsiLihat">Lihat Jawaban</button>'
          : '')) +
    '</div>' +
    (hasil ? '<div style="margin-top:var(--space-3);">' + hasil + '</div>' : '') +
    (selesai ? '' : buildHintSoal(s, ex))
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
      var cls = 'fnl-dot';
      if (soalSelesai(x, st)) cls += ' fnl-dot--done';
      if (i === idx) cls += ' fnl-dot--aktif';
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
    '<nav class="fnl-dots" aria-label="Pilih soal">' +
    titik +
    '</nav>' +
    buildDlPanel(
      '<p class="fnl-kasus">Soal ' +
        (idx + 1) +
        ' dari ' +
        D.soal.length +
        '</p>' +
        '<p class="fnl-cerita">' +
        esc(s.cerita) +
        '</p>' +
        (s.tipe === 'isi' ? buildSoalIsi(s, ex) : buildSoalPilih(s, ex))
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
    var kunci = kunciFokus();
    renderTerapkan(container);
    pulihkanFokus(kunci);
  };

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

  var input = document.getElementById('soalIsiInput');
  if (input && !input.disabled) {
    input.addEventListener('input', function () {
      ex.input = input.value;
      saveState();
    });
  }
  var cekIsi = document.getElementById('soalIsiCek');
  if (cekIsi) {
    var periksaIsi = function () {
      var v = readDlNumber(ex.input, false);
      if (v === null) return;
      ex.attempts += 1;
      ex.tepat = v === kunciIsi(s);
      ex.salah = null;
      if (!ex.tepat) {
        ex.salah =
          v === s.jebakan.nilai
            ? s.jebakan.pesan
            : 'Hitung dulu laju perubahan Δy/Δx dari tabel, lalu kalikan dengan pertambahan x.';
      }
      saveState();
      rerender();
    };
    cekIsi.addEventListener('click', periksaIsi);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') periksaIsi();
    });
  }
  var lihatIsi = document.getElementById('soalIsiLihat');
  if (lihatIsi) {
    lihatIsi.addEventListener('click', function () {
      ex.revealed = true;
      saveState();
      rerender();
    });
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
  var tabel = DATA.kumpul.situasi.map(function (S) {
    return State.tabel[S.id];
  });
  var sekaliCoba = tabel.filter(function (st) {
    return st.tepat && st.attempts === 1;
  }).length;
  var benarPilah = sortItemsCorrectCount(DATA.verifikasi.pilah, State.verifPilahStates);
  var benarTerap = DATA.terapkan.soal.filter(function (s, i) {
    return soalBenarLangsung(s, State.terapkanSoal[i]);
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
        kartu(sekaliCoba + '/' + tabel.length, 'Tabel perubahan tepat sekali periksa') +
        kartu(benarPilah + '/' + DATA.verifikasi.pilah.length, 'Tabel dipilah benar') +
        kartu(
          benarTerap + '/' + DATA.terapkan.soal.length,
          'Uji terap benar pada percobaan pertama'
        ) +
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
    'Kemampuan murid menjelaskan mengapa sebuah situasi linear atau non-linear dengan menunjuk laju perubahan Δy/Δx — termasuk saat nilainya turun atau x melompat — tetap menjadi bahan penilaian utama dan jembatan menuju grafik dan persamaan fungsi linear.' +
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
