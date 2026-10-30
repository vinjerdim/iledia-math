'use strict';

/* ============================================================
   app.js — Logika media pembelajaran
   Sisi & Sudut Bersesuaian, Kongruen vs Sebangun
   Fase D — SMP Kelas VIII · Topik 18 Kekongruenan dan Kesebangunan,
   Discovery Learning

   Struktur:
     1. Konstanta
     2. State & storage (+ pengacakan semua pilihan jawaban)
     3. Navigasi
     4. Utilitas render
     5–14. Renderer tiap tahap
     15. Router render
     16. Modal reset
     17. Init

   Seluruh komponen umum berasal dari shared/engine.js: kertas jiplak,
   papan ukur, gambar & tabel bangun bersesuaian (seksi 26); kunci,
   opsi & diagnosa pemasangan titik/sisi/sudut, opsi notasi, diagnosa
   klasifikasi kongruen/sebangun, soal isian sebangun, gambar pasangan
   bersorot (seksi 85); serta pilihan acak, pertanyaan penuntun,
   pemilahan, dan petunjuk berjenjang.

   Seluruh pilihan jawaban DIACAK sekali saat state disiapkan
   (initExerciseArrays) lalu urutannya disimpan di State, sehingga
   stabil saat dirender ulang tetapi teracak ulang setiap Reset.
   Urutan ubin lab, pasangan verifikasi, dan soal uji terap juga acak.
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'stimulasi',
  'masalah',
  'koleksi',
  'olahBersesuaian',
  'olahJenis',
  'verifikasi',
  'generalisasi',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Stimulasi',
  'Masalah',
  'Lab',
  'Bersesuaian',
  'Jenis',
  'Pembuktian',
  'Simpulan',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-18-1-kongruen-sebangun-v1';
var LAB = DATA.koleksi;
var JIPLAK_ID = 'labJiplak';
var SKALA_KECIL = 16; /* px per cm gambar pasangan kecil */

/* Soal uji terap & pasangan verifikasi terpilih (diisi dari State). */
var TERAP_SOAL = [];
var VERIF_PASANGAN = [];

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'stimulasi',
  completedStages: {},

  /* Tahap 1 — stimulasi (dugaan, tidak dinilai) */
  dugaanOrders: {},
  dugaanPilih: {},

  /* Tahap 2 — identifikasi masalah */
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',

  /* Tahap 3 — Lab Jiplak & Ukur */
  calonOrder: null,
  jiplak: null,
  dicoba: {},
  ukur: {},

  /* Tahap 4a — pasangan bersesuaian */
  langkahOrders: {},
  langkahJawab: {},

  /* Tahap 4a–b — pertanyaan penuntun & pemilahan */
  olahOrders: {},
  olahPilih: {},
  pilahStates: {},
  pilahOrder: null,

  /* Tahap 5 — pembuktian */
  verifPick: null,
  verifOrders: {},
  verifJawab: {},
  pernyataanStates: {},
  pernyataanOrder: null,

  /* Tahap 6 — menarik kesimpulan */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,

  /* Tahap 7 — uji terap */
  terapkanPick: null,
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

/* Pemetaan titik bersesuaian p → q, disimpan agar tidak dihitung ulang. */
var MAP_CACHE = {};

function mapOf(p, q) {
  var key = p.id + '|' + q.id;
  if (!(key in MAP_CACHE)) {
    var k = korespondensiBangun(p, q);
    MAP_CACHE[key] = k ? k.map : null;
  }
  return MAP_CACHE[key];
}

function makeJawab() {
  return { chosen: null, pilihSalah: 0 };
}

function ensureJawab(target, key) {
  if (!isObject(target[key])) target[key] = makeJawab();
  return target[key];
}

/* Opsi & kunci langkah tahap 4a (titik/sisi/sudut/notasi). */
function opsiLangkah(l) {
  if (l.jenis === 'notasi') return opsiNotasi(l.p, l.q, mapOf(l.p, l.q), l.simbol);
  return opsiBersesuaian(l.q, l.jenis);
}

function kunciLangkah(l) {
  if (l.jenis === 'notasi') return 'benar';
  return kunciBersesuaian(mapOf(l.p, l.q), l.jenis, l.i);
}

/* Kunci jawaban sebuah soal uji terap. */
function kunciSoal(s) {
  if (s.tipe === 'sisi' || s.tipe === 'sudut') {
    return kunciBersesuaian(mapOf(s.p, s.q), s.tipe, s.i);
  }
  if (s.tipe === 'jenis') return klasifikasiBangun(s.p.pts, s.q.pts);
  return s.correct;
}

/* Opsi pilihan sebuah soal; null untuk soal isian. */
function opsiSoal(s) {
  if (s.tipe === 'sisi' || s.tipe === 'sudut') return opsiBersesuaian(s.q, s.tipe);
  if (s.tipe === 'jenis') return OPSI_KLASIFIKASI;
  return s.opsi || null;
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

/* Soal uji terap diambil acak per tipe sesuai komposisi, lalu diacak. */
function pilihSoalTerap() {
  var T = DATA.terapkan;
  var pilih = [];
  Object.keys(T.komposisi).forEach(function (tipe) {
    shuffleArray(
      T.soal.filter(function (s) {
        return s.tipe === tipe;
      })
    )
      .slice(0, T.komposisi[tipe])
      .forEach(function (s) {
        pilih.push(s.id);
      });
  });
  return shuffleArray(pilih);
}

function pickValid(pick, list, banyak) {
  if (!Array.isArray(pick) || pick.length !== banyak) return false;
  var ada = optionIds(list);
  return pick.every(function (id, i) {
    return ada.indexOf(id) !== -1 && pick.indexOf(id) === i;
  });
}

function isiDariPick(target, list, pick) {
  var byId = {};
  list.forEach(function (s) {
    byId[s.id] = s;
  });
  target.length = 0;
  pick.forEach(function (id) {
    target.push(byId[id]);
  });
}

function punyaTanya(b) {
  return b.tanyaSisi !== undefined;
}

/* Pasangan verifikasi: sebagian berpertanyaan bersesuaian, sisanya klasifikasi saja. */
function pilihPasanganVerif() {
  var V = DATA.verifikasi;
  var dgn = shuffleArray(V.bank.filter(punyaTanya)).slice(0, V.ambil.bersesuaian);
  var tanpa = shuffleArray(
    V.bank.filter(function (b) {
      return !punyaTanya(b);
    })
  ).slice(0, V.ambil.klasifikasi);
  return shuffleArray(optionIds(dgn.concat(tanpa)));
}

/* Daftar pertanyaan satu pasangan verifikasi: jenis, lalu sisi & sudut. */
function tanyaVerif(b) {
  var list = [{ key: b.id + '-jenis', jenis: 'jenis' }];
  if (punyaTanya(b)) {
    list.push({ key: b.id + '-sisi', jenis: 'sisi', i: b.tanyaSisi });
    list.push({ key: b.id + '-sudut', jenis: 'sudut', i: b.tanyaSudut });
  }
  return list;
}

function opsiTanyaVerif(b, t) {
  return t.jenis === 'jenis' ? OPSI_KLASIFIKASI : opsiBersesuaian(b.q, t.jenis);
}

function kunciTanyaVerif(b, t) {
  if (t.jenis === 'jenis') return klasifikasiBangun(b.p.pts, b.q.pts);
  return kunciBersesuaian(mapOf(b.p, b.q), t.jenis, t.i);
}

/*
 * Menyiapkan seluruh state per-soal DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset, sehingga urutan stabil lintas reload tetapi
 * teracak ulang setiap Reset.
 */
function initExerciseArrays() {
  [
    'dugaanOrders',
    'dugaanPilih',
    'dicoba',
    'ukur',
    'langkahOrders',
    'langkahJawab',
    'olahOrders',
    'olahPilih',
    'verifOrders',
    'verifJawab',
    'simpulanPilihan',
    'refleksiAnswers',
  ].forEach(function (k) {
    ensureObject(State, k);
  });

  /* Tahap 1–2 */
  DATA.stimulasi.dugaan.forEach(function (q) {
    ensureShuffledOrder(State.dugaanOrders, q.id, q.opsi);
  });
  ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi);

  /* Tahap 3 — urutan ubin calon diacak */
  ensureShuffledOrder(State, 'calonOrder', LAB.calon);
  ensureJiplakState(State, 'jiplak', optionIds(LAB.calon));
  LAB.ukur.forEach(function (b) {
    ensureUkurState(State.ukur, b.id);
  });

  /* Tahap 4a */
  DATA.olahBersesuaian.langkah.forEach(function (l) {
    ensureShuffledOrder(State.langkahOrders, l.id, opsiLangkah(l));
    ensureJawab(State.langkahJawab, l.id);
  });

  /* Tahap 4a–b — pertanyaan penuntun & pemilahan */
  ['olahBersesuaian', 'olahJenis'].forEach(function (id) {
    DATA[id].pertanyaan.forEach(function (q) {
      ensureShuffledOrder(State.olahOrders, q.id, q.opsi);
    });
  });
  ensureSortStates(State, 'pilahStates', 'pilahOrder', DATA.olahJenis.pilah, OPSI_KLASIFIKASI);

  /* Tahap 5 — pasangan baru dipilih acak; opsi tiap pertanyaan diacak */
  var V = DATA.verifikasi;
  if (!pickValid(State.verifPick, V.bank, V.ambil.bersesuaian + V.ambil.klasifikasi)) {
    State.verifPick = pilihPasanganVerif();
    State.verifOrders = {};
    State.verifJawab = {};
  }
  isiDariPick(VERIF_PASANGAN, V.bank, State.verifPick);
  VERIF_PASANGAN.forEach(function (b) {
    tanyaVerif(b).forEach(function (t) {
      ensureShuffledOrder(State.verifOrders, t.key, opsiTanyaVerif(b, t));
      ensureJawab(State.verifJawab, t.key);
    });
  });
  ensureSortStates(State, 'pernyataanStates', 'pernyataanOrder', V.pernyataan, V.opsiPernyataan);

  /* Tahap 6 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);

  /* Tahap 7 — soal dipilih acak dari bank; opsi tiap soal diacak */
  var T = DATA.terapkan;
  if (!pickValid(State.terapkanPick, T.soal, T.banyak)) {
    State.terapkanPick = pilihSoalTerap();
    State.terapkanSoal = [];
    State.terapkanIdx = 0;
  }
  isiDariPick(TERAP_SOAL, T.soal, State.terapkanPick);
  ensureExerciseArray(State, 'terapkanSoal', TERAP_SOAL, makeSoalState);
  TERAP_SOAL.forEach(function (s, i) {
    var st = State.terapkanSoal[i];
    var awal = makeSoalState();
    Object.keys(awal).forEach(function (k) {
      if (st[k] === undefined) st[k] = awal[k];
    });
    var opsi = opsiSoal(s);
    if (opsi) ensureShuffledOrder(st, 'optionOrder', opsi);
  });
  if (State.terapkanIdx >= TERAP_SOAL.length || State.terapkanIdx < 0) {
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
    '<div class="formula-duo kg-istilah">' +
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

/* Dua bangun berdampingan pada skala kecil (kartu & soal). */
function gambarPasangan(p, q, opts) {
  return buildShapePair(p, q, Object.assign({ skala: SKALA_KECIL }, opts || {}));
}

/* Label opsi berdasarkan id. */
function labelOpsi(opsi, id) {
  return findOptionLabel(opsi, id) || '';
}

/* Pertanyaan pilihan satu kali benar: opsi, nilai & umpan balik. */
function buildPilihTerkunci(opsi, order, st, kunci, attr, group, umpan) {
  var benar = st.chosen === kunci;
  return (
    buildChoiceGroup(
      opsi.map(function (o) {
        return { id: o.id, label: esc(o.label) };
      }),
      order,
      {
        chosen: st.chosen,
        correctId: benar ? kunci : null,
        grade: true,
        locked: benar,
        group: group,
        attr: attr,
      }
    ) +
    (st.chosen
      ? '<div style="margin-top:var(--space-2);">' +
        buildFeedbackBox(benar ? 'success' : 'warning', benar ? '✓' : '💭', esc(umpan)) +
        '</div>'
      : '')
  );
}

/* Mencatat pilihan pada state satu-kali-benar. */
function catatPilih(st, pilih, kunci) {
  if (st.chosen === kunci) return false;
  st.chosen = pilih;
  if (pilih !== kunci) st.pilihSalah += 1;
  return true;
}

/*
 * Mengembalikan fokus keyboard ke kontrol yang setara setelah render
 * ulang (pilihan langkah, pilihan pasangan, nomor soal), agar pengguna
 * keyboard tidak terlempar ke awal halaman.
 */
var FOKUS_ATTR = ['data-dugaan-opt', 'data-langkah-opt', 'data-vb-opt', 'data-soal-idx'];

function kunciFokus() {
  var el = document.activeElement;
  if (!el || el === document.body) return null;
  if (el.id) return '#' + el.id;
  for (var i = 0; i < FOKUS_ATTR.length; i++) {
    var a = FOKUS_ATTR[i];
    if (el.hasAttribute(a)) {
      var sel = '[' + a + '="' + el.getAttribute(a) + '"]';
      if (el.dataset.group) sel += '[data-group="' + el.dataset.group + '"]';
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

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   ============================================================ */

function dugaanTerisi() {
  return DATA.stimulasi.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function renderStimulasi(container) {
  var D = DATA.stimulasi;

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">📌 ' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="kg-kartu-grid">' +
        D.kartu
          .map(function (k) {
            return (
              '<div class="kg-kartu"><span class="kg-kartu__ikon" aria-hidden="true">' +
              k.ikon +
              '</span><h3 class="kg-kartu__judul">' +
              esc(k.judul) +
              '</h3><p class="kg-kartu__teks">' +
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
      '<h3 style="margin-top:0;">Dugaanku</h3>' +
        D.dugaan
          .map(function (q, i) {
            return (
              '<div class="quiz-item">' +
              '<p class="exercise-label"><span class="dl-step__num">' +
              (i + 1) +
              '</span>' +
              esc(q.tanya) +
              '</p>' +
              gambarPasangan(q.p, q.q) +
              buildChoiceGroup(
                q.opsi.map(function (o) {
                  return { id: o.id, label: esc(o.label) };
                }),
                State.dugaanOrders[q.id],
                { chosen: State.dugaanPilih[q.id] || null, group: q.id, attr: 'data-dugaan-opt' }
              ) +
              '</div>'
            );
          })
          .join('') +
        buildFeedbackBox('info', '🔎', esc(D.catatan))
    ) +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" id="stimulasiNextBtn"' +
    (dugaanTerisi() ? '' : ' disabled') +
    '>' +
    esc(D.nextLabel) +
    '</button>' +
    '</div>' +
    '</section>';

  container.querySelectorAll('[data-dugaan-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.dugaanPilih[btn.dataset.group] = btn.dataset.dugaanOpt;
      saveState();
      var kunci = kunciFokus();
      renderStimulasi(container);
      pulihkanFokus(kunci);
    });
  });

  bindNext('stimulasiNextBtn', 'stimulasi', 'masalah');
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
      navigateTo('koleksi');
    });
  }
}

/* ============================================================
   7. STAGE: PENGUMPULAN DATA — LAB JIPLAK & UKUR  (sintaks 3)
   A: kertas jiplak pada empat ubin. B: penggaris & busur.
   ============================================================ */

function calonTerurut() {
  return orderByIds(LAB.calon, State.calonOrder);
}

/* Jiplakan sudah dicoba pada semua ubin dan berimpit pada semua ubin kongruen. */
function jiplakSelesai() {
  return LAB.calon.every(function (b) {
    var bisa = klasifikasiBangun(LAB.asal.pts, b.pts) === 'kongruen';
    return State.dicoba[b.id] && (!bisa || State.jiplak.berimpit[b.id]);
  });
}

function ukurLabSelesai() {
  return LAB.ukur.every(function (b) {
    return ukurSelesai(b, State.ukur[b.id]);
  });
}

/* Uraian cara jiplakan berimpit: diputar & / atau dibalik. */
function caraBerimpit(b) {
  var pos = cariPosisiBerimpit(LAB.asal.pts, b.pts, LAB.langkah);
  if (!pos) return '—';
  var bagian = [];
  if (pos.cermin) bagian.push('dibalik');
  if (pos.rotasi) bagian.push('diputar ' + pos.rotasi + '°');
  return bagian.length ? bagian.join(' lalu ') : 'langsung ditempel';
}

function buildTabelJiplak() {
  var k = LAB.kolom;
  return (
    '<div class="kgr-table-wrap"><table class="kgr-table">' +
    '<caption class="sr-only">' +
    esc(LAB.tabelJudul) +
    '</caption>' +
    '<thead><tr><th scope="col">' +
    esc(k[0]) +
    '</th><th scope="col">' +
    esc(k[1]) +
    '</th><th scope="col">' +
    esc(k[2]) +
    '</th></tr></thead><tbody>' +
    calonTerurut()
      .map(function (b) {
        var berimpit = !!State.jiplak.berimpit[b.id];
        var hasil = '<span class="kg-muted">belum dicoba</span>';
        if (berimpit) hasil = '<span class="kgr-ket kgr-ket--sama">✓ berimpit</span>';
        else if (State.dicoba[b.id])
          hasil = '<span class="kgr-ket kgr-ket--beda">belum berimpit</span>';
        return (
          '<tr><th scope="row">' +
          esc(b.nama) +
          '</th><td>' +
          hasil +
          '</td><td>' +
          esc(berimpit ? caraBerimpit(b) : '—') +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table></div>'
  );
}

function renderKoleksi(container) {
  var selesaiA = jiplakSelesai();
  var selesaiB = selesaiA && ukurLabSelesai();

  container.innerHTML =
    '<section aria-label="Pengumpulan Data">' +
    buildHead(LAB) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(LAB.judulA) +
        '</h3><p style="margin:0;">' +
        esc(LAB.instruksiA) +
        '</p>',
      'panel--info'
    ) +
    buildDlPanel(
      buildTracingBoard(JIPLAK_ID, LAB.asal, calonTerurut(), State.jiplak, {
        langkah: LAB.langkah,
        namaAsal: LAB.asal.nama + ' (asal)',
      })
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(LAB.tabelJudul) +
        '</h3>' +
        buildTabelJiplak() +
        (selesaiA
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox('success', '💡', esc(LAB.temuanA)) +
            '</div>'
          : '')
    ) +
    (selesaiA
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(LAB.judulB) +
            '</h3><p style="margin:0;">' +
            esc(LAB.instruksiB) +
            '</p>',
          'panel--info'
        ) +
        buildDlPanel(
          '<div class="kg-ukur-grid">' +
            LAB.ukur
              .map(function (b, i) {
                return buildMeasureBoard('ukur-' + b.id, b, State.ukur[b.id], {
                  judul: b.nama,
                  warna: i === 0 ? 'a' : 'b',
                  skala: 20,
                });
              })
              .join('') +
            '</div>' +
            (selesaiB
              ? '<div style="margin-top:var(--space-3);">' +
                buildFeedbackBox('success', '📝', esc(LAB.temuanB)) +
                '</div>'
              : '')
        )
      : '') +
    (selesaiB ? buildDlNextButton('koleksiNextBtn', LAB.nextLabel) : '') +
    '</section>';

  var rerender = function () {
    saveState();
    renderKoleksi(container);
  };
  bindTracingBoard(
    container,
    JIPLAK_ID,
    LAB.asal,
    calonTerurut(),
    State.jiplak,
    { langkah: LAB.langkah },
    function () {
      var t = State.jiplak.target;
      if (State.jiplak.dijiplak && t && t !== 'asal') State.dicoba[t] = true;
      rerender();
    }
  );
  LAB.ukur.forEach(function (b) {
    bindMeasureBoard(container, 'ukur-' + b.id, State.ukur[b.id], rerender);
  });
  bindNext('koleksiNextBtn', 'koleksi', 'olahBersesuaian');
}

/* ============================================================
   8. STAGE: OLAH DATA — PASANGAN BERSESUAIAN  (sintaks 4a)
   Langkah titik → sisi → sudut → notasi muncul berurutan; opsi,
   kunci & umpan balik dari engine seksi 85.
   ============================================================ */

function langkahBenar(l) {
  return State.langkahJawab[l.id].chosen === kunciLangkah(l);
}

function langkahTerlihat() {
  var list = DATA.olahBersesuaian.langkah;
  var out = [];
  for (var i = 0; i < list.length; i++) {
    out.push(list[i]);
    if (!langkahBenar(list[i])) break;
  }
  return out;
}

function judulLangkah(l) {
  var tpl = DATA.olahBersesuaian.judulLangkah[l.jenis];
  var x = '';
  if (l.jenis === 'sisi') x = namaSisi(l.p.titik, l.i);
  else if (l.jenis !== 'notasi') x = l.p.titik[l.i];
  return tpl
    .replace('{x}', x)
    .replace('{p}', l.p.titik.join(''))
    .replace('{q}', l.q.titik.join(''));
}

function umpanLangkah(l, chosen) {
  if (l.jenis === 'notasi') return pesanNotasi(chosen);
  var map = mapOf(l.p, l.q);
  var kode = diagnosaBersesuaian(l.p, l.q, map, l.jenis, l.i, chosen);
  return pesanBersesuaian(kode, l.jenis, labelOpsi(opsiLangkah(l), kunciLangkah(l)));
}

/* Gambar langkah: sebelum benar hanya unsur yang ditanya disorot; sesudahnya pasangannya juga. */
function gambarLangkah(l) {
  if (l.jenis !== 'sisi' && l.jenis !== 'sudut') return '';
  if (langkahBenar(l)) {
    return buildSorotBersesuaian(l.p, l.q, mapOf(l.p, l.q), l.jenis, l.i, {
      skala: SKALA_KECIL,
    });
  }
  return gambarPasangan(l.p, l.q, { p: { sorot: (l.jenis === 'sisi' ? 's' : 'a') + l.i } });
}

function buildLangkah(l, idx, qSebelumnya) {
  var D = DATA.olahBersesuaian;
  var st = State.langkahJawab[l.id];
  var awal =
    qSebelumnya && qSebelumnya !== l.q
      ? buildFeedbackBox('info', '🔁', esc(D.pengantarBalik)) + gambarPasangan(l.p, l.q)
      : '';
  return (
    awal +
    '<div class="quiz-item quiz-item--guided">' +
    '<p class="exercise-label"><span class="dl-step__num">' +
    (idx + 1) +
    '</span>' +
    esc(judulLangkah(l)) +
    '</p>' +
    gambarLangkah(l) +
    buildPilihTerkunci(
      opsiLangkah(l),
      State.langkahOrders[l.id],
      st,
      kunciLangkah(l),
      'data-langkah-opt',
      l.id,
      st.chosen ? umpanLangkah(l, st.chosen) : ''
    ) +
    '</div>'
  );
}

function renderOlahBersesuaian(container) {
  var D = DATA.olahBersesuaian;
  var terlihat = langkahTerlihat();
  var langkahSelesai = D.langkah.every(langkahBenar);
  var quizBenar = langkahSelesai && guidedQuizAllCorrect(D.pertanyaan, State.olahPilih);

  container.innerHTML =
    '<section aria-label="Olah Data Pasangan Bersesuaian">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin-top:0;">' +
        esc(D.instruksi) +
        '</p>' +
        buildShapePair(LAB.asal, D.langkah[0].q, { skala: 20 })
    ) +
    buildDlPanel(
      terlihat
        .map(function (l, i) {
          return buildLangkah(l, i, i > 0 ? terlihat[i - 1].q : null);
        })
        .join('')
    ) +
    (langkahSelesai
      ? buildDlPanel(
          buildGuidedQuizList(
            guidedVisible(D.pertanyaan, State.olahPilih),
            State.olahOrders,
            State.olahPilih
          )
        )
      : '') +
    (quizBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Yang kamu temukan</h3>' + buildIstilahGrid(D.temuan),
          'panel--hero'
        ) + buildDlNextButton('olahBersesuaianNextBtn', D.nextLabel)
      : '') +
    '</section>';

  var rerender = function () {
    var kunci = kunciFokus();
    renderOlahBersesuaian(container);
    pulihkanFokus(kunci);
  };

  container.querySelectorAll('[data-langkah-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var l = D.langkah.filter(function (x) {
        return x.id === btn.dataset.group;
      })[0];
      if (!l || !catatPilih(State.langkahJawab[l.id], btn.dataset.langkahOpt, kunciLangkah(l))) {
        return;
      }
      saveState();
      rerender();
    });
  });
  bindGuidedQuizList(container, D.pertanyaan, State.olahPilih, saveState, rerender);
  bindNext('olahBersesuaianNextBtn', 'olahBersesuaian', 'olahJenis');
}

/* ============================================================
   9. STAGE: OLAH DATA — KONGRUEN ATAU SEBANGUN?  (sintaks 4b)
   Tabel bersesuaian → pertanyaan penuntun → temuan → pemilahan.
   ============================================================ */

function renderOlahJenis(container) {
  var D = DATA.olahJenis;
  var quizBenar = guidedQuizAllCorrect(D.pertanyaan, State.olahPilih);
  var semuaPilah = quizBenar && sortItemsAllAnswered(D.pilah, State.pilahStates);
  var rerender = function () {
    renderOlahJenis(container);
  };

  container.innerHTML =
    '<section aria-label="Olah Data Kongruen atau Sebangun">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    D.tabel
      .map(function (t) {
        return buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(t.judul) +
            '</h3>' +
            gambarPasangan(t.p, t.q) +
            buildCompareTable(t.p, t.q, t.map || mapOf(t.p, t.q), { rasio: true })
        );
      })
      .join('') +
    buildDlPanel(
      buildGuidedQuizList(
        guidedVisible(D.pertanyaan, State.olahPilih),
        State.olahOrders,
        State.olahPilih
      )
    ) +
    (quizBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Yang kamu temukan</h3>' + buildIstilahGrid(D.temuan),
          'panel--hero'
        ) +
        buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.pilahJudul) +
            '</h3><p>' +
            esc(D.pilahInstruksi) +
            '</p>' +
            buildSortItems(D.pilah, State.pilahOrder, OPSI_KLASIFIKASI, State.pilahStates, {
              visual: function (it) {
                return gambarPasangan(it.p, it.q, { skala: 14 });
              },
            })
        )
      : '') +
    (semuaPilah ? buildDlNextButton('olahJenisNextBtn', D.nextLabel) : '') +
    '</section>';

  bindGuidedQuizList(container, D.pertanyaan, State.olahPilih, saveState, rerender);
  bindSortItems(container, D.pilah, State.pilahStates, saveState, rerender);
  bindNext('olahJenisNextBtn', 'olahJenis', 'verifikasi');
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   A: pasangan benda baru acak. B: dugaan awal. C: benar/salah.
   ============================================================ */

function tanyaBenar(b, t) {
  return State.verifJawab[t.key].chosen === kunciTanyaVerif(b, t);
}

function pasanganSelesai(b) {
  return tanyaVerif(b).every(function (t) {
    return tanyaBenar(b, t);
  });
}

function umpanTanyaVerif(b, t, chosen) {
  if (t.jenis === 'jenis') {
    return pesanKlasifikasi(diagnosaKlasifikasi(b.p, b.q, chosen), ringkasKlasifikasi(b.p, b.q));
  }
  var map = mapOf(b.p, b.q);
  return pesanBersesuaian(
    diagnosaBersesuaian(b.p, b.q, map, t.jenis, t.i, chosen),
    t.jenis,
    labelOpsi(opsiTanyaVerif(b, t), kunciTanyaVerif(b, t))
  );
}

function teksTanyaVerif(b, t) {
  if (t.jenis === 'jenis') return 'Termasuk jenis apa pasangan ini?';
  if (t.jenis === 'sisi') return 'Sisi ' + namaSisi(b.p.titik, t.i) + ' bersesuaian dengan sisi …';
  return 'Sudut ' + b.p.titik[t.i] + ' bersesuaian dengan sudut …';
}

function buildPasanganVerif(b, nomor) {
  var list = tanyaVerif(b);
  var html = '';
  for (var i = 0; i < list.length; i++) {
    var t = list[i];
    var st = State.verifJawab[t.key];
    html +=
      '<div class="quiz-item">' +
      '<p class="exercise-label">' +
      esc(teksTanyaVerif(b, t)) +
      '</p>' +
      (t.jenis !== 'jenis' && tanyaBenar(b, t)
        ? buildSorotBersesuaian(b.p, b.q, mapOf(b.p, b.q), t.jenis, t.i, { skala: SKALA_KECIL })
        : '') +
      buildPilihTerkunci(
        opsiTanyaVerif(b, t),
        State.verifOrders[t.key],
        st,
        kunciTanyaVerif(b, t),
        'data-vb-opt',
        t.key,
        st.chosen ? umpanTanyaVerif(b, t, st.chosen) : ''
      ) +
      '</div>';
    if (!tanyaBenar(b, t)) break;
  }
  return (
    '<div class="kg-pasangan">' +
    '<p class="kg-pasangan__nama"><span class="dl-step__num">' +
    nomor +
    '</span><span aria-hidden="true">' +
    b.ikon +
    '</span> ' +
    esc(b.nama) +
    '</p>' +
    '<p class="kg-cerita">' +
    esc(b.cerita) +
    '</p>' +
    gambarPasangan(b.p, b.q) +
    html +
    '</div>'
  );
}

function buildDugaanBanding() {
  return (
    '<div class="dugaan-compare">' +
    DATA.stimulasi.dugaan
      .map(function (q) {
        var pilih = State.dugaanPilih[q.id];
        var cocok = pilih === q.baku;
        return (
          '<div class="dugaan-row' +
          (cocok ? ' dugaan-row--ok' : '') +
          '">' +
          '<span class="dugaan-row__title">' +
          esc(q.tanya) +
          '</span>' +
          '<span>Dugaanmu: <strong>' +
          esc(findOptionLabel(q.opsi, pilih) || '—') +
          '</strong></span>' +
          '<span>Hasil penemuan: <strong>' +
          esc(findOptionLabel(q.opsi, q.baku)) +
          '</strong></span>' +
          '<span>' +
          esc(q.temuan) +
          '</span>' +
          '<span class="dugaan-row__verdict">' +
          (cocok ? '✓ Dugaanmu terbukti!' : '↻ Dugaanmu terkoreksi oleh data') +
          '</span>' +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var selesaiA = VERIF_PASANGAN.every(pasanganSelesai);
  var semuaPilah = sortItemsAllAnswered(D.pernyataan, State.pernyataanStates);

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
        VERIF_PASANGAN.map(function (b, i) {
          return buildPasanganVerif(b, i + 1);
        }).join('') +
        (selesaiA ? buildFeedbackBox('success', '💡', esc(D.kesimpulan)) : '')
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
            buildSortItems(
              D.pernyataan,
              State.pernyataanOrder,
              D.opsiPernyataan,
              State.pernyataanStates
            )
        )
      : '') +
    (selesaiA && semuaPilah ? buildDlNextButton('verifNextBtn', D.nextLabel) : '') +
    '</section>';

  var rerender = function () {
    var kunci = kunciFokus();
    renderVerifikasi(container);
    pulihkanFokus(kunci);
  };

  container.querySelectorAll('[data-vb-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.dataset.group;
      var b = VERIF_PASANGAN.filter(function (x) {
        return key.indexOf(x.id + '-') === 0;
      })[0];
      var t =
        b &&
        tanyaVerif(b).filter(function (x) {
          return x.key === key;
        })[0];
      if (!t || !catatPilih(State.verifJawab[key], btn.dataset.vbOpt, kunciTanyaVerif(b, t))) {
        return;
      }
      saveState();
      rerender();
    });
  });
  bindSortItems(container, D.pernyataan, State.pernyataanStates, saveState, rerender);
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali tabel bersesuaian dan hasil pemilahanmu, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  var putar = DATA.olahBersesuaian.langkah[0].q;
  var besar = LAB.ukur[1];

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
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah pengertian dan syarat yang kamu temukan dan buktikan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman</h3>' +
            '<div class="kg-rangkum-grid">' +
            '<figure class="kg-rangkum"><figcaption>' +
            esc(notasiBersesuaian(LAB.asal, putar, mapOf(LAB.asal, putar), '≅')) +
            ' (kongruen)</figcaption>' +
            gambarPasangan(LAB.asal, putar, { skala: 12 }) +
            '</figure>' +
            '<figure class="kg-rangkum"><figcaption>' +
            esc(notasiBersesuaian(LAB.asal, besar, mapOf(LAB.asal, besar), '∼')) +
            ' (sebangun, k = ' +
            esc(formatDesimal(korespondensiBangun(LAB.asal, besar).skala, 2)) +
            ')</figcaption>' +
            gambarPasangan(LAB.asal, besar, { skala: 12 }) +
            '</figure>' +
            '</div>' +
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
   12. STAGE: UJI TERAP
   'sisi' & 'sudut' : opsi, kunci & umpan dari engine (seksi 85).
   'jenis'          : kunci klasifikasiBangun, umpan pesanKlasifikasi.
   'pilih'          : opsi, correct & umpan dari data.
   'isi'            : isian bilangan; kunci & umpan dari engine.
   Setelah selesai, pembahasan ditampilkan.
   ============================================================ */

function soalSelesai(s, ex) {
  if (s.tipe === 'isi') return ex.tepat || ex.revealed;
  return ex.chosen === kunciSoal(s);
}

function soalBenarLangsung(s, ex) {
  if (s.tipe === 'isi') return ex.tepat && ex.attempts === 1;
  return soalSelesai(s, ex) && ex.pilihSalah === 0;
}

function semuaSoalSelesai() {
  return TERAP_SOAL.every(function (s, i) {
    return soalSelesai(s, State.terapkanSoal[i]);
  });
}

function buildPembahasan(s) {
  return (
    '<div class="kg-bahas">' +
    '<p class="kg-bahas__judul">Pembahasan</p>' +
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

function umpanPilihan(s, ex) {
  if (s.tipe === 'pilih') return esc(s.umpan[ex.chosen]);
  if (s.tipe === 'jenis') {
    return esc(
      pesanKlasifikasi(diagnosaKlasifikasi(s.p, s.q, ex.chosen), ringkasKlasifikasi(s.p, s.q))
    );
  }
  var map = mapOf(s.p, s.q);
  return esc(
    pesanBersesuaian(
      diagnosaBersesuaian(s.p, s.q, map, s.tipe, s.i, ex.chosen),
      s.tipe,
      labelOpsi(opsiSoal(s), kunciSoal(s))
    )
  );
}

function gambarSoal(s, benar) {
  if (s.tipe === 'jenis') return gambarPasangan(s.p, s.q);
  if (s.tipe !== 'sisi' && s.tipe !== 'sudut') return '';
  if (benar) {
    return buildSorotBersesuaian(s.p, s.q, mapOf(s.p, s.q), s.tipe, s.i, { skala: SKALA_KECIL });
  }
  return gambarPasangan(s.p, s.q, { p: { sorot: (s.tipe === 'sisi' ? 's' : 'a') + s.i } });
}

function buildSoalPilih(s, ex) {
  var benar = soalSelesai(s, ex);
  var umpan = '';
  if (ex.chosen && benar) {
    umpan = buildFeedbackBox('success', '✓', umpanPilihan(s, ex)) + buildPembahasan(s);
  } else if (ex.chosen) {
    umpan = buildFeedbackBox('error', '✗', '<strong>Belum tepat.</strong> ' + umpanPilihan(s, ex));
  }
  var opsi = opsiSoal(s).map(function (o) {
    return { id: o.id, label: esc(o.label) };
  });
  return (
    gambarSoal(s, benar) +
    '<p class="exercise-label">' +
    esc(s.tanya) +
    '</p>' +
    buildChoiceGroup(opsi, ex.optionOrder, {
      chosen: ex.chosen,
      correctId: benar ? kunciSoal(s) : null,
      grade: true,
      locked: benar,
    }) +
    (ex.chosen ? '<div style="margin-top:var(--space-3);">' + umpan + '</div>' : '') +
    (benar ? '' : buildHintSoal(s, ex))
  );
}

function buildSoalIsi(s, ex) {
  var selesai = soalSelesai(s, ex);
  var kunci = formatDesimal(nilaiSoalSebangun(s.cek), 2);
  var hasil = '';
  if (selesai) {
    hasil =
      buildFeedbackBox(
        ex.revealed ? 'info' : 'success',
        ex.revealed ? '👁' : '✓',
        ex.revealed
          ? 'Jawaban yang tepat: ' + esc(kunci) + ' ' + esc(s.satuan) + '.'
          : '<strong>Tepat!</strong>'
      ) + buildPembahasan(s);
  } else if (ex.salah) {
    hasil = buildFeedbackBox(
      'error',
      '✗',
      '<strong>Belum tepat.</strong> ' + esc(pesanSoalSebangun(s.cek, ex.salah))
    );
  }
  return (
    '<p class="exercise-label"><label for="soalIsiInput">' +
    esc(s.tanya) +
    '</label></p>' +
    '<div class="dl-input-row">' +
    buildDlNumInput('soalIsiInput', selesai ? kunci : ex.input, {
      aria: s.tanya,
      desimal: true,
      disabled: selesai,
      error: !!ex.salah && !selesai,
    }) +
    '<span class="kg-satuan">' +
    esc(s.satuan) +
    '</span>' +
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
  var s = TERAP_SOAL[idx];
  var ex = State.terapkanSoal[idx];
  var selesaiIni = soalSelesai(s, ex);
  var semua = semuaSoalSelesai();
  var kt = DATA.konteks[s.konteks];

  var titik = TERAP_SOAL.map(function (x, i) {
    var st = State.terapkanSoal[i];
    var cls = 'kg-dot';
    if (soalSelesai(x, st)) cls += ' kg-dot--done';
    if (i === idx) cls += ' kg-dot--aktif';
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
  }).join('');

  container.innerHTML =
    '<section aria-label="Uji Terap">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    '<nav class="kg-dots" aria-label="Pilih soal">' +
    titik +
    '</nav>' +
    buildDlPanel(
      '<p class="kg-kasus">Soal ' +
        (idx + 1) +
        ' dari ' +
        TERAP_SOAL.length +
        ' · <span aria-hidden="true">' +
        kt.ikon +
        '</span> ' +
        esc(kt.nama) +
        '</p>' +
        '<p class="kg-cerita">' +
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
        (idx === TERAP_SOAL.length - 1 || !selesaiIni ? ' disabled' : '') +
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
      var v = readDlNumber(ex.input, true);
      if (v === null) return;
      ex.attempts += 1;
      var kode = diagnosaSoalSebangun(s.cek, v);
      ex.tepat = kode === 'benar';
      ex.salah = ex.tepat ? null : kode;
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
      State.terapkanIdx = Math.min(TERAP_SOAL.length - 1, idx + 1);
      saveState();
      rerender();
    });
  }
  bindNext('terapkanNextBtn', 'terapkan', 'refleksi');
}

/* ============================================================
   13. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var langkah = DATA.olahBersesuaian.langkah;
  var langkahLangsung = langkah.filter(function (l) {
    return langkahBenar(l) && State.langkahJawab[l.id].pilihSalah === 0;
  }).length;
  var pilah = DATA.olahJenis.pilah;
  var pilahBenar = sortItemsCorrectCount(pilah, State.pilahStates);
  var benarTerap = TERAP_SOAL.filter(function (s, i) {
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
        kartu(langkahLangsung + '/' + langkah.length, 'Pasangan bersesuaian benar sekali pilih') +
        kartu(pilahBenar + '/' + pilah.length, 'Pasangan benda dipilah benar') +
        kartu(benarTerap + '/' + TERAP_SOAL.length, 'Uji terap benar pada percobaan pertama') +
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
    buildIstilahGrid(DATA.olahBersesuaian.temuan.concat(DATA.olahJenis.temuan)) +
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
    'Kemampuan murid menunjukkan pasangan sisi dan sudut bersesuaian pada benda nyata di kelas serta menjelaskan alasan kongruen atau sebangun tetap menjadi bahan penilaian utama dan jembatan menuju syarat kekongruenan segitiga dan perhitungan kesebangunan.' +
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
  olahBersesuaian: renderOlahBersesuaian,
  olahJenis: renderOlahJenis,
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
}

document.addEventListener('DOMContentLoaded', init);
