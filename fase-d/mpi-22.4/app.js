'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Volume Prisma
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
   bagian 47 (ensureLpIsianState, buildLpIsian, bindLpIsian,
   lpKartuBenar, ukuranAlasPrisma, lppAngka), serta komponen volume
   prisma bagian 54 (volumePrisma, kandidatVolumePrisma,
   diagnosaVolumePrisma, pengecohVolume, VPR_PESAN, vprSVG,
   buildVpPrismaSVG, ensureVpTumpukState, buildVpTumpukLab,
   bindVpTumpukLab, vpTumpukSelesai, ensureVpBelahState, buildVpBelah,
   bindVpBelah).

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
    7. Stage: Kubus Satuan         (DL sintaks 3)
    8. Stage: Belah & Lapisan      (DL sintaks 3)
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
  'kubus',
  'lapisan',
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
  'Kubus',
  'Lapisan',
  'Olah',
  'Bukti',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-22-4-volume-prisma-v1';

var PRISMA_BY_ID = {};
DATA.prisma.forEach(function (p) {
  PRISMA_BY_ID[p.id] = p;
});

function daftarPrisma(ids) {
  return ids.map(function (id) {
    return PRISMA_BY_ID[id];
  });
}

var LAB_KUBUS = { prisma: daftarPrisma(DATA.kubus.lab) };
var LAB_LAPIS = { prisma: daftarPrisma(DATA.lapisan.lab) };
var PRISMA_OLAH = daftarPrisma(DATA.olah.prismaIds);
var BELAH = DATA.lapisan.belah;

/* Ringkasan ukuran satu prisma. */
function ukuranPrisma(p) {
  var u = ukuranAlasPrisma(p.alas);
  var o = {
    luasAlas: u.luas,
    kelilingAlas: u.keliling,
    tinggi: p.t,
    adaSetengah: !!p.adaSetengah,
  };
  return { u: u, o: o, v: volumePrisma(u.luas, p.t) };
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

/* Pengecoh luas alas: lupa ½ dan tertukar keliling. */
function pengecohLuasAlas(p, m) {
  var list = [];
  if (p.adaSetengah) {
    list.push({
      nilai: 2 * m.u.luas,
      pesan:
        'Hasilmu dua kali lipat. Jangan lupa ½: luas segitiga = ½ × alas × tinggi, luas trapesium = ½ × (jumlah sisi sejajar) × tinggi.',
    });
  }
  list.push({
    nilai: m.u.keliling,
    pesan: 'Itu keliling alas. Luas menghitung daerah di dalamnya, bukan panjang tepinya.',
  });
  return saringPengecoh(list, m.u.luas);
}

function pengecohV(m) {
  return saringPengecoh(pengecohVolume(m.o), m.v);
}

/* Tahap 3 — kartu kubus satuan satu balok. */
function buatKartuKubus(p) {
  var m = ukuranPrisma(p);
  var pj = m.u.sisi[0];
  var lb = m.u.sisi[1];
  return {
    id: 'kubus-' + p.id,
    judul: p.nama + ' · ' + p.info,
    hints: [
      'Satu lapisan berisi ' + lppAngka(lb) + ' baris, setiap baris ' + lppAngka(pj) + ' kubus.',
      'Banyak lapisan = berapa kali kamu menekan “+ 1 lapis” sampai penuh.',
      'Banyak kubus seluruhnya = kubus satu lapisan × banyak lapisan.',
    ],
    fields: [
      {
        id: 'lapis1',
        label: 'Banyak kubus dalam satu lapisan',
        jawab: m.u.luas,
        satuan: 'kubus',
        pengecoh: saringPengecoh(
          [
            {
              nilai: m.u.keliling,
              pesan:
                'Itu banyak kubus di sepanjang tepi alas (keliling). Hitung SEMUA kubus di satu lapisan: baris × kolom.',
            },
            {
              nilai: pj + lb,
              pesan:
                'Panjang dan lebar dijumlahkan. Satu lapisan berisi (banyak baris) × (kubus per baris).',
            },
          ],
          m.u.luas
        ),
      },
      { id: 'lapisan', label: 'Banyak lapisan sampai penuh', jawab: p.t, satuan: 'lapisan' },
      {
        id: 'total',
        label: '<strong>Banyak kubus seluruhnya</strong>',
        jawab: m.v,
        satuan: 'kubus',
        pengecoh: saringPengecoh(
          [
            {
              nilai: m.u.luas + p.t,
              pesan:
                'Isi satu lapisan ditambah banyak lapisan. Setiap lapisan berisi ' +
                lppAngka(m.u.luas) +
                ' kubus, jadi kalikan dengan banyak lapisan.',
            },
            { nilai: m.u.luas, pesan: 'Itu baru satu lapisan. Kotaknya berisi beberapa lapisan.' },
          ],
          m.v
        ),
      },
      {
        id: 'la',
        label: 'Luas alas kotak <span class="lpp-cara">(' + esc(p.caraLuasAlas) + ')</span>',
        jawab: m.u.luas,
        satuan: 'cm²',
        pengecoh: pengecohLuasAlas(p, m),
      },
    ],
    temuan:
      'Kubus satu lapisan (' +
      lppAngka(m.u.luas) +
      ') = luas alas (' +
      lppAngka(m.u.luas) +
      ' cm²); banyak lapisan (' +
      p.t +
      ') = tinggi (' +
      p.t +
      ' cm). Volume ' +
      esc(p.nama.replace(/^\S+\s/, '').toLowerCase()) +
      ' = ' +
      lppAngka(m.v) +
      ' cm³.',
  };
}

/* Tahap 4A — kartu balok dibelah dua. */
function buatKartuBelah(b) {
  var vBalok = b.p * b.l * b.t;
  var la = (b.p * b.l) / 2;
  return {
    id: 'belah',
    judul: DATA.lapisan.kartuBelahJudul,
    hints: DATA.lapisan.hintsBelah,
    fields: [
      {
        id: 'vbalok',
        label:
          'Volume balok utuh <span class="lpp-cara">(' +
          b.p +
          ' × ' +
          b.l +
          ' × ' +
          b.t +
          ')</span>',
        jawab: vBalok,
        satuan: 'cm³',
        pengecoh: [
          {
            nilai: b.p + b.l + b.t,
            pesan: 'Ukuran dijumlahkan. Volume balok = panjang × lebar × tinggi.',
          },
        ],
      },
      {
        id: 'vsatu',
        label: 'Volume satu prisma segitiga',
        jawab: vBalok / 2,
        satuan: 'cm³',
        pengecoh: [
          {
            nilai: vBalok,
            pesan: 'Itu volume balok utuh. Balok terbelah menjadi DUA prisma yang sama besar.',
          },
        ],
      },
      {
        id: 'la',
        label: 'Luas alas segitiga <span class="lpp-cara">(½ × ' + b.p + ' × ' + b.l + ')</span>',
        jawab: la,
        satuan: 'cm²',
        pengecoh: saringPengecoh(
          [
            {
              nilai: b.p * b.l,
              pesan: 'Lupa ½. Segitiga ini setengah dari persegi panjang alas balok.',
            },
            {
              nilai: b.p + b.l,
              pesan: 'Sisi siku-siku dijumlahkan. Luas segitiga = ½ × alas × tinggi.',
            },
          ],
          la
        ),
      },
      {
        id: 'lat',
        label: 'Luas alas segitiga × tinggi prisma',
        jawab: la * b.t,
        satuan: 'cm³',
        pengecoh: saringPengecoh(
          [{ nilai: la + b.t, pesan: 'Luas alas dan tinggi dijumlahkan. Keduanya dikalikan.' }],
          la * b.t
        ),
      },
    ],
    temuan:
      '<strong>Sama!</strong> Volume prisma segitiga = ½ × ' +
      lppAngka(vBalok) +
      ' = ' +
      lppAngka(vBalok / 2) +
      ' cm³ = luas alas × tinggi = ' +
      lppAngka(la) +
      ' × ' +
      b.t +
      '.',
  };
}

/* Tahap 4B — kartu lapisan satu wadah. */
function buatKartuLapis(p) {
  var m = ukuranPrisma(p);
  return {
    id: 'lapis-' + p.id,
    judul: p.nama + ' · ' + p.bentuk,
    visual: '<p class="dl-caption" style="margin:0;">Alas: ' + esc(p.infoAlas) + '.</p>',
    hints: [
      'Luas alas = ' + p.caraLuasAlas + '.',
      'Setiap lapisan setebal 1 cm, jadi isinya = luas alas × 1.',
      'Volume = isi satu lapisan × banyak lapisan.',
    ],
    fields: [
      {
        id: 'la',
        label: 'Luas alas <span class="lpp-cara">(' + esc(p.caraLuasAlas) + ')</span>',
        jawab: m.u.luas,
        satuan: 'cm²',
        pengecoh: pengecohLuasAlas(p, m),
      },
      {
        id: 'vlapis',
        label: 'Isi satu lapisan setebal 1 cm',
        jawab: m.u.luas,
        satuan: 'cm³',
        pengecoh: saringPengecoh(
          [
            {
              nilai: m.u.keliling,
              pesan: 'Itu keliling alas. Isi lapisan ditentukan oleh LUAS alas × 1 cm.',
            },
          ],
          m.u.luas
        ),
      },
      { id: 'lapisan', label: 'Banyak lapisan sampai penuh', jawab: p.t, satuan: 'lapisan' },
      {
        id: 'v',
        label: '<strong>Volume wadah</strong>',
        jawab: m.v,
        satuan: 'cm³',
        pengecoh: pengecohV(m),
      },
    ],
  };
}

/* Tahap 5 — kartu data satu wadah. */
function buatKartuData(p) {
  var m = ukuranPrisma(p);
  return {
    id: 'data-' + p.id,
    judul: p.nama + ' · ' + p.bentuk,
    visual:
      '<div class="vpr-data-visual">' +
      buildVpPrismaSVG(p.alas, p.t, { lebar: 180, aria: p.nama + ': ' + p.bentuk }) +
      '<p class="dl-caption">Alas: ' +
      esc(p.infoAlas) +
      '.</p></div>',
    hints: [
      'Luas alas = ' + p.caraLuasAlas + '.',
      'Volume = isi satu lapisan × banyak lapisan (lihat hasilmu di Lab Tumpuk).',
      'Bagi volume dengan luas alas, lalu bandingkan dengan tinggi prisma.',
    ],
    fields: [
      {
        id: 'la',
        label: 'Luas alas (La)',
        jawab: m.u.luas,
        satuan: 'cm²',
        pengecoh: pengecohLuasAlas(p, m),
      },
      { id: 't', label: 'Tinggi prisma (t)', jawab: p.t, satuan: 'cm', diberikan: true },
      {
        id: 'v',
        label: 'Volume (V)',
        jawab: m.v,
        satuan: 'cm³',
        pengecoh: pengecohV(m),
      },
      {
        id: 'bagi',
        label: 'V ÷ La',
        jawab: p.t,
        satuan: 'cm',
        pengecoh: saringPengecoh(
          [{ nilai: m.v * m.u.luas, pesan: 'Itu V × La. Bagilah volume dengan luas alas.' }],
          p.t
        ),
      },
    ],
  };
}

var KARTU_KUBUS = LAB_KUBUS.prisma.map(buatKartuKubus);
var KARTU_BELAH = [buatKartuBelah(BELAH)];
var KARTU_LAPIS = LAB_LAPIS.prisma.map(buatKartuLapis);
var KARTU_DATA = PRISMA_OLAH.map(buatKartuData);

/* Butir pemilahan (teks dari DATA). */
var PILAH_ITEMS = DATA.olah.pilah.map(function (it) {
  return {
    id: it.id,
    correct: it.correct,
    explanation: esc(it.explanation),
    teks: esc(it.teks),
  };
});

/* Langkah pembuktian: kunci dihitung ulang dari ukuran wadah beras. */
var VERIF = (function () {
  var p = DATA.verifikasi.prisma;
  var u = ukuranAlasPrisma(p.alas);
  var vBungkus = p.bungkus.p * p.bungkus.l * p.t;
  var kunci = {
    vBungkus: vBungkus,
    vSetengah: vBungkus / 2,
    luasAlas: u.luas,
    rumus: volumePrisma(u.luas, p.t),
  };
  function langkah(list) {
    return list.map(function (s) {
      return { id: s.id, label: esc(s.label), hints: s.hints, jawab: kunci[s.kunci] };
    });
  }
  return {
    prisma: p,
    balok: langkah(DATA.verifikasi.langkahBalok),
    rumus: langkah(DATA.verifikasi.langkahRumus),
  };
})();

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

  /* Tahap 3 — kubus satuan */
  labKubus: null,
  isianKubus: null,
  kubusOrders: {},
  kubusPilih: {},

  /* Tahap 4 — belah & lapisan */
  belah: null,
  isianBelah: null,
  labLapis: null,
  isianLapis: null,
  lapisOrders: {},
  lapisPilih: {},

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
  ensureVpTumpukState(State, 'labKubus', LAB_KUBUS);
  ensureLpIsianState(State, 'isianKubus', KARTU_KUBUS);
  ensureGuidedOrders('kubusOrders', 'kubusPilih', DATA.kubus.tanya);

  /* Tahap 4 */
  ensureVpBelahState(State, 'belah');
  ensureLpIsianState(State, 'isianBelah', KARTU_BELAH);
  ensureVpTumpukState(State, 'labLapis', LAB_LAPIS);
  ensureLpIsianState(State, 'isianLapis', KARTU_LAPIS);
  ensureGuidedOrders('lapisOrders', 'lapisPilih', DATA.lapisan.tanya);

  /* Tahap 5 */
  ensureLpIsianState(State, 'isianData', KARTU_DATA);
  ensureGuidedOrders('konsepOrders', 'konsepPilih', DATA.olah.konsep);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.olah.opsiKlas);

  /* Tahap 6 */
  ensureObject('verifSteps');
  VERIF.balok.concat(VERIF.rumus).forEach(function (s) {
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

/*
 * Callback lab tumpuk: simpan, lalu render ulang tahap saat sebuah wadah
 * pertama kali penuh agar kartu isian muncul. Fokus dikembalikan ke lab.
 */
function onLabTumpuk(labId, rerender, container) {
  return function (jenis) {
    saveState();
    if (jenis !== 'penuh') return;
    rerender();
    var f = container.querySelector('#' + labId + ' [data-vpr-n]');
    if (f) f.focus();
  };
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
      '<h2 style="margin-top:0;">🏪 ' +
        esc(D.judul) +
        '</h2>' +
        '<p class="stimulasi-cerita">' +
        esc(D.cerita) +
        '</p>' +
        '<div class="lpp-galeri">' +
        daftarPrisma(D.galeri)
          .map(function (p) {
            return (
              '<figure class="lpp-galeri__item">' +
              '<div class="psm-stage vpr-stage">' +
              buildVpPrismaSVG(p.alas, p.t, { lebar: 160, aria: p.nama + ': ' + p.bentuk }) +
              '</div>' +
              '<figcaption>' +
              esc(p.nama) +
              '<span>' +
              esc(p.bentuk) +
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
      navigateTo('kubus');
    });
  }
}

/* ============================================================
   7. STAGE: KUBUS SATUAN  (Discovery Learning — sintaks 3)
   Lab Tumpuk mode kubus → kartu isian → pertanyaan penuntun.
   ============================================================ */

function renderKubus(container) {
  var D = DATA.kubus;
  var labOk = vpTumpukSelesai(State.labKubus, LAB_KUBUS);
  var kartuOk = labOk && semuaKartuBenar(KARTU_KUBUS, State.isianKubus);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.kubusPilih);

  function rerender() {
    renderKubus(container);
  }

  var html =
    '<section aria-label="Mengumpulkan Data: Kubus Satuan">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🧊 Lab Tumpuk Kubus Satuan</h3>' +
        buildVpTumpukLab('labK', State.labKubus, LAB_KUBUS) +
        (labOk ? '' : '<p class="dl-caption" style="margin-bottom:0;">' + esc(D.syaratLab) + '</p>')
    );

  if (labOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">🧮 Catat hasil pengamatanmu</h3>' +
        '<p>' +
        esc(D.instruksiKartu) +
        '</p>' +
        buildLpIsian('isK', KARTU_KUBUS, State.isianKubus)
    );
  }

  if (kartuOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">🔎 Apa yang kamu temukan?</h3>' +
        buildGuidedQuizList(D.tanya, State.kubusOrders, State.kubusPilih) +
        (tanyaOk ? daftarTemuan(esc(D.temuan)) : '')
    );
  }

  html +=
    (kartuOk && tanyaOk ? buildDlNextButton('kubusNextBtn', D.nextLabel, true) : '') + '</section>';

  container.innerHTML = html;

  bindVpTumpukLab(
    container,
    'labK',
    State.labKubus,
    LAB_KUBUS,
    onLabTumpuk('labK', rerender, container)
  );
  bindLpIsian(container, 'isK', KARTU_KUBUS, State.isianKubus, saveState, rerender);
  bindGuidedQuizList(container, D.tanya, State.kubusPilih, saveState, rerender);
  bindNext('kubusNextBtn', 'kubus', 'lapisan');
}

/* ============================================================
   8. STAGE: BELAH & LAPISAN  (Discovery Learning — sintaks 3)
   A. Belah balok → kartu. B. Lab Tumpuk mode lapisan → kartu.
   C. Pertanyaan penuntun.
   ============================================================ */

function renderLapisan(container) {
  var D = DATA.lapisan;
  var belahOk = State.belah.pernah && semuaKartuBenar(KARTU_BELAH, State.isianBelah);
  var labOk = belahOk && vpTumpukSelesai(State.labLapis, LAB_LAPIS);
  var kartuOk = labOk && semuaKartuBenar(KARTU_LAPIS, State.isianLapis);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.lapisPilih);

  function rerender() {
    renderLapisan(container);
  }

  var html =
    '<section aria-label="Mengumpulkan Data: Belah Balok dan Lapisan">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">A. Belah balok</h3>' +
        '<p>' +
        esc(D.instruksiBelah) +
        '</p>' +
        buildVpBelah('belahB', BELAH, State.belah) +
        (State.belah.pernah
          ? '<div style="margin-top:var(--space-4);">' +
            buildLpIsian('isB', KARTU_BELAH, State.isianBelah) +
            '</div>'
          : '')
    );

  if (belahOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">B. 🥞 Lab Tumpuk Lapisan</h3>' +
        '<p>' +
        esc(D.instruksiLapis) +
        '</p>' +
        buildVpTumpukLab('labL', State.labLapis, LAB_LAPIS) +
        (labOk ? '' : '<p class="dl-caption" style="margin-bottom:0;">' + esc(D.syaratLab) + '</p>')
    );
  }

  if (labOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">🧮 Hitung isi setiap wadah</h3>' +
        buildLpIsian('isL', KARTU_LAPIS, State.isianLapis)
    );
  }

  if (kartuOk) {
    html += buildDlPanel(
      '<h3 style="margin-top:0;">🔎 Apa yang kamu temukan?</h3>' +
        buildGuidedQuizList(D.tanya, State.lapisOrders, State.lapisPilih) +
        (tanyaOk ? daftarTemuan(esc(D.temuan)) : '')
    );
  }

  html +=
    (kartuOk && tanyaOk ? buildDlNextButton('lapisanNextBtn', D.nextLabel, true) : '') +
    '</section>';

  container.innerHTML = html;

  bindVpBelah(container, 'belahB', BELAH, State.belah, function (jenis) {
    saveState();
    if (jenis !== 'pernah') return;
    rerender();
    var b = container.querySelector('#belahB [data-vpr-belah]');
    if (b) b.focus();
  });
  bindLpIsian(container, 'isB', KARTU_BELAH, State.isianBelah, saveState, rerender);
  bindVpTumpukLab(
    container,
    'labL',
    State.labLapis,
    LAB_LAPIS,
    onLabTumpuk('labL', rerender, container)
  );
  bindLpIsian(container, 'isL', KARTU_LAPIS, State.isianLapis, saveState, rerender);
  bindGuidedQuizList(container, D.tanya, State.lapisPilih, saveState, rerender);
  bindNext('lapisanNextBtn', 'lapisan', 'olah');
}

/* ============================================================
   9. STAGE: MENGOLAH DATA  (Discovery Learning — sintaks 4)
   A. Kartu data tiga wadah. B. Pertanyaan pola. C. Pilah kartu.
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
      '<h3 style="margin-top:0;">A. Kartu data tiga wadah</h3>' +
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
      '<h3 style="margin-top:0;">C. Pilah cara menghitung</h3>' +
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
   A. Cara 1: ½ kardus balok. B. Cara 2: dugaan rumus.
   C. Tanggapi miskonsepsi.
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

function gambarVerifikasi() {
  var p = VERIF.prisma;
  var b = p.bungkus;
  var kardus = [
    [0, 0],
    [b.p, 0],
    [b.p, b.l],
    [0, b.l],
  ];
  return vprSVG(
    [
      { pts: p.alas, z0: 0, z1: p.t, kelas: 'vpr-padat' },
      { pts: kardus, z0: 0, z1: p.t, kelas: 'vpr-hantu' },
    ],
    {
      lebar: 280,
      label: [vprLabelTinggi(kardus, p.t)],
      aria:
        p.nama +
        ' berbentuk prisma segitiga di dalam kardus balok ' +
        b.p +
        ' cm × ' +
        b.l +
        ' cm × ' +
        p.t +
        ' cm.',
    }
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var balokOk = langkahSelesai(VERIF.balok);
  var rumusOk = balokOk && langkahSelesai(VERIF.rumus);

  function rerender() {
    renderVerifikasi(container);
  }

  var html =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(VERIF.prisma.nama) +
        '</h3>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<div class="psm-stage vpr-stage">' +
        gambarVerifikasi() +
        '</div>'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">A. ' +
        esc(D.instruksiBalok) +
        '</h3>' +
        VERIF.balok
          .map(function (s, i) {
            return buildDlStep('vb' + s.id, State.verifSteps[s.id], s, i + 1);
          })
          .join('')
    );

  if (balokOk) {
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

  VERIF.balok.forEach(function (s) {
    bindDlStep('vb' + s.id, State.verifSteps[s.id], s, saveState, rerender);
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
  var p = PRISMA_BY_ID.camilan;
  var m = ukuranPrisma(p);
  return (
    '<div class="vpr-rangkum">' +
    '<figure><figcaption>' +
    esc(p.nama) +
    ': ' +
    p.t +
    ' lapisan</figcaption>' +
    '<div class="psm-stage vpr-stage">' +
    vprTumpukGambar(p, p.t, { lebar: 240 }) +
    '</div></figure>' +
    '<div class="vpr-rumus" aria-label="Rumus volume prisma">' +
    '<p class="vpr-rumus__baris"><span class="vpr-rumus__alas">La</span> × <span class="vpr-rumus__tinggi">t</span></p>' +
    '<p class="dl-caption">Contoh wadah camilan: ' +
    lppAngka(m.u.luas) +
    ' × ' +
    lppAngka(p.t) +
    ' = ' +
    lppAngka(m.v) +
    ' cm³</p>' +
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
          '<h3 style="margin-top:0;">Rangkuman Volume Prisma</h3>' +
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
                  dugaan === 'kubus' ? 'success' : 'info',
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

/* Diagnosa isian volume (hanya soal yang menanyakan volume langsung). */
function diagnosaTerapkan(s, ex) {
  var c = s.cek;
  var parsed = parseInputInt(ex.userInput, true);
  if (parsed.error || c.cari || c.ke) return null;
  var d = diagnosaVolumePrisma(c, parsed.value);
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
  invalidMessage: 'Masukkan sebuah bilangan bulat (contoh: 36 atau 1.000).',
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
  var kubusBenar = banyakKartuBenar(KARTU_KUBUS, State.isianKubus);
  var lapisBenar =
    banyakKartuBenar(KARTU_BELAH, State.isianBelah) +
    banyakKartuBenar(KARTU_LAPIS, State.isianLapis);
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
        kartu(kubusBenar + '/' + KARTU_KUBUS.length, 'Kotak diisi kubus satuan') +
        kartu(
          lapisBenar + '/' + (KARTU_BELAH.length + KARTU_LAPIS.length),
          'Prisma dibelah & ditumpuk'
        ) +
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
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">▦</span>isi satu lapisan = luas alas</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">☰</span>banyak lapisan = tinggi</div>' +
    '<div class="sajian-card sajian-card--utama"><span class="sajian-card__ikon" aria-hidden="true">🧊</span>V = La × t</div>' +
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
    'Kemampuan murid menjelaskan asal rumus (isi satu lapisan × banyak lapisan) serta menghitung volume benda nyata tetap menjadi bahan penilaian utama.' +
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
  kubus: renderKubus,
  lapisan: renderLapisan,
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
