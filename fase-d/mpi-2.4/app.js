'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Perkalian & Pembagian Pecahan dalam Masalah Kontekstual
   — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen umum: buildDiscoveryHead, buildTeacherNote, buildTpPanel,
       buildChoiceGroup, buildGuidedQuizList, buildSortItems,
       buildDlPanel, buildDlNextButton, buildFeedbackBox,
       buildProgressDots;
     • seksi 12 (Cooperative Learning): assignCoopRoles,
       coopRoleAssignment, buildCoopRoleBar, buildCoopTeamCard,
       coopAwardLevel;
     • seksi 15/38: renderFracText, buildBilanganChip;
     • seksi 62 (operasi pecahan): teksRasional, makeIsianOperasi,
       buildIsianOperasi, bindIsianOperasi (kini juga untuk × dan :);
     • seksi 63 (perkalian & pembagian pecahan): kaliBagiPecahan,
       fmtOperasiKaliBagi, langkahKaliBagiPecahan, opsiKaliBagiPecahan,
       diagnosaKaliBagiPecahan, jenisOperasiKaliBagi, buildPitaKelompok,
       buildLuasPecahan.

   Alur tahap mengikuti sintaks Cooperative Learning (Arends) tipe
   Jigsaw: setiap anggota tim asal memegang kartu AHLI satu strategi
   (dibagikan acak), belajar di kelompok ahli, lalu memandu tim asal.
   Lihat komentar kepala pada data.js.

   PENGACAKAN: seluruh pilihan jawaban (dugaan, pertanyaan penuntun,
   hasil soal stasiun & misi dari opsiKaliBagiPecahan, kalimat
   matematika, ahli pemimpin, pernyataan diskusi, soal & opsi kuis,
   penilaian diri) dan kartu ahli DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder() / ensureSortStates() / assignCoopRoles().
   Pengacakan dilakukan SEKALI saat state disiapkan (initExerciseArrays)
   lalu disimpan di State — bukan saat render — sehingga pilihan tidak
   melompat saat dirender ulang, tetapi teracak ulang untuk setiap tim
   dan setiap Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Tujuan          (CL fase 1)
    6. Stage: Informasi       (CL fase 2)
    7. Stage: Tim Asal        (CL fase 3)
    8. Stage: Kelompok Ahli   (CL fase 4 — Jigsaw)
    9. Stage: Misi Operasi    (CL fase 4)
   10. Stage: Misi Hitung     (CL fase 4)
   11. Stage: Misi Diskusi    (CL fase 4)
   12. Stage: Kuis Individu   (CL fase 5)
   13. Stage: Penghargaan     (CL fase 6)
   14. Stage: Refleksi
   15. Stage: Selesai
   16. Router Render
   17. Helper UI (modal reset)
   18. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = DATA.tahap.map(function (t) {
  return t.id;
});
var STAGE_LABELS = DATA.tahap.map(function (t) {
  return t.label;
});
var STORAGE_KEY = 'mpi-d-2-4-kali-bagi-pecahan-v1';

/* Opsi "ahli mana yang memimpin?" pada Misi 1 (id = jenis operasi). */
var OPSI_AHLI = STRATEGI_KALI_BAGI.map(function (s) {
  return { id: s.id, label: s.ikon + ' ' + s.nama };
});

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'tujuan',
  completedStages: {},

  /* Tahap 1 — tujuan */
  dugaanOrders: {},
  dugaanPilih: {},
  tujuanAlasan: '',

  /* Tahap 2 — informasi */
  penuntunOrders: {},
  penuntunPilih: {},

  /* Tahap 3 — tim asal & kartu ahli */
  timNama: '',
  timInput: ['', '', '', ''],
  timAnggota: [],
  timSepakat: {},

  /* Tahap 4 — kelompok ahli */
  ahliTab: null,
  ahli: {},

  /* Tahap 5 — misi operasi apa? */
  ajarIdx: 0,
  ajar: {},

  /* Tahap 6 — misi hitung pesanan */
  hitungIdx: 0,
  hitung: {},

  /* Tahap 7 — misi diskusi */
  diskusiStates: {},
  diskusiOrder: null,
  diskusiJubir: '',

  /* Tahap 8 — kuis */
  kuisPick: null,
  kuisIdx: 0,
  kuisExercises: [],

  /* Tahap 9 — penghargaan */
  pujian: '',

  /* Tahap 10 — refleksi */
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

/* Memastikan objek[key] berupa objek biasa (peta id → nilai). */
function ensureMapIn(obj, key) {
  if (!obj[key] || typeof obj[key] !== 'object' || Array.isArray(obj[key])) obj[key] = {};
  return obj[key];
}

function ensureMap(key) {
  return ensureMapIn(State, key);
}

/* Mengacak urutan opsi untuk setiap pertanyaan { id, opsi } dalam daftar. */
function ensureListOrders(key, list) {
  var map = ensureMap(key);
  list.forEach(function (q) {
    ensureShuffledOrder(map, q.id, q.opsi);
  });
}

/* State pilihan yang boleh dicoba lagi sampai benar: { chosen, wrong }. */
function ensureTry(obj, key) {
  if (!obj[key] || typeof obj[key] !== 'object') obj[key] = { chosen: null, wrong: 0 };
  return obj[key];
}

/* State soal pilihan hasil { chosen, wrong, order } untuk soal { a, op, b }. */
function ensureHasilState(obj, key, s) {
  var st = ensureTry(obj, key);
  ensureShuffledOrder(st, 'order', opsiKaliBagiPecahan(s.a, s.op, s.b));
  return st;
}

function ensureAhliState(stasiun) {
  var map = ensureMap('ahli');
  var st = ensureMapIn(map, stasiun.id);
  st.ajar = !!st.ajar;
  var maksLangkah = langkahContoh(stasiun).length;
  if (!(st.langkah >= 0 && st.langkah <= maksLangkah)) st.langkah = 0;
  var X = stasiun.eksplor;
  if (X.jenis === 'kaliBulat' && !(st.eksplor >= X.min && st.eksplor <= X.maks)) {
    st.eksplor = X.awal;
  } else if (X.jenis === 'bagi' && X.ukuran.indexOf(st.eksplor) === -1) {
    st.eksplor = X.awal;
  } else if (X.jenis === 'luas' && st.eksplor !== 'b' && st.eksplor !== 'ab') {
    st.eksplor = 'b';
  }
  var soal = ensureMapIn(st, 'soal');
  stasiun.soal.forEach(function (s) {
    ensureHasilState(soal, s.id, s);
  });
  return st;
}

function ensureAjarState(s) {
  var map = ensureMap('ajar');
  var st = ensureMapIn(map, s.id);
  ensureTry(st, 'kalimat');
  ensureShuffledOrder(st, 'kalimatOrder', s.kalimat);
  ensureTry(st, 'ahli');
  ensureShuffledOrder(st, 'ahliOrder', OPSI_AHLI);
  ensureHasilState(st, 'hasil', s);
  return st;
}

function ensureHitungState(s) {
  var map = ensureMap('hitung');
  var st = map[s.id];
  if (!st || typeof st !== 'object' || typeof st.attempts !== 'number') {
    map[s.id] = makeIsianOperasi();
  }
  return map[s.id];
}

/*
 * Soal kuis yang sedang dipakai (salinan dengan teks sudah dirender).
 * Array ini DIISI ULANG di tempat (bukan diganti) karena
 * createExerciseStage menyimpan referensinya.
 */
var KUIS_SOAL = [];

/* Memilih soal acak dari bank sesuai komposisi, lalu mengacak urutannya. */
function pilihSoalKuis() {
  var K = DATA.kuis;
  var ids = [];
  Object.keys(K.komposisi).forEach(function (type) {
    var kelompok = K.soal.filter(function (s) {
      return s.type === type;
    });
    shuffleArray(kelompok)
      .slice(0, K.komposisi[type])
      .forEach(function (s) {
        ids.push(s.id);
      });
  });
  return shuffleArray(ids);
}

function kuisPickValid() {
  var pick = State.kuisPick;
  if (!Array.isArray(pick) || pick.length !== DATA.kuis.banyak) return false;
  var ada = optionIds(DATA.kuis.soal);
  return pick.every(function (id, i) {
    return ada.indexOf(id) !== -1 && pick.indexOf(id) === i;
  });
}

function isiKuisSoal() {
  var byId = {};
  DATA.kuis.soal.forEach(function (s) {
    byId[s.id] = s;
  });
  KUIS_SOAL.length = 0;
  State.kuisPick.forEach(function (id) {
    var s = byId[id];
    var item = {
      id: s.id,
      type: s.type,
      a: s.a,
      op: s.op,
      b: s.b,
      satuan: s.satuan,
      cerita: s.cerita,
      pertanyaan: s.pertanyaan,
      hints: (s.hints || []).map(fxt),
    };
    if (s.type === 'choice') {
      var opsi = opsiHasil(s);
      item.options = opsi;
      item.correct = 'benar';
      item.umpan = {};
      opsi.forEach(function (o) {
        item.umpan[o.id] = o.umpan;
      });
    }
    KUIS_SOAL.push(item);
  });
}

/*
 * Menyiapkan seluruh state per-langkah DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1 */
  ensureListOrders('dugaanOrders', DATA.tujuan.dugaan);
  ensureMap('dugaanPilih');

  /* Tahap 2 */
  ensureListOrders('penuntunOrders', DATA.informasi.penuntun);
  ensureMap('penuntunPilih');

  /* Tahap 3 */
  if (!Array.isArray(State.timInput) || State.timInput.length !== DATA.tim.maksAnggota) {
    State.timInput = [];
    for (var i = 0; i < DATA.tim.maksAnggota; i++) State.timInput.push('');
  }
  if (!Array.isArray(State.timAnggota)) State.timAnggota = [];
  ensureMap('timSepakat');

  /* Tahap 4 */
  DATA.ahli.stasiun.forEach(ensureAhliState);
  if (optionIds(DATA.ahli.stasiun).indexOf(State.ahliTab) === -1) {
    State.ahliTab = DATA.ahli.stasiun[0].id;
  }

  /* Tahap 5–6 */
  DATA.misiAjar.soal.forEach(ensureAjarState);
  if (!(State.ajarIdx >= 0 && State.ajarIdx < DATA.misiAjar.soal.length)) State.ajarIdx = 0;
  DATA.misiHitung.soal.forEach(ensureHitungState);
  if (!(State.hitungIdx >= 0 && State.hitungIdx < DATA.misiHitung.soal.length)) {
    State.hitungIdx = 0;
  }

  /* Tahap 7 */
  ensureSortStates(
    State,
    'diskusiStates',
    'diskusiOrder',
    DATA.misiDiskusi.pernyataan,
    DATA.misiDiskusi.opsi
  );

  /* Tahap 8 — soal dipilih acak dari bank; opsi tiap soal diacak */
  if (!kuisPickValid()) {
    State.kuisPick = pilihSoalKuis();
    State.kuisExercises = [];
    State.kuisIdx = 0;
  }
  isiKuisSoal();
  ensureExerciseArray(State, 'kuisExercises', KUIS_SOAL, function (s) {
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
  if (!(State.kuisIdx >= 0 && State.kuisIdx < KUIS_SOAL.length)) State.kuisIdx = 0;

  /* Tahap 10 */
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

/* HTML tepercaya dari DATA: token {a/b} → pecahan bersusun. */
function fx(html) {
  return renderFracText(html);
}

/* Teks biasa dari DATA: di-escape lalu token pecahannya dirender. */
function fxt(text) {
  return renderFracText(esc(text));
}

/* Teks keluaran engine ("5/2 × 4/3 = 20/6"): pecahan polos → bersusun. */
function fxe(text) {
  return renderFracText(
    esc(text).replace(/(\d+ )?\d+\/\d+/g, function (m) {
      return '{' + m + '}';
    })
  );
}

/* Salinan daftar opsi dengan label ber-token pecahan sudah dirender. */
function fxOpsi(list) {
  return list.map(function (o) {
    return { id: o.id, label: fx(o.label) };
  });
}

/* Pilihan hasil berpengecoh untuk soal { a, op, b } (urutan wajar). */
function opsiHasil(s) {
  return opsiKaliBagiPecahan(s.a, s.op, s.b).map(function (o) {
    return { id: o.id, label: buildBilanganChip(o.label), umpan: o.umpan, benar: o.benar };
  });
}

function hasilTeks(s) {
  return teksRasional(kaliBagiPecahan(s.a, s.op, s.b));
}

/* Kepala tahap + catatan peran guru. */
function buildHead(D) {
  return buildDiscoveryHead(D.kicker, D.goal, D.syntax) + buildTeacherNote(D.guru);
}

/*
 * Memasang tombol lanjut yang menyelesaikan tahap ini lalu pindah tahap.
 * `guard` opsional: kembalikan false untuk membatalkan.
 */
function bindNext(id, stageId, nextStageId, guard) {
  var btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', function () {
    if (guard && guard() === false) return;
    completeStage(stageId);
    navigateTo(nextStageId);
  });
}

function buildTextarea(id, label, value, placeholder) {
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
    esc(placeholder || '') +
    '">' +
    esc(value || '') +
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

function buildLangkah(list) {
  return (
    '<ol class="misi-langkah">' +
    list
      .map(function (t) {
        return '<li>' + esc(t) + '</li>';
      })
      .join('') +
    '</ol>'
  );
}

function kartuRingkas(val, label) {
  return (
    '<div class="summary-card"><div class="summary-card__val">' +
    val +
    '</div><div class="summary-card__label">' +
    label +
    '</div></div>'
  );
}

function buildAturan() {
  return (
    '<ul class="aturan-list">' +
    DATA.informasi.aturan
      .map(function (a) {
        return '<li>' + fx(a) + '</li>';
      })
      .join('') +
    '</ul>'
  );
}

/* Bilah peran tim untuk misi ke-`ronde` (peran dirotasi). */
function buildPeranMisi(ronde) {
  return buildCoopRoleBar(State.timAnggota, ronde, {
    title: 'Peran pada misi ini — ' + (State.timNama || 'tim kalian'),
  });
}

function strategiInfo(id) {
  return STRATEGI_KALI_BAGI.filter(function (s) {
    return s.id === id;
  })[0];
}

/* Nama anggota yang memegang kartu ahli strategi `id` (atau ''). */
function namaAhli(id) {
  if (!State.timAnggota.length) return '';
  var p = coopRoleAssignment(State.timAnggota, 0, STRATEGI_KALI_BAGI).filter(function (x) {
    return x.role.id === id;
  })[0];
  return p ? p.nama : '';
}

/* Kartu strategi: ikon, nama, ahli yang memegang, kalimat kunci. */
function buildStrategiCard(s, opts) {
  opts = opts || {};
  var ahli = namaAhli(s.id);
  return (
    '<div class="strategi-card">' +
    '<span class="strategi-card__ikon" aria-hidden="true">' +
    s.ikon +
    '</span>' +
    '<div><p class="strategi-card__nama">' +
    esc(s.nama) +
    (ahli ? ' <span class="strategi-card__ahli">· ' + esc(ahli) + '</span>' : '') +
    '</p>' +
    '<p class="strategi-card__ringkas">' +
    fxt(s.ringkas) +
    '</p>' +
    '<p class="strategi-card__kunci">' +
    (opts.kunciLabel ? '<strong>' + esc(opts.kunciLabel) + '</strong> ' : '') +
    fxt(s.kunci) +
    '</p></div>' +
    '</div>'
  );
}

function buildStrategiGrid() {
  return (
    '<div class="strategi-grid">' +
    STRATEGI_KALI_BAGI.map(function (s) {
      return buildStrategiCard(s);
    }).join('') +
    '</div>'
  );
}

/* Kotak konteks: ikon + cerita. */
function buildKonteks(ikon, cerita) {
  return (
    '<div class="misi-konteks">' +
    '<span class="misi-konteks__ikon" aria-hidden="true">' +
    ikon +
    '</span>' +
    '<p>' +
    fxt(cerita) +
    '</p>' +
    '</div>'
  );
}

/* Kalimat soal "a op b = ?" dengan pecahan bersusun. */
function buildKalimatSoal(s, terisi) {
  return (
    '<p class="kalimat-op" aria-label="' +
    esc(fmtOperasiKaliBagi(s.a, s.op, s.b) + ' = ' + (terisi ? hasilTeks(s) : 'berapa')) +
    '">' +
    fxe(fmtOperasiKaliBagi(s.a, s.op, s.b)) +
    ' = ' +
    (terisi
      ? '<strong>' + buildBilanganChip(hasilTeks(s), true) + '</strong>'
      : '<span class="kalimat-op__tanya">?</span>') +
    '</p>'
  );
}

/* Langkah penyelesaian bernomor dari engine (seksi 63). */
function buildLangkahHitung(s, sampai) {
  var list = langkahKaliBagiPecahan(s.a, s.op, s.b).langkah;
  var n = typeof sampai === 'number' ? sampai : list.length;
  return (
    '<ol class="langkah-hitung">' +
    list
      .slice(0, n)
      .map(function (l) {
        return (
          '<li><span class="langkah-hitung__nama">' +
          esc(NAMA_LANGKAH[l.id]) +
          '</span>' +
          fxe(l.teks) +
          '</li>'
        );
      })
      .join('') +
    '</ol>'
  );
}

var NAMA_LANGKAH = {
  biasa: 'Ubah ke pecahan biasa',
  balik: 'Balik pembagi, ubah menjadi perkalian',
  kali: 'Kalikan pembilang & penyebut',
  sederhana: 'Sederhanakan',
};

/* Bilah progres "Soal i dari n" untuk misi bertahap. */
function buildMisiProgress(total, idx, doneFn) {
  var statuses = [];
  for (var i = 0; i < total; i++) statuses.push(doneFn(i) ? 'correct' : '');
  return buildProgressDots(total, idx, statuses);
}

/* Umpan balik pilihan hasil (umpan opsi dari engine). */
function buildHasilFeedback(s, st, ekstra) {
  if (!st.chosen) return '';
  var opsi = opsiHasil(s).filter(function (o) {
    return o.id === st.chosen;
  })[0];
  if (!opsi) return '';
  var benar = st.chosen === 'benar';
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(
      benar ? 'success' : 'warning',
      benar ? '✓' : '💭',
      benar ? '<strong>Tepat!</strong> ' + (ekstra || esc(opsi.umpan)) : esc(opsi.umpan)
    ) +
    '</div>'
  );
}

/* Tombol pindah soal sebelumnya/berikutnya pada misi bertahap. */
function buildNavSoal(prefix, idx, total, bolehLanjut, label) {
  return (
    '<div class="btn-group btn-group--spread">' +
    (idx > 0
      ? '<button type="button" class="btn btn--ghost" id="' +
        prefix +
        'PrevSoal">← ' +
        label +
        ' Sebelumnya</button>'
      : '<span></span>') +
    (bolehLanjut && idx < total - 1
      ? '<button type="button" class="btn btn--primary" id="' +
        prefix +
        'NextSoal">' +
        label +
        ' Berikutnya →</button>'
      : '') +
    '</div>'
  );
}

function bindNavSoal(prefix, idxKey, rerender) {
  var next = document.getElementById(prefix + 'NextSoal');
  if (next) {
    next.addEventListener('click', function () {
      State[idxKey] += 1;
      saveState();
      rerender();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  var prev = document.getElementById(prefix + 'PrevSoal');
  if (prev) {
    prev.addEventListener('click', function () {
      State[idxKey] -= 1;
      saveState();
      rerender();
    });
  }
}

/* ============================================================
   5. STAGE: TUJUAN  (Cooperative Learning — fase 1)
   Murid membaca pesanan bazar dan MENDUGA. Tidak dinilai.
   ============================================================ */

function dugaanLengkap() {
  return DATA.tujuan.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function renderTujuan(container) {
  var D = DATA.tujuan;
  var lengkap = dugaanLengkap();

  var catatanHTML = D.catatan
    .map(function (c) {
      return (
        '<div class="pesanan-card">' +
        '<span class="pesanan-card__ikon" aria-hidden="true">' +
        c.ikon +
        '</span>' +
        '<div><p class="pesanan-card__judul">' +
        esc(c.judul) +
        '</p><p class="pesanan-card__teks">' +
        fxt(c.teks) +
        '</p></div>' +
        '</div>'
      );
    })
    .join('');

  var dugaanHTML = D.dugaan
    .map(function (q, i) {
      return (
        '<div class="quiz-item">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        fx(q.tanya) +
        '</p>' +
        buildChoiceGroup(fxOpsi(q.opsi), State.dugaanOrders[q.id], {
          chosen: State.dugaanPilih[q.id] || null,
          group: q.id,
          attr: 'data-dugaan',
        }) +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Tujuan dan Motivasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🧁 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="pesanan-grid">' +
        catatanHTML +
        '</div>',
      'panel--hero'
    ) +
    buildTpPanel(D, fxt) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaanmu?</h3>' +
        dugaanHTML +
        '<div style="margin-top:var(--space-5);">' +
        buildTextarea('tujuanAlasan', D.alasanLabel, State.tujuanAlasan, D.alasanPlaceholder) +
        '</div>' +
        buildFeedbackBox('info', '🔎', esc(D.catatanDugaan))
    ) +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="tujuanNextBtn"' +
    (lengkap ? '' : ' disabled') +
    '>' +
    esc(D.nextLabel) +
    '</button>' +
    '</div>' +
    '</section>';

  container.querySelectorAll('[data-dugaan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.dugaanPilih[btn.dataset.group] = btn.dataset.dugaan;
      saveState();
      renderTujuan(container);
    });
  });

  bindTextarea('tujuanAlasan', 'tujuanAlasan');

  bindNext('tujuanNextBtn', 'tujuan', 'informasi', function () {
    if (!dugaanLengkap()) {
      showNotice('Pilih dugaanmu untuk setiap pertanyaan sebelum melanjutkan.');
      return false;
    }
    return true;
  });
}

/* ============================================================
   6. STAGE: INFORMASI  (Cooperative Learning — fase 2)
   Model luas ½ × ¾ & pita kelompok 6 : ½ → pertanyaan penuntun
   (opsi acak) → aturan umum & cek dugaan tahap 1.
   ============================================================ */

function penuntunTampil() {
  return DATA.informasi.penuntun.map(function (q) {
    var umpan = {};
    Object.keys(q.umpan).forEach(function (k) {
      umpan[k] = fx(q.umpan[k]);
    });
    return { id: q.id, tanya: fx(q.tanya), opsi: fxOpsi(q.opsi), correct: q.correct, umpan: umpan };
  });
}

function buildCekDugaan() {
  var T = DATA.tujuan;
  var I = DATA.informasi;
  var hasil = {
    kali: teksRasional(kaliBagiPecahan(I.kali.a, '×', I.kali.b)),
    bagi: teksRasional(kaliBagiPecahan(I.bagi.total, ':', I.bagi.ukuran)),
  };
  return T.dugaan
    .map(function (q) {
      var pilih = State.dugaanPilih[q.id];
      var kunci = T.kunciDugaan[q.id];
      var cocok = pilih === kunci;
      var opsiKunci = q.opsi.filter(function (o) {
        return o.id === kunci;
      })[0];
      return buildFeedbackBox(
        cocok ? 'success' : 'info',
        cocok ? '✓' : '💡',
        '<strong>' +
          (q.id === 'kali'
            ? fxe(fmtOperasiKaliBagi(I.kali.a, '×', I.kali.b))
            : fxe(fmtOperasiKaliBagi(I.bagi.total, ':', I.bagi.ukuran))) +
          ' = ' +
          fxe(hasil[q.id]) +
          '</strong> — ' +
          fx(opsiKunci.label) +
          '. ' +
          (cocok ? 'Dugaanmu tepat!' : 'Dugaanmu belum tepat, sekarang kamu tahu alasannya.')
      );
    })
    .join('');
}

function renderInformasi(container) {
  var D = DATA.informasi;
  var list = penuntunTampil();
  var penuntunBenar = guidedQuizAllCorrect(list, State.penuntunPilih);
  var rerender = function () {
    renderInformasi(container);
  };

  container.innerHTML =
    '<section aria-label="Menyajikan Informasi">' +
    buildHead(D) +
    '<div class="info-grid">' +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        fx(esc(D.kali.judul)) +
        '</h3>' +
        '<p>' +
        fxt(D.kali.teks) +
        '</p>' +
        buildLuasPecahan(D.kali.a, D.kali.b)
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        fx(esc(D.bagi.judul)) +
        '</h3>' +
        '<p>' +
        fxt(D.bagi.teks) +
        '</p>' +
        buildPitaKelompok(D.bagi.total, D.bagi.ukuran, {
          caption: fxe(
            hitungPitaKelompok(D.bagi.total, D.bagi.ukuran).utuh +
              ' kantong ' +
              D.bagi.ukuran +
              ' kg di dalam ' +
              D.bagi.total +
              ' kg'
          ),
        })
    ) +
    '</div>' +
    buildDlPanel(
      '<h3 style="margin-top:0;">🧭 Pertanyaan penuntun</h3>' +
        buildGuidedQuizList(list, State.penuntunOrders, State.penuntunPilih)
    ) +
    (penuntunBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📌 ' + esc(D.aturanJudul) + '</h3>' + buildAturan(),
          'panel--hero'
        ) +
        buildDlPanel(
          '<h3 style="margin-top:0;">🔁 ' + esc(D.dugaanJudul) + '</h3>' + buildCekDugaan()
        ) +
        buildDlNextButton('informasiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindGuidedQuizList(container, list, State.penuntunPilih, saveState, rerender);
  bindNext('informasiNextBtn', 'informasi', 'tim');
}

/* ============================================================
   7. STAGE: TIM ASAL  (Cooperative Learning — fase 3)
   Kartu ahli (4 strategi) dibagikan acak kepada anggota.
   ============================================================ */

function timNamaTerisi() {
  return State.timInput
    .map(function (v) {
      return String(v || '').trim();
    })
    .filter(function (v) {
      return v;
    });
}

/* true bila anggota yang terisi berbeda dari anggota yang sudah diberi kartu. */
function timBerubah() {
  var a = timNamaTerisi().slice().sort();
  var b = State.timAnggota.slice().sort();
  return a.join('|') !== b.join('|');
}

function timSepakatSemua() {
  return DATA.tim.kesepakatan.every(function (k) {
    return !!State.timSepakat[k.id];
  });
}

function renderTim(container) {
  var D = DATA.tim;
  var sudahAcak = State.timAnggota.length > 0;

  var anggotaHTML = State.timInput
    .map(function (v, i) {
      return (
        '<input type="text" class="input-text" id="timAnggota' +
        i +
        '" data-anggota="' +
        i +
        '" maxlength="24" autocomplete="off" value="' +
        esc(v) +
        '" placeholder="Anggota ' +
        (i + 1) +
        (i < D.minAnggota ? '' : ' (opsional)') +
        '" aria-label="Nama anggota ' +
        (i + 1) +
        '">'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Bentuk Tim Asal">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="field-group">' +
        '<label for="timNama">' +
        esc(D.namaTimLabel) +
        '</label>' +
        '<input type="text" class="input-text" id="timNama" maxlength="30" autocomplete="off" value="' +
        esc(State.timNama) +
        '" placeholder="' +
        esc(D.namaTimPlaceholder) +
        '">' +
        '</div>' +
        '<fieldset class="field-group tim-anggota">' +
        '<legend>' +
        esc(D.anggotaLabel) +
        ' (' +
        D.minAnggota +
        '–' +
        D.maksAnggota +
        ' orang)</legend>' +
        '<div class="tim-anggota__grid">' +
        anggotaHTML +
        '</div>' +
        '</fieldset>' +
        '<fieldset class="field-group sepakat">' +
        '<legend>' +
        esc(D.kesepakatanJudul) +
        '</legend>' +
        D.kesepakatan
          .map(function (k) {
            return (
              '<label class="sepakat-item"><input type="checkbox" data-sepakat="' +
              k.id +
              '"' +
              (State.timSepakat[k.id] ? ' checked' : '') +
              '><span>' +
              esc(k.teks) +
              '</span></label>'
            );
          })
          .join('') +
        '</fieldset>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn--outline-primary" id="timAcakBtn">' +
        esc(sudahAcak ? D.acakUlangLabel : D.acakLabel) +
        '</button>' +
        '</div>'
    ) +
    (sudahAcak
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🃏 ' +
            esc(D.ahliJudul) +
            '</h3>' +
            buildCoopTeamCard(State.timNama, State.timAnggota, 0, STRATEGI_KALI_BAGI) +
            '<p class="dl-caption" style="margin-top:var(--space-3);">🧩 ' +
            esc(D.ahliCatatan) +
            '</p>'
        ) + buildDlNextButton('timNextBtn', D.nextLabel)
      : '') +
    '</section>';

  var namaInp = document.getElementById('timNama');
  namaInp.addEventListener('input', function () {
    State.timNama = namaInp.value;
    saveState();
  });

  container.querySelectorAll('[data-anggota]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      State.timInput[+inp.dataset.anggota] = inp.value;
      saveState();
    });
    /* Nama anggota diubah setelah kartu dibagikan → bagikan ulang. */
    inp.addEventListener('change', function () {
      if (State.timAnggota.length && timBerubah()) {
        State.timAnggota = [];
        saveState();
        showNotice('Daftar anggota berubah. Tekan "Bagikan Kartu Ahli" lagi.');
        renderTim(container);
      }
    });
  });

  container.querySelectorAll('[data-sepakat]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      State.timSepakat[cb.dataset.sepakat] = cb.checked;
      saveState();
    });
  });

  document.getElementById('timAcakBtn').addEventListener('click', function () {
    if (!State.timNama.trim()) {
      showNotice('Tulis nama tim kalian dulu.');
      return;
    }
    if (timNamaTerisi().length < D.minAnggota) {
      showNotice('Tulis minimal ' + D.minAnggota + ' nama anggota.');
      return;
    }
    State.timAnggota = assignCoopRoles(State.timInput);
    saveState();
    renderTim(container);
  });

  bindNext('timNextBtn', 'tim', 'ahli', function () {
    if (!timSepakatSemua()) {
      showNotice('Centang semua kesepakatan tim sebelum menuju kelompok ahli.');
      return false;
    }
    return true;
  });
}

/* ============================================================
   8. STAGE: KELOMPOK AHLI  (Cooperative Learning — fase 4, Jigsaw)
   Empat stasiun strategi. Tiap stasiun: contoh dengan penjelajah
   interaktif + langkah yang dibuka satu per satu + kalimat kunci
   (dipelajari di kelompok ahli) → ahli mengajar tim asal (centang)
   → dua soal pilihan hasil berpengecoh (urutan opsi acak).
   ============================================================ */

function stasiunById(id) {
  return DATA.ahli.stasiun.filter(function (s) {
    return s.id === id;
  })[0];
}

function langkahContoh(stasiun) {
  var C = stasiun.contoh;
  return langkahKaliBagiPecahan(C.a, C.op, C.b).langkah;
}

function soalAhliBenar(stasiun, s) {
  return State.ahli[stasiun.id].soal[s.id].chosen === 'benar';
}

function stasiunSelesai(stasiun) {
  return (
    State.ahli[stasiun.id].ajar &&
    stasiun.soal.every(function (s) {
      return soalAhliBenar(stasiun, s);
    })
  );
}

function ahliSemuaSelesai() {
  return DATA.ahli.stasiun.every(stasiunSelesai);
}

/* Soal ahli ber-id unik → { stasiun, soal }. */
function cariSoalAhli(id) {
  var hasil = null;
  DATA.ahli.stasiun.forEach(function (st) {
    st.soal.forEach(function (s) {
      if (s.id === id) hasil = { stasiun: st, soal: s };
    });
  });
  return hasil;
}

/* Penjelajah interaktif tiap stasiun (bukan jawaban, tidak dinilai). */
function buildEksplor(stasiun, st) {
  var X = stasiun.eksplor;
  var C = stasiun.contoh;
  if (X.jenis === 'kaliBulat') {
    var n = st.eksplor;
    var total = kaliBagiPecahan(String(n), '×', X.pecahan);
    var ulang = [];
    for (var i = 0; i < n; i++) ulang.push('{' + X.pecahan + '}');
    return (
      '<div class="eksplor">' +
      '<div class="eksplor__stepper" role="group" aria-label="Banyak ' +
      esc(X.benda) +
      '">' +
      '<button type="button" class="btn btn--ghost btn--small" data-eksplor="-1"' +
      (n <= X.min ? ' disabled' : '') +
      ' aria-label="Kurangi">−</button>' +
      '<span class="eksplor__nilai" aria-live="polite">' +
      n +
      ' ' +
      esc(X.benda) +
      '</span>' +
      '<button type="button" class="btn btn--ghost btn--small" data-eksplor="1"' +
      (n >= X.maks ? ' disabled' : '') +
      ' aria-label="Tambah">+</button>' +
      '</div>' +
      buildPitaKelompok(teksRasional(total, 'biasa'), X.pecahan, {
        caption:
          fx(ulang.join(' + ')) +
          ' = ' +
          fxe(fmtOperasiKaliBagi(String(n), '×', X.pecahan)) +
          ' = ' +
          buildBilanganChip(teksRasional(total)) +
          ' ' +
          esc(C.satuan),
      }) +
      '</div>'
    );
  }
  if (X.jenis === 'bagi') {
    var u = st.eksplor;
    var h = hitungPitaKelompok(X.total, u);
    return (
      '<div class="eksplor">' +
      '<p class="eksplor__tanya">Isi setiap ' +
      esc(X.benda) +
      ':</p>' +
      '<div class="eksplor__pilih" role="group" aria-label="Ukuran ' +
      esc(X.benda) +
      '">' +
      X.ukuran
        .map(function (v) {
          var on = v === u;
          return (
            '<button type="button" class="pita-op__pick' +
            (on ? ' is-correct' : '') +
            '" data-eksplor-u="' +
            esc(v) +
            '" aria-pressed="' +
            (on ? 'true' : 'false') +
            '">' +
            fxe(v) +
            ' kg</button>'
          );
        })
        .join('') +
      '</div>' +
      buildPitaKelompok(X.total, u, {
        caption:
          'Di dalam ' +
          fxe(X.total) +
          ' kg ada <strong>' +
          buildBilanganChip(teksRasional(h.hasil)) +
          '</strong> ' +
          esc(X.benda) +
          ' ' +
          fxe(u) +
          ' kg' +
          (h.sisa.num
            ? ' (' + h.utuh + ' penuh + ' + fxe(teksRasional(h.sisa)) + ' ' + esc(X.benda) + ')'
            : '') +
          ' → ' +
          fxe(fmtOperasiKaliBagi(X.total, ':', u)) +
          ' = ' +
          fxe(teksRasional(h.hasil)),
      }) +
      '</div>'
    );
  }
  if (X.jenis === 'luas') {
    var tahap = st.eksplor;
    return (
      '<div class="eksplor">' +
      '<div class="eksplor__pilih" role="group" aria-label="Langkah model luas">' +
      '<button type="button" class="pita-op__pick' +
      (tahap === 'b' ? ' is-correct' : '') +
      '" data-eksplor-t="b" aria-pressed="' +
      (tahap === 'b' ? 'true' : 'false') +
      '">① Arsir ' +
      fxe(C.b) +
      '</button>' +
      '<button type="button" class="pita-op__pick' +
      (tahap === 'ab' ? ' is-correct' : '') +
      '" data-eksplor-t="ab" aria-pressed="' +
      (tahap === 'ab' ? 'true' : 'false') +
      '">② Ambil ' +
      fxe(C.a) +
      ' bagiannya</button>' +
      '</div>' +
      buildLuasPecahan(C.a, C.b, { tahap: tahap }) +
      '</div>'
    );
  }
  return '';
}

function bindEksplor(container, stasiun, st, rerender) {
  container.querySelectorAll('[data-eksplor]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var X = stasiun.eksplor;
      st.eksplor = Math.max(
        X.min,
        Math.min(X.maks, st.eksplor + parseInt(btn.dataset.eksplor, 10))
      );
      saveState();
      rerender();
    });
  });
  container.querySelectorAll('[data-eksplor-u]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      st.eksplor = btn.dataset.eksplorU;
      saveState();
      rerender();
    });
  });
  container.querySelectorAll('[data-eksplor-t]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      st.eksplor = btn.dataset.eksplorT;
      saveState();
      rerender();
    });
  });
}

function renderAhli(container) {
  var D = DATA.ahli;
  var stasiun = stasiunById(State.ahliTab);
  var info = strategiInfo(stasiun.id);
  var st = State.ahli[stasiun.id];
  var ahli = namaAhli(stasiun.id);
  var idx = D.stasiun.indexOf(stasiun);
  var C = stasiun.contoh;
  var langkah = langkahContoh(stasiun);
  var semuaLangkah = st.langkah >= langkah.length;
  var rerender = function () {
    renderAhli(container);
  };

  var tabs = D.stasiun
    .map(function (s) {
      var inf = strategiInfo(s.id);
      var aktif = s.id === stasiun.id;
      var nama = namaAhli(s.id);
      return (
        '<button type="button" class="ahli-tab' +
        (aktif ? ' is-active' : '') +
        (stasiunSelesai(s) ? ' is-done' : '') +
        '" data-ahli-tab="' +
        s.id +
        '" aria-pressed="' +
        (aktif ? 'true' : 'false') +
        '">' +
        '<span class="ahli-tab__ikon" aria-hidden="true">' +
        inf.ikon +
        '</span>' +
        '<span class="ahli-tab__nama">' +
        esc(inf.nama) +
        (nama ? '<span class="ahli-tab__ahli">' + esc(nama) + '</span>' : '') +
        '</span>' +
        (stasiunSelesai(s) ? '<span class="ahli-tab__cek" aria-label="selesai">✓</span>' : '') +
        '</button>'
      );
    })
    .join('');

  var soalHTML = stasiun.soal
    .map(function (s, i) {
      var ss = st.soal[s.id];
      var benar = soalAhliBenar(stasiun, s);
      return (
        '<div class="quiz-item">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        fxt(s.cerita) +
        '</p>' +
        buildKalimatSoal(s, benar) +
        buildChoiceGroup(opsiHasil(s), ss.order, {
          chosen: ss.chosen,
          correctId: benar ? 'benar' : null,
          grade: true,
          locked: benar,
          group: s.id,
          attr: 'data-ahli-opt',
        }) +
        buildHasilFeedback(
          s,
          ss,
          fxe(
            fmtOperasiKaliBagi(s.a, s.op, s.b) +
              ' = ' +
              hasilTeks(s) +
              ', jadi hasilnya ' +
              hasilTeks(s) +
              ' ' +
              s.satuan +
              '.'
          ) + (s.catatan ? ' ' + esc(s.catatan) : '')
        ) +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Kelompok Ahli">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    '<div class="ahli-tabs" role="group" aria-label="Stasiun ahli">' +
    tabs +
    '</div>' +
    '<div class="panel">' +
    '<p class="dl-caption" style="margin-top:0;">Stasiun ' +
    (idx + 1) +
    ' dari ' +
    D.stasiun.length +
    (ahli ? ' · Ahli: <strong>' + esc(ahli) + '</strong>' : '') +
    '</p>' +
    buildStrategiCard(info, { kunciLabel: 'Kalimat kunci:' }) +
    '<h3 class="misi-sub">① Contoh (jelajahi di kelompok ahli)</h3>' +
    buildKonteks(info.ikon, C.cerita) +
    buildEksplor(stasiun, st) +
    buildKalimatSoal(C, semuaLangkah) +
    buildLangkahHitung(C, st.langkah) +
    (semuaLangkah
      ? buildFeedbackBox(
          'success',
          info.ikon,
          '<strong>Hasil:</strong> ' +
            fxe(fmtOperasiKaliBagi(C.a, C.op, C.b)) +
            ' = ' +
            buildBilanganChip(hasilTeks(C)) +
            ' ' +
            esc(C.satuan) +
            '. ' +
            fxt(info.kunci)
        )
      : '<div class="btn-group"><button type="button" class="btn btn--outline-primary" id="ahliLangkahBtn">' +
        esc(D.langkahLabel) +
        ' (' +
        (st.langkah + 1) +
        '/' +
        langkah.length +
        ')</button></div>') +
    '<label class="sepakat-item ahli-ajar"><input type="checkbox" id="ahliAjar"' +
    (st.ajar ? ' checked' : '') +
    '><span>' +
    esc(D.ajarLabel) +
    '</span></label>' +
    '<h3 class="misi-sub">② Soal tim asal (dipandu ahli)</h3>' +
    soalHTML +
    '</div>' +
    '<div class="btn-group btn-group--spread">' +
    (idx > 0
      ? '<button type="button" class="btn btn--ghost" id="ahliPrev">← Stasiun Sebelumnya</button>'
      : '<span></span>') +
    (idx < D.stasiun.length - 1
      ? '<button type="button" class="btn btn--outline-primary" id="ahliNextTab">Stasiun Berikutnya →</button>'
      : '') +
    '</div>' +
    (ahliSemuaSelesai()
      ? buildDlPanel(
          buildFeedbackBox(
            'success',
            '🧩',
            '<strong>Semua ahli sudah mengajar!</strong> Tim kalian kini menguasai empat strategi. Di misi berikutnya, ahli yang cocok memimpin perhitungan.'
          )
        ) + buildDlNextButton('ahliNextBtn', D.nextLabel)
      : '') +
    '</section>';

  container.querySelectorAll('[data-ahli-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.ahliTab = btn.dataset.ahliTab;
      saveState();
      rerender();
    });
  });

  bindEksplor(container, stasiun, st, rerender);

  var langkahBtn = document.getElementById('ahliLangkahBtn');
  if (langkahBtn) {
    langkahBtn.addEventListener('click', function () {
      st.langkah = Math.min(st.langkah + 1, langkah.length);
      saveState();
      rerender();
    });
  }

  var ajar = document.getElementById('ahliAjar');
  ajar.addEventListener('change', function () {
    st.ajar = ajar.checked;
    saveState();
    rerender();
  });

  container.querySelectorAll('[data-ahli-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = cariSoalAhli(btn.dataset.group);
      if (!f) return;
      var ss = State.ahli[f.stasiun.id].soal[f.soal.id];
      if (ss.chosen === 'benar') return;
      ss.chosen = btn.dataset.ahliOpt;
      if (ss.chosen !== 'benar') ss.wrong += 1;
      saveState();
      rerender();
    });
  });

  function pindah(delta) {
    State.ahliTab = D.stasiun[idx + delta].id;
    saveState();
    rerender();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  var prev = document.getElementById('ahliPrev');
  if (prev) {
    prev.addEventListener('click', function () {
      pindah(-1);
    });
  }
  var next = document.getElementById('ahliNextTab');
  if (next) {
    next.addEventListener('click', function () {
      pindah(1);
    });
  }
  bindNext('ahliNextBtn', 'ahli', 'misiAjar');
}

/* ============================================================
   9. STAGE: MISI 1 — OPERASI APA?  (Cooperative Learning — fase 4)
   Per pesanan: pilih kalimat matematika (acak, umpan per opsi) →
   pilih ahli yang memimpin (semua ahli yang BERLAKU diterima) →
   pilih hasil (pengecoh miskonsepsi dari engine, acak).
   ============================================================ */

function ahliSah(s, id) {
  return jenisOperasiKaliBagi(s.a, s.op, s.b).indexOf(id) !== -1;
}

function ajarSelesai(s) {
  var st = State.ajar[s.id];
  return !!st && st.hasil.chosen === 'benar';
}

function ajarSemuaSelesai() {
  return DATA.misiAjar.soal.every(ajarSelesai);
}

function buildKalimatFeedback(s, st) {
  var ch = st.kalimat.chosen;
  if (!ch) return '';
  var k = s.kalimat.filter(function (x) {
    return x.id === ch;
  })[0];
  var benar = ch === 'benar';
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(benar ? 'success' : 'warning', benar ? '✓' : '💭', fx(k.umpan)) +
    '</div>'
  );
}

function buildAhliFeedback(s, st) {
  var ch = st.ahli.chosen;
  if (!ch) return '';
  var info = strategiInfo(ch);
  var berlaku = jenisOperasiKaliBagi(s.a, s.op, s.b);
  if (!ahliSah(s, ch)) {
    return (
      '<div style="margin-top:var(--space-3);">' +
      buildFeedbackBox(
        'warning',
        '💭',
        '<strong>' +
          esc(info.nama) +
          '</strong> belum cocok untuk kalimat ini. Lihat lagi: dikali atau dibagi? Ada bilangan bulat, pecahan campuran, atau bilangan negatif?'
      ) +
      '</div>'
    );
  }
  var ahli = namaAhli(ch);
  var lain = berlaku
    .filter(function (id) {
      return id !== ch;
    })
    .map(function (id) {
      return strategiInfo(id).nama;
    });
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(
      'success',
      info.ikon,
      '<strong>Cocok!</strong> ' +
        (ahli ? '<strong>' + esc(ahli) + '</strong> (' + esc(info.nama) + ')' : esc(info.nama)) +
        ' memimpin: ' +
        fxt(info.kunci) +
        (lain.length ? ' <em>' + esc(lain.join(' dan ')) + ' juga ikut membantu.</em>' : '')
    ) +
    '</div>'
  );
}

function renderMisiAjar(container) {
  var D = DATA.misiAjar;
  var idx = State.ajarIdx;
  var s = D.soal[idx];
  var st = State.ajar[s.id];
  var kalimatOk = st.kalimat.chosen === 'benar';
  var ahliOk = !!st.ahli.chosen && ahliSah(s, st.ahli.chosen);
  var selesai = ajarSelesai(s);
  var rerender = function () {
    renderMisiAjar(container);
  };

  container.innerHTML =
    '<section aria-label="Misi 1: Operasi Apa?">' +
    buildHead(D) +
    buildPeranMisi(D.ronde) +
    buildDlPanel(buildLangkah(D.langkah), 'panel--compact') +
    '<div class="panel">' +
    buildMisiProgress(D.soal.length, idx, function (i) {
      return ajarSelesai(D.soal[i]);
    }) +
    buildKonteks(s.ikon, s.cerita) +
    '<h3 class="misi-sub">① Kalimat matematika yang tepat adalah …</h3>' +
    buildChoiceGroup(fxOpsi(s.kalimat), st.kalimatOrder, {
      chosen: st.kalimat.chosen,
      correctId: kalimatOk ? 'benar' : null,
      grade: true,
      locked: kalimatOk,
      group: s.id,
      attr: 'data-kalimat',
    }) +
    buildKalimatFeedback(s, st) +
    (kalimatOk
      ? '<h3 class="misi-sub">② Ahli mana yang memimpin perhitungan?</h3>' +
        buildChoiceGroup(OPSI_AHLI, st.ahliOrder, {
          chosen: st.ahli.chosen,
          correctId: ahliOk ? st.ahli.chosen : null,
          grade: true,
          locked: ahliOk,
          group: s.id,
          attr: 'data-ahli-pilih',
        }) +
        buildAhliFeedback(s, st)
      : '') +
    (ahliOk
      ? '<h3 class="misi-sub">③ Hitung bersama — hasilnya adalah …</h3>' +
        buildKalimatSoal(s, selesai) +
        buildChoiceGroup(opsiHasil(s), st.hasil.order, {
          chosen: st.hasil.chosen,
          correctId: selesai ? 'benar' : null,
          grade: true,
          locked: selesai,
          group: s.id,
          attr: 'data-hasil',
        }) +
        buildHasilFeedback(
          s,
          st.hasil,
          '<strong>' + fxe(s.makna.replace('%HASIL%', hasilTeks(s))) + '</strong>'
        ) +
        (selesai ? buildLangkahHitung(s) : '')
      : '') +
    '</div>' +
    buildNavSoal('ajar', idx, D.soal.length, selesai, 'Pesanan') +
    (ajarSemuaSelesai() ? buildDlNextButton('ajarNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-kalimat]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (kalimatOk) return;
      st.kalimat.chosen = btn.dataset.kalimat;
      if (st.kalimat.chosen !== 'benar') st.kalimat.wrong += 1;
      saveState();
      rerender();
    });
  });
  container.querySelectorAll('[data-ahli-pilih]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (ahliOk) return;
      st.ahli.chosen = btn.dataset.ahliPilih;
      if (!ahliSah(s, st.ahli.chosen)) st.ahli.wrong += 1;
      saveState();
      rerender();
    });
  });
  container.querySelectorAll('[data-hasil]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (selesai) return;
      st.hasil.chosen = btn.dataset.hasil;
      if (st.hasil.chosen !== 'benar') st.hasil.wrong += 1;
      saveState();
      rerender();
    });
  });

  bindNavSoal('ajar', 'ajarIdx', rerender);
  bindNext('ajarNextBtn', 'misiAjar', 'misiHitung');
}

/* ============================================================
   10. STAGE: MISI 2 — HITUNG PESANAN  (Cooperative Learning — fase 4)
   Per pesanan: isian hasil dengan diagnosa miskonsepsi (seksi 62/63),
   petunjuk berjenjang, lalu langkah penyelesaian lengkap.
   ============================================================ */

function hitungSelesai(s) {
  var st = State.hitung[s.id];
  return !!st && st.done;
}

function hitungSemuaSelesai() {
  return DATA.misiHitung.soal.every(hitungSelesai);
}

/* Soal untuk buildIsianOperasi: label, petunjuk & temuan sudah dirender. */
function soalIsian(s) {
  return {
    a: s.a,
    op: s.op,
    b: s.b,
    satuan: s.satuan,
    label: 'Tulis hasil ' + fxe(fmtOperasiKaliBagi(s.a, s.op, s.b)) + ':',
    hints: s.hints.map(fxt),
    temuan: '<strong>Langkah penyelesaian</strong>' + buildLangkahHitung(s),
    placeholder: 'mis. 1 1/8, 10, atau −1 1/2',
  };
}

function renderMisiHitung(container) {
  var D = DATA.misiHitung;
  var idx = State.hitungIdx;
  var s = D.soal[idx];
  var st = State.hitung[s.id];
  var selesai = hitungSelesai(s);
  var soal = soalIsian(s);
  var rerender = function () {
    renderMisiHitung(container);
  };
  var pemimpin = jenisOperasiKaliBagi(s.a, s.op, s.b)
    .map(function (id) {
      var info = strategiInfo(id);
      var nama = namaAhli(id);
      return info.ikon + ' ' + esc(info.nama) + (nama ? ' (' + esc(nama) + ')' : '');
    })
    .join(' · ');

  container.innerHTML =
    '<section aria-label="Misi 2: Hitung Pesanan">' +
    buildHead(D) +
    buildPeranMisi(D.ronde) +
    buildDlPanel(buildLangkah(D.langkah), 'panel--compact') +
    '<div class="panel">' +
    buildMisiProgress(D.soal.length, idx, function (i) {
      return hitungSelesai(D.soal[i]);
    }) +
    buildKonteks(s.ikon, s.cerita) +
    '<p class="dl-caption">Dipimpin: ' +
    pemimpin +
    '</p>' +
    buildIsianOperasi('hit' + s.id, st, soal, null) +
    (selesai
      ? '<p class="dl-caption">Juru Bicara membacakan langkah di atas kepada tim.</p>'
      : '') +
    '</div>' +
    buildNavSoal('hitung', idx, D.soal.length, selesai, 'Pesanan') +
    (hitungSemuaSelesai() ? buildDlNextButton('hitungNextBtn', D.nextLabel) : '') +
    '</section>';

  bindIsianOperasi('hit' + s.id, st, soal, saveState, rerender);
  bindNavSoal('hitung', 'hitungIdx', rerender);
  bindNext('hitungNextBtn', 'misiHitung', 'misiDiskusi');
}

/* ============================================================
   11. STAGE: MISI 3 — CEK PENDAPAT TEMAN  (CL fase 4)
   Pernyataan Benar/Salah (urutan pernyataan & opsi diacak), dijawab
   sekali setelah tim sepakat; Juru Bicara menulis penjelasan.
   ============================================================ */

function pernyataanTampil() {
  return DATA.misiDiskusi.pernyataan.map(function (p) {
    return { id: p.id, teks: fx(p.teks), correct: p.correct, explanation: fx(p.explanation) };
  });
}

function renderMisiDiskusi(container) {
  var D = DATA.misiDiskusi;
  var list = pernyataanTampil();
  var selesai = sortItemsAllAnswered(list, State.diskusiStates);
  var rerender = function () {
    renderMisiDiskusi(container);
  };

  container.innerHTML =
    '<section aria-label="Misi 3: Cek Pendapat Teman">' +
    buildHead(D) +
    buildPeranMisi(D.ronde) +
    buildDlPanel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    '<details class="panel panel--compact strategi-ringkas">' +
    '<summary>🧩 Kartu strategi para ahli</summary>' +
    buildStrategiGrid() +
    '</details>' +
    buildDlPanel(buildSortItems(list, State.diskusiOrder, D.opsi, State.diskusiStates)) +
    (selesai
      ? buildDlPanel(
          buildTextarea('diskusiJubir', D.jubirLabel, State.diskusiJubir, D.jubirPlaceholder)
        ) + buildDlNextButton('diskusiNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindSortItems(container, list, State.diskusiStates, saveState, rerender);
  bindTextarea('diskusiJubir', 'diskusiJubir');
  bindNext('diskusiNextBtn', 'misiDiskusi', 'kuis', function () {
    if (!State.diskusiJubir.trim()) {
      showNotice('Juru Bicara menuliskan penjelasan tim lebih dulu.');
      return false;
    }
    return true;
  });
}

/* ============================================================
   12. STAGE: KUIS INDIVIDU  (Cooperative Learning — fase 5)
   Pilihan ganda (opsi hasil berpengecoh dari engine, diacak) dan
   isian berdiagnosa miskonsepsi.
   ============================================================ */

function satuanHTML(satuan) {
  return satuan ? '<span class="bbk-satuan">' + esc(satuan) + '</span>' : '';
}

function pembahasanKuis(s) {
  return (
    '<strong>' +
    fxe(fmtOperasiKaliBagi(s.a, s.op, s.b) + ' = ' + hasilTeks(s)) +
    ' ' +
    esc(s.satuan) +
    '.</strong>' +
    buildLangkahHitung(s)
  );
}

var KuisStage = createExerciseStage({
  soal: KUIS_SOAL,
  getExercises: function () {
    return State.kuisExercises;
  },
  getIndex: function () {
    return State.kuisIdx;
  },
  setIndex: function (i) {
    State.kuisIdx = i;
  },
  save: saveState,
  idPrefix: 'kz',
  sectionLabel: 'Kuis Individu',
  kicker: DATA.kuis.kicker,
  goal: DATA.kuis.goal,
  instruction: DATA.kuis.instruksi,
  buildHead: function () {
    return buildHead(DATA.kuis) + '<p class="dl-caption">' + esc(DATA.kuis.instruksi) + '</p>';
  },
  nextStageId: 'penghargaan',
  completeStageId: 'kuis',
  nextButtonLabel: DATA.kuis.nextLabel,
  defaultType: 'input',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  inputRowClass: 'dl-input-row',
  inputMode: 'text',
  allowNegative: true,
  inputAriaLabel: 'Jawabanmu',
  inputPlaceholder: 'mis. 3/10, 6, atau −1 1/2',
  inputSuffix: function (s) {
    return satuanHTML(s.satuan);
  },
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  /* Teks mentah diteruskan; pemeriksaan & diagnosa ada di isCorrect. */
  parseInput: function (val) {
    if (!val || !String(val).trim()) return { value: null, error: 'empty' };
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return diagnosaKaliBagiPecahan(value, s.a, s.op, s.b).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' +
      esc(ex.userInput) +
      '</strong> — ' +
      diagnosaKaliBagiPecahan(ex.userInput, s.a, s.op, s.b).pesan
    );
  },
  revealText: function (s) {
    return pembahasanKuis(s);
  },
  buildChoiceFeedback: function (s, ex) {
    return ex.correct
      ? buildFeedbackBox('success', '✓', '<strong>Benar!</strong> ' + pembahasanKuis(s))
      : buildFeedbackBox(
          'error',
          '✗',
          '<strong>Belum tepat.</strong> ' + esc(s.umpan[ex.chosen] || '') + ' ' + pembahasanKuis(s)
        );
  },
  renderPrompt: function (s) {
    var tag = s.type === 'choice' ? '🔘 Pilihan ganda' : '✏️ Tulis jawabanmu';
    return (
      '<div class="dl-prompt">' +
      '<span class="kuis-tag">' +
      tag +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      fxt(s.cerita) +
      '</p>' +
      '<p class="dl-prompt__tanya">' +
      fxt(s.pertanyaan) +
      '</p>' +
      '</div>'
    );
  },
});

function renderKuis(container) {
  KuisStage.render(container);
}

/* ============================================================
   13. STAGE: PENGHARGAAN  (Cooperative Learning — fase 6)
   Skor stasiun & misi = benar pada percobaan pertama; skor kuis =
   benar tanpa percobaan ulang/ungkap jawaban.
   ============================================================ */

/* Skor stasiun ahli: { benar, maks } per stasiun. */
function skorStasiun(stasiun) {
  var benar = 0;
  stasiun.soal.forEach(function (s) {
    var ss = State.ahli[stasiun.id].soal[s.id];
    if (soalAhliBenar(stasiun, s) && !ss.wrong) benar += 1;
  });
  return { benar: benar, maks: stasiun.soal.length };
}

function misiSkor() {
  var benar = 0;
  var maks = 0;
  DATA.ahli.stasiun.forEach(function (stasiun) {
    var sk = skorStasiun(stasiun);
    benar += sk.benar;
    maks += sk.maks;
  });
  DATA.misiAjar.soal.forEach(function (s) {
    var st = State.ajar[s.id];
    maks += 3;
    if (st && ajarSelesai(s)) {
      if (!st.kalimat.wrong) benar += 1;
      if (!st.ahli.wrong) benar += 1;
      if (!st.hasil.wrong) benar += 1;
    }
  });
  DATA.misiHitung.soal.forEach(function (s) {
    var st = State.hitung[s.id];
    maks += 1;
    if (hitungSelesai(s) && st.attempts === 1) benar += 1;
  });
  maks += DATA.misiDiskusi.pernyataan.length;
  benar += sortItemsCorrectCount(DATA.misiDiskusi.pernyataan, State.diskusiStates);
  return { benar: benar, maks: maks };
}

function kuisSkor() {
  return {
    benar: State.kuisExercises.filter(function (e) {
      return e.correct && e.attempts === 1 && !e.revealed;
    }).length,
    maks: KUIS_SOAL.length,
  };
}

function poinTim() {
  var m = misiSkor();
  var k = kuisSkor();
  return Math.round((50 * m.benar) / m.maks + (50 * k.benar) / k.maks);
}

function renderPenghargaan(container) {
  var D = DATA.penghargaan;
  var m = misiSkor();
  var k = kuisSkor();
  var poin = poinTim();
  var award = coopAwardLevel(poin);

  var ahliHTML = DATA.ahli.stasiun
    .map(function (stasiun) {
      var info = strategiInfo(stasiun.id);
      var sk = skorStasiun(stasiun);
      var nama = namaAhli(stasiun.id);
      return (
        '<li><span aria-hidden="true">' +
        info.ikon +
        '</span> <strong>' +
        esc(nama || '—') +
        '</strong> — ' +
        esc(info.nama) +
        ' <span class="dl-caption">(soal stasiun benar percobaan pertama: ' +
        sk.benar +
        '/' +
        sk.maks +
        ')</span></li>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Penghargaan Tim">' +
    buildHead(D) +
    '<div class="coop-award">' +
    '<span class="coop-award__ikon" aria-hidden="true">' +
    award.ikon +
    '</span>' +
    '<p class="coop-award__label">' +
    esc(award.label) +
    '</p>' +
    '<p class="coop-award__tim">' +
    esc(State.timNama || 'Tim kalian') +
    (State.timAnggota.length ? ' — ' + esc(State.timAnggota.join(', ')) : '') +
    '</p>' +
    '<p style="margin:0;">' +
    esc(award.teks) +
    '</p>' +
    '</div>' +
    buildDlPanel(
      '<div class="summary-grid">' +
        kartuRingkas(m.benar + '/' + m.maks, 'Skor stasiun & misi tim (percobaan pertama)') +
        kartuRingkas(k.benar + '/' + k.maks, 'Skor kuis individu') +
        kartuRingkas(poin, 'Poin tim (0–100)') +
        '</div>' +
        '<p class="dl-caption" style="margin-top:var(--space-3);">' +
        esc(D.bobot) +
        ' Predikat: Tim Super ≥ 85, Tim Hebat ≥ 70, Tim Baik &lt; 70.</p>'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🧩 Para ahli tim kalian</h3><ul class="ahli-rekap">' +
        ahliHTML +
        '</ul>'
    ) +
    buildDlPanel(buildTextarea('pujianTa', D.pujianLabel, State.pujian, D.pujianPlaceholder)) +
    buildDlNextButton('penghargaanNextBtn', D.nextLabel) +
    '</section>';

  bindTextarea('pujianTa', 'pujian');
  bindNext('penghargaanNextBtn', 'penghargaan', 'refleksi');
}

/* ============================================================
   14. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    buildHead(D) +
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
          fxt(q.teks) +
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

  bindNext('refleksiSaveBtn', 'refleksi', 'selesai', function () {
    if (!State.refleksiDiri) {
      showNotice('Pilih dulu seberapa yakin kamu sekarang.');
      return false;
    }
    return true;
  });
}

/* ============================================================
   15. STAGE: SELESAI
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
    '<div class="panel panel--hero done-card__list">' +
    '<h3 style="margin-top:0;">🧩 Empat strategi para ahli</h3>' +
    buildStrategiGrid() +
    '</div>' +
    '<div class="panel done-card__list">' +
    '<h3 style="margin-top:0;">' +
    esc(DATA.informasi.aturanJudul) +
    '</h3>' +
    buildAturan() +
    '</div>' +
    '<div class="panel done-card__list">' +
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
    'Poin tim adalah indikator latihan digital, bukan nilai akhir. ' +
    'Penjelasan lisan para ahli, catatan Juru Bicara, dan refleksi murid menjadi bahan asesmen formatif utama.' +
    '</div></div>' +
    '<div class="btn-group btn-group--center">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '<button type="button" class="btn btn--outline-primary" id="reviewBtn">Tinjau Ulang</button>' +
    '</div>' +
    '</div>' +
    '</section>';

  completeStage('selesai');

  document.getElementById('reviewBtn').addEventListener('click', function () {
    navigateTo('tujuan');
  });
}

/* ============================================================
   16. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  tujuan: renderTujuan,
  informasi: renderInformasi,
  tim: renderTim,
  ahli: renderAhli,
  misiAjar: renderMisiAjar,
  misiHitung: renderMisiHitung,
  misiDiskusi: renderMisiDiskusi,
  kuis: renderKuis,
  penghargaan: renderPenghargaan,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  var fn = RENDERERS[State.currentStage] || RENDERERS.tujuan;
  fn(container);
}

/* ============================================================
   17. HELPER UI — MODAL RESET
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
   18. INIT
   ============================================================ */

function init() {
  buildStageNav();
  loadState();
  if (STAGES.indexOf(State.currentStage) === -1) State.currentStage = 'tujuan';
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
      navigateTo('tujuan');
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
