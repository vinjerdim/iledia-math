'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Bunga Tunggal pada Transaksi Simpan Pinjam
   Fase F — SMK RPL

   Utilitas bersama (esc, parseInputInt, showNotice,
   buildFeedbackBox, buildProgressDots, mesin navigasi tahap,
   createStore, ensureExerciseArray) berada di shared/engine.js.

   Alur tahap mengikuti sintaks Problem-Based Learning; lihat
   komentar kepala pada data.js untuk pemetaannya.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Model Perhitungan (dipakai bersama tahap 4, 5, dan 6)
    6. Stage: Orientasi Masalah        (PBL fase 1)
    7. Stage: Rencana Penyelidikan     (PBL fase 2)
    8. Stage: Penyelidikan Terbimbing  (PBL fase 3 — 3 tahap)
    9. Stage: Simulator & Hasil Karya  (PBL fase 4)
   10. Stage: Uji Terap                (PBL fase 5)
   11. Stage: Refleksi                 (PBL fase 5)
   12. Stage: Selesai
   13. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'organisasi',
  'selidikSimpan',
  'selidikFlat',
  'selidikMenurun',
  'simulator',
  'evaluasi',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Masalah',
  'Rencana',
  'Simpan',
  'Skema A',
  'Skema B',
  'Simulator',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-1-4-simpan-pinjam-v1';

/* Tahap penyelidikan (PBL fase 3) dan kunci datanya di DATA.penyelidikan. */
var PENYELIDIKAN = [
  { stage: 'selidikSimpan', key: 'simpan', next: 'selidikFlat', nextLabel: 'Lanjut: Skema A →' },
  { stage: 'selidikFlat', key: 'flat', next: 'selidikMenurun', nextLabel: 'Lanjut: Skema B →' },
  { stage: 'selidikMenurun', key: 'menurun', next: 'simulator', nextLabel: 'Lanjut: Simulator →' },
];

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Tahap 1 — orientasi masalah */
  prediksiPilihan: null,
  prediksiAlasan: '',

  /* Tahap 2 — rencana penyelidikan */
  ekstraksiInputs: [],
  ekstraksiDone: [],
  ekstraksiHint: [],
  peranDipilih: [],

  /* Tahap 3–5 — penyelidikan terbimbing (diisi ensurePenyelidikanState) */
  penyelidikan: {},
  penyelidikanHint: null,

  /* Tahap 6 — simulator & hasil karya */
  simM0: '',
  simN: '',
  simIA: '',
  simIB: '',
  simDone: false,
  karyaText: '',
  karyaSaved: false,

  /* Tahap 7 — uji terap */
  evaluasiIdx: 0,
  evaluasiExercises: [],

  /* Tahap 8 — refleksi */
  refleksiAnswers: {},
  refleksiSaved: false,
};

var Store = createStore({ key: STORAGE_KEY, state: State });
var saveState = Store.save;
var loadState = Store.load;

function clearState() {
  Store.reset();
  initExerciseArrays();
}

/*
 * Membangun (atau memperbaiki) State.penyelidikan agar bentuknya selalu
 * sesuai DATA.penyelidikan — satu entri per tahap penyelidikan, dengan
 * jumlah kasus dan jumlah langkah yang benar.
 */
function ensurePenyelidikanState() {
  if (!State.penyelidikan || typeof State.penyelidikan !== 'object') State.penyelidikan = {};
  PENYELIDIKAN.forEach(function (p) {
    var kasusList = DATA.penyelidikan[p.key].kasus;
    var st = State.penyelidikan[p.key];
    var valid =
      st &&
      Array.isArray(st.reveal) &&
      st.reveal.length === kasusList.length &&
      Array.isArray(st.inputs) &&
      st.inputs.length === kasusList.length &&
      Array.isArray(st.done) &&
      st.done.length === kasusList.length &&
      kasusList.every(function (k, i) {
        return (
          Array.isArray(st.inputs[i]) &&
          st.inputs[i].length === k.steps.length &&
          Array.isArray(st.done[i]) &&
          st.done[i].length === k.steps.length
        );
      });
    if (valid) return;
    State.penyelidikan[p.key] = {
      kasusIdx: 0,
      reveal: kasusList.map(function () {
        return 1;
      }),
      inputs: kasusList.map(function (k) {
        return k.steps.map(function () {
          return '';
        });
      }),
      done: kasusList.map(function (k) {
        return k.steps.map(function () {
          return false;
        });
      }),
    };
  });
}

function initExerciseArrays() {
  ensureExerciseArray(State, 'evaluasiExercises', DATA.evaluasi.soal, function () {
    return {
      attempts: 0,
      hintLevel: 0,
      correct: false,
      userInput: '',
      chosen: null,
      checked: false,
      revealed: false,
    };
  });
  ensureExerciseArray(State, 'ekstraksiInputs', DATA.organisasi.ekstraksi.soal, function () {
    return '';
  });
  ensureExerciseArray(State, 'ekstraksiDone', DATA.organisasi.ekstraksi.soal, function () {
    return false;
  });
  ensureExerciseArray(State, 'ekstraksiHint', DATA.organisasi.ekstraksi.soal, function () {
    return false;
  });
  if (!Array.isArray(State.peranDipilih)) State.peranDipilih = [];
  ensurePenyelidikanState();
  if (!State.simM0) State.simM0 = DATA.simulator.defaults.m0;
  if (!State.simN) State.simN = DATA.simulator.defaults.n;
  if (!State.simIA) State.simIA = DATA.simulator.defaults.iA;
  if (!State.simIB) State.simIB = DATA.simulator.defaults.iB;
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

/* Kepala tahap dengan penanda fase PBL — dipakai semua tahap. */
function buildStageHead(kicker, goal) {
  return (
    '<div class="stage-head">' +
    '<span class="pbl-badge">' +
    esc(kicker) +
    '</span>' +
    (goal ? '<p class="stage-head__goal">Tujuan: ' + esc(goal) + '</p>' : '') +
    '</div>'
  );
}

function buildNextButton(id, label) {
  return (
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary btn--large" id="' +
    id +
    '">' +
    esc(label) +
    '</button></div>'
  );
}

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  container.innerHTML = '';
  updateProgress();

  var penyelidikan = PENYELIDIKAN.filter(function (p) {
    return p.stage === State.currentStage;
  })[0];
  if (penyelidikan) {
    renderPenyelidikan(container, penyelidikan);
    return;
  }

  switch (State.currentStage) {
    case 'orientasi':
      renderOrientasi(container);
      break;
    case 'organisasi':
      renderOrganisasi(container);
      break;
    case 'simulator':
      renderSimulator(container);
      break;
    case 'evaluasi':
      renderEvaluasi(container);
      break;
    case 'refleksi':
      renderRefleksi(container);
      break;
    case 'selesai':
      renderSelesai(container);
      break;
    default:
      container.innerHTML = '<p style="padding:var(--space-5);">Tahap tidak ditemukan.</p>';
  }
}

/* ============================================================
   5. MODEL PERHITUNGAN

   Satu-satunya tempat rumus kedua skema dituliskan. Dipakai
   bersama oleh tahap Skema A, Skema B, dan Simulator supaya
   tidak ada rumus yang terduplikasi.

   m0 rupiah, n bulan, iA & iB berupa pecahan (0,015 untuk 1,5%).
   ============================================================ */

function hitungSkema(m0, n, iA, iB) {
  /* Skema A — bunga flat: barisan aritmetika dengan b = m0 · iA */
  var bungaFlatPerBulan = m0 * iA;
  var totalBungaFlat = n * bungaFlatPerBulan;
  var totalBayarFlat = m0 + totalBungaFlat;
  var angsuranFlat = totalBayarFlat / n;

  /* Skema B — bunga menurun: deret aritmetika, U1 = m0 · iB, b = −pokok · iB */
  var pokokPerBulan = m0 / n;
  var bungaAwal = m0 * iB;
  var bungaAkhir = pokokPerBulan * iB;
  var bedaBunga = -pokokPerBulan * iB;
  var totalBungaMenurun = (n / 2) * (bungaAwal + bungaAkhir);
  var totalBayarMenurun = m0 + totalBungaMenurun;

  /* Titik impas: bunga menurun berhenti lebih murah saat iB melewati nilai ini. */
  var impasIB = (2 * n * iA) / (n + 1);

  return {
    m0: m0,
    n: n,
    iA: iA,
    iB: iB,
    bungaFlatPerBulan: bungaFlatPerBulan,
    totalBungaFlat: totalBungaFlat,
    totalBayarFlat: totalBayarFlat,
    angsuranFlat: angsuranFlat,
    pokokPerBulan: pokokPerBulan,
    bungaAwal: bungaAwal,
    bungaAkhir: bungaAkhir,
    bedaBunga: bedaBunga,
    totalBungaMenurun: totalBungaMenurun,
    totalBayarMenurun: totalBayarMenurun,
    selisih: totalBayarFlat - totalBayarMenurun,
    impasIB: impasIB,
  };
}

/* Bunga Skema B pada bulan ke-k (k mulai dari 1). */
function bungaMenurunBulanKe(hasil, k) {
  return hasil.iB * (hasil.m0 - (k - 1) * hasil.pokokPerBulan);
}

/* ============================================================
   6. STAGE: ORIENTASI MASALAH (PBL FASE 1)
   ============================================================ */

function buildSchemeCards(skemaList) {
  return (
    '<div class="scheme-grid">' +
    skemaList
      .map(function (s) {
        return (
          '<div class="scheme-card scheme-card--' +
          esc(s.id) +
          '">' +
          '<div class="scheme-card__head">' +
          '<span class="scheme-card__kode" aria-hidden="true">' +
          esc(s.kode) +
          '</span>' +
          '<span class="scheme-card__nama">' +
          esc(s.nama) +
          '</span>' +
          '</div>' +
          '<div class="scheme-card__rate">' +
          formatDesimal(s.rate) +
          '% / bulan' +
          '<small>dari ' +
          esc(s.dasar) +
          '</small>' +
          '</div>' +
          '<ul class="scheme-card__poin">' +
          s.poin
            .map(function (p) {
              return '<li>' + p + '</li>';
            })
            .join('') +
          '</ul>' +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

function buildPanduanGuru(panduan) {
  return (
    '<details class="guide-details">' +
    '<summary>🧑‍🏫 ' +
    esc(panduan.judul) +
    '</summary>' +
    '<p style="font-size:0.85rem;margin-top:var(--space-3);">' +
    esc(panduan.ringkas) +
    '</p>' +
    '<div style="overflow-x:auto;">' +
    '<table class="guide-table">' +
    '<thead><tr><th>Sintaks PBL</th><th>Tahap Media</th><th>Menit</th>' +
    '<th>Aktivitas Peserta Didik</th><th>Peran Guru</th></tr></thead>' +
    '<tbody>' +
    panduan.baris
      .map(function (b) {
        return (
          '<tr><td>' +
          esc(b.fase) +
          '</td><td>' +
          esc(b.tahap) +
          '</td><td>' +
          b.menit +
          "'</td><td>" +
          esc(b.siswa) +
          '</td><td>' +
          esc(b.guru) +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table></div>' +
    '<p style="font-size:0.82rem;color:var(--color-ink-muted);margin:var(--space-3) 0 0;">' +
    esc(panduan.catatan) +
    '</p>' +
    '</details>'
  );
}

function renderOrientasi(container) {
  var data = DATA.masalah;
  var sudahPrediksi = State.prediksiPilihan !== null;

  var opsiHTML = data.prediksi.opsi
    .map(function (o) {
      var aktif = State.prediksiPilihan === o.id;
      return (
        '<button type="button" class="choice-btn' +
        (aktif ? ' is-selected' : '') +
        '" aria-pressed="' +
        (aktif ? 'true' : 'false') +
        '" data-pred="' +
        esc(o.id) +
        '">' +
        '<span class="choice-btn__icon" aria-hidden="true">' +
        (aktif ? '✓' : '') +
        '</span>' +
        o.label +
        '</button>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Orientasi pada masalah">' +
    buildStageHead(
      'TAHAP 1 · PBL FASE 1 — ORIENTASI PADA MASALAH',
      'Memahami masalah nyata simpan pinjam yang akan dipecahkan dengan barisan dan deret aritmetika.'
    ) +
    '<div class="panel panel--hero">' +
    '<h2>' +
    esc(data.title) +
    '</h2>' +
    '<p style="font-size:1.02rem;"><strong>Tujuan Pembelajaran:</strong><br>' +
    esc(DATA.meta.goal) +
    '</p>' +
    '<p>' +
    data.skenario +
    '</p>' +
    '<div class="problem-quote"><p>' +
    data.klien +
    '</p></div>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>Brosur Koperasi — Dua Skema Bunga Tunggal</h3>' +
    buildSchemeCards(data.skema) +
    '<div class="panel panel--compact panel--warning" style="margin-bottom:0;">' +
    '<h4 style="color:var(--color-warning-strong);">Pertanyaan yang Harus Dijawab Tim</h4>' +
    '<ul style="margin-bottom:0;">' +
    data.pertanyaanPemantik
      .map(function (p) {
        return '<li>' + p + '</li>';
      })
      .join('') +
    '</ul>' +
    '</div>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>🤔 Dugaan Awalmu</h3>' +
    '<p>' +
    data.prediksi.pertanyaan +
    '</p>' +
    '<div class="challenge-options" id="predOptions">' +
    opsiHTML +
    '</div>' +
    '<div class="field-group">' +
    '<label for="predAlasan">Alasan dugaanmu</label>' +
    '<textarea id="predAlasan" class="input-textarea" rows="3" placeholder="' +
    esc(data.prediksi.alasanPlaceholder) +
    '">' +
    esc(State.prediksiAlasan) +
    '</textarea>' +
    '</div>' +
    '<p style="font-size:0.84rem;color:var(--color-ink-muted);margin-bottom:0;">' +
    esc(data.prediksi.catatan) +
    '</p>' +
    '</div>' +
    buildPanduanGuru(data.panduanGuru) +
    (sudahPrediksi
      ? buildNextButton('startBtn', 'Mulai Penyelidikan →')
      : '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" disabled>Pilih dugaanmu dulu</button>' +
        '</div>') +
    '</section>';

  container.querySelectorAll('[data-pred]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.prediksiPilihan = btn.dataset.pred;
      saveState();
      renderOrientasi(container);
    });
  });

  var alasanEl = document.getElementById('predAlasan');
  if (alasanEl) {
    alasanEl.addEventListener('input', function () {
      State.prediksiAlasan = alasanEl.value;
      saveState();
    });
  }

  var startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', function () {
      completeStage('orientasi');
      navigateTo('organisasi');
    });
  }
}

/* ============================================================
   7. STAGE: RENCANA PENYELIDIKAN (PBL FASE 2)
   ============================================================ */

function nilaiEkstraksi(soal, raw) {
  var parsed = soal.decimal ? parseInputDecimal(raw) : parseInputInt(raw, true);
  if (parsed.error) return { error: parsed.error, benar: false };
  return { error: null, benar: hampirSama(parsed.value, soal.answer) };
}

function renderOrganisasi(container) {
  var data = DATA.organisasi;
  var soalList = data.ekstraksi.soal;

  var semuaBenar = State.ekstraksiDone.every(function (d) {
    return d;
  });
  var adaPeran = State.peranDipilih.length > 0;
  var siapLanjut = semuaBenar && adaPeran;

  var kartuHTML = data.kartu
    .map(function (k) {
      return (
        '<div class="plan-card">' +
        '<div class="plan-card__title">' +
        k.ikon +
        ' ' +
        esc(k.judul) +
        '</div>' +
        '<ul>' +
        k.isi
          .map(function (t) {
            return '<li>' + esc(t) + '</li>';
          })
          .join('') +
        '</ul></div>'
      );
    })
    .join('');

  var ekstraksiHTML = soalList
    .map(function (s, i) {
      var done = State.ekstraksiDone[i];
      var statusCls = 'extract-item__status';
      var statusText = '';
      if (done) {
        statusCls += ' extract-item__status--ok';
        statusText = '✓ Tepat';
      } else if (State.ekstraksiHint[i]) {
        statusText = '💡 ' + s.hint;
      }
      return (
        '<div class="extract-item' +
        (done ? ' is-correct' : '') +
        '">' +
        '<label for="ex_' +
        esc(s.id) +
        '">' +
        esc(s.label) +
        '</label>' +
        '<input type="text" inputmode="decimal" id="ex_' +
        esc(s.id) +
        '" class="input-text" data-ex-idx="' +
        i +
        '" value="' +
        esc(State.ekstraksiInputs[i]) +
        '" placeholder="' +
        esc(s.placeholder) +
        '"' +
        (done ? ' readonly' : '') +
        '>' +
        '<div class="' +
        statusCls +
        '">' +
        esc(statusText) +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  var peranHTML = data.peran.opsi
    .map(function (p) {
      var aktif = State.peranDipilih.indexOf(p.id) !== -1;
      return (
        '<button type="button" class="role-chip' +
        (aktif ? ' is-selected' : '') +
        '" data-peran="' +
        esc(p.id) +
        '" aria-pressed="' +
        (aktif ? 'true' : 'false') +
        '">' +
        '<span class="role-chip__nama">' +
        p.ikon +
        ' ' +
        esc(p.nama) +
        '</span>' +
        '<span class="role-chip__desc">' +
        esc(p.desc) +
        '</span>' +
        '</button>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Rencana penyelidikan">' +
    buildStageHead(
      'TAHAP 2 · PBL FASE 2 — MENGORGANISASI PENYELIDIKAN',
      'Membedah masalah menjadi data, pertanyaan, dan rencana kerja tim.'
    ) +
    '<div class="panel">' +
    '<h3>' +
    esc(data.title) +
    '</h3>' +
    '<p style="font-size:0.9rem;color:var(--color-ink-muted);">' +
    esc(data.instruction) +
    '</p>' +
    '<div class="plan-grid">' +
    kartuHTML +
    '</div>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>🔢 ' +
    esc(data.ekstraksi.judul) +
    '</h3>' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);">' +
    esc(data.ekstraksi.instruction) +
    '</p>' +
    '<div class="extract-grid">' +
    ekstraksiHTML +
    '</div>' +
    (semuaBenar
      ? buildFeedbackBox(
          'success',
          '✓',
          '<strong>Data lengkap dan tepat.</strong> Inilah empat parameter yang nanti masuk ke fungsi di aplikasimu.'
        )
      : '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary" id="cekDataBtn">Periksa Data</button>' +
        '<button type="button" class="btn btn--ghost btn--small" id="hintDataBtn">💡 Petunjuk</button>' +
        '</div>') +
    '</div>' +
    '<div class="panel">' +
    '<h3>👥 ' +
    esc(data.peran.judul) +
    '</h3>' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);">' +
    esc(data.peran.instruction) +
    '</p>' +
    '<div class="role-grid">' +
    peranHTML +
    '</div>' +
    '</div>' +
    (siapLanjut
      ? buildNextButton('nextOrgBtn', 'Mulai Menyelidiki: Sisi Simpanan →')
      : '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" disabled>' +
        (semuaBenar ? 'Pilih minimal satu peran' : 'Lengkapi data yang benar dulu') +
        '</button></div>') +
    '</section>';

  container.querySelectorAll('[data-ex-idx]').forEach(function (inp) {
    var i = parseInt(inp.dataset.exIdx, 10);
    inp.addEventListener('input', function () {
      State.ekstraksiInputs[i] = inp.value;
      saveState();
    });
    inp.addEventListener('keydown', function (e) {
      var btn = document.getElementById('cekDataBtn');
      if (e.key === 'Enter' && btn) btn.click();
    });
  });

  var cekBtn = document.getElementById('cekDataBtn');
  if (cekBtn) {
    cekBtn.addEventListener('click', function () {
      var adaKosong = false;
      soalList.forEach(function (s, i) {
        var hasil = nilaiEkstraksi(s, State.ekstraksiInputs[i]);
        if (hasil.error === 'empty') adaKosong = true;
        State.ekstraksiDone[i] = hasil.benar;
      });
      saveState();
      renderOrganisasi(container);
      showNotice(
        adaKosong
          ? 'Masih ada kotak yang kosong.'
          : State.ekstraksiDone.every(function (d) {
                return d;
              })
            ? 'Semua data tepat!'
            : 'Sebagian data belum tepat. Cek ulang brosurnya.'
      );
    });
  }

  var hintBtn = document.getElementById('hintDataBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      State.ekstraksiHint = State.ekstraksiHint.map(function () {
        return true;
      });
      saveState();
      renderOrganisasi(container);
    });
  }

  container.querySelectorAll('[data-peran]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.peran;
      var pos = State.peranDipilih.indexOf(id);
      if (pos === -1) State.peranDipilih.push(id);
      else State.peranDipilih.splice(pos, 1);
      saveState();
      renderOrganisasi(container);
    });
  });

  var nextBtn = document.getElementById('nextOrgBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('organisasi');
      navigateTo('selidikSimpan');
    });
  }
}

/* ============================================================
   8. STAGE: PENYELIDIKAN TERBIMBING (PBL FASE 3)

   Satu perender untuk tiga tahap (Simpan, Skema A, Skema B).
   Alur tiap kasus: ungkap tabel baris demi baris → kerjakan
   langkah berpandu satu per satu → rumus & koneksi terbuka.
   ============================================================ */

function buildDataTable(table, revealCount) {
  var headHTML = table.head
    .map(function (h) {
      return '<th>' + esc(h) + '</th>';
    })
    .join('');

  var bodyHTML = table.rows
    .map(function (row, i) {
      var revealed = i < revealCount;
      var trCls = '';
      if (!revealed) trCls = ' class="is-hidden"';
      else if (i === revealCount - 1 && revealCount > 1) trCls = ' class="is-new"';
      var cells = row
        .map(function (cell, j) {
          if (j === 0) return '<td>' + esc(cell) + '</td>';
          if (!revealed) return '<td>?</td>';
          var cls = j === table.highlight ? ' class="is-highlight"' : '';
          return '<td' + cls + '>' + esc(cell) + '</td>';
        })
        .join('');
      return '<tr' + trCls + '>' + cells + '</tr>';
    })
    .join('');

  return (
    '<div style="overflow-x:auto;">' +
    '<table class="data-table"><thead><tr>' +
    headHTML +
    '</tr></thead><tbody>' +
    bodyHTML +
    '</tbody></table></div>'
  );
}

function buildStepCard(step, nomor, nilaiInput, sudahBenar, tampilHint) {
  var body;
  if (sudahBenar) {
    body = buildFeedbackBox('success', '✓', '<strong>Tepat!</strong> ' + step.explanation);
  } else {
    body =
      '<div class="step-card__row">' +
      '<input type="text" inputmode="numeric" class="input-text" id="stepInput" value="' +
      esc(nilaiInput) +
      '" placeholder="Jawaban..." aria-label="Jawaban langkah ' +
      nomor +
      '">' +
      (step.unit ? '<span class="step-card__unit">' + esc(step.unit) + '</span>' : '') +
      '<button type="button" class="btn btn--primary" id="stepCheckBtn">Periksa</button>' +
      '<button type="button" class="btn btn--ghost btn--small" id="stepHintBtn">💡 Petunjuk</button>' +
      '</div>' +
      (tampilHint
        ? '<div style="margin-top:var(--space-3);">' +
          buildFeedbackBox('warning', '💡', '<strong>Petunjuk:</strong> ' + step.hint) +
          '</div>'
        : '');
  }

  return (
    '<div class="step-card' +
    (sudahBenar ? ' is-done' : '') +
    '">' +
    '<div class="step-card__question">' +
    '<span class="step-card__num">' +
    nomor +
    '</span>' +
    step.question +
    '</div>' +
    body +
    '</div>'
  );
}

function buildKoneksiPanel(koneksi) {
  return (
    '<div class="panel panel--compact panel--info">' +
    '<p><strong>🔗 </strong>' +
    koneksi.penjelasan +
    '</p>' +
    '<ul style="margin-bottom:0;">' +
    koneksi.poin
      .map(function (p) {
        return '<li>' + p + '</li>';
      })
      .join('') +
    '</ul></div>'
  );
}

function kasusSelesai(st, kasusIdx) {
  return st.done[kasusIdx].every(function (d) {
    return d;
  });
}

function renderPenyelidikan(container, meta) {
  var cfg = DATA.penyelidikan[meta.key];
  var st = State.penyelidikan[meta.key];
  var kasusIdx = st.kasusIdx;
  var kasus = cfg.kasus[kasusIdx];
  var revealCount = st.reveal[kasusIdx];
  var totalBaris = kasus.table.rows.length;
  var semuaTerungkap = revealCount >= totalBaris;
  var selesaiKasusIni = kasusSelesai(st, kasusIdx);
  var semuaKasusSelesai = cfg.kasus.every(function (k, i) {
    return kasusSelesai(st, i);
  });

  /* Tab antar kasus hanya perlu bila tahap ini memuat lebih dari satu kasus. */
  var tabsHTML = '';
  if (cfg.kasus.length > 1) {
    tabsHTML =
      '<div class="case-tabs">' +
      cfg.kasus
        .map(function (k, i) {
          var done = kasusSelesai(st, i);
          return (
            '<button type="button" class="stage-nav__item' +
            (done ? ' is-complete' : '') +
            '"' +
            (i === kasusIdx ? ' aria-current="step"' : '') +
            ' data-kasus="' +
            i +
            '">' +
            '<span class="stage-nav__num">' +
            (done ? '&#10003;' : i + 1) +
            '</span>' +
            esc(k.tab) +
            '</button>'
          );
        })
        .join('') +
      '</div>';
  }

  /* Langkah berpandu dibuka satu per satu, dan baru muncul setelah
     seluruh baris tabel diamati. */
  var langkahHTML = '';
  if (!semuaTerungkap) {
    langkahHTML =
      '<p style="font-size:0.88rem;color:var(--color-ink-muted);">' +
      'Ungkap seluruh baris tabel dulu — amati polanya sebelum menghitung.' +
      '</p>';
  } else {
    var stepAktif = -1;
    for (var i = 0; i < kasus.steps.length; i++) {
      var sudah = st.done[kasusIdx][i];
      if (sudah || stepAktif === -1) {
        langkahHTML += buildStepCard(
          kasus.steps[i],
          i + 1,
          st.inputs[kasusIdx][i],
          sudah,
          !sudah && State.penyelidikanHint === kasus.steps[i].id
        );
      }
      if (!sudah) {
        if (stepAktif === -1) stepAktif = i;
        break;
      }
    }
  }

  var hasilHTML = '';
  if (selesaiKasusIni) {
    hasilHTML =
      '<div class="formula-box formula-box--' +
      esc(kasus.formula.variant) +
      '">' +
      '<div class="formula-box__label">' +
      esc(kasus.formula.label) +
      '</div>' +
      '<div class="formula-box__expr">' +
      esc(kasus.formula.expr) +
      '</div>' +
      '<div class="formula-box__note">' +
      esc(kasus.formula.note) +
      '</div>' +
      '</div>' +
      buildKoneksiPanel(kasus.koneksi);
  }

  var lanjutHTML = '';
  if (semuaKasusSelesai) {
    lanjutHTML = buildNextButton('nextSelidikBtn', meta.nextLabel);
  } else if (selesaiKasusIni && cfg.kasus.length > 1) {
    lanjutHTML =
      '<div class="btn-group btn-group--end">' +
      '<button type="button" class="btn btn--primary" id="kasusBerikutBtn">Kasus Berikutnya →</button>' +
      '</div>';
  }

  container.innerHTML =
    '<section aria-label="' +
    esc(cfg.title) +
    '">' +
    buildStageHead(cfg.kicker, cfg.goal) +
    '<div class="panel">' +
    '<h3>' +
    esc(cfg.title) +
    '</h3>' +
    '<p style="font-size:0.9rem;color:var(--color-ink-muted);">' +
    esc(cfg.instruction) +
    '</p>' +
    tabsHTML +
    '<span class="case-badge">' +
    esc(kasus.badge) +
    '</span>' +
    '<div class="case-story">' +
    '<span class="case-story__ikon" aria-hidden="true">' +
    kasus.ikon +
    '</span>' +
    '<div class="case-story__body"><p>' +
    kasus.story +
    '</p></div>' +
    '</div>' +
    buildDataTable(kasus.table, revealCount) +
    '<p style="font-size:0.84rem;color:var(--color-ink-muted);">' +
    esc(kasus.table.note) +
    '</p>' +
    (semuaTerungkap
      ? ''
      : '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary" id="revealBtn">' +
        esc(kasus.table.revealLabel) +
        ' (' +
        revealCount +
        '/' +
        totalBaris +
        ')</button>' +
        '<button type="button" class="btn btn--ghost btn--small" id="revealAllBtn">Ungkap Semua</button>' +
        '</div>') +
    '</div>' +
    '<div class="panel">' +
    '<h3>🔎 Langkah Penyelidikan</h3>' +
    langkahHTML +
    hasilHTML +
    '</div>' +
    lanjutHTML +
    '</section>';

  container.querySelectorAll('[data-kasus]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      st.kasusIdx = parseInt(btn.dataset.kasus, 10);
      saveState();
      renderPenyelidikan(container, meta);
    });
  });

  var revealBtn = document.getElementById('revealBtn');
  if (revealBtn) {
    revealBtn.addEventListener('click', function () {
      st.reveal[kasusIdx] = Math.min(totalBaris, st.reveal[kasusIdx] + 1);
      saveState();
      renderPenyelidikan(container, meta);
    });
  }

  var revealAllBtn = document.getElementById('revealAllBtn');
  if (revealAllBtn) {
    revealAllBtn.addEventListener('click', function () {
      st.reveal[kasusIdx] = totalBaris;
      saveState();
      renderPenyelidikan(container, meta);
    });
  }

  /* Indeks langkah yang sedang dikerjakan (langkah pertama yang belum benar). */
  var aktifIdx = -1;
  for (var j = 0; j < kasus.steps.length; j++) {
    if (!st.done[kasusIdx][j]) {
      aktifIdx = j;
      break;
    }
  }

  var stepInput = document.getElementById('stepInput');
  var stepCheckBtn = document.getElementById('stepCheckBtn');
  var stepHintBtn = document.getElementById('stepHintBtn');

  if (stepInput && stepCheckBtn) {
    stepInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') stepCheckBtn.click();
    });
  }

  if (stepCheckBtn && aktifIdx !== -1) {
    stepCheckBtn.addEventListener('click', function () {
      var raw = stepInput ? stepInput.value : '';
      var parsed = parseInputInt(raw, true);
      st.inputs[kasusIdx][aktifIdx] = raw;
      if (parsed.error) {
        saveState();
        showNotice(
          parsed.error === 'empty'
            ? 'Isi jawabanmu terlebih dahulu.'
            : 'Tulis bilangan tanpa huruf, contoh: 120000 atau 120.000.'
        );
        return;
      }
      var benar = parsed.value === kasus.steps[aktifIdx].answer;
      st.done[kasusIdx][aktifIdx] = benar;
      if (!benar) State.penyelidikanHint = kasus.steps[aktifIdx].id;
      saveState();
      renderPenyelidikan(container, meta);
      if (!benar) showNotice('Belum tepat. Periksa lagi petunjuknya.');
    });
  }

  if (stepHintBtn && aktifIdx !== -1) {
    stepHintBtn.addEventListener('click', function () {
      State.penyelidikanHint = kasus.steps[aktifIdx].id;
      saveState();
      renderPenyelidikan(container, meta);
    });
  }

  var kasusBerikutBtn = document.getElementById('kasusBerikutBtn');
  if (kasusBerikutBtn) {
    kasusBerikutBtn.addEventListener('click', function () {
      for (var k = 0; k < cfg.kasus.length; k++) {
        if (!kasusSelesai(st, k)) {
          st.kasusIdx = k;
          break;
        }
      }
      saveState();
      renderPenyelidikan(container, meta);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var nextBtn = document.getElementById('nextSelidikBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage(meta.stage);
      navigateTo(meta.next);
    });
  }
}

/* ============================================================
   9. STAGE: SIMULATOR & HASIL KARYA (PBL FASE 4)
   ============================================================ */

function bacaInputSimulator() {
  var data = DATA.simulator;
  var m0 = parseInputInt(State.simM0, true);
  var n = parseInputInt(State.simN, true);
  var iA = parseInputDecimal(State.simIA);
  var iB = parseInputDecimal(State.simIB);
  var errors = { m0: '', n: '', iA: '', iB: '' };
  var valid = true;

  if (m0.error || m0.value < data.batas.m0.min || m0.value > data.batas.m0.max) {
    errors.m0 = data.batas.m0.pesan;
    valid = false;
  }
  if (n.error || n.value < data.batas.n.min || n.value > data.batas.n.max) {
    errors.n = data.batas.n.pesan;
    valid = false;
  }
  if (iA.error || iA.value < data.batas.i.min || iA.value > data.batas.i.max) {
    errors.iA = data.batas.i.pesan;
    valid = false;
  }
  if (iB.error || iB.value < data.batas.i.min || iB.value > data.batas.i.max) {
    errors.iB = data.batas.i.pesan;
    valid = false;
  }

  return {
    valid: valid,
    errors: errors,
    m0: m0.value,
    n: n.value,
    iA: iA.value,
    iB: iB.value,
  };
}

function buildAmortTable(hasil) {
  var rows = '';
  for (var k = 1; k <= hasil.n; k++) {
    var bungaB = bungaMenurunBulanKe(hasil, k);
    var angsuranB = hasil.pokokPerBulan + bungaB;
    var pokokPct = (hasil.pokokPerBulan / angsuranB) * 100;
    rows +=
      '<tr>' +
      '<td class="td-k">' +
      k +
      '</td>' +
      '<td class="td-flat">' +
      formatNumber(hasil.angsuranFlat) +
      '</td>' +
      '<td class="td-menurun">' +
      formatNumber(bungaB) +
      '</td>' +
      '<td class="td-menurun">' +
      formatNumber(angsuranB) +
      '</td>' +
      '<td><div class="amort-bar">' +
      '<div class="amort-bar__pokok" style="width:' +
      pokokPct.toFixed(1) +
      '%"></div>' +
      '<div class="amort-bar__bunga--menurun" style="width:' +
      (100 - pokokPct).toFixed(1) +
      '%"></div>' +
      '</div></td>' +
      '</tr>';
  }

  return (
    '<div class="amort-legend">' +
    '<span><i class="amort-bar__pokok"></i> Cicilan pokok</span>' +
    '<span><i class="amort-bar__bunga--menurun"></i> Bunga Skema B</span>' +
    '</div>' +
    '<div style="overflow:auto;max-height:420px;">' +
    '<table class="amort-table"><thead><tr>' +
    '<th class="th-k">Bulan</th>' +
    '<th class="th-flat">Skema A — Angsuran</th>' +
    '<th class="th-menurun">Skema B — Bunga</th>' +
    '<th class="th-menurun">Skema B — Angsuran</th>' +
    '<th class="th-menurun">Komposisi B</th>' +
    '</tr></thead><tbody>' +
    rows +
    '</tbody></table></div>'
  );
}

function buildHasilSimulator(hasil) {
  var menurunMenang = hasil.selisih > 0.5;
  var flatMenang = hasil.selisih < -0.5;

  var verdict;
  if (menurunMenang) {
    verdict =
      '<div class="sim-verdict">🏆 <strong>Skema B (bunga menurun)</strong> lebih hemat <strong>Rp ' +
      formatNumber(hasil.selisih) +
      '</strong> untuk kondisi ini.</div>';
  } else if (flatMenang) {
    verdict =
      '<div class="sim-verdict">🏆 <strong>Skema A (bunga flat)</strong> lebih hemat <strong>Rp ' +
      formatNumber(-hasil.selisih) +
      '</strong> untuk kondisi ini.</div>';
  } else {
    verdict =
      '<div class="sim-verdict sim-verdict--netral">⚖️ Kedua skema menghasilkan total yang sama.</div>';
  }

  return (
    '<div class="sim-result">' +
    '<div class="sim-card sim-card--flat' +
    (flatMenang ? ' sim-card--winner' : '') +
    '">' +
    '<div class="sim-card__label">Skema A — Bunga Flat</div>' +
    '<div class="sim-card__value">Rp ' +
    formatNumber(hasil.totalBayarFlat) +
    '</div>' +
    '<div class="sim-card__meta">' +
    'Bunga tetap Rp ' +
    formatNumber(hasil.bungaFlatPerBulan) +
    '/bln<br>' +
    'Total bunga Rp ' +
    formatNumber(hasil.totalBungaFlat) +
    '<br>' +
    'Angsuran tetap Rp ' +
    formatNumber(hasil.angsuranFlat) +
    '</div></div>' +
    '<div class="sim-card sim-card--menurun' +
    (menurunMenang ? ' sim-card--winner' : '') +
    '">' +
    '<div class="sim-card__label">Skema B — Bunga Menurun</div>' +
    '<div class="sim-card__value">Rp ' +
    formatNumber(hasil.totalBayarMenurun) +
    '</div>' +
    '<div class="sim-card__meta">' +
    'U₁ = Rp ' +
    formatNumber(hasil.bungaAwal) +
    ', b = −Rp ' +
    formatNumber(-hasil.bedaBunga) +
    '<br>' +
    'S<sub>' +
    hasil.n +
    '</sub> = Rp ' +
    formatNumber(hasil.totalBungaMenurun) +
    '<br>' +
    'Angsuran Rp ' +
    formatNumber(hasil.pokokPerBulan + hasil.bungaAwal) +
    ' → Rp ' +
    formatNumber(hasil.pokokPerBulan + hasil.bungaAkhir) +
    '</div></div>' +
    '</div>' +
    verdict +
    '<p class="sim-insight">Titik impas: dengan bunga flat ' +
    formatDesimal(hasil.iA * 100) +
    '% dan tenor ' +
    hasil.n +
    ' bulan, skema menurun berhenti lebih murah saat bunganya melewati <strong>' +
    formatDesimal(hasil.impasIB * 100) +
    '% per bulan</strong> — dari rumus i<sub>B</sub> = 2·n·i<sub>A</sub> / (n + 1).</p>' +
    buildAmortTable(hasil)
  );
}

function renderSimulator(container) {
  var data = DATA.simulator;
  var baca = bacaInputSimulator();
  var hasilHTML = '';

  if (State.simDone && baca.valid) {
    hasilHTML = buildHasilSimulator(hitungSkema(baca.m0, baca.n, baca.iA / 100, baca.iB / 100));
  }

  var siapLanjut = State.simDone && State.karyaSaved;

  var spesHTML = data.spesifikasi.baris
    .map(function (b) {
      return '<tr><td>' + esc(b.nama) + '</td><td>' + esc(b.rumus) + '</td></tr>';
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Simulator dan hasil karya">' +
    buildStageHead(data.kicker, data.goal) +
    '<div class="panel">' +
    '<h3>🧮 ' +
    esc(data.title) +
    '</h3>' +
    '<p style="font-size:0.9rem;color:var(--color-ink-muted);">' +
    esc(data.instruction) +
    '</p>' +
    '<div class="sim-panel">' +
    '<div class="sim-inputs">' +
    '<div class="field-group" style="margin:0;">' +
    '<label for="simM0">Pokok Pinjaman M₀ (Rp)</label>' +
    '<input type="text" inputmode="numeric" id="simM0" class="input-text" value="' +
    esc(State.simM0) +
    '">' +
    '<div class="field-error">' +
    esc(State.simDone ? baca.errors.m0 : '') +
    '</div>' +
    '</div>' +
    '<div class="field-group" style="margin:0;">' +
    '<label for="simN">Lama Pinjaman n (bulan)</label>' +
    '<input type="text" inputmode="numeric" id="simN" class="input-text" value="' +
    esc(State.simN) +
    '">' +
    '<div class="field-error">' +
    esc(State.simDone ? baca.errors.n : '') +
    '</div>' +
    '</div>' +
    '<div class="field-group" style="margin:0;">' +
    '<label for="simIA">Bunga Flat Skema A (%/bulan)</label>' +
    '<input type="text" inputmode="decimal" id="simIA" class="input-text" value="' +
    esc(State.simIA) +
    '">' +
    '<div class="field-error">' +
    esc(State.simDone ? baca.errors.iA : '') +
    '</div>' +
    '</div>' +
    '<div class="field-group" style="margin:0;">' +
    '<label for="simIB">Bunga Menurun Skema B (%/bulan)</label>' +
    '<input type="text" inputmode="decimal" id="simIB" class="input-text" value="' +
    esc(State.simIB) +
    '">' +
    '<div class="field-error">' +
    esc(State.simDone ? baca.errors.iB : '') +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="btn-group">' +
    '<button type="button" class="btn btn--primary" id="simHitungBtn">Hitung & Bandingkan</button>' +
    '<button type="button" class="btn btn--ghost btn--small" id="simResetBtn">Kembalikan ke Kasus Bu Mira</button>' +
    '</div>' +
    '<div id="simHasil" style="margin-top:var(--space-4);">' +
    hasilHTML +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>⚙️ ' +
    esc(data.spesifikasi.judul) +
    '</h3>' +
    '<div style="overflow-x:auto;">' +
    '<table class="spec-table"><thead><tr><th>Fungsi</th><th>Rumus (i dalam pecahan)</th></tr></thead>' +
    '<tbody>' +
    spesHTML +
    '</tbody></table></div>' +
    '<p style="font-size:0.84rem;color:var(--color-ink-muted);margin-bottom:0;">' +
    esc(data.spesifikasi.catatan) +
    '</p>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>📝 ' +
    esc(data.karya.judul) +
    '</h3>' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);">' +
    esc(data.karya.instruction) +
    '</p>' +
    '<div class="field-group">' +
    '<label for="karyaText">Naskah rekomendasi</label>' +
    '<textarea id="karyaText" class="input-textarea" rows="5" placeholder="' +
    esc(data.karya.placeholder) +
    '"' +
    (State.karyaSaved ? ' readonly' : '') +
    '>' +
    esc(State.karyaText) +
    '</textarea>' +
    '<div class="field-hint" id="karyaHint">' +
    State.karyaText.trim().length +
    ' / ' +
    data.karya.minKarakter +
    ' karakter minimum' +
    '</div>' +
    '</div>' +
    (State.karyaSaved
      ? buildFeedbackBox(
          'success',
          '✓',
          '<strong>Rekomendasi tersimpan.</strong> Siap dipresentasikan di depan kelas.'
        ) +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn--ghost btn--small" id="karyaEditBtn">Ubah Rekomendasi</button>' +
        '</div>'
      : '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary" id="karyaSaveBtn">Simpan Rekomendasi</button>' +
        '</div>') +
    '</div>' +
    (siapLanjut
      ? buildNextButton('nextSimBtn', 'Lanjut: Uji Terap →')
      : '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--large" disabled>' +
        (State.simDone ? 'Simpan rekomendasimu dulu' : 'Jalankan simulator dulu') +
        '</button></div>') +
    '</section>';

  ['simM0', 'simN', 'simIA', 'simIB'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function () {
      State[id] = el.value;
      saveState();
    });
    el.addEventListener('keydown', function (e) {
      var btn = document.getElementById('simHitungBtn');
      if (e.key === 'Enter' && btn) btn.click();
    });
  });

  var hitungBtn = document.getElementById('simHitungBtn');
  if (hitungBtn) {
    hitungBtn.addEventListener('click', function () {
      State.simDone = true;
      saveState();
      renderSimulator(container);
      var cek = bacaInputSimulator();
      if (!cek.valid) {
        showNotice('Ada nilai yang belum valid — periksa pesan di bawah kotak isian.');
        return;
      }
      var hasilEl = document.getElementById('simHasil');
      if (hasilEl) hasilEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  var simResetBtn = document.getElementById('simResetBtn');
  if (simResetBtn) {
    simResetBtn.addEventListener('click', function () {
      State.simM0 = data.defaults.m0;
      State.simN = data.defaults.n;
      State.simIA = data.defaults.iA;
      State.simIB = data.defaults.iB;
      State.simDone = true;
      saveState();
      renderSimulator(container);
    });
  }

  var karyaEl = document.getElementById('karyaText');
  var karyaHint = document.getElementById('karyaHint');
  if (karyaEl && !State.karyaSaved) {
    karyaEl.addEventListener('input', function () {
      State.karyaText = karyaEl.value;
      saveState();
      if (karyaHint) {
        karyaHint.textContent =
          State.karyaText.trim().length + ' / ' + data.karya.minKarakter + ' karakter minimum';
      }
    });
  }

  var karyaSaveBtn = document.getElementById('karyaSaveBtn');
  if (karyaSaveBtn) {
    karyaSaveBtn.addEventListener('click', function () {
      if (State.karyaText.trim().length < data.karya.minKarakter) {
        showNotice(data.karya.pesanKurang);
        return;
      }
      State.karyaSaved = true;
      saveState();
      renderSimulator(container);
      showNotice('Rekomendasi tersimpan!');
    });
  }

  var karyaEditBtn = document.getElementById('karyaEditBtn');
  if (karyaEditBtn) {
    karyaEditBtn.addEventListener('click', function () {
      State.karyaSaved = false;
      saveState();
      renderSimulator(container);
    });
  }

  var nextBtn = document.getElementById('nextSimBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('simulator');
      navigateTo('evaluasi');
    });
  }
}

/* ============================================================
   10. STAGE: UJI TERAP (PBL FASE 5)

   Memakai createExerciseStage dari shared/engine.js: tahap ini
   mencampur soal isian numerik dan pilihan ganda dalam satu
   rangkaian, dengan petunjuk berjenjang (s.hints).
   ============================================================ */

var evaluasiExercise = createExerciseStage({
  soal: DATA.evaluasi.soal,
  getExercises: function () {
    return State.evaluasiExercises;
  },
  getIndex: function () {
    return State.evaluasiIdx;
  },
  setIndex: function (i) {
    State.evaluasiIdx = i;
  },
  save: saveState,
  idPrefix: 'eval',

  checkValue: function (s) {
    return s.answer;
  },
  revealText: function (s) {
    return '<strong>Jawaban:</strong> ' + s.explanation;
  },
  inputSuffix: function (s) {
    return s.unit ? '<span class="step-card__unit">' + esc(s.unit) + '</span>' : '';
  },

  buildHead: function () {
    return buildStageHead(DATA.evaluasi.kicker, DATA.evaluasi.goal);
  },
  renderPrompt: function (s) {
    return (
      '<span class="type-badge type-badge--' +
      esc(s.tipe) +
      '">' +
      esc(s.tipeBadge) +
      '</span>' +
      (s.konteks
        ? '<div class="konteks-box">' +
          '<span class="konteks-box__label">KONTEKS</span>' +
          '<p>' +
          s.konteks +
          '</p></div>'
        : '') +
      '<p>' +
      s.question +
      '</p>'
    );
  },
  buildChoiceFeedback: function (s, ex) {
    return buildFeedbackBox(
      ex.correct ? 'success' : 'info',
      ex.correct ? '✓' : '💡',
      (ex.correct ? '<strong>Benar!</strong> ' : '<strong>Jawaban tepat:</strong> ') + s.explanation
    );
  },

  inputRowClass: 'answer-row',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  revealButtonStyle: 'separate',
  revealAfterAttempts: 2,
  showAttemptErrorWithHint: true,
  stripPunctuation: true,
  inputPlaceholder: 'Jawaban...',
  inputAriaLabel: 'Jawaban soal uji terap',
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  invalidMessage: 'Tulis bilangan tanpa huruf, contoh: 891000 atau 891.000.',

  sectionLabel: 'Uji terap',
  instruction: DATA.evaluasi.instruction,
  nextStageId: 'refleksi',
  completeStageId: 'evaluasi',
  nextButtonLabel: 'Lanjut: Refleksi →',
});

function renderEvaluasi(container) {
  evaluasiExercise.render(container);
}

/* ============================================================
   11. STAGE: REFLEKSI (PBL FASE 5)
   ============================================================ */

function buildPredictRecall() {
  var opsi = DATA.masalah.prediksi.opsi.filter(function (o) {
    return o.id === State.prediksiPilihan;
  })[0];
  if (!opsi) return '';
  var alasan = State.prediksiAlasan.trim();
  return (
    '<div class="predict-recall">' +
    '<div class="predict-recall__label">Dugaanmu di Tahap 1</div>' +
    '<div class="predict-recall__item">' +
    opsi.label +
    '</div>' +
    (alasan
      ? '<div class="predict-recall__item predict-recall__quote">“' + esc(alasan) + '”</div>'
      : '') +
    '<div class="predict-recall__item"><strong>Temuan penyelidikan:</strong> Skema A Rp 7.080.000 vs Skema B Rp 6.780.000 — Skema B lebih hemat Rp 300.000.</div>' +
    '</div>'
  );
}

function renderRefleksi(container) {
  var data = DATA.refleksi;
  var saved = State.refleksiSaved;

  var fieldsHTML = data.soal
    .map(function (q, i) {
      var val = State.refleksiAnswers[q.id] || '';
      return (
        '<div class="field-group">' +
        '<label for="refl_' +
        esc(q.id) +
        '" style="font-weight:500;">' +
        (i + 1) +
        '. ' +
        q.question +
        '</label>' +
        '<textarea id="refl_' +
        esc(q.id) +
        '" class="input-textarea" rows="3" placeholder="' +
        esc(q.placeholder) +
        '"' +
        (saved ? ' readonly' : '') +
        '>' +
        esc(val) +
        '</textarea>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Refleksi">' +
    buildStageHead(data.kicker, data.goal) +
    '<div class="panel">' +
    '<h3>' +
    esc(data.title) +
    '</h3>' +
    buildPredictRecall() +
    '<div class="panel panel--compact panel--warning" style="margin-bottom:var(--space-4);">' +
    '<p style="margin:0;font-size:0.88rem;">' +
    data.note +
    '</p></div>' +
    fieldsHTML +
    (!saved
      ? '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary" id="saveReflBtn">Simpan Refleksi</button></div>'
      : '') +
    '</div>' +
    (saved ? buildNextButton('nextReflBtn', 'Selesai →') : '') +
    '</section>';

  data.soal.forEach(function (q) {
    var el = document.getElementById('refl_' + q.id);
    if (el && !saved) {
      el.addEventListener('input', function () {
        State.refleksiAnswers[q.id] = el.value;
        saveState();
      });
    }
  });

  var saveBtn = document.getElementById('saveReflBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      State.refleksiSaved = true;
      completeStage('refleksi');
      saveState();
      renderRefleksi(container);
      showNotice('Refleksi tersimpan!');
    });
  }

  var nextBtn = document.getElementById('nextReflBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      navigateTo('selesai');
    });
  }
}

/* ============================================================
   12. STAGE: SELESAI
   ============================================================ */

function renderSelesai(container) {
  var data = DATA.selesai;
  var benar = State.evaluasiExercises.filter(function (e) {
    return e.correct;
  }).length;
  var total = DATA.evaluasi.soal.length;

  var rumusHTML = data.rumus
    .map(function (r) {
      return (
        '<div class="rumus-card rumus-card--' +
        esc(r.variant) +
        '">' +
        '<div class="rumus-card__judul">' +
        esc(r.judul) +
        '</div>' +
        '<div class="rumus-card__expr">' +
        esc(r.expr) +
        '</div>' +
        '<p class="rumus-card__desc">' +
        esc(r.desc) +
        '</p></div>'
      );
    })
    .join('');

  var karya = State.karyaText.trim();
  var karyaHTML = karya
    ? '<div class="karya-box">' +
      '<div class="karya-box__label">Rekomendasi Timmu untuk Bu Mira</div>' +
      '<p>' +
      esc(karya) +
      '</p></div>'
    : '';

  container.innerHTML =
    '<section aria-label="Selesai" style="text-align:center;">' +
    '<div class="stage-head">' +
    '<span class="pbl-badge">TAHAP 9 — MASALAH TERPECAHKAN 🎉</span>' +
    '</div>' +
    '<div class="panel panel--hero" style="max-width:660px;margin:0 auto var(--space-5);">' +
    '<div style="font-size:3rem;margin-bottom:var(--space-3);">🏆</div>' +
    '<h2>Kasus Bu Mira Selesai!</h2>' +
    '<p style="font-size:1.02rem;margin-top:var(--space-3);">Skor Uji Terap kamu: <strong>' +
    benar +
    ' dari ' +
    total +
    ' soal benar</strong></p>' +
    '<p style="margin-bottom:0;">Rekomendasi tim: <strong>Skema B (bunga menurun)</strong> — total Rp 6.780.000, lebih hemat Rp 300.000 daripada Skema A.</p>' +
    '</div>' +
    karyaHTML +
    '<div class="rumus-grid" style="max-width:900px;margin:0 auto var(--space-5);">' +
    rumusHTML +
    '</div>' +
    '<div class="panel panel--compact" style="max-width:700px;margin:0 auto var(--space-5);text-align:left;">' +
    '<h3>Poin Kunci yang Telah Kamu Terapkan</h3>' +
    '<ul style="margin-bottom:0;">' +
    data.poinKunci
      .map(function (p) {
        return '<li>' + p + '</li>';
      })
      .join('') +
    '</ul></div>' +
    '<div class="btn-group" style="justify-content:center;gap:var(--space-3);flex-wrap:wrap;">' +
    '<button type="button" class="btn btn--ghost" id="ulangBtn">↩ Ulangi dari Awal</button>' +
    '<a href="../../index.html" class="btn btn--primary">Kembali ke Beranda</a>' +
    '</div>' +
    '</section>';

  completeStage('selesai');

  var ulangBtn = document.getElementById('ulangBtn');
  if (ulangBtn) {
    ulangBtn.addEventListener('click', function () {
      if (confirm('Reset semua progress dan mulai dari awal?')) {
        clearState();
        saveState();
        updateStageNav();
        updateProgress();
        navigateTo('orientasi');
      }
    });
  }
}

/* ============================================================
   13. INIT
   ============================================================ */

function init() {
  buildStageNav();
  loadState();
  initExerciseArrays();
  updateStageNav();
  updateProgress();
  renderCurrentStage();

  var resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (confirm('Reset semua progress pembelajaran?')) {
        clearState();
        saveState();
        updateStageNav();
        updateProgress();
        navigateTo('orientasi');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
