'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Proyek Mini Barisan & Deret Aritmetika
   Fase F — SMK Rekayasa Perangkat Lunak, Project Based Learning

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen umum: buildDiscoveryHead, buildTeacherNote,
       buildChoiceGroup, buildSortItems, buildGuidedQuizList,
       buildDlPanel, buildDlNextButton, buildDlStep, buildInfoPoster;
     • seksi 14 (urut-ketuk): ensureTapOrderState, buildTapOrder;
     • seksi 21–22: sukuAritmetika, jumlahAritmetika, subskrip,
       formatRupiah, parseInputAngka;
     • seksi 40 (rumus Uₙ): buildRumusSukuInput, fmtRumusSuku;
     • seksi 42 (jumlah deret): fmtAngkaDeret, nMinimalJumlahMencapai,
       diagnosaJumlahDeret, opsiJumlahDeret, buildJumlahDeretStep;
     • seksi 43 (proyek mini): hitungBriefDeret, opsiSukuDeret,
       opsiNMinimal, buildProjectBoard, kolomKanban, buildPlannerLab,
       buildTestRunner, jalankanKasusUji.

   Alur tahap mengikuti sintaks Project Based Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (kartu brief, pemanasan,
   pertanyaan mendasar, pemilahan pertanyaan klien, pilihan brief, peran,
   fitur ↔ strategi, milestone, pertanyaan jadwal, checkpoint model, kode
   kapanTercapai, pertanyaan uji kasus, klaim sejawat, rubrik, soal & opsi
   uji terap, penilaian diri) DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder() / ensureSortStates() / ensureTapOrderState().
   Pengacakan dilakukan SEKALI saat state disiapkan (initExerciseArrays)
   lalu urutannya disimpan di State — bukan saat render — sehingga pilihan
   tidak melompat saat dirender ulang, tetapi teracak ulang untuk setiap
   murid dan setiap Reset.

   Bagian:
    1. Konstanta & data turunan
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Pertanyaan Mendasar      (PjBL sintaks 1)
    6. Stage: Rencana Proyek           (PjBL sintaks 2)
    7. Stage: Jadwal                   (PjBL sintaks 3)
    8. Stage: M1 Model                 (PjBL sintaks 4)
    9. Stage: M2 Prototipe             (PjBL sintaks 4)
   10. Stage: M3 Uji Kasus             (PjBL sintaks 4)
   11. Stage: Pameran                  (PjBL sintaks 5)
   12. Stage: Uji Terap
   13. Stage: Refleksi                 (PjBL sintaks 6)
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
var STORAGE_KEY = 'mpi-f-1-4-proyek-deret-pjbl-v1';

var BRIEF_BY_ID = {};
DATA.brief.forEach(function (br) {
  BRIEF_BY_ID[br.id] = br;
});

/* Kunci setiap brief dihitung engine (bukan disalin dari data). */
var KUNCI = {};
DATA.brief.forEach(function (br) {
  KUNCI[br.id] = hitungBriefDeret(br);
});

/* Nilai bersatuan untuk sebuah brief: 'Rp135.000', '690 MB', '76 kursi'. */
function fmtB(br, v) {
  return br.rupiah ? formatRupiah(v) : fmtAngkaDeret(v) + ' ' + br.satuan;
}

function lblU(n) {
  return 'U' + subskrip(n);
}

function lblS(n) {
  return 'S' + subskrip(n);
}

/* Pertanyaan penuntun dari DATA: tanya (HTML tepercaya) + label & umpan di-escape. */
function siapkanGuided(q) {
  var umpan = {};
  Object.keys(q.umpan).forEach(function (k) {
    umpan[k] = esc(q.umpan[k]);
  });
  return {
    id: q.id,
    tanya: q.tanya,
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

/* Butir pemilahan dengan teks & penjelasan aman. */
function butirPilah(p) {
  return { id: p.id, teks: esc(p.teks), correct: p.correct, explanation: esc(p.explanation) };
}

/* Tahap 1 */
var TANYA_PEMANASAN = DATA.pertanyaan.pemanasan.map(siapkanGuided);
var TANYA_INTI = siapkanGuided(DATA.pertanyaan.inti);
var PILAH_ITEMS = DATA.pertanyaan.pilah.map(butirPilah);

/* Tahap 2 */
var BRIEF_OPSI = DATA.brief.map(function (br) {
  return {
    id: br.id,
    label: '<span aria-hidden="true">' + br.ikon + '</span> ' + esc(br.judul + ' — ' + br.klien),
  };
});
var FITUR_ITEMS = DATA.rencana.fitur.map(butirPilah);

/* Tahap 3 */
var JADWAL_ITEMS = DATA.jadwal.urutan.map(function (r) {
  return { id: r.id, label: esc(r.label), aria: r.label };
});
var JADWAL_JAWAB = optionIds(DATA.jadwal.urutan);
var TANYA_JADWAL = DATA.jadwal.tanya.map(siapkanGuided);

/* Tahap 4 */
var TANYA_MODEL = DATA.modelMat.tanya.map(siapkanGuided);

/* Tahap 5 — opsi kode ditampilkan sebagai <code>. */
var TANYA_KODE = (function () {
  var q = siapkanGuided(DATA.prototipe.tanyaKode);
  q.opsi = DATA.prototipe.tanyaKode.opsi.map(function (o) {
    return { id: o.id, label: '<code class="kode-opsi">' + esc(o.label) + '</code>' };
  });
  return q;
})();

/* Tahap 6 */
var UJI = DATA.ujiKasus;
var TANYA_UJI = UJI.tanya.map(siapkanGuided);

/* Tahap 7 */
var SEJAWAT_ITEMS = DATA.pameran.sejawat.map(butirPilah);
var RUBRIK = DATA.pameran.rubrik.map(function (r) {
  return { id: r.id, kriteria: r.kriteria, opsi: opsiAman(r.opsi) };
});

/*
 * Bank soal uji terap dengan label opsi aman. Soal bertanda `gen`
 * dibangkitkan opsinya dari engine: kunci + tiga pengecoh miskonsepsi.
 */
function opsiGen(g) {
  var opts = { satuan: g.satuan, maks: 4 };
  if (g.rupiah) opts.format = formatRupiah;
  if (g.awalan) {
    opts.format = function (v) {
      return g.awalan + fmtAngkaDeret(v);
    };
  }
  var opsi;
  if (g.tipe === 'suku') opsi = opsiSukuDeret(g.a, g.b, g.n, opts);
  else if (g.tipe === 'nMin') opsi = opsiNMinimal(g.a, g.b, g.target, opts);
  else {
    opsi = opsiJumlahDeret(g.a, g.b, g.n, opts).map(function (o) {
      return g.rupiah ? { id: o.id, nilai: o.nilai, label: formatRupiah(o.nilai) } : o;
    });
  }
  return opsi.map(function (o) {
    return { id: o.id, label: esc(o.label) };
  });
}

var TERAP_BANK = DATA.terapkan.soal.map(function (s) {
  var c = {};
  Object.keys(s).forEach(function (k) {
    c[k] = s[k];
  });
  if (s.gen) {
    c.options = opsiGen(s.gen);
    c.correct = 'benar';
  } else if (s.options) {
    c.options = opsiAman(s.options);
  }
  return c;
});

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'pertanyaan',
  completedStages: {},

  /* Tahap 1 — pertanyaan mendasar */
  briefOrder: null,
  pemanasanOrders: {},
  pemanasanPilih: {},
  intiOrders: {},
  intiPilih: {},
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 2 — rencana */
  briefPilihOrder: null,
  briefPilih: null,
  briefState: null,
  peranOrder: null,
  peranPilih: null,
  petaSteps: {},
  fiturStates: {},
  fiturOrder: null,

  /* Tahap 3 — jadwal */
  jadwalState: null,
  jadwalOrders: {},
  jadwalPilih: {},
  jadwalCatatan: '',

  /* Tahap 4 — M1 model */
  rumusState: null,
  sukuStep: null,
  jumlahStep: null,
  modelOrders: {},
  modelPilih: {},

  /* Tahap 5 — M2 prototipe */
  lab: null,
  targetStep: null,
  labLanjut: null,
  lanjutStep: null,
  protoOrders: {},
  protoPilih: {},

  /* Tahap 6 — M3 uji kasus */
  harapanSteps: {},
  runner: null,
  ujiOrders: {},
  ujiPilih: {},

  /* Tahap 7 — pameran */
  pameranPesan: '',
  sejawatStates: {},
  sejawatOrder: null,
  rubrikOrders: {},
  rubrikPilih: {},

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

function stepValid(st) {
  return st && typeof st === 'object' && typeof st.done === 'boolean';
}

/* Brief pilihan kelompok, atau null bila belum memilih. */
function briefAktif() {
  return BRIEF_BY_ID[State.briefPilih] || null;
}

/* ---------- Data langkah per brief ---------- */

function kunciAktif() {
  var br = briefAktif();
  return br ? KUNCI[br.id] : null;
}

var PETA_UNSUR = [
  { id: 'a', simbol: 'a' },
  { id: 'b', simbol: 'b' },
  { id: 'n', simbol: 'n' },
  { id: 'target', simbol: 'target' },
];

function langkahPeta(br, u) {
  var nilai = { a: br.a, b: br.b, n: br.nJumlah, target: br.target }[u.id];
  return {
    label: '<strong>' + esc(u.simbol) + '</strong> = ' + esc(br.makna[u.id]),
    jawab: nilai,
    hints: [
      esc(
        u.id === 'n'
          ? 'Lihat pertanyaan klien: "' + br.tanya.jumlah + '"'
          : 'Baca lagi pesan klien: cari ' + br.makna[u.id] + '.'
      ),
    ],
    temuan: esc(u.simbol + ' = ' + (u.id === 'n' ? String(nilai) : fmtB(br, nilai))),
  };
}

function langkahSuku(br) {
  var k = KUNCI[br.id];
  return {
    label: esc(br.tanya.suku),
    jawab: k.un,
    hints: [
      esc(
        'Pakai Uₙ = a + (n − 1)b dengan a = ' +
          fmtAngkaDeret(br.a) +
          ', b = ' +
          fmtAngkaDeret(br.b) +
          ', n = ' +
          br.nSuku +
          '.'
      ),
      esc(
        lblU(br.nSuku) +
          ' = ' +
          fmtAngkaDeret(br.a) +
          ' + ' +
          (br.nSuku - 1) +
          ' × ' +
          fmtAngkaDeret(br.b) +
          '.'
      ),
    ],
    temuan: esc(lblU(br.nSuku) + ' = ' + fmtB(br, k.un) + '.'),
  };
}

function langkahJumlah(br) {
  var k = KUNCI[br.id];
  return {
    label: esc(br.tanya.jumlah),
    a: br.a,
    b: br.b,
    n: br.nJumlah,
    hints: [
      'Kamu sudah punya ' +
        lblU(br.nJumlah) +
        ' = ' +
        fmtAngkaDeret(sukuAritmetika(br.a, br.b, br.nJumlah)) +
        '. Pakai Sₙ = n/2 (a + Uₙ).',
      lblS(br.nJumlah) +
        ' = ' +
        br.nJumlah +
        '/2 × (' +
        fmtAngkaDeret(br.a) +
        ' + ' +
        fmtAngkaDeret(sukuAritmetika(br.a, br.b, br.nJumlah)) +
        ').',
    ],
    temuan: lblS(br.nJumlah) + ' = ' + fmtB(br, k.sn) + ' — jawaban fitur "total" untuk klien.',
    satuan: br.rupiah ? 'rupiah' : br.satuan,
  };
}

function langkahTarget(br) {
  var k = KUNCI[br.id];
  var n = k.nTarget;
  return {
    label: esc(br.tanya.target) + ' <span class="dl-caption">(tulis nilai n saja)</span>',
    jawab: n,
    hints: [
      esc(
        'Geser n di lab sampai status berubah menjadi ✓. Nilai n PERTAMA yang ✓ adalah jawabannya.'
      ),
      esc(
        'Periksa: ' + lblS(n - 1) + ' masih di bawah target, sedangkan ' + lblS(n) + ' ≥ target?'
      ),
    ],
    temuan: esc(
      lblS(n - 1) +
        ' = ' +
        fmtB(br, jumlahAritmetika(br.a, br.b, n - 1)) +
        ' < ' +
        fmtB(br, br.target) +
        ' ≤ ' +
        lblS(n) +
        ' = ' +
        fmtB(br, jumlahAritmetika(br.a, br.b, n)) +
        ', jadi target tercapai pada ' +
        br.periode +
        ' ke-' +
        n +
        '.'
    ),
  };
}

function langkahLanjut(br) {
  var k = KUNCI[br.id];
  var lj = br.lanjutan;
  var v = k.lanjutan;
  var n = lj.n;
  var hints;
  var temuan;
  if (lj.jenis === 'sukuMin') {
    hints = [
      'n dikunci = ' + n + ' dan b = ' + fmtAngkaDeret(br.b) + '. Geser a sampai Sₙ ≥ target.',
      'Aljabar: ' +
        n +
        '/2 × (2a + ' +
        (n - 1) +
        ' × ' +
        fmtAngkaDeret(br.b) +
        ') ≥ ' +
        fmtAngkaDeret(lj.target) +
        '.',
    ];
    temuan =
      'a = ' +
      fmtAngkaDeret(v) +
      ': ' +
      lblS(n) +
      ' = ' +
      fmtB(br, jumlahAritmetika(v, br.b, n)) +
      ' ≥ target, sedangkan a = ' +
      fmtAngkaDeret(v - lj.langkah) +
      ' hanya ' +
      fmtB(br, jumlahAritmetika(v - lj.langkah, br.b, n)) +
      '.';
  } else if (lj.jenis === 'bedaMaks') {
    hints = [
      'n dikunci = ' +
        n +
        ' dan a = ' +
        fmtAngkaDeret(br.a) +
        '. Geser b sebesar mungkin selama status masih ✓.',
      'Aljabar: ' +
        n +
        '/2 × (2 × ' +
        fmtAngkaDeret(br.a) +
        ' + ' +
        (n - 1) +
        'b) ≤ ' +
        fmtAngkaDeret(lj.target) +
        '.',
    ];
    temuan =
      'b = ' +
      fmtAngkaDeret(v) +
      ': ' +
      lblS(n) +
      ' = ' +
      fmtB(br, jumlahAritmetika(br.a, v, n)) +
      ' ≤ batas, sedangkan b = ' +
      fmtAngkaDeret(v + lj.langkah) +
      ' membuat ' +
      lblS(n) +
      ' = ' +
      fmtB(br, jumlahAritmetika(br.a, v + lj.langkah, n)) +
      '.';
  } else {
    hints = [
      'n dikunci = ' + n + ' dan a = ' + fmtAngkaDeret(br.a) + '. Geser b sampai Sₙ ≥ target.',
      'Aljabar: ' +
        n +
        '/2 × (2 × ' +
        fmtAngkaDeret(br.a) +
        ' + ' +
        (n - 1) +
        'b) ≥ ' +
        fmtAngkaDeret(lj.target) +
        ', lalu bulatkan ke atas.',
    ];
    temuan =
      'b = ' +
      fmtB(br, v) +
      ': ' +
      lblS(n) +
      ' = ' +
      fmtB(br, jumlahAritmetika(br.a, v, n)) +
      ' ≥ target, sedangkan b = ' +
      fmtB(br, v - lj.langkah) +
      ' hanya ' +
      fmtB(br, jumlahAritmetika(br.a, v - lj.langkah, n)) +
      '.';
  }
  return {
    label: esc(br.tanya.lanjutan),
    jawab: v,
    hints: hints.map(esc),
    temuan: esc(temuan),
  };
}

function labCfg(br) {
  return {
    a: br.lab.a,
    b: br.lab.b,
    n: br.lab.n,
    target: br.target,
    label: br.label,
    format: function (v) {
      return fmtB(br, v);
    },
  };
}

function labLanjutCfg(br) {
  var lj = br.lanjutan;
  var cfg = labCfg(br);
  cfg.target = lj.target;
  cfg.batasAtas = lj.jenis === 'bedaMaks';
  cfg.kunci = lj.ubah === 'a' ? ['b', 'n'] : ['a', 'n'];
  cfg.n = { min: lj.n, max: lj.n, step: 1 };
  return cfg;
}

/* Kasus uji: kasus brief (dari M1) + kasus tetap DATA. */
function kasusUji() {
  var br = briefAktif();
  var brief = br ? [{ id: 'k0', a: br.a, b: br.b, n: br.nJumlah }] : [];
  return brief.concat(UJI.kasus);
}

function langkahHarapan(k, i) {
  return {
    label:
      'Kasus ' +
      (i + 2) +
      ': <code>jumlahDeret(' +
      esc(String(k.a)) +
      ', ' +
      esc(String(k.b)) +
      ', ' +
      k.n +
      ')</code> seharusnya menghasilkan …',
    jawab: harapanKasus(k),
    allowNegative: true,
    hints: k.hints.map(esc),
    temuan: esc('Harapan: ' + fmtAngkaDeret(harapanKasus(k)) + '.'),
  };
}

/* Menyiapkan (ulang) seluruh state yang bergantung pada brief. */
function resetBriefStates() {
  var br = briefAktif();
  State.briefState = br ? br.id : null;
  State.petaSteps = {};
  PETA_UNSUR.forEach(function (u) {
    State.petaSteps[u.id] = makeDlStep();
  });
  State.rumusState = makeRumusState();
  State.sukuStep = makeDlStep();
  State.jumlahStep = makeJumlahDeretStep();
  State.lab = br ? makePlannerLabState({ a: br.a, b: br.b, n: 1 }) : null;
  State.targetStep = makeDlStep();
  State.labLanjut = br ? makePlannerLabState({ a: br.a, b: br.b, n: br.lanjutan.n }) : null;
  State.lanjutStep = makeDlStep();
}

function briefStatesValid() {
  var br = briefAktif();
  if (State.briefState !== (br ? br.id : null)) return false;
  var peta = State.petaSteps;
  var petaOk =
    peta &&
    PETA_UNSUR.every(function (u) {
      return stepValid(peta[u.id]);
    });
  return (
    petaOk &&
    State.rumusState &&
    typeof State.rumusState.koef === 'string' &&
    stepValid(State.sukuStep) &&
    stepValid(State.jumlahStep) &&
    stepValid(State.targetStep) &&
    stepValid(State.lanjutStep) &&
    (!br || (State.lab && State.labLanjut))
  );
}

/*
 * Soal uji terap yang sedang dipakai. Array ini DIISI ULANG di tempat
 * (bukan diganti) karena createExerciseStage menyimpan referensinya.
 */
var TERAP_SOAL = [];

function jenisSoal(s) {
  return s.type === 'choice' ? 'choice' : s.mode;
}

/* Memilih soal acak dari bank sesuai komposisi, lalu mengacak urutannya. */
function pilihSoalTerap() {
  var T = DATA.terapkan;
  var ids = [];
  Object.keys(T.komposisi).forEach(function (k) {
    var kelompok = TERAP_BANK.filter(function (s) {
      return jenisSoal(s) === k;
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
  ensureShuffledOrder(State, 'briefOrder', DATA.brief);
  ensureListOrders('pemanasanOrders', TANYA_PEMANASAN);
  ensureMap('pemanasanPilih');
  ensureListOrders('intiOrders', [TANYA_INTI]);
  ensureMap('intiPilih');
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.pertanyaan.opsiPilah);

  /* Tahap 2 */
  ensureShuffledOrder(State, 'briefPilihOrder', DATA.brief);
  if (State.briefPilih && !BRIEF_BY_ID[State.briefPilih]) State.briefPilih = null;
  ensureShuffledOrder(State, 'peranOrder', DATA.rencana.peran);
  ensureSortStates(State, 'fiturStates', 'fiturOrder', FITUR_ITEMS, DATA.rencana.opsiFitur);
  if (!briefStatesValid()) resetBriefStates();

  /* Tahap 3 */
  ensureTapOrderState(State, 'jadwalState', JADWAL_ITEMS, JADWAL_JAWAB);
  ensureListOrders('jadwalOrders', TANYA_JADWAL);
  ensureMap('jadwalPilih');

  /* Tahap 4 */
  ensureListOrders('modelOrders', TANYA_MODEL);
  ensureMap('modelPilih');

  /* Tahap 5 */
  ensureListOrders('protoOrders', [TANYA_KODE]);
  ensureMap('protoPilih');

  /* Tahap 6 */
  var hs = ensureMap('harapanSteps');
  UJI.kasus.forEach(function (k) {
    if (!stepValid(hs[k.id])) hs[k.id] = makeDlStep();
  });
  if (!State.runner || typeof State.runner !== 'object') State.runner = { dijalankan: {}, kali: 0 };
  if (!State.runner.dijalankan || typeof State.runner.dijalankan !== 'object') {
    State.runner.dijalankan = {};
  }
  ensureListOrders('ujiOrders', TANYA_UJI);
  ensureMap('ujiPilih');

  /* Tahap 7 */
  ensureSortStates(State, 'sejawatStates', 'sejawatOrder', SEJAWAT_ITEMS, DATA.pameran.opsiSejawat);
  ensureListOrders('rubrikOrders', RUBRIK);
  ensureMap('rubrikPilih');

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

/* Memasang tombol lanjut yang menyelesaikan tahap ini lalu pindah tahap. */
function bindNext(id, stageId, nextStageId) {
  var btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', function () {
    completeStage(stageId);
    navigateTo(nextStageId);
  });
}

function buildTemuanPanel(items) {
  return buildDlPanel(
    '<h3 style="margin-top:0;">💡 Temuan tim</h3>' +
      '<ul class="temuan-list">' +
      items
        .map(function (t) {
          return '<li>' + esc(t) + '</li>';
        })
        .join('') +
      '</ul>',
    'panel--hero'
  );
}

function panelJudul(judul, inner, cls) {
  return buildDlPanel('<h3 style="margin-top:0;">' + esc(judul) + '</h3>' + inner, cls);
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

/*
 * Merender ulang tahap sambil menjaga fokus keyboard (mis. tombol yang
 * baru diketuk) agar murid tidak kehilangan posisinya.
 */
function renderJagaFokus(fn) {
  var aktif = document.activeElement;
  var id = aktif && aktif.id;
  fn();
  if (id) {
    var el = document.getElementById(id);
    if (el) el.focus();
  }
}

/* Kartu brief klien (pesan + pertanyaan klien). */
function buildBriefCard(br, opts) {
  opts = opts || {};
  return (
    '<article class="brief-card' +
    (opts.aktif ? ' brief-card--aktif' : '') +
    '">' +
    '<header class="brief-card__head">' +
    '<span class="brief-card__ikon" aria-hidden="true">' +
    br.ikon +
    '</span>' +
    '<div><h3 class="brief-card__judul">' +
    esc(br.judul) +
    '</h3><span class="brief-card__klien">Klien: ' +
    esc(br.klien) +
    '</span></div>' +
    '</header>' +
    '<p class="brief-card__pesan">' +
    esc(br.pesan) +
    '</p>' +
    (opts.ringkas
      ? ''
      : '<ol class="brief-card__tanya">' +
        ['suku', 'jumlah', 'target', 'lanjutan']
          .map(function (k) {
            return '<li>' + esc(br.tanya[k]) + '</li>';
          })
          .join('') +
        '</ol>') +
    '</article>'
  );
}

/* Papan kanban dengan milestone `aktif` sedang dikerjakan. */
function buildBoard(aktif) {
  return buildDlPanel(
    '<h3 style="margin-top:0;">📌 Papan proyek</h3>' +
      buildProjectBoard(DATA.milestone, kolomKanban(DATA.milestone, State.completedStages, aktif)),
    'panel--compact'
  );
}

/* Ringkasan brief aktif di kepala setiap milestone. */
function buildBriefStrip(br) {
  return (
    '<div class="brief-strip">' +
    '<span class="brief-strip__ikon" aria-hidden="true">' +
    br.ikon +
    '</span>' +
    '<span><strong>' +
    esc(br.judul) +
    '</strong> · a = ' +
    esc(fmtB(br, br.a)) +
    ', b = ' +
    esc(fmtB(br, br.b)) +
    ', target = ' +
    esc(fmtB(br, br.target)) +
    '</span>' +
    '</div>'
  );
}

/* Tampilan bila tahap milestone dibuka tanpa brief (mis. state lama). */
function renderTanpaBrief(container) {
  container.innerHTML =
    '<section aria-label="Brief belum dipilih">' +
    buildDlPanel(
      buildFeedbackBox(
        'warning',
        '📋',
        '<strong>Brief belum dipilih.</strong> Pilih brief kelompokmu di tahap Rencana lebih dulu.'
      ) +
        '<div class="btn-group" style="margin-top:var(--space-3);">' +
        '<button type="button" class="btn btn--primary" id="keRencanaBtn">Ke tahap Rencana</button>' +
        '</div>'
    ) +
    '</section>';
  document.getElementById('keRencanaBtn').addEventListener('click', function () {
    delete State.completedStages.rencana;
    navigateTo('rencana');
  });
}

/* ============================================================
   5. STAGE: PERTANYAAN MENDASAR  (PjBL — sintaks 1)
   Pesan pembina → kartu brief → pemanasan → pertanyaan mendasar →
   pilah pertanyaan klien.
   ============================================================ */

function renderPertanyaan(container) {
  var D = DATA.pertanyaan;
  var rerender = function () {
    renderJagaFokus(function () {
      renderPertanyaan(container);
    });
  };
  var pemanasanOk = guidedQuizAllCorrect(TANYA_PEMANASAN, State.pemanasanPilih);
  var intiOk = pemanasanOk && State.intiPilih[TANYA_INTI.id] === TANYA_INTI.correct;
  var pilahOk = intiOk && sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);

  container.innerHTML =
    '<section aria-label="Pertanyaan Mendasar">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🖼️ ' +
        esc(D.judul) +
        '</h2>' +
        '<div class="klien-chat">' +
        '<span class="klien-chat__avatar" aria-hidden="true">👩‍🏫</span>' +
        '<p class="klien-chat__bubble">' +
        esc(D.pesan) +
        '</p>' +
        '</div>',
      'panel--hero'
    ) +
    panelJudul(
      '📋 ' + D.judulBrief,
      '<div class="brief-grid">' +
        orderByIds(DATA.brief, State.briefOrder)
          .map(function (br) {
            return buildBriefCard(br);
          })
          .join('') +
        '</div>'
    ) +
    panelJudul(
      '🔁 ' + D.judulPemanasan,
      buildGuidedQuizList(TANYA_PEMANASAN, State.pemanasanOrders, State.pemanasanPilih)
    ) +
    (pemanasanOk
      ? panelJudul(
          '❓ ' + D.judulInti,
          buildGuidedQuizList([TANYA_INTI], State.intiOrders, State.intiPilih) +
            (intiOk
              ? '<div class="pertanyaan-mendasar"><span class="pertanyaan-mendasar__label">Pertanyaan mendasar proyek</span><p>' +
                esc(D.pertanyaanMendasar) +
                '</p></div>'
              : '')
        )
      : '') +
    (intiOk
      ? panelJudul(
          '🗂️ ' + D.judulPilah,
          caption(D.instruksiPilah) +
            buildSortItems(PILAH_ITEMS, State.pilahOrder, D.opsiPilah, State.pilahStates)
        )
      : '') +
    (pilahOk ? buildDlNextButton('pertanyaanNextBtn', D.nextLabel) : '') +
    '</section>';

  bindGuidedQuizList(container, TANYA_PEMANASAN, State.pemanasanPilih, saveState, rerender);
  if (pemanasanOk) {
    bindGuidedQuizList(container, [TANYA_INTI], State.intiPilih, saveState, rerender);
  }
  if (intiOk) bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  bindNext('pertanyaanNextBtn', 'pertanyaan', 'rencana');
}

/* ============================================================
   6. STAGE: RENCANA PROYEK  (PjBL — sintaks 2)
   Pilih brief → peran → petakan a, b, n, target → fitur ↔ strategi.
   ============================================================ */

function petaSelesai() {
  return PETA_UNSUR.every(function (u) {
    return State.petaSteps[u.id].done;
  });
}

function renderRencana(container) {
  var D = DATA.rencana;
  var rerender = function () {
    renderJagaFokus(function () {
      renderRencana(container);
    });
  };
  var br = briefAktif();
  var terkunci = !!State.completedStages.rencana;
  var peranOk = !!br && !!State.peranPilih;

  var petaHTML = '';
  var petaAktif = [];
  if (peranOk) {
    for (var i = 0; i < PETA_UNSUR.length; i++) {
      var u = PETA_UNSUR[i];
      petaHTML += buildDlStep('peta-' + u.id, State.petaSteps[u.id], langkahPeta(br, u), i + 1);
      petaAktif.push(u);
      if (!State.petaSteps[u.id].done) break;
    }
  }
  var petaOk = peranOk && petaSelesai();
  var fiturOk = petaOk && sortItemsAllAnswered(FITUR_ITEMS, State.fiturStates);

  container.innerHTML =
    '<section aria-label="Desain Perencanaan Proyek">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">📋 ' +
        esc(D.briefLabel) +
        '</h3>' +
        (terkunci
          ? caption('Brief terkunci karena tahap Rencana sudah selesai.')
          : caption('Brief masih bisa diganti selama tahap ini belum selesai.')) +
        buildChoiceGroup(BRIEF_OPSI, State.briefPilihOrder, {
          chosen: State.briefPilih,
          locked: terkunci,
          attr: 'data-brief',
        }) +
        (br
          ? '<div style="margin-top:var(--space-4);">' +
            buildBriefCard(br, { aktif: true }) +
            '</div>'
          : '')
    ) +
    (br
      ? panelJudul(
          '👥 ' + D.peranLabel,
          buildChoiceGroup(opsiAman(D.peran), State.peranOrder, {
            chosen: State.peranPilih,
            attr: 'data-peran',
          }) +
            (State.peranPilih
              ? '<div style="margin-top:var(--space-3);">' +
                buildFeedbackBox(
                  'info',
                  '🙌',
                  'Peranmu: ' +
                    esc(findOptionLabel(D.peran, State.peranPilih)) +
                    '. Semua anggota tetap ikut menghitung.'
                ) +
                '</div>'
              : '')
        )
      : '') +
    (peranOk
      ? panelJudul(
          '🧭 ' + D.petaJudul,
          caption(D.petaInstruksi) + '<div class="peta-langkah">' + petaHTML + '</div>'
        )
      : '') +
    (petaOk
      ? panelJudul(
          '🧩 ' + D.judulFitur,
          caption(D.instruksiFitur) +
            buildSortItems(FITUR_ITEMS, State.fiturOrder, D.opsiFitur, State.fiturStates)
        )
      : '') +
    (fiturOk ? buildDlNextButton('rencanaNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-brief]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (terkunci || State.briefPilih === btn.dataset.brief) return;
      State.briefPilih = btn.dataset.brief;
      resetBriefStates();
      saveState();
      rerender();
    });
  });
  container.querySelectorAll('[data-peran]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.peranPilih = btn.dataset.peran;
      saveState();
      rerender();
    });
  });
  petaAktif.forEach(function (u) {
    bindDlStep('peta-' + u.id, State.petaSteps[u.id], langkahPeta(br, u), saveState, rerender);
  });
  if (petaOk) bindSortItems(container, FITUR_ITEMS, State.fiturStates, saveState, rerender);
  bindNext('rencanaNextBtn', 'rencana', 'jadwal');
}

/* ============================================================
   7. STAGE: JADWAL  (PjBL — sintaks 3)
   Urutkan milestone → waktu & definition of done → catatan tim.
   ============================================================ */

function renderJadwal(container) {
  var D = DATA.jadwal;
  var rerender = function () {
    renderJagaFokus(function () {
      renderJadwal(container);
    });
  };
  var urutOk = State.jadwalState.correct;
  var tanyaOk = urutOk && guidedQuizAllCorrect(TANYA_JADWAL, State.jadwalPilih);

  container.innerHTML =
    '<section aria-label="Menyusun Jadwal">' +
    buildHead(D) +
    panelJudul(
      '🗓️ ' + D.judulUrut,
      caption(D.instruksiUrut) +
        buildTapOrder('jadwal', JADWAL_ITEMS, State.jadwalState, {
          answer: JADWAL_JAWAB,
          startLabel: 'Pertama',
          endLabel: 'Terakhir',
          separator: '→',
          successText:
            '<strong>Jadwal tersusun!</strong> Model → prototipe → uji kasus → pameran → refleksi. Kartu milestone ini muncul di papan proyek.',
        })
    ) +
    (urutOk
      ? buildBoard(null) +
        panelJudul(
          '⏱️ ' + D.judulTanya,
          buildGuidedQuizList(TANYA_JADWAL, State.jadwalOrders, State.jadwalPilih)
        )
      : '') +
    (tanyaOk
      ? buildDlPanel(
          buildTextarea('jadwalCatatan', D.catatanLabel, D.catatanPlaceholder, State.jadwalCatatan)
        ) + buildDlNextButton('jadwalNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindTapOrder(container, 'jadwal', State.jadwalState, JADWAL_JAWAB, saveState, rerender);
  if (urutOk) bindGuidedQuizList(container, TANYA_JADWAL, State.jadwalPilih, saveState, rerender);
  bindTextarea('jadwalCatatan', 'jadwalCatatan');
  bindNext('jadwalNextBtn', 'jadwal', 'modelMat');
}

/* ============================================================
   8. STAGE: MILESTONE 1 — MODEL  (PjBL — sintaks 4)
   Rumus Uₙ → Uₙ klien → Sₙ klien berdiagnosa → cek kewajaran.
   ============================================================ */

function buildCekApit(br) {
  var n = br.nJumlah;
  var k = KUNCI[br.id];
  return (
    '<div class="cek-apit" role="group" aria-label="Cek kewajaran Sₙ">' +
    '<span class="cek-apit__item">n × a = ' +
    esc(fmtB(br, n * br.a)) +
    '</span><span aria-hidden="true">≤</span>' +
    '<span class="cek-apit__item cek-apit__item--sn">' +
    esc(lblS(n)) +
    ' = ' +
    esc(fmtB(br, k.sn)) +
    '</span><span aria-hidden="true">≤</span>' +
    '<span class="cek-apit__item">n × ' +
    esc(lblU(n)) +
    ' = ' +
    esc(fmtB(br, n * sukuAritmetika(br.a, br.b, n))) +
    '</span>' +
    '</div>'
  );
}

function renderModelMat(container) {
  var D = DATA.modelMat;
  var br = briefAktif();
  if (!br) {
    renderTanpaBrief(container);
    return;
  }
  var rerender = function () {
    renderJagaFokus(function () {
      renderModelMat(container);
    });
  };
  var s1 = State.rumusState.done;
  var s2 = s1 && State.sukuStep.done;
  var s3 = s2 && State.jumlahStep.done;
  var s4 = s3 && guidedQuizAllCorrect(TANYA_MODEL, State.modelPilih);

  container.innerHTML =
    '<section aria-label="Milestone 1: Model Matematika">' +
    buildHead(D) +
    buildBoard('modelMat') +
    buildBriefStrip(br) +
    panelJudul(
      '🧮 ' + D.judulRumus,
      caption(D.instruksiRumus) +
        buildRumusSukuInput('rumus', State.rumusState, { a: br.a, b: br.b })
    ) +
    (s1
      ? panelJudul(
          '📨 ' + D.judulHitung,
          '<div class="karya-langkah">' +
            buildDlStep('suku', State.sukuStep, langkahSuku(br), 1) +
            (s2 ? buildJumlahDeretStep('jumlah', State.jumlahStep, langkahJumlah(br)) : '') +
            '</div>'
        )
      : '') +
    (s3
      ? panelJudul(
          '✅ ' + D.judulCek,
          buildGuidedQuizList(TANYA_MODEL, State.modelOrders, State.modelPilih) +
            (s4 ? buildCekApit(br) : '')
        )
      : '') +
    (s4 ? buildTemuanPanel(D.temuan) + buildDlNextButton('modelNextBtn', D.nextLabel) : '') +
    '</section>';

  bindRumusSukuInput(container, 'rumus', State.rumusState, br.a, br.b, saveState, rerender);
  if (s1) bindDlStep('suku', State.sukuStep, langkahSuku(br), saveState, rerender);
  if (s2) bindJumlahDeretStep('jumlah', State.jumlahStep, langkahJumlah(br), saveState, rerender);
  if (s3) bindGuidedQuizList(container, TANYA_MODEL, State.modelPilih, saveState, rerender);
  bindNext('modelNextBtn', 'modelMat', 'prototipe');
}

/* ============================================================
   9. STAGE: MILESTONE 2 — PROTOTIPE  (PjBL — sintaks 4)
   Lab perencana → n target → fitur lanjutan → kode kapanTercapai.
   ============================================================ */

function renderPrototipe(container) {
  var D = DATA.prototipe;
  var br = briefAktif();
  if (!br) {
    renderTanpaBrief(container);
    return;
  }
  var rerender = function () {
    renderJagaFokus(function () {
      renderPrototipe(container);
    });
  };
  var cfg = labCfg(br);
  var cfgLanjut = labLanjutCfg(br);
  var s1 = State.targetStep.done;
  var s2 = s1 && State.lanjutStep.done;
  var s3 = s2 && State.protoPilih[TANYA_KODE.id] === TANYA_KODE.correct;
  var ubah = br.lanjutan.ubah === 'a' ? cfg.label.a : cfg.label.b;

  container.innerHTML =
    '<section aria-label="Milestone 2: Prototipe Mini App">' +
    buildHead(D) +
    buildBoard('prototipe') +
    buildBriefStrip(br) +
    panelJudul(
      '🛠️ ' + D.judulLab,
      caption(D.instruksiLab) +
        buildPlannerLab('labProto', State.lab, cfg) +
        '<div class="btn-group" style="margin-top:var(--space-3);">' +
        '<button type="button" class="btn btn--ghost btn--small" id="labResetBtn">↺ Kembalikan a & b ke nilai brief</button>' +
        '</div>' +
        buildDlStep('target', State.targetStep, langkahTarget(br))
    ) +
    (s1
      ? panelJudul(
          '⚙️ ' + D.judulLanjutan,
          caption(D.instruksiLanjutan) +
            '<p class="dl-caption">Slider yang boleh diubah: <strong>' +
            esc(ubah) +
            '</strong> · n dikunci = ' +
            br.lanjutan.n +
            ' ' +
            esc(br.periode) +
            '.</p>' +
            buildPlannerLab('labLanjut', State.labLanjut, cfgLanjut) +
            buildDlStep('lanjut', State.lanjutStep, langkahLanjut(br))
        )
      : '') +
    (s2
      ? panelJudul(
          '💻 ' + D.judulKode,
          caption(D.instruksiKode) +
            buildGuidedQuizList([TANYA_KODE], State.protoOrders, State.protoPilih)
        )
      : '') +
    (s3 ? buildTemuanPanel(D.temuan) + buildDlNextButton('protoNextBtn', D.nextLabel) : '') +
    '</section>';

  bindPlannerLab(container, 'labProto', State.lab, cfg, saveState);
  document.getElementById('labResetBtn').addEventListener('click', function () {
    State.lab.a = br.a;
    State.lab.b = br.b;
    saveState();
    rerender();
  });
  bindDlStep('target', State.targetStep, langkahTarget(br), saveState, rerender);
  if (s1) {
    bindPlannerLab(container, 'labLanjut', State.labLanjut, cfgLanjut, saveState);
    bindDlStep('lanjut', State.lanjutStep, langkahLanjut(br), saveState, rerender);
  }
  if (s2) bindGuidedQuizList(container, [TANYA_KODE], State.protoPilih, saveState, rerender);
  bindNext('protoNextBtn', 'prototipe', 'ujiKasus');
}

/* ============================================================
   10. STAGE: MILESTONE 3 — UJI KASUS  (PjBL — sintaks 4)
   Harapan kasus uji → jalankan kode teman → pilih & jelaskan.
   ============================================================ */

function harapanSelesai() {
  return UJI.kasus.every(function (k) {
    return State.harapanSteps[k.id].done;
  });
}

function semuaDijalankan() {
  return UJI.impls.every(function (im) {
    return !!State.runner.dijalankan[im.id];
  });
}

function renderUjiKasus(container) {
  var D = UJI;
  var br = briefAktif();
  if (!br) {
    renderTanpaBrief(container);
    return;
  }
  var rerender = function () {
    renderJagaFokus(function () {
      renderUjiKasus(container);
    });
  };

  var langkahHTML =
    '<div class="dl-step dl-step--done">' +
    '<p class="dl-step__label"><span class="dl-step__num">1</span>Kasus 1 (brief ' +
    esc(br.judul) +
    '): <code>jumlahDeret(' +
    br.a +
    ', ' +
    br.b +
    ', ' +
    br.nJumlah +
    ')</code> seharusnya menghasilkan …</p>' +
    '<p class="dl-step__answer">✓ ' +
    esc(fmtAngkaDeret(KUNCI[br.id].sn)) +
    ' <span class="dl-caption">(dari Milestone 1)</span></p>' +
    '</div>';
  var aktif = [];
  for (var i = 0; i < D.kasus.length; i++) {
    var k = D.kasus[i];
    langkahHTML += buildDlStep(
      'har-' + k.id,
      State.harapanSteps[k.id],
      langkahHarapan(k, i),
      i + 2
    );
    aktif.push(i);
    if (!State.harapanSteps[k.id].done) break;
  }
  var s1 = harapanSelesai();
  var s2 = s1 && semuaDijalankan();
  var s3 = s2 && guidedQuizAllCorrect(TANYA_UJI, State.ujiPilih);

  container.innerHTML =
    '<section aria-label="Milestone 3: Uji Kasus">' +
    buildHead(D) +
    buildBoard('ujiKasus') +
    buildBriefStrip(br) +
    panelJudul(
      '📝 ' + D.judulHarapan,
      caption(D.instruksiHarapan) + '<div class="harapan-langkah">' + langkahHTML + '</div>'
    ) +
    (s1
      ? panelJudul(
          '▶️ ' + D.judulRunner,
          caption(D.instruksiRunner) +
            buildTestRunner('runner', kasusUji(), D.impls, State.runner) +
            (s2 ? '' : caption('Jalankan ketiga kode untuk membuka pertanyaan analisis.'))
        )
      : '') +
    (s2
      ? panelJudul(
          '🔍 Analisis hasil uji',
          buildGuidedQuizList(TANYA_UJI, State.ujiOrders, State.ujiPilih)
        )
      : '') +
    (s3 ? buildTemuanPanel(D.temuan) + buildDlNextButton('ujiNextBtn', D.nextLabel) : '') +
    '</section>';

  aktif.forEach(function (idx) {
    var kk = D.kasus[idx];
    bindDlStep(
      'har-' + kk.id,
      State.harapanSteps[kk.id],
      langkahHarapan(kk, idx),
      saveState,
      rerender
    );
  });
  if (s1) {
    bindTestRunner(container, 'runner', State.runner, saveState, rerender, function () {
      if (semuaDijalankan()) showNotice('Ketiga kode sudah diuji. Analisis hasilnya di bawah.');
    });
  }
  if (s2) bindGuidedQuizList(container, TANYA_UJI, State.ujiPilih, saveState, rerender);
  bindNext('ujiNextBtn', 'ujiKasus', 'pameran');
}

/* ============================================================
   11. STAGE: PAMERAN — MENGUJI HASIL  (PjBL — sintaks 5)
   Kartu Proyek → penilaian sejawat → rubrik penilaian diri.
   ============================================================ */

function buildKartuProyek(br) {
  var D = DATA.pameran;
  var k = KUNCI[br.id];
  var peran = State.peranPilih ? findOptionLabel(DATA.rencana.peran, State.peranPilih) : '';
  var merge = UJI.impls.filter(function (im) {
    return im.id === TANYA_UJI[0].correct;
  })[0];
  var hasilUji = ringkasHasilUji(jalankanKasusUji(merge.id, kasusUji()));
  return buildInfoPoster({
    judul: D.posterJudul + ': ' + br.judul,
    ikon: br.ikon,
    rows: [
      { ikon: '🤝', label: 'Klien', nilai: esc(br.klien) },
      {
        ikon: '🧮',
        label: 'Model',
        nilai:
          esc(fmtRumusSuku(br.a, br.b)) +
          ' · Sₙ = n/2 (2a + (n − 1)b) dengan a = ' +
          esc(fmtB(br, br.a)) +
          ', b = ' +
          esc(fmtB(br, br.b)),
      },
      {
        ikon: '🔢',
        label: br.tanya.suku,
        nilai: esc(lblU(br.nSuku)) + ' = <strong>' + esc(fmtB(br, k.un)) + '</strong>',
      },
      {
        ikon: '➕',
        label: br.tanya.jumlah,
        nilai: esc(lblS(br.nJumlah)) + ' = <strong>' + esc(fmtB(br, k.sn)) + '</strong>',
      },
      {
        ikon: '🎯',
        label: br.tanya.target,
        nilai:
          '<strong>' +
          esc(br.periode + ' ke-' + k.nTarget) +
          '</strong> (' +
          esc(lblS(k.nTarget - 1)) +
          ' = ' +
          esc(fmtB(br, jumlahAritmetika(br.a, br.b, k.nTarget - 1))) +
          ', ' +
          esc(lblS(k.nTarget)) +
          ' = ' +
          esc(fmtB(br, jumlahAritmetika(br.a, br.b, k.nTarget))) +
          ')',
      },
      {
        ikon: '⚙️',
        label: br.tanya.lanjutan,
        nilai:
          '<strong>' +
          esc(
            br.lanjutan.ubah === 'a'
              ? fmtAngkaDeret(k.lanjutan) + ' ' + br.satuan
              : fmtB(br, k.lanjutan)
          ) +
          '</strong>',
      },
      {
        ikon: '🧪',
        label: 'Uji kasus',
        nilai:
          esc(merge.nama) +
          ' lolos <strong>' +
          hasilUji.lulus +
          '/' +
          hasilUji.total +
          '</strong> kasus uji',
      },
    ].concat(peran ? [{ ikon: '👥', label: 'Peranku', nilai: esc(peran) }] : []),
    pesan: State.pameranPesan.trim() || undefined,
    footer: D.posterFooter,
  });
}

function rubrikLengkap() {
  return RUBRIK.every(function (r) {
    return !!State.rubrikPilih[r.id];
  });
}

function renderPameran(container) {
  var D = DATA.pameran;
  var br = briefAktif();
  if (!br) {
    renderTanpaBrief(container);
    return;
  }
  var rerender = function () {
    renderJagaFokus(function () {
      renderPameran(container);
    });
  };
  var sejawatOk = sortItemsAllAnswered(SEJAWAT_ITEMS, State.sejawatStates);

  container.innerHTML =
    '<section aria-label="Pameran dan Menguji Hasil">' +
    buildHead(D) +
    buildBoard('pameran') +
    buildDlPanel(
      buildTextarea('pameranPesan', D.pesanLabel, D.pesanPlaceholder, State.pameranPesan) +
        '<div class="btn-group btn-group--end" style="margin-top:var(--space-3);">' +
        '<button type="button" class="btn btn--ghost" id="kartuRefreshBtn">Perbarui Kartu</button>' +
        '</div>' +
        '<div id="kartuWrap">' +
        buildKartuProyek(br) +
        '</div>' +
        buildFeedbackBox(
          'info',
          '🎤',
          'Presenter menjelaskan kartu ini di meja pameran (±2 menit). Setiap baris harus bisa dijelaskan asal-usul hitungannya.'
        ),
      'panel--hero'
    ) +
    panelJudul(
      '👀 ' + D.judulSejawat,
      caption(D.instruksiSejawat) +
        buildSortItems(SEJAWAT_ITEMS, State.sejawatOrder, D.opsiSejawat, State.sejawatStates)
    ) +
    (sejawatOk
      ? panelJudul(
          '📏 ' + D.judulRubrik,
          caption(D.instruksiRubrik) +
            RUBRIK.map(function (r, i) {
              return (
                '<div class="quiz-item">' +
                '<p class="exercise-label"><span class="dl-step__num">' +
                (i + 1) +
                '</span>' +
                esc(r.kriteria) +
                '</p>' +
                buildChoiceGroup(r.opsi, State.rubrikOrders[r.id], {
                  chosen: State.rubrikPilih[r.id] || null,
                  group: r.id,
                  attr: 'data-rubrik',
                }) +
                '</div>'
              );
            }).join('')
        )
      : '') +
    (sejawatOk && rubrikLengkap() ? buildDlNextButton('pameranNextBtn', D.nextLabel) : '') +
    '</section>';

  bindTextarea('pameranPesan', 'pameranPesan');
  document.getElementById('kartuRefreshBtn').addEventListener('click', function () {
    document.getElementById('kartuWrap').innerHTML = buildKartuProyek(br);
  });
  bindSortItems(container, SEJAWAT_ITEMS, State.sejawatStates, saveState, rerender);
  container.querySelectorAll('[data-rubrik]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.rubrikPilih[btn.dataset.group] = btn.dataset.rubrik;
      saveState();
      rerender();
    });
  });
  var nextBtn = document.getElementById('pameranNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.pameranPesan.trim()) {
        showNotice('Tulis pesan singkat kelompokmu untuk klien lebih dulu.');
        return;
      }
      completeStage('pameran');
      navigateTo('terapkan');
    });
  }
}

/* ============================================================
   12. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal TERAP_SOAL yang
   dipilih acak. Isian dibaca parseInputAngka (titik ribuan); soal
   jumlah deret memakai diagnosaJumlahDeret untuk umpan balik
   miskonsepsi.
   ============================================================ */

function pesanIsianSalah(s, ex) {
  var c = s.cek || {};
  var v = parseInputAngka(ex.userInput).value;
  if (c.tipe === 'jumlah') {
    return pesanDiagnosaJumlahDeret(diagnosaJumlahDeret(c.a, c.b, c.n, v), c.a, c.b, c.n);
  }
  if (c.tipe === 'suku') {
    if (hampirSama(v, c.a + c.n * c.b)) {
      return 'Kamu memakai a + nb. Suku ke-n adalah a + (n − 1)b.';
    }
    if (hampirSama(v, jumlahAritmetika(c.a, c.b, c.n))) {
      return 'Itu jumlah semua suku (Sₙ). Yang ditanya hanya satu suku, Uₙ.';
    }
    return 'Belum tepat. Pakai Uₙ = a + (n − 1)b dan perhatikan tanda beda.';
  }
  if (c.tipe === 'nMin') {
    if (hampirSama(v, nMinimalJumlahMencapai(c.a, c.b, c.target) - 1)) {
      return 'Pada n itu totalnya BELUM mencapai target. Coba satu periode berikutnya.';
    }
    if (hampirSama(v, nMinimalSukuMencapai(c.a, c.b, c.target))) {
      return 'Itu saat SATU suku mencapai target. Yang ditanya kapan TOTAL (Sₙ) mencapai target.';
    }
    return 'Belum tepat. Hitung Sₙ untuk beberapa n sampai pertama kali ≥ target.';
  }
  if (c.tipe === 'bedaMaks' || c.tipe === 'sukuMin' || c.tipe === 'bedaMin') {
    return 'Belum tepat. Tulis syarat Sₙ dengan n yang ditetapkan, selesaikan pertidaksamaannya, lalu periksa nilai di sekitarnya.';
  }
  return 'Belum tepat. Periksa lagi apa yang ditanyakan: suku (Uₙ), jumlah (Sₙ), atau n?';
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
  inputMode: 'text',
  allowNegative: true,
  inputAriaLabel: 'Jawabanmu',
  inputPlaceholder: 'mis. 600 atau 1.450',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  invalidMessage: 'Tulis jawaban berupa bilangan, mis. 600 atau 1.450.',
  parseInput: function (val) {
    return parseInputAngka(val);
  },
  checkValue: function (s) {
    return s.jawab;
  },
  isCorrect: function (value, s) {
    return hampirSama(value, s.jawab);
  },
  inputSuffix: function (s) {
    return s.satuan ? '<span class="dl-caption">' + esc(s.satuan) + '</span>' : '';
  },
  inputErrorHTML: function (s, ex) {
    return '<strong>' + esc(ex.userInput) + '</strong> — ' + esc(pesanIsianSalah(s, ex));
  },
  revealText: function (s) {
    return esc(s.reveal + ' ' + s.explanation);
  },
  renderPrompt: function (s) {
    var tag = s.type === 'choice' ? 'Pilihan ganda' : '✏️ Isian';
    return (
      '<div class="dl-prompt">' +
      '<span class="bbk-soal-tag">' +
      esc(tag) +
      '</span>' +
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
   13. STAGE: REFLEKSI — EVALUASI PENGALAMAN  (PjBL — sintaks 6)
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var br = briefAktif();
  var js = State.jumlahStep;
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
    '<section aria-label="Evaluasi Pengalaman">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="summary-grid">' +
        kartu(br ? br.ikon : '—', br ? esc(br.judul) : 'Brief') +
        kartu(
          js && js.done ? (js.attempts === 1 ? '✓ 1×' : '✓ ' + js.attempts + '×') : '—',
          'Percobaan menghitung Sₙ klien'
        ) +
        kartu(String(State.runner.kali || 0), 'Kali menjalankan tes kode') +
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
  var br = briefAktif();

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="done-card">' +
    '<span class="done-card__icon">🚀</span>' +
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
          '<span class="contoh-isi">' +
          esc(c.isi) +
          '</span>' +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    (br ? '<div class="done-card__kartu">' + buildKartuProyek(br) + '</div>' : '') +
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
    'Presentasi Kartu Proyek di pameran, penjelasan lisan tentang hasil uji kasus, dan rubrik penilaian diri tetap menjadi bahan penilaian utama proyek.' +
    '</div></div>' +
    '<div class="btn-group btn-group--center">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '<button type="button" class="btn btn--outline-primary" id="reviewBtn">Tinjau Ulang</button>' +
    '</div>' +
    '</div>' +
    '</section>';

  completeStage('selesai');

  document.getElementById('reviewBtn').addEventListener('click', function () {
    navigateTo('pertanyaan');
  });
}

/* ============================================================
   15. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  pertanyaan: renderPertanyaan,
  rencana: renderRencana,
  jadwal: renderJadwal,
  modelMat: renderModelMat,
  prototipe: renderPrototipe,
  ujiKasus: renderUjiKasus,
  pameran: renderPameran,
  terapkan: renderTerapkan,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  var fn = RENDERERS[State.currentStage] || RENDERERS.pertanyaan;
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
  if (STAGES.indexOf(State.currentStage) === -1) State.currentStage = 'pertanyaan';
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
      navigateTo('pertanyaan');
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
