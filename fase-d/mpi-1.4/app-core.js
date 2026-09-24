'use strict';

/* ============================================================
   app-core.js — Konstanta, state & storage, pengacakan pilihan,
   navigasi, dan helper render yang dipakai beberapa tahap.
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).

   Seluruh pilihan jawaban DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder()/ensureSortStates()/ensureOrderPicker().
   Pengacakan dilakukan SEKALI di initExerciseArrays(), lalu urutannya
   disimpan di State — bukan saat render — sehingga pilihan tidak
   melompat-lompat saat tahap dirender ulang, tetapi teracak ulang
   untuk setiap murid dan setiap kali Reset.
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'organisasi',
  'selidikSederhana',
  'latihSederhana',
  'selidikSamakan',
  'latihSamakan',
  'karya',
  'evaluasi',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Orientasi',
  'Organisasi',
  'Selidik 1',
  'Latih 1',
  'Selidik 2',
  'Latih 2',
  'Karya',
  'Evaluasi',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-d-1-4-pecahan-pbl-v1';

/* Pecahan bazar dalam bentuk paling sederhana & per-KPK (dipakai tahap karya). */
var BAZAR_KPK = kpkBanyak(
  DATA.bazar.map(function (b) {
    return sederhanakanPecahan(b.num, b.den).den;
  })
);
var BAZAR = DATA.bazar.map(function (b) {
  var s = sederhanakanPecahan(b.num, b.den);
  return {
    id: b.id,
    nama: b.nama,
    ikon: b.ikon,
    num: b.num,
    den: b.den,
    sNum: s.num,
    sDen: s.den,
    fpb: s.fpb,
    kNum: (s.num * BAZAR_KPK) / s.den,
  };
});

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Tahap 1 — orientasi */
  dugaanOrder: null,
  dugaan: null,
  pemantikOrder: null,
  pemantikPilih: null,

  /* Tahap 2 — organisasi */
  pilahStates: {},
  pilahOrder: null,
  rencana: null,

  /* Tahap 3 — penyelidikan 1 */
  labSederhana: {},
  sederhanaSteps: [],
  sederhanaSimpulOrder: null,
  sederhanaSimpul: null,

  /* Tahap 4 — latihan menyederhanakan */
  latihSIdx: 0,
  latihSStates: [],

  /* Tahap 5 — penyelidikan 2 */
  labSamakan: null,
  samakanSteps: [],
  samakanSimpulOrder: null,
  samakanSimpul: null,

  /* Tahap 6 — latihan menyamakan penyebut */
  latihMIdx: 0,
  latihMStates: [],

  /* Tahap 7 — karya */
  karyaA: [],
  karyaKpk: null,
  karyaNum: [],
  karyaUrut: null,
  karyaPesan: '',

  /* Tahap 8 — evaluasi */
  evalStates: {},
  evalOrder: null,
  transferStates: [],

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

function ensureObject(key) {
  if (!State[key] || typeof State[key] !== 'object' || Array.isArray(State[key])) State[key] = {};
}

function ensureIndex(key, total) {
  if (typeof State[key] !== 'number' || State[key] < 0 || State[key] >= total) State[key] = 0;
}

function makeLatihState(s) {
  return {
    raw: {},
    raws: [],
    attempts: 0,
    chosen: null,
    correct: false,
    done: false,
    pesan: '',
    optionOrder: s.opsi ? shuffleArray(optionIds(s.opsi)) : null,
  };
}

/*
 * Menyiapkan seluruh state per-soal DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1 */
  ensureShuffledOrder(State, 'dugaanOrder', DATA.orientasi.dugaan.opsi);
  ensureShuffledOrder(State, 'pemantikOrder', DATA.orientasi.pemantik.opsi);

  /* Tahap 2 */
  ensureSortStates(
    State,
    'pilahStates',
    'pilahOrder',
    DATA.organisasi.pilah,
    DATA.organisasi.pilahOpsi
  );
  ensureOrderPicker(State, 'rencana', DATA.organisasi.rencana);

  /* Tahap 3 */
  ensureObject('labSederhana');
  DATA.selidikSederhana.lab.forEach(function (it) {
    var st = State.labSederhana[it.id];
    if (!st || typeof st !== 'object' || !Array.isArray(st.tried)) {
      st = { order: null, tried: [], k: null, found: false };
    }
    ensureShuffledOrder(st, 'order', it.kandidat);
    State.labSederhana[it.id] = st;
  });
  ensureExerciseArray(State, 'sederhanaSteps', DATA.selidikSederhana.langkah, makeDlStep);
  ensureShuffledOrder(State, 'sederhanaSimpulOrder', DATA.selidikSederhana.simpulan.opsi);

  /* Tahap 4 */
  ensureExerciseArray(State, 'latihSStates', DATA.latihSederhana.soal, makeLatihState);
  ensureIndex('latihSIdx', DATA.latihSederhana.soal.length);

  /* Tahap 5 */
  var ls = State.labSamakan;
  if (!ls || typeof ls !== 'object' || !Array.isArray(ls.tried)) {
    ls = { order: null, tried: [], n: null, found: false };
  }
  ensureShuffledOrder(ls, 'order', DATA.selidikSamakan.kandidat);
  State.labSamakan = ls;
  ensureExerciseArray(State, 'samakanSteps', DATA.selidikSamakan.langkah, makeDlStep);
  ensureShuffledOrder(State, 'samakanSimpulOrder', DATA.selidikSamakan.simpulan.opsi);

  /* Tahap 6 */
  ensureExerciseArray(State, 'latihMStates', DATA.latihSamakan.soal, makeLatihState);
  ensureIndex('latihMIdx', DATA.latihSamakan.soal.length);

  /* Tahap 7 */
  ensureExerciseArray(State, 'karyaA', BAZAR, function () {
    return { raw: {}, attempts: 0, correct: false, pesan: '' };
  });
  if (!State.karyaKpk || typeof State.karyaKpk !== 'object') State.karyaKpk = makeDlStep();
  ensureExerciseArray(State, 'karyaNum', BAZAR, makeDlStep);
  ensureOrderPicker(
    State,
    'karyaUrut',
    BAZAR.map(function (b) {
      return { id: b.id, label: b.nama };
    })
  );
  if (typeof State.karyaPesan !== 'string') State.karyaPesan = '';

  /* Tahap 8 */
  ensureSortStates(
    State,
    'evalStates',
    'evalOrder',
    DATA.evaluasi.pernyataan,
    DATA.evaluasi.pilahOpsi
  );
  ensureExerciseArray(State, 'transferStates', DATA.evaluasi.transfer, function (s) {
    return { chosen: null, correct: false, optionOrder: shuffleArray(optionIds(s.opsi)) };
  });

  /* Tahap 9 */
  ensureObject('refleksiAnswers');
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
  render: function () {
    renderCurrentStage();
  },
});

var navigateTo = StageMachine.navigateTo;
var completeStage = StageMachine.completeStage;
var updateStageNav = StageMachine.updateStageNav;
var buildStageNav = StageMachine.buildStageNav;
var updateProgress = StageMachine.updateProgress;

/* ============================================================
   4. HELPER RENDER
   ============================================================ */

/* Kepala tahap (bertanda sintaks PBL) + catatan peran guru. */
function buildHead(D) {
  return buildDiscoveryHead(D.kicker, D.goal, D.syntax) + buildTeacherNote(D.guru);
}

/* Memasang tombol lanjut yang menyelesaikan tahap ini lalu pindah tahap. */
function bindNext(id, stageId, nextStageId, guard) {
  var btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', function () {
    if (guard && !guard()) return;
    completeStage(stageId);
    navigateTo(nextStageId);
  });
}

/*
 * Pilihan "coba lagi sampai benar": jawaban benar baru ditandai setelah
 * dipilih; pilihan salah memberi umpan balik khusus per opsi.
 *   Q      { tanya, opsi, correct, umpan: { <id>: html } }
 *   order  urutan acak id opsi (dari State)
 *   attr   atribut data unik untuk tombol pilihan
 */
function buildRetryChoice(Q, order, chosen, attr) {
  var benar = chosen === Q.correct;
  return (
    '<p class="exercise-label">' +
    esc(Q.tanya) +
    '</p>' +
    buildChoiceGroup(Q.opsi, order, {
      chosen: chosen,
      correctId: benar ? Q.correct : null,
      grade: true,
      locked: benar,
      attr: attr,
    }) +
    (chosen
      ? '<div style="margin-top:var(--space-3);">' +
        buildFeedbackBox(benar ? 'success' : 'warning', benar ? '✓' : '💭', Q.umpan[chosen]) +
        '</div>'
      : '')
  );
}

/* Memasang event buildRetryChoice; `onPick(id)` dipanggil untuk pilihan baru. */
function bindRetryChoice(root, attr, isLocked, onPick) {
  root.querySelectorAll('[' + attr + ']').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (isLocked()) return;
      onPick(btn.getAttribute(attr));
    });
  });
}

/* Semua langkah isian bertahap selesai? */
function stepsDone(steps) {
  return steps.every(function (st) {
    return st.done;
  });
}

/*
 * Rangkaian langkah isian bertahap: langkah berikutnya baru muncul
 * setelah langkah sebelumnya benar.
 */
function buildStepChain(prefix, langkah, states) {
  var html = '';
  for (var i = 0; i < langkah.length; i++) {
    html += buildDlStep(prefix + i, states[i], langkah[i], i + 1);
    if (!states[i].done) break;
  }
  return html;
}

function bindStepChain(prefix, langkah, states, rerender) {
  langkah.forEach(function (step, i) {
    bindDlStep(prefix + i, states[i], step, saveState, rerender);
  });
}

function pesanInputPecahan(error) {
  if (error === 'empty') return 'Isi pembilang dan penyebut lebih dulu.';
  if (error === 'zero-den') return 'Penyebut tidak boleh 0.';
  return 'Isi kotak hanya dengan angka (bilangan cacah).';
}

/* Umpan balik isian "sederhanakan": menunjuk letak kesalahannya. */
function pesanSederhana(v, asal) {
  var d = diagnosaSederhana(v, asal);
  if (d === 'tepat') return { ok: true, pesan: '' };
  if (d === 'belum-sederhana') {
    return {
      ok: false,
      pesan:
        buildFracInline(v.num, v.den) +
        ' memang senilai, tetapi belum paling sederhana: ' +
        v.num +
        ' dan ' +
        v.den +
        ' masih bisa sama-sama dibagi ' +
        gcd(v.num, v.den) +
        '.',
    };
  }
  if (v.num === asal.num && v.den === asal.den) {
    return {
      ok: false,
      pesan: 'Pecahannya belum diubah. Bagi pembilang dan penyebut dengan FPB-nya.',
    };
  }
  return {
    ok: false,
    pesan:
      buildFracInline(v.num, v.den) +
      ' tidak senilai dengan ' +
      buildFracInline(asal.num, asal.den) +
      '. Pembilang dan penyebut harus dibagi dengan bilangan yang SAMA.',
  };
}

/*
 * Umpan balik isian "samakan penyebut" untuk beberapa pecahan sekaligus.
 * Penyebut bersama apa pun yang benar diterima; bila bukan KPK, murid
 * diberi catatan bahwa KPK membuat angkanya lebih kecil.
 */
function pesanSamakan(vals, asal) {
  var dens = vals.map(function (v) {
    return v.den;
  });
  var k = kpkBanyak(
    asal.map(function (a) {
      return a.den;
    })
  );
  for (var i = 0; i < vals.length; i++) {
    if (!pecahanSetara(vals[i], asal[i])) {
      return {
        ok: false,
        pesan:
          'Pecahan ke-' +
          (i + 1) +
          ' (' +
          buildFracInline(vals[i].num, vals[i].den) +
          ') tidak senilai dengan ' +
          buildFracInline(asal[i].num, asal[i].den) +
          '. Pembilang dan penyebut harus dikali bilangan yang SAMA.',
      };
    }
  }
  var sama = dens.every(function (d) {
    return d === dens[0];
  });
  if (!sama) {
    return {
      ok: false,
      pesan: 'Semua pecahan sudah senilai, tetapi penyebutnya belum sama. Cari kelipatan bersama.',
    };
  }
  return {
    ok: true,
    pesan:
      dens[0] === k
        ? 'Kamu memakai KPK (' + k + ') — pilihan paling praktis!'
        : 'Penyebut ' + dens[0] + ' benar. KPK-nya ' + k + ' — angkanya bisa lebih kecil.',
  };
}

/* Kalimat perbandingan ringkas: "a/b = c/d = e/f". */
function fracChain(list) {
  return list
    .map(function (f) {
      return buildFracInline(f[0], f[1]);
    })
    .join(' = ');
}

/*
 * Tahap latihan bernomor (dipakai tahap 4 & 6). Tipe soal:
 *   'input'   sederhanakan s.asal (satu kotak pecahan bersusun)
 *   'samakan' samakan penyebut s.pecahan (satu kotak per pecahan)
 *   'choice'  pilihan ganda (opsi diacak lewat st.optionOrder)
 *
 *   cfg { D, states, idxKey, prefix, stageId, nextStageId, label }
 */
function renderLatihan(container, cfg) {
  var D = cfg.D;
  var states = cfg.states();
  var idx = State[cfg.idxKey];
  var s = D.soal[idx];
  var st = states[idx];
  var total = D.soal.length;
  var P = cfg.prefix;
  var rerender = function () {
    renderLatihan(container, cfg);
  };
  var semuaSelesai = states.every(function (x) {
    return x.done;
  });
  var statuses = states.map(function (x) {
    if (!x.done) return '';
    return x.correct ? 'correct' : 'incorrect';
  });

  var body = '';
  var hintLevel = st.hintLevel || 0;
  if (s.type === 'choice') {
    body =
      buildChoiceGroup(s.opsi, st.optionOrder, {
        chosen: st.chosen,
        correctId: s.correct,
        grade: true,
        locked: true,
        attr: 'data-' + P + '-opt',
      }) +
      (st.done
        ? '<div style="margin-top:var(--space-3);">' +
          buildFeedbackBox(
            st.correct ? 'success' : 'error',
            st.correct ? '✓' : '✗',
            (st.correct ? '<strong>Benar!</strong> ' : '<strong>Belum tepat.</strong> ') +
              s.explanation
          ) +
          '</div>'
        : '');
  } else {
    var jawabHTML;
    if (s.type === 'input') {
      var ss = sederhanakanPecahan(s.asal.num, s.asal.den);
      jawabHTML = fracChain([
        [s.asal.num, s.asal.den],
        [ss.num, ss.den],
      ]);
    } else {
      var k = kpkBanyak(
        s.pecahan.map(function (f) {
          return f.den;
        })
      );
      jawabHTML = s.pecahan
        .map(function (f) {
          return fracChain([
            [f.num, f.den],
            [(f.num * k) / f.den, k],
          ]);
        })
        .join('; ');
    }
    var status = st.done ? (st.correct ? 'ok' : 'bad') : st.pesan ? 'bad' : '';
    var inputs;
    if (s.type === 'input') {
      inputs =
        buildFracBlock(s.asal.num, s.asal.den, null, 'large') +
        '<span class="latih-eq" aria-hidden="true">=</span>' +
        buildFractionInput(P + 'In0', st.raw, {
          disabled: st.done,
          status: status,
          aria: 'Bentuk paling sederhana',
        });
    } else {
      inputs = s.pecahan
        .map(function (f, i) {
          return (
            '<span class="latih-pair">' +
            buildFracBlock(f.num, f.den, null, 'large') +
            '<span class="latih-eq" aria-hidden="true">=</span>' +
            buildFractionInput(P + 'In' + i, st.raws[i], {
              disabled: st.done,
              status: status,
              aria: 'Pecahan senilai ke-' + (i + 1),
            }) +
            '</span>'
          );
        })
        .join('');
    }
    var fb = '';
    if (st.done && st.correct) {
      fb = buildFeedbackBox(
        'success',
        '✓',
        '<strong>Benar!</strong> ' + (st.pesan ? st.pesan + ' ' : '') + jawabHTML
      );
    } else if (st.done) {
      fb = buildFeedbackBox(
        'error',
        '✗',
        '<strong>Belum tepat.</strong> ' + st.pesan + '<br>Jawaban: ' + jawabHTML
      );
    } else if (st.pesan) {
      fb = buildFeedbackBox(
        'warning',
        '💭',
        st.pesan + ' Kesempatan tersisa: ' + (D.maksCoba - st.attempts) + '.'
      );
    }
    body =
      '<div class="latih-row">' +
      inputs +
      '</div>' +
      (st.done
        ? ''
        : '<div class="btn-group">' +
          '<button type="button" class="btn btn--primary" id="' +
          P +
          'Cek">Periksa</button>' +
          buildHintToggle(P + 'Hint', s.hints, hintLevel) +
          '</div>') +
      (st.done ? '' : buildHintStack(s.hints, hintLevel)) +
      (fb ? '<div style="margin-top:var(--space-3);">' + fb + '</div>' : '');
  }

  var nav = '<div class="btn-group btn-group--spread" style="margin-top:var(--space-4);">';
  nav +=
    idx > 0
      ? '<button type="button" class="btn btn--ghost" id="' + P + 'Prev">← Sebelumnya</button>'
      : '<span></span>';
  if (semuaSelesai && idx === total - 1) {
    nav +=
      '<button type="button" class="btn btn--primary btn--large" id="' +
      P +
      'Done">' +
      esc(D.nextLabel) +
      '</button>';
  } else if (st.done && idx < total - 1) {
    nav +=
      '<button type="button" class="btn btn--primary" id="' +
      P +
      'Next">Soal Berikutnya →</button>';
  } else if (st.done && !semuaSelesai) {
    nav +=
      '<button type="button" class="btn btn--primary" id="' +
      P +
      'Open">Ke soal yang belum dikerjakan →</button>';
  }
  nav += '</div>';

  container.innerHTML =
    '<section aria-label="' +
    esc(cfg.label) +
    '">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">🧑‍💻 ' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel(
      buildProgressDots(total, idx, statuses) +
        '<div class="dl-prompt">' +
        '<p class="dl-prompt__cerita">' +
        s.cerita +
        '</p>' +
        '<p class="dl-prompt__tanya">' +
        s.tanya +
        '</p>' +
        '</div>' +
        body +
        nav
    ) +
    '</section>';

  container.querySelectorAll('[data-' + P + '-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (st.done) return;
      st.chosen = btn.getAttribute('data-' + P + '-opt');
      st.correct = st.chosen === s.correct;
      st.done = true;
      saveState();
      rerender();
    });
  });

  function periksa() {
    var vals = [];
    var n = s.type === 'input' ? 1 : s.pecahan.length;
    var raws = [];
    var err = null;
    for (var i = 0; i < n; i++) {
      var h = readFractionInput(container, P + 'In' + i);
      raws.push(h.raw);
      if (h.error && !err) err = h.error;
      vals.push(h.value);
    }
    if (s.type === 'input') st.raw = raws[0];
    else st.raws = raws;
    if (err) {
      saveState();
      showNotice(pesanInputPecahan(err));
      return;
    }
    var d = s.type === 'input' ? pesanSederhana(vals[0], s.asal) : pesanSamakan(vals, s.pecahan);
    st.attempts++;
    st.correct = d.ok;
    st.pesan = d.pesan;
    if (d.ok || st.attempts >= D.maksCoba) st.done = true;
    saveState();
    rerender();
  }

  var cekBtn = document.getElementById(P + 'Cek');
  if (cekBtn) cekBtn.addEventListener('click', periksa);
  container.querySelectorAll('.frac-input__box').forEach(function (inp) {
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !st.done) periksa();
    });
  });
  var hintBtn = document.getElementById(P + 'Hint');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      st.hintLevel = Math.min(hintLevel + 1, s.hints.length);
      saveState();
      rerender();
    });
  }

  function pindah(i) {
    State[cfg.idxKey] = i;
    saveState();
    rerender();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  var prev = document.getElementById(P + 'Prev');
  if (prev)
    prev.addEventListener('click', function () {
      pindah(idx - 1);
    });
  var next = document.getElementById(P + 'Next');
  if (next)
    next.addEventListener('click', function () {
      pindah(idx + 1);
    });
  var open = document.getElementById(P + 'Open');
  if (open) {
    open.addEventListener('click', function () {
      for (var i = 0; i < total; i++) {
        if (!states[i].done) {
          pindah(i);
          return;
        }
      }
    });
  }
  bindNext(P + 'Done', cfg.stageId, cfg.nextStageId);
}

/* Banyak soal latihan yang benar. */
function countCorrect(states) {
  return states.filter(function (st) {
    return st.correct;
  }).length;
}

/*
 * Tiga pita loyang bazar yang ditumpuk sama panjang.
 *   opts.notasi  true → tulis bagian terjual sebagai pecahan
 *   opts.kpk     true → pita dipotong ulang ke penyebut KPK, garis tebal
 *                menandai potongan bentuk paling sederhana
 */
function buildPitaBazar(opts) {
  opts = opts || {};
  return (
    '<div class="pita-list">' +
    BAZAR.map(function (b) {
      var num = opts.kpk ? b.kNum : b.num;
      var den = opts.kpk ? BAZAR_KPK : b.den;
      return (
        '<div class="pita-row">' +
        '<span class="pita-row__nama">' +
        b.ikon +
        ' ' +
        esc(b.nama) +
        '</span>' +
        buildFractionModel(num, den, 0, {
          wide: true,
          group: opts.kpk ? BAZAR_KPK / b.sDen : 0,
          aria:
            'Loyang ' +
            b.nama +
            ' dibagi ' +
            den +
            ' bagian sama besar, ' +
            num +
            ' bagian terjual',
        }) +
        '<span class="pita-row__frac">' +
        (opts.kpk || opts.notasi
          ? buildFracInline(num, den)
          : b.num + ' dari ' + b.den + ' potong') +
        '</span>' +
        '</div>'
      );
    }).join('') +
    '</div>'
  );
}
