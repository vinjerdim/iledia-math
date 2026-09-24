'use strict';

/* ============================================================
   app-core.js — Konstanta, state & storage, pengacakan pilihan,
   navigasi, dan helper render yang dipakai beberapa tahap.
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).

   Seluruh pilihan jawaban DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder()/ensureSortStates()/ensureOrderPicker()/
   ensureTapOrderState(). Pengacakan dilakukan SEKALI di
   initExerciseArrays(), lalu urutannya disimpan di State — bukan saat
   render — sehingga pilihan tidak melompat-lompat saat tahap dirender
   ulang, tetapi teracak ulang untuk setiap murid dan setiap kali Reset.
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'organisasi',
  'selidikBulat',
  'latihBulat',
  'selidikPecahan',
  'latihPecahan',
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
var STORAGE_KEY = 'mpi-d-1-6-bulat-pecahan-pbl-v1';

/* Data turunan masalah persami (dipakai tahap selidik, karya & evaluasi). */
var SUHU_URUT = DATA.suhu.slice().sort(function (a, b) {
  return a.value - b.value;
});
var SUHU_TERDINGIN = SUHU_URUT[0];

function reguById(id) {
  for (var i = 0; i < DATA.regu.length; i++) {
    if (DATA.regu[i].id === id) return DATA.regu[i];
  }
  return null;
}

function berasImproper(r) {
  return mixedToImproper(r.beras.whole, r.beras.num, r.beras.den);
}

var AIR_URUT = DATA.regu.slice().sort(function (a, b) {
  return compareFractions(a.air, b.air);
});
var BERAS_URUT = DATA.regu.slice().sort(function (a, b) {
  return compareFractions(berasImproper(a), berasImproper(b));
});

/* Kartu urut-ketuk tahap karya. */
var KARTU_SUHU = DATA.suhu.map(function (s) {
  return {
    id: s.id,
    label:
      '<span class="karya-kartu"><small>pukul ' +
      esc(s.jam) +
      '</small>' +
      formatNumber(s.value, '−') +
      ' °C</span>',
    aria: 'pukul ' + s.jam + ', ' + bacaBilanganBulat(s.value) + ' derajat Celsius',
  };
});
var KARTU_AIR = DATA.regu.map(function (r) {
  return {
    id: r.id,
    label:
      '<span class="karya-kartu"><small>' +
      r.ikon +
      ' ' +
      esc(r.nama) +
      '</small>' +
      buildFracInline(r.air.num, r.air.den) +
      '</span>',
    aria: 'Regu ' + r.nama + ', ' + bacaPecahan(r.air.num, r.air.den) + ' jeriken',
  };
});
var KARTU_BERAS = DATA.regu.map(function (r) {
  return {
    id: r.id,
    label:
      '<span class="karya-kartu"><small>' +
      r.ikon +
      ' ' +
      esc(r.nama) +
      '</small>' +
      buildFracInline(r.beras.num, r.beras.den, r.beras.whole) +
      ' kg</span>',
    aria: 'Regu ' + r.nama + ', ' + r.berasKata + ' kilogram',
  };
});

function idsOf(list) {
  return list.map(function (x) {
    return x.id;
  });
}

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Tahap 1 — orientasi */
  dugaan: {},
  dugaanOrders: {},
  pemantikOrder: null,
  pemantikPilih: null,

  /* Tahap 2 — organisasi */
  pilahStates: {},
  pilahOrder: null,
  rencana: null,

  /* Tahap 3 — penyelidikan bilangan bulat */
  bulatTulis: [],
  bulatBaca: {},
  bulatBacaOrders: {},
  garisOrder: null,
  garisPlace: null,
  bandingStates: {},
  bandingOrders: {},
  bulatSimpulOrder: null,
  bulatSimpul: null,

  /* Tahap 4 — latihan bilangan bulat */
  latihBIdx: 0,
  latihBStates: [],

  /* Tahap 5 — penyelidikan pecahan */
  pecTulis: [],
  pecBaca: {},
  pecBacaOrders: {},
  pecUbah: [],
  pecSamakan: [],
  pecSimpulOrder: null,
  pecSimpul: null,

  /* Tahap 6 — latihan pecahan */
  latihPIdx: 0,
  latihPStates: [],

  /* Tahap 7 — karya */
  karyaSuhu: null,
  karyaNolOrder: null,
  karyaNol: null,
  karyaAir: null,
  karyaBeras: null,
  karyaKeputusanOrder: null,
  karyaKeputusan: null,
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

/* Urutan acak opsi untuk setiap pertanyaan dalam daftar ({ id, opsi }). */
function ensureQuizOrders(key, list) {
  ensureObject(key);
  list.forEach(function (q) {
    ensureShuffledOrder(State[key], q.id, q.opsi);
  });
}

function makeFracStep() {
  return { raw: {}, done: false, pesan: '', attempts: 0, hintLevel: 0 };
}

function makeLatihState(s) {
  return {
    raw: s.type === 'frac' ? {} : '',
    attempts: 0,
    chosen: null,
    correct: false,
    done: false,
    pesan: '',
    hintLevel: 0,
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
  ensureObject('dugaan');
  ensureQuizOrders('dugaanOrders', DATA.orientasi.dugaan);
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
  var SB = DATA.selidikBulat;
  ensureExerciseArray(State, 'bulatTulis', SB.tulis, makeDlStep);
  ensureObject('bulatBaca');
  ensureQuizOrders('bulatBacaOrders', SB.baca);
  ensureShuffledOrder(State, 'garisOrder', DATA.suhu);
  ensureNumberLinePlacementState(State, 'garisPlace');
  ensureObject('bandingStates');
  ensureObject('bandingOrders');
  SB.banding.forEach(function (p) {
    var st = State.bandingStates[p.id];
    if (!st || typeof st !== 'object') State.bandingStates[p.id] = { chosen: null, wrong: 0 };
    ensureShuffledOrder(State.bandingOrders, p.id, COMPARE_SYMBOLS);
  });
  ensureShuffledOrder(State, 'bulatSimpulOrder', SB.simpulan.opsi);

  /* Tahap 4 */
  ensureExerciseArray(State, 'latihBStates', DATA.latihBulat.soal, makeLatihState);
  ensureIndex('latihBIdx', DATA.latihBulat.soal.length);

  /* Tahap 5 */
  var SP = DATA.selidikPecahan;
  ensureExerciseArray(State, 'pecTulis', SP.tulis, makeFracStep);
  ensureObject('pecBaca');
  ensureQuizOrders('pecBacaOrders', SP.baca);
  ensureExerciseArray(State, 'pecUbah', SP.ubah, makeFracStep);
  ensureExerciseArray(State, 'pecSamakan', SP.samakan, makeDlStep);
  ensureShuffledOrder(State, 'pecSimpulOrder', SP.simpulan.opsi);

  /* Tahap 6 */
  ensureExerciseArray(State, 'latihPStates', DATA.latihPecahan.soal, makeLatihState);
  ensureIndex('latihPIdx', DATA.latihPecahan.soal.length);

  /* Tahap 7 */
  var K = DATA.karya;
  ensureTapOrderState(State, 'karyaSuhu', KARTU_SUHU, idsOf(SUHU_URUT));
  ensureShuffledOrder(State, 'karyaNolOrder', K.suhuDiBawahNol.opsi);
  ensureTapOrderState(State, 'karyaAir', KARTU_AIR, idsOf(AIR_URUT));
  ensureTapOrderState(State, 'karyaBeras', KARTU_BERAS, idsOf(BERAS_URUT));
  ensureShuffledOrder(State, 'karyaKeputusanOrder', K.keputusan.opsi);
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

/* Judul bagian + instruksi di dalam panel. */
function buildPartHead(judul, instruksi) {
  return (
    '<h3 style="margin-top:0;">' +
    esc(judul) +
    '</h3>' +
    (instruksi ? '<p class="exercise-label">' + esc(instruksi) + '</p>' : '')
  );
}

function spacer(html) {
  return html ? '<div style="margin-top:var(--space-3);">' + html + '</div>' : '';
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
    Q.tanya +
    '</p>' +
    buildChoiceGroup(Q.opsi, order, {
      chosen: chosen,
      correctId: benar ? Q.correct : null,
      grade: true,
      locked: benar,
      attr: attr,
    }) +
    (chosen
      ? spacer(buildFeedbackBox(benar ? 'success' : 'warning', benar ? '✓' : '💭', Q.umpan[chosen]))
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

/* Semua langkah bertahap selesai? */
function stepsDone(steps) {
  return steps.every(function (st) {
    return st.done;
  });
}

function countCorrect(states) {
  return states.filter(function (st) {
    return st.correct;
  }).length;
}

/*
 * Rangkaian langkah isian bilangan bertahap (buildDlStep): langkah
 * berikutnya baru muncul setelah langkah sebelumnya benar.
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

/* ------------------------------------------------------------
   Isian pecahan bertahap (menulis notasi & mengubah bentuk)
   ------------------------------------------------------------ */

function pesanInputPecahan(error) {
  if (error === 'empty') return 'Isi pembilang dan penyebut lebih dulu.';
  if (error === 'zero-den') return 'Penyebut tidak boleh 0.';
  return 'Isi kotak hanya dengan angka (bilangan cacah).';
}

/* Umpan balik yang menunjuk letak kesalahan isian pecahan. */
function pesanDiagnosa(d) {
  return (
    {
      terbalik:
        'Pembilang dan penyebutnya tertukar. Bilangan sebelum kata "per" ditulis di ATAS garis.',
      'tidak-senilai':
        'Nilainya belum tepat. Periksa lagi pembilang, penyebut, dan bilangan bulatnya.',
      'bukan-campuran':
        'Nilainya sudah benar, tetapi belum berbentuk pecahan campuran (bilangan bulat + pecahan yang pembilangnya lebih kecil dari penyebut).',
      'bukan-biasa':
        'Nilainya sudah benar, tetapi yang diminta pecahan biasa — kosongkan kotak bilangan bulat.',
      'beda-notasi':
        'Nilainya senilai, tetapi tuliskan persis seperti yang dibacakan pada catatan (tanpa disederhanakan atau diubah).',
    }[d] || ''
  );
}

function fracJawabHTML(j) {
  return buildFracInline(j.num, j.den, j.whole || null);
}

function needsWholeBox(step) {
  return !!(step.mixed || (step.jawab && step.jawab.whole));
}

/* Satu langkah isian pecahan: label, visual opsional, isian bersusun, umpan balik. */
function buildFracStep(id, st, step, num) {
  var head =
    '<p class="dl-step__label">' +
    (num ? '<span class="dl-step__num">' + num + '</span>' : '') +
    step.label +
    '</p>';
  var visual = step.asal
    ? '<div class="frac-step__visual">' +
      buildFractionModel(step.asal.num, step.asal.den, step.asal.whole || 0, {
        small: true,
        caption: '1 pita = 1 kg',
      }) +
      '</div>'
    : '';
  if (st.done) {
    return (
      '<div class="dl-step dl-step--done">' +
      head +
      visual +
      buildFeedbackBox(
        'success',
        '✓',
        (step.asal ? fracJawabHTML(step.asal) + ' = ' : 'Ditulis ') + fracJawabHTML(step.jawab)
      ) +
      '</div>'
    );
  }
  return (
    '<div class="dl-step">' +
    head +
    visual +
    '<div class="dl-input-row">' +
    buildFractionInput(id + 'In', st.raw, {
      mixed: needsWholeBox(step),
      status: st.pesan ? 'bad' : '',
      aria: 'Jawaban langkah ' + num,
    }) +
    '<button type="button" class="btn btn--primary" id="' +
    id +
    'Check">Periksa</button>' +
    buildHintToggle(id + 'Hint', step.hints, st.hintLevel) +
    '</div>' +
    (st.pesan ? spacer(buildFeedbackBox('error', '✗', st.pesan)) : '') +
    buildHintStack(step.hints, st.hintLevel) +
    '</div>'
  );
}

function bindFracStep(root, id, st, step, rerender) {
  var btn = document.getElementById(id + 'Check');
  if (btn) {
    btn.addEventListener('click', function () {
      var r = readFractionInput(root, id + 'In');
      if (r.error) {
        showNotice(pesanInputPecahan(r.error));
        return;
      }
      st.raw = r.raw;
      st.attempts += 1;
      var d = diagnosaPecahan(r.value, step.jawab, step.bentuk);
      st.done = d === 'ok';
      st.pesan = st.done ? '' : pesanDiagnosa(d);
      saveState();
      rerender();
    });
  }
  var hint = document.getElementById(id + 'Hint');
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = Math.min(st.hintLevel + 1, step.hints.length);
      saveState();
      rerender();
    });
  }
  root.querySelectorAll('[id^="' + id + 'In"]').forEach(function (inp) {
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && btn) btn.click();
    });
  });
}

function buildFracChain(prefix, langkah, states) {
  var html = '';
  for (var i = 0; i < langkah.length; i++) {
    html += buildFracStep(prefix + i, states[i], langkah[i], i + 1);
    if (!states[i].done) break;
  }
  return html;
}

function bindFracChain(root, prefix, langkah, states, rerender) {
  langkah.forEach(function (step, i) {
    bindFracStep(root, prefix + i, states[i], step, rerender);
  });
}

/* ============================================================
   5. TAHAP LATIHAN (dipakai tahap 4 & 6)
   Tipe soal:
     'int'    isian bilangan bulat (boleh negatif)
     'frac'   isian pecahan bersusun (biasa/campuran), didiagnosis
              dengan diagnosaPecahan()
     'choice' pilihan ganda (opsi diacak lewat st.optionOrder)
   Soal isian boleh dicoba `D.maksCoba` kali; pilihan ganda sekali.
   cfg { D, states(), idxKey, prefix, stageId, nextStageId, label }
   ============================================================ */

function latihJawabHTML(s) {
  if (s.type === 'int') return '<strong>' + formatNumber(s.jawab, '−') + '</strong>';
  if (s.type === 'frac') return fracJawabHTML(s.jawab);
  return '';
}

function buildLatihBody(s, st, P, sisa) {
  if (s.type === 'choice') {
    return (
      buildChoiceGroup(s.opsi, st.optionOrder, {
        chosen: st.chosen,
        correctId: s.correct,
        grade: true,
        locked: true,
        attr: 'data-' + P + '-opt',
      }) +
      (st.done
        ? spacer(
            buildFeedbackBox(
              st.correct ? 'success' : 'error',
              st.correct ? '✓' : '✗',
              (st.correct ? '<strong>Benar!</strong> ' : '<strong>Belum tepat.</strong> ') +
                s.penjelasan
            )
          )
        : '')
    );
  }

  var status = st.done ? (st.correct ? 'ok' : 'bad') : st.pesan ? 'bad' : '';
  var input =
    s.type === 'frac'
      ? buildFractionInput(P + 'In', st.raw, {
          mixed: needsWholeBox(s),
          disabled: st.done,
          status: status,
          aria: 'Jawaban',
        })
      : buildDlNumInput(P + 'In', st.raw, {
          allowNegative: true,
          disabled: st.done,
          error: status === 'bad',
          aria: 'Jawaban bilangan bulat',
        });

  var fb = '';
  if (st.done && st.correct) {
    fb = buildFeedbackBox('success', '✓', '<strong>Benar!</strong> ' + s.penjelasan);
  } else if (st.done) {
    fb = buildFeedbackBox(
      'error',
      '✗',
      '<strong>Belum tepat.</strong> Jawaban: ' + latihJawabHTML(s) + '. ' + s.penjelasan
    );
  } else if (st.pesan) {
    fb = buildFeedbackBox('warning', '💭', st.pesan + ' Kesempatan tersisa: ' + sisa + '.');
  }

  return (
    '<div class="latih-row">' +
    input +
    '</div>' +
    (st.done
      ? ''
      : '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary" id="' +
        P +
        'Cek">Periksa</button>' +
        buildHintToggle(P + 'Hint', s.hints, st.hintLevel || 0) +
        '</div>' +
        buildHintStack(s.hints, st.hintLevel || 0)) +
    spacer(fb)
  );
}

/* Memeriksa isian soal 'int'/'frac'; null bila isian kosong/tidak valid. */
function periksaIsian(container, s, P) {
  if (s.type === 'frac') {
    var r = readFractionInput(container, P + 'In');
    if (r.error) {
      showNotice(pesanInputPecahan(r.error));
      return null;
    }
    var d = diagnosaPecahan(r.value, s.jawab, s.bentuk);
    return { raw: r.raw, ok: d === 'ok', pesan: d === 'ok' ? '' : pesanDiagnosa(d) };
  }
  var inp = document.getElementById(P + 'In');
  var v = readDlNumber(inp ? inp.value : '', false);
  if (v === null) return null;
  var pesan = '';
  if (v !== s.jawab) {
    pesan =
      v === -s.jawab
        ? 'Angkanya sudah benar, tetapi tandanya belum. Apakah letaknya di atas atau di bawah nol?'
        : 'Jawabanmu belum tepat.';
  }
  return { raw: inp.value.trim(), ok: v === s.jawab, pesan: pesan };
}

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
    buildDlPanel(
      buildProgressDots(total, idx, statuses) +
        '<div class="latih-soal">' +
        '<span class="latih-soal__icon" aria-hidden="true">' +
        s.ikon +
        '</span>' +
        '<p class="latih-soal__text">' +
        s.teks +
        '</p>' +
        '</div>' +
        buildLatihBody(s, st, P, D.maksCoba - st.attempts) +
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

  var cek = document.getElementById(P + 'Cek');
  if (cek) {
    cek.addEventListener('click', function () {
      var hasil = periksaIsian(container, s, P);
      if (!hasil) return;
      st.raw = hasil.raw;
      st.attempts += 1;
      st.correct = hasil.ok;
      st.pesan = hasil.pesan;
      st.done = hasil.ok || st.attempts >= D.maksCoba;
      saveState();
      rerender();
    });
    container.querySelectorAll('[id^="' + P + 'In"]').forEach(function (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') cek.click();
      });
    });
  }

  var hint = document.getElementById(P + 'Hint');
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = Math.min((st.hintLevel || 0) + 1, s.hints.length);
      saveState();
      rerender();
    });
  }

  function go(i) {
    State[cfg.idxKey] = i;
    saveState();
    rerender();
  }
  var prev = document.getElementById(P + 'Prev');
  if (prev) {
    prev.addEventListener('click', function () {
      go(idx - 1);
    });
  }
  var next = document.getElementById(P + 'Next');
  if (next) {
    next.addEventListener('click', function () {
      go(idx + 1);
    });
  }
  var open = document.getElementById(P + 'Open');
  if (open) {
    open.addEventListener('click', function () {
      for (var i = 0; i < states.length; i++) {
        if (!states[i].done) {
          go(i);
          return;
        }
      }
    });
  }
  bindNext(P + 'Done', cfg.stageId, cfg.nextStageId);
}
