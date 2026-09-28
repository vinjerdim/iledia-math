'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Luas Permukaan Limas
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox,
   createStageMachine, createExerciseStage, createStore,
   ensureExerciseArray, optionIds, komponen Discovery Learning
   (ensureShuffledOrder, orderByIds, buildDiscoveryHead,
   buildTeacherNote, buildTpPanel, buildChoiceGroup, buildDlPanel,
   buildDlNextButton, makeDlStep, buildDlStep, bindDlStep,
   ensureSortStates, buildSortItems, bindSortItems,
   sortItemsAllAnswered, sortItemsCorrectCount, buildGuidedQuizList,
   bindGuidedQuizList, guidedQuizAllCorrect), kartu isian berdiagnosa
   seksi 47 (ukuranAlasPrisma, pengecohLuasSisi, lppAngka, lppSkala,
   ensureLpIsianState, buildLpIsian, bindLpIsian, lpKartuBenar),
   gambar limas seksi 56 (modelLimas, garisTinggiLimas, buildPrismSVG),
   serta komponen luas permukaan limas seksi 57 (alasLimasBeraturan,
   tinggiSisiLimasPersegiPanjang, tinggiSisiTegakLimas, apotemaAlas,
   rincianSisiLimas, luasPermukaanLimas, luasPermukaanLimasUmum,
   kandidatLuasPermukaanLimas, diagnosaLuasPermukaanLimas, LPL_PESAN,
   pengecohLuasSegitiga, susunSisiTegakLimas, lplJaring,
   buildLplNetSVG, ensureLplLabState, buildLplNetLab, bindLplNetLab,
   lplLabSelesai, ensureSusunLimasState, buildLplSusun, bindLplSusun).

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala pada data.js untuk pemetaan dan rangkaian aktivitasnya.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI saat
   state disiapkan (initExerciseArrays), lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat-lompat
   ketika tahap dirender ulang, tetapi teracak ulang setiap Reset.

   Bagian:
    1. Konstanta & kartu isian
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi            (DL sintaks 1)
    6. Stage: Identifikasi Masalah (DL sintaks 2)
    7. Stage: Membuka Lampion      (DL sintaks 3)
    8. Stage: Susun Sisi Tegak     (DL sintaks 3)
    9. Stage: Mengolah Data        (DL sintaks 4)
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
   1. KONSTANTA & KARTU ISIAN
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'bongkar',
  'susun',
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
  'Bongkar',
  'Susun',
  'Olah',
  'Bukti',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-22-7-luas-limas-v1';

var LIMAS_BY_ID = {};
DATA.limas.forEach(function (b) {
  LIMAS_BY_ID[b.id] = b;
});

function daftarLimas(ids) {
  return ids.map(function (id) {
    return LIMAS_BY_ID[id];
  });
}

var LAB_OPTS = { limas: daftarLimas(DATA.bongkar.lab) };
var LIMAS_TABEL = LIMAS_BY_ID[DATA.bongkar.limasTabel];
var LIMAS_SUSUN = daftarLimas(DATA.susun.limasIds);
var LIMAS_OLAH = daftarLimas(DATA.olah.limasIds);

/* Ringkasan ukuran satu limas (beraturan { n, s, ts } atau persegi panjang { p, l, t }). */
function ukuranLimas(b) {
  var pts = b.p
    ? [
        [0, 0],
        [b.p, 0],
        [b.p, b.l],
        [0, b.l],
      ]
    : alasLimasBeraturan(b.n, b.s);
  var ts = b.p ? tinggiSisiLimasPersegiPanjang(b.p, b.l, b.t) : b.ts;
  var rinci = rincianSisiLimas(pts, ts);
  var u = ukuranAlasPrisma(pts);
  var tegak = rinci.filter(function (f) {
    return f.jenis === 'tegak';
  });
  return {
    u: u,
    rinci: rinci,
    tegak: tegak,
    jumlahTegak: lppBulat(
      tegak.reduce(function (s, f) {
        return s + f.luas;
      }, 0)
    ),
    lp: luasPermukaanLimasUmum(rinci),
    o: b.p
      ? null
      : { luasAlas: u.luas, kelilingAlas: u.keliling, tinggiSisi: b.ts, tinggiLimas: b.t },
  };
}

/* Pengecoh unik yang tidak sama dengan jawaban benar. */
function saringPengecoh(list, jawab) {
  var dipakai = [];
  return list.filter(function (p) {
    if (hampirSama(p.nilai, jawab)) return false;
    var ada = dipakai.some(function (v) {
      return hampirSama(v, p.nilai);
    });
    if (ada) return false;
    dipakai.push(p.nilai);
    return true;
  });
}

function jaringKecil(b, lebar) {
  return buildLplNetSVG(b, { lebar: lebar || 240, aria: 'Jaring-jaring ' + b.nama + ' berukuran' });
}

/* Cara hitung jumlah luas sisi tegak, mis. "4 × ½ × 10 × 13". */
function caraSisiTegak(b, m) {
  if (!b.p) return b.n + ' × ½ × ' + lppAngka(b.s) + ' × ' + lppAngka(b.ts);
  var t = m.tegak;
  return (
    '2 × ½ × ' +
    lppAngka(t[0].alas) +
    ' × ' +
    lppAngka(t[0].tinggi) +
    ' + 2 × ½ × ' +
    lppAngka(t[1].alas) +
    ' × ' +
    lppAngka(t[1].tinggi)
  );
}

/* Tahap 3 — luas setiap sisi limas + jumlahnya. */
function buatKartuSisi(b) {
  var m = ukuranLimas(b);
  var fields = m.rinci.map(function (f) {
    if (f.jenis === 'alas') {
      return {
        id: f.id,
        label: 'Sisi alas <span class="lpp-cara">(' + esc(b.caraLuasAlas) + ')</span>',
        jawab: f.luas,
        satuan: 'cm²',
        pengecoh: pengecohLuasSisi(
          { jenis: 'alas', luas: f.luas },
          { alasPersegiPanjang: true, kelilingAlas: m.u.keliling }
        ),
      };
    }
    return {
      id: f.id,
      label:
        'Sisi tegak ke-' +
        f.urut +
        ' <span class="lpp-cara">(½ × ' +
        lppAngka(f.alas) +
        ' × ' +
        lppAngka(f.tinggi) +
        ')</span>',
      jawab: f.luas,
      satuan: 'cm²',
      pengecoh: pengecohLuasSegitiga(f),
    };
  });
  fields.push({
    id: 'total',
    label: '<strong>Jumlah luas semua sisi</strong>',
    jawab: m.lp,
    satuan: 'cm²',
    pengecoh: saringPengecoh(
      [
        {
          nilai: m.jumlahTegak,
          pesan: 'Itu baru jumlah sisi tegak. Tambahkan luas sisi alasnya.',
        },
        {
          nilai: m.lp - m.tegak[0].luas,
          pesan:
            'Masih ada satu sisi yang belum dijumlahkan. Periksa lagi: sisi alas dan keempat sisi tegak.',
        },
        {
          nilai: m.lp + m.u.luas,
          pesan: 'Luas alas terhitung dua kali. Limas hanya punya satu sisi alas.',
        },
      ],
      m.lp
    ),
  });
  return {
    id: 'sisi-' + b.id,
    judul: DATA.bongkar.kartuJudul,
    hints: DATA.bongkar.hintsTabel,
    temuan: esc(DATA.bongkar.temuan),
    fields: fields,
  };
}

/* Tahap 4 — ukuran bangun gabungan sisi tegak. */
function buatKartuSusun(b) {
  var z = susunSisiTegakLimas(b.n, b.s, b.ts);
  var k = b.n * b.s;
  var luas = luasSisiTegakLimas(k, b.ts);
  return {
    id: 'susun-' + b.id,
    judul: b.nama,
    fields: [
      {
        id: 'jumlah',
        label:
          'Jumlah kedua sisi sejajar <span class="lpp-cara">(' +
          lppAngka(z.bawah) +
          ' + ' +
          lppAngka(z.atas) +
          ')</span>',
        jawab: k,
        satuan: 'cm',
        pengecoh: saringPengecoh(
          [
            {
              nilai: z.bawah,
              pesan: 'Itu baru sisi sejajar bawah. Jumlahkan dengan sisi sejajar atas.',
            },
            {
              nilai: b.s,
              pesan: 'Itu panjang satu rusuk alas. Jumlahkan kedua sisi sejajar bangun gabungan.',
            },
          ],
          k
        ),
      },
      { id: 'tinggi', label: 'Tinggi bangun (tₛ)', jawab: b.ts, satuan: 'cm', diberikan: true },
      {
        id: 'luas',
        label:
          'Luas bangun gabungan <span class="lpp-cara">(½ × jumlah sisi sejajar × tinggi)</span>',
        jawab: luas,
        satuan: 'cm²',
        pengecoh: saringPengecoh(
          [
            {
              nilai: k * b.ts,
              pesan:
                'Hasilmu dua kali lipat. Luas jajargenjang/trapesium = ½ × (jumlah sisi sejajar) × tinggi.',
            },
            {
              nilai: k + b.ts,
              pesan: 'Panjang dan tinggi dijumlahkan. Untuk luas, keduanya dikalikan.',
            },
          ],
          luas
        ),
      },
      {
        id: 'satu',
        label:
          'Luas sisi tegak satu per satu: <span class="lpp-cara">' +
          b.n +
          ' × ½ × ' +
          lppAngka(b.s) +
          ' × ' +
          lppAngka(b.ts) +
          '</span>',
        jawab: luas,
        satuan: 'cm²',
        pengecoh: pengecohLuasSegitiga({ alas: b.n * b.s, tinggi: b.ts, luas: luas }),
      },
    ],
    temuan:
      '<strong>Sama!</strong> Luas bangun gabungan = jumlah luas sisi tegak = ' +
      lppAngka(luas) +
      ' cm². Jumlah sisi sejajarnya ' +
      lppAngka(k) +
      ' cm = keliling alas (' +
      b.n +
      ' × ' +
      lppAngka(b.s) +
      ').',
  };
}

/* Tahap 5 — kartu data satu limas. */
function buatKartuData(b) {
  var m = ukuranLimas(b);
  var fields = [
    {
      id: 'la',
      label: 'Luas alas (La)',
      jawab: m.u.luas,
      satuan: 'cm²',
      pengecoh: pengecohLuasSisi(
        { jenis: 'alas', luas: m.u.luas },
        { alasPersegiPanjang: true, kelilingAlas: m.u.keliling }
      ),
    },
  ];
  var hints = ['Luas alas = ' + b.caraLuasAlas + '.'];
  if (b.p) {
    fields.push(
      {
        id: 'ts1',
        label: 'tₛ pada rusuk ' + lppAngka(m.tegak[0].alas) + ' cm',
        jawab: m.tegak[0].tinggi,
        satuan: 'cm',
        diberikan: true,
      },
      {
        id: 'ts2',
        label: 'tₛ pada rusuk ' + lppAngka(m.tegak[1].alas) + ' cm',
        jawab: m.tegak[1].tinggi,
        satuan: 'cm',
        diberikan: true,
      }
    );
    hints.push(
      'Ada dua pasang segitiga yang berbeda: hitung satu segitiga dari setiap pasang, lalu kalikan 2.'
    );
  } else {
    fields.push(
      {
        id: 'k',
        label: 'Keliling alas (K)',
        jawab: m.u.keliling,
        satuan: 'cm',
        pengecoh: saringPengecoh(
          [
            {
              nilai: m.u.luas,
              pesan: 'Itu luas alas. Keliling = jumlah panjang semua rusuk alas.',
            },
          ],
          m.u.keliling
        ),
      },
      { id: 'ts', label: 'Tinggi sisi tegak (tₛ)', jawab: b.ts, satuan: 'cm', diberikan: true }
    );
    hints.push('Keliling alas = ' + b.n + ' × ' + lppAngka(b.s) + '.');
  }
  fields.push({
    id: 'tegak',
    label: 'Jumlah luas sisi tegak <span class="lpp-cara">(' + caraSisiTegak(b, m) + ')</span>',
    jawab: m.jumlahTegak,
    satuan: 'cm²',
    pengecoh: saringPengecoh(
      [
        {
          nilai: 2 * m.jumlahTegak,
          pesan: 'Hasilmu dua kali lipat. Luas setiap segitiga memakai ½.',
        },
        {
          nilai: m.tegak[0].luas,
          pesan: 'Itu baru luas satu segitiga. Jumlahkan semua sisi tegak.',
        },
      ],
      m.jumlahTegak
    ),
  });
  if (!b.p) {
    var setengah = luasSisiTegakLimas(m.u.keliling, b.ts);
    fields.push({
      id: 'rumus',
      label: '½ × K × tₛ',
      jawab: setengah,
      satuan: 'cm²',
      pengecoh: saringPengecoh(
        [
          { nilai: m.u.keliling * b.ts, pesan: 'Jangan lupa ½: hitung ½ × K × tₛ.' },
          { nilai: m.u.keliling + b.ts, pesan: 'K dan tₛ dijumlahkan. Hitung ½ × K × tₛ.' },
        ],
        setengah
      ),
    });
    hints.push('Luas permukaan = La + jumlah luas sisi tegak.');
  } else {
    hints.push('Luas permukaan = La + jumlah luas sisi tegak.');
  }
  var diag = b.p
    ? {
        'tanpa-alas': m.jumlahTegak,
        'dua-alas': 2 * m.u.luas + m.jumlahTegak,
        'lupa-setengah': m.u.luas + 2 * m.jumlahTegak,
      }
    : kandidatLuasPermukaanLimas(m.o);
  fields.push({
    id: 'lp',
    label: '<strong>Luas permukaan (LP)</strong>',
    jawab: m.lp,
    satuan: 'cm²',
    pengecoh: saringPengecoh(
      Object.keys(diag)
        .filter(function (k) {
          return k !== 'benar';
        })
        .map(function (k) {
          return { nilai: diag[k], pesan: LPL_PESAN[k] };
        }),
      m.lp
    ),
  });
  return {
    id: 'data-' + b.id,
    judul: b.nama + ' · ' + b.bentuk,
    visual:
      '<div class="lpp-data-visual">' +
      jaringKecil(b, 220) +
      '<p class="dl-caption">Alas: ' +
      esc(b.infoAlas) +
      '</p></div>',
    hints: hints,
    fields: fields,
  };
}

var KARTU_SISI = [buatKartuSisi(LIMAS_TABEL)];
var KARTU_SUSUN = {};
LIMAS_SUSUN.forEach(function (b) {
  KARTU_SUSUN[b.id] = buatKartuSusun(b);
});
var KARTU_SUSUN_LIST = LIMAS_SUSUN.map(function (b) {
  return KARTU_SUSUN[b.id];
});
var KARTU_DATA = LIMAS_OLAH.map(buatKartuData);

/* Butir pemilahan (teks dari DATA). */
var PILAH_ITEMS = DATA.olah.pilah.map(function (it) {
  return {
    id: it.id,
    correct: it.correct,
    explanation: esc(it.explanation),
    teks: esc(it.teks),
  };
});

/* Langkah pembuktian: kunci dihitung ulang dari ukuran kotak hadiah. */
var VERIF = (function () {
  var b = DATA.verifikasi.limas;
  var a = apotemaAlas(b.n, b.s);
  var ts = tinggiSisiTegakLimas(b.t, a);
  var u = ukuranAlasPrisma(alasLimasBeraturan(b.n, b.s));
  var kunci = {
    apotema: lppBulat(a),
    tinggiSisi: ts,
    luasAlas: u.luas,
    luasSatuSisi: lppBulat((b.s * ts) / 2),
    jumlahSemua: lppBulat(u.luas + (b.n * b.s * ts) / 2),
    keliling: u.keliling,
    rumus: luasPermukaanLimas({ luasAlas: u.luas, kelilingAlas: u.keliling, tinggiSisi: ts }),
  };
  function langkah(list) {
    return list.map(function (s) {
      return { id: s.id, label: esc(s.label), hints: s.hints, jawab: kunci[s.kunci] };
    });
  }
  return {
    limas: b,
    ts: ts,
    tinggi: langkah(DATA.verifikasi.langkahTinggi),
    jumlah: langkah(DATA.verifikasi.langkahJumlah),
    rumus: langkah(DATA.verifikasi.langkahRumus),
  };
})();

/* Gambar 3D limas persegi berukuran sebanding dengan garis tinggi TO & TP. */
function gambarLimasTinggi(b, skala) {
  var r = b.s / (2 * Math.sin(Math.PI / b.n));
  var model = modelLimas(b.n, { r: 1, tinggi: b.t / r });
  return buildPrismSVG(
    model,
    { azimut: -25, elevasi: 20 },
    {
      skala: skala || 80,
      garis: garisTinggiLimas(model),
      aria: b.nama + ' dengan garis tinggi limas TO dan tinggi sisi tegak TP',
    }
  );
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

  /* Tahap 3 — membuka lampion */
  lab: null,
  isianSisi: null,
  bongkarOrders: {},
  bongkarPilih: {},

  /* Tahap 4 — susun sisi tegak */
  susun: {},
  isianSusun: null,
  susunOrders: {},
  susunPilih: {},

  /* Tahap 5 — mengolah data */
  isianData: null,
  konsepOrders: {},
  konsepPilih: {},
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 6 — pembuktian */
  verifSteps: {},
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

function ensureObject(key) {
  if (!isPlainObject(State[key])) State[key] = {};
}

/* Urutan acak opsi untuk setiap pertanyaan penuntun dalam `list`. */
function ensureGuidedOrders(orderKey, pilihKey, list) {
  ensureObject(orderKey);
  ensureObject(pilihKey);
  list.forEach(function (q) {
    ensureShuffledOrder(State[orderKey], q.id, q.opsi);
  });
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
  ensureLplLabState(State, 'lab', LAB_OPTS);
  ensureLpIsianState(State, 'isianSisi', KARTU_SISI);
  ensureGuidedOrders('bongkarOrders', 'bongkarPilih', DATA.bongkar.tanya);

  /* Tahap 4 */
  ensureSusunLimasState(State, 'susun', DATA.susun.limasIds);
  ensureLpIsianState(State, 'isianSusun', KARTU_SUSUN_LIST);
  ensureGuidedOrders('susunOrders', 'susunPilih', DATA.susun.tanya);

  /* Tahap 5 */
  ensureLpIsianState(State, 'isianData', KARTU_DATA);
  ensureGuidedOrders('konsepOrders', 'konsepPilih', DATA.olah.konsep);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.olah.opsiKlas);

  /* Tahap 6 */
  ensureObject('verifSteps');
  VERIF.tinggi.concat(VERIF.jumlah, VERIF.rumus).forEach(function (s) {
    if (!isPlainObject(State.verifSteps[s.id])) State.verifSteps[s.id] = makeDlStep();
  });
  ensureExerciseArray(State, 'verifExercises', DATA.verifikasi.soal, function (q) {
    return { chosen: null, correct: false, optionOrder: shuffleArray(optionIds(q.options)) };
  });

  /* Tahap 7 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);
  ensureObject('simpulanPilihan');

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
      optionOrder: q.options ? shuffleArray(optionIds(q.options)) : null,
    };
  });
  if (State.terapkanIdx >= DATA.terapkan.soal.length || State.terapkanIdx < 0) {
    State.terapkanIdx = 0;
  }

  /* Tahap 9 */
  ensureShuffledOrder(State, 'refleksiDiriOrder', DATA.refleksi.diriOpsi);
  ensureObject('refleksiAnswers');
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

function daftarTemuan(teks) {
  return (
    '<div style="margin-top:var(--space-4);">' + buildFeedbackBox('success', '🔎', teks) + '</div>'
  );
}

function paragrafInfo(teks) {
  return buildDlPanel('<p style="margin:0;">' + esc(teks) + '</p>', 'panel--info');
}

function semuaKartuBenar(list, stMap) {
  return list.every(function (k) {
    return lpKartuBenar(k, stMap[k.id]);
  });
}

function banyakKartuBenar(list, stMap) {
  return list.filter(function (k) {
    return lpKartuBenar(k, stMap[k.id]);
  }).length;
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
      '<h2 style="margin-top:0;">🏮 ' +
        esc(D.judul) +
        '</h2>' +
        '<p class="stimulasi-cerita">' +
        esc(D.cerita) +
        '</p>' +
        '<div class="lpp-galeri">' +
        LAB_OPTS.limas
          .map(function (b) {
            var j = lplJaring(b);
            return (
              '<figure class="lpp-galeri__item">' +
              '<div class="psm-stage psm-stage--fold">' +
              buildFoldSVG(j, 1, { skala: lppSkala(j, 150), aria: b.nama + ': ' + b.bentuk }) +
              '</div>' +
              '<figcaption>' +
              esc(b.nama) +
              '<span>' +
              esc(b.bentuk) +
              '</span></figcaption></figure>'
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
      var f = container.querySelector('[data-opt-id="' + btn.dataset.optId + '"]');
      if (f) f.focus();
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
    paragrafInfo(D.pengantar) +
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
      navigateTo('bongkar');
    });
  }
}

/* ============================================================
   7. STAGE: MEMBUKA LAMPION  (Discovery Learning — sintaks 3)
   Lab Bentang (lipat–buka, ketuk sisi) → kartu luas tiap sisi →
   pertanyaan penuntun.
   ============================================================ */

function renderBongkar(container) {
  var D = DATA.bongkar;
  var labOk = lplLabSelesai(State.lab, LIMAS_TABEL);
  var kartuOk = labOk && semuaKartuBenar(KARTU_SISI, State.isianSisi);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.bongkarPilih);

  function rerender() {
    renderBongkar(container);
  }

  var html =
    '<section aria-label="Mengumpulkan Data: Membuka Lampion">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🔬 Lab Bentang</h3>' +
        buildLplNetLab('labB', State.lab, LAB_OPTS) +
        (labOk ? '' : '<p class="dl-caption" style="margin-bottom:0;">' + esc(D.syaratLab) + '</p>')
    );

  if (labOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">🧮 Hitung luas kertas</h3>' +
        '<p>' +
        esc(D.instruksiTabel) +
        '</p>' +
        buildLpIsian('isB', KARTU_SISI, State.isianSisi)
    );
  }

  if (kartuOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">🔎 Apa yang kamu temukan?</h3>' +
        buildGuidedQuizList(D.tanya, State.bongkarOrders, State.bongkarPilih)
    );
  }

  html +=
    (kartuOk && tanyaOk ? buildDlNextButton('bongkarNextBtn', D.nextLabel, true) : '') +
    '</section>';

  container.innerHTML = html;

  bindLplNetLab(container, 'labB', State.lab, LAB_OPTS, function () {
    saveState();
    if (!labOk && lplLabSelesai(State.lab, LIMAS_TABEL)) {
      var fokus = document.activeElement && document.activeElement.getAttribute('data-lpl-sisi');
      rerender();
      var f = fokus
        ? container.querySelector('[data-lpl-sisi="' + fokus + '"]')
        : container.querySelector('#labB [data-lpl-play="0"]');
      if (f) f.focus();
    }
  });
  bindLpIsian(container, 'isB', KARTU_SISI, State.isianSisi, saveState, rerender);
  bindGuidedQuizList(container, D.tanya, State.bongkarPilih, saveState, rerender);
  bindNext('bongkarNextBtn', 'bongkar', 'susun');
}

/* ============================================================
   8. STAGE: SUSUN SISI TEGAK  (Discovery Learning — sintaks 3)
   Kipas sisi tegak → jajargenjang/trapesium → kartu ukuran →
   pertanyaan penuntun.
   ============================================================ */

function renderSusun(container) {
  var D = DATA.susun;
  var kartuOk = semuaKartuBenar(KARTU_SUSUN_LIST, State.isianSusun);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.susunPilih);

  function rerender() {
    renderSusun(container);
  }

  var html =
    '<section aria-label="Mengumpulkan Data: Susun Sisi Tegak">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    LIMAS_SUSUN.map(function (b) {
      var st = State.susun[b.id];
      return buildDlPanel(
        '<h3 style="margin-top:0;">' +
          esc(b.nama) +
          ' <span class="lpp-sub">· ' +
          esc(b.bentuk) +
          ', ' +
          b.n +
          ' sisi tegak</span></h3>' +
          buildLplSusun('sz-' + b.id, b, st) +
          (st.pernah
            ? '<div style="margin-top:var(--space-4);">' +
              buildLpIsian('isS-' + b.id, [KARTU_SUSUN[b.id]], State.isianSusun) +
              '</div>'
            : '')
      );
    }).join('');

  if (kartuOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">🔎 Apa yang kamu temukan?</h3>' +
        buildGuidedQuizList(D.tanya, State.susunOrders, State.susunPilih) +
        (tanyaOk ? daftarTemuan(esc(D.temuan)) : '')
    );
  }

  html +=
    (kartuOk && tanyaOk ? buildDlNextButton('susunNextBtn', D.nextLabel, true) : '') + '</section>';

  container.innerHTML = html;

  LIMAS_SUSUN.forEach(function (b) {
    bindLplSusun(container, 'sz-' + b.id, b, State.susun[b.id], function (pertama) {
      saveState();
      if (pertama) {
        rerender();
        var btn = container.querySelector('#sz-' + b.id + ' [data-lpl-susun-play="0"]');
        if (btn) btn.focus();
      }
    });
    bindLpIsian(
      container,
      'isS-' + b.id,
      [KARTU_SUSUN[b.id]],
      State.isianSusun,
      saveState,
      rerender
    );
  });
  bindGuidedQuizList(container, D.tanya, State.susunPilih, saveState, rerender);
  bindNext('susunNextBtn', 'susun', 'olah');
}

/* ============================================================
   9. STAGE: MENGOLAH DATA  (Discovery Learning — sintaks 4)
   A. Kartu data tiga limas. B. Pertanyaan pola. C. Pilah kartu.
   ============================================================ */

function renderOlah(container) {
  var D = DATA.olah;
  var dataOk = semuaKartuBenar(KARTU_DATA, State.isianData);
  var konsepOk = guidedQuizAllCorrect(D.konsep, State.konsepPilih);
  var pilahOk = sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);

  function rerender() {
    renderOlah(container);
  }

  var html =
    '<section aria-label="Mengolah Data">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">A. Kartu data tiga benda</h3>' +
        '<p>' +
        esc(D.instruksiData) +
        '</p>' +
        buildLpIsian('isD', KARTU_DATA, State.isianData)
    );

  if (dataOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">B. Temukan polanya</h3>' +
        '<p>' +
        esc(D.instruksiPola) +
        '</p>' +
        buildGuidedQuizList(D.konsep, State.konsepOrders, State.konsepPilih)
    );
  }

  if (dataOk && konsepOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">C. Pilah bagian perhitungan</h3>' +
        '<p>' +
        esc(D.instruksiPilah) +
        '</p>' +
        buildSortItems(PILAH_ITEMS, State.pilahOrder, D.opsiKlas, State.pilahStates) +
        (pilahOk
          ? daftarTemuan(
              '<strong>' +
                sortItemsCorrectCount(PILAH_ITEMS, State.pilahStates) +
                ' dari ' +
                PILAH_ITEMS.length +
                ' kartu</strong> kamu pilah dengan tepat. ' +
                esc(D.temuan)
            )
          : '')
    );
  }

  html +=
    (dataOk && konsepOk && pilahOk ? buildDlNextButton('olahNextBtn', D.nextLabel, true) : '') +
    '</section>';

  container.innerHTML = html;

  bindLpIsian(container, 'isD', KARTU_DATA, State.isianData, saveState, rerender);
  bindGuidedQuizList(container, D.konsep, State.konsepPilih, saveState, rerender);
  bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  bindNext('olahNextBtn', 'olah', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   Langkah awal: tₛ dengan Pythagoras. A. Cara 1: jumlahkan semua
   sisi. B. Cara 2: dugaan rumus. C. Tanggapi miskonsepsi.
   ============================================================ */

function langkahSelesai(list) {
  return list.every(function (s) {
    return State.verifSteps[s.id].done;
  });
}

function verifSoalSemuaDijawab() {
  return State.verifExercises.every(function (e) {
    return !!e.chosen;
  });
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var tinggiOk = langkahSelesai(VERIF.tinggi);
  var jumlahOk = tinggiOk && langkahSelesai(VERIF.jumlah);
  var rumusOk = jumlahOk && langkahSelesai(VERIF.rumus);

  function rerender() {
    renderVerifikasi(container);
  }

  var html =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(VERIF.limas.nama) +
        '</h3>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<div class="psm-stage lpp-stage lpl-verif-gambar">' +
        gambarLimasTinggi(VERIF.limas, 110) +
        '</div>' +
        '<p class="dl-caption">Garis merah TO = tinggi limas (' +
        lppAngka(VERIF.limas.t) +
        ' cm). Garis hijau TP = tinggi segitiga sisi tegak (tₛ). O pusat alas, P tengah rusuk alas.</p>'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.instruksiTinggi) +
        '</h3>' +
        VERIF.tinggi
          .map(function (s, i) {
            return buildDlStep('vt' + s.id, State.verifSteps[s.id], s, i + 1);
          })
          .join('')
    );

  if (tinggiOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">A. ' +
        esc(D.instruksiJumlah) +
        '</h3>' +
        VERIF.jumlah
          .map(function (s, i) {
            return buildDlStep('vj' + s.id, State.verifSteps[s.id], s, i + 1);
          })
          .join('')
    );
  }

  if (jumlahOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">B. ' +
        esc(D.instruksiRumus) +
        '</h3>' +
        VERIF.rumus
          .map(function (s, i) {
            return buildDlStep('vr' + s.id, State.verifSteps[s.id], s, i + 1);
          })
          .join('') +
        (rumusOk ? daftarTemuan('<strong>' + esc(D.temuanSama) + '</strong>') : '')
    );
  }

  if (rumusOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">C. Tanggapi pendapat teman</h3>' +
        '<p>' +
        esc(D.instruksiMiskonsepsi) +
        '</p>' +
        D.soal
          .map(function (q, i) {
            var ex = State.verifExercises[i];
            return (
              '<div class="quiz-item">' +
              '<p class="exercise-label"><span class="dl-step__num">' +
              (i + 1) +
              '</span>' +
              esc(q.teks) +
              '</p>' +
              buildChoiceGroup(q.options, ex.optionOrder, {
                chosen: ex.chosen,
                correctId: q.correct,
                grade: true,
                locked: true,
                group: q.id,
                attr: 'data-verif-opt',
              }) +
              (ex.chosen
                ? '<div style="margin-top:var(--space-2);">' +
                  buildFeedbackBox(
                    ex.correct ? 'success' : 'error',
                    ex.correct ? '✓' : '✗',
                    (ex.correct ? '<strong>Tepat.</strong> ' : '<strong>Belum tepat.</strong> ') +
                      esc(q.explanation)
                  ) +
                  '</div>'
                : '') +
              '</div>'
            );
          })
          .join('')
    );
  }

  html +=
    (rumusOk && verifSoalSemuaDijawab()
      ? buildDlNextButton('verifNextBtn', D.nextLabel, true)
      : '') + '</section>';

  container.innerHTML = html;

  VERIF.tinggi.forEach(function (s) {
    bindDlStep('vt' + s.id, State.verifSteps[s.id], s, saveState, rerender);
  });
  VERIF.jumlah.forEach(function (s) {
    bindDlStep('vj' + s.id, State.verifSteps[s.id], s, saveState, rerender);
  });
  VERIF.rumus.forEach(function (s) {
    bindDlStep('vr' + s.id, State.verifSteps[s.id], s, saveState, rerender);
  });

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

function buildRangkumanVisual() {
  var b = LIMAS_TABEL;
  var m = ukuranLimas(b);
  return (
    '<div class="lpp-rangkum">' +
    '<figure><figcaption>Jaring-jaring ' +
    esc(b.bentuk) +
    '</figcaption>' +
    '<div class="psm-stage psm-stage--net lpp-stage">' +
    jaringKecil(b, 240) +
    '</div></figure>' +
    '<div class="lpp-rumus" aria-label="Rumus luas permukaan limas">' +
    '<p class="lpp-rumus__baris"><span class="lpp-rumus__alas">La</span> + <span class="lpp-rumus__selimut">½ × K × tₛ</span></p>' +
    '<p class="dl-caption">Contoh lampion persegi: ' +
    lppAngka(m.u.luas) +
    ' + ½ × ' +
    lppAngka(m.u.keliling) +
    ' × ' +
    lppAngka(b.ts) +
    ' = ' +
    lppAngka(m.lp) +
    ' cm²</p>' +
    '</div>' +
    '</div>'
  );
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
          ? '<p class="dl-simpulan-item__note">Belum tepat. Ingat kembali temuanmu, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  var dugaan = State.stimulasiPilihan;

  container.innerHTML =
    '<section aria-label="Menarik Kesimpulan">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    buildDlPanel(
      kalimatHTML +
        (benarSemua
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah rumus yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Luas Permukaan Limas</h3>' +
            buildRangkumanVisual() +
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
        ) +
        (dugaan && D.tanggapanDugaan[dugaan]
          ? buildDlPanel(
              '<h3 style="margin-top:0;">' +
                esc(D.dugaanJudul) +
                '</h3>' +
                '<p class="dl-caption">Dugaanmu di tahap Stimulasi: “' +
                esc(findOptionLabel(DATA.stimulasi.opsi, dugaan)) +
                '”</p>' +
                buildFeedbackBox(
                  dugaan === 'jumlah' ? 'success' : 'info',
                  '🔁',
                  esc(D.tanggapanDugaan[dugaan])
                )
            )
          : '') +
        buildDlNextButton('simpulanNextBtn', D.nextLabel, true)
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
   createExerciseStage (shared/engine.js) dengan soal campuran
   'input' (isian bilangan bulat, boleh berpemisah ribuan) dan
   'choice' (opsi diacak lewat ex.optionOrder di initExerciseArrays()).
   ============================================================ */

/* Diagnosa isian luas permukaan (hanya soal yang menanyakan LP dari La, K, tₛ). */
function diagnosaTerapkan(s, ex) {
  var c = s.cek;
  var parsed = parseInputInt(ex.userInput, true);
  if (parsed.error || c.cari || c.hargaPerCm2 || c.rincian) return null;
  var d = diagnosaLuasPermukaanLimas(c, parsed.value);
  return d.kode === 'benar' ? null : d.pesan;
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
  stripPunctuation: true,
  checkValue: function (s) {
    return s.jawab;
  },
  inputAriaLabel: 'Jawaban',
  inputPlaceholder: 'Jawaban',
  inputSuffix: function (s) {
    return '<span class="lpp-satuan">' + esc(s.satuan) + '</span>';
  },
  invalidMessage: 'Masukkan sebuah bilangan bulat (contoh: 80 atau 1.440).',
  inputErrorHTML: function (s, ex) {
    var pesan = diagnosaTerapkan(s, ex);
    return buildFeedbackBox(
      'error',
      '✗',
      'Jawaban <strong>' +
        esc(ex.userInput) +
        '</strong> belum tepat. ' +
        esc(pesan || 'Periksa lagi perhitunganmu atau buka petunjuk.')
    );
  },
  revealText: function (s) {
    return (
      'Jawabannya <strong>' +
      esc(formatNumber(s.jawab)) +
      ' ' +
      esc(s.satuan) +
      '</strong>. ' +
      esc(s.explanation)
    );
  },
  renderPrompt: function (s) {
    var pilihan = (s.type || 'choice') === 'choice';
    return (
      '<div class="dl-prompt">' +
      '<span class="konteks-chip">' +
      esc(s.konteks) +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
      '<p class="dl-prompt__tanya">' +
      esc(s.pertanyaan) +
      '</p>' +
      (pilihan && s.hints && s.hints.length
        ? '<details class="lpp-hint"><summary>💡 Petunjuk</summary><ul>' +
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
  var susunBenar = banyakKartuBenar(KARTU_SUSUN_LIST, State.isianSusun);
  var dataBenar = banyakKartuBenar(KARTU_DATA, State.isianData);
  var pilahBenar = sortItemsCorrectCount(PILAH_ITEMS, State.pilahStates);
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
        kartu(susunBenar + '/' + KARTU_SUSUN_LIST.length, 'Susunan sisi tegak diukur') +
        kartu(dataBenar + '/' + KARTU_DATA.length, 'Kartu data lengkap') +
        kartu(pilahBenar + '/' + PILAH_ITEMS.length, 'Kartu dipilah tepat') +
        kartu(verifBenar + '/' + DATA.verifikasi.soal.length, 'Miskonsepsi ditanggapi tepat') +
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
      var f = container.querySelector('[data-opt-id="' + btn.dataset.optId + '"]');
      if (f) f.focus();
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
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">▢</span>luas alas (sekali)</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">△△</span>½ × keliling alas × tₛ</div>' +
    '<div class="sajian-card sajian-card--utama"><span class="sajian-card__ikon" aria-hidden="true">🏮</span>LP = La + ½ × K × tₛ</div>' +
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
    'Kemampuan murid menjelaskan asal rumus (satu sisi alas dan susunan sisi tegak), membedakan tinggi limas dengan tₛ, serta menghitung luas permukaan benda nyata tetap menjadi bahan penilaian utama.' +
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
  bongkar: renderBongkar,
  susun: renderSusun,
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
