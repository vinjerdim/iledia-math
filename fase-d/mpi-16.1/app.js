'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Relasi Antara Dua Himpunan
   Fase D — SMP Kelas VIII · Topik 16 Relasi dan Fungsi

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox,
   createStageMachine, createExerciseStage, createStore,
   ensureExerciseArray, optionIds, komponen Discovery Learning
   (ensureShuffledOrder, orderByIds, buildDiscoveryHead,
   buildTeacherNote, buildChoiceGroup, buildDlPanel,
   buildDlNextButton, ensureSortStates, buildSortItems,
   bindSortItems, sortItemsAllAnswered, sortItemsCorrectCount,
   findOptionLabel, buildGuidedQuizList, bindGuidedQuizList,
   guidedQuizAllCorrect), serta komponen relasi bagian 25
   (normalisasiRelasi, diagnosaRelasi, formatHimpunan,
   formatRelasiPasangan, buildArrowDiagram, bindArrowDiagram,
   buildRelationTable, bindRelationTable, buildRelationListTable,
   buildPairChips, bindPairChips, adaPasangan).

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaan dan rangkaian aktivitasnya.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI saat
   state disiapkan (initExerciseArrays), lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat-lompat
   ketika tahap dirender ulang, tetapi teracak ulang setiap Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi            (DL sintaks 1)
    6. Stage: Identifikasi Masalah (DL sintaks 2)
    7. Stage: Pengumpulan Data     (DL sintaks 3)
    8. Stage: Olah Pasangan        (DL sintaks 4)
    9. Stage: Olah Konsep Relasi   (DL sintaks 4)
   10. Stage: Pembuktian           (DL sintaks 5)
   11. Stage: Menarik Kesimpulan   (DL sintaks 6)
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

var STAGES = [
  'stimulasi',
  'masalah',
  'koleksi',
  'olahPasangan',
  'olahRelasi',
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
  'Pasangan',
  'Konsep',
  'Bukti',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-16-1-relasi-v1';

/* Relasi "menyukai" dari kartu survei (kunci tahap 3–5). */
var SURVEI = {
  A: DATA.stimulasi.A,
  B: DATA.stimulasi.B,
  pairs: (function () {
    var out = [];
    DATA.stimulasi.survei.forEach(function (t) {
      t.suka.forEach(function (o) {
        out.push([t.nama, o]);
      });
    });
    return out;
  })(),
};

/* Id chip yang memang anggota relasi survei. */
var CHIP_BENAR = DATA.olahPasangan.chips
  .filter(function (c) {
    return adaPasangan(SURVEI.pairs, c.a, c.b);
  })
  .map(function (c) {
    return c.id;
  });

/* Butir pemilahan nama relasi, lengkap dengan teks tampilannya. */
var NAMA_ITEMS = DATA.olahRelasi.item.map(function (it) {
  return {
    id: it.id,
    correct: it.correct,
    explanation: it.explanation,
    teks:
      'A = ' +
      esc(formatHimpunan(it.A)) +
      ', B = ' +
      esc(formatHimpunan(it.B)) +
      '<br><strong>' +
      esc(formatRelasiPasangan(it.pairs)) +
      '</strong>',
  };
});

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

  /* Tahap 3 — pengumpulan data */
  panah: null,
  panahCek: null,
  tabel: null,
  tabelCek: null,

  /* Tahap 4 — pasangan berurutan */
  chipOrder: null,
  chipPilih: null,
  chipCek: null,
  tanyaOrders: {},
  tanyaPilih: {},

  /* Tahap 5 — konsep relasi */
  konsepOrders: {},
  konsepPilih: {},
  namaStates: {},
  namaOrder: null,

  /* Tahap 6 — pembuktian */
  ujiPanah: null,
  ujiCek: null,
  verifExercises: [],

  /* Tahap 7 — menarik kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 8 — uji terap */
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

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

/* State perakit relasi { pairs, selected } yang sah untuk himpunan A & B. */
function ensureRelState(key, A, B) {
  var st = isPlainObject(State[key]) ? State[key] : {};
  var pairs = Array.isArray(st.pairs) ? st.pairs : [];
  st.pairs = normalisasiRelasi(
    pairs.filter(function (p) {
      return (
        Array.isArray(p) &&
        p.length === 2 &&
        A.some(function (a) {
          return String(a) === String(p[0]);
        }) &&
        B.some(function (b) {
          return String(b) === String(p[1]);
        })
      );
    })
  );
  if (!(typeof st.selected === 'number' && st.selected >= 0 && st.selected < A.length)) {
    st.selected = null;
  }
  State[key] = st;
}

/* State pemeriksaan { attempts, done, diag } (diag = hasil diagnosaRelasi). */
function ensureCekState(key) {
  var st = isPlainObject(State[key]) ? State[key] : {};
  if (typeof st.attempts !== 'number') st.attempts = 0;
  st.done = !!st.done;
  if (!isPlainObject(st.diag)) st.diag = null;
  State[key] = st;
}

/*
 * Menyiapkan seluruh state per-soal DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1–2 */
  ensureShuffledOrder(State, 'stimulasiOrder', DATA.stimulasi.opsi);
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 */
  ensureRelState('panah', SURVEI.A, SURVEI.B);
  ensureCekState('panahCek');
  ensureRelState('tabel', SURVEI.A, SURVEI.B);
  ensureCekState('tabelCek');

  /* Tahap 4 */
  ensureShuffledOrder(State, 'chipOrder', DATA.olahPasangan.chips);
  var chipIds = optionIds(DATA.olahPasangan.chips);
  State.chipPilih = (Array.isArray(State.chipPilih) ? State.chipPilih : []).filter(function (id) {
    return chipIds.indexOf(id) !== -1;
  });
  ensureCekState('chipCek');
  State.chipCek.periksa = !!State.chipCek.periksa;
  if (!isPlainObject(State.tanyaOrders)) State.tanyaOrders = {};
  if (!isPlainObject(State.tanyaPilih)) State.tanyaPilih = {};
  DATA.olahPasangan.tanya.forEach(function (q) {
    ensureShuffledOrder(State.tanyaOrders, q.id, q.opsi);
  });

  /* Tahap 5 */
  if (!isPlainObject(State.konsepOrders)) State.konsepOrders = {};
  if (!isPlainObject(State.konsepPilih)) State.konsepPilih = {};
  DATA.olahRelasi.konsep.forEach(function (q) {
    ensureShuffledOrder(State.konsepOrders, q.id, q.opsi);
  });
  ensureSortStates(State, 'namaStates', 'namaOrder', NAMA_ITEMS, DATA.olahRelasi.opsiNama);

  /* Tahap 6 */
  ensureRelState('ujiPanah', DATA.verifikasi.uji.A, DATA.verifikasi.uji.B);
  ensureCekState('ujiCek');
  ensureExerciseArray(State, 'verifExercises', DATA.verifikasi.soal, function (q) {
    return { chosen: null, correct: false, optionOrder: shuffleArray(optionIds(q.options)) };
  });

  /* Tahap 7 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);
  if (!isPlainObject(State.simpulanPilihan)) State.simpulanPilihan = {};

  /* Tahap 8 — uji terap (dirender createExerciseStage) */
  ensureExerciseArray(State, 'terapkanExercises', DATA.terapkan.soal, function (q) {
    return {
      attempts: 0,
      hintLevel: 0,
      hintShown: false,
      correct: false,
      userInput: '',
      revealed: false,
      chosen: null,
      checked: false,
      optionOrder: shuffleArray(optionIds(q.options)),
    };
  });
  if (State.terapkanIdx >= DATA.terapkan.soal.length || State.terapkanIdx < 0) {
    State.terapkanIdx = 0;
  }

  /* Tahap 9 */
  ensureShuffledOrder(State, 'refleksiDiriOrder', DATA.refleksi.diriOpsi);
  if (!isPlainObject(State.refleksiAnswers)) State.refleksiAnswers = {};
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

/* Umpan balik jawaban sekali-pilih (benar/salah + penjelasan). */
function buildOnceFeedback(benar, explanation) {
  return (
    '<div style="margin-top:var(--space-2);">' +
    buildFeedbackBox(
      benar ? 'success' : 'error',
      benar ? '✓' : '✗',
      (benar ? '<strong>Tepat.</strong> ' : '<strong>Belum tepat.</strong> ') + explanation
    ) +
    '</div>'
  );
}

/* Kotak umpan balik pilihan (benar → success, salah → warning). */
function buildChoiceFeedback(chosen, benar, umpan) {
  if (!chosen) return '';
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(benar ? 'success' : 'warning', benar ? '✓' : '💭', umpan[chosen]) +
    '</div>'
  );
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

/*
 * Memasang pilihan "coba lagi sampai benar": klik mengganti pilihan
 * selama jawaban benar belum dipilih.
 */
function bindRetryChoice(container, group, key, correctId, rerender) {
  container.querySelectorAll('[data-group="' + group + '"][data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State[key] === correctId) return;
      State[key] = btn.dataset.optId;
      saveState();
      rerender();
    });
  });
}

/* Kartu survei klub olahraga (tahap 1 & 3). */
function buildSurveiCards(compact) {
  return (
    '<div class="survei-grid' +
    (compact ? ' survei-grid--compact' : '') +
    '">' +
    DATA.stimulasi.survei
      .map(function (t) {
        return (
          '<div class="survei-card">' +
          '<span class="survei-card__ikon" aria-hidden="true">' +
          t.ikon +
          '</span>' +
          '<span class="survei-card__nama">' +
          esc(t.nama) +
          '</span>' +
          '<p class="survei-card__kutipan">“' +
          esc(t.kutipan) +
          '”</p>' +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

/* Daftar anggota A yang pasangannya belum lengkap/berlebih pada diagnosa. */
function namaBermasalah(diag) {
  var nama = [];
  diag.kurang
    .concat(diag.lebih)
    .concat(diag.terbalik)
    .forEach(function (p) {
      var a = diag.terbalik.indexOf(p) !== -1 ? p[1] : p[0];
      if (nama.indexOf(String(a)) === -1) nama.push(String(a));
    });
  return nama;
}

/*
 * Pesan umpan balik pemeriksaan relasi. Percobaan pertama hanya
 * menyebut jumlah; mulai percobaan kedua ikut menyebut anggota A yang
 * perlu diperiksa lagi.
 */
function buildDiagnosaFeedback(diag, attempts, satuan) {
  var poin = [];
  if (diag.kurang.length) {
    poin.push('Masih kurang <strong>' + diag.kurang.length + ' ' + satuan + '</strong>.');
  }
  if (diag.lebih.length) {
    poin.push(
      'Ada <strong>' +
        diag.lebih.length +
        ' ' +
        satuan +
        '</strong> yang tidak sesuai data (ditandai merah).'
    );
  }
  if (diag.terbalik.length) {
    poin.push(
      'Ada ' + satuan + ' yang arahnya terbalik — ingat, selalu dari anggota A ke anggota B.'
    );
  }
  if (attempts >= 2) {
    poin.push(
      'Periksa lagi data milik: <strong>' + esc(namaBermasalah(diag).join(', ')) + '</strong>.'
    );
  }
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox('warning', '💭', '<strong>Belum tepat.</strong> ' + poin.join(' ')) +
    '</div>'
  );
}

/* Pasangan yang ditandai merah dari hasil diagnosa. */
function pasanganSalah(cek) {
  return cek.diag ? cek.diag.lebih.concat(cek.diag.terbalik) : [];
}

/* Tiga penyajian relasi yang sama berdampingan. */
function buildTigaPenyajian(id, R, opts) {
  return (
    '<div class="tiga-sajian">' +
    '<div class="tiga-sajian__item"><h4>① Diagram panah</h4>' +
    buildArrowDiagram(id + '-d', R.A, R.B, R.pairs, opts) +
    '</div>' +
    '<div class="tiga-sajian__item"><h4>② Tabel</h4>' +
    buildRelationTable(id + '-t', R.A, R.B, R.pairs, opts) +
    '</div>' +
    '<div class="tiga-sajian__item"><h4>③ Himpunan pasangan berurutan</h4>' +
    '<p class="pasangan-box">' +
    esc(formatRelasiPasangan(normalisasiRelasi(R.pairs, R.A, R.B))) +
    '</p></div>' +
    '</div>'
  );
}

/* Status anggota A yang sedang dipilih pada perakit diagram panah. */
function buildPilihStatus(st, A) {
  return (
    '<p class="rel-status" aria-live="polite">' +
    (st.selected === null
      ? '👆 Ketuk sebuah anggota himpunan A lebih dulu.'
      : '✏️ Terpilih: <strong>' +
        esc(A[st.selected]) +
        '</strong>. Ketuk anggota B untuk menarik atau menghapus panah.') +
    '</p>'
  );
}

function pesanKetuk(hasil) {
  if (hasil === 'perluPilih') showNotice('Ketuk anggota himpunan A dulu, baru anggota B.');
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   Murid mengamati dan MENDUGA. Tidak ada penilaian benar/salah.
   ============================================================ */

function renderStimulasi(container) {
  var D = DATA.stimulasi;
  var terisi = !!State.stimulasiPilihan;

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🏅 ' +
        esc(D.judul) +
        '</h2>' +
        '<p class="stimulasi-cerita">' +
        esc(D.cerita) +
        '</p>' +
        buildSurveiCards(false) +
        '<div class="klub-row" aria-label="Pilihan olahraga">' +
        D.B.map(function (b) {
          return '<span class="klub-chip">' + esc(b) + '</span>';
        }).join('') +
        '</div>',
      'panel--hero'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.pertanyaan) +
        '</p>' +
        buildChoiceGroup(D.opsi, State.stimulasiOrder, { chosen: State.stimulasiPilihan }) +
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

  var ta = document.getElementById('stimulasiAlasan');
  ta.addEventListener('input', function () {
    State.stimulasiAlasan = ta.value;
    saveState();
  });

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
          group: 'masalah',
        }) +
        buildChoiceFeedback(State.masalahPilihan, benar, D.umpan)
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

  bindRetryChoice(container, 'masalah', 'masalahPilihan', D.correct, function () {
    renderMasalah(container);
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
   7. STAGE: PENGUMPULAN DATA  (Discovery Learning — sintaks 3)
   A. Merakit diagram panah "menyukai" dari kartu survei.
   B. Memindahkan data yang sama ke tabel silang.
   ============================================================ */

/* Memeriksa perakit relasi terhadap target; hasil disimpan di `cek`. */
function periksaRelasi(target, st, cek) {
  cek.attempts++;
  var diag = diagnosaRelasi(target, st.pairs);
  cek.done = diag.tepat;
  cek.diag = diag.tepat ? null : diag;
  if (diag.tepat) st.selected = null;
  saveState();
  return diag.tepat;
}

function renderKoleksi(container) {
  var D = DATA.koleksi;
  var P = State.panah;
  var PC = State.panahCek;
  var T = State.tabel;
  var TC = State.tabelCek;
  var opts = { labelA: D.labelA, labelB: D.labelB, namaRelasi: D.namaRelasi };

  function rerender() {
    renderKoleksi(container);
  }

  var panahHTML = buildDlPanel(
    '<h3 style="margin-top:0;">A. Diagram panah</h3>' +
      (PC.done
        ? buildArrowDiagram('kolPanah', SURVEI.A, SURVEI.B, P.pairs, opts) +
          buildFeedbackBox('success', '✓', esc(D.temuanPanah))
        : '<p>' +
          esc(D.instruksiPanah) +
          '</p>' +
          buildPilihStatus(P, SURVEI.A) +
          buildArrowDiagram(
            'kolPanah',
            SURVEI.A,
            SURVEI.B,
            P.pairs,
            Object.assign({}, opts, {
              interactive: true,
              selected: P.selected,
              salah: pasanganSalah(PC),
            })
          ) +
          '<div class="btn-group btn-group--end">' +
          '<button type="button" class="btn btn--primary" id="panahCekBtn">Periksa Diagram</button>' +
          '</div>' +
          (PC.diag ? buildDiagnosaFeedback(PC.diag, PC.attempts, 'panah') : ''))
  );

  var tabelHTML = '';
  if (PC.done) {
    tabelHTML = buildDlPanel(
      '<h3 style="margin-top:0;">B. Tabel</h3>' +
        (TC.done
          ? buildRelationTable('kolTabel', SURVEI.A, SURVEI.B, T.pairs, opts) +
            buildFeedbackBox('success', '✓', esc(D.temuanTabel))
          : '<p>' +
            esc(D.instruksiTabel) +
            '</p>' +
            buildRelationTable(
              'kolTabel',
              SURVEI.A,
              SURVEI.B,
              T.pairs,
              Object.assign({}, opts, { interactive: true, salah: pasanganSalah(TC) })
            ) +
            '<div class="btn-group btn-group--end">' +
            '<button type="button" class="btn btn--primary" id="tabelCekBtn">Periksa Tabel</button>' +
            '</div>' +
            (TC.diag ? buildDiagnosaFeedback(TC.diag, TC.attempts, 'tanda ✓') : ''))
    );
  }

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(D) +
    buildDlPanel(
      '<p class="dl-caption" style="margin-top:0;">📋 Data kartu survei</p>' +
        buildSurveiCards(true),
      'panel--info'
    ) +
    panahHTML +
    tabelHTML +
    (PC.done && TC.done ? buildDlNextButton('koleksiNextBtn', D.nextLabel, true) : '') +
    '</section>';

  if (!PC.done) {
    bindArrowDiagram(container, 'kolPanah', SURVEI.A, SURVEI.B, P, function (hasil) {
      pesanKetuk(hasil);
      PC.diag = null;
      saveState();
      rerender();
    });
    document.getElementById('panahCekBtn').addEventListener('click', function () {
      if (!P.pairs.length) {
        showNotice('Tarik minimal satu panah lebih dulu.');
        return;
      }
      periksaRelasi(SURVEI.pairs, P, PC);
      rerender();
    });
  }

  if (PC.done && !TC.done) {
    bindRelationTable(container, 'kolTabel', SURVEI.A, SURVEI.B, T, function () {
      TC.diag = null;
      saveState();
      rerender();
    });
    document.getElementById('tabelCekBtn').addEventListener('click', function () {
      if (!T.pairs.length) {
        showNotice('Beri minimal satu tanda ✓ lebih dulu.');
        return;
      }
      periksaRelasi(SURVEI.pairs, T, TC);
      rerender();
    });
  }

  bindNext('koleksiNextBtn', 'koleksi', 'olahPasangan');
}

/* ============================================================
   8. STAGE: OLAH PASANGAN BERURUTAN  (Discovery Learning — sintaks 4)
   A. Memilih semua pasangan berurutan yang benar (chip acak).
   B. Pertanyaan penuntun: urutan, banyak pasangan, anggota tanpa
      pasangan (opsi acak, boleh coba lagi sampai benar).
   ============================================================ */

function chipTepat() {
  var pilih = State.chipPilih;
  return (
    pilih.length === CHIP_BENAR.length &&
    CHIP_BENAR.every(function (id) {
      return pilih.indexOf(id) !== -1;
    })
  );
}

/* Pesan pemeriksaan chip; chip terlewat baru ditunjukkan mulai percobaan kedua. */
function chipPesan() {
  var terpilihBenar = State.chipPilih.filter(function (id) {
    return CHIP_BENAR.indexOf(id) !== -1;
  }).length;
  var salah = State.chipPilih.length - terpilihBenar;
  var kurang = CHIP_BENAR.length - terpilihBenar;
  var poin = ['<strong>Belum tepat.</strong>'];
  if (salah) poin.push('Ada ' + salah + ' chip merah yang bukan pasangan relasi ini.');
  if (kurang) {
    poin.push(
      State.chipCek.attempts >= 2
        ? 'Chip bergaris putus-putus adalah pasangan yang terlewat.'
        : 'Masih ada ' + kurang + ' pasangan yang terlewat — cocokkan dengan panah pada diagram.'
    );
  }
  poin.push('Ketuk chip untuk memperbaiki pilihanmu.');
  return poin.join(' ');
}

function renderOlahPasangan(container) {
  var D = DATA.olahPasangan;
  var K = DATA.koleksi;
  var C = State.chipCek;

  function rerender() {
    renderOlahPasangan(container);
  }

  var chipHTML = buildDlPanel(
    '<p class="exercise-label">' +
      esc(D.instruksiChip) +
      '</p>' +
      buildPairChips('chip', D.chips, State.chipOrder, State.chipPilih, {
        periksa: C.periksa || C.done,
        benar: CHIP_BENAR,
        terlewat: C.done || C.attempts >= 2,
        locked: C.done,
      }) +
      (C.done
        ? '<div style="margin-top:var(--space-3);">' +
          buildFeedbackBox('success', '✓', esc(D.temuanChip)) +
          '</div>' +
          '<p class="pasangan-box">R = ' +
          esc(formatRelasiPasangan(normalisasiRelasi(SURVEI.pairs, SURVEI.A, SURVEI.B))) +
          '</p>'
        : (C.periksa
            ? '<div style="margin-top:var(--space-3);">' +
              buildFeedbackBox('warning', '💭', chipPesan()) +
              '</div>'
            : '') +
          '<div class="btn-group btn-group--end">' +
          '<button type="button" class="btn btn--primary" id="chipCekBtn">Periksa Pasangan</button>' +
          '</div>')
  );

  var tanyaHTML = C.done
    ? buildDlPanel(buildGuidedQuizList(D.tanya, State.tanyaOrders, State.tanyaPilih))
    : '';
  var semuaBenar = C.done && guidedQuizAllCorrect(D.tanya, State.tanyaPilih);

  container.innerHTML =
    '<section aria-label="Mengolah Data: Pasangan Berurutan">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        D.pengantar +
        '</p>' +
        buildArrowDiagram('opPanah', SURVEI.A, SURVEI.B, SURVEI.pairs, {
          labelA: K.labelA,
          labelB: K.labelB,
          namaRelasi: K.namaRelasi,
        }),
      'panel--info'
    ) +
    chipHTML +
    tanyaHTML +
    (semuaBenar ? buildDlNextButton('opNextBtn', D.nextLabel, true) : '') +
    '</section>';

  if (!C.done) {
    bindPairChips(container, 'chip', { terpilih: State.chipPilih }, function () {
      C.periksa = false;
      saveState();
      rerender();
    });
    document.getElementById('chipCekBtn').addEventListener('click', function () {
      if (!State.chipPilih.length) {
        showNotice('Pilih minimal satu pasangan berurutan.');
        return;
      }
      C.attempts++;
      C.done = chipTepat();
      C.periksa = !C.done;
      saveState();
      rerender();
    });
  }

  bindGuidedQuizList(container, D.tanya, State.tanyaPilih, saveState, rerender);
  bindNext('opNextBtn', 'olahPasangan', 'olahRelasi');
}

/* ============================================================
   9. STAGE: OLAH KONSEP RELASI  (Discovery Learning — sintaks 4)
   A. Pertanyaan penuntun: relasi, domain, kodomain, range.
   B. Memilah nama relasi bilangan (butir & opsi acak).
   ============================================================ */

function renderOlahRelasi(container) {
  var D = DATA.olahRelasi;
  var K = DATA.koleksi;

  function rerender() {
    renderOlahRelasi(container);
  }

  var konsepBenar = guidedQuizAllCorrect(D.konsep, State.konsepPilih);
  var namaSelesai = sortItemsAllAnswered(NAMA_ITEMS, State.namaStates);

  container.innerHTML =
    '<section aria-label="Mengolah Data: Konsep Relasi">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        D.pengantar +
        '</p>' +
        buildArrowDiagram('orPanah', SURVEI.A, SURVEI.B, SURVEI.pairs, {
          labelA: K.labelA,
          labelB: K.labelB,
          namaRelasi: K.namaRelasi,
        }),
      'panel--info'
    ) +
    buildDlPanel(buildGuidedQuizList(D.konsep, State.konsepOrders, State.konsepPilih)) +
    (konsepBenar
      ? buildDlPanel(
          '<p class="exercise-label">' +
            esc(D.instruksiNama) +
            '</p>' +
            buildSortItems(NAMA_ITEMS, State.namaOrder, D.opsiNama, State.namaStates, {
              mono: true,
            })
        )
      : '') +
    (konsepBenar && namaSelesai ? buildDlNextButton('orNextBtn', D.nextLabel, true) : '') +
    '</section>';

  bindGuidedQuizList(container, D.konsep, State.konsepPilih, saveState, rerender);
  bindSortItems(container, NAMA_ITEMS, State.namaStates, saveState, rerender);
  bindNext('orNextBtn', 'olahRelasi', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A. Menguji temuan pada relasi "faktor dari": diagram panah murid
      → tabel & pasangan berurutan otomatis.
   B. Menanggapi empat miskonsepsi (opsi acak, sekali jawab).
   ============================================================ */

function verifSoalSemuaDijawab() {
  return State.verifExercises.every(function (e) {
    return !!e.chosen;
  });
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var S = DATA.stimulasi;
  var U = D.uji;
  var P = State.ujiPanah;
  var C = State.ujiCek;
  var opts = { labelA: U.labelA, labelB: U.labelB, namaRelasi: U.namaRelasi };

  function rerender() {
    renderVerifikasi(container);
  }

  var ujiHTML;
  if (C.done) {
    ujiHTML =
      buildFeedbackBox('success', '✓', esc(D.temuanUji)) +
      buildTigaPenyajian('vfTiga', U, opts) +
      '<div style="margin-top:var(--space-3);">' +
      buildFeedbackBox(
        State.stimulasiPilihan === 'paragraf' ? 'info' : 'success',
        State.stimulasiPilihan === 'paragraf' ? '🔄' : '👏',
        esc(D.kesimpulanDugaan[State.stimulasiPilihan] || D.kesimpulanTiga) +
          '<br><br>' +
          esc(D.kesimpulanTiga)
      ) +
      '</div>';
  } else {
    ujiHTML =
      '<p>' +
      esc(D.instruksiUji) +
      '</p>' +
      buildPilihStatus(P, U.A) +
      buildArrowDiagram(
        'vfPanah',
        U.A,
        U.B,
        P.pairs,
        Object.assign({}, opts, {
          interactive: true,
          selected: P.selected,
          salah: pasanganSalah(C),
        })
      ) +
      '<div class="btn-group btn-group--end">' +
      '<button type="button" class="btn btn--primary" id="ujiCekBtn">Periksa Diagram</button>' +
      '</div>' +
      (C.diag ? buildDiagnosaFeedback(C.diag, C.attempts, 'panah') : '');
  }

  var soalHTML = '';
  if (C.done) {
    soalHTML = buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.instruksiSoal) +
        '</p>' +
        D.soal
          .map(function (q, i) {
            var ex = State.verifExercises[i];
            return (
              '<div class="sort-item">' +
              '<p class="sort-item__text">' +
              q.pernyataan +
              '</p>' +
              buildChoiceGroup(q.options, ex.optionOrder, {
                chosen: ex.chosen,
                correctId: q.correct,
                grade: true,
                locked: true,
                group: q.id,
                attr: 'data-verif-opt',
              }) +
              (ex.chosen ? buildOnceFeedback(ex.correct, q.explanation) : '') +
              '</div>'
            );
          })
          .join('')
    );
  }

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin:0;">' +
        esc(D.prediksiLabel) +
        ': <strong>' +
        esc(
          State.stimulasiPilihan ? findOptionLabel(S.opsi, State.stimulasiPilihan) : 'belum diisi'
        ) +
        '</strong>' +
        (State.stimulasiAlasan ? '<br><em>“' + esc(State.stimulasiAlasan) + '”</em>' : '') +
        '</p>' +
        (State.masalahHipotesis
          ? '<p style="margin:var(--space-2) 0 0;">' +
            esc(D.hipotesisLabel) +
            ': <em>“' +
            esc(State.masalahHipotesis) +
            '”</em></p>'
          : ''),
      'panel--warning'
    ) +
    buildDlPanel(ujiHTML) +
    soalHTML +
    (C.done && verifSoalSemuaDijawab()
      ? buildDlNextButton('verifNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  if (!C.done) {
    bindArrowDiagram(container, 'vfPanah', U.A, U.B, P, function (hasil) {
      pesanKetuk(hasil);
      C.diag = null;
      saveState();
      rerender();
    });
    document.getElementById('ujiCekBtn').addEventListener('click', function () {
      if (!P.pairs.length) {
        showNotice('Tarik minimal satu panah lebih dulu.');
        return;
      }
      periksaRelasi(U.pairs, P, C);
      rerender();
    });
  }

  container.querySelectorAll('[data-verif-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = -1;
      D.soal.forEach(function (q, k) {
        if (q.id === btn.dataset.group) i = k;
      });
      var ex = State.verifExercises[i];
      if (!ex || ex.chosen) return;
      ex.chosen = btn.dataset.verifOpt;
      ex.correct = ex.chosen === D.soal[i].correct;
      saveState();
      rerender();
    });
  });

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
  var K = DATA.koleksi;
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
          '<h3 style="margin-top:0;">Rangkuman Relasi</h3>' +
            buildTigaPenyajian('genTiga', SURVEI, {
              labelA: K.labelA,
              labelB: K.labelB,
              namaRelasi: K.namaRelasi,
            }) +
            '<ol class="objectives-list">' +
            D.rangkuman
              .map(function (r, i) {
                return (
                  '<li><span class="objectives-list__num">' +
                  (i + 1) +
                  '</span><span>' +
                  r +
                  '</span></li>'
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
   createExerciseStage (shared/engine.js) dengan soal 'choice';
   urutan opsi dari ex.optionOrder yang diacak di initExerciseArrays().
   Soal bervisual menampilkan relasi sebagai diagram panah, tabel
   silang, atau tabel daftar.
   ============================================================ */

function buildVisualSoal(s) {
  var R = s.relasi;
  if (!s.visual || !R) return '';
  var opts = { labelA: R.labelA, labelB: R.labelB, namaRelasi: R.namaRelasi };
  if (s.visual === 'panah') return buildArrowDiagram('trPanah', R.A, R.B, R.pairs, opts);
  if (s.visual === 'tabel') return buildRelationTable('trTabel', R.A, R.B, R.pairs, opts);
  return buildRelationListTable(R.A, R.pairs, opts);
}

var TerapkanStage = createExerciseStage({
  soal: DATA.terapkan.soal,
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
  defaultType: 'choice',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  renderPrompt: function (s) {
    return (
      '<div class="dl-prompt">' +
      '<span class="konteks-chip">' +
      esc(s.konteks) +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
      buildVisualSoal(s) +
      '<p class="dl-prompt__tanya">' +
      esc(s.pertanyaan) +
      '</p>' +
      (s.hints && s.hints.length
        ? '<details class="soal-hint"><summary>💡 Petunjuk</summary><ul>' +
          s.hints
            .map(function (h) {
              return '<li>' + esc(h) + '</li>';
            })
            .join('') +
          '</ul></details>'
        : '') +
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
  var sekali = [State.panahCek, State.tabelCek, State.chipCek].filter(function (c) {
    return c.done && c.attempts === 1;
  }).length;
  var namaBenar = sortItemsCorrectCount(NAMA_ITEMS, State.namaStates);
  var verifBenar = State.verifExercises.filter(function (e) {
    return e.correct;
  }).length;
  var terapBenar = State.terapkanExercises.filter(function (e) {
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
        kartu(sekali + '/3', 'Penyajian tepat sekali periksa') +
        kartu(namaBenar + '/' + NAMA_ITEMS.length, 'Nama relasi dipilah benar') +
        kartu(verifBenar + '/' + DATA.verifikasi.soal.length, 'Miskonsepsi ditanggapi benar') +
        kartu(terapBenar + '/' + DATA.terapkan.soal.length, 'Uji terap benar') +
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
    '<div class="sajian-trio">' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">➡️</span>Diagram panah</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">▦</span>Tabel</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">( , )</span>Pasangan berurutan</div>' +
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
    'Kemampuan murid memberi contoh relasi dari lingkungannya dan mengubah satu penyajian ke penyajian lain dengan alasan yang tepat tetap menjadi bahan penilaian utama.' +
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
  olahPasangan: renderOlahPasangan,
  olahRelasi: renderOlahRelasi,
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
