'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Membaca, Menuliskan & Membandingkan Notasi Ilmiah
   Fase D — SMP Kelas VIII · Topik 12

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen umum: buildDiscoveryHead, buildTeacherNote, buildTpPanel,
       buildChoiceGroup, buildSortItems, buildGuidedQuizList,
       buildDlPanel, buildDlNextButton, buildInfoPoster;
     • seksi 14 (urut-ketuk): ensureTapOrderState, buildTapOrder,
       bindTapOrder;
     • seksi 53 (notasi ilmiah): teksIlmiah, bacaIlmiah, bakukanIlmiah,
       ilmiahKeDesimal, desimalKeIlmiah, isBakuIlmiah,
       pangkatBakuIlmiah, simbolBandingIlmiah, urutanIdIlmiah,
       ekstremIlmiah, opsiBacaIlmiah, opsiTulisIlmiah,
       opsiBakukanIlmiah, opsiPanjangIlmiah, opsiMaknaBandingIlmiah,
       buildLabGeserKoma/bindLabGeserKoma, buildPitaOrde/bindPitaOrde,
       buildPilihSimbolIlmiah/bindPilihSimbolIlmiah,
       buildKalimatBandingIlmiah, ilmiahHTML.

   Alur tahap mengikuti sintaks Problem Based Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan, pertanyaan inti, peran,
   butir & kategori pemilahan, kartu rencana, kartu lab, pertanyaan
   pengamatan, opsi cara baca, butir baku/belum baku, opsi menulis,
   membakukan & bentuk panjang, lambang <, >, =, makna perbandingan,
   kartu pita orde, strategi, kartu urutan papan, berapa kali lipat,
   alasan, pendapat teman, bank simpulan, soal & opsi uji terap,
   penilaian diri) DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder() / ensureSortStates() / ensureTapOrderState().
   Pengacakan dilakukan SEKALI saat state disiapkan (initExerciseArrays)
   lalu urutannya disimpan di State — bukan saat render — sehingga
   pilihan tidak melompat saat dirender ulang, tetapi teracak ulang untuk
   setiap murid dan setiap Reset.

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi Masalah       (PBL sintaks 1)
    6. Stage: Organisasi              (PBL sintaks 2)
    7. Stage: Lab Geser Koma & Baca   (PBL sintaks 3a)
    8. Stage: Tulis Bentuk Baku       (PBL sintaks 3b)
    9. Stage: Bandingkan              (PBL sintaks 3c)
   10. Stage: Karya                   (PBL sintaks 4)
   11. Stage: Evaluasi                (PBL sintaks 5)
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
var STORAGE_KEY = 'mpi-d-12-6-notasi-ilmiah-v1';

/* Teks biasa dari DATA → HTML aman; **teks** menjadi tebal. */
function teksHTML(str) {
  return esc(str).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/* Pertanyaan penuntun dari DATA: tanya (HTML) + label opsi & umpan di-escape. */
function siapkanGuided(q) {
  var umpan = {};
  Object.keys(q.umpan).forEach(function (k) {
    umpan[k] = esc(q.umpan[k]);
  });
  return {
    id: q.id,
    tanya: teksHTML(q.tanya),
    opsi: opsiAman(q.opsi),
    correct: q.correct,
    umpan: umpan,
  };
}

/* Opsi teks biasa → opsi berlabel HTML aman. */
function opsiAman(list) {
  return list.map(function (o) {
    return { id: o.id, label: esc(o.label) };
  });
}

/* Opsi berdiagnosa buatan engine → pertanyaan penuntun { id, tanya, opsi, correct, umpan }. */
function guidedDariEngine(id, tanyaHTML, opsiEngine) {
  var umpan = {};
  opsiEngine.forEach(function (o) {
    umpan[o.id] = esc(o.umpan);
  });
  return {
    id: id,
    tanya: tanyaHTML,
    opsi: opsiAman(opsiEngine),
    correct: 'baku',
    umpan: umpan,
  };
}

var BENDA = {};
DATA.benda.forEach(function (b) {
  BENDA[b.id] = b;
});

/* Teks bilangan sesuai bentuk tulisannya di catatan. */
function tulisBilangan(x, bentuk) {
  return bentuk === 'panjang' ? ilmiahKeDesimal(x) : teksIlmiah(x);
}

function tulisBenda(b) {
  return tulisBilangan(b.x, b.bentuk);
}

/* Bilangan sebagai chip HTML (notasi ilmiah diberi label bacaan). */
function numHTML(x, bentuk, cls) {
  if (bentuk === 'panjang') {
    return (
      '<span class="ilm ilm--panjang' +
      (cls ? ' ' + cls : '') +
      '">' +
      esc(ilmiahKeDesimal(x)) +
      '</span>'
    );
  }
  return ilmiahHTML(x, cls);
}

var DUGAAN_OPSI = {};
DATA.orientasi.dugaan.forEach(function (q) {
  DUGAAN_OPSI[q.id] = opsiAman(q.opsi);
});
var MASALAH_OPSI = opsiAman(DATA.orientasi.masalahOpsi);

var PILAH_ITEMS = DATA.organisasi.pilah.map(function (p) {
  return { id: p.id, teks: esc(p.teks), correct: p.correct, explanation: esc(p.explanation) };
});
var RENCANA_ITEMS = DATA.organisasi.rencana.map(function (r) {
  return { id: r.id, label: esc(r.label), aria: r.label };
});
var RENCANA_JAWAB = optionIds(DATA.organisasi.rencana);

/* Tahap 3 — lab, pengamatan, kartu baca */
var LAB_ITEMS = DATA.selidikBaca.lab;
var AMATI = DATA.selidikBaca.amati.map(siapkanGuided);
var BACA = DATA.selidikBaca.baca.map(function (b) {
  return guidedDariEngine(
    b.id,
    esc(b.konteks) + ': ' + ilmiahHTML(b.x) + ' ' + esc(b.satuan) + '. Cara membacanya …',
    opsiBacaIlmiah(b.x)
  );
});

/* Tahap 4 — pemilahan baku & tiga jenis kartu menulis */
var PILAH_BAKU = DATA.selidikTulis.pilahBaku.map(function (k) {
  var b = bakukanIlmiah(k.x);
  var angka = parseFloat(k.x.m.replace(',', '.'));
  return {
    id: k.id,
    teks: '<span class="ilm ilm--big">' + esc(teksIlmiah(k.x)) + '</span>',
    correct: k.correct,
    explanation: esc(
      isBakuIlmiah(k.x)
        ? 'Mantisa ' + k.x.m + ' ada di antara 1 dan 10, jadi sudah baku.'
        : 'Mantisa ' +
            k.x.m +
            (angka >= 10 ? ' sudah 10 atau lebih' : ' kurang dari 1') +
            ', jadi belum baku. Bentuk bakunya ' +
            teksIlmiah(b) +
            '.'
    ),
  };
});

function tanyaKartu(t, bilHTML, akhir) {
  return (
    '<span aria-hidden="true">' +
    t.ikon +
    '</span> ' +
    esc(t.nama) +
    ': ' +
    bilHTML +
    ' ' +
    esc(t.satuan) +
    '. ' +
    esc(akhir)
  );
}

var TULIS = DATA.selidikTulis.tulis.map(function (t) {
  return guidedDariEngine(
    t.id,
    tanyaKartu(
      t,
      '<span class="ilm ilm--panjang">' + esc(t.desimal) + '</span>',
      'Notasi ilmiah bakunya …'
    ),
    opsiTulisIlmiah(t.desimal)
  );
});
var BAKUKAN = DATA.selidikTulis.bakukan.map(function (u) {
  return guidedDariEngine(
    u.id,
    tanyaKartu(u, ilmiahHTML(u.x), 'Bentuk bakunya …'),
    opsiBakukanIlmiah(u.x)
  );
});
var PANJANG = DATA.selidikTulis.panjang.map(function (q) {
  return guidedDariEngine(
    q.id,
    tanyaKartu(q, ilmiahHTML(q.x), 'Bentuk panjangnya …'),
    opsiPanjangIlmiah(q.x)
  );
});

/* Tahap 5 — pita orde & strategi */
var PITA_ITEMS = DATA.selidikBanding.pita.map(function (id) {
  var b = BENDA[id];
  return { id: b.id, ikon: b.ikon, nama: b.nama, x: b.x, tulis: tulisBenda(b) + ' ' + b.satuan };
});
var STRATEGI = DATA.selidikBanding.strategi.map(siapkanGuided);

/* Tahap 6 — kartu urutan papan & jawabannya */
function kartuUrut(ids) {
  return ids.map(function (id) {
    var b = BENDA[id];
    return {
      id: b.id,
      x: b.x,
      label:
        '<span aria-hidden="true">' +
        b.ikon +
        '</span> <strong>' +
        esc(b.nama) +
        '</strong> ' +
        numHTML(b.x, b.bentuk) +
        ' ' +
        esc(b.satuan),
      aria: b.nama + ' ' + tulisBenda(b) + ' ' + b.satuan,
    };
  });
}
var MIKRO_ITEMS = kartuUrut(DATA.karya.urutMikro);
var MIKRO_JAWAB = urutanIdIlmiah(MIKRO_ITEMS);
var RAKSASA_ITEMS = kartuUrut(DATA.karya.urutRaksasa);
var RAKSASA_JAWAB = urutanIdIlmiah(RAKSASA_ITEMS, 'turun');
var TANYA_KALI = siapkanGuided(DATA.karya.tanyaKali);
var TANYA_ALASAN = siapkanGuided(DATA.karya.tanyaAlasan);

var PENDAPAT_ITEMS = DATA.evaluasi.pendapat.map(function (p) {
  return { id: p.id, teks: esc(p.teks), correct: p.correct, explanation: esc(p.explanation) };
});

/*
 * Bank soal uji terap. Opsi soal baca/tulis/bakukan dibuat engine
 * (berdiagnosa, opsi benar ber-id 'baku'); soal banding & urut dari
 * DATA. Semua label di-escape; umpan per opsi dipakai saat salah.
 */
function namaUrutan(s, urutan) {
  var byId = {};
  s.items.forEach(function (it) {
    byId[it.id] = it.nama;
  });
  return urutan
    .map(function (id) {
      return byId[id];
    })
    .join(s.arah === 'turun' ? ' > ' : ' < ');
}

function soalTerap(s) {
  var c = {
    id: s.id,
    jenis: s.jenis,
    type: s.type === 'input' ? 'input' : 'choice',
    cerita: s.cerita,
    pertanyaan: s.pertanyaan,
  };
  var opsi;
  if (s.type === 'input') {
    var b = desimalKeIlmiah(s.desimal);
    c.jawab = b.e;
    c.hints = s.hints.map(esc);
    c.explanation = esc(
      s.desimal + ' = ' + teksIlmiah(b) + ', jadi n = ' + formatNumber(b.e, '−') + '.'
    );
    return c;
  }
  if (s.jenis === 'baca') {
    opsi = opsiBacaIlmiah(s.x);
    c.explanation = esc('Cara bacanya: ' + bacaIlmiah(s.x) + '.');
  } else if (s.jenis === 'tulis') {
    opsi = opsiTulisIlmiah(s.desimal);
    c.explanation = esc(
      s.desimal + ' = ' + opsi[0].label + '. ' + opsi[0].umpan.replace(/^Tepat! /, '')
    );
  } else if (s.jenis === 'bakukan') {
    opsi = opsiBakukanIlmiah(s.x);
    c.explanation = esc(
      teksIlmiah(s.x) + ' = ' + opsi[0].label + '. ' + opsi[0].umpan.replace(/^Tepat! /, '')
    );
  }
  if (opsi) {
    c.options = opsiAman(opsi);
    c.correct = 'baku';
    c.umpan = {};
    opsi.forEach(function (o) {
      if (o.id !== 'baku') c.umpan[o.id] = esc(o.umpan);
    });
    return c;
  }
  if (s.jenis === 'banding') {
    c.options = s.items.map(function (it) {
      return { id: it.id, label: esc(it.nama + ' (' + teksIlmiah(it.x) + ')') };
    });
    c.correct = ekstremIlmiah(s.items, s.cari);
    var naik = urutanIdIlmiah(s.items);
    c.explanation = esc(
      'Setelah dibakukan: ' +
        naik
          .map(function (id) {
            var it = s.items.filter(function (x) {
              return x.id === id;
            })[0];
            return teksIlmiah(bakukanIlmiah(it.x));
          })
          .join(' < ') +
        '. Bandingkan pangkat 10 lebih dulu, lalu mantisanya.'
    );
    return c;
  }
  /* urut */
  c.options = s.opsi.map(function (o) {
    return { id: o.id, label: esc(namaUrutan(s, o.urutan)) };
  });
  c.correct = s.correct;
  var benar = s.opsi.filter(function (o) {
    return o.id === s.correct;
  })[0];
  c.explanation = esc(
    'Urutannya ' +
      namaUrutan(s, benar.urutan) +
      '. Bakukan, bandingkan pangkat 10, lalu mantisa bila pangkatnya sama.'
  );
  return c;
}
var TERAP_BANK = DATA.terapkan.soal.map(soalTerap);

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Tahap 1 — orientasi */
  dugaanOrders: {},
  dugaanPilih: {},
  orientasiAlasan: '',
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',

  /* Tahap 2 — organisasi */
  peranOrder: null,
  peranPilih: null,
  pilahStates: {},
  pilahOrder: null,
  rencanaState: null,

  /* Tahap 3 — lab geser koma & baca */
  labOrder: null,
  labState: null,
  amatiOrders: {},
  amatiPilih: {},
  bacaOrders: {},
  bacaPilih: {},

  /* Tahap 4 — tulis bentuk baku */
  bakuStates: {},
  bakuOrder: null,
  tulisOrders: {},
  tulisPilih: {},

  /* Tahap 5 — bandingkan */
  simbolOrders: {},
  simbolStates: {},
  maknaOrders: {},
  maknaPilih: {},
  pitaOrder: null,
  pitaState: null,
  strategiOrders: {},
  strategiPilih: {},

  /* Tahap 6 — karya */
  mikroState: null,
  raksasaState: null,
  karyaOrders: {},
  karyaPilih: {},
  karyaPesan: '',

  /* Tahap 7 — evaluasi */
  pendapatStates: {},
  pendapatOrder: null,
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 8 — uji terap */
  terapkanPick: null,
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

/* Memastikan State[key] berupa objek biasa (peta id → nilai). */
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
  var ids = [];
  Object.keys(T.komposisi).forEach(function (k) {
    var kelompok = TERAP_BANK.filter(function (s) {
      return s.jenis === k;
    });
    shuffleArray(kelompok)
      .slice(0, T.komposisi[k])
      .forEach(function (s) {
        ids.push(s.id);
      });
  });
  return shuffleArray(ids);
}

function terapPickValid() {
  var pick = State.terapkanPick;
  if (!Array.isArray(pick) || pick.length !== DATA.terapkan.banyak) return false;
  var ada = optionIds(TERAP_BANK);
  return pick.every(function (id, i) {
    return ada.indexOf(id) !== -1 && pick.indexOf(id) === i;
  });
}

function isiTerapSoal() {
  var byId = {};
  TERAP_BANK.forEach(function (s) {
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
  /* Tahap 1 */
  var dugaanOrders = ensureMap('dugaanOrders');
  DATA.orientasi.dugaan.forEach(function (q) {
    ensureShuffledOrder(dugaanOrders, q.id, q.opsi);
  });
  ensureMap('dugaanPilih');
  ensureShuffledOrder(State, 'masalahOrder', DATA.orientasi.masalahOpsi);

  /* Tahap 2 */
  ensureShuffledOrder(State, 'peranOrder', DATA.organisasi.peran);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.organisasi.opsiPilah);
  ensureTapOrderState(State, 'rencanaState', RENCANA_ITEMS, RENCANA_JAWAB);

  /* Tahap 3 — kartu lab diacak; kartu pertama urutan acak menjadi aktif */
  var labBaru = !Array.isArray(State.labOrder);
  ensureShuffledOrder(State, 'labOrder', LAB_ITEMS);
  if (labBaru) State.labState = null;
  ensureLabGeserKomaState(State, 'labState', orderByIds(LAB_ITEMS, State.labOrder));
  ensureListOrders('amatiOrders', AMATI);
  ensureMap('amatiPilih');
  ensureListOrders('bacaOrders', BACA);
  ensureMap('bacaPilih');

  /* Tahap 4 — opsi buatan engine juga diacak */
  ensureSortStates(State, 'bakuStates', 'bakuOrder', PILAH_BAKU, DATA.selidikTulis.opsiBaku);
  ensureListOrders('tulisOrders', TULIS.concat(BAKUKAN, PANJANG));
  ensureMap('tulisPilih');

  /* Tahap 5 */
  var simbolOrders = ensureMap('simbolOrders');
  var simbolStates = ensureMap('simbolStates');
  var maknaOrders = ensureMap('maknaOrders');
  DATA.selidikBanding.pasangan.forEach(function (p) {
    ensureShuffledOrder(simbolOrders, p.id, COMPARE_SYMBOLS);
    if (!simbolStates[p.id] || typeof simbolStates[p.id] !== 'object') {
      simbolStates[p.id] = { chosen: null, wrong: 0 };
    }
    ensureShuffledOrder(maknaOrders, p.id, opsiMaknaBandingIlmiah(p.tema));
  });
  ensureMap('maknaPilih');
  ensureShuffledOrder(State, 'pitaOrder', PITA_ITEMS);
  ensurePitaOrdeState(State, 'pitaState', PITA_ITEMS);
  ensureListOrders('strategiOrders', STRATEGI);
  ensureMap('strategiPilih');

  /* Tahap 6 */
  ensureTapOrderState(State, 'mikroState', MIKRO_ITEMS, MIKRO_JAWAB);
  ensureTapOrderState(State, 'raksasaState', RAKSASA_ITEMS, RAKSASA_JAWAB);
  ensureListOrders('karyaOrders', [TANYA_KALI, TANYA_ALASAN]);
  ensureMap('karyaPilih');

  /* Tahap 7 */
  ensureSortStates(
    State,
    'pendapatStates',
    'pendapatOrder',
    PENDAPAT_ITEMS,
    DATA.evaluasi.opsiPendapat
  );
  ensureShuffledOrder(State, 'bankOrder', DATA.evaluasi.bank);
  ensureMap('simpulanPilihan');

  /* Tahap 8 — soal dipilih acak dari bank; opsi tiap soal diacak */
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

  /* Tahap 9 */
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

function buildTemuanList(items) {
  return (
    '<ul class="temuan-list">' +
    items
      .map(function (t) {
        return '<li>' + esc(t) + '</li>';
      })
      .join('') +
    '</ul>'
  );
}

function panelJudul(judul, inner, cls) {
  return buildDlPanel('<h3 style="margin-top:0;">' + esc(judul) + '</h3>' + inner, cls);
}

function panelTemuan(temuan) {
  return buildDlPanel(
    '<h3 style="margin-top:0;">💡 Temuan kelompok</h3>' + buildTemuanList(temuan),
    'panel--hero'
  );
}

function caption(teks) {
  return '<p class="dl-caption">' + esc(teks) + '</p>';
}

/* Memasang textarea yang menyimpan isinya ke State[key]. */
function bindTextarea(id, key) {
  var ta = document.getElementById(id);
  if (!ta) return;
  ta.addEventListener('input', function () {
    State[key] = ta.value;
    saveState();
  });
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
    esc(value || '') +
    '</textarea>' +
    '</div>'
  );
}

/* Pertanyaan penuntun ditampilkan satu per satu: sampai yang pertama belum benar. */
function guidedBertahap(list, orders, pilih) {
  var tampil = [];
  for (var i = 0; i < list.length; i++) {
    tampil.push(list[i]);
    if (pilih[list[i].id] !== list[i].correct) break;
  }
  return buildGuidedQuizList(tampil, orders, pilih);
}

/* Baris data catatan: ikon, nama, bilangan, satuan. */
function buildDataRow(b) {
  return (
    '<li class="data-row">' +
    '<span class="data-row__ikon" aria-hidden="true">' +
    b.ikon +
    '</span>' +
    '<span class="data-row__nama">' +
    esc(b.nama) +
    '</span>' +
    '<span class="data-row__nilai">' +
    numHTML(b.x, b.bentuk) +
    ' <span class="data-row__satuan">' +
    esc(b.satuan) +
    '</span></span>' +
    '</li>'
  );
}

function buildCatatanCard(c) {
  return (
    '<article class="catatan-card catatan-card--' +
    esc(c.id) +
    '">' +
    '<header class="catatan-card__head"><span class="catatan-card__ikon" aria-hidden="true">' +
    c.ikon +
    '</span><h3 class="catatan-card__judul">' +
    esc(c.judul) +
    '</h3></header>' +
    '<p class="catatan-card__teks">' +
    esc(c.teks) +
    '</p>' +
    '<ul class="data-list">' +
    c.benda
      .map(function (id) {
        return buildDataRow(BENDA[id]);
      })
      .join('') +
    '</ul>' +
    '</article>'
  );
}

/* ============================================================
   5. STAGE: ORIENTASI MASALAH  (PBL — sintaks 1)
   Dugaan TIDAK dinilai; pertanyaan inti dinilai dengan umpan balik.
   ============================================================ */

function dugaanLengkap() {
  return DATA.orientasi.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var lengkap = dugaanLengkap();
  var benar = State.masalahPilihan === D.masalahCorrect;
  var umpan = {};
  Object.keys(D.masalahUmpan).forEach(function (k) {
    umpan[k] = esc(D.masalahUmpan[k]);
  });

  var dugaanHTML = D.dugaan
    .map(function (q, i) {
      return (
        '<div class="quiz-item">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        teksHTML(q.tanya) +
        '</p>' +
        buildChoiceGroup(DUGAAN_OPSI[q.id], State.dugaanOrders[q.id], {
          chosen: State.dugaanPilih[q.id] || null,
          group: q.id,
          attr: 'data-dugaan',
        }) +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Orientasi Masalah">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🌌 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="catatan-grid">' +
        D.catatan.map(buildCatatanCard).join('') +
        '</div>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaan kelompokmu?</h3>' +
        caption('Dugaan tidak dinilai. Kalian akan mengujinya sendiri di tahap Evaluasi.') +
        dugaanHTML +
        '<div style="margin-top:var(--space-5);">' +
        buildTextarea(
          'orientasiAlasan',
          D.alasanLabel,
          D.alasanPlaceholder,
          State.orientasiAlasan
        ) +
        '</div>'
    ) +
    (lengkap
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🎯 Rumuskan masalahnya</h3>' +
            '<p class="exercise-label">' +
            esc(D.pertanyaan) +
            '</p>' +
            buildChoiceGroup(MASALAH_OPSI, State.masalahOrder, {
              chosen: State.masalahPilihan,
              correctId: benar ? D.masalahCorrect : null,
              grade: true,
              locked: benar,
              attr: 'data-masalah',
            }) +
            buildGuidedChoiceFeedback(State.masalahPilihan, benar, umpan) +
            (benar
              ? '<div style="margin-top:var(--space-4);">' +
                buildTextarea(
                  'masalahHipotesis',
                  D.hipotesisLabel,
                  D.hipotesisPlaceholder,
                  State.masalahHipotesis
                ) +
                '</div>'
              : '')
        )
      : '') +
    (lengkap && benar ? buildDlNextButton('orientasiNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-dugaan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.dugaanPilih[btn.dataset.group] = btn.dataset.dugaan;
      saveState();
      renderOrientasi(container);
    });
  });

  container.querySelectorAll('[data-masalah]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.masalahPilihan === D.masalahCorrect) return;
      State.masalahPilihan = btn.dataset.masalah;
      saveState();
      renderOrientasi(container);
    });
  });

  bindTextarea('orientasiAlasan', 'orientasiAlasan');
  bindTextarea('masalahHipotesis', 'masalahHipotesis');

  var nextBtn = document.getElementById('orientasiNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.masalahHipotesis.trim()) {
        showNotice('Tulis hipotesis kelompokmu lebih dulu, walau hanya satu kalimat.');
        return;
      }
      completeStage('orientasi');
      navigateTo('organisasi');
    });
  }
}

/* ============================================================
   6. STAGE: ORGANISASI  (PBL — sintaks 2)
   Pilih peran → pilah informasi → susun rencana penyelidikan.
   ============================================================ */

function renderOrganisasi(container) {
  var D = DATA.organisasi;
  var rerender = function () {
    renderOrganisasi(container);
  };
  var peranOk = !!State.peranPilih;
  var pilahOk = sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);
  var rencanaOk = State.rencanaState.correct;

  container.innerHTML =
    '<section aria-label="Mengorganisasi Belajar">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">👥 ' +
        esc(D.peranLabel) +
        '</h3>' +
        buildChoiceGroup(opsiAman(D.peran), State.peranOrder, {
          chosen: State.peranPilih,
          attr: 'data-peran',
        }) +
        (peranOk
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              'info',
              '🙌',
              'Peranmu: ' +
                esc(findOptionLabel(D.peran, State.peranPilih)) +
                ' Tukar peran pada pertemuan berikutnya.'
            ) +
            '</div>'
          : '')
    ) +
    (peranOk
      ? panelJudul(
          '🗂️ ' + D.judulPilah,
          buildSortItems(PILAH_ITEMS, State.pilahOrder, D.opsiPilah, State.pilahStates)
        )
      : '') +
    (peranOk && pilahOk
      ? panelJudul(
          '🗺️ ' + D.judulRencana,
          caption(D.instruksiRencana) +
            buildTapOrder('rencana', RENCANA_ITEMS, State.rencanaState, {
              answer: RENCANA_JAWAB,
              startLabel: 'Langkah pertama',
              endLabel: 'Langkah terakhir',
              separator: '→',
              successText:
                '<strong>Rencana tersusun!</strong> Kenali bentuk → bakukan → bandingkan → sajikan. Rencana ini akan kalian jalankan pada tiga penyelidikan berikutnya.',
              wrongText:
                'Kartu bertanda merah belum tepat. Pikirkan: apa yang harus dikerjakan sebelum data bisa dibandingkan?',
            })
        )
      : '') +
    (peranOk && pilahOk && rencanaOk ? buildDlNextButton('organisasiNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-peran]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.peranPilih = btn.dataset.peran;
      saveState();
      rerender();
    });
  });
  if (peranOk) bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  if (peranOk && pilahOk) {
    bindTapOrder(container, 'rencana', State.rencanaState, RENCANA_JAWAB, saveState, rerender);
  }
  bindNext('organisasiNextBtn', 'organisasi', 'selidikBaca');
}

/* ============================================================
   7. STAGE: PENYELIDIKAN A — LAB GESER KOMA & MEMBACA  (sintaks 3)
   Lab → pengamatan (penuntun) → membaca notasi ilmiah.
   ============================================================ */

function labItems() {
  return orderByIds(LAB_ITEMS, State.labOrder);
}

function renderSelidikBaca(container) {
  var D = DATA.selidikBaca;
  var rerender = function () {
    renderSelidikBaca(container);
  };
  var items = labItems();
  var labOk = labGeserKomaSelesai(State.labState, items);
  var amatiOk = labOk && guidedQuizAllCorrect(AMATI, State.amatiPilih);
  var bacaOk = amatiOk && guidedQuizAllCorrect(BACA, State.bacaPilih);

  container.innerHTML =
    '<section aria-label="Penyelidikan A: Lab Geser Koma">' +
    buildHead(D) +
    panelJudul(
      '🔁 ' + D.labJudul,
      caption(D.labPengantar) + buildLabGeserKoma('labKoma', items, State.labState)
    ) +
    (labOk
      ? panelJudul('🔎 ' + D.amatiJudul, guidedBertahap(AMATI, State.amatiOrders, State.amatiPilih))
      : '') +
    (amatiOk
      ? panelJudul(
          '🗣️ ' + D.bacaJudul,
          caption(D.bacaInstruksi) + guidedBertahap(BACA, State.bacaOrders, State.bacaPilih)
        )
      : '') +
    (bacaOk ? panelTemuan(D.temuan) + buildDlNextButton('bacaNextBtn', D.nextLabel) : '') +
    '</section>';

  bindLabGeserKoma(container, 'labKoma', items, State.labState, saveState, rerender);
  if (labOk) bindGuidedQuizList(container, AMATI, State.amatiPilih, saveState, rerender);
  if (amatiOk) bindGuidedQuizList(container, BACA, State.bacaPilih, saveState, rerender);
  bindNext('bacaNextBtn', 'selidikBaca', 'selidikTulis');
}

/* ============================================================
   8. STAGE: PENYELIDIKAN B — TULIS BENTUK BAKU  (sintaks 3)
   A pilah baku → B panjang → ilmiah → C bakukan → D ilmiah → panjang.
   ============================================================ */

function renderSelidikTulis(container) {
  var D = DATA.selidikTulis;
  var rerender = function () {
    renderSelidikTulis(container);
  };
  var pilih = State.tulisPilih;
  var aOk = sortItemsAllAnswered(PILAH_BAKU, State.bakuStates);
  var bOk = aOk && guidedQuizAllCorrect(TULIS, pilih);
  var cOk = bOk && guidedQuizAllCorrect(BAKUKAN, pilih);
  var dOk = cOk && guidedQuizAllCorrect(PANJANG, pilih);

  container.innerHTML =
    '<section aria-label="Penyelidikan B: Tulis Bentuk Baku">' +
    buildHead(D) +
    panelJudul(
      '🧐 ' + D.judulA,
      caption(D.instruksiA) +
        buildSortItems(PILAH_BAKU, State.bakuOrder, D.opsiBaku, State.bakuStates)
    ) +
    (aOk
      ? panelJudul(
          '✍️ ' + D.judulB,
          caption(D.instruksiB) + guidedBertahap(TULIS, State.tulisOrders, pilih)
        )
      : '') +
    (bOk
      ? panelJudul(
          '🔧 ' + D.judulC,
          caption(D.instruksiC) + guidedBertahap(BAKUKAN, State.tulisOrders, pilih)
        )
      : '') +
    (cOk
      ? panelJudul(
          '📜 ' + D.judulD,
          caption(D.instruksiD) + guidedBertahap(PANJANG, State.tulisOrders, pilih)
        )
      : '') +
    (dOk ? panelTemuan(D.temuan) + buildDlNextButton('tulisNextBtn', D.nextLabel) : '') +
    '</section>';

  bindSortItems(container, PILAH_BAKU, State.bakuStates, saveState, rerender);
  bindGuidedQuizList(container, TULIS.concat(BAKUKAN, PANJANG), pilih, saveState, rerender);
  bindNext('tulisNextBtn', 'selidikTulis', 'selidikBanding');
}

/* ============================================================
   9. STAGE: PENYELIDIKAN C — BANDINGKAN  (sintaks 3)
   A pasangan (lambang + makna) → B pita orde → C strategi.
   ============================================================ */

function pasanganById(id) {
  return DATA.selidikBanding.pasangan.filter(function (p) {
    return p.id === id;
  })[0];
}

function simbolBenar(p) {
  return State.simbolStates[p.id].chosen === simbolBandingIlmiah(p.a, p.b);
}

function maknaBenar(p) {
  return State.maknaPilih[p.id] === idMaknaBandingIlmiah(p.a, p.b);
}

function pasanganSelesai(p) {
  return simbolBenar(p) && maknaBenar(p);
}

/* Kalimat [a] ☐ [b] dengan bentuk tulisan asli (bisa bentuk panjang). */
function kalimatPasangan(p, symbolId) {
  var aria =
    tulisBilangan(p.a, p.bentukA) +
    ' ' +
    (symbolId ? KATA_SIMBOL[symbolId] : 'kotak kosong') +
    ' ' +
    tulisBilangan(p.b, p.bentukB);
  return (
    '<div class="cmp-sentence ilm-kalimat" aria-label="' +
    esc(aria) +
    '">' +
    numHTML(p.a, p.bentukA, 'ilm--big') +
    '<span class="cmp-sentence__sym' +
    (symbolId ? ' is-filled' : '') +
    '">' +
    esc(symbolId ? compareSymbolText(symbolId) : '?') +
    '</span>' +
    numHTML(p.b, p.bentukB, 'ilm--big') +
    '</div>'
  );
}

function buildPasanganCard(p, i) {
  var st = State.simbolStates[p.id];
  var okSimbol = simbolBenar(p);
  var chosenMakna = State.maknaPilih[p.id] || null;
  var okMakna = maknaBenar(p);
  var K = KATA_BANDING_PECAHAN[p.tema] || KATA_BANDING_PECAHAN.banyak;
  var maknaHTML = '';
  if (okSimbol) {
    var kalimatKosong = esc(p.kalimat).replace('___', '<span class="blank-slot">…</span>');
    var kalimatIsi = esc(p.kalimat).replace(
      '___',
      '<strong>' + esc(maknaBandingIlmiah(p.a, p.b, p.tema)) + '</strong>'
    );
    maknaHTML =
      '<div class="quiz-item quiz-item--guided">' +
      '<p class="exercise-label">Dalam cerita: ' +
      kalimatKosong +
      '</p>' +
      buildChoiceGroup(opsiMaknaBandingIlmiah(p.tema), State.maknaOrders[p.id], {
        chosen: chosenMakna,
        correctId: okMakna ? idMaknaBandingIlmiah(p.a, p.b) : null,
        grade: true,
        locked: okMakna,
        group: p.id,
        attr: 'data-makna',
      }) +
      (chosenMakna
        ? '<div style="margin-top:var(--space-3);">' +
          (okMakna
            ? buildFeedbackBox('success', '✓', kalimatIsi)
            : buildFeedbackBox(
                'warning',
                '💭',
                'Ingat: ' +
                  esc(kalimatBandingIlmiah(p.a, p.b)) +
                  '. Dalam cerita ini, bilangan yang lebih kecil berarti "<strong>' +
                  esc(K.kecil) +
                  '</strong>" dan yang lebih besar berarti "<strong>' +
                  esc(K.besar) +
                  '</strong>".'
              )) +
          '</div>'
        : '') +
      '</div>';
  }
  return (
    '<div class="banding-card' +
    (pasanganSelesai(p) ? ' is-done' : '') +
    '">' +
    '<p class="dl-step__label"><span class="dl-step__num">' +
    (i + 1) +
    '</span><span aria-hidden="true">' +
    p.ikon +
    '</span> ' +
    esc(p.namaA) +
    ' ' +
    numHTML(p.a, p.bentukA) +
    ' ' +
    esc(p.satuan) +
    ' dan ' +
    esc(p.namaB) +
    ' ' +
    numHTML(p.b, p.bentukB) +
    ' ' +
    esc(p.satuan) +
    '</p>' +
    kalimatPasangan(p, okSimbol ? st.chosen : null) +
    '<p class="dl-caption">Pilih lambang yang tepat:</p>' +
    buildPilihSimbolIlmiah(p.a, p.b, State.simbolOrders[p.id], st, { group: p.id }) +
    maknaHTML +
    '</div>'
  );
}

function renderSelidikBanding(container) {
  var D = DATA.selidikBanding;
  var rerender = function () {
    renderSelidikBanding(container);
  };

  var kartu = '';
  var aSelesai = true;
  for (var i = 0; i < D.pasangan.length; i++) {
    kartu += buildPasanganCard(D.pasangan[i], i);
    if (!pasanganSelesai(D.pasangan[i])) {
      aSelesai = false;
      break;
    }
  }
  var pitaItems = orderByIds(PITA_ITEMS, State.pitaOrder);
  var bSelesai = aSelesai && pitaOrdeSelesai(State.pitaState, PITA_ITEMS);
  var cSelesai = bSelesai && guidedQuizAllCorrect(STRATEGI, State.strategiPilih);

  container.innerHTML =
    '<section aria-label="Penyelidikan C: Bandingkan">' +
    buildHead(D) +
    panelJudul(
      '⚖️ ' + D.judulA,
      caption(D.instruksiA) + '<div class="banding-list">' + kartu + '</div>'
    ) +
    (aSelesai
      ? panelJudul(
          '🪜 ' + D.judulB,
          caption(D.instruksiB) +
            buildPitaOrde('pitaOrde', pitaItems, D.pitaRungs, State.pitaState) +
            (bSelesai
              ? buildFeedbackBox(
                  'success',
                  '✓',
                  '<strong>Semua benda sudah di anak tangganya.</strong> Dari atom (10⁻¹⁰ m) sampai butir pasir (10⁻⁴ m) ada 6 anak tangga: butir pasir sekitar 10⁶ = satu juta kali lebih besar daripada atom!'
                )
              : '')
        )
      : '') +
    (bSelesai
      ? panelJudul(
          '🧠 ' + D.judulC,
          guidedBertahap(STRATEGI, State.strategiOrders, State.strategiPilih)
        )
      : '') +
    (cSelesai ? panelTemuan(D.temuan) + buildDlNextButton('bandingNextBtn', D.nextLabel) : '') +
    '</section>';

  bindPilihSimbolIlmiah(
    container,
    function (group) {
      var p = pasanganById(group);
      return p ? [p.a, p.b] : null;
    },
    function (group) {
      return State.simbolStates[group];
    },
    saveState,
    rerender
  );

  container.querySelectorAll('[data-makna]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var p = pasanganById(btn.dataset.group);
      if (!p || maknaBenar(p)) return;
      State.maknaPilih[p.id] = btn.dataset.makna;
      saveState();
      rerender();
    });
  });

  if (aSelesai)
    bindPitaOrde(container, 'pitaOrde', PITA_ITEMS, State.pitaState, saveState, rerender);
  if (bSelesai) bindGuidedQuizList(container, STRATEGI, State.strategiPilih, saveState, rerender);
  bindNext('bandingNextBtn', 'selidikBanding', 'karya');
}

/* ============================================================
   10. STAGE: KARYA — PAPAN INFO SEMESTA MINI  (PBL — sintaks 4)
   ============================================================ */

function chipUrutan(jawab, sep) {
  return jawab
    .map(function (id) {
      var b = BENDA[id];
      return esc(b.nama) + ' ' + ilmiahHTML(bakukanIlmiah(b.x));
    })
    .join(' <span class="poster-sep">' + esc(sep) + '</span> ');
}

function buildPapanInfo() {
  var K = DATA.karya;
  var alasan = findOptionLabel(TANYA_ALASAN.opsi, TANYA_ALASAN.correct);
  var peran = State.peranPilih ? esc(findOptionLabel(DATA.organisasi.peran, State.peranPilih)) : '';
  var terkecil = BENDA[MIKRO_JAWAB[0]];
  var terbesar = BENDA[RAKSASA_JAWAB[0]];
  return buildInfoPoster({
    judul: K.posterJudul,
    ikon: '🌌',
    rows: [
      {
        ikon: '🔬',
        label: 'Dunia mikro (terkecil → terbesar)',
        nilai: chipUrutan(MIKRO_JAWAB, '<'),
      },
      {
        ikon: '🪐',
        label: 'Dunia raksasa (terbesar → terkecil)',
        nilai: chipUrutan(RAKSASA_JAWAB, '>'),
      },
      {
        ikon: '🏆',
        label: 'Rekor papan kami',
        nilai:
          'Terkecil: <strong>' +
          esc(terkecil.nama) +
          '</strong> ' +
          ilmiahHTML(bakukanIlmiah(terkecil.x)) +
          ' m<br>Terbesar: <strong>' +
          esc(terbesar.nama) +
          '</strong> ' +
          ilmiahHTML(bakukanIlmiah(terbesar.x)) +
          ' m',
      },
      {
        ikon: '📏',
        label: 'Tahukah kamu?',
        nilai: 'Jarak Bumi–Matahari kira-kira 10⁴ kali diameter Bumi.',
      },
      { ikon: '🧠', label: 'Alasan kami', nilai: alasan },
    ].concat(peran ? [{ ikon: '👥', label: 'Peranku', nilai: peran }] : []),
    pesan: State.karyaPesan.trim() || undefined,
    footer: K.posterFooter,
  });
}

function renderKarya(container) {
  var D = DATA.karya;
  var rerender = function () {
    renderKarya(container);
  };
  var s1 = State.mikroState.correct;
  var s2 = s1 && State.raksasaState.correct;
  var s3 = s2 && State.karyaPilih[TANYA_KALI.id] === TANYA_KALI.correct;
  var s4 = s3 && State.karyaPilih[TANYA_ALASAN.id] === TANYA_ALASAN.correct;

  container.innerHTML =
    '<section aria-label="Menyajikan Hasil Karya">' +
    buildHead(D) +
    panelJudul(
      '🔬 ' + D.judul1,
      buildTapOrder('urutMikro', MIKRO_ITEMS, State.mikroState, {
        answer: MIKRO_JAWAB,
        startLabel: 'Terkecil',
        endLabel: 'Terbesar',
        separator: '<',
        successText:
          '<strong>Tepat!</strong> Setelah dibakukan: ' +
          MIKRO_JAWAB.map(function (id) {
            return esc(teksIlmiah(bakukanIlmiah(BENDA[id].x)));
          }).join(' < ') +
          '.',
        wrongText:
          'Kartu bertanda merah belum tepat. Bakukan dulu, bandingkan pangkat 10 (ingat: −10 < −9), lalu mantisa bila pangkatnya sama.',
      })
    ) +
    (s1
      ? panelJudul(
          '🪐 ' + D.judul2,
          buildTapOrder('urutRaksasa', RAKSASA_ITEMS, State.raksasaState, {
            answer: RAKSASA_JAWAB,
            startLabel: 'Terbesar',
            endLabel: 'Terkecil',
            separator: '>',
            successText:
              '<strong>Tepat!</strong> Setelah dibakukan: ' +
              RAKSASA_JAWAB.map(function (id) {
                return esc(teksIlmiah(bakukanIlmiah(BENDA[id].x)));
              }).join(' > ') +
              '.',
            wrongText:
              'Kartu bertanda merah belum tepat. Hati-hati dengan 12,7 × 10⁶ dan 228 × 10⁹ — keduanya belum baku!',
          })
        )
      : '') +
    (s2
      ? panelJudul(
          '📏 ' + D.judul3,
          buildGuidedQuizList([TANYA_KALI], State.karyaOrders, State.karyaPilih)
        )
      : '') +
    (s3
      ? panelJudul(
          '🧠 ' + D.judul4,
          buildGuidedQuizList([TANYA_ALASAN], State.karyaOrders, State.karyaPilih)
        )
      : '') +
    (s4
      ? buildDlPanel(
          buildTextarea('karyaPesan', D.pesanLabel, D.pesanPlaceholder, State.karyaPesan) +
            '<div class="btn-group btn-group--end" style="margin-top:var(--space-3);">' +
            '<button type="button" class="btn btn--ghost" id="posterRefreshBtn">Perbarui Papan</button>' +
            '</div>' +
            '<div id="posterWrap">' +
            buildPapanInfo() +
            '</div>' +
            buildFeedbackBox(
              'info',
              '🎤',
              'Presentasikan papan ini di depan kelas (±2 menit). Setiap anggota menjelaskan satu baris papan sesuai perannya.'
            ),
          'panel--hero'
        ) + buildDlNextButton('karyaNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindTapOrder(container, 'urutMikro', State.mikroState, MIKRO_JAWAB, saveState, rerender);
  if (s1) {
    bindTapOrder(container, 'urutRaksasa', State.raksasaState, RAKSASA_JAWAB, saveState, rerender);
  }
  if (s2) bindGuidedQuizList(container, [TANYA_KALI], State.karyaPilih, saveState, rerender);
  if (s3) bindGuidedQuizList(container, [TANYA_ALASAN], State.karyaPilih, saveState, rerender);
  bindTextarea('karyaPesan', 'karyaPesan');
  var refresh = document.getElementById('posterRefreshBtn');
  if (refresh) {
    refresh.addEventListener('click', function () {
      document.getElementById('posterWrap').innerHTML = buildPapanInfo();
    });
  }
  var nextBtn = document.getElementById('karyaNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.karyaPesan.trim()) {
        showNotice('Tulis pesan kelompokmu untuk pengunjung pameran lebih dulu.');
        return;
      }
      completeStage('karya');
      navigateTo('evaluasi');
    });
  }
}

/* ============================================================
   11. STAGE: EVALUASI  (PBL — sintaks 5)
   A. pendapat teman → B. dugaan vs hasil → C. simpulan.
   ============================================================ */

function buildDugaanBanding() {
  var S = DATA.orientasi;
  return (
    '<div class="dugaan-compare">' +
    S.dugaan
      .map(function (q) {
        var opsi = DUGAAN_OPSI[q.id];
        var pilih = State.dugaanPilih[q.id];
        var cocok = pilih === q.baku;
        return (
          '<div class="dugaan-row' +
          (cocok ? ' dugaan-row--ok' : '') +
          '">' +
          '<span class="dugaan-row__title">' +
          teksHTML(q.tanya) +
          '</span>' +
          '<span>Dugaanmu: <strong>' +
          (findOptionLabel(opsi, pilih) || '—') +
          '</strong></span>' +
          '<span>Hasil penyelidikan: <strong>' +
          findOptionLabel(opsi, q.baku) +
          '</strong> — ' +
          esc(q.pembahasan) +
          '</span>' +
          '<span class="dugaan-row__verdict">' +
          (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh penyelidikanmu') +
          '</span>' +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    (State.masalahHipotesis
      ? '<div class="hipotesis-box">' +
        '<span class="hipotesis-box__label">Hipotesis kelompokmu di tahap 1</span>' +
        '<p>' +
        esc(State.masalahHipotesis) +
        '</p>' +
        '<span class="dl-caption">Apakah hipotesismu sesuai dengan hasil penyelidikan? Diskusikan dalam kelompok.</span>' +
        '</div>'
      : '')
  );
}

function simpulanSemuaBenar() {
  return DATA.evaluasi.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function buildSimpulan() {
  var D = DATA.evaluasi;
  var bank = orderByIds(D.bank, State.bankOrder);
  var benarSemua = simpulanSemuaBenar();
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali hasil penyelidikanmu, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');
}

function renderEvaluasi(container) {
  var D = DATA.evaluasi;
  var rerender = function () {
    renderEvaluasi(container);
  };
  var aOk = sortItemsAllAnswered(PENDAPAT_ITEMS, State.pendapatStates);
  var benarSemua = simpulanSemuaBenar();

  container.innerHTML =
    '<section aria-label="Analisis dan Evaluasi">' +
    buildHead(D) +
    panelJudul(
      '🗣️ ' + D.judulA,
      buildSortItems(PENDAPAT_ITEMS, State.pendapatOrder, D.opsiPendapat, State.pendapatStates)
    ) +
    (aOk ? panelJudul('🔁 ' + D.judulB, buildDugaanBanding()) : '') +
    (aOk
      ? panelJudul(
          '🧩 ' + D.judulC,
          caption(D.instruksiC) +
            buildSimpulan() +
            (benarSemua
              ? buildFeedbackBox(
                  'success',
                  '✓',
                  '<strong>Simpulan kelompokmu lengkap dan tepat.</strong> Inilah cara yang kalian temukan dan buktikan sendiri.'
                )
              : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
                '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Simpulan</button>' +
                '</div>')
        )
      : '') +
    (aOk && benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman: Notasi Ilmiah</h3>' +
            '<ol class="objectives-list">' +
            D.rangkuman
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
            '</ol>',
          'panel--hero'
        ) + buildDlNextButton('evaluasiNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindSortItems(container, PENDAPAT_ITEMS, State.pendapatStates, saveState, rerender);

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
      rerender();
    });
  }

  bindNext('evaluasiNextBtn', 'evaluasi', 'terapkan');
}

/* ============================================================
   12. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal TERAP_SOAL yang
   dipilih acak. Soal isian meminta pangkat n (bilangan bulat, boleh
   negatif).
   ============================================================ */

var TAG_JENIS = {
  baca: '🗣️ Membaca',
  tulis: '✍️ Menuliskan',
  bakukan: '🔧 Membakukan',
  banding: '⚖️ Membandingkan',
  urut: '📶 Mengurutkan',
};

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
  defaultType: 'choice',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  inputRowClass: 'dl-input-row',
  allowNegative: true,
  inputAriaLabel: 'Pangkat n',
  inputPlaceholder: 'mis. 5 atau −3',
  invalidMessage: 'Tulis pangkatnya berupa bilangan bulat, mis. 8 atau −4.',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  checkValue: function (s) {
    return s.jawab;
  },
  inputErrorHTML: function (s, ex) {
    var v = parseInputInt(ex.userInput).value;
    var pesan =
      v === -s.jawab
        ? 'Tandanya terbalik. Bilangan besar → pangkat positif; bilangan di antara 0 dan 1 → pangkat negatif.'
        : 'Hitung lagi banyak geseran koma (bukan banyak angka nol).';
    return '<strong>' + esc(ex.userInput) + '</strong> belum tepat. ' + pesan;
  },
  revealText: function (s) {
    return s.explanation;
  },
  buildChoiceFeedback: function (s, ex) {
    if (ex.correct)
      return buildFeedbackBox('success', '✓', '<strong>Benar!</strong> ' + s.explanation);
    var umpan = s.umpan && s.umpan[ex.chosen] ? s.umpan[ex.chosen] + ' ' : '';
    return buildFeedbackBox('error', '✗', '<strong>Belum tepat.</strong> ' + umpan + s.explanation);
  },
  renderPrompt: function (s) {
    return (
      '<div class="dl-prompt">' +
      '<span class="bbk-soal-tag">' +
      esc(TAG_JENIS[s.jenis] || '') +
      (s.type === 'input' ? ' · isian' : '') +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      teksHTML(s.cerita) +
      '</p>' +
      '<p class="dl-prompt__tanya">' +
      teksHTML(s.pertanyaan) +
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

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var P = DATA.selidikBanding.pasangan;
  var simbolSekali = P.filter(function (p) {
    return simbolBenar(p) && !State.simbolStates[p.id].wrong;
  }).length;
  var pitaSekali = pitaOrdeSekaliTepat(State.pitaState, PITA_ITEMS);
  var tulisList = TULIS.concat(BAKUKAN, PANJANG);
  var tulisBenar = tulisList.filter(function (q) {
    return State.tulisPilih[q.id] === q.correct;
  }).length;
  var benarTerap = State.terapkanExercises.filter(function (e) {
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
        kartu(tulisBenar + '/' + tulisList.length, 'Kartu menulis & membakukan tuntas') +
        kartu(simbolSekali + '/' + P.length, 'Lambang perbandingan tepat sekali pilih') +
        kartu(pitaSekali + '/' + PITA_ITEMS.length, 'Pita orde tepat sekali ketuk') +
        kartu(benarTerap + '/' + TERAP_SOAL.length, 'Uji terap benar') +
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
    '<div class="contoh-grid">' +
    D.contoh
      .map(function (c) {
        return (
          '<div class="formula-card"><span class="formula-card__label"><span aria-hidden="true">' +
          c.ikon +
          '</span> ' +
          esc(c.nama) +
          '</span>' +
          buildKalimatBandingIlmiah(c.a, c.b, simbolBandingIlmiah(c.a, c.b)) +
          '</div>'
        );
      })
      .join('') +
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
    'Presentasi Papan Info Semesta Mini dan penjelasan lisan murid tentang cara membaca, membakukan, dan membandingkan notasi ilmiah tetap menjadi bahan penilaian utama.' +
    '</div></div>' +
    '<div class="btn-group btn-group--center">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '<button type="button" class="btn btn--outline-primary" id="reviewBtn">Tinjau Ulang</button>' +
    '</div>' +
    '</div>' +
    '</section>';

  completeStage('selesai');

  document.getElementById('reviewBtn').addEventListener('click', function () {
    navigateTo('orientasi');
  });
}

/* ============================================================
   15. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  organisasi: renderOrganisasi,
  selidikBaca: renderSelidikBaca,
  selidikTulis: renderSelidikTulis,
  selidikBanding: renderSelidikBanding,
  karya: renderKarya,
  evaluasi: renderEvaluasi,
  terapkan: renderTerapkan,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  var fn = RENDERERS[State.currentStage] || RENDERERS.orientasi;
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
  if (STAGES.indexOf(State.currentStage) === -1) State.currentStage = 'orientasi';
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
      navigateTo('orientasi');
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
